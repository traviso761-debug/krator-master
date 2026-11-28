// node settlements/flashing-eye/test-flashing-eye.js: the Flashing Eye's head house, its layout (src/30-fe-layout.js) against
// its rules (src/31-fe-rules.js). Every rule passes on the layout, and each has a negative: a copy broken in that one way must
// fail that rule and the unbroken copy pass it. Also: the frame stands where the tune puts the house, the census is the tune's,
// and the ground is a cliff where the band is and the model's away from it.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
const L = require('./src/30-fe-layout.js');
const F = require('./src/31-fe-rules.js');
const clone = () => JSON.parse(JSON.stringify(L));
const part = (M, id) => M.parts.find(p => p.id === id);
const WAY = 'the Way of Shrines: a shrine on every stack, each step 30 m up, every bridge short and gentle enough, the last at the Gate of the Rift';
const STAIR = 'the Stair of the Eye: 9 to 16 km of switchbacks on the spur\'s crest, uncrossed, turning at the Rest House\'s gate at about 1,080 m, laid on the page\'s ground';
const rule = name => M =>F.RULES[name](Object.assign({}, M, { lipU: L.lipU, stairY: L.stairY })).length === 0;

/* ---- every rule on the layout */
F.checks(L).forEach(c => T.ok(c.name, c.pass, c.detail));

