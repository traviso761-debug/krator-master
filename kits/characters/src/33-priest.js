/* ============================== the desert priest ==============================
   A 2.5 m figure in a floor-length embroidered robe: a hooded mantle, a tall
   patterned mitre with a sun disc over the brow, a dark chrome face, three
   white shells on the chest, beaded hands. The robe is one tube skinned to
   the spine and both legs, so it sways with a walk. The textile is a vertex-
   colour pattern: chevrons and bands in neon on black. One clip of his own:
   'raise', the right hand held up.
*/
var PR_BLACK = 0x15131a, PR_PAL = [0xff2a8a, 0xff8a1a, 0x1ad0b0, 0xffe02a, 0x9a3cff, 0x3ad0ff];
function priestTint(seed, scale){
  var black = C(PR_BLACK), pal = PR_PAL.map(C);
  return function(p){
    var th = Math.atan2(p.z, p.x), band = Math.floor(p.y * scale), chev = Math.abs(((th * 10 / Math.PI + band * 0.5) % 2 + 2) % 2 - 1);
    var k = (band * 3 + Math.floor(chev * 8) + seed) % 13;
    if(k > 4) return black;
    if(Math.abs(th - Math.PI / 2) < 0.18 && p.y < 1.9) return pal[(band + seed) % pal.length];       /* the front panel stripe */
    return pal[k % pal.length];
  };
}
function buildPriestBody(){
  var R = rng(33);
  var legBones = ['mixamorigSpine1', 'mixamorigSpine', 'mixamorigHips', B(1, 'UpLeg'), B(-1, 'UpLeg'), B(1, 'Leg'), B(-1, 'Leg')];
  /* the robe: shoulders to the floor */
  var robe = [];
  for(var i = 0; i <= 70; i++){ var t = i / 70, y = 2.02 - t * 2.0, flare = 0.3 + t * t * 0.42; robe.push({ y: y, rx: flare + (t < 0.15 ? (0.15 - t) * 0.6 : 0), rz: flare * 0.78 }); }
  addPiece(bodyTube(robe, 84), PR_BLACK, legBones.concat(['mixamorigSpine2']), { tint: priestTint(0, 14), power: 2 });
  /* the mantle over the shoulders, and the hood */
  var mantle = [{ y: 2.12, rx: 0.18, rz: 0.16 }, { y: 2.0, rx: 0.38, rz: 0.3 }, { y: 1.78, rx: 0.5, rz: 0.4 }, { y: 1.55, rx: 0.52, rz: 0.42 }];
  addPiece(bodyTube(mantle, 40, false), PR_BLACK, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigSpine1'], { tint: priestTint(4, 9) });
  addPiece(ellipsoid(0, 2.27, -0.04, 0.22, 1.1, 1.25, 1.1), PR_BLACK, ['mixamorigHead'], { tint: priestTint(2, 12) });
  addPiece(ellipsoid(0, 2.25, 0.09, 0.14, 0.95, 1.1, 0.9), 0x3a3a46, ['mixamorigHead'], { metal: true });                     /* chrome face */
  [1, -1].forEach(function(s){ addPiece(ellipsoid(s * 0.05, 2.28, 0.2, 0.03, 1, 0.7, 0.6), 0x101014, ['mixamorigHead']); });
  addPiece(ellipsoid(0, 2.19, 0.2, 0.035, 1.6, 0.5, 0.6), 0x8a8a96, ['mixamorigHead'], { metal: true });                       /* mouth plate */
  /* the mitre */
  addPiece(limbTube(V3(0, 2.36, -0.02), V3(0, 2.98, -0.04), [{ t: 0, r: 0.23 }, { t: 0.5, r: 0.17 }, { t: 0.9, r: 0.07 }, { t: 1, r: 0.03 }], 24), PR_BLACK, ['mixamorigHead'], { tint: priestTint(7, 14) });
  addPiece(ellipsoid(0, 3.0, -0.04, 0.045), 0xffe02a, ['mixamorigHead']);
  for(i = 0; i < 8; i++){ var a = i / 8 * Math.PI * 2; addPiece(spike(V3(Math.cos(a) * 0.04, 3.02, -0.04 + Math.sin(a) * 0.04), V3(Math.cos(a), 1.2, Math.sin(a)), 0.07, 0.008, 4), 0xffe02a, ['mixamorigHead']); }
  [1, -1].forEach(function(s){ addPiece(box(s * 0.26, 2.52, -0.02, 0.1, 0.14, 0.02, [0, 0, s * 0.3]), 0xd8c070, ['mixamorigHead'], { metal: true }); }); /* side fins */
  /* the sun disc over the brow */
  var disc = new THREE.TorusGeometry(0.15, 0.03, 8, 28); disc.translate(0, 2.47, 0.2);
  addPiece(disc, 0xffb020, ['mixamorigHead'], { metal: true });
  addPiece(ellipsoid(0, 2.47, 0.2, 0.11, 1, 1, 0.4), 0x6a1040, ['mixamorigHead']);
  addPiece(ellipsoid(0, 2.47, 0.24, 0.055, 1, 1, 0.5), 0xff3aa0, ['mixamorigHead']);
  for(i = 0; i < 12; i++){ var a2 = i / 12 * Math.PI * 2; addPiece(spike(V3(Math.cos(a2) * 0.18, 2.47 + Math.sin(a2) * 0.18, 0.2), V3(Math.cos(a2), Math.sin(a2), 0), 0.07, 0.012, 4), 0xff8a1a, ['mixamorigHead']); }
  /* shells on the chest */
  [[0, 2.0, 0.34], [0.1, 1.76, 0.42], [-0.1, 1.76, 0.42]].forEach(function(c){ addPiece(ellipsoid(c[0], c[1], c[2], 0.075, 1, 1, 0.6), 0xe8e4dc, ['mixamorigSpine2']); addPiece(ellipsoid(c[0], c[1], c[2] + 0.04, 0.035, 1, 1, 0.6), 0xb8b0a8, ['mixamorigSpine2']); });
  /* sleeves and hands */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand'), a = armPts(s);
    addPiece(limbTube(a.sh.clone().add(V3(-s * 0.1, 0.04, 0)), a.el, [{ t: 0, r: 0.16 }, { t: 1, r: 0.14 }], 16), PR_BLACK, ['mixamorigSpine2', ARM, FA], { tint: priestTint(1, 10) });
    addPiece(limbTube(a.el, a.wr, [{ t: 0, r: 0.14 }, { t: 0.7, r: 0.16 }, { t: 1, r: 0.2 }], 16), PR_BLACK, [FA, HAND], { tint: priestTint(5, 10) });
    /* an open hand with beaded fingers */
    addPiece(box(a.wr.x + s * 0.09, a.wr.y, 0, 0.14, 0.03, 0.1), 0x2a1a30, [HAND]);
    for(var f = 0; f < 4; f++){ var z = -0.04 + f * 0.027; addPiece(limbTube(V3(a.wr.x + s * 0.15, a.wr.y, z), V3(a.wr.x + s * 0.26, a.wr.y, z), [{ t: 0, r: 0.012 }, { t: 1, r: 0.01 }], 6), 0x2a1a30, [HAND]);
      addPiece(ellipsoid(a.wr.x + s * 0.21, a.wr.y + 0.012, z, 0.012), PR_PAL[f], [HAND]); }
    addPiece(limbTube(V3(a.wr.x + s * 0.1, a.wr.y, 0.05), V3(a.wr.x + s * 0.17, a.wr.y, 0.1), [{ t: 0, r: 0.013 }, { t: 1, r: 0.01 }], 6), 0x2a1a30, [HAND]);
  });
  /* feet under the hem: the hem does the walking, these only show the stride */
  [1, -1].forEach(function(s){ var l = legPts(s); addPiece(box(l.an.x, 0.05, 0.1, 0.14, 0.08, 0.3), 0x1a1620, [B(s, 'Foot')]); });
}
/* the priest's own pose: idle breathing with the right hand raised, palm forward */
function raisePose(u){
  idlePose(u);
  var ph = u * Math.PI * 2;
  setRot(B(-1, 'Arm'), 0.25, 0, -2.75 + 0.03 * Math.sin(ph));
  setRot(B(-1, 'ForeArm'), -0.35, 0.2, -0.2);
  setRot(B(-1, 'Hand'), 0, 0.3, 0.1);
  setRot('mixamorigHead', 0.02, 0, 0);
}
registerCharacter({ key: 'priest', name: 'Desert priest', clips: ['raise', 'mixamo', 'walk', 'idle'], defaultClip: 'raise',
  extraClips: function(){ return { raise: bakeClip('raise', raisePose, 3.2, 24) }; },
  proportions: { hip: 1.25, spine: 1.42, spine1: 1.58, spine2: 1.74, neck: 2.06, head: 2.16, headTop: 2.45,
    shoulderX: 0.14, shoulderY: 2.0, armX: 0.30, armY: 1.95, elbowX: 0.62, wristX: 0.94, handTipX: 1.1,
    hipX: 0.14, kneeX: 0.15, kneeY: 0.68, kneeZ: 0.02, ankleY: 0.14, footTipZ: 0.24 },
  build: buildPriestBody });
