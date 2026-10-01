/* ============================== citizens: guild workers ======================
   The Guild canton's own working population — smiths at the forge,
   warriors sparring in their yard, the alchemist tending the annex
   rooftop garden. GUILD_WORK_POSTS (50-cantons.js's guildHallsDeck(),
   which runs at file order 50, well before this file) already carries
   every post's world position/role/facing — same cross-file hand-off as
   LIFE_SHRINE_STOPS/TEMPLE_ALTAR above.

   ONE new InstancedMesh/draw call for the whole population (BUDGET.
   drawCalls bumped 52->53, 05-palette.js — see that file's own comment
   for why, matching the water-taxi precedent from earlier this session).
   The cheaper option — folding these posts into an EXISTING population's
   mesh (LIFE_ORD_POSTS/lifeOrdMesh or LIFE_CLERGY_POSTS/lifeClergyMesh,
   both already the exact "array of fixed posts + one shared instanced
   geometry" shape this needs, and both would cost zero extra draw
   calls) was ruled out on purpose: an ordinator carries a drawn sword
   and shield, a clergy figure a robe and mitre, and reusing either for
   "a smith hammering" or "an alchemist tending herbs" would be a worse
   visual mismatch than the existing role-reuses in this file allow (the
   goat repurposing clergy geometry, the penitent banner-role retint) —
   those reuse ONE population for a variant of the SAME population's own
   identity (another clergy figure, another temple animal); a smith is
   not a soldier or a priest. It would also mislabel the inspector
   (userData.inspectLabel) for every guild worker as "Ordinator" or
   "Temple clergy". One shared, neutral, undecorated body (no armour, no
   robe) that colour alone turns into smith/warrior/tender is the same
   "one shape, many roles via colour" trade this file already makes
   repeatedly, just given its own honestly-labelled population instead of
   grafted onto an unrelated one — and one new draw call for a dozen
   working NPCs across all 4 guild halls combined is far cheaper than the
   one-per-hall alternative the brief flagged as the real risk. */
var lifeGuildHullParts = [
  /* torso + head + held tool, all baked pure white so setColorAt (below)
     gives each instance its own clean, fully-controlled role tint —
     smith soot-dark, warrior crimson/gold, tender jade — rather than
     multiplying against mixed baked-in hues the way the "everyone normal
     except one variant" populations above do. */
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: 0xffffff },
  /* the held tool: hammer / practice blade / trowel, all abstracted as
     one raised-arm block — geometry can't vary per instance in a shared
     InstancedMesh (only the transform and colour can), so "which tool"
     is left to context (forge/yard/rooftop) and colour, same trade the
     penitent's own held item (78-life.js, above) already makes. */
  { geo: new THREE.BoxGeometry(0.10*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0.10*LIFE_PEOPLE_SCALE).translate(0.28*LIFE_PEOPLE_SCALE, 0.95*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifeGuildGeo = lifeMergeGeoms(lifeGuildHullParts);
var LIFE_GUILD_N = GUILD_WORK_POSTS.length;
var lifeGuildMesh = new THREE.InstancedMesh(lifeGuildGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), Math.max(1, LIFE_GUILD_N));
lifeGuildMesh.userData.life = true; lifeGuildMesh.userData.inspectLabel = 'Guild worker';
lifeGuildMesh.frustumCulled = false;
scene.add(lifeGuildMesh);
(function(){
  /* THIRD PASS: role->colour as an explicit map rather than a growing
     ternary chain, now that carpenter/merchant join smith/tender/warrior —
     carpenter a plain workaday wood-brown (TRUNKC, matches its own sawn
     timber), merchant a rich gold (BANNERC's own warm gold, reused —
     "showpiece stall" reads better in gold than in plain cloth-banner
     crimson/gold picked at random the warrior's own plaques use). */
  var ROLE_COL = {
    smith: new THREE.Color(0x4a3b32),
    tender: new THREE.Color(pick(JADEC)),
    carpenter: new THREE.Color(shade(TRUNKC[0], -0.05)),
    merchant: new THREE.Color(BANNERC[4])
  };
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var col = ROLE_COL[p.role] || new THREE.Color(pick([BANNERC[0],BANNERC[1]]));   /* warrior, and any future role */
    lifeGuildMesh.setColorAt(idx, col);
  });
  if(lifeGuildMesh.instanceColor) lifeGuildMesh.instanceColor.needsUpdate = true;
})();
window._guildWorkers = { total: LIFE_GUILD_N, roles: (function(){
  var r={}; GUILD_WORK_POSTS.forEach(function(p){ r[p.role]=(r[p.role]||0)+1; }); return r;
})() };   /* diagnostic */

