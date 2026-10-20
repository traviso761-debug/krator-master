/* ============================== 7g. THE STOCKS ID MAP (P7b) ============================== */
/* [G data] What core/host's stocks panel and inspector (core/host/93-host-stocks.js, KHOST.simHolds(SIM, extra)) need from
   this page and only this page knows: which simulation places a picked record is. A lot (32: R.lots, by its id or its
   core/tags id) is one place of its town (40: its tags carry both); a farm parcel or a holding of the farm ring likewise.
     ISLE.simIdOf(rec)          the place ids a record is: rec.id or rec.lot a lot's id (Kautoa.89), rec.tag or rec.id its
                                core/tags id (site_00089), or a place id itself
     ISLE.simHolds(town)        the `extra` for KHOST.simHolds: idOf, the town's own stocks (SIM.stocks(settlement)) and a
                                place's name with its town, for when the page takes core/host (PLAN.md section 10)
   The map is built once from the places (SIM records), so it reads the same in node, the browser and Godot. */
ISLE.simIdOf = function (rec) {
  if (!rec) return [];
  if (!ISLE._simIds || ISLE._simIds.n !== SIM.order.place.length) {
    var M = { n: SIM.order.place.length, by: {} };
    SIM.all('place').forEach(function (P) { if (!P.tags) return; [P.tags.lot, P.tags.tag].forEach(function (k) { if (k != null) (M.by[k] || (M.by[k] = [])).push(P.id); }); });
    ISLE._simIds = M;
  }
  var by = ISLE._simIds.by, out = [];
  [rec.id, rec.lot, rec.tag].forEach(function (k) { if (k == null) return; (by[k] || (SIM.R.place[k] ? [k] : [])).forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); }); });
  return out;
};
ISLE.simHolds = function (town) {
  var s = ISLE.TUNE.sim.towns[town].id;
  return {
    idOf: function (rec) { return ISLE.simIdOf(rec).slice(0, 1); },
    stocks: function () { return SIM.stocks ? SIM.stocks(s) : null; },
    placeName: function (id) { var P = id != null && SIM.R.place[id]; if (!P) return id == null ? '-' : String(id); var T = P.settlement && SIM.R.settlement && SIM.R.settlement[P.settlement];
      return (P.name || P.kind) + (P.kind && P.kind !== P.name ? ' <span class="k">(' + P.kind + (T ? ', ' + T.name : '') + ')</span>' : ''); }
  };
};
