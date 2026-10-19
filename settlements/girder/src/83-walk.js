/* ============================== 25b. WALK MODE, on core/walk ==============================
   Girder's walker is the host's (core/host: F walks, W A S D, Shift runs, the mouse looks) on the shared walk registry, KWALK
   (core/walk). Nothing here moves a body any more: this fragment writes what is built into KWALK, as it is built or on the first tick.
     - from the builders as they draw (53-furnish.js GWALK, gwBox / gwSeg / gwDisc): dwelling floors and plinths are FLOORS; walls,
       partitions, posts, rails, fences, doors and every piece of furniture are BLOCKS (by tag, GW_FLOOR);
     - from the layout, here: the towers' floor plates (missing bays left out), the switchback flights as strips with their half
       landings, the plinth steps, the roost decks, the lift cages (a floor whose height follows the cage), the rope bridges (strips
       along the sag, rope sides as blocks), the core walls, columns, stalls, the palisade ring (gates open) and the hypertree trunks.
   The old walker (gravity, jump, its own index, pointer lock) is gone: the host walks up to 0.55 m, drops 1.4 m and keeps to a
   deck's edge. window._walk is kept as a thin layer for the harness and scripts.                                           */
var GW_WALK = { built:false, lifts:[], buildMs:0, count:0 };
var GW_FLOOR = { floor:1, plate:1, deck:1, step:1, landing:1 };
/* a solid {x,z,ux,uz,hw,hd,top,bot,tag} (53-furnish.js), a disc {x,z,r}, a ramp, a bridge or a ring, as core/walk records */
function gwToWalk(s){
  var W=KWALK, tag='gw:'+(s.tag||''), i, u, v;
  GW_WALK.count++;
  if(s.bridge){
    var b=s.bridge, N=Math.max(2,Math.ceil(b.L/2)), bux=(b.b.x-b.a.x)/b.L, buz=(b.b.z-b.a.z)/b.L, px=-buz, pz=bux;
    var bp=function(t){ return [b.a.x+(b.b.x-b.a.x)*t, b.a.z+(b.b.z-b.a.z)*t, bridgeY(b,t)]; };
    for(i=0;i<N;i++){ W.strip({ a:bp(i/N), b:bp((i+1)/N), w:b.w, name:'bridge', tag:tag }); }
    var M=Math.ceil(b.L/0.6);                                               /* the rope sides hold the walker in */
    for(i=0;i<M;i++){ var t=(i+0.5)/M; if(t<0.03 || t>0.97) continue; var c=bp(t);
      [-1,1].forEach(function(sd){ var x=c[0]+px*sd*(b.w/2+0.05), z=c[1]+pz*sd*(b.w/2+0.05); W.block([x-0.15,x+0.15,z-0.15,z+0.15,c[2]-0.1,c[2]+1.1], tag); }); }
    return;
  }
  if(s.ring){ var R=s.R, K=Math.ceil(2*Math.PI*R/1.0);
    for(i=0;i<K;i++){ var a=i/K*Math.PI*2, rx=R*Math.cos(a), rz=R*Math.sin(a);
      if(GATES.some(function(q){ return Math.hypot(rx-q.x,rz-q.z) < 5.0; })) continue;
      W.block([rx-s.hw-0.1,rx+s.hw+0.1,rz-s.hw-0.1,rz+s.hw+0.1,s.bot,s.top], tag); }
    return; }
  if(s.r){ var q=s.r;                                                       /* a trunk, a capstan: a square, or a fat plus for a big one */
    if(q<=0.9) W.block([s.x-q*0.9,s.x+q*0.9,s.z-q*0.9,s.z+q*0.9,s.bot,s.top], tag);
    else { var A=q*0.95, B=q*0.55; W.block([s.x-A,s.x+A,s.z-B,s.z+B,s.bot,s.top], tag); W.block([s.x-B,s.x+B,s.z-A,s.z+A,s.bot,s.top], tag); }
    return; }
  u=[s.ux,s.uz]; v=[-s.uz,s.ux];
  if(s.ramp){ W.strip({ a:[s.x-u[0]*s.hw, s.z-u[1]*s.hw, s.ramp.ya], b:[s.x+u[0]*s.hw, s.z+u[1]*s.hw, s.ramp.yb], w:s.hd*2, name:'stair', tag:tag }); return; }
  if(s.tag==='lift'){ var rec=W.floor({ rect:[s.x-s.hw,s.x+s.hw,s.z-s.hd,s.z+s.hd], y:s.top, name:'lift', tag:tag });
    GW_WALK.lifts.push({ rec:rec, s:s }); return; }
  if(GW_FLOOR[s.tag]){
    var P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(function(c){ return [s.x+u[0]*s.hw*c[0]+v[0]*s.hd*c[1], s.z+u[1]*s.hw*c[0]+v[1]*s.hd*c[1], s.top]; });
    W.poly({ pts:P, name:s.tag, tag:tag }); return; }
  if(Math.abs(s.uz)<0.02 || Math.abs(s.ux)<0.02){                           /* a block, axis-aligned */
    var ex=Math.abs(s.ux)*s.hw+Math.abs(s.uz)*s.hd, ez=Math.abs(s.uz)*s.hw+Math.abs(s.ux)*s.hd;
    W.block([s.x-ex,s.x+ex,s.z-ez,s.z+ez,s.bot,s.top], tag); return; }
  var Ln=s.hw*2, cuts=Math.max(1,Math.ceil(Ln/0.3)), h=Math.max(s.hd,0.15);   /* a turned wall: blocks along its length */
  for(i=0;i<cuts;i++){ var f=((i+0.5)/cuts-0.5)*Ln, x=s.x+u[0]*f, z=s.z+u[1]*f; W.block([x-h,x+h,z-h,z+h,s.bot,s.top], tag); }
}
/* the life layer's lift cages (78-life.js keeps LIFTSIM private; window._life.liftsRaw is the same array) */
function wkLifts(){ return (window._life && window._life.liftsRaw) || []; }
/* a rectangular solid from its centre, half sizes along x and z (axis-aligned) */
function wkRect(x, z, hx, hz, top, bot, tag){ return { x:x, z:z, ux:1, uz:0, hw:hx, hd:hz, top:top, bot:bot, tag:tag }; }
/* a ramp: from (ax,az) at height ya to (bx,bz) at yb, half width hw, slab thickness th */
function wkRamp(ax, az, ya, bx, bz, yb, hw, th, tag){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  return { x:(ax+bx)/2, z:(az+bz)/2, ux:dx/L, uz:dz/L, hw:L/2, hd:hw, top:Math.max(ya,yb), bot:Math.min(ya,yb)-th, ramp:{ ya:ya, yb:yb, th:th }, tag:tag };
}
function wkBuild(){
  if(GW_WALK.built) return;
  var t0 = performance.now(), L = [];
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
  GWALK.solids.forEach(gwToWalk);
  GWALK.onAdd = gwToWalk;                  /* furniture the interiors place later joins the registry as it comes */
  GW_WALK.built = true; GW_WALK.buildMs = Math.round(performance.now()-t0);
}
function wkSegS(ax,az,bx,bz,th,y0,y1,tag){ var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz)||1; return { x:(ax+bx)/2, z:(az+bz)/2, ux:dx/L, uz:dz/L, hw:L/2, hd:th/2, top:y1, bot:y0, tag:tag }; }


