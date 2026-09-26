/* ==== 21. LIFE LAYER ==== */
reseed(780001);

var LIFE_SKIN = 0x8c8394;
var LIFE_HAIR_DARK = 0x241f1c;
var LIFE_HAIR_WHITE = 0xe6ded0;

var LIFE_STILT  = (window._chinampaHuts || []).map(function(h){ return [h[0], h[1]]; });
var LIFE_SHRINE = ISLES.filter(function(i){ return i[4] === 'shrine'; }).map(function(i){ return [i[0], i[1]]; });
var LIFE_HUB    = ['Temple', 'Palace'].map(function(n){ return CIDX[n]; }).filter(Boolean);
var LIFE_MAJOR  = ['Port', 'Ancestry', 'Arena'].map(function(n){ return CIDX[n]; }).filter(Boolean);

var LIFE_TIERS = [
  { pool: 'point',  points: LIFE_STILT,  weight: 1 },
  { pool: 'point',  points: LIFE_SHRINE, weight: 2 },
  { pool: 'canton', cantons: LIFE_HUB,   weight: 4 },
  { pool: 'canton', cantons: LIFE_MAJOR, weight: 7 }
];
var LIFE_WSUM = LIFE_TIERS.reduce(function(s, t){ return s + t.weight; }, 0);

function lifeCantonApproach(c, fromX, fromZ){
  var dx = c.x - fromX, dz = c.z - fromZ, d = Math.hypot(dx, dz) || 1;
  var ang = Math.atan2(dz, dx);

  var capHw = c.r*1.45;
  var clearR = capHw / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 40;
  return [c.x - dx/d*clearR, c.z - dz/d*clearR];
}
function lifePickDestination(fromX, fromZ){
  var r = rnd()*LIFE_WSUM, acc = 0;
  for(var i=0; i<LIFE_TIERS.length; i++){
    acc += LIFE_TIERS[i].weight;
    if(r > acc) continue;
    var tier = LIFE_TIERS[i];
    if(tier.pool === 'point' && tier.points.length) return pick(tier.points);
    if(tier.pool === 'canton' && tier.cantons.length) return lifeCantonApproach(pick(tier.cantons), fromX, fromZ);
  }
  return LIFE_STILT.length ? pick(LIFE_STILT) : [fromX, fromZ];
}

function lifeCantonBlocked(x, z){
  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    var dx = x-c.x, dz = z-c.z, d = Math.hypot(dx,dz) || 1;
    var ang = Math.atan2(dz,dx);
    var clearR = c.r*1.45/Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 40;
    if(d < clearR) return [c, dx/d, dz/d, clearR];
  }
  return null;
}

