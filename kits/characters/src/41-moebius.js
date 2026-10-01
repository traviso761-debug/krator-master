/* ============================== Moebius: the Dune costume sheet ==============================
   Nine figures from Moebius's 1975 Dune costume studies, built by one data-driven
   costume builder: a plain humanoid body dressed from a spec (undersuit, trousers,
   boots, gloves, belt, tabard, robe, cape, shoulders, hat, hair, emblem, streamers,
   staff, sword). Each figure is a spec of a dozen fields, so a new one costs a few
   lines. All share the human proportions and every clip.
*/
var MB_SKIN = 0xd8b090, MB_GOLD = 0xd8b048;
function mbCape(spec, bones){
  var c = spec.cape, side = c.side || 0, w = c.width || 0.32, cx = side * 0.12, len = c.length || 1.4;
  var rings = [{ y: 1.78, rx: w, rz: 0.16, cz: -0.06 }, { y: 1.78 - len * 0.3, rx: w + 0.05, rz: 0.08, cz: -0.2 }, { y: 1.78 - len * 0.65, rx: w + 0.1, rz: 0.06, cz: -0.3 }, { y: 1.78 - len, rx: w + 0.14, rz: 0.05, cz: -0.34 }];
  var g = bodyTube(rings.map(function(r){ return { y: r.y, rx: r.rx * (side ? 0.6 : 1), rz: r.rz, cz: r.cz }; }), 16, false); g.translate(cx, 0, 0);
  addPiece(g, c.color, bones, { power: 2, tint: c.tint });
}
function mbShoulders(spec){
  var s = spec.shoulders; if(!s) return;
  [1, -1].forEach(function(sd){
    var a = armPts(sd), ARM = B(sd, 'Arm'), bones = ['mixamorigSpine2', ARM];
    if(s.type === 'pads') addPiece(ellipsoid(a.sh.x, a.sh.y + 0.04, 0, 0.16, 1.05, 0.8, 0.95), s.color, bones, { metal: s.metal });
    if(s.type === 'segmented') for(var k = 0; k < 4; k++) addPiece(ellipsoid(a.sh.x + sd * k * 0.05, a.sh.y + 0.06 - k * 0.02, 0, 0.14 - k * 0.015, 1.0, 0.55, 1.0), k % 2 ? s.color : s.color2 || s.color, bones, { metal: s.metal });
    if(s.type === 'feathers') for(k = 0; k < 7; k++){ var ang = -0.3 + k * 0.28; addPiece(box(a.sh.x + sd * 0.08, a.sh.y + 0.05, -0.08, 0.05, 0.42, 0.012, [0.25, sd * -0.3, sd * (-0.9 + ang)]), k % 2 ? s.color : s.color2, bones, { power: 2 }); }
    if(s.type === 'pleated') for(k = 0; k < 6; k++) addPiece(box(a.sh.x + sd * (0.02 + k * 0.03), a.sh.y + 0.12 - k * 0.04, 0, 0.05, 0.35 + k * 0.06, 0.26, [0, 0, sd * (0.2 + k * 0.08)]), k % 2 ? s.color : s.color2, bones, { power: 2 });
    if(s.type === 'balls'){ addPiece(ellipsoid(a.sh.x + sd * 0.06, a.sh.y + 0.08, 0, 0.11), s.color, bones); addPiece(ellipsoid(a.sh.x, a.sh.y + 0.02, 0, 0.14, 1, 0.8, 1), s.color2, bones); }
  });
}
function mbHat(spec){
  var h = spec.hat, H = ['mixamorigHead'], M = { metal: true }; if(!h) return;
  if(h.type === 'tallcyl'){ addPiece(bodyTube([{ y: 2.05, rx: 0.14, rz: 0.14 }, { y: 2.4, rx: 0.15, rz: 0.15 }, { y: 2.42, rx: 0.1, rz: 0.1 }], 16), h.color, H);
    for(var i = 0; i < 9; i++){ var a = -1.4 + i * 0.35; addPiece(spike(V3(Math.cos(a) * 0.08, 2.42, Math.sin(a) * 0.08 + 0.02), V3(Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4), 0.14, 0.012, 4), MB_GOLD, H, M); }
    addPiece(ellipsoid(0, 2.22, 0.15, 0.04, 1, 1, 0.4), 0xc02a2a, H); addPiece(ellipsoid(0, 2.22, 0.14, 0.06, 1, 1, 0.3), MB_GOLD, H, M); }
  if(h.type === 'winged'){ addPiece(ellipsoid(0, 2.12, -0.02, 0.13, 1, 0.8, 1.05), h.color, H);
    addPiece(box(0, 2.42, -0.04, 0.16, 0.4, 0.03, [-0.15, 0, 0]), h.color, H); addPiece(box(0, 2.5, -0.02, 0.06, 0.22, 0.035, [-0.2, 0, 0]), 0x101014, H);
    [1, -1].forEach(function(s){ addPiece(box(s * 0.16, 2.2, -0.04, 0.03, 0.3, 0.14, [0, 0, s * -0.4]), h.color, H); }); }
  if(h.type === 'feathers'){ addPiece(ellipsoid(0, 2.1, -0.02, 0.125, 1, 0.9, 1.0), h.color, H);
    for(i = 0; i < 9; i++){ var ang = -1.2 + i * 0.3; addPiece(box(Math.sin(ang) * 0.1, 2.3, -0.08, 0.05, 0.4, 0.012, [0.3, 0, -ang]), i % 2 ? h.color : h.color2, H); } }
  if(h.type === 'crown'){ addPiece(bodyTube([{ y: 2.08, rx: 0.14, rz: 0.14 }, { y: 2.26, rx: 0.15, rz: 0.15 }, { y: 2.3, rx: 0.1, rz: 0.1 }], 16), h.color, H, M);
    [1, -1].forEach(function(s){ var horn = new THREE.CatmullRomCurve3([V3(s * 0.14, 2.2, 0.02), V3(s * 0.26, 2.3, 0.0), V3(s * 0.28, 2.45, -0.02), V3(s * 0.2, 2.56, -0.04)]);
      addPiece(curveTube(horn, 12, 6, function(t){ return 0.03 * (1 - t * 0.7); }), h.color, H, M); });
    for(i = 0; i < 5; i++) addPiece(spike(V3(-0.1 + i * 0.05, 2.3, 0.02), V3((i - 2) * 0.15, 1, 0), 0.2 + (i === 2 ? 0.12 : 0), 0.012, 4), h.color, H, M);
    addPiece(ellipsoid(0, 2.05, 0.09, 0.09, 1, 1.2, 0.6), h.color2 || 0x4a8a5a, H, M); }        /* the mask */
  if(h.type === 'hood'){ addPiece(ellipsoid(0, 2.1, -0.03, 0.14, 1.05, 1.1, 1.05), h.color, H);
    [1, -1].forEach(function(s){ addPiece(limbTube(V3(s * 0.12, 2.05, -0.02), V3(s * 0.15, 1.55, -0.1), [{ t: 0, r: 0.06 }, { t: 1, r: 0.05 }], 8), h.color, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 }); }); }
  if(h.type === 'pinkhelm'){ addPiece(box(0, 2.14, 0, 0.3, 0.32, 0.3), h.color, H); addPiece(box(0, 2.34, 0, 0.36, 0.1, 0.2), h.color, H);
    [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.2, 2.26, 0, 0.07), h.color2, H); addPiece(box(s * 0.08, 2.34, 0.02, 0.1, 0.14, 0.14), h.color, H); });
    addPiece(ellipsoid(0, 2.08, 0.16, 0.09, 1, 0.9, 0.4), MB_GOLD, H, M); addPiece(box(0, 2.0, 0.19, 0.2, 0.06, 0.03), 0x8a3a1a, H); }
  if(h.type === 'ruff'){ var r = new THREE.TorusGeometry(0.16, 0.05, 8, 20); r.rotateX(Math.PI / 2); r.translate(0, 1.9, 0); addPiece(r, h.color, ['mixamorigNeck', 'mixamorigSpine2']); }
}
function mbHair(spec){
  var h = spec.hair, H = ['mixamorigHead']; if(!h) return;
  if(h.type === 'cap') addPiece(ellipsoid(0, 2.09, -0.02, 0.12, 1.0, 0.95, 1.0), h.color, H);
  if(h.type === 'bob'){ addPiece(ellipsoid(0, 2.1, -0.03, 0.125, 1.05, 1.0, 1.05), h.color, H); [1, -1].forEach(function(s){ addPiece(box(s * 0.11, 1.98, -0.02, 0.04, 0.2, 0.2), h.color, H); }); }
  if(h.type === 'curly') for(var i = 0; i < 14; i++){ var a = i / 14 * Math.PI * 2, k = i % 3; addPiece(ellipsoid(Math.cos(a) * 0.1, 2.1 + 0.04 * k, Math.sin(a) * 0.09 - 0.02, 0.055 + 0.01 * k), h.color, H); }
  if(h.type === 'long'){ addPiece(ellipsoid(0, 2.1, -0.02, 0.125, 1.0, 0.95, 1.0), h.color, H); addPiece(limbTube(V3(0, 2.05, -0.1), V3(0, 1.5, -0.16), [{ t: 0, r: 0.1 }, { t: 1, r: 0.07 }], 8), h.color, ['mixamorigHead', 'mixamorigNeck', 'mixamorigSpine2'], { power: 2 }); }
}
function buildMoebiusFigure(spec){
  var M = { metal: true }, torsoBones = ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'];
  var legBones = ['mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg'), B(1, 'Leg'), B(-1, 'Leg')];
  var skin = spec.skin || MB_SKIN, i;
  /* body */
  addPiece(bodyTube([{ y: 1.0, rx: 0.19, rz: 0.15 }, { y: 1.26, rx: 0.2, rz: 0.15 }, { y: 1.5, rx: 0.25, rz: 0.18 }, { y: 1.74, rx: 0.27, rz: 0.19 }, { y: 1.84, rx: 0.12, rz: 0.11 }], 20),
    spec.top, torsoBones, { tint: spec.topTint, metal: spec.topMetal });
  if(spec.bareMidriff) addPiece(bodyTube([{ y: 1.18, rx: 0.19, rz: 0.145 }, { y: 1.4, rx: 0.205, rz: 0.155 }], 20, false), skin, ['mixamorigSpine', 'mixamorigSpine1']);
  if(spec.emblem) { addPiece(ellipsoid(0, 1.58, 0.21, spec.emblem.r || 0.07, 1, 1, 0.3), spec.emblem.ring || MB_GOLD, ['mixamorigSpine2'], M); addPiece(ellipsoid(0, 1.58, 0.22, (spec.emblem.r || 0.07) * 0.6, 1, 1, 0.3), spec.emblem.color, ['mixamorigSpine2']); }
  addPiece(limbTube(V3(0, 1.8, 0), V3(0, 1.97, 0), [{ t: 0, r: 0.07 }, { t: 1, r: 0.065 }], 10), spec.neck || skin, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(ellipsoid(0, 2.04, 0.01, 0.11, 0.92, 1.15, 1.0), skin, ['mixamorigHead']);
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.04, 2.05, 0.095, 0.014, 1, 0.6, 0.6), 0x201810, ['mixamorigHead']); });
  addPiece(ellipsoid(0, 1.975, 0.1, 0.02, 1.4, 0.35, 0.5), 0x9a5a4a, ['mixamorigHead']);
  mbHair(spec); mbHat(spec);
  /* robe or trousers */
  if(spec.robe){ var robe = []; for(i = 0; i <= 30; i++){ var t = i / 30; robe.push({ y: 1.3 - t * 1.28, rx: 0.21 + t * 0.26, rz: 0.16 + t * 0.2 }); }
    addPiece(bodyTube(robe, 32), spec.robe.color, legBones, { tint: spec.robe.tint, power: 2 }); }
  else [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot'), l = legPts(s);
    addPiece(limbTube(l.hp, l.kn, [{ t: 0, r: 0.15 }, { t: 0.5, r: 0.145 }, { t: 1, r: 0.11 }], 14), spec.pants, [UP, LEG], { tint: spec.pantsTint });
    addPiece(ellipsoid(l.kn.x, l.kn.y, l.kn.z, 0.105), spec.pants, [UP, LEG]);
    addPiece(limbTube(l.kn, l.an, [{ t: 0, r: 0.105 }, { t: 0.5, r: 0.1 }, { t: 1, r: 0.085 }], 14), spec.pants, [LEG, FOOT], { tint: spec.pantsTint });
    var bh = spec.bootHeight || 0.3;
    addPiece(limbTube(V3(l.an.x, 0.1, 0), V3(l.an.x, 0.1 + bh, 0), [{ t: 0, r: 0.1 }, { t: 1, r: 0.105 }], 12), spec.boots, [LEG, FOOT], { metal: spec.bootsMetal });
    addPiece(box(l.an.x, 0.06, 0.07, 0.17, 0.12, 0.3), spec.boots, [FOOT], { metal: spec.bootsMetal });
    addPiece(ellipsoid(l.an.x, 0.06, 0.2, 0.085, 1, 0.7, 0.9), spec.boots, [FOOT], { metal: spec.bootsMetal });
  });
  if(spec.robe) [1, -1].forEach(function(s){ var l = legPts(s); addPiece(box(l.an.x, 0.05, 0.1, 0.12, 0.08, 0.26), spec.boots || 0x2a2420, [B(s, 'Foot')]); });
  /* tabard, belt */
  if(spec.tabard) [1, -1].forEach(function(f){ if(f < 0 && spec.tabard.frontOnly) return;
    addPiece(box(0, spec.tabard.y || 0.9, f * 0.2, spec.tabard.w || 0.3, spec.tabard.h || 0.8, 0.02), spec.tabard.color, ['mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg')], { power: 2, tint: spec.tabard.tint }); });
  if(spec.belt){ addPiece(bodyTube([{ y: 1.08, rx: 0.215, rz: 0.165 }, { y: 1.18, rx: 0.215, rz: 0.165 }], 18), spec.belt.color, ['mixamorigHips', 'mixamorigSpine'], { metal: spec.belt.metal });
    addPiece(box(0, 1.13, 0.17, 0.1, 0.09, 0.02), spec.belt.buckle || MB_GOLD, ['mixamorigHips'], M); }
  if(spec.discs) for(i = 0; i < spec.discs; i++) addPiece(ellipsoid(0, 1.66 - i * 0.16, 0.2 + (i > 2 ? 0.04 * (i - 2) : 0), 0.035, 1, 1, 0.35), MB_GOLD, [i < 3 ? 'mixamorigSpine2' : i < 4 ? 'mixamorigSpine' : 'mixamorigHips'], M);
  /* arms */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(ellipsoid(a.sh.x, a.sh.y + 0.02, 0, 0.12, 1.0, 0.9, 0.9), spec.sleeves || spec.top, ['mixamorigSpine2', ARM], { tint: spec.sleeveTint });
    addPiece(limbTube(a.sh, a.el, [{ t: 0, r: spec.wideSleeves ? 0.13 : 0.1 }, { t: 1, r: spec.wideSleeves ? 0.12 : 0.085 }], 12), spec.sleeves || spec.top, [ARM, FA], { tint: spec.sleeveTint });
    addPiece(ellipsoid(a.el.x, a.el.y, a.el.z, 0.08), spec.sleeves || spec.top, [ARM, FA], { tint: spec.sleeveTint });
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.085 }, { t: 1, r: spec.wideSleeves ? 0.13 : 0.075 }], 12), spec.sleeves || spec.top, [FA, HAND], { tint: spec.sleeveTint });
    if(spec.cuffs) addPiece(limbTube(a.el.clone().lerp(a.wr, 0.8), a.wr, [{ t: 0, r: 0.09 }, { t: 1, r: 0.085 }], 12, false), spec.cuffs, [FA, HAND], M);
    fist(s, spec.gloves || skin, [HAND]);
    if(spec.streamers) for(var k = 0; k < 4; k++){ var sp = V3(a.sh.x + s * 0.05, a.sh.y - 0.05, -0.1 + k * 0.06);
      addPiece(limbTube(sp, V3(sp.x + s * (0.1 + k * 0.08), 0.6 + k * 0.1, sp.z - 0.15 + k * 0.1), [{ t: 0, r: 0.02 }, { t: 1, r: 0.012 }], 6), spec.streamers, [ARM, 'mixamorigSpine2', 'mixamorigHips'], { power: 2 }); }
  });
  mbShoulders(spec);
  if(spec.cape) mbCape(spec, ['mixamorigSpine2', 'mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'Leg'), B(-1, 'Leg')]);
  if(spec.sword) { addPiece(box(0.25, 0.75, -0.02, 0.025, 0.7, 0.01, [0, 0, 0.1]), 0xb8bcc4, ['mixamorigHips', B(1, 'UpLeg')], { metal: true, power: 2 }); addPiece(box(0.21, 1.08, -0.02, 0.08, 0.02, 0.03), MB_GOLD, ['mixamorigHips'], M); }
}
/* a staff with a gold spiral (the caduceus-like one) */
function spiralStaffHead(g){
  var gold = propMat(MB_GOLD, 0.9, 0.35), pts = []; for(var i = 0; i <= 24; i++){ var t = i / 24; pts.push(V3(Math.cos(t * 12) * 0.04, 1.2 + t * 0.5, Math.sin(t * 12) * 0.04)); }
  propMesh(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.01, 5, false), gold);
  propMesh(g, new THREE.SphereGeometry(0.03, 8, 6), gold, 0, 1.72, 0);
}
/* tint factories are called in the spec table before three.js has loaded: colours resolve on first use */
function stripeTint(c1, c2, n, vertical){ var a, b; return function(p){ if(!a){ a = C(c1); b = C(c2); } var v = vertical ? Math.atan2(p.z, p.x) / Math.PI * n : p.y * n; return (Math.floor(v) % 2 + 2) % 2 ? b : a; }; }
function blotchTint(base, blot){ var a, b; return function(p){ if(!a){ a = C(base); b = C(blot); } return cellNoise(p, 0.09) > 0.72 ? b : a; }; }

