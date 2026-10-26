/* ============================== 7k. THE SIM EXPORT SECTION (P7e, 2026-10-20) ============================== */
/* [G data] The isle profile's `sim` section (PLAN.md section 7; core/export 07: one contributor a section, a section
   without one reads `stub` and fails a profile that names it). The page registers it until core/simulation registers
   the section itself, as core/city registers `city` (KNOWN_ISSUES.md):
     ISLE.simExport({box, town}) a 'krator-sim' object: core/simulation's own records (SIM.export: the clock, the
                                activities, factions, orgs, places, roles, actors, events, ports, transports; no nav, no
                                log), each actor with its settlement, and the isles' own:
                                  settlements: per town its level, people and workers, its warehouses, sites and carts by
                                    id, each good's stock (warehouses, sites, carts, all holdings) and books (made, used,
                                    imported, exported, short; bought and eaten by the households) since the start, its producers (place, outputs, the
                                    governor's rate and the full rate), its meals, what spoiled and what was salted;
                                  routes: the canoe lines' stops, carriers (where, bound for, cargo) and books (shipped,
                                    landed, at sea, by leg and good);
                                  buyers: what the ships from beyond the isles bought, by ship and by town;
                                  motion (with a box in the drawn town's frame, and the town): its people who live or
                                    work in the box, their tasks, routes and
                                    poses at six motion times (SIM.exportMotion), for Godot's replay (KSim.pose).
     ISLE.simExportChecks(doc)  -> [{name, ok, detail}]: every settlement's warehouses, sites and actors' homes and work
                                resolve to places of that settlement; each good's warehouse stock is what the place
                                records hold; every load shipped landed or is at sea; every book a count. verify's Valapo
                                page and tests/test-isle-export.js run them, each with a negative.
     ISLE.simExportRegister()   EXPORT.register('sim', ..., {by: 'isle-sim'}) when core/export is loaded, else queued for it
                                (EXPORT_QUEUE: the node test loads core/export after the page's data half). */
