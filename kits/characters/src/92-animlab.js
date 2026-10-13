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
    mpfb_giant:  { hair:'short04', beard:null, armour:{ legs:'voth_m_peasant_maxtlatl', feet:'dalab_m_noble_sandals' },
                   skin:'#6a8a4c', hair_color:'#1a1712', eye_color:'#6e5a2e', dye:{ legs:'#b8443a' } }
  };
  var BUILD = {
    giant:   { label:'Four arms', morph:{ muscle:0.7, weight:0.25 } },
    heavy:   { label:'Four arms, heavy', morph:{ height:-0.4, weight:0.8, muscle:1 } },
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
  // the Giants of Dalab (tools/giant.py), on their own filter: two four-armed temple guards and a two-armed patrol
  if(D.bodies.mpfb_giant) [['giant', 4], ['heavy', 4], ['patrol', 2]].forEach(function(g){
    CAST.push({ id:'g-' + g[0], sex:'g', body:'mpfb_giant', build:g[0], arms:g[1], label:'Giant · ' + BUILD[g[0]].label.toLowerCase(), short:'G ' + g[0] });
  });
  // the clothes the six wear: plain (OUTFIT), or a people's outfit for one tier (data/peoples.json outfits)
  var DRESS = [];
  (D.peoples || []).forEach(function(p){
    (p.tiers || []).forEach(function(t){
      if(p.outfits && (p.outfits.male || {})[t[0]]) DRESS.push({ id:p.id + '.' + t[0], label:p.name + ' ' + ((p.tier_labels || {})[t[0]] || t[0]).toLowerCase(), p:p, tier:t[0] });
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
    if(set) ['head', 'torso', 'legs', 'feet'].forEach(function(sl){ r.armour[sl] = set[sl] && kit.items.some(function(it){ return it.id === set[sl]; }) ? set[sl] : null; });
    r.morph = JSON.parse(JSON.stringify(BUILD[c.build].morph));
    if(c.arms) r.arms = c.arms;
    r.ancestry = null;
    return r;
  }

  /* ---- the clips: the body's clip list (skeleton.json), grouped as data/clips.json groups them ---- */
  var META = {}, ORDER = [], INFO = {}, PROP = {};
  (D.props || []).forEach(function(p){ PROP[p.id] = p; });
  KCharFigure.props = PROP;
  ((D.clips && D.clips.clips) || []).forEach(function(c){ INFO[c.key] = c; });
  var lead = D.bodies[CAST[0].body].skeleton.clips;
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
  var renderer, scene, camera, clock = new THREE.Clock(), figs = [], current = 'idle', paused = false, speed = 1;
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
    var key = new THREE.DirectionalLight(0xffe2b8, 0.8); key.position.set(2.5, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -6; key.shadow.camera.right = key.shadow.camera.top = 6;
    key.shadow.bias = -0.0005; scene.add(key);
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
    }); })).then(function(){ $('loading').hidden = true; return play(current); }, function(e){ $('loading').textContent = 'A piece failed to load: ' + e.message; });
    window._lab = { figs:figs.map(function(x){ return x.f; }), ready:ready, play:play, reviews:function(){ return reviews; }, setTime:setTime, cam:cam };
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

  var tv = new THREE.Vector3();
  function frame(){
    var dt = Math.min(0.05, clock.getDelta()), step = paused ? 0 : dt * speed;
    figs.forEach(function(s){ if(s.f.group.visible) s.f.update(step); });
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
  function play(name){
    flushNote();
    current = name;
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
        b.innerHTML = '<i class="' + (r.verdict || '') + '"></i><span>' + label(n) + (m.loop === false ? ' <em>· once</em>' : '') + (r.note ? ' ✎' : '') +
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
    $('play').addEventListener('click', function(){ setPaused(!paused); });
    $('restart').addEventListener('click', function(){ setTime(0); });
    $('speed').addEventListener('change', function(){ speed = +$('speed').value; });
    var sc = $('scrub');
    sc.addEventListener('input', function(){ scrubbing = true; setPaused(true); setTime(+sc.value / 1000 * duration()); });
    sc.addEventListener('change', function(){ scrubbing = false; });
    $('hold-low').hidden = !D.bodies.mpfb_giant;
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
