/* ============================== fishing dhows ===============================
   Owner's ask: fishing boats that "look like dhows" (a lateen-rigged Arab dhow
   — single slanted triangular sail on a forward-raked mast, narrow curved
   hull), 3 crew each, 3 per pier, working LIFE_FISH_PIERS (65-facade.js — the
   piers packed into the 4 owner-marked cove polygons via claim()). Behaviour:
   depart the home pier, pick a random spot out in the bay (north-of-the-
   cantons biased — this world's own convention, confirmed live rather than
   assumed: 30-layout.js says outright "at the CITY side (north = smaller z)"
   and "12 = north" on the bay's own clock parametrisation), travel there,
   "drop nets" (idle in place) for 15s, haul up, sail home, repeat. Structurally
   identical to the pleasure barge's own docked -> ramble -> returning loop
   just above (leave port, go to a point, wait, come back) — same curve solver
   reused (lifeCurveFromCentripetal) and the same land/canton/pier pushback
   (lifePushToWater/lifeCantonBlocked/lifePierOrBridgeBlocked), just without
   the pleasure barge's own giant hand-traced safe-water polygon: that polygon
   exists because a barge ramble can run clear across the lake through several
   concave fjords in one hop, and a short local fishing hop never goes anywhere
   near that far, so the plain land/canton/pier pushback the ships/ferries
   already use is enough on its own — see lifeBuildLegOpenWater below.

   4 draw calls total (hull+mast+fish-bin merged, sail, crew, and — added the
   pass that made the nets visible — ONE shared gear mesh carrying every
   boat's nets, cork lines and catch) — the floor BUDGET.
   drawCalls (05-palette.js) already documents every boat population paying,
   same as canoes/taxis/ships/ferries/barges before it. Sail colour varies per
   boat via BANNERC (05-palette.js's own "cloth family" palette, already used
   for banners elsewhere) using the same one-shot setColorAt trick the water
   taxis use for their per-boat hue (updateWaterTaxis' own init, above) — no
   4th draw call, no per-part independent colour, just a per-instance tint.
   Crew reuses lifePersonGeo (this file's own shared person geometry — same
   one canoes/ferries/ships/barges all mount) on a dedicated InstancedMesh,
   same reasoning lifeBargePeopleMesh got its own mesh: no existing crew mesh
   has spare capacity to grow into for free.

   No real-time mutual collision avoidance between dhows (or against other
   traffic) — same honest limitation this file's own header already states
   for canoes ("tier-1: ~30 entities, fixed/weighted routes, no runtime
   collision"): dhows are the same small-boat tier, and wiring a new
   population into the shared LIFE_AVOID_* arrays (sized once, near the
   pleasure barge above, and read by several other systems) is real risk for
   a population this size isn't worth buying; the curve itself already steers
   clear of land, cantons and every pier. */
reseed(786217);
/* owner: "make the fishing boats a little bigger so you can see a little bin
   where they load up with fish". ONE scale constant drives the whole model
   (hull, beam, mast, sail — the sail geometry is derived from these same
   constants, so it follows for free), because everything that has to be
   re-tuned for a size change is downstream of it: the mooring slots along
   each pier (LIFE_FISH_BOATS below) and the net/bin gear rig. 1.35x is what
   the piers actually hold: the hull's real footprint is 1.18*LEN (stern at
   -0.51*LEN, prow tip at +0.67*LEN), and three boats moored in a row down
   one flank of a 38-unit pier only have ~13.7 units of slot spacing — which
   the OLD 12-long hull already overran (14.2 > 13.7, boats overlapping at
   their moorings before this pass touched anything). Fixed properly here by
   berthing the middle boat on the pier's other flank (LIFE_FISH_BOATS), the
   way the ShoalBank jetty already berths both its own sides, which takes
   same-flank spacing to 0.66*38 = 25.1 — comfortably clear of a 19.1-unit
   hull. Vertical scales with it too, so the boat grows as a boat rather than
   stretching into a plank; the deck line barely moves (both hull boxes are
   centred at -0.65*S with a height of ~1.28*S, so their tops stay within a
   few hundredths of local y=0) and the crew mount height is unchanged. */
