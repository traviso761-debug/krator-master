// node kits/ancient-transit/tests/test-transit.js: the data side (40-44) in node: the path, the highway and its ramps, the rail lines, the
// trains, the street dress. Each check has a negative. Prints 'all passed' or the failures and exits 1.
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { console, Math }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = p => vm.runInContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), ctx, { filename: p });
load('core/rand/08-core-rand.js'); load('core/space/20-core-space.js');
for (const f of ['40-tr-records.js', '41-tr-path.js', '42-tr-highway.js', '43-tr-rail.js', '41b-tr-network.js', '43b-tr-subway.js', '44-tr-dress.js', '44b-tr-war.js', '44c-tr-quake.js']) load('kits/ancient-transit/src/' + f);
const T = vm.runInContext('KTRANSIT', ctx), KRAND = vm.runInContext('KRAND', ctx), KSPACE = vm.runInContext('KSPACE', ctx);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
const throws = (fn, m) => { let t = false; try { fn(); } catch (e) { t = true; } ok(t, 'negative: ' + m); };
const fin = v => typeof v === 'number' && isFinite(v);
/* a rolling ground: hills of 6 m over 400 m, a dip in the middle */
const ground = (x, z) => 4 * Math.sin(x / 130) * Math.cos(z / 170) + (Math.hypot(x - 600, z) < 200 ? -9 * (1 - Math.hypot(x - 600, z) / 200) : 0);

/* the path */
{ const P = T.path([[0, 0], [1000, 0], [1000, 800]], { ground, radius: 80 });
  ok(P.L > 1700 && P.L < 1800, 'a filleted corner shortens the path a little: ' + P.L.toFixed(1));
  ok(P.pts.length > 3, 'the corner is an arc of points');
  const a = P.at(500); ok(Math.abs(a.x - 500) < 1e-6 && Math.abs(a.z) < 1e-6 && Math.abs(a.yaw - Math.PI / 2) < 1e-9, 'at(s) along the first leg, heading +x');
  const lp = P.lateral(500, 3); ok(Math.abs(lp[0] - 500) < 1e-6 && Math.abs(lp[1] + 3) < 1e-6, 'side +1 of a +x heading is -z');
  const pr = P.project(500, -3); ok(Math.abs(pr.s - 500) < 1e-6 && Math.abs(pr.off - 3) < 1e-6 && Math.abs(pr.d - 3) < 1e-6, 'project gives s and the signed offset');
  ok(P.at(-5).s === 0 && P.at(1e9).s === P.L, 'at clamps');
  throws(() => T.path([[0, 0]], { ground }), 'one waypoint throws');
  throws(() => T.path([[0, 0], [1, 1]], {}), 'no ground throws');
  throws(() => T.path([[0, 0], [1, 'a']], { ground }), 'a bad waypoint throws');
  const X = T.intersections(P, [[500, -100], [500, 100]]); ok(X.length === 1 && Math.abs(X[0].sP - 500) < 1e-6 && Math.abs(X[0].x - 500) < 1e-6, 'a street across the line crosses it once');
  ok(T.intersections(P, [[0, 50], [900, 50]]).length === 0, 'negative: a parallel street crosses nowhere');
  const Y = T.profile(P, { mode: 'deck', clearance: 9, maxGrade: 0.05, window: 16 });
  let over = true, grade = true; for (let i = 0; i < P.n; i++) { if (Y.Y[i] < P.YG[i] + 9 - 1e-6) over = false; if (i && Math.abs(Y.Y[i] - Y.Y[i - 1]) > 0.05 * (P.S[i] - P.S[i - 1]) + 1e-6) grade = false; }
  ok(over && grade, 'the deck clears the ground by the clearance everywhere and never exceeds the grade');
  const Yg = T.profile(P, { mode: 'grade', above: 0.45, maxGrade: 0.03 }); let fills = true; for (let i = 0; i < P.n; i++) if (Yg.Y[i] < P.YG[i] + 0.45 - 1e-6) fills = false; ok(fills, 'a grade profile only fills, never cuts');
  const Yl = T.profile(P, { mode: 'deck', clearance: 9, maxGrade: 0.05, lift: s => Math.abs(s - 800) < 20 ? 40 : null }); ok(Yl.at(800) >= 40 - 1e-6 && Yl.at(0) < 30, 'a lift raises the deck there and the grade carries it down'); }

