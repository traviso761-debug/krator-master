// ================================================================= CORE HOST — camera: orbit, pan, fly, walk, the pin, the depth range
// [web] core/host/90-host-camera.js (ROADMAP.md section 10; GODOT-PLAN.md Phase 1). One camera for every build that takes
// core/host, generalised from Streetlab's (kits/catalog/krator-asset-engine.js 85-207: orbit, right-drag pan, WASD with
// Shift and Ctrl, F to walk; settlements/voth/targets/voth-city/58-vc-tools.js: the pin, G and F, the walker's
// ledge guard; core/city/50-city-host-streets.js 13-19: the depth range) and from the biome kits' 90-host-camera.js (the
// spherical orbit every kit's setView and preset views are written in, kept to the bit so their pictures do not move).
// It reads nothing of a build's but what KHOST.take hands it (91-host-loop.js makes it with the take's options).
//
//   KHOST.camera(o) -> C        o: {camera, renderer, ground(x,z) or a KFIELD, floor?(x,z), clear?, maxR?, minR?,
//                                   walk?: a KWALK registry, walker?: {step, drop, r, h}, eye?, depth?, keys?, inspect?,
//                                   pick?: fn(ray) -> [x, y, z] | null, tried before the ground for the double-click's pin,
//                                   pickScene?: false (the pin on the ground's hit only, not checked against the scene)}
//                               walker: {step .7, drop 1.4, r .35, h 1.7, sweep .3 (a key step longer is swept; 0 off)}
//   C.ctl                       {target, theta, phi, radius, walk, eye, speed}: theta from +z about +y, phi from +y
//   C.setView(cx,cy,cz,tx,ty,tz)  the preset contract every verify.py drives (leaves walking)
//   C.move(dt) / C.apply()      the loop calls them each frame: the keys, then the camera placed and clamped
//   C.walk(on) / C.pin          walking (F: on the floor under the eye); the pin (double-click; G flies to it, F walks from it, Esc drops it)
//   C.pick(clientX, clientY)    the point under the pointer for the pin: the ground's where the scene draws it, else the first thing
//                               drawn, on the floor under it: [x, y, z] or null. C.groundHit(ray), C.sceneHits(raycaster, far)
//   C.drawn(hit)                a raycast hit on something drawn (visible up the tree, not clipped by a cut): the inspector's filter
//   C.walker                    the walker's options (WK above), live
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
// ---------------------------------------------------------------- the walker's rules, pure (node core/host/test-feet.js): no THREE, no DOM
//   K.feet.under(W, ground, x, z, y, step, head)  the floor under a point: the highest KWALK floor at or below y + step (W.floorBelow),
//       or the ground when that is higher (by 0.3 m: the walker's old rule); the ground counts only where it is not more than `head`
//       over y (else it is a roof: the surface over a tunnel). No floor and the ground over the head: the ground (nothing better)
//   K.feet.sweep(W, at, A, tx, tz, {r, h, sweep})  how much of the step from the feet A [x, z, y] to (tx, tz) is free of walk blocks:
//       1 for a step no longer than `sweep` or one starting pressed into a block (the push's); else the last free 0.1 m sample's
//       fraction. at(x, z) is the floor along the way
//   K.feet.planesClip(planes, intersect, x, y, z)  a point a material's clipping planes cut away (three's rule: any plane's negative
//       side, or with clipIntersection every plane's)
const FEET=K.feet={
 under(W,ground,x,z,y,step,head){const g=ground(x,z),f=W?W.floorBelow(x,z,y,step):null;
  if(g>y+head)return f?f[0]:g;
  return f&&f[0]>=g-.3?f[0]:g;},
 sweep(W,at,A,tx,tz,o){const dx=tx-A[0],dz=tz-A[1],d=Math.hypot(dx,dz),sw=o.sweep==null?.3:o.sweep;if(!(d>sw))return 1;
  const r=o.r==null?.35:o.r,h=(o.h==null?1.7:o.h)-.05,y=A[2]+.05;if(W.blocked(A[0],y,A[1],r,h))return 1;
  const n=Math.min(400,Math.ceil(d/.1));let ok=0;
  for(let i=1;i<=n;i++){const u=i/n,x=A[0]+dx*u,z=A[1]+dz*u;if(W.blocked(x,Math.max(y,at(x,z)+.05),z,r,h))break;ok=u;}
  return ok;},
 planesClip(P,inter,x,y,z){if(!P||!P.length)return false;let all=true,any=false;
  for(let i=0;i<P.length;i++){const v=P[i].normal.x*x+P[i].normal.y*y+P[i].normal.z*z+P[i].constant;if(v<0)any=true;else all=false;}
  return inter?all:any;}};

