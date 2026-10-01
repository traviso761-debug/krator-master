/* ============================== big ships =================================
   The owner: 6 dedicated quays big enough for a large ship (3 at the Port
   canton, 3 along the mainland harbour), 4 animated ships cycling through
   them — arrive, dwell 15s, depart, sail off-map, wait 1-3x the transit
   time, sail back to a new open quay, repeat. The existing STATIC ships
   portDeckV2 (65-facade.js) already bakes into the scene are untouched —
   this is a wholly separate, moving set, same split as the canoes above.

   Second pass, per the owner: the moving ships should look like the
   existing static tallShip() caravels (65-facade.js) — aftcastle,
   forecastle, bowsprit, two masted sails — not the flat oversized barge
   the first pass drew, and they should sail to/from the real north inlet
   (where the shore polyline's own two traced ends meet the open strait,
   15-shore.js) rather than each quay's own locally-guessed "out to sea"
   direction. That local-direction approach was ALSO the thing that kept
   crossing land no matter how the search was tuned (see the old fix
   history, since replaced) — heading everyone for one real, always-open
   gateway sidesteps the whole problem rather than patching it further.

   The quay decks/bollards themselves ARE genuinely static, unlike the
   ships, so they go through the normal box|wood/cyl|wood BUCKET combos —
   zero new draw calls for those (both combos already live). Only the 4
   moving ships cost new draw calls, 2 total (merged hull+deck+masts, and
   sails, each one InstancedMesh for all 4 ships) — tallied in
   BUDGET.drawCalls (05-palette.js) alongside the canoes' 2. ------------ */
var LIFE_QUAYS = [];
(function(){
  /* three along the mainland harbour shore (HARB_S0..HARB_S1, 30-layout.js) —
     a short pier out to a berth in real water, same box|wood/cyl|wood
     combo the canton piers (cantonPiers(), 50-cantons.js) already use.
     faceX/faceZ is DOCKING orientation only now (which way the hull
     points while tied up) — actual sailing routes all head for the one
     shared north inlet, below, not this direction. */
  for(var i=0;i<3;i++){
    var s = mix(HARB_S0, HARB_S1, (i+0.5)/3);
    var n = shoreNorm(s), p = shoreAt(s);
    var pierLen = 50;
    var berthX = p[0]-n[0]*pierLen, berthZ = p[1]-n[1]*pierLen;
    LIFE_QUAYS.push({ x: berthX, z: berthZ, faceX: -n[0], faceZ: -n[1], region: 'harbor', occupiedBy: null });
    var midX = p[0]-n[0]*pierLen*0.5, midZ = p[1]-n[1]*pierLen*0.5;
    var ryPier = Math.atan2(-n[1], n[0]);
    BOX(midX, SEA+1.2, midZ, 9, 1.4, pierLen*1.05, ryPier, 0x8a7659, 'wood');
    /* the owner: "the harbor and port canton piers aren't registering for
       collision detection, ships slide right through them" — true, this
       loop's own deck never went into any obstacle list the nav-grid (or
       ships' own lifeBuildLeg) checks. LIFE_EXTRA_PIERS (65-facade.js,
       already wired into lifeNavBlocked) is the same list the ferry-stop
       piers use; pushing here too, then building the grid AFTER this
       whole IIFE runs (see lifeNavBuildGrid's own call site below), gets
       these into it for free. */
    LIFE_EXTRA_PIERS.push({ x0: p[0], z0: p[1], x1: berthX, z1: berthZ, w: 9 });
    for(var k=6; k<pierLen; k+=13){
      [-1,1].forEach(function(sg){
        var px = p[0]-n[0]*k + (-n[1])*sg*4.6, pz = p[1]-n[1]*k + (n[0])*sg*4.6;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.9, SEA+1.6-bh, 0, 0x6b5942, 'wood');
      });
    }
  }
  /* three at the Port canton's own shore-facing side — the one face
     portDeckV2's own random pier loop always skips (it keeps that side
     clear for the customs house), so this is genuinely open space, not a
     fight for room with the existing static piers on the other 3 faces. */
  var port = CIDX['Port'];
  if(port){
    var lp = shoreIn(port.s, 26), sl = Math.hypot(lp[0]-port.x, lp[1]-port.z) || 1;
    var sdx = (lp[0]-port.x)/sl, sdz = (lp[1]-port.z)/sl;
    var qy = 6.5;
    /* real, pre-existing bug the owner caught directly (visible as a
       docked ship sitting inside the Port canton) — this used to place
       the quay at a flat port.r*2.06/2+35 (~177 units from centre) for
       EVERY face, regardless of what's actually sitting at that bearing.
       Port carries its own static quay ring that extends physically
       past the canton's own base-platform edge (confirmed directly for
       the stationary-ship docks above: 32 units past lifeCantonEdge
       still landed ON that quay deck; +85 was what actually cleared it,
       verified by screenshot) — 177 units wasn't even past the bare
       canton edge (~147.7) by enough to clear that ring, let alone dock
       outside it, so a ship assigned this quay rendered clipped into
       the canton. Uses the same lifeCantonEdge()+85 formula already
       proven sufficient here instead of a separate, smaller guess. */
    for(var f=0; f<4; f++){
      var a = f*Math.PI/2, fx = Math.cos(a), fz = Math.sin(a);
      if(fx*sdx + fz*sdz > 0.5) continue;
      var edge = lifeCantonEdge(port, fx, fz);
      var bx = edge[0] + fx*85, bz = edge[1] + fz*85;
      LIFE_QUAYS.push({ x:bx, z:bz, faceX:fx, faceZ:fz, region:'port', occupiedBy: null });
      /* the owner: a galleon "phased into" this dock with "no texture" and
         "spawned in the middle" — the quay POSITION (above) was correct
         (verified: 232.7 units from Port's centre, matching the +85-past-
         edge formula), but unlike the 'harbor' quays above, this loop only
         ever built two bare mooring posts — no deck. A ship "docked" here
         was floating in open water beside two bollards, nothing to
         visually tie it to, which is what read as wrong/ghostly. Give it
         a real plank quay, same construction and datum (SEA+1.2) as the
         harbor piers, running from the canton edge out to the berth. */
      var qlen = 95;
      var qmidX = edge[0] + fx*qlen*0.5, qmidZ = edge[1] + fz*qlen*0.5;
      var ryQuay = Math.atan2(fx, fz);
      BOX(qmidX, SEA+1.2, qmidZ, 12, 1.4, qlen, ryQuay, 0x8a7659, 'wood');
      LIFE_EXTRA_PIERS.push({ x0: edge[0], z0: edge[1], x1: edge[0]+fx*qlen, z1: edge[1]+fz*qlen, w: 12 });
      [-1,1].forEach(function(sg){
        var px = bx + (-fz)*sg*9, pz = bz + (fx)*sg*9;
        CYL(px, qy, pz, 1.2, 3.6, 0, 0x5b4b38, 'wood');
      });
    }
  }
})();

/* the real north inlet — the shore polyline's own two traced ends
   (15-shore.js: "the coast is not a closed loop inside the map — it
   leaves through the strait at the north... s runs from the north-west
   map edge... round the bay, and back up to the north-east"). Their
   midpoint is the one place every ship can head for that is guaranteed
   open water leading off the map, so it doubles as both the waypoint to
   steer for and the disappear/reappear point — no separate "how far out
   is off-map" guess needed. */
var LIFE_NORTH_INLET = (function(){
  var a = shoreAt(0), b = shoreAt(SLEN);
  return [ (a[0]+b[0])/2, (a[1]+b[1])/2 ];
})();

/* ---- ship visuals, 4th attempt — a dark-elven JUNK, not a European
   galleon. The owner, explicitly: a galleon silhouette "doesn't really
   fit dark elves" — deleted that model (and its static tallShip() prop
   twin, 65-facade.js) entirely rather than re-skin it, and built this
   from junk-specific proportions instead: a boxy, flat-bottomed hull
   (junks are NOT keeled/tapered like a Western hull), a high, near-
   vertical squared-off transom stern with a stepped "pagoda" deckhouse
   (the single most junk-specific silhouette feature — nothing in
   tallShip() had an equivalent), and a sharp added bow wedge (the
   owner's own explicit ask, sharper than a real junk's usual blunt/
   spoon bow). 2 masts, each visibly RAKED (tilted fore/aft) — real junk
   masts are, and unlike the old kit-based tallShip() (limited to a
   single per-instance yaw), this geometry is hand-built so a genuine
   rotateZ tilt costs nothing extra. Sails are lavender battened
   lugsails: one flat panel plus a few darker horizontal batten strips,
   both baked as vertex colours into the SAME sail mesh (no extra draw
   call) the same way the crew figures' skin/hair already are. */
/* real bug fixed here, both reported by the owner directly:
   1) "the pointy bow is underwater" — the bow cone's Y-translate (-2.0)
      was a leftover guess, not derived from the hull box it's supposed
      to seamlessly extend from. SHAPES.box() is BASE-anchored (y=0 is
      the bottom, see threejs-pitfalls.md), so a box translated to y0
      with height H is actually CENTRED at y0+H/2, not at y0. The hull's
      own true vertical centre is LIFE_JUNK_HULL_Y + LIFE_JUNK_HULL_H/2
      — computed explicitly below and reused for the bow, instead of a
      second, independently-guessed number that silently drifted from
      the hull as its own numbers changed.
   2) "the ridges don't align on the sails" — same base-vs-centre
      confusion in lifeJunkSail() below, PLUS a sign error (the raked
      mast leans one way, the sail's translate offset used the other).
      The panel ended up floating about half its own height above where
      it should start; the battens (computed from a different, ad hoc
      formula) didn't share that error, so they no longer overlapped the
      panel they were supposed to be lines across. Replaced with one
      alongMast(h) helper both the panel and every batten call, so they
      are geometrically guaranteed to agree.
   Also: LIFE_SHIP_SCALE is new — the owner: "I'd like them to be a
   little bit bigger too" — one multiplier applied to every absolute
   (non length/beam-relative) constant in this section, so the hull,
   masts, sails and crew anchors all grow together instead of just LEN/
   BEAM (which would have made a longer, wider, but not taller ship). */
