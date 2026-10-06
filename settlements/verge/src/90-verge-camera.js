// ================================================================= VERGE — camera, dev tools, frame loop ([web])
// Orbit (drag), pan (right-drag or WASD, Q/E down/up), zoom (wheel); preset views; the INSPECTOR (toggle: hover
// names what is under the cursor, its class and its tags: a building's culture, types and interior, a creature's
// faction and job, a plant's climate tags); the POLYGON tool (toggle: click the ground to add points, copy the JSON
// with heights); overlays for the places and the life layer's routes; the clock (hour slider, run/hold).
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,g=terrainH(cp.x,cp.z)+1.7;if(cp.y<g)cp.y=g;camera.lookAt(ctl.target);}
// ---------------------------------------------------------------- the panel
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.value=INITIAL_VIEW;sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
// the clock: an hour slider and run/hold (core/clock: one world day is 72 real minutes when running)
const clockBox=document.createElement('span');clockBox.style.cssText='background:rgba(30,16,10,.75);border:1px solid #a06a48;border-radius:4px;padding:3px 8px;display:flex;gap:6px;align-items:center';
const hourIn=document.createElement('input');hourIn.type='range';hourIn.min=0;hourIn.max=24;hourIn.step=.05;hourIn.value=CLOCK.hour;hourIn.style.width='120px';hourIn.oninput=()=>CLOCK.set(+hourIn.value);
const hourLb=document.createElement('span');const runB=document.createElement('button');runB.textContent=CLOCK.running?'hold':'run';runB.onclick=()=>{CLOCK.run();runB.textContent=CLOCK.running?'hold':'run';};
clockBox.append('hour',hourIn,hourLb,runB);ui.appendChild(clockBox);
const tools=document.getElementById('tools'),insp=document.getElementById('insp'),polyBox=document.getElementById('poly'),polyOut=document.getElementById('polyout');
function toggle(id,label,on,fn){const l=document.createElement('label');const c=document.createElement('input');c.type='checkbox';c.id=id;c.checked=!!on;c.onchange=()=>fn(c.checked);l.appendChild(c);l.appendChild(document.createTextNode(' '+label));tools.appendChild(l);fn(!!on);return c;}
const TOOL={inspect:true,poly:false};
toggle('t-insp','Inspector (hover)',true,v=>{TOOL.inspect=v;insp.style.display=v?'block':'none';});
toggle('t-poly','Polygon tool',false,v=>{TOOL.poly=v;polyBox.style.display=v?'block':'none';});
if(typeof OVERLAY!=='undefined'){for(const k in OVERLAY){const O=OVERLAY[k];toggle('t-'+k,O.label,false,v=>{O.group.visible=v;});}}
document.getElementById('polyclear').onclick=()=>{POLY.length=0;drawPoly();};
document.getElementById('polyundo').onclick=()=>{POLY.pop();drawPoly();};
document.getElementById('polycopy').onclick=()=>{polyOut.select();try{navigator.clipboard.writeText(polyOut.value);}catch(e){document.execCommand&&document.execCommand('copy');}};
// ---------------------------------------------------------------- picking
// Hover must be cheap: a march along the ray against the height function and an analytic test against every
// registered cylinder, not a raycast through the instances. A click does the full raycast as well.
const ray=new THREE.Raycaster();
function groundHit(o,d){let t=0,prev=o.y-terrainH(o.x,o.z);if(prev<0)return null;
 for(let i=0;i<2400&&t<14000;i++){const st=Math.max(.4,Math.min(40,prev*.5));t+=st;const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t,h=y-terrainH(x,z);
  if(h<0){let a=t-st,b=t;for(let k=0;k<14;k++){const m=(a+b)/2;if(o.y+d.y*m-terrainH(o.x+d.x*m,o.z+d.z*m)<0)b=m;else a=m;}return{t:b,p:new THREE.Vector3(o.x+d.x*b,o.y+d.y*b,o.z+d.z*b)};}prev=h;}return null;}
function cylHit(o,d,r){const ox=o.x-r.x,oz=o.z-r.z,a=d.x*d.x+d.z*d.z,b=2*(ox*d.x+oz*d.z),c=ox*ox+oz*oz-r.r*r.r,disc=b*b-4*a*c;if(a<1e-9||disc<0)return null;
 const s=Math.sqrt(disc);for(const t of [(-b-s)/(2*a),(-b+s)/(2*a)]){if(t<0)continue;const y=o.y+d.y*t;if(y>=(r.y||0)&&y<=(r.y||0)+r.h)return t;}
 if(c<0)return 0;return null;}
