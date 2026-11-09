// node kits/metropolis/tests/test-metropolis.js: the records, the plans, the facades, the shell cages. Each check has a negative.
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { console, Math, module: {}, exports: {} }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = p => vm.runInContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), ctx, { filename: p });
load('core/rand/08-core-rand.js');
for (const d of ['kits/interiors/src', 'kits/ancients-interiors/src']) for (const f of fs.readdirSync(path.join(ROOT, d)).sort()) if (/^[1-4]\d.*\.js$/.test(f) && !/view|shell|building|outline|cutaway|figures/.test(f)) load(d + '/' + f);
for (const f of ['40-mp-records.js', '41-mp-plans.js', '42-mp-facade.js', '43-mp-shell.js', '44-mp-audit.js', '46-mp-designs.js', '46b-mp-ancients.js', '46c-mp-planned.js', '46d-mp-gridplan.js']) load('kits/metropolis/src/' + f);
const MP = vm.runInContext('MP', ctx), KS = vm.runInContext('KSHELL', ctx), AI = vm.runInContext('KratorAncientsInteriors', ctx);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
AI.install(vm.runInContext('KratorInteriors', ctx));
for (const F of MP.families()) {
  const A = MP.audit(F); A.fails.slice(0, 12).forEach(t => console.log('  ' + t)); if (A.fails.length > 12) console.log('  ... ' + A.fails.length + ' in all');
  ok(A.ok, F.id + ': the audit'); console.log(F.id, A.storeys, 'storeys', A.rooms, 'rooms', A.flats, 'flats');
  ok(F.levels[F.levels.length - 1].y + F.levels[F.levels.length - 1].h <= F.height.roof + 0.01, F.id + ': storeys fit the roof');
  ok(JSON.stringify(MP.storey(F, 6)) === JSON.stringify(MP.storey(F, 6)), F.id + ': a storey is a pure function');
  for (const s of MP.RUINS) { const R = KS.record(F, s); ok(R.tris >= 10 && R.tris <= 60, F.id + ': cage tris ' + R.tris); console.log(' shell', R.id, R.tris, 'tris map', R.map.w + 'x' + R.map.h, R.cage.rings ? JSON.stringify(R.cage.rings.map(r => r.map(v => +v.toFixed(1)))) : ''); }
  ok(F.ruins && MP.RUINS.every(k => F.ruins[k]), F.id + ': every ruin state is designed');
}
// the cage holds the envelope, at the flats of its octagon (negative: a too small one fails the same test)
const holds = (F, R, k) => { let y = 0, good = true; for (; y <= F.height.tip; y += 1) { let r = 0; const g = R.cage.rings; for (let j = 0; j + 1 < g.length; j++) if (y >= g[j][0] && y <= g[j + 1][0]) r = g[j][1] + (g[j + 1][1] - g[j][1]) * (y - g[j][0]) / (g[j + 1][0] - g[j][0]); if (r * k * Math.cos(Math.PI / F.shell.sides) < MP.envelope(F, y) - 0.01) good = false; } return good; };
const S = MP.FAMILY.spindle, RS = KS.record(S, 'intact'); ok(holds(S, RS, 1), 'the cage holds the Spindle'); ok(!holds(S, RS, 0.8), 'negative: a cage at 0.8 does not');
// negatives of the audit: a moved shaft, a flat with no bedroom
{ const F = JSON.parse(JSON.stringify(S)); F.core.shafts[0].x = 9; ok(!MP.audit(F).ok, 'negative: a shaft out of the core fails'); }
{ MP.WINDOWLESS.bedroom = 1; ok(!MP.audit(S).ok, 'negative: a bedroom with no window fails'); delete MP.WINDOWLESS.bedroom; }
{ const st = MP.storey(S, 8); ok(st.doorFit.length === 36, 'each outer room of a flat has a door fit'); const f = st.doorFit[0]; ok(st.doorFit.every(q => q.arc >= q.w + 0.16), 'the doors fit their walls'); }
// packing
{ const P = KS.pack([].concat(KS.slots(RS), KS.slots(KS.record(MP.FAMILY.ledger, 'intact'))), 2048); ok(P.length === 6 && P.every(p => p.x + p.w <= 2048 && p.y + p.h <= 2048), 'pack'); let threw = false; try { KS.pack([RS], 256); } catch (e) { threw = true; } ok(threw, 'negative: too small an atlas throws'); }
// the ruins: what stands is under the intact, the tear stays between the cut and its depth, every ruin past gutted has rubble, and the fourteen shells pack one atlas
for (const F of MP.families()) for (const s of MP.RUINS) {
  const R = MP.ruin(F, s), P = MP.debrisPlan(F, s);
  ok(R.top <= F.height.tip + 0.01 && R.skin <= R.top, F.id + '.' + s + ': what stands is under the intact');
  if (R.torn && !R.span) { let lo = 1e9, hi = -1e9; for (let u = 0; u < 400; u += 1.7) { const c = MP.tearAt(F, R, u); lo = Math.min(lo, c); hi = Math.max(hi, c); } ok(lo >= R.cut - R.torn - 1e-6 && hi <= R.cut + 1e-6 && hi - lo > R.torn * 0.3, F.id + '.' + s + ': the tear runs ' + (hi - lo).toFixed(1) + ' m'); }
  ok(MP.RUINS.indexOf(s) > 1 ? P && P.mounds.length > 0 : P === null, F.id + '.' + s + ': rubble as the state says');
}
{ const all = []; for (const F of MP.families()) for (const s of MP.RUINS) all.push(...KS.slots(KS.record(F, s)));
  let fits = true; try { KS.pack(all, 2048); } catch (e) { fits = false; } ok(fits, 'the fourteen shells pack a 2048 atlas');
  let tight = true; try { KS.pack(all, 1536); } catch (e) { tight = false; } ok(!tight, 'negative: not a 1536 one'); }
{ const R = MP.ruin(MP.LEDGER, 'broken'); ok(MP.tearAt(MP.LEDGER, R, 0) < MP.LEDGER.levels[1].y && MP.tearAt(MP.LEDGER, R, 50) > MP.LEDGER.levels[1].y + 10, 'the Ledger breaks in its span only'); }
// the fourteen designs: one record a key, none clashing with a planned family, sane numbers (with a negative)
const designOk = D => D && D.footprint && D.height.tip >= D.height.roof && D.height.roof > D.sh && D.sh >= 3 && D.sh <= 7 && D.tris > 0 && D.tris <= 110000;
ok(MP.DESIGN_KEYS.length === 14 && MP.DESIGN_KEYS.every(k => MP.DESIGNS[k] && MP.DESIGNS[k].id === k && (!MP.FAMILY[k] || MP.FAMILY[k].design)), 'fourteen designs, keyed, none a shelled family');
ok(MP.DESIGN_KEYS.every(k => designOk(MP.DESIGNS[k])), "the designs' numbers are sane");
ok(!designOk(Object.assign({}, MP.DESIGNS.wedge, { height: { roof: 188, tip: 100 } })), 'negative: a tip under the roof fails');
// the Ancients kit's buildings: one record a key, a builder each, none clashing with a design or a family, sane numbers (with a negative)
const ancOk = A => A && /^build[A-Z]/.test(A.fn) && A.footprint.w > 0 && A.footprint.d > 0 && A.height.tip >= A.height.roof && A.sh >= 3 && (A.scale == null || (A.scale >= 1 && A.scale <= 2)) && A.tris > 0;
ok(MP.ANCIENT_KEYS.length === 25 && MP.ANCIENT_KEYS.every(k => MP.ANCIENTS[k] && MP.ANCIENTS[k].id === k && !MP.FAMILY[k] && !MP.DESIGNS[k]), 'twenty-five Ancients (thirteen, the kit\'s industry and four of this kit\'s), keyed, none a design or a family');
ok(MP.ANCIENT_KEYS.every(k => ancOk(MP.ANCIENTS[k])), "the Ancients' records are sane");
ok(!ancOk(Object.assign({}, MP.ANCIENTS.houses, { scale: 0.5 })), 'negative: a scale under 1 fails');
const ENTRY = ['arch', 'auto', 'arch+auto', 'core', 'open'];
ok(MP.ANCIENT_KEYS.every(k => MP.ANCIENTS[k].entry == null || ENTRY.indexOf(MP.ANCIENTS[k].entry) >= 0), 'every Ancient is entered by a known rule');
ok(ENTRY.indexOf('door') < 0, 'negative: an unknown rule is not one');
/* the Spindle's flats: every bath 1.2 m wide or more at its narrow end and 1.4 at its middle (a bath, a basin and a toilet fit), every flat's doors fit (the owner, 2026-11-03) */
{ let narrow = 0, n = 0; const S = MP.FAMILY.spindle; S.levels.filter(L => /^flats/.test(L.use)).forEach(L => { const st = MP.storey(S, L.k); st.rooms.filter(r => r.mpKind === 'bath').forEach(B => { n++; const rs = B.poly.map(p => Math.hypot(p[0], p[1])), a = Math.abs(B.th1 - B.th0), w0 = a * Math.min(...rs), wm = a * (Math.min(...rs) + Math.max(...rs)) / 2; if (w0 < 1.2 || wm < 1.4) narrow++; }); ok((st.doorFit || []).every(q => q.arc >= q.w + 0.16), 'spindle L' + L.k + ": the flats' doors fit"); });
  ok(n > 0 && narrow === 0, 'every flat bath 1.2 m wide or more at its narrow end, 1.4 at its middle (' + n + ')'); }
