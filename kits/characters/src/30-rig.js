/* ============================== the shared rig ==============================
   One skeleton topology for every character: Mixamo's names (without the colon,
   as three's FBXLoader writes them) and Mixamo's rest convention: every bone has
   identity rotation, legs point -Y, spine +Y, arms along +/-X (a T-pose), +X is
   the character's LEFT. Only the rest positions differ per character, through a
   proportions table, so a Mixamo clip's local quaternions apply to all of them.
*/
var PROPORTIONS_DEFAULT = { hip: 1.12, spine: 1.26, spine1: 1.38, spine2: 1.50, neck: 1.86, head: 1.98, headTop: 2.22,
  shoulderX: 0.16, shoulderY: 1.80, armX: 0.40, armY: 1.74, elbowX: 0.74, wristX: 1.06, handTipX: 1.20,
  hipX: 0.17, kneeX: 0.18, kneeY: 0.62, kneeZ: 0.02, ankleY: 0.12, footTipZ: 0.24 };
var P = PROPORTIONS_DEFAULT;

function defineBones(p){
  P = Object.assign({}, PROPORTIONS_DEFAULT, p || {});
  defBone('mixamorigHips',   null,             0, P.hip, 0);
  defBone('mixamorigSpine',  'mixamorigHips',  0, P.spine, 0);
  defBone('mixamorigSpine1', 'mixamorigSpine', 0, P.spine1, 0);
  defBone('mixamorigSpine2', 'mixamorigSpine1',0, P.spine2, 0);
  defBone('mixamorigNeck',   'mixamorigSpine2',0, P.neck, 0);
  defBone('mixamorigHead',   'mixamorigNeck',  0, P.head, 0, [0, P.headTop, 0]);
  [1, -1].forEach(function(s){
    var S = s > 0 ? 'Left' : 'Right';
    defBone('mixamorig' + S + 'Shoulder', 'mixamorigSpine2',            s * P.shoulderX, P.shoulderY, 0);
    defBone('mixamorig' + S + 'Arm',      'mixamorig' + S + 'Shoulder', s * P.armX, P.armY, 0);
    defBone('mixamorig' + S + 'ForeArm',  'mixamorig' + S + 'Arm',      s * P.elbowX, P.armY, 0);
    defBone('mixamorig' + S + 'Hand',     'mixamorig' + S + 'ForeArm',  s * P.wristX, P.armY, 0, [s * P.handTipX, P.armY, 0]);
    defBone('mixamorig' + S + 'UpLeg',    'mixamorigHips',              s * P.hipX, P.hip - 0.04, 0);
    defBone('mixamorig' + S + 'Leg',      'mixamorig' + S + 'UpLeg',    s * P.kneeX, P.kneeY, P.kneeZ);
    defBone('mixamorig' + S + 'Foot',     'mixamorig' + S + 'Leg',      s * P.kneeX, P.ankleY, 0, [s * P.kneeX, 0.02, P.footTipZ]);
  });
}
/* short aliases used by the body builders and the poses */
function B(side, part){ return 'mixamorig' + (side > 0 ? 'Left' : 'Right') + part; }
/* arm landmarks for a side, in the T-pose */
function armPts(s){ return { sh: V3(s * P.armX, P.armY, 0), el: V3(s * P.elbowX, P.armY, 0), wr: V3(s * P.wristX, P.armY, 0), fist: V3(s * (P.wristX + 0.07), P.armY, 0.01) }; }
function legPts(s){ return { hp: V3(s * P.hipX, P.hip - 0.04, 0), kn: V3(s * P.kneeX, P.kneeY, P.kneeZ), an: V3(s * P.kneeX, P.ankleY, 0) }; }

/* A rigid prop in a hand. pos and euler are authored with the arm HANGING (the old
   A-pose convention: -Y down the shaft, +Z forward); the hand bone rests in the
   T-pose, so both are rotated by q_hang^-1 (see applyPose in 40-walk.js). */
var PROPS = [];
function attachProp(side, group, pos, euler){ PROPS.push({ side: side, group: group, pos: pos, euler: euler }); }
function mountProps(){
  hangQuats();
  PROPS.forEach(function(pr){ var s = pr.side;
    pr.group.position.copy(pr.pos).applyQuaternion(_qHangInv[s]);
    pr.group.quaternion.setFromEuler(new THREE.Euler(pr.euler[0], pr.euler[1], pr.euler[2])).premultiply(_qHangInv[s]);
    BONES[pr.bone || B(s, 'Hand')].add(pr.group); });
}
/* common materials for props */
function propMat(hex, metal, rough){ return new THREE.MeshStandardMaterial({ color: C(hex), metalness: metal || 0, roughness: rough == null ? 0.8 : rough }); }
function propMesh(group, geo, mat, x, y, z){ var m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; group.add(m); return m; }

/* the character registry: key -> {name, proportions, build(), clips, defaultClip} */
var CHARACTERS = [];
function registerCharacter(c){ CHARACTERS.push(c); }

