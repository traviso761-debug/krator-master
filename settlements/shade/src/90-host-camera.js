// ================================================================= HOST — camera, dev tools, loop
// Orbit (drag), pan (right-drag or WASD, Q/E down/up), zoom (wheel); preset
// views; the INSPECTOR (toggle: hover names what is under the cursor: its
// name, its class and its tags); the POLYGON tool (toggle: click the ground to
// add points, copy the JSON); overlays for the places and the life layer's routes.
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.7;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// ---------------------------------------------------------------- the panel
const INITIAL_VIEW='The market and the Khan';
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.value=INITIAL_VIEW;sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
const tools=document.getElementById('tools'),insp=document.getElementById('insp'),polyBox=document.getElementById('poly'),polyOut=document.getElementById('polyout');
function toggle(id,label,on,fn){const l=document.createElement('label');const c=document.createElement('input');c.type='checkbox';c.id=id;c.checked=!!on;c.onchange=()=>fn(c.checked);l.appendChild(c);l.appendChild(document.createTextNode(' '+label));tools.appendChild(l);fn(!!on);return c;}
const TOOL={inspect:true,poly:false};
toggle('t-insp','Inspector (hover)',true,v=>{TOOL.inspect=v;insp.style.display=v?'block':'none';});
toggle('t-places','Places',false,v=>OVERLAY.places.visible=v);
toggle('t-routes','Routes (life layer)',false,v=>OVERLAY.routes.visible=v);
toggle('t-poly','Polygon tool',false,v=>{TOOL.poly=v;polyBox.style.display=v?'block':'none';});
document.getElementById('polyclear').onclick=()=>{POLY.length=0;drawPoly();};
document.getElementById('polyundo').onclick=()=>{POLY.pop();drawPoly();};
document.getElementById('polycopy').onclick=()=>{polyOut.select();try{navigator.clipboard.writeText(polyOut.value);}catch(e){document.execCommand&&document.execCommand('copy');}};
// ---------------------------------------------------------------- picking
// Hover must be cheap: a march along the ray against the height function and
// an analytic test against every registered cylinder, not a raycast through
// half a million instances. A click does the full raycast (a floor plant has
// no registered volume, only its instanced mesh).
const ray=new THREE.Raycaster();
function groundHit(o,d){let t=0,prev=o.y-terrainH(o.x,o.z);if(prev<0)return null;
 for(let i=0;i<1600&&t<3000;i++){const st=Math.max(.4,Math.min(12,prev*.5));t+=st;const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t,h=y-terrainH(x,z);
  if(h<0){let a=t-st,b=t;for(let k=0;k<12;k++){const m=(a+b)/2;if(o.y+d.y*m-terrainH(o.x+d.x*m,o.z+d.z*m)<0)b=m;else a=m;}return{t:b,p:new THREE.Vector3(o.x+d.x*b,o.y+d.y*b,o.z+d.z*b)};}prev=h;}return null;}
function cylHit(o,d,r){const ox=o.x-r.x,oz=o.z-r.z,a=d.x*d.x+d.z*d.z,b=2*(ox*d.x+oz*d.z),c=ox*ox+oz*oz-r.r*r.r,disc=b*b-4*a*c;if(a<1e-9||disc<0)return null;
 const s=Math.sqrt(disc);for(const t of [(-b-s)/(2*a),(-b+s)/(2*a)]){if(t<0)continue;const y=o.y+d.y*t;if(y>=(r.y||0)&&y<=(r.y||0)+r.h)return t;}
 if(c<0)return 0;return null;}
const SPECIES_BY_NAME={};(SEDESERT.SPECIES||[]).forEach(s=>SPECIES_BY_NAME[s.name]=s);
function placeAt(x,z){for(const p of PLACES)if(polyHas(p.poly,x,z))return p;return null;}
function terrainName(x,z){if(waterH(x,z)>terrainH(x,z))return Math.hypot(x-POOL.x,z-POOL.z)<POOL.r+2?'The plunge pool':x<BASIN.x0?'The upper stream':'The lower stream';
 const d=basinD(x,z),W=wallW(x,z);if(d<=0)return x>119?'The canyon floor':'The basin floor';if(d<W)return kSwitch(x,z)>.5?'The north slope':kSouth(x,z)>.5?'The carved face (sheer)':kLip(x,z)>.5?'The lip (sheer)':x>119?'The canyon wall':'The basin wall';
 return mesaH(x,z)>10?'A mesa':'The plateau';}
