// ---------------------------------------------------------------- camera control
// ---------------------------------------------------------------- DAY / NIGHT
// There was no scene-state toggle in this kit before The Project needed one, so
// this rides the ONE toggle the kit already has: the VIEWS preset table. A
// preset is [cx,cy,cz,tx,ty,tz] and may now carry a SEVENTH element — truthy
// for a night preset — which means every existing route into a view (the
// select, the hidden button list verify.py clicks, a direct setView call) puts
// the scene into the right state with no second control to keep in sync, and
// `--all-views` screenshots the night shots without knowing night exists.
// `n` toggles it by hand while flying around.
//
// Nothing is rebuilt. The fire is baked geometry on unlit materials in its own
// InstancedMeshes (see FIREKIT in 69-mat-salvage.js), so night is four light
// changes, one shader uniform, the fog colour, and three `.visible` flags.
let NIGHT=null;
function setNight(on){on=!!on;if(NIGHT===on)return;NIGHT=on;
 hemi.intensity=on?.24:.75;hemi.color.setHex(on?0x3c4c6a:0xffe2c4);hemi.groundColor.setHex(on?0x1c1512:0x6a3a2a);
 sun.intensity=on?.20:1.7;sun.color.setHex(on?0xa8bce6:0xfff0dc);
 fill.intensity=on?.05:.35;
 skyMat.uniforms.u_n.value=on?1:0;
 scene.fog.color.setHex(on?0x0a0c12:HAZE.getHex());
 renderer.toneMappingExposure=on?1.30:1.05;
 for(const n of FIREKIT)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const f of PORT_NIGHT)try{f(on);}catch(e){reportErr('night hook '+e.stack);}}   // port: the sea, and any segment's own
const ctl={target:new THREE.Vector3(0,100,0),theta:0,phi:1.1,radius:900};
function setView(cx,cy,cz,tx,ty,tz,night){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));setNight(night);}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 // port: never under the ground or the sea (the ancients clamp was y>=2)
 const _gy=Math.max(.8,terrainH(camera.position.x,camera.position.z)+1.2);if(camera.position.y<_gy)camera.position.y=_gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object!==sky&&h.object!==giant);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point;let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}
 insp.textContent=(best?best.name:'unregistered '+(hits[0].object.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0);}
for(const k in VIEWS){if(false){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);ui.appendChild(b);}}
setView(...VIEWS[Object.keys(VIEWS)[0]]);   // first preset is the opening shot, whatever the target calls it
// 00-head.html is shared, so the target names itself here rather than shipping
// a second copy of the page shell.
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — click any structure to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),5,9000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='n')setNight(!NIGHT);keys[k]=true;});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 applyCam();sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,7000);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
