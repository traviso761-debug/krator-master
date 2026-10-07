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
      FR8(sx, y+sh, sz, sw*1.5, 0.8, sd*1.5, rr(0,Math.PI*2), vothPatCol('kilim', pick(BANNERC)), 'kilim');
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

