# Actualizador de Ruta Leonida

Flujo: **fetch -> draft -> revisión IA -> approve -> publish**. Nada se publica sin fuente ni sin revisión.

1. `python3 updater/fetch.py` (Reddit RSS r/GTA6, r/GTAVI, r/GrandTheftAutoVI + Google News es/en, últimas 24 h).
   YouTube gratis con yt-dlp: `python3 updater/fetch.py --youtube "GTA 6 dinero rápido" --youtube "GTA 6 money method" --yt-max 5 --transcripts`.
   (No gasta créditos de TubeAlfred. Si yt-dlp falla por límite, reintentar más tarde o usar TubeAlfred solo para 1-2 vídeos clave.)
2. `python3 updater/draft.py` -> `updater/drafts/queue.json`: cada borrador trae sección sugerida, tipo de fuente (oficial / prensa / comunidad), citas literales y enlace.
3. Revisión (la hace el agente de la rutina): lee la fuente original, decide, redacta en español propio (sin copiar párrafos) y:
   - `python3 updater/approve.py --draft <id> --title "..." --summary "..." [--body-file f.md] [--extra-source "Medio|url"] [--spoiler] [--link /ruta/]`
   - `python3 updater/approve.py --reject <id> --reason "..."`
   - coleccionables: `approve.py --collectible --category <id> --category-name "..." --item <id> --name "..." --region "..." --hint "..." --source "Etiqueta|url"`
   - páginas fijas (hora, precio, tamaño, plataformas, mapa, FAQ): editar `content/<slug>.md` y subir `updated`.
4. `updater/publish.sh "mensaje"` -> build + imágenes OG + push a `main` + deploy a `gh-pages`.

## Reglas del revisor
- Dato oficial (Rockstar, PlayStation, Xbox) o 2 medios fiables = publicable como hecho.
- Comunidad (Reddit, YouTube) = solo métodos/ubicaciones verificables; citar al autor; para trucos y dinero, exigir vídeo o 2 fuentes independientes.
- Rumores y filtraciones: no se publican. Spoilers de historia: `--spoiler`.
- Nunca usar capturas, frames, logos ni arte oficial. Texto siempre propio.
