// ================================================================= OPEN WORLD — the camera, the map, the inspector and the polygon tool
// [web] Fly anywhere in the region (drag to look, WASD, Q/E, Shift; the speed follows the height above the ground),
// or walk (G) at eye height on the ground the terrain draws. "Go to" lists the scale model's settlements, the canyon
// candidates, and one spot in each kit's biome. The minimap is the region's biome overlays (after the nearest-overlay
// fill) over its relief, with the polygon, the settlements and the camera; click it to go there.
// The inspector (I) names what is under the cursor: the ground's sample (biome, climate class, rain, temperature,
// pressure, the fields the kits read) and the nearest plant's species, kit and tags. The polygon tool (P) collects
// clicked points as world metres and scale-model pixels to copy.
var CAM;LATE.push(()=>{CAM=(function(){'use strict';
const camera=HOST.camera,renderer=HOST.renderer,M=WORLD_DATA.meta,$=id=>document.getElementById(id);
const st={yaw:0,pitch:-.25,walk:false,speedK:1,insp:false,poly:false};
const keys={};let drag=null;
function setView(x,z,agl,yaw,pitch){const g=WORLD.H(x,z);camera.position.set(x,Math.max(g,WORLD.water(x,z))+agl,z);st.yaw=yaw;st.pitch=pitch;apply();}
function apply(){camera.rotation.order='YXZ';camera.rotation.set(st.pitch,st.yaw,0);camera.updateMatrixWorld();}
function lookAt(x,y,z){const P=camera.position,dx=x-P.x,dy=y-P.y,dz=z-P.z;st.yaw=Math.atan2(-dx,-dz);st.pitch=Math.atan2(dy,Math.hypot(dx,dz));apply();}
const cv=renderer.domElement;
cv.addEventListener('mousedown',e=>{drag={x:e.clientX,y:e.clientY,moved:0};});
addEventListener('mouseup',e=>{if(drag&&drag.moved<4)click(e);drag=null;});
addEventListener('mousemove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);drag.x=e.clientX;drag.y=e.clientY;
  st.yaw-=dx*.0035;st.pitch=Math.max(-1.55,Math.min(1.5,st.pitch-dy*.0035));apply();}
 if(st.insp&&!drag)inspect(e);});
// the wheel zooms: toward the ground under the cursor, a fifth of the way per notch, down to eye height (1.7 m).
// Shift+wheel changes the flying speed instead.
cv.addEventListener('wheel',e=>{e.preventDefault();
 if(e.shiftKey){st.speedK=Math.max(.05,Math.min(40,st.speedK*(e.deltaY>0?.8:1.25)));return;}
 const P=camera.position,hit=pick(e),g=ground(P.x,P.z),agl=Math.max(1.7,P.y-g),k=e.deltaY>0?-.25:.2;
 const tx=hit?hit.x:P.x,ty=hit?hit.y:g,tz=hit?hit.z:P.z,d=Math.hypot(tx-P.x,ty-P.y,tz-P.z);
 // out: pull back and up (a third of the height above the ground or more), whatever the cursor is on
 if(k<0){const s=Math.max(5,agl*.35);P.x-=-Math.sin(st.yaw)*s*.6;P.z-=-Math.cos(st.yaw)*s*.6;P.y+=s;apply();return;}
 if(d<3)return;
 // in: a fifth of the way to the point under the cursor, never through it
 const step=Math.min(d-2,Math.max(1,d*k));
 const ux=(tx-P.x)/d,uy=(ty-P.y)/d,uz=(tz-P.z)/d;P.x+=ux*step;P.y+=uy*step;P.z+=uz*step;
 P.y=Math.max(P.y,ground(P.x,P.z)+1.7);if(st.walk)P.y=ground(P.x,P.z)+1.7;},{passive:false});
function toGround(){const P=camera.position;P.y=ground(P.x,P.z)+1.7;st.pitch=Math.max(-.2,Math.min(.15,st.pitch));apply();}
$('bGround').onclick=toGround;
cv.addEventListener('touchstart',e=>{const t=e.touches[0];drag={x:t.clientX,y:t.clientY,moved:0};},{passive:true});
cv.addEventListener('touchmove',e=>{const t=e.touches[0];if(!drag)return;const dx=t.clientX-drag.x,dy=t.clientY-drag.y;drag.x=t.clientX;drag.y=t.clientY;st.yaw-=dx*.004;st.pitch=Math.max(-1.55,Math.min(1.5,st.pitch-dy*.004));apply();},{passive:true});
addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA'))return;keys[e.code]=true;
 if(e.code==='KeyG')toggleWalk();if(e.code==='KeyF')toGround();if(e.code==='KeyI')toggleInsp();if(e.code==='KeyP')togglePoly();});
