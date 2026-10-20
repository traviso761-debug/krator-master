/* ============================== 4. THE CENSUS AND THE CHECKS, PER TOWN ============================== */
/* [G data] ISLE.census(R): what a town holds, from its records and the kits' declared types (ISLE_DIMS): buildings by kit,
   class, district and trade; dwellings and households (a single house one, a multi-family house three); citizens at five a
   household; the wall's pieces, the vessels by origin and use. ISLE.checks(R, ground) is what verify.py asserts and the
   node test runs: exact footprint overlap (SAT, 0.1 m), nothing on a carriageway, nothing in the sea but the harbour
   pieces, nothing on the wall, every vessel afloat and clear of the others, and the programme (PLAN.md section 8) present.
   Each returns plain records; a check is {name, ok, detail}. */
ISLE.EXPECT = {
  Kautoa: {
    /* the owner's redrawing (2026-10-18): about 6,000 people, at least two thirds of the build area built */
    roles: { palace: 1, envoy: 4, 'ceremonial square': 1, governor: 1, 'ancestor temple': 1, barracks: 2, 'watch tower': 1, quarry: 1, 'salt works': 1, 'council hall': 1, caravanserai: 1 },
    districts: { izani: { kit: 'izv', share: 0.8 }, works: { cls: ['works', 'industrial'], share: 0.5 }, riders: { cls: ['shrine', 'stable', 'rookery'], each: 3 } },
    vessels: { naval: ['islanderDrua', 'islanderKorakora', 'islanderKarakoa', 'islanderLanong'], fishing: ['islanderOruwa', 'islanderLakatoi'],
      civilian: ['vothDhow', 'hykCorbita', 'izizDhoni', 'beastWaa', 'salvageTug'] },
    origins: ['ringsea-islander', 'voth', 'hykkousoi', 'iziz-vernacular', 'beast-rider', 'ancients-salvage'],
    wall: { gates: 2 }, landing: 1, citizens: [5500, 6500], fields: 0, built: 0.66
  },
  Valapo: {
    /* the owner's redrawing (2026-10-18): about a third of Kautoa, built from the centre out */
    roles: { 'village hall': 1, 'ancestor temple': 1, garrison: 2, smelter: 1, caravanserai: 1 },
    districts: {},
    vessels: { civilian: ['islanderOruwa', 'islanderLakatoi'] }, origins: ['ringsea-islander'],
    wall: null, landing: 1, citizens: [1700, 2300], fields: 0
  }
};
/* a dwelling's households by its declared types: a multi-family house three, a single house one, else none (the sim's
   homes take five people a household from here: 40-isle-sim.js) */
