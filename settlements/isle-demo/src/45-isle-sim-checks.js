/* ============================== 7f. THE SIM'S CHECKS, PER TOWN (P7b) ============================== */
/* [G data] What verify.py --assert and the node test (tests/test-isle-sim.js) hold a town declared on core/simulation to,
   each {name, ok, detail} as ISLE.checks gives them. o overrides what is read, for the negatives: {places, actors, books}.
     ISLE.simChecks(R, o)       once declared: every lot of a census trade (a key kits/islanders' IS_TRADES names) is a
                                place of the town; every resident lives in a home of the town and the town holds the
                                census's people; every worker has a job (a place of the town offering WORK) and every
                                post is filled; the stocks map (46) finds every place from its lot, and SIM.stocks reads
                                the town's foods by settlement
     ISLE.simBooks(s)           a town's food books after a run: per food made, hauled, drawn, short and the days its
                                stock lasts (SIM.economyReport); bought, eaten and out of (the items' books by town);
                                the meals the kitchens could not make
     ISLE.simFoodChecks(R, books)  after a day: every food made and hauled, food eaten, nothing short (no draw on the
                                warehouses unmet, no purchase out of stock, no kitchen without a meal), every food
                                lasting a day more, and the food made (less what went into other food) covering what the town ate.
                                The meals are the town's own (core/simulation books them by town: SIM.ITEMS.statsBy[town].meals) */
