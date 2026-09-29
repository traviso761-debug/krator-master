/* ============================== 7. GROUND CANVASES ==============================
   The world is now far bigger than one texture can cover, so the canvas holds
   only the city box; everything beyond is coloured per-vertex on the terrain
   mesh, and the two are blended in the terrain shader. */

/* TEX/MSK/B all scale with CITY_EXT so px-per-world-unit stays the density
   that was tuned at the old 2400 box, now that the box covers ~3900 */
var TEX = 3328, MSK = 2080, CE2 = CITY_EXT*2;
function W2P(v, size){ return (v + CITY_EXT) * (size/CE2); }
function P2W(p, size){ return p*(CE2/size) - CITY_EXT; }
function inCity(x,z){ return Math.abs(x) < CITY_EXT && Math.abs(z) < CITY_EXT; }

var gcv = document.createElement('canvas'); gcv.width=gcv.height=TEX;
var gx  = gcv.getContext('2d');
var mcv = document.createElement('canvas'); mcv.width=mcv.height=MSK;
var mx  = mcv.getContext('2d');

/* ---- base ground colouring, shared with the far-terrain vertex colours ----
   groundTone() is the one true colour at every point on the map, at full
   detail — the same scheme applies everywhere, city or wilderness. It is
   rasterised into the ground canvas (fine, up to CITY_EXT) and ALSO sampled
   once per terrain-mesh vertex beyond that, where the mesh warps out to tens
   of metres a vertex (see warp() in 75-terrain.js) and cannot resolve this
   function's own fine noise. An earlier version of this fragment fought that
   by fading the noise toward flat near the canvas edge — that is exactly the
   washed-out, monochrome look that was the actual complaint, just moved
   earlier. The real fix is CITY_EXT itself: it now clears the farthest thing
   actually built (~3800, checked against placed instances), so everything
   inhabited gets the fine canvas treatment and nothing relies on the coarse
   vertex fallback at all. Do not reintroduce a distance fade here. */
function groundTone(x,z){
  var h = terrainH(x,z);
  var st = 9;
  var slope = Math.min(1, Math.hypot(terrainH(x+st,z)-h, terrainH(x,z+st)-h)/st * 2.6);
  var dr = polyDist(x,z,RIVER);
  var n = fbm(x*0.011, z*0.011);
  var r,g2,b;
  if(h < 1.2){
    var t = smooth(-16,1.2,h);
    r=mix(64,166,t); g2=mix(72,154,t); b=mix(70,126,t);
  }else{
    var beach = 1 - smooth(1.8, 15, h);
    var green = smooth(1.0,0.0,slope) * (0.26 + 0.58*smooth(460,70,dr)) * smooth(0.62,0.28,n);
    var rock  = smooth(0.30,0.78,slope)*0.85 + smooth(190,330,h)*0.58;
    r=150; g2=139; b=118;
    r=mix(r,108,green); g2=mix(g2,122,green); b=mix(b,78,green);
    r=mix(r,116,rock);  g2=mix(g2,110,rock);  b=mix(b,106,rock);
    r=mix(r,186,beach); g2=mix(g2,174,beach); b=mix(b,146,beach);
  }
  var sp = 0.88 + 0.24*vn(x*0.09,z*0.09);
  return [clamp(r*sp,0,255), clamp(g2*sp,0,255), clamp(b*sp,0,255)];
}
(function(){
  var B=1040, bC=document.createElement('canvas'); bC.width=bC.height=B;
  var bg=bC.getContext('2d'), img=bg.createImageData(B,B), d=img.data;
  for(var j=0;j<B;j++){
    var z = P2W(j+0.5, B);
    for(var i=0;i<B;i++){
      var c = groundTone(P2W(i+0.5,B), z), o=(j*B+i)*4;
      d[o]=c[0]; d[o+1]=c[1]; d[o+2]=c[2]; d[o+3]=255;
    }
  }
  bg.putImageData(img,0,0);
  gx.imageSmoothingEnabled = true;
  gx.drawImage(bC, 0,0, TEX,TEX);
})();

/* ---- mask: white is buildable ---- */
mx.fillStyle='#fff'; mx.fillRect(0,0,MSK,MSK);
(function(){
  var S=400, tmp=document.createElement('canvas'); tmp.width=tmp.height=S;
  var tg=tmp.getContext('2d');
  tg.fillStyle='#fff'; tg.fillRect(0,0,S,S);
  tg.fillStyle='#000';
  for(var j=0;j<S;j++){
    var z=P2W(j+0.5,S);
    for(var i=0;i<S;i++){
      var x=P2W(i+0.5,S);
      if(landDist(x,z) < 22 || terrainH(x,z) < 3.0 ||
         Math.abs(x)>CITY_LIM || Math.abs(z)>CITY_LIM) tg.fillRect(i,j,1,1);
    }
  }
  mx.imageSmoothingEnabled=false;
  mx.drawImage(tmp,0,0,MSK,MSK);
})();

