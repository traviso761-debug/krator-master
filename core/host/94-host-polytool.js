// ================================================================= CORE HOST — the authoring tools: inspect, polygon, path
// [web] core/host/94-host-polytool.js, opt-in (a build lists it after host.SHELL). The seed of the marks tool (ROADMAP.md
// section 10: 94 marks; GODOT-PLAN.md Phase 1: "94-host-polytool.js replaces the 93-polytool.js copies"). Moved here from
// seven biome kits' identical src/93-host-polytool.js (crater-drylands, ebadlands, ehighlands, geyser, nhighlands,
// shighlands, throne; ported there from settlements/screamers/src/93-polytool.js), onto the host: its buttons sit in the
// inspector panel, it takes the host's one click (KHOST.clickHooks) and the host's ray, and its markers skip the probe.
//
//   Inspect   click anything: the build's inspector words (KHOST.take's o.inspect)
//   Polygon   click corners; the box prints a closed [[x,y,z],...] ring
//   Path      the same but an open polyline, with a running length; New path starts another (walking routes)
// The sky (KHOST.take's o.sky.objects()) is never a corner. window.POLYTOOL = {poly, paths}, as before.
// The kits' Rings button (the gas giant's rings on and off) is a layer now: the kit hands the host a 'rings' layer.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document,THREE=root.THREE;
const insp=doc.getElementById('insp');if(!insp)throw new Error('core/host 94-host-polytool: load 92-host-panel.js first');
const bar=doc.createElement('div');bar.id='tools';insp.insertBefore(bar,insp.querySelector('pre'));
const mk=t=>{const b=doc.createElement('button');b.textContent=t;bar.appendChild(b);return b;};
const bI=mk('Inspect'),bP=mk('Polygon'),bT=mk('Path'),bNew=mk('New path'),bU=mk('Undo'),bC=mk('Clear'),bS=mk('Select');
const out=doc.createElement('textarea');out.readOnly=true;
out.style.cssText='display:none;width:100%;box-sizing:border-box;height:92px;margin-top:4px;resize:vertical;background:rgba(255,255,255,0.08);color:#f3ecd8;'+
 'border:1px solid rgba(255,255,255,0.18);border-radius:4px;font:10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace';
insp.appendChild(out);
let mode='inspect',G=null;
const poly=[],paths=[[]];                     // paths[last] is the live one
let CM,PM,CLN,PLN;
function group(){if(G||!K.host)return G;const S=K.host.scene;G=new THREE.Group();G.userData.probeSkip=true;G.userData.khost='polytool';S.add(G);
 CM=new THREE.MeshBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});PM=new THREE.MeshBasicMaterial({color:0xffb347,fog:false,depthTest:false});
 CLN=new THREE.LineBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});PLN=new THREE.LineBasicMaterial({color:0xffb347,fog:false,depthTest:false});return G;}
const fmt=a=>'['+a.map(p=>'['+p.map(v=>v.toFixed(1)).join(',')+']').join(',\n ')+']';
function draw(){
 const g=(poly.length||paths.some(P=>P.length))?group():G;
 if(g){while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose();}
  // markers scale with the orbit radius, or they vanish at 1 km and swamp the screen at 20 m
  const sc=Math.max(.6,(K.cam?K.cam.ctl.radius:600)*.005);
  const dot=(p,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(sc,10,8),m);o.position.set(p[0],p[1],p[2]);o.renderOrder=999;o.userData.probeSkip=true;o.userData.khost='polytool';g.add(o);};
  const line=(pts,m,close)=>{if(pts.length<2)return;const v=(close?pts.concat([pts[0]]):pts).map(p=>new THREE.Vector3(p[0],p[1],p[2]));
   const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),m);l.renderOrder=999;l.userData.probeSkip=true;l.userData.khost='polytool';g.add(l);};
  poly.forEach(p=>dot(p,CM));line(poly,CLN,poly.length>2);paths.forEach(P=>{P.forEach(p=>dot(p,PM));line(P,PLN,false);});}
 let txt='';
 if(mode==='polygon')txt=poly.length?fmt(poly):'';
 else if(mode==='path')txt=paths.filter(P=>P.length).map((P,i)=>'// path '+i+'\n'+fmt(P)).join('\n');
 out.value=txt;out.style.display=txt?'block':'none';}
function setMode(m){mode=m;[[bI,'inspect'],[bP,'polygon'],[bT,'path']].forEach(e=>e[0].classList.toggle('on',mode===e[1]));
 bNew.style.display=mode==='path'?'':'none';
 if(K.inspector)K.inspector(mode==='inspect'?'inspector: click a structure':(mode==='polygon'?'polygon: click corners':'path: click waypoints'));
 draw();}
bI.onclick=()=>setMode('inspect');bP.onclick=()=>setMode('polygon');bT.onclick=()=>setMode('path');
bNew.onclick=()=>{if(paths[paths.length-1].length)paths.push([]);draw();};
bU.onclick=()=>{if(mode==='polygon')poly.pop();
 else if(mode==='path'){const P=paths[paths.length-1];if(P.length)P.pop();else if(paths.length>1){paths.pop();paths[paths.length-1].pop();}}
 draw();};
bC.onclick=()=>{poly.length=0;paths.length=0;paths.push([]);draw();};
bS.onclick=()=>{out.focus();out.select();};
// the host's one click: the inspector unless a tool is on
(K.clickHooks=K.clickHooks||[]).push(function(cx,cy){if(mode==='inspect')return false;
 const H=K.host,R=K.cam.ray(cx,cy),sky=new Set(H.o.sky&&H.o.sky.objects?H.o.sky.objects().filter(Boolean):[]);
 const hits=R.intersectObjects(H.scene.children,true).filter(h=>(!h.object.userData.probeSkip||h.object.userData.inspectLabel)&&!h.object.userData.khost&&!sky.has(h.object));
 if(!hits.length){K.inspector(mode+': nothing under the cursor');return true;}
 const p=hits[0].point,at=[p.x,p.y,p.z];
 if(mode==='polygon'){poly.push(at);draw();K.inspector('polygon: '+poly.length+' point'+(poly.length===1?'':'s')+'\n'+at.map(q=>q.toFixed(1)).join(', '));return true;}
 const P=paths[paths.length-1];P.push(at);draw();let tot=0;for(let i=1;i<P.length;i++)tot+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]);
 K.inspector('path '+(paths.length-1)+': '+P.length+' pt, '+tot.toFixed(0)+' m\n'+at.map(q=>q.toFixed(1)).join(', '));return true;});
setMode('inspect');
root.POLYTOOL={poly,paths};
})(typeof window!=='undefined'?window:globalThis);
