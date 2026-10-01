/* ============================== the barbarian ==============================
   Bald, pink handlebar mustache, bare chest, leather trousers with pink fur
   trim at the belt and the boot cuffs, a bearded axe in each hand.
   Rest pose: standing, facing +Z, arms down and a little out. Units: metres.
   He is 2.2 m tall.
*/
var SKIN = 0xd4927a, SKIN_DARK = 0xc4826a, PINK = 0xd84aa0, LEATHER = 0x7a5838, LEATHER_LIGHT = 0x957046,
    LEATHER_DARK = 0x4b3621, STEEL = 0xb9bec6, WOOD = 0x6a4a2b, EYE_WHITE = 0xf6f1e8, EYE_DARK = 0x2a1a14;

/* Bones carry Mixamo's names (without the colon, as three's FBXLoader writes them), in
   Mixamo's rest convention: every bone has identity rotation, legs point -Y, spine +Y,
   arms along +/-X (a T-pose), +X is the character's LEFT. A Mixamo clip's local
   quaternions then apply with no retargeting at all. */
function defineBarbarianBones(){
  defBone('mixamorigHips',   null,             0, 1.12, 0);
  defBone('mixamorigSpine',  'mixamorigHips',  0, 1.26, 0);
  defBone('mixamorigSpine1', 'mixamorigSpine', 0, 1.38, 0);
  defBone('mixamorigSpine2', 'mixamorigSpine1',0, 1.50, 0);
  defBone('mixamorigNeck',   'mixamorigSpine2',0, 1.86, 0);
  defBone('mixamorigHead',   'mixamorigNeck',  0, 1.98, 0, [0, 2.22, 0]);
  [1, -1].forEach(function(s){
    var S = s > 0 ? 'Left' : 'Right';
    defBone('mixamorig' + S + 'Shoulder', 'mixamorigSpine2',          s * 0.16, 1.80, 0);
    defBone('mixamorig' + S + 'Arm',      'mixamorig' + S + 'Shoulder', s * 0.40, 1.74, 0);
    defBone('mixamorig' + S + 'ForeArm',  'mixamorig' + S + 'Arm',      s * 0.74, 1.74, 0);
    defBone('mixamorig' + S + 'Hand',     'mixamorig' + S + 'ForeArm',  s * 1.06, 1.74, 0, [s * 1.20, 1.74, 0]);
    defBone('mixamorig' + S + 'UpLeg',    'mixamorigHips',            s * 0.17, 1.08, 0);
    defBone('mixamorig' + S + 'Leg',      'mixamorig' + S + 'UpLeg',    s * 0.18, 0.62, 0.02);
    defBone('mixamorig' + S + 'Foot',     'mixamorig' + S + 'Leg',      s * 0.18, 0.12, 0, [s * 0.18, 0.02, 0.24]);
  });
}
/* short aliases used by the body builder and the poses */
function B(side, part){ return 'mixamorig' + (side > 0 ? 'Left' : 'Right') + part; }

