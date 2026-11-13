// Ruta Leonida: generador estático sin framework. Los datos viven en /content (Markdown + JSON) y /data.
import fs from 'node:fs'; import path from 'node:path'; import { marked } from 'marked';
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.resolve(ROOT, process.env.OUT_DIR || 'dist');
const site = JSON.parse(fs.readFileSync(path.join(ROOT,'data/site.json'),'utf8'));
if (process.env.BASE_PATH !== undefined) site.basePath = process.env.BASE_PATH;
if (process.env.SITE_URL) site.siteUrl = process.env.SITE_URL;
const B = site.basePath.replace(/\/$/,'');
const u = p => (p.startsWith('/') ? B + p : p);
const abs = p => site.siteUrl.replace(/\/$/,'') + u(p);
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt = iso => new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
const fmtDay = iso => new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));

// markdown: enlaces internos con basePath, tablas con scroll, enlaces externos seguros
marked.use({ gfm:true, walkTokens(t){ if(t.type==='link' && t.href && t.href.startsWith('/')) t.href = u(t.href); } });
const post = h => h.replace(/<table>/g,'<div class="table"><table>').replace(/<\/table>/g,'</table></div>').replace(/<a href="(https?:[^"]+)"/g,'<a rel="noopener" target="_blank" href="$1"');
const md = s => post(marked.parse(s||''));
const mdi = s => post(marked.parseInline(s||''));

