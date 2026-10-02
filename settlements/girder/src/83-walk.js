/* ============================== 25b. WALK MODE ==============================
   A first-person walker beside the fly camera (80-camera.js stays the default; G or the "Walk" button
   toggles). W/S forward and back along the view heading, A/D strafe left and right, drag (or click for
   pointer lock) to look: drag right turns right, drag up looks up. Shift runs, Space jumps. Eye 1.6 m.
   The walker stands on the highest solid under it that is no more than a step (0.55 m) above its feet,
   else falls (gravity) onto whatever is below, at worst the terrain. Solids (53-furnish.js GWALK):
     - from the builders as they draw: dwelling shells, partitions (the interiors' walls, a doorway in each),
       posts, rails, fences, hut and hall wall rings, floors and plinths, every piece of furniture;
     - from the layout, here: the towers' floor plates (missing bays left out), core walls, columns, the
       switchback flights as ramps with their half landings, the plinth steps, the roost decks with their
       stall partitions and corner rails, the lifts, the rope bridges (a sagging walkway with rope sides),
       the palisade ring (gates open) and the hypertree trunks.
   A solid blocks the walker when its top is above a step and its bottom below the head; doors are gaps.
   The body is a circle (r 0.28): it touches a solid where the solid's nearest point is closer than r, so it
   slides round corners and along walls at any angle (a blocked move is pushed out to the nearest point of each
   solid, three passes, and kept if it still makes headway). A lift's cage floor is a solid that moves with the
   cage (78-life.js, read through window._life.liftsRaw), so the walker can ride it up to the roost deck and down again.
   window._walk: { on, toggle(), pose(), setPose(x, z, yaw, pitch, feetY) } for scripts.                 */
var WALKER = { on:false, x:0, z:0, feet:0, vy:0, yaw:0, pitch:0, eye:1.6, r:0.28, step:0.55, walk:2.8, run:7.0, grounded:false,
               cell:4, index:null, built:false, drag:null, saved:null, lastSupport:'' };

