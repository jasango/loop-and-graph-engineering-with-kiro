// Navegación de la presentación: 18 slides estáticos en index.html.
const slides = [...document.querySelectorAll('.slide')];
const TOTAL = slides.length;
const $ = s => document.querySelector(s);
let current = 1;

const hrefFor = n => `#slide-${String(n).padStart(2, '0')}`;
function hashNumber() {
  const m = location.hash.match(/^#slide-(\d{2})$/);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= TOTAL ? n : null;
}
function render(n, focus) {
  current = n;
  slides.forEach((el, i) => el.classList.toggle('active', i + 1 === n));
  document.title = `${slides[n - 1].dataset.title} · Kiro CLI en acción`;
  $('#counter').textContent = `${String(n).padStart(2, '0')} / ${TOTAL}`;
  $('#progress').style.width = `${(n / TOTAL) * 100}%`;
  $('#progress').setAttribute('aria-valuenow', n);
  $('#prev').disabled = n === 1;
  $('#next').disabled = n === TOTAL;
  document.querySelectorAll('#slide-index button').forEach(b => b.setAttribute('aria-current', Number(b.dataset.slide) === n ? 'true' : 'false'));
  slides.forEach(el => el.querySelectorAll('video').forEach(v => { if (!el.classList.contains('active')) v.pause(); }));
  window.scrollTo({ top: 0 });
  if (focus) slides[n - 1].focus({ preventScroll: true });
}
function go(n, replace = false, focus = false) {
  const next = Math.max(1, Math.min(TOTAL, n));
  if (replace) history.replaceState({}, '', hrefFor(next));
  else if (location.hash !== hrefFor(next)) history.pushState({}, '', hrefFor(next));
  render(next, focus);
}
$('#slide-index').innerHTML = slides.map((el, i) => `<button type="button" data-slide="${i + 1}" aria-label="Slide ${i + 1}: ${el.dataset.title}" title="${el.dataset.title}">${String(i + 1).padStart(2, '0')}</button>`).join('');
document.querySelectorAll('#slide-index button').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.slide), false, true)));
$('#prev').addEventListener('click', () => go(current - 1, false, true));
$('#next').addEventListener('click', () => go(current + 1, false, true));
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'SUMMARY', 'A'].includes(document.activeElement.tagName)) return;
  const step = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 }[e.key];
  if (step) { e.preventDefault(); go(current + step, false, true); }
  else if (e.key === 'Home') { e.preventDefault(); go(1, false, true); }
  else if (e.key === 'End') { e.preventDefault(); go(TOTAL, false, true); }
});
window.addEventListener('popstate', () => render(hashNumber() || 1, true));
window.addEventListener('hashchange', () => { const n = hashNumber(); if (n && n !== current) render(n, true); });
const initial = hashNumber();
go(initial || 1, !initial, false);