var LIFE_SHIP_SCALE = 1.18;
var LIFE_SHIP_LEN = 34*LIFE_SHIP_SCALE, LIFE_SHIP_BEAM = 11*LIFE_SHIP_SCALE;
/* the owner hand-marked two separate pools of berths (polygons, see
   LIFE_SHIP_STATIONARY_POLYS/LIFE_SHIP_MOBILE_POLYS below): 4 permanent
   "prop" ships that never move, plus a 5-ship mobile pool that cycles
   through 7 possible berths. Both pools share one hull/crew instance
   range — mobile ships occupy indices 0..4, stationary props 5..8 — so
   LIFE_SHIP_N (mesh capacity) is the total, not just the mobile count. */
var LIFE_SHIP_MOBILE_N = 5;
var LIFE_SHIP_STATIONARY_N = 4;
var LIFE_SHIP_N = LIFE_SHIP_MOBILE_N + LIFE_SHIP_STATIONARY_N;
var LIFE_JUNK_HULL_COL = 0x2c2116;     /* dark wood, the owner's own ask */
var LIFE_JUNK_SAIL_COL = 0xa494c9;     /* lavender */
var LIFE_JUNK_BATTEN_COL = 0x4d4058;   /* darker panel lines across each sail */
/* ---- the Fortress coast guard's ONE bespoke hull ------------------------
   owner: "make a custom [junk] for the coast guard - it's a junk, but
   black, with a sharply pointed bow sprit that sticks out of the water,
   and one green and one gold sail. it is crewed by ordinators", then "to
   avoid confusion, it is a junk, not a dhow" and "can use the junk model
   as a base". So: the junk above, re-coloured and re-rigged — NOT a new
   model, and deliberately NOT in lifeShipKind()'s random junk/galleon
   pool (this is one named vessel, not a fleet type).

   HOW IT COSTS ZERO DRAW CALLS. A black hull with one green and one gold
   sail cannot be an instanceColor tint: instanceColor multiplies the whole
   instance uniformly, and this ship needs THREE different colours moving
   in three different directions from the stock junk's. It also needs
   geometry the stock junk does not have (the bowsprit). Both would
   normally mean a second InstancedMesh — a draw call this session has
   three of left, with another agent spending from the same pool.
   Instead the shared junk geometry carries TWO extra vertex attributes:
     cgColor — the coast guard's colour for that vertex
     cgVis   — 0 both variants, 1 coast-guard only, 2 ordinary-junk only
   and the mesh carries one per-INSTANCE float, aCGuard (0/1). The vertex
   shader picks the colour with a mix() and collapses the wrong variant's
   vertices to the local origin (degenerate = rasterizes nothing). Same
   "one shared mesh serves every instance" principle the mill rig and the
   night-lantern mesh already use, just along the colour axis as well as
   the transform one. Cost: one extra instance on an existing mesh, plus
   ~120 triangles of bowsprit shared by all 10 slots.

   PALETTE: promoted to PAL.cguard — see that entry in 05-palette.js for why
   the green and the gold in particular had to stop being local scalars (both
   were already the same hex typed out in two files: the green is what
   ordinatorFortress() and this dock's own signal flag fly in 65-facade.js,
   the gold is lifeOrdHullParts' helm/shield). The vessel wears its crew's
   colours, so those two must not be free to drift apart. The names below are
   kept as the local handles this section reads. */
var LIFE_CG_HULL_COL     = PAL.cguard.hull;        /* black — a trace of brown so it reads as tarred timber, not a hole in the scene */
var LIFE_CG_TRIM_COL     = PAL.cguard.trim;        /* gold rubbing strake along the sheer */
var LIFE_CG_SAIL_GREEN   = PAL.cguard.sailGreen;   /* the order's banner green */
var LIFE_CG_SAIL_GOLD    = PAL.cguard.sailGold;    /* the ordinators' own gold */
var LIFE_CG_BATTEN_GREEN = PAL.cguard.battenGreen;
var LIFE_CG_BATTEN_GOLD  = PAL.cguard.battenGold;
var LIFE_JUNK_HULL_H = 4.2*LIFE_SHIP_SCALE, LIFE_JUNK_HULL_Y = -2.6*LIFE_SHIP_SCALE;
var LIFE_JUNK_MAST_BASE_Y = 0.4*LIFE_SHIP_SCALE;
var lifeShipHullParts = [
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM, LIFE_JUNK_HULL_H, LIFE_SHIP_LEN*0.80).translate(0, LIFE_JUNK_HULL_Y, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* main hull — boxy, flat-bottomed, not tapered */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.94, 0.8*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.78).translate(0, 0.0, -LIFE_SHIP_LEN*0.03), color: LIFE_JUNK_HULL_COL },  /* deck plank */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.92, 5.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.08).translate(0, 0.2*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.42), color: LIFE_JUNK_HULL_COL },  /* high squared transom stern */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.70, 2.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.20).translate(0, 3.4*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.32), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 1 */
  { geo: SHAPES.box().scale(LIFE_SHIP_BEAM*0.48, 1.9*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.13).translate(0, 5.6*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.33), color: LIFE_JUNK_HULL_COL },  /* aft deckhouse, tier 2 — the "pagoda" step */
];
/* sharp bow wedge — same 4-sided-cone trick as the previous hull, kept
   because it worked, made more pronounced (a real junk's bow is blunt;
   the owner explicitly asked for sharp here). Cross-section matched to
   the main hull box at the seam (z = LEN*0.37, hull's own front edge)
   AND at the hull's own true vertical centre (see comment above). */
var LIFE_JUNK_BOW_Y = LIFE_JUNK_HULL_Y + LIFE_JUNK_HULL_H/2;
lifeShipHullParts.push({
  geo: new THREE.ConeGeometry(1, LIFE_SHIP_LEN*0.16, 4).rotateX(Math.PI/2)
        .scale(LIFE_SHIP_BEAM*0.5, LIFE_JUNK_HULL_H/2, 1).translate(0, LIFE_JUNK_BOW_Y, LIFE_SHIP_LEN*0.37 + LIFE_SHIP_LEN*0.08),
  color: LIFE_JUNK_HULL_COL
});
/* masts: both raked (rotateZ — a real per-part tilt, not something the
   old kit-based ship could ever have done). Foremast rakes forward,
   mainmast (the taller of the two, set back toward centre) rakes aft —
   the classic junk-rig look. */
var LIFE_JUNK_FOREMAST_H = 13*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H = 18*LIFE_SHIP_SCALE;
var LIFE_JUNK_FOREMAST_Z = LIFE_SHIP_LEN*0.20, LIFE_JUNK_MAINMAST_Z = -LIFE_SHIP_LEN*0.06;
var LIFE_JUNK_FOREMAST_RAKE = 0.10, LIFE_JUNK_MAINMAST_RAKE = -0.07;
lifeShipHullParts.push(
  { geo: SHAPES.cyl().scale(0.26*LIFE_SHIP_SCALE, LIFE_JUNK_FOREMAST_H, 0.26*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_FOREMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_FOREMAST_Z), color: LIFE_JUNK_HULL_COL },
  { geo: SHAPES.cyl().scale(0.32*LIFE_SHIP_SCALE, LIFE_JUNK_MAINMAST_H, 0.32*LIFE_SHIP_SCALE).rotateZ(LIFE_JUNK_MAINMAST_RAKE).translate(0, LIFE_JUNK_MAST_BASE_Y, LIFE_JUNK_MAINMAST_Z), color: LIFE_JUNK_HULL_COL }
);
/* 3 cargo crates, roughly where tallShip()'s own opt.cargo||3 loop put
   them — generated ONCE (not re-randomised every frame). */
for(var lifeShipCargoI=0; lifeShipCargoI<3; lifeShipCargoI++){
  var lifeShipCx = rr(-2.6,2.6)*LIFE_SHIP_SCALE, lifeShipCz = LIFE_SHIP_LEN*rr(-0.20,0.10);
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(rr(1.6,2.6)*LIFE_SHIP_SCALE, rr(1.3,2.2)*LIFE_SHIP_SCALE, rr(1.6,2.6)*LIFE_SHIP_SCALE).rotateY(rr(-0.3,0.3)).translate(lifeShipCx, LIFE_JUNK_MAST_BASE_Y, lifeShipCz),
    color: pick([0x5a4a38, 0x6a5642, 0x4f4030]),
    cg: 2   /* deck cargo: a trader carries it, a patrol vessel does not */
  });
}
/* ---- the coast guard's own geometry (cg:1 — collapsed away on the other
   nine junks). THE BOWSPRIT is the whole point of the silhouette: the
   owner wants it "sharply pointed" and "sticking out of the water", i.e.
   a spar that leaves the stem ABOVE the waterline and rakes up and
   forward clear of it, not another cutwater below it. Built as the same
   4-sided cone the bow wedge above uses (so its facets line up with the
   wedge's), scaled slender, raked up by LIFE_CG_SPRIT_RAKE and seated at
   the stem head.

   Every number is derived from the hull's own, never guessed — the
   pitfall this file already paid for twice ("the pointy bow is
   underwater"): SHAPES/ConeGeometry are CENTRE-anchored after the
   rotateX, so the spar is positioned by its own midpoint, computed from
   the root and tip it is supposed to run between. */
