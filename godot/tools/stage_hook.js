// Injected before a page's scripts (godot/tools/export_spike.py, compare_shots.py): records what the page renders each
// frame (its renderer and the scenes it draws, in order: a sky scene, then the world), so KSTAGE.capture
// (core/biome/44-core-stage.js) can render the sky the way the page does. Also records every PerspectiveCamera made.
// three's UMD wrapper assigns an empty THREE first and fills it after, so the classes are caught as they are assigned.
(() => {
  window.__cams = []; window.__kstage = { last: null, cur: null };
  let T;
  Object.defineProperty(window, 'THREE', { configurable: true, get() { return T; }, set(v) {
    T = v; let K, R;
    Object.defineProperty(v, 'PerspectiveCamera', { configurable: true, enumerable: true, get() { return K; }, set(P) {
      K = class extends P { constructor(...a) { super(...a); window.__cams.push(this); } }; } });
    Object.defineProperty(v, 'WebGLRenderer', { configurable: true, enumerable: true, get() { return R; }, set(G) {
      R = function(...a) { const r = new G(...a), render = r.render.bind(r), H = window.__kstage;
        r.render = function(s, c) {
          if (r.getRenderTarget() === null && s && s.isScene && c && c.isPerspectiveCamera) {   // a post-processing quad is not the world
            if (!H.cur || H.cur.frame !== H.frame) { if (H.cur && H.cur.scenes.length) H.last = H.cur; H.cur = { frame: H.frame, renderer: r, scenes: [] }; }
            if (H.cur.scenes.indexOf(s) < 0) H.cur.scenes.push(s);
          }
          return render(s, c); };
        return r; };
      R.prototype = G.prototype; } });
  } });
  window.__kstage.frame = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { window.__kstage.frame++; cb(t); });
})();
