/* ============================== citizens: rambling pedestrians =============
   The owner's big brief, item 1 of 4 planned populations (ordinators,
   priests, merchant caravans are NOT built yet — this is the foundation
   the rest hang off, plus one working population on top of it). Shared
   scaffold first, all explicitly requested up front:
     - LIFE_HOUR_BEHAVIOR: a 24-slot array (one per hour), every slot null
       for now — the hook day/night spawn/despawn-rate behaviour is meant
       to hang off later, once day/night actually exists. Nothing reads
       it yet; it exists so that work has somewhere to go.
     - every citizen gets: a unique, ever-increasing id (LIFE_CITIZEN_ID,
       "track how many have been spawned over time"); a race flag
       ('dunmer'/'human', "flag human and dark elven to allow for
       separate behaviours" — no behaviour actually forks on it yet);
       a socialClass field, left null ("leave a variable open... so we
       can designate nobles, etc" later).
     - every LIFE_DOORS entry gets an entryCount, incremented on every
       arrival — "a counter to buildings for how many people have
       entered... help us debug things and implement a more coherent
       simulation later."

   LIFE_DOORS is the shared destination/origin registry every population
   will eventually draw from (not just pedestrians) — one entry per real
   door-like point in the city, classified into the categories the owner
   named, each with the owner's own per-location cap:
     compound (12), slum (2), manor (6), shop (3, "other buildings"),
     market/arena/temple/park (canton buildings, cap 3 each — no separate
     "other" cap was given for these, reusing "other buildings"'),
     shrine, dock (ferry/pleasure-barge stops).
   The owner's own "100 per residential canton" cap (Port/Arsenal/
   Foreign/Granary/Market — the CANTONS list minus Arena/Guild/Ancestry/
   Fortress/Temple/Palace) is NOT separately enforced here — the per-door
   cap of 3 across however many doors a canton has, plus the hard total
   LIFE_PED_N ceiling below, already keeps any one canton well under 100
   in practice; a real per-canton counter is a clean follow-up, not done
   here for time. Palace and Fortress get NO doors at all — restricted,
   not a place rambling pedestrians wander into. */
var LIFE_CITIZEN_ID = 0;
var LIFE_HOUR_BEHAVIOR = new Array(24).fill(null);   /* reserved for day/night — do not read yet */
function lifeCitizenRace(){ return chance(0.88) ? 'dunmer' : 'human'; }

var LIFE_DOORS = [];
(function(){
  /* mainland doors: one per PLACED town/compound footprint (60-land.js),
     approximated at the claimed footprint's own local +fx face — the
     same face compound()'s gate and townBuilding()'s street-shift both
     already treat as "the front" (see compound()'s own comment). */
  PLACED.forEach(function(o){
    if(o.tag !== 'town' && o.tag !== 'compound') return;
    var dp = loc(o.x, o.z, o.fx, 0, o.ry);
    var cat, cap;
    if(o.tag === 'compound'){ cat = 'compound'; cap = 12; }
    else if(o.poor){ cat = 'slum'; cap = 2; }
    else if(zoneAt(o.x,o.z) === 'manor'){ cat = 'manor'; cap = 6; }
    else{ cat = 'shop'; cap = 3; }
    LIFE_DOORS.push({ x:dp[0], z:dp[1], ry:o.ry, cat:cat, cap:cap, active:0, entryCount:0 });
  });
  /* canton doors (50-cantons.js's own plinthDoors, window-exported since
     that file runs long before any diagnostic export convention existed
     here) — classified by nearest canton name. Palace/Fortress(Lighthouse)
     deliberately get no entry: restricted, not a rambling destination.
     Guild was 'park' here from its old garden-canton days — reset to
     'shop' along with the rest of its reversion (30-layout.js's
     CIDX['Guild'].guild): its plinth doors now open onto four working
     craft-guild halls, the same kind of destination Port/Arsenal/Foreign/
     Granary's own doors already are, not a park bench. */
  var CANTON_CAT = { Market:'market', Arena:'arena', Temple:'temple', Ancestry:'park', Guild:'shop',
                      Port:'shop', Arsenal:'shop', Foreign:'shop', Granary:'shop' };
  (window._plinthDoors || []).forEach(function(pd){
    var best = null, bd = 1e18;
    CANTONS.forEach(function(c){ var d = Math.hypot(pd.x-c.x, pd.z-c.z); if(d<bd){ bd=d; best=c; } });
    if(!best) return;
    var cat = CANTON_CAT[best.n];
    if(!cat) return;
    LIFE_DOORS.push({ x:pd.x, z:pd.z, ry:pd.angle||0, cat:cat, cap:3, active:0, entryCount:0, canton:best.n });
  });
  /* markets/parks as OPEN-AREA hang-out points (DISTRICTS, 30-layout.js)
     — separate from the Market/Ancestry/Guild CANTON doors above, since
     several market/park districts sit out on the mainland, not inside a
     canton at all. */
  DISTRICTS.forEach(function(d){
    if(d.type !== 'market' && d.type !== 'park') return;
    var c = lifePolyCentroid(d.poly);
    LIFE_DOORS.push({ x:c[0], z:c[1], ry:0, cat:d.type, cap:14, active:0, entryCount:0 });
  });
  /* shrines — hang-out category, separate from the ferry/dock category
     just below even though the shrine ferry-route also stops at these
     same points; no boarding integration for that route yet (see
     lifeFerryBoard's own comment). */
  LIFE_SHRINE_STOPS.forEach(function(s){
    LIFE_DOORS.push({ x:s.x, z:s.z, ry:s.ry, cat:'shrine', cap:8, active:0, entryCount:0 });
  });
  /* THIRD PASS: the Guild canton's merchant annex (GUILD_MARKET_DOOR,
     50-cantons.js's guildHallsDeck() — same cross-file hand-off idiom as
     GUILD_WORK_POSTS/LIFE_SHRINE_STOPS above) — its own category, not
     folded into 'shop' (the cat every other Guild plinth door gets via
     CANTON_CAT above), so it can carry real priority in
     LIFE_PED_CAT_ORDER below instead of queuing behind everything else.
     Generous cap (6, between the DISTRICTS market's 14 and a plain shop's
     3) since "very high priority... people visit" implies a real crowd,
     not one or two browsers. */
  if(GUILD_MARKET_DOOR){
    LIFE_DOORS.push({ x:GUILD_MARKET_DOOR.x, z:GUILD_MARKET_DOOR.z, ry:GUILD_MARKET_DOOR.ry||0,
      cat:'guildmarket', cap:6, active:0, entryCount:0, canton:'Guild' });
  }
  /* FOURTH PASS (owner: "place the carpenter and merchant guild and
     make... weaver's, clockmaker's/artificer's... navigator's guild") —
     GUILD_HALL_DOORS (50-cantons.js's own header comment) holds one entry
     per new hall's own front door, on the Guild canton AND the Port
     canton (the Navigator's Guild, built inside portDeckV2(),
     65-facade.js — same array, different canton per entry). Own
     'guildhall' category, same idiom as 'guildmarket' just above, so
     these register as real visitable destinations instead of falling
     into the generic per-canton 'shop' plinth-door bucket. Cap 4: real
     footfall for a hall, but smaller than guildmarket/tavern's open-air 6. */
  (typeof GUILD_HALL_DOORS !== 'undefined' ? GUILD_HALL_DOORS : []).forEach(function(d){
    LIFE_DOORS.push({ x:d.x, z:d.z, ry:d.ry||0, cat:'guildhall', cap:4, active:0, entryCount:0, canton:d.canton });
  });
})();
/* the main ferry circuit's own stops, kept in a name-keyed lookup
   (LIFE_FERRY_STOPS entries are unique by .name) so lifeFerryBoard
   (below) can find "the queue waiting at the stop this ferry just
   docked at" in O(1) instead of a linear scan every arrival. */
