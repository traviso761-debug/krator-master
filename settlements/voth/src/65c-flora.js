/* ============================== more trees & wild flora ====================
   Round 6 — same deal as the props above: parameterised (x, y, z, ry, col,
   opt) functions, NOT called anywhere in this fragment. No rnd() runs and no
   BUCKET pushes happen until a future placement pass calls one of these, so
   this section costs nothing this round. Existing families/colours only —
   no new PAL entries needed (checked PAL.leaf/willow/fungus/stalk/trunk and
   PAL.bloom first).

   The kit only ever rotates an instance about Y (`_dm.rotation.set(0, r[6],
   0)` in emitBuckets()) — nothing in SHAPES tilts off vertical. Every
   "branch"/"root"/"frond" below is built the way baobab()/dragonTree()/
   doorAwning() already do it: a vertical primitive offset sideways by loc(),
   often chained in a few outward-and-down (or outward-and-up) steps so the
   silhouette reads as reaching/drooping/arching even though each individual
   piece is a plain vertical stub. Not a new trick, just applied to new
   shapes. */

/* ---- wild flora: alien ashland undergrowth, distinct from 70-veg.js's
   scrub BLOBs and tiered STK+CONE tree, and from this file's own baobab/
   dragonTree/cherryBlossom/emperorMushroom — four more silhouettes so a
   patch of undergrowth doesn't read as four copies of the same bush. ------- */

/* bulb pod — a squat leaf rosette at the base with several thin stalks
   carrying oversized, swollen ovoid pods (fungal-adjacent, not a flower and
   not a mushroom cap): the classic Morrowind "alien pod plant" silhouette. */
function bulbPod(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var podCol = col || pick(FUNGC);
  var nb = opt.baseLeaves || ri(2,4);
  for(var i=0;i<nb;i++){
    var a0 = rnd()*Math.PI*2, r0 = rr(0.3,1.1);
    var br = rr(1.1,2.0);
    BLOB(x+Math.cos(a0)*r0, y-0.2, z+Math.sin(a0)*r0, br, br*rr(0.35,0.55), rnd()*3, pick(LEAFC), 'leaf');
  }
  for(var k=0;k<n;k++){
    var a = rnd()*Math.PI*2, reach = rr(0.6,2.2);
    var sx = x+Math.cos(a)*reach, sz = z+Math.sin(a)*reach;
    var sh = rr(1.6,3.6);
    STK(sx, y, sz, rr(0.12,0.20), sh, 0, pick(STALKC), 'trunk');
    var podR = rr(0.7,1.3), podH = podR*rr(1.5,2.1);          /* ovoid, not a cap */
    BLOB(sx, y+sh-0.15, sz, podR, podH, rnd()*3, podCol, 'fungus');
    BLOB(sx, y+sh+podH*0.75, sz, podR*0.36, podR*0.30, rnd()*3, shade(podCol,-0.2), 'fungus');  /* nub tip */
  }
}

/* spine rosette — a ground-hugging burst of thick, barbed, spike-tipped
   leaves (an alien aloe/agave), with a rare tall central bloom spike so a
   patch of them isn't perfectly uniform. */
function spineRosette(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(8,14);
  var leafCol = col || pick(LEAFC);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.18,0.18);
    var reach = rr(0.4,1.1);
    var lx = x+Math.cos(a)*reach, lz = z+Math.sin(a)*reach;
    var lh = rr(1.6,3.4), lr = rr(0.22,0.42);
    CONE(lx, y, lz, lr, lh, a, shade(leafCol, rr(-0.08,0.10)), 'leaf');
  }
  if(opt.bloom !== false && chance(0.30)){
    var bh = rr(6,11);
    STK(x, y, z, 0.16, bh, 0, pick(STALKC), 'trunk');
    var nb = ri(4,7);
    for(var k=0;k<nb;k++){
      var t = (k+1)/nb;
      var by = y + bh*t;
      var bo = loc(x,z, rr(-0.5,0.5), rr(-0.5,0.5), rnd()*6.28);
      BLOB(bo[0], by, bo[1], rr(0.35,0.6), rr(0.4,0.7), rnd()*3, pick(BLOOMC), 'leaf');
    }
  }
}