var LIFE_CG_SPRIT_LEN  = LIFE_SHIP_LEN*0.62;              /* ~24.9 — reads at distance, which is the ask */
var LIFE_CG_SPRIT_RAKE = 0.13;                            /* ~7.4 deg nose-up: the tip lifts clear of the water */
var LIFE_CG_SPRIT_Z0   = LIFE_SHIP_LEN*0.30;              /* root, just aft of the bow wedge's own seam */
var LIFE_CG_SPRIT_Y0   = LIFE_JUNK_MAST_BASE_Y + 1.0*LIFE_SHIP_SCALE;   /* stem head: above the deck, well above SEA */
var LIFE_CG_SPRIT_TIPZ = LIFE_CG_SPRIT_Z0 + LIFE_CG_SPRIT_LEN*Math.cos(LIFE_CG_SPRIT_RAKE);
var LIFE_CG_SPRIT_TIPY = LIFE_CG_SPRIT_Y0 + LIFE_CG_SPRIT_LEN*Math.sin(LIFE_CG_SPRIT_RAKE);
lifeShipHullParts.push(
  { geo: new THREE.ConeGeometry(1, LIFE_CG_SPRIT_LEN, 4).rotateX(Math.PI/2)
          .scale(0.44*LIFE_SHIP_SCALE, 0.44*LIFE_SHIP_SCALE, 1)
          .rotateX(-LIFE_CG_SPRIT_RAKE)
          .translate(0, (LIFE_CG_SPRIT_Y0+LIFE_CG_SPRIT_TIPY)*0.5, (LIFE_CG_SPRIT_Z0+LIFE_CG_SPRIT_TIPZ)*0.5),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },
  /* the knee that carries it off the stem — without this the spar reads as
     floating in front of the bow rather than growing out of it */
  { geo: SHAPES.box().scale(0.9*LIFE_SHIP_SCALE, 2.6*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.10)
          .translate(0, LIFE_JUNK_MAST_BASE_Y - 1.4*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.33),
    color: LIFE_CG_HULL_COL, color2: LIFE_CG_HULL_COL, cg: 1 },
  /* a gold band at the sprit's own root, and a gold rubbing strake down
     each side of the sheer: the state-vessel markings that keep a wholly
     black hull from reading as a silhouette with no detail in it */
  /* SHAPES.box() is BASE-anchored, so the band is seated by subtracting its
     own half-height from the spar's real centreline height at that z —
     the same base-vs-centre slip that put this ship's bow underwater once
     already. No rotateX on it: rotating a base-anchored box about the
     world origin moves it as well as tilting it, and 7 degrees on a collar
     this small is invisible anyway. */
  { geo: SHAPES.box().scale(1.05*LIFE_SHIP_SCALE, 1.05*LIFE_SHIP_SCALE, 0.9*LIFE_SHIP_SCALE)
          .translate(0, LIFE_CG_SPRIT_Y0 + 1.4*Math.tan(LIFE_CG_SPRIT_RAKE) - 0.525*LIFE_SHIP_SCALE,
                     LIFE_CG_SPRIT_Z0 + 1.4),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1 }
);
[-1,1].forEach(function(sg){
  lifeShipHullParts.push({
    geo: SHAPES.box().scale(0.30*LIFE_SHIP_SCALE, 0.55*LIFE_SHIP_SCALE, LIFE_SHIP_LEN*0.72)
          .translate(sg*LIFE_SHIP_BEAM*0.50, LIFE_JUNK_MAST_BASE_Y - 0.55*LIFE_SHIP_SCALE, -LIFE_SHIP_LEN*0.03),
    color: LIFE_CG_TRIM_COL, color2: LIFE_CG_TRIM_COL, cg: 1
  });
});
/* everything above that did not name its own coast-guard colour is hull:
   black. One loop instead of a second colour argument on thirteen
   already-written part literals, so the stock junk's own numbers stay
   exactly as they were and this cannot silently drift from them. */
lifeShipHullParts.forEach(function(p){ if(p.color2 === undefined) p.color2 = LIFE_CG_HULL_COL; });
/* battened lugsails — a flat raked panel per mast plus 3 thin darker
   batten strips, baked into the SAME geometry via vertex colour, the
   full-length ribbed look a junk sail is known for that a Western
   yard-hung sail never has. alongMast(h) walks the mast's OWN raked
   axis from its real base (LIFE_JUNK_MAST_BASE_Y, matching the mast
   geometry above exactly) — both the panel and every batten call this
   same function, so panel and battens are geometrically guaranteed to
   agree on where the mast actually is at any given height. */
/* cgSail/cgBatten: the SAME panel, worn in the coast guard's colours on
   the one instance that flies them (see the cg-variant note above). The
   owner asked for "one green and one gold sail" and the junk rig has
   exactly two masts, so it is one colour per mast, no choice to make
   beyond which way round: green on the main (the bigger sail, and the
   order's own banner colour, which the dock beside it already flies) and
   gold on the fore. */
function lifeJunkSail(mastH, mastZ, rake, beam, cgSail, cgBatten){
  var sinR = Math.sin(rake), cosR = Math.cos(rake);
  function alongMast(h){ return [ -h*sinR, LIFE_JUNK_MAST_BASE_Y + h*cosR, mastZ ]; }
  var panelBase = 1.6*LIFE_SHIP_SCALE, panelH = mastH*0.62;
  var parts = [];
  var pb = alongMast(panelBase);
  parts.push({
    geo: SHAPES.box().scale(0.10*LIFE_SHIP_SCALE, panelH, beam*0.90).rotateZ(rake).translate(pb[0], pb[1], pb[2]),
    color: LIFE_JUNK_SAIL_COL, color2: cgSail
  });
  for(var bi=1; bi<=3; bi++){
    var bp = alongMast(panelBase + panelH*(bi/4));
    parts.push({
      geo: SHAPES.box().scale(0.13*LIFE_SHIP_SCALE, 0.18*LIFE_SHIP_SCALE, beam*0.92).rotateZ(rake).translate(bp[0], bp[1], bp[2]),
      color: LIFE_JUNK_BATTEN_COL, color2: cgBatten
    });
  }
  return parts;
}
var lifeShipSailParts = []
  .concat(lifeJunkSail(LIFE_JUNK_FOREMAST_H, LIFE_JUNK_FOREMAST_Z, LIFE_JUNK_FOREMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GOLD,  LIFE_CG_BATTEN_GOLD))
  .concat(lifeJunkSail(LIFE_JUNK_MAINMAST_H, LIFE_JUNK_MAINMAST_Z, LIFE_JUNK_MAINMAST_RAKE, LIFE_SHIP_BEAM, LIFE_CG_SAIL_GREEN, LIFE_CG_BATTEN_GREEN));
/* hull+sails merged into ONE InstancedMesh (was 2 separate meshes/draw
   calls) — freed a draw call for the galleon hull below without
   raising the budget. Same vertex-colour trick, just more parts sharing
   it: hull is one flat colour, sails a different one, all baked in. */
var lifeShipAllParts = lifeShipHullParts.concat(lifeShipSailParts);
var lifeShipHullGeo = lifeMergeGeoms(lifeShipAllParts);
/* ---- the coast-guard variant attributes (see LIFE_CG_* above for why
   this is two attributes on a shared mesh rather than a second mesh).
   Walks the SAME parts array lifeMergeGeoms() just walked, counting
   vertices exactly the way it does (geometry.index when present, raw
   attribute order when not — the indexed-vs-flat trap that once drew
   every vehicle in this file as stray wedges), so the two attribute
   buffers are guaranteed to line up with the positions they annotate.

   .convertSRGBToLinear() on every coast-guard colour: emitBuckets()
   (45-kit.js) does it for the static bake, so the dock's own green signal
   flag ten metres away IS converted — a sail meant to match it that
   skipped the conversion would render visibly paler than the flag on the
   same structure. (The stock junk's own colours are left exactly as they
   were, unconverted: matching THEM is not the job, and changing them
   would restyle nine ships nobody asked about.) */
function lifeShipVariantAttrs(geo, parts){
  var n = geo.attributes.position.count;
  var c2 = new Float32Array(n*3), vis = new Float32Array(n), at = 0, tmp = new THREE.Color();
  parts.forEach(function(entry){
    var g = entry.isBufferGeometry ? entry : entry.geo;
    var cnt = g.index ? g.index.count : g.attributes.position.count;
    tmp.set(entry.color2 !== undefined ? entry.color2 : (entry.color !== undefined ? entry.color : 0xffffff));
    tmp.convertSRGBToLinear();
    var v = entry.cg || 0;
    for(var i=0;i<cnt;i++){
      c2[(at+i)*3] = tmp.r; c2[(at+i)*3+1] = tmp.g; c2[(at+i)*3+2] = tmp.b;
      vis[at+i] = v;
    }
    at += cnt;
  });
  geo.setAttribute('cgColor', new THREE.Float32BufferAttribute(c2, 3));
  geo.setAttribute('cgVis',   new THREE.Float32BufferAttribute(vis, 1));
  return at === n;   /* false would mean the two walks disagreed — reported, never guessed at */
}
var LIFE_CG_ATTRS_OK = lifeShipVariantAttrs(lifeShipHullGeo, lifeShipAllParts);
/* the owner: "we can put some waviness back in the sails of the sailing
   ships too" — the static kit's own cloth sway (CLOTH_TIME/
   applyClothSway, 45-kit.js) only ever hooks materials built through the
   static BUCKET/emit pipeline; these hull meshes are hand-built
   InstancedMeshes entirely outside that system, so they never got it.
   Reuses the same clock (CLOTH_TIME, already ticking every frame in
   80-camera.js) and the same onBeforeCompile trick, but gated by the
   merged mesh's own absolute local Y via smoothstep instead of
   applyClothSway's (1-position.y)^2 — there's no single 0..1-normalized
   space here the way one cloth BOX has, since hull and sails share one
   merged, unnormalized geometry. Below yLo (hull/deckhouse) stays rigid;
   above yHi (sail) gets full sway; the two thresholds are picked per
   hull below, tuned to each ship's own geometry (junk vs. galleon have
   very different mast heights). */
function applyShipSailSway(sh, yLo, yHi, amp){
  sh.uniforms.uWindTime = CLOTH_TIME;
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uWindTime;');
  /* the owner: "the swaying of the sails seems to happen too fast... it
     was fine the way it was before (similar to the banners)" — this used
     custom amplitudes (0.6/0.25) nearly 4x applyClothSway's own (0.16/
     0.07, 45-kit.js) at the SAME frequencies (1.6/2.7), which reads as
     faster even though the timing is identical — bigger swings at a
     fixed frequency look more energetic/hurried to the eye. Reusing
     applyClothSway's exact amplitudes now, with `amp` only a small (1-2x)
     scale for the bigger sail rather than the ~3-5x it was. */
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  float _swayPhase = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453) * 6.28318;\n' +
    '  float _swayMask = smoothstep(' + yLo.toFixed(2) + ', ' + yHi.toFixed(2) + ', position.y);\n' +
    '  float _sway = (sin(uWindTime * 1.6 + _swayPhase) * 0.16 + sin(uWindTime * 2.7 + _swayPhase * 1.3) * 0.07) * ' + amp.toFixed(2) + ';\n' +
    '  transformed.x += _sway * _swayMask;\n' +
    '  transformed.z += _sway * _swayMask;\n' +
    '#endif\n');
}
/* the coast-guard variant, in the shader. Two edits, both additive:
     1. after <color_vertex> (never INSIDE it — that chunk's contents differ
        between THREE releases and a string-replace of it is a trap), fade
        vColor to the coast guard's own colour for this instance;
     2. after the sway block, collapse whichever variant's vertices this
        instance is not. transformed *= 0.0 puts every vertex of those
        triangles on the same point, i.e. zero area, i.e. nothing drawn —
        and that point is the hull's own origin, buried inside it, so even
        a driver that rasterized it would show nothing.
   Applied AFTER applyShipSailSway so the collapse is the last word: the
   sway adds to transformed.x/z, and doing these the other way round would
   let it nudge a collapsed vertex back off the point.
   Junk material only — the galleon shares applyShipSailSway but not this,
   and its geometry has no cg attributes at all. */