/* the life layer's lift cages (78-life.js keeps LIFTSIM private; window._life.liftsRaw is the same array) */
function wkLifts(){ return (window._life && window._life.liftsRaw) || []; }
function wkKey(ix, iz){ return ix*100003 + iz; }
function wkInsert(s){
  var I=WALKER.index, c=WALKER.cell, ex, ez;
  if(s.r){ ex=s.r; ez=s.r; } else if(s.bridge){ ex=ez=0; } else { ex=Math.abs(s.ux)*s.hw+Math.abs(s.uz)*s.hd; ez=Math.abs(s.uz)*s.hw+Math.abs(s.ux)*s.hd; }
  if(s.bridge){ var b=s.bridge, x0=Math.min(b.a.x,b.b.x)-3, x1=Math.max(b.a.x,b.b.x)+3, z0=Math.min(b.a.z,b.b.z)-3, z1=Math.max(b.a.z,b.b.z)+3;
    for(var i=Math.floor(x0/c); i<=Math.floor(x1/c); i++) for(var j=Math.floor(z0/c); j<=Math.floor(z1/c); j++){ var k=wkKey(i,j); (I[k]||(I[k]=[])).push(s); } return; }
  if(s.ring){ WALKER.rings.push(s); return; }
  for(var i2=Math.floor((s.x-ex)/c); i2<=Math.floor((s.x+ex)/c); i2++) for(var j2=Math.floor((s.z-ez)/c); j2<=Math.floor((s.z+ez)/c); j2++){
    var k2=wkKey(i2,j2); (I[k2]||(I[k2]=[])).push(s); }
}
/* a rectangular solid from its centre, half sizes along x and z (axis-aligned) */
function wkRect(x, z, hx, hz, top, bot, tag){ return { x:x, z:z, ux:1, uz:0, hw:hx, hd:hz, top:top, bot:bot, tag:tag }; }
/* a ramp: from (ax,az) at height ya to (bx,bz) at yb, half width hw, slab thickness th */
function wkRamp(ax, az, ya, bx, bz, yb, hw, th, tag){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  return { x:(ax+bx)/2, z:(az+bz)/2, ux:dx/L, uz:dz/L, hw:L/2, hd:hw, top:Math.max(ya,yb), bot:Math.min(ya,yb)-th, ramp:{ ya:ya, yb:yb, th:th }, tag:tag };
}
function wkBuild(){
  if(WALKER.built) return;
  var t0 = performance.now(), L = [];
  WALKER.index = {}; WALKER.rings = [];
  TOWERS.forEach(function(T){
    T.floors.forEach(function(F){
      var y=F.y;
      for(var bi=-1;bi<=1;bi++) for(var bj=-1;bj<=1;bj++){
        if(F.missing.indexOf(bi+','+bj)>=0) continue;
        if(bi||bj) L.push(wkRect(T.x+bi*16, T.z+bj*16, 8.01, 8.01, y, y-SLAB, 'plate'));
        else if(F.k<TOWER_N){ L.push(wkRect(T.x-6.2, T.z, 1.8, 8, y, y-SLAB, 'plate')); L.push(wkRect(T.x+1.8, T.z-6.1, 6.2, 1.9, y, y-SLAB, 'plate')); L.push(wkRect(T.x+1.8, T.z+6.1, 6.2, 1.9, y, y-SLAB, 'plate')); }
      }
      if(F.k<TOWER_N){
        var H=F.H;
        L.push(wkRect(T.x, T.z-7.6, 8, 0.4, y+H, y, 'core')); L.push(wkRect(T.x, T.z+7.6, 8, 0.4, y+H, y, 'core')); L.push(wkRect(T.x+7.6, T.z, 0.4, 7.2, y+H, y, 'core'));
        /* the switchback: up east along z-2.6 to the half landing, up west along z+2.6 to the next floor */
        var y1=T.floors[F.k+1].y, ym=(y+y1)/2;
        L.push(wkRamp(T.x-4.4, T.z-2.6, y+0.02, T.x+4.4, T.z-2.6, ym, 1.5, 0.5, 'stair'));
        L.push(wkRamp(T.x+4.4, T.z+2.6, ym, T.x-4.4, T.z+2.6, y1, 1.5, 0.5, 'stair'));
        L.push(wkRect(T.x+6.0, T.z, 1.6, 4.1, ym, ym-0.5, 'landing'));
        L.push(wkRect(T.x, T.z, 4.4, 1.05, y1-0.2, y, 'well'));                 /* the open well between the flights */
      }
    });
    COL_LINES.forEach(function(cx){ COL_LINES.forEach(function(cz){ L.push(wkRect(T.x+cx, T.z+cz, 1.6, 1.6, T.top+2, T.y0-3, 'column')); }); });
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f){ for(var st=0; st<3; st++){ var top=T.y0+0.6-0.2*st;
      L.push(wkRect(T.x+f[0]*(T.half+1.0+st*0.9), T.z+f[1]*(T.half+1.0+st*0.9), f[0]?0.5:7, f[0]?7:0.5, top, T.y0-0.4, 'step')); } });
  });
  /* the roost decks: four plank strips round the tower, split round the lift notch; stall partitions and posts; corner rails */
  PLATS.forEach(function(P){
    var T=P.tower, Lf=T.lift, y=P.y, H=P.half, I=P.inner+0.15;
    function strip(x0,x1,z0,z1){ if(x1-x0<0.1||z1-z0<0.1) return; L.push(wkRect(T.x+(x0+x1)/2, T.z+(z0+z1)/2, (x1-x0)/2, (z1-z0)/2, y, y-0.6, 'deck')); }
    strip(-H,H,-H,-I); strip(-H,H,I,H);
    [[-H,-I],[I,H]].forEach(function(xr){ var lx=Lf.x-T.x, lz=Lf.z-T.z;
      if(lx>xr[0] && lx<xr[1]){ strip(xr[0],xr[1],-I,lz-2.6); strip(xr[0],xr[1],lz+2.6,I); strip(xr[0],lx-2.6,lz-2.6,lz+2.6); strip(lx+2.6,xr[1],lz-2.6,lz+2.6); }
      else strip(xr[0],xr[1],-I,I); });
    var C=H-0.25, E=H-DECK_W*0.55;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ L.push(wkSegS(T.x+c[0]*C,T.z+c[1]*C, T.x+c[0]*E,T.z+c[1]*C, 0.16, y, y+1.1, 'rail')); L.push(wkSegS(T.x+c[0]*C,T.z+c[1]*C, T.x+c[0]*C,T.z+c[1]*E, 0.16, y, y+1.1, 'rail')); });
  });
  ROOSTS.forEach(function(R){
    var y=R.y, tx=-R.oz, tz=R.ox, w=R.w, dep=9.2, cx=R.x-R.ox*(dep/2-1.4), cz=R.z-R.oz*(dep/2-1.4);
    [-1,1].forEach(function(sg){
      L.push(wkRect(cx+tx*sg*w/2, cz+tz*sg*w/2, R.ox?(dep-1)/2:0.1, R.ox?0.1:(dep-1)/2, y+2.2, y, 'stall'));
      L.push(wkRect(R.x+tx*sg*w/2-R.ox*0.2, R.z+tz*sg*w/2-R.oz*0.2, 0.2, 0.2, y+5.8, y, 'post'));
      L.push(wkRect(R.x+tx*sg*w/2-R.ox*(dep-1.4), R.z+tz*sg*w/2-R.oz*(dep-1.4), 0.2, 0.2, y+7.4, y, 'post'));
    });
  });
  LIFTS.forEach(function(Lf){
    /* the cage floor: its top is wherever the cage is now (78-life.js moves LIFTSIM[].y), so the walker rides it */
    var cage = wkRect(Lf.x, Lf.z, 2.5, 2.5, Lf.y0+0.05, Lf.y0-0.25, 'lift'),
        sim = wkLifts().filter(function(q){ return q.lf===Lf; })[0] || null;
    if(sim){ cage.sim = sim;
             Object.defineProperty(cage, 'top', { get:function(){ return sim.y; } });
             Object.defineProperty(cage, 'bot', { get:function(){ return sim.y-0.3; } }); }
    L.push(cage); var C=Lf.capstan; L.push({ x:C.x, z:C.z, r:1.1, top:C.y+2.2, bot:C.y-1, tag:'capstan' }); });
  BRIDGES.forEach(function(br){ L.push({ bridge:br, top:Math.max(br.a.y,br.b.y)+0.1, bot:Math.min(br.a.y,br.b.y)-br.sag-0.5, tag:'bridge' }); });
  GATES.forEach(function(g){ [-1,1].forEach(function(sg){ L.push(wkRect(g.x+sg*6.6, g.z, 2.1, 2.1, SETTLE_Y+11, SETTLE_Y-0.5, 'gatehouse')); }); });
  L.push({ ring:true, R:PALISADE.R, hw:0.75, top:SETTLE_Y+9, bot:SETTLE_Y-6, tag:'palisade' });
  TREES.forEach(function(T){ L.push({ x:T.x, z:T.z, r:trunkR(T, T.y0+3)*0.9, top:T.y0+T.H*0.6, bot:T.y0-5, tag:'trunk' }); });
  L.forEach(function(s){ GWALK.solids.push(s); });
  GWALK.solids.forEach(wkInsert);
  GWALK.onAdd = wkInsert;                  /* furniture the interiors place later joins the index as it comes */
  WALKER.built = true; WALKER.buildMs = Math.round(performance.now()-t0);
}
function wkSegS(ax,az,bx,bz,th,y0,y1,tag){ var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz)||1; return { x:(ax+bx)/2, z:(az+bz)/2, ux:dx/L, uz:dz/L, hw:L/2, hd:th/2, top:y1, bot:y0, tag:tag }; }