/* the highway */
{ const pts = [[-1400, -300], [-200, -300], [900, 500], [2200, 500]];
  const H = T.highway(pts, { id: 'h1', ground, ramps: [{ s: 700, side: 1, dir: 'off' }, { s: 1500, side: -1, dir: 'on' }] });
  ok(H.spans.length > 100 && H.piers.length === H.spans.length + 1, H.spans.length + ' spans, a pier at every joint');
  let cont = true, ids = new Set(), stable = true; H.spans.forEach((S, i) => { if (ids.has(S.id)) stable = false; ids.add(S.id); if (i && (Math.abs(S.x0 - H.spans[i - 1].x1) > 1e-6 || Math.abs(S.z0 - H.spans[i - 1].z1) > 1e-6 || Math.abs(S.y0 - H.spans[i - 1].y1) > 1e-6)) cont = false; if (![S.x0, S.z0, S.y0, S.x1, S.z1, S.y1, S.yaw, S.len, S.pitch].every(fin)) cont = false; });
  ok(cont, 'the spans run end to end with finite numbers'); ok(stable && ids.size === H.spans.length, 'every span id is unique');
  ok(H.spans.every(S => T.SPAN_STATES.indexOf(S.state) >= 0) && H.piers.every(p => T.PIER_STATES.indexOf(p.state) >= 0), 'states from the vocabularies');
  const cnt = {}; H.spans.forEach(S => cnt[S.state] = (cnt[S.state] || 0) + 1); const n = H.spans.length;
  ok(Math.abs(cnt.intact / n - 0.45) < 0.1 && Math.abs((cnt.collapsed || 0) / n - 0.15) < 0.08, 'the ruin shares come out near the asked shares: ' + JSON.stringify(cnt));
  ok(H.spans.filter(S => S.state === 'collapsed').every(S => S.fall && fin(S.fall.y) && S.fall.y < S.y0), 'a collapsed span has its fall on the ground');
  ok(H.spans.filter(S => S.state === 'cracked').every(S => S.crack && !S.barriers[S.crack.side > 0 ? 1 : 0]), "a cracked span's barrier is gone on the cracked side");
  ok(H.rubble.length > 0 && H.rubble.every(k => fin(k.x) && fin(k.y)), 'rubble under the collapsed spans');
  const lamps = H.spans.reduce((a, S) => a + S.lamps.length, 0); ok(lamps > 20 && H.spans.filter(S => S.state === 'gone' || S.state === 'collapsed').every(S => !S.lamps.length), lamps + ' lamp standards on the standing deck, none on the fallen');
  ok(H.piers.filter(p => p.state === 'standing').every(p => p.h > 1.5) && H.piers.every(p => p.yTop <= H.deckAt(p.s) - 1.3), 'piers stand under the deck');
  let bareOk = true; H.piers.forEach((p, j) => { const L = H.spans[j - 1], R = H.spans[j], down = S => S && (S.state === 'collapsed' || S.state === 'gone'); if ((down(L) || down(R)) && p.state === 'standing') bareOk = false; }); ok(bareOk, 'a pier beside a fallen span is bare or a stub');
  ok(H.ramps.length === 2 && H.roads.length === 2, 'two ramps, two roads at grade');
  H.ramps.forEach(R => { const e = R.path.at(R.L), yEnd = R.deckAt(R.L); ok(yEnd - e.yG <= 0.35 + 1e-6 && yEnd - e.yG > -0.5, R.id + ' reaches grade (' + (yEnd - e.yG).toFixed(2) + ' m over the ground at its end)');
    ok(Math.abs(R.deckAt(0) - H.deckAt(R.s)) < 1e-6, R.id + ' leaves at the deck level'); ok(R.spans.length > 3 && R.piers.length === R.spans.length + 1, R.id + ' has spans and piers'); ok(R.piers[R.piers.length - 1].state === 'fill', R.id + ' lands on fill');
    const p0 = R.path.at(0), hp = H.path.project(p0.x, p0.z); ok(Math.abs(hp.off) > H.width / 2 && Math.abs(hp.off) < H.width / 2 + 8, R.id + ' starts beside the deck edge');
    ok(R.road.pts.length > 5 && R.road.pts.every(p => fin(p.y) && Math.abs(p.y - ground(p.x, p.z)) < 1e-6), R.id + "'s road lies on the ground"); });
  throws(() => T.highway(pts, { ground, ramps: [{ s: 10, side: 1 }] }), 'a ramp at the deck end throws');
  throws(() => T.highway(pts, { ground, ruin: { intact: 0.5, cracked: 0.6 } }), 'shares not summing to 1 throw');
  throws(() => T.highway(pts, {}), 'no ground throws');
  const H2 = T.highway(pts, { id: 'h1', ground, ramps: [{ s: 700, side: 1, dir: 'off' }, { s: 1500, side: -1, dir: 'on' }] });
  ok(JSON.stringify(H2.spans) === JSON.stringify(H.spans) && JSON.stringify(H2.ramps[0].spans) === JSON.stringify(H.ramps[0].spans), 'the same call gives the same records');
  const H3 = T.highway(pts, { id: 'h1', ground, ruin: { intact: 1, cracked: 0, collapsed: 0, gone: 0 } }); ok(H3.spans.every(S => S.state === 'intact') && H3.piers.every(p => p.state === 'standing' || p.state === 'fill'), 'all intact when asked');
  const H4 = T.highway(pts, { id: 'h1', ground, ruin: s => s < 800 ? { intact: 1, cracked: 0, collapsed: 0, gone: 0 } : { intact: 0, cracked: 0, collapsed: 0, gone: 1 } }); ok(H4.spans.filter(S => S.s1 <= 800).every(S => S.state === 'intact') && H4.spans.filter(S => S.s0 >= 800).every(S => S.state === 'gone'), 'ruin shares may be a function of s');
  /* the interchange */
  const G = T.highway([[400, -1200], [400, 1200]], { id: 'h2', ground, over: [H] });
  ok(G.crossings.length === 1, 'the crossing found'); const sc = G.crossings[0].s, hc = H.path.project(G.crossings[0].x, G.crossings[0].z);
  ok(G.deckAt(sc) >= H.deckAt(hc.s) + 1.4 + 6.5 - 1e-6, 'the second highway clears the first at the crossing: ' + (G.deckAt(sc) - H.deckAt(hc.s)).toFixed(1) + ' m');
  const G0 = T.highway([[400, -1200], [400, 1200]], { id: 'h2', ground }); ok(G0.deckAt(sc) < G.deckAt(sc) - 3, 'negative: without o.over it does not lift');
  /* the cull */
  const S = KSPACE.create({ cell: 24 }); S.insert({ r: 30 }, H.piers[20].x, H.piers[20].z, 30);
  const before = H.piers.filter(p => p.state === 'none').length, culled = T.cull(H, (x, z, r) => S.some(x, z, r, it => true));
  ok(culled >= 1 && H.piers[20].state === 'none' && H.spans[19].state !== 'intact' && H.spans[20].state !== 'intact' && before === 0, 'a pad culls the pier and its spans (' + culled + ')');
  ok(T.cull(H3, () => false) === 0, 'negative: nothing blocked, nothing culled'); }

