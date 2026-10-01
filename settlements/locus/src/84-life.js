/* ============================== 20. THE LIFE LAYER — LOCUS ==============================
   PLANNER-OWNED. Everyone in Locus, built on Voth's life-layer pattern (78-life.js), which the
   project names as the reference for pathing and collision:

   PATHING — three routers, each deliberately different about obstacles (Voth's rule):
     · STREET A* over NAV (30-layout.js), a binary heap, for everyone who keeps to the roads:
       ramblers, Geomancers, farmers and fishermen on foot, carts, caravans. Requests are queued
       and a few served a frame. The last few metres to a door are a straight LEG, refused if it
       would cross another building's footprint (the footprint raster, 69b).
     · GRID A* over the ROUTE GRID's water cells for the fishing boats (Voth's nav-grid for its
       water traffic): river, delta and lake; jetties and bridge piers barred; paths shortened by
       line-of-sight so a boat never cuts a corner across the bank.
     · GRID A* over the ROUTE GRID's land for the lizard-riding nomads, who come and go across
       country from the map edge: the lake is barred, rivers are waded at a price, the town is
       barred except its streets, every site and field is barred.
   COLLISION — Voth's local avoidance: one flat slot array, a spatial hash rebuilt each frame,
     pure separation steering with an asymmetric GIVE-WAY by priority (riders 4 > caravans 3 >
     carts 2 > people 1; boats their own set), checked at the agent's REAL position first and at
     a look-ahead point only when nothing is close now. Applied as a decaying offset from the
     route, so nobody drifts off the road.
   THE DAY — every kind has hours; the clock is the sky's (skyHour).
   THE DEVTOOL — every population accumulates the corridors it actually uses and registers a
     layer in PATHVIZ (87-pathviz.js): ribbons, one colour per population.                     */
reseed(900001);

