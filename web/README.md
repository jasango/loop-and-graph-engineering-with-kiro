# Kiro CLI en Acción

Presentación estática vanilla de 22 slides, sin backend ni dependencias de runtime. Todo el texto equivalente, modelos accesibles, posters y vídeos se sirven desde `web/` y el manifiesto de FEAT-001.

## Requisitos
Node 22+, npm 10 y Python 3.12+. Instala el único tooling de desarrollo fijado y Chromium con:

```sh
cd /Users/jsantana/Desktop/github/loop-and-graph-engineering-with-kiro/web
npm install
npx playwright install chromium
```

## Vista previa

```sh
cd /Users/jsantana/Desktop/github/loop-and-graph-engineering-with-kiro/web
python3 -m http.server 4173
```

Abre `http://127.0.0.1:4173/#slide-01`. Usa flechas, PageUp/PageDown, Home/End, índice y botones; la navegación de usuario usa history pushState y un hash inicial inválido se normaliza a slide 1.

## Validación reproducible

```sh
cd /Users/jsantana/Desktop/github/loop-and-graph-engineering-with-kiro/web
mkdir -p artifacts/smoke
python3 -m http.server 4173 > artifacts/smoke/server.log 2>&1 & SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
node tests/smoke.mjs --base http://127.0.0.1:4173 --out artifacts/smoke
```

El smoke test crea `report.json` y capturas `desktop-XX.png`, `mobile-XX.png` y `narrow-XX.png` para cada slide. Comprueba manifest/assets, modelos DOM, títulos, consola, requests locales, fallback de vídeo y overflow a 320×568. Completa manualmente la revisión VoiceOver, foco/teclado, zoom 200%, contraste, captions/transcripts y comparación con el PPTX. `scripts/render-reference.sh` registra como `not-run` la referencia cuando no hay `soffice`/`libreoffice`.
