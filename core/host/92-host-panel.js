// ================================================================= CORE HOST — the panel: bar, foldable panels, layers, time, inspector, errors
// [web] core/host/92-host-panel.js (ROADMAP.md section 10). The chrome, generalised from Streetlab's city plan
// (settlements/voth/targets/voth-city/00-head.html, 55-vc-host.js: the bar with layers, legend, export and the clock's
// controls, stats, foldable panels remembered per browser, the loading note) and from the biome kits' heads (the view
// select, the hidden preset buttons verify.py clicks, the inspector line, the HUD, the #errs panel).
//
// What is on the page (ids are a contract: verify.py and tools/harness.py read #errs and click '#ui button'):
//   #bar     title, the hint, #ui (the view select #viewsel, a build's own controls, then one hidden button per preset),
//            layer toggles, the time controls (hour slider and run / hold when the build's sky takes an hour; the speeds
//            always), export buttons, a legend
//   #stats   the camera, draw calls and triangles, and the build's own lines (o.stats())
//   #insp    the inspector: click (no drag) on the scene; the build's o.inspect(hit, hits) words it
//   #errs    the error panel: KHOST.err(m); window errors land here too. A page that has one keeps it (its build fills it
//            before the host loads); it shows only when it has something in it
//   #loading the loading note: KHOST.loading(text), KHOST.loading(null); take() clears it
// Every panel folds to its title (the button at its top right), remembered per browser and build (localStorage, wrapped:
// a private window or blocked storage just forgets). ?chrome=0 hides all of it (screenshots); #errs still shows an error.
//
//   KHOST.panel(id, title, parent?, css?) -> a new foldable panel (a build's own: a timetable, a legend), hidden by ?chrome=0
//                           like the rest; css places it ('right:14px;top:180px')
//   KHOST.inspector(text), KHOST.loading(text), KHOST.err(text), KHOST.download(filename, data)
//   KHOST.chrome(on)        show or hide the chrome
//   o.layers   {name: {on?, match?(object), objects?() -> [Object3D], set?(on)}}: a toggle each. match/objects are hidden only
//              while drawing (whatever else sets their visibility, a runtime LOD, keeps doing so); set(on) is the build's own
//   o.controls [HTMLElement | {button, on(), title?, id?} | {select: [[value, label]...], id?, on(value)}] after the view select;
//              each spec gets its element as .el
//   o.exporters {name: () -> data}: a button each; the data is saved as <build>.<name>.json
//   o.legend   [[css colour, label]...]
//   o.click(x, y) -> true when the build took the click (a click-to-light, say); KHOST.clickHooks: the tools' (94)
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
const doc=root.document;
const $=id=>doc.getElementById(id);
const el=(tag,props,parent)=>{const e=doc.createElement(tag);if(props)for(const k in props){if(k==='text')e.textContent=props[k];else if(k==='cls')e.className=props[k];else e.setAttribute(k,props[k]);}if(parent)parent.appendChild(e);return e;};
const CSS=`
.pnl{position:fixed;z-index:30;background:rgba(24,21,15,0.88);color:#f3ecd8;border-radius:8px;padding:10px 12px;font:12px/1.45 Georgia,serif;box-sizing:border-box}
#bar{left:14px;top:14px;width:min(390px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto}
#bar h1{font-size:13px;margin:0 0 6px;color:#e0c98a;letter-spacing:.06em;text-transform:uppercase;font-weight:normal}
.pnl button{background:rgba(255,255,255,0.1);color:#f3ecd8;border:none;border-radius:5px;padding:4px 8px;font:inherit;font-size:11.5px;margin:3px 3px 0 0;cursor:pointer}
.pnl button:hover{background:rgba(255,255,255,0.18)}
.pnl button.on{background:#c9a227;color:#2a2416}
.pnl select{background:rgba(255,255,255,0.08);color:#f3ecd8;border:1px solid rgba(255,255,255,0.18);border-radius:4px;font:inherit;font-size:11.5px;margin:3px 3px 0 0;max-width:100%}
.pnl select option{background:#2a2416}
.pnl .k{opacity:.6;font-size:11px}
.pnl .row{margin-top:5px}
.pnl .lbl{color:#e0c98a;font-size:11px;margin-right:4px}
#ui{display:block}
#clk-hour{width:120px;vertical-align:middle}
#stats{right:14px;top:14px;width:min(300px,calc(100vw - 28px));max-height:calc(100vh - 60px);overflow:auto}
#stats pre,#insp pre{margin:0;font:11px/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;color:#e8dcc0}
#insp{left:14px;bottom:14px;width:min(520px,calc(100vw - 28px));max-height:34vh;overflow:auto}
#insp pre{color:#9fe8ff}
#errs{position:fixed;left:auto;right:14px;bottom:14px;max-width:60vw;max-height:30vh;overflow:auto;background:rgba(120,0,0,.88);color:#fff;padding:6px 9px;border-radius:6px;font:12px ui-monospace,monospace;white-space:pre-wrap;display:none;z-index:50;margin:0}
#loading{left:50%;top:45%;transform:translate(-50%,-50%);font-size:15px;display:none}
#legend i{display:inline-block;width:10px;height:10px;margin-right:4px;vertical-align:-1px;border-radius:2px}
#legend span{display:inline-block;margin:3px 8px 0 0;font-size:11px}
.pnl-min{position:absolute;top:6px;right:6px;margin:0!important;padding:0 7px!important;line-height:18px}
.pnl.min{width:auto!important;max-height:none!important;padding-right:40px}
.pnl.min > :not(.pnl-min){display:none!important}
.pnl.min::before{content:attr(data-title);color:#e0c98a;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
body.khost-nochrome .pnl,body.khost-nochrome .khost-chrome{display:none!important}
@media (max-width:760px){#stats{top:auto;bottom:14px;max-height:30vh}#insp{display:none}}
`;
el('style',{id:'khost-css',text:CSS},doc.head||doc.body);