var MOEBIUS_SPECS = [
  { key: 'leto', name: 'Moebius: Duke Leto', skin: 0xd8b090, hair: { type: 'cap', color: 0xe8c040 }, top: 0x2a3030, pants: 0xb8c4d0, boots: 0xd85a2a, bootHeight: 0.42,
    shoulders: { type: 'segmented', color: 0xe86a2a, color2: 0xf0a040, metal: true }, cape: { color: 0x4a8a7a, side: 1, length: 1.3 }, belt: { color: 0x3a2a1a }, discs: 4, gloves: 0xd8b090, sword: true },
  { key: 'emperor', name: 'Moebius: the Emperor', skin: 0xd0a888, hat: { type: 'winged', color: 0xf4f0e8 }, top: 0xe8e0d8, topTint: stripeTint(0xe8e0d8, 0xc02a3a, 10, true), pants: 0xc02a3a, boots: 0xf4f0e8,
    shoulders: { type: 'pads', color: 0xf0e8e0 }, cape: { color: 0xc8302a, length: 1.6, width: 0.4 }, emblem: { color: 0x3a6ab8, r: 0.08 }, belt: { color: 0x2a4a9a }, sleeves: 0x3a6ab8 },
  { key: 'feyd', name: 'Moebius: feathered lord', skin: 0xd8b090, hat: { type: 'feathers', color: 0x2a2a30, color2: 0xf0e8e0 }, top: 0xd84a6a, pants: 0xd8b090, boots: 0x6a4a2a, bootHeight: 0.35,
    shoulders: { type: 'feathers', color: 0xf0e8e0, color2: 0x2a2a30 }, cape: { color: 0x2a5aa8, length: 1.5, width: 0.4, tint: stripeTint(0x2a5aa8, 0xd84a3a, 12, true) }, emblem: { color: 0x2a9a6a, r: 0.07 }, belt: { color: 0xd8b048, metal: true } },
  { key: 'padishah', name: 'Moebius: hooded priest', skin: 0xd8b090, hat: { type: 'tallcyl', color: 0x101418 }, top: 0x14181e, robe: { color: 0x14181e, tint: function(){ var k, s, o; return function(p){ if(!k){ k = C(0x14181e); s = C(0xc8c0b8); o = C(0xe88a3a); } if(p.y > 0.45) return k; var v = Math.atan2(p.z, p.x) * 8; return (Math.floor(v) % 2 + 2) % 2 ? s : o; }; }() },
    sleeves: 0x14181e, wideSleeves: true, discs: 5, emblem: { color: 0xf0e8e0, r: 0.06 }, staff: { color: 0xc8302a, head: spiralStaffHead }, boots: 0x101418 },
  { key: 'jessica', name: 'Moebius: lady with streamers', skin: 0xe0c0a8, hair: { type: 'bob', color: 0x14121a }, hat: { type: 'ruff', color: 0x2a4aa8 }, top: 0x2a4aa8, bareMidriff: true, pants: 0x2a3a8a, pantsTint: blotchTint(0x2a3a8a, 0x4a6ad0), boots: 0x8a9ab8, bootsMetal: true, bootHeight: 0.5,
    emblem: { color: 0xd84a3a, r: 0.06 }, streamers: 0x7a9a3a, sleeves: 0x3a4a9a, gloves: 0x8a9ab8, staff: { color: 0xb8bcc4, head: null } },
  { key: 'harkonnen', name: 'Moebius: pink baron', skin: 0xe8b0a0, hat: { type: 'pinkhelm', color: 0xf0b0c8, color2: 0xf08a3a }, top: 0xf0b0c8, topTint: blotchTint(0xf0b0c8, 0x3a2a3a), pants: 0xf0b0c8, pantsTint: blotchTint(0xf0b0c8, 0x3a2a3a), boots: 0xf0b0c8, bootHeight: 0.2,
    sleeves: 0xc8d0a0, sleeveTint: stripeTint(0xc8d0a0, 0x4a7a3a, 14, false), shoulders: { type: 'balls', color: 0xf08a3a, color2: 0xf0b0c8 }, belt: { color: 0xe8c040, buckle: 0x9a6a2a }, gloves: 0xf0b0c8 },
  { key: 'stilgar', name: 'Moebius: desert captain', skin: 0xc89870, hair: { type: 'curly', color: 0x8a5a2a }, top: 0x4a7a4a, pants: 0x8a7a5a, boots: 0x6a4a2a, bootHeight: 0.3,
    cape: { color: 0xd89a3a, length: 1.5, width: 0.4 }, emblem: { color: 0xc02a3a, r: 0.09 }, belt: { color: 0xd8b048, metal: true }, cuffs: 0xd8b048, gloves: 0x6a4a2a, sword: true },
  { key: 'goldpriest', name: 'Moebius: gold priest', skin: 0x6a9a6a, hat: { type: 'crown', color: 0xd8b048, color2: 0x4a8a5a }, top: 0xe8a030, robe: { color: 0xe8a030, tint: stripeTint(0xe8a030, 0xd84a2a, 4, false) },
    sleeves: 0xe8a030, wideSleeves: true, shoulders: { type: 'pleated', color: 0xe8a030, color2: 0xf0d060 }, emblem: { color: 0xc8302a, r: 0.06 }, discs: 5, boots: 0x6a4a2a },
  { key: 'greenwoman', name: 'Moebius: woman in green', skin: 0xe0c0a8, hat: { type: 'hood', color: 0xd83a2a }, top: 0x2a6a3a, robe: { color: 0x2a6a3a }, sleeves: 0x9a9aa0, gloves: 0x9a9aa0, emblem: { color: 0x2a6a3a, ring: 0xd8b048, r: 0.05 }, boots: 0x2a2a2a }
];
MOEBIUS_SPECS.forEach(function(spec){
  registerCharacter({ key: spec.key, name: spec.name, clips: ['idle', 'mixamo', 'walk', 'midle', 'run'], defaultClip: 'idle',
    proportions: { hip: 1.1, spine: 1.24, spine1: 1.38, spine2: 1.52, neck: 1.84, head: 1.96, headTop: 2.3,
      shoulderX: 0.14, shoulderY: 1.78, armX: 0.32, armY: 1.72, elbowX: 0.62, wristX: 0.92, handTipX: 1.04,
      hipX: 0.13, kneeX: 0.14, kneeY: 0.6, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.24 },
    build: function(){ buildMoebiusFigure(spec); if(spec.staff) attachProp(-1, buildStaff(spec.staff.color, spec.staff.head), V3(0, -0.02, 0.06), [0, 0, 0]); } });
});
