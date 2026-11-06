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
  var SLOT_LABEL = { head:'Headgear', implant:'Cybernetic implants', torso:'Torso & arms', gloves:'Gloves & gauntlets', back:'Backpacks & gear', legs:'Legs', feet:'Feet' };
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
  var FROG = { mods:['mod_head_frog'], skin:'#5f8a36', eye_color:'#d6a22a', hair:null, beard:null };
  function frog(r, kit){
    if(!kit.items.some(function(it){ return it.id === 'mod_head_frog'; })) return r;
    ['skin2', 'skin3', 'pattern', 'pattern_amount'].forEach(function(k){ delete r[k]; });
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
  var THUMBS = (typeof KCHAR_THUMBS !== 'undefined' && KCHAR_THUMBS) ? KCHAR_THUMBS : {};
  function thumb(key, mesh){
    var body = key.split('/')[0], name = key.slice(body.length + 1) + '__' + mesh, t = THUMBS[body];
    if(t === undefined){
      THUMBS[body] = null;
      fetch('thumbs/' + body + '.json', { cache:'no-store' }).then(function(r){ return r.ok ? r.json() : false; })
        .then(function(j){ THUMBS[body] = j || false; if(j && rec) buildPanel(); }, function(){ THUMBS[body] = false; });
      return null;
    }
    if(!t || t.keys[name] === undefined) return null;
    var i = t.keys[name], c = i % t.cols, r = Math.floor(i / t.cols);
    var q = t.v ? '?v=' + t.v : '';
    return { atlas:(t._base || '') + 'thumbs/' + body + '.png' + q, size:t.cols * 100 + '% ' + t.rows * 100 + '%',
             at:(t.cols > 1 ? c / (t.cols - 1) * 100 : 0) + '% ' + (t.rows > 1 ? r / (t.rows - 1) * 100 : 0) + '%' };
  }

  /* ---- stage ---- */
  var cam = { yaw:0.35, pitch:0.1, dist:4.5, ty:0.68, want:{ dist:4.5, ty:0.68, pitch:0.1 }, spin:false, face:false };
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
    window._kchar = { fig:fig, ready:done, record:function(){ return rec; }, cam:cam, still:!!(window._kchar && window._kchar.still),
                      set:function(r){ rec = r; buildPanel(); return apply(); }, body:setBody,
                      comments:{ getAll:loadComments, list:commentList, save:saveComments, setFilter:function(f){ filterComments = f || 'all'; buildPanel(); } } };
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
    else if(fig) cam.want.ty = 0.70 * fig.pose.root * figScale();
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
    cam.want.dist = (face ? 0.8 : 4.5) * figScale(); cam.want.pitch = face ? 0.02 : 0.1;
    $('cam-body').setAttribute('aria-pressed', !face); $('cam-face').setAttribute('aria-pressed', face);
  }

  /* ---- panel ---- */
  function chips(box, items, current, onPick, compact){
    var grid = document.createElement('div'); grid.className = 'chips' + (compact ? ' tags' : '');
    items.forEach(function(it){
      var b = document.createElement('button'); b.className = 'chip' + (it.comment ? ' has-comment' : ''); b.id = it.domId;
      if(it.comment) b.title = '💬 ' + it.comment;
      else if(it.title) b.title = it.title;
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
  // an animal's eyes (a frog's or a lizard's: role 'iris'), and the poison dart frogs' colours for a patterned skin
  var EYES_BEAST = ['#d6a22a', '#e0c040', '#c8701c', '#b02a1a', '#7a8a2a', '#3a2a1a', '#a0a8a0'];

  var HAIR_ANY = ['#e6d3a3', '#c9a35a', '#a0703d', '#8e4f2a', '#5a3a22', '#2c2019', '#141110', '#9a9894', '#d8d6d2'];
  // fixed: the list only, no free colour (a frog's skin keeps to its palette: kit item pattern palette)
  function swatches(box, label, id, value, list, set, fixed){
    var row = document.createElement('div'); row.className = 'dye swatches';
    row.innerHTML = '<label for="' + id + '">' + label + '</label><input type="color" id="' + id + '" value="' + value + '"' + (fixed ? ' hidden' : '') + '>';
    list.forEach(function(c){
      var b = document.createElement('button'); b.className = 'sw'; b.title = c; b.style.background = c;
      b.setAttribute('aria-label', label + ' ' + c);
      b.setAttribute('aria-pressed', c.toLowerCase() === String(value).toLowerCase());
      b.addEventListener('click', function(){ set(c); row.querySelector('input').value = c; });
      row.appendChild(b);
    });
    row.querySelector('input').addEventListener('input', function(e){ set(e.target.value); });
    box.appendChild(row);
  }
  // the clothing pickers show one wardrobe: null every item, 'library' MakeHuman's own (no culture), or a people's
  // (kit item culture); plus Character Type (PC / Important NPC / Geomancer), Class, Role, and Sort filters
  var wardrobe = null, filterType = 'all', filterClass = 'all', filterRole = 'all', sortMode = 'culture';
  var TYPE_LIST = [
    { id:'all', name:'All Types' },
    { id:'pc', name:'PC (Recruitable)' },
    { id:'important_npc', name:'Important NPC' },
    { id:'geomancer', name:'Geomancer' },
    { id:'npc', name:'Standard NPC' }
  ];
  var CLASS_LIST = [
    { id:'all', name:'All' },
    { id:'commoner', name:'Commoner & Peasant' },
    { id:'trade', name:'Artisan, Guild & Trade' },
    { id:'martial', name:'Martial & Enforcer' },
    { id:'clergy', name:'Clergy & Mystic' },
    { id:'noble', name:'Noble & Court' },
    { id:'sovereign', name:'Sovereign' }
  ];
  var ROLE_LIST = [
    { id:'all', name:'All' },
    { id:'military', name:'Military & Guard' },
    { id:'priest', name:'Priest & Ritual' },
    { id:'trade', name:'Craft & Trade' },
    { id:'scholar', name:'Scholar & Tech' },
    { id:'scout', name:'Scout & Hunter' },
    { id:'maritime', name:'Sailor & Pirate' },
    { id:'court', name:'Court & Civic' }
  ];
  var SORT_LIST = [
    { id:'culture', name:'Culture' },
    { id:'class', name:'Class' },
    { id:'role', name:'Role' },
    { id:'name', name:'Name A–Z' }
  ];
  var TIER_CLASS = {
    peasant:'commoner', peasant_fest:'commoner', town:'commoner', servant:'commoner', novice:'commoner', clan:'commoner', clan4:'commoner', patrol:'commoner',
    trade:'trade', trade_fest:'trade', guild:'trade', dredger:'trade', geomancer:'trade', cartographer:'trade', listener:'trade',
    scout:'martial', ordinator:'martial', chosen:'martial', amazon:'martial', stalker:'martial', lancer:'martial', cataphract:'martial',
    phil:'martial', skirmisher:'martial', watch:'martial', praetorian:'martial', commissar:'martial', axeman:'martial', warden:'martial',
    askari:'martial', icewarden:'martial', trooper:'martial', sentinel:'martial', breacher:'martial', corsair:'martial', warrior:'martial',
    agent:'martial', chronomonk:'martial', temple:'martial',
    heir_juggernaut:'martial', heir_sentinel:'martial', heir_stalker:'martial',
    gilded_sentinel:'martial', crescent_vigilant:'clergy', crimson_technomancer:'clergy', crested_guardian:'martial',
    yuni_outback_scout:'martial', yuni_tassel_heavy:'martial', yuni_field_medic:'clergy', yuni_comms_ranger:'martial', yuni_desert_elder:'clergy',
    pc_hanbok:'noble', pc_ronin:'martial', pc_corsair:'martial', pc_geomancer:'clergy', pc_valkyrie:'sovereign',
    pc_floral_envoy:'noble', pc_patchwork_sheriff:'martial', pc_torgo_couture:'noble', pc_azure_emir:'noble', pc_relic_lancer:'martial',
    priest:'clergy', confessor:'clergy', cantor:'clergy', hierophant:'clergy', heliarch:'clergy', oracle:'clergy', sibyl:'clergy',
    shaman:'clergy', lightkeeper:'clergy', dronemaster:'clergy', electropriest:'clergy', electromonk:'clergy', monk:'clergy', keeper:'clergy', cham:'clergy',
    noble:'noble', noble_fest:'noble', aedile:'noble', magistrate:'noble', envoy:'noble', patriarch:'noble', rich:'noble',
    magnate:'noble', pleasure:'noble', vizier:'noble', emmo:'noble', prefect:'noble', censor:'noble', archivist:'noble', minister:'noble', elder:'noble', chief:'noble',
    tzintzun:'sovereign', heliophant:'sovereign'
  };
  var TIER_ROLE = {
    ordinator:'military', chosen:'military', lancer:'military', cataphract:'military', skirmisher:'military', watch:'military',
    praetorian:'military', commissar:'military', axeman:'military', warden:'military', askari:'military', trooper:'military',
    sentinel:'military', warrior:'military', chronomonk:'military', temple:'military', patrol:'military',
    heir_juggernaut:'military', heir_sentinel:'military', heir_stalker:'scout',
    gilded_sentinel:'military', crescent_vigilant:'scholar', crimson_technomancer:'scholar', crested_guardian:'military',
    yuni_outback_scout:'scout', yuni_tassel_heavy:'military', yuni_field_medic:'priest', yuni_comms_ranger:'scout', yuni_desert_elder:'priest',
    pc_hanbok:'court', pc_ronin:'military', pc_corsair:'maritime', pc_geomancer:'scholar', pc_valkyrie:'military',
    pc_floral_envoy:'court', pc_patchwork_sheriff:'military', pc_torgo_couture:'court', pc_azure_emir:'court', pc_relic_lancer:'military',
    priest:'priest', confessor:'priest', cantor:'priest', hierophant:'priest', heliarch:'priest', heliophant:'priest',
    oracle:'priest', sibyl:'priest', shaman:'priest', lightkeeper:'priest', electropriest:'priest', electromonk:'priest',
    novice:'priest', monk:'priest', elder:'priest', keeper:'priest', cham:'priest', tzintzun:'priest',
    trade:'trade', trade_fest:'trade', guild:'trade', magnate:'trade', servant:'trade', peasant:'trade', peasant_fest:'trade', town:'trade', clan:'trade', clan4:'trade',
    geomancer:'scholar', cartographer:'scholar', listener:'scholar', dronemaster:'scholar', dredger:'scholar', archivist:'scholar', censor:'scholar', emmo:'scholar',
    scout:'scout', amazon:'scout', stalker:'scout', walker:'scout', icewarden:'scout', breacher:'scout', agent:'scout',
    phil:'maritime', corsair:'maritime',
    noble:'court', noble_fest:'court', aedile:'court', magistrate:'court', envoy:'court', patriarch:'court',
    rich:'court', pleasure:'court', vizier:'court', prefect:'court', minister:'court', chief:'court'
  };
  var IMPORTANT_NPC_TIERS = {
    tzintzun:1, phil:1, heir_juggernaut:1, heir_sentinel:1, heir_stalker:1,
    gilded_sentinel:1, crescent_vigilant:1, crimson_technomancer:1, crested_guardian:1,
    heliophant:1, hierophant:1, heliarch:1, patriarch:1, elder:1, yuni_desert_elder:1, chief:1,
    vizier:1, magnate:1, aedile:1, praetorian:1, magistrate:1, commissar:1, emmo:1, confessor:1,
    ordinator:1, chosen:1, minister:1, censor:1, cataphract:1, sibyl:1, shaman:1, sentinel:1, breacher:1
  };
  function tierTypes(tier, set){
    var t = {};
    if(set && set.type) t[set.type] = 1;
    if(IMPORTANT_NPC_TIERS[tier]) t.important_npc = 1;
    if(/^pc_/.test(tier)) t.pc = 1;
    if(tier === 'geomancer' || tier === 'pc_geomancer' || /^geomancer|^geo_/.test(tier)){ t.geomancer = 1; t.pc = 1; }
    if(!Object.keys(t).length) t.npc = 1;
    return t;
  }
  var ITEM_META = {};
  (D.peoples || []).forEach(function(p){
    var o = p.outfits || {};
    Object.keys(o).forEach(function(sex){
      Object.keys(o[sex] || {}).forEach(function(tier){
        var set = o[sex][tier] || {}, cl = TIER_CLASS[tier] || (/^geomancer|^geo_/.test(tier) ? 'trade' : 'commoner'), rl = TIER_ROLE[tier] || (/^geomancer|^geo_/.test(tier) ? 'scholar' : 'trade');
        if(p.id === 'hykkousoi' && (tier === 'peasant' || tier === 'trade')) rl = 'maritime';
        if(p.id === 'dalabites' && tier === 'noble') cl = 'clergy';
        var tp = tierTypes(tier, set);
        ['head', 'implant', 'torso', 'gloves', 'back', 'legs', 'feet'].forEach(function(sl){
          var id = set[sl];
          if(!id) return;
          if(!ITEM_META[id]) ITEM_META[id] = { classes:{}, roles:{}, types:{}, primaryClass:cl, primaryRole:rl };
          ITEM_META[id].classes[cl] = 1;
          ITEM_META[id].roles[rl] = 1;
          Object.keys(tp).forEach(function(k){ ITEM_META[id].types[k] = 1; });
        });
      });
    });
  });
  function itemMeta(x){
    if(ITEM_META[x.id]){
      if(x.type) ITEM_META[x.id].types[x.type] = 1;
      if(/geomancer|^geo_|_geo_/.test(x.id)){ ITEM_META[x.id].types.geomancer = 1; ITEM_META[x.id].types.pc = 1; }
      return ITEM_META[x.id];
    }
    var s = (x.id + ' ' + (x.name || '')).toLowerCase();
    var cl = /tzintzun|heliophant|valkyrie/.test(s) ? 'sovereign' :
             /noble|court|vizier|magnate|aedile|magistrate|minister|prefect|rich|pleasure|chief|emmo|hanbok|envoy|couture|emir/.test(s) ? 'noble' :
             /priest|shaman|monk|oracle|sibyl|hierophant|heliarch|confessor|cantor|cham|keeper|elder|medic/.test(s) ? 'clergy' :
             /guard|warden|sentinel|askari|trooper|lancer|cataphract|praetorian|watch|skirmisher|commissar|axeman|corsair|phil|scout|stalker|amazon|breacher|juggernaut|ronin|sheriff|yuni_/.test(s) ? 'martial' :
             /trade|guild|drover|factor|dredger|geomancer|cartographer|listener|^geo_|_geo_/.test(s) ? 'trade' : 'commoner';
    var rl = /phil|corsair|sailor|marine|pirate/.test(s) ? 'maritime' :
             /scout|stalker|amazon|walker|icewarden|breacher|hunter|agent|ranger|yuni_/.test(s) ? 'scout' :
             /geomancer|cartographer|listener|dronemaster|dredger|archivist|censor|fellow|academic|goggle|^geo_|_geo_/.test(s) ? 'scholar' :
             /priest|shaman|monk|oracle|sibyl|hierophant|heliarch|heliophant|confessor|cantor|cham|keeper|tzintzun|elder|medic/.test(s) ? 'priest' :
             /guard|warden|sentinel|askari|trooper|lancer|cataphract|praetorian|watch|skirmisher|commissar|axeman|warrior|chronomonk|cuirass|lorica|helm|sallet|juggernaut|ronin|valkyrie|sheriff/.test(s) ? 'military' :
             /noble|court|vizier|aedile|magistrate|minister|prefect|rich|pleasure|chief|envoy|hanbok|couture|emir/.test(s) ? 'court' : 'trade';
    var tp = {};
    if(x.type) tp[x.type] = 1;
    if(/^pc_|_pc_|hanbok_duelist|cloud_ronin|crimson_corsair|sun_geomancer|wing_valkyrie|floral_envoy|patchwork_sheriff|torgo_couture|azure_emir|relic_lancer/.test(s)) tp.pc = 1;
    if(/tzintzun|phil_|heir_juggernaut|heir_sentinel|heir_stalker|heliophant|hierophant|heliarch|ordinator|praetorian|aedile|magistrate|commissar|vizier|magnate|cataphract|minister|censor|emmo|desert_elder|sentinel|breacher/.test(s)) tp.important_npc = 1;
    if(/geomancer|^geo_|_geo_/.test(s)){ tp.geomancer = 1; tp.pc = 1; }
    if(!Object.keys(tp).length) tp.npc = 1;
    var m = { classes:{}, roles:{}, types:tp, primaryClass:cl, primaryRole:rl };
    m.classes[cl] = 1; m.roles[rl] = 1;
    ITEM_META[x.id] = m;
    return m;
  }
  var filterComments = 'all';
  var COMMENTS_KEY = 'kchar_model_comments_v1';
  var NAMED_KEY = 'kchar_named_models_v2';
  var STATE_SYNC_URL = 'http://127.0.0.1:18923/state';
  var MEM_COMMENTS = null;
  var MEM_BAKED = null;
  var _syncTimer = null;

  function _readWinName(){
    try {
      if(window.name && window.name.indexOf('{"__kchar":1') === 0){
        return JSON.parse(window.name) || {};
      }
    } catch(e){}
    return {};
  }
  function _writeWinName(){
    try {
      window.name = JSON.stringify({ __kchar:1, comments:MEM_COMMENTS || {}, baked:MEM_BAKED || {} });
    } catch(e){}
  }
  function _syncToDisk(){
    if(_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(function(){
      try {
        fetch(STATE_SYNC_URL, {
          method:'POST',
          mode:'cors',
          headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify({ comments:MEM_COMMENTS || {}, baked:MEM_BAKED || {} })
        }).catch(function(){});
      } catch(e){}
    }, 80);
  }
  function _initPersist(){
    if(MEM_COMMENTS !== null && MEM_BAKED !== null) return;
    var wn = _readWinName();
    var lsC = {}, lsB = {};
    try { lsC = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}') || {}; } catch(e){}
    try { lsB = JSON.parse(localStorage.getItem(NAMED_KEY) || '{}') || {}; } catch(e){}
    MEM_COMMENTS = Object.assign({}, D.comments || {}, wn.comments || {}, lsC);
    MEM_BAKED = Object.assign({}, D.baked_models || {}, wn.baked || {}, lsB);
    ['dalab_heliophant', 'hykk_hierophant', 'hykk_heliarch'].forEach(function(id){
      if(MEM_BAKED[id] && MEM_BAKED[id].people !== 'izani') MEM_BAKED[id].people = 'izani';
    });
    _writeWinName();
    try {
      fetch(STATE_SYNC_URL, { mode:'cors', cache:'no-store' })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(st){
          if(!st || typeof st !== 'object') return;
          var changed = false;
          if(st.comments && typeof st.comments === 'object'){
            Object.keys(st.comments).forEach(function(k){
              if(!MEM_COMMENTS[k] || (st.comments[k].updated && (!MEM_COMMENTS[k].updated || st.comments[k].updated > MEM_COMMENTS[k].updated))){
                MEM_COMMENTS[k] = st.comments[k];
                changed = true;
              }
            });
          }
          if(st.baked && typeof st.baked === 'object'){
            Object.keys(st.baked).forEach(function(k){
              if(!MEM_BAKED[k]){ MEM_BAKED[k] = st.baked[k]; changed = true; }
            });
          }
          if(changed){
            _writeWinName();
            try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(MEM_COMMENTS)); } catch(e){}
            try { localStorage.setItem(NAMED_KEY, JSON.stringify(MEM_BAKED)); } catch(e){}
            if(rec) buildPanel();
          }
        }).catch(function(){});
    } catch(e){}
  }
  function loadComments(){
    _initPersist();
    return MEM_COMMENTS;
  }
  function saveComments(map){
    _initPersist();
    MEM_COMMENTS = map || {};
    _writeWinName();
    try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(MEM_COMMENTS)); } catch(e){}
    _syncToDisk();
  }
  function commentList(comments){
    var map = comments || loadComments();
    return Object.keys(map).map(function(k){
      var v = map[k];
      if(typeof v === 'string') return { key:k, text:v, label:k };
      return v && v.text ? Object.assign({ key:k }, v) : null;
    }).filter(Boolean);
  }
  function getCommentForNamed(m, comments){
    if(!m) return null;
    var map = comments || loadComments();
    if(m.id && map['named:' + m.id] && map['named:' + m.id].text) return map['named:' + m.id];
    if(m.outfit_id && map['outfit:' + m.outfit_id] && map['outfit:' + m.outfit_id].text) return map['outfit:' + m.outfit_id];
    var torso = m.armour && m.armour.torso;
    if(torso && map['torso:' + torso] && map['torso:' + torso].text) return map['torso:' + torso];
    var list = commentList(map);
    for(var i = 0; i < list.length; i++){
      var c = list[i];
      if(m.id && c.namedId === m.id) return c;
      if(m.outfit_id && c.outfitId === m.outfit_id) return c;
      if(torso && c.torso === torso) return c;
    }
    return null;
  }
  function getCommentForOutfit(x, comments){
    if(!x) return null;
    var map = comments || loadComments();
    if(x.id && map['outfit:' + x.id] && map['outfit:' + x.id].text) return map['outfit:' + x.id];
    var torso = x.set && x.set.torso;
    if(torso && map['torso:' + torso] && map['torso:' + torso].text) return map['torso:' + torso];
    var list = commentList(map);
    for(var i = 0; i < list.length; i++){
      var c = list[i];
      if(x.id && c.outfitId === x.id) return c;
      if(torso && c.torso === torso) return c;
    }
    return null;
  }
  function getCommentForItem(it, comments){
    if(!it || !it.id) return null;
    var map = comments || loadComments();
    if(it.slot === 'torso' && map['torso:' + it.id] && map['torso:' + it.id].text) return map['torso:' + it.id];
    var list = commentList(map);
    for(var i = 0; i < list.length; i++){
      var c = list[i];
      if(it.slot === 'torso' && c.torso === it.id) return c;
      if(c.record && c.record.armour && c.record.armour[it.slot] === it.id) return c;
      if(c.record && (it.slot === 'hair' || it.slot === 'beard') && c.record[it.slot] === it.id) return c;
    }
    return null;
  }
  function inWardrobe(x){
    if(filterComments === 'commented') return !!getCommentForItem(x);
    if(wardrobe && (wardrobe === 'library' ? !!x.culture : x.culture !== wardrobe)) return false;
    var m = itemMeta(x);
    if(filterType !== 'all' && !(m.types && m.types[filterType])) return false;
    if(filterClass !== 'all' && !m.classes[filterClass]) return false;
    if(filterRole !== 'all' && !m.roles[filterRole]) return false;
    if(filterComments === 'uncommented' && getCommentForItem(x)) return false;
    return true;
  }
  function sortItems(list){
    var cOrder = {}; CLASS_LIST.forEach(function(c, i){ cOrder[c.id] = i; });
    var rOrder = {}; ROLE_LIST.forEach(function(r, i){ rOrder[r.id] = i; });
    return list.slice().sort(function(a, b){
      if(sortMode === 'name') return String(a.name || a.id).localeCompare(String(b.name || b.id));
      if(sortMode === 'class'){
        var ca = cOrder[itemMeta(a).primaryClass] || 99, cb = cOrder[itemMeta(b).primaryClass] || 99;
        if(ca !== cb) return ca - cb;
      } else if(sortMode === 'role'){
        var ra = rOrder[itemMeta(a).primaryRole] || 99, rb = rOrder[itemMeta(b).primaryRole] || 99;
        if(ra !== rb) return ra - rb;
      } else {
        var pa = String(a.culture || ''), pb = String(b.culture || '');
        if(pa !== pb) return pa.localeCompare(pb);
      }
      return String(a.name || a.id).localeCompare(String(b.name || b.id));
    });
  }
  function wardrobeChips(kit, gear){
    var curTp = TYPE_LIST.filter(function(x){ return x.id === filterType; })[0] || TYPE_LIST[0];
    var stp = section(gear, 'Character Type (PC / Important NPC)', curTp.name);
    chips(stp, TYPE_LIST.map(function(x){ return { id:x.id, name:x.name, domId:'chip-type-' + x.id }; }), filterType, function(id){
      filterType = id || 'all'; buildPanel();
    }, true);
    var have = {}; kit.items.forEach(function(x){ if(x.culture) have[x.culture] = true; });
    var list = [{ id:null, name:'All' }, { id:'library', name:'Library' }].concat((D.peoples || []).filter(function(p){ return have[p.id]; })
      .map(function(p){ return { id:p.id, name:p.name }; }));
    var cur = list.filter(function(x){ return x.id === wardrobe; })[0];
    var s = section(gear, 'Wardrobe (Culture)', cur ? cur.name : 'All');
    chips(s, list.map(function(x){ return { id:x.id, name:x.name, domId:'chip-wardrobe-' + (x.id || 'all') }; }), wardrobe, function(id){
      wardrobe = id; buildPanel();
    }, true);
    var curCl = CLASS_LIST.filter(function(x){ return x.id === filterClass; })[0] || CLASS_LIST[0];
    var scl = section(gear, 'Filter by Class', curCl.name);
    chips(scl, CLASS_LIST.map(function(x){ return { id:x.id, name:x.name, domId:'chip-class-' + x.id }; }), filterClass, function(id){
      filterClass = id || 'all'; buildPanel();
    }, true);
    var curRl = ROLE_LIST.filter(function(x){ return x.id === filterRole; })[0] || ROLE_LIST[0];
    var srl = section(gear, 'Filter by Role', curRl.name);
    chips(srl, ROLE_LIST.map(function(x){ return { id:x.id, name:x.name, domId:'chip-role-' + x.id }; }), filterRole, function(id){
      filterRole = id || 'all'; buildPanel();
    }, true);
    var curSt = SORT_LIST.filter(function(x){ return x.id === sortMode; })[0] || SORT_LIST[0];
    var sst = section(gear, 'Sort by', curSt.name);
    chips(sst, SORT_LIST.map(function(x){ return { id:x.id, name:x.name, domId:'chip-sort-' + x.id }; }), sortMode, function(id){
      sortMode = id || 'culture'; buildPanel();
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
  var hairGender = 'all';
  function itemChips(page, kit, slot, title){
    var worn = (slot === 'hair' || slot === 'beard') ? rec[slot] : rec.armour[slot];
    var list = kit.items.filter(function(x){ return x.slot === slot && (slot === 'hair' || slot === 'beard' || slot === 'implant' || x.id === worn || inWardrobe(x)) && KCHAR.fits(x, rec, kit); });
    if(!list.length && (slot === 'back' || slot === 'gloves') && filterComments !== 'commented'){
      list = kit.items.filter(function(x){ return x.slot === slot && KCHAR.fits(x, rec, kit); });
    }
    if(!list.length) return null;
    var cur = (slot === 'hair' || slot === 'beard') ? rec[slot] : rec.armour[slot];
    var it = list.filter(function(x){ return x.id === cur; })[0];
    var s = section(page, title, it ? it.name : 'None');
    if(slot === 'hair'){
      var gOpts = [
        { id:'all', name:'All (' + list.length + ')' },
        { id:'male', name:'Male' },
        { id:'female', name:'Female' },
        { id:'male_first', name:'Male first' },
        { id:'female_first', name:'Female first' }
      ];
      chips(s, gOpts.map(function(g){ return { id:g.id, name:g.name, domId:'chip-hair-gender-' + g.id }; }), hairGender, function(gid){
        hairGender = gid; buildPanel();
      }, true);
      if(hairGender === 'male' || hairGender === 'female'){
        list = list.filter(function(x){ return x.id === cur || !x.gender || x.gender === hairGender; });
      } else if(hairGender === 'male_first' || hairGender === 'female_first'){
        var pref = hairGender === 'male_first' ? 'male' : 'female';
        list = list.slice().sort(function(a, b){
          var ga = a.gender === pref ? 0 : 1, gb = b.gender === pref ? 0 : 1;
          return ga - gb;
        });
      }
    } else if(slot !== 'beard' && slot !== 'implant'){
      list = sortItems(list);
    }
    chips(s, [{ id:null, name:'None', domId:'chip-' + slot + '-none' }].concat(list.map(function(x){
      var cm = getCommentForItem(x);
      return { id:x.id, name:x.name, img:thumb(KCHAR.key(x.glb), 'all'), domId:'chip-' + slot + '-' + x.id, comment:cm ? cm.text : null };
    })), cur || null, function(id){
      if(slot === 'hair' || slot === 'beard') rec[slot] = id;
      else {
        rec.armour[slot] = id;
        if(slot === 'torso'){ delete rec.id; delete rec.name; delete rec.outfit_id; delete rec.outfit_name; }
      }
      apply(); buildPanel();
    });
    return s;
  }
  var lookSeed = 1;
  function rollLook(people){
    // a stranger of this people, wearing what this one wears
    var kit = D.bodies[body].kit, r = KCHAR.stranger(lookSeed++ * 104729 + 17, kit, people);
    r.armour = rec.armour; r.dye = rec.dye;
    rec = r;
  }
  function loadBakedModels(){
    _initPersist();
    return MEM_BAKED;
  }
  function saveBakedModels(map){
    _initPersist();
    MEM_BAKED = map || {};
    _writeWinName();
    try { localStorage.setItem(NAMED_KEY, JSON.stringify(MEM_BAKED)); } catch(e){}
    _syncToDisk();
  }
  function buildDefaultNamedModels(){
    var out = [], seen = {};
    (D.named_characters || []).forEach(function(nc){
      if(nc && nc.id && !seen[nc.id]){ seen[nc.id] = 1; out.push(JSON.parse(JSON.stringify(nc))); }
    });
    var BUILTIN_LIST = [
      // Sovereign & Important NPCs
      { id:'tzintzun', name:'Tzintzun (High Sovereign)', char_type:'important_npc', people:'chichani', tier:'tzintzun', body:'mpfb_male', seed:101,
        morph:{ stature:0.35, muscle:0.42, proportions:0.25, age:0.15, nose_size:0.18, chin_prominence:0.25 } },
      { id:'phil', name:'Phil (Izani Corsair Lord)', char_type:'important_npc', people:'izani', tier:'phil', body:'mpfb_male', seed:202,
        morph:{ stature:0.18, muscle:0.32, weight:0.12, age:0.22, jaw_width:0.24 } },
      { id:'gilded_sentinel', name:'Gilded Sentinel (Imperial Sun-Guard)', char_type:'important_npc', people:'eternian', tier:'gilded_sentinel', body:'mpfb_male', seed:203,
        morph:{ stature:0.34, muscle:0.48, proportions:0.24 } },
      { id:'crescent_vigilant', name:'Crescent Vigilant (Astral Night-Watcher)', char_type:'important_npc', people:'yusar', tier:'crescent_vigilant', body:'mpfb_female', seed:204,
        morph:{ stature:0.20, muscle:0.26, proportions:0.25 } },
      { id:'crimson_technomancer', name:'Crimson Technomancer (Arc-Furnace Magus)', char_type:'important_npc', people:'iron_republic', tier:'crimson_technomancer', body:'mpfb_male', seed:205,
        morph:{ stature:0.24, muscle:0.32, age:0.20 } },
      { id:'crested_guardian', name:'Crested Guardian (Pelagic Hoplite Champion)', char_type:'important_npc', people:'hykkousoi', tier:'crested_guardian', body:'mpfb_male', seed:206,
        morph:{ stature:0.36, muscle:0.55, chest_size:0.30 } },
      { id:'heir_juggernaut', name:'True Heir Juggernaut', char_type:'important_npc', people:'eternian', tier:'heir_juggernaut', body:'mpfb_male', seed:303,
        morph:{ stature:0.48, muscle:0.65, weight:0.28, chest_size:0.45 } },
      { id:'heir_sentinel', name:'True Heir Sentinel', char_type:'important_npc', people:'eternian', tier:'heir_sentinel', body:'mpfb_male', seed:304,
        morph:{ stature:0.28, muscle:0.40, proportions:0.20 } },
      { id:'heir_stalker', name:'True Heir Blade-Stalker', char_type:'important_npc', people:'eternian', tier:'heir_stalker', body:'mpfb_female', seed:305,
        morph:{ stature:0.22, muscle:0.35, proportions:0.28 } },
      { id:'dalab_heliophant', name:'Heliophant Sol-Vara (Izani)', char_type:'important_npc', people:'izani', tier:'heliophant', body:'mpfb_male', seed:306,
        morph:{ stature:0.30, muscle:0.22, proportions:0.24, age:0.35 } },
      { id:'dalab_genepriest', name:'Arch-Biologist Meren (Dalab)', char_type:'important_npc', people:'dalabites', tier:'noble', body:'mpfb_female', seed:307,
        morph:{ stature:0.16, muscle:0.18, age:0.20 } },
      { id:'voth_ordinator', name:'High Ordinator Malakor (Chichani)', char_type:'important_npc', people:'chichani', tier:'ordinator', body:'mpfb_male', seed:308,
        morph:{ stature:0.34, muscle:0.50, jaw_width:0.25, age:0.18 } },
      { id:'voth_chosen', name:'Solar Chosen Aureon (Chichani)', char_type:'important_npc', people:'chichani', tier:'chosen', body:'mpfb_male', seed:309,
        morph:{ stature:0.26, muscle:0.42, proportions:0.25 } },
      { id:'voth_confessor', name:'Grand Confessor Severin (Chichani)', char_type:'important_npc', people:'chichani', tier:'confessor', body:'mpfb_male', seed:310,
        morph:{ stature:0.22, muscle:0.20, age:0.42 } },
      { id:'iziz_aedile', name:'Grand Aedile Qasim (Izani)', char_type:'important_npc', people:'izani', tier:'aedile', body:'mpfb_male', seed:311,
        morph:{ stature:0.18, weight:0.22, age:0.30 } },
      { id:'iziz_praetorian', name:'Praetorian Legate Tariq (Izani)', char_type:'important_npc', people:'izani', tier:'praetorian', body:'mpfb_male', seed:312,
        morph:{ stature:0.30, muscle:0.48, age:0.15 } },
      { id:'hykk_hierophant', name:'Port-Sun Hierophant Nereus (Izani)', char_type:'important_npc', people:'izani', tier:'hierophant', body:'mpfb_male', seed:313,
        morph:{ stature:0.24, muscle:0.28, age:0.32 } },
      { id:'hykk_heliarch', name:'Temple-Hill Heliarch Thalassos (Izani)', char_type:'important_npc', people:'izani', tier:'heliarch', body:'mpfb_male', seed:314,
        morph:{ stature:0.20, muscle:0.25, proportions:0.24 } },
      { id:'rep_magistrate', name:'First Magistrate Corvo (Iron Republic)', char_type:'important_npc', people:'iron_republic', tier:'magistrate', body:'mpfb_male', seed:315,
        morph:{ stature:0.22, muscle:0.30, age:0.28 } },
      { id:'rep_commissar', name:'Iron Commissar Vane (Iron Republic)', char_type:'important_npc', people:'iron_republic', tier:'commissar', body:'mpfb_male', seed:316,
        morph:{ stature:0.18, muscle:0.38, age:0.08 } },
      { id:'xan_vizier', name:'Lotus Vizier Shen-Lan (Xanadu)', char_type:'important_npc', people:'xanadu', tier:'vizier', body:'mpfb_male', seed:317,
        morph:{ stature:0.20, proportions:0.22, age:0.25 } },
      { id:'xan_magnate', name:'Silk Magnate Mei-Zhen (Xanadu)', char_type:'important_npc', people:'xanadu', tier:'magnate', body:'mpfb_female', seed:318,
        morph:{ stature:0.14, proportions:0.25, age:0.05 } },
      { id:'nomad_patriarch', name:'Steppe Patriarch Temur (Nomads)', char_type:'important_npc', people:'eastern_nomads', tier:'patriarch', body:'mpfb_male', seed:319,
        morph:{ stature:0.28, muscle:0.45, weight:0.18, age:0.35 } },
      { id:'beast_cataphract', name:'Horned Cataphract Drak (Beast Riders)', char_type:'important_npc', people:'beast_riders', tier:'cataphract', body:'mpfb_male', seed:320,
        morph:{ stature:0.42, muscle:0.60, weight:0.25 } },
      { id:'beast_amazon', name:'War-Amazon Penthesilea (Beast Riders)', char_type:'important_npc', people:'beast_riders', tier:'amazon', body:'mpfb_female', seed:331,
        morph:{ stature:0.28, muscle:0.48, proportions:0.24 } },
      { id:'eternian_minister', name:'Jade Minister Zhao (Eternian)', char_type:'important_npc', people:'eternian', tier:'minister', body:'mpfb_male', seed:321,
        morph:{ stature:0.22, proportions:0.20, age:0.38 } },
      { id:'eternian_censor', name:'Imperial Censor Lin (Eternian)', char_type:'important_npc', people:'eternian', tier:'censor', body:'mpfb_male', seed:322,
        morph:{ stature:0.16, proportions:0.22, age:0.12 } },
      { id:'yusar_hierophant', name:'Sun-Hierophant Amon (Yusar)', char_type:'important_npc', people:'yusar', tier:'hierophant', body:'mpfb_male', seed:323,
        morph:{ stature:0.26, muscle:0.32, age:0.24 } },
      { id:'yuni_emmo', name:'Chancellor Emmo (Yuni University)', char_type:'important_npc', people:'yuni', tier:'emmo', body:'mpfb_male', seed:324,
        morph:{ stature:0.18, weight:0.14, age:0.40 } },
      { id:'yuni_desert_elder', name:'Elder Tenzin (Yuni Outback)', char_type:'important_npc', people:'yuni', tier:'yuni_desert_elder', body:'mpfb_male', seed:325,
        morph:{ stature:0.15, muscle:0.25, age:0.45 } },
      { id:'yuni_sentinel', name:'Aegis Sentinel (Yuni Garrison)', char_type:'important_npc', people:'yuni', tier:'sentinel', body:'mpfb_male', seed:326,
        morph:{ stature:0.30, muscle:0.48, age:0.16 } },
      { id:'yuni_breacher', name:'Outback Breacher (Yuni Vanguard)', char_type:'important_npc', people:'yuni', tier:'breacher', body:'mpfb_male', seed:327,
        morph:{ stature:0.26, muscle:0.44, age:0.14 } },
      { id:'order_elder', name:'Chronicler-Elder Alaric (Historians)', char_type:'important_npc', people:'historians', tier:'elder', body:'mpfb_male', seed:328,
        morph:{ stature:0.20, age:0.48 } },
      { id:'jimjam_sibyl', name:'Dream-Sibyl Nyx (Jimjam)', char_type:'important_npc', people:'jimjam', tier:'sibyl', body:'mpfb_male', seed:329,
        morph:{ stature:0.12, proportions:0.24, age:-0.10 } },
      { id:'island_shaman', name:'Coral Shaman Tane (Islanders)', char_type:'important_npc', people:'islanders', tier:'shaman', body:'mpfb_male', seed:330,
        morph:{ stature:0.28, muscle:0.44, age:0.26 } },

      // Recruitable PCs
      { id:'pc_floral_envoy', name:'Sora (Xanadu Peony Envoy)', char_type:'pc', people:'xanadu', tier:'pc_floral_envoy', body:'mpfb_female', seed:401,
        morph:{ stature:0.08, muscle:0.18, proportions:0.22, age:-0.25 },
        makeup:{ lips_color:'#a82438', lips_amount:0.80, eyes_style:'winged', eyes_color:'#18141c', eyes_amount:0.75, blush_color:'#c85a64', blush_amount:0.45 } },
      { id:'pc_patchwork_sheriff', name:'Kaelen (Patchwork Sheriff)', char_type:'pc', people:'iron_republic', tier:'pc_patchwork_sheriff', body:'mpfb_male', seed:402,
        morph:{ stature:0.20, muscle:0.36, proportions:0.20, age:-0.10 } },
      { id:'pc_torgo_couture', name:'Altani (Torgo Gold-Brocade)', char_type:'pc', people:'rustic_clansmen', tier:'pc_torgo_couture', body:'mpfb_female', seed:403,
        morph:{ stature:0.16, muscle:0.22, proportions:0.26, age:-0.15 },
        makeup:{ lips_color:'#7a1c28', lips_amount:0.75, eyes_style:'smoky', eyes_color:'#121014', eyes_amount:0.80 } },
      { id:'pc_azure_emir', name:'Zahir (Abyssal Azure Emir)', char_type:'pc', people:'abyssal', tier:'pc_azure_emir', body:'mpfb_male', seed:404,
        morph:{ stature:0.24, muscle:0.28, age:0.05 } },
      { id:'pc_relic_lancer', name:'Remius (Order Relic-Lancer)', char_type:'pc', people:'historians', tier:'pc_relic_lancer', body:'mpfb_male', seed:405,
        morph:{ stature:0.28, muscle:0.44, proportions:0.22, age:0.10 } },

      // All 18 Geomancers
      { id:'geo_01_sultan_strider', name:'Rashid (01 Sultan Strider)', char_type:'geomancer', people:'geomancers', tier:'geo_01_sultan_strider', body:'mpfb_male', seed:501,
        morph:{ stature:0.10, muscle:0.22, age:0.18 } },
      { id:'geo_02_obelisk_acolyte', name:'Tariq (02 Obelisk Acolyte)', char_type:'geomancer', people:'geomancers', tier:'geo_02_obelisk_acolyte', body:'mpfb_male', seed:502,
        morph:{ stature:0.12, muscle:0.20, age:0.22 } },
      { id:'geo_03_ochre_lithomancer', name:'Malik (03 Ochre Lithomancer)', char_type:'geomancer', people:'geomancers', tier:'geo_03_ochre_lithomancer', body:'mpfb_male', seed:503,
        morph:{ stature:0.24, muscle:0.30, age:0.28 } },
      { id:'geo_04_crystal_warden', name:'Korgath (04 Crystal Warden)', char_type:'geomancer', people:'geomancers', tier:'geo_04_crystal_warden', body:'mpfb_male', seed:504,
        morph:{ stature:0.32, muscle:0.48, weight:0.20, age:0.25 } },
      { id:'geo_05_dune_chevalier', name:'Lyra (05 Dune Chevalier)', char_type:'geomancer', people:'geomancers', tier:'geo_05_dune_chevalier', body:'mpfb_female', seed:505,
        morph:{ stature:0.14, muscle:0.20, age:-0.15 } },
      { id:'geo_06_chime_oracle', name:'Batu (06 Chime Oracle)', char_type:'geomancer', people:'geomancers', tier:'geo_06_chime_oracle', body:'mpfb_male', seed:506,
        morph:{ stature:0.20, muscle:0.38, age:0.10 } },
      { id:'geo_07_exo_rig_engineer', name:'Vael (07 Exo-Rig Engineer)', char_type:'geomancer', people:'geomancers', tier:'geo_07_exo_rig_engineer', body:'mpfb_male', seed:507,
        morph:{ stature:0.18, muscle:0.34, age:0.12 } },
      { id:'geo_08_calcified_nomad', name:'Zev (08 Calcified Nomad)', char_type:'geomancer', people:'geomancers', tier:'geo_08_calcified_nomad', body:'mpfb_male', seed:508,
        morph:{ stature:0.15, muscle:0.28, age:0.08 } },
      { id:'geo_09_amber_alchemist', name:'Cael (09 Amber Alchemist)', char_type:'geomancer', people:'geomancers', tier:'geo_09_amber_alchemist', body:'mpfb_male', seed:509,
        morph:{ stature:0.16, proportions:0.22, age:0.05 } },
      { id:'geo_10_basalt_veteran', name:'Orlov (10 Basalt Veteran)', char_type:'geomancer', people:'geomancers', tier:'geo_10_basalt_veteran', body:'mpfb_male', seed:510,
        morph:{ stature:0.28, muscle:0.45, weight:0.15, age:0.20 } },
      { id:'geo_13_bamboo_surveyor', name:'Surya (13 Bamboo Surveyor)', char_type:'geomancer', people:'geomancers', tier:'geo_13_bamboo_surveyor', body:'mpfb_female', seed:511,
        morph:{ stature:0.10, proportions:0.20, age:-0.08 } },
      { id:'geo_14_lantern_mason', name:'Oren (14 Lantern Mason)', char_type:'geomancer', people:'geomancers', tier:'geo_14_lantern_mason', body:'mpfb_male', seed:512,
        morph:{ stature:0.20, proportions:0.18, age:0.30 } },
      { id:'geo_15_crescent_sage', name:'Azar (15 Crescent Sage)', char_type:'geomancer', people:'geomancers', tier:'geo_15_crescent_sage', body:'mpfb_female', seed:513,
        morph:{ stature:0.16, muscle:0.28, proportions:0.24, age:-0.12 } },
      { id:'geo_19_field_cartographer', name:'Dax (19 Field Cartographer)', char_type:'geomancer', people:'geomancers', tier:'geo_19_field_cartographer', body:'mpfb_male', seed:514,
        morph:{ stature:0.22, muscle:0.36, age:0.14 } },
      { id:'geo_20_geode_delver', name:'Aureon (20 Geode Delver)', char_type:'geomancer', people:'geomancers', tier:'geo_20_geode_delver', body:'mpfb_male', seed:515,
        morph:{ stature:0.30, muscle:0.46, age:0.16 } },
      { id:'geo_23_aether_scout', name:'Tetsuo (23 Aether Scout)', char_type:'geomancer', people:'geomancers', tier:'geo_23_aether_scout', body:'mpfb_male', seed:516,
        morph:{ stature:0.24, muscle:0.50, age:0.22 } },
      { id:'geo_24_jade_resonance_sage', name:'Nia (24 Jade Resonance Sage)', char_type:'geomancer', people:'geomancers', tier:'geo_24_jade_resonance_sage', body:'mpfb_female', seed:517,
        morph:{ stature:0.14, muscle:0.30, proportions:0.22, age:-0.10 } },
      { id:'geo_25_sphere_atlas', name:'Hakim (25 Sphere Atlas)', char_type:'geomancer', people:'geomancers', tier:'geo_25_sphere_atlas', body:'mpfb_male', seed:518,
        morph:{ stature:0.20, weight:0.16, age:0.34 } }
    ];
    BUILTIN_LIST.forEach(function(def){
      if(seen[def.id]) return;
      var p = PEOPLE[def.people];
      var b = D.bodies[def.body] ? def.body : body;
      var k = D.bodies[b] && D.bodies[b].kit;
      if(!k || k.style !== 'mpfb') return;
      var sex = b.replace(/^mpfb_/, '');
      var set = (p && p.outfits && p.outfits[sex] && p.outfits[sex][def.tier]) ||
                (D.geomancers && D.geomancers.outfits && D.geomancers.outfits[sex] && D.geomancers.outfits[sex][def.tier]);
      if(!set) return;
      var r = KCHAR.stranger(def.seed * 7919 + 31, k, p || null, 0.25);
      var has = function(id){ return k.items.some(function(it){ return it.id === id; }); };
      r.mods = ((p && p.mods) || []).concat(set.mods || []).filter(has);
      ['head', 'implant', 'torso', 'gloves', 'back', 'legs', 'feet'].forEach(function(sl){
        r.armour[sl] = set[sl] && has(set[sl]) ? set[sl] : null;
      });
      if(set.beard !== undefined) r.beard = set.beard && has(set.beard) ? set.beard : null;
      if(set.hair !== undefined) r.hair = set.hair && has(set.hair) ? set.hair : null;
      if(def.morph) Object.keys(def.morph).forEach(function(mk){ r.morph[mk] = def.morph[mk]; });
      if(def.facepaint) r.facepaint = JSON.parse(JSON.stringify(def.facepaint));
      if(def.makeup) r.makeup = JSON.parse(JSON.stringify(def.makeup));
      r.id = def.id; r.name = def.name; r.char_type = def.char_type;
      r.tier = def.tier; r.outfit_id = def.people + '.' + def.tier;
      seen[def.id] = 1;
      out.push(r);
    });
    return out;
  }
  function getNamedModels(){
    var base = buildDefaultNamedModels(), baked = loadBakedModels(), byId = {}, list = [];
    base.forEach(function(m){ byId[m.id] = m; list.push(m); });
    Object.keys(baked).forEach(function(id){
      var m = baked[id];
      if(!m || typeof m !== 'object') return;
      m.id = id;
      if(byId[id]){
        var idx = list.indexOf(byId[id]);
        list[idx] = m; byId[id] = m;
      } else {
        byId[id] = m; list.push(m);
      }
    });
    return list;
  }
  function getAllOutfits(kit, applyFilters){
    var curBody = (kit && kit.body) || body;
    var sex = curBody.replace(/^mpfb_/, ''), list = [], seenKey = {};
    var cOrder = {}; CLASS_LIST.forEach(function(c, i){ cOrder[c.id] = i; });
    var rOrder = {}; ROLE_LIST.forEach(function(r, i){ rOrder[r.id] = i; });
    var comments = loadComments();
    var onlyCommented = applyFilters && filterComments === 'commented';
    (D.peoples || []).forEach(function(p){
      var o = p.outfits && p.outfits[sex];
      if(!o || (applyFilters && !onlyCommented && wardrobe && wardrobe !== p.id)) return;
      var tierKeys = (p.tiers || []).map(function(t){ return t[0]; });
      Object.keys(o).forEach(function(k){ if(tierKeys.indexOf(k) < 0) tierKeys.push(k); });
      tierKeys.forEach(function(tier){
        if(!o[tier]) return;
        var set = o[tier];
        var cl = TIER_CLASS[tier] || (/^geomancer/.test(tier) ? 'trade' : 'commoner');
        var rl = TIER_ROLE[tier] || (/^geomancer/.test(tier) ? 'scholar' : 'trade');
        if(p.id === 'hykkousoi' && (tier === 'peasant' || tier === 'trade')) rl = 'maritime';
        if(p.id === 'dalabites' && tier === 'noble') cl = 'clergy';
        var tp = tierTypes(tier, set);
        var key = p.id + '.' + tier;
        var label = ((p.tier_labels || {})[tier] || set.label || tier);
        var item = { id:key, tier:tier, name:p.name + ' ' + label.toLowerCase(), set:set, p:p, cl:cl, rl:rl, tp:tp };
        if(applyFilters){
          if(onlyCommented){
            if(!getCommentForOutfit(item, comments)) return;
          } else {
            if(filterType !== 'all' && !tp[filterType]) return;
            if(filterClass !== 'all' && cl !== filterClass) return;
            if(filterRole !== 'all' && rl !== filterRole) return;
            if(filterComments === 'uncommented' && getCommentForOutfit(item, comments)) return;
          }
        }
        seenKey[tier] = 1;
        list.push(item);
      });
    });
    if(D.geomancers && D.geomancers.outfits && D.geomancers.outfits[sex]){
      var go = D.geomancers.outfits[sex];
      Object.keys(go).forEach(function(tier){
        if(seenKey[tier]) return;
        var set = go[tier], p = PEOPLE[set.culture] || { id:set.culture || 'dalabites', name:'Geomancer', mods:[] };
        if(applyFilters && !onlyCommented && wardrobe && wardrobe !== p.id) return;
        var tp = { geomancer:1, pc:1 };
        var item = { id:'geomancers.' + tier, tier:tier, name:(set.label || ('Geomancer ' + tier)), set:set, p:p, cl:'trade', rl:'scholar', tp:tp };
        if(applyFilters){
          if(onlyCommented){
            if(!getCommentForOutfit(item, comments)) return;
          } else {
            if(filterType !== 'all' && !tp[filterType]) return;
            if(filterClass !== 'all' && filterClass !== 'trade' && filterClass !== 'clergy') return;
            if(filterRole !== 'all' && filterRole !== 'scholar') return;
            if(filterComments === 'uncommented' && getCommentForOutfit(item, comments)) return;
          }
        }
        list.push(item);
      });
    }
    if(applyFilters && sortMode !== 'culture'){
      list.sort(function(a, b){
        if(sortMode === 'name') return a.name.localeCompare(b.name);
        if(sortMode === 'class' && (cOrder[a.cl] || 99) !== (cOrder[b.cl] || 99)) return (cOrder[a.cl] || 99) - (cOrder[b.cl] || 99);
        if(sortMode === 'role' && (rOrder[a.rl] || 99) !== (rOrder[b.rl] || 99)) return (rOrder[a.rl] || 99) - (rOrder[b.rl] || 99);
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }
  function findActiveOutfit(kit, r){
    var target = r || rec;
    var allOutfits = getAllOutfits(kit, false);
    var has = function(id){ return kit.items.some(function(it){ return it.id === id; }); };
    var OUTFIT_SLOTS = ['head', 'implant', 'torso', 'gloves', 'back', 'legs', 'feet'];
    return allOutfits.filter(function(x){
      return OUTFIT_SLOTS.every(function(sl){
        if(sl === 'implant' && !x.set.implant) return true;
        return ((target.armour && target.armour[sl]) || null) === (x.set[sl] && has(x.set[sl]) ? x.set[sl] : null);
      });
    })[0] || null;
  }
  function getActiveCommentTarget(kit, comments){
    var curBody = (kit && kit.body) || body;
    var map = comments || loadComments();
    var allNamed = getNamedModels();
    var curNamed = rec.id ? allNamed.filter(function(m){ return m.id === rec.id; })[0] : null;
    var curOutfit = findActiveOutfit(kit, rec);
    var torso = (rec.armour && rec.armour.torso) || null;
    var primaryKey, label, namedId = curNamed ? curNamed.id : (rec.id || null), outfitId = curOutfit ? curOutfit.id : (rec.outfit_id || null);
    if(namedId){
      primaryKey = 'named:' + namedId;
      label = (curNamed && curNamed.name) || rec.name || namedId;
    } else if(outfitId){
      primaryKey = 'outfit:' + outfitId;
      label = (curOutfit && curOutfit.name) || rec.outfit_name || outfitId;
    } else if(torso){
      primaryKey = 'torso:' + torso;
      var tItem = kit.items.filter(function(it){ return it.id === torso; })[0];
      label = (tItem ? tItem.name : torso) + ' (' + (BODY_LABEL[curBody] || curBody) + ')';
    } else {
      primaryKey = 'custom:' + curBody;
      label = 'Custom (' + (BODY_LABEL[curBody] || curBody) + ')';
    }
    var existing = map[primaryKey] || (curNamed && getCommentForNamed(curNamed, map)) || (curOutfit && getCommentForOutfit(curOutfit, map)) || null;
    if(existing && existing.key) primaryKey = existing.key;
    return {
      key: primaryKey,
      label: label,
      namedId: namedId,
      outfitId: outfitId,
      torso: torso,
      entry: existing
    };
  }
  function reviewCommentsUI(kit, gear){
    var comments = loadComments();
    var allEntries = commentList(comments);
    var target = getActiveCommentTarget(kit, comments);
    var curEntry = target.entry;
    var filterOpts = [
      { id:'all', name:'All Models & Outfits', domId:'chip-cfilter-all' },
      { id:'commented', name:'💬 Commented Only (' + allEntries.length + ')', domId:'chip-cfilter-commented' },
      { id:'uncommented', name:'Uncommented (' + Math.max(0, getNamedModels().length - allEntries.length) + ')', domId:'chip-cfilter-uncommented' }
    ];
    var s = section(gear, 'Outfit & Model Review Comments', allEntries.length ? (allEntries.length + ' commented') : 'Batch review & filter');
    chips(s, filterOpts, filterComments, function(id){
      filterComments = id || 'all';
      buildPanel();
    }, true);
    if(allEntries.length){
      var jumpItems = allEntries.map(function(e){
        return {
          id: e.key,
          name: (e.label || e.key),
          comment: e.text,
          domId: 'chip-cjump-' + e.key.replace(/[^a-zA-Z0-9_-]/g, '_')
        };
      });
      chips(s, jumpItems, target.entry ? target.entry.key : target.key, function(key){
        var e = comments[key];
        if(!e) return;
        if(e.record && typeof e.record === 'object'){
          var copy = JSON.parse(JSON.stringify(e.record));
          copy.armour = copy.armour || {}; copy.sliders = copy.sliders || {}; copy.dye = copy.dye || {}; copy.morph = copy.morph || {};
          saved[copy.body || body] = copy;
          if(copy.body && copy.body !== body && D.bodies[copy.body]) setBody(copy.body);
          else { rec = copy; buildPanel(); apply(); }
          note('Loaded commented model: ' + (e.label || key) + ' — "' + e.text + '"');
        }
      }, true);
    }
    var box = document.createElement('div');
    box.className = 'comment-box' + (curEntry && curEntry.text ? ' active-comment' : '');
    box.id = 'comment-box';
    var safeLabel = String(target.label || 'Current Model').replace(/</g, '&lt;');
    box.innerHTML = '<div class="comment-head"><span>Target: <b id="comment-target-label">' + safeLabel + '</b></span>' +
      '<span class="badge" id="comment-status-badge">' + (curEntry && curEntry.text ? '💬 Comment saved' : 'No comment') + '</span></div>' +
      '<textarea id="model-comment-input" rows="2" placeholder="Add review comment / issue note for this outfit or model (e.g. shoulder clipping, hair gap)…"></textarea>' +
      '<div class="row">' +
      '<button type="button" id="comment-save" class="btn-save-comment">Save Comment</button>' +
      '<button type="button" id="comment-clear">Mark Resolved / Clear</button>' +
      '<button type="button" id="comment-export">Copy All Comments JSON (' + allEntries.length + ')</button>' +
      '</div>';
    var inp = box.querySelector('#model-comment-input');
    var badge = box.querySelector('#comment-status-badge');
    var expBtn = box.querySelector('#comment-export');
    inp.value = (curEntry && curEntry.text) || '';
    function persistComment(silent){
      var txt = (inp.value || '').trim();
      var map = loadComments();
      var t = getActiveCommentTarget(kit, map);
      if(!txt){
        delete map[t.key];
        if(t.namedId) delete map['named:' + t.namedId];
        if(t.outfitId) delete map['outfit:' + t.outfitId];
        saveComments(map);
        box.classList.remove('active-comment');
        badge.textContent = 'No comment';
        if(!silent){ buildPanel(); note('Cleared comment on ' + t.label + '.'); }
        return;
      }
      var copyRec = JSON.parse(JSON.stringify(rec));
      copyRec.body = copyRec.body || body;
      var entry = {
        key: t.key,
        label: t.label,
        text: txt,
        namedId: t.namedId || null,
        outfitId: t.outfitId || null,
        torso: t.torso || null,
        hair: rec.hair || null,
        beard: rec.beard || null,
        body: copyRec.body,
        updated: new Date().toISOString(),
        record: copyRec
      };
      map[t.key] = entry;
      saveComments(map);
      box.classList.add('active-comment');
      var count = commentList(map).length;
      badge.textContent = silent ? '💬 Comment saved' : ('✓ Saved (' + count + ' total)');
      expBtn.textContent = 'Copy All Comments JSON (' + count + ')';
      var cChip = $('chip-cfilter-commented');
      if(cChip){ var sp = cChip.querySelector('span'); if(sp) sp.textContent = '💬 Commented Only (' + count + ')'; }
      if(!silent){
        buildPanel();
        note('Saved comment on ' + t.label + ' (' + count + ' commented model' + (count === 1 ? '' : 's') + ').');
      }
    }
    inp.addEventListener('input', function(){ persistComment(true); });
    inp.addEventListener('change', function(){ persistComment(true); });
    box.querySelector('#comment-save').addEventListener('click', function(){ persistComment(false); });
    box.querySelector('#comment-clear').addEventListener('click', function(){
      inp.value = '';
      persistComment(false);
    });
    expBtn.addEventListener('click', function(){
      var list = commentList(loadComments()).map(function(e){
        return {
          key: e.key,
          label: e.label,
          comment: e.text,
          namedId: e.namedId,
          outfitId: e.outfitId,
          body: e.body,
          torso: e.torso,
          hair: e.hair,
          beard: e.beard,
          updated: e.updated,
          record: e.record
        };
      });
      var payload = JSON.stringify(list, null, 2);
      $('rec-text').value = payload;
      (navigator.clipboard ? navigator.clipboard.writeText(payload) : Promise.reject())
        .then(function(){ note('Copied ' + list.length + ' model/outfit review comment(s) JSON to clipboard.'); },
              function(){ $('rec-text').select(); note('Placed ' + list.length + ' review comment(s) JSON in Record tab.'); });
    });
    s.appendChild(box);
  }
  function namedModelChips(kit, gear){
    var all = getNamedModels();
    var comments = loadComments();
    var onlyCommented = filterComments === 'commented';
    var filtered = all.filter(function(m){
      if(onlyCommented) return !!getCommentForNamed(m, comments);
      if(wardrobe && wardrobe !== 'library' && m.people && m.people !== wardrobe) return false;
      if(filterType !== 'all'){
        var mt = m.char_type || 'pc';
        if(filterType === 'geomancer' && mt !== 'geomancer' && !/geomancer/.test(m.id || '')) return false;
        if(filterType === 'pc' && mt !== 'pc' && mt !== 'geomancer') return false;
        if(filterType === 'important_npc' && mt !== 'important_npc') return false;
        if(filterType === 'npc' && mt !== 'npc') return false;
      }
      if(filterComments === 'uncommented' && getCommentForNamed(m, comments)) return false;
      return true;
    });
    var curId = rec.id || null;
    var curModel = all.filter(function(m){ return m.id === curId; })[0];
    var s = section(gear, 'Named NPC / PC Models (' + filtered.length + ')', curModel ? curModel.name : (rec.name || 'Custom / Unbaked'));
    if(filtered.length){
      chips(s, filtered.map(function(m){
        var tag = m.char_type === 'important_npc' ? ' [NPC★]' : m.char_type === 'geomancer' ? ' [Geo]' : ' [PC]';
        var cm = getCommentForNamed(m, comments);
        return { id:m.id, name:m.name + tag, domId:'chip-named-' + m.id, comment:cm ? cm.text : null };
      }), curId, function(id){
        var m = all.filter(function(x){ return x.id === id; })[0];
        if(!m) return;
        var copy = JSON.parse(JSON.stringify(m));
        copy.armour = copy.armour || {}; copy.sliders = copy.sliders || {}; copy.dye = copy.dye || {}; copy.morph = copy.morph || {};
        saved[copy.body] = copy;
        if(copy.body && copy.body !== body && D.bodies[copy.body]) setBody(copy.body);
        else { rec = copy; buildPanel(); apply(); }
        note('Loaded named ' + (copy.char_type === 'important_npc' ? 'Important NPC' : 'PC') + ': ' + copy.name + '.');
      }, true);
    }
    var box = document.createElement('div'); box.className = 'bake-box';
    var curType = rec.char_type || (filterType !== 'all' && filterType !== 'npc' ? filterType : 'pc');
    box.innerHTML = '<input type="text" id="bake-name" placeholder="Name (e.g. Tzintzun, Phil, Sora)…" aria-label="Character name">' +
      '<select id="bake-type" aria-label="Character role type">' +
      '<option value="pc">PC (Recruitable)</option>' +
      '<option value="important_npc">Important NPC</option>' +
      '<option value="geomancer">Geomancer Hero</option>' +
      '</select>' +
      '<div class="row">' +
      '<button type="button" id="bake-save" class="btn-bake">Bake Body/Face & Outfit</button>' +
      '<button type="button" id="bake-export">Copy Named JSON</button>' +
      '<button type="button" id="bake-delete">Delete Baked</button>' +
      '</div>';
    var nameInp = box.querySelector('#bake-name'), typeSel = box.querySelector('#bake-type');
    nameInp.value = rec.name || (curModel ? curModel.name : '');
    typeSel.value = curType;
    box.querySelector('#bake-save').addEventListener('click', function(){
      var rawName = (nameInp.value || '').trim() || ('Hero ' + (Object.keys(loadBakedModels()).length + 1));
      var slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'custom_hero';
      rec.id = slug;
      rec.name = rawName;
      rec.char_type = typeSel.value;
      var baked = loadBakedModels();
      baked[slug] = JSON.parse(JSON.stringify(rec));
      saveBakedModels(baked);
      syncPanel();
      buildPanel();
      note('Baked "' + rawName + '" (' + rec.char_type + ') with body, face morphs, and outfit settings.');
    });
    box.querySelector('#bake-export').addEventListener('click', function(){
      var payload = JSON.stringify(getNamedModels(), null, 2);
      $('rec-text').value = JSON.stringify(rec, null, 1);
      (navigator.clipboard ? navigator.clipboard.writeText(payload) : Promise.reject())
        .then(function(){ note('Copied all Named NPC/PC models JSON to clipboard.'); },
              function(){ $('rec-text').value = payload; $('rec-text').select(); note('Named models JSON placed in Record tab.'); });
    });
    box.querySelector('#bake-delete').addEventListener('click', function(){
      var baked = loadBakedModels(), targetId = rec.id || ( (nameInp.value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') );
      if(targetId && baked[targetId]){
        delete baked[targetId];
        saveBakedModels(baked);
        delete rec.id; delete rec.name;
        buildPanel();
        note('Removed baked override for "' + targetId + '".');
      } else {
        note('Pick a custom-baked model to delete or reset.');
      }
    });
    s.appendChild(box);
  }
  // a people's own outfits (data/peoples.json outfits): one chip per tier puts on its torso, gloves, legs and feet together
  function outfitChips(kit, gear){
    var curBody = (kit && kit.body) || body;
    var list = getAllOutfits(kit, true);
    if(!list.length){
      if(filterComments !== 'all'){
        section(gear, 'Outfits (0)', 'No ' + filterComments + ' outfits match current filters');
      }
      return;
    }
    var comments = loadComments();
    var has = function(id){ return kit.items.some(function(it){ return it.id === id; }); };
    var OUTFIT_SLOTS = ['head', 'implant', 'torso', 'gloves', 'back', 'legs', 'feet'];
    var cur = list.filter(function(x){ return OUTFIT_SLOTS.every(function(sl){
      if(sl === 'implant' && !x.set.implant) return true;
      return (rec.armour[sl] || null) === (x.set[sl] && has(x.set[sl]) ? x.set[sl] : null);
    }); })[0];
    var s = section(gear, 'Outfits (' + list.length + ')', cur ? cur.name : 'Mixed');
    chips(s, list.map(function(x){
      var cm = getCommentForOutfit(x, comments);
      return { id:x.id, name:x.name, domId:'chip-outfit-' + x.id.replace('.', '-'), comment:cm ? cm.text : null };
    }), cur ? cur.id : null, function(id){
      var x = list.filter(function(y){ return y.id === id; })[0];
      // the tier's mods (a temple guard's second pair of arms) and the people's (gills), before the clothes that fit them
      rec.mods = (x.p.mods || []).concat(x.set.mods || []).filter(has);
      OUTFIT_SLOTS.forEach(function(sl){
        rec.armour[sl] = x.set[sl] && has(x.set[sl]) ? x.set[sl] : null;
      });
      if(x.set.beard !== undefined) rec.beard = x.set.beard && has(x.set.beard) ? x.set.beard : null;
      if(x.set.hair !== undefined) rec.hair = x.set.hair && has(x.set.hair) ? x.set.hair : null;
      rec.facepaint = x.set.facepaint ? JSON.parse(JSON.stringify(x.set.facepaint)) : null;
      rec.makeup = x.set.makeup ? JSON.parse(JSON.stringify(x.set.makeup)) : null;
      rec.outfit_id = x.id;
      rec.outfit_name = x.name;
      var matchNamed = getNamedModels().filter(function(m){ return m.outfit_id === x.id && m.body === curBody; })[0];
      if(matchNamed){
        rec.id = matchNamed.id;
        rec.name = matchNamed.name;
      } else {
        delete rec.id;
        delete rec.name;
      }
      if(x.tp.important_npc) rec.char_type = 'important_npc';
      else if(x.tp.geomancer) rec.char_type = 'geomancer';
      else if(x.tp.pc) rec.char_type = 'pc';
      apply(); buildPanel();
    }, true);
  }
  var FP_STYLES = [
    { id:'none', name:'None' },
    { id:'woad_raider', name:'Woad Raider', c1:'#1f4e78', c2:'#d8e6f2' },
    { id:'eternian_court', name:'Eternian Sun', c1:'#d4a22a', c2:'#9e2424' },
    { id:'voth_jaguar', name:'Voth Jaguar', c1:'#c83e18', c2:'#1c1816' },
    { id:'skull_visage', name:'Skull Visage', c1:'#e8e4da', c2:'#18161a' },
    { id:'tear_blades', name:'Eye Blades', c1:'#1a1820', c2:'#9e1e28' },
    { id:'shaman_dots', name:'Shaman Dots', c1:'#7e281c', c2:'#f0e6d2' },
    { id:'chichani_drow', name:'Chichani Sigil', c1:'#4c246e', c2:'#c8a4e8' },
    { id:'half_split', name:'Half Split', c1:'#1c2430', c2:'#b82c28' },
    { id:'jaw_fangs', name:'Jaw Fangs', c1:'#1c1a18', c2:'#e8dfc8' },
    { id:'cyber_circuit', name:'Cyber Circuit', c1:'#20c8e8', c2:'#e0f8ff' },
    { id:'opera_swirl', name:'Opera Swirl', c1:'#a81c24', c2:'#181418' },
    { id:'war_tears', name:'War-Mask & Tears', c1:'#d81818', c2:'#141214' },
    { id:'harlequin_geo', name:'Geometric Harlequin', c1:'#f0eee8', c2:'#141216' },
    { id:'labyrinth_mandala', name:'Labyrinth Mandala', c1:'#b82028', c2:'#16141a' },
    { id:'frost_raider', name:'Frost-Ash Raider', c1:'#c8641c', c2:'#14181e' },
    { id:'island_boar', name:'Island Boar', c1:'#cc1c24', c2:'#141216' },
    { id:'ghost_stripes', name:'Ghost Tear-Stripes', c1:'#b81c24', c2:'#16161a' },
    { id:'teal_chevron', name:'Teal Cheek-Wedges', c1:'#186e7d', c2:'#161418' },
    { id:'sky_cat_stripes', name:'Cerulean Whiskers', c1:'#9cc2dc', c2:'#181c24' },
    { id:'ash_gold_pillar', name:'Ash & Gold Pillar', c1:'#e08a18', c2:'#181a1e' },
    { id:'seeker_chevrons', name:'Seeker Chevrons', c1:'#1a5b8c', c2:'#d8e6f2' },
    { id:'ochre_y_smudge', name:'Ochre & Wishbone', c1:'#b83c28', c2:'#f0ece2' },
    { id:'handprint_visor', name:'Visor & Handprint', c1:'#cc1420', c2:'#141216' },
    { id:'lotus_tendrils', name:'White Tendrils', c1:'#f2efe8', c2:'#1c1820' },
    { id:'ancestral_comb', name:'Ancestral Comb', c1:'#f2efe8', c2:'#6e1c20' },
    { id:'half_spiral_fret', name:'Half-Spiral Fret', c1:'#f2efe8', c2:'#18161a' },
    { id:'blackwork_triskelion', name:'Blackwork Triskelion', c1:'#141216', c2:'#e8e4da' },
    { id:'maya_temple_fret', name:'Maya Temple Fret', c1:'#141216', c2:'#c83e18' },
    { id:'halo_star_dots', name:'Halo & Star-Dots', c1:'#f4f0e8', c2:'#d4a22a' },
    { id:'marigold_skull', name:'Marigold Cutout Skull', c1:'#f05a1a', c2:'#18161a' }
  ];
  var FP_PALETTE = ['#1f4e78', '#1c1820', '#9e2424', '#c83e18', '#f05a1a', '#d4a22a', '#e8e4da', '#4c246e', '#20c8e8', '#186e7d', '#9cc2dc', '#e08a18', '#2d6e3e'];
  var LIP_PALETTE = ['#a82438', '#781828', '#c44a58', '#b85d48', '#8a3248', '#421624', '#1c161e', '#c8963e', '#28b8d8'];
  var EYE_STYLES = [
    { id:'none', name:'None' },
    { id:'kohl', name:'Kohl Liner' },
    { id:'winged', name:'Winged Liner' },
    { id:'smoky', name:'Smoky Shadow' },
    { id:'court_gold', name:'Court Shimmer' },
    { id:'gothic', name:'Gothic Dark' }
  ];
  var EYE_PALETTE = ['#18141c', '#3b261e', '#4c246e', '#1f4e78', '#c89a32', '#781c2e', '#246852', '#20c8e8'];
  var BLUSH_PALETTE = ['#c85a64', '#d87a68', '#a83848', '#b86852', '#8e3858', '#d49a58'];
  var MAKEUP_PRESETS = [
    { id:'none', name:'None', mk:null },
    { id:'natural_rose', name:'Natural Rose', mk:{ lips_color:'#b8525c', lips_amount:0.55, eyes_style:'winged', eyes_color:'#2c1e18', eyes_amount:0.45, blush_color:'#c85a64', blush_amount:0.40 } },
    { id:'royal_court', name:'Royal Court', mk:{ lips_color:'#a82438', lips_amount:0.85, eyes_style:'winged', eyes_color:'#18141c', eyes_amount:0.80, blush_color:'#c85a64', blush_amount:0.55 } },
    { id:'kohl_berry', name:'Kohl & Berry', mk:{ lips_color:'#781828', lips_amount:0.80, eyes_style:'kohl', eyes_color:'#141218', eyes_amount:0.90, blush_color:'#a83848', blush_amount:0.35 } },
    { id:'smoky_glam', name:'Smoky Glam', mk:{ lips_color:'#9e3848', lips_amount:0.75, eyes_style:'smoky', eyes_color:'#241a2e', eyes_amount:0.85, blush_color:'#b85864', blush_amount:0.45 } },
    { id:'golden_empress', name:'Golden Empress', mk:{ lips_color:'#9e2824', lips_amount:0.85, eyes_style:'court_gold', eyes_color:'#d4a22a', eyes_amount:0.90, blush_color:'#c86848', blush_amount:0.45 } },
    { id:'gothic_vampy', name:'Gothic Vampy', mk:{ lips_color:'#28101a', lips_amount:0.92, eyes_style:'gothic', eyes_color:'#16121c', eyes_amount:0.92, blush_color:'#782838', blush_amount:0.25 } },
    { id:'cyber_neon', name:'Cyber Neon', mk:{ lips_color:'#20b8d8', lips_amount:0.85, eyes_style:'winged', eyes_color:'#20c8e8', eyes_amount:0.90, blush_color:'#b84888', blush_amount:0.45 } }
  ];
  function miniSlider(box, id, label, val, set){
    var row = document.createElement('div'); row.className = 'sl';
    row.innerHTML = '<label for="' + id + '">' + label + '</label><output for="' + id + '"></output>' +
      '<input type="range" id="' + id + '" min="0" max="1" step="0.01">';
    var inp = row.querySelector('input'), out = row.querySelector('output');
    inp.value = val; out.textContent = (+val).toFixed(2);
    inp.addEventListener('input', function(){ out.textContent = (+inp.value).toFixed(2); set(+inp.value); });
    box.appendChild(row);
  }
  function faceCosmeticControls(headp){
    var fp = rec.facepaint || { style:'none', color1:'#1f4e78', color2:'#d8e6f2', amount:0.85 };
    var fpCur = FP_STYLES.filter(function(x){ return x.id === (fp.style || 'none'); })[0] || FP_STYLES[0];
    var fps = section(headp, 'Face paint', fpCur.name);
    chips(fps, FP_STYLES.map(function(x){ return { id:x.id, name:x.name, domId:'chip-fp-' + x.id }; }), fp.style || 'none', function(id){
      if(!id || id === 'none'){ delete rec.facepaint; }
      else {
        var st = FP_STYLES.filter(function(x){ return x.id === id; })[0] || {};
        rec.facepaint = { style:id, color1:st.c1 || fp.color1 || '#1f4e78', color2:st.c2 || fp.color2 || '#d8e6f2', amount:fp.amount != null ? fp.amount : 0.85 };
      }
      apply(); buildPanel();
    }, true);
    if(fp.style && fp.style !== 'none'){
      swatches(fps, 'Primary', 'fp-c1-pick', fp.color1 || '#1f4e78', FP_PALETTE, function(c){ rec.facepaint = rec.facepaint || fp; rec.facepaint.color1 = c; apply(); });
      swatches(fps, 'Accent', 'fp-c2-pick', fp.color2 || '#d8e6f2', FP_PALETTE, function(c){ rec.facepaint = rec.facepaint || fp; rec.facepaint.color2 = c; apply(); });
      miniSlider(fps, 'sl-fp-amount', 'Opacity', fp.amount != null ? fp.amount : 0.85, function(v){ rec.facepaint = rec.facepaint || fp; rec.facepaint.amount = v; apply(); });
    }

    var mk = rec.makeup || {};
    var hasMk = (mk.lips_amount > 0.01) || (mk.eyes_style && mk.eyes_style !== 'none' && mk.eyes_amount > 0.01) || (mk.blush_amount > 0.01);
    var mks = section(headp, 'Makeup', hasMk ? 'Custom / Active' : 'None');
    chips(mks, MAKEUP_PRESETS.map(function(p){ return { id:p.id, name:p.name, domId:'chip-mk-preset-' + p.id }; }), !hasMk ? 'none' : null, function(id){
      var pr = MAKEUP_PRESETS.filter(function(p){ return p.id === id; })[0];
      if(!pr || !pr.mk) delete rec.makeup;
      else rec.makeup = JSON.parse(JSON.stringify(pr.mk));
      apply(); buildPanel();
    }, true);
    function ensureMk(){ if(!rec.makeup) rec.makeup = { lips_color:'#a82438', lips_amount:0, eyes_style:'none', eyes_color:'#18141c', eyes_amount:0, blush_color:'#c85a64', blush_amount:0 }; return rec.makeup; }
    swatches(mks, 'Lips', 'mk-lip-pick', mk.lips_color || '#a82438', LIP_PALETTE, function(c){ var m = ensureMk(); m.lips_color = c; if(!(m.lips_amount > 0.02)) m.lips_amount = 0.75; apply(); buildPanel(); });
    miniSlider(mks, 'sl-mk-lips', 'Lipstick', mk.lips_amount || 0, function(v){ ensureMk().lips_amount = v; apply(); });
    chips(mks, EYE_STYLES.map(function(x){ return { id:x.id, name:x.name, domId:'chip-mk-eye-' + x.id }; }), mk.eyes_style || 'none', function(id){
      var m = ensureMk(); m.eyes_style = id;
      if(id !== 'none' && !(m.eyes_amount > 0.02)) m.eyes_amount = 0.75;
      apply(); buildPanel();
    }, true);
    if(mk.eyes_style && mk.eyes_style !== 'none'){
      swatches(mks, 'Eye shade', 'mk-eye-pick', mk.eyes_color || '#18141c', EYE_PALETTE, function(c){ ensureMk().eyes_color = c; apply(); });
      miniSlider(mks, 'sl-mk-eyes', 'Eye makeup', mk.eyes_amount != null ? mk.eyes_amount : 0.75, function(v){ ensureMk().eyes_amount = v; apply(); });
    }
    swatches(mks, 'Blush', 'mk-blush-pick', mk.blush_color || '#c85a64', BLUSH_PALETTE, function(c){ var m = ensureMk(); m.blush_color = c; if(!(m.blush_amount > 0.02)) m.blush_amount = 0.45; apply(); buildPanel(); });
    miniSlider(mks, 'sl-mk-blush', 'Cheek blush', mk.blush_amount || 0, function(v){ ensureMk().blush_amount = v; apply(); });
  }
  function buildMpfb(kit, gear, headp){
    reviewCommentsUI(kit, gear);
    wardrobeChips(kit, gear);
    namedModelChips(kit, gear);
    modChips(kit, gear);
    outfitChips(kit, gear);
    ['head', 'implant', 'torso', 'gloves', 'back', 'legs', 'feet'].forEach(function(slot){ var s = itemChips(gear, kit, slot, SLOT_LABEL[slot]); if(s) dyeRow(s, slot); });
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
    var frogPal = (KCHAR.mods(rec, kit).filter(function(m){ return m.pattern && m.pattern.palette; })[0] || {}).pattern;
    frogPal = frogPal && frogPal.palette;
    swatches(sk, 'Skin', 'skin-pick', rec.skin || '#d6ad8f', frogPal ? frogPal.skin : cur ? [0, 0.25, 0.5, 0.75, 1].map(function(u){ return KCHAR.along(cur.skin, u); }) : SKIN_ANY,
             function(c){ rec.skin = c; apply(); }, !!frogPal);
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
    var imps = itemChips(headp, kit, 'implant', SLOT_LABEL.implant);
    if(imps) dyeRow(imps, 'implant');
    // a frog's skin (a worn mod with pattern, tools/amphibian.py): the marks' and the pale parts' colours, the kind of
    // pattern and how much of the skin it takes (record skin2, skin3, pattern, pattern_amount)
    var pat = null, beast = false;
    KCHAR.mods(rec, kit).forEach(function(m){ if(m.pattern) pat = m.pattern; if(m.replaces_head) beast = true; });
    if(!beast) faceCosmeticControls(headp);
    if(pat){
      var pt = section(headp, 'Pattern', rec.pattern || pat.kind);
      var pal = pat.palette || {};
      swatches(pt, 'Marks', 'skin2-pick', rec.skin2 || pat.skin2, pal.skin2 || SKIN_ANY, function(c){ rec.skin2 = c; apply(); }, !!pal.skin2);
      swatches(pt, 'Pale', 'skin3-pick', rec.skin3 || pat.skin3, pal.skin3 || SKIN_ANY, function(c){ rec.skin3 = c; apply(); }, !!pal.skin3);
      chips(pt, [{ id:'none', name:'None' }, { id:'spots', name:'Spots' }, { id:'net', name:'Net' }, { id:'marble', name:'Marbled' }].map(function(x){
        return { id:x.id, name:x.name, domId:'chip-pattern-' + x.id };
      }), rec.pattern || pat.kind, function(id){ rec.pattern = id; apply(); buildPanel(); }, true);
      var row = document.createElement('div'); row.className = 'sl';
      row.innerHTML = '<label for="sl-pattern-amount">Amount</label><output for="sl-pattern-amount"></output>' +
        '<input type="range" id="sl-pattern-amount" min="0" max="1" step="0.01">';
      var inp = row.querySelector('input'), out = row.querySelector('output');
      inp.value = rec.pattern_amount != null ? rec.pattern_amount : pat.amount; out.textContent = (+inp.value).toFixed(2);
      inp.addEventListener('input', function(){ rec.pattern_amount = +inp.value; out.textContent = (+inp.value).toFixed(2); apply(); });
      pt.appendChild(row);
    }
    var es = section(headp, 'Eyes', '');
    swatches(es, 'Eye colour', 'eye-pick', rec.eye_color || (pat && pat.eye_color) || '#5a3a22', beast ? EYES_BEAST : cur && cur.eyes ? cur.eyes : EYES_ANY,
             function(c){ rec.eye_color = c; apply(); });
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

  window.__KCHAR_STAGE = {
    getCam: function(){ return cam; },
    getFig: function(){ return fig; },
    getRec: function(){ return rec; },
    setCam: function(y, p, d, ty){
      if(y != null) cam.yaw = y;
      if(p != null) cam.pitch = cam.want.pitch = p;
      if(d != null) cam.dist = cam.want.dist = d;
      if(ty != null) cam.ty = cam.want.ty = ty;
    },
    loadComments: loadComments,
    saveComments: saveComments
  };
  boot();
})();