var LIFE_DHOW_SCALE = 1.35;
var LIFE_DHOW_LEN = 12*LIFE_DHOW_SCALE, LIFE_DHOW_BEAM = 3.0*LIFE_DHOW_SCALE;
var LIFE_DHOW_HULL_COL = 0x8a6b45;
var LIFE_DHOW_MAST_H = 7.0*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_Z = LIFE_DHOW_LEN*0.16;
var LIFE_DHOW_MAST_RAKE = 0.26;           /* forward rake — rotateX tilts the mast's TOP toward +Z (the bow), a genuine fore-aft lean, not the sideways rotateZ tilt the junk's own masts use (78-life.js's junk section rotates around Z, which leans a mast in the BEAM direction — fine for that hull's own silhouette, but a lateen rig's rake is specifically fore-and-aft, so this uses the axis that actually produces that). */
var LIFE_DHOW_MAST_BASE_Y = 0.65*LIFE_DHOW_SCALE;
/* the fish bin — "a little bin where they load up with fish for the trip
   back, and unload at the docks". The BIN ITSELF is static relative to the
   hull, so it merges straight into lifeDhowHullGeo and costs nothing but
   triangles; only its CONTENTS move, and those ride the shared gear mesh
   below with the nets. Sited hard against the STARBOARD rail, not amidships,
   for two reasons that are both geometric rather than stylistic: the lateen
   sail is a zero-thickness plane at local x=0 whose foot sweeps the deck
   from z=+LEN*0.16+1 back to z=-LEN*0.42 at y~1.0, so anything centred on
   the deck taller than about 0.9 renders through the sail; and a boat moored
   alongside always has the pier off its local +X (local +X maps to world
   -perp, and every mooring slot below sits at +perp from its pier), so a
   starboard bin is the side the unloading crewman actually faces. */
/* bin centre: set so the OUTER wall lands exactly on the starboard gunwale's
   own inner face (BEAM*0.50 - half the 0.12*S trim), i.e. the bin is built
   against the rail rather than floating in the middle of the deck */
var LIFE_DHOW_BIN_X = (3.0*0.50 - 0.12*0.5 - 1.20*0.5)*LIFE_DHOW_SCALE;
var LIFE_DHOW_BIN_W = 1.20*LIFE_DHOW_SCALE;   /* across the boat, outer wall to outer wall */
var LIFE_DHOW_BIN_L = LIFE_DHOW_LEN*0.32;     /* fore-and-aft */
var LIFE_DHOW_BIN_Z = -LIFE_DHOW_LEN*0.20;
var LIFE_DHOW_BIN_H = 0.78*LIFE_DHOW_SCALE;   /* wall height above the deck */
var LIFE_DHOW_BIN_T = 0.11*LIFE_DHOW_SCALE;   /* plank thickness */
var LIFE_DHOW_BIN_COL = shade(LIFE_DHOW_HULL_COL,-0.26);
var lifeDhowHullParts = [
  /* narrow hull, two segments (not one uniform box) so the beam actually
     tapers toward both ends instead of reading as a plank */
  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM*0.82, 1.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.46).translate(0,-0.65*LIFE_DHOW_SCALE,-LIFE_DHOW_LEN*0.28), color: LIFE_DHOW_HULL_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM, 1.32*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.50).translate(0,-0.65*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.11), color: LIFE_DHOW_HULL_COL },
  /* curved, upswept prow — the single most dhow-like silhouette cue along
     with the sail; same 4-sided-cone wedge trick the junk's own sharp bow
     uses (its own section, above), seamed to THIS hull's own front edge */
  { geo: new THREE.ConeGeometry(1, LIFE_DHOW_LEN*0.32, 4).rotateX(Math.PI/2)
          .scale(LIFE_DHOW_BEAM*0.40, 1.15*LIFE_DHOW_SCALE, 1).translate(0, 0.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.36+LIFE_DHOW_LEN*0.15),
    color: LIFE_DHOW_HULL_COL },
  /* thin gunwale trim, both sides */
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate( LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate(-LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  /* the single forward-raked mast */
  { geo: SHAPES.cyl().scale(0.13*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_H, 0.13*LIFE_DHOW_SCALE).rotateX(LIFE_DHOW_MAST_RAKE).translate(0, LIFE_DHOW_MAST_BASE_Y, LIFE_DHOW_MAST_Z), color: shade(LIFE_DHOW_HULL_COL,-0.30) },
  /* the fish bin: floor + four walls, open-topped, so the catch inside it
     (shared gear mesh, below) is genuinely visible over the rim */
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X-LIFE_DHOW_BIN_W*0.5+LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X+LIFE_DHOW_BIN_W*0.5-LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z+LIFE_DHOW_BIN_L*0.5-LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z-LIFE_DHOW_BIN_L*0.5+LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL }
];
var lifeDhowHullGeo = lifeMergeGeoms(lifeDhowHullParts);
var LIFE_DHOW_N = LIFE_FISH_PIERS.length * 3;   /* "3 boats per pier", however many piers actually fit */
var lifeDhowHullMesh = new THREE.InstancedMesh(lifeDhowHullGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N));
lifeDhowHullMesh.userData.life = true; lifeDhowHullMesh.userData.inspectLabel = 'Fishing dhow hull';
lifeDhowHullMesh.frustumCulled = false; scene.add(lifeDhowHullMesh);
/* the lateen sail: one real triangle (not a rectangle like the junk's own
   battened lugsail) — a single slanted panel hung aft of the raked mast, the
   owner's own explicit reference. Both faces wound (front+back) so it reads
   correctly from either side without relying on a material-side flag. Baked
   pure white so a per-instance setColorAt (below) drives the actual colour —
   the same one-shot tint trick the water taxis already use for their own
   per-boat hue, just simpler here (the sail is the ENTIRE geometry, so no
   part needs to stay a fixed colour the way the taxi's wood hull does). */
