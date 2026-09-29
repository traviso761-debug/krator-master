// ---------------------------------------------------------------- camera, inspector, polygon tool, walk mode
const ctl={target:new THREE.Vector3(0,10,0),theta:0,phi:1.1,radius:120};
function setView(cx,cy,cz,tx,ty,tz){WALK.on=false;ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){if(WALK.on){camera.position.set(WALK.x,WALK.y,WALK.z);camera.rotation.set(0,0,0);camera.rotation.order='YXZ';camera.rotation.y=WALK.yaw;camera.rotation.x=WALK.pitch;return;}
 const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const gy=terrainH(camera.position.x,camera.position.z)+1.2;if(camera.position.y<gy)camera.position.y=gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');
const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden one-button-per-view list: verify.py drives the camera by clicking these
const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
function uiButton(label,on,fn){const b=document.createElement('button');b.textContent=label;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}

// ---- inspector: hover shows name · classification · tags (project rule); toggleable, on by default
const INSP={on:true,last:0};const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function regAt(p){let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}return best;}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!(h.object.userData&&h.object.userData.probeSkip)&&h.object!==groundM&&!(h.object.userData&&h.object.userData.isGround));
 if(!hits.length){insp.style.display='none';return;}const p=hits[0].point;const r=regAt(p);
 if(!r){insp.style.display='block';insp.innerHTML='<b>unregistered '+(hits[0].object.isInstancedMesh?'instance':'mesh')+'</b>\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);return;}
 const t=r.tags||{};const tagLines=Object.keys(t).map(k=>'<span class="tag">'+k+'</span>: '+(Array.isArray(t[k])?t[k].join(', '):t[k])).join('\n');
 insp.style.display='block';insp.innerHTML='<b>'+r.name+'</b>\n<span class="cls">'+(r.cls||'?')+'</span>'+(r.key?'  ·  '+r.key:'')+'\n'+tagLines+'\n<span style="opacity:.6">'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'</span>';}
uiButton('Inspector',true,()=>{INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';return INSP.on;});
uiButton('Labels',true,()=>{if(LABELS)LABELS.visible=!LABELS.visible;return LABELS?LABELS.visible:false;});

// ---- polygon tool: click the ground to lay out a polygon; copy-pasteable world coordinates
const POLY={on:false,pts:[],fmt:0,grp:new THREE.Group(),line:null};POLY.grp.userData.probeSkip=true;scene.add(POLY.grp);
const polyEl=document.getElementById('poly'),polyOut=document.getElementById('polyout');
const polyMat=new THREE.MeshBasicMaterial({color:0xff5060}),polyLineMat=new THREE.LineBasicMaterial({color:0xffe060});
function polyRedraw(){while(POLY.grp.children.length)POLY.grp.remove(POLY.grp.children[0]);
 for(const p of POLY.pts){const m=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,8),polyMat);m.position.set(p[0],terrainH(p[0],p[1])+1.5,p[1]);m.userData.probeSkip=true;POLY.grp.add(m);}
 if(POLY.pts.length>1){const g=new THREE.BufferGeometry().setFromPoints(POLY.pts.map(p=>new THREE.Vector3(p[0],terrainH(p[0],p[1])+.4,p[1])));const l=new THREE.Line(g,polyLineMat);l.userData.probeSkip=true;POLY.grp.add(l);}
 const f=p=>POLY.fmt?'{x:'+p[0].toFixed(1)+',z:'+p[1].toFixed(1)+'}':'['+p[0].toFixed(1)+','+p[1].toFixed(1)+']';
 polyOut.value='['+POLY.pts.map(f).join(',')+']';window._poly=POLY.pts.slice();}
function polyAdd(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0);const hit=new THREE.Vector3();
 const gh=ray.intersectObjects(scene.children,true).find(h=>h.object===groundM||(h.object.userData&&h.object.userData.isGround));if(gh){POLY.pts.push([gh.point.x,gh.point.z]);polyRedraw();}else if(ray.ray.intersectPlane(pl,hit)){POLY.pts.push([hit.x,hit.z]);polyRedraw();}}
