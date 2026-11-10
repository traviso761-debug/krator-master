/* ============================== 7h11. THE COLONY: NEPHTOS, A HYKKOUSOI PORT OF TETHYS (2026-11-09) ============================== */
/* [G data] The owner (2026-11-09): "Forest island east will have a new element: a Hykkousoi colony. Since I'm not at
   computer I can't lay it out, so for now we'll use a place holder radial layout. This colony, Nephtos, will be a port
   colony of Tethys run by its merchant family. It will be about 1/2 the size of Valapo and have dependent clove, cacao,
   indigo, annatto and tobacco plantations, in addition to having farming, fishing, and lumber hamlet/camps."
   A town on the sim as the two Islander towns are, from a plan in the shape of a core/city plan (what ISLE.simPlaces and
   ISLE.navOf read: R.lots, R.plan.ways and greens, R.landings), so its people, economy, households, money, hamlets,
   expeditions and house come from the same code. The plan is a PLACEHOLDER (the owner lays the town out later, from the
   Ys kit's Hykkousoi buildings, settlements/ys):
     ISLE.colonyPlan(spec) -> {R, G}   spec: {town, seed, frame {x, z, sea}, h(x, z) (local, above the sea), land(x, z)
                                       (local: dry ground a lot may stand on), sea [ux, uz] (local, seaward), shore [x, z]
                                       (local: the harbour's beach), households (the target)}
       the agora `AGORA.in` m inland of the harbour's beach; `spokes` radial streets from it, one down to the harbour; ring
       streets every `ring` m; lots just outside each ring street facing it, the civic and trade lots on the first ring
       and the harbour spoke, the houses ring by ring outward until the households are housed (rich nearest the agora),
       the works on the outer rings; every lot on dry ground (its corners and middle `land`), the plan clipped by the
       coast. Streets keep only their dry stretches. One landing at the beach: the colony's quay (`nephtos.stop`), its
       berths the Tethyan ships' and the pearl ships'.
   Its buildings are the Hykkousoi STAND-INS below (COLONY_DIMS: their footprints, households,
   roles; ISLE.households reads it beside ISLE_DIMS, which stays the kits' own), drawn as boxes by the world (openworld/isle-demo 88k); their kinds in the tune's `kinds`. */
