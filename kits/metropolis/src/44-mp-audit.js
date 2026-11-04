// ================================================================= METROPOLIS — the audit  [G data]
// MP.audit(F): every storey of a family checked as kits/ancients-interiors checks its plans, plus what this kit promises (PLAN.md section 6):
// the shafts line up from floor to floor inside the core, every room reaches a shaft by its doors, every room stands inside the skin,
// flats are whole, and the facade's glass belongs to rooms that want it. -> {ok, fails: [text], rooms, flats, storeys}
(function () {
  var AI = function () { return KratorAncientsInteriors; };
  function inRing(st) { return function (x, z) { return Math.hypot(x, z) <= st.R + 0.02; }; }
  function inRect(F) { return function (x, z) { return Math.abs(x) <= F.footprint.w / 2 + 0.02 && Math.abs(z) <= F.footprint.d / 2 + 0.02; }; }
  function reach(st) {
    var byId = {}, q = [], seen = {}, adj = {};
    st.rooms.forEach(function (R) { byId[R.id] = R; adj[R.id] = adj[R.id] || []; });
    st.rooms.forEach(function (R) { R.doors.forEach(function (d) { if (byId[d.to]) { adj[R.id].push(d.to); adj[d.to].push(R.id); } }); });
    /* reached from a shaft, or from the street (a gate a street door opens on: the Pods' dome has no shaft) */
    st.rooms.forEach(function (R) { if (R.kind === 'core' || R.id === st.id + '.core' || R.street) q.push(R.id); });
    q.forEach(function (i) { seen[i] = 1; });
    while (q.length) (adj[q.pop()] || []).forEach(function (n) { if (!seen[n]) { seen[n] = 1; q.push(n); } });
    return st.rooms.filter(function (R) { return !seen[R.id] && R.kind !== 'corridor'; }).map(function (R) { return R.id; });
  }
  MP.audit = function (F, o) {
    o = o || {}; var fails = [], rooms = 0, flats = {}, round = F.core.kind === 'round';
    F.levels.forEach(function (L) {
      var st = MP.storey(F, L.k), tag = F.id + ' L' + L.k + ' ' + L.use + ': ';
      rooms += st.rooms.length;
      AI().storeyAudit(st, st.inside || (round ? inRing(st) : inRect(F))).forEach(function (t) { fails.push(tag + t); });
      reach(st).forEach(function (id) { fails.push(tag + id + ' is not reached from a shaft'); });
      // the shafts: each stands in the core on every storey it serves
      F.core.shafts.forEach(function (s) {
        if (L.k < s.from || L.k > s.to) return;
        if (round && !F.core.bays) { var r = MP.coreR(F, L.k), far = Math.hypot(Math.abs(s.x) + s.w / 2, Math.abs(s.z) + s.d / 2); if (far > r + 0.01) fails.push(tag + s.id + ' stands out of the core (' + far.toFixed(2) + ' > ' + r + ')'); }
        else if (!st.rooms.some(function (R) { return R.shaft === s.id; })) fails.push(tag + s.id + ' has no core bay on this storey');
      });
      // flats whole: a hall, a kitchen, a bath, a living room, a bedroom, and the hall opens on all of them
      var by = {}; st.rooms.forEach(function (R) { if (R.flat) (by[R.flat] = by[R.flat] || []).push(R); });
      Object.keys(by).forEach(function (id) {
        var R = by[id], has = function (k) { return R.some(function (q) { return q.mpKind === k; }); }; flats[id] = 1;
        ['hallway', 'kitchen', 'bath', 'living', 'bedroom'].forEach(function (k) { if (!has(k)) fails.push(tag + id + ' lacks a ' + k); });
        var hall = R.filter(function (q) { return q.mpKind === 'hallway'; })[0];
        if (hall && hall.doors.length !== R.length) fails.push(tag + id + ': the hall has ' + hall.doors.length + ' doors for ' + (R.length - 1) + ' rooms and the corridor');
        R.forEach(function (q) { if (q.mpKind === 'bedroom' && !q.windows.length) fails.push(tag + q.id + ': a bedroom with no window'); });
      });
      // a door from a flat's hall has its width and 8 cm of wall either side, or it is jammed against the partition
      (st.doorFit || []).forEach(function (f) { if (f.arc < f.w + 0.16) fails.push(tag + f.room + ': its door has ' + f.arc.toFixed(2) + ' m of wall for ' + f.w + ' m'); });
      // the facade: no glass on a blank room, every habitable skin room has some
      st.rooms.forEach(function (R) {
        if (R.blank && R.windows.length) fails.push(tag + R.id + ' is windowless but has ' + R.windows.length + ' windows');
        if ((R.mpKind === 'office' || R.mpKind === 'classroom' || R.mpKind === 'clinic') && !R.windows.length) fails.push(tag + R.id + ': a ' + R.mpKind + ' with no window');
      });
      var fac = st.facade; [fac.ring, fac.south, fac.north].forEach(function (list) { if (!list) return; list.forEach(function (b) { if (MP.isGlass(b.kind) && !b.room) fails.push(tag + 'bay ' + b.i + ' is glass with no room behind it'); }); });
    });
    return { ok: !fails.length, fails: fails, rooms: rooms, flats: Object.keys(flats).length, storeys: F.levels.length };
  };
})();