function lifeDhowSailGeo(){
  var mastTopY = LIFE_DHOW_MAST_BASE_Y + LIFE_DHOW_MAST_H*Math.cos(LIFE_DHOW_MAST_RAKE);
  var mastTopZ = LIFE_DHOW_MAST_Z + LIFE_DHOW_MAST_H*Math.sin(LIFE_DHOW_MAST_RAKE);
  var peak = [0, mastTopY*0.93, mastTopZ - LIFE_DHOW_LEN*0.30];   /* the yard's own peak — aft and high, exactly how a lateen yard crosses its mast */
  var tack = [0, LIFE_DHOW_MAST_BASE_Y+0.25, LIFE_DHOW_MAST_Z + 1.0];
  var clew = [0, LIFE_DHOW_MAST_BASE_Y+0.45, LIFE_DHOW_MAST_Z - LIFE_DHOW_LEN*0.58];
  var pos = [ peak[0],peak[1],peak[2], tack[0],tack[1],tack[2], clew[0],clew[1],clew[2],
              peak[0],peak[1],peak[2], clew[0],clew[1],clew[2], tack[0],tack[1],tack[2] ];
  var uv = [0,1, 0,0, 1,0,  0,1, 1,0, 0,0];
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}
var lifeDhowSailGeoObj = lifeDhowSailGeo();
var lifeDhowSailMesh = new THREE.InstancedMesh(lifeDhowSailGeoObj, new THREE.MeshLambertMaterial({ color:0xffffff, side:THREE.DoubleSide }), Math.max(1,LIFE_DHOW_N));
lifeDhowSailMesh.userData.life = true; lifeDhowSailMesh.userData.inspectLabel = 'Fishing dhow sail';
lifeDhowSailMesh.frustumCulled = false; scene.add(lifeDhowSailMesh);
/* crew: 3 per boat, always shown (never toggled off) — own InstancedMesh,
   same reasoning as lifeBargePeopleMesh (no existing crew mesh has spare
   capacity to grow into). Seats: one forward lookout, one amidships at the
   nets, one aft at the steering oar.
   Both after-seats moved to PORT (local -x) this pass: the fish bin now
   occupies the starboard side of the after deck, and the old aft seat
   ([0.5, -LEN*0.34]) sat inside it. */
var LIFE_DHOW_SEATS = [ [0, LIFE_DHOW_LEN*0.30], [-0.55*LIFE_DHOW_SCALE, -0.15], [-0.52*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.34] ];
var lifeDhowCrewMesh = new THREE.InstancedMesh(lifePersonGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N*3));
lifeDhowCrewMesh.userData.life = true; lifeDhowCrewMesh.userData.inspectLabel = 'Dhow crew';
lifeDhowCrewMesh.frustumCulled = false; scene.add(lifeDhowCrewMesh);

/* ---------------------------- the working gear ----------------------------
   Owner: "does the fishing dhow have a net animation? when it gets to its
   fishing spot i don't see much change" — it did not; the state machine was
   real but nothing on the boat moved. Everything that now moves rides ONE
   shared InstancedMesh over ONE unit box, which is the mill-rotor rig's own
   pattern (65-facade.js MILL_CLUSTERS: a single unit bar drives every sail
   and water wheel in the city for one draw call) rather than a fourth
   pattern invented here. Five slots per boat, 5*45 = 225 instances, +1 draw
   call total for the whole fleet:
     0,2  net panel, port and starboard  — a dark skirt that lies rolled on
          the rail when stowed and swings out and down into the water when
          shot, driven by one 0..1 deploy parameter that lerps its x offset,
          its top and bottom edges, its thickness and its length at once.
     1,3  cork/float line, port and starboard — a pale bar that is a coil on
          the rail when stowed and a long line lying ON the water surface,
          outboard of the net, when shot. This is the part that actually
          reads at distance: two bright lines on the water either side of a
          hull is the unmistakable silhouette of a net being worked, where a
          dark panel against dark water is not.
     4    the catch in the fish bin — a box that grows out of the bin as the
          nets come up and shrinks to nothing as the boat unloads.
   Why the net has to stay ABOVE the waterline: the water (75-terrain.js) is
   a transparent ShaderMaterial whose alpha runs 0.72 shallow to 0.96 deep,
   and renderOrder 2 puts it after these opaque meshes — so anything hung
   more than a few tenths below SEA at a real fishing spot (terrainH <= -2.5
   by lifeFishingSpot's own test, usually 15-20 deep) is drawn and then
   painted over at 96% opacity, i.e. invisible. The net therefore hangs from
   a spar above the rail down to just under the surface, and the visible
   cue is the part a viewer on the shore would actually see anyway. */
