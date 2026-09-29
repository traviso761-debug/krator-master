/* ============================== 5. CITY LAYOUT ==============================
   Monumental cantons stand in the middle of the bay; lesser cantons ring its
   edge; the mainland city occupies the eastern shore with its harbour at the
   northern end, by the mouth. Everything on the coast is addressed by arc
   length along the traced shoreline.                                        */
reseed(300001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */


/* --- everything on the coast is anchored to a place in the world and
       resolved to an arc length at load, so changing the water shapes
       never invalidates the plan ------------------------------------------ */
var BAYC = { x:-150, z:600 };
function bayS(th){                            /* shore position at a bearing out of the bay */
  var r = 60;
  while(r < 3400 && landDist(BAYC.x+Math.cos(th)*r, BAYC.z+Math.sin(th)*r) < 0) r += 12;
  return shoreS(BAYC.x+Math.cos(th)*r, BAYC.z+Math.sin(th)*r);
}
/* the bay's rim, swept from the west narrows round the south to the east */
function rimS(u){ return bayS(-2.36 - u*4.71); }

var RIVER_S = 0;                              /* set once riverAt() exists, below */
var CITY_S0 = bayS(1.16);                     /* estates begin on the south-east lobe */
var WALL_S0 = 0;                              /* ditto */
var CITY_S1 = shoreS(1620, -1380);            /* up the north-east coast */
var PORT_S  = shoreS(1150, -1050);
var HARB_S0 = PORT_S - 780, HARB_S1 = PORT_S - 250;   /* mainland harbour, south of the port canton */
var HARB_S  = (HARB_S0+HARB_S1)/2;

/* a point along the river, with its unit tangent and the normal that points
   at the CITY side (north = smaller z) */
function riverAt(u){
  var i=0; while(i<RIVER.length-2 && RIVER_CUM[i+1] < u) i++;
  var t=(u-RIVER_CUM[i])/(RIVER_CUM[i+1]-RIVER_CUM[i]);
  var dx=RIVER[i+1][0]-RIVER[i][0], dz=RIVER[i+1][1]-RIVER[i][1], L=Math.hypot(dx,dz);
  var nx=-dz/L, nz=dx/L;
  if(nz > 0){ nx=-nx; nz=-nz; }                  /* keep the normal on the city bank */
  return { x:mix(RIVER[i][0],RIVER[i+1][0],t), z:mix(RIVER[i][1],RIVER[i+1][1],t),
           tx:dx/L, tz:dz/L, nx:nx, nz:nz };
}
/* how far upstream the estuary gives way to a channel with dry banks on both
   sides — everything built on the river is measured from here, so widening the
   estuary can never strand a bridge out in open water again */
var RIVER_HEAD = (function(){
  for(var u=0; u<1600; u+=15){
    var p = riverAt(u), half = 40 + 44*(u/RIVER_CUM[RIVER_CUM.length-1]) + 46;
    if(terrainH(p.x+p.nx*half, p.z+p.nz*half) > 2.5 &&
       terrainH(p.x-p.nx*half, p.z-p.nz*half) > 2.5) return u;
  }
  return 500;
})();

/* the river corridor: nothing coastal may cross it except a bridge */
function riverHalf(x,z){ var rv = polyNear(x,z,RIVER,RIVER_CUM); return 40 + 44*rv.t + 4; }
function inRiver(x,z,margin){ var rv = polyNear(x,z,RIVERC,RIVERC_CUM); return rv.d < 44 + 44*rv.t + (margin||0); }
(function(){
  var m = riverAt(0);                          /* the river's line at the old mouth */
  RIVER_S = shoreS(m.x + m.nx*210, m.z + m.nz*210);   /* the city bank of the estuary */
  WALL_S0 = RIVER_S + 120;
})();
/* clock positions round the bay, as arc lengths (12 = north, 3 = east) */
var S_5 = bayS(1.05), S_7 = bayS(2.09), S_10 = bayS(-2.62);

/* --- cantons -------------------------------------------------------------
   'mono' : a single stepped pyramid crowned by a dome
   'plat' : a stepped platform carrying discrete buildings                    */
var CANTONS = [
  /* the two monumental cantons, out in the deep middle of the bay */
  /* gray-brown recolor, per the owner: cantons/buildings/bridges/causeways
     all move to the same desaturated gray-brown family PAL.stone.common now
     uses; accent (where a canton has one) is a darker shade of it, not the
     old gold — floors and other trim already read a darker shade() of a
     canton's own .tone throughout this file, so darkening the base tone
     carries them along automatically. */
  { n:'Palace', x:-330, z: 700, r:205, kind:'mono', tiers:5, top:132, dome:38,
    tone:0x8c8579, accent:0x5c5850 },
  { n:'Temple', x: 210, z: 170, r:188, kind:'mono', tiers:6, top:156, dome:34,
    tone:0x928b7d, accent:0x615c50 },

  /* the rim: lesser cantons set just off the bay's edge */
  { n:'Arsenal',  s:rimS(0.055), off:-250, r:126, kind:'plat', tiers:3, top:40, tone:0x847e71 },
  /* position swap with Ancestry, per the owner: the two had ended up
     standing where the other belonged. Only s/off move — r/tone/kind/
     tiers/top and the guild-hall dispatch (CIDX['Guild'].guild=true, below
     — reverted from an earlier garden/market swap, see that flag's own
     comment) all stay with the NAME 'Guild', exactly as the owner
     described, since everything downstream reads a canton's position
     dynamically off CIDX[name]/CANTONS.find rather than a hardcoded
     coordinate. */
  { n:'Guild',    s:rimS(0.880), off:-244, r:120, kind:'plat', tiers:3, top:38, tone:0x8a8375 },
  { n:'Foreign',  s:rimS(0.335), off:-440, r:128, kind:'plat', tiers:3, top:36, tone:0x8f8879 },
  { n:'Granary',  s:rimS(0.470), off:-420, r:122, kind:'plat', tiers:2, top:32, tone:0x7d7768 },
  { n:'Market',   s:rimS(0.605), off:-262, r:134, kind:'plat', tiers:3, top:40, tone:0x8c8578 },
  { n:'Arena',    s:rimS(0.695), off:-250, r:130, kind:'plat', tiers:2, top:30, tone:0x877f71, arena:true },
  /* the necropolis: thrown out and rebuilt per the owner's explicit spec
     (see src/50-cantons.js's ancestryCanton() for the build) — a square-
     pyramid spiral ramp of family tombs and hanging gardens, not the old
     bare stepped platform. `kind` stays 'plat' (nothing outside this
     canton's own dispatch line reads it); `turns`/`top` are read only by
     ancestryCanton() itself (the tier-loop functions this canton no
     longer uses read c.tiers/c.top too, but for a different purpose —
     confirmed nothing else in src/ reads either field for THIS canton).
     `top` (150) is the summit deck height; the fountain above it reaches
     the Ordinator Fortress's own measured full height (~166 above sea
     level, checked live against the built scene, not CANTON_TOPS —
     see ancestryCanton()'s own comment). r unchanged from the original
     entry, so the layout relax pass and every other canton's spacing is
     untouched by the shape rebuild itself.

     s/off: swapped with Guild's, per the owner — this canton had ended up
     standing where Guild belonged (and vice versa). ancestryCanton() reads
     c.x/c.z generically at build time (never a hardcoded world coordinate),
     so relocating it here is the only change needed; re-checked against a
     fresh build at the new position, not assumed. */
  { n:'Ancestry', s:rimS(0.195), off:-244, r:118, kind:'plat', turns:12, top:150,
    tone:0x827c6e, accent:0x5c5850 },
  { n:'Port',     s:PORT_S,      off:-272, r:138, kind:'plat', tiers:3, top:34, tone:0x857e70, port:true },

  /* the lighthouse: fixed in place like the monumental pair (it replaces an
     islet, not a shore-derived rim canton), tied to the promontory shore by
     its own causeway below */
  /* owner: "color the rest of the fortress canton to match the fortress" —
     ordinatorFortress() (65-facade.js) was moved to basalt with two-grey
     trim, which left the platform it stands on in the old warm sandy tone
     and made the fortress look dropped onto someone else's canton. tone is
     PAL.stone.basalt's mid shade (the exact one the fortress body shades
     from) and accent is PAL.stone.grey, matching the light coping the
     fortress trim uses, so platform and keep read as one build. */
  { n:'Fortress', x:-240, z:-780, r:150, kind:'plat', tiers:3, top:44,
    tone:0x322f2b, accent:0x8c8f8a, fortress:true }
];
/* resolve the rim cantons off the shoreline */
CANTONS.forEach(function(c){
  if(c.s !== undefined){ var p = shoreIn(c.s, c.off); c.x = p[0]; c.z = p[1]; }
});

/* --- relax: the monumental pair is fixed, the rim yields, and every rim
       canton is held in a sensible depth band clear of the shore --------- */
(function(){
  for(var iter=0; iter<90; iter++){
    var moved = 0;
    for(var i=0;i<CANTONS.length;i++) for(var j=i+1;j<CANTONS.length;j++){
      var A=CANTONS[i], B=CANTONS[j];
      var dx=B.x-A.x, dz=B.z-A.z, d=Math.hypot(dx,dz)||1;
      var want = A.r + B.r + 120;
      if(d >= want) continue;
      var aFix = (A.s===undefined), bFix = (B.s===undefined);
      if(aFix && bFix) continue;
      var push = (want-d)*0.5, ux=dx/d, uz=dz/d;
      if(!aFix){ A.x -= ux*push*(bFix?2:1); A.z -= uz*push*(bFix?2:1); }
      if(!bFix){ B.x += ux*push*(aFix?2:1); B.z += uz*push*(aFix?2:1); }
      moved++;
    }
    CANTONS.forEach(function(c){
      if(c.s === undefined) return;
      /* keep clear of the river's line into the bay */
      var rvn = polyNear(c.x, c.z, RIVERC, RIVERC_CUM);
      if(rvn.d < c.r + 100){
        var nearest = null, bd=1e9;
        for(var q=0;q<RIVERC.length-1;q++){ var a=RIVERC[q], b=RIVERC[q+1];
          var vx=b[0]-a[0], vz=b[1]-a[1], LL=vx*vx+vz*vz, t=clamp(((c.x-a[0])*vx+(c.z-a[1])*vz)/LL,0,1);
          var px=a[0]+vx*t, pz=a[1]+vz*t, d=Math.hypot(c.x-px,c.z-pz); if(d<bd){bd=d;nearest=[px,pz];} }
        var ux=(c.x-nearest[0])/(bd||1), uz=(c.z-nearest[1])/(bd||1), push=(c.r+100-bd);
        c.x += ux*push; c.z += uz*push; moved++;
      }
      var L = landDist(c.x, c.z);
      var target = clamp(L, -520, -(c.r*1.45 + 42));   /* the corner, not the edge */
      if(Math.abs(target - L) > 1){
        var g = sdGrad(c.x, c.z);
        c.x += g[0]*(target-L); c.z += g[1]*(target-L);
        moved++;
      }
    });
    if(!moved) break;
  }
  /* re-derive each rim canton's place on the coast after it has moved */
  CANTONS.forEach(function(c){ if(c.s !== undefined) c.s = shoreS(c.x, c.z); });
  /* and shove the islets clear of anything they ended up under */
  ISLES.forEach(function(I){
    for(var k=0;k<40;k++){
      var worst = null, wd = 0;
      CANTONS.forEach(function(c){
        var dx=I[0]-c.x, dz=I[1]-c.z, d=Math.hypot(dx,dz), need=c.r+I[3]+70;
        if(d < need && (need-d) > wd){ wd = need-d; worst = [dx/(d||1), dz/(d||1)]; }
      });
      if(!worst) break;
      I[0] += worst[0]*wd; I[1] += worst[1]*wd;
    }
  });
})();

var CIDX = {}; CANTONS.forEach(function(c,i){ CIDX[c.n]=c; c.i=i; });

/* ============================== 4b. DISTRICTS ==============================
   Hand-marked polygons that override the default build — market, park and
   funerary areas. zoneAt() is analytic (shore parameter + land distance);
   these don't fit that form, so they're a separate layer entirely.

   Every ground-district corner was probed for landDist>0 (on land, clear of
   water) before being fixed here — see the planner's own survey, not
   estimated from a screenshot.

   Two canton conversions used to ride alongside this array rather than as
   polygons (an early pass had 'Guild' hosting a market/guild function and
   'Ancestry' hosting a garden; a later pass swapped which canton hosted
   which; both readings are now history, left here only because the git-
   free build has no other record of it). Current state, reconciled against
   50-cantons.js's actual dispatch: 'Ancestry' is the necropolis, built by
   its own name-checked ancestryCanton() (bypassing any c.market/c.garden
   flag entirely — see CANTONS.forEach's dispatch at the bottom of
   50-cantons.js). 'Guild' is, once again, Guild — a canton of its own
   four craft-guild halls plus a small local market, dispatched by its own
   c.guild flag (below) to guildHallsDeck() in 50-cantons.js, exactly the
   way c.port/c.arena/c.fortress already dispatch to their own builders.
   Neither canton's function is one of these DISTRICTS polygons; both are
   plain canton-level flags, unrelated to the market/park/funerary areas
   defined below.

   Deliberate simplification vs. a literal "paint into the mask" pipeline:
   the compound and town building passes in 60-land.js check districtAt()
   directly in their own grid-scan loops rather than relying on the ground
   mask to keep them out. This gets the same guarantee (verified via
   window._districtIntrusions) through a mechanism that's directly
   checkable at the one place buildings are actually created, rather than
   depending on paint-order subtleties in a canvas that a dozen other things
   also paint into. The ground CANVAS (cosmetic colour only) is still
   painted per-district in 40-ground.js, after roads, as the brief asks. */
var DISTRICTS = [
  { type:'market', name:'Market A',  poly:[[1160,-600],[1380,-600],[1380,-420],[1160,-420]] },
  { type:'market', name:'Market C',  poly:[[1068,-975],[1288,-975],[1288,-795],[1068,-795]] },
  { type:'market', name:'Market D',  poly:[[28.3,1919.8],[267.3,1863.8],[315.8,1977.9],[48.3,2042.2]] },
  /* Promontory Point Park removed per the owner — superseded by the Abbey
     Close below, which covers the same promontory area at a much larger
     scale. Uses park terrain/props like any other park district, but the
     owner explicitly wants major streets and highways free to run across
     it (unlike a market/funerary polygon, this one is not meant to block
     the road network) — the road generator in this file runs its own pass
     independent of DISTRICTS and was never gated on park polygons anyway,
     so no separate opt-out flag is needed for that; flagging here in case
     that assumption needs revisiting once roads are checked against it. */
  { type:'park',   name:'Abbey Close',
    poly:[[-785.4,-294.7],[-1011.7,-199.0],[-1221.8,-52.1],[-1606.8,-385.4],
          [-1309.8,-732.1],[-996.0,-495.3],[-823.3,-392.1],[-783.7,-359.7]] },
  { type:'park',   name:'Park B',    poly:[[1140,-270],[1320,-270],[1320,-130],[1140,-130]] },
  { type:'park',   name:'Park D',    poly:[[-214.4,1936.7],[18.2,1921.5],[36.9,2044],[-210.8,2060.6]] },
  { type:'market', name:'Market E',  poly:[[1219,556],[1373,556],[1373,710],[1219,710]] },
  /* the owner: "i want to move the funerary district slightly to [these
     9 points]" — a real relocation, not a resize; the west edge now sits
     right where the city's widest boulevard (930,630)->...->(1840.1,562.2)
     already dead-ends (69-district-content.js places the temple there —
     "temple goes at the end of that major highway"), a real, pre-existing
     road endpoint found by querying the live ROADS array, not guessed. */
  { type:'funerary', name:'Funerary',
    poly:[[1780.7,540.1],[1801.1,377.3],[1912.3,290.4],[2081.1,424.2],
          [2055.7,635.9],[1949.2,738.3],[1870.0,737.9],[1765.7,694.1],[1766.5,587.1]] },
  /* Market F: the west side's own local market, at the owner's block
     (-1370,681). Same shore-trapezoid method as Market D/Park D — the
     coast here runs roughly N-S, so a 280-arc-unit reach either side of
     the point, inset 15 (waterline edge) to 122 (verified still inside
     the shorehut band, before the orchard rows start at ld~140) gives a
     ~30k-area quad, 100% on land, that doesn't crowd into the farm grid. */
  { type:'market', name:'Market F',  poly:(function(){
      var tipS = shoreS(-1370,681), ARC = 140;
      return [ shoreIn(tipS-ARC, 15), shoreIn(tipS+ARC, 15),
               shoreIn(tipS+ARC, 122), shoreIn(tipS-ARC, 122) ];
    })() },
  /* the owner: "make a new, small warehouse district opposite the river
     docks" — RPIERS (below, "river docklands on the north bank, just
     upstream of the mouth") sit on the CITY bank, i.e. the +n side of
     riverAt() ("the normal that points at the CITY side" — riverAt's own
     doc comment); "opposite" is the -n side at the same stretch of river,
     a real dock-to-dock crossing rather than a guessed spot. Reaches from
     the bank out 140 units, same order of magnitude as a market district. */
  { type:'warehouse', name:'Warehouse District', poly:(function(){
      var u0 = RIVER_HEAD - 20, u1 = RIVER_HEAD + 320;
      var pA = riverAt(u0), pB = riverAt(u1);
      var hA = riverHalf(pA.x,pA.z), hB = riverHalf(pB.x,pB.z);
      return [
        [pA.x - pA.nx*hA,       pA.z - pA.nz*hA],
        [pB.x - pB.nx*hB,       pB.z - pB.nz*hB],
        [pB.x - pB.nx*(hB+220), pB.z - pB.nz*(hB+220)],
        [pA.x - pA.nx*(hA+220), pA.z - pA.nz*(hA+220)]
      ];
    })() }
];
function districtAt(x,z){
  for(var i=0;i<DISTRICTS.length;i++){
    var poly = DISTRICTS[i].poly, inside = false;
    for(var a=0,b=poly.length-1; a<poly.length; b=a++){
      var xa=poly[a][0], za=poly[a][1], xb=poly[b][0], zb=poly[b][1];
      if(((za>z) !== (zb>z)) && (x < (xb-xa)*(z-za)/(zb-za)+xa)) inside = !inside;
    }
    if(inside) return DISTRICTS[i].type;
  }
  return null;
}
function districtNameAt(x,z){
  for(var i=0;i<DISTRICTS.length;i++){
    var poly = DISTRICTS[i].poly, inside = false;
    for(var a=0,b=poly.length-1; a<poly.length; b=a++){
      var xa=poly[a][0], za=poly[a][1], xb=poly[b][0], zb=poly[b][1];
      if(((za>z) !== (zb>z)) && (x < (xb-xa)*(z-za)/(zb-za)+xa)) inside = !inside;
    }
    if(inside) return DISTRICTS[i].name;
  }
  return null;
}
/* Reset per the owner's explicit follow-up: "the current garden canton was
   the old Guild canton i thought. please reset this to being the guild
   canton in all deep and top level aspects" — an earlier pass here had
   flipped Guild to CIDX['Guild'].garden=true (dispatching it to
   gardenDeck(), the necropolis-turned-hanging-garden's own treatment) and,
   alongside it, CIDX['Ancestry'].market=true. That second flag was already
   dead by the time this was caught: Ancestry is intercepted by name
   (`else if(c.n==='Ancestry') ancestryCanton(c)` in the CANTONS.forEach
   dispatch at the bottom of 50-cantons.js) before platCanton() — the only
   place a c.market flag is ever read — gets a turn at it, so it never did
   anything once the necropolis rebuild landed. Both flags are gone now.
   Guild is Guild again: c.guild dispatches it to its own guildHallsDeck()
   (50-cantons.js) — four craft-guild halls in its four quadrants plus a
   small local market at the centre, per the owner's brief. Ancestry stays
   the necropolis, untouched by any of this. */
CIDX['Guild'].guild = true;

/* --- CPIERS: one small-craft ferry pier off each of Palace, Temple, the
   market canton and Arena — the owner asked for exactly one per canton at
   its bottom tier, with an accompanying door (built in 50-cantons.js,
   using this same entry's `ry` so the door faces straight down the
   pier). Positions only, computed here (not in 50-cantons.js, where the
   market's piers used to live before this) because 40-ground.js reads the
   ground mask as a single snapshot right after its own painting runs,
   long before 50-cantons.js (fragment 50) would otherwise get a chance to
   populate this array — anything pushed to CPIERS after that snapshot is
   invisible to openAt(). 50-cantons.js's cantonPiers(c) only emits the
   plank geometry for entries already here; own reseed so this doesn't
   perturb the shared stream. `ry` uses the same atan2(dx,dz)-family
   convention as every other approach-angle this session (loc()'s local
   +x/forward maps to world (sin ry, cos ry)); for a world direction
   (cos a, sin a) that solves to ry = PI/2 - a. */
var CPIERS = [];
(function(){
  reseed(685102);
  /* real bug #1, found by screenshot after the owner flagged it: the old
     root radius (0.96r) undershoots the base tier's own footprint — tier
     0's own hw starts at c.r*0.97 and the plinth cap (c.r*1.07
     half-width) sits outside that again, so a flat plank at radius 0.96r
     was landing INSIDE tier 0's sloped wall, not at its foot. Fixed to a
     radius that clears the plinth cap — see clearR below.

     real bug #2, found the SAME way after the height fix (cantonPiers(),
     50-cantons.js) made it visible from directly above: a FIXED radius
     multiplier (was 1.12r) only clears a SQUARE cap along its own faces
     (0/90/180/270°). Palace/Temple/Ancestry all point south-east
     (a=PI/4) at the owner's own request — their corner, not a face — and
     a square's corner sits at capHw/cos(45°) = capHw*1.414 from centre,
     not capHw. 1.12r (< capHw*1.414 for any r) was landing the whole
     pier ON the cap, just barely above its surface, invisible from
     above and indistinguishable from "buried" up close. clearR below is
     the real, angle-general distance from a canton's centre to its own
     square cap's edge along ANY bearing a — reduces to the simple
     face-normal case at 0/90/180/270° and grows toward the *1.414
     corner case as a approaches 45°/135°/etc, so it is correct for
     Arena's own random angle too, not just the three SE ones. */
  var SE = Math.PI/4;
  ['Palace','Temple','Ancestry','Arena'].forEach(function(name){
    var c = CIDX[name];
    if(!c) return;
    var a = (name === 'Arena') ? rr(0, Math.PI*2) : SE;
    /* the owner's follow-up: the market/guild (Ancestry) dock reads as
       floating just past the walkway, not touching it. The +5 above was a
       clearance margin from real bug #1/#2 above — needed while the root
       could still land INSIDE the cap, useless once clearR is already an
       exact edge distance, and actively harmful: it left every pier's own
       root 5 units past the cap's true edge, open water the whole way,
       for all four cantons alike. -3 instead overlaps the cap very
       slightly so the plank's own near end reads as flush against the
       walkway rather than short of it. */
    var capHw = c.r*1.07;
    var clearR = capHw / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))) - 3;
    var rootX = c.x+Math.cos(a)*clearR, rootZ = c.z+Math.sin(a)*clearR;
    var outX = c.x+Math.cos(a)*(clearR+rr(40,64)), outZ = c.z+Math.sin(a)*(clearR+rr(40,64));
    CPIERS.push({ x0:rootX, z0:rootZ, x1:outX, z1:outZ, w:rr(6,9), cls:'quay', canton:name, ry:Math.PI/2-a });
  });
})();
window._cpiers = CPIERS;