/* the rail lines */
{ const streets = [{ id: 'av1', pts: [[300, -500], [300, 500]], width: 26 }, { id: 'st2', pts: [[900, -500], [900, 500]], width: 11 }];
  const R = T.rail([[-1200, 0], [2400, 0]], { id: 'cargo', ground, streets, catenary: true });
  ok(!R.elevated && R.beds.length > 200 && R.spans.length === 0, 'a grade line is beds, not spans');
  ok(R.beds.every(b => fin(b.fillH) && fin(b.y0)) && R.beds.some(b => b.fillH > 2) && R.beds.some(b => b.fillH < -0.5), 'the bed sits on fills over the dips and cuts the rises');
  ok(R.crossings.length === 2 && Math.abs(R.crossings[0].x - 300) < 1e-6 && R.crossings[1].width === 11 && R.crossings[0].gates.length === 2, 'a level crossing where each street meets the line, with its gates');
  ok(R.crossings.every(c => c.gates.every(g => ['up', 'down', 'broken'].indexOf(g.arm) >= 0)), "the gates' arms from the vocabulary");
  ok(R.signals.length >= 2 + 4 && R.signals.some(s => Math.abs(s.s - (R.crossings[0].s - 40)) < 1e-6), 'signals along the line and 40 m before a crossing');
  ok(R.rails.every(r => T.RAIL_STATES.indexOf(r.state) >= 0) && R.rails.some(r => r.state === 'bent' && r.bend > 0), 'rail sections in states');
  ok(R.ties.length > 4000 && R.ties.every(t => fin(t[0]) && t[1] >= 0 && t[1] <= 2), R.ties.length + ' sleepers');
  ok(R.catenary.length > 60 && R.catenary.every(m => ['intact', 'bent', 'fallen'].indexOf(m.state) >= 0), 'catenary masts');
  const cutS = R.beds.filter(b => b.state === 'cut').map(b => (b.s0 + b.s1) / 2); ok(cutS.length > 0 && cutS.every(s => R.rails.filter(r => s >= r.s0 && s < r.s1).every(r => r.state === 'gone')), 'rails over a cut bed are gone');
  ok(T.rail([[-1200, 0], [2400, 0]], { id: 'cargo', ground, streets: [{ pts: [[0, 50], [2000, 50]] }] }).crossings.length === 0, 'negative: a street along the line makes no crossing');
  const E = T.rail([[-1000, 300], [1800, 300], [1800, 1200]], { id: 'pax', ground, elevated: true, stations: [600, 2000] });
  ok(E.elevated && E.spans.length > 100 && E.piers.length === E.spans.length + 1 && E.beds.length === 0, 'an elevated line is spans on piers');
  ok(E.stations.length === 2 && E.stations.every(s => T.STATION_STATES.indexOf(s.state) >= 0 && s.stairs.length === 2 && s.platforms.length === 2), 'two stations with platforms and stairs');
  ok(E.stations.every(s => Math.abs(s.y - E.deckAt(s.s)) < 1e-6 && s.stairs.every(st => st.yG <= st.y)), 'a station stands at deck level, its stairs reach the ground');
  throws(() => T.rail([[-1000, 300], [1800, 300]], { ground, elevated: true, stations: [5] }), 'a station off the line throws');
  throws(() => T.rail([[0, 0], [10, 0]], {}), 'no ground throws');
  /* the trains */
  const F = T.train(R, { id: 'fr', s: 1800, kind: 'freight', state: 'derailed', from: 3, cars: ['loco', 'box', 'tank', 'flat', 'box', 'box', 'tank', 'flat', 'box', 'tank', 'flat', 'box', 'box', 'tank'], burnt: 1 });
  ok(F.cars.length === 14 && F.cars[0].kind === 'loco' && F.cars.every(c => fin(c.x) && fin(c.y) && fin(c.yaw) && fin(c.roll)), 'a freight train of eight cars');
  let tail = true; for (let k = 1; k < F.cars.length; k++) { const a = F.cars[k - 1], b = F.cars[k]; if (Math.abs((a.s - a.len / 2) - (b.s + b.len / 2) - 0.9) > 1e-6) tail = false; } ok(tail, 'the cars stand nose to tail with 0.9 m between');
  ok(F.cars.slice(0, 3).every(c => c.state === 'ok' && c.off === 0) && F.cars.slice(3).every(c => c.state !== 'ok' && Math.abs(c.off) > 0.5), 'derailed from the fourth car on, the cars off the rails');
  ok(F.cars.some(c => c.state === 'overturned' && Math.abs(c.roll) > 1.2) && F.cars.some(c => c.burnt), 'some overturned, some burnt');
  const F0 = T.train(R, { id: 'fr0', s: 1800, kind: 'freight', state: 'standing' }); ok(F0.cars.every(c => c.state === 'ok' && c.roll === 0 && Math.abs(c.y - R.railAt(c.s)) < 1e-6), 'negative: a standing train sits on the rails, nothing rolled');
  const Pn = T.train(E, { id: 'px', s: 1200, kind: 'passenger', state: 'fallen' });
  ok(Pn.cars.length === 5 && Pn.cars.every(c => c.kind === 'coach') && Pn.cars.some(c => c.state === 'fallen' && c.y < E.deckAt(c.s) - 3), 'a passenger train with coaches fallen from the guideway');
  throws(() => T.train(R, { s: 50, kind: 'freight' }), 'a train that does not fit throws');
  throws(() => T.train(R, { s: 1800, cars: ['loco', 'zeppelin'] }), 'an unknown car kind throws'); }