addEventListener('keyup',e=>{keys[e.code]=false;});
const ground=(x,z)=>Math.max(TERRAIN.heightDrawn(x,z),WORLD.water(x,z));
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function update(dt){const P=camera.position,g=ground(P.x,P.z),agl=Math.max(1,P.y-g);
 let v=st.walk?(keys.ShiftLeft||keys.ShiftRight?22:5.5):Math.min(60000,Math.max(12,agl*.9))*(keys.ShiftLeft||keys.ShiftRight?5:1);v*=st.speedK;
 fw.set(-Math.sin(st.yaw),0,-Math.cos(st.yaw));rt.set(Math.cos(st.yaw),0,-Math.sin(st.yaw));
 let mx=0,mz=0,my=0;if(keys.KeyW)mz+=1;if(keys.KeyS)mz-=1;if(keys.KeyD)mx+=1;if(keys.KeyA)mx-=1;if(keys.KeyE)my+=1;if(keys.KeyQ)my-=1;
 if(keys.ArrowLeft)st.yaw+=1.4*dt;if(keys.ArrowRight)st.yaw-=1.4*dt;if(keys.ArrowUp)st.pitch=Math.min(1.5,st.pitch+dt);if(keys.ArrowDown)st.pitch=Math.max(-1.55,st.pitch-dt);
 P.addScaledVector(fw,mz*v*dt).addScaledVector(rt,mx*v*dt);
 if(st.walk)P.y=ground(P.x,P.z)+1.7;else{P.y+=my*v*dt;P.y=Math.max(P.y,ground(P.x,P.z)+1.2);}
 const B=WORLD.box();P.x=Math.max(B[0],Math.min(B[2],P.x));P.z=Math.max(B[1],Math.min(B[3],P.z));P.y=Math.min(P.y,400000);
 apply();}
function toggleWalk(){st.walk=!st.walk;$('bWalk').setAttribute('aria-pressed',st.walk);}
function toggleInsp(){st.insp=!st.insp;$('bInsp').setAttribute('aria-pressed',st.insp);$('insp').style.display=st.insp?'block':'none';}
function togglePoly(){st.poly=!st.poly;$('bPoly').setAttribute('aria-pressed',st.poly);$('poly').style.display=st.poly?'block':'none';}
$('bWalk').onclick=toggleWalk;$('bInsp').onclick=toggleInsp;$('bPoly').onclick=togglePoly;
$('bFlora').onclick=()=>{const b=$('bFlora'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);FLORA.setOn(on);FLOOR.setOn(on);};
// ---------------------------------------------------------------- picking the ground
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(e){const r=cv.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);
 const h=ray.intersectObjects(TERRAIN.meshes(),false)[0];return h?h.point:null;}
const f1=v=>Math.round(v*100)/100;
function inspect(e){const p=pick(e),el=$('insp');if(!p){el.textContent='inspector: the sky';return;}
 const A=WORLD.at(p.x,p.z),b=WORLD.biomeAt(p.x,p.z),cl=WORLD.climate(p.x,p.z),kits=WORLD.KITS.map((k,i)=>[k,WORLD.kitW(i,p.x,p.z)]).filter(q=>q[1]>.01).map(q=>q[0]+' '+f1(q[1])).join(', ')||'none';
 const fl=FLORA.nearest(p.x,p.z,12);
 let t='ground · '+(b?b.name:'?')+' (overlay'+(b&&b.kit?', kit '+b.kit:', no kit yet')+')\n'+
  'class terrain · climate '+(cl?cl.code+' '+cl.name:'?')+'\n'+
  'elev '+Math.round(A.h)+' m · '+f1(WORLD.pressure(A.h))+' atm · rain '+Math.round(A.rain)+' mm/yr · mean '+Math.round(A.temp)+' °C\n'+
  'kits here: '+kits+(A.inside?'':' · outside the region')+'\n'+
  'fields: wet '+f1(A.wet)+' flow '+f1(A.flow)+' canyon '+f1(A.canyon)+' rim '+f1(A.rim)+' rock '+f1(A.rock)+' dune '+f1(A.dune)+' upland '+f1(A.upland)+' salt '+f1(A.salt)+' slope '+f1(A.slope)+'\n'+
  'at x '+Math.round(p.x)+' z '+Math.round(p.z)+' · map px '+f1(WORLD.px(p.x))+', '+f1(WORLD.py(p.z));
 if(fl){const g=fl.tags;t+='\n\nflora · '+fl.name+' ('+fl.kit+')  '+Math.round(fl.rec.Ht)+' m tall, '+Math.round(fl.dist)+' m from the cursor'+
  (g?'\ntags: '+Object.keys(g).map(k=>k+' '+g[k]).join(' · '):'');}
 el.textContent=t;}