var LIFE_DHOW_GEAR_PER = 5;
var lifeDhowGearGeo = new THREE.BoxGeometry(1,1,1);
var lifeDhowGearMesh = new THREE.InstancedMesh(lifeDhowGearGeo, new THREE.MeshLambertMaterial({ color:0xffffff }), Math.max(1,LIFE_DHOW_N*LIFE_DHOW_GEAR_PER));
lifeDhowGearMesh.userData.life = true; lifeDhowGearMesh.userData.inspectLabel = 'Dhow nets and catch';
lifeDhowGearMesh.frustumCulled = false; scene.add(lifeDhowGearMesh);
/* .convertSRGBToLinear() on every one of these: the static bake does it in
   emitBuckets() (45-kit.js) and this layer does not, so a raw palette hex
   here renders visibly washed out next to the same colour on a building —
   SUBAGENT.md's own third instance-colour trap. */
var LIFE_DHOW_NET_COL   = 0x39453b;   /* wet, weed-stained netting */
var LIFE_DHOW_FLOAT_COL = 0xd9c7a0;   /* cork floats, bleached rope */
var LIFE_DHOW_CATCH_COL = 0xa9bcbe;   /* a heap of wet silver fish */

/* short local leg — lifeBuildLegInPoly's own twin (see this section's header
   comment for why the polygon test is dropped): same waypoint layout, same
   refinement loop against cantons/land/piers, just without a containment
   test against a hand-traced zone. */
function lifeBuildLegOpenWater(ax,az,bx,bz){
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0;i<6;i++){
      var pb = lifePierOrBridgeBlocked(x,z);
      if(!pb) break;
      x=pb[0]; z=pb[1];
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 7;
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++) waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  waypoints.push([bx,bz]);
  var curve = lifeCurveFromCentripetal(waypoints);
  for(var round=0; round<20; round++){
    var worstT=-1, worstFix=null;
    for(var s=1;s<80;s++){
      var st=s/80, p3=curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x,p3.z);
      if(blocked){ worstT=st; worstFix=[blocked[0].x+blocked[1]*blocked[3]*1.25, blocked[0].z+blocked[2]*blocked[3]*1.25]; break; }
      var pierFix = lifePierOrBridgeBlocked(p3.x,p3.z);
      if(pierFix){ worstT=st; worstFix=pierFix; break; }
      if(terrainH(p3.x,p3.z) > -1.5){ worstT=st; worstFix=lifePushToWater(p3.x,p3.z); break; }
    }
    if(worstT<0) return curve;
    var nearestIdx=1, nearestD=Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt=w2/(waypoints.length-1), dT=Math.abs(wt-worstT);
      if(dT<nearestD){ nearestD=dT; nearestIdx=w2; }
    }
    waypoints[nearestIdx]=worstFix;
    curve = lifeCurveFromCentripetal(waypoints);
  }
  return curve;
}
/* a random bay spot to fish at, biased north (smaller z, this world's own
   "north" — see this section's header comment) by blending each candidate
   bearing toward the fixed north vector (0,-1) before sampling a distance
   along it; the northmost of several tries is kept for a real, checkable
   bias rather than a token nudge. Rejects canton platforms and anything not
   comfortably real open water (terrainH), same tests the pleasure barge's
   own ramble destination and every canoe leg already apply. */
function lifeFishingSpot(homeX, homeZ){
  var best=null, bestZ=Infinity;
  for(var tries=0; tries<6; tries++){
    var ang = rr(0, Math.PI*2);
    var dx = Math.cos(ang), dz = Math.sin(ang);
    var northBias = 0.62;
    dx = mix(dx, 0, northBias); dz = mix(dz, -1, northBias);
    var L = Math.hypot(dx,dz) || 1; dx/=L; dz/=L;
    var dist = rr(160, 420);
    var cx = homeX + dx*dist, cz = homeZ + dz*dist;
    var p = lifePushToWater(cx,cz);
    /* the endpoint itself needs the SAME pier/bridge clearance the curve's
       own mid-route points already get in lifeBuildLegOpenWater — a real
       bug caught by screenshot: without this, a chosen fishing spot could
       land right under an existing harbour/ferry pier deck (60-land.js
       PIERS, 65-facade.js's own ferry stops), which the route-refinement
       loop only ever samples up to t~0.9875, never the literal endpoint. */
    for(var pb=0; pb<5; pb++){
      var fix = lifePierOrBridgeBlocked(p[0],p[1]);
      if(!fix) break;
      p = lifePushToWater(fix[0], fix[1]);
    }
    if(lifeCantonBlocked(p[0],p[1])) continue;
    if(lifePierOrBridgeBlocked(p[0],p[1])) continue;
    if(terrainH(p[0],p[1]) > -2.5) continue;
    if(p[1] < bestZ){ bestZ = p[1]; best = p; }
  }
  return best || lifePushToWater(homeX, homeZ - 220);
}

