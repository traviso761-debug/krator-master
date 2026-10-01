/* ==== citizens: penitents ==== */
var LIFE_PEN_ROBE = pick(GREYC);
var lifePenitentHullParts = [
  { geo: new THREE.CylinderGeometry(0.28*LIFE_PEOPLE_SCALE, 0.44*LIFE_PEOPLE_SCALE, 1.2*LIFE_PEOPLE_SCALE, 7), color: LIFE_PEN_ROBE },
  { geo: new THREE.BoxGeometry(0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE).translate(0, 0.80*LIFE_PEOPLE_SCALE, 0), color: LIFE_SKIN },
  { geo: new THREE.ConeGeometry(0.24*LIFE_PEOPLE_SCALE, 0.30*LIFE_PEOPLE_SCALE, 6).translate(0, 1.00*LIFE_PEOPLE_SCALE, 0), color: shade(LIFE_PEN_ROBE,-0.22) },

  { geo: new THREE.BoxGeometry(0.05*LIFE_PEOPLE_SCALE, 0.5*LIFE_PEOPLE_SCALE, 0.34*LIFE_PEOPLE_SCALE).translate(0.30*LIFE_PEOPLE_SCALE, 0.62*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifePenitentGeo = lifeMergeGeoms(lifePenitentHullParts);
var LIFE_PEN_GROUPS = 5, LIFE_PEN_PER = 3, LIFE_PEN_N = LIFE_PEN_GROUPS*LIFE_PEN_PER;
var LIFE_PEN_ROLES = ['flagellant','banner','book'];
var LIFE_PEN_SIDE = [-1.15, 0, 1.15];   /* flagellant left, banner centre, book right of the group's own line of travel */
var lifePenitentMesh = new THREE.InstancedMesh(lifePenitentGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_PEN_N);
lifePenitentMesh.userData.life = true; lifePenitentMesh.userData.inspectLabel = 'Penitent pilgrim';
lifePenitentMesh.frustumCulled = false;
scene.add(lifePenitentMesh);

var LIFE_PEN_STOPS = LIFE_DOORS.filter(function(d){ return d.cat === 'temple'; })
  .map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; })
  .concat(LIFE_SHRINE_STOPS.map(function(s){ return { x:s.x, z:s.z, ry:s.ry }; }));
if(!LIFE_PEN_STOPS.length){
  var lifePenTempleFallback = CPIERS.filter(function(p){ return p.canton === 'Temple'; })[0];
  if(lifePenTempleFallback) LIFE_PEN_STOPS.push({ x:lifePenTempleFallback.x1, z:lifePenTempleFallback.z1, ry:lifePenTempleFallback.ry });
}
function lifePenPickStop(exclude){
  var pool = LIFE_PEN_STOPS.filter(function(s){ return s !== exclude; });
  return pick(pool.length ? pool : LIFE_PEN_STOPS);
}

var LIFE_PEN_GROUPS_ARR = [];
(function(){
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    var origin = pick(LIFE_PEN_STOPS);
    var dest = lifePenPickStop(origin);
    var curve = lifePedBuildLeg(origin.x, origin.z, dest.x, dest.z);
    var grp = {
      curve: curve, len: curve.getLength(), dur: 0,
      speed: rr(1.7, 2.3), state: 'walk', stateT: 0,
      destStop: dest, prayFor: rr(8, 16)
    };
    grp.dur = Math.max(4, grp.len/grp.speed);
    grp.stateT = rr(0, grp.dur);   /* stagger the 5 groups so they don't all set off together */
    LIFE_PEN_GROUPS_ARR.push(grp);
  }
})();
window._penitents = { groups: LIFE_PEN_GROUPS_ARR.length, total: LIFE_PEN_N, stops: LIFE_PEN_STOPS.length };   /* diagnostic */

(function(){
  var white = new THREE.Color(0xffffff), pale = new THREE.Color(MARBLEC[2]);
  for(var g=0; g<LIFE_PEN_GROUPS; g++){
    for(var r=0; r<LIFE_PEN_PER; r++){
      lifePenitentMesh.setColorAt(g*LIFE_PEN_PER+r, LIFE_PEN_ROLES[r]==='banner' ? pale : white);
    }
  }
  if(lifePenitentMesh.instanceColor) lifePenitentMesh.instanceColor.needsUpdate = true;
})();

var lifePenTmpPos = new THREE.Vector3(), lifePenTmpDir = new THREE.Vector3();
var lifePenTmpQuat = new THREE.Quaternion(), lifePenTmpMat = new THREE.Matrix4();
var lifePenTmpScale1 = new THREE.Vector3(1,1,1), lifePenTmpPos2 = new THREE.Vector3();
function updatePenitents(dt){
  LIFE_PEN_GROUPS_ARR.forEach(function(grp, gi){
    grp.stateT += dt;
    var px, pz, yaw;
    if(grp.state === 'pray'){

      var wander = grp.stateT*0.5 + gi*2.1;
      px = grp.destStop.x + Math.sin(wander)*1.4;
      pz = grp.destStop.z + Math.cos(wander*0.7)*1.4;
      yaw = wander;
      if(grp.stateT >= grp.prayFor){
        var next = lifePenPickStop(grp.destStop);
        grp.curve = lifePedBuildLeg(grp.destStop.x, grp.destStop.z, next.x, next.z);
        grp.len = grp.curve.getLength(); grp.dur = Math.max(4, grp.len/grp.speed);
        grp.destStop = next; grp.state = 'walk'; grp.stateT = 0;
      }
    }else{
      if(grp.dur === 0) grp.dur = Math.max(4, grp.len/grp.speed);
      var raw = Math.min(1, grp.stateT/grp.dur);
      var t = raw*raw*(3-2*raw);
      grp.curve.getPointAt(t, lifePenTmpPos);
      px = lifePenTmpPos.x; pz = lifePenTmpPos.z;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      grp.curve.getTangentAt(tTan, lifePenTmpDir);
      yaw = Math.atan2(lifePenTmpDir.x, lifePenTmpDir.z);
      if(raw >= 1){ grp.state = 'pray'; grp.stateT = 0; grp.prayFor = rr(8,16); }
    }
    for(var r=0; r<LIFE_PEN_PER; r++){
      var off = loc(px, pz, LIFE_PEN_SIDE[r], 0, yaw);
      var gy = Math.max(LIFE_Y, lifeGroundY(off[0], off[1]) + 0.15);
      lifePenTmpPos2.set(off[0], gy, off[1]);
      lifePenTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifePenTmpMat.compose(lifePenTmpPos2, lifePenTmpQuat, lifePenTmpScale1);
      lifePenitentMesh.setMatrixAt(gi*LIFE_PEN_PER+r, lifePenTmpMat);
    }
  });
  lifePenitentMesh.instanceMatrix.needsUpdate = true;
}

/* ==== citizens: ordinators ==== */

