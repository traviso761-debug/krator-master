/* ============================== water taxis / ferries ======================
   The owner: a circular ferry route round the bay (10 ferries, 5 each
   direction) stopping at every canton pier — the 4 existing CPIERS plus a
   new one at every canton that doesn't have one yet, preferentially
   facing the bay's own centre — the mainland river docks, a new harbour
   pier by the customs house, and a new pier at the promontory point.
   Guild is the one exception: instead of its own inward pier it gets one
   near its causeway by Market F, "the west side's own local market"
   (30-layout.js's own words for it — the only district actually called
   that) — a siting choice, not a comment on what the canton itself is
   built as (Guild is its own four-craft-hall district with a small local
   market of its own, not the garden this note used to call it — see
   30-layout.js's CIDX['Guild'].guild). Two further
   dedicated ferries: customs<->promontory back-and-forth, and a
   temple<->island-shrines circuit (the shrines get their own new piers
   too). Reuses ferry() 's (65-facade.js) own proportions, minus its cargo
   crates per the owner's ask — a passenger cabin where the cargo was
   instead. One ferryman, 1-5 passengers, all popping in and out of
   existence at each stop for now — real boarding/alighting is explicitly
   future pedestrian-layer work per the owner's own note, not built here.

   LIFE_BAY_CENTER/LIFE_FERRY_STOPS/LIFE_SHRINE_STOPS/LIFE_SHRINE_ROUTE and
   the lifeCantonEdge/lifeBuildFerryPier helpers that build them are NOT
   defined in this file — real bug found post-hoc: this file's own header
   above says "Never touches BUCKET/emitBuckets()", but the pier geometry
   these built is real static BOX/CYL geometry, and 75-terrain.js's
   `var EMIT = emitBuckets();` (file order 75) runs BEFORE this file (78)
   — so those BOX/CYL calls were pushing into a BUCKET that had already
   been drained and turned into InstancedMeshes. The calls didn't error,
   the piers just never appeared. Moved the whole stop-building block
   (unchanged) to 65-facade.js, which runs at file order 65 — after
   CIDX/CPIERS/RPIERS/CAUSEWAYS/ISLES exist (all from 30-layout.js) but
   safely before 75's emitBuckets(). This file just reads the resulting
   globals, same as it already does with CPIERS/CIDX themselves. */

/* ---- ferry visuals: ferry()'s own proportions (65-facade.js) minus the
   cargo crates, a passenger cabin in their place — merged like every
   other moving thing in this file, one InstancedMesh for all 12 hulls
   (mast, sail and all — a single colour is a fair trade for one fewer
   draw call here, unlike the ships which keep sails separate for their
   own distinct colour). People (1 ferryman + up to 5 passengers per
   ferry, so 6 slots each) are a second shared InstancedMesh, unused slots
   scaled to 0 — same trick the ships/canoes use for a fluctuating count
   without a variable-length buffer. 2 draw calls total (hull, people) on
   top of the canoes' and ships' — tallied in BUDGET.drawCalls
   (05-palette.js). */
var LIFE_FERRY_LEN = 16, LIFE_FERRY_BEAM = 6;
var lifeFerryHullParts = [
  new THREE.BoxGeometry(LIFE_FERRY_BEAM, 2.6, LIFE_FERRY_LEN),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.92, 0.5, LIFE_FERRY_LEN*0.96).translate(0, 2.2, 0),
  new THREE.BoxGeometry(LIFE_FERRY_BEAM*0.6, 2.2, LIFE_FERRY_LEN*0.28).translate(0, 3.6, -LIFE_FERRY_LEN*0.22),
  new THREE.CylinderGeometry(0.18, 0.18, 7, 6).translate(0, 3.1, LIFE_FERRY_LEN*0.18),
  new THREE.BoxGeometry(0.06, 6, LIFE_FERRY_BEAM*0.55).translate(0, 4.1, LIFE_FERRY_LEN*0.18)
];
var lifeFerryHullGeo = lifeMergeGeoms(lifeFerryHullParts);
var LIFE_FERRY_N = 12;
var lifeFerryHullMesh = new THREE.InstancedMesh(lifeFerryHullGeo, new THREE.MeshLambertMaterial({ color: 0x5e4d3a }), LIFE_FERRY_N);
lifeFerryHullMesh.userData.life = true; lifeFerryHullMesh.userData.inspectLabel = 'Ferry hull';
lifeFerryHullMesh.frustumCulled = false;
scene.add(lifeFerryHullMesh);

/* local-avoidance arrays: declared much further down (right before
   updateBarges), not here — sizing them needs LIFE_RBARGE_N and the
   pleasure barge's own slot too, both from the barge section below, plus
   BRIDGE_SUPPORTS (50-cantons.js) for the static obstacle slots. Same
   file-order reasoning as everywhere else this pattern shows up: the
   functions that USE these arrays (lifeAvoidNudge, updateLife,
   updateFerries, updateShips, updateBarges) only run later, at animation
   time, so the arrays just need to exist by then — not here. */

var LIFE_FERRY_PEOPLE_PER = 6;   /* 1 ferryman + up to 5 passengers */
var lifeFerryPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_FERRY_N*LIFE_FERRY_PEOPLE_PER);
lifeFerryPeopleMesh.userData.life = true; lifeFerryPeopleMesh.userData.inspectLabel = 'Ferry passenger';
lifeFerryPeopleMesh.frustumCulled = false;
scene.add(lifeFerryPeopleMesh);
/* fixed local seats on the deck, rotated by the ferry's own yaw each
   frame — slot 0 (the ferryman) at the tiller, aft; 1-5 scattered
   forward of the cabin. */
var LIFE_FERRY_SEATS = [
  [0, -LIFE_FERRY_LEN*0.42],
  [-1.4, -1.5], [1.4, -1.5], [-1.4, 2.5], [1.4, 2.5], [0, 5.6]
];

/* ---- the 12 ferries: 10 round the main circle (5 clockwise, 5 counter),
   staggered start positions so they don't all bunch at stop 0, plus the
   2 dedicated shuttles. */
