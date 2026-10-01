/* ============================== GRANARY / MILLS / BEETLE RANCH ==============
   Owner, verbatim: "make a granary building model but do not place. make
   wind and water mill models with working animation but do not place. make
   a beetle ranch model but do not place. screenshot all these to myshots
   when done." Four new model FUNCTIONS only — nothing below is called into
   the live build. Same contract as tavern()/houseOfHealing() above: a
   caller elsewhere places one by calling it directly with real world
   coordinates, then reserves the returned footprint via claim()/reserve().
   None of these self-claim. */

/* ------------------------------ GRANARY -------------------------------
   This world already has a canton literally named 'Granary' (30-layout.js)
   so this reads as real grain storage, not a generic barn: a raised floor
   on staddle-stone posts (keeps grain off the wet ground — real staddle-
   barn practice), a tall, almost windowless storage mass (a few high
   louvre vents instead of ordinary windows), a big hoist-served loading
   door under a jutting hoist beam + pulley, an external stair up to the
   raised floor's own entrance, and a steep pyramidal roof (fr6, a
   noticeably stronger taper than an ordinary hlaalu parapet or tavern hip).

   granary(x, y, z, ry, col, opt) — x,y,z is the ground-level centre (y the
   true ground reference, same convention as every builder in this file);
   ry is the entrance facing, local +x, world ry. col is the wall stone
   tone (falls back to pick(TONES)). opt may override w/d/staddleH/wallH/
   roofH/roofCol.

   Returns { x, z, ry, fx, fz, doorX, doorZ } — fx/fz are half-extents of a
   rectangle centred at (x,z) that safely contains the whole building
   (deck overhang included); doorX/doorZ is the ground-level threshold at
   the foot of the external stair, for a caller's pedestrian approach
   point.

   Existing (shape,family) buckets only: box|stone(default), box|wood,
   cyl|stone(default), cyl|wood, cyl|metal, fr6|roof — all already live
   elsewhere in this file. Zero new draw calls. */
reseed(659001);   /* unique fragment seed for this new section, per the brief. */

