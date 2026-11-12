/* ==================== core/camp 50: beasts as consumers and as carrying capacity (S4) [G data] ==================== */
/* core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S4 (the owner, 2026-11-11). A band's beasts eat, and they carry. What
   each kind eats and carries is a culture's table (the Beast Riders': settlements/pinnacle-rock/src/15-pr-tune.js
   PR_TUNE.beasts), so core/camp reads no kit's globals; this fragment holds the rules that act on it:
     table  {lowG (the factor every appetite is multiplied by: the owner's low-gravity payoff, 2/3), appetite: {diet: kg a
             day per kg^0.75 of body mass}, eats: {diet: good} (what a diet takes from a store: 'meat', 'fodder'),
             graze: [diets fed off the ground where the beasts stand, not from a store], meatFrom: {hunt, herd} (the shares
             of a meat-eater's meat the wild hunt and the kept herd are meant to give: the owner's "both"),
             rows: {kind: {mass (kg), diet, pack (kg a beast carries besides its rider), pace (km a day on a road),
                    offtake? (kg of meat a head gives a day, a kept herd's), mount? (true: ridden)}},
             herd: {kind, perMeat (head a band keeps for each kg a day of meat it means its herd to give)}}
     KCAMP.appetite(T, kind)          -> {good: kg a day} one beast of that kind: T.appetite[diet] x mass^0.75 x T.lowG
     KCAMP.beastNeeds(T, beasts)      -> {good: kg a day} beasts {kind: n}; the grazers' fodder is under its own good
     KCAMP.packCap(T, beasts)         -> kg a train of these beasts carries (each row's `pack` x n)
     KCAMP.pace(T, beasts)            -> km a day: the slowest kind's (a column keeps its slowest beast's pace)
     KCAMP.bandBeasts(T, tribe, census, row?) -> {kind: n} a band's beasts: its mounts (the census's `mounts`, of the
                                        tribe's kind) and its kept herd, sized so the herd gives T.meatFrom.herd of the
                                        mounts' meat
     KCAMP.meatPlan(T, beasts)        -> {need, hunt, herd} kg a day of meat the band's beasts need, and the shares the hunt
                                        and the kept herd are meant to give
   Every number is a pure function of the table: no draws, no state. */
KCAMP.appetite = function (T, kind) {
  var R = T.rows[kind]; if (!R) return {};
  var a = T.appetite[R.diet]; if (a == null) return {};
  var g = (T.eats || {})[R.diet] || R.diet, out = {};
  out[g] = a * Math.pow(R.mass, 0.75) * (T.lowG == null ? 1 : T.lowG);
  return out;
};
KCAMP.beastNeeds = function (T, beasts) {
  var out = {};
  Object.keys(beasts || {}).sort().forEach(function (k) {
    var n = beasts[k], A = KCAMP.appetite(T, k);
    Object.keys(A).forEach(function (g) { out[g] = (out[g] || 0) + A[g] * n; });
  });
  return out;
};
KCAMP.packCap = function (T, beasts) {
  var kg = 0;
  Object.keys(beasts || {}).forEach(function (k) { var R = T.rows[k]; if (R) kg += (R.pack || 0) * beasts[k]; });
  return kg;
};
KCAMP.pace = function (T, beasts) {
  var p = Infinity;
  Object.keys(beasts || {}).forEach(function (k) { var R = T.rows[k]; if (R && beasts[k] > 0 && R.pace != null) p = Math.min(p, R.pace); });
  return p === Infinity ? null : p;
};
KCAMP.bandBeasts = function (T, tribe, census, row) {
  var out = {}, kind = row || tribe;
  if (!T.rows[kind]) return out;
  out[kind] = census.mounts;
  var H = T.herd, A = KCAMP.appetite(T, kind), meat = A[(T.eats || {}).meat || 'meat'] || 0;
  if (H && meat > 0 && T.rows[H.kind] && T.rows[H.kind].offtake > 0) {
    var want = meat * census.mounts * ((T.meatFrom || {}).herd == null ? 0 : T.meatFrom.herd);
    out[H.kind] = Math.ceil(want / T.rows[H.kind].offtake);
  }
  return out;
};
KCAMP.meatPlan = function (T, beasts) {
  var g = (T.eats || {}).meat || 'meat', need = 0;
  Object.keys(beasts || {}).forEach(function (k) { var A = KCAMP.appetite(T, k); need += (A[g] || 0) * beasts[k]; });
  var F = T.meatFrom || { hunt: 1, herd: 0 };
  return { need: need, hunt: need * F.hunt, herd: need * F.herd };
};
