/* ============================== standalone shrines (new) ====================
   Three more shrines, not tied to any canton or island: one on the eastern
   hill, one in the central district near Palace/Temple, one near the
   western market. Anchor points came from probing terrainH/zoneAt/openAt
   directly against a built voth.html, not guessed:
     east    ~(2450,-360)  h~264 — the RIDGES hill (10-core.js's own
                                    [1820,520,...] range extended east)
                                    past the walled city, clear of the
                                    Funerary district ([1800,100]-[2100,400])
     central ~(1005, 95)  h~11  — core-zoned mainland, the nearest open
                                    land to the Palace/Temple/Ancestry bay
                                    centre (Palace/Temple are canton
                                    platforms over open water, so "near"
                                    here means the closest real ground, not
                                    the water between them)
     west   ~(-1360, 661)  h~4  — the shorehut band right at Market F's
                                    own anchor point (shoreS(-1370,681),
                                    the same point that district's own poly
                                    is built from, a few lines above)
   Real bug found placing these: a fixed, hand-picked coordinate for the
   central site collided with claim()'s own gridHit twice in a row across
   two separate rebuilds, from OTHER passes in this same shared session
   (61-monastery.js, a gate-modelling pass) landing new buildings nearby
   between one build and the next — a static coordinate baked in from an
   earlier probe goes stale the moment anything upstream of this file
   changes. lifeFindShrineSite (below) fixes that at the source: it
   searches outward from the anchor in real rings, actually calling
   claim() at each candidate against whatever the REAL PLACED state is at
   THIS build, so it self-heals instead of silently dropping a site.

   Physical form: a hand-built twin of the ISLES i[4]==='shrine' island
   shrine's own silhouette (60-land.js's ISLETS pass: plinth, cella, dome,
   4 corner spires), not shrineTriptych (that is the small roadside form
   68-props.js places elsewhere) — the owner wants these read as the SAME
   kind of shrine as the two water ones. That pass lives in 60-land.js,
   off limits this session, so this reproduces the same shape through the
   ordinary BOX/DOME/FR3 kit rather than editing it. TONES (PAL.stone.common)
   for the stone, DOMEC for the dome — the same aliases every other
   building in this file already reads. */
reseed(655001);
function lifeStandaloneShrine(x, z, ry, rad){
  var y = terrainH(x, z);
  var col = pick(TONES);
  BOX(x, y, z, rad*0.86, 2.0, rad*0.86, ry, shade(col,-0.14));
  BOX(x, y+1.8, z, rad*0.52, 5, rad*0.52, ry+0.4, col);
  DOME(x, y+6.8, z, rad*0.24, rad*0.20, 0, pick(DOMEC), 'dome');
  for(var s=0; s<4; s++){
    var sa = ry + Math.PI/4 + s*Math.PI/2;
    FR3(x+Math.cos(sa)*rad*0.36, y+1.8, z+Math.sin(sa)*rad*0.36, 3.4, rr(11,17), 3.4, sa, col);
  }
  return { x:x, z:z, y:y, ry:ry };
}
/* searches outward from (anchorX,anchorZ) in rings (centre first, then
   10 points per ring at a growing radius) for a spot that is on land in
   the right height band, off the road mask, clear of the river, gently
   sloped, AND that claim() itself accepts — the only real test for "does
   this collide with a building", since gridHit isn't exposed on its own.
   Same spiral-search shape as lifeNavNearestOpen (78-life.js), applied to
   claim() instead of a nav-grid cell. */
