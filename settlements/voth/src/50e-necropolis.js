/* ============================== ANCESTRY: THE NECROPOLIS SPIRAL ==========
   Full rebuild, per the owner's explicit spec, replacing the old hanging-
   garden platform (that model — a stepped platform with a rim planting —
   is GONE; the comment trail above gardenDeck() documents its own two
   failed fix passes and is left as history, not touched — gardenDeck()
   itself is dead code now too: Guild reverted to its own guildHallsDeck()
   below per the owner's later follow-up, "reset this to being the guild
   canton in all deep and top level aspects", and no other canton ever
   set c.garden). This is not a variant of platCanton()'s tiered-plaza
   dispatch at all: a "spiral ramp winding around a square pyramid" is a
   different shape from "stack of square tiers with a courtyard on top", so
   this canton is dispatched by name, before platCanton() ever runs — see
   the one-line change at the bottom of this file's BUILD section.

   THE SHAPE
   ---------
   A solid, straight-sided stepped pyramid core (ANCESTRY.turns BOX slices,
   tapering from the base plinth to a small summit deck) is wrapped, once,
   by a single continuous ramp built from ANCESTRY.turns corner-to-corner
   straight segments — 12 of them, 3 full revolutions of the square base,
   i.e. "12 full turns (12 corners)" read as 12 corner-to-corner turns, not
   12 revolutions (which the channel-crossing count below confirms: with 4
   fixed radial channels and 12 turns, each channel is crossed exactly 3
   times — once per revolution — matching "partway through ascending each
   of the 12 turns... crosses one of the 4 radial channels" exactly).

   Per turn: a walkway (the "inner walkway for people") rides the corner-to-
   corner line at the pyramid's own edge; a raised planted bed sits on its
   INWARD side; a tomb-bearing wall sits on its OUTWARD side. Winding
   direction: see ASCENT_DIR below — chosen so outward (tombs) reads as the
   walker's RIGHT and inward (planting) as their LEFT while ascending, both
   stated explicitly and unambiguously by the owner, over the admittedly
   ambiguous "clockwise" (real-world spiral-stair descriptions disagree on
   whether that means bird's-eye or the climber's own turning sense — this
   build resolves the ambiguity in favour of the two requirements that
   cannot both be satisfied at once, not the one that can be read either
   way; ASCENT_DIR's own comment has the geometry check).

   HEIGHT: the owner asked for "about as tall as the Ordinator Fortress...
   measure CANTON_TOPS['Fortress']" (that canton's key was 'Lighthouse' at
   the time this was written — renamed since, see 30-layout.js). Checked
   live in the built scene (headless probe, bounding boxes of every
   instance within the Fortress canton's own footprint): CANTON_TOPS['Fortress'].y itself is only the
   PLATFORM the fortress stands on (~44, the same "deck height" every other
   canton's CANTON_TOPS carries) — the fortress's own domes/towers rise far
   above that, to y=165.8 at the iron mast's own tip (confirmed by hand
   against ordinatorFortress()'s formulas too: rad=hw*0.98, totalH=
   rad*0.583, plus the plinth/drum/dome/crown/mast stack on top of that —
   they match). "About as tall as the fortress" can only sensibly mean that
   real silhouette height, not the deck number alone, so ANCESTRY.top (150,
   the summit DECK) plus the fountain above it (below) is tuned to land
   the tallest point close to that same ~166, not to 150 alone.

   WATER: 4 fixed radial channels (bearings 0°/90°/180°/270°, matching the
   spec's "4 base edges") run from the summit fountain down to the bay.
   Each channel is a vertical stack of straight cascades (the same cheap
   "pale box + foam blob" motif gardenDeck() already uses — box|stone,
   blob|leaf, zero new draw calls) between: the summit edge, its 3 ramp
   crossings (one per revolution, decreasing in height), and the bay —
   "channel leads to waterfall leads to channel..." exactly as asked.

   TOMBS: familyTomb()/grave() (65-facade.js, hoisted function declarations
   — callable from here despite loading later in file-concatenation order,
   same as gardenDeck() already calls cherryBlossom()/baobab()/dragonTree()
   from that same file) plus two new variants declared just below
   (wallNicheTomb, steppedTomb) so the wall reads as a real necropolis, not
   one tomb copy-pasted round a pyramid.

   RANDOMNESS: this function saves/restores the shared PRNG's own `seed`
   var around all of its rnd()-consuming work, so however many random draws
   it makes internally, Port and Lighthouse (built right after Ancestry in
   the same CANTONS.forEach loop, sharing this one PRNG stream) see the
   exact same stream state they would if Ancestry made zero draws — their
   own generated detail is therefore fully decoupled from this canton's own
   implementation, not just "probably still close to before". */
