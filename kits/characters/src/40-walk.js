/* ============================== pose, walk cycle, scene =====================
   Two sources of animation on the same skeleton:
   1. Procedural poses (walkPose, idlePose): functions of phase, written in a
      "hanging arms" convention and converted to the T-pose bone frames by
      applyPose. Sampled into AnimationClips by bakeClip.
   2. A Mixamo clip (20-mixamo-walk.js): local quaternions copied straight onto
      the bones, because both rigs share Mixamo's rest convention.
*/
var WALK = { freq: 1.05, thigh: 0.36, knee: 0.8, arm: 0.3, bob: 0.025, sway: 0.03, twist: 0.12 };
var POSE = {};   /* name -> {rx,ry,rz, px,py,pz} rest-relative, arms in the hanging convention */

function setRot(name, x, y, z){ POSE[name] = POSE[name] || {}; POSE[name].rx = x; POSE[name].ry = y; POSE[name].rz = z; }
function setPos(name, x, y, z){ POSE[name] = POSE[name] || {}; POSE[name].px = x; POSE[name].py = y; POSE[name].pz = z; }

/* the standing pose every other pose is added to */
function restPose(){
  BONE_DEFS.forEach(function(d){ setRot(d.name, 0, 0, 0); setPos(d.name, 0, 0, 0); });
  [1, -1].forEach(function(s){
    setRot(B(s, 'Arm'), 0.05, 0, s * 0.16);
    setRot(B(s, 'ForeArm'), -0.18, 0, s * -0.05);
    setRot(B(s, 'Hand'), 0, s * -0.35, 0);
    setRot(B(s, 'UpLeg'), 0, 0, s * 0.06);
    setRot(B(s, 'Leg'), 0.06, 0, 0);
    setRot(B(s, 'Foot'), -0.05, s * 0.12, s * -0.04);
  });
  setRot('mixamorigSpine2', -0.04, 0, 0); setRot('mixamorigHead', 0.06, 0, 0);
}

/* u in [0,1): one full cycle, left heel strike at u=0.25 */
function walkPose(u){
  restPose();
  var ph = u * Math.PI * 2, W = WALK;
  setPos('mixamorigHips', W.sway * Math.sin(ph), W.bob * Math.cos(2 * ph) - 0.015, 0);
  setRot('mixamorigHips', 0.04, W.twist * Math.sin(ph), 0.05 * Math.sin(ph));
  setRot('mixamorigSpine', 0.02, -0.05 * Math.sin(ph), -0.03 * Math.sin(ph));
  setRot('mixamorigSpine2', -0.06, -W.twist * 0.9 * Math.sin(ph), -0.03 * Math.sin(ph));
  setRot('mixamorigNeck', 0.02, 0.05 * Math.sin(ph), 0);
  setRot('mixamorigHead', 0.08 - 0.02 * Math.cos(2 * ph), 0.03 * Math.sin(ph), 0.02 * Math.sin(ph));
  [1, -1].forEach(function(s){ var lp = ph + (s > 0 ? 0 : Math.PI);
    var thigh = -W.thigh * Math.sin(lp);
    var knee = 0.08 + W.knee * Math.max(0, Math.cos(lp + 0.6)) + 0.15 * Math.max(0, Math.sin(lp - 2.2));
    setRot(B(s, 'UpLeg'), thigh, 0, s * 0.07);
    setRot(B(s, 'Leg'), knee, 0, 0);
    /* keep the sole roughly level in stance, toe off behind */
    var toe = 0.5 * Math.max(0, Math.sin(lp + 2.0)) * Math.max(0, -Math.sin(lp));
    setRot(B(s, 'Foot'), -(thigh + knee) * 0.55 + toe, s * 0.12, s * -0.04);
    var arm = W.arm * Math.sin(lp);
    setRot(B(s, 'Arm'), 0.05 + arm, 0, s * (0.16 + 0.03 * Math.cos(lp)));
    setRot(B(s, 'ForeArm'), -0.22 - 0.18 * Math.max(0, arm), 0, s * -0.05);
    setRot(B(s, 'Hand'), 0, s * -0.35, 0);
  });
}
function idlePose(u){
  restPose();
  var ph = u * Math.PI * 2;
  setPos('mixamorigHips', 0, 0.006 * Math.sin(ph), 0);
  setRot('mixamorigSpine2', -0.04 + 0.025 * Math.sin(ph), 0, 0);
  setRot('mixamorigHead', 0.06 + 0.015 * Math.sin(ph + 1), 0, 0);
  [1, -1].forEach(function(s){ setRot(B(s, 'Arm'), 0.05, 0, s * (0.16 + 0.025 * Math.sin(ph))); });
}
/* attack: wind up over the right shoulder, a fast diagonal strike, follow-through,
   recover. Keyframed on a handful of parameters and eased between keys, so it
   reads with an axe, a sword, a polearm, a fist or an open hand. */
