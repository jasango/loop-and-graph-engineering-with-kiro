#!/bin/sh
set -eu

cd "$(dirname "$0")"

# Crear target.txt si no existe
touch target.txt

# Contar líneas antes
LINES_BEFORE=$(wc -l < target.txt)

# Solicitar a Kiro CLI que añada una línea
kiro-cli chat --v3 \
    --no-interactive \
    --trust-tools=fs_read,fs_write \
    'Añade una nueva línea con el texto exacto "Hello, world!" al final de target.txt. Conserva todo el contenido existente y no modifiques ningún otro fichero.'

# Contar líneas después
LINES_AFTER=$(wc -l < target.txt)

# Verificar que se añadió al menos una línea y que contiene "Hello, world!"
if [ "$LINES_AFTER" -gt "$LINES_BEFORE" ] && grep -Fq 'Hello, world!' target.txt; then
    echo 'PASS'
    exit 0
fi

echo 'ERROR: kiro-cli no añadió correctamente la línea a target.txt.' >&2
exit 1
