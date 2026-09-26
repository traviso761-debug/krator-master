/* ==== 14. CHINAMPAS ==== */
reseed(550001);

var CHINN = 0, CHINHUTS = 0;

/* ==== TUNING PARAMETERS ==== */
var CHINP = {
  /* bed geometry */
  bedW        : 14.0,   /* bed width, across the furrow — slightly wider    */

  bedL        : 27.0,   /* bed length                                       */
  rowSpacing  : 20.0,   /* row MIDLINES this far apart, leaving rowSpacing- */
                         /* bedW = 6 of open canal between bands — close to */
                         /* a canoe width (~3) once the sanity pass's own   */
                         /* +-1.5 alignment tolerance is subtracted from    */
                         /* both sides, packing the field densely while     */
                         /* still leaving every canal paddleable. Only the  */
                         /* few wide canals at causeways/spans/piers (their */
                         /* own clearances, unchanged) stay open as "main"  */
                         /* canals through the dense field.                 */

  /* where beds may stand */
  depthMin    : 1.1,    /* shallower than this and the bed grounds out      */
  depthMax    : 17.5,   /* deeper than this and it is not worth building    */

  cantonPad   : 22, spanClear : 22, causewayClear : 34, causewayClearSolid : 50,
  pierClear   : 40, isleClear : [1.40, 12], riverClear : 30,

  /* dressing */
  matureChance: 0.36,   /* a mature bed gets willows on its banks           */
  willowsPer  : [1, 3],
  cropChance  : 0.88,
  marshRiverT : 0.14,   /* beds turn to marsh this far up the river's param */
  marshRiverD : 380,

  hutChance   : 0.10
};

/* a ray-cast point-in-polygon test. */
function pointInPoly(x,z,poly){
  var inside = false;
  for(var i=0,j=poly.length-1; i<poly.length; j=i++){
    var xi=poly[i][0], zi=poly[i][1], xj=poly[j][0], zj=poly[j][1];
    var hit = ((zi>z) !== (zj>z)) && (x < (xj-xi)*(z-zi)/(zj-zi)+xi);
    if(hit) inside = !inside;
  }
  return inside;
}

var ZONE = [[-1391.1,-821.2],[-398.6,-919.8],[-66.7,-637.4],[-82.1,-457.6],[-149.7,-326.5],
  [-209.4,-199.6],[-267.9,-104.9],[-318.6,-18.0],[-488.2,69.6],[-633.0,127.3],[-776.3,191.0],
  [-834.3,219.9],[-910.3,292.8],[-922.7,356.9],[-940.6,531.2],[-947.6,816.4],[-749.0,1098.2],
  [-392.6,1393.3],[-101.1,1419.4],[-139.6,1463.5],[128.0,1491.6],[126.5,1391.8],[390.7,1390.2],
  [408.8,1133.0],[674.6,1124.2],[1177.8,1357.9],[1237.3,1248.4],[520.5,952.8],[510.1,309.4],
  [435.6,266.5],[431.4,-40.7],[255.2,-79.6],[348.7,-495.2],[712.5,-389.4],[664.9,-174.8],
  [791.6,138.4],[886.8,481.1],[884.3,783.4],[929.9,898.6],[1088.5,1006.9],[1188.0,1068.4],
  [1238.7,1225.4],[1263.1,1241.6],[1195.4,1375.6],[1029.1,1429.2],[742.4,1445.2],[369.5,1791.9],
  [77.6,1899.0],[-323.5,1904.8],[-744.4,1751.8],[-985.0,1556.6],[-1327.7,791.1],[-1408.5,313.0],
  [-1273.9,-6.1],[-1022.9,-218.7],[-796.0,-328.6],[-796.3,-335.7]];

var CHIN_ZONE_A = [[1545.4,-1036.0],[1534.7,-1222.7],[1745.9,-1253.8],[1878.0,-1343.4],
  [2001.4,-1204.0],[1790.8,-1090.2]];
