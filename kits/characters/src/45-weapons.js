/* ============================== weapons: registry, grip, clearance ==============================
   Every weapon is built in ONE canonical frame: the grip point at the origin, the
   shaft along Y with the business end at -Y (or +Y when `up` is set, for staffs and
   bows), the edge or front along +Z, the flat along X.

   Every hand has ONE grip frame in its bone's T-pose space: the origin sits in the
   curl of the fingers, the grip axis runs through the fist along Z, the knuckles
   face +Y (outward when the arm hangs) and the palm faces -Y. A carry style maps the
   weapon's shaft onto a hold direction in that frame:
     carry  blades and axes: tip down and a little forward when the arm hangs
     point  tip forward, a little down (a levelled spear)
     ground polearms and lances carried: head down and out beside the leg
     staff  staffs and bows: head up, shaft nearly vertical
   `mountWeapon(boneName, side, key)` builds, orients and parents the weapon; the
   viewer lets any weapon go on any hand. After the clips exist, `solveClearance`
   samples every clip, tests the shaft against capsules measured from the skinned
   body, and tilts a weapon outward until it stops passing through the body.
*/
var WEAPONS = {};
function registerWeapon(key, def){ def.key = key; WEAPONS[key] = def; }

/* hand-local grip frame */
var GRIP = { origin: function(s){ return V3(s * 0.13, -0.04, 0); } };   /* grip axis +Z, knuckles +Y, palm -Y, in the hand bone's T-pose frame */
var HOLD = {
  carry: function(s){ return V3(s * 1.2, 0, 1).normalize(); },
  point: function(s){ return V3(s * 0.4, 0, 1).normalize(); },
  staff: function(s){ return V3(-s * 1, 0, 0.15).normalize(); },
  ground: function(s){ return V3(s * 1, 0.45, 0.1).normalize(); }      /* polearms carried low: head down and out beside the leg */
};
/* orientation: shaft -> hold direction, flat (weapon X) -> palm normal (hand Y), edge follows */
function gripQuaternion(def, s, tiltOut, tiltFwd){
  var d = HOLD[def.style || 'carry'](s).clone();
  if(tiltOut) d.applyAxisAngle(V3(0, 0, 1), -s * tiltOut * (def.style === 'staff' ? -1 : 1));        /* about the grip axis: outward = toward +Y */
  if(tiltFwd) d.applyAxisAngle(V3(0, 1, 0), s * tiltFwd);                                           /* about the knuckle axis: forward */
  d.normalize();
  var yw = d.clone().multiplyScalar(def.up ? 1 : -1);                                                /* weapon +Y in hand space */
  var xw = V3(0, 1, 0).sub(yw.clone().multiplyScalar(yw.y)).normalize();                             /* flat faces the knuckles */
  if(xw.lengthSq() < 1e-6) xw = V3(1, 0, 0);
  var zw = xw.clone().cross(yw).normalize(); xw = yw.clone().cross(zw).normalize();
  var m = new THREE.Matrix4().makeBasis(xw, yw, zw);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}
/* a socket bone per hand, placed at the grip origin: the weapon hangs from it, and
   the clearance solver writes the socket's rotation into every clip as a track */
function addWeaponSockets(){
  BONE_DEFS.filter(function(d){ return /Hand$/.test(d.name); }).forEach(function(d){
    var s = /Left/.test(d.name) ? 1 : -1, o = GRIP.origin(s);
    defBone(d.name + 'Socket', d.name, d.pos.x + o.x, d.pos.y + o.y, d.pos.z + o.z, [d.pos.x + o.x, d.pos.y + o.y, d.pos.z + o.z + 0.05]); });
}
var MOUNTED = [];   /* {bone, socket, side, key, group, def, maxTilt} */
function mountWeapon(boneName, side, key){
  var old = MOUNTED.find(function(m){ return m.bone === boneName; });
  if(old){ old.group.parent.remove(old.group); MOUNTED.splice(MOUNTED.indexOf(old), 1); }
  if(!key || key === 'none' || !WEAPONS[key]) return null;
  var def = WEAPONS[key], g = def.build(side), socket = BONES[boneName + 'Socket'];
  g.quaternion.copy(gripQuaternion(def, side, 0, 0));
  socket.add(g);
  var m = { bone: boneName, socket: boneName + 'Socket', side: side, key: key, group: g, def: def, maxTilt: 0 };
  MOUNTED.push(m); return m;
}

/* ---- clearance ---- */
/* capsules from the skin: for each bone, the radius of the skin around its segment in 4 bins along it.
   Legs are capped so a robe skinned to them does not count as body. */