/* shared parts */
/* a hand in the T-pose frame: palm, four curled fingers with knuckles, a thumb. Reads as a loose fist. */
function hand(s, color, bones, opts){
  opts = opts || {};
  var a = armPts(s), w = a.wr, dark = new THREE.Color(color).offsetHSL(0, 0, -0.06).convertSRGBToLinear();
  addPiece(ellipsoid(w.x + s * 0.05, w.y, 0.01, 0.07, 1.1, 0.75, 1.0), color, bones);                                   /* palm */
  for(var f = 0; f < 4; f++){ var z = -0.035 + f * 0.024, L = 0.05 - Math.abs(f - 1.5) * 0.006;
    var k = V3(w.x + s * 0.11, w.y - 0.005, z);
    addPiece(ellipsoid(k.x, k.y, k.z, 0.016, 1, 1, 0.8), dark, bones);                                                   /* knuckle */
    addPiece(limbTube(k, V3(k.x + s * L, k.y - 0.045, z), [{ t: 0, r: 0.014 }, { t: 1, r: 0.012 }], 6), color, bones);
    addPiece(limbTube(V3(k.x + s * L, k.y - 0.045, z), V3(k.x + s * (L - 0.02), k.y - 0.085, z), [{ t: 0, r: 0.012 }, { t: 1, r: 0.01 }], 6), color, bones);
    if(opts.claws) addPiece(spike(V3(k.x + s * (L - 0.02), k.y - 0.09, z), V3(s * 0.2, -1, 0), 0.03, 0.008, 4), opts.claws, bones);
  }
  addPiece(limbTube(V3(w.x + s * 0.04, w.y + 0.01, 0.05), V3(w.x + s * 0.09, w.y - 0.03, 0.075), [{ t: 0, r: 0.016 }, { t: 1, r: 0.013 }], 6), color, bones);   /* thumb */
}
function fist(s, color, bones, opts){ hand(s, color, bones, opts); }

/* a human face on a head centred at (0, cy, 0): eye whites and irises, brows, nose, ears, mouth */
function faceHuman(cy, skin, opts){
  opts = opts || {}; var H = ['mixamorigHead'], r = opts.r || 0.11, iris = opts.iris || 0x3a5a3a, brow = opts.brow || 0x3a2a20, fz = r * 0.86;
  [1, -1].forEach(function(s){
    addPiece(ellipsoid(s * r * 0.36, cy + 0.01, fz, r * 0.17, 1, 0.75, 0.55), 0xf4f0ea, H);
    addPiece(ellipsoid(s * r * 0.36, cy + 0.01, fz + r * 0.07, r * 0.085, 1, 1, 0.5), iris, H);
    addPiece(ellipsoid(s * r * 0.36, cy + 0.01, fz + r * 0.1, r * 0.04, 1, 1, 0.5), 0x101010, H);
    addPiece(box(s * r * 0.38, cy + r * 0.3, fz - 0.005, r * 0.42, r * 0.07, 0.015, [0.2, 0, s * (opts.angry ? -0.35 : 0.08)]), brow, H);
    addPiece(ellipsoid(s * r * 0.95, cy, 0.0, r * 0.2, 0.5, 1.3, 1.0), skin, H);                                           /* ear */
    addPiece(ellipsoid(s * r * 0.3, cy - r * 0.35, fz - r * 0.1, r * 0.28, 1, 0.9, 0.7), skin, H);                           /* cheek */
  });
  addPiece(ellipsoid(0, cy - r * 0.15, fz + r * 0.05, r * 0.2, 0.7, 1.2, 0.8), skin, H);                                    /* nose */
  addPiece(ellipsoid(0, cy - r * 0.5, fz, r * 0.22, 1.5, 0.3, 0.5), opts.lips || 0x9a5a4a, H);                              /* mouth */
  if(opts.beard) addPiece(ellipsoid(0, cy - r * 0.7, fz - r * 0.2, r * 0.6, 1.1, 0.8, 0.9), opts.beard, H);
}

/* rivets around an ellipse at height y */
function studRing(cx, y, cz, rx, rz, n, r, color, bones, metal){
  for(var i = 0; i < n; i++){ var a = i / n * Math.PI * 2; addPiece(ellipsoid(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz, r, 1, 1, 1), color, bones, { metal: metal !== false }); }
}
/* a thin seam or strap line between two points */
function seam(p0, p1, color, bones, r){ addPiece(limbTube(p0, p1, [{ t: 0, r: r || 0.008 }, { t: 1, r: r || 0.008 }], 5, false), color, bones); }
/* a trim ring at a hem */
function hemTrim(y, rx, rz, h, color, bones, metal){ addPiece(bodyTube([{ y: y, rx: rx, rz: rz }, { y: y + h, rx: rx, rz: rz }], 20, false), color, bones, { metal: metal }); }
/* wear: dust and darkening near the ground, scuffs at random; wraps a base colour or a tint */
function wearTint(base, amount){
  var a = amount == null ? 0.25 : amount, cache = {};
  return function(p, i){
    var c = typeof base === 'function' ? base(p, i) : (cache.c || (cache.c = C(base)));
    var k = 1 - a * Math.max(0, 0.45 - p.y) / 0.45 - (cellNoise(p, 0.07) > 0.9 ? a * 0.5 : 0);
    return k >= 0.999 ? c : c.clone().multiplyScalar(k);
  };
}
