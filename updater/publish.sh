#!/usr/bin/env bash
# Reconstruye y despliega en GitHub Pages (rama gh-pages de jvcstro/ruta-leonida). Uso: updater/publish.sh "mensaje"
set -euo pipefail
cd "$(dirname "$0")/.."
node build.mjs
node scripts/og.mjs >/dev/null && node build.mjs >/dev/null   # OG de páginas nuevas
git add -A && git commit -qm "${1:-contenido: actualización}" || true
git push -q origin main
npx --yes gh-pages@6 -d dist -b gh-pages -t -m "deploy: ${1:-actualización}" >/dev/null
echo "Desplegado: https://jvcstro.github.io/ruta-leonida/"
