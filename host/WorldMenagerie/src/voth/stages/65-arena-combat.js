/* ==== ARENA GLADIATOR COMBAT ==== */

var ARENA_COL_BLOOD   = 0x8e2a2b;   /* a fresh corpse - bloodied, and light enough to still read as a BODY against the dark field paving rather than as a shadow */
var ARENA_COL_ATTEND  = 0x3b342c;   /* pit attendants: dark, unmemorable */
var ARENA_COL_CONDEMN = 0xa39a86;   /* the unarmed: undyed sackcloth */
var ARENA_COL_TIGER   = 0xbe7530;
var ARENA_COL_LIZARD  = 0x6d8a4b;
var ARENA_COL_BEETLE  = 0x4b4034;

var ARENA_HOUR_OPEN  = 12;
var ARENA_HOUR_CLOSE = 18;   /* sundown, same constant the shopkeeper/quarry cycles use */

var ARENA_BOUT_N = 3;                 /* three pairings on the sand at once */
var ARENA_HUM_PER_BOUT = 7;           /* up to 5 combatants + 2 attendants */
var ARENA_HUMAN_N  = ARENA_BOUT_N * ARENA_HUM_PER_BOUT;
var ARENA_QUAD_N   = ARENA_BOUT_N * 2;
var ARENA_BEETLE_N = ARENA_BOUT_N * 2;

/* ==== geometry ==== */
var APS = LIFE_PEOPLE_SCALE;

var lifeGladParts = [
  /* legs: staggered stance, right foot back under the sword arm */
  { geo: new THREE.BoxGeometry(0.19*APS, 0.09*APS, 0.40*APS).translate( 0.17*APS, 0.045*APS, -0.06*APS), color: 0x6f6659 },
  { geo: new THREE.BoxGeometry(0.19*APS, 0.09*APS, 0.40*APS).translate(-0.17*APS, 0.045*APS,  0.16*APS), color: 0x6f6659 },
  { geo: new THREE.CylinderGeometry(0.110*APS, 0.085*APS, 0.38*APS, 6).translate( 0.17*APS, 0.22*APS, -0.04*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.110*APS, 0.085*APS, 0.38*APS, 6).translate(-0.17*APS, 0.22*APS,  0.12*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.140*APS, 0.115*APS, 0.34*APS, 6).translate( 0.16*APS, 0.55*APS, -0.02*APS), color: 0xa39a8b },
  { geo: new THREE.CylinderGeometry(0.140*APS, 0.115*APS, 0.34*APS, 6).translate(-0.16*APS, 0.55*APS,  0.07*APS), color: 0xa39a8b },

  { geo: new THREE.CylinderGeometry(0.27*APS, 0.33*APS, 0.20*APS, 8).translate(0, 0.72*APS, 0.02*APS), color: 0xd6cec2 },
  { geo: new THREE.CylinderGeometry(0.27*APS, 0.27*APS, 0.07*APS, 8).translate(0, 0.825*APS, 0.02*APS), color: 0x8e8578 },
  /* torso, shoulder yoke, neck */
  { geo: new THREE.CylinderGeometry(0.31*APS, 0.25*APS, 0.32*APS, 8).translate(0, 0.98*APS, 0.01*APS), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.76*APS, 0.17*APS, 0.34*APS).translate(0, 1.105*APS, 0.01*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.10*APS, 0.11*APS, 0.08*APS, 6).translate(0, 1.185*APS, 0.01*APS), color: 0xcfcac2 },

  { geo: new THREE.BoxGeometry(0.32*APS, 0.24*APS, 0.34*APS).translate(0, 1.28*APS, 0.01*APS), color: 0xcfcac2 },
  { geo: new THREE.BoxGeometry(0.06*APS, 0.065*APS, 0.26*APS).translate(0, 1.4125*APS, 0.00*APS), color: 0xb7442f },

  { geo: new THREE.CylinderGeometry(0.095*APS, 0.085*APS, 0.32*APS, 6).rotateZ(-0.30).translate( 0.40*APS, 0.99*APS, 0.02*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.095*APS, 0.085*APS, 0.32*APS, 6).rotateZ( 0.30).translate(-0.40*APS, 0.99*APS, 0.02*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.085*APS, 0.080*APS, 0.30*APS, 6).rotateX(-0.50).rotateZ(-0.14).translate( 0.47*APS, 0.94*APS, 0.11*APS), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.085*APS, 0.080*APS, 0.28*APS, 6).rotateX(-1.15).translate(-0.42*APS, 0.88*APS, 0.13*APS), color: 0xffffff },
  /* the round shield, face-on to +z with a raised boss */
  { geo: new THREE.CylinderGeometry(0.30*APS, 0.30*APS, 0.06*APS, 10).rotateX(Math.PI/2).translate(-0.43*APS, 0.92*APS, 0.27*APS), color: 0x8a8378 },
  { geo: new THREE.SphereGeometry(0.11*APS, 8, 4, 0, Math.PI*2, 0, Math.PI*0.5).rotateX(Math.PI/2).translate(-0.43*APS, 0.92*APS, 0.30*APS), color: 0xd4d8de },

  { geo: new THREE.CylinderGeometry(0.045*APS, 0.045*APS, 0.22*APS, 6).translate(0.50*APS, 1.08*APS, 0.16*APS), color: 0x6b5a45 },
  { geo: new THREE.BoxGeometry(0.30*APS, 0.055*APS, 0.09*APS).translate(0.50*APS, 1.205*APS, 0.16*APS), color: 0xd0d5dc },
  { geo: new THREE.CylinderGeometry(0.018*APS, 0.085*APS, 0.95*APS, 4).rotateY(Math.PI/4).scale(1,1,0.40).translate(0.50*APS, 1.71*APS, 0.16*APS), color: 0xd0d5dc }
];
var lifeGladGeo = lifeMergeGeoms(lifeGladParts);
var lifeGladMesh = new THREE.InstancedMesh(lifeGladGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_HUMAN_N);
lifeGladMesh.userData.life = true; lifeGladMesh.userData.inspectLabel = 'Gladiator';
lifeGladMesh.frustumCulled = false;
scene.add(lifeGladMesh);