ISLE.COLONY_DIMS = {
  'hyk-house': { w: 11, d: 9, h: 8, types: ['dwelling-multi'], family: 'dwelling', role: 'house', wealth: 'middle' },
  'hyk-house-poor': { w: 10, d: 8, h: 6, types: ['dwelling-multi'], family: 'dwelling', role: 'house', wealth: 'poor' },
  'hyk-villa': { w: 14, d: 12, h: 8, types: ['dwelling-single'], family: 'dwelling', role: 'villa', wealth: 'rich' },
  'hyk-palazzo': { w: 30, d: 24, h: 14, types: ['dwelling-multi'], family: 'dwelling', role: 'the merchant family\'s palazzo', wealth: 'rich' },
  'hyk-temple': { w: 22, d: 16, h: 13, types: ['religious'], role: 'temple of the sea' },
  'hyk-agora-hall': { w: 24, d: 14, h: 10, types: ['civic'], role: 'the colony\'s council hall' },
  'hyk-customs': { w: 16, d: 12, h: 9, types: ['civic'], role: 'the customs house' },
  'hyk-market': { w: 20, d: 16, h: 6, types: ['market'], role: 'market hall' },
  'hyk-shop': { w: 10, d: 9, h: 7, types: ['shop'], role: 'shop' },
  'hyk-tavern': { w: 14, d: 11, h: 7, types: ['tavern'], role: 'tavern' },
  'hyk-bakehouse': { w: 11, d: 9, h: 6, types: ['industry'], role: 'bakehouse' },
  'hyk-warehouse': { w: 24, d: 14, h: 9, types: ['industry'], role: 'warehouse' },
  'hyk-fishdock': { w: 18, d: 12, h: 5, types: ['industry'], role: 'fish market' },
  'hyk-shipyard': { w: 34, d: 20, h: 12, types: ['industry'], role: 'shipyard' },
  'hyk-potter': { w: 12, d: 10, h: 6, types: ['industry'], role: 'potter' },
  'hyk-weaver': { w: 12, d: 10, h: 6, types: ['industry'], role: 'weaver and dyer' },
  'hyk-smithy': { w: 12, d: 10, h: 6, types: ['industry'], role: 'coppersmith' },
  'hyk-healer': { w: 12, d: 10, h: 7, types: ['civic'], role: 'healer' },
  'hyk-school': { w: 16, d: 12, h: 8, types: ['civic'], role: 'school' },
  'hyk-barracks': { w: 20, d: 12, h: 8, types: ['dwelling-multi'], role: 'the marines\' barracks' }
};
/* each stand-in's Islander counterpart, whose census trade it carries (ISLE.tradeOf, 40): the colony's trades are the towns' */
ISLE.COLONY_AS = { 'hyk-house': 'ie-house-uma', 'hyk-house-poor': 'ie-hut-garden', 'hyk-villa': 'ie-house-wealthy', 'hyk-palazzo': 'ie-envoy', 'hyk-temple': 'ie-temple',
  'hyk-agora-hall': 'ie-hall', 'hyk-customs': 'ie-harbourmaster', 'hyk-market': 'ie-market', 'hyk-shop': 'ie-trader', 'hyk-tavern': 'ie-kava-house', 'hyk-bakehouse': 'ie-bakehouse',
  'hyk-warehouse': 'ie-warehouse', 'hyk-fishdock': 'ie-fishdock', 'hyk-shipyard': 'ie-dockyard', 'hyk-potter': 'ie-potter', 'hyk-weaver': 'ie-weaver', 'hyk-smithy': 'ie-smithy',
  'hyk-healer': 'ie-healer', 'hyk-school': 'ie-school', 'hyk-barracks': 'ie-barracks' };
/* the programme: what stands where. `first`: the agora's ring (the civic and trade lots, in this order round it from the
   harbour spoke); `harbour`: along the harbour spoke, nearest the beach first; `works`: on the outer rings after the
   houses; the houses by class, ring by ring outward */