ISLE.households = function (key) {
  var D = ISLE_DIMS[key] || {}, types = D.types || [];
  return types.indexOf('dwelling-multi') >= 0 ? 3 : (types.indexOf('dwelling-single') >= 0 || D.family === 'dwelling') ? 1 : 0;
};
ISLE.census = function (R) {
  var C = { town: R.town, buildings: R.lots.length, byKit: {}, byCls: {}, byDistrict: {}, byRole: {}, trades: {}, dwellings: 0, households: 0, citizens: 0,
    landmarks: 0, wall: { pieces: R.wall.length, gates: R.wall.filter(function (w) { return w.key === 'ie-gate'; }).map(function (w) { return w.role; }) },
    vessels: { n: R.vessels.length, byKey: {}, byUse: {}, origins: {} }, standIns: {} };
  var inc = function (o, k, n) { o[k] = (o[k] || 0) + (n == null ? 1 : n); };
  R.lots.forEach(function (L) {
    var D = ISLE_DIMS[L.key] || {}, types = D.types || [];
    inc(C.byKit, L.kit || '?'); inc(C.byCls, L.cls); inc(C.byDistrict, L.district);
    if (L.cls === 'landmark') { C.landmarks++; inc(C.byRole, L.role); }
    var trade = D.job || D.role; if (trade) inc(C.trades, trade);
    var hh = ISLE.households(L.key);
    if (hh) { C.dwellings++; C.households += hh; }
  });
  C.citizens = C.households * 5;
  R.vessels.forEach(function (Vr) { var D = ISLE_VDIMS[Vr.key] || {}; inc(C.vessels.byKey, Vr.key); inc(C.vessels.byUse, Vr.use); inc(C.vessels.origins, D.culture || '?'); });
  return C;
};
ISLE.checks = function (R, ground, o) {
  o = o || {};
  var KL = KCITY.lib, obbCorners = KL.obbCorners, out = [], h = ground.h, E = ISLE.EXPECT[R.town], C = ISLE.census(R);
  var ok = function (name, pass, detail) { out.push({ name: R.town + ': ' + name, ok: !!pass, detail: detail }); };
  var lots = o.lots || R.lots;
  /* exact overlap: every pair of standing footprints (landmarks too) */
  var I = KSPACE.create({ cell: 40 }), pairs = [], pen = KL.SL.pen;
  lots.forEach(function (L, i) { L._i = i; I.insert(L, L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)); });
  lots.forEach(function (A) { I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(function (B) { if (B._i > A._i && pen(A.bo, B.bo) > 0.1) pairs.push([A.id, B.id]); }); });
  ok('no two footprints overlap (exact SAT, 0.1 m)', pairs.length === 0, pairs.length + ' pairs' + (pairs.length ? ': ' + JSON.stringify(pairs.slice(0, 4)) : ''));
  /* on a street: a footprint reaching a carriageway (the exact-streets rule), alleys by their half width */
  var segs = KSPACE.create({ cell: 60 });
  R.plan.ways.forEach(function (w) { for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i]; segs.insert({ a: a, b: b, w: w }, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + w.w); } });
  var onSt = 0, ex = [];
  lots.forEach(function (L) {
    if (L.cls === 'landmark' || L.cls === 'civic') return;
    var Cn = obbCorners(L.bo), r = Math.hypot(L.bo.hw, L.bo.hd);
    var hit = segs.query(L.x, L.z, r + 14).some(function (s) { var tol = s.w.cls === 'alley' ? s.w.w / 2 : 0.05; return KL.polySegDist(Cn, s.a, s.b) < s.w.w / 2 - tol; });
    if (hit) { onSt++; if (ex.length < 3) ex.push(L.id); }
  });
  ok('nothing stands on a street', onSt === 0, onSt + ' on a carriageway' + (ex.length ? ' ' + ex.join(', ') : ''));
  /* in the sea: any corner or the middle under the waterline (the harbour pieces stand over it by design) */
  var wet = lots.filter(function (L) { return !L.shore && obbCorners(L.bo).concat([L.bo.c]).some(function (p) { return h(p[0], p[1]) < 0.3; }); });
  ok('nothing stands in the sea but the harbour pieces', wet.length === 0, wet.length + (wet.length ? ' (' + wet.slice(0, 3).map(function (L) { return L.id; }).join(', ') + ')' : ''));
  /* on the wall */
  var Wr = R.plan.wallRec, onW = 0;
  if (Wr) lots.forEach(function (L) { if (Wr.segs.some(function (sg) { return KL.polySegDist(obbCorners(L.bo), [sg.ax, sg.az], [sg.bx, sg.bz]) < 3.5; })) onW++; });
  ok('nothing stands on the wall', onW === 0, onW + '');
  /* vessels afloat, clear of each other */
  var dry = R.vessels.filter(function (Vr) { var s = Math.sin(Vr.heading), c = Math.cos(Vr.heading); return [0, 0.45, -0.45].some(function (q) { return h(Vr.x + s * q * Vr.L, Vr.z + c * q * Vr.L) > -0.8; }); });   /* bow and stern along the heading, (sin, cos) */
  var vcl = 0; R.vessels.forEach(function (A, i) { R.vessels.forEach(function (B, j) { if (j > i && Math.hypot(A.x - B.x, A.z - B.z) < (A.L + B.L) / 2) vcl++; }); });
  ok('every vessel afloat and clear of the others', dry.length === 0 && vcl === 0, dry.length + ' aground, ' + vcl + ' too close');
  /* the programme */
  var miss = [];
  for (var role in E.roles) if ((C.byRole[role] || 0) < E.roles[role]) miss.push(role + ' ' + (C.byRole[role] || 0) + '/' + E.roles[role]);
  ok('the landmarks the brief names', miss.length === 0, miss.length ? 'short: ' + miss.join(', ') : JSON.stringify(E.roles));
  for (var dn in E.districts) {
    var X = E.districts[dn], inD = lots.filter(function (L) { return L.district === dn; }), det;
    if (X.kit) { var k = inD.filter(function (L) { return L.kit === X.kit; }).length; det = k + ' of ' + inD.length + ' ' + X.kit; ok(dn + ': ' + X.kit + ' share ' + X.share, inD.length > 20 && k >= X.share * inD.length, det); }
    else if (X.share) { var k2 = inD.filter(function (L) { return X.cls.indexOf(L.cls) >= 0; }).length; ok(dn + ': ' + X.cls.join('/') + ' share ' + X.share, inD.length > 20 && k2 >= X.share * inD.length, k2 + ' of ' + inD.length); }
    else { var c3 = X.cls.map(function (c) { return c + ' ' + inD.filter(function (L) { return L.cls === c; }).length; }); ok(dn + ': at least ' + X.each + ' each of ' + X.cls.join(', '), X.cls.every(function (c) { return inD.filter(function (L) { return L.cls === c; }).length >= X.each; }), c3.join(', ')); }
  }
  for (var use in E.vessels) {
    var have = R.vessels.filter(function (Vr) { return Vr.use === use; }).map(function (Vr) { return Vr.key; }), lack = E.vessels[use].filter(function (k) { return have.indexOf(k) < 0; });
    ok('the ' + use + ' harbour\'s vessels', lack.length === 0, have.length + ' moored' + (lack.length ? ', missing ' + lack.join(', ') : ''));
  }
  var lackO = E.origins.filter(function (c) { return !C.vessels.origins[c]; });
  ok('vessels of every origin (' + E.origins.length + ')', lackO.length === 0, JSON.stringify(C.vessels.origins));
  if (E.wall) {
    /* named gates, or (the owner's redrawing) a count of them: gates found where the avenues reach the wall */
    var lg = typeof E.wall.gates === 'number' ? (C.wall.gates.filter(function (g) { return / Gate/.test(g); }).length >= E.wall.gates ? [] : ['at least ' + E.wall.gates + ' named'])
      : E.wall.gates.filter(function (g) { return C.wall.gates.indexOf(g) < 0; });
    ok('the wall and its gates', C.wall.pieces > 40 && lg.length === 0, C.wall.pieces + ' pieces, gates ' + C.wall.gates.join(', ') + (lg.length ? '; missing ' + lg.join(', ') : ''));
  }
  else ok('no wall (an open village)', C.wall.pieces === 0, C.wall.pieces + ' pieces');
  ok('the trade route\'s landing', R.landings.length >= E.landing, R.landings.length + '');
  /* the size (owner, 2026-10-18: Kautoa about 5,000 people, Valapo a third of it), at five a household */
  ok('a town of its size (' + E.citizens.join('-') + ' citizens)', C.citizens >= E.citizens[0] && C.citizens <= E.citizens[1], C.buildings + ' buildings, ' + C.households + ' households, ' + C.citizens + ' citizens');
  /* the hug: the houses keep to the shore, the landmarks and the avenues (PR.hug); the rest is farmland */
  var Hg = (R.prog || ISLE.PROG[R.town]).hug;
  if (Hg && R.hug) {
    var hl = lots.filter(function (L) { return Hg.roles.indexOf(L.district) >= 0; }), inn = hl.filter(function (L) { var d = R.hug(L.x, L.z); return d != null && d <= Hg.r1; }).length;
    ok('the houses hug the shore, the landmarks and the avenues', hl.length > 0 && inn >= 0.9 * hl.length, inn + ' of ' + hl.length + ' within ' + Hg.r1 + ' m');
  }
  if (E.built) ok('at least ' + Math.round(E.built * 100) + '% of the build area built (buildings and their compounds, streets, landmarks and markets)', R.cover && R.cover.share >= E.built,
    R.cover ? Math.round(R.cover.share * 100) + '% built: lots ' + Math.round(R.cover.lots * 100) + '%, streets ' + Math.round(R.cover.streets * 100) + '%, landmarks and markets ' + Math.round(R.cover.landmarksAndMarkets * 100) +
      '%, street verges ' + Math.round(R.cover.verges * 100) + '%; open ' + Math.round(R.cover.open * 100) + '%, parks ' + Math.round(R.cover.parks * 100) + '%, steep or walled ' + Math.round(R.cover.steepOrOut * 100) + '%; roofs alone ' + Math.round(R.cover.roofs * 100) + '% of ' + R.cover.landKm2 + ' km2' : 'no cover');
  var fc = {}; (R.fields || []).forEach(function (F) { fc[F.crop] = (fc[F.crop] || 0) + 1; });
  ok('farms and orchards on the open ground (' + E.fields + ' parcels or more)', (R.fields || []).length >= E.fields, (R.fields || []).length + ' parcels: ' + JSON.stringify(fc));
  ok('every key in the kits (none missing)', Object.keys(R.missing).length === 0, JSON.stringify(R.missing));
  return out;
};