/* ---- each rule's negative: [rule, how to break it] */
const NEG = [
  ['every part, wall, gate and way has a unique id', M => { M.parts.push(Object.assign({}, part(M, 'hives'))); }],
  ['every part stands in its zone', M => { part(M, 'byres').box = [-120, -60, -60, -20]; }],
  ['every part stands in its zone', M => { part(M, 'g.mule').box = [-92, -82, -84, -76]; }],
  ['no two parts on one level overlap', M => { part(M, 'chapter').box = [-100, -60, 40, 56]; }],
  ['no building stands in a wall', M => { part(M, 'school').box = [-140, -104, 78, 91]; }],
  ['every gate is on its wall', M => { M.gates.find(g => g.id === 'gate.mule').at = [-87, -80]; }],
  ['every zone is reached from the Foot House, and the mules reach the bench without the Way of Shrines', M => { M.links = M.links.filter(k => k.way !== 'mule'); }],
  ['every zone is reached from the Foot House, and the mules reach the bench without the Way of Shrines', M => { M.links = M.links.filter(k => k.way !== 'breath'); }],
  ['the hosted monastery stands clear of the precinct wall by 4 m, its gate to the south', M => { part(M, 'monastery').host.front = 'north'; }],
  ['the hosted monastery stands clear of the precinct wall by 4 m, its gate to the south', M => { part(M, 'monastery').box = [-142, -90, -26, 26]; }],
  ['the Lip Range stands on the Lip, about 120 m long', M => { M.parts.filter(p => p.range === 'lip').forEach(p => { p.box[0] -= 8; p.box[1] -= 8; }); }],
  ['the Lip Range stands on the Lip, about 120 m long', M => { part(M, 'lip.labrang').box = [-14, 0, 30, 90]; }],
  ['nothing within 12 m of the Lip but the Lip Range and its gate', M => { part(M, 'pilgrims').box = [-50, -8, 34, 86]; }],
  ['the Hall of the Ember stands on the axis, north of the monastery, toward the crater', M => { part(M, 'ember').box = [-128, -108, 12, 28]; }],
  ['no building in the crater; the rim\'s buildings stand on its rim', M => { part(M, 'hut').box = [-1990, -1982, 10, 18]; }],
  ['no building in the crater; the rim\'s buildings stand on its rim', M => { M.crater.r = 340; }],
  ['the ways climb at 10 % or less, the Cleft Stair excepted', M => { const w = M.ways.find(x => x.id === 'mule'); w.pts = [w.pts[0], w.pts[w.pts.length - 1]]; }],
  ['each way joins what it serves', M => { M.ways.find(x => x.id === 'bridges').pts.pop(); }],
  ['the pilgrims\' way stops at the Threshold Chorten, outside the rim\'s fumes', M => { M.ways.find(x => x.id === 'breath').pts.push([-1905, 0, 160]); }],
  ['the balcony and the Eye Post see every station the Order must reach, by 10 m or more', M => { M.sights.balcony.list.find(s => s.id === 'erehwon').clear = -11; }],
  ['a station the Eye cannot see is reached through one it sees', M => { M.sights.balcony.list.find(s => s.id === 'g1').via = 'theodiga'; }],
  ['the line carries every message the Order sends: each hop clear by 10 m', M => { M.line.hops.find(h => h.a === 'rimpost').clear = -95; }],
  ['the line carries every message the Order sends: each hop clear by 10 m', M => { M.line.hops = M.line.hops.filter(h => h.b !== 'g1'); }],
  ['no oil burned on the mountain: every fire is lit from the Ember', M => { part(M, 'post').fire = 'oil'; }],
  ['no oil burned on the mountain: every fire is lit from the Ember', M => { M.parts.push({ n: 99, id: 'gen', name: 'a generator', kind: 'generator', zone: 'cap', box: [-700, -690, 300, 310], level: 0, storeys: 1, decor: 0, sheets: [] }); }],
  ['the roof water covers the year and the cisterns a season', M => { M.water.cisterns = [{ id: 'great', under: 'court', m3: 300 }]; }],
  ['the roof water covers the year and the cisterns a season', M => { M.water.rainM = 0.2; }],
  ['gold only on the Assembly Hall\'s crown and the Hall of the Ember\'s sanctum', M => { part(M, 'lip.labrang').gold = 'crown'; }],
  ['everyone has a bed: 280 on the bench and 40 at the Foot House', M => { delete part(M, 'school').sleeps; }],
  ['everyone has a bed: 280 on the bench and 40 at the Foot House', M => { M.census.novices = 70; part(M, 'novices').sleeps.novices = 70; }],
  ['every building on the bench stands on one terrace', M => { part(M, 'chapter').box = [-120, -80, 34, 44]; }],
  [WAY, M => { M.parts = M.parts.filter(p => p.id !== 'shrine.3'); }],
  [WAY, M => { M.bridgeway.stacks[4].u = 220; M.bridgeway.stacks[4].v = -260; part(M, 'shrine.5').box = [217, 223, -263, -257]; }],
  [WAY, M => { M.bridgeway.end.at = [-3, -60]; }],
  [WAY, M => { M.bridgeway.stacks[5].u = 20; part(M, 'shrine.6').box = [17, 23, -113, -107]; }],
  [STAIR, M => { part(M, 'resthouse').box = [2789, 2811, 118, 138]; }],
  [STAIR, M => { part(M, 'resthouse').box = [2789, 2811, 4, 24]; }],
  [STAIR, M => { const w = M.ways.find(x => x.id === 'stair'); w.pts = [w.pts[0], w.pts[w.pts.length - 1]]; }],
  [STAIR, M => { const w = M.ways.find(x => x.id === 'stair'); w.pts[6][1] = 420; }],
  [STAIR, M => { const w = M.ways.find(x => x.id === 'stair'); w.pts[6][2] += 12; }],
  [STAIR, M => { const w = M.ways.find(x => x.id === 'stair'), p = w.pts[6]; p[0] += 400; p[2] = L.stairY(p[0], p[1]); }],
  ['the band is the owner\'s 100-300 m high, about 1.5 km long, facing the Rift', M => { M.band.h = 400; }],
  ['the band is the owner\'s 100-300 m high, about 1.5 km long, facing the Rift', M => { M.band.lipK = 0.0006; }]];
NEG.forEach(([name, brk], i) => {
  const bad = clone(); brk(bad);
  T.neg(name + ' [negative ' + (i + 1) + ']', rule(name), bad, clone());
});

/* ---- the numbers the plan and the tune quote */
let tune = null;
try { tune = require('../../core/region/data/xan-tune.js'); } catch (e) { tune = null; }
const FE = tune && (tune.flashingeye || (tune.XAN_TUNE && tune.XAN_TUNE.flashingeye));
const benchPx = F.toPx(L, -200, 0);
T.ok('the frame stands on the spur: the bench\'s grid point 881,1527 is 200 m north of the Lip', Math.abs(benchPx[0] - 881) < 1e-9 && Math.abs(benchPx[1] - 1527) < 1e-9, benchPx.join(','));
T.ok('the house is where the tune has it (xan.flashingeye at 881,1527, 320 people)', !!FE && FE.px[0] === 881 && FE.px[1] === 1527 && FE.people === Object.values(L.census).reduce((a, b) => a + b, 0),
  FE ? FE.px.join(',') + ', ' + FE.people : 'xan-tune.js not read');