var ANCESTRY = {
  turns     : 12,    /* corner-to-corner ramp segments, base to summit deck  */
  plinthTop : 5,     /* same base-plinth convention every other canton uses  */
  hwTop     : 30,    /* summit deck half-width                              */
  topY      : 150,   /* summit deck height (fountain rises above this)      */
  rampW     : 12,    /* walkway width                                       */
  bedW      : 13,    /* planted-bed strip width, inward of the walkway      */
  /* 2nd pass, per the owner: "rim walls too tall... roughly human scale,
     a low parapet someone could comfortably see over, not a fortification
     wall" — life-layer citizens stand ~2-2.5 units tall (78-life.js), so
     wallH=16 (plus a 1.3 coping) was 7-8x a person, read as a curtain
     wall, not a cemetery boundary. First cut brought it to 2.2 — right at
     a citizen's own eye level, not clearly BELOW it, so "comfortably see
     over" still wasn't true — chest/shoulder height (roughly 65-75% of a
     person) reads as an actual low parapet. Tombs (3.6-5.4 tall,
     familyTomb/steppedTomb) stand clearly above this line, which also
     directly helps the "tombs obscured" report. wallT thinned to match
     (a 5-thick wall on a low parapet read as a slab, not a wall). */
  wallH     : 1.6,   /* tomb-wall height, outward of the walkway — person-scale */
  wallT     : 2.6,   /* tomb-wall thickness                                 */
  channelW  : 3.4,
  coreSeg   : 4      /* core-pyramid sub-slices per turn — see ancestryCanton()'s
                        own comment on why this has to match the ramp's taper,
                        not just step once per turn                          */
};

/* new tomb variant #1: a niche tomb literally recessed into the wall
   (the owner: "partly clipped into the wall") rather than a freestanding
   block set against it — the same dark-recess trick plinthDoor() already
   uses for a canton's own doorway, capped with a shallow pediment. Reads
   distinctly from familyTomb()'s freestanding block+dome/spire. 3
   instances, box|stone only — no new draw call. */
function wallNicheTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(3.2,4.2), h = opt.h || rr(3.6,4.6), dep = opt.depth || 1.6;
  var c = col || pick(TONES);
  var np = loc(x,z, dep*0.5, 0, ry);
  BOX(np[0], y, np[1], dep, h, w, ry, shade(c,-0.42));             /* recessed dark alcove */
  var lp = loc(x,z, dep*1.02, 0, ry);
  BOX(lp[0], y+h, lp[1], dep*1.6, 1.1, w*1.18, ry, shade(c,0.05)); /* pediment lid */
  BOX(x, y-0.3, z, 1.4, 0.6, w*1.05, ry, shade(c,-0.10));          /* kerb underfoot */
}
/* new tomb variant #2: a small stepped mini-mausoleum — two shrinking
   tiers and a finial spire, a distinct tiered silhouette next to
   familyTomb()'s plain box and wallNicheTomb()'s flat alcove. 5
   instances, box|stone + fr3|stone — no new draw call. */
function steppedTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(4.4,5.6), h1 = opt.h || rr(3.2,4.2), h2 = h1*0.62;
  var c = col || pick(TONES);
  BOX(x, y, z, w, h1, w, ry, c);
  BOX(x, y+h1, z, w*1.08, 0.6, w*1.08, ry, shade(c,-0.12));
  BOX(x, y+h1+0.6, z, w*0.62, h2, w*0.62, ry, shade(c,0.03));
  FR3(x, y+h1+0.6+h2, z, w*0.30, h2*0.85, w*0.30, ry, shade(c,-0.08));
  var dp = loc(x,z, w*0.5+0.03, 0, ry);
  BOX(dp[0], y+0.2, dp[1], 0.3, h1*0.5, w*0.30, ry, shade(c,-0.4), 'wood');
}
/* a short cascade between two explicit points, straight down at a fixed
   (x,z) — same "pale box + foam blob" motif gardenDeck() already uses
   (box|stone(default) + blob|leaf), reused verbatim so the whole city's
   waterfalls read as one family. Zero new draw calls. */
function ancestryCascade(x,z,yTop,yBot,ry){
  var dropH = Math.max(1.5, yTop-yBot);
  BOX(x, yBot, z, 3.0, dropH, 0.7, ry, 0x8fb8c4);
  BLOB(x, yBot+0.5, z, 2.1, 1.2, ry, 0xd8e8ea, 'leaf');
}

