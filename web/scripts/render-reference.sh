#!/bin/sh
set -eu
OUT="${1:-artifacts/reference}"
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SOURCE="$ROOT/../deck/kiro-cli-en-accion-loop-engineering.pptx"
mkdir -p "$OUT"
RENDERER=""
if command -v soffice >/dev/null 2>&1; then RENDERER=soffice; elif command -v libreoffice >/dev/null 2>&1; then RENDERER=libreoffice; fi
if [ -z "$RENDERER" ]; then
  printf '%s\n' 'not-run: soffice/libreoffice unavailable; PPTX reference rendering requires manual environment setup'
  exit 0
fi
"$RENDERER" --headless --convert-to pdf --outdir "$OUT" "$SOURCE" >/dev/null
PDF="$OUT/kiro-cli-en-accion-loop-engineering.pdf"
if command -v pdftoppm >/dev/null 2>&1 && [ -f "$PDF" ]; then
  pdftoppm -png -r 144 "$PDF" "$OUT/reference" >/dev/null 2>&1
  printf '%s\n' 'rendered: 22-slide PPTX reference PNGs generated'
else
  printf '%s\n' 'rendered PDF reference; pdftoppm unavailable for PNG conversion'
fi
