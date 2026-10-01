/* ============================== 19e. DISTRICT CONTENT ======================
   Content for the market/park/funerary polygons defined in 30-layout.js.
   Runs after 60-land.js (claim()/PLACED exist, and the compound/town passes
   have already skipped every district via districtAt()) and 68-props.js
   (the reusable prop functions exist), before 70-veg.js (whose ordinary
   scatter needs to skip these polygons — see the edit there). Reuses
   65-facade.js's reusable objects (statue, obelisk, the bench and brazier
   pairs, grave, familyTomb, funeraryTemple, baobab, dragonTree,
   cherryBlossom, emperorMushroom)
   — all plain function declarations, hoisted, safe to call from here
   regardless of their file's later position in build order. */
reseed(690001);

function polyBounds(poly){
  var x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  poly.forEach(function(p){ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); z0=Math.min(z0,p[1]); z1=Math.max(z1,p[1]); });
  return {x0:x0,x1:x1,z0:z0,z1:z1, cx:(x0+x1)/2, cz:(z0+z1)/2};
}
function pointInPoly(x,z,poly){
  var inside=false;
  for(var a=0,b=poly.length-1; a<poly.length; b=a++){
    var xa=poly[a][0], za=poly[a][1], xb=poly[b][0], zb=poly[b][1];
    if(((za>z)!==(zb>z)) && (x < (xb-xa)*(z-za)/(zb-za)+xa)) inside=!inside;
  }
  return inside;
}
/* face (x,z) toward (tx,tz) — same atan2(-dz,dx) derivation used earlier
   this session for faceStreet(): loc()'s local +x direction in world space
   is (cos(ry),-sin(ry)), so aligning that with the unit vector toward the
   target solves to this. */
function faceToward(x,z,tx,tz){ return Math.atan2(-(tz-z), (tx-x)); }
/* true only when (x,z) sits inside a ring/highway road's own corridor —
   deliberately narrower than openAt(): that general mask also excludes
   low ground and the shoreline margin, which covers much of a harbour-
   side market/park polygon's own interior and isn't what this needs. A
   citywide ring/highway obstruction audit found stalls, edge shops and
   exotic trees whose polygon-bounds-only placement had no road awareness
   at all (this file never calls nearestStreet or openAt otherwise); this
   is the minimal, ring/highway-specific gate for those three spots. */
function onRingHwy(x, z, halfExtent){
  var near = nearestStreet(x, z, {ring:true, highway:true});
  return !!(near && near.dist < near.width*0.5 + halfExtent);
}
function perimeterPoint(poly, t){
  /* t in [0,1) around the polygon, by arc length */
  var lens=[0], total=0;
  for(var i=0;i<poly.length;i++){
    var a=poly[i], b=poly[(i+1)%poly.length];
    total += Math.hypot(b[0]-a[0], b[1]-a[1]); lens.push(total);
  }
  var d = t*total;
  for(var k=0;k<poly.length;k++){
    if(d <= lens[k+1]){
      var a2=poly[k], b2=poly[(k+1)%poly.length], segLen=lens[k+1]-lens[k];
      var u = segLen>0 ? (d-lens[k])/segLen : 0;
      return [a2[0]+(b2[0]-a2[0])*u, a2[1]+(b2[1]-a2[1])*u];
    }
  }
  return poly[0];
}

var DIST_MARKET    = DISTRICTS.filter(function(d){ return d.type==='market'; });
var DIST_PARK      = DISTRICTS.filter(function(d){ return d.type==='park'; });
var DIST_FUNERARY  = DISTRICTS.filter(function(d){ return d.type==='funerary'; });
var DIST_WAREHOUSE = DISTRICTS.filter(function(d){ return d.type==='warehouse'; });
window._exotic = { baobab:0, dragonTree:0, cherryBlossom:0, emperorMushroom:0 };
var DIST_STALLS = 0, DIST_SHOPS = 0, DIST_MONUMENTS = 0, DIST_GRAVES = 0, DIST_TOMBS = 0, DIST_WAREHOUSES = 0;

/* ---- market stall goods: fruit/bread/cheese piles on the counter, all
   through EXISTING families (leaf/wood) so this adds no new draw call —
   the draw-call budget is at 50/50 with zero headroom this session.
   Colours are shade()s of existing PAL arrays (FRUITC, TRUNKC) plus one
   inline pale-cheese hex, the same "one-off literal, not a new named
   array" precedent already used for the farm field bank colour
   elsewhere in this file's neighbourhood (61-monastery.js). */
function stallGoods(sx, sz, topY, sw, sd, ry, kind){
  if(kind === 'exotic'){
    /* THIRD PASS (50-cantons.js's Guild-canton merchant annex): "exotic
       goods" — silk bolts, small gem/ore fragments, a couple of tall
       ceramic jars — reusing box|cloth, box|metal and cyl|wood/stone,
       every one already spent well before this stall exists, so still
       zero new draw calls despite being a 4th kind. Deliberately reads
       richer/shinier than fruit/bread/cheese (JADEC/metal accents instead
       of food tones) so the merchant guild's own stall is visibly the
       showpiece, not just another produce counter. */
    var nSilk = ri(2,3);
    for(var si=0; si<nSilk; si++){
      var p0 = loc(sx,sz, (si-(nSilk-1)/2)*(sw*0.28), rr(-sd*0.18,sd*0.18), ry);
      BOX(p0[0], topY+0.35, p0[1], sw*0.22, 0.5, sd*0.30, ry, pick(JADEC), 'cloth');
    }
    var nGem = ri(3,5);
    for(var gi=0; gi<nGem; gi++){
      var p1 = loc(sx,sz, rr(-sw*0.30,sw*0.30), rr(-sd*0.26,sd*0.26), ry);
      BOX(p1[0], topY+0.18, p1[1], rr(0.20,0.34), rr(0.16,0.28), rr(0.20,0.34), rr(0,Math.PI*2), shade(ROOFS[5], rr(-0.1,0.2)), 'metal');
    }
    var jp = loc(sx,sz, sw*0.30, -sd*0.22, ry);
    CYL(jp[0], topY, jp[1], rr(0.30,0.40), rr(0.9,1.3), ry, shade(JADEC[1], -0.1), 'stone');
  }else if(kind === 'fruit'){
    var n = ri(4,7);
    for(var i=0;i<n;i++){
      var p = loc(sx,sz, rr(-sw*0.34,sw*0.34), rr(-sd*0.34,sd*0.34), ry);
      BLOB(p[0], topY, p[1], rr(0.24,0.38), rr(0.28,0.46), rnd()*3, pick(FRUITC), 'leaf');
    }
  }else if(kind === 'bread'){
    var nb = ri(3,5);
    for(var j=0;j<nb;j++){
      var t = (j - (nb-1)/2) * (sw*0.30);
      var p2 = loc(sx,sz, t, rr(-sd*0.18,sd*0.18), ry);
      CYL(p2[0], topY, p2[1], rr(0.30,0.40), rr(0.55,0.80), ry, shade(TRUNKC[1], 0.18), 'wood');
    }
  }else{
    var nc = ri(2,4);
    for(var k=0;k<nc;k++){
      var p3 = loc(sx,sz, rr(-sw*0.28,sw*0.28), rr(-sd*0.28,sd*0.28), ry);
      CYL(p3[0], topY, p3[1], rr(0.34,0.52), rr(0.22,0.36), ry, shade(0xd8c060, rr(-0.08,0.08)), 'wood');
    }
  }
}
var STALL_GOODS = ['fruit','bread','cheese'];

/* ---- markets: stall rows aligned to the bounding street, edge shops -----
   Owner: "the current ones look short and squat... give at least some of
   them defined merchandise... some of them may need to be made bigger."
   Was a single 2-2.6-tall crate with an awning sitting almost on top of
   it — reads as a box, not a stall to stand at. Redesigned as a counter
   at table height (not full body height) on 4 corner posts, with the
   awning raised well above head height on those posts instead of resting
   directly on the crate; ~28% of stalls are a bigger two-post-spacing
   variant, and ~65% get a merchandise pile on the counter. */
reseed(690010);
/* the owner's follow-up: "one shopkeeper per 2 market stalls" — 78-life.js
   reads this list to build that commute (a random house within 500 units,
   out at sunrise, home at sunset). Populated stall-by-stall below; a
   plain global, not a diagnostic export, since 78-life.js consumes it
   directly at its own top level (69 loads before 78, so it's already
   full by then — no hoisting risk). */