/* --- attractors: anything that draws people, per the life-layer brief §6.
   `hours` stays null until the day cycle exists — the field goes in now so
   every future call site doesn't need retrofitting. Nothing consumes this
   yet; it only needs to exist. */
var ATTRACTORS = [];
DISTRICTS.forEach(function(d){
  var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  cx/=d.poly.length; cz/=d.poly.length;
  ATTRACTORS.push({ id:d.name, type:d.type, x:cx, z:cz, nx:0, nz:0,
                     weight: d.type==='funerary' ? 0.2 : 0.8, hours:null });
});
/* Guild's own c.market is gone (see CIDX['Guild'].guild above) — it hosts a
   small local market now, so 'market' is the honest type; Ancestry is the
   necropolis, 'funerary' rather than the old leftover 'park'/'market'
   guess. Still unconsumed (see the comment above), so this is bookkeeping
   accuracy for whenever it is, not a behaviour change. */
['Guild','Ancestry'].forEach(function(n){
  var c = CIDX[n];
  ATTRACTORS.push({ id:n, type: n==='Guild' ? 'market' : 'funerary', x:c.x, z:c.z, nx:0, nz:0, weight:0.8, hours:null });
});

/* --- bridges: a greedy non-crossing graph, so spans never tangle ---------- */
var SPANS = (function(){
  var pairs = [];
  for(var i=0;i<CANTONS.length;i++) for(var j=i+1;j<CANTONS.length;j++){
    var A=CANTONS[i], B=CANTONS[j];
    var d = Math.hypot(B.x-A.x, B.z-A.z) - A.r - B.r;   /* gap between edges */
    if(d < 560) pairs.push({ a:i, b:j, d:d });
  }
  pairs.sort(function(p,q){ return p.d - q.d; });
  var kept = [];
  pairs.forEach(function(p){
    var A=CANTONS[p.a], B=CANTONS[p.b];
    /* reject if the span would cross one already accepted */
    for(var k=0;k<kept.length;k++){
      var C=CANTONS[kept[k].a], D=CANTONS[kept[k].b];
      if(C===A||C===B||D===A||D===B) continue;
      if(segCross(A.x,A.z,B.x,B.z, C.x,C.z,D.x,D.z)) return;
    }
    /* reject if the span would pass through a third canton */
    for(var m=0;m<CANTONS.length;m++){
      var E=CANTONS[m]; if(E===A||E===B) continue;
      if(segDist(E.x,E.z, A.x,A.z, B.x,B.z) < E.r + 26) return;
    }
    kept.push(p);
  });
  return kept;
})();

/* --- causeways from the rim cantons to the nearest shore ------------------
   Six of these are solid reclaimed land rather than a deck on piers — see
   src/50-cantons.js. Ancestry and Port keep the ordinary bridge causeway. */
var RECLAIMED_CAUSEWAY = { Arsenal:1, Guild:1, Foreign:1, Granary:1, Market:1, Arena:1 };
var CAUSEWAYS = CANTONS.filter(function(c){ return c.s !== undefined; }).map(function(c){
  var s = c.s, lp = shoreIn(s, 26);
  if(polyDist(lp[0],lp[1],RIVER) < 170) s += (s > RIVER_S ? 1 : -1) * 260;
  return { c:c, s:s, solid: !!RECLAIMED_CAUSEWAY[c.n] };
});
/* the fortress ties back to the promontory shore the same way, but it is
   not shore-derived (its .s would fight the position-resolve step above), so
   it is appended here rather than picked up by the filter */
CAUSEWAYS.push({ c: CIDX['Fortress'], s: S_10, solid: true });

/* ============================== 6. THE MAINLAND SHORE ====================== */

/* the curtain wall encloses only the core, north of the river */
function wallOffset(s){
  var u = (s - WALL_S0) / (CITY_S1 - WALL_S0);
  return 470 + 78*Math.sin(u*9.1 + 0.6) + 44*Math.sin(u*17.3 - 1.2);
}
function wallDepth(x,z){                     /* >0 between waterfront and wall */
  var s = shoreS(x,z);
  if(s < WALL_S0 || s > CITY_S1) return -999;
  return wallOffset(s) - landDist(x,z);
}
function insideWall(x,z){ return wallDepth(x,z) > 0; }

/* --- zones along the coast ---------------------------------------------
   core   : inside the wall           warren : outside the wall, same stretch
   estate : south of the river, hugging the shore
   farm   : the floodplain beyond the estates and up the river valley       */
