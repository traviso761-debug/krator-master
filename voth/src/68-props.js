/* ============================== 19d. STREET PROPS & DRESSING ==============
   Places the reusable objects the facade pass built in 65-facade.js
   (shrineTriptych, statue, obelisk, benchPlain/Ornate, brazierPlain/Ornate,
   siltStriderStation, canoe, ferry) across the finished street network,
   gates, canton approaches and water. WHERE things go is a placement
   decision — planner-kept per SUBAGENT.md — so this fragment does the
   placing; 65-facade.js only defines the objects and is read-only here.
   Runs after 60-land.js (claim()/PLACED/GRID exist), 65-facade.js (the
   object functions exist) and 30-layout.js's road graph (RNODE/REDGE/
   zoneAt exist), before 75-terrain.js's emitBuckets(). */
reseed(680001);   /* fragment head seed — build.py enforces this. */

var PROPN = { furniture:0, shrines:0, statues:0, obelisks:0, station:0, canoes:0, ferries:0,
              at:{ shrines:[], statues:[], obelisks:[], station:null, canoes:[], ferries:[] } };

/* ---- street furniture: benches and braziers along the road graph -------- */
reseed(68010);
(function placeStreetFurniture(){
  var STEP = 55;   /* candidate spacing along an edge, world units */
  REDGE.forEach(function(e){
    var A = RNODE[e.a], B = RNODE[e.b];
    var dx = B.x-A.x, dz = B.z-A.z, len = Math.hypot(dx,dz);
    if(len < 12) return;
    var tx = dx/len, tz = dz/len, nx = -tz, nz = tx;
    var zn = zoneAt((A.x+B.x)/2, (A.z+B.z)/2);
    if(zn!=='core' && zn!=='warren' && zn!=='estate' && zn!=='manor' && zn!=='shorehut') return;
    var ornateChance = (zn==='core' || zn==='estate') ? 0.55 : 0.12;
    var rate = (e.cls==='boulevard' || e.cls==='quay') ? 0.42 : (e.cls==='ring' ? 0.26 : 0.15);
    var n = Math.max(1, Math.round(len/STEP));
    for(var k=0;k<n;k++){
      if(!chance(rate)) continue;
      var t = (k+0.5)/n;
      var px = A.x+dx*t, pz = A.z+dz*t;
      var side = chance(0.5) ? 1 : -1;
      var off = e.w*0.5 + rr(2.5,5);
      var x = px + nx*off*side, z = pz + nz*off*side;
      if(!openAt(x,z)) continue;
      var ry = Math.atan2(tx,tz) + (side>0 ? Math.PI/2 : -Math.PI/2);
      var y = terrainH(x,z);
      var isBench = chance(0.55);
      var ornate = chance(ornateChance);
      if(isBench){
        if(!claim(x,z,2.2,1.4,ry,'prop')) continue;
        (ornate?benchOrnate:benchPlain)(x,y,z,ry,null,{});
      }else{
        if(!claim(x,z,0.9,0.9,ry,'prop')) continue;
        (ornate?brazierOrnate:brazierPlain)(x,y,z,ry,null,{});
      }
      PROPN.furniture++;
    }
  });
})();

/* ---- wayside shrines: a handful of gates, plus quiet core corners ------- */
reseed(68020);
(function placeShrines(){
  [0,2,4].forEach(function(gi){
    var g = GATES[gi]; if(!g) return;
    var ry = shoreRY(g.s);
    var p = loc(g.x, g.z, 26, rr(-10,10), ry);
    if(!openAt(p[0],p[1])) return;
    if(!claim(p[0],p[1], 4.5, 2, ry, 'prop')) return;
    shrineTriptych(p[0], terrainH(p[0],p[1]), p[1], ry, null, {});
    PROPN.shrines++; PROPN.at.shrines.push([p[0],p[1]]);
  });
  /* quiet corners: core nodes of modest degree (2-3 — a turning, not a
     crossroads) away from the busiest junctions */
  var candidates = RNODE.filter(function(n){ return n.deg>=2 && n.deg<=3 && zoneAt(n.x,n.z)==='core'; });
  shuffle(candidates);
  var placed = [];
  for(var i=0;i<candidates.length && PROPN.shrines<9;i++){
    var n = candidates[i];
    var tooClose = placed.some(function(p){ return Math.hypot(p.x-n.x,p.z-n.z) < 260; });
    if(tooClose) continue;
    var ry2 = rnd()*Math.PI*2;
    var p2 = loc(n.x,n.z, rr(6,12), rr(-6,6), ry2);
    if(!openAt(p2[0],p2[1])) continue;
    if(!claim(p2[0],p2[1], 4.5, 2, ry2, 'prop')) continue;
    shrineTriptych(p2[0], terrainH(p2[0],p2[1]), p2[1], ry2, null, {});
    placed.push(n); PROPN.shrines++; PROPN.at.shrines.push([p2[0],p2[1]]);
  }
})();

