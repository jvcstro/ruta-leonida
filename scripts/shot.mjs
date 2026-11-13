// Capturas de revisión: node scripts/shot.mjs <url> <out.png> [width] [fullPage]
import puppeteer from 'puppeteer-core';
const [url, out, w='1440', full='1'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', args:['--no-sandbox','--hide-scrollbars'] });
const p = await b.newPage(); await p.setViewport({ width:+w, height: +w<600?812:900, deviceScaleFactor: +w<600?2:1 });
await p.goto(url,{waitUntil:'networkidle0'}); await p.evaluate(()=>document.fonts.ready);
await p.screenshot({ path:out, fullPage: full==='1' }); await b.close(); console.log(out);
