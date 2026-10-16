/* ======================== Hover inspector ========================
   Hover inspector (repo README "DEV TOOLS"): toggle with T or the toolbar button.
   When on, the pointer names the vehicle under it: name, variant, class, culture,
   its tags, and the simulation data a host reads (speed, seats, cargo, fuel, wheels).
   Adapted from kits/catalog/src/92-hover.js for vehicle groups (userData from
   KratorVehicles.build). Off by default.
   ====================================================================== */
(function () {
  'use strict';
  const tip = document.getElementById('hover');
  const btn = document.getElementById('hoverBtn');
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let on = false, pending = null;

  function tagsOf(u) {
    const T = u.tags || {}, D = u.data || {}, t = ['culture: ' + u.culture];
    for (const k of Object.keys(T)) t.push(k + ': ' + (Array.isArray(T[k]) ? T[k].join(', ') : T[k]));
    t.push('top speed ' + D.speed + ' m/s', 'seats ' + D.seats, 'cargo ' + D.cargo + ' kg', 'tank ' + D.tank + ' L',
      'wheels ' + (u.wheels || []).length + ' (' + (D.drive || '?') + ' drive)', u.tris + ' tris');
    return t;
  }
  function describe(g) {
    const u = g.userData;
    return '<div class="cls">' + ((u.tags && u.tags.class) || 'vehicle') + '</div><b>' + u.name + '</b>' +
      ' <span style="opacity:.6">#' + (u.variant + 1) + (u.variantName ? ' ' + u.variantName : '') + '</span>' +
      '<br>' + tagsOf(u).map(s => '<span class="tag">' + s + '</span>').join('');
  }
  function pick(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((cx - r.left) / r.width) * 2 - 1;
    ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(INSTANCES, true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && INSTANCES.indexOf(o) < 0) o = o.parent;
    return o;
  }
  function setOn(v) {
    on = v; btn.classList.toggle('on', on);
    if (!on) tip.style.display = 'none';
  }
  renderer.domElement.addEventListener('mousemove', function (e) {
    if (!on) return;
    pending = [e.clientX, e.clientY];
  });
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (!on || !pending) return;
    const [x, y] = pending; pending = null;
    const g = pick(x, y);
    if (!g) { tip.style.display = 'none'; return; }
    tip.innerHTML = describe(g);
    tip.style.display = 'block';
    tip.style.left = Math.min(x + 16, innerWidth - 360) + 'px';
    tip.style.top = (y + 16) + 'px';
  });
  btn.onclick = function () { setOn(!on); };
  window.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key.toLowerCase() === 't') setOn(!on);
  });
  window._hover = { setOn: setOn, describe: describe, tagsOf: tagsOf };
})();
