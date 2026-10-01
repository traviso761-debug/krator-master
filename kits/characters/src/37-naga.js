/* ============================== the naga ==============================
   A four-armed snake-woman: human torso and arms, a gold breastplate and a gold
   cobra headdress, long black hair, and a serpent body in place of legs. The leg
   bones exist (the rig needs them, Mixamo clips move them) but nothing is skinned
   to them; the body is one tapered tube over a seven-bone serpent chain that
   trails behind. The overlay slithers the chain with a travelling wave on walk
   and run, sways it at rest, and swings the lower arms' daggers on the attack.
*/
var NG_SKIN = 0xc9986a, NG_SKIN_DARK = 0xa87a50, NG_SCALE = 0x3f8a3a, NG_SCALE_DARK = 0x2a5a2a, NG_BELLY = 0xd8b870,
    NG_GOLD = 0xd8b048, NG_HAIR = 0x16120f, NG_BLADE = 0xc8d8f0, NG_ICE = 0x80b0ff;
function nagaTint(){
  var g = C(NG_SCALE), gd = C(NG_SCALE_DARK), b = C(NG_BELLY), bd = C(0xb89850);
  return function(p){ var n = cellNoise(p, 0.05);
    var belly = p.y > 0.3 ? p.z > 0.06 && Math.abs(p.x) < 0.2 : p.y < 0.11;
    if(belly) return n > 0.7 ? bd : b;
    var d = Math.abs(((p.z * 3 + p.y * 2) % 1 + 1) % 1 - 0.5) + Math.abs(p.x) * 2.2;            /* dorsal diamonds */
    return d < 0.22 ? gd : n < 0.3 ? gd : g; };
}
function nagaArm(s, pre, a, R){
  var S = s > 0 ? 'Left' : 'Right', ARM = pre + S + 'Arm', FA = pre + S + 'ForeArm', HAND = pre + S + 'Hand', root = pre === 'mixamorig' ? 'mixamorigSpine2' : 'mixamorigSpine1';
  addPiece(ellipsoid(a.sh.x, a.sh.y + 0.01, 0, 0.1, 1.0, 0.95, 0.9), NG_SKIN, [root, ARM]);
  addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.09 }, { t: 0.45, r: 0.095 }, { t: 1, r: 0.07 }], 12), NG_SKIN, [ARM, FA]);
  addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.068), NG_SKIN, [ARM, FA]);
  addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.068 }, { t: 0.4, r: 0.075 }, { t: 1, r: 0.05 }], 12), NG_SKIN, [FA, HAND]);
  addPiece(limbTube(a.sh.clone().lerp(a.el, 0.3), a.sh.clone().lerp(a.el, 0.42), [{ t: 0, r: 0.1 }, { t: 1, r: 0.1 }], 12, false), NG_GOLD, [ARM], { metal: true }); /* armlet */
  addPiece(ellipsoid(a.wr.x + s * 0.06, a.wr.y, 0.01, 0.055, 1.2, 0.75, 0.95), NG_SKIN_DARK, [HAND]);
  addPiece(limbTube(a.wr.clone().add(V3(-s * 0.03, 0, 0)), a.wr.clone().add(V3(-s * 0.01, 0, 0)), [{ t: 0, r: 0.06 }, { t: 1, r: 0.06 }], 10, false), NG_GOLD, [FA, HAND], { metal: true });   /* bangle */
}
function buildNagaBody(){
  var R = rng(37), tint = nagaTint(), M = { metal: true };
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube([{ y: 1.0, rx: 0.19, rz: 0.15 }, { y: 1.12, rx: 0.17, rz: 0.13 }, { y: 1.26, rx: 0.16, rz: 0.125 }, { y: 1.4, rx: 0.2, rz: 0.15 },
                     { y: 1.56, rx: 0.24, rz: 0.17 }, { y: 1.7, rx: 0.22, rz: 0.16 }, { y: 1.8, rx: 0.1, rz: 0.09 }], 20), NG_SKIN, torsoBones);
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.1, 1.56, 0.15, 0.095, 1, 0.95, 0.75), NG_GOLD, ['mixamorigSpine2'], M); });   /* breastplate cups */
  addPiece(bodyTube([{ y: 1.36, rx: 0.205, rz: 0.155 }, { y: 1.5, rx: 0.235, rz: 0.17 }, { y: 1.64, rx: 0.235, rz: 0.17 }, { y: 1.72, rx: 0.2, rz: 0.15 }], 20, false), NG_GOLD, ['mixamorigSpine1', 'mixamorigSpine2'], M);
  addPiece(ellipsoid(0, 1.52, 0.2, 0.025), 0xff3a6a, ['mixamorigSpine2']);                                                                          /* gem */
  addPiece(bodyTube([{ y: 1.34, rx: 0.21, rz: 0.16 }, { y: 1.38, rx: 0.215, rz: 0.165 }], 20, false), 0x8a7030, ['mixamorigSpine1'], M);         /* plate hem */
  /* neck, head, hair, headdress */
  addPiece(limbTube(V3(0, 1.78, 0), V3(0, 1.94, 0.01), [{ t: 0, r: 0.07 }, { t: 1, r: 0.06 }], 10), NG_SKIN, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(ellipsoid(0, 2.03, 0.01, 0.11, 0.9, 1.1, 1.0), NG_SKIN, ['mixamorigHead']);
  addPiece(ellipsoid(0, 1.96, 0.04, 0.085, 0.95, 0.7, 1.0), NG_SKIN, ['mixamorigHead']);                                                           /* jaw */
  faceHuman(2.03, NG_SKIN, { r: 0.105, iris: 0x4a9a3a, brow: 0x1a1410, lips: 0x8a2a3a });
  [1, -1].forEach(function(s){ addPiece(spike(V3(s * 0.025, 1.975, 0.095), V3(0, -1, 0.1), 0.025, 0.006, 4), 0xf4f0e8, ['mixamorigHead']);        /* fangs */
    addPiece(limbTube(V3(s * 0.105, 1.99, 0), V3(s * 0.11, 1.9, 0), [{ t: 0, r: 0.006 }, { t: 1, r: 0.006 }], 4), NG_GOLD, ['mixamorigHead'], { metal: true }); addPiece(ellipsoid(s * 0.11, 1.89, 0, 0.018), 0xff3a6a, ['mixamorigHead']); });   /* earrings */
  addPiece(ellipsoid(0, 1.2, 0.165, 0.02), 0xff3a6a, ['mixamorigSpine']);                                                                         /* navel gem */
  addPiece(box(0.16, 1.0, 0.1, 0.05, 0.3, 0.03, [0, 0, 0.3]), 0x3a2020, ['mixamorigHips']); addPiece(box(0.19, 1.12, 0.12, 0.07, 0.03, 0.04, [0, 0, 0.3]), NG_GOLD, ['mixamorigHips'], { metal: true });   /* sheath */
  addPiece(ellipsoid(0, 2.08, -0.03, 0.125, 1.0, 1.0, 1.05), NG_HAIR, ['mixamorigHead']);                                                           /* hair cap */
  [1, -1].forEach(function(s){ addPiece(limbTube(V3(s * 0.1, 2.05, -0.06), V3(s * 0.14, 1.5, -0.12), [{ t: 0, r: 0.06 }, { t: 1, r: 0.045 }], 8), NG_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 });
    for(var hb = 0; hb < 3; hb++) addPiece(ellipsoid(s * (0.11 + hb * 0.01), 1.9 - hb * 0.12, -0.08 - hb * 0.015, 0.02, 1, 0.6, 1), NG_GOLD, ['mixamorigNeck', 'mixamorigSpine2'], { metal: true }); });   /* hair beads */
  addPiece(limbTube(V3(0, 2.05, -0.1), V3(0, 1.45, -0.2), [{ t: 0, r: 0.09 }, { t: 1, r: 0.06 }], 8), NG_HAIR, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 });
  /* cobra headdress: a flared hood behind the head, a crown band, a snake over the top */
  addPiece(ellipsoid(0, 2.2, -0.04, 0.2, 1.1, 1.0, 0.45), NG_GOLD, ['mixamorigHead'], M);
  addPiece(bodyTube([{ y: 2.08, rx: 0.135, rz: 0.13 }, { y: 2.15, rx: 0.14, rz: 0.135 }], 16, false), NG_GOLD, ['mixamorigHead'], M);
  addPiece(ellipsoid(0, 2.12, 0.13, 0.03, 1, 1.2, 0.5), 0xff3a6a, ['mixamorigHead']);
  var cobra = new THREE.CatmullRomCurve3([V3(0, 2.14, 0.12), V3(0, 2.3, 0.05), V3(0, 2.4, -0.04), V3(0.02, 2.5, 0.02), V3(0.05, 2.52, 0.1)]);
  addPiece(curveTube(cobra, 16, 7, function(t){ return 0.03 * (1 - t * 0.4); }), NG_GOLD, ['mixamorigHead'], M);
  /* four arms */
  [1, -1].forEach(function(s){
    nagaArm(s, 'mixamorig', armPts(s), R);
    nagaArm(s, 'lower', { sh: V3(s * 0.25, 1.3, 0.02), el: V3(s * 0.52, 1.3, 0.02), wr: V3(s * 0.78, 1.3, 0.02) }, R);
  });
  /* the serpent body */
  var pts = [V3(0, 1.08, 0)]; for(var i = 1; i <= 7; i++) pts.push(BONE_DEFS.find(function(d){ return d.name === 'serpent' + i; }).pos.clone()); pts.push(V3(0, 0.08, -2.5));
  var curve = new THREE.CatmullRomCurve3(pts);
  var bones = ['mixamorigHips']; for(i = 1; i <= 7; i++) bones.push('serpent' + i);
  addPiece(curveTube(curve, 56, 16, function(t){ return 0.2 * (1 - t * 0.85) + 0.02 * Math.sin(t * 40) * (1 - t); }), NG_SCALE, bones, { tint: tint, power: 3 });
  for(i = 2; i < 30; i++){ var st = i / 30, sp = curve.getPoint(st), sr = 0.2 * (1 - st * 0.85); addPiece(ellipsoid(sp.x, sp.y + (st < 0.25 ? 0 : sr * 0.95), sp.z - (st < 0.25 ? sr * 0.95 : 0), 0.02 * (1 - st * 0.6) + 0.006, 1, 0.6, 1.4), NG_SCALE_DARK, [bones[Math.min(7, Math.max(1, Math.round(st * 7)))]]); }   /* dorsal ridge scales */
  addPiece(bodyTube([{ y: 1.0, rx: 0.2, rz: 0.16 }, { y: 1.06, rx: 0.2, rz: 0.16 }], 20), 0x6a2a2a, ['mixamorigHips']);                           /* the sash at the join */
  for(i = 0; i < 16; i++){ var ca = i / 16 * Math.PI * 2; addPiece(limbTube(V3(Math.cos(ca) * 0.2, 1.0, Math.sin(ca) * 0.16), V3(Math.cos(ca) * 0.2, 0.95, Math.sin(ca) * 0.16), [{ t: 0, r: 0.004 }, { t: 1, r: 0.004 }], 4), NG_GOLD, ['mixamorigHips'], { metal: true }); addPiece(ellipsoid(Math.cos(ca) * 0.2, 0.94, Math.sin(ca) * 0.16, 0.014, 1, 1, 0.4), NG_GOLD, ['mixamorigHips'], { metal: true }); }   /* coin fringe */
}
function buildDagger(iceBlade){
  var g = new THREE.Group(), steel = propMat(iceBlade ? NG_ICE : NG_BLADE, 0.9, iceBlade ? 0.2 : 0.3), grip = propMat(0x2a2020), gold = propMat(NG_GOLD, 0.9, 0.35);
  propMesh(g, new THREE.CylinderGeometry(0.014, 0.016, 0.14, 8), grip, 0, 0.02);
  propMesh(g, new THREE.SphereGeometry(0.02, 8, 6), gold, 0, 0.1);
  propMesh(g, new THREE.BoxGeometry(0.09, 0.015, 0.025), gold, 0, -0.06);
  var blade = new THREE.BoxGeometry(0.035, 0.34, 0.007); blade.translate(0, -0.24, 0); propMesh(g, blade, steel);
  var tip = new THREE.CylinderGeometry(0, 0.018, 0.08, 4); tip.rotateX(Math.PI); tip.rotateY(Math.PI / 4); tip.translate(0, -0.45, 0); propMesh(g, tip, steel);
  return g;
}
function nagaExtraPose(u, clip){
  var ph = u * Math.PI * 2, moving = /walk|run/.test(clip), A = moving ? 0.32 : 0.08, speed = moving ? 2 : 0.5;
  for(var i = 1; i <= 7; i++) setRot('serpent' + i, 0.02 * Math.sin(ph * speed + i), A * Math.sin(ph * speed - i * 0.85) * (i < 3 ? 0.4 : 1), 0);
  [1, -1].forEach(function(s){
    var pre = 'lower' + (s > 0 ? 'Left' : 'Right');
    if(clip === 'attack'){ var k = smooth((u - 0.3) / 0.15) * (1 - smooth((u - 0.6) / 0.3));
      setRot(pre + 'Arm', lerp(0.4, -1.2, k), 0, s * lerp(0.6, 0.9, k)); setRot(pre + 'ForeArm', lerp(-1.4, -0.4, k), 0, s * 0.2); setRot(pre + 'Hand', 0.2, s * -0.4, 0); }
    else { setRot(pre + 'Arm', 0.35 + 0.08 * Math.sin(ph + s), 0, s * 0.5); setRot(pre + 'ForeArm', -1.3 + 0.1 * Math.sin(ph * 0.7), 0, s * 0.3); setRot(pre + 'Hand', 0.2, s * -0.4, 0); }
  });
}
registerCharacter({ key: 'naga', name: 'Naga', clips: ['mixamo', 'walk', 'run', 'idle'], defaultClip: 'mixamo',
  proportions: { hip: 1.08, spine: 1.2, spine1: 1.34, spine2: 1.5, neck: 1.8, head: 1.92, headTop: 2.14,
    shoulderX: 0.13, shoulderY: 1.74, armX: 0.26, armY: 1.68, elbowX: 0.54, wristX: 0.8, handTipX: 0.92,
    hipX: 0.1, kneeX: 0.1, kneeY: 0.7, kneeZ: 0, ankleY: 0.4, footTipZ: 0.1 },
  extraBones: function(P){
    [1, -1].forEach(function(s){ var S = s > 0 ? 'Left' : 'Right';
      defBone('lower' + S + 'Shoulder', 'mixamorigSpine1', s * 0.12, 1.32, 0.02); defBone('lower' + S + 'Arm', 'lower' + S + 'Shoulder', s * 0.25, 1.3, 0.02);
      defBone('lower' + S + 'ForeArm', 'lower' + S + 'Arm', s * 0.52, 1.3, 0.02); defBone('lower' + S + 'Hand', 'lower' + S + 'ForeArm', s * 0.78, 1.3, 0.02, [s * 0.9, 1.3, 0.02]); });
    var chain = [[0, 0.8, 0.02], [0, 0.5, 0.0], [0, 0.26, -0.18], [0, 0.14, -0.5], [0, 0.12, -0.9], [0, 0.11, -1.3], [0, 0.1, -1.7]];
    chain.forEach(function(c, i){ defBone('serpent' + (i + 1), i ? 'serpent' + i : 'mixamorigHips', c[0], c[1], c[2], i === 6 ? [0, 0.08, -2.5] : null); });
  },
  extraPose: nagaExtraPose,
  build: function(){ buildNagaBody();
    attachProp(-1, buildDagger(false), V3(0, -0.05, 0.02), [0.3, 0, 0]);
    attachProp(1, buildDagger(false), V3(0, -0.05, 0.02), [0.3, 0, 0]);
    /* the lower right hand gets the ice dagger; lower hands are mounted by name */
    PROPS.push({ side: -1, group: buildDagger(true), pos: V3(0, -0.05, 0.02), euler: [0.3, 0, 0], bone: 'lowerRightHand' });
  } });
