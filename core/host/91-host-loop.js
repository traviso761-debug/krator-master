// ================================================================= CORE HOST — the frame loop, the world clock, KHOST.take
// [web] core/host/91-host-loop.js (ROADMAP.md section 10; GODOT-PLAN.md Phase 1, "The world clock"). One frame loop for a
// page: it owns the world clock (core/clock's KCLOCK, which the build lists before this file), steps it with the frame's
// real seconds, calls every subscriber as fn(dt, clock), keeps one throwing subscriber from stopping the others, places the
// camera (90-host-camera.js), draws, and sets window._ready after the first frame exactly as the biome kits' loops did.
//
//   KHOST.take(o) -> {clock, camera, ctl, setView, go, err, ...}   the one call a build makes, after its world is built.
//     o.scene, o.camera, o.renderer   the build's (a build without them gets a scene, a 50-degree camera and a renderer)
//     o.ground                        terrainH(x,z), or a KFIELD (its .h): the camera's floor, the pin, the walker
//     o.pick(ray) -> [x, y, z] | null the build's own pick for the pin, tried before the ground (Voth: inside a canton)
//     o.click(cx, cy) -> true         the build takes the click itself (the inspector is not asked)
//     o.floor, o.clear, o.clampCam    what the eye may not go under (default ground), the clearance (1.8 m), or a clamp
//     o.registry                      the build's registered volumes [{name, x, y?, z, r, h}] (inspector, probe)
//     o.views {name: [cx,cy,cz,tx,ty,tz] or () => that}, o.onView(name), o.start   the presets (verify.py clicks
//                                   '#ui button'); a function is called when its preset is chosen (a subject that moves)
//     o.sky {follow(camera), hour?(h)} the sky kept on the eye each frame; hour(h) puts the sky at a world hour
//     o.ticks  [fn(dt, seconds)]      the biome kits' TICKS: the array is read live, every frame, bodies unchanged
//     o.hourTicks [fn(dt, hour)]      the life builds' convention; o.frameHooks [fn(nowMs)]: Streetlab's _frameHooks
//     o.clock {hour, running, scale, speeds, obj?, onSet?(h)}   the clock's start (hour 12, held, as the preview pages open);
//                                   obj: a KCLOCK the page already made, adopted; onSet: called when the hour slider moves;
//                                   maxStep: the longest step the clock takes in a frame (default 0.1 s; the camera keeps 0.1)
//     o.draw(scene, camera, dt)       the build's own draw in place of renderer.render (a post pass: a heat shimmer)
//     o.layers, o.stats, o.inspect, o.exporters, o.controls, o.keys, o.title, o.hint, o.build   the panel (92)
//     o.budget, o.types, o.regHas, o.checks, o.api   the probe (95-host-probe.js)
//   KHOST.on(fn, phase)             a subscriber, fn(dt, clock): phase 'tick' (default: before the camera is placed),
//                                   'view' (after it, before drawing: LOD, the sky), 'after' (after drawing)
//   KHOST.off(fn)
//   Query: ?hour=7.5 (also #hour=), ?time=run starts the world hour running, ?t=12 pins motion time (repeatable shots).
//
// The clock: dt is real seconds since the last frame, capped at 0.1, times the speed (0 while paused or pinned); t is motion
// time; hour and day are world time, held unless running. A subscriber that throws is reported once to the error panel and
// skipped from then on; the others run. A throwing draw is reported once and retried each frame (as before).
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
const SUBS={tick:[],view:[],after:[]},DEAD=new Set();
K.on=function(fn,phase){(SUBS[phase||'tick']||SUBS.tick).push(fn);return fn;};
K.off=function(fn){for(const p in SUBS){const i=SUBS[p].indexOf(fn);if(i>=0)SUBS[p].splice(i,1);}};
K.err=K.err||function(m){console.error(m);};
const name=fn=>fn.khostName||fn.name||'anonymous';
// run one subscriber: a throw is reported once, with its stack, and the subscriber is skipped from then on
function call(fn,label,a,b){if(DEAD.has(fn))return;try{fn(a,b);}catch(e){DEAD.add(fn);K.err(label+' '+name(fn)+' threw and is skipped from now on: '+((e&&e.stack)||e));}}
K.dead=()=>DEAD.size;
// a module that needs the take (93 inspect, 94 marks, 96 pictures, 97 minimap, 98 edit, 99 cutaway): fn(H) once the panel and
// the probe have it, or at once when it loads after the take
const TAKERS=[];K.onTake=function(fn){if(K.taken&&K.host)fn(K.host);else TAKERS.push(fn);return fn;};

function param(k){const m=new RegExp('[?&#]'+k+'=([^&#]*)').exec(location.search+location.hash);return m?decodeURIComponent(m[1]):null;}
K.param=param;