var LIFE_GUILD_T = 0;
var lifeGuildTmpPos = new THREE.Vector3(), lifeGuildTmpQuat = new THREE.Quaternion();
var lifeGuildTmpMat = new THREE.Matrix4(), lifeGuildTmpScale1 = new THREE.Vector3(1,1,1);
function updateGuildWorkers(dt){
  LIFE_GUILD_T += dt;
  var t = LIFE_GUILD_T;
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var px, pz, py, yaw;
    if(p.role === 'smith'){
      /* hammering in place: a fast vertical bob timed like an arm/hammer
         swing, over a tight idle-wander drift — a visibly different
         motion primitive from the slow generic posts below, on purpose:
         "working," not "standing." */
      var swing = Math.sin(t*5.5 + idx*1.7);
      px = p.x + Math.sin(t*0.6+idx)*p.radius*0.3;
      pz = p.z + Math.cos(t*0.4+idx)*p.radius*0.3;
      py = p.y + Math.max(0, swing)*0.5;
      yaw = (p.ry||0) + swing*0.35;
    }else if(p.role === 'warrior'){
      /* sparring: lunge toward the partner and pull back along the
         pair's own shared line (pairDx/pairDz, set when the post was
         built in guildHallsDeck()), phase-locked per pair via the post's
         own pairId (NOT the post's global array index — with smiths and
         the tender sharing this same array ahead of the warriors, index
         parity doesn't line up with actual pair membership) so partners
         close and pull back together instead of drifting independently —
         reads as a real paired bout, not two people idling near
         each other. */
      var lunge = Math.sin(t*2.2 + (p.pairId||0)*10)*0.5 + 0.5;
      px = p.x + p.pairDx*lunge*1.6;
      pz = p.z + p.pairDz*lunge*1.6;
      py = p.y;
      yaw = Math.atan2(p.pairDx, p.pairDz) + Math.sin(t*4+idx)*0.2;
    }else if(p.role === 'carpenter'){
      /* THIRD PASS: sawing — the exact same paired-pull-along-a-shared-
         line mechanic the warrior sparring pairs use just above
         (pairDx/pairDz, pairId, set in guildHallsDeck()'s new carpenter
         yard), just slower and steadier: a real two-person pit saw drawn
         back and forth, not a lunging bout. Faces along the log (its own
         ry, set when the post was built) rather than always facing the
         partner, since a sawyer doesn't turn to track the other end. */
      var stroke = Math.sin(t*2.6 + (p.pairId||0)*10);
      px = p.x + p.pairDx*stroke*0.55;
      pz = p.z + p.pairDz*stroke*0.55;
      py = p.y + Math.max(0, Math.sin(t*2.6*2 + (p.pairId||0)*10))*0.10;   /* a small dip on the down-stroke */
      yaw = p.ry||0;
    }else if(p.role === 'merchant'){
      /* THIRD PASS: presenting the goods — a slow half-turn sweep between
         "facing the stall" and "facing outward toward a passer-by," plus
         the same gentle reach-bob the tender's own idle-wander below
         already uses (that primitive already reads as "tending something
         at counter height," which fits a merchant showing off wares just
         as well as it fits pruning an herb trough), so this stays its own
         branch mainly for the distinct facing sweep rather than a wholly
         new motion primitive. */
      var sweep = Math.sin(t*0.5 + idx*1.9);
      px = p.x + Math.sin(t*0.3+idx)*p.radius*0.25;
      pz = p.z + Math.cos(t*0.3+idx)*p.radius*0.25;
      py = p.y + Math.max(0, Math.sin(t*1.2+idx))*0.30;
      yaw = (p.ry||0) + sweep*0.9;
    }else{
      /* tender: the generic posted idle-wander primitive every other
         fixed-post population in this file already uses (ordinators/
         clergy above), plus a slow bend-and-reach bob over the planter
         row for "tending," not just "standing on the roof." */
      var ang = t*0.35 + idx*1.3;
      px = p.x + Math.sin(ang)*p.radius*0.5;
      pz = p.z + Math.cos(ang*0.6)*p.radius*0.5;
      py = p.y + Math.max(0, Math.sin(t*1.4+idx))*0.35;
      yaw = (p.ry||0) + Math.sin(ang*0.4)*0.4;
    }
    lifeGuildTmpPos.set(px, py, pz);
    lifeGuildTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeGuildTmpMat.compose(lifeGuildTmpPos, lifeGuildTmpQuat, lifeGuildTmpScale1);
    lifeGuildMesh.setMatrixAt(idx, lifeGuildTmpMat);
  });
  lifeGuildMesh.instanceMatrix.needsUpdate = true;
}

