/* ============================== canton-scale structures ====================
   Round 5 — two more object definitions, NOT placed/dispatched in this
   fragment. Both are built to reuse 50-cantons.js's own global helpers
   (CANTON_TOPS, DECK, tierWeights(), bedAt(), seaStair()) rather than
   reinventing tier-stepping math — 50-cantons.js itself is read-only here. */

/* ---- templeCanton(c, y, hw) -------------------------------------------
   A drop-in replacement for monoCanton(c)'s body, built for the Temple
   canton specifically: same tier-stepping (tierWeights/FR8 tier stack) and
   the same CANTON_TOPS/seaStair contract, so a one-line dispatch at the top
   of monoCanton() — `if(c.n==='Temple') return templeCanton(c);` — is all
   the planner needs to wire it in. `y`/`hw` are optional overrides of the
   usual starting plinthTop(7)/half-width(c.r*0.98), for flexibility if the
   planner ever wants to dispatch from partway through monoCanton() instead
   of at the top; omit them and it behaves as a standalone drop-in.

   What reads as "more Vivec-temple-like" than the generic mono treatment:
     - a gilded step-edge and a gilded stringcourse under every tier cornice
       (monoCanton has one flat cornice colour throughout)
     - corner shrine-spires run every tier instead of just the bottom two
     - the golden dome is ~55% bigger than c.dome, sits on a wider gilded
       drum, carries eight radial ribs and a second nested cap-dome with a
       tall gilt finial spike, instead of one plain dome + small cone
     - four tall gilt-capped corner spires instead of the generic ones
     - flanking guard statues (reusing this file's own statue()) and a
       wayside shrineTriptych at the base, which monoCanton has none of
     - a pair of tall gilt cloth banners on posts flanking the base, in the
       canton's own `accent` tone — the same hanging-BOX 'cloth' convention
       the compound gate banners use, so they sway once the cloth shader
       is fixed (see the round-3 report: a pre-existing bug in 45-kit.js's
       applyClothSway, not mine to fix here, currently makes ALL cloth
       instances invisible — geometry is correct regardless) */