/* the host's walker, and a thin layer for the harness and scripts (tools/harness.py walk reads window._walk) */
function gwCam(){ return KHOST.cam; }
function wkToggle(on){
  wkBuild(); var C=gwCam(); on = on==null ? !C.ctl.walk : !!on;
  if(on!==!!C.ctl.walk) C.walk(on); return !!C.ctl.walk;
}
function gwPose(){
  var C=gwCam(), w=C.walkAt||[C.ctl.target.x, C.ctl.target.z, C.ctl.target.y-C.ctl.eye], x=w[0], z=w[1], feet=w[2], f=KWALK.floorBelow(x,z,feet,0.55);
  return { x:+x.toFixed(3), z:+z.toFixed(3), feet:+feet.toFixed(3), yaw:+C.ctl.theta.toFixed(4), pitch:+(Math.PI/2-C.ctl.phi).toFixed(4), grounded:true,
    support:(f && f[0] >= terrainH(x,z)+0.05) ? (f[1].tag||'floor') : 'terrain', eye:+(feet+C.ctl.eye).toFixed(3) };
}
window._walk = {
  get on(){ return !!gwCam().ctl.walk; },
  toggle:function(on){ return wkToggle(on); },
  pose:gwPose,
  setPose:function(x, z, yaw, pitch, feet){ wkBuild(); var C=gwCam(); if(!C.ctl.walk) C.walk(true,true);
    if(yaw!=null) C.ctl.theta=yaw; if(pitch!=null) C.ctl.phi=Math.PI/2-pitch;
    var f=KWALK.floorBelow(x,z, feet==null ? terrainH(x,z)+0.3 : feet, 0.55), y=f ? Math.max(f[0],terrainH(x,z)) : terrainH(x,z);
    C.walkAt=[x,z,y]; C.ctl.target.set(x,y+C.ctl.eye,z); C.stand(); return gwPose(); },
  look:function(dx, dy){ var C=gwCam(); C.ctl.theta -= dx*0.0035; return gwPose(); },
  blocked:function(x, z, feet){ wkBuild(); return !!KWALK.blocked(x,feet,z,0.28,1.75); },
  /* scripted walking for tests: hold forward f (-1..1) and strafe s for `secs`, stepped at dt (1/30 s), 2.8 m/s */
  walk:function(f, s, secs, dt){ wkBuild(); dt=dt||1/30; var C=gwCam(), th=C.ctl.theta;
    for(var t=0; t<secs-1e-9; t+=dt){ var n=Math.hypot(f,s)||1, mx=(-Math.sin(th)*f+Math.cos(th)*s)/n*2.8*dt, mz=(-Math.cos(th)*f-Math.sin(th)*s)/n*2.8*dt,
        w=C.walkAt||[C.ctl.target.x,C.ctl.target.z,C.ctl.target.y-C.ctl.eye];
      C.ctl.target.set(w[0]+mx, w[2]+C.ctl.eye, w[1]+mz); C.stand(); }
    return gwPose(); },
  support:function(x, z, feet){ wkBuild(); var f=KWALK.floorBelow(x,z,feet,0.55); return f ? Math.max(f[0],terrainH(x,z)) : terrainH(x,z); },
  solids:function(){ return GWALK.solids.length; },
  layout:function(){ return { TOWERS:TOWERS, LIFTS:LIFTS, PALISADE:PALISADE, GATES:GATES, BRIDGES:BRIDGES }; }   /* for tests */
};
/* every tick: build the registry once, move the lift cages' floors with the cages, tell a lift it has a rider, show the walk hint */
var gwWasWalking = false;
TICKS.push(function gwWalkTick(){
  if(!GW_WALK.built) wkBuild();
  var C=KHOST.cam, walking=!!C.ctl.walk, w=C.walkAt;
  GW_WALK.lifts.forEach(function(L){ if(!L.s.sim) return; L.rec.y = L.s.sim.y;
    L.s.sim.walker = (walking && w && Math.abs(w[2]-L.s.sim.y)<0.25 && Math.abs(w[0]-L.s.x)<L.s.hw && Math.abs(w[1]-L.s.z)<L.s.hd) ? 1 : 0; });
  if(walking!==gwWasWalking){ gwWasWalking=walking;
    camera.near = walking ? 0.12 : 0.8; camera.updateProjectionMatrix();
    var b=document.getElementById('walkToggle'); if(b){ b.textContent='Walk: '+(walking?'On':'Off')+' (F)'; b.classList.toggle('on',walking); }
    document.getElementById('walkHint').style.display = walking ? 'block' : 'none';
    document.getElementById('walkCross').style.display = walking ? 'block' : 'none'; }
});
document.getElementById('walkToggle').onclick=function(){ wkToggle(); this.blur(); };