/* ============================== citizens: merchant caravans =================
   Item 4 of 4 planned populations — the last one. Carts drawn by an ox,
   lizard, or beetle (one species per caravan, "each caravan uses the
   same draft animal"), heading to a harbor dock (PIERS, mainland),
   river dock (LIFE_RBARGE_DOCKS), market (LIFE_DOORS, reused directly —
   pedestrians already classified every market door), or the new
   warehouse district (DIST_WAREHOUSE, 69-district-content.js, a bare
   global since that file runs at order 69, well before this one).
   Unload, then either head back off-map or straight to a DIFFERENT one
   of those four categories — never immediately back to the one just
   left.

   Real, documented simplification for time: a caravan's 1-3 carts, its
   driver (blue, broad hat), 2 guards (grey mail), and its draft animal
   are ALL one rigid merged template — nothing here shows a visibly
   longer convoy for a 3-cart caravan, only `cartCount` as data (the
   same "data now, visual later" call made for ordinator officers and
   pedestrian race). "1-2 hangers-on drawn from the rambling pedestrian
   asset pool" isn't wired up either — pulling real LIFE_PEDS instances
   to visually tag along with a specific moving caravan is real, separate
   work, not attempted here. One more draw call for the combined model —
   see BUDGET.drawCalls, 05-palette.js (currently right at the new
   ceiling, no further room after this).

   The "caravans of 2+ carts must avoid going north of the river" rule
   (avoid the traffic-jam risk of a wide convoy squeezing over one of
   only two river bridges) is implemented directly: the warehouse
   district sits on the river's OPPOSITE bank from everything else this
   system reaches (by construction — see its own DISTRICTS entry,
   30-layout.js), so it's simply excluded as a destination whenever
   cartCount >= 2. */
