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

/* ======================= PALACE: THE GILT REDESIGN =======================
   Owner, verbatim, after rejecting several colour-only mockups: "maybe do a
   version where you add a lot of flying butresses between tiers, a lot of
   fancy skylights and atria, with a lot of gold and a teeny bit of porphyry
   and black trim. you know, really get architectural with it."

   Everything below is ADDITIVE on monoCanton()'s existing massing. The tier
   heights, radii, cornices, CANTON_TOPS (y/hw/spring/entryY/entryHw/
   tierRings) and CANTON_FACES records are untouched, because landing()'s
   bridge stairs, lifeGroundY()/cantonEdgeY() (78-life.js) and the canton-
   door pass all read them. Nothing here is generated: there is not one
   rr()/rnd()/pick()/chance() call in this whole section, so it cannot shift
   the shared fragment-50 PRNG stream and move every canton, district and
   placement built after the Palace (the bug the guild-canton relayout hit).

   ---- FLYING BUTTRESSES, inside an axis-aligned primitive set -------------
   Every primitive here is axis-aligned with a single Y rotation, so a true
   raking arch is not directly expressible. Each buttress is therefore built
   as THREE separate pieces, all of them axis-aligned, which together read as
   one flying buttress from any normal viewing distance:

     1. the PIER — a free-standing battered FR8 block standing out on the
        terrace, on a black basalt plinth, banded with a porphyry course,
        capped with a black abacus and a gilt fillet, and finished with its
        own FR3 pinnacle and gold cone. This part is genuinely axis-aligned
        architecture and needs no approximation at all.
     2. the FLYER — the raking arch. Approximated as a run of N short BOX
        segments marching radially inward and upward from the pier's shoulder
        to the tier wall above. Each segment's TOP follows a straight rake
        (the extrados) and each segment's BASE follows
             soffit(t) = lerp(impostPier, impostWall, t) + archRise*sin(PI*t)
        — a sine hump between the two springing points, i.e. a real arch
        soffit, so the member is thin at the crown and deepens into a haunch
        where it meets the wall, which is the actual profile of a flying
        buttress. The open air UNDER that curve is the thing that makes it
        read as flying rather than as a ramp: at the largest setback the void
        is ~14 units clear of the terrace over a ~19-unit span. Segment depth
        is 1.34x the step so consecutive boxes overlap and the staircase
        reads as a continuous raking member, not as steps.
     3. a gilt COPING — a second, thinner box riding the top of every
        segment, in gold. This is what actually sells it: a continuous bright
        line climbing the rake is read by the eye as an edge, and edges read
        as geometry. Without it the stone segments blend into the tier.
   Plus a black corbel at the landing point. The landing radius is computed
   from the real battered face (faceHwAt on the tier's own recorded geometry)
   at the height the arch actually arrives, so the flyer meets stone rather
   than hanging off a 50-degree slope.

   ---- ATRIA AND SKYLIGHTS ------------------------------------------------
   An atrium here is a corner court pavilion standing ON a terrace: four wall
   segments forming a hollow square ring, a gilt stringcourse, a black
   cornice, an inner colonnade of gold shafts, and — the whole point — an
   ambulatory roof built as FOUR SEPARATE PER-SIDE SLABS that stop well short
   of the middle, so the centre stays a genuine open well straight down onto
   a porphyry floor laid on the terrace deck. That is houseOfHealing()'s
   hard-won rule (65-facade.js): a full-footprint slab whose top face sits
   above floor level silently becomes the floor and buries what is under it.
   The rim of the well is a black oculus ring; the little gold cupolas and
   lantern drums sit on the per-side roof slabs, where they are genuinely
   over the ambulatory rather than over the open court. The two upper, and
   much narrower, terraces get open gold-columned lantern kiosks at their
   corners instead, and every terrace carries a run of gilt lantern drums
   between the buttresses.

   ---- COLOUR -------------------------------------------------------------
   Gold-dominant: every coping, fillet, stringcourse, roof slab, cupola,
   drum, colonnade shaft, dome and spire cap. Black trim is PAL.stone.basalt
   (plinths, abaci, cornices, oculus rims, mullions). Porphyry is the "teeny
   bit": one course per pier, the atrium floors, the drum's window panels and
   one collar per spire. PORPHYRY IS NOT IN THE PALETTE — PAL has no
   red-purple at all, so PALACE_PORPHYRY below is a local literal and the
   planner is asked to promote it to PAL.stone.porphyry.

   This overrides the older "Palace roof and spires will be silver" decision
   (see the comment further down in monoCanton, kept in place): the owner's
   new brief asks for gold. Palace's gold is kept distinct from the Temple's
   own — Temple is a matte ochre gilt (0xc9a227, 'dome'/'roof' families) over
   blood red, Palace is a brighter, glossier gilt on the 'metal' family
   (rough 0.45, so it actually catches the sun) over pale ashlar with black
   basalt trim and no red anywhere.

   ---- DRAW CALLS ---------------------------------------------------------
   One new bucket, dome|metal (65 -> 66 of 72). box|metal and cyl|metal are
   already spent elsewhere in the build (this file's clock faces, 71-industry
   rail furniture, 65-facade's ironwork), so every gilt band, coping, roof
   slab and lantern drum here is free. dome|metal is the one genuinely new
   look the brief demands and nothing else can fake: a matte 'dome'-family
   gold reads as painted stone, which is exactly what the rejected colour-only
   mockups looked like. cone|metal and fr8|metal were considered and dropped —
   the gold cones are small enough that the 'roof' family carries them.
------------------------------------------------------------------------- */
var PALACE_GOLD     = 0xd0a53c;   /* polished gilt — brighter and cleaner than the Temple's ochre,
                                     pulled back from a first-pass 0xd8b34c that read as flat
                                     yellow on the big sunlit faces */
var PALACE_GOLD_DK  = 0x9d7a28;   /* the same gilt in shadow, for undersides and deep bands */
/* imperial porphyry — deep red-purple. Was a local literal here while this
   pass ran, with a note asking for promotion; it now lives in the palette as
   PAL.stone.porphyry, so this is just the alias. The value was pulled down
   from a first-pass 0x6b2334, which read as a pink stripe rather than a
   stone inlay at city distance. */
var PALACE_PORPHYRY = PORPHYRYC[0];

/* one flying buttress at bearing `ang`, `lat` units sideways along that
   face. Every number it needs is precomputed once per setback in
   palaceButtressRing() and handed over in B, so this only draws. */
function palaceButtress(c, ang, lat, B){
  var p = loc(c.x, c.z, lat, B.rP, ang);
  BOX(p[0], B.terrY-1.2,          p[1], B.wP*1.30, 1.6,        B.dP*1.26, ang, BASALTC[0]);          /* plinth */
  FR8(p[0], B.terrY-0.2,          p[1], B.wP,      B.hP+0.2,   B.dP,      ang, B.stone);             /* pier shaft */
  BOX(p[0], B.terrY+B.hP*0.34,    p[1], B.wP*1.05, 0.9,        B.dP*1.04, ang, PALACE_PORPHYRY);     /* porphyry course */
  BOX(p[0], B.terrY+B.hP,         p[1], B.wP*1.18, 1.5,        B.dP*1.16, ang, BASALTC[0]);          /* abacus */
  BOX(p[0], B.terrY+B.hP+1.5,     p[1], B.wP*0.92, 0.8,        B.dP*0.90, ang, PALACE_GOLD, 'metal');/* gilt fillet */
  FR3(p[0], B.terrY+B.hP+2.3,     p[1], B.wP*0.62, B.hP*0.46,  B.dP*0.62, ang, shade(B.stone,0.05)); /* pinnacle */
  CONE(p[0], B.terrY+B.hP+2.3+B.hP*0.46, p[1], B.wP*0.20, B.hP*0.38, ang, PALACE_GOLD);

  /* the rake, segment by segment. nSeg is chosen so the RISE PER STEP is
     smaller than the gilt coping is thick — the first version's steps were
     1.3 units of rise under a 0.85-unit coping, which left a visible gap at
     every joint and read as a gold staircase, not a raking member. */
  var rS = B.rP - B.dP*0.42, rW = B.rWall, run = rS - rW;
  if(run < 4) return;
  var segD = run/B.nSeg*1.45, copeH = Math.max(1.5, (B.yLand-B.springY)/B.nSeg*2.2);
  for(var i=0;i<B.nSeg;i++){
    var t   = (i+0.5)/B.nSeg;
    var r   = rS + (rW - rS)*t;
    var top = B.springY + (B.yLand - B.springY)*t;                                   /* extrados: a straight rake */
    var sof = B.impostY + (B.soffitWall - B.impostY)*t + B.archRise*Math.sin(Math.PI*t);
    var q   = loc(c.x, c.z, lat, r, ang);
    BOX(q[0], sof, q[1], B.wFly,      Math.max(1.2, top-sof), segD, ang, B.stone);
    BOX(q[0], top, q[1], B.wFly*1.12, copeH,                  segD, ang, PALACE_GOLD, 'metal');
  }
  var w = loc(c.x, c.z, lat, rW + 1.2, ang);
  BOX(w[0], B.soffitWall-3.2, w[1], B.wFly*1.6, 3.4, 4.2, ang, BASALTC[0]);          /* wall corbel */

  /* the WALL BUTTRESS the flyer actually braces: a pilaster carried down the
     tier face from the corbel to the terrace. The face is a 50-degree batter,
     so a single vertical box cannot lie on it — this is the same stepped
     approximation the flyer uses, turned on its side, each block set at the
     real face radius for its own height (faceHwAt on the recorded tier
     geometry). Without it the flyer's thrust arrives at a blank wall and the
     whole assembly reads as decoration stuck on a pyramid. */
  var nPil = Math.max(8, Math.round(B.pilH/0.9)), pStep = B.pilH/nPil;
  for(var j=0;j<nPil;j++){
    var py = B.pilTop - (j+1)*pStep;
    var pr = faceHwAt(B.up, py + pStep*0.5) + 1.6;
    var pq = loc(c.x, c.z, lat, pr, ang);
    BOX(pq[0], py, pq[1], B.wFly*1.5, pStep*1.55, 3.6, ang, shade(B.stone, 0.03));
  }
  var cap = loc(c.x, c.z, lat, faceHwAt(B.up, B.pilTop) + 1.8, ang);
  BOX(cap[0], B.pilTop, cap[1], B.wFly*1.8, 1.1, 4.2, ang, PALACE_GOLD, 'metal');
}

/* a corner atrium: a hollow square court on a terrace, open to the sky. */
function palaceAtrium(c, qx, qz, terrY, aHW){
  var ax = c.x + qx, az = c.z + qz;
  var wT = aHW*0.21, wallH = aHW*0.80;
  var stone = shade(c.tone, 0.14);
  var roofIn = aHW - wT - aHW*0.34, roofOut = aHW + 0.6;
  var roofY = terrY + wallH + 0.9;

  BOX(ax, terrY+0.05, az, roofIn*1.86, 0.55, roofIn*1.86, 0, PALACE_PORPHYRY);          /* porphyry court floor */
  CYL(ax, terrY+0.60, az, roofIn*0.34, 0.40, 0, PALACE_GOLD, 'metal');                  /* gilt rosette */
  for(var s=0;s<4;s++){
    var rot = s*Math.PI/2;
    var wp = loc(ax, az, 0, aHW-wT*0.5, rot);
    BOX(wp[0], terrY-0.8, wp[1], aHW*2, wallH+0.8, wT, rot, stone);
    BOX(wp[0], terrY+wallH*0.58, wp[1], aHW*2*1.02, 0.85, wT*1.14, rot, PALACE_GOLD, 'metal');  /* stringcourse */
    BOX(wp[0], terrY+wallH-0.7,  wp[1], aHW*2*1.09, 1.5,  wT*1.62, rot, BASALTC[0]);            /* cornice */
    /* ambulatory roof — ONE SLAB PER SIDE, stopping short of the court, so
       the centre stays a real open well (houseOfHealing()'s rule). */
    var rp = loc(ax, az, 0, (roofIn+roofOut)*0.5, rot);
    BOX(rp[0], roofY, rp[1], aHW*2*1.02, 1.1, roofOut-roofIn, rot, PALACE_GOLD, 'metal');
    var ep = loc(ax, az, 0, roofOut+0.2, rot);
    BOX(ep[0], roofY+1.1, ep[1], aHW*2*1.04, 0.7, 1.4, rot, BASALTC[0]);                        /* eaves line */
    var op = loc(ax, az, 0, roofIn+0.6, rot);
    BOX(op[0], roofY+1.1, op[1], roofIn*2*1.02, 0.9, 1.3, rot, BASALTC[0]);                     /* oculus rim */
    /* the ambulatory floor, ONE STRIP PER SIDE (never a slab across the
       middle — same rule as the roof above it), raised 1.1 above the terrace
       so the court itself is genuinely sunk below the walk around it. That
       step is what makes it read as a well rather than a fenced square: a
       tier here is one solid FR8 block and cannot be perforated, so the
       atrium is built UP from the terrace rather than cut DOWN into the
       tier, and the sunken court is how that difference is disguised. */
    var fp = loc(ax, az, 0, (roofIn + aHW - wT*0.5)*0.5, rot);
    BOX(fp[0], terrY, fp[1], aHW*2*0.99, 1.1, (aHW - wT*0.5) - roofIn, rot, shade(stone,-0.10));
    for(var k=0;k<3;k++){                                                                        /* inner colonnade */
      var cp = loc(ax, az, (k-1)*aHW*0.60, aHW-wT-1.6, rot);
      CYL(cp[0], terrY+1.1, cp[1], aHW*0.058, wallH*0.82, 0, PALACE_GOLD, 'metal');
      DOME(cp[0], terrY+1.1+wallH*0.82, cp[1], aHW*0.085, aHW*0.070, 0, PALACE_GOLD, 'metal');
    }
    for(var g=-1; g<=1; g+=2){                                                                   /* skylight cupolas */
      var lp = loc(ax, az, g*aHW*0.52, (roofIn+roofOut)*0.5, rot);
      CYL(lp[0], roofY+1.1, lp[1], aHW*0.105, aHW*0.30, 0, PALACE_GOLD_DK, 'metal');
      BOX(lp[0], roofY+1.1+aHW*0.30, lp[1], aHW*0.27, 0.5, aHW*0.27, 0, BASALTC[0]);
      DOME(lp[0], roofY+1.6+aHW*0.30, lp[1], aHW*0.130, aHW*0.115, 0, PALACE_GOLD, 'metal');
      CONE(lp[0], roofY+1.6+aHW*0.415, lp[1], aHW*0.032, aHW*0.13, 0, PALACE_GOLD);
    }
  }
  for(var cf=0; cf<4; cf++){                                                                     /* corner posts */
    var ca = cf*Math.PI/2, e = aHW - wT*0.35;
    var pp = loc(ax, az, e, e, ca);
    FR8(pp[0], terrY-0.8, pp[1], wT*1.9, wallH+3.6, wT*1.9, 0, stone);
    BOX(pp[0], terrY+wallH+2.8, pp[1], wT*2.2, 1.1, wT*2.2, 0, BASALTC[0]);
    CONE(pp[0], terrY+wallH+3.9, pp[1], wT*0.62, wT*1.9, 0, PALACE_GOLD);
  }
  inspectClaim(ax, az, aHW, aHW, 0, 'palaceAtrium', 'Palace atrium');
}

/* an open lantern kiosk — the narrow upper terraces' corner marker, and the
   skylight motif in its smallest form. */
function palaceKiosk(c, qx, qz, terrY, kHW){
  var kx = c.x + qx, kz = c.z + qz, colH = kHW*1.15;
  BOX(kx, terrY-0.4, kz, kHW*1.86, 1.1, kHW*1.86, 0, BASALTC[0]);
  BOX(kx, terrY+0.7, kz, kHW*1.52, 0.5, kHW*1.52, 0, PALACE_PORPHYRY);
  for(var k=0;k<4;k++){
    var ka = Math.PI/4 + k*Math.PI/2;
    CYL(kx + Math.cos(ka)*kHW*0.80, terrY+0.7, kz + Math.sin(ka)*kHW*0.80,
        kHW*0.13, colH, 0, PALACE_GOLD, 'metal');
  }
  BOX(kx, terrY+0.7+colH, kz, kHW*1.72, 1.2, kHW*1.72, 0, BASALTC[0]);
  DOME(kx, terrY+1.9+colH, kz, kHW*0.86, kHW*0.66, 0, PALACE_GOLD, 'metal');
  CONE(kx, terrY+1.9+colH+kHW*0.66, kz, kHW*0.16, kHW*0.62, 0, PALACE_GOLD);
}

/* ================= PALACE: BRIDGE ARRIVALS AND FACE GARDENS ===============
   Owner, after the gilt redesign ("for the palace, I love it"): three
   targeted things — the Foreign bridge "runs into the architecture"; the
   Ancestry and Granary bridges "clip into the architecture ... redo the model
   so there are some pointed arches here the bridges can intersect"; and "the
   new model has a somewhat empty space on the midpoints of all 4 sides where
   the gold trim does not run", traced on the south face as
   [[-342.5,802.9],[-369.1,904.6],[-287.2,904.1],[-309.9,802.3]], to be
   gardened on all four faces.

   ---- WHAT ACTUALLY CLIPPED, measured before anything was moved ------------
   Every number below came out of a headless pass over the built scene's own
   InstancedMesh matrices (the same primitives BUCKET pushed), re-expressed in
   each span's own radial/lateral frame about the Palace centre. Not estimated:

     Ancestry (bearing -179.0 deg, deck w=14.0) and Granary (85.9 deg, w=16.6)
       both land within the parapet gap at their face midpoint and are clear of
       every pier, drum and atrium — but both drive straight through TIER 0's
       FACE SPIRE, the 80.4-wide, 44.2-tall cone monoCanton() roots at
       r=204.9 on each face (base y=42.1, apex y=86.3). The deck rides y=52.5
       to 55.5 with parapets to 57.9, i.e. through the fattest part of it.
       That one cone is the whole complaint; nothing else on those two
       bearings is touched.
     Foreign (122.3 deg, w=12.3) is NOT on a face midpoint: it arrives 102.9
       units sideways along the south face, and its deck passes through the
       flying-buttress PIER at lateral 115.7 (shaft 8.5x11.5 from y=55.5 up
       17.3, on an 11.0x14.4 plinth) and across the terrace parapet run.
       Worse, landing()'s own stair foot is placed at RADIUS entryHw=160.7
       along the bearing, and this canton is a SQUARE: at 122.3 deg that point
       is 135.9 from the centre in square terms, i.e. 24.8 units INSIDE tier
       1's solid flank. The stair did not land on a surface at all.
     Temple (-44.5 deg, w=13.3) is the fourth span and the owner did not
       mention it. Reported rather than silently changed: it arrives 135.0
       units sideways along the +x face, which is past the outer pier and into
       the CORNER ATRIUM, and its deck clips that atrium's wall slabs
       (33.6x3.5, y=54.9 up 14.2), its corner post and three of its gold
       colonnade shafts. Its stair foot is 114.7 in square terms — 46 units
       inside tier 1. Fixing it means moving it the same way Foreign moves;
       left alone here because it was not asked for and the swing is large.

   ---- THE RULE FOR WHERE A SPAN MAY LAND ----------------------------------
   The Palace face is divided by its own buttresses, and those divisions are
   what decide this rather than taste. On each face, going out from the
   middle: an open bay at lateral 0 (half-width innerHw*0.24 = 38.6 — the gap
   the terrace parapet already carries, and the owner's garden bay), then a
   pier at 0.30, a clear bay at 0.51, a pier at 0.72, then the run out to the
   corner atrium. So there are exactly TWO places a bridge belongs: the
   midpoint bay, and the 0.51 bay between the two piers. A landing already in
   the midpoint bay is left byte-for-byte alone (Ancestry, Granary); anything
   else still on the face is snapped to the 0.51 bay's own centre (Foreign,
   Temple). The bound is the parapet run's own outer end, innerHw*0.98 = 157.5
   — past that you are in the corner quadrant, where the atrium stands; nothing
   currently lands there.

   SECOND PASS, owner: "fix temple bridge too". That span was left alone the
   first time because at lateral 135.0 it was past the outer pier and read as a
   corner arrival — but it is the worst of the four, measured driving its deck
   through the corner atrium's own corner post (a 6.7x17 FR8), two of its
   33.6 x 14.2 x 3.5 wall slabs, three of its gold colonnade shafts and two
   gilt eaves lines, with its stair foot 46.0 units inside tier 1's solid
   flank. The bound moves from 0.76 to 0.98 of innerHw and it snaps into the
   0.51 bay like any other.

   Why it cannot instead be sent to the midpoint gate on that face, since that
   is the obvious question: Temple sits almost exactly on the Palace's +x/-z
   diagonal — the face snap picks +x by 2.5 units of nothing — so its deck
   leaves whichever face it is given at a steep angle: 55.7 degrees off the
   normal in the 0.51 bay, 61.4 if it were put on the midpoint. Across a
   17-deep gate a 61-degree deck drifts 31 sideways, and with its own 21-unit
   lateral half-footprint it needs about 73 units of clear opening against the
   44 the gate has. It would go in one side and out through the other. The 0.51
   bay is open sky rather than an arch, which is the only thing a diagonal
   arrival fits — and is the whole reason that bay is in this rule. */
var PAL_BAYS = null;
function palaceBays(c, innerHw){
  if(PAL_BAYS && PAL_BAYS.canton === c.n) return PAL_BAYS;
  var idx = CANTONS.indexOf(c), out = [];
  var gapHw = innerHw*0.24, bayLat = innerHw*0.51, faceEnd = innerHw*0.98;
  /* footR is entryHw, which IS tier 1's own base half-width — monoCanton sets
     entryHw = hw*0.80 at the end of tier 0 and that is exactly this innerHw.
     Taken from the argument rather than from CANTON_TOPS so this can be called
     from inside the tier loop, before that record exists (the face gates need
     it there). */
  var rL = c.r*0.94, footR = innerHw;
  SPANS.forEach(function(sp){
    var other = (sp.a===idx) ? CANTONS[sp.b] : (sp.b===idx) ? CANTONS[sp.a] : null;
    if(!other) return;
    var dx = other.x-c.x, dz = other.z-c.z, L = Math.hypot(dx,dz) || 1;
    var rx = c.x + dx/L*rL, rz = c.z + dz/L*rL;          /* what the SPANS loop would use */
    var ox = rx-c.x, oz = rz-c.z;
    var nx, nz;                                           /* the flat face it belongs to */
    if(Math.abs(ox) > Math.abs(oz)){ nx = ox>0?1:-1; nz = 0; } else { nx = 0; nz = oz>0?1:-1; }
    var tx = -nz, tz = nx;                                /* that face's own sideways axis */
    var lat = ox*tx + oz*tz, tgt = lat, moved = false;
    if(Math.abs(lat) > gapHw && Math.abs(lat) <= faceEnd){
      tgt = (lat<0?-1:1)*bayLat; moved = true;
    }
    var ax = moved ? c.x + nx*rL + tx*tgt : rx;
    var az = moved ? c.z + nz*rL + tz*tgt : rz;
    /* the deck's own direction out of this landing — NOT the face normal. A
       bridge that leaves at an angle drifts sideways as it crosses the parapet
       band, and the terrace has to be opened where the deck actually is rather
       than symmetrically about the landing. The far end is where the SPANS
       loop puts it, off the unshifted centre line, so this is the real deck
       bearing and not an approximation of it. */
    var obx = other.x - dx/L*other.r*0.94, obz = other.z - dz/L*other.r*0.94;
    var vx = obx-ax, vz = obz-az, vl = Math.hypot(vx,vz) || 1;
    out.push({ other:other.n, nx:nx, nz:nz, tx:tx, tz:tz, lat:tgt, rawLat:lat, moved:moved,
               rawX:rx, rawZ:rz, x:ax, z:az, vx:vx/vl, vz:vz/vl,
               footX: c.x + nx*footR + tx*tgt,
               footZ: c.z + nz*footR + tz*tgt });
  });
  out.canton = c.n;
  PAL_BAYS = out;
  window._palaceBays = out.map(function(b){
    return { from:b.other, lat:Math.round(b.lat), wasLat:Math.round(b.rawLat), moved:b.moved,
             x:Math.round(b.x), z:Math.round(b.z),
             obliqueDeg:Math.round(Math.acos(Math.min(1,Math.abs(b.vx*b.nx+b.vz*b.nz)))*180/Math.PI) };
  });
  return out;
}
/* the SPANS loop's hook. Returns null for every canton but the Palace and for
   every Palace arrival that is staying exactly where it was, so the geometry
   and — more to the point — the PRNG draw sequence of every other span is
   untouched. `foot` is the stair's real landing on tier 1's FLAT face, which
   is what landing()'s own radius-based guess cannot give on a square. */