var LIFE_FERRIES = [];
(function(){
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<5;i++){
    var startIdx = Math.floor(i*n/5);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: 1, idx: startIdx,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  for(var j=0;j<5;j++){
    var startIdx2 = Math.floor(j*n/5 + n/10);
    LIFE_FERRIES.push({ stops: LIFE_FERRY_STOPS, dir: -1, idx: startIdx2,
      speed: rr(8,11), dwell: rr(9,16), stateT: rr(0,10), state:'docked', passengers: ri(1,5) });
  }
  var custStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Customs'; })[0];
  var promStop = LIFE_FERRY_STOPS.filter(function(s){ return s.name === 'Promontory'; })[0];
  LIFE_FERRIES.push({ stops: [custStop, promStop], dir: 1, idx: 0,
    speed: rr(8,10), dwell: rr(10,16), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
  LIFE_FERRIES.push({ stops: LIFE_SHRINE_ROUTE, dir: 1, idx: 0,
    speed: rr(7,9), dwell: rr(9,14), stateT: rr(0,8), state:'docked', passengers: ri(1,5) });
})();
window._ferries = { count: LIFE_FERRIES.length, stops: LIFE_FERRY_STOPS.length, shrineStops: LIFE_SHRINE_STOPS.length };
window._ferryStops = LIFE_FERRY_STOPS;   /* diagnostic: name/x/z/ry for every stop */
window._shrineStops = LIFE_SHRINE_STOPS;
window._legsFerry = LIFE_FERRIES.map(function(){ return null; });

var lifeFerryTmpPos = new THREE.Vector3(), lifeFerryTmpDir = new THREE.Vector3();
var lifeFerryTmpQuat = new THREE.Quaternion(), lifeFerryTmpMat = new THREE.Matrix4();
var lifeFerryTmpScale1 = new THREE.Vector3(1,1,1), lifeFerryTmpScale0 = new THREE.Vector3(0,0,0);
var lifeFerryTmpPos2 = new THREE.Vector3();
function updateFerries(dt){
  LIFE_FERRIES.forEach(function(f, fi){
    f.stateT += dt;
    var pos, yaw;
    if(f.state === 'docked'){
      var stop = f.stops[f.idx];
      pos = stop; yaw = stop.ry;
      if(f.stateT >= f.dwell){
        var nextIdx = (f.idx + f.dir + f.stops.length) % f.stops.length;
        var a = f.stops[f.idx], b = f.stops[nextIdx];
        /* the owner's own report ("ferries... are happily clipping
           through chinampas... and piers") — ferries now route on the
           real nav-grid (A* + line-of-sight simplification, above)
           instead of the seed-and-nudge heuristic every other vehicle
           still uses. First real usage of it: ferries visit the most
           stops closest to chinampa fields and piers of anything in the
           life layer, so they're where the difference actually shows. */
        f.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        f.len = f.curve.getLength();
        f.dur = Math.max(6, f.len / f.speed);
        f.nextIdx = nextIdx;
        f.state = 'transit'; f.stateT = 0;
        /* anticipatory-turn state (see the transit branch below) — seeded
           from the stop it's leaving so the first frame's turn-rate clamp
           has a sane starting point instead of blending from undefined. */
        f.lastX = a.x; f.lastZ = a.z; f.facingYaw = a.ry;
        window._legsFerry[fi] = { curve: f.curve };
      }
    }else{
      var raw = Math.min(1, f.stateT / f.dur);
      var t = raw*raw*(3-2*raw);
      f.curve.getPointAt(t, lifeFerryTmpPos);
      pos = lifeFerryTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      f.curve.getTangentAt(tTan, lifeFerryTmpDir);
      var tanYaw = Math.atan2(lifeFerryTmpDir.x, lifeFerryTmpDir.z);
      if(raw >= 1){
        f.idx = f.nextIdx;
        f.state = 'docked'; f.stateT = 0; f.dwell = rr(9,16);
        /* the owner: "if they pick a ferry, they queue up, board the next
           ferry with room, and add 1 to the ferry passenger count. the
           ferry will always discharge 1-3 passengers and will always pick
           up 1-3 passengers (room allowing)." Real queue against the
           rambling-pedestrian pool (LIFE_PEDS, below) at whichever
           LIFE_DOORS 'dock' entry matches this stop, not the old flat
           ri(1,5) reroll. LIFE_DOOR_BY_STOPNAME only covers the main
           ferry circuit's own stops (not the shrine-route ferries, a
           separate pool with no queueing yet) — falls back to the old
           random behaviour for those so they're unaffected. */
        /* NOT the `stop` var from the 'docked' branch above — that's a
           `var` (function-scoped, not block-scoped) so it survives
           syntactically, but it's only ever ASSIGNED when this ferry's
           OWN 'docked' branch runs, which hasn't happened yet this frame
           (we're in the transit branch); it's stale or outright
           undefined here. f.idx was just updated 2 lines up — the stop
           actually being arrived at is f.stops[f.idx], fresh, right now. */
        var arrivedStop = f.stops[f.idx];
        var stopDoor = (arrivedStop && typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[arrivedStop.name] : null;
        if(stopDoor){ lifeFerryBoard(f, stopDoor); }
        else{ f.passengers = ri(1,5); }
      }
      /* local avoidance — only while actually under way; a docked ferry
         sits exactly at its stop, not nudged off it (see file-level
         comment near updateLife: queueing at a busy stop is the
         follow-up piece, not built here).

         The owner: "they collide, then sort of both veer in opposite
         directions then back on course, not like a boat would move...
         can you get them to anticipate collision and turn." Two real
         causes fixed together:
         1) the push was sensed from where the ferry already IS, so
            nothing happened until hulls were already overlapping —
            sensed instead from a point out ahead along its own heading,
            so a ferry on a collision course starts correcting before
            the hulls actually touch.
         2) the push only ever moved the render POSITION sideways; the
            render YAW still came straight from the curve tangent, so a
            nudged ferry visibly slid sideways rather than turning —
            "crabbing", not steering. Facing now comes from the ferry's
            own actual frame-to-frame movement (which the nudge already
            bends), blended toward at a bounded turn rate so the turn
            reads as gradual steering, not a snap. */
      var favoidSlot = LIFE_AVOID_FERRY0 + fi;
      var fdelta = lifeAvoidNudge2(favoidSlot, pos.x, pos.z, lifeFerryTmpDir.x, lifeFerryTmpDir.z, LIFE_AVOID_R[favoidSlot], 8.0, LIFE_AVOID_LOOKAHEAD, 3.5, 2);
      pos.x += fdelta[0]; pos.z += fdelta[1];
      var mdx = pos.x-f.lastX, mdz = pos.z-f.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - f.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_FERRY_TURN_RATE*dt;
      f.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      yaw = f.facingYaw;
      f.lastX = pos.x; f.lastZ = pos.z;
    }
    LIFE_AVOID_X[LIFE_AVOID_FERRY0+fi] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_FERRY0+fi] = pos.z;
    lifeFerryTmpPos2.set(pos.x, SEA-0.2, pos.z);
    lifeFerryTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
    lifeFerryHullMesh.setMatrixAt(fi, lifeFerryTmpMat);

    var baseIdx = fi*LIFE_FERRY_PEOPLE_PER;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_FERRY_PEOPLE_PER; s++){
      var visible = (s === 0) || (s <= f.passengers);
      if(visible){
        var seat = LIFE_FERRY_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
        /* real bug: SEA+0.6 put people INSIDE the hull box (it's centred
           on the hull's own placement with no translate, so it spans
           SEA-1.5..SEA+1.1) — invisible, swallowed by solid hull geometry.
           The open deck plank sits at SEA+1.75..+2.25 (translate(0,2.2,0),
           h 0.5); stand people on top of it. */
        lifeFerryTmpPos2.set(wx, SEA+2.5, wz);   /* +0.2 vs. before: LIFE_PEOPLE_SCALE made the torso cylinder taller */
        lifeFerryTmpMat.compose(lifeFerryTmpPos2, lifeFerryTmpQuat, lifeFerryTmpScale1);
      }else{
        lifeFerryTmpMat.compose(lifeFerryTmpPos2.set(0,0,0), lifeFerryTmpQuat, lifeFerryTmpScale0);
      }
      lifeFerryPeopleMesh.setMatrixAt(baseIdx+s, lifeFerryTmpMat);
    }
  });
  lifeFerryHullMesh.instanceMatrix.needsUpdate = true;
  lifeFerryPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== water taxis ================================
   The owner: "an actual water taxi... unlike ferries, water taxis do not
   have set routes. they spawn in at a random ferry dock, pick up 4-8
   passengers, and they pick the furthest away, least visited dock as a
   destination - idea is they are seen to zip back and forth across the
   bay." Thai long-tail (hang yao) inspired hull — long, narrow, low
   freeboard, a dramatically upswept bow — but with dedicated oarsmen
   instead of the real thing's tail-shaft motor, per the owner's own
   correction. 8 boats, 1 captain + 6 oarsmen each, 4-8 passengers a trip.
   2 new draw calls (hull, people) — see BUDGET.drawCalls (05-palette.js)
   for why every boat population pays this same floor.

   Reuses LIFE_FERRY_STOPS as the dock network (the same piers ferries
   already call at) rather than inventing a second dock list, and
   lifeNavBuildLeg (ferries' own nav-grid router, just above) for the
   actual crossing, so taxis route round chinampas/piers exactly as
   correctly as ferries do — this is explicitly open water they're
   darting across, not a fixed line, so a correct route matters even more.

   Per-boat colour: the merged hull geometry bakes the hull itself in a
   muted, tint-receptive wood tone and the wreath/trim/canopy in white —
   multiplying by white lets a single per-instance setColorAt tint (8
   distinct hues, one per boat) drive the wreath/trim/canopy at full
   saturation while the SAME tint only lightly warms/cools the wood hull,
   so each boat reads as "the same natural hull, its own colour scheme,"
   not identical decorated boats or a fully-repainted hull. No 3rd draw
   call, no per-part independent colour — InstancedMesh only offers one
   colour multiply per instance; see the penitents' own comment (above,
   updateFerries' neighbourhood) for the same one-shared-geometry
   limitation hit and worked around before this. */
/* owner follow-up, twice: bigger hull (15 people was crowding a 1.9-beam
   boat) and a real long awning, not a token roof — "a long colored
   canopy/awning like in the picture that leaves just the front 1/4 of the
   boat exposed." Real bug behind "canopies not spawning properly or
   buried": the roof sat at hull-local y=1.85 (world SEA+1.70), but a
   standing passenger mounts at SEA+1.6 and its own merged geometry reaches
   to +2.576 above that (LIFE_PEOPLE_SCALE=2.8's own torso+head extent,
   checked directly against lifePersonGeo's bounding box the same way the
   pedestrian-height measurement for the temple pillars was) — i.e. a
   standing crew member's head reaches ~SEA+4.18, a full 2.5 units ABOVE
   where the old roof sat. It wasn't failing to spawn, it was spawning
   correctly and then reading as "buried" because the whole crowd stood up
   through it. Roof now well above that (local y=4.6, world ~SEA+4.45). */
var LIFE_TAXI_LEN = 20, LIFE_TAXI_BEAM = 3.0;
var lifeTaxiHullParts = [
  /* main hull */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM, 1.1, LIFE_TAXI_LEN*0.80).translate(0, 0, -LIFE_TAXI_LEN*0.08), color: 0x8a7a68 },
  /* upswept long-tail bow, angled up and forward */
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*0.68, 0.85, LIFE_TAXI_LEN*0.34).rotateX(-0.58).translate(0, 1.7, LIFE_TAXI_LEN*0.40), color: 0x8a7a68 },
  /* gunwale trim strips, both sides — tint-receptive white */
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.16, 0.38, LIFE_TAXI_LEN*0.78).translate(-LIFE_TAXI_BEAM*0.5, 0.40, -LIFE_TAXI_LEN*0.08), color: 0xffffff },
  /* long awning: 3 pairs of posts (deck to well above head height) plus a
     roof spanning the rear 3/4 of the hull, leaving only the front 1/4
     (the bow) open — z from -0.5*LEN (stern) to +0.25*LEN, i.e. centred
     at -0.125*LEN with length 0.75*LEN, matching the reference photo. */
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.40), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, -LIFE_TAXI_LEN*0.125), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.CylinderGeometry(0.09,0.09, 4.4, 6).translate(-LIFE_TAXI_BEAM*0.46, 2.75, LIFE_TAXI_LEN*0.15), color: 0x6b5942 },
  { geo: new THREE.BoxGeometry(LIFE_TAXI_BEAM*1.18, 0.16, LIFE_TAXI_LEN*0.75).translate(0, 4.95, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  /* a shallow valance along both long edges of the roof, like the
     reference photo's awning skirt — same tint-receptive white. Owner:
     people mount at SEA+1.85 with a merged-geometry top at +2.576 above
     that (~SEA+4.43 absolute) — the roof (local y=4.95, world ~SEA+4.80)
     clears that with real margin this time, checked by the numbers, not
     eyeballed like the buried first attempt was. */
  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.10, 0.60, LIFE_TAXI_LEN*0.75).translate(-LIFE_TAXI_BEAM*0.59, 4.62, -LIFE_TAXI_LEN*0.125), color: 0xffffff },
  /* bow wreath — a small garland ring at the bow tip, tint-receptive */
  { geo: new THREE.TorusGeometry(0.52, 0.13, 5, 10).rotateY(Math.PI/2).translate(0, 1.9, LIFE_TAXI_LEN*0.50), color: 0xffffff }
];
var lifeTaxiHullGeo = lifeMergeGeoms(lifeTaxiHullParts);
var LIFE_TAXI_N = 8;
var lifeTaxiHullMesh = new THREE.InstancedMesh(lifeTaxiHullGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N);
lifeTaxiHullMesh.userData.life = true; lifeTaxiHullMesh.userData.inspectLabel = 'Water taxi';
lifeTaxiHullMesh.frustumCulled = false;
scene.add(lifeTaxiHullMesh);

