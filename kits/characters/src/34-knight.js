/* ============================== the horned knight ==============================
   Silver plate over royal-blue cloth: a great helm with two curled horns and a
   star, spiked pauldrons, a cuirass with a red cross, gauntlets, tassets,
   greaves and pointed sabatons, a longsword in the right hand. Plate pieces
   are flagged metal and render in the metallic pass.
*/
var KN_STEEL = 0xd4d8e0, KN_STEEL_DARK = 0x9aa0ac, KN_BLUE = 0x2a3f9a, KN_BLUE_DARK = 0x1a2860, KN_GOLD = 0xc9a24a, KN_RED = 0xc02a2a;
function buildKnightBody(){
  var M = { metal: true }, R = rng(34);
  /* cloth underlayer: the whole body in blue */
  addPiece(bodyTube([{ y: 1.0, rx: 0.2, rz: 0.15 }, { y: 1.2, rx: 0.2, rz: 0.15 }, { y: 1.5, rx: 0.27, rz: 0.2 }, { y: 1.75, rx: 0.3, rz: 0.2 }, { y: 1.86, rx: 0.12, rz: 0.11 }], 16), KN_BLUE,
    ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck']);
  /* cuirass: chest plate, abdomen band, back plate */
  addPiece(bodyTube([{ y: 1.30, rx: 0.25, rz: 0.19 }, { y: 1.45, rx: 0.31, rz: 0.23 }, { y: 1.62, rx: 0.35, rz: 0.26 }, { y: 1.76, rx: 0.33, rz: 0.24 }, { y: 1.83, rx: 0.2, rz: 0.17 }], 20, false), KN_STEEL,
    ['mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'], M);
  addPiece(ellipsoid(0, 1.62, 0.2, 0.17, 1.6, 0.9, 0.5), KN_STEEL, ['mixamorigSpine2'], M);                      /* pectoral swell */
  studRing(0, 1.78, 0, 0.335, 0.245, 18, 0.011, KN_GOLD, ['mixamorigSpine2']); studRing(0, 1.32, 0, 0.255, 0.195, 16, 0.011, KN_GOLD, ['mixamorigSpine1']);
  addPiece(bodyTube([{ y: 0.96, rx: 0.23, rz: 0.17 }, { y: 1.1, rx: 0.245, rz: 0.185 }], 20, false), 0x4a4e58, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { metal: true, tint: blotchTint(0x4a4e58, 0x6a6e78), power: 2 });   /* mail skirt */
  addPiece(box(0, 1.62, 0.33, 0.05, 0.2, 0.02), KN_RED, ['mixamorigSpine2']); addPiece(box(0, 1.65, 0.33, 0.16, 0.05, 0.02), KN_RED, ['mixamorigSpine2']);
  addPiece(bodyTube([{ y: 1.08, rx: 0.24, rz: 0.18 }, { y: 1.3, rx: 0.25, rz: 0.19 }], 20, false), KN_BLUE_DARK, ['mixamorigHips', 'mixamorigSpine']);
  for(var i = 0; i < 3; i++) addPiece(bodyTube([{ y: 1.1 + i * 0.07, rx: 0.255, rz: 0.195 }, { y: 1.15 + i * 0.07, rx: 0.26, rz: 0.2 }], 20, false), KN_STEEL_DARK, ['mixamorigHips', 'mixamorigSpine'], M); /* fauld lames */
  addPiece(box(0, 1.1, 0.19, 0.12, 0.08, 0.02), KN_GOLD, ['mixamorigHips'], M);                                  /* belt buckle */
  hemTrim(1.83, 0.205, 0.175, 0.02, KN_GOLD, ['mixamorigNeck', 'mixamorigSpine2'], true);                       /* gorget edge */
  addPiece(box(-0.24, 0.8, -0.02, 0.05, 0.6, 0.03, [0, 0, 0.12]), KN_BLUE_DARK, ['mixamorigHips', B(-1, 'UpLeg')], { power: 2 }); addPiece(box(-0.21, 1.08, -0.02, 0.09, 0.03, 0.04), KN_GOLD, ['mixamorigHips'], M);   /* scabbard */
  addPiece(box(0.22, 1.0, 0.1, 0.03, 0.22, 0.015, [0, 0, 0.2]), KN_STEEL_DARK, ['mixamorigHips'], M); addPiece(box(0.2, 1.1, 0.11, 0.06, 0.015, 0.02), KN_GOLD, ['mixamorigHips'], M);   /* dagger */
  /* tassets */
  [1, -1].forEach(function(s){ addPiece(box(s * 0.2, 0.92, 0.12, 0.2, 0.3, 0.03, [0.15, 0, s * -0.2]), KN_STEEL, ['mixamorigHips', B(s, 'UpLeg')], M);
    addPiece(box(s * 0.2, 0.92, 0.14, 0.03, 0.12, 0.01, [0.15, 0, s * -0.2]), KN_RED, ['mixamorigHips', B(s, 'UpLeg')]); addPiece(box(s * 0.2, 0.94, 0.14, 0.09, 0.03, 0.01, [0.15, 0, s * -0.2]), KN_RED, ['mixamorigHips', B(s, 'UpLeg')]); });
  /* neck and helmet */
  addPiece(limbTube(V3(0, 1.8, 0), V3(0, 1.98, 0), [{ t: 0, r: 0.14 }, { t: 1, r: 0.12 }], 12), KN_BLUE_DARK, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(bodyTube([{ y: 1.95, rx: 0.15, rz: 0.15 }, { y: 2.0, rx: 0.17, rz: 0.17 }, { y: 2.26, rx: 0.17, rz: 0.17 }, { y: 2.3, rx: 0.1, rz: 0.1 }], 16), KN_STEEL, ['mixamorigHead'], M);
  addPiece(box(0, 2.11, 0.17, 0.22, 0.025, 0.02), 0x101418, ['mixamorigHead']);                                   /* eye slit */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.16, 2.12, 0.06, 0.025, 1, 1, 0.5), KN_GOLD, ['mixamorigHead'], M); }); studRing(0, 2.0, 0, 0.165, 0.165, 14, 0.01, KN_GOLD, ['mixamorigHead']);   /* visor pivots, rim rivets */
  for(var bh = 0; bh < 6; bh++) addPiece(box(0, 2.13 + bh * 0.02, 0.172, 0.02 + bh * 0.01, 0.008, 0.01), KN_STEEL_DARK, ['mixamorigHead'], M);   /* breaths */
  addPiece(box(0, 2.04, 0.17, 0.03, 0.12, 0.02), KN_BLUE, ['mixamorigHead']);                                     /* nasal bar */
  addPiece(ellipsoid(0, 2.2, 0.05, 0.18, 1, 0.5, 1), KN_BLUE, ['mixamorigHead']);                                 /* crown band */
  for(i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2; addPiece(spike(V3(0, 2.31, 0), V3(Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6), 0.12, 0.02, 4), KN_GOLD, ['mixamorigHead'], M); } /* star */
  [1, -1].forEach(function(s){
    var horn = new THREE.CatmullRomCurve3([V3(s * 0.15, 2.15, 0), V3(s * 0.34, 2.3, -0.02), V3(s * 0.4, 2.55, -0.05), V3(s * 0.28, 2.72, -0.08), V3(s * 0.12, 2.68, -0.1)]);
    addPiece(curveTube(horn, 24, 8, function(t){ return 0.045 * (1 - t * 0.7) + 0.01; }), KN_STEEL_DARK, ['mixamorigHead'], M);
    addPiece(ellipsoid(s * 0.12, 2.67, -0.1, 0.03), KN_GOLD, ['mixamorigHead'], M);
    [0.15, 0.4, 0.65].forEach(function(t){ var hp = horn.getPoint(t); addPiece(ellipsoid(hp.x, hp.y, hp.z, 0.05 * (1 - t * 0.6) + 0.015, 1, 0.5, 1), KN_GOLD, ['mixamorigHead'], M); });   /* horn bands */
  });
  /* arms */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(ellipsoid(a.sh.x - s * 0.02, a.sh.y + 0.04, 0, 0.2, 1.0, 0.9, 0.9), KN_STEEL, ['mixamorigSpine2', ARM], M);       /* pauldron */
    addPiece(box(a.sh.x, a.sh.y + 0.08, 0.18, 0.025, 0.1, 0.012), KN_RED, ['mixamorigSpine2', ARM]); addPiece(box(a.sh.x, a.sh.y + 0.1, 0.18, 0.07, 0.025, 0.012), KN_RED, ['mixamorigSpine2', ARM]);   /* pauldron cross */
    for(var k = 0; k < 3; k++){ var ang = -0.5 + k * 0.5; addPiece(spike(V3(a.sh.x + s * Math.cos(ang) * 0.12, a.sh.y + 0.04 + Math.sin(ang + 1.2) * 0.14, Math.sin(ang) * 0.1), V3(s * 0.4, 1, Math.sin(ang) * 0.6), 0.14, 0.025), KN_GOLD, [ARM], M); }
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.13 }, { t: 0.5, r: 0.13 }, { t: 1, r: 0.1 }], 14), KN_BLUE, [ARM, FA]);
    addPiece(limbTube(a.sh.clone().lerp(a.el, 0.2), a.sh.clone().lerp(a.el, 0.75), [{ t: 0, r: 0.145 }, { t: 1, r: 0.12 }], 14, false), KN_STEEL, [ARM, FA], M); /* rerebrace */
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.11), KN_STEEL_DARK, [ARM, FA], M);                                              /* couter */
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.1 }, { t: 0.5, r: 0.11 }, { t: 1, r: 0.09 }], 14), KN_BLUE, [FA, HAND]);
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.25), a.wr, [{ t: 0, r: 0.12 }, { t: 1, r: 0.11 }], 14), KN_STEEL, [FA, HAND], M);  /* vambrace */
    fist(s, KN_STEEL_DARK, [HAND]); addPiece(box(a.fist.x, a.fist.y + 0.02, a.fist.z + 0.07, 0.11, 0.08, 0.02), KN_STEEL, [HAND], M);
    studRing(a.wr.x + s * 0.05, a.wr.y + 0.02, 0.0, 0.07, 0.06, 6, 0.008, KN_GOLD, [HAND]);
  });
  /* legs */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.16 }, { t: 0.5, r: 0.15 }, { t: 1, r: 0.12 }], 14), KN_BLUE, [UP, LEG]);
    addPiece(limbTube(l.hp.clone().lerp(l.kn, 0.3), l.kn, [{ t: 0, r: 0.165 }, { t: 1, r: 0.135 }], 14, false), KN_STEEL, [UP, LEG], M);  /* cuisse */
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z + 0.01, 0.125), KN_STEEL_DARK, [UP, LEG], M);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.115 }, { t: 0.5, r: 0.115 }, { t: 1, r: 0.1 }], 14), KN_STEEL, [LEG, FOOT], M);
    studRing(l.an.x, 0.5, 0, 0.117, 0.117, 8, 0.01, KN_GOLD, [LEG, FOOT]); seam(V3(l.kn.x, l.kn.y - 0.1, 0.12), V3(l.an.x, 0.2, 0.1), KN_STEEL_DARK, [LEG, FOOT], 0.012);   /* greave ridge */
    addPiece(box(l.an.x, 0.06, 0.08, 0.18, 0.11, 0.32), KN_STEEL, [FOOT], M);
    addPiece(spike(V3(l.an.x, 0.05, 0.24), V3(0, 0.1, 1), 0.14, 0.05, 4), KN_STEEL, [FOOT], M);                   /* pointed sabaton */
    var spur = new THREE.TorusGeometry(0.025, 0.006, 5, 8); spur.rotateY(Math.PI / 2); spur.translate(l.an.x, 0.07, -0.1); addPiece(spur, KN_GOLD, [FOOT], M); addPiece(spike(V3(l.an.x, 0.07, -0.1), V3(0, 0, -1), 0.05, 0.012, 4), KN_GOLD, [FOOT], M);   /* spur */
  });
}
function buildSword(){
  var g = new THREE.Group(), steel = propMat(KN_STEEL, 0.9, 0.3), gold = propMat(KN_GOLD, 0.9, 0.35), blue = propMat(KN_BLUE);
  propMesh(g, new THREE.CylinderGeometry(0.02, 0.022, 0.26, 8), blue, 0, 0.0);                          /* grip, centred on the hand */
  for(var w = 0; w < 5; w++) propMesh(g, new THREE.TorusGeometry(0.022, 0.005, 5, 10), gold, 0, -0.1 + w * 0.05, 0);   /* grip wire */
  propMesh(g, new THREE.SphereGeometry(0.035, 8, 6), gold, 0, 0.16);                                      /* pommel */
  var blade = new THREE.BoxGeometry(0.07, 0.95, 0.012); blade.translate(0, -0.14 - 0.475, 0);
  var tip = new THREE.CylinderGeometry(0, 0.035, 0.1, 4); tip.rotateX(Math.PI); tip.rotateY(Math.PI / 4); tip.translate(0, -0.14 - 0.95 - 0.05, 0);
  propMesh(g, blade, steel); propMesh(g, tip, steel);
  propMesh(g, new THREE.BoxGeometry(0.03, 0.9, 0.02), propMat(0xeef0f4, 0.9, 0.25), 0, -0.6);             /* fuller ridge */
  [1, -1].forEach(function(m){ var q = new THREE.CatmullRomCurve3([V3(0, -0.14, 0), V3(m * 0.08, -0.16, 0), V3(m * 0.13, -0.1, 0), V3(m * 0.14, -0.03, 0)]);
    propMesh(g, new THREE.TubeGeometry(q, 10, 0.014, 6, false), gold); });
  return g;
}
registerCharacter({ key: 'knight', name: 'Horned knight', clips: ['mixamo', 'walk', 'idle', 'run'], defaultClip: 'mixamo',
  proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.3,
    shoulderX: 0.16, shoulderY: 1.78, armX: 0.36, armY: 1.72, elbowX: 0.68, wristX: 0.98, handTipX: 1.12,
    hipX: 0.16, kneeX: 0.17, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.26 },
  weapons: { mixamorigRightHand: 'sword' }, build: buildKnightBody });
