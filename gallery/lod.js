/* Krator LOD: a level of detail for any Krator world page, applied from outside the world.
 *
 * gallery/build_gallery.py --lod CONFIG puts this script first in each page's <head>, after a line that sets
 * window.KRATOR_LOD = {slug, level, levels}. It never changes how a world is built, only how three.js draws it:
 *   pixelRatio   cap on the drawing resolution (1 = one pixel per screen pixel; below 1 renders smaller and
 *                scales up: blurrier, much less GPU work)
 *   antialias    false turns the renderer's multisampling off
 *   shadows      false turns shadow maps off
 *   shadowMax    cap on any light's shadow map size (px)
 *   cullPx       hide a mesh while it would cover fewer than this many pixels on screen (0: never)
 *   fps          cap on frames drawn per second (0: no cap)
 * The level "high" (no settings) leaves the page exactly as built: nothing below is hooked.
 *
 * The level comes from, first to last: ?lod=NAME in the address, the viewer's last choice for this world (the LOD
 * button in the corner; kept in this browser only), the world's level in the config, then "high". Changing it
 * reloads the page, because a renderer's antialiasing and compiled shaders are fixed once it exists.
 */
(function () {
  'use strict';
  var C = window.KRATOR_LOD || {}, LEVELS = C.levels || {}, KEY = 'krator-lod:' + (C.slug || location.pathname);
  var names = Object.keys(LEVELS);
  function valid(n) { return n && Object.prototype.hasOwnProperty.call(LEVELS, n); }
  var level = null;
  try { level = new URLSearchParams(location.search).get('lod'); } catch (e) {}
  if (!valid(level)) { try { level = localStorage.getItem(KEY); } catch (e) { level = null; } }
  if (!valid(level)) level = valid(C.level) ? C.level : (valid('high') ? 'high' : names[0]);
  var S = LEVELS[level] || {};
  window.KRATOR_LOD.active = level;

  // ---- the corner button: shows the level; a click cycles to the next one and reloads ----
  function button() {
    if (!names.length || !document.body) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'LOD: ' + level;
    b.title = 'Level of detail for this world. Click to change it (the page reloads).';
    b.setAttribute('style', 'position:fixed;left:8px;bottom:8px;z-index:2147483647;font:11px/1.2 system-ui,sans-serif;' +
      'padding:4px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.35);background:rgba(20,20,24,.55);' +
      'color:#eee;cursor:pointer;opacity:.7');
    b.onmouseenter = function () { b.style.opacity = '1'; };
    b.onmouseleave = function () { b.style.opacity = '.7'; };
    b.onclick = function () {
      var next = names[(names.indexOf(level) + 1) % names.length];
      try { localStorage.setItem(KEY, next); } catch (e) {}
      var u = new URL(location.href);
      if (u.searchParams.has('lod')) u.searchParams.set('lod', next);
      location.replace(u.toString());
    };
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', button); else button();

  var hooked = ['pixelRatio', 'antialias', 'shadows', 'shadowMax', 'cullPx', 'fps'].some(function (k) { return S[k] !== undefined && S[k] !== null; });
  if (!hooked) return;   // "high": the page exactly as built

  // ---- wait for three.js to define THREE.WebGLRenderer, then wrap it ----
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
