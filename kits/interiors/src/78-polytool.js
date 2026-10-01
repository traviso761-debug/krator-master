/* ======================== Polygon tool ========================
   Repo README "DEV TOOLS": P (or the toolbar button) turns it on. Each click on the ground
   (a click, not a drag) adds a point, snapped to 5 cm, at floor height; Backspace drops the
   last one, Escape clears. The panel shows the outline as [[x,z], ...] — ROOM()'s poly
   format — ready to copy, with its area. Its points are drawn as a yellow line.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors;
  const panel = document.getElementById('poly'), btn = document.getElementById('polyBtn');
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2), hit = new THREE.Vector3();
  const pts = [];
  let on = false, line = null, down = null;
  function redraw() {
    if (line) { scene.remove(line); line.geometry.dispose(); line = null; }
    if (pts.length) {
      const g = new THREE.BufferGeometry().setFromPoints(pts.concat(pts.length > 2 ? [pts[0]] : []).map(function (p) { return new THREE.Vector3(p[0], 0.26, p[1]); }));
      line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffe14a, depthTest: false }));
      line.renderOrder = 11; scene.add(line);
    }
    const area = pts.length > 2 ? Math.abs(IX.geom.area(pts)).toFixed(2) + ' m²' : '';
    panel.textContent = 'polygon tool — click to add, Backspace undo, Esc clear\n' + JSON.stringify(pts) + (area ? '\narea ' + area : '');
  }
  function setOn(v) { on = v; btn.classList.toggle('on', on); panel.style.display = on ? 'block' : 'none'; if (on) redraw(); else if (line) { scene.remove(line); line = null; } }
  renderer.domElement.addEventListener('mousedown', function (e) { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('mouseup', function (e) {
    if (!on || !down || e.button !== 0 || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return;
    pts.push([Math.round(hit.x * 20) / 20, Math.round(hit.z * 20) / 20]);
    redraw();
  });
  btn.onclick = function () { setOn(!on); };
  window.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === 'p') setOn(!on);
    else if (on && k === 'backspace') { pts.pop(); redraw(); e.preventDefault(); }
    else if (on && k === 'escape') { pts.length = 0; redraw(); }
  });
  window._polytool = { points: pts, setOn: setOn };
})();
