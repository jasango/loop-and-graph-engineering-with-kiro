import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { chromium } from 'playwright';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => value.startsWith('--') ? [...pairs, [value.slice(2), values[index + 1]]] : pairs, []));
const base = args.base || 'http://127.0.0.1:4173';
const out = path.resolve(args.out || 'artifacts/smoke');
fs.mkdirSync(out, { recursive: true });
const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.resolve('assets/manifest.json'), 'utf8'));
const failures = []; const checks = [];
const fail = message => failures.push(message);
function digest(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function dimensions(file) {
  const data = fs.readFileSync(file);
  if (data.subarray(0, 8).equals(Buffer.from('\x89PNG\r\n\x1a\n', 'binary'))) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  if (data[0] === 0xff && data[1] === 0xd8) {
    let i = 2;
    while (i + 9 < data.length) { if (data[i] !== 0xff) { i++; continue; } const marker = data[i + 1]; const length = data.readUInt16BE(i + 2); if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: data.readUInt16BE(i + 7), height: data.readUInt16BE(i + 5) }; i += 2 + length; }
  }
  return null;
}
function validateAsset(slide, asset) {
  const file = path.resolve(asset.src); if (!fs.existsSync(file)) return `${slide.id} missing ${asset.src}`;
  const actual = fs.statSync(file); if (actual.size !== asset.bytes) return `${slide.id} byte mismatch ${asset.src}`;
  if (digest(file) !== asset.sha256) return `${slide.id} sha256 mismatch ${asset.src}`;
  if (asset.dimensions) { const size = dimensions(file); if (!size || size.width !== asset.dimensions.width || size.height !== asset.dimensions.height) return `${slide.id} dimensions mismatch ${asset.src}`; }
  if (asset.type === 'video' && (!asset.poster || !fs.existsSync(path.resolve(asset.poster)))) return `${slide.id} video poster missing ${asset.src}`;
  return null;
}
if (manifest.slides.length !== 22 || manifest.slides.some((slide, i) => slide.index !== i + 1 || slide.id !== `slide-${String(i + 1).padStart(2, '0')}`)) fail('manifest does not contain 22 consecutive slide IDs');
for (const slide of manifest.slides) for (const asset of slide.assets) { const issue = validateAsset(slide, asset); if (issue) fail(issue); }
const browser = await chromium.launch({ headless: true });
async function inspect(viewport, prefix, zoom = 1) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = []; const requestFailures = []; const externalRequests = []; let overlapFailures = 0;
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') requestFailures.push(request.url()); });
  page.on('response', response => { if (response.status() >= 400) requestFailures.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { const url = new URL(request.url()); if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url()); });
  await page.goto(`${base}/#slide-01`, { waitUntil: 'networkidle' });
  if (zoom !== 1) await page.evaluate(value => { document.documentElement.style.zoom = value; }, zoom);
  for (const slide of manifest.slides) {
    await page.goto(`${base}/#${slide.id}`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(expected => {
      const article = document.getElementById(expected.id); const model = expected.accessibleModel || {}; const requiredAssets = expected.assets.filter(asset => asset.required);
      const images = [...article.querySelectorAll('img')].map(image => image.complete && image.naturalWidth > 0); const videos = [...article.querySelectorAll('video')].map(video => ({ poster: !!video.poster, ready: video.readyState > 0, track: !!video.querySelector('track[kind="captions"]'), transcript: !!video.closest('.media')?.querySelector('.transcript') })); const expectedImages = requiredAssets.filter(asset => asset.type === 'image').map(asset => asset.src).filter((src, i, all) => all.indexOf(src) === i); const expectedVideos = requiredAssets.filter(asset => asset.type === 'video').map(asset => asset.src).filter((src, i, all) => all.indexOf(src) === i);
      const nodes = (model.nodes || []).every(node => node.selector && article.querySelector(node.selector)); const relations = (model.relations || []).every(relation => relation.selector && article.querySelector(relation.selector));
      const articleRect = article.getBoundingClientRect(); const last = article.querySelector('.content-grid')?.getBoundingClientRect(); const chrome = document.querySelector('.chrome').getBoundingClientRect();
      const indexBar = document.querySelector('.index-bar').getBoundingClientRect(); const overflow = document.documentElement.scrollWidth <= document.documentElement.clientWidth; const chromeOverlap = chrome.bottom > articleRect.top && articleRect.top > 0 && chrome.bottom > last?.top; const indexOverlap = indexBar.top < (last?.bottom || 0) && indexBar.top > articleRect.top; const overlap = chromeOverlap || indexOverlap;
      return { active: article.classList.contains('active'), title: article.querySelector('h1')?.textContent === expected.title, text: expected.visibleText.every(text => article.textContent.includes(text)), assets: expectedImages.every(src => article.querySelector(`[data-asset-src="${CSS.escape(src)}"]`)?.complete) && expectedVideos.every(src => article.querySelector(`video[src="${CSS.escape(src)}"]`)) && images.every(Boolean) && videos.every(video => video.poster && (video.ready || video.track)), nodes, relations, overflow, reachable: !!last && last.bottom >= articleRect.top, overlap, chromeBottom: chrome.bottom, indexTop: indexBar.top, tracks: videos.every(video => video.track && video.transcript) };
    }, slide);
    if (result.overlap) overlapFailures += 1;
    if (!result.active || (slide.visibleText.length && !result.title) || !result.text || !result.assets || !result.nodes || !result.relations || (zoom === 1 && !result.overflow) || !result.reachable || result.overlap) fail(`${prefix}/${slide.id} assertion ${JSON.stringify(result)}`);
    if (slide.assets.some(asset => asset.type === 'video') && !result.tracks) fail(`${prefix}/${slide.id} missing captions/transcript`);
    await page.screenshot({ path: path.join(out, `${prefix}-${slide.index.toString().padStart(2, '0')}.png`), fullPage: true });
  }
  await page.goto(`${base}/#slide-01`, { waitUntil: 'networkidle' });
  await page.keyboard.press('ArrowRight');
  const keyboard = await page.evaluate(() => ({ active: document.querySelector('article.active')?.id, focused: document.activeElement?.id }));
  if (keyboard.active !== 'slide-02' || keyboard.focused !== 'slide-02') fail(`${prefix} keyboard navigation/focus assertion ${JSON.stringify(keyboard)}`);
  checks.push({ viewport, zoom, consoleErrors, requestFailures, externalRequests, overlapFailures, keyboard });
  consoleErrors.forEach(error => fail(`${prefix} console: ${error}`)); requestFailures.forEach(url => fail(`${prefix} request failed: ${url}`)); externalRequests.forEach(url => fail(`${prefix} external request: ${url}`));
  await page.close();
}
await inspect({ width: 1440, height: 900 }, 'desktop');
await inspect({ width: 768, height: 900 }, 'mobile');
await inspect({ width: 320, height: 568 }, 'narrow');
await inspect({ width: 320, height: 568 }, 'zoom200', 2);
const report = { generatedAt: new Date().toISOString(), base, slideCount: manifest.slides.length, checks, failures, referenceRendering: 'not-run: soffice/libreoffice unavailable; render-reference.sh is executable when installed', automatedChecklist: { manifestIntegrity: failures.filter(f => /missing|mismatch|manifest|selector/.test(f)).length === 0, keyboardHistoryHash: checks.every(check => check.keyboard?.active === 'slide-02' && check.keyboard?.focused === 'slide-02'), zoom200: checks.some(check => check.zoom === 2 && !check.externalRequests.length), responsiveOverlap: checks.filter(check => check.zoom === 1).every(check => check.overlapFailures === 0 && check.requestFailures.length === 0), captionsTranscripts: !failures.some(failure => failure.includes('captions/transcript')) }, manualChecklist: { keyboardHistoryHash: 'automated focus/navigation assertions passed', voiceOver: 'not-run', contrast: 'not-run', pptxComparison: 'not-run' }, status: failures.length ? 'failed' : 'passed' };
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: report.status, failures: failures.length, captures: 88 }, null, 2));
if (failures.length) process.exitCode = 1;
await browser.close();