var CHIN_ZONE_C = [[-1300.9,-820.0],[-1210.5,-1138.1],[-1237.7,-1170.1],[-1461.9,-1204.0],
  [-1636.3,-1267.0],[-1782.8,-1320.9],[-1884.7,-1226.0],[-1920.2,-1195.2],[-1641.8,-1053.8],
  [-1376.9,-811.3],[-1344.0,-781.5]];
var CHIN_ZONES = [ZONE, CHIN_ZONE_A, CHIN_ZONE_C];
function inAnyChinZone(x,z){
  for(var i=0;i<CHIN_ZONES.length;i++) if(pointInPoly(x,z,CHIN_ZONES[i])) return true;
  return false;
}

var TRAFFIC_LANE = [[392.7,872.4],[612.0,969.7],[549.5,1118.9],[331.5,1081.0]];

var CHIN_DELETE_ZONE = [[-719.8,-309.2],[-691.8,-369.9],[-501.2,-520.8],[-343.3,-601.4],
  [-95.5,-308.0],[-310.9,-20.6],[-595.9,-112.2]];

var CHIN_STRAY_POINTS = [ { x:-367.1, z:-78.6, r:20 } ];

var CHIN_STRAY_ZONE = [[-246.6,-582.1],[-279.3,-623.9],[-230.3,-642.9],[-198.6,-587.4]];

var CHIN_STRAY_ZONE_B = [[-423.1,-86.8],[-361.0,-27.9],[-212.5,-109.7],
  [-143.4,-625.6],[-238.4,-666.2],[-314.3,-628.9]];

var CHIN_EXTENT_OFFS = (function(){

  var o = [[0,0]];
  [CHINP.bedL*0.5, CHINP.bedL*0.95].forEach(function(r){
    for(var a=0;a<8;a++) o.push([Math.cos(a*Math.PI/4)*r, Math.sin(a*Math.PI/4)*r]);
  });
  return o;
})();
function inOwnerExclusion(x,z){
  for(var e=0;e<CHIN_EXTENT_OFFS.length;e++){
    var sx = x+CHIN_EXTENT_OFFS[e][0], sz = z+CHIN_EXTENT_OFFS[e][1];
    if(pointInPoly(sx,sz,TRAFFIC_LANE)) return true;
    if(pointInPoly(sx,sz,CHIN_DELETE_ZONE)) return true;
    if(pointInPoly(sx,sz,CHIN_STRAY_ZONE)) return true;
    if(pointInPoly(sx,sz,CHIN_STRAY_ZONE_B)) return true;
    for(var si=0;si<CHIN_STRAY_POINTS.length;si++){
      var sp = CHIN_STRAY_POINTS[si];
      if(Math.hypot(sx-sp.x,sz-sp.z) < sp.r) return true;
    }
  }
  return false;
}
function chinBlocked(x,z){
  if(inOwnerExclusion(x,z)) return true;
  for(var i=0;i<CANTONS.length;i++){
    var c=CANTONS[i];
    if(Math.abs(x-c.x) < c.r*1.10+CHINP.cantonPad+CHINP.bedL && Math.abs(z-c.z) < c.r*1.10+CHINP.cantonPad+CHINP.bedL) return true;
  }
  for(var j=0;j<SPANS.length;j++){
    var A=CANTONS[SPANS[j].a], B=CANTONS[SPANS[j].b];
    if(segDist(x,z, A.x,A.z, B.x,B.z) < CHINP.spanClear+CHINP.bedL) return true;
  }
  for(var k=0;k<CAUSEWAYS.length;k++){
    var cw=CAUSEWAYS[k], c2=cw.c, lp=shoreIn(cw.s, 26);
    var clr = (cw.solid ? CHINP.causewayClearSolid : CHINP.causewayClear) + CHINP.bedL;
    if(segDist(x,z, c2.x,c2.z, lp[0],lp[1]) < clr) return true;
  }
  for(var m=0;m<PIERS.length;m++){ var P=PIERS[m]; if(segDist(x,z, P.x0,P.z0, P.x1,P.z1) < CHINP.pierClear+CHINP.bedL) return true; }
  if(typeof CPIERS !== 'undefined') for(var cp=0;cp<CPIERS.length;cp++){
    var CP=CPIERS[cp]; if(segDist(x,z, CP.x0,CP.z0, CP.x1,CP.z1) < CHINP.pierClear+CHINP.bedL) return true;
  }
  for(var q=0;q<ISLES.length;q++){ var I=ISLES[q]; if(Math.hypot(x-I[0],z-I[1]) < I[3]*CHINP.isleClear[0]+CHINP.isleClear[1]) return true; }
  if(inRiver(x,z, CHINP.riverClear)) return true;
  var FORT = CIDX['Fortress'];
  if(x < FORT.x - 20 && z < FORT.z - 20) return true;
  return false;
}