ISLE.simChecks = function (R, o) {
  o = o || {};
  var TS = ISLE.TUNE.sim.towns[R.town], s = TS.id, out = [];
  var ok = function (name, pass, detail) { out.push({ name: R.town + ': ' + name, ok: !!pass, detail: detail }); };
  var places = o.places || SIM.all('place').filter(function (P) { return P.settlement === s; });
  var byLot = {}; places.forEach(function (P) { if (P.tags && P.tags.lot) byLot[P.tags.lot] = P; });
  /* the census trades' lots */
  var lots = R.lots.filter(function (L) { return ISLE.tradeOf(L.key); }), miss = lots.filter(function (L) { return !byLot[L.id]; }), tr = {};
  lots.forEach(function (L) { tr[ISLE.tradeOf(L.key)] = 1; });
  ok('every lot of a census trade is a place', lots.length > 0 && miss.length === 0, lots.length + ' lots of ' + Object.keys(tr).length + ' trades, ' + places.length + ' places in all' +
    (miss.length ? '; NOT PLACES: ' + miss.slice(0, 5).map(function (L) { return L.id + ' ' + L.key; }).join(', ') : ''));
  /* the residents */
  var actors = o.actors || SIM.all('actor').filter(function (a) { var Rr = SIM.R.role[a.role]; return !a.driven && Rr && Rr.settlement === s; });
  var pi = {}; places.forEach(function (q) { pi[q.id] = q; });
  var homeless = actors.filter(function (a) { var H = pi[a.home]; return !H || H.settlement !== s || !(H.activities.SLEEP > 0); });
  var C = ISLE.census(R);
  ok('every resident has a home in the town (the census\'s people)', actors.length > 0 && homeless.length === 0 && actors.length === C.citizens,
    actors.length + ' residents, census ' + C.citizens + (homeless.length ? '; WITHOUT A HOME IN THE TOWN: ' + homeless.slice(0, 4).map(function (a) { return a.id; }).join(', ') : ''));
  /* the workers */
  var workers = actors.filter(function (a) { var Rr = SIM.R.role[a.role]; return Rr && Rr.work && Rr.work.act === 'WORK'; });
  var jobless = workers.filter(function (a) { var W = pi[a.work]; return !W || W.settlement !== s || !(W.activities.WORK > 0); });
  var posts = places.reduce(function (n, q) { return n + (q.activities.WORK || 0); }, 0), load = {};
  workers.forEach(function (a) { if (a.work) load[a.work] = (load[a.work] || 0) + 1; });
  var over = places.filter(function (q) { return (load[q.id] || 0) > (q.activities.WORK || 0); }).length;
  ok('every worker has a job in the town, every post filled', workers.length > 0 && jobless.length === 0 && workers.length === posts && over === 0,
    workers.length + ' workers, ' + posts + ' posts (' + Math.round(100 * workers.length / Math.max(1, actors.length)) + '% of the people)' + (over ? ', ' + over + ' places over their posts' : '') +
    (jobless.length ? '; WITHOUT A JOB IN THE TOWN: ' + jobless.slice(0, 4).map(function (a) { return a.id; }).join(', ') : ''));
  /* by age (42): every child at school (a STUDY place of the town) or at housework (its home), every elder at housework,
     each age in its band; the households mixed (no house of children alone) */
  var Bd = ISLE.TUNE.sim.ages.bands, wrong = [];
  actors.forEach(function (a) {
    var Rr = SIM.R.role[a.role], nm = Rr.name, H = pi[a.home], W = pi[a.work];
    if (a.ageBand === 'child' && !(nm === 'pupil' ? W && W.settlement === s && W.activities.STUDY > 0 : H && H.activities.HOUSEWORK > 0 && Rr.sched.indexOf('HOUSEWORK') >= 0)) wrong.push(a.id + ' (a child)');
    else if (a.ageBand === 'elder' && !(H && H.activities.HOUSEWORK > 0 && Rr.sched.indexOf('HOUSEWORK') >= 0)) wrong.push(a.id + ' (an elder)');
    var b = Bd[nm === 'pupil' ? 'pupil' : nm === 'child' ? 'child' : nm === 'elder' ? 'elder' : 'adult'];
    if (!(a.age >= b[0] && a.age <= b[1])) wrong.push(a.id + ' aged ' + a.age);
  });
  var D = ISLE.simDemography(s), kids = actors.filter(function (a) { return a.ageBand === 'child'; }), eld = actors.filter(function (a) { return a.ageBand === 'elder'; });
  ok('every child at school or at housework, every elder at housework, the households mixed', kids.length > 0 && eld.length > 0 && !wrong.length && D.households.onlyChildren === 0,
    kids.length + ' children (' + (D.status.pupil || 0) + ' at school, ' + kids.filter(function (a) { return a.status === 'housework'; }).length + ' at housework), ' + eld.length + ' elders at housework; ' +
    D.households.n + ' households, ' + D.households.onlyChildren + ' of children alone' + (wrong.length ? '; WRONG: ' + wrong.slice(0, 4).join(', ') : ''));
  /* the stocks map (46): every place found again from its lot, and the town's stocks read by settlement */
  var lost = places.filter(function (q) { return q.tags && q.tags.lot && ISLE.simIdOf({ lot: q.tags.lot }).indexOf(q.id) < 0; }), X = ISLE.SIM.towns[s];
  var St = SIM.stocks ? SIM.stocks(s) : null, rows = St ? (X.econ.foods || []).filter(function (f) { return St.by[f]; }).length : 0;
  ok('the stocks map finds every place from its lot; the stocks read by settlement', lost.length === 0 && St && rows === (X.econ.foods || []).length,
    places.filter(function (q) { return q.tags && q.tags.lot; }).length + ' places by lot, ' + rows + ' of ' + (X.econ.foods || []).length + ' foods in its stocks' +
    (lost.length ? '; NOT FOUND: ' + lost.slice(0, 4).map(function (q) { return q.id; }).join(', ') : ''));
  return out;
};
ISLE.simBooks = function (s) {
  var E = SIM.economyReport(s), I = SIM.ITEMS, B = (I.statsBy || {})[s] || {}, X = ISLE.SIM.towns[s], F = X.econ.foods;
  var M = Object.assign({ meal: 0, single: 0, none: 0, bought: 0, mess: 0, out: 0 }, B.meals || {});   /* the town's own meals (SIM.ITEMS.statsBy[town].meals) */
  var out = { town: s, foods: {}, meals: M, carts: E.carts, short: E.short };
  F.forEach(function (f) {
    var G = E.goods[f] || {};
    out.foods[f] = { made: G.made || 0, hauled: G.hauled || 0, used: G.used || 0, short: G.short || 0, stock: G.stock || 0, days: G.days, atSites: G.atSites || 0,
      bought: (B.bought || {})[f] || 0, eaten: (B.eaten || {})[f] || 0, outOf: (B.outOf || {})[f] || 0 };
  });
  return out;
};
ISLE.simFoodChecks = function (R, books) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: R.town + ': ' + name, ok: !!pass, detail: detail }); }, F = books.foods, k = Object.keys(F);
  var sum = function (key) { return k.reduce(function (n, f) { return n + F[f][key]; }, 0); };
  var unmade = k.filter(function (f) { return !(F[f].made > 0) || !(F[f].hauled > 0); });
  ok('every food made and hauled', unmade.length === 0, k.map(function (f) { return f + ' ' + F[f].made + '/' + F[f].hauled; }).join(', ') + ' (made/hauled)' + (unmade.length ? '; NOT: ' + unmade.join(', ') : ''));
  var eaten = sum('eaten'), meals = books.meals;
  ok('the food is eaten (meals at home, out and at the mess)', eaten > 0 && meals.meal > 0, eaten + ' servings eaten at home in ' + (meals.meal + meals.single) + ' meals; ' + meals.bought + ' bought out, ' + meals.mess + ' at the mess, ' + meals.none + ' with nothing at home');
  var short = k.filter(function (f) { return F[f].short > 0 || F[f].outOf > 0; }), low = k.filter(function (f) { return F[f].days != null && F[f].days < 1; });
  ok('nothing short for a day (draws, purchases, kitchens; a day\'s stock left)', short.length === 0 && low.length === 0 && !meals.out,
    'short ' + sum('short') + ', out of stock ' + sum('outOf') + ', kitchens without a meal ' + (meals.out || 0) + '; days left ' + k.map(function (f) { return f + ' ' + F[f].days; }).join(', ') +
    (short.length ? '; SHORT: ' + short.join(', ') : '') + (low.length ? '; UNDER A DAY: ' + low.join(', ') : ''));
  /* made, less the food that went into other food (the sweet potato baked into bread), against what was eaten: at home,
     and the meals bought out and served at the mess */
  var IN = Object.assign({}, ISLE.TUNE.sim.economy.inputs, ISLE.TUNE.sim.towns[R.town].inputs || {}), per = ISLE.TUNE.sim.items.perMeal, made = sum('made'), into = 0;
  k.forEach(function (f) { var q = IN[f] || {}; for (var g in q) if (F[g]) into += F[f].made * q[g]; });
  var ate = eaten + (meals.bought + meals.mess) * per;
  ok('the food made covers what the town ate', made - into >= ate, (made - into) + ' servings made (' + made + ', ' + into + ' of them baked into others), ' + ate + ' eaten (' + eaten + ' at home, ' +
    (meals.bought + meals.mess) * per + ' out and at the mess' + ')');
  return out;
};
/* the free hours: of those who want company now (wish SOCIALIZE), the share at a place for it rather than sent home; measured
   in a presented town (an abstract town's people do not decide: verify skips the check there) */
ISLE.simSocial = function (s) {
  var A = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === s && a.wanted === 'SOCIALIZE'; });
  var at = A.filter(function (a) { return a.activity === 'SOCIALIZE' && a.place !== a.home; }).length, slots = SIM.all('place').filter(function (P) { return P.settlement === s; }).reduce(function (n, P) { return n + (P.activities.SOCIALIZE || 0); }, 0);
  return { town: s, minute: SIM.minute(), level: SIM.levelOf ? SIM.levelOf(s) : 'presented', want: A.length, placed: at, slots: slots };
};
ISLE.simSocialCheck = function (R, soc, least) {
  least = least == null ? 0.9 : least; var q = soc.want ? soc.placed / soc.want : 0;
  return { name: R.town + ': those who want company in their free hours find a place for it', ok: soc.want > 0 && q >= least,
    detail: soc.placed + ' of ' + soc.want + ' wanting company placed (' + Math.round(100 * q) + '%, ' + Math.round(100 * least) + '% wanted) at ' + Math.floor(soc.minute % 1440 / 60) + ':' + ('0' + soc.minute % 60).slice(-2) + '; ' + soc.slots + ' places for it' };
};