function zoneAt(x,z){
  var L = landDist(x,z);
  if(L < 20) return 'none';
  var s = shoreS(x,z);
  if(s >= WALL_S0 && s <= CITY_S1){
    var wd = wallOffset(s) - L;
    if(wd > 0) return 'core';
    if(wd > -520) return 'warren';
  }
  /* the warren also spills east and south-east of the wall's river corner,
     hugging the river's north bank — same crowded poor district, just not
     reachable by the wall's own arc-length addressing. How densely it builds
     there is a river-distance fade in 60-land.js, not this hard box. */
  if(x > 1400 && x < 2300 && z > 400 && z < 1400) return 'warren';
  /* past five o'clock: great semi-rural estates, then farmland to the south-west */
  if(s >= S_7 && s < S_5){
    if(L < 400) return 'manor';
    if(L < 900) return 'farm';
  }
  if(s >= S_5 && s < WALL_S0){
    if(L < 330) return 'estate';
    if(L < 1050) return 'farm';
  }
  /* past seven o'clock the hills come down to the water: huts on the strand,
     terraced orchards above */
  if(s >= S_10 && s < S_7){
    if(L < 150) return 'shorehut';
    if(L < 520) return 'orchard';
  }
  /* the river valley, east of the mouth */
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  if(rv.d < 760 && rv.t < 0.62 && x > 900) return 'farm';
  return 'none';
}
/* how hard the farmland thins with distance from the city */
function farmFade(x,z){
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  var byRiver = (1 - smooth(0.18, 0.62, rv.t));
  var s = shoreS(x,z);
  var bySW = (s < S_5 && s > S_7) ? (1 - smooth(0.30, 1.0, (S_5 - s)/(S_5 - S_7))) : 0;
  return Math.max(byRiver, bySW) * (1 - smooth(600, 1050, landDist(x,z))*0.5);
}

/* WALL and GATES used to be sampled here off the shore-offset curve
   (shoreIn(s, wallOffset(s))). The owner replaced that with an explicit
   point-designated wall: 17 tower vertices given directly in world (x,z),
   gates only where that line actually crosses a real road. Finding those
   crossings needs the FULL road graph (RNODE/REDGE), which does not exist
   yet at this point in the file — see "NEW CURTAIN WALL" near the end of
   this fragment, after buildRoadGraph()'s final call, where WALL and GATES
   are actually built. wallOffset/wallDepth/insideWall/zoneAt above are
   UNCHANGED and still define the core/warren zoning by arc length — that
   abstract boundary is a separate concept from the physical wall rebuilt
   below and was not part of the owner's request. */

/* --- roads: every polyline is clipped against the river corridor ----------- */
var ROADS = [];
function road(pts, w, cls){
  var run = [];
  for(var i=0;i<pts.length;i++){
    var p = pts[i];
    if(inRiver(p[0],p[1], 30)){ if(run.length > 1) ROADS.push({pts:run, w:w, cls:cls||'minor'}); run = []; }
    else run.push(p);
  }
  if(run.length > 1) ROADS.push({ pts:run, w:w, cls:cls||'minor' });
}
function shoreRoad(s0, s1, off, w, cls, wob, step){
  var p=[];
  for(var s=s0; s<=s1; s+=(step||30)) p.push(shoreIn(s, off + (wob||0)*Math.sin(s*0.0042)));
  road(p, w, cls);
}
/* --- organic wander: replaces a single lateral offset applied across a
   whole road (which is why radial families used to swap order and braid)
   with a small, short-wavelength deviation per resampled node. Amplitude
   this small relative to a 30-unit wavelength cannot flip two roads'
   relative order — "reads organic, cannot swap order" is the whole point. */
function resamplePath(pts, step){
  var out=[pts[0]], acc=0;
  for(var i=1;i<pts.length;i++){
    var ax=pts[i-1][0], az=pts[i-1][1], bx=pts[i][0], bz=pts[i][1];
    var segLen=Math.hypot(bx-ax,bz-az), pos=0;
    while(segLen-pos > step-acc){
      pos += step-acc;
      var t=pos/segLen;
      out.push([ax+(bx-ax)*t, az+(bz-az)*t]);
      acc=0;
    }
    acc += segLen-pos;
  }
  out.push(pts[pts.length-1]);
  return out;
}
function wanderPath(pts, amp, seed){
  var rs = resamplePath(pts, 20);
  var out = [];
  for(var i=0;i<rs.length;i++){
    var pa=rs[Math.max(0,i-1)], pb=rs[Math.min(rs.length-1,i+1)];
    var tx=pb[0]-pa[0], tz=pb[1]-pa[1], tl=Math.hypot(tx,tz)||1;
    var nx=-tz/tl, nz=tx/tl;
    var t = i*20;
    var off = amp * sig(t*0.033 + seed, seed*2.1 - t*0.011, 1);
    out.push([rs[i][0]+nx*off, rs[i][1]+nz*off]);
  }
  return out;
}

reseed(4242);
/* the quay road runs the whole inhabited coast, estates included */
shoreRoad(CITY_S0-120, CITY_S1+90, 32, 21, 'quay');
/* the walled core: streets parallel to the shore, boulevards, cross lanes */
[[96,15],[214,14],[342,14],[0,16]].forEach(function(cfg,i){
  var p=[];
  for(var s=WALL_S0+20; s<=CITY_S1-20; s+=34){
    var off = cfg[0] || (wallOffset(s)-76);
    p.push(shoreIn(s, off + 18*Math.sin(s*0.0042 + i*2.1)));
  }
  road(p, cfg[1], 'ring');
});
/* radial boulevards through the core, reaching out toward the wall — used
   to be one per old shore-derived gate; that array is gone (see "NEW
   CURTAIN WALL" below), but the boulevards themselves are still good
   network infrastructure regardless of where a gate ends up standing, so
   they're kept, now seeded off the same arc-length fractions directly
   rather than through a GATES object. Real wall gates (named or generic)
   are sited later wherever THIS network actually crosses the wall line —
   no separate wiring needed, exactly like the highways' own comment above. */
[0.10,0.27,0.44,0.60,0.76,0.91].forEach(function(u){
  var gs = mix(WALL_S0, CITY_S1, u);
  var gp = shoreIn(gs, wallOffset(gs));
  road([ shoreIn(gs + rr(-24,24), 38), shoreIn(gs + rr(-20,20), 214),
         shoreIn(gs + rr(-14,14), 342), gp,
         shoreIn(gs + rr(-60,60), wallOffset(gs) + 380) ], 19, 'boulevard');
});
(function(){
  /* core cross-lanes: a family of radials off the same shore stretch must
     not cross — each one's OUTER target is assigned first, the targets are
     sorted to match the seed order, and only then are the inner nodes
     interpolated between seed and target. That makes non-crossing a
     property of construction, not a hope; the old version picked one
     lateral drift (up to +-34*2.7 ~= +-92, versus a 62-unit minimum seed
     gap) that let adjacent radials swap order and braid. */
  var seeds = [];
  for(var s=WALL_S0+30; s<CITY_S1-30; s+=rr(62,118)) seeds.push(s);
  var targets = seeds.map(function(s0){ return s0 + rr(-40,40); });
  targets.sort(function(a,b){ return a-b; });
  seeds.forEach(function(s0, idx){
    var starget = targets[idx];
    var pts = [];
    for(var k=0;k<=5;k++){
      var t = k/5, sMid = mix(s0, starget, t);
      pts.push(shoreIn(sMid, mix(34, wallOffset(sMid)-76, t)));
    }
    road(wanderPath(pts, 6, s0*0.13), rr(8.5,12.5), 'minor');
  });
  /* the warren: concentric rings only. The old formal radial fan here (an
     s3 loop with +-80 lateral drift against a 48-unit minimum seed gap) is
     exactly the family that braided worst — deleted, not tuned. Warren
     radials are carved from blocks instead, after the graph exists: see
     "WARREN: BLOCK CARVING" below. */
  [140, 300, 450].forEach(function(extra,i){
    var p=[];
    for(var s2=WALL_S0+50; s2<=CITY_S1-50; s2+=38)
      p.push(shoreIn(s2, wallOffset(s2) + extra));
    road(wanderPath(p, 11, extra*0.7 + i), 10, 'minor');
  });
})();
/* the estates: a shore road, a back lane, and tracks between them */
shoreRoad(CITY_S0-140, WALL_S0, 150, 13, 'ring', 14);
shoreRoad(CITY_S0-100, WALL_S0, 330, 11, 'minor', 22);
(function(){
  var s = CITY_S0 - 60;
  while(s < WALL_S0 - 40){
    road([ shoreIn(s, 34), shoreIn(s+rr(-20,20), 150), shoreIn(s+rr(-40,40), 330),
           shoreIn(s+rr(-70,70), rr(520,760)) ], rr(7,10), 'minor');
    s += rr(90, 170);
  }
})();

reseed(4243);
/* the west road: past the manors, orchard terraces and the promontory shore
   — ground the estates' own network never reached, up to the Lighthouse
   causeway's landing near S_10 */
shoreRoad(S_10-180, CITY_S0-140, 130, 11, 'ring', 20, 34);
shoreRoad(S_10-180, CITY_S0-140, 320, 9, 'minor', 28, 40);
(function(){
  var s = S_10-140;
  while(s < CITY_S0-160){
    var w = rr(-30,30);
    road([ shoreIn(s,34), shoreIn(s+w,130), shoreIn(s+w*1.6,320),
           shoreIn(s+w*2.0, rr(420,600)) ], rr(6.5,9.5), 'minor');
    s += rr(90, 170);
  }
})();

/* the river road, both banks, out along the valley */
(function(){
  [1,-1].forEach(function(side){
    var p=[];
    for(var u=RIVER_HEAD-30; u<2600; u+=110){
      var q = riverAt(u), off = (riverHalf(q.x,q.z) + 48)*side;
      p.push([q.x + q.nx*off, q.z + q.nz*off]);
    }
    road(p, 12, 'minor');
  });
})();

/* ---- highways: long-haul roads reaching off the map, feeding the same
   road graph as every city street (buildRoadGraph() below processes ALL of
   ROADS together, so these get real intersections wherever they happen to
   cross existing roads near the city — no separate wiring needed) but
   deliberately NOT given their own side-street/block-carving treatment out
   in the wilderness, per the owner: "connect the roads into the road graph
   for the sake of the life layer later, but no need to extend side streets
   off these except maybe right next to the city." Nothing below adds a
   grid off of them; only the existing city network can meet them.

   Six, per the brief: NE hugs the lake shore (reusing shoreIn() exactly
   like the estate/west-road shore roads above, so it traces the real
   coastline at a fixed inset; "the low spot between hills" the owner asked
   for it to route through falls out of that for free, since every RIDGES
   entry sits set back from the shoreline, never on it); one runs south,
   one southwest, and one follows the river's own corridor east/southeast
   rather than striking out past it — checked by sampling terrainH first: a
   naive straight extension past the river's own last point climbs from
   h=-5 to h=213 in under 700 units (the hills that begin inland of the
   city, per terrainH()'s own comment, are right there), while 10-core.js
   keeps the river's floodplain deliberately flat, so hugging the river
   corridor instead of leaving it is what actually stays low. The last two,
   NW and NW: Abbey Close, replace the old shoreRoad(0,S_10-180,...) shore
   hug entirely — the owner gave two explicit point lists for "the
   northwest highway" across two follow-up messages and asked for the
   lowest-elevation path THROUGH them, not the old coast-hugging arc, so
   the compass label stays but the geography underneath it is new. See the
   comments on each road() call below for exactly how each was routed and
   why they're two separate calls rather than one polyline: the two point
   lists sit on opposite sides of the city (list 1 near the port/quay on
   the east shore, list 2 out at Abbey Close on the west shore) with no
   through-line the brief asks for ("no need to extend side streets off
   these except maybe right next to the city" — a cross-city bridge between
   them would be exactly that kind of unwanted extension), so each stretch
   just gets its own tie-in to the city grid instead, same as every other
   highway here. */
reseed(424242);
/* NE and SW/West: actually pathfound now, not hand-picked waypoints —
   the previous pass (shore-inset tweak, then a manually-drawn detour
   around one ridge) still wasn't good enough per the owner's follow-up.
   Built a proper lowest-elevation search instead: fetched a terrain-
   height grid (NE: parametrized by shore arc-length x inland offset,
   staying in a "hug the coast" corridor; SW: a plain x/z grid over the
   open country west of the city, no corridor assumption) via a one-shot
   probe against window._api.terrainH/landDist, then ran Dijkstra over it
   (multi-source from the city-adjacent edge, multi-sink at the far edge,
   underwater cells excluded, cost = average height of each hop) in a
   scratch Python script — not eyeballed, not guessed. Worst point on the
   whole NE route: h=14 (was spiking to 185 two passes ago). Worst point
   on the whole SW route within the kept range: h=65 (was 181). */
road([[1958,-1142],[2312,-1504],[2475,-1981],[2401,-2483],[2238,-2954],[2140,-3444],[1953,-3913],[1637,-4308],[1246,-4615],[1252,-5067]], 14, 'highway'); /* NE */
road([[300,1900],[250,2600],[150,3400],[60,3900]], 14, 'highway');   /* S */
/* the owner: "the west road does not connect to the street grid" — real
   gap, confirmed directly (not guessed): queried nearestStreet() from
   [-1180,2310] against every real city class (core/warren/boulevard/
   minor/ring/estate/manor, i.e. everything BUT this highway itself) on
   a live build and got 117.7 units to the nearest actual street — this
   segment's own city-end point just never crossed anything. Can't call
   nearestStreet() here to fix it live: the road graph (NSGRID/REDGE,
   built from the complete ROADS array) doesn't exist yet at this point
   in the file — the highways are laid down before the network they'd
   need to query is built. Same one-shot-probe methodology as the
   NE/SW pathfinding above (measured on the real build, not eyeballed):
   that nearest point was [-1129.3, 2203.8], a 'minor' warren street —
   prepended so this segment actually crosses into the grid instead of
   stopping short of it. */
road([[-1129.3,2203.8],[-1180,2310],[-1540,2310],[-1810,2310],[-2080,2130],[-2440,1770],[-2800,1590],[-3070,1590],[-3340,1590]], 14, 'highway'); /* SW/West */
(function(){                                                          /* E/SE, the river's south bank */
  var pts = [];
  for(var u=2600; u<=RIVER_CUM[RIVER_CUM.length-1]; u+=120){
    var q = riverAt(u), off = riverHalf(q.x,q.z) + 130;
    pts.push([ q.x - q.nx*off, q.z - q.nz*off ]);
  }
  road(pts, 14, 'highway');
})();
/* NW: the owner's own point list ("place a new northwest highway along
   these points going off map... follow the lowest elevation path between
   points"), pathfound the same way as NE/SW above — a plain x/z terrain-
   height grid per consecutive pair (no corridor assumption; this stretch
   runs inland through the RIDGES hills north-east of the port, nowhere
   near the shore) via the one-shot window._api.terrainH/landDist probe,
   Dijkstra'd (cost = average height of each hop, underwater cells
   excluded), then simplified. Checked against a plain straight line
   between each of the owner's own waypoints too: this terrain is
   genuinely hilly and dense with RIDGES entries the whole way (unlike the
   NE/SW passes, there was no nearby valley to detour into), so the gain
   over a straight line is real but modest — worst point on the whole
   route: h=237 (a straight line between the same waypoints: h=241).
   The owner's own last point, [1823.9,-1067.1], is the city-adjacent end
   — checked live the same way the SW/West gap above was: nearestStreet()
   from there found a 'quay' road only 69.7 units off at [1763.7,-1032.0],
   not an actual crossing, so that point is prepended to make sure this
   one actually ties into the grid instead of dead-ending near it. */
