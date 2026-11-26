// ================================================================= OPEN WORLD: the resources panel, its map layers and markers
// [web] The page's face of core/world/49r-world-resources.js (WRES): a "resources" button opens a panel with the region's
// census (the scale model's geology, kits/resources/data/geology.json, and the farmland the world's fields give), a map
// of any layer (the best ore, farmland, timber, stone, water, each family) with the richest spots marked, and a list of
// those spots to go to. The spots are also the page's marks (window.MAP_MARKS: diamonds on the minimap, "Go to" entries:
// this runs before 90-world-camera.js builds them) and, while the panel is open, beacons standing in the world. The
// layers are also the minimap's overlays (window.MAP_LAYERS, which 90 lists after its own).
var RESMAP;LATE.push(()=>{RESMAP=(function(){'use strict';
if(typeof WRES==='undefined')return null;
const M=WORLD_DATA.meta,$=id=>document.getElementById(id),B=M.frame.box_px,W=B[2]-B[0],Hh=B[3]-B[1],t0=performance.now();
const C=WRES.census(),MK=WRES.markers();
const COL={mining:'#ff8a3d',farm:'#7ee06a',unique:'#d68cff'},LEG={mining:'the richest ore and fuel',farm:'the best farmland',unique:'unique: placers, vents, rare rock, ruin ground'};
window.MAP_MARKS=(window.MAP_MARKS||[]).concat(MK.map(m=>({x:m.x,z:m.z,label:m.label,color:COL[m.kind],legend:LEG[m.kind],view:[m.x-900,m.z+1300,450,0,-.3]})));
/* the layers, for this panel and the minimap: a raster at the map's pixels (2 km), made once each, a layer at a time */
const LAY=WRES.layers.map(L=>Object.assign({},L));
function raster(L){if(L.ras)return L.ras;const R=new Float32Array(W*Hh);
 const big=W*Hh>60000,st=L.id==='farm'&&big?2:1;   /* farmland reads the world's fields: every second pixel on a big region */
 for(let j=0;j<Hh;j+=st)for(let i=0;i<W;i+=st){const [x,z]=WORLD.fromPx(B[0]+i+.5,B[1]+j+.5),v=WORLD.inside(x,z)?L.at(x,z):-1;
  for(let dj=0;dj<st&&j+dj<Hh;dj++)for(let di=0;di<st&&i+di<W;di++)R[(j+dj)*W+i+di]=v;}
 return(L.ras=R);}
/* linear above a floor (a byte under ~50 reads as none), so the rich ground stands out from the merely present */
const ramp=(L,v)=>{if(v<0)return[24,20,18];const a=L.ramp[0],b=L.ramp[1],t=Math.max(0,Math.min(1,(v-.2)/.8));return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];};
window.MAP_LAYERS=LAY.map(L=>({label:'resources: '+L.label,color:(k)=>ramp(L,raster(L)[k]),ramp:L.ramp,legend:'<b>'+L.label+'</b> · dark none → bright rich (scale model geology'+(L.id==='farm'?'; farmland from the world\'s fields':'')+')'}));
/* ---------------------------------------------------------------- the panel */
const css=document.createElement('style');css.textContent=
 '#resp{position:fixed;left:10px;top:120px;z-index:6;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:8px 10px;display:none;'+
 'max-height:calc(100vh - 140px);overflow:auto;width:min(460px,calc(100vw - 20px));font:12px system-ui,sans-serif}'+
 '#resp h3{margin:0 0 4px;font:600 13px system-ui,sans-serif}#resp small{color:var(--mute)}#resp canvas{width:100%;image-rendering:pixelated;cursor:crosshair;border:1px solid var(--line);margin:4px 0}'+
 '#resp table{border-collapse:collapse;width:100%;font:11px ui-monospace,monospace}#resp td,#resp th{padding:1px 4px;text-align:right}#resp td:first-child,#resp th:first-child{text-align:left}'+
 '#resp th{color:var(--mute);font-weight:400;border-bottom:1px solid var(--line)}#resp tr.g td{color:var(--accent);padding-top:5px}'+
 '#resp .mk{cursor:pointer;padding:1px 0}#resp .mk:hover{color:#fff}#resp select{width:100%}';
document.head.appendChild(css);
const P=document.createElement('div');P.id='resp';document.body.appendChild(P);
const bar=document.querySelector('#ui .bar'),btn=document.createElement('button');btn.id='bRes';btn.textContent='resources';btn.setAttribute('aria-pressed','false');bar.appendChild(btn);
const fmt=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(n);
function table(){const G=[['metal','Ores'],['fuel','Fuels'],['mineral','Minerals and salts'],['basic','Basics'],['rock','Rocks']];
 let h='<table><tr><th>family</th><th>mean</th><th>good km²</th><th>rich km²</th><th>~nodes</th><th>peak</th></tr>';
 for(const [g,name] of G){const rows=WRES.families.filter(F=>F.group===g).map(F=>({F,E:C.families[F.f]})).filter(q=>q.E.mean>=.5||q.E.good_km2>0).sort((a,b)=>b.E.mean-a.E.mean);
  if(!rows.length)continue;h+='<tr class="g"><td colspan="6">'+name+'</td></tr>';
  for(const {F,E} of rows)h+='<tr><td>'+F.label+'</td><td>'+E.mean.toFixed(0)+'</td><td>'+fmt(E.good_km2)+'</td><td>'+fmt(E.rich_km2)+'</td><td>'+(F.group==='basic'||F.group==='rock'?'':fmt(E.nodes))+'</td><td>'+(E.peak?E.peak.byte:0)+'</td></tr>';}
 return h+'</table>';}
const prov=Object.keys(C.provinces).sort((a,b)=>C.provinces[b]-C.provinces[a]).map(k=>k+' '+fmt(C.provinces[k])).join(' · ');
P.innerHTML='<h3>Resources of the region</h3><small>'+fmt(C.area_km2)+' km² inside the cut · the scale model\'s geology (kits/resources, 4 km cells; bytes 0-255: good ≥ 100, rich ≥ 170; ~nodes: the deposits the node field keeps) · farmland from the world\'s climate and ground</small>'+
 '<div style="margin-top:6px"><select id="resLayer" aria-label="Resource layer">'+LAY.map((L,i)=>'<option value="'+i+'">map: '+L.label+'</option>').join('')+'</select></div>'+
 '<canvas id="resMap"></canvas><div id="resLeg"><small>click the map to go there</small></div>'+
 '<h3 style="margin-top:8px">The richest spots</h3><div id="resMk"></div>'+
 '<h3 style="margin-top:8px">Census</h3><div><b>Farmland</b> · mean '+Math.round(C.farm.mean*100)+'% · good '+fmt(C.farm.good_km2)+' km² · best '+fmt(C.farm.best_km2)+' km²</div>'+
 '<div><b>Rock provinces</b> · '+(prov||'?')+'</div><div><b>Placers</b> · gold '+(C.placers.gold||0)+' · tin '+(C.placers.tin||0)+' · <b>Ancient ruin ground</b> '+fmt(C.ruin_km2)+' km² · <b>vents</b> '+C.vents+'</div>'+table();
const cv=$('resMap'),g=cv.getContext('2d');cv.width=W;cv.height=Hh;let cur=0;
function paint(){const L=LAY[cur],R=raster(L),id=g.createImageData(W,Hh),d=id.data;
 for(let k=0;k<W*Hh;k++){const c=ramp(L,R[k]);d[k*4]=c[0];d[k*4+1]=c[1];d[k*4+2]=c[2];d[k*4+3]=255;}g.putImageData(id,0,0);
 g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.beginPath();M.region.points_px.forEach((p,i)=>{const X=p[0]-B[0],Y=p[1]-B[1];i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();g.stroke();
 const r=Math.max(3,W/90);
 for(const m of MK){const X=WORLD.px(m.x)-B[0],Y=WORLD.py(m.z)-B[1];g.fillStyle=COL[m.kind];g.strokeStyle='#000';g.beginPath();g.moveTo(X,Y-r*1.3);g.lineTo(X+r,Y);g.lineTo(X,Y+r*1.3);g.lineTo(X-r,Y);g.closePath();g.fill();g.stroke();}
 for(const p of PLACES.list){if(!p.build&&!p.cand)continue;const X=p.px-B[0],Y=p.py-B[1];g.fillStyle='#fff';g.beginPath();g.arc(X,Y,r*.7,0,Math.PI*2);g.fill();}
 $('resLeg').innerHTML='<small><b>'+L.label+'</b>: dark none → bright rich · ◆ <span style="color:'+COL.mining+'">mining</span> <span style="color:'+COL.farm+'">farmland</span> <span style="color:'+COL.unique+'">unique</span> · ● towns · click to go</small>';}
function go(m){if(!CAM)return;CAM.setView(m.x-900,m.z+1300,450,0,-.3);CAM.lookAt(m.x,WORLD.H(m.x,m.z)+8,m.z);}
$('resMk').innerHTML=MK.map((m,i)=>'<div class="mk" data-i="'+i+'"><span style="color:'+COL[m.kind]+'">◆</span> '+m.label+' <small>· '+m.why+'</small></div>').join('')||'<small>none found</small>';
P.querySelectorAll('.mk').forEach(el=>el.onclick=()=>go(MK[+el.dataset.i]));
$('resLayer').onchange=()=>{cur=+$('resLayer').value;paint();$('resLayer').blur();};
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),px=B[0]+(e.clientX-r.left)/r.width*W,py=B[1]+(e.clientY-r.top)/r.height*Hh,[x,z]=WORLD.fromPx(px,py);
 if(CAM)CAM.setView(x,z,Math.max(600,Math.min(6000,HOST.camera.position.y-WORLD.H(HOST.camera.position.x,HOST.camera.position.z))),CAM.st.yaw,CAM.st.pitch);});
/* the beacons: a tall translucent column at each spot, standing while the panel is open */
const BEAC=new THREE.Group();BEAC.visible=false;HOST.scene.add(BEAC);
for(const m of MK){const col=new THREE.Mesh(new THREE.CylinderGeometry(25,25,900,8,1,true).translate(0,450,0),new THREE.MeshBasicMaterial({color:COL[m.kind],transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide}));
 col.position.set(m.x,WORLD.H(m.x,m.z),m.z);col.name='resource beacon '+m.id;col.userData.inspectLabel=m.label;BEAC.add(col);}
let painted=false;
btn.onclick=()=>{const on=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',on);P.style.display=on?'block':'none';
 if(on){const t=Math.round(document.getElementById('ui').getBoundingClientRect().bottom+6);P.style.top=t+'px';P.style.maxHeight='calc(100vh - '+(t+20)+'px)';}   /* below the bar, however it wraps */BEAC.visible=on;if(on&&!painted){paint();painted=true;}btn.blur();};
const ms=Math.round(performance.now()-t0);
window._resources={census:C,markers:MK,layers:LAY.map(L=>L.id),checks:WRES.checks,ms,paint:()=>{paint();painted=true;return true;},
 open:()=>{if(btn.getAttribute('aria-pressed')!=='true')btn.onclick();return true;}};
return{census:C,markers:MK,ms};})();});
