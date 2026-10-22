#!/bin/sh
set -eu
OUT="${1:-artifacts/reference}"
mkdir -p "$OUT"
if command -v soffice >/dev/null 2>&1; then
  echo "soffice available; render the source deck into $OUT for manual comparison"
  exit 0
fi
if command -v libreoffice >/dev/null 2>&1; then
  echo "libreoffice available; render the source deck into $OUT for manual comparison"
  exit 0
fi
echo "not-run: soffice/libreoffice unavailable; PPTX reference rendering requires manual environment setup"
exit 0