var lifeCaravanParts = [
  { geo: new THREE.BoxGeometry(3.2,1.6,4.5).translate(0,1.0,-2.5), color: 0x6b4a2e },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.BoxGeometry(1.2,1.0,1.2).translate(0.8,2.3,-2.0), color: 0x5a4a38 },
  { geo: new THREE.BoxGeometry(1.0,0.9,1.0).translate(-0.7,2.2,-3.0), color: 0x6a5642 },
  /* the draft animal — one generic quadruped silhouette for all three
     species; ox/lizard/beetle is a data field (sh.animal), not a visual
     variant (see file comment above). */
  { geo: new THREE.CylinderGeometry(0.9,1.1,2.6,8).rotateX(Math.PI/2).translate(0,1.4,2.5), color: 0x7a5c3a },
  { geo: new THREE.BoxGeometry(0.9,0.9,1.1).translate(0,1.8,4.0), color: 0x7a5c3a },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,3.3), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,3.3), color: 0x5a4028 },
  /* the merchant driver — blue, on the cart's own seat, with a broad hat */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(0,2.4,-1.0), color: 0x2b4a7a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(0,3.0,-1.0), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.5,0.5,0.12,8).translate(0,3.25,-1.0), color: 0x1f3a63 },
  /* 2 guards, plain grey mail, flanking on foot */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(2.4,1.6,-2.5), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(-2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(-2.4,1.6,-2.5), color: LIFE_SKIN }
];
var lifeCaravanGeo = lifeMergeGeoms(lifeCaravanParts);
/* THE 60 BORROWED SLOTS ARE GONE — this mesh is real merchant caravans
   again, nothing else. For several passes it carried a trailing reservation
   of 60 extra instances that 79-striders.js drove as silt strider "cars"
   (the caravan's cart+draft-animal template, scaled 2.3x and retinted),
   because the draw-call budget sat at its hard ceiling and a bespoke
   creature needs its own InstancedMesh. The owner has since raised that
   ceiling, 79-striders.js now builds and drives a real silt strider on two
   meshes of its own, and this reservation has been handed back:
   LIFE_CARAVAN_N drops 150 -> 90, and NOTHING outside this file writes a
   matrix or a colour into lifeCaravanMesh any more.

   That also retires the instanceColor hazard this mesh was the original
   victim of: the strider tinting used to be the first setColorAt() call
   ever made on it, and THREE allocates instanceColor lazily and
   ZERO-initialised, so every real caravan (never explicitly coloured) went
   black the moment that buffer appeared. With no tinting left on this mesh
   the buffer is never allocated at all, and the caravans render from their
   own baked vertex colours exactly as they always did.

   The two constants below are KEPT (unchanged values) because other
   fragments read them and their meanings are still exactly right:
   LIFE_STRIDER_CAR_SLOTS (60) is the strider creature-slot pool — up to 20
   convoys (6 on Route 1, 6 on Route 2, 8 on Route 3) x up to 3 creatures —
   now sized against 79-striders.js's own striderMesh and against
   82-daynight.js's LANTERN_STRIDER_BASE block; LIFE_STRIDER_CAR_BASE (90)
   is the real caravan count, which is what 82-daynight.js's
   LANTERN_CARAVAN_BASE block and the spawn loop below have always actually
   used it for. */
var LIFE_STRIDER_CAR_SLOTS = 60;
var LIFE_STRIDER_CAR_BASE = 90;
var LIFE_CARAVAN_N = LIFE_STRIDER_CAR_BASE;   /* x3 per the owner's "city feels empty" follow-up */
var lifeCaravanMesh = new THREE.InstancedMesh(lifeCaravanGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_CARAVAN_N);
lifeCaravanMesh.userData.life = true; lifeCaravanMesh.userData.inspectLabel = 'Caravan';
lifeCaravanMesh.frustumCulled = false;
scene.add(lifeCaravanMesh);

/* off-map spawn: the SW/West highway's own far end (30-layout.js) —
   already the map's own "off the edge" point for a real road, not a
   made-up coordinate. */
var LIFE_CARAVAN_SPAWN = { x: -3340, z: 1590 };
/* owner: "caravans still occasionally trying to swim" — real bug found by
   direct instrumentation (traced a live caravan's full curve: half its
   route was a smooth, continuous swim straight across the open bay, not
   a jittery spline artifact). PIERS entries (30-layout.js) are x0/z0 =
   the shore ROOT, x1/z1 = the water-side TIP (where a ship actually
   docks) — this was sending land carts to the TIP, i.e. straight out
   into open water by construction; no amount of path refinement can fix
   a destination that's genuinely offshore. x0/z0 (the root, where cargo
   would actually be loaded off a cart) is correct for a cart. */
