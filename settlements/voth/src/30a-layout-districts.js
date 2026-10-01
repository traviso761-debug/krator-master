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