var MARKET_STALLS = [];
DIST_MARKET.forEach(function(d){
  var b = polyBounds(d.poly);
  var ns = nearestStreet(b.cx, b.cz);
  var tx = ns ? ns.tangent[0] : 1, tz = ns ? ns.tangent[1] : 0;
  var nx = -tz, nz = tx;                       /* perpendicular to the bounding street */
  var rowGap = 15, stallGap = 10, aisleEvery = 3;
  var span = Math.max(b.x1-b.x0, b.z1-b.z0) * 0.62;
  var rowCount = Math.max(2, Math.floor(span*2/rowGap));
  for(var r=0;r<rowCount;r++){
    if(r % aisleEvery === aisleEvery-1) continue;    /* a clear aisle every 4th row */
    var rowOff = (r - rowCount/2)*rowGap;
    var rowX = b.cx + nx*rowOff, rowZ = b.cz + nz*rowOff;
    var nStalls = Math.max(1, Math.floor(span*2/stallGap));
    for(var s=0;s<nStalls;s++){
      var t = (s - nStalls/2)*stallGap;
      var sx = rowX + tx*t, sz = rowZ + tz*t;
      if(!pointInPoly(sx,sz,d.poly)) continue;
      var ry = Math.atan2(tx,tz);
      var big = chance(0.28);
      var claimR = big ? 3.6 : 2.4;
      /* Market D (30-layout.js) sits right where the S highway crosses its
         own polygon — the market/funerary comment elsewhere in that file
         is explicit that, unlike a park, these polygons are NOT meant to
         be crossed by the road network. This row-and-aisle layout is
         purely a function of the polygon's own bounds, with no road
         awareness at all: a citywide ring/highway obstruction audit found
         a visible run of stall canopies sitting on the highway's own
         paved strip here. onRingHwy() (not the general openAt() mask,
         which also excludes low/near-shore ground and lost more than half
         of every market's stalls when tried here first) is the narrow,
         ring/highway-specific gate. */
      if(onRingHwy(sx,sz,claimR)) continue;
      if(!claim(sx,sz,claimR,claimR,ry,'stall')) continue;
      var sw = big ? rr(6.5,8.5) : rr(3.8,5.2), sd = big ? rr(6.5,8.5) : rr(3.8,5.2);
      var counterH = big ? rr(1.05,1.25) : rr(0.85,1.05);
      var postH = big ? rr(2.7,3.1) : rr(2.3,2.6);
      var sy = terrainH(sx,sz);
      BOX(sx, sy, sz, sw, counterH, sd, ry, pick(TONES_POOR), 'wood');
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){
        var p = loc(sx,sz, c[0]*sw*0.42, c[1]*sd*0.42, ry);
        BOX(p[0], sy, p[1], 0.30, postH, 0.30, ry, pick(TRUNKC), 'wood');
      });
      FR8(sx, sy+postH, sz, sw*1.32, 0.75, sd*1.32, ry, pick(BANNERC), 'cloth');
      if(chance(0.65)) stallGoods(sx, sz, sy+counterH, sw, sd, ry, pick(STALL_GOODS));
      DIST_STALLS++;
      MARKET_STALLS.push({ x:sx, z:sz, ry:ry, sd:sd });
    }
  }
  /* edge shops: sampled evenly round the perimeter, facing the centroid */
  var edgeN = 10;
  for(var e=0;e<edgeN;e++){
    var p = perimeterPoint(d.poly, e/edgeN);
    var ry2 = faceToward(p[0],p[1], b.cx,b.cz);
    var inward = loc(p[0],p[1], 7, 0, ry2);      /* nudge in from the boundary */
    if(!pointInPoly(inward[0],inward[1],d.poly)) continue;
    /* same road-corridor gap as the stall rows above: Market C and Market E
       both have a ring road crossing their own polygon, and this loop's
       inward-nudge is a fixed 7 units regardless of where a road happens
       to run — not enough by itself. */
    if(onRingHwy(inward[0],inward[1],5)) continue;
    if(!claim(inward[0],inward[1],5,4,ry2,'shop')) continue;
    structure(inward[0], terrainH(inward[0],inward[1]), inward[1], rr(7,10), rr(6,8), rr(8,14), ry2, 'hlaalu', pick(TONES));
    DIST_SHOPS++;
  }
});

/* ---- parks: exotic vegetation (park-only) + monuments -------------------- */
reseed(690020);
DIST_PARK.forEach(function(d){
  var b = polyBounds(d.poly);
  var area = (b.x1-b.x0)*(b.z1-b.z0);
  /* bumped ~3.7x per the owner's request — floor raised too, so even a
     small district (the promontory triangle) still reads as planted rather
     than nearly empty */
  var nPlant = Math.max(28, Math.round(area/700));
  var mushroomsLeft = 2;                         /* landmark-sized — one or two per park, not scattered */
  for(var i=0;i<nPlant;i++){
    var x = rr(b.x0,b.x1), z = rr(b.z0,b.z1);
    if(!pointInPoly(x,z,d.poly)) continue;
    if(districtAt(x,z) !== 'park') continue;     /* stay clear of any polygon overlap */
    /* park polygons are deliberately NOT gated against ROADS (30-layout.js:
       "the owner explicitly wants major streets and highways free to run
       across it") — the NW highway crosses the Abbey Close park, so a tree
       scattered purely from the polygon's own bounds can still land right
       on its paved strip. onRingHwy() is the narrow, ring/highway-specific
       gate (not openAt(): that general mask also excludes low/near-shore
       ground and cut nearly half the exotic trees when tried here first,
       almost none of them actually near a road); the highway is still
       free to cross the park, this just keeps a trunk from growing in the
       middle of it. */
    if(onRingHwy(x,z,2.4)) continue;
    if(!claim(x,z,2.4,2.4,rnd()*Math.PI*2,'exotic')) continue;
    var y = terrainH(x,z), ry3 = rnd()*Math.PI*2, pick4 = rnd();
    if(mushroomsLeft>0 && pick4<0.08){ emperorMushroom(x,y,z,ry3,null,{}); mushroomsLeft--; window._exotic.emperorMushroom++; }
    else if(pick4<0.35){ cherryBlossom(x,y,z,ry3,pick(BLOOMC),{}); window._exotic.cherryBlossom++; }
    else if(pick4<0.62){ dragonTree(x,y,z,ry3,null,{}); window._exotic.dragonTree++; }
    else{ baobab(x,y,z,ry3,null,{}); window._exotic.baobab++; }
  }
  /* monuments: 4x the previous count, per the owner's request */
  for(var k=0;k<16;k++){
    var mx2 = rr(b.x0,b.x1), mz2 = rr(b.z0,b.z1);
    if(!pointInPoly(mx2,mz2,d.poly)) continue;
    if(onRingHwy(mx2,mz2,1.6)) continue;   /* same highway-through-the-park gap as the exotic trees above */
    if(!claim(mx2,mz2,1.6,1.6,rnd()*Math.PI*2,'monument')) continue;
    var ry4 = rnd()*Math.PI*2, my = terrainH(mx2,mz2);
    var mk = rnd();
    if(mk<0.4) (chance(0.5)?benchOrnate:benchPlain)(mx2,my,mz2,ry4,null,{});
    else if(mk<0.75) (chance(0.5)?brazierOrnate:brazierPlain)(mx2,my,mz2,ry4,null,{});
    else if(mk<0.9) statue(mx2,my,mz2,ry4,null,{});
    else obelisk(mx2,my,mz2,ry4,null,{});
    DIST_MONUMENTS++;
  }
});

/* ---- funerary: dense graves and tombs, one temple, a short track back ----
   Density, hoisted per the CHINP convention (API.md §9 — "change numbers,
   rebuild, look"): the owner's ask was "roughly 70% of the district's
   available area/slots filled". The old knob (nGraves = area/400 random-
   scatter attempts) wasn't actually that fraction — it was already
   succeeding on ~93% of its own tiny attempt count (claim() rarely had
   anything nearby to clash with), so the field still read as sparse
   because so few attempts were ever made, not because many were rejected.
   Real fill fraction needs a real grid of candidate slots to be a fraction
   OF: FUNP.gravePitch/tombPitch lay one down (with a little jitter so it
   doesn't read as a machine grid), FUNP.graveFill/tombFill is the owner's
   70%, checked per slot with chance() — claim() still rejects the rare
   case a jittered slot lands on top of the temple or a tomb already there. */
var FUNP = {
  gravePitch: 5.5,     /* one grave slot every ~5.5 units — a grave is a
                           1.2 half-extent footprint, so this leaves a real
                           walkable gap between mounds at 100% fill        */
  graveFill : 0.70,    /* the owner's own number                          */
  tombPitch : 30,      /* family tombs are a 4.5 half-extent landmark, not
                           filler — wide enough to walk a small tomb row   */
  tombFill  : 0.70
};
reseed(690030);
/* a low perimeter fence, post-and-rail, around the whole polygon — left
   open at every point some real road actually crosses the boundary
   (gates array, below), so no approach is fenced shut. Existing families
   only (wood posts/rails). */
function fenceAround(poly, gates, gateRadius){
  for(var i=0;i<poly.length;i++){
    var a=poly[i], bb=poly[(i+1)%poly.length];
    var dx=bb[0]-a[0], dz=bb[1]-a[1], L=Math.hypot(dx,dz);
    var seg = 6, n = Math.max(1, Math.round(L/seg));
    var ry = Math.atan2(dx,dz);
    for(var k=0;k<n;k++){
      var t0=k/n, t1=(k+1)/n;
      var x0=a[0]+dx*t0, z0=a[1]+dz*t0, x1=a[0]+dx*t1, z1=a[1]+dz*t1;
      var mx=(x0+x1)/2, mz=(z0+z1)/2;
      var gated = gates.some(function(g){ return Math.hypot(mx-g.x,mz-g.z) < gateRadius; });
      if(gated) continue;   /* a gate's own gap */
      var y = terrainH(mx,mz);
      BOX(mx, y, mz, 0.35, 1.3, L/n*1.02, ry, 0x6b5942, 'wood');
      BOX(x0, y, z0, 0.4, 1.5, 0.4, 0, 0x5a4a38, 'wood');
    }
  }
}
/* owner: "except where roads cross in, there is an arched white gate
   there" — a real crossing detector against the live ROADS array (30-
   layout.js), not a single hand-picked approach: every polygon edge is
   tested against every road polyline segment for a genuine 2D
   intersection, then crossings within mergeR of each other (a road's own
   multi-segment polyline can clip a single boundary edge more than once,
   and two near-parallel minor streets can enter within a few units of
   each other) are folded into one gate. General over any DIST_FUNERARY
   polygon, not hardcoded to this one district. */
function segXsegX(ax,az,bx,bz, cx,cz,dx,dz){
  var r1x=bx-ax, r1z=bz-az, r2x=dx-cx, r2z=dz-cz;
  var den = r1x*r2z - r1z*r2x;
  if(Math.abs(den) < 1e-9) return null;
  var t = ((cx-ax)*r2z - (cz-az)*r2x) / den;
  var u = ((cx-ax)*r1z - (cz-az)*r1x) / den;
  if(t<0||t>1||u<0||u>1) return null;
  return [ax+r1x*t, az+r1z*t];
}
function polyRoadCrossings(poly, mergeR){
  var hits = [];
  for(var i=0;i<poly.length;i++){
    var a=poly[i], bb=poly[(i+1)%poly.length];
    ROADS.forEach(function(r){
      for(var k=0;k<r.pts.length-1;k++){
        var p0=r.pts[k], p1=r.pts[k+1];
        var ix = segXsegX(a[0],a[1],bb[0],bb[1], p0[0],p0[1],p1[0],p1[1]);
        if(ix) hits.push({ x:ix[0], z:ix[1], w:r.w, edx:bb[0]-a[0], edz:bb[1]-a[1] });
      }
    });
  }
  var out = [];
  hits.forEach(function(h){
    var near = null;
    for(var j=0;j<out.length;j++){ if(Math.hypot(out[j].x-h.x,out[j].z-h.z) < mergeR){ near=out[j]; break; } }
    if(near){ near.w = Math.max(near.w, h.w); }
    else out.push(h);
  });
  return out;
}
/* jambs + lintel + a shallow dome cap — this codebase's own "arch" idiom
   (61-monastery.js's compound side-gates use the identical trick: a solid
   box-plus-dome plug reads as a mushroom, not a gate, so real jambs flank
   a genuine opening and the dome caps OVER it). White per the owner —
   MARBLEC, the same pale family the funerary temple itself already uses.
   Box+dome, both already-live buckets — no new draw call. */
