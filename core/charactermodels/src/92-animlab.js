/* ==== the Animation Lab: six figures, one clip on all of them, a review mark per clip. [web] (host code) ====
   Each MakeHuman body three ways (CAST: neutral, short and broad, tall and lanky, all in the same plain clothes, or a
   people's outfit for one class from the Clothes picker) stand
   in a row; a clip from the ledger plays on all six in step, with the props its data/clips.json hold names (both
   hands where two_hands says). One-shots repeat here so they can be watched again. The playback can be paused,
   slowed and scrubbed.
   Reviews: per clip a verdict (good, fix, bad), the bodies it looks wrong on and a note, kept in the artifact's db
   (collection 'reviews', one document per clip, read by Claude with ArtifactData), or in this browser when the page
   runs without one (a local server, verify.py).
*/
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };

  /* ---- pieces: as the Cosmetic Lab fetches them, shared by the six figures ---- */
  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function gunzip(buf){
    var u = new Uint8Array(buf);
    if(u[0] !== 0x1f || u[1] !== 0x8b) return Promise.resolve(buf);
    return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  var raws = {}, cache = {};
  // a piece's file: its GLB, and on a second line its morph deltas (build.py); key + '.morph' asks for the second
  var texts = {};
  function fetchText(key){
    var base = key.replace(/\.morph$/, ''), line = base === key ? 0 : 1;
    if(!texts[base]) texts[base] = fetch('pieces/' + base + '.txt').then(function(r){ if(!r.ok) throw new Error(base + ': ' + r.status); return r.text(); });
    return texts[base].then(function(t){
      var s = t.split('\n')[line];
      if(s) return gunzip(b64(s));
      // a piece published before the two were one file: its deltas in a file of their own
      return fetch('pieces/' + key + '.txt').then(function(r){ if(!r.ok) throw new Error(key + ': ' + r.status); return r.text(); }).then(b64).then(gunzip);
    });
  }
  function fetchPiece(key){
    if(!raws[key]) raws[key] = fetchText(key);
    return raws[key];
  }
  function load(key){
    if(!cache[key]) cache[key] = fetchPiece(key).then(function(buf){ return new Promise(function(ok, no){ new THREE.GLTFLoader().parse(buf, '', ok, no); }); });
    return cache[key];
  }
  load.raw = fetchPiece;

  /* ---- the cast ---- */
  var OUTFIT = {
    mpfb_male:   { hair:'short02', beard:null, armour:{ torso:'elvs_crude_t-shirt_male', legs:'cortu_cargo_pants', feet:'toigo_ankle_boots_male' },
                   skin:'#b98a66', hair_color:'#3a2a1e', eye_color:'#5a3a22' },
    mpfb_female: { hair:'braid01', beard:null, armour:{ torso:'joepal_crude_t-shirt_female', legs:'cortu_cargo_pants', feet:'toigo_ankle_boots_female' },
                   skin:'#c99a74', hair_color:'#2c2019', eye_color:'#4e6a80' },
    mpfb_giant:  { hair:'short04', beard:null, armour:{ torso:'giant_dalab_m_harness4', legs:'voth_m_peasant_maxtlatl', feet:'dalab_m_noble_sandals' },
                   skin:'#6a8a4c', hair_color:'#1a1712', eye_color:'#6e5a2e', dye:{ legs:'#b8443a' } }
  };
  var BUILD = {
    giant:   { label:'Four arms', morph:{ muscle:0.7, weight:0.25 } },
    heavy:   { label:'Cybernetic arms, heavy', morph:{ height:-0.4, weight:0.8, muscle:1 } },
    patrol:  { label:'Two arms', morph:{ muscle:0.7, weight:0.25 } },
    short:   { label:'Short, broad', morph:{ height:-0.8, weight:0.6, muscle:0.6 } },
    neutral: { label:'Neutral', morph:{} },
    tall:    { label:'Tall, lanky', morph:{ height:0.75, weight:-0.8, muscle:-0.4 } }
  };
  var CAST = [];
  [['m', 'mpfb_male', 'Man'], ['f', 'mpfb_female', 'Woman']].forEach(function(g){
    if(!D.bodies[g[1]]) return;
    ['short', 'neutral', 'tall'].forEach(function(b){
      CAST.push({ id:g[0] + '-' + b, sex:g[0], body:g[1], build:b, label:g[2] + ' · ' + BUILD[b].label.toLowerCase(), short:g[2].charAt(0) + ' ' + b });
    });
  });
  // the giants (tools/giant.py), on their own filter: a four-armed temple guard (the flesh pair), a heavy one with the
  // cybernetic pair, and a two-armed patrol (tools/mods.py)
  if(D.bodies.mpfb_giant) [['giant', ['mod_arms_flesh']], ['heavy', ['mod_arms_cyber']], ['patrol', []]].forEach(function(g){
    CAST.push({ id:'g-' + g[0], sex:'g', body:'mpfb_giant', build:g[0], mods:g[1], label:'Giant · ' + BUILD[g[0]].label.toLowerCase(), short:'G ' + g[0] });
  });
  // the clothes the cast wears: plain (OUTFIT), or a people's outfit for one tier (data/peoples.json outfits; the giants'
  // peoples dress only the giants, a four-armed top only the four-armed among them)
  var DRESS = [];
  (D.peoples || []).forEach(function(p){
    (p.tiers || []).forEach(function(t){
      if(p.outfits && ((p.outfits.male || {})[t[0]] || (p.outfits.giant || {})[t[0]])) DRESS.push({ id:p.id + '.' + t[0], label:p.name + ' ' + ((p.tier_labels || {})[t[0]] || t[0]).toLowerCase(), p:p, tier:t[0] });
    });
  });
  var dress = '';
  function record(c){
    var kit = D.bodies[c.body].kit, r = KCHAR.blank(kit), o = OUTFIT[c.body];
    Object.keys(o).forEach(function(k){ r[k] = JSON.parse(JSON.stringify(o[k])); });
    r.armour = Object.assign({}, r.armour);
    Object.keys(r.armour).forEach(function(s){ if(!kit.items.some(function(it){ return it.id === r.armour[s]; })) r.armour[s] = null; });
    if(!kit.items.some(function(it){ return it.id === r.hair; })) r.hair = null;
    var d = DRESS.filter(function(x){ return x.id === dress; })[0], set = d && (d.p.outfits[c.body.replace(/^mpfb_/, '')] || {})[d.tier];
    if(set) ['head', 'torso', 'back', 'legs', 'feet'].forEach(function(sl){ r.armour[sl] = set[sl] && kit.items.some(function(it){ return it.id === set[sl]; }) ? set[sl] : null; });
    r.morph = JSON.parse(JSON.stringify(BUILD[c.build].morph));
    // the cast's own mods, or what the Mods menu puts on everyone (a top made for two arms comes off a four-armed body)
    var pick = $('mods-pick') && $('mods-pick').value;
    r.mods = pick ? pick.split(',') : (c.mods || []).slice();
    // the Lizardman test (tools/nonhuman.py): olive skin and amber eyes with the reptile head; the head leaves out the hair
    if(r.mods.indexOf('mod_head_lizard') >= 0){ r.skin = '#7d8a45'; r.eye_color = '#c89020'; if(!dress) r.armour.torso = null; }
    if(r.mods.indexOf('mod_head_frog') >= 0){ r.skin = '#5f8a36'; r.eye_color = '#d6a22a'; if(!dress) r.armour.torso = null; }     // the Frogman test: a frog's green, gold eyes
    if(r.mods.indexOf('mod_head_coyote') >= 0){ r.coat = 'coyote'; r.skin = '#6e5a4c'; r.hair_color = '#9a7a52'; r.eye_color = '#c08a2a'; }
    if(KCHAR.replacesFeet(r, kit) && !dress){
      var kilt = (r.mods.indexOf('mod_legs_lizard') >= 0 || r.mods.indexOf('mod_legs_frog') >= 0) && c.sex !== 'f' ? 'voth_m_peasant_maxtlatl'
               : c.sex === 'f' ? 'dalab_f_peasant_kilt' : 'dalab_m_peasant_kilt';
      if(kit.items.some(function(it){ return it.id === kilt; })) r.armour.legs = kilt;
      r.armour.feet = null;
    }
    r.ancestry = null;
    return r;
  }

  /* ---- the clips: the body's clip list (skeleton.json), grouped as data/clips.json groups them ---- */
  var META = {}, ORDER = [], INFO = {}, PROP = {};
  (D.props || []).forEach(function(p){ PROP[p.id] = p; });
  KCharFigure.props = PROP;
  KCharFigure.posture = (D.posture && D.posture.bodies) || {};
  KCharFigure.postureClips = (D.posture && D.posture.clips) || {};
  KCharFigure.postureFrame = (D.posture && D.posture.frame) || 'figure';
  KCharFigure.postureClipFrames = (D.posture && D.posture.clipFrames) || {};
  KCharFigure.fur = D.fur || null;                                   // data/fur.json: garments' fur shells
  ((D.clips && D.clips.clips) || []).forEach(function(c){ INFO[c.key] = c; });
  KCharFigure.clipData = INFO;
  KCharFigure.faces = (D.clips && D.clips.faces) || {};
  KCharFigure.look = (D.clips && D.clips.look) || null;
  // data/clips.json dropped: clips still in anims.glb that the lab leaves out
  var DROP = (D.clips && D.clips.dropped) || [];
  var lead = D.bodies[CAST[0].body].skeleton.clips.filter(function(c){ return DROP.indexOf(c.name) < 0; });
  lead.forEach(function(c){ META[c.name] = c; });
  var GROUPS = [{ id:'idle', label:'Idle' }].concat((D.clips && D.clips.groups) || []);
  GROUPS.forEach(function(g){ g.clips = lead.filter(function(c){ return c.group === g.id; }).map(function(c){ return c.name; }); });
  var known = {}; GROUPS.forEach(function(g){ g.clips.forEach(function(n){ known[n] = 1; }); });
  var rest = lead.filter(function(c){ return !known[c.name]; }).map(function(c){ return c.name; });
  if(rest.length) GROUPS.push({ id:'other', label:'Other', clips:rest });
  GROUPS = GROUPS.filter(function(g){ return g.clips.length; });
  GROUPS.forEach(function(g){ ORDER = ORDER.concat(g.clips); });
  function label(n){ return (INFO[n] && INFO[n].label) || (META[n] && META[n].label) || n; }
  function groupOf(n){ return GROUPS.filter(function(g){ return g.clips.indexOf(n) >= 0; })[0]; }

  /* ---- stage ---- */
  var renderer, scene, camera, clock = new THREE.Clock(), figs = [], current = 'idle', paused = false, speed = 1, keyLight = null;
  var cam = { yaw:0, pitch:0.12, dist:9, x:0, ty:0.95, want:{ yaw:0, pitch:0.12, dist:9, x:0, ty:0.95 } }, focus = null, who = 'all';
  function boot(){
    var stage = $('stage');
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.insertBefore(renderer.domElement, stage.firstChild);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 0.55));
    // the key light's shadow: a 4096 map fitted to the figures shown (lineup), so a shadow pixel is a few millimetres
    // and the head's shadow on the back has a clean edge; normalBias keeps the skin from shadowing itself in speckles
    var key = keyLight = new THREE.DirectionalLight(0xffe2b8, 0.8); key.position.set(2.5, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.camera.left = key.shadow.camera.bottom = -6; key.shadow.camera.right = key.shadow.camera.top = 6;
    key.shadow.bias = -0.0003; key.shadow.normalBias = 0.012; scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fc3ff, 0.4); rim.position.set(-3, 3, -4); scene.add(rim);
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.ShadowMaterial({ opacity:0.26 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    CAST.forEach(function(c){
      var f = new KCharFigure(D.bodies[c.body], D.sliders, load);
      var ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.44, 48), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.14 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; f.group.add(ring);
      scene.add(f.group);
      var tag = document.createElement('button'); tag.className = 'tag'; tag.id = 'tag-' + c.id; tag.setAttribute('aria-pressed', 'false');
      tag.innerHTML = c.label + '<small></small>';
      tag.addEventListener('click', function(){ setFocus(focus === c.id ? null : c.id); });
      $('labels').appendChild(tag);
      figs.push({ c:c, f:f, tag:tag });
    });
    lineup();
    bindStage(renderer.domElement);
    window.addEventListener('resize', resize); resize();
    requestAnimationFrame(frame);
    var ready = Promise.all(figs.map(function(x){ return x.f.apply(record(x.c)).then(function(){
      x.tag.querySelector('small').textContent = x.f.pose.stature ? Math.round(x.f.pose.stature * 100) + ' cm' : '';
    }); })).then(function(){ $('loading').hidden = true; poseApply(); return play(current); }, function(e){ $('loading').textContent = 'A piece failed to load: ' + e.message; });
    window._lab = { figs:figs.map(function(x){ return x.f; }), ready:ready, play:play, reviews:function(){ return reviews; }, setTime:setTime, cam:cam,
      // a door clip's set: how far figure i's grip is from its door's lever (null with no door shown)
      doorGap:function(i){ var d = SETS[i]; return d && d.root.visible ? gripAt(figs[i], new THREE.Vector3()).distanceTo(d.mark.getWorldPosition(new THREE.Vector3())) : null; } };
  }

  // the row: each body's three side by side, a wider gap between the two bodies
  function lineup(){
    // 'all' is the six people; the giants have their own filter, spaced and framed by their scale
    var shown = figs.filter(function(x){ return who === 'all' ? x.c.sex !== 'g' : x.c.sex === who; }), xs = [], x = 0;
    shown.forEach(function(s, i){ if(i){ x += (shown[i - 1].c.sex !== s.c.sex ? 1.7 : 1.15) * s.f.scale; } xs.push(x); });
    var mid = x / 2, big = shown.reduce(function(m, s){ return Math.max(m, s.f.scale); }, 1);
    figs.forEach(function(s){ s.f.group.visible = false; s.tag.hidden = true; });
    shown.forEach(function(s, i){ s.f.group.visible = true; s.tag.hidden = false; s.f.group.position.x = xs[i] - mid; });
    cam.want.ty = 0.95 * big;
    cam.want.dist = Math.max(4.2 * big, x * 1.25 + 3.2 * big);
    if(keyLight){
      // the shadow box, in the light's frame (it looks down from (2.5, 5, 4)): the row and a figure's reach either
      // side; up and down, the tallest figure plus the drift of the row's ends (about 0.45 of their distance from the
      // middle, the light being off to one side)
      var sc = keyLight.shadow.camera, half = x / 2 + 1.4 * big;
      sc.left = -half; sc.right = half; sc.bottom = -(0.45 * half + 0.4 * big); sc.top = 1.4 * big + 0.45 * half + 0.3;
      sc.updateProjectionMatrix();
    }
    if(focus && !shown.some(function(s){ return s.c.id === focus; })) setFocus(null);
    else setFocus(focus);
  }
  function setFocus(id){
    focus = id;
    figs.forEach(function(s){ s.tag.setAttribute('aria-pressed', s.c.id === id); });
    var s = figs.filter(function(x){ return x.c.id === id; })[0];
    if(s){ cam.want.x = s.f.group.position.x; cam.want.dist = 3.2 * s.f.scale; }
    else {
      var shown = figs.filter(function(x){ return x.f.group.visible; }), w = shown.length ? shown[shown.length - 1].f.group.position.x - shown[0].f.group.position.x : 0;
      var big = shown.reduce(function(m, x){ return Math.max(m, x.f.scale); }, 1);
      cam.want.x = 0; cam.want.dist = Math.max(4.2 * big, w * 1.25 + 3.2 * big);
    }
  }

  function resize(){
    var r = $('stage').getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
  }

  /* the set a clip is made against, drawn so it reads (the owner, 2026-11-27, on Open door: "not sure this reads as
     pulling a door handle"): a clip whose derive has a door (make_pieces.door_clip) gets a door beside each figure, its
     frame, its panel and its lever handle where the clip's hand takes hold, the panel swinging round its hinge and the
     lever turning on the clip's own seconds, the same easing as the bake. Each body's door is the clip's times its
     height over its build's neutral one, so the shorter and taller hands meet the handle too. The lab's alone: no
     figure or game state */
  var SETS = [], setMat = null;
  function setSpec(){ var d = INFO[current] && INFO[current].derive; return d && d.door; }
  function makeDoor(sp){
    // the panel half seen through, so the figure behind it shows from the front (the lab's default view)
    if(!setMat) setMat = { wood:new THREE.MeshStandardMaterial({ color:0x7a5a3c, roughness:0.8, transparent:true, opacity:0.45, depthWrite:false }), frame:new THREE.MeshStandardMaterial({ color:0x5a4330, roughness:0.85 }),
                           iron:new THREE.MeshStandardMaterial({ color:0x3a3a3c, metalness:0.7, roughness:0.4 }) };
    var s = sp.side == null ? 1 : sp.side, r = sp.hinge == null ? 0.72 : sp.hinge, H = sp.handle, W = r + 0.09;
    var root = new THREE.Group(), pivot = new THREE.Group(), lever = new THREE.Group();
    function box(mat, w, h, d, x, y, z, parent){ var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
    var hx = H[0] + s * r;
    pivot.position.set(hx, 0, H[2]); root.add(pivot);
    // the panel, its face 9 cm behind the grip (the fingers wrap the lever 5 cm past it)
    box(setMat.wood, W, 2.05, 0.04, -s * W / 2 + s * 0.02, 1.025, 0.11, pivot);
    var lp = new THREE.Vector3(H[0] - 0.07 * s - hx, H[1], 0);
    lever.position.copy(lp); pivot.add(lever);
    box(setMat.iron, 0.06, 0.09, 0.012, 0, 0, 0.084, lever);                                          // the rose plate
    box(setMat.iron, 0.016, 0.016, 0.08, 0, 0, 0.044, lever);                                         // the stem
    box(setMat.iron, 0.13, 0.018, 0.02, s * 0.065, 0, 0, lever);                                      // the lever, toward the hinge
    var mark = new THREE.Object3D(); mark.position.set(s * 0.07, 0, 0); lever.add(mark);              // where the grip holds it
    box(setMat.frame, 0.07, 2.12, 0.12, hx + s * 0.055, 1.06, H[2] + 0.12, root);                     // the frame
    box(setMat.frame, 0.07, 2.12, 0.12, hx - s * (W + 0.035), 1.06, H[2] + 0.12, root);
    box(setMat.frame, W + 0.18, 0.07, 0.12, hx - s * W / 2 + s * 0.01, 2.115, H[2] + 0.12, root);
    scene.add(root);
    return { root:root, pivot:pivot, lever:lever, mark:mark, s:s, off:null };
  }
  // the right hand's grip point in the world (skeleton.json hands: the grip frame in the hand bone)
  var gV = new THREE.Vector3();
  function gripAt(x, out){
    var h = D.bodies[x.c.body].skeleton.hands.R, b = x.f.bones[h.bone];
    return out.fromArray(h.grip).applyMatrix4(b.matrixWorld);
  }
  function sets(){
    var sp = setSpec();
    if(SETS.spec !== sp){ SETS.forEach(function(d){ scene.remove(d.root); }); SETS = []; SETS.spec = sp; }
    if(!sp) return;
    var K = sp.keys, sm = function(a, b, t){ var x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
    figs.forEach(function(x, i){
      var d = SETS[i] || (SETS[i] = makeDoor(sp)), a = x.f.action;
      d.root.visible = x.f.group.visible && !!a;
      if(!d.root.visible) return;
      var base = figs.filter(function(y){ return y.c.body === x.c.body && y.c.build === 'neutral'; })[0];
      var k = base && base.f.pose.stature && x.f.pose.stature ? x.f.pose.stature / base.f.pose.stature : x.f.scale;
      d.root.scale.setScalar(k);
      var t = a.time % a.getClip().duration, th = (sp.open || 0) * Math.PI / 180 * sm(K.pull[0], K.pull[1], t);
      var ph = (sp.turn || 0) * Math.PI / 180 * Math.min(sm(K.turn[0], K.turn[1], t), 1 - sm(K.pull[0] + 0.3, K.pull[0] + 0.9, t));
      d.pivot.rotation.y = -d.s * th;
      d.lever.rotation.z = -d.s * ph;
      // the door stands where this figure's hand closes on its lever: the posture and the body's own passes move the
      // arm off the bake's handle by up to 15 cm, so the first frame the hand holds it (the grip's end to the letting
      // go) places the door, and it stays there while this clip plays
      d.root.position.copy(x.f.group.position);
      var held = t >= K.grip[1] && t <= K.let[0];
      if(d.off) d.root.position.add(d.off);
      else if(held){
        d.root.updateMatrixWorld(true);
        d.off = gripAt(x, new THREE.Vector3()).sub(d.mark.getWorldPosition(new THREE.Vector3()));
        d.root.position.add(d.off);
      }
      // and the door swings where the hand pulls it: while held, the angle round the hinge that brings the lever to the
      // grip (the hand's path is the bake's arc bent by those passes); after the letting go it stays where it was left
      if(held && d.off){
        d.root.updateMatrixWorld(true);
        var v = d.root.worldToLocal(gripAt(x, gV)).sub(d.pivot.position);
        d.th = Math.max(0, Math.atan2(-v.z, -d.s * v.x));
      } else if(t < K.grip[1]) d.th = 0;
      if(d.th != null && d.off) d.pivot.rotation.y = -d.s * d.th;
    });
  }

  var tv = new THREE.Vector3();
  function frame(){
    var dt = Math.min(0.05, clock.getDelta()), step = paused ? 0 : dt * speed;
    figs.forEach(function(s){ if(s.f.group.visible) s.f.update(step); });
    sets();
    var k = 1 - Math.pow(0.002, dt);
    ['yaw', 'pitch', 'dist', 'x', 'ty'].forEach(function(n){ cam[n] += (cam.want[n] - cam[n]) * k; });
    var cp = Math.cos(cam.pitch);
    camera.position.set(cam.x + Math.sin(cam.yaw) * cp * cam.dist, cam.ty + Math.sin(cam.pitch) * cam.dist, Math.cos(cam.yaw) * cp * cam.dist);
    camera.lookAt(cam.x, cam.ty, 0);
    renderer.render(scene, camera);
    var r = renderer.domElement.getBoundingClientRect();
    figs.forEach(function(s){
      if(!s.f.group.visible) return;
      tv.set(s.f.group.position.x, 0, 0.55).project(camera);
      s.tag.style.left = ((tv.x + 1) / 2 * r.width) + 'px';
      s.tag.style.top = Math.min(r.height - 120, (1 - tv.y) / 2 * r.height + 6) + 'px';
    });
    clockText();
    requestAnimationFrame(frame);
  }

  function bindStage(el){
    var drag = null;
    el.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function(e){
      if(!drag) return;
      cam.want.yaw -= (e.clientX - drag.x) * 0.008;
      cam.want.pitch = Math.max(-0.3, Math.min(0.9, cam.want.pitch + (e.clientY - drag.y) * 0.005));
      drag = { x:e.clientX, y:e.clientY };
      Array.prototype.forEach.call(document.querySelectorAll('[data-yaw]'), function(b){ b.setAttribute('aria-pressed', 'false'); });
    });
    el.addEventListener('pointerup', function(){ drag = null; });
    el.addEventListener('wheel', function(e){
      e.preventDefault();
      cam.want.dist = Math.max(1.2, Math.min(28, cam.want.dist * Math.exp(e.deltaY * 0.001)));
    }, { passive:false });
  }

  /* ---- playback ---- */
  function lead1(){ var s = figs.filter(function(x){ return x.f.group.visible && x.f.action; })[0]; return s && s.f.action; }
  function duration(){ var a = lead1(); return a ? a.getClip().duration : 0; }
  function clockText(){
    var a = lead1(), d = duration(), t = a ? a.time % (d || 1) : 0;
    $('clock').textContent = t.toFixed(2) + ' / ' + d.toFixed(2) + ' s';
    if(!scrubbing && d) $('scrub').value = Math.round(t / d * 1000);
  }
  function setTime(t){
    figs.forEach(function(s){ if(s.f.action){ s.f.action.time = t; s.f.update(0); } });
  }
  function setPaused(p){
    paused = p;
    $('play').textContent = p ? 'Play' : 'Pause';
    $('play').setAttribute('aria-pressed', !p);
  }
  var holdChoice = null;
  function holdFor(name){
    var h = (INFO[name] && INFO[name].hold) || {}, side = h.R ? 'R' : h.L ? 'L' : null, pick = $('hold-pick');
    pick.innerHTML = '';
    var none = document.createElement('option'); none.value = ''; none.textContent = side ? 'Empty hands' : 'Nothing to hold';
    pick.appendChild(none);
    (side ? h[side] : []).forEach(function(id){
      var o = document.createElement('option'); o.value = id; o.textContent = (PROP[id] || { label:id }).label; pick.appendChild(o);
    });
    var p = side && holdChoice !== '' ? (h[side].indexOf(holdChoice) >= 0 ? holdChoice : h[side][0]) : '';
    pick.value = p || '';
    pick.disabled = !side;
    var want = { R:null, L:null };
    // a giant's lower hands: what the Lower hands menu gives them, whatever the clip
    ($('hold-low').value || '').split(',').forEach(function(x){ var kv = x.split(':'); if(kv[1]) want[kv[0]] = kv[1]; });
    if(p !== '' && side){
      if(h.R) want.R = side === 'R' ? p : h.R[0];
      if(h.L) want.L = side === 'L' ? p : h.L[0];
      want.both = !!(want.R && INFO[name].two_hands && INFO[name].two_hands.indexOf(want.R) >= 0);
    }
    held = want;
    return Promise.all(figs.map(function(s){ return s.f.hold(want); }));
  }
  var held = { R:null, L:null };
  // play a clip on all six from its start, without a cross-fade (so a paused or scrubbed frame is this clip alone);
  // a one-shot repeats
  /* ---- scenery: a clip's data/clips.json 'scene', the furniture it works at (catalog keys, each at [x, y, z] metres
     in the figure's frame, +z its front, +x its left, turned ry degrees), built with the catalog's own code: the
     KratorFurniture bundle in scenery.js beside the page (kits/catalog/furniture_bundle.py writes it; without it the
     clips play with no scenery). Each figure's set goes into its group at its size, so a tall figure's chair is a tall
     one and a giant's a giant's ---- */
  var sceneryLoad = null;
  function scenery(){
    if(!sceneryLoad) sceneryLoad = new Promise(function(ok){
      if(window.KratorFurniture) return ok(window.KratorFurniture);
      var s = document.createElement('script');
      s.src = 'scenery.js';
      s.onload = function(){ ok(window.KratorFurniture || null); };
      s.onerror = function(){ ok(null); };
      document.head.appendChild(s);
    });
    return sceneryLoad;
  }
  function setScene(name){
    figs.forEach(function(s){ if(s.set){ s.f.group.remove(s.set); s.set = null; } });
    var sc = INFO[name] && INFO[name].scene;
    if(!sc || !sc.length) return Promise.resolve();
    return scenery().then(function(KF){
      if(!KF || current !== name) return;
      figs.forEach(function(s){
        var B = KF.batch(), set = new THREE.Group();
        sc.forEach(function(p){
          if(KF.has(p.key)) B.place(p.key, p.at[0], p.at[1] || 0, p.at[2], (p.ry || 0) * Math.PI / 180, { seed:1, variant:p.variant || 0 });
        });
        B.flush(set);
        set.traverse(function(m){ if(m.isMesh){ m.castShadow = m.receiveShadow = true; } });
        set.scale.setScalar(s.f.inner ? s.f.inner.scale.x : s.f.scale);
        set.userData.scenery = name;
        s.set = set;
        s.f.group.add(set);
      });
    });
  }

  function play(name){
    flushNote();
    current = name;
    setScene(name);
    return holdFor(name).then(function(){ return Promise.all(figs.map(function(s){ return s.f.play(name); })); }).then(function(){
      if(current !== name) return;
      figs.forEach(function(s){
        var a = s.f.action;
        if(!a) return;
        s.f.mixer.stopAllAction();
        a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.clampWhenFinished = false; a.setEffectiveWeight(1); a.play();
        s.f.update(0);
      });
      showCurrent();
    });
  }

  /* ---- posture: the Posture panel edits data/posture.json live (each figure's own copies, fig.posture and
     fig.postureClips) and gives it back as JSON to paste into that file: 'bodies', the angles every clip takes, and
     'clips', per clip and body the degrees added on top. In "This clip" the sliders show the sum for the clip playing
     and keep the difference. Kept in this browser until Reset, or until posture.json itself changes ---- */
  var POSE_KEY = 'kchar.animlab.posture', POSE_BODIES = ['mpfb_male', 'mpfb_female'];
  var POSE_ROWS = [['lean', 'Lean at hips', -45, 30], ['pelvis', 'Pelvis tilt', -60, 40], ['Spine', 'Spine · lumbar', -60, 60], ['Spine1', 'Spine1 · low T', -60, 60],
    ['Spine2', 'Spine2 · high T', -60, 60], ['Neck', 'Neck', -60, 60], ['nTurn', 'Neck turn', -60, 60], ['nSide', 'Neck side tilt', -40, 40], ['Head', 'Head', -40, 40], ['drop', 'Shoulder drop', -30, 60],
    ['back', 'Shoulder back', -45, 45], ['fSpine', 'Lumbar fwd cm', -8, 8],
    ['fSpine1', 'Low T fwd cm', -8, 8], ['fSpine2', 'High T fwd cm', -8, 8], ['fNeck', 'Neck fwd cm', -8, 8],
    ['fHead', 'Head fwd cm', -8, 8], ['uHead', 'Head up cm', -6, 6]];
  var POSE = { bodies:{}, clips:{} };
  function poseFile(){ return JSON.parse(JSON.stringify({ bodies:(D.posture && D.posture.bodies) || {}, clips:(D.posture && D.posture.clips) || {} })); }
  function half(v){ v = +v; return isFinite(v) ? Math.round(v * 2) / 2 : 0; }
  // the clips with a change of their own (the ledger marks them)
  function posedClip(n){ return !!POSE.clips[n]; }
  function wirePose(){
    var body = $('pose-body'), rows = $('pose-rows'), txt = $('pose-json'), inputs = {}, scope = 'all';
    function status(t){ $('pose-status').textContent = t; }
    function clean(p){
      // the frame is posture.json's (the figures take it when they are made): carried through so a copy is whole
      var out = { frame:(D.posture && D.posture.frame) || 'figure', clipFrames:(D.posture && D.posture.clipFrames) || {}, bodies:{}, clips:{} };
      // a pasted 'bodies' object alone (the panel's old copy) keeps the clips as they are
      var bodies = p && p.bodies ? p.bodies : p, clips = p && p.bodies ? (p.clips || {}) : POSE.clips;
      POSE_BODIES.forEach(function(b){
        var src = (bodies && bodies[b]) || {}, o = out.bodies[b] = {};
        POSE_ROWS.forEach(function(r){ o[r[0]] = half(src[r[0]]); });
      });
      Object.keys(clips || {}).sort().forEach(function(c){
        POSE_BODIES.forEach(function(b){
          var src = (clips[c] || {})[b] || {}, o = {};
          POSE_ROWS.forEach(function(r){ var v = half(src[r[0]]); if(v) o[r[0]] = v; });
          if(Object.keys(o).length) (out.clips[c] = out.clips[c] || {})[b] = o;
        });
      });
      return out;
    }
    var file = clean(poseFile()), stamp = JSON.stringify(file);
    POSE = file;
    try {
      // edits kept in this browser, unless posture.json has changed under them since (new numbers pasted in)
      var kept = JSON.parse(localStorage.getItem(POSE_KEY) || 'null');
      if(kept && kept.file === stamp && kept.pose) POSE = clean(kept.pose);
      else if(kept) localStorage.removeItem(POSE_KEY);
    } catch(e){}
    function save(){ try { localStorage.setItem(POSE_KEY, JSON.stringify({ file:stamp, pose:POSE })); } catch(e){} }
    function show(){ txt.value = JSON.stringify(POSE, null, 1); ledger(); }
    function apply(){
      figs.forEach(function(s){
        var b = s.f.kit.body, key = POSE.bodies[b] ? b : 'mpfb_male', pc = s.f.postureClips;
        Object.assign(s.f.posture, POSE.bodies[key]);
        Object.keys(pc).forEach(function(c){ delete pc[c]; });
        Object.keys(POSE.clips).forEach(function(c){ var o = POSE.clips[c][key]; if(o) pc[c] = Object.assign({}, o); });
        s.f.update(0);
      });
    }
    function offs(){ return (POSE.clips[current] || {})[body.value] || {}; }
    function fill(){
      var p = POSE.bodies[body.value], o = scope === 'clip' ? offs() : {};
      POSE_ROWS.forEach(function(r){
        var v = half((p[r[0]] || 0) + (o[r[0]] || 0));
        inputs[r[0]].range.value = v; inputs[r[0]].num.value = v;
        inputs[r[0]].row.classList.toggle('tuned', !!o[r[0]]);
        inputs[r[0]].row.title = o[r[0]] ? 'This clip: ' + (o[r[0]] > 0 ? '+' : '') + o[r[0]] + '° on the body\'s ' + p[r[0]] + '°' : '';
      });
      $('pose-all').setAttribute('aria-pressed', scope === 'all');
      $('pose-clip').setAttribute('aria-pressed', scope === 'clip');
      $('pose-clear').hidden = scope !== 'clip' || !Object.keys(offs()).length;
      $('pose-which').textContent = scope === 'clip' ? label(current) : '';
    }
    POSE_ROWS.forEach(function(r){
      var row = document.createElement('div'), lab = document.createElement('label'), range = document.createElement('input'), num = document.createElement('input');
      row.className = 'pose-row';
      range.type = 'range'; range.min = r[2]; range.max = r[3]; range.step = 0.5; range.id = 'pose-' + r[0];
      num.type = 'number'; num.min = r[2]; num.max = r[3]; num.step = 0.5; num.setAttribute('aria-label', r[1] + ' degrees');
      lab.textContent = r[1]; lab.htmlFor = range.id;
      function set(v){
        v = half(Math.max(r[2], Math.min(r[3], +v || 0)));
        var b = body.value;
        if(scope === 'clip'){
          // the clip keeps only what differs from the body's own value
          var d = half(v - (POSE.bodies[b][r[0]] || 0)), c = POSE.clips[current] = POSE.clips[current] || {}, o = c[b] = c[b] || {};
          if(d) o[r[0]] = d; else delete o[r[0]];
          if(!Object.keys(o).length) delete c[b];
          if(!Object.keys(c).length) delete POSE.clips[current];
        } else POSE.bodies[b][r[0]] = v;
        apply(); fill(); show(); save(); status('');
      }
      range.addEventListener('input', function(){ set(range.value); });
      num.addEventListener('change', function(){ set(num.value); });
      inputs[r[0]] = { range:range, num:num, row:row };
      row.appendChild(lab); row.appendChild(range); row.appendChild(num); rows.appendChild(row);
    });
    body.addEventListener('change', fill);
    $('pose-all').addEventListener('click', function(){ scope = 'all'; fill(); });
    $('pose-clip').addEventListener('click', function(){ scope = 'clip'; fill(); });
    $('pose-clear').addEventListener('click', function(){
      var c = POSE.clips[current];
      if(c){ delete c[body.value]; if(!Object.keys(c).length) delete POSE.clips[current]; }
      apply(); fill(); show(); save(); status(label(current) + ' takes the body\'s posture again.');
    });
    $('pose-copy').addEventListener('click', function(){
      show();
      var done = function(){ status('Copied: paste it to Claude, or over data/posture.json\'s "bodies" and "clips".'); };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt.value).then(done, function(){ txt.select(); status('Selected: copy it with Ctrl+C.'); });
      else { txt.select(); status('Selected: copy it with Ctrl+C.'); }
    });
    $('pose-apply').addEventListener('click', function(){
      try {
        POSE = clean(JSON.parse(txt.value));
        fill(); apply(); show(); save(); status('Applied.');
      } catch(e){ status('Not valid JSON: ' + e.message); }
    });
    $('pose-reset').addEventListener('click', function(){
      POSE = clean(poseFile());
      try { localStorage.removeItem(POSE_KEY); } catch(e){}
      fill(); apply(); show(); status('Back to data/posture.json.');
    });
    // a new clip: the sliders follow it in "This clip"
    poseClip = fill; poseApply = apply;
    fill(); show(); apply();
  }
  var poseClip = function(){}, poseApply = function(){};

  /* ---- reviews ---- */
  var reviews = {}, db = null, local = true, KEY = 'kchar.animlab.reviews';
  try { reviews = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ reviews = {}; }
  function status(t){ $('rv-status').textContent = t; }
  function connect(){
    if(!(window.claude && window.claude.use)){ status('Marks are kept in this browser only.'); return; }
    window.claude.use('db').then(function(d){
      if(!d){ status('Marks are kept in this browser only (sign in to share them).'); return; }
      db = d; local = false;
      d.collection('reviews').onSnapshot(function(snap){
        var next = {};
        snap.docs.forEach(function(doc){ next[doc.id] = doc.data(); });
        Object.keys(pending).forEach(function(k){ if(pending[k]) next[k] = reviews[k]; });   // keep a note being typed
        reviews = next;
        ledger(); showCurrent(true);
        status('Marks are shared: anyone who opens this lab sees them.');
      }, function(e){ status('The shared marks did not load (' + e.code + '); new marks stay in this browser.'); db = null; local = true; });
    }, function(){ status('Marks are kept in this browser only.'); });
  }
  var pending = {};
  function save(clip){
    var r = reviews[clip];
    if(local || !db){
      try { localStorage.setItem(KEY, JSON.stringify(reviews)); status('Saved in this browser.'); } catch(e){ status('Not saved: this browser blocks storage here.'); }
      return;
    }
    pending[clip] = true;
    var body = JSON.parse(JSON.stringify(r));
    (r && (r.verdict || r.note || (r.bodies && r.bodies.length)) ? db.collection('reviews').doc(clip).set(body) : db.collection('reviews').doc(clip).delete())
      .then(function(){ pending[clip] = false; status('Saved.'); },
            function(e){ pending[clip] = false; status(e.code === 'invalid_argument' ? 'Not saved: this lab is view-only for you.' : 'Not saved (' + e.code + '). Try again in a moment.'); });
  }
  function mark(patch){
    var r = Object.assign({ verdict:null, note:'', bodies:[] }, reviews[current] || {}, patch);
    r.clip = current; r.label = label(current); r.prop = held.R || held.L || null; r.at = new Date().toISOString();
    reviews[current] = r;
    save(current);
    ledger(); showCurrent(true);
  }
  var noteTimer = null;
  function flushNote(){
    if(noteTimer){ clearTimeout(noteTimer); noteTimer = null; mark({ note:$('rv-note').value }); }
  }

  function showCurrent(keepNote){
    var r = reviews[current] || {}, m = META[current] || {}, g = groupOf(current), info = INFO[current] || {};
    $('now-clip').textContent = $('rv-title').textContent = label(current);
    var bits = [g ? g.label : '', m.loop === false ? 'one-shot, repeating here' : 'loop', (m.seconds || 0).toFixed(2) + ' s'];
    if(m.root_speed){ var v = Math.hypot(m.root_speed[0], m.root_speed[2]); if(v > 0.05) bits.push(v.toFixed(2) + ' m/s'); }
    $('now-meta').textContent = bits.join(' · ');
    var hold = held.R || held.L;
    $('rv-meta').textContent = bits.join(' · ') + (hold ? ' · ' + (PROP[hold] || { label:hold }).label.toLowerCase() + (held.both ? ' in both hands' : '') : '');
    Array.prototype.forEach.call(document.querySelectorAll('.verdicts button'), function(b){ b.setAttribute('aria-pressed', r.verdict === b.dataset.v); });
    Array.prototype.forEach.call(document.querySelectorAll('#rv-who button'), function(b){ b.setAttribute('aria-pressed', (r.bodies || []).indexOf(b.dataset.id) >= 0); });
    figs.forEach(function(s){ s.tag.classList.toggle('flag', (r.bodies || []).indexOf(s.c.id) >= 0); });
    if(!keepNote || document.activeElement !== $('rv-note')) $('rv-note').value = r.note || '';
    poseClip();
    Array.prototype.forEach.call(document.querySelectorAll('.clip'), function(b){ b.setAttribute('aria-current', b.dataset.clip === current); });
    var on = document.querySelector('.clip[aria-current="true"]');
    if(on && !keepNote) on.scrollIntoView({ block:'nearest' });
  }

  function visibleOrder(){
    var q = $('find').value.trim().toLowerCase(), show = $('show').value;
    return ORDER.filter(function(n){
      var v = (reviews[n] && reviews[n].verdict) || 'none';
      return (!q || label(n).toLowerCase().indexOf(q) >= 0 || n.indexOf(q) >= 0) && (show === 'all' || show === v);
    });
  }
  function ledger(){
    var box = $('ledger'), vis = visibleOrder(), set = {};
    vis.forEach(function(n){ set[n] = 1; });
    box.innerHTML = '';
    GROUPS.forEach(function(g){
      var list = g.clips.filter(function(n){ return set[n]; });
      if(!list.length) return;
      var done = g.clips.filter(function(n){ return reviews[n] && reviews[n].verdict; }).length;
      var h = document.createElement('h3'); h.innerHTML = g.label + ' <small>' + done + ' / ' + g.clips.length + '</small>';
      box.appendChild(h);
      list.forEach(function(n){
        var r = reviews[n] || {}, m = META[n] || {}, b = document.createElement('button');
        b.className = 'clip'; b.dataset.clip = n; b.setAttribute('aria-current', n === current);
        b.innerHTML = '<i class="' + (r.verdict || '') + '"></i><span>' + label(n) + (m.loop === false ? ' <em>· once</em>' : '') + (r.note ? ' ✎' : '') + (posedClip(n) ? ' <em title="has a posture of its own">· posture</em>' : '') +
          '</span><small>' + (m.seconds || 0).toFixed(1) + ' s</small>';
        b.title = r.note || '';
        b.addEventListener('click', function(){ play(n); });
        box.appendChild(b);
      });
    });
    if(!vis.length){ var p = document.createElement('p'); p.className = 'keys'; p.textContent = 'No clip matches.'; box.appendChild(p); }
    var c = { good:0, fix:0, bad:0 };
    ORDER.forEach(function(n){ var v = reviews[n] && reviews[n].verdict; if(c[v] !== undefined) c[v]++; });
    var n = ORDER.length, done = c.good + c.fix + c.bad;
    $('tally').textContent = done + ' of ' + n + ' reviewed · ' + c.good + ' good · ' + c.fix + ' need work · ' + c.bad + ' broken';
    var spans = document.querySelectorAll('.progress span');
    spans[0].style.width = (c.good / n * 100) + '%'; spans[1].style.width = (c.fix / n * 100) + '%'; spans[2].style.width = (c.bad / n * 100) + '%';
  }

  function step(d){
    var vis = visibleOrder(), i = vis.indexOf(current);
    var n = vis[i < 0 ? 0 : Math.max(0, Math.min(vis.length - 1, i + d))];
    if(n && n !== current) play(n);
  }

  /* ---- controls ---- */
  var scrubbing = false;
  function bind(){
    DRESS.forEach(function(x){ var o = document.createElement('option'); o.value = x.id; o.textContent = x.label; $('dress').appendChild(o); });
    $('dress').addEventListener('change', function(){
      dress = $('dress').value;
      $('loading').hidden = false; $('loading').textContent = 'Dressing the six…';
      Promise.all(figs.map(function(x){ return x.f.apply(record(x.c)); })).then(function(){ $('loading').hidden = true; figs.forEach(function(x){ x.f.update(0); }); },
        function(e){ $('loading').textContent = 'A piece failed to load: ' + e.message; });
    });
    $('cloth').addEventListener('click', function(){
      var on = $('cloth').getAttribute('aria-pressed') !== 'true';
      $('cloth').setAttribute('aria-pressed', on);
      figs.forEach(function(x){ x.f.cloth = on; x.f.update(0); });
    });
    wirePose();
    $('play').addEventListener('click', function(){ setPaused(!paused); });
    $('restart').addEventListener('click', function(){ setTime(0); });
    $('speed').addEventListener('change', function(){ speed = +$('speed').value; });
    var sc = $('scrub');
    sc.addEventListener('input', function(){ scrubbing = true; setPaused(true); setTime(+sc.value / 1000 * duration()); });
    sc.addEventListener('change', function(){ scrubbing = false; });
    $('mods-pick').addEventListener('change', function(){
      Promise.all(figs.map(function(x){ return x.f.apply(record(x.c)); })).then(function(){ return holdFor(current); }).then(function(){ figs.forEach(function(s){ s.f.update(0); }); showCurrent(true); });
    });
    $('hold-low').addEventListener('change', function(){ holdFor(current).then(function(){ figs.forEach(function(s){ s.f.update(0); }); showCurrent(true); }); });
    $('hold-pick').addEventListener('change', function(){ holdChoice = $('hold-pick').value; holdFor(current).then(function(){ figs.forEach(function(s){ s.f.update(0); }); showCurrent(true); }); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-who]'), function(b){
      b.addEventListener('click', function(){
        who = b.dataset.who; lineup();
        Array.prototype.forEach.call(document.querySelectorAll('[data-who]'), function(o){ o.setAttribute('aria-pressed', o === b); });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-yaw]'), function(b){
      b.addEventListener('click', function(){
        cam.want.yaw = +b.dataset.yaw;
        Array.prototype.forEach.call(document.querySelectorAll('[data-yaw]'), function(o){ o.setAttribute('aria-pressed', o === b); });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.verdicts button'), function(b){
      b.addEventListener('click', function(){ var r = reviews[current] || {}; mark({ verdict:r.verdict === b.dataset.v ? null : b.dataset.v }); });
    });
    var whoBox = $('rv-who');
    CAST.forEach(function(c){
      var b = document.createElement('button'); b.dataset.id = c.id; b.textContent = c.short; b.title = c.label; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function(){
        var list = ((reviews[current] || {}).bodies || []).slice(), i = list.indexOf(c.id);
        if(i >= 0) list.splice(i, 1); else list.push(c.id);
        mark({ bodies:list });
      });
      whoBox.appendChild(b);
    });
    $('rv-note').addEventListener('input', function(){
      clearTimeout(noteTimer);
      noteTimer = setTimeout(function(){ noteTimer = null; mark({ note:$('rv-note').value }); }, 700);
    });
    $('rv-note').addEventListener('blur', flushNote);
    $('find').addEventListener('input', ledger);
    $('show').addEventListener('change', ledger);
    $('next-open').addEventListener('click', function(){
      var i = ORDER.indexOf(current);
      for(var k = 1; k <= ORDER.length; k++){
        var n = ORDER[(i + k) % ORDER.length];
        if(!(reviews[n] && reviews[n].verdict)){ play(n); return; }
      }
      status('Every clip has a mark.');
    });
    document.addEventListener('keydown', function(e){
      var t = e.target.tagName;
      if(t === 'TEXTAREA' || t === 'INPUT' || t === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if(e.key === 'ArrowDown'){ e.preventDefault(); step(1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); step(-1); }
      else if(e.key === ' '){ e.preventDefault(); setPaused(!paused); }
      else if(e.key === '1' || e.key === '2' || e.key === '3'){ var v = ['good', 'fix', 'bad'][+e.key - 1], r = reviews[current] || {}; mark({ verdict:r.verdict === v ? null : v }); }
      else if(e.key === ',' || e.key === '.'){
        var a = lead1(); if(!a) return;
        setPaused(true); var d = duration();
        setTime(((a.time % d) + (e.key === '.' ? 1 : -1) / 30 + d) % d);
      }
    });
  }

  bind(); ledger(); showCurrent(); connect(); boot();
})();