function applyCGuardVariant(sh){
  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nattribute vec3 cgColor;\nattribute float cgVis;\nattribute float aCGuard;');
  sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>',
    '#include <color_vertex>\n' +
    '#ifdef USE_COLOR\n  vColor.xyz = mix(vColor.xyz, cgColor, aCGuard);\n#endif\n');
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '  float _cgKeep = (cgVis < 0.5) ? 1.0 : ((cgVis < 1.5) ? aCGuard : (1.0 - aCGuard));\n' +
    '  transformed *= _cgKeep;\n');
}
var lifeShipHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeShipHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 6.0, 10.0, 1.6); applyCGuardVariant(sh); };
lifeShipHullMat.customProgramCacheKey = function(){ return 'shipsway-junk-cg'; };
/* one extra slot on the existing mesh, for the one coast-guard hull. It is
   NOT a LIFE_SHIPS entry: nothing in lifeShipKind()/lifePickDeparture/
   updateShips may ever see it, because it is a named vessel with its own
   berth and its own patrol, not a member of the merchant pool. */
var LIFE_SHIP_CG_IDX = LIFE_SHIP_N;
var LIFE_SHIP_HULL_N = LIFE_SHIP_N + 1;
var lifeShipHullMesh = new THREE.InstancedMesh(lifeShipHullGeo, lifeShipHullMat, LIFE_SHIP_HULL_N);
lifeShipHullMesh.userData.life = true; lifeShipHullMesh.userData.inspectLabel = 'Ship hull';
lifeShipHullMesh.frustumCulled = false;
/* seeded HERE, at construction, not at first use: the shader program is
   compiled with or without an attribute's path at FIRST RENDER, and this
   file has already shipped a population that rendered pure white forever
   because its per-instance input only appeared at frame time. */
(function(){
  var a = new Float32Array(LIFE_SHIP_HULL_N);
  a[LIFE_SHIP_CG_IDX] = 1;
  lifeShipHullGeo.setAttribute('aCGuard', new THREE.InstancedBufferAttribute(a, 1));
})();
scene.add(lifeShipHullMesh);

/* ---- the galleon: the ORIGINAL harbour ship asset (60-land.js's own
   SHIPS.forEach, from the project's very first massing pass) imported
   into the life layer instead of re-designed — the owner: "it might be
   nice to have one or two be there and get the sailing behavior",
   "look at the original harbor dock asset and its dependencies". Every
   number below is transcribed from that block verbatim (segmented
   tapered hull via FR6, sheer curve, stern, bow post, 2-3 masts each
   with 3 yards/sails) — same reuse-the-actual-generator approach as the
   junk's own hull (SHAPES.fr6()/.box()/.cyl(), all base-anchored, so
   the original's absolute y-arguments transcribe directly as translate
   offsets with no re-derivation). Necessarily FIXED to one representative
   len/beam/mast-count (an InstancedMesh needs one shared geometry across
   every instance) rather than SHIPS.forEach's own per-instance rr()/ri()
   — picked at the middle of each original range. The original's 'cloth'
   sail family swayed in the wind (CLOTH_TIME, applyClothSway,
   45-kit.js) — that hook only exists for the static kit's own
   onBeforeCompile path; life-layer materials don't have it wired up, so
   these sails are static, matching the junk's own (also static) sails
   rather than adding a one-off shader hookup for just this mesh. */
var LIFE_GALLEON_LEN = 58, LIFE_GALLEON_BEAM = 14, LIFE_GALLEON_MASTS = 2;
/* the owner: "barges and galleons look distinctly pale grey compared to
   the junks. make them a similar brown hull color" — 0x5c4b38 is a real,
   valid mid-brown on paper, but reads washed-out/grey next to the junk's
   own much darker, more saturated 0x2c2116 (LIFE_JUNK_HULL_COL) under
   this scene's lighting. Matched to it directly rather than guessing at
   another mid-tone that might wash out the same way. */
var LIFE_GALLEON_HULL_COL = 0x2c2116;
var lifeGalleonHullParts = [];
(function(){
  var L = LIFE_GALLEON_LEN, B = LIFE_GALLEON_BEAM, col = LIFE_GALLEON_HULL_COL;
  var nseg = 9;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = L*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.78));
    var bw = B*(0.30 + 0.70*taper);
    var sheer = 1.0 + 0.55*Math.pow(Math.abs(t-0.46)*2, 2.2);
    lifeGalleonHullParts.push(
      { geo: SHAPES.fr6().scale(bw*1.34, 8.6*sheer, L/nseg*1.1).translate(0, -4.4, lz), color: shade(col, (i%2)?0.04:0) },
      { geo: SHAPES.box().scale(bw*0.95, 1.0, L/nseg*1.05).translate(0, -4.4+8.6*sheer, lz), color: shade(col, -0.2) }
    );
  }
  lifeGalleonHullParts.push(
    { geo: SHAPES.box().scale(B*0.80, 6.5, L*0.20).translate(0, 5.2, -L*0.40), color: shade(col, 0.10) },   /* stern */
    { geo: SHAPES.cyl().scale(0.7, 9, 0.7).translate(0, 4.2, L*0.54), color: shade(col, 0.05) }              /* bow post */
  );
  for(var m=0; m<LIFE_GALLEON_MASTS; m++){
    var tm = (m+0.55)/(LIFE_GALLEON_MASTS+0.35);
    var mz = L*(0.36 - tm*0.76);
    var mh = 40 - m*6;
    lifeGalleonHullParts.push({ geo: SHAPES.cyl().scale(0.82, mh, 0.82).translate(0, 4.6, mz), color: 0x5b4b38 });
    /* pick(SAILC) — the legacy ship's own original pale canvas palette
       (0xcfc2a3..0xa89878), transcribed faithfully. Swapped out for a
       saturated custom ochre earlier this session chasing a reported
       "ghostly/colourless" galleon; the owner: "the galleons can have
       their color scheme back" — reverted, that wasn't (or wasn't fully)
       the actual fix for whatever they were seeing. */
    var sailCol = pick(SAILC), prevFrac = 0.05;
    [0.30, 0.55, 0.78].forEach(function(fr, k){
      var yw = B*(2.0-k*0.45);
      lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw, 0.7, 1.1).translate(0, 4.6+mh*fr, mz), color: 0x5b4b38 });
      var loY = 4.6+mh*prevFrac+0.6, hiY = 4.6+mh*fr-0.5, sailH = hiY-loY;
      /* was chance(0.78) per tier — the owner: "I think the galleon is
         missing a sail as well." Real reason: this geometry is built
         ONCE and shared by every galleon instance (one InstancedMesh,
         one merged template) — a chance() roll here isn't "some galleons
         sometimes go out light," it's "every single galleon in the scene
         is permanently missing the exact same yard," decided once at
         page load and baked in for good. Always render it. */
      if(sailH > 3){
        lifeGalleonHullParts.push({ geo: SHAPES.box().scale(yw*0.84, sailH, 0.35).translate(0, loY, mz), color: sailCol });
      }
      prevFrac = fr;
    });
  }
})();
var lifeGalleonHullGeo = lifeMergeGeoms(lifeGalleonHullParts);
var lifeGalleonHullMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
lifeGalleonHullMat.onBeforeCompile = function(sh){ applyShipSailSway(sh, 10.0, 16.0, 2.0); };
lifeGalleonHullMat.customProgramCacheKey = function(){ return 'shipsway-galleon'; };
var lifeGalleonHullMesh = new THREE.InstancedMesh(lifeGalleonHullGeo, lifeGalleonHullMat, LIFE_SHIP_N);
lifeGalleonHullMesh.userData.life = true; lifeGalleonHullMesh.userData.inspectLabel = 'Galleon hull';
lifeGalleonHullMesh.frustumCulled = false;
scene.add(lifeGalleonHullMesh);

/* ---- 5 drow crew per ship (the owner's own ask, both for these and
   for the old design), walking a small patrol loop on deck. Own
   InstancedMesh, own draw call (BUDGET.drawCalls raised 40->41 in
   05-palette.js, documented there). LIFE_SHIP_N now covers BOTH the
   active cycling ships and the stationary dockside ones (below) — one
   pool, one model, exactly the owner's ask that stationary ships "be
   the SAME MODEL... as the mobile ships". */
var LIFE_SHIP_CREW_PER = 5;
var lifeShipPeopleMesh = new THREE.InstancedMesh(lifePersonGeoWhite,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_SHIP_N*LIFE_SHIP_CREW_PER);
lifeShipPeopleMesh.userData.life = true; lifeShipPeopleMesh.userData.inspectLabel = 'Ship crew';
lifeShipPeopleMesh.frustumCulled = false;
scene.add(lifeShipPeopleMesh);
/* fixed patrol anchors: helm (aft), 2 amidships (working the masts), bow
   lookout, one more amidships — each wanders a small ellipse around its
   own anchor, phase-staggered so a ship's 5 crew don't walk in lockstep.
   A function of the hull's own length, not a fixed array, since the
   junk and galleon are very different lengths (and very different deck
   heights — see LIFE_SHIP_DECK_Y below) but share this same crew rig. */
function lifeShipCrewAnchors(len){
  return [
    [0, -len*0.30], [-2.6, -len*0.14], [2.6, len*0.02],
    [-2.2, len*0.20], [0, len*0.34]
  ];
}
var LIFE_SHIP_CREW_ANCHORS = { junk: lifeShipCrewAnchors(LIFE_SHIP_LEN), galleon: lifeShipCrewAnchors(LIFE_GALLEON_LEN) };
/* on-deck Y per kind — junk's deck sits at LIFE_JUNK_MAST_BASE_Y (~0.47);
   the galleon's own upper-deck BOX segments land around y=4.2 at
   midship (-4.4 + 8.6*sheer, sheer=~1 near the hull's own centre) —
   transcribed from the same numbers the hull segments above use, not a
   separate guess. */