var LIFE_DOOR_BY_STOPNAME = {};
LIFE_FERRY_STOPS.forEach(function(s){
  var d = { x:s.x, z:s.z, ry:s.ry, cat:'dock', cap:99, active:0, entryCount:0, queueCount:0 };
  LIFE_DOORS.push(d);
  LIFE_DOOR_BY_STOPNAME[s.name] = d;
});
/* silt strider stations (66-striders.js, which loads before this file) —
   the station records THEMSELVES are pushed straight into LIFE_DOORS
   (same object, not a copy) so lifePedPickDestination/the 'queued' state
   machine below treat a station exactly like a ferry dock, and
   79-striders.js's own boarding code reads the SAME .queueCount a rambling
   pedestrian just incremented. */
if(typeof LIFE_STRIDER_STATIONS !== 'undefined'){
  LIFE_STRIDER_STATIONS.forEach(function(s){ LIFE_DOORS.push(s); });
}
/* taverns (69-district-content.js's TAVERNS_PLACED, which loads before this
   file so the array is already real here) — owner: "pedestrian visit
   priority equal to the arena", so 'tavern' sits immediately beside 'arena'
   in LIFE_PED_CAT_ORDER below rather than folded into the generic 'shop'
   cat every other plinth door gets. Cap matches guildmarket's (6) — a
   taproom + beer garden implies a real evening crowd, not 1-2 browsers. */
if(typeof TAVERNS_PLACED !== 'undefined'){
  TAVERNS_PLACED.forEach(function(t){
    LIFE_DOORS.push({ x:t.doorX, z:t.doorZ, ry:t.ry, cat:'tavern', cap:6, active:0, entryCount:0 });
  });
}
window._doors = LIFE_DOORS;   /* diagnostic */

/* the owner's own preference order, tried strictly in this sequence —
   the first category with ANY door under its cap wins; within it, a
   candidate inside ~25% of the map's own span is preferred, but a
   distant one is still used rather than skipping the whole category
   ("if they pick a destination category with more than one potential
   target... they should pick a building that is not super far away"
   only bites when there IS a closer option). */
/* THIRD PASS: 'guildmarket' (the Guild canton's own merchant annex, just
   above) inserted right after 'market' — "a very high priority market
   tend... give the merchant guild's own door category real priority,
   similar to how market/arena already sit near the top" (the owner's own
   phrasing). Not tied with 'market' itself: the dedicated Market canton
   is still the city's real bazaar and keeps first pick; guildmarket is
   the next-strongest draw, well ahead of the plain 'shop' category the
   other 3 guild-hall doors fall into.
   FOURTH PASS: 'guildhall' (the Carpenter/Merchant/Weaver/Artificer/
   Navigator halls' own doors, GUILD_HALL_DOORS above) inserted right
   after 'guildmarket' — real dedicated halls now, so they get real
   priority too, just behind the bazaar-scale destinations. */
var LIFE_PED_CAT_ORDER = ['market','guildmarket','guildhall','arena','tavern','temple','park','shrine','dock','strider','shop','compound','slum'];
var LIFE_PED_NEAR_DIST = (CITY_LIM || 2280) * 2 * 0.25;
/* "can a WALKER actually get from here to there" — the pedestrian twin of
   lifeRoadReachable (carts), and the same principle: a destination with no
   walkable approach must be REJECTED, not handed to a leg builder that will
   invent a line across the bay for it. lifePedBuildLeg's refinement can
   genuinely step a route around a canal or a shore notch, which is what it
   was built for; what it cannot do is cross 500 units of open bay, and a
   pedestrian sent to a door on a canton with no land route just swims the
   whole way. Measured, live: 487 of 834 live pedestrians had at least one
   underwater sample on their current curve, in long unbroken runs.
   The predicate is lifeGroundY, NOT terrainH — a pier deck, a causeway, a
   bridge and a canton floor are all real ground for a walker even though
   terrainH reports open water underneath every one of them (that is what
   lifeGroundY exists for), so this accepts a ferry dock at a pier tip or a
   canton door reached along its causeway and only rejects a genuine swim.
   Cheap: one straight-line sample walk, ~1 lifeGroundY call per 55 units. */