var LIFE_ROAD_ADJ = RNODE.map(function(){ return []; });
REDGE.forEach(function(e){
  var A = RNODE[e.a], B = RNODE[e.b], d = Math.hypot(B.x-A.x, B.z-A.z);
  LIFE_ROAD_ADJ[e.a].push({ to:e.b, d:d });
  LIFE_ROAD_ADJ[e.b].push({ to:e.a, d:d });
});
window._debugRoadGraph = { RNODE: RNODE, adj: LIFE_ROAD_ADJ };   /* diagnostic: raw node list + this file's own adjacency, for probing lifeRoadPath failures */
function lifeNearestRoadNode(x,z){
  var best=-1, bestD=Infinity;
  for(var i=0;i<RNODE.length;i++){
    var n=RNODE[i], dx=x-n.x, dz=z-n.z, d=dx*dx+dz*dz;
    if(d<bestD){ bestD=d; best=i; }
  }
  return best;
}
function lifeRoadPath(ax,az,bx,bz){
  var startN = lifeNearestRoadNode(ax,az), goalN = lifeNearestRoadNode(bx,bz);
  if(startN<0 || goalN<0 || startN===goalN) return null;
  var n = RNODE.length;
  var dist = new Float64Array(n).fill(Infinity);
  var prev = new Int32Array(n).fill(-1);
  var visited = new Uint8Array(n);
  dist[startN] = 0;
  for(var iter=0; iter<n; iter++){
    var u=-1, best=Infinity;
    for(var i=0;i<n;i++){ if(!visited[i] && dist[i]<best){ best=dist[i]; u=i; } }
    if(u<0 || u===goalN) break;
    visited[u]=1;
    var neigh = LIFE_ROAD_ADJ[u];
    for(var k=0;k<neigh.length;k++){
      var v=neigh[k].to;
      if(visited[v]) continue;
      var nd = dist[u]+neigh[k].d;
      if(nd < dist[v]){ dist[v]=nd; prev[v]=u; }
    }
  }
  if(dist[goalN] === Infinity) return null;
  var path=[goalN], cur=goalN;
  while(cur!==startN){ cur=prev[cur]; if(cur<0) return null; path.push(cur); }
  path.reverse();
  return path;
}
window._debugRoadGraph.lifeRoadPath = lifeRoadPath;
window._debugRoadGraph.lifeNearestRoadNode = lifeNearestRoadNode;

/* ==== reachability, so "unreachable" can be REJECTED instead of faked ==== */
var LIFE_ROAD_COMP = (function(){
  var p = new Int32Array(RNODE.length);
  for(var i=0;i<p.length;i++) p[i]=i;
  function find(a){ while(p[a]!==a){ p[a]=p[p[a]]; a=p[a]; } return a; }
  LIFE_ROAD_ADJ.forEach(function(list, a){
    for(var k=0;k<list.length;k++){ var x=find(a), y=find(list[k].to); if(x!==y) p[y]=x; }
  });
  var out = new Int32Array(RNODE.length);
  for(var j=0;j<p.length;j++) out[j] = find(j);
  return out;
})();

var LIFE_ROAD_SNAP_MAX = 260;
function lifeRoadReachable(ax,az,bx,bz){
  var s = lifeNearestRoadNode(ax,az), g = lifeNearestRoadNode(bx,bz);
  if(s<0 || g<0) return false;
  if(LIFE_ROAD_COMP[s] !== LIFE_ROAD_COMP[g]) return false;
  if(Math.hypot(RNODE[s].x-ax, RNODE[s].z-az) > LIFE_ROAD_SNAP_MAX) return false;
  if(Math.hypot(RNODE[g].x-bx, RNODE[g].z-bz) > LIFE_ROAD_SNAP_MAX) return false;
  return true;
}
window._debugRoadGraph.reachable = lifeRoadReachable;
window._debugRoadGraph.comp = LIFE_ROAD_COMP;

function lifeCartBuildLeg(ax,az,bx,bz){
  var path = lifeRoadPath(ax,az,bx,bz);
  if(!path) return lifePedBuildLeg(ax,az,bx,bz);
  var waypoints = [[ax,az]];
  path.forEach(function(ni){ var n=RNODE[ni]; waypoints.push([n.x,n.z]); });
  waypoints.push([bx,bz]);
  var HILL_MAX = 95;

  var cartLen = 0;
  for(var wl=1; wl<waypoints.length; wl++)
    cartLen += Math.hypot(waypoints[wl][0]-waypoints[wl-1][0], waypoints[wl][1]-waypoints[wl-1][1]);
  var SAMPLES = Math.max(80, Math.min(260, Math.round(cartLen/28)));
  var ROUNDS  = Math.max(16, Math.min(34, Math.round(cartLen/220)));
  for(var round=0; round<ROUNDS; round++){
    var curve = lifeCurveFromLandCentripetal(waypoints);
    var bad = null, badFix = null, badSeg = 0;
    for(var s=1; s<SAMPLES; s++){
      var st = s/SAMPLES;
      var p = curve.getPointAt(st);
      var h = terrainH(p.x,p.z);
      if(h > HILL_MAX){
        bad=st; badFix=lifePushToLowGround(p.x,p.z,HILL_MAX);
      }else if(h < 2){

        if(lifeCausewayY(p.x,p.z) != null || lifeBridgeY(p.x,p.z) != null) continue;
        bad=st; badFix=lifePushToLand(p.x,p.z);
      }
      if(bad!==null){
        badSeg = Math.max(1, Math.min(waypoints.length-1, Math.round(st*(waypoints.length-1))));
        break;
      }
    }
    if(bad===null) break;
    waypoints.splice(badSeg, 0, badFix);
  }
  return lifeCurveFromLandCentripetal(waypoints);
}