function templeCanton(c, y, hw){
  /* owner, final version after a few iterations: tier roofs alternate
     bright and dark shades of blood red (was crimson/porphyry-purple for a
     couple of messages — superseded); the dome and spire TIPS are gold
     (was briefly silver — the owner moved silver onto the Palace instead
     and put gold back on the Temple, so the two monumental cantons read as
     a distinct gold/silver pair). One-off hexes, not new PAL entries —
     this dome/spire-cap treatment is the only thing in the city that reads
     as gilt/blood-red ritual colour rather than ordinary gilt stone.
     Declared LOCAL to this function, not as outer top-level vars: this
     function is called from 50-cantons.js's CANTONS.forEach (fragment 50,
     runs before this fragment's own top-level code), so an outer `var`
     here would still be undefined at call time — hoisted as a binding,
     never actually assigned yet. Real bug, found by screenshot earlier
     this session: the dome rendered solid orange/white until this moved
     inside the function body. */
  var TEMPLE_RED_BRIGHT = 0xa8241c, TEMPLE_RED_DARK = 0x4a0e0a;
  var TEMPLE_GOLD = 0xc9a227;
  var bed = bedAt(c.x,c.z), plinthTop = (y===undefined) ? 7 : y;
  FR8(c.x, bed, c.z, c.r*2.20, plinthTop-bed, c.r*2.20, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.6, c.z, c.r*2.30, 3.0, c.r*2.30, 0, shade(c.tone,-0.38));
  BOX(c.x, plinthTop-0.3, c.z, c.r*2.26, 1.4, c.r*2.26, 0, shade(c.accent,-0.10));   /* gilded step edge */

  var y0 = plinthTop, rem = c.top - y0, W = tierWeights(c.tiers);
  var hw0 = (hw===undefined) ? c.r*0.98 : hw;
  /* 4th pass on this door — see the planner's matching rewrite in
     monoCanton() for the full story: DECK (54, every bridge's height)
     lands at y=57.80 here (tier 1's own base, tierWeights()-derived by
     hand and cross-checked — 3.8 off DECK, same "tier 1 is the real
     entrance" story as Palace's 0.9-off match). Every earlier pass put
     the door on the TOPMOST tier, which nobody arriving by bridge would
     ever reach. Doors now build at entryY/entryHw (tier 1's own
     base/radius, captured below), not the final y0/hw0. */
  var doorFace = {};
  cantonApproachFaces(c).forEach(function(ang){
    var dx=Math.sin(ang), dz=Math.cos(ang), f;
    if(Math.abs(dx) > Math.abs(dz)) f = dx>0 ? 0 : 2; else f = dz>0 ? 1 : 3;
    doorFace[f] = true;
  });
  var entryY, entryHw;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    FR8(c.x, y0, c.z, hw0*2, th, hw0*2, 0, shade(c.tone, i%2 ? 0.05 : -0.02));
    BOX(c.x, y0+th-1.0, c.z, hw0*2*1.07, 2.2, hw0*2*1.07, 0, shade(c.tone,-0.16));
    BOX(c.x, y0+th-2.6, c.z, hw0*2*1.03, 0.7, hw0*2*1.03, 0, shade(c.accent,0.02));  /* gilded stringcourse */
    y0 += th + 0.12;
    var nhw = hw0*0.80;
    if(i < c.tiers-1){
      var ring = hw0*2*0.99, t2 = nhw*2;
      [[0,(ring+t2)/4],[0,-(ring+t2)/4],[(ring+t2)/4,0],[-(ring+t2)/4,0]].forEach(function(o){
        var sw = Math.abs(o[0])>0 ? (ring-t2)/2 : ring;
        var sd = Math.abs(o[0])>0 ? ring : (ring-t2)/2;
        BOX(c.x+o[0], y0, c.z+o[1], sw*0.98, 2.6, sd*0.98, 0, shade(c.tone,-0.20));
      });
    }
    /* corner shrine-spires run every tier, not just the bottom two —
       except tier 1 at a door-bearing face (the real entrance level now,
       not the top), same collision class fixed once already this
       session. */
    /* owner: "the temple roofs will alternate bright and dark shades of
       blood red" — the corner-spire cap on each tier is the one roof-like
       element repeated per floor, so it carries the alternation. The spire
       shaft itself stays in the canton's own tone, unaffected. */
    var tierRoofCol = (i % 2 === 0) ? TEMPLE_RED_BRIGHT : TEMPLE_RED_DARK;
    for(var f=0; f<4; f++){
      if(i === 1 && doorFace[f]) continue;
      var a = f*Math.PI/2;
      var px = c.x + Math.cos(a)*hw0*1.02, pz = c.z + Math.sin(a)*hw0*1.02;
      FR8(px, y0-th*0.86, pz, hw0*0.34, th*0.62, hw0*0.34, -a, shade(c.tone,0.08));
      CONE(px, y0-th*0.24, pz, hw0*0.20, hw0*0.24, -a, tierRoofCol);
    }
    hw0 = nhw;
    if(i === 0){ entryY = y0; entryHw = hw0; }
  }
  CANTON_TOPS[c.n] = { y:y0, hw:hw0, spring:plinthTop, entryY:entryY, entryHw:entryHw };

  /* owner: "the dome will be raised off the top platform by 8 pillars that
     are 3 pedestrians height tall. underneath will be the sacrificial
     altar." A pedestrian's own merged geometry measures 4.046 world units
     top-to-bottom (checked directly against lifePersonGeo's bounding box,
     not guessed) — 3x that is 12.14. Owner's follow-up: "make temple
     platform pillars 2.5x higher" — 12.14*2.5 = 30.35, TEMPLE_PILLAR_H
     below. The pillars stand on the platform (y0/hw0, already the tier
     stack's own top surface) in a ring comfortably inside its edge, and
     the whole gilt dome assembly that used to sit directly on y0 now sits
     on TOP of the pillars instead — domeY0 replaces every bare y0
     reference the dome block below used to read. The altar itself is
     built separately, after this function returns (see the TEMPLE_ALTAR
     IIFE further down this file, which already runs once
     CANTON_TOPS['Temple'] is populated) — it needs the pillar ring's own
     radius, so TEMPLE_PILLAR_RING_R is exported as a plain global for it
     to read, same pattern CANTON_TOPS itself already uses. */
  var TEMPLE_PILLAR_H = 30.35;
  var dr = c.dome*1.55;
  window.TEMPLE_PILLAR_RING_R = hw0*0.70;
  for(var pl=0; pl<8; pl++){
    var pa = pl*Math.PI/4;
    var px2 = c.x + Math.cos(pa)*window.TEMPLE_PILLAR_RING_R, pz2 = c.z + Math.sin(pa)*window.TEMPLE_PILLAR_RING_R;
    CYL(px2, y0, pz2, Math.max(2.0, dr*0.045), TEMPLE_PILLAR_H, 0, shade(c.tone,0.10));
    CYL(px2, y0+TEMPLE_PILLAR_H-0.6, pz2, Math.max(2.6, dr*0.06), 1.2, 0, shade(c.tone,-0.10));   /* capital */
    CYL(px2, y0, pz2, Math.max(2.6, dr*0.06), 0.8, 0, shade(c.tone,-0.10));                        /* base */
  }
  var domeY0 = y0 + TEMPLE_PILLAR_H;

  /* the gold dome: bigger, ribbed, double-crowned. Colour only, no family
     override — an explicit 'metal' family would open a brand-new
     shape+family bucket (a new draw call each for dome/cone/cyl) against a
     budget already sitting at 50/50; every shape here keeps its existing
     default family (dome/roof/stone, already-built buckets) and gets the
     gold tone through color alone. The CYL collar doubles as the
     entablature the 8 pillars actually appear to carry. */
  CYL(c.x, domeY0, c.z, dr*1.42, 11, 0, shade(TEMPLE_GOLD,-0.05));
  BOX(c.x, domeY0+11, c.z, dr*3.05, 2.0, dr*3.05, Math.PI/4, shade(c.tone,-0.12));
  DOME(c.x, domeY0+13.0, c.z, dr, dr*0.92, 0, TEMPLE_GOLD, 'dome');
  for(var rib=0; rib<8; rib++){
    var ra = rib*Math.PI/4;
    CONE(c.x+Math.cos(ra)*dr*0.55, domeY0+13.0, c.z+Math.sin(ra)*dr*0.55, dr*0.05, dr*0.85, ra, shade(TEMPLE_GOLD,-0.10));
  }
  var crownY = domeY0+13.0+dr*0.92*0.55;
  DOME(c.x, crownY, c.z, dr*0.5, dr*0.4, 0, shade(TEMPLE_GOLD,0.08), 'dome');
  CONE(c.x, domeY0+13.0+dr*0.92, c.z, dr*0.12, dr*0.7, 0, shade(TEMPLE_GOLD,-0.15));
  CYL(c.x, domeY0+13.0+dr*0.92+dr*0.7, c.z, dr*0.04, dr*0.3, 0, shade(TEMPLE_GOLD,0.12));

  /* four corner spires, taller, with gold tips (owner: "the dome and spire
     tips will be gold") — the shaft itself stays in the canton's own tone. */
  for(var s=0;s<4;s++){
    var sa = Math.PI/4 + s*Math.PI/2;
    var sx = c.x + Math.cos(sa)*hw0*0.80, sz = c.z + Math.sin(sa)*hw0*0.80;
    FR3(sx, y0, sz, 10, dr*1.7, 10, sa, shade(c.tone,0.03));
    CONE(sx, y0+dr*1.7, sz, 3.8, 9, sa, shade(TEMPLE_GOLD,0.12));
  }

  /* ceremonial approach: one stair + door per real bridge (see the
     planner's cantonApproachFaces() — a hub gets a stair on every face a
     bridge actually lands on, not a fixed +x/-x pair), guard statues
     flanking the PRIMARY approach (the first span found, deterministic —
     not randomised), a wayside shrine at the corner offset from it. This
     is the same data-driven fix the planner applied to the generic
     monoCanton() body (Palace); Temple's own two bridges happen to have
     snapped close to the old hardcoded +x/-x anyway, but this is now
     principled rather than a coincidence, and won't silently break if a
     future canton edit changes which cantons Temple bridges to. */
  var approaches = cantonApproachFaces(c), primary = approaches[0];
  approaches.forEach(function(ang){
    var sp = loc(c.x, c.z, 0, c.r*1.06, ang);
    seaStair(sp[0], sp[1], ang, c.r*0.68, plinthTop, -2);
  });
  /* the real entrance is tier 1 (entryY/entryHw), where linkStair() (in
     50-cantons.js's landing()) actually lands a bridge-borne pedestrian —
     see the planner's matching fix in monoCanton() and this function's own
     comment above the tier loop for the DECK/tierWeights() numbers behind
     this. */
  approaches.forEach(function(ang){
    plinthDoor(c.x, c.z, ang, entryY, entryHw, c.tone);
  });
  [-1,1].forEach(function(s2){
    var gp = loc(c.x, c.z, c.r*1.02, s2*c.r*0.22, primary);
    statue(gp[0], plinthTop, gp[1], primary-Math.PI/2, shade(c.tone,0.10), { h:7, w:2.2 });
  });
  var shp = loc(c.x, c.z, c.r*0.70, -c.r*1.05, primary);
  shrineTriptych(shp[0], terrainH(shp[0],shp[1]), shp[1], primary+Math.PI/2, shade(c.tone,0.05), { w:11, d:4 });

  /* a pair of tall gilt cloth banners on posts, flanking the base */
  var baseHw = (hw===undefined) ? c.r*0.98 : hw;
  [-1,1].forEach(function(s3){
    var bp = loc(c.x, c.z, baseHw, s3*c.r*0.55, 0);
    var poleH = 26;
    CYL(bp[0], plinthTop, bp[1], 0.22, poleH, 0, shade(c.tone,-0.2), 'wood');
    BOX(bp[0], plinthTop+0.6, bp[1], 0.22, poleH*0.78, 4.0, 0, shade(c.accent,0.06), 'cloth');
  });
  /* one ferry pier + matching ground-floor door at the bottom tier, per
     the owner's canton-design notes — same mechanism as the planner's
     matching addition in monoCanton(). */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(baseHw, ferryPier.ry), c.tone);
  }
}