const sumc = Object.values(L.census).reduce((a, b) => a + b, 0);
T.ok('the census is the owner\'s 320', sumc === 320, sumc);
const C = F.toPx(L, L.crater.centre[0], L.crater.centre[1]);
T.ok('the crater is on the summit\'s cell, 881,1526', Math.abs(C[0] - 881) < 1e-9 && Math.abs(C[1] - 1526) < 1e-9, C.join(','));
const A = F.area(L);
T.ok('the bench\'s floor is between 17,000 and 31,000 m2 (280 people and 60 guests, 50-90 m2 a head: the towers are tall)', A.bench > 17000 && A.bench < 31000, A.bench);
const W = F.water(L);
T.ok('the roofs and courts give about 10,000 m3 a year against a need under 3,000 (section 2.5)', W.supply > 8000 && W.supply < 12000 && W.need < 3000, JSON.stringify(W));
T.ok('the hosted block is the kit\'s 52 m great monastery in the crimson dress', (b => b[1] - b[0] === 52 && b[3] - b[2] === 52)(part(L, 'monastery').box) && part(L, 'monastery').host.v === 0);

/* ---- the ground: a model surface like the spur (the cap at 84 m a km north of the Lip, the flank at 196 south; the crest falling
   90 m a km to either side) */
const model = (u, v) => (u < 0 ? -30 - 0.084 * u : -30 - 0.196 * u) - 0.09 * Math.abs(v);
const g = (u, v) => F.ground(L, u, v, model(u, v));
const face = g(-1, 0) - g(L.band.batter + L.band.talusRun, 0);
T.ok('the band stands about its height at its middle (the Lip to the talus\'s foot)', face > L.band.h * 0.9 && face < L.band.h * 1.15, face.toFixed(1));
T.ok('the bench is flat at each terrace\'s level behind the Lip', [-10, -60, -140].every(u => Math.abs(g(u, 0) - F.terraceY(L, u)) < 0.5), [-10, -60, -140].map(u => g(u, 0).toFixed(2)).join(', '));
const signSafe = [];
for (let u = -400; u <= 1400; u += 20) for (let v = -900; v <= 900; v += 50) {
  const m = model(u, v), y = g(u, v), lu = F.lipU(L, v), dc = Math.hypot(u - L.crater.centre[0], v);
  const precinct = (u > -180 && Math.abs(v) < 130 && u < lu) || F.spurY(L, u, v, m) > m - 1e-6;   /* the precinct is cut and filled; the spur raises */
  if (dc > L.crater.r + 200 && !precinct && ((u < lu - 1 && y < m - 1e-6) || (u > lu + 2 && y > m + 1e-6))) signSafe.push(u + ',' + v);
}
T.ok('the ground is sign-safe outside the precinct: behind the Lip it only rises, in front only falls', signSafe.length === 0, signSafe.slice(0, 5).join(' '));
/* the cap as the region cut has it at 1:1: rising 0.2 m a m behind the Lip and 0.08 to the west, above the bench by its north wall */
const steep = (u, v) => -16 - 0.2 * Math.min(u, 0) - 0.196 * Math.max(u, 0) - 0.08 * v;
const level = S => { const bad = []; for (const u of [-140, -130, -120, -110, -100, -80, -60, -50, -40, -30, -20, -10]) for (let v = -85; v <= 85; v += 17) { const y = S(u, v); if (Math.abs(y - F.terraceY(L, u)) > 0.5) bad.push(u + ',' + v + ':' + y.toFixed(1)); } return bad; };
T.ok('the precinct is level at the bench\'s height where the cap rises above it (cut and filled)', level((u, v) => F.ground(L, u, v, steep(u, v))).length === 0, level((u, v) => F.ground(L, u, v, steep(u, v))).slice(0, 4).join(' '));
T.neg('a bench only filled, never cut, is caught', S => level(S).length === 0, (u, v) => Math.max(F.ground(L, u, v, steep(u, v)), steep(u, v)), (u, v) => F.ground(L, u, v, steep(u, v)));
T.ok('the ground meets the model away from the band and the bench', [[-500, 0], [1400, 0], [300, 900], [-200, 600]].every(([u, v]) => Math.abs(g(u, v) - model(u, v)) < 0.5),
  [[-500, 0], [1400, 0], [300, 900], [-200, 600]].map(([u, v]) => (g(u, v) - model(u, v)).toFixed(2)).join(', '));