ISLE.COLONY = {
  AGORA: { in: 150, r: 26 }, spokes: 8, ring: 58, rings: 6, lotGap: 5, spokeClear: 9, lotOff: 4,
  berthOut: 240,   /* the berths off the beach: past the lagoon's shelf (Nephtos's: under a metre for 150 m, two and more from 225) */
  first: ['hyk-palazzo', 'hyk-agora-hall', 'hyk-temple', 'hyk-market', 'hyk-shop', 'hyk-tavern', 'hyk-shop', 'hyk-bakehouse', 'hyk-healer', 'hyk-school', 'hyk-shop', 'hyk-tavern'],
  harbour: ['hyk-customs', 'hyk-warehouse', 'hyk-fishdock', 'hyk-shipyard', 'hyk-warehouse', 'hyk-warehouse', 'hyk-barracks'],
  works: ['hyk-potter', 'hyk-weaver', 'hyk-smithy', 'hyk-weaver', 'hyk-potter'],
  houses: { rich: { key: 'hyk-villa', rings: 2 }, middle: { key: 'hyk-house', rings: 2 }, poor: { key: 'hyk-house-poor' } }
};
ISLE.colonyPlan = function (spec) {
  var C = ISLE.COLONY, D = ISLE.COLONY_DIMS, sx = spec.sea[0], sz = spec.sea[1], sl = Math.hypot(sx, sz) || 1; sx /= sl; sz /= sl;
  var cx = spec.shore[0] - sx * C.AGORA.in, cz = spec.shore[1] - sz * C.AGORA.in, a0 = Math.atan2(sz, sx), town = spec.town;
  var R = { town: town, colony: true, lots: [], fields: [], world: [], wall: [], vessels: [], districts: [], plan: { ways: [], greens: [] }, landings: [], centre: [cx, cz], spokes: [] };
  var land = function (x, z) { return !!spec.land(x, z); }, P = function (r, a) { return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; };
  /* a polyline kept by its dry stretches (two points at least each) */
  var dryWays = function (pts, cls, w) { var cur = []; pts.forEach(function (p) { if (land(p[0], p[1])) cur.push([+p[0].toFixed(2), +p[1].toFixed(2)]); else { if (cur.length > 1) R.plan.ways.push({ cls: cls, w: w, pts: cur }); cur = []; } });
    if (cur.length > 1) R.plan.ways.push({ cls: cls, w: w, pts: cur }); };
  var rMax = C.AGORA.r + C.ring * C.rings;
  /* the spokes: one down the harbour (a0), the rest round; the harbour spoke runs on to the beach */
  for (var k = 0; k < C.spokes; k++) { var a = a0 + k * 2 * Math.PI / C.spokes, pts = []; R.spokes.push(a);
    var end = k === 0 ? C.AGORA.in : rMax; for (var r = C.AGORA.r; r <= end + 1e-6; r += 6) pts.push(P(r, a));
    dryWays(pts, k === 0 ? 'avenue' : 'main', k === 0 ? 10 : 7); }
  for (var j = 1; j <= C.rings; j++) { var rr = C.AGORA.r + C.ring * j - C.ring / 2, n = Math.max(24, Math.round(2 * Math.PI * rr / 8)), pts2 = [];
    for (var i = 0; i <= n; i++) pts2.push(P(rr, a0 + Math.PI / C.spokes + i / n * 2 * Math.PI)); dryWays(pts2, j === 1 ? 'main' : 'side', j === 1 ? 7 : 5); }
  /* the agora: a plaza round the centre */
  var poly = []; for (var q = 0; q < 12; q++) poly.push(P(C.AGORA.r, q / 12 * 2 * Math.PI));
  R.plan.greens.push({ id: 'agora', kind: 'plaza', poly: poly.map(function (p) { return [+p[0].toFixed(2), +p[1].toFixed(2)]; }), district: 'the agora' });
  /* a lot: its footprint dry at its corners and middle, clear of the others */
  var taken = [], fits = function (x, z, ry, w, d) { var c = Math.cos(ry), s = Math.sin(ry), ok = true;
    [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(function (o) { var px = x + o[0] * c + o[1] * s, pz = z - o[0] * s + o[1] * c; if (!land(px, pz)) ok = false; });
    if (!ok) return false; var rad = Math.hypot(w, d) / 2;
    return !taken.some(function (t) { return Math.hypot(t[0] - x, t[1] - z) < (t[2] + rad) * 0.82; }); };
  var lotN = 0, put = function (key, x, z, ry, cls, district, role) { var Dk = D[key]; taken.push([x, z, Math.hypot(Dk.w, Dk.d) / 2]); lotN++;
    R.lots.push({ id: town + '.lot' + lotN, lot: 'n' + lotN, key: key, x: +x.toFixed(2), z: +z.toFixed(2), ry: +ry.toFixed(4), w: Dk.w, d: Dk.d, cls: cls, district: district, role: role || Dk.role, name: Dk.role, tag: null }); };
  /* the slots along a ring street (just outside it), between the spokes, in order round from the harbour spoke */
  var slots = function (j, w, d) { var rr = C.AGORA.r + C.ring * j - C.ring / 2, rb = rr + C.lotOff + d / 2 + 1, out = [];
    for (var k = 0; k < C.spokes; k++) { var aS = a0 + k * 2 * Math.PI / C.spokes, aE = aS + 2 * Math.PI / C.spokes, clear = (C.spokeClear + w / 2) / rb;
      for (var a = aS + clear; a <= aE - clear + 1e-9; a += (w + C.lotGap) / rb) out.push({ a: a, r: rb }); }
    return out; };
  var placeOn = function (key, j, cls, district) { var Dk = D[key], S = slots(j, Dk.w, Dk.d), used = R._used || (R._used = {}), k0 = used[j] || 0;
    for (var i = k0; i < S.length; i++) { var s = S[i], p = P(s.r, s.a), ry = Math.atan2(-Math.cos(s.a), -Math.sin(s.a));
      if (fits(p[0], p[1], ry, Dk.w, Dk.d)) { used[j] = i + 1; put(key, p[0], p[1], ry, cls, district); return true; } }
    used[j] = S.length; return false; };
  /* the harbour: along the harbour spoke, both sides, nearest the beach first */
  var hk = 0; for (var r0 = C.AGORA.in - 20; r0 > C.AGORA.r + 20 && hk < C.harbour.length; r0 -= 4) for (var side = -1; side <= 1 && hk < C.harbour.length; side += 2) {
    var key = C.harbour[hk], Dk = D[key], off = 5 + Dk.w / 2 + 2, nx = -Math.sin(a0) * side, nz = Math.cos(a0) * side, b = P(r0, a0), x = b[0] + nx * off, z = b[1] + nz * off;
    var ry = Math.atan2(-nx, -nz); if (fits(x, z, ry, Dk.w, Dk.d)) { put(key, x, z, ry, 'trade', 'the harbour'); hk++; } }
  /* the agora's ring */
  C.first.forEach(function (key) { placeOn(key, 1, key === 'hyk-palazzo' ? 'rich' : 'civic', 'the agora'); });
  /* the houses, ring by ring outward until the households are housed */
  var hh = 0, want = spec.households == null ? 210 : spec.households, hhOf = function (key) { var t = D[key].types; return t.indexOf('dwelling-multi') >= 0 ? 3 : 1; };
  hh += 3;   /* the palazzo's households */
  for (var j2 = 1; j2 <= C.rings && hh < want; j2++) {
    var cls = j2 <= C.houses.rich.rings ? 'rich' : j2 <= C.houses.rich.rings + C.houses.middle.rings ? 'middle' : 'poor', key2 = C.houses[cls].key;
    while (hh < want && placeOn(key2, j2, cls, 'ring ' + j2)) hh += hhOf(key2);
  }
  /* the works on the outer rings (the last ring with room) */
  C.works.forEach(function (key) { for (var j3 = C.rings; j3 >= 2; j3--) if (placeOn(key, j3, 'works', 'the works')) return; });
  delete R._used;
  /* the landing: the colony's quay at the beach, its berths off it */
  var bx = spec.shore[0], bz = spec.shore[1], hd = Math.atan2(sx, sz), px = -sz, pz = sx;
  R.landings.push({ id: town + '.landing', x: +(bx - sx * 6).toFixed(2), z: +(bz - sz * 6).toFixed(2), berths: [
    { key: 'hykCorbita', x: +(bx + sx * C.berthOut + px * 26).toFixed(2), z: +(bz + sz * C.berthOut + pz * 26).toFixed(2), heading: hd },
    { key: 'hykPearl', x: +(bx + sx * (C.berthOut - 20) - px * 24).toFixed(2), z: +(bz + sz * (C.berthOut - 20) - pz * 24).toFixed(2), heading: hd }] });
  R.households = hh;
  var G = { frame: spec.frame, h: spec.h, colony: true };
  return { R: R, G: G };
};
/* the census of a colony's plan: its households and beds, by class (verify, the node test) */
ISLE.colonyCensus = function (R) {
  var T = ISLE.TUNE.sim, out = { lots: R.lots.length, households: 0, citizens: 0, byKey: {}, byCls: {} };
  R.lots.forEach(function (L) { var h = ISLE.households(L.key); out.households += h; out.citizens += h * T.home.per; out.byKey[L.key] = (out.byKey[L.key] || 0) + 1; out.byCls[L.cls] = (out.byCls[L.cls] || 0) + 1; });
  return out;
};