var lifeABeastParts = [
  { geo: new THREE.CylinderGeometry(0.75, 0.90, 3.60, 8).rotateX(Math.PI/2).translate(0, 1.50, 0.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(1.10, 1.00, 1.20).translate(0, 1.75, 2.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.80, 0.50, 0.80).translate(0, 1.45, 2.85), color: 0xe8e0d2 },   /* snout/jaw, paler */
  { geo: new THREE.CylinderGeometry(0.12, 0.28, 2.00, 6).rotateX(Math.PI/2).translate(0, 1.60, -2.60), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate( 0.62, 0.75,  1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate(-0.62, 0.75,  1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate( 0.62, 0.75, -1.20), color: 0xffffff },
  { geo: new THREE.CylinderGeometry(0.24, 0.30, 1.50, 5).translate(-0.62, 0.75, -1.20), color: 0xffffff },

  { geo: new THREE.SphereGeometry(0.62, 8, 5).scale(0.95, 0.90, 1.15).translate( 0.58, 1.38,  1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.62, 8, 5).scale(0.95, 0.90, 1.15).translate(-0.58, 1.38,  1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.70, 8, 5).scale(0.95, 0.92, 1.15).translate( 0.58, 1.32, -1.20), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.70, 8, 5).scale(0.95, 0.92, 1.15).translate(-0.58, 1.32, -1.20), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate( 0.62, 0.12,  1.28), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate(-0.62, 0.12,  1.28), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate( 0.62, 0.12, -1.12), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.52, 0.24, 0.66).translate(-0.62, 0.12, -1.12), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.26, 0.34, 0.12).translate( 0.36, 2.34,  2.00), color: 0xe8e0d2 },
  { geo: new THREE.BoxGeometry(0.26, 0.34, 0.12).translate(-0.36, 2.34,  2.00), color: 0xe8e0d2 }
];
var lifeABeastGeo = lifeMergeGeoms(lifeABeastParts);
var lifeABeastMesh = new THREE.InstancedMesh(lifeABeastGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_QUAD_N);
lifeABeastMesh.userData.life = true; lifeABeastMesh.userData.inspectLabel = 'Arena beast';
lifeABeastMesh.frustumCulled = false;
scene.add(lifeABeastMesh);

var ABEETLE_LEGH = 1.42;
var lifeABeetleParts = [
  { geo: new THREE.SphereGeometry(1.50, 12, 6, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.88, 1).translate(0, ABEETLE_LEGH, -1.38), color: 0xffffff },
  { geo: new THREE.SphereGeometry(1.00, 10, 5, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.94, 1).translate(0, ABEETLE_LEGH, 0.28), color: 0xffffff },
  { geo: new THREE.SphereGeometry(0.55,  8, 4, 0, Math.PI*2, 0, Math.PI*0.5).scale(1, 0.86, 1).translate(0, ABEETLE_LEGH+0.15, 1.84), color: 0xe6e6e6 },
  { geo: new THREE.BoxGeometry(0.09, 0.09, 1.10).rotateY( 0.40).translate( 0.38, ABEETLE_LEGH+0.70, 2.30), color: 0xdddddd },
  { geo: new THREE.BoxGeometry(0.09, 0.09, 1.10).rotateY(-0.40).translate(-0.38, ABEETLE_LEGH+0.70, 2.30), color: 0xdddddd },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 0.85, ABEETLE_LEGH*0.5,  0.28), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-0.85, ABEETLE_LEGH*0.5,  0.28), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 1.20, ABEETLE_LEGH*0.5, -0.92), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-1.20, ABEETLE_LEGH*0.5, -0.92), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate( 0.83, ABEETLE_LEGH*0.5, -2.02), color: 0xcccccc },
  { geo: new THREE.CylinderGeometry(0.16,0.16,ABEETLE_LEGH,5).translate(-0.83, ABEETLE_LEGH*0.5, -2.02), color: 0xcccccc }
];
var lifeABeetleGeo = lifeMergeGeoms(lifeABeetleParts);
var lifeABeetleMesh = new THREE.InstancedMesh(lifeABeetleGeo,
  new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_BEETLE_N);
lifeABeetleMesh.userData.life = true; lifeABeetleMesh.userData.inspectLabel = 'Arena beetle';
lifeABeetleMesh.frustumCulled = false;
scene.add(lifeABeetleMesh);