var ATTACK_KEYS = [
  { u: 0.00, aR: 0.05, aRz: -0.16, fR: -0.18, hR: 0,    aL: 0.05, hipRy: 0,     spRy: 0,     spRx: -0.04, hipY: 0,     tL: 0,     tR: 0,    kL: 0.06, kR: 0.06, hdRy: 0 },
  { u: 0.30, aR: 2.3,  aRz: -0.9,  fR: -0.9,  hR: 0.3,  aL: -0.5, hipRy: 0.35,  spRy: 0.45,  spRx: -0.2,  hipY: -0.05, tL: -0.4,  tR: 0.25, kL: 0.5,  kR: 0.3,  hdRy: -0.3 },
  { u: 0.48, aR: -0.9, aRz: -0.35, fR: -0.2,  hR: -0.2, aL: 0.4,  hipRy: -0.35, spRy: -0.6,  spRx: 0.4,   hipY: -0.12, tL: -0.55, tR: 0.35, kL: 0.7,  kR: 0.25, hdRy: 0.2 },
  { u: 0.66, aR: -1.1, aRz: -0.5,  fR: -0.3,  hR: -0.2, aL: 0.5,  hipRy: -0.4,  spRy: -0.5,  spRx: 0.3,   hipY: -0.1,  tL: -0.5,  tR: 0.3,  kL: 0.65, kR: 0.3,  hdRy: 0.1 },
  { u: 1.00, aR: 0.05, aRz: -0.16, fR: -0.18, hR: 0,    aL: 0.05, hipRy: 0,     spRy: 0,     spRx: -0.04, hipY: 0,     tL: 0,     tR: 0,    kL: 0.06, kR: 0.06, hdRy: 0 }
];
function attackPose(u){
  restPose();
  var k = 0; while(k < ATTACK_KEYS.length - 2 && ATTACK_KEYS[k + 1].u <= u) k++;
  var a = ATTACK_KEYS[k], b = ATTACK_KEYS[k + 1], t = smooth((u - a.u) / (b.u - a.u)), v = {};
  for(var key in a) v[key] = lerp(a[key], b[key], t);
  setPos('mixamorigHips', 0, v.hipY, 0);
  setRot('mixamorigHips', 0.04, v.hipRy, 0);
  setRot('mixamorigSpine', v.spRx * 0.3, v.spRy * 0.4, 0);
  setRot('mixamorigSpine2', v.spRx * 0.7 - 0.04, v.spRy * 0.6, 0);
  setRot('mixamorigHead', 0.06 - v.spRx * 0.5, v.hdRy, 0);
  setRot(B(-1, 'Arm'), v.aR, 0, v.aRz);
  setRot(B(-1, 'ForeArm'), v.fR, 0, 0.05);
  setRot(B(-1, 'Hand'), v.hR, 0.35, 0);
  setRot(B(1, 'Arm'), v.aL, 0, 0.2);
  setRot(B(1, 'ForeArm'), -0.3 - Math.max(0, v.aL) * 0.4, 0, -0.05);
  setRot(B(1, 'UpLeg'), v.tL, 0, 0.07); setRot(B(1, 'Leg'), v.kL, 0, 0); setRot(B(1, 'Foot'), -(v.tL + v.kL) * 0.6, 0.12, -0.04);
  setRot(B(-1, 'UpLeg'), v.tR, 0, -0.07); setRot(B(-1, 'Leg'), v.kR, 0, 0); setRot(B(-1, 'Foot'), -(v.tR + v.kR) * 0.6, -0.12, 0.04);
}
/* The procedural poses describe the arms as if they hung down (the old A-pose
   convention); the bones rest in a T-pose. q_hang turns a T-pose upper arm into
   a hanging one: the upper arm gets R_old * q_hang, and each child frame is the
   old frame conjugated by q_hang. Everything else maps 1:1. */