function willow(x, z, y){
  var h = rr(4.5,8), r = rr(3.2,5.6);
  STK(x, y, z, rr(0.5,0.8), h*0.55, 0, 0x5a4b3a, 'trunk');
  BLOB(x, y+h*0.45, z, r, h*0.55, rnd()*3, pick(WILLOWC), 'leaf');     /* the drooping crown */
  BLOB(x+rr(-1,1), y+h*0.25, z+rr(-1,1), r*0.8, h*0.30, rnd()*3, shade(pick(WILLOWC),-0.1), 'leaf');
}
function chinampaBed(x, z, ry, bw, bl, marsh){
  var bed = terrainH(x,z);
  if(bed > -1.1 || bed < -19) return false;
  var top = (marsh ? 0.55 : 1.5) + rr(-0.3,0.4);
  var mature = !marsh && chance(CHINP.matureChance);
  BOX(x, bed-0.6, z, bw, top-bed+0.6, bl, ry, pick(MUDC), 'plaster');
  BOX(x, top, z, bw*0.94, 0.5, bl*0.97, ry, shade(pick(MUDC),-0.12), 'plaster');
  if(marsh){
    for(var i=0;i<ri(2,5);i++){
      var p = loc(x,z, rr(-bw*0.4,bw*0.4), rr(-bl*0.45,bl*0.45), ry);
      CONE(p[0], top+0.4, p[1], rr(0.5,1.1), rr(2.5,5.5), rnd()*3, pick(REEDC), 'leaf');
    }
  }else if(chance(CHINP.cropChance)){
    var ch = rr(0.9, 2.8), cc = pick(CROPC);
    BOX(x, top+0.5, z, bw*0.74, ch, bl*0.88, ry, cc, 'leaf');
    if(chance(0.35)) BOX(x, top+0.5+ch, z, bw*0.50, rr(0.5,1.4), bl*0.7, ry, shade(cc,0.08), 'leaf');
  }
  if(mature){
    var nw = ri(CHINP.willowsPer[0], CHINP.willowsPer[1]);
    for(var w=0;w<nw;w++){
      var q0 = loc(x,z, (chance(0.5)?-1:1)*bw*0.5, rr(-0.42,0.42)*bl, ry);
      willow(q0[0], q0[1], top);
    }
  }else if(chance(0.5)){
    var n = ri(2,4);
    for(var k=0;k<n;k++){
      var t = (k+0.5)/n, sg = chance(0.5)?-1:1;
      var q = loc(x,z, sg*bw*0.5, (t-0.5)*bl, ry);
      CYL(q[0], bed, q[1], 0.42, top-bed+rr(1.2,3.4), 0, pick(REEDC), 'wood');
    }
  }
  CHINN++;
  return true;
}
function chinampaHut(x, z, ry, bw, bl){
  var hd = terrainH(x,z);
  for(var k=0;k<4;k++){
    var o = loc(x,z, (k<2?-1:1)*bw*0.32, (k%2?-1:1)*bl*0.32, ry);
    CYL(o[0], hd, o[1], 0.6, 4.2-hd, 0, 0x6b5942, 'wood');
  }
  BOX(x, 3.8, z, bw*0.92, 0.9, bl*0.92, ry, 0x7d6a50, 'wood');
  structure(x, 4.7, z, bw*0.68, bl*0.62, rr(4.5,7), ry, 'hovel', pick(TONES_POOR));
  CHINN++; CHINHUTS++;
  window._chinampaHuts.push([x,z,ry]);
}
window._chinampaHuts = [];

