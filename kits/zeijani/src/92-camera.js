// ================================================================= CAMERA and DEV TOOLS: views, orbit / WASD, inspector, polygon tool, walk, cut-away, night
buildWorld();
const VIEWS=autoViews();
const ctl={target:new THREE.Vector3(0,4,0),theta:0,phi:1.1,radius:80};
function setView(cx,cy,cz,tx,ty,tz){WALK.on=false;ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.max(.5,Math.sqrt(dx*dx+dy*dy+dz*dz));ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){if(WALK.on){camera.position.set(WALK.x,WALK.y,WALK.z);camera.rotation.order='YXZ';camera.rotation.set(WALK.pitch,WALK.yaw,0);return;}
 const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 /* kept above the ground; a page with an underground (Dhelv) gives camGroundY(p): no floor while the camera is in a void */
 const gy=(typeof camGroundY==='function'?camGroundY(camera.position):terrainH(camera.position.x,camera.position.z))+.4;if(camera.position.y<gy)camera.position.y=gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');
const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
function uiButton(label,on,fn,title){const b=document.createElement('button');b.textContent=label;if(title)b.title=title;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}

// ---- inspector: hover shows the name, class and tags of what is under the cursor (core/tags' label for the record)
const INSP={on:true,last:0};const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function regAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function furnAt(p){let best=null,bd=1e9;for(const f of ZJF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* an interior piece (the interiors kit's, registered in core/tags with its place and turn): the nearest whose box holds the point */
function furnRecAt(p){let q=ZJTAGS.query({});q=Array.isArray(q)?q:Object.values(q);let best=null,bd=1e9;const F=KratorFurniture.FURN_BY_KEY;
 for(const r of q){if(r.class!=='furniture'||!r.at)continue;const A=F[r.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,0),dx=p.x-r.at[0],dz=p.z-r.at[2],c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),lx=dx*c-dz*s,lz=dx*s+dz*c;
  if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<r.at[1]-.1||p.y>r.at[1]+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=r;}}return best;}
/* the cut-away discards fragments in the shader; a ray still meets them. Skip a hit the shader would discard (27-mat.js) */
function cutHidden(h){if(!ANIMU.uCut.value||!h.face)return false;const A=h.object.geometry&&h.object.geometry.attributes.aCut;if(!A)return false;const i=h.face.a,cx=A.getX(i),cz=A.getY(i),by=A.getZ(i),on=A.getW(i);
 if(on<.5||h.point.y<=by+.3)return false;const c=camera.position;return (h.point.x-cx)*(c.x-cx)+(h.point.z-cz)*(c.z-cz)>0;}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function labelHtml(rec,sub){const L=KTAGS.label(rec).split('\n');return '<b>'+esc(L[0])+'</b>\n<span class="cls">'+esc(L[1]||'')+'</span>'+(L.length>2?'\n'+L.slice(2).map(esc).join('\n'):'')+(sub?'\n<span class="tag">'+esc(sub)+'</span>':'');}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(WORLD.children,true).filter(h=>!(h.object.userData&&h.object.userData.probeSkip)&&!cutHidden(h));
 if(!hits.length){insp.style.display='none';return;}const p=hits[0].point;let html=null;
 let inF=false;for(let o=hits[0].object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=furnAt(p);if(f&&ZJTAGS.get(f.id))html=labelHtml(ZJTAGS.get(f.id),f.key);else{const r=furnRecAt(p);if(r)html=labelHtml(r,r.key);}}
 if(!html){const r=regAt(p);if(r&&r.tid&&ZJTAGS.get(r.tid)){const life=ZJ_LIFE.find(l=>l.id===r.tid);html=labelHtml(ZJTAGS.get(r.tid),r.key+(life?'  ·  '+life.faction+' / '+life.subFaction+' · job '+life.job+' · '+life.activity:''));}
  else if(r)html='<b>'+esc(r.name)+'</b>\n<span class="cls">'+esc(r.cls)+'</span>  ·  '+esc(r.key);}
 if(!html)html='<b>unregistered mesh</b>';
 insp.style.display='block';insp.innerHTML=html+'\n<span style="opacity:.6">'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'</span>';}
uiButton('Inspector',true,()=>{INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';return INSP.on;},'hover to name what is under the cursor (T)');

// ---- cut-away (C): the near half of every tent opens, so the furnished interiors show
function cutSet(on){ANIMU.uCut.value=on?1:0;WORLD.traverse(m=>{if(m.isMesh&&m.userData.mk&&ZJ_CUT[m.userData.mk])m.castShadow=!on;});for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Cut'))b.classList.toggle('on',!!on);return !!on;}
uiButton('Cut-away (C)',false,()=>cutSet(!ANIMU.uCut.value),'open the near half of every tent');
uiButton('Night (N)',false,()=>{nightSet(!NIGHT.on);return NIGHT.on;},'21:30, lamps and braziers lit');
uiButton('Shadows',true,()=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});return renderer.shadowMap.enabled;});

// ---- polygon tool: click the ground to lay out a polygon; copy-pasteable world coordinates (x east, z south)
const POLY={on:false,pts:[],fmt:0,grp:new THREE.Group()};POLY.grp.userData.probeSkip=true;scene.add(POLY.grp);
const polyEl=document.getElementById('poly'),polyOut=document.getElementById('polyout');
const polyMat=new THREE.MeshBasicMaterial({color:0xff5060,depthTest:false}),polyRib=new THREE.MeshBasicMaterial({color:0xffe060,side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.85});
function polyRedraw(){while(POLY.grp.children.length){const c=POLY.grp.children[0];POLY.grp.remove(c);c.geometry.dispose();}
 for(const p of POLY.pts){const m=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,2.4,8),polyMat);m.position.set(p[0],p[2]+1.2,p[1]);m.renderOrder=9;POLY.grp.add(m);}
 for(let i=0;i<POLY.pts.length-1;i++){const a=POLY.pts[i],b=POLY.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;const m=new THREE.Mesh(new THREE.PlaneGeometry(L,.3),polyRib);   // a ribbon, not a 1-pixel line
  m.rotation.x=-PI/2;m.rotation.z=-Math.atan2(b[1]-a[1],b[0]-a[0]);m.position.set((a[0]+b[0])/2,Math.max(a[2],b[2])+.12,(a[1]+b[1])/2);m.renderOrder=9;POLY.grp.add(m);}
 const f=p=>POLY.fmt?'{x:'+p[0].toFixed(1)+',z:'+p[1].toFixed(1)+',y:'+p[2].toFixed(1)+'}':'['+p[0].toFixed(1)+','+p[1].toFixed(1)+']';
 polyOut.value='['+POLY.pts.map(f).join(',')+']';window._poly=POLY.pts.slice();}