function lifeFindShrineSite(anchorX, anchorZ, opt){
  opt = opt || {};
  var minH = (opt.minH != null) ? opt.minH : -1e9;
  var maxH = (opt.maxH != null) ? opt.maxH : 1e9;
  var maxSlope = (opt.maxSlope != null) ? opt.maxSlope : 9;
  var footprint = (opt.footprint != null) ? opt.footprint : 22;
  for(var ring=0; ring<28; ring++){
    var r = ring*20, tries = ring===0 ? 1 : 10;
    for(var t=0; t<tries; t++){
      var ang = (t/tries)*Math.PI*2 + ring*0.37;
      var x = anchorX + Math.cos(ang)*r, z = anchorZ + Math.sin(ang)*r;
      var h = terrainH(x,z);
      if(h < minH || h > maxH) continue;
      if(opt.requireCore && zoneAt(x,z) !== 'core') continue;
      if(inRiver(x,z,20)) continue;
      if(openAt(x,z)) continue;
      /* openAt() rejecting "open" ground is deliberate here (a shrine site
         wants to be tucked off the street front, not sitting in the
         middle of open buildable land) — but that "closed" ground also
         includes a ring/highway's own paved corridor, and nothing here
         ever told the two apart. ShrineCentral landed 7 units short of
         clearing the ring road next to Temple (found by a citywide
         ring/highway obstruction audit); this keeps the "off the open
         street front" search intact while still ruling out the corridor
         itself. */
      var nrh = nearestStreet(x, z, {ring:true, highway:true});
      /* footprint is already the HALF-extent on both axes (claim() above
         gets called with it as both fx and fz), so the worst-case corner
         reach from centre is Math.hypot(footprint,footprint), not a
         fraction of it — using 0.75*footprint here first still left
         ShrineCentral's actual built position 5 units short of clearing
         the ring road (audit re-check after the first fix landed). */
      if(nrh && nrh.dist < nrh.width*0.5 + Math.hypot(footprint,footprint)) continue;
      var hs = [terrainH(x+18,z), terrainH(x-18,z), terrainH(x,z+18), terrainH(x,z-18)];
      var slope = Math.max(Math.abs(hs[0]-h), Math.abs(hs[1]-h), Math.abs(hs[2]-h), Math.abs(hs[3]-h));
      if(slope > maxSlope) continue;
      var claimed = claim(x, z, footprint, footprint, opt.ry || 0, 'shrine');
      if(claimed) return { x:x, z:z };
    }
  }
  return null;
}
(function(){
  var sites = [
    { anchor:[2450,-360],  name:'ShrineEast',    face:[0,0],
      opt:{ minH:150, maxH:320, maxSlope:8 } },
    { anchor:[1005, 95],   name:'ShrineCentral', face:[CIDX['Temple'].x, CIDX['Temple'].z],
      opt:{ minH:5, maxH:40, maxSlope:6, requireCore:true, footprint:18 } },
    { anchor:[-1360, 661], name:'ShrineWest',    face:[-1370, 681],
      opt:{ minH:2, maxH:40, maxSlope:6 } }
  ];
  window._standaloneShrineDebug = [];
  sites.forEach(function(st){
    var ry = Math.atan2(st.face[0]-st.anchor[0], st.face[1]-st.anchor[1]);
    st.opt.ry = ry;
    var found = lifeFindShrineSite(st.anchor[0], st.anchor[1], st.opt);
    if(!found){ window._standaloneShrineDebug.push({name:st.name, ok:false}); return; }
    window._standaloneShrineDebug.push({name:st.name, ok:true, x:found.x, z:found.z});
    lifeStandaloneShrine(found.x, found.z, ry, (st.opt.footprint||22)*2.1);
    /* pushed to LIFE_SHRINE_STOPS only AFTER LIFE_SHRINE_ROUTE (just above)
       has already been computed from it — deliberate ordering, not an
       oversight: LIFE_SHRINE_ROUTE feeds the dedicated temple<->shrines
       FERRY (78-life.js), a boat that sails between stops, and these three
       are dry land — one of them a hilltop ~260 units above the lake —
       with no channel a boat could ever reach. Appending here instead
       means every OTHER consumer of LIFE_SHRINE_STOPS (LIFE_DOORS' shrine
       category, LIFE_CLERGY_POSTS' priest/templar posts, and
       82-daynight.js's night-light pass over LIFE_SHRINE_STOPS — all of
       which read the array fresh, well after this file finishes) picks
       these three up automatically and for free, while LIFE_SHRINE_ROUTE
       (already a fixed array by this point in file order) never sees them
       and the ferry keeps sailing to the original two island shrines only. */
    LIFE_SHRINE_STOPS.push({ x:found.x, z:found.z, ry:ry, name:st.name });
  });
})();