var LIFE_ORD_T = 0;
var lifeOrdHullParts = [
  { geo: new THREE.CylinderGeometry(0.34*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 1.15*LIFE_PEOPLE_SCALE, 6), color: 0x2d5c3a },
  { geo: new THREE.BoxGeometry(0.42*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE).translate(0, 0.76*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 },
  /* shield, held at the left */
  { geo: new THREE.BoxGeometry(0.06*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(-0.32*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 },
  { geo: new THREE.BoxGeometry(0.04*LIFE_PEOPLE_SCALE, 0.42*LIFE_PEOPLE_SCALE, 0.28*LIFE_PEOPLE_SCALE).translate(-0.33*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0), color: 0x2d5c3a },
  /* sword, sheathed at the right hip */
  { geo: new THREE.CylinderGeometry(0.035*LIFE_PEOPLE_SCALE, 0.035*LIFE_PEOPLE_SCALE, 0.6*LIFE_PEOPLE_SCALE, 5).translate(0.28*LIFE_PEOPLE_SCALE, 0.35*LIFE_PEOPLE_SCALE, 0), color: 0xb8b8b0 },
  { geo: new THREE.CylinderGeometry(0.05*LIFE_PEOPLE_SCALE, 0.05*LIFE_PEOPLE_SCALE, 0.10*LIFE_PEOPLE_SCALE, 5).translate(0.28*LIFE_PEOPLE_SCALE, 0.62*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 }
];
var lifeOrdGeo = lifeMergeGeoms(lifeOrdHullParts);

function lifeCantonTerrace(name, x, z){
  var f = CANTON_FACES[name]; if(!f || !f.levels || !f.levels.length) return null;
  var c = CIDX[name]; if(!c) return null;
  var q = Math.max(Math.abs(x-c.x), Math.abs(z-c.z));
  for(var i=f.levels.length-1; i>=0; i--) if(q <= f.levels[i].outer) return f.levels[i];
  return null;
}
var LIFE_ORD_POSTS = [];   /* {x,z,ry,radius,officer} — fixed-post ordinators */
(function(){

  ['Fortress','Palace'].forEach(function(nm){
    var c = CIDX[nm]; if(!c) return;
    var lv0 = (CANTON_FACES[nm] && CANTON_FACES[nm].levels) ? CANTON_FACES[nm].levels[0] : null;

    var walkHw = lv0 ? (lv0.outer - 4.0) : c.r*1.05;
    for(var i=0;i<25;i++){
      var a = (i/25)*Math.PI*2;
      var rr2 = squareEdgeHw(walkHw, a);
      var ex = c.x + Math.cos(a)*rr2, ez = c.z + Math.sin(a)*rr2;
      var tr = lifeCantonTerrace(nm, ex, ez);
      LIFE_ORD_POSTS.push({ x:ex, z:ez, ry:a+Math.PI, radius:5, officer: (i%5===0),
                            y: tr ? tr.y : cantonHeightAt(nm, ex, ez) });
    }
  });

  var marketCenters = [];
  DISTRICTS.forEach(function(d){ if(d.type==='market') marketCenters.push({pt:lifePolyCentroid(d.poly), y:null}); });
  var marketCanton = CIDX['Market'];
  if(marketCanton) marketCenters.push({pt:[marketCanton.x, marketCanton.z], y:cantonEdgeY('Market')});
  marketCenters.forEach(function(mc){
    for(var i=0;i<5;i++){
      var a2 = (i/5)*Math.PI*2;
      LIFE_ORD_POSTS.push({ x:mc.pt[0]+Math.cos(a2)*14, z:mc.pt[1]+Math.sin(a2)*14, ry:a2, radius:9, officer:(i===0), y:mc.y });
    }
  });

  for(var s=0;s<12;s++){
    var sx=0, sz=0, tries=0, ok=false;
    while(tries<40 && !ok){
      sx = rr(-CITY_LIM*0.85, CITY_LIM*0.85); sz = rr(-CITY_LIM*0.85, CITY_LIM*0.85);
      ok = terrainH(sx,sz) >= 4 && !inRiver(sx,sz,20);
      tries++;
    }
    for(var m=0;m<5;m++){
      var a3 = (m/5)*Math.PI*2;
      LIFE_ORD_POSTS.push({ x:sx+Math.cos(a3)*6, z:sz+Math.sin(a3)*6, ry:a3, radius:18, officer:(m===0) });
    }
  }

  var guardSpots = [[951.58,-939.26]];
  CAUSEWAYS.forEach(function(cw){ guardSpots.push(shoreAt(cw.s)); });
  guardSpots.forEach(function(gp){
    [-1,1].forEach(function(side){
      LIFE_ORD_POSTS.push({ x:gp[0]+side*3, z:gp[1]+side*1.5, ry:0, radius:2, officer:false });
    });
  });

  (window._newTowers||[]).forEach(function(t){
    if(!t.perch) return;
    var sp = loc(t.x, t.z, t.perch.side*(t.perch.hw-2.1), 0, t.ry);
    LIFE_ORD_POSTS.push({ x:sp[0], z:sp[1], ry: t.ry + t.perch.side*Math.PI/2,
                          radius:1.6, officer:false, y:t.perch.y, towerSentry:true });
  });
})();

var LIFE_ORD_RING_N = 20;

var LIFE_ORD_RING_GROUPS = 4, LIFE_ORD_RING_PER_GROUP = LIFE_ORD_RING_N/4;
var LIFE_ORD_SQUAD_LAT = [-2.2, -0.9, 0.4, 1.7, 2.9];
var LIFE_ORD_RING_CURVE = (function(){
  var fort = CIDX['Fortress']; if(!fort) return null;

  var cw = null;
  for(var i=0;i<CAUSEWAYS.length;i++) if(CAUSEWAYS[i].c === fort){ cw = CAUSEWAYS[i]; break; }
  var gx, gz;
  if(cw){
    var land = shoreIn(cw.s, 26);
    var dx = land[0]-fort.x, dz = land[1]-fort.z, L = Math.hypot(dx,dz) || 1;
    gx = fort.x + dx/L*fort.r*0.96; gz = fort.z + dz/L*fort.r*0.96;
  }else{
    var a0 = Math.atan2(-939.26 - fort.z, 951.58 - fort.x);
    gx = fort.x + Math.cos(a0)*fort.r*1.05; gz = fort.z + Math.sin(a0)*fort.r*1.05;
  }
  return lifeCartBuildLeg(gx, gz, 951.58, -939.26);
})();
var LIFE_ORD_RING_LEN = LIFE_ORD_RING_CURVE ? LIFE_ORD_RING_CURVE.getLength() : 0;
var LIFE_ORD_RING_DUR = Math.max(20, LIFE_ORD_RING_LEN/3.0);

/* ==== the Fortress garrison: boundary patrol + daytime training drills ==== */
var LIFE_FORT_SQ = [[1,-1],[1,1],[-1,1],[-1,-1]];   /* the square circuit's corners, in march order */
var LIFE_FORT_PATROL_SQUADS = 2, LIFE_FORT_PATROL_PER = 4;
var LIFE_FORT_PATROL_N = LIFE_FORT_PATROL_SQUADS * LIFE_FORT_PATROL_PER;
var LIFE_FORT_PATROL_LAT = [-3.1, -1.0, 1.0, 3.2];  /* abreast across the lane, deliberately uneven */
var LIFE_FORT_PATROL_SPEED = 4.2;                   /* world units/second along the boundary */
var LIFE_FORT_DRILL_GROUPS = 2, LIFE_FORT_DRILL_PER = 6;
var LIFE_FORT_DRILL_N = LIFE_FORT_DRILL_GROUPS * LIFE_FORT_DRILL_PER;
var LIFE_FORT_HOUR_OPEN = 7, LIFE_FORT_HOUR_CLOSE = 18;   /* daylight, same sunrise/sunset hours the shopkeeper + quarry cycles in this file use */

var LIFE_FORT_BOUNDARY = (function(){
  var c = CIDX['Fortress']; if(!c) return null;
  var f = CANTON_FACES['Fortress']; if(!f || !f.levels || f.levels.length < 2) return null;
  var lv = f.levels[1];                    /* the rampart terrace on top of tier 0 */
  return { cx:c.x, cz:c.z, hw: lv.outer - 6.5, y: lv.y };   /* a lane just inboard of the terrace lip */
})();
var LIFE_FORT_DRILLS = [];
(function(){
  var c = CIDX['Fortress']; if(!c) return;
  var f = CANTON_FACES['Fortress']; if(!f || !f.levels || f.levels.length < 2) return;
  var lv = f.levels[1];                       /* the terrace on top of tier 0 */
  var rMid = (lv.hw + lv.outer) * 0.5;        /* mid of the walkable band: wall foot -> outer lip */

  [[1,0],[0,1]].forEach(function(face, g){
    var nx = face[0], nz = face[1];           /* outward face normal */
    var tx = -nz, tz = nx;                    /* along the face */
    var cx = c.x + nx*rMid, cz = c.z + nz*rMid;
    var outAng = Math.atan2(nx, nz);
    if(g === 0){

      for(var p=0;p<3;p++){
        var ox = (p-1)*9.0;
        for(var s=-1; s<=1; s+=2){
          LIFE_FORT_DRILLS.push({
            x: cx + tx*ox + nx*s*2.4, z: cz + tz*ox + nz*s*2.4,
            y: lv.y, kind:'spar', pairId: p,
            pairDx: -nx*s, pairDz: -nz*s,     /* the shared line: straight at the partner */
            ry: outAng + (s>0 ? Math.PI : 0)
          });
        }
      }
    }else{

      for(var k=0;k<5;k++){
        LIFE_FORT_DRILLS.push({
          x: cx + tx*(k-2)*3.6 - nx*2.0, z: cz + tz*(k-2)*3.6 - nz*2.0,
          y: lv.y, kind:'rank', pairId: 9, rank: k,
          pairDx: nx, pairDz: nz, ry: outAng
        });
      }
      LIFE_FORT_DRILLS.push({
        x: cx + nx*7.0, z: cz + nz*7.0, y: lv.y, kind:'instructor', pairId: 9, rank: 0,
        pairDx: -nx, pairDz: -nz, tx: tx, tz: tz, ry: outAng + Math.PI
      });
    }
  });
})();

var LIFE_ORD_N = LIFE_ORD_POSTS.length + LIFE_ORD_RING_N + LIFE_FORT_PATROL_N + LIFE_FORT_DRILL_N + LIFE_CG_CREW_N;
var lifeOrdMesh = new THREE.InstancedMesh(lifeOrdGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_ORD_N);
lifeOrdMesh.userData.life = true; lifeOrdMesh.userData.inspectLabel = 'Ordinator';
lifeOrdMesh.frustumCulled = false;
scene.add(lifeOrdMesh);
window._ordinators = { posts: LIFE_ORD_POSTS.length, ring: LIFE_ORD_RING_N, total: LIFE_ORD_N,
  towerSentries: LIFE_ORD_POSTS.filter(function(p){ return p.towerSentry; }).length,
  ringCurve: LIFE_ORD_RING_CURVE, ringLen: Math.round(LIFE_ORD_RING_LEN),

  fortPatrol: LIFE_FORT_PATROL_N, fortDrills: LIFE_FORT_DRILL_N, cgCrew: LIFE_CG_CREW_N,
  fortBoundary: LIFE_FORT_BOUNDARY, fortDrillPosts: LIFE_FORT_DRILLS,
  fortPatrolBase: LIFE_ORD_POSTS.length + LIFE_ORD_RING_N,
  drillsOn: function(){ var h = dayNightHour(); return h >= LIFE_FORT_HOUR_OPEN && h < LIFE_FORT_HOUR_CLOSE; } };   /* diagnostic: the shared patrol curve, so its route can be sampled from outside */

var lifeOrdTmpPos = new THREE.Vector3(), lifeOrdTmpDir = new THREE.Vector3();
var lifeOrdTmpQuat = new THREE.Quaternion(), lifeOrdTmpMat = new THREE.Matrix4();
var lifeOrdTmpScale1 = new THREE.Vector3(1,1,1);
var lifeOrdTmpScale0 = new THREE.Vector3(0,0,0);   /* the hide-an-instance scale the arena/clergy already use */
function updateOrdinators(dt){
  LIFE_ORD_T += dt;
  LIFE_ORD_POSTS.forEach(function(p, idx){
    if(!lifeLodDue(p.x, p.z, idx)) return;
    var ang = LIFE_ORD_T*0.35 + idx*2.3;
    var opX = p.x + Math.sin(ang)*p.radius*0.3, opZ = p.z + Math.cos(ang*0.6)*p.radius*0.3;
    var opBaseY = (p.y != null) ? p.y : lifeGroundY(opX, opZ);
    lifeOrdTmpPos.set(opX, Math.max(LIFE_Y, opBaseY + 0.15), opZ);
    lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, p.ry + Math.sin(ang*0.4)*0.3);
    lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
    lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);

    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
  });
  var ringBase = LIFE_ORD_POSTS.length;
  if(LIFE_ORD_RING_CURVE){
    for(var i=0;i<LIFE_ORD_RING_N;i++){

      var g = Math.floor(i/LIFE_ORD_RING_PER_GROUP), m = i%LIFE_ORD_RING_PER_GROUP;

      var phase = g*(1/LIFE_ORD_RING_GROUPS) + m*(3.0/Math.max(1, LIFE_ORD_RING_LEN));
      var cyc = ((LIFE_ORD_T/LIFE_ORD_RING_DUR) + phase) % 2;
      var forward = cyc <= 1;
      var tt = forward ? cyc : 2-cyc;
      var t = Math.max(0.005, Math.min(0.995, tt*tt*(3-2*tt)));
      LIFE_ORD_RING_CURVE.getPointAt(t, lifeOrdTmpPos);

      LIFE_ORD_RING_CURVE.getTangentAt(t, lifeOrdTmpDir);
      var perpL = Math.hypot(lifeOrdTmpDir.x, lifeOrdTmpDir.z) || 1;
      var lat = LIFE_ORD_SQUAD_LAT[m];
      lifeOrdTmpPos.x += (-lifeOrdTmpDir.z/perpL)*lat;
      lifeOrdTmpPos.z += ( lifeOrdTmpDir.x/perpL)*lat;

      lifeOrdTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifeOrdTmpPos.x, lifeOrdTmpPos.z) + 0.15);
      var yaw = Math.atan2(lifeOrdTmpDir.x*(forward?1:-1), lifeOrdTmpDir.z*(forward?1:-1));
      lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
      lifeOrdMesh.setMatrixAt(ringBase+i, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+ringBase+i, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
    }
  }
  updateFortGarrison(ringBase + LIFE_ORD_RING_N);
  updateCGuardCrew(ringBase + LIFE_ORD_RING_N + LIFE_FORT_PATROL_N + LIFE_FORT_DRILL_N);
  lifeOrdMesh.instanceMatrix.needsUpdate = true;
}

function updateFortGarrison(base){
  var t = LIFE_ORD_T, idx = base, B = LIFE_FORT_BOUNDARY, i, m;
  /* ==== the boundary patrol: two squads, four abreast, marching the ==== */
  if(B){
    var per = 2*B.hw;                                  /* length of one side */
    var u = (t*LIFE_FORT_PATROL_SPEED/per) % 4;        /* laps measured in sides */
    for(var g=0; g<LIFE_FORT_PATROL_SQUADS; g++){
      var ug = (u + g*(4/LIFE_FORT_PATROL_SQUADS)) % 4;
      var s = Math.floor(ug), f = ug - s;
      var A = LIFE_FORT_SQ[s], C = LIFE_FORT_SQ[(s+1)%4];
      var ax = B.cx + A[0]*B.hw, az = B.cz + A[1]*B.hw;
      var cx = B.cx + C[0]*B.hw, cz = B.cz + C[1]*B.hw;
      var dx = cx-ax, dz = cz-az, L = Math.hypot(dx,dz) || 1;
      dx /= L; dz /= L;
      var px = -dz, pz = dx;                            /* one of the two normals... */
      var mx = ax + (cx-ax)*0.5, mz = az + (cz-az)*0.5;
      if((B.cx-mx)*px + (B.cz-mz)*pz < 0){ px = -px; pz = -pz; }   /* ...the one pointing inboard */
      var yaw = Math.atan2(dx, dz);
      for(m=0; m<LIFE_FORT_PATROL_PER; m++){

        var along = f*L - m*0.5;
        lifeOrdTmpPos.set(ax + dx*along + px*LIFE_FORT_PATROL_LAT[m],
                          B.y + 0.15,
                          az + dz*along + pz*LIFE_FORT_PATROL_LAT[m]);
        lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, yaw + Math.sin(t*1.7 + m)*0.06);
        lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
        lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
        if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
        idx++;
      }
    }
  }else{
    for(i=0;i<LIFE_FORT_PATROL_N;i++){
      lifeOrdTmpMat.compose(lifeOrdTmpPos.set(0,0,0), lifeOrdTmpQuat, lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, 0, 0, 0, false);
      idx++;
    }
  }
  /* ==== the drills, daylight only. Off the shared clock, not a private ==== */
  var on = (typeof dayNightHour === 'function');
  if(on){ var hr = dayNightHour(); on = (hr >= LIFE_FORT_HOUR_OPEN && hr < LIFE_FORT_HOUR_CLOSE); }
  for(i=0;i<LIFE_FORT_DRILL_N;i++){
    var d = LIFE_FORT_DRILLS[i];
    if(!on || !d){
      lifeOrdTmpMat.compose(lifeOrdTmpPos.set(0,0,0), lifeOrdTmpQuat, lifeOrdTmpScale0);
      lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, 0, 0, 0, false);
      idx++; continue;
    }
    var dxp = 0, dzp = 0, dyp = 0, dyaw = d.ry;
    if(d.kind === 'spar'){

      var lunge = Math.sin(t*2.2 + d.pairId*10)*0.5 + 0.5;
      dxp = d.pairDx*lunge*1.6; dzp = d.pairDz*lunge*1.6;
      dyaw = Math.atan2(d.pairDx, d.pairDz) + Math.sin(t*4 + i)*0.2;
    }else if(d.kind === 'rank'){

      var beat = Math.sin(t*1.4 + d.pairId*10)*0.5 + 0.5;
      dxp = d.pairDx*beat*2.2; dzp = d.pairDz*beat*2.2;
      dyp = Math.max(0, Math.sin(t*2.8 + d.pairId*10))*0.22;
      dyaw = d.ry + Math.sin(t*0.45)*0.5;               /* the whole rank turns together */
    }else{
      /* the instructor: paces the front of the rank, facing it. */
      var pace = Math.sin(t*0.55);
      dxp = (d.tx||0)*pace*4.0; dzp = (d.tz||0)*pace*4.0;
      dyaw = d.ry + Math.sin(t*0.9)*0.25;
    }
    lifeOrdTmpPos.set(d.x + dxp, d.y + 0.15 + dyp, d.z + dzp);
    lifeOrdTmpQuat.setFromAxisAngle(LIFE_UP, dyaw);
    lifeOrdTmpMat.compose(lifeOrdTmpPos, lifeOrdTmpQuat, lifeOrdTmpScale1);
    lifeOrdMesh.setMatrixAt(idx, lifeOrdTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_ORD_BASE+idx, lifeOrdTmpPos.x, lifeOrdTmpPos.y+2.1, lifeOrdTmpPos.z);
    idx++;
  }
}