// ---------------------------------------------------------------- the error panel (a page's own #errs is kept, with what is in it)
const errs=$('errs')||el('pre',{id:'errs'},doc.body);
K.err=function(m){errs.style.display='block';errs.textContent+=m+'\n';};
if(!root.onerror)root.onerror=(m,s,l,c,e)=>K.err((e&&e.stack)||(m+' @'+l+':'+c));
if(!K._rejections){K._rejections=true;root.addEventListener('unhandledrejection',e=>K.err('promise: '+(e.reason&&e.reason.stack||e.reason)));}

// ---------------------------------------------------------------- the panels
const FOLD=[];
K.panel=function(id,title,parent,css){let p=$(id);if(!p)p=el('div',{id},parent||doc.body);p.classList.add('pnl');p.setAttribute('data-title',title||id);if(css)p.style.cssText+=';'+css;
 const b=el('button',{cls:'pnl-min'},p);p._fold=b;FOLD.push(p);
 const paint=()=>{const on=p.classList.contains('min');b.textContent=on?'+':'–';b.title=on?'open this panel':'fold this panel';};
 b.onclick=e=>{e.stopPropagation();p.classList.toggle('min');K.foldSave();paint();};paint();p._paint=paint;return p;};
let foldKey='khost-panels';
K.foldSave=function(){const s={};FOLD.forEach(p=>{s[p.id]=p.classList.contains('min');});try{localStorage.setItem(foldKey,JSON.stringify(s));}catch(e){}};
K.foldLoad=function(key){foldKey='khost-panels:'+key;let s={};try{s=JSON.parse(localStorage.getItem(foldKey)||'{}')||{};}catch(e){}
 FOLD.forEach(p=>{if(s[p.id])p.classList.add('min');p._paint();});};