function funeraryGate(x,y,z,ry,gap,col){
  col = col || MARBLEC[0];
  /* jamb height scales with the opening — these are road-width gates
     (14-28.5 units), not the monastery's man-height wicket, so the fixed
     wh that idiom used there reads as a stub here; the dome cap stays a
     small crown, not a scaled copy of the whole opening (that read as a
     giant floating ball on sticks at this width — dome radius pinned
     well under the jamb height instead of the monastery's gap*0.42).

     Owner: "funerary district gates are perpendicular to how they should
     be" — real bug: this `ry` is the FENCE EDGE's own tangent bearing
     (Math.atan2(dx,dz), the "align along a heading" convention used for
     every wall/fence segment in this file), and for THAT convention
     loc()'s local +z is what lines up with the tangent — local +x is
     perpendicular to it (in/out through the gap), the opposite of the
     compound gate's own ry (a straight facing bearing, where +x IS the
     walk-through direction). This had the jambs separated along local x
     (perpendicular to the fence) instead of along local z (along it),
     so the "gate" straddled the fence line sideways instead of sitting
     in a gap cut into its run. Jambs/lintel now vary in z, thin in x. */
  var wh = Math.max(6.5, gap*0.34), wt = 1.6;
  var jambW = gap*0.13, openHalf = gap*0.5 - jambW*0.5;
  [-1,1].forEach(function(js){
    var jp = loc(x,z, 0, js*(openHalf+jambW*0.5), ry);
    BOX(jp[0], y, jp[1], wt, wh, jambW, ry, col);
    BOX(jp[0], y+wh, jp[1], wt*1.2, 0.55, jambW*1.25, ry, shade(col,-0.06));
  });
  var archY = y + wh + 0.55;
  BOX(x, archY, z, wt*1.1, wh*0.14, gap*1.02, ry, shade(col,-0.03));
  DOME(x, archY+wh*0.14, z, Math.min(gap*0.5, wh*0.6), Math.min(gap*0.5, wh*0.6)*0.5, ry, shade(col,-0.02));
}
DIST_FUNERARY.forEach(function(d){
  var b = polyBounds(d.poly);
  var gates = polyRoadCrossings(d.poly, 35);
  /* the temple FIRST, before a single grave is placed — claim() only
     rejects a candidate that collides with something already down, so
     placing the temple last (the old order) meant a dense grave/tomb
     pass could fill its exact footprint first and the temple claim would
     then just fail outright. Position: the owner's follow-up — "temple
     goes at the end of that major highway" — found live against ROADS,
     not guessed: the city's widest boulevard (w:19, the top class short
     of the intercity highways) already dead-ends at [1840.1,562.2],
     right inside this polygon's own west edge. The temple sits a further
     ~50 units along that same bearing (clear of the paved terminus
     itself, not sitting on top of it), which lands almost exactly on the
     polygon's own centroid — the boulevard was aimed at the middle of
     this ground already. */
  var blvdEnd = { x:1840.1, z:562.2 }, blvdPrev = { x:1460.66, z:582.19 };
  var bex = blvdEnd.x-blvdPrev.x, bez = blvdEnd.z-blvdPrev.z, beL = Math.hypot(bex,bez);
  var tx3 = blvdEnd.x + (bex/beL)*50, tz3 = blvdEnd.z + (bez/beL)*50;
  if(claim(tx3,tz3, 40, 32, 0, 'temple')){
    /* owner: the funerary temple's doorway (portico, local +x) should face
       the Temple canton's dome across the bay, not the approach road. */
    var templeC3 = CIDX['Temple'];
    var funRy = templeC3 ? faceToward(tx3, tz3, templeC3.x, templeC3.z) : -Math.PI/2;
    funeraryTemple(tx3, terrainH(tx3,tz3), tz3, funRy, MARBLEC[0], {});
  }
  /* tombs next (still before the dense grave fill, so a tomb slot always
     gets first claim on its own ground rather than fighting a grave for
     it), then graves — both a real fill fraction over a real grid of
     candidate slots, not a random-scatter attempt count (see FUNP above). */
  for(var tzc=b.z0; tzc<b.z1; tzc+=FUNP.tombPitch){
    for(var txc=b.x0; txc<b.x1; txc+=FUNP.tombPitch){
      var tx2 = txc + rr(0, FUNP.tombPitch*0.5), tz2 = tzc + rr(0, FUNP.tombPitch*0.5);
      if(!pointInPoly(tx2,tz2,d.poly)) continue;
      if(!chance(FUNP.tombFill)) continue;
      if(!claim(tx2,tz2,4.5,4.5,rnd()*Math.PI*2,'tomb')) continue;
      familyTomb(tx2, terrainH(tx2,tz2), tz2, rnd()*Math.PI*2, null, {});
      DIST_TOMBS++;
    }
  }
  for(var gz=b.z0; gz<b.z1; gz+=FUNP.gravePitch){
    for(var gx=b.x0; gx<b.x1; gx+=FUNP.gravePitch){
      var x = gx + rr(0, FUNP.gravePitch*0.6), z = gz + rr(0, FUNP.gravePitch*0.6);
      if(!pointInPoly(x,z,d.poly)) continue;
      if(!chance(FUNP.graveFill)) continue;
      if(!claim(x,z,1.2,1.2,rnd()*Math.PI*2,'grave')) continue;
      grave(x, terrainH(x,z), z, rnd()*Math.PI*2, null, { mound: chance(0.4) });
      DIST_GRAVES++;
    }
  }
  var gateR = 20;
  fenceAround(d.poly, gates, gateR);
  gates.forEach(function(g){
    var ry5 = Math.atan2(g.edx, g.edz);
    funeraryGate(g.x, terrainH(g.x,g.z), g.z, ry5, Math.max(14, Math.min(gateR*1.7, g.w*1.5)), MARBLEC[0]);
  });
});

/* ---- warehouse district: a small grid of large plain sheds, aligned to
   the river bank it sits on (its own polygon's first edge is that bank's
   own tangent — there's no street out here to align to instead). This
   is also where merchant caravans (78-life.js) deliver/collect cargo —
   see LIFE_CARAVAN_DESTS there. */
reseed(690040);
DIST_WAREHOUSE.forEach(function(d){
  /* the true polygon centroid, not polyBounds()'s axis-aligned bbox
     centre — this district is a skewed parallelogram following the
     river bank, and a bbox centre lands measurably off the shape's own
     middle for a skew like that, which was pushing most of the grid's
     candidate slots outside pointInPoly (only 2 of 8 ever landed). */
  var ccx=0, ccz=0;
  d.poly.forEach(function(p){ ccx+=p[0]; ccz+=p[1]; });
  ccx/=d.poly.length; ccz/=d.poly.length;
  var dx = d.poly[1][0]-d.poly[0][0], dz = d.poly[1][1]-d.poly[0][1];
  var L = Math.hypot(dx,dz) || 1, tx = dx/L, tz = dz/L;
  var nx = -tz, nz = tx;
  var whW = 20, whD = 28, gap = 7, rows = 2, cols = 4;
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var along = (c - (cols-1)/2)*(whD+gap);
      var across = (r - (rows-1)/2)*(whW+gap);
      var wx = ccx + tx*along + nx*across, wz = ccz + tz*along + nz*across;
      if(!pointInPoly(wx,wz,d.poly)) continue;
      var ry = Math.atan2(tx,tz);
      if(onRingHwy(wx,wz,Math.max(whW,whD)*0.5)) continue;
      if(!claim(wx,wz, whW*0.5+2, whD*0.5+2, ry, 'warehouse')) continue;
      structure(wx, terrainH(wx,wz), wz, whW, whD, rr(10,14), ry, 'hlaalu', pick(TONES_POOR));
      DIST_WAREHOUSES++;
    }
  }
});

/* ---- audit: zero building-pass instances inside any district polygon ---- */
var DISTRICT_INTRUSIONS = 0;
PLACED.forEach(function(o){
  if(o.tag!=='town' && o.tag!=='compound' && o.tag!=='manor') return;
  if(districtAt(o.x,o.z)) DISTRICT_INTRUSIONS++;
});
window._districtIntrusions = DISTRICT_INTRUSIONS;
window._districtContent = { stalls:DIST_STALLS, shops:DIST_SHOPS, monuments:DIST_MONUMENTS,
                             graves:DIST_GRAVES, tombs:DIST_TOMBS, cpiers:CPIERS.length,
                             warehouses:DIST_WAREHOUSES, marketStalls:MARKET_STALLS.length };
window._warehouseDistrict = DIST_WAREHOUSE;   /* diagnostic: the polygon(s), for the life layer's own caravan destinations */

/* ============================== 19f. AD HOC INFILL ==========================
   A handful of one-off owner requests, each a hand-marked polygon (or a
   hand-picked site near one) rather than a DISTRICTS entry — reuses the
   exact same placement functions/safety rails the automated town pass
   uses (townBuilding()/compound(), both already claim()-gated, so every
   "overlap pass" this section needs is really just "call the function
   that already refuses to overlap anything"), just aimed by hand at a
   specific polygon instead of a citywide grid scan. */
reseed(690050);

function scatterTownBuildings(poly, n, stoneFrac){
  var b = polyBounds(poly);
  var placed = 0, tries = 0, maxTries = n*50;
  while(placed < n && tries < maxTries){
    tries++;
    var x = rr(b.x0,b.x1), z = rr(b.z0,b.z1);
    if(!pointInPoly(x,z,poly)) continue;
    if(districtAt(x,z)) continue;
    if(!openAt(x,z)) continue;
    if(terrainH(x,z) < 4) continue;
    var stone = chance(stoneFrac);
    /* townBuilding() itself does the "street alignment, then overlap
       check" the owner asked for: wealthy=true shifts the candidate to
       its own street/market frontage BEFORE claim() ever runs (see its
       own comment), and claim() is the overlap check either way — a
       rejected spot just returns false and this loop tries another,
       exactly "move to an aligned spot when moving them". */
    if(townBuilding(x, z, stone, stone)) placed++;
  }
  return placed;
}
function scatterNear(cx, cz, radius, n, stone, avoidPoly){
  var placed = 0, tries = 0, maxTries = n*60;
  while(placed < n && tries < maxTries){
    tries++;
    var a = rnd()*Math.PI*2, r = Math.sqrt(rnd())*radius;
    var x = cx+Math.cos(a)*r, z = cz+Math.sin(a)*r;
    if(avoidPoly && pointInPoly(x,z,avoidPoly)) continue;
    if(districtAt(x,z)) continue;
    if(!openAt(x,z)) continue;
    if(terrainH(x,z) < 4) continue;
    if(townBuilding(x, z, stone, stone)) placed++;
  }
  return placed;
}