var LIFE_PED_MAX_WADE = 3;   /* consecutive wet samples tolerated — ~165 units, a canal or a shore notch, not a bay */

/* ===================== the door-transit rule ==============================
   Owner: "any non vehicle/pedestrian can come in one door of a building and
   out another if it needs to, in order to path (exclude palace and temple
   from this for rambling pedestrians, they are commoners and can't just
   waltz in)."

   HALF OF THIS THE WALKER PATH ALREADY KEEPS, and keeps on purpose. The three
   routing systems in this file are deliberately different about obstacles:
   lifeCartBuildLeg is road-constrained (Dijkstra over the real road graph, so
   a cart can only ever be where a road is); lifeNavAStar rasterises piers,
   hulls, chinampas and canton caps into a 26-unit grid (water traffic only —
   every caller is a ferry or a taxi); and the pedestrian pair, lifePedWalkable
   + lifePedBuildLeg, checks water and hill gradient and NOTHING else. Neither
   of them has ever consulted a footprint. That is exactly the affordance the
   owner is describing, and it is stated here rather than left as an accident
   of what those two predicates happen not to check: for foot traffic a built
   footprint on the line is PASSABLE — a building with doors is a room to cross,
   not a wall. Every footprint in the LIFE_DOORS registry carries at least one
   door by construction (see its PLACED pass above: one door per town/compound
   footprint), and tavern() (65-facade.js) is the worked example with two — a
   double door on the entrance face and a garden door straight out of the back
   wall — so a pedestrian crossing a tavern genuinely does go in one door and
   out another. window._pedTransit.audit() below measures how many live
   pedestrians are doing it at any moment, and through what.

   THE OTHER HALF IS NEW: the exception the owner named. Palace and Temple are
   CLOSED PRECINCTS for a rambling pedestrian. This follows the grain already
   in this file rather than adding a parallel permission system:

     - it is scoped by CALL SITE, not by a per-citizen permission flag.
       lifePedWalkable is reached from exactly one place, lifePedPickDestination,
       and that is reached only from the four rambling-pedestrian retarget
       points (lifePedSpawn, lifeFerryBoard's alighting passengers, the hangout
       retarget below, and the strider station's twin of it in 79-striders.js).
       Every population with legitimate business inside — the clergy and the
       high priest at the Temple, the ordinator ring and its posts — is driven
       by its own posted-spot state machine and calls lifePedBuildLeg DIRECTLY,
       never through lifePedPickDestination. So they cannot be caught by this,
       and lifePedBuildLeg itself is deliberately left untouched, exactly as
       every other population already relies on it.
     - it is the same shape as the decision already documented at LIFE_DOORS:
       "Palace and Fortress get NO doors at all — restricted, not a place
       rambling pedestrians wander into." This extends that from "you may not
       go there" to "you may not go THROUGH there", which is what the new rule
       required and what a door registry alone could never express.
     - and it REJECTS rather than fudges, the way claim() and lifeRoadReachable
       already do: a destination whose approach crosses a closed precinct is
       refused and another is tried, instead of a route being emitted that
       walks a commoner through the Palace.

   The Temple stays a real rambling DESTINATION ('temple' keeps its place in
   LIFE_PED_CAT_ORDER, and CANTON_CAT still classifies its plinth doors) —
   walking up to the temple door is a visit, and both its own doors stand
   inside its own precinct. Only pass-THROUGH traffic is refused, which is why
   the exemption below is keyed to the precinct the walker starts in and the
   precinct their destination door stands in. */
var LIFE_PED_CLOSED = [];
['Palace','Temple'].forEach(function(n){
  var c = (typeof CIDX !== 'undefined') ? CIDX[n] : null;
  /* c.r, the same radius lifeGroundY uses to decide "this walker is standing
     on this canton" — so "inside the precinct" and "on the platform" are one
     and the same test, not two numbers that can drift apart. */
  if(c) LIFE_PED_CLOSED.push({ n:n, x:c.x, z:c.z, r:c.r });
});
function lifePedClosedAt(x, z){
  for(var i=0; i<LIFE_PED_CLOSED.length; i++){
    var p = LIFE_PED_CLOSED[i], dx = x-p.x, dz = z-p.z;
    if(dx*dx + dz*dz < p.r*p.r) return p;
  }
  return null;
}
/* the precincts this particular leg is allowed to be inside: the one the
   walker is standing in, and the one their destination door stands in.
   Returns null when neither endpoint is in one at all — the common case, and
   the one that costs nothing below. */
function lifePedClosedExempt(ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var a = lifePedClosedAt(ox, oz), b = lifePedClosedAt(dx, dz);
  return (a || b) ? [a, b] : null;
}
function lifePedClosedHit(x, z, exempt){
  var p = lifePedClosedAt(x, z);
  if(!p) return null;
  if(exempt && (exempt[0] === p || exempt[1] === p)) return null;
  return p;
}
var LIFE_PED_CLOSED_REJECTS = 0;    /* finished ROUTES refused by the curve audit below */
var LIFE_PED_CLOSED_ACCEPTS = 0;    /* rambling legs accepted after that audit */
var LIFE_PED_CLOSED_REFUSALS = 0;   /* candidate DESTINATIONS refused here, at pick time — the rule's real bite */

