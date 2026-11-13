(function(){
  var rtf = window.Intl && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('es',{numeric:'auto'}) : null;
  function rel(iso){
    var d=(new Date(iso)-Date.now())/1000, a=Math.abs(d);
    var u=[[60,'second',1],[3600,'minute',60],[86400,'hour',3600],[604800,'day',86400],[2629800,'week',604800],[31557600,'month',2629800]];
    for(var i=0;i<u.length;i++){ if(a<u[i][0]) return rtf?rtf.format(Math.round(d/u[i][2]),u[i][1]):''; }
    return rtf?rtf.format(Math.round(d/31557600),'year'):'';
  }
  function tickRel(){ document.querySelectorAll('[data-rel]').forEach(function(el){ var t=rel(el.getAttribute('datetime')); if(t) el.textContent=(el.dataset.prefix||'')+t; }); }
  tickRel(); setInterval(tickRel,60000);

  var c=document.querySelector('[data-countdown]');
  if(c){
    var target=new Date(c.dataset.countdown).getTime();
    var f={d:c.querySelector('[data-d]'),h:c.querySelector('[data-h]'),m:c.querySelector('[data-m]')};
    var done=document.querySelector('[data-countdown-done]');
    var tick=function(){
      var s=Math.max(0,Math.floor((target-Date.now())/1000));
      if(s===0){ c.hidden=true; if(done) done.hidden=false; return; }
      f.d.textContent=Math.floor(s/86400); f.h.textContent=String(Math.floor(s%86400/3600)).padStart(2,'0'); f.m.textContent=String(Math.floor(s%3600/60)).padStart(2,'0');
    };
    tick(); setInterval(tick,15000);
  }

  var list=document.querySelector('[data-checklist]');
  if(list){
    var KEY='rl-checklist-v1', state={};
    try{ state=JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){}
    var boxes=list.querySelectorAll('input[type=checkbox]');
    var bar=document.querySelector('[data-progress-bar]'), txt=document.querySelector('[data-progress-text]');
    function update(){
      var n=0; boxes.forEach(function(b){ if(b.checked) n++; });
      if(bar) bar.style.width=(boxes.length? n/boxes.length*100:0)+'%';
      if(txt) txt.textContent=n+' de '+boxes.length+' encontrados';
      list.querySelectorAll('.cat').forEach(function(cat){
        var all=cat.querySelectorAll('input'), k=0; all.forEach(function(b){ if(b.checked) k++; });
        var s=cat.querySelector('[data-cat-count]'); if(s) s.textContent=k+' / '+all.length;
      });
    }
    boxes.forEach(function(b){
      b.checked=!!state[b.value];
      b.addEventListener('change',function(){ if(b.checked) state[b.value]=1; else delete state[b.value]; try{ localStorage.setItem(KEY,JSON.stringify(state)); }catch(e){} update(); });
    });
    var r=document.querySelector('[data-reset]');
    if(r) r.addEventListener('click',function(){ if(!confirm('¿Borrar todo tu progreso de esta lista?')) return; state={}; try{ localStorage.removeItem(KEY); }catch(e){} boxes.forEach(function(b){ b.checked=false; }); update(); });
    update();
  }
})();