function ancestryCanton(c){
  var A = ANCESTRY;
  var savedSeed = seed;         /* isolate Port/Lighthouse — see file comment above */

  var bed = bedAt(c.x,c.z), plinthTop = A.plinthTop;
  var hw0 = c.r*0.97;           /* identical base-tier scale to platCanton()'s own
                                    first tier, so the layout relax pass's spacing
                                    assumptions (built around that same c.r*0.97-ish
                                    footprint) stay valid unchanged */
  var y0 = plinthTop;
  var shrink = Math.pow(A.hwTop/hw0, 1/A.turns);

  /* the base plinth skirt — identical shape to platCanton()'s own, so this
     canton still reads as standing on the same kind of base every other
     canton does */
  FR8(c.x, bed, c.z, hw0*2.06, plinthTop-bed, hw0*2.06, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.3, c.z, hw0*2.14, 2.3, hw0*2.14, 0, shade(c.tone,-0.38));

  /* ASCENT_DIR: increasing bearing per turn. Geometry check (done once,
     applies to every turn by symmetry): forward = corner[i+1]-corner[i];
     at turn 0 (SE->NE corner, crossing the +x/east face) forward comes out
     due east (1,0); a walker's right hand, facing east, points due south
     (0,1) — world "right" = (-forward.z, forward.x). East's own corner
     (turn 0) sits on the canton's +x/east flank, so "south" there is NOT
     outward... re-derived directly at the crossing itself below instead
     of trusted by hand: outward is computed per-turn from the real corner
     midpoint minus the canton centre, and right-vs-outward is what decides
     which of {bed, wall} goes where — not an assumed compass label. */
  var ANGLE0 = Math.PI/4;   /* SE start corner — same convention Palace/Temple/
                                Ancestry's own pier already uses for "the corner" */
  var CORN = [];
  for(var i=0;i<=A.turns;i++){
    var hwi = hw0*Math.pow(shrink,i);
    var ang = ANGLE0 + i*(Math.PI/2);
    var r = hwi*Math.SQRT2;
    var yi = y0 + i*(A.topY-y0)/A.turns;
    var p = loc(c.x,c.z, 0, r, ang);
    CORN.push({x:p[0], z:p[1], y:yi, hw:hwi});
  }

  /* solid core: fills the space under the ramp everywhere, so there is
     never a gap or floating geometry. Real bug, found by screenshot: a
     first pass used ONE constant half-width per turn (the turn's OWN
     starting corner, hw0*shrink^i) held for that whole turn's height —
     but the ramp/wall above it keeps tapering continuously across that
     same height, down to the turn's narrower END-corner half-width. Since
     one turn's taper (the shrink factor, ~10.6%) is comparable to the
     wall's own outward offset, the ramp/wall sank inside the oversized
     core for the back half of every turn, which is why the first render
     showed a plain stepped block with no visible ramp/wall/tombs at all.
     Fixed by interpolating hw continuously between each turn's own two
     corners, at the same per-turn sub-step resolution the ramp itself
     uses below, so the core's outer surface tracks the ramp's own edge
     at every height, not just at each turn's start. box|stone(default) —
     no new draw call, just more (cheap) instances. */
  /* 2nd fix, per the owner's "ramps look placed too high" report: the
     midpoint sampling above (tc=(sc+0.5)/coreSeg) built each sub-slice
     with its BASE already 0.5-slices in from the turn's own start, then
     added +0.4 on top of that — so the last sub-slice of every turn
     overshot the true corner height by a good 1.9 units, and the first
     sub-slice of the NEXT turn started that same 1.9 short of ITS OWN
     corner. Since the ramp/wall above is anchored to the real, exact
     corner heights (CORN[i].y, no such offset), the core visibly
     stair-stepped past where the ramp actually sits at every one of the
     12 turn boundaries — the "too high" ledges the owner saw. Fixed by
     building each sub-slice from its own EXACT start-fraction to end-
     fraction (edge sampling, not midpoint), so the stack's top lands
     exactly on CORN[s0+1].y with no overshoot, and hw uses the slice's
     own wider (start) edge so the core is never narrower than the ramp
     immediately above it — the opposite failure (core a hair proud of
     the ramp at a slice's own top) is the safe direction to round to. */
  /* 3rd fix, round 3 — the previous recess (bedW*0.65) was found, by a
     literal position probe of the live scene (every 'stone'-family
     instance's real world radius, read back and compared to the bed's
     own), to still be wrong: it was sized to stop turn i+1's core from
     overhanging turn i's bed from ABOVE, but never checked whether turn
     i's OWN core — directly beside the bed at the SAME height, not above
     it — already reached out past the bed's inner edge. It did: the bed
     spans roughly 7 to 20 units in from the walkway, and an 8.45-unit
     recess only clears the first 1 of those — the other 12+ units of bed
     width, and everything planted on it, were sitting inside/behind the
     solid core at their own height, not merely shadowed by a tier above.
     That is the actual "foliage in the wrong place" bug: not a bad
     coordinate, geometry rendering inside solid stone.
     Fix, this pass: recess the core past the bed's OWN full inward reach
     (rampW*0.5+bedW+1.4, the same offset the bed curb itself is built
     at, +1 clearance) — not a fraction of it. A NEW explicit backing wall
     (below, in the same per-turn loop that builds the walkway/bed/wall)
     now carries the ribbon's whole width down to solid ground instead —
     it hangs from the ribbon's own base, so unlike the core it can never
     bury the bed regardless of how far the core itself is pulled back.
     Getting this wrong the first time (an 8.45 recess, briefly then a
     bare 3.0 "just for silhouette" — forgetting the core is a separate,
     independently-built box that still buries anything inside its own
     radius no matter what else exists alongside it) is exactly the kind
     of mistake worth spelling out here, not just fixing quietly. */
  var coreSeg = A.coreSeg, coreRecess = A.rampW*0.5+A.bedW+8;   /* +8, not +2.4: a live
    radius probe after the first pass at this (bed inner-edge + 1) showed the core still
    covering the bed's own inner third at some bearings — squares reach hw*sqrt(2) at a
    corner but only hw at a face midpoint, and the bed's own radius drifts with it along
    the turn, so a bare +1 clearance measured at one bearing wasn't enough at others. */
  for(var s0=0; s0<A.turns; s0++){
    var Pa = CORN[s0], Pb = CORN[s0+1];
    for(var sc=0; sc<coreSeg; sc++){
      var t0c = sc/coreSeg, t1c = (sc+1)/coreSeg;
      var hwC = (mix(Pa.hw, Pb.hw, t0c) - coreRecess) * 0.985;
      var yC = Pa.y + (Pb.y-Pa.y)*t0c;
      var yC1 = Pa.y + (Pb.y-Pa.y)*t1c;
      BOX(c.x, yC, c.z, hwC*2, (yC1-yC)+0.3, hwC*2, 0, shade(c.tone, sc%2 ? 0.02 : -0.03));
    }
  }

  /* the CHANNEL_K crossing points: turn i's own straight-line midpoint is
     exactly the true cardinal face-midpoint for a constant-hw square face;
     here hw drifts slightly turn-to-turn (the pyramid keeps tapering even
     within one turn), so it is only an approximation — close enough that
     it is not worth a second geometry model for. channel k (0..3, bearing
     k*90 deg) is crossed at turns i where i%4===k, three times (once per
     revolution), highest-first as water actually flows: summit -> turn
     k+8 -> turn k+4 -> turn k -> the bay. */
  var CROSS = [[], [], [], []];

  for(var t0=0; t0<A.turns; t0++){
    var P0 = CORN[t0], P1 = CORN[t0+1];
    var dx = P1.x-P0.x, dz = P1.z-P0.z, L = Math.hypot(dx,dz);
    var ry = Math.atan2(dx,dz);
    var midx = (P0.x+P1.x)*0.5, midz = (P0.z+P1.z)*0.5, midy = (P0.y+P1.y)*0.5;
    var outx = midx-c.x, outz = midz-c.z, outL = Math.hypot(outx,outz) || 1;
    outx/=outL; outz/=outL;
    var k = t0 % 4;
    CROSS[k].push({x:midx, z:midz, y:midy, outx:outx, outz:outz, turn:t0});

    var nSeg = 5;
    for(var s1=0; s1<nSeg; s1++){
      var tt = (s1+0.5)/nSeg;
      var x = P0.x+dx*tt, z = P0.z+dz*tt, y = P0.y+(P1.y-P0.y)*tt;
      var segLen = L/nSeg*1.15;
      /* backing wall, built FIRST (underneath everything else this slice
         adds): carries the ribbon's whole width — bed's inner edge to the
         tomb-wall's outer face — down to solid ground on its own, instead
         of depending on the core above lining up with it. Hangs down from
         the ribbon's own base by one turn's rise (+margin), so it always
         reaches something solid below regardless of the core's own shape.
         See the core loop's own comment, above, for the bug this replaces
         (the core's footprint, sized to reach the ramp, was wide enough
         to bury the bed at the SAME height, not just overhang it from a
         tier above). box|stone(default) — no new draw call. */
      var faceOut = A.rampW*0.5+A.wallT+1.0, faceIn = A.rampW*0.5+A.bedW+1.8;
      var faceOff = (faceOut-faceIn)*0.5, faceDrop = (P1.y-P0.y)+3.0;
      var fx2 = x + outx*faceOff, fz2 = z + outz*faceOff;
      BOX(fx2, y-1.0-faceDrop, fz2, faceOut+faceIn, faceDrop+1.2, segLen, ry, shade(c.tone,-0.16));
      /* walkway */
      BOX(x, y-1.0, z, A.rampW, 1.6, segLen, ry, shade(c.tone,-0.10));
      /* inward planted curb (the bed's foliage is scattered separately,
         continuously along the turn, not tied to these 5 slices) */
      var bx = x - outx*(A.rampW*0.5+A.bedW*0.5+1.4), bz = z - outz*(A.rampW*0.5+A.bedW*0.5+1.4);
      BOX(bx, y-0.6, bz, A.bedW, 1.5, segLen, ry, shade(c.tone,-0.22));
      /* outward tomb-wall + low coping — person-scale now (ANCESTRY.wallH),
         coping thinned to match (was 1.3, sized for the old 16-tall wall) */
      var wx = x + outx*(A.rampW*0.5+A.wallT*0.5+0.5), wz = z + outz*(A.rampW*0.5+A.wallT*0.5+0.5);
      BOX(wx, y-1.0, wz, A.wallT, A.wallH, segLen, ry, shade(c.tone, s1%2 ? -0.05 : 0.03));
      BOX(wx, y-1.0+A.wallH, wz, A.wallT*1.3, 0.5, segLen, ry, shade(c.tone,-0.20));
    }

    /* corner pier, at this turn's OWN start corner (the shared endpoint
       every previous turn's wall also ends on) */
    var op = P0, opx = op.x-c.x, opz = op.z-c.z, opL = Math.hypot(opx,opz)||1;
    var cox = opx/opL, coz = opz/opL;
    var pp = loc(op.x, op.z, 0, A.rampW*0.5+A.wallT*0.5+0.5, Math.atan2(cox,coz));
    FR3(pp[0], op.y-1.0, pp[1], A.wallT*0.95, A.wallH*1.3, A.wallT*0.95, 0, shade(c.tone,0.06));

    /* tombs along this turn's outward wall, embedded partway into it
       (radius pushed out only a third of a tomb's own depth, so the rest
       reads as clipped into the wall behind it, per the owner's ask) —
       a mix of familyTomb() (reused verbatim from the funerary district
       work), the two new variants above, and the occasional plain grave()
       as filler, so the run never repeats one shape */
    var nTombs = Math.max(2, Math.round(L/17));
    for(var tb=0; tb<nTombs; tb++){
      var tt2 = (tb+0.5)/nTombs;
      var tx = P0.x+dx*tt2, tz = P0.z+dz*tt2, ty = P0.y+(P1.y-P0.y)*tt2;
      var tr = A.rampW*0.5+A.wallT*0.35;
      var tpx = tx+outx*tr, tpz = tz+outz*tr;
      var ryT = Math.atan2(-outz, outx);   /* faces outward — loc()'s +lx convention, see familyTomb()/grave() */
      var pick2 = rnd();
      if(pick2 < 0.36) familyTomb(tpx, ty-0.6, tpz, ryT, pick(TONES), {w:rr(4.6,6.4), d:rr(4.0,5.2), h:rr(3.6,5.4)});
      else if(pick2 < 0.62) wallNicheTomb(tpx, ty-0.6, tpz, ryT, pick(TONES));
      else if(pick2 < 0.82) steppedTomb(tpx, ty-0.6, tpz, ryT, pick(TONES));
      else grave(tpx, ty-0.4, tpz, ryT, pick(TONES_POOR), chance(0.5) ? {mound:true} : {});
    }

    /* planted bed: continuous scatter along the turn's inward strip —
       grass groundcover plus a handful of specimen trees, each with its
       own treeBaseGrass() foot clump (gardenDeck()'s own fix for "trees
       growing out of bare stone", reused here).
       Real bug, per the owner's "no rim of foliage visible" report — the
       exact "buried planting" class the old gardenDeck() attempts hit
       twice, and the same shape of mistake the life-layer's own
       cantonEdgeY()/lifeGroundY() writeup (78-life.js) warns about: a
       height read from the wrong surface. Here it wasn't terrainH (this
       canton never calls it) — it was planting at gy0/ty0 (the WALKWAY's
       own line, y+0.6 at its top) while the bed curb built just above,
       a few lines up, actually tops out 0.3 higher still, at y+0.9. Grass
       and tree bases were landing UNDER the curb's own lip, not on it.
       BEDTOP mirrors that curb's true top (y-0.6 base + 1.5 height)
       exactly, so foliage sits ON the built surface, not inside it.
       Density bumped up (was L/9, a modest scatter) per the spec's own
       "heavy foliage" wording, now the bug that was hiding it is fixed —
       plenty of instance headroom for it (~80% of BUDGET.instances before
       this pass). A second, slightly lifted canopy layer is added too,
       the same trick gardenDeck() uses for "reads as lush from a normal
       angle", not just ground-level cover. */
    var nGrass = Math.max(10, Math.round(L/5));
    for(var gI=0; gI<nGrass; gI++){
      var gt = rnd();
      var gx0 = P0.x+dx*gt, gz0 = P0.z+dz*gt, gBEDTOP = P0.y+(P1.y-P0.y)*gt + 0.9;
      var bedR = rr(A.bedW*0.12, A.bedW*0.58);   /* jitter across the bed's own width */
      var gx = gx0 - outx*(A.rampW*0.5+1.4+bedR), gz = gz0 - outz*(A.rampW*0.5+1.4+bedR);
      var gRad = rr(1.6,3.1);
      BLOB(gx, gBEDTOP, gz, gRad, gRad*rr(0.4,0.65), rnd()*3, pick(LEAFC), 'leaf');
      if(chance(0.4)){
        BLOB(gx, gBEDTOP+rr(2.0,3.2), gz, gRad*1.15, gRad*rr(0.30,0.42), rnd()*3, pick(LEAFC), 'leaf');
      }
    }
    var nTrees = 3 + (t0 % 2 === 0 ? 1 : 0);
    for(var trI=0; trI<nTrees; trI++){
      var trt = (trI+0.5)/nTrees;
      var tx0 = P0.x+dx*trt, tz0 = P0.z+dz*trt, trBEDTOP = P0.y+(P1.y-P0.y)*trt + 0.9;
      var trx = tx0 - outx*(A.rampW*0.5+A.bedW*0.5+1.4), trz = tz0 - outz*(A.rampW*0.5+A.bedW*0.5+1.4);
      var pick4 = rnd();
      if(pick4 < 0.34) cherryBlossom(trx, trBEDTOP, trz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(5,8)});
      else if(pick4 < 0.62) dragonTree(trx, trBEDTOP, trz, rnd()*Math.PI*2, null, {h:rr(6,9)});
      else baobab(trx, trBEDTOP, trz, rnd()*Math.PI*2, null, {h:rr(6,9)});
      treeBaseGrass(trx, trz, trBEDTOP);
    }

    /* the channel crossing itself, if this turn carries one — a shallow
       paved trough across the walkway, oriented along the turn's own real
       outward radial (outx/outz, already computed above) rather than a
       rounded k*90 guess, since the true crossing bearing drifts a few
       degrees off the cardinal at each turn's own midpoint */
    var ryChan = Math.atan2(outx,outz);
    BOX(midx, midy+0.35, midz, A.channelW, 0.6, A.rampW*1.2, ryChan, 0x8fb8c4);
    BOX(midx, midy-1.1, midz, A.channelW*1.5, 0.5, A.rampW*1.3, ryChan, shade(c.tone,-0.18));
  }

  /* the summit: a leveled platform, per the spec — cap trim like every
     other canton's tier, then a fountain at centre with 4 straight
     channels to the platform's own 4 edge-midpoints */
  var topHw = A.hwTop;
  BOX(c.x, A.topY-1.0, c.z, topHw*2.12, 2.2, topHw*2.12, 0, shade(c.tone,-0.20));
  BOX(c.x, A.topY+1.2, c.z, topHw*1.94, 1.0, topHw*1.94, 0, shade(c.tone,-0.05));
  /* the deck's REAL walkable surface — the cap above is base(topY+1.2) +
     height(1.0), so its top is topY+2.2, not topY+1.2. Same burial bug as
     the per-turn planted bed (see that fix's own comment): the fountain
     and lawn/trees below were anchored to the cap's BASE, landing them
     1.0 unit inside it. The 4 channel arms happened to already read
     topY+2.3 (already ~flush with the real top — left alone). */
  var deckTop = A.topY + 2.2;

  var fountR = topHw*0.22;
  CYL(c.x, deckTop, c.z, fountR, 2.4, 0, shade(c.tone,0.05));
  CYL(c.x, deckTop+2.4, c.z, fountR*0.5, 3.6, 0, shade(c.accent||c.tone,0.10));
  CYL(c.x, deckTop+6.0, c.z, fountR*0.30, 2.6, 0, shade(c.accent||c.tone,0.14));
  /* a fancy crowning spire on the basin, tall enough that the whole
     fountain lands close to the Ordinator Fortress's own measured full
     height (~166 above sea level — see the file comment above) */
  FR3(c.x, deckTop+8.6, c.z, fountR*0.42, 8.0, fountR*0.42, 0, shade(c.accent||c.tone,0.06));
  CONE(c.x, deckTop+16.6, c.z, fountR*0.14, 6.0, 0, shade(c.accent||c.tone,-0.05));
  BLOB(c.x, deckTop+2.4, c.z, fountR*0.62, fountR*0.34, 0, 0xd8e8ea, 'leaf');

  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dir){
    var chanLen = topHw*0.72;
    var mx = c.x+dir[0]*chanLen*0.5, mz = c.z+dir[1]*chanLen*0.5;
    BOX(mx, A.topY+2.3, mz, dir[0]?chanLen:A.channelW, 0.5, dir[0]?A.channelW:chanLen, 0, 0x8fb8c4);
  });
  /* the summit's own small lawn quadrants, between the 4 channel arms —
     same "define the squares the channels already divide the deck into"
     trick gardenDeck() uses, so trees never straddle a channel */
  var qNear = A.channelW+3, qFar = topHw*0.66;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(qs){
    var sx=qs[0], sz=qs[1];
    for(var lg=0; lg<5; lg++){
      var lx = c.x + sx*rr(qNear,qFar), lz = c.z + sz*rr(qNear,qFar);
      var lr = rr(1.6,2.6);
      BLOB(lx, deckTop, lz, lr, lr*rr(0.4,0.6), rnd()*3, pick(LEAFC), 'leaf');
    }
    var cbx = c.x + sx*rr(qNear+4,qFar-4), cbz = c.z + sz*rr(qNear+4,qFar-4);
    cherryBlossom(cbx, deckTop, cbz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(5,7)});
    treeBaseGrass(cbx, cbz, deckTop);
  });

  /* the 4 cascades per channel: summit edge -> turn k+8 crossing ->
     turn k+4 crossing -> turn k crossing -> the bay, each a straight
     drop at the channel's own fixed bearing — "channel leads to
     waterfall leads to channel..." down to the water. */
  for(var k2=0; k2<4; k2++){
    var ang2 = k2*(Math.PI/2);
    var edge = loc(c.x,c.z, 0, topHw, ang2);
    var pts = [{x:edge[0], z:edge[1], y:A.topY}].concat(
      CROSS[k2].slice().sort(function(a,b){ return b.turn-a.turn; }).map(function(cr){ return {x:cr.x,z:cr.z,y:cr.y}; })
    );
    var bay = loc(c.x,c.z, 0, hw0*1.08, ang2);
    pts.push({x:bay[0], z:bay[1], y:1.5});
    for(var seg=0; seg<pts.length-1; seg++){
      var pa=pts[seg], pb=pts[seg+1];
      ancestryCascade((pa.x+pb.x)*0.5, (pa.z+pb.z)*0.5, pa.y, pb.y, ang2);
    }
  }

  /* sea-level stairs at 2 of the 4 base faces, matching platCanton()'s own
     base treatment */
  for(var f2=0; f2<4; f2+=2){
    var a2 = f2*Math.PI/2 + ANGLE0 - Math.PI/4;
    var ex2 = c.x + Math.cos(a2)*hw0*1.04, ez2 = c.z + Math.sin(a2)*hw0*1.04;
    seaStair(ex2, ez2, -a2 + Math.PI, hw0*0.5, y0, -2);
  }

  /* one ferry pier + matching ground-floor door at the base, same "one
     per canton" contract every other rim canton with a CPIERS entry has
     (cantonPiers()/plinthDoor(), both pre-existing shared helpers) */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(hw0, ferryPier.ry), c.tone);
  }

  /* bridges/causeways land at the base (y0/hw0) for ground-height purposes
     (entryY/entryHw — lifeGroundY()/cantonEdgeY() in 78-life.js read these
     for ANY point within the canton's radius, not just the bridge
     approach, so this has to stay the real walkable plaza height, same as
     before) — but landing()'s own STAIR target is a separate concern, and
     is wrong: audit finding (measured live via window._landingStairs) put
     that linkStair at rise 51.4 over a run of only 3.54 — the pylon sits
     almost exactly at hw0's own radius (the ramp's base turn is barely
     inboard of it), so ANY height picked at that radius is nearly
     vertical, an 86 degree "stair" no amount of step-count fixes to
     seaStair/linkStair could turn into something climbable. y0 was chosen
     only to avoid the OTHER bad case — landing on the summit fountain —
     without checking the run actually available there. The ramp itself
     (CORN, above) already climbs continuously from y0 to topY at every
     radius in between; bridgeY/bridgeHw below picks the turn whose own
     height is closest to where a bridge deck actually lands (DECK+2.4,
     landing()'s own `ay`), reusing that existing surface as the stair's
     target instead of forcing a separate near-vertical drop to the base —
     same fix monoCanton() applies by using tier 1 instead of the summit.
     Kept separate from entryY/entryHw (rather than overwriting them) so
     lifeGroundY's canton-radius fallback still returns the real plaza
     height everywhere else on Ancestry, not the ramp mid-turn. No new
     geometry, no touched budget — landing() falls back to entryY/entryHw
     for every other canton, which don't set bridgeY/bridgeHw at all. */
  var rampTargetY = DECK+2.4, rampBestI = 0, rampBestD = Infinity;
  for(var rti=0; rti<=A.turns; rti++){
    var rtd = Math.abs(CORN[rti].y - rampTargetY);
    if(rtd < rampBestD){ rampBestD = rtd; rampBestI = rti; }
  }
  CANTON_TOPS[c.n] = { y:y0, hw:hw0, spring:plinthTop, entryY:y0, entryHw:hw0,
                        bridgeY:CORN[rampBestI].y, bridgeHw:CORN[rampBestI].hw };
  /* Ancestry has no tiers at all — one continuous spiral ramp from the base
     plaza to the summit — so cantonFacesRecord()'s tier model does not fit
     it. It gets a one-level record by hand instead, and `spiral:true` so
     cantonArrivalLevel() always answers with that level rather than
     pretending the ramp is a battered tier face. The level is the base
     plaza apron (the plinth cornice's own top face, plinthTop+1) and the
     wall rising from it is the solid CORE pyramid, whose first slice is
     built at exactly this half-width a few hundred lines above. Measured
     against a live raycast down the causeway bearing before use: the apron
     reads y=6 from r=86 out to the plinth cap, and the core's own stepped
     face starts at r=86 (hits at 8.3 and 11.3, its first two slices). */
  CANTON_FACES[c.n] = { spiral:true, tiers:[], tone:c.tone,
    levels:[{ y:plinthTop+1.0, hw:(CORN[0].hw - coreRecess)*0.985, outer:hw0*1.07, tier:0, top:false }] };

  seed = savedSeed;   /* restore — see file comment above */
}

