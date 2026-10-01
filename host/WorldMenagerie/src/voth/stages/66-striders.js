/* ==== SILT STRIDER CONVOYS (moving) ==== */
reseed(790001);

/* ==== WADING — the one tuning block ==== */
var STRIDER_WADE_DEPTH = 5.0;
var STRIDER_FOOT_DROP = 4.0, STRIDER_FOOT_RISE = 3.0;
var STRIDER_WADE_MAX = STRIDER_WADE_DEPTH + STRIDER_FOOT_DROP;   /* 9.0 */
var STRIDER_HILL_MAX = 95;     /* wading a river is in character, climbing a ridge is not */
var STRIDER_WADE_SPEED = 0.75; /* the update loop's own wading speed factor, below */
var STRIDER_CLEAR = 12;        /* hull half-width 6.7, planted feet 9.9 — the radius a solid obstacle has to be clear by */

var STRIDER_ROAD_TOLERANCE = 1.40;

/* ==== solid obstacles a strider may NOT walk through, whatever the depth. ==== */

var STRIDER_LINEAR_BB = (function(){
  var bb = { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity };
  function add(x,z,pad){
    if(x-pad < bb.x0) bb.x0 = x-pad;
    if(x+pad > bb.x1) bb.x1 = x+pad;
    if(z-pad < bb.z0) bb.z0 = z-pad;
    if(z+pad > bb.z1) bb.z1 = z+pad;
  }
  [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS].forEach(function(a){
    a.forEach(function(p){ var pad = p.w*0.5+STRIDER_CLEAR; add(p.x0,p.z0,pad); add(p.x1,p.z1,pad); });
  });
  BRIDGE_SUPPORTS.forEach(function(b){ add(b.x,b.z,b.r+STRIDER_CLEAR); });
  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined')
    LIFE_SHIP_STATIONARY_DOCKS.forEach(function(d){ add(d.x,d.z,26+STRIDER_CLEAR); });
  return bb;
})();
function striderSolidAt(x,z){
  if(gridHit(x,z,STRIDER_CLEAR)) return true;
  if(lifeNavCantonBlocked(x,z)) return true;
  if(chinHit(x,z,STRIDER_CLEAR)) return true;
  var bb = STRIDER_LINEAR_BB;
  if(x < bb.x0 || x > bb.x1 || z < bb.z0 || z > bb.z1) return false;
  var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS], ai, pi, a, p;
  for(ai=0; ai<arrs.length; ai++){
    a = arrs[ai];
    for(pi=0; pi<a.length; pi++){
      p = a[pi];
      if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5+STRIDER_CLEAR) return true;
    }
  }
  for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){
    var bs = BRIDGE_SUPPORTS[n2];
    if(Math.hypot(x-bs.x,z-bs.z) < bs.r+STRIDER_CLEAR) return true;
  }
  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
    for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
      var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
      if(Math.hypot(x-sd.x, z-sd.z) < 26+STRIDER_CLEAR) return true;
    }
  }
  return false;
}

function striderPushToWadeable(x,z){
  var h = terrainH(x,z);
  if(h >= -STRIDER_WADE_MAX) return [x,z];
  var best=[x,z], bestH=h;
  for(var r=20; r<=400; r*=1.6){
    for(var a=0;a<8;a++){
      var ang = a/8*Math.PI*2, px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);
      if(ph > bestH && ph <= STRIDER_HILL_MAX){ bestH = ph; best = [px,pz]; }
    }
    if(bestH >= -STRIDER_WADE_MAX) break;
  }
  return best;
}

function striderPushClear(x,z){
  for(var r=STRIDER_CLEAR*2; r<=500; r*=1.5){
    for(var a=0;a<12;a++){
      var ang = a/12*Math.PI*2, px = x+Math.cos(ang)*r, pz = z+Math.sin(ang)*r;
      var ph = terrainH(px,pz);

      if(ph >= -STRIDER_WADE_MAX && ph <= STRIDER_HILL_MAX && striderNavPassable(px,pz)) return [px,pz];
    }
  }
  return [x,z];
}

function striderOnDeck(x,z){ return lifeCausewayY(x,z) != null || lifeBridgeY(x,z) != null; }

/* ==== the strider's own nav grid + A* ==== */
var STRIDER_NAV_CELL = 26;      /* same as LIFE_NAV_CELL: about one canal width, and the strider needs a 24-wide gap anyway */
var STRIDER_NAV_MINX = -4000, STRIDER_NAV_MAXX = 4000;
var STRIDER_NAV_MINZ = -4000, STRIDER_NAV_MAXZ = 4000;   /* covers every stop and terminus of all three routes, with ~250 to spare */
var STRIDER_NAV_W = Math.ceil((STRIDER_NAV_MAXX-STRIDER_NAV_MINX)/STRIDER_NAV_CELL);
var STRIDER_NAV_H = Math.ceil((STRIDER_NAV_MAXZ-STRIDER_NAV_MINZ)/STRIDER_NAV_CELL);
function striderNavCellCenter(cx,cz){ return [STRIDER_NAV_MINX+(cx+0.5)*STRIDER_NAV_CELL, STRIDER_NAV_MINZ+(cz+0.5)*STRIDER_NAV_CELL]; }
function striderNavWorldToCell(x,z){ return [Math.floor((x-STRIDER_NAV_MINX)/STRIDER_NAV_CELL), Math.floor((z-STRIDER_NAV_MINZ)/STRIDER_NAV_CELL)]; }

function striderNavBlocked(x,z){
  var h = terrainH(x,z);
  if(h > STRIDER_HILL_MAX) return true;
  if(striderOnDeck(x,z)) return false;      /* a real deck is passable whatever is under it */
  if(h < -STRIDER_WADE_MAX) return true;    /* too deep to stand in — the ONLY water that blocks */
  return striderSolidAt(x,z);               /* gridHit, cantons, chinampas, piers, pylons, moored ships */
}

var STRIDER_NAV_GRID = null;
var STRIDER_NAV_BUILD_MS = 0;       /* obstacle grid, 0 until first use */
var STRIDER_NAV_ROAD_MS = 0;        /* road mask, paid at load */

var STRIDER_NAV_ROAD = new Uint8Array(STRIDER_NAV_W*STRIDER_NAV_H);
(function(){
  var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
  function paint(x,z){
    var c = striderNavWorldToCell(x,z);
    if(c[0]<0 || c[1]<0 || c[0]>=STRIDER_NAV_W || c[1]>=STRIDER_NAV_H) return;
    STRIDER_NAV_ROAD[c[1]*STRIDER_NAV_W+c[0]] = 1;
  }
  REDGE.forEach(function(e){
    var A = RNODE[e.a], B = RNODE[e.b];
    var L = Math.hypot(B.x-A.x, B.z-A.z), steps = Math.max(1, Math.ceil(L/(STRIDER_NAV_CELL*0.5)));
    for(var s=0; s<=steps; s++){ var t=s/steps; paint(A.x+(B.x-A.x)*t, A.z+(B.z-A.z)*t); }
  });
  STRIDER_NAV_ROAD_MS = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : 0) - t0;
})();
function striderOnRoad(x,z){
  var c = striderNavWorldToCell(x,z);
  if(c[0]<0 || c[1]<0 || c[0]>=STRIDER_NAV_W || c[1]>=STRIDER_NAV_H) return false;
  return !!STRIDER_NAV_ROAD[c[1]*STRIDER_NAV_W+c[0]];
}
/* passable = a real street, or ground that no obstacle rule objects to. */
function striderNavPassable(x,z){ return striderOnRoad(x,z) || !striderNavBlocked(x,z); }