var LIFE_CARAVAN_HARBOR = PIERS.map(function(p){ return { x:p.x0, z:p.z0, ry: Math.atan2(p.x1-p.x0, p.z1-p.z0) }; });
var LIFE_CARAVAN_RIVER = LIFE_RBARGE_DOCKS.map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_MARKET = LIFE_DOORS.filter(function(d){ return d.cat === 'market'; }).map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_WAREHOUSE = DIST_WAREHOUSE.map(function(d){
  var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; }); cx/=d.poly.length; cz/=d.poly.length;
  return { x:cx, z:cz, ry:0 };
});
/* ---- the four TRADE-SITE categories (owner: "fishing docks, mines,
   quarries and taverns should be caravan destinations") ---------------------
   Every one of them is a list some BUILDER fragment already publishes, read
   wholesale here the way LIFE_RBARGE_DOCKS/GUILD_WORK_POSTS/
   LIFE_STRIDER_STATIONS are — no coordinate is written down twice:
     fishdock  LIFE_FISH_CART_STOPS (65-facade.js) — the LANDWARD point per
               dock, not the pier: a cart cannot drive onto a 9.5-wide deck
               over open water, and the 5 ShoalBank piers hang off a trestle
               with no landward shore at all, so that jetty contributes its
               single canton-side anchor (already deduped in that file).
     mine      MINE_CART_STOPS (71-industry.js) — the foot of each mine's own
               ore-cart rails.
     quarry    QUARRY_CART_STOPS (71-industry.js) — the toe of each pit's haul
               ramp, the point the quarry connector road was built to meet.
     tavern    LIFE_DOORS, cat 'tavern' — already classified above, exactly
               the way 'market' is; no new list needed for these at all.
   NO economy is invented here: there is no notion of origin vs destination,
   goods, or weight anywhere in this system (a caravan picks a category
   uniformly, then a point in it, and the ONLY rule is the existing
   river-crossing one), so these four join as four more equal categories
   rather than as sources and sinks. A tavern therefore sees as much traffic
   as a quarry; that is the honest description of what this code does.

   ROAD-REACHABILITY IS TESTED HERE, ONCE, rather than left to the per-pick
   retry loop: these sites sit out in wilderness where the road graph is
   thinnest, and a pool full of unreachable points would burn all 10 retries
   in lifeCaravanPickDest and fall through to its last-resort unchecked pick —
   i.e. exactly the cross-country route lifeRoadReachable exists to prevent.
   Same claim()-style reject: a site with no road to it is simply not a
   destination, and window._caravanDests records how many were dropped. */
function lifeCaravanRoadPool(list){
  return (list||[]).filter(function(p){
    return lifeRoadReachable(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, p.x, p.z);
  }).map(function(p){ return { x:p.x, z:p.z, ry:p.ry||0 }; });
}
var LIFE_CARAVAN_FISHDOCK = lifeCaravanRoadPool(typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS : []);
var LIFE_CARAVAN_MINE     = lifeCaravanRoadPool(typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS : []);
var LIFE_CARAVAN_QUARRY   = lifeCaravanRoadPool(typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS : []);
var LIFE_CARAVAN_TAVERN   = lifeCaravanRoadPool(LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }));
function lifeCaravanPool(cat){
  if(cat === 'harbor') return LIFE_CARAVAN_HARBOR;
  if(cat === 'river') return LIFE_CARAVAN_RIVER;
  if(cat === 'market') return LIFE_CARAVAN_MARKET;
  if(cat === 'fishdock') return LIFE_CARAVAN_FISHDOCK;
  if(cat === 'mine') return LIFE_CARAVAN_MINE;
  if(cat === 'quarry') return LIFE_CARAVAN_QUARRY;
  if(cat === 'tavern') return LIFE_CARAVAN_TAVERN;
  return LIFE_CARAVAN_WAREHOUSE;
}
var LIFE_CARAVAN_CATS = ['harbor','river','market','warehouse','fishdock','mine','quarry','tavern'];
/* diagnostic: what each pool ended up holding, and what the reachability
   filter above actually rejected — the honest record of which sites a cart
   can and cannot get to. */