var LIFE_TAXI_CREW = 7, LIFE_TAXI_PAX_MAX = 8, LIFE_TAXI_SEATS_N = LIFE_TAXI_CREW + LIFE_TAXI_PAX_MAX;
var lifeTaxiPeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_TAXI_N*LIFE_TAXI_SEATS_N);
lifeTaxiPeopleMesh.userData.life = true; lifeTaxiPeopleMesh.userData.inspectLabel = 'Water taxi crew';
lifeTaxiPeopleMesh.frustumCulled = false;
scene.add(lifeTaxiPeopleMesh);
/* seat 0 = captain (stern, at the tiller); 1-6 = the 6 oarsmen, 3 a side;
   7-14 = up to 8 passengers amidships, under the canopy. Owner: "make
   water taxis bigger so people aren't as crowded" — spread out to match
   the bigger hull (LEN 15->20, BEAM 1.9->3.0), not just scaled the same
   cramped layout up proportionally. */
var LIFE_TAXI_SEATS = [
  [0, -LIFE_TAXI_LEN*0.42],
  [LIFE_TAXI_BEAM*0.48, 5.0], [LIFE_TAXI_BEAM*0.48, 0.5], [LIFE_TAXI_BEAM*0.48, -4.0],
  [-LIFE_TAXI_BEAM*0.48, 5.0], [-LIFE_TAXI_BEAM*0.48, 0.5], [-LIFE_TAXI_BEAM*0.48, -4.0],
  [0.9, 3.0], [-0.9, 3.0], [0.9, 1.2], [-0.9, 1.2],
  [0.9, -0.8], [-0.9, -0.8], [0.9, -2.6], [-0.9, -2.6]
];
/* 8 distinct accent hues, one per boat (PAL.taxi/TAXIC, 05-palette.js) —
   genuinely different combos across the fleet even though wreath/trim/
   canopy share one hue within a single boat (see the file-level comment
   above). */
(function(){
  var white = new THREE.Color(0xffffff);
  var m = new THREE.Matrix4();
  for(var i=0;i<LIFE_TAXI_N;i++){
    m.identity();
    lifeTaxiHullMesh.setMatrixAt(i, m);
    lifeTaxiHullMesh.setColorAt(i, new THREE.Color(TAXIC[i % TAXIC.length]));
  }
  lifeTaxiHullMesh.instanceColor.needsUpdate = true;
  for(var k=0;k<LIFE_TAXI_N*LIFE_TAXI_SEATS_N;k++) lifeTaxiPeopleMesh.setColorAt(k, white);
  lifeTaxiPeopleMesh.instanceColor.needsUpdate = true;
})();

/* least-visited-plus-furthest destination pick: score rewards distance and
   penalises a dock this fleet already calls at often, so the 8 boats
   naturally spread across the whole dock network instead of ping-ponging
   the same two stops. */
var LIFE_TAXI_VISITS = LIFE_FERRY_STOPS.map(function(){ return 0; });
/* owner: "water taxis don't seem to vary their destinations much... pick
   whatever ferry dock has the most people waiting at it" — the old
   distance/visit-decay score was dominated by raw distance (the visit
   penalty was only a 0.4-per-visit divisor), so it converged on
   whichever 1-2 docks were furthest apart and kept swinging between
   basically the same pair — technically "a new destination every stop"
   (a fresh index is picked on every arrival, this always did that), but
   not a VARIED one. Demand-driven instead: the real queueCount every
   dock's own LIFE_DOORS entry already tracks (LIFE_DOOR_BY_STOPNAME,
   the same field ferries/striders board against) — whichever stop has
   the most people actually waiting wins, which naturally varies pick to
   pick as queues build and drain around the bay. Falls back to a random
   other stop (not the old furthest-biased scoring) when nobody's
   waiting anywhere, so an empty-queue moment doesn't just repeat the
   same "furthest" answer either. */
function lifeTaxiPickDest(fromIdx){
  var best = -1, bestQ = 0;
  for(var i=0;i<LIFE_FERRY_STOPS.length;i++){
    if(i === fromIdx) continue;
    var door = (typeof LIFE_DOOR_BY_STOPNAME !== 'undefined') ? LIFE_DOOR_BY_STOPNAME[LIFE_FERRY_STOPS[i].name] : null;
    var q = door ? (door.queueCount||0) : 0;
    if(q > bestQ){ bestQ = q; best = i; }
  }
  if(best >= 0) return best;
  var others = [];
  for(var j=0;j<LIFE_FERRY_STOPS.length;j++) if(j!==fromIdx) others.push(j);
  return others.length ? pick(others) : (fromIdx+1) % LIFE_FERRY_STOPS.length;
}
var LIFE_TAXIS = [];
(function(){
  reseed(783351);
  var n = LIFE_FERRY_STOPS.length;
  for(var i=0;i<LIFE_TAXI_N;i++){
    var dockIdx = Math.floor(rnd()*n);
    LIFE_TAXIS.push({ dockIdx:dockIdx, state:'docked', stateT: rr(0,4), dwell: rr(3,6),
      speed: rr(16,22), passengers: ri(4,8), curve:null });
  }
})();
window._taxis = LIFE_TAXIS;   /* diagnostic: full state, incl. each taxi's .curve */