function wkNear(x, z, rad, fn){
  var I=WALKER.index, c=WALKER.cell, seen=WALKER._seen||(WALKER._seen=new Set()); seen.clear();
  for(var i=Math.floor((x-rad)/c); i<=Math.floor((x+rad)/c); i++) for(var j=Math.floor((z-rad)/c); j<=Math.floor((z+rad)/c); j++){
    var A=I[wkKey(i,j)]; if(!A) continue;
    for(var n=0;n<A.length;n++){ var s=A[n]; if(seen.has(s)) continue; seen.add(s); if(fn(s)) return true; }
  }
  return false;
}
/* the solid's walkable top at (x,z) (inside its outline, grown by `grow`), or null */
function wkTopAt(s, x, z, grow){
  if(s.bridge){ var b=s.bridge, dx=b.b.x-b.a.x, dz=b.b.z-b.a.z, L2=dx*dx+dz*dz, t=((x-b.a.x)*dx+(z-b.a.z)*dz)/L2;
    if(t<-0.02 || t>1.02) return null; var px=b.a.x+dx*t, pz=b.a.z+dz*t; if(Math.hypot(x-px,z-pz) > b.w/2+grow) return null;
    return bridgeY(b, clamp(t,0,1)); }
  if(s.ring) return null;
  if(s.r){ return Math.hypot(x-s.x,z-s.z) <= s.r+grow ? s.top : null; }
  var ddx=x-s.x, ddz=z-s.z, u=ddx*s.ux+ddz*s.uz, v=-ddx*s.uz+ddz*s.ux;
  if(Math.abs(u) > s.hw+grow || Math.abs(v) > s.hd+grow) return null;
  if(s.ramp){ var k=clamp((u+s.hw)/(2*s.hw),0,1); return mix(s.ramp.ya, s.ramp.yb, k); }
  return s.top;
}
/* the support under (x,z) for feet at `feet`: the highest top no more than a step up; at worst the terrain */
function wkSupport(x, z, feet){
  var best = terrainH(x,z), lim = feet + WALKER.step, tag = 'terrain', on = null;
  wkNear(x, z, 0.1, function(s){ if(s.top < best - 1 && !s.ramp && !s.bridge) return false;
    var t = wkTopAt(s, x, z, 0); if(t!==null && t<=lim && t>best){ best=t; tag=s.tag; on=s; } return false; });
  WALKER.lastSupport = tag; WALKER.lastSolid = on;
  return best;
}
/* the nearest point of a solid's plan to (x,z): [px, pz, inside]; for a box, in its own frame and back */
function wkNearest(s, x, z){
  if(s.r){ var dx=x-s.x, dz=z-s.z, d=Math.hypot(dx,dz)||1e-9; return d<=s.r ? [x, z, true] : [s.x+dx/d*s.r, s.z+dz/d*s.r, false]; }
  var ddx=x-s.x, ddz=z-s.z, u=ddx*s.ux+ddz*s.uz, v=-ddx*s.uz+ddz*s.ux,
      cu=clamp(u,-s.hw,s.hw), cv=clamp(v,-s.hd,s.hd);
  return [s.x+cu*s.ux-cv*s.uz, s.z+cu*s.uz+cv*s.ux, cu===u && cv===v];
}
/* does a body of radius R at (x,z) touch the solid's plan? */
function wkOverlap(s, x, z, R){
  var q=wkNearest(s, x, z); return q[2] || (x-q[0])*(x-q[0])+(z-q[1])*(z-q[1]) < R*R;
}
/* does solid s stop a body at (x,z) with its feet at `feet`? */
function wkStops(s, x, z, feet){
  var R=WALKER.r, lo=feet+WALKER.step, hi=feet+1.75;
  if(s.bridge || s.ring) return false;
  if(!wkOverlap(s, x, z, R)) return false;
  if(s.ramp){ var t=wkTopAt(s, x, z, R); if(t===null) return false; return t>lo && t-s.ramp.th<hi; }
  return s.top>lo && s.bot<hi;
}
function wkRingStops(g, x, z, feet){
  var R=WALKER.r, lo=feet+WALKER.step, hi=feet+1.75, d=Math.hypot(x,z);
  return Math.abs(d-g.R) < g.hw+R && hi>g.bot && lo<g.top && !GATES.some(function(q){ return Math.hypot(x-q.x,z-q.z) < 5.0; });
}
/* is a body at (x,z), feet at `feet`, inside a solid? */
function wkBlocked(x, z, feet){
  for(var i=0;i<WALKER.rings.length;i++) if(wkRingStops(WALKER.rings[i], x, z, feet)) return true;
  return wkNear(x, z, WALKER.r+0.1, function(s){ return wkStops(s, x, z, feet); });
}
/* (x,z) moved out of every solid it touches: to the solid's nearest point plus the radius (a hair more), or
   out through the nearest face when the centre is inside; three passes settle a corner between two solids */
