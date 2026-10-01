/* ==== barges ==== */

/* ==== river barges: follow the river's OWN polyline (riverAt/RIVER_CUM, ==== */
function lifeRiverCurve(u0, u1){
  var uMax = RIVER_CUM[RIVER_CUM.length-1] - 1;

  var steps = 32, waypoints = [];
  for(var i=0;i<=steps;i++){
    var u = Math.max(0, Math.min(uMax, u0 + (u1-u0)*i/steps));
    var p = riverAt(u);
    waypoints.push([p.x, p.z]);
  }

  for(var round=0; round<14; round++){
    var curve2 = lifeCurveFrom(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p2 = curve2.getPointAt(st);
      var fix = lifePierOrBridgeBlocked(p2.x, p2.z);
      if(fix){ worstT = st; worstFix = fix; break; }
    }
    if(worstT < 0) break;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w=1; w<waypoints.length-1; w++){
      var wt = w/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  var pts = waypoints.map(function(p){ return new THREE.Vector3(p[0], SEA-0.3, p[1]); });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
}
var LIFE_RIVER_FAR_U  = RIVER_CUM[RIVER_CUM.length-1] - 60;

var LIFE_RIVER_SPAWN_U = (function(){
  var rv = polyNear(1993.1, 1605.7, RIVER, RIVER_CUM);
  return rv.t * RIVER_CUM[RIVER_CUM.length-1];
})();

var LIFE_RIVER_TURN_U = Math.min(LIFE_RIVER_FAR_U, LIFE_RIVER_SPAWN_U + 700);

var LIFE_RBARGE_LEN = 50, LIFE_RBARGE_BEAM = 14;
var lifeRBargeHullParts = [
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM, 6, LIFE_RBARGE_LEN),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.75, 3.5, LIFE_RBARGE_LEN*0.19).translate(0, 4.75, -LIFE_RBARGE_LEN*0.36),
  new THREE.BoxGeometry(LIFE_RBARGE_BEAM*0.65, 2.6, LIFE_RBARGE_LEN*0.14).translate(0, 4.3, LIFE_RBARGE_LEN*0.40),
  new THREE.CylinderGeometry(0.15, 0.15, 3, 5).translate(0, 7.0, -LIFE_RBARGE_LEN*0.10),
  new THREE.BoxGeometry(3.2, 2.6, 3.2).translate(-3.2, 4.3, 2),
  new THREE.BoxGeometry(3.6, 2.2, 3.0).translate(2.6, 4.1, 6),
  new THREE.BoxGeometry(3.0, 2.8, 3.4).translate(-1.0, 4.4, -8)
];
var lifeRBargeHullGeo = lifeMergeGeoms(lifeRBargeHullParts);
var LIFE_RBARGE_N = 7;

var lifeRBargeHullMesh = new THREE.InstancedMesh(lifeRBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0x2c2116 }), LIFE_RBARGE_N);
lifeRBargeHullMesh.userData.life = true; lifeRBargeHullMesh.userData.inspectLabel = 'River barge hull';
lifeRBargeHullMesh.frustumCulled = false;
scene.add(lifeRBargeHullMesh);

function lifeMakeRiverBarge(dock, state, fromU, toU, tFrac, speed){
  var b = { kind:'river', home: dock, speed: speed, stateT: 0 };
  if(state === 'docked'){
    b.state = 'docked'; b.x = dock.x; b.z = dock.z; b.ry = dock.ry; b.lastArrivalTime = -5;
    return b;
  }
  b.state = state;
  b.curve = lifeRiverCurve(fromU, toU);
  b.len = b.curve.getLength();
  b.dur = Math.max(20, b.len / b.speed);
  b.stateT = b.dur * tFrac;
  return b;
}
var LIFE_BARGES = [
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[0], 'docked',    0,                    0,                     0,    rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[1], 'arriving',  LIFE_RIVER_SPAWN_U,   LIFE_RBARGE_DOCKS[1].u, 0.92, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[2], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[2].u, 0.50, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[3], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[3].u, 0.40, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[4], 'departing', LIFE_RBARGE_DOCKS[4].u, LIFE_RIVER_TURN_U,     0.55, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[5], 'departing', LIFE_RBARGE_DOCKS[5].u, LIFE_RIVER_TURN_U,     0.88, rr(9,12)),
  lifeMakeRiverBarge(LIFE_RBARGE_DOCKS[6], 'arriving',  LIFE_RIVER_TURN_U,     LIFE_RBARGE_DOCKS[6].u, 0.10, rr(9,12))
];
var LIFE_BARGE_T = 0;

/* ==== the pleasure barge: gold hull, purple sails (a second, differently ==== */
function lifePolyCentroid(poly){
  var cx=0, cz=0;
  poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  return [cx/poly.length, cz/poly.length];
}

function lifePolyRandomPoint(poly){
  var minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  poly.forEach(function(p){
    if(p[0]<minX)minX=p[0]; if(p[0]>maxX)maxX=p[0];
    if(p[1]<minZ)minZ=p[1]; if(p[1]>maxZ)maxZ=p[1];
  });
  for(var i=0;i<300;i++){
    var x=rr(minX,maxX), z=rr(minZ,maxZ);
    if(pointInPoly(x,z,poly)) return [x,z];
  }
  return lifePolyCentroid(poly);
}