function lifePushToWater(x, z){
  for(var i=0; i<8; i++){
    var blocked = lifeCantonBlocked(x,z);
    if(blocked){ x = blocked[0].x + blocked[1]*blocked[3]; z = blocked[0].z + blocked[2]*blocked[3]; continue; }
    if(terrainH(x,z) < -1.5) break;
    var g = sdGrad(x,z);
    x -= g[0]*4; z -= g[1]*4;
  }
  return [x, z];
}
function lifeMix(a, b, t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
var LIFE_Y = SEA - 0.15;

function cantonEdgeY(name){
  var t = CANTON_TOPS[name]; if(!t) return null;
  return (t.entryY != null) ? t.entryY : (t.spring != null ? t.spring : t.y);
}

function cantonHeightAt(name, x, z){
  var t = CANTON_TOPS[name];
  if(!t || !t.tierRings || !t.tierRings.length) return cantonEdgeY(name);
  var c = CIDX[name]; if(!c) return cantonEdgeY(name);
  var d = Math.hypot(x-c.x, z-c.z);
  var rings = t.tierRings;
  for(var i=rings.length-1; i>=0; i--){
    if(d <= rings[i].hw) return rings[i].y;
  }
  return rings[0].y;   /* past even the base tier's own radius (right at the outer edge) */
}

function lifeCausewayY(x, z){
  for(var i=0; i<CAUSEWAYS.length; i++){
    var cw = CAUSEWAYS[i], c = cw.c; if(!c) continue;
    var top = CANTON_TOPS[c.n] ? CANTON_TOPS[c.n].y : null; if(top == null) continue;
    var land = shoreIn(cw.s, 26);
    var dx = land[0]-c.x, dz = land[1]-c.z, L = Math.hypot(dx,dz);
    if(L < c.r + 40) continue;
    var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
    var ay = cw.solid ? top : CWAY;
    var by = cw.solid ? RLAND : Math.max(CWAY-6, terrainH(land[0],land[1])+2.5);
    var sx = land[0]-ax, sz = land[1]-az, segL2 = sx*sx+sz*sz;
    var t = segL2 > 0 ? ((x-ax)*sx+(z-az)*sz)/segL2 : 0;
    t = Math.max(0, Math.min(1, t));
    var px = ax+sx*t, pz = az+sz*t;
    if(Math.hypot(x-px, z-pz) < (c.port ? 66 : 58)) return ay + (by-ay)*t;
  }
  return null;
}

function lifeBridgeY(x, z){
  var i, A, B, dx, dz, L2, t, px, pz;
  for(i=0; i<SPANS.length; i++){
    A = CANTONS[SPANS[i].a]; B = CANTONS[SPANS[i].b];
    var ux = B.x-A.x, uz = B.z-A.z, UL = Math.hypot(ux,uz) || 1;
    var ax = A.x+ux/UL*A.r*0.94, az = A.z+uz/UL*A.r*0.94;
    var bx = B.x-ux/UL*B.r*0.94, bz = B.z-uz/UL*B.r*0.94;
    dx = bx-ax; dz = bz-az; L2 = dx*dx+dz*dz;
    t = L2 ? ((x-ax)*dx+(z-az)*dz)/L2 : 0; t = Math.max(0, Math.min(1,t));
    px = ax+dx*t; pz = az+dz*t;
    if(Math.hypot(x-px, z-pz) < 11){   /* span widths are rr(12,17); half of the narrowest, plus a little */
      return DECK + Math.min(20, Math.sqrt(L2)*0.055) * Math.sin(Math.PI*t);
    }
  }
  for(i=0; i<RBRIDGES.length; i++){
    var b = RBRIDGES[i];
    dx = b.bx-b.ax; dz = b.bz-b.az; L2 = dx*dx+dz*dz;
    t = L2 ? ((x-b.ax)*dx+(z-b.az)*dz)/L2 : 0; t = Math.max(0, Math.min(1,t));
    px = b.ax+dx*t; pz = b.az+dz*t;
    if(Math.hypot(x-px, z-pz) < b.w*0.5+3){
      var deck = Math.max(terrainH(b.ax,b.az)+2.2, terrainH(b.bx,b.bz)+2.2, 11.5);
      return deck + 6*Math.sin(Math.PI*t);
    }
  }
  return null;
}

function lifeGroundY(x, z){
  var cwY = lifeCausewayY(x, z);
  if(cwY != null) return cwY;
  var brY = lifeBridgeY(x, z);
  if(brY != null) return brY;

  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    var cdx = x-c.x, cdz = z-c.z;                /* squared: this runs per walker per frame */
    if(cdx*cdx + cdz*cdz < c.r*c.r){
      var ey = cantonHeightAt(c.n, x, z);
      if(ey != null) return ey;
    }
  }

  for(var pi=0; pi<CPIERS.length; pi++){
    var p = CPIERS[pi];
    if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < (p.w*0.5+3)) return 6.2;
  }
  for(var ei=0; ei<LIFE_EXTRA_PIERS.length; ei++){
    var ep = LIFE_EXTRA_PIERS[ei];
    if(lifeSegDist(x,z,ep.x0,ep.z0,ep.x1,ep.z1) < (ep.w*0.5+3)) return SEA+1.55;
  }
  return terrainH(x, z);
}