/* coral shrub — a branching, antler/coral-like alien bush: thin tapering
   limbs forking off a short central stub at a few different heights, each
   tip capped with a small bulbous nub, rather than any kind of canopy. */
function coralShrub(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(2.0,4.5);
  var trunkCol = col || pick(TRUNKC);
  var tipCol = opt.tipCol || pick(FUNGC);
  CYL(x, y, z, rr(0.22,0.34), h*0.4, 0, trunkCol, 'trunk');
  var n = opt.branches || ri(5,9);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.3,0.3);
    var stubY = y + h*0.4*rr(0.3,1.0);
    var reach1 = rr(0.8,1.6), len1 = h*rr(0.35,0.55);
    var p1 = loc(x,z, Math.cos(a)*reach1, Math.sin(a)*reach1, 0);
    CYL(p1[0], stubY, p1[1], rr(0.10,0.16), len1, 0, shade(trunkCol,-0.05), 'trunk');
    /* a sub-fork off the first limb's tip, so it doesn't read as a single
       stiff spike */
    var reach2 = reach1 + rr(0.5,1.0);
    var p2 = loc(x,z, Math.cos(a+rr(-0.5,0.5))*reach2, Math.sin(a+rr(-0.5,0.5))*reach2, 0);
    var len2 = len1*rr(0.4,0.7);
    CYL(p2[0], stubY+len1*0.7, p2[1], rr(0.07,0.11), len2, 0, shade(trunkCol,0.03), 'trunk');
    BLOB(p2[0], stubY+len1*0.7+len2-0.1, p2[1], rr(0.30,0.55), rr(0.30,0.55), rnd()*3, tipCol, 'fungus');
  }
}

/* arching bladder plant — a few stalks that arch up off a low central crown
   and back down to hanging, pear-shaped bladder pods near the ground: a
   drooping, outward silhouette distinct from bulbPod's upright cluster. */
function archingBladder(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var bladderCol = col || pick(FUNGC);
  BLOB(x, y-0.15, z, rr(0.7,1.1), rr(0.35,0.5), rnd()*3, pick(LEAFC), 'leaf');   /* low crown */
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.25,0.25);
    var steps = 3, rise = rr(1.4,2.2), reach = rr(2.2,3.6);
    var lastX=x, lastZ=z, lastY=y;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;
      /* rises for the first half of the arch, then descends back toward
         the ground for the second half — same cascade idea as
         doorAwning(), just up-then-down instead of only down */
      var yy = y + rise*Math.sin(Math.PI*t);
      var rr2 = reach*t;
      var px = x+Math.cos(a)*rr2, pz = z+Math.sin(a)*rr2;
      var segH = Math.max(0.3, Math.abs(yy-lastY)) + 0.4;
      var baseY = Math.min(yy,lastY);
      CYL((lastX+px)/2, baseY, (lastZ+pz)/2, 0.09, segH, 0, pick(TRUNKC), 'trunk');
      lastX=px; lastZ=pz; lastY=yy;
    }
    var podR = rr(0.5,0.9);
    BLOB(lastX, Math.max(y,lastY-podR*0.3), lastZ, podR, podR*rr(1.3,1.7), rnd()*3, bladderCol, 'fungus');
  }
}

/* ---- named species: weeping willow, mangrove, giant fern, giant groundsel.
   Recognisable real-world forms, not generic trees with a different colour.
   Distinct names from 55-chinampa.js's own willow(x,z,y) (a small, cheap
   mature-chinampa-bed tree, different signature, do not touch it). --------- */

/* weeping willow — a mounded canopy with many thin trailing branches
   cascading out and down from the canopy edge almost to the ground, using
   the same outward+down stepping idea as doorAwning() above. A landmark
   riverside/canal tree — tall enough, and with branches reaching low
   enough, to read from the water. */