function buildBarbarianBody(){
  var R = rng(7);
  /* torso: pelvis to neck, V-shaped */
  addPiece(bodyTube([
    { y: 1.02, rx: 0.21, rz: 0.15 }, { y: 1.10, rx: 0.225, rz: 0.16 }, { y: 1.20, rx: 0.215, rz: 0.15 },
    { y: 1.32, rx: 0.235, rz: 0.165 }, { y: 1.44, rx: 0.29, rz: 0.20 }, { y: 1.56, rx: 0.345, rz: 0.235 },
    { y: 1.68, rx: 0.37, rz: 0.24 }, { y: 1.77, rx: 0.35, rz: 0.22 }, { y: 1.84, rx: 0.26, rz: 0.17 }, { y: 1.89, rx: 0.14, rz: 0.13 }
  ], 20), SKIN, ['mixamorigHips', 'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck']);
  /* pecs, abs, traps, lats */
  [1, -1].forEach(function(s){
    addPiece(ellipsoid(s * 0.155, 1.60, 0.185, 0.13, 1.15, 0.78, 0.55), SKIN, ['mixamorigSpine2']);
    addPiece(ellipsoid(s * 0.07, 1.46, 0.185, 0.06, 1.1, 0.9, 0.5), SKIN, ['mixamorigSpine2', 'mixamorigSpine1']);
    addPiece(ellipsoid(s * 0.07, 1.36, 0.165, 0.06, 1.1, 0.85, 0.5), SKIN, ['mixamorigSpine1', 'mixamorigSpine2']);
    addPiece(ellipsoid(s * 0.075, 1.27, 0.15, 0.055, 1.1, 0.8, 0.5), SKIN, ['mixamorigSpine', 'mixamorigHips']);
    addPiece(ellipsoid(s * 0.30, 1.50, -0.04, 0.12, 0.9, 1.4, 0.9), SKIN, ['mixamorigSpine2']);            /* lats */
  });
  addPiece(ellipsoid(0, 1.83, -0.03, 0.2, 2.1, 0.7, 1.2), SKIN, ['mixamorigSpine2', 'mixamorigNeck']);               /* traps */
  /* neck and head */
  addPiece(limbTube(V3(0, 1.82, 0), V3(0, 2.00, 0.01), [{ t: 0, r: 0.125 }, { t: 0.5, r: 0.11 }, { t: 1, r: 0.10 }], 14), SKIN, ['mixamorigSpine2', 'mixamorigNeck', 'mixamorigHead']);
  addPiece(ellipsoid(0, 2.065, 0, 0.16, 0.95, 1.0, 1.0), SKIN, ['mixamorigHead']);
  addPiece(ellipsoid(0, 1.975, 0.035, 0.12, 1.05, 0.72, 1.05), SKIN, ['mixamorigHead']);                   /* jaw */
  addPiece(ellipsoid(0, 2.02, 0.155, 0.03, 0.85, 1.1, 0.8), SKIN, ['mixamorigHead']);                      /* nose */
  [1, -1].forEach(function(s){
    addPiece(ellipsoid(s * 0.152, 2.05, 0.0, 0.03, 0.6, 1.4, 1.0), SKIN, ['mixamorigHead']);               /* ear */
    addPiece(ellipsoid(s * 0.055, 2.063, 0.128, 0.024, 1, 0.75, 0.6), EYE_WHITE, ['mixamorigHead']);
    addPiece(ellipsoid(s * 0.052, 2.06, 0.146, 0.011, 1, 1, 0.6), EYE_DARK, ['mixamorigHead']);
    addPiece(ellipsoid(s * 0.06, 2.09, 0.125, 0.045, 1.2, 0.45, 0.6), SKIN, ['mixamorigHead']);             /* brow ridge */
    var brow = new THREE.CatmullRomCurve3([V3(s * 0.022, 2.072, 0.148), V3(s * 0.07, 2.098, 0.142), V3(s * 0.12, 2.112, 0.112)]);
    addPiece(curveTube(brow, 8, 7, function(t){ return 0.022 - 0.012 * t; }), PINK, ['mixamorigHead']);        /* angry brow */
    /* handlebar mustache: a tapered tube along a curve, out, down, then curling up */
    var curve = new THREE.CatmullRomCurve3([
      V3(s * 0.01, 1.985, 0.158), V3(s * 0.07, 1.975, 0.15), V3(s * 0.14, 1.955, 0.125),
      V3(s * 0.205, 1.975, 0.09), V3(s * 0.245, 2.025, 0.055), V3(s * 0.235, 2.075, 0.035)
    ]);
    addPiece(curveTube(curve, 28, 8, function(t){ return 0.02 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.1)) * (1 - t * 0.55); }), PINK, ['mixamorigHead']);
  });
  addPiece(ellipsoid(0, 1.985, 0.152, 0.036, 1, 0.8, 0.8), PINK, ['mixamorigHead']);                       /* under the nose */

  /* arms, authored in the T-pose: shoulder (0.40) -> elbow (0.74) -> wrist (1.06), all at y 1.74 */
  [1, -1].forEach(function(s){
    var ARM = B(s, 'Arm'), FA = B(s, 'ForeArm'), HAND = B(s, 'Hand');
    var sh = V3(s * 0.40, 1.74, 0), el = V3(s * 0.74, 1.74, 0.0), wr = V3(s * 1.06, 1.74, 0);
    addPiece(ellipsoid(s * 0.40, 1.745, 0, 0.165, 1.05, 1.0, 0.95), SKIN, ['mixamorigSpine2', ARM]);                      /* deltoid */
    addPiece(limbTube(sh, el, [{ t: 0, r: 0.14 }, { t: 0.4, r: 0.15, rz: 0.145 }, { t: 0.75, r: 0.12 }, { t: 1, r: 0.10 }], 14), SKIN, [ARM, FA]);
    addPiece(ellipsoid(s * 0.54, 1.68, -0.04, 0.08, 1.1, 1.0, 0.8), SKIN, [ARM]);                                           /* tricep */
    addPiece(ellipsoid(el.x, el.y, el.z, 0.10), SKIN, [ARM, FA]);
    addPiece(limbTube(el, wr, [{ t: 0, r: 0.10 }, { t: 0.3, r: 0.125 }, { t: 0.7, r: 0.095 }, { t: 1, r: 0.07 }], 14), SKIN, [FA, HAND]);
    addPiece(ellipsoid(s * 1.13, 1.74, 0.01, 0.085, 1.15, 0.95, 0.95), SKIN_DARK, [HAND]);                                  /* fist */
    addPiece(ellipsoid(s * 1.12, 1.78, 0.05, 0.04, 1.1, 0.9, 1.0), SKIN_DARK, [HAND]);                                     /* thumb */
  });

  /* trousers, belt, fur, boots */
  [1, -1].forEach(function(s){
    var UP = B(s, 'UpLeg'), LEG = B(s, 'Leg'), FOOT = B(s, 'Foot');
    var hp = V3(s * 0.17, 1.08, 0), kn = V3(s * 0.18, 0.62, 0.02), an = V3(s * 0.18, 0.12, 0);
    addPiece(limbTube(hp, kn, [{ t: 0, r: 0.19, rz: 0.18 }, { t: 0.35, r: 0.185, rz: 0.19 }, { t: 0.8, r: 0.15 }, { t: 1, r: 0.14 }], 14), LEATHER, [UP, LEG]);
    addPiece(ellipsoid(kn.x, kn.y, kn.z + 0.02, 0.135, 1, 1.05, 0.95), LEATHER_LIGHT, [UP, LEG]);        /* knee plate */
    addPiece(limbTube(hp, kn, [{ t: 0.5, r: 0.178 }, { t: 0.62, r: 0.168 }], 14, false), LEATHER_DARK, [UP]);      /* thigh strap */
    addPiece(box(s * 0.17, 0.83, 0.17, 0.05, 0.06, 0.02), STEEL, [UP]);
    addPiece(limbTube(kn, an, [{ t: 0, r: 0.13 }, { t: 0.45, r: 0.125 }, { t: 1, r: 0.115 }], 14), LEATHER_DARK, [LEG, FOOT]);
    addPiece(box(s * 0.18, 0.07, 0.07, 0.21, 0.14, 0.34), LEATHER_DARK, [FOOT]);
    addPiece(ellipsoid(s * 0.18, 0.075, 0.22, 0.105, 1, 0.7, 0.9), LEATHER_DARK, [FOOT]);                           /* toe */
    addPiece(box(s * 0.18, 0.055, -0.05, 0.22, 0.11, 0.18), LEATHER, [FOOT]);                                       /* heel strap */
    /* boot cuff: a band and a ring of fur */
    addPiece(limbTube(V3(s * 0.18, 0.42, 0.01), V3(s * 0.18, 0.52, 0.01), [{ t: 0, r: 0.14 }, { t: 1, r: 0.145 }], 14), PINK, [LEG]);
    furRing(0.44, 0.145, 0.145, 34, 0.11, -0.9, PINK, [LEG], R, s * 0.18);
  });
  addPiece(ellipsoid(0, 1.03, -0.01, 0.2, 1.05, 0.55, 0.78), LEATHER, ['mixamorigHips']);                 /* pelvis, closes the crotch */
  /* belt with buckle, fur above and a fringe below */
  addPiece(bodyTube([{ y: 1.12, rx: 0.235, rz: 0.17 }, { y: 1.20, rx: 0.235, rz: 0.165 }], 20), LEATHER_DARK, ['mixamorigHips']);
  addPiece(box(0, 1.16, 0.175, 0.09, 0.07, 0.02), STEEL, ['mixamorigHips']);
  addPiece(bodyTube([{ y: 1.20, rx: 0.245, rz: 0.18 }, { y: 1.31, rx: 0.25, rz: 0.185 }], 20), PINK, ['mixamorigHips', 'mixamorigSpine']);
  furRing(1.26, 0.245, 0.18, 60, 0.11, 0.5, PINK, ['mixamorigHips', 'mixamorigSpine'], R);
  furRing(1.10, 0.235, 0.17, 54, 0.12, -1.1, PINK, ['mixamorigHips'], R);
}

