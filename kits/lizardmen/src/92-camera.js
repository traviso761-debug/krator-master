// ================================================================= CAMERA and DEV TOOLS: views, orbit / WASD, inspector, polygon tool, walk, cut-away, night
buildWorld();
const VIEWS=autoViews();
const ctl={target:new THREE.Vector3(0,4,0),theta:0,phi:1.1,radius:80};
function setView(cx,cy,cz,tx,ty,tz){WALK.on=false;ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.max(.5,Math.sqrt(dx*dx+dy*dy+dz*dz));ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){if(WALK.on){camera.position.set(WALK.x,WALK.y,WALK.z);camera.rotation.order='YXZ';camera.rotation.set(WALK.pitch,WALK.yaw,0);return;}
 const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const gy=terrainH(camera.position.x,camera.position.z)+.4;if(camera.position.y<gy)camera.position.y=gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');
const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
function uiButton(label,on,fn,title){const b=document.createElement('button');b.textContent=label;if(title)b.title=title;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}

// ---- inspector: hover shows the name, class and tags of what is under the cursor (core/tags' label for the record)
const INSP={on:true,last:0};const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function regAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function furnAt(p){let best=null,bd=1e9;for(const f of SVF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* the cut-away discards fragments in the shader; a ray still meets them. Skip a hit the shader would discard (27-mat.js) */
function cutHidden(h){if(!ANIMU.uCut.value||!h.face)return false;const A=h.object.geometry&&h.object.geometry.attributes.aCut;if(!A)return false;const i=h.face.a,cx=A.getX(i),cz=A.getY(i),by=A.getZ(i),on=A.getW(i);
 if(on<.5||h.point.y<=by+.3)return false;const c=camera.position;return (h.point.x-cx)*(c.x-cx)+(h.point.z-cz)*(c.z-cz)>0;}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function labelHtml(rec,sub){const L=KTAGS.label(rec).split('\n');return '<b>'+esc(L[0])+'</b>\n<span class="cls">'+esc(L[1]||'')+'</span>'+(L.length>2?'\n'+L.slice(2).map(esc).join('\n'):'')+(sub?'\n<span class="tag">'+esc(sub)+'</span>':'');}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(WORLD.children,true).filter(h=>!(h.object.userData&&h.object.userData.probeSkip)&&!cutHidden(h));
 if(!hits.length){insp.style.display='none';return;}const p=hits[0].point;let html=null;
 let inF=false;for(let o=hits[0].object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=furnAt(p);if(f&&SVTAGS.get(f.id))html=labelHtml(SVTAGS.get(f.id),f.key);}
 if(!html){const r=regAt(p);if(r&&r.tid&&SVTAGS.get(r.tid)){const life=SV_LIFE.find(l=>l.id===r.tid);html=labelHtml(SVTAGS.get(r.tid),r.key+(life?'  ·  '+life.faction+' / '+life.subFaction+' · job '+life.job+' · '+life.activity:''));}
  else if(r)html='<b>'+esc(r.name)+'</b>\n<span class="cls">'+esc(r.cls)+'</span>  ·  '+esc(r.key);}
 if(!html)html='<b>unregistered mesh</b>';
 insp.style.display='block';insp.innerHTML=html+'\n<span style="opacity:.6">'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'</span>';}
uiButton('Inspector',true,()=>{INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';return INSP.on;},'hover to name what is under the cursor (T)');

// ---- cut-away (C): the near half of every tent opens, so the furnished interiors show
function cutSet(on){ANIMU.uCut.value=on?1:0;WORLD.traverse(m=>{if(m.isMesh&&m.userData.mk&&SV_CUT[m.userData.mk])m.castShadow=!on;});for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Cut'))b.classList.toggle('on',!!on);return !!on;}
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

// ---- walk mode (F): eye height 1.7 m, WASD, drag to look
const WALK={on:false,x:0,y:1.7,z:40,yaw:0,pitch:0,speed:4};
uiButton('Walk (F)',false,()=>{toggleWalk();return WALK.on;});
function toggleWalk(){WALK.on=!WALK.on;if(WALK.on){const d=new THREE.Vector3();camera.getWorldDirection(d);WALK.yaw=Math.atan2(-d.x,-d.z);WALK.pitch=0;WALK.x=camera.position.x;WALK.z=camera.position.z;WALK.y=terrainH(WALK.x,WALK.z)+1.7;}
 else{const fx=-Math.sin(WALK.yaw),fz=-Math.cos(WALK.yaw);setView(WALK.x-fx*12,8,WALK.z-fz*12,WALK.x+fx*4,1.5,WALK.z+fz*4);}
 for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Walk'))b.classList.toggle('on',WALK.on);}

setView(...VIEWS[Object.keys(VIEWS)[0]]);
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' - hover to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move · C cut-away · N night · F walk · P polygon';
// input
const cv=renderer.domElement;let drag=null;const keys={};
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
 else if(k==='p'){POLY.on=!POLY.on;polyEl.style.display=POLY.on?'block':'none';}else if(k==='t'){INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=skyCam.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();skyCam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(WALK.on){const sp=WALK.speed*(keys.shift?2.5:1)*dt;const fw=new THREE.Vector3(-Math.sin(WALK.yaw),0,-Math.cos(WALK.yaw)),rt=new THREE.Vector3(Math.cos(WALK.yaw),0,-Math.sin(WALK.yaw));
  if(keys.w){WALK.x+=fw.x*sp;WALK.z+=fw.z*sp;}if(keys.s){WALK.x-=fw.x*sp;WALK.z-=fw.z*sp;}if(keys.d){WALK.x+=rt.x*sp;WALK.z+=rt.z*sp;}if(keys.a){WALK.x-=rt.x*sp;WALK.z-=rt.z*sp;}
  if(keys.e)WALK.y+=sp;if(keys.q)WALK.y-=sp;const ge=terrainH(WALK.x,WALK.z)+1.7;if(!keys.e&&!keys.q)WALK.y=ge;else WALK.y=Math.max(ge,WALK.y);}
 else{const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
  if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
  if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;}
 applyCam();ANIMU.uCam.value.copy(camera.position);
 for(const f of FRAME_HOOKS)f(dt,now);
 {const tg=WALK.on?camera.position:ctl.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();}
 skyCam.quaternion.copy(camera.quaternion);skyCam.fov=camera.fov;skyCam.updateProjectionMatrix();
 atmosFrame(dt);
 try{renderer.clear();renderer.render(skyScene,skyCam);renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x.toFixed(0)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(0)}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}${WALK.on?'  WALK':''}${ANIMU.uCut.value?'  CUT':''}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  records ${REG.length}  furniture ${SVF.placed.length}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