function weepingWillow(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(11,17);
  var trunkR = opt.trunkR || rr(0.5,0.8);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(WILLOWC);
  var canopyY = y + h*0.62;
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyR = opt.canopyR || h*rr(0.34,0.44);
  BLOB(x, canopyY, z, canopyR, canopyR*0.6, rnd()*3, leafCol, 'leaf');
  var nb = opt.branches || ri(9,15);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.2,0.2);
    var steps = 4, outStep = canopyR*rr(0.22,0.34), drop = (canopyY-y)*rr(0.20,0.27);
    var curR = canopyR*rr(0.75,0.98), curY = canopyY + canopyR*0.15;
    for(var s=0;s<steps;s++){
      var nextR = curR + outStep, nextY = Math.max(y+0.2, curY - drop*(0.7+0.3*s));
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      CYL(mx, nextY, mz, Math.max(0.04, 0.16 - s*0.03), segH, 0, shade(trunkCol,-0.1), 'trunk');
      if(chance(0.7)){
        var tuftR = Math.max(0.4, 1.3 - s*0.25);
        BLOB(x+Math.cos(a)*nextR, nextY+segH*0.5, z+Math.sin(a)*nextR, tuftR, tuftR*0.7, rnd()*3, shade(leafCol, rr(-0.1,0.08)), 'leaf');
      }
      curR = nextR; curY = nextY;
    }
  }
}

/* mangrove — a tangle of prop roots (stilt legs stepping outward and down
   from an elevated trunk base to the waterline/mud) under a compact canopy.
   Meant to be planted with `y` at or near the waterline: the roots reach UP
   from y to the trunk and their outer ends land back at y, so the tangle
   reads as emerging from the water regardless of how the placement pass
   handles the actual submerged geometry. */
function mangrove(x,y,z,ry,col,opt){
  opt = opt || {};
  var baseLift = opt.rootH || rr(2.6,4.2);           /* trunk sits above the water on its roots */
  var h = opt.h || rr(7,11);
  var trunkR = opt.trunkR || rr(0.35,0.55);
  var rootCol = opt.rootCol || shade(pick(TRUNKC),-0.08);
  var leafCol = col || pick(LEAFC);
  var trunkTop = y + baseLift;
  var nr = opt.roots || ri(5,8);
  for(var i=0;i<nr;i++){
    var a = (i/nr)*Math.PI*2 + rr(-0.2,0.2);
    var reach = rr(1.8,3.4);
    var steps = 3;
    var curR = 0.2, curY = trunkTop - baseLift*0.1;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;
      var nextR = reach*t, nextY = trunkTop - baseLift*t*t;    /* arcs down faster near the water */
      if(s === steps-1) nextY = y;                             /* the outer leg always meets the waterline */
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      var segR = trunkR*(1-t*0.55);
      CYL(mx, nextY, mz, Math.max(0.08,segR), segH, 0, rootCol, 'trunk');
      curR = nextR; curY = nextY;
    }
  }
  CYL(x, trunkTop-baseLift*0.15, z, trunkR, h, 0, opt.trunkCol || pick(TRUNKC), 'trunk');
  var canopyY = trunkTop-baseLift*0.15 + h*0.85;
  var nCan = opt.canopyBlobs || ri(3,5);
  for(var k=0;k<nCan;k++){
    var co = loc(x,z, rr(-1.4,1.4), rr(-1.4,1.4), 0);
    var cr = rr(1.6,2.6);
    BLOB(co[0], canopyY+rr(-0.4,0.5), co[1], cr, cr*rr(0.55,0.8), rnd()*3, leafCol, 'leaf');
  }
}

/* giant fern — a dense burst of large fronds fanning up and outward from a
   short ground-level rhizome, each frond built from two cascading segments
   (a thicker base rising, a thinner tip arching further out) so it reads as
   a curved blade rather than a stiff cone. Large fanning frond clusters, not
   a tree — deliberately no tall trunk. */