var LIFE_SHIP_DECK_Y = { junk: LIFE_JUNK_MAST_BASE_Y, galleon: 4.2 };

/* ---- berths: the owner hand-marked these directly as polygons (one per
   berth, drawn alongside the real pier that berth sits next to) rather
   than have this file keep guessing at quay math — see the file's own
   history of ghost galleons and clipped hulls above for why that kept
   going wrong. Position is just the polygon's own centroid (guaranteed
   inside for a convex quad); orientation comes from the polygon's own
   LONGEST edge, which the owner drew running parallel to that pier — "long
   axis parallel to nearest pier" falls straight out of that, no separate
   pier lookup needed, and centering inside a polygon the owner already
   drew clear of the pier deck satisfies "not overlapping" the same way. */
function lifeShipPolyDock(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  cx/=poly.length; cz/=poly.length;
  var bestLen=-1, bestDx=1, bestDz=0;
  for(var i=0;i<poly.length;i++){
    var a=poly[i], b=poly[(i+1)%poly.length];
    var dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz);
    if(len>bestLen){ bestLen=len; bestDx=dx/len; bestDz=dz/len; }
  }
  return { x: cx, z: cz, ry: Math.atan2(bestDx, bestDz) };
}
var LIFE_SHIP_STATIONARY_POLYS = [
  [[1218.3,-1487.1],[1218.9,-1577.1],[1248.7,-1577.0],[1242.4,-1484.5]],
  [[733.5,-513.7],[722.6,-477.2],[617.9,-499.2],[632.7,-535.9]],
  [[1345.8,-1361.9],[1346.7,-1401.1],[1457.8,-1394.5],[1457.2,-1360.7]],
  [[1351.9,-1246.4],[1347.5,-1217.8],[1431.8,-1217.9],[1430.5,-1245.6]]
];
var LIFE_SHIP_MOBILE_POLYS = [
  [[775.7,-1067.9],[854.4,-975.9],[821.9,-954.8],[739.7,-1034.0]],
  [[687.5,-980.5],[662.6,-922.6],[801.7,-865.8],[820.4,-906.6]],
  [[637.8,-804.5],[629.5,-747.8],[767.8,-727.7],[778.8,-777.7]],
  [[588.2,-736.2],[581.6,-685.2],[758.9,-665.6],[763.5,-710.1]],
  [[978.4,-1245.7],[866.3,-1244.0],[870.9,-1200.1],[979.3,-1202.0]],
  [[982.8,-1358.3],[881.1,-1354.9],[881.2,-1382.9],[977.1,-1378.3]],
  [[1109.1,-1597.1],[1107.9,-1482.9],[1063.8,-1485.3],[1064.2,-1598.1]]
];
var LIFE_SHIP_STATIONARY_DOCKS = LIFE_SHIP_STATIONARY_POLYS.map(lifeShipPolyDock);
var LIFE_SHIP_MOBILE_DOCKS = LIFE_SHIP_MOBILE_POLYS.map(function(poly){
  var d = lifeShipPolyDock(poly); d.occupiedBy = null; return d;
});
function lifeShipOpenMobileDock(){
  var open = [];
  LIFE_SHIP_MOBILE_DOCKS.forEach(function(d,i){ if(d.occupiedBy === null) open.push(i); });
  return open.length ? pick(open) : null;
}
/* a real docking/undocking manoeuvre instead of a straight line to/from
   the berth — the owner: "when ships depart, they float out and away
   from the dock until they are clear, then turn toward the inlet and
   make sail" (arrival is the mirror: a straight final "slide into
   position"). The pull-out point is perpendicular to the berth's own
   long axis.

   SIDE was picked purely by "farther from the bay's own centre"
   (LIFE_BAY_CENTER, 65-facade.js) — the owner's own report ("ferries...
   sometimes they do a 180 about face unrealistically instead of backing
   out to sea - this may relate to the lack of collision detection")
   points straight at this: that heuristic knows nothing about the real
   pier the ship is tied up alongside, so it could just as easily send
   the "clear point" straight through that pier's own deck, and whatever
   detour the route-builder then had to take around it is what likely
   read as an unrealistic spin. Now checks the real nav-grid obstacle
   data (lifeNavBlocked — includes cantons, land, AND every real pier,
   see that function) first: if one side is actually clear and the other
   isn't, take the clear one outright; only fall back to the bay-centre
   guess when the grid can't tell the two sides apart. */
function lifeShipClearPoint(dock, dist){
  var perp = dock.ry + Math.PI/2;
  var ox = Math.sin(perp), oz = Math.cos(perp);
  var p1x = dock.x+ox*dist, p1z = dock.z+oz*dist;
  var p2x = dock.x-ox*dist, p2z = dock.z-oz*dist;
  var b1 = lifeNavBlocked(p1x, p1z), b2 = lifeNavBlocked(p2x, p2z);
  if(b1 !== b2) return b1 ? [p2x,p2z] : [p1x,p1z];
  var d1 = Math.hypot(p1x-LIFE_BAY_CENTER.x, p1z-LIFE_BAY_CENTER.z);
  var d2 = Math.hypot(p2x-LIFE_BAY_CENTER.x, p2z-LIFE_BAY_CENTER.z);
  return d1 >= d2 ? [p1x,p1z] : [p2x,p2z];
}
/* the owner: "the harbor and port canton piers aren't registering for
   collision detection, the incoming and departing ships slide right
   through them" — true: the main leg of a ship's journey used
   lifeBuildLeg, which only ever checks CANTONS (lifeCantonBlocked), never
   a single pier. Switched to lifeNavBuildLeg (the real A*-over-a-grid
   router ferries already use, which DOES know about every pier — see
   lifeNavBlocked) for that main leg; it falls back to lifeBuildLeg itself
   if A* can't find a route at all, so this can only ever do as well or
   better, never worse. */
function lifeShipDepartCurve(dock, toX, toZ){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(clear[0], clear[1], toX, toZ);
  var pts = main.getPoints(24);
  var wp = [[dock.x,dock.z], clear];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  return lifeCurveFromCentripetal(wp);
}
function lifeShipArriveCurve(fromX, fromZ, dock){
  var clear = lifeShipClearPoint(dock, 42);
  var main = lifeNavBuildLeg(fromX, fromZ, clear[0], clear[1]);
  var pts = main.getPoints(24);
  var wp = [];
  pts.forEach(function(p){ wp.push([p.x,p.z]); });
  wp.push(clear); wp.push([dock.x,dock.z]);
  return lifeCurveFromCentripetal(wp);
}
/* NOW build the nav grid (lifeNavBuildGrid, declared way up near
   lifeNavBlocked) — every obstacle source that function reads (LIFE_QUAYS'
   harbor/port pier decks, LIFE_SHIP_STATIONARY_DOCKS just above) exists by
   this point in file order; ships' own first route, built in the
   LIFE_SHIPS IIFE right below, needs the grid actually filled in before
   it runs lifeNavBuildLeg. */
lifeNavBuildGrid();
/* ---- schedule: the owner's own detailed relay spec, replacing the old
   independent-random-timer version ("less randomness... fine while we
   debug other systems"). 5 mobile ships: one sails in on screen at load
   (idx 0), one starts fully off-map (idx 1), three start pre-docked at
   distinct random open berths (idx 2-4, 50/50 junk/galleon each). Every
   ship gets `original:true`/`everDeparted:false` — lifePickDeparture
   below reads these to prefer an original ship that hasn't had its first
   voyage yet, before falling back to "least recent arrival" once all 4
   originals have gone out at least once. Ship 1 (the off-map one) is
   deliberately left with no dock/curve yet — it's spawned in for real by
   the halfway-point trigger in updateShips, the first time any ship
   departs. */
var LIFE_SHIPS = [];
var LIFE_SHIP_T = 0;                    /* the ships' own clock, advanced in updateShips */
var LIFE_SHIP_DEPART_AT = null;         /* sim time the next scheduled departure fires, or null = none pending */
var LIFE_SHIP_PENDING_DEPARTURE = null; /* which ship object that departure is for */
function lifeShipKind(){ return chance(0.5) ? 'junk' : 'galleon'; }
(function(){
  var idxs = LIFE_SHIP_MOBILE_DOCKS.map(function(_,i){ return i; });
  for(var s=idxs.length-1; s>0; s--){ var j = Math.floor(rnd()*(s+1)); var tmp=idxs[s]; idxs[s]=idxs[j]; idxs[j]=tmp; }
  /* ship 0: sailing in from the same verified-visible spawn point as
     before, to whichever open berth the shuffle gave it first. */
  var d0 = LIFE_SHIP_MOBILE_DOCKS[idxs[0]]; d0.occupiedBy = 0;
  var curve0 = lifeShipArriveCurve(227.0, -923.8, d0);
  LIFE_SHIPS.push({
    state: 'arriving', dockIdx: idxs[0], kind: lifeShipKind(), curve: curve0, len: curve0.getLength(),
    speed: rr(14,20), stateT: 0, original: true, everDeparted: false
  });
  LIFE_SHIPS[0].dur = Math.max(20, LIFE_SHIPS[0].len/LIFE_SHIPS[0].speed);
  /* ship 1: off-map, spawned for real once ship 0's first departure is
     halfway to the inlet (updateShips). kind is chosen then, not here. */
  LIFE_SHIPS.push({ state:'away', dockIdx:null, kind:null, speed: rr(14,20), stateT:0, original:true, everDeparted:false });
  /* ships 2-4: pre-docked at 3 more distinct open berths. */
  for(var m=0; m<3; m++){
    var di = idxs[2+m];
    var dock = LIFE_SHIP_MOBILE_DOCKS[di];
    dock.occupiedBy = 2+m;
    LIFE_SHIPS.push({
      state:'docked', dockIdx: di, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry,
      speed: rr(14,20), lastArrivalTime: rr(-1,1), stateT:0, original:true, everDeparted:false
    });
  }
  /* stationary props: fixed forever at their own hand-marked berths,
     never enter the mobile cycle — lifePickDeparture excludes
     sh.stationary outright, same as the earlier (now-replaced)
     auto-placed version did. */
  LIFE_SHIP_STATIONARY_DOCKS.forEach(function(dock){
    LIFE_SHIPS.push({ state:'docked', stationary:true, kind: lifeShipKind(), x: dock.x, z: dock.z, ry: dock.ry, stateT:0 });
  });
})();
window._ships = { count: LIFE_SHIPS.length, mobileN: LIFE_SHIP_MOBILE_N, stationaryN: LIFE_SHIP_STATIONARY_N, mobileDocks: LIFE_SHIP_MOBILE_DOCKS.length, inlet: LIFE_NORTH_INLET };
window._lifeShips = LIFE_SHIPS;   /* diagnostic: full state, incl. each ship's .curve */