/* ==== citizens: priests & templars ==== */
var LIFE_CLERGY_T = 0;
var lifeClergyHullParts = [
  { geo: new THREE.CylinderGeometry(0.26*LIFE_PEOPLE_SCALE, 0.46*LIFE_PEOPLE_SCALE, 1.3*LIFE_PEOPLE_SCALE, 7), color: 0x6b1f3a },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.85*LIFE_PEOPLE_SCALE, 0), color: LIFE_SKIN },
  { geo: new THREE.ConeGeometry(0.30*LIFE_PEOPLE_SCALE, 0.38*LIFE_PEOPLE_SCALE, 6).translate(0, 1.16*LIFE_PEOPLE_SCALE, 0), color: 0xc9a227 }
];
var lifeClergyGeo = lifeMergeGeoms(lifeClergyHullParts);

var LIFE_CLERGY_POSTS = [];   /* shrine priests + templars — fixed posts, idle-wander */
LIFE_SHRINE_STOPS.forEach(function(s){
  LIFE_CLERGY_POSTS.push({ x:s.x, z:s.z, ry:s.ry, radius:4, role:'priest' });
  [-1,1].forEach(function(side){
    LIFE_CLERGY_POSTS.push({ x:s.x+side*3, z:s.z, ry:s.ry, radius:2, role:'templar' });
  });
});
(function(){

  var tp = CPIERS.filter(function(p){ return p.canton==='Temple'; })[0];
  if(tp){
    [-1,1].forEach(function(side){
      LIFE_CLERGY_POSTS.push({ x:tp.x1+side*3, z:tp.z1, ry:tp.ry, radius:2, role:'templar' });
    });
  }
  if(TEMPLE_ALTAR){

    var templeTop = CANTON_TOPS['Temple'];
    var templarY = templeTop ? templeTop.y : TEMPLE_ALTAR.y;
    [-1,1].forEach(function(side){
      LIFE_CLERGY_POSTS.push({ x:TEMPLE_ALTAR.doorX+side*3, z:TEMPLE_ALTAR.doorZ, ry:TEMPLE_ALTAR.ry, radius:2, role:'templar', y:templarY });
    });
  }
})();

