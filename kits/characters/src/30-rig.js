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
function fist(s, color, bones){
  var a = armPts(s);
  addPiece(ellipsoid(a.fist.x, a.fist.y, a.fist.z, 0.085, 1.15, 0.95, 0.95), color, bones);
  addPiece(ellipsoid(a.fist.x - s * 0.01, a.fist.y + 0.04, a.fist.z + 0.04, 0.04, 1.1, 0.9, 1.0), color, bones);
}
