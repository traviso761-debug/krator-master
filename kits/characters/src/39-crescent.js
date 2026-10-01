/* ============================== the crescent priest ==============================
   After the Moebius drawing: a pale green robe over a white undertunic, a brown
   front panel with a gold crescent, a gold mask with long white hair falling
   either side, and a tall staff topped with a crescent. The robe is one tube
   skinned to the spine and legs like the desert priest's. He raises the staff on
   his own clip and has the common ones.
*/
var CR_GREEN = 0xc8dcc0, CR_GREEN_DARK = 0x9ab898, CR_WHITE = 0xf4f2ec, CR_BROWN = 0x5a3a28, CR_GOLD = 0xd8b048, CR_HAIR = 0xe8e4dc, CR_SKIN = 0xd8b090;
function crescentTint(){
  var g = C(CR_GREEN), gd = C(CR_GREEN_DARK), gold = C(CR_GOLD);
  return function(p){ var th = Math.atan2(p.z, p.x), n = cellNoise(p, 0.12);
    if(n > 0.9 && p.y < 1.6 && Math.abs(th - Math.PI / 2) > 0.5) return gold;        /* scattered gold glyphs */
    return p.y < 0.35 ? gd : g; };
}
function buildCrescentBody(){
  var M = { metal: true }, tint = crescentTint();
  var legBones = ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg'), B(1, 'Leg'), B(-1, 'Leg')];
  var robe = []; for(var i = 0; i <= 40; i++){ var t = i / 40, y = 1.86 - t * 1.84; robe.push({ y: y, rx: 0.22 + t * 0.3 + (t < 0.1 ? (0.1 - t) * 0.8 : 0), rz: 0.17 + t * 0.22 }); }
  addPiece(bodyTube(robe, 40), CR_GREEN, legBones, { tint: tint, power: 2 });
  addPiece(bodyTube([{ y: 1.86, rx: 0.13, rz: 0.12 }, { y: 1.7, rx: 0.27, rz: 0.2 }, { y: 1.5, rx: 0.3, rz: 0.22 }], 28, false), CR_WHITE, ['mixamorigSpine2', 'mixamorigNeck']);      /* undertunic yoke */
  addPiece(bodyTube([{ y: 1.84, rx: 0.1, rz: 0.1 }, { y: 1.96, rx: 0.08, rz: 0.08 }], 14), CR_WHITE, ['mixamorigNeck', 'mixamorigHead']);                                          /* high collar */
  /* the front panel with the crescent, and a chain of gold discs */
  addPiece(box(0, 0.98, 0.3, 0.34, 1.5, 0.02), CR_BROWN, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2 });
  var cres = new THREE.TorusGeometry(0.11, 0.025, 8, 20, Math.PI * 1.3); cres.rotateZ(-Math.PI * 0.15); cres.translate(0, 1.42, 0.32);
  addPiece(cres, CR_GOLD, ['mixamorigSpine2', 'mixamorigSpine1'], M);
  addPiece(box(0, 0.9, 0.315, 0.03, 0.8, 0.01), CR_GOLD, ['mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { metal: true, power: 2 });
  for(i = 0; i < 3; i++) addPiece(ellipsoid(-0.12 + i * 0.12, 0.26, 0.4, 0.025), CR_GOLD, [B(1, 'Leg'), B(-1, 'Leg')], M);
  addPiece(ellipsoid(0, 1.68, 0.26, 0.05, 1, 1, 0.4), CR_GOLD, ['mixamorigSpine2'], M);
  seam(V3(-0.2, 1.3, 0.24), V3(0.2, 1.3, 0.24), CR_GOLD, ['mixamorigSpine1'], 0.008); [1, -1].forEach(function(s){ var a2 = armPts(s); seam(a2.el.clone().add(V3(0, 0.12, 0.05)), a2.wr.clone().add(V3(0, 0.16, 0.06)), CR_GOLD, [B(s, 'ForeArm'), B(s, 'Hand')], 0.006); });   /* belt cord, sleeve glyph lines */
  /* head: gold mask, white hair */
  addPiece(ellipsoid(0, 2.04, 0.0, 0.11, 0.95, 1.15, 1.0), CR_SKIN, ['mixamorigHead']);
  addPiece(ellipsoid(0, 2.03, 0.075, 0.09, 1.0, 1.2, 0.6), CR_GOLD, ['mixamorigHead'], M);                                                      /* the mask */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.035, 2.05, 0.125, 0.018, 1.2, 0.6, 0.5), 0x101008, ['mixamorigHead']); });
  addPiece(box(0, 2.14, 0.11, 0.16, 0.025, 0.02), CR_GOLD, ['mixamorigHead'], M);
  [1, -1].forEach(function(s){ seam(V3(s * 0.035, 2.02, 0.13), V3(s * 0.045, 1.95, 0.12), 0x6a4a1a, ['mixamorigHead'], 0.004); });   /* tear lines on the mask */
  for(var hb = 0; hb < 4; hb++) addPiece(ellipsoid(0.16 + hb * 0.005, 1.95 - hb * 0.12, -0.05, 0.016), CR_GOLD, ['mixamorigNeck', 'mixamorigSpine2'], M);   /* hair beads */
  var mcres = new THREE.TorusGeometry(0.05, 0.012, 6, 14, Math.PI * 1.2); mcres.rotateZ(-Math.PI * 0.1); mcres.translate(0, 2.2, 0.08);
  addPiece(mcres, CR_GOLD, ['mixamorigHead'], M);
  addPiece(ellipsoid(0, 2.1, -0.03, 0.125, 1.05, 1.0, 1.0), CR_HAIR, ['mixamorigHead']);
  [1, -1].forEach(function(s){ addPiece(limbTube(V3(s * 0.11, 2.08, -0.02), V3(s * 0.16, 1.4, -0.05), [{ t: 0, r: 0.06 }, { t: 1, r: 0.04 }], 8), CR_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 });
    addPiece(limbTube(V3(s * 0.08, 2.1, 0.06), V3(s * 0.2, 1.55, 0.12), [{ t: 0, r: 0.04 }, { t: 1, r: 0.03 }], 7), CR_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 });
    addPiece(limbTube(V3(s * 0.12, 2.06, -0.08), V3(s * 0.12, 1.6, -0.14), [{ t: 0, r: 0.04 }, { t: 1, r: 0.03 }], 7), CR_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 }); });
  addPiece(limbTube(V3(0, 2.08, -0.1), V3(0, 1.3, -0.16), [{ t: 0, r: 0.1 }, { t: 1, r: 0.06 }], 8), CR_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 });
  /* sleeves: wide green over white */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(limbTube(a.sh.clone().add(V3(-s * 0.08, 0.05, 0)), a.el, [{ t: 0, r: 0.15 }, { t: 1, r: 0.13 }], 14), CR_GREEN, ['mixamorigSpine2', ARM, FA], { tint: tint });
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.13 }, { t: 0.7, r: 0.15 }, { t: 1, r: 0.19 }], 14), CR_GREEN, [FA, HAND], { tint: tint });
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.6), a.wr.clone().add(V3(s * 0.02, 0, 0)), [{ t: 0, r: 0.075 }, { t: 1, r: 0.07 }], 10), CR_WHITE, [FA, HAND]);
    fist(s, CR_SKIN, [HAND]);
  });
  [1, -1].forEach(function(s){ var l = legPts(s); addPiece(box(l.an.x, 0.035, 0.12, 0.1, 0.05, 0.2), 0x3a2a20, [B(s, 'Foot')]); });
  hemTrim(0.03, 0.52, 0.39, 0.04, CR_GOLD, legBones.slice(3), true);
  [1, -1].forEach(function(s){ var sc = new THREE.TorusGeometry(0.06, 0.012, 6, 14, Math.PI * 1.2); sc.rotateZ(-Math.PI * 0.1); sc.translate(s * 0.26, 1.78, 0.06); addPiece(sc, CR_GOLD, ['mixamorigSpine2'], M); });   /* shoulder crescents */
}
function crescentStaffHead(g){
  var gold = propMat(CR_GOLD, 0.9, 0.35);
  propMesh(g, new THREE.SphereGeometry(0.035, 8, 6), gold, 0, 1.5, 0);
  var c = new THREE.TorusGeometry(0.14, 0.022, 8, 24, Math.PI * 1.25); c.rotateZ(-Math.PI * 0.125); propMesh(g, c, gold, 0, 1.7, 0);
  propMesh(g, new THREE.TorusGeometry(0.03, 0.008, 6, 12), gold, 0, 1.1, 0);
  [0.6, 0.9].forEach(function(y, i){ var rib = new THREE.CatmullRomCurve3([V3(0, y + 0.5, 0), V3(0.04, y + 0.3, 0.02), V3(0.02, y, 0.04), V3(0.05, y - 0.3, 0.0)]); propMesh(g, new THREE.TubeGeometry(rib, 12, 0.006, 4, false), propMat(i ? 0xc8dcc0 : CR_GOLD)); });   /* ribbons */
}
function crescentRaisePose(u){
  idlePose(u); var ph = u * Math.PI * 2;
  setRot(B(-1, 'Arm'), -1.3 + 0.03 * Math.sin(ph), 0, -0.3); setRot(B(-1, 'ForeArm'), -0.6, 0, 0); setRot(B(-1, 'Hand'), 0, -0.3, 0);
  setRot(B(1, 'Arm'), -0.3, 0, 0.25); setRot(B(1, 'ForeArm'), -0.9, 0.3, 0);
}
registerCharacter({ key: 'crescent', name: 'Crescent priest (Moebius)', clips: ['raise', 'idle', 'mixamo', 'walk'], defaultClip: 'raise',
  extraClips: function(){ return { raise: bakeClip('raise', crescentRaisePose, 3.2, 24) }; },
  proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.22,
    shoulderX: 0.14, shoulderY: 1.8, armX: 0.3, armY: 1.74, elbowX: 0.6, wristX: 0.9, handTipX: 1.02,
    hipX: 0.13, kneeX: 0.14, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.24 },
  build: function(){ buildCrescentBody(); attachProp(-1, buildStaff(0xa88a50, crescentStaffHead), V3(0, -0.02, 0.06), [0, 0, 0]); } });
