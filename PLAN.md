# Plan GTA 6: Ruta Leonida (13 nov 2026)

Lanzamiento: jueves 19 nov 2026, 00:00 hora peninsular (PS5 y Xbox Series X|S). Ventana clave de tráfico: 18 nov 12:00 (Nueva Zelanda empieza) a ~30 nov.

## Marca

Elegida: **Ruta Leonida** (guía no oficial). Nombre propio, sin "GTA" en la marca; "GTA 6" solo en textos de forma descriptiva.

| Opción | GitHub | YouTube @ | TikTok @ | X @ |
|---|---|---|---|---|
| **Ruta Leonida** (`rutaleonida`) | libre | libre | libre | libre |
| Bitácora Leonida (`bitacoraleonida`) | libre | libre | libre | libre |
| Brújula Leonida (`brujulaleonida`) | libre | libre | libre | libre |

Comprobado el 13 nov hacia las 11:10 (hora peninsular). Ocupados: leonidaguia, guialeonida, viceguia, mapaneon, guianeon, leonida305 (YouTube y/o TikTok).
Por qué Ruta Leonida: corta, se dice bien, sirve para web, canal y guía de pago, y da pie al detalle firma (la ruta punteada del póster).
Dominio recomendado (no comprado): **rutaleonida.com**, que parece libre (RDAP 404). Unos 10-12 €/año (p. ej. Cloudflare Registrar o Porkbun). Hace falta para AdSense, porque no admite subdominios github.io. Sin dominio la web funciona igual.

---

## Proyecto 1: web guía (HECHO, ver README y updater/)

- Sitio estático propio (`build.mjs`, sin framework), 15 páginas, ~30 KB de HTML por página con CSS en línea y fuentes propias (sin peticiones a terceros).
- Páginas con datos verificados y fuentes: hora de salida en España, tamaño y precarga, precio y ediciones, plataformas y Xbox Cloud, personajes y mapa, FAQ (10 preguntas), aviso legal.
- Plantillas listas con estado vacío diseñado: coleccionables (checklist con progreso en localStorage, probado), misiones, trucos, ganar dinero, secretos. Noticias con 4 entradas reales.
- SEO: títulos y descripciones por palabra clave, canonical, sitemap.xml, robots.txt, OG 1200x630 propias por página, schema.org (WebSite, Article, FAQPage, BreadcrumbList, ItemList).
- Señales de frescura: "Actualizado hace X" en home y en cada página (se calcula en el navegador).

### Lo que Javier tiene que hacer (cuando toque)
1. **Ahora (opcional, 5 min):** Google Search Console con su cuenta de Google -> añadir la propiedad de prefijo de URL `https://jvcstro.github.io/ruta-leonida/` -> verificar con etiqueta HTML (me pasa el código y lo pongo) -> enviar `sitemap.xml`. Acelera la indexación antes del 19.
2. **Si quiere anuncios:** comprar `rutaleonida.com` (~10-12 €/año) y conectarlo a GitHub Pages (lo configuro yo). Después, hacia el 25-30 nov, cuando haya 30+ páginas propias y tráfico diario, darse de alta en **AdSense** (pide nombre, dirección y datos fiscales/bancarios: solo él). Alternativa sin dominio: ninguna red seria acepta github.io.
3. **Afiliación (desde ya o tras el lanzamiento):** Amazon Afiliados España (SSD de ampliación para PS5/Xbox, tarjetas PSN/Xbox, mandos). Necesita sus datos fiscales; Amazon exige 3 ventas en 180 días. Opcional: Instant Gaming o Eneba (claves y tarjetas regalo). Me pasa los IDs de afiliado y yo pongo los enlaces marcados.
4. Cuando haya analítica o anuncios, añadimos el aviso de cookies (ya está anunciado en el aviso legal).

### Rutina recomendada para la semana de lanzamiento (la crea el agente principal)
- **Horario:** 16-18 nov cada 8 h (09:00, 17:00, 01:00); 18 nov 12:00 a 23 nov cada 3 h; 24-30 nov cada 6 h; desde diciembre 1 vez al día. Hora de Madrid.
- **Prompt:**
  > Eres el editor de Ruta Leonida (guía no oficial de GTA 6 en español, /workspace/gta6-guia). 1) `cd /workspace/gta6-guia && python3 updater/fetch.py` y, si es 19 nov o después, añade `--youtube "GTA 6 dinero rápido" --youtube "GTA 6 money fast" --youtube "GTA 6 all collectibles" --youtube "GTA 6 cheats" --youtube "GTA 6 easter eggs" --yt-max 4 --transcripts`. 2) `python3 updater/draft.py`. 3) Revisa `updater/drafts/queue.json` en orden de puntuación (máx. 25 por pasada): abre la fuente original, publica solo lo que cumpla las reglas de `updater/README.md` (oficial o 2 fuentes fiables; comunidad solo si es verificable y con crédito; nada de rumores ni filtraciones; spoilers marcados) con `updater/approve.py`, redactando en español propio y corto; rechaza el resto con motivo. Si un dato cambia una página fija (hora, precio, tamaño, plataformas, mapa, FAQ), edita `content/*.md`, cita la fuente y sube `updated`. 4) Si publicaste algo, `updater/publish.sh "resumen"` y comprueba que la URL responde 200. 5) No uses capturas ni arte oficiales, no gastes créditos de TubeAlfred salvo para un vídeo clave al día, no publiques en redes. 6) Avisa a Javier solo si hay un bloqueo, o una vez al día con: páginas nuevas, entradas publicadas y lo más buscado.