/* the subway */
{ const SW = T.subway([[-120, -1750], [-120, -700], [-60, -250], [-60, 1750]], { id: 'sw', ground, stations: [900, 2500], stationStates: ['ruined', 'collapsed'], seed: 4471 });
  ok(SW.sections.length > 150 && T.SUBWAY_STATES.every(s => SW.sections.some(S => S.state === s)), SW.sections.length + ' sections in every state');
  ok(SW.sections.every(S => S.y0 < ground(S.x0, S.z0) - 6 && fin(S.pitch)), 'the tunnel floor runs under the ground');
  ok(SW.sections.filter(S => S.inStation).every(S => S.state === 'intact'), 'the sections under a hall are the hall\'s');
  ok(SW.stations.length === 2 && SW.stations[0].state === 'ruined' && SW.stations[1].state === 'collapsed' && SW.stations.every(S => S.entrances.length === 2 && S.furniture.length === 8 && S.columns.length > 10), 'two stations in the states asked, each with two entrances, furniture and columns');
  ok(SW.stations.every(S => S.entrances.every(E => Math.abs(E.y - ground(E.x, E.z)) < 1e-6 && E.rise > 6 && E.rise < 16 && ['intact', 'ruined', 'choked'].indexOf(E.state) >= 0)), 'every entrance stands at the street and goes down to the hall');
  ok(SW.sinkholes.length > 5 && SW.sinkholes.every(h => h.section) && SW.voids.length === 1 && SW.voids[0].station === SW.stations[1].id && SW.pits.length === 4, 'sinkholes over the collapsed sections, a void over the fallen station, four stair pits');
  ok(Math.abs(T.sinkholeH(SW, SW.voids[0].x, SW.voids[0].z) + SW.voids[0].drop) < 1e-6 && T.sinkholeH(SW, SW.pits[0].x, SW.pits[0].z) < -0.2 && T.carved(SW).length === SW.sinkholes.length + 5, 'the void is its drop deep, a pit is carved, every carve is listed');
  ok(SW.sinkholes.every(h => Math.abs(T.sinkholeH(SW, h.x, h.z) + h.depth) < 1e-6 && T.sinkholeH(SW, h.x + h.r + 1, h.z) >= T.sinkholeH(SW, h.x + h.r + 1, h.z)), 'a sinkhole is its depth deep at its middle');
  ok(T.sinkholeH(SW, 5000, 5000) === 0, 'negative: no depression away from the holes');
  ok(SW.rails.length === 2 * Math.round(SW.L / 24) && SW.rails.filter(r => r.state === 'gone').length > 0 && SW.rails.some(r => r.state === 'intact'), 'two tracks of rail sections, gone where the roof fell');
  const St = T.train(SW, { s: 930, kind: 'passenger', cars: 4, state: 'standing' }), Sd = T.train(SW, { s: 1700, kind: 'passenger', cars: 4, state: 'derailed', from: 1 });
  ok(St.cars.every(c => Math.abs(c.y - SW.railAt(c.s)) < 1e-6) && Sd.cars.slice(1).every(c => c.state !== 'ok' && c.y > SW.floorAt(c.s) && c.y < SW.floorAt(c.s) + 3), 'a train stands at rail level, a derailed one lies on the tunnel floor');
  throws(() => T.subway([[0, 0], [500, 0]], { ground, stations: [20] }), 'a station off the line throws');
  throws(() => T.subway([[0, 0], [500, 0]], {}), 'no ground throws');
  ok(JSON.stringify(T.subway([[-120, -1750], [-120, -700], [-60, -250], [-60, 1750]], { id: 'sw', ground, stations: [900, 2500], stationStates: ['ruined', 'collapsed'], seed: 4471 }).sinkholes) === JSON.stringify(SW.sinkholes), 'the same call gives the same sinkholes');
  const E = T.rail([[-1000, 300], [1800, 300]], { id: 'pax', ground, elevated: true }), Ed = T.train(E, { s: 1200, kind: 'passenger', state: 'derailed', from: 1 });
  ok(Ed.cars.slice(1).every(c => c.y > E.deckAt(c.s) && c.y < E.deckAt(c.s) + 3), 'a car derailed on a guideway stays on the deck'); }

