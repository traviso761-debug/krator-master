/* ==== 19e. DISTRICT CONTENT ==== */
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

function faceToward(x,z,tx,tz){ return Math.atan2(-(tz-z), (tx-x)); }

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

/* ==== market stall goods: fruit/bread/cheese piles on the counter, all ==== */
function stallGoods(sx, sz, topY, sw, sd, ry, kind){
  if(kind === 'exotic'){

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

/* ==== markets: stall rows aligned to the bounding street, edge shops ==== */
reseed(690010);

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

    if(onRingHwy(inward[0],inward[1],5)) continue;
    if(!claim(inward[0],inward[1],5,4,ry2,'shop')) continue;
    structure(inward[0], terrainH(inward[0],inward[1]), inward[1], rr(7,10), rr(6,8), rr(8,14), ry2, 'hlaalu', pick(TONES));
    DIST_SHOPS++;
  }
});

/* ==== parks: exotic vegetation (park-only) + monuments ==== */
reseed(690020);
DIST_PARK.forEach(function(d){
  var b = polyBounds(d.poly);
  var area = (b.x1-b.x0)*(b.z1-b.z0);

  var nPlant = Math.max(28, Math.round(area/700));
  var mushroomsLeft = 2;                         /* landmark-sized — one or two per park, not scattered */
  for(var i=0;i<nPlant;i++){
    var x = rr(b.x0,b.x1), z = rr(b.z0,b.z1);
    if(!pointInPoly(x,z,d.poly)) continue;
    if(districtAt(x,z) !== 'park') continue;     /* stay clear of any polygon overlap */

    if(onRingHwy(x,z,2.4)) continue;
    if(!claim(x,z,2.4,2.4,rnd()*Math.PI*2,'exotic')) continue;
    var y = terrainH(x,z), ry3 = rnd()*Math.PI*2, pick4 = rnd();
    if(mushroomsLeft>0 && pick4<0.08){ emperorMushroom(x,y,z,ry3,null,{}); mushroomsLeft--; window._exotic.emperorMushroom++; }
    else if(pick4<0.35){ cherryBlossom(x,y,z,ry3,pick(BLOOMC),{}); window._exotic.cherryBlossom++; }
    else if(pick4<0.62){ dragonTree(x,y,z,ry3,null,{}); window._exotic.dragonTree++; }
    else{ baobab(x,y,z,ry3,null,{}); window._exotic.baobab++; }
  }

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

/* ==== funerary: dense graves and tombs, one temple, a short track back ==== */
var FUNP = {
  gravePitch: 5.5,

  graveFill : 0.70,
  tombPitch : 30,

  tombFill  : 0.70
};
reseed(690030);

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

function funeraryGate(x,y,z,ry,gap,col){
  col = col || MARBLEC[0];

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

  var blvdEnd = { x:1840.1, z:562.2 }, blvdPrev = { x:1460.66, z:582.19 };
  var bex = blvdEnd.x-blvdPrev.x, bez = blvdEnd.z-blvdPrev.z, beL = Math.hypot(bex,bez);
  var tx3 = blvdEnd.x + (bex/beL)*50, tz3 = blvdEnd.z + (bez/beL)*50;
  if(claim(tx3,tz3, 40, 32, 0, 'temple')){

    var templeC3 = CIDX['Temple'];
    var funRy = templeC3 ? faceToward(tx3, tz3, templeC3.x, templeC3.z) : -Math.PI/2;
    funeraryTemple(tx3, terrainH(tx3,tz3), tz3, funRy, MARBLEC[0], {});
  }

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

/* ==== warehouse district: a small grid of large plain sheds, aligned to ==== */
reseed(690040);
DIST_WAREHOUSE.forEach(function(d){

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

/* ==== 19f. AD HOC INFILL ==== */
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

var INFILL_SLUM_B = [[2059.2,-1156.2],[2124.8,-1087.6],[1748.3,-868.3],[1710.8,-978.5]];
var infillSlumBCount = scatterTownBuildings(INFILL_SLUM_B, 6, 0);

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

var INFILL_D = [[1896.4,1426.7],[2255.8,1398.8],[2572.9,1434.4],[2633.9,1614.4],
  [2594.7,1645.9],[2175.9,1629.0],[2016.1,1547.2]];

window._adHocInfill = { slumB: infillSlumBCount };

var INFILL_E = [[-768.7,1754.9],[-817.0,1817.6],[-675.4,1901.9],[-514.2,1971.7],
  [-362.7,2018.8],[-216.9,2043.2],[-210.3,1931.1],[-451.0,1901.3],[-620.9,1827.7]];
var infillECount = scatterTownBuildings(INFILL_E, 6, 0.5);
window._infillE = { buildings: infillECount };

var INFILL_F = [[1922.3,-1065.0],[1980.8,-870.3],[1856.5,-677.8],[1780.4,-667.1],[1712.3,-983.2]];
var infillFCount = scatterTownBuildings(INFILL_F, 22, 0.5);
window._infillF = { buildings: infillFCount };

/* ==== TAVERN PLACEMENT ==== */
reseed(690060);
var TAVERN_FX = 28, TAVERN_FZ = 17.75;

var TAVERN_POINTS = [
  [-681.7,1213.1], [178.2,1525.6],
  [1354.6,1185.0], [1635.7,87.8], [1311.2,-665.9], [1092.3,-749.2],
  [863.2,-470.2], [1031.3,298.7], [-57.0,2086.2],
  [-1379.8,921.0], [1934.2,1424.6], [1161.5,1492.9], [1358.9,737.4],
  [1911.2,-1059.3], [-1295.5,-87.5]
];

var TAVERN_MAX = 15;
var TAVERNS_PLACED = [], TAVERNS_SKIPPED = [];

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

    if(nearest.market || nearest.guild || nearest.arena || nearest.fortress || nearest.port){

      TAVERNS_SKIPPED.push({p:p, why:'special-deck canton ('+nearest.n+'), no safe overlap formula'}); return;
    }
    var top = CANTON_TOPS[nearest.n];
    if(!top){ TAVERNS_SKIPPED.push({p:p, why:'no CANTON_TOPS for '+nearest.n}); return; }

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

    (window._tavernCantonDbg = window._tavernCantonDbg || []).push({
      canton: nearest.n, topHw: hw, topY: top.y,
      deckFootprints: deckFP.length, hallFx: CT_FX, hallFz: CT_FZ,
      placed: bestTx !== null
    });
    if(bestTx===null){ TAVERNS_SKIPPED.push({p:p, why:'no clear gap among '+nearest.n+'\'s own top-tier buildings'}); return; }

    var ctSeedSave = seed;
    reseed(((bestTx|0)*9187 + (bestTz|0)*733) >>> 0);
    var res = tavern(bestTx, top.y, bestTz, bestRy, pick(TONES), CT_OPT);
    seed = ctSeedSave;
    if(res){
      res.canton = nearest.n;

      inspectClaim(bestTx, bestTz, CT_FX, CT_FZ, bestRy, 'tavern', 'Tavern');
      TAVERNS_PLACED.push(res);
    }
    return;
  }

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

TAVERN_MAX += 3;
var TAVERN_POINTS_2 = [[768.3,-295.1], [1746.0,-636.1], [-305.7,1557.9]];
TAVERN_POINTS_2.forEach(placeTavernAtPoint);

window._taverns = { placed: TAVERNS_PLACED.length, skipped: TAVERNS_SKIPPED, list: TAVERNS_PLACED };

reseed(690070);
var SILHOUETTE_SHRINES = [];
(function(){
  var sx = 2248.5, sz = -4448.5;
  var ry = faceToward(sx, sz, 0, 0);
  var res = lifeStandaloneShrine(sx, sz, ry, 46);
  SILHOUETTE_SHRINES.push([res.x, res.z]);
})();
window._silhouetteShrines = SILHOUETTE_SHRINES;

/* ==== HOUSE OF HEALING ==== */
reseed(690080);
var HOUSE_OF_HEALING = null;
if(typeof HOH_SITE !== 'undefined' && HOH_SITE){
  var hohY = terrainH(HOH_SITE.x, HOH_SITE.z);
  HOUSE_OF_HEALING = houseOfHealing(HOH_SITE.x, hohY, HOH_SITE.z, HOH_SITE.ry, pick(TONES), {});
}
window._houseOfHealing = HOUSE_OF_HEALING;

/* ==== NEW TRADE GUILD HALLS ==== */
reseed(690090);
var GUILD_ROW_MAX = 5;
var GUILD_ROW_PLACED = [], GUILD_ROW_SKIPPED = [];

function guildRowDhw(w){ return Math.min(2.2, w*0.5*0.9)*0.5; }

function guildRowWorker(x,z,y,ry,role,radius){
  GUILD_WORK_POSTS.push({ x:x, z:z, y:y, ry:ry, role:role, radius:radius||1.0 });
}

function placeGuildRowHall(spec){
  if(GUILD_ROW_PLACED.length >= GUILD_ROW_MAX){
    GUILD_ROW_SKIPPED.push({name:spec.name, why:'GUILD_ROW_MAX ('+GUILD_ROW_MAX+') reached'});
    return;
  }
  var w=spec.w, d=spec.d, h=spec.h;
  var yardDepth = spec.yardDepth, yardWidth = spec.yardWidth || d;

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

/* ==== Fisher's Guild: a low dockside hall well inland of the actual ==== */
(function(){
  var col = pick(TONES_POOR);
  placeGuildRowHall({
    name:'Fisher', w:28, d:22, h:18, kind:'hlaalu', col:col,
    yardDepth:13, yardWidth:26, anchor:[726,-202], sideFxFrac:0.7,
    yard:function(hx,hz,y,ry,w,d,h,col){

      var fp = loc(hx,hz, -w*0.5-5.5, -d*0.30, ry);
      [-1,1].forEach(function(s){
        var pp = loc(fp[0],fp[1], 0, s*3.6, 0);
        CYL(pp[0], y, pp[1], 0.28, 3.6, 0, shade(TRUNKC[0],-0.15), 'wood');
      });
      BOX(fp[0], y+3.5, fp[1], 0.9, 0.18, 7.6, ry, shade(TRUNKC[0],-0.1), 'wood');
      BOX(fp[0], y, fp[1], 0.9, 3.3, 6.8, ry, pick(SAILC), 'cloth');

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

      for(var b=0;b<3;b++){
        var bp = loc(hx,hz, -w*0.5-2.2, -d*0.5+1.6+b*1.9, ry);
        CYL(bp[0], y, bp[1], 0.85, 1.5, 0, shade(TRUNKC[1],-0.05), 'wood');
      }
      var wp = loc(hx,hz, -w*0.5-4.0, -d*0.30, ry);
      guildRowWorker(wp[0], wp[1], y, ry+Math.PI, 'fisher', 1.1);
    }
  });
})();

/* ==== Miner's/Quarryman's Guild: squat, thick-walled, grey — 6 mines and ==== */
(function(){

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

/* ==== Brewer's Guild: mash house annex, barrel stack, copper kettle ==== */
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

/* ==== Tanner's/Dyer's Guild: tan pits, hide-drying frames, dye vats — ==== */
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

      var fp = loc(hx,hz, -w*0.5-7.2, -d*0.30, ry);
      [-1,1].forEach(function(s){
        var pp = loc(fp[0],fp[1], 0, s*2.0, 0);
        CYL(pp[0], y, pp[1], 0.24, 2.8, 0, shade(TRUNKC[0],-0.15), 'wood');
      });
      BOX(fp[0], y+2.7, fp[1], 0.7, 0.16, 4.2, ry, shade(TRUNKC[0],-0.1), 'wood');
      BOX(fp[0], y, fp[1], 0.7, 2.5, 3.6, ry, shade(TRUNKC[2],0.10), 'cloth');

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

/* ==== Scribe's Guild: the monastery runs fields and dorms but has no ==== */
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