/* The axe: built once in its own frame (grip at the origin, shaft along Y,
   blade toward +X), as a plain Group that is parented to a hand bone. */
function buildAxe(mirror){
  var g = new THREE.Group(), m = mirror ? -1 : 1;
  var metal = new THREE.MeshStandardMaterial({ color: C(STEEL), metalness: 0.85, roughness: 0.38 });
  var wood = new THREE.MeshStandardMaterial({ color: C(WOOD), roughness: 0.85 });
  var pink = new THREE.MeshStandardMaterial({ color: C(PINK), roughness: 0.9 });
  function add(geo, mat, x, y, z){ var mesh = new THREE.Mesh(geo, mat); mesh.position.set(x || 0, y || 0, z || 0); mesh.castShadow = true; g.add(mesh); return mesh; }
  add(new THREE.CylinderGeometry(0.02, 0.024, 0.98, 10), wood, 0, -0.10);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), metal, 0, 0.37);               /* pommel */
  add(new THREE.CylinderGeometry(0.029, 0.029, 0.14, 10), pink, 0, 0.22);              /* wrap, butt end */
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), pink, 0, -0.30);               /* wrap, head end */
  add(new THREE.CylinderGeometry(0.034, 0.034, 0.04, 10), metal, 0, -0.38);            /* collar */
  var pts = [[-0.02, -0.12], [0.03, -0.12], [0.09, -0.19], [0.19, -0.23], [0.29, -0.12], [0.33, 0.02], [0.28, 0.15],
             [0.18, 0.21], [0.08, 0.18], [0.03, 0.12], [-0.02, 0.12], [-0.02, 0.06], [-0.13, 0.025], [-0.02, -0.02]];
  var shape = new THREE.Shape(pts.map(function(p){ return new THREE.Vector2(p[0] * 0.85 * m, p[1] * 0.85); }));
  var blade = new THREE.ExtrudeGeometry(shape, { depth: 0.028, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
  blade.translate(0, 0, -0.014);
  add(blade, metal, 0, -0.50);
  /* a pink filigree band across the blade root, as in the painting */
  add(new THREE.BoxGeometry(0.06, 0.26, 0.036), pink, m * 0.05, -0.50);
  return g;
}
