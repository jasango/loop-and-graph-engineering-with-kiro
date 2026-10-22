# Kiro CLI en acción: Loop Engineering (presentación)

[← Volver al README principal](../README.md)

Versión estática de la charla `deck/kiro-cli-en-accion-loop-engineering.pptx` (AWS Community Day Santiago de Compostela 2026). No es una conversión slide a slide: está reescrita como una presentación de 18 slides con un hilo narrativo, integrando el texto del deck, las notas del presentador y los README de `Loop1`–`Loop4`.

## Estructura narrativa
1. Portada y contexto: Kiro como un mismo harness en IDE, CLI, Web y Mobile.
2. Conceptos (3-6): disciplinas de ingeniería de IA, Loop frente a Graph, para qué sirven y las 10 características de un loop funcional.
3. Cómo hacerlo en Kiro (7-10): camino programático (Loop 1 y Loop 2) con demos.
4. Workflows (11-16): qué son, el SDLC como tres workflows (`software-spec`, `software-build`, `software-deploy`) y demo completa.
5. Conclusiones y recursos (17-18).

## Vista previa

```sh
cd presentation
python3 -m http.server 4173
```

Abre `http://127.0.0.1:4173/#slide-01`. Navegación: flechas, PageUp/PageDown, Home/End, botones e índice.

## Verificación

```sh
npm install && npx playwright install chromium
python3 -m http.server 4173 &   # en otra terminal
npm run smoke
```

Comprueba 18 slides, imágenes cargadas con `alt`, ausencia de errores de consola y de overflow horizontal en escritorio y móvil.

## Recursos

- `assets/images/` contiene las imágenes locales que usa `index.html`.
- `assets/video/` contiene los MP4, posters y subtítulos VTT de la presentación.
- [`assets/gifs/demo-01.gif`](assets/gifs/demo-01.gif), [`assets/gifs/demo-02.gif`](assets/gifs/demo-02.gif) y [`assets/gifs/demo-03.gif`](assets/gifs/demo-03.gif) conservan las animaciones de las demos para consulta y distribución junto a la presentación. La presentación actual usa los MP4 y no depende de estos GIF.

## Notas

- Todo el contenido está en `index.html`; `app.js` solo gestiona la navegación.
- Los recursos ya generados de `assets/` proceden del PPTX (`scripts/extract-assets.py`). El fichero fuente `../deck/kiro-cli-en-accion-loop-engineering.pptx` no forma parte de un clon limpio del repositorio, por lo que `extract-assets.py` y `render-reference.sh` son herramientas de mantenimiento y no son necesarios para servir la página ya generada.
- Los subtítulos `.vtt` son descripciones breves de cada demo.