/* ---- farm fields, and the marsh where the river spreads into the bay ---- */
function fillRect(ctx, size, x, z, w, h, ry, col){
  ctx.save(); ctx.translate(W2P(x,size), W2P(z,size)); ctx.rotate(-ry);
  ctx.fillStyle = col; var sw = w*(size/CE2), sh = h*(size/CE2);
  ctx.fillRect(-sw/2, -sh/2, sw, sh); ctx.restore();
}
(function(){
  /* marsh: darker, greener ground in a fan round the river mouth */
  var M = 260, img = gx.getImageData(0,0,TEX,TEX);
  gx.globalAlpha = 1;
  for(var j=0;j<M;j++) for(var i=0;i<M;i++){
    var x=P2W((i+0.5)*(TEX/M),TEX), z=P2W((j+0.5)*(TEX/M),TEX);
    var rv = polyNear(x,z,RIVER,RIVER_CUM);
    if(rv.t > 0.12 || rv.d > 420) continue;
    var h = terrainH(x,z); if(h < 0.2 || h > 9) continue;
    var a = (1-smooth(120,420,rv.d)) * (1-smooth(4,9,h)) * 0.55;
    gx.fillStyle = 'rgba(78,92,58,'+a.toFixed(3)+')';
    gx.fillRect(i*(TEX/M), j*(TEX/M), TEX/M+1, TEX/M+1);
  }
  /* terraced orchards: bands following the height contours */
  (function(){
    var M = 300;
    for(var j=0;j<M;j++) for(var i=0;i<M;i++){
      var x=P2W((i+0.5)*(TEX/M),TEX), z=P2W((j+0.5)*(TEX/M),TEX);
      if(zoneAt(x,z) !== 'orchard') continue;
      var h = terrainH(x,z);
      var band = (h % 7.5) / 7.5;                          /* one terrace per 7.5 units of rise */
      var a = band < 0.18 ? 0.42 : 0.16 + 0.10*band;
      gx.fillStyle = band < 0.18 ? 'rgba(96,86,66,'+a+')' : 'rgba(88,104,52,'+a.toFixed(3)+')';
      gx.fillRect(i*(TEX/M), j*(TEX/M), TEX/M+1, TEX/M+1);
    }
  })();
  FARMS.forEach(function(f){
    f.fields.forEach(function(q){
      if(!inCity(q.x,q.z)) return;
      fillRect(gx, TEX, q.x, q.z, q.w, q.h, q.ry, q.tone);
      /* plough lines */
      gx.save(); gx.translate(W2P(q.x,TEX), W2P(q.z,TEX)); gx.rotate(-q.ry);
      gx.strokeStyle='rgba(60,54,36,0.28)'; gx.lineWidth=1;
      var sw=q.w*(TEX/CE2), sh=q.h*(TEX/CE2);
      for(var y=-sh/2+3; y<sh/2; y+=4.2){ gx.beginPath(); gx.moveTo(-sw/2,y); gx.lineTo(sw/2,y); gx.stroke(); }
      gx.restore();
      fillRect(mx, MSK, q.x, q.z, q.w+6, q.h+6, q.ry, '#000');
    });
  });
})();

/* ---- roads ---- */
/* ROADCOL lives in 05-palette.js (PAL.road). */
function strokePoly(ctx, pts, size, w, col, cap){
  if(pts.length<2) return;
  ctx.strokeStyle=col; ctx.lineWidth=Math.max(1, w*(size/CE2));
  ctx.lineJoin='round'; ctx.lineCap=cap||'round';
  ctx.beginPath(); ctx.moveTo(W2P(pts[0][0],size), W2P(pts[0][1],size));
  for(var i=1;i<pts.length;i++) ctx.lineTo(W2P(pts[i][0],size), W2P(pts[i][1],size));
  ctx.stroke();
}
/* painted in two passes over ALL roads, not one road at a time: every halo
   first, then every surface — otherwise a road painted later smears its dark
   halo across an earlier road's surface right where they should read as a
   junction. The surface pass is also sorted so wider/more important classes
   finish on top of narrower ones instead of whichever happened to generate
   last. The mask doesn't care about paint order (it's just a boolean
   exclusion), so it stays a single pass. */
var ROAD_CLASS_ORDER = { minor:0, ring:1, boulevard:2, quay:3, highway:4 };
ROADS.forEach(function(rd){ strokePoly(gx, rd.pts, TEX, rd.w+3, 'rgba(58,52,42,0.26)'); });
ROADS.slice().sort(function(a,b){
  return (ROAD_CLASS_ORDER[a.cls]||0) - (ROAD_CLASS_ORDER[b.cls]||0);
}).forEach(function(rd){
  strokePoly(gx, rd.pts, TEX, rd.w, ROADCOL[rd.cls]||ROADCOL.minor);
});
ROADS.forEach(function(rd){ strokePoly(mx, rd.pts, MSK, rd.w+5, '#000'); });

