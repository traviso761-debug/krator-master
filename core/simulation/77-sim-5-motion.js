// ================================================================= CORE — simulation 5: motion as a function of time
// PLAN.md 4.5: "decisions step, motion is a function of time". A decision bakes an actor's task: legs of routes with a
// speed and a start time. Its pose at any motion time t is then a pure function: along the current leg, or at its spot
// (an open activity wanders a little round it, on a hashed loop of waypoints, also a pure function of t). Nothing here
// integrates, so a port (Godot) or a test evaluates the same pose from the same task at the same t.
//
//   SIM.pose(actor, t) -> {x, y, z, h (heading, radians, atan2(dx,dz)), moving, hidden, mode, act, leg}
//   SIM.at(route, s) -> {x, y, z, tx, tz}       the point s metres along a route (binary search on its cum)
//   SIM.WANDER                                   {period, reach}: the idle loop (seconds per waypoint, metres)
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.WANDER = { period:14, reach:1.6 };
  SIM.at = function(R, s){
    var P=R.pts, C=R.cum, n=P.length; if(s<=0) return seg(P,0,0); if(s>=R.len) return seg(P,n-2,1);
    var lo=0, hi=n-1; while(lo<hi-1){ var m=(lo+hi)>>1; if(C[m]<=s) lo=m; else hi=m; }
    var L=C[lo+1]-C[lo]; return seg(P, lo, L>0 ? (s-C[lo])/L : 0);
  };
  function seg(P, i, u){ var a=P[Math.max(0,Math.min(i,P.length-1))], b=P[Math.max(0,Math.min(i+1,P.length-1))], dx=b[0]-a[0], dz=b[2]-a[2], L=Math.hypot(dx,dz)||1;
    return { x:a[0]+dx*u, y:a[1]+(b[1]-a[1])*u, z:a[2]+dz*u, tx:dx/L, tz:dz/L }; }
  function h32(a,b){ var h=Math.imul((a|0)^0x9E3779B1, 0x85ebca6b) ^ Math.imul(b|0, 0xc2b2ae35); h^=h>>>15; h=Math.imul(h,0x27d4eb2d); h^=h>>>13; return (h>>>0)/4294967296; }
  SIM.pose = function(a, t){
    var o={ x:0, y:0, z:0, h:a.h0||0, moving:false, hidden:false, mode:'walk', act:a.activity, leg:-1 };
    var T=a.task;
    if(!T){ var p=a.pos; if(!p){ var H=SIM.R.place[a.home]; p = H ? H.door : { x:(a.at||[0,0])[0], y:0, z:(a.at||[0,0])[1] }; o.hidden = !!H; }
      o.x=p.x; o.y=p.y||0; o.z=p.z; if(!a.present) o.hidden=true; return o; }
    var dt=t-T.t0;
    for(var i=0;i<T.legs.length;i++){ var L=T.legs[i];
      if(dt < L.dur){                    /* a group member trails `back` metres behind its leader, and stops there */
        var s=Math.max(0, Math.min(dt*L.speed, L.route.len) - (L.back||0)), q=SIM.at(L.route, s);
        o.x=q.x - q.tz*(L.side||0); o.z=q.z + q.tx*(L.side||0); o.y=q.y; o.h=Math.atan2(q.tx, q.tz); o.moving = s>0 && s<L.route.len; o.mode=L.mode; o.leg=i;
        if(!a.present) o.hidden=true; return o; }
      dt -= L.dur; }
    /* arrived: at the spot (behind the leader for a group, so a caravan does not stand in one place) */
    var sp=T.spot, lastL=T.legs[T.legs.length-1], back=lastL?(lastL.back||0):0, side=lastL?(lastL.side||0):0, tx=0, tz=1;
    if(lastL){ var e=SIM.at(lastL.route, lastL.route.len); tx=e.tx; tz=e.tz; o.h=Math.atan2(tx,tz); o.mode = lastL.mode; }
    o.x = sp.x - tx*back - tz*side; o.z = sp.z - tz*back + tx*side; o.y = sp.y||0;
    var W=T.wander; if(W>0 && !T.indoor){ var P=SIM.WANDER.period, k=a.k||0, c=Math.floor((t+k*3.7)/P), u=((t+k*3.7)/P)-c;
      var ax=(h32(k,c)-0.5)*2*W, az=(h32(k+7919,c)-0.5)*2*W, bx=(h32(k,c+1)-0.5)*2*W, bz=(h32(k+7919,c+1)-0.5)*2*W, f=u<0.55?0:(u-0.55)/0.45, sm=f*f*(3-2*f);
      o.x += ax+(bx-ax)*sm; o.z += az+(bz-az)*sm; if(sm>0 && sm<1){ o.moving=true; o.h=Math.atan2(bx-ax, bz-az); } }
    o.hidden = !!T.indoor || !a.present;
    if(a.inVehicle==='boat' && T.legs.length && lastL && lastL.mode==='boat'){ o.mode='boat'; o.hidden=!a.present; }
    return o;
  };
})(typeof window!=='undefined'?window:globalThis);