function giantFern(x,y,z,ry,col,opt){
  opt = opt || {};
  var leafCol = col || pick(LEAFC);
  CYL(x, y, z, rr(0.5,0.8), rr(0.6,1.1), 0, pick(TRUNKC), 'trunk');   /* rhizome stub */
  var n = opt.fronds || ri(9,15);
  var reach = opt.reach || rr(5,8);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.15,0.15);
    var baseH = rr(2.5,4.0), baseR1 = reach*0.35;
    var p1 = loc(x,z, Math.cos(a)*baseR1, Math.sin(a)*baseR1, 0);
    CONE(p1[0], y+0.6, p1[1], rr(0.35,0.5), baseH, a, shade(leafCol,-0.05), 'leaf');
    var tipH = rr(2.0,3.2), tipR2 = reach*rr(0.8,1.0);
    var p2 = loc(x,z, Math.cos(a)*tipR2, Math.sin(a)*tipR2, 0);
    CONE(p2[0], y+0.6+baseH*0.65, p2[1], rr(0.18,0.28), tipH, a, shade(leafCol,rr(0.0,0.12)), 'leaf');
  }
}

/* giant groundsel — a thick single trunk (with a marcescent dead-leaf skirt
   partway up, characteristic of the real Dendrosenecio) topped by a dense
   rosette of large paddle-shaped leaves radiating from the crown: an
   Afroalpine silhouette, not a generic palm/tree. */
function giantGroundsel(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(5,9);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(LEAFC);
  FR6(x, y, z, trunkR*2, h, trunkR*2, ry, trunkCol, 'trunk');
  if(opt.skirt !== false){
    var bands = ri(1,2);
    for(var b=0;b<bands;b++){
      var by = y + h*rr(0.30,0.62);
      var nd = ri(6,9);
      for(var d=0;d<nd;d++){
        var da = (d/nd)*Math.PI*2 + rr(-0.2,0.2);
        var dl = rr(0.6,1.1);
        var dp = loc(x,z, Math.cos(da)*trunkR*1.1, Math.sin(da)*trunkR*1.1, 0);
        BOX(dp[0], by+rr(-0.2,0.2), dp[1], dl, 0.14, 0.4, da, shade(trunkCol,-0.22), 'trunk');
      }
    }
  }
  var topY = y + h;
  var n = opt.leaves || ri(12,18);
  var leafLen = opt.leafLen || rr(2.4,3.6);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.12,0.12);
    var ll = leafLen*rr(0.85,1.15);
    var lp = loc(x,z, ll*0.5, 0, a);
    BOX(lp[0], topY+rr(-0.35,0.45), lp[1], ll, 0.16, ll*rr(0.30,0.42), a, shade(leafCol, rr(-0.1,0.1)), 'leaf');
  }
  BLOB(x, topY+0.1, z, trunkR*0.9, trunkR*0.7, rnd()*3, shade(leafCol,0.06), 'leaf');   /* closed inner bud */
}

/* ---- funerary objects, small to large ---------------------------------- */

/* a small grave: either a low earthen mound or a plain headstone-on-footing
   — modest footprint, meant to be scattered in numbers */
function grave(x,y,z,ry,col,opt){
  opt = opt || {};
  var c = col || pick(TONES_POOR);
  if(opt.mound){
    var r = opt.r || rr(1.4,2.0);
    BLOB(x, y, z, r, r*0.5, ry, shade(c,-0.1));
  }else{
    var w = opt.w || rr(0.8,1.1), hh = opt.h || rr(1.2,1.8), th = opt.th || 0.25;
    BOX(x, y, z, th, hh, w, ry, shade(c,-0.05));
    BOX(x, y-0.1, z, th*3.0, 0.2, w*1.6, ry, shade(c,-0.15));
  }
}