function wkPush(x, z, feet){
  var R=WALKER.r*1.0005;
  for(var pass=0; pass<3; pass++){
    var hit=false;
    for(var i=0;i<WALKER.rings.length;i++){ var g=WALKER.rings[i];
      if(wkRingStops(g, x, z, feet)){ var d=Math.hypot(x,z)||1e-9, to=d<g.R ? g.R-g.hw-R : g.R+g.hw+R; x*=to/d; z*=to/d; hit=true; } }
    var list=[]; wkNear(x, z, WALKER.r+0.1, function(s){ if(wkStops(s, x, z, feet)) list.push(s); return false; });
    for(var n=0;n<list.length;n++){ var s=list[n], q=wkNearest(s, x, z);
      if(!q[2]){ var dx=x-q[0], dz=z-q[1], dd=Math.hypot(dx,dz)||1e-9; if(dd<R){ x=q[0]+dx/dd*R; z=q[1]+dz/dd*R; hit=true; } continue; }
      if(s.r){ var ex=x-s.x, ez=z-s.z, ed=Math.hypot(ex,ez)||1e-9; x=s.x+ex/ed*(s.r+R); z=s.z+ez/ed*(s.r+R); hit=true; continue; }
      var ddx=x-s.x, ddz=z-s.z, u=ddx*s.ux+ddz*s.uz, v=-ddx*s.uz+ddz*s.ux;          /* inside a box: out by the nearest face */
      if(s.hw-Math.abs(u) < s.hd-Math.abs(v)) u=(u<0?-1:1)*(s.hw+R); else v=(v<0?-1:1)*(s.hd+R);
      x=s.x+u*s.ux-v*s.uz; z=s.z+u*s.uz+v*s.ux; hit=true; }
    if(!hit) break;
  }
  return [x, z];
}
/* on a rope bridge the rope sides hold the walker in */
function wkBridgeHold(x0, z0, x1, z1){
  var hold = false;
  BRIDGES.forEach(function(b){
    var dx=b.b.x-b.a.x, dz=b.b.z-b.a.z, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
    function lat(x,z){ return { t:((x-b.a.x)*ux+(z-b.a.z)*uz)/L, s:-(x-b.a.x)*uz+(z-b.a.z)*ux }; }
    var a=lat(x0,z0), c=lat(x1,z1);
    if(a.t>0.03 && a.t<0.97 && Math.abs(a.s)<b.w/2 && Math.abs(WALKER.feet-bridgeY(b,a.t))<1.5 && Math.abs(c.s)>b.w/2-WALKER.r) hold = true;
  });
  return hold;
}