function striderNavGrid(){
  if(STRIDER_NAV_GRID) return STRIDER_NAV_GRID;
  var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
  var g = new Uint8Array(STRIDER_NAV_W*STRIDER_NAV_H);
  var cx, cz, i, HC = STRIDER_NAV_CELL*0.5;
  for(cz=0; cz<STRIDER_NAV_H; cz++){
    for(cx=0; cx<STRIDER_NAV_W; cx++){
      var p = striderNavCellCenter(cx,cz);
      var blocked = striderNavBlocked(p[0],p[1]) ||
                    striderNavBlocked(p[0]+HC,p[1]) || striderNavBlocked(p[0]-HC,p[1]) ||
                    striderNavBlocked(p[0],p[1]+HC) || striderNavBlocked(p[0],p[1]-HC);
      g[cz*STRIDER_NAV_W+cx] = blocked ? 1 : 0;
    }
  }
  for(i=0;i<g.length;i++) if(STRIDER_NAV_ROAD[i]) g[i] = 0;
  STRIDER_NAV_BUILD_MS = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : 0) - t0;
  STRIDER_NAV_GRID = g;
  return g;
}

function striderNavNearestOpen(g, cx,cz){
  if(cx>=0 && cz>=0 && cx<STRIDER_NAV_W && cz<STRIDER_NAV_H && !g[cz*STRIDER_NAV_W+cx]) return [cx,cz];
  for(var r=1; r<12; r++){
    for(var dz=-r; dz<=r; dz++){
      for(var dx=-r; dx<=r; dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz)) !== r) continue;
        var ncx=cx+dx, ncz=cz+dz;
        if(ncx<0||ncz<0||ncx>=STRIDER_NAV_W||ncz>=STRIDER_NAV_H) continue;
        if(!g[ncz*STRIDER_NAV_W+ncx]) return [ncx,ncz];
      }
    }
  }
  return null;
}

function striderNavAStar(ax,az,bx,bz){
  var G = striderNavGrid();          /* builds the occupancy grid on first use */
  var W = STRIDER_NAV_W, H = STRIDER_NAV_H;
  var s0 = striderNavWorldToCell(ax,az), g0 = striderNavWorldToCell(bx,bz);
  s0 = [Math.max(0,Math.min(W-1,s0[0])), Math.max(0,Math.min(H-1,s0[1]))];
  g0 = [Math.max(0,Math.min(W-1,g0[0])), Math.max(0,Math.min(H-1,g0[1]))];
  var start = striderNavNearestOpen(G, s0[0],s0[1]), goal = striderNavNearestOpen(G, g0[0],g0[1]);
  if(!start || !goal) return null;
  var startI = start[1]*W+start[0], goalI = goal[1]*W+goal[0];
  if(startI === goalI) return [[ax,az],[bx,bz]];
  var n = W*H;
  var gScore = new Float32Array(n).fill(Infinity);
  var cameFrom = new Int32Array(n).fill(-1);
  var closed = new Uint8Array(n);
  gScore[startI] = 0;
  var heap = new LifeNavHeap();
  heap.push(startI, Math.hypot(goal[0]-start[0], goal[1]-start[1]));
  var iter = 0, iterCap = 90000;
  while(heap.a.length && iter++ < iterCap){
    var current = heap.pop()[0];
    if(closed[current]) continue;
    if(current === goalI) break;
    closed[current] = 1;
    var ccx = current % W, ccz = (current-ccx)/W;
    for(var ni=0; ni<8; ni++){
      var ncx = ccx+LIFE_NAV_NEI[ni][0], ncz = ccz+LIFE_NAV_NEI[ni][1];
      if(ncx<0||ncz<0||ncx>=W||ncz>=H) continue;
      var nIdx = ncz*W+ncx;
      if(closed[nIdx] || G[nIdx]) continue;
      var tentG = gScore[current] + LIFE_NAV_NEI[ni][2];
      if(tentG < gScore[nIdx]){
        cameFrom[nIdx] = current;
        gScore[nIdx] = tentG;
        heap.push(nIdx, tentG + Math.hypot(goal[0]-ncx, goal[1]-ncz));
      }
    }
  }
  if(cameFrom[goalI] === -1) return null;
  var path = [], cur = goalI;
  while(true){
    var cx = cur % W, cz = (cur-cx)/W;
    path.push(striderNavCellCenter(cx,cz));
    if(cur === startI) break;
    cur = cameFrom[cur];
    if(cur < 0) return null;
  }
  path.reverse();
  path.unshift([ax,az]);
  path.push([bx,bz]);
  return path;
}

function striderNavLOSClear(ax,az,bx,bz){
  var d = Math.hypot(bx-ax, bz-az);

  var steps = Math.max(1, Math.ceil(d/(STRIDER_NAV_CELL*0.25)));
  for(var i=0;i<=steps;i++){
    var t = i/steps;
    if(!striderNavPassable(ax+(bx-ax)*t, az+(bz-az)*t)) return false;
  }
  return true;
}

var STRIDER_NAV_DENSE = 60;
function striderNavSimplify(path){
  var MAXSKIP = 320;
  var out = [path[0]], i = 0;
  while(i < path.length-1){
    var farthest = i+1;
    for(var k=i+1; k<path.length; k++){
      if(Math.hypot(path[k][0]-path[i][0], path[k][1]-path[i][1]) > MAXSKIP) break;
      if(striderNavLOSClear(path[i][0],path[i][1], path[k][0],path[k][1])) farthest = k;
    }
    out.push(path[farthest]);
    i = farthest;
  }

  var dense = [out[0]];
  for(var j=1; j<out.length; j++){
    var a = out[j-1], b = out[j];
    var L = Math.hypot(b[0]-a[0], b[1]-a[1]);
    var n = Math.floor(L/STRIDER_NAV_DENSE);
    for(var k=1; k<=n; k++){
      var t = k/(n+1);
      dense.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]);
    }
    dense.push(b);
  }
  return dense;
}