function granary(x, y, z, ry, col, opt){
  opt = opt || {};
  var granW = opt.w || 13, granD = opt.d || 10.5;
  var staddleH = opt.staddleH || 2.6, wallH = opt.wallH || 10.5, roofH = opt.roofH || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.10);
  var ventCol = shade(TRUNKC[0], -0.35);

  /* --- staddle stones: a grid of short mushroom-capped posts holding the
     floor clear of the ground (post + a wider flat cap disc). ---------- */
  var nPx = 4, nPz = 3, postR = 0.42, postH = staddleH*0.74, capH = staddleH*0.22;
  for(var pi=0; pi<nPx; pi++){
    for(var pj=0; pj<nPz; pj++){
      var plx = (pi/(nPx-1)-0.5) * (granW*0.78);
      var plz = (pj/(nPz-1)-0.5) * (granD*0.72);
      var pp = loc(x,z, plx, plz, ry);
      CYL(pp[0], y, pp[1], postR, postH, 0, shade(wallCol,-0.10));
      CYL(pp[0], y+postH, pp[1], postR*2.0, capH, 0, shade(wallCol,-0.02));
    }
  }

  /* --- raised floor deck: overhangs the walls slightly all round (also
     sheds rain clear of the staddles). ---------------------------------- */
  var yDeck = y + staddleH;
  BOX(x, yDeck, z, granW, 0.7, granD, ry, woodCol, 'wood');
  var y2 = yDeck + 0.7;

  /* --- storage mass: tall, almost windowless. ------------------------- */
  BOX(x, y2, z, granW*0.92, wallH, granD*0.92, ry, wallCol);
  BOX(x, y2+wallH-0.6, z, granW*0.96, 1.1, granD*0.96, ry, shade(wallCol,-0.14));   // cornice

  /* --- high louvre vents, both long faces and both gables — never a real
     window, just slatted airflow slits near the top of the mass. ------- */
  [ {lx: granW*0.46+0.05}, {lx:-granW*0.46-0.05} ].forEach(function(f){
    for(var vi=0; vi<3; vi++){
      var vt = (vi-1)*(granD*0.26);
      var vp = loc(x,z, f.lx, vt, ry);
      BOX(vp[0], y2+wallH*0.74, vp[1], 0.30, 1.5, 1.1, ry, ventCol, 'wood');
    }
  });
  [ {lz: granD*0.46+0.05}, {lz:-granD*0.46-0.05} ].forEach(function(f){
    for(var vi2=0; vi2<2; vi2++){
      var vt2 = (vi2-0.5)*(granW*0.32);
      var vp2 = loc(x,z, vt2, f.lz, ry);
      BOX(vp2[0], y2+wallH*0.74, vp2[1], 1.1, 1.5, 0.30, ry, ventCol, 'wood');
    }
  });

  /* --- steep pyramidal roof — strong taper (fr6). --------------------- */
  var eaveY = y2+wallH;
  FR6(x, eaveY, z, granW*1.02, roofH, granD*1.02, ry, roofCol, 'roof');

  /* --- upper hoist door + jutting hoist beam: the clearest "granary"
     signal after the staddle stones — sacks are hauled straight up into
     the loft rather than carried through the ground-level door. ------- */
  var hoistY = y2 + wallH*0.62, doorH = 3.2;
  var hoistDp = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(hoistDp[0], hoistY, hoistDp[1], 0.5, doorH, 2.0, ry, shade(woodCol,-0.15), 'wood');
  var beamLen = 3.4, beamY = hoistY + doorH + 1.0;
  var beamP = loc(x,z, granW*0.46+beamLen*0.5, 0, ry);
  BOX(beamP[0], beamY, beamP[1], beamLen, 0.45, 0.45, ry, woodCol, 'wood');
  var pulleyP = loc(x,z, granW*0.46+beamLen-0.3, 0, ry);
  CYL(pulleyP[0], beamY-0.9, pulleyP[1], 0.22, 0.5, 0, shade(ventCol,0.15), 'metal');
  CYL(pulleyP[0], y2, pulleyP[1], 0.05, (beamY-0.9)-y2, 0, shade(ventCol,0.25), 'metal');   // rope down to loading level

  /* --- main entrance at deck level, reached by an external stair along
     the +z flank (same stacked-box idiom tavern()'s own stair uses). --- */
  var doorP = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(doorP[0], yDeck, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var stairSteps = 6, stairX0 = granW*0.02, stairX1 = granW*0.40;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, staddleH*st);
    var sz = granD*0.5 + 0.65 + 0.15;
    var sp = loc(x,z, sx, sz, ry);
    BOX(sp[0], y, sp[1], (stairX1-stairX0)/stairSteps*1.3, stepH, 1.3, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorThreshold = loc(x,z, stairX1+1.0, granD*0.5+1.3, ry);

  return {
    x:x, z:z, ry:ry,
    fx: granW*0.5+1.0, fz: granD*0.5+2.2,
    doorX: doorThreshold[0], doorZ: doorThreshold[1]
  };
}