var _qHang = {}, _qHangInv = {}, _qTmp, _eTmp;
function hangQuats(){
  if(_qTmp) return;
  _qTmp = new THREE.Quaternion(); _eTmp = new THREE.Euler();
  [1, -1].forEach(function(s){ _qHang[s] = new THREE.Quaternion().setFromAxisAngle(V3(0, 0, 1), -s * Math.PI / 2); _qHangInv[s] = _qHang[s].clone().invert(); });
}
function applyPose(){
  hangQuats();
  for(var n in POSE){ var p = POSE[n], b = BONES[n]; if(!b) continue;
    b.quaternion.setFromEuler(_eTmp.set(p.rx || 0, p.ry || 0, p.rz || 0));
    var s = /Left/.test(n) ? 1 : -1;
    if(/Left(Arm)$|Right(Arm)$/.test(n)) b.quaternion.multiply(_qHang[s]);
    else if(/ForeArm$|Hand$/.test(n)) b.quaternion.premultiply(_qHangInv[s]).multiply(_qHang[s]);
    b.position.copy(b.userData.rest).add(V3(p.px || 0, p.py || 0, p.pz || 0)); }
}
/* sample a pose function into an AnimationClip */
function bakeClip(name, fn, duration, frames){
  var times = [], q = {}, pos = {}, i;
  BONE_DEFS.forEach(function(d){ q[d.name] = []; pos[d.name] = []; });
  for(i = 0; i <= frames; i++){
    var u = (i % frames) / frames; times.push(i / frames * duration); fn(u); applyPose();
    BONE_DEFS.forEach(function(d){ var b = BONES[d.name]; q[d.name].push(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w); pos[d.name].push(b.position.x, b.position.y, b.position.z); });
  }
  var tracks = [];
  BONE_DEFS.forEach(function(d){
    tracks.push(new THREE.QuaternionKeyframeTrack(d.name + '.quaternion', times, q[d.name]));
    if(d.name === 'mixamorigHips') tracks.push(new THREE.VectorKeyframeTrack(d.name + '.position', times, pos[d.name]));
  });
  return new THREE.AnimationClip(name, duration, tracks);
}
/* A Mixamo clip (see 20-mixamo-walk.js) straight onto the bones. Rotations copy
   as they are; the hips translation is re-based on this rig's hip height. */
function mixamoClip(data, name){
  var tracks = [], n = data.frames, times = [], i;
  for(i = 0; i <= n; i++) times.push(i / data.fps);
  var scale = data.unitScale * (BONES.mixamorigHips.userData.rest.y / data.hipHeight);
  for(var bone in data.bones){
    if(!BONES[bone]) continue;
    var rec = data.bones[bone];
    if(rec.q){ var q = rec.q.slice(); q.push(q[0], q[1], q[2], q[3]); tracks.push(new THREE.QuaternionKeyframeTrack(bone + '.quaternion', times, q)); }
    if(rec.p){ var p = [], rest = BONES[bone].userData.rest;
      for(i = 0; i <= n; i++){ var k = (i % n) * 3; p.push(rest.x + (rec.p[k] - data.hipsRest[0]) * scale, rest.y + (rec.p[k + 1] - data.hipsRest[1]) * scale, rest.z + (rec.p[k + 2] - data.hipsRest[2]) * scale); }
      tracks.push(new THREE.VectorKeyframeTrack(bone + '.position', times, p)); }
  }
  return new THREE.AnimationClip(name, n / data.fps, tracks);
}

