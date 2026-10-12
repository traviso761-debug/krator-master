// ================================================================= CORE HOST — camera: orbit, pan, fly, walk, the pin, the depth range
// [web] core/host/90-host-camera.js (ROADMAP.md section 10; GODOT-PLAN.md Phase 1). One camera for every build that takes
// core/host, generalised from Streetlab's (kits/catalog/krator-asset-engine.js 85-207: orbit, right-drag pan, WASD with
// Shift and Ctrl, F to walk; settlements/streetlab/targets/voth-city/58-vc-tools.js: the pin, G and F, the walker's
// ledge guard; core/city/50-city-host-streets.js 13-19: the depth range) and from the biome kits' 90-host-camera.js (the
// spherical orbit every kit's setView and preset views are written in, kept to the bit so their pictures do not move).
// It reads nothing of a build's but what KHOST.take hands it (91-host-loop.js makes it with the take's options).
//
//   KHOST.camera(o) -> C        o: {camera, renderer, ground(x,z) or a KFIELD, floor?(x,z), clear?, maxR?, minR?,
//                                   walk?: a KWALK registry, walker?: {step, drop, r, h}, eye?, depth?, keys?, inspect?}
//   C.ctl                       {target, theta, phi, radius, walk, eye, speed}: theta from +z about +y, phi from +y
//   C.setView(cx,cy,cz,tx,ty,tz)  the preset contract every verify.py drives (leaves walking)
//   C.move(dt) / C.apply()      the loop calls them each frame: the keys, then the camera placed and clamped
//   C.walk(on) / C.pin          walking (F); the pin (double-click the ground; G flies to it, F walks from it, Esc drops it)
//   C.pick(clientX, clientY)    the first ground point under the pointer: [x, y, z] or null
//   C.keys                      the keys held now (lower case)
//
// The camera's own keys (one keymap for every build): W A S D move, Q / E down and up (Space up too), Shift faster,
// Ctrl or Alt slower, F walk (from the pin when there is one), G fly to the pin, Esc drop the pin. Mouse: drag to orbit
// (walking: to look), right-drag to pan, wheel to zoom (walking: the walking speed), click to inspect, double-click the
// ground to drop the pin. A build's own keys (o.keys {key: fn}) win over the camera's for the same key. Typing in an
// input never moves the camera. Alt+click is left to tools/edits.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