/* ==== routing. ==== */
function striderRefineRoad(waypoints){
  for(var round=0; round<16; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad=null, badFix=null, badSeg=0;
    for(var s=1; s<80; s++){
      var st = s/80, p = curve.getPointAt(st), h = terrainH(p.x,p.z);
      if(h > STRIDER_HILL_MAX){ bad=st; badFix=lifePushToLowGround(p.x,p.z,STRIDER_HILL_MAX); }
      if(bad!==null){ badSeg = Math.max(1, Math.min(waypoints.length-1, Math.round(st*(waypoints.length-1)))); break; }
    }
    if(bad===null) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

var STRIDER_ENDPOINT_FREE = 90;
var STRIDER_BAD_WHY = null;   /* why the last striderBadSample rejected — diagnostic only */
function striderBadSample(p, ax,az, bx,bz){
  var h = terrainH(p.x,p.z);
  if(Math.hypot(p.x-ax,p.z-az) < STRIDER_ENDPOINT_FREE) return null;
  if(Math.hypot(p.x-bx,p.z-bz) < STRIDER_ENDPOINT_FREE) return null;
  if(h > STRIDER_HILL_MAX){ STRIDER_BAD_WHY = ['hill',p.x|0,p.z|0,+h.toFixed(1)]; return lifePushToLowGround(p.x,p.z,STRIDER_HILL_MAX); }
  if(striderOnDeck(p.x,p.z)) return null;
  if(h < -STRIDER_WADE_MAX){ STRIDER_BAD_WHY = ['deep',p.x|0,p.z|0,+h.toFixed(1)]; return striderPushToWadeable(p.x,p.z); }

  if(striderOnRoad(p.x,p.z)) return null;
  if(gridHit(p.x,p.z,STRIDER_CLEAR)){ STRIDER_BAD_WHY = ['built',p.x|0,p.z|0,0]; return striderPushClear(p.x,p.z); }
  if(striderSolidAt(p.x,p.z)){ STRIDER_BAD_WHY = ['solid',p.x|0,p.z|0,0]; return striderPushClear(p.x,p.z); }
  return null;
}

function striderInsertAt(waypoints, px, pz){
  var best = 1, bestD = Infinity;
  for(var i=0; i<waypoints.length-1; i++){
    var d = lifeSegDist(px,pz, waypoints[i][0],waypoints[i][1], waypoints[i+1][0],waypoints[i+1][1]);
    if(d < bestD){ bestD = d; best = i+1; }
  }
  return Math.max(1, Math.min(waypoints.length-1, best));
}
function striderRefine(waypoints, ax,az,bx,bz){
  var legLen = Math.hypot(bx-ax, bz-az);
  var SAMPLES = Math.max(80, Math.min(260, Math.round(legLen/28)));
  var ROUNDS  = Math.max(16, Math.min(34, Math.round(legLen/220)));
  for(var round=0; round<ROUNDS; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad=null, badFix=null, badSeg=0, lastBadX=0, lastBadZ=0;
    for(var s=1; s<SAMPLES; s++){
      var st = s/SAMPLES, p = curve.getPointAt(st);
      badFix = striderBadSample(p, ax,az, bx,bz);
      if(badFix){ bad=st; lastBadX=p.x; lastBadZ=p.z; badSeg = striderInsertAt(waypoints, p.x, p.z); break; }
    }
    if(bad===null) break;

    if(Math.hypot(badFix[0]-lastBadX, badFix[1]-lastBadZ) < 0.5) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

function striderRefineDirect(ax,az,bx,bz){
  return striderRefine([[ax,az],[bx,bz]], ax,az,bx,bz);
}

function striderRefineNav(ax,az,bx,bz){
  var path = striderNavAStar(ax,az,bx,bz);
  if(!path || path.length < 2) return null;
  return striderRefine(striderNavSimplify(path), ax,az,bx,bz);
}

function striderLegValid(curve, ax,az, bx,bz){
  STRIDER_BAD_WHY = null;
  for(var i=0;i<=160;i++){
    if(striderBadSample(curve.getPointAt(i/160), ax,az, bx,bz)) return false;
  }
  STRIDER_BAD_WHY = null;
  return true;
}

function striderLegProfile(curve){
  var len = curve.getLength(), slow = 0, ford = 0, N = 80;
  for(var i=0;i<=N;i++){
    var p = curve.getPointAt(i/N), h = terrainH(p.x,p.z);
    if(h < 2 && !striderOnDeck(p.x,p.z)){ slow++; if(h < SEA) ford++; }
  }
  return { len: len, slowFrac: slow/(N+1), fordFrac: ford/(N+1),
           cost: len * (1 + (slow/(N+1))*(1/STRIDER_WADE_SPEED - 1)) };
}

var STRIDER_MIN_FORD = 2/81;

function striderChoose(hasRoad, roadProf, directOK, directProf, navOK, navProf){
  var fordProf = null, fordFrom = null;
  if(directOK){ fordProf = directProf; fordFrom = 'straight'; }
  if(navOK && (!fordProf || navProf.cost < fordProf.cost)){ fordProf = navProf; fordFrom = 'astar'; }
  var roadCost = hasRoad ? roadProf.cost : Infinity;
  var why;
  if(!fordProf) why = 'road-only-valid';
  else if(fordProf.fordFrac < STRIDER_MIN_FORD) why = 'road-no-ford-to-gain';
  else if(roadCost > fordProf.cost*STRIDER_ROAD_TOLERANCE) why = 'ford-' + fordFrom;
  else why = 'road-within-tolerance';
  var useFord = (why.indexOf('ford-') === 0) || !hasRoad;
  if(!hasRoad && why.indexOf('ford-') !== 0) why = 'no-road-path';
  return { why: why, fordFrom: useFord ? fordFrom : null, useFord: useFord };
}
var STRIDER_LEG_CHOICE = [];

function striderBuildLeg(ax,az,bx,bz){
  var path = lifeRoadPath(ax,az,bx,bz);
  var roadCurve = null, roadProf = null;
  if(path){
    var waypoints = [[ax,az]];
    path.forEach(function(ni){ var n=RNODE[ni]; waypoints.push([n.x,n.z]); });
    waypoints.push([bx,bz]);
    roadCurve = striderRefineRoad(waypoints);
    roadProf = striderLegProfile(roadCurve);
  }
  var directCurve = striderRefineDirect(ax,az,bx,bz);
  var directOK = striderLegValid(directCurve, ax,az, bx,bz);
  var directBad = directOK ? null : STRIDER_BAD_WHY;
  var directProf = striderLegProfile(directCurve);

  var d = striderChoose(!!roadCurve, roadProf, directOK, directProf, false, null);
  var chosen = d.useFord ? directCurve : roadCurve;
  STRIDER_LEG_CHOICE.push({ why: d.why, fordFrom: d.fordFrom,
    ax: ax, az: az, bx: bx, bz: bz,       /* so the A* candidate can be rebuilt on demand */
    roadCost: roadProf ? +roadProf.cost.toFixed(1) : null,
    directCost: +directProf.cost.toFixed(1),
    directFord: +directProf.fordFrac.toFixed(3),
    roadFord: roadProf ? +roadProf.fordFrac.toFixed(3) : null,
    directValid: directOK, directBlocked: directBad,
    roadArc: roadCurve ? +roadCurve.getLength().toFixed(1) : null,
    directArc: +directProf.len.toFixed(1),
    roadProf: roadProf, directProf: directProf, directCurve: directCurve,

    roadCurve: roadCurve });
  return chosen;
}

/* ==== generic stop-list / leg-list builders, shared by every route: a ==== */
function striderBuildStops(terminusA, terminusB, stations){
  var stops = [{ x:terminusA.x, z:terminusA.z }];
  stations.forEach(function(s){ stops.push({ x:s.x, z:s.z, ry:s.ry, door:s }); });
  stops.push({ x:terminusB.x, z:terminusB.z });
  return stops;
}
function striderBuildLegs(stops){
  var legs = [];
  for(var i=0;i<stops.length-1;i++){
    var A = stops[i], B = stops[i+1];
    legs.push(striderBuildLeg(A.x,A.z,B.x,B.z));
  }
  return legs;
}

/* ==== Route 1's stop list: [terminus, 6 stations, terminus] ==== */
var STRIDER_R1_TERMINI = [

  { x:-3629, z:1584 },

  { x:3712.3, z:2199.0 }
];
var STRIDER_R1_STOPS = striderBuildStops(STRIDER_R1_TERMINI[0], STRIDER_R1_TERMINI[1], STRIDER_R1_STATIONS);
var STRIDER_R1_LEGS = striderBuildLegs(STRIDER_R1_STOPS);

/* ==== Route 2's stop list: [terminus, 5 stations, terminus] ==== */
var STRIDER_R2_TERMINI = [

  { x:3486.6, z:-1096.9 },

  { x:-3754.8, z:-2660.3 }
];
var STRIDER_R2_STOPS = striderBuildStops(STRIDER_R2_TERMINI[0], STRIDER_R2_TERMINI[1], STRIDER_R2_STATIONS);
var STRIDER_R2_LEGS = striderBuildLegs(STRIDER_R2_STOPS);

/* ==== Route 3's stop list: [terminus, 9 stations, terminus] ==== */
var STRIDER_R3_TERMINI = [

  { x:2046.6, z:-3707.8 },

  { x:94.5, z:3673.2 }
];
var STRIDER_R3_STOPS = striderBuildStops(STRIDER_R3_TERMINI[0], STRIDER_R3_TERMINI[1], STRIDER_R3_STATIONS);
var STRIDER_R3_LEGS = striderBuildLegs(STRIDER_R3_STOPS);

var STRIDER_ROUTES = [
  { stops: STRIDER_R1_STOPS, legs: STRIDER_R1_LEGS, n: 6 },
  { stops: STRIDER_R2_STOPS, legs: STRIDER_R2_LEGS, n: 6 },
  { stops: STRIDER_R3_STOPS, legs: STRIDER_R3_LEGS, n: 8 }
];

/* ==== convoys: each route runs its own fixed pool (STRIDER_ROUTES[i].n), ==== */
var LIFE_STRIDER_CARS_PER_CONVOY = 3;

function striderRollCars(){
  var n = chance(0.66) ? 1 : 2;
  var cars;
  if(n === 1){
    cars = [ { variant: pick(['pax','cargo']) } ];
  }else{
    cars = [ { variant:'pax' }, { variant:'cargo' } ];
    for(var i=2;i<n;i++) cars.push({ variant: pick(['pax','cargo']) });
  }

  cars.forEach(function(c){ c.onboard = 0; c.gait = rnd()*Math.PI*2; });
  return cars;
}

function striderSpawnConvoy(route, slotGlobal, dir, startT){
  var stops = route.stops, legs = route.legs;
  var idx = (dir===1) ? 0 : (stops.length-1);
  var legIdx = (dir===1) ? 0 : (stops.length-2);
  var cv = {
    route: route, slot: slotGlobal, dir: dir, idx: idx, legIdx: legIdx, curveDir: dir,
    curveT: (startT!==undefined ? startT : 0), state:'transit', stateT:0,
    dwell: 0, speed: rr(24,32), laneOffset: rr(-2.6,2.6),   /* "slightly faster" than caravans' rr(20,28) */
    cars: striderRollCars()
  };
  cv.curve = legs[legIdx];
  cv.legLen = cv.curve.getLength();
  return cv;
}
var LIFE_STRIDERS = [];
(function(){
  var slotGlobal = 0;
  STRIDER_ROUTES.forEach(function(route){
    for(var i=0;i<route.n;i++){
      var dir = (i < route.n/2) ? 1 : -1;
      var cv = striderSpawnConvoy(route, slotGlobal, dir, 0);
      cv.curveT = rr(0,1);   /* stagger initial population along its own leg — same load-time head start every other population gets */
      LIFE_STRIDERS.push(cv);
      slotGlobal++;
    }
  });
})();
window._striders = { count: LIFE_STRIDERS.length,
  routes: STRIDER_ROUTES.map(function(r){ return { n:r.n, stops:r.stops.length, legs:r.legs.length }; }),
  stations: LIFE_STRIDER_STATIONS.map(function(s){ return {x:s.x,z:s.z}; }) };

/* ==== THE BESPOKE SILT STRIDER MODEL ==== */

/* ==== dimensions (world units; a citizen is 2.94 tall, a station shelter ==== */
var STRIDER_HIP_Y   = 12.6;                 /* hip sockets above the foot plane */
var STRIDER_HIP_X   = 4.7;                  /* hips, half-width                 */
var STRIDER_HIP_Z   = [6.0, 0.4, -5.6];     /* three pairs, front to back       */
var STRIDER_FOOT_X  = 9.9;                  /* planted feet splay wider than the hips */
var STRIDER_LEGS    = STRIDER_HIP_Z.length*2;   /* 6 */
var STRIDER_LEG_SEGS = 2;                   /* femur + tibia, one bent knee     */
var STRIDER_BARS_PER_BODY = STRIDER_LEGS*STRIDER_LEG_SEGS;   /* 12 */

var STRIDER_CHIT      = 0xd2b888;   /* carapace: warm bone                    */
var STRIDER_CHIT_MID  = 0xae9068;   /* thorax barrel, a shade under the shell */
var STRIDER_CHIT_DARK = 0x866848;   /* belly, hips, alternating snout rings   */
var STRIDER_CHIT_LITE = 0xf0dcb4;   /* ribs, crest, spikes — the highlights   */
var STRIDER_SHELL_IN  = 0x4a3a2c;   /* the shell hollow's own shadowed lining */
var STRIDER_WOOD      = 0xae7e52;
var STRIDER_WOOD_DARK = 0x785232;
var STRIDER_CANVAS    = 0xffffff;   /* pure white == carries the instance tint unmodified */
var STRIDER_EYE       = 0x2a2118;

var striderParts = [];
function striderPart(geo, col){ striderParts.push({ geo: geo, color: col }); }

/* --- thorax: a segmented tube lying along the travel axis --------------- */
striderPart(new THREE.CylinderGeometry(4.4,5.0,17,8).rotateX(Math.PI/2).translate(0,14.2,-3.0), STRIDER_CHIT_MID);
striderPart(new THREE.CylinderGeometry(3.3,3.7,15,8).rotateX(Math.PI/2).translate(0,11.7,-3.0), STRIDER_CHIT_DARK);   /* keeled underbelly */

[[5.2,4.6],[1.6,5.3],[-2.2,5.6],[-6.2,5.3],[-9.8,4.4]].forEach(function(r){
  striderPart(new THREE.CylinderGeometry(r[1],r[1],1.1,10).rotateX(Math.PI/2).translate(0,14.2,r[0]), STRIDER_CHIT_LITE);
});
/* abdomen, tapering to a point behind */
striderPart(new THREE.ConeGeometry(4.3,6.5,8).rotateX(-Math.PI/2).translate(0,14.0,-14.6), STRIDER_CHIT_MID);

/* --- the tall arched carapace ------------------------------------------ */
striderPart(new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI*0.5)
              .scale(5.9,9.4,8.6).translate(0,14.6,0.2), STRIDER_CHIT);
striderPart(new THREE.BoxGeometry(1.1,2.0,13.5).translate(0,23.6,0.2), STRIDER_CHIT_LITE);   /* crest spine */
[3.8,0.6,-2.6,-5.6].forEach(function(z){
  striderPart(new THREE.ConeGeometry(0.85,2.4,6).translate(0,25.4,z), STRIDER_CHIT_LITE);    /* ridge spikes */
});

[1,-1].forEach(function(s){
  striderPart(new THREE.BoxGeometry(0.7,4.0,6.4).translate(s*5.35,15.6,-0.6), STRIDER_SHELL_IN);
  striderPart(new THREE.BoxGeometry(1.0,0.7,7.2).translate(s*5.1,17.8,-0.6), STRIDER_CHIT_LITE);   /* its lintel */
});

/* --- head and the long segmented snout/proboscis ------------------------ */
striderPart(new THREE.SphereGeometry(1,10,6).scale(3.4,3.2,3.6).translate(0,14.6,7.8), STRIDER_CHIT);
[1,-1].forEach(function(s){
  striderPart(new THREE.SphereGeometry(1,6,4).scale(0.95,0.95,0.95).translate(s*2.2,16.3,9.4), STRIDER_EYE);
  /* antenna, sweeping up and forward */
  striderPart(new THREE.CylinderGeometry(0.11,0.30,6.4,5).rotateX(Math.PI/2-0.55).rotateY(s*0.22)
                .translate(s*1.9,17.4,11.4), STRIDER_CHIT_DARK);
});

(function(){

  var z0 = 10.9, y0 = 13.9, dz = 3.3, dy = -1.07;   /* per step along the snout */
  var r  = [2.35, 1.92, 1.50, 1.02, 0.38];          /* radius at each joint     */
  for(var i=0;i<4;i++){
    var tilt = Math.atan2(-dy, dz);                 /* nose-down pitch of this segment */
    var cz = z0 + dz*(i+0.5), cy = y0 + dy*(i+0.5);
    var len = Math.hypot(dz,dy)*1.02;
    striderPart(new THREE.CylinderGeometry(r[i+1],r[i],len,8).rotateX(Math.PI/2+tilt).translate(0,cy,cz),
                (i%2) ? STRIDER_CHIT_MID : STRIDER_CHIT_DARK);
    if(i<3){
      var jz = z0 + dz*(i+1), jy = y0 + dy*(i+1);
      striderPart(new THREE.CylinderGeometry(r[i+1]*1.16,r[i+1]*1.16,0.9,8).rotateX(Math.PI/2+tilt).translate(0,jy,jz),
                  STRIDER_CHIT_LITE);
    }
  }
})();

STRIDER_HIP_Z.forEach(function(hz){
  [1,-1].forEach(function(s){
    striderPart(new THREE.SphereGeometry(1,7,5).scale(1.55,1.55,1.55).translate(s*STRIDER_HIP_X,STRIDER_HIP_Y,hz), STRIDER_CHIT_DARK);
  });
});

/* --- the howdah: passenger pod slung over the rear of the shell --------- */
var STRIDER_HOWDAH_Z = -7.8, STRIDER_HOWDAH_FLOOR = 20.2;
striderPart(new THREE.BoxGeometry(8.4,0.9,8.8).translate(0,STRIDER_HOWDAH_FLOOR-0.45,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);

striderPart(new THREE.BoxGeometry(6.6,3.8,7.0).translate(0,18.5,STRIDER_HOWDAH_Z), STRIDER_WOOD_DARK);
[3.2,-3.2].forEach(function(sx){   /* lashing straps over the shell */
  striderPart(new THREE.BoxGeometry(0.6,3.0,1.0).translate(sx,18.9,STRIDER_HOWDAH_Z+2.6), STRIDER_WOOD);
});
[[3.6,3.8],[3.6,-3.8],[-3.6,3.8],[-3.6,-3.8]].forEach(function(p){
  striderPart(new THREE.CylinderGeometry(0.34,0.34,4.4,6).translate(p[0],STRIDER_HOWDAH_FLOOR+2.2,STRIDER_HOWDAH_Z+p[1]), STRIDER_WOOD);
});
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z+4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(8.4,0.55,0.45).translate(0,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z-4.0), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.BoxGeometry(0.45,0.55,8.8).translate(-3.8,STRIDER_HOWDAH_FLOOR+1.5,STRIDER_HOWDAH_Z), STRIDER_CANVAS);

striderPart(new THREE.ConeGeometry(6.8,3.2,6).translate(0,STRIDER_HOWDAH_FLOOR+5.0,STRIDER_HOWDAH_Z), STRIDER_CANVAS);
striderPart(new THREE.CylinderGeometry(0.22,0.22,1.2,6).translate(0,STRIDER_HOWDAH_FLOOR+7.1,STRIDER_HOWDAH_Z), STRIDER_WOOD);

/* --- the handler, on a small deck at the base of the neck --------------- */
striderPart(new THREE.BoxGeometry(3.6,0.6,3.2).translate(0,20.4,7.2), STRIDER_WOOD_DARK);
striderPart(new THREE.CylinderGeometry(0.34,0.42,1.5,6).translate(0,21.5,7.2), 0x2b4a7a);
striderPart(new THREE.BoxGeometry(0.58,0.58,0.58).translate(0,22.5,7.2), LIFE_SKIN);
striderPart(new THREE.CylinderGeometry(0.72,0.72,0.14,8).translate(0,22.9,7.2), 0x1f3a63);

var striderBodyGeo = lifeMergeGeoms(striderParts);
var striderMesh = new THREE.InstancedMesh(striderBodyGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_STRIDER_CAR_SLOTS);
striderMesh.userData.life = true; striderMesh.userData.inspectLabel = 'Silt strider';
striderMesh.frustumCulled = false;
scene.add(striderMesh);

var striderLegGeo = new THREE.CylinderGeometry(0.42,0.62,1,6).translate(0,0.5,0);
var striderLegMesh = new THREE.InstancedMesh(striderLegGeo,
  new THREE.MeshLambertMaterial({ color: 0x4a3a28 }), LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY);
striderLegMesh.userData.life = true; striderLegMesh.userData.inspectLabel = 'Silt strider leg';
striderLegMesh.frustumCulled = false;
scene.add(striderLegMesh);

window._striderModel = {
  drawCalls: 2,
  bodySlots: LIFE_STRIDER_CAR_SLOTS,
  bodyPartCount: striderParts.length,
  bodyTrisEach: striderBodyGeo.attributes.position.count/3,
  legBars: LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY,
  legTrisEach: striderLegGeo.index ? striderLegGeo.index.count/3 : striderLegGeo.attributes.position.count/3,
  instances: LIFE_STRIDER_CAR_SLOTS*(1+STRIDER_BARS_PER_BODY),
  height: 24.9, length: 40.7, hipY: STRIDER_HIP_Y, legs: STRIDER_LEGS
};
window._striderModel.triangles =
  window._striderModel.bodySlots*window._striderModel.bodyTrisEach +
  window._striderModel.legBars*window._striderModel.legTrisEach;

window._striders.waterCrossings = function(samples){
  samples = samples || 200;
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = leg.getPointAt(t);
        if(terrainH(p.x,p.z) < 2) out.push({ route:ri, leg:li, t:t, x:p.x, z:p.z });
      }
    });
  });
  return out;
};

