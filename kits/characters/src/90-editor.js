/* ==== the editor page: stage, camera, panel. [web] (host code; Godot builds its own UI over kchar.gd) ====
   Reads KCHAR_DATA and KCHAR_GLB (base64 GLBs, written by build.py), parses them, makes one KCharFigure and drives it
   from the panel. Everything the panel changes goes through one record (KCHAR's shape) and fig.apply(record).
*/
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };
  var SLOT_LABEL = { head:'Head', torso:'Torso & arms', hands:'Hands', legs:'Legs', feet:'Feet' };
  var BASE_HEIGHT = 1.69;   // Styv's crown, metres: the figure at height 0
  var rec = KCHAR.blank(D.outfits, 'styv');
  rec.slots = { head:'phil', torso:'bronze', hands:'hide', legs:'scout', feet:'bone' };
  var fig, renderer, scene, camera, clock = new THREE.Clock();

  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  /* a GLB inline (KCHAR_GLB, the single-file page) or fetched from pieces/ beside the page (the artifact copy) */
  function bytes(id){
    if(KCHAR_GLB[id]) return Promise.resolve(b64(KCHAR_GLB[id]));
    /* base64 text: the artifact host serves no binary type that a GLB fits */
    return fetch('pieces/' + id + '.txt').then(function(r){ if(!r.ok) throw new Error(id + '.txt: ' + r.status); return r.text(); }).then(b64);
  }
  function parse(id){ return bytes(id).then(function(buf){ return new Promise(function(ok, no){ new THREE.GLTFLoader().parse(buf, '', ok, no); }); }); }
  var ALL = ['anims'].concat(D.outfits.outfits.map(function(o){ return o.id; }));

  Promise.all(ALL.map(function(id){ return parse(id).then(function(g){ return [id, g]; }); }))
    .then(function(list){ var g = {}; list.forEach(function(x){ g[x[0]] = x[1]; }); start(g); })
    .catch(function(e){ $('loading').textContent = 'The outfits failed to load: ' + e.message; });

  /* ---- stage ---- */
  var cam = { yaw:0.35, pitch:0.1, dist:4.2, ty:0.9, want:{ dist:4.2, ty:0.9, pitch:0.1 }, spin:false };

  function start(gltfs){
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

    fig = new KCharFigure(D, gltfs);
    scene.add(fig.group);
    $('loading').hidden = true;
    buildPanel(gltfs);
    apply();
    fig.play('idle');
    bindStage(renderer.domElement);
    window.addEventListener('resize', resize); resize();
    requestAnimationFrame(frame);
    /* for verify.py: the figure, the record, and a way to set one */
    window._kchar = { fig:fig, record:function(){ return rec; }, set:function(r){ rec = r; apply(); } };
  }

  function resize(){
    var r = $('stage').getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
  }

  var hv = new THREE.Vector3();
  function frame(){
    var dt = Math.min(0.05, clock.getDelta());
    fig.update(dt);
    if(cam.spin) cam.yaw += dt * 0.5;
    var root = fig.pose.root;
    if(cam.face){ fig.headWorld(hv); cam.want.ty = hv.y + 0.06; }
    else { cam.want.ty = 0.9 * root; cam.want.dist = Math.max(cam.want.dist, 0); }
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
    if(!face) cam.want.ty = 0.9;
    $('cam-body').setAttribute('aria-pressed', !face); $('cam-face').setAttribute('aria-pressed', face);
  }

  /* ---- panel ---- */
  var sliderEls = {};
  function buildPanel(gltfs){
    var thumbs = makeThumbs();
    var gear = $('page-gear');
    D.outfits.slots.forEach(function(slot){
      var box = document.createElement('div'); box.className = 'slot';
      box.innerHTML = '<h3>' + SLOT_LABEL[slot] + ' <small></small></h3><div class="chips"></div>' +
        '<div class="dye"><label for="dye-' + slot + '">Dye</label><input type="color" id="dye-' + slot + '" value="#ffffff"><button id="undye-' + slot + '">Clear</button></div>';
      var chips = box.querySelector('.chips');
      D.outfits.outfits.forEach(function(o){
        if(!o.meshes[slot]) return;
        var b = document.createElement('button'); b.className = 'chip'; b.id = 'chip-' + slot + '-' + o.id;
        b.dataset.slot = slot; b.dataset.outfit = o.id;
        b.innerHTML = '<img alt="" src="' + (thumbs[o.id + '|' + slot] || '') + '"><span>' + o.name + '</span>';
        b.addEventListener('click', function(){ rec.slots[slot] = o.id; apply(); });
        chips.appendChild(b);
      });
      box.querySelector('input').addEventListener('input', function(e){ rec.dye[slot] = e.target.value; apply(); });
      box.querySelector('button#undye-' + slot).addEventListener('click', function(){ delete rec.dye[slot]; apply(); });
      gear.appendChild(box);
    });
    var gh = document.createElement('p'); gh.className = 'hint';
    gh.textContent = 'Where two neighbouring slots come from different outfits, each piece reaches a few centimetres over the cut, the outer one on top, so the seam stays covered.';
    gear.appendChild(gh);

    D.sliders.groups.forEach(function(group){
      var page = $('page-' + group.toLowerCase());
      if(group === 'Face'){
        var fh = document.createElement('p'); fh.className = 'hint';
        fh.textContent = 'The face sliders move ten points on whichever head is in the Head slot. A helmet hides most of what they do.';
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

    ['gear', 'body', 'face', 'record'].forEach(function(t){
      $('tab-' + t).addEventListener('click', function(){
        ['gear', 'body', 'face', 'record'].forEach(function(u){
          $('tab-' + u).setAttribute('aria-selected', u === t); $('page-' + u).hidden = u !== t;
        });
        if(t === 'face') view(true); else if(t === 'body' || t === 'gear') view(false);
      });
    });
    /* the idle picker: every clip in the idle group (skeleton.json clips); the Idle button plays the one picked */
    var pick = $('idle-pick');
    D.skeleton.clips.filter(function(c){ return c.group === 'idle'; }).forEach(function(c){
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
    $('rec-random').addEventListener('click', function(){ rec = KCHAR.random(seed++ * 7919, D.sliders, D.outfits); apply(); note('Rolled stranger #' + (seed - 1) + '.'); });
    $('rec-reset').addEventListener('click', function(){ rec.sliders = {}; apply(); note('Sliders back to the pieces as made.'); });
    $('rec-copy').addEventListener('click', function(){
      var t = $('rec-text');
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
        .then(function(){ note('Copied.'); }, function(){ t.select(); note('Selected: press Ctrl+C or ⌘C to copy.'); });
    });
    $('rec-load').addEventListener('click', function(){
      try {
        var r = JSON.parse($('rec-text').value), ids = D.outfits.outfits.map(function(o){ return o.id; });
        if(!r.slots || D.outfits.slots.some(function(s){ return ids.indexOf(r.slots[s]) < 0; })) throw new Error('every slot needs one of: ' + ids.join(', '));
        rec = { slots:r.slots, sliders:r.sliders || {}, dye:r.dye || {} }; apply(); note('Loaded.');
      } catch(e){ note('That record did not load: ' + e.message + '.'); }
    });
  }

  function note(t){ $('note').textContent = t; }

  /* a picture of each outfit's slot, drawn once from the same pieces */
  function makeThumbs(){
    var out = {}, r = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
    r.setSize(160, 160); r.outputEncoding = THREE.sRGBEncoding;
    var sc = new THREE.Scene(), c = new THREE.PerspectiveCamera(24, 1, 0.05, 20);
    sc.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 1.0));
    var l = new THREE.DirectionalLight(0xffe2b8, 0.9); l.position.set(1, 2, 3); sc.add(l);
    var FRAME = { head:[1.58, 0.5], torso:[1.2, 1.75], hands:[1.0, 1.9], legs:[0.6, 2.0], feet:[0.1, 0.95] };
    var box = new THREE.Box3(), ctr = new THREE.Vector3(), sz = new THREE.Vector3();
    D.outfits.outfits.forEach(function(o){
      D.outfits.slots.forEach(function(slot){
        var m = fig.slotMeshes(o.id, slot); if(!m) return;
        sc.add(m);
        box.setFromObject(m); box.getCenter(ctr); box.getSize(sz);
        var f = FRAME[slot], d = Math.max(sz.x, sz.y) * 0.5 / Math.tan(12 * Math.PI / 180) * 1.08;
        if(slot === 'head'){ ctr.y = Math.max(ctr.y, 1.55); d = Math.max(sz.x, 0.26) * 0.5 / Math.tan(12 * Math.PI / 180) * 1.25; }
        c.position.set(ctr.x + d * 0.25, ctr.y + d * 0.05, ctr.z + d); c.lookAt(ctr);
        r.render(sc, c);
        out[o.id + '|' + slot] = r.domElement.toDataURL('image/png');
        sc.remove(m);
      });
    });
    r.dispose();
    return out;
  }

  function apply(){
    fig.apply(rec);
    D.outfits.slots.forEach(function(slot){
      Array.prototype.forEach.call(document.querySelectorAll('.chip[data-slot="' + slot + '"]'), function(b){ b.setAttribute('aria-pressed', b.dataset.outfit === rec.slots[slot]); });
      var o = D.outfits.outfits.filter(function(x){ return x.id === rec.slots[slot]; })[0];
      var h = document.querySelector('#chip-' + slot + '-' + rec.slots[slot]);
      h && (h.closest('.slot').querySelector('h3 small').textContent = o ? o.name : '');
      var dye = $('dye-' + slot); if(dye) dye.value = (rec.dye && rec.dye[slot]) || '#ffffff';
    });
    Object.keys(sliderEls).forEach(function(id){
      var v = +(rec.sliders[id] || 0), e = sliderEls[id];
      e.input.value = v; e.out.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
      e.row.classList.toggle('changed', v !== 0);
    });
    var p = fig.pose, cm = Math.round(BASE_HEIGHT * p.root * 100 + p.lift * 100 * p.root);
    var shown = KCHAR.visible(rec, D.outfits).length;
    $('stats').innerHTML = 'Height <b>' + cm + ' cm</b> · Leg lift <b>' + (p.lift >= 0 ? '+' : '−') + Math.abs(p.lift * 100).toFixed(1) + ' cm</b><br>' +
      'Pieces <b>' + shown + '</b> (' + D.outfits.slots.length + ' slots + seam bands)';
    $('rec-text').value = JSON.stringify(rec, null, 1);
  }
})();