/* the band's cut fades back into the model past the apron (band.merge), so the spur's sides under the Stair are the model's, not a
   trench 200 m deep down to the Foot House */
const SIDES = [[1400, 300], [3000, -400], [6000, 500], [2800, 200]];
const sides = M => SIDES.every(([u, v]) => Math.abs(F.ground(M, u, v, model(u, v)) - model(u, v)) < 0.5);
T.ok('the band\'s cut fades into the model down the spur (its sides at 1.4 to 6 km)', sides(L), SIDES.map(([u, v]) => (g(u, v) - model(u, v)).toFixed(1)).join(', '));
T.neg('a band cut that never fades (no merge) is caught', sides, (() => { const M = clone(); delete M.band.merge; return M; })(), clone());
/* the crest under the Stair: smoothed to the layout's surface between the apron and the Foot House, the ground beyond untouched */
const smooth = M => { const s = (u, v, y) => F.stairGround(Object.assign({}, M, { stairY: L.stairY }), u, v, y);
  return [[3000, 100], [1500, -180], [5200, 0]].every(([u, v]) => Math.abs(s(u, v, -5000) - L.stairY(u, v)) < 1e-6) && [[3000, 400], [300, 0], [6800, 0]].every(([u, v]) => s(u, v, -5000) === -5000); };
T.ok('the crest under the Stair is smoothed to the layout\'s surface, the ground beyond it untouched', smooth(L));
T.neg('a Stair laid on a crest the page does not smooth is caught', smooth, (() => { const M = clone(); delete M.stair.smooth; return M; })(), clone());
const fl = F.ground(L, L.crater.centre[0], 0, model(L.crater.centre[0], 0)), rim = F.ground(L, L.crater.centre[0] + L.crater.r, 0, model(L.crater.centre[0] + L.crater.r, 0));
T.ok('the crater is a bowl about its depth below its rampart', rim - fl > L.crater.depth * 0.8, (rim - fl).toFixed(1));
/* ---- the spur (the owner, 2026-11-23: the stacks "a natural extension of the terrain and cliff face"): its crest carries every landing,
   every bridge clears it, it joins the cliff under the Gate of the Rift and it fades into the apron at its nose */
const BW = L.bridgeway, crestOk = G => BW.stacks.every(S => Math.abs(G(S.u, S.v) - (S.landing - BW.spur.crestBelow)) < 1.5);
T.ok('the spur\'s crest carries each stack\'s landing (within 1.5 m)', crestOk(g), BW.stacks.map(S => (g(S.u, S.v) - S.landing).toFixed(1)).join(', '));
T.neg('a spur that misses the landings is caught', crestOk, (u, v) => model(u, v), g);
const clear = G => F.bridges(L).every(b => { for (let k = 1; k < 20; k++) { const t = k / 20, along = t * b.span; if (along < 15 || b.span - along < 15) continue;
  const u = b.a[0] + (b.b[0] - b.a[0]) * t, v = b.a[1] + (b.b[1] - b.a[1]) * t, deck = b.a[2] + (b.b[2] - b.a[2]) * t - BW.sagK * b.span * 4 * t * (1 - t);
  if (deck - G(u, v) < 3) return false; } return true; });
T.ok('every bridge clears the spur by 3 m between its ends', clear(g));
T.neg('a spur whose crest stands under the decks is caught', clear, (u, v) => Math.max(g(u, v), F.spurY(L, u, v, model(u, v)) + 30), g);
const joins = g(10, -84) - g(10, -260);
T.ok('the spur joins the cliff under the Gate of the Rift (the ground there stands well above the band\'s foot beside it)', joins > 120, joins.toFixed(0) + ' m');
const fades = [[440, -185], [200, -440]].every(([u, v]) => !(F.spurY(L, u, v, g(u, v)) > g(u, v)));
T.ok('the spur fades into the apron past its nose and its flanks (it raises nothing there)', fades);
T.done();