var LIFE_CLERGY_N = LIFE_CLERGY_POSTS.length + 2;
var LIFE_GOAT_IDX = LIFE_CLERGY_POSTS.length + 1;
var lifeClergyMesh = new THREE.InstancedMesh(lifeClergyGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_CLERGY_N);
lifeClergyMesh.userData.life = true; lifeClergyMesh.userData.inspectLabel = 'Temple clergy';
lifeClergyMesh.frustumCulled = false;
scene.add(lifeClergyMesh);
(function(){
  var white = new THREE.Color(0xffffff), wool = new THREE.Color(0xd8cfae);
  for(var i=0;i<LIFE_CLERGY_N;i++) lifeClergyMesh.setColorAt(i, i===LIFE_GOAT_IDX ? wool : white);
  lifeClergyMesh.instanceColor.needsUpdate = true;
})();
window._clergy = { posts: LIFE_CLERGY_POSTS.length, total: LIFE_CLERGY_N, altar: TEMPLE_ALTAR, goatIdx: LIFE_GOAT_IDX };   /* diagnostic */

var lifeClergyTmpPos = new THREE.Vector3(), lifeClergyTmpQuat = new THREE.Quaternion();
var lifeClergyTmpMat = new THREE.Matrix4(), lifeClergyTmpScale1 = new THREE.Vector3(1,1,1);
var lifeClergyTmpScale0 = new THREE.Vector3(0,0,0), lifeClergyTmpPos2Goat = new THREE.Vector3();
var lifeGoatScale = new THREE.Vector3(0.55, 0.32, 0.85);   /* low, wide, long — an abstracted small animal */

