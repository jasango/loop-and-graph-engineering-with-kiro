# Especificación: Kahoot! de Kiro

## 1. Objetivo y alcance

Crear una aplicación web local, monousuario y tipo Kahoot! para aprender y comprobar conocimientos sobre Kiro. Será un demo simple y funcional, sin autenticación, backend ni base de datos. La aplicación contiene 20 preguntas iniciales sobre Kiro, almacenadas en un archivo JSON local, y permite completar una partida cronometrada, obtener puntuación y consultar los resultados finales.

El contenido se basa en la documentación oficial de Kiro y su índice actualizado: [Kiro Docs](https://kiro.dev/llms.txt).

## 2. Usuarios y casos de uso

- **Usuario único del demo:** inicia una partida, lee cada pregunta, selecciona una opción o espera al timeout, recibe la solución y consulta el resultado.
- El usuario puede comenzar una nueva partida desde la pantalla inicial o reiniciar desde la pantalla de resultados.
- No hay cuentas, perfiles, nombres de jugador, categorías, ranking ni gestión de preguntas.

## 3. Requisitos funcionales

- **RF-1 — Pantalla inicial:** mostrar título, explicación breve y botón «Comenzar».
- **RF-2 — Carga de contenido:** cargar exactamente 20 preguntas desde `src/data/questions.json`, en el orden definido por el archivo.
- **RF-3 — Estructura de pregunta:** cada pregunta debe tener `id`, `question`, `options` con exactamente cuatro opciones, `correctOption` como índice entre 0 y 3, y `explanation`.
- **RF-4 — Presentación:** mostrar una pregunta a la vez, sus cuatro opciones, el progreso de la partida y el temporizador.
- **RF-5 — Selección:** permitir seleccionar una opción mientras la pregunta esté activa; al seleccionar, bloquear nuevas respuestas.
- **RF-6 — Timeout:** al llegar el temporizador a cero, marcar la pregunta como no respondida, bloquearla y asignar cero puntos.
- **RF-7 — Solución:** después de una respuesta o timeout, mostrar la opción correcta y la explicación durante aproximadamente 2 segundos, y avanzar automáticamente.
- **RF-8 — Puntuación:** una respuesta correcta obtiene `round(500 + 500 * tiempoRestante / 15)`, con mínimo 500 y máximo 1000; una respuesta incorrecta o timeout obtiene 0.
- **RF-9 — Resultados:** al terminar las 20 preguntas, mostrar puntuación total, número de aciertos y porcentaje de aciertos.
- **RF-10 — Reinicio:** ofrecer un botón para reiniciar y comenzar otra partida desde cero.
- **RF-11 — Estado:** mantener el estado de la partida únicamente en memoria; no usar `localStorage` ni persistencia externa.

## 4. Reglas de negocio

- Cada pregunta tiene exactamente una respuesta correcta y tres distractores.
- El tiempo asignado a cada pregunta es de 15 segundos y se reinicia al comenzar la siguiente.
- El tiempo restante usado para puntuar es el valor disponible en el momento de seleccionar la respuesta; el timeout siempre puntúa 0.
- La puntuación por respuesta correcta se calcula con `round(500 + 500 * tiempoRestante / 15)` y no puede superar 1000.
- Una pregunta respondida no puede modificarse.
- La transición de solución dura aproximadamente 2 segundos antes de avanzar, salvo el final de la partida, que lleva a resultados.
- El porcentaje de aciertos es `aciertos / 20 * 100`.

## 5. Modelo de datos

Archivo: `src/data/questions.json`.

```json
{
  "id": "string o número",
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctOption": 0,
  "explanation": "string"
}
```

El archivo contiene 20 registros válidos. El estado efímero de ejecución incluye, como mínimo, índice de pregunta actual, tiempo restante, respuestas seleccionadas, aciertos, puntuación acumulada y fase de la partida (`start`, `question`, `feedback`, `results`).

## 6. Arquitectura y componentes

- Aplicación cliente React montada con Vite.
- Componente raíz para controlar la fase de la partida y el estado en memoria.
- Pantalla inicial para comenzar.
- Pantalla de juego para pregunta, opciones, progreso y temporizador.
- Componente de temporizador/barra de tiempo con estados visuales por umbral.
- Estado de feedback para mostrar respuesta correcta y explicación.
- Pantalla de resultados para resumen y reinicio.
- Módulo de datos que importa el JSON local; no hay API ni servidor de aplicación.
- Estilos responsive con una interfaz colorida y clara para escritorio y móvil.

## 7. Tecnologías

- Lenguaje: TypeScript.
- Framework: React con Vite.
- Persistencia: ninguna; preguntas en JSON estático y estado en memoria.
- Pruebas: Vitest y Testing Library.
- Comando de pruebas: `npm test`.
- Comando de compilación: `npm run build`.
- La versión exacta de Node, React, Vite y dependencias queda determinada por el setup del proyecto y debe fijarse en `package.json`/lockfile sin introducir backend.

## 8. Requisitos no funcionales

- Interfaz responsive para móvil y escritorio.
- Diseño rico en colores, con cambios claros conforme disminuye el tiempo.
- La barra o indicador será verde cuando queden más de 10 segundos, amarillo entre 5 y 10 segundos, y rojo cuando queden menos de 5 segundos.
- Mostrar también el número de segundos para no depender sólo del color y favorecer la accesibilidad.
- Respetar `prefers-reduced-motion`, reduciendo o eliminando animaciones no esenciales.
- Los controles deben tener estados visibles de foco, ser utilizables con teclado y comunicar adecuadamente el estado de respuesta.
- No realizar solicitudes remotas durante la partida.
- La aplicación debe funcionar como demo local tras instalar dependencias y ejecutar el servidor de desarrollo de Vite.

## 9. Criterios de aceptación

- Se puede iniciar una partida desde la pantalla inicial.
- Se muestran las 20 preguntas, una por una, en el orden del JSON, con cuatro opciones cada una.
- Cada pregunta comienza con 15 segundos y el indicador y número visible se actualizan hasta cero.
- Los colores del indicador cumplen los umbrales verde, amarillo y rojo especificados.
- Al responder, o al agotar el tiempo, las opciones quedan bloqueadas y se muestra la solución y explicación aproximadamente 2 segundos.
- Las respuestas correctas calculan la puntuación indicada; errores y timeouts puntúan 0.
- Tras la pregunta 20 se muestran puntuación, aciertos y porcentaje correctos.
- Reiniciar devuelve la aplicación al estado inicial sin conservar datos de la partida anterior.
- `npm test` ejecuta las pruebas configuradas y `npm run build` compila correctamente.
- La interfaz se adapta a móvil y escritorio, ofrece información textual del tiempo y respeta `prefers-reduced-motion`.

## 10. Fuera de alcance

Autenticación, usuarios múltiples, nombres de jugador, ranking, categorías o selección de cuestionarios, editor de preguntas, carga remota, backend, base de datos, almacenamiento persistente, sincronización, analítica, publicación en producción y panel administrativo.

## 11. Preguntas abiertas

No quedan decisiones funcionales abiertas para este demo. Las versiones exactas de las dependencias se fijarán durante la inicialización técnica del proyecto, manteniendo React + TypeScript + Vite, Vitest y Testing Library.
