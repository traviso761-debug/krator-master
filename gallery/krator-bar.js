/* Krator bar: the way between Krator worlds, and each world's level of detail, applied from outside the world.
 *
 * gallery/build_gallery.py --lod CONFIG puts this script first in each world's <head>, after a line that sets
 * window.KRATOR_BAR = {slug, level, levels, scenes, sections, home, extra}. It never changes how a world is built.
 *
 * THE BAR, top centre (the one place no Krator world uses; at the bottom on a phone-width screen):
 *   Scenes   a panel of every Krator world, grouped as on the gallery, the current one marked (Escape closes it)
 *   LOD      the level of detail: pick one and the page reloads with it
 *   Home     back to the gallery
 * Clicks and keys on the bar stop there, so a world never sees them as a click on the scene.
 *
 * THE LEVEL OF DETAIL only changes how three.js draws:
 *   pixelRatio   cap on the drawing resolution (1 = one pixel per screen pixel; below 1 renders smaller and
 *                scales up: blurrier, much less GPU work)
 *   antialias    false turns the renderer's multisampling off
 *   shadows      false turns shadow maps off
 *   shadowMax    cap on any light's shadow map size (px)
 *   cullPx       hide a mesh while it would cover fewer than this many pixels on screen (0: never)
 *   fps          cap on frames drawn per second (0: no cap)
 * A level with no settings ("high") leaves the page exactly as built: nothing below the bar is hooked.
 * The level comes from, first to last: ?lod=NAME in the address, the viewer's last choice for this world (kept in
 * this browser only), the world's level in the config, then "high". Changing it reloads the page, because a
 * renderer's antialiasing and compiled shaders are fixed once it exists.
 */