- Recomendado además: el 18 nov a las 11:30 (antes de que desbloquee Nueva Zelanda), una pasada manual para ajustar la home a "ya disponible en..." y preparar las primeras categorías de coleccionables en cuanto aparezcan.

---

## Proyecto 2: canal de Shorts "Ruta Leonida: secretos de GTA 6"

- **Nombre:** Ruta Leonida, con el handle `@rutaleonida` libre en YouTube, TikTok y X. Mismo póster y paleta que la web.
- **Formato:** Shorts verticales de 25-45 s, en español y con voz en off. Gancho en 2 s, un solo dato por vídeo y cierre con "guía completa en Ruta Leonida".
  - Visual 100% propio: motion graphics en Remotion con el estilo póster, mapas dibujados por nosotros, tipografía grande y gráficos de datos. Nada de capturas, tráiler ni logos oficiales.
  - Voz: hay que comprobar el español. Chatterbox-Turbo está pensado para inglés, así que conviene probar Qwen3-TTS, que admite español, o la versión multilingüe de Chatterbox en la caja (gratis). Nunca macOS `say`.
- **Tras el lanzamiento:** gameplay grabado por Javier en su consola, con comentario y edición propios. Rockstar suele permitir vídeos de partidas propias, pero hay que revisar su política vigente antes de monetizar. Nunca clips de otros creadores.
- **Plataforma primero: TikTok.** Descubre más rápido sin seguidores y su público es el de GTA. YouTube Shorts va como espejo y para búsquedas a largo plazo. En la práctica se publica en la primera que se desbloquee.
- **Bloqueos actuales:**
  1. Crear canales nuevos en YouTube con nika41323@gmail.com sigue pendiente de verificar el teléfono, que tiene que hacer Javier.
  2. Para abrir una cuenta nueva en TikTok hace falta una fecha de nacimiento, y Javier no la ha dado.
  3. No tocar @grimshiftshow.
- **Ritmo:** del 14 al 18 nov, un Short al día de cuenta atrás y datos. Del 19 al 30 nov, dos o tres al día (secretos y métodos de dinero, según lo que entre en la web).

### Primeros 10 Shorts (sin metraje con copyright)
1. "¿A qué hora puedes jugar a GTA 6 en España?" Reloj animado con las 00:00 en la península, la 01:00 en Canarias y las 07:00 de Xbox Cloud.
2. "212 GB: esto es lo que ocupa GTA 6". Comparación visual con otros tamaños, cómo liberar espacio y aviso de que la precarga ya está abierta.
3. "La caja de GTA 6 no trae disco". Qué hay dentro (un código) y por qué importa.
4. "Standard o Ultimate: ¿merecen la pena 20 € más?" Tabla animada y veredicto.
5. "Nueva Zelanda juega 12 horas antes que tú". Mapa del lanzamiento rodante dibujado por nosotros y aviso de spoilers.
6. "Las 6 zonas de Leonida que Rockstar ha confirmado". Mapa esquemático propio con una frase para cada zona.
7. "Quiénes son Jason y Lucía en 30 segundos". Resumen de las bios oficiales con ilustración tipográfica, sin arte oficial.
8. "GTA 6 en Xbox One: sí, pero solo así". Cómo funciona Xbox Cloud y qué cuesta.
9. "Más de 1.000 millones antes de salir". Gráfico de las reservas según Sensor Tower y comparación con otros lanzamientos, con fuentes en pantalla.
10. "Haz esto antes del jueves". Checklist: precargar, actualizar la consola, liberar espacio y evitar spoilers. Lleva a la web.

---

## Proyecto 3: guía de pago en Gumroad

- **Título provisional:** "Hazte rico en GTA 6: los mejores métodos de dinero, probados (guía no oficial)".
- **Precio:** 4,99 €, con 3,99 € las primeras 48 h si Javier quiere. Formato PDF de 20-30 páginas con tablas, más actualizaciones gratis durante 30 días.
- **Cuándo:**
  - Recopilar del 19 al 23 nov, a partir de lo que entre en la web (sección "Ganar dinero").
  - Redactar y maquetar el 23 y 24 nov.
  - Publicar hacia el 25 nov, con al menos 5 métodos verificados por 2 fuentes o probados en partida.
  - Actualizar el 2 dic.
- **Índice:**
  1. Cómo funciona la economía del juego (lo confirmado).
  2. Los mejores métodos en las primeras 5 horas.
  3. Ranking de métodos por dólares por hora, con requisitos y riesgos.
  4. Atracos y golpes: cuáles rinden más y cómo prepararlos.
  5. Negocios y propiedades: qué comprar primero y cuánto tarda en amortizarse.
  6. Errores que te arruinan, como gastos inútiles o compras trampa.
  7. Rutas de dinero por zona de Leonida, con mapas esquemáticos propios.
  8. Lo que NO funciona: bulos y trucos falsos.
  9. Registro de actualizaciones.
- **Aviso, en la portada y en la ficha:** «Guía no oficial creada por fans. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive. Grand Theft Auto es una marca de Take-Two Interactive. No contiene ni promueve trampas, exploits online ni software de terceros.» Sin capturas oficiales; portada propia con el estilo póster.
- **Publicación:** necesita la aprobación de Javier, porque es su cuenta de Gumroad y comparte tienda con FENAI. Decidir si va en la misma tienda o en un perfil aparte. Promoción desde la web y el canal.