const bar=K.panel('bar','Krator');
const h1=el('h1',{text:doc.title||'Krator'},bar),hint=el('div',{cls:'k'},bar);
const ui=K.ui=$('ui')||el('div',{id:'ui'},bar);if(ui.parentNode!==bar){bar.appendChild(ui);ui.classList.add('khost-adopted');}   // a page's own #ui joins the bar
const rowLayers=el('div',{cls:'row',id:'khost-layers'},bar),rowTime=el('div',{cls:'row',id:'khost-time'},bar),rowExport=el('div',{cls:'row',id:'khost-export'},bar);
const legend=el('div',{id:'legend',cls:'k'},bar);
[rowLayers,rowTime,rowExport,legend].forEach(r=>r.style.display='none');
const stats=K.panel('stats','Stats'),statsPre=el('pre',{id:'khost-stats'},stats);
const insp=K.panel('insp','Inspector'),inspPre=el('pre',{id:'insp-text',text:'inspector: click something'},insp);
const loading=K.panel('loading','Loading');loading.removeChild(loading._fold);
const loadingText=el('span',null,loading);
K.inspector=t=>{inspPre.textContent=t;};
K.clickHooks=K.clickHooks||[];
K.loading=t=>{if(t==null){loading.style.display='none';return;}loadingText.textContent=t;loading.style.display='block';};
K.chrome=function(on){doc.body.classList.toggle('khost-nochrome',!on);};
if(/[?&#]chrome=0/.test(location.search+location.hash))K.chrome(false);
K.download=function(name,data){const s=typeof data==='string'?data:JSON.stringify(data);const a=el('a');a.href=URL.createObjectURL(new Blob([s],{type:'application/json'}));
 a.download=name;doc.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);};

const KEYS='Drag to orbit, right-drag to pan, wheel to zoom; W A S D to move, Q / E down and up, Shift faster, Ctrl slower; F to walk. '+
 'Double-click the ground to drop a pin: G flies to it, F walks from it, Esc lifts it. Click to inspect.';

// ---------------------------------------------------------------- what KHOST.take hands the panel
K.panelTake=function(H){const o=H.o,clock=H.clock,C=K.cam;
 K.foldLoad(o.build||doc.title||'page');
 h1.textContent=o.title||doc.title||'Krator';hint.textContent=(o.hint?o.hint+' · ':'')+KEYS;
 // the views: a select, the build's controls, then one hidden button per preset (verify.py clicks '#ui button')
 const names=Object.keys(H.views);
 if(names.length){const sel=el('select',{id:'viewsel',title:'the preset views'},ui);names.forEach(k=>el('option',{text:k},sel));
  sel.onchange=()=>K.go(sel.value);K.viewShown=v=>{if(sel.value!==v)sel.value=v;};}
 (o.controls||[]).forEach(c=>{
  if(c&&c.nodeType){ui.appendChild(c);return;}
  if(c.button!=null){const b=el('button',{text:c.button},ui);if(c.title)b.title=c.title;if(c.id)b.id=c.id;b.onclick=()=>c.on(b);c.el=b;return;}
  if(c.select){const s=el('select',c.id?{id:c.id}:null,ui);c.select.forEach(v=>{const op=el('option',{text:v[1]==null?v[0]:v[1]},s);op.value=v[0];});if(c.on)s.onchange=()=>c.on(s.value);c.el=s;}});
 if(names.length){const hb=el('div',null,ui);hb.style.display='none';names.forEach(k=>{const b=el('button',{text:k},hb);b.onclick=()=>K.go(k);});}
 // layers
 const L=o.layers||{};K.layers=L;
 if(o.sky&&o.sky.objects&&!L.sky)L.sky={objects:o.sky.objects};   // the sky is a layer of its own
 for(const k in L){const s=L[k];if(s.on==null)s.on=true;rowLayers.style.display='block';
  if(!rowLayers.firstChild)el('span',{cls:'lbl',text:'layers'},rowLayers);
  const b=el('button',{text:k},rowLayers);const paint=()=>b.classList.toggle('on',!!s.on);
  b.onclick=()=>{s.on=!s.on;s.cache=null;if(s.set)s.set(s.on);paint();};paint();}
 // the time controls: the speeds always (motion time); the hour slider and run / hold when the sky takes an hour
 const CO=o.clock||{},hasHour=!!(o.sky&&o.sky.hour)||!!CO.onSet,speeds=CO.speeds||[0,1,2,4,8];
 rowTime.style.display='block';
 const clk=el('span',{id:'clk',cls:'lbl'},rowTime);
 let run=null,hr=null;
 if(hasHour){run=el('button',{id:'clk-run'},rowTime);run.onclick=()=>{clock.run(!clock.running);paintT();};}
 const sp=el('span',{id:'clk-speeds'},rowTime);
 speeds.forEach(k=>{const b=el('button',{text:k===0?'pause':k+'x'},sp);b.dataset.k=k;b.title=k===0?'motion stops (wind, fauna)':'motion at '+k+' times';b.onclick=()=>{clock.scale=k;paintT();};});
 if(hasHour){hr=el('input',{id:'clk-hour',type:'range',min:0,max:24,step:.25},rowTime);hr.value=clock.hour;hr.oninput=()=>{clock.set(+hr.value);if(CO.onSet)CO.onSet(+hr.value);};}
 const paintT=()=>{if(run)run.textContent=clock.running?'hold':'run';[].forEach.call(sp.children,b=>b.classList.toggle('on',+b.dataset.k===clock.scale));};paintT();
 let shown='';
 K.clockText=function(){if(hasHour){const h=Math.floor(clock.hour),m=Math.floor((clock.hour-h)*60);return('0'+h).slice(-2)+':'+('0'+m).slice(-2)+' day '+(clock.day+1);}
  return 'motion '+Math.floor(clock.t)+' s';};
 // exporters
 const X=o.exporters||{},build=o.build||'page';
 for(const k in X){rowExport.style.display='block';const b=el('button',{text:'export '+k},rowExport);
  b.onclick=()=>{try{K.download(build+'.'+k+'.json',X[k]());}catch(e){K.err('export '+k+': '+((e&&e.stack)||e));}};}
 // legend
 if(o.legend&&o.legend.length){legend.style.display='block';legend.innerHTML=o.legend.map(e=>'<span><i style="background:'+e[0]+'"></i>'+e[1]+'</span>').join('');}
 // the inspector: the first thing under the pointer that is not skipped, worded by the build
 const ray=C.ray;
 // a click (no drag): the build's own click first (o.click(x, y) -> true when it took it), then the tools (KHOST.clickHooks),
 // then the inspector
 K.inspectAt=function(x,y){if(o.click&&o.click(x,y))return;for(const f of K.clickHooks)if(f(x,y))return;const R=ray(x,y),hide=K.hiddenSet();
  const hits=R.intersectObjects(H.scene.children,true).filter(h=>(!h.object.userData.probeSkip||h.object.userData.inspectLabel)&&!h.object.userData.khost&&!hide.has(h.object));
  if(!hits.length){K.inspector('(nothing)');return;}
  let t;try{t=o.inspect?o.inspect(hits[0],hits):K.describe(hits[0]);}catch(e){t='inspector: '+e.message;K.err('inspect: '+((e&&e.stack)||e));}
  K.inspector(t);};
 K.describe=function(h){const p=h.point,ob=h.object;let best=null;
  for(const r of H.registry){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5&&(!best||r.r<best.r))best=r;}
  return(best?best.name+'  ·  ':'')+(ob.userData.inspectLabel||ob.name||ob.type)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+H.camera.position.distanceTo(p).toFixed(0)+' m';};
 // the stats panel, rewritten only when its words change
 let statsShown='';
 K.panelFrame=function(){const c=H.camera.position,t=C.ctl.target,info=H.renderer.info.render;
  const s=(C.ctl.walk?'walk ':'cam ')+(c.x|0)+','+(c.y|0)+','+(c.z|0)+'  tgt '+(t.x|0)+','+(t.y|0)+','+(t.z|0)+'\ncalls '+info.calls+'  tris '+(info.triangles/1e6).toFixed(2)+'M'+
   (o.stats?'\n'+o.stats():'')+(C.pin?'\npin '+C.pin[0]+', '+C.pin[1]+', '+C.pin[2]:'');
  if(s!==statsShown){statsShown=s;statsPre.textContent=s;}
  const ct=K.clockText();if(ct!==shown){shown=ct;clk.textContent=ct;if(hr&&doc.activeElement!==hr)hr.value=clock.hour;paintT();}};
 if(errs.textContent.length)errs.style.display='block';
 K.loading(null);};

// ---------------------------------------------------------------- layers: hidden only while the frame draws
K.hiddenSet=function(){const out=new Set(),L=K.layers||{},S=K.host&&K.host.scene;
 for(const k in L){const s=L[k];if(s.on||s.set)continue;
  if(!s.cache){s.cache=s.objects?s.objects().filter(Boolean):[];if(s.match&&S)S.traverse(q=>{if(q!==S&&s.match(q))s.cache.push(q);});}
  s.cache.forEach(q=>out.add(q));}
 return out;};
K.layersHide=function(){const L=K.layers;if(!L)return null;let any=false;for(const k in L)if(!L[k].on&&!L[k].set)any=true;if(!any)return null;
 const hid=[];K.hiddenSet().forEach(q=>{hid.push([q,q.visible]);q.visible=false;});return hid;};
K.layersShow=function(hid){for(let i=0;i<hid.length;i++)hid[i][0].visible=hid[i][1];};
})(typeof window!=='undefined'?window:globalThis);
