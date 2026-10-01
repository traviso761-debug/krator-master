/* ======================== View: cut-away (THREE) ========================
   SPEC "What to build first" 4, after Yuni's Cutaway control (settlements/yuni/src/76-doors.js),
   which clips the whole city at 2.4 m. Here each shell decides per wall, every frame:
     'cut'   (default) roofs hidden; every wall whose outer face looks toward the camera drops
             to a knee-high stub, so you look over it into the room; the far walls stay whole
     'fade'  roofs hidden; camera-facing walls turn 16 % opaque glass
     'roof'  roofs hidden, walls whole
     'off'   everything drawn
   IX.view.cutaway.add(shellGroup); .setMode(m); .update(camera) once per frame (cheap: one dot
   product per wall). A wall counts as facing the camera when the camera is on its outer side.
   ====================================================================== */
(function (IX) {
  'use strict';
  const V = IX.view = IX.view || {};
  const MODES = ['cut', 'fade', 'roof', 'off'];
  const C = V.cutaway = { mode: 'cut', shells: [], MODES: MODES };
  C.add = function (grp) { if (grp && grp.userData.shell) C.shells.push(grp.userData.shell); };
  C.setMode = function (m) { if (MODES.indexOf(m) >= 0) C.mode = m; C._dirty = true; return C.mode; };
  C.next = function () { return C.setMode(MODES[(MODES.indexOf(C.mode) + 1) % MODES.length]); };
  function setMat(g, m) { g.traverse(function (o) { if (o.isMesh && o.material !== m && o.userData.part === 'wall' && !o.material.transparent) { o.userData._solid = o.material; o.material = m; } }); }
  function restore(g) { g.traverse(function (o) { if (o.isMesh && o.userData._solid) { o.material = o.userData._solid; o.userData._solid = null; } }); }
  C.update = function (cam) {
    const px = cam.position.x, pz = cam.position.z, mode = C.mode;
    for (const S of C.shells) {
      S.roof.visible = mode === 'off';
      for (const W of S.walls) {
        const facing = (px - W.mid[0]) * W.out[0] + (pz - W.mid[1]) * W.out[1] > 0;
        const cut = facing && mode === 'cut', fade = facing && mode === 'fade';
        W.full.visible = !cut; W.stub.visible = cut;
        if (fade !== !!W._faded) { if (fade) setMat(W.full, S.mats.fade); else restore(W.full); W._faded = fade; }
      }
    }
  };
})(KratorInteriors);