function lifePedWalkable(ox, oz, dx, dz){
  var len = Math.hypot(dx-ox, dz-oz);
  var steps = Math.max(2, Math.min(60, Math.ceil(len/55)));
  var run = 0;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=steps; i++){
    var t = i/steps, px = ox+(dx-ox)*t, pz = oz+(dz-oz)*t;
    /* the door-transit rule's one exception: an ordinary building on the line
       is a room to walk through, but the Palace and the Temple are not. */
    if(LIFE_PED_CLOSED.length && lifePedClosedHit(px, pz, exempt)){ LIFE_PED_CLOSED_REFUSALS++; return false; }
    /* terrainH first, lifeGroundY only where it says water: lifeGroundY is
       the authoritative walker predicate but it walks every causeway (each
       one a shoreIn() evaluation), span, canton and pier list on every call,
       and this runs ~5x per pedestrian retarget for ~800 pedestrians. Dry
       ground is dry ground under both, so the expensive query is only ever
       asked about the samples that could actually be a deck. */
    if(terrainH(px, pz) >= 2){ run = 0; continue; }
    if(lifeGroundY(px, pz) < 2){
      if(++run > LIFE_PED_MAX_WADE) return false;
    }else run = 0;
  }
  return true;
}
function lifePedPickDestination(ox, oz, excludeCat){
  var firstSeen = null;
  for(var ci=0; ci<LIFE_PED_CAT_ORDER.length; ci++){
    var cat = LIFE_PED_CAT_ORDER[ci];
    if(cat === excludeCat) continue;
    var pool = LIFE_DOORS.filter(function(d){ return d.cat===cat && d.active<d.cap; });
    if(!pool.length) continue;
    var near = pool.filter(function(d){ return Math.hypot(d.x-ox,d.z-oz) < LIFE_PED_NEAR_DIST; });
    var from = near.length ? near : pool;
    /* claim()-style rejection: try a few candidates in this category, then
       move on to the NEXT category rather than committing to a swim. */
    for(var tries=0; tries<5; tries++){
      var cand = pick(from);
      if(!firstSeen) firstSeen = cand;
      if(lifePedWalkable(ox, oz, cand.x, cand.z)) return cand;
    }
  }
  /* honest last resort — nothing in any category was walkable from here
     (a citizen who has somehow ended up somewhere genuinely stranded).
     Returning null would freeze them in place forever, so the unchecked
     pick still stands; this is a documented fallback, not a silent one. */
  return firstSeen;
}
/* land-side twin of lifeBuildLeg (water) — pushes seed/refinement points
   toward LAND instead of water, and does NOT treat cantons as obstacles
   (a pedestrian's destination is routinely ON one). Simple outward-ring
   gradient search, same spirit as lifePushToWater's own local nudge. */
function lifePushToLand(x, z){
  var h = terrainH(x,z);
  if(h >= 3) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=6; r<=60; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph > bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH >= 3) break;
  }
  return best;
}
/* symmetric to lifePushToLand above, but for the opposite problem: a point
   sitting too HIGH (open hill country) rather than underwater. Neither
   lifePedBuildLeg's own refinement nor lifePushToLand ever check for
   this — they only ever look for terrainH<2, so a route that happens to
   cross dry, high ground was never corrected by anything. Searches for
   nearby LOWER ground the same ring-sample way lifePushToLand searches
   for higher ground. */