/* ---- statues: canton causeway landings and grand compound gates --------- */
reseed(68030);
(function placeStatues(){
  CAUSEWAYS.forEach(function(cw){
    if(cw.solid) return;              /* reclaimed moles get no honour guard */
    if(!chance(0.5)) return;
    var land = shoreIn(cw.s, 60);
    var ry = shoreRY(cw.s);
    if(!openAt(land[0],land[1])) return;
    if(!claim(land[0],land[1], 1.6, 1.6, ry, 'prop')) return;
    statue(land[0], terrainH(land[0],land[1]), land[1], ry, null, {});
    PROPN.statues++; PROPN.at.statues.push([land[0],land[1]]);
  });
  COMPOUNDS.forEach(function(c){
    if(!chance(0.22)) return;
    var p = loc(c.x, c.z, c.wallFx*1.25, 0, c.ry);
    if(!openAt(p[0],p[1])) return;
    if(!claim(p[0],p[1], 1.6, 1.6, c.ry, 'prop')) return;
    statue(p[0], terrainH(p[0],p[1]), p[1], c.ry, c.wallCol, {});
    PROPN.statues++; PROPN.at.statues.push([p[0],p[1]]);
  });
})();

/* ---- obelisks: isolated landmarks --------------------------------------
   Each landmark gives an arc length to search near, not a literal spot: a
   single guessed inset regularly lands on already-painted infrastructure
   (a causeway's own wide mask stroke, the harbour apron, the waterline
   itself) — found by direct probing, not assumption. Search outward in
   inset and try claim() itself, same reasoning as the station above. */
reseed(68040);
(function placeObelisks(){
  var insets = [40,70,100,140,180,220,260,300];
  function placeNear(sBase){
    for(var i=0;i<insets.length;i++){
      var p = shoreIn(sBase, insets[i]);
      if(!openAt(p[0],p[1])) continue;
      var ry = shoreRY(sBase);
      if(!claim(p[0],p[1], 2.6, 2.6, ry, 'prop')) continue;
      obelisk(p[0], terrainH(p[0],p[1]), p[1], ry, null, {});
      PROPN.obelisks++; PROPN.at.obelisks.push([p[0],p[1]]);
      return;
    }
  }
  placeNear(shoreS(-545,-317));                         /* the promontory tip */
  if(CIDX['Fortress']) placeNear(S_10);                  /* the Fortress causeway approach */
  if(RBRIDGES[0]) placeNear(shoreS(RBRIDGES[0].ax, RBRIDGES[0].az));  /* a river-bridge landing */
  placeNear(HARB_S);                                     /* the harbour quay */
})();

/* ---- silt strider station: one, near a gate ------------------------------
   A ~16x22 footprint is large enough that a single guessed point regularly
   fails against the warren's tight block sizes (900-4000 sq units, per the
   road-graph work) — search several gates x insets x lateral offsets and
   let claim() itself be the test, rather than trust openAt() at one point
   to predict whether the full footprint actually fits. */