function lifePierOrBridgeBlocked(x,z){
  var arrs = [PIERS, CPIERS, RPIERS, LIFE_EXTRA_PIERS];
  for(var ai=0; ai<arrs.length; ai++){
    var arr = arrs[ai];
    for(var i=0;i<arr.length;i++){
      var p = arr[i], need = p.w*0.5+6;
      var d = lifeSegDist(x,z,p.x0,p.z0,p.x1,p.z1);
      if(d < need){
        var dx=p.x1-p.x0, dz=p.z1-p.z0, L=dx*dx+dz*dz;
        var t = L ? ((x-p.x0)*dx+(z-p.z0)*dz)/L : 0; t=Math.max(0,Math.min(1,t));
        var nx = x-(p.x0+t*dx), nz = z-(p.z0+t*dz), nd = Math.hypot(nx,nz)||1;
        return [x + (nx/nd)*(need-d+10), z + (nz/nd)*(need-d+10)];
      }
    }
  }
  for(var bi2=0; bi2<BRIDGE_SUPPORTS.length; bi2++){
    var bs = BRIDGE_SUPPORTS[bi2], needB = bs.r+6;
    var dxb = x-bs.x, dzb = z-bs.z, db = Math.hypot(dxb,dzb)||1;

    if(db < needB) return [x + (dxb/db)*(needB-db+10), z + (dzb/db)*(needB-db+10)];
  }
  return null;
}
function lifeBuildLegInPoly(ax,az,bx,bz,poly){
  var centroid = lifePolyCentroid(poly);
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0; i<14 && (!pointInPoly(x,z,poly) || terrainH(x,z) > -1.5); i++){
      x += (centroid[0]-x)*0.35; z += (centroid[1]-z)*0.35;
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 11;   /* 9 interior control points + the 2 anchors */
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++){
    waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  }
  waypoints.push([bx,bz]);
  for(var round=0; round<40; round++){
    var curve = lifeCurveFromCentripetal(waypoints);
    var worstT = -1, worstFix = null;
    for(var s=1; s<160; s++){
      var st = s/160, p3 = curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x, p3.z);
      if(blocked){
        worstT = st;
        worstFix = [blocked[0].x + blocked[1]*blocked[3]*1.25, blocked[0].z + blocked[2]*blocked[3]*1.25];
        break;
      }
      var pierFix = lifePierOrBridgeBlocked(p3.x, p3.z);
      if(pierFix){
        worstT = st;
        worstFix = pierFix;
        break;
      }
      if(!pointInPoly(p3.x, p3.z, poly) || terrainH(p3.x, p3.z) > -1.5){

        var fix = lifePushToWater(p3.x, p3.z);
        if(!pointInPoly(fix[0], fix[1], poly)){
          fix = [fix[0] + (centroid[0]-fix[0])*0.4, fix[1] + (centroid[1]-fix[1])*0.4];
        }
        worstT = st;
        worstFix = fix;
        break;
      }
    }
    if(worstT < 0) return curve;
    var nearestIdx = 1, nearestD = Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt = w2/(waypoints.length-1), dT = Math.abs(wt-worstT);
      if(dT < nearestD){ nearestD = dT; nearestIdx = w2; }
    }
    waypoints[nearestIdx] = worstFix;
  }
  return lifeCurveFromCentripetal(waypoints);
}
var LIFE_PBARGE_LEN = 26, LIFE_PBARGE_BEAM = 10;
var lifePBargeHullParts = [
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM, 3.2, LIFE_PBARGE_LEN),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.85, 0.6, LIFE_PBARGE_LEN*0.92).translate(0, 2.5, 0),
  new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.7, 2.6, LIFE_PBARGE_LEN*0.36).translate(0, 4.1, -LIFE_PBARGE_LEN*0.18),
  new THREE.CylinderGeometry(0.22, 0.22, 10, 6).translate(0, 8.0, LIFE_PBARGE_LEN*0.14)
];
var lifePBargeHullGeo = lifeMergeGeoms(lifePBargeHullParts);
var lifePBargeHullMesh = new THREE.InstancedMesh(lifePBargeHullGeo, new THREE.MeshLambertMaterial({ color: 0xc9a227 }), 1);
var lifePBargeSailGeo = new THREE.BoxGeometry(LIFE_PBARGE_BEAM*0.9, 7, 0.2).translate(0, 9.5, LIFE_PBARGE_LEN*0.14);
var lifePBargeSailMesh = new THREE.InstancedMesh(lifePBargeSailGeo, new THREE.MeshLambertMaterial({ color: 0x6a2f8a }), 1);
lifePBargeHullMesh.userData.inspectLabel = 'Palace barge hull'; lifePBargeSailMesh.userData.inspectLabel = 'Palace barge sail';
[lifePBargeHullMesh, lifePBargeSailMesh].forEach(function(m){ m.userData.life = true; m.frustumCulled = false; scene.add(m); });

var LIFE_PBARGE_ZONE = [[922.6,-1027.1],[878.9,-1010.1],[792.1,-1116.4],[662.5,-985.9],[511.1,-1145.6],[396.1,-1125.4],[334.8,-1015.0],[452.6,-863.5],[537.0,-760.3],[479.2,-523.4],[266.3,-510.9],[197.7,-155.2],[-25.5,-119.2],[-68.1,-60.6],[-68.9,329.6],[-157.2,430.7],[-555.8,433.0],[-585.1,476.9],[-579.8,648.1],[-925.7,647.9],[-899.3,299.4],[-442.4,65.8],[-262.2,-93.5],[-139.0,-375.7],[-31.3,-562.3],[-53.6,-993.8],[-1148.9,-853.3],[-1171.3,-1064.2],[-1031.3,-1218.6],[-1186.8,-1364.0],[-1322.4,-1238.6],[-1569.5,-1190.7],[-2608.7,-2131.5],[-2388.6,-3208.4],[-1413.9,-3957.5],[-177.5,-2347.5],[-414.8,-2110.5],[-268.4,-1917.3],[-67.6,-2085.5],[-73.6,-2238.7],[-1358.6,-3982.6],[292.2,-4766.0],[1136.5,-4586.7],[1978.4,-3134.7],[1761.1,-2777.5],[1412.0,-2530.9],[1474.5,-2375.2],[1648.9,-2469.4],[1867.0,-2727.0],[2003.6,-2872.7],[2293.0,-1966.8],[2132.4,-1573.7],[1708.7,-1240.6],[1219.8,-1709.2],[983.9,-1652.3],[748.4,-1768.4],[599.1,-1601.0],[736.6,-1488.8],[772.5,-1272.9],[906.5,-1162.8]];
var LIFE_PBARGE_DOCK = { x: LIFE_PBARGE_ZONE[0][0], z: LIFE_PBARGE_ZONE[0][1] };
(function(){
  var c = lifePolyCentroid(LIFE_PBARGE_ZONE);
  LIFE_PBARGE_DOCK.ry = Math.atan2(c[0]-LIFE_PBARGE_DOCK.x, c[1]-LIFE_PBARGE_DOCK.z);
})();
LIFE_BARGES.push({
  kind: 'pleasure', state: 'docked', x: LIFE_PBARGE_DOCK.x, z: LIFE_PBARGE_DOCK.z, ry: LIFE_PBARGE_DOCK.ry,
  speed: rr(7,9), stateT: 0, passengers: 0, target: ri(10,20)
});
window._barges = { count: LIFE_BARGES.length };
window._lifeBarges = LIFE_BARGES;         /* diagnostic: full state incl. .home/.curve */
window._rbargeDocks = LIFE_RBARGE_DOCKS;
window._pbarge = { zone: LIFE_PBARGE_ZONE, dock: LIFE_PBARGE_DOCK,
  randomPoint: lifePolyRandomPoint, buildLeg: lifeBuildLegInPoly };   /* diagnostic */

