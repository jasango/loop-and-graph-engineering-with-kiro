# Ronda 1 — Preguntas de definición

La idea base es una aplicación web de cuestionarios sobre Kiro, para una sola persona, sin autenticación ni servidor de base de datos, con preguntas almacenadas en JSON local, 20 preguntas iniciales, cuatro opciones, 15 segundos por pregunta, puntuación y resultados finales. La referencia temática oficial es el índice de documentación de Kiro: https://kiro.dev/llms.txt.

Por favor, responde a estas preguntas. Puedes confirmar los valores propuestos indicando «por defecto» o responder sólo a los números que quieras cambiar.

1. **Flujo y alcance del usuario:** ¿Debe existir una pantalla inicial con título, breve explicación y botón «Comenzar», seguida del cuestionario de 20 preguntas y una pantalla final con puntuación, aciertos, porcentaje y opción de reiniciar? Propuesta por defecto: sí; una partida usa las 20 preguntas en orden y no hay selección de categorías ni nombre de jugador.

2. **Preguntas y reglas de puntuación:** ¿Cada pregunta tendrá exactamente una respuesta correcta y las otras tres serán distractores? Propuesta por defecto: sí; se muestra una pregunta a la vez, la respuesta se bloquea al elegirla o al agotarse el tiempo, se indica la solución, se pasa automáticamente a la siguiente tras una breve pausa y una respuesta correcta puntúa más cuanto antes se selecciona (0 puntos si hay timeout o error; máximo 1.000 puntos por pregunta).

3. **Temporizador y experiencia visual:** ¿Confirmas 15 segundos por pregunta y que el color de la interfaz/indicador cambie progresivamente según el tiempo restante? Propuesta por defecto: verde/azul al inicio, amarillo en la zona intermedia y rojo al final, con animación accesible; al agotarse el tiempo debe marcarse como no respondida y avanzar automáticamente.

4. **Contenido y mantenimiento:** ¿Confirmas 20 preguntas iniciales basadas en la documentación actual de Kiro (por ejemplo, specs, steering, hooks, MCP, modelos y superficies de uso), guardadas en un archivo JSON local editable? Propuesta por defecto: cada registro contiene `id`, `question`, cuatro opciones, `correctOption` y una explicación breve; la aplicación no necesita editor de preguntas ni cargar contenido desde internet durante la partida.

5. **Tecnología y criterios técnicos:** ¿Qué stack prefieres? Propuesta por defecto: frontend web con TypeScript, React y Vite; JSON estático local; sin backend ni base de datos; diseño responsive para escritorio y móvil; pruebas con Vitest y Testing Library, ejecutables con `npm test`, y build con `npm run build`. ¿Aceptas además persistir únicamente el estado temporal o el mejor resultado en `localStorage`, sin datos personales?

## Respuesta recibida

Respuestas ronda 1 (el usuario delega en mí; mantener simple y funcional, es un demo local):
1. Por defecto. Pantalla inicial con título, explicación breve y botón «Comenzar»; 20 preguntas en orden; pantalla final con puntuación, aciertos, porcentaje y botón reiniciar. Sin categorías ni nombre de jugador.
2. Por defecto. Una correcta y tres distractores; bloqueo al elegir o al agotar el tiempo; mostrar la solución ~2 s y avanzar automáticamente. Puntuación: correcta = round(500 + 500 * tiempoRestante/15), máximo 1000; error o timeout = 0.
3. Por defecto. 15 s por pregunta; barra/indicador verde (&gt;10 s), amarillo (5–10 s), rojo (&lt;5 s); además del color, número de segundos visible (accesibilidad); respetar prefers-reduced-motion. Al agotarse: no respondida y avanzar.
4. Por defecto. 20 preguntas sobre Kiro en src/data/questions.json con id, question, options (4), correctOption (índice 0–3) y explanation. Sin editor ni carga remota.
5. Por defecto: React + TypeScript + Vite, sin backend ni BD, responsive, Vitest + Testing Library (npm test), npm run build. NO usar localStorage (simplicidad): todo el estado en memoria.
Si surgen más preguntas, propón tú el valor por defecto más simple; doy por aprobada la especificación si cubre esto.