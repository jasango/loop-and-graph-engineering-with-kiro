# Verificación de despliegue — iteración 01

Proyecto: `kahoot-kiro`

- `projectDir` en STATUS: PASS — `Loop4/kahoot-kiro`
- `projectDir` en proposal.json: PASS — `Loop4/kahoot-kiro`
- `deploy/start.sh`: PASS — existe
- `deploy/stop.sh`: PASS — existe
- `deploy/app.pid`: PASS — existe
- PID `52031`: PASS — el proceso está vivo (`kill -0`)
- URL `http://127.0.0.1:5173/`: PASS — HTTP 200 en el intento 1
- Health URL `http://127.0.0.1:5173/`: PASS — HTTP 200 en el intento 1
- Puerto 5173: PASS — escucha en `127.0.0.1:5173`
- Aviso de exposición: ninguno; no escucha en todas las interfaces.

## Decisión

**PASS** — existen los artefactos, el PID está vivo y todas las URLs responden con código 2xx/3xx.