/* ==== shared people for every barge above: river-barge crew (3, always ==== */
var LIFE_BARGE_PEOPLE_PER_RIVER = 3, LIFE_BARGE_PEOPLE_PER_PLEASURE = 23;   /* 3 crew + up to 20 partiers */
var LIFE_BARGE_PEOPLE_TOTAL = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER + LIFE_BARGE_PEOPLE_PER_PLEASURE;
var lifeBargePeopleMesh = new THREE.InstancedMesh(lifePersonGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), LIFE_BARGE_PEOPLE_TOTAL);
lifeBargePeopleMesh.userData.life = true; lifeBargePeopleMesh.userData.inspectLabel = 'Barge crew';
lifeBargePeopleMesh.frustumCulled = false;
scene.add(lifeBargePeopleMesh);

var LIFE_RBARGE_SEATS = [ [0, -LIFE_RBARGE_LEN*0.30], [-2.5, 3], [2.5, 3] ];
var LIFE_PBARGE_SEATS = [ [0, -LIFE_PBARGE_LEN*0.40], [-2.6, -LIFE_PBARGE_LEN*0.05], [2.6, -LIFE_PBARGE_LEN*0.05] ];
for(var lp=0; lp<20; lp++){
  var lpa = (lp/20)*Math.PI*2;
  LIFE_PBARGE_SEATS.push([ Math.cos(lpa)*LIFE_PBARGE_BEAM*0.36, Math.sin(lpa)*LIFE_PBARGE_LEN*0.34 ]);
}

var lifeBargeTmpPos = new THREE.Vector3(), lifeBargeTmpPos2 = new THREE.Vector3(), lifeBargeTmpDir = new THREE.Vector3();
var lifeBargeTmpQuat = new THREE.Quaternion(), lifeBargeTmpMat = new THREE.Matrix4();
var lifeBargeTmpScale1 = new THREE.Vector3(1,1,1), lifeBargeTmpScale0 = new THREE.Vector3(0,0,0);
function lifePlaceBargePeople(baseIdx, seats, visibleCount, pos, yaw, deckY){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  for(var s=0; s<seats.length; s++){
    if(s < visibleCount){
      var seat = seats[s];
      var wx = pos.x + seat[0]*cosY + seat[1]*sinY;
      var wz = pos.z - seat[0]*sinY + seat[1]*cosY;
      lifeBargeTmpPos2.set(wx, deckY, wz);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
    }else{
      lifeBargeTmpMat.compose(lifeBargeTmpPos2.set(0,0,0), lifeBargeTmpQuat, lifeBargeTmpScale0);
    }
    lifeBargePeopleMesh.setMatrixAt(baseIdx+s, lifeBargeTmpMat);
  }
}

var LIFE_AVOID_CANOE0 = 0, LIFE_AVOID_FERRY0 = LIFE_N, LIFE_AVOID_SHIP0 = LIFE_N + LIFE_FERRY_N;

var LIFE_AVOID_PBARGE0 = LIFE_AVOID_SHIP0 + LIFE_SHIP_HULL_N;
var LIFE_AVOID_RBARGE0 = LIFE_AVOID_PBARGE0 + 1;
var LIFE_AVOID_OBST0 = LIFE_AVOID_RBARGE0 + LIFE_RBARGE_N;
var LIFE_AVOID_N = LIFE_AVOID_OBST0 + BRIDGE_SUPPORTS.length;
var LIFE_AVOID_X = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_Z = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_R = new Float32Array(LIFE_AVOID_N);
var LIFE_AVOID_PRIORITY = new Float32Array(LIFE_AVOID_N);
(function(){
  for(var i=0;i<LIFE_N;i++){ LIFE_AVOID_R[LIFE_AVOID_CANOE0+i] = 3.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_CANOE0+i] = 1; }
  for(var j=0;j<LIFE_FERRY_N;j++){ LIFE_AVOID_R[LIFE_AVOID_FERRY0+j] = 9.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_FERRY0+j] = 2; }
  for(var k=0;k<LIFE_SHIP_HULL_N;k++){ LIFE_AVOID_R[LIFE_AVOID_SHIP0+k] = 17.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_SHIP0+k] = 3; }
  LIFE_AVOID_PRIORITY[LIFE_AVOID_PBARGE0] = 3;   /* radius set per-frame in updateBarges (pleasure barge has no fixed LEN/BEAM consts) */
  for(var r=0;r<LIFE_RBARGE_N;r++){ LIFE_AVOID_R[LIFE_AVOID_RBARGE0+r] = 15.0; LIFE_AVOID_PRIORITY[LIFE_AVOID_RBARGE0+r] = 3; }
  for(var o=0;o<BRIDGE_SUPPORTS.length;o++){
    var bs = BRIDGE_SUPPORTS[o];
    LIFE_AVOID_X[LIFE_AVOID_OBST0+o] = bs.x; LIFE_AVOID_Z[LIFE_AVOID_OBST0+o] = bs.z;
    LIFE_AVOID_R[LIFE_AVOID_OBST0+o] = bs.r; LIFE_AVOID_PRIORITY[LIFE_AVOID_OBST0+o] = 5;
  }
})();
window._avoidDebug = { X:LIFE_AVOID_X, Z:LIFE_AVOID_Z, R:LIFE_AVOID_R, P:LIFE_AVOID_PRIORITY,
  canoe0:LIFE_AVOID_CANOE0, ferry0:LIFE_AVOID_FERRY0, ship0:LIFE_AVOID_SHIP0,
  pbarge0:LIFE_AVOID_PBARGE0, rbarge0:LIFE_AVOID_RBARGE0, obst0:LIFE_AVOID_OBST0,
  obstN: BRIDGE_SUPPORTS.length, n: LIFE_AVOID_N };   /* diagnostic */

var LIFE_AVOID_LOOKAHEAD = 16;
var LIFE_FERRY_TURN_RATE = 1.4;

var LIFE_SHIP_AVOID_R = 17.0;
var LIFE_SHIP_LOOKAHEAD = 30;
var LIFE_SHIP_TURN_RATE = 0.6;

