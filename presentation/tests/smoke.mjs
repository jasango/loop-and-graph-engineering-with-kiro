// Smoke test: 18 slides, imágenes y vídeos locales, sin errores de consola ni overflow horizontal.
import process from 'node:process';
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const failures = [];
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  page.on('console', m => { if (m.type() === 'error') failures.push(`${name}: console ${m.text()}`); });
  page.on('pageerror', e => failures.push(`${name}: ${e.message}`));
  page.on('requestfailed', r => failures.push(`${name}: request failed ${r.url()}`));
  await page.goto(`${base}/#slide-01`);
  const total = await page.locator('.slide').count();
  if (total !== 18) failures.push(`expected 18 slides, got ${total}`);
  for (let n = 1; n <= total; n++) {
    await page.goto(`${base}/#slide-${String(n).padStart(2, '0')}`);
    const s = page.locator('.slide.active');
    if (await s.count() !== 1) failures.push(`${name}: slide ${n} not active`);
    if (!(await s.locator('h1').innerText()).trim()) failures.push(`${name}: slide ${n} no h1`);
    const broken = await s.locator('img').evaluateAll(imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
    if (broken.length) failures.push(`${name}: slide ${n} broken images ${broken}`);
    const missingAlt = await s.locator('img:not([alt])').count();
    if (missingAlt) failures.push(`${name}: slide ${n} image without alt`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) failures.push(`${name}: slide ${n} horizontal overflow`);
  }
  await page.close();
}
await browser.close();
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('smoke OK: 18 slides, desktop + mobile');