/* districts: painted after roads so they override, per the brief — a
   market/park/funerary polygon's own ground colour reads through even where
   a road happens to cross it. Cosmetic only: building exclusion is via the
   districtAt() checks in the building passes themselves (30-layout.js /
   60-land.js), not the mask — see the note by DISTRICTS in 30-layout.js for
   why. CPIERS (small-craft piers off the market canton) DO stroke into the
   mask here, same as PIERS/RPIERS above, since a real footprint needs it. */
function fillPoly(ctx, pts, size, col){
  if(pts.length<3) return;
  ctx.fillStyle=col; ctx.beginPath();
  ctx.moveTo(W2P(pts[0][0],size), W2P(pts[0][1],size));
  for(var i=1;i<pts.length;i++) ctx.lineTo(W2P(pts[i][0],size), W2P(pts[i][1],size));
  ctx.closePath(); ctx.fill();
}
var DISTRICT_GROUND = { market:'#c9bc9e', park:'#7d8a52', funerary:'#8c8069' };
DISTRICTS.forEach(function(d){
  fillPoly(gx, d.poly, TEX, DISTRICT_GROUND[d.type] || '#a89c82');
});
/* the owner: the NW highway "is not currently visible" through Abbey
   Close — true, and exactly the district-paint-after-roads behaviour
   documented above: the park's own ground fill (this file, just above)
   paints right over the highway's pixels wherever the two overlap, same
   as it would for any road crossing any district. That override is
   deliberate everywhere else ("a market/park/funerary polygon's own
   ground colour reads through even where a road happens to cross it"),
   so the fix is NOT to flip the global paint order (roads after
   districts) — that would kill the clean-ground look this same comment
   describes for every other district. Instead, only highway-class roads
   (the ones the brief explicitly says must stay free to run across a
   district polygon — see the DISTRICTS note in 30-layout.js) get
   re-stroked on top, after every district has painted. Re-stroking the
   whole road rather than clipping to just the inside-district portion is
   deliberately simpler and has zero effect outside a district (same
   paint, same position — a strictly redundant re-draw there), so this
   doesn't need to know which highway crosses which polygon. */
var HWY_ROADS = ROADS.filter(function(rd){ return rd.cls === 'highway'; });
HWY_ROADS.forEach(function(rd){ strokePoly(gx, rd.pts, TEX, rd.w+3, 'rgba(58,52,42,0.26)'); });
HWY_ROADS.forEach(function(rd){ strokePoly(gx, rd.pts, TEX, rd.w, ROADCOL.highway); });
CPIERS.forEach(function(pr){ strokePoly(mx, [[pr.x0,pr.z0],[pr.x1,pr.z1]], MSK, pr.w+14, '#000'); });

/* harbour apron, pier footings, causeway landings */
(function(){
  var p=[];
  for(var s=HARB_S0-70; s<=HARB_S1+70; s+=22) p.push(shoreIn(s, 46));
  strokePoly(gx, p, TEX, 86, '#bbae94');
  strokePoly(mx, p, MSK, 86, '#000');
  PIERS.forEach(function(pr){ strokePoly(mx, [[pr.x0,pr.z0],[pr.x1,pr.z1]], MSK, pr.w+18, '#000'); });
  RPIERS.forEach(function(pr){ strokePoly(mx, [[pr.x0,pr.z0],[pr.bx,pr.bz]], MSK, 40, '#000'); });
  RBRIDGES.forEach(function(b){ strokePoly(gx, [[b.ax,b.az],[b.bx,b.bz]], TEX, b.w+40, '#a89d86');
                                strokePoly(mx, [[b.ax,b.az],[b.bx,b.bz]], MSK, b.w+52, '#000'); });
  CAUSEWAYS.forEach(function(cw){
    var lp = shoreIn(cw.s, 24);
    if(cw.solid){
      /* a reclaimed-land mole runs solid the whole way to the canton, and is
         much wider than the old pier deck — mask its true footprint, not
         just a stub near shore, or a building can spawn on its edge */
      var w = cw.c.port ? 60 : 48;
      strokePoly(gx, [[cw.c.x,cw.c.z], lp], TEX, w+6, '#b6aa90');
      strokePoly(mx, [[cw.c.x,cw.c.z], lp], MSK, w+26, '#000');
    }else{
      var ip = shoreIn(cw.s, 160);
      strokePoly(gx, [lp,ip], TEX, 30, '#b6aa90');
      strokePoly(mx, [lp,ip], MSK, 48, '#000');
    }
  });
})();

/* the rampart band */
strokePoly(gx, WALL, TEX, 30, 'rgba(120,112,96,0.72)');
strokePoly(mx, WALL, MSK, 46, '#000');

/* ---- read the mask once ---- */
var MASKDATA = mx.getImageData(0,0,MSK,MSK).data;
function maskAt(x,z){
  if(!inCity(x,z)) return 0;
  var i = Math.round(W2P(x,MSK)), j = Math.round(W2P(z,MSK));
  if(i<0||j<0||i>=MSK||j>=MSK) return 0;
  return MASKDATA[(j*MSK+i)*4];
}
function openAt(x,z){ return maskAt(x,z) > 200; }

