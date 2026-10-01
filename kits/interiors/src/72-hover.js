/* ======================== Hover inspector ========================
   The standard inspector toggle (repo README "DEV TOOLS"), after kits/catalog/src/92-hover.js:
   T or the toolbar button. When on, the pointer names what is under it, its class and tags:
     furniture   the catalog entry (culture, type, setting, rooms, anchor) plus the room it
                 furnishes, the requirement it fills and the role it was placed in
     room        a demo shell's floor, wall, roof or door: room kind, culture, wealth, size
     building    a planned building's floor, wall, stair, door or roof: storeys, rooms, roof
     walker      a figure of the life layer
   The click inspector (kits/catalog/inspector.js) still measures and audits pieces.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors;
  const tip = document.getElementById('hover'), btn = document.getElementById('hoverBtn');
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let on = false, pending = null;

  function furnTags(g) {
    const u = g.userData, A = u.asset, t = [], it = u.interior || {};
    t.push('culture: ' + A.culture);
    if (A.type) t.push('type: ' + A.type);
    if (A.setting) t.push(A.setting);
    t.push('rooms: ' + A.rooms.join(', '));
    t.push('anchor: ' + (A.anchor || 'floor'));
    if (it.room) t.push('in: ' + it.room);
    t.push(it.need ? 'required: ' + it.need : 'optional');
    if (it.role) t.push('placed: ' + it.role);
    return t;
  }
  function describe(hit) {
    if (hit.kind === 'furniture') {
      const u = hit.g.userData, A = u.asset;
      return '<div class="cls">furniture</div><b>' + A.name + '</b>' +
        (A.variants > 1 ? ' <span style="opacity:.6">#' + (u.opt.variant + 1) + '/' + A.variants + '</span>' : '') +
        '<br>' + furnTags(hit.g).map(function (s) { return '<span class="tag">' + s + '</span>'; }).join('');
    }
    if (hit.kind === 'building') {
      const I = window._interiors, B = I && I.buildings ? I.buildings.filter(function (b) { return b.id === hit.building; })[0] : null;
      if (!B) return '<div class="cls">building</div><b>' + hit.building + '</b>';
      const t = [B.levels.length + ' storey(s)', B.rooms.length + ' rooms', B.stairs.length + ' stair(s)', 'roof: ' + B.roof.kind, 'culture: ' + B.culture,
        'part: ' + hit.part + (hit.level != null ? ' (storey ' + hit.level + ')' : '')];
      return '<div class="cls">planned building</div><b>' + B.id + '</b><br>' + t.map(function (s) { return '<span class="tag">' + s + '</span>'; }).join('') +
        '<br><span style="opacity:.7">' + B.rooms.map(function (R) { return R.kind + '@' + R.level; }).join(' · ') + '</span>';
    }
    if (hit.kind === 'walker') return '<div class="cls">walker</div><b>' + hit.walker + '</b>';
    const R = IX.roomById[hit.room];
    const t = ['kind: ' + R.kind, 'culture: ' + R.culture, 'wealth: ' + R.wealth, R.area.toFixed(1) + ' m²', 'h ' + R.h + ' m',
      R.doors.length + ' door(s)', R.windows.length + ' window(s)', 'part: ' + hit.part];
    return '<div class="cls">room</div><b>' + R.id + '</b> <span style="opacity:.6">' + (R.building || '') + '</span><br>' +
      t.map(function (s) { return '<span class="tag">' + s + '</span>'; }).join('');
  }
  function pick(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((cx - r.left) / r.width) * 2 - 1;
    ndc.y = -((cy - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const shells = (window._interiors ? window._interiors.shells.concat(window._interiors.pickables || []) : []);
    const hits = ray.intersectObjects(INSTANCES.concat(shells), true);
    for (const h of hits) {
      let o = h.object;
      if (!o.visible) continue;
      let vis = true;
      for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
      if (!vis) continue;
      if (o.userData.room && o.userData.part) return { kind: 'room', room: o.userData.room, part: o.userData.part };
      if (o.userData.building && o.userData.part) return { kind: 'building', building: o.userData.building, part: o.userData.part, level: o.userData.level };
      if (o.userData.walker) return { kind: 'walker', walker: o.userData.walker };
      while (o && INSTANCES.indexOf(o) < 0) o = o.parent;
      if (o) return { kind: 'furniture', g: o };
    }
    return null;
  }
  function setOn(v) { on = v; btn.classList.toggle('on', on); if (!on) tip.style.display = 'none'; }
  renderer.domElement.addEventListener('mousemove', function (e) { if (on) pending = [e.clientX, e.clientY]; });
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (!on || !pending) return;
    const x = pending[0], y = pending[1]; pending = null;
    const h = pick(x, y);
    if (!h) { tip.style.display = 'none'; return; }
    tip.innerHTML = describe(h);
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
  window._hover = { setOn: setOn, pick: pick, describe: describe };
})();