(function placeSiltStrider(){
  /* the FIRST station belongs on the bank opposite the river docks (RPIERS
     sit on the north bank, at p.nx*(hb+6) — see 30-layout.js) so silt
     striders and river cargo use different landings, not the same quay.
     Sweep along the river itself, south bank (-nx), before falling back to
     the old gate search below. */
  if(RPIERS.length){
    var uBase = RIVER_HEAD + 30 + 1.5*58;   /* centred on the RPIERS' own u-range */
    var insetsR = [40,70,100,130,160,200,240,280];
    var duR = [0,60,-60,120,-120,180,-180];
    for(var di=0; di<duR.length; di++){
      var pr = riverAt(uBase + duR[di]), hbR = riverHalf(pr.x,pr.z);
      for(var ir=0; ir<insetsR.length; ir++){
        var sx = pr.x - pr.nx*(hbR+insetsR[ir]), sz = pr.z - pr.nz*(hbR+insetsR[ir]);
        if(!openAt(sx,sz)) continue;
        var ryR = Math.atan2(-pr.nx,-pr.nz);
        if(!claim(sx,sz, 9, 12, ryR, 'prop')) continue;
        siltStriderStation(sx, terrainH(sx,sz), sz, ryR, null, {});
        PROPN.station = 1; PROPN.at.station = [sx,sz];
        return;
      }
    }
  }
  var insets = [100,130,160,190,220,250,280,320,360,400,440,480];
  var offs = [0,40,-40,80,-80];
  for(var gi=0; gi<GATES.length; gi++){
    var g = GATES[gi];
    for(var oi=0; oi<offs.length; oi++){
      for(var ii=0; ii<insets.length; ii++){
        var s = g.s, off = offs[oi], inset = insets[ii];
        var p = shoreIn(s+off, inset);
        if(!openAt(p[0],p[1])) continue;
        var ry = shoreRY(s+off);
        if(!claim(p[0],p[1], 9, 12, ry, 'prop')) continue;
        siltStriderStation(p[0], terrainH(p[0],p[1]), p[1], ry, null, {});
        PROPN.station = 1; PROPN.at.station = [p[0],p[1]];
        return;
      }
    }
  }
})();

/* ---- canoes: shallow water along the chinampa coast ---------------------
   chinHit() (55-chinampa.js) is read here to keep a canoe off an existing
   bed's footprint; CHINP.depthMin/depthMax bound what counts as shallow
   enough to paddle rather than open bay. */
reseed(68050);
(function placeCanoes(){
  var S0 = S_10 - 700, S1 = HARB_S0 - 200;
  var tries = 0;
  while(PROPN.canoes < 22 && tries < 2000){
    tries++;
    var s = rr(S0, S1);
    var off = -rr(20, 340);
    var p = shoreIn(s, off);
    var depth = -terrainH(p[0],p[1]);
    if(depth < CHINP.depthMin || depth > CHINP.depthMax*0.7) continue;
    if(chinHit(p[0],p[1], 6)) continue;
    if(inRiver(p[0],p[1], 20)) continue;
    var ry = rnd()*Math.PI*2;
    canoe(p[0], SEA-0.15, p[1], ry, null, { sail: chance(0.15) });
    chinPut(p[0],p[1],6);
    PROPN.canoes++; PROPN.at.canoes.push([p[0],p[1]]);
  }
})();

/* ---- ferries: moored at a few harbour piers and the river ---------------- */
reseed(68060);
(function placeFerries(){
  [1,4,6].forEach(function(k){
    var p = PIERS[k]; if(!p) return;
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz); if(L<8) return;
    dx/=L; dz/=L;
    var t = 0.30, side = chance(0.5)?1:-1;
    var fx = p.x0+dx*L*t + (-dz)*side*(p.w*0.5+14), fz = p.z0+dz*L*t + (dx)*side*(p.w*0.5+14);
    var ry = Math.atan2(dx,dz);
    ferry(fx, SEA-0.2, fz, ry, null, { cargo: ri(1,3) });
    PROPN.ferries++; PROPN.at.ferries.push([fx,fz]);
  });
  if(RPIERS[0]){
    var rp = RPIERS[0];
    var ry2 = rp.ry + Math.PI/2;
    ferry(rp.bx-6, SEA-0.2, rp.bz-6, ry2, null, { cargo:2, mast:false });
    PROPN.ferries++; PROPN.at.ferries.push([rp.bx-6, rp.bz-6]);
  }
})();

window._props = PROPN;