/* ---- owner: "place some slum buildings in [poly]" — the small quad
   just south of the new chinampa zone A. ---------------------------- */
var INFILL_SLUM_B = [[2059.2,-1156.2],[2124.8,-1087.6],[1748.3,-868.3],[1710.8,-978.5]];
var infillSlumBCount = scatterTownBuildings(INFILL_SLUM_B, 6, 0);

/* ---- owner: "add 1 clan compound, 2 stone town buildings and 5 slum
   buildings nearby [chinampa zone C]. this is the clan village." Sited
   on the nearest real dry ground to the zone's own centroid (probed live
   against a real build, not guessed — terrainH>=4 within ~300 units to
   the NW, the only dry stretch that close), gate facing the zone itself
   (faceToward, not atan2(dx,dz) — this is a direct facing bearing, the
   same convention compound()'s own ry already uses, not a heading-align
   case) so the village fronts the very fields it works. ---------------- */
(function(){
  var zoneCentroid = [0,0];
  CHIN_ZONE_C.forEach(function(p){ zoneCentroid[0]+=p[0]; zoneCentroid[1]+=p[1]; });
  zoneCentroid[0] /= CHIN_ZONE_C.length; zoneCentroid[1] /= CHIN_ZONE_C.length;
  var vx = -1650, vz = -870;
  var vry = faceToward(vx, vz, zoneCentroid[0], zoneCentroid[1]);
  var vfx = 60, vfz = 48;
  if(claim(vx, vz, vfx+6, vfz+6, vry, 'compound')){
    compound(vx, vz, vfx, vfz, vry);
    var stoneDone = 0;
    for(var st=0; st<80 && stoneDone<2; st++){
      var sa = rnd()*Math.PI*2, sr = vfx*1.5 + rr(10,60);
      var sx = vx+Math.cos(sa)*sr, sz = vz+Math.sin(sa)*sr;
      if(terrainH(sx,sz) < 4) continue;
      if(townBuilding(sx, sz, true, true)) stoneDone++;
    }
    var slumDone = scatterNear(vx, vz, vfx*2.2, 5, false, null);
    window._clanVillage = { x:vx, z:vz, ry:vry, stone:stoneDone, slum:slumDone };
  }else{
    window._clanVillage = { failed:true };
  }
})();

/* ---- owner: "fill some of the empty space here with the mushroom farm
   model... populate empty space in this area with a mix of stone and
   plaster town buildings" — polygon only, defined here; the actual
   mushroomFarm() call has to live in 71-industry.js instead (see the
   comment there) since that's where INDUSTRY, the counter object
   mushroomFarm() itself writes to, is actually assigned — a real
   hoisting bug, caught by the build: calling mushroomFarm() from THIS
   fragment's own top-level code (69, which loads before 71) read
   INDUSTRY as still-undefined (var only hoists the binding, not the
   assigned value), crashing with "Cannot set properties of undefined". */
var INFILL_D = [[1896.4,1426.7],[2255.8,1398.8],[2572.9,1434.4],[2633.9,1614.4],
  [2594.7,1645.9],[2175.9,1629.0],[2016.1,1547.2]];

/* ---- overlap audit: every building this section placed went through
   townBuilding()'s or compound()'s own claim() gate already (the same
   mechanism DISTRICT_INTRUSIONS above verifies for the district passes),
   so a second geometric check here would just be re-testing claim()
   itself — the real verification is that these counts are as expected
   and nothing came back 0/false, which the diagnostics above already
   surface (window._clanVillage, window._infillD, and the slum/farm
   counts) for a live build to confirm. */
window._adHocInfill = { slumB: infillSlumBCount };

/* ---- owner: "add a low-medium density of stone and plaster town
   buildings here. do anti alignment and anti overlap pass similarly." —
   same scatterTownBuildings() helper as the polygon-D infill above:
   street-alignment (faceStreet, inside townBuilding() itself, wealthy
   candidates only — the "anti alignment" ask, read as "make sure they
   line up with the street instead of sitting at a random angle") and
   overlap rejection (claim()) both already built in, just a lower count
   for "low-medium" density than polygon D's fuller fill. */
var INFILL_E = [[-768.7,1754.9],[-817.0,1817.6],[-675.4,1901.9],[-514.2,1971.7],
  [-362.7,2018.8],[-216.9,2043.2],[-210.3,1931.1],[-451.0,1901.3],[-620.9,1827.7]];
var infillECount = scatterTownBuildings(INFILL_E, 6, 0.5);
window._infillE = { buildings: infillECount };

/* ---- owner: "add densre[sic] mix of stone and plaster town buildings
   here. don't be shy!" — a real dense fill this time, small polygon so
   a generous target count still leaves scatterTownBuildings() to reject
   down to whatever actually fits via its own claim()/street/slope
   checks (the "don't be shy" ask is the target count, not a promise
   every one lands). ---------------------------------------------- */
var INFILL_F = [[1922.3,-1065.0],[1980.8,-870.3],[1856.5,-677.8],[1780.4,-667.1],[1712.3,-983.2]];
var infillFCount = scatterTownBuildings(INFILL_F, 22, 0.5);
window._infillF = { buildings: infillFCount };

/* ============================== TAVERN PLACEMENT ==============================
   Owner: "placement points for taverns. yes, this does include an attempt to
   place them on 2 cantons and see if it works." (confirmed "yes, 15 taverns").
   tavern(x,y,z,ry,col,opt) (65-facade.js) does NOT self-claim — the caller
   must claim() before calling it, using its own known default footprint
   (hallW=20,hallD=30,gardenDepth=17,gardenW=hallD*1.05 -> fx=hallW*0.5+
   gardenDepth+1=28, fz=max(hallD,gardenW)*0.5+2=17.75, read straight off the
   function's own return-statement formula rather than guessed).

   A live probe against window._api.CANTONS found exactly 2 of the 15 points
   land inside a canton's own radius: [-681.7,1213.1] (24 units from Foreign's
   centre, well inside r=128) and [178.2,1525.6] (88 units from Market's
   centre, inside r=134) -- both at negative raw terrainH (open bay floor
   under the canton deck), confirming these are the "2 cantons" experiment:
   the tavern has to sit on the canton's own tiered-platform TOP surface
   (CANTON_TOPS[name].y/.hw), not at ground level. Both Foreign and Market
   are platCanton() cantons (kind:'plat' in CANTONS, 30-layout.js) -- per
   platCanton()'s own CANTON_TOPS assignment (50-cantons.js) those never set
   entryY/entryHw, only y/hw, and per landing()'s own comment on that: "the
   ordinary top IS the entrance" for this canton kind. So CANTON_TOPS[name].y
   is the right height and .hw the right (already-inset, walkable) half-width
   to place within.

   The other 13 points sit at plausible positive terrain (4 to 120 units) and
   are placed at ground level, street-facing via faceStreet() (60-land.js) --
   the same street-alignment convention townBuilding()/scatterTownBuildings()
   already use elsewhere in this file -- with claim() as the real overlap
   guard exactly like every other ad-hoc placement pass in this section. */
reseed(690060);
var TAVERN_FX = 28, TAVERN_FZ = 17.75;
/* the 2 canton-top points go FIRST so they're guaranteed a shot before
   the triangle-budget cap below (TAVERN_MAX) can close out the rest --
   they're the owner's explicit "see if it works" experiment, not just
   more of the same as the 13 ground points. */
var TAVERN_POINTS = [
  [-681.7,1213.1], [178.2,1525.6],
  [1354.6,1185.0], [1635.7,87.8], [1311.2,-665.9], [1092.3,-749.2],
  [863.2,-470.2], [1031.3,298.7], [-57.0,2086.2],
  [-1379.8,921.0], [1934.2,1424.6], [1161.5,1492.9], [1358.9,737.4],
  [1911.2,-1059.3], [-1295.5,-87.5]
];
/* owner subsequently authorized raising BUDGET.triangles 3.2M -> 4.0M
   (05-palette.js) specifically because this pass and several concurrent
   ones were bottlenecked on the old ceiling -- so this no longer needs
   an artificial below-capacity cap; let claim() itself be the only real
   limiter (whatever fits without overlap, up to all 15 points). */
var TAVERN_MAX = 15;
var TAVERNS_PLACED = [], TAVERNS_SKIPPED = [];
/* true oriented-box overlap (separating-axis over the 4 edge normals) between
   a candidate hall and one already-standing footprint record {x,z,fx,fz,ry},
   both grown by `margin` so the answer is "do these two leave a person room to
   walk between them", not merely "do they intersect". claim()'s own grid test
   is circle-circle by design (see its comment) -- deliberately conservative,
   and far too blunt for fitting a hall into a courtyard gap measured in single
   units. The local-frame convention matches loc()/placedTagAt() exactly: local
   +x is world (cos ry, -sin ry), local +z is world (sin ry, cos ry). */