var LIFE_RBARGE_AVOID_R = 15.0;
var LIFE_RBARGE_LOOKAHEAD = 28;
var LIFE_RBARGE_TURN_RATE = 0.5;
var LIFE_PBARGE_AVOID_R = 9.0;
var LIFE_PBARGE_LOOKAHEAD = 18;
var LIFE_PBARGE_TURN_RATE = 0.9;
function updateBarges(dt){
  LIFE_BARGE_T += dt;
  var riverBargeSlot = 0;
  LIFE_BARGES.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.kind === 'river'){

      var rAvoidSlot = LIFE_AVOID_RBARGE0 + riverBargeSlot;
      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[rAvoidSlot] = b.x; LIFE_AVOID_Z[rAvoidSlot] = b.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;
        if(b.dwell === undefined) b.dwell = rr(20, 45);
        if(b.stateT >= b.dwell){
          b.curve = lifeRiverCurve(b.home.u, LIFE_RIVER_TURN_U);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'departing'; b.stateT = 0;
        }
      }else if(b.state === 'away'){
        LIFE_AVOID_R[rAvoidSlot] = 0;   /* off the map — not an obstacle */
        if(LIFE_BARGE_T >= b.awayUntil){
          b.curve = lifeRiverCurve(LIFE_RIVER_TURN_U, b.home.u);
          b.len = b.curve.getLength(); b.dur = Math.max(20, b.len/b.speed);
          b.state = 'arriving'; b.stateT = 0;
        }
        lifeBargeTmpMat.compose(lifeBargeTmpPos.set(0,0,0), lifeBargeTmpQuat.identity(), lifeBargeTmpScale0);
        lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);
        lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 0, {x:0,z:0}, 0, 0);
        riverBargeSlot++;
        return;
      }else{

        var raw = Math.min(1, b.stateT/b.dur);
        var t = raw*raw*(3-2*raw);
        b.curve.getPointAt(t, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan = Math.min(0.995, Math.max(0.005, t));
        b.curve.getTangentAt(tTan, lifeBargeTmpDir);
        var tanYawR = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var rdelta = lifeAvoidNudge2(rAvoidSlot, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_RBARGE_AVOID_R, 14.0, LIFE_RBARGE_LOOKAHEAD, 5.0, 3);
        pos.x += rdelta[0]; pos.z += rdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawR;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxr = pos.x-b.lastX, mdzr = pos.z-b.lastZ;
        var moveYawR = (mdxr*mdxr+mdzr*mdzr > 1e-6) ? Math.atan2(mdxr,mdzr) : tanYawR;
        var dAngR = moveYawR - b.facingYaw;
        while(dAngR > Math.PI) dAngR -= Math.PI*2;
        while(dAngR < -Math.PI) dAngR += Math.PI*2;
        var maxStepR = LIFE_RBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepR, Math.min(maxStepR, dAngR));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[rAvoidSlot] = pos.x; LIFE_AVOID_Z[rAvoidSlot] = pos.z; LIFE_AVOID_R[rAvoidSlot] = LIFE_RBARGE_AVOID_R;

        if(raw >= 1){
          if(b.state === 'arriving'){
            b.state = 'docked'; b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
            b.lastArrivalTime = LIFE_BARGE_T; b.stateT = 0; b.dwell = rr(20, 45);
          }else{
            b.state = 'away'; b.stateT = 0;
            b.awayUntil = LIFE_BARGE_T + b.dur*rr(1,2.2);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.3, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifeRBargeHullMesh.setMatrixAt(bi, lifeBargeTmpMat);

      lifePlaceBargePeople(riverBargeSlot*LIFE_BARGE_PEOPLE_PER_RIVER, LIFE_RBARGE_SEATS, 3, pos, yaw, SEA+3.0);
      riverBargeSlot++;
    }else{

      if(b.state === 'docked'){
        pos = b; yaw = b.ry;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = b.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = b.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;
        if(b.passengers < b.target) b.passengers = Math.min(b.target, b.passengers + dt*0.6);
        if(b.passengers >= 10 && b.stateT >= 20){
          var away = lifePolyRandomPoint(LIFE_PBARGE_ZONE);
          b.curve = lifeBuildLegInPoly(b.x, b.z, away[0], away[1], LIFE_PBARGE_ZONE);
          b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
          b.state = 'ramble'; b.stateT = 0;
        }
      }else if(b.state === 'ramble' || b.state === 'returning'){
        var raw2 = Math.min(1, b.stateT/b.dur);
        var t2 = raw2*raw2*(3-2*raw2);
        b.curve.getPointAt(t2, lifeBargeTmpPos);
        pos = lifeBargeTmpPos;
        var tTan2 = Math.min(0.995, Math.max(0.005, t2));
        b.curve.getTangentAt(tTan2, lifeBargeTmpDir);
        var tanYawP = Math.atan2(lifeBargeTmpDir.x, lifeBargeTmpDir.z);

        var pdelta = lifeAvoidNudge2(LIFE_AVOID_PBARGE0, pos.x, pos.z, lifeBargeTmpDir.x, lifeBargeTmpDir.z, LIFE_PBARGE_AVOID_R, 10.0, LIFE_PBARGE_LOOKAHEAD, 4.0, 3);
        pos.x += pdelta[0]; pos.z += pdelta[1];
        if(b.facingYaw === undefined) b.facingYaw = tanYawP;
        if(b.lastX === undefined){ b.lastX = pos.x; b.lastZ = pos.z; }
        var mdxp = pos.x-b.lastX, mdzp = pos.z-b.lastZ;
        var moveYawP = (mdxp*mdxp+mdzp*mdzp > 1e-6) ? Math.atan2(mdxp,mdzp) : tanYawP;
        var dAngP = moveYawP - b.facingYaw;
        while(dAngP > Math.PI) dAngP -= Math.PI*2;
        while(dAngP < -Math.PI) dAngP += Math.PI*2;
        var maxStepP = LIFE_PBARGE_TURN_RATE*dt;
        b.facingYaw += Math.max(-maxStepP, Math.min(maxStepP, dAngP));
        yaw = b.facingYaw;
        b.lastX = pos.x; b.lastZ = pos.z;
        LIFE_AVOID_X[LIFE_AVOID_PBARGE0] = pos.x; LIFE_AVOID_Z[LIFE_AVOID_PBARGE0] = pos.z; LIFE_AVOID_R[LIFE_AVOID_PBARGE0] = LIFE_PBARGE_AVOID_R;

        if(raw2 >= 1){
          if(b.state === 'ramble'){
            b.curve = lifeBuildLegInPoly(pos.x, pos.z, LIFE_PBARGE_DOCK.x, LIFE_PBARGE_DOCK.z, LIFE_PBARGE_ZONE);
            b.len = b.curve.getLength(); b.dur = Math.max(15, b.len/b.speed);
            b.state = 'returning'; b.stateT = 0;
          }else{
            b.state = 'docked'; b.x = LIFE_PBARGE_DOCK.x; b.z = LIFE_PBARGE_DOCK.z; b.ry = LIFE_PBARGE_DOCK.ry;
            b.stateT = 0; b.passengers = 0; b.target = ri(10,20);
          }
        }
      }
      lifeBargeTmpPos2.set(pos.x, SEA-0.25, pos.z);
      lifeBargeTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      lifeBargeTmpMat.compose(lifeBargeTmpPos2, lifeBargeTmpQuat, lifeBargeTmpScale1);
      lifePBargeHullMesh.setMatrixAt(0, lifeBargeTmpMat);
      lifePBargeSailMesh.setMatrixAt(0, lifeBargeTmpMat);
      var pBase = LIFE_RBARGE_N*LIFE_BARGE_PEOPLE_PER_RIVER;

      lifePlaceBargePeople(pBase, LIFE_PBARGE_SEATS, 3 + Math.floor(b.passengers), pos, yaw, SEA+3.1);
    }
  });
  lifeRBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeHullMesh.instanceMatrix.needsUpdate = true;
  lifePBargeSailMesh.instanceMatrix.needsUpdate = true;
  lifeBargePeopleMesh.instanceMatrix.needsUpdate = true;
}