var CAPSULES = [];
function measureCapsules(geo, bones){
  CAPSULES = [];
  var P = geo.attributes.position, SI = geo.attributes.skinIndex, SW = geo.attributes.skinWeight, segs = bones.map(function(b){ return boneSeg(b.name); });
  var bins = bones.map(function(){ return [[], [], [], []]; }), p = new THREE.Vector3(), a = new THREE.Vector3(), ab = new THREE.Vector3();
  for(var i = 0; i < P.count; i += 3){
    var w = [SW.getX(i), SW.getY(i), SW.getZ(i), SW.getW(i)], idx = [SI.getX(i), SI.getY(i), SI.getZ(i), SI.getW(i)], best = 0;
    for(var k = 1; k < 4; k++) if(w[k] > w[best]) best = k;
    var b = idx[best], sg = segs[b]; p.fromBufferAttribute(P, i);
    ab.subVectors(sg[1], sg[0]); var L2 = ab.lengthSq(); var t = L2 > 0 ? clamp(p.clone().sub(sg[0]).dot(ab) / L2, 0, 0.999) : 0;
    a.copy(sg[0]).addScaledVector(ab, t); var d = a.distanceTo(p), bin = Math.floor(t * 4);
    bins[b][bin].push(d);
  }
  bones.forEach(function(b, i){ var sg = segs[i], n = b.name; if(/Hand$|Foot$|Socket$/.test(n)) return;
    var cap = /UpLeg$|Leg$/.test(n) ? 0.3 : (CUR_DEF && CUR_DEF.capsuleCap) || 0.5;
    for(var k = 0; k < 4; k++){ var ds = bins[i][k]; if(ds.length < 8) continue; ds.sort(function(x, y){ return x - y; }); var r = ds[Math.floor(ds.length * 0.9)];   /* 90th percentile: spikes, fur and streamers do not count */
      if(r > 0.02) CAPSULES.push({ bone: n, t0: k / 4, t1: (k + 1) / 4, r: Math.min(r, cap) * 0.9, a: sg[0].clone(), b: sg[1].clone() }); } });
}
/* the capsules in world space at the current pose (once per sampled frame; only the weapon moves between candidates) */
var _wp, _ca, _cb;
function worldCapsules(excludeRe){
  if(!_wp){ _wp = new THREE.Vector3(); _ca = new THREE.Vector3(); _cb = new THREE.Vector3(); }
  var out = [];
  CAPSULES.forEach(function(c){ if(excludeRe && excludeRe.test(c.bone)) return;
    var bn = BONES[c.bone]; if(!c.child){ c.child = bn.children.find(function(o){ return o.isBone && c.b.distanceTo(BONE_DEFS.find(function(d){ return d.name === o.name; }).pos) < 1e-6; }) || null; }
    bn.getWorldPosition(_ca);
    if(c.child) c.child.getWorldPosition(_cb); else _cb.copy(c.b).sub(c.a).applyQuaternion(bn.getWorldQuaternion(new THREE.Quaternion())).add(_ca);
    out.push({ a: _ca.clone().lerp(_cb, c.t0), b: _ca.clone().lerp(_cb, c.t1), r: c.r }); });
  return out;
}
/* sample points of a weapon in its own frame: along the shaft, plus blade points */
function weaponPoints(def){
  var reach = def.reach || [-0.9, 0.3], pts = [], n = 10;
  for(var i = 0; i <= n; i++){ var y = reach[0] + (reach[1] - reach[0]) * i / n; if(Math.abs(y) < 0.1) continue; pts.push(V3(0, y, 0)); }
  if(def.blade) def.blade.forEach(function(q){ pts.push(V3(q[0], q[1], q[2])); });
  return pts;
}
/* summed penetration of one mounted weapon against precomputed world capsules */
function weaponPenetration(m, caps, pts){
  var pen = 0;
  for(var i = 0; i < pts.length; i++){ _wp.copy(pts[i]); m.group.localToWorld(_wp);
    for(var k = 0; k < caps.length; k++){ var d = distToSeg(_wp, caps[k].a, caps[k].b) - caps[k].r; if(d < 0) pen -= d; } }
  return pen;
}
/* socket rotation that turns the neutral hold into the tilted one */
function socketQuat(m, out, fwd){ return gripQuaternion(m.def, m.side, out, fwd).multiply(gripQuaternion(m.def, m.side, 0, 0).invert()); }
/* For every clip and every mounted weapon: pick a tilt per sampled frame (smallest that clears, with
   hysteresis so it does not flicker), write it as the socket's quaternion track in the clip. Returns
   a report per weapon: the largest tilt used and the worst remaining penetration. */