function striderSampleLeg(curve, straight, samples){
  var water=0, swim=0, ford=0, deepestWade=99, deepestAny=99;
  for(var i=0;i<=samples;i++){
    var p = curve.getPointAt(i/samples), h = terrainH(p.x,p.z);
    if(h < 2){
      water++;
      if(h < deepestAny) deepestAny = h;
      if(!striderOnDeck(p.x,p.z)){
        swim++;
        if(h < SEA) ford++;
        if(h < deepestWade) deepestWade = h;
      }
    }
  }
  var arc = curve.getLength();
  return { arc:+arc.toFixed(1), ratio:+(arc/straight).toFixed(3),
           water:water, swim:swim, ford:ford,
           deepestWade: swim? +deepestWade.toFixed(2) : null,
           deepestAny: water? +deepestAny.toFixed(2) : null };
}

function striderNavCandidate(ch){
  if(ch.navDone) return ch;
  ch.navDone = true;
  var navCurve = striderRefineNav(ch.ax, ch.az, ch.bx, ch.bz);
  var navOK = !!navCurve && striderLegValid(navCurve, ch.ax,ch.az, ch.bx,ch.bz);
  ch.navCurve = navCurve;
  ch.navValid = navOK;
  ch.navBlocked = navCurve ? (navOK ? null : STRIDER_BAD_WHY) : ['no-nav-path',0,0,0];
  ch.navProf = navCurve ? striderLegProfile(navCurve) : null;
  ch.navArc = ch.navProf ? +ch.navProf.len.toFixed(1) : null;
  ch.navCost = ch.navProf ? +ch.navProf.cost.toFixed(1) : null;
  ch.navFord = ch.navProf ? +ch.navProf.fordFrac.toFixed(3) : null;
  return ch;
}