/* ==== global nav-grid + A* ==== */
var LIFE_NAV_CELL = 26;    /* close to the chinampas' own rowSpacing (24) so a grid cell can actually resolve a canal from a bed row */
var LIFE_NAV_MINX = -2850, LIFE_NAV_MAXX = 2850, LIFE_NAV_MINZ = -2850, LIFE_NAV_MAXZ = 2850;   /* covers every canton/chinampa/pier this session ever touched, well past CITY_LIM (2280) */
var LIFE_NAV_W = Math.ceil((LIFE_NAV_MAXX-LIFE_NAV_MINX)/LIFE_NAV_CELL);
var LIFE_NAV_H = Math.ceil((LIFE_NAV_MAXZ-LIFE_NAV_MINZ)/LIFE_NAV_CELL);
function lifeNavCellCenter(cx, cz){ return [LIFE_NAV_MINX+(cx+0.5)*LIFE_NAV_CELL, LIFE_NAV_MINZ+(cz+0.5)*LIFE_NAV_CELL]; }
function lifeNavWorldToCell(x, z){ return [Math.floor((x-LIFE_NAV_MINX)/LIFE_NAV_CELL), Math.floor((z-LIFE_NAV_MINZ)/LIFE_NAV_CELL)]; }

function lifeSegDist(px, pz, ax, az, bx, bz){
  var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz;
  var t = L ? ((px-ax)*dx+(pz-az)*dz)/L : 0; t = Math.max(0, Math.min(1,t));
  return Math.hypot(px-ax-t*dx, pz-az-t*dz);
}

function lifeNavCantonBlocked(x, z){
  for(var i=0; i<CANTONS.length; i++){
    var c = CANTONS[i];
    var dx=x-c.x, dz=z-c.z, d=Math.hypot(dx,dz)||1;
    var ang = Math.atan2(dz,dx);
    var capHw = c.r*1.07/Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 10;
    if(d < capHw) return true;
  }
  return false;
}
function lifeNavBlocked(x, z){
  if(terrainH(x,z) > -1.5) return true;
  if(lifeNavCantonBlocked(x,z)) return true;
  if(chinHit(x,z,7)) return true;
  for(var i=0;i<PIERS.length;i++){ var p=PIERS[i]; if(lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1) < p.w*0.5+6) return true; }
  for(var j=0;j<CPIERS.length;j++){ var c=CPIERS[j]; if(lifeSegDist(x,z,c.x0,c.z0,c.x1,c.z1) < c.w*0.5+6) return true; }
  for(var k=0;k<RPIERS.length;k++){ var r=RPIERS[k]; if(lifeSegDist(x,z,r.x0,r.z0,r.x1,r.z1) < r.w*0.5+6) return true; }

  for(var m=0;m<LIFE_EXTRA_PIERS.length;m++){ var e=LIFE_EXTRA_PIERS[m]; if(lifeSegDist(x,z,e.x0,e.z0,e.x1,e.z1) < e.w*0.5+6) return true; }

  for(var n2=0;n2<BRIDGE_SUPPORTS.length;n2++){ var bs=BRIDGE_SUPPORTS[n2]; if(Math.hypot(x-bs.x,z-bs.z) < bs.r+6) return true; }

  if(typeof LIFE_SHIP_STATIONARY_DOCKS !== 'undefined'){
    for(var q=0;q<LIFE_SHIP_STATIONARY_DOCKS.length;q++){
      var sd = LIFE_SHIP_STATIONARY_DOCKS[q];
      if(Math.hypot(x-sd.x, z-sd.z) < 26) return true;
    }
  }
  return false;
}

var LIFE_NAV_GRID = new Uint8Array(LIFE_NAV_W*LIFE_NAV_H);
function lifeNavBuildGrid(){
  for(var cz=0; cz<LIFE_NAV_H; cz++){
    for(var cx=0; cx<LIFE_NAV_W; cx++){
      var p = lifeNavCellCenter(cx,cz);
      LIFE_NAV_GRID[cz*LIFE_NAV_W+cx] = lifeNavBlocked(p[0],p[1]) ? 1 : 0;
    }
  }
}