const SPECIES_BY_NAME={};
for(const K of [typeof SEDESERT!=='undefined'?SEDESERT:null,typeof EASTABYSS!=='undefined'?EASTABYSS:null])if(K)(K.SPECIES||[]).forEach(s=>SPECIES_BY_NAME[s.name]=Object.assign({biome:K===SEDESERT?'eastern high desert (sedesert)':'eastern abyss (eastabyss)'},s.tags||{}));
function terrainName(x,z){const w=waterH(x,z);if(w>terrainH(x,z)-.05){if(Math.hypot(x-VG.POOL.x,z-VG.POOL.z)<VG.POOL.r+10)return'The plunge pool';
  if(x>VG.GORGE.x0&&x<VG.GORGE.x1)return'The gorge of the seven cataracts';return x<VG.lipX(z)?'The river (upper)':x>3000?'A salt lake':'The river (lower)';}
 const zn=VG.zoneAt(x,z);return{canyon:'The canyon floor','canyon-wall':'The canyon wall',plateau:VG.mesaH(x,z)>10?'A mesa':'The plateau (eastern high desert)',
  spur:'The spur (the easiest descent)',cliff:'The escarpment',floor:'The abyss floor',salt:'The salt flats'}[zn]||zn;}
function describe(o,d){
 const g=groundHit(o,d);let best=null,bt=g?g.t:1e9;
 for(const r of REG){if(r.r>260)continue;const t=cylHit(o,d,r);if(t!=null&&t<bt&&(!best||r.r<best.r||t<bt-2)){bt=t;best=r;}}
 if(best){const tags=Object.assign({},best.tags||{});const S=SPECIES_BY_NAME[best.name];if(S)Object.assign(tags,S);
  return{name:best.name,cls:best.cls||'flora',tags,p:new THREE.Vector3(o.x+d.x*bt,o.y+d.y*bt,o.z+d.z*bt)};}
 if(!g)return null;const p=g.p;
 if(typeof placeAt==='function'){const pl=placeAt(p.x,p.z);if(pl)return{name:pl.name,cls:'place',tags:Object.assign({activities:(pl.activities||[]).join(', '),capacity:pl.capacity},pl.tags||{}),p};}
 const n=VG.trailNear(p.x,p.z);if(n&&n.d<VG.TRAIL.bank)return{name:'The switchback (the Verge trail)',cls:'path',tags:{grade:VG.TRAIL.grade.toFixed(3),length_m:Math.round(VG.TRAIL.len),here_m:Math.round(n.s),descended_m:Math.round(VG.TRAIL.yTop-n.y)},p};
 return{name:terrainName(p.x,p.z),cls:'terrain',tags:{},p};}
function showInfo(D,extra){if(!D){insp.textContent='(sky)';return;}const p=D.p;let s=D.name+'\n['+D.cls+']';
 for(const k in D.tags){const v=D.tags[k];s+='\n  '+k+': '+(Array.isArray(v)?v.join(', '):typeof v==='object'&&v?JSON.stringify(v):v);}
 s+='\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';if(extra)s+='\n'+extra;insp.textContent=s;}
function rayAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);return ray;}
let hoverAt=null,hoverT=0;
function clickAt(cx,cy){const R=rayAt(cx,cy);
 if(TOOL.poly){const g=groundHit(R.ray.origin,R.ray.direction);if(g){POLY.push([+g.p.x.toFixed(1),+g.p.z.toFixed(1),+g.p.y.toFixed(1)]);drawPoly();}return;}
 if(!TOOL.inspect)return;
 const hits=R.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip&&!h.object.userData.overlay&&h.object.visible);
 const D=describe(R.ray.origin,R.ray.direction),h=hits[0];
 let extra='';if(h&&(!D||h.distance<camera.position.distanceTo(D.p)-1)){const u=h.object.userData;extra='clicked: '+(u.inspectFn&&h.instanceId!=null?u.inspectFn(h.instanceId):(u.inspectLabel||h.object.name||'mesh'))+(u.biome?'  [flora]':'');}
 showInfo(D,extra);}