/* ============================== river-barge docks ===========================
   The owner: 7 river barges (up from 2), 1-2 docked and 5-6 in transit at
   any time, "give each one its own reserved dock to simplify things" — no
   more shared-quay contention logic (lifePickBargeDeparture/lifeShipOpenMobileDock,
   the ships' own pattern), each barge just cycles between ITS OWN dock and
   the far upstream limit independently. Built here (65, before 75's
   emitBuckets) for the same reason every other new pier in this file is:
   78-life.js runs after the static bake is already drained.
   Dock 0 reuses the real, existing RPIERS[0] (30-layout.js) outright — no
   new geometry. Docks 1-6 are new: 4 spread between the city and the
   owner's own upstream quad, then 2 sampled to land actually inside that
   quad ("spawn a couple more upstream... so we have enough") — real
   mooring points (a pair of bollards each), not a full jetty; the one
   place a real jetty belongs (the city's own river frontage) already has
   one in dock 0. */
var LIFE_RBARGE_QUAD = [[1785.2,1394.4],[1743.3,1447.7],[2116.9,1668.9],[2177.4,1593.6]];
var LIFE_RBARGE_DOCKS = [];
(function(){
  var total = RIVER_CUM[RIVER_CUM.length-1];
  var dockU0 = RIVER_HEAD + 30;   /* exactly RPIERS[0]'s own u */
  var qcx=0, qcz=0;
  LIFE_RBARGE_QUAD.forEach(function(p){ qcx+=p[0]; qcz+=p[1]; });
  qcx/=4; qcz/=4;
  var quadU = polyNear(qcx, qcz, RIVER, RIVER_CUM).t * total;
  /* the owner: "the river piers are also rending now, but perpendicular
     to how they ought to face" — real collision, not a broken formula:
     docks 1-4 below were spaced starting at dockU0 itself, the exact same
     u the 4 pre-existing RPIERS finger piers (30-layout.js, q=0..3 at
     dockU0, +58, +116, +174) occupy — dock 1 landed almost on top of
     RPIERS q=3, so its own quay wall (built along the BANK, correctly)
     visually crossed RPIERS' finger pier (built perpendicular, INTO the
     channel, also correctly) at a right angle, reading as one broken,
     wrongly-rotated structure. Starts the new docks' own u-range past
     RPIERS' full span (174) plus a clearance margin instead. */
  var clearU0 = dockU0 + 220;
  var us = [dockU0];
  for(var di=1; di<=4; di++) us.push(clearU0 + (quadU-clearU0)*di/6);
  var qMinX=Math.min(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMaxX=Math.max(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMinZ=Math.min(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  var qMaxZ=Math.max(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  for(var k=0; k<2; k++){
    var picked = null;
    for(var t2=0; t2<200; t2++){
      var x = rr(qMinX,qMaxX), z = rr(qMinZ,qMaxZ);
      if(pointInPoly(x, z, LIFE_RBARGE_QUAD)){ picked = [x,z]; break; }
    }
    if(!picked) picked = [qcx,qcz];
    us.push(polyNear(picked[0], picked[1], RIVER, RIVER_CUM).t * total);
  }
  us.forEach(function(u, di){
    var p = riverAt(u);
    var ry = Math.atan2(p.tx, p.tz);
    if(di === 0){
      LIFE_RBARGE_DOCKS.push({ x: RPIERS[0].bx, z: RPIERS[0].bz, ry: RPIERS[0].ry, u: u });
      return;
    }
    /* the owner: "new river docks appear to be sunk in the river" (first
       pass: r=0.7, top at SEA+2.0 — too small/subtle against a 50-unit
       barge) then, still, "river barge docks also seem to be sunk in the
       middle of the river" after thickening them. That second report is
       the real bug: `p` (riverAt(u)) is the river's own CENTRELINE, and
       this used to plant the whole dock — bollards AND the barge's own
       berth point — right on it, offset a token 8 units along the
       cross-channel normal. The channel here is 80-170+ units wide
       (riverHalf(), 30-layout.js), so 8 units off-centre is still
       stranded in open water, nowhere near either bank; nothing was
       "sunk", it just was never actually AT a dock site. Pushed out to
       riverHalf()'s own true city-bank edge (p.nx/p.nz — "the normal that
       points at the CITY side", riverAt's own doc comment) instead, with
       the two bollards spaced along the BANK (the tangent, p.tx/p.tz) to
       flank a moored barge's length, not across the current. */
    /* the owner, after the RPIERS-collision fix above: "the river piers
       are also rending now, but perpendicular to how they ought to face"
       — STILL true at the new u, but for a different reason: this never
       checked the chosen bank spot against anything already built there
       (a town building can stand anywhere the 60-land.js pass allowed,
       with no idea this loop would later want the same patch of bank) —
       what read as a second "wrong angle" pier was actually a building's
       own walls, diagonal in a top-down shot, sitting right on top of the
       new dock. Walks forward along the bank in u until claim() (the
       same clash test every other placement in the game already trusts)
       actually succeeds for the deck's own footprint. */
    var half, bx, bz, uTry = u, claimed = false;
    for(var uAttempt=0; uAttempt<24; uAttempt++){
      var p2 = riverAt(uTry);
      half = riverHalf(p2.x, p2.z);
      bx = p2.x + p2.nx*half; bz = p2.z + p2.nz*half;
      var ry2 = Math.atan2(p2.tx, p2.tz);
      /* claim() itself IS the "is this clear" test (it only mutates
         PLACED/the grid on success) — using it directly, rather than a
         separate read-only check, also permanently reserves the spot so
         nothing placed later can land on this dock either. */
      claimed = claim(bx, bz, 22, 6, ry2, 'rdock');
      if(claimed){ p = p2; break; }
      uTry = u + (uAttempt+1)*15;
    }
    ry = Math.atan2(p.tx, p.tz);
    /* the owner: "the river docks are missing piers... make sure they
       exist or render" — the bollards+crossbeam above were always real
       (mooring posts), but unlike the harbor/Port quays there was never
       an actual PLANK DECK here, just posts standing in open water with
       nothing connecting them to the bank — the same gap the north-Port
       "ghost galleon" dock had, fixed with a real deck there. Same fix
       here: a quay wall running ALONG the bank (ry — the same tangent
       direction the dock's own heading and the bollard spacing already
       use), not a finger pier poking into the channel, since a river
       barge moors alongside the bank, parallel to the current. Also
       registered in LIFE_EXTRA_PIERS so the nav-grid and every vehicle's
       own real-time avoidance actually know it's there. */
    BOX(bx, SEA+1.2, bz, 10, 1.4, 40, ry, 0x8a7659, 'wood');
    LIFE_EXTRA_PIERS.push({ x0: bx-p.tx*20, z0: bz-p.tz*20, x1: bx+p.tx*20, z1: bz+p.tz*20, w: 10 });
    [-1,1].forEach(function(sg){
      var px = bx + p.tx*sg*17, pz = bz + p.tz*sg*17;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 1.1, SEA+4.0-bh, 0, 0x6b5942, 'wood');
    });
    BOX(bx, SEA+3.6, bz, 1.0, 0.6, 34, ry, 0x5b4b38, 'wood');
    /* uTry, not u — the barge's own route (lifeRiverCurve(b.home.u,...))
       has to aim for wherever the clearance search above actually landed,
       not the original (possibly building-blocked) candidate u. */
    LIFE_RBARGE_DOCKS.push({ x: bx, z: bz, ry: ry, u: uTry });
  });
})();