/* a family tomb: an enclosed vault sized for a clan rather than one person
   — bigger than a grave, smaller than a building — with a (false) door and
   a domed or peaked cap */
function familyTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(5,7), d = opt.d || rr(5,7), h = opt.h || rr(4,6);
  var c = col || pick(TONES);
  BOX(x, y, z, w, h, d, ry, c);
  BOX(x, y+h, z, w*1.06, 0.6, d*1.06, ry, shade(c,-0.12));
  var dp = loc(x,z, w*0.5+0.03, 0, ry);
  BOX(dp[0], y+0.2, dp[1], 0.3, h*0.55, w*0.34, ry, shade(c,-0.4), 'wood');
  if(opt.roof === 'dome' || (opt.roof === undefined && chance(0.5))){
    DOME(x, y+h+0.6, z, Math.min(w,d)*0.42, Math.min(w,d)*0.34, ry, pick(DOMEC), 'dome');
  }else{
    FR3(x, y+h+0.6, z, Math.min(w,d)*0.7, h*0.5, Math.min(w,d)*0.7, ry, shade(c,0.05));
  }
}

/* a large white marble funerary temple: the necropolis centrepiece. `col`
   is the marble tone — pass one from PAL.stone.marble (MARBLEC). Grey and
   jade/dark-green accent trim (PAL.stone.grey/GREYC, PAL.stone.jade/JADEC —
   both added alongside marble; checked first, nothing else in PAL reads
   either cool enough to read as inlay against pale marble) mark every
   course break: a grey socle underfoot, jade stringcourses between the
   plinth tiers, a jade dado round the cella foot, jade pilaster strips
   flanking the doorway, grey capitals on the colonnade, a jade tympanum
   inlay in the pediment, and a grey drum / jade fillet / jade finial
   stacking up to the dome — so the building reads, at any distance, as
   pale stone banded in dark accent rather than a single-tone recolour of
   an ordinary kind.
   Bigger than a standard compound, short of canton scale: a stepped
   stereobate, a colonnade ring, a projecting portico with its own
   pediment, and a crowning dome — deliberately not a variation on
   structure()'s hlaalu/velothi/domed/hovel kinds (flat parapets, one
   storey stack, one roof cap) but a tiered, porticoed mausoleum massing
   none of those touch. All 'stone'/'dome' family — no new draw call. */
