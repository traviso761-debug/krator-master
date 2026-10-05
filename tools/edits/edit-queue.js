/* Krator edit queue (tools/edits/README.md). Injected by tools/edits/serve.py into every page it serves; no
   build includes it. Alt+click a spot in the world (or press the "Edit" button, then click), type what should
   change, Ctrl+Enter. The note goes to the server, which writes edits/pending/<id>.json for Claude to apply.
   Without the server (file://, the gallery) the record is copied to the clipboard instead.
   Reads the build's renderer (its render() call gives the scene and camera; ctl when present) and its inspector tooltip
   (#insp or #inspectTip); it changes nothing in the world. */
(function () {
  'use strict';
  // The scene and camera are taken from renderer.render itself, so a build that wraps its code and exports only
  // `renderer` (Girder exports window.scene and window.renderer, not its camera) works the same as one with globals.
  var tries = 0, drawn = null;
  function glob(n) { try { return (0, eval)(n); } catch (e) { return window[n]; } }   // a top-level const is not on window
  function hook() {
    var r = glob('renderer');
    if (typeof THREE === 'undefined' || !r || !r.render || !r.domElement) return null;
    if (!r.render._kEd) {
      var orig = r.render;
      r.render = function (s, c) {
        if (c && c.isPerspectiveCamera && s && s.isScene && (!drawn || drawn.scene === s || s.children.length >= drawn.scene.children.length))
          drawn = { scene: s, camera: c };
        return orig.apply(this, arguments);
      };
      r.render._kEd = true;
    }
    return r;
  }
  (function wait() {
    var r = hook();
    if (r) return init(r);
    if (++tries < 120) setTimeout(wait, 500);        // a minute: heavy worlds build their renderer late
    else console.warn('[edits] no renderer found: edit queue off');
  })();
  function S() { var g = glob('scene'); return g && g.isScene ? g : drawn && drawn.scene; }
  function C() { var g = glob('camera'); return drawn ? drawn.camera : g && g.isCamera ? g : null; }

  function init(renderer) {
    var cv = renderer.domElement, ray = new THREE.Raycaster(), armed = false, open = null, count = 0;
    var css = document.createElement('style');
    css.textContent =
      '#kEdBtn{position:fixed;right:12px;bottom:12px;z-index:9999;font:12px system-ui,sans-serif;padding:6px 10px;' +
      'border-radius:6px;border:1px solid #7a6a4a;background:#1d1a14e6;color:#f0e4c8;cursor:pointer}' +
      '#kEdBtn.on{background:#b8683e;color:#fff}' +
      '#kEdBox{position:fixed;z-index:10000;width:300px;font:12px system-ui,sans-serif;background:#1d1a14f2;color:#f0e4c8;' +
      'border:1px solid #7a6a4a;border-radius:8px;padding:8px;box-shadow:0 6px 24px #0008}' +
      '#kEdBox .ctx{opacity:.75;max-height:80px;overflow:auto;white-space:pre-wrap;margin-bottom:6px}' +
      '#kEdBox textarea{width:100%;box-sizing:border-box;height:70px;font:12px system-ui,sans-serif;background:#0e0c09;color:#fff;' +
      'border:1px solid #5a4e38;border-radius:4px;padding:4px}' +
      '#kEdBox .row{display:flex;gap:6px;justify-content:flex-end;margin-top:6px}' +
      '#kEdBox button{font:12px system-ui,sans-serif;padding:3px 10px;border-radius:4px;border:1px solid #7a6a4a;background:#2c261c;color:#f0e4c8;cursor:pointer}' +
      '#kEdToast{position:fixed;right:12px;bottom:48px;z-index:10000;font:12px system-ui,sans-serif;background:#1d1a14f2;color:#f0e4c8;' +
      'padding:6px 10px;border-radius:6px;display:none}';
    document.head.appendChild(css);
    var btn = document.createElement('button');
    btn.id = 'kEdBtn'; btn.title = 'Alt+click anywhere also works';
    btn.onclick = function () { armed = !armed; label(); };
    document.body.appendChild(btn);
    var toast = document.createElement('div'); toast.id = 'kEdToast'; document.body.appendChild(toast);
    function label() { btn.textContent = (armed ? 'Click a spot…' : 'Edit') + (count ? ' (' + count + ' queued)' : ''); btn.classList.toggle('on', armed); }
    function say(t) { toast.textContent = t; toast.style.display = 'block'; clearTimeout(say.t); say.t = setTimeout(function () { toast.style.display = 'none'; }, 3500); }
    label();
    fetch('/__edits?page=' + encodeURIComponent(location.pathname)).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) { count = j.pending; label(); } }).catch(function () {});

    // capture phase, so the build's own click handlers (inspector pick, polygon tool) never see this click
    cv.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !(e.altKey || armed) || open) return;
      e.preventDefault(); e.stopImmediatePropagation();
      armed = false; label();
      capture(e.clientX, e.clientY);
    }, true);

    function plain(v, depth) {          // userData, JSON-safe and short: no meshes, no big arrays
      if (v == null || typeof v === 'number' || typeof v === 'boolean') return v;
      if (typeof v === 'string') return v.length > 200 ? v.slice(0, 200) + '…' : v;
      if (typeof v === 'function' || depth > 2) return undefined;
      if (Array.isArray(v)) return v.length > 12 ? '[' + v.length + ' items]' : v.map(function (x) { return plain(x, depth + 1); });
      if (typeof v === 'object') {
        if (v.isObject3D || v.isMaterial || v.isBufferGeometry || v.isTexture) return '<' + (v.type || 'three') + '>';
        var o = {}, n = 0;
        for (var k in v) { if (n++ > 24) { o['…'] = 'more'; break; } var p = plain(v[k], depth + 1); if (p !== undefined) o[k] = p; }
        return o;
      }
      return undefined;
    }
    function r3(x) { return Math.round(x * 1000) / 1000; }
    function vec(v) { return v ? [r3(v.x), r3(v.y), r3(v.z)] : null; }

    function capture(cx, cy) {
      var v = new THREE.Vector2(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
      var camera = C(), scene = S();
      if (!camera || !scene) { say('No frame drawn yet: try again in a moment'); return; }
      ray.setFromCamera(v, camera);
      var hits = ray.intersectObjects(scene.children, true).filter(function (h) {
        for (var o = h.object; o; o = o.parent) if (o.visible === false) return false;
        return !(h.object.userData && h.object.userData.probeSkip && !h.object.userData.inspectLabel);
      });
      var h = hits[0], chain = [];
      if (h) for (var o = h.object; o && o !== scene; o = o.parent) {
        chain.push({ name: o.name || '', type: o.type, uuid: o.uuid, userData: plain(o.userData, 0) });
        if (chain.length >= 8) break;
      }
      var own = null;
      if (h && h.object.userData) {        // the build's own per-instance description, when it has one
        try { own = h.object.userData.inspectFn ? h.object.userData.inspectFn(h.instanceId) : (h.object.userData.inspectLabel || null); } catch (e) {}
      }
      // the named site at the point, from the build's own registry when it has one:
      // window._inspect.at (the Voth lineage: Girder, Locus, Mav's Refuge, Voth, Yuni), regAt (the Iziz lineage)
      var site = null;
      if (h) {
        try { var ia = window._inspect && window._inspect.at; if (ia) site = ia(h.point.x, h.point.y, h.point.z).filter(Boolean); } catch (e) {}
        try { var ra = glob('regAt'); if (!site && typeof ra === 'function') { var g = ra(h.point); if (g) site = [g.name || g.key || g.label].filter(Boolean); } } catch (e) {}
        if (site && !site.length) site = null;
      }
      var tip = document.getElementById('insp') || document.getElementById('inspectTip');
      var tipText = tip && tip.style.display !== 'none' ? (tip.innerText || '').trim() : '';
      var cam = { position: vec(camera.position) };
      var c2 = glob('ctl'); if (c2 && c2.target && c2.target.isVector3) cam.target = vec(c2.target);
      if (!cam.target) { var d = new THREE.Vector3(); camera.getWorldDirection(d); cam.direction = vec(d); }
      var rec = {
        page: location.pathname, title: document.title,
        screen: [cx, cy, innerWidth, innerHeight],
        point: h ? vec(h.point) : null, distance: h ? r3(h.distance) : null,
        instanceId: h && h.instanceId != null ? h.instanceId : null,
        face_normal: h && h.face ? vec(h.face.normal) : null,
        site: site, object: chain, inspector: own ? String(own).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
        tooltip: tipText, camera: cam
      };
      ask(rec, cx, cy);
    }

    function ask(rec, cx, cy) {
      var box = document.createElement('div'); box.id = 'kEdBox'; open = box;
      box.style.left = Math.min(innerWidth - 320, cx + 12) + 'px';
      box.style.top = Math.min(innerHeight - 220, cy + 12) + 'px';
      var o = rec.object[0], what = rec.inspector || rec.tooltip || (rec.site && rec.site.join(' · ')) || (o && (o.name || (o.userData && (o.userData.inspectLabel || o.userData.fam)) || o.type)) || 'empty ground / sky';
      box.innerHTML = '<div class="ctx"></div><textarea placeholder="What should change here?"></textarea>' +
        '<div class="row"><button data-k="x">Cancel</button><button data-k="ok">Queue (Ctrl+Enter)</button></div>';
      box.querySelector('.ctx').textContent = what + (rec.point ? '\n@ ' + rec.point.join(', ') : '');
      var ta = box.querySelector('textarea');
      document.body.appendChild(box); ta.focus();
      function close() { if (box.parentNode) box.parentNode.removeChild(box); open = null; }
      function send() {
        rec.note = ta.value.trim(); if (!rec.note) { ta.focus(); return; }
        close();
        fetch('/__edits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (j) { count = j.pending; label(); say('Queued ' + j.id); })
          .catch(function () {
            var txt = 'Krator edit request:\n```json\n' + JSON.stringify(rec, null, 1) + '\n```';
            (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
              .then(function () { say('No edit server: copied to the clipboard, paste it to Claude'); })
              .catch(function () { console.log(txt); say('No edit server: the request is in the console'); });
          });
      }
      // keys typed here must not drive the build's camera (WASD, F, T...)
      box.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Escape') close();
        else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send();
      });
      box.addEventListener('keyup', function (e) { e.stopPropagation(); });
      box.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      box.querySelector('[data-k=x]').onclick = close;
      box.querySelector('[data-k=ok]').onclick = send;
    }
  }
})();
