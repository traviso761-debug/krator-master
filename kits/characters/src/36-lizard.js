/* ============================== the four-armed lizard ==============================
   Not a human silhouette: a scaled lizardfolk archer with a second pair of arms
   off the lower ribs, a long snout, a dorsal crest and a four-bone tail. The
   skeleton is the Mixamo one plus extra bones (lowerLeft/RightShoulder, Arm,
   ForeArm, Hand and tail1..tail4). Clips only carry the Mixamo bones, so the
   extra ones are driven by extraPose(), an overlay baked into every clip: the
   lower arms hold a guard and punch during the attack, the tail sways with the
   stride. Green scales with a yellow belly by vertex tint, gold bracers on all
   four wrists, a leather harness and quiver, a recurve bow in the upper left hand.
*/
var LZ_GREEN = 0x5f8a3c, LZ_GREEN_DARK = 0x3a5a28, LZ_BELLY = 0xd8c860, LZ_SCALE = 0x7aa048, LZ_GOLD = 0xd8b040,
    LZ_LEATHER = 0x6a4a2e, LZ_RED = 0x9a2a2a, LZ_CLAW = 0xe8e0c8, LZ_EYE = 0xf0c020;
function lizardTint(){
  var g = C(LZ_GREEN), gd = C(LZ_GREEN_DARK), s = C(LZ_SCALE), b = C(LZ_BELLY), bd = C(0xb8a848);
  return function(p){
    var n = cellNoise(p, 0.045), front = p.z > 0.1 && Math.abs(p.x) < 0.9;
    if(front && p.y > 0.2) return n > 0.75 ? bd : b;
    return n > 0.8 ? s : n < 0.22 ? gd : g;
  };
}
/* a scaled limb: tube plus a few lighter scale bumps */
function lizardLimb(p0, p1, profile, bones, tint, R){
  addPiece(limbTube(p0, p1, profile, 14), LZ_GREEN, bones, { tint: tint });
  for(var i = 0; i < 6; i++){ var t = 0.15 + R() * 0.7, a = R() * Math.PI * 2, r = profile[0].r * 0.95;
    var c = p0.clone().lerp(p1, t), f = axisFrame(p1.clone().sub(p0)); c.addScaledVector(f.u, Math.cos(a) * r).addScaledVector(f.v, Math.sin(a) * r);
    addPiece(ellipsoid(c.x, c.y, c.z, 0.03, 1, 0.5, 1), LZ_SCALE, bones); }
}
function lizardArm(s, pre, a, R, tint){
  var ARM = pre + (s > 0 ? 'Left' : 'Right') + 'Arm', FA = pre + (s > 0 ? 'Left' : 'Right') + 'ForeArm', HAND = pre + (s > 0 ? 'Left' : 'Right') + 'Hand';
  var root = pre === 'mixamorig' ? 'mixamorigSpine2' : 'mixamorigSpine1';
  addPiece(ellipsoid(a.sh.x, a.sh.y + 0.02, 0, 0.15, 1.0, 0.95, 0.9), LZ_GREEN, [root, ARM], { tint: tint });
  lizardLimb(a.sh, a.el, [{ t: 0, r: 0.12 }, { t: 0.45, r: 0.125 }, { t: 1, r: 0.09 }], [ARM, FA], tint, R);
  addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.085), LZ_GREEN, [ARM, FA], { tint: tint });
  lizardLimb(a.el, a.wr, [{ t: 0, r: 0.085 }, { t: 0.4, r: 0.1 }, { t: 1, r: 0.065 }], [FA, HAND], tint, R);
  addPiece(limbTube(a.el.clone().lerp(a.wr, 0.72), a.el.clone().lerp(a.wr, 0.95), [{ t: 0, r: 0.085 }, { t: 1, r: 0.08 }], 14, false), LZ_GOLD, [FA, HAND], { metal: true }); /* bracer */
  studRing(a.el.clone().lerp(a.wr, 0.83).x, a.el.y, a.el.z, 0.087, 0.087, 8, 0.009, 0x8a6a2a, [FA, HAND]);
  /* a clawed hand: palm and three fingers */
  addPiece(ellipsoid(a.wr.x + s * 0.07, a.wr.y, 0.01, 0.065, 1.2, 0.7, 1.0), LZ_GREEN_DARK, [HAND]);
  for(var f = -1; f <= 1; f++) addPiece(spike(V3(a.wr.x + s * 0.12, a.wr.y - 0.01, f * 0.04), V3(s, -0.3, f * 0.3), 0.09, 0.016, 4), LZ_CLAW, [HAND]);
}
function buildLizardBody(){
  var R = rng(36), tint = lizardTint(), M = { metal: true };
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube([{ y: 0.96, rx: 0.2, rz: 0.17 }, { y: 1.08, rx: 0.22, rz: 0.18 }, { y: 1.24, rx: 0.25, rz: 0.2 }, { y: 1.4, rx: 0.3, rz: 0.23 },
                     { y: 1.56, rx: 0.33, rz: 0.24 }, { y: 1.7, rx: 0.3, rz: 0.22 }, { y: 1.8, rx: 0.14, rz: 0.13 }], 22), LZ_GREEN, torsoBones, { tint: tint });
  for(var i = 0; i < 4; i++) addPiece(bodyTube([{ y: 1.1 + i * 0.12, rx: 0.2 + i * 0.03, rz: 0.17 + i * 0.02 }, { y: 1.15 + i * 0.12, rx: 0.21 + i * 0.03, rz: 0.19 + i * 0.02 }], 18, false), LZ_BELLY, torsoBones, { tint: tint }); /* belly plates */
  /* neck and head: a long snout */
  addPiece(limbTube(V3(0, 1.76, 0), V3(0, 1.95, 0.04), [{ t: 0, r: 0.13 }, { t: 1, r: 0.1 }], 12), LZ_GREEN, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead'], { tint: tint });
  addPiece(ellipsoid(0, 2.02, 0.02, 0.13, 1.0, 0.9, 1.1), LZ_GREEN, ['mixamorigHead'], { tint: tint });                                    /* skull */
  addPiece(limbTube(V3(0, 2.0, 0.08), V3(0, 1.94, 0.4), [{ t: 0, r: 0.12, rz: 0.1 }, { t: 0.5, r: 0.09, rz: 0.075 }, { t: 1, r: 0.055, rz: 0.045 }], 12), LZ_GREEN, ['mixamorigHead'], { tint: tint }); /* snout */
  addPiece(limbTube(V3(0, 1.93, 0.08), V3(0, 1.9, 0.36), [{ t: 0, r: 0.1, rz: 0.06 }, { t: 1, r: 0.05, rz: 0.035 }], 10), LZ_BELLY, ['mixamorigHead']);                /* jaw */
  for(i = 0; i < 5; i++){ var z = 0.16 + i * 0.045; [1, -1].forEach(function(s){ addPiece(spike(V3(s * (0.085 - i * 0.012), 1.955, z), V3(0, -1, 0.1), 0.03, 0.009, 4), LZ_CLAW, ['mixamorigHead']); }); }
  [1, -1].forEach(function(s){
    addPiece(ellipsoid(s * 0.09, 2.03, 0.13, 0.035, 1, 0.9, 0.8), LZ_EYE, ['mixamorigHead']);
    addPiece(ellipsoid(s * 0.105, 2.03, 0.155, 0.014, 0.6, 1.4, 0.5), 0x101008, ['mixamorigHead']);                                        /* slit pupil */
    addPiece(ellipsoid(s * 0.09, 2.07, 0.13, 0.05, 1.1, 0.4, 0.9), LZ_GREEN_DARK, ['mixamorigHead']);                                       /* brow ridge */
    addPiece(ellipsoid(s * 0.04, 1.98, 0.39, 0.012), 0x203018, ['mixamorigHead']);                                                           /* nostril */
  });
  /* neck frill, tongue, throat pouch */
  for(i = 0; i < 10; i++){ var fa = -1.3 + i * 0.29; addPiece(spike(V3(Math.sin(fa) * 0.12, 1.86, -0.02 + Math.cos(fa) * -0.1), V3(Math.sin(fa) * 0.8, 0.5, -0.6), 0.1, 0.02, 4), LZ_RED, ['mixamorigNeck', 'mixamorigHead']); }
  addPiece(limbTube(V3(0, 1.915, 0.3), V3(0.02, 1.9, 0.46), [{ t: 0, r: 0.012 }, { t: 1, r: 0.006 }], 5), 0xb83a4a, ['mixamorigHead']);
  addPiece(ellipsoid(0, 1.82, 0.08, 0.08, 1.1, 0.7, 0.9), LZ_BELLY, ['mixamorigNeck'], { tint: tint });
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.3, 1.78, -0.02, 0.09, 1.2, 0.4, 1.0), LZ_SCALE, ['mixamorigSpine2', B(s, 'Arm')], { tint: tint }); addPiece(ellipsoid(s * 0.33, 1.8, -0.02, 0.05, 1.1, 0.35, 0.9), LZ_CLAW, ['mixamorigSpine2', B(s, 'Arm')]); });   /* shoulder bone plates */
  /* dorsal crest: head to tail base */
  for(i = 0; i < 9; i++){ var y = 2.1 - i * 0.13, zc = -0.05 - (i < 3 ? 0 : (i - 3) * 0.05) - (i > 6 ? 0.12 : 0), bone = i < 2 ? 'mixamorigHead' : i < 4 ? 'mixamorigNeck' : i < 6 ? 'mixamorigSpine2' : i < 8 ? 'mixamorigSpine1' : 'mixamorigSpine';
    addPiece(spike(V3(0, y, zc - 0.1), V3(0, 0.6, -1), 0.1 + (i % 3) * 0.02, 0.02, 4), LZ_RED, [bone]); }
  /* harness, quiver, loincloth */
  addPiece(limbTube(V3(-0.28, 1.72, 0.2), V3(0.2, 1.1, -0.2), [{ t: 0, r: 0.03 }, { t: 1, r: 0.03 }], 6, false), LZ_LEATHER, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine']);
  addPiece(bodyTube([{ y: 1.02, rx: 0.225, rz: 0.19 }, { y: 1.1, rx: 0.23, rz: 0.19 }], 18), LZ_LEATHER, ['mixamorigHips']);
  addPiece(box(0, 0.86, 0.17, 0.2, 0.26, 0.02), LZ_RED, ['mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2 });
  var quiver = limbTube(V3(0.14, 1.1, -0.26), V3(0.3, 1.75, -0.3), [{ t: 0, r: 0.06 }, { t: 1, r: 0.07 }], 10); addPiece(quiver, LZ_LEATHER, ['mixamorigSpine1', 'mixamorigSpine2']);
  studRing(0.28, 1.7, -0.3, 0.072, 0.072, 8, 0.01, LZ_GOLD, ['mixamorigSpine2']); studRing(0.17, 1.2, -0.27, 0.062, 0.062, 8, 0.01, LZ_GOLD, ['mixamorigSpine1']);
  addPiece(box(-0.12, 1.5, 0.22, 0.05, 0.06, 0.02, [0, 0, 0.6]), LZ_GOLD, ['mixamorigSpine2'], { metal: true });                                      /* harness buckle */
  for(i = 0; i < 6; i++){ var ax = 0.27 + (R() - 0.5) * 0.06, az = -0.3 + (R() - 0.5) * 0.06; addPiece(limbTube(V3(ax, 1.7, az), V3(ax + 0.05, 2.02, az - 0.02), [{ t: 0, r: 0.006 }, { t: 1, r: 0.006 }], 4), 0xb89a60, ['mixamorigSpine2']);
    addPiece(box(ax + 0.05, 2.0, az - 0.02, 0.035, 0.07, 0.006, [0, 0.4, 0]), 0xe0e0e0, ['mixamorigSpine2']); }
  /* four arms */
  [1, -1].forEach(function(s){
    lizardArm(s, 'mixamorig', armPts(s), R, tint);
    lizardArm(s, 'lower', { sh: V3(s * 0.36, 1.32, 0.02), el: V3(s * 0.66, 1.32, 0.02), wr: V3(s * 0.94, 1.32, 0.02) }, R, tint);
  });
  /* legs: digitigrade-ish, three clawed toes, wrapped ankles */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    lizardLimb(l.hp, l.kn, [{ t: 0, r: 0.17 }, { t: 0.5, r: 0.16 }, { t: 1, r: 0.12 }], [UP, LEG], tint, R);
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z, 0.11), LZ_GREEN, [UP, LEG], { tint: tint });
    lizardLimb(l.kn, l.an, [{ t: 0, r: 0.11 }, { t: 0.5, r: 0.1 }, { t: 1, r: 0.08 }], [LEG, FOOT], tint, R);
    addPiece(limbTube(V3(l.an.x, 0.14, 0), V3(l.an.x, 0.3, 0), [{ t: 0, r: 0.09 }, { t: 1, r: 0.085 }], 10), 0xcfc4a8, [LEG, FOOT]);     /* wraps */
    addPiece(ellipsoid(l.an.x, 0.07, 0.08, 0.09, 1.1, 0.6, 1.6), LZ_GREEN, [FOOT], { tint: tint });
    for(var f = -1; f <= 1; f++) addPiece(spike(V3(l.an.x + f * 0.06, 0.05, 0.2), V3(f * 0.35, -0.2, 1), 0.11, 0.022, 4), LZ_CLAW, [FOOT]);
  });
  /* tail: one tapered tube along the four tail bones */
  var tail = [V3(0, 1.0, -0.12)]; for(i = 1; i <= 4; i++) tail.push(BONE_DEFS.find(function(d){ return d.name === 'tail' + i; }).pos.clone()); tail.push(V3(0, 0.35, -1.75));
  var curve = new THREE.CatmullRomCurve3(tail);
  for(i = 1; i < 10; i++){ var tt = i / 10, tp = curve.getPoint(tt), tg = curve.getTangent(tt), tr = 0.13 * (1 - tt) + 0.02;
    var ring = new THREE.TorusGeometry(tr * 1.02, 0.012, 5, 14); ring.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), tg))); ring.translate(tp.x, tp.y - tr * 0.3, tp.z);
    addPiece(ring, LZ_BELLY, ['tail' + Math.min(4, Math.max(1, Math.round(tt * 4)))]); }   /* belly plate rings down the tail */
  addPiece(curveTube(curve, 30, 12, function(t){ return 0.13 * (1 - t) + 0.02; }), LZ_GREEN, ['mixamorigHips', 'tail1', 'tail2', 'tail3', 'tail4'], { tint: tint, power: 3 });
  for(i = 0; i < 8; i++){ var pt = curve.getPoint(0.1 + i * 0.1), r = 0.13 * (0.9 - i * 0.1) + 0.02; addPiece(spike(V3(pt.x, pt.y + r * 0.9, pt.z), V3(0, 1, -0.3), 0.07, 0.015, 4), LZ_RED, ['tail' + Math.min(4, Math.floor(i / 2) + 1)]); }
}
function buildBow(){
  var g = new THREE.Group(), wood = propMat(0x8a5a30, 0, 0.7), horn = propMat(0xd8c8a0, 0.1, 0.5), str = propMat(0xe8e0d0);
  var limb = new THREE.CatmullRomCurve3([V3(0, 0.7, -0.1), V3(0, 0.45, 0.06), V3(0, 0.15, 0.02), V3(0, 0, 0), V3(0, -0.15, 0.02), V3(0, -0.45, 0.06), V3(0, -0.7, -0.1)]);
  propMesh(g, new THREE.TubeGeometry(limb, 24, 0.018, 6, false), wood);
  propMesh(g, new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), propMat(0x4a3020), 0, 0);
  for(var w = 0; w < 6; w++) propMesh(g, new THREE.TorusGeometry(0.031, 0.004, 5, 10), propMat(0xd8c070), 0, -0.06 + w * 0.024, 0);   /* grip wrap */
  [1, -1].forEach(function(m){ propMesh(g, new THREE.SphereGeometry(0.025, 6, 6), horn, 0, m * 0.7, -0.1); });
  propMesh(g, new THREE.CylinderGeometry(0.004, 0.004, 1.4, 4), str, 0, 0, -0.1);
  return g;
}
/* overlay for the extra bones: lower arms in a guard, punching on the attack; the tail sways with the stride */
function lizardExtraPose(u, clip){
  var ph = u * Math.PI * 2, walk = /walk|run/.test(clip), sw = walk ? Math.sin(ph) : 0.3 * Math.sin(ph * 0.5);
  /* the tail bones rest pointing -Z: rotation.y sways it sideways, rotation.x lifts it */
  for(var i = 1; i <= 4; i++) setRot('tail' + i, -0.05 + 0.04 * Math.sin(ph * 2 + i), 0.18 * sw * (i / 4) * (walk ? 1 : 0.6), 0);
  [1, -1].forEach(function(s){
    var pre = 'lower' + (s > 0 ? 'Left' : 'Right');
    if(clip === 'attack'){
      var k = s > 0 ? smooth((u - 0.2) / 0.2) * (1 - smooth((u - 0.5) / 0.3)) : smooth((u - 0.45) / 0.15) * (1 - smooth((u - 0.7) / 0.3));
      setRot(pre + 'Arm', lerp(0.6, -1.3, k), 0, s * lerp(0.5, 0.15, k)); setRot(pre + 'ForeArm', lerp(-1.6, -0.3, k), 0, 0); setRot(pre + 'Hand', -0.3, 0, 0);
    } else {
      setRot(pre + 'Arm', 0.5 + 0.1 * sw * s, 0, s * (0.55 + 0.05 * Math.sin(ph))); setRot(pre + 'ForeArm', -1.5 + 0.15 * sw, 0, s * -0.2); setRot(pre + 'Hand', -0.4, 0, 0);
    }
  });
}
registerCharacter({ key: 'lizard', name: 'Four-armed lizard', clips: ['mixamo', 'walk', 'run', 'idle'], defaultClip: 'mixamo',
  proportions: { hip: 1.04, spine: 1.16, spine1: 1.3, spine2: 1.46, neck: 1.78, head: 1.92, headTop: 2.14,
    shoulderX: 0.15, shoulderY: 1.72, armX: 0.34, armY: 1.66, elbowX: 0.64, wristX: 0.92, handTipX: 1.06,
    hipX: 0.15, kneeX: 0.16, kneeY: 0.56, kneeZ: 0.03, ankleY: 0.14, footTipZ: 0.26 },
  extraBones: function(P){
    [1, -1].forEach(function(s){ var S = s > 0 ? 'Left' : 'Right';
      defBone('lower' + S + 'Shoulder', 'mixamorigSpine1', s * 0.14, 1.34, 0.02);
      defBone('lower' + S + 'Arm',      'lower' + S + 'Shoulder', s * 0.36, 1.32, 0.02);
      defBone('lower' + S + 'ForeArm',  'lower' + S + 'Arm',      s * 0.66, 1.32, 0.02);
      defBone('lower' + S + 'Hand',     'lower' + S + 'ForeArm',  s * 0.94, 1.32, 0.02, [s * 1.06, 1.32, 0.02]); });
    defBone('tail1', 'mixamorigHips', 0, 0.98, -0.16); defBone('tail2', 'tail1', 0, 0.86, -0.5);
    defBone('tail3', 'tail2', 0, 0.68, -0.9); defBone('tail4', 'tail3', 0, 0.5, -1.3, [0, 0.35, -1.75]);
  },
  extraPose: lizardExtraPose,
  weapons: { lowerLeftHand: 'bow' }, build: buildLizardBody });