/* ==== the crowd ==== */
var ARENA_CROWD_SEATS = (typeof ARENA_SEATS !== 'undefined' && ARENA_SEATS) ? ARENA_SEATS : [];
var ARENA_CROWD_N = ARENA_CROWD_SEATS.length;

var lifeCrowdParts = [
  { geo: new THREE.CylinderGeometry(0.52, 0.62, 1.30, 6).translate(0, 0.65, 0), color: 0xffffff },
  { geo: new THREE.BoxGeometry(1.06, 0.26, 0.64).translate(0, 1.38, 0), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.62, 0.60, 0.62).translate(0, 1.83, 0), color: ARENA_SKIN },
  { geo: new THREE.BoxGeometry(0.86, 0.34, 0.56).translate(0, 0.20, 0.46), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.18, 0.88, 0.26).translate( 0.60, 0.74, 0.10), color: 0xffffff },
  { geo: new THREE.BoxGeometry(0.18, 0.88, 0.26).translate(-0.60, 0.74, 0.10), color: 0xffffff }
];
var lifeCrowdGeo = ARENA_CROWD_N ? lifeMergeGeoms(lifeCrowdParts) : null;
var lifeCrowdMesh = null;

var CR_PH=null, CR_P2=null, CR_P3=null, CR_RT=null, CR_ANG=null, CR_ARR=null;
if(ARENA_CROWD_N){
  lifeCrowdMesh = new THREE.InstancedMesh(lifeCrowdGeo,
    new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), ARENA_CROWD_N);
  lifeCrowdMesh.userData.life = true; lifeCrowdMesh.userData.inspectLabel = 'Arena spectator';
  lifeCrowdMesh.frustumCulled = false;
  CR_PH = new Float32Array(ARENA_CROWD_N); CR_P2 = new Float32Array(ARENA_CROWD_N);
  CR_P3 = new Float32Array(ARENA_CROWD_N); CR_RT = new Float32Array(ARENA_CROWD_N);
  CR_ANG= new Float32Array(ARENA_CROWD_N); CR_ARR= new Float32Array(ARENA_CROWD_N);
  var _crC = new THREE.Color(), _crM = new THREE.Matrix4();
  var _crCx = (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE.x : 0;
  var _crCz = (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE.z : 0;
  _crM.compose(new THREE.Vector3(0,-500,0), new THREE.Quaternion(), new THREE.Vector3(0,0,0));
  for(var ci2=0; ci2<ARENA_CROWD_N; ci2++){
    var st = ARENA_CROWD_SEATS[ci2];
    CR_PH[ci2]  = arenaHash2(st.x*0.31, st.z*0.27 + 3.1) * Math.PI*2;
    CR_P2[ci2]  = arenaHash2(st.x*0.19 + 7.7, st.z*0.43) * Math.PI*2;
    CR_P3[ci2]  = arenaHash2(st.x*0.53 + 17.3, st.z*0.11 + 5.9) * Math.PI*2;
    CR_RT[ci2]  = 0.55 + arenaHash2(st.z*0.37 + 23.1, st.x*0.29) * 0.75;
    CR_ANG[ci2] = Math.atan2(st.z - _crCz, st.x - _crCx);
    CR_ARR[ci2] = arenaHash2(st.x*0.13 + 31.7, st.z*0.17 + 11.3);
    lifeCrowdMesh.setMatrixAt(ci2, _crM);                       /* parked until the house opens */
    lifeCrowdMesh.setColorAt(ci2, _crC.set(st.col).convertSRGBToLinear());
  }
  lifeCrowdMesh.instanceMatrix.needsUpdate = true;
  if(lifeCrowdMesh.instanceColor) lifeCrowdMesh.instanceColor.needsUpdate = true;
  scene.add(lifeCrowdMesh);
}

window._arenaCrowd = {
  seats: ARENA_CROWD_N,
  drawCalls: lifeCrowdMesh ? 1 : 0,
  trisEach: lifeCrowdGeo ? lifeCrowdGeo.attributes.position.count/3 : 0,
  triangles: lifeCrowdGeo ? ARENA_CROWD_N*lifeCrowdGeo.attributes.position.count/3 : 0,
  gladTrisEach: lifeGladGeo.attributes.position.count/3,
  gladParts: lifeGladParts.length,
  beastTrisEach: lifeABeastGeo.attributes.position.count/3,
  staticInstancesFreed: ARENA_CROWD_N*2
};

/* ==== the roster ==== */
var ARENA_CARDS = [
  { key:'duel',    w:3, note:'matched pair, blade and shield',       a:[['h','armed']],                            b:[['h','armed']] },
  { key:'twoOne',  w:4, note:'two on one',                           a:[['h','armed'],['h','armed']],              b:[['h','armed']] },
  { key:'threeTwo',w:2, note:'three on two, one of them unarmed',    a:[['h','armed'],['h','armed'],['h','armed']],b:[['h','armed'],['h','unarmed']] },
  { key:'noxii',   w:3, note:'condemned man, no blade, against a tiger', a:[['h','unarmed']],                      b:[['b','tiger']] },
  { key:'hunt',    w:3, note:'two hunters against a pit lizard',     a:[['h','armed'],['h','armed']],              b:[['b','lizard']] },
  { key:'shell',   w:2, note:'one blade against a shell',            a:[['h','armed']],                            b:[['b','beetle']] },
  { key:'swarm',   w:2, note:'one man, two beasts',                  a:[['h','armed']],                            b:[['b','beetle'],['b','lizard']] },
  { key:'mixed',   w:2, note:'an armed man and a condemned one, against a tiger', a:[['h','armed'],['h','unarmed']], b:[['b','tiger']] }
];
var ARENA_STR = { armed:1.00, unarmed:0.42, tiger:1.80, lizard:1.20, beetle:1.45 };
var ARENA_CARD_WSUM = 0;
ARENA_CARDS.forEach(function(c){ ARENA_CARD_WSUM += c.w; });

/* ==== bouts ==== */
var ARENA_BOUTS = [];
(function(){
  if(typeof ARENA_SITE === 'undefined' || !ARENA_SITE) return;
  var S = ARENA_SITE, R = S.fieldHalf * 0.52;
  for(var i=0;i<ARENA_BOUT_N;i++){
    var a = Math.PI*0.5 + i*(Math.PI*2/ARENA_BOUT_N);
    ARENA_BOUTS.push({
      i: i,
      sx: S.x + Math.cos(a)*R, sz: S.z + Math.sin(a)*R,
      state: 'idle', t: 0, idleFor: 2 + i*3,
      card: null, side: [[],[]], corpses: [], attend: [],
      orbAng: i*1.1, orbSpin: (i%2 ? 0.26 : -0.22),
      killAt: 0, exitT: 0, clearIdx: 0, clearPhase: 'fetch', clearT: 0,
      humBase: i*ARENA_HUM_PER_BOUT, humUsed: 0,
      quadBase: i*2, quadUsed: 0, beetleBase: i*2, beetleUsed: 0,
      kills: 0
    });
  }
})();

window._arena = {
  site: (typeof ARENA_SITE !== 'undefined' && ARENA_SITE) ? ARENA_SITE : null,
  bouts: ARENA_BOUTS, open: ARENA_HOUR_OPEN, close: ARENA_HOUR_CLOSE,
  cards: ARENA_CARDS.map(function(c){ return c.key + ' (' + c.note + ')'; }),
  crowd: function(){ return { seats: ARENA_CROWD_N,
                              fill: +arenaCrowdFill(dayNightHour()).toFixed(2),
                              arousal: +ARENA_CROWD_EXC.toFixed(2) }; },
  running: function(){ var h = dayNightHour(); return h >= ARENA_HOUR_OPEN && h < ARENA_HOUR_CLOSE; },

  brazierLit: function(){ return (window._dayNight && window._dayNight.brazierLit()) || false; },
  state: function(){ return ARENA_BOUTS.map(function(b){
    return { state:b.state, card:b.card?b.card.key:null, kills:b.kills,
             alive:[b.side[0].filter(function(f){return f.alive;}).length,
                    b.side[1].filter(function(f){return f.alive;}).length],
             corpses:b.corpses.length }; }); }
};

/* ==== per-frame ==== */
var ARENA_T = 0;
var arenaTmpPos = new THREE.Vector3(), arenaTmpQ = new THREE.Quaternion();
var arenaTmpQ2 = new THREE.Quaternion(), arenaTmpQ3 = new THREE.Quaternion();
var arenaTmpMat = new THREE.Matrix4();
var arenaScale1 = new THREE.Vector3(1,1,1), arenaScale0 = new THREE.Vector3(0,0,0);
var arenaScaleV = new THREE.Vector3(1,1,1);
var arenaAxisX = new THREE.Vector3(1,0,0), arenaAxisZ = new THREE.Vector3(0,0,1);

var ARENA_LIE_Y = 0.30*LIFE_PEOPLE_SCALE;      /* half the torso's own radius-ish: a human on his back */
var ARENA_LIE_Y_BEAST = 0.95;                   /* the quadruped/beetle body, rolled onto its flank */
var arenaTmpCol = new THREE.Color();
var ARENA_MESH_DIRTY = { h:false, q:false, t:false };

function arenaMeshFor(f){
  return f.mesh === 'h' ? lifeGladMesh : (f.mesh === 'q' ? lifeABeastMesh : lifeABeetleMesh);
}
function arenaHide(f){
  arenaTmpMat.compose(arenaTmpPos.set(0,-500,0), arenaTmpQ.identity(), arenaScale0);
  arenaMeshFor(f).setMatrixAt(f.slot, arenaTmpMat);
  ARENA_MESH_DIRTY[f.mesh] = true;
}

function arenaPlace(f, x, y, z, yaw, pitch, roll, sc){
  arenaTmpQ.setFromAxisAngle(LIFE_UP, yaw);
  if(pitch){ arenaTmpQ2.setFromAxisAngle(arenaAxisX, pitch); arenaTmpQ.multiply(arenaTmpQ2); }
  if(roll){ arenaTmpQ3.setFromAxisAngle(arenaAxisZ, roll); arenaTmpQ.multiply(arenaTmpQ3); }
  arenaScaleV.set(sc, sc, sc);
  arenaTmpMat.compose(arenaTmpPos.set(x,y,z), arenaTmpQ, arenaScaleV);
  arenaMeshFor(f).setMatrixAt(f.slot, arenaTmpMat);
  ARENA_MESH_DIRTY[f.mesh] = true;
}

function arenaTint(f, hex){
  var m = arenaMeshFor(f);
  m.setColorAt(f.slot, arenaTmpCol.set(hex).convertSRGBToLinear());
  if(m.instanceColor) m.instanceColor.needsUpdate = true;
}

var arenaLiveryTmp = new THREE.Color(), arenaLiveryBase = new THREE.Color(0xc2bcae);
function arenaLivery(hex){ return arenaLiveryTmp.set(hex).lerp(arenaLiveryBase, 0.55).getHex(); }

function arenaPickCard(){
  var r = rnd()*ARENA_CARD_WSUM, acc = 0;
  for(var i=0;i<ARENA_CARDS.length;i++){ acc += ARENA_CARDS[i].w; if(r < acc) return ARENA_CARDS[i]; }
  return ARENA_CARDS[0];
}
function arenaRoll(b){
  var S = ARENA_SITE;
  b.card = arenaPickCard();
  b.side = [[],[]];
  b.corpses = []; b.attend = [];
  b.humUsed = 0; b.quadUsed = 0; b.beetleUsed = 0;
  b.kills = 0; b.exitT = 0; b.clearIdx = 0; b.clearPhase = 'fetch'; b.clearT = 0;
  [b.card.a, b.card.b].forEach(function(list, sideIdx){
    list.forEach(function(entry){
      var f;
      if(entry[0] === 'h'){
        f = { mesh:'h', slot: b.humBase + b.humUsed++, role: entry[1], side: sideIdx,
              str: ARENA_STR[entry[1]], alive:true, dieT:0, sc:1,
              rate: rr(1.8, 2.8), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, entry[1] === 'unarmed' ? ARENA_COL_CONDEMN
                                            : arenaLivery(BANNERC[Math.floor(rnd()*4)]));
      }else if(entry[1] === 'beetle'){
        f = { mesh:'t', slot: b.beetleBase + b.beetleUsed++, role:'beetle', side: sideIdx,
              str: ARENA_STR.beetle, alive:true, dieT:0, sc:1.15,
              rate: rr(1.1, 1.6), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, ARENA_COL_BEETLE);
      }else{
        f = { mesh:'q', slot: b.quadBase + b.quadUsed++, role: entry[1], side: sideIdx,
              str: ARENA_STR[entry[1]], alive:true, dieT:0,
              sc: entry[1] === 'tiger' ? 1.15 : 0.92,
              rate: rr(1.3, 1.9), phase: arenaPhaseFor(sideIdx), x:S.gateX, z:S.gateZ, yaw:0 };
        arenaTint(f, entry[1] === 'tiger' ? ARENA_COL_TIGER : ARENA_COL_LIZARD);
      }
      f.reach = f.mesh === 'h' ? rr(2.6,3.4) : rr(3.6,4.8);

      f.gateOff = (b.side[0].length + b.side[1].length + sideIdx*0.5 - 1.5) * 1.5;
      b.side[sideIdx].push(f);
    });
  });

  for(var k=0;k<2;k++){
    var at = { mesh:'h', slot: b.humBase + ARENA_HUM_PER_BOUT - 2 + k, role:'attendant',
               alive:true, sc:1, x:S.gateX, z:S.gateZ, yaw:0, side:-1 };
    arenaTint(at, ARENA_COL_ATTEND);
    b.attend.push(at);
  }
  b.state = 'enter'; b.t = 0;
  arenaCrowdRoar(0.35);              /* a stir as the next pairing comes out of the pit */

  b.enterFor = rr(3.2, 4.4);
  b.killAt = rr(5, 10);
}

function arenaPhaseFor(sideIdx){ return sideIdx*Math.PI + rr(-0.45, 0.45); }

function arenaSideStr(b, s){
  var t = 0;
  b.side[s].forEach(function(f){ if(f.alive) t += f.str; });
  return t;
}
function arenaFightBase(b, f, out){
  var mates = b.side[f.side], n = mates.length, m = mates.indexOf(f);
  var R = 5.8 + (f.mesh === 'h' ? 0 : 1.6);
  var ang = b.orbAng + f.side*Math.PI + (m - (n-1)*0.5)*0.58;
  out[0] = b.sx + Math.cos(ang)*R;
  out[1] = b.sz + Math.sin(ang)*R;
}
var arenaBaseTmp = [0,0], arenaFoeTmp = [0,0];
function arenaFoeCentre(b, side, out){
  var foes = b.side[1-side], n = 0, sx = 0, sz = 0;
  foes.forEach(function(g){ if(g.alive){ sx += g.x; sz += g.z; n++; } });
  if(!n){ out[0] = b.sx; out[1] = b.sz; return; }
  out[0] = sx/n; out[1] = sz/n;
}

/* ==== the crowd, per frame ==== */
var ARENA_CROWD_EXC = 0;          /* arousal, 0..1.35, decaying */
var ARENA_CROWD_LEAD = 2;         /* game-hours the house takes to fill, before ARENA_HOUR_OPEN */
var ARENA_CROWD_TAIL = 1;         /* and to empty, after ARENA_HOUR_CLOSE */
var arenaCrowdParked = false;
var crowdTmpQ = new THREE.Quaternion(), crowdTmpQ2 = new THREE.Quaternion();
var crowdTmpPos = new THREE.Vector3(), crowdTmpSc = new THREE.Vector3();
var crowdTmpMat = new THREE.Matrix4();

/* the only thing that drives the crowd's excitement is the fight itself */
function arenaCrowdRoar(amount){
  ARENA_CROWD_EXC = Math.min(1.35, ARENA_CROWD_EXC + amount);
}
function arenaCrowdFill(hour){
  if(hour <= ARENA_HOUR_OPEN - ARENA_CROWD_LEAD) return 0;
  if(hour <  ARENA_HOUR_OPEN)  return (hour - (ARENA_HOUR_OPEN - ARENA_CROWD_LEAD)) / ARENA_CROWD_LEAD;
  if(hour <= ARENA_HOUR_CLOSE) return 1;
  if(hour <  ARENA_HOUR_CLOSE + ARENA_CROWD_TAIL) return 1 - (hour - ARENA_HOUR_CLOSE)/ARENA_CROWD_TAIL;
  return 0;
}
function arenaCrowdUpdate(dt, hour){
  if(!lifeCrowdMesh) return;
  ARENA_CROWD_EXC = Math.max(0, ARENA_CROWD_EXC - dt*0.55);
  var fill = arenaCrowdFill(hour);
  if(fill <= 0){

    if(!arenaCrowdParked){
      crowdTmpMat.compose(crowdTmpPos.set(0,-500,0), crowdTmpQ.identity(), crowdTmpSc.set(0,0,0));
      for(var p=0;p<ARENA_CROWD_N;p++) lifeCrowdMesh.setMatrixAt(p, crowdTmpMat);
      lifeCrowdMesh.instanceMatrix.needsUpdate = true;
      arenaCrowdParked = true;
    }
    return;
  }
  arenaCrowdParked = false;
  var t = ARENA_T, exc = ARENA_CROWD_EXC;
  for(var i=0;i<ARENA_CROWD_N;i++){
    var s = ARENA_CROWD_SEATS[i];

    var vis = (fill - CR_ARR[i]) * 6;
    if(vis <= 0){
      crowdTmpMat.compose(crowdTmpPos.set(s.x, s.y, s.z), crowdTmpQ.identity(), crowdTmpSc.set(0,0,0));
      lifeCrowdMesh.setMatrixAt(i, crowdTmpMat);
      continue;
    }
    var sc = vis >= 1 ? 1 : vis*vis*(3-2*vis);
    var r = CR_RT[i];
    var sway = Math.sin(t*r + CR_PH[i]);                 /* weight shifting side to side */
    var lean = Math.sin(t*r*0.61 + CR_P2[i]);            /* forward/back on the bench      */
    var turn = Math.sin(t*r*0.37 + CR_P3[i]);            /* glancing along the row         */

    var wv = Math.sin(CR_ANG[i]*1.7 - t*1.15 + CR_P2[i]*0.22);
    var w  = wv > 0 ? wv*wv : 0;
    var rise  = (0.16 + 1.05*exc) * w;                   /* half out of the seat on a kill */
    var pitch = 0.13*lean + 0.34*rise;                   /* leaning into the fight         */
    var yaw   = s.ry + 0.20*turn + 0.12*sway*exc;
    crowdTmpQ.setFromAxisAngle(LIFE_UP, yaw);
    crowdTmpQ2.setFromAxisAngle(arenaAxisX, pitch);
    crowdTmpQ.multiply(crowdTmpQ2);
    crowdTmpPos.set(s.x, s.y + 0.09*sway + 0.85*rise, s.z);
    crowdTmpSc.set(sc, sc, sc);
    crowdTmpMat.compose(crowdTmpPos, crowdTmpQ, crowdTmpSc);
    lifeCrowdMesh.setMatrixAt(i, crowdTmpMat);
  }
  lifeCrowdMesh.instanceMatrix.needsUpdate = true;
}

function updateArena(dt){
  if(typeof ARENA_SITE === 'undefined' || !ARENA_SITE || !ARENA_BOUTS.length) return;
  ARENA_T += dt;
  var S = ARENA_SITE, FY = S.fieldY;
  var hour = (typeof dayNightHour === 'function') ? dayNightHour() : 12;
  var openNow = (hour >= ARENA_HOUR_OPEN && hour < ARENA_HOUR_CLOSE);
  ARENA_MESH_DIRTY.h = ARENA_MESH_DIRTY.q = ARENA_MESH_DIRTY.t = false;
  arenaCrowdUpdate(dt, hour);      /* the stands — see the rig above */

  ARENA_BOUTS.forEach(function(b){
    b.t += dt;
    b.orbAng += dt * b.orbSpin;

    /* closing time: the sand clears whatever was happening on it. */
    if(!openNow && b.state !== 'idle'){
      b.side[0].concat(b.side[1]).forEach(arenaHide);
      b.attend.forEach(arenaHide);
      b.state = 'idle'; b.t = 0; b.idleFor = 1;
      b.side = [[],[]]; b.corpses = []; b.attend = [];
      return;
    }
    if(b.state === 'idle'){
      if(openNow && b.t >= b.idleFor) arenaRoll(b);
      return;
    }

    /* ==== entering: out of the pit gate and onto the sand ==== */
    if(b.state === 'enter'){
      var u = Math.min(1, b.t / b.enterFor), us = u*u*(3-2*u);
      b.side[0].concat(b.side[1]).forEach(function(f){
        arenaFightBase(b, f, arenaBaseTmp);
        var g0x = S.gateX + f.gateOff, g0z = S.gateZ;
        var x = g0x + (arenaBaseTmp[0]-g0x)*us;
        var z = g0z + (arenaBaseTmp[1]-g0z)*us;
        f.x = x; f.z = z;
        var yaw = Math.atan2(arenaBaseTmp[0]-g0x, arenaBaseTmp[1]-g0z);
        f.yaw = yaw;
        /* a walking bob, and the blade carried low (roll the other way) */
        var bob = Math.abs(Math.sin(b.t*5.2 + f.phase))*0.28;
        arenaPlace(f, x, FY + bob, z, yaw, 0, -0.20, f.sc);
      });
      b.attend.forEach(arenaHide);
      if(u >= 1){ b.state = 'fight'; b.t = 0; }
      return;
    }

    /* ==== fighting ==== */
    if(b.state === 'fight'){
      [0,1].forEach(function(s){
        arenaFoeCentre(b, s, arenaFoeTmp);
        b.side[s].forEach(function(f){
          if(!f.alive){

            f.dieT = Math.min(1.4, f.dieT + dt);
            var k = f.dieT/1.4, ks = k*k*(3-2*k);
            if(f.mesh === 'h'){
              arenaPlace(f, f.x, FY + ks*ARENA_LIE_Y, f.z, f.yaw, ks*Math.PI*0.5, ks*0.22, f.sc);
            }else{
              arenaPlace(f, f.x, FY + ks*ARENA_LIE_Y_BEAST*f.sc, f.z, f.yaw, 0, ks*Math.PI*0.5, f.sc);
            }
            return;
          }
          arenaFightBase(b, f, arenaBaseTmp);
          var tx = arenaFoeTmp[0] - arenaBaseTmp[0], tz = arenaFoeTmp[1] - arenaBaseTmp[1];
          var L = Math.hypot(tx,tz) || 1; tx /= L; tz /= L;

          var ph = Math.sin(ARENA_T*f.rate + f.phase);
          var adv = ph > 0 ? ph*ph*f.reach : -(ph*ph)*1.1;
          var x = arenaBaseTmp[0] + tx*adv, z = arenaBaseTmp[1] + tz*adv;
          f.x = x; f.z = z;
          f.yaw = Math.atan2(tx, tz);
          var pitch = ph > 0 ?  ph*ph*0.38 : -(ph*ph)*0.18;
          var roll  = f.mesh === 'h' ? (ph > 0 ? -ph*ph*0.26 : ph*ph*0.11) : 0;

          var hop   = ph > 0 ? ph*ph*(f.mesh === 'h' ? 0.14 : 0.40) : 0;
          if(f.mesh !== 'h'){ pitch = ph > 0 ? ph*ph*0.34 : -(ph*ph)*0.30; }   /* beasts pounce and rear */
          arenaPlace(f, x, FY + hop, z, f.yaw, pitch, roll, f.sc);
        });
      });
      b.attend.forEach(arenaHide);

      if(b.t >= b.killAt){
        var sA = Math.pow(arenaSideStr(b,0), 1.6), sB = Math.pow(arenaSideStr(b,1), 1.6);
        var loseSide = (rnd() < sB/(sA+sB+1e-6)) ? 0 : 1;
        var pool = b.side[loseSide].filter(function(f){ return f.alive; });
        if(pool.length){
          var v = pool[Math.floor(rnd()*pool.length)];
          v.alive = false; v.dieT = 0; b.kills++;
          b.corpses.push(v);
          if(v.mesh === 'h') arenaTint(v, ARENA_COL_BLOOD);
          arenaCrowdRoar(0.85);      /* the stands come up out of their seats */
        }
        b.killAt = b.t + rr(5, 10);
        if(!arenaSideStr(b,0) || !arenaSideStr(b,1)){
          b.state = 'clear'; b.t = 0; b.exitT = 0;
          b.clearIdx = 0; b.clearPhase = 'fetch'; b.clearT = 0;
        }
      }
      return;
    }

    /* ==== clearing the sand ==== */
    if(b.state === 'clear'){
      b.exitT += dt;
      b.side[0].concat(b.side[1]).forEach(function(f){
        if(!f.alive) return;
        if(b.exitT < 2.0){
          /* blade up, turning slowly to the stands */
          var sw = Math.sin(ARENA_T*1.4 + f.phase);
          arenaPlace(f, f.x, FY, f.z, f.yaw + sw*0.9, -0.16, f.mesh==='h' ? -0.34 : 0, f.sc);
        }else{
          var u2 = Math.min(1, (b.exitT-2.0)/3.6), us2 = u2*u2*(3-2*u2);
          if(u2 >= 1){ arenaHide(f); return; }
          var ex = f.x + (S.gateX-f.x)*us2, ez = f.z + (S.gateZ-f.z)*us2;
          var eyaw = Math.atan2(S.gateX-f.x, S.gateZ-f.z);
          arenaPlace(f, ex, FY + Math.abs(Math.sin(b.exitT*5.0+f.phase))*0.26, ez,
                     eyaw, 0, f.mesh==='h' ? -0.20 : 0, f.sc);
        }
      });

      for(var ci=b.clearIdx; ci<b.corpses.length; ci++){
        var cb = b.corpses[ci];
        if(cb.mesh === 'h') arenaPlace(cb, cb.x, FY+ARENA_LIE_Y, cb.z, cb.yaw, Math.PI*0.5, 0.22, cb.sc);
        else                arenaPlace(cb, cb.x, FY+ARENA_LIE_Y_BEAST*cb.sc, cb.z, cb.yaw, 0, Math.PI*0.5, cb.sc);
      }

      var body = b.corpses[b.clearIdx];
      if(!body){
        b.attend.forEach(arenaHide);
        if(b.exitT > 5.7){
          b.side[0].concat(b.side[1]).forEach(arenaHide);
          b.state = 'idle'; b.t = 0; b.idleFor = rr(1.5,3.5);
          b.side = [[],[]]; b.corpses = []; b.attend = [];
        }
        return;
      }
      b.clearT += dt;
      if(b.clearPhase === 'fetch'){
        var uf = Math.min(1, b.clearT/2.2), ufs = uf*uf*(3-2*uf);
        var ayaw = Math.atan2(body.x-S.gateX, body.z-S.gateZ);
        b.attend.forEach(function(at, k){
          var lat = (k ? 1 : -1) * 1.6;
          var ax = S.gateX + (body.x-S.gateX)*ufs + Math.cos(ayaw)*lat;
          var az = S.gateZ + (body.z-S.gateZ)*ufs - Math.sin(ayaw)*lat;
          at.x = ax; at.z = az; at.yaw = ayaw;
          arenaPlace(at, ax, FY + Math.abs(Math.sin(b.clearT*5.4+k))*0.26, az,
                     ayaw, 0, -0.26, 1);
        });
        /* the body just lies there while they come for it */
        if(body.mesh === 'h') arenaPlace(body, body.x, FY+ARENA_LIE_Y, body.z, body.yaw, Math.PI*0.5, 0.22, body.sc);
        else                  arenaPlace(body, body.x, FY+ARENA_LIE_Y_BEAST*body.sc, body.z, body.yaw, 0, Math.PI*0.5, body.sc);
        if(uf >= 1){ b.clearPhase = 'drag'; b.clearT = 0; b.dragFromX = body.x; b.dragFromZ = body.z; }
        return;
      }

      var ud = Math.min(1, b.clearT/4.2), uds = ud*ud*(3-2*ud);
      var dyaw = Math.atan2(S.gateX-b.dragFromX, S.gateZ-b.dragFromZ);
      var hx = b.dragFromX + (S.gateX-b.dragFromX)*uds;
      var hz = b.dragFromZ + (S.gateZ-b.dragFromZ)*uds;
      b.attend.forEach(function(at, k){
        var lat = (k ? 1 : -1) * 1.5;
        at.x = hx + Math.cos(dyaw)*lat; at.z = hz - Math.sin(dyaw)*lat; at.yaw = dyaw;
        arenaPlace(at, at.x, FY + Math.abs(Math.sin(b.clearT*4.4+k))*0.22,
                   at.z, dyaw, 0.22, -0.24, 1);
      });
      var trail = body.mesh === 'h' ? 4.6 : 6.6;   /* a body-length clear of the attendants' heels: a corpse lying ON them just reads as a shadow at their feet */
      var bx = hx - Math.sin(dyaw)*trail, bz = hz - Math.cos(dyaw)*trail;
      body.x = bx; body.z = bz; body.yaw = dyaw;
      if(body.mesh === 'h') arenaPlace(body, bx, FY+ARENA_LIE_Y, bz, dyaw, Math.PI*0.5, 0.22, body.sc);
      else                  arenaPlace(body, bx, FY+ARENA_LIE_Y_BEAST*body.sc, bz, dyaw, 0, Math.PI*0.5, body.sc);
      if(ud >= 1){
        arenaHide(body);
        b.clearIdx++; b.clearPhase = 'fetch'; b.clearT = 0;
        if(!b.corpses[b.clearIdx]) b.exitT = Math.max(b.exitT, 5.8);
      }
      return;
    }
  });

  if(ARENA_MESH_DIRTY.h) lifeGladMesh.instanceMatrix.needsUpdate = true;
  if(ARENA_MESH_DIRTY.q) lifeABeastMesh.instanceMatrix.needsUpdate = true;
  if(ARENA_MESH_DIRTY.t) lifeABeetleMesh.instanceMatrix.needsUpdate = true;
}

(function(){
  var white = new THREE.Color(0xffffff);
  [[lifeGladMesh, ARENA_HUMAN_N], [lifeABeastMesh, ARENA_QUAD_N], [lifeABeetleMesh, ARENA_BEETLE_N]].forEach(function(e){
    var m = e[0], n = e[1], mm = new THREE.Matrix4();
    mm.compose(new THREE.Vector3(0,-500,0), new THREE.Quaternion(), new THREE.Vector3(0,0,0));
    for(var i=0;i<n;i++){
      m.setMatrixAt(i, mm);

      m.setColorAt(i, white);
    }
    m.instanceMatrix.needsUpdate = true;
    if(m.instanceColor) m.instanceColor.needsUpdate = true;
  });
})();
