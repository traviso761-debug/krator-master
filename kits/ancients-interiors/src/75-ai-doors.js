/* ======================== Demo sheet: real doors and real glass (core/door; the owner, 2026-11-03) ========================
   "Doors that open and shut with a keypress nearby or by an NPC", and "real glass". kits/interiors' shell (50-shell.js, read
   in place: not this kit's to edit) hangs each door's leaf open 75 degrees and glazes a window in a pale lambert pane. Here,
   after the sheet is built, each shell's leaf becomes a door on core/door: a KDOOR record (id '<room id>.d<n>', standing open
   as the shell hung it), posed by KDOORHOST as it swings (E within reach opens or shuts it; the "E: open the door" tip shows
   near one), and each pane is KGLASS 'clear'. The leaf meshes stay the shell's, so the cut-away hides them as before.
   window._ancientsInteriors.openings() -> {doors, locked, leaves, panes, cards}.
   ====================================================================== */
(function () {
  'use strict';
  if (typeof KDOOR === 'undefined' || !window._ancientsInteriors) return;
  const S = window._ancientsInteriors, SW = KDOOR.SWING, A75 = 75 * Math.PI / 180;
  /* the open fraction KDOOR eases to a swing by (its smoothstep, inverted) */
  let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m * m * (3 - 2 * m) * SW < A75) lo = m; else hi = m; }
  const OPEN75 = (lo + hi) / 2;
  const glass = KGLASS.material(THREE, 'clear');
  let leaves = 0, panes = 0;
  for (const E of S.shells) {
    const room = E.room, g = E.group, sh = g.userData.shell;
    /* the panes: the shell's glass material, wherever it is used, is the clear kind */
    if (sh && sh.mats && sh.mats.glass) g.traverse(o => { if (o.isMesh && o.material === sh.mats.glass) { o.material = glass; panes++; } });
    /* the leaves, in the order the shell hung them */
    const meshes = []; g.children.forEach(o => { if (o.isMesh && o.userData.part === 'door') meshes.push(o); });
    const hung = room.doors.filter(d => !(d.swing === 'none' || !d.leaf));
    hung.forEach((d, i) => {
      const m = meshes[i]; if (!m) return;
      const left = [-d.n[1], d.n[0]], hs = d.hinge === 'right' ? -1 : 1, dir = d.swing === 'out' ? -1 : 1;
      const hx = d.at[0] + left[0] * hs * d.w / 2, hz = d.at[1] + left[1] * hs * d.w / 2;
      const lh = m.geometry.parameters.height, cy = m.position.y, sill = cy - lh / 2;
      /* the face looks away from the swing (KDOOR swings a leaf to the face's -z); the sign follows the hinge's jamb */
      const yaw = Math.atan2(-d.n[0] * dir, -d.n[1] * dir), ux = Math.cos(yaw), uz = -Math.sin(yaw);
      const sign = (ux * (hx - d.at[0]) + uz * (hz - d.at[1])) < 0 ? 1 : -1;
      const D = KDOOR.add({ id: room.id + '.d' + i, at: [d.at[0], sill, d.at[1]], hinge: [hx, sill, hz], p0: [d.at[0], cy, d.at[1]], yaw, sign,
        w: d.w - 0.04, h: lh, t: 0.05, open: OPEN75, key: room.id, name: 'door' });
      KDOORHOST.posed(D, (D, P) => { const vx = P[0] - hx, vz = P[2] - hz; m.position.set(P[0], P[1], P[2]); m.rotation.set(0, Math.atan2(-vz, vx), 0); });
      KDOORHOST.pose(D); leaves++;
    });
  }
  /* the frame: ease the doors (the engine's frame hook passes the clock in ms), and the tip */
  const walking = () => !!(typeof ctl !== 'undefined' && ctl.walk);
  const tip = KDOORHOST.tip(() => camera.position, walking);
  let last = null;
  (window._frameHooks = window._frameHooks || []).push(function (now) { const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000); last = now; KDOORHOST.tick(dt); tip(); });
  /* E: the door within reach (capture, ahead of the engine's E, which lifts the camera) */
  addEventListener('keydown', function (e) {
    if (e.key.toLowerCase() !== 'e' || e.repeat) return; const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (KDOORHOST.toggleNear(camera.position, walking())) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  S.openings = () => ({ doors: KDOOR.list.length, locked: KDOOR.list.filter(D => D.locked).length, leaves, panes, cards: 0 });
  window._openings = S.openings();
})();