function wkStep(dt){
  var W=WALKER, k=keys;
  var f=(k['w']?1:0)-(k['s']?1:0), s=(k['d']?1:0)-(k['a']?1:0);
  if(f||s){
    var sp=(k['shift']?W.run:W.walk), n=Math.hypot(f,s), fx=-Math.sin(W.yaw), fz=-Math.cos(W.yaw), rx=Math.cos(W.yaw), rz=-Math.sin(W.yaw);
    var mx=(fx*f+rx*s)/n*sp*dt, mz=(fz*f+rz*s)/n*sp*dt, dist=Math.hypot(mx,mz), sub=Math.max(1,Math.ceil(dist/0.15));
    var stuck = wkBlocked(W.x, W.z, W.feet);        /* a piece furnished round the walker after it stood there: let it walk out */
    for(var i=0;i<sub;i++){
      var dx=mx/sub, dz=mz/sub, moved=false;
      [[dx,dz,0],[dx,dz,1],[dx,0,0],[0,dz,0]].some(function(m){
        if(!m[0] && !m[1]) return false;
        var nx=W.x+m[0], nz=W.z+m[1];
        if(m[2]){ if(stuck) return false;                    /* blocked: slide, pushed out of what it touches */
          var p=wkPush(nx, nz, W.feet); nx=p[0]; nz=p[1];
          if((nx-W.x)*dx+(nz-W.z)*dz < 0.2*(dx*dx+dz*dz)) return false; }   /* no headway: try the axes */
        if((!stuck && wkBlocked(nx, nz, W.feet)) || wkBridgeHold(W.x, W.z, nx, nz)) return false;
        W.x=nx; W.z=nz; moved=true; return true;
      });
      if(!moved){ W.bumped=(W.bumped||0)+1; break; }
    }
  }
  if(k[' '] && W.grounded){ W.vy=4.6; W.grounded=false; }
  var sup = wkSupport(W.x, W.z, W.feet);
  if(W.grounded && sup >= W.feet-0.45 && W.vy<=0){ W.feet=sup; W.vy=0; }         /* walk down steps and ramps */
  else { W.vy -= 18*dt; W.feet += W.vy*dt;
    if(W.feet <= sup){ W.feet=sup; W.vy=0; W.grounded=true; } else W.grounded=false; }
  if(W.feet < sup) W.feet = sup;
  /* a walker standing in a cage is a rider: the lift sets off for it (78-life.js lifeLiftTick) */
  var LS=wkLifts(); for(var li=0; li<LS.length; li++) LS[li].walker = W.grounded && W.lastSolid && W.lastSolid.sim===LS[li] ? 1 : 0;
  wkCamera();
}
function wkCamera(){
  var W=WALKER;
  camera.position.set(W.x, W.feet+W.eye, W.z);
  camera.rotation.set(W.pitch, W.yaw, 0, 'YXZ');
  ctl.tx=W.x; ctl.ty=W.feet+W.eye; ctl.tz=W.z;          /* the sun's shadow box follows the orbit target */
}
/* where to put the walker: the fly camera's target if it is inside the village and not inside a solid, else
   the court in front of the hall's south door */