function palaceLandingShift(c, ax, az){
  if(c.n !== 'Palace' || !PAL_BAYS) return null;
  for(var i=0;i<PAL_BAYS.length;i++){
    var b = PAL_BAYS[i];
    if(Math.abs(b.rawX-ax) < 0.5 && Math.abs(b.rawZ-az) < 0.5)
      return b.moved ? { x:b.x, z:b.z, foot:[b.footX, b.footZ] } : null;
  }
  return null;
}

/* ---- A POINTED ARCH, inside an axis-aligned primitive set ----------------
   Owner: "redo the model so there are some pointed arches here the bridges
   can intersect". This replaces tier 0's face-spire CONE — the thing the
   Ancestry and Granary decks were measured driving through — with a gate
   pierced by a pointed arch, standing on the spire's own FR8 podium, which is
   kept exactly as it was. Built on all four faces, because the parapet gap,
   the garden bay and the tier-0 spire are all already symmetric and a gate on
   two faces only would read as damage.

   Approximation, and why this shape and not the other one:
     - The half-dome-over-a-lintel trick the chapel and monastery gates use is
       a ROUND arch and cannot be made to read as pointed; sized against an
       opening this wide it has also twice ballooned into a mushroom cap. Not
       used here.
     - What IS expressible is the flying buttresses' own lesson from the gilt
       pass: a stepped run of axis-aligned boxes reads as a curve as soon as a
       continuous bright EDGE follows it. So the arch head is a ring of N
       stacked voussoir boxes whose inner face follows a real two-centred
       arch intrados, struck from a centre set eFr*halfSpan OUTBOARD of the
       opposite impost —
           e = eFr*halfSpan,  R = halfSpan + e,  rise = halfSpan*sqrt(1+2*eFr)
           x(dy) = sqrt(R*R - dy*dy) - e          (dy measured up from the impost)
       — which is the classical drop-arch construction, and the outboard
       centre is exactly what makes the two arcs CROSS at a point instead of
       meeting tangentially in a crown. Each course carries a black soffit
       liner on its inner edge (so the opening reads as a shadow, not a stone
       slot) and a gilt line on its outer edge; those two converging lines,
       meeting at a porphyry keystone, are what say "pointed", and the stone
       behind them can step as coarsely as it likes.
     - eFr = 0.68: rise 1.54 halfSpans, rise:span 0.77 (an equilateral arch is
       0.87, a semicircle 0.50) and a 132-degree crown. Screenshot-driven — see
       the note in the function itself for what the first, much flatter, cut
       actually looked like.

   SIZED OFF THE REAL BRIDGE, NOT OFF THE WALL, and the first cut of this got
   it wrong in a way worth recording: a 38-wide opening centred on the face
   midpoint looked generous until the built scene was re-measured, and the
   Granary deck was found clipping 4.1 units into the right jamb. The bridge
   does not arrive down the middle — that landing sits 13.9 sideways of the
   midpoint and the deck drifts a further 0.9 outward over the gate's own
   depth, so the widest deck-plus-parapets in the city (w=16.56, half-span
   8.25) actually occupies lateral +6.6 to +23.1, not +-8.25. And the widest
   thing to pass through is not the deck at all but landing()'s own cap
   PLATFORM under it (w*2.05 by w*2.6 = 33.9 x 43.0), which spans lateral -4.5
   to +32.4 and reaches out to r=214.9, i.e. all the way to the tier-0 cornice
   edge where the gate has to stand. So:
     - the opening is half-width 22.0 (44 clear), against that 36.9-wide cap;
     - the gate SLIDES sideways to follow the bridge it serves, by that
       landing's own lateral offset (south 13.9, west -3.3 — Ancestry lands
       almost dead centre; north and east not at all), clamped to 0.42 of the
       parapet gap so it stays recognisably a midpoint gate. That leaves 3.5
       clear either side of the cap, 8.1 clear of the widest parapet, and the
       outer of landing()'s two flanking pinnacles inside the arch head with
       4.5 to spare at its own tip height.
   The south gate's flank then runs 4.9 past the end of the parapet run beside
   it; that is deliberate and left alone — a low 1.9-unit terrace parapet
   dying into a gate pier is what should happen, and the pier and the gate
   never meet (the flying-buttress piers sit at r=178.7-190.1, the gate at
   r=196.4-213.4).

   The springing at ySill+0.78*halfSpan = 59.2 is chosen to READ — level with
   the deck parapets so the arch looks as if it springs off the roadway — not
   to clear them: the parapets run at lateral +-8.25 and the jambs start at 22,
   and at lateral 8.25 the arch soffit is already at y=88.0, so nothing can
   touch whatever the springing height is. Apex y=93.0, against the 86.3 of the
   cone it replaces; the crown cornice tops out at 97.4 and the gilt finial at
   103.2. The cone was 80.4 wide and this gate is 59.0, so the face midpoint
   reads taller and narrower than it did, which is the one deliberate change
   the pointed arch forces on a silhouette the owner already liked. */
/* how far this face's gate slides to stay over the bridge that passes through
   it: that arrival's own lateral offset, clamped so the gate block still stops
   inside the parapet gap. Only a MIDPOINT arrival counts — a span that had to
   be moved out to the 0.51 bay, or one that arrives at a corner, is not coming
   through this gate and must not drag it sideways. `a` is the spire loop's own
   face angle, whose outward direction is (cos a, sin a). The sideways axis
   must be loc()'s OWN — (sin a, -cos a) for the gry = PI/2 - a that palaceGate
   builds in — not palaceBays()'s canonical (-nz, nx), which is its negative:
   the first cut used the canonical one and slid the south gate 8.2 units the
   wrong way, putting its right jamb straight through the Granary deck. */
function palaceGateShift(c, a, innerHw, jOut){
  var bays = palaceBays(c, innerHw), gapHw = innerHw*0.24, lim = gapHw*0.42;
  var nx = Math.cos(a), nz = Math.sin(a), tx = Math.sin(a), tz = -Math.cos(a), best = 0;
  for(var i=0;i<bays.length;i++){
    var b = bays[i];
    if(b.moved) continue;
    if(Math.abs(b.nx-nx) > 1e-6 || Math.abs(b.nz-nz) > 1e-6) continue;
    if(Math.abs(b.rawLat) > gapHw) continue;                  /* a corner arrival, not this gate's */
    var l = (b.x-c.x)*tx + (b.z-c.z)*tz;
    if(Math.abs(l) > Math.abs(best)) best = l;
  }
  return Math.max(-lim, Math.min(lim, best));
}
/* the gates are raised inside monoCanton's own tier loop, which runs BEFORE
   palaceArchitecture() and therefore outside its BUCKET-diff bracket, so they
   keep their own tally rather than being left out of the reported cost. */
var PAL_GATE_I = 0;
function palaceGate(c, a, rG, ySill, oHW, dG, tone, shift){
  var gi0 = bucketTotal();
  var gry  = Math.PI/2 - a;                      /* loc()'s radial axis == this face's normal */
  var jOut = oHW*1.34;                           /* the gate block's own half-width */
  var ySpr = ySill + oHW*0.78;                   /* the impost line, above every deck parapet */
  /* the two-centred construction. eFr is the ONE number that decides whether
     this reads as pointed: each arc is struck from a centre set eFr*halfSpan
     OUTBOARD of the opposite impost, so the two arcs cross at the crown at
     2*atan(...) instead of meeting tangentially. At eFr=0 it is a semicircle;
     at eFr=1 an equilateral arch. 0.68 gives a 132-degree crown and a rise of
     1.54 halfSpans — the first cut of this pass derived the rise directly
     (rise = 1.20*halfSpan, eFr 0.22 implied) to keep the apex near the 86.3 of
     the cone it replaces, and the screenshot showed exactly what that number
     means: a 159-degree crown, i.e. a flat-topped hole. Height had to give. */
  var eFr  = 0.68;
  var e    = oHW*eFr, R = oHW*(1+eFr), hA = oHW*Math.sqrt(1+2*eFr);
  var vD   = oHW*0.34;                           /* voussoir depth */
  var N    = 24;
  var st   = shade(tone, 0.13);
  var S    = shift || 0;
  function at(l){ return loc(c.x, c.z, S+l, rG, gry); }
  function xi(dy){ return Math.sqrt(Math.max(0, R*R - dy*dy)) - e; }

  BOX(at(0)[0], ySill-2.4, at(0)[1], jOut*2*1.10, 2.4, dG*1.10, gry, BASALTC[0]);   /* corbel course */
  /* jambs, with a porphyry course and a black impost block */
  [-1,1].forEach(function(s){
    var p = at(s*(oHW+jOut)*0.5);
    BOX(p[0], ySill,              p[1], jOut-oHW,        ySpr-ySill, dG,      gry, st);
    BOX(p[0], ySill+(ySpr-ySill)*0.46, p[1], (jOut-oHW)*1.04, 1.0,   dG*1.03, gry, PALACE_PORPHYRY);
    BOX(p[0], ySpr-1.6,           p[1], (jOut-oHW)*1.12, 1.6,        dG*1.08, gry, BASALTC[0]);
    var q = at(s*(oHW+0.7));
    BOX(q[0], ySill, q[1], 1.4, ySpr-ySill, dG*1.02, gry, BASALTC[2]);   /* jamb soffit liner */
  });
  /* THE ARCH HEAD. Each course spans one height band and starts at that band's
     INNERMOST soffit radius, so consecutive voussoirs overlap and the ring is
     continuous — the little tread it leaves poking into the opening is the
     stepping, and it points inward where nothing passes rather than outward
     where it would break the line. Every member's width carries that band's
     own lateral step, which is what keeps the black soffit line and the gilt
     extrados line UNBROKEN right up to the crown: near the apex the arch
     advances 3.6 sideways per 1.9 of rise, and a fixed 1.6-wide gilt bar there
     leaves a 2-unit hole at every joint. Same lesson as the flying buttresses'
     coping, one axis over. */
  for(var k=0;k<N;k++){
    var y0 = ySpr + hA*k/N, y1 = ySpr + hA*(k+1)/N;
    var x0 = xi(hA*k/N), x1 = xi(hA*(k+1)/N), step = Math.max(0, x0-x1);
    var hk = (y1-y0)*1.15, wv = vD + step;
    var wl = Math.max(1.4, step*0.95), wg = Math.max(1.6, step*0.95);
    [-1,1].forEach(function(s){
      var p = at(s*(x1 + wv*0.5));
      BOX(p[0], y0, p[1], wv, hk, dG, gry, st);                          /* voussoir */
      var q = at(s*(x1 + wl*0.5));
      BOX(q[0], y0, q[1], wl, hk, dG*1.02, gry, BASALTC[2]);             /* soffit shadow line */
      var g = at(s*(x1 + wv + wg*0.5));
      BOX(g[0], y0, g[1], wg, hk, dG*1.06, gry, PALACE_GOLD, 'metal');   /* the gilt extrados line */
      var sw = jOut - (x1 + wv + wg);
      if(sw > 0.9){
        var sp = at(s*(jOut - sw*0.5));
        BOX(sp[0], y0, sp[1], sw, hk, dG, gry, st);                      /* spandrel */
      }
    });
  }
  var ap = at(0), yA = ySpr + hA;
  BOX(ap[0], yA-2.0, ap[1], vD*1.15, 4.4, dG*1.04, gry, PALACE_PORPHYRY);/* keystone, on the point */
  BOX(ap[0], yA+2.4, ap[1], jOut*2*1.12, 2.0, dG*1.14, gry, BASALTC[0]); /* cornice */
  BOX(ap[0], yA+4.4, ap[1], jOut*2*0.98, 0.9, dG*1.02, gry, PALACE_GOLD, 'metal');
  FR3(ap[0], yA+5.3, ap[1], oHW*0.44, oHW*0.17, dG*0.44, gry, st);
  CONE(ap[0], yA+5.3+oHW*0.17, ap[1], oHW*0.16, oHW*0.22, gry, PALACE_GOLD);
  [-1,1].forEach(function(s){                                            /* flanking pinnacles */
    var p = at(s*jOut*0.84);
    FR3(p[0], yA+4.4, p[1], oHW*0.24, oHW*0.26, dG*0.28, gry, st);
    CONE(p[0], yA+4.4+oHW*0.26, p[1], oHW*0.09, oHW*0.22, gry, PALACE_GOLD);
  });
  inspectClaim(ap[0], ap[1], jOut, dG*0.5, gry, 'palaceGate', 'Palace bridge gate');
  PAL_GATE_I += bucketTotal() - gi0;
}

/* ---- THE FOUR FACE GARDENS ----------------------------------------------
   The owner's traced polygon is the parapet gap, seen from above: the terrace
   parapets carry a gap of innerHw*0.24 at lateral 0 on every face and every
   terrace, so the gaps stack into one radial strip per face running from
   r~102 out to the edge — which is exactly the 102-to-205 extent the owner
   traced, i.e. the bays on terraces 0, 1 and 2. All four faces get the same
   garden, laid in the canton's own face frame, so they mirror by construction.

   Formal, not scattered: a sunk gravel parterre with a gilt kerb, a 2x3 grid
   of porphyry-rimmed beds, clipped planting walked around each bed's own
   perimeter at an even step, a specimen at each bed's centre and a gilt
   basin on the bay's axis. The idiom is 70-veg.js's GARDENS section (an
   arranged perimeter walk, alternating two forms, one specimen at a recorded
   centre) rather than its wild scatter, and the species are that file's own
   builders — treeFern / giantGroundselV / birch / monkeyPuzzle / shrubCushion
   / succRosette / succBarrel — called, never reimplemented.

   TWO THINGS THIS HAS TO GET RIGHT
   1. It shares two of its twelve bays with a bridge. The Granary landing sits
      at lateral +13.9 of the south bay and the Ancestry landing at -3.3 of the
      west bay, each with a stair running inboard from it, and tier 1's own
      face spire stands in the middle of the north bay (it survives there
      because north is the one face with no bridge and so no approach door).
      So every piece is tested against a reservation list built from those
      real positions before it is drawn, and the planting closes around them
      instead of being placed on top: the bridge arrives through its gate and
      over the paving, with the beds either side of it.
   2. It must not consume a random number. Those builders are full of
      rr()/pick()/ri(), and this runs inside 50-cantons.js's canton loop where
      a single extra draw would move every canton, district and placement
      generated afterwards. The PRNG seed is therefore saved, set to a value
      derived from the bay's own face and terrace index, and restored — so the
      planting varies bay to bay, is identical run to run, and the stream the
      rest of this fragment sees is byte-for-byte what it was. */
/* Reserved ground on terrace 0 — the two bridge landings with their stairs,
   and tier 1's own face spire. Rectangles in each face's own lateral/radial
   frame rather than circles: a circle big enough to cover a 34x44 pylon cap
   also swallows half the bay, and the whole point is that the garden closes
   tightly around what is actually there. The pylon is sized at the widest a
   span can be (rr(12,17) -> 17), because the real w is drawn later, in the
   SPANS loop, and reading it here would mean consuming that draw early. */
var PAL_RESERVE = [];
function palFree(x,z,rad,ti){ return palFreeRect(x,z,rad,rad,0,ti); }
/* the rectangular form, for the beds and paving cells: a bed is 14.8 by 12.7
   and testing it as a disc of its own half-diagonal rejected two cells on the
   south face that clear the Granary landing's cap by 3.9 in reality. `ang` is
   ignored when hl === hr, so the point form above just calls through. */
function palFreeRect(x,z,hl,hr,ang,ti){
  for(var i=0;i<PAL_RESERVE.length;i++){
    var o = PAL_RESERVE[i];
    if(o.ti !== ti) continue;
    var dx = x-o.x, dz = z-o.z;
    var la = dx*Math.cos(o.a) - dz*Math.sin(o.a);
    var rd = dx*Math.sin(o.a) + dz*Math.cos(o.a);
    if(Math.abs(la) < o.hl+hl && Math.abs(rd) < o.hr+hr) return false;
  }
  return true;
}
function palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, ti, fi){
  var rIn = innerHw + 1.8, rOut = outerHw - 4.2, latHw = gapHw - 2.2;
  var depth = rOut - rIn;
  if(depth < 12 || latHw < 12) return 0;
  var rMid = (rIn+rOut)*0.5, planted = 0;
  var nU = 2, nV = 4;
  /* the gilt kerb round the bay, in segments rather than four long boxes, so
     the reservation test can drop the ones a bridge crosses. The first cut ran
     the outer kerb as one 72.7-unit bar and it came out lying across the
     Granary deck at y=56.2, between its parapets — caught by re-measuring the
     built scene, not by eye. */
  [-1,1].forEach(function(s){
    for(var i=0;i<nU;i++){
      var lz = -depth*0.5 + (i+0.5)*depth/nU;
      var p = loc(c.x, c.z, s*latHw, rMid+lz, ang);
      if(palFree(p[0], p[1], 1.6, ti))
        BOX(p[0], terrY+0.5, p[1], 1.4, 0.7, depth/nU, ang, PALACE_GOLD, 'metal');
    }
    for(var j=0;j<nV;j++){
      var lx = -latHw + (j+0.5)*(latHw*2)/nV;
      var q = loc(c.x, c.z, lx, rMid + s*depth*0.5, ang);
      if(palFree(q[0], q[1], 1.6, ti))
        BOX(q[0], terrY+0.5, q[1], (latHw*2)/nV, 0.7, 1.4, ang, PALACE_GOLD, 'metal');
    }
  });

  var cW = (latHw*2)/nV, cD = depth/nU, bW = cW-3.4, bD = cD-3.4;
  /* the species builders all call 70-veg.js's floraSample(), whose FLORA_SAMPLE
     table is a `var` in that fragment — declared (hoisted into BUILD's one
     scope) but not yet assigned this early in file order. Given a value here so
     the call works; 70-veg.js re-initialises it to {} when it runs, which is
     right — that table is only a screenshot aid and the Palace's planting is
     not part of the wild-flora sample set. */
  if(!FLORA_SAMPLE) FLORA_SAMPLE = {};
  var seed0 = seed;                       /* --- PRNG fenced off from here --- */
  reseed(940000 + fi*97 + ti*13);
  for(var u=0;u<nU;u++) for(var v=0;v<nV;v++){
    var lv = -latHw + (v+0.5)*cW, lu = rIn + (u+0.5)*cD;
    var bc = loc(c.x, c.z, lv, lu, ang);
    var gy = terrY + 1.7, ring = 6, slot = [];
    for(var i=0;i<ring;i++){                     /* an even walk round the bed, two forms */
      var t = (i/ring)*4, sd = Math.floor(t), q2 = (t-sd)*2-1;
      var lx = sd===0 ? q2*bW*0.40 : sd===1 ? bW*0.40 : sd===2 ? -q2*bW*0.40 : -bW*0.40;
      var lz = sd===0 ? -bD*0.40 : sd===1 ? q2*bD*0.40 : sd===2 ? bD*0.40 : -bD*0.40;
      var p = loc(bc[0], bc[1], lx, lz, ang);
      slot.push(palFree(p[0], p[1], 2.4, ti) ? p : null);
    }
    var nFree = slot.filter(function(p){ return !!p; }).length;
    /* the paving is laid whatever else happens — a bay with a bridge in it wants
       a forecourt where you step off the deck, not a half-empty planter. The bed
       itself only goes in where enough of its own border survives to read as
       planting rather than as an abandoned trough. */
    if(palFreeRect(bc[0], bc[1], cW*0.5-0.3, cD*0.5-0.3, ang, ti))
      BOX(bc[0], terrY,   bc[1], cW-0.6, 0.5, cD-0.6, ang, shade(c.tone,-0.16));  /* gravel */
    if(!palFreeRect(bc[0], bc[1], bW*0.5+0.85, bD*0.5+0.85, ang, ti) || nFree < 4) continue;
    BOX(bc[0], terrY+0.5, bc[1], bW+1.7, 0.8, bD+1.7, ang, PALACE_PORPHYRY);      /* bed rim */
    BOX(bc[0], terrY+1.3, bc[1], bW,     0.4, bD,     ang, shade(c.tone,-0.34));  /* bed soil */
    for(var i2=0;i2<ring;i2++){
      var p2 = slot[i2]; if(!p2) continue;
      if(i2%2===0) succRosette(p2[0], gy, p2[1], 1.30); else shrubCushion(p2[0], gy, p2[1], 1.40);
      planted++;
    }
    if(palFree(bc[0], bc[1], 5.0, ti)){
      var k = (u*nV + v + ti + fi) % 3;
      if(k===0)      treeFern(bc[0], gy, bc[1], 0.85);
      else if(k===1) giantGroundselV(bc[0], gy, bc[1], 0.78);
      else           succBarrel(bc[0], gy, bc[1], 1.90);
      planted++;
    }
  }
  /* a clipped hedge walked round the bay's own border at an even step — the
     same perimeter-walk idiom as 70-veg.js's compound and cloister gardens.
     This is what keeps a bay legible as a garden even where a bridge landing
     or tier 1's face spire has taken most of the middle of it. */
  var hedge = 16;
  for(var hh=0; hh<hedge; hh++){
    var t2 = (hh/hedge)*4, s2 = Math.floor(t2), q3 = (t2-s2)*2-1;
    var hx = s2===0 ? q3*(latHw-2.6) : s2===1 ? (latHw-2.6) : s2===2 ? -q3*(latHw-2.6) : -(latHw-2.6);
    var hz = s2===0 ? -(depth*0.5-2.6) : s2===1 ? q3*(depth*0.5-2.6)
                    : s2===2 ? (depth*0.5-2.6) : -(depth*0.5-2.6);
    var hp = loc(c.x, c.z, hx, rMid+hz, ang);
    if(!palFree(hp[0], hp[1], 2.2, ti)) continue;
    if(hh%2===0) shrubCushion(hp[0], terrY+0.5, hp[1], 1.25);
    else         succRosette(hp[0], terrY+0.5, hp[1], 1.15);
    planted++;
  }
  /* the axis: a gilt-rimmed porphyry basin where the bay is clear, and on the
     broad lowest terrace a pair of dark specimen trees at the inner corners */
  var bx = loc(c.x, c.z, 0, rIn + depth*0.5, ang);
  if(palFree(bx[0], bx[1], 7.0, ti)){
    CYL(bx[0], terrY+0.5, bx[1], latHw*0.20, 1.3, 0, PALACE_PORPHYRY);
    CYL(bx[0], terrY+1.8, bx[1], latHw*0.17, 0.5, 0, PALACE_GOLD, 'metal');
    CONE(bx[0], terrY+2.3, bx[1], latHw*0.05, latHw*0.22, 0, PALACE_GOLD);
  }
  if(ti === 0){
    [-1,1].forEach(function(s){
      var p = loc(c.x, c.z, s*latHw*0.76, rIn + depth*0.18, ang);
      if(!palFree(p[0], p[1], 8.0, ti)) return;
      if(fi % 2 === 0) monkeyPuzzle(p[0], terrY+0.5, p[1], 0.80);
      else             birch(p[0], terrY+0.5, p[1], 1.30);
      planted++;
    });
  }
  seed = seed0;                           /* --- PRNG restored, nothing consumed --- */
  var mid = loc(c.x, c.z, 0, rMid, ang);
  inspectClaim(mid[0], mid[1], latHw, depth*0.5, ang, 'palaceGarden', 'Palace face garden');
  return planted;
}

