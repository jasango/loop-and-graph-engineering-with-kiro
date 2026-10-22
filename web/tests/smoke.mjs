import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => value.startsWith('--') ? [...pairs, [value.slice(2), values[index + 1]]] : pairs, []));
const base = args.base || 'http://127.0.0.1:4173';
const out = path.resolve(args.out || 'artifacts/smoke');
fs.mkdirSync(out, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.resolve('assets/manifest.json'), 'utf8'));
const failures = []; const events = []; const checks = [];
const fail = message => failures.push(message);
if (manifest.slides.length !== 22) fail(`manifest has ${manifest.slides.length} slides`);
for (const slide of manifest.slides) for (const asset of slide.assets) if (asset.required && !fs.existsSync(path.resolve(asset.src))) fail(`${slide.id} missing ${asset.src}`);
const browser = await chromium.launch({ headless: true });
async function inspect(viewport, prefix) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = []; const requestFailures = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('requestfailed', request => { if (!request.url().endsWith('.mp4')) requestFailures.push(request.url()); });
  await page.goto(`${base}/#slide-01`, { waitUntil: 'networkidle' });
  for (const slide of manifest.slides) {
    await page.goto(`${base}/#${slide.id}`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(expected => {
      const article = document.getElementById(expected.id); const model = expected.accessibleModel || {};
      const requiredAssets = expected.assets.filter(asset => asset.required);
      const loaded = [...article.querySelectorAll('img')].every(image => image.complete && image.naturalWidth > 0);
      const videos = [...article.querySelectorAll('video')].map(video => ({ poster: !!video.poster, ready: video.readyState > 0 }));
      const nodes = (model.nodes || []).every(node => article.querySelector(`[data-node-id="${CSS.escape(node.id)}"]`));
      const relations = (model.relations || []).every(relation => article.querySelector(`[data-relation-id="${CSS.escape(relation.from)}-${CSS.escape(relation.to)}"]`));
      const last = article.lastElementChild?.getBoundingClientRect(); const articleRect = article.getBoundingClientRect();
      return { active: article.classList.contains('active'), title: article.querySelector('h1')?.textContent === expected.title, text: expected.visibleText.every(text => article.textContent.includes(text)), assets: requiredAssets.length === 0 || loaded || videos.every(video => video.poster), nodes, relations, overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth, reachable: !!last && last.bottom >= articleRect.top, videos };
    }, slide);
    if (!result.active || !result.title || !result.text || !result.assets || !result.nodes || !result.relations || !result.overflow || !result.reachable) fail(`${prefix}/${slide.id} assertion ${JSON.stringify(result)}`);
    await page.screenshot({ path: path.join(out, `${prefix}-${slide.index.toString().padStart(2, '0')}.png`), fullPage: true });
  }
  checks.push({ viewport, consoleErrors, requestFailures });
  consoleErrors.forEach(error => fail(`${prefix} console: ${error}`)); requestFailures.forEach(url => fail(`${prefix} request failed: ${url}`));
  await page.close();
}
await inspect({ width: 1440, height: 900 }, 'desktop');
await inspect({ width: 768, height: 900 }, 'mobile');
await inspect({ width: 320, height: 568 }, 'narrow');
await browser.close();
const report = { generatedAt: new Date().toISOString(), base, slideCount: manifest.slides.length, checks, failures, referenceRendering: 'not-run: soffice/libreoffice unavailable during exploration; use scripts/render-reference.sh', manualChecklist: { keyboardHistoryHash: 'not-run', voiceOver: 'not-run', zoom200: 'not-run', contrast: 'not-run', captionsTranscripts: 'local transcript guidance present; manual playback not-run', pptxComparison: 'not-run' }, status: failures.length ? 'failed' : 'passed' };
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: report.status, failures: failures.length, captures: 66 }, null, 2));
if (failures.length) process.exitCode = 1;