function funeraryTemple(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 46, d = opt.d || 64, h = opt.h || 34;
  var mCol = col;
  var greyCol = opt.greyCol || pick(GREYC);
  var jadeCol = opt.jadeCol || pick(JADEC);
  var accum = y;

  /* grey socle: a single low, slightly oversized course the whole building
     sits on — the first accent band, readable from the approach track
     before anything else on the temple is */
  var socleW = w*1.22, socleD = d*1.16, socleH = h*0.035;
  BOX(x, accum, z, socleW, socleH, socleD, ry, greyCol);
  accum += socleH;

  var tiers = opt.plinthTiers || 3;
  var pw = w*1.14, pd = d*1.10, ph = h*0.05;
  for(var t=0;t<tiers;t++){
    BOX(x, accum, z, pw, ph, pd, ry, shade(mCol,-0.05+t*0.02));
    accum += ph;
    /* jade stringcourse between plinth tiers — offset up 0.05 so it never
       shares a face with the tier top it sits on (coplanar = z-fight) */
    if(t<tiers-1){
      BOX(x, accum+0.05, z, pw*0.985, ph*0.28, pd*0.985, ry, jadeCol);
    }
    pw *= 0.965; pd *= 0.965;
  }
  var deckY = accum;
  var cellaH = h*0.5;
  BOX(x, deckY, z, w*0.62, cellaH, d*0.72, ry, mCol);
  /* jade dado band round the cella base — a dark inlay course, not just a
     darker marble */
  BOX(x, deckY+0.05, z, w*0.635, cellaH*0.09, d*0.735, ry, jadeCol);
  /* jade pilaster strips flanking the doorway face (local +x, the portico
     side), a paired dark accent either side of the entrance */
  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.31, s*d*0.18, ry);
    BOX(pp[0], deckY, pp[1], w*0.03, cellaH*0.9, d*0.05, ry, jadeCol);
  });
  BOX(x, deckY+cellaH, z, w*0.66, h*0.04, d*0.76, ry, greyCol);
  var nCols = opt.columns || 18;
  var colR = Math.min(w,d)*0.018+0.5, colH = cellaH*0.94;
  for(var i=0;i<nCols;i++){
    var t2 = i/nCols;
    var ex = Math.cos(t2*Math.PI*2), ez = Math.sin(t2*Math.PI*2);
    var cx = x + ex*w*0.54, cz = z + ez*d*0.47;
    CYL(cx, deckY, cz, colR, colH, 0, shade(mCol,0.03));
    BOX(cx, deckY+colH, cz, colR*2.6, colH*0.05, colR*2.6, 0, greyCol);
  }
  /* portico offset: half the cella's own local-x extent (w*0.31) plus half
     the portico box's own local-x extent (pW/2 = w*0.25), minus a slight
     overlap so the two volumes actually share a face instead of floating
     a gap apart — the old w*0.68 offset (0.12w past a flush fit) was the
     "front portion doesn't fully connect to the rest of the building" gap
     the owner flagged. */
  var porticoX = w*0.31 + w*0.25 - w*0.03;
  var portico = loc(x,z, porticoX, 0, ry);
  var pW = w*0.5, pD = d*0.20;
  BOX(portico[0], deckY, portico[1], pW, cellaH*0.92, pD, ry, shade(mCol,0.02));
  var pedY = deckY+cellaH*0.92;
  FR3(portico[0], pedY, portico[1], pW*1.04, h*0.12, pD*1.04, ry, shade(mCol,0.05));
  /* jade tympanum inlay set into the pediment face, facing the approach */
  var tymp = loc(x,z, porticoX+pD*0.52+0.05, 0, ry);
  BOX(tymp[0], pedY+0.1, tymp[1], pW*0.34, h*0.05, pD*0.12, ry, jadeCol);
  [-1,1].forEach(function(s){
    var cp = loc(x,z, porticoX+pD*0.5-0.6, s*pW*0.36, ry);
    CYL(cp[0], deckY, cp[1], colR*1.15, cellaH*0.90, 0, shade(mCol,0.04));
    BOX(cp[0], deckY+cellaH*0.90, cp[1], colR*1.15*2.6, colH*0.05, colR*1.15*2.6, 0, greyCol);
  });
  /* owner: "funerary temple needs a proper door". There was none anywhere on
     the building — the jade pilasters above are described in their own
     comment as "flanking the doorway face", but the face between them was
     blank marble, and that face is in any case buried: the portico is a
     solid block occupying local x from porticoX-pW/2 to porticoX+pW/2
     (w*0.28 .. w*0.78), which completely encloses the cella's own front.
     A door on the cella therefore cannot be seen at all — tried, screenshotted,
     invisible. The real entrance face is the PORTICO's outward face, so the
     door goes there, which is also where anyone climbing the temple steps
     actually arrives. Recessed dark reveal, twin leaves, grey lintel and the
     half-dome arch cap the chapel and monastery openings already use, plus a
     threshold slab. All already-spent buckets — no new draw call. */
  var fdFrontX = porticoX + pW*0.5;
  var fdW = pD*0.70, fdH = cellaH*0.52;
  var fdP = loc(x,z, fdFrontX+0.05, 0, ry);
  BOX(fdP[0], deckY, fdP[1], 0.60, fdH, fdW, ry, shade(jadeCol,-0.45));
  [-1,1].forEach(function(s){
    var lp = loc(x,z, fdFrontX+0.26, s*fdW*0.26, ry);
    BOX(lp[0], deckY, lp[1], 0.38, fdH*0.97, fdW*0.46, ry, shade(TRUNKC[0],-0.30), 'wood');
  });
  var fdL = loc(x,z, fdFrontX+0.12, 0, ry);
  BOX(fdL[0], deckY+fdH, fdL[1], 0.85, cellaH*0.05, fdW*1.25, ry, greyCol);
  /* a flat jade tympanum panel over the lintel, NOT a half-dome. The dome
     cap used elsewhere (chapel, monastery gates) is sized against a narrow
     opening; at this door's width it rendered as a huge green blob
     swallowing the entrance — the same "reads as a giant mushroom cap"
     failure the abbey gate's own crown hit and whose comment warns about
     sizing a cap off the gap rather than off the trim. A panel also matches
     this building's own vocabulary: it already sets a jade tympanum into
     the pediment face above. */
  BOX(fdL[0], deckY+fdH+cellaH*0.05, fdL[1], 0.5, cellaH*0.10, fdW*0.86, ry, jadeCol);
  var fdS = loc(x,z, fdFrontX+1.1, 0, ry);
  BOX(fdS[0], deckY-0.35, fdS[1], 2.2, 0.7, fdW*1.35, ry, shade(mCol,-0.06));
  var domeR = Math.min(w,d)*0.30;
  /* grey drum, jade fillet, marble dome, jade finial — dark accents stack
     right to the top rather than stopping at the cornice line */
  CYL(x, deckY+cellaH+h*0.04, z, domeR*1.05, h*0.06, 0, greyCol);
  CYL(x, deckY+cellaH+h*0.10, z, domeR*1.01, h*0.02, 0, jadeCol);
  DOME(x, deckY+cellaH+h*0.12, z, domeR, domeR*0.85, 0, mCol, 'dome');
  CONE(x, deckY+cellaH+h*0.12+domeR*0.85, z, domeR*0.08, h*0.05, 0, jadeCol);
}