/* alternating merlon blocks round a square (hw-half-extent) perimeter —
   the crenellated parapet ordinatorFortress uses instead of an ornamental
   cornice, wherever a canton would normally get one. Tuned Asiatic: slender,
   closely-spaced merlons — narrow along the wall run and tall for their
   width, rather than the chunky near-cubic, near-evenly-split Western
   block/gap the first pass used. merlonD (depth into the wall run, i.e.
   across the coping) defaults a bit deeper than merlonW is wide, so each
   merlon still seats solidly on the wall rather than reading as a thin
   floating fin; only the face you actually walk past reads as slim. */
function crenellate(cx, cz, hw, yTop, ry, col, merlonW, merlonH, merlonD){
  merlonW = merlonW || Math.max(0.7, hw*0.040);
  merlonH = merlonH || merlonW*2.3;
  merlonD = merlonD || merlonW*1.4;
  var gap = merlonW*0.7, per = merlonW+gap;
  var n = Math.max(3, Math.floor((hw*2)/per));
  [['x',hw],['x',-hw],['z',hw],['z',-hw]].forEach(function(e){
    var along = e[0], fixed = e[1];
    for(var k=0;k<n;k++){
      var t = (k+0.5)/n*(hw*2) - hw;
      var lx = along==='x' ? t : fixed;
      var lz = along==='x' ? fixed : t;
      var p = loc(cx,cz, lx, lz, ry);
      var w = along==='x' ? merlonW : merlonD;   /* slim face along the run */
      var d = along==='x' ? merlonD : merlonW;   /* deeper across the coping */
      BOX(p[0], yTop, p[1], w, merlonH, d, ry, col);
    }
  });
}

