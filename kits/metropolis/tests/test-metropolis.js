// node kits/metropolis/tests/test-metropolis.js: the records, the plans, the facades, the shell cages. Each check has a negative.
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { console, Math, module: {}, exports: {} }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = p => vm.runInContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), ctx, { filename: p });
load('core/rand/08-core-rand.js');
for (const d of ['kits/interiors/src', 'kits/ancients-interiors/src']) for (const f of fs.readdirSync(path.join(ROOT, d)).sort()) if (/^[1-4]\d.*\.js$/.test(f) && !/view|shell|building|outline|cutaway|figures/.test(f)) load(d + '/' + f);
for (const f of ['40-mp-records.js', '41-mp-plans.js', '42-mp-facade.js', '43-mp-shell.js', '44-mp-audit.js']) load('kits/metropolis/src/' + f);
const MP = vm.runInContext('MP', ctx), KS = vm.runInContext('KSHELL', ctx), AI = vm.runInContext('KratorAncientsInteriors', ctx);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
AI.install(vm.runInContext('KratorInteriors', ctx));
for (const F of MP.families()) {
  const A = MP.audit(F); A.fails.slice(0, 12).forEach(t => console.log('  ' + t)); if (A.fails.length > 12) console.log('  ... ' + A.fails.length + ' in all');
  ok(A.ok, F.id + ': the audit'); console.log(F.id, A.storeys, 'storeys', A.rooms, 'rooms', A.flats, 'flats');
  ok(F.levels[F.levels.length - 1].y + F.levels[F.levels.length - 1].h <= F.height.roof + 0.01, F.id + ': storeys fit the roof');
  ok(JSON.stringify(MP.storey(F, 6)) === JSON.stringify(MP.storey(F, 6)), F.id + ': a storey is a pure function');
  for (const s of ['intact', 'gutted']) { const R = KS.record(F, s); ok(R.tris >= 10 && R.tris <= 60, F.id + ': cage tris ' + R.tris); console.log(' shell', R.id, R.tris, 'tris map', R.map.w + 'x' + R.map.h, R.cage.rings ? JSON.stringify(R.cage.rings.map(r => r.map(v => +v.toFixed(1)))) : ''); }
  ok(F.ruins && MP.RUINS.every(k => F.ruins[k]), F.id + ': every ruin state is designed');
}
// the cage holds the envelope, at the flats of its octagon (negative: a too small one fails the same test)
const holds = (F, R, k) => { let y = 0, good = true; for (; y <= F.height.tip; y += 1) { let r = 0; const g = R.cage.rings; for (let j = 0; j + 1 < g.length; j++) if (y >= g[j][0] && y <= g[j + 1][0]) r = g[j][1] + (g[j + 1][1] - g[j][1]) * (y - g[j][0]) / (g[j + 1][0] - g[j][0]); if (r * k * Math.cos(Math.PI / F.shell.sides) < MP.envelope(F, y) - 0.01) good = false; } return good; };
const S = MP.FAMILY.spindle, RS = KS.record(S, 'intact'); ok(holds(S, RS, 1), 'the cage holds the Spindle'); ok(!holds(S, RS, 0.8), 'negative: a cage at 0.8 does not');
// negatives of the audit: a moved shaft, a flat with no bedroom
{ const F = JSON.parse(JSON.stringify(S)); F.core.shafts[0].x = 9; ok(!MP.audit(F).ok, 'negative: a shaft out of the core fails'); }
{ MP.WINDOWLESS.bedroom = 1; ok(!MP.audit(S).ok, 'negative: a bedroom with no window fails'); delete MP.WINDOWLESS.bedroom; }
// packing
{ const P = KS.pack([RS, KS.record(MP.FAMILY.ledger, 'intact')], 2048); ok(P.length === 2 && P.every(p => p.x + p.w <= 2048 && p.y + p.h <= 2048), 'pack'); let threw = false; try { KS.pack([RS], 256); } catch (e) { threw = true; } ok(threw, 'negative: too small an atlas throws'); }
console.log(bad ? bad + ' failed' : 'all passed'); process.exit(bad ? 1 : 0);