window._caravanDests = {
  cats: LIFE_CARAVAN_CATS,
  pools: { harbor: LIFE_CARAVAN_HARBOR.length, river: LIFE_CARAVAN_RIVER.length,
           market: LIFE_CARAVAN_MARKET.length, warehouse: LIFE_CARAVAN_WAREHOUSE.length,
           fishdock: LIFE_CARAVAN_FISHDOCK.length, mine: LIFE_CARAVAN_MINE.length,
           quarry: LIFE_CARAVAN_QUARRY.length, tavern: LIFE_CARAVAN_TAVERN.length },
  offered: { fishdock: (typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS.length : 0),
             mine: (typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS.length : 0),
             quarry: (typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS.length : 0),
             tavern: LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }).length },
  points: { fishdock: LIFE_CARAVAN_FISHDOCK, mine: LIFE_CARAVAN_MINE, quarry: LIFE_CARAVAN_QUARRY }
};
/* owner: "continue tweaking the cart pathfinding, they still try climbing
   the hill and going for swims". The rest of that fix is upstream (a road
   graph that is actually connected — 30-layout.js section 5g), but the last
   piece belongs here: a destination with NO road route from where the cart
   is standing must be REJECTED and another picked, exactly the way claim()
   rejection works everywhere else in this codebase, rather than handed to
   lifeCartBuildLeg to invent a cross-country line for. `fromX/fromZ` is the
   cart's actual current position, so this is a real per-cart test, not a
   global one. Bounded retries with an honest last resort: if nothing in any
   pool is reachable (it always is, in practice — the main component now
   holds 95%+ of the graph) the original unchecked pick still comes back, so
   a caravan can never end up with no destination at all and freeze. */