/* ---- ordinatorFortress(c, y, hw, opt) ------------------------------------
   Third pass: adapted from a standalone (x,y,z,ry,col,opt) prop into a real
   platCanton() dispatch target, wired for the Lighthouse canton (r:150,
   tiers:3, top:44) which the owner is redesignating from lighthouseDeck()
   to this. Same calling contract as arenaDeckSquare(c,y,hw)/marketDeck/
   gardenDeck — NOT dispatched here, 50-cantons.js is read-only to me; the
   planner adds the one-line `if(c.fortress) return ordinatorFortress(c, y,
   hw);` swap in platCanton() itself alongside its `light` check.

   `(c,y,hw)` here mean exactly what they mean for every other plat-canton
   dispatch target: platCanton() has already built the generic tiered
   plinth (bed, tier stack shrinking hw by 0.86 per level, corner walls,
   sea stairs) by the time it calls this, and (y,hw) is that stack's own
   TOP surface — the real half-width a Lighthouse-scale canton (r:150)
   actually hands over here is ~92.5, not the fixed 120 the standalone prop
   used to assume (checked against platCanton()'s own tier loop, not
   guessed: hw = c.r*0.97*0.86^tiers). x/z/ry are read off `c` (ry is
   always 0 for a plat canton, same as every other FR8/BOX call in
   platCanton() itself); `col` is gone from the signature — wall tone now
   derives from the canton's own `c.tone`, shaded down, rather than a
   random TONES_POOR pick, so Lighthouse's own palette entry actually
   drives it. `opt` still carries the same tuning overrides as before
   (tiers, h, towerH, keepH, ry, col) for whichever future canton might
   want a second fortress with different proportions.

   Below this line the fortress rises FROM that platform top (yb = y),
   using the platform's own hw as its footprint (rad = hw, scaled 0.98 in
   exactly the same proportion the old fixed-rad version used) rather than
   floating in raw world space — same resize-not-redesign brief as every
   other number changed here. It is still the star-fort/Hagia-Sophia cross
   already built and catalogued in `new-buildings/`, not a new design:

     - STAR FORT footprint: the tiered curtain from the first pass stays,
       but its once-plain square perimeter now breaks at six points — four
       angular corner bastions (small crenellated platforms nested
       diagonally past each corner of tier 0, same wall-batter as the
       curtain itself) plus two true pointed diamond bastions on the
       flanking (z) faces, each rotated 45° off the main wall so its own
       corner is the outward point and its own crenellation runs at that
       same angle. The +x face is left a plain curtain run for the
       gatehouse, so nothing here fights it. Together this is the trace
       italienne signature — angular projections at intervals eliminating
       dead ground along any one straight run — not a plain square.
     - HAGIA SOPHIA massing in place of the first pass's small blocky keep:
       a stepped plinth, a genuinely wide drum, a big ribbed central dome,
       and two lower flanking domes fore/aft on their own short drums — the
       stepped-massing/half-dome impression of the real building's
       silhouette — plus a small nested crown dome and an iron finial mast.
       Coloured in the wall's own stone/iron tones (never DOMEC's gilt),
       sparse arrow slits round the drum, and a crenellated gallery at its
       base, so it still reads as a martial keep wearing a huge dome, not a
       temple.
     - four corner watchtowers restyled (owner round 3) off compound()'s own
       corner towers in 60-land.js rather than a slender minaret: a squat
       square FR8 shaft under a flat overhanging coping cap, with a slim
       Asiatic-style crenellated gallery riding just under that cap — reads
       as the Ordinators' own blocky lookouts, not a clan tower or a mosque
       minaret.
     - one grim ironbound gatehouse breaking the wall, unchanged — still
       the only other place this asset uses the metal family, alongside
       the drum's iron signal mast. */
