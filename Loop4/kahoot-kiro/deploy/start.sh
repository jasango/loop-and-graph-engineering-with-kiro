#!/usr/bin/env bash
set -euo pipefail

DEPLOY="$(cd "$(dirname "$0")" && pwd)"
APP="$DEPLOY/../app"
PID_FILE="$DEPLOY/app.pid"
LOG_FILE="$DEPLOY/app.log"

"$DEPLOY/stop.sh"
: > "$PID_FILE"

cd "$APP"
export HOST="127.0.0.1"
export PORT="5173"
nohup npm run dev -- --host 127.0.0.1 --port 5173 >> "$LOG_FILE" 2>&1 < /dev/null &
echo $! >> "$PID_FILE"

echo "kahoot-kiro disponible en http://127.0.0.1:5173/ (PID $!)"