var CGRID = {}, CG = 24;
function chinHit(x,z,r){
  var i0=Math.floor((x-r)/CG), i1=Math.floor((x+r)/CG), j0=Math.floor((z-r)/CG), j1=Math.floor((z+r)/CG);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
    var a=CGRID[i+','+j]; if(!a) continue;
    for(var n=0;n<a.length;n++){ var o=a[n], dx=x-o[0], dz=z-o[1], rr2=r+o[2]; if(dx*dx+dz*dz < rr2*rr2) return true; }
  }
  return false;
}
function chinPut(x,z,r){
  var i0=Math.floor((x-r)/CG), i1=Math.floor((x+r)/CG), j0=Math.floor((z-r)/CG), j1=Math.floor((z+r)/CG);
  for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k=i+','+j; (CGRID[k]||(CGRID[k]=[])).push([x,z,r]); }
}

/* ==== planning phase ==== */
reseed(60453);
var planned = [];
function placeUnitAt(s, uK, rowK){
  var n = shoreNorm(s), base = shoreAt(s);
  var x = base[0]-n[0]*uK, z = base[1]-n[1]*uK;
  var ry = Math.atan2(-n[1], n[0]);
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  var marsh = rv.t < CHINP.marshRiverT && rv.d < CHINP.marshRiverD && chance(smooth(CHINP.marshRiverD,120,rv.d));
  var isHut = false;
  if(chance(CHINP.hutChance)){
    var hd = terrainH(x,z);
    if(hd < -1.5 && hd > -15) isHut = true;
  }
  planned.push({x:x, z:z, ry:ry, bw:CHINP.bedW, bl:CHINP.bedL, marsh:marsh, isHut:isHut, rowK:rowK});
}
function fillStretch(sStart, sEnd, uK, rowK){
  var len = sEnd - sStart;

  if(len < 3.0) return;
  var pos = sStart;
  while(sEnd - pos >= CHINP.bedL){
    placeUnitAt(pos + CHINP.bedL*0.5, uK, rowK);
    pos += CHINP.bedL;
  }
  if(sEnd - pos > 3.0) placeUnitAt(sEnd - CHINP.bedL*0.5, uK, rowK);   /* cap the remainder — rule 6 */
}

function chinGenerateZone(zonePoly){
  var zoneS = zonePoly.map(function(p){ return shoreS(p[0],p[1]); });
  var S0 = Math.min.apply(null, zoneS) - 250, S1 = Math.max.apply(null, zoneS) + 250;
  var STEP = 8, KMAX = 60, emptyStreak = 0;
  for(var k=0; k<KMAX; k++){
    var uK = k*CHINP.rowSpacing + CHINP.bedW*0.5;
    var anyValid = false, stretchStart = null, prevValid = false, prevS = null;
    for(var s=S0; s<=S1; s+=STEP){
      var n = shoreNorm(s), base = shoreAt(s);
      var x = base[0]-n[0]*uK, z = base[1]-n[1]*uK;
      var valid = pointInPoly(x,z,zonePoly) && !chinBlocked(x,z);
      if(valid){
        var d = -terrainH(x,z);
        valid = (d >= CHINP.depthMin && d <= CHINP.depthMax);
      }
      if(valid) anyValid = true;
      if(valid && !prevValid) stretchStart = s;
      if(!valid && prevValid) fillStretch(stretchStart, prevS, uK, k);
      prevValid = valid; prevS = s;
    }
    if(prevValid) fillStretch(stretchStart, S1, uK, k);
    if(anyValid){ emptyStreak = 0; } else { emptyStreak++; if(emptyStreak >= 4) break; }
  }
}
chinGenerateZone(ZONE);
chinGenerateZone(CHIN_ZONE_A);
chinGenerateZone(CHIN_ZONE_C);

