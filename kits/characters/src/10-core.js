/* ============================== core: scene, helpers, skinning ==============
   Everything a procedural character needs that is not the character itself:
   a seeded PRNG, geometry helpers that build in world (rest-pose) space, the
   envelope skinning that assigns bone weights from distance to bone segments,
   and the merge that folds every piece into one SkinnedMesh / one draw call.
*/
'use strict';

function rng(seed){ var s = seed >>> 0; return function(){ s += 0x6D2B79F5; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
var V3 = function(x, y, z){ return new THREE.Vector3(x, y, z); };
function lerp(a, b, t){ return a + (b - a) * t; }
function clamp(x, a, b){ return x < a ? a : x > b ? b : x; }
function smooth(t){ t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

/* ---- bone definitions: world rest positions, segment tips for leaf bones ---- */
var BONE_DEFS = [];
var BONES = {};
function defBone(name, parent, x, y, z, tip){ BONE_DEFS.push({ name: name, parent: parent, pos: V3(x, y, z), tip: tip ? V3(tip[0], tip[1], tip[2]) : null }); }
function boneSeg(name){
  var d = BONE_DEFS.find(function(b){ return b.name === name; });
  var tip = d.tip;
  if(!tip){ var c = BONE_DEFS.find(function(b){ return b.parent === name; }); tip = c ? c.pos : d.pos.clone().add(V3(0, -0.1, 0)); }
  return [d.pos, tip];
}
function buildSkeleton(){
  var bones = [];
  BONE_DEFS.forEach(function(d){
    var b = new THREE.Bone(); b.name = d.name;
    var p = d.parent ? BONE_DEFS.find(function(q){ return q.name === d.parent; }).pos : V3(0, 0, 0);
    b.position.copy(d.pos).sub(p);
    BONES[d.name] = b; bones.push(b);
    if(d.parent) BONES[d.parent].add(b);
  });
  return bones;
}

/* ---- pieces: geometry in rest-pose world space + colour + candidate bones ---- */
var PIECES = [];
/* colours are authored as sRGB hex; vertex colours and material colours are linear in r128, so convert once here */
function C(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
function addPiece(geo, color, bones, opts){ PIECES.push({ geo: geo, color: color.isColor ? color : C(color), bones: bones, opts: opts || {} }); return geo; }

var _segA, _segB, _segP;   /* created on first use: fragments run before three.js has loaded */
function distToSeg(p, a, b){
  if(!_segA){ _segA = new THREE.Vector3(); _segB = new THREE.Vector3(); _segP = new THREE.Vector3(); }
  _segA.subVectors(b, a); _segB.subVectors(p, a);
  var L2 = _segA.lengthSq(); var t = L2 > 0 ? clamp(_segB.dot(_segA) / L2, 0, 1) : 0;
  _segP.copy(a).addScaledVector(_segA, t); return _segP.distanceTo(p);
}
/* Envelope skinning: weight each candidate bone by 1/d^4 from its segment,
   keep the top four, drop anything under 2%, normalise. Limbs stay rigid
   away from a joint and blend over the last few centimetres into it. */
function weightsFor(p, bones, segs, power){
  var ws = bones.map(function(n, i){ var d = distToSeg(p, segs[i][0], segs[i][1]); return { i: i, w: 1 / Math.pow(d + 0.004, power || 4) }; });
  ws.sort(function(a, b){ return b.w - a.w; }); ws = ws.slice(0, 4);
  var sum = ws.reduce(function(s, x){ return s + x.w; }, 0);
  ws.forEach(function(x){ x.w /= sum; }); ws = ws.filter(function(x){ return x.w > 0.02; });
  sum = ws.reduce(function(s, x){ return s + x.w; }, 0); ws.forEach(function(x){ x.w /= sum; });
  return ws;
}

/* Fold every piece into one skinned BufferGeometry (non-indexed, vertex colours).
   filterMetal: true merges only the pieces flagged opts.metal, false only the rest. */
function mergePieces(boneList, filterMetal){
  var index = {}; boneList.forEach(function(b, i){ index[b.name] = i; });
  var pos = [], nor = [], col = [], si = [], sw = [], tris = 0;
  PIECES.forEach(function(pc){
    if(filterMetal !== undefined && !!pc.opts.metal !== filterMetal) return;
    var g = pc.geo.index ? pc.geo.toNonIndexed() : pc.geo;
    var P = g.attributes.position, N = g.attributes.normal, n = P.count;
    var segs = pc.bones.map(boneSeg), ids = pc.bones.map(function(b){ return index[b]; });
    var p = new THREE.Vector3();
    for(var i = 0; i < n; i++){
      p.fromBufferAttribute(P, i);
      pos.push(p.x, p.y, p.z); nor.push(N.getX(i), N.getY(i), N.getZ(i));
      var c = pc.opts.tint ? pc.opts.tint(p, i) : pc.color; col.push(c.r, c.g, c.b);
      var ws = pc.bones.length === 1 ? [{ i: 0, w: 1 }] : weightsFor(p, pc.bones, segs, pc.opts.power);
      for(var k = 0; k < 4; k++){ si.push(ws[k] ? ids[ws[k].i] : 0); sw.push(ws[k] ? ws[k].w : 0); }
    }
    tris += n / 3;
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  geo.userData.tris = tris;
  return geo;
}

/* deterministic hash noise in [0,1): the same value for the same cell */
function hash3(x, y, z){ var h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return h - Math.floor(h); }
function cellNoise(p, size){ return hash3(Math.floor(p.x / size), Math.floor(p.y / size), Math.floor(p.z / size)); }

/* ---- geometry helpers (world space) ---- */
/* A tube through a list of rings. Each ring: {c, u, v, rx, rz}. Winding is
   checked against the first ring's outward direction and flipped if inward,
   so callers need not think about handedness. */
function ringTube(rings, sides, caps){
  var pos = [], idx = [], i, j;
  for(i = 0; i < rings.length; i++){ var r = rings[i]; for(j = 0; j < sides; j++){ var a = j / sides * Math.PI * 2;
    var p = r.c.clone().addScaledVector(r.u, Math.cos(a) * r.rx).addScaledVector(r.v, Math.sin(a) * r.rz); pos.push(p.x, p.y, p.z); } }
  for(i = 0; i < rings.length - 1; i++) for(j = 0; j < sides; j++){ var a0 = i * sides + j, a1 = i * sides + (j + 1) % sides, b0 = a0 + sides, b1 = a1 + sides; idx.push(a0, b0, a1, a1, b0, b1); }
  var nv = rings.length * sides;
  if(caps){
    var r0 = rings[0], r1 = rings[rings.length - 1];
    pos.push(r0.c.x, r0.c.y, r0.c.z); pos.push(r1.c.x, r1.c.y, r1.c.z);
    for(j = 0; j < sides; j++){ idx.push(nv, j, (j + 1) % sides); var b = (rings.length - 1) * sides; idx.push(nv + 1, b + (j + 1) % sides, b + j); }
  }
  /* orientation check on the first quad */
  var A = V3(pos[idx[0]*3], pos[idx[0]*3+1], pos[idx[0]*3+2]), B = V3(pos[idx[1]*3], pos[idx[1]*3+1], pos[idx[1]*3+2]), C = V3(pos[idx[2]*3], pos[idx[2]*3+1], pos[idx[2]*3+2]);
  var nrm = B.clone().sub(A).cross(C.clone().sub(A)); var out = A.clone().sub(rings[0].c);
  if(nrm.dot(out) < 0) for(i = 0; i < idx.length; i += 3){ var t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* frame for a tube axis: u, v perpendicular to w */
function axisFrame(w, ref){
  w = w.clone().normalize(); ref = ref || (Math.abs(w.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0));
  var u = ref.clone().cross(w).normalize(); var v = u.clone().cross(w).normalize(); return { u: u, v: v, w: w };
}
/* Limb tube from p0 to p1. profile: [{t, r, rz?, cx?, cz?}] along the axis; cx/cz offset the ring sideways (u, v) */
function limbTube(p0, p1, profile, sides, caps, ref){
  var f = axisFrame(p1.clone().sub(p0), ref), rings = [];
  profile.forEach(function(s){ var c = p0.clone().lerp(p1, s.t).addScaledVector(f.u, s.cx || 0).addScaledVector(f.v, s.cz || 0);
    rings.push({ c: c, u: f.u, v: f.v, rx: s.r, rz: s.rz != null ? s.rz : s.r }); });
  return ringTube(rings, sides || 14, caps !== false);
}
/* Upright elliptical lathe: profile [{y, rx, rz, cz?}] */
function bodyTube(profile, sides, caps){
  var rings = profile.map(function(s){ return { c: V3(0, s.y, s.cz || 0), u: V3(1, 0, 0), v: V3(0, 0, 1), rx: s.rx, rz: s.rz }; });
  return ringTube(rings, sides || 18, caps !== false);
}
/* Tapered tube along a curve (mustache, horns, tails) */
function curveTube(curve, segs, sides, radiusFn){
  var pts = curve.getPoints(segs), fr = curve.computeFrenetFrames(segs, false), rings = [];
  for(var i = 0; i <= segs; i++){ var r = radiusFn(i / segs); rings.push({ c: pts[i], u: fr.normals[i], v: fr.binormals[i], rx: r, rz: r }); }
  return ringTube(rings, sides || 8, true);
}
function ellipsoid(cx, cy, cz, r, sx, sy, sz, rot){
  var g = new THREE.SphereGeometry(r, 16, 12); g.scale(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz);
  if(rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
  g.translate(cx, cy, cz); return g;
}
function box(cx, cy, cz, w, h, d, rot){
  var g = new THREE.BoxGeometry(w, h, d);
  if(rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
  g.translate(cx, cy, cz); return g;
}
/* one fur tuft: a 4-sided cone from base along dir */
function tuft(base, dir, len, rBase){
  var g = new THREE.CylinderGeometry(0, rBase, len, 4, 1, false);
  var q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize());
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); g.translate(base.x + dir.x * len / 2, base.y + dir.y * len / 2, base.z + dir.z * len / 2); return g;
}
/* a spike: a cone from base along dir, with a few sides so it reads as bone or steel */
function spike(base, dir, len, rBase, sides){
  var g = new THREE.CylinderGeometry(0, rBase, len, sides || 6, 1, false);
  var q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize());
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); g.translate(base.x + dir.x * len / 2, base.y + dir.y * len / 2, base.z + dir.z * len / 2); return g;
}
/* a ring of tufts around an ellipse at height y, pointing out and tilted up (+) or down (-) */
function furRing(y, rx, rz, n, len, tilt, color, bones, R, cx){
  cx = cx || 0;
  var base = new THREE.Color(color);
  for(var i = 0; i < n; i++){
    var a = (i + R() * 0.6) / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    var p = V3(cx + ca * rx, y + (R() - 0.5) * 0.04, sa * rz);
    var out = V3(ca * rz, 0, sa * rx).normalize();
    var dir = out.clone().multiplyScalar(1).add(V3((R() - 0.5) * 0.5, tilt + (R() - 0.5) * 0.5, (R() - 0.5) * 0.5)).normalize();
    var L = len * (0.7 + R() * 0.6), c = base.clone().offsetHSL(0, 0, (R() - 0.5) * 0.18).convertSRGBToLinear();
    addPiece(tuft(p, dir, L, 0.016 + R() * 0.012), c, bones);
  }
}