/* the whole additive programme, driven off the tier geometry monoCanton()
   has already recorded. Called once, after the tier loop. */
function palaceArchitecture(c, tierGeom, tierRings, topY){
  /* 4 per face, not the 6 the first pass tried: at 6 the piers were small
     enough that the terraces read as crowded with gold knick-knacks rather
     than as braced architecture. Fewer and much bigger is the whole
     difference between "a lot of flying buttresses" and clutter. */
  var NB = [4,4,4,4], LAT = { 4:[0.30,0.72] };
  var nButt = 0, nSky = 0, nAtria = 0;
  /* measured, not estimated: BUCKET (45-kit.js) is the one place every
     primitive lands, so summing its lists either side of this function gives
     an exact instance count for the redesign — reported rather than inferred
     from the budget delta, which concurrent passes in other fragments would
     otherwise contaminate. */
  var inst0 = 0, bk, pre = {}; for(bk in BUCKET){ pre[bk] = BUCKET[bk].list.length; inst0 += pre[bk]; }

  /* ---- where the bridges actually arrive, and what that reserves ---------
     Resolved once, here, off SPANS and the tier geometry — so the parapet
     runs, the terrace lanterns, the gardens and the SPANS loop's own landing
     all read ONE answer instead of three guesses. See palaceBays()'s comment
     for the rule and for the measured clips it exists to clear. */
  var bays = palaceBays(c, tierGeom[1].hwb), nGarden = 0, nBay = 0;
  PAL_RESERVE = [];
  var wMax = 17, rLand = c.r*0.94, footR = CANTON_TOPS[c.n].entryHw;
  bays.forEach(function(b){
    var ba = Math.atan2(b.nx, b.nz);
    PAL_RESERVE.push({ x:b.x, z:b.z, a:ba, hl:wMax*1.03+1.2, hr:wMax*1.32+1.2, ti:0 });
    PAL_RESERVE.push({ x:(b.x+b.footX)*0.5, z:(b.z+b.footZ)*0.5, a:ba,
                       hl:wMax*0.45+1.2, hr:(rLand-footR)*0.5+1.2, ti:0 });
  });
  /* tier 1's own face spire stands on terrace 0 at lateral 0 of whichever
     face carries no bridge approach (monoCanton skips it on the others so the
     approach door has a wall) — the same doorFace test, re-derived here from
     cantonApproachFaces() rather than passed in, so this cannot drift out of
     step with the loop that builds them. */
  var dFace = {};
  cantonApproachFaces(c).forEach(function(a2){
    var sx = Math.sin(a2), sz = Math.cos(a2);
    dFace[(Math.abs(sx) > Math.abs(sz)) ? (sx>0?0:2) : (sz>0?1:3)] = true;
  });
  var sHw = tierGeom[1].hwb;
  for(var sf=0; sf<4; sf++){
    if(dFace[sf]) continue;
    var sa = sf*Math.PI/2;
    PAL_RESERVE.push({ x:c.x + Math.cos(sa)*sHw*1.02, z:c.z + Math.sin(sa)*sHw*1.02,
                       a:Math.PI/2 - sa, hl:sHw*0.17+1.6, hr:sHw*0.17+1.6, ti:0 });
  }

  /* gilt stringcourse + porphyry hairline on every tier, recessed INSIDE the
     cornice overhang (hw*1.035 against the cornice's own hw*1.07) so nothing
     is added above the cornice top face — cantonFacesRecord()'s capTopOff of
     1.2 and the walkable ring deck both stay exactly where they were. */
  tierGeom.forEach(function(t){
    BOX(c.x, t.yb+t.th-3.0, c.z, t.hwb*2*1.035, 1.0, t.hwb*2*1.035, 0, PALACE_GOLD, 'metal');
    BOX(c.x, t.yb+t.th-4.2, c.z, t.hwb*2*1.014, 0.55, t.hwb*2*1.014, 0, PALACE_PORPHYRY);
  });

  for(var i=0; i<tierGeom.length-1; i++){
    var lo = tierGeom[i], up = tierGeom[i+1];
    var innerHw = up.hwb, outerHw = lo.hwb*0.99, wid = outerHw - innerHw;
    var terrY = tierRings[i].y + 2.6;              /* the ring deck's own top face */
    if(wid < 8) continue;

    var B = {};
    B.terrY  = terrY;
    B.stone  = shade(c.tone, 0.12);
    /* The pier stands well OUT on the terrace (0.62 of its width) and is
       slender rather than bulky, and the flyer springs from barely half way
       up it, leaving the pier's upper third, abacus and pinnacle standing
       free above the arch. That is the proportion that makes the thing read
       as a flying buttress instead of a ramp: at the first pass the pier
       was short, fat and close in, and the flyer was a small gold slope
       tucked behind it. Springing low is also what buys the RISE — the
       upper tier is only 27 units tall over a 38-unit terrace, so a flyer
       that springs from the pier's top has almost nothing left to climb. */
    B.dP     = Math.max(6, Math.min(wid*0.30, 13));
    B.wP     = Math.max(5.0, B.dP*0.74);
    B.rP     = innerHw + wid*0.62;
    B.hP     = Math.max(7, up.th*0.62);
    B.springY    = terrY + B.hP*0.55;              /* extrados springs mid-pier */
    B.impostY    = terrY + B.hP*0.34;              /* soffit springs off the pier's shoulder */
    B.yLand      = up.yb + up.th*0.90;             /* lands just under the tier cornice */
    B.soffitWall = B.impostY + (B.yLand - B.springY)*0.50;
    B.rWall      = faceHwAt(up, B.soffitWall);
    B.archRise   = (B.yLand - B.springY)*0.28 + 1.2;
    B.wFly       = B.wP*0.62;
    /* The stepping is intrinsic and cannot be designed away: the boxes
       advance by `spacing` and climb by `spacing*tan(rake)`, so the exposed
       tread is ALWAYS one spacing wide no matter how much consecutive
       segments overlap in depth (overlapping more just buries the far end of
       each tread, never the near end — worked through rather than guessed).
       The only real lever is making the spacing small enough to disappear,
       so nSeg is set from the run at ~0.95 units per step: about 4px at the
       distance these are actually looked at, and still only ~15px nose to
       the stone. Costs ~3,300 boxes across all 64 buttresses, which this
       budget has room for. */
    B.nSeg       = Math.max(8, Math.round(((B.rP - B.dP*0.42) - B.rWall)/0.95));
    B.up         = up;
    B.pilTop     = up.yb + up.th - 1.4;            /* just under the tier's own cornice */
    B.pilH       = B.pilTop - terrY;

    var nb = NB[i], lats = LAT[nb];
    for(var f=0; f<4; f++){
      var ang = f*Math.PI/2;
      lats.forEach(function(fr){
        [-1,1].forEach(function(sg){
          palaceButtress(c, ang, sg*fr*innerHw, B); nButt++;
        });
      });
      /* terrace parapet: two runs per face with a gap at the middle, where
         monoCanton's own face spire already stands (tier 1's spire is rooted
         on this very terrace at lateral 0 — checked, not assumed). */
      var gapHw = innerHw*0.24, runL = (innerHw*0.98 - gapHw);
      /* a span that had to be moved out to the 0.51 bay (palaceBays()) needs
         that bay OPEN too, or the deck arrives across a parapet. So on terrace
         0 the run is cut where such a bridge crosses it, and the two cut ends
         are finished as gate piers rather than left as a hole — the same
         "a bay a bridge lands in is deliberately open" reading the midpoint
         gap already has. Faces with no moved span keep the original two-run
         code untouched, so their geometry is byte-identical to before. */
      var cut = [];
      if(i === 0) bays.forEach(function(b){
        if(!b.moved) return;
        if(Math.abs(b.nx - Math.sin(ang)) > 1e-6 || Math.abs(b.nz - Math.cos(ang)) > 1e-6) return;
        /* Cut where the deck ACTUALLY crosses the parapet band, not a symmetric
           window about the landing. The first pass used a flat +-26 because the
           only moved span then (Foreign) leaves its face at 23 degrees and it
           made no difference; Temple leaves at 56, drifting 1.47 sideways per
           unit of radius and presenting a 17.8-unit lateral half-footprint
           where a square arrival presents 9.5 — and a symmetric window put a
           gate pier 3.0 units inside its deck. So: take the deck's own line
           across the band the parapet and its piers occupy, widen it by the
           deck's lateral half-extent at this obliquity (W/|dr|: the slab is W
           half-wide PERPENDICULAR to itself, which is W/|dr| measured along the
           face), and add the pier and a margin. For a square arrival this
           collapses to very nearly the old +-26. */
        var bl  = (b.x-c.x)*Math.cos(ang) - (b.z-c.z)*Math.sin(ang);
        var br  = (b.x-c.x)*Math.sin(ang) + (b.z-c.z)*Math.cos(ang);
        var dvr = b.vx*Math.sin(ang) + b.vz*Math.cos(ang);
        var dvl = b.vx*Math.cos(ang) - b.vz*Math.sin(ang);
        var kk  = dvl / (Math.abs(dvr) < 0.05 ? (dvr<0?-0.05:0.05) : dvr);
        var half = (wMax*0.5+1.5)/Math.max(0.30, Math.abs(dvr)) + 3.7 + 4.0;
        var la = bl + ((outerHw-5.6) - br)*kk, lb = bl + ((outerHw+1.4) - br)*kk;
        cut.push([Math.min(la,lb) - half, Math.max(la,lb) + half]);
        nBay++;
      });
      if(!cut.length){
        [-1,1].forEach(function(sg2){
          var pr = loc(c.x, c.z, sg2*(gapHw + runL*0.5), outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], runL, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], runL*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
      }else{
        var segs = [[-innerHw*0.98, -gapHw], [gapHw, innerHw*0.98]];
        cut.forEach(function(w2){
          var next = [];
          segs.forEach(function(sg4){
            if(w2[1] <= sg4[0] || w2[0] >= sg4[1]){ next.push(sg4); return; }
            if(sg4[0] < w2[0]) next.push([sg4[0], w2[0]]);
            if(w2[1] < sg4[1]) next.push([w2[1], sg4[1]]);
          });
          segs = next;
        });
        segs.forEach(function(sg4){
          var L2 = sg4[1]-sg4[0]; if(L2 < 2) return;
          var pr = loc(c.x, c.z, (sg4[0]+sg4[1])*0.5, outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], L2, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], L2*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
        cut.forEach(function(w2){                                   /* gate piers on the cut ends */
          [w2[0], w2[1]].forEach(function(lp){
            /* an oblique arrival can push a cut end out onto a flying buttress,
               whose own plinth and pinnacle already mark that point; a second
               pier on top of it reads as a stack. Dropped there, and the
               parapet simply ends against the buttress instead. */
            var onPier = false;
            lats.forEach(function(fr){ [-1,1].forEach(function(sg5){
              if(Math.abs(lp - sg5*fr*innerHw) < 11.5) onPier = true; }); });
            if(onPier) return;
            var pp = loc(c.x, c.z, lp, outerHw-1.6, ang);
            BOX (pp[0], terrY-0.8, pp[1], 7.4, 1.6, 7.4, ang, BASALTC[0]);
            FR8 (pp[0], terrY+0.8, pp[1], 6.0, 8.6, 6.0, ang, shade(c.tone,0.12));
            BOX (pp[0], terrY+4.0, pp[1], 6.2, 0.9, 6.2, ang, PALACE_PORPHYRY);
            BOX (pp[0], terrY+9.4, pp[1], 7.0, 1.3, 7.0, ang, BASALTC[0]);
            BOX (pp[0], terrY+10.7,pp[1], 6.0, 0.8, 6.0, ang, PALACE_GOLD, 'metal');
            CONE(pp[0], terrY+11.5,pp[1], 2.4, 5.2, ang, PALACE_GOLD);
          });
        });
      }
      /* gilt lantern drums along the terrace, in the bays BETWEEN the piers —
         glazed roof-lights over the tier below, not ornaments. Two per half
         face; the first pass put ten small ones per face and they read as
         speckle. */
      var lr = innerHw + (B.rP - B.dP*0.5 - innerHw)*0.45;   /* inboard, against the tier above */
      [0.51, 0.93].forEach(function(lf){
        [-1,1].forEach(function(sg3){
          var dl = sg3*lf*innerHw;
          /* the 0.51 drum is at the exact centre of the inter-pier bay, so it
             is also exactly where a moved bridge lands and where its stair
             runs. Dropped on that one bay only — one drum of 64. */
          for(var cb=0; cb<cut.length; cb++) if(dl > cut[cb][0] && dl < cut[cb][1]) return;
          var sp = loc(c.x, c.z, dl, lr, ang);
          BOX (sp[0], terrY-0.3,            sp[1], wid*0.22,  1.1,       wid*0.22, ang, BASALTC[0]);
          CYL (sp[0], terrY+0.8,            sp[1], wid*0.075, wid*0.20,  0,        PALACE_GOLD_DK, 'metal');
          BOX (sp[0], terrY+0.8+wid*0.20,   sp[1], wid*0.20,  0.8,       wid*0.20, ang, BASALTC[0]);
          DOME(sp[0], terrY+1.6+wid*0.20,   sp[1], wid*0.095, wid*0.085, 0,        PALACE_GOLD, 'metal');
          CONE(sp[0], terrY+1.6+wid*0.285,  sp[1], wid*0.024, wid*0.09,  0,        PALACE_GOLD);
          nSky++;
        });
      });
      /* THE FACE GARDEN, in the parapet gap at lateral 0. Terraces 0, 1 and 2
         only: their three gaps stack into exactly the r=102-to-205 strip the
         owner traced on the south face, and terrace 3's own gap is inboard of
         that and too narrow for a bed anyone could see. */
      if(i <= 2) nGarden += palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, i, f);
    }
    /* corners: full atria on the two broad lower terraces, open lantern
       kiosks on the two narrow upper ones (there is simply not the terrace
       width up there for a court anyone could stand in — said plainly
       rather than shipping a 6-unit "atrium"). */
    var cQ = (innerHw + outerHw)*0.5;
    for(var q=0; q<4; q++){
      var qa = Math.PI/4 + q*Math.PI/2;
      var qx = Math.cos(qa)*cQ*Math.SQRT2, qz = Math.sin(qa)*cQ*Math.SQRT2;
      if(i < 2){ palaceAtrium(c, qx, qz, terrY, wid*0.5*0.88); nAtria++; nSky += 8; }
      else     { palaceKiosk (c, qx, qz, terrY, wid*0.5*0.80); nSky++; }
    }
  }

  /* ---- the crown: a gilt clerestory drum, a stepped gold dome and a glazed
     oculus lantern, ringed by eight cupolas. The drum's tall windows are the
     "fancy skylight" at the scale of the whole silhouette — they are what
     lights the hall under the dome. */
  var dr = c.dome, y = topY;
  CYL(c.x, y+0.2,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum base ring */
  CYL(c.x, y+7.4,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum head ring */
  for(var w=0; w<16; w++){
    var wa = w*Math.PI/8;
    var wx = c.x + Math.cos(wa)*dr*1.34, wz = c.z + Math.sin(wa)*dr*1.34;
    BOX(wx, y+1.9, wz, 4.6, 5.4, 1.3, -wa, BASALTC[2]);                     /* dark glazing */
    var ma = wa + Math.PI/16;
    BOX(c.x + Math.cos(ma)*dr*1.35, y+1.7, c.z + Math.sin(ma)*dr*1.35, 1.5, 5.9, 1.6, -ma,
        PALACE_GOLD, 'metal');                                              /* gilt mullion */
  }
  for(var k2=0; k2<8; k2++){                                            /* cupola ring on the cornice */
    var ka2 = Math.PI/8 + k2*Math.PI/4;
    var cx2 = c.x + Math.cos(ka2)*dr*1.20, cz2 = c.z + Math.sin(ka2)*dr*1.20;
    BOX(cx2, y+10.8, cz2, 6.2, 1.0, 6.2, -ka2, BASALTC[0]);
    CYL(cx2, y+11.8, cz2, 2.5, 3.4, 0, PALACE_GOLD_DK, 'metal');
    DOME(cx2, y+15.2, cz2, 3.0, 2.5, 0, PALACE_GOLD, 'metal');
    nSky++;
  }
  CYL(c.x, y+10.8, c.z, dr*1.05, 2.2, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 1 */
  CYL(c.x, y+13.0, c.z, dr*0.99, 1.8, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 2 */
  var lanY = y+14.8 + dr*0.88;
  CYL(c.x, lanY,            c.z, dr*0.20, dr*0.24, 0, PALACE_GOLD_DK, 'metal');   /* oculus lantern drum */
  for(var lw=0; lw<8; lw++){
    var la = lw*Math.PI/4;
    BOX(c.x + Math.cos(la)*dr*0.20, lanY+dr*0.02, c.z + Math.sin(la)*dr*0.20, 1.1, dr*0.20, 1.1, -la, BASALTC[0]);
  }
  BOX(c.x, lanY+dr*0.24, c.z, dr*0.50, 0.9, dr*0.50, Math.PI/4, BASALTC[0]);
  DOME(c.x, lanY+dr*0.24+0.9, c.z, dr*0.21, dr*0.17, 0, PALACE_GOLD, 'metal');
  CONE(c.x, lanY+dr*0.24+0.9+dr*0.17, c.z, dr*0.055, dr*0.34, 0, PALACE_GOLD);
  nSky++;

  /* per-shape tri counts straight off SHAPES (45-kit.js): box/fr8/fr3 are 12
     (6 quads), cyl is a 10-gon (40), cone a 6-gon (12), dome a 16x8
     hemisphere (240). Tallied per bucket so the redesign's own triangle cost
     is a measured number rather than a share of a budget delta that
     concurrent passes in other fragments are also moving. */
  var TRI = { box:12, fr8:12, fr6:12, fr3:12, cyl:40, cone:12, dome:240, blob:60, stk:24 };
  var inst1 = 0, tri = 0;
  for(bk in BUCKET){
    var d = BUCKET[bk].list.length - (pre[bk] || 0);
    inst1 += BUCKET[bk].list.length;
    tri += d * (TRI[BUCKET[bk].shape] || 12);
  }
  window._palace = { buttresses:nButt, atria:nAtria, kiosks:8, skylights:nSky,
                     gates:4, gateInstances:PAL_GATE_I, gardenBays:12,
                     gardenPlants:nGarden, movedBays:nBay,
                     instances:inst1-inst0, triangles:tri,
                     porphyry:'PAL.stone.porphyry (promoted from the local literal this pass asked about)' };
}

function monoCanton(c){
  if(c.n === 'Temple') return templeCanton(c);   /* built by the facade pass — see 65-facade.js */
  var bed = bedAt(c.x,c.z), plinthTop = 7;
  FR8(c.x, bed, c.z, c.r*2.12, plinthTop-bed, c.r*2.12, 0, shade(c.tone,-0.26));
  BOX(c.x, plinthTop-1.4, c.z, c.r*2.20, 2.6, c.r*2.20, 0, shade(c.tone,-0.36));

  var y = plinthTop, rem = c.top - y, W = tierWeights(c.tiers), hw = c.r*0.98;
  /* 4th pass on this door, found by finally checking the ACTUAL numbers
     instead of assuming: DECK (the fixed height every bridge deck rides
     at, 54) lands at y=53.11 for Palace — 0.9 units off tier 1's own base
     (tierWeights()-derived, computed by hand and cross-checked against
     CANTON_TOPS.y=132.6, which matched exactly). That is: a bridge-borne
     pedestrian steps off onto tier 1's platform (the "2nd level", tier 0
     being the ground/water tier) — NOT the topmost tier, which is where
     every earlier pass put the door. The old top-level door had nothing
     to do with how anyone actually arrives; that's the real bug behind
     "too big" too — it was compensating for sitting somewhere nobody
     would ever walk past, on the smallest, least relevant tier. Doors are
     built after the loop, at entryY/entryHw (tier 1's own base/radius,
     captured below), not at the final y/hw anymore. */
  var doorFace = {};
  cantonApproachFaces(c).forEach(function(ang){
    var dx=Math.sin(ang), dz=Math.cos(ang), f;
    if(Math.abs(dx) > Math.abs(dz)) f = dx>0 ? 0 : 2; else f = dz>0 ? 1 : 3;
    doorFace[f] = true;
  });
  var entryY, entryHw;
  /* see platCanton()'s own tierRings comment — same fix, same reason
     (per-tier height lookup for lifeGroundY(), not one flat value). */
  var tierRings = [], tierGeom = [];
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    FR8(c.x, y, c.z, hw*2, th, hw*2, 0, shade(c.tone, i%2 ? 0.04 : -0.03));
    BOX(c.x, y+th-1.0, c.z, hw*2*1.07, 2.2, hw*2*1.07, 0, shade(c.tone,-0.16));
    tierGeom.push({ yb:y, th:th, hwb:hw });   /* CANTON_FACES' own raw input — see its comment */
    y += th + 0.12;
    tierRings.push({ hw:hw, y:y });
    var nhw = hw*0.80;
    if(i < c.tiers-1){
      var ring = hw*2*0.99, t2 = nhw*2;
      [[0,(ring+t2)/4],[0,-(ring+t2)/4],[(ring+t2)/4,0],[-(ring+t2)/4,0]].forEach(function(o){
        var sw = Math.abs(o[0])>0 ? (ring-t2)/2 : ring;
        var sd = Math.abs(o[0])>0 ? ring : (ring-t2)/2;
        BOX(c.x+o[0], y, c.z+o[1], sw*0.98, 2.6, sd*0.98, 0, shade(c.tone,-0.20));
      });
    }
    if(i < 2){
      for(var f=0; f<4; f++){
        if(i === 1 && doorFace[f]) continue;   /* tier 1 is the real entrance level now */
        var a = f*Math.PI/2;
        var px = c.x + Math.cos(a)*hw*1.02, pz = c.z + Math.sin(a)*hw*1.02;
        FR8(px, y-th*0.86, pz, hw*0.34, th*0.62, hw*0.34, -a, shade(c.tone,0.07));
        /* TIER 0's face spire is the thing the Ancestry and Granary decks were
           measured driving through: an 80.4-wide, 44.2-tall cone at r=204.9,
           base y=42.1, straight across a deck that rides y=52.5 to 57.9. On
           the Palace its podium is kept and the cone above it becomes the
           pointed-arch gate the owner asked for (palaceGate). Every other tier
           and every other canton keeps the cone exactly as it was. */
        if(i === 0 && c.n === 'Palace')
          palaceGate(c, a, hw*1.02, y-th*0.24, 22.0, 17.0, c.tone,
                     palaceGateShift(c, a, nhw, 22.0*1.34));
        else
          CONE(px, y-th*0.24, pz, hw*0.20, hw*0.22, -a, shade(c.tone,-0.12));
      }
    }
    hw = nhw;
    if(i === 0){ entryY = y; entryHw = hw; }
  }
  CANTON_TOPS[c.n] = { y:y, hw:hw, spring:plinthTop, entryY:entryY, entryHw:entryHw, tierRings:tierRings };
  cantonFacesRecord(c.n, c.tone, plinthTop, 1.2, c.r*1.10, tierGeom, 1.07);

  /* owner: "Palace roof and spires will be silver" (revised — Palace was
     briefly metallic gold, then the owner moved gold onto the Temple's own
     dome/spire-tips instead and asked for Palace to be silver, so the two
     monumental cantons now read as a distinct pair: gold Temple, silver
     Palace). Colour only, no family override: an explicit 'metal' family
     would open a brand-new shape+family bucket (a new draw call) against a
     budget already sitting at 50/50; dome/cone keep their existing default
     families (already-built buckets). The CYL/BOX collar and the spire
     shafts themselves stay in the canton's own tone, unaffected — only the
     dome and its "roof accents" (the spire caps) read as metallic now. */
  /* SUPERSEDED for Palace by the gilt redesign (see PALACE: THE GILT
     REDESIGN above): the owner's newer brief — "a lot of gold and a teeny
     bit of porphyry and black trim" — overrides the silver decision. The
     silver tone is kept here as the fallback any OTHER mono canton would
     still get, and the gold/silver distinction the old note was protecting
     is now carried by texture and treatment instead: Temple is matte ochre
     gilt on blood red, Palace is glossy 'metal'-family gilt on pale ashlar
     with black basalt trim. */
  var dr = c.dome;
  var PALACE_SILVER = 0xc6cbd2;
  var gilt = (c.n === 'Palace');
  var capCol = gilt ? PALACE_GOLD : PALACE_SILVER;
  CYL(c.x, y, c.z, dr*1.34, 9, 0, shade(c.tone,0.08));
  BOX(c.x, y+9, c.z, dr*2.9, 1.8, dr*2.9, Math.PI/4, shade(c.tone,-0.14));
  if(gilt){
    /* the dome is lifted onto the two stepped gilt rings palaceArchitecture()
       lays on the cornice (y+10.8 -> y+14.8), and its finial spike is
       replaced by a glazed oculus lantern built there too. */
    DOME(c.x, y+14.8, c.z, dr, dr*0.88, 0, PALACE_GOLD, 'metal');
  }else{
    DOME(c.x, y+10.8, c.z, dr, dr*0.88, 0, PALACE_SILVER, 'dome');
    CONE(c.x, y+10.8+dr*0.88, c.z, dr*0.14, dr*0.55, 0, shade(PALACE_SILVER,-0.15));
  }
  for(var s=0;s<4;s++){
    var sa = Math.PI/4 + s*Math.PI/2;
    var sx = c.x + Math.cos(sa)*hw*0.80, sz = c.z + Math.sin(sa)*hw*0.80;
    FR3(sx, y, sz, 9, dr*1.5, 9, sa, shade(c.tone,0.02));
    if(gilt){
      BOX(sx, y+1.0,        sz, 10.4, 1.6, 10.4, sa, BASALTC[0]);           /* black base collar */
      BOX(sx, y+dr*0.52,    sz,  8.2, 1.0,  8.2, sa, PALACE_PORPHYRY);      /* porphyry band */
      BOX(sx, y+dr*1.5-1.4, sz,  6.6, 1.4,  6.6, sa, PALACE_GOLD, 'metal'); /* gilt necking */
    }
    CONE(sx, y+dr*1.5, sz, 3.4, 8, sa, gilt ? PALACE_GOLD : shade(PALACE_SILVER,0.08));
  }
  if(gilt) palaceArchitecture(c, tierGeom, tierRings, y);
  /* water-level stairs, one per real bridge approach instead of a fixed
     +x/-x pair — see cantonApproachFaces()'s own comment for why: a multi-
     bridge hub like Palace had every one of its 4 bridges land on a face
     with no stair at all under the old scheme. These are for boat/water
     access at the base; the door a bridge-borne pedestrian actually uses
     is at tier 1 — see below. */
  cantonApproachFaces(c).forEach(function(ang){
    var sp = loc(c.x, c.z, 0, c.r*1.06, ang);
    seaStair(sp[0], sp[1], ang, c.r*0.55, plinthTop, -2);
  });
  /* the real entrance: tier 1's own edge (entryY/entryHw, captured right
     after tier 0 in the loop above) — where DECK (54, every bridge's
     height) actually lands, checked against tierWeights()' real numbers
     this time, not assumed. linkStair() (in landing(), SPANS.forEach
     further down) targets this same entryY/entryHw now, not the topmost
     tier — see CANTON_TOPS below and landing()'s own comment. */
  /* opt.lean, per the canton-door pass's own hand-off: these doors sit on
     tier 1's face, and that face is an FR8 batter — Palace tier 1 recedes
     10.3 units over a 12.6-unit door, so a vertical opening laid flat on it
     reads as a dark panel floating off a pyramid. plinthDoor()'s opt.lean
     puts a shallow vertical-faced portal block behind the opening, deep
     enough to reach back into the slope, so it reads as a door IN a wall.
     faceLean() takes the real recorded tier geometry, not an estimate. */
  cantonApproachFaces(c).forEach(function(ang){
    plinthDoor(c.x, c.z, ang, entryY, entryHw, c.tone,
               tierGeom[1] ? { lean: faceLean(tierGeom[1], ang) } : null);
  });
  /* one ferry pier + matching ground-floor door at the bottom tier, per
     the owner's canton-design notes. CPIERS (30-layout.js) already has
     exactly one entry for this canton by name; reuse its own `ry` so the
     door faces straight back down the pier instead of an unrelated
     bridge-approach angle. */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    /* same batter problem, one tier lower and on a diagonal bearing —
       faceLean() already scales for the diagonal (a square's edge, and its
       batter, are 1/cos(45) further away on a corner bearing). */
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(c.r*0.98, ferryPier.ry), c.tone,
               tierGeom[0] ? { lean: faceLean(tierGeom[0], ferryPier.ry) } : null);
  }
}

/* which of the Fortress platform's own tiers drops out of the light/dark
   alternation and takes the canton's dark grey instead — the owner's "3rd
   floor platform layer", resolved to a tier index against the built canton
   (see the band comment inside the tier loop below). Fortress-only; every
   other canton's tiers are untouched by it. */
var FORT_FLAT_TIER = 1;

/* per-canton (lx,lz) offset of the lattice lot freed for a canton-top
   tavern — see CANTON_TAVERN_RESERVE inside platCanton()'s discrete-lot
   branch for the full story. Populated as each affected canton is built;
   read by 69-district-content.js, which runs after this whole file. */
var CANTON_TAVERN_RESERVE_POS = {};

function platCanton(c){
  var bed = bedAt(c.x,c.z), plinthTop = 5;
  FR8(c.x, bed, c.z, c.r*2.06, plinthTop-bed, c.r*2.06, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.3, c.z, c.r*2.14, 2.3, c.r*2.14, 0, shade(c.tone,-0.38));

  var y = plinthTop, rem = c.top - y, W = tierWeights(c.tiers), hw = c.r*0.97;
  /* owner: "pedestrians are still sinking to the neck in canton platforms
     sometimes" — lifeGroundY()/cantonEdgeY() (78-life.js) use ONE flat
     height for a citizen anywhere inside a canton's full radius, but a
     stepped-pyramid canton has a DIFFERENT real height at every tier —
     someone standing at the outer ring is on tier 0, someone further in
     is on a taller, narrower tier above it. A single value was always
     going to be wrong except at the one radius it happened to match.
     tierRings records every tier's own (radius, height) as the loop
     below actually builds them, outermost/lowest first, so life-layer
     code can look up the real height for wherever a citizen actually is
     instead of guessing one height for the whole platform. */
  var tierRings = [], tierGeom = [];
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    /* owner: "make the dark/light alternation on the ordinator canton extend
       to all levels". The keep's own tiers (ordinatorFortress, 65-facade.js)
       were widened to a real +0.16/-0.10 band, but this platform underneath
       it kept the generic +-0.03/-0.04 — a 0.07 spread that is legible on
       the other cantons' sandy tone and completely invisible on the
       Fortress's near-black basalt, so the keep banded and the platform it
       stands on stayed one flat mass. Fortress-only, because platCanton()
       is shared by every rim canton and widening it globally would restyle
       Market, Guild, Arsenal and the rest. Phase matches the keep's own
       FORT_BAND_PHASE (= c.tiers % 2) so the banding runs continuously from
       the waterline to the crest instead of restarting at the keep's foot. */
    var bandLt = c.fortress ? 0.16 : 0.03, bandDk = c.fortress ? -0.10 : -0.04;
    var band = (i%2) ? bandLt : bandDk;
    /* owner, this round: "give the 3rd floor platform layer that dark grey
       colour seen on the rest of the canton". Measured, not guessed — a
       downward raycast profile of the built canton reads four walkable
       platform layers going up from the water (plinth apron y=6, tier 0's
       terrace y=24.9, tier 1's terrace y=36.3, the top deck y=45.2), so the
       "3rd floor platform layer" is the tier the loop builds at i===1, and a
       horizontal raycast across its flank confirms it is the one odd colour
       on the whole canton: #52504c against #2f2c28 everywhere else (tier 0,
       tier 2, the keep's own dark bands). That is the +0.16 light band the
       alternation pass put there. It goes back to the canton's own dark grey
       (bandDk, the exact shade tiers 0 and 2 already carry). The light/dark
       alternation therefore now starts at the keep's foot rather than at the
       waterline — deliberate, and the reason the light-grey GREYC coping on
       every tier is left alone: that trim is what still reads the platform
       as banded courses instead of one unbroken face. */
    if(c.fortress && i === FORT_FLAT_TIER) band = bandDk;
    FR8(c.x, y, c.z, hw*2, th, hw*2, 0, shade(c.tone, band));
    BOX(c.x, y+th-1.0, c.z, hw*2*1.06, 2.0, hw*2*1.06, 0,
        c.fortress ? shade(GREYC[GREYC.length-1], 0.20) : shade(c.tone,-0.18));
    tierGeom.push({ yb:y, th:th, hwb:hw });   /* CANTON_FACES' own raw input — see its comment */
    y += th + 0.12;
    tierRings.push({ hw:hw, y:y });
    hw *= 0.86;
  }
  CANTON_TOPS[c.n] = { y:y, hw:hw, spring:y, tierRings:tierRings };
  /* recorded HERE, before the c.port/c.arena/c.fortress/... dispatch below:
     ordinatorFortress() (65-facade.js) rewrites CANTON_TOPS[c.n] wholesale
     on its way past, which is how Fortress lost its tierRings. Nothing
     rewrites CANTON_FACES. */
  cantonFacesRecord(c.n, c.tone, plinthTop, 1.0, c.r*1.07, tierGeom, 1.06);

  var ring = hw*2;
  for(var f=0; f<4; f++){
    var a=f*Math.PI/2;
    for(var seg=-1; seg<=1; seg+=2){
      var off = seg*ring*0.30;
      var px = c.x + Math.cos(a)*hw*0.99 - Math.sin(a)*off;
      var pz = c.z + Math.sin(a)*hw*0.99 + Math.cos(a)*off;
      BOX(px, y, pz, ring*0.36, 2.4, 3.0, -a, shade(c.tone,-0.20));
    }
    var ex2 = c.x + Math.cos(a)*hw*1.04, ez2 = c.z + Math.sin(a)*hw*1.04;
    if(f%2===0) seaStair(ex2, ez2, -a + Math.PI, ring*0.22, y, -2);
  }

  if(c.port){
    /* a broad working quay round the platform at a low level: docks off it */
    var qy = 6.5, qw = c.r*2.06 + 70;
    FR8(c.x, bedAt(c.x,c.z), c.z, qw, qy-bedAt(c.x,c.z), qw, 0, shade(c.tone,-0.30));
    BOX(c.x, qy-0.8, c.z, qw+3, 1.6, qw+3, 0, shade(c.tone,-0.40));
    for(var b=0;b<24;b++){ var ba=b/24*Math.PI*2; CYL(c.x+Math.cos(ba)*qw*0.5*0.98, qy, c.z+Math.sin(ba)*qw*0.5*0.98, 1.0, 2.0, 0, 0x6c6353); }
    /* this canton's real ground level is the quay cap's top face (qy+0.8),
       not the plinth apron the other cantons stand on — the quay is laid
       OVER that apron and reaches 30 units further out again, so it is
       what a causeway arrival actually lands on. Patched into the record
       written above rather than branched inside cantonFacesRecord(): the
       quay only exists once this branch has run. */
    var pf = CANTON_FACES[c.n];
    if(pf){ pf.levels[0].y = qy+0.8; pf.levels[0].hw = faceHwAt(tierGeom[0], qy+0.8); pf.levels[0].outer = qw*0.5; }
    return portDeckV2(c, y, hw, qy, qw*0.5);
  }
  if(c.arena) return arenaDeckSquare(c, y, hw);
  if(c.fortress) return ordinatorFortress(c, y, hw);
  if(c.market) return marketDeck(c, y, hw);
  if(c.garden) return gardenDeck(c, y, hw);   /* dead branch now — no canton sets c.garden any more (see 30-layout.js); left in place, same as c.market's own dead branch above (only Ancestry ever set that flag, and Ancestry is intercepted by name before platCanton() runs at all) */
  if(c.guild) return guildHallsDeck(c, y, hw);

  /* discrete buildings round a courtyard */
  var n = hw > 105 ? 5 : 4;
  var cell = (hw*1.84)/n;
  var lots = [];
  for(var gi=0; gi<n; gi++) for(var gj=0; gj<n; gj++){
    var lx = (gi+0.5)/n*hw*1.84 - hw*0.92 + rr(-cell*0.15, cell*0.15);
    var lz = (gj+0.5)/n*hw*1.84 - hw*0.92 + rr(-cell*0.15, cell*0.15);
    if(Math.hypot(lx,lz) < hw*0.30) continue;
    if(Math.max(Math.abs(lx),Math.abs(lz)) > hw*0.80) continue;
    lots.push([lx,lz]);
  }
  lots.sort(function(a,b){ return Math.hypot(a[0],a[1]) - Math.hypot(b[0],b[1]); });
  /* owner: "try and fit the taverns back on the cantons that lost them...
     don't be afraid of expanding the footprint available for building
     placement up top." A live SAT/OBB audit (a throwaway Playwright probe
     against the real window._inspectFP registry, not the re-derived lattice
     the old canton-top tavern code used to test against) found these 3
     decks genuinely saturated at a tavern's own footprint: an exhaustive
     2-unit grid search, both plausible orientations, at the SAME margins
     this file already keeps between lots, found zero clear rectangle
     anywhere on Foreign/Market/Granary's top deck — not just short of the
     usable-radius shortcut the old code used, the real deck.

     Growing hw itself was the first thing tried and rejected: hw is the
     top tier's own frustum cap (FR8's SHAPES.fr8 bakes an 86% taper into
     the geometry itself, 45-kit.js), so nudging hw independently of that
     taper would float the flat deck/parapet outside the battered stone
     actually holding it up — worse than the crowding it would fix.

     So the expansion is real ground, not a bigger platform: exactly the
     lot(s) that same live audit found were the SOLE remaining blocker for
     each deck are generated and then discarded (never rendered, never
     inspectClaim()ed) — real accepted lattice candidates, same rr()/
     chance() draws as any other lot, so the shared PRNG stream advances
     BYTE-IDENTICALLY to the unmodified build; every later farm, orchard,
     tree and rejected-town-building roll is unaffected. Indices are the
     lots.forEach() idx used below, fixed at measurement time (deterministic
     build, so this is exact and repeatable, not a tolerance match). The
     freed rectangle's own (lx,lz) offset is recorded per canton in
     CANTON_TAVERN_RESERVE_POS for 69-district-content.js's own tavern-fit
     search to try, which then re-verifies live against the real (now
     smaller) deck footprint set rather than trusting this measurement
     blindly. Arsenal never lost a tavern (no TAVERN_POINTS candidate ever
     landed there) so it is untouched. */
  var CANTON_TAVERN_RESERVE = { Foreign:[4,9], Market:[9], Granary:[11,5] };
  var reserveIdx = CANTON_TAVERN_RESERVE[c.n] || [];
  lots.forEach(function(L,idx){
    var w = cell*rr(0.52,0.80), d = cell*rr(0.52,0.80);
    var ry = Math.round(rr(-0.5,3.5))*Math.PI/2 + rr(-0.10,0.10);
    var col = tone();
    var reserved = idx !== 0 && reserveIdx.indexOf(idx) !== -1;
    /* snapshot every side effect a normal lot's geometry would create, so
       a reserved lot's own draws can be rolled back afterwards without the
       PRNG stream itself ever being touched (see the comment above). */
    var preBucket = null, preNL = 0, preDoors = 0, preWin = 0;
    if(reserved){
      preBucket = {}; for(var bk in BUCKET) preBucket[bk] = BUCKET[bk].list.length;
      preNL = NL_WINDOWS.length;
      preDoors = window._facadeExtraDoors||0; preWin = window._facadeExtraWindows||0;
    }
    /* inspector footprint (86-inspect.js — an inspect-only registry, never
       claim(); see inspectClaim()'s own comment). Without one of these, a
       canton-top building has no footprint anywhere in the build, so the
       inspector could only ever fall back to the canton's own name — which
       is exactly the thing the owner asked to be able to see past. Skipped
       for a reserved lot: 69-district-content.js's own tavern placement
       files a "Tavern" record at this spot instead once it lands there. */
    if(!reserved){
      inspectClaim(c.x+L[0], c.z+L[1], (idx===0?cell*0.92:w)*0.5, (idx===0?cell*0.92:d)*0.5, ry,
                   idx===0 ? 'cantonHall' : 'cantonBuilding', idx===0 ? 'Great hall' : 'Canton building');
    }
    if(idx === 0){
      var hallCol = shade(col,0.06), hallH = rr(44,60);
      structure(c.x+L[0], y, c.z+L[1], cell*0.92, cell*0.92, hallH, ry, 'domed', hallCol);
      addDoor(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol);
      /* owner: "make sure the recently placed great hall buildings have an
         appropriate number of windows" — addWindows() is chance()-gated
         (worst case: one window total, see this file's own note on
         guildHallWindows3 below), which does not reliably clear "at least
         3 per floor" on a hall this tall. cantonHallWindows() (65-facade.js)
         is the guaranteed, unconditional equivalent, sized per floor band
         rather than once — but it does not draw the same NUMBER of rr()
         calls addWindows() did (a floor loop instead of a fixed handful, and
         addWindows() itself is chance()-gated so even ITS OWN count varies
         call to call), so simply swapping the call would shift every lot
         generated after it on EVERY discrete-lot canton, cascading into
         Foreign/Granary/Market's own lattices even though only their great
         hall changed (confirmed live: doing exactly that moved Foreign's
         entire lot layout, including the lots CANTON_TAVERN_RESERVE depends
         on by exact index, and shifted _veg/_orchard downstream).

         So addWindows() is still called, unconditionally, right here — the
         shared LCG advances EXACTLY as the unmodified build's stream did —
         and its geometry is then discarded (same snapshot/rollback trick
         CANTON_TAVERN_RESERVE uses above for a reserved lot). The REAL,
         guaranteed windows are drawn afterwards by cantonHallWindows() on
         its own reseed()ed sub-stream (seeded off the hall's position, same
         idiom as SILHOUETTE_SHRINES elsewhere in this build), which touches
         nothing the rest of the city depends on. */
      var hallPreBucket = {}; for(var hbk in BUCKET) hallPreBucket[hbk] = BUCKET[hbk].list.length;
      var hallPreNL = NL_WINDOWS.length;
      var hallPreWin = window._facadeExtraWindows||0;
      addWindows(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol, Math.min(2.2, cell*0.92*0.5*0.9)*0.5);
      for(var hbk2 in BUCKET) BUCKET[hbk2].list.length = hallPreBucket.hasOwnProperty(hbk2) ? hallPreBucket[hbk2] : 0;
      NL_WINDOWS.length = hallPreNL;
      window._facadeExtraWindows = hallPreWin;

      var hallSeedSave = seed;
      reseed(((c.x|0)*7349 + (c.z|0)*631 + idx*17) >>> 0);
      cantonHallWindows(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol, Math.min(2.2, cell*0.92*0.5*0.9)*0.5);
      seed = hallSeedSave;
    }else{
      var kind = chance(0.20) ? 'velothi' : (chance(0.12) ? 'domed' : 'hlaalu');
      var bh2 = kind==='velothi'?rr(26,52):rr(13,34);
      structure(c.x+L[0], y, c.z+L[1], w, d, bh2, ry, kind, col);
      addDoor(c.x+L[0], y, c.z+L[1], ry, w, d, bh2, col);
      addWindows(c.x+L[0], y, c.z+L[1], ry, w, d, bh2, col, Math.min(2.2, d*0.5*0.9)*0.5);
    }
    if(reserved){
      for(var bk2 in BUCKET) BUCKET[bk2].list.length = preBucket.hasOwnProperty(bk2) ? preBucket[bk2] : 0;
      NL_WINDOWS.length = preNL;
      window._facadeExtraDoors = preDoors; window._facadeExtraWindows = preWin;
      CANTON_TAVERN_RESERVE_POS[c.n] = { lx:L[0], lz:L[1] };
    }
  });
  CYL(c.x, y, c.z, rr(4,7), 3.2, 0, shade(c.tone,-0.10));
  FR3(c.x, y+3.2, c.z, 5, rr(10,18), 5, 0, shade(c.tone,0.05));
}

/* the arena canton: a stepped oval bowl instead of a courtyard.
   R/floor/rim scale off hw (the canton's own top-tier half-width) — bumped
   up per the owner's request so the bowl reads as a real stadium filling
   the platform rather than a modest ring sitting in the middle of it. */
function arenaDeck(c, y, hw){
  var R = hw*0.80, steps = 6;
  for(var i=0;i<steps;i++){
    var t = i/steps;
    var rout = R*(1 - 0.10*t), rin = rout - R*0.13;
    var h = 3.4;
    var segs = 22;
    for(var k=0;k<segs;k++){
      var a = k/segs*Math.PI*2, a2=(k+1)/segs*Math.PI*2, am=(a+a2)/2;
      var rm = (rout+rin)/2;
      var w = 2*rm*Math.sin(Math.PI/segs)*1.06;
      BOX(c.x+Math.cos(am)*rm*1.05, y + i*h*0.55, c.z+Math.sin(am)*rm*0.80,
          rout-rin, h, w, -am, shade(c.tone, i%2?0.03:-0.05));
    }
    R *= 0.86;
  }
  BOX(c.x, y-0.4, c.z, hw*0.66, 0.5, hw*0.50, 0, 0x9a8f74);
  /* a few buildings pushed out to the rim — nudged out to 0.90/0.74 so they
     still clear the now-larger bowl instead of sitting inside its seating */
  for(var q=0;q<6;q++){
    var a3 = q/6*Math.PI*2 + 0.3;
    var p = [c.x+Math.cos(a3)*hw*0.90, c.z+Math.sin(a3)*hw*0.74];
    structure(p[0], y, p[1], hw*0.22, hw*0.20, rr(12,26), -a3, chance(0.3)?'velothi':'hlaalu', tone());
  }
}

/* the market canton (Guild, converted): a stall grid on the top tier plus
   a covered hall or two, in place of the usual courtyard-of-buildings —
   same dispatch pattern as arenaDeck/portDeck/lighthouseDeck, same already-
   built tier profile underneath. Stall awnings use BANNERC (cloth family,
   already sways) rather than ROOFS, so the market's own fabric colour
   reads as distinct from ordinary roofing, per the brief. */
function marketDeck(c, y, hw){
  /* denser than the first pass — a 7x8 grid with an aisle every 3rd row/col
     (not just one central cross), so the deck reads as a real packed bazaar
     rather than a dozen stalls in a mostly-empty plaza, while still leaving
     real circulation per the brief's own rule. */
  var rows = 7, cols = 8, cellW = (hw*1.7)/cols, cellD = (hw*1.5)/rows;
  var x0 = -hw*0.85, z0 = -hw*0.75;
  for(var r=0;r<rows;r++){
    for(var col2=0;col2<cols;col2++){
      if(r%3===2 || col2%3===2) continue;
      var sx = c.x + x0 + (col2+0.5)*cellW, sz = c.z + z0 + (r+0.5)*cellD;
      var sw = rr(3.6,5.2), sd = rr(3.6,5.2), sh = rr(2.0,2.8);
      var scol = pick(TONES_POOR);
      inspectClaim(sx, sz, sw*0.5, sd*0.5, 0, 'stall', 'Market stall');
      BOX(sx, y, sz, sw, sh, sd, rr(0,Math.PI*2), scol, 'wood');
      FR8(sx, y+sh, sz, sw*1.5, 0.8, sd*1.5, rr(0,Math.PI*2), pick(BANNERC), 'cloth');
    }
  }
  /* two covered halls anchoring the ends, larger and more permanent than a stall row */
  [-1,1].forEach(function(s){
    var hx = c.x, hz = c.z + s*hw*0.86;
    inspectClaim(hx, hz, hw*0.45, hw*0.15, 0, 'markethall', 'Covered market hall');
    shed(hx, y, hz, hw*0.9, hw*0.30, rr(6,8), 0, pick(TONES));
  });
  CYL(c.x, y, c.z, rr(4,7), 3.2, 0, shade(c.tone,-0.10));
  FR3(c.x, y+3.2, c.z, 5, rr(10,18), 5, 0, shade(c.tone,0.05));
  cantonPiers(c);   /* this canton becoming a ferry stop is the point of these */
  /* the accompanying ground-floor door, at the base tier (plinthTop=5,
     hw=c.r*0.97 — platCanton()'s own constants, not passed down to this
     dispatch function so repeated here to match). */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier) plinthDoor(c.x, c.z, ferryPier.ry, 5.5, squareEdgeHw(c.r*0.97, ferryPier.ry), c.tone);
}

