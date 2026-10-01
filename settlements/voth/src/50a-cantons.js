/* ============================== 11. CANTONS ============================== */
reseed(500001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */


var CANTON_TOPS = {};
/* the Guild canton's own working population — a smith at each forge, a
   sparring pair in the warrior yard, a tender on the alchemist's rooftop
   herb garden. Populated by guildHallsDeck() (below), consumed by
   78-life.js's updateGuildWorkers() — same cross-file hand-off pattern as
   TEMPLE_ALTAR/LIFE_SHRINE_STOPS (65-facade.js): a plain global, declared
   here so it exists (empty) even if guildHallsDeck() never runs, assigned
   for real once CANTONS.forEach reaches the Guild canton later in this
   same file's BUILD pass. Each entry: {x,z,y,ry,role,radius,pairDx,pairDz}.

   THIRD PASS (owner: "add an outdoor activity to all the guild houses...
   guildsmen sawing wood for carpenters, merchants having a very high
   priority market tend outside... clockmaker guild probably just needs an
   animated clock... extrapolate for the remaining guilds"). Same
   cross-file hand-off idiom extended for the two new pieces that don't fit
   the GUILD_WORK_POSTS shape:
     GUILD_CLOCK: there is no separate "clockmaker's guild" hall in this
     canton (only the four above ever existed — checked directly against
     this file before writing anything, see guildHallsDeck()'s own updated
     header comment). Per the owner's own fallback for exactly this case,
     the clock is mounted on whichever existing hall best fits rather than
     inventing a fifth hall; consumed by 82-daynight.js's per-frame loop
     (dayNightHour()-driven hands, same "read the game clock, drive a
     rotation" idiom that file's lighthouse beacons already use), which is
     why this needs its own hand-off var instead of just living inside
     GUILD_WORK_POSTS (that array's consumer, updateGuildWorkers(), only
     knows how to pose an NPC body, not spin a clock hand).
     GUILD_MARKET_DOOR: the merchant guild has no dedicated hall either (no
     spare quadrant — all four are already spoken for, see below) — its
     "very high priority" outdoor tend reuses and extends the small local
     market guildHallsDeck() already builds at the canton centre. Consumed
     by 78-life.js to register a LIFE_DOORS entry in its own category, with
     real priority in LIFE_PED_CAT_ORDER. */
var GUILD_WORK_POSTS = [];
var GUILD_CLOCK = null;
var GUILD_MARKET_DOOR = null;
/* FOURTH PASS (owner: "place the carpenter and merchant guild and make
   [...] weaver's, clockmaker's/artificer's, potter's, glassmaker's, and
   navigator's guild" — real, separate hall buildings this time, not the
   yard-only/annex-only treatment the THIRD PASS above settled for when no
   dedicated hall existed yet). GUILD_CLOCKS: a list of every mounted clock
   face in the city (was a single GUILD_CLOCK object on the alchemist's
   tower only; now also the new Artificer hall's own face — see that
   hall's own comment below in guildHallsDeck()), consumed by
   82-daynight.js's updateGuildClock(), which now drives however many
   clocks this array holds off ONE resized InstancedMesh (2 hand instances
   per clock) instead of a second draw call — see that file's own comment.
   GUILD_HALL_DOORS: one entry per new hall's own front door — {x,z,ry,
   canton,name} — consumed by 78-life.js as a new 'guildhall' LIFE_DOORS
   category, the same cross-file hand-off idiom as GUILD_MARKET_DOOR just
   above, generalized to hold more than one door and more than one canton
   (the Navigator's Guild hall lives on Port, built inside portDeckV2(),
   65-facade.js — pushes into this same array). */
var GUILD_CLOCKS = [];
var GUILD_HALL_DOORS = [];
var DECK = 54;            /* every canton-to-canton span rides at this height */
var CWAY = 17;            /* bridge causeways to the shore are low and level */
var RLAND = 2.6;          /* reclaimed-land causeways: fill height, just above the waterline */

function tierWeights(n){
  var w=[], s=0;
  for(var i=0;i<n;i++){ var v = Math.pow(0.78, i) * (1 + 0.3*(i===0)); w.push(v); s+=v; }
  return w.map(function(v){ return v/s; });
}
function bedAt(x,z){ return Math.min(-6, terrainH(x,z)); }

/* the cardinal (+x/-x/+z/-z) faces of a mono canton that actually have a
   bridge landing on them — used so entrance stairs/doors align to the
   real approach(es) instead of a hardcoded +x/-x pair. A hub like Palace
   has FOUR bridges fanning out at very different bearings (checked: -32,
   134, -91 and 4 degrees) and the old fixed pair matched NONE of them.
   Bearings are snapped to the nearest flat plinth face — the plinth is an
   axis-aligned square, so an unsnapped diagonal would aim a stair at a
   corner — and deduplicated, since several bridges can snap to the same
   face (Palace's -32 and 4 degree bridges both belong on its +z face).
   Falls back to the old +x/-x pair if a canton has no spans at all
   (shouldn't happen for anything actually placed, but keeps this safe to
   call unconditionally). */
function cantonApproachFaces(c){
  var idx = CANTONS.indexOf(c);
  var faces = {};
  SPANS.forEach(function(sp){
    var other = null;
    if(sp.a===idx) other = CANTONS[sp.b];
    else if(sp.b===idx) other = CANTONS[sp.a];
    if(!other) return;
    var ang = Math.atan2(other.x-c.x, other.z-c.z);
    var card = Math.round(ang/(Math.PI/2)) * (Math.PI/2);
    while(card > Math.PI) card -= Math.PI*2;
    while(card <= -Math.PI) card += Math.PI*2;
    faces[card.toFixed(3)] = card;
  });
  var out = Object.keys(faces).map(function(k){ return faces[k]; });
  return out.length ? out : [Math.PI/2, -Math.PI/2];
}
/* the true distance from a square canton's own centre to its cap/wall
   edge along a given bearing — hw at the cardinal faces (0/90/180/270°),
   growing to hw*1.414 at a corner (45°/135°/...). Every plinthDoor() call
   for a FIXED cardinal face already passes the right hw directly; this is
   only needed where the bearing can be a diagonal — the ferry doors,
   which share their canton's pier bearing and, per the owner's canton-
   design notes, point south-east (a corner) for Palace/Temple/Ancestry.
   Same real bug as CPIERS' own root-radius fix (30-layout.js): a bare hw
   used as if every bearing were axis-aligned buries the door in solid
   fill on the diagonal ones — confirmed by screenshot (nothing rendered
   at all, no partial clipping) before this fix. */
function squareEdgeHw(hw, angle){
  return hw / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
}

/* ---- where a canton's walkable levels actually ARE ------------------------
   owner, twice: "make sure there is an appropriately placed canton door at
   ground level close to the causeway", then "a lot of the canton doors are
   up a tier and not on a wall. there should be doors on tiers both where
   there is a bridge (as long as it's not the top level) and where there is
   a causeway. if the bridge connected floor is the top level, it needs a
   staircase leading down".

   Doing that needs one thing nothing in this file had: the real (height,
   radius) of every terrace a person can stand on, and of the wall that
   rises from it. CANTON_TOPS could not answer it —
     - `.hw` is the TOPMOST tier's own top face, not any wall a door goes on
       (the pitfall SUBAGENT.md sec.6 already records, which read a jetty
       rooted on a canton edge as 82 units off);
     - `.tierRings` records each tier's BASE half-width and the height where
       the NEXT one starts, which is neither the terrace surface (the
       cornice on top of the tier is 1.0 higher and 6% wider) nor the face
       radius at any particular height;
     - and 65-facade.js's ordinatorFortress() overwrites the whole record
       for Fortress, tierRings included, so anything read back after the
       build pass is missing that canton entirely.
   CANTON_FACES is written by each canton builder while the numbers are
   still in hand, and nothing overwrites it. Per canton:
     levels[]  outermost/lowest first, one per walkable terrace:
                 y     the terrace's real top surface
                 hw    half-width of the WALL rising from it, at that height
                 outer half-width of the terrace's own outer lip
               the LAST entry is the open top deck and carries top:true —
               there is no wall above it, which is exactly the case the
               owner's rule sends a staircase down instead of a door.
     tiers[]   each tier as built: {yb, th, hwb} — base height, height,
               base half-width. faceHwAt() reads these.
   Verified against a live downward raycast at four cantons before any of
   this was used to place anything (Arsenal/Port/Ancestry causeway bearings
   and Granary's Market-bridge bearing): every predicted terrace height and
   face radius matched the measured surface to under a unit. */
var CANTON_FACES = {};
/* the real outer-face radius of a tier at a given height. FR8 is
   rectFrus(0.86,0.86) (45-kit.js), so a tier's face is NOT vertical: it
   loses 14% of its half-width over its own height — on these cantons a
   ~50 degree batter, confirmed by raycast (Arsenal tier 0 runs from
   r=150 at y=6 to r=131 at y=22). Using the base half-width as if the
   face were vertical is what leaves a door hanging off the slope. */
function faceHwAt(t, y){
  var f = Math.max(0, Math.min(1, (y - t.yb) / Math.max(0.001, t.th)));
  return t.hwb * (1 - 0.14*f);
}
/* how far a tier's face recedes per unit of height — plinthDoor()'s
   opt.lean, scaled to the bearing the door is actually on (a square's
   edge is further away on a diagonal, and so is its batter). */
function faceLean(t, angle){
  return (0.14 * t.hwb / Math.max(0.001, t.th)) /
         Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
}
/* called by each canton builder, never by a consumer. capTopOff is how far
   a cornice's top face sits above the height the tier loop records (1.0 for
   platCanton's 2.0-tall cornice based at th-1.0, 1.2 for monoCanton's
   2.2-tall one); capMul is the cornice's own overhang (1.06 / 1.07). */
function cantonFacesRecord(name, tone, plinthTop, capTopOff, baseOuter, tiers, capMul){
  if(!tiers.length) return;
  var L = [];
  for(var i=0;i<tiers.length;i++){
    var surf = (i===0) ? (plinthTop + capTopOff) : (tiers[i-1].yb + tiers[i-1].th + capTopOff);
    L.push({ y:surf, hw:faceHwAt(tiers[i], surf), outer:(i===0 ? baseOuter : tiers[i-1].hwb*capMul),
             tier:i, top:false });
  }
  var lt = tiers[tiers.length-1];
  L.push({ y: lt.yb + lt.th + capTopOff, hw: lt.hwb*0.86, outer: lt.hwb*capMul, tier:tiers.length, top:true });
  CANTON_FACES[name] = { levels:L, tiers:tiers, tone:tone };
}
/* the highest walkable LEVEL a deck riding at height `y` can put someone
   on. Deliberately terraces only, never "the tier face at exactly deck
   height": a tier's flank is a ~50 degree batter, so a door hung halfway
   up one would be on a wall but standing on a slope. Port is the case
   that proves it — its causeway deck rides at CWAY=17, tier 0 spans y=5
   to 19, and the only floor at 17 is the deck itself, which stops 16
   units short of the flank at that height and is roofed by the abutment
   besides. So a deck that arrives above a terrace gets a stair down to
   it, and a deck that arrives below one (every reclaimed-land mole: flat
   at RLAND, road surface y=3.3, against a plinth apron whose top face is
   at 6) gets a short flight up. `y+1.5` is the step a walker can take
   without one. A bridge deck resolving to the last level (top:true) is
   the owner's staircase-down case. */
function cantonArrivalLevel(name, y){
  var F = CANTON_FACES[name]; if(!F) return null;
  var L = F.levels, best = L[0], idx = 0;
  if(!F.spiral) for(var i=1;i<L.length;i++){ if(L[i].y <= y + 1.5){ best = L[i]; idx = i; } }
  return { y:best.y, hw:best.hw, outer:best.outer, tier:best.tier, top:!!best.top, idx:idx };
}
/* a bearing shifted sideways by `off` world units at radius `rad` — used to
   step a door or a stair clear of the solid abutment/pylon block that sits
   on the very bearing it serves. Measured, not guessed: the causeway ramp
   is FR8(.., rw*0.60, .., rw*0.84, ..) so it is rw*0.30 half-wide, and
   landing()'s pylon is FR8(.., w*1.85, .., w*2.3, ..) so it is w*0.925
   half-wide; a raycast down the Guild/Granary causeway centreline lands on
   the ramp block, not on the canton, which is why this exists. */
function bearingBeside(ang, off, rad){ return ang + off/Math.max(20, rad); }
/* a recessed dark opening on a mono canton's tier-0 face, at the given
   cardinal bearing — reuses the box|stone(default) combo every other flat
   inset in this file already uses, just darkened, so it reads as a
   shadowed doorway rather than a flat wall. Zero new draw calls. */
function plinthDoor(cx,cz,angle,y,hw0,tone,opt){
  /* 5th pass: now placed at tier 1 (the real entrance level, hw0 ~2.3x
     bigger than the old top-tier value it used to get) — being exactly
     where the stair arrives is what makes it findable, so no monumental
     scale is needed. Cap trimmed 8->6 on top of that per direct "still
     too big" feedback on the old (wrong-level) door. Small flanking
     pilasters kept only for a little visual weight. Still
     box|stone(default), zero new draw calls. */
  /* 6th pass (owner: "a lot of the canton doors are up a tier and not on a
     wall"): `opt` is optional and every pre-existing call site passes
     nothing, so their geometry is byte-identical to before. Two new knobs,
     both needed by the arrival-level doors added this pass:
       opt.maxH  — the wall actually available above `y`. A plat canton's
                   upper tiers are only 8-10 units tall, so the default
                   12.6-unit opening is taller than the tier it is cut
                   into; without this the "door" is a slab standing over
                   the cornice, which is half of what "not on a wall"
                   was describing.
       opt.lean  — how far this face recedes per unit of height, ALONG the
                   door's own bearing. Every tier here is an FR8, and
                   rectFrus(0.86,0.86) (45-kit.js) means a tier loses 14%
                   of its half-width over its own height — measured on the
                   live scene that is a ~50 degree batter, not a wall. A
                   vertical opening cannot sit flush on that at both ends,
                   so the door gets a shallow portal block behind it: a
                   vertical-faced porch deep enough to reach back into the
                   slope, with the dark opening in the porch's own face.
                   That is what makes it read as a door IN a wall rather
                   than a dark panel floating off a pyramid. */
  opt = opt || {};
  var dw = Math.min(6, hw0*0.10), dh = dw*2.1;
  if(opt.maxH && dh > opt.maxH){ dh = Math.max(3.2, opt.maxH); dw = Math.min(dw, dh/2.1); }
  if(opt.lean > 0){
    var pdep = Math.min(opt.lean*dh + 2.2, 14);
    var bp = loc(cx,cz, 0, hw0 + 0.2 - pdep*0.5, angle);
    BOX(bp[0], y-0.7, bp[1], dw+7.0, dh+2.6, pdep, angle, shade(tone,0.03));
  }
  var dp = loc(cx,cz, 0, hw0*1.001, angle);
  BOX(dp[0], y, dp[1], dw, dh, 1.4, angle, shade(tone,-0.55));
  [-1,1].forEach(function(s){
    var pp = loc(cx,cz, s*(dw*0.5+1.1), hw0*1.003, angle);
    BOX(pp[0], y-0.6, pp[1], 1.5, dh+1.6, 1.5, angle, shade(tone,0.10));
  });
  var lp = loc(cx,cz, 0, hw0*1.005, angle);
  BOX(lp[0], y+dh+0.6, lp[1], dw+3.4, 1.4, 1.8, angle, shade(tone,0.12));  /* lintel, spans past the pilasters */
  window._plinthDoors = window._plinthDoors || [];
  window._plinthDoors.push({x:dp[0], y:y, z:dp[1], angle:angle, hw0:hw0});
}

/* STAIR_RISE: world units of rise per step, seaStair/linkStair both. Audit
   finding (measured live via a temporary window._stairAudit counter over
   every real call this session): the old fixed n = rise/2.6 averaged a
   ~2.0-2.8 unit riser per step. Life-layer citizens (78-life.js,
   LIFE_PEOPLE_SCALE) stand ~2-2.5 units tall, so that was climbing most of
   a person's own height per step — a ladder, not a stair, exactly the
   failure mode the owner asked to check for. A real-world comfortable
   riser is roughly 1/8-1/6 of standing height; 0.35 sits at ~1/6.4 of a
   2.25-unit-tall citizen (the middle of that range), same constant for
   both functions since a mismatched flight meeting a matched one at a
   landing would be its own bug. Purely a step-count change: seaStair's
   run:rise ratio (1.9) and linkStair's endpoints are untouched, so total
   rise and the ramp's own overall angle are exactly what they were —
   only the per-step granularity gets finer. +~2,490 instances / +~29,900
   triangles city-wide, well inside budget headroom; nothing else moves. */
var STAIR_RISE = 0.35;

/* a broad flight of steps running down a face to the water */
function seaStair(x, z, ry, width, yTop, yBot){
  var n = Math.max(4, Math.round((yTop-yBot)/STAIR_RISE));
  var run = (yTop-yBot)*1.9;
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var p = loc(x,z, 0, run*t, ry);
    BOX(p[0], yBot, p[1], width*(1-0.10*t), mix(yTop,yBot,t)-yBot, run/n*1.35, ry, 0xa79b82);
  }
}
/* a broad flight of steps between two EXPLICIT points at two explicit
   heights (unlike seaStair, which derives its own run from a fixed
   height-to-distance ratio) — for linking a bridge landing's cap platform
   to a canton's own top surface, where both endpoints are already fixed
   by the canton's real geometry, not something a formula should invent.
   Same "tall end nearest the high point, shrinking toward the low point"
   silhouette seaStair uses. Combo: box|stone(default), same as seaStair. */
