# Plan de implementación — Kahoot! de Kiro

**Proyecto:** `kahoot-kiro`  
**Directorio de aplicación:** `Loop4/kahoot-kiro/app`  
**Pruebas:** ejecutar `npm test` desde `Loop4/kahoot-kiro/app`  
**Olas:** 4

## Ola 1 — Andamiaje

| Carril | Grupo | Archivos | Pruebas |
|---|---|---|---|
| 1 | **G1 — Andamiaje React/Vite y pruebas**<br>Aplicación TypeScript con Vite, dependencias fijadas, configuración de build/pruebas y prueba mínima ejecutable. | `app/package.json`, `app/package-lock.json`, `app/tsconfig.json`, `app/tsconfig.node.json`, `app/vite.config.ts`, `app/index.html`, `app/src/vite-env.d.ts`, `app/src/main.tsx`, `app/tests/setup.ts` | `app/tests/smoke.test.ts` |

Esta es la única ola que instala dependencias.

## Ola 2 — Datos y lógica

| Carril | Grupo | Archivos | Pruebas |
|---|---|---|---|
| 1 | **G2 — Contenido y modelo de preguntas**<br>Incorpora exactamente 20 preguntas Kiro en orden y su módulo tipado de carga/validación. | `app/src/data/questions.json`, `app/src/data/questions.ts` | `app/tests/data/questions.test.ts` |
| 2 | **G3 — Lógica de puntuación y estado**<br>Calcula puntos y modela fases, respuestas y timeout en memoria según las reglas de negocio. | `app/src/game/scoring.ts`, `app/src/game/gameState.ts` | `app/tests/game/scoring.test.ts`, `app/tests/game/gameState.test.ts` |

G2 y G3 son independientes y sus interfaces quedan definidas por la especificación.

## Ola 3 — Interfaz visual

| Carril | Grupo | Archivos | Pruebas |
|---|---|---|---|
| 1 | **G4 — Pantallas de inicio y resultados**<br>Vistas de bienvenida y resultados con acciones de comenzar/reiniciar y métricas finales. | `app/src/components/StartScreen.tsx`, `app/src/components/StartScreen.module.css`, `app/src/components/ResultsScreen.tsx`, `app/src/components/ResultsScreen.module.css` | `app/tests/components/StartScreen.test.tsx`, `app/tests/components/ResultsScreen.test.tsx` |
| 2 | **G5 — Pantalla de juego y feedback**<br>Pregunta interactiva, opciones bloqueables, solución, explicación, progreso y temporizador. | `app/src/components/QuizScreen.tsx`, `app/src/components/QuizScreen.module.css`, `app/src/components/Timer.tsx`, `app/src/components/Timer.module.css`, `app/src/components/QuestionCard.tsx`, `app/src/components/QuestionCard.module.css`, `app/src/components/Feedback.tsx`, `app/src/components/Feedback.module.css` | `app/tests/components/Timer.test.tsx`, `app/tests/components/QuestionCard.test.tsx`, `app/tests/components/QuizScreen.test.tsx` |
| 3 | **G6 — Tema visual y accesibilidad global**<br>Tokens, layout responsive, colores por umbral, foco, contraste y `prefers-reduced-motion`. | `app/src/styles/theme.css`, `app/src/styles/global.css`, `app/src/styles/accessibility.css` | `app/tests/styles/accessibility.test.ts` |

Los tres grupos no comparten archivos y consumen únicamente contratos de datos/lógica ya definidos.

## Ola 4 — Integración

| Carril | Grupo | Archivos | Pruebas |
|---|---|---|---|
| 1 | **G7 — Orquestación de la partida**<br>Integra inicio, juego, feedback de 2 segundos, timeout, puntuación, resultados y reinicio en el componente raíz. | `app/src/App.tsx` | `app/tests/App.test.tsx` |

Al terminar, `npm test` debe ejecutar todas las pruebas y `npm run build` debe compilar el demo local. No se contempla backend, autenticación, persistencia ni solicitudes remotas durante la partida.