function polyAdd(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const h=ray.intersectObjects(WORLD.children.concat([groundM]),true).find(q=>!(q.object.userData&&q.object.userData.probeSkip));if(h){POLY.pts.push([h.point.x,h.point.z,h.point.y]);polyRedraw();}}
uiButton('Polygon (P)',false,()=>{POLY.on=!POLY.on;polyEl.style.display=POLY.on?'block':'none';return POLY.on;},'click to drop vertices; copy the coordinates');
document.getElementById('polyundo').onclick=()=>{POLY.pts.pop();polyRedraw();};
document.getElementById('polyclear').onclick=()=>{POLY.pts=[];polyRedraw();};
document.getElementById('polyclose').onclick=()=>{if(POLY.pts.length>2){POLY.pts.push(POLY.pts[0].slice());polyRedraw();}};
document.getElementById('polyfmt').onclick=e=>{POLY.fmt^=1;e.target.textContent=POLY.fmt?'Format: {x,z,y}':'Format: [x,z]';polyRedraw();};
document.getElementById('polycopy').onclick=()=>{polyOut.select();try{navigator.clipboard.writeText(polyOut.value);}catch(e){document.execCommand('copy');}};

// ---- walk mode (F): eye height 1.7 m, WASD, drag to look. The walker stands on the core/walk floors the page registered
// (the sheet's ground, the carved rooms, the tubes, the stairs): a step that finds no floor within 0.6 m of the feet, or
// walks into a block, is refused, as the checks treat it (rock, never a fall). Q/E fly (a debugging escape) until released.
const WALK={on:false,x:0,y:1.7,z:40,yaw:0,pitch:0,speed:4,feet:0,refused:0};
function walkFloor(x,z,feet){return KWALK.floorBelow(x,z,feet,.6);}
function walkTry(nx,nz){const f=walkFloor(nx,nz,WALK.feet);if(!f||WALK.feet-f[0]>.6){WALK.refused++;return false;}
 if(KWALK.blocked(nx,f[0],nz,.3,1.7)){const q=KWALK.push(nx,f[0],nz,.3,1.7),g=walkFloor(q[0],q[1],WALK.feet);if(!g||KWALK.blocked(q[0],g[0],q[1],.3,1.7)){WALK.refused++;return false;}nx=q[0];nz=q[1];WALK.feet=g[0];}
 else WALK.feet=f[0];WALK.x=nx;WALK.z=nz;return true;}