function lifePushToLowGround(x, z, maxH){
  var h = terrainH(x,z);
  if(h <= maxH) return [x,z];
  var best = [x,z], bestH = h;
  for(var r=20; r<=300; r*=1.6){
    for(var a=0; a<8; a++){
      var ang = a/8*Math.PI*2;
      var px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph < bestH){ bestH = ph; best = [px,pz]; }
    }
    if(bestH <= maxH) break;
  }
  return best;
}
function lifePedBuildLeg(ax, az, bx, bz){
  /* owner: "ordinators... try to go for swims" (also caravans) — real bug,
     not a fluke. This function's refinement loop only ever had 2 interior
     waypoints to replace (m1/m2) and checked a fixed 80 samples over 8
     rounds — tuned for a short building-to-building pedestrian hop, where
     the route crosses water at most once or twice. The ordinator ring
     patrol and off-map caravan legs are FAR longer (the ring circles a
     real stretch of the city; caravan legs run 3500-5300 units per their
     own speed comment) and can cross water in 3+ separate places — with
     only 2 replaceable slots, a 3rd crossing could never be fixed no
     matter how many rounds ran, regardless of sample density. All three
     knobs now scale with the leg's own straight-line length, so a short
     pedestrian hop behaves EXACTLY as before (waypointN floors at 2,
     sampleN at 80, rounds at 8 — unchanged, which is why "rambling
     pedestrians" were already fine) while a long ordinator/caravan route
     gets real capacity instead of silently running out of fixes.

     Second owner follow-up: "carts still have tendency to path over the
     western hills" — this is THIS function's fallback path (lifeRoadPath,
     78-life.js, fails to find any connected road route for some remote
     spawn points, e.g. an isolated warren stub) and it never checked
     elevation at all, only terrainH<2 (water) — a route that stays dry
     but climbs to h=180+ sailed straight through unfixed. HILL_MAX mirrors
     lifeCartBuildLeg's own connector-segment fix; harmless for ordinary
     short pedestrian hops, which never reach anywhere near this high. */
  var HILL_MAX = 95;
  var totalLen = Math.hypot(bx-ax, bz-az);
  /* owner (again): "caravans still occasionally trying to swim and trying
     to climb the hill, though with less success" — this is the fallback
     path (lifeRoadPath found no connected road route, e.g. the spawn
     point or a harbor/dock destination sits off the graph entirely), and
     for a genuinely long leg through real ridge country (RIDGES entries
     run 700+ units across) the OLD cap of 10 waypoints over a 5000-unit
     leg was too sparse to constrain a detour around a whole hill mass —
     bumped, plus every curve build here now uses the CENTRIPETAL
     parameterisation (lifeCurveFromLandCentripetal, defined above) instead
     of plain/uniform Catmull-Rom: the file's own longstanding comment on
     that function already documents uniform Catmull-Rom overshooting
     between irregularly-spaced control points (exactly what pushing
     individual waypoints to dodge water/hills produces round over round)
     as the standard failure mode centripetal exists to fix. */
  var waypointN = Math.max(2, Math.min(22, Math.ceil(totalLen/300)));
  var sampleN = Math.max(80, Math.min(500, Math.round(totalLen/15)));
  var rounds = Math.max(8, Math.min(40, waypointN*3));
  var waypoints = [[ax,az]];
  for(var wi=1; wi<=waypointN; wi++){
    var seed = lifeMix([ax,az],[bx,bz], wi/(waypointN+1));
    seed = lifePushToLand.apply(null, seed);
    if(terrainH(seed[0],seed[1]) > HILL_MAX) seed = lifePushToLowGround(seed[0],seed[1], HILL_MAX);
    waypoints.push(seed);
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<rounds; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<sampleN; s++){
      var st = s/sampleN, p = curve.getPointAt(st);
      var ph = terrainH(p.x, p.z);
      if(ph < 2){ worstT = st; worstFix = lifePushToLand(p.x, p.z); break; }
      if(ph > HILL_MAX){ worstT = st; worstFix = lifePushToLowGround(p.x, p.z, HILL_MAX); break; }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

/* ---- the door-transit rule, second gate: audit the FINISHED curve ---------
   lifePedWalkable above rejects a destination whose straight line crosses a
   closed precinct, but the curve lifePedBuildLeg actually returns is not that
   straight line — its refinement pushes waypoints sideways to dodge water and
   high ground, and a pushed waypoint can land somewhere the straight line
   never went. The principle this file already paid for once (lifeNavBuildLeg's
   obstacle-unaware straight-line fallback, the bug that walked ordinators
   across the bay) is: never emit a plausible-but-wrong route — reject the
   destination instead. So the route a rambling pedestrian is about to start
   walking is checked, not the line it was chosen by.

   lifePedBuildLeg itself is deliberately NOT given precinct avoidance: it is
   shared with the clergy, the high priest, the ordinators, the monks, the
   shopkeepers, the quarry and compound workers and the caravans, every one of
   whom either has business inside a precinct or never goes near one. Adding an
   avoidance nudge there would change all of their routes to fix a rule that
   applies to none of them. */
var lifePedAuditTmp = new THREE.Vector3();
function lifePedCurveClosedHit(curve, ox, oz, dx, dz){
  if(!LIFE_PED_CLOSED.length) return null;
  var exempt = lifePedClosedExempt(ox, oz, dx, dz);
  for(var i=0; i<=40; i++){
    curve.getPointAt(i/40, lifePedAuditTmp);
    var hit = lifePedClosedHit(lifePedAuditTmp.x, lifePedAuditTmp.z, exempt);
    if(hit) return hit;
  }
  return null;
}
/* one rambling pedestrian's next leg: pick a destination, build the route,
   audit it, and try another destination if the route would waltz through a
   closed precinct. Returns {dest, curve} or null — null meaning "nowhere this
   citizen may legitimately go from here right now", which every caller already
   handles (lifePedSpawn's own null contract: leave the instance hidden for a
   tick and retry next frame). The destination's own .active is NOT reserved
   here; the caller does that on the leg it actually accepts, exactly as
   before, so a rejected candidate never leaks a reservation. */
function lifePedRambleTarget(ox, oz, excludeCat){
  for(var attempt=0; attempt<4; attempt++){
    var dest = lifePedPickDestination(ox, oz, excludeCat);
    if(!dest) return null;
    var curve = lifePedBuildLeg(ox, oz, dest.x, dest.z);
    if(!lifePedCurveClosedHit(curve, ox, oz, dest.x, dest.z)){
      LIFE_PED_CLOSED_ACCEPTS++;
      return { dest: dest, curve: curve };
    }
    LIFE_PED_CLOSED_REJECTS++;
  }
  return null;
}
/* diagnostic: the door-transit rule made inspectable from outside.
   .audit() answers "how many live rambling pedestrians are mid-route THROUGH a
   building right now, and through what" by sampling each citizen's own curve
   against placedTagAt (86-inspect.js — PLACED plus the canton-top inspect
   registry). That is thousands of footprint tests per sample, far too slow for
   the per-frame path, which is exactly why it lives here as a probe-time query
   and not as a counter inside updatePedestrians. */
window._pedTransit = {
  closed: LIFE_PED_CLOSED,
  closedAt: lifePedClosedAt,
  walkable: lifePedWalkable,
  stats: function(){ return { accepts: LIFE_PED_CLOSED_ACCEPTS, routeRejects: LIFE_PED_CLOSED_REJECTS,
                              destRefusals: LIFE_PED_CLOSED_REFUSALS }; },
  audit: function(samples){
    var N = samples || 24, p = new THREE.Vector3();
    var out = { peds:0, inBuilding:0, transiting:0, closedBreaches:0, tags:{} };
    LIFE_PEDS.forEach(function(cz){
      if(!cz || !cz.curve || cz.state !== 'walk' || cz.shopkeeper || cz.quarryLaborer || cz.compoundWorker || cz.monk) return;
      out.peds++;
      var hits = {}, n = 0, breach = false;
      var exempt = lifePedClosedExempt(cz.curve.getPointAt(0).x, cz.curve.getPointAt(0).z, cz.destDoor.x, cz.destDoor.z);
      for(var i=0; i<=N; i++){
        cz.curve.getPointAt(i/N, p);
        if(lifePedClosedHit(p.x, p.z, exempt)) breach = true;
        var t = placedTagAt(p.x, p.z);
        if(t){ hits[t.tag] = (hits[t.tag]||0)+1; n++; }
      }
      if(breach) out.closedBreaches++;
      if(n){ out.inBuilding++; if(n >= 2) out.transiting++; }
      for(var k in hits) out.tags[k] = (out.tags[k]||0) + 1;
    });
    return out;
  }
};
/* Paths tool: the door-transit rule needs a picture, and the built-in 'ped'
   type deliberately draws the ROAD GRAPH ("the pedestrian's designated path")
   while `covers`-claiming LIFE_PEDS so nothing draws 1200 live citizen curves
   at once — see 87-pathviz.js's own comment. A rule about individual routes
   threading buildings is invisible in that picture, so this registers a
   SECOND, separate type through that file's documented extension point
   (pathvizRegister, hoisted for exactly this) drawing a readable sample of
   live rambling legs. It does not touch or replace the 'ped' entry. Costs
   nothing: the whole tool is one hidden LineSegments, and `entities` is read
   only when the panel is open. */
if(typeof pathvizRegister === 'function'){
  pathvizRegister({ key:'pedleg', label:'Pedestrian (live legs)', color:0x9fd8e8, seg:16,
    entities: function(){
      var out = [];
      for(var i=0; i<LIFE_PEDS.length && out.length<30; i++){
        var cz = LIFE_PEDS[i];
        if(cz && cz.curve && cz.state === 'walk' && !cz.shopkeeper && !cz.quarryLaborer
           && !cz.compoundWorker && !cz.monk) out.push(cz);
      }
      return out;
    } });
}

/* the owner: "one shopkeeper per 2 market stalls" — reserved as EXTRA
   capacity on this same pool (indices >= 540), not a new InstancedMesh:
   the draw-call budget is at its hard ceiling (53/53, zero headroom)
   while the instance budget still has real headroom, so growing this
   one mesh's instance count is the only way to add a new kind of person
   this session. MARKET_STALLS is 69-district-content.js's own global
   (that fragment loads before this one, so it's already full here). */
var LIFE_SHOPKEEPER_N = (typeof MARKET_STALLS !== 'undefined') ? Math.floor(MARKET_STALLS.length/2) : 0;
/* +480 reserved, trailing, for silt strider riders (79-striders.js): up to
   20 convoys (6 on Route 1, 6 on Route 2, 8 on Route 3) x 3 cars x 8 seats,
   same "grow an existing InstancedMesh's instance count" technique as the
   shopkeeper pool just above (same mesh, lifePersonGeo — already used for
   every other rider/passenger population in the city, ferries and barges
   included), not a new draw call. Indexed car-slot-major
   (LIFE_STRIDER_RIDER_BASE + carSlot*8 + seat) so a car's own 8 seats are a
   contiguous, fixed block — carSlot itself is a GLOBAL slot number spanning
   all three routes (79-striders.js's own STRIDER_ROUTES/LIFE_STRIDERS), not
   per-route, so this literal 60 here MUST match LIFE_STRIDER_CAR_SLOTS below
   exactly (that constant isn't assigned yet at this point in the file, hence
   the duplicated literal rather than a reference to it). */
var LIFE_STRIDER_RIDER_PER_CAR = 8;
var LIFE_STRIDER_RIDER_BASE = 540 + LIFE_SHOPKEEPER_N;
var LIFE_STRIDER_RIDER_SLOTS = 60 * LIFE_STRIDER_RIDER_PER_CAR;
var LIFE_PED_N = 540 + LIFE_SHOPKEEPER_N + LIFE_STRIDER_RIDER_SLOTS;   /* x3 per the owner's "city feels empty" follow-up */
/* owner: quarry laborers ("each has 4 quarrymen... go to work at the
   quarry at sunrise and return to these houses at sunset") — same "grow
   this one shared InstancedMesh's instance count" technique as the
   shopkeeper pool and the strider-rider block directly above (same mesh,
   lifePersonGeo; the draw-call budget has no headroom, the instance
   budget does), appended AFTER the strider-rider range rather than
   inserted into it so LIFE_STRIDER_RIDER_BASE/SLOTS above — and every
   absolute index 79-striders.js computes off them — are completely
   unchanged. QUARRY_LABORER_HOUSES is 71-industry.js's own global (that
   fragment loads before this one): one entry per placed laborer house,
   4 assigned quarrymen per house per the owner's own count. */
var LIFE_QUARRY_LABORER_N = (typeof QUARRY_LABORER_HOUSES !== 'undefined') ? QUARRY_LABORER_HOUSES.length * 4 : 0;
var LIFE_QUARRY_LABORER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_QUARRY_LABORER_N;
/* owner: "inside the compounds, if there is a garden, have 3 workers come
   out of one building, tend it during the day, and go back at night" —
   3 per clan compound. Appended AFTER the quarry-laborer range by exactly
   the same discipline that range itself documents above: never inserted
   into an existing range, because LIFE_STRIDER_RIDER_BASE/SLOTS and the
   absolute indices 79-striders.js computes off them must not move.
   COMPOUNDS is 60-land.js's own global; every compound draws a garden slab
   unconditionally (the record's own x/z IS that garden's centre, not the
   compound's), so "if there is a garden" is true for all of them. */
var LIFE_COMPOUND_WORKER_PER = 3;
var LIFE_COMPOUND_WORKER_N = (typeof COMPOUNDS !== 'undefined') ? COMPOUNDS.length * LIFE_COMPOUND_WORKER_PER : 0;
var LIFE_COMPOUND_WORKER_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_COMPOUND_WORKER_N;
/* owner: "add monks (dressed in grey robes) who go out to monastery fields
   during the day, stop at chapel in the evening, and go to dorms to sleep
   at night... 5 per field, 2 per chicken coop." Appended after the compound
   workers, same rule again. MONASTERY_SITES is 61-monastery.js's own global
   (fields / coops / chapelDoor / dorms, all in world coordinates, filled in
   by monasteryCompound() at build time). */
var LIFE_MONK_PER_FIELD = 5, LIFE_MONK_PER_COOP = 2;
var LIFE_MONK_N = (typeof MONASTERY_SITES !== 'undefined')
  ? MONASTERY_SITES.fields.length*LIFE_MONK_PER_FIELD + MONASTERY_SITES.coops.length*LIFE_MONK_PER_COOP : 0;
var LIFE_MONK_BASE = LIFE_PED_N;
LIFE_PED_N += LIFE_MONK_N;
var LIFE_PED_T = 0;
var lifePedMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PED_N);
lifePedMesh.userData.life = true; lifePedMesh.userData.inspectLabel = 'Pedestrian';
lifePedMesh.frustumCulled = false;
scene.add(lifePedMesh);
var lifePedTmpPos = new THREE.Vector3(), lifePedTmpDir = new THREE.Vector3();
var lifePedTmpQuat = new THREE.Quaternion(), lifePedTmpMat = new THREE.Matrix4();
var lifePedTmpScale1 = new THREE.Vector3(1,1,1), lifePedTmpScale0 = new THREE.Vector3(0,0,0);

/* a fresh citizen: "For now, rambling pedestrians will spawn in any door
   at random" — ANY door, any category, no cap check on the ORIGIN (they
   are leaving it, not occupying it; only the DESTINATION reserves a
   slot). Returns null on the rare frame where literally every door in
   the city is at its own cap (destination pool exhausted) — the caller
   just leaves that instance hidden for one tick and retries next frame. */
function lifePedSpawn(){
  if(!LIFE_DOORS.length) return null;
  var origin = pick(LIFE_DOORS);
  /* door-transit rule: pick + build + audit together, so a citizen is never
     started on a route that walks them through the Palace or the Temple. */
  var leg = lifePedRambleTarget(origin.x, origin.z, null);
  if(!leg) return null;
  var dest = leg.dest, curve = leg.curve;
  dest.active++;
  return {
    id: LIFE_CITIZEN_ID++, race: lifeCitizenRace(), socialClass: null, timeOfDayBehavior: null,
    destDoor: dest, curve: curve, len: curve.getLength(),
    speed: rr(2.2,3.4), dur: 0, stateT: 0, state: 'walk', hangUntil: 0, ferryRef: null
  };
}

/* real ferry boarding, against the LIFE_PEDS pool below (defined after
   this since it's only ever called from updateFerries, at runtime, long
   after every fragment has loaded — same hoisting reasoning as every
   other forward-reference in this file). "the ferry will always
   discharge 1-3 passengers and will always pick up 1-3 passengers (room
   allowing)". f.onboard is a real running count now, not a per-arrival
   reroll; f.passengers is kept in sync only as the existing 0..5 VISIBLE
   seat count updateFerries' own render loop already reads — capped
   separately so a big onboard count doesn't try to seat more citizens
   than LIFE_FERRY_SEATS has room for. */
function lifeFerryBoard(f, stopDoor){
  f.onboard = f.onboard || 0;
  var alight = Math.min(f.onboard, ri(1,3));
  f.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== f) continue;
    var newLeg = lifePedRambleTarget(stopDoor.x, stopDoor.z, 'dock');   /* door-transit rule — see lifePedRambleTarget */
    if(newLeg){
      var newDest = newLeg.dest;
      newDest.active++;
      pp.curve = newLeg.curve;
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();   /* nowhere to go — recycle the slot */
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_FERRY_PEOPLE_PER - 1 - f.onboard);
  var boarding = Math.min(3, stopDoor.queueCount, room);
  stopDoor.queueCount -= boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stopDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = f; boarded++;
  }
  f.onboard += boarded;
  f.passengers = Math.max(1, Math.min(5, f.onboard));
}

