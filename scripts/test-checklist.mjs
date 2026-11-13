import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:1000});
await p.goto('http://localhost:8766/coleccionables/');await p.click('input[value="test/a"]');
console.log(await p.$eval('[data-progress-text]',e=>e.textContent));
await p.reload();console.log('persist',await p.$eval('input[value="test/a"]',e=>e.checked), await p.$eval('[data-cat-count]',e=>e.textContent));
await b.close();