/* the war along a street */
{ const st = { id: 'ave', pts: [[-1500, 0], [1500, 0]], width: 26, ground };
  const W = T.war(st, { damage: s => 0.1 + 0.9 * s / 3000, seed: 901 }), third = i => W.craters.filter(c => c.s >= i * 1000 && c.s < (i + 1) * 1000).length;
  ok(third(0) <= 4 && third(1) > third(0) && third(2) > third(1), 'the craters grow along the street with the damage: ' + third(0) + ' / ' + third(1) + ' / ' + third(2));
  ok(W.craters.every(c => c.r >= 2 && c.r <= 11 && c.depth > 0.5 && c.depth <= 4 && fin(c.x)), 'craters of 2 to 11 m, up to 4 m deep');
  ok(W.scorch.length > 20 && W.rubble.length > W.craters.length * 6 && W.rubble.every(r => fin(r.y)), 'scorch marks, rims and thrown slabs');
  ok(W.pieces.length > 40 && W.pieces.every(p => T.KINDS[p.kind] && T.KINDS[p.kind].states.indexOf(p.state) >= 0 && !T.inCrater(W, p.x, p.z, 0)), W.pieces.length + ' pieces strewn, none in a crater');
  ok(W.pieces.some(p => p.role === 'barricade') && W.pieces.filter(p => p.role === 'strewn').every(p => p.state !== 'intact'), 'barricades, and the strewn pieces all wrecked');
  ok(W.positions.length === 0 && !W.pieces.some(p => p.role === 'position'), 'negative: no military positions unless asked');
  const iso = W.craters.find(c => W.craters.every(d => d === c || Math.hypot(c.x - d.x, c.z - d.z) > 3 * (c.r + d.r))) || W.craters[0]; ok(T.craterH(W, iso.x, iso.z) <= -iso.depth + 1e-6 && T.craterH(W, iso.x + iso.r, iso.z) > 0 && T.craterH(W, iso.x + iso.r, iso.z) < iso.depth * 0.2 + 1e-6, 'a crater is its depth deep at its middle with a low rim at its edge');
  { let jump = 0; for (let d = 0; d < iso.r * 1.7; d += 0.05) { const a = T.craterH(W, iso.x + d, iso.z), b = T.craterH(W, iso.x + d + 0.05, iso.z); jump = Math.max(jump, Math.abs(a - b)); } ok(jump < 0.35, 'the ground is continuous across the crater\'s edge (biggest step over 5 cm: ' + jump.toFixed(3) + ' m)'); }
  const riot = T.war(st, { damage: 0.2, seed: 1 }); ok(riot.craters.length === 0 && riot.scorch.length > 10 && riot.pieces.some(p => p.role === 'barricade'), 'a riot: scorch and barricades, no craters');
  const smith = T.war(st, { damage: 1, seed: 1 }); ok(smith.craters.length > 60 && smith.pieces.filter(p => p.role === 'strewn').length > riot.pieces.filter(p => p.role === 'strewn').length, 'smithereens: ' + smith.craters.length + ' craters');
  const Mil = T.war({ id: 'st1', pts: [[-300, -900], [-300, 900]], width: 11, ground }, { damage: 0.5, military: true, positions: [900], seed: 902 });
  ok(Mil.positions.length >= 3 && Mil.positions.some(p => p.kind === 'checkpoint' && p.s === 900) && ['checkpoint', 'emplacement', 'post'].every(k => Mil.positions.some(p => p.kind === k) || Mil.positions.length < 6), 'military positions, a checkpoint at the crossing: ' + Mil.positions.map(p => p.kind).join(', '));
  ok(Mil.pieces.filter(p => p.role === 'position').every(p => T.MILITARY_KINDS.indexOf(p.kind) >= 0 || p.kind === 'tr_barrier') && Mil.pieces.some(p => p.kind === 'tr_sandbags') && Mil.pieces.some(p => p.kind === 'tr_sentry'), 'sandbags and sentry posts among them');
  const D = T.dress(st, { seed: 5, war: W, damage: W.damageAt }), Ds = T.dress(st, { seed: 5, war: smith, damage: 1 }); ok(D.pieces.every(p => !T.inCrater(W, p.x, p.z, 0)) && Ds.pieces.every(p => p.state !== 'intact' || p.kind.indexOf('rubble') >= 0) && D.pieces.some(p => p.state === 'intact'), 'the dress keeps off the craters and is all wrecked where the damage is 1');
  throws(() => T.war({ pts: [[0, 0]] }, {}), 'no ground throws');
  ok(JSON.stringify(T.war(st, { damage: 0.5, seed: 7 }).craters) === JSON.stringify(T.war(st, { damage: 0.5, seed: 7 }).craters), 'the same call gives the same craters'); }

/* the slopes: a graded road and rail cut and fill; the earthquake */
{ const hill = (x, z) => { const k = Math.hypot(x - 300, z) / 150; return (k < 1 ? 18 * (1 - k * k) * (1 - k * k) : 0) + 2 * Math.sin(x / 90); };
  const Rd = T.road([[-800, 0], [1200, 0]], { id: 'rd', ground: hill, width: 11, maxGrade: 0.08 });
  let gmax = 0; Rd.segs.forEach(sg => { gmax = Math.max(gmax, Math.abs(sg.y1 - sg.y0) / Math.hypot(sg.x1 - sg.x0, sg.z1 - sg.z0)); });
  ok(gmax <= 0.081 && Rd.segs.some(sg => sg.fill < -2) && Rd.segs.some(sg => sg.fill > 1), 'a road over an 18 m hill holds 8%, cuts the top (' + Math.min(...Rd.segs.map(s => s.fill)).toFixed(1) + ' m) and fills its feet');
  ok(T.lineH(Rd, 300, 0) < -1.5 && T.lineH(Rd, 300, 40) === 0 && T.lineH(Rd, -800, 0) > -0.4, 'the cutting is carved under the road at the top, not beside it or on the flat');
  ok(Math.abs(Rd.levelAt(300, 0) - Rd.yAt(Rd.path.project(300, 0).s)) < 1e-6 && Rd.levelAt(-400, 0) <= Rd.yAt(Rd.path.project(-400, 0).s) + 1e-6, 'the level is the alignment, lower only where the ground is carved under the formation');
  const Rl = T.rail([[-800, 50], [1200, 50]], { id: 'rl', ground: hill }); let rg = 0; Rl.beds.forEach(b => { rg = Math.max(rg, Math.abs(b.y1 - b.y0) / b.len); });
  ok(rg <= 0.031 && Rl.beds.some(b => b.fillH < -3) && Rl.beds.some(b => b.fillH > 1), 'a rail at grade holds 3%, cutting deep and filling');
  throws(() => T.road([[0, 0], [10, 0]], {}), 'a road without ground throws');
  const Rs = T.road([[-800, 0], [1200, 0]], { id: 'rs', ground: hill, width: 11, drift: 0.8 }), R0 = T.road([[-800, 0], [1200, 0]], { id: 'rs', ground: hill, width: 11 });
  ok(Rs.drifts.length > 20 && Rs.drifts.every(d => d.s1 > d.s0 && d.reach > 0 && d.reach <= 12 && d.depth > 0.2 && Math.abs(d.side) === 1) && R0.drifts.length === 0, 'a road under sand has drifts, each a wedge from a kerb (' + Rs.drifts.length + '); none unasked');
  const Q = T.quake({ pts: [[0, -500], [0, 500]], throw: 3, slip: 5, twist: 0.05 });
  ok(Math.abs(T.quakeH(Q, 30, 0) - T.quakeH(Q, -30, 0) - 3) < 1.8 && Math.abs(T.quakeH(Q, 400, 0) - 3) < 1e-6 && Math.abs(T.quakeH(Q, -400, 0)) < 1e-6 && Math.abs(T.quakeH(Q, 0.01, 0) - 1.5) < 1.2, 'the fault lifts one whole side 3 m, half way at the scarp, the buckles beside it');
  const sh = T.quakeShift(Q, 20, 0), sh2 = T.quakeShift(Q, -20, 0), sh3 = T.quakeShift(Q, 300, 0);
  ok(Math.hypot(sh[0], sh[1]) > 3 && Math.abs(sh[1]) > Math.abs(sh[0]) && Math.hypot(sh2[0], sh2[1]) < 1.5 && Math.hypot(sh3[0], sh3[1]) < 0.01, 'the lifted side is carried along the fault near it, the other side hardly, the far land not');
  ok(Math.abs(T.quakeRoll(Q, 10, 0)) > 0.03 && T.quakeRoll(Q, 10, 0) * T.quakeRoll(Q, -10, 0) < 0 && Math.abs(T.quakeRoll(Q, 300, 0)) < 1e-3, 'structures roll near the fault, opposite ways on its sides, not far off');
  const Ps = T.path([[-300, 100], [300, 100]], { ground, shift: (x, z) => T.quakeShift(Q, x, z) }), Pn = T.path([[-300, 100], [300, 100]], { ground });
  ok(Ps.pts.length > Pn.pts.length && Math.abs(Ps.project(30, 100).off) > 2.5 && Math.abs(Ps.at(0).z - 100) < 0.5 && Math.abs(Ps.at(Ps.L).z - 100) < 0.5, 'a shifted path bends through the fault: carried beside it, its ends not');
  const Hq = T.highway([[-600, 100], [600, 100]], { id: 'hq', ground, quake: Q, shift: (x, z) => T.quakeShift(Q, x, z) });
  ok(Hq.spans.some(S => Math.abs(S.roll) > 0.02) && Hq.spans.filter(S => Math.abs(S.x0) > 300).every(S => Math.abs(S.roll) < 1e-3) && Hq.piers.some(p => Math.abs(p.roll) > 0.02), 'the spans and piers near the fault roll');
  throws(() => T.quake({ pts: [[0, 0]] }), 'a fault of one point throws'); }