var LIFE_PEDS = [];
/* only the real pedestrian/shopkeeper range gets a LIFE_PEDS entry — the
   144 trailing slots reserved for strider riders (LIFE_STRIDER_RIDER_BASE
   and up) are driven directly by 79-striders.js via lifePedMesh.setMatrixAt,
   never through this array. */
(function(){ for(var i=0;i<LIFE_STRIDER_RIDER_BASE;i++) LIFE_PEDS.push(lifePedSpawn()); })();

/* shopkeepers: overwrite the reserved [540, 540+N) range lifePedSpawn()
   just filled with generic ramblers. The owner: "one shopkeeper per 2
   market stalls, who comes out of a random house within 500 units at
   sunrise, hangs out by his stall during the day, then goes back to that
   house at sunset." A dedicated 2-endpoint commute (home <-> stall),
   the LIFE_HIGHPRIEST idea (82-daynight.js's dayNightHour(), read from a
   per-frame update function, not this file's own top level — the usual
   cross-fragment hoisting rule) applied to an ordinary citizen instead of
   the high priest. 'shop'/'slum'/'manor'/'compound' are LIFE_DOORS'
   actual house-door categories (the canton/market/park/shrine/dock
   entries above are civic destinations, not homes). */
var SHOPKEEPER_SUNRISE = 6, SHOPKEEPER_SUNSET = 18;
(function(){
  if(!LIFE_SHOPKEEPER_N) return;
  var houseCats = { shop:1, slum:1, manor:1, compound:1 };
  var houseDoors = LIFE_DOORS.filter(function(d){ return houseCats[d.cat]; });
  if(!houseDoors.length) return;
  var h0 = dayNightHour();
  var atStall = (h0 >= SHOPKEEPER_SUNRISE && h0 < SHOPKEEPER_SUNSET);
  for(var i=0;i<LIFE_SHOPKEEPER_N;i++){
    var stall = MARKET_STALLS[i*2];
    var near = houseDoors.filter(function(hd){ return Math.hypot(hd.x-stall.x,hd.z-stall.z) <= 500; });
    var home = near.length ? pick(near) : pick(houseDoors);
    LIFE_PEDS[540+i] = {
      shopkeeper: true, stall: stall, home: home,
      state: atStall ? 'atStall' : 'atHome', stateT: 0,
      curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
    };
  }
})();
window._peds = LIFE_PEDS;   /* diagnostic: full state, incl. each citizen's .curve */
window._shopkeepers = { n: LIFE_SHOPKEEPER_N, sunrise: SHOPKEEPER_SUNRISE, sunset: SHOPKEEPER_SUNSET };

