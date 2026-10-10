/* ==== the editor page: stage, camera, panel. [web] (host code; Godot builds its own UI over kchar.gd) ====
   KCHAR_DATA (build.py): { sliders, bodies: { male: { skeleton, kit }, female: {...} } }. The pieces are fetched when a
   record needs them: pieces/<key>.txt (a base64 GLB), or KCHAR_GLB[key] when build.py inlined them. Chip pictures are
   thumbs/<key>__<mesh>.png (tools/thumbs.mjs). Everything the panel changes goes through one record and fig.apply().
*/
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };
  var SLOT_LABEL = { torso:'Torso & arms', legs:'Legs', feet:'Feet' };
  var BASE_HEIGHT = { male:1.75, female:1.68 };
  var rec, fig, renderer, scene, camera, clock = new THREE.Clock(), body = 'male';
  var start = {
    male:   { body:'male', head:'base_m', hair:'hair_m_long', beard:null, armour:{ torso:'bronze', legs:'scout', feet:'bone' }, sliders:{}, dye:{} },
    female: { body:'female', head:'base_f', hair:'hair_f_braids', beard:null, armour:{ torso:'f_hide', legs:'f_scout', feet:'f_bone' }, sliders:{}, dye:{} }
  };
  var saved = { male:null, female:null };

  /* ---- pieces ---- */
  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  var cache = {};
  function load(key){
    if(!cache[key]){
      var bytes = (typeof KCHAR_GLB !== 'undefined' && KCHAR_GLB[key]) ? Promise.resolve(b64(KCHAR_GLB[key])) :
        fetch('pieces/' + key + '.txt').then(function(r){ if(!r.ok) throw new Error(key + ': ' + r.status); return r.text(); }).then(b64);
      cache[key] = bytes.then(function(buf){ return new Promise(function(ok, no){ new THREE.GLTFLoader().parse(buf, '', ok, no); }); });
    }
    return cache[key];
  }
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
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 0.85));
    var key = new THREE.DirectionalLight(0xffe2b8, 1.25); key.position.set(1.6, 3.2, 2.4); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -1.2; key.shadow.camera.right = key.shadow.camera.top = 1.2;
    key.shadow.bias = -0.0005; scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fc3ff, 0.55); rim.position.set(-2, 2.5, -2.5); scene.add(rim);
    var floor = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.ShadowMaterial({ opacity:0.28 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.64, 64), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.12 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);
    bindStage(renderer.domElement);
    bindPanel();
    window.addEventListener('resize', resize); resize();
    requestAnimationFrame(frame);
    setBody('male');
  }

  function setBody(b){
    if(rec) saved[body] = rec;
    body = b;
    if(fig) fig.dispose();
    fig = new KCharFigure(D.bodies[b], D.sliders, load);
    scene.add(fig.group);
    rec = saved[b] || JSON.parse(JSON.stringify(start[b]));
    ['male', 'female'].forEach(function(x){ $('body-' + x).setAttribute('aria-pressed', x === b); });
    buildPanel();
    var clip = document.querySelector('[data-clip][aria-pressed="true"]');
    $('loading').hidden = false;
    var done = apply().then(function(){ $('loading').hidden = true; return fig.play(clip ? clip.dataset.clip || null : 'idle'); });
    window._kchar = { fig:fig, ready:done, record:function(){ return rec; },
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
    camera.position.set(Math.sin(cam.yaw) * cp * cam.dist, cam.ty + Math.sin(cam.pitch) * cam.dist, Math.cos(cam.yaw) * cp * cam.dist);
    camera.lookAt(0, cam.ty, 0);
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
  function chips(box, items, current, onPick){
    var grid = document.createElement('div'); grid.className = 'chips';
    items.forEach(function(it){
      var b = document.createElement('button'); b.className = 'chip'; b.id = it.domId;
      b.setAttribute('aria-pressed', it.id === current);
      b.innerHTML = (it.img ? '<img alt="" loading="lazy" src="' + it.img + '">' : '<span class="none"></span>') + '<span>' + it.name + '</span>';
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

    sliderEls = {};
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
        sliderEls[s.id] = { row:row, input:inp, out:row.querySelector('output') };
        page.appendChild(row);
      });
    });
    syncPanel();
  }

  function syncPanel(){
    Object.keys(sliderEls).forEach(function(id){
      var v = +(rec.sliders[id] || 0), e = sliderEls[id];
      e.input.value = v; e.out.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
      e.row.classList.toggle('changed', v !== 0);
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
    ['male', 'female'].forEach(function(b){ $('body-' + b).addEventListener('click', function(){ if(b !== body) setBody(b); }); });
    var pick = $('idle-pick');
    D.bodies.male.skeleton.clips.filter(function(c){ return c.group === 'idle'; }).forEach(function(c){
      var o = document.createElement('option'); o.value = c.name; o.textContent = c.label + ' · ' + c.seconds.toFixed(1) + ' s';
      pick.appendChild(o);
    });
    pick.value = 'idle';
    pick.addEventListener('change', function(){ $('clip-idle').dataset.clip = pick.value; $('clip-idle').click(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(b){
      b.addEventListener('click', function(){
        fig.play(b.dataset.clip || null);
        Array.prototype.forEach.call(document.querySelectorAll('[data-clip]'), function(o){ o.setAttribute('aria-pressed', o === b); });
      });
    });
    $('cam-body').addEventListener('click', function(){ view(false); });
    $('cam-face').addEventListener('click', function(){ view(true); });
    $('spin').addEventListener('click', function(){ cam.spin = !cam.spin; $('spin').setAttribute('aria-pressed', cam.spin); });
    var seed = 1;
    $('rec-random').addEventListener('click', function(){ rec = KCHAR.random(seed++ * 7919, D.sliders, D.bodies[body].kit); buildPanel(); apply(); note('Rolled stranger #' + (seed - 1) + '.'); });
    $('rec-reset').addEventListener('click', function(){ rec.sliders = {}; apply(); note('Sliders back to the pieces as made.'); });
    $('rec-copy').addEventListener('click', function(){
      var t = $('rec-text');
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
        .then(function(){ note('Copied.'); }, function(){ t.select(); note('Selected: press Ctrl+C or ⌘C to copy.'); });
    });
    $('rec-load').addEventListener('click', function(){
      try {
        var r = JSON.parse($('rec-text').value);
        if(!D.bodies[r.body]) throw new Error('body must be male or female');
        r.armour = r.armour || {}; r.sliders = r.sliders || {}; r.dye = r.dye || {};
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
      var p = fig.pose, cm = Math.round(BASE_HEIGHT[body] * p.root * 100 + p.lift * 100 * p.root);
      $('stats').innerHTML = 'Height <b>' + cm + ' cm</b> · Leg lift <b>' + (p.lift >= 0 ? '+' : '−') + Math.abs(p.lift * 100).toFixed(1) + ' cm</b><br>' +
        'Pieces <b>' + Object.keys(fig.live).filter(function(k){ return fig.live[k].visible; }).length + '</b> (base body, head, hair, armour)';
    }).catch(function(e){ note('A piece failed to load: ' + e.message); });
  }

  boot();
})();