var LIFE = { agents:[], veh:[], boats:[], squads:[], poi:{}, stats:{}, doors:[] };
(function(){
  if(SHEET || !NAV.nodes.length) return;
  var PI=Math.PI;

  /* ============================ 1. THE PLACES AND THEIR DOORS ============================ */
  var POI = LIFE.poi;
  function frontOf(b){ var p=loc(b.x,b.z,0,(b.d||6)/2+1.2,b.ry||0); return [p[0],p[1]]; }
  function place(cat, b, extra){
    var doors = (b.doors && b.doors.length) ? b.doors.slice(0,4).map(function(d){ return [d[0],d[2]]; }) : [frontOf(b)];
    var e = { cat:cat, x:b.x, z:b.z, r:Math.max(b.w||8,b.d||8)*0.5+3, name:b.plotName||b.name||'', doors:doors, rec:b, entries:0, active:0, cap:(extra&&extra.cap)||6 };
    if(extra) for(var k in extra) e[k]=extra[k];
    (POI[cat] || (POI[cat]=[])).push(e); LIFE.doors.push(e); return e;
  }
  PLACED.forEach(function(b){ if(b.key==='plant' || !b.key) return;
    var t=b.tag, k=b.key;
    if(t==='home_poor'||t==='home_mid'||t==='home_rich') place(t, b, { cap:t==='home_rich'?10:6 });
    else if(t==='shop') place('shop', b, { cap:4 });
    else if(t==='tavern') place('tavern', b, { cap:8 });
    else if(t==='refinery') place('refinery', b, { cap:40 });
    else if(t==='tank') place('tank', b, { cap:6 });
    else if(t==='pumpjack') place('pumpjack', b, { cap:2 });
    else if(t==='generator') place('generator', b, { cap:8 });
    else if(t==='fuel') place('fuel', b, { cap:6 });
    else if(t==='caravanserai') place('caravanserai', b, { cap:60 });
    else if(t==='dock') place('dock', b, { cap:6, head:loc(b.x,b.z,0,-b.d/2-2.5,b.ry) });
    else if(t==='stilt') place('fisher_home', b, { cap:6 });
    else if(t==='farm') place(k==='farm_saltrice_paddies' ? 'paddy' : 'farm', b, { cap:8 });      /* paddy blocks: worked, never a home */
    else if(t==='civic'){ if(k==='civic_geomancer_chapterhouse') place('geochapter', b, { cap:30 }); else if(k==='locus_warehouse') place('warehouse', b, { cap:12 }); else place('civic', b, { cap:20 }); }
    else if(t==='rich') place('home_rich', b, { cap:10 });
    else if(t==='market') { if(k==='trade_market_hall') place('market', b, { cap:20 }); }
  });
  /* open places are stood IN, not at a door */
  function openPlace(cat, x, z, r, name){ var e={ cat:cat, x:x, z:z, r:r, name:name, doors:null, entries:0, active:0, cap:999, open:true }; (POI[cat]||(POI[cat]=[])).push(e); return e; }
  openPlace('market', MARKET.x, MARKET.z, MARKET.r*0.7, MARKET.name);
  openPlace('park', PARK.x, PARK.z, PARK.r*0.7, PARK.name);
  for(var a8=0;a8<6;a8++){ var aa=a8/6*TAU+0.3; openPlace('ring', Math.cos(aa)*(RING0_R+9), Math.sin(aa)*(RING0_R+9), 7, 'Refinery ring'); }
  function pool(cats){ var out=[]; cats.forEach(function(c){ if(POI[c]) out.push.apply(out, POI[c]); }); return out.length ? out : POI.ring; }

  /* ============================ 2. THE STREET ROUTER ============================ */
  var GB=40, NGRID={};
  NAV.nodes.forEach(function(n){ var k=Math.floor(n.x/GB)+':'+Math.floor(n.z/GB); (NGRID[k]||(NGRID[k]=[])).push(n.id); });
  function navNear(x,z){ var best=-1, bd=1e9;
    for(var ring=0; ring<8 && best<0; ring++) for(var i=-ring;i<=ring;i++) for(var j=-ring;j<=ring;j++){
      if(ring>0 && Math.abs(i)!==ring && Math.abs(j)!==ring) continue;
      var arr=NGRID[(Math.floor(x/GB)+i)+':'+(Math.floor(z/GB)+j)]; if(!arr) continue;
      for(var q=0;q<arr.length;q++){ var n=NAV.nodes[arr[q]], d=Math.hypot(n.x-x,n.z-z); if(d<bd){ bd=d; best=arr[q]; } } }
    return best; }
  var NN=NAV.nodes.length, gS=new Float64Array(NN), came=new Int32Array(NN), stamp=new Int32Array(NN), closedS=new Int32Array(NN), epoch=0;
  /* width as a graph attribute (Voth brief §5): a caravan does not take a lane or a track */
  function navRoute(a, b, minW){
    if(a<0||b<0) return null; if(a===b) return [a];
    epoch++; var heap=new RGHeap(), tgt=NAV.nodes[b]; gS[a]=0; came[a]=-1; stamp[a]=epoch; heap.push(a, 0); var guard=0;
    while(heap.a.length && guard++ < 40000){
      var cur=heap.pop()[0]; if(closedS[cur]===epoch) continue; closedS[cur]=epoch;
      if(cur===b){ var p=[], c=cur; while(c>=0){ p.push(c); c=came[c]; } return p.reverse(); }
      var adj=NAV.adj[cur];
      for(var e=0;e<adj.length;e++){ var ed=NAV.edges[adj[e]]; if(minW && ed.w < minW) continue;
        var o = ed.a===cur ? ed.b : ed.a, g = gS[cur] + ed.len;
        if(stamp[o]!==epoch || g < gS[o]){ stamp[o]=epoch; gS[o]=g; came[o]=cur; var n=NAV.nodes[o]; heap.push(o, g + Math.hypot(n.x-tgt.x, n.z-tgt.z)); } } }
    return null; }
  /* a door leg is refused if its straight line crosses a building footprint other than near the door */
  function legClear(x0,z0,x1,z1){ var L=Math.hypot(x1-x0,z1-z0), n=Math.ceil(L/1.5);
    for(var i=1;i<n;i++){ var t=i/n, x=mix(x0,x1,t), z=mix(z0,z1,t); if(Math.hypot(x-x1,z-z1) < 3.5) break; if(LOCUS_FP.at(x,z) && !onStreet(x,z,0.5)) return false; } return true; }
  function standPoint(w, fx, fz){
    if(!w) return null;
    if(w.doors){ var best=null, bd=1e9; w.doors.forEach(function(d){ var q=Math.hypot(d[0]-fx,d[1]-fz); if(q<bd){ bd=q; best=d; } });
      if(best && bd < 60 && legClear(fx,fz,best[0],best[1])) return { x:best[0]+rr(-0.8,0.8), z:best[1]+rr(-0.8,0.8) }; return null; }
    var a=rr(0,TAU), q2=w.r*Math.sqrt(rnd())*0.85; return { x:w.x+Math.cos(a)*q2, z:w.z+Math.sin(a)*q2 }; }

  /* ============================ 3. THE PEOPLE ============================ */
  var G = PAL.people, GEO = GEOBROWNC;
  var KINDS = {
    rambler:  { n:170, speed:1.25, order:['market','park','shop','tavern','civic','ring','caravanserai','home'], dwell:[8,30], hours:[6,21] },
    geomancer:{ n: 56, speed:1.35, order:['refinery','refinery','tank','pumpjack','generator','geochapter','warehouse','fuel'], dwell:[30,90], hours:[6,18.5], uniform:true },
    farmer:   { n: 30, speed:1.15, order:['farm','paddy'], dwell:[20,50], hours:[6,17.5] },
    fisher:   { n: 14, speed:1.2,  order:['dock'], dwell:[4,8],  hours:[5,17] },
    merchant: { n: 34, speed:1.15, order:['market','warehouse','shop','caravanserai'], dwell:[30,80], hours:[7,19] }
  };
  var LABEL = { rambler:'Townsperson', geomancer:'Geomancer (brown uniform, pack)', farmer:'Salt-rice farmer', fisher:'Fisherman', merchant:'Merchant' };
  var AG = LIFE.agents, byKind={};
  function homeFor(kind){ if(kind==='fisher') return pool(['fisher_home','home_poor']); if(kind==='farmer') return pool(['farm','home_poor']);
    if(kind==='geomancer') return pool(['home_mid','home_rich']); if(kind==='merchant') return pool(['home_mid','home_rich']); return pool(['home_poor','home_mid','home_poor']); }
  function spawn(kind, cfg){
    var home=pick(homeFor(kind)), at=home, hour=skyHour();
    var working = hour >= cfg.hours[0] && hour < cfg.hours[1];
    if(working && rnd() < 0.7){ var t=pick(pool(cfg.order.filter(function(c){ return c!=='home'; }))); at=t; }
    var sp = at.doors ? at.doors[0] : [at.x+rr(-at.r,at.r)*0.6, at.z+rr(-at.r,at.r)*0.6];
    var a = { kind:kind, cfg:cfg, home:home, x:sp[0], z:sp[1], y:terrainH(sp[0],sp[1]), ry:rr(0,TAU), path:null, seg:0, t:0, leg:null, wait:rr(0,20),
              speed:cfg.speed*rr(0.85,1.15), want:null, node:-1, off:rr(-1.8,1.8), ox:0, oz:0, step:rr(0,6), id:AG.length,
              garb: cfg.uniform ? GEO[AG.length%GEO.length] : (kind==='fisher' ? pick([0x6a7a8a,0x8a7a5a,0xe0d8c0]) : (kind==='farmer' ? pick([0xd8cfa8,0xb8a878,0x8a9a6a]) : pick(G.garb))),
              skin:pick(G.skin), pack:!!cfg.uniform, hat: kind==='farmer' || (kind==='fisher' && rnd()<0.7), bent:0, prio:1, rad:0.45, at:at };
    AG.push(a); byKind[kind]=(byKind[kind]||0)+1; return a; }
  for(var k in KINDS) for(var i=0;i<KINDS[k].n;i++) spawn(k, KINDS[k]);

  var USED = {};
  function remember(kind, pth){ var m=USED[kind]||(USED[kind]={}); for(var i=0;i<pth.length-1;i++){ var a=pth[i], b=pth[i+1], kk=a<b?a+'_'+b:b+'_'+a; m[kk]=(m[kk]||0)+1; } }
  function elsewhere(a, roll){ for(var i=0;i<5;i++){ var w=roll(); if(w && Math.hypot(w.x-a.x,w.z-a.z) > Math.max(14,w.r*1.2)) return w; } return roll(); }
  function destination(a, hour){
    var c=a.cfg, on = hour >= c.hours[0] && hour < c.hours[1];
    if(!on) return a.home;
    if(a.kind==='fisher') return a.boat ? a.boat.dock : pick(POI.dock||[a.home]);
    if(a.kind==='farmer'){ if(!a.farm) a.farm=pick(pool(['farm','paddy'])); return a.farm; }
    return elsewhere(a, function(){ var cat=pick(c.order); return cat==='home' ? a.home : pick(pool([cat])); });
  }
  var QUEUE=[], QPF=6, FAILED=0;
  function ask(a, w){ a.want=w; a.pathPending=true; QUEUE.push(a); }
  function serve(){ var n=0; while(QUEUE.length && n++ < QPF){ var a=QUEUE.shift(), w=a.want; if(!w){ a.pathPending=false; continue; }
      var s = a.node>=0 ? a.node : navNear(a.x,a.z), goal = navNear(w.doors ? w.doors[0][0] : w.x, w.doors ? w.doors[0][1] : w.z);
      var pth = navRoute(s, goal, a.minW||0); a.pathPending=false;
      if(pth && pth.length>1){ a.path=pth; a.seg=0; a.t=0; a.node=-1; remember(a.kind, pth); }
      else if(pth){ a.path=null; a.node=s; arrive(a); }
      else { a.path=null; a.node=s; a.wait=rr(4,10); FAILED++; } } }
  function arrive(a){
    var w=a.want; a.leg = standPoint(w, a.x, a.z);
    if(!a.leg) settle(a, w);
  }
  /* what an agent does when it gets there */
  function settle(a, w){
    var d=a.cfg.dwell; a.wait=rr(d[0],d[1]); a.step=0;
    if(w){ w.entries++; }
    if(w && w===a.home){ a.inside=true; a.wait=rr(40,140); return; }          /* gone indoors: not drawn until he comes out */
    if(a.kind==='fisher' && w && w.cat==='dock' && a.boat && a.boat.state==='moored' && skyHour() < a.cfg.hours[1]-2){ boardBoat(a); return; }
    if(a.kind==='farmer' && w && (w.cat==='farm' || w.cat==='paddy')){ a.inField = 3 + Math.floor(rnd()*4); fieldLeg(a); return; }
  }
  /* farmers work INTO the paddies: legs to points inside the farm's rectangle, bent over while they wait */
  function fieldLeg(a){ var F=a.farm.rec, lx=rr(-22,10), lz=rr(-12,12); if(F.variant===1) lx=-lx; var p=loc(F.x,F.z,lx,lz,F.ry); a.leg={ x:p[0], z:p[1], field:true }; }

  /* ============================ 4. CARTS AND CARAVANS ============================ */
  var VEH = LIFE.veh;
  var CART = { n:20, speed:2.0, dwell:[20,50], order:['warehouse','market','refinery','caravanserai','dock','shop','tavern','fuel','fuel'] };
  var CARAVAN = { speed:1.6, beasts:4, dwell:[90,220], minW:7 };
  function spawnVeh(kind, cfg, beasts, at){
    var v = { kind:kind, cfg:cfg, x:at[0], z:at[1], y:terrainH(at[0],at[1]), ry:rr(0,TAU), path:null, seg:0, t:0, leg:null, wait:rr(0,25), speed:cfg.speed*rr(0.9,1.1),
              node:-1, beasts:beasts, off:kind==='caravan'?1.6:1.4, ox:0, oz:0, prio:kind==='caravan'?3:2, rad:kind==='caravan'?2.2:1.6, id:VEH.length, hidden:false,
              hide:pick(PAL.trunk), load:pick(PAL.canvas), garb:pick(G.garb), skin:pick(G.skin), minW:cfg.minW||0 };
    VEH.push(v); return v; }
  for(var c1=0;c1<CART.n;c1++){ var s0=pick(pool(['warehouse','market','refinery'])), sp0=standPoint(s0, s0.x, s0.z) || { x:s0.x+rr(-8,8), z:s0.z+rr(-8,8) }; spawnVeh('cart', CART, 1, [sp0.x+rr(-2,2), sp0.z+rr(-2,2)]); }
  /* THE CARAVANS come in off the map along a highway, stand in the caravanserai's yard, and go back the way they came.
     At load some are already on the road and some already standing in the yard. */
  var ENDS = NAV.roadEnds || [], YARD = (POI.caravanserai||[])[0];
  /* the caravanserai's court: in through the gate passage (GATE_IN), then to a standing place in the court.
     Local frame of the building: +z is the gate side; the well is at (0,-3), the stables along -x. */
  var CS = CARAVANSERAI, CGN = ST.caravanGate ? ST2NAV[ST.caravanGate.id].id : -1;
  function csLoc(lx,lz){ var p=loc(CS.x,CS.z,lx,lz,CS.ry); return { x:p[0], z:p[1] }; }
  var GATE_OUT = ST.caravanGate ? { x:ST.caravanGate.x, z:ST.caravanGate.z } : csLoc(0,40), GATE_IN = csLoc(0,22);
  function courtSpot(){ return csLoc(rr(-30,30), rr(-22,-11)); }
  function newCaravan(state){ var E=pick(ENDS); if(!E || !YARD) return null;
    var v=spawnVeh('caravan', CARAVAN, CARAVAN.beasts, [E.x,E.z]); v.end=E; v.leg2='in'; v.node=E.id;
    if(state==='yard'){ var cp=courtSpot(); v.x=cp.x; v.z=cp.z; v.y=terrainH(v.x,v.z); v.leg2='rest'; v.wait=rr(20,120); v.node=CGN; }
    else if(state==='road'){ /* part-way down the highway */ var pth=navRoute(E.id, CGN, CARAVAN.minW); if(pth){ var k2=Math.floor(pth.length*rr(0.2,0.8)); var n=NAV.nodes[pth[k2]]; v.x=n.x; v.z=n.z; v.node=pth[k2]; } }
    return v; }
  for(var c2=0;c2<5;c2++) newCaravan(c2<2?'yard':(c2<4?'road':'edge'));
  function vehWant(v){
    if(v.kind==='caravan'){
      if(v.leg2==='in') return { target:YARD, node:CGN };
      if(v.leg2==='out') return { target:null, node:v.end.id };
      return null; }
    var w=pick(pool(CART.order)); return { target:w, node:navNear(w.doors?w.doors[0][0]:w.x, w.doors?w.doors[0][1]:w.z) }; }
  function stepVeh(v, dt, hour){
    if(v.hidden){ v.wait-=dt; if(v.wait<=0){ v.hidden=false; v.x=v.end.x; v.z=v.end.z; v.node=v.end.id; v.leg2='in'; } return; }
    if(v.leg){ moveLeg(v, dt); return; }
    if(v.wait > 0){ v.wait-=dt; v.moving=false; return; }
    if(!v.path){
      if(v.kind==='caravan' && v.leg2==='rest'){ v.leg2='out'; v.leg=GATE_IN; v.legs=[GATE_OUT]; v.node=CGN; return; }   /* out through the gate passage first */
      var W=vehWant(v); if(!W){ v.wait=5; return; }
      var s=v.node>=0?v.node:navNear(v.x,v.z), pth=navRoute(s, W.node, v.minW) || navRoute(s, W.node, 0);
      if(pth && pth.length>1){ v.path=pth; v.seg=0; v.t=0; v.node=-1; v.target=W.target; remember(v.kind, pth); }
      else { v.node=s; vehArrive(v, W.target); }
      return; }
    walkPath(v, dt, function(){ vehArrive(v, v.target); });
  }
  function vehArrive(v, w){
    if(v.kind==='caravan'){
      if(v.leg2==='in'){ v.leg2='rest'; v.wait=rr(CARAVAN.dwell[0], CARAVAN.dwell[1]); v.leg=GATE_IN; v.legs=[courtSpot()]; if(YARD) YARD.entries++; return; }
      if(v.leg2==='out'){ v.hidden=true; v.wait=rr(40,160); v.end=pick(ENDS); return; }   /* off the map; back later by a (maybe different) road */
    }
    v.leg = w ? standPoint(w, v.x, v.z) : null; if(w) w.entries++; v.wait=rr(v.cfg.dwell[0], v.cfg.dwell[1]);
  }

  /* ============================ 5. SHARED MOVEMENT ============================ */
  function walkPath(a, dt, onEnd){
    var A=NAV.nodes[a.path[a.seg]], B=NAV.nodes[a.path[a.seg+1]];
    if(!B){ a.node=a.path[a.seg]; a.path=null; onEnd(); return; }
    var dx=B.x-A.x, dz=B.z-A.z, L=Math.hypot(dx,dz)||1;
    a.t += a.speed*dt/L;
    while(a.t >= 1){ a.t-=1; a.seg++; A=NAV.nodes[a.path[a.seg]]; B=NAV.nodes[a.path[a.seg+1]];
      if(!B){ a.node=a.path[a.seg]; a.path=null; a.x=A.x; a.z=A.z; onEnd(); return; }
      dx=B.x-A.x; dz=B.z-A.z; L=Math.hypot(dx,dz)||1; }
    var nx=-dz/L, nz=dx/L, ew=0; var eid=null;
    a.bx = mix(A.x,B.x,a.t) + nx*a.off; a.bz = mix(A.z,B.z,a.t) + nz*a.off;
    a.x = a.bx + a.ox; a.z = a.bz + a.oz;
    var bd=bridgeDeckAt(a.x,a.z); a.y = bd!=null ? bd : Math.max(mix(A.y,B.y,a.t), terrainH(a.x,a.z)-0.2);
    a.ry = Math.atan2(dx,dz); a.dirx=dx/L; a.dirz=dz/L; a.moving=true;
  }
  function moveLeg(a, dt){ var lx=a.leg.x-a.x, lz=a.leg.z-a.z, L=Math.hypot(lx,lz);
    if(L < 0.4){ var lg=a.leg; a.leg=null; if(a.legs && a.legs.length){ a.leg=a.legs.shift(); return; } if(a.kind && KINDS[a.kind]) onLegEnd(a, lg); a.moving=false; return; }
    var st=Math.min(L, a.speed*0.8*dt); a.x+=lx/L*st; a.z+=lz/L*st; var bd=bridgeDeckAt(a.x,a.z); a.y=bd!=null?bd:terrainH(a.x,a.z); a.ry=Math.atan2(lx,lz); a.dirx=lx/L; a.dirz=lz/L; a.moving=true; a.step+=a.speed*dt*2.4; }
  function onLegEnd(a, lg){
    if(lg.field){ a.bent=1; a.wait=rr(8,22); a.inField--; if(a.inField>0 && skyHour() < a.cfg.hours[1]){ a.afterWait=function(){ a.bent=0; fieldLeg(a); }; } else a.afterWait=function(){ a.bent=0; }; return; }
    if(lg.board){ return; }
    settle(a, a.want);
  }
  function stepAgent(a, dt, hour){
    if(a.aboard) return;                                       /* the boat carries him */
    if(a.wait > 0){ a.wait-=dt; a.moving=false; if(a.wait<=0) a.inside=false; if(a.wait<=0 && a.afterWait){ var f=a.afterWait; a.afterWait=null; f(); } return; }
    if(a.leg){ moveLeg(a, dt); return; }
    if(!a.path){ if(a.pathPending) return; ask(a, destination(a, hour)); return; }
    walkPath(a, dt, function(){ arrive(a); });
    a.step += a.speed*dt*2.6;
  }

  /* ============================ 6. THE FISHING BOATS (water nav-grid, Voth's water traffic) ============================ */
  var BOATS = LIFE.boats, WN=RG.n, WATER=new Uint8Array(WN*WN);
  for(var wk=0; wk<WN*WN; wk++) WATER[wk] = (RG.W[wk]===1 || RG.W[wk]===3) ? 1 : 0;
  /* the jetties are solid; their heads are where a boat ties up */
  (POI.dock||[]).forEach(function(D){ var S=D.rec, R=Math.hypot(S.w,S.d)/2; for(var x=S.x-R;x<=S.x+R;x+=4) for(var z=S.z-R;z<=S.z+R;z+=4){ var q=loc(0,0,x-S.x,z-S.z,-S.ry); if(Math.abs(q[0])<3 && q[1] > -S.d/2+2 && q[1] < S.d/2){ var kk=rgIdx(x,z); if(kk>=0) WATER[kk]=0; } }
    var hk=rgIdx(D.head[0],D.head[1]); if(hk>=0) WATER[hk]=1; });
  function waterCost(k){ return WATER[k] ? (RG.H[k] > -0.6 ? 2.5 : 1) : Infinity; }   /* the shallows cost more: boats keep to the channel */
  function wsight(ax,az,bx,bz){ var L=Math.hypot(bx-ax,bz-az), n=Math.ceil(L/4); for(var i=1;i<n;i++){ var t=i/n, kk=rgIdx(mix(ax,bx,t),mix(az,bz,t)); if(kk<0 || !WATER[kk]) return false; } return true; }
  function waterRoute(x0,z0,x1,z1){
    var k0=rgIdx(x0,z0), k1=rgIdx(x1,z1); if(k0<0||k1<0) return null;
    var cells=rgAStar(k0, function(k){ return waterCost(k); }, function(k){ return k===k1; }, function(k){ var i=k%WN, j=(k-i)/WN; return Math.hypot(rgX(i)-x1, rgX(j)-z1)/RG.cell; }, 120000);
    if(!cells) return null;
    var P=cells.map(function(k){ var i=k%WN, j=(k-i)/WN; return [rgX(i), rgX(j)]; }); P[0]=[x0,z0]; P.push([x1,z1]);
    /* string-pull: drop every point the boat can see past, over water only */
    var out=[P[0]], i0=0; while(i0 < P.length-1){ var j0=P.length-1; while(j0 > i0+1 && !wsight(P[i0][0],P[i0][1],P[j0][0],P[j0][1])) j0--; out.push(P[j0]); i0=j0; }
    return out; }
  function fishingSpot(dock){ for(var t=0;t<60;t++){ var a=rnd()*TAU, r=rr(120, 1100), x=dock.head[0]+Math.cos(a)*r, z=dock.head[1]+Math.sin(a)*r, kk=rgIdx(x,z);
      if(kk>=0 && WATER[kk] && RG.H[kk] < -0.8 && Math.abs(x) < MAP_R && Math.abs(z) < MAP_R) return [x,z]; } return [dock.head[0], dock.head[1]+30]; }
  var BOATPATHS = [];
  /* a boat leaves its mooring by the jetty's head and comes back the same way: slot -> head -> ... -> head -> slot */
  function sendBoat(B, x, z, state){ var fromSlot = B.state==='moored', r=waterRoute(fromSlot?B.dock.head[0]:B.x, fromSlot?B.dock.head[1]:B.z, x, z);
    if(!r){ B.state=state==='home'?'moored':'fishing'; B.wait=rr(20,40); if(state==='home'){ B.x=B.slot[0]; B.z=B.slot[1]; } return; }
    if(fromSlot) r.unshift([B.x,B.z]); if(state==='home') r.push(B.slot);
    B.route=r; B.ri=0; B.state=state; BOATPATHS.push(r); if(BOATPATHS.length>60) BOATPATHS.shift(); }
  /* every fisherman has a boat at a dock; at 10:00 most are already out */
  AG.filter(function(a){ return a.kind==='fisher'; }).forEach(function(a, i){
    var D=(POI.dock||[])[i%(POI.dock||[1]).length]; if(!D) return;
    var slotN = (D.slots=(D.slots||0)+1)-1, side = slotN%2 ? 1 : -1, slot = loc(D.rec.x, D.rec.z, side*3.3, -13 + Math.floor(slotN/2)*6.5, D.rec.ry);
    var B={ id:BOATS.length, dock:D, slot:slot, x:slot[0], z:slot[1], ry:D.rec.ry+PI, state:'moored', wait:0, route:null, ri:0, crew:a, speed:rr(2.2,3.0), ox:0, oz:0, rad:2.6, prio:1,
            hull:pick([0x7a5a3a,0x5e6a70,0x8a6a4a,0x4a5a4a]), sail:pick(PAL.canvasDye) };
    BOATS.push(B); a.boat=B;
    var h=skyHour(); if(h >= a.cfg.hours[0]+1 && h < a.cfg.hours[1]-1 && rnd()<0.8){ var sp=fishingSpot(D); B.x=sp[0]; B.z=sp[1]; B.state='fishing'; B.wait=rr(10,90); a.aboard=true; a.x=B.x; a.z=B.z; }
  });
  function boardBoat(a){ var B=a.boat; a.aboard=true; B.state='out'; var sp=fishingSpot(B.dock); sendBoat(B, sp[0], sp[1], 'out'); }
  function stepBoat(B, dt, hour){
    var a=B.crew;
    if(B.state==='moored' || (B.wait>0 && B.state!=='out' && B.state!=='home')){ if(B.wait>0) B.wait-=dt;
      if(B.state==='fishing'){ B.ry += dt*0.05*Math.sin(B.id+hour); if(B.wait<=0){ if(hour >= a.cfg.hours[1]-1.2){ sendBoat(B, B.dock.head[0], B.dock.head[1], 'home'); } else { var sp=fishingSpot(B.dock); sendBoat(B, sp[0], sp[1], 'out'); } } }
      return; }
    if(!B.route){ B.state = B.state==='home' ? 'moored' : 'fishing'; B.wait=rr(40,120); return; }
    var T=B.route[B.ri+1]; if(!T){ var st=B.state; B.route=null;
      if(st==='home'){ B.state='moored'; B.ry=B.dock.rec.ry+PI; B.x=B.slot[0]; B.z=B.slot[1]; if(a){ a.aboard=false; a.x=B.dock.doors[0][0]; a.z=B.dock.doors[0][1]; a.node=-1; a.path=null; a.want=a.home; a.wait=rr(4,10); a.pathPending=false; } }
      else { B.state='fishing'; B.wait=rr(50,150); }
      return; }
    var dx=T[0]-B.x, dz=T[1]-B.z, L=Math.hypot(dx,dz); if(L < 3){ B.ri++; return; }
    var want=Math.atan2(dx,dz), dA=wrapPi(want-B.ry); B.ry += clamp(dA, -dt*0.9, dt*0.9);
    var sp=B.speed*(0.35+0.65*Math.max(0,Math.cos(dA)));
    B.x += Math.sin(B.ry)*sp*dt; B.z += Math.cos(B.ry)*sp*dt;
    if(terrainH(B.x,B.z) > -0.25 && !(B.ri===0 || B.ri>=B.route.length-2)){ B.x=mix(B.x,T[0],0.2); B.z=mix(B.z,T[1],0.2); }   /* never ground on the bank (except at the jetty) */
    if(a && a.aboard){ a.x=B.x; a.z=B.z; }
  }

  /* ============================ 7. THE LIZARD RIDERS (land nav-grid) ============================ */
  var SQUADS = LIFE.squads, SQ_N = 6, RIDE_SPEED = 5.0, GATE = [GATE_OUT.x, GATE_OUT.z], CITY_R = 470;
  /* across country the riders go where they like; in town they keep to the streets; roads and bridges are cheapest */
  function riderCost(k){ if(RG.ROAD[k]) return 0.8; if(RG.BLOCK[k]) return Infinity; var w=RG.W[k]; if(w===3) return Infinity; var h=RG.H[k];
    var i=k%RG.n, j=(k-i)/RG.n, x=rgX(i), z=rgX(j);
    var c = w===1 ? 16 : w===4 ? 3 : w===2 ? 6 : 1 + 1.6*smooth(2.4, 0.5, h);
    if(Math.hypot(x,z) < CITY_R || (Math.abs(x) < CITY_EXT && Math.abs(z) < CITY_EXT && LOCUS_FP.at(x,z))) c += 40; return c; }
  function edgePoint(avoid){ for(var t=0;t<80;t++){ var side=Math.floor(rnd()*4), u=rr(-MAP_R*0.92, MAP_R*0.92), x, z;
      if(side===0){ x=u; z=-MAP_R+10; } else if(side===1){ x=MAP_R-10; z=u; } else if(side===2){ x=u; z=MAP_R-10; } else { x=-MAP_R+10; z=u; }
      var k=rgIdx(x,z); if(k<0 || RG.W[k]===3 || RG.BLOCK[k] || RG.H[k] < 0.3) continue;
      if(avoid && Math.hypot(x-avoid[0], z-avoid[1]) < 1600) continue; return [x,z,side]; } return [MAP_R-10, 0, 1]; }
  function landRoute(x0,z0,x1,z1,inbound){ var k0=rgIdx(x0,z0), k1=rgIdx(x1,z1); if(k0<0||k1<0) return null;
    var cells=rgAStar(k0, riderCost, function(k){ var i=k%RG.n, j=(k-i)/RG.n; return Math.hypot(rgX(i)-x1, rgX(j)-z1) < 14; }, function(k){ var i=k%RG.n, j=(k-i)/RG.n; return Math.hypot(rgX(i)-x1,rgX(j)-z1)/RG.cell*0.7; }, 300000);
    if(!cells) return null; var P=rgPolyline(cells); P[0]=[x0,z0]; P.push([x1,z1]);
    if(inbound){ P.push([GATE_IN.x,GATE_IN.z]); var cc=csLoc(0,6); P.push([cc.x,cc.z]); } else if(inbound===false){ var c0=csLoc(0,6); P.unshift([GATE_IN.x,GATE_IN.z]); P.unshift([c0.x,c0.z]); }
    var cum=[0]; for(var i=1;i<P.length;i++) cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    return { pts:P, cum:cum, len:cum[cum.length-1] }; }
  function routeAt(R, s){ s=clamp(s,0,R.len); var lo=0, hi=R.cum.length-1; while(lo<hi-1){ var m=(lo+hi)>>1; if(R.cum[m]<=s) lo=m; else hi=m; }
    var t=(s-R.cum[lo])/((R.cum[lo+1]-R.cum[lo])||1), A=R.pts[lo], B=R.pts[Math.min(lo+1,R.pts.length-1)], dx=B[0]-A[0], dz=B[1]-A[1], L=Math.hypot(dx,dz)||1;
    return { x:mix(A[0],B[0],t), z:mix(A[1],B[1],t), tx:dx/L, tz:dz/L }; }
  var RIDERPATHS = [], SQ_SERIAL = 0;
  var TRIBES = [ { name:'the Salt-Road riders', cloth:0x8a3a2a, hide:0x6a7a4a }, { name:'the Red Shore clan', cloth:0xb85a30, hide:0x7a6a4a }, { name:'the Reed-Walkers', cloth:0x3a5a6a, hide:0x5a6a3a }, { name:'the Ashen Fans', cloth:0x5a4a6a, hide:0x6a5a4a } ];
  function newSquad(atProgress){
    var E=edgePoint(), R=landRoute(E[0],E[1],GATE[0],GATE[1],true); if(!R){ return null; }
    var T=TRIBES[SQ_SERIAL%TRIBES.length], Q={ id:SQ_SERIAL++, tribe:T, route:R, s:0, phase:'in', wait:0, n:SQ_N, riders:[], ox:0, oz:0, prio:4, rad:3.2, from:E };
    for(var i=0;i<SQ_N;i++) Q.riders.push({ lag:i*6.5 + (i%2)*1.5, lat:(i===0?0:(i%2?1.7:-1.7)), bob:rnd()*TAU, cloth: i===0 ? 0xd8a030 : T.cloth, hide:shade(T.hide, rr(-0.1,0.1)), skin:pick(G.skin), x:E[0], z:E[1], y:0, ry:0 });
    if(atProgress!=null) Q.s = R.len*atProgress;
    SQUADS.push(Q); RIDERPATHS.push(R.pts); if(RIDERPATHS.length>12) RIDERPATHS.shift(); return Q; }
  /* one squad is about to arrive at the caravanserai as the scene opens: 70 m short of the gate */
  (function(){ var Q=newSquad(null); if(Q) Q.s = Math.max(0, Q.route.len - 90); })();
  var SQ_CLOCK = 0;
  function stepSquad(Q, dt){
    if(Q.wait > 0){ Q.wait-=dt; if(Q.wait<=0 && Q.phase==='rest'){ var E=edgePoint(Q.from), R=landRoute(GATE[0],GATE[1],E[0],E[1],false); if(R){ Q.route=R; Q.s=0; Q.phase='out'; RIDERPATHS.push(R.pts); } else Q.dead=true; } return; }
    Q.s += RIDE_SPEED*dt;
    if(Q.s >= Q.route.len + SQ_N*7){ if(Q.phase==='in'){ Q.phase='rest'; Q.wait=rr(14,24); YARD && YARD.entries++; } else Q.dead=true; }
  }
  function placeRiders(Q, dt){
    Q.riders.forEach(function(r, i){ var s = Q.s - r.lag; var P=routeAt(Q.route, s), lat=r.lat;
      /* the file narrows to single file where the ground is tight: in town, on a bridge, near a building */
      var tight = Math.hypot(P.x,P.z) < 470 || LOCUS_FP.at(P.x - P.tz*2.5, P.z + P.tx*2.5) || LOCUS_FP.at(P.x + P.tz*2.5, P.z - P.tx*2.5); if(tight) lat*=0.2;
      /* halted: a line abreast in the court, facing the well */
      if(Q.phase==='rest'){ var cp=csLoc(-14+i*5.6, 10), f=loc(0,0,0,-1,CS.ry); P={ x:cp.x, z:cp.z, tx:f[0], tz:f[1] }; lat=0; }
      var x=P.x - P.tz*lat + (i===0?Q.ox:0), z=P.z + P.tx*lat + (i===0?Q.oz:0), h=terrainH(x,z), bd=bridgeDeckAt(x,z);
      if(r.init){ var k2=Math.min(1, dt*3); x=mix(r.x,x,k2); z=mix(r.z,z,k2); } r.init=true;   /* no rider ever jumps */
      r.x=x; r.z=z; r.y = bd!=null ? bd : Math.max(h, -0.7); r.ry=Math.atan2(P.tx,P.tz); r.moving = Q.phase!=='rest' && s > 0 && s < Q.route.len; });
  }

  /* ============================ 8. LOCAL AVOIDANCE (Voth's separation steering) ============================ */
  var AV = { cell:8, grid:{} };
  function giveWay(mine, other){ if(other > mine) return 1.4; if(other===mine) return 1.0; return 0.22; }
  function avoidAll(list, dt){
    AV.grid={};
    for(var i=0;i<list.length;i++){ var e=list[i]; if(e.hidden || e.aboard || e.inside) continue; var k=Math.floor(e.x/AV.cell)+':'+Math.floor(e.z/AV.cell); (AV.grid[k]||(AV.grid[k]=[])).push(e); }
    for(i=0;i<list.length;i++){ var a=list[i]; if(!a.moving || a.hidden || a.aboard) { a.ox*=0.9; a.oz*=0.9; continue; }
      var px=0, pz=0, cx=Math.floor(a.x/AV.cell), cz=Math.floor(a.z/AV.cell);
      /* the REAL position first; only if nothing is close now, the look-ahead point */
      for(var pass=0; pass<2 && px===0 && pz===0; pass++){ var qx = pass ? a.x + (a.dirx||0)*3 : a.x, qz = pass ? a.z + (a.dirz||0)*3 : a.z;
        for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){ var cell=AV.grid[(cx+di)+':'+(cz+dj)]; if(!cell) continue;
          for(var n=0;n<cell.length;n++){ var o=cell[n]; if(o===a) continue; var dx=qx-o.x, dz=qz-o.z, d=Math.hypot(dx,dz)||0.01, minD=a.rad+o.rad;
            if(d < minD){ var w=(minD-d)/minD*giveWay(a.prio, o.prio)*(pass?0.5:1); px+=dx/d*w; pz+=dz/d*w; } } } }
      var mag=Math.hypot(px,pz), maxO = a.prio>=2 ? 2.2 : 1.6;
      if(mag > 1e-4){ a.ox = clamp(a.ox + px/mag*Math.min(mag,1)*dt*2.2, -maxO, maxO); a.oz = clamp(a.oz + pz/mag*Math.min(mag,1)*dt*2.2, -maxO, maxO); }
      else { a.ox*=0.97; a.oz*=0.97; } }
  }

  /* ============================ 9. THE BODIES ============================ */
  function merge(parts){ var pos=[], nor=[], col=[], c=new THREE.Color();
    parts.forEach(function(p){ var g=p.g.index ? p.g.toNonIndexed() : p.g, P=g.attributes.position, Nn=g.attributes.normal; c.set(p.c).convertSRGBToLinear();
      for(var i=0;i<P.count;i++){ pos.push(P.getX(i),P.getY(i),P.getZ(i)); nor.push(Nn.getX(i),Nn.getY(i),Nn.getZ(i)); col.push(c.r,c.g,c.b); } });
    var G2=new THREE.BufferGeometry(); G2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); G2.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); G2.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return G2; }
  function box(w,h,d,x,y,z,rx,ry){ var g=new THREE.BoxGeometry(w,h,d); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); return g; }
  function IM(geo, n, label, vc){ var m=new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ vertexColors:!!vc }), n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.setColorAt(0, new THREE.Color(0xffffff)); m.frustumCulled=false; m.castShadow=!FAST; m.receiveShadow=false; m.count=0; m.userData.lifeLabel=label; scene.add(m); return m; }
  var gBody=new THREE.CylinderGeometry(0.19,0.27,1.06,7,1,false); gBody.translate(0,0.53,0);
  var gHead=new THREE.SphereGeometry(0.155,7,5); gHead.translate(0,1.28,0);
  var gPack=new THREE.BoxGeometry(0.36,0.46,0.22); gPack.translate(0,0.86,-0.24);
  var gHat=new THREE.ConeGeometry(0.34,0.24,8); gHat.translate(0,1.47,0);
  var gCart=merge([ {g:box(1.3,0.5,2.3,0,0.85,0), c:0x8a6a48}, {g:box(1.4,0.12,2.4,0,1.1,0), c:0x6a5038}, {g:new THREE.CylinderGeometry(0.55,0.55,0.12,10).rotateZ(PI/2).translate(0.72,0.55,0.1), c:0x4a3828}, {g:new THREE.CylinderGeometry(0.55,0.55,0.12,10).rotateZ(PI/2).translate(-0.72,0.55,0.1), c:0x4a3828}, {g:box(1.2,0.7,1.8,0,1.2,0), c:0xdccfb0} ]);
  /* a pack lizard: long low body, a tail, a blunt head, four splayed legs */
  var gBeast=merge([ {g:box(0.9,0.7,2.2,0,0.95,0), c:0x6a6a4a}, {g:box(0.5,0.4,1.8,0,0.85,-1.9,0.12), c:0x5e5e40}, {g:box(0.55,0.45,0.8,0,1.1,1.4,-0.15), c:0x6a6a4a},
                     {g:box(0.2,0.8,0.2,0.5,0.4,0.7), c:0x55553a}, {g:box(0.2,0.8,0.2,-0.5,0.4,0.7), c:0x55553a}, {g:box(0.2,0.8,0.2,0.5,0.4,-0.7), c:0x55553a}, {g:box(0.2,0.8,0.2,-0.5,0.4,-0.7), c:0x55553a},
                     {g:box(1.2,0.5,1.1,0,1.45,-0.1), c:0xcdb98a} ]);
  /* a riding lizard: taller, a saddle, a raised frill behind the head */
  var gMount=merge([ {g:box(1.0,0.9,2.6,0,1.35,0), c:0x7a7a52}, {g:box(0.55,0.5,2.4,0,1.15,-2.4,0.18), c:0x6a6a46}, {g:box(0.6,0.55,1.0,0,1.75,1.8,-0.35), c:0x7a7a52},
                     {g:box(1.4,1.0,0.08,0,2.1,1.35,-0.3), c:0xb85a30}, {g:box(0.26,1.2,0.26,0.62,0.6,0.9), c:0x5e5e40}, {g:box(0.26,1.2,0.26,-0.62,0.6,0.9), c:0x5e5e40},
                     {g:box(0.26,1.2,0.26,0.62,0.6,-0.9), c:0x5e5e40}, {g:box(0.26,1.2,0.26,-0.62,0.6,-0.9), c:0x5e5e40}, {g:box(1.1,0.2,1.0,0,1.85,0), c:0x3a2a20} ]);
  var gBoat=merge([ {g:box(1.5,0.5,5.2,0,0.1,0), c:0xffffff}, {g:box(1.1,0.35,1.2,0,0.1,2.8,0.35), c:0xffffff}, {g:box(1.3,0.08,4.6,0,0.36,0), c:0x8a7050},
                    {g:new THREE.CylinderGeometry(0.06,0.06,4.2,5).translate(0,2.4,0.8), c:0x6a5038}, {g:box(0.04,2.8,1.6,0,2.6,0.2), c:0xe6dbc2} ]);
  var MAXP=1100, mBody=IM(gBody,MAXP,'body'), mHead=IM(gHead,MAXP,'head'), mPack=IM(gPack,400,'pack'), mHat=IM(gHat,400,'hat'), mCart=IM(gCart,60,'cart',true), mBeast=IM(gBeast,120,'beast',true),
      mMount=IM(gMount, 240,'mount',true), mBoat=IM(gBoat, 40,'boat',true);
  var _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3(1,1,1), _c=new THREE.Color();
  function put(mesh, idx, x,y,z, ry, sx,sy,sz, col, pitch){ _e.set(pitch||0, ry, 0, 'YXZ'); _q.setFromEuler(_e); _p.set(x,y,z); _s.set(sx,sy,sz); _m.compose(_p,_q,_s); mesh.setMatrixAt(idx,_m); if(col!=null){ _c.setHex(col).convertSRGBToLinear(); mesh.setColorAt(idx,_c); } }
  /* the inspector: every instance knows who it is (classification: life layer) */
  var WHO = { body:[], mount:[], boat:[], cart:[], beast:[] };
  function lifeName(o){ if(!o) return null;
    if(o.kind && LABEL[o.kind]) return LABEL[o.kind]+' — life layer · pedestrian · '+(o.aboard?'aboard his boat':(o.want && o.want.name ? 'bound for '+o.want.name : (o.wait>0?'waiting':'walking')))+(o.pack?' · pack on his back':'');
    if(o.kind==='cart') return 'Ox-lizard cart — life layer · vehicle · carries goods between the warehouse, the market, the refinery and the caravanserai';
    if(o.kind==='caravan') return 'Caravan — life layer · vehicle · '+(o.leg2==='in'?'inbound from the '+(o.end?o.end.name:'road'):o.leg2==='rest'?'resting in the caravanserai yard':'outbound');
    if(o.tribe) return 'Lizard rider of '+o.tribe.name+' — life layer · nomad squad · '+(o.phase==='in'?'riding in to the caravanserai':o.phase==='rest'?'halted at the caravanserai':'riding out');
    if(o.dock) return 'Fishing boat — life layer · vessel · '+(o.state==='moored'?'moored at '+o.dock.name:o.state==='fishing'?'fishing':'under sail');
    return null; }
  [ [mBody,'body'],[mHead,'body'],[mPack,'pack'],[mHat,'hat'] ].forEach(function(p){ p[0].userData.inspectFn=function(i){ var arr = p[1]==='body' ? WHO.body : (p[1]==='pack' ? WHO.pack : WHO.hat); return lifeName(arr && arr[i]); }; });
  mMount.userData.inspectFn=function(i){ return lifeName(WHO.mount[i]); }; mBoat.userData.inspectFn=function(i){ return lifeName(WHO.boat[i]); };
  mCart.userData.inspectFn=function(i){ return lifeName(WHO.cart[i]); }; mBeast.userData.inspectFn=function(i){ return lifeName(WHO.beast[i]); };

  /* ============================ 10. THE TICK ============================ */
  var VIS=560, statT=0;
  TICKS.push(function(dt, hour){
    if(!(dt>0)) return; dt=Math.min(dt, 0.1);
    serve();
    for(var i=0;i<AG.length;i++) stepAgent(AG[i], dt, hour);
    for(i=0;i<VEH.length;i++) stepVeh(VEH[i], dt, hour);
    for(i=0;i<BOATS.length;i++) stepBoat(BOATS[i], dt, hour);
    /* once a minute a squad of lizard riders comes in off a random edge of the map */
    SQ_CLOCK += dt; if(SQ_CLOCK >= 60){ SQ_CLOCK=0; newSquad(null); }
    for(i=SQUADS.length-1;i>=0;i--){ stepSquad(SQUADS[i], dt); if(SQUADS[i].dead) SQUADS.splice(i,1); }
    avoidAll(AG.concat(VEH).concat(SQUADS.map(function(Q){ var r=Q.riders[0]; Q.x=r.x; Q.z=r.z; Q.moving=r.moving; return Q; })), dt);
    avoidAll(BOATS.map(function(B){ B.moving=!!B.route; B.dirx=Math.sin(B.ry); B.dirz=Math.cos(B.ry); return B; }), dt);
    /* draw */
    var cx=camera.position.x, cz=camera.position.z, far=VIS*VIS, nb=0, np=0, nh=0, nc=0, nbe=0, nm=0, nbo=0;
    WHO.body.length=0; WHO.pack=[]; WHO.hat=[]; WHO.mount.length=0; WHO.boat.length=0; WHO.cart.length=0; WHO.beast.length=0;
    function person(o, x,y,z, ry, garb, skin, bob, bent, pack, hat){ if(nb>=MAXP) return;
      var pitch = bent ? 0.9 : 0; put(mBody, nb, x, y+bob, z, ry, 1, bent?0.8:1, 1, garb, pitch); put(mHead, nb, x + (bent?Math.sin(ry)*0.55:0), y+bob-(bent?0.45:0), z + (bent?Math.cos(ry)*0.55:0), ry, 1,1,1, skin); WHO.body[nb]=o; nb++;
      if(pack && np<400){ put(mPack, np, x, y+bob, z, ry, 1,1,1, CANVASC[3], pitch); WHO.pack[np]=o; np++; }
      if(hat && nh<400){ put(mHat, nh, x + (bent?Math.sin(ry)*0.6:0), y+bob-(bent?0.5:0), z + (bent?Math.cos(ry)*0.6:0), ry, 1,1,1, 0xd8c890); WHO.hat[nh]=o; nh++; } }
    for(i=0;i<AG.length;i++){ var a=AG[i]; if(a.aboard || a.inside) continue; var dx=a.x-cx, dz=a.z-cz; if(dx*dx+dz*dz > far) continue;
      var bob=a.moving ? Math.abs(Math.sin(a.step))*0.05 : 0; person(a, a.x, a.y+(a.bent?-0.15:0), a.z, a.ry, a.garb, a.skin, bob, a.bent, a.pack, a.hat); }
    for(i=0;i<VEH.length;i++){ var v=VEH[i]; if(v.hidden) continue; var vdx=v.x-cx, vdz=v.z-cz; if(vdx*vdx+vdz*vdz > far*2) continue;
      if(nc<60 && v.kind==='cart'){ put(mCart, nc, v.x, v.y, v.z, v.ry, 1,1,1, 0xffffff); WHO.cart[nc]=v; nc++; }
      /* a cart's lizard pulls in front; a caravan's pack lizards follow their leader nose to tail */
      for(var b=0;b<v.beasts && nbe<120;b++){ var fw = v.kind==='cart' ? 2.7 : -b*3.4, bx=v.x+Math.sin(v.ry)*fw, bz=v.z+Math.cos(v.ry)*fw; put(mBeast, nbe, bx, v.y, bz, v.ry, 1,1,1, 0xffffff); WHO.beast[nbe]=v; nbe++; }
      if(v.kind==='cart') person(v, v.x+Math.sin(v.ry)*0.7, v.y+0.95, v.z+Math.cos(v.ry)*0.7, v.ry, v.garb, v.skin, 0, false, false, false);
      else { var px2=v.x+Math.sin(v.ry)*2.2+Math.cos(v.ry)*1.1, pz2=v.z+Math.cos(v.ry)*2.2-Math.sin(v.ry)*1.1; person(v, px2, v.y, pz2, v.ry, v.garb, v.skin, 0, false, true, true); } }
    SQUADS.forEach(function(Q){ placeRiders(Q, dt); Q.riders.forEach(function(r){ var dx=r.x-cx, dz=r.z-cz; if(dx*dx+dz*dz > far*3 || nm>=240) return;
      var bob = r.moving ? Math.abs(Math.sin(performance.now()*0.006 + r.bob))*0.12 : 0;
      put(mMount, nm, r.x, r.y+bob, r.z, r.ry, 1,1,1, 0xffffff); WHO.mount[nm]=Q; nm++;
      person(Q, r.x, r.y+1.75+bob, r.z, r.ry, r.cloth, r.skin, 0, false, false, true); }); });
    for(i=0;i<BOATS.length;i++){ var B=BOATS[i], bdx=B.x-cx, bdz=B.z-cz; if(bdx*bdx+bdz*bdz > far*3 || nbo>=40) continue;
      var rock=Math.sin(performance.now()*0.0011+B.id)*0.03; put(mBoat, nbo, B.x+B.ox, 0.05, B.z+B.oz, B.ry, 1,1,1, B.hull, rock); WHO.boat[nbo]=B; nbo++;
      if(B.crew && B.crew.aboard) person(B.crew, B.x+B.ox-Math.sin(B.ry)*1.6, 0.35, B.z+B.oz-Math.cos(B.ry)*1.6, B.ry, B.crew.garb, B.crew.skin, 0, B.state==='fishing', false, B.crew.hat); }
    mBody.count=nb; mHead.count=nb; mPack.count=np; mHat.count=nh; mCart.count=nc; mBeast.count=nbe; mMount.count=nm; mBoat.count=nbo;
    [mBody,mHead,mPack,mHat,mCart,mBeast,mMount,mBoat].forEach(function(m){ m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; });
    statT+=dt; if(statT>1){ statT=0; LIFE.stats.drawn=nb; LIFE.stats.boatsOut=BOATS.filter(function(B){ return B.state!=='moored'; }).length; LIFE.stats.squads=SQUADS.length; }
  });

  /* ============================ 11. THE PATH DEVTOOL: one layer per population ============================ */
  function routesOf(kind){ var out=[], m=USED[kind]; if(m) for(var kk in m){ var ab=kk.split('_'), A=NAV.nodes[+ab[0]], B=NAV.nodes[+ab[1]]; if(A&&B) out.push([[A.x,A.y+0.5,A.z],[B.x,B.y+0.5,B.z]]); }
    AG.forEach(function(a){ if(a.kind===kind && a.leg) out.push([[a.x,a.y+0.5,a.z],[a.leg.x,terrainH(a.leg.x,a.leg.z)+0.5,a.leg.z]]); }); return out; }
  function polys(list, y){ return list.map(function(P){ return P.map(function(p){ return [p[0], y==null?Math.max(terrainH(p[0],p[1]),0)+0.6:y, p[1]]; }); }); }
  [ ['rambler','Life: townspeople',0], ['merchant','Life: merchants',1], ['geomancer','Life: Geomancers',2], ['farmer','Life: salt-rice farmers',5], ['fisher','Life: fishermen (on foot)',3], ['cart','Life: carts',4], ['caravan','Life: caravans',4] ]
    .forEach(function(V){ PATHVIZ.push({ key:'life_'+V[0], label:V[1], color:PAL.pathlife[V[2]], width:2.8, paths:function(){ return routesOf(V[0]); } }); });
  PATHVIZ.push({ key:'life_boats', label:'Life: fishing boats (water nav-grid)', color:0x35e0ff, width:3.2, paths:function(){ return polys(BOATPATHS, 0.5); } });
  PATHVIZ.push({ key:'life_riders', label:'Life: lizard riders (cross-country)', color:0xff4f2a, width:3.6, paths:function(){ return polys(RIDERPATHS); } });

  window._life = { agents:AG.length, vehicles:VEH.length, boats:BOATS.length, byKind:byKind, poi:(function(){ var o={}; for(var c in POI) o[c]=POI[c].length; return o; })(),
    squads:function(){ return SQUADS.map(function(Q){ return { tribe:Q.tribe.name, phase:Q.phase, s:+Q.s.toFixed(0), len:+Q.route.len.toFixed(0), lead:[+Q.riders[0].x.toFixed(0), +Q.riders[0].z.toFixed(0)] }; }); },
    boatsState:function(){ return BOATS.map(function(B){ return B.state; }); }, routeFailures:function(){ return FAILED; }, stats:LIFE.stats,
    corridors:function(){ var o={}; for(var k2 in USED) o[k2]=Object.keys(USED[k2]).length; return o; },
    doorEntries:function(){ return LIFE.doors.filter(function(d){ return d.entries>0; }).length; },
    /* debug: a sample of agents, the instanced meshes' counts, and a helper to put the camera on someone */
    debug:function(){ var M=[mBody,mHead,mPack,mHat,mCart,mBeast,mMount,mBoat].map(function(m){ var e=new THREE.Matrix4(); if(m.count) m.getMatrixAt(0,e); return [m.userData.lifeLabel, m.count, m.count?e.elements.slice(12,15).map(function(v){ return +v.toFixed(1); }):null]; });
      return { cam:[camera.position.x,camera.position.y,camera.position.z].map(function(v){ return +v.toFixed(0); }), meshes:M,
        ag:AG.slice(0,6).map(function(a){ return [a.kind,+a.x.toFixed(1),+a.y.toFixed(1),+a.z.toFixed(1),+a.wait.toFixed(0),!!a.path,!!a.leg,!!a.aboard]; }),
        veh:VEH.map(function(v){ return [v.kind,+v.x.toFixed(0),+v.z.toFixed(0),v.leg2||'',v.hidden,+v.wait.toFixed(0)]; }),
        nearMarket:AG.filter(function(a){ return Math.hypot(a.x-MARKET.x,a.z-MARKET.z)<60; }).length }; },
    lookSquad:function(){ var Q=SQUADS[0]; if(!Q) return null; var r=Q.riders[0]; _dbg.setView(r.x+16, r.y+8, r.z+16, r.x, r.y+1.5, r.z); return [Q.tribe.name, Q.phase, r.x, r.z]; },
    lookBoat:function(i){ var B=BOATS.filter(function(b){ return b.state!=='moored'; })[i||0] || BOATS[0]; _dbg.setView(B.x+14, 7, B.z+14, B.x, 0.5, B.z); return [B.state, B.x, B.z]; },
    lookFarm:function(){ var a=AG.filter(function(q){ return q.kind==='farmer' && q.farm && Math.hypot(q.x-q.farm.x,q.z-q.farm.z)<30; })[0] || AG.filter(function(q){ return q.kind==='farmer'; })[0]; _dbg.setView(a.x+12, a.y+7, a.z+12, a.x, a.y+1, a.z); return [a.x,a.z,a.bent]; },
    look:function(i){ var a=AG[i]||AG[0]; _dbg.setView(a.x+9, a.y+5, a.z+9, a.x, a.y+1, a.z); return [a.kind, a.x, a.z]; } };
})();