function lifeNavNearestOpen(cx, cz){
  if(cx>=0 && cz>=0 && cx<LIFE_NAV_W && cz<LIFE_NAV_H && !LIFE_NAV_GRID[cz*LIFE_NAV_W+cx]) return [cx,cz];
  for(var r=1; r<10; r++){
    for(var dz=-r; dz<=r; dz++){
      for(var dx=-r; dx<=r; dx++){
        if(Math.max(Math.abs(dx),Math.abs(dz)) !== r) continue;
        var ncx=cx+dx, ncz=cz+dz;
        if(ncx<0||ncz<0||ncx>=LIFE_NAV_W||ncz>=LIFE_NAV_H) continue;
        if(!LIFE_NAV_GRID[ncz*LIFE_NAV_W+ncx]) return [ncx,ncz];
      }
    }
  }
  return [cx,cz];
}
var LIFE_NAV_NEI = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.41421],[1,-1,1.41421],[-1,1,1.41421],[-1,-1,1.41421]];

function LifeNavHeap(){ this.a = []; }
LifeNavHeap.prototype.push = function(node, score){
  var a = this.a, i = a.length;
  a.push([node, score]);
  while(i > 0){
    var p = (i-1) >> 1;
    if(a[p][1] <= a[i][1]) break;
    var t = a[p]; a[p] = a[i]; a[i] = t;
    i = p;
  }
};
LifeNavHeap.prototype.pop = function(){
  var a = this.a, top = a[0], last = a.pop();
  if(a.length){
    a[0] = last;
    var i = 0, n = a.length;
    while(true){
      var l = 2*i+1, r = 2*i+2, sm = i;
      if(l < n && a[l][1] < a[sm][1]) sm = l;
      if(r < n && a[r][1] < a[sm][1]) sm = r;
      if(sm === i) break;
      var t = a[sm]; a[sm] = a[i]; a[i] = t;
      i = sm;
    }
  }
  return top;
};

function lifeNavAStar(ax, az, bx, bz){
  var W = LIFE_NAV_W, H = LIFE_NAV_H;
  var s0 = lifeNavWorldToCell(ax,az), g0 = lifeNavWorldToCell(bx,bz);
  s0 = [Math.max(0,Math.min(W-1,s0[0])), Math.max(0,Math.min(H-1,s0[1]))];
  g0 = [Math.max(0,Math.min(W-1,g0[0])), Math.max(0,Math.min(H-1,g0[1]))];
  var start = lifeNavNearestOpen(s0[0], s0[1]);
  var goal = lifeNavNearestOpen(g0[0], g0[1]);
  function idx(cx,cz){ return cz*W+cx; }
  var startI = idx(start[0],start[1]), goalI = idx(goal[0],goal[1]);
  if(startI === goalI) return [[ax,az],[bx,bz]];
  var n = W*H;
  var gScore = new Float32Array(n).fill(Infinity);
  var cameFrom = new Int32Array(n).fill(-1);
  var closed = new Uint8Array(n);
  gScore[startI] = 0;
  var heap = new LifeNavHeap();
  heap.push(startI, Math.hypot(goal[0]-start[0], goal[1]-start[1]));
  var iter = 0, iterCap = 60000;
  while(heap.a.length && iter++ < iterCap){
    var popped = heap.pop();
    var current = popped[0];
    if(closed[current]) continue;   /* stale duplicate — this node was already finalized with a better score */
    if(current === goalI) break;
    closed[current] = 1;
    var ccx = current % W, ccz = (current-ccx)/W;
    for(var ni2=0; ni2<8; ni2++){
      var ncx = ccx+LIFE_NAV_NEI[ni2][0], ncz = ccz+LIFE_NAV_NEI[ni2][1];
      if(ncx<0||ncz<0||ncx>=W||ncz>=H) continue;
      var nIdx = idx(ncx,ncz);
      if(closed[nIdx] || LIFE_NAV_GRID[nIdx]) continue;
      var tentG = gScore[current] + LIFE_NAV_NEI[ni2][2];
      if(tentG < gScore[nIdx]){
        cameFrom[nIdx] = current;
        gScore[nIdx] = tentG;
        heap.push(nIdx, tentG + Math.hypot(goal[0]-ncx, goal[1]-ncz));
      }
    }
  }
  if(cameFrom[goalI] === -1 && goalI !== startI) return null;
  var path = [], cur = goalI;
  while(true){
    var cx = cur % W, cz = (cur-cx)/W;
    path.push(lifeNavCellCenter(cx,cz));
    if(cur === startI) break;
    cur = cameFrom[cur];
  }
  path.reverse();
  path.unshift([ax,az]);
  path.push([bx,bz]);
  return path;
}

