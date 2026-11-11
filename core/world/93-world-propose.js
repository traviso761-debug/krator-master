// ================================================================= OPEN WORLD: proposing a site
// [web] The owner's tool for a new site (2026-11-11: "propose a site; this can then be fleshed out, and also added to the
// scale model"). "propose" in the bar, then a click on the ground (or the minimap) places it; the form takes its name,
// type (the scale model's settlement types, and camp), culture, reach (the site's square's half-size, km) and notes, and
// shows the ground's assessment: where it is on the map (5.1 px), height, slope, climate, biome, rock province, the
// farmland and the best of the geology within its reach (core/world/49r-world-resources.js WRES.assess), the nearest
// river, road and settlement. Proposals are kept in this browser (localStorage, per region), drawn on the minimap, and
// leave the page three ways: "export" (a 'krator-site-proposals' file), "copy", or "send" to the edit queue when the page
// is served by tools/edits/serve.py (POST /__edits: the proposal rides in the note's record). From there
// tools/scale-model/propose_site.py makes it a site of openworld/SITES.json (state 'proposed') and a settlement of the
// scale model (60-settlements.js: its default list and a SETT_ADDED version), so cut_site.py and the planners take it up.
//   record {format: 'krator-site-proposal', version: 1, id, name, type, culture, reach_km, notes, region, map: '5.1',
//           px, py (5.1 map px), x, z, h (this region's frame), created, assessment}
var PROPOSE;LATE.push(()=>{PROPOSE=(function(){'use strict';
const M=WORLD_DATA.meta,$=id=>document.getElementById(id),region=(M.cut&&M.cut.region)||(M.region&&M.region.name)||'region';
const KEY='krator.proposals.'+region,TYPES=['city','village','outpost','camp','cavern','arcology','ruin','ruined arcology'],REACH={city:30,village:15,outpost:8,camp:8};
const load=()=>{try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):[];}catch(e){return[];}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(LIST));}catch(e){}marks();};
let LIST=load(),draft=null,on=false;
const fnv=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* the proposals on the minimap (window.MAP_MARKS is read every frame) */
const BASEMARKS=(window.MAP_MARKS||[]).slice();
function marks(){window.MAP_MARKS=BASEMARKS.concat(LIST.map(p=>({x:p.x,z:p.z,label:'proposed: '+p.name,color:'#5fe0ff',legend:'proposed sites'})),
 draft?[{x:draft.x,z:draft.z,label:'proposal (unsaved)',color:'#ffffff',legend:'the proposal you are placing'}]:[]);
 /* the marks are drawn every few frames (90 drawMap); the legend is repainted with the base, once the map has its raster */
 if(painted&&CAM)CAM.paintBase();}