function readContent(){
  return fs.readdirSync(path.join(ROOT,'content')).filter(f=>f.endsWith('.md')).map(f=>{
    const raw = fs.readFileSync(path.join(ROOT,'content',f),'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); if(!m) throw new Error('front matter en '+f);
    return { ...JSON.parse(m[1]), body: m[2] };
  }).sort((a,b)=>a.order-b.order);
}
const pages = readContent();
const hubs = JSON.parse(fs.readFileSync(path.join(ROOT,'data/hubs.json'),'utf8'));
const entries = {}; for (const h of hubs) entries[h.slug] = JSON.parse(fs.readFileSync(path.join(ROOT,'data/entries',h.slug+'.json'),'utf8'));
const published = slug => slug==='coleccionables' ? entries[slug].categories.filter(c=>c.items && c.items.length) : entries[slug].filter(e=>e.status==='published');
const hubUpdated = h => { const xs=[h.updated]; const e=entries[h.slug]; (Array.isArray(e)?e.filter(x=>x.status==='published'):e.categories).forEach(x=>x.updated&&xs.push(x.updated)); return xs.sort().pop(); };
const allDates = [...pages.map(p=>p.updated), ...hubs.map(hubUpdated)].map(d=>new Date(d).toISOString()).sort();
const lastUpdated = allDates[allDates.length-1];

const icons = {
  '/': '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  '/hora-de-salida-espana/': '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  '/coleccionables/': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
  '/ganar-dinero/': '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8m0 8v1.5"/>',
  '/noticias/': '<path d="M5 5h11v14H6a1 1 0 0 1-1-1zM16 9h3v9a1 1 0 0 1-1 1h-2"/><path d="M8 9h5M8 12h5M8 15h3"/>'
};
const ico = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]}</svg>`;
const css = fs.readFileSync(path.join(ROOT,'src/styles.css'),'utf8').replace(/url\(fonts\//g,`url(${B}/assets/fonts/`);
const mark = fs.readFileSync(path.join(ROOT,'src/assets/mark.svg'),'utf8');
const poster = fs.readFileSync(path.join(ROOT,'src/assets/poster.svg'),'utf8');

function layout({ route, title, description, body, jsonld=[], ogSlug='home', noindex=false, type='website' }){
  const nav = site.nav.map(n=>`<a href="${u(n.href)}"${n.href===route?' aria-current="page"':''}>${esc(n.label)}</a>`).join('');
  const tab = site.nav.map(n=>`<a href="${u(n.href)}"${n.href===route?' aria-current="page"':''}>${ico(n.href)}<span>${esc(n.short)}</span></a>`).join('');
  const ld = jsonld.map(j=>`<script type="application/ld+json">${JSON.stringify(j).replace(/</g,'\\u003c')}</script>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${abs(route)}">
${noindex?'<meta name="robots" content="noindex">':'<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta name="theme-color" content="#0F0D12"><link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml"><link rel="icon" href="${u('/favicon.ico')}" sizes="32x32"><link rel="apple-touch-icon" href="${u('/apple-touch-icon.png')}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:locale" content="es_ES"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${abs(route)}"><meta property="og:image" content="${abs('/og/'+ogSlug+'.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${abs('/og/'+ogSlug+'.png')}">
<link rel="preload" href="${u('/assets/fonts/bricolage.woff2')}" as="font" type="font/woff2" crossorigin>
<style>${css}</style>${ld}</head><body>
<a class="skip" href="#main">Saltar al contenido</a>
<header class="top"><div class="wrap"><a class="brand" href="${u('/')}">${mark}<span>${esc(site.name)}</span><small>Guía no oficial</small></a><nav class="nav" aria-label="Principal">${nav}</nav></div></header>
<main id="main">${body}</main>
<footer class="foot"><div class="wrap"><p>${esc(site.disclaimer)}</p><nav aria-label="Pie"><a href="${u('/preguntas-frecuentes/')}">Preguntas frecuentes</a><a href="${u('/aviso-legal/')}">Aviso legal y privacidad</a><a href="${u('/sitemap.xml')}">Mapa del sitio</a></nav></div></footer>
<nav class="tabbar" aria-label="Accesos rápidos">${tab}</nav>
<script src="${u('/assets/app.js')}" defer></script></body></html>`;
}

const org = { '@type':'Organization', name: site.name, url: abs('/') };
const crumbsLd = (route, name) => ({ '@context':'https://schema.org','@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Inicio', item:abs('/') },{ '@type':'ListItem', position:2, name, item:abs(route) }] });
const faqLd = faq => ({ '@context':'https://schema.org','@type':'FAQPage', mainEntity: faq.map(f=>({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })) });
const articleLd = (p, route) => ({ '@context':'https://schema.org','@type':'Article', headline:p.title, description:p.description, inLanguage:'es-ES', datePublished:p.published||p.updated, dateModified:p.updated, author:org, publisher:org, image:abs('/og/'+p.slug+'.png'), mainEntityOfPage:abs(route), isAccessibleForFree:true });
const fresh = (iso, prefix='Actualizado ') => `<time class="fresh" datetime="${new Date(iso).toISOString()}" data-rel data-prefix="${prefix}">${prefix}el ${fmt(iso)}</time>`;
const crumbs = name => `<div class="wrap"><nav class="crumbs" aria-label="Migas"><a href="${u('/')}">Inicio</a> / <span>${esc(name)}</span></nav></div>`;
const sourcesHtml = s => s && s.length ? `<section class="sources"><h2>Fuentes</h2><ol>${s.map(x=>`<li><a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.label)}</a></li>`).join('')}</ol></section>` : '';
const faqHtml = (faq, h='Preguntas rápidas') => faq && faq.length ? `<section class="faq"><h2>${h}</h2>${faq.map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : '';
const relatedHtml = cur => { const r = pages.filter(p=>p.slug!==cur && p.order<50).slice(0,4); return `<section class="related"><h2>Sigue leyendo</h2><ul class="guides" style="grid-template-columns:1fr">${r.map(p=>`<li><a href="${u('/'+p.slug+'/')}"><div><h3>${esc(p.kicker)}</h3><p>${esc(p.description.split('. ')[0])}.</p></div></a></li>`).join('')}</ul></section>`; };

const files = {};
const emit = (route, html) => { html = html.replace(/GTA 6(?=[^"<]*<)/g,'GTA\u00a06'); files[route==='/'?'index.html':route.replace(/^\//,'')+'index.html'] = html; };
const routes = [];

// páginas de contenido
for (const p of pages) {
  const route = '/'+p.slug+'/'; routes.push({ route, updated:p.updated });
  const body = `${crumbs(p.kicker)}<article class="article wrap"><header><span class="kicker">${esc(p.kicker)}</span><h1>${esc(p.title)}</h1>${fresh(p.updated)}</header>
<div class="tldr"><p>${mdi(p.tldr)}</p></div><div class="prose">${md(p.body)}</div>${faqHtml(p.faq, p.slug==='preguntas-frecuentes'?'Todas las respuestas':'Preguntas rápidas')}${sourcesHtml(p.sources)}${p.slug!=='aviso-legal'?relatedHtml(p.slug):''}</article>`;
  const ld = [articleLd(p, route), crumbsLd(route, p.kicker)]; if (p.faq) ld.push(faqLd(p.faq));
  emit(route, layout({ route, title:(p.seoTitle||p.title)+' | '+site.name, description:p.description, body, jsonld:ld, ogSlug:p.slug, type:'article' }));
}

// plantillas de hub
const emptyIcon = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M24 44c-6-8-14-15-14-24a14 14 0 0 1 28 0c0 9-8 16-14 24z"/><circle cx="24" cy="20" r="5"/></svg>';
for (const h of hubs) {
  const route = '/'+h.slug+'/'; const upd = hubUpdated(h); routes.push({ route, updated:upd });
  const items = published(h.slug); let inner;
  const empty = `<div class="empty">${emptyIcon}<h2>${esc(h.emptyTitle)}</h2><p>${esc(h.emptyBody)}</p><a class="btn btn-ghost" href="${u(h.emptyCta.href)}">${esc(h.emptyCta.label)}</a></div>`;
  if (h.type==='checklist') {
    inner = items.length ? `<div class="progress"><div class="bar"><i data-progress-bar></i></div><p data-progress-text>0 de 0 encontrados</p></div><div data-checklist>${items.map(c=>`<section class="cat" id="${esc(c.id)}"><h2>${esc(c.name)} <small data-cat-count>0 / ${c.items.length}</small></h2>${c.description?`<p class="meta">${esc(c.description)}</p>`:''}<ul class="items">${c.items.map(it=>`<li><label><input type="checkbox" value="${esc(c.id+'/'+it.id)}"><div><b>${esc(it.name)}</b>${it.region||it.hint?`<span>${esc([it.region,it.hint].filter(Boolean).join(': '))}</span>`:''}</div></label></li>`).join('')}</ul></section>`).join('')}</div><button class="reset" type="button" data-reset>Borrar mi progreso</button>` : empty;
  } else {
    inner = items.length ? `<ol class="entries${h.slug==='noticias'?' news':''}">${items.sort((a,b)=>(b.published||b.updated).localeCompare(a.published||a.updated)).map(e=>`<li class="entry" id="${esc(e.id)}"><time datetime="${new Date(e.published||e.updated).toISOString()}">${fmtDay(e.published||e.updated)}</time>${e.spoiler?' <span class="spoiler">Contiene spoilers</span>':''}<h2>${esc(e.title)}</h2><div class="prose">${md(e.body||e.summary)}</div>${e.link?`<p><a class="btn btn-ghost" href="${u(e.link)}">Ver la guía</a></p>`:''}${e.sources&&e.sources.length?`<p class="meta">Fuente: ${e.sources.map(s=>`<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a>`).join(', ')}</p>`:''}</li>`).join('')}</ol>` : empty;
  }
  const body = `${crumbs(h.kicker)}<section class="article wrap"><header><span class="kicker">${esc(h.kicker)}</span><h1>${esc(h.title)}</h1><p class="lede" style="margin-bottom:16px">${esc(h.intro)}</p>${fresh(upd)}</header>${inner}</section>`;
  const ld = [crumbsLd(route, h.kicker)];
  if (h.slug==='noticias' && items.length) ld.push({ '@context':'https://schema.org','@type':'ItemList', itemListElement: items.map((e,i)=>({ '@type':'ListItem', position:i+1, name:e.title, url:abs(route)+'#'+e.id })) });
  emit(route, layout({ route, title:h.seoTitle+' | '+site.name, description:h.description, body, jsonld:ld, ogSlug:h.slug }));
}

// home
const news = published('noticias').sort((a,b)=>b.published.localeCompare(a.published)).slice(0,3);
const guideRows = [...pages.filter(p=>p.order<50).map(p=>({ href:'/'+p.slug+'/', name:p.kicker==='FAQ'?'Preguntas frecuentes':p.title.split(':')[0].replace(/^GTA 6 ?/,'').replace(/^./,c=>c.toUpperCase()), desc:p.description.split('. ')[0]+'.', ok:true })),
  ...hubs.filter(h=>h.slug!=='noticias').map(h=>({ href:'/'+h.slug+'/', name:h.title.split(':')[0].replace(/ de GTA 6| en GTA 6/,''), desc:h.intro.split('. ')[0]+'.', ok: published(h.slug).length>0 }))];
const homeFaq = pages.find(p=>p.slug==='preguntas-frecuentes').faq.slice(0,5);
const homeBody = `<section class="hero"><div class="wrap"><div>
${fresh(lastUpdated)}
<h1>GTA 6 en español, claro y al día</h1>
<p class="lede">Hora de salida, precio, tamaño y todo lo confirmado, con su fuente. Desde el día 19, mapa, coleccionables, trucos y dinero rápido, actualizados varias veces al día.</p>
<div class="count" data-countdown="${site.launchISO}" aria-label="Cuenta atrás para el lanzamiento"><div><b data-d>6</b><span>días</span></div><div><b data-h>00</b><span>horas</span></div><div><b data-m>00</b><span>minutos</span></div></div>
<p class="count-note">Hasta el ${esc(site.launchLabel)}</p>
<p class="count-note" data-countdown-done hidden>Ya se puede jugar en España.</p>
<div class="actions"><a class="btn btn-primary" href="${u('/hora-de-salida-espana/')}">Ver horas en España</a><a class="btn btn-ghost" href="${u('/coleccionables/')}">Abrir el checklist</a></div>
</div><div class="hero-art">${poster}</div></div></section>
<section class="section"><div class="wrap split"><div><h2>Lo confirmado</h2><p class="side">Solo datos oficiales o de prensa especializada. Cada uno enlaza a su guía con las fuentes.</p></div>
<dl class="docket">
<div><dt>Salida en España</dt><dd><a href="${u('/hora-de-salida-espana/')}">Jueves 19 nov, 00:00 peninsular</a></dd></div>
<div><dt>Plataformas</dt><dd><a href="${u('/plataformas/')}">PS5 y Xbox Series X|S; Xbox One por la nube</a></dd></div>
<div><dt>Espacio</dt><dd><a href="${u('/tamano-descarga-precarga/')}">Hasta 212 GB, precarga abierta</a></dd></div>
<div><dt>Precio</dt><dd><a href="${u('/precio-y-ediciones/')}">79,99 € Standard, 99,99 € Ultimate</a></dd></div>
<div><dt>Protagonistas</dt><dd><a href="${u('/personajes-y-mapa/')}">Jason Duval y Lucía Caminos</a></dd></div>
<div><dt>Escenario</dt><dd><a href="${u('/personajes-y-mapa/')}">Estado de Leonida, con Vice City</a></dd></div>
</dl></div></section>
<section class="section"><div class="wrap"><h2>Guías</h2><ul class="guides">${guideRows.map(g=>`<li><a href="${u(g.href)}"><div><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p></div><span class="tag ${g.ok?'tag-ok':'tag-soon'}">${g.ok?'Disponible':'Desde el 19 nov'}</span></a></li>`).join('')}</ul></div></section>
<section class="section"><div class="wrap split"><div><h2>Últimas noticias</h2><p class="side"><a href="${u('/noticias/')}">Ver todas las noticias</a></p></div>
<ol class="news">${news.map(n=>`<li><time datetime="${new Date(n.published).toISOString()}">${fmtDay(n.published)}</time><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><p class="src">Fuente: ${n.sources.map(s=>`<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a>`).join(', ')}</p></li>`).join('')}</ol></div></section>
<section class="section"><div class="wrap split"><div><h2>Dudas rápidas</h2><p class="side"><a href="${u('/preguntas-frecuentes/')}">Todas las preguntas</a></p></div>${faqHtml(homeFaq,'').replace('<h2></h2>','').replace('class="faq"','class="faq" style="margin-top:0"')}</div></section>`;
emit('/', layout({ route:'/', title:'GTA 6 en español: hora de salida, precio, trucos y guía | '+site.name, description:'Guía no oficial de GTA 6 en español: hora de salida en España, precio, tamaño, plataformas y, desde el 19 de noviembre, mapa, coleccionables, trucos y cómo ganar dinero.', body:homeBody,
  jsonld:[{ '@context':'https://schema.org','@type':'WebSite', name:site.name, url:abs('/'), inLanguage:'es-ES', description:site.tagline, publisher:org }, faqLd(homeFaq)] }));
routes.unshift({ route:'/', updated:lastUpdated });

// 404
files['404.html'] = layout({ route:'/404', title:'Página no encontrada | '+site.name, description:'Esta página no existe.', noindex:true, body:`<section class="article wrap" style="padding-top:64px"><header><span class="kicker">Error 404</span><h1>Esta ruta no lleva a ningún sitio</h1><p class="lede">Puede que la página haya cambiado de dirección. Vuelve al inicio o mira la hora de salida.</p></header><div class="actions"><a class="btn btn-primary" href="${u('/')}">Ir al inicio</a><a class="btn btn-ghost" href="${u('/hora-de-salida-espana/')}">Hora de salida</a></div></section>` });

// escribir
fs.rmSync(OUT,{recursive:true,force:true});
for (const [f,html] of Object.entries(files)) { const p=path.join(OUT,f); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,html); }
fs.mkdirSync(path.join(OUT,'assets/fonts'),{recursive:true});
for (const f of fs.readdirSync(path.join(ROOT,'src/assets/fonts'))) fs.copyFileSync(path.join(ROOT,'src/assets/fonts',f), path.join(OUT,'assets/fonts',f));
fs.copyFileSync(path.join(ROOT,'src/app.js'), path.join(OUT,'assets/app.js'));
fs.copyFileSync(path.join(ROOT,'src/assets/favicon.svg'), path.join(OUT,'favicon.svg'));
for (const f of ['favicon.ico','apple-touch-icon.png']) if (fs.existsSync(path.join(ROOT,'src/assets',f))) fs.copyFileSync(path.join(ROOT,'src/assets',f), path.join(OUT,f));
if (fs.existsSync(path.join(ROOT,'og'))) fs.cpSync(path.join(ROOT,'og'), path.join(OUT,'og'), {recursive:true});
fs.writeFileSync(path.join(OUT,'.nojekyll'),'');
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${abs(r.route)}</loc><lastmod>${new Date(r.updated).toISOString()}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT,'og-list.json'), JSON.stringify([{slug:'home',kicker:'Guía no oficial',title:'GTA 6 en español, claro y al día'}, ...pages.map(p=>({slug:p.slug,kicker:p.kicker,title:p.title})), ...hubs.map(h=>({slug:h.slug,kicker:h.kicker,title:h.title}))],null,1));
console.log('OK', Object.keys(files).length, 'páginas ->', OUT, 'última actualización', lastUpdated);