function linkStair(ax,az,ay, bx,bz,by, width){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 4) return;
  var ry = Math.atan2(dx,dz), yLo = Math.min(ay,by);
  var n = Math.max(4, Math.round(Math.abs(ay-by)/STAIR_RISE));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var x=ax+dx*t, z=az+dz*t, yHere=mix(ay,by,t);
    BOX(x, yLo, z, width*(1-0.05*t), Math.max(0.6,yHere-yLo), L/n*1.3, ry, 0xa79b82);
  }
}

/* the owner's staircase-down case, verbatim: "if the bridge connected floor
   is the top level, it needs a staircase leading down". Every platCanton()
   canton is in it — landing()'s linkStair puts a bridge-borne pedestrian on
   the TOP deck (CANTON_TOPS.y), which by definition has no wall above it to
   hold a door. This runs one flight from the top deck's own cornice edge
   out and down onto the terrace below, and puts the door on THAT terrace's
   wall, which is the nearest real wall to where the bridge actually lands.

   Stepped sideways off the bridge's own bearing (bearingBeside) because
   landing()'s pylon is a solid FR8 w*1.85 across standing on that exact
   line from spring-3 up to the deck: a flight left on the bearing spends
   its top third inside the pylon. Measured on the live scene, not assumed
   — Granary's pylon occupies r=98.6..130.8 from y=29.2 up, and the flight
   runs r=108..122 at y=22.9..33.1.

   Radially outward-and-down rather than a long shallow ramp: the tier
   cornices overhang so far (1.06x the tier's own base) that the terrace
   below reaches only 14-19 units further out than the deck above it. That
   is a 25-37 degree flight for the 7.6-10.2 unit drops actually involved
   here, in the same idiom (and the same box|stone bucket) linkStair
   already uses for every bridge landing. */