/* ---- the Temple canton's own sacrifice platform — the owner: "the
   Temple canton has a high priest... that comes out and does a
   sacrifice every so often (we may need to rework the architecture of
   the temple canton, but for now add a hanging platform and door to one
   of the topmost tiers, with an altar)." A real rework is future work;
   this is exactly that minimal addition — a platform projecting out from
   the topmost tier (CANTON_TOPS['Temple'], 50-cantons.js, already fully
   populated by the time this file's own top-level code runs), a door
   where it meets the tier, and a small altar/brazier at the outer end.
   Faces away from the canton's own centre, roughly outward toward open
   water — visible from the bay rather than hidden against the tier
   behind it. TEMPLE_ALTAR is exported as a plain global (this file runs
   before 78-life.js) so the life layer's high priest has somewhere real
   to walk to. */
/* owner, revised design: "underneath [the raised dome] will be the
   sacrificial altar. the top platform will have a stairway the high
   priest can spawn in and out of." Replaces the old off-centre "hanging
   platform projecting out from the tier" (screenshot-tuned for the
   pre-pillar dome) with the altar centred under the new 8-pillar dome
   (TEMPLE_PILLAR_RING_R, set by templeCanton() just above, in the same
   window-global pattern CANTON_TOPS itself uses) and a real staircase at
   the platform's outward edge standing in for the old door — the high
   priest's own spawn/despawn point (TEMPLE_ALTAR.doorX/doorZ) sits at
   the staircase's base landing, same geometric spot the old door occupied
   (c.x+dirX*top.hw), so 78-life.js's routing needs no changes at all. */
