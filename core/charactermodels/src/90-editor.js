/* ==== the Cosmetic Lab: stage, camera, panel. [web] (host code; Godot builds its own UI over kchar.gd) ====
   One figure and every cosmetic choice: the future player character editor, and strangers in bulk for NPCs
   (KCHAR.crowd). The clips are tried on six bodies at once in the Animation Lab (92-animlab.js).
   KCHAR_DATA (build.py): { sliders, bodies: { male: { skeleton, kit }, female: {...} } }. The pieces are fetched when a
   record needs them: pieces/<key>.txt (a base64 GLB), or KCHAR_GLB[key] when build.py inlined them. Chip pictures are
   thumbs/<body>.png, an atlas of tools/thumbs.mjs's thumbnails (build.py pack_thumbs). Everything the panel changes goes through one record and fig.apply().
   A MakeHuman body (kit.style 'mpfb') morphs: its Body and Face tabs are kit.morph's sliders (record.morph) and the
   ancestry triple; its Head tab picks a people (data/peoples.json), skin tone, hair, hair colour and beard.
*/
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };
  KCharFigure.posture = (D.posture && D.posture.bodies) || {};     // data/posture.json, before any figure
  KCharFigure.postureClips = (D.posture && D.posture.clips) || {};
  KCharFigure.postureFrame = (D.posture && D.posture.frame) || 'figure';
  KCharFigure.fur = D.fur || null;                                   // data/fur.json: garments' fur shells
  KCharFigure.clipData = {}; ((D.clips && D.clips.clips) || []).forEach(function(c){ KCharFigure.clipData[c.key] = c; });   // data/clips.json
  KCharFigure.faces = (D.clips && D.clips.faces) || {};
  var SLOT_LABEL = { head:'Headgear', torso:'Torso & arms', legs:'Legs', feet:'Feet' };
  var BASE_HEIGHT = { male:1.75, female:1.68, mpfb_male:1.78, mpfb_female:1.66 };
  var BODY_LABEL = { male:'Meshy male', female:'Meshy female', mpfb_male:'Man', mpfb_female:'Woman', mpfb_giant:'Giant' };
  var rec, fig, renderer, scene, camera, clock = new THREE.Clock(), body = 'male';
  var start = {
    male:   { body:'male', head:'base_m', hair:'hair_m_long', beard:null, armour:{ torso:'bronze', legs:'scout', feet:'bone' }, sliders:{}, dye:{} },
    female: { body:'female', head:'base_f', hair:'hair_f_braids', beard:null, armour:{ torso:'f_hide', legs:'f_scout', feet:'f_bone' }, sliders:{}, dye:{} }
  };
  start.mpfb_male = { body:'mpfb_male', hair:'short02', beard:'wdg_scruffy_beard', armour:{ torso:'mindfront_kimono', legs:'toigo_harem_pants', feet:'culturalibre_hero_boots_1' },
                      sliders:{}, morph:{}, ancestry:null, skin:'#c99a74', hair_color:'#3a2a1e', eye_color:'#5a3a22', people:null, dye:{} };
  start.mpfb_female = { body:'mpfb_female', hair:'braid01', beard:null, armour:{ torso:'toigo_bodice-style_top', legs:'toigo_long_full_skirt', feet:'grinsegold_female_pirate_boots' },
                        sliders:{}, morph:{}, ancestry:null, skin:'#d9b294', hair_color:'#2c2019', eye_color:'#4e6a80', people:null, dye:{} };
  // a Giant of Dalab (tools/giant.py): the temple guard, four-armed, in the god's harness, loincloth and sandals
  start.mpfb_giant = { body:'mpfb_giant', hair:'short04', beard:null, armour:{ torso:'giant_dalab_m_harness4', legs:'voth_m_peasant_maxtlatl', feet:'dalab_m_noble_sandals', head:null },
                       sliders:{}, morph:{ muscle:0.7, weight:0.25 }, ancestry:null, skin:'#6a8a4c', hair_color:'#1a1712', eye_color:'#6e5a2e',
                       people:'giants', mods:['mod_arms_flesh'], dye:{ legs:'#b8443a' } };
  /* the Lizardman test record (a spike, tools/nonhuman.py; LORE 6.20): a tail and a reptile's head on the body, olive
     skin and amber eyes, no hair, bare above the trousers so the tail shows. Not a people: no stranger is drawn with
     it. ?lizard in the page's address starts each body with it; the Body mods section has a chip for it */
  var LIZARD = { mods:['mod_tail', 'mod_head_lizard'], skin:'#7d8a45', eye_color:'#c89020', hair:null, beard:null };
  function lizard(r, kit){
    if(!kit.items.some(function(it){ return it.id === 'mod_head_lizard'; })) return r;
    Object.keys(LIZARD).forEach(function(k){ r[k] = JSON.parse(JSON.stringify(LIZARD[k])); });
    r.armour = Object.assign({}, r.armour, { head:null, torso:null });
    return r;
  }
  var LIZARD_START = /[?&#]lizard\b/.test(location.search + location.hash);
  /* the Frogman test record (a frog's head on the body, tools/amphibian.py): frog green, no hair, bare above the
     trousers. ?frog in the page's address starts each body with it */
  var FROG = { mods:['mod_head_frog'], skin:'#5f8a36', hair:null, beard:null };
  function frog(r, kit){
    if(!kit.items.some(function(it){ return it.id === 'mod_head_frog'; })) return r;
    Object.keys(FROG).forEach(function(k){ r[k] = JSON.parse(JSON.stringify(FROG[k])); });
    r.armour = Object.assign({}, r.armour, { head:null, torso:null });
    return r;
  }
  var FROG_START = /[?&#]frog\b/.test(location.search + location.hash);
  var saved = {};
  function figScale(){ return fig ? fig.scale || 1 : 1; }

  /* ---- pieces ---- */
  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  // build.py gzips each piece before base64: unzip it in the browser (a plain one passes through)
  function gunzip(buf){
    var u = new Uint8Array(buf);
    if(u[0] !== 0x1f || u[1] !== 0x8b) return Promise.resolve(buf);
    return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  // a piece's file: its GLB, and on a second line its morph deltas (build.py); key + '.morph' asks for the second
  var texts = {};
  function fetchPiece(key){
    var base = key.replace(/\.morph$/, ''), line = base === key ? 0 : 1;
    if(!texts[base]) texts[base] = fetch('pieces/' + base + '.txt').then(function(r){ if(!r.ok) throw new Error(base + ': ' + r.status); return r.text(); });
    return texts[base].then(function(t){
      var s = t.split('\n')[line];
      if(s) return gunzip(b64(s));
      // a piece published before the two were one file: its deltas in a file of their own
      return fetch('pieces/' + key + '.txt').then(function(r){ if(!r.ok) throw new Error(key + ': ' + r.status); return r.text(); }).then(b64).then(gunzip);
    });
  }
  var cache = {};
  function load(key){
    if(!cache[key]){
      var bytes = (typeof KCHAR_GLB !== 'undefined' && KCHAR_GLB[key]) ? Promise.resolve(b64(KCHAR_GLB[key])) :
        fetchPiece(key);
      cache[key] = bytes.then(function(buf){ return new Promise(function(ok, no){ new THREE.GLTFLoader().parse(buf, '', ok, no); }); });
    }
    return cache[key];
  }
  load.raw = function(key){
    return fetchPiece(key);
  };
  /* a chip's picture: its cell of the body's thumbnail atlas (build.py pack_thumbs: thumbs/<body>.png and .json). The
     index is fetched the first time a body's chip asks, and the panel is drawn again when it comes */
  var THUMBS = {};
  function thumb(key, mesh){
    var body = key.split('/')[0], name = key.slice(body.length + 1) + '__' + mesh, t = THUMBS[body];
    if(t === undefined){
      THUMBS[body] = null;
      fetch('thumbs/' + body + '.json').then(function(r){ return r.ok ? r.json() : false; })
        .then(function(j){ THUMBS[body] = j || false; if(j && rec) buildPanel(); }, function(){ THUMBS[body] = false; });
      return null;
    }
    if(!t || t.keys[name] === undefined) return null;
    var i = t.keys[name], c = i % t.cols, r = Math.floor(i / t.cols);
    return { atlas:'thumbs/' + body + '.png', size:t.cols * 100 + '% ' + t.rows * 100 + '%',
             at:(t.cols > 1 ? c / (t.cols - 1) * 100 : 0) + '% ' + (t.rows > 1 ? r / (t.rows - 1) * 100 : 0) + '%' };
  }

  /* ---- stage ---- */
  var cam = { yaw:0.35, pitch:0.1, dist:4.2, ty:0.9, want:{ dist:4.2, ty:0.9, pitch:0.1 }, spin:false, face:false };
  function boot(){
    var stage = $('stage');
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.insertBefore(renderer.domElement, stage.firstChild);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
    // a record's skin and hair colours are albedo: lit about 1:1 where the key light falls square on
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 0.55));
    var key = new THREE.DirectionalLight(0xffe2b8, 0.8); key.position.set(1.6, 3.2, 2.4); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -1.2; key.shadow.camera.right = key.shadow.camera.top = 1.2;
    key.shadow.bias = -0.0003; key.shadow.normalBias = 0.01; scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fc3ff, 0.4); rim.position.set(-2, 2.5, -2.5); scene.add(rim);
    var floor = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.ShadowMaterial({ opacity:0.28 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.64, 64), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.12 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);
    bindStage(renderer.domElement);
    bindPanel();
    window.addEventListener('resize', resize); resize();
    requestAnimationFrame(frame);
    setBody(D.bodies.mpfb_male ? 'mpfb_male' : Object.keys(D.bodies)[0]);
  }

  function setBody(b){
    if(rec) saved[body] = rec;
    body = b;
    if(fig) fig.dispose();
    fig = new KCharFigure(D.bodies[b], D.sliders, load);
    scene.add(fig.group);
    rec = saved[b] || JSON.parse(JSON.stringify(start[b] || KCHAR.blank(D.bodies[b].kit)));
    if(!saved[b] && LIZARD_START) lizard(rec, D.bodies[b].kit);
    if(!saved[b] && FROG_START) frog(rec, D.bodies[b].kit);
    Object.keys(D.bodies).forEach(function(x){ $('body-' + x).setAttribute('aria-pressed', x === b); });
    buildPanel();
    view(cam.face);                 // a giant's camera stands further back
    var clip = document.querySelector('[data-clip][aria-pressed="true"]');
    $('loading').hidden = false;
    var done = apply().then(function(){
      $('loading').hidden = true;
      return fig.play(clip ? clip.dataset.clip || null : 'idle');
    });
    window._kchar = { fig:fig, ready:done, record:function(){ return rec; }, cam:cam,
                      set:function(r){ rec = r; buildPanel(); return apply(); }, body:setBody };
    return done;
  }

  function resize(){
    var r = $('stage').getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
  }

  var hv = new THREE.Vector3();
  function frame(){
    var dt = Math.min(0.05, clock.getDelta());
    if(fig && !(window._kchar && window._kchar.still)) fig.update(dt);   // still: tools/shots.py steps the figure itself
    if(cam.spin) cam.yaw += dt * 0.5;
    if(cam.face && fig){ fig.headWorld(hv); cam.want.ty = hv.y + 0.06; }
    else if(fig) cam.want.ty = 0.9 * fig.pose.root * figScale();
    var k = 1 - Math.pow(0.001, dt);
    cam.dist += (cam.want.dist - cam.dist) * k; cam.ty += (cam.want.ty - cam.ty) * k; cam.pitch += (cam.want.pitch - cam.pitch) * k;
    var cp = Math.cos(cam.pitch);
    var tx = cam.at ? cam.at[0] : 0, tz = cam.at ? cam.at[2] : 0, ty = cam.at ? cam.at[1] : cam.ty;   // cam.at: verify.py's close-ups
    camera.position.set(tx + Math.sin(cam.yaw) * cp * cam.dist, ty + Math.sin(cam.pitch) * cam.dist, tz + Math.cos(cam.yaw) * cp * cam.dist);
    camera.lookAt(tx, ty, tz);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function bindStage(el){
    var drag = null;
    el.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function(e){
      if(!drag) return;
      cam.yaw -= (e.clientX - drag.x) * 0.008;
      cam.want.pitch = Math.max(-0.4, Math.min(0.9, cam.want.pitch + (e.clientY - drag.y) * 0.005));
      drag = { x:e.clientX, y:e.clientY };
    });
    el.addEventListener('pointerup', function(){ drag = null; });
    el.addEventListener('wheel', function(e){
      e.preventDefault();
      cam.want.dist = Math.max(0.45, Math.min(5 * figScale(), cam.want.dist * Math.exp(e.deltaY * 0.001)));
    }, { passive:false });
  }

  function view(face){
    cam.face = face;
    cam.want.dist = (face ? 0.8 : 4.2) * figScale(); cam.want.pitch = face ? 0.02 : 0.1;
    $('cam-body').setAttribute('aria-pressed', !face); $('cam-face').setAttribute('aria-pressed', face);
  }

  /* ---- panel ---- */
  function chips(box, items, current, onPick, compact){
    var grid = document.createElement('div'); grid.className = 'chips' + (compact ? ' tags' : '');
    items.forEach(function(it){
      var b = document.createElement('button'); b.className = 'chip'; b.id = it.domId;
      b.setAttribute('aria-pressed', it.id === current);
      b.innerHTML = (it.img ? '<i class="th" style="background-image:url(' + it.img.atlas + ');background-size:' + it.img.size +
                     ';background-position:' + it.img.at + '"></i>' : compact ? '' : '<span class="none"></span>') + '<span>' + it.name + '</span>';
      b.addEventListener('click', function(){ onPick(it.id); });
      grid.appendChild(b);
    });
    box.appendChild(grid);
  }

  function section(page, title, small){
    var s = document.createElement('div'); s.className = 'slot';
    s.innerHTML = '<h3>' + title + ' <small>' + (small || '') + '</small></h3>';
    page.appendChild(s);
    return s;
  }

  function dyeRow(box, slot){
    var row = document.createElement('div'); row.className = 'dye';
    row.innerHTML = '<label for="dye-' + slot + '">Dye</label><input type="color" id="dye-' + slot + '" value="' + ((rec.dye && rec.dye[slot]) || '#ffffff') + '"><button id="undye-' + slot + '">Clear</button>';
    row.querySelector('input').addEventListener('input', function(e){ rec.dye[slot] = e.target.value; apply(); });
    row.querySelector('button').addEventListener('click', function(){ delete rec.dye[slot]; apply(); buildPanel(); });
    box.appendChild(row);
  }

  var sliderEls = {};
  function buildPanel(){
    var kit = D.bodies[body].kit;
    var gear = $('page-gear'), headp = $('page-head');
    gear.innerHTML = ''; headp.innerHTML = '';
    if(kit.style === 'mpfb'){ buildMpfb(kit, gear, headp); buildSliders(); return; }
    ['torso', 'legs', 'feet'].forEach(function(slot){
      var a = kit.armour.filter(function(x){ return x.slots[slot]; });
      var cur = rec.armour[slot] || null, it = a.filter(function(x){ return x.id === cur; })[0];
      var s = section(gear, SLOT_LABEL[slot], it ? it.name : 'None');
      chips(s, [{ id:null, name:'None', domId:'chip-' + slot + '-none' }].concat(a.map(function(x){
        return { id:x.id, name:x.name, img:thumb(KCHAR.key(x.glb), slot), domId:'chip-' + slot + '-' + x.id };
      })), cur, function(id){ rec.armour[slot] = id; apply(); buildPanel(); });
      dyeRow(s, slot);
    });
    var gh = document.createElement('p'); gh.className = 'hint';
    gh.textContent = 'Armour sits over the base body in layers: boots, then trousers, then the torso. Gloves come with the torso piece that has them. An empty slot shows the base body.';
    gear.appendChild(gh);

    var head = KCHAR.headOf(rec, kit);
    var hs = section(headp, 'Head', head.name);
    chips(hs, kit.heads.map(function(h){
      return { id:h.id, name:h.name, img:thumb(KCHAR.key(h.glb), 'head'), domId:'chip-head-' + h.id };
    }), head.id, function(id){ rec.head = id; apply(); buildPanel(); });
    ['hair', 'beard'].forEach(function(kind){
      if(!kit.hair.some(function(h){ return h.kind === kind; })) return;
      var list = kit.hair.filter(function(h){ return h.kind === kind && h.head === head.id; });
      var cur = rec[kind] || null, it = list.filter(function(x){ return x.id === cur; })[0];
      var s = section(headp, kind === 'hair' ? 'Hair' : 'Beard', KCHAR.takesHair(head) ? (it ? it.name : 'None') : '');
      if(!KCHAR.takesHair(head)){
        var p = document.createElement('p'); p.className = 'hint';
        p.textContent = 'This head comes with its own. Pick a bald head (Base or Styv) to choose ' + (kind === 'hair' ? 'hair.' : 'a beard.');
        s.appendChild(p); return;
      }
      chips(s, [{ id:null, name:'None', domId:'chip-' + kind + '-none' }].concat(list.map(function(h){
        return { id:h.id, name:h.name, img:thumb(KCHAR.key(h.glb), kind), domId:'chip-' + kind + '-' + h.id };
      })), cur, function(id){ rec[kind] = id; apply(); buildPanel(); });
      if(kind === 'hair') dyeRow(s, 'hair');
    });

    buildSliders();
  }

  /* a MakeHuman body: library items per slot, MPFB's own fitting; the head is the base's, shaped by the morphs */
  var PEOPLE = {}; (D.peoples || []).forEach(function(p){ PEOPLE[p.id] = p; });
  var SKIN_ANY = ['#f3d9c6', '#e2b897', '#c99a74', '#a8764f', '#835735', '#5e3c25', '#3e271a'];
  var EYES_ANY = ['#1e140c', '#3b2414', '#5a3a22', '#7a5a2a', '#4a5a3a', '#4e6a80', '#6a7a86', '#8a3a1c'];
  var HAIR_ANY = ['#e6d3a3', '#c9a35a', '#a0703d', '#8e4f2a', '#5a3a22', '#2c2019', '#141110', '#9a9894', '#d8d6d2'];
  function swatches(box, label, id, value, list, set){
    var row = document.createElement('div'); row.className = 'dye swatches';
    row.innerHTML = '<label for="' + id + '">' + label + '</label><input type="color" id="' + id + '" value="' + value + '">';
    list.forEach(function(c){
      var b = document.createElement('button'); b.className = 'sw'; b.title = c; b.style.background = c;
      b.setAttribute('aria-label', label + ' ' + c);
      b.addEventListener('click', function(){ set(c); row.querySelector('input').value = c; });
      row.appendChild(b);
    });
    row.querySelector('input').addEventListener('input', function(e){ set(e.target.value); });
    box.appendChild(row);
  }
  // the clothing pickers show one wardrobe: null every item, 'library' MakeHuman's own (no culture), or a people's
  // (kit item culture); the item worn stays offered whatever the wardrobe
  var wardrobe = null;
  function inWardrobe(x){ return !wardrobe || (wardrobe === 'library' ? !x.culture : x.culture === wardrobe); }
  function wardrobeChips(kit, gear){
    var have = {}; kit.items.forEach(function(x){ if(x.culture) have[x.culture] = true; });
    var list = [{ id:null, name:'All' }, { id:'library', name:'Library' }].concat((D.peoples || []).filter(function(p){ return have[p.id]; })
      .map(function(p){ return { id:p.id, name:p.name }; }));
    var cur = list.filter(function(x){ return x.id === wardrobe; })[0];
    var s = section(gear, 'Wardrobe', cur ? cur.name : 'All');
    chips(s, list.map(function(x){ return { id:x.id, name:x.name, domId:'chip-wardrobe-' + (x.id || 'all') }; }), wardrobe, function(id){
      wardrobe = id; buildPanel();
    }, true);
  }
  /* body mods (tools/mods.py): a genetic or cybernetic second pair of arms, rib gills; on or off, one pair of arms at
     a time. With four arms the torso picker offers only four-armed tops (KCHAR.fits), and a top that no longer fits
     comes off */
  function modChips(kit, gear){
    var all = kit.items.filter(function(x){ return x.slot === 'mods'; });
    if(!all.length) return;
    var on = KCHAR.mods(rec, kit).map(function(m){ return m.id; });
    var s = section(gear, 'Body mods', on.length ? on.length + ' worn' : 'None');
    var grid = document.createElement('div'); grid.className = 'chips tags';
    if(all.some(function(m){ return m.id === 'mod_head_lizard'; })){
      var lz = document.createElement('button'); lz.className = 'chip'; lz.id = 'chip-lizardman';
      lz.innerHTML = '<span>Lizardman <small>test</small></span>';
      lz.title = 'A tail and a reptile head, olive skin, no hair (a test record, not a people)';
      lz.addEventListener('click', function(){ lizard(rec, kit); apply(); buildPanel(); });
      grid.appendChild(lz);
    }
    if(all.some(function(m){ return m.id === 'mod_head_frog'; })){
      var fg = document.createElement('button'); fg.className = 'chip'; fg.id = 'chip-frogman';
      fg.innerHTML = '<span>Frogman <small>test</small></span>';
      fg.title = 'A frog\'s head, green skin, no hair (a test record, not a people)';
      fg.addEventListener('click', function(){ frog(rec, kit); apply(); buildPanel(); });
      grid.appendChild(fg);
    }
    all.forEach(function(m){
      var b = document.createElement('button'); b.className = 'chip'; b.id = 'chip-mod-' + m.id;
      b.setAttribute('aria-pressed', on.indexOf(m.id) >= 0);
      b.innerHTML = '<span>' + m.name + ' <small>' + (m.kind || '') + (m.test ? ', test' : '') + '</small></span>';
      b.addEventListener('click', function(){
        var cur = KCHAR.mods(rec, kit);
        rec.mods = on.indexOf(m.id) >= 0 ? cur.filter(function(x){ return x.id !== m.id; }).map(function(x){ return x.id; })
                                          : cur.filter(function(x){ return x.group !== m.group; }).map(function(x){ return x.id; }).concat([m.id]);
        var top = rec.armour.torso && kit.items.filter(function(it){ return it.id === rec.armour.torso; })[0];
        if(top && !KCHAR.fits(top, rec, kit)) rec.armour.torso = null;
        apply(); buildPanel();
      });
      grid.appendChild(b);
    });
    s.appendChild(grid);
  }
  function itemChips(page, kit, slot, title){
    var worn = (slot === 'hair' || slot === 'beard') ? rec[slot] : rec.armour[slot];
    var list = kit.items.filter(function(x){ return x.slot === slot && (slot === 'hair' || slot === 'beard' || x.id === worn || inWardrobe(x)) && KCHAR.fits(x, rec, kit); });
    if(!list.length) return null;
    var cur = (slot === 'hair' || slot === 'beard') ? rec[slot] : rec.armour[slot];
    var it = list.filter(function(x){ return x.id === cur; })[0];
    var s = section(page, title, it ? it.name : 'None');
    chips(s, [{ id:null, name:'None', domId:'chip-' + slot + '-none' }].concat(list.map(function(x){
      return { id:x.id, name:x.name, img:thumb(KCHAR.key(x.glb), 'all'), domId:'chip-' + slot + '-' + x.id };
    })), cur || null, function(id){ if(slot === 'hair' || slot === 'beard') rec[slot] = id; else rec.armour[slot] = id; apply(); buildPanel(); });
    return s;
  }
  var lookSeed = 1;
  function rollLook(people){
    // a stranger of this people, wearing what this one wears
    var kit = D.bodies[body].kit, r = KCHAR.stranger(lookSeed++ * 104729 + 17, kit, people);
    r.armour = rec.armour; r.dye = rec.dye;
    rec = r;
  }
  // a people's own outfits (data/peoples.json outfits): one chip per tier puts on its torso, legs and feet together
  function outfitChips(kit, gear){
    var sex = kit.body.replace(/^mpfb_/, ''), list = [];
    (D.peoples || []).forEach(function(p){
      var o = p.outfits && p.outfits[sex];
      if(!o || (wardrobe && wardrobe !== p.id)) return;
      (p.tiers || Object.keys(o).map(function(k){ return [k]; })).forEach(function(t){
        if(o[t[0]]) list.push({ id:p.id + '.' + t[0], name:p.name + ' ' + ((p.tier_labels || {})[t[0]] || t[0]).toLowerCase(), set:o[t[0]], p:p });
      });
    });
    if(!list.length) return;
    var has = function(id){ return kit.items.some(function(it){ return it.id === id; }); };
    var cur = list.filter(function(x){ return ['head', 'torso', 'legs', 'feet'].every(function(sl){ return (rec.armour[sl] || null) === (x.set[sl] && has(x.set[sl]) ? x.set[sl] : null); }); })[0];
    var s = section(gear, 'Outfits', cur ? cur.name : 'Mixed');
    chips(s, list.map(function(x){ return { id:x.id, name:x.name, domId:'chip-outfit-' + x.id.replace('.', '-') }; }), cur ? cur.id : null, function(id){
      var x = list.filter(function(y){ return y.id === id; })[0];
      // the tier's mods (a temple guard's second pair of arms) and the people's (gills), before the clothes that fit them
      rec.mods = (x.p.mods || []).concat(x.set.mods || []).filter(has);
      ['head', 'torso', 'legs', 'feet'].forEach(function(sl){ rec.armour[sl] = x.set[sl] && has(x.set[sl]) ? x.set[sl] : null; });
      apply(); buildPanel();
    }, true);
  }
  function buildMpfb(kit, gear, headp){
    modChips(kit, gear);
    wardrobeChips(kit, gear);
    outfitChips(kit, gear);
    ['head', 'torso', 'legs', 'feet'].forEach(function(slot){ var s = itemChips(gear, kit, slot, SLOT_LABEL[slot]); if(s) dyeRow(s, slot); });
    var gh = document.createElement('p'); gh.className = 'hint';
    gh.textContent = 'MakeHuman library clothing: MPFB fitted each piece to this body, it takes its weights from the body, and it hides the skin it covers. Loose pieces (the kimono, harem trousers, skirts) hang from the body. The body and face sliders reshape the clothes with it.';
    gear.appendChild(gh);

    var cur = rec.people && PEOPLE[rec.people];
    var ps = section(headp, 'People', cur ? cur.name : 'Any');
    chips(ps, [{ id:null, name:'Any', domId:'chip-people-any' }].concat((D.peoples || []).map(function(p){
      return { id:p.id, name:p.name, domId:'chip-people-' + p.id };
    })), rec.people || null, function(id){
      rollLook(PEOPLE[id] || null);
      if(id && kit.items.some(function(x){ return x.culture === id; })) wardrobe = id; else if(!id) wardrobe = null;
      apply(); buildPanel(); note(id ? 'A stranger of the ' + PEOPLE[id].name + '. Pick them again for another.' : 'A stranger of no people in particular.'); }, true);
    var pn = document.createElement('p'); pn.className = 'hint';
    pn.textContent = cur ? cur.note + '. Picking a people draws a new face, body, skin and hair from its range; the sliders below can then take it anywhere.' :
      'Pick a people to draw a stranger from its range of skin, hair, ancestry and build (data/peoples.json).';
    ps.appendChild(pn);
    var sk = section(headp, 'Skin tone', '');
    swatches(sk, 'Skin', 'skin-pick', rec.skin || '#d6ad8f', cur ? [0, 0.25, 0.5, 0.75, 1].map(function(u){ return KCHAR.along(cur.skin, u); }) : SKIN_ANY,
             function(c){ rec.skin = c; apply(); });
    var hs = itemChips(headp, kit, 'hair', 'Hair');
    swatches(hs, 'Colour', 'hair-pick', rec.hair_color || '#4a3424', (cur ? cur.hair : HAIR_ANY).concat(['#9a9894', '#d8d6d2']).filter(function(c, i, a){ return a.indexOf(c) === i; }),
             function(c){ rec.hair_color = c; apply(); });
    // a coat (data/fur.json coats): the body furred, in the hair's colour; a record without one has no 'coat'
    var coats = (D.fur && D.fur.coats) || {};
    if(Object.keys(coats).length){
      var cs = section(headp, 'Coat', rec.coat && coats[rec.coat] ? coats[rec.coat].name : 'None');
      chips(cs, [{ id:null, name:'None', domId:'chip-coat-none' }].concat(Object.keys(coats).map(function(id){
        return { id:id, name:coats[id].name, domId:'chip-coat-' + id };
      })), rec.coat || null, function(id){ if(id) rec.coat = id; else delete rec.coat; apply(); buildPanel(); }, true);
      var cn = document.createElement('p'); cn.className = 'hint';
      cn.textContent = 'Fur over the skin, in the hair colour; it stops short of the clothes. The face, palms and soles stay bare.';
      cs.appendChild(cn);
    }
    itemChips(headp, kit, 'beard', 'Beard');
    var es = section(headp, 'Eyes', '');
    swatches(es, 'Eye colour', 'eye-pick', rec.eye_color || '#5a3a22', cur && cur.eyes ? cur.eyes : EYES_ANY, function(c){ rec.eye_color = c; apply(); });
  }

  function vals(){ return D.bodies[body].kit.style === 'mpfb' ? (rec.morph = rec.morph || {}) : rec.sliders; }
  function sliderRow(page, s, min, get, set){
    var row = document.createElement('div'); row.className = 'sl';
    row.innerHTML = '<label for="sl-' + s.id + '">' + s.label + '</label><output for="sl-' + s.id + '"></output>' +
      '<input type="range" id="sl-' + s.id + '" min="' + min + '" max="1" step="0.01" value="0">';
    var inp = row.querySelector('input');
    inp.addEventListener('input', function(){ set(+inp.value); apply(); });
    inp.addEventListener('dblclick', function(){ set(null); apply(); });
    sliderEls[s.id] = { row:row, input:inp, out:row.querySelector('output'), get:get };
    page.appendChild(row);
  }
  var ANC = [{ id:'african', label:'African' }, { id:'asian', label:'Asian' }, { id:'caucasian', label:'Caucasian' }];
  function buildMorphSliders(kit){
    var M = kit.morph;
    ['Body', 'Face'].forEach(function(group){
      var page = $('page-' + group.toLowerCase()); page.innerHTML = '';
      var fh = document.createElement('p'); fh.className = 'hint';
      fh.textContent = group === 'Face' ? 'MakeHuman face targets: each slider blends the whole head (and the hair and beard sitting on it). Double-click a slider to clear it.' :
        'MakeHuman body targets: the skeleton, the clothes and the hair follow. Ancestry blends MakeHuman\'s three reference shapes (it moves the face and build, not the skin tone).';
      page.appendChild(fh);
      if(group === 'Body'){
        var h = document.createElement('h3'); h.textContent = 'Ancestry'; page.appendChild(h);
        ANC.forEach(function(a){
          sliderRow(page, { id:'anc-' + a.id, label:a.label }, 0,
            function(){ var x = rec.ancestry; if(!x) return M.ancestry.base[ANC.indexOf(a)]; var t = ANC.reduce(function(q, b){ return q + (+x[b.id] || 0); }, 0); return t ? (+x[a.id] || 0) / t : 0; },
            function(v){
              if(v === null){ rec.ancestry = null; return; }
              var x = {}; ANC.forEach(function(b, k){ x[b.id] = sliderEls['anc-' + b.id].get(); });
              // set this share, scale the other two to fill the rest
              var rest = 1 - v, others = ANC.filter(function(b){ return b !== a; }), ot = others.reduce(function(q, b){ return q + x[b.id]; }, 0);
              others.forEach(function(b){ x[b.id] = ot > 0 ? x[b.id] / ot * rest : rest / 2; });
              x[a.id] = v; ANC.forEach(function(b){ x[b.id] = Math.round(x[b.id] * 100) / 100; });
              rec.ancestry = x;
            });
        });
        var h2 = document.createElement('h3'); h2.textContent = 'Build'; page.appendChild(h2);
      }
      M.morphs.filter(function(s){ return s.group === group; }).forEach(function(s){
        sliderRow(page, s, s.minus === undefined ? 0 : -1, function(){ return +(vals()[s.id] || 0); },
                  function(v){ if(v) vals()[s.id] = v; else delete vals()[s.id]; });
      });
    });
    syncPanel();
  }
  function buildSliders(){
    sliderEls = {};
    var kit = D.bodies[body].kit;
    if(kit.style === 'mpfb' && kit.morph && kit.morph.morphs) return buildMorphSliders(kit);
    ['Body', 'Face'].forEach(function(group){
      var page = $('page-' + group.toLowerCase()); page.innerHTML = '';
      if(group === 'Face'){
        var fh = document.createElement('p'); fh.className = 'hint';
        fh.textContent = 'The face sliders move ten points on the head you picked. A helmet hides most of what they do.';
        page.appendChild(fh);
      }
      D.sliders.sliders.filter(function(s){ return s.group === group; }).forEach(function(s){
        var row = document.createElement('div'); row.className = 'sl';
        row.innerHTML = '<label for="sl-' + s.id + '">' + s.label + '</label><output for="sl-' + s.id + '"></output>' +
          '<input type="range" id="sl-' + s.id + '" min="-1" max="1" step="0.01" value="0">';
        var inp = row.querySelector('input');
        inp.addEventListener('input', function(){ rec.sliders[s.id] = +inp.value; if(!rec.sliders[s.id]) delete rec.sliders[s.id]; apply(); });
        inp.addEventListener('dblclick', function(){ delete rec.sliders[s.id]; apply(); });
        sliderEls[s.id] = { row:row, input:inp, out:row.querySelector('output'), get:function(){ return +(rec.sliders[s.id] || 0); } };
        page.appendChild(row);
      });
    });
    syncPanel();
  }

  function syncPanel(){
    Object.keys(sliderEls).forEach(function(id){
      var e = sliderEls[id], v = e.get(), anc = id.indexOf('anc-') === 0;
      e.input.value = v; e.out.textContent = anc ? Math.round(v * 100) + '%' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
      e.row.classList.toggle('changed', anc ? !!rec.ancestry : v !== 0);
    });
    $('rec-text').value = JSON.stringify(rec, null, 1);
  }

  var TABS = ['gear', 'head', 'body', 'face', 'record'];
  function bindPanel(){
    TABS.forEach(function(t){
      $('tab-' + t).addEventListener('click', function(){
        TABS.forEach(function(u){ $('tab-' + u).setAttribute('aria-selected', u === t); $('page-' + u).hidden = u !== t; });
        if(t === 'face' || t === 'head') view(true); else if(t === 'body' || t === 'gear') view(false);
      });
    });
    Object.keys(D.bodies).forEach(function(b){
      var btn = document.createElement('button'); btn.id = 'body-' + b; btn.textContent = BODY_LABEL[b] || b;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function(){ if(b !== body) setBody(b); });
      $('bodies').appendChild(btn);
    });
    var pick = $('idle-pick');
    D.bodies[Object.keys(D.bodies)[0]].skeleton.clips.filter(function(c){ return c.group === 'idle'; }).forEach(function(c){
      var o = document.createElement('option'); o.value = c.name; o.textContent = c.label + ' · ' + c.seconds.toFixed(1) + ' s';
      pick.appendChild(o);
    });
    pick.value = 'idle';
    pick.addEventListener('change', function(){ $('clip-idle').dataset.clip = pick.value; $('clip-idle').click(); });
    // the props, for anything that holds one (verify.py tries the clips here; the Animation Lab picks them)
    var PROP = {};
    (D.props || []).forEach(function(p){ PROP[p.id] = p; });
    KCharFigure.props = PROP;
    Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(b){
      b.addEventListener('click', function(){
        fig.play(b.dataset.clip || null);
        Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(o){ o.setAttribute('aria-pressed', o === b); });
      });
    });
    bindBatch();
    $('cam-body').addEventListener('click', function(){ view(false); });
    $('cam-face').addEventListener('click', function(){ view(true); });
    $('spin').addEventListener('click', function(){ cam.spin = !cam.spin; $('spin').setAttribute('aria-pressed', cam.spin); });
    var seed = 1;
    $('rec-random').addEventListener('click', function(){
      var kit = D.bodies[body].kit, people = rec.people && PEOPLE[rec.people];
      rec = kit.style === 'mpfb' ? KCHAR.stranger(seed++ * 7919, kit, people) : KCHAR.random(seed++ * 7919, D.sliders, kit);
      buildPanel(); apply(); note('Rolled stranger #' + (seed - 1) + (people ? ' of the ' + people.name : '') + '.');
    });
    $('rec-reset').addEventListener('click', function(){ rec.sliders = {}; rec.morph = {}; rec.ancestry = null; buildPanel(); apply(); note('Sliders back to the base body.'); });
    $('rec-copy').addEventListener('click', function(){
      var t = $('rec-text');
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
        .then(function(){ note('Copied.'); }, function(){ t.select(); note('Selected: press Ctrl+C or ⌘C to copy.'); });
    });
    $('rec-load').addEventListener('click', function(){
      try {
        var r = JSON.parse($('rec-text').value);
        if(!D.bodies[r.body]) throw new Error('body must be one of ' + Object.keys(D.bodies).join(', '));
        r.armour = r.armour || {}; r.sliders = r.sliders || {}; r.dye = r.dye || {}; r.morph = r.morph || {};
        saved[r.body] = r;
        if(r.body !== body) setBody(r.body); else { rec = r; buildPanel(); apply(); }
        note('Loaded.');
      } catch(e){ note('That record did not load: ' + e.message + '.'); }
    });
  }

  // strangers in bulk (KCHAR.crowd), as records a city loads
  function bindBatch(){
    var pp = $('batch-people');
    pp.innerHTML = '<option value="">Any</option>' + (D.peoples || []).map(function(p){ return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
    var crowd = [];
    $('batch-roll').addEventListener('click', function(){
      var n = Math.max(1, Math.min(1000, +$('batch-count').value || 20)), seed = Math.max(1, +$('batch-seed').value || 1);
      var which = $('batch-body').value, kits = {};
      Object.keys(D.bodies).forEach(function(b){ if(D.bodies[b].kit.style === 'mpfb' && (which === 'both' || which === b)) kits[b] = D.bodies[b].kit; });
      crowd = KCHAR.crowd(seed, n, kits, PEOPLE[pp.value] || null);
      $('batch-text').value = '[\n' + crowd.map(function(r){ return ' ' + JSON.stringify(r); }).join(',\n') + '\n]';
      note(n + ' strangers' + (pp.value ? ' of the ' + PEOPLE[pp.value].name : '') + ', seed ' + seed + '.');
    });
    $('batch-copy').addEventListener('click', function(){
      var t = $('batch-text');
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
        .then(function(){ note('Copied the crowd.'); }, function(){ t.select(); note('Selected: press Ctrl+C or ⌘C to copy.'); });
    });
    $('batch-show').addEventListener('click', function(){
      if(!crowd.length){ note('Draw a crowd first.'); return; }
      var r = JSON.parse(JSON.stringify(crowd[0])); delete r.seed;
      saved[r.body] = r;
      if(r.body !== body) setBody(r.body); else { rec = r; buildPanel(); apply(); }
      note('The first of the crowd (seed ' + crowd[0].seed + ').');
    });
  }

  function note(t){ $('note').textContent = t; }

  function apply(){
    syncPanel();
    return fig.apply(rec).then(function(){
      var p = fig.pose, n = Object.keys(fig.live).filter(function(k){ return fig.live[k].visible; }).length;
      if(p.stature){
        var who = rec.people && PEOPLE[rec.people];
        $('stats').innerHTML = 'Height <b>' + Math.round(p.stature * 100) + ' cm</b>' + (who ? ' · <b>' + who.name + '</b>' : '') + '<br>Meshes <b>' + n + '</b>';
        return;
      }
      var cm = Math.round(BASE_HEIGHT[body] * p.root * 100 + p.lift * 100 * p.root);
      $('stats').innerHTML = 'Height <b>' + cm + ' cm</b> · Leg lift <b>' + (p.lift >= 0 ? '+' : '−') + Math.abs(p.lift * 100).toFixed(1) + ' cm</b><br>' +
        'Pieces <b>' + n + '</b> (base body, head, hair, armour)';
    }).catch(function(e){ note('A piece failed to load: ' + e.message); });
  }

  boot();
})();