var LIFE_FISH_BOATS = [];
(function(){
  /* 3 mooring slots per pier. Re-tuned for the 1.35x hull (LIFE_DHOW_SCALE):
     the old [0.20,0.56,0.92] down ONE flank gave 0.36*38 = 13.7 units of
     spacing for a hull whose real footprint was already 14.2 — the boats
     overlapped at their moorings before this pass, and at 19.1 they would
     have overlapped badly. The middle boat now berths on the pier's other
     flank (slotSide below), exactly as the ShoalBank jetty already berths
     both of its own sides, which takes SAME-flank spacing to 0.66*38 = 25.1
     against a 19.1 hull — a real 6-unit gap — while fore-and-aft neighbours
     never share a side at all. Lateral room for the second flank is
     measured, not assumed: the nearest other pier centreline to a point 8
     units off any pier's beam is 25.6 (ShoalBank) to 64 (CoveFortress), and
     a moored dhow's outboard edge sits 10.0 from its own pier's centreline.
     Slot 0 stays at 0.25 rather than creeping further landward because a
     stern reaches 0.51*LEN behind its slot, and 0.25*38 - 9.9 = -0.4 already
     puts it level with the start of the pier's always-wet seaward 38. */
  var slotT = [0.25, 0.58, 0.91];
  var slotSide = [1, -1, 1];
  LIFE_FISH_PIERS.forEach(function(pier){
    var perpX = -pier.dirZ, perpZ = pier.dirX;
    var lateral = pier.w*0.5 + LIFE_DHOW_BEAM*0.5 + 1.2;
    var ry = Math.atan2(pier.dirX, pier.dirZ);          /* facing straight out, same heading as departure */
    slotT.forEach(function(t, si){
      var side = slotSide[si];
      /* slots are measured back from the SEAWARD end, not forward from the
         root: a shore pier is now rooted as far landward as it needs to be
         to actually reach dry ground (65-facade.js), so measuring forward
         from the root would walk the mooring slots up onto the beach. The
         seaward LIFE_FISHDOCK_LEN of every pier is the part that is always
         in real water, which is the part a dhow can tie to. */
      var pierLen = pier.len || LIFE_FISHDOCK_LEN;
      var alongLen = (pierLen - LIFE_FISHDOCK_LEN) + LIFE_FISHDOCK_LEN * t;
      /* That claim — the seaward LIFE_FISHDOCK_LEN is always real water — is
         now TRUE in all four zones, and is checkable: window._fishDocks
         .moorReport() samples every hull footprint here against terrainH and
         reports 0 of 45 over beach (it was 13 of 45: CoveWest 12, CoveEast
         1). It was not true when the 1.35x hull landed, because the CoveWest
         chord and CoveEast's first pier are hand-marked INLAND of the real
         waterline — measured, 4 to 32 units up the beach, not the 10-15 an
         earlier probe read off the centreline alone.
         Fixed where a pier root can actually move, in buildFishDockZone()
         (65-facade.js): it now walks a root SEAWARD to the first place whose
         whole berth band is water before doing its old landward walk for the
         deck. NOT fixed here by walking each SLOT seaward — that was tried,
         and it is the wrong level: these shorelines run oblique to the
         chords, so a laterally-offset stern is still on land well after the
         centreline is wet, the walk ran to its cap and same-flank spacing
         collapsed from 25.1 to 7.1, i.e. a real hull collision traded for a
         cosmetic one. Because the fix moves the DATUM (pier.len -
         LIFE_FISHDOCK_LEN) rather than the slots, this layout is untouched
         by it: same-flank spacing is still a measured 25.1 against a 19.12
         hull span in every zone, before and after. */
      var rx = pier.x0 + pier.dirX*alongLen + perpX*lateral*side;
      var rz = pier.z0 + pier.dirZ*alongLen + perpZ*lateral*side;
      LIFE_FISH_BOATS.push({
        home: { x:rx, z:rz, ry:ry }, pier: pier, moorSide: side,
        state:'docked', x:rx, z:rz, ry:ry, stateT: rr(0,14), dwell: rr(6,20),
        speed: rr(5.5,7.5), sailCol: pick(BANNERC),
        net: 0, catch: 0, unloadFrom: 0   /* 0..1 net deploy and bin fill, driven by updateFishBoats */
      });
    });
  });
  LIFE_DHOW_N = LIFE_FISH_BOATS.length;   /* == LIFE_FISH_PIERS.length*3 always, recorded here for clarity */
  /* gear colours are seeded HERE, at build time, on EVERY slot — both of the
     first two instance-colour traps in SUBAGENT.md §6 in one go: a mesh that
     first tints at frame time gets a shader program compiled without the
     instance-colour path and renders pure white forever, and the first
     setColorAt on a lazily-allocated zero-filled buffer blackens every slot
     that was never explicitly tinted. Nothing here is tinted later, so this
     one pass is also the last word on these colours. */
  var gearCol = new THREE.Color();
  var gearM = new THREE.Matrix4(), gearP = new THREE.Vector3(), gearQ = new THREE.Quaternion(), gearS = new THREE.Vector3();
  for(var i=0;i<LIFE_FISH_BOATS.length;i++){
    lifeDhowHullMesh.setColorAt(i, new THREE.Color(0xffffff));
    lifeDhowSailMesh.setColorAt(i, new THREE.Color(LIFE_FISH_BOATS[i].sailCol));
    for(var g=0; g<LIFE_DHOW_GEAR_PER; g++){
      var hex = (g===4) ? LIFE_DHOW_CATCH_COL : (g&1) ? LIFE_DHOW_FLOAT_COL : LIFE_DHOW_NET_COL;
      lifeDhowGearMesh.setColorAt(i*LIFE_DHOW_GEAR_PER+g, gearCol.set(hex).convertSRGBToLinear());
      /* and seed the MATRIX too: an InstancedMesh's matrices default to the
         identity, which would park 225 unit cubes on the world origin for
         however many frames pass before updateLife's first tick. A
         vanishing scale at the boat's own mooring is invisible either way. */
      gearP.set(LIFE_FISH_BOATS[i].x, SEA, LIFE_FISH_BOATS[i].z);
      gearS.set(1e-4,1e-4,1e-4);
      gearM.compose(gearP, gearQ.identity(), gearS);
      lifeDhowGearMesh.setMatrixAt(i*LIFE_DHOW_GEAR_PER+g, gearM);
    }
  }
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
  if(lifeDhowHullMesh.instanceColor) lifeDhowHullMesh.instanceColor.needsUpdate = true;
  if(lifeDhowSailMesh.instanceColor) lifeDhowSailMesh.instanceColor.needsUpdate = true;
  if(lifeDhowGearMesh.instanceColor) lifeDhowGearMesh.instanceColor.needsUpdate = true;
})();
window._fishBoats = { n: LIFE_FISH_BOATS.length, piers: LIFE_FISH_PIERS.length, boats: LIFE_FISH_BOATS,
  /* diagnostic: everything a later pass (or a headless probe) needs to check
     the size/mooring re-tune without re-deriving it from the geometry */
  scale: LIFE_DHOW_SCALE, len: LIFE_DHOW_LEN, beam: LIFE_DHOW_BEAM,
  hullSpan: LIFE_DHOW_LEN*1.18,          /* stern -0.51*LEN to prow tip +0.67*LEN */
  slotT: [0.25,0.58,0.91], slotSide: [1,-1,1],
  gearInstances: LIFE_FISH_BOATS.length*LIFE_DHOW_GEAR_PER,
  /* live animation state, for a probe that wants one number per phase */
  phase: function(){ var o={docked:0,transitOut:0,fishing:0,transitIn:0,netsDown:0,laden:0};
    LIFE_FISH_BOATS.forEach(function(b){ o[b.state]++; if(b.net>0.5) o.netsDown++; if(b.catch>0.5) o.laden++; });
    return o; } };
