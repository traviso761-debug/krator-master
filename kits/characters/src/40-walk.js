/* ============================== pose, walk cycle, scene =====================
   The walk is a procedural function of phase. It is sampled into a
   THREE.AnimationClip so the same character plays through AnimationMixer
   exactly as a glTF import would, and the clip can be exported.
*/
var WALK = { freq: 1.05, thigh: 0.36, knee: 0.8, arm: 0.3, bob: 0.025, sway: 0.03, twist: 0.12 };
var POSE = {};   /* name -> {rx,ry,rz, px,py,pz} rest-relative */

function setRot(name, x, y, z){ POSE[name] = POSE[name] || {}; POSE[name].rx = x; POSE[name].ry = y; POSE[name].rz = z; }
function setPos(name, x, y, z){ POSE[name] = POSE[name] || {}; POSE[name].px = x; POSE[name].py = y; POSE[name].pz = z; }

/* the standing pose every other pose is added to */
function restPose(){
  BONE_DEFS.forEach(function(d){ setRot(d.name, 0, 0, 0); setPos(d.name, 0, 0, 0); });
  [1, -1].forEach(function(s){ var S = s > 0 ? 'L' : 'R';
    setRot('upperArm' + S, 0.05, 0, s * 0.16);
    setRot('forearm' + S, -0.18, 0, s * -0.05);
    setRot('hand' + S, 0, s * -0.35, 0);
    setRot('thigh' + S, 0, 0, s * 0.06);
    setRot('shin' + S, 0.06, 0, 0);
    setRot('foot' + S, -0.05, s * 0.12, s * -0.04);
  });
  setRot('chest', -0.04, 0, 0); setRot('head', 0.06, 0, 0);
}