function tavernObbHit(ax, az, afx, afz, ary, b, margin){
  var m = margin || 0;
  var A = [[Math.cos(ary), -Math.sin(ary)], [Math.sin(ary), Math.cos(ary)]];
  var bry = b.ry || 0;
  var B = [[Math.cos(bry), -Math.sin(bry)], [Math.sin(bry), Math.cos(bry)]];
  var ae = [afx+m, afz+m], be = [b.fx+m, b.fz+m];
  var Tx = b.x-ax, Tz = b.z-az;
  var axes = [A[0], A[1], B[0], B[1]];
  for(var i=0; i<4; i++){
    var L = axes[i];
    var t  = Math.abs(Tx*L[0] + Tz*L[1]);
    var ra = ae[0]*Math.abs(A[0][0]*L[0]+A[0][1]*L[1]) + ae[1]*Math.abs(A[1][0]*L[0]+A[1][1]*L[1]);
    var rb = be[0]*Math.abs(B[0][0]*L[0]+B[0][1]*L[1]) + be[1]*Math.abs(B[1][0]*L[0]+B[1][1]*L[1]);
    if(t > ra+rb) return false;   /* a separating axis exists -> no overlap */
  }
  return true;
}
function placeTavernAtPoint(p){
  if(TAVERNS_PLACED.length >= TAVERN_MAX){
    TAVERNS_SKIPPED.push({p:p, why:'TAVERN_MAX cap ('+TAVERN_MAX+') reached, leaving triangle headroom for concurrent tasks'});
    return;
  }
  var px = p[0], pz = p[1];
  var nearest = null, bd = 1e18;
  CANTONS.forEach(function(c){
    var d = Math.hypot(px-c.x, pz-c.z);
    if(d < bd){ bd = d; nearest = c; }
  });
  var onCanton = nearest && bd < nearest.r;
  if(onCanton){
    /* owner: "do de-overlapping pass on top-of-canton buildings" -- real
       gap found checking this: platCanton()'s own top-tier content (the
       discrete building lots most cantons carry, OR a special deck like
       marketDeck()/guildHallsDeck()/arenaDeckSquare()/portDeckV2()/
       ordinatorFortress()) is NOT in the claim()/PLACED system at all
       (confirmed by grep -- 0 claim() calls in 50-cantons.js, and the
       guild-hall agent's own report independently found the same thing).
       claim() alone was therefore NOT protecting a canton-top tavern from
       landing on top of the canton's own pre-existing buildings -- only
       from a second tavern claiming the same spot, which never happened
       here. Special-deck cantons (market/guild/arena/fortress/port) each
       have their own bespoke layout this code has no formula for, so
       those are skipped outright rather than risking a blind overlap;
       only the generic discrete-lot cantons (Foreign, Market, ... --
       platCanton()'s own default branch) get a real fix: the exact same
       lattice formula platCanton() itself uses (n=hw>105?5:4 lots,
       cell=hw*1.84/n, centre/edge-excluded the same way) is replicated
       here so this can reject any candidate that lands too close to a
       real lot centre, instead of one blind random angle. */
    if(nearest.market || nearest.guild || nearest.arena || nearest.fortress || nearest.port){
      /* re-examined per the owner's follow-up: now that every top-tier
         footprint (bespoke decks included — marketDeck()'s stalls/halls,
         guildHallsDeck()'s halls, the arena's own inspectClaim()s) is a
         real SAT/OBB-testable rectangle in window._inspectFP rather than a
         re-derived lattice, the blanket skip is no longer load-bearing —
         but it is also never actually exercised: none of TAVERN_POINTS /
         TAVERN_POINTS_2 lands within a market/guild/arena/fortress/port
         canton's own radius (checked directly against window._api.CANTONS
         live; only Foreign/Market/Granary's default-branch decks are ever
         hit by 'onCanton' at all). So there is nothing here to measure a
         real footprint against — left in place as a defensive skip for a
         candidate this session never sends, not a finding that those decks
         can't take one. */
      TAVERNS_SKIPPED.push({p:p, why:'special-deck canton ('+nearest.n+'), no safe overlap formula'}); return;
    }
    var top = CANTON_TOPS[nearest.n];
    if(!top){ TAVERNS_SKIPPED.push({p:p, why:'no CANTON_TOPS for '+nearest.n}); return; }
    /* REACHABILITY PASS (owner: "once they're placed... make sure pedestrians
       are able to take a stair up to them and path properly"). Measured first,
       live: BOTH canton points -- the owner's own "see if it works" experiment
       -- were being rejected here with "no clear gap", so the city shipped 12
       ground taverns and zero canton-top ones. Two separate things were wrong,
       and only one of them was the test:

       (1) The TEST re-derived platCanton()'s lattice from top.hw and then used
           a circle-circle clearance of max(fx,fz)+cell/2 around each derived
           lot centre. That is both blind to the +/-0.15*cell jitter
           platCanton() actually applies to every lot and far more conservative
           than the real rectangles. The canton's REAL top-tier footprints are
           already recorded, exactly as built, one per lot: window._inspectFP
           (86-inspect.js's inspect-only registry, which platCanton() fills via
           inspectClaim() for every lot it draws, and which 50-cantons.js runs
           long before this file). Testing against those with a true SAT/OBB
           overlap is strictly better information than re-deriving the lattice,
           and it also sees anything else that has inspectClaim()ed itself onto
           that deck rather than only the generic lots.

       (2) The FOOTPRINT was the real blocker, and the old verdict was
           substantively right even though its test was crude. Measured on the
           live build: Foreign's lot tier is hw~78, carrying a 33x33 great hall
           and 15 more lots whose centres ring the deck at ~|18| and ~|55|. A
           full-size tavern() is 56 x 35.5 -- LARGER than the canton's own
           great hall. There is no orientation and no position inside the
           usable radius where it fits. So the fix is the footprint, not just
           the test: a canton-top tavern is built at canton-lot scale, through
           tavern()'s own opt.hallW/hallD/gardenDepth (already parameterised,
           no new geometry), so it reads as one more building on the deck
           instead of a hall dropped across three lots. Ground taverns are
           untouched and stay full size. */
    var CT_OPT = { hallW:14, hallD:20, gardenDepth:10 };
    var CT_GW = CT_OPT.hallD*1.05;                                  /* tavern()'s own gardenW default */
    var CT_FX = CT_OPT.hallW*0.5 + CT_OPT.gardenDepth + 1;          /* tavern()'s own returned fx formula */
    var CT_FZ = Math.max(CT_OPT.hallD, CT_GW)*0.5 + 2;              /* ...and its fz */
    var hw = top.hw;
    if(hw < CT_FZ + 8){ TAVERNS_SKIPPED.push({p:p, why:'canton top too small ('+nearest.n+')'}); return; }
    /* every footprint already standing on THIS canton's deck */
    var deckFP = (window._inspectFP || []).filter(function(f){
      return Math.hypot(f.x-nearest.x, f.z-nearest.z) < nearest.r;
    });
    var CT_GAP = 3;      /* half the walking clearance kept round the new hall (so ~6 units between walls) */
    var CT_EDGE = 3;     /* clear stone left between the hall's own OBB and the true deck edge (hw) */
    /* platCanton()'s own edge buttresses (50-cantons.js's platCanton(), the
       parapet loop right after CANTON_TOPS is recorded) are drawn directly,
       not through inspectClaim(), so — like the centre monument below —
       they need their own keep-out here: two thin radial fins per face,
       each ring*0.36 (=hw*0.72) long and only 3 wide, centred at hw*0.99
       and offset +/-ring*0.30 (=hw*0.6) tangentially. Replicated exactly
       from that loop's own formula (read-only; nothing here writes back). */
    var finRing = hw*2, fins = [];
    for(var pf2=0; pf2<4; pf2++){
      var pa = pf2*Math.PI/2;
      [-1,1].forEach(function(seg){
        var foff = seg*finRing*0.30;
        fins.push({
          x: nearest.x + Math.cos(pa)*hw*0.99 - Math.sin(pa)*foff,
          z: nearest.z + Math.sin(pa)*hw*0.99 + Math.cos(pa)*foff,
          fx: finRing*0.36*0.5, fz: 3.0*0.5, ry: -pa
        });
      });
    }
    var bestTx=null, bestTz=null, bestRy=null;
    /* deterministic grid scan across the WHOLE square deck (platCanton()'s
       top tier is a square of half-width hw, not a disc -- FR8/BOX both
       draw it ±hw on each axis) rather than the old scan's polar radius
       capped at a circle inscribed well inside that square. That old cap
       (top.hw - CT_FX - 4, i.e. ~72% of hw) never reached the real gaps
       this file's own live audit found: on all 3 decks that lost their
       tavern, an exhaustive 2-unit grid search at these same margins found
       zero clear spot anywhere -- not just inside the old circle, the
       whole deck -- until platCanton() itself freed one specific lattice
       lot per deck (CANTON_TAVERN_RESERVE, 50-cantons.js). With that room
       actually there, this scan finds it by trying BOTH plausible
       orientations at every candidate -- door-to-courtyard (radial) and
       door-along-the-deck (tangential) -- and the true per-candidate AABB
       containment against the square edge, not a worst-case circle. */
    /* candidate list: platCanton()'s own freed reserve slot (its (lx,lz)
       offset, dead centre of the gap the CANTON_TAVERN_RESERVE audit
       actually opened) tried FIRST, then a fixed 1.5-unit grid across the
       whole deck as a general-purpose fallback -- 1.5u because the coarser
       hw/28 step this scan first shipped with (~2.8-4.8u depending on the
       deck) missed the real gap entirely on a live rebuild: a fixed
       resolution finds a narrow rectangle a deck-relative one can step
       over. */
    var reservePos = CANTON_TAVERN_RESERVE_POS[nearest.n];
    var candidates = [];
    if(reservePos) candidates.push([reservePos.lx, reservePos.lz]);
    var STEP = 1.5, TRIES = [0, Math.PI/2];
    for(var gx2=-hw; gx2<=hw; gx2+=STEP) for(var gz2=-hw; gz2<=hw; gz2+=STEP) candidates.push([gx2,gz2]);
    findSpot:
    for(var ci=0; ci<candidates.length; ci++){
      var cgx = candidates[ci][0], cgz = candidates[ci][1];
      if(Math.hypot(cgx,cgz) < 14 + CT_FZ) continue;   /* centre monument */
      var ryIn = Math.atan2(cgz, -cgx);   /* local +x toward the courtyard centre */
      for(var to2=0; to2<TRIES.length; to2++){
        var ry3 = ryIn + TRIES[to2];
        var extX = Math.abs(Math.cos(ry3))*CT_FX + Math.abs(Math.sin(ry3))*CT_FZ;
        var extZ = Math.abs(Math.sin(ry3))*CT_FX + Math.abs(Math.cos(ry3))*CT_FZ;
        if(Math.abs(cgx)+extX+CT_EDGE > hw) continue;   /* would overhang the deck edge */
        if(Math.abs(cgz)+extZ+CT_EDGE > hw) continue;
        var tx3 = nearest.x + cgx, tz3 = nearest.z + cgz;
        var clear = true;
        for(var li=0; li<deckFP.length; li++){
          if(tavernObbHit(tx3,tz3,CT_FX,CT_FZ,ry3, deckFP[li], CT_GAP)){ clear=false; break; }
        }
        if(clear) for(var fi2=0; fi2<fins.length; fi2++){
          if(tavernObbHit(tx3,tz3,CT_FX,CT_FZ,ry3, fins[fi2], 1.5)){ clear=false; break; }
        }
        if(!clear) continue;
        if(!claim(tx3, tz3, CT_FX, CT_FZ, ry3, 'tavern')) continue;
        bestTx=tx3; bestTz=tz3; bestRy=ry3;
        break findSpot;
      }
    }
    /* audit trail, because "no clear gap" on its own is not a reviewable
       answer: this records the deck's own real dimensions, the hall size
       tried, how many footprints stand on the deck, and whether it placed.
       Foreign/Market/Granary all place now that platCanton() has freed one
       lattice lot each (CANTON_TAVERN_RESERVE); the search above also runs
       for any future canton-top candidate on a deck that was never short of
       room in the first place. */
    (window._tavernCantonDbg = window._tavernCantonDbg || []).push({
      canton: nearest.n, topHw: hw, topY: top.y,
      deckFootprints: deckFP.length, hallFx: CT_FX, hallFz: CT_FZ,
      placed: bestTx !== null
    });
    if(bestTx===null){ TAVERNS_SKIPPED.push({p:p, why:'no clear gap among '+nearest.n+'\'s own top-tier buildings'}); return; }
    /* DETERMINISM: this candidate used to fail here on every one of these 3
       decks (see CANTON_TAVERN_RESERVE, 50-cantons.js) -- meaning tavern()'s
       own colour pick and its whole random-heavy build (chimney puffs, table
       count, vine placement, ...) were never drawn from the shared stream at
       this point in the unmodified build. Now that platCanton() has opened a
       real gap, calling tavern() in-stream would draw here for the first
       time and shift every farm/orchard/veg/mushroom roll generated after
       it -- confirmed live (a first pass left this unguarded and _veg/
       _orchard/_infillG/_mushroomFillH-J all drifted from baseline). Same
       fix as the extra clan-compound building this session's own precedent
       used: save the seed, reseed off the tavern's own resolved position,
       build, restore. */
    var ctSeedSave = seed;
    reseed(((bestTx|0)*9187 + (bestTz|0)*733) >>> 0);
    var res = tavern(bestTx, top.y, bestTz, bestRy, pick(TONES), CT_OPT);
    seed = ctSeedSave;
    if(res){
      res.canton = nearest.n;
      /* file the new hall into the same inspect-only registry every other
         canton-top building is in, so the inspector names it instead of
         falling back to the canton, and so a later canton-top pass sees it. */
      inspectClaim(bestTx, bestTz, CT_FX, CT_FZ, bestRy, 'tavern', 'Tavern');
      TAVERNS_PLACED.push(res);
    }
    return;
  }
  /* the owner's points are hand-picked approximate spots, not exact
     footprints -- a 28x17.75-half-extent hall is bigger than most other
     ad-hoc infill this session, and several points land inside already-
     dense town/farm fabric where the EXACT point can't fit it. A
     single-point claim() attempt turned out to fail for 10/13 of the
     first batch's ground points on the first live check, so this
     searches a small spiral of nearby offsets (the same spirit as
     scatterTownBuildings/scatterNear's own randomized-retry pattern
     elsewhere in this file) before truly giving up on a point. */
  var tried = [[0,0]];
  [40,80,130,190].forEach(function(rad){
    for(var a2=0; a2<8; a2++){
      var ang2 = a2*Math.PI/4 + rnd()*0.3;
      tried.push([Math.cos(ang2)*rad, Math.sin(ang2)*rad]);
    }
  });
  var done = false;
  for(var ti=0; ti<tried.length && !done; ti++){
    var tx2 = px+tried[ti][0], tz2 = pz+tried[ti][1];
    var h = terrainH(tx2, tz2);
    if(h < 2) continue;
    var fs = faceStreet(tx2, tz2, TAVERN_FX, TAVERN_FZ);
    if(!claim(tx2, tz2, TAVERN_FX, TAVERN_FZ, fs.ry, 'tavern')) continue;
    var res2 = tavern(tx2, h, tz2, fs.ry, pick(TONES), {});
    if(res2){ TAVERNS_PLACED.push(res2); done = true; }
  }
  if(!done) TAVERNS_SKIPPED.push({p:p, why:'no valid site found within 190u of point'});
}
TAVERN_POINTS.forEach(placeTavernAtPoint);
/* owner's follow-up batch: "add these as taverns (end of list)" --
   same placement machinery, same TAVERNS_PLACED/TAVERNS_SKIPPED
   bookkeeping and LIFE_DOORS wiring (78-life.js reads TAVERNS_PLACED
   as a whole, not this specific array name, so nothing else needs to
   change). TAVERN_MAX raised by exactly 3 so this batch isn't silently
   swallowed by the first batch's own cap. */
