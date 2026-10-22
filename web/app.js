const TOTAL = 22;
const state = { current: 1, slides: [] };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function hashNumber() { const match = location.hash.match(/^#slide-(\d{2})$/); const n = match ? Number(match[1]) : NaN; return n >= 1 && n <= TOTAL ? n : null; }
function hrefFor(n) { return `#slide-${String(n).padStart(2, '0')}`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function go(n, replace = false, focus = false) {
  const next = Math.max(1, Math.min(TOTAL, n));
  if (replace) history.replaceState({}, '', hrefFor(next)); else if (location.hash !== hrefFor(next)) history.pushState({}, '', hrefFor(next));
  render(next, focus);
}
function textBlocks(slide) { return slide.visibleText.map((text, i) => `<p class="${i === 0 ? 'lead' : ''}" data-visible-index="${i}">${escapeHtml(text)}</p>`).join(''); }
const disciplineDescriptions = {
  'Prompt Engineering': 'Optimización de instrucciones a entregar al modelo',
  'Context Engineering': 'Optimización dinámica de la ventana de contexto',
  'Retrieval Engineering': 'Optimización de la recuperación para dar conocimiento al modelo',
  'Memory Engineering': 'Gestión de la info compartida entre ventanas de contexto',
  'Tool Engineering': 'Optimización del acceso a herramientas y sistema externos',
  'Skill Engineering': 'Optimización de capacidades especializadas y reutilizables',
  'Loop Engineering': 'Diseño de ciclos iterativos de ejecución, evaluación y corrección',
  'Graph Engineering': 'Diseño y orquestación de tareas que controlan y optimizan el flujo',
  'Guardrail Engineering': 'Incorporación de controles, permisos y límites de ejecución',
  'Harness Engineering': ''
};
const videoTranscripts = {
  9: 'Demostración del loop programático con Kiro CLI: un script ejecuta el agente, observa el resultado y repite el ciclo hasta completar la condición de salida.',
  11: 'Demostración del loop programático usando agentes Kiro CLI: el agente recibe el objetivo, ejecuta acciones y devuelve el resultado para la siguiente iteración.',
  18: 'Demostración final de automatización SDLC con Kiro Workflows: el workflow coordina las etapas de especificación, construcción, pruebas y despliegue.'
};
function modelMarkup(slide) {
  const model = slide.accessibleModel || { nodes: [], relations: [], branches: [] };
  if (!model.nodes.length) return '';
  const relationByFrom = new Map((model.relations || []).map(r => [r.from, r]));
  const isDiscipline = slide.index === 3 || slide.index === 4;
  const nodes = model.nodes.map((node, index) => {
    const relation = relationByFrom.get(node.id);
    const description = isDiscipline ? disciplineDescriptions[node.label] : '';
    return `<li data-node-id="${escapeHtml(node.id)}" class="node-card ${index === 0 ? 'node-start' : ''}"${relation ? ` data-relation-id="${escapeHtml(relation.from)}-${escapeHtml(relation.to)}"` : ''}><strong>${escapeHtml(node.label)}</strong>${description ? `<p>${escapeHtml(description)}</p>` : ''}<span class="node-equivalent">Paso ${index + 1}: ${escapeHtml(node.label)}</span></li>`;
  }).join('');
  const relations = (model.relations || []).map(r => `<span class="relation-equivalent" data-relation-id="${escapeHtml(r.from)}-${escapeHtml(r.to)}">De ${escapeHtml(r.from)} a ${escapeHtml(r.to)} (${escapeHtml(r.kind)})</span>`).join('');
  const branches = (model.branches || []).map(branch => `<p class="branch-label"><strong>Rama paralela:</strong> ${escapeHtml(branch.label || branch.join(' → '))}</p>`).join('');
  const kindLabel = slide.index === 13 ? 'Grafo accesible del flujo SDLC' : `Modelo accesible de ${slide.title}`;
  return `<div class="diagram-scroll" role="region" tabindex="0" aria-label="${escapeHtml(kindLabel)}"><ol class="workflow ${isDiscipline ? 'discipline-list' : ''}" aria-label="Pasos de ${escapeHtml(slide.title)}">${nodes}</ol>${branches}<div class="relations" aria-label="Relaciones del diagrama">${relations}</div></div>`;
}
function slideSpecificMarkup(slide) {
  if (slide.index === 12) return '<section class="panel workflow-explainer"><h2>Qué contiene un workflow</h2><p>Los workflows coordinan agentes, secuencias, loops y ramas paralelas para automatizar tareas del SDLC.</p><div class="fact-grid"><p><strong>Nodos</strong>Agentes que ejecutan una tarea.</p><p><strong>Superficies</strong>IDE, CLI y WEB.</p><p><strong>Recipes</strong>JSON/YAML en <code>.kiro/workflows</code>.</p><p><strong>Alcance</strong>Crew Workflows queda fuera de este flujo.</p></div></section>';
  if (slide.index === 13) return '<div class="workflow-legend" aria-label="Leyenda del grafo"><span>Camino SDLC</span><span>Rama</span><span>Retorno de pruebas</span></div>';
  if (slide.index >= 14 && slide.index <= 17) return '<p class="workflow-caption">Flujo accesible en orden de lectura; las relaciones de retorno y las ramas se anuncian debajo de los pasos.</p>';
  return '';
}
function assetMarkup(slide) {
  const seen = new Set();
  return slide.assets.filter(asset => { const key = `${asset.type}:${asset.src}`; if (seen.has(key)) return false; seen.add(key); return true; }).map(asset => {
    if (asset.type === 'video') {
      const transcript = videoTranscripts[slide.index] || 'Transcripción local de la demostración disponible para esta slide.';
      const track = `assets/video/captions-${String(slide.index).padStart(2, '0')}.vtt`;
      return `<div class="media"><video controls preload="metadata" playsinline poster="${asset.poster || ''}" src="${asset.src}" aria-label="Vídeo local de ${escapeHtml(slide.title)}"><track kind="captions" srclang="es" src="${track}" label="Español" default></video><p class="media-fallback" hidden>Vídeo no disponible localmente. El poster permanece disponible.</p><details class="transcript" open><summary>Transcripción de la demostración</summary><p>${escapeHtml(transcript)}</p></details></div>`;
    }
    return `<img class="visual" src="${asset.src}" alt="Recurso visual de ${escapeHtml(slide.title)}; el contenido textual equivalente está disponible en esta slide" data-asset-src="${asset.src}"><div class="asset-fallback" hidden>Recurso visual no disponible localmente; se muestra el equivalente textual.</div>`;
  }).join('');
}
function notesMarkup(slide) { if (!slide.notesContext?.available) return ''; const items = (slide.notesContext.text || []).map(text => `<li>${escapeHtml(text)}</li>`).join(''); return `<details class="notes"><summary>${escapeHtml(slide.notesContext.label)}</summary><ul>${items}</ul></details>`; }
function renderSlide(slide) {
  const article = $(`#${slide.id}`); article.className = `slide slide-${String(slide.index).padStart(2, '0')}`; article.setAttribute('aria-labelledby', `title-${slide.id.slice(-2)}`);
  const body = textBlocks(slide); const media = assetMarkup(slide); const specific = slideSpecificMarkup(slide);
  const heading = slide.visibleText.length ? `<h1 id="title-${slide.id.slice(-2)}">${escapeHtml(slide.title)}</h1>` : '';
  if (!heading) article.removeAttribute('aria-labelledby');
  article.setAttribute('aria-label', slide.visibleText.length ? slide.title : `Slide ${String(slide.index).padStart(2, '0')} visual`);
  article.innerHTML = `${heading}<div class="content-grid"><div class="copy">${body}${specific}${modelMarkup(slide)}${notesMarkup(slide)}</div><div class="visual-column">${media}</div></div>`;
  $$('.visual', article).forEach(image => image.addEventListener('error', () => { image.classList.add('failed'); image.nextElementSibling.hidden = false; }));
  $$('video', article).forEach(video => video.addEventListener('error', () => { const fallback = video.nextElementSibling; if (fallback) fallback.hidden = false; }));
}
function render(n, focus = false) { state.current = n; state.slides.forEach(slide => slide.element.classList.toggle('active', slide.data.index === n)); const data = state.slides[n - 1].data; document.title = `${data.title} · Kiro CLI`; $('#counter').textContent = `${String(n).padStart(2, '0')} / ${TOTAL}`; $('#progress').style.width = `${n / TOTAL * 100}%`; $('#progress').setAttribute('aria-valuenow', n); $('#prev').disabled = n === 1; $('#next').disabled = n === TOTAL; $$('#slide-index button').forEach(button => button.setAttribute('aria-current', button.dataset.slide == n ? 'true' : 'false')); if (focus) state.slides[n - 1].element.focus(); }
function buildIndex() { $('#slide-index').innerHTML = state.slides.map(({ data }) => `<button type="button" data-slide="${data.index}" aria-label="Ir al slide ${data.index}">${String(data.index).padStart(2, '0')}</button>`).join(''); $$('#slide-index button').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.slide), false, true))); }
function keydown(event) { if (event.key === 'Escape') { $$('details[open]').forEach(panel => panel.removeAttribute('open')); return; } if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO'].includes(document.activeElement.tagName)) return; const map = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1, Home: -21, End: 21 }; if (map[event.key] !== undefined) { event.preventDefault(); go(map[event.key] > 20 ? TOTAL : map[event.key] < -20 ? 1 : state.current + map[event.key], false, true); } }
async function init() { const response = await fetch('assets/manifest.json'); if (!response.ok) throw new Error('No se pudo cargar el manifiesto'); const manifest = await response.json(); state.slides = manifest.slides.map(data => ({ data, element: $(`#${data.id}`) })); state.slides.forEach(({ data }) => renderSlide(data)); buildIndex(); $('#prev').addEventListener('click', () => go(state.current - 1, false, true)); $('#next').addEventListener('click', () => go(state.current + 1, false, true)); const initial = hashNumber(); go(initial || 1, !initial, false); window.addEventListener('popstate', () => go(hashNumber() || 1, false, true)); window.addEventListener('hashchange', () => { const n = hashNumber(); if (n) render(n, true); }); document.addEventListener('keydown', keydown); }
init().catch(error => { document.body.insertAdjacentHTML('beforeend', `<p class="asset-fallback">Error cargando la presentación: ${escapeHtml(error.message)}</p>`); });