function ordinatorFortress(c, y, hw, opt){
  opt = opt || {};
  var x = c.x, z = c.z, ry = opt.ry || 0;
  var platformY = y, platformHw = hw;      /* the real platform surface platCanton() already built and already recorded in CANTON_TOPS — reused verbatim below, not the fortress's own (much higher) deck/dome height */
  var rad = platformHw;                    /* fit the canton's real top-tier half-width instead of a fixed default */
  var tiers = opt.tiers || 3;
  var totalH = opt.h || rad*0.583;         /* same H/rad ratio the old fixed 70/120 pair used */
  /* owner, after reviewing the mockup ("i like the new fortress model,
     implement it"): the Ordinator fortress is basalt, not the canton's own
     sandy tone — the same BASALTC palette the curtain wall and the abbey
     already use, so the ordinators' seat reads as one material family with
     the city's defences. Trim is deliberately TWO greys rather than one
     darker shade of the wall: a light coping band over dark crenellation,
     which is what makes the ornament read at all against a near-black
     body. Banners are the order's green and gold. */
  var wallCol = opt.col || shade(BASALTC[1 % BASALTC.length], 0.02);
  var fortTrimDark = shade(GREYC[0], -0.30);
  var fortTrimLight = shade(GREYC[GREYC.length-1], 0.20);
  var fortBannerGreen = 0x2f6b3a, fortBannerGold = 0xc9a227;
  /* the platform below this keep is built by platCanton()'s own tier loop,
     which has already laid down c.tiers bands before we start. Continuing
     its parity here is what makes the banding read as one stack from the
     waterline up, instead of resetting at the keep's foot. */
  var FORT_BAND_PHASE = (c.tiers || 0) % 2;
  var yb = platformY;                      /* build up FROM the platform top, not raw ground */

  var hw = rad*0.98, y0 = yb;
  var tierH = totalH/tiers;
  var hw0 = hw, tierH0 = tierH;      /* tier-0 dimensions, kept for the star bastions below */
  for(var i=0;i<tiers;i++){
    /* owner: "make the dark/light alternation on the ordinator canton extend
       to all levels". The old +-0.03/-0.09 spread was tuned against the
       canton's original sandy tone; on near-black basalt a 0.06 shade delta
       is invisible, so the keep read as one flat mass. Widened to a real
       light/dark banding (+0.16 / -0.10) that survives the dark base colour,
       and phase-matched to the platform tiers below so the alternation runs
       continuously from the waterline to the crest rather than restarting at
       the keep. */
    FR8(x, y0, z, hw*2, tierH, hw*2, ry, shade(wallCol, (i+FORT_BAND_PHASE)%2 ? 0.16 : -0.10));
    var topY = y0+tierH;
    BOX(x, topY-0.6, z, hw*2*1.03, 1.2, hw*2*1.03, ry, fortTrimLight);
    crenellate(x, z, hw, topY, ry, fortTrimDark);
    /* green-and-gold banners hung from each tier's parapet, one per face,
       alternating colour by tier so both show from any approach.
       box|cloth is already a spent bucket (market awnings, clan banners),
       so this costs no draw call. */
    for(var bf=0; bf<4; bf++){
      var ba = ry + bf*Math.PI/2;
      var bp = loc(x, z, hw*1.02, 0, ba);
      var bcol = ((bf + i) % 2) ? fortBannerGreen : fortBannerGold;
      BOX(bp[0], topY-tierH*0.72, bp[1], 0.4, tierH*0.62, hw*0.42, ba, bcol, 'cloth');
      BOX(bp[0], topY-tierH*0.72+tierH*0.62, bp[1], 0.7, 0.7, hw*0.46, ba, fortTrimLight);
    }
    var nSlits = 4 + i*2;
    for(var s=0;s<nSlits;s++){
      var side = Math.floor(rnd()*4), a = side*Math.PI/2 + rr(-0.9,0.9);
      var sx = x+Math.cos(a)*hw*1.01, sz = z+Math.sin(a)*hw*1.01;
      BOX(sx, y0+tierH*rr(0.3,0.6), sz, 0.3, rr(1.6,2.4), 0.5, -a, shade(wallCol,-0.5));
    }
    if(i < tiers-1) hw *= 0.80;
    y0 = topY + 0.4;
  }
  var deckY = y0, deckHW = hw;

  /* ---- star-fort bastions, ground level, breaking the tier-0 perimeter:
     four angular corner platforms (axis-aligned nubs nested diagonally past
     each corner, same batter as the curtain) plus two true diamond points
     on the flanking (z) faces, each rotated 45° off the main wall so its
     own corner is the outward point. The +x face stays a plain curtain run
     for the gatehouse below. */
  var bH = tierH0*0.92, bTop = yb+bH;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cc){
    var bw = Math.max(9, hw0*0.20);
    var p = loc(x,z, cc[0]*hw0, cc[1]*hw0, ry);
    FR8(p[0], yb, p[1], bw, bH, bw, ry, shade(wallCol,-0.05));
    crenellate(p[0], p[1], bw*0.48, bTop, ry, shade(wallCol,-0.30), bw*0.075, bw*0.17);
  });
  [1,-1].forEach(function(s){
    var pw = Math.max(16, hw0*0.30);
    var a2 = ry + s*Math.PI/2, ryB = a2 - Math.PI/4;
    var p = loc(x,z, 0, s*hw0, ry);
    FR8(p[0], yb, p[1], pw, bH*0.96, pw, ryB, shade(wallCol,-0.02));
    crenellate(p[0], p[1], pw*0.44, bTop-0.3, ryB, shade(wallCol,-0.30), pw*0.07, pw*0.16);
    var tip = loc(x,z, 0, s*(hw0+pw*0.62), ry);
    BOX(tip[0], yb+bH*rr(0.30,0.55), tip[1], 0.5, rr(1.8,2.6), 0.3, -a2, shade(wallCol,-0.5));
  });

  /* ---- four corner watchtowers, restyled off compound()'s own corner
     towers (60-land.js, the FR8 shaft + wider flat coping cap on every
     compound) rather than the first pass's slender minaret: a squat,
     square-plan FR8 shaft — same gentle batter as the curtain tiers — under
     a flat, overhanging coping slab (compound()'s own roof treatment,
     scaled up: there it's a 7-wide shaft under an 8.2-wide cap, here the
     same ~1.17x overhang ratio), with a slim Asiatic-style crenellated
     gallery riding just under the cap so these still read as a fortress's
     own lookouts and not a plain clan tower. */
  var twr = Math.max(14, deckHW*0.16);              /* shaft full width/depth */
  var towerH = opt.towerH || twr*2.6;                /* stout, compound-tower proportions, not a soaring minaret */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(x,z, cc[0]*deckHW*0.92, cc[1]*deckHW*0.92, ry);
    inspectClaim(p[0], p[1], twr*0.5, twr*0.5, ry, 'tower', 'Fortress watchtower');
    FR8(p[0], deckY, p[1], twr, towerH, twr, ry, shade(wallCol,-0.05));
    var galY = deckY + towerH - twr*0.22;
    crenellate(p[0], p[1], twr*0.5, galY, ry, shade(wallCol,-0.30), twr*0.045, twr*0.11);
    BOX(p[0], galY+twr*0.11, p[1], twr*1.17, twr*0.11, twr*1.17, ry, shade(wallCol,-0.20));  /* flat overhanging coping cap, compound-style */
    var slit = loc(p[0],p[1], twr*0.52, 0, ry);
    BOX(slit[0], deckY+towerH*0.35, slit[1], 0.3, 2.0, 0.5, ry, shade(wallCol,-0.5));
    /* owner: "give those 4 ornamental towers bright green flames at night."
       These four ARE the ornamental towers — the only set of four on the
       build (the four star-fort corner bastions above are ground-level
       platforms, not towers, and the keep's domes are one central mass).
       Published the same way window.TEMPLE_BRAZIERS is, for 82-daynight.js
       to hang a night light on: the fire basin sits on the coping cap's own
       top face, which is galY + twr*0.11 (cap base) + twr*0.11 (cap
       thickness) = deckY + towerH exactly. No geometry is added here — the
       flame itself is an instance of the existing shared nlMesh. */
    window.FORT_TOWER_FLAMES = window.FORT_TOWER_FLAMES || [];
    window.FORT_TOWER_FLAMES.push({ x:p[0], z:p[1], y: deckY + towerH, w: twr });
  });

  /* ---- the central rise: Hagia-Sophia-scaled massing standing in for the
     first pass's single small keep — a stepped plinth, a wide drum, two
     lower flanking domes fore/aft (the stepped half-dome impression), and
     the main dome itself ribbed and double-crowned. All in the wall's own
     stone/iron tones, never DOMEC's gilt, so it reads as a fortress keep
     wearing a huge dome rather than a temple. */
  var plinthR = deckHW*0.66, plinthH = totalH*0.12;
  /* inspector footprints (inspectClaim(), 86-inspect.js — inspect-only, not
     claim()): the keep itself, and the four corner watchtowers registered
     just below, so hovering the fortress reports the part under the cursor
     instead of only "Fortress canton". */
  inspectClaim(x, z, plinthR, plinthR, ry, 'keep', 'Ordinator keep');
  FR8(x, deckY, z, plinthR*2, plinthH, plinthR*2, ry, shade(wallCol,-0.02));
  crenellate(x, z, plinthR*0.97, deckY+plinthH, ry, shade(wallCol,-0.30), plinthR*0.055, plinthR*0.125);

  var drumY = deckY+plinthH+0.3, drumR = deckHW*0.56, drumH = opt.keepH || totalH*0.30;
  CYL(x, drumY, z, drumR, drumH, 0, shade(wallCol,0.02));
  var nSlit2 = 8;
  for(var d2=0; d2<nSlit2; d2++){
    var a3 = (d2/nSlit2)*Math.PI*2;
    var dx = x+Math.cos(a3)*drumR*1.01, dz = z+Math.sin(a3)*drumR*1.01;
    BOX(dx, drumY+drumH*rr(0.35,0.70), dz, 0.3, rr(2.2,3.2), 0.6, -a3, shade(wallCol,-0.55));
  }

  [1,-1].forEach(function(s){                          /* lower flanking domes, fore/aft */
    var fr = drumR*0.52;
    var fp = loc(x,z, s*(drumR+fr*0.75), 0, ry);
    var fy = drumY + drumH*0.18;
    CYL(fp[0], fy, fp[1], fr, drumH*0.55, 0, shade(wallCol,-0.04));
    DOME(fp[0], fy+drumH*0.55, fp[1], fr*0.96, fr*0.80, 0, shade(wallCol,-0.08), 'dome');
  });

  var domeY = drumY+drumH, domeR = drumR*0.98;
  CYL(x, domeY-1.0, z, domeR*1.05, 1.4, 0, shade(wallCol,-0.20));
  DOME(x, domeY, z, domeR, domeR*0.86, 0, shade(wallCol,0.04), 'dome');
  for(var rib=0; rib<10; rib++){
    var ra = rib*Math.PI/5;
    CONE(x+Math.cos(ra)*domeR*0.5, domeY, z+Math.sin(ra)*domeR*0.5, domeR*0.045, domeR*0.78, ra, shade(wallCol,-0.10));
  }
  var crownY = domeY + domeR*0.86*0.55;
  DOME(x, crownY, z, domeR*0.30, domeR*0.24, 0, shade(wallCol,-0.06), 'dome');               /* small nested crown dome */
  BOX(x, domeY+domeR*0.86+0.4, z, domeR*0.14, 1.2, domeR*0.14, ry, shade(wallCol,-0.40));    /* flat dark iron finial base, not a spire */
  CYL(x, domeY+domeR*0.86+1.6, z, domeR*0.045, domeR*0.45, 0, shade(wallCol,-0.35), 'metal'); /* iron signal mast */

  /* one grim, ironbound gatehouse breaking the wall (+x face, clear of
     every bastion above) */
  var gp = loc(x,z, rad*0.98, 0, ry);
  BOX(gp[0], yb, gp[1], 6, totalH*0.5, 14, ry, shade(wallCol,-0.45), 'metal');

  /* CANTON_TOPS, the same way templeCanton() does — a bridge/causeway
     pedestrian still arrives on the platform platCanton() itself already
     built (platformY/platformHw), not the top of the fortress's own dome,
     so this intentionally matches the values platCanton() already wrote
     before calling us; set explicitly here anyway so this function is
     self-contained and consistent with the rest of the canton system,
     which reads CANTON_TOPS generically. */
  CANTON_TOPS[c.n] = { y:platformY, hw:platformHw, spring:platformY };
}