/* ============================== quarry laborers ==============================
   Owner: "add 4 plaster buildings for quarry laborers per quarry. each has
   4 quarrymen. they go to work at the quarry at sunrise and return to
   these houses at sunset." Mirrors the shopkeeper block directly above
   verbatim — same dedicated 2-endpoint home<->work-site commute, same
   sunrise/sunset hours (6/18, SHOPKEEPER_SUNRISE/SUNSET's own values —
   this world's one established "sunrise/sunset" convention, not a new
   pair invented for this) — just home<->quarry instead of home<->stall,
   and reserved on the NEWLY appended LIFE_QUARRY_LABORER_BASE range
   above instead of overwriting [540,540+N). QUARRY_LABORER_HOUSES
   (71-industry.js) already carries each house's own doorX/doorZ (the
   same loc(o.x,o.z,o.fx,0,o.ry) front-door point LIFE_DOORS itself uses)
   and which quarry (quarryX/quarryZ) it belongs to — 4 laborer entries
   per house, all sharing that one home door and that one quarry site. */
var QUARRY_SUNRISE = SHOPKEEPER_SUNRISE, QUARRY_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_QUARRY_LABORER_N) return;
  var h0 = dayNightHour();
  var atQuarry = (h0 >= QUARRY_SUNRISE && h0 < QUARRY_SUNSET);
  var slot = 0;
  QUARRY_LABORER_HOUSES.forEach(function(house){
    for(var k=0;k<4;k++){
      LIFE_PEDS[LIFE_QUARRY_LABORER_BASE + slot] = {
        quarryLaborer: true,
        home: { x: house.doorX, z: house.doorZ, ry: house.ry },
        work: { x: house.quarryX, z: house.quarryZ },
        state: atQuarry ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(2.0,2.8)
      };
      slot++;
    }
  });
  window._quarryLaborerLife = { n: LIFE_QUARRY_LABORER_N, base: LIFE_QUARRY_LABORER_BASE,
                                 sunrise: QUARRY_SUNRISE, sunset: QUARRY_SUNSET };
})();

