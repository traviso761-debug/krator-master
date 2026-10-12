/* ============================== 5e. THE CENSUS: PEOPLE AND WORKPLACES ============================== */
/* [G data] An estimate of how many people the plan houses and how many workplaces it offers (owner, 2026-10-09:
   "give me an estimate of the city population vs how many workplaces we have for them. break it down in a table
   listing types of jobs"). Every rate is TUNE.census: residents per house class and per institution, jobs per
   workplace. The Palace's and the Temple's own people are not counted (their buildings are Voth's captured models, not
   the plan's); the other cantons' interiors are, room by room. Run after the last step; the host shows it under the step's counts. */
VC.census = function () {
  var K = TUNE.census, alive = PLAN.lots.filter(function (L) { return L.died == null; }), live = {}, jobs = {};
  var addL = function (k, n) { live[k] = (live[k] || 0) + n; }, addJ = function (k, n, where) { var e = jobs[k] || (jobs[k] = { n: 0, where: '' }); e.n += n; if (where && (', ' + e.where + ',').indexOf(', ' + where + ',') < 0) e.where = e.where ? e.where + ', ' + where : where; };
  /* homes */
  alive.forEach(function (L) {
    var place = L.deck ? 'canton' : L.country ? 'country' : 'city';
    if (L.cls === 'clan') { addL('clan compounds', K.live.clan); addJ('household service', K.jobs.clanService, 'clan compounds'); return; }
    if (L.cls === 'farm') { addL('farms and villages', L.w * L.d > 6000 ? K.live.bigFarm : K.live.farm); return; }
    if (L.role === 'garrison') { addL('garrison and barracks', K.live.garrison); addJ('soldiers', K.jobs.garrison, 'garrison castle'); return; }
    if (L.role === 'muster') return;
    if (L.power) { addJ('power-house stokers and engineers', K.jobs.power, 'power houses'); return; }
    if (L.cls === 'civic') {
      if (/barracks/.test(L.key)) { addL('garrison and barracks', K.live.barracks); addJ('soldiers', K.jobs.barracks, 'barracks'); }
      else if (/school/.test(L.key)) addJ('teachers and scholars', K.jobs.school, 'schools');
      else if (/guild/.test(L.key)) addJ('guild officers and clerks', K.jobs.guild, 'guild hall');
      else if (/customs/.test(L.key)) addJ('customs officers and clerks', K.jobs.customs, 'customs house');
      else if (/tavern/.test(L.key)) addJ('innkeepers and servers', K.jobs.tavern, 'taverns');
      return;
    }
    var r = K.live[L.cls];
    if (r) addL(place === 'country' ? (L.country === 'suburb' ? 'suburbs' : 'farms and villages') : place === 'canton' ? 'canton decks' : 'city houses', r);
    var j = K.jobs[L.cls];
    if (j) addJ({ shop: 'shopkeepers and assistants', craft: 'smiths and craftsmen', tavern: 'innkeepers and servers', warehouse: L.role === 'armoury' ? 'armourers and quartermasters' : 'porters and warehousemen',
                  industrial: 'industrial workers', rich: 'household service', manor: 'household service' }[L.cls] || L.cls, j,
           { rich: 'rich houses', manor: 'manors', warehouse: L.role === 'armoury' ? 'Arsenal canton' : 'warehouses', shop: 'shops', craft: 'workshops', tavern: 'taverns', industrial: 'industry' }[L.cls] || L.cls);
  });
  /* the monastery, the landmarks, the harbour and river, the markets */
  var M = VC.monastery ? VC.monastery.counts : {};
  if (M.dorm) { addL('monastery', M.dorm * K.live.monkPerDorm); addJ('monks and lay brothers (chapel, fields, coops)', M.dorm * K.live.monkPerDorm, 'monastery'); }
  (PLAN.voth || []).forEach(function (q) { var n = K.jobs[q.role]; if (n) addJ({ healing: 'healers and nurses', funeraryTemple: 'priests and undertakers', shrine: 'shrine keepers', lighthouse: 'lighthouse keepers' }[q.role], n, q.role); });
  var P = VOTH.PIERS, fish = P.filter(function (q) { return q.fish; }).length, river = P.filter(function (q) { return q.river; }).length, harbour = P.filter(function (q) { return !q.fish && !q.river && !q.ferry; }).length;
  addJ('dockers and stevedores', harbour * K.jobs.pier, 'harbour piers'); addJ('river bargemen and quay hands', river * K.jobs.riverQuay, 'river quays'); addJ('fishers', fish * K.jobs.fishDock, 'fishing docks');
  var stalls = 0; PLAN.districts.forEach(function (D) { (D.art || []).forEach(function (a) { if (/stall/.test(a.key)) stalls++; }); });
  addJ('market traders', stalls * K.jobs.stall, 'market stalls');
  /* the land */
  var fieldHa = (PLAN.fields || []).filter(function (F) { return F.kind !== 'garden'; }).reduce(function (s, F) { return s + 4 * F.bo.hw * F.bo.hd; }, 0) / 1e4;
  addJ('farmhands and ploughmen', Math.round(fieldHa * K.jobs.perHectare), 'fields (' + Math.round(fieldHa) + ' ha)');
  if (VC.chin) addJ('chinampa growers', Math.round(VC.chin.count * K.jobs.chinampaBed), 'chinampa beds');
  addJ('orchardmen', Math.round((VC.orchardTrees || 0) / K.jobs.treesPerHand), 'orchards');
  addJ('miners', ((VC.industry && VC.industry.mines) || []).length * K.jobs.mine, 'mines');
  addJ('granary keepers and millers', ((VC.industry && VC.industry.watermills) || []).length * K.jobs.watermill, 'watermills');
  addJ('beetle herders', ((VC.industry && VC.industry.ranches) || 0) * K.jobs.ranch, 'beetle ranches');
  addJ('mushroom growers', ((VC.industry && VC.industry.mush) || []).length * K.jobs.mushFarm, 'mushroom farms');
  addJ('quarrymen and masons', ((VC.industry && VC.industry.quarries) || []).length * K.jobs.quarry, 'quarries');
  addJ('granary keepers and millers', (VC.granaryCount || 0) * K.jobs.granary, 'granaries');
  addJ('granary keepers and millers', (VC.windmills || []).length * K.jobs.mill, 'windmills');
  addJ('envoys and embassy staff', (VC.embassyPlots || []).length * K.jobs.embassy, 'embassies');
  /* the Voth cantons' own workplaces (their buildings are Voth's captured models, not plan lots): a working staff
     for each, TUNE.census.cantons; their households are still not counted */
  /* a canton with an interior (40-vc-interiors.js) is counted room by room instead (owner, 2026-10-09: "add new canton
     interior jobs to the job count"): each room kind's workplaces and residents (TUNE.census.rooms), under its own kind
     of work, or the canton's where it has one (the Arena's barracks are gladiators', the Fortress's Ordinators') */
  var INT = (VC.INT && VC.INT.cantons) || {}, R = K.rooms;
  Object.keys(K.cantons).forEach(function (n) { if (VOTH.CIDX[n] && !INT[n]) addJ(K.cantons[n][1], K.cantons[n][0], n + ' canton'); });
  Object.keys(INT).forEach(function (n) {
    (INT[n].rooms || []).forEach(function (r) {
      var e = R[r.kind]; if (!e) return;
      var label = (R.byCanton[n] && R.byCanton[n][r.kind]) || e[2];
      if (e[0]) addJ(label, e[0], n + ' canton interior');
      if (e[1]) addL('canton interiors', e[1]);
    });
  });
  /* transit */
  var T = PLAN.transit || { lines: [], stations: [] }, ferries = 0, striders = 0;
  T.lines.forEach(function (l) { if (l.kind === 'ferry') ferries += l.vehicles; else striders += l.vehicles; });
  addJ('ferrymen', ferries * K.jobs.ferry + T.stations.filter(function (s) { return s.kind === 'ferry'; }).length * K.jobs.ferryStop, 'ferries and stops');
  addJ('elephant bug handlers and station hands', striders * K.jobs.bug + T.stations.filter(function (s) { return s.kind === 'strider'; }).length * K.jobs.bugStation, 'elephant bugs and stations');
  var pop = 0, J = 0; Object.keys(live).forEach(function (k) { pop += live[k]; }); Object.keys(jobs).forEach(function (k) { jobs[k].n = Math.round(jobs[k].n); J += jobs[k].n; });
  var work = Math.round(pop * K.workingShare);
  PLAN.census = { population: pop, workforce: work, jobs: J, homes: live, byJob: jobs, note: 'the Palace’s and Temple’s households are not counted; their workplaces are, and the other cantons’ interiors room by room' };
  return PLAN.census;
};