var _TILTS = null;
function solveClearance(mixer, actions, clipKeys, frames){
  frames = frames || 12;
  if(!_TILTS){ _TILTS = []; [0, 0.06, 0.12].forEach(function(off){ for(var o = -30; o <= 90; o += 15) for(var fw = -75; fw <= 75; fw += 15) _TILTS.push([o, fw, off]); }); }
  if(!_wp){ _wp = new THREE.Vector3(); _ca = new THREE.Vector3(); _cb = new THREE.Vector3(); }
  var report = [];
  MOUNTED.forEach(function(m){
    var socket = BONES[m.socket], rec = { bone: m.bone, key: m.key, maxTilt: 0, maxOffset: 0, penetration: 0, clips: {} }, rest = socket.userData.rest;
    var quats = _TILTS.map(function(t){ return socketQuat(m, t[0] * Math.PI / 180, t[1] * Math.PI / 180); }), pts = weaponPoints(m.def), armRe = new RegExp((m.bone.replace(/Hand$/, '')) + '(Arm|ForeArm|Hand|Shoulder)$');
    clipKeys.forEach(function(k){ var a = actions[k]; if(!a) return;
      var clip = a.getClip(), n = frames, choice = [], prev = null;
      for(var key in actions) actions[key].stop();
      a.reset().setEffectiveWeight(1).play();
      for(var pass = 0; pass < 2; pass++) for(var f = 0; f < n; f++){
        a.time = f / n * clip.duration; mixer.update(0); BONES.mixamorigHips.updateWorldMatrix(true, true);
        var caps = worldCapsules(armRe), best = null;
        for(var ci = 0; ci < _TILTS.length; ci++){
          socket.quaternion.copy(quats[ci]); socket.position.set(rest.x, rest.y + _TILTS[ci][2], rest.z); socket.updateWorldMatrix(false, true);
          var pen = weaponPenetration(m, caps, pts), mag = Math.abs(_TILTS[ci][0]) + Math.abs(_TILTS[ci][1]);
          var cost = pen * 8 + mag * 0.0012 + _TILTS[ci][2] * 0.03 + (prev !== null ? (Math.abs(_TILTS[ci][0] - _TILTS[prev][0]) + Math.abs(_TILTS[ci][1] - _TILTS[prev][1])) * 0.002 : 0);
          if(!best || cost < best.cost) best = { cost: cost, ci: ci, pen: pen };
        }
        choice[f] = best; prev = best.ci;
      }
      var times = [], values = [], pvals = [], worst = 0;
      for(f = 0; f <= n; f++){ var c = choice[f % n]; times.push(f / n * clip.duration); var q = quats[c.ci]; values.push(q.x, q.y, q.z, q.w); pvals.push(rest.x, rest.y + _TILTS[c.ci][2], rest.z);
        if(c.pen > worst) worst = c.pen; var mg = Math.abs(_TILTS[c.ci][0]) + Math.abs(_TILTS[c.ci][1]); if(mg > rec.maxTilt) rec.maxTilt = mg; if(_TILTS[c.ci][2] > rec.maxOffset) rec.maxOffset = _TILTS[c.ci][2]; }
      clip.tracks = clip.tracks.filter(function(t){ return t.name !== m.socket + '.quaternion' && t.name !== m.socket + '.position'; });
      clip.tracks.push(new THREE.QuaternionKeyframeTrack(m.socket + '.quaternion', times, values));
      clip.tracks.push(new THREE.VectorKeyframeTrack(m.socket + '.position', times, pvals));
      clip.resetDuration(); 
      rec.clips[k] = worst; if(worst > rec.penetration) rec.penetration = worst;
      a.stop();
    });
    socket.quaternion.identity(); socket.position.copy(rest);
    report.push(rec);
  });
  for(var key2 in actions) actions[key2].stop();
  return report;
}