road([[1763.7,-1032.0],[1823.9,-1067.1],[2010,-1165.6],[2220,-1410.6],[2325,-1410.6],[2640,-1095.6],[2731.6,-1106.7],[2921.6,-951.7],[3361.6,-959],[3571.6,-1169],[3627,-1249.8],[3627,-1424.8],[3907,-1739.8],[3894.1,-2300.1],[3946.6,-2339.3],[3959.8,-3581.8]], 14, 'highway'); /* NW */
/* NW: Abbey Close — the owner's follow-up: "reroute northwest highway
   over the abbey close similarly per these points." This stretch sits on
   the opposite (west) shore from the NW route above, right where the old
   shoreRoad(0,S_10-180,...) used to run — that arc is what "similarly"
   refers back to and what this replaces for this stretch; see the
   district-paint fix in 40-ground.js for why it "is not currently
   visible" (the owner's own words) even though a highway has been running
   through here all along. Same probe+Dijkstra methodology as NW above,
   but the whole area is close to the lake and nearly flat (h~2-4
   everywhere sampled), so there wasn't a meaningfully lower path to find
   — worst point on the whole route: h=4.2, right at the owner's own first
   point. Both ends checked live against nearestStreet() (excluding the
   highway class itself, since that's the old arc being replaced): real
   gaps of 136 and 357 units to the nearest 'minor'/'ring' streets — this
   stretch is genuinely off on its own out at the Close, nothing else
   nearby to butt up against — so both nearestStreet() points are
   prepended/appended the same way, rather than leaving either end
   dead-ending in the park. */
road([[-1319.4,-525.3],[-1367.9,-652.7],[-1247.9,-652.7],[-1187.9,-622.7],[-1161.3,-589.5],[-1071.3,-544.5],[-1048.7,-513.1],[-913.7,-453.1],[-842.4,-373.8],[-1183.0,-267.8]], 14, 'highway'); /* NW: Abbey Close */
/* NW: Abbey Close extension — the owner's follow-up: "extend NW highway
   from [-1367.5,-649.6] to the edge of the map following lowest
   elevation, but leaving house sized buffer between highway and lake."
   [-1367.5,-649.6] matches this same segment's own 2nd point above
   (-1367.9,-652.7, rounding) — the "loose" end that never continued
   anywhere past the Close itself. Same probe methodology as the other
   highways (window._api.terrainH/landDist, sampled live against the real
   build): fanned out headings 200-260 degrees from that point checking
   both worst elevation AND landDist staying above a 25-unit buffer the
   whole way (a real house footprint, not a guessed margin) — most
   headings past ~222 degrees cut the buffer at some point along the way
   (curve back toward the shore) or climb into much higher hill country;
   200-220 degrees all cleared the buffer everywhere, and 220 was the
   lowest of those (worst point h=157, vs. h=184-197 for 200-215). A
   straight run, not a curve — the whole corridor at this heading is
   already close to monotonically low, nothing to route around. Stops at
   r=3600 along that heading, (-4125.3,-2963.6): total distance from world
   centre ~5079, safely inside HW (WORLD/2=5400) without crowding the
   actual edge. */
road([[-1367.5,-649.6],[-1827.1,-1035.3],[-2133.5,-1292.4],[-2746.4,-1806.6],[-3206.0,-2192.3],[-3665.6,-2578.0],[-4125.3,-2963.6]], 14, 'highway'); /* NW: Abbey Close extension */

/* ============================== 5b. WARREN: BLOCK CARVING ==================
   The warren's old radial fan is gone (see above); alleys are carved from
   blocks instead, the way a slum actually grows. Rasterize the warren zone
   against every current road, flood-fill the open cells into blocks, and
   chord any block over the target area — a few passes, each one only
   re-cutting whatever the previous pass left oversized, rather than one
   full re-rasterize per single cut (which would be the same result far more
   slowly). Cuts land roughly through a block's own middle third, so a child
   block landing under the ~700 floor is the rare case, not the rule; the
   block-area histogram logged below is how that gets checked, not assumed. */
reseed(42431);
(function carveWarrenBlocks(){
  var CELL = 8;
  function rasterize(){
    var minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
    for(var s=WALL_S0; s<=CITY_S1; s+=25){
      [shoreIn(s,-10), shoreIn(s,540)].forEach(function(p){
        minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]);
        minZ=Math.min(minZ,p[1]); maxZ=Math.max(maxZ,p[1]);
      });
    }
    var W=Math.max(1,Math.ceil((maxX-minX)/CELL))+2, H=Math.max(1,Math.ceil((maxZ-minZ)/CELL))+2;
    var grid = new Uint8Array(W*H);
    for(var i=0;i<W;i++) for(var j=0;j<H;j++){
      var x=minX+(i+0.5)*CELL, z=minZ+(j+0.5)*CELL;
      grid[j*W+i] = (zoneAt(x,z)==='warren') ? 0 : 2;
    }
    function markSeg(ax,az,bx,bz,halfW){
      var len=Math.hypot(bx-ax,bz-az), steps=Math.max(1,Math.ceil(len/(CELL*0.6)));
      for(var k=0;k<=steps;k++){
        var t=k/steps, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
        var rc=Math.ceil(halfW/CELL)+1, cx=Math.floor((x-minX)/CELL), cz=Math.floor((z-minZ)/CELL);
        for(var di=-rc;di<=rc;di++) for(var dj=-rc;dj<=rc;dj++){
          var i2=cx+di, j2=cz+dj;
          if(i2<0||j2<0||i2>=W||j2>=H) continue;
          if(Math.hypot(di*CELL,dj*CELL)<=halfW+CELL*0.7) grid[j2*W+i2]=1;
        }
      }
    }
    ROADS.forEach(function(rd){
      /* +3 padding beyond the road's own half-width: without it, tight
         junctions between close-but-not-touching corridors leave thin
         slivers of "open" cells that are rasterization gaps, not real
         block interior — they were the whole of the sub-700 problem below,
         not anything carveChord's own child-size rejection could see. */
      for(var i=0;i<rd.pts.length-1;i++) markSeg(rd.pts[i][0],rd.pts[i][1],rd.pts[i+1][0],rd.pts[i+1][1], rd.w*0.5+3);
    });
    return {grid:grid, W:W, H:H, minX:minX, minZ:minZ};
  }
  function findBlocks(R){
    var grid=R.grid, W=R.W, H=R.H, seen=new Uint8Array(W*H), blocks=[];
    for(var j=0;j<H;j++) for(var i=0;i<W;i++){
      var id=j*W+i;
      if(grid[id]!==0 || seen[id]) continue;
      var stack=[id], cells=[];
      seen[id]=1;
      while(stack.length){
        var cur=stack.pop(); cells.push(cur);
        var ci0=cur%W, cj0=(cur-ci0)/W;
        [[ci0+1,cj0],[ci0-1,cj0],[ci0,cj0+1],[ci0,cj0-1]].forEach(function(nb){
          var ni=nb[0], nj=nb[1];
          if(ni<0||nj<0||ni>=W||nj>=H) return;
          var nid=nj*W+ni;
          if(grid[nid]===0 && !seen[nid]){ seen[nid]=1; stack.push(nid); }
        });
      }
      blocks.push(cells);
    }
    return blocks;
  }
  function carveChord(cells, R){
    var W=R.W, minI=1e9,maxI=-1e9,minJ=1e9,maxJ=-1e9, cellSet={};
    cells.forEach(function(id){
      var i=id%W, j=(id-i)/W;
      cellSet[id]=1;
      if(i<minI)minI=i; if(i>maxI)maxI=i;
      if(j<minJ)minJ=j; if(j>maxJ)maxJ=j;
    });
    var wide = (maxI-minI) >= (maxJ-minJ), a=null, b=null, cutAt=null;
    if(wide){
      var midI = Math.round(mix(minI,maxI, 0.35+rnd()*0.3));
      var top=null,bot=null;
      for(var j=minJ;j<=maxJ;j++){ if(cellSet[j*W+midI]){ if(top===null) top=j; bot=j; } }
      if(top===null || bot-top<3) return null;
      a=[R.minX+(midI+0.5)*CELL, R.minZ+(top+0.5)*CELL];
      b=[R.minX+(midI+0.5)*CELL, R.minZ+(bot+0.5)*CELL];
      cutAt = midI;
    }else{
      var midJ = Math.round(mix(minJ,maxJ, 0.35+rnd()*0.3));
      var left=null,right=null;
      for(var i=minI;i<=maxI;i++){ if(cellSet[midJ*W+i]){ if(left===null) left=i; right=i; } }
      if(left===null || right-left<3) return null;
      a=[R.minX+(left+0.5)*CELL, R.minZ+(midJ+0.5)*CELL];
      b=[R.minX+(right+0.5)*CELL, R.minZ+(midJ+0.5)*CELL];
      cutAt = midJ;
    }
    /* reject a chord that would leave either side under the ~700 floor —
       "reject chords ... that would produce ... a child block under ~700"
       per the brief. Estimated from the cell split, not a re-flood-fill,
       since this runs inside the per-block carve candidate loop. */
    var sideA=0, sideB=0;
    cells.forEach(function(id){
      var i=id%W, j=(id-i)/W, v = wide ? i : j;
      if(v<cutAt) sideA++; else if(v>cutAt) sideB++;
    });
    if(Math.min(sideA,sideB)*CELL*CELL < 900) return null;
    return {a:a, b:b};
  }
  for(var pass=0; pass<5; pass++){
    var R = rasterize();
    var blocks = findBlocks(R);
    var cuts = [];
    blocks.forEach(function(cells){
      var area = cells.length*CELL*CELL;
      if(area <= 4200) return;
      var chord = carveChord(cells, R);
      if(!chord) return;
      var len = Math.hypot(chord.b[0]-chord.a[0], chord.b[1]-chord.a[1]);
      if(len < 10) return;
      cuts.push(chord);
    });
    if(!cuts.length) break;
    cuts.forEach(function(c){ road([c.a, c.b], rr(4,8), 'minor'); });
  }
  /* one more rasterize/flood-fill for the block-area histogram the owner
     asked to see logged, over the final carved state */
  var RF = rasterize(), finalBlocks = findBlocks(RF);
  var areas = finalBlocks.map(function(c){ return c.length*CELL*CELL; }).sort(function(a,b){return a-b;});
  window._warrenBlocks = {
    n: areas.length,
    median: areas.length ? areas[Math.floor(areas.length/2)] : 0,
    p90: areas.length ? areas[Math.floor(areas.length*0.9)] : 0,
    min: areas.length ? areas[0] : 0,
    under700: areas.filter(function(a){ return a<700; }).length
  };
})();

/* ============================== 5c. ROAD GRAPH ==============================
   Snap endpoints into shared nodes, compute every polyline x polyline
   intersection, insert a node there and split both segments — an unresolved
   crossing is the mud, a resolved one is a junction. Reusable so it can run
   again after the warren tangle below adds more edges. */
/* ROADX — graph-only polylines. Real, already-built walkable decks that
   carry no PAINTED road surface: the canton causeways (50-cantons.js), the
   canton-to-canton bridge spans (SPANS) and the two river bridges
   (RBRIDGES). Measured directly (flood fill over the finished graph, live
   in the page): without these the road graph is 117 components, the two
   largest being 1646 nodes north of the river and 496 south — i.e. the two
   RIVER BANKS, joined in the real world by two rendered bridges that the
   graph had never heard of, and every canton floating entirely off-graph.
   That is the whole of the owner's report 1 ("a line of ordinators keeps
   trying to path across the bay"): the ordinator ring patrol starts at the
   Fortress canton's own gate edge, whose nearest ROAD node was 870 units
   away on the FAR (south) bank with 41 of 41 samples of that connector
   underwater, and lifeRoadPath() then failed outright so the whole leg fell
   back to raw cross-country land avoidance.
   Kept OUT of ROADS deliberately: ROADS is what 40-ground.js paints into
   the ground/mask canvases, and a causeway or bridge deck is drawn by
   50-cantons.js as real geometry above the water — painting a road stripe
   for it would smear a street across the bay. Zero draw calls, zero
   triangles, zero instances: this only ever becomes RNODE/REDGE entries. */