/* ==== fishing dhows ==== */
reseed(786217);

var LIFE_DHOW_SCALE = 1.35;
var LIFE_DHOW_LEN = 12*LIFE_DHOW_SCALE, LIFE_DHOW_BEAM = 3.0*LIFE_DHOW_SCALE;
var LIFE_DHOW_HULL_COL = 0x8a6b45;
var LIFE_DHOW_MAST_H = 7.0*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_Z = LIFE_DHOW_LEN*0.16;
var LIFE_DHOW_MAST_RAKE = 0.26;
var LIFE_DHOW_MAST_BASE_Y = 0.65*LIFE_DHOW_SCALE;

var LIFE_DHOW_BIN_X = (3.0*0.50 - 0.12*0.5 - 1.20*0.5)*LIFE_DHOW_SCALE;
var LIFE_DHOW_BIN_W = 1.20*LIFE_DHOW_SCALE;   /* across the boat, outer wall to outer wall */
var LIFE_DHOW_BIN_L = LIFE_DHOW_LEN*0.32;     /* fore-and-aft */
var LIFE_DHOW_BIN_Z = -LIFE_DHOW_LEN*0.20;
var LIFE_DHOW_BIN_H = 0.78*LIFE_DHOW_SCALE;   /* wall height above the deck */
var LIFE_DHOW_BIN_T = 0.11*LIFE_DHOW_SCALE;   /* plank thickness */
var LIFE_DHOW_BIN_COL = shade(LIFE_DHOW_HULL_COL,-0.26);
var lifeDhowHullParts = [

  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM*0.82, 1.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.46).translate(0,-0.65*LIFE_DHOW_SCALE,-LIFE_DHOW_LEN*0.28), color: LIFE_DHOW_HULL_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BEAM, 1.32*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.50).translate(0,-0.65*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.11), color: LIFE_DHOW_HULL_COL },

  { geo: new THREE.ConeGeometry(1, LIFE_DHOW_LEN*0.32, 4).rotateX(Math.PI/2)
          .scale(LIFE_DHOW_BEAM*0.40, 1.15*LIFE_DHOW_SCALE, 1).translate(0, 0.25*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.36+LIFE_DHOW_LEN*0.15),
    color: LIFE_DHOW_HULL_COL },
  /* thin gunwale trim, both sides */
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate( LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  { geo: SHAPES.box().scale(0.12*LIFE_DHOW_SCALE, 0.30*LIFE_DHOW_SCALE, LIFE_DHOW_LEN*0.70).translate(-LIFE_DHOW_BEAM*0.50, 0.10*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.04), color: shade(LIFE_DHOW_HULL_COL,-0.18) },
  /* the single forward-raked mast */
  { geo: SHAPES.cyl().scale(0.13*LIFE_DHOW_SCALE, LIFE_DHOW_MAST_H, 0.13*LIFE_DHOW_SCALE).rotateX(LIFE_DHOW_MAST_RAKE).translate(0, LIFE_DHOW_MAST_BASE_Y, LIFE_DHOW_MAST_Z), color: shade(LIFE_DHOW_HULL_COL,-0.30) },

  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X-LIFE_DHOW_BIN_W*0.5+LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_T, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_L).translate(LIFE_DHOW_BIN_X+LIFE_DHOW_BIN_W*0.5-LIFE_DHOW_BIN_T*0.5, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z+LIFE_DHOW_BIN_L*0.5-LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL },
  { geo: SHAPES.box().scale(LIFE_DHOW_BIN_W, LIFE_DHOW_BIN_H, LIFE_DHOW_BIN_T).translate(LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_H*0.5, LIFE_DHOW_BIN_Z-LIFE_DHOW_BIN_L*0.5+LIFE_DHOW_BIN_T*0.5), color: LIFE_DHOW_BIN_COL }
];
var lifeDhowHullGeo = lifeMergeGeoms(lifeDhowHullParts);
var LIFE_DHOW_N = LIFE_FISH_PIERS.length * 3;   /* "3 boats per pier", however many piers actually fit */
var lifeDhowHullMesh = new THREE.InstancedMesh(lifeDhowHullGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N));
lifeDhowHullMesh.userData.life = true; lifeDhowHullMesh.userData.inspectLabel = 'Fishing dhow hull';
lifeDhowHullMesh.frustumCulled = false; scene.add(lifeDhowHullMesh);

function lifeDhowSailGeo(){
  var mastTopY = LIFE_DHOW_MAST_BASE_Y + LIFE_DHOW_MAST_H*Math.cos(LIFE_DHOW_MAST_RAKE);
  var mastTopZ = LIFE_DHOW_MAST_Z + LIFE_DHOW_MAST_H*Math.sin(LIFE_DHOW_MAST_RAKE);
  var peak = [0, mastTopY*0.93, mastTopZ - LIFE_DHOW_LEN*0.30];   /* the yard's own peak — aft and high, exactly how a lateen yard crosses its mast */
  var tack = [0, LIFE_DHOW_MAST_BASE_Y+0.25, LIFE_DHOW_MAST_Z + 1.0];
  var clew = [0, LIFE_DHOW_MAST_BASE_Y+0.45, LIFE_DHOW_MAST_Z - LIFE_DHOW_LEN*0.58];
  var pos = [ peak[0],peak[1],peak[2], tack[0],tack[1],tack[2], clew[0],clew[1],clew[2],
              peak[0],peak[1],peak[2], clew[0],clew[1],clew[2], tack[0],tack[1],tack[2] ];
  var uv = [0,1, 0,0, 1,0,  0,1, 1,0, 0,0];
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}
var lifeDhowSailGeoObj = lifeDhowSailGeo();
var lifeDhowSailMesh = new THREE.InstancedMesh(lifeDhowSailGeoObj, new THREE.MeshLambertMaterial({ color:0xffffff, side:THREE.DoubleSide }), Math.max(1,LIFE_DHOW_N));
lifeDhowSailMesh.userData.life = true; lifeDhowSailMesh.userData.inspectLabel = 'Fishing dhow sail';
lifeDhowSailMesh.frustumCulled = false; scene.add(lifeDhowSailMesh);