// ---------------------------------------------------------------- the polygon tool
const POLY=[];let polyMesh=null;
function ribbonLine(pts,w,color){const pos=[],idx=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,p=pts[i];
  pos.push(p[0]+nx,p[1]+.4,p[2]+nz,p[0]-nx,p[1]+.4,p[2]-nz);if(i)idx.push(2*i-2,2*i-1,2*i,2*i-1,2*i+1,2*i);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,depthTest:false,transparent:true,opacity:.85,side:THREE.DoubleSide}));m.renderOrder=20;m.userData.overlay=true;m.userData.probeSkip=true;return m;}
function drawPoly(){if(polyMesh){scene.remove(polyMesh);polyMesh.geometry.dispose();polyMesh=null;}
 polyOut.value=JSON.stringify(POLY.map(p=>[p[0],p[1]]))+'\n// with heights: '+JSON.stringify(POLY);
 if(POLY.length>1){const pts=[];const P=POLY.length>2?POLY.concat([POLY[0]]):POLY;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));for(let k=0;k<n;k++){const x=mix(a[0],b[0],k/n),z=mix(a[1],b[1],k/n);pts.push([x,terrainH(x,z),z]);}}
  const l=P[P.length-1];pts.push([l[0],terrainH(l[0],l[1]),l[1]]);polyMesh=ribbonLine(pts,.9,0xff2a6a);scene.add(polyMesh);}}
// ---------------------------------------------------------------- input
setView(...VIEWS[INITIAL_VIEW]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)clickAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{hoverAt=[e.clientX,e.clientY];if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('pointerleave',()=>{hoverAt=null;});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),2,16000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'))return;keys[e.key.toLowerCase()]=true;});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false,hudText='';
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
// the frame: step the clock, run the ticks (each isolated: one bad tick reports once and the rest run), render
const PRE_RENDER=[];          // passes that must draw before the main scene (a background sky scene)
function frame(){const now=performance.now(),rdt=Math.min(.1,(now-last)/1000);last=now;
 CLOCK.step(rdt);const dt=CLOCK.dt,t=CLOCK.t;
 const sp=Math.max(6,ctl.radius*.6)*rdt;fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 applyCam();
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,t);}catch(e){if(!TICKS[i]._bad){TICKS[i]._bad=true;reportErr('tick: '+e.stack);}}}
 // the sky and the light, on the one clock: the Krator sky's hour IS the world clock's
 if(typeof skySetHour==='function'){SKY.timeScale=0;skySetHour(CLOCK.hour);updateSky();updateDayNight();
  const kd=SKY_STATE.keyDir;sun.position.copy(kd).multiplyScalar(2600).add(ctl.target);sun.target.position.copy(ctl.target);sun.target.updateMatrixWorld();
  BIO.setSun([kd.x,kd.y,kd.z]);MAT_WATER.uniforms.uSun.value.copy(kd);MAT_WATER.uniforms.uSky.value.copy(scene.fog.color);MAT_WATER.uniforms.uSunK.value=clamp(SKY_STATE.dayK,0,1);
  MAT_WATER.uniforms.fogDensity.value=scene.fog.density;MAT_FALL.uniforms.fogDensity.value=scene.fog.density;MAT_FALL.uniforms.uLit.value=.25+.75*clamp(SKY_STATE.dayK,0,1);
  if(VERGE_GLOW)VERGE_GLOW.updateGlow(rdt,CLOCK.hour,DAYNIGHT_NIGHT_K);}
 if(TOOL.inspect&&!TOOL.poly&&hoverAt&&!drag&&now-hoverT>120){hoverT=now;const R=rayAt(hoverAt[0],hoverAt[1]);showInfo(describe(R.ray.origin,R.ray.direction));}
 if(Math.abs(+hourIn.value-CLOCK.hour)>.05&&document.activeElement!==hourIn)hourIn.value=CLOCK.hour;
 const hh=Math.floor(CLOCK.hour),mm=Math.floor((CLOCK.hour-hh)*60);hourLb.textContent=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
 try{renderer.info.autoReset=false;renderer.info.reset();renderer.autoClear=true;
  if(typeof skyRender==='function'){skyRender();renderer.autoClear=false;renderer.clearDepth();}
  for(const f of PRE_RENDER)f();renderer.render(scene,camera);renderer.autoClear=true;}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  day ${CLOCK.day} ${hourLb.textContent}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}
 requestAnimationFrame(frame);}
frame();window._ready=true;
