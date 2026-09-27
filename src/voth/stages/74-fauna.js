/* ==== AMBIENT WILDLIFE ==== */
reseed(840001);

/* ==== geometry: low-poly stylized silhouettes, all boxes (12 tris each) — ==== */
function faunaWingGeo(span, chord, thick, dihedral, sweep, side){
  var g = new THREE.BoxGeometry(span, thick, chord);
  g.translate(side*span/2, 0, 0);
  g.rotateZ(side*dihedral);
  g.rotateY(side*sweep);
  return g;
}

var FAUNA_GULL_BODY_COL = 0xdcd7c8;
var FAUNA_GULL_WING_COL = 0xb2ab99;
var gullBodyGeo = new THREE.BoxGeometry(0.40, 0.16, 1.05);
var gullWingGeo = [
  faunaWingGeo(1.15, 0.36, 0.05, 0.34, 0.22, -1),
  faunaWingGeo(1.15, 0.36, 0.05, 0.34, 0.22,  1)
];
var gullBodyMergedGeo = lifeMergeGeoms([
  { geo: gullBodyGeo, color: FAUNA_GULL_BODY_COL },
  { geo: gullWingGeo[0], color: FAUNA_GULL_WING_COL },
  { geo: gullWingGeo[1], color: FAUNA_GULL_WING_COL }
]);

var FAUNA_RACER_BODY_COL = 0x5c6a49;
var FAUNA_RACER_WING_COL = 0x3e4a34;
var racerBodyGeo = new THREE.BoxGeometry(0.55, 0.42, 2.6);
var racerTailGeo = new THREE.BoxGeometry(0.16, 0.14, 1.3).translate(0, 0, -1.95);
var racerWingGeo = [
  faunaWingGeo(2.2, 0.85, 0.07, 0.22, 0.30, -1),
  faunaWingGeo(2.2, 0.85, 0.07, 0.22, 0.30,  1)
];
var racerBodyMergedGeo = lifeMergeGeoms([
  { geo: racerBodyGeo, color: FAUNA_RACER_BODY_COL },
  { geo: racerTailGeo, color: FAUNA_RACER_BODY_COL },
  { geo: racerWingGeo[0], color: FAUNA_RACER_WING_COL },
  { geo: racerWingGeo[1], color: FAUNA_RACER_WING_COL }
]);

/* ==== pools ==== */
var FAUNA_GULL_N = 20, FAUNA_GULL_FLOCKS = 5;
var FAUNA_RACER_N = 12, FAUNA_RACER_FLOCKS = 3;

var gullMesh = new THREE.InstancedMesh(gullBodyMergedGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), FAUNA_GULL_N);
gullMesh.userData.inspectLabel = 'Seagull';
gullMesh.frustumCulled = false;
scene.add(gullMesh);

var racerMesh = new THREE.InstancedMesh(racerBodyMergedGeo,
  new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), FAUNA_RACER_N);
racerMesh.userData.inspectLabel = 'Cliff racer';
racerMesh.frustumCulled = false;
scene.add(racerMesh);

/* ==== flock centres: rejection-sampled against the exact water/land check ==== */
var FAUNA_WATER_ZONES = WATER.slice(0,3).filter(function(w){ return w.k==='c'; });
var FAUNA_LAND_ZONES  = RIDGES.slice(0,12);

function faunaWaterPoint(){
  for(var t=0; t<8; t++){
    var c = pick(FAUNA_WATER_ZONES);
    var a = rr(0, Math.PI*2), rad = rr(c.r*0.12, c.r*0.72);
    var x = c.x + Math.cos(a)*rad, z = c.z + Math.sin(a)*rad;
    if(terrainH(x,z) < -1.5) return [x,z];
  }
  return [LIFE_BAY_CENTER.x, LIFE_BAY_CENTER.z];
}
function faunaLandPoint(){
  for(var t=0; t<8; t++){
    var r = pick(FAUNA_LAND_ZONES);
    var a = rr(0, Math.PI*2), rad = rr(0, r[3]*0.55);
    var x = r[0] + Math.cos(a)*rad, z = r[1] + Math.sin(a)*rad;
    if(terrainH(x,z) > 0) return [x,z];
  }
  return [FAUNA_LAND_ZONES[0][0], FAUNA_LAND_ZONES[0][1]];
}