TAVERN_MAX += 3;
var TAVERN_POINTS_2 = [[768.3,-295.1], [1746.0,-636.1], [-305.7,1557.9]];
TAVERN_POINTS_2.forEach(placeTavernAtPoint);
/* `list` added by the reachability pass: the per-tavern audit needs each
   hall's own door point and whether it stands on a canton deck, and the bare
   placed/skipped counts could not answer either. Same object, one more field. */
window._taverns = { placed: TAVERNS_PLACED.length, skipped: TAVERNS_SKIPPED, list: TAVERNS_PLACED };

/* owner: "place a shrine here [[2248.5,-4448.5]]. not active for life
   layer, but because i think it will make a nice silhouette" (low
   priority). lifeStandaloneShrine() (65-facade.js) is a self-contained
   builder that doesn't register with LIFE_SHRINE_STOPS/LIFE_DOORS on its
   own -- calling it directly here, without also pushing into either of
   those arrays, is exactly "not active for life layer": no citizen will
   ever path to or queue at it, it just exists as geometry.
   Real wrinkle found live: d=max(|x|,|z|)=4448 for this point, far past
   CITY_LIM+300 (verify.py's own built-inside-limit invariant, ~2580) --
   this is deliberate (a distant hillside silhouette, not a mistake), so
   rather than fail verification or silently reject the far site, this
   is now explained the same way FARMS/MANORS already are: recorded in
   SILHOUETTE_SHRINES (exported below to window._api, mirroring FARMS/
   MANORS' own export in 85-probe.js) with a matching exemption radius
   added to verify.py's own invariant #7, right alongside the existing
   FARMS/MANORS checks. terrainH there is a real 407 (a hillside on the
   far shore, checked live, not underwater), rad=46 matches this
   builder's one other live call site's own scale (65-facade.js's
   lifeFindShrineSite pass: footprint*2.1, footprint's default 22). */
reseed(690070);
var SILHOUETTE_SHRINES = [];
(function(){
  var sx = 2248.5, sz = -4448.5;
  var ry = faceToward(sx, sz, 0, 0);
  var res = lifeStandaloneShrine(sx, sz, ry, 46);
  SILHOUETTE_SHRINES.push([res.x, res.z]);
})();
window._silhouetteShrines = SILHOUETTE_SHRINES;

/* ============================== HOUSE OF HEALING ==============================
   houseOfHealing() (65-facade.js) does not self-claim -- 60-land.js already
   reserved its exact footprint (HOH_SITE) at claim()-time, before the town-
   building grid scan and the wayside-shrine pass could put anything else there
   (see that reservation's own comment for the "move other things out of way"
   exclusion-zone reasoning). Reusing that record's own x/z/ry/fx/fz here rather
   than claim()-ing a second time is the same contract every other standalone
   builder this session used (tavern()/monasteryAssemblyHall()). y is the raw
   terrain height at the reserved site -- the same ground-level convention
   tavern()'s own non-canton-top placements use (60-land.js's h=terrainH(x,z)),
   not the slope-compensating plinth() helper, since houseOfHealing() already
   builds its own battered foundation skirt for minor slope the same way
   tavern()'s does. */
reseed(690080);
var HOUSE_OF_HEALING = null;
if(typeof HOH_SITE !== 'undefined' && HOH_SITE){
  var hohY = terrainH(HOH_SITE.x, HOH_SITE.z);
  HOUSE_OF_HEALING = houseOfHealing(HOH_SITE.x, hohY, HOH_SITE.z, HOH_SITE.ry, pick(TONES), {});
}
window._houseOfHealing = HOUSE_OF_HEALING;