/* the hanging garden canton (Ancestry, converted): reconstruct each tier's
   approximate radius/height from c.tiers and the top hw (platCanton()'s own
   tier loop already narrowed by *0.86 per level and doesn't hand us those
   intermediate values). Second pass, per the owner's explicit reference to
   the Hanging Gardens of Babylon: the first version only planted a thin
   ring at each tier's edge, leaving every tier's actual SURFACE bare stone
   — which is why it read as "no green areas" even with planting happening.
   This version densely covers each tier's whole top surface with ground-
   cover foliage (not just its rim), adds overhanging drape planting at the
   edges, and adds a handful of simplified cascades between tiers. The
   cascades are an OPAQUE suggestion of falling water (a flat pale plane +
   a foam-tint blob at the base, both on already-existing (shape,family)
   buckets — box|stone, blob|leaf — so this costs no new draw call) rather
   than the true transparent/animated shader the life-layer/districts brief
   flags as its own separate piece of future work; noting that honestly
   rather than claiming more than this is. */
/* a small deliberate lawn clump right at a tree's own base — the owner's
   "still looks like trees are growing out of stone" follow-up: excluding
   the wider ground-cover/canopy-roof filler from landing near a tree (see
   nearRimTree() below) fixed the buried-trunk bug but left the trunk's
   immediate foot on bare deck stone with nothing else nearby to read as
   soil. This is placed deliberately at every tree, not left to a random
   scatter's odds. Still blob|leaf — zero new draw calls. */
