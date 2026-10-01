/* ============================== the Sardaukar ==============================
   After the Moebius Dune study: black lacquered armour with ribbed shoulders, a
   pale face with goggles under a black helm with a tall crest spike, a red
   roundel on the chest, a dark cape, a pleated black skirt over trousers, boots,
   a sword at the hip and a long lance-rayon in the right hand.
*/
var SD_BLACK = 0x1c1a1e, SD_BLACK_GLOSS = 0x2a2830, SD_GREY = 0x6a6870, SD_RED = 0xc8302a, SD_SKIN = 0xd8c0a8, SD_BRASS = 0xb89050, SD_CAPE = 0x26222a;
function buildSardaukarBody(){
  var M = { metal: true };
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube([{ y: 1.0, rx: 0.2, rz: 0.15 }, { y: 1.26, rx: 0.21, rz: 0.16 }, { y: 1.5, rx: 0.26, rz: 0.19 }, { y: 1.74, rx: 0.29, rz: 0.2 }, { y: 1.84, rx: 0.13, rz: 0.12 }], 20), SD_BLACK_GLOSS, torsoBones, M);
  addPiece(ellipsoid(0, 1.6, 0.17, 0.16, 1.4, 1.0, 0.6), SD_BLACK_GLOSS, ['mixamorigSpine2'], M);
  addPiece(ellipsoid(0, 1.58, 0.29, 0.085, 1, 1, 0.25), SD_RED, ['mixamorigSpine2']); addPiece(ellipsoid(0, 1.58, 0.3, 0.045, 1, 1, 0.3), SD_BLACK, ['mixamorigSpine2']);   /* roundel */
  addPiece(box(0, 1.58, 0.315, 0.012, 0.06, 0.01), SD_RED, ['mixamorigSpine2']);
  for(var i = 0; i < 4; i++) addPiece(bodyTube([{ y: 1.12 + i * 0.08, rx: 0.215, rz: 0.165 }, { y: 1.16 + i * 0.08, rx: 0.22, rz: 0.17 }], 20, false), SD_GREY, ['mixamorigSpine', 'mixamorigSpine1'], M);  /* ribs */
  addPiece(bodyTube([{ y: 1.06, rx: 0.225, rz: 0.17 }, { y: 1.12, rx: 0.225, rz: 0.17 }], 20), SD_BRASS, ['mixamorigHips'], M);                    /* belt */
  [[-0.14, 0.12], [0.08, 0.14], [0.18, 0.02]].forEach(function(pp){ addPiece(box(pp[0], 0.98, pp[1], 0.07, 0.09, 0.05), SD_BLACK, ['mixamorigHips']); addPiece(box(pp[0], 1.02, pp[1] + 0.03, 0.07, 0.02, 0.01), SD_BRASS, ['mixamorigHips'], M); });   /* pouches */
  seam(V3(-0.2, 1.74, 0.16), V3(0.2, 1.2, 0.17), SD_GREY, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine'], 0.012); seam(V3(0.2, 1.74, 0.16), V3(-0.2, 1.2, 0.17), SD_GREY, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine'], 0.012);   /* chest straps */
  addPiece(ellipsoid(0, 1.3, 0.2, 0.035), SD_BRASS, ['mixamorigSpine1'], M);
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.22, 1.8, 0.02, 0.03), SD_BRASS, ['mixamorigSpine2'], M); });                                   /* cape clasps */
  /* pleated skirt */
  for(i = 0; i < 12; i++){ var a = i / 12 * Math.PI * 2 + 0.13, px = Math.cos(a) * 0.23, pz = Math.sin(a) * 0.18;
    addPiece(box(px, 0.78, pz, 0.13, 0.56, 0.015, [0, -a + Math.PI / 2, 0]), i % 2 ? SD_BLACK : SD_BLACK_GLOSS, ['mixamorigHips', B(px > 0 ? 1 : -1, 'UpLeg')], { power: 2 });
    if(i % 2) addPiece(box(px, 0.51, pz, 0.13, 0.02, 0.018, [0, -a + Math.PI / 2, 0]), SD_BRASS, [B(px > 0 ? 1 : -1, 'Leg'), 'mixamorigHips'], { metal: true, power: 2 }); }
  /* cape from the shoulders */
  addPiece(bodyTube([{ y: 1.78, rx: 0.3, rz: 0.22, cz: -0.06 }, { y: 1.4, rx: 0.34, rz: 0.1, cz: -0.22 }, { y: 0.9, rx: 0.36, rz: 0.08, cz: -0.3 }, { y: 0.4, rx: 0.34, rz: 0.06, cz: -0.34 }], 16, false), SD_CAPE,
    ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'Leg'), B(-1, 'Leg')], { power: 2 });
  /* head: pale face, goggles, black helm with crest spike and cheek plates */
  addPiece(limbTube(V3(0, 1.8, 0), V3(0, 1.96, 0), [{ t: 0, r: 0.08 }, { t: 1, r: 0.07 }], 10), SD_BLACK, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(ellipsoid(0, 2.04, 0.02, 0.11, 0.95, 1.1, 1.0), SD_SKIN, ['mixamorigHead']);
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.045, 2.06, 0.1, 0.035, 1, 0.9, 0.5), SD_BLACK, ['mixamorigHead'], M); addPiece(ellipsoid(s * 0.045, 2.06, 0.115, 0.022, 1, 0.9, 0.4), 0x6a8a9a, ['mixamorigHead'], M); });  /* goggles */
  addPiece(box(0, 2.06, 0.1, 0.03, 0.02, 0.02), SD_BLACK, ['mixamorigHead']);
  faceHuman(2.03, SD_SKIN, { r: 0.1, iris: 0x4a6a8a, brow: 0x2a2020, lips: 0x8a5a50 });
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.12, 2.04, 0.0, 0.035, 0.5, 1, 1), SD_BRASS, ['mixamorigHead'], M); addPiece(ellipsoid(s * 0.135, 2.04, 0.0, 0.015, 0.5, 1, 1), 0x6a8a9a, ['mixamorigHead'], M); });   /* ear discs (objectif) */
  addPiece(ellipsoid(0, 2.1, -0.02, 0.125, 1.0, 0.95, 1.0), SD_BLACK, ['mixamorigHead'], M);                                                        /* helm */
  [1, -1].forEach(function(s){ addPiece(box(s * 0.11, 1.99, 0.03, 0.02, 0.14, 0.12), SD_BLACK, ['mixamorigHead'], M); });                           /* cheek plates */
  addPiece(spike(V3(0, 2.2, -0.02), V3(0, 1, -0.15), 0.3, 0.03, 6), SD_BLACK, ['mixamorigHead'], M);                                                /* crest spike */
  studRing(0, 2.0, -0.02, 0.127, 0.127, 12, 0.009, SD_BRASS, ['mixamorigHead']);
  addPiece(box(0, 2.14, 0.11, 0.1, 0.02, 0.03), SD_BRASS, ['mixamorigHead'], M);
  /* arms: ribbed black, brass cuffs */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(ellipsoid(a.sh.x, a.sh.y + 0.03, 0, 0.16, 1.0, 0.8, 0.9), SD_BLACK_GLOSS, ['mixamorigSpine2', ARM], M);
    for(var k = 0; k < 4; k++) addPiece(limbTube(a.sh.clone().lerp(a.el, 0.05 + k * 0.1), a.sh.clone().lerp(a.el, 0.1 + k * 0.1), [{ t: 0, r: 0.14 - k * 0.01 }, { t: 1, r: 0.14 - k * 0.01 }], 12, false), SD_GREY, ['mixamorigSpine2', ARM], M);
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.11 }, { t: 1, r: 0.09 }], 12), SD_BLACK, [ARM, FA]);
    for(var c = 0; c < 3; c++) seam(V3(a.sh.x, a.sh.y + 0.1 - c * 0.04, -0.1 - c * 0.02), V3(a.el.x - s * 0.05, a.el.y + 0.04 - c * 0.02, -0.06 - c * 0.02), SD_GREY, [ARM, FA], 0.008);   /* cables */
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.08), SD_BLACK_GLOSS, [ARM, FA], M);
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.085 }, { t: 1, r: 0.075 }], 12), SD_BLACK_GLOSS, [FA, HAND], M);
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.85), a.wr, [{ t: 0, r: 0.09 }, { t: 1, r: 0.085 }], 12, false), SD_BRASS, [FA, HAND], M);
    fist(s, SD_BLACK, [HAND]);
  });
  /* legs: trousers, high boots */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.15 }, { t: 0.5, r: 0.14 }, { t: 1, r: 0.11 }], 14), SD_BLACK, [UP, LEG]);
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z, 0.105), SD_BLACK_GLOSS, [UP, LEG], M);
    studRing(l.kn.x, l.kn.y, l.kn.z + 0.06, 0.07, 0.04, 6, 0.008, SD_BRASS, [UP, LEG]);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.105 }, { t: 0.5, r: 0.1 }, { t: 1, r: 0.09 }], 14), SD_BLACK_GLOSS, [LEG, FOOT], M);
    addPiece(box(l.an.x, 0.06, 0.08, 0.17, 0.12, 0.32), SD_BLACK, [FOOT], M);
    for(var bs = 0; bs < 3; bs++) addPiece(limbTube(V3(l.an.x, 0.16 + bs * 0.12, 0), V3(l.an.x, 0.18 + bs * 0.12, 0), [{ t: 0, r: 0.105 }, { t: 1, r: 0.105 }], 12, false), SD_BRASS, [LEG, FOOT], M);   /* boot straps */
    addPiece(spike(V3(l.an.x, 0.04, 0.24), V3(0, 0.05, 1), 0.1, 0.045, 4), SD_BLACK, [FOOT], M);
  });
  /* sword at the left hip, hanging from the belt */
  addPiece(box(0.26, 0.72, -0.02, 0.03, 0.8, 0.012, [0, 0, 0.12]), SD_GREY, ['mixamorigHips', B(1, 'UpLeg')], { metal: true, power: 2 });
  addPiece(box(0.22, 1.08, -0.02, 0.1, 0.02, 0.03), SD_BRASS, ['mixamorigHips'], M);
}
function buildLance(){
  var g = new THREE.Group(), dark = propMat(SD_BLACK, 0.6, 0.4), brass = propMat(SD_BRASS, 0.9, 0.35);
  propMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 1.9, 8), dark, 0, -0.5);
  propMesh(g, new THREE.CylinderGeometry(0.035, 0.03, 0.3, 8), dark, 0, -1.3);
  propMesh(g, new THREE.CylinderGeometry(0.012, 0.03, 0.08, 8), brass, 0, -1.5);
  propMesh(g, new THREE.BoxGeometry(0.06, 0.16, 0.04), dark, 0.03, 0.1, 0);
  propMesh(g, new THREE.TorusGeometry(0.03, 0.006, 6, 12), brass, 0, 0.3, 0);
  return g;
}
registerCharacter({ key: 'sardaukar', name: 'Sardaukar (Moebius)', clips: ['mixamo', 'walk', 'run', 'idle', 'midle'], defaultClip: 'mixamo',
  proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.5,
    shoulderX: 0.15, shoulderY: 1.78, armX: 0.34, armY: 1.72, elbowX: 0.64, wristX: 0.94, handTipX: 1.06,
    hipX: 0.14, kneeX: 0.15, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.26 },
  build: function(){ buildSardaukarBody(); attachProp(-1, buildLance(), V3(0, -0.04, 0.04), [-0.2, 0, -0.35]); } });
