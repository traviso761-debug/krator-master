// ================================================================= CORE — walk frames: floors that ride (KWALKFRAME)
// [G data] core/simulation/PLAN-RIDING.md section 2. Opt-in: a page lists this fragment after core/walk only when something
// rides (a train's cars, later a tram, a ship's deck, a wagon's bed), so every other page is unchanged.
//
// A FRAME GROUP is an independent KWALK registry in a vehicle's own frame (+z forward, +x side +1, y up: KTRANSIT.frame's
// axes) with a pose function of time. Its floors, walls, seats' blocks and door blocks are registered once, in vehicle
// coordinates, with the calls every kit uses. The first frame() wraps the world registry's four lookups (floorsAt,
// floorBelow, blocked, push): each answers for the static records exactly as before, then takes the point into every
// frame whose bounding circle holds it at the clock's time, asks that frame's registry and brings the answer back.
// reach() stays static: a vehicle's interior is audited in its own frame (F.walk.reach).
//
//   const F=KWALKFRAME.frame(W, {id, pose:t=>({x,y,z,yaw,pitch,roll}), r, source})   W a KWALK registry (KWALK itself, or
//                     KWALK.create()); r the bounding radius about the pose's origin (default: from what is registered, + 1 m);
//                     source: plain data saying where the pose comes from (the export carries it: a ride source and car)
//   F.floor(o) F.strip(o) F.poly(o) F.block(box, tag)     as KWALK's, in vehicle coordinates; o.off true makes a floor
//                     switched off from the start (a door's step plate). F.walk is the frame's own registry
//   KWALKFRAME.setFloor(rec, on)   switch a frame floor (an array of them) off or on; blocks switch with W.setBlock as ever
//   KWALKFRAME.at(W, t)            the clock every wrapped lookup reads (motion seconds); KWALKFRAME.time(W)
//   W.floorsAt / floorBelow / blocked / push    the static answer and every frame's; a record from a frame carries .frame
//   KWALKFRAME.pose(F, t)          the pose (cached for the last t), pitch and roll defaulting to 0
//   KWALKFRAME.toLocal(F, p, t), toWorld(F, p, t)    [x,y,z] between the world and the frame at t
//   KWALKFRAME.standing(W, p, t)   the floor a walker at p stands on at t when it is a frame's: {frame, rec, y}, else null
//   KWALKFRAME.carry(W, p, t0, t1) the moving platform: {p:[x,y,z], frame, dyaw}. A point standing on a frame floor at t0 is
//                     held fixed in that frame and returned where it is at t1, with the frame's turn since; else unchanged
//   KWALKFRAME.frames(W), KWALKFRAME.remove(W, id)
//   KWALKFRAME.export(W)           {format:'krator-walk-frames', version, convention, frames:[{id, r, source, floors, blocks}]}:
//                     each frame's floors and blocks in its own coordinates (Godot: an AnimatableBody3D's children)
//
// The pose is a full rotation (roll about +z, then pitch lifting the front, then yaw about +y, then the origin); the plan
// view of blocked and push works in the frame's own plane, exact for yaw and close for pitch and roll under 0.1 rad (the
// Line's grades are 4 % at most). A pose steeper than that is counted in F.steep, not refused.
(function(root){
  'use strict';
  var STEEP=0.1;
  function poseOf(F,t){
    if(F._t===t&&F._p)return F._p;
    var q=F.poseFn(t)||{},d=function(v){return v==null?0:v;},y=d(q.yaw),p=d(q.pitch),r=d(q.roll);
    if(Math.abs(p)>STEEP||Math.abs(r)>STEEP)F.steep++;
    var P={x:d(q.x),y:d(q.y),z:d(q.z),yaw:y,pitch:p,roll:r,cy:Math.cos(y),sy:Math.sin(y),cp:Math.cos(p),sp:Math.sin(p),cr:Math.cos(r),sr:Math.sin(r)};
    F._t=t;F._p=P;return P;
  }
  function toWorldP(P,x,y,z){
    var x1=x*P.cr-y*P.sr,y1=x*P.sr+y*P.cr,z1=z;                 /* roll about +z */
    var y2=y1*P.cp+z1*P.sp,z2=-y1*P.sp+z1*P.cp,x2=x1;          /* pitch: the front (+z) climbs */
    return [P.x+x2*P.cy+z2*P.sy,P.y+y2,P.z-x2*P.sy+z2*P.cy];  /* yaw: +z turns to (sin yaw, cos yaw) */
  }
  function toLocalP(P,x,y,z){
    var dx=x-P.x,dy=y-P.y,dz=z-P.z;
    var x2=dx*P.cy-dz*P.sy,z2=dx*P.sy+dz*P.cy,y2=dy;
    var y1=y2*P.cp-z2*P.sp,z1=y2*P.sp+z2*P.cp,x1=x2;
    return [x1*P.cr+y1*P.sr,-x1*P.sr+y1*P.cr,z1];
  }
  function stateOf(W){return W._frame||null;}
  function near(F,P,x,z){var dx=x-P.x,dz=z-P.z;return dx*dx+dz*dz<=F.r*F.r;}
  function radius(F){var b=F.walk.bounds();if(!b)return 1;var m=0;
    [[b[0],b[2]],[b[0],b[3]],[b[1],b[2]],[b[1],b[3]]].forEach(function(c){m=Math.max(m,Math.hypot(c[0],c[1]));});return m+1;}
  /* a frame's floors over the world point (x,z) at t: [[y, rec], ...] in world heights. Two passes: the point taken in at the
     frame's height, then again at the floor's own height, so a pitched floor is read where it really lies over (x,z) */
  function frameFloors(F,P,x,z){
    var out=[],a=toLocalP(P,x,P.y,z),fs=F.walk.floorsAt(a[0],a[2]);
    for(var i=0;i<fs.length;i++){var rec=fs[i][1];if(rec.off)continue;rec.frame=F;
      var wy=toWorldP(P,a[0],fs[i][0],a[2])[1],b=toLocalP(P,x,wy,z),h=F.walk.heightOn(rec,b[0],b[2]);if(h===null)h=fs[i][0];
      out.push([toWorldP(P,b[0],h,b[2])[1],rec]);}
    return out;
  }
  function install(W){
    if(W._frame)return W._frame;
    var S={list:[],t:0,base:{floorsAt:W.floorsAt,floorBelow:W.floorBelow,blocked:W.blocked,push:W.push}};
    W._frame=S;
    W.floorsAt=function(x,z){
      var out=S.base.floorsAt(x,z);
      for(var i=0;i<S.list.length;i++){var F=S.list[i],P=poseOf(F,S.t);if(!near(F,P,x,z))continue;out=out.concat(frameFloors(F,P,x,z));}
      if(S.list.length)out.sort(function(p,q){return q[0]-p[0];});
      return out;
    };
    W.floorBelow=function(x,z,y,step){
      var s=step===undefined?0.6:step,fs=W.floorsAt(x,z);
      for(var i=0;i<fs.length;i++)if(fs[i][0]<=y+s)return fs[i];
      return null;
    };
    W.blocked=function(x,y,z,r,h){
      r=r===undefined?0.3:r;h=h===undefined?1.7:h;var b=S.base.blocked(x,y,z,r,h);if(b)return b;
      for(var i=0;i<S.list.length;i++){var F=S.list[i],P=poseOf(F,S.t);if(!near(F,P,x,z))continue;
        var a=toLocalP(P,x,y,z),k=F.walk.blocked(a[0],a[1],a[2],r,h);if(k){k.frame=F;return k;}}
      return null;
    };
    W.push=function(x,y,z,r,h){
      r=r===undefined?0.3:r;h=h===undefined?1.7:h;
      for(var pass=0;pass<2;pass++){var q=S.base.push(x,y,z,r,h);x=q[0];z=q[1];
        for(var i=0;i<S.list.length;i++){var F=S.list[i],P=poseOf(F,S.t);if(!near(F,P,x,z))continue;
          var a=toLocalP(P,x,y,z),lp=F.walk.push(a[0],a[1],a[2],r,h);if(lp[0]===a[0]&&lp[1]===a[2])continue;
          var w=toWorldP(P,lp[0],a[1],lp[1]);x=w[0];z=w[2];}}
      return [x,z];
    };
    return S;
  }
  function frame(W,o){
    if(!W||!W.floorsAt||!W.export)throw new Error('KWALKFRAME.frame: a KWALK registry is required');
    if(!o||o.id==null)throw new Error('KWALKFRAME.frame: an id is required');
    if(typeof o.pose!=='function')throw new Error('KWALKFRAME.frame '+o.id+': pose(t) is required');
    var S=install(W);
    for(var i=0;i<S.list.length;i++)if(S.list[i].id===String(o.id))throw new Error('KWALKFRAME.frame: duplicate id '+o.id);
    var mk=root.KWALK&&root.KWALK.create;if(!mk)throw new Error('KWALKFRAME: core/walk (KWALK) must load first');
    var F={id:String(o.id),poseFn:o.pose,walk:mk(),source:o.source==null?null:JSON.parse(JSON.stringify(o.source)),steep:0,_t:null,_p:null,_r:o.r};
    Object.defineProperty(F,'r',{get:function(){return F._r==null?radius(F):F._r;},enumerable:true});
    function tag(rec,off){rec.frame=F;if(off)rec.off=true;return rec;}
    F.floor=function(f){return tag(F.walk.floor(f),f.off);};
    F.strip=function(f){return tag(F.walk.strip(f),f.off);};
    F.poly=function(f){return tag(F.walk.poly(f),f.off);};
    F.block=function(bx,t){return tag(F.walk.block(bx,t));};
    S.list.push(F);return F;
  }
  function setFloor(rec,on){var L=Array.isArray(rec)?rec:[rec];
    for(var i=0;i<L.length;i++){if(!L[i]||!L[i].frame||L[i].box)throw new Error('KWALKFRAME.setFloor: not a frame floor');L[i].off=!on;}return on;}
  function at(W,t){var S=install(W);if(typeof t!=='number'||!isFinite(t))throw new Error('KWALKFRAME.at: t must be a finite number');S.t=t;return t;}
  function time(W){var S=stateOf(W);return S?S.t:0;}
  function toLocal(F,p,t){var P=poseOf(F,t);return toLocalP(P,p[0],p[1],p[2]);}
  function toWorld(F,p,t){var P=poseOf(F,t);return toWorldP(P,p[0],p[1],p[2]);}
  /* the floor a walker at p stands on at t, when it is a frame's (the floorBelow rule: the highest at or below y + step) */
  function standing(W,p,t,step){
    var S=stateOf(W);if(!S||!S.list.length)return null;var keep=S.t;S.t=t;
    var f=W.floorBelow(p[0],p[2],p[1],step===undefined?0.6:step);S.t=keep;
    if(!f||!f[1].frame||Math.abs(f[0]-p[1])>(step===undefined?0.6:step))return null;
    return {frame:f[1].frame,rec:f[1],y:f[0]};
  }
  function carry(W,p,t0,t1){
    var st=standing(W,p,t0);if(!st)return {p:[p[0],p[1],p[2]],frame:null,dyaw:0};
    var F=st.frame,l=toLocal(F,[p[0],st.y,p[2]],t0),y0=poseOf(F,t0).yaw,w=toWorld(F,l,t1),y1=poseOf(F,t1).yaw;
    return {p:w,frame:F,dyaw:y1-y0};
  }
  function frames(W){var S=stateOf(W);return S?S.list.slice():[];}
  function remove(W,id){var S=stateOf(W);if(!S)return false;for(var i=0;i<S.list.length;i++)if(S.list[i].id===String(id)){S.list.splice(i,1);return true;}return false;}
  function exp(W){
    var S=stateOf(W),L=S?S.list:[];
    return {format:'krator-walk-frames',version:1,convention:{units:'m',up:'+y',forward:'+z',side:'+x is side +1',
        pose:'roll about +z, pitch lifting +z, yaw about +y (+z to (sin yaw, cos yaw)), then the origin'},
      frames:L.map(function(F){var E=F.walk.export({hazards:false});
        E.floors.forEach(function(f,i){if(F.walk.floors[i].off)f.off=true;});
        return {id:F.id,r:F.r,source:F.source,floors:E.floors,blocks:E.blocks};})};
  }
  root.KWALKFRAME={frame:frame,setFloor:setFloor,at:at,time:time,pose:poseOf,toLocal:toLocal,toWorld:toWorld,standing:standing,carry:carry,
    frames:frames,remove:remove,export:exp,STEEP:STEEP};
})(typeof window!=='undefined'?window:globalThis);