var LIFE_DHOW_SEATS = [ [0, LIFE_DHOW_LEN*0.30], [-0.55*LIFE_DHOW_SCALE, -0.15], [-0.52*LIFE_DHOW_SCALE, -LIFE_DHOW_LEN*0.34] ];
var lifeDhowCrewMesh = new THREE.InstancedMesh(lifePersonGeo, new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), Math.max(1,LIFE_DHOW_N*3));
lifeDhowCrewMesh.userData.life = true; lifeDhowCrewMesh.userData.inspectLabel = 'Dhow crew';
lifeDhowCrewMesh.frustumCulled = false; scene.add(lifeDhowCrewMesh);

/* ==== the working gear ==== */
var LIFE_DHOW_GEAR_PER = 5;
var lifeDhowGearGeo = new THREE.BoxGeometry(1,1,1);
var lifeDhowGearMesh = new THREE.InstancedMesh(lifeDhowGearGeo, new THREE.MeshLambertMaterial({ color:0xffffff }), Math.max(1,LIFE_DHOW_N*LIFE_DHOW_GEAR_PER));
lifeDhowGearMesh.userData.life = true; lifeDhowGearMesh.userData.inspectLabel = 'Dhow nets and catch';
lifeDhowGearMesh.frustumCulled = false; scene.add(lifeDhowGearMesh);

var LIFE_DHOW_NET_COL   = 0x39453b;   /* wet, weed-stained netting */
var LIFE_DHOW_FLOAT_COL = 0xd9c7a0;   /* cork floats, bleached rope */
var LIFE_DHOW_CATCH_COL = 0xa9bcbe;   /* a heap of wet silver fish */

function lifeBuildLegOpenWater(ax,az,bx,bz){
  function settle(x,z){
    var p = lifePushToWater(x,z); x=p[0]; z=p[1];
    for(var i=0;i<6;i++){
      var pb = lifePierOrBridgeBlocked(x,z);
      if(!pb) break;
      x=pb[0]; z=pb[1];
      var p2 = lifePushToWater(x,z); x=p2[0]; z=p2[1];
    }
    return [x,z];
  }
  var LEGS_N = 7;
  var waypoints = [[ax,az]];
  for(var wi=1; wi<LEGS_N-1; wi++) waypoints.push(settle.apply(null, lifeMix([ax,az],[bx,bz], wi/(LEGS_N-1))));
  waypoints.push([bx,bz]);
  var curve = lifeCurveFromCentripetal(waypoints);
  for(var round=0; round<20; round++){
    var worstT=-1, worstFix=null;
    for(var s=1;s<80;s++){
      var st=s/80, p3=curve.getPointAt(st);
      var blocked = lifeCantonBlocked(p3.x,p3.z);
      if(blocked){ worstT=st; worstFix=[blocked[0].x+blocked[1]*blocked[3]*1.25, blocked[0].z+blocked[2]*blocked[3]*1.25]; break; }
      var pierFix = lifePierOrBridgeBlocked(p3.x,p3.z);
      if(pierFix){ worstT=st; worstFix=pierFix; break; }
      if(terrainH(p3.x,p3.z) > -1.5){ worstT=st; worstFix=lifePushToWater(p3.x,p3.z); break; }
    }
    if(worstT<0) return curve;
    var nearestIdx=1, nearestD=Infinity;
    for(var w2=1; w2<waypoints.length-1; w2++){
      var wt=w2/(waypoints.length-1), dT=Math.abs(wt-worstT);
      if(dT<nearestD){ nearestD=dT; nearestIdx=w2; }
    }
    waypoints[nearestIdx]=worstFix;
    curve = lifeCurveFromCentripetal(waypoints);
  }
  return curve;
}

function lifeFishingSpot(homeX, homeZ){
  var best=null, bestZ=Infinity;
  for(var tries=0; tries<6; tries++){
    var ang = rr(0, Math.PI*2);
    var dx = Math.cos(ang), dz = Math.sin(ang);
    var northBias = 0.62;
    dx = mix(dx, 0, northBias); dz = mix(dz, -1, northBias);
    var L = Math.hypot(dx,dz) || 1; dx/=L; dz/=L;
    var dist = rr(160, 420);
    var cx = homeX + dx*dist, cz = homeZ + dz*dist;
    var p = lifePushToWater(cx,cz);

    for(var pb=0; pb<5; pb++){
      var fix = lifePierOrBridgeBlocked(p[0],p[1]);
      if(!fix) break;
      p = lifePushToWater(fix[0], fix[1]);
    }
    if(lifeCantonBlocked(p[0],p[1])) continue;
    if(lifePierOrBridgeBlocked(p[0],p[1])) continue;
    if(terrainH(p[0],p[1]) > -2.5) continue;
    if(p[1] < bestZ){ bestZ = p[1]; best = p; }
  }
  return best || lifePushToWater(homeX, homeZ - 220);
}