function wkSpawn(){
  var W=WALKER, x=ctl.tx, z=ctl.tz, feet;
  var dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  W.yaw=Math.atan2(-dir.x,-dir.z); W.pitch=0;
  if(Math.hypot(x,z) > PALISADE.R-8){ x=0; z=HALL.R+9; W.yaw=0; }
  feet = wkSupport(x, z, Math.max(ctl.ty, terrainH(x,z)) + 0.5);
  for(var r=0; r<12 && wkBlocked(x, z, feet); r+=0.5){ var a=r*2.4; x+=Math.cos(a)*0.5; z+=Math.sin(a)*0.5; feet=wkSupport(x, z, feet+0.5); }
  W.x=x; W.z=z; W.feet=feet; W.vy=0; W.grounded=true;
}
function wkToggle(on){
  var W=WALKER; on = on==null ? !W.on : !!on;
  if(on===W.on) return W.on;
  if(on){
    wkBuild(); W.saved={ near:camera.near };
    wkSpawn(); W.on=true; CAM_HOOK=wkStep; camera.near=0.12; camera.updateProjectionMatrix();
  } else {
    W.on=false; CAM_HOOK=null; if(document.pointerLockElement) document.exitPointerLock();
    wkLifts().forEach(function(L){ L.walker=0; });
    camera.near=W.saved?W.saved.near:0.8; camera.updateProjectionMatrix();
    var fx=-Math.sin(W.yaw), fz=-Math.cos(W.yaw);                       /* the orbit picks up behind the walker */
    setView(W.x-fx*14, W.feet+W.eye+5, W.z-fz*14, W.x, W.feet+W.eye, W.z);
  }
  var b=document.getElementById('walkToggle'); if(b){ b.textContent='Walk: '+(W.on?'On':'Off')+' (G)'; b.classList.toggle('on',W.on); }
  document.getElementById('walkHint').style.display = W.on ? 'block' : 'none';
  document.getElementById('walkCross').style.display = W.on ? 'block' : 'none';
  return W.on;
}
(function(){
  var el=renderer.domElement, W=WALKER, K=0.0035;
  function look(dx, dy){ W.yaw -= dx*K; W.pitch = clamp(W.pitch - dy*K, -1.45, 1.45); wkCamera(); }
  addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if(e.key==='g' || e.key==='G'){ wkToggle(); e.preventDefault(); }
    if(W.on && e.key===' ') e.preventDefault(); });
  document.getElementById('walkToggle').onclick=function(){ wkToggle(); this.blur(); };
  el.addEventListener('pointerdown', function(e){ if(W.on) W.drag={ x:e.clientX, y:e.clientY, moved:0 }; });
  el.addEventListener('pointermove', function(e){
    if(!W.on) return;
    if(document.pointerLockElement===el){ look(e.movementX||0, e.movementY||0); return; }
    if(!W.drag) return;
    var dx=e.clientX-W.drag.x, dy=e.clientY-W.drag.y; W.drag.x=e.clientX; W.drag.y=e.clientY; W.drag.moved+=Math.abs(dx)+Math.abs(dy); look(dx, dy);
  });
  function up(){ if(W.drag && W.drag.moved<3 && W.on && el.requestPointerLock){ try{ var pl=el.requestPointerLock(); if(pl && pl.catch) pl.catch(function(){}); }catch(err){} } W.drag=null; }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', function(){ W.drag=null; });
})();
window._walk = {
  get on(){ return WALKER.on; },
  toggle:function(on){ return wkToggle(on); },
  pose:function(){ return { x:+WALKER.x.toFixed(3), z:+WALKER.z.toFixed(3), feet:+WALKER.feet.toFixed(3), yaw:+WALKER.yaw.toFixed(4), pitch:+WALKER.pitch.toFixed(4),
    grounded:WALKER.grounded, support:WALKER.lastSupport, bumped:WALKER.bumped||0, eye:+(WALKER.feet+WALKER.eye).toFixed(3) }; },
  setPose:function(x, z, yaw, pitch, feet){ wkBuild(); WALKER.x=x; WALKER.z=z; if(yaw!=null) WALKER.yaw=yaw; if(pitch!=null) WALKER.pitch=pitch;
    WALKER.feet = wkSupport(x, z, feet==null ? terrainH(x,z)+0.3 : feet); WALKER.vy=0; WALKER.grounded=true; WALKER.bumped=0; wkCamera(); return this.pose(); },
  look:function(dx, dy){ WALKER.yaw -= dx*0.0035; WALKER.pitch = clamp(WALKER.pitch - dy*0.0035, -1.45, 1.45); wkCamera(); return this.pose(); },
  blocked:function(x, z, feet){ wkBuild(); return wkBlocked(x, z, feet); },
  /* scripted walking for tests: hold forward f (-1..1) and strafe s for `secs`, stepped at dt (1/30 s) */
  walk:function(f, s, secs, dt){ wkBuild(); dt=dt||1/30; var k=keys, sv={ w:k.w, s:k.s, a:k.a, d:k.d };
    k.w=f>0; k.s=f<0; k.d=s>0; k.a=s<0; for(var t=0; t<secs-1e-9; t+=dt) wkStep(dt);
    k.w=sv.w; k.s=sv.s; k.a=sv.a; k.d=sv.d; return this.pose(); },
  support:function(x, z, feet){ wkBuild(); return wkSupport(x, z, feet); },
  solids:function(){ return GWALK.solids.length; }
};