function lifeNavLOSClear(ax, az, bx, bz){
  var d = Math.hypot(bx-ax, bz-az);
  var steps = Math.max(1, Math.ceil(d / (LIFE_NAV_CELL*0.5)));
  for(var i=0; i<=steps; i++){
    var t = i/steps;
    if(lifeNavBlocked(ax+(bx-ax)*t, az+(bz-az)*t)) return false;
  }
  return true;
}

function lifeNavSimplify(path){
  var MAXSKIP = 700;
  var out = [path[0]];
  var i = 0;
  while(i < path.length-1){
    var farthest = i+1;
    for(var k=i+1; k<path.length; k++){
      var d = Math.hypot(path[k][0]-path[i][0], path[k][1]-path[i][1]);
      if(d > MAXSKIP) break;
      if(lifeNavLOSClear(path[i][0],path[i][1], path[k][0],path[k][1])) farthest = k;
    }
    out.push(path[farthest]);
    i = farthest;
  }
  return out;
}

var LIFE_NAV_STATS = { calls:0, fallbacks:0, lastFallbacks:[] };
function lifeNavBuildLeg(ax, az, bx, bz){
  LIFE_NAV_STATS.calls++;
  var path = lifeNavAStar(ax, az, bx, bz);
  if(!path || path.length < 2){

    LIFE_NAV_STATS.fallbacks++;
    if(LIFE_NAV_STATS.lastFallbacks.length < 24)
      LIFE_NAV_STATS.lastFallbacks.push([Math.round(ax),Math.round(az),Math.round(bx),Math.round(bz)]);
    return lifeBuildLeg(ax, az, bx, bz);
  }
  var simplified = lifeNavSimplify(path);
  return lifeCurveFromCentripetal(simplified);
}
window._nav = { w: LIFE_NAV_W, h: LIFE_NAV_H, cell: LIFE_NAV_CELL,
  minx: LIFE_NAV_MINX, minz: LIFE_NAV_MINZ,

  blocked: function(){ var c=0; for(var i=0;i<LIFE_NAV_GRID.length;i++) if(LIFE_NAV_GRID[i]) c++; return c; },
  total: LIFE_NAV_GRID.length,
  buildLeg: lifeNavBuildLeg, aStar: lifeNavAStar, blockedAt: lifeNavBlocked,   /* diagnostic */
  stats: LIFE_NAV_STATS,   /* diagnostic: real A*-failure rate + the routes that failed */
  grid: LIFE_NAV_GRID };

function lifeCurveFrom(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], LIFE_Y, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.25);
}

function lifeCurveFromLand(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], lifeGroundY(w[0],w[1]) + 0.15, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.25);
}

function lifeCurveFromLandCentripetal(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], lifeGroundY(w[0],w[1]) + 0.15, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