/* departure selection — the owner's own two-phase rule: "any one of the
   original ships that haven't left yet" while any remain (random among
   them), THEN "the least recent arriving ship" forever after once all 4
   originals have had their first voyage. Stationary ships are excluded
   outright — nothing may ever pick them to depart. */
function lifePickDeparture(){
  var freshOriginals = LIFE_SHIPS.filter(function(sh){
    return sh.state === 'docked' && !sh.stationary && sh.original && !sh.everDeparted;
  });
  if(freshOriginals.length) return pick(freshOriginals);
  var best = null;
  LIFE_SHIPS.forEach(function(sh){
    if(sh.state !== 'docked' || sh.stationary) return;
    if(!best || sh.lastArrivalTime < best.lastArrivalTime) best = sh;
  });
  return best;
}
var LIFE_SHIP_UP = new THREE.Vector3(0,1,0);
var lifeShipTmpPos = new THREE.Vector3(), lifeShipTmpDir = new THREE.Vector3(), lifeShipTmpPos2 = new THREE.Vector3();
var lifeShipTmpQuat = new THREE.Quaternion(), lifeShipTmpMat = new THREE.Matrix4();
var lifeShipTmpScale1 = new THREE.Vector3(1,1,1), lifeShipTmpScale0 = new THREE.Vector3(0,0,0);
var lifeShipCrewTmpPos = new THREE.Vector3(), lifeShipCrewTmpMat = new THREE.Matrix4();
/* place/hide this ship's 5 crew: each wanders a small ellipse around its
   own fixed deck anchor (LIFE_SHIP_CREW_ANCHORS), phase-staggered by
   ship+slot index so nobody walks in lockstep, hidden entirely while the
   ship is 'away' (off the map — there is nothing to stand on). */
function lifeShipPlaceCrew(idx, visible, shipPos, shipQuat, kind){
  var baseIdx = idx*LIFE_SHIP_CREW_PER;
  var anchors = LIFE_SHIP_CREW_ANCHORS[kind];
  var deckY = LIFE_SHIP_DECK_Y[kind];
  for(var s=0; s<LIFE_SHIP_CREW_PER; s++){
    if(visible){
      var anchor = anchors[s];
      var ang = LIFE_SHIP_T*0.5 + idx*2.1 + s*1.7;
      var lx = anchor[0] + Math.sin(ang)*1.1;
      var lz = anchor[1] + Math.cos(ang*0.6)*0.7;
      lifeShipCrewTmpPos.set(lx, deckY, lz).applyQuaternion(shipQuat).add(shipPos);
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos, shipQuat, lifeShipTmpScale1);
    }else{
      lifeShipCrewTmpMat.compose(lifeShipCrewTmpPos.set(0,0,0), shipQuat, lifeShipTmpScale0);
    }
    lifeShipPeopleMesh.setMatrixAt(baseIdx+s, lifeShipCrewTmpMat);
  }
}
/* two hull meshes now (junk, galleon) sharing one LIFE_SHIPS pool —
   every ship index must get a matrix written to BOTH meshes every
   frame: the one matching sh.kind gets the real transform, the other
   gets scaled to 0. An index never written defaults to that
   InstancedMesh's identity matrix (visible at the origin), not hidden —
   so the "other" mesh needs an explicit hide, not just a skip. */
function lifeShipHullMeshFor(kind){ return kind === 'galleon' ? lifeGalleonHullMesh : lifeShipHullMesh; }
function lifeShipHideBoth(idx){
  lifeShipTmpMat.compose(lifeShipTmpPos.set(0,0,0), lifeShipTmpQuat.identity(), lifeShipTmpScale0);
  lifeShipHullMesh.setMatrixAt(idx, lifeShipTmpMat);
  lifeGalleonHullMesh.setMatrixAt(idx, lifeShipTmpMat);
}
/* ships occupy the tail of the shared local-avoidance arrays (declared
   in the ferry section below, after LIFE_SHIP_N is known — same
   file-order reason canoes/ferries' own arrays live there). Priority 3,
   the highest of the three: the owner: "they have right of way over
   small ships - small ships should go out of their way to avoid them
   and less so vice versa" — see lifeAvoidNudge's own give-way weighting. */
function updateShips(dt){
  LIFE_SHIP_T += dt;
  LIFE_SHIPS.forEach(function(sh, idx){
    sh.stateT += dt;
    var avoidSlot = LIFE_AVOID_SHIP0 + idx;
    if(sh.state === 'docked'){
      lifeShipTmpPos.set(sh.x, SEA-0.3, sh.z);
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.ry);
      LIFE_AVOID_X[avoidSlot] = sh.x; LIFE_AVOID_Z[avoidSlot] = sh.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;
    }else if(sh.state === 'away'){
      LIFE_AVOID_R[avoidSlot] = 0;   /* off the map — not an obstacle for anyone */
      lifeShipHideBoth(idx);
      lifeShipPlaceCrew(idx, false, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
      return;
    }else{
      /* 'departing' or 'arriving': move along sh.curve (built by
         lifeShipDepartCurve/lifeShipArriveCurve above — float straight
         out/in near the berth, routed the rest of the way). Anticipatory
         avoidance + turn-rate-limited heading, same fix as the ferries'
         own (see that comment) but slower to turn — a big hull doesn't
         snap onto a new heading — and sensed farther ahead, since it
         needs more warning to react at all. */
      var raw = Math.min(1, sh.stateT / sh.dur);
      var t = raw*raw*(3-2*raw);
      sh.curve.getPointAt(t, lifeShipTmpPos);
      var tTan = Math.min(0.995, Math.max(0.005, t));
      sh.curve.getTangentAt(tTan, lifeShipTmpDir);
      var tanYaw = Math.atan2(lifeShipTmpDir.x, lifeShipTmpDir.z);

      var sdelta = lifeAvoidNudge2(avoidSlot, lifeShipTmpPos.x, lifeShipTmpPos.z, lifeShipTmpDir.x, lifeShipTmpDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
      lifeShipTmpPos.x += sdelta[0]; lifeShipTmpPos.z += sdelta[1];

      if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
      if(sh.lastX === undefined){ sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z; }
      var mdx = lifeShipTmpPos.x-sh.lastX, mdz = lifeShipTmpPos.z-sh.lastZ;
      var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
      var dAng = moveYaw - sh.facingYaw;
      while(dAng > Math.PI) dAng -= Math.PI*2;
      while(dAng < -Math.PI) dAng += Math.PI*2;
      var maxStep = LIFE_SHIP_TURN_RATE*dt;
      sh.facingYaw += Math.max(-maxStep, Math.min(maxStep, dAng));
      lifeShipTmpQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
      sh.lastX = lifeShipTmpPos.x; sh.lastZ = lifeShipTmpPos.z;

      LIFE_AVOID_X[avoidSlot] = lifeShipTmpPos.x; LIFE_AVOID_Z[avoidSlot] = lifeShipTmpPos.z; LIFE_AVOID_R[avoidSlot] = LIFE_SHIP_AVOID_R;

      /* the owner's relay: "when [the departing ship] reaches the
         halfway point to the inlet, the off map ship spawns at the
         inlet" — there is always exactly one ship in 'away' at a time
         by construction (one leaves 'away' here exactly when one enters
         it below, on departure-complete), so no queue is needed, just
         find it. */
      if(sh.state === 'departing' && !sh.halfwayTriggered && raw >= 0.5){
        sh.halfwayTriggered = true;
        var awayShip = null;
        LIFE_SHIPS.forEach(function(s){ if(s.state === 'away') awayShip = s; });
        if(awayShip){
          var di2 = lifeShipOpenMobileDock();
          if(di2 !== null){
            var dock2 = LIFE_SHIP_MOBILE_DOCKS[di2];
            dock2.occupiedBy = LIFE_SHIPS.indexOf(awayShip);
            awayShip.kind = lifeShipKind();
            awayShip.dockIdx = di2;
            awayShip.curve = lifeShipArriveCurve(LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1], dock2);
            awayShip.len = awayShip.curve.getLength();
            awayShip.dur = Math.max(20, awayShip.len/awayShip.speed);
            awayShip.state = 'arriving'; awayShip.stateT = 0;
          }
        }
      }

      if(raw >= 1){
        if(sh.state === 'arriving'){
          var dock3 = LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx];
          sh.state = 'docked'; sh.x = dock3.x; sh.z = dock3.z; sh.ry = dock3.ry;
          sh.lastArrivalTime = LIFE_SHIP_T; sh.stateT = 0;
          /* "another ship departs 15 seconds later" — every arrival, not
             just the first, re-arms the loading timer. */
          var depPick = lifePickDeparture();
          if(depPick){ LIFE_SHIP_PENDING_DEPARTURE = depPick; LIFE_SHIP_DEPART_AT = LIFE_SHIP_T + 15; }
        }else{
          if(sh.dockIdx !== null) LIFE_SHIP_MOBILE_DOCKS[sh.dockIdx].occupiedBy = null;
          sh.dockIdx = null;
          sh.state = 'away'; sh.stateT = 0;
        }
      }
    }
    lifeShipTmpMat.compose(lifeShipTmpPos, lifeShipTmpQuat, lifeShipTmpScale1);
    lifeShipHullMeshFor(sh.kind).setMatrixAt(idx, lifeShipTmpMat);
    lifeShipPlaceCrew(idx, true, lifeShipTmpPos, lifeShipTmpQuat, sh.kind);
    lifeShipTmpMat.compose(lifeShipTmpPos2.set(0,0,0), lifeShipTmpQuat, lifeShipTmpScale0);
    lifeShipHullMeshFor(sh.kind === 'galleon' ? 'junk' : 'galleon').setMatrixAt(idx, lifeShipTmpMat);
  });
  if(LIFE_SHIP_DEPART_AT !== null && LIFE_SHIP_T >= LIFE_SHIP_DEPART_AT && LIFE_SHIP_PENDING_DEPARTURE){
    var dep = LIFE_SHIP_PENDING_DEPARTURE;
    if(dep.state === 'docked'){
      var dock = LIFE_SHIP_MOBILE_DOCKS[dep.dockIdx];
      dep.curve = lifeShipDepartCurve(dock, LIFE_NORTH_INLET[0], LIFE_NORTH_INLET[1]);
      dep.len = dep.curve.getLength();
      dep.dur = Math.max(20, dep.len/dep.speed);
      dep.everDeparted = true;
      dep.halfwayTriggered = false;
      dep.state = 'departing'; dep.stateT = 0;
    }
    LIFE_SHIP_DEPART_AT = null; LIFE_SHIP_PENDING_DEPARTURE = null;
  }
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
  lifeGalleonHullMesh.instanceMatrix.needsUpdate = true;
  lifeShipPeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== the Fortress coast guard ==================
   One vessel, the black junk built as a variant of the shared junk
   geometry above (see LIFE_CG_* there for the colours and the bowsprit).
   This block is only its BEHAVIOUR: where it lies and where it goes.

   WHERE IT LIES. LIFE_CGUARD_BERTHS (65-facade.js) — the mooring records
   the Fortress canton's new north dock published for exactly this hull,
   the same builder-fills/consumer-reads hand-off LIFE_RBARGE_DOCKS uses.
   The berth is chosen by MEASURING the hull against each record's own
   len, not by assuming the first one fits:
     hull, transom to bow wedge tip   LIFE_SHIP_LEN*0.99  = 39.7
     north berth  len 44  ->  fits
     west  berth  len 36  ->  does not
   so it takes the north berth, lying along the berthing head's outboard
   face. Its BEAM is the one number that does not have slack: the hull is
   LIFE_SHIP_BEAM = 12.98 wide against a berth sized for 11, but the berth
   centreline is 6.5 from the head's fender strake and the hull's own
   half-beam is 6.49 — it lies against the fender with 0.01 to spare,
   which is what alongside means. The BOWSPRIT deliberately overhangs the
   berth (tip 36.7 forward of the hull's centre vs. the berthing head's
   own 23-unit half-length): it projects past the head's east end into
   open water at 3.5-4.9 above the waterline, clear of the deck, the
   bollards and the signal mast, which is exactly what a bowsprit does and
   is the silhouette the owner asked to be able to read at a distance.

   WHETHER IT PATROLS. It patrols, and the existing machinery makes that
   nearly free: lifeShipDepartCurve/lifeShipArriveCurve already do a real
   pull-out-then-turn undocking manoeuvre, and lifeNavBuildLeg is the same
   A*-over-the-obstacle-grid router the ferries use — it already knows
   every canton, pier, chinampa bed and bridge pylon in the bay
   (lifeNavBlocked), so the circuit cannot be routed through any of them.
   What it deliberately does NOT reuse is LIFE_SHIPS' own relay schedule:
   that pool cycles ships off-map through the north inlet at z=-5128, and
   a coast guard that spends most of its cycle 4,000 units off the top of
   the map is not guarding a coast. This vessel never leaves: it works a
   closed beat across the northern approach to the Fortress and comes
   home to the same berth.

   WHERE THE BEAT IS. An ellipse in the open water north of the dock
   (measured first, not chosen: the nav grid is clear from the dock head
   out past 520 units on every bearing except the 45-135 deg arc, which is
   the Fortress canton itself). Every sampled point is then re-checked
   against lifeNavBlocked/inRiver/depth and pushed radially away from the
   canton until it is clear, and any point that will not clear is dropped;
   under 5 survivors and the vessel simply stays moored rather than
   sailing a route nobody verified — the fallback rule this file learned
   the hard way when an obstacle-unaware straight line walked twenty
   ordinators across the bay. */