/* the network: junctions of 2, 3, 4 and 6 arms, one level each; the road kinds; the blockades */
{ const defs = [{ id: 'av', pts: [[-1500, 0], [1500, 0]], kind: 'avenue' }, { id: 's1', pts: [[-300, -900], [-300, 900]], kind: 'road' }, { id: 't', pts: [[-100, 0], [-100, 600]], kind: 'street' },
    { id: 'c1', pts: [[-700, 180], [-700, 560]], kind: 'street' }, { id: 'c2', pts: [[-700, 560], [-420, 560]], kind: 'lane' }, { id: 'd1', pts: [[600, -400], [1000, 400]], kind: 'street' }, { id: 'd2', pts: [[1000, -400], [600, 400]], kind: 'street' }];
  const N = T.network(defs, { ground }), kinds = N.junctions.map(J => J.kind);
  ok(N.roads.length === 7 && N.junctions.length === 4 && N.nodes.length === 15 && ['corner', 'tee', 'cross', 'six'].every(k => kinds.indexOf(k) >= 0), 'seven roads, four junctions and eleven ends: ' + kinds.join(', '));
  const six = N.junctions.find(J => J.kind === 'six'), tee = N.junctions.find(J => J.kind === 'tee'), corner = N.junctions.find(J => J.kind === 'corner');
  ok(six.n === 6 && Math.abs(six.x - 800) < 1 && Math.abs(six.z) < 1 && tee.n === 3 && tee.arms.filter(a => a.end).length === 1 && corner.n === 2 && corner.arms.every(a => a.end), 'six arms at (800, 0), a T with one ending road, a corner of two ends');
  ok(N.junctions.every(J => J.arms.every(a => Math.abs(N.roads[a.road].yAt(a.s) - J.y) < 0.35)), 'every road through a junction meets its level');
  ok(N.junctions.every(J => J.corners.length === J.n && J.corners.every(c => c.inner.length >= 2 && c.outer.length >= 2 && (c.straight || c.inner.length === 9))), 'a pavement corner between each pair of arms, filleted where the kerbs meet');
  const cross = N.junctions.find(J => J.kind === 'cross'), avArm = cross.arms.find(a => a.road === 0), rdArm = cross.arms.find(a => a.road === 1);
  ok(cross.corners.every(c => Math.abs(Math.abs(c.apex[0] + 300) - 5.5) < 0.02 && Math.abs(Math.abs(c.apex[1]) - 13) < 0.02), 'the cross: the kerb lines meet at the road\'s half width along the avenue and the avenue\'s along the road');
  ok(avArm.cut > 5.5 && avArm.cut < 10 && rdArm.cut > 13 && rdArm.cut < 18, 'the avenue is cut just past the road\'s kerb, the road just past the avenue\'s: ' + avArm.cut.toFixed(1) + ', ' + rdArm.cut.toFixed(1));
  ok(tee.corners.filter(c => c.straight).length === 1 && tee.corners.filter(c => !c.straight).length === 2, 'the T: two filleted corners, the far side straight across');
  ok(N.junctions.every(J => J.arms.every(a => Math.abs(N.roads[a.road].yAt(a.s + a.dir * a.cut) - J.y) < 0.05)), 'every road is level with its junction at its cut');
  ok(N.segments.length === 13 && N.segments.every(sg => sg.s1 > sg.s0) && N.segments.filter(sg => sg.road === 0).length === 4 && N.segments.filter(sg => sg.road === 0).every(sg => sg.from && sg.to), 'thirteen segments between the nodes, the avenue in four');
  ok(T.cutsOf(N, 0).length === 3 && T.cutsOf(N, 0).every(c => c[1] - c[0] > 10 && c[1] - c[0] < 40), 'the avenue is cut three times, each 10 to 40 m');
  const Ns = T.network([{ id: 'a', pts: [[0, 0], [600, 0]], kind: 'street' }, { id: 'b', pts: [[0, 0], [600, 127]], kind: 'street' }], { ground }), Js = Ns.junctions[0];
  ok(Js && Js.kind === 'corner' && Js.corners.some(c => c.sliver) && Js.arms.every(a => a.cut < 25), 'two streets meeting under 12 degrees: the corner capped, the cuts under 25 m: ' + Js.arms.map(a => a.cut.toFixed(1)).join(', '));
  const Nd = T.network([{ id: 'av', pts: [[-1500, 0], [1500, 0]], kind: 'avenue' }, { id: 's1', pts: [[-300, -900], [-300, 900]], kind: 'road', drift: 1 }], { ground }), cd = T.cutsOf(Nd, 1)[0];
  ok(Nd.roads[1].drifts.length > 10 && Nd.roads[1].drifts.every(d => d.s1 <= cd[0] || d.s0 >= cd[1]) && Nd.roads[1].drifts.some(d => Math.abs(d.s1 - cd[0]) < 3 || Math.abs(d.s0 - cd[1]) < 3), 'a road under sand keeps its drifts off its junction, trimmed to the cut');
  const Dt = T.dress({ id: 'av', pts: [[-1500, 0], [1500, 0]], width: 26, ground }, { seed: 5, network: N, road: 0 });
  ok(Dt.pieces.filter(p => p.junction === tee.id && p.kind === 'tr_signal').length === 3 && Dt.pieces.filter(p => p.junction === cross.id && p.kind === 'tr_signal').length === 4 && Dt.pieces.every(p => p.junction || !T.junctionAt(N, p.x, p.z, 0)), 'three signals on the T (one on its straight side), four on the cross, no other piece in a junction');
  const Wn = T.war({ id: 's1', pts: [[-300, -900], [-300, 900]], width: 11, ground }, { damage: 0.6, military: true, blockades: true, seed: 902, network: N, road: 1 });
  ok(Wn.pieces.length > 50 && Wn.pieces.every(p => !T.junctionAt(N, p.x, p.z, 0)) && Wn.blockades.every(b => !T.nearJunction(N, 1, b.s, 10)) && Wn.positions.every(q => !T.nearJunction(N, 1, q.s, 10)), 'the war keeps its pieces, barricades and positions off the junction');
  /* a road joined later (a ramp's landing road): carried to the avenue's centre line, a T, the avenue regraded flat there in place */
  const Nj = T.network([{ id: 'av', pts: [[-1500, 0], [1500, 0]], kind: 'avenue' }], { ground }), avRd = Nj.roads[0], groundHolder = avRd.levelAt, before = avRd.yAt(500);
  const kj = T.join(Nj, { id: 'land', pts: [[500, -300], [500, -8]], width: 7.5, pavement: 0, lines: 'edges', kind: 'ramp', pins: [{ s: 0, y: ground(500, -300) + 3 }] }), Lr = Nj.roads[kj], Jr = Nj.junctions[0];
  ok(Nj.roads.length === 2 && Nj.junctions.length === 1 && Jr.kind === 'tee' && Jr.ramp && Math.abs(Jr.x - 500) < 0.5 && Math.abs(Jr.z) < 0.5 && Lr.network === Nj && Lr.netIndex === 1, 'a landing road ending 8 m inside the avenue is carried to its centre: a T at (500, 0)');
  ok(Math.abs(Lr.yAt(Lr.L) - Jr.y) < 0.05 && Math.abs(Lr.yAt(0) - (ground(500, -300) + 3)) < 0.05 && Math.abs(avRd.yAt(2000) - Jr.y) < 0.05 && Math.abs(groundHolder(520, 0) - avRd.levelAt(520, 0)) < 1e-9, 'the landing road meets the level at its end and its deck pin at its start; the avenue regraded in place under an old holder');
  ok(Nj.segments.filter(sg => sg.road === 0).length === 2 && T.cutsOf(Nj, 1).length === 1 && Nj.nodes.length === 4, 'the avenue split in two segments, the landing road cut once, four nodes');
  const Nt = T.network([{ id: 'av', pts: [[-1500, 0], [1500, 0]], kind: 'avenue' }], { ground }); T.join(Nt, { id: 'thru', pts: [[700, -200], [700, 30]], kind: 'ramp', pavement: 0, trim: true });
  ok(Nt.junctions.length === 1 && Nt.junctions[0].kind === 'tee' && Math.abs(Nt.roads[1].L - 200) < 1, 'a joined road that crosses the avenue is trimmed at it (trim): a T, 200 m long');
  const Hj = T.highway([[-1700, -560], [1700, -560]], { id: 'hj', ground, ramps: [{ s: 520, side: -1, dir: 'off' }] }), Nh = T.network([{ id: 'x', pts: [[-1000, -700], [-1000, -300]], kind: 'street' }], { ground }), ks = T.joinRamps(Nh, Hj);
  ok(ks.length === 1 && Hj.ramps[0].road === Nh.roads[ks[0]] && Hj.ramps[0].road.roadKind === 'ramp' && Nh.junctions.some(J => J.ramp && J.kind === 'tee') && Math.abs(Hj.ramps[0].road.yAt(0) - Hj.ramps[0].deckAt(Hj.ramps[0].L)) < 0.05, 'joinRamps: the off ramp lands on the street in a T, its road pinned to the deck end');
  throws(() => T.join({}, { pts: [[0, 0], [1, 1]] }), 'join without a network throws'); throws(() => T.join(Nj, { pts: [[0, 0]] }), 'join of one point throws');
  const legs = Dt.pieces.filter(p => p.span).map(p => [-1, 1].map(sd => [p.x + Math.cos(p.yaw) * sd * p.span / 2, p.z - Math.sin(p.yaw) * sd * p.span / 2]));
  ok(legs.length >= 10 && legs.every(L => L.every(l => !Dt.pieces.some(p => !p.span && Math.hypot(p.x - l[0], p.z - l[1]) < p.r + 1.0))), 'no kerb piece stands under a gantry\'s or a footbridge\'s leg');
  ok(N.roads[2].width === 7.5 && N.roads[2].lines === 'edges' && N.roads[4].width === 5 && N.roads[4].lines === 'none' && N.roads[0].width === 26, 'the kinds: a street 7.5 m with edge lines, a lane 5 m with none, an avenue 26');
  ok(T.junctionAt(N, 800, 2, 0) === six && T.junctionAt(N, 800, 60, 0) === null && T.nearJunction(N, 0, 2300, 0) === six && !T.nearJunction(N, 0, 2200, 0), 'junctionAt and nearJunction find them, and only them');
  throws(() => T.network([], { ground }), 'an empty network throws'); throws(() => T.network(defs, {}), 'no ground throws');
  const W = T.war({ id: 's1', pts: [[-300, -900], [-300, 900]], width: 11, ground }, { damage: 0.5, blockades: true, seed: 902 });
  ok(W.blockades.length >= 3 && W.blockades.every(b => b.vehicles.length >= 2 && b.vehicles.every(v => T.VEHICLES[v.key] && Math.abs(v.lat) + v.ext <= b.wide / 2 + 0.5 && ['burnt', 'wreck', 'weathered'].indexOf(v.state) >= 0)), W.blockades.length + ' barricades of 2 or more wrecks, each inside the road');
  let apart = true; W.blockades.forEach(b => { for (let i = 1; i < b.vehicles.length; i++) if (b.vehicles[i].row === b.vehicles[i - 1].row && b.vehicles[i].lat - b.vehicles[i].ext < b.vehicles[i - 1].lat + b.vehicles[i - 1].ext - 1e-6) apart = false; }); ok(apart, 'the wrecks stand nose to tail, none through another');
  ok(W.pieces.some(p => p.role === 'barricade' && p.kind === 'tr_sandbags'), 'sandbags beside the barricades');
  throws(() => T.war({ id: 's1', pts: [[-300, -900], [-300, 900]], width: 11, ground }, { blockades: [2] }), 'a barricade off the street throws');
  const Hb = T.highway([[-1700, -560], [1700, -560]], { id: 'hb', ground, blockades: [1700] }); ok(Hb.blockades.length === 1 && Hb.blockades[0].rows === 2 && Hb.blockades[0].vehicles.length >= 4 && Hb.blockades[0].vehicles.every(v => Math.abs(v.y - Hb.deckAt(1700)) < 1e-6), 'a barricade of two rows on the deck, its wrecks at deck level');
  throws(() => T.highway([[-1700, -560], [1700, -560]], { id: 'hb', ground, blockades: [2] }), 'a deck barricade off the deck throws'); }