uiButton('Walk (F)',false,()=>{toggleWalk();return WALK.on;});
uiButton('Run (R)',false,()=>{WALK.run=!WALK.run;return WALK.run;},'walk faster (Shift runs while held)');
/* the floor a walk starts on: the highest at or below p; else the nearest within 30 m at about p's height (a view's centre in
   the air over a pit, or in the rock beside a tunnel); never the surface over an underground view */
function walkStart(p){let f=KWALK.floorBelow(p[0],p[2],p[1],.6);if(f)return [p[0],f[0],p[2]];
 for(let r=1;r<=30;r+=1)for(let i=0;i<Math.max(8,r*3);i++){const a=i/Math.max(8,r*3)*TAU,x=p[0]+Math.cos(a)*r,z=p[2]+Math.sin(a)*r;f=KWALK.floorBelow(x,z,p[1]+1,3);if(f&&p[1]-f[0]<6)return [x,f[0],z];}
 f=KWALK.floorsAt(p[0],p[2]).slice(-1)[0];return [p[0],f?f[0]:terrainH(p[0],p[2]),p[2]];}
function toggleWalk(at){WALK.on=!WALK.on;if(WALK.on){const d=new THREE.Vector3();camera.getWorldDirection(d);WALK.yaw=Math.atan2(-d.x,-d.z);WALK.pitch=0;
  /* start at the given point, else at the marker (double-click), else under the orbit target */
  const p=at||(MARK.at?[MARK.at.x,MARK.at.y+.5,MARK.at.z]:[ctl.target.x,ctl.target.y+.5,ctl.target.z]),q=walkStart(p);WALK.x=q[0];WALK.z=q[2];WALK.feet=q[1];WALK.y=WALK.feet+1.7;}
 else{const fx=-Math.sin(WALK.yaw),fz=-Math.cos(WALK.yaw);setView(WALK.x-fx*12,8,WALK.z-fz*12,WALK.x+fx*4,1.5,WALK.z+fz*4);}
 for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Walk'))b.classList.toggle('on',WALK.on);}

setView(...VIEWS[Object.keys(VIEWS)[0]]);
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' - hover to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move · C cut-away · N night · F walk (R run) · double-click marks, G goes to the mark · P polygon';
// ---- the marker: a double-click drops a pin where it hits; G brings the orbit to it; Walk starts on it
const MARK={at:null,grp:new THREE.Group()};MARK.grp.userData.probeSkip=true;MARK.grp.visible=false;scene.add(MARK.grp);
{const m=new THREE.MeshBasicMaterial({color:0xff4060,depthTest:false,transparent:true,opacity:.9});const pin=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),m);pin.position.y=2.2;
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.2,6),m);stem.position.y=1.1;const ring=new THREE.Mesh(new THREE.RingGeometry(.6,.85,24),m);ring.rotation.x=-PI/2;ring.position.y=.03;
 for(const o of [pin,stem,ring]){o.renderOrder=9;MARK.grp.add(o);}}
function markAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object.visible&&!h.object.userData.probeSkip&&!(h.object.parent&&h.object.parent.userData.probeSkip)&&!cutHidden(h));
 if(!hits.length)return;MARK.at=hits[0].point.clone();MARK.grp.position.copy(MARK.at);MARK.grp.visible=true;}
function markGo(){if(!MARK.at)return;if(WALK.on)toggleWalk();ctl.target.copy(MARK.at);ctl.radius=Math.min(ctl.radius,30);}
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('dblclick',e=>markAt(e.clientX,e.clientY));
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4){if(drag.b===0&&POLY.on)polyAdd(e.clientX,e.clientY);else if(drag.b===2&&POLY.on){POLY.pts.pop();polyRedraw();}else if(drag.b===0)inspectAt(e.clientX,e.clientY);}drag=null;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag){if(INSP.on&&performance.now()-INSP.last>90){INSP.last=performance.now();inspectAt(e.clientX,e.clientY);}return;}
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(WALK.on){WALK.yaw-=dx*.004;WALK.pitch=clamp(WALK.pitch-dy*.004,-1.4,1.4);return;}
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{if(WALK.on)WALK.speed=clamp(WALK.speed*(e.deltaY>0?.85:1.18),1,40);else ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),1,2500);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;const k=e.key.toLowerCase();keys[k]=true;
 if(k==='f')toggleWalk();else if(k==='c')cutSet(!ANIMU.uCut.value);else if(k==='n'){nightSet(!NIGHT.on);for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Night'))b.classList.toggle('on',NIGHT.on);}
 else if(k==='p'){POLY.on=!POLY.on;polyEl.style.display=POLY.on?'block':'none';}else if(k==='t'){INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';}
 else if(k==='g')markGo();else if(k==='r'){WALK.run=!WALK.run;for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Run'))b.classList.toggle('on',WALK.run);}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=skyCam.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();skyCam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(WALK.on){const sp=WALK.speed*(keys.shift?2.5:1)*(WALK.run?2.5:1)*dt;const fw=new THREE.Vector3(-Math.sin(WALK.yaw),0,-Math.cos(WALK.yaw)),rt=new THREE.Vector3(Math.cos(WALK.yaw),0,-Math.sin(WALK.yaw));
  let mx=0,mz=0;if(keys.w){mx+=fw.x;mz+=fw.z;}if(keys.s){mx-=fw.x;mz-=fw.z;}if(keys.d){mx+=rt.x;mz+=rt.z;}if(keys.a){mx-=rt.x;mz-=rt.z;}
  if(keys.e||keys.q){WALK.x+=mx*sp;WALK.z+=mz*sp;WALK.y+=(keys.e?sp:0)-(keys.q?sp:0);WALK.feet=WALK.y-1.7;}
  else{if(mx||mz){/* in steps of 0.25 m, so a fast walker cannot jump a wall's thickness */const n=Math.ceil(sp/.25);for(let i=0;i<n;i++)if(!walkTry(WALK.x+mx*sp/n,WALK.z+mz*sp/n)){/* slide along the wall */if(!walkTry(WALK.x+mx*sp/n,WALK.z))walkTry(WALK.x,WALK.z+mz*sp/n);}}
   const f=walkFloor(WALK.x,WALK.z,WALK.feet);if(f)WALK.feet=f[0];WALK.y=WALK.feet+1.7;}}
 else{const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
  if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
  if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;}
 applyCam();ANIMU.uCam.value.copy(camera.position);
 for(const f of FRAME_HOOKS)f(dt,now);
 {const tg=WALK.on?camera.position:ctl.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();}
 skyCam.quaternion.copy(camera.quaternion);skyCam.fov=camera.fov;skyCam.updateProjectionMatrix();
 atmosFrame(dt);
 try{renderer.clear();renderer.render(skyScene,skyCam);renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x.toFixed(0)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(0)}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}${WALK.on?'  WALK':''}${ANIMU.uCut.value?'  CUT':''}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  records ${REG.length}  furniture ${ZJF.placed.length}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
