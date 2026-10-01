/* ============================== the pufferfish ogre ==============================
   A sumo-wide spiked ogre with a pufferfish face: mottled grey-green hide, a
   cream belly, bone spikes everywhere, a braided rope belt over purple sashes,
   studded bracers, a topknot, bells on the chest, fins on the back. 1.95 m tall
   and nearly as wide. Proportions: short legs, low hips, no neck to speak of.
*/
var PF_HIDE = 0x8c9a86, PF_HIDE_DARK = 0x4b5a4c, PF_BELLY = 0xdcd6c4, PF_BONE = 0xe2dac4, PF_NAVY = 0x2a2d3e,
    PF_PURPLE = 0x7a3f9a, PF_ROPE = 0x3a3842, PF_TEAL = 0x3f8a86, PF_GOLD = 0xc9a23a, PF_HAIR = 0x1a1a22, PF_RED = 0x9a3a3a;

/* mottled hide: dark patches on grey-green, a cream belly in front and low */
function pufferTint(){
  var hide = C(PF_HIDE), dark = C(PF_HIDE_DARK), belly = C(PF_BELLY), speck = C(0xb8a070);
  return function(p){
    var n = cellNoise(p, 0.13), f = cellNoise(p, 0.05);
    var isBelly = p.z > 0.12 && p.y < 1.55 && p.y > 0.3 && Math.abs(p.x) < 0.62 - (1.55 - p.y) * 0.1;
    if(isBelly) return f > 0.8 ? speck : belly;
    return n > 0.58 ? dark : hide;
  };
}
/* spikes over a body of revolution: profile [{y, rx, rz}] gives the surface */
function spikesOnBody(profile, n, len, bones, R, cx){
  cx = cx || 0;
  for(var i = 0; i < n; i++){
    var y = profile[0].y + R() * (profile[profile.length - 1].y - profile[0].y), a = R() * Math.PI * 2;
    var k = 0; while(k < profile.length - 2 && profile[k + 1].y < y) k++;
    var t = (y - profile[k].y) / (profile[k + 1].y - profile[k].y), rx = lerp(profile[k].rx, profile[k + 1].rx, t), rz = lerp(profile[k].rz, profile[k + 1].rz, t);
    var base = V3(cx + Math.cos(a) * rx * 0.97, y, Math.sin(a) * rz * 0.97), out = V3(Math.cos(a) * rz, (R() - 0.5) * 0.6, Math.sin(a) * rx).normalize();
    addPiece(spike(base, out, len * (0.6 + R() * 0.8), 0.03 + R() * 0.02), PF_BONE, bones);
  }
}
function buildPufferBody(){
  var R = rng(21), tint = pufferTint();
  var body = [{ y: 0.84, rx: 0.42, rz: 0.36 }, { y: 0.95, rx: 0.56, rz: 0.48 }, { y: 1.10, rx: 0.64, rz: 0.56 }, { y: 1.28, rx: 0.64, rz: 0.57 },
              { y: 1.45, rx: 0.58, rz: 0.52 }, { y: 1.58, rx: 0.46, rz: 0.42 }, { y: 1.68, rx: 0.30, rz: 0.30 }, { y: 1.74, rx: 0.16, rz: 0.16 }];
  var torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  addPiece(bodyTube(body, 28), PF_HIDE, torsoBones, { tint: tint });
  spikesOnBody(body.slice(1, 6), 70, 0.16, torsoBones, R);
  /* back fins: thin teal plates */
  seam(V3(-0.34, 1.52, 0.4), V3(0.34, 1.52, 0.4), 0x8a7030, ['mixamorigSpine2'], 0.006);                                                       /* chain between the bells */
  seam(V3(-0.2, 1.3, 0.56), V3(0.1, 1.05, 0.6), 0x5a6a58, ['mixamorigSpine', 'mixamorigHips'], 0.007); seam(V3(0.25, 1.4, 0.5), V3(0.4, 1.15, 0.5), 0x5a6a58, ['mixamorigSpine1'], 0.007);   /* belly scars */
  [[0, 1.5, -0.5, 0.3], [0.3, 1.35, -0.46, -0.3], [-0.3, 1.35, -0.46, 0.3]].forEach(function(f){
    addPiece(box(f[0], f[1], f[2], 0.26, 0.34, 0.02, [0.5, 0, f[3]]), PF_TEAL, ['mixamorigSpine2', 'mixamorigSpine1']); });
  /* head: a pufferfish face set into the top of the body */
  addPiece(ellipsoid(0, 1.80, 0.14, 0.30, 1.15, 0.85, 1.0), PF_HIDE, ['mixamorigHead', 'mixamorigNeck'], { tint: tint });
  addPiece(ellipsoid(0, 1.70, 0.30, 0.22, 1.2, 0.8, 0.8), PF_BELLY, ['mixamorigHead']);                 /* pale muzzle */
  addPiece(ellipsoid(0, 1.66, 0.44, 0.16, 1.15, 0.55, 0.5), 0x2a1018, ['mixamorigHead']);                /* open mouth */
  addPiece(ellipsoid(0, 1.63, 0.46, 0.07, 1.4, 0.5, 0.6), 0xc0404a, ['mixamorigHead']);                  /* tongue */
  for(var i = -3; i <= 3; i++){ addPiece(spike(V3(i * 0.045, 1.735, 0.47), V3(0, -1, 0.1), 0.045, 0.014, 4), 0xf4f0e8, ['mixamorigHead']);
    addPiece(spike(V3(i * 0.045, 1.595, 0.46), V3(0, 1, 0.1), 0.04, 0.013, 4), 0xf4f0e8, ['mixamorigHead']); }
  [1, -1].forEach(function(s){
    addPiece(ellipsoid(s * 0.15, 1.86, 0.36, 0.06, 1, 1, 0.8), 0xe8c030, ['mixamorigHead']);             /* yellow eye */
    addPiece(ellipsoid(s * 0.15, 1.86, 0.41, 0.025), 0x101010, ['mixamorigHead']);
    addPiece(box(s * 0.15, 1.93, 0.37, 0.14, 0.03, 0.06, [0.3, 0, s * -0.4]), PF_HIDE_DARK, ['mixamorigHead']); /* angry brow */
    addPiece(ellipsoid(s * 0.36, 1.78, 0.05, 0.08, 0.5, 1.2, 1.0), PF_HIDE_DARK, ['mixamorigHead']);     /* gill fin */
  });
  spikesOnBody([{ y: 1.72, rx: 0.3, rz: 0.3 }, { y: 1.95, rx: 0.28, rz: 0.28 }], 18, 0.12, ['mixamorigHead'], R);
  /* topknot */
  addPiece(ellipsoid(0, 2.02, 0.0, 0.14, 1.3, 0.45, 1.2), PF_HAIR, ['mixamorigHead']);
  addPiece(limbTube(V3(0, 2.04, -0.02), V3(0, 2.2, -0.04), [{ t: 0, r: 0.05 }, { t: 1, r: 0.04 }], 8), PF_HAIR, ['mixamorigHead']);
  addPiece(limbTube(V3(0, 2.06, -0.02), V3(0, 2.1, -0.02), [{ t: 0, r: 0.055 }, { t: 1, r: 0.055 }], 8), PF_RED, ['mixamorigHead']);
  for(i = 0; i < 7; i++){ var a = i / 7 * Math.PI * 2; addPiece(spike(V3(0, 2.19, -0.04), V3(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5), 0.12, 0.02, 4), PF_HAIR, ['mixamorigHead']); }
  /* bells at the collar */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.34, 1.52, 0.4, 0.07), PF_GOLD, ['mixamorigSpine2'], { metal: true }); addPiece(ellipsoid(s * 0.34, 1.46, 0.43, 0.018), 0x6a5020, ['mixamorigSpine2'], { metal: true });
    addPiece(box(s * 0.34, 1.42, 0.42, 0.03, 0.12, 0.01), PF_PURPLE, ['mixamorigSpine2']); addPiece(box(s * 0.34, 1.38, 0.43, 0.05, 0.03, 0.012), PF_RED, ['mixamorigSpine2']);
    seam(V3(s * 0.34, 1.58, 0.36), V3(s * 0.1, 1.72, 0.2), 0x4a3a2a, ['mixamorigSpine2']); });                                               /* bell cord to the collar */

  /* arms: thick, with bracers */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(ellipsoid(a.sh.x, a.sh.y + 0.03, 0, 0.22, 1.0, 1.0, 0.95), PF_HIDE, ['mixamorigSpine2', ARM], { tint: tint });
    addPiece(ellipsoid(a.sh.x, a.sh.y + 0.12, 0, 0.2, 1.1, 0.45, 1.0), PF_NAVY, ['mixamorigSpine2', ARM], { metal: true });                                 /* pauldron pad */
    studRing(a.sh.x, a.sh.y + 0.14, 0, 0.19, 0.17, 10, 0.014, PF_GOLD, ['mixamorigSpine2', ARM]);
    spikesOnBody([{ y: a.sh.y - 0.1, rx: 0.2, rz: 0.2 }, { y: a.sh.y + 0.2, rx: 0.16, rz: 0.16 }], 10, 0.16, ['mixamorigSpine2', ARM], R, a.sh.x);
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: 0.19 }, { t: 0.5, r: 0.19 }, { t: 1, r: 0.15 }], 14), PF_HIDE, [ARM, FA], { tint: tint });
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.14), PF_HIDE, [ARM, FA], { tint: tint });
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.15 }, { t: 0.5, r: 0.16 }, { t: 1, r: 0.13 }], 14), PF_NAVY, [FA, HAND], { metal: true });     /* bracer */
    addPiece(limbTube(a.el.clone().lerp(a.wr, 0.45), a.el.clone().lerp(a.wr, 0.6), [{ t: 0, r: 0.165 }, { t: 1, r: 0.165 }], 14), PF_PURPLE, [FA]);
    studRing(a.el.clone().lerp(a.wr, 0.3).x, a.el.y, a.el.z, 0.16, 0.16, 10, 0.013, PF_GOLD, [FA]); studRing(a.el.clone().lerp(a.wr, 0.8).x, a.el.y, a.el.z, 0.14, 0.14, 10, 0.013, PF_GOLD, [FA, HAND]);
    for(var k = 0; k < 6; k++){ var t = 0.15 + k * 0.14, ang = (k % 2) * Math.PI + Math.PI / 2 - 0.4 * s; var c = a.el.clone().lerp(a.wr, t);
      addPiece(spike(V3(c.x, c.y + Math.cos(ang) * 0.14, c.z + Math.sin(ang) * 0.14), V3(0, Math.cos(ang), Math.sin(ang)), 0.1, 0.03), PF_BONE, [FA]); }
    fist(s, PF_HIDE_DARK, [HAND]);
    addPiece(box(a.fist.x, a.fist.y, a.fist.z + 0.07, 0.12, 0.09, 0.02), PF_NAVY, [HAND], { metal: true });                                     /* knuckle plate */
  });

  /* rope belt (a ring of knots), sashes, skirt plates */
  for(i = 0; i < 26; i++){ var ang2 = i / 26 * Math.PI * 2; addPiece(ellipsoid(Math.cos(ang2) * 0.64, 0.98 + (i % 2) * 0.03, Math.sin(ang2) * 0.56, 0.085, 1, 0.8, 1), PF_ROPE, ['mixamorigHips', 'mixamorigSpine']); }
  addPiece(bodyTube([{ y: 0.86, rx: 0.60, rz: 0.52 }, { y: 0.95, rx: 0.63, rz: 0.55 }], 28), PF_PURPLE, ['mixamorigHips']);
  addPiece(ellipsoid(-0.3, 0.88, 0.5, 0.045, 0.9, 1.1, 0.9), PF_BONE, ['mixamorigHips']); [1, -1].forEach(function(s){ addPiece(ellipsoid(-0.3 + s * 0.015, 0.89, 0.54, 0.01), 0x101010, ['mixamorigHips']); });   /* skull charm */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.045, 1.72, 0.44, 0.012, 1, 0.7, 0.5), 0x3a3a30, ['mixamorigHead']); });   /* nostrils */
  for(i = 0; i < 8; i++){ var ang3 = i / 8 * Math.PI * 2 + 0.2, px = Math.cos(ang3) * 0.5, pz = Math.sin(ang3) * 0.44;
    addPiece(box(px, 0.70, pz, 0.26, 0.34, 0.03, [0, -ang3 + Math.PI / 2, 0]), PF_NAVY, ['mixamorigHips', B(px > 0 ? 1 : -1, 'UpLeg')]);
    addPiece(box(px * 1.02, 0.74, pz * 1.02, 0.2, 0.05, 0.03, [0, -ang3 + Math.PI / 2, 0]), PF_RED, ['mixamorigHips', B(px > 0 ? 1 : -1, 'UpLeg')]); }
  addPiece(box(0.06, 0.62, 0.5, 0.05, 0.25, 0.02), PF_BELLY, ['mixamorigHips']);                                                                /* tassel */
  addPiece(ellipsoid(0.1, 0.92, 0.56, 0.06, 1.3, 0.8, 0.7), PF_PURPLE, ['mixamorigHips']); addPiece(ellipsoid(0.1, 0.74, 0.55, 0.03, 1, 1.4, 0.6), PF_PURPLE, ['mixamorigHips']);   /* sash knot and tail */

  /* legs: short and thick, sandals with claws */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.25, rz: 0.24 }, { t: 0.5, r: 0.24 }, { t: 1, r: 0.19 }], 16), PF_HIDE, [UP, LEG], { tint: tint });
    spikesOnBody([{ y: l.kn.y + 0.05, rx: 0.2, rz: 0.2 }, { y: l.hp.y - 0.05, rx: 0.24, rz: 0.24 }], 14, 0.13, [UP, LEG], R, l.hp.x);
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z, 0.17), PF_HIDE, [UP, LEG], { tint: tint });
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z + 0.1, 0.11, 1, 1.1, 0.5), PF_NAVY, [UP, LEG], { metal: true }); studRing(l.kn.x, l.kn.y, l.kn.z + 0.1, 0.1, 0.05, 8, 0.012, PF_GOLD, [UP, LEG]);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.17 }, { t: 0.6, r: 0.16 }, { t: 1, r: 0.15 }], 14), PF_HIDE, [LEG, FOOT], { tint: tint });
    addPiece(limbTube(V3(l.an.x, l.an.y + 0.1, 0), V3(l.an.x, l.an.y + 0.22, 0), [{ t: 0, r: 0.165 }, { t: 1, r: 0.17 }], 14), PF_PURPLE, [LEG]);
    addPiece(box(l.an.x, 0.07, 0.08, 0.3, 0.12, 0.42), PF_NAVY, [FOOT]);
    addPiece(box(l.an.x, 0.14, 0.02, 0.26, 0.1, 0.2), PF_NAVY, [FOOT], { metal: true });
    studRing(l.an.x, 0.16, 0.02, 0.13, 0.1, 8, 0.012, PF_GOLD, [FOOT]); seam(V3(l.an.x - 0.13, 0.1, 0.2), V3(l.an.x + 0.13, 0.1, 0.2), PF_PURPLE, [FOOT], 0.012);   /* sandal strap */
    for(var k = -1; k <= 1; k++) addPiece(spike(V3(l.an.x + k * 0.1, 0.05, 0.28), V3(k * 0.2, -0.2, 1), 0.1, 0.03, 4), PF_BONE, [FOOT]);
  });
}
registerCharacter({ key: 'puffer', name: 'Pufferfish ogre', clips: ['mixamo', 'walk', 'idle', 'run'], defaultClip: 'mixamo', capsuleCap: 0.75,
  proportions: { hip: 0.96, spine: 1.06, spine1: 1.2, spine2: 1.36, neck: 1.62, head: 1.70, headTop: 2.05,
    shoulderX: 0.18, shoulderY: 1.56, armX: 0.52, armY: 1.52, elbowX: 0.88, wristX: 1.20, handTipX: 1.34,
    hipX: 0.24, kneeX: 0.25, kneeY: 0.50, kneeZ: 0.03, ankleY: 0.12, footTipZ: 0.3 },
  build: buildPufferBody });