var LIFE_HIGHPRIEST_REST = (function(){
  var templeY = cantonEdgeY('Temple');
  var tp = CPIERS.filter(function(p){ return p.canton==='Temple'; })[0];
  if(tp) return { x:tp.x1, z:tp.z1, y:Math.max(LIFE_Y, (templeY!=null?templeY:terrainH(tp.x1,tp.z1))+0.15), ry:tp.ry };
  if(TEMPLE_ALTAR) return { x:TEMPLE_ALTAR.doorX, z:TEMPLE_ALTAR.doorZ, y:Math.max(LIFE_Y, (templeY!=null?templeY:terrainH(TEMPLE_ALTAR.doorX,TEMPLE_ALTAR.doorZ))+0.15), ry:TEMPLE_ALTAR.ry };
  return { x:0, z:0, y:Math.max(LIFE_Y, terrainH(0,0)+0.15), ry:0 };
})();
var LIFE_HIGHPRIEST = { state:'resting', stateT:0, riseFor: 6, sacrificedToday: false };
window._highpriest = LIFE_HIGHPRIEST;   /* diagnostic */

function updateClergy(dt){
  LIFE_CLERGY_T += dt;
  LIFE_CLERGY_POSTS.forEach(function(p, idx){
    var ang = LIFE_CLERGY_T*0.3 + idx*1.9;
    var cpX = p.x + Math.sin(ang)*p.radius*0.3, cpZ = p.z + Math.cos(ang*0.6)*p.radius*0.3;
    var cpBaseY = (p.y != null) ? p.y : lifeGroundY(cpX, cpZ);
    lifeClergyTmpPos.set(cpX, Math.max(LIFE_Y, cpBaseY + 0.15), cpZ);
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, p.ry + Math.sin(ang*0.4)*0.25);
    lifeClergyTmpMat.compose(lifeClergyTmpPos, lifeClergyTmpQuat, lifeClergyTmpScale1);
    lifeClergyMesh.setMatrixAt(idx, lifeClergyTmpMat);
  });
  /* the high priest, last slot */
  var hp = LIFE_HIGHPRIEST;
  hp.stateT += dt;
  var hpIdx = LIFE_CLERGY_POSTS.length;
  if(hp.state === 'resting'){
    lifeClergyTmpPos.set(LIFE_HIGHPRIEST_REST.x, LIFE_HIGHPRIEST_REST.y, LIFE_HIGHPRIEST_REST.z);
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, LIFE_HIGHPRIEST_REST.ry);

    var hpHour = dayNightHour();
    if(hpHour < 6) hp.sacrificedToday = false;
    if(hpHour >= 12 && !hp.sacrificedToday && TEMPLE_ALTAR){
      hp.sacrificedToday = true;
      hp.state = 'rising'; hp.stateT = 0;
    }
  }else if(hp.state === 'rising' || hp.state === 'descending'){
    var raw = Math.min(1, hp.stateT/hp.riseFor);
    var t = raw*raw*(3-2*raw);
    var tt = (hp.state === 'rising') ? t : (1-t);
    lifeClergyTmpPos.set(
      LIFE_HIGHPRIEST_REST.x + (TEMPLE_ALTAR.x-LIFE_HIGHPRIEST_REST.x)*tt,
      LIFE_HIGHPRIEST_REST.y + (TEMPLE_ALTAR.y-LIFE_HIGHPRIEST_REST.y)*tt,
      LIFE_HIGHPRIEST_REST.z + (TEMPLE_ALTAR.z-LIFE_HIGHPRIEST_REST.z)*tt
    );
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, TEMPLE_ALTAR.ry);
    if(raw >= 1){
      if(hp.state === 'rising'){ hp.state = 'sacrifice'; hp.stateT = 0; hp.sacrificeFor = rr(10,18); }
      else{ hp.state = 'resting'; hp.stateT = 0; }
    }
  }else if(hp.state === 'sacrifice'){
    lifeClergyTmpPos.set(TEMPLE_ALTAR.x, TEMPLE_ALTAR.y, TEMPLE_ALTAR.z);
    var bob = Math.sin(hp.stateT*2.2)*0.15;
    lifeClergyTmpPos.y += bob;
    lifeClergyTmpQuat.setFromAxisAngle(LIFE_UP, TEMPLE_ALTAR.ry + Math.sin(hp.stateT*0.8)*0.3);
    if(hp.stateT >= hp.sacrificeFor){ hp.state = 'descending'; hp.stateT = 0; }
  }
  lifeClergyTmpMat.compose(lifeClergyTmpPos, lifeClergyTmpQuat, lifeClergyTmpScale1);
  lifeClergyMesh.setMatrixAt(hpIdx, lifeClergyTmpMat);

  if(hp.state === 'sacrifice'){
    lifeClergyTmpPos2Goat.set(TEMPLE_ALTAR.x + Math.cos(TEMPLE_ALTAR.ry+Math.PI/2)*1.4,
      TEMPLE_ALTAR.y - 0.9, TEMPLE_ALTAR.z + Math.sin(TEMPLE_ALTAR.ry+Math.PI/2)*1.4);
    lifeClergyTmpMat.compose(lifeClergyTmpPos2Goat, lifeClergyTmpQuat, lifeGoatScale);
  }else{
    lifeClergyTmpMat.compose(lifeClergyTmpPos2Goat.set(0,0,0), lifeClergyTmpQuat, lifeClergyTmpScale0);
  }
  lifeClergyMesh.setMatrixAt(LIFE_GOAT_IDX, lifeClergyTmpMat);
  lifeClergyMesh.instanceMatrix.needsUpdate = true;
}

/* ==== citizens: guild workers ==== */
var lifeGuildHullParts = [

  { geo: new THREE.CylinderGeometry(0.30*LIFE_PEOPLE_SCALE, 0.36*LIFE_PEOPLE_SCALE, 1.05*LIFE_PEOPLE_SCALE, 6), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE, 0.40*LIFE_PEOPLE_SCALE).translate(0, 0.72*LIFE_PEOPLE_SCALE, 0), color: 0xffffff },

  { geo: new THREE.BoxGeometry(0.10*LIFE_PEOPLE_SCALE, 0.55*LIFE_PEOPLE_SCALE, 0.10*LIFE_PEOPLE_SCALE).translate(0.28*LIFE_PEOPLE_SCALE, 0.95*LIFE_PEOPLE_SCALE, 0), color: 0xffffff }
];
var lifeGuildGeo = lifeMergeGeoms(lifeGuildHullParts);
var LIFE_GUILD_N = GUILD_WORK_POSTS.length;
var lifeGuildMesh = new THREE.InstancedMesh(lifeGuildGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), Math.max(1, LIFE_GUILD_N));
lifeGuildMesh.userData.life = true; lifeGuildMesh.userData.inspectLabel = 'Guild worker';
lifeGuildMesh.frustumCulled = false;
scene.add(lifeGuildMesh);
(function(){

  var ROLE_COL = {
    smith: new THREE.Color(0x4a3b32),
    tender: new THREE.Color(pick(JADEC)),
    carpenter: new THREE.Color(shade(TRUNKC[0], -0.05)),
    merchant: new THREE.Color(BANNERC[4])
  };
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var col = ROLE_COL[p.role] || new THREE.Color(pick([BANNERC[0],BANNERC[1]]));   /* warrior, and any future role */
    lifeGuildMesh.setColorAt(idx, col);
  });
  if(lifeGuildMesh.instanceColor) lifeGuildMesh.instanceColor.needsUpdate = true;
})();
window._guildWorkers = { total: LIFE_GUILD_N, roles: (function(){
  var r={}; GUILD_WORK_POSTS.forEach(function(p){ r[p.role]=(r[p.role]||0)+1; }); return r;
})() };   /* diagnostic */

