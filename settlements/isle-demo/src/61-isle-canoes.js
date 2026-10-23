/* ============================== 5d. THE CANOE LINE'S VESSELS AT THE STOP (P7c) ============================== */
/* [draw] The drawn town's canoe stop: the lakatoi and the oruwa (kits/ringsea, through RINGSEA as the moored vessels are)
   at their berths (32: the landing's berths), each shown while the simulation has a carrier of its line docked at this
   town (SIM.tradeReport: phase 'docked', at the town) and hidden while it is at sea or at the other town. Looked at
   every `every` ms. ISLE.canoes.check(o) is verify.py's: each berth's vessel shown exactly when its line has a carrier
   docked here (o.flip shows the wrong state, the negative). */
ISLE.canoes = { every: 500, at: -1e9, boats: [], built: false };
ISLE.canoes.build = function () {
  var C = ISLE.canoes; if (C.built) return; C.built = true;
  var T = ISLE.TUNE.sim.trade, Ld = (ISLE.cur.R.landings || [])[0]; if (!Ld || !T) return;
  (Ld.berths || []).forEach(function (B) {
    var line = T.lines.filter(function (L) { return L.vessel === B.key; })[0]; if (!line) return;
    var r = typeof RINGSEA !== 'undefined' ? RINGSEA.make(B.key) : null; if (!r) { DRAW.failed['canoe:' + B.key] = 'no build'; return; }
    r.group.position.set(B.x, 0, B.z); r.group.rotation.y = B.heading - Math.PI / 2; r.group.name = B.id; r.group.visible = false; scene.add(r.group);
    C.boats.push({ line: line.id, key: B.key, berth: B, group: r.group });
  });
};
/* the lines with a carrier docked at the drawn town now */
ISLE.canoes.docked = function () {
  var s = ISLE.TUNE.sim.towns[ISLE.cur.town].id, rep = SIM.tradeReport ? SIM.tradeReport() : {}, out = {};
  Object.keys(rep || {}).forEach(function (id) { out[id] = rep[id].carriers.some(function (Cr) { return Cr.phase === 'docked' && Cr.at === s; }); });
  return out;
};
ISLE.canoes.update = function () {
  var C = ISLE.canoes; if (!ISLE.SIM || !ISLE.SIM.trade) return; C.build();
  var d = C.docked(); C.boats.forEach(function (b) { b.group.visible = !!d[b.line]; });
};
ISLE.canoes.tick = function (now) { var C = ISLE.canoes; if (now - C.at > C.every) { C.at = now; C.update(); } };
ISLE.canoes.check = function (o) {
  o = o || {}; var C = ISLE.canoes; C.update(); var d = C.docked(), bad = [], shown = [];
  if (o.flip && C.boats.length) C.boats[0].group.visible = !C.boats[0].group.visible;
  C.boats.forEach(function (b) { if (b.group.visible) shown.push(b.key); if (b.group.visible !== !!d[b.line]) bad.push(b.key + (b.group.visible ? ' shown at sea' : ' hidden while docked')); });
  if (o.flip) C.update();
  return { name: ISLE.cur.town + ': the canoe line\'s vessels drawn at the canoe stop while docked', ok: C.boats.length >= 2 && !bad.length,
    detail: C.boats.length + ' berths (' + C.boats.map(function (b) { return b.key; }).join(', ') + '); docked here: ' + JSON.stringify(d) + '; shown: ' + (shown.join(', ') || 'none') + (bad.length ? '; WRONG: ' + bad.join(', ') : '') };
};