function lifeCurveFromCentripetal(waypoints){
  var pts = waypoints.map(function(w){ return new THREE.Vector3(w[0], LIFE_Y, w[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

function lifeBuildLeg(ax,az,bx,bz){
  var m1 = lifePushToWater.apply(null, lifeMix([ax,az],[bx,bz], 0.33));
  var m2 = lifePushToWater.apply(null, lifeMix([ax,az],[bx,bz], 0.66));
  var waypoints = [[ax,az], m1, m2, [bx,bz]];

  for(var round=0; round<10; round++){
    var curve = lifeCurveFrom(waypoints);
    var worst = null, worstT = 0, worstFix = null;
    for(var s=1; s<80; s++){
      var st = s/80, p = curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p.x, p.z);
      if(blocked){
        worst = blocked; worstT = st;
        worstFix = [blocked[0].x + blocked[1]*blocked[3]*1.25, blocked[0].z + blocked[2]*blocked[3]*1.25];
        break;
      }

      if(st > 0.08 && st < 0.92 && terrainH(p.x, p.z) > -1.5){
        var pushed = lifePushToWater(p.x, p.z);
        worst = true; worstT = st;
        worstFix = pushed;
        break;
      }
    }
    if(!worst) return curve;

    var nearestIdx = 1, nearestD = Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt = w2/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w2; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFrom(waypoints);
}

/* ==== visuals: plain THREE meshes, NOT the BUCKET/emit-kit static bake — ==== */
var LIFE_N = 100;

function lifeMergeGeoms(geoms){
  var pos = [], nrm = [], uv = [], col = [];
  var anyColor = geoms.some(function(g){ return g && g.color !== undefined; });
  geoms.forEach(function(entry){
    var g = entry.isBufferGeometry ? entry : entry.geo;
    var c = anyColor ? new THREE.Color(entry.color !== undefined ? entry.color : 0xffffff) : null;
    var p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;

    var idx = g.index;
    var vcount = idx ? idx.count : p.count;
    for(var i=0;i<vcount;i++){
      var vi = idx ? idx.getX(i) : i;
      pos.push(p.getX(vi), p.getY(vi), p.getZ(vi));
      nrm.push(n.getX(vi), n.getY(vi), n.getZ(vi));
      uv.push(u.getX(vi), u.getY(vi));
      if(anyColor) col.push(c.r, c.g, c.b);
    }
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if(anyColor) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

var LIFE_PEOPLE_SCALE = 2.8;
var lifePersonGeo = lifeMergeGeoms([
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: LIFE_SKIN },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: LIFE_HAIR_DARK }
]);

var lifePersonGeoWhite = lifeMergeGeoms([
  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: LIFE_SKIN },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: LIFE_HAIR_WHITE }
]);

var LIFE_CANOE_SCALE = 2.4;
var lifeHullGeo = new THREE.BoxGeometry(1.2*LIFE_CANOE_SCALE, 0.5*LIFE_CANOE_SCALE, 5.2*LIFE_CANOE_SCALE);
var lifeTorsoGeo = new THREE.CylinderGeometry(0.32*LIFE_CANOE_SCALE, 0.38*LIFE_CANOE_SCALE, 1.1*LIFE_CANOE_SCALE, 6).translate(0, 0.75*LIFE_CANOE_SCALE, 0);
var lifeHeadGeo = new THREE.BoxGeometry(0.42*LIFE_CANOE_SCALE, 0.42*LIFE_CANOE_SCALE, 0.42*LIFE_CANOE_SCALE).translate(0, 1.55*LIFE_CANOE_SCALE, 0);
var lifeBodyGeo = lifeMergeGeoms([
  { geo: lifeHullGeo, color: 0x6b5942 },
  { geo: lifeTorsoGeo, color: LIFE_SKIN },
  { geo: lifeHeadGeo, color: LIFE_HAIR_DARK }
]);
var lifeBodyMesh = new THREE.InstancedMesh(lifeBodyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_N);
var lifePaddleGeo = new THREE.BoxGeometry(0.10*LIFE_CANOE_SCALE, 1.6*LIFE_CANOE_SCALE, 0.34*LIFE_CANOE_SCALE);
var lifePaddleMesh = new THREE.InstancedMesh(lifePaddleGeo, new THREE.MeshLambertMaterial({ color: 0x5a4732 }), LIFE_N);
[lifeBodyMesh, lifePaddleMesh].forEach(function(m){ m.userData.life = true; m.userData.inspectLabel = 'Canoe paddler'; m.frustumCulled = false; scene.add(m); });

/* ==== the LIFE_N canoes: init position + first leg ==== */
var LIFE_CANOES = [];
window._deck = { causewayY: lifeCausewayY, bridgeY: lifeBridgeY, groundY: lifeGroundY,
  on: function(x,z){ return lifeCausewayY(x,z) != null || lifeBridgeY(x,z) != null; } };   /* diagnostic */
window._legs = [];
for(var li=0; li<LIFE_N; li++){
  var spawn = LIFE_STILT.length ? pick(LIFE_STILT) : (LIFE_SHRINE.length ? pick(LIFE_SHRINE) : [0,0]);
  var lifeStart = lifePushToWater(spawn[0], spawn[1]);
  var lifeDest = lifePickDestination(lifeStart[0], lifeStart[1]);
  var lifeCurve = lifeBuildLeg(lifeStart[0], lifeStart[1], lifeDest[0], lifeDest[1]);
  var cv = {
    ax: lifeStart[0], az: lifeStart[1], bx: lifeDest[0], bz: lifeDest[1],
    curve: lifeCurve, len: lifeCurve.getLength(),
    speed: rr(3.2, 5.5), state: 'go', stateT: rr(0, 30), dwellFor: rr(3, 8),
    paddlePhase: rnd()*6.28
  };
  cv.dur = Math.max(2, cv.len / cv.speed);
  LIFE_CANOES.push(cv);
  window._legs.push({ curve: cv.curve });
}
window._life = { canoes: LIFE_N };

var LIFE_UP = new THREE.Vector3(0,1,0);
var lifeTmpPos = new THREE.Vector3(), lifeTmpDir = new THREE.Vector3();
var lifeTmpQuat = new THREE.Quaternion(), lifeTmpQuat2 = new THREE.Quaternion();
var lifeTmpMat = new THREE.Matrix4(), lifeTmpScale = new THREE.Vector3(1,1,1);
var lifeTmpPos2 = new THREE.Vector3();
/* ==== local avoidance (first piece) ==== */

function lifeAvoidGiveWay(mine, other){
  if(other > mine) return 1.4;
  if(other === mine) return 1.0;
  return 0.22;
}
function lifeAvoidNudge(myIdx, x, z, r, maxNudge, myPriority){
  myPriority = myPriority || 1;
  var px = 0, pz = 0;
  for(var i=0; i<LIFE_AVOID_N; i++){
    if(i === myIdx) continue;
    var oR = LIFE_AVOID_R[i];
    if(oR <= 0) continue;
    var dx = x-LIFE_AVOID_X[i], dz = z-LIFE_AVOID_Z[i];
    var d = Math.hypot(dx,dz) || 0.01;
    var minD = r + oR;
    if(d < minD){
      var w = (minD-d)/minD * lifeAvoidGiveWay(myPriority, LIFE_AVOID_PRIORITY[i]);
      px += (dx/d)*w; pz += (dz/d)*w;
    }
  }
  var mag = Math.hypot(px,pz);
  if(mag < 1e-4) return [x,z];
  var k = Math.min(maxNudge, mag*maxNudge)/mag;
  return [x+px*k, z+pz*k];
}

function lifeAvoidNudge2(myIdx, x, z, dirX, dirZ, r, maxNudgeNow, lookahead, maxNudgeAhead, priority){
  var now = lifeAvoidNudge(myIdx, x, z, r, maxNudgeNow, priority);
  var ndx = now[0]-x, ndz = now[1]-z;
  if(ndx*ndx + ndz*ndz > 1e-6) return [ndx, ndz];
  var laX = x+dirX*lookahead, laZ = z+dirZ*lookahead;
  var ahead = lifeAvoidNudge(myIdx, laX, laZ, r, maxNudgeAhead, priority);
  return [ahead[0]-laX, ahead[1]-laZ];
}
function updateLife(dt){
  LIFE_LOD_FRAME++;          /* one tick for every distance-banded updater below */
  LIFE_CANOES.forEach(function(cv, idx){
    cv.stateT += dt;
    var t;
    if(cv.state === 'dwell'){
      t = 0.999;
      if(cv.stateT >= cv.dwellFor){
        var nx = cv.bx, nz = cv.bz;
        var dest = lifePickDestination(nx, nz);
        cv.ax = nx; cv.az = nz; cv.bx = dest[0]; cv.bz = dest[1];
        cv.curve = lifeBuildLeg(cv.ax, cv.az, cv.bx, cv.bz);
        cv.len = cv.curve.getLength();
        cv.dur = Math.max(2, cv.len / cv.speed);
        cv.state = 'go'; cv.stateT = 0;
        window._legs[idx] = { curve: cv.curve };
      }
    }else{
      var raw = Math.min(1, cv.stateT / cv.dur);
      t = raw*raw*(3 - 2*raw);           /* smoothstep ease in/out */
      if(raw >= 1){ cv.state = 'dwell'; cv.stateT = 0; cv.dwellFor = rr(3, 8); }
    }
    cv.curve.getPointAt(t, lifeTmpPos);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cv.curve.getTangentAt(tTan, lifeTmpDir);
    var yaw = Math.atan2(lifeTmpDir.x, lifeTmpDir.z);
    lifeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);

    var avoidSlot = LIFE_AVOID_CANOE0 + idx;
    var nudged = lifeAvoidNudge(avoidSlot, lifeTmpPos.x, lifeTmpPos.z, LIFE_AVOID_R[avoidSlot], 2.2, 1);
    lifeTmpPos.x = nudged[0]; lifeTmpPos.z = nudged[1];
    LIFE_AVOID_X[avoidSlot] = lifeTmpPos.x; LIFE_AVOID_Z[avoidSlot] = lifeTmpPos.z;

    lifeTmpMat.compose(lifeTmpPos, lifeTmpQuat, lifeTmpScale);
    lifeBodyMesh.setMatrixAt(idx, lifeTmpMat);

    var stroke = Math.sin(cv.paddlePhase + performance.now()*0.003);
    lifeTmpQuat2.setFromAxisAngle(new THREE.Vector3(0,0,1), stroke*0.5);
    lifeTmpQuat2.premultiply(lifeTmpQuat);
    lifeTmpPos2.copy(lifeTmpPos);
    lifeTmpPos2.x += Math.sin(yaw)*0.75; lifeTmpPos2.z += Math.cos(yaw)*0.75;
    lifeTmpPos2.y += 1.0;
    lifeTmpMat.compose(lifeTmpPos2, lifeTmpQuat2, lifeTmpScale);
    lifePaddleMesh.setMatrixAt(idx, lifeTmpMat);
  });
  lifeBodyMesh.instanceMatrix.needsUpdate = true;
  lifePaddleMesh.instanceMatrix.needsUpdate = true;
  updateShips(dt);
  updateCGuard(dt);    /* the Fortress coast guard — its own tiny machine, deliberately outside LIFE_SHIPS' relay (see that section) */
  updateFerries(dt);
  updateWaterTaxis(dt);
  updateBarges(dt);
  updateFishBoats(dt);
  updatePedestrians(dt);
  updatePenitents(dt);
  updateOrdinators(dt);
  updateClergy(dt);
  updateGuildWorkers(dt);
  updateCaravans(dt);
  updateArena(dt);     /* arena gladiator combat — this file's own last section */

  if(typeof updateStriders === 'function') updateStriders(dt);
}
window._lifeTick = updateLife;   /* diagnostic: fast-forward the sim from outside the real rAF loop (headless test probes can't wait out a real dt=0.06-capped clock for something like a ship's ~80s transit) */