var LIFE_CG_CREW_N  = 5;      /* ordinators; folded into LIFE_ORD_N further down, so they cost no new mesh and get the reserved lantern slots for free */
var LIFE_CG_DWELL   = 90;     /* seconds alongside between patrols */
var LIFE_CG_SPEED   = 12;     /* cruise: under a merchantman's 14-20, a patrol keeps station rather than races */
var LIFE_CG_PATROL_A = 420, LIFE_CG_PATROL_B = 210;   /* the beat's semi-axes: long across the approach, shallow in depth */
var LIFE_CG_PATROL_OFF = 280;                          /* how far north of the berth its centre sits */
var LIFE_CG_PATROL_PTS = 12;
/* the hull's real extent, read off the geometry constants above rather
   than measured by eye — transom rear face to bow-wedge tip, then the
   same again including the bowsprit */
var LIFE_CG_HULL_AFT = -LIFE_SHIP_LEN*0.46;
var LIFE_CG_HULL_FWD =  LIFE_SHIP_LEN*0.53;
var LIFE_CG_HULL_LEN =  LIFE_CG_HULL_FWD - LIFE_CG_HULL_AFT;
var LIFE_CG_SPAN_LEN =  LIFE_CG_SPRIT_TIPZ - LIFE_CG_HULL_AFT;
var LIFE_CG_BERTH  = null;
var LIFE_CG_PATROL = null;
var LIFE_CG_SHIP   = null;
var LIFE_CG_T = 0;
var LIFE_CG_CREW_ANCHORS = [
  [0,   -LIFE_SHIP_LEN*0.16],   /* at the helm, forward of the deckhouse so nobody stands inside it */
  [-3.0,-LIFE_SHIP_LEN*0.04], [3.0, LIFE_SHIP_LEN*0.08],
  [-2.4, LIFE_SHIP_LEN*0.20],
  [0,    LIFE_SHIP_LEN*0.32]    /* bow lookout, at the root of the bowsprit */
];
var LIFE_CG_DIAG = { built:false, why:null };
(function(){
  if(typeof LIFE_CGUARD_BERTHS === 'undefined' || !LIFE_CGUARD_BERTHS.length){ LIFE_CG_DIAG.why = 'no coast-guard berths published'; return; }
  /* longest berth that actually fits the hull; if none does, the longest
     there is, and the diagnostic says so rather than quietly clipping */
  var cand = LIFE_CGUARD_BERTHS.slice().sort(function(a,b){ return b.len - a.len; });
  LIFE_CG_BERTH = cand.filter(function(b){ return b.len >= LIFE_CG_HULL_LEN; })[0] || cand[0];
  LIFE_CG_DIAG.berthFits = LIFE_CG_BERTH.len >= LIFE_CG_HULL_LEN;

  /* ---- the beat, validated point by point */
  var fc = CIDX['Fortress'];
  var cx = LIFE_CG_BERTH.x, cz = LIFE_CG_BERTH.z - LIFE_CG_PATROL_OFF;
  var pts = [], rejected = 0;
  for(var i=0;i<LIFE_CG_PATROL_PTS;i++){
    var th = i*Math.PI*2/LIFE_CG_PATROL_PTS;
    var px = cx + Math.cos(th)*LIFE_CG_PATROL_A, pz = cz + Math.sin(th)*LIFE_CG_PATROL_B;
    var ok = false;
    for(var k=0;k<6;k++){
      /* the hull is 40 long: test the rectangle it sweeps, not its centre
         — the centre-point-vs-extent mistake this project has paid for in
         three separate passes */
      var clear = !lifeNavBlocked(px,pz) && !inRiver(px,pz,80) && terrainH(px,pz) < SEA-4;
      for(var r=0; clear && r<4; r++){
        var ra = r*Math.PI/2;
        if(lifeNavBlocked(px+Math.cos(ra)*22, pz+Math.sin(ra)*22)) clear = false;
      }
      if(clear){ ok = true; break; }
      /* push away from the Fortress canton, never toward it — "outward
         along the ellipse" would steer the south of the beat straight
         into the thing the beat is guarding */
      var ax = px - (fc ? fc.x : cx), az = pz - (fc ? fc.z : cz), al = Math.hypot(ax,az)||1;
      px += ax/al*34; pz += az/al*34;
    }
    if(ok) pts.push([px,pz]); else rejected++;
  }
  LIFE_CG_DIAG.patrolPts = pts.length; LIFE_CG_DIAG.patrolRejected = rejected;
  if(pts.length >= 5){
    var wp = [];
    for(var a2=0; a2<pts.length; a2++){
      var A2 = pts[a2], B2 = pts[(a2+1)%pts.length];
      var leg = lifeNavBuildLeg(A2[0],A2[1],B2[0],B2[1]);
      var lp = leg.getPoints(8);
      for(var j=0;j<lp.length-1;j++){
        var last = wp[wp.length-1];
        if(last && Math.hypot(lp[j].x-last.x, lp[j].z-last.z) < 1.0) continue;   /* centripetal Catmull-Rom goes NaN on coincident control points */
        wp.push(new THREE.Vector3(lp[j].x, LIFE_Y, lp[j].z));
      }
    }
    if(wp.length >= 8) LIFE_CG_PATROL = new THREE.CatmullRomCurve3(wp, true, 'centripetal');
  }
  if(!LIFE_CG_PATROL) LIFE_CG_DIAG.why = 'patrol circuit could not be verified clear — vessel stays moored';

  LIFE_CG_SHIP = {
    name:'Coast-guard junk', state:'moored', stateT:0,
    homeX: LIFE_CG_BERTH.x, homeZ: LIFE_CG_BERTH.z, homeRy: LIFE_CG_BERTH.ry,
    px: LIFE_CG_BERTH.x, py: SEA-0.3, pz: LIFE_CG_BERTH.z, yaw: LIFE_CG_BERTH.ry,
    /* .x/.z/.y and .curve are what the path devtool reads (pathvizEntityPos/
       pathvizBuild, 87-pathviz.js): the live position for the glow, and the
       PATROL circuit — its designated path — for the line, not whichever
       leg it happens to be on this second. */
    x: LIFE_CG_BERTH.x, z: LIFE_CG_BERTH.z, y: SEA,
    curve: LIFE_CG_PATROL, leg: null, legLen: 0, legDur: 1, facingYaw: LIFE_CG_BERTH.ry
  };
  LIFE_CG_DIAG.built = true;
})();
/* park the hull slot NOW, before the first frame: an InstancedMesh slot
   nobody has written renders at the identity matrix (i.e. a full-size ship
   at the world origin), not hidden. */