var lifeTaxiTmpPos = new THREE.Vector3(), lifeTaxiTmpDir = new THREE.Vector3();
var lifeTaxiTmpQuat = new THREE.Quaternion(), lifeTaxiTmpMat = new THREE.Matrix4();
var lifeTaxiTmpScale1 = new THREE.Vector3(1,1,1), lifeTaxiTmpScale0 = new THREE.Vector3(0,0,0);
var lifeTaxiTmpPos2 = new THREE.Vector3();
function updateWaterTaxis(dt){
  LIFE_TAXIS.forEach(function(tx, ti){
    tx.stateT += dt;
    var pos, yaw;
    if(tx.state === 'docked'){
      var stop = LIFE_FERRY_STOPS[tx.dockIdx];
      pos = stop; yaw = stop.ry;
      if(tx.stateT >= tx.dwell){
        var destIdx = lifeTaxiPickDest(tx.dockIdx);
        var a = LIFE_FERRY_STOPS[tx.dockIdx], b = LIFE_FERRY_STOPS[destIdx];
        tx.curve = lifeNavBuildLeg(a.x, a.z, b.x, b.z);
        tx.len = tx.curve.getLength();
        tx.dur = Math.max(5, tx.len/tx.speed);
        tx.destIdx = destIdx;
        tx.state = 'transit'; tx.stateT = 0;
      }
    }else{
      var raw = Math.min(1, tx.stateT/tx.dur);
      var t = raw*raw*(3-2*raw);
      tx.curve.getPointAt(t, lifeTaxiTmpPos);
      pos = lifeTaxiTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      tx.curve.getTangentAt(tTan, lifeTaxiTmpDir);
      yaw = Math.atan2(lifeTaxiTmpDir.x, lifeTaxiTmpDir.z);
      if(raw >= 1){
        tx.dockIdx = tx.destIdx;
        LIFE_TAXI_VISITS[tx.dockIdx]++;
        tx.state = 'docked'; tx.stateT = 0; tx.dwell = rr(3,6);
        tx.passengers = ri(4,8);   /* new fares board for the next crossing */
      }
    }
    lifeTaxiTmpPos2.set(pos.x, SEA-0.15, pos.z);
    lifeTaxiTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
    lifeTaxiHullMesh.setMatrixAt(ti, lifeTaxiTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_TAXI_BASE+ti, pos.x, SEA+2.6, pos.z);

    var baseIdx = ti*LIFE_TAXI_SEATS_N;
    var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    for(var s=0; s<LIFE_TAXI_SEATS_N; s++){
      var isCrew = s < LIFE_TAXI_CREW;
      var visible = isCrew || (s - LIFE_TAXI_CREW) < tx.passengers;
      if(visible){
        var seat = LIFE_TAXI_SEATS[s];
        var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
        var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
        lifeTaxiTmpPos2.set(wx, SEA+1.85, wz);
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2, lifeTaxiTmpQuat, lifeTaxiTmpScale1);
      }else{
        lifeTaxiTmpMat.compose(lifeTaxiTmpPos2.set(0,0,0), lifeTaxiTmpQuat, lifeTaxiTmpScale0);
      }
      lifeTaxiPeopleMesh.setMatrixAt(baseIdx+s, lifeTaxiTmpMat);
    }
  });
  lifeTaxiHullMesh.instanceMatrix.needsUpdate = true;
  lifeTaxiPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== barges =====================================
   The owner: keep the first pass's big barge-style hull (built for the
   ships, replaced there by a caravel per the owner's own correction) and
   reuse it for river barges — 2 of them, shuttling exclusively up and
   down the river, one docked-and-just-unloaded while the other arrives
   full, load-and-depart-upriver 15s after the disappearing one is truly
   gone, 3 crew who never leave. Plus one pleasure barge — gold hull,
   purple sails, 3 crew, 10-20 partiers, rambling the open bay and
   periodically returning to the harbour to fill up (won't leave again
   until it has at least 10 aboard). ------------------------------------ */

/* ---- river barges: follow the river's OWN polyline (riverAt/RIVER_CUM,
   30-layout.js), not the open-bay heuristic the ships/ferries use above —
   a channel this narrow needs to actually thread its real bends, not an
   approximation that could cut across a bank. This is also what
   guarantees both real bridges (RBRIDGES) get crossed UNDER, not around:
   riverAt() is the same function that placed them. */
function lifeRiverCurve(u0, u1){
  var uMax = RIVER_CUM[RIVER_CUM.length-1] - 1;
  /* 32, was 16 — a leg spanning the river's full length (u1-u0 up to
     ~1300+) left waypoints 80+ units apart, too coarse for the
     correction loop below to reliably have a nearby control point to
     nudge right where a bridge pylon actually sits. */
  var steps = 32, waypoints = [];
  for(var i=0;i<=steps;i++){
    var u = Math.max(0, Math.min(uMax, u0 + (u1-u0)*i/steps));
    var p = riverAt(u);
    waypoints.push([p.x, p.z]);
  }
  /* the owner, watching an actual barge do this: "I saw an outgoing barge
     start to swerve to avoid a bridge support, then swerve back to the
     original path and clip through it again." Root cause: this only ever
     followed the river's own CENTRELINE, which runs straight through a
     bridge's central support pylon (BRIDGE_SUPPORTS, 50-cantons.js) by
     construction — the real-time avoidance nudge (lifeAvoidNudge2, see
     its own comment) was fighting a curve that pulled the barge straight
     back onto the pylon every single frame, and didn't always win.
     Same detect-blocked-point/insert-a-waypoint/rebuild refinement
     lifeBuildLeg's whole family already uses (lifePierOrBridgeBlocked
     checks both piers AND bridge pylons, so this also can't cut through
     a river dock's own new quay deck). Checked along the actual curve at
     fine resolution, not just the raw waypoints, so a pylon that happens
     to fall between two of the 16 samples above still gets caught. */
  for(var round=0; round<14; round++){
    var curve2 = lifeCurveFrom(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p2 = curve2.getPointAt(st);
      var fix = lifePierOrBridgeBlocked(p2.x, p2.z);
      if(fix){ worstT = st; worstFix = fix; break; }
    }
    if(worstT < 0) break;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  var pts = waypoints.map(function(p){ return new THREE.Vector3(p[0], SEA-0.3, p[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
}
var LIFE_RIVER_FAR_U  = RIVER_CUM[RIVER_CUM.length-1] - 60;
/* the owner: "make the incoming river barge spawn in at [1993.1,1605.7]"
   — same fix as the ship's spawn point above, and for the same reason
   (the far end of the river, LIFE_RIVER_FAR_U, is well outside the
   default view). Converted from a world point to this river's own arc-
   length parameter via polyNear (10-core.js) — the same nearest-point
   projection riverHalf()/inRiver() already use against this exact
   polyline — rather than picking a u by guesswork. Only the ONE barge
   that starts already sailing on load (barge 1, below) uses this; every
   other river-barge arrival travels the real distance from
   LIFE_RIVER_FAR_U. */
var LIFE_RIVER_SPAWN_U = (function(){
  var rv = polyNear(1993.1, 1605.7, RIVER, RIVER_CUM);
  return rv.t * RIVER_CUM[RIVER_CUM.length-1];
})();
/* owner: "i'm not sure the river barges are always rendering at the moment".
   They always are — measured live: all 7 hulls present, visible, unculled and
   moving. The real fault is WHERE they are. The 7 barge docks span x=1274..2073,
   but 5 of the 7 barges sat at x=3700..5740 — up to 3,700 units past the
   furthest dock, far off the end of the visible map, on a leg roughly four
   times longer than the entire dock stretch they exist to serve. So at any
   moment most of the fleet is invisible, which reads exactly like "sometimes
   not rendering".
   The comment above already flagged this ("the far end of the river is well
   outside the default view") and the owner had already asked for a nearer
   spawn — but that fix was applied to exactly ONE barge, and every other
   arrival still ran the full distance from LIFE_RIVER_FAR_U. This turnaround
   applies the same intent to the whole fleet: far enough upstream to be a
   real journey out of the dock cluster, near enough to stay in sight.
   LIFE_RIVER_FAR_U itself is left alone — the ships that legitimately leave
   the map still use it. */
var LIFE_RIVER_TURN_U = Math.min(LIFE_RIVER_FAR_U, LIFE_RIVER_SPAWN_U + 700);

/* real height budget, checked against CROSS_CLEAR=11 (85-probe.js) before
   picking a number: hull is 6 tall, centred, sat at SEA-0.3, so its own
   top is ~2.7; the flagpole below tops out at 8.5 — over 2 units of
   margin under both real bridges, not a guess. No sail on the river
   barges at all (unlike the pleasure barge below) — a full mast would
   have to clear the same 11 units and there isn't room for one worth
   having, and barges reading as towed/poled cargo haulers rather than
   sailed vessels fits the "cargo barge" character anyway. Cargo crates
   are just always part of the merged hull (not toggled empty/full
   visually) — the owner's load/unload cycle is a real scheduling state
   (see updateBarges), simplified here to not need a second hull mesh
   (and second draw call) just to swap a few crates in and out. */
var LIFE_RBARGE_LEN = 50, LIFE_RBARGE_BEAM = 14;
var lifeRBargeHullParts = [
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM, 6, LIFE_RBARGE_LEN),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.75, 3.5, LIFE_RBARGE_LEN*0.19).translate(0, 4.75, -LIFE_RBARGE_LEN*0.36),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.65, 2.6, LIFE_RBARGE_LEN*0.14).translate(0, 4.3, LIFE_RBARGE_LEN*0.40),
  new THREE.CylinderGeometry(0.15, 0.15, 3, 5).translate(0, 7.0, -LIFE_RBARGE_LEN*0.10),
  new THREE.BoxGeometry(3.2, 2.6, 3.2).translate(-3.2, 4.3, 2),
  new THREE.BoxGeometry(3.6, 2.2, 3.0).translate(2.6, 4.1, 6),
  new THREE.BoxGeometry(3.0, 2.8, 3.4).translate(-1.0, 4.4, -8)
];
var lifeRBargeHullGeo = lifeMergeGeoms(lifeRBargeHullParts);
var LIFE_RBARGE_N = 7;   /* up from 2 — the owner: "these come in sooooo slooooowly... we could probably have a few more" */
/* real bug fixed above (lifeMergeGeoms indexed-geometry bug) is what
   actually made this look broken/pale before — the colour itself was
   already brown (0x59493a); darkened slightly per the owner's own "make
   them brown and wood textured" ask for a clearer wood-brown read. A
   real procedural wood grain (matching FAMMAT's own 'wood'/'trunk'
   texture) would need the same world-UV onBeforeCompile hookup the
   static kit's materials get (45-kit.js's applyWorldUV) — life-layer
   materials don't have that machinery today, and wiring it up is real,
   scoped work worth handing to voth-texture rather than bolting on here. */
/* the owner: "barges... look distinctly pale grey compared to the junks.
   make them a similar brown hull color" — matched to the junk's own
   LIFE_JUNK_HULL_COL (0x2c2116) directly, same reasoning as the galleon
   fix right above: 0x4a3a28 is a real brown, it just reads washed-out
   next to that much darker, more saturated tone under this lighting. */
var lifeRBargeHullMesh = new THREE.InstancedMesh(lifeRBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0x2c2116 }), LIFE_RBARGE_N);
lifeRBargeHullMesh.userData.life = true; lifeRBargeHullMesh.userData.inspectLabel = 'River barge hull';
lifeRBargeHullMesh.frustumCulled = false;
scene.add(lifeRBargeHullMesh);