/* ============================== round 6: port & arena reworks ==============
   Both are drop-in replacements for the matching dispatch in platCanton()
   (same signature, same calling contract — `platCanton()` has already built
   the quay platform/trim/bollard ring before c.port's dispatch would call
   portDeckV2, same as it does for portDeck today). NOT dispatched here —
   50-cantons.js is read-only to me; the planner wires the one-line swap. */

/* a small, formal administrative building — the customs/excise checkpoint,
   distinct from the sheds by its regular massing, portico and cupola.
   Combos: box|stone(default), fr8|roof, cyl|stone(default), box|wood,
   fr3|stone(default) — all already live elsewhere in the build. */
function customsHouse(x,y,z,ry,w,d,col){
  var h = 11;
  BOX(x, y, z, w, h, d, ry, col);
  BOX(x, y+h, z, w*1.06, 1.0, d*1.06, ry, shade(col,-0.15));
  BOX(x, y+h-2.4, z, w*1.02, 0.5, d*1.02, ry, shade(col,0.06));       /* formal stringcourse */
  var fp = loc(x,z, w*0.5+1.8, 0, ry);
  FR8(fp[0], y+h*0.70, fp[1], 3.6, 1.1, d*0.55, ry, pick(ROOFS), 'roof');  /* portico canopy */
  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.5+1.8, s*d*0.20, ry);
    CYL(pp[0], y, pp[1], 0.34, h*0.70, 0, shade(col,0.05));
  });
  var dp = loc(x,z, w*0.5+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.4, h*0.42, d*0.20, ry, shade(col,-0.4), 'wood');
  CYL(x, y+h+1.0, z, w*0.16, 2.2, 0, shade(col,0.08));                 /* cupola drum */
  FR3(x, y+h+3.2, z, w*0.12, 3.0, w*0.12, 0, shade(col,0.12));         /* spire/finial: the "official building" marker */
}

