/* ======================== Hover inspector ========================
   Hover inspector (repo README "DEV TOOLS"): toggle with T or the toolbar
   button. When on, the pointer names the instance under it, its class
   (furniture / flora / building) and its tags. Off by default; the click
   inspector (inspector.js) is always available for measuring and auditing.
   ====================================================================== */
(function () {
  'use strict';
  const tip = document.getElementById('hover');
  const btn = document.getElementById('hoverBtn');
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let on = false, pending = null;
  const CLASS = { furniture: 'furniture', plant: 'flora', building: 'building' };

  function tagsOf(u) {
    const A = u.asset, t = [];
    if (u.kind === 'furniture') {
      t.push('culture: ' + A.culture);
      if (A.tier) t.push('tier: ' + A.tier + (A.wealth ? ' (' + A.wealth[0] + '–' + A.wealth[1] + ')' : ''));
      if (A.type) t.push('type: ' + A.type);
      if (A.setting) t.push(A.setting);
      if (A.rooms) t.push('rooms: ' + A.rooms.join(', '));
      if (A.anchor) t.push('anchor: ' + A.anchor);
      if (A.materials) t.push('materials: ' + A.materials.join(', '));
    } else if (u.kind === 'plant') {
      t.push('climate: ' + A.climate, 'aridity: ' + A.aridity);
    } else {
      t.push('culture: ' + A.culture, 'family: ' + (A.family || '?'));
      if (A.types && A.types.length) t.push('types: ' + A.types.join(', '));
      if (A.districts && A.districts.length) t.push('districts: ' + A.districts.join(', '));
    }
    return t;
  }
  function describe(g) {
    const u = g.userData, A = u.asset;
    return '<div class="cls">' + (CLASS[u.kind] || u.kind) + '</div><b>' + A.name + '</b>' +
      (A.variants > 1 ? ' <span style="opacity:.6">#' + (u.opt.variant + 1) + '/' + A.variants + '</span>' : '') +
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