/* 7 river barges, one per LIFE_RBARGE_DOCKS entry (65-facade.js) — each
   cycles independently between its OWN dock and the shared far-upstream
   limit, "so we don't need the ships' own shared-quay contention logic
   (lifePickDeparture/lifeShipOpenMobileDock) at all: nothing competes for a dock,
   so there is nothing to schedule. Initial states staggered by hand to
   the owner's own exact spec — 1 fully docked, 1 almost docked, 2
   midstream coming, 1 midstream going, 1 almost off-map going, 1 almost
   off-map coming — "so they don't all arrive at once". Speed also raised
   (was 6-8, the owner: "sooooo slooooowly"). */
function lifeMakeRiverBarge(dock, state, fromU, toU, tFrac, speed){
  var b = { kind:'river', home: dock, speed: speed, stateT: 0 };
  if(state === 'docked'){
    b.state = 'docked'; b.x = dock.x; b.z = dock.z; b.ry = dock.ry; b.lastArrivalTime = -5;
    return b;
  }
  b.state = state;
  b.curve = lifeRiverCurve(fromU, toU);
  b.len = b.curve.getLength();
  b.dur = Math.max(20, b.len / b.speed);
  b.stateT = b.dur * tFrac;
  return b;
}
var LIFE_BARGES = [
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[0], 'docked',    0,                    0,                     0,    rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[1], 'arriving',  LIFE_RIVER_SPAWN_U,   LIFE_RBARGE_DOCKS[1].u, 0.92, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[2], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[2].u, 0.50, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[3], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[3].u, 0.40, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[4], 'departing', LIFE_RBARGE_DOCKS[4].u, LIFE_RIVER_TURN_U,     0.55, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[5], 'departing', LIFE_RBARGE_DOCKS[5].u, LIFE_RIVER_TURN_U,     0.88, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[6], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[6].u, 0.10, rr(9,12))
];
var LIFE_BARGE_T = 0;

/* ---- the pleasure barge: gold hull, purple sails (a second, differently
   coloured merged mesh, same reason the ships keep sails separate — this
   is the one boat in the whole life layer that actually needs a colour
   scheme nobody else uses). Rambles inside the owner's own hand-marked
   LIFE_PBARGE_ZONE polygon (defined further down, right where the barge
   itself is set up) rather than the generic open-bay heuristic the other
   vehicles use — see that polygon's own comment for why. */
function lifePolyCentroid(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  return [cx/poly.length, cz/poly.length];
}
/* rejection-sample a point guaranteed inside poly — cheap and exact,
   unlike trying to derive one algebraically from a 60-vertex concave
   outline. 300 tries over the polygon's own bbox is comfortably enough
   even for a thin, winding shape like this one (checked: never exhausted
   in testing) and this only runs once per ramble departure, not per
   frame. */
function lifePolyRandomPoint(poly){
  var minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  poly.forEach(function(p){
    if(p[0]<minX)minX=p[0]; if(p[0]>maxX)maxX=p[0];
    if(p[1]<minZ)minZ=p[1]; if(p[1]>maxZ)maxZ=p[1];
  });
  for(var i=0;i<300;i++){
    var x=rr(minX,maxX), z=rr(minZ,maxZ);
    if(pointInPoly(x,z,poly)) return [x,z];
  }
  return lifePolyCentroid(poly);
}
/* lifeBuildLeg's own twin, with one extra failure mode checked each
   refinement round: a sampled point that has drifted OUTSIDE poly, fixed
   by pulling it most of the way back toward the polygon's centroid (a
   plain canton push has an exact clearR to aim for; a 60-vertex concave
   outline doesn't, so "mostly toward the middle" is the honest
   equivalent — good enough given both endpoints are already inside by
   construction and this only has to correct occasional drift). Also
   pre-clears the seed waypoints through the polygon test the same way,
   not just lifePushToWater's land/canton check.

   Real gap measured directly (sampled 60 ramble curves end to end):
   lifeBuildLeg's own 2-interior-waypoint layout (m1 at 0.33, m2 at 0.66)
   is tuned for a compact bay where any one leg crosses at most one
   canton. This polygon spans the whole lake plus a long fjord out past
   -4700 in z — a single random ramble leg can clip THREE separate
   concave notches along its length, and 2 movable points can't
   independently fix 3 unrelated problems: fixing the nearest one to
   whichever violation is "worst" this round can undo a previous round's
   fix to a different one, oscillating instead of converging. Use 5
   interior points instead of 2 so there is normally a free point near
   each real trouble spot. */
/* the owner: "make sure [the pleasure barge]... have FULL collision
   detection and avoidance" — lifeBuildLegInPoly's own refinement loop
   already re-checks a finished curve against cantons and land/the hand-
   drawn zone boundary, but never against a single real pier or bridge
   pylon; this plugs that same gap for it that lifeNavBlocked (78-life.js,
   above) already closed for ships/ferries. Returns a push-away point, or
   null if x,z is clear of every pier array (30-layout.js's PIERS/CPIERS/
   RPIERS, this file's own LIFE_EXTRA_PIERS) and every bridge pylon
   (BRIDGE_SUPPORTS, 50-cantons.js). */