let painted=false;
/* ---------------------------------------------------------------- the ground's assessment */
function nearest(x,z){const out={};let d=1e18,n=null;
 for(const r of M.rivers||[]){if(r.depth_m!=null&&!(r.depth_m>0))continue;for(const p of r.line){const q=Math.hypot(p[0]-x,p[1]-z);if(q<d){d=q;n=r.name;}}}
 if(n)out.river={name:n,km:Math.round(d/100)/10};d=1e18;n=null;
 for(const R of (WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[])for(const p of R.pts){const q=Math.hypot(p[0]-x,p[1]-z);if(q<d){d=q;n=R.id||R.name||'a road';}}
 if(n)out.road={id:n,km:Math.round(d/100)/10};d=1e18;n=null;
 for(const p of PLACES.list){const q=Math.hypot(p.x-x,p.z-z);if(q<d){d=q;n=p.name+' ('+p.type+')';}}
 if(n)out.settlement={name:n,km:Math.round(d/100)/10};return out;}
function assess(x,z,reach){const A=typeof WRES!=='undefined'?WRES.assess(x,z,reach*1000):{x:Math.round(x),z:Math.round(z),px:WORLD.px(x),py:WORLD.py(z),h:Math.round(WORLD.H(x,z))};
 return Object.assign(A,{nearest:nearest(x,z)});}
function text(A){const L=[];
 L.push('map 5.1 px '+A.px+', '+A.py+' · '+A.h+' m'+(A.slope!=null?' · slope '+A.slope:'')+(A.inside===false?' · OUTSIDE the region':'')+(A.dry===false?' · IN WATER':''));
 if(A.clim)L.push((A.biome||'?')+' · '+A.clim+' · '+A.rain+' mm/yr · '+A.temp+' °C · '+(A.province||'?')+' ground'+(A.ruin?' · Ancient ruin ground':''));
 if(A.farm)L.push('farmland within reach: mean '+Math.round(A.farm.mean*100)+'%, '+Math.round(A.farm.good_share*100)+'% of it good');
 if(A.basics)L.push('stone '+A.basics.stone+' · clay '+A.basics.clay+' · timber '+A.basics.wood+' · water '+A.basics.water+' (0-255)');
 if(A.top)L.push('the best within reach: '+(A.top.length?A.top.map(q=>q.label+' '+q.max).join(', '):'no deposit of note'));
 const N=A.nearest||{};L.push('nearest: '+[N.river&&('river '+N.river.name+' '+N.river.km+' km'),N.road&&('road '+N.road.km+' km'),N.settlement&&(N.settlement.name+' '+N.settlement.km+' km')].filter(Boolean).join(' · '));
 return L.join('\n');}
/* ---------------------------------------------------------------- the panel */
const css=document.createElement('style');css.textContent=
 '#propp{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;z-index:7;background:var(--panel);border:1px solid #5fe0ff;border-radius:4px;padding:8px 10px;display:none;'+
 'width:min(560px,calc(100vw - 20px));max-height:60vh;overflow:auto;font:12px system-ui,sans-serif}'+
 '#propp input,#propp select,#propp textarea{background:#0e0a08;color:var(--text);border:1px solid var(--line);border-radius:3px;font:12px system-ui,sans-serif;padding:3px 5px;box-sizing:border-box}'+
 '#propp .row{display:flex;gap:6px;margin:3px 0;flex-wrap:wrap}#propp .row>*{flex:1 1 120px}#propp pre{white-space:pre-wrap;font:11px ui-monospace,monospace;color:#cfe9f2;margin:4px 0}'+
 '#propp button{background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:4px;padding:4px 8px;cursor:pointer}#propp button:hover{background:#2c5a66}'+
 '#propp .it{display:flex;gap:6px;align-items:center;padding:2px 0;border-top:1px solid rgba(255,255,255,.08)}#propp .it span{flex:1}#propp small{color:var(--mute)}';
document.head.appendChild(css);
const P=document.createElement('div');P.id='propp';document.body.appendChild(P);
const cult=(typeof KTAGS!=='undefined'&&KTAGS.VOCAB&&KTAGS.VOCAB.cultures)||[];
P.innerHTML='<div><b>Propose a site</b> <small>· click the ground or the minimap to place it; saved proposals stay in this browser</small></div>'+
 '<div id="pDraft" style="display:none"><div class="row"><input id="pName" placeholder="name"><select id="pType">'+TYPES.map(t=>'<option>'+t+'</option>').join('')+'</select>'+
 '<input id="pCult" list="pCults" placeholder="culture"><datalist id="pCults">'+cult.map(c=>'<option value="'+esc(c)+'">').join('')+'</datalist>'+
 '<input id="pReach" type="number" min="2" max="200" step="1" title="reach: the site\'s square\'s half-size, km"></div>'+
 '<textarea id="pNotes" rows="2" style="width:100%" placeholder="notes: what it is, who lives there, why here"></textarea><pre id="pAss"></pre>'+
 '<div class="row" style="flex:0"><button id="pSave">save proposal</button><button id="pCancel">cancel</button></div></div>'+
 '<div id="pList"></div><div class="row" style="margin-top:4px"><button id="pExport">export JSON</button><button id="pCopy">copy JSON</button><button id="pSend">send to the edit queue</button></div><div><small id="pMsg"></small></div>';
const bar=document.querySelector('#ui .bar'),btn=document.createElement('button');btn.id='bProp';btn.textContent='propose';btn.setAttribute('aria-pressed','false');
btn.title='Propose a new site: click the ground or the minimap';bar.appendChild(btn);
const msg=t=>{$('pMsg').textContent=t;};
function list(){$('pList').innerHTML=LIST.length?'<div style="margin-top:4px"><b>Proposals in '+esc(region)+'</b></div>'+LIST.map((p,i)=>'<div class="it"><span>'+esc(p.name)+' · '+esc(p.type)+(p.culture?' · '+esc(p.culture):'')+
 ' · px '+p.px+', '+p.py+(p.sent?' · <small>sent</small>':'')+'</span><button data-go="'+i+'">go</button><button data-del="'+i+'">delete</button></div>').join(''):'<small>no proposals yet</small>';
 $('pList').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const p=LIST[+b.dataset.go];CAM.setView(p.x-700,p.z+1000,350,0,-.3);CAM.lookAt(p.x,WORLD.H(p.x,p.z)+10,p.z);});
 $('pList').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{LIST.splice(+b.dataset.del,1);save();list();});}