/* a second, standalone customs-and-excise office — the owner marked its
   lot directly with the polygon devtool:
   [[1004.6,-926.1],[982.3,-988.7],[899.4,-950.1],[944.7,-898.3]]. Hand-
   marked corners are rarely a clean rectangle (here AB=66.5/CD=68.8 but
   BC=91.4/DA=66.0), so fit an oriented box instead of trusting the raw
   quad: centroid, then project all 4 corners onto the AB edge direction
   and its perpendicular and take each axis's own (max-min) as that
   axis's extent. Built at 55% of the fitted 72.6 x 91.1 lot so the
   building sits centred with a yard margin rather than wall-to-wall,
   rotated to the long (perpendicular) axis to match customsHouse()'s own
   proportions (front-to-back deeper than its facade is wide — see its
   existing port-canton call). Reuses customsHouse() itself unmodified;
   this is a placement, not a redesign. Land here is confirmed real,
   walled city core (zoneAt: 'core', insideWall: true, terrainH ~3.9). */
(function(){
  reseed(5553);
  var cx = 951.58, cz = -939.26, ry = 0.341;
  var w = 50, d = 40;
  var col = pick(TONES);
  var yb = plinth(cx, cz, w*0.5, d*0.5, ry, col) + 0.2;
  claim(cx, cz, w*0.5, d*0.5, ry, 'customs');
  customsHouse(cx, yb, cz, ry, w, d, col);
})();