/* ============================== MILL ANIMATION RIG ==========================
   windmill()/watermill() (below) are DEFINED but NOT PLACED this pass. A
   future caller places one by calling windmill(x,y,z,ry,col,opt) or
   watermill(x,y,z,ry,col,opt) with real world coordinates — each call
   internally registers its own moving parts (sail blades / wheel paddles)
   into MILL_CLUSTERS via registerMillCluster(), below, which just marks
   this rig dirty. This file's own self-contained requestAnimationFrame
   loop (millLoop, bottom of this section — the same independent "own
   clock, own tick()" idiom 84-fauna.js's faunaLoop and 82-daynight.js's
   dayNightLoop already use, since this file may not touch either of
   those) notices the dirty flag and (re)builds ONE shared InstancedMesh
   sized to the exact current blade/paddle count. Consequences:
     - right now, nothing has ever called windmill()/watermill(), so
       MILL_CLUSTERS stays empty forever -> the mesh is never created ->
       zero added draw calls, zero added instances, zero added triangles
       (checked live — see the report for this pass).
     - a future caller placing even one windmill or watermill, from ANY
       fragment (this is one shared global scope), causes the very next
       animation frame to build the mesh and start it spinning — no other
       file needs editing, and nothing needs to run in a specific order.

   One shared unit-bar geometry (pivot at the base, tip at local y=1 —
   the exact same "long thin box hung/rotated from one fixed edge" trick
   82-daynight.js's own guild-clock hands use, right down to the
   setFromUnitVectors(localY, liveDirection) math) is reused for BOTH a
   sail blade (pivot at the hub, radiating out to the tip) and a water-
   wheel paddle (same pivot-to-tip radiating bar, just short and offset
   out near the rim instead of starting at the hub) — one InstancedMesh,
   one draw call total for every sail and every water wheel ever placed
   in the city, however many that turns out to be. Per-instance colour
   (setColorAt, the exact pattern emitBuckets() and 82-daynight's nlMesh
   already use) lets sails and paddles carry their own wood tone without
   a second mesh. */
var MILL_CLUSTERS = [];      // { x,y,z, ry(axis), n, len, w, t, spin, phase, innerR, col }
var MILL_BLADE_BASE = [];    // parallel to MILL_CLUSTERS: each cluster's first instance slot
var MILL_TOTAL = 0, MILL_DIRTY = false, MILL_T = 0;

/* registers one rotating cluster (a windmill's 4 sails, or a water
   wheel's ring of paddles) and marks the shared rig dirty so the next
   animation frame rebuilds millMesh to include it. x,y,z is the hub/axle
   centre; axisRy is the facing whose "wall normal" convention (cos ry,0,
   -sin ry) IS the true rotation axis (see updateMills()'s own comment for
   the derivation) — for a windmill that's the sail hub's own ry, for a
   water wheel it's the flank wall's ry+90deg. n is blade/paddle count,
   len/w/t its scale (radial length, and the two cross-section
   dimensions), spin is radians/sec, innerR offsets the bar's start point
   out from the hub (0 for sails radiating from the hub itself; a
   fraction of the wheel radius for paddles that only occupy the rim). */
function registerMillCluster(x, y, z, axisRy, n, len, w, t, spin, innerR, col){
  MILL_CLUSTERS.push({ x:x, y:y, z:z, ry:axisRy, n:n, len:len, w:w, t:t,
                        spin:spin, phase:rr(0, Math.PI*2), innerR:innerR||0,
                        col: col || 0xffffff });
  MILL_DIRTY = true;
}

var millBarGeo = new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);   // pivot at base, tip at local y=1
var millMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
var millMesh = null;

function millRebuild(){
  if(millMesh) scene.remove(millMesh);   // millBarGeo/millMat are shared — never disposed here
  MILL_TOTAL = 0; MILL_BLADE_BASE = [];
  MILL_CLUSTERS.forEach(function(c){ MILL_BLADE_BASE.push(MILL_TOTAL); MILL_TOTAL += c.n; });
  MILL_DIRTY = false;
  if(MILL_TOTAL === 0){ millMesh = null; return; }
  millMesh = new THREE.InstancedMesh(millBarGeo, millMat, MILL_TOTAL);
  millMesh.userData.inspectLabel = 'Mill rotor';
  millMesh.frustumCulled = false;
  scene.add(millMesh);
}