/* small piers off a canton's own flank, for small craft — causeway-level
   (CWAY), not harbour-level like PIERS. CPIERS' positions are computed in
   30-layout.js (before the ground mask is captured in 40-ground.js) so the
   mask stroke there actually sees them; this only emits the plank geometry
   for whichever entries belong to this canton — see the note by CPIERS in
   30-layout.js for why the position math isn't here. */
function cantonPiers(c){
  /* real bug, found by the owner: this used CWAY (17, the fixed height
     BRIDGE causeways sit at, since those need one consistent level
     spanning open water between differently-sized cantons) — but a
     canton pier isn't a causeway, it's attached to THIS canton's own low
     base plinth, whose cap (platCanton()'s "walkway") sits at roughly
     plinthTop+1 ~ 6, not 17. At CWAY height the plank floated ~10 units
     above the real walkway, reading as if it burst out of the sloped
     plinth wall partway up rather than resting on the walkway's own
     edge. plinthTop is a local literal in platCanton() (also duplicated
     as threadedPortStair()'s PLINTH) rather than a shared constant;
     matching it here directly rather than exporting one for a single
     other reader. */
  var pierY = 5 + 1.2;
  CPIERS.filter(function(p){ return p.canton === c.n; }).forEach(function(p){
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz), n2=Math.round(L/14);
    for(var k=0;k<n2;k++){
      var t=(k+0.5)/n2, x=p.x0+dx*t, z=p.z0+dz*t;
      BOX(x, pierY, z, p.w, 1.2, L/n2*1.08, Math.atan2(dx,dz), 0x8a7659, 'wood');
    }
  });
}

