// ================================================================= CORE WALK FRAME — host: the walker carried by the floor under it
// [web] core/walk/frame/95-walk-frame-host.js (core/simulation/PLAN-RIDING.md section 6). Opt-in: a page that has KWALKFRAME
// frames lists it after core/host's shell and calls KHOST.ride once it has taken the host, so no other page changes. It
// lives with the frames, as a module's own host fragments do (core/city's 5x-city-host-*), not in core/host: every build
// that imports core/host/host.py records core/host's listing, so a file added there marks ~90 builds stale.
//
//   KHOST.ride(H, {walk: W, t: () => motion seconds, seats?: F => [{at:[x,y,z], yaw}], sitKey:'e', reach:1.6, sweep:0.3,
//                  walkerR:0.35, walkerH:1.7}) -> R
//        a key step longer than `sweep` metres is walked in 0.1 m samples against the walk blocks and stopped short of the
//        first it meets (the camera's own step is not swept: a slow frame could carry the walker through a car's wall)
//        each frame, after the keys and before the walker stands: the world registry's clock is set to t (KWALKFRAME.at),
//        and a walker standing on a frame floor is carried by the frame's motion since the last frame (KWALKFRAME.carry):
//        its feet and the camera's target moved, the view turned by the frame's turn, so the follow view stays in the
//        car's frame. Boarding is walking through an open door; E by a seat (seats(F), in the frame's coordinates) sits
//        the walker there, held in the frame; E again stands it in the aisle beside the seat.
//   R.state() -> {aboard: frame id | null, sitting: seat index | null, local: [x,y,z] | null}   (window._api.ride too)
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
K.ride=function(H,o){
 const W=o.walk,T=o.t,KF=root.KWALKFRAME;if(!W||!T||!KF)throw new Error('KHOST.ride: walk (a KWALK registry), t and KWALKFRAME are required');
 const C=H.cam,ctl=H.ctl,key=(o.sitKey||'e').toLowerCase(),reach=o.reach==null?1.6:o.reach;
 let last=null,sit=null,aboard=null;
 const feet=()=>C.walkAt?[C.walkAt[0],C.walkAt[2],C.walkAt[1]]:[ctl.target.x,ctl.target.y-ctl.eye,ctl.target.z];
 function place(p){const d=[p[0]-feet()[0],p[1]-feet()[1],p[2]-feet()[2]];ctl.target.x+=d[0];ctl.target.y+=d[1];ctl.target.z+=d[2];C.walkAt=[p[0],p[2],p[1]];}
 H.on(function rideCarry(){
  const t=T();
  if(ctl.walk&&last!=null&&t!==last){
   if(sit){const F=sit.F,w=KF.toWorld(F,sit.at,t);ctl.theta+=KF.pose(F,t).yaw-KF.pose(F,last).yaw;place(w);aboard=F;}
   else{const c=KF.carry(W,feet(),last,t);aboard=c.frame;if(c.frame){place(c.p);ctl.theta+=c.dyaw;}}}
  else if(!ctl.walk){sit=null;aboard=null;}
  KF.at(W,t);last=t;
  if(ctl.walk&&!sit&&C.walkAt)sweep();},'tick');
 /* THE SWEPT STEP. The camera moves the walker by the keys, then stands it and pushes it out of what it overlaps; a step
    longer than a wall is thick (a slow frame: half a second on software GL is a 0.9 m step; a sprint) can land past the
    wall, and the push then settles it on the far side. A step over `sweep` metres (0.3: walking at 60 frames a second is
    0.15) is walked in 0.1 m samples against the walk blocks, static and riding, and stopped at the last free one */
 const SW=o.sweep==null?0.3:o.sweep,WR=o.walkerR==null?0.35:o.walkerR,WH=o.walkerH==null?1.7:o.walkerH;
 function sweep(){
  const a=feet(),dx=ctl.target.x-a[0],dz=ctl.target.z-a[2],d=Math.hypot(dx,dz);if(d<=SW)return;
  const y=a[1]+0.05,h=WH-0.05;if(W.blocked(a[0],y,a[2],WR,h))return;   /* already pressed into something: leave it to the push */
  const n=Math.ceil(d/0.1);let ok=0;
  for(let i=1;i<=n;i++){const u=i/n,x=a[0]+dx*u,z=a[2]+dz*u,f=W.floorBelow(x,z,a[1],0.7),fy=f?f[0]+0.05:y;
   if(W.blocked(x,Math.max(y,fy),z,WR,h))break;ok=u;}
  if(ok<1){ctl.target.x=a[0]+dx*ok;ctl.target.z=a[2]+dz*ok;}}
 root.addEventListener('keydown',function(e){
  if(!ctl.walk||e.key.toLowerCase()!==key||e.target&&/input|textarea|select/i.test(e.target.tagName))return;
  const t=T();
  if(sit){const F=sit.F,s=sit.at,aisle=[s[0]>0?s[0]-0.6:s[0]+0.6,s[1],s[2]];place(KF.toWorld(F,aisle,t));sit=null;return;}
  const st=KF.standing(W,feet(),t);if(!st||!o.seats)return;
  const F=st.frame,l=KF.toLocal(F,feet(),t);let best=null,bd=reach;
  (o.seats(F)||[]).forEach((S,i)=>{const d=Math.hypot(S.at[0]-l[0],S.at[2]-l[2]);if(d<bd){bd=d;best={i,at:S.at.slice(),yaw:S.yaw||0};}});
  if(!best)return;sit={F,i:best.i,at:best.at};place(KF.toWorld(F,best.at,t));
  ctl.theta=KF.pose(F,t).yaw+best.yaw+Math.PI;});
 /* where the walker is now, read live (with the clock paused the carry has nothing to do, so it is not kept from it) */
 const R={state:()=>{const t=T();let f=sit?sit.F:null;if(!f&&ctl.walk){const st=KF.standing(W,feet(),t);f=st?st.frame:null;}
  return {aboard:f?f.id:null,sitting:sit?sit.i:null,local:f?KF.toLocal(f,feet(),t):null};}};
 root._api=root._api||{};root._api.ride=R.state;
 return R;};
})(typeof window!=='undefined'?window:globalThis);
