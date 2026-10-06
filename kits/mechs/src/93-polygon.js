/* ======================== Polygon tool ========================
   Polygon tool (repo README "DEV TOOLS"), the mechanism of the settlements'
   92-camera.js: toggle with P or the toolbar button, click the ground to lay
   a vertex, right-click to drop the last one. The panel holds copy-pasteable
   world coordinates ([x,z] or {x:,z:}), the format kits/interiors ROOM() takes
   for `poly`. It also names the nearest mech and the last vertex in that
   mech's local frame (+z forward), for placing things against it.
   (Copied from kits/motor-vehicles/src/93-polygon.js.)
   While it is on, a click adds a vertex instead of selecting in the inspector.
   ====================================================================== */
(function () {
  'use strict';
  const POLY = { on: false, pts: [], fmt: 0, grp: new THREE.Group() };
  scene.add(POLY.grp);
  const panel = document.getElementById('poly'), out = document.getElementById('polyout');
  const near = document.getElementById('polynear'), btn = document.getElementById('polyBtn');
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xff5060 }), lineMat = new THREE.LineBasicMaterial({ color: 0xffe060 });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  const r2 = (t) => Math.round(t * 100) / 100;

  function nearest(x, z) {
    let best = null, bd = 1e9;
    for (const g of INSTANCES) {
      const u = g.userData, dd = Math.hypot(u.x - x, u.z - z);
      if (dd < bd) { bd = dd; best = g; }
    }
    return best;
  }
  function redraw() {
    while (POLY.grp.children.length) POLY.grp.remove(POLY.grp.children[0]);
    for (const p of POLY.pts) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), dotMat);
      m.position.set(p[0], 0.3, p[1]); POLY.grp.add(m);
    }
    if (POLY.pts.length > 1) {
      const geo = new THREE.BufferGeometry().setFromPoints(POLY.pts.map(p => new THREE.Vector3(p[0], 0.05, p[1])));
      POLY.grp.add(new THREE.Line(geo, lineMat));
    }
    const f = p => POLY.fmt ? '{x:' + r2(p[0]) + ',z:' + r2(p[1]) + '}' : '[' + r2(p[0]) + ',' + r2(p[1]) + ']';
    out.value = '[' + POLY.pts.map(f).join(',') + ']';
    const last = POLY.pts[POLY.pts.length - 1], g = last && nearest(last[0], last[1]);
    if (g) {
      const u = g.userData, c = Math.cos(u.ry), s = Math.sin(u.ry), dx = last[0] - u.x, dz = last[1] - u.z;
      /* inverse of the frame's toWorld: lx = dx cos - dz sin, lz = dx sin + dz cos */
      near.textContent = 'nearest: ' + u.key + ' #' + (u.variant + 1) + ' — last vertex in its frame: [' +
        r2(dx * c - dz * s) + ',' + r2(dx * s + dz * c) + ']';
    } else near.textContent = '';
    window._poly = POLY.pts.slice();
  }
  function add(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) { POLY.pts.push([hit.x, hit.z]); redraw(); }
  }
  function setOn(v) {
    POLY.on = v; btn.classList.toggle('on', v); panel.style.display = v ? 'block' : 'none'; POLY.grp.visible = v;
  }
  /* a click (not a drag) adds or removes a vertex; captured before the inspector's own mouseup */
  let down = null;
  renderer.domElement.addEventListener('mousedown', (e) => { down = [e.clientX, e.clientY, e.button]; }, true);
  renderer.domElement.addEventListener('mouseup', (e) => {
    if (!POLY.on || !down) return;
    const click = Math.abs(e.clientX - down[0]) < 4 && Math.abs(e.clientY - down[1]) < 4;
    down = null;
    if (!click) return;
    if (e.button === 0) add(e.clientX, e.clientY);
    else if (e.button === 2) { POLY.pts.pop(); redraw(); }
    e.stopImmediatePropagation();
    ctl.dragging = false; ctl.panning = false;
  }, true);
  btn.onclick = () => setOn(!POLY.on);
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key.toLowerCase() === 'p') setOn(!POLY.on);
  });
  document.getElementById('polyundo').onclick = () => { POLY.pts.pop(); redraw(); };
  document.getElementById('polyclear').onclick = () => { POLY.pts = []; redraw(); };
  document.getElementById('polyclose').onclick = () => { if (POLY.pts.length > 2) { POLY.pts.push(POLY.pts[0].slice()); redraw(); } };
  document.getElementById('polyfmt').onclick = (e) => { POLY.fmt ^= 1; e.target.textContent = POLY.fmt ? 'Format: {x,z}' : 'Format: [x,z]'; redraw(); };
  document.getElementById('polycopy').onclick = () => {
    out.select();
    try { navigator.clipboard.writeText(out.value); } catch (err) { document.execCommand('copy'); }
  };
  window._polyTool = { setOn: setOn, add: add, state: POLY };
})();
