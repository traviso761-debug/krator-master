/* ==================== core/hamlet 26 (opt-in): the work camp's census and one record shared by several camps (plain data, [G data]) ==================== */
/* TODO.md, "core/hamlet: a work camp" (the owner, 2026-11-11: a mining camp is "mostly miners"); settlements/xanadu/WORKS-PLAN.md
   step W1. OPT-IN: this file sits in a subfolder no build lists unless it asks for it by name, and test-hamlet.js loads only
   core/hamlet/NN-hamlet-*.js, so adding it changes no page's bytes (core/hamlet reaches 56 pages: tools/reach.py). It folds
   into 30-hamlet-village.js at the next all-builds rebuild (TODO.md, "Ride along"). A host lists it after 30.

   It wraps KHAMLET.census and KHAMLET.village; a spec with neither `camp` nor `share` goes to the old functions
   (KHAMLET.census.base, KHAMLET.village.base) untouched, so a page that loads this file lays every other village bit for bit.

     spec.camp    true: the row's camp overrides (row.camp: core/hamlet/xanadu's KHAMLET.xanaduRow carries them on every row)
                  replace its workShare, household, services, houses and religious building: the people nearly all at work,
                  in bunkhouses, no families. An object: those overrides, over the row's own. A row with no `camp` and
                  spec.camp true takes KHAMLET.CAMP (workShare .9, households of 4, no middling houses)
     spec.share   {pop, parts: [weights], i}: one tune record of `pop` people laid as several drawn camps; this camp is part
                  `i`. The parts are dealt by the largest remainder, so the camps' people add up to pop exactly. The camp's
                  people are its part (capped at popMax, which defaults to the part and never passes KHAMLET.POP_MAX);
                  its workers are workShare of them, and the focus takes every worker the services leave (a record's
                  people are the tune's, not what the focus wants). census.share says what was dealt
     KHAMLET.campRow(row, camp)    the row a camp lays with (a fresh row: the given one is not changed)
     KHAMLET.sharePart(share)      the people of part share.i, or null when the share is malformed
     KHAMLET.shareParts(share)     every part's people, in order (they add up to share.pop) */
(function () {
  if (typeof KHAMLET === 'undefined' || !KHAMLET.census || !KHAMLET.village) throw new Error('core/hamlet/camp: load core/hamlet 30 first');
  if (KHAMLET.census.base) return;   /* loaded twice: wrap once */
  var baseCensus = KHAMLET.census, baseVillage = KHAMLET.village;
  KHAMLET.CAMP = {workShare: 0.9, household: 4};

  KHAMLET.campRow = function (row, camp) {
    if (!camp || !row) return row;
    if (row._camp) return row;
    var C = Object.assign({}, row.camp || KHAMLET.CAMP, typeof camp === 'object' ? camp : {});
    var r = Object.assign({}, row);
    if (C.workShare != null) r.workShare = C.workShare;
    if (C.household != null) r.household = C.household;
    if (C.religious != null) r.religious = C.religious;
    if (C.services) r.services = Object.assign({}, row.services, C.services);
    var H = C.houses || row.houses;
    r.houses = {poor: H.poor, middling: H.middling, head: H.head, middlingShare: C.houses ? H.middlingShare : 0};
    r._camp = true;
    return r;
  };

  KHAMLET.shareParts = function (S) {
    if (!S || !(S.pop >= 0) || !S.parts || !S.parts.length) return null;
    var tot = 0, i;
    for (i = 0; i < S.parts.length; i++) { if (!(S.parts[i] >= 0)) return null; tot += S.parts[i]; }
    if (!(tot > 0)) return null;
    var exact = S.parts.map(function (w) { return S.pop * w / tot; }), out = exact.map(Math.floor), left = S.pop;
    out.forEach(function (n) { left -= n; });
    /* the largest remainders take the people left over; a tie goes to the earlier part (no draw) */
    var order = exact.map(function (x, k) { return [x - Math.floor(x), k]; }).sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; });
    for (i = 0; i < left; i++) out[order[i][1]]++;
    return out;
  };
  KHAMLET.sharePart = function (S) {
    var P = KHAMLET.shareParts(S);
    return P && S.i >= 0 && S.i < P.length ? P[S.i] : null;
  };

  KHAMLET.census = function (spec, row) {
    if (!spec.camp && !spec.share) return baseCensus(spec, row);
    if (spec.camp) row = KHAMLET.campRow(row, spec.camp);
    if (!spec.share) { var C0 = baseCensus(spec, row); C0.camp = true; return C0; }
    var part = KHAMLET.sharePart(spec.share);
    if (part == null) { var Cb = baseCensus(spec, row); Cb.camp = !!spec.camp; Cb.share = {error: 'a malformed share'}; return Cb; }
    var popMax = Math.min(KHAMLET.POP_MAX, spec.popMax == null ? part : spec.popMax);
    var pop = Math.min(part, popMax), S = row.services, warehouses = 1;
    var services = function () { return S.religious + S.civic + S.general + S.food + S.warehouse * warehouses; };
    var workers = Math.floor(pop * row.workShare);
    var focusJobs = Math.max(0, workers - services());
    warehouses = 1 + Math.floor(focusJobs / 80);
    focusJobs = Math.max(0, workers - services());
    var outK = spec.worksOut || [];
    var works = (row.works[spec.focus] || []).map(function (w) {
      var n = focusJobs > 0 ? Math.max(1, Math.ceil(focusJobs * w.share / w.jobs)) : 0;
      return {key: w.key, n: n, jobs: w.jobs, out: outK.indexOf(w.key) >= 0};
    });
    return {popMax: popMax, pop: pop, workers: focusJobs + services(), focusJobs: focusJobs, serviceJobs: services(), warehouses: warehouses,
            households: Math.ceil(pop / row.household), works: works, capped: part > pop, camp: !!spec.camp,
            share: {pop: spec.share.pop, i: spec.share.i, part: part, parts: KHAMLET.shareParts(spec.share)}};
  };
  KHAMLET.census.base = baseCensus;

  KHAMLET.village = function (spec) {
    if (!spec.camp) return baseVillage(spec);
    var row = KHAMLET.row(spec.culture);
    if (!row) return baseVillage(spec);
    return baseVillage(Object.assign({}, spec, {culture: KHAMLET.campRow(row, spec.camp)}));
  };
  KHAMLET.village.base = baseVillage;
})();
