/* ============================== the desert pilgrim ==============================
   After the Moebius drawing: a tall pale mitre with a peak, a tan tabard with
   orange trim over a white shirt, a blue sash with a disc, grey trousers tucked
   into white boots, and a long red staff with a crook. Quiet palette, clean
   silhouette; he stands with the staff and walks with it planted.
*/
var PG_TAN = 0xe8c898, PG_ORANGE = 0xe08a3a, PG_WHITE = 0xf4f0e8, PG_GREY = 0xb8b4ac, PG_BLUE = 0x3a6ab8, PG_SKIN = 0xd8a880, PG_RED = 0xc84a30, PG_GOLD = 0xd8b048;
function buildPilgrimBody(){
  var M = { metal: true };
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube([{ y: 1.0, rx: 0.2, rz: 0.15 }, { y: 1.3, rx: 0.21, rz: 0.16 }, { y: 1.55, rx: 0.25, rz: 0.18 }, { y: 1.74, rx: 0.26, rz: 0.18 }, { y: 1.84, rx: 0.12, rz: 0.11 }], 18), PG_WHITE, torsoBones);
  /* tabard: a front and back panel from the shoulders to the knees, orange-trimmed */
  [1, -1].forEach(function(f){
    addPiece(box(0, 1.28, f * 0.2, 0.46, 1.0, 0.025), PG_TAN, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2 });
    addPiece(box(0, 0.74, f * 0.2, 0.3, 0.5, 0.02), PG_TAN, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2 });                 /* the hanging panel */
    addPiece(box(0, 1.77, f * 0.21, 0.46, 0.05, 0.02), PG_ORANGE, ['mixamorigSpine2']);
    addPiece(box(0, 0.5, f * 0.21, 0.3, 0.04, 0.015), PG_ORANGE, [B(1, 'Leg'), B(-1, 'Leg'), 'mixamorigHips'], { power: 2 });
  });
  [1, -1].forEach(function(s){ addPiece(box(s * 0.24, 1.28, 0, 0.03, 1.0, 0.36), PG_ORANGE, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips'], { power: 2 }); }); /* side trims */
  addPiece(ellipsoid(0, 1.68, 0.21, 0.07, 1, 1, 0.3), PG_GOLD, ['mixamorigSpine2'], M); addPiece(ellipsoid(0, 1.68, 0.235, 0.025), PG_BLUE, ['mixamorigSpine2']);   /* chest brooch */
  addPiece(ellipsoid(0, 1.5, 0.21, 0.04, 0.8, 1.4, 0.3), PG_GOLD, ['mixamorigSpine1'], M);
  /* sash */
  addPiece(bodyTube([{ y: 1.1, rx: 0.225, rz: 0.17 }, { y: 1.2, rx: 0.225, rz: 0.17 }], 18), PG_BLUE, ['mixamorigHips', 'mixamorigSpine']);
  addPiece(ellipsoid(0, 1.15, 0.18, 0.05, 1, 1, 0.3), PG_GOLD, ['mixamorigHips'], M);
  addPiece(box(0.1, 1.0, 0.17, 0.05, 0.2, 0.01), PG_ORANGE, ['mixamorigHips']);
  addPiece(ellipsoid(0.12, 1.14, 0.15, 0.05, 1.2, 0.7, 0.7), PG_BLUE, ['mixamorigHips']);                                             /* sash knot */
  addPiece(ellipsoid(0.24, 1.0, -0.06, 0.07, 0.6, 1.1, 1), 0x8a6a4a, ['mixamorigHips']); seam(V3(0.24, 1.1, -0.06), V3(0.1, 1.74, 0.0), 0x5a4a3a, ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2'], 0.007);   /* water flask on a strap */
  for(var nb = 0; nb < 9; nb++){ var na = -0.8 + nb * 0.2; addPiece(ellipsoid(Math.sin(na) * 0.12, 1.79 - Math.cos(na) * 0.04, 0.15 + Math.cos(na) * 0.04, 0.01), nb % 2 ? PG_BLUE : PG_GOLD, ['mixamorigSpine2'], M); }   /* necklace */
  addPiece(ellipsoid(-0.2, 1.02, 0.08, 0.06, 1, 1.2, 0.7), 0x8a6a4a, ['mixamorigHips']); addPiece(box(-0.2, 1.08, 0.12, 0.08, 0.03, 0.02), PG_GOLD, ['mixamorigHips'], M);   /* pouch */
  /* head: a long face under a tall pale mitre with ear flaps */
  addPiece(limbTube(V3(0, 1.82, 0), V3(0, 1.98, 0), [{ t: 0, r: 0.07 }, { t: 1, r: 0.065 }], 10), PG_SKIN, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(ellipsoid(0, 2.05, 0.01, 0.11, 0.9, 1.15, 1.0), PG_SKIN, ['mixamorigHead']);
  faceHuman(2.05, PG_SKIN, { r: 0.11, iris: 0x3a4a5a, brow: 0x3a2a20 });
  addPiece(bodyTube([{ y: 2.1, rx: 0.14, rz: 0.14 }, { y: 2.16, rx: 0.15, rz: 0.15 }, { y: 2.42, rx: 0.12, rz: 0.12 }, { y: 2.56, rx: 0.07, rz: 0.07 }, { y: 2.62, rx: 0.02, rz: 0.02 }], 18), PG_WHITE, ['mixamorigHead']);
  addPiece(box(0, 2.3, 0.13, 0.05, 0.1, 0.02), PG_GOLD, ['mixamorigHead'], M); addPiece(ellipsoid(0, 2.36, 0.14, 0.02), PG_RED, ['mixamorigHead']);
  addPiece(limbTube(V3(0, 2.62, 0), V3(0.06, 2.5, -0.1), [{ t: 0, r: 0.008 }, { t: 1, r: 0.006 }], 4), PG_BLUE, ['mixamorigHead']); addPiece(ellipsoid(0.06, 2.49, -0.1, 0.018), PG_GOLD, ['mixamorigHead'], M);   /* hat tassel */
  for(var sb = 0; sb < 3; sb++) addPiece(ellipsoid(0, 1.72 - sb * 0.05, 0.215, 0.009), PG_GOLD, ['mixamorigSpine2'], M);   /* collar buttons */
  [1, -1].forEach(function(s){ addPiece(box(s * 0.14, 2.0, 0.0, 0.03, 0.2, 0.12), PG_WHITE, ['mixamorigHead']); addPiece(ellipsoid(s * 0.16, 2.0, 0.0, 0.03, 0.5, 1, 1), PG_BLUE, ['mixamorigHead']); });  /* ear flaps */
  /* arms: white sleeves, bare hands with bracelets */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(ellipsoid(a.sh.x, a.sh.y + 0.02, 0, 0.12, 1.0, 0.9, 0.9), PG_TAN, ['mixamorigSpine2', ARM]);
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.1 }, { t: 1, r: 0.085 }], 12), PG_WHITE, [ARM, FA]);
    seam(a.sh.clone().add(V3(0, 0.1, 0)), a.wr.clone().add(V3(0, 0.08, 0)), PG_ORANGE, [ARM, FA, HAND], 0.01);   /* sleeve stripe */
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.08), PG_WHITE, [ARM, FA]);
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.085 }, { t: 1, r: 0.075 }], 12), PG_WHITE, [FA, HAND]);
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.8), a.wr, [{ t: 0, r: 0.08 }, { t: 1, r: 0.075 }], 12, false), PG_ORANGE, [FA, HAND]);
    fist(s, PG_SKIN, [HAND]);
    addPiece(limbTube(a.wr, a.wr.clone().add(V3(s * 0.03, 0, 0)), [{ t: 0, r: 0.06 }, { t: 1, r: 0.06 }], 10, false), PG_GOLD, [HAND], M);
  });
  /* legs: grey trousers into white boots */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.15 }, { t: 0.5, r: 0.14 }, { t: 1, r: 0.11 }], 14), PG_GREY, [UP, LEG]);
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z, 0.105), PG_GREY, [UP, LEG]);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.105 }, { t: 0.5, r: 0.1 }, { t: 1, r: 0.09 }], 14), PG_GREY, [LEG, FOOT]);
    addPiece(limbTube(V3(l.an.x, 0.1, 0), V3(l.an.x, 0.42, 0), [{ t: 0, r: 0.118 }, { t: 1, r: 0.12 }], 14), PG_WHITE, [LEG, FOOT]);
    addPiece(box(l.an.x, 0.06, 0.07, 0.17, 0.12, 0.3), PG_WHITE, [FOOT]);
    addPiece(ellipsoid(l.an.x, 0.06, 0.2, 0.085, 1, 0.7, 0.9), PG_WHITE, [FOOT]);
    addPiece(limbTube(V3(l.an.x, 0.14, 0), V3(l.an.x, 0.17, 0), [{ t: 0, r: 0.125 }, { t: 1, r: 0.125 }], 14, false), PG_ORANGE, [FOOT]); addPiece(box(l.an.x + s * 0.1, 0.155, 0.02, 0.02, 0.04, 0.03), PG_GOLD, [FOOT], M);   /* boot strap */
  });
}
function buildStaff(color, headFn){
  var g = new THREE.Group(), wood = propMat(color, 0.1, 0.6);
  propMesh(g, new THREE.CylinderGeometry(0.014, 0.018, 2.4, 8), wood, 0, 0.3);
  if(headFn) headFn(g);
  return g;
}
function pilgrimStaffHead(g){
  var crook = new THREE.CatmullRomCurve3([V3(0, 1.5, 0), V3(0, 1.62, 0.02), V3(0.03, 1.72, 0.1), V3(0.0, 1.76, 0.2), V3(-0.04, 1.7, 0.26)]);
  propMesh(g, new THREE.TubeGeometry(crook, 16, 0.014, 6, false), propMat(PG_RED, 0.1, 0.6));
  propMesh(g, new THREE.SphereGeometry(0.03, 8, 6), propMat(PG_BLUE, 0.3, 0.4), 0, 1.3, 0);
  propMesh(g, new THREE.TorusGeometry(0.045, 0.008, 6, 16), propMat(PG_GOLD, 0.9, 0.35), 0, 1.3, 0);
  propMesh(g, new THREE.BoxGeometry(0.16, 0.01, 0.01), propMat(PG_GOLD, 0.9, 0.35), 0, 1.22, 0);
}
registerCharacter({ key: 'pilgrim', name: 'Desert pilgrim (Moebius)', clips: ['idle', 'mixamo', 'walk', 'midle'], defaultClip: 'idle',
  proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.2,
    shoulderX: 0.14, shoulderY: 1.78, armX: 0.3, armY: 1.72, elbowX: 0.6, wristX: 0.9, handTipX: 1.02,
    hipX: 0.13, kneeX: 0.14, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.24 },
  weapons: { mixamorigRightHand: 'staffcrook' }, build: buildPilgrimBody });