(function(){
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  if(LIFE_CG_SHIP){
    q.setFromAxisAngle(LIFE_SHIP_UP, LIFE_CG_SHIP.homeRy);
    m.compose(p.set(LIFE_CG_SHIP.homeX, SEA-0.3, LIFE_CG_SHIP.homeZ), q, new THREE.Vector3(1,1,1));
  }else{
    m.compose(p.set(0,0,0), q, new THREE.Vector3(0,0,0));
  }
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, m);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
})();
window._cguardShip = { diag: LIFE_CG_DIAG, berth: LIFE_CG_BERTH,
  hullLen: +LIFE_CG_HULL_LEN.toFixed(2), hullBeam: +LIFE_SHIP_BEAM.toFixed(2),
  spanWithSprit: +LIFE_CG_SPAN_LEN.toFixed(2),
  spritTipY: +LIFE_CG_SPRIT_TIPY.toFixed(2), spritTipZ: +LIFE_CG_SPRIT_TIPZ.toFixed(2),
  attrsOK: LIFE_CG_ATTRS_OK,
  patrolLen: function(){ return LIFE_CG_PATROL ? Math.round(LIFE_CG_PATROL.getLength()) : 0; },
  ship: function(){ return LIFE_CG_SHIP && { state:LIFE_CG_SHIP.state, x:Math.round(LIFE_CG_SHIP.px), z:Math.round(LIFE_CG_SHIP.pz), t:+LIFE_CG_SHIP.stateT.toFixed(1) }; } };

function lifeCGBegin(state){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  if(state !== 'moored' && !LIFE_CG_PATROL){ sh.state = 'moored'; sh.stateT = 0; return; }
  if(state === 'outbound'){
    var p0 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipDepartCurve({x:sh.homeX, z:sh.homeZ, ry:sh.homeRy}, p0.x, p0.z);
  }else if(state === 'patrol'){
    sh.leg = LIFE_CG_PATROL;
  }else if(state === 'inbound'){
    var p1 = LIFE_CG_PATROL.getPointAt(0);
    sh.leg = lifeShipArriveCurve(p1.x, p1.z, {x:sh.homeX, z:sh.homeZ, ry:sh.homeRy});
  }
  sh.legLen = (state === 'moored') ? 0 : sh.leg.getLength();
  sh.legDur = Math.max(8, sh.legLen/LIFE_CG_SPEED);
  sh.state = state; sh.stateT = 0; sh.lastX = undefined;
}
var lifeCGPos = new THREE.Vector3(), lifeCGDir = new THREE.Vector3();
var lifeCGQuat = new THREE.Quaternion(), lifeCGMat = new THREE.Matrix4();
var lifeCGScale1 = new THREE.Vector3(1,1,1);
function updateCGuard(dt){
  var sh = LIFE_CG_SHIP; if(!sh) return;
  LIFE_CG_T += dt; sh.stateT += dt;
  var slot = LIFE_AVOID_SHIP0 + LIFE_SHIP_CG_IDX;
  if(sh.state === 'moored'){
    lifeCGPos.set(sh.homeX, SEA-0.3, sh.homeZ);
    sh.facingYaw = sh.homeRy;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.homeRy);
    LIFE_AVOID_X[slot] = sh.homeX; LIFE_AVOID_Z[slot] = sh.homeZ; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(sh.stateT >= LIFE_CG_DWELL) lifeCGBegin('outbound');
  }else{
    var raw = Math.min(1, sh.stateT / sh.legDur);
    /* the lap runs at constant speed (a beat is walked, not eased); the
       two berth legs keep updateShips' own ease-in/ease-out so the hull
       slides off and onto the fender instead of snapping */
    var t = (sh.state === 'patrol') ? raw : raw*raw*(3-2*raw);
    sh.leg.getPointAt(Math.min(0.999999, t), lifeCGPos);
    lifeCGPos.y = SEA-0.3;
    sh.leg.getTangentAt(Math.min(0.995, Math.max(0.005, t)), lifeCGDir);
    var tanYaw = Math.atan2(lifeCGDir.x, lifeCGDir.z);
    var d2 = lifeAvoidNudge2(slot, lifeCGPos.x, lifeCGPos.z, lifeCGDir.x, lifeCGDir.z, LIFE_SHIP_AVOID_R, 12.0, LIFE_SHIP_LOOKAHEAD, 4.5, 3);
    lifeCGPos.x += d2[0]; lifeCGPos.z += d2[1];
    if(sh.facingYaw === undefined) sh.facingYaw = tanYaw;
    if(sh.lastX === undefined){ sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z; }
    var mdx = lifeCGPos.x-sh.lastX, mdz = lifeCGPos.z-sh.lastZ;
    var moveYaw = (mdx*mdx+mdz*mdz > 1e-6) ? Math.atan2(mdx,mdz) : tanYaw;
    var dA = moveYaw - sh.facingYaw;
    while(dA >  Math.PI) dA -= Math.PI*2;
    while(dA < -Math.PI) dA += Math.PI*2;
    var step = LIFE_SHIP_TURN_RATE*dt;
    sh.facingYaw += Math.max(-step, Math.min(step, dA));
    sh.lastX = lifeCGPos.x; sh.lastZ = lifeCGPos.z;
    lifeCGQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.facingYaw);
    LIFE_AVOID_X[slot] = lifeCGPos.x; LIFE_AVOID_Z[slot] = lifeCGPos.z; LIFE_AVOID_R[slot] = LIFE_SHIP_AVOID_R;
    if(raw >= 1){
      if(sh.state === 'outbound')      lifeCGBegin('patrol');
      else if(sh.state === 'patrol')   lifeCGBegin('inbound');
      else { sh.state = 'moored'; sh.stateT = 0; }
    }
  }
  sh.px = lifeCGPos.x; sh.py = lifeCGPos.y; sh.pz = lifeCGPos.z; sh.yaw = sh.facingYaw;
  sh.x = lifeCGPos.x; sh.z = lifeCGPos.z; sh.y = SEA;
  lifeCGMat.compose(lifeCGPos, lifeCGQuat, lifeCGScale1);
  lifeShipHullMesh.setMatrixAt(LIFE_SHIP_CG_IDX, lifeCGMat);
  lifeShipHullMesh.instanceMatrix.needsUpdate = true;
}
/* the crew: ordinators, not the generic white-haired sailor the merchant
   junks carry. They are lifeOrdMesh instances (LIFE_CG_CREW_N of them,
   added to LIFE_ORD_N below), which is why they cost no draw call and
   pick up the reserved night-lantern slots automatically — exactly how
   the Fortress boundary patrol and the drill squads already work.
   Driven from updateOrdinators(), which runs AFTER updateShips()/
   updateCGuard() in updateLife's fixed order, so sh.px/pz/yaw are this
   frame's, never last frame's. */
var lifeCGCrewPos = new THREE.Vector3(), lifeCGCrewQuat = new THREE.Quaternion();
var lifeCGCrewQuat2 = new THREE.Quaternion(), lifeCGCrewMat = new THREE.Matrix4();
function updateCGuardCrew(base){
  var sh = LIFE_CG_SHIP;
  for(var s=0; s<LIFE_CG_CREW_N; s++){
    if(sh){
      var a = LIFE_CG_CREW_ANCHORS[s];
      var ang = LIFE_CG_T*0.45 + s*1.9;
      lifeCGCrewQuat.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw);
      lifeCGCrewPos.set(a[0] + Math.sin(ang)*0.9,
                        LIFE_SHIP_DECK_Y.junk + 0.14,   /* the ordinator torso is 0.28 taller than a sailor's; half of that puts their feet on the same plank */
                        a[1] + Math.cos(ang*0.6)*0.6)
        .applyQuaternion(lifeCGCrewQuat);
      lifeCGCrewPos.x += sh.px; lifeCGCrewPos.y += sh.py; lifeCGCrewPos.z += sh.pz;
      lifeCGCrewQuat2.setFromAxisAngle(LIFE_SHIP_UP, sh.yaw + Math.sin(ang*0.7)*0.5 + s*1.2);
      lifeCGCrewMat.compose(lifeCGCrewPos, lifeCGCrewQuat2, lifeOrdTmpScale1);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, lifeCGCrewPos.x, lifeCGCrewPos.y+2.1, lifeCGCrewPos.z);
    }else{
      lifeCGCrewMat.compose(lifeCGCrewPos.set(0,0,0), lifeCGCrewQuat.identity(), lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(base+s, lifeCGCrewMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+base+s, 0, 0, 0, false);
    }
  }
}
/* owner: "add fishing boats (and all past and future life layer entities)
   to the pathing devtool" — one call, next to the population it describes,
   the pattern the fishing dhows above set. The line drawn is the patrol
   circuit itself; the posts are both published berths. */
if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'cguard', label:'Coast guard (Fortress)', color:0x3fbf6a, seg:24, glow:8,
  entities: function(){ return LIFE_CG_SHIP ? [LIFE_CG_SHIP] : []; },
  posts: function(){ return (typeof LIFE_CGUARD_BERTHS !== 'undefined' ? LIFE_CGUARD_BERTHS : [])
                            .map(function(b){ return { x:b.x, y:SEA, z:b.z }; }); },
  postR: 7
});
/* a real identity under the inspector. userData.inspectLabel is per-MESH and
   this hull is instance LIFE_SHIP_CG_IDX of the same InstancedMesh that draws
   nine ordinary merchant junks, so the mesh-level label can only ever say
   "Ship hull" for all ten. inspectInstance() (86-inspect.js) is the hook for
   exactly that: one registration, keyed on (mesh, instance index), which is
   what the raycast hit already carries — no proximity guess against a moving
   hull's position, and no reaching into that file's own dispatch from here.
   `site` because this vessel genuinely belongs to the Fortress canton while
   floating 245 units off its centre against a 150 radius, so
   nearestNamedSite() cannot find it on its own. */
if(typeof inspectInstance === 'function') inspectInstance({
  key: 'cguard-junk',
  mesh: lifeShipHullMesh,
  index: LIFE_SHIP_CG_IDX,
  label: 'Coast-guard junk — Ordinator patrol',
  site: 'Fortress canton'
});

