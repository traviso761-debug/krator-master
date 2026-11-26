/* ======================== Demo sheet: real doors and real glass (core/door; the owner, 2026-11-03) ========================
   "Doors that open and shut with a keypress nearby or by an NPC", and "real glass". kits/interiors' shell (50-shell.js, read
   in place) registers each leaf it hangs as a KDOOR record itself (id '<room id>.d<n>', standing open 75 degrees as hung,
   posed through KDOORHOST.posed) and glazes its windows in KGLASS 'clear' (2026-11-09: the order-matching this file did
   before is gone). Here the sheet hosts them: the frame eases the doors (KDOORHOST.tick), E within reach opens or shuts one,
   and the "E: open the door" tip shows near one. The leaf meshes stay the shell's, so the cut-away hides them as before.
   The walk: every shell's floor and walls in core/walk (IX.walk.room) and the leaves' blocks (KDOOR.walk), so the sheet can run
   KWALK.reach (window._ancientsInteriors.reach(): every room reached from its street doors with the doors open).
   window._ancientsInteriors.openings() -> {doors, locked, leaves, panes, cards, walk}.
   ====================================================================== */
(function () {
  'use strict';
  if (typeof KDOOR === 'undefined' || !window._ancientsInteriors) return;
  const S = window._ancientsInteriors, glass = KGLASS.material(THREE, 'clear');
  let leaves = 0, panes = 0;
  for (const E of S.shells) {
    const sh = E.group.userData.shell; if (!sh) continue;
    leaves += (sh.doors || []).length;
    E.group.traverse(o => { if (o.isMesh && o.material === glass) panes++; });
  }
  /* core/walk: the shells' floors and walls, then the leaves (shut = blocked) */
  let walk = null;
  if (typeof KWALK !== 'undefined' && KratorInteriors.walk && KratorInteriors.walk.room) {
    walk = KratorInteriors.walk.room(S.shells.map(E => E.room), KWALK);
    KDOOR.walk(KWALK);
  }
  /* the reachability audit: each shell walked into from the ground outside its street doors (a plane at its floor's height), with
     its doors open: a room no walker gets into is listed. o.shut: the doors left shut (the negative: nothing is reached) */
  S.reach = function (o) {
    if (!walk) return null;
    o = o || {};
    const was = KDOOR.list.map(D => D.target);
    KDOOR.list.forEach(D => o.shut ? KDOOR.close(D) : KDOOR.open(D, { by: 'audit' })); for (let i = 0; i < 60; i++) KDOOR.step(0.1);
    let starts = 0, nodes = 0, capped = false; const unreached = [];
    for (const E of S.shells) {
      const R = E.room, st = R.doors.filter(d => d.to === 'street').map(d => [d.at[0] - d.n[0] * 1.2, R.y, d.at[1] - d.n[1] * 1.2]);
      starts += st.length; if (!st.length) { unreached.push(R.id); continue; }
      const b = R.bbox, r = KWALK.reach(st, { ground: () => R.y, box: [b[0] - 3, b[2] + 3, b[1] - 3, b[3] + 3] });
      nodes += r.nodes; capped = capped || r.capped;
      if (!r.reached.some(F => F.name === R.id)) unreached.push(R.id);
    }
    KDOOR.list.forEach((D, i) => { if (was[i] > 0.5) KDOOR.open(D); else KDOOR.close(D); }); for (let i = 0; i < 60; i++) KDOORHOST.tick(0.1);
    return { starts, rooms: S.shells.length, reached: S.shells.length - unreached.length, unreached, nodes, capped };
  };
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
  S.openings = () => ({ doors: KDOOR.list.length, locked: KDOOR.list.filter(D => D.locked).length, leaves, panes, cards: 0, walk });
  window._openings = S.openings();
})();
