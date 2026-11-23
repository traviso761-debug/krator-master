// ================================================================= CORE — anomaly: the walker in a zone (the heavy walk, the slow walk, time owed)
// [web] PLAN-ANOMALIES.md 5 ("Gravity": heavy, easy) and 14. The host camera's walker (core/host/90-host-camera.js) has no
// vertical motion, so gravity is not a multiplier on a fall: it is KANOM.walk's factors on what the walker has, its speed
// and its eye, read at the walker's feet each frame. Nothing in core/host changes: this file sets C.ctl.speed and C.ctl.eye
// and puts them back when the walker leaves the zone or stops walking. In the subfolder on purpose: a page opts in by path.
//
//   KANOM.bindWalker(C, o) -> Wk     C a KHOST.camera; o: {anom (a registry, default KANOM.page as it is at each step), hook (fn(step) that calls
//                                    step(dt) every frame; default ATMOS.hook when the page has core/atmos, bound after ATMOS.init)}
//   Wk.step(dt)                      read the zone at the feet, set the walk, count the time owed (KANOM.owed)
//   Wk.state                         {at, walk, owed, aged, inside}: what the last step read (the verify reads it)
//   Wk.unbind()                      the walker's own speed and eye back; the step does nothing after
// The walker's own speed (the wheel's) is kept apart from the zone's factor, so leaving restores it exactly.
(function(root){
'use strict';
const N=root.KANOM;if(!N)throw new Error('core/anomaly/host/90-anomaly-walker.js: load core/anomaly/20-core-anomaly.js first');
N.bindWalker=function(C,o){o=o||{};const reg=()=>o.anom||N.page,ctl=C.ctl,eye0=ctl.eye;let applied=1,on=true;
 const Wk={state:{at:N.NORMAL,walk:N.WALK0,owed:0,aged:0,inside:false}};
 Wk.step=function(dt){if(!on)return;const S=Wk.state,user=ctl.speed/applied;
  if(!ctl.walk){ctl.speed=user;applied=1;ctl.eye=eye0;S.at=N.NORMAL;S.walk=N.WALK0;S.inside=false;return;}
  const x=ctl.target.x,z=ctl.target.z,feet=ctl.target.y-ctl.eye,at=reg().at(x,feet,z),w=N.walk(at);
  S.at=at;S.walk=w;S.inside=at!==N.NORMAL;ctl.speed=user*w.speed;applied=w.speed;ctl.eye=eye0*w.eye;
  if(dt>0)N.owed(S,at.time,dt);};
 Wk.unbind=function(){if(!on)return;ctl.speed=ctl.speed/applied;applied=1;ctl.eye=eye0;on=false;};
 /* ATMOS is a top-level const in a page (not a property of the global): looked up by name; bind after ATMOS.init (init clears its hooks) */
 const AT=typeof ATMOS!=='undefined'?ATMOS:root.ATMOS,hook=o.hook||(AT&&AT.hook?fn=>AT.hook((t,hr,dt)=>fn(dt)):null);if(hook)hook(Wk.step);
 return Wk;};
})(typeof globalThis!=='undefined'?globalThis:this);