function lifePierOrBridgeBlocked(x,z){
  var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS];
  for(var ai=0; ai<arrs.length; ai++){
    var arr = arrs[ai];
    for(var i=0;i<arr.length;i++){
      var p = arr[i], need = p.w*0.5+6;
      var d = lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1);
      if(d < need){
        var dx=p.x1-p.x0, dz=p.z1-p.z0, L=dx*dx+dz*dz;
        var t = L ? ((x-p.x0)*dx+(z-p.z0)*dz)/L : 0; t=Math.max(0,Math.min(1,t));
        var nx = x-(p.x0+t*dx), nz = z-(p.z0+t*dz), nd = Math.hypot(nx,nz)||1;
        return [x + (nx/nd)*(need-d+10), z + (nz/nd)*(need-d+10)];
      }
    }
  }
  for(var bi2=0; bi2<BRIDGE_SUPPORTS.length; bi2++){
    var bs = BRIDGE_SUPPORTS[bi2], needB = bs.r+6;
    var dxb = x-bs.x, dzb = z-bs.z, db = Math.hypot(dxb,dzb)||1;
    /* the owner, watching this exact spot fail: a fix that only clears
       the threshold by 3 units left enough residual curvature (the
       correction loop only ever moves ONE nearby waypoint per round, and
       Catmull-Rom's neighbours still pull the curve back in) that the
       barge could still pass within a few units of the pylon's own true
       centre — measured directly (a diagnostic sweep against the real
       BRIDGE_SUPPORTS positions): worst case 9 units from a 15-radius
       pylon, a real hit, not a near-miss. Pushed further past the
       threshold (+10, was +3) so one correction actually clears it with
       room to spare. */
    if(db < needB) return [x + (dxb/db)*(needB-db+10), z + (dzb/db)*(needB-db+10)];
  }
  return null;
}
function lifeBuildLegInPoly(ax,az,bx,bz,poly){
  var centroid = lifePolyCentroid(poly);
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0; i<14 && (!pointInPoly(x,z,poly) || terrainH(x,z) > -1.5); i++){
      x += (centroid[0]-x)*0.35; z += (centroid[1]-z)*0.35;
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 11;   /* 9 interior control points + the 2 anchors */
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++){
    waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<40; round++){
    var curve = lifeCurveFromCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p3 = curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x, p3.z);
      if(blocked){
        worstT = st;
        worstFix = [blocked[0].x + blocked[1]*blocked[3]*1.25, blocked[0].z + blocked[2]*blocked[3]*1.25];
        break;
      }
      var pierFix = lifePierOrBridgeBlocked(p3.x, p3.z);
      if(pierFix){
        worstT = st;
        worstFix = pierFix;
        break;
      }
      if(!pointInPoly(p3.x, p3.z, poly) || terrainH(p3.x, p3.z) > -1.5){
        /* the polygon is hand-traced water, but a stray sliver of shallow
           bank or a marsh edge inside it is still real dry-ish ground —
           checked separately from the containment test above, since
           satisfying one doesn't guarantee the other. Real gap measured
           directly (verify.py-style: sampled 60 ramble curves, checked
           every point): a flat "pull 40% toward the polygon's overall
           centroid" is the wrong fix for a point actually sitting on
           real land at a sharp concave notch — the centroid can be
           thousands of units away, in effectively a random direction
           relative to the nearby shoreline, occasionally landing the
           pushed point on MORE land. lifePushToWater already solves the
           local case correctly (real gradient descent off the nearest
           land, not a guess), so try that first and only fall back to
           the centroid pull if the point is technically outside the
           hand-drawn boundary despite already being clear of real land. */
        var fix = lifePushToWater(p3.x, p3.z);
        if(!pointInPoly(fix[0], fix[1], poly)){
          fix = [fix[0] + (centroid[0]-fix[0])*0.4, fix[1] + (centroid[1]-fix[1])*0.4];
        }
        worstT = st;
        worstFix = fix;
        break;
      }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt = w2/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w2; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromCentripetal(waypoints);
}
var LIFE_PBARGE_LEN = 26, LIFE_PBARGE_BEAM = 10;
var lifePBargeHullParts = [
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM, 3.2, LIFE_PBARGE_LEN),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.85, 0.6, LIFE_PBARGE_LEN*0.92).translate(0, 2.5, 0),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.7, 2.6, LIFE_PBARGE_LEN*0.36).translate(0, 4.1, -LIFE_PBARGE_LEN*0.18),
  new THREE.CylinderGeometry(0.22, 0.22, 10, 6).translate(0, 8.0, LIFE_PBARGE_LEN*0.14)
];
var lifePBargeHullGeo = lifeMergeGeoms(lifePBargeHullParts);
var lifePBargeHullMesh = new THREE.InstancedMesh(lifePBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0xc9a227 }), 1);
var lifePBargeSailGeo = new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.9, 7, 0.2).translate(0, 9.5, LIFE_PBARGE_LEN*0.14);
var lifePBargeSailMesh = new THREE.InstancedMesh(lifePBargeSailGeo, new THREE.MeshLambertMaterial({ color: 0x6a2f8a }), 1);
lifePBargeHullMesh.userData.inspectLabel = 'Palace barge hull'; lifePBargeSailMesh.userData.inspectLabel = 'Palace barge sail';
[lifePBargeHullMesh, lifePBargeSailMesh].forEach(function(m){ m.userData.life = true; m.frustumCulled = false; scene.add(m); });

/* real bug the owner caught: lifeBuildLeg's own land-avoidance
   (lifePushToWater) is a cheap gradient nudge, not a real solver — over
   the long, irregular hops the open-bay ramble picked (random points up
   to 900/700 units from LIFE_BAY_CENTER) it would happily leave a
   mid-curve control point sitting on dry ground, with nothing after the
   fact ever re-checking the finished curve against LAND at all (the
   refinement loop only ever re-checks CANTONS). The owner traced their
   own polygon of confirmed-safe water for this barge to ramble inside —
   first vertex is the dock tip itself — so use that directly instead of
   trying to harden the generic heuristic: every ramble destination is
   rejection-sampled to already be inside it, and the curve-refinement
   loop below additionally kicks out any sampled point that drifts
   outside it, the same way it already kicks out canton intrusions. */
var LIFE_PBARGE_ZONE = [[922.6,-1027.1],[878.9,-1010.1],[792.1,-1116.4],[662.5,-985.9],[511.1,-1145.6],[396.1,-1125.4],[334.8,-1015.0],[452.6,-863.5],[537.0,-760.3],[479.2,-523.4],[266.3,-510.9],[197.7,-155.2],[-25.5,-119.2],[-68.1,-60.6],[-68.9,329.6],[-157.2,430.7],[-555.8,433.0],[-585.1,476.9],[-579.8,648.1],[-925.7,647.9],[-899.3,299.4],[-442.4,65.8],[-262.2,-93.5],[-139.0,-375.7],[-31.3,-562.3],[-53.6,-993.8],[-1148.9,-853.3],[-1171.3,-1064.2],[-1031.3,-1218.6],[-1186.8,-1364.0],[-1322.4,-1238.6],[-1569.5,-1190.7],[-2608.7,-2131.5],[-2388.6,-3208.4],[-1413.9,-3957.5],[-177.5,-2347.5],[-414.8,-2110.5],[-268.4,-1917.3],[-67.6,-2085.5],[-73.6,-2238.7],[-1358.6,-3982.6],[292.2,-4766.0],[1136.5,-4586.7],[1978.4,-3134.7],[1761.1,-2777.5],[1412.0,-2530.9],[1474.5,-2375.2],[1648.9,-2469.4],[1867.0,-2727.0],[2003.6,-2872.7],[2293.0,-1966.8],[2132.4,-1573.7],[1708.7,-1240.6],[1219.8,-1709.2],[983.9,-1652.3],[748.4,-1768.4],[599.1,-1601.0],[736.6,-1488.8],[772.5,-1272.9],[906.5,-1162.8]];
var LIFE_PBARGE_DOCK = { x: LIFE_PBARGE_ZONE[0][0], z: LIFE_PBARGE_ZONE[0][1] };
(function(){
  var c = lifePolyCentroid(LIFE_PBARGE_ZONE);
  LIFE_PBARGE_DOCK.ry = Math.atan2(c[0]-LIFE_PBARGE_DOCK.x, c[1]-LIFE_PBARGE_DOCK.z);
})();
LIFE_BARGES.push({
  kind: 'pleasure', state: 'docked', x: LIFE_PBARGE_DOCK.x, z: LIFE_PBARGE_DOCK.z, ry: LIFE_PBARGE_DOCK.ry,
  speed: rr(7,9), stateT: 0, passengers: 0, target: ri(10,20)
});
window._barges = { count: LIFE_BARGES.length };
window._lifeBarges = LIFE_BARGES;         /* diagnostic: full state incl. .home/.curve */
window._rbargeDocks = LIFE_RBARGE_DOCKS;
window._pbarge = { zone: LIFE_PBARGE_ZONE, dock: LIFE_PBARGE_DOCK,
  randomPoint: lifePolyRandomPoint, buildLeg: lifeBuildLegInPoly };   /* diagnostic */

