# Propuesta de despliegue local: kahoot-kiro

## Stack detectado
- Frontend React 18.3.1 + TypeScript 5.6.2.
- Vite 5.4.8 como servidor de desarrollo y empaquetador.
- Aplicación estática: no hay backend, API, base de datos ni autenticación.
- El contenido se importa desde JSON local y el estado de la partida vive en memoria.

## Requisitos del sistema
- Node.js instalado: v22.22.0.
- npm disponible junto con Node.js; se usará el lockfile existente.
- Python no es necesario (instalado: 3.11.14).
- Docker no es necesario.
- El puerto 3000 estaba ocupado; el puerto 5173 está libre al comprobarlo.

## Instalación y ubicación
La instalación se ejecutará desde `Loop4/kahoot-kiro/app/` con:

```sh
npm ci
```

Las dependencias quedarán en `Loop4/kahoot-kiro/app/node_modules/`, sin modificar el código fuente. En la inspección ya existe `node_modules`, pero `npm ci` deja la instalación reproducible a partir de `package-lock.json`.

## Artefactos de despliegue
Se crearán en `Loop4/kahoot-kiro/deploy/`:

- `start.sh`: arranca Vite mediante `npm --prefix ../app run dev -- --host 127.0.0.1 --port 5173`, guarda el PID en `.kahoot-kiro.pid` y registra la salida en `dev-server.log`.
- `stop.sh`: detiene el PID registrado y elimina `.kahoot-kiro.pid`.
- `proposal.md`: esta propuesta para personas.
- `proposal.json`: configuración estructurada para agentes.

No hacen falta `.env`, proxy, servidor alternativo ni configuración de Vite: la aplicación no tiene API y Vite permite fijar el host y puerto por argumentos.

## Build y arranque
Comandos desde `Loop4/kahoot-kiro/app/`:

```sh
npm ci
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

Operativamente, los artefactos permiten usar:

```sh
Loop4/kahoot-kiro/deploy/start.sh
Loop4/kahoot-kiro/deploy/stop.sh
```

La propuesta usa el servidor de desarrollo de Vite porque el proyecto no incluye un servidor de producción que sirva `dist/`. El build se valida por separado con `npm run build`.

## Puerto y URLs
- Host: `127.0.0.1` únicamente.
- Puerto: `5173`.
- URL para abrir: `http://127.0.0.1:5173/`.
- Health URL: `http://127.0.0.1:5173/` (debe responder 2xx/3xx).

## Validación realizada
- `npm test`: 11 archivos, 32 pruebas, todas correctas.
- `npm run build`: correcto; genera `app/dist/`.

## Riesgos y límites
- El servidor es local y no tiene autenticación, conforme al alcance del demo.
- El puerto 3000 estaba ocupado al planificar; si se prefiere ese puerto habrá que liberar el proceso o solicitar otro cambio.
- Riesgo funcional importante: `app/src/main.tsx` monta actualmente `AppPlaceholder` en lugar de importar y renderizar `App` desde `App.tsx`. Por tanto, el despliegue arranca correctamente y responde, pero la URL actualmente muestra sólo el título placeholder; no se modifica `app/` en este paso. El resto de componentes y pruebas de `App` sí están presentes y pasan.
- El proceso usa Vite en modo desarrollo, no un servidor de producción endurecido; es adecuado únicamente para este demo local.