/* owner: "add fishing boats (and all past and future life layer entities)
   to the pathing devtool". pathvizRegister() (87-pathviz.js) is a hoisted
   function declaration with a lazily-created registry, so a population can
   register itself HERE, where it is defined, instead of that file having to
   grow a hand-written case per population — which is exactly how the dhows
   came to be missing from it in the first place. This is the pattern every
   new life-layer population should copy: one call, next to its own
   window._* diagnostic. The pier each dhow works from is drawn as a post,
   so a dhow sitting at its mooring is still locatable when its route is
   momentarily empty. */
if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'fish', label:'Fishing dhow', color:0x46c8e6, seg:16, glow:5,
  entities: function(){ return LIFE_FISH_BOATS; },
  posts: function(){ return LIFE_FISH_PIERS.map(function(p){ return { x:p.tipX, y:SEA, z:p.tipZ }; }); },
  postR: 5
});

var lifeDhowTmpPos = new THREE.Vector3(), lifeDhowTmpDir = new THREE.Vector3();
var lifeDhowTmpQuat = new THREE.Quaternion(), lifeDhowTmpMat = new THREE.Matrix4();
var lifeDhowTmpScale1 = new THREE.Vector3(1,1,1);
var lifeDhowTmpScaleS = new THREE.Vector3(1,1,1);     /* the sail's own scale — furls independently of the hull */
var lifeDhowGearPos = new THREE.Vector3(), lifeDhowGearScale = new THREE.Vector3();
var lifeDhowGearMat = new THREE.Matrix4(), lifeDhowGearQuat = new THREE.Quaternion();
var lifeDhowRollQuat = new THREE.Quaternion(), LIFE_DHOW_FWD = new THREE.Vector3(0,0,1);
var lifeDhowCrewPos = new THREE.Vector3();
function lifeDhowEase(u){ u = u<0?0:(u>1?1:u); return u*u*(3-2*u); }
function lifeDhowMix(a,b,t){ return a + (b-a)*t; }

/* crew, now aware of what the boat is doing: the amidships hand works the
   rail while the nets are over the side, and the after hand crosses to the
   fish bin while the boat is unloading, both with a small vertical bob so
   they read as HAULING rather than as two statues that teleported. Seats are
   otherwise exactly where they were. */