var LIFE_GUILD_T = 0;
var lifeGuildTmpPos = new THREE.Vector3(), lifeGuildTmpQuat = new THREE.Quaternion();
var lifeGuildTmpMat = new THREE.Matrix4(), lifeGuildTmpScale1 = new THREE.Vector3(1,1,1);
function updateGuildWorkers(dt){
  LIFE_GUILD_T += dt;
  var t = LIFE_GUILD_T;
  GUILD_WORK_POSTS.forEach(function(p, idx){
    var px, pz, py, yaw;
    if(p.role === 'smith'){

      var swing = Math.sin(t*5.5 + idx*1.7);
      px = p.x + Math.sin(t*0.6+idx)*p.radius*0.3;
      pz = p.z + Math.cos(t*0.4+idx)*p.radius*0.3;
      py = p.y + Math.max(0, swing)*0.5;
      yaw = (p.ry||0) + swing*0.35;
    }else if(p.role === 'warrior'){

      var lunge = Math.sin(t*2.2 + (p.pairId||0)*10)*0.5 + 0.5;
      px = p.x + p.pairDx*lunge*1.6;
      pz = p.z + p.pairDz*lunge*1.6;
      py = p.y;
      yaw = Math.atan2(p.pairDx, p.pairDz) + Math.sin(t*4+idx)*0.2;
    }else if(p.role === 'carpenter'){

      var stroke = Math.sin(t*2.6 + (p.pairId||0)*10);
      px = p.x + p.pairDx*stroke*0.55;
      pz = p.z + p.pairDz*stroke*0.55;
      py = p.y + Math.max(0, Math.sin(t*2.6*2 + (p.pairId||0)*10))*0.10;   /* a small dip on the down-stroke */
      yaw = p.ry||0;
    }else if(p.role === 'merchant'){

      var sweep = Math.sin(t*0.5 + idx*1.9);
      px = p.x + Math.sin(t*0.3+idx)*p.radius*0.25;
      pz = p.z + Math.cos(t*0.3+idx)*p.radius*0.25;
      py = p.y + Math.max(0, Math.sin(t*1.2+idx))*0.30;
      yaw = (p.ry||0) + sweep*0.9;
    }else{

      var ang = t*0.35 + idx*1.3;
      px = p.x + Math.sin(ang)*p.radius*0.5;
      pz = p.z + Math.cos(ang*0.6)*p.radius*0.5;
      py = p.y + Math.max(0, Math.sin(t*1.4+idx))*0.35;
      yaw = (p.ry||0) + Math.sin(ang*0.4)*0.4;
    }
    lifeGuildTmpPos.set(px, py, pz);
    lifeGuildTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeGuildTmpMat.compose(lifeGuildTmpPos, lifeGuildTmpQuat, lifeGuildTmpScale1);
    lifeGuildMesh.setMatrixAt(idx, lifeGuildTmpMat);
  });
  lifeGuildMesh.instanceMatrix.needsUpdate = true;
}

/* ==== citizens: merchant caravans ==== */
var lifeCaravanParts = [
  { geo: new THREE.BoxGeometry(3.2,1.6,4.5).translate(0,1.0,-2.5), color: 0x6b4a2e },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-1.3), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.CylinderGeometry(0.9,0.9,0.3,8).rotateZ(Math.PI/2).translate(-1.6,0.9,-3.7), color: 0x3a2a1a },
  { geo: new THREE.BoxGeometry(1.2,1.0,1.2).translate(0.8,2.3,-2.0), color: 0x5a4a38 },
  { geo: new THREE.BoxGeometry(1.0,0.9,1.0).translate(-0.7,2.2,-3.0), color: 0x6a5642 },

  { geo: new THREE.CylinderGeometry(0.9,1.1,2.6,8).rotateX(Math.PI/2).translate(0,1.4,2.5), color: 0x7a5c3a },
  { geo: new THREE.BoxGeometry(0.9,0.9,1.1).translate(0,1.8,4.0), color: 0x7a5c3a },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,1.6), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(0.5,0.65,3.3), color: 0x5a4028 },
  { geo: new THREE.CylinderGeometry(0.22,0.22,1.3,5).translate(-0.5,0.65,3.3), color: 0x5a4028 },
  /* the merchant driver — blue, on the cart's own seat, with a broad hat */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(0,2.4,-1.0), color: 0x2b4a7a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(0,3.0,-1.0), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.5,0.5,0.12,8).translate(0,3.25,-1.0), color: 0x1f3a63 },
  /* 2 guards, plain grey mail, flanking on foot */
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(2.4,1.6,-2.5), color: LIFE_SKIN },
  { geo: new THREE.CylinderGeometry(0.3,0.36,1.0,6).translate(-2.4,1.0,-2.5), color: 0x6a6a6a },
  { geo: new THREE.BoxGeometry(0.4,0.4,0.4).translate(-2.4,1.6,-2.5), color: LIFE_SKIN }
];
var lifeCaravanGeo = lifeMergeGeoms(lifeCaravanParts);

var LIFE_STRIDER_CAR_SLOTS = 60;
var LIFE_STRIDER_CAR_BASE = 90;
var LIFE_CARAVAN_N = LIFE_STRIDER_CAR_BASE;
var lifeCaravanMesh = new THREE.InstancedMesh(lifeCaravanGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_CARAVAN_N);
lifeCaravanMesh.userData.life = true; lifeCaravanMesh.userData.inspectLabel = 'Caravan';
lifeCaravanMesh.frustumCulled = false;
scene.add(lifeCaravanMesh);

var LIFE_CARAVAN_SPAWN = { x: -3340, z: 1590 };

var LIFE_CARAVAN_HARBOR = PIERS.map(function(p){ return { x:p.x0, z:p.z0, ry: Math.atan2(p.x1-p.x0, p.z1-p.z0) }; });
var LIFE_CARAVAN_RIVER = LIFE_RBARGE_DOCKS.map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_MARKET = LIFE_DOORS.filter(function(d){ return d.cat === 'market'; }).map(function(d){ return { x:d.x, z:d.z, ry:d.ry }; });
var LIFE_CARAVAN_WAREHOUSE = DIST_WAREHOUSE.map(function(d){
  var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; }); cx/=d.poly.length; cz/=d.poly.length;
  return { x:cx, z:cz, ry:0 };
});

function lifeCaravanRoadPool(list){
  return (list||[]).filter(function(p){
    return lifeRoadReachable(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, p.x, p.z);
  }).map(function(p){ return { x:p.x, z:p.z, ry:p.ry||0 }; });
}
var LIFE_CARAVAN_FISHDOCK = lifeCaravanRoadPool(typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS : []);
var LIFE_CARAVAN_MINE     = lifeCaravanRoadPool(typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS : []);
var LIFE_CARAVAN_QUARRY   = lifeCaravanRoadPool(typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS : []);
var LIFE_CARAVAN_TAVERN   = lifeCaravanRoadPool(LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }));
function lifeCaravanPool(cat){
  if(cat === 'harbor') return LIFE_CARAVAN_HARBOR;
  if(cat === 'river') return LIFE_CARAVAN_RIVER;
  if(cat === 'market') return LIFE_CARAVAN_MARKET;
  if(cat === 'fishdock') return LIFE_CARAVAN_FISHDOCK;
  if(cat === 'mine') return LIFE_CARAVAN_MINE;
  if(cat === 'quarry') return LIFE_CARAVAN_QUARRY;
  if(cat === 'tavern') return LIFE_CARAVAN_TAVERN;
  return LIFE_CARAVAN_WAREHOUSE;
}
var LIFE_CARAVAN_CATS = ['harbor','river','market','warehouse','fishdock','mine','quarry','tavern'];