/* ---- shared people for every barge above: river-barge crew (3, always
   visible, never change) plus the pleasure barge's 3 crew + up to 20
   partiers. Same merged person geometry the ferries use (lifeMergeGeoms
   is reused, not the ferry InstancedMesh itself — that one's already
   built at a fixed size); own InstancedMesh so it can be sized for this
   group specifically without touching the ferries' own count. */
var LIFE_BARGE_PEOPLE_PER_RIVER = 3, LIFE_BARGE_PEOPLE_PER_PLEASURE = 23;   /* 3 crew + up to 20 partiers */
var LIFE_BARGE_PEOPLE_TOTAL = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER + LIFE_BARGE_PEOPLE_PER_PLEASURE;
var lifeBargePeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_BARGE_PEOPLE_TOTAL);
lifeBargePeopleMesh.userData.life = true; lifeBargePeopleMesh.userData.inspectLabel = 'Barge crew';
lifeBargePeopleMesh.frustumCulled = false;
scene.add(lifeBargePeopleMesh);
/* river-barge crew seats: fixed, all 3 always shown. Pleasure-barge seats:
   3 crew (bow/stern/tiller) then up to 20 partiers scattered on deck —
   generated once, not hand-typed 20 times. */
var LIFE_RBARGE_SEATS = [ [0, -LIFE_RBARGE_LEN*0.30], [-2.5, 3], [2.5, 3] ];
var LIFE_PBARGE_SEATS = [ [0, -LIFE_PBARGE_LEN*0.40], [-2.6, -LIFE_PBARGE_LEN*0.05], [2.6, -LIFE_PBARGE_LEN*0.05] ];
for(var lp=0; lp<20; lp++){
  var lpa = (lp/20)*Math.PI*2;
  LIFE_PBARGE_SEATS.push([ Math.cos(lpa)*LIFE_PBARGE_BEAM*0.36, Math.sin(lpa)*LIFE_PBARGE_LEN*0.34 ]);
}

var lifeBargeTmpPos = new THREE.Vector3(), lifeBargeTmpPos2 = new THREE.Vector3(), lifeBargeTmpDir = new THREE.Vector3();
var lifeBargeTmpQuat = new THREE.Quaternion(), lifeBargeTmpMat = new THREE.Matrix4();
var lifeBargeTmpScale1 = new THREE.Vector3(1,1,1), lifeBargeTmpScale0 = new THREE.Vector3(0,0,0);
function lifePlaceBargePeople(baseIdx, seats, visibleCount, pos, yaw, deckY){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  for(var s=0; s<seats.length; s++){
    if(s < visibleCount){
      var seat = seats[s];
      var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
      var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
      lifeBargeTmpPos2.set(wx, deckY, wz);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
    }else{
      lifeBargeTmpMat.compose(lifeBargeTmpPos2.set(0,0,0), lifeBargeTmpQuat, lifeBargeTmpScale0);
    }
    lifeBargePeopleMesh.setMatrixAt(baseIdx+s, lifeBargeTmpMat);
  }
}
/* local-avoidance arrays (lifeAvoidNudge is defined up near updateLife —
   see the file-level comment left where this block USED to sit, in the
   ferry section, for why the sizing happens down here instead). Every
   population that steers at runtime gets a slot range: canoes, ferries,
   ships, the pleasure barge, river barges. Priority tiers (see
   lifeAvoidGiveWay near lifeAvoidNudge): canoe 1 (yields most), ferry 2,
   ship/barge 3 — the owner: "make sure [the pleasure barge] and the
   river barges have FULL collision detection and avoidance... put them
   in the highest right of way like the sailing ships." Plus one more
   tier above all of them: BRIDGE_SUPPORTS (50-cantons.js, real bridge
   pylons standing in open water) get their own STATIC slots at priority
   5 — an immovable pylon should always win a give-way negotiation against
   literally everything, ships included, not just canoes/ferries. This
   is also the only avoidance ANY river barge gets against a bridge
   support: lifeRiverCurve (below) just follows the channel centreline
   with no obstacle-awareness of its own, and a bridge's single central
   pylon (span(), 50-cantons.js) sits almost exactly on that centreline —
   this real-time nudge is what actually keeps a barge off it, not the
   route. */
var LIFE_AVOID_CANOE0 = 0, LIFE_AVOID_FERRY0 = LIFE_N, LIFE_AVOID_SHIP0 = LIFE_N + LIFE_FERRY_N;
/* LIFE_SHIP_HULL_N, not LIFE_SHIP_N: the ship block is LIFE_SHIPS' own
   pool plus one trailing slot for the Fortress coast guard (LIFE_SHIP_CG_IDX),
   so it gets the same priority-3 right of way every other big hull has. */
var LIFE_AVOID_PBARGE0 = LIFE_AVOID_SHIP0 + LIFE_SHIP_HULL_N;
var LIFE_AVOID_RBARGE0 = LIFE_AVOID_PBARGE0 + 1;
var LIFE_AVOID_OBST0 = LIFE_AVOID_RBARGE0 + LIFE_RBARGE_N;
var LIFE_AVOID_N = LIFE_AVOID_OBST0 + BRIDGE_SUPPORTS.length;
var LIFE_AVOID_X = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_Z = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_R = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_PRIORITY = new Float32Array(LIFE_AVOID_N);
(function(){
  for(var i=0;i<LIFE_N;i++){ LIFE_AVOID_R[LIFE_AVOID_CANOE0+i] = 3.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_CANOE0+i] = 1; }
  for(var j=0;j<LIFE_FERRY_N;j++){ LIFE_AVOID_R[LIFE_AVOID_FERRY0+j] = 9.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_FERRY0+j] = 2; }
  for(var k=0;k<LIFE_SHIP_HULL_N;k++){ LIFE_AVOID_R[LIFE_AVOID_SHIP0+k] = 17.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_SHIP0+k] = 3; }
  LIFE_AVOID_PRIORITY[LIFE_AVOID_PBARGE0] = 3;   /* radius set per-frame in updateBarges (pleasure barge has no fixed LEN/BEAM consts) */
  for(var r=0;r<LIFE_RBARGE_N;r++){ LIFE_AVOID_R[LIFE_AVOID_RBARGE0+r] = 15.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_RBARGE0+r] = 3; }
  for(var o=0;o<BRIDGE_SUPPORTS.length;o++){
    var bs = BRIDGE_SUPPORTS[o];
    LIFE_AVOID_X[LIFE_AVOID_OBST0+o] = bs.x; LIFE_AVOID_Z[LIFE_AVOID_OBST0+o] = bs.z;
    LIFE_AVOID_R[LIFE_AVOID_OBST0+o] = bs.r; LIFE_AVOID_PRIORITY[LIFE_AVOID_OBST0+o] = 5;
  }
})();
window._avoidDebug = { X:LIFE_AVOID_X, Z:LIFE_AVOID_Z, R:LIFE_AVOID_R, P:LIFE_AVOID_PRIORITY,
  canoe0:LIFE_AVOID_CANOE0, ferry0:LIFE_AVOID_FERRY0, ship0:LIFE_AVOID_SHIP0,
  pbarge0:LIFE_AVOID_PBARGE0, rbarge0:LIFE_AVOID_RBARGE0, obst0:LIFE_AVOID_OBST0,
  obstN: BRIDGE_SUPPORTS.length, n: LIFE_AVOID_N };   /* diagnostic */