/* a warehouse shed: long, low, with a gabled roof and a loading door */
function shed(x, yb, z, w, d, h, ry, col){
  BOX(x, yb, z, w, h, d, ry, col);
  BOX(x, yb+h-0.5, z, w*1.04, 0.9, d*1.04, ry, shade(col,-0.18));
  FR8(x, yb+h+0.4, z, w*1.02, h*0.55, d*1.02, ry, pick(ROOFS), 'roof');   /* gable-ish ridge */
  var dr = loc(x,z, 0, d*0.5+0.3, ry);
  BOX(dr[0], yb, dr[1], w*0.28, h*0.62, 0.9, ry, shade(col,-0.45));
}
/* the harbour canton: warehouse rows, cranes, and piers off the lake faces */
function portDeck(c, y, hw, qy, qhw){
  /* which way is the shore? piers go on the other three faces */
  var lp = shoreIn(c.s, 26), sl = Math.hypot(lp[0]-c.x, lp[1]-c.z);
  var sdx = (lp[0]-c.x)/sl, sdz = (lp[1]-c.z)/sl;
  /* sheds and cargo on the low quay, and a stair up to the platform on each face */
  for(var f0=0; f0<4; f0++){
    var a0 = f0*Math.PI/2, ex = Math.cos(a0), ez = Math.sin(a0);
    if(ex*sdx + ez*sdz > 0.5) continue;
    for(var q=-1; q<=1; q+=2){
      var sx = c.x + ex*(qhw-14) + (-ez)*q*qhw*0.55, sz = c.z + ez*(qhw-14) + (ex)*q*qhw*0.55;
      shed(sx, qy, sz, 24, 12, rr(7,10), -a0+Math.PI/2, pick(TONES_POOR));
    }
    for(var g=0; g<6; g++){
      var gx = c.x + ex*(qhw-rr(6,28)) + (-ez)*rr(-qhw*0.9,qhw*0.9), gz = c.z + ez*(qhw-rr(6,28)) + (ex)*rr(-qhw*0.9,qhw*0.9);
      BOX(gx, qy, gz, rr(2.2,4), rr(2,3.6), rr(2.2,4), rnd()*3, pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
    }
    seaStair(c.x + ex*(c.r*1.04), c.z + ez*(c.r*1.04), -a0 + Math.PI, 24, y, qy);
  }
  var rows = 3, per = 4;
  for(var r=0;r<rows;r++){
    for(var k=0;k<per;k++){
      var lx = (r-(rows-1)/2)*hw*0.56, lz = (k-(per-1)/2)*hw*0.40;
      if(Math.abs(lx)>hw*0.80 || Math.abs(lz)>hw*0.80) continue;
      if(chance(0.12)) continue;
      shed(c.x+lx, y, c.z+lz, hw*0.44, hw*0.24, rr(9,13), 0, pick(TONES_POOR));
    }
  }
  /* harbourmaster's tower */
  FR6(c.x + hw*0.70, y, c.z - hw*0.70, 22, 40, 22, 0, shade(c.tone,0.06));
  DOME(c.x + hw*0.70, y+40, c.z - hw*0.70, 8, 6, 0, 0xb8ae90, 'dome');
  for(var f=0; f<4; f++){
    var a = f*Math.PI/2;
    /* skip the face that looks at the shore */
    if(Math.cos(a)*sdx + Math.sin(a)*sdz > 0.5) continue;
    for(var i=0;i<3;i++){
      var off = (i-1)*hw*0.52;
      var dir = [Math.cos(a), Math.sin(a)];
      var base = [c.x + dir[0]*qhw + (-dir[1])*off, c.z + dir[1]*qhw + dir[0]*off];
      var len = rr(70,120);
      for(var j=0;j<Math.round(len/15);j++){
        var xx = base[0] + dir[0]*(j+0.5)*15, zz = base[1] + dir[1]*(j+0.5)*15;
        BOX(xx, qy-0.6, zz, 13, 1.7, 15*1.06, -a+Math.PI/2, 0x8a7659, 'wood');
        [-1,1].forEach(function(sg){
          var q = [xx - dir[1]*sg*5.5, zz + dir[0]*sg*5.5];
          CYL(q[0], bedAt(q[0],q[1]), q[1], 1.0, qy-0.6-bedAt(q[0],q[1]), 0, 0x6b5942, 'wood');
        });
      }
      /* a crane at the root */
      if(i===1){ CYL(base[0], qy, base[1], 1.4, 16, 0, 0x5b4b38, 'wood');
                 BOX(base[0]+dir[0]*7, qy+14.5, base[1]+dir[1]*7, 2, 1.6, 16, -a+Math.PI/2, 0x5b4b38, 'wood'); }
    }
  }
}