var _milM = new THREE.Matrix4(), _milQ = new THREE.Quaternion(), _milS = new THREE.Vector3(1,1,1);
var _milP = new THREE.Vector3(), _milUp = new THREE.Vector3(0,1,0), _milTangent = new THREE.Vector3();
var _milDir = new THREE.Vector3(), _milCol = new THREE.Color();
function updateMills(dt){
  MILL_T += dt;
  if(MILL_DIRTY) millRebuild();
  if(!millMesh) return;   // dormant/no-op: nothing has ever registered
  MILL_CLUSTERS.forEach(function(c, ci){
    var base = MILL_BLADE_BASE[ci];
    /* "along the wall" tangent for ry — loc()'s own convention, the same
       derivation 82-daynight's updateGuildClock() uses for its hands; the
       rotation plane (up, tangent) is exactly perpendicular to the wall's
       own outward normal (cos ry,0,-sin ry), which is what makes that
       normal the real physical rotation axis here too. */
    _milTangent.set(Math.sin(c.ry), 0, Math.cos(c.ry));
    _milCol.set(c.col);
    for(var i=0;i<c.n;i++){
      var theta = c.phase + MILL_T*c.spin + i*(Math.PI*2/c.n);
      _milDir.copy(_milUp).multiplyScalar(Math.cos(theta)).addScaledVector(_milTangent, Math.sin(theta));
      _milQ.setFromUnitVectors(_milUp, _milDir);
      _milP.set(c.x + _milDir.x*c.innerR, c.y + _milDir.y*c.innerR, c.z + _milDir.z*c.innerR);
      _milS.set(c.w, c.len, c.t);
      _milM.compose(_milP, _milQ, _milS);
      millMesh.setMatrixAt(base+i, _milM);
      millMesh.setColorAt(base+i, _milCol);
    }
  });
  millMesh.instanceMatrix.needsUpdate = true;
  if(millMesh.instanceColor) millMesh.instanceColor.needsUpdate = true;
}

/* this file's own tiny render loop — same shape as 84-fauna.js's
   faunaLoop/82-daynight.js's dayNightLoop (own performance.now() delta,
   own requestAnimationFrame chain) — genuinely free to run every frame
   while MILL_CLUSTERS is empty: updateMills() returns immediately after
   the dt accumulation, no THREE work happens. */
(function millLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateMills(dt);
  }
  requestAnimationFrame(tick);
})();

window._mills = { clusters: function(){ return MILL_CLUSTERS.length; },
                   instances: function(){ return MILL_TOTAL; },
                   built: function(){ return !!millMesh; } };

/* ------------------------------ WINDMILL -------------------------------
   windmill(x, y, z, ry, col, opt) — x,y,z is ground level at the tower's
   own centre; ry is the entrance/sail facing, local +x, world ry. col is
   the tower stone tone (falls back to pick(TONES)). opt may override
   r/h/spin.

   Returns { x, z, ry, fx, fz, doorX, doorZ }.

   A future caller "turns on" the animation simply by calling this
   function with real coordinates — the sail hub it builds registers
   itself into MILL_CLUSTERS internally (see registerMillCluster() call
   below); nothing else is required.

   Existing (shape,family) buckets only for the static tower/cap/door/
   windows: cyl|stone(default), cyl|wood, box|wood, cone|roof, plus
   monasteryWindow's own box/dome — all already live elsewhere in this
   file. The 4 sails themselves are NOT built here at all — they are
   100% the shared animated rig above. Zero new static draw calls; the
   ONE animated draw call is shared with watermill(), below. */