/* ============================== scene and loop ============================== */
var CHAR = {};
function CHAR_MAIN(){
  var W = innerWidth, H = innerHeight;
  var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);
  var scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9e4dc);
  scene.fog = new THREE.Fog(0xe9e4dc, 14, 40);
  var camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 100);
  var orbit = { yaw: 0.45, pitch: 0.12, dist: 5.6, target: V3(0, 1.08, 0) };
  function placeCamera(){ camera.position.set(orbit.target.x + Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist, orbit.target.y + Math.sin(orbit.pitch) * orbit.dist, orbit.target.z + Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist); camera.lookAt(orbit.target); }
  placeCamera();

  scene.add(new THREE.HemisphereLight(0xdfe6f2, 0x8a7a66, 0.6));
  var sun = new THREE.DirectionalLight(0xfff1dc, 1.6); sun.position.set(3, 6, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = sun.shadow.camera.bottom = -3; sun.shadow.camera.right = sun.shadow.camera.top = 3;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 20; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02; scene.add(sun);
  var rim = new THREE.DirectionalLight(0xc0d4ff, 0.7); rim.position.set(-4, 3, -5); scene.add(rim);

  /* ground: a scrolling grid so the walk reads as travel */
  var cv = document.createElement('canvas'); cv.width = cv.height = 256; var cx = cv.getContext('2d');
  cx.fillStyle = '#d8d2c6'; cx.fillRect(0, 0, 256, 256); cx.strokeStyle = '#c4bdb0'; cx.lineWidth = 2;
  cx.strokeRect(1, 1, 254, 254); cx.beginPath(); cx.moveTo(128, 0); cx.lineTo(128, 256); cx.moveTo(0, 128); cx.lineTo(256, 128); cx.stroke();
  var gtex = new THREE.CanvasTexture(cv); gtex.wrapS = gtex.wrapT = THREE.RepeatWrapping; gtex.repeat.set(40, 40); gtex.encoding = THREE.sRGBEncoding;
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: gtex, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  /* the character: picked by the URL hash (#puffer), default the first registered */
  var key = (location.hash || '').replace('#', ''), def = CHARACTERS.find(function(c){ return c.key === key; }) || CHARACTERS[0];
  defineBones(def.proportions);
  var bones = buildSkeleton();
  bones.forEach(function(b){ b.userData.rest = b.position.clone(); });
  def.build();
  var geo = mergePieces(bones, false), geoMetal = mergePieces(bones, true);
  var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.0, skinning: true });   /* r128: skinning must be opted into per material */
  var matMetal = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.45, skinning: true });   /* no environment map, so full metalness would go black */
  var mesh = new THREE.SkinnedMesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  var rig = new THREE.Group(); rig.add(mesh); mesh.add(bones[0]);
  var skeleton = new THREE.Skeleton(bones); mesh.bind(skeleton);
  var meshMetal = null;
  if(geoMetal.attributes.position.count){ meshMetal = new THREE.SkinnedMesh(geoMetal, matMetal); meshMetal.castShadow = true; meshMetal.frustumCulled = false; rig.add(meshMetal); meshMetal.bind(skeleton, mesh.bindMatrix); }
  scene.add(rig);
  mountProps();
  document.getElementById('cap').textContent = def.name + ': procedural skinned rig, Mixamo-named bones. Drag to orbit, wheel to zoom.';
  var skel = new THREE.SkeletonHelper(mesh); skel.visible = false; scene.add(skel);

  /* clips through the mixer: this is the path a game would use */
  var clips = { walk: bakeClip('walk', walkPose, 1 / WALK.freq, 32), idle: bakeClip('idle', idlePose, 3.2, 24), attack: bakeClip('attack', attackPose, 1.1, 36),
                mixamo: mixamoClip(MIXAMO_WALK, 'mixamo walk'), run: mixamoClip(MIXAMO_RUN, 'mixamo run'), midle: mixamoClip(MIXAMO_IDLE, 'mixamo idle') };
  if(def.extraClips) Object.assign(clips, def.extraClips());
  var mixer = new THREE.AnimationMixer(mesh), actions = {};
  for(var k in clips){ actions[k] = mixer.clipAction(clips[k]); }
  var current = null;
  function play(name){ var a = actions[name]; if(current === a) return; a.reset().setEffectiveWeight(1).fadeIn(0.3).play(); if(current) current.fadeOut(0.3); current = a; for(var k in actions) if(ui[k]) ui[k].classList.toggle('on', k === name); }
  /* step length from the thigh swing; the ground scrolls at that speed */
  var legLen = 0.96, stepLen = 2 * legLen * Math.sin(WALK.thigh), walkSpeed = stepLen * 2 * WALK.freq;

  var state = { turntable: false, wire: false, dist: 0 };
  var ui = {}, uiBox = document.getElementById('ui');
  function button(key, label, fn){ var b = document.createElement('button'); b.textContent = label; b.onclick = fn; uiBox.appendChild(b); ui[key] = b; return b; }
  var sel = document.createElement('select'); sel.id = 'charsel';
  CHARACTERS.forEach(function(c){ var o = document.createElement('option'); o.value = c.key; o.textContent = c.name; if(c === def) o.selected = true; sel.appendChild(o); });
  sel.onchange = function(){ location.hash = sel.value; location.reload(); }; uiBox.appendChild(sel);
  var LABELS = { walk: 'Walk (procedural)', mixamo: 'Walk (Mixamo)', run: 'Run (Mixamo)', idle: 'Idle', midle: 'Idle (Mixamo)', attack: 'Attack', raise: 'Raise hand' };
  var order = (def.clips || []).concat(['attack']).filter(function(k, i, arr){ return clips[k] && arr.indexOf(k) === i; });
  order.forEach(function(k){ button(k, LABELS[k] || k, function(){ play(k); }); });
  button('turn', 'Turntable', function(){ state.turntable = !state.turntable; ui.turn.classList.toggle('on', state.turntable); });
  button('bones', 'Bones', function(){ skel.visible = !skel.visible; ui.bones.classList.toggle('on', skel.visible); });
  button('wire', 'Wireframe', function(){ state.wire = !state.wire; mat.wireframe = state.wire; ui.wire.classList.toggle('on', state.wire); });
  button('front', 'Front', function(){ orbit.yaw = 0; orbit.pitch = 0.1; placeCamera(); });
  button('side', 'Side', function(){ orbit.yaw = Math.PI / 2; orbit.pitch = 0.08; placeCamera(); });
  button('face', 'Face', function(){ orbit.yaw = 0.35; orbit.pitch = 0.05; orbit.dist = 1.6; orbit.target.set(0, 1.95, 0); placeCamera(); });
  button('reset', 'Reset view', function(){ orbit.yaw = 0.45; orbit.pitch = 0.12; orbit.dist = 5.6; orbit.target.set(0, 1.08, 0); placeCamera(); });

  var drag = null;
  renderer.domElement.addEventListener('pointerdown', function(e){ drag = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointerup', function(){ drag = null; });
  addEventListener('pointermove', function(e){ if(!drag) return; orbit.yaw -= (e.clientX - drag.x) * 0.008; orbit.pitch = clamp(orbit.pitch + (e.clientY - drag.y) * 0.006, -0.2, 1.2); drag = { x: e.clientX, y: e.clientY }; placeCamera(); });
  addEventListener('wheel', function(e){ orbit.dist = clamp(orbit.dist * (1 + e.deltaY * 0.001), 0.8, 14); placeCamera(); }, { passive: true });
  addEventListener('resize', function(){ W = innerWidth; H = innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); });

  var hud = document.getElementById('hud'), clock = new THREE.Clock(), frames = 0, fpsT = 0, fps = 0;
  function tick(){
    requestAnimationFrame(tick);
    var dt = Math.min(clock.getDelta(), 0.1);
    if(!CHAR.frozen){
      mixer.update(dt);
      if(current === actions.walk || current === actions.mixamo || current === actions.run){ state.dist += walkSpeed * (current === actions.run ? 2.2 : 1) * dt; gtex.offset.y = (state.dist / 1.0) % 1; }
      if(state.turntable) rig.rotation.y += dt * 0.5;
    }
    renderer.render(scene, camera);
    frames++; fpsT += dt; if(fpsT > 0.5){ fps = Math.round(frames / fpsT); frames = 0; fpsT = 0; }
    hud.textContent = 'tris ' + Math.round(geo.userData.tris + geoMetal.userData.tris) + ' body + ' + axeTris + ' props\nbones ' + bones.length + '  draw calls ' + renderer.info.render.calls + '\n' + fps + ' fps  clip ' + (current ? current.getClip().name + ' ' + current.getClip().duration.toFixed(2) + 's' : '-');
  }
  var axeTris = 0; rig.traverse(function(o){ if(o.isMesh && !o.isSkinnedMesh){ var a = o.geometry.attributes.position; axeTris += (o.geometry.index ? o.geometry.index.count : a.count) / 3; } }); axeTris = Math.round(axeTris);
  play(def.defaultClip || order[0]);
  tick();

  /* deterministic hooks for screenshots */
  CHAR.mesh = mesh; CHAR.bones = BONES; CHAR.clips = clips; CHAR.mixer = mixer; CHAR.orbit = orbit; CHAR.rig = rig; CHAR.renderer = renderer; CHAR.scene = scene; CHAR.camera = camera;
  CHAR.play = play;
  CHAR.setPhase = function(name, u){
    for(var k in actions) actions[k].stop();
    var a = actions[name]; a.reset().setEffectiveWeight(1).play(); a.time = u * clips[name].duration; current = a;
    mixer.update(0); CHAR.frozen = true; renderer.render(scene, camera); };
  CHAR.view = function(yaw, pitch, dist, ty){ orbit.yaw = yaw; orbit.pitch = pitch; orbit.dist = dist; orbit.target.set(0, ty == null ? 1.08 : ty, 0); placeCamera(); renderer.render(scene, camera); };
  CHAR.setRigYaw = function(y){ rig.rotation.y = y; };
  window._ready = true;
}