window._striders.legStats = function(samples, opt){
  samples = samples || 200;
  var wantNav = !(opt && opt.nav === false);
  var out = [];
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      var ch = STRIDER_LEG_CHOICE[out.length] || {};
      if(wantNav && ch.ax !== undefined) striderNavCandidate(ch);
      var rec = striderSampleLeg(leg, straight, samples);
      rec.route = ri; rec.leg = li; rec.straight = +straight.toFixed(1);
      rec.samples = samples+1;
      rec.why = ch.why; rec.fordFrom = ch.fordFrom;
      rec.directValid = ch.directValid; rec.directBlocked = ch.directBlocked;
      rec.navValid = ch.navValid; rec.navBlocked = ch.navBlocked;
      rec.roadCost = ch.roadCost; rec.directCost = ch.directCost;
      rec.navCost = ch.navCost; rec.navArc = ch.navArc;
      rec.navFord = ch.navFord; rec.directFord = ch.directFord; rec.roadFord = ch.roadFord;

      rec.before = ch.roadCurve ? striderSampleLeg(ch.roadCurve, straight, samples) : null;
      out.push(rec);
    });
  });
  return out;
};

window._striders.navAbTest = function(samples){
  samples = samples || 200;
  var out = [], allSame = true, gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var A = r.stops[li], B = r.stops[li+1];
      var straight = Math.hypot(B.x-A.x, B.z-A.z);
      striderNavCandidate(ch);
      var withoutNav = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, false, null);
      var withNav    = striderChoose(!!ch.roadCurve, ch.roadProf, ch.directValid, ch.directProf, ch.navValid, ch.navProf);
      function pick(d){
        if(!d.useFord) return { src:'road', curve: ch.roadCurve };
        if(d.fordFrom === 'astar') return { src:'astar', curve: ch.navCurve };
        return { src:'straight', curve: ch.directCurve };
      }
      var a = pick(withoutNav), b = pick(withNav);
      var sa = a.curve ? striderSampleLeg(a.curve, straight, samples) : null;
      var sb = b.curve ? striderSampleLeg(b.curve, straight, samples) : null;
      var same = a.src === b.src && !!sa && !!sb &&
                 Math.abs(sa.arc - sb.arc) < 0.05 && sa.swim === sb.swim && sa.ford === sb.ford;
      if(!same) allSame = false;
      out.push({ leg:'R'+(ri+1)+'/L'+li, identical: same,
                 shipped: { src:a.src, why:withoutNav.why, arc:sa && sa.arc, swim:sa && sa.swim, ford:sa && sa.ford },
                 withAstar: { src:b.src, why:withNav.why, arc:sb && sb.arc, swim:sb && sb.swim, ford:sb && sb.ford },
                 navValid: ch.navValid, navArc: ch.navArc, navFord: ch.navFord, navBlocked: ch.navBlocked });
    });
  });
  return { allIdentical: allSame, legs: out.length,
           differing: out.filter(function(o){ return !o.identical; }).length, perLeg: out };
};