ISLE.simExport = function (opt) {
  opt = opt || {}; var S = ISLE.SIM; if (!S || !S.order || !S.order.length || !SIM.export) return null;
  var doc = SIM.export({ log: 0, nav: false });
  doc.profile = 'isle-demo';
  doc.actors.forEach(function (a) { var A = SIM.R.actor[a.id]; a.settlement = A ? SIM.settlementOf(A) : null; if (A && A.driven) a.driven = true; });   /* driven: a town's carts (not its people) */
  var I = SIM.ITEMS, n = function (x) { return x || 0; };
  doc.settlements = S.order.map(function (s) {
    var E = SIM.econ(s), X = S.towns[s], St = SIM.stocks ? SIM.stocks(s) : null, goods = {}, IB = (I && I.statsBy && I.statsBy[s]) || {};
    Object.keys(E.goods).forEach(function (g) {
      var w = 0, si = 0, c = 0;
      E.warehouses.forEach(function (P) { w += n(P.stock[g]); }); E.sites.forEach(function (P) { si += n(P.stock[g]); });
      E.carts.forEach(function (a) { var L = a.cart.load; if (L && L.good === g) c += L.n; });
      goods[g] = { warehouses: w, sites: si, carts: c, total: St && St.by[g] ? St.by[g].total : w + si + c,
        made: n(E.made[g]), used: n(E.used[g]), imported: n(E.imported[g]), exported: n(E.exported[g]), short: n(E.short[g]),
        bought: n((IB.bought || {})[g]), eaten: n((IB.eaten || {})[g]) };   /* the households' purchases and meals: consumed = used - bought + eaten */
    });
    var G = E.govern || {}, B = (I && I.statsBy && I.statsBy[s]) || {};
    return { id: s, name: X.name || s, level: SIM.levelOf ? SIM.levelOf(s) : 'presented', people: X.pop.actors, workers: X.pop.workers,
      frame: X.frame ? { x: X.frame.x, z: X.frame.z, sea: X.frame.sea } : null,   /* world metres = the town's frame + (x, z); y = the frame's y + sea */
      warehouses: E.warehouses.map(function (P) { return P.id; }), sites: E.sites.map(function (P) { return P.id; }), carts: E.carts.map(function (a) { return a.id; }),
      goods: goods,
      producers: Object.keys(E.recipes).map(function (id) { var R = E.recipes[id]; return { place: id, out: R.out.slice(), rate: R.rate, full: G.rates && G.rates[id] != null ? G.rates[id] : R.rate }; }),
      meals: Object.assign({}, B.meals || {}), spoiled: Object.assign({}, ISLE.simSpoiled(s)), salted: Object.assign({}, ISLE.simSalted(s)) };
  });
  var rep = SIM.tradeReport ? SIM.tradeReport() : {};
  doc.routes = Object.keys(rep || {}).map(function (id) { var R = rep[id], sea = {};
    var carriers = R.carriers.map(function (C, ci) { if (C.to && !C.at) { var k = (R.stops[0] === C.to ? R.stops[1] : R.stops[0]) + '>' + C.to;
      C.cargo.forEach(function (q) { var o = sea[k] || (sea[k] = {}); o[q.good] = (o[q.good] || 0) + q.n; }); }
      return { id: C.id != null ? C.id : id + '#' + ci, at: C.at || null, to: C.to || null, cargo: C.cargo.map(function (q) { return { good: q.good, n: q.n }; }) }; });
    return { id: id, stops: R.stops.slice(), carriers: carriers, shipped: JSON.parse(JSON.stringify(R.shipped)), landed: JSON.parse(JSON.stringify(R.landed)), sea: sea }; });
  doc.buyers = { ships: JSON.parse(JSON.stringify(S.ships || {})), byTown: JSON.parse(JSON.stringify(S.buyersSold || {})) };
  /* a box (the export's case): the motion of the people who live or work in it (SIM.exportMotion: their baked tasks,
     the routes, and SIM.pose at six motion times as the golden rows), for a port to replay (KSim.pose) */
  var TS = opt.town && ISLE.TUNE.sim.towns[opt.town], X0 = TS && S.towns[TS.id], F0 = X0 && X0.frame;
  if (opt.box && F0 && SIM.exportMotion) { var b = opt.box, inB = function (P) { var x = P && P.x - F0.x, z = P && P.z - F0.z; return !!P && x >= b[0] && x < b[2] && z >= b[1] && z < b[3]; };   /* the box is in the drawn town's frame */
    var A = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === TS.id && (inB(SIM.R.place[a.home]) || inB(SIM.R.place[a.work])); });
    var M = SIM.exportMotion({ actors: A });
    doc.motion = { note: 'SIM.pose reads these (core/simulation/77-sim-5-motion.js); a leg names its route by index; rows: [t, actor index, hidden, moving, x, y, z, h]',
      box: b.slice(), town: TS.id, frame: { x: F0.x, z: F0.z, sea: F0.sea }, t: M.t, wander: SIM.WANDER, times: M.times, actors: M.actors, routes: M.routes, rows: M.rows }; }
  return JSON.parse(JSON.stringify(doc));   /* a plain JSON object: an infinite capacity reads null (the harness writes what it gets) */
};
ISLE.simExportChecks = function (doc) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: 'the sim export: ' + name, ok: !!pass, detail: detail }); };
  if (!doc || doc.format !== 'krator-sim' || !doc.settlements) { ok('a krator-sim object with its settlements', false, doc ? doc.format : 'none'); return out; }
  var P = {}; doc.places.forEach(function (p) { P[p.id] = p; });
  /* the settlements' places and the actors' homes and work, in their own settlement */
  var bad = [], nA = 0;
  doc.settlements.forEach(function (T) { T.warehouses.concat(T.sites).forEach(function (id) { if (!P[id] || P[id].settlement !== T.id) bad.push(T.id + ' ' + id); }); });
  doc.actors.forEach(function (a) { if (!a.settlement) return; nA++;
    [a.home, a.work].forEach(function (id) { if (id != null && (!P[id] || P[id].settlement !== a.settlement)) bad.push(a.id + ' ' + id); }); });
  ok('every warehouse, site, home and workplace is a place of its own settlement', !bad.length && nA > 0,
    doc.places.length + ' places, ' + nA + ' people in ' + doc.settlements.length + ' settlements' + (bad.length ? '; OFF: ' + bad.slice(0, 4).join('; ') : ''));
  /* each good's warehouse stock is what the place records hold */
  var off = [], nG = 0;
  doc.settlements.forEach(function (T) { Object.keys(T.goods).forEach(function (g) { nG++; var h = 0;
    T.warehouses.forEach(function (id) { h += (P[id] && P[id].stock && P[id].stock[g]) || 0; });
    if (Math.abs(h - T.goods[g].warehouses) > 1e-6) off.push(T.id + ' ' + g + ' ' + T.goods[g].warehouses + ' booked, ' + h + ' on the records'); }); });
  ok('each good’s warehouse stock is what the place records hold', nG > 0 && !off.length, nG + ' town-goods' + (off.length ? '; OFF: ' + off.slice(0, 3).join('; ') : ''));
  /* every load shipped landed or is at sea */
  var lost = [], nL = 0;
  doc.routes.forEach(function (R) { Object.keys(R.shipped).forEach(function (k) { Object.keys(R.shipped[k]).forEach(function (g) { nL++;
    var sh = R.shipped[k][g], la = (R.landed[k] || {})[g] || 0, se = (R.sea[k] || {})[g] || 0;
    if (sh !== la + se) lost.push(R.id + ' ' + k + ' ' + g + ': ' + sh + ' shipped, ' + la + ' landed, ' + se + ' at sea'); }); }); });
  ok('every load shipped landed or is at sea', !lost.length, nL + ' route legs and goods' + (lost.length ? '; ' + lost.slice(0, 3).join('; ') : ''));
  /* every book a count */
  var nan = [];
  doc.settlements.forEach(function (T) { Object.keys(T.goods).forEach(function (g) { var B = T.goods[g];
    ['warehouses', 'sites', 'carts', 'total', 'made', 'used', 'imported', 'exported', 'short', 'bought', 'eaten'].forEach(function (k) { if (typeof B[k] !== 'number' || !(B[k] >= 0)) nan.push(T.id + ' ' + g + ' ' + k); }); }); });
  ok('every stock and book is a count (none negative or missing)', !nan.length, nan.length ? nan.slice(0, 4).join('; ') : doc.settlements.map(function (T) { return T.id + ' ' + Object.keys(T.goods).length + ' goods'; }).join(', '));
  return out;
};
ISLE.simExportRegister = function () {
  var fn = function (ctx) { return ISLE.simExport({ box: ctx && ctx.box, town: ISLE.cur && ISLE.cur.town }); }, opt = { by: 'isle-sim' };   /* ISLE.cur: the drawn town (98) */
  if (typeof EXPORT !== 'undefined' && EXPORT.register) { ISLE._simExportOff = EXPORT.register('sim', fn, opt); return true; }
  (globalThis.EXPORT_QUEUE = globalThis.EXPORT_QUEUE || []).push(['sim', fn, opt]); return false;
};
ISLE.simExportRegister();
