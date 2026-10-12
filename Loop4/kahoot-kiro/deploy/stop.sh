#!/usr/bin/env bash
set -u

DEPLOY="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DEPLOY/app.pid"

if [[ -f "$PID_FILE" ]]; then
  while IFS= read -r PID; do
    [[ "$PID" =~ ^[0-9]+$ ]] || continue
    pkill -P "$PID" 2>/dev/null || true
    kill "$PID" 2>/dev/null || true
  done < "$PID_FILE"
  rm -f "$PID_FILE"
fi

for PORT in 5173; do
  PIDS="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$PIDS" ]]; then
    kill $PIDS 2>/dev/null || true
  fi
done

exit 0