/* ============================== NEW TRADE GUILD HALLS ==============================
   Owner: "see if you can fit the remaining guildhouses in this area
   [[723.6,-221.9],[778.2,-211.6],[774.4,-165.9],[789.1,-96.9],[805.7,-33.7],
   [757.8,-5.3],[733.0,-66.5],[717.0,-139.7],[716.1,-157.1]]. make sure they
   address the street properly and don't overlap." Every guild on the
   owner's ORIGINAL list is already built — guildHallsDeck() (50-cantons.js,
   10 halls on the Guild canton's grid) plus the Navigator hall on Port
   (65-facade.js's portDeckV2()) — checked directly against both files
   before writing a line here. Put to the owner, who chose to invent halls
   for trades the city visibly runs but has no guild for: "Fisher's,
   Miner's/Quarryman's, Brewer's, Tanner's/Dyer's, Scribe's. I'd fit as many
   as address the street cleanly" — all five attempted below, none forced.

   THE SITE, measured live (window._api, a throwaway Playwright probe —
   verify.py's own harness — since no ground-level preset exists for this
   corner and the brief warns judging siting from orbit is how a whole gate
   loop went missing before): entirely zoneAt()==='core', terrainH a gentle
   3.1->4.0 upward slope NNE, landDist 40-99 (dry, nowhere near the shore
   SDF). Only ONE existing PLACED footprint sits inside the traced polygon
   (a small street prop) — this is genuinely open ground, not a re-skin.
   nearestStreet() against the real road graph resolves the shape: a
   quay-class road runs the polygon's whole NNE length just off its WEST
   edge, two ring-class roads run parallel just off its EAST edge, and four
   minor cross-streets ("spokes" connecting quay to ring) cut across it at
   roughly z=-5..-33, z=-70..-100, z=-146..-165 and z=-211..-232 —
   quartering the strip into three real blocks. Each hall below is sited by
   hand-picked anchor (one or two per block, alternating which edge road it
   fronts so the row doesn't read as one single rank all facing the same
   way) and oriented by faceStreet() (60-land.js) — the real road-graph
   answer, not a guessed cardinal — with claim() as the only overlap
   authority, exactly per the owner's "don't overlap." A hall that can't
   claim cleanly within its own small search spiral is skipped outright,
   never forced (same idiom TAVERN_POINTS' placeTavernAtPoint() uses above,
   scaled down for a much smaller, much emptier site).

   Yard/service props sit on the hall's local -x (BACK) face — away from
   the street the door/windows address on local +x — per this task's own
   brief ("yard/service side away from [the street]"), a deliberate
   difference from the Guild canton's own halls (whose forges/stalls sit
   right by the front door, a courtyard-facing idiom that doesn't apply to
   a street row). Every window routes through guildHallWindows3() (>=3,
   unconditional, the same helper/guarantee the Carpenter/Merchant/Weaver/
   Artificer/Navigator halls already use) so they inherit WINBOX()'s
   night-glow for free. GUILD_HALL_DOORS/GUILD_WORK_POSTS/inspectClaim()
   registration mirrors guildHallsDeck() exactly, so 78-life.js's pedestrian
   doors and updateGuildWorkers() pick these up with no changes to that
   file (still owned by the concurrent coast-guard-junk agent — untouched).
   stone(default)/plaster/roof/wood/dome/metal/cloth only — no new family,
   zero new draw calls (same shared BUCKET/InstancedMesh system every
   other builder in this file already spends into). */
reseed(690090);
var GUILD_ROW_MAX = 5;
var GUILD_ROW_PLACED = [], GUILD_ROW_SKIPPED = [];

function guildRowDhw(w){ return Math.min(2.2, w*0.5*0.9)*0.5; }
/* one more entry in the same cross-file hand-off guildHallsDeck() already
   uses (GUILD_WORK_POSTS, 50-cantons.js's own header comment) — an
   unrecognised role just gets updateGuildWorkers()'s generic posted
   idle-wander branch and a generic tint (its own "any future role"
   fallback), which is an honest "someone is here, working" for a trade
   this population's shared geometry was never sculpted for a tool of. */
function guildRowWorker(x,z,y,ry,role,radius){
  GUILD_WORK_POSTS.push({ x:x, z:z, y:y, ry:ry, role:role, radius:radius||1.0 });
}

/* one anchor -> one hall, with the same small-spiral-then-claim() retry
   TAVERN_POINTS' placeTavernAtPoint() uses above — the owner's own hand-
   picked points are approximate, not exact footprints, and this site is
   crossed by cross-streets/props a single claim() attempt can clip. */
function placeGuildRowHall(spec){
  if(GUILD_ROW_PLACED.length >= GUILD_ROW_MAX){
    GUILD_ROW_SKIPPED.push({name:spec.name, why:'GUILD_ROW_MAX ('+GUILD_ROW_MAX+') reached'});
    return;
  }
  var w=spec.w, d=spec.d, h=spec.h;
  var yardDepth = spec.yardDepth, yardWidth = spec.yardWidth || d;
  /* symmetric half-extent covering the larger of front-apron/back-yard —
     same over-claim-the-empty-side convention TAVERN_FX/TAVERN_FZ already
     use above for a garden that is really only on one side. */
  var fx = w*0.5 + yardDepth + 1, fz = Math.max(d, yardWidth)*0.5 + 2;
  var px0 = spec.anchor[0], pz0 = spec.anchor[1];
  var tried = [[0,0]];
  [14,28,46,68].forEach(function(rad){
    for(var a=0;a<8;a++){
      var ang = a*Math.PI/4 + rnd()*0.25;
      tried.push([Math.cos(ang)*rad, Math.sin(ang)*rad]);
    }
  });
  for(var i=0;i<tried.length;i++){
    var tx = px0+tried[i][0], tz = pz0+tried[i][1];
    var h0 = terrainH(tx,tz);
    if(h0 < 2) continue;
    var fs = faceStreet(tx, tz, fx, fz);
    var rec = claim(tx, tz, fx, fz, fs.ry, 'guildhall');
    if(!rec) continue;
    buildGuildRowHall(spec, tx, tz, h0, fs.ry, fx, fz);
    GUILD_ROW_PLACED.push({name:spec.name, x:tx, z:tz, ry:fs.ry});
    return;
  }
  GUILD_ROW_SKIPPED.push({name:spec.name, why:'no claim() within search spiral of ('+px0+','+pz0+')'});
}

function buildGuildRowHall(spec, hx, hz, y, ry, fx, fz){
  var w=spec.w, d=spec.d, h=spec.h, col=spec.col;
  structure(hx, y, hz, w, d, h, ry, spec.kind, col, spec.opt || {});
  addDoor(hx, y, hz, ry, w, d, h, col);
  var dhw = guildRowDhw(w);
  guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, spec.sideSign || 1, spec.sideFxFrac===undefined?0.7:spec.sideFxFrac);
  var dp = loc(hx, hz, w*0.5+1.2, 0, ry);
  GUILD_HALL_DOORS.push({ x:dp[0], z:dp[1], ry:ry, canton:null, name:spec.name });
  inspectClaim(hx, hz, fx, fz, ry, 'guildhall', spec.name + "'s guild hall");
  spec.yard(hx, hz, y, ry, w, d, h, col);
}

/* ---- Fisher's Guild: a low dockside hall well inland of the actual
   piers (the hall is administrative/social — same relationship the
   Blacksmith hall on the Guild canton has to the ore mines it has no
   physical connection to), net lofts and drying racks out back. ---- */
(function(){
  var col = pick(TONES_POOR);
  placeGuildRowHall({
    name:'Fisher', w:28, d:22, h:18, kind:'hlaalu', col:col,
    yardDepth:13, yardWidth:26, anchor:[726,-202], sideFxFrac:0.7,
    yard:function(hx,hz,y,ry,w,d,h,col){
      /* a net-drying frame: two posts + a hung net panel. The panel is a
         cloth BOX whose base (free edge, per 45-kit.js's cloth-sway
         convention) is y=0 and whose height reaches up to the crossbar —
         the sway comes for free, no extra instance. */
      var fp = loc(hx,hz, -w*0.5-5.5, -d*0.30, ry);
      [-1,1].forEach(function(s){
        var pp = loc(fp[0],fp[1], 0, s*3.6, 0);
        CYL(pp[0], y, pp[1], 0.28, 3.6, 0, shade(TRUNKC[0],-0.15), 'wood');
      });
      BOX(fp[0], y+3.5, fp[1], 0.9, 0.18, 7.6, ry, shade(TRUNKC[0],-0.1), 'wood');
      BOX(fp[0], y, fp[1], 0.9, 3.3, 6.8, ry, pick(SAILC), 'cloth');
      /* fish-drying racks: a row of thin horizontal poles between two
         posts, hung with small cloth-strip "fillets" */
      var rp = loc(hx,hz, -w*0.5-5.5, d*0.32, ry);
      [-1,1].forEach(function(s){
        var pp = loc(rp[0],rp[1], 0, s*3.0, 0);
        CYL(pp[0], y, pp[1], 0.22, 2.6, 0, shade(TRUNKC[0],-0.1), 'wood');
      });
      for(var i=0;i<3;i++){
        var t = (i+0.5)/3;
        var sp = loc(rp[0],rp[1], 0, mix(-3.0,3.0,t), 0);
        BOX(sp[0], y+2.5, sp[1], 0.5, 0.12, 0.5, ry, shade(pick(SAILC),-0.2), 'cloth');
      }
      /* salt-fish barrels stacked by the door corner (back, not blocking
         the street face) */
      for(var b=0;b<3;b++){
        var bp = loc(hx,hz, -w*0.5-2.2, -d*0.5+1.6+b*1.9, ry);
        CYL(bp[0], y, bp[1], 0.85, 1.5, 0, shade(TRUNKC[1],-0.05), 'wood');
      }
      var wp = loc(hx,hz, -w*0.5-4.0, -d*0.30, ry);
      guildRowWorker(wp[0], wp[1], y, ry+Math.PI, 'fisher', 1.1);
    }
  });
})();

/* ---- Miner's/Quarryman's Guild: squat, thick-walled, grey — 6 mines and
   3 quarries feed this city and had no hall of their own. Ore-sorting
   table, winding gear and a laden cart out back. ---- */