function cantonTopDescent(c, ang, w){
  var F = CANTON_FACES[c.n];
  if(!F || F.spiral || F.levels.length < 2) return null;
  var topL = F.levels[F.levels.length-1], below = F.levels[F.levels.length-2];
  var a = bearingBeside(ang, w*0.925 + w*0.45 + 4, squareEdgeHw(topL.outer, ang));
  var r0 = squareEdgeHw(topL.outer, a), r1 = squareEdgeHw(below.outer, a) - 4;
  var dw = squareEdgeHw(below.hw, a);
  if(r1 - r0 < 6 || r1 - dw < 3) return null;   /* no room on the terrace: reported, never forced */
  var p0 = loc(c.x, c.z, 0, r0, a), p1 = loc(c.x, c.z, 0, r1, a);
  linkStair(p0[0], p0[1], topL.y, p1[0], p1[1], below.y, w*0.9);
  inspectClaim((p0[0]+p1[0])*0.5, (p0[1]+p1[1])*0.5, w*0.45, (r1-r0)*0.5, a,
               'cantonStair', 'Canton stair');
  var tier = F.tiers[F.tiers.length-1];
  plinthDoor(c.x, c.z, a, below.y, dw, c.tone,
             { maxH: Math.min(8, tier.th - 2.4), lean: faceLean(tier, a) });
  inspectClaim(c.x + Math.sin(a)*dw, c.z + Math.cos(a)*dw, 6, 4, a, 'cantonDoor', 'Canton door');
  return { y:below.y, hw:dw, ang:a };
}