K.camera=function(o){
 const THREE=o.THREE||root.THREE,camera=o.camera,renderer=o.renderer,cv=renderer.domElement;
 const groundH=typeof o.ground==='function'?o.ground:(o.ground&&o.ground.h?(x,z)=>o.ground.h(x,z):()=>0);
 const floorH=o.floor||groundH;                  // what the eye may not go under (a kit with water: the higher of the two)
 const clear=o.clear==null?1.8:o.clear;          // metres kept between the eye and the floor
 const maxR=o.maxR==null?6000:o.maxR,minR=o.minR==null?3:o.minR;
 const W=o.walk||null,WK=Object.assign({step:.7,drop:1.4,r:.35,h:1.7},o.walker||{});
 const ctl={target:new THREE.Vector3(0,60,0),theta:0,phi:1.1,radius:600,walk:false,eye:o.eye==null?1.7:o.eye,speed:1};
 const keys=Object.create(null);
 const C={ctl,keys,pin:null,pinObjs:[],walkAt:null,camera};
 const fw=new THREE.Vector3(),rt=new THREE.Vector3(),tmp=new THREE.Vector3();
 const heading=()=>{fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));};

 // ---------------------------------------------------------------- the preset contract (the biome kits' setView, to the bit)
 C.setView=function(cx,cy,cz,tx,ty,tz){if(ctl.walk)C.walk(false,true);
  ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);
  ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));};
 // ---------------------------------------------------------------- placing the camera
 C.apply=function(){
  if(ctl.walk){C.stand();const p=Math.max(Math.PI/2-1.35,Math.min(Math.PI/2+1.35,ctl.phi)),sp=Math.sin(p);
   camera.position.copy(ctl.target);
   tmp.set(-sp*Math.sin(ctl.theta),-Math.cos(p),-sp*Math.cos(ctl.theta)).add(camera.position);camera.lookAt(tmp);}
  else{const r=ctl.radius,sp=Math.sin(ctl.phi);
   camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
   if(o.clampCam)o.clampCam(camera.position,ctl.target);
   else{const g=floorH(camera.position.x,camera.position.z)+clear;if(camera.position.y<g)camera.position.y=g;}
   camera.lookAt(ctl.target);}
  if(o.depth)C.depth();};
 // the depth range follows the camera (core/city/50-city-host-streets.js): a fixed near plane cannot tell a street from the
 // ground a kilometre off. Opt-in (o.depth true or {k, min, max}): a build whose pictures are proven keeps its near plane.
 C.depth=function(){const D=o.depth===true?{}:o.depth,k=D.k==null?.04:D.k,lo=D.min==null?.15:D.min,hi=D.max==null?25:D.max;
  const h=Math.max(2,camera.position.y-groundH(camera.position.x,camera.position.z)),nr=clamp(h*k,lo,hi);
  if(Math.abs(nr-camera.near)>camera.near*.15){camera.near=nr;camera.updateProjectionMatrix();}};
 // ---------------------------------------------------------------- the keys: fly (orbit) and walk
 C.move=function(dt){
  let mx=0,mz=0,my=0;if(keys.w)mz+=1;if(keys.s)mz-=1;if(keys.d)mx+=1;if(keys.a)mx-=1;if(keys.e||keys[' '])my+=1;if(keys.q)my-=1;
  if(!mx&&!mz&&!my)return;
  let base=ctl.walk?9*ctl.speed:ctl.radius*.6;      // flying: the biome kits' speed, which scales with how far out you are
  if(keys.shift)base*=3.4;if(keys.control||keys.alt)base*=.28;
  const sp=base*dt;heading();
  if(mz)ctl.target.addScaledVector(fw,mz*sp);if(mx)ctl.target.addScaledVector(rt,mx*sp);if(my&&!ctl.walk)ctl.target.y+=my*sp;};
 // ---------------------------------------------------------------- walking: the feet on the ground (or a KWALK floor), a ledge guard
 C.standY=function(x,z,below){const g=groundH(x,z);if(!W)return g;const fs=W.floorsAt(x,z);
  for(let i=0;i<fs.length;i++)if(below==null||fs[i][0]<=below)return Math.max(g,fs[i][0]);return g;};
 C.stand=function(){
  let x=ctl.target.x,z=ctl.target.z;const A=C.walkAt||[x,z,ctl.target.y-ctl.eye];
  const at=(px,pz)=>{const g=groundH(px,pz),f=W&&W.floorBelow(px,pz,A[2],WK.step);return f&&f[0]>=g-.3?f[0]:g;};
  let y=at(x,z);
  if(W&&A[2]-y>WK.drop&&W.floorBelow(A[0],A[1],A[2],WK.step)){   // the edge of a deck, a terrace, a bridge: stay on it (slide along it first)
   const yx=at(x,A[1]),yz=at(A[0],z);
   if(A[2]-yx<=WK.drop){z=A[1];y=yx;}else if(A[2]-yz<=WK.drop){x=A[0];y=yz;}else{x=A[0];z=A[1];y=A[2];}}
  if(W&&W.blocked(x,y,z,WK.r,WK.h)){const q=W.push(x,y,z,WK.r,WK.h);x=q[0];z=q[1];y=at(x,z);}
  C.walkAt=[x,z,y];ctl.target.set(x,y+ctl.eye,z);};
 C.walk=function(on,quiet){on=on===undefined?!ctl.walk:!!on;if(on===ctl.walk)return;heading();
  if(on){const x=camera.position.x,z=camera.position.z;C.walkAt=null;
   ctl.target.set(x,C.standY(x,z)+ctl.eye,z);ctl.walk=true;
   const down=clamp((Math.PI/2-ctl.phi)*.3,-.2,.35);ctl.phi=Math.PI/2-down;}
  else{ctl.walk=false;C.walkAt=null;if(!quiet){ctl.radius=Math.max(30,ctl.radius);ctl.target.addScaledVector(fw,ctl.radius*.35);
   ctl.target.y=groundH(ctl.target.x,ctl.target.z)+6;ctl.phi=Math.PI/2-.55;}}
  if(K.onWalk)K.onWalk(ctl.walk);};
 // ---------------------------------------------------------------- picking the ground (a ray marched against ground(x,z))
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 C.ray=function(cx,cy){const r=cv.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);return ray;};
 C.pick=function(cx,cy){const R=C.ray(cx,cy).ray,O=R.origin,D=R.direction,far=Math.max(camera.far,1);
  let t0=0,step=Math.max(.5,(O.y-groundH(O.x,O.z))*.02);
  if(O.y<groundH(O.x,O.z))return null;
  for(let t=step;t<far;t+=step){const x=O.x+D.x*t,y=O.y+D.y*t,z=O.z+D.z*t;
   if(y<=groundH(x,z)){let a=t0,b=t;for(let i=0;i<24;i++){const m=(a+b)/2,X=O.x+D.x*m,Z=O.z+D.z*m;if(O.y+D.y*m<=groundH(X,Z))b=m;else a=m;}
    const X=O.x+D.x*b,Z=O.z+D.z*b;return[X,C.standY(X,Z),Z];}
   t0=t;step=Math.min(step*1.04,40);}
  return null;};
 // ---------------------------------------------------------------- the pin (Dhelv's markAt / markGo, as Streetlab has it)
 C.pinDraw=function(){const scene=o.scene;C.pinObjs.forEach(q=>{scene.remove(q);q.geometry.dispose();});C.pinObjs=[];if(!C.pin)return;
  const x=C.pin[0],g=C.pin[1],z=C.pin[2],col=0xffe14a,s=Math.max(1,Math.min(40,ctl.radius*.02));
  const m=new THREE.LineBasicMaterial({color:col,depthTest:false,transparent:true});
  const stem=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,g,z),new THREE.Vector3(x,g+26*s/5,z)]),m);
  const ring=[];for(let i=0;i<=24;i++)ring.push(new THREE.Vector3(x+Math.cos(i/24*Math.PI*2)*s,g+.8,z+Math.sin(i/24*Math.PI*2)*s));
  const rim=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring),m);
  [stem,rim].forEach(q=>{q.renderOrder=45;q.frustumCulled=false;q.userData.probeSkip=true;q.userData.khost='pin';scene.add(q);C.pinObjs.push(q);});};
 C.pinGo=function(){if(!C.pin)return;if(ctl.walk)C.walk(false,true);ctl.target.set(C.pin[0],C.pin[1],C.pin[2]);ctl.radius=Math.max(30,Math.min(ctl.radius,150));};
 C.pinWalk=function(){const P=C.pin;C.walkAt=[P[0],P[2],P[1]];ctl.target.set(P[0],P[1]+ctl.eye,P[2]);ctl.walk=true;ctl.phi=Math.PI/2+.05;if(K.onWalk)K.onWalk(true);};
 // ---------------------------------------------------------------- input
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 let drag=null;
 cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
 cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&!e.altKey&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4&&o.inspect)o.inspect(e.clientX,e.clientY);drag=null;});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
  if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=ctl.walk?clamp(ctl.phi-dy*.005,Math.PI/2-1.35,Math.PI/2+1.35):clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
  else{heading();const f=ctl.walk?.05:ctl.radius*.0015;ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
 cv.addEventListener('wheel',e=>{if(ctl.walk)ctl.speed=clamp(ctl.speed*(e.deltaY>0?.9:1.1),.15,8);
  else ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),minR,maxR);e.preventDefault();},{passive:false});
 cv.addEventListener('dblclick',e=>{if(K.busy&&K.busy())return;const h=C.pick(e.clientX,e.clientY);if(!h)return;
  C.pin=[+h[0].toFixed(1),+h[1].toFixed(2),+h[2].toFixed(1)];C.pinDraw();});
 const MOVE={w:1,a:1,s:1,d:1,q:1,e:1,' ':1};
 root.addEventListener('keydown',e=>{if(typing(e)||e.metaKey)return;const k=e.key.toLowerCase();
  if(o.keys&&o.keys[k]&&!e.ctrlKey){keys[k]=true;o.keys[k](e);return;}
  keys[k]=true;if(MOVE[k]&&!e.ctrlKey)e.preventDefault();
  if(e.ctrlKey)return;
  if(k==='f'){if(C.pin&&!ctl.walk)C.pinWalk();else C.walk();}
  else if(k==='g'&&C.pin)C.pinGo();
  else if(k==='escape'&&C.pin){C.pin=null;C.pinDraw();}});
 root.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
 root.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
 root.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 return C;};
})(typeof window!=='undefined'?window:globalThis);