function windmill(x, y, z, ry, col, opt){
  opt = opt || {};
  var baseR = opt.r || 5.2, towerH = opt.h || 17;
  var wallCol = col || pick(TONES);
  var capCol = opt.capCol || shade(TRUNKC[0], -0.05);
  var woodCol = shade(TRUNKC[0], -0.05);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  /* --- tapered stone tower, stacked round segments narrowing toward the
     cap (the round counterpart of structure()'s own 'velothi' segmented-
     taper idiom, cyl instead of fr8 so it reads as a mill, not a spire). */
  var segN = 4, segH = towerH/segN, ySeg = y, rSeg = baseR;
  for(var s=0; s<segN; s++){
    CYL(x, ySeg, z, rSeg, segH*1.03, ry, shade(wallCol, -0.04*s));
    ySeg += segH;
    CYL(x, ySeg-0.35, z, rSeg*1.06, 0.6, ry, shade(wallCol,-0.15));   // string-course ring
    rSeg *= 0.83;
  }
  var towerTopY = ySeg;

  /* --- cap: a squat cone, static — only the sails move. --------------- */
  var capR = rSeg*1.18, capH = capR*1.35;
  CONE(x, towerTopY, z, capR, capH, ry, capCol, 'roof');

  /* --- sail hub: a stub boss on the cap's front face. The 4 sail blades
     pivot here — registered into the shared animated rig, not built as
     static geometry. --------------------------------------------------- */
  var hubY = towerTopY + capH*0.38;
  var hubP = loc(x,z, capR*0.95, 0, ry);
  CYL(hubP[0], hubY-0.5, hubP[1], 0.55, 1.0, 0, shade(woodCol,-0.2), 'wood');

  var bladeLen = towerH*0.60, bladeW = bladeLen*0.15, bladeT = 0.22;
  registerMillCluster(hubP[0], hubY, hubP[1], ry, 4, bladeLen, bladeW, bladeT,
                       opt.spin || 0.55, 0, shade(woodCol, 0.10));

  /* --- door + a couple of storey windows up the tower ------------------ */
  var doorP = loc(x,z, baseR*0.98, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.7, ry, shade(woodCol,-0.15), 'wood');
  for(var wi=0; wi<2; wi++){
    var wy = y + towerH*(0.32+wi*0.28);
    var wr = baseR*(1-0.17*wi)*0.90;
    var wp = loc(x,z, wr, 0, ry);
    monasteryWindow(wp[0], wp[1], wy, ry, 1.1, 1.6, true, frameCol, paneCol);
  }

  return {
    x:x, z:z, ry:ry,
    fx: baseR+2, fz: baseR+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ------------------------------ WATERMILL -------------------------------
   watermill(x, y, z, ry, col, opt) — x,y,z is ground level at the mill
   building's own centre; ry is the entrance facing, local +x, world ry
   (same convention as every builder here). The water wheel is mounted on
   the local +z flank (world facing ry+90deg), the exact per-side loc()-
   relative convention houseOfHealing's own 4-sided loop, above, already
   uses. col is the wall stone tone (falls back to pick(TONES)). opt may
   override w/d/h/wheelR/wheelThick/spin.

   Returns { x, z, ry, fx, fz, doorX, doorZ }.

   Same activation contract as windmill(): calling this with real
   coordinates registers the wheel's paddles into the shared animated
   rig automatically — nothing else to wire up.

   Existing (shape,family) buckets only: box|stone (via structure()'s own
   'hlaalu' kind, reused outright rather than a parallel building shape),
   box|wood, cyl|wood, monasteryWindow's own box/dome. The paddles
   themselves are NOT built here — 100% the shared animated rig, the same
   one draw call windmill()'s sails share. */
function watermill(x, y, z, ry, col, opt){
  opt = opt || {};
  var millW = opt.w || 12, millD = opt.d || 9, wallH = opt.h || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.08);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  /* --- mill building: structure()'s own 'hlaalu' massing, reused
     outright rather than a parallel building shape. --------------------- */
  structure(x, y, z, millW, millD, wallH, ry, 'hlaalu', wallCol, { roof: roofCol });
  var doorP = loc(x,z, millW*0.5+0.05, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var winP = loc(x,z, 0, millD*0.5+0.05, ry);
  monasteryWindow(winP[0], winP[1], y+wallH*0.4, ry+Math.PI/2, 1.3, 2.0, true, frameCol, paneCol);

  /* --- the wheel flank: local +z side, its own outward facing is
     ry+90deg — everything below is built against THAT facing,
     loc()-relative, same convention as houseOfHealing's own per-side
     ry+f*90deg loop. ------------------------------------------------- */
  var wheelRy = ry + Math.PI/2;
  var wheelR = opt.wheelR || 4.0, wheelThick = opt.wheelThick || 1.8;
  var flankMid = loc(x,z, millD*0.5, 0, wheelRy);
  var hubOut = wheelR*0.85;   // stands proud of the wall so the disc reads as a true wheel, not a flush rosette
  var hubP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  var hubY = y + wheelR*0.80;   // most of the wheel dips low, toward the race (undershot)

  /* static axle + hub disks — the paddles themselves are 100% the shared
     animated rig, registered below. */
  CYL(hubP[0], hubY-wheelThick*0.5, hubP[1], 0.35, wheelThick, wheelRy, shade(woodCol,-0.2), 'wood');
  [-1,1].forEach(function(s){
    var dp = loc(hubP[0],hubP[1], s*wheelThick*0.5, 0, wheelRy);
    CYL(dp[0], hubY-0.9, dp[1], wheelR*0.22, 1.8, 0, shade(woodCol,-0.15), 'wood');
  });
  var postP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  BOX(postP[0], y, postP[1], 0.5, hubY-y, 0.5, wheelRy, shade(woodCol,-0.25), 'wood');

  /* the animated paddles: short radial slats occupying just the rim (n
     around the wheel), offset out from the hub by innerR — 100% of the
     moving geometry, see the MILL ANIMATION RIG above. */
  registerMillCluster(hubP[0], hubY, hubP[1], wheelRy, 10, wheelR*0.34, wheelThick*0.85, 0.28,
                       opt.spin || 0.42, wheelR*0.68, shade(woodCol, -0.10));

  /* --- mill race / sluice: a short stone-lined channel the wheel dips
     into, with a wooden sluice gate — "the suggestion of a mill race"
     per the brief, without a literal animated water plane. ------------ */
  var raceLen = wheelR*2.6, raceGap = wheelThick*1.8;
  [-1,1].forEach(function(s){
    var rp = loc(hubP[0], hubP[1], s*raceGap*0.5, 0, wheelRy);
    BOX(rp[0], y, rp[1], 0.4, 1.3, raceLen, wheelRy, shade(GREYC[0],-0.1));
  });
  var gateMid = loc(hubP[0], hubP[1], 0, raceLen*0.42, wheelRy);
  BOX(gateMid[0], y+0.2, gateMid[1], raceGap*0.85, 1.8, 0.3, wheelRy, shade(woodCol,-0.2), 'wood');

  return {
    x:x, z:z, ry:ry,
    fx: Math.max(millW*0.5, raceLen*0.5)+2,
    fz: millD*0.5 + hubOut + wheelR*1.15 + 1.5,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ============================== BEETLE RANCH ==============================
   "This is a Morrowind-flavoured Dunmer world; giant beetles are livestock
   here." No beetle/insect geometry exists anywhere else in src/ (grepped
   the whole tree for beetle/carapace/chitin/shell — nothing; the silt-
   strider creature itself is a separate, still-pending bespoke model per
   the coordinator's brief, out of scope here), so this is a new small
   creature builder, not a duplicate of anything. A fenced corral with a
   byre (structure()'s own 'hovel' kind, reused outright rather than a
   parallel shed shape), feed troughs, a loading chute facing the street,
   and a scatter of static giant beetles built from the kit. No animation
   here — only the two mills, above, need that, per the brief.

   beetleModel(x, y, z, ry, col, opt) — one giant beetle, standing, static
   pose; ry is which way it's facing (random per instance is fine — it
   isn't a building, faceStreet() doesn't apply). col overrides the shell
   tone (falls back to a dark trunk/leaf tone). opt.scale (default 1.0)
   jitters size; returns { x, z, ry, r } (r a rough footprint radius, for
   a caller doing its own fine-grained clearance rather than claim()).

   beetleRanch(x, y, z, ry, col, opt) — x,y,z the pen's own centre (ground
   reference), ry the chute/entrance facing (local +x, world ry, same
   convention as every builder here). opt may override w/d/beetleCount.

   Returns { x, z, ry, fx, fz, doorX, doorZ } — fx/fz half-extents of the
   whole fenced footprint; doorX/doorZ is the chute's street-facing
   threshold.

   Existing (shape,family) buckets only: box|wood, cyl|wood, box|stone/
   fr8|stone/cone|roof/dome|dome (via structure()'s own 'hovel' kind),
   dome|dome (beetle shells), cyl|trunk, box|trunk (beetle legs/
   antennae/carapace shading — 'trunk' is a FAMILY applied to ordinary
   box/cyl/dome shapes exactly like everywhere else in this file, not a
   new shape). Zero new draw calls. */
reseed(659201);   /* unique fragment seed for this new section, per the brief. */

function beetleModel(x, y, z, ry, col, opt){
  opt = opt || {};
  var scl = opt.scale || 1.0;
  var bodyLen = 4.6*scl, abdR = 1.5*scl, thoraxR = 1.0*scl, headR = 0.55*scl;
  var shellCol = col || shade(pick(chance(0.5) ? TRUNKC : LEAFC), -0.22);
  var legCol = shade(shellCol, -0.24);
  var legH = abdR*0.95;
  var baseY = y + legH;   // body sits up on its own legs

  var abdP  = loc(x,z, -bodyLen*0.30, 0, ry);
  var thxP  = loc(x,z,  bodyLen*0.06, 0, ry);
  var headP = loc(x,z,  bodyLen*0.40, 0, ry);

  DOME(abdP[0],  baseY, abdP[1],  abdR,     abdR*0.88,    ry, shellCol, 'dome');
  DOME(thxP[0],  baseY, thxP[1],  thoraxR,  thoraxR*0.94, ry, shade(shellCol,0.05), 'dome');
  DOME(headP[0], baseY+thoraxR*0.15, headP[1], headR, headR*0.86, ry, shade(shellCol,-0.05), 'dome');

  /* two thin antennae, centred a touch forward of the head so they read
     as sticking out rather than buried in it. The kit's BOX only yaws
     (see 45-kit.js), so these point forward-and-out rather than
     tilting up — a small, deliberate simplification, not worth a
     bespoke rig for a static prop (only the two mills spend that). */
  [-1,1].forEach(function(s){
    var antRy = ry - s*0.4;
    var ap = loc(headP[0], headP[1], headR*0.9, s*headR*0.35, antRy);
    BOX(ap[0], baseY+thoraxR*0.7, ap[1], headR*1.6, 0.09*scl, 0.09*scl, antRy, legCol, 'trunk');
  });

  /* 6 short legs, 3 pairs along the body, straight down to the ground —
     same "vertical stub" simplification this file's own tavernTable/
     benchPlain legs already use (the kit has no tilt to give them). */
  [ {lx:bodyLen*0.06, lr:thoraxR*0.85}, {lx:-bodyLen*0.20, lr:abdR*0.80}, {lx:-bodyLen*0.44, lr:abdR*0.55} ]
    .forEach(function(lp){
      [-1,1].forEach(function(s){
        var lpz = loc(x,z, lp.lx, s*lp.lr, ry);
        CYL(lpz[0], y, lpz[1], 0.16*scl, legH, 0, legCol, 'trunk');
      });
    });

  return { x:x, z:z, ry:ry, r: Math.max(abdR, bodyLen*0.5) };
}

function beetleRanch(x, y, z, ry, col, opt){
  opt = opt || {};
  var penW = opt.w || 26, penD = opt.d || 20;
  var fenceCol = shade(TRUNKC[0], -0.10);
  var fenceH = 1.7, postR = 0.16;
  var halfW = penW*0.5, halfD = penD*0.5;
  var chuteHalf = 2.6;

  /* --- perimeter post-and-rail fence: left/right + back full runs, a
     gapped front run flanking the loading chute (same two-segment-
     flanking-a-real-gap idiom houseOfHealing's own gated sides use). -- */
  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*halfD, ry);
    BOX(p[0], y+fenceH*0.55, p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
    BOX(p[0], y+fenceH*1.0,  p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
  });
  var backP = loc(x,z, -halfW, 0, ry);
  BOX(backP[0], y+fenceH*0.55, backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  BOX(backP[0], y+fenceH*1.0,  backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  var segLen = (penD-chuteHalf*2)*0.5;
  [-1,1].forEach(function(s){
    var segCenterZ = s*(chuteHalf+segLen*0.5);
    var fp = loc(x,z, halfW, segCenterZ, ry);
    BOX(fp[0], y+fenceH*0.55, fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
    BOX(fp[0], y+fenceH*1.0,  fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
  });

  /* fence posts: 4 corners, the two gate posts flanking the chute, and a
     few mid-span posts along the long left/right rails. */
  [[halfW,halfD],[halfW,-halfD],[-halfW,halfD],[-halfW,-halfD]].forEach(function(c){
    var cp = loc(x,z, c[0], c[1], ry);
    CYL(cp[0], y, cp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
  });
  [-1,1].forEach(function(s){
    var gp = loc(x,z, halfW, s*chuteHalf, ry);
    CYL(gp[0], y, gp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
    for(var pn=1; pn<4; pn++){
      var pt = (pn/4-0.5)*penW;
      var pp2 = loc(x,z, pt, s*halfD, ry);
      CYL(pp2[0], y, pp2[1], postR, fenceH, 0, fenceCol, 'wood');
    }
  });

  /* --- byre/shelter, back corner of the pen: structure()'s own 'hovel'
     kind, reused outright. ---------------------------------------------- */
  var byreW = Math.min(9, penW*0.34), byreD = Math.min(7, penD*0.55), byreH = 4.2;
  var byreP = loc(x,z, -halfW+byreW*0.5+0.6, 0, ry);
  structure(byreP[0], y, byreP[1], byreW, byreD, byreH, ry, 'hovel', shade(pick(TONES_POOR),-0.05), { roof: pick(ROOFS) });
  /* structure()'s 'hovel' emits walls and no openings at all, so this was
     the ONE defined-but-unplaced asset (granary's louvre vents are
     deliberately not windows; windmill/watermill/tavern/houseOfHealing all
     route through monasteryWindow) with no window emitter of its own — and
     therefore the one that would NOT have inherited the night-lit windows
     the moment someone finally places a beetle ranch. Routed through
     addWindows() so it does. Costs nothing today: beetleRanch() is never
     called, so this emits no instances until it is. */
  addWindows(byreP[0], y, byreP[1], ry, byreW, byreD, byreH, shade(pick(TONES_POOR),-0.05), 0.9);

  /* --- feed troughs along one long fence line. -------------------------- */
  var troughCol = shade(TRUNKC[0], -0.05);
  [-1,1].forEach(function(s){
    var tp = loc(x,z, halfW*0.15, s*(halfD-1.2), ry);
    BOX(tp[0], y, tp[1], penW*0.34, 0.5, 0.9, ry, troughCol, 'wood');
    BOX(tp[0], y+0.5, tp[1], penW*0.34*0.88, 0.25, 0.62, ry, shade(troughCol,-0.3), 'wood');
  });

  /* --- loading chute: a short ramp out through the front gate gap,
     flanked by rails, toward the street. --------------------------------- */
  var chuteLen = 5.5, chuteW = chuteHalf*1.7;
  var chuteMid = loc(x,z, halfW+chuteLen*0.5, 0, ry);
  BOX(chuteMid[0], y, chuteMid[1], chuteLen, 0.35, chuteW, ry, shade(troughCol,-0.1), 'wood');
  [-1,1].forEach(function(s){
    var rp = loc(x,z, halfW+chuteLen*0.5, s*chuteW*0.5, ry);
    BOX(rp[0], y+0.55, rp[1], chuteLen, 0.9, 0.14, ry, fenceCol, 'wood');
  });
  var doorP = loc(x,z, halfW+chuteLen, 0, ry);

  /* --- the beetles themselves, scattered inside the pen (kept clear of
     the byre corner). ----------------------------------------------------- */
  var beetleCount = opt.beetleCount || 5;
  for(var bi=0; bi<beetleCount; bi++){
    var bx = rr(-halfW*0.55, halfW*0.30), bz = rr(-halfD*0.65, halfD*0.65);
    var bp = loc(x,z, bx, bz, ry);
    beetleModel(bp[0], y, bp[1], rr(0, Math.PI*2), null, { scale: rr(0.85,1.15) });
  }

  return {
    x:x, z:z, ry:ry,
    fx: halfW+chuteLen+2, fz: halfD+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