/* u in [0,1): one full cycle, left heel strike at u=0.25 */
function walkPose(u){
  restPose();
  var ph = u * Math.PI * 2, W = WALK;
  setPos('hips', W.sway * Math.sin(ph), W.bob * Math.cos(2 * ph) - 0.015, 0);
  setRot('hips', 0.04, W.twist * Math.sin(ph), 0.05 * Math.sin(ph));
  setRot('spine', 0.02, -0.05 * Math.sin(ph), -0.03 * Math.sin(ph));
  setRot('chest', -0.06, -W.twist * 0.9 * Math.sin(ph), -0.03 * Math.sin(ph));
  setRot('neck', 0.02, 0.05 * Math.sin(ph), 0);
  setRot('head', 0.08 - 0.02 * Math.cos(2 * ph), 0.03 * Math.sin(ph), 0.02 * Math.sin(ph));
  [1, -1].forEach(function(s){ var S = s > 0 ? 'L' : 'R', lp = ph + (s > 0 ? 0 : Math.PI);
    var thigh = -W.thigh * Math.sin(lp);
    var knee = 0.08 + W.knee * Math.max(0, Math.cos(lp + 0.6)) + 0.15 * Math.max(0, Math.sin(lp - 2.2));
    setRot('thigh' + S, thigh, 0, s * 0.07);
    setRot('shin' + S, knee, 0, 0);
    /* keep the sole roughly level in stance, toe off behind */
    var toe = 0.5 * Math.max(0, Math.sin(lp + 2.0)) * Math.max(0, -Math.sin(lp));
    setRot('foot' + S, -(thigh + knee) * 0.55 + toe, s * 0.12, s * -0.04);
    var arm = W.arm * Math.sin(lp);
    setRot('upperArm' + S, 0.05 + arm, 0, s * (0.16 + 0.03 * Math.cos(lp)));
    setRot('forearm' + S, -0.22 - 0.18 * Math.max(0, arm), 0, s * -0.05);
    setRot('hand' + S, 0, s * -0.35, 0);
  });
}
function idlePose(u){
  restPose();
  var ph = u * Math.PI * 2;
  setPos('hips', 0, 0.006 * Math.sin(ph), 0);
  setRot('chest', -0.04 + 0.025 * Math.sin(ph), 0, 0);
  setRot('head', 0.06 + 0.015 * Math.sin(ph + 1), 0, 0);
  [1, -1].forEach(function(s){ var S = s > 0 ? 'L' : 'R';
    setRot('upperArm' + S, 0.05, 0, s * (0.16 + 0.025 * Math.sin(ph))); });
}
function applyPose(){
  for(var n in POSE){ var p = POSE[n], b = BONES[n]; if(!b) continue;
    b.rotation.set(p.rx || 0, p.ry || 0, p.rz || 0);
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
    if(d.name === 'hips') tracks.push(new THREE.VectorKeyframeTrack(d.name + '.position', times, pos[d.name]));
  });
  return new THREE.AnimationClip(name, duration, tracks);
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

  /* the character */
  defineBarbarianBones();
  var bones = buildSkeleton();
  bones.forEach(function(b){ b.userData.rest = b.position.clone(); });
  buildBarbarianBody();
  var geo = mergePieces(bones);
  var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.0, skinning: true });   /* r128: skinning must be opted into per material */
  var mesh = new THREE.SkinnedMesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  var rig = new THREE.Group(); rig.add(mesh); mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));
  scene.add(rig);
  /* axes in the hands */
  [1, -1].forEach(function(s){ var S = s > 0 ? 'L' : 'R', axe = buildAxe(s < 0);
    axe.position.set(0, -0.08, 0.01); axe.rotation.set(-0.35, 0, s * -0.65); BONES['hand' + S].add(axe); });
  var skel = new THREE.SkeletonHelper(mesh); skel.visible = false; scene.add(skel);

  /* clips through the mixer: this is the path a game would use */
  var clips = { walk: bakeClip('walk', walkPose, 1 / WALK.freq, 32), idle: bakeClip('idle', idlePose, 3.2, 24) };
  var mixer = new THREE.AnimationMixer(mesh), actions = {};
  for(var k in clips){ actions[k] = mixer.clipAction(clips[k]); }
  var current = null;
  function play(name){ var a = actions[name]; if(current === a) return; a.reset().setEffectiveWeight(1).fadeIn(0.3).play(); if(current) current.fadeOut(0.3); current = a; ui.walk.classList.toggle('on', name === 'walk'); ui.idle.classList.toggle('on', name === 'idle'); }
  /* step length from the thigh swing; the ground scrolls at that speed */
  var legLen = 0.96, stepLen = 2 * legLen * Math.sin(WALK.thigh), walkSpeed = stepLen * 2 * WALK.freq;

  var state = { turntable: false, wire: false, dist: 0 };
  var ui = {}, uiBox = document.getElementById('ui');
  function button(key, label, fn){ var b = document.createElement('button'); b.textContent = label; b.onclick = fn; uiBox.appendChild(b); ui[key] = b; return b; }
  button('walk', 'Walk', function(){ play('walk'); });
  button('idle', 'Idle', function(){ play('idle'); });
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
      if(current === actions.walk){ state.dist += walkSpeed * dt; gtex.offset.y = (state.dist / 1.0) % 1; }
      if(state.turntable) rig.rotation.y += dt * 0.5;
    }
    renderer.render(scene, camera);
    frames++; fpsT += dt; if(fpsT > 0.5){ fps = Math.round(frames / fpsT); frames = 0; fpsT = 0; }
    hud.textContent = 'tris ' + Math.round(geo.userData.tris) + ' body + ' + axeTris + ' axes\nbones ' + bones.length + '  draw calls ' + renderer.info.render.calls + '\n' + fps + ' fps  clip ' + (current === actions.walk ? 'walk' : 'idle') + ' ' + (1 / WALK.freq).toFixed(2) + 's';
  }
  var axeTris = 0; rig.traverse(function(o){ if(o.isMesh && !o.isSkinnedMesh){ var a = o.geometry.attributes.position; axeTris += (o.geometry.index ? o.geometry.index.count : a.count) / 3; } }); axeTris = Math.round(axeTris);
  play('walk');
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