(function(){
  /* SECOND PASS: the original anchor (768,-178) and its own footprint
     (w30/d26, yardDepth15) turned out to collide with the Fisher hall's
     own claimed footprint by claim()'s own conservative circle test —
     found live (probe against window._api.PLACED after the first 3 halls
     landed), not guessed: a 5-anchor layout planned against the traced
     polygon alone under-measured how large a claimed circle actually gets
     once the yard depth is folded in. A second live scan for ANY clear
     patch left on the strip (a 20x10-half-extent test footprint, 8-unit
     grid, against every PLACED record including the 3 already-built
     halls) found exactly one small pocket, ~x772-780/z-86..-110 fronting
     the ring road — so this hall is resized to fit that pocket honestly
     rather than forcing the original scale in in general. */
  var col = shade(pick(GREYC), -0.04);
  placeGuildRowHall({
    name:'Miner', w:22, d:16, h:16, kind:'hlaalu', col:col,
    yardDepth:8, yardWidth:16, anchor:[776,-98], sideFxFrac:0.65,
    yard:function(hx,hz,y,ry,w,d,h,col){
      /* the winding gear: a vertical drum on a timber frame */
      var gp = loc(hx,hz, -w*0.5-3.4, -d*0.26, ry);
      [-1,1].forEach(function(s){
        var pp = loc(gp[0],gp[1], 0, s*1.1, 0);
        BOX(pp[0], y, pp[1], 0.4, 3.2, 0.4, ry, shade(TRUNKC[0],-0.15), 'wood');
      });
      BOX(gp[0], y+3.0, gp[1], 2.4, 0.4, 0.4, ry, shade(TRUNKC[0],-0.1), 'wood');
      CYL(gp[0], y+1.8, gp[1], 0.45, 2.0, Math.PI/2, shade(ROOFS[5],-0.10), 'metal');
      /* ore-sorting table with a few chunks of raw stone */
      var tp = loc(hx,hz, -w*0.5-2.8, d*0.28, ry);
      BOX(tp[0], y, tp[1], 2.4, 0.9, 1.6, ry, shade(TRUNKC[0],-0.2), 'wood');
      for(var i=0;i<3;i++){
        var op = loc(tp[0],tp[1], rr(-0.9,0.9), rr(-0.55,0.55), 0);
        BOX(op[0], y+0.9, op[1], rr(0.30,0.5), rr(0.22,0.36), rr(0.30,0.5), rnd()*3, pick(GREYC));
      }
      /* a small loaded ore cart, wheels in 'metal' */
      var cp = loc(hx,hz, -w*0.5-1.8, -d*0.5+1.3, ry);
      BOX(cp[0], y+0.5, cp[1], 1.6, 0.8, 1.1, ry, shade(TRUNKC[0],-0.1), 'wood');
      [-1,1].forEach(function(s){
        var wpz = loc(cp[0],cp[1], s*0.75, 0.65, ry);
        CYL(wpz[0], y+0.36, wpz[1], 0.36, 0.16, Math.PI/2, shade(ROOFS[5],-0.15), 'metal');
      });
      BOX(cp[0], y+1.05, cp[1], 1.3, 0.4, 0.9, ry, pick(GREYC));
      /* picks/shovels leaning at the door corner */
      var lp = loc(hx,hz, -w*0.5-0.5, d*0.5-1.0, ry);
      [-0.3,0.3].forEach(function(s){
        BOX(lp[0], y+1.1, lp[1], 0.09, 2.2, 0.09, ry+s, shade(TRUNKC[0],0.05), 'wood');
      });
      var wpost = loc(hx,hz, -w*0.5-3.0, -d*0.26, ry);
      guildRowWorker(wpost[0], wpost[1], y, ry+Math.PI, 'miner', 1.0);
    }
  });
})();

/* ---- Brewer's Guild: mash house annex, barrel stack, copper kettle
   steaming under its own lean-to. ---- */
(function(){
  var col = pick(TONES);
  placeGuildRowHall({
    name:'Brewer', w:26, d:22, h:20, kind:'hlaalu', col:col,
    yardDepth:13, yardWidth:24, anchor:[726,-122], sideFxFrac:0.7,
    yard:function(hx,hz,y,ry,w,d,h,col){
      /* the kettle, under a small open lean-to (posts + roof panel) */
      var kp = loc(hx,hz, -w*0.5-5.2, -d*0.28, ry);
      [-1,1].forEach(function(s){
        var pp = loc(kp[0],kp[1], -1.6, s*2.0, 0);
        CYL(pp[0], y, pp[1], 0.30, 3.4, 0, shade(TRUNKC[0],-0.15), 'wood');
      });
      /* BOX/CYL only, both in already-spent (shape,family) buckets — a
         CONE|metal lid and a BOX|roof panel were tried first and both
         turned out to be brand new buckets (2 extra draw calls, caught by
         verify.py's own delta), so the lean-to roof is a flat stone-family
         slab (colour still reads as roofing via ROOFS[]; family is just
         the texture bucket) and the kettle lid is a squat metal CYL. */
      BOX(kp[0]-1.6*Math.cos(ry), y+3.3, kp[1]+1.6*Math.sin(ry), 4.4, 0.5, 4.4, ry, shade(ROOFS[2],-0.05));
      CYL(kp[0], y, kp[1], 1.5, 1.8, 0, shade(ROOFS[5],0.08), 'metal');
      CYL(kp[0], y+1.8, kp[1], 1.0, 0.35, 0, shade(ROOFS[5],-0.05), 'metal');
      registerSmokeEmitter(kp[0], y+2.9, kp[1], {
        kind:'brew', n:5, life:5.6, rise:9.5, r0:0.5, r1:2.0, spread:0.42, sway:0.5,
        swirl:0.9, lean:0.5, col:PAL.smoke.hearth.body
      });
      /* barrel stack: 3 on the ground, 2 on top */
      var bBase = loc(hx,hz, -w*0.5-4.0, d*0.32, ry);
      [-1,0,1].forEach(function(s){
        var bp = loc(bBase[0],bBase[1], 0, s*1.05, 0);
        CYL(bp[0], y, bp[1], 0.85, 1.5, 0, shade(TRUNKC[1],-0.05), 'wood');
      });
      [-0.5,0.5].forEach(function(s){
        var bp = loc(bBase[0],bBase[1], 0, s*1.05, 0);
        CYL(bp[0], y+1.5, bp[1], 0.80, 1.4, 0, shade(TRUNKC[1],0.0), 'wood');
      });
      /* a hop/grain drying frame against the back wall */
      var hp = loc(hx,hz, -w*0.5-1.0, -d*0.5+1.6, ry);
      BOX(hp[0], y, hp[1], 0.4, 3.4, 3.0, ry, shade(TRUNKC[0],-0.1), 'wood');
      var wpost = loc(hx,hz, -w*0.5-4.6, -d*0.28, ry);
      guildRowWorker(wpost[0], wpost[1], y, ry+Math.PI, 'brewer', 1.1);
    }
  });
})();

/* ---- Tanner's/Dyer's Guild: tan pits, hide-drying frames, dye vats —
   the trade the warren's leatherwork and the caravans' hides both depend
   on and had no hall of its own. Kept low and workaday. ---- */
(function(){
  var col = pick(TONES_POOR);
  placeGuildRowHall({
    name:'Tanner', w:26, d:20, h:16, kind:'hlaalu', col:col,
    yardDepth:15, yardWidth:26, anchor:[780,-96], sideFxFrac:0.7,
    yard:function(hx,hz,y,ry,w,d,h,col){
      /* two sunken tan pits: a dark liquid disc set into a shallow stone rim */
      [-1,1].forEach(function(s){
        var pp = loc(hx,hz, -w*0.5-4.2, s*4.4, ry);
        CYL(pp[0], y, pp[1], 1.7, 0.5, 0, shade(col,-0.30));
        CYL(pp[0], y+0.35, pp[1], 1.35, 0.25, 0, 0x2c2418);
      });
      /* hide-drying frames: two posts + a stretched cloth "hide" panel,
         base at y=0 so it sways per 45-kit.js's cloth convention */
      var fp = loc(hx,hz, -w*0.5-7.2, -d*0.30, ry);
      [-1,1].forEach(function(s){
        var pp = loc(fp[0],fp[1], 0, s*2.0, 0);
        CYL(pp[0], y, pp[1], 0.24, 2.8, 0, shade(TRUNKC[0],-0.15), 'wood');
      });
      BOX(fp[0], y+2.7, fp[1], 0.7, 0.16, 4.2, ry, shade(TRUNKC[0],-0.1), 'wood');
      BOX(fp[0], y, fp[1], 0.7, 2.5, 3.6, ry, shade(TRUNKC[2],0.10), 'cloth');
      /* dye vats: small colourful cylinders, one per accent hue already
         in the palette (banner pastels), not a new colour array */
      var vBase = loc(hx,hz, -w*0.5-3.6, d*0.28, ry);
      [pick(BANNERC), pick(BANNERC)].forEach(function(vc, i){
        var vp = loc(vBase[0],vBase[1], 0, (i-0.5)*2.6, 0);
        CYL(vp[0], y, vp[1], 1.0, 1.1, 0, shade(ROOFS[5],-0.20), 'metal');
        CYL(vp[0], y+1.05, vp[1], 0.85, 0.12, 0, vc);
      });
      var wpost = loc(hx,hz, -w*0.5-4.2, -d*0.30, ry);
      guildRowWorker(wpost[0], wpost[1], y, ry+Math.PI, 'tanner', 1.0);
    }
  });
})();

/* ---- Scribe's Guild: the monastery runs fields and dorms but has no
   scriptorium — a slender velothi tower reads as a scribe's hall the way
   it already reads as the Alchemist's on the Guild canton. Paper-drying
   court and a copy table out back. ---- */
(function(){
  var col = pick(MARBLEC);
  placeGuildRowHall({
    name:'Scribe', w:20, d:18, h:28, kind:'velothi', col:col, opt:{cap:'dome'},
    yardDepth:11, yardWidth:20, anchor:[750,-40], sideFxFrac:0.7,
    yard:function(hx,hz,y,ry,w,d,h,col){
      /* paper-drying court: posts + pale cloth sheets on a line */
      var fp = loc(hx,hz, -w*0.5-4.6, -d*0.28, ry);
      [-1,1].forEach(function(s){
        var pp = loc(fp[0],fp[1], 0, s*3.2, 0);
        CYL(pp[0], y, pp[1], 0.22, 2.6, 0, shade(TRUNKC[0],-0.1), 'wood');
      });
      BOX(fp[0], y+2.5, fp[1], 0.5, 0.14, 6.6, ry, shade(TRUNKC[0],-0.1), 'wood');
      for(var i=0;i<3;i++){
        var t = (i+0.5)/3;
        var sp = loc(fp[0],fp[1], 0, mix(-3.0,3.0,t), 0);
        BOX(sp[0], y+2.4, sp[1], 0.35, 1.4, 0.9, ry, shade(pick(BANNERC),0.15), 'cloth');
      }
      /* a copy table with an ink pot and a slanted lectern top */
      var tp = loc(hx,hz, -w*0.5-2.6, d*0.30, ry);
      BOX(tp[0], y, tp[1], 2.6, 1.0, 1.4, ry, shade(TRUNKC[0],-0.15), 'wood');
      CYL(tp[0]+0.6*Math.cos(ry+Math.PI/2), y+1.0, tp[1]-0.6*Math.sin(ry+Math.PI/2), 0.18, 0.30, 0, 0x1a1712);
      var wpost = loc(hx,hz, -w*0.5-3.6, -d*0.28, ry);
      guildRowWorker(wpost[0], wpost[1], y, ry+Math.PI, 'scribe', 1.0);
    }
  });
})();

window._guildRow = {
  placed: GUILD_ROW_PLACED.map(function(g){ return {name:g.name, x:Math.round(g.x), z:Math.round(g.z), ry:+g.ry.toFixed(2)}; }),
  skipped: GUILD_ROW_SKIPPED
};