/* the designs with plans (46c): every storey planned and audited, and the shelled families unchanged by them */
for (const k of MP.PLANNED_KEYS) { const F = MP.FAMILY[k], A = MP.audit(F); ok(F.design && A.ok, k + ': the plans pass the audit (' + A.rooms + ' rooms, ' + (A.ok ? 0 : A.fails.length) + ' fails)'); }
/* the designs of parts (batch 4): the Pods' bridge joins a gate in each pod; the Organ's pipes drop out where they end */
{ const P = MP.FAMILY.pods, k = P.levels.filter(L => L.use === 'skylobby')[0].k, st = MP.storey(P, k), B = st.rooms.filter(r => /\.bridge$/.test(r.id))[0];
  ok(B && B.doors.length === 2 && B.doors.every(d => st.rooms.some(r => r.id === d.to && r.gate)), 'the Pods: the bridge joins a gate in each pod');
  const O = MP.FAMILY.organ; ok(MP.storey(O, 1).parts.length === 5 && MP.storey(O, O.levels.length - 1).parts.length === 1, 'the Organ: five pipes low, the tallest alone at the top'); }
/* the grid plans (46d), on plates drawn as cells: a wide one (two rings of rooms), an L, a narrow bar (a 4 m core: the stair alone), a plate in two
   parts with 10 m between (a bridge), a ring round a court cut by the core; every one audited. The buildings' own run under verify.py (hostChecks) */
{ const S = { rect: [64, 44, (i, j) => i >= 2 && i < 62 && j >= 2 && j < 42, { x0: 28, z0: 16, n: 6 }], ell: [70, 70, (i, j) => (i >= 2 && i < 68 && j >= 2 && j < 22) || (i >= 2 && i < 22 && j >= 2 && j < 68), { x0: 8, z0: 8, n: 6 }],
    bar: [80, 20, (i, j) => i >= 2 && i < 78 && j >= 3 && j < 17, { x0: 37, z0: 4, n: 4 }], twin: [70, 30, (i, j) => j >= 2 && j < 28 && ((i >= 2 && i < 30) || (i >= 40 && i < 68)), { x0: 12, z0: 10, n: 6 }],
    ring: [60, 60, (i, j) => i >= 2 && i < 58 && j >= 2 && j < 58 && !(i >= 22 && i < 38 && j >= 22 && j < 38), { x0: 8, z0: 26, n: 6 }],
    disc: [64, 64, (i, j) => Math.hypot(i + 0.5 - 32, j + 0.5 - 32) < 28, { x0: 29, z0: 29, n: 6 }] };
  for (const name in S) { const [W, D, f, core] = S[name], g = new Uint8Array(W * D); for (let j = 0; j < D; j++) for (let i = 0; i < W; i++) g[j * W + i] = f(i, j) ? 1 : 0;
    const id = 'gridtest_' + name; MP.ANCIENT_USES[id] = [['offices', 9]];
    const F = MP.ancientFamily({ id, name, kind: 'midrise', sh: 4, footprint: { w: W, d: D }, height: { roof: 12, tip: 12 }, tris: 1 }, { x0: 0, z0: 0, cell: 1, W, D, ground: g, levels: [{ y: 4, g }, { y: 8, g }], core }, [{ x: W / 2, z: 2, y: 0, yaw: Math.PI }]);
    const A = MP.audit(F), st = MP.storey(F, 1);
    ok(A.ok && st.rooms.some(r => r.kind === 'core') && (name !== 'twin' || st.rooms.some(r => /bridge/.test(r.id))), 'grid plan, ' + name + ': audited (' + A.rooms + ' rooms' + (A.ok ? '' : ', ' + A.fails[0]) + ')');
    /* a round floor is cut by angle (the owner: a curved floor cut by its corridor's seeds was a maze): its skin rooms are wedges of about 6 m at the band's middle, so few and even */
    if (name === 'disc') { const sk = st.rooms.filter(r => r.mpKind === 'office' || r.mpKind === 'meeting'), area = p => { let a = 0; for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; a += u[0] * v[1] - v[0] * u[1]; } return Math.abs(a / 2); }, as = sk.map(r => area(r.poly)).sort((a, b) => a - b);
      ok(sk.length >= 20 && sk.length <= 60 && as[Math.floor(as.length / 2)] >= 20, 'grid plan, disc: wedges (' + sk.length + ' rooms, median ' + (as[Math.floor(as.length / 2)] || 0).toFixed(0) + ' m2)'); }
    delete MP.FAMILY[id]; delete MP.ANCIENT_USES[id]; } }
ok(MP.families().every(F => !F.design) && MP.planned().length === MP.families().length + MP.PLANNED_KEYS.length, 'families() are the shelled ones, planned() adds the designs');
console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