var ROADS_X = [];
function roadx(pts, w, cls){ ROADS_X.push({ pts:pts, w:w, cls:cls, deck:true }); }
var RNODE = [], REDGE = [];
function buildRoadGraph(){
  RNODE.length = 0; REDGE.length = 0;
  var SNAP = 8, NGC = 16, NG = {};
  function nkey(i,j){ return i+','+j; }
  function nodeAt(x,z){
    var ci=Math.floor(x/NGC), cj=Math.floor(z/NGC);
    for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
      var arr = NG[nkey(ci+di,cj+dj)];
      if(!arr) continue;
      for(var k=0;k<arr.length;k++){
        var n = RNODE[arr[k]], dx=x-n.x, dz=z-n.z;
        if(dx*dx+dz*dz < SNAP*SNAP) return arr[k];
      }
    }
    var ni = RNODE.length;
    RNODE.push({x:x, z:z, deg:0});
    (NG[nkey(ci,cj)] || (NG[nkey(ci,cj)]=[])).push(ni);
    return ni;
  }
  var segs = [];
  /* ROADS first, then the graph-only decks (ROADS_X) — one shared index
     space so `road:rdIdx` stays unique and the "a road doesn't cross
     itself" test below still means what it says. */
  ROADS.concat(ROADS_X).forEach(function(rd, rdIdx){
    for(var i=0;i<rd.pts.length-1;i++){
      var a = nodeAt(rd.pts[i][0], rd.pts[i][1]);
      var b = nodeAt(rd.pts[i+1][0], rd.pts[i+1][1]);
      if(a!==b) segs.push({a:a, b:b, w:rd.w, cls:rd.cls, road:rdIdx, deck:rd.deck});
    }
  });
  var SGC = 48, SG = {};
  function skey(i,j){ return i+'_'+j; }
  segs.forEach(function(s, idx){
    var A=RNODE[s.a], B=RNODE[s.b];
    var i0=Math.floor(Math.min(A.x,B.x)/SGC), i1=Math.floor(Math.max(A.x,B.x)/SGC);
    var j0=Math.floor(Math.min(A.z,B.z)/SGC), j1=Math.floor(Math.max(A.z,B.z)/SGC);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++)
      (SG[skey(i,j)] || (SG[skey(i,j)]=[])).push(idx);
  });
  function segXseg(A,B,C,D){
    var r1x=B.x-A.x, r1z=B.z-A.z, r2x=D.x-C.x, r2z=D.z-C.z;
    var denom = r1x*r2z - r1z*r2x;
    if(Math.abs(denom) < 1e-9) return null;
    var t = ((C.x-A.x)*r2z - (C.z-A.z)*r2x) / denom;
    var u = ((C.x-A.x)*r1z - (C.z-A.z)*r1x) / denom;
    if(t<=0.02||t>=0.98||u<=0.02||u>=0.98) return null;
    var dot = r1x*r2x+r1z*r2z, cross = r1x*r2z-r1z*r2x;
    var ang = Math.abs(Math.atan2(cross,dot)) * 180/Math.PI;
    if(ang>90) ang = 180-ang;
    return { t:t, u:u, x:A.x+r1x*t, z:A.z+r1z*t, angle:ang };
  }
  var cutsFor = segs.map(function(){ return []; });
  var pairSeen = {}, culled = {};
  window._crossings = { core:0, warren:0, coreSub35:0, warrenSub28:0, culledShallow:0, culledParallel:0 };
  for(var ck in SG){
    var arr = SG[ck];
    for(var a=0;a<arr.length;a++) for(var b=a+1;b<arr.length;b++){
      var i1=arr[a], i2=arr[b];
      var pk = i1<i2 ? skey(i1,i2) : skey(i2,i1);
      if(pairSeen[pk]) continue; pairSeen[pk]=1;
      var s1=segs[i1], s2=segs[i2];
      if(s1.a===s2.a||s1.a===s2.b||s1.b===s2.a||s1.b===s2.b) continue;
      if(s1.road === s2.road) continue;   /* a road doesn't cross itself */
      var A=RNODE[s1.a],B=RNODE[s1.b],C=RNODE[s2.a],D=RNODE[s2.b];
      var hit = segXseg(A,B,C,D);
      if(hit){
        var zn = zoneAt(hit.x, hit.z);
        var lim = zn==='warren' ? 28 : 35;
        if(hit.angle < lim){
          /* a genuine but too-shallow crossing: cull the narrower approach
             rather than record a junction that reads as a smear. A local
             dead-end from this is the accepted trade-off — the alternative
             (steepening one road's local path) risks a NEW crossing nearby.
             A DECK (causeway/bridge span, ROADS_X above) is never culled:
             it paints nothing, so it can't smear anything, and culling it
             would silently re-open the river/canton gaps it exists to
             close — cull the ordinary road instead, or neither. */
          if(s1.deck && s2.deck){ /* two decks meeting: keep both */ }
          else if(s1.deck) culled[i2]=1;
          else if(s2.deck) culled[i1]=1;
          else if(s1.w<=s2.w) culled[i1]=1; else culled[i2]=1;
          window._crossings.culledShallow++;
          continue;
        }
        cutsFor[i1].push({t:hit.t, x:hit.x, z:hit.z, angle:hit.angle});
        cutsFor[i2].push({t:hit.u, x:hit.x, z:hit.z, angle:hit.angle});
        if(zn==='warren') window._crossings.warren++; else window._crossings.core++;
        continue;
      }
      /* near-parallel running (no crossing at all): two corridors within
         1.5x the wider width, over a span long enough to read as one smear
         rather than two streets — drop the narrower. Only between DIFFERENT
         roads: two non-adjacent segments a few steps apart on the SAME
         gently-wandering road are near-collinear (perp distance ~0) by
         construction, not two streets running alongside each other — that
         false positive was culling roads against themselves. */
      if(s1.road === s2.road) continue;
      if(culled[i1]||culled[i2]) continue;
      var t1x=B.x-A.x,t1z=B.z-A.z,l1=Math.hypot(t1x,t1z)||1; t1x/=l1; t1z/=l1;
      var t2x=D.x-C.x,t2z=D.z-C.z,l2=Math.hypot(t2x,t2z)||1; t2x/=l2; t2z/=l2;
      if(Math.abs(t1x*t2x+t1z*t2z) < Math.cos(15*Math.PI/180)) continue;
      var perp1=Math.abs((C.x-A.x)*t1z-(C.z-A.z)*t1x), perp2=Math.abs((D.x-A.x)*t1z-(D.z-A.z)*t1x);
      var maxW = Math.max(s1.w,s2.w);
      if((perp1+perp2)/2 > maxW*1.5) continue;
      if(Math.min(l1,l2) < 15) continue;
      if(s1.deck || s2.deck) continue;   /* decks paint nothing — they can't read as a smear, so never cull one (see the shallow-crossing branch above) */
      if(s1.w<=s2.w) culled[i1]=1; else culled[i2]=1;
      window._crossings.culledParallel++;
    }
  }
  segs.forEach(function(s, idx){
    if(culled[idx]) return;
    var cuts = cutsFor[idx];
    if(!cuts.length){ REDGE.push({a:s.a, b:s.b, w:s.w, cls:s.cls, deck:s.deck}); return; }
    cuts.sort(function(p,q){ return p.t-q.t; });
    var prev = s.a;
    cuts.forEach(function(c){
      var mid = nodeAt(c.x, c.z);
      if(mid !== prev) REDGE.push({a:prev, b:mid, w:s.w, cls:s.cls, deck:s.deck});
      prev = mid;
    });
    if(prev !== s.b) REDGE.push({a:prev, b:s.b, w:s.w, cls:s.cls, deck:s.deck});
  });
  REDGE.forEach(function(e){ RNODE[e.a].deg++; RNODE[e.b].deg++; });
}
buildRoadGraph();

/* ============================== 5d. WARREN: TANGLE ==========================
   A carved-but-otherwise-regular block grid still doesn't read as a slum —
   add the things that make one confusing-by-design: blind spurs, shortcuts
   between lanes that are close in space but far apart along the network,
   and a few pinch points where an alley narrows to almost nothing. */
var WARREN_DEADENDS = 0;
(function addWarrenTangle(){
  var warrenNodes = [];
  RNODE.forEach(function(n, idx){
    if(zoneAt(n.x, n.z) === 'warren') warrenNodes.push(idx);
  });
  /* dead-end spurs: ~25% of warren nodes get a blind stub into a block */
  warrenNodes.forEach(function(ni){
    if(!chance(0.25)) return;
    var n = RNODE[ni];
    var a = rnd()*Math.PI*2, len = rr(15,45);
    var ex = n.x + Math.cos(a)*len, ez = n.z + Math.sin(a)*len;
    if(zoneAt(ex,ez) !== 'warren') return;
    road([[n.x,n.z],[ex,ez]], rr(4,7), 'minor');
    WARREN_DEADENDS++;
  });
  /* shortcut links: node pairs close in space but far apart in the graph —
     approximated by a bounded BFS instead of full Dijkstra for every pair,
     since all that matters is "more than a handful of hops away". Backed by
     an adjacency list, not a REDGE scan per step — this runs per candidate
     pair, so an O(edges) scan per BFS step would be O(pairs*edges*depth). */
  var ADJ = RNODE.map(function(){ return []; });
  REDGE.forEach(function(e){ ADJ[e.a].push(e.b); ADJ[e.b].push(e.a); });
  function hopsWithin(startI, limit, targetI){
    var seen = {}; seen[startI]=0;
    var q=[startI], head=0;
    while(head<q.length){
      var cur=q[head++], d=seen[cur];
      if(d>=limit) continue;
      var nbrs = ADJ[cur];
      for(var k=0;k<nbrs.length;k++){
        var nb = nbrs[k];
        if(seen[nb]!==undefined) continue;
        seen[nb]=d+1;
        if(nb===targetI) return d+1;
        q.push(nb);
      }
    }
    return seen[targetI]!==undefined ? seen[targetI] : Infinity;
  }
  var linksAdded = 0, tried = 0;
  outer:
  for(var i=0;i<warrenNodes.length;i+=3){
    if(linksAdded>=60 || tried>=4000) break;
    var ni = warrenNodes[i];
    for(var j=i+5;j<warrenNodes.length;j+=7){
      if(linksAdded>=60 || tried>=4000) break outer;
      tried++;
      var nj = warrenNodes[j];
      var A=RNODE[ni], B=RNODE[nj];
      var d = Math.hypot(A.x-B.x, A.z-B.z);
      if(d>60 || d<12) continue;
      if(hopsWithin(ni, 6, nj) <= 6) continue;   // already close along the graph
      road([[A.x,A.z],[B.x,B.z]], rr(4,6), 'minor');
      linksAdded++;
    }
  }
  /* pinch points: taper ~15% of warren 'minor' roads to a narrow waist at
     midspan by splitting them into three sub-segments */
  var warrenRoads = ROADS.filter(function(rd){
    if(rd.cls!=='minor' || rd.pts.length<2) return false;
    var mid = rd.pts[Math.floor(rd.pts.length/2)];
    return zoneAt(mid[0],mid[1])==='warren';
  });
  warrenRoads.forEach(function(rd){
    if(!chance(0.15) || rd.pts.length<3) return;
    var mi = Math.floor(rd.pts.length/2);
    var pinchW = rr(3,5);
    rd.w = Math.max(rd.w, 6);   // the ends read normally; only the spliced middle narrows
    var before = rd.pts.slice(0, mi+1), after = rd.pts.slice(mi);
    ROADS.push({ pts: before, w: rd.w, cls: rd.cls });
    ROADS.push({ pts: after,  w: rd.w, cls: rd.cls });
    ROADS.push({ pts: [rd.pts[Math.max(0,mi-1)], rd.pts[mi], rd.pts[Math.min(rd.pts.length-1,mi+1)]],
                 w: pinchW, cls: rd.cls });
    rd.pts = [];   // neuter the original so it doesn't double-paint the middle
  });
  ROADS = ROADS.filter(function(rd){ return rd.pts.length>1; });
})();
window._warrenDeadEnds = WARREN_DEADENDS;

/* dead-end stitching, citywide — the owner: "caravans still occasionally
   trying to swim and trying to climb the hill." Traced a real caravan's
   full curve (78-life.js instrumentation) and found lifeRoadPath()
   failing outright for a spawn-to-harbor route: the SW highway's own
   471-node component (correctly built, correctly followed) never
   reaches the other ~1800 nodes of the city graph at all, so every long
   route from that spawn falls back to raw land-avoidance, cutting
   straight over open hill country. The actual graph GAP: two real road
   endpoints only ~21.7 units apart (well under a block, at 877.8,1742.7
   and 897.2,1752.5 — checked live against a real build, not guessed) but
   sitting in totally disconnected components — in an 'estate' zone,
   which the warren-only shortcut pass just above never looks at (it
   filters to zoneAt()==='warren' explicitly). Same two-sided test that
   pass already uses (a real spatial gap, but far apart — here,
   disconnected — along the graph itself), just zone-agnostic and scoped
   to actual dead ends (degree 1) rather than sampling arbitrary node
   pairs, so it only ever closes a genuine "this stub should have met
   that stub" gap, not invent a new shortcut across town. */
(function stitchDeadEnds(){
  var ADJ2 = RNODE.map(function(){ return []; });
  REDGE.forEach(function(e){ ADJ2[e.a].push(e.b); ADJ2[e.b].push(e.a); });
  function hopsWithin2(startI, limit, targetI){
    var seen = {}; seen[startI]=0;
    var q=[startI], head=0;
    while(head<q.length){
      var cur=q[head++], d=seen[cur];
      if(d>=limit) continue;
      var nbrs = ADJ2[cur];
      for(var k=0;k<nbrs.length;k++){
        var nb = nbrs[k];
        if(seen[nb]!==undefined) continue;
        seen[nb]=d+1;
        if(nb===targetI) return d+1;
        q.push(nb);
      }
    }
    return seen[targetI]!==undefined ? seen[targetI] : Infinity;
  }
  var deadEnds = [];
  RNODE.forEach(function(n,i){ if(n.deg===1) deadEnds.push(i); });
  var stitched = 0;
  deadEnds.forEach(function(ni){
    if(stitched>=400) return;
    var A = RNODE[ni];
    var bestJ = -1, bestD = Infinity;
    for(var j=0;j<RNODE.length;j++){
      if(j===ni) continue;
      var B = RNODE[j], d = Math.hypot(A.x-B.x, A.z-B.z);
      if(d>=3 && d<=30 && d<bestD){ bestD = d; bestJ = j; }
    }
    if(bestJ<0) return;
    if(hopsWithin2(ni, 6, bestJ) <= 6) return;   /* already close along the graph */
    var B = RNODE[bestJ];
    road([[A.x,A.z],[B.x,B.z]], rr(4,6), 'minor');
    stitched++;
  });
  window._deadEndStitch = stitched;
})();

/* the ONE remaining real gap the stitching pass above can't safely close
   itself (its own search caps at 30 units so it never invents a long
   "phantom road" out of a coincidence): re-checked live after stitching,
   the SW/West highway's whole 473-node component still doesn't reach the
   rest of the city graph at all, and its own nearest live (deg>0) point
   on the far side is 99.1 units away at (3217.47,2188.63) from
   (3204.08,2090.43) — both real dead-end road tips, not guessed. Sampled
   the straight line between them (window._api.terrainH, live): h=7..28
   throughout, dry land, no water/hills — a safe, ordinary connector, not
   a shortcut punched through terrain. This is what actually lets
   lifeRoadPath() (78-life.js) find a real, all-road route for the far
   west spawn's own caravans/patrols instead of falling back to raw
   land-avoidance for the whole leg. */
road([[3204.08,2090.43],[3217.47,2188.63]], 6, 'minor');