window._striders.clipAudit = function(samples, useRoad){
  samples = samples || 400;
  var out = [];
  function check(x,z,route,leg,t){
    if(gridHit(x,z,0)) out.push({ kind:'built', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else if(chinHit(x,z,0)) out.push({ kind:'chinampa', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    else{
      var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS], names = ['pier','cpier','rpier','ferry-pier'];
      for(var ai=0; ai<arrs.length; ai++){
        for(var pi=0; pi<arrs[ai].length; pi++){
          var p = arrs[ai][pi];
          if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5){
            out.push({ kind:names[ai], route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return;
          }
        }
      }
      for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){
        var bs = BRIDGE_SUPPORTS[n2];
        if(Math.hypot(x-bs.x,z-bs.z) < bs.r){ out.push({ kind:'pylon', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
      }
      if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
        for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
          var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
          if(Math.hypot(x-sd.x, z-sd.z) < 26){ out.push({ kind:'moored-ship', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 }); return; }
        }
      }
      if(!striderOnDeck(x,z) && lifeNavCantonBlocked(x,z)) out.push({ kind:'canton', route:route, leg:leg, t:+t.toFixed(3), x:x|0, z:z|0 });
    }
  }

  var gi = 0;
  STRIDER_ROUTES.forEach(function(r, ri){
    r.legs.forEach(function(leg, li){
      var ch = STRIDER_LEG_CHOICE[gi++];
      var use = (useRoad && ch && ch.roadCurve) ? ch.roadCurve : leg;
      for(var i=0;i<=samples;i++){
        var t = i/samples, p = use.getPointAt(t);
        check(p.x, p.z, ri, li, t);
      }
    });
  });
  return out;
};

window._striders.probePoint = function(x,z){
  return { terrainH:+terrainH(x,z).toFixed(2), onDeck:striderOnDeck(x,z), onRoad:striderOnRoad(x,z),
           navBlocked:striderNavBlocked(x,z), navPassable:striderNavPassable(x,z),
           gridHit:gridHit(x,z,STRIDER_CLEAR), gridHitRaw:gridHit(x,z,0),
           chin:chinHit(x,z,STRIDER_CLEAR), chinRaw:chinHit(x,z,0),
           canton:lifeNavCantonBlocked(x,z), solid:striderSolidAt(x,z),
           pushClear:striderPushClear(x,z) };
};

window._striders.nav = function(opt){
  var base = { w:STRIDER_NAV_W, h:STRIDER_NAV_H, cell:STRIDER_NAV_CELL,
               cells:STRIDER_NAV_W*STRIDER_NAV_H, lazy:true,
               grid: STRIDER_NAV_GRID ? 'built' : 'not built yet',
               roadMs:+STRIDER_NAV_ROAD_MS.toFixed(1),
               buildMs:+STRIDER_NAV_BUILD_MS.toFixed(1) };
  if(opt && opt.built === false) return base;
  var g = striderNavGrid(), open=0, road=0;
  for(var i=0;i<g.length;i++){ if(!g[i]) open++; if(STRIDER_NAV_ROAD[i]) road++; }
  base.grid = 'built'; base.open = open; base.roadCells = road;
  base.buildMs = +STRIDER_NAV_BUILD_MS.toFixed(1);
  return base;
};
window._striders.navPath = function(ax,az,bx,bz){
  var p = striderNavAStar(ax,az,bx,bz);
  return p ? { raw:p.length, simplified:striderNavSimplify(p) } : null;
};
window._striders.live = function(){
  var out = [];
  LIFE_STRIDERS.forEach(function(cv){
    cv.cars.forEach(function(car, k){
      if(car.wx === undefined) return;
      out.push({ slot: cv.slot*LIFE_STRIDER_CARS_PER_CONVOY+k, car: k, variant: car.variant,
                 state: cv.state, onboard: car.onboard||0,
                 x: car.wx, y: car.wy, z: car.wz, yaw: car.wyaw,
                 h: terrainH(car.wx, car.wz) });
    });
  });
  return out;
};

/* ==== gait ==== */
var STRIDER_STRIDE = 7.5, STRIDER_LIFT = 3.0;
var STRIDER_GAIT_PAIR = Math.PI*2/3;
var STRIDER_KNEE_OUT = 3.6, STRIDER_KNEE_UP = 3.9;
var STRIDER_FEMUR_W = 1.15, STRIDER_TIBIA_W = 0.78;
var STRIDER_BOB = 0.38, STRIDER_ROLL = 0.030;

var STRIDER_GROUND_EPS = 0.15;   /* the same epsilon every citizen stands on */

var STRIDER_LANTERN_Y = STRIDER_HOWDAH_FLOOR + 2.8;   /* on the howdah's front rail */
var STRIDER_SEAT_Y = STRIDER_HOWDAH_FLOOR + 1.5;      /* person geometry is centred, not footed */

/* ==== rendering scratch ==== */
var lifeStriderLeadPos = new THREE.Vector3();
var lifeStriderCarPos = new THREE.Vector3();
var lifeStriderCarDir = new THREE.Vector3();
var lifeStriderTmpDir = new THREE.Vector3();
var lifeStriderTmpPos = new THREE.Vector3();
var lifeStriderTmpQuat = new THREE.Quaternion();
var lifeStriderRollQuat = new THREE.Quaternion();
var lifeStriderFwd = new THREE.Vector3(0,0,1);
var lifeStriderTmpMat = new THREE.Matrix4();
var lifeStriderScale1 = new THREE.Vector3(1,1,1);
var lifeStriderScaleZero = new THREE.Vector3(0,0,0);
var striderLegP = new THREE.Vector3(), striderLegDir = new THREE.Vector3();
var striderLegQ = new THREE.Quaternion(), striderLegS = new THREE.Vector3();
var striderLegM = new THREE.Matrix4();

function striderTint(hex, toWhite){
  var c = new THREE.Color(hex);
  c.r += (1-c.r)*toWhite; c.g += (1-c.g)*toWhite; c.b += (1-c.b)*toWhite;
  return c;
}
var lifeStriderPaxColor = striderTint(JADEC[2], 0.30);
var lifeStriderCargoColor = striderTint(GREYC[1], 0.30);
var LIFE_STRIDER_CAR_GAP = 50.0;   /* arc-length spacing between creatures in a convoy — the model is 40.7 long nose to tail after the snout trim, so this is a real gap, not an overlap */

(function(){
  var k, white = new THREE.Color(0xffffff);
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS;k++){
    striderMesh.setColorAt(k, white);
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_CAR_SLOTS*STRIDER_BARS_PER_BODY;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(k, lifeStriderTmpMat);
  }
  for(k=0;k<LIFE_STRIDER_RIDER_SLOTS;k++){
    lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
    lifePedMesh.setMatrixAt(LIFE_STRIDER_RIDER_BASE+k, lifeStriderTmpMat);
  }
  striderMesh.instanceColor.needsUpdate = true;
  striderMesh.instanceMatrix.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
})();

/* place one leg segment: a unit bar stood from a to b. */
function striderBar(idx, ax,ay,az, bx,by,bz, w){
  var dx=bx-ax, dy=by-ay, dz=bz-az;
  var len = Math.sqrt(dx*dx+dy*dy+dz*dz) || 0.001;
  striderLegDir.set(dx/len, dy/len, dz/len);
  striderLegQ.setFromUnitVectors(LIFE_UP, striderLegDir);
  striderLegP.set(ax,ay,az);
  striderLegS.set(w, len, w);
  striderLegM.compose(striderLegP, striderLegQ, striderLegS);
  striderLegMesh.setMatrixAt(idx, striderLegM);
}

function striderPlaceLegs(gIdx, cx, cy, cz, yaw, gait){
  var cs = Math.cos(yaw), sn = Math.sin(yaw);
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_LEGS;i++){
    var pair = i>>1, side = (i&1) ? -1 : 1;
    var hzl = STRIDER_HIP_Z[pair];
    /* local->world for a yaw-only frame: +z is forward, +x is to the right */
    var hx = cx + side*STRIDER_HIP_X*cs + hzl*sn;
    var hz = cz - side*STRIDER_HIP_X*sn + hzl*cs;
    var hy = cy + STRIDER_HIP_Y;
    var ph = gait + pair*STRIDER_GAIT_PAIR + (side<0 ? Math.PI : 0);
    var fzl = hzl + Math.cos(ph)*STRIDER_STRIDE;
    var fxl = side*STRIDER_FOOT_X;
    var fx = cx + fxl*cs + fzl*sn;
    var fz = cz - fxl*sn + fzl*cs;
    var fg = lifeGroundY(fx,fz);
    if(fg < cy-STRIDER_FOOT_DROP) fg = cy-STRIDER_FOOT_DROP;
    if(fg > cy+STRIDER_FOOT_RISE) fg = cy+STRIDER_FOOT_RISE;
    var fy = fg + Math.max(0, Math.sin(ph))*STRIDER_LIFT;

    var kx = (hx+fx)*0.5 + cs*side*STRIDER_KNEE_OUT;
    var ky = (hy+fy)*0.5 + STRIDER_KNEE_UP;
    var kz = (hz+fz)*0.5 - sn*side*STRIDER_KNEE_OUT;
    striderBar(base+i*2,   hx,hy,hz, kx,ky,kz, STRIDER_FEMUR_W);
    striderBar(base+i*2+1, kx,ky,kz, fx,fy,fz, STRIDER_TIBIA_W);
  }
}
function striderHideLegs(gIdx){
  var base = gIdx*STRIDER_BARS_PER_BODY;
  for(var i=0;i<STRIDER_BARS_PER_BODY;i++){
    striderLegM.compose(striderLegP.set(0,0,0), striderLegQ.identity(), lifeStriderScaleZero);
    striderLegMesh.setMatrixAt(base+i, striderLegM);
  }
}

function striderBoard(car, stationDoor){
  car.onboard = car.onboard || 0;
  var alight = Math.min(car.onboard, ri(1,3));
  car.onboard -= alight;
  var reactivated = 0;
  for(var i=0; i<LIFE_PEDS.length && reactivated<alight; i++){
    var pp = LIFE_PEDS[i];
    if(!pp || pp.state !== 'boarded' || pp.ferryRef !== car) continue;
    var newDest = lifePedPickDestination(stationDoor.x, stationDoor.z, 'strider');
    if(newDest){
      newDest.active++;
      pp.curve = lifePedBuildLeg(stationDoor.x, stationDoor.z, newDest.x, newDest.z);
      pp.len = pp.curve.getLength(); pp.dur = Math.max(3, pp.len/pp.speed);
      pp.destDoor = newDest; pp.state = 'walk'; pp.stateT = 0; pp.ferryRef = null;
    }else{
      LIFE_PEDS[i] = lifePedSpawn();
    }
    reactivated++;
  }
  var room = Math.max(0, LIFE_STRIDER_RIDER_PER_CAR - car.onboard);
  var boarding = Math.min(3, stationDoor.queueCount||0, room);
  stationDoor.queueCount = (stationDoor.queueCount||0) - boarding;
  var boarded = 0;
  for(var j=0; j<LIFE_PEDS.length && boarded<boarding; j++){
    var pq = LIFE_PEDS[j];
    if(!pq || pq.state !== 'queued' || pq.destDoor !== stationDoor) continue;
    pq.state = 'boarded'; pq.ferryRef = car; boarded++;
  }
  car.onboard += boarded;
}

function updateStriders(dt){
  LIFE_STRIDERS.forEach(function(cv, ci){
    cv.stateT += dt;
    var pos, yaw, wasTransit = false, transitLeg = null, transitUc = 0, transitDir = 1;

    if(cv.state === 'docked'){
      var st = cv.route.stops[cv.idx];
      pos = st; yaw = st.ry || 0;
      if(cv.stateT >= cv.dwell){
        var nextIdx = cv.idx + cv.dir;
        cv.legIdx = Math.min(cv.idx, nextIdx);
        cv.curveDir = cv.dir;
        cv.curveT = 0;
        cv.curve = cv.route.legs[cv.legIdx];
        cv.legLen = cv.curve.getLength();
        cv.state = 'transit'; cv.stateT = 0;
      }
    }else{
      var leg = cv.curve;
      var u = (cv.curveDir>0) ? cv.curveT : (1-cv.curveT);
      var uc = Math.min(0.998, Math.max(0.002, u));
      leg.getPointAt(uc, lifeStriderLeadPos);
      leg.getTangentAt(uc, lifeStriderTmpDir);
      var h = terrainH(lifeStriderLeadPos.x, lifeStriderLeadPos.z);
      var factor = (h < 2) ? 0.75 : 1.0;   /* wade, at 75% speed, in water — everywhere else, full speed on the road */
      cv.curveT = Math.min(1, cv.curveT + (cv.speed*factor*dt)/cv.legLen);
      pos = lifeStriderLeadPos;
      var dirx = lifeStriderTmpDir.x*cv.curveDir, dirz = lifeStriderTmpDir.z*cv.curveDir;
      yaw = Math.atan2(dirx, dirz);

      pos.y = Math.max(LIFE_Y, lifeGroundY(pos.x,pos.z)+0.15);
      wasTransit = true; transitLeg = leg; transitUc = uc; transitDir = cv.curveDir;
      if(cv.curveT >= 1){
        var nextIdx2 = cv.idx + cv.dir;
        if(nextIdx2 <= 0 || nextIdx2 >= cv.route.stops.length-1){

          LIFE_STRIDERS[ci] = striderSpawnConvoy(cv.route, cv.slot, cv.dir, 0);
          return;
        }
        cv.idx = nextIdx2;
        cv.state = 'docked'; cv.stateT = 0; cv.dwell = rr(14,26);
        var stationDoor = cv.route.stops[cv.idx].door;
        if(stationDoor){
          cv.cars.forEach(function(car){ if(car.variant==='pax') striderBoard(car, stationDoor); });
        }
      }
    }

    var riderBase0 = LIFE_STRIDER_RIDER_BASE + cv.slot*LIFE_STRIDER_CARS_PER_CONVOY*LIFE_STRIDER_RIDER_PER_CAR;

    for(var k=0;k<LIFE_STRIDER_CARS_PER_CONVOY;k++){
      var car = cv.cars[k];
      var riderBase = riderBase0 + k*LIFE_STRIDER_RIDER_PER_CAR;
      var gIdx = cv.slot*LIFE_STRIDER_CARS_PER_CONVOY + k;   /* global creature slot, 0..LIFE_STRIDER_CAR_SLOTS-1 */
      if(!car){
        lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat.identity(), lifeStriderScaleZero);
        striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
        striderHideLegs(gIdx);
        for(var rs0=0; rs0<LIFE_STRIDER_RIDER_PER_CAR; rs0++) lifePedMesh.setMatrixAt(riderBase+rs0, lifeStriderTmpMat);
        if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, 0,0,0, false);
        continue;
      }

      var lag = k*LIFE_STRIDER_CAR_GAP;
      var carPos = pos, carYaw = yaw;
      if(wasTransit && k>0 && transitLeg){
        var uLag = Math.min(0.998, Math.max(0.002, transitUc - (transitDir>0 ? lag/cv.legLen : -lag/cv.legLen)));
        transitLeg.getPointAt(uLag, lifeStriderCarPos);
        transitLeg.getTangentAt(uLag, lifeStriderCarDir);
        var cdx = lifeStriderCarDir.x*transitDir, cdz = lifeStriderCarDir.z*transitDir;
        carYaw = Math.atan2(cdx, cdz);
        carPos = lifeStriderCarPos;
      }
      var cx, cz;
      if(wasTransit && k>0){
        cx = carPos.x + (-Math.cos(carYaw))*cv.laneOffset;
        cz = carPos.z + ( Math.sin(carYaw))*cv.laneOffset;
      }else{

        cx = pos.x - Math.sin(yaw)*lag + (-Math.cos(yaw))*cv.laneOffset;
        cz = pos.z - Math.cos(yaw)*lag + ( Math.sin(yaw))*cv.laneOffset;
      }

      var cy = Math.max(lifeGroundY(cx,cz) + STRIDER_GROUND_EPS, LIFE_Y - STRIDER_WADE_DEPTH);

      if(wasTransit) car.gait += dt * (Math.PI*cv.speed) / (2*STRIDER_STRIDE);
      var bob = wasTransit ? Math.sin(car.gait*2)*STRIDER_BOB : 0;
      var roll = wasTransit ? Math.sin(car.gait)*STRIDER_ROLL : 0;

      lifeStriderTmpPos.set(cx, cy + bob, cz);
      lifeStriderTmpQuat.setFromAxisAngle(LIFE_UP, carYaw);
      if(roll) lifeStriderTmpQuat.multiply(lifeStriderRollQuat.setFromAxisAngle(lifeStriderFwd, roll));
      lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
      striderMesh.setMatrixAt(gIdx, lifeStriderTmpMat);
      striderMesh.setColorAt(gIdx, car.variant==='pax' ? lifeStriderPaxColor : lifeStriderCargoColor);
      striderPlaceLegs(gIdx, cx, cy, cz, carYaw, car.gait);
      car.wx = cx; car.wy = cy; car.wz = cz; car.wyaw = carYaw;   /* diagnostic only — window._striders.live() */

      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_STRIDER_BASE + gIdx, cx, cy+STRIDER_LANTERN_Y, cz);

      if(car.variant === 'pax'){

        var onboard = Math.min(LIFE_STRIDER_RIDER_PER_CAR, car.onboard||0);
        var rcs = Math.cos(carYaw), rsn = Math.sin(carYaw);
        for(var s=0;s<LIFE_STRIDER_RIDER_PER_CAR;s++){
          if(s < onboard){
            var sxl = ((s&1) ? -1 : 1)*2.0;
            var szl = STRIDER_HOWDAH_Z + 3.0 - (s>>1)*2.1;
            lifeStriderTmpPos.set(cx + sxl*rcs + szl*rsn,
                                  cy + bob + STRIDER_SEAT_Y,
                                  cz - sxl*rsn + szl*rcs);
            lifeStriderTmpMat.compose(lifeStriderTmpPos, lifeStriderTmpQuat, lifeStriderScale1);
          }else{
            lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          }
          lifePedMesh.setMatrixAt(riderBase+s, lifeStriderTmpMat);
        }
      }else{
        for(var s2=0;s2<LIFE_STRIDER_RIDER_PER_CAR;s2++){
          lifeStriderTmpMat.compose(lifeStriderTmpPos.set(0,0,0), lifeStriderTmpQuat, lifeStriderScaleZero);
          lifePedMesh.setMatrixAt(riderBase+s2, lifeStriderTmpMat);
        }
      }
    }
  });
  striderMesh.instanceMatrix.needsUpdate = true;
  striderMesh.instanceColor.needsUpdate = true;
  striderLegMesh.instanceMatrix.needsUpdate = true;
  lifePedMesh.instanceMatrix.needsUpdate = true;
}
