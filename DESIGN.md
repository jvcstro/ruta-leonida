# Ruta Leonida: DESIGN.md (tokens, fuente única)

Dirección de arte: revista de viaje / póster de carretera de los 80 en la costa al anochecer (neón-atardecer), plano, original. Referencias de composición (solo mirar): carteles de viaje de los años 80 con sol a franjas, mapas de carretera turísticos con ruta punteada, portadas de revista editorial con tipografía grande. No se copia nada de Rockstar.

## Color (modo oscuro por defecto, color-scheme: dark)
| Rol | Valor | Uso |
|---|---|---|
| night (fondo) | #0F0D12 | 70% neutro |
| surface | #18151C | bloques elevados |
| surface-2 | #221E27 | hover / filas |
| line | #2F2A35 | separadores mínimos |
| text | #F6EFE6 | texto (contraste 17:1) |
| muted | #BEB4A9 | secundario (9.6:1) |
| flamingo (acento único) | #FF6584 | acción principal, enlaces activos (6.6:1 sobre night) |
| sun (secundario, solo firma) | #FFB547 | póster, cuenta atrás |
| sea (estado) | #49C6B3 | "verificado", siempre con texto |

## Tipografía
- Display: Bricolage Grotesque (variable, OFL) 700/800, sentence case.
- Texto: Hanken Grotesk (OFL) 400/600, 17px móvil / 18px escritorio cuerpo de artículo, 16px UI.
- Escala: 12/14/16/18/20/24/30/36/48/60/72.
- Números tabulares en cuenta atrás y fichas.

## Espaciado y forma
- Escala 4/8/12/16/24/32/48/64/96/128. Secciones 96 desktop / 64 móvil.
- Radios: 4 (chips), 8 (bloques), 999 (botón). Sin sombras salvo menú móvil (dos capas suaves).
- Movimiento: 200ms ease-out [cubic-bezier(.22,1,.36,1)], respeta prefers-reduced-motion.

## Firma
Póster SVG propio: sol a franjas, horizonte con mar, dos palmeras planas y una ruta punteada que llega a un marcador "19 nov". Aparece solo en el hero de la home y en las imágenes OG.