/* owner: "can you move them to [[2758.5,-715.3],[2547.4,-840.9],
   [2728.4,-925.8]]?" — the quarries (71-industry.js) moved right across the
   map, from positive z to negative, so the old connector road (which ran
   from a 'boulevard' point at (1840.10,562.22) out to the three old
   positive-z sites) is gone entirely rather than left orphaned pointing at
   nothing, and this is its replacement.

   Same situation and same method as before: these sites sit well outside
   CITY_LIM in real wilderness hillside, and nearestStreet()/NSGRID don't
   exist yet at this point in the file, so the nearest MAJOR-class
   (quay/boulevard/ring/highway) point was found with a one-shot live probe
   instead (window._api.ROADS, real point-on-segment distance, not
   vertex-only). The answer this time is much closer and is a HIGHWAY, not a
   boulevard: 142.2 / 271.0 / 287.2 units off the three sites, all on the
   segment (2731.6,-1106.7)->(2921.6,-951.7). The crossing point used below
   is (2873.90,-990.60), i.e. t=0.749 along that segment.

   Every leg was sampled live at ~12-unit steps (window._api.terrainH /
   inRiver / landDist): 0 wet samples anywhere — the whole approach is dry
   upland, nothing crosses water or the river corridor, which is what the
   old (positive-z) route had to detour around. The h>95 hill-climbing test
   that rejected legs on the old route does NOT discriminate here and was
   not applied blindly: this entire plateau sits at h=103..164, so every
   sample is over 95 by definition. What was measured instead is the real
   GRADIENT along each leg, which is what that test was proxying for — 0.17
   / 0.13 / 0.12 over the three legs, gentler than the hillsides the city's
   own ring roads already climb.

   Routing is set by the pits themselves. The three sites are only 199.9 /
   212.6 / 245.6 units apart and each quarry is a 132-wide pit ringed by
   spoil aprons, so a road cannot simply run centre-to-centre: it threads
   the corridors BETWEEN them. Every vertex below was checked against real
   point-to-segment distance from all three pit centres — the closest any
   leg comes to a pit centre is 103.1, comfortably outside the rim (66) and
   its aprons. (2743.5,-820.6) is the midpoint of the quarry-1/quarry-3 gap
   and serves as the gate for both; (2654.8,-829.7) is quarry 2's gate.
   71-industry.js repeats these three gate points so each pit can aim its
   haul-ramp toe at the road; the two files have to agree.

   It starts 35 units on the far side of the highway rather than on it:
   buildRoadGraph()'s junction test (segXseg) only cuts a node where BOTH
   parameters land strictly inside (0.02,0.98), so a polyline that merely
   BEGINS on another road's segment makes no junction at all and would
   stand as its own graph component. Crossing it properly, at 61 degrees
   (well over the 35-degree shallow-crossing cull), is what actually joins
   this road to the network. 'minor' class: a real access road, not itself
   another major route. */
road([[2880.1,-1025.0],[2845.0,-830.0],[2743.5,-820.6],[2654.8,-829.7]], 7, 'minor');

/* rebuild once more so the graph — and nearestStreet() below — reflect the
   tangle too, not just the carved blocks */
buildRoadGraph();

/* ============================== 5e. NEAREST STREET ===========================
   (x,z) -> {dist, point, tangent, cls, width} against the final graph, via a
   uniform spatial grid over segment bounding boxes. faceStreet() in
   60-land.js reads this for real street tangents instead of inferring
   orientation from openAt()'s raster shadow. */
var NSGC = 40, NSGRID = {};
/* a named, re-runnable function rather than a one-shot IIFE: the road graph
   is rebuilt one more time further down (the deck network + the
   connectivity stitch pass, section 5g), and a stale index built off the
   previous REDGE array would index edges that no longer exist. */
function buildNearestStreetIndex(){
  NSGRID = {};
  function nkey(i,j){ return i+'_'+j; }
  REDGE.forEach(function(e, idx){
    var A=RNODE[e.a], B=RNODE[e.b];
    var i0=Math.floor(Math.min(A.x,B.x)/NSGC)-1, i1=Math.floor(Math.max(A.x,B.x)/NSGC)+1;
    var j0=Math.floor(Math.min(A.z,B.z)/NSGC)-1, j1=Math.floor(Math.max(A.z,B.z)/NSGC)+1;
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++)
      (NSGRID[nkey(i,j)] || (NSGRID[nkey(i,j)]=[])).push(idx);
  });
}
buildNearestStreetIndex();
function nearestStreet(x,z,clsFilter){
  var ci=Math.floor(x/NSGC), cj=Math.floor(z/NSGC), best=null, bd=1e18;
  for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
    var arr = NSGRID[(ci+di)+'_'+(cj+dj)];
    if(!arr) continue;
    for(var k=0;k<arr.length;k++){
      var e = REDGE[arr[k]];
      if(clsFilter && !clsFilter[e.cls]) continue;
      /* a DECK edge (causeway/bridge, ROADS_X) is invisible on the ground —
         it paints no surface — so an UNFILTERED nearestStreet() must not
         return one: faceStreet() (60-land.js) would turn a shore building
         to face a causeway that isn't drawn where it stands, and the
         curtain-wall gate siting would count it as a crossing. Only a
         caller that names the class explicitly (78-life.js's own
         {bridge:true,causeway:true} span exemption) ever sees them. */
      if(e.deck && !clsFilter) continue;
      var A=RNODE[e.a], B=RNODE[e.b];
      var dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz;
      var t = L2 ? clamp(((x-A.x)*dx+(z-A.z)*dz)/L2, 0, 1) : 0;
      var px=A.x+dx*t, pz=A.z+dz*t, d=Math.hypot(x-px,z-pz);
      if(d<bd){ bd=d; best={dist:d, point:[px,pz], tangent:[dx,dz], cls:e.cls, width:e.w}; }
    }
  }
  if(best){
    var tl = Math.hypot(best.tangent[0],best.tangent[1]) || 1;
    best.tangent = [best.tangent[0]/tl, best.tangent[1]/tl];
  }
  return best;
}

/* ============================== 5f. ROAD METRICS ==============================
   Logged once here so the planner can check the acceptance numbers without
   re-deriving them from a screenshot. */
window._roadGraph = {
  nodes: RNODE.length, edges: REDGE.length,
  crossings: window._crossings, warrenBlocks: window._warrenBlocks,
  warrenDeadEnds: window._warrenDeadEnds
};

/* --- the two river bridges: one at the mouth, one upstream ---------------- */
var RBRIDGES = [];
(function(){
  [RIVER_HEAD + 70, RIVER_HEAD + 330].forEach(function(up, k){
    var p = riverAt(up), half = riverHalf(p.x,p.z) + 34;
    RBRIDGES.push({ x:p.x, z:p.z, ax:p.x+p.nx*half, az:p.z+p.nz*half,
                    bx:p.x-p.nx*half, bz:p.z-p.nz*half, w:k?11:15 });
  });
})();

/* ============================== 5g. GRAPH CONNECTIVITY ======================
   The owner, three reports: "a line of ordinators keeps trying to path
   across the bay and walk thru the water", "carts... still try climbing the
   hill and going for swims", and "you can also do a pass and connect
   segments of the road network that aren't entirely connected if that
   helps". All three are the same defect, measured live before anything here
   was written (flood fill over the finished RNODE/REDGE graph in the page):

     road graph: 2298 nodes in 117 CONNECTED COMPONENTS
       #1  1646 nodes — everything north of the river
       #0   496 nodes — everything south of it, plus the SW/West highway
       115 more, 97 of them single nodes

   The two big ones are the two river banks. road() deliberately breaks any
   polyline where it crosses the river (see its own inRiver() split), so the
   bank roads correctly stop at the water — but the two REAL bridges that
   carry traffic across (RBRIDGES, rendered by 50-cantons.js) were never
   edges in the graph, so as far as lifeRoadPath() (78-life.js) was
   concerned the city was two islands. Every cart routing between them got
   no road path at all and fell back to raw cross-country land avoidance:
   measured 70 of 90 live caravans with at least one underwater sample on
   their current curve, 41 of 90 over h>95 hill country.

   Same story, worse, for the cantons: none of them was on the graph at all.
   The ordinator ring patrol starts at the Fortress canton's own gate edge
   (-84,-801, terrain h=-19, i.e. out in the bay where every canton sits) —
   its nearest road node was 870 units away on the FAR bank, with 41 of 41
   samples of that connector underwater. That IS the line of ordinators
   walking across the bay.

   Two passes below, in order:
     (1) the DECK network — every causeway, canton span and river bridge
         already built in this world, added to the graph only (ROADS_X;
         painted by nothing, so zero draw calls / triangles / instances).
     (2) a component STITCH pass — after (1), whatever components are still
         separate get joined by a short real road where, and only where, the
         straight connector is genuinely walkable ground.
   Then the graph and the nearest-street index are rebuilt once. */

/* ---- (1) the deck network ------------------------------------------------
   Geometry transcribed from the code that actually builds each deck, not
   guessed: causeway ramps from 50-cantons.js's own CAUSEWAYS loop (canton
   edge at c.r*0.96 toward shoreIn(cw.s,26), skipped below the same
   L < c.r+40 threshold that loop skips on), spans between canton edges
   along the centre line the same way span() draws them, river bridges
   straight off RBRIDGES' own ax/az..bx/bz deck ends. */
(function buildDeckNetwork(){
  /* LANDFALL. A deck arrives near a road, never exactly on one: a causeway
     lands at shoreIn(s,26), inside the shoreline but short of the shore
     roads (inset 34+), and a river bridge's deck ends riverHalf+34 out from
     the centreline while the river road runs at riverHalf+48. buildRoadGraph
     only makes a junction where two segments genuinely CROSS (t and u both
     strictly interior), never where one merely ends near the other — so a
     deck whose end stops short of the tarmac stays a dangling stub. Measured
     on the first cut of this pass: both river bridges and 17 of 19 canton
     causeways came out as their own 2-node islands for exactly that reason.
     So every landward deck end is run ON to the nearest real painted road
     and a little past it. nearestStreet()'s own index only reaches ~120
     units, which is why this scans REDGE directly instead; decks are skipped
     (none exist yet on this first call, but the guard keeps it honest) and
     the extension is sampled for dry ground first, so a "landfall" that
     would actually run out over water or up a hillside is simply not made
     and the deck is left as the honest stub it is. */
  function nearestRoadPoint(x, z){
    var best = null, bd = 1e18;
    for(var ei=0; ei<REDGE.length; ei++){
      var e = REDGE[ei];
      if(e.deck) continue;
      var A2=RNODE[e.a], B2=RNODE[e.b];
      var dx=B2.x-A2.x, dz=B2.z-A2.z, L2=dx*dx+dz*dz;
      var t = L2 ? clamp(((x-A2.x)*dx+(z-A2.z)*dz)/L2, 0, 1) : 0;
      var px=A2.x+dx*t, pz=A2.z+dz*t, d=Math.hypot(x-px,z-pz);
      if(d<bd){ bd=d; best=[px,pz]; }
    }
    return best ? { point:best, dist:bd } : null;
  }
  function dryLine(ax,az,bx,bz){
    var d = Math.hypot(bx-ax,bz-az), steps = Math.max(2, Math.ceil(d/8));
    for(var s=0;s<=steps;s++){
      var t=s/steps, h=terrainH(ax+(bx-ax)*t, az+(bz-az)*t);
      if(h < 1.5 || h > 95) return false;
    }
    return true;
  }
  /* pts: the deck polyline so far; extends its LAST point onto the road */
  function landfall(pts, maxReach){
    var p = pts[pts.length-1];
    var ns = nearestRoadPoint(p[0], p[1]);
    if(!ns || ns.dist <= 1 || ns.dist > maxReach) return;
    if(!dryLine(p[0], p[1], ns.point[0], ns.point[1])) return;
    var ex = ns.point[0]-p[0], ez = ns.point[1]-p[1], eL = Math.hypot(ex,ez)||1;
    pts.push([ns.point[0] + ex/eL*14, ns.point[1] + ez/eL*14]);   /* past it, so it CROSSES */
  }
  CAUSEWAYS.forEach(function(cw){
    var c = cw.c, land = shoreIn(cw.s, 26);
    var dx = land[0]-c.x, dz = land[1]-c.z, L = Math.hypot(dx,dz);
    if(L < c.r + 40) return;            /* 50-cantons.js builds no ramp here either */
    var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
    var pts = [[ax,az], [land[0],land[1]]];
    landfall(pts, 240);
    roadx(pts, 9, 'causeway');
  });
  /* canton-to-canton spans */
  SPANS.forEach(function(s){
    var A = CANTONS[s.a], B = CANTONS[s.b];
    var dx = B.x-A.x, dz = B.z-A.z, L = Math.hypot(dx,dz)||1;
    roadx([[A.x + dx/L*A.r*0.96, A.z + dz/L*A.r*0.96],
           [B.x - dx/L*B.r*0.96, B.z - dz/L*B.r*0.96]], 8, 'bridge');
  });
  /* the two river bridges — BOTH ends get a landfall (each bank has its own
     river road, 14 units further out than the deck end reaches). Short reach:
     the road is right there, and a long invented run inland from a bridgehead
     is not something this world actually has. */
  RBRIDGES.forEach(function(b){
    var fwd = [[b.ax,b.az],[b.bx,b.bz]];  landfall(fwd, 70);
    var rev = [[b.bx,b.bz],[b.ax,b.az]];  landfall(rev, 70);
    var pts = [];
    for(var i=rev.length-1;i>=1;i--) pts.push(rev[i]);   /* the far-bank extension, reversed back in */
    for(var j=1;j<fwd.length;j++) pts.push(fwd[j]);
    roadx(pts, b.w, 'bridge');
  });
})();
buildRoadGraph();

/* ---- (2) the component stitch pass ---------------------------------------
   Generalises the dead-end stitch above (which only looks at degree-1 nodes
   within 30 units and is blind to which COMPONENT anything is in) into a
   real connectivity pass: union-find over the finished graph, every
   cross-component node pair within MAXGAP considered shortest-first, and a
   connector laid only where the straight line between them is genuinely
   walkable — dry (h>=3 the whole way, so this can never bridge the bay or
   a canal), not a hill climb (h<=95, the same HILL_MAX 78-life.js's cart
   router uses), clear of the river corridor (inRiver — real crossings are
   the two bridges above, not an invented ford) and clear of every canton's
   physical footprint. Anything that fails stays disconnected on purpose:
   a component stranded on a hilltop or across open water SHOULD have no
   road route, and the honest answer for a cart is "pick another
   destination", not a phantom road. Fixed width, no rr()/rnd() draws, so
   the seeded RNG stream downstream of here is untouched. */