// ---------------------------------------------------------------- the polygon tool
const POLY=[];
function polyOut(){$('polyn').textContent=POLY.length;$('polyout').value=JSON.stringify({world_m:POLY.map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.z)]),map_px:POLY.map(p=>[f1(WORLD.px(p.x)),f1(WORLD.py(p.z))])});}
function click(e){if(!st.poly)return;const p=pick(e);if(!p)return;POLY.push(p.clone());polyOut();}
$('polyUndo').onclick=()=>{POLY.pop();polyOut();};$('polyClear').onclick=()=>{POLY.length=0;polyOut();};
$('polyCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('polyout').value);}catch(e){$('polyout').select();}};
// ---------------------------------------------------------------- go to
const GO=[];
function addGo(label,fn){GO.push({label,fn});}
addGo('Overview: the whole region from 600 km up',()=>{camera.position.set(0,650000,560000);lookAt(0,0,30000);});
addGo('The eastern desert from 40 km up, looking east',()=>{setView(40000,40000,40000,-Math.PI/2,-.55);});
const order=['Shade','Verge','Locus','Yuni','Veladiga','Mungo'];
const P=PLACES.list.slice().sort((a,b)=>{const ia=order.indexOf(a.name),ib=order.indexOf(b.name);return (ia<0?99:ia)-(ib<0?99:ib)||((b.cand?1:0)-(a.cand?1:0))||a.name.localeCompare(b.name);});
for(const p of P)addGo((p.cand?'↳ ':'')+p.name+' · '+p.type+(p.biome?' · '+p.biome:''),()=>{setView(p.x+900,p.z+1400,320,0,-.18);lookAt(p.x,WORLD.H(p.x,p.z)+40,p.z);});
// one spot well inside each kit's overlay: the inside pixel of that kit nearest the kit's own centroid
WORLD.KITS.forEach((k,ki)=>{const B=M.frame.box_px;let sx=0,sz=0,n=0;const pts=[];
 for(let py=B[1]+4;py<B[3]-4;py+=6)for(let px=B[0]+4;px<B[2]-4;px+=6){const [x,z]=WORLD.fromPx(px,py);if(!WORLD.inside(x,z))continue;if(WORLD.kitW(ki,x,z)>.99){pts.push([x,z]);sx+=x;sz+=z;n++;}}
 if(!n)return;sx/=n;sz/=n;let best=pts[0],bd=1e18;for(const q of pts){const d=(q[0]-sx)**2+(q[1]-sz)**2;if(d<bd){bd=d;best=q;}}
 addGo('Biome: '+k+' (ground level)',()=>{setView(best[0],best[1],1.7,.6,-.05);});
 addGo('Biome: '+k+' (300 m up)',()=>{setView(best[0],best[1],300,.6,-.25);});});
const sel=$('go');sel.innerHTML='<option value="">Go to…</option>'+GO.map((g,i)=>'<option value="'+i+'">'+g.label+'</option>').join('');
sel.onchange=()=>{const g=GO[+sel.value];if(g)g.fn();sel.value='';sel.blur();};
// ---------------------------------------------------------------- the minimap
const mm=$('minimap'),W=M.frame.size_px[0],Hh=M.frame.size_px[1];mm.width=W;mm.height=Hh;const mg=mm.getContext('2d');
const base=document.createElement('canvas');base.width=W;base.height=Hh;
// the minimap's ground: the biome overlays (mode 0 and 2) or the Köppen classes (mode 1), over the relief
let RAS=null,MODE=0;
function paintBase(R){RAS=R||RAS;R=RAS;const g=base.getContext('2d'),id=g.createImageData(W,Hh),d=id.data;
 const hex=c=>{const k=new THREE.Color(c||'#888');return[k.r*255,k.g*255,k.b*255];};
 const cols=MODE===1?M.classes.map(c=>hex(c.color)):M.biomes.map(b=>hex(b.colour));const src=MODE===1?R.clim:R.biome;
 for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k=j*W+i,[x,z]=WORLD.fromPx(M.frame.box_px[0]+i,M.frame.box_px[1]+j);
  const h=WORLD.baseH(x,z),hx=WORLD.baseH(x+2000,z)-h,hz=WORLD.baseH(x,z+2000)-h,sh=Math.max(.35,Math.min(1.35,.85-(hx-hz)*.0012));
  const c=cols[src[k]]||[128,128,128],wet=MODE!==1&&WORLD.water(x,z)>h,ins=R.mask[k]>127?1:.55;
  const col=wet?[60,100,150]:c;d[k*4]=col[0]*sh*ins;d[k*4+1]=col[1]*sh*ins;d[k*4+2]=col[2]*sh*ins;d[k*4+3]=255;}
 g.putImageData(id,0,0);
 g.strokeStyle='rgba(120,220,255,.6)';g.lineWidth=1;for(const L of M.drainage.lines){if(L[0][2]<M.drainage.min_accum*3)continue;g.beginPath();L.forEach((p,i)=>{const X=WORLD.px(p[0])-M.frame.box_px[0],Y=WORLD.py(p[1])-M.frame.box_px[1];i?g.lineTo(X,Y):g.moveTo(X,Y);});g.stroke();}
 g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();M.region.points_px.forEach((p,i)=>{const X=p[0]-M.frame.box_px[0],Y=p[1]-M.frame.box_px[1];i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();g.stroke();
 for(const p of PLACES.list){const X=p.px-M.frame.box_px[0],Y=p.py-M.frame.box_px[1];g.fillStyle=p.cand?'#7fd0ff':p.build?'#ffc070':'#e8e0d0';g.beginPath();g.arc(X,Y,p.build||p.cand?4:2.5,0,Math.PI*2);g.fill();}
 if(MODE===1){const n={};for(let k=0;k<R.clim.length;k++)if(R.mask[k]>127)n[R.clim[k]]=(n[R.clim[k]]||0)+1;
  $('maplegend').innerHTML='<b>Köppen classes in the region</b><br>'+Object.keys(n).sort((a,b)=>n[b]-n[a]).map(c=>{const C=M.classes[c];return '<span style="color:'+C.color+'">■</span> '+C.code+' '+C.name+' ('+Math.round(n[c]*4/1000)+'k km²)';}).join('<br>');}
 else $('maplegend').innerHTML=(MODE===2?'<b>Biome regions</b><br>':'')+M.biomes.filter(b=>b.px_in_region>0).map(b=>'<span style="color:'+b.colour+'">■</span> '+b.name+(b.kit?'':' (bare)')).join(MODE===2?'<br>':' · ');}
$('ov').onchange=()=>{MODE=+$('ov').value;TERRAIN.OVERLAY.value=MODE;paintBase();$('ov').blur();};
function drawMap(){mg.drawImage(base,0,0);const C=camera.position,X=WORLD.px(C.x)-M.frame.box_px[0],Y=WORLD.py(C.z)-M.frame.box_px[1];
 mg.save();mg.translate(X,Y);mg.rotate(-st.yaw);mg.fillStyle='#ff4030';mg.strokeStyle='#000';mg.beginPath();mg.moveTo(0,-11);mg.lineTo(6,6);mg.lineTo(0,2);mg.lineTo(-6,6);mg.closePath();mg.fill();mg.stroke();mg.restore();}
mm.addEventListener('click',e=>{const r=mm.getBoundingClientRect(),px=M.frame.box_px[0]+(e.clientX-r.left)/r.width*W,py=M.frame.box_px[1]+(e.clientY-r.top)/r.height*Hh;
 const [x,z]=WORLD.fromPx(px,py),agl=Math.max(300,camera.position.y-ground(camera.position.x,camera.position.z));setView(x,z,Math.min(agl,8000),st.yaw,st.pitch);});
return{update,setView,lookAt,paintBase,drawMap,st,GO};})();});