function lifePlaceDhowCrew(baseIdx, pos, yaw, deckY, b, clock){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  var working = b.net > 0.02;
  var unloading = b.state === 'docked' && b.catch > 0.004;
  for(var s=0; s<LIFE_DHOW_SEATS.length; s++){
    var seat = LIFE_DHOW_SEATS[s];
    var lx = seat[0], lz = seat[1], dy = 0;
    if(s === 1 && working){
      lx = lifeDhowMix(seat[0], -LIFE_DHOW_BEAM*0.34, b.net);
      dy = Math.sin(clock*3.6 + baseIdx)*0.26*b.net;
    }else if(s === 2 && unloading){
      lx = lifeDhowMix(seat[0], LIFE_DHOW_BIN_X, b.catch);
      lz = lifeDhowMix(seat[1], LIFE_DHOW_BIN_Z - LIFE_DHOW_BIN_L*0.62, b.catch);
      dy = Math.sin(clock*3.0 + baseIdx)*0.30*b.catch;
    }
    var wx = pos.x + lx*cosY + lz*sinY;
    var wz = pos.z - lx*sinY + lz*cosY;
    lifeDhowCrewPos.set(wx, deckY+dy, wz);
    lifeDhowTmpMat.compose(lifeDhowCrewPos, lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowCrewMesh.setMatrixAt(baseIdx+s, lifeDhowTmpMat);
  }
}

/* one boat's five gear instances, all from the same unit box. `n` is the net
   deploy parameter (0 stowed, 1 shot), `cat` the bin fill. Every number below
   is boat-local: x across (+ starboard), y up from the hull's own origin
   (world SEA-0.15), z along (+ bow) — the same frame the hull parts and the
   seats are authored in, rotated into the world by the boat's yaw. */
var LIFE_DHOW_GEAR_Y0 = SEA - 0.15;   /* must track the hull's own mount height below */
function lifePlaceDhowGear(bi, pos, yaw, n, cat){
  var base = bi*LIFE_DHOW_GEAR_PER, S = LIFE_DHOW_SCALE;
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  /* `roll` tilts a part about the boat's own fore-and-aft axis (applied on
     the RIGHT of the yaw, so it is a local roll, not a world one). Only the
     net panels use it, and only while they are out: an upright box against
     the rail reads as a bulwark, the same box leaned top-inboard reads as a
     net hanging off a line, which is the whole point of the animation. */
  function put(slot, lx, ly, lz, sx, sy, sz, roll){
    lifeDhowGearPos.set(pos.x + lx*cosY + lz*sinY, LIFE_DHOW_GEAR_Y0 + ly, pos.z - lx*sinY + lz*cosY);
    lifeDhowGearScale.set(sx, sy, sz);
    lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw);
    if(roll) lifeDhowGearQuat.multiply(lifeDhowRollQuat.setFromAxisAngle(LIFE_DHOW_FWD, roll));
    lifeDhowGearMat.compose(lifeDhowGearPos, lifeDhowGearQuat, lifeDhowGearScale);
    lifeDhowGearMesh.setMatrixAt(base+slot, lifeDhowGearMat);
  }
  for(var k=0; k<2; k++){
    var sg = k ? 1 : -1;
    /* the net panel: a roll lying on the gunwale at n=0, a skirt swung out
       over the side and down through the surface at n=1. The deployed offset
       is deliberately barely clear of the rail (inner face 0.24 outboard of
       the gunwale's own outer face) — screenshot-driven: hung further out it
       stops reading as part of the boat and becomes a wall standing in the
       water beside it. Most of the visible height is ABOVE the rail, not
       below it, because the hull's freeboard is only ~0.19 above SEA: there
       is no room to show a net between the gunwale and the waterline, so
       what a viewer sees is the part still on the hauling line. */
    var px   = lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 0.35*S, n) * sg;
    var top  = lifeDhowMix(0.58*S,  1.30*S, n);
    var bot  = lifeDhowMix(0.14*S, -0.90*S, n);
    put(k*2, px, (top+bot)*0.5, -LIFE_DHOW_LEN*0.04,
        lifeDhowMix(0.55*S, 0.22*S, n), top-bot, lifeDhowMix(0.52, 0.64, n)*LIFE_DHOW_LEN,
        sg*0.24*n);
    /* the cork line: a small coil on the rail forward of the net at n=0, a
       pale line lying IN the water surface outboard of it at n=1. Sitting
       proud of SEA rather than centred on it, because the water is 96%
       opaque over a real fishing ground and a line centred on the surface
       shows only its top millimetres. */
    put(k*2+1, lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 1.75*S, n) * sg,
        lifeDhowMix(0.72*S, 0.25*S, n),
        lifeDhowMix(LIFE_DHOW_LEN*0.28, -LIFE_DHOW_LEN*0.02, n),
        lifeDhowMix(0.45*S, 0.34*S, n), lifeDhowMix(0.45*S, 0.34*S, n),
        lifeDhowMix(0.14, 0.80, n)*LIFE_DHOW_LEN);
  }
  /* the catch, heaped in the bin and proud of its rim when full */
  var h = Math.max(1e-4, cat*LIFE_DHOW_BIN_H*1.22);
  put(4, LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T + h*0.5, LIFE_DHOW_BIN_Z,
      LIFE_DHOW_BIN_W - LIFE_DHOW_BIN_T*2.4, h, LIFE_DHOW_BIN_L - LIFE_DHOW_BIN_T*2.4);
}