var LIFE_FISH_BOATS = [];
(function(){

  var slotT = [0.25, 0.58, 0.91];
  var slotSide = [1, -1, 1];
  LIFE_FISH_PIERS.forEach(function(pier){
    var perpX = -pier.dirZ, perpZ = pier.dirX;
    var lateral = pier.w*0.5 + LIFE_DHOW_BEAM*0.5 + 1.2;
    var ry = Math.atan2(pier.dirX, pier.dirZ);          /* facing straight out, same heading as departure */
    slotT.forEach(function(t, si){
      var side = slotSide[si];

      var pierLen = pier.len || LIFE_FISHDOCK_LEN;
      var alongLen = (pierLen - LIFE_FISHDOCK_LEN) + LIFE_FISHDOCK_LEN * t;

      var rx = pier.x0 + pier.dirX*alongLen + perpX*lateral*side;
      var rz = pier.z0 + pier.dirZ*alongLen + perpZ*lateral*side;
      LIFE_FISH_BOATS.push({
        home: { x:rx, z:rz, ry:ry }, pier: pier, moorSide: side,
        state:'docked', x:rx, z:rz, ry:ry, stateT: rr(0,14), dwell: rr(6,20),
        speed: rr(5.5,7.5), sailCol: pick(BANNERC),
        net: 0, catch: 0, unloadFrom: 0   /* 0..1 net deploy and bin fill, driven by updateFishBoats */
      });
    });
  });
  LIFE_DHOW_N = LIFE_FISH_BOATS.length;   /* == LIFE_FISH_PIERS.length*3 always, recorded here for clarity */

  var gearCol = new THREE.Color();
  var gearM = new THREE.Matrix4(), gearP = new THREE.Vector3(), gearQ = new THREE.Quaternion(), gearS = new THREE.Vector3();
  for(var i=0;i<LIFE_FISH_BOATS.length;i++){
    lifeDhowHullMesh.setColorAt(i, new THREE.Color(0xffffff));
    lifeDhowSailMesh.setColorAt(i, new THREE.Color(LIFE_FISH_BOATS[i].sailCol));
    for(var g=0; g<LIFE_DHOW_GEAR_PER; g++){
      var hex = (g===4) ? LIFE_DHOW_CATCH_COL : (g&1) ? LIFE_DHOW_FLOAT_COL : LIFE_DHOW_NET_COL;
      lifeDhowGearMesh.setColorAt(i*LIFE_DHOW_GEAR_PER+g, gearCol.set(hex).convertSRGBToLinear());

      gearP.set(LIFE_FISH_BOATS[i].x, SEA, LIFE_FISH_BOATS[i].z);
      gearS.set(1e-4,1e-4,1e-4);
      gearM.compose(gearP, gearQ.identity(), gearS);
      lifeDhowGearMesh.setMatrixAt(i*LIFE_DHOW_GEAR_PER+g, gearM);
    }
  }
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
  if(lifeDhowHullMesh.instanceColor) lifeDhowHullMesh.instanceColor.needsUpdate = true;
  if(lifeDhowSailMesh.instanceColor) lifeDhowSailMesh.instanceColor.needsUpdate = true;
  if(lifeDhowGearMesh.instanceColor) lifeDhowGearMesh.instanceColor.needsUpdate = true;
})();
window._fishBoats = { n: LIFE_FISH_BOATS.length, piers: LIFE_FISH_PIERS.length, boats: LIFE_FISH_BOATS,

  scale: LIFE_DHOW_SCALE, len: LIFE_DHOW_LEN, beam: LIFE_DHOW_BEAM,
  hullSpan: LIFE_DHOW_LEN*1.18,          /* stern -0.51*LEN to prow tip +0.67*LEN */
  slotT: [0.25,0.58,0.91], slotSide: [1,-1,1],
  gearInstances: LIFE_FISH_BOATS.length*LIFE_DHOW_GEAR_PER,
  /* live animation state, for a probe that wants one number per phase */
  phase: function(){ var o={docked:0,transitOut:0,fishing:0,transitIn:0,netsDown:0,laden:0};
    LIFE_FISH_BOATS.forEach(function(b){ o[b.state]++; if(b.net>0.5) o.netsDown++; if(b.catch>0.5) o.laden++; });
    return o; } };

if(typeof pathvizRegister === 'function') pathvizRegister({
  key:'fish', label:'Fishing dhow', color:0x46c8e6, seg:16, glow:5,
  entities: function(){ return LIFE_FISH_BOATS; },
  posts: function(){ return LIFE_FISH_PIERS.map(function(p){ return { x:p.tipX, y:SEA, z:p.tipZ }; }); },
  postR: 5
});

var lifeDhowTmpPos = new THREE.Vector3(), lifeDhowTmpDir = new THREE.Vector3();
var lifeDhowTmpQuat = new THREE.Quaternion(), lifeDhowTmpMat = new THREE.Matrix4();
var lifeDhowTmpScale1 = new THREE.Vector3(1,1,1);
var lifeDhowTmpScaleS = new THREE.Vector3(1,1,1);     /* the sail's own scale — furls independently of the hull */
var lifeDhowGearPos = new THREE.Vector3(), lifeDhowGearScale = new THREE.Vector3();
var lifeDhowGearMat = new THREE.Matrix4(), lifeDhowGearQuat = new THREE.Quaternion();
var lifeDhowRollQuat = new THREE.Quaternion(), LIFE_DHOW_FWD = new THREE.Vector3(0,0,1);
var lifeDhowCrewPos = new THREE.Vector3();
function lifeDhowEase(u){ u = u<0?0:(u>1?1:u); return u*u*(3-2*u); }
function lifeDhowMix(a,b,t){ return a + (b-a)*t; }

function lifePlaceDhowCrew(baseIdx, pos, yaw, deckY, b, clock){
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  var working = b.net > 0.02;
  var unloading = b.state === 'docked' && b.catch > 0.004;
  for(var s=0; s<LIFE_DHOW_SEATS.length; s++){
    var seat = LIFE_DHOW_SEATS[s];
    var lx = seat[0], lz = seat[1], dy = 0;
    if(s === 1 && working){
      lx = lifeDhowMix(seat[0], -LIFE_DHOW_BEAM*0.34, b.net);
      dy = Math.sin(clock*3.6 + baseIdx)*0.26*b.net;
    }else if(s === 2 && unloading){
      lx = lifeDhowMix(seat[0], LIFE_DHOW_BIN_X, b.catch);
      lz = lifeDhowMix(seat[1], LIFE_DHOW_BIN_Z - LIFE_DHOW_BIN_L*0.62, b.catch);
      dy = Math.sin(clock*3.0 + baseIdx)*0.30*b.catch;
    }
    var wx = pos.x + lx*cosY + lz*sinY;
    var wz = pos.z - lx*sinY + lz*cosY;
    lifeDhowCrewPos.set(wx, deckY+dy, wz);
    lifeDhowTmpMat.compose(lifeDhowCrewPos, lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowCrewMesh.setMatrixAt(baseIdx+s, lifeDhowTmpMat);
  }
}

var LIFE_DHOW_GEAR_Y0 = SEA - 0.15;   /* must track the hull's own mount height below */
function lifePlaceDhowGear(bi, pos, yaw, n, cat){
  var base = bi*LIFE_DHOW_GEAR_PER, S = LIFE_DHOW_SCALE;
  var cosY = Math.cos(yaw), sinY = Math.sin(yaw);

  function put(slot, lx, ly, lz, sx, sy, sz, roll){
    lifeDhowGearPos.set(pos.x + lx*cosY + lz*sinY, LIFE_DHOW_GEAR_Y0 + ly, pos.z - lx*sinY + lz*cosY);
    lifeDhowGearScale.set(sx, sy, sz);
    lifeDhowGearQuat.setFromAxisAngle(LIFE_UP, yaw);
    if(roll) lifeDhowGearQuat.multiply(lifeDhowRollQuat.setFromAxisAngle(LIFE_DHOW_FWD, roll));
    lifeDhowGearMat.compose(lifeDhowGearPos, lifeDhowGearQuat, lifeDhowGearScale);
    lifeDhowGearMesh.setMatrixAt(base+slot, lifeDhowGearMat);
  }
  for(var k=0; k<2; k++){
    var sg = k ? 1 : -1;

    var px   = lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 0.35*S, n) * sg;
    var top  = lifeDhowMix(0.58*S,  1.30*S, n);
    var bot  = lifeDhowMix(0.14*S, -0.90*S, n);
    put(k*2, px, (top+bot)*0.5, -LIFE_DHOW_LEN*0.04,
        lifeDhowMix(0.55*S, 0.22*S, n), top-bot, lifeDhowMix(0.52, 0.64, n)*LIFE_DHOW_LEN,
        sg*0.24*n);

    put(k*2+1, lifeDhowMix(LIFE_DHOW_BEAM*0.5 + 0.20*S, LIFE_DHOW_BEAM*0.5 + 1.75*S, n) * sg,
        lifeDhowMix(0.72*S, 0.25*S, n),
        lifeDhowMix(LIFE_DHOW_LEN*0.28, -LIFE_DHOW_LEN*0.02, n),
        lifeDhowMix(0.45*S, 0.34*S, n), lifeDhowMix(0.45*S, 0.34*S, n),
        lifeDhowMix(0.14, 0.80, n)*LIFE_DHOW_LEN);
  }
  /* the catch, heaped in the bin and proud of its rim when full */
  var h = Math.max(1e-4, cat*LIFE_DHOW_BIN_H*1.22);
  put(4, LIFE_DHOW_BIN_X, LIFE_DHOW_BIN_T + h*0.5, LIFE_DHOW_BIN_Z,
      LIFE_DHOW_BIN_W - LIFE_DHOW_BIN_T*2.4, h, LIFE_DHOW_BIN_L - LIFE_DHOW_BIN_T*2.4);
}