K.take=function(o){
 o=o||{};const THREE=o.THREE||root.THREE;
 if(typeof KCLOCK==='undefined')throw new Error('core/host 91-host-loop: load core/clock/20-core-clock.js first (core/host/host.py lists it)');
 if(K.taken)throw new Error('KHOST.take: called twice');
 // ---------------------------------------------------------------- what the build hands in (or a plain default)
 const scene=o.scene||new THREE.Scene();
 const renderer=o.renderer||(()=>{const r=new THREE.WebGLRenderer({antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.setSize(innerWidth,innerHeight);document.body.appendChild(r.domElement);return r;})();
 const camera=o.camera||new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
 const CO=o.clock||{},hq=param('hour');
 // o.clock.obj: a page's own KCLOCK (Voth's VC.clock, which its simulation reads) is adopted as the host's: the loop steps it
 const clock=CO.obj||KCLOCK.make({hour:hq!=null&&isFinite(+hq)?+hq:(CO.hour==null?12:CO.hour),running:param('time')==='run'||!!CO.running,scale:CO.scale==null?1:CO.scale});
 const tq=param('t');if(tq!=null&&isFinite(+tq))clock.fixed=+tq;
 const H=K.host={o,scene,renderer,camera,clock,views:o.views||{},registry:o.registry||[]};
 // ---------------------------------------------------------------- the camera (90) and the panel (92)
 const C=K.cam=K.camera({THREE,scene,camera,renderer,ground:o.ground,floor:o.floor,clear:o.clear,clampCam:o.clampCam,maxR:o.maxR,minR:o.minR,
  walk:o.walk,walker:o.walker,eye:o.eye,depth:o.depth,keys:o.keys,pick:o.pick,inspect:(x,y)=>K.inspectAt&&K.inspectAt(x,y)});
 K.setView=C.setView;
 K.go=function(v){if(!(v in H.views))return false;if(o.onView)o.onView(v);let at=H.views[v];if(typeof at==='function')at=at();if(!at)return false;C.setView(at[0],at[1],at[2],at[3],at[4],at[5]);if(K.viewShown)K.viewShown(v);return true;};
 if(K.panelTake)K.panelTake(H);
 if(K.probeTake)K.probeTake(H);
 for(const f of TAKERS){try{f(H);}catch(e){K.err('take '+(f.name||'module')+': '+((e&&e.stack)||e));}}
 // ---------------------------------------------------------------- the first view
 const first=o.start||Object.keys(H.views)[0];if(first)K.go(first);
 // ---------------------------------------------------------------- the frame
 const ticks=o.ticks||null,hourTicks=o.hourTicks||null,hooks=o.frameHooks||null,sky=o.sky||null,draw=o.draw||null;
 let last=performance.now(),drawErr=false;
 function frame(){
  const now=performance.now(),raw=Math.max(0,(now-last)/1000),real=Math.min(.1,raw);last=now;
  clock.step(CO.maxStep==null?real:Math.min(CO.maxStep,raw));const dt=clock.dt;   // maxStep: a page whose clock ran on real time between frames (Voth) keeps it
  C.move(real);
  if(ticks)for(let i=0;i<ticks.length;i++)call(ticks[i],'tick',dt,clock.t);
  if(hourTicks)for(let i=0;i<hourTicks.length;i++)call(hourTicks[i],'tick',dt,clock.hour);
  if(hooks)for(let i=0;i<hooks.length;i++)call(hooks[i],'frame hook',clock.t*1000);
  for(let i=0;i<SUBS.tick.length;i++)call(SUBS.tick[i],'subscriber',dt,clock);
  C.apply();
  if(sky){if(sky.follow)call(sky.follow,'sky',camera);if(sky.hour&&clock.hour!==H.skyHour){H.skyHour=clock.hour;call(sky.hour,'sky hour',clock.hour);}}
  for(let i=0;i<SUBS.view.length;i++)call(SUBS.view[i],'view',dt,clock);
  const hid=K.layersHide?K.layersHide():null;
  try{if(draw)draw(scene,camera,dt);else renderer.render(scene,camera);}catch(e){if(!drawErr){drawErr=true;K.err('render: '+((e&&e.stack)||e));}}
  if(hid)K.layersShow(hid);
  for(let i=0;i<SUBS.after.length;i++)call(SUBS.after[i],'after',dt,clock);
  if(K.panelFrame)K.panelFrame(real);
  requestAnimationFrame(frame);}
 K.taken=true;
 frame();root._ready=true;
 return {clock,camera,renderer,scene,ctl:C.ctl,cam:C,setView:C.setView,go:K.go,err:K.err,on:K.on};};
})(typeof window!=='undefined'?window:globalThis);
