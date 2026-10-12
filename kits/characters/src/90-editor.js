/* ==== the editor page: stage, camera, panel. [web] (host code; Godot builds its own UI over kchar.gd) ====
   KCHAR_DATA (build.py): { sliders, bodies: { male: { skeleton, kit }, female: {...} } }. The pieces are fetched when a
   record needs them: pieces/<key>.txt (a base64 GLB), or KCHAR_GLB[key] when build.py inlined them. Chip pictures are
   thumbs/<key>__<mesh>.png (tools/thumbs.mjs). Everything the panel changes goes through one record and fig.apply().
   A MakeHuman body (kit.style 'mpfb') morphs: its Body and Face tabs are kit.morph's sliders (record.morph) and the
   ancestry triple; its Head tab picks a people (data/peoples.json), skin tone, hair, hair colour and beard.
*/
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };
  var SLOT_LABEL = { torso:'Torso & arms', legs:'Legs', feet:'Feet' };
  var BASE_HEIGHT = { male:1.75, female:1.68, mpfb_male:1.78, mpfb_female:1.66 };
  var BODY_LABEL = { male:'Meshy male', female:'Meshy female', mpfb_male:'Man', mpfb_female:'Woman' };
  var rec, fig, renderer, scene, camera, clock = new THREE.Clock(), body = 'male';
  var start = {
    male:   { body:'male', head:'base_m', hair:'hair_m_long', beard:null, armour:{ torso:'bronze', legs:'scout', feet:'bone' }, sliders:{}, dye:{} },
    female: { body:'female', head:'base_f', hair:'hair_f_braids', beard:null, armour:{ torso:'f_hide', legs:'f_scout', feet:'f_bone' }, sliders:{}, dye:{} }
  };
  start.mpfb_male = { body:'mpfb_male', hair:'short02', beard:'wdg_scruffy_beard', armour:{ torso:'mindfront_kimono', legs:'toigo_harem_pants', feet:'culturalibre_hero_boots_1' },
                      sliders:{}, morph:{}, ancestry:null, skin:'#c99a74', hair_color:'#3a2a1e', eye_color:'#5a3a22', people:null, dye:{} };
  start.mpfb_female = { body:'mpfb_female', hair:'braid01', beard:null, armour:{ torso:'toigo_bodice-style_top', legs:'toigo_long_full_skirt', feet:'grinsegold_female_pirate_boots' },
                        sliders:{}, morph:{}, ancestry:null, skin:'#d9b294', hair_color:'#2c2019', eye_color:'#4e6a80', people:null, dye:{} };
  var saved = {};

  /* ---- pieces ---- */
  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  // build.py gzips each piece before base64: unzip it in the browser (a plain one passes through)
  function gunzip(buf){
    var u = new Uint8Array(buf);
    if(u[0] !== 0x1f || u[1] !== 0x8b) return Promise.resolve(buf);
    return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  function fetchPiece(key){
    return fetch('pieces/' + key + '.txt').then(function(r){ if(!r.ok) throw new Error(key + ': ' + r.status); return r.text(); }).then(b64).then(gunzip);
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
  function thumb(key, mesh){ return 'thumbs/' + key + '__' + mesh + '.png'; }

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
    key.shadow.bias = -0.0005; scene.add(key);
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
    Object.keys(D.bodies).forEach(function(x){ $('body-' + x).setAttribute('aria-pressed', x === b); });
    buildPanel();
    var clip = document.querySelector('[data-clip][aria-pressed="true"]');
    $('loading').hidden = false;
    var done = apply().then(function(){
      $('loading').hidden = true;
      if(window._kcharHold) window._kcharHold(clip ? clip.dataset.clip || '' : 'idle');
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
    if(fig) fig.update(dt);
    if(cam.spin) cam.yaw += dt * 0.5;
    if(cam.face && fig){ fig.headWorld(hv); cam.want.ty = hv.y + 0.06; }
    else if(fig) cam.want.ty = 0.9 * fig.pose.root;
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
      cam.want.dist = Math.max(0.45, Math.min(5, cam.want.dist * Math.exp(e.deltaY * 0.001)));
    }, { passive:false });
  }

  function view(face){
    cam.face = face;
    cam.want.dist = face ? 0.8 : 4.2; cam.want.pitch = face ? 0.02 : 0.1;
    $('cam-body').setAttribute('aria-pressed', !face); $('cam-face').setAttribute('aria-pressed', face);
  }

  /* ---- panel ---- */
  function chips(box, items, current, onPick, compact){
    var grid = document.createElement('div'); grid.className = 'chips' + (compact ? ' tags' : '');
    items.forEach(function(it){
      var b = document.createElement('button'); b.className = 'chip'; b.id = it.domId;
      b.setAttribute('aria-pressed', it.id === current);
      b.innerHTML = (it.img ? '<img alt="" loading="lazy" src="' + it.img + '">' : compact ? '' : '<span class="none"></span>') + '<span>' + it.name + '</span>';
      var img = b.querySelector('img');
      if(img) img.onerror = function(){ var n = document.createElement('span'); n.className = 'none'; img.replaceWith(n); };
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
  function itemChips(page, kit, slot, title){
    var list = kit.items.filter(function(x){ return x.slot === slot; });
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
  function buildMpfb(kit, gear, headp){
    ['torso', 'legs', 'feet'].forEach(function(slot){ var s = itemChips(gear, kit, slot, SLOT_LABEL[slot]); if(s) dyeRow(s, slot); });
    var gh = document.createElement('p'); gh.className = 'hint';
    gh.textContent = 'MakeHuman library clothing: MPFB fitted each piece to this body, it takes its weights from the body, and it hides the skin it covers. Loose pieces (the kimono, harem trousers, skirts) hang from the body. The body and face sliders reshape the clothes with it.';
    gear.appendChild(gh);

    var cur = rec.people && PEOPLE[rec.people];
    var ps = section(headp, 'People', cur ? cur.name : 'Any');
    chips(ps, [{ id:null, name:'Any', domId:'chip-people-any' }].concat((D.peoples || []).map(function(p){
      return { id:p.id, name:p.name, domId:'chip-people-' + p.id };
    })), rec.people || null, function(id){ rollLook(PEOPLE[id] || null); apply(); buildPanel(); note(id ? 'A stranger of the ' + PEOPLE[id].name + '. Pick them again for another.' : 'A stranger of no people in particular.'); }, true);
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
    // the actions (data/clips.json): grouped; a one-shot plays once and goes back to the idle
    var act = $('act-pick'), meta = {};
    D.bodies[Object.keys(D.bodies)[0]].skeleton.clips.forEach(function(c){ meta[c.name] = c; });
    ((D.clips && D.clips.groups) || []).forEach(function(g){
      var og = document.createElement('optgroup'); og.label = g.label;
      D.clips.clips.filter(function(c){ return c.group === g.id && meta[c.key]; }).forEach(function(c){
        var o = document.createElement('option'); o.value = c.key; o.textContent = c.label + (c.loop ? '' : ' ·  once');
        og.appendChild(o);
      });
      if(og.children.length) act.appendChild(og);
    });
    $('clip-act').dataset.clip = act.value;
    act.addEventListener('change', function(){ $('clip-act').dataset.clip = act.value; $('clip-act').click(); });
    // what the hands hold: a clip's data/clips.json 'hold' (per hand, the props it may take, default first); the
    // picker swaps the right hand's prop among them, or empties the hands
    var holdPick = $('hold-pick'), PROP = {}, holdChoice = null;
    (D.props || []).forEach(function(p){ PROP[p.id] = p; });
    KCharFigure.props = PROP;
    var clipInfo = {}; ((D.clips && D.clips.clips) || []).forEach(function(c){ clipInfo[c.key] = c; });
    function holdFor(name){
      var h = (clipInfo[name] && clipInfo[name].hold) || {}, side = h.R ? 'R' : h.L ? 'L' : null;
      holdPick.innerHTML = '';
      var none = document.createElement('option'); none.value = ''; none.textContent = side ? 'Empty hands' : 'Nothing to hold';
      holdPick.appendChild(none);
      (side ? h[side] : []).forEach(function(id){
        var o = document.createElement('option'); o.value = id; o.textContent = (PROP[id] || { label:id }).label; holdPick.appendChild(o);
      });
      var pick = side && holdChoice !== '' ? (h[side].indexOf(holdChoice) >= 0 ? holdChoice : h[side][0]) : '';
      holdPick.value = pick || '';
      holdPick.disabled = !side;
      var want = { R:null, L:null };
      if(pick !== ''){
        if(h.R) want.R = side === 'R' ? pick : h.R[0];
        if(h.L) want.L = side === 'L' ? pick : h.L[0];
        want.both = !!(want.R && clipInfo[name].two_hands && clipInfo[name].two_hands.indexOf(want.R) >= 0);
      }
      fig.hold(want);
    }
    holdPick.addEventListener('change', function(){
      holdChoice = holdPick.value;
      var on = document.querySelector('[data-clip][aria-pressed="true"]');
      holdFor(on ? on.dataset.clip : '');
    });
    window._kcharHold = holdFor;
    Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(b){
      b.addEventListener('click', function(){
        holdFor(b.dataset.clip || '');
        fig.play(b.dataset.clip || null);
        Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(o){ o.setAttribute('aria-pressed', o === b); });
      });
    });
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
