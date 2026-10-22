const TOTAL = 22;
const state = { current: 1, slides: [] };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function hashNumber() { const match = location.hash.match(/^#slide-(\d{2})$/); const n = match ? Number(match[1]) : NaN; return n >= 1 && n <= TOTAL ? n : null; }
function hrefFor(n) { return `#slide-${String(n).padStart(2, '0')}`; }
function go(n, replace = false, focus = false) {
  const next = Math.max(1, Math.min(TOTAL, n));
  if (replace) history.replaceState({}, '', hrefFor(next)); else if (location.hash !== hrefFor(next)) history.pushState({}, '', hrefFor(next));
  render(next, focus);
}
function textBlocks(slide) {
  return slide.visibleText.map((text, i) => `<p class="${i === 0 ? 'lead' : ''}" data-visible-index="${i}">${escapeHtml(text)}</p>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function modelMarkup(slide) {
  const model = slide.accessibleModel || { nodes: [], relations: [] };
  if (!model.nodes.length) return '';
  const relationByFrom = new Map((model.relations || []).map(r => [r.from, r]));
  const nodes = model.nodes.map(node => `<li data-node-id="${escapeHtml(node.id)}" ${relationByFrom.has(node.id) ? `data-relation-id="${escapeHtml(relationByFrom.get(node.id).from)}-${escapeHtml(relationByFrom.get(node.id).to)}"` : ''}><strong>${escapeHtml(node.label)}</strong><span class="node-equivalent">Paso accesible: ${escapeHtml(node.label)}</span></li>`).join('');
  const relations = (model.relations || []).map(r => `<span class="relation-equivalent" data-relation-id="${escapeHtml(r.from)}-${escapeHtml(r.to)}">De ${escapeHtml(r.from)} a ${escapeHtml(r.to)} (${escapeHtml(r.kind)})</span>`).join('');
  return `<div class="diagram-scroll" role="region" tabindex="0" aria-label="Modelo accesible de ${escapeHtml(slide.title)}"><ol class="workflow" aria-label="Pasos de ${escapeHtml(slide.title)}">${nodes}</ol><div class="relations" aria-label="Relaciones del diagrama">${relations}</div></div>`;
}
function assetMarkup(slide) {
  const seen = new Set();
  return slide.assets.filter(asset => { const key = `${asset.type}:${asset.src}`; if (seen.has(key)) return false; seen.add(key); return true; }).map(asset => {
    if (asset.type === 'video') return `<div class="media"><video controls preload="metadata" playsinline poster="${asset.poster || ''}" src="${asset.src}" aria-label="Vídeo local de ${escapeHtml(slide.title)}"></video><p class="media-fallback" hidden>Vídeo no disponible localmente. El poster permanece disponible.</p><p class="caption">Transcripción disponible en el texto de esta slide y en el contexto del presentador cuando aplica.</p></div>`;
    return `<img class="visual" src="${asset.src}" alt="Recurso visual de ${escapeHtml(slide.title)}; el contenido textual equivalente está disponible en esta slide" data-asset-src="${asset.src}"><div class="asset-fallback" hidden>Recurso visual no disponible localmente; se muestra el equivalente textual.</div>`;
  }).join('');
}
function notesMarkup(slide) {
  if (!slide.notesContext?.available) return '';
  const items = (slide.notesContext.text || []).map(text => `<li>${escapeHtml(text)}</li>`).join('');
  return `<details class="notes"><summary>${escapeHtml(slide.notesContext.label)}</summary><ul>${items}</ul></details>`;
}
function renderSlide(slide) {
  const article = $(`#${slide.id}`); article.className = 'slide'; article.setAttribute('aria-labelledby', `title-${slide.id.slice(-2)}`);
  const body = textBlocks(slide);
  const media = assetMarkup(slide);
  article.innerHTML = `<div class="eyebrow">Slide ${String(slide.index).padStart(2,'0')} · Loop Engineering</div><h1 id="title-${slide.id.slice(-2)}">${escapeHtml(slide.title)}</h1><div class="content-grid"><div class="copy">${body}${modelMarkup(slide)}${notesMarkup(slide)}</div><div class="visual-column">${media}</div></div>`;
  $$('.visual', article).forEach(image => image.addEventListener('error', () => { image.classList.add('failed'); image.nextElementSibling.hidden = false; }));
  $$('video', article).forEach(video => video.addEventListener('error', () => { const fallback = video.nextElementSibling; if (fallback) fallback.hidden = false; }));
}
function render(n, focus = false) {
  state.current = n; state.slides.forEach(slide => slide.element.classList.toggle('active', slide.data.index === n));
  const data = state.slides[n - 1].data; document.title = `${data.title} · Kiro CLI`;
  $('#counter').textContent = `${String(n).padStart(2,'0')} / ${TOTAL}`; $('#progress').style.width = `${n / TOTAL * 100}%`; $('#progress').setAttribute('aria-valuenow', n);
  $('#prev').disabled = n === 1; $('#next').disabled = n === TOTAL;
  $$('#slide-index button').forEach(button => button.setAttribute('aria-current', button.dataset.slide == n ? 'true' : 'false'));
  if (focus) state.slides[n - 1].element.focus();
}
function buildIndex() { $('#slide-index').innerHTML = state.slides.map(({data}) => `<button type="button" data-slide="${data.index}" aria-label="Ir al slide ${data.index}">${String(data.index).padStart(2,'0')}</button>`).join(''); $$('#slide-index button').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.slide), false, true))); }
function keydown(event) { if (['INPUT','TEXTAREA','SELECT','BUTTON','VIDEO'].includes(document.activeElement.tagName)) return; const map = {ArrowRight:1,PageDown:1,ArrowLeft:-1,PageUp:-1,Home:-21,End:21}; if (map[event.key] !== undefined) { event.preventDefault(); go(map[event.key] > 20 ? TOTAL : map[event.key] < -20 ? 1 : state.current + map[event.key], false, true); } }
async function init() {
  const response = await fetch('assets/manifest.json'); if (!response.ok) throw new Error('No se pudo cargar el manifiesto'); const manifest = await response.json();
  state.slides = manifest.slides.map(data => ({ data, element: $(`#${data.id}`) })); state.slides.forEach(({data}) => renderSlide(data)); buildIndex();
  $('#prev').addEventListener('click', () => go(state.current - 1, false, true)); $('#next').addEventListener('click', () => go(state.current + 1, false, true));
  const initial = hashNumber(); go(initial || 1, !initial, false); window.addEventListener('popstate', () => go(hashNumber() || 1, false, true)); window.addEventListener('hashchange', () => { const n = hashNumber(); if (n) render(n, true); }); document.addEventListener('keydown', keydown);
}
init().catch(error => { document.body.insertAdjacentHTML('beforeend', `<p class="asset-fallback">Error cargando la presentación: ${escapeHtml(error.message)}</p>`); });