uiButton('Polygon',false,()=>{POLY.on=!POLY.on;polyEl.style.display=POLY.on?'block':'none';return POLY.on;});
document.getElementById('polyundo').onclick=()=>{POLY.pts.pop();polyRedraw();};
document.getElementById('polyclear').onclick=()=>{POLY.pts=[];polyRedraw();};
document.getElementById('polyclose').onclick=()=>{if(POLY.pts.length>2){POLY.pts.push(POLY.pts[0].slice());polyRedraw();}};
document.getElementById('polyfmt').onclick=e=>{POLY.fmt^=1;e.target.textContent=POLY.fmt?'Format: {x,z}':'Format: [x,z]';polyRedraw();};
document.getElementById('polycopy').onclick=()=>{polyOut.select();try{navigator.clipboard.writeText(polyOut.value);}catch(e){document.execCommand('copy');}};

// ---- walk mode (F): eye height 1.7 m, WASD, drag to look. The set is meant to be judged from here.
const WALK={on:false,x:0,y:1.7,z:40,yaw:0,pitch:0};
uiButton('Walk (F)',false,()=>{toggleWalk();return WALK.on;});
function toggleWalk(){WALK.on=!WALK.on;if(WALK.on){const d=new THREE.Vector3();camera.getWorldDirection(d);WALK.yaw=Math.atan2(-d.x,-d.z);WALK.pitch=0;
 WALK.x=camera.position.x;WALK.z=camera.position.z;WALK.y=terrainH(WALK.x,WALK.z)+1.7;}else{setView(WALK.x-Math.sin(WALK.yaw)*-30,20,WALK.z-Math.cos(WALK.yaw)*-30,WALK.x-Math.sin(WALK.yaw)*10,4,WALK.z-Math.cos(WALK.yaw)*10);}
 for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Walk'))b.classList.toggle('on',WALK.on);}

setView(...VIEWS[Object.keys(VIEWS)[0]]);
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — hover to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move · F walk at eye height · Polygon to mark coordinates';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4){if(drag.b===0&&POLY.on)polyAdd(e.clientX,e.clientY);else if(drag.b===2&&POLY.on){POLY.pts.pop();polyRedraw();}else if(drag.b===0&&!INSP.on)inspectAt(e.clientX,e.clientY);}drag=null;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag){if(INSP.on&&performance.now()-INSP.last>90){INSP.last=performance.now();inspectAt(e.clientX,e.clientY);}return;}
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(WALK.on){WALK.yaw-=dx*.004;WALK.pitch=clamp(WALK.pitch-dy*.004,-1.4,1.4);return;}
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{if(WALK.on){WALK.speed=clamp((WALK.speed||6)*(e.deltaY>0?.85:1.18),1,40);}else ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),2,3000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='f')toggleWalk();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(WALK.on){const sp=(WALK.speed||6)*(keys.shift?2.5:1)*dt;const fw=new THREE.Vector3(-Math.sin(WALK.yaw),0,-Math.cos(WALK.yaw)),rt=new THREE.Vector3(Math.cos(WALK.yaw),0,-Math.sin(WALK.yaw));
  if(keys.w){WALK.x+=fw.x*sp;WALK.z+=fw.z*sp;}if(keys.s){WALK.x-=fw.x*sp;WALK.z-=fw.z*sp;}if(keys.d){WALK.x+=rt.x*sp;WALK.z+=rt.z*sp;}if(keys.a){WALK.x-=rt.x*sp;WALK.z-=rt.z*sp;}
  if(keys.e)WALK.y+=sp;if(keys.q)WALK.y-=sp;const ge=terrainH(WALK.x,WALK.z)+1.7;if(!keys.e&&!keys.q)WALK.y=ge;else WALK.y=Math.max(ge,WALK.y);}
 else{const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
  if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
  if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;}
 for(const f of FRAME_HOOKS)f(dt,now);
 applyCam();if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}${WALK.on?'  WALK':''}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}  reg ${REG.length}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