function describe(o,d){
 // the nearest registered cylinder, against the ground behind it
 const g=groundHit(o,d);let best=null,bt=g?g.t:1e9;
 for(const r of REG){if(r.r>200)continue;const t=cylHit(o,d,r);if(t!=null&&t<bt&&(!best||r.r<best.r||t<bt-2)){bt=t;best=r;}}
 if(best){const tags=Object.assign({},best.tags||{});const S=SPECIES_BY_NAME[best.name];if(S)Object.assign(tags,S.tags,{biome:'eastern high desert (sedesert)'});
  return{name:best.name,cls:best.cls||'flora',tags,p:new THREE.Vector3(o.x+d.x*bt,o.y+d.y*bt,o.z+d.z*bt)};}
 if(!g)return null;const p=g.p,pl=placeAt(p.x,p.z);
 if(pl)return{name:pl.name,cls:'place ('+pl.kind+')',tags:Object.assign({activities:pl.activities.join(', '),capacity:pl.capacity},pl.tags||{}),p};
 const n=swNear(p.x,p.z);if(n&&n.d<SWB.bank)return{name:'The switchback',cls:'path',tags:{grade:SWB.grade.toFixed(3),length_m:Math.round(SWB.len)},p};
 return{name:terrainName(p.x,p.z),cls:'terrain',tags:{},p};}
function showInfo(D,extra){if(!D){insp.textContent='(sky)';return;}const p=D.p;let s=D.name+'\n['+D.cls+']';
 for(const k in D.tags)s+='\n  '+k+': '+D.tags[k];s+='\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';if(extra)s+='\n'+extra;insp.textContent=s;}
function rayAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);return ray;}
let hoverAt=null,hoverT=0;
function clickAt(cx,cy){const R=rayAt(cx,cy);
 if(TOOL.poly){const g=groundHit(R.ray.origin,R.ray.direction);if(g){POLY.push([+g.p.x.toFixed(1),+g.p.z.toFixed(1),+g.p.y.toFixed(1)]);drawPoly();}return;}
 if(!TOOL.inspect)return;
 const hits=R.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip&&!h.object.userData.overlay);
 const D=describe(R.ray.origin,R.ray.direction);
 const h=hits[0],extra=h&&(!D||h.distance<camera.position.distanceTo(D.p)-1)?'clicked: '+(h.object.userData.inspectLabel||h.object.name||'mesh')+(h.object.userData.biome?'  [flora]':''):'';
 showInfo(D,extra);}
// ---------------------------------------------------------------- the polygon tool
const POLY=[];let polyMesh=null;
function drawPoly(){if(polyMesh){scene.remove(polyMesh);polyMesh.geometry.dispose();polyMesh=null;}
 polyOut.value=JSON.stringify(POLY.map(p=>[p[0],p[1]]))+'\n// with heights: '+JSON.stringify(POLY);
 if(POLY.length>1){const pts=[];const P=POLY.length>2?POLY.concat([POLY[0]]):POLY;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));for(let k=0;k<n;k++){const x=mix(a[0],b[0],k/n),z=mix(a[1],b[1],k/n);pts.push([x,terrainH(x,z),z]);}}
  const l=P[P.length-1];pts.push([l[0],terrainH(l[0],l[1]),l[1]]);polyMesh=ribbonPath(pts,.9,0xff2a6a,false,.5);scene.add(polyMesh);}}
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
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),2,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='TEXTAREA')return;keys[e.key.toLowerCase()]=true;});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false,hudText='';
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=Math.max(6,ctl.radius*.6)*dt;fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 if(TOOL.inspect&&!TOOL.poly&&hoverAt&&!drag&&now-hoverT>120){hoverT=now;const R=rayAt(hoverAt[0],hoverAt[1]);showInfo(describe(R.ray.origin,R.ray.direction));}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}
 requestAnimationFrame(frame);}
frame();window._ready=true;
