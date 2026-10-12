#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

if ! command -v kiro-cli >/dev/null 2>&1; then
    echo 'ERROR: falta kiro-cli' >&2
    exit 1
fi

if [ "$#" -eq 0 ]; then
    echo "Uso: sh refine_article_loop.sh \"tema del artículo\"" >&2
    exit 2
fi

TOPIC="$*"
ARTICLE=''
REVIEW=''
ITERATION=1

while [ "$ITERATION" -le 5 ]; do
    if [ "$ITERATION" -eq 1 ]; then
        ARTICLE=$(kiro-cli chat --no-interactive \
            --agent loop2-article-creator \
            "Escribe un artículo sobre este tema: $TOPIC")
    else
        ARTICLE=$(kiro-cli chat --no-interactive \
            --agent loop2-article-improver \
            "Tema: $TOPIC
Artículo actual:
$ARTICLE
Revisión anterior:
$REVIEW")
    fi

    REVIEW=$(kiro-cli chat --no-interactive \
        --agent loop2-article-reviewer \
        "Artículo a revisar:
$ARTICLE")

    printf '\n=== Iteración %s ===\n' "$ITERATION"
    printf 'Artículo:\n%s\n' "$ARTICLE"
    printf 'Revisión:\n%s\n' "$REVIEW"

    case "$REVIEW" in
        *APPROVED*)
            echo "PASS: artículo aprobado en la iteración $ITERATION"
            exit 0
            ;;
    esac

    ITERATION=$((ITERATION + 1))
done

echo 'ERROR: el artículo no fue aprobado en 5 iteraciones.' >&2
exit 1