var LIFE_DHOW_DECK_Y = SEA + 0.70;

var LIFE_DHOW_FISH_DWELL = 15;
var LIFE_DHOW_NET_DROP = 3.2;    /* shooting the net, at the start of the dwell */
var LIFE_DHOW_NET_HAUL = 4.0;    /* hauling it back in, at the end of it — the catch comes up with it */
var LIFE_DHOW_UNLOAD   = 6.0;    /* emptying the bin onto the pier, at the start of the next dock */
function updateFishBoats(dt){
  var clock = performance.now()*0.001;
  LIFE_FISH_BOATS.forEach(function(b, bi){
    b.stateT += dt;
    var pos, yaw;
    if(b.state === 'docked'){
      pos = b; yaw = b.ry;
      b.net = 0;

      b.catch = b.unloadFrom * (1 - lifeDhowEase(b.stateT/LIFE_DHOW_UNLOAD));
      if(b.stateT >= b.dwell){
        var spot = lifeFishingSpot(b.home.x, b.home.z);
        b.fishX = spot[0]; b.fishZ = spot[1];
        b.curve = lifeBuildLegOpenWater(b.x, b.z, b.fishX, b.fishZ);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitOut'; b.stateT = 0;
        b.catch = 0; b.unloadFrom = 0;
      }
    }else if(b.state === 'fishing'){
      pos = b; yaw = b.ry;
      var ft = b.stateT, haulFrom = LIFE_DHOW_FISH_DWELL - LIFE_DHOW_NET_HAUL;
      if(ft < LIFE_DHOW_NET_DROP)      b.net = lifeDhowEase(ft/LIFE_DHOW_NET_DROP);
      else if(ft < haulFrom)           b.net = 1;
      else                             b.net = 1 - lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      b.catch = ft < haulFrom ? 0 : lifeDhowEase((ft-haulFrom)/LIFE_DHOW_NET_HAUL);
      if(b.stateT >= LIFE_DHOW_FISH_DWELL){
        b.net = 0; b.catch = 1;
        b.curve = lifeBuildLegOpenWater(b.fishX, b.fishZ, b.home.x, b.home.z);
        b.len = b.curve.getLength(); b.dur = Math.max(10, b.len/b.speed);
        b.state = 'transitIn'; b.stateT = 0;
      }
    }else{
      b.net = 0;
      if(b.state === 'transitOut') b.catch = 0;
      var raw = Math.min(1, b.stateT/b.dur);
      var t = raw*raw*(3-2*raw);
      b.curve.getPointAt(t, lifeDhowTmpPos);
      pos = lifeDhowTmpPos;
      var tTan = Math.min(0.995, Math.max(0.005, t));
      b.curve.getTangentAt(tTan, lifeDhowTmpDir);
      yaw = Math.atan2(lifeDhowTmpDir.x, lifeDhowTmpDir.z);
      b.x = pos.x; b.z = pos.z; b.ry = yaw;
      if(raw >= 1){
        if(b.state === 'transitOut'){
          b.x = b.fishX; b.z = b.fishZ;
          b.state = 'fishing'; b.stateT = 0;
        }else{
          b.x = b.home.x; b.z = b.home.z; b.ry = b.home.ry;
          b.state = 'docked'; b.stateT = 0; b.dwell = rr(10, 26);
          b.unloadFrom = b.catch;   /* full hold, handed ashore over the next LIFE_DHOW_UNLOAD seconds */
        }
      }
    }

    lifeDhowTmpPos.set(pos.x, SEA-0.15, pos.z);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat.setFromAxisAngle(LIFE_UP, yaw), lifeDhowTmpScale1);
    lifeDhowHullMesh.setMatrixAt(bi, lifeDhowTmpMat);

    lifeDhowTmpScaleS.set(1, 1 - 0.86*b.net, 1);
    lifeDhowTmpMat.compose(lifeDhowTmpPos, lifeDhowTmpQuat, lifeDhowTmpScaleS);
    lifeDhowSailMesh.setMatrixAt(bi, lifeDhowTmpMat);
    lifePlaceDhowCrew(bi*3, pos, yaw, LIFE_DHOW_DECK_Y, b, clock);
    lifePlaceDhowGear(bi, pos, yaw, b.net, b.catch);
  });
  lifeDhowHullMesh.instanceMatrix.needsUpdate = true;
  lifeDhowSailMesh.instanceMatrix.needsUpdate = true;
  lifeDhowCrewMesh.instanceMatrix.needsUpdate = true;
  lifeDhowGearMesh.instanceMatrix.needsUpdate = true;
}