window._caravanDests = {
  cats: LIFE_CARAVAN_CATS,
  pools: { harbor: LIFE_CARAVAN_HARBOR.length, river: LIFE_CARAVAN_RIVER.length,
           market: LIFE_CARAVAN_MARKET.length, warehouse: LIFE_CARAVAN_WAREHOUSE.length,
           fishdock: LIFE_CARAVAN_FISHDOCK.length, mine: LIFE_CARAVAN_MINE.length,
           quarry: LIFE_CARAVAN_QUARRY.length, tavern: LIFE_CARAVAN_TAVERN.length },
  offered: { fishdock: (typeof LIFE_FISH_CART_STOPS !== 'undefined' ? LIFE_FISH_CART_STOPS.length : 0),
             mine: (typeof MINE_CART_STOPS !== 'undefined' ? MINE_CART_STOPS.length : 0),
             quarry: (typeof QUARRY_CART_STOPS !== 'undefined' ? QUARRY_CART_STOPS.length : 0),
             tavern: LIFE_DOORS.filter(function(d){ return d.cat === 'tavern'; }).length },
  points: { fishdock: LIFE_CARAVAN_FISHDOCK, mine: LIFE_CARAVAN_MINE, quarry: LIFE_CARAVAN_QUARRY }
};

function lifeCaravanPickDest(excludeCat, cartCount, fromX, fromZ){
  var cats = LIFE_CARAVAN_CATS.filter(function(c){
    if(c === excludeCat) return false;
    if(c === 'warehouse' && cartCount >= 2) return false;   /* the river-crossing rule */
    return lifeCaravanPool(c).length > 0;
  });
  if(!cats.length) return null;
  var first = null;
  for(var tries=0; tries<10; tries++){
    var cat = pick(cats);
    var cand = { cat:cat, pt: pick(lifeCaravanPool(cat)) };
    if(!first) first = cand;
    if(fromX === undefined) return cand;
    if(lifeRoadReachable(fromX, fromZ, cand.pt.x, cand.pt.z)) return cand;
  }
  return first;
}
function lifeCaravanSpawn(){
  var cartCount = ri(1,3);
  var picked = lifeCaravanPickDest(null, cartCount, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
  if(!picked) return null;
  var curve = lifeCartBuildLeg(LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z, picked.pt.x, picked.pt.z);
  return {
    id: LIFE_CITIZEN_ID++, animal: pick(['ox','lizard','beetle']), cartCount: cartCount,

    state: 'arriving', stateT: 0, speed: rr(20,28),
    curve: curve, len: curve.getLength(), dur: 0,
    destCat: picked.cat, destPt: picked.pt, facingYaw: undefined,

    laneOffset: rr(-4.0, 4.0)
  };
}
var LIFE_CARAVANS = [];
(function(){

  for(var i=0;i<LIFE_STRIDER_CAR_BASE;i++){
    var cv = lifeCaravanSpawn();

    if(cv){ cv.dur = Math.max(6, cv.len/cv.speed); cv.stateT = rr(0, cv.dur); }
    LIFE_CARAVANS.push(cv);
  }
})();
window._caravans = LIFE_CARAVANS;   /* diagnostic */

var lifeCaravanTmpPos = new THREE.Vector3(), lifeCaravanTmpDir = new THREE.Vector3();
var lifeCaravanTmpQuat = new THREE.Quaternion(), lifeCaravanTmpMat = new THREE.Matrix4();
var lifeCaravanTmpScale1 = new THREE.Vector3(1,1,1);
function updateCaravans(dt){
  LIFE_CARAVANS.forEach(function(cv, idx){
    if(!cv){ LIFE_CARAVANS[idx] = lifeCaravanSpawn(); return; }
    cv.stateT += dt;
    if(cv.state === 'unloading'){
      if(lifeLodDue(cv.destPt.x, cv.destPt.z, idx)){
      lifeCaravanTmpPos.set(cv.destPt.x, Math.max(LIFE_Y, lifeGroundY(cv.destPt.x, cv.destPt.z) + 0.15), cv.destPt.z);
      lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, cv.destPt.ry || 0);
      lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
      lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
      if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
      }
      if(cv.stateT >= cv.unloadFor){
        var next = lifeCaravanPickDest(cv.destCat, cv.cartCount, cv.destPt.x, cv.destPt.z);
        cv.laneOffset = rr(-4.0, 4.0);   /* re-rolled per leg — see lifeCaravanSpawn's own comment */
        if(next && chance(0.5)){
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, next.pt.x, next.pt.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.destCat = next.cat; cv.destPt = next.pt; cv.state = 'arriving'; cv.stateT = 0;
        }else{
          cv.curve = lifeCartBuildLeg(cv.destPt.x, cv.destPt.z, LIFE_CARAVAN_SPAWN.x, LIFE_CARAVAN_SPAWN.z);
          cv.len = cv.curve.getLength(); cv.dur = Math.max(6, cv.len/cv.speed);
          cv.state = 'departing'; cv.stateT = 0;
        }
      }
      return;
    }
    /* 'arriving' or 'departing' */
    if(cv.dur === 0) cv.dur = Math.max(6, cv.len/cv.speed);
    var raw = Math.min(1, cv.stateT/cv.dur);
    var t = raw*raw*(3-2*raw);
    cv.curve.getPointAt(t, lifeCaravanTmpPos);
    var tTan = Math.min(0.995, Math.max(0.005, t));
    cv.curve.getTangentAt(tTan, lifeCaravanTmpDir);
    var yaw = Math.atan2(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z);

    var dlen = Math.hypot(lifeCaravanTmpDir.x, lifeCaravanTmpDir.z) || 1;
    lifeCaravanTmpPos.x += (-lifeCaravanTmpDir.z/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.z += (lifeCaravanTmpDir.x/dlen) * cv.laneOffset;
    lifeCaravanTmpPos.y = Math.max(LIFE_Y, lifeGroundY(lifeCaravanTmpPos.x, lifeCaravanTmpPos.z) + 0.15);
    lifeCaravanTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
    lifeCaravanTmpMat.compose(lifeCaravanTmpPos, lifeCaravanTmpQuat, lifeCaravanTmpScale1);
    lifeCaravanMesh.setMatrixAt(idx, lifeCaravanTmpMat);
    if(typeof LANTERN_TRACK_READY !== 'undefined') nlTrack(LANTERN_CARAVAN_BASE+idx, lifeCaravanTmpPos.x, lifeCaravanTmpPos.y+2.4, lifeCaravanTmpPos.z);
    if(raw >= 1){
      if(cv.state === 'arriving'){
        cv.state = 'unloading'; cv.stateT = 0; cv.unloadFor = rr(10,20);
      }else{
        LIFE_CARAVANS[idx] = lifeCaravanSpawn();
      }
    }
  });
  lifeCaravanMesh.instanceMatrix.needsUpdate = true;
}
