/* ======================== View: cut-away and level selector (THREE) ========================
   SPEC "What to build first" 4, after Yuni's Cutaway control (settlements/yuni/src/76-doors.js),
   which clips the whole city at 2.4 m. Here each shell decides per wall, every frame:
     'cut'   (default) roofs hidden; every exterior wall whose outer face looks toward the camera
             drops to a knee-high stub, so you look over it into the room; the far walls stay
             whole; partitions drop to stubs too
     'fade'  roofs hidden; camera-facing walls turn 16 % opaque glass
     'roof'  roofs hidden, walls whole
     'off'   everything drawn
   LEVEL: setLevel(k) hides every storey above k (its floor, walls, stairs, doors, and anything
   tagged with tag(obj, k)); the cut applies to the highest storey still shown, the storeys under
   it stay whole. setLevel(Infinity) (the default) shows every storey. A roof shows only in 'off'
   with every storey shown.
   IX.view.cutaway.add(shellGroup); .setMode(m); .setLevel(k); .tag(obj, level); .update(camera)
   once per frame (cheap: one dot product per wall). A shell is a single room (50-shell.js) or a
   planned building (51-building.js); a single-room shell is storey 0.
   ====================================================================== */
(function (IX) {
  'use strict';
  const V = IX.view = IX.view || {};
  const MODES = ['cut', 'fade', 'roof', 'off'];
  const C = V.cutaway = { mode: 'cut', level: Infinity, shells: [], tagged: [], MODES: MODES };
  C.add = function (grp) { if (grp && grp.userData.shell) C.shells.push(grp.userData.shell); };
  C.setMode = function (m) { if (MODES.indexOf(m) >= 0) C.mode = m; C._dirty = true; return C.mode; };
  C.next = function () { return C.setMode(MODES[(MODES.indexOf(C.mode) + 1) % MODES.length]); };
  C.setLevel = function (k) { C.level = k == null ? Infinity : k; return C.level; };
  C.maxLevel = function () { let m = 0; for (const S of C.shells) m = Math.max(m, S.top || 0); return m; };
  C.tag = function (obj, level) { if (obj) C.tagged.push({ obj: obj, level: level || 0 }); };
  C.untag = function (obj) { C.tagged = C.tagged.filter(function (t) { return t.obj !== obj; }); };
  C.shows = function (level) { return (level || 0) <= C.level; };
  function setMat(g, m) { g.traverse(function (o) { if (o.isMesh && o.material !== m && o.userData.part === 'wall' && !o.material.transparent) { o.userData._solid = o.material; o.material = m; } }); }
  function restore(g) { g.traverse(function (o) { if (o.isMesh && o.userData._solid) { o.material = o.userData._solid; o.userData._solid = null; } }); }
  C.update = function (cam) {
    const px = cam.position.x, pz = cam.position.z, mode = C.mode;
    for (const S of C.shells) {
      const top = S.top || 0, shown = Math.min(top, C.level);
      S.roof.visible = mode === 'off' && C.level >= top;
      if (S.levels) for (const L of S.levels) L.group.visible = L.k <= C.level;
      for (const W of S.walls) {
        const lv = W.level || 0;
        if (lv > C.level) continue;               /* its storey's group is hidden */
        const atTop = lv === shown;
        const facing = W.partition ? true : (px - W.mid[0]) * W.out[0] + (pz - W.mid[1]) * W.out[1] > 0;
        const cut = atTop && facing && mode === 'cut', fade = atTop && facing && !W.partition && mode === 'fade';
        W.full.visible = !cut; W.stub.visible = cut;
        if (fade !== !!W._faded) { if (fade) setMat(W.full, S.mats.fade); else restore(W.full); W._faded = fade; }
      }
    }
    for (const T of C.tagged) T.obj.visible = T.level <= C.level;
  };
})(KratorInteriors);