var ROAD_STITCHES = [];
(function stitchComponents(){
  var MAXGAP = 200, MAXSTITCH = 200;
  var parent = new Int32Array(RNODE.length);
  for(var i=0;i<parent.length;i++) parent[i]=i;
  function find(a){ while(parent[a]!==a){ parent[a]=parent[parent[a]]; a=parent[a]; } return a; }
  function uni(a,b){ a=find(a); b=find(b); if(a===b) return false; parent[b]=a; return true; }
  REDGE.forEach(function(e){ uni(e.a, e.b); });
  /* candidate cross-component pairs within MAXGAP, via a coarse bucket grid
     so this isn't a 2298^2 scan */
  var GC = MAXGAP, G = {};
  RNODE.forEach(function(n,i){
    var k = Math.floor(n.x/GC)+'_'+Math.floor(n.z/GC);
    (G[k] || (G[k]=[])).push(i);
  });
  var cand = [], seen = {};
  RNODE.forEach(function(n,i){
    var ci=Math.floor(n.x/GC), cj=Math.floor(n.z/GC);
    for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
      var arr = G[(ci+di)+'_'+(cj+dj)];
      if(!arr) continue;
      for(var k=0;k<arr.length;k++){
        var j = arr[k];
        if(j<=i) continue;
        if(find(i)===find(j)) continue;
        var d = Math.hypot(n.x-RNODE[j].x, n.z-RNODE[j].z);
        if(d < 4 || d > MAXGAP) continue;
        var pk = i+'_'+j; if(seen[pk]) continue; seen[pk]=1;
        cand.push({i:i, j:j, d:d});
      }
    }
  });
  cand.sort(function(a,b){ return a.d-b.d; });
  function walkable(ax,az,bx,bz){
    var d = Math.hypot(bx-ax, bz-az), steps = Math.max(3, Math.ceil(d/7));
    for(var s=0;s<=steps;s++){
      var t=s/steps, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
      var h = terrainH(x,z);
      if(h < 3 || h > 95) return false;          /* no swims, no hill climbs */
      if(inRiver(x,z,10)) return false;          /* the river is crossed by its bridges, not forded */
      for(var c=0;c<CANTONS.length;c++){
        var C=CANTONS[c], ddx=x-C.x, ddz=z-C.z, dd=Math.hypot(ddx,ddz)||1;
        var ang=Math.atan2(ddz,ddx);
        if(dd < C.r*1.07/Math.max(Math.abs(Math.cos(ang)),Math.abs(Math.sin(ang))) + 10) return false;
      }
    }
    return true;
  }
  for(var ci2=0; ci2<cand.length && ROAD_STITCHES.length<MAXSTITCH; ci2++){
    var p = cand[ci2];
    if(find(p.i)===find(p.j)) continue;          /* an earlier stitch already merged these */
    var A=RNODE[p.i], B=RNODE[p.j];
    if(!walkable(A.x,A.z,B.x,B.z)) continue;
    road([[A.x,A.z],[B.x,B.z]], 6, 'minor');
    uni(p.i, p.j);
    ROAD_STITCHES.push([Math.round(A.x),Math.round(A.z),Math.round(B.x),Math.round(B.z),Math.round(p.d)]);
  }
})();
buildRoadGraph();
buildNearestStreetIndex();

/* component census of the FINAL graph, so the fix is reported as a measured
   number rather than an assertion (85-probe.js/verify.py read this). */
window._roadGraph.nodes = RNODE.length;
window._roadGraph.edges = REDGE.length;
window._roadGraph.crossings = window._crossings;   /* refreshed: 5f captured the count from the PREVIOUS build, two rebuilds ago */
window._roadGraph.decks = ROADS_X.length;
window._roadGraph.stitches = ROAD_STITCHES.length;
(function(){
  var parent = new Int32Array(RNODE.length);
  for(var i=0;i<parent.length;i++) parent[i]=i;
  function find(a){ while(parent[a]!==a){ parent[a]=parent[parent[a]]; a=parent[a]; } return a; }
  REDGE.forEach(function(e){ var x=find(e.a), y=find(e.b); if(x!==y) parent[y]=x; });
  var size = {};
  for(var k=0;k<parent.length;k++){ var r=find(k); size[r]=(size[r]||0)+1; }
  var arr = Object.keys(size).map(function(r){ return size[r]; }).sort(function(a,b){ return b-a; });
  window._roadGraph.components = arr.length;
  window._roadGraph.largestComponent = arr[0] || 0;
  window._roadGraph.componentSizes = arr.slice(0, 12);
})();

/* --- harbours ------------------------------------------------------------- */
var PIERS = [], SHIPS = [], RPIERS = [], BARGES = [];
(function(){
  reseed(5150);
  var n = 8;
  for(var i=0;i<n;i++){
    var s = mix(HARB_S0, HARB_S1, (i+0.5)/n);
    var root = shoreIn(s, -4), out = shoreIn(s, -rr(120, 215));
    PIERS.push({ s:s, x0:root[0], z0:root[1], x1:out[0], z1:out[1], w:rr(11,17) });
  }
  [1,3,5,6].forEach(function(k,j){
    var p = PIERS[k], t = 0.60 + j*0.05, side = (j%2) ? 1 : -1;
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz); dx/=L; dz/=L;
    SHIPS.push({ x: p.x0+dx*L*t + (-dz)*side*(p.w*0.5+16), z: p.z0+dz*L*t + (dx)*side*(p.w*0.5+16),
                 ry: Math.atan2(dx,dz), len: rr(50,68), beam: rr(12,16), masts: ri(2,3) });
  });
  /* river docklands on the north bank, just upstream of the mouth */
  for(var q=0;q<4;q++){
    var p = riverAt(RIVER_HEAD + 30 + q*58), hb = riverHalf(p.x,p.z);
    RPIERS.push({ x0:p.x+p.nx*(hb+6),  z0:p.z+p.nz*(hb+6),
                  x1:p.x+p.nx*(hb-rr(26,40)), z1:p.z+p.nz*(hb-rr(26,40)),
                  w:rr(7,10), bx:p.x+p.nx*(hb+34), bz:p.z+p.nz*(hb+34),
                  ry:Math.atan2(p.nx,p.nz) });
    if(q%2===0) BARGES.push({ x:p.x+p.nx*(hb-18), z:p.z+p.nz*(hb-18),
                              ry:Math.atan2(p.tx,p.tz), len:rr(26,34), beam:rr(7,9) });
  }
})();

/* --- farms: fields round a farmstead, on the floodplain ------------------- */
var FARMS = [];
(function(){
  reseed(9090);
  for(var gx=-HW+300; gx<HW-300; gx+=150){
    for(var gz=-CITY_LIM; gz<HW-300; gz+=150){
      var x=gx+rr(-55,55), z=gz+rr(-55,55);
      if(zoneAt(x,z)!=='farm') continue;
      if(districtAt(x,z)) continue;
      if(inRiver(x,z,90)) continue;
      if(terrainH(x,z) < 4 || terrainH(x,z) > 90) continue;
      if(!chance(0.62*farmFade(x,z)+0.08)) continue;
      var ry = rnd()*Math.PI;
      var fields=[];
      var nf = ri(2,4);
      for(var k=0;k<nf;k++){
        var a = k/nf*Math.PI*2 + rr(-0.5,0.5), d = rr(46,86);
        fields.push({ x:x+Math.cos(a)*d, z:z+Math.sin(a)*d, w:rr(50,96), h:rr(36,70), ry:ry+rr(-0.2,0.2),
                      tone:pick(FIELDC) });   /* palette: 05-palette.js */
      }
      FARMS.push({ x:x, z:z, ry:ry, fields:fields });
    }
  }
})();

/* --- the great estates past five o'clock: four manors, each the seat of a
       semi-rural clan holding ------------------------------------------------ */
var MANORS = [];
(function(){
  reseed(5550);
  var n = 4;
  for(var i=0;i<n;i++){
    var s = mix(S_5 - 140, S_7 + 160, (i+0.5)/n) + rr(-50,50);
    var p = shoreIn(s, rr(150, 230));
    MANORS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.2,0.2) });
  }
})();

/* --- five lesser clan compounds on the south-west shore, between seven and
       five o'clock, set back further inland than the great estates above -- */
var SWCOMPOUNDS = [];
(function(){
  reseed(5551);
  var n = 5;
  for(var i=0;i<n;i++){
    var s = mix(10000, 11300, (i+0.5)/n) + rr(-90,90);
    var p = shoreIn(s, rr(300, 430));
    SWCOMPOUNDS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.25,0.25) });
  }
})();

/* --- 2-3 more clan compounds along the estate shore, filling out the
       south-east stretch between the estates and the wall ---------------- */
var SECOMPOUNDS = [];
(function(){
  reseed(5552);
  var n = 3;
  for(var i=0;i<n;i++){
    var s = mix(S_5+80, WALL_S0-260, (i+0.5)/n) + rr(-100,100);
    var p = shoreIn(s, rr(220, 420));
    SECOMPOUNDS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.25,0.25) });
  }
})();

/* --- islets: clear of the monumental pair; a chain off the west promontory - */
(function(){
  ISLES.length = 0;
  /* the islet that used to stand at (-240,-780) is now the Lighthouse canton
     (see CANTONS above); the shoal chain that used to run off the promontory
     tip is gone too — the Lighthouse causeway reads as that axis now */
  [[60,1800,16,78,'shrine'],[560,1350,13,60,'rock'],
   [470,-1010,20,84,'light'],[-1190,-1180,12,58,'shrine'],[760,-1620,11,52,'rock'],
   [-260,-2100,17,76,'light'],[1500,-2500,13,64,'rock']].forEach(function(i){ ISLES.push(i); });
  /* stepping-stone islets under the longer causeways — solid (reclaimed-land)
     causeways skip this: there is no deck to step across on */
  CAUSEWAYS.forEach(function(cw){
    if(cw.solid) return;
    var c = cw.c, lp = shoreIn(cw.s, 26);
    var L = Math.hypot(lp[0]-c.x, lp[1]-c.z) - c.r;
    if(L < 200) return;
    var t = (c.r + L*0.56) / (L + c.r);
    var ix = mix(c.x, lp[0], t), iz = mix(c.z, lp[1], t);
    var isle = [ix, iz, 7, 40, 'step'];
    ISLES.push(isle); cw.isle = isle;
  });
})();

/* ---- reserved footprints, registered before infill ---- */
var OBST = [];
function reserve(x,z,fx,fz,ry){ OBST.push({x:x,z:z,fx:fx,fz:fz,ry:ry||0,fixed:true}); }
var CHIN = [];

/* ============================== NEW CURTAIN WALL (point-designated) =======
   Legacy WALL/GATES (sampled off shoreIn(s, wallOffset(s)), removed above)
   are replaced by the owner's explicit 17-vertex tower chain, walked in
   order; a gate goes in only where that line actually crosses a real road
   (major class only: quay/boulevard/ring/highway — not minor/warren alleys
   or farm tracks). Needs the FULL road graph, so it lives here, after
   buildRoadGraph()'s final call and nearestStreet's own declaration above,
   not up by the old WALL's spot.

   Gate orientation: the twin-pier gate builders (65-facade.js) spread their
   piers along local +z (loc()'s lateral axis — see facadeFindGateSite's own
   siting comment) with local +x as the facing/passage axis. The owner wants
   the piers' own axis (long axis) PERPENDICULAR to the crossing road, i.e.
   the facing axis must run PARALLEL to the road tangent: local +x =
   (cos ry,-sin ry) ‖ (tx,tz)  =>  ry = atan2(-tz,tx) — the same
   atan2(-dz,dx) "align along a heading" form documented for faceToward() in
   69-district-content.js, not a "face toward a point" call. */

var WALLPTS = [[1449.6,-1025.6],[1495.6,-920.8],[1487.0,-785.4],[1473.9,-643.6],
  [1456.6,-486.6],[1489.5,-348.2],[1516.0,-202.3],[1539.7,-34.7],[1467.2,195.2],
  [1471.2,365.8],[1466.3,505.2],[1465.0,616.8],[1480.6,753.6],[1374.3,873.7],
  [1295.4,916.3],[1193.4,969.2],[1149.0,1052.7]];

/* the owner's 3 named gates — each quad bounds roughly where the wall
   crosses that specific road; the true site is wherever the wall segment
   and a real major-road edge inside the quad actually intersect. */
var NAMED_GATE_QUADS = [
  { name:'HarborGate', quad:[[1371.3,-1055.9],[1376.0,-900.2],[1517.6,-901.9],[1499.8,-1055.2]] },
  { name:'SpiritGate',  quad:[[1432.2,542.4],[1433.6,602.4],[1487.1,604.2],[1485.1,544.5]] },
  { name:'RiverGate',   quad:[[1073.9,1029.8],[1119.5,925.9],[1208.5,964.5],[1139.5,1084.8]] }
];

var WALL_MAJOR_CLS = { quay:1, boulevard:1, ring:1, highway:1 };

function wallQuadBounds(q, pad){
  var x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  q.forEach(function(p){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<z0)z0=p[1]; if(p[1]>z1)z1=p[1]; });
  return { x0:x0-pad, x1:x1+pad, z0:z0-pad, z1:z1+pad };
}
function wallInBounds(x,z,b){ return x>=b.x0 && x<=b.x1 && z>=b.z0 && z<=b.z1; }
/* segment/segment intersection: AB (a wall segment) x CD (a road edge) */
function wallSegXseg(ax,az,bx,bz,cx,cz,dx,dz){
  var r0x=bx-ax, r0z=bz-az, r1x=dx-cx, r1z=dz-cz;
  var denom = r0x*r1z - r0z*r1x;
  if(Math.abs(denom) < 1e-9) return null;
  var t = ((cx-ax)*r1z - (cz-az)*r1x)/denom;
  var u = ((cx-ax)*r0z - (cz-az)*r0x)/denom;
  if(t<0||t>1||u<0||u>1) return null;
  return { x:ax+r0x*t, z:az+r0z*t, t:t, tx:r1x, tz:r1z };
}

/* every wall-segment x major-road-edge crossing, against the FINAL road
   graph (RNODE/REDGE, built above) */