function lifeCaravanPickDest(excludeCat, cartCount, fromX, fromZ){
  var cats = LIFE_CARAVAN_CATS.filter(function(c){
    if(c === excludeCat) return false;
    if(c === 'warehouse' && cartCount >= 2) return false;   /* the river-crossing rule */
    return lifeCaravanPool(c).length > 0;
  });
  if(!cats.length) return null;
  var first = null;
  for(var tries=0; tries<10; tries++){
    var cat = pick(cats);
    var cand = { cat:cat, pt: pick(lifeCaravanPool(cat)) };
    if(!first) first = cand;
    if(fromX === undefined) return cand;
    if(lifeRoadReachable(fromX, fromZ, cand.pt.x, cand.pt.z)) return cand;
  }
  return first;
}
function lifeCaravanSpawn(){
  var cartCount = ri(1,3);
  var picked = lifeCaravanPickDest(null, cartCount, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
  if(!picked) return null;
  var curve = lifeCartBuildLeg(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, picked.pt.x, picked.pt.z);
  return {
    id: LIFE_CITIZEN_ID++, animal: pick(['ox','lizard','beetle']), cartCount: cartCount,
    /* real gap measured directly: off-map routes run 3500-5300 units at
       the originally-picked rr(4,6) — 750-1125s (12-19 min) per leg, so
       every caravan sat "arriving" for the caravan system's ENTIRE
       verification window (240s) without a single one ever completing a
       leg. The owner wants them "come in from off the map regularly" —
       bumped to a game-paced trot instead of a literal walking speed,
       landing most legs in the 2-4 minute range. */
    state: 'arriving', stateT: 0, speed: rr(20,28),
    curve: curve, len: curve.getLength(), dur: 0,
    destCat: picked.cat, destPt: picked.pt, facingYaw: undefined,
    /* owner: "space the carts out a little more so they don't clip each
       other" — a persistent per-caravan lateral offset (perpendicular to
       whatever direction it's currently travelling), re-rolled each new
       leg so it isn't the exact same convoy re-clipping every trip. Cheap
       real fix for the common case (several caravans sharing the same
       road at once, now riding side by side instead of stacked); it
       doesn't solve two routes genuinely crossing at an angle, but that's
       a rare instant overlap, not a standing clip. */
    laneOffset: rr(-4.0, 4.0)
  };
}
var LIFE_CARAVANS = [];
(function(){
  /* LIFE_CARAVAN_N == LIFE_STRIDER_CAR_BASE == 90 now: the strider
     reservation that used to sit past this loop has been handed back (see
     the constants' own comment above), so every slot on this mesh gets a
     real caravan and nothing else writes to it. */
  for(var i=0;i<LIFE_STRIDER_CAR_BASE;i++){
    var cv = lifeCaravanSpawn();
    /* stagger the initial population along its own route (a fresh
       load-time head start only — respawns after this naturally spread
       out over time as each one completes its own leg independently) so
       they don't all sit clumped at the map edge for the first several
       minutes after the page loads. */
    if(cv){ cv.dur = Math.max(6, cv.len/cv.speed); cv.stateT = rr(0, cv.dur); }
    LIFE_CARAVANS.push(cv);
  }
})();
window._caravans = LIFE_CARAVANS;   /* diagnostic */

var lifeCaravanTmpPos = new THREE.Vector3(), lifeCaravanTmpDir = new THREE.Vector3();
var lifeCaravanTmpQuat = new THREE.Quaternion(), lifeCaravanTmpMat = new THREE.Matrix4();
var lifeCaravanTmpScale1 = new THREE.Vector3(1,1,1);
function updateCaravans(dt){
  LIFE_CARAVANS.forEach(function(cv, idx){
    if(!cv){ LIFE_CARAVANS[idx] = lifeCaravanSpawn(); return; }
    cv.stateT += dt;
    if(cv.state === 'unloading'){
      lifeCaravanTmpPos.set(cv.destPt.x, Math.max(LIFE_Y, lifeGroundY(cv.destPt.x, cv.destPt.z) + 0.15), cv.destPt.z);
      lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, cv.destPt.ry || 0);
      lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
      lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
      if(cv.stateT >= cv.unloadFor){
        var next = lifeCaravanPickDest(cv.destCat, cv.cartCount, cv.destPt.x, cv.destPt.z);
        cv.laneOffset = rr(-4.0, 4.0);   /* re-rolled per leg — see lifeCaravanSpawn's own comment */
        if(next && chance(0.5)){
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, next.pt.x, next.pt.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.destCat = next.cat; cv.destPt = next.pt; cv.state = 'arriving'; cv.stateT = 0;
        }else{
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.state = 'departing'; cv.stateT = 0;
        }
      }
      return;
    }
    /* 'arriving' or 'departing' */
    if(cv.dur === 0) cv.dur = Math.max(6, cv.len/cv.speed);
    var raw = Math.min(1, cv.stateT/cv.dur);
    var t = raw*raw*(3-2*raw);
    cv.curve.getPointAt(t, lifeCaravanTmpPos);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cv.curve.getTangentAt(tTan, lifeCaravanTmpDir);
    var yaw = Math.atan2(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z);
    /* owner: "space the carts out a little more so they don't clip each
       other" — offset perpendicular to the direction of travel, applied
       AFTER yaw is computed from the unmodified tangent so facing stays
       correct; only the on-road position shifts sideways. */
    var dlen = Math.hypot(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z) || 1;
    lifeCaravanTmpPos.x += (-lifeCaravanTmpDir.z/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.z += (lifeCaravanTmpDir.x/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifeCaravanTmpPos.x, lifeCaravanTmpPos.z) + 0.15);
    lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
    lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
    if(raw >= 1){
      if(cv.state === 'arriving'){
        cv.state = 'unloading'; cv.stateT = 0; cv.unloadFor = rr(10,20);
      }else{
        LIFE_CARAVANS[idx] = lifeCaravanSpawn();
      }
    }
  });
  lifeCaravanMesh.instanceMatrix.needsUpdate = true;
}