var LIFE_DHOW_DECK_Y = SEA + 0.70;
/* the fishing dwell is still the owner's own 15 seconds, unchanged — the net
   now simply spends the first and last few of those going over the side and
   coming back aboard, so the dwell is visibly bracketed rather than silent. */
var LIFE_DHOW_FISH_DWELL = 15;
var LIFE_DHOW_NET_DROP = 3.2;    /* shooting the net, at the start of the dwell */
var LIFE_DHOW_NET_HAUL = 4.0;    /* hauling it back in, at the end of it — the catch comes up with it */
var LIFE_DHOW_UNLOAD   = 6.0;    /* emptying the bin onto the pier, at the start of the next dock */
function updateFishBoats(dt){
  var clock = performance.now()*0.001;
  LIFE_FISH_BOATS.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.state === 'docked'){
      pos = b; yaw = b.ry;
      b.net = 0;
      /* unloading: whatever the boat came home with, handed ashore over the
         first LIFE_DHOW_UNLOAD seconds of the dock. unloadFrom is latched on
         arrival so an interrupted or re-entered dock can't refill the bin. */
      b.catch = b.unloadFrom * (1 - lifeDhowEase(b.stateT/LIFE_DHOW_UNLOAD));
      if(b.stateT >= b.dwell){
        var spot = lifeFishingSpot(b.home.x, b.home.z);
        b.fishX = spot[0]; b.fishZ = spot[1];
        b.curve = lifeBuildLegOpenWater(b.x, b.z, b.fishX, b.fishZ);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitOut'; b.stateT = 0;
        b.catch = 0; b.unloadFrom = 0;
      }
    }else if(b.state === 'fishing'){
      pos = b; yaw = b.ry;
      var ft = b.stateT, haulFrom = LIFE_DHOW_FISH_DWELL - LIFE_DHOW_NET_HAUL;
      if(ft < LIFE_DHOW_NET_DROP)      b.net = lifeDhowEase(ft/LIFE_DHOW_NET_DROP);
      else if(ft < haulFrom)           b.net = 1;
      else                             b.net = 1 - lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      b.catch = ft < haulFrom ? 0 : lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      if(b.stateT >= LIFE_DHOW_FISH_DWELL){   /* "after 15 seconds, they haul their nets up" — the owner's own exact number */
        b.net = 0; b.catch = 1;
        b.curve = lifeBuildLegOpenWater(b.fishX, b.fishZ, b.home.x, b.home.z);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitIn'; b.stateT = 0;
      }
    }else{
      b.net = 0;
      if(b.state === 'transitOut') b.catch = 0;
      var raw = Math.min(1, b.stateT/b.dur);
      var t = raw*raw*(3-2*raw);
      b.curve.getPointAt(t, lifeDhowTmpPos);
      pos = lifeDhowTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      b.curve.getTangentAt(tTan, lifeDhowTmpDir);
      yaw = Math.atan2(lifeDhowTmpDir.x, lifeDhowTmpDir.z);
      b.x = pos.x; b.z = pos.z; b.ry = yaw;
      if(raw >= 1){
        if(b.state === 'transitOut'){
          b.x = b.fishX; b.z = b.fishZ;
          b.state = 'fishing'; b.stateT = 0;
        }else{
          b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
          b.state = 'docked'; b.stateT = 0; b.dwell = rr(10, 26);
          b.unloadFrom = b.catch;   /* full hold, handed ashore over the next LIFE_DHOW_UNLOAD seconds */
        }
      }
    }
    /* pos may BE lifeDhowTmpPos (the curve sample, in the transit branch), so
       this rewrites y in place rather than allocating a fresh Vector3 per
       boat per frame the way this line used to; x and z are read out as
       arguments before the set lands, and neither changes. */
    lifeDhowTmpPos.set(pos.x, SEA-0.15, pos.z);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowHullMesh.setMatrixAt(bi, lifeDhowTmpMat);
    /* the sail drops with the nets. Free (the sail already has its own mesh
       and its own matrix) and the single most legible cue at any distance:
       a working boat is the one with its yard down. Scaling y about the
       hull's own origin collapses the lateen triangle into a bundle at the
       mast foot, which is exactly what a lowered yard looks like. */
    lifeDhowTmpScaleS.set(1, 1 - 0.86*b.net, 1);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat, lifeDhowTmpScaleS);
    lifeDhowSailMesh.setMatrixAt(bi, lifeDhowTmpMat);
    lifePlaceDhowCrew(bi*3, pos, yaw, LIFE_DHOW_DECK_Y, b, clock);
    lifePlaceDhowGear(bi, pos, yaw, b.net, b.catch);
  });
  lifeDhowHullMesh.instanceMatrix.needsUpdate = true;
  lifeDhowSailMesh.instanceMatrix.needsUpdate = true;
  lifeDhowCrewMesh.instanceMatrix.needsUpdate = true;
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
}