K.camera=function(o){
 const THREE=o.THREE||root.THREE,camera=o.camera,renderer=o.renderer,cv=renderer.domElement;
 const groundH=typeof o.ground==='function'?o.ground:(o.ground&&o.ground.h?(x,z)=>o.ground.h(x,z):()=>0);
 const floorH=o.floor||groundH;                  // what the eye may not go under (a kit with water: the higher of the two)
 const clear=o.clear==null?1.8:o.clear;          // metres kept between the eye and the floor
 const maxR=o.maxR==null?6000:o.maxR,minR=o.minR==null?3:o.minR;
 const W=o.walk||null,WK=Object.assign({step:.7,drop:1.4,r:.35,h:1.7,sweep:.3},o.walker||{});
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
  if(mz)ctl.target.addScaledVector(fw,mz*sp);if(mx)ctl.target.addScaledVector(rt,mx*sp);if(my&&!ctl.walk)ctl.target.y+=my*sp;
  /* the swept step (the riding lab's, core/walk/frame/95-walk-frame-host.js): a key step longer than WK.sweep (0.3 m) is walked in
     0.1 m samples against the walk blocks and stopped at the last free one. At 2 frames a second a step is 0.9 m (dt is capped at
     0.1 s), longer than a 0.15 m car wall, and the stand's push then settled the walker on the far side (BUGS-2026-11-15 C6) */
  if(ctl.walk&&W&&C.walkAt&&WK.sweep>0){const A=C.walkAt,u=FEET.sweep(W,(px,pz)=>under(px,pz,A[2],WK.step,WK.h),A,ctl.target.x,ctl.target.z,WK);
   if(u<1){ctl.target.x=A[0]+(ctl.target.x-A[0])*u;ctl.target.z=A[1]+(ctl.target.z-A[1])*u;}}};
 // ---------------------------------------------------------------- walking: the feet on the floor under them, a ledge guard, a swept step
 // The floor under a point is K.feet.under's (below): a KWALK floor at or below it, or the ground where the ground is not over the
 // head. A cave page's ground is the surface or a constant fallback, so it is a roof over a tunnel, not a floor (BUGS-2026-11-15 C5).
 C.standY=function(x,z,below){const g=groundH(x,z);if(!W)return g;const fs=W.floorsAt(x,z);
  if(below==null)return fs.length?Math.max(g,fs[0][0]):g;
  for(let i=0;i<fs.length;i++)if(fs[i][0]<=below)return g<=below?Math.max(g,fs[i][0]):fs[i][0];return g;};
 const under=(x,z,y,step,head)=>FEET.under(W,groundH,x,z,y,step,head);
 C.walker=WK;
 C.stand=function(){
  let x=ctl.target.x,z=ctl.target.z;const A=C.walkAt||[x,z,ctl.target.y-ctl.eye];
  const at=(px,pz)=>under(px,pz,A[2],WK.step,WK.h);
  let y=at(x,z);
  if(W&&A[2]-y>WK.drop&&W.floorBelow(A[0],A[1],A[2],WK.step)){   // the edge of a deck, a terrace, a bridge: stay on it (slide along it first)
   const yx=at(x,A[1]),yz=at(A[0],z);
   if(A[2]-yx<=WK.drop){z=A[1];y=yx;}else if(A[2]-yz<=WK.drop){x=A[0];y=yz;}else{x=A[0];z=A[1];y=A[2];}}
  if(W&&W.blocked(x,y,z,WK.r,WK.h)){const q=W.push(x,y,z,WK.r,WK.h);x=q[0];z=q[1];y=at(x,z);}
  C.walkAt=[x,z,y];ctl.target.set(x,y+ctl.eye,z);};
 // F stands on the floor under the eye (the camera's own height), not the highest floor at x, z: from a tunnel under a town you stay
 // in the tunnel (Dhelv's braid), and on a cave page you stay in the cave. Nothing under the eye: the ground, as before
 C.walk=function(on,quiet){on=on===undefined?!ctl.walk:!!on;if(on===ctl.walk)return;heading();
  if(on){const x=camera.position.x,z=camera.position.z;C.walkAt=null;
   ctl.target.set(x,under(x,z,camera.position.y,.3,.3)+ctl.eye,z);ctl.walk=true;
   const down=clamp((Math.PI/2-ctl.phi)*.3,-.2,.35);ctl.phi=Math.PI/2-down;}
  else{const fy=C.walkAt?C.walkAt[2]:ctl.target.y-ctl.eye;ctl.walk=false;C.walkAt=null;
   if(!quiet){ctl.radius=Math.max(30,ctl.radius);ctl.target.addScaledVector(fw,ctl.radius*.35);
   ctl.target.y=under(ctl.target.x,ctl.target.z,fy+WK.step,WK.step,WK.h)+6;ctl.phi=Math.PI/2-.55;}}
  if(K.onWalk)K.onWalk(ctl.walk);};
 // ---------------------------------------------------------------- picking the ground (a ray marched against ground(x,z))
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 C.ray=function(cx,cy){const r=cv.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);return ray;};
 // the ground's hit along a ray: {p: [x, standY, z], t} or null (none within camera.far, or the ray starts under the ground)
 C.groundHit=function(R){const O=R.origin,D=R.direction,far=Math.max(camera.far,1);
  let t0=0,step=Math.max(.5,(O.y-groundH(O.x,O.z))*.02);
  if(O.y<groundH(O.x,O.z))return null;
  for(let t=step;t<far;t+=step){const x=O.x+D.x*t,y=O.y+D.y*t,z=O.z+D.z*t;
   if(y<=groundH(x,z)){let a=t0,b=t;for(let i=0;i<24;i++){const m=(a+b)/2,X=O.x+D.x*m,Z=O.z+D.z*m;if(O.y+D.y*m<=groundH(X,Z))b=m;else a=m;}
    const X=O.x+D.x*b,Z=O.z+D.z*b;return {p:[X,C.standY(X,Z),Z],t:b};}
   t0=t;step=Math.min(step*1.04,40);}
  return null;};
 // a hit on something drawn: the object and every parent visible, its material shown, the point not clipped away by a cut. three's
 // Raycaster ignores visibility up the tree and every clipping plane, so the inspector and the pin ask this (BUGS-2026-11-15 C8)
 C.drawn=function(h){for(let q=h.object;q;q=q.parent)if(!q.visible)return false;
  let m=h.object.material;if(Array.isArray(m))m=h.face&&m[h.face.materialIndex];if(m&&m.visible===false)return false;
  const p=h.point,S=K.section;if(m&&m.isShaderMaterial&&!m.clipping)return true;   /* three clips a ShaderMaterial only when it asks */
  if(renderer.clippingPlanes&&FEET.planesClip(renderer.clippingPlanes,false,p.x,p.y,p.z))return false;
  if(!m||!m.clippingPlanes||!m.clippingPlanes.length||!renderer.localClippingEnabled)return true;
  if(S&&S.clipped&&m.clippingPlanes===S.planes)return !S.clipped(p.x,p.y,p.z);   /* 99-host-section's planes: its own filter */
  return !FEET.planesClip(m.clippingPlanes,m.clipIntersection,p.x,p.y,p.z);};
 // what the scene draws along a ray, for the pin: meshes only (no lines, points or sprites), drawn, not the host's own marks or the
 // probe's helpers, not a sky dome (BackSide), not a dense instanced crowd (grass: it says nothing of where the floor is)
 C.sceneHits=function(rc,far){const scene=o.scene;if(!scene)return [];const list=[];
  (function walk(q){if(!q.visible)return;const u=q.userData;if(u&&(u.khost||u.probeSkip))return;
   if(q.isMesh&&!(q.isInstancedMesh&&q.count>2000)){const m=Array.isArray(q.material)?q.material[0]:q.material;if(m&&m.side!==THREE.BackSide)list.push(q);}
   for(let i=0;i<q.children.length;i++)walk(q.children[i]);})(scene);
  const f0=rc.far;rc.far=far;let hs;try{hs=rc.intersectObjects(list,false);}finally{rc.far=f0;}
  return hs.filter(C.drawn);};
 // the double-click's point. The ground's hit is the pin only where the scene draws something there: a cave page's ground() is a
 // constant fallback (Loj Twenny: y -60) or the surface over the tunnel, so the pin went to that depth (BUGS-2026-11-15 C7). Then
 // the first thing drawn under the pointer, on the floor under it; nothing drawn: no pin. A scene with nothing at all along the ray
 // keeps the ground's hit (a ground drawn by a shader has no triangles to hit). o.pickScene false: the ground's hit only, as before
 C.pick=function(cx,cy){const rc=C.ray(cx,cy),R=rc.ray,O=R.origin;
  if(o.pick){const h=o.pick(R);if(h)return h;}   // the build's own pick first ([x, y, z] or null: Voth's inside a canton)
  const G=C.groundHit(R);if(o.pickScene===false)return G?G.p:null;
  if(!G&&O.y>=groundH(O.x,O.z))return null;      // the sky
  const hs=C.sceneHits(rc,G?G.t*1.25+5:Math.max(camera.far,1));
  if(G&&(!hs.length||hs.some(h=>h.distance>=G.t*.8-2)))return G.p;
  if(!hs.length)return null;
  /* on the floor under the hit when it is within a storey (a wall or a crate hit: its room's floor), else the hit itself (the
     surface over a cave is not the cave's floor) */
  const p=hs[0].point,f=W?W.floorBelow(p.x,p.z,p.y,.3):null;return [p.x,f&&p.y-f[0]<=4?f[0]:p.y,p.z];};
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
 cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};try{cv.setPointerCapture(e.pointerId);}catch(err){}});   /* inside the artifact viewer's frame the pointer can be gone already (NotFoundError) */
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