(function () {
  'use strict';
  var C = window.KRATOR_BAR || {}, LEVELS = C.levels || {}, KEY = 'krator-lod:' + (C.slug || location.pathname);
  var names = Object.keys(LEVELS);
  function valid(n) { return n && Object.prototype.hasOwnProperty.call(LEVELS, n); }
  var level = null;
  try { level = new URLSearchParams(location.search).get('lod'); } catch (e) {}
  if (!valid(level)) { try { level = localStorage.getItem(KEY); } catch (e) { level = null; } }
  if (!valid(level)) level = valid(C.level) ? C.level : (valid('high') ? 'high' : names[0]);
  var S = LEVELS[level] || {};
  C.active = level;

  // ======================================================================== the bar
  var STYLE = '#krator-bar{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483646;display:flex;gap:6px;' +
    'font:13px Georgia,serif;letter-spacing:.04em}' +
    '#krator-bar button{background:rgba(18,14,58,.78);color:#e8c98a;border:1px solid #c99a55;padding:6px 11px;' +
    'font:inherit;letter-spacing:inherit;border-radius:2px;cursor:pointer;white-space:nowrap}' +
    '#krator-bar button:hover,#krator-bar button[aria-expanded="true"]{background:#c99a55;color:#1a1040}' +
    '.krator-pop{position:fixed;top:48px;left:50%;transform:translateX(-50%);z-index:2147483646;display:none;' +
    'background:rgba(13,11,46,.96);border:1px solid #c99a55;padding:8px;font:14px Georgia,serif;color:#e8c98a;' +
    'max-height:calc(100% - 70px);overflow:auto;box-sizing:border-box}' +
    '.krator-pop.open{display:grid}' +
    '#krator-scenes{width:min(640px,calc(100% - 24px));grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px}' +
    '#krator-lod{width:min(300px,calc(100% - 24px));gap:5px}' +
    '.krator-pop .sub{grid-column:1/-1;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b89a70;margin:6px 0 0}' +
    '.krator-pop a{display:block;text-decoration:none;background:rgba(18,14,58,.78);color:#e8c98a;border:1px solid #6a5a8a;' +
    'padding:7px 10px;border-radius:2px}' +
    '.krator-pop a:hover{border-color:#c99a55}' +
    '.krator-pop a[aria-current="true"]{background:#c99a55;color:#1a1040}' +
    '.krator-pop a small{display:block;font-size:11px;opacity:.75;margin-top:2px;letter-spacing:0}' +
    // a phone: the worlds' own pickers fill the top left, so the bar sits at the bottom and its panels open upward
    '@media (max-width:720px){#krator-bar{top:auto;bottom:10px}.krator-pop{top:auto;bottom:48px}}';

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function shield(e) {   // a click, key or scroll on the bar is the bar's, not the world's
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'wheel', 'touchstart', 'touchend',
     'contextmenu', 'keydown', 'keyup'].forEach(function (t) { e.addEventListener(t, function (ev) { ev.stopPropagation(); }); });
  }
  function describe(lv) {
    var s = LEVELS[lv] || {}, bits = [];
    if (s.pixelRatio) bits.push('resolution ' + s.pixelRatio + 'x');
    if (s.antialias === false) bits.push('no smoothing');
    if (s.shadows === false) bits.push('no shadows'); else if (s.shadowMax) bits.push('shadows ' + s.shadowMax + ' px');
    if (s.cullPx) bits.push('skips specks under ' + s.cullPx + ' px');
    if (s.fps) bits.push(s.fps + ' fps');
    return bits.length ? bits.join(' · ') : 'exactly as built';
  }

  function bar() {
    if (!document.body || document.getElementById('krator-bar')) return;
    var st = el('style', {id: 'krator-bar-style'}); st.textContent = STYLE; document.head.appendChild(st);
    var b = el('div', {id: 'krator-bar', role: 'navigation', 'aria-label': 'Krator'});
    var scenesP = el('div', {id: 'krator-scenes', 'class': 'krator-pop', role: 'dialog', 'aria-label': 'Krator worlds'});
    var lodP = el('div', {id: 'krator-lod', 'class': 'krator-pop', role: 'dialog', 'aria-label': 'Level of detail'});
    var pops = [];
    function button(label, title, fn) {
      var x = el('button', {type: 'button', title: title}, label);
      x.addEventListener('click', function () { fn(x); x.blur(); });
      b.appendChild(x); return x;
    }
    function popper(label, title, panel) {
      var x = button(label, title, function () {
        var open = !panel.classList.contains('open');
        pops.forEach(function (p) { p[1].classList.remove('open'); p[0].setAttribute('aria-expanded', 'false'); });
        panel.classList.toggle('open', open); x.setAttribute('aria-expanded', String(open));
      });
      x.setAttribute('aria-expanded', 'false'); pops.push([x, panel]); return x;
    }

    // Scenes: grouped as on the gallery
    var scenes = C.scenes || [], here = C.slug;
    if (scenes.length) {
      (C.sections || []).forEach(function (sec) {
        var list = scenes.filter(function (s) { return s.section === sec.key; });
        if (!list.length) return;
        scenesP.appendChild(el('div', {'class': 'sub'}, sec.title));
        list.forEach(function (s) {
          var a = el('a', {href: s.href, title: s.blurb || ''}, s.name);
          if (s.slug === here) a.setAttribute('aria-current', 'true');
          scenesP.appendChild(a);
        });
      });
      if (C.extra && C.extra.length) {
        scenesP.appendChild(el('div', {'class': 'sub'}, 'Elsewhere on this site'));
        C.extra.forEach(function (x) { scenesP.appendChild(el('a', {href: x.href, title: x.blurb || ''}, x.name)); });
      }
      popper('Scenes', 'Every Krator world', scenesP);
    }

    // LOD: pick one, the page reloads with it
    if (names.length) {
      names.forEach(function (n) {
        var a = el('a', {href: '#'}, n);
        a.appendChild(el('small', {}, describe(n)));
        if (n === level) a.setAttribute('aria-current', 'true');
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (n === level) { lodP.classList.remove('open'); return; }
          try { localStorage.setItem(KEY, n); } catch (e) {}
          var u = new URL(location.href);
          if (u.searchParams.has('lod')) u.searchParams.set('lod', n);
          location.replace(u.toString());
        });
        lodP.appendChild(a);
      });
      popper('LOD: ' + level, 'Level of detail for this world (the page reloads)', lodP);
    }

    button('Home', 'Back to the Krator Worlds gallery', function () { location.href = C.home || '/'; });

    [b, scenesP, lodP].forEach(shield);
    document.body.appendChild(b); document.body.appendChild(scenesP); document.body.appendChild(lodP);
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') pops.forEach(function (p) { p[1].classList.remove('open'); p[0].setAttribute('aria-expanded', 'false'); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();

  // ======================================================================== the level of detail
  var hooked = ['pixelRatio', 'antialias', 'shadows', 'shadowMax', 'cullPx', 'fps'].some(function (k) { return S[k] !== undefined && S[k] !== null; });
  if (!hooked) return;   // "high": the page exactly as built

  // wait for three.js to define THREE.WebGLRenderer, then wrap it
  var T;
  Object.defineProperty(window, 'THREE', {
    configurable: true, enumerable: true,
    get: function () { return T; },
    set: function (v) {
      T = v;
      if (!v || typeof v !== 'object') return;
      var R;
      Object.defineProperty(v, 'WebGLRenderer', {
        configurable: true, enumerable: true,
        get: function () { return R; },
        set: function (Orig) { R = wrapRenderer(Orig); }
      });
    }
  });

  function wrapRenderer(Orig) {
    function KratorLODRenderer(params) {
      params = Object.assign({}, params || {});
      if (S.antialias === false) params.antialias = false;
      var r = new Orig(params);
      tune(r);
      return r;
    }
    KratorLODRenderer.prototype = Orig.prototype;
    Object.setPrototypeOf(KratorLODRenderer, Orig);
    return KratorLODRenderer;
  }

  function tune(r) {
    // resolution
    if (S.pixelRatio) {
      var setPR = r.setPixelRatio.bind(r);
      r.setPixelRatio = function (v) { setPR(Math.min(v || 1, S.pixelRatio)); };
      r.setPixelRatio(r.getPixelRatio());
    }
    var render = r.render.bind(r);
    var frame = 0, lastDecision = -1e9, skipFrame = false, lastDrawn = -1e9, pending = null;
    var cands = [], hidden = [], tmpV = null, tmpS = null;
    var interval = S.fps ? 1000 / S.fps : 0;

    function capShadows(scene) {
      scene.traverse(function (o) {
        if (!o.isLight || !o.shadow || !o.shadow.mapSize) return;
        var m = o.shadow.mapSize, cap = S.shadowMax;
        if (cap && (m.x > cap || m.y > cap)) {
          m.set(Math.min(m.x, cap), Math.min(m.y, cap));
          if (o.shadow.map) { o.shadow.map.dispose(); o.shadow.map = null; }
        }
      });
    }
    function collect(scene) {
      cands = [];
      scene.traverse(function (o) {
        if ((o.isMesh || o.isPoints || o.isLine) && !o.isInstancedMesh && o.frustumCulled !== false && o.geometry &&
            !(o.userData && o.userData.lodKeep)) cands.push(o);
      });
    }
    function cull(scene, camera) {
      if (!camera.isPerspectiveCamera) return;
      var THREE = T;
      if (!tmpV) { tmpV = new THREE.Vector3(); tmpS = new THREE.Vector3(); }
      // a sphere of radius rad at distance d covers about rad / d * k pixels of the drawing's height
      var h = r.domElement.height || 1, k = h / 2 * (camera.zoom || 1) / Math.tan(camera.fov * Math.PI / 360);
      var cx = camera.matrixWorld.elements[12], cy = camera.matrixWorld.elements[13], cz = camera.matrixWorld.elements[14];
      var out = [];
      for (var i = 0; i < cands.length; i++) {
        var o = cands[i];
        if (!o.visible) continue;
        var g = o.geometry;
        if (!g.boundingSphere) { if (!g.computeBoundingSphere) continue; g.computeBoundingSphere(); }
        var bs = g.boundingSphere;
        if (!bs || !(bs.radius > 0)) continue;
        tmpV.copy(bs.center).applyMatrix4(o.matrixWorld);
        tmpS.setFromMatrixScale(o.matrixWorld);
        var sc = Math.max(Math.abs(tmpS.x), Math.abs(tmpS.y), Math.abs(tmpS.z)) || 1;
        var dx = tmpV.x - cx, dy = tmpV.y - cy, dz = tmpV.z - cz, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        var rad = bs.radius * sc;
        if (d <= rad) continue;
        if (rad / d * k < S.cullPx) out.push(o);
      }
      return out;
    }

    r.render = function (scene, camera) {
      // frame cap: decide once per animation frame, so every pass of a multi-pass frame is drawn or skipped together
      if (interval) {
        var now = performance.now();
        if (now - lastDecision > 6) {
          lastDecision = now;
          skipFrame = now - lastDrawn < interval - 2;
          if (!skipFrame) lastDrawn = now;
        }
        if (skipFrame) {
          // a page that draws only on demand must still get its last frame: draw it when the cap allows
          if (pending) clearTimeout(pending);
          pending = setTimeout(function () { pending = null; lastDecision = -1e9; r.render(scene, camera); },   // a fresh decision: due now
            Math.max(0, interval - (now - lastDrawn)));
          return;
        }
        if (pending) { clearTimeout(pending); pending = null; }
      }
      if (scene && scene.traverse) {
        if (frame === 0 || frame % 120 === 0) {
          if (S.shadows === false) r.shadowMap.enabled = false;
          if (S.shadowMax) capShadows(scene);
          if (S.cullPx) collect(scene);
        }
        if (S.shadows === false) r.shadowMap.enabled = false;
        if (S.cullPx && camera && frame % 10 === 0) hidden = cull(scene, camera) || [];
        frame++;
        // hide only for the draw, and only what is visible right now, so the page's own logic never sees an
        // object made invisible and an object the page hid itself stays hidden
        var hid = [];
        for (var i = 0; i < hidden.length; i++) if (hidden[i].visible) { hidden[i].visible = false; hid.push(hidden[i]); }
        try { return render(scene, camera); }
        finally { for (var j = 0; j < hid.length; j++) hid[j].visible = true; }
      }
      return render(scene, camera);
    };
  }
})();