function treeBaseGrass(x,z,y){
  var ng = ri(2,4);
  for(var i=0;i<ng;i++){
    var gx = x+rr(-2.2,2.2), gz = z+rr(-2.2,2.2);
    var gr = rr(1.0,1.8);
    BLOB(gx, y, gz, gr, gr*rr(0.4,0.6), rnd()*3, pick(LEAFC), 'leaf');
  }
}
function gardenDeck(c, y, hw){
  var tiers = c.tiers || 3;
  var tierHw = [], tierY = [];
  for(var t=0; t<tiers; t++){
    tierHw.push(hw / Math.pow(0.86, tiers-1-t));
    tierY.push(y - (tiers-1-t)*(c.top/tiers)*0.9);
  }
  for(var t=0; t<tiers; t++){
    var levelHw = tierHw[t], levelY = tierY[t];
    /* rim planting goes FIRST now (was last): the owner reported trees
       "growing out of the stone" with tops visible but trunks not — the
       ground-cover/canopy-roof filler below was scattered independently of
       where the actual specimen trees stand, so on a fair fraction of
       rolls a canopy-roof blob (radius up to 5.5, hanging as low as
       ~levelY+1) or a ground-cover blob would land right on top of a
       trunk (cherryBlossom/dragonTree's own trunk is thin — 0.28-0.42R —
       and short at the rim's rr(5,8) height, so it's an easy target).
       Collecting real tree positions here and excluding the filler layers
       near them (below) fixes it at the source instead of just raising
       the trees, which would only shrink the odds, not remove them.
       Slightly taller now too (rr(6,9)/rr(6,9) vs the old rr(5,8)) for
       extra clearance margin on top of the exclusion. */
    var n = 14 + t*6, rimPos = [];
    for(var i=0;i<n;i++){
      var a = (i/n)*Math.PI*2 + rr(-0.08,0.08);
      var px = c.x + Math.cos(a)*levelHw*1.03, pz = c.z + Math.sin(a)*levelHw*1.03;
      var pick3 = rnd();
      if(pick3 < 0.30){ cherryBlossom(px, levelY, pz, a, pick(BLOOMC), {h:rr(6,9)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else if(pick3 < 0.50){ dragonTree(px, levelY, pz, a, null, {h:rr(6,9)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else if(pick3 < 0.58){ baobab(px, levelY, pz, a, null, {h:rr(6,10)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else BLOB(px, levelY, pz, rr(1.6,2.8), rr(1.2,2.0), rnd()*3, pick(LEAFC), 'leaf');
      if(chance(0.5)){
        var dpx = c.x + Math.cos(a)*levelHw*1.10, dpz = c.z + Math.sin(a)*levelHw*1.10;
        BLOB(dpx, levelY-1.5, dpz, rr(0.8,1.4), rr(1.5,2.5), rnd()*3, pick(LEAFC), 'leaf');
      }
    }
    var nearRimTree = function(x,z,clear){
      for(var r=0;r<rimPos.length;r++){ if(Math.hypot(x-rimPos[r][0], z-rimPos[r][1]) < clear) return true; }
      return false;
    };
    /* ground cover: fills the tier's actual surface, not just its rim —
       this is the "green area" the rim-only version was missing. Kept off
       the specimen trees' own trunks (see above). */
    var coverN = Math.round(levelHw*levelHw/220);
    for(var g=0; g<coverN; g++){
      var gx = c.x + rr(-levelHw*0.92, levelHw*0.92), gz = c.z + rr(-levelHw*0.92, levelHw*0.92);
      if(Math.hypot(gx-c.x,gz-c.z) > levelHw*0.95) continue;
      if(nearRimTree(gx,gz, 5.5)) continue;
      var gr = rr(1.6,3.2);
      BLOB(gx, levelY, gz, gr, gr*rr(0.4,0.7), rnd()*3, pick(LEAFC), 'leaf');
    }
    /* a canopy "roof" of greenery, floating a few units above the tier's
       own surface — per the owner's own diagnosis: ground-level cover
       alone doesn't read as grass/lushness from a normal viewing angle,
       hovering foliage does. Bigger, flatter, sparser blobs than the
       ground layer, at levelY+canopyLift instead of on the deck itself.
       Still blob|leaf — zero new draw calls. Kept clear of the specimen
       trees (below) — this was the actual "trunk hidden" culprit: at
       radius up to 5.5 and as low as ~levelY+1, it could swallow a whole
       short rim tree. */
    var canopyN = Math.round(coverN * 0.45), canopyLift = rr(3.0, 4.5);
    for(var g2=0; g2<canopyN; g2++){
      var cgx = c.x + rr(-levelHw*0.90, levelHw*0.90), cgz = c.z + rr(-levelHw*0.90, levelHw*0.90);
      if(Math.hypot(cgx-c.x,cgz-c.z) > levelHw*0.93) continue;
      if(nearRimTree(cgx,cgz, 9.0)) continue;
      var cgr = rr(3.0,5.5);
      BLOB(cgx, levelY+canopyLift, cgz, cgr, cgr*rr(0.30,0.45), rnd()*3, pick(LEAFC), 'leaf');
    }
    /* a few cascades down to the tier below — 2-3 per boundary, not the
       whole rim, echoing the reference image's few distinct falls rather
       than a continuous curtain */
    if(t>0){
      var prevY = tierY[t-1];
      var nFalls = 2 + (t<tiers-1 ? 1 : 0);
      for(var f=0; f<nFalls; f++){
        var fa = rr(0,Math.PI*2);
        var fx = c.x + Math.cos(fa)*levelHw*0.99, fz = c.z + Math.sin(fa)*levelHw*0.99;
        var dropH = Math.max(1, levelY - prevY);
        BOX(fx, prevY, fz, 2.6, dropH, 0.5, fa, 0x8fb8c4);
        BLOB(fx, prevY+0.4, fz, 2.0, 1.0, fa, 0xd8e8ea, 'leaf');
      }
    }
  }
  /* the top deck itself: a proper garden court centred on a fountain, not
     just one accent blob. Per the owner's explicit ask: a central
     fountain with channels running off it at right angles in a cross —
     four, each ending in a small cascade down to the tier just below,
     reusing the same cascade motif (pale box + foam blob) the per-tier
     waterfalls above already use. box|stone(default) for the basin/
     channels, cyl|stone for the spout — all pre-existing, zero new draw
     calls. */
  var fountR = hw*0.09;
  CYL(c.x, y, c.z, fountR, 2.2, 0, shade(c.tone,0.05));
  CYL(c.x, y+2.2, c.z, fountR*0.5, 3.4, 0, shade(c.accent,0.10));
  BLOB(c.x, y+5.4, c.z, fountR*0.55, fountR*0.42, 0, 0xd8e8ea, 'leaf');
  /* real bug, found by checking rather than trusting the render: the
     tier loop above (actually platCanton()'s, which runs before this
     dispatch) caps every tier — including this top one — with its own
     coping BOX spanning roughly y-1.12 to y+0.88. A channel at y+0.25
     sat entirely INSIDE that solid coping, buried — confirmed by hiding
     every leaf-family mesh in a live render and finding the channels
     still didn't show even with the canopy out of the way. Raised to
     y+1.15 (just clear of the coping's own top) fixes it; the fountain
     itself was fine since its CYL already reaches to y+2.2, well past
     the coping ceiling. */
  var belowY = tiers>1 ? tierY[tiers-2] : y-8;
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dir){
    var chanLen = hw*0.60;
    var midx = c.x+dir[0]*chanLen*0.5, midz = c.z+dir[1]*chanLen*0.5;
    BOX(midx, y+1.15, midz, dir[0]?chanLen:2.6, 0.5, dir[0]?2.6:chanLen, 0, 0x8fb8c4);
    var endx = c.x+dir[0]*chanLen, endz = c.z+dir[1]*chanLen;
    var dropH = Math.max(2, y+1.15 - belowY);
    BOX(endx, belowY, endz, 2.6, dropH, 0.5, dir[0]?0:Math.PI/2, 0x8fb8c4);
    BLOB(endx, belowY+0.4, endz, 1.8, 1.0, 0, 0xd8e8ea, 'leaf');
  });
  /* the owner's fix for "trees growing out of the fountain": the old k3/k4
     loops scattered trees at a random ANGLE and radius, with nothing
     stopping a roll from landing right on a channel arm (2.6 wide, out to
     hw*0.60 in each cardinal direction) or hard against the fountain
     itself. Per the owner's own proposed fix — "define 4 greenery-shaded
     squares whose borders are the water channels, and place ancestry
     garden trees there only" — the cross literally already divides the
     deck into 4 quadrants; qNear sits just past the channel's own
     half-width (1.3) on both axes so a square anchored there can never
     touch either arm, no angle check needed. Each square gets its own
     lawn fill (so trees stand on greenery, not bare deck stone — the
     other half of "still looks like trees are growing out of stone") plus
     a few specimens, each with treeBaseGrass() at its foot too. */
  var qNear = 1.3 + 3, qFar = hw*0.72;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(qs){
    var sx=qs[0], sz=qs[1];
    var lawnN = Math.round((qFar-qNear)*(qFar-qNear)/140);
    for(var lg=0; lg<lawnN; lg++){
      var lx = c.x + sx*rr(qNear, qFar), lz = c.z + sz*rr(qNear, qFar);
      var lr = rr(1.6,3.0);
      BLOB(lx, y, lz, lr, lr*rr(0.4,0.65), rnd()*3, pick(LEAFC), 'leaf');
    }
    var nBao = 2, nCherry = ri(1,2);
    for(var qb=0; qb<nBao; qb++){
      var bx = c.x + sx*rr(qNear+3, qFar-4), bz = c.z + sz*rr(qNear+3, qFar-4);
      baobab(bx, y, bz, rnd()*Math.PI*2, null, {h:rr(7,12)});
      treeBaseGrass(bx,bz,y);
    }
    for(var qc=0; qc<nCherry; qc++){
      var chx = c.x + sx*rr(qNear+3, qFar-4), chz = c.z + sz*rr(qNear+3, qFar-4);
      cherryBlossom(chx, y, chz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(6,9)});
      treeBaseGrass(chx,chz,y);
    }
  });
}

/* ============================== GUILD: FOUR CRAFT HALLS + LOCAL MARKET ====
   Guild's own dedicated dispatch, replacing the borrowed gardenDeck() —
   per the owner's explicit follow-up: "the current garden canton was the
   old Guild canton i thought. please reset this to being the guild canton
   in all deep and top level aspects", plus the design brief given earlier
   in the same conversation, applied to the canton actually named 'Guild'
   (not the separate 'Market' canton, which is its own thing and untouched
   here): "the blacksmith's, alchemist's, mason's, and a new warrior's
   guild halls in the center in its 4 quadrants and a small market in the
   center."

   Guild (r:120, tiers:3, top:38) is noticeably smaller than the dedicated
   Market canton (r:134) — hw arrives here already narrowed by platCanton()'s
   own tier loop (three rounds of *0.86 off c.r*0.97), so everything below
   is scaled off THAT hw directly rather than off c.r, and kept modest on
   purpose: four working guild halls in their own quadrants, not four more
   market plazas, plus a handful of stalls at the centre, not a second
   bazaar.

   Each hall is a real structure()-built mass (hlaalu for the three blocky
   trade halls, velothi for the alchemist's leaning tower) facing the
   centre (faceToward(), 69-district-content.js — a hoisted function
   declaration, safe to call here despite loading later in file-
   concatenation order, same as gardenDeck() already called
   cherryBlossom()/baobab()/dragonTree() from 65-facade.js), each finished
   with addDoor()/addWindows() (65-facade.js) so none of the four reads as
   a blank wall, plus its own small signature dressing so the four are
   visually distinct rather than four recolours of one building.

   Combos used below, every one already a live (shape,family) bucket in
   the actual built scene (checked directly against scene.traverse() over
   every InstancedMesh, not assumed from source — box|metal and cyl|metal
   in particular are already spent by ordinatorFortress()'s iron mast/
   gatehouse and the ship-anchor prop, contrary to this being a fresh
   bucket): box|stone(default), box|plaster, box|wood, box|cloth,
   box|metal, fr3|stone(default), fr6|stone, fr8|stone, fr8|cloth,
   cyl|stone(default), cyl|wood, cyl|metal, cone|roof(default),
   dome|dome, blob|leaf. Zero new draw calls against a budget already at
   50/50. No new palette arrays either (PAL is frozen) — colour is entirely
   pick()/shade() off existing PAL arrays (TONES, JADEC, STALKC, TRUNKC,
   BANNERC, ROOFS), plus two reused literals already live elsewhere in
   this exact file for the exact same meaning (0x8fb8c4 the "water" tint
   ancestryCanton()'s own channels use, for the quench trough).

   SECOND PASS (owner: "see if you can fit all the current guild houses
   onto the guild canton. make them a little more distnmguishable too...
   each guildhouse should have a visible outdoor activity they do during
   the day"). Fit was checked live (headless probe against CANTON_TOPS
   ['Guild']/CIDX['Guild'], then a top-down screenshot) before anything
   else — the 4 halls + market already sit inside the top tier's square
   deck with generous clearance on every side, tier-edge pillars included
   (those sit only at the 4 cardinal faces, 50-cantons.js's platCanton()
   loop just above; the halls sit on the diagonals, nowhere near them), so
   nothing needed resizing or moving.

   Distinguishing detail + the owner's own 4 example activities, added
   below in-place in each hall's own IIFE: the blacksmith gets a glowing/
   smoking forge (static bright accent colour for the glow, a static blob
   cluster for the smoke — both cheap, no new bucket, see that section's
   own comment) plus a lean-to forge-shed roof for a distinct low silhouette,
   the mason gets a statue garden (statue(), 65-facade.js, already spent
   buckets), the warrior's guild gets a fenced sparring yard, and the
   alchemist gets an attached second-mass annex with a rooftop herb
   garden — all still zero new draw calls (box|stone default,
   box|plaster, box|wood, cyl|stone, blob|leaf, plus statue()'s own
   fr6|stone/dome|dome — no bucket here is new).

   The one genuinely new cost is the working NPCs themselves (multiple
   smiths, sparring warriors, the tending alchemist) — GUILD_WORK_POSTS
   (declared at the top of this file) collects every post as each hall
   below builds it; 78-life.js's updateGuildWorkers() consumes the array
   and drives one new shared InstancedMesh (BUDGET.drawCalls 52->53,
   05-palette.js — see that constant's own comment, and the guild-workers
   section of 78-life.js, for why a new draw call here rather than folding
   into an existing posted population). */

/* THIRD PASS (owner: "add an outdoor activity to all the guild houses?
   guildsmen sawing wood for carpenters, merchants having a very high
   priority market tend outside people visit with exotic goods, the
   clockmaker guild probably just needs an animated clock... extrapolate
   for the remaining guilds").

   Checked first, before writing anything: this canton has exactly the
   four halls the second pass built (blacksmith/alchemist/mason/warrior),
   all four already with their own outdoor activity, plus the small local
   market at the centre. There is no carpenters' hall, no merchants' hall,
   no clockmaker's hall — the owner's brief names guild TRADES, not guild
   HALLS that already exist here, and the canton's own layout has no spare
   quadrant for new full halls (all four diagonals are spoken for, "kept
   modest on purpose... four working guild halls... not four more market
   plazas" per the second pass's own header above). Rather than bolt three
   more full structure()-built halls onto a canton explicitly sized and
   laid out for exactly four, each new trade gets a real outdoor activity
   sized and placed the same way the existing ones were (a yard/annex, not
   a whole building), same standard: working NPCs actually posed at the
   activity, not static dressing.
     - carpenters: a freestanding sawyer's yard, its own spot (not grafted
       onto an existing hall) at the canton's south cardinal gap (between
       the blacksmith and the warrior — the two other "rough trade" halls,
       a fitting neighbourhood) — see the section below, after the four
       halls.
     - merchants: no spare hall, but this canton already HAS a merchant
       space — the small local market at the centre (below). Extended in
       place with a modest cloister-idiom arcade annex (monasteryAssemblyHall's
       ground-floor-cloister vocabulary, 61-monastery.js, read-only
       reference — arcade piers + a green planted square, simplified to one
       storey and sized for this canton) carrying a pair of "exotic goods"
       stalls, at the north cardinal gap (between the alchemist and the
       mason). Wired into LIFE_PED_CAT_ORDER (78-life.js) with real
       priority via GUILD_MARKET_DOOR — the "very high priority" half of
       the ask.
     - clockmaker: no clockmaker's guild anywhere in this city, and the
       brief explicitly allows skipping rather than inventing a fifth hall
       for it. Not skipped, though — a wall clock is small, cheap, and
       harmless to graft on, so per the brief's own "add to whichever
       existing hall best fits" fallback: mounted on the alchemist's
       tower — the tallest, most visible mass in the canton (so the whole
       point of a "visible" clock is actually served) and the hall whose
       own trade (precision, measured work) is the least jarring fit of
       the four for keeping the district's time. Animated hands, driven by
       dayNightHour() every frame — 82-daynight.js, same "read the game
       clock, drive a rotation" idiom that file's lighthouse beacons
       already use, not a static face.
     - "remaining guilds": there are none left uncovered — all four
       existing halls plus the two new trades above account for every
       guild in this canton. Nothing extrapolated beyond that; noting this
       honestly rather than inventing a guild that isn't there.

   Budget: draw calls were 53/60 live before this pass. The carpenter/
   merchant NPCs reuse GUILD_WORK_POSTS/updateGuildWorkers()'s existing
   shared InstancedMesh exactly like the original four roles (zero new
   draw calls — that mesh is already sized off GUILD_WORK_POSTS.length,
   computed after every push below). The sawyer yard and market annex are
   built from combos already spent in this same file (box/cyl/fr8|stone
   default, box|wood, box|cloth, blob|leaf, dome|dome via statue()'s own
   bucket) — zero new draw calls there too. The one real new cost is the
   clock hands (82-daynight.js): a genuinely new, tiny (2-instance) shared
   InstancedMesh, because reusing lifeGuildMesh's humanoid geometry for a
   clock hand would be the same bad visual-mismatch trade this file's own
   comment above already rejected for smiths-as-ordinators — one new draw
   call (53->54), same size cost the original guild-worker population
   itself paid for the identical reason. */
/* ---- FIFTH PASS: THE GRID (owner: "change guild canton to a grid building
   layout if that lets you fit the remaining guild halls in").

   It does. The FOURTH PASS above concluded, correctly for the layout it then
   had, that Potter's and Glassmaker's would not fit: four halls on the
   diagonals, four on the cardinals, a market at dead centre, and every gap
   left over an octant sliver. That conclusion was about the RADIAL
   arrangement, not about the canton - a radial plan spends its best land on
   four diagonal bearings and wastes a square platform's entire perimeter.

   The Guild canton's top tier is a SQUARE of half-width hw (platCanton()'s
   own c.r*0.97*0.86^tiers - ~74 units here, so ~148 across). Laid out as a
   grid 5 plots wide and 2 deep with a boulevard down the middle, that is 10
   plots: exactly the 8 existing halls plus Potter's and Glassmaker's, with
   real streets between them and nothing left over.

       col         0        1        2         3        4
       z<0 row   Smith   Potter   Glass     Mason   Warrior    (fire + stone)
       ==================== THE BOULEVARD ====================
       z>0 row   Alchem  Carpntr  Artific  Merchant  Weaver

   Numbers, measured against the platform rather than eyeballed:
     - column pitch GH_COL = hw*0.385 (28.5) against a hall frontage GH_D =
       hw*0.285 (21.1) -> a 7.4-unit service street between every pair.
     - hall depth GH_W = hw*0.32 (23.7); the two rows sit GH_ROW =
       GH_BLVD+GH_W/2 (37.8) either side of centre, so the boulevard between
       the two rows of shopfronts is 51.8 wide. It carries the centre market,
       the carpenters' sawyer yard and the merchants' bazaar cloister.
     - worst-case extents: column 4's centre 57.0 + frontage 10.5 = 67.5 < hw;
       deepest back yard (the warrior's sparring ground, resized below) 69.7
       < hw. Nothing overhangs the deck edge or fouls platCanton()'s own
       parapet blocks at hw*0.99 (73.3, 3 deep).

   Every hall keeps its own building, props and outdoor activity exactly as
   the passes above built them: all of those are placed with loc() in the
   hall's own local frame, so they travel with the plot for nothing. Only
   four things actually had to move or shrink - the alchemist's rooftop annex
   (tower side -> tower back, the side is a service street now), the
   warrior's sparring yard and the mason's statue garden (both used to spill
   past where the deck now ends), and the sawyer yard / bazaar cloister,
   which stop floating in the old cardinal gaps and become the forecourts of
   the Carpenter's and Merchant's own plots, on the boulevard. ---- */
function guildHallsDeck(c, y, hw){
  var GH_COL = hw*0.385, GH_W = hw*0.32, GH_D = hw*0.285;
  var GH_BLVD = hw*0.35, GH_ROW = GH_BLVD + GH_W*0.5;
  /* ghPlot(column 0..4, row -1|+1) -> that plot's centre and orientation. ry
     is a quarter turn one way or the other so local +x - the axis
     structure()/addDoor()/every prop below measures its offsets from -
     points at the boulevard, i.e. every hall fronts the street. Same
     convention faceToward() produced for the radial layout, just resolved to
     a cardinal instead of an arbitrary bearing, which is what makes the
     buildings sit square to each other and to the platform. */
  function ghPlot(j, row){
    return { x: c.x + (j-2)*GH_COL, z: c.z + row*GH_ROW, ry: row<0 ? -Math.PI/2 : Math.PI/2 };
  }
  /* one call per hall: its front-door record (the 'guildhall' LIFE_DOORS
     category, 78-life.js, which reads this array wholesale - so the two new
     halls are wired for pedestrians by pushing here, with nothing to add
     there) plus its inspector footprint, so hovering a hall names the hall
     instead of falling back to "Guild canton". inspectClaim() (86-inspect.js)
     is an inspect-only registry, deliberately NOT claim(): see its own
     comment for why. */
  function ghHall(name, hx, hz, w, d, ry){
    var dp = loc(hx, hz, w*0.5+1.2, 0, ry);
    GUILD_HALL_DOORS.push({ x:dp[0], z:dp[1], ry:ry, canton:'Guild', name:name });
    /* The inspect footprint is the PLOT, not just the walls: +11 along the
       hall's own front-back axis and +3.5 to each side (half the service
       street). Driving the inspector at the tight wall-only version first
       showed why — the ray lands on whatever stands in front, so the
       mason's jib crane and the glassmaker's vessel rack answered "Guild
       canton" while the hall two metres behind them answered correctly.
       A guild's forge, kiln, loom, sparring yard and statue garden ARE that
       guild's premises, so the plot is the honest unit. Checked against the
       grid's own spacing: 11 stops 3.3 units short of the centre market's
       stalls and 3.5 stops 0.2 short of the neighbouring column's band, so
       no two of these rectangles ever overlap and none swallows the market. */
    inspectClaim(hx, hz, w*0.5+11, d*0.5+3.5, ry, 'guildhall', name + "'s guild hall");
  }

  /* ---- the blacksmith's guild: a low, sooty, blocky hall, forge chimney
     out back, an anvil block + quench trough by the door. ---- */
  (function(){
    var P = ghPlot(0,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.40;
    var col = shade(c.tone, -0.16);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Blacksmith', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* flue, set back at the far corner from the door */
    var fp = loc(hx, hz, -w*0.5+3, d*0.5-3, ry);
    var chimW = Math.max(3.2, w*0.10), chimH = h*1.30;
    FR3(fp[0], y, fp[1], chimW, chimH, chimW, ry, shade(col,-0.34));
    CYL(fp[0], y+chimH, fp[1], chimW*0.36, chimW*0.55, 0, shade(col,-0.5));
    /* anvil block (box|metal — an existing bucket, see header) + a bed of
       coals, and a quench trough, just outside the door */
    var ap = loc(hx, hz, w*0.5+4.2, -d*0.22, ry);
    BOX(ap[0], y, ap[1], 1.6, 1.0, 2.6, ry, shade(col,-0.45), 'metal');
    CYL(ap[0], y+1.0, ap[1], 0.7, 0.35, 0, shade(ROOFS[2], 0.15));
    /* the forge itself: a hot ember core sitting in the coal bed — a
       static, always-lit bright accent colour (per the owner's "glows"
       ask), not a real light source: cheap, no new bucket (cyl|stone
       default, already spent), reads as glowing purely off how much
       brighter/more saturated it is than everything soot-dark around it. */
    CYL(ap[0], y+1.32, ap[1], 0.40, 0.22, 0, 0xff6a2e);
    CYL(ap[0], y+1.42, ap[1], 0.20, 0.14, 0, 0xffd23c);
    /* smoke: the owner's own ask — "a true particle effect rather than a
       rendered polygon". The static blob-puff cluster that used to sit here
       is retired in favour of registerSmokeEmitter() (65-facade.js), the
       one shared citywide particle rig: real puffs rising off the flue,
       leaning with the wind, swelling, wobbling, washing out toward the
       haze and recycling. Costs no draw call here at all — the forge shares
       one InstancedMesh with every other chimney in the city.

       A forge reads hotter, darker and far more vigorous than a house
       chimney: nearly 4x the pool, 3x the climb, a near-black sooty body
       and a hot ember-lit tone at the flue mouth (colHot/hotEnd) picking up
       the 0xff6a2e/0xffd23c coal bed two lines above.

       DETERMINISM: registerSmokeEmitter() draws nothing from the shared LCG
       (it hashes off its own world position), so the 4 rr(0,2pi) draws the
       retired blob loop made are made here anyway — the first as the plume
       phase, three as ballast — keeping this fragment's stream, and every
       canton/district/placement generated after it, bit-identical.
       See SUBAGENT.md s6, "Adding geometry mid-fragment". */
    var forgePhase = rr(0, Math.PI*2); rnd(); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+chimH+chimW*0.55, fp[1], {
      kind:'forge', n:21, life:4.6, rise:24, r0:0.85, r1:4.30,
      spread:0.70, sway:1.15, swirl:1.30, lean:0.46, phase:forgePhase,
      col:PAL.smoke.forge.body, colHot:PAL.smoke.forge.hot, hotEnd:0.22
    });
    var tp = loc(hx, hz, w*0.5+4.2, d*0.26, ry);
    BOX(tp[0], y, tp[1], 3.2, 1.1, 1.6, ry, shade(TRUNKC[0],-0.2), 'wood');
    BOX(tp[0], y+1.1, tp[1], 3.0, 0.3, 1.4, ry, 0x8fb8c4);
    /* the forge shed: a low lean-to roof on posts, sheltering the anvil
       and trough — gives the blacksmith its own distinct low, sprawling-
       wing silhouette (vs. mason/warrior's single hlaalu block), independent
       of structure()'s own internal random taper (built from known w/d/h
       here, not from whatever structure() happened to step back to). */
    var shedCx = w*0.5+4.2, shedD = 7.2, shedW = d*0.85, shedH = h*0.52;
    var shedC = loc(hx, hz, shedCx, 0, ry);
    [-1,1].forEach(function(s){
      var pp0 = loc(hx, hz, shedCx+shedD*0.40, s*shedW*0.42, ry);
      CYL(pp0[0], y, pp0[1], 0.42, shedH, 0, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(shedC[0], y+shedH, shedC[1], shedD, 1.0, shedW, ry, shade(col,-0.28), 'wood');
    /* multiple smiths working the forge, flanking the anvil — see
       updateGuildWorkers() (78-life.js) for the shared population these
       posts feed. */
    [-1.7, 1.7].forEach(function(s){
      var sp = loc(hx, hz, shedCx, -d*0.22+s, ry);
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry:ry+Math.PI, role:'smith', radius:0.9 });
    });
  })();

  /* ---- the alchemist's guild: a slender, jade-tinted leaning tower with
     a domed cap and a small cluster of still-like vessels beside it. ---- */
  (function(){
    var P = ghPlot(0,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = hw*0.25, d = hw*0.22, h = hw*0.68;
    var col = shade(pick(JADEC), 0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Alchemist', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'velothi', col, {cap:'dome'});
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    var pp = loc(hx, hz, w*0.5+6.5, -d*0.35, ry);
    BOX(pp[0], y, pp[1], 5.0, 1.3, 4.0, ry, shade(col,-0.15));
    var vY = y+1.3;
    [[-1.4,-0.9,0.55,'stone'],[0.6,0.7,0.85,'stone'],[1.7,-0.4,0.42,'metal']].forEach(function(v){
      var vp = loc(pp[0], pp[1], v[0], v[1], ry);
      var vcol = v[3]==='metal' ? shade(ROOFS[5], 0.10) : shade(JADEC[1], 0.12);
      var vh = 1.6 + v[2]*1.6;
      CYL(vp[0], vY, vp[1], v[2], vh, 0, vcol, v[3]);
      if(v[2] > 0.7) CONE(vp[0], vY+vh, vp[1], v[2]*0.5, 1.0, 0, shade(vcol,-0.1));
    });
    /* an attached annex, alongside the tower rather than another tower — a
       second, lower flat-roofed mass breaks the single-block silhouette
       every hlaalu hall still reads as, and carries the rooftop herb
       garden the owner asked for. Sized so structure()'s own hlaalu level
       count (Math.round(h/11)) lands on exactly 1 — a single, untapered
       block, so the real roof top is known here (annexTopY below) instead
       of guessed past structure()'s own internal random per-level taper. */
    var annexW = hw*0.15, annexD = hw*0.20, annexH = hw*0.20;
    /* GRID PASS: the annex moves from the tower's SIDE to its BACK. On the
       radial layout its side was open canton; on the grid that side is the
       7.4-unit service street shared with the Carpenter's plot, and the plot
       depth behind the tower is the space nothing else wants. */
    var annexP = loc(hx, hz, -(w*0.5 + annexW*0.5 - 1.0), 0, ry);
    var annexCol = shade(col, -0.06);
    var annexDhw = Math.min(2.2, annexW*0.5*0.9)*0.5;
    structure(annexP[0], y, annexP[1], annexW, annexD, annexH, ry, 'hlaalu', annexCol);
    addDoor(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol);
    addWindows(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol, annexDhw);
    var annexTopY = y + annexH + 1.3;
    /* rooftop herb garden: a row of planter troughs the alchemist tends */
    [-1.4,-0.5,0.5,1.4].forEach(function(t){
      var plp = loc(annexP[0], annexP[1], 0, t*annexD*0.35, ry);
      BOX(plp[0], annexTopY, plp[1], annexW*0.55, 0.7, annexD*0.14, ry, shade(TRUNKC[0],-0.15), 'wood');
      BLOB(plp[0], annexTopY+0.7, plp[1], annexD*0.10, 1.1, rr(0,Math.PI*2), shade(pick(JADEC), rr(-0.1,0.15)));
    });
    /* the alchemist, tending the rooftop garden — see updateGuildWorkers()
       (78-life.js) for the shared population this post feeds. */
    GUILD_WORK_POSTS.push({ x:annexP[0], z:annexP[1], y:annexTopY, ry:ry, role:'tender', radius:1.6 });

    /* THIRD PASS: the canton's clock, mounted on the tower's own front
       face (same wall the door/windows sit on) — see this function's own
       header comment above ("clockmaker") for why it lands here rather
       than on a dedicated hall. Mounted mid-tower, well above
       addWindows()'s own window band (that band sits at y+min(h*0.30,
       2.0-3.2) — a couple of units above the door, nowhere near h*0.42)
       and comfortably below the dome cap. A dark bezel (metal — reuses
       the still cluster's own ROOFS[5] metal accent above) plus a pale
       stone face (STALKC — reuses the mason's own "fresh-quarried pale"
       family below), sized off this same wall's own dhw so it can never
       be wider than the windows already safely placed on it. Only the
       FACE is static geometry here; the hands are a separate tiny
       InstancedMesh built in 82-daynight.js off GUILD_CLOCK (below),
       updated every frame from dayNightHour() — see that file for the
       actual rotation. */
    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.1, dhw*1.35), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.42;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);
      /* a small dark pin at the centre where the hands pivot, so the face
         doesn't read as blank stone between them */
      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCK = { x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 };
      GUILD_CLOCKS.push(GUILD_CLOCK);
    })();
  })();

  /* ---- the mason's guild: plain undyed stone, a pile of fresh-cut
     blocks, a lashed-timber scaffold and a small jib crane. ---- */
  (function(){
    var P = ghPlot(3,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.34;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Mason', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* loose fresh-cut stone blocks (STALKC — pale, reads as new-quarried
       against the aged canton tone), back corner */
    var bp = loc(hx, hz, -w*0.5-4, -d*0.30, ry);
    for(var bi=0; bi<6; bi++){
      var bo = loc(bp[0], bp[1], rr(-3,3), rr(-3,3), ry);
      var bs = rr(1.6,2.6);
      BOX(bo[0], y, bo[1], bs, bs*rr(0.7,1.0), bs*rr(0.8,1.2), rr(0,Math.PI*2), pick(STALKC));
    }
    /* scaffold along the far flank: 3 posts, 2 lashed cross-beams */
    [-1,0,1].forEach(function(si){
      var pp2 = loc(hx, hz, -w*0.5-1.4, si*d*0.28, ry);
      CYL(pp2[0], y, pp2[1], 0.35, h*0.65, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    [0.30,0.60].forEach(function(ft){
      var bmA = loc(hx, hz, -w*0.5-1.4, -d*0.28, ry), bmB = loc(hx, hz, -w*0.5-1.4, d*0.28, ry);
      BOX((bmA[0]+bmB[0])/2, y+h*ft, (bmA[1]+bmB[1])/2, 0.3, 0.3, d*0.56, ry, shade(TRUNKC[0],-0.1), 'wood');
    });
    /* a small jib crane, opposite corner from the block pile — the same
       vertical-mast + horizontal-arm silhouette portDeckV2()'s own crane
       uses (65-facade.js), scaled down for one canton's own mason yard */
    var cp = loc(hx, hz, w*0.5+3.0, d*0.5-3.0, ry);
    var craneH = hw*0.30, armLen = craneH*0.85;
    CYL(cp[0], y, cp[1], 0.65, craneH, 0, shade(TRUNKC[0],-0.2), 'wood');
    var armMid = loc(cp[0], cp[1], armLen*0.5, 0, ry);
    BOX(armMid[0], y+craneH*0.92, armMid[1], armLen, 0.45, 0.45, ry, shade(TRUNKC[0],-0.2), 'wood');
    /* a statue garden, further out past the block pile/scaffold — the
       yard's own finished stonework on display, the owner's explicit
       "mason guild has a statue garden" ask. Reuses statue() as-is
       (65-facade.js, hoisted, already called elsewhere in the city — see
       this deck's own header comment on why that's safe to call here
       despite loading later in file order); every bucket it touches
       (fr6|stone, dome|dome, fr8|stone, box|stone, cyl|stone, all
       default families) is already spent, so this is colour-only cost. */
    var gardenCx = -w*0.5-12;   /* GRID PASS: was -18, which now reaches past the deck edge behind this plot */
    [-1.8,-0.9,0,0.9,1.8].forEach(function(t){
      var gp = loc(hx, hz, gardenCx+rr(-2,2), t*d*0.42, ry);
      statue(gp[0], y, gp[1], ry+Math.PI+rr(-0.3,0.3), pick(STALKC), { h:rr(4.2,5.4), w:rr(1.3,1.7) });
    });
  })();

  /* ---- the warrior's guild (new — no prior treatment anywhere in the
     build): a sturdy blocky hall, crimson/gold banners flanking the
     door, wall-mounted shield plaques, and a small weapon rack. Bolder
     accent per the brief; kept to PAL.banner's existing reds/golds rather
     than inventing a new colour. ---- */
  (function(){
    var P = ghPlot(4,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.46;
    var col = shade(c.tone, -0.08);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Warrior', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* banners flanking the door */
    [-1,1].forEach(function(s){
      var pp3 = loc(hx, hz, w*0.5+1.0, s*(d*0.30), ry);
      var poleH = h*0.62;
      CYL(pp3[0], y, pp3[1], 0.28, poleH, 0, shade(TRUNKC[0],-0.15), 'wood');
      BOX(pp3[0], y+poleH-6.0, pp3[1], 0.16, 6.0, 2.6, ry, pick([BANNERC[0],BANNERC[1]]), 'cloth');
    });
    /* shield/blazon plaques, flush on the wall either side of the door */
    [-1,1].forEach(function(s){
      var sp2 = loc(hx, hz, w*0.5+0.10, s*(d*0.16), ry);
      BOX(sp2[0], y+h*0.40, sp2[1], 0.18, 1.9, 1.5, ry, pick([BANNERC[0],BANNERC[1]]));
    });
    /* a small weapon rack: standing spear shafts beside the door */
    var rp = loc(hx, hz, w*0.5+3.5, -d*0.42, ry);
    for(var wi=0; wi<4; wi++){
      var sp3 = loc(rp[0], rp[1], 0, (wi-1.5)*0.9, ry);
      var shaftH = rr(4.5,6.0);
      CYL(sp3[0], y, sp3[1], 0.14, shaftH, 0, shade(TRUNKC[0],-0.1), 'wood');
      CONE(sp3[0], y+shaftH, sp3[1], 0.30, 0.9, 0, shade(col,-0.4));
    }
    /* the sparring yard: a fenced practice ground out back, pale/packed
       against the canton's own darker tone so it reads as its own
       cleared space rather than more hall floor — the owner's explicit
       "warrior guild has a yard with warriors sparring" ask. */
    /* GRID PASS: was yardR 13 at -w*0.5-16, which put the far fence line
       ~79 units out - past the deck edge (hw=74) on this, the deepest plot
       on the grid. 9 at -w*0.5-11 keeps the whole yard on the platform
       (69.7) and still reads as a real cleared sparring ground. */
    var yardR = 9, yardC = loc(hx, hz, -w*0.5-11, 0, ry);
    BOX(yardC[0], y, yardC[1], yardR*2, 1.1, yardR*2, ry, shade(pick(STALKC), 0.32));
    for(var fi=0; fi<10; fi++){
      var fa = (fi/10)*Math.PI*2;
      var fp2 = loc(yardC[0], yardC[1], Math.cos(fa)*yardR, Math.sin(fa)*yardR, 0);
      CYL(fp2[0], y, fp2[1], 0.20, 1.4, 0, shade(TRUNKC[0],-0.2), 'wood');
    }
    /* warriors sparring, two pairs — see updateGuildWorkers() (78-life.js)
       for the shared population these posts feed; pairDx/pairDz is each
       fighter's own unit direction toward its partner, so the pair can
       lunge together and pull back along their own shared line instead of
       idle-wandering independently. */
    [[-3.2,0],[3.2,0]].forEach(function(pair, pi){
      var pc = loc(yardC[0], yardC[1], pair[0], pair[1], 0);
      var axAng = pi===0 ? 0 : Math.PI/2;
      [-1,1].forEach(function(side){
        var wp = loc(pc[0], pc[1], side*1.3*Math.cos(axAng), side*1.3*Math.sin(axAng), 0);
        GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:0, role:'warrior', radius:1.3, pairId:pi,
          pairDx: -side*Math.cos(axAng), pairDz: -side*Math.sin(axAng) });
      });
    });
  })();

  /* ---- a small local market at the centre: a well and a handful of
     stalls, not the dedicated Market canton's dozens. Reuses the exact
     stall vocabulary 69-district-content.js's DIST_MARKET pass and
     stallGoods() use (box|wood counter+posts, fr8|cloth awning,
     stallGoods() for the merchandise) rather than reinventing it.
     STALL_GOODS itself is NOT referenced — that var is assigned by
     69-district-content.js's own top-level code, which runs AFTER this
     canton's build (file order 50 before 69); an inline literal here
     gets the same 3 kinds without reading a not-yet-assigned var. */
  var marketR = hw*0.16;
  monasteryWell(c.x, y, c.z, 2.6, 0);
  var stallKinds = ['fruit','bread','cheese'];
  var nStalls = 6;
  for(var mi=0; mi<nStalls; mi++){
    var ma = (mi/nStalls)*Math.PI*2 + rr(-0.12,0.12);
    var mr = rr(marketR*0.55, marketR);
    var sx = c.x + Math.cos(ma)*mr, sz = c.z + Math.sin(ma)*mr;
    var mry = ma + Math.PI/2 + rr(-0.15,0.15);
    var sw = rr(4.2,5.4), sd = rr(4.2,5.4);
    var counterH = rr(0.9,1.1), postH = rr(2.4,2.7);
    BOX(sx, y, sz, sw, counterH, sd, mry, pick(TONES_POOR), 'wood');
    inspectClaim(sx, sz, sw*0.5, sd*0.5, mry, 'stall', 'Market stall');
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
      var p = loc(sx,sz, cc[0]*sw*0.42, cc[1]*sd*0.42, mry);
      BOX(p[0], y, p[1], 0.30, postH, 0.30, mry, pick(TRUNKC), 'wood');
    });
    FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, mry, pick(BANNERC), 'cloth');
    if(chance(0.7)) stallGoods(sx, sz, y+counterH, sw, sd, mry, pick(stallKinds));
  }

  /* ---- THIRD PASS: the carpenters' own yard — a freestanding sawyer's
     pit, not attached to any of the 4 halls (none of them is a carpenters'
     hall — see this function's own header comment above), at the south
     cardinal gap between the blacksmith and the warrior. Both already-
     built halls sit on the diagonals at qOff from centre (~0.71hw out,
     ±45° off this bearing); this yard sits at a much smaller 0.40hw
     straight out the cardinal, so it clears both with real margin without
     needing a live probe to prove it (checked with a top-down screenshot
     anyway per the process this session already established — see the
     canton's own outer pillars too, at 0.99hw on this same bearing, far
     past this yard's own ~0.10hw footprint radius). Logs/trestle are
     squared timber BOXes, not round CYLs — CYL in this kit is always
     upright (see plinthDoor()/every CYL call in this file), so a log
     lying on its side has to be a box, exactly like the mason's own
     lashed scaffold cross-beams already just above. box|wood, blob|leaf —
     both already spent. */
  (function(){
    /* GRID PASS: the yard stops floating in the old south cardinal gap and
       becomes the forecourt of the Carpenter's own plot (column 1, north
       row), out on the boulevard directly in front of its door. */
    var yardC = [c.x - GH_COL, c.z + hw*0.162];
    var yardHalf = hw*0.075;
    /* sawdust-pale cleared patch, same "own cleared space" idiom the
       warrior's yard uses just above, one shade paler for wood dust
       rather than packed dirt */
    BOX(yardC[0], y, yardC[1], yardHalf*2.4, 1.0, yardHalf*2.4, 0, shade(pick(STALKC), 0.30));
    /* a corner woodpile: squared beams stacked log-cabin style */
    var pileC = [yardC[0]-yardHalf*0.9, yardC[1]-yardHalf*0.7];
    for(var pi=0; pi<5; pi++){
      var alt = pi%2===0;
      var logCol = shade(TRUNKC[pi%TRUNKC.length], rr(-0.08,0.10));
      BOX(pileC[0], y+0.4+pi*0.62, pileC[1], alt?4.6:0.62, 0.58, alt?0.62:4.6, 0, logCol, 'wood');
    }
    /* the trestle: two X-leg sawhorses carrying one long squared timber at
       working height, the two-person pit saw's own log */
    var logLen = yardHalf*1.5, logY = y+1.35;
    /* trestle legs: straight upright posts (same table/stall-leg idiom the
       local market's own counters and the mason's scaffold posts already
       use just above/below in this file) — not a true X-frame, since this
       kit's BOX only yaws about the vertical axis (see plinthDoor()'s own
       comment on CYL for the same constraint), it can't lean a leg. */
    [-1,1].forEach(function(s){
      var lp = [yardC[0]+yardHalf*0.5, yardC[1]+s*logLen*0.32];
      [-1,1].forEach(function(k){
        BOX(lp[0]+k*0.5, y, lp[1], 0.28, logY-y, 0.28, 0, shade(TRUNKC[0],-0.1), 'wood');
      });
    });
    BOX(yardC[0]+yardHalf*0.5, logY, yardC[1], 1.05, 1.05, logLen, 0, shade(TRUNKC[1],0.05), 'wood');
    /* wood shavings/offcuts, scattered round the trestle — small pale
       blob clumps (blob|leaf, colour-only reuse, same trick the ancestry
       canton's own lawn/shrub fill above already leans on) plus a few
       loose squared offcuts */
    for(var wo=0; wo<9; wo++){
      var op = [yardC[0]+yardHalf*0.5+rr(-2.2,2.2), yardC[1]+rr(-logLen*0.6,logLen*0.6)];
      BLOB(op[0], y+0.15, op[1], rr(0.35,0.6), rr(0.18,0.30), rnd()*3, shade(0xcbb78a, rr(-0.08,0.08)), 'leaf');
    }
    for(var of=0; of<4; of++){
      var op2 = [yardC[0]+rr(-yardHalf*1.6,-yardHalf*0.3), yardC[1]+rr(-yardHalf*1.2,yardHalf*1.2)];
      BOX(op2[0], y+0.2, op2[1], rr(0.5,0.9), 0.30, rr(0.5,0.9), rr(0,Math.PI*2), shade(TRUNKC[0],rr(-0.1,0.1)), 'wood');
    }
    /* the two sawyers, one at each end of the log — a real two-person pit
       saw pulling back and forth along the log's own axis, same paired-
       lunge mechanic the warrior's sparring pairs use (updateGuildWorkers(),
       78-life.js) just tuned to a shorter, steadier stroke — "sawing," not
       "fighting." pairDx/pairDz here point along the LOG's own length
       (world z), not the diagonal axes the warrior yard's pairs use. */
    [-1,1].forEach(function(side){
      var sp = [yardC[0]+yardHalf*0.5, yardC[1]+side*logLen*0.5];
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry: side<0?0:Math.PI, role:'carpenter', radius:0.9, pairId:0,
        pairDx:0, pairDz:-side });
    });
  })();

  /* ---- THIRD PASS: the merchants' own outdoor tend — see this function's
     header comment above for why this extends the centre market instead
     of getting a dedicated hall of its own. A small, single-storey, OPEN-
     sided cloister annex — monasteryAssemblyHall's ground-floor-cloister
     vocabulary (61-monastery.js, read-only reference, not called
     directly: arcade piers around a green square), simplified to 3 sides
     (open toward the centre so pedestrians can actually walk in) and
     scaled down for this canton — at the north cardinal gap between the
     alchemist and the mason, carrying the "exotic goods" stalls the owner
     asked for. box|stone(default), dome|dome, box|plaster, blob|leaf,
     box|wood, fr8|cloth — every one already spent in this canton. */
  (function(){
    /* GRID PASS: mirrors the sawyer yard above - the cloister becomes the
       forecourt of the Merchant's own plot (column 3, north row), on the
       boulevard in front of its door, with its open side still facing the
       centre so pedestrians walk straight in off the market. Span trimmed
       0.30->0.27 hw so its closed north arcade clears that hall's own front
       ledger table with ~1.4 units to spare. */
    var bazC = [c.x + GH_COL, c.z + hw*0.162];
    var span = hw*0.27, archW = span/3, pierW = archW*0.22, archH = 8.4;
    var pierCol = shade(c.tone, -0.02);
    [ {lx:-span*0.5, lz:0, along:'z'}, {lx:span*0.5, lz:0, along:'z'},
      {lx:0, lz:span*0.5, along:'x'} ].forEach(function(side){
      for(var b=0;b<3;b++){
        var bt = (b-1)*archW;
        var pp = side.along==='x' ? [bazC[0]+bt-archW*0.5+pierW*0.5, bazC[1]+side.lz]
                                   : [bazC[0]+side.lx, bazC[1]+bt-archW*0.5+pierW*0.5];
        var pierRy = side.along==='x' ? 0 : Math.PI/2;
        BOX(pp[0], y, pp[1], pierW, archH, 0.9, pierRy, pierCol);
        var archP = side.along==='x' ? [bazC[0]+bt, bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]+bt];
        DOME(archP[0], y+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, pierCol);
      }
      /* a continuous lintel along the piers' own tops — without it, 3 evenly
         spaced dome caps read from most angles as a row of separate bollard
         "mushrooms" rather than one colonnade (found by screenshot: the
         un-lintelled first draft did exactly that). Same coping-strip idiom
         monasteryAssemblyHall's own upper-storey parapet uses (61-monastery.js,
         read-only reference) — box|stone default, zero new draw calls. */
      var lp = side.along==='x' ? [bazC[0], bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]];
      BOX(lp[0], y+archH+0.5, lp[1], side.along==='x'?span:1.0, 0.8, side.along==='x'?1.0:span, 0, shade(pierCol,-0.10));
    });
    /* the green square itself — same "contemplation garden" fill the
       cloister idiom carries in its own reference file: grass-toned
       plaster underfoot, a scatter of trimmed shrubs */
    BOX(bazC[0], y-0.05, bazC[1], span*0.82, 0.30, span*0.82, 0, 0x4f6b3a, 'plaster');
    for(var g=0; g<8; g++){
      var ga = g*(Math.PI*2/8), gr = span*0.30;
      var gp = [bazC[0]+Math.cos(ga)*gr, bazC[1]+Math.sin(ga)*gr];
      BLOB(gp[0], y+0.25, gp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, shade(0x4a7a3a, rr(-0.1,0.1)), 'leaf');
    }
    /* the exotic-goods stalls themselves: bigger, better-dressed than the
       plain fruit/bread/cheese stalls at the centre (jade awnings instead
       of banner-red, a dedicated 'exotic' stallGoods() kind — see that
       function's own new branch, 69-district-content.js) since these are
       the merchant guild's own showpiece, not a generic vendor. */
    [-1,1].forEach(function(s){
      var sx = bazC[0] + s*span*0.22, sz = bazC[1] - span*0.06;
      var sw = 5.6, sd = 4.6, counterH = 1.05, postH = 2.6;
      BOX(sx, y, sz, sw, counterH, sd, 0, pick(TONES_POOR), 'wood');
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
        BOX(sx+cc[0]*sw*0.42, y, sz+cc[1]*sd*0.42, 0.30, postH, 0.30, 0, pick(TRUNKC), 'wood');
      });
      FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, 0, pick(JADEC), 'cloth');
      stallGoods(sx, sz, y+counterH, sw, sd, 0, 'exotic');
      /* the merchant tending it, showing the goods off to whoever walks
         up — see updateGuildWorkers() (78-life.js) for the shared
         population this post feeds */
      GUILD_WORK_POSTS.push({ x:sx - s*sw*0.30, z:sz+sd*0.55, y:y, ry:Math.PI, role:'merchant', radius:1.2 });
    });
    /* the "very high priority" half of the ask: registered as its own
       LIFE_DOORS category (78-life.js), given real priority in
       LIFE_PED_CAT_ORDER rather than folded into the generic 'shop'
       category the other 3 hall doors get. */
    GUILD_MARKET_DOOR = { x:bazC[0], z:bazC[1]-span*0.55, ry:Math.PI };
  })();

  /* ---- FOURTH PASS (owner: "place the carpenter and merchant guild and
     make [...] weaver's, clockmaker's/artificer's, potter's, glassmaker's,
     and navigator's guild... other should go on the guild canton until we
     run out of space there"). Real, separate hall buildings — the THIRD
     PASS's sawyer yard and bazaar annex above only ever existed because no
     dedicated Carpenter/Merchant hall existed yet; both are kept exactly
     where they are and now sit as this hall's own forecourt.

     Space audit, done before placing anything: the 4 original halls above
     already occupy all 4 diagonal quadrants (qOff=hw*0.5 out on each
     diagonal); the carpenter yard/merchant bazaar already occupy the two
     ±z cardinal gaps between them; the local market sits at dead centre.
     The two ±x cardinal gaps were the only ones left completely open —
     verified against every existing hall's own extensions (forge shed,
     alchemist still-cluster/rooftop annex, mason scaffold/statue garden,
     warrior sparring yard) by hand before picking a spot, confirmed after
     with a top-down screenshot per this file's own established process
     (see the carpenter yard's own header comment above). No claim()/
     PLACED call is used here, same as every other structure in this
     function — this canton was never on that system; positions are plain
     canton-relative offsets, exactly like the 4 original halls and the
     THIRD PASS yard/annex above.

     Fitting the remaining two asks (Weaver, Clockmaker/Artificer) used up
     BOTH open cardinal gaps. That leaves NO clean, non-overlapping spot on
     this canton for Potter's or Glassmaker's Guild: the only space left is
     the narrow octant slivers between a diagonal hall and a cardinal hall,
     each only a few units wide once the neighbours' own yards/gardens/
     sheds are accounted for — not enough to plant a real hall without
     forcing a clip. Per the owner's own instruction ("place as many as
     cleanly fit... don't force overlaps"), Potter's and Glassmaker's
     Guilds are NOT placed on this canton. */

  /* ---- Carpenter's Guild: a plain timber-raftered hall, on-axis due
     south of centre, just beyond the existing sawyer yard (which now
     reads as this hall's own working forecourt facing the plaza). Narrow
     (half-width ~9.6) and centred exactly on the canton's own x=0 axis so
     it clears the blacksmith/warrior halls purely by x-separation
     (their footprints start at |x|>=21.5; margin ~11.5) regardless of any
     z overlap — the same separating-axis margin every hall below relies
     on instead of a live probe. ---- */
  (function(){
    var P = ghPlot(1,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = shade(pick(TONES), -0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the lumber rack/shingle which
       both sit out past fx0 nearer the front corner). See
       guildHallWindows3()'s own header (65-facade.js) for why this
       replaces addWindows() outright rather than stacking on top of it. */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* a lumber rack and a hung shingle by the door — the hall's own small
       accent, the real "sawing" activity stays down at the yard just in
       front of it. box|wood already spent (yard/scaffold/etc, above). */
    var rp = loc(hx, hz, w*0.5+2.6, -d*0.32, ry);
    for(var li=0; li<4; li++){
      BOX(rp[0], y+0.3+li*0.55, rp[1], 3.6, 0.5, 0.9, ry, shade(TRUNKC[li%TRUNKC.length],rr(-0.06,0.08)), 'wood');
    }
    var sgp = loc(hx, hz, w*0.5+0.3, d*0.28, ry);
    BOX(sgp[0], y+h*0.5, sgp[1], 0.25, 1.6, 2.4, ry, shade(TRUNKC[0],-0.2), 'wood');
    ghHall('Carpenter', hx, hz, w, d, ry);
  })();

  /* ---- Merchant's Guild: on-axis due north of centre, just beyond the
     existing exotic-goods cloister (now this hall's own showroom
     forecourt). Same narrow on-axis x=0 footprint/clearance logic as the
     carpenter hall above, mirrored to the +z side. ---- */
  (function(){
    var P = ghPlot(3,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the -z side wall, clear of the ledger table which sits out
       past fx0 nearer the front corner). See guildHallWindows3()'s own
       header (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* a ledger table and balance scale by the door — box|wood(spent),
       cyl|metal(spent) */
    var tp = loc(hx, hz, w*0.5+2.4, -d*0.30, ry);
    BOX(tp[0], y, tp[1], 2.6, 1.1, 1.5, ry, shade(TRUNKC[0],-0.15), 'wood');
    CYL(tp[0], y+1.1, tp[1], 0.10, 1.3, 0, shade(ROOFS[5],0.10), 'metal');
    CYL(tp[0], y+2.2, tp[1], 0.55, 0.06, 0, shade(ROOFS[5],0.15), 'metal');
    ghHall('Merchant', hx, hz, w, d, ry);
  })();

  /* ---- Weaver's Guild: the +x cardinal gap, the first of the two that
     were completely open. Shifted slightly to -z (off the pure x=0 axis)
     so it clears the alchemist's rooftop annex (which sits toward +z off
     the alchemist tower) with real margin, verified against every
     neighbour's own extensions the same way as the header comment above
     describes. A loom frame and hanging dyed bolts, box|cloth/fr8|cloth
     (both already spent, warrior banners/market awnings) reused for the
     dye colours instead of inventing a new material. ---- */
  (function(){
    var P = ghPlot(4,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.24;
    var col = shade(pick(TONES), 0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the loom/bolts which sit out past
       fx0 nearer the front corner). See guildHallWindows3()'s own header
       (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the loom: two upright posts + a crossbeam, beside the door */
    var lp = loc(hx, hz, w*0.5+3.6, -d*0.30, ry);
    var loomW = 3.4, loomH = 3.0;
    [-1,1].forEach(function(s){
      var pp = loc(lp[0], lp[1], 0, s*loomW*0.5, ry);
      CYL(pp[0], y, pp[1], 0.22, loomH, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    BOX(lp[0], y+loomH, lp[1], 0.8, 0.3, loomW+0.4, ry, shade(TRUNKC[0],-0.1), 'wood');
    /* dyed bolts of cloth, hung from the crossbeam — a spread of banner
       hues so it reads as dyed stock, not one flat colour */
    for(var bi=0; bi<4; bi++){
      var bt = (bi-1.5)*loomW*0.30;
      var bp = loc(lp[0], lp[1], 0.5, bt, ry);
      BOX(bp[0], y+loomH-1.9, bp[1], 0.5, 2.6, 1.0, ry, pick(BANNERC), 'cloth');
    }
    /* a second small display: folded/stacked bolts just outside the door */
    var fp = loc(hx, hz, w*0.5+1.6, d*0.34, ry);
    FR8(fp[0], y+0.6, fp[1], 2.2, 1.2, 1.6, ry, pick(BANNERC), 'cloth');
    /* the weaver, at the loom — falls through to updateGuildWorkers()'s
       generic tender idle-wander branch (78-life.js), same as the
       alchemist's rooftop tender: reads fine as "tending the loom"
       without a bespoke motion branch. */
    GUILD_WORK_POSTS.push({ x:lp[0], z:lp[1], y:y, ry:ry+Math.PI, role:'weaver', radius:1.1 });
    ghHall('Weaver', hx, hz, w, d, ry);
  })();

  /* ---- Clockmaker's/Artificer's Guild: the -x cardinal gap, the second
     (and last) open one. Shifted off-axis to +z, clearing the warrior's
     detached sparring yard (which reaches to within ~2 units of z=0 on
     this side) and the mason hall (whose own footprint starts at
     z=26.67) with margin on both sides — see this deck's own header
     comment. A slender 'velothi' tower (distinct silhouette from the 3
     'hlaalu' block halls) carries its own animated clock face, the SAME
     idiom the alchemist tower's face already uses (see that IIFE above)
     but its own dedicated instance: GUILD_CLOCKS (this file's own header)
     now holds both, and 82-daynight.js resizes its ONE hand InstancedMesh
     to cover every entry instead of adding a second draw call. ---- */
  (function(){
    var P = ghPlot(2,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.02);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'velothi', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side. The 2
       front windows sit at doorHalfW + fww*0.5 + margin out from centre
       (>=1.6 out on this hall's own dimensions), clear of the clock face
       built just below (rimHalf capped at ~1.1-1.375, centred on the same
       wall) with real margin. Side window on the back half of the -z wall,
       clear of the workbench which sits out past fx0 nearer the front
       corner. See guildHallWindows3()'s own header (65-facade.js). */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* the clock face — same construction as the alchemist tower's own
       (mid-wall, dark metal bezel over a pale stone dial), pushed into
       GUILD_CLOCKS instead of overwriting GUILD_CLOCK so both keep
       ticking. */
    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.0, dhw*1.25), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.40;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);
      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCKS.push({ x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 });
    })();
    /* a small workbench with gear-like discs (cyl|metal — spent) — the
       artificer's own outdoor tend, same "activity by every hall" idiom
       as the rest of this canton. */
    var wp = loc(hx, hz, w*0.5+2.6, -d*0.28, ry);
    BOX(wp[0], y, wp[1], 2.4, 1.0, 1.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    [[-0.5,0.32],[0.5,0.22]].forEach(function(g){
      var gp = loc(wp[0], wp[1], g[0], 0.9, ry);
      CYL(gp[0], y+1.0, gp[1], g[1], 0.10, 0, shade(ROOFS[5],0.08), 'metal');
    });
    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'artificer', radius:1.0 });
    ghHall('Artificer', hx, hz, w, d, ry);
  })();

  /* ---- FIFTH PASS: Potter's Guild (column 1, south row) - one of the two
     trades the FOURTH PASS had to turn away for want of a plot. A low,
     thick-walled hall with its working yard out front on the boulevard: a
     domed beehive kiln with a glowing stoke hole, a drying rack of
     greenware, a wheel, and stacks of finished urns. The kiln reuses the
     blacksmith's own two idioms verbatim rather than inventing anything -
     a static rising blob|leaf puff cluster for smoke, and a bright
     cyl|stone/box|stone core reading as heat rather than a real light -
     and every bucket it touches (box/cyl/dome/blob x stone/dome/leaf/wood)
     is already spent in this canton, so it costs no draw call. ---- */
  (function(){
    var P = ghPlot(1,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.10);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Potter', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the beehive kiln, in the forecourt beside the door */
    var kp = loc(hx, hz, w*0.5+5.6, -d*0.26, ry);
    var kilnR = 3.2, kilnH = 4.2;
    CYL(kp[0], y, kp[1], kilnR, kilnH, 0, shade(col,-0.26));
    DOME(kp[0], y+kilnH, kp[1], kilnR, kilnR*0.85, 0, shade(col,-0.32));
    CYL(kp[0], y+kilnH+kilnR*0.85, kp[1], kilnR*0.30, 1.6, 0, shade(col,-0.42));
    var stokeP = loc(kp[0], kp[1], kilnR*0.88, 0, ry);
    BOX(stokeP[0], y+0.5, stokeP[1], 0.5, 1.5, 1.7, ry, 0xff6a2e);
    BOX(stokeP[0], y+0.45, stokeP[1], 0.3, 0.8, 0.9, ry, 0xffd23c);
    /* kiln smoke: the same shared particle rig the blacksmith's forge now
       uses (registerSmokeEmitter, 65-facade.js) rather than the retired
       static blob cluster — still sharing the forge's one citywide draw
       call. A wood-fired kiln smoulders rather than roars, so this is a
       slower, paler, lazier plume than the forge's: fewer puffs, a shorter
       climb and a warm-grey body instead of near-black soot.
       DETERMINISM: the retired loop's 3 rr(0,2pi) draws are kept (first as
       the plume phase, two as ballast) so this fragment's stream is
       unchanged downstream — see the forge's own note above. */
    var kilnPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(kp[0], y+kilnH+kilnR*0.85+1.6, kp[1], {
      kind:'kiln', n:14, life:6.4, rise:17, r0:0.62, r1:3.00,
      spread:0.50, sway:0.80, swirl:0.85, lean:0.56, phase:kilnPhase,
      col:PAL.smoke.kiln.body, colHot:PAL.smoke.kiln.hot, hotEnd:0.16
    });
    /* the wheel the potter actually works at, and a drying rack of greenware */
    var wp = loc(hx, hz, w*0.5+2.2, d*0.06, ry);
    CYL(wp[0], y, wp[1], 0.36, 0.9, 0, shade(TRUNKC[0],-0.20), 'wood');
    CYL(wp[0], y+0.9, wp[1], 0.95, 0.18, 0, shade(col,-0.36));
    CYL(wp[0], y+1.08, wp[1], 0.32, 0.55, 0, shade(pick(TONES_POOR), 0.04));
    var rkp = loc(hx, hz, w*0.5+3.4, d*0.30, ry);
    [-1,1].forEach(function(s){
      var lp = loc(rkp[0], rkp[1], 0, s*1.4, ry);
      BOX(lp[0], y, lp[1], 0.3, 1.5, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(rkp[0], y+1.5, rkp[1], 1.9, 0.25, 3.1, ry, shade(TRUNKC[0],-0.15), 'wood');
    for(var pq=0; pq<5; pq++){
      var qp = loc(rkp[0], rkp[1], rr(-0.7,0.7), rr(-1.2,1.2), ry);
      CYL(qp[0], y+1.75, qp[1], rr(0.22,0.38), rr(0.5,0.9), 0, shade(pick(TONES_POOR), 0.06));
    }
    /* stacked finished urns against the hall's own front wall */
    for(var st=0; st<3; st++){
      var up = loc(hx, hz, w*0.5+1.3, -d*0.44+st*1.6, ry);
      var ur = rr(0.5,0.8);
      CYL(up[0], y, up[1], ur, ur*1.7, 0, shade(pick(TONES_POOR), -0.04));
      DOME(up[0], y+ur*1.7, up[1], ur*0.92, ur*0.7, 0, shade(pick(TONES_POOR), -0.10));
    }
    /* the potter, at the wheel - no bespoke motion branch, so this falls
       through to updateGuildWorkers()'s generic tender idle-wander
       (78-life.js), which already reads as "working at something at waist
       height", same call the weaver's own post makes. */
    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'potter', radius:1.0 });
  })();

  /* ---- FIFTH PASS: Glassmaker's Guild (column 2, south row) - the other
     turned-away trade, and the last plot the grid needed to fill. A taller
     hall over a domed glass furnace with a molten mouth, a marver bench,
     and finished vessels out on a display rack.

     On the "existing translucent/emissive material" question: there is
     none. FAMMAT (05-palette.js) is stone/plaster/roof/wood/dome/leaf/
     trunk/fungus/metal/cloth, every one opaque, and a new family would cost
     a new draw-call bucket for every shape it touched. So the glass is read
     the way this build already reads its forge embers and its lantern
     flames - by colour alone: vessels several shades paler and cooler than
     any masonry tone near them, and a gather at the furnace mouth in the
     same 0xff6a2e/0xffd23c heat pair the blacksmith's forge and the
     potter's kiln above both use. Noted as the honest limit rather than
     claimed as real glass. ---- */
  (function(){
    var P = ghPlot(2,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.33;
    var col = shade(pick(TONES), -0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    var glassCol = shade(JADEC[0], 0.42);   /* the pale, cool "glass" tone every vessel below shares */
    ghHall('Glassmaker', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);
    /* the furnace: a squat drum under a dome, with the glory hole facing
       the yard and a flue above */
    var fp = loc(hx, hz, w*0.5+5.4, d*0.24, ry);
    var furR = 2.9, furH = 3.4;
    CYL(fp[0], y, fp[1], furR, furH, 0, shade(col,-0.34));
    DOME(fp[0], y+furH, fp[1], furR*0.98, furR*0.80, 0, shade(col,-0.40));
    CYL(fp[0], y+furH+furR*0.80, fp[1], furR*0.26, 2.2, 0, shade(col,-0.48));
    var mouth = loc(fp[0], fp[1], -furR*0.86, 0, ry);
    BOX(mouth[0], y+1.5, mouth[1], 0.5, 1.3, 1.3, ry, 0xff6a2e);
    BOX(mouth[0], y+1.5, mouth[1], 0.3, 0.7, 0.7, ry, 0xffd23c);
    /* furnace smoke: shared particle rig again (registerSmokeEmitter,
       65-facade.js), not the retired static blob cluster. A glass furnace
       is kept at a continuous hard heat, so this reads between the forge
       and the kiln — quick and steady, a thin bright-hot flue plume that
       pales out fast. Same one citywide draw call.
       DETERMINISM: the retired loop's 3 rr(0,2pi) draws are kept (phase +
       2 ballast); see the forge's note above. */
    var furPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+furH+furR*0.80+2.2, fp[1], {
      kind:'furnace', n:15, life:4.0, rise:18, r0:0.52, r1:2.70,
      spread:0.44, sway:0.70, swirl:1.15, lean:0.50, phase:furPhase,
      col:PAL.smoke.furnace.body, colHot:PAL.smoke.furnace.hot, hotEnd:0.18
    });
    /* the marver bench the gather is rolled out on, with the blowpipe
       resting across it - the molten tip still glowing */
    var bp = loc(hx, hz, w*0.5+2.4, -d*0.10, ry);
    [-1,1].forEach(function(s){
      var lp2 = loc(bp[0], bp[1], 0, s*1.5, ry);
      BOX(lp2[0], y, lp2[1], 0.32, 1.05, 0.32, ry, shade(TRUNKC[0],-0.18), 'wood');
    });
    BOX(bp[0], y+1.05, bp[1], 1.5, 0.22, 3.6, ry, shade(ROOFS[5], -0.10), 'metal');
    var pipeP = loc(bp[0], bp[1], 0.2, 0, ry);
    BOX(pipeP[0], y+1.34, pipeP[1], 0.14, 0.14, 4.4, ry, shade(ROOFS[5], 0.05), 'metal');
    var tipP = loc(bp[0], bp[1], 0.2, -2.3, ry);
    CYL(tipP[0], y+1.28, tipP[1], 0.28, 0.34, 0, 0xff6a2e);
    /* the display rack: finished vessels, pale and cool against the tone */
    var dp2 = loc(hx, hz, w*0.5+1.4, d*0.38, ry);
    [-1,1].forEach(function(s){
      var lp3 = loc(dp2[0], dp2[1], 0, s*1.5, ry);
      BOX(lp3[0], y, lp3[1], 0.3, 2.4, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    [1.0, 2.4].forEach(function(sh){
      BOX(dp2[0], y+sh, dp2[1], 1.2, 0.18, 3.3, ry, shade(TRUNKC[0],-0.15), 'wood');
      for(var v=0; v<3; v++){
        var vp = loc(dp2[0], dp2[1], rr(-0.35,0.35), (v-1)*1.05 + rr(-0.2,0.2), ry);
        var vr = rr(0.24,0.40);
        CYL(vp[0], y+sh+0.18, vp[1], vr, vr*rr(1.6,2.4), 0, shade(glassCol, rr(-0.06,0.08)));
      }
    });
    DOME(dp2[0], y+2.58+0.18, dp2[1], 0.5, 0.42, 0, shade(glassCol, 0.06));
    /* the glassblower, working the gather at the bench - generic tender
       branch, same as the potter and the weaver. */
    GUILD_WORK_POSTS.push({ x:bp[0], z:bp[1], y:y, ry:ry+Math.PI, role:'glassblower', radius:1.0 });
  })();
}

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

/* ============================== 12. SPANS ============================== */

/* a pylon rising out of a canton to carry a bridge deck */
/* `foot` (optional, and passed by nothing but the Palace's own moved landing —
   see palaceLandingShift) overrides where the stair below comes down. The
   default puts it at RADIUS targetHw along the bearing, which is right on a
   cardinal approach and wrong on every other one, because these cantons are
   SQUARES: measured on the live scene, the Palace's Foreign stair ended 24.8
   units inside tier 1's solid flank and its Temple stair 46.0 inside. Rather
   than change that default under Temple, Ancestry, Granary and every plat
   canton at once, the one landing this pass moves hands in the real point on
   the flat face instead. */
function landing(c, ax, az, ry, w, foot){
  var spring = CANTON_TOPS[c.n].spring;
  FR8(ax, spring-3, az, w*1.85, DECK-spring+4, w*2.3, ry, shade(c.tone,0.02));
  BOX(ax, DECK+1.0, az, w*2.05, 2.8, w*2.6, ry, shade(c.tone,-0.18));
  [-1,1].forEach(function(s2){
    var p = loc(ax,az, 0, s2*w*1.15, ry);
    FR3(p[0], DECK+3.8, p[1], w*0.44, w*1.5, w*0.44, ry, shade(c.tone,0.04));
  });
  /* a stair from this landing's own cap platform to the canton's real
     walkable surface. Before this, the pylon was a solid frustum with a
     platform floating at DECK height and nothing whatsoever connecting it
     to anywhere walkable — "no smooth way for a pedestrian to get up
     there", exactly as flagged.
     Which surface: monoCanton()/templeCanton() (multi-tier Palace/Temple)
     record BOTH the true top (y/hw) and entryY/entryHw — tier 1's own
     base/radius, verified against the real tierWeights() numbers to be
     where DECK (54) actually lands (Palace: tier 1 starts at y=53.11,
     0.9 off DECK; checked by hand against CANTON_TOPS.y, not guessed).
     That's the level a bridge-borne pedestrian steps onto, not the
     summit — three earlier passes put the door at the top before this
     one actually checked the numbers. platCanton() cantons (Market,
     Arena, Port, ...) never set entryY/entryHw — they're single-deck, the
     ordinary top IS the entrance, so this falls back to y/hw for them. */
  var top = CANTON_TOPS[c.n];
  /* bridgeY/bridgeHw (ancestryCanton() only) is the stair's own preferred
     target, when it differs from the ground-height entryY/entryHw other
     readers (lifeGroundY, cantonEdgeY) rely on — see the comment by that
     assignment for why the two must not be the same field. */
  var targetY = (top.bridgeY !== undefined) ? top.bridgeY : (top.entryY !== undefined) ? top.entryY : top.y;
  var targetHw = (top.bridgeHw !== undefined) ? top.bridgeHw : (top.entryHw !== undefined) ? top.entryHw : top.hw;
  var toPx = ax-c.x, toPz = az-c.z, toPL = Math.hypot(toPx,toPz) || 1;
  var ex = c.x + toPx/toPL*targetHw, ez = c.z + toPz/toPL*targetHw;
  if(foot){ ex = foot[0]; ez = foot[1]; }
  linkStair(ax, az, DECK+2.4, ex, ez, targetY, w*0.85);
  window._landingStairs = window._landingStairs || [];
  window._landingStairs.push({canton:c.n, ax:ax,az:az,ay:DECK+2.4, ex:ex,ez:ez,ey:targetY});

  /* the owner's bridge rule. Where the stair above delivers someone onto a
     tier that is NOT the top, that tier's own wall already carries a door
     (monoCanton()/templeCanton() build one per approach face at exactly
     this entryY/entryHw — Palace at y=53.1 of 132.6, Temple at 57.8 of
     156.7, both tier 1 of 5/6, both correct as they stand). Where it
     delivers onto the TOP deck — every platCanton() canton, because those
     are single-deck and `targetY` falls back to CANTON_TOPS.y — there is
     no wall above, so the rule says staircase instead. Ancestry is the
     third case and neither: its bridges land mid-way up a continuous
     open garden ramp (bridgeY=53.3 of 150) whose only vertical surface
     within reach is a 1.6-unit parapet, with the solid core 27+ units
     inboard behind a 13-unit planted bed — there is no wall there to put
     a door in, so it deliberately gets neither. */
  var arr = cantonArrivalLevel(c.n, targetY + 1.5);
  if(arr && arr.top){
    var ang = Math.atan2(ax-c.x, az-c.z);
    var got = cantonTopDescent(c, ang, w);
    window._cantonBridgeDoors = window._cantonBridgeDoors || [];
    window._cantonBridgeDoors.push({canton:c.n, ang:got?got.ang:ang, placed:!!got,
                                     y:got?got.y:null, hw:got?got.hw:null});
  }
}

/* every bridge support pylon span() builds below (river bridges AND canton
   SPANS both call this one function) — the owner: "ferries still clip
   through bridge supports, please make sure they and all boats know to
   avoid them". Declared here, early (file order 50), rather than in
   78-life.js's own obstacle lists (order 78, and the life layer's own
   LIFE_EXTRA_PIERS doesn't exist yet until order 65 in any case) — span()
   itself gets called as early as 60-land.js, so this needs to exist
   before ANY of its callers run. 78-life.js's lifeNavBlocked reads it
   directly; it doesn't care when in file order the array got filled, only
   that it's full by the time the grid is actually built (late in the ship
   section, after every static pass has finished). */
var BRIDGE_SUPPORTS = [];
function span(ax,az,ay, bx,bz,by, w, col, arch, parapet){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/20));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var x=ax+dx*t, z=az+dz*t;
    var y = mix(ay,by,t) + arch*Math.sin(Math.PI*t);
    BOX(x, y-2.8, z, w, 3.0, L/n*1.09, ry, col);
    if(parapet){
      var pl = loc(x,z,  w*0.5-0.8, 0, ry), pr = loc(x,z, -(w*0.5-0.8), 0, ry);
      BOX(pl[0], y+0.2, pl[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
      BOX(pr[0], y+0.2, pr[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
    }
  }
  var np = Math.max(1, Math.round(L/135));
  var supportT = [0];
  for(var k=1;k<=np;k++){
    var t2 = k/(np+1);
    var px = ax+dx*t2, pz = az+dz*t2;
    var yt = mix(ay,by,t2) + arch*Math.sin(Math.PI*t2) - 2.8;
    var bd = bedAt(px,pz);
    FR8(px, bd, pz, w*1.55, yt-bd, w*1.7, ry, shade(col,-0.22));
    BOX(px, yt-3.4, pz, w*1.85, 2.0, w*2.0, ry, shade(col,-0.30));
    /* r: was w*1.0 — measured directly against the real solid footprint
       just built above (FR8 half-extents ~w*0.775/w*0.85, the BOX
       ~w*0.925/w*1.0), whose true half-diagonal is closer to w*1.35;
       w*1.0 under-covered it enough that vehicles were still measured
       clipping the pylon after "avoiding" it by this radius's own logic. */
    BRIDGE_SUPPORTS.push({ x:px, z:pz, r: w*1.4 });
    supportT.push(t2);
  }
  supportT.push(1);
  /* banners centered between each pair of adjacent supports (the two deck
     abutments count as supports too — a pylon-flanked span reads exactly
     like the reference: hanging cloth over open water at the midpoint
     between two piers), hung off both parapets. 2nd pass, made genuinely
     big — the first attempt (dropH 2.2-3.4, width 2-3, tucked in tight to
     the parapet at side*(w*0.5-0.4)) read as too subtle to register as
     "banners" at all. Now a long drop clearly hanging below the deck edge,
     wide, and pushed out past the parapet's own 1.5-unit thickness so it
     hangs in open air/over the water rather than overlapping the parapet
     geometry. Still box|cloth, top edge anchored/bottom free per
     applyClothSway's own convention — zero new draw calls. */
  for(var bi=0; bi<supportT.length-1; bi++){
    var tm = (supportT[bi]+supportT[bi+1])*0.5;
    var xm = ax+dx*tm, zm = az+dz*tm;
    var ym = mix(ay,by,tm) + arch*Math.sin(Math.PI*tm);
    [-1,1].forEach(function(side){
      var ep = loc(xm,zm, side*(w*0.5+1.6), 0, ry);
      var mountY = ym + 0.6, dropH = rr(9,14);
      BOX(ep[0], mountY-dropH, ep[1], 0.16, dropH, rr(4.5,6.5), ry, pick(BANNERC), 'cloth');
      window._bridgeBanners = window._bridgeBanners || [];
      window._bridgeBanners.push([Math.round(ep[0]), Math.round(mountY), Math.round(ep[1])]);
    });
  }
}

/* a reclaimed-land causeway: an earthen mole raised just above the waterline,
   with a revetted edge, rather than a deck on piers */
function reclaimedCauseway(ax,az, bx,bz, w, tone){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/26));
  var segL = L/n*1.10;
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n, x=ax+dx*t, z=az+dz*t;
    var bed = bedAt(x,z);
    FR8(x, bed, z, w, RLAND-bed, segL, ry, shade(tone,-0.20));             /* the fill */
    BOX(x, RLAND-0.5, z, w*0.94, 1.2, segL*0.98, ry, shade(tone,-0.32));   /* the road surface */
    [-1,1].forEach(function(side){
      var p = loc(x,z, side*(w*0.5-1.1), 0, ry);
      BOX(p[0], RLAND+0.7, p[1], 2.2, 2.6, segL*0.98, ry, shade(tone,-0.10));  /* revetment lip */
    });
  }
}

/* ============================== 13. BUILD ============================== */

reseed(31337);
CANTONS.forEach(function(c){ if(c.kind==='mono') monoCanton(c); else if(c.n==='Ancestry') ancestryCanton(c); else platCanton(c); });

reseed(777);
SPANS.forEach(function(p){
  var A=CANTONS[p.a], B=CANTONS[p.b];
  var dx=B.x-A.x, dz=B.z-A.z, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
  var w = rr(12,17);
  /* land on the canton faces, and carry the deck on a pylon at each end */
  var ax = A.x+ux*A.r*0.94, az = A.z+uz*A.r*0.94;
  var bx = B.x+ -ux*B.r*0.94, bz = B.z+ -uz*B.r*0.94;
  /* the Palace's own arrival rule — see palaceBays(). Returns null for every
     other canton and for every Palace arrival that stays put, so `ry` and both
     landings are computed exactly as before unless something actually moved,
     and the rr() draws in this loop and in span() are untouched either way
     (checked: the moved span's deck length goes 314.5 -> 302.3 and span()'s
     own support count, round(L/135), stays at 2, so the banner draws — the
     only other randomness in here — are the same count in the same order). */
  var pa = palaceLandingShift(A, ax, az), pb = palaceLandingShift(B, bx, bz);
  if(pa){ ax = pa.x; az = pa.z; }
  if(pb){ bx = pb.x; bz = pb.z; }
  var ry = (pa || pb) ? Math.atan2(bx-ax, bz-az) : Math.atan2(dx,dz);
  landing(A, ax, az, ry, w, pa && pa.foot);
  landing(B, bx, bz, ry, w, pb && pb.foot);
  span(ax,az,DECK, bx,bz,DECK, w, TONES[0], Math.min(20, L*0.055), true);   /* was a local 0xb3a68a literal — reads from the gray-brown palette now */
});

/* causeways: every rim canton is tied to the shore by a low level roadway */
reseed(2468);
CAUSEWAYS.forEach(function(cw){
  var c = cw.c;
  /* owner: "Fortress causeway doesn't have to be that black colour, make it
     look like other causeways." Every causeway takes its fill/road/revetment
     colour from the canton it leaves (shade(c.tone,...) below and inside
     reclaimedCauseway()), which was fine while every canton was gray-brown —
     but the Fortress recolour moved that canton's tone to basalt 0x322f2b, so
     its mole came out near-black while the other seven read as ordinary
     gray-brown roadway. The causeway is a public road across the bay, not
     part of the fortress, so it now takes TONES[0] — the same gray-brown
     PAL.stone.common entry the BRIDGE causeways (span(), above) and the
     canton spans already use, i.e. literally the colour the other causeways
     are built from. Fortress-only: every other canton still passes its own
     tone, so no other causeway moves. The canton's own flank, tiers, doors
     and trim are untouched — only the roadway leaving it. */
  var cwTone = c.fortress ? TONES[0] : c.tone;
  /* diagnostic only: every causeway's own roadway tone against the canton
     tone it used to take, so "only the Fortress one moved" is checkable
     from outside instead of by eye. */
  window._causewayTone = window._causewayTone || {};
  window._causewayTone[c.n] = { tone: c.tone, cwTone: cwTone, solid: !!cw.solid };
  var land = shoreIn(cw.s, 26);
  var dx=land[0]-c.x, dz=land[1]-c.z, L=Math.hypot(dx,dz);
  if(L < c.r + 40) return;
  var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
  var top = CANTON_TOPS[c.n].y;
  var ry = Math.atan2(dx,dz);

  /* ---- the causeway door, 3rd pass ---------------------------------------
     Owner, this round: "a lot of the canton doors are up a tier and not on
     a wall... there should be doors on tiers both where there is a bridge
     (as long as it's not the top level) and where there is a causeway."

     Both previous passes put this door on a height derived from the canton
     rather than from the CAUSEWAY, and both were wrong in the same way.
     Pass 1 used (`top`, c.r*0.96) — the flank ramp's nominal end. Pass 2
     moved it to entryY/entryHw, which for a platCanton() canton is not
     tier 1 at all: those never set entryY, so it fell back to
     CANTON_TOPS.y/.hw, i.e. the TOP DECK at the top tier's own top face —
     a dark slab standing on an open platform with nothing above it. That
     is exactly "up a tier and not on a wall", and it was true of all eight
     causeway cantons (Arsenal/Market y=40.4, Guild 38.4, Foreign 36.4,
     Port 34.4, Granary 32.2, Arena 30.2, Fortress 44.4).

     What a causeway actually delivers, measured: a reclaimed-land mole
     (Arsenal, Guild, Foreign, Granary, Market, Arena, Fortress) is FLAT at
     RLAND the whole way, road surface top y=3.3; a bridge causeway
     (Ancestry, Port) rides level at CWAY=17. Neither ever reaches the
     canton top. The FR8 below is a solid abutment, not a walkable ramp —
     raycast down Port's causeway centreline: its face climbs from y=15 to
     y=35.4 in 11 units of run, a 61-degree wall. So the deck's own height
     is what decides, and cantonArrivalLevel() turns it into the highest
     terrace a walker can actually stand on: for every one of these that
     is the plinth apron at y=6 (the quay cap at 7.3 for Port), with
     tier 0's own wall rising straight off it to hold the door.

     Stepped sideways by bearingBeside(): that same abutment is rw*0.30
     half-wide and sits on the causeway's own bearing, and on a
     face-normal approach (Guild at ry=1.8) it covers the door position
     outright — the door radius there is 118.5 and the abutment reaches
     134.5. Off to one side it is still on the mole (half-width rw*0.47)
     and clear of the block. Where the deck arrives above its own door
     level (Port, Ancestry) a linkStair carries it down; that is the whole
     of the Ancestry fix — its causeway ended 11 units above the base
     plaza with no way off and its nearest door 242 units away. */
  var rw = cw.solid ? (c.port ? 60 : rr(40,52)) : 0;
  var w  = cw.solid ? 0 : (c.port ? 22 : rr(13,18));
  var deckY = cw.solid ? RLAND+0.7 : CWAY+0.8;      /* the road/deck surface a walker is actually on */
  var arr = cantonArrivalLevel(c.n, deckY);
  if(arr){
    var abut = cw.solid ? rw*0.30 : w*0.85;         /* the FR8 abutment's own half-width */
    var dAng = bearingBeside(ry, abut + 8, squareEdgeHw(arr.hw, ry));
    var dHw  = squareEdgeHw(arr.hw, dAng);
    var dTier = CANTON_FACES[c.n].tiers[arr.tier];
    plinthDoor(c.x, c.z, dAng, arr.y, dHw, c.tone,
               { maxH: dTier ? Math.min(8, dTier.th - 2.4) : 7,
                 lean: dTier ? faceLean(dTier, dAng) : 0 });
    inspectClaim(c.x + Math.sin(dAng)*dHw, c.z + Math.cos(dAng)*dHw, 7, 5, dAng,
                 'cantonDoor', 'Canton door');
    if(arr.y > deckY + 1.2){
      /* a reclaimed mole: the apron's outer lip is a 2.7-unit step up off
         the road surface. A short flight beside the abutment, on the
         door's own bearing so it is still on the mole (half-width
         rw*0.47) and still clear of the block. */
      var uRun = Math.max(6, (arr.y-deckY)*1.9), uR = squareEdgeHw(arr.outer, dAng);
      var uA = loc(c.x,c.z, 0, uR, dAng), uB = loc(c.x,c.z, 0, uR+uRun, dAng);
      linkStair(uA[0],uA[1], arr.y, uB[0],uB[1], deckY, Math.min(22, abut*1.1));
      inspectClaim((uA[0]+uB[0])*0.5, (uA[1]+uB[1])*0.5, Math.min(22,abut*1.1)*0.5, uRun*0.5, dAng,
                   'cantonStair', 'Causeway stair');
    }else if(deckY > arr.y + 1.2){
      /* a bridge causeway (Ancestry, Port): the deck ends in the air above
         the apron — 11.8 units above it at Ancestry, with nothing under it
         and the nearest door 242 units round the far side of the canton.
         This is the flight off the end of it. On the causeway's OWN bearing
         (that is where the deck is); inward across the apron when there is
         room for a sane pitch, outward over the quay when there is not
         (Port: only 11 units of apron inboard of the deck end, but a 177-
         unit-radius working quay outboard of it). */
      var rEnd = c.r*0.96, want = Math.max(10, (deckY-arr.y)*1.9);
      var inMax = rEnd - (dHw + 5);                          /* room inboard, before the wall */
      var outMax = squareEdgeHw(arr.outer, ry) - 3 - rEnd;   /* room outboard, before the lip */
      var sgn = 1, dRun = want;
      if(inMax >= want) sgn = -1;
      else if(outMax >= want) sgn = 1;
      else if(outMax >= inMax) dRun = Math.max(8, outMax);
      else { sgn = -1; dRun = Math.max(8, inMax); }
      var vA = loc(c.x,c.z, 0, rEnd, ry);
      var vB = loc(c.x,c.z, 0, rEnd + sgn*dRun, ry);
      linkStair(vA[0],vA[1], deckY, vB[0],vB[1], arr.y, Math.min(24, abut*1.2));
      inspectClaim((vA[0]+vB[0])*0.5, (vA[1]+vB[1])*0.5, Math.min(24,abut*1.2)*0.5, dRun*0.5, ry,
                   'cantonStair', 'Causeway stair');
    }
    window._cantonCausewayDoors = window._cantonCausewayDoors || [];
    window._cantonCausewayDoors.push({canton:c.n, y:arr.y, hw:dHw, ang:dAng, deckY:deckY, top:!!arr.top});
  }

  if(cw.solid){
    /* reclaimed land: the canton flank ramps straight down to just above the
       waterline, then an earthen mole with revetted edges runs to the shore */
    /* the flank ramp keeps c.tone on purpose: it rises the canton's FULL
       height (top-RLAND+3 = ~44 units at the Fortress) hard against the
       tier stack, so it reads as part of the canton's own silhouette, not
       as roadway — recolouring it would put a gray-brown wedge up the side
       of a basalt canton. Everything from the waterline outward (the mole
       itself) takes cwTone. */
    FR8(ax, RLAND-3, az, rw*0.60, top-RLAND+3, rw*0.84, ry, shade(c.tone,0.02));
    reclaimedCauseway(ax, az, land[0], land[1], rw, cwTone);
    reserve(land[0], land[1], 30, 30, 0);
    return;
  }

  /* a ramp down the canton flank to causeway level */
  FR8(ax, CWAY-2, az, w*1.7, top-CWAY+3, w*2.4, ry, shade(c.tone,0.02));
  var landY = Math.max(CWAY-6, terrainH(land[0],land[1])+2.5);
  if(cw.isle){
    /* the causeway steps across an islet: a paved platform with a shrine post */
    var I = cw.isle, iy = terrainH(I[0],I[1]);
    BOX(I[0], iy-1, I[1], 46, CWAY-iy+1, 46, ry, shade(c.tone,-0.12));
    BOX(I[0], CWAY-0.3, I[1], 50, 1.6, 50, ry, shade(c.tone,-0.26));
    FR3(I[0]+12, CWAY+1.3, I[1]+12, 4, 12, 4, ry, shade(c.tone,0.05));
    span(ax,az,CWAY, I[0],I[1],CWAY, w, TONES[0], 4, true);
    span(I[0],I[1],CWAY, land[0],land[1], landY, w, TONES[0], 4, true);
  }else{
    span(ax,az,CWAY, land[0],land[1], landY, w, TONES[0], 5, true);   /* was a local 0xada186 literal — gray-brown palette now */
  }
  reserve(land[0], land[1], 30, 30, 0);
});