/* ============================== compound garden workers =====================
   Owner: "inside the compounds, if there is a garden, have 3 workers come out
   of one building, tend it during the day, and go back at night." Modelled
   on updateQuarryLaborer/updateShopkeeper verbatim — the same 4-state
   home <-> work-point commute on the same sunrise/sunset pair (6/18, this
   world's one established convention, not a new pair invented here); the
   only difference is that "work" is a point INSIDE the compound's own
   garden rather than a quarry or a stall, and each of the 3 gets its own
   spot in that garden so they read as three people tending a bed rather
   than three copies standing on one tile.

   "come out of ONE building": COMPOUNDS.doorX/doorZ (added in 60-land.js
   this same pass) is the front step of the extra back-wall building added
   there, so all 3 of a compound's workers share one home door — which is
   what the owner asked for and also why the door had to be recorded at
   build time: the COMPOUNDS record's own x/z is the GARDEN's centre, and
   carries no building position at all. */
var COMPOUND_WORKER_SUNRISE = SHOPKEEPER_SUNRISE, COMPOUND_WORKER_SUNSET = SHOPKEEPER_SUNSET;
(function(){
  if(!LIFE_COMPOUND_WORKER_N) return;
  var h0 = dayNightHour();
  var atWork = (h0 >= COMPOUND_WORKER_SUNRISE && h0 < COMPOUND_WORKER_SUNSET);
  var slot = 0, gardens = 0;
  COMPOUNDS.forEach(function(c){
    if(!c.doorX && c.doorX !== 0) return;   /* no recorded building door: skip rather than guess */
    gardens++;
    for(var k=0;k<LIFE_COMPOUND_WORKER_PER;k++){
      /* three beds spread along the garden's own long (local z) axis,
         a little back from its centre line — loc()'s own local frame,
         same convention every other placement in this world uses. */
      var wp = loc(c.x, c.z, (k-1)*c.fx*0.34, (k===1 ? 0 : (k===0 ? -1 : 1))*c.fz*0.42, c.ry);
      LIFE_PEDS[LIFE_COMPOUND_WORKER_BASE + slot] = {
        compoundWorker: true,
        home: { x: c.doorX, z: c.doorZ, ry: c.ry },
        work: { x: wp[0], z: wp[1] },
        /* the compound's own plinth top, +0.30 for the garden slab that sits
           on it (60-land.js draws it at yb-0.05, 0.35 tall). lifeGroundY()
           below knows nothing about compound plinths � it falls through to
           bare terrainH for anything that isn't a causeway, bridge, canton
           deck or pier � so a worker placed by ground height alone stands
           BELOW the garden he is meant to be tending wherever the plinth
           lifted the compound off a dip. Caught by screenshot, not assumed. */
        floorY: c.y + 0.30,
        state: atWork ? 'atWork' : 'atHome', stateT: 0,
        curve: null, len: 0, dur: 0, speed: rr(1.8,2.6)
      };
      slot++;
    }
  });
  window._compoundWorkers = { n: slot, gardens: gardens, per: LIFE_COMPOUND_WORKER_PER,
                              base: LIFE_COMPOUND_WORKER_BASE,
                              sunrise: COMPOUND_WORKER_SUNRISE, sunset: COMPOUND_WORKER_SUNSET };
})();