/* the dress */
{ const S = KSPACE.create({ cell: 12 }); S.insert({ x: 400, z: 0, r: 20 }, 400, 0, 20);
  const D = T.dress({ id: 'ave', pts: [[0, 0], [800, 0]], width: 26, ground }, { seed: 5, space: S });
  ok(D.pieces.length > 40 && D.pieces.every(p => T.KINDS[p.kind] && T.KINDS[p.kind].states.indexOf(p.state) >= 0 && fin(p.x) && fin(p.y)), D.pieces.length + ' pieces, each a kind in a state it has');
  ok(D.pieces.filter(p => p.kind === 'tr_lamp').length >= 20, 'lamp standards every 30 m');
  ok(D.pieces.every(p => T.KINDS[p.kind].where !== 'kerb' || Math.abs(p.z) > 13), 'the kerb pieces stand off the carriageway');
  ok(D.pieces.every(p => Math.hypot(p.x - 400, p.z) > 20 - 1e-6) && D.skipped > 0, 'nothing laid on the pad filed in KSPACE (' + D.skipped + ' slots skipped)');
  let apart = true; D.pieces.forEach((p, i) => D.pieces.forEach((q, j) => { if (i < j && Math.hypot(p.x - q.x, p.z - q.z) < Math.min(p.r, q.r)) apart = false; })); ok(apart, 'the pieces keep apart');
  ok(D.pieces.some(p => p.kind === 'tr_gantry' || p.kind === 'tr_footbridge') && D.pieces.some(p => p.kind === 'tr_rubble_pave'), 'something across the street and rubble on it');
  const D2 = T.dress({ id: 'ave', pts: [[0, 0], [800, 0]], width: 26, ground }, { seed: 5 }); ok(D2.pieces.length > D.pieces.length, 'negative: without the pad, more pieces');
  ok(JSON.stringify(T.dress({ id: 'ave', pts: [[0, 0], [800, 0]], width: 26, ground }, { seed: 5 }).pieces) === JSON.stringify(D2.pieces), 'the same seed lays the same street');
  const G = T.dressGrid({ ground }); ok(G.pieces.length === T.KIND_KEYS.reduce((a, k) => a + T.KINDS[k].states.length, 0), 'the grid has every kind in every state: ' + G.pieces.length);
  throws(() => T.pick(1, 'tr_zeppelin'), 'an unknown kind throws'); throws(() => T.pick(1, 'tr_bench', 'bent'), 'a state a kind has not throws');
  const pk = T.pick(77, 'tr_lamp'); ok(T.STATES.indexOf(pk.state) >= 0 && pk.variant < 2 && JSON.stringify(T.pick(77, 'tr_lamp')) === JSON.stringify(pk), 'pick is a hash of its seed');
  const sh = T.shares({ a: 0.5, b: 0.5 }); let na = 0; for (let i = 0; i < 1000; i++) if (sh(KRAND.unit(KRAND.hash(3, i))) === 'a') na++; ok(na > 420 && na < 580, 'shares pick by cumulative share'); }

console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