var TEMPLE_ALTAR = null;
window.TEMPLE_BRAZIERS = [];
(function(){
  var c = CIDX['Temple']; if(!c) return;
  var top = CANTON_TOPS['Temple']; if(!top) return;
  var angle = Math.atan2(-c.z, -c.x);
  var dirX = Math.cos(angle), dirZ = Math.sin(angle);
  var ry = Math.atan2(dirX, dirZ);

  /* the altar, centred under the dome, inside the pillar ring */
  var altarX = c.x, altarZ = c.z, altarY = top.y + 0.3;
  BOX(altarX, altarY, altarZ, 6.0, 2.4, 4.0, ry, shade(c.tone,0.08));
  CYL(altarX, altarY+2.4, altarZ, 0.4, 1.4, 0, 0x6b1f1f);

  /* a real staircase at the platform's outward edge, descending toward
     the tier below — the high priest's own visible spawn/despawn point,
     not just an abstract door-in-a-wall anymore. 7 steps, ~0.5 units of
     rise each, landing on the platform itself. */
  var stepN = 7, stepW = 6.0, stepD = 1.15, stepH = 0.5;
  var doorX = c.x + dirX*top.hw, doorZ = c.z + dirZ*top.hw;
  for(var st=0; st<stepN; st++){
    var stY = top.y - st*stepH;
    var stX = doorX + dirX*(st*stepD), stZ = doorZ + dirZ*(st*stepD);
    BOX(stX, stY, stZ, stepW, 0.5, stepD*1.05, ry, shade(c.tone, st%2 ? 0.02 : -0.06));
  }
  [-1,1].forEach(function(side){
    var sx = doorX + (-dirZ)*side*stepW*0.5, sz = doorZ + (dirX)*side*stepW*0.5;
    var ex = sx + dirX*(stepN*stepD*0.5), ez = sz + dirZ*(stepN*stepD*0.5);
    BOX(ex, top.y - (stepN*stepH*0.5) + 0.5, ez, 0.6, stepN*stepH+1.0, stepN*stepD, ry, shade(c.tone,-0.18));
  });
  TEMPLE_ALTAR = { x:altarX, z:altarZ, y:altarY+2.4, doorX:doorX, doorZ:doorZ, ry: ry+Math.PI };

  /* owner: "at high noon every day, he will... light large golden braziers
     on all 4 temple corners" — then, once the pillared dome was built,
     caught they weren't actually visible and clarified: "they should be
     on the same level/platform as the altar." Real bug in the first
     version: positioned at top.hw*0.80, the EXACT SAME (x,z) the four tall
     corner spires (templeCanton()'s own "four corner spires" loop) use for
     their own FR3 shaft base — a shaft with a 5-unit half-width entirely
     swallows a ~2-unit-radius brazier bowl at the same centre, so they
     were rendering but completely entombed inside the spires, invisible.
     Now at the 4 diagonal corners of the ALTAR itself, radius comfortably
     inside the pillar ring (TEMPLE_PILLAR_RING_R) so they sit in the open
     colonnade on the platform floor, nowhere near the spires. Static
     bowl/stand geometry (always visible, cheap — reuses the existing box/
     cyl 'stone'/'wood' buckets); the actual noon-to-sunrise GLOW is a
     separate, animated effect that needs a mesh already in the per-frame
     render loop, not this static bake — src/82-daynight.js reads
     window.TEMPLE_BRAZIERS (populated below) and folds these 4 points
     into its existing night-light InstancedMesh, driving them on their
     own timer instead of the shared dusk/dawn one. */
  var brazierR = Math.min(window.TEMPLE_PILLAR_RING_R*0.55, 9.0);
  for(var bz=0; bz<4; bz++){
    var ba = Math.PI/4 + bz*Math.PI/2;
    var bx = altarX + Math.cos(ba)*brazierR, bzz = altarZ + Math.sin(ba)*brazierR;
    var bowlY = top.y;
    CYL(bx, bowlY, bzz, 1.1, 3.0, 0, shade(c.tone,-0.05), 'wood');
    CYL(bx, bowlY+3.0, bzz, 2.0, 1.4, 0, 0xc9a227);
    CYL(bx, bowlY+3.6, bzz, 1.5, 0.6, 0, shade(0xc9a227,-0.15));
    window.TEMPLE_BRAZIERS.push({ x:bx, y:bowlY+4.4, z:bzz });
  }
})();