/* ---- the registry: builders live in the character fragments ---- */
registerWeapon('axe',     { name: 'Bearded axe',   style: 'carry', reach: [-0.72, 0.37], blade: [[0.25, -0.5, 0], [0.15, -0.68, 0]], build: function(s){ return buildAxe(s < 0); } });
registerWeapon('sword',   { name: 'Longsword',     style: 'carry', reach: [-1.15, 0.18], build: function(){ return buildSword(); } });
registerWeapon('dagger',  { name: 'Dagger',        style: 'carry', reach: [-0.48, 0.12], build: function(){ return buildDagger(false); } });
registerWeapon('icedagger', { name: 'Ice dagger',  style: 'carry', reach: [-0.48, 0.12], build: function(){ return buildDagger(true); } });
registerWeapon('polearm', { name: 'Forked polearm', style: 'ground', reach: [-2.0, 0.6], build: function(){ return buildPolearm(); } });
registerWeapon('lance',   { name: 'Lance-rayon',   style: 'ground', reach: [-1.55, 0.35], build: function(){ return buildLance(); } });
registerWeapon('staffcrook', { name: 'Crook staff', style: 'staff', up: true, reach: [-0.9, 1.75], build: function(){ return buildStaff(PG_RED, pilgrimStaffHead); } });
registerWeapon('staffcrescent', { name: 'Crescent staff', style: 'staff', up: true, reach: [-0.9, 1.85], build: function(){ return buildStaff(0xa88a50, crescentStaffHead); } });
registerWeapon('staffspiral', { name: 'Spiral staff', style: 'staff', up: true, reach: [-0.9, 1.75], build: function(){ return buildStaff(0xc8302a, spiralStaffHead); } });
registerWeapon('rod',     { name: 'Silver rod',    style: 'staff', up: true, reach: [-0.9, 1.5], build: function(){ var st = buildStaff(0xd8dce4, null); st.children[0].scale.set(1.8, 1, 1.8); return st; } });
registerWeapon('bow',     { name: 'Recurve bow',   style: 'staff', up: true, reach: [-0.7, 0.7], build: function(){ return buildBow(); } });
registerWeapon('mace',    { name: 'Flanged mace',  style: 'carry', reach: [-0.62, 0.12], build: function(){ return buildMace(); } });
registerWeapon('spear',   { name: 'Spear',         style: 'ground', reach: [-1.7, 0.5], build: function(){ return buildSpear(); } });
registerWeapon('torch',   { name: 'Torch',         style: 'staff', up: true, reach: [-0.15, 0.95], build: function(){ return buildTorch(); } });

function buildMace(){
  var g = new THREE.Group(), steel = propMat(0xb8bcc4, 0.9, 0.35), dark = propMat(0x3a3030, 0.3, 0.6);
  propMesh(g, new THREE.CylinderGeometry(0.018, 0.02, 0.6, 8), dark, 0, -0.2);
  propMesh(g, new THREE.SphereGeometry(0.03, 8, 6), steel, 0, 0.12);
  propMesh(g, new THREE.SphereGeometry(0.05, 10, 8), steel, 0, -0.5);
  for(var i = 0; i < 6; i++){ var a = i / 6 * Math.PI * 2, f = new THREE.BoxGeometry(0.02, 0.16, 0.07); f.translate(0, 0, 0.06); f.rotateY(a); f.translate(0, -0.5, 0); propMesh(g, f, steel); }
  return g;
}
function buildSpear(){
  var g = new THREE.Group(), wood = propMat(0x7a5a38, 0.1, 0.7), steel = propMat(0xb8bcc4, 0.9, 0.3);
  propMesh(g, new THREE.CylinderGeometry(0.014, 0.016, 2.1, 8), wood, 0, -0.55);
  var head = new THREE.CylinderGeometry(0, 0.035, 0.3, 4); head.rotateX(Math.PI); head.translate(0, -1.75, 0); propMesh(g, head, steel);
  propMesh(g, new THREE.CylinderGeometry(0.02, 0.016, 0.06, 8), steel, 0, -1.58);
  for(var i = 0; i < 3; i++) propMesh(g, new THREE.TorusGeometry(0.017, 0.004, 4, 8), propMat(0xc8302a), 0, -0.1 + i * 0.05, 0);
  return g;
}
function buildTorch(){
  var g = new THREE.Group(), wood = propMat(0x5a3a22, 0.1, 0.8);
  propMesh(g, new THREE.CylinderGeometry(0.02, 0.026, 0.9, 8), wood, 0, 0.3);                        /* grip near the foot of the handle */
  for(var w = 0; w < 4; w++) propMesh(g, new THREE.TorusGeometry(0.022, 0.005, 5, 10), propMat(0x2a2020), 0, -0.08 + w * 0.05, 0);
  propMesh(g, new THREE.CylinderGeometry(0.045, 0.032, 0.14, 8), propMat(0x2a2020), 0, 0.78);
  var flame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 7), new THREE.MeshBasicMaterial({ color: 0xffa020 })); flame.position.y = 0.94; g.add(flame);
  var inner = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.12, 7), new THREE.MeshBasicMaterial({ color: 0xffe080 })); inner.position.y = 0.92; g.add(inner);
  var light = new THREE.PointLight(0xffa040, 0.8, 3); light.position.y = 0.92; g.add(light);
  return g;
}
