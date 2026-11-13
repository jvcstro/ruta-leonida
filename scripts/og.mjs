// Genera imágenes OG 1200x630 propias (póster SVG + título) en /og y los iconos en src/assets.
import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const list = JSON.parse(fs.readFileSync(path.join(ROOT,'og-list.json'),'utf8'));
const poster = fs.readFileSync(path.join(ROOT,'src/assets/poster.svg'),'utf8');
const mark = fs.readFileSync(path.join(ROOT,'src/assets/mark.svg'),'utf8');
const font = f => 'data:font/woff2;base64,'+fs.readFileSync(path.join(ROOT,'src/assets/fonts',f)).toString('base64');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const head = `<style>@font-face{font-family:"Bricolage Grotesque";src:url(${font('bricolage.woff2')});font-weight:200 800}@font-face{font-family:"Hanken Grotesk";src:url(${font('hanken-600.woff2')});font-weight:600}
body{margin:0;width:1200px;height:630px;background:#0F0D12;color:#F6EFE6;font-family:"Hanken Grotesk";display:grid;grid-template-columns:1fr 440px;overflow:hidden}
.l{padding:64px;display:flex;flex-direction:column;justify-content:space-between}.b{display:flex;align-items:center;gap:12px;font:800 30px "Bricolage Grotesque"}.b svg{width:30px;height:36px}
.k{color:#FF6584;font-size:24px;margin-bottom:16px}h1{font:800 60px/1.04 "Bricolage Grotesque";letter-spacing:-.02em;margin:0;text-wrap:balance}.n{color:#BEB4A9;font-size:20px}
.r svg{width:440px;height:630px}</style>`;
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', args:['--no-sandbox'] });
const p = await b.newPage(); await p.setViewport({ width:1200, height:630 });
fs.mkdirSync(path.join(ROOT,'og'),{recursive:true});
for (const it of list) {
  const t = it.title.replace('GTA 6','GTA\u00a06');
  await p.setContent(`<html><head>${head}</head><body><div class="l"><div class="b">${mark}Ruta Leonida</div><div><div class="k">${esc(it.kicker)}</div><h1 style="font-size:${t.length>60?48:60}px">${esc(t)}</h1></div><div class="n">Guía no oficial en español</div></div><div class="r">${poster}</div></body></html>`,{waitUntil:'load'});
  await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({ path: path.join(ROOT,'og',it.slug+'.png') });
}
// iconos
const fav = fs.readFileSync(path.join(ROOT,'src/assets/favicon.svg'),'utf8');
for (const [size,name] of [[180,'apple-touch-icon.png'],[32,'fav32.png']]) {
  await p.setViewport({ width:size, height:size }); await p.setContent(`<html><body style="margin:0">${fav.replace('<svg ',`<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: path.join(ROOT,'src/assets',name), omitBackground:true });
}
await b.close(); console.log('OG', list.length);
