/* ============================== the lacquered warrior ==============================
   Grey-green plate under a yellow shoulder cape with red seams, a stacked yellow
   helmet with spikes and a red face in the opening, yellow horns at the collar,
   cyan gems set in the plate, orange sleeves and sash, brown gloves, a yellow and
   red tabard front and back, spiked boots, and a long forked polearm in the right
   hand. After the Remius sketch.
*/
var WR_PLATE = 0x8e9a8a, WR_PLATE_DARK = 0x6a7568, WR_YELLOW = 0xeadb78, WR_RED = 0xd8302a, WR_ORANGE = 0xd8803a, WR_BROWN = 0x7a4a2a,
    WR_GEM = 0x40e8ff, WR_FACE = 0xb8503a, WR_GOLD = 0xe8c040;
/* yellow with red seams: red where the angle falls on a seam, or at the hem */
function capeTint(seams, hemY){
  var y = C(WR_YELLOW), r = C(WR_RED), dot = C(0xc03030);
  return function(p){ var th = Math.atan2(p.z, p.x); var seam = Math.abs(((th / Math.PI * seams) % 1 + 1) % 1 - 0.5) < 0.06;
    if(p.y < hemY) return r; if(seam) return r; if(cellNoise(p, 0.07) > 0.93) return dot; return y; };
}
function buildWarriorBody(){
  var M = { metal: true };
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube([{ y: 1.0, rx: 0.2, rz: 0.15 }, { y: 1.26, rx: 0.22, rz: 0.17 }, { y: 1.5, rx: 0.27, rz: 0.2 }, { y: 1.74, rx: 0.3, rz: 0.21 }, { y: 1.86, rx: 0.14, rz: 0.13 }], 20), WR_PLATE, torsoBones, M);
  addPiece(ellipsoid(0, 1.6, 0.17, 0.17, 1.4, 1.0, 0.6), WR_PLATE, ['mixamorigSpine2'], M);                        /* chest swell */
  addPiece(ellipsoid(0, 1.6, 0.3, 0.045, 0.7, 1, 0.5), WR_GEM, ['mixamorigSpine2']);                               /* chest gem */
  addPiece(ellipsoid(0, 1.2, 0.2, 0.045, 0.7, 1, 0.5), WR_GEM, ['mixamorigSpine']);                                /* belly gem */
  addPiece(bodyTube([{ y: 1.26, rx: 0.235, rz: 0.185 }, { y: 1.36, rx: 0.245, rz: 0.19 }], 20), WR_ORANGE, ['mixamorigSpine', 'mixamorigSpine1']);   /* sash */
  addPiece(box(0, 1.31, 0.19, 0.14, 0.09, 0.02, [0, 0, 0.3]), WR_ORANGE, ['mixamorigSpine']);
  /* the shoulder cape: a flaring tube over the shoulders, yellow with red seams */
  addPiece(bodyTube([{ y: 1.92, rx: 0.17, rz: 0.15 }, { y: 1.84, rx: 0.42, rz: 0.3 }, { y: 1.66, rx: 0.56, rz: 0.36 }, { y: 1.52, rx: 0.58, rz: 0.36 }], 36, false), WR_YELLOW,
    ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigSpine1'], { tint: capeTint(6, 1.55) });
  [1, -1].forEach(function(s){ addPiece(spike(V3(s * 0.5, 1.72, -0.05), V3(s * 0.2, 1, -0.2), 0.42, 0.03, 4), WR_GOLD, ['mixamorigSpine2'], M); }); /* shoulder spines */
  /* tabard: front and back panels from the sash to the shins */
  [1, -1].forEach(function(f){
    addPiece(box(0, 0.72, f * 0.2, 0.42, 0.9, 0.025), WR_YELLOW, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg'), B(1, 'Leg'), B(-1, 'Leg')],
      { tint: capeTint(0, 0.35), power: 2 });
    addPiece(box(0, 0.75, f * 0.215, 0.08, 0.7, 0.01), WR_RED, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2 });   /* centre stripe */
    for(var k = 0; k < 4; k++) addPiece(ellipsoid(0, 1.05 - k * 0.15, f * 0.23, 0.018, 1, 1.4, 0.5), WR_RED, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')]); /* drops */
  });
  /* neck, helmet */
  addPiece(limbTube(V3(0, 1.8, 0), V3(0, 1.98, 0), [{ t: 0, r: 0.14 }, { t: 1, r: 0.12 }], 12), WR_PLATE_DARK, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead'], M);
  addPiece(ellipsoid(0, 2.06, 0.02, 0.16, 1, 1.1, 1), WR_PLATE_DARK, ['mixamorigHead'], M);                        /* skull cap under the rings */
  addPiece(ellipsoid(0, 2.04, 0.1, 0.1, 1, 1.1, 0.8), WR_FACE, ['mixamorigHead']);                                 /* the red face */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.04, 2.07, 0.19, 0.015, 1, 0.7, 0.6), 0x301010, ['mixamorigHead']); });
  addPiece(box(0, 1.98, 0.17, 0.05, 0.12, 0.03), WR_GOLD, ['mixamorigHead'], M);                                   /* chin guard */
  for(var i = 0; i < 2; i++) addPiece(bodyTube([{ y: 2.12 + i * 0.1, rx: 0.2 - i * 0.03, rz: 0.2 - i * 0.03 }, { y: 2.2 + i * 0.1, rx: 0.21 - i * 0.03, rz: 0.21 - i * 0.03 }], 20), WR_YELLOW, ['mixamorigHead'], { tint: capeTint(10, 0) });
  addPiece(ellipsoid(0, 2.31, 0.0, 0.15, 1, 0.45, 1), WR_YELLOW, ['mixamorigHead']);
  [[0, 1, 0], [0.25, 1, -0.1], [-0.25, 1, -0.1]].forEach(function(d){ addPiece(spike(V3(d[0] * 0.3, 2.34, d[2] * 0.3), V3(d[0], d[1], d[2]), 0.2, 0.012, 4), WR_GOLD, ['mixamorigHead'], M); });
  [1, -1].forEach(function(s){ var horn = new THREE.CatmullRomCurve3([V3(s * 0.16, 1.9, 0.02), V3(s * 0.26, 1.98, 0.06), V3(s * 0.3, 2.08, 0.1), V3(s * 0.24, 2.14, 0.12)]);
    addPiece(curveTube(horn, 14, 8, function(t){ return 0.035 * (1 - t * 0.6); }), WR_YELLOW, ['mixamorigHead', 'mixamorigNeck']); });
  /* arms: orange sleeves, plate vambraces with gems, brown gloves */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.13 }, { t: 0.5, r: 0.14 }, { t: 1, r: 0.12 }], 14), WR_ORANGE, [ARM, FA]);
    addPiece(limbTube(a.sh.clone().lerp(a.el, 0.85), a.el, [{ t: 0, r: 0.135 }, { t: 1, r: 0.13 }], 14), WR_RED, [ARM, FA]);
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.1), WR_PLATE_DARK, [ARM, FA], M);
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.1 }, { t: 0.5, r: 0.12 }, { t: 1, r: 0.1 }], 14), WR_PLATE, [FA, HAND], M);
    for(var k = 0; k < 3; k++) addPiece(ellipsoid(a.el.x + s * (0.08 + k * 0.08), a.el.y + 0.1, a.el.z + 0.02, 0.025, 1, 0.6, 1), WR_GEM, [FA]);
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.8), a.wr.clone().add(V3(s * 0.03, 0, 0)), [{ t: 0, r: 0.115 }, { t: 1, r: 0.1 }], 14), WR_BROWN, [FA, HAND]);
    fist(s, WR_BROWN, [HAND]);
  });
  /* legs: plate greaves, brown spiked boots */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.17 }, { t: 0.5, r: 0.16 }, { t: 1, r: 0.13 }], 14), WR_PLATE, [UP, LEG], M);
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z + 0.01, 0.13), WR_PLATE_DARK, [UP, LEG], M);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.12 }, { t: 0.5, r: 0.12 }, { t: 1, r: 0.1 }], 14), WR_PLATE, [LEG, FOOT], M);
    addPiece(box(l.an.x, 0.07, 0.08, 0.2, 0.13, 0.34), WR_BROWN, [FOOT]);
    addPiece(box(l.an.x, 0.03, 0.1, 0.22, 0.05, 0.38), 0x2a2420, [FOOT]);
    addPiece(ellipsoid(l.an.x + s * 0.09, 0.1, 0.0, 0.03, 1, 1, 0.5), WR_GEM, [FOOT]);
    addPiece(spike(V3(l.an.x, 0.13, 0.22), V3(0, 1, 0.3), 0.12, 0.018, 4), WR_GOLD, [FOOT], M);
  });
}
function buildPolearm(){
  var g = new THREE.Group(), shaft = propMat(WR_PLATE, 0.4, 0.5), dark = propMat(0x2a2a2a, 0.3, 0.7), gem = propMat(WR_GEM, 0.2, 0.3);
  propMesh(g, new THREE.CylinderGeometry(0.03, 0.03, 2.2, 10), shaft, 0, -0.5);
  propMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), dark, 0, -1.35); propMesh(g, new THREE.CylinderGeometry(0.055, 0.055, 0.1, 10), dark, 0, -1.5);
  propMesh(g, new THREE.CylinderGeometry(0.04, 0.045, 0.1, 10), dark, 0, -1.62);
  [-1, 0, 1].forEach(function(k){ var p = new THREE.CylinderGeometry(0.008, 0.016, 0.35, 6); p.translate(k * 0.05, -1.85, 0); propMesh(g, p, gem); });
  propMesh(g, new THREE.CylinderGeometry(0.035, 0.03, 0.06, 10), dark, 0, 0.6);
  return g;
}
registerCharacter({ key: 'warrior', name: 'Lacquered warrior', clips: ['mixamo', 'walk', 'idle', 'run'], defaultClip: 'mixamo',
  proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.3,
    shoulderX: 0.16, shoulderY: 1.78, armX: 0.36, armY: 1.72, elbowX: 0.68, wristX: 0.98, handTipX: 1.12,
    hipX: 0.16, kneeX: 0.17, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.26 },
  build: function(){ buildWarriorBody(); attachProp(-1, buildPolearm(), V3(0, -0.06, 0.03), [0.25, 0, -1.0]); } });