function refresh(){if(!draft)return;const r=+$('pReach').value||REACH[$('pType').value]||15;draft.assessment=assess(draft.x,draft.z,r);$('pAss').textContent=text(draft.assessment);}
function place(x,z){draft={x,z};$('pDraft').style.display='block';if(!$('pReach').value)$('pReach').value=REACH[$('pType').value]||15;refresh();marks();$('pName').focus();}
$('pType').onchange=()=>{$('pReach').value=REACH[$('pType').value]||10;refresh();};$('pReach').onchange=refresh;
$('pCancel').onclick=()=>{draft=null;$('pDraft').style.display='none';marks();};
function record(){const name=$('pName').value.trim()||'unnamed site',type=$('pType').value,A=draft.assessment,px=Math.round(WORLD.px(draft.x)*10)/10,py=Math.round(WORLD.py(draft.z)*10)/10;
 return{format:'krator-site-proposal',version:1,id:'prop-'+fnv(region+'|'+px+'|'+py+'|'+name),name,type,culture:$('pCult').value.trim()||null,reach_km:+$('pReach').value||REACH[type]||15,
  notes:$('pNotes').value.trim(),region,map:(M.cut&&M.cut.map)||'5.1',px,py,x:Math.round(draft.x),z:Math.round(draft.z),h:Math.round(WORLD.H(draft.x,draft.z)),created:new Date().toISOString(),assessment:A};}
$('pSave').onclick=()=>{if(!draft)return;const R=record();const i=LIST.findIndex(p=>p.id===R.id);if(i>=0)LIST[i]=R;else LIST.push(R);
 draft=null;$('pDraft').style.display='none';['pName','pNotes','pCult'].forEach(k=>$(k).value='');save();list();msg('saved '+R.name+' ('+R.id+')');};
const bundle=()=>({format:'krator-site-proposals',version:1,region,map:(M.cut&&M.cut.map)||'5.1',page:location.pathname.split('/').pop(),proposals:LIST});
$('pExport').onclick=()=>{const b=new Blob([JSON.stringify(bundle(),null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);
 a.download='krator-site-proposals-'+region+'.json';document.body.appendChild(a);a.click();a.remove();msg('exported '+LIST.length+' proposals');};
$('pCopy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(bundle(),null,1));msg('copied');}catch(e){msg('the clipboard is not available here: use export');}};
$('pSend').onclick=async()=>{const todo=LIST.filter(p=>!p.sent);if(!todo.length){msg('nothing new to send');return;}let n=0;
 for(const p of todo){try{const r=await fetch('/__edits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:location.pathname,
   note:'site proposal: '+p.name+' ('+p.type+(p.culture?', '+p.culture:'')+') at 5.1 px '+p.px+','+p.py+(p.notes?': '+p.notes:''),point:[p.x,p.h,p.z],kind:'site-proposal',proposal:p})});
  if(r.ok){p.sent=true;n++;}}catch(e){}}
 save();list();msg(n?'sent '+n+' to the edit queue (python3 tools/edits/pending.py; then tools/scale-model/propose_site.py --edits)':'the edit queue did not answer: serve the page with python3 tools/edits/serve.py, or export');};
/* placing: a click on the ground (not a drag) or on the minimap while the tool is on */
const cv=HOST.renderer.domElement;let down=null;
cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
cv.addEventListener('click',e=>{if(!on||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4)return;const p=CAM&&CAM.pick(e);if(p)place(p.x,p.z);});
$('minimap').addEventListener('click',e=>{if(!on)return;const r=$('minimap').getBoundingClientRect(),B=M.frame.box_px,
 px=B[0]+(e.clientX-r.left)/r.width*(B[2]-B[0]),py=B[1]+(e.clientY-r.top)/r.height*(B[3]-B[1]),[x,z]=WORLD.fromPx(px,py);place(x,z);});
btn.onclick=()=>{on=!on;painted=true;btn.setAttribute('aria-pressed',on);P.style.display=on?'block':'none';if(on)list();btn.blur();};
marks();
window._propose={list:()=>LIST,place,record:()=>draft&&record(),assess,text,region,
 /* the check verify reads: a proposal placed and assessed here (the town's own point) is whole and lands on its own pixel */
 check:neg=>{const S=(M.sites||[])[0]||{x:0,z:0},A=assess(S.x,S.z,15),px=neg==='px'?A.px+5:A.px,ok=Math.abs(px-WORLD.px(S.x))<.11&&A.h!=null&&!!(A.nearest&&A.nearest.settlement)&&(typeof WRES==='undefined'||!!A.farm);
  return{name:'proposing a site: the tool places and assesses a point (its map pixel, ground, resources, nearest places)',ok,detail:'px '+A.px+', '+A.py+' · '+text(A).split('\n').slice(1,3).join(' · ')};}};
return{list:()=>LIST};})();});