/* anticipatory-turn tuning for ferries (updateFerries) — see the comment
   at its avoidance block. Lookahead is roughly 1.5s of travel at a
   ferry's typical speed (8-11/s), and the turn rate is fast enough to
   read as a deliberate course correction within that window without
   snapping the hull instantly onto the new heading. */
var LIFE_AVOID_LOOKAHEAD = 16;
var LIFE_FERRY_TURN_RATE = 1.4;
/* same idea for ships — sensed farther ahead (bigger, needs more warning)
   and turning much slower (a loaded hull doesn't snap onto a heading). */
var LIFE_SHIP_AVOID_R = 17.0;
var LIFE_SHIP_LOOKAHEAD = 30;
var LIFE_SHIP_TURN_RATE = 0.6;
/* barges: river barges are ship-sized (LEN 50) but poled/towed, not
   sailed — slower, more ponderous turning than even the ships. The
   pleasure barge is smaller/nimbler (LEN 26). */
var LIFE_RBARGE_AVOID_R = 15.0;
var LIFE_RBARGE_LOOKAHEAD = 28;
var LIFE_RBARGE_TURN_RATE = 0.5;
var LIFE_PBARGE_AVOID_R = 9.0;
var LIFE_PBARGE_LOOKAHEAD = 18;
var LIFE_PBARGE_TURN_RATE = 0.9;
function updateBarges(dt){
  LIFE_BARGE_T += dt;
  var riverBargeSlot = 0;
  LIFE_BARGES.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.kind === 'river'){
      /* each barge owns one dock (b.home, LIFE_RBARGE_DOCKS) and cycles
         entirely on its own timer — no shared quay-contention logic
         needed since nothing else can ever want b.home. */
      var rAvoidSlot = LIFE_AVOID_RBARGE0 + riverBargeSlot;
      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[rAvoidSlot] = b.x; LIFE_AVOID_Z[rAvoidSlot] = b.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;
        if(b.dwell === undefined) b.dwell = rr(20, 45);
        if(b.stateT >= b.dwell){
          b.curve = lifeRiverCurve(b.home.u, LIFE_RIVER_TURN_U);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'departing'; b.stateT = 0;
        }
      }else if(b.state === 'away'){
        LIFE_AVOID_R[rAvoidSlot] = 0;   /* off the map — not an obstacle */
        if(LIFE_BARGE_T >= b.awayUntil){
          b.curve = lifeRiverCurve(LIFE_RIVER_TURN_U, b.home.u);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'arriving'; b.stateT = 0;
        }
        lifeBargeTmpMat.compose(lifeBargeTmpPos.set(0,0,0), lifeBargeTmpQuat.identity(), lifeBargeTmpScale0);
        lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);
        lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 0, {x:0,z:0}, 0, 0);
        riverBargeSlot++;
        return;
      }else{
        /* the owner: "make sure [river barges] have FULL collision
           detection and avoidance... highest right of way like the
           sailing ships" — same anticipatory-lookahead + turn-rate-
           limited heading fix as ships/ferries (see updateShips' own
           comment for the two problems this solves together): sensed
           from ahead of the barge, not from where it already is, and the
           render yaw comes from actual movement rather than the raw
           curve tangent so a nudge reads as steering, not sliding. This
           is the ONLY obstacle-awareness a river barge has at all — its
           route (lifeRiverCurve) just follows the channel centreline
           blind, so this is what actually keeps it off a bridge pylon. */
        var raw = Math.min(1, b.stateT/b.dur);
        var t = raw*raw*(3-2*raw);
        b.curve.getPointAt(t, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan = Math.min(0.995, Math.max(0.005, t));
        b.curve.getTangentAt(tTan, lifeBargeTmpDir);
        var tanYawR = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var rdelta = lifeAvoidNudge2(rAvoidSlot, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_RBARGE_AVOID_R, 14.0, LIFE_RBARGE_LOOKAHEAD, 5.0, 3);
        pos.x += rdelta[0]; pos.z += rdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawR;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxr = pos.x-b.lastX, mdzr = pos.z-b.lastZ;
        var moveYawR = (mdxr*mdxr+mdzr*mdzr > 1e-6) ? Math.atan2(mdxr,mdzr) : tanYawR;
        var dAngR = moveYawR - b.facingYaw;
        while(dAngR > Math.PI) dAngR -= Math.PI*2;
        while(dAngR < -Math.PI) dAngR += Math.PI*2;
        var maxStepR = LIFE_RBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepR, Math.min(maxStepR, dAngR));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[rAvoidSlot] = pos.x; LIFE_AVOID_Z[rAvoidSlot] = pos.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;

        if(raw >= 1){
          if(b.state === 'arriving'){
            b.state = 'docked'; b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
            b.lastArrivalTime = LIFE_BARGE_T; b.stateT = 0; b.dwell = rr(20, 45);
          }else{
            b.state = 'away'; b.stateT = 0;
            b.awayUntil = LIFE_BARGE_T + b.dur*rr(1,2.2);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.3, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);
      /* stand crew on the main hull box's own top (h6, world SEA-0.3+3);
         SEA+0.6 (the original number) was well inside that solid box. */
      lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 3, pos, yaw, SEA+3.0);
      riverBargeSlot++;
    }else{
      /* the pleasure barge — same treatment, one slot (LIFE_AVOID_PBARGE0,
         there's only ever one of these). */
      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = b.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = b.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;
        if(b.passengers < b.target) b.passengers = Math.min(b.target, b.passengers + dt*0.6);
        if(b.passengers >= 10 && b.stateT >= 20){
          var away = lifePolyRandomPoint(LIFE_PBARGE_ZONE);
          b.curve = lifeBuildLegInPoly(b.x, b.z, away[0], away[1], LIFE_PBARGE_ZONE);
          b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
          b.state = 'ramble'; b.stateT = 0;
        }
      }else if(b.state === 'ramble' || b.state === 'returning'){
        var raw2 = Math.min(1, b.stateT/b.dur);
        var t2 = raw2*raw2*(3-2*raw2);
        b.curve.getPointAt(t2, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan2 = Math.min(0.995, Math.max(0.005, t2));
        b.curve.getTangentAt(tTan2, lifeBargeTmpDir);
        var tanYawP = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var pdelta = lifeAvoidNudge2(LIFE_AVOID_PBARGE0, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_PBARGE_AVOID_R, 10.0, LIFE_PBARGE_LOOKAHEAD, 4.0, 3);
        pos.x += pdelta[0]; pos.z += pdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawP;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxp = pos.x-b.lastX, mdzp = pos.z-b.lastZ;
        var moveYawP = (mdxp*mdxp+mdzp*mdzp > 1e-6) ? Math.atan2(mdxp,mdzp) : tanYawP;
        var dAngP = moveYawP - b.facingYaw;
        while(dAngP > Math.PI) dAngP -= Math.PI*2;
        while(dAngP < -Math.PI) dAngP += Math.PI*2;
        var maxStepP = LIFE_PBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepP, Math.min(maxStepP, dAngP));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = pos.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;

        if(raw2 >= 1){
          if(b.state === 'ramble'){
            b.curve = lifeBuildLegInPoly(pos.x, pos.z, LIFE_PBARGE_DOCK.x, LIFE_PBARGE_DOCK.z, LIFE_PBARGE_ZONE);
            b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
            b.state = 'returning'; b.stateT = 0;
          }else{
            b.state = 'docked'; b.x = LIFE_PBARGE_DOCK.x; b.z = LIFE_PBARGE_DOCK.z; b.ry = LIFE_PBARGE_DOCK.ry;
            b.stateT = 0; b.passengers = 0; b.target = ri(10,20);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.25, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifePBargeHullMesh.setMatrixAt(0, lifeBargeTmpMat);
      lifePBargeSailMesh.setMatrixAt(0, lifeBargeTmpMat);
      var pBase = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER;
      /* stand on the deck plank's own top (translate(0,2.5,0), h 0.6, so
         world SEA-0.25+2.8) — same class of bug as the river-barge crew. */
      lifePlaceBargePeople(pBase, LIFE_PBARGE_SEATS, 3 + Math.floor(b.passengers), pos, yaw, SEA+3.1);
    }
  });
  lifeRBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeSailMesh.instanceMatrix.needsUpdate = true;
  lifeBargePeopleMesh.instanceMatrix.needsUpdate = true;
}