/* ==== sanity pass (rule 7) ==== */
function cornerU(x,z){
  var s = shoreS(x,z), n = shoreNorm(s), base = shoreAt(s);
  return (base[0]-x)*n[0] + (base[1]-z)*n[1];
}
var CANAL_TOL = 1.5;   /* absorbs shoreS/shoreNorm's own approximation error */
function unitCanalOk(u){
  var lo = u.rowK*CHINP.rowSpacing - CANAL_TOL, hi = u.rowK*CHINP.rowSpacing + CHINP.bedW + CANAL_TOL;
  var half = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for(var i=0;i<4;i++){
    var p = loc(u.x, u.z, half[i][0]*u.bw*0.5, half[i][1]*u.bl*0.5, u.ry);
    var uu = cornerU(p[0], p[1]);
    if(uu < lo || uu > hi) return false;
  }
  return true;
}
var finalUnits = [], sanityFound = 0, sanityFixed = 0, sanityDropped = 0;
planned.forEach(function(u){
  if(unitCanalOk(u)){ finalUnits.push(u); return; }
  sanityFound++;
  var curU = cornerU(u.x, u.z);
  var kNear = Math.max(0, Math.round((curU - CHINP.bedW*0.5) / CHINP.rowSpacing));
  var newU = kNear*CHINP.rowSpacing + CHINP.bedW*0.5;
  var s = shoreS(u.x, u.z), n = shoreNorm(s), base = shoreAt(s);
  var cand = {
    x: base[0]-n[0]*newU, z: base[1]-n[1]*newU,
    ry: Math.atan2(-n[1], n[0]), bw:u.bw, bl:u.bl, marsh:u.marsh, isHut:u.isHut, rowK:kNear
  };
  var d = -terrainH(cand.x, cand.z);
  var okPos = inAnyChinZone(cand.x,cand.z) && !chinBlocked(cand.x,cand.z) &&
              d >= CHINP.depthMin && d <= CHINP.depthMax;
  if(okPos && unitCanalOk(cand)){ finalUnits.push(cand); sanityFixed++; }
  else { sanityDropped++; }
});
window._chinCanalCheck = { found: sanityFound, fixed: sanityFixed, dropped: sanityDropped };

/* ==== build phase ==== */
finalUnits.forEach(function(u){
  if(u.isHut){
    var hd = terrainH(u.x, u.z);
    if(hd < -1.5 && hd > -15){ chinampaHut(u.x, u.z, u.ry, u.bw, u.bl); chinPut(u.x,u.z, 9); return; }
  }
  if(chinampaBed(u.x, u.z, u.ry, u.bw, u.bl, u.marsh)) chinPut(u.x,u.z, 9);
});

window._chinampas = CHINN;
window._chinp = CHINP;
window._chinampaHutCount = CHINHUTS;
window._chinDebug = { pointInPoly:pointInPoly, chinBlocked:chinBlocked, ZONE:ZONE, TRAFFIC_LANE:TRAFFIC_LANE, CHIN_DELETE_ZONE:CHIN_DELETE_ZONE, CHIN_ZONE_A:CHIN_ZONE_A, CHIN_ZONE_C:CHIN_ZONE_C,
  depthMin:CHINP.depthMin, depthMax:CHINP.depthMax, shoreS:shoreS, shoreNorm:shoreNorm, shoreAt:shoreAt, shoreIn:shoreIn,
  CANTONS:CANTONS, SPANS:SPANS, CAUSEWAYS:CAUSEWAYS.map(function(cw){ return {s:cw.s, solid:cw.solid, n:cw.c?cw.c.n:null, x:cw.c?cw.c.x:null, z:cw.c?cw.c.z:null, r:cw.c?cw.c.r:null}; }),
  PIERS:PIERS, CPIERS: (typeof CPIERS!=='undefined'?CPIERS:[]), ISLES:ISLES, inRiver:inRiver, CHINP:CHINP };