var WALL_CROSSINGS = [];
(function(){
  for(var si=0; si<WALLPTS.length-1; si++){
    var ax=WALLPTS[si][0], az=WALLPTS[si][1], bx=WALLPTS[si+1][0], bz=WALLPTS[si+1][1];
    for(var ei=0; ei<REDGE.length; ei++){
      var e = REDGE[ei];
      if(!WALL_MAJOR_CLS[e.cls]) continue;
      var A=RNODE[e.a], B=RNODE[e.b];
      var hit = wallSegXseg(ax,az,bx,bz, A.x,A.z,B.x,B.z);
      if(!hit) continue;
      var tl = Math.hypot(hit.tx,hit.tz) || 1;
      WALL_CROSSINGS.push({ segIdx:si, segT:hit.t, x:hit.x, z:hit.z,
                             tx:hit.tx/tl, tz:hit.tz/tl, cls:e.cls });
    }
  }
})();

/* the 3 named gates: closest crossing to each quad's own centroid,
   restricted to points that actually fall inside that quad */
var NAMED_GATES = [];
NAMED_GATE_QUADS.forEach(function(ng){
  var b = wallQuadBounds(ng.quad, 6);
  var cx = (ng.quad[0][0]+ng.quad[1][0]+ng.quad[2][0]+ng.quad[3][0])/4;
  var cz = (ng.quad[0][1]+ng.quad[1][1]+ng.quad[2][1]+ng.quad[3][1])/4;
  var best=null, bd=1e18;
  WALL_CROSSINGS.forEach(function(c){
    if(!wallInBounds(c.x,c.z,b)) return;
    var d = Math.hypot(c.x-cx, c.z-cz);
    if(d<bd){ bd=d; best=c; }
  });
  if(best) NAMED_GATES.push({ name:ng.name, x:best.x, z:best.z, tx:best.tx, tz:best.tz, segIdx:best.segIdx, segT:best.segT });
});

/* every other major-road crossing becomes a generic gate — cluster
   crossings within 40 units into one site (a junction can leave two REDGE
   edges of the same physical road each crossing the line a hair apart on
   either side of a node), and drop anything already claimed by a named
   gate above. */
var GENERIC_GATES = [];
(function(){
  var ordered = WALL_CROSSINGS.slice().sort(function(a,b){ return (a.segIdx+a.segT) - (b.segIdx+b.segT); });
  var clusters = [];
  ordered.forEach(function(c){
    var nearNamed = NAMED_GATES.some(function(g){ return Math.hypot(g.x-c.x, g.z-c.z) < 70; });
    if(nearNamed) return;
    var nearCluster = clusters.some(function(cl){ return Math.hypot(cl.x-c.x, cl.z-c.z) < 40; });
    if(nearCluster) return;
    clusters.push(c);
  });
  clusters.forEach(function(c){
    GENERIC_GATES.push({ x:c.x, z:c.z, tx:c.tx, tz:c.tz, segIdx:c.segIdx, segT:c.segT });
  });
})();

/* the ordered wall-node sequence: towers at integer keys (their own vertex
   index), gates at fractional keys (segIdx+segT, always strictly between
   the two towers flanking that segment) — sorting by key interleaves them
   correctly without any special-casing. THIS ORDER IS PROVISIONAL ONLY: it
   seeds a reasonable starting ry (for the site-search footprint below) and
   a cheap early reservation margin. The REAL connectivity — an actual
   nearest-neighbor graph over every node's final, post-site-search
   position — is rebuilt in 60-land.js's "18. CURTAIN WALL" once those
   positions are known (see that section's own comment for the full
   reasoning: this polyline order usually but is not guaranteed to match
   the nearest-neighbor result, and must not be assumed). */
var WNODES = [];
WALLPTS.forEach(function(p, i){ WNODES.push({ kind:'tower', x:p[0], z:p[1], key:i }); });
NAMED_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', name:g.name, named:true, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
GENERIC_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', named:false, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
WNODES.sort(function(a,b){ return a.key-b.key; });

/* damage state: destroyed=0, ruined=1, intact=2 ("health", per the owner's
   own worked examples). Named gates are always intact — real, functioning
   entries the life layer may route against, not ambient scenery. Every
   other tower/generic-gate rolls a weighted state.

   Provisional ry: every node (tower OR gate alike — no more kind-specific
   formula) takes the wall-tangent atan2(dx,dz) between its polyline-order
   neighbors, exactly the convention wallSegRender()/wallSegmentBasalt()
   already use for a segment's own long axis (confirmed against loc()'s own
   rotation math: the lz/local-z axis — a gate's long axis, its lateral
   pier spread per wallGateRuinA/B/C's own gapZ-vs-tw proportions — maps to
   world direction (sin ry, cos ry), so ry=atan2(dx,dz) puts local z flush
   with (dx,dz), i.e. flush with the wall run. One formula now serves
   towers, named gates and generic gates identically, per the owner's own
   "treat them the same" instruction — the old gate-only case that aligned
   to the crossing ROAD's tangent instead (tx,tz) was the ORIGINAL brief,
   explicitly superseded by the owner's own later correction.) 60-land.js
   overwrites this with the real graph-tangent ry once built; this is only
   the estimate the site search's own footprint orientation uses. */
reseed(300500);
function wallPickHealth(){
  var r = rnd();
  if(r < 0.45) return 2;        /* intact  ~45% */
  if(r < 0.80) return 1;        /* ruined  ~35% */
  return 0;                     /* destroyed ~20% */
}
WNODES.forEach(function(n, i){
  var prev = WNODES[Math.max(0,i-1)], next = WNODES[Math.min(WNODES.length-1,i+1)];
  n.ry = Math.atan2(next.x-prev.x, next.z-prev.z);
  n.health = n.named ? 2 : wallPickHealth();
});

/* WALL/GATES kept as the same shape every existing consumer already reads
   (68-props.js, 80-camera.js) — x/z/s/ry, indexable — so nothing downstream
   needs touching just because the source geometry changed. GATES itself is
   rebuilt (emptied here, filled in 60-land.js) once real positions/
   orientations are final — every consumer runs later in the concatenated
   build, after 60-land.js, so a stale provisional snapshot here would only
   go wrong the moment the site search or the graph rebuild moves anything,
   which per the fix below it usually still does not, but must not be
   assumed. */
var WALL = WALLPTS;
var GATES = [];

/* WSEGS: the final wall-body segment list (health-stated node-index pairs).
   Declared here empty, purely so 65-facade.js's overlap audit (which runs
   after 60-land.js in the concatenated build) can read it by the name it
   already does; 60-land.js's "18. CURTAIN WALL" populates it once the real
   nearest-neighbor graph is built from actual post-site-search positions. */
var WSEGS = [];

/* approximate footprints, reserved now so town/compound placement in
   60-land.js already avoids them from its very first candidate scan — belt
   to the real claim() calls the wall-building pass itself makes when it
   actually draws (60-land.js "18. CURTAIN WALL", which runs BEFORE any
   town/compound placement, so those claim()s are the real, exact
   prevention; this is just cheap extra margin ahead of that).

   Each wall-NODE reservation carries a `wallNode` backreference so
   60-land.js can evict exactly that one reservation right before running
   the node's own real, precise claim(). This eviction is the actual fix
   for the reported "wonky" connections: without it, this approximate
   margin reservation sits in PLACED FIRST (claimed at the top of
   60-land.js, well before the wall's own precise site search runs later in
   the same file), so the real claim() at the SAME point always collided
   with itself — confirmed empirically before this fix, every tower/gate
   was being forced off its ideal line by the site search's spiral (never
   landing at ring 0, its own exact anchor), while the wall segments
   between them still drew to the untouched ideal line, producing exactly
   the visible kinks the owner described. Segment reservations below need
   no such backreference/eviction: wallSegRender() never calls claim() for
   itself (no self-collision is possible there), so the approximate margin
   reservation IS the real, permanent protection for a segment's footprint
   — which is also exactly the "wall segments have highest priority to
   stay put" rule the owner asked for, satisfied by construction as long as
   a destroyed segment (see the health check below) is excluded from it. */
WNODES.forEach(function(n){
  if(n.kind==='tower') OBST.push({x:n.x,z:n.z,fx:10,fz:10,ry:n.ry,fixed:true,wallNode:n});
  else if(n.health > 0) OBST.push({x:n.x,z:n.z,fx:12,fz:20,ry:n.ry,fixed:true,wallNode:n});
});
for(var wm=0; wm<WNODES.length-1; wm++){
  var Am=WNODES[wm], Bm=WNODES[wm+1];
  if(Math.floor((Am.health+Bm.health)/2) <= 0) continue;   /* provisionally-destroyed: no margin, per the owner */
  var dxm=Bm.x-Am.x, dzm=Bm.z-Am.z, Lm=Math.hypot(dxm,dzm);
  if(Lm < 1) continue;
  reserve((Am.x+Bm.x)/2, (Am.z+Bm.z)/2, 6, Lm/2, Math.atan2(dxm,dzm));
}

/* ============================== silt strider stations (Route 1) ===========
   Pre-reserved here, well before any procedural scatter (60-land.js) runs,
   so manor buildings/farmsteads/compounds can never grow through a future
   station footprint — same "reserve early, build for real later" pattern
   already used just above for wall towers/gates. The real platform/
   shelter/ramp geometry is built in 66-striders.js (loads after 60-land's
   own scatter, safely before 75-terrain.js's emitBuckets() drains BUCKET);
   the moving convoys themselves are 79-striders.js (after 78-life.js, for
   the road-graph machinery). Interior stops only — the route's two termini
   (turnaround points, not real stops, per the owner's own distinction) get
   no reservation. Same footprint half-extents (18 along the road, 9
   across) as 66-striders.js actually builds, so this reservation doubles
   as the final, real footprint — no second, more-precise claim() needed
   (unlike the wall's own gridRemove/re-claim trick, which only exists
   because the wall's site search moves the point after this early pass). */
[
  { x:-1806.4, z:2278.8, tx:-0.8320502943378437, tz:-0.5547001962252291 },
  { x:107.0,   z:2065.2, tx:0.217518812610881,   tz:0.9760561285911545 },
  { x:791.3,   z:1489.4, tx:0.9019646069836713,  tz:-0.4318099671716614 },
  { x:1181.1,  z:1453.2, tx:0.8893017314745645,  tz:-0.4573209271357934 },
  { x:1938.9,  z:1701.5, tx:0.8642872019638728,  tz:0.5029986406755586 },
  { x:2949.4,  z:1710.7, tx:0.980823374416306,   tz:0.19489871266535125 }
].forEach(function(p,pi){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
  if(pi===5){   /* easternmost stop: also reserve its shrine, offset sideways
                   so it doesn't collide with the platform itself */
    var sp = loc(p.x, p.z, 4, 34, ry);
    reserve(sp[0], sp[1], 7, 4, ry+Math.PI/2);
  }
});

/* ============================== silt strider stations (Route 2) ===========
   Same early-reservation pattern as Route 1's own block just above — see
   that block's comment for the full reasoning, not repeated here. Route 2's
   5 interior points (66-striders.js/79-striders.js — the route's own first
   and last points are termini, no station, no reservation, same as Route
   1's). None of these 5 points land on/near an existing Route 1 station
   (checked live via the shared position-keyed registry's own snap radius —
   66-striders.js's striderFindStation()/striderRegisterStation() — before
   writing this list; the two routes run through entirely different parts
   of the map, z>~1450 for Route 1's stops vs z<~-300 for Route 2's), so
   all 5 reserve fresh footprints here exactly like Route 1's did. If a
   future route's vertex ever DOES coincide with one of these, the registry
   in 66-striders.js is what skips the duplicate BUILD — this early
   reservation pass doesn't need its own coincidence check, since reserving
   the same footprint twice is harmless (just redundant), unlike building
   the geometry twice. */
[
  { x:2275.3,  z:-1364.7, tx:1,                    tz:0 },
  { x:1413.8,  z:-957.1,  tx:-0.20317289800387703, tz:0.9791428769677621 },
  { x:759.2,   z:-411.3,  tx:0.19082757228688982,  tz:-0.9816235722796656 },
  { x:-790.5,  z:-307.4,  tx:0.6686019937136221,   tz:0.7436204502312789 },
  { x:-1751.4, z:-1036.0, tx:-0.7682761317017722,  tz:-0.6401185714048304 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

/* ============================== silt strider stations (Route 3) ===========
   Same early-reservation pattern as Routes 1 and 2 just above. Route 3's
   11-point list (owner-given) has 9 interior stops, but a LIVE check against
   the shared position-keyed registry (66-striders.js's striderFindStation(),
   snap tolerance 25 units) found that 6 of those 9 land on an already-built
   Route 1 or Route 2 station: (2280.8,-1356.9)->R2 stop1, (1416.3,-957.1)->
   R2 stop2, (764.6,-410.6)->R2 stop3, (1187.7,1453.9)->R1 stop4,
   (795.1,1487.9)->R1 stop3, (111.5,2065.2)->R1 stop2 — all within ~10 units,
   clearly the owner's own intended reuse per the standing "if a vertex is on
   an existing station, incorporate it into the route" plan. Only the 3
   genuinely NEW stops get a fresh footprint reserved here; the other 6 keep
   the footprint Route 1/2's own blocks above already reserved (reserving the
   same footprint twice is harmless per that block's own comment, but skipped
   here since it's simple to know which ones are new).

   The 3rd of these (owner's raw point 9: 212.2,2820.0) sits at d=2820 on
   verify.py's own max(|x|,|z|) built-inside-limit measure -- past
   CITY_LIM+300(=2580), the same "built fabric must stay inside the city"
   invariant Route 1's own eastern-nucleus stop happens to clear only by
   sitting within 130 of a real farm field (checked live, coincidental).
   No farm/manor/shrine sits within reach of the raw point here (checked
   live against window._api.FARMS/MANORS/SILHOUETTE_SHRINES -- nearest
   farm is 213 away, over the 130 exemption radius), so this stop is
   nudged along its own road (nearestStreet, live) toward the city instead,
   same category of move as the terminus dry-ground/hill nudges just below
   in 79-striders.js: z 2820 -> 2500 clears the limit with a safe margin
   (d=2500, ~80 under the 2580 ceiling, well past the platform's own
   ~20-25 unit extent). */
[
  { x:878.7,  z:182.0,  tx:0.9559034445674892, tz:-0.2936811275244105 },
  { x:1212.6, z:995.4,  tx:0.537715394629288,  tz:-0.8431264166058784 },
  { x:212.2,  z:2500.0, tx:-0.07124704998790961, tz:0.997458699830735 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

window._layout = { cantons:CANTONS.length, spans:SPANS.length, roads:ROADS.length,
                   wall:WALL.length, farms:FARMS.length, rpiers:RPIERS.length };