/* ==== build the flocks: each flock owns a centre/radius/speed/altitude; ==== */
function faunaBuildFlocks(n, flockCount, isWater){
  var flocks = [];
  for(var f=0; f<flockCount; f++){
    var p = isWater ? faunaWaterPoint() : faunaLandPoint();
    var flock = {
      cx: p[0], cz: p[1],
      radius: isWater ? rr(38, 85) : rr(70, 150),
      ellipse: rr(0.62, 1.0),
      angSpeed: (isWater ? rr(0.24, 0.52) : rr(0.07, 0.16)) * (chance(0.5) ? 1 : -1),
      baseY: isWater ? (SEA + rr(16, 30)) : (terrainH(p[0], p[1]) + rr(65, 140)),
      birds: []
    };
    flocks.push(flock);
  }
  for(var i=0; i<n; i++){
    var flock = flocks[i % flockCount];
    flock.birds.push({
      radius: flock.radius * rr(0.65, 1.12),
      phase: rr(0, Math.PI*2),
      hJit: isWater ? rr(-5, 5) : rr(-14, 14),
      bobAmp: isWater ? rr(1.2, 3.2) : rr(2.5, 6.0),
      bobFreq: isWater ? rr(0.35, 0.85) : rr(0.18, 0.42),
      bobPhase: rr(0, Math.PI*2),
      scale: rr(0.82, 1.18)
    });
  }
  return flocks;
}
var FAUNA_GULLS  = faunaBuildFlocks(FAUNA_GULL_N,  FAUNA_GULL_FLOCKS,  true);
var FAUNA_RACERS = faunaBuildFlocks(FAUNA_RACER_N, FAUNA_RACER_FLOCKS, false);

window._fauna = {
  gulls: FAUNA_GULL_N, gullFlocks: FAUNA_GULLS.map(function(f){ return {x:f.cx|0, z:f.cz|0, y:f.baseY|0, r:f.radius|0}; }),
  racers: FAUNA_RACER_N, racerFlocks: FAUNA_RACERS.map(function(f){ return {x:f.cx|0, z:f.cz|0, y:f.baseY|0, r:f.radius|0}; })
};

/* ==== per-frame update: pure parametric ellipse + slow bob, no physics. ==== */
var faunaTmpPos = new THREE.Vector3();
var faunaTmpQuat = new THREE.Quaternion();
var faunaTmpScale = new THREE.Vector3();
var faunaTmpMat = new THREE.Matrix4();

function faunaWriteFlocks(mesh, flocks, t){
  var slot = 0;
  flocks.forEach(function(flock){
    flock.birds.forEach(function(b){
      var ang = b.phase + t*flock.angSpeed;
      var x = flock.cx + Math.cos(ang)*b.radius;
      var z = flock.cz + Math.sin(ang)*b.radius*flock.ellipse;
      var y = flock.baseY + b.hJit + Math.sin(t*b.bobFreq + b.bobPhase)*b.bobAmp;
      var dx = -Math.sin(ang)*flock.angSpeed;
      var dz =  Math.cos(ang)*flock.ellipse*flock.angSpeed;
      var yaw = Math.atan2(dx, dz);
      faunaTmpPos.set(x, y, z);
      faunaTmpQuat.setFromAxisAngle(LIFE_UP, yaw);
      faunaTmpScale.set(b.scale, b.scale, b.scale);
      faunaTmpMat.compose(faunaTmpPos, faunaTmpQuat, faunaTmpScale);
      mesh.setMatrixAt(slot, faunaTmpMat);
      slot++;
    });
  });
  mesh.instanceMatrix.needsUpdate = true;
}

var AMBIENT_T = 0;
function updateAmbientFauna(dt){
  AMBIENT_T += dt;
  faunaWriteFlocks(gullMesh, FAUNA_GULLS, AMBIENT_T);
  faunaWriteFlocks(racerMesh, FAUNA_RACERS, AMBIENT_T);
}

updateAmbientFauna(0);

(function faunaLoop(){
  var last = performance.now();
  animHooks.push(function(now){
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateAmbientFauna(dt);
  });
})();
