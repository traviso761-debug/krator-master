// node settlements/jimjam/tests/test-jj-economy-run.js — Multi-day regional economy & foreign trade test run
// across Jimjam (JJ1), Hinterlands (Tamarai-kuppam, Vellai-kal, JJ2 Barada-Quay, JJ3 Mekam/Uppu, JJ4 Skywatch),
// Dilihan Province (Dilihan D1/D2, Kotgeta & Visas Coal D3/D4), Serai (Soda-Lake lbl=54 caravanserai), Silkhead
// (Korona/Spider-Lake gateway), Shell/Port Goto (Imperial Highway), Free Clans of Ardent, Palewharf (Eternal State
// & Republic), and Whitelake (5,400 m White-Pass Khaayken Yeti & Yonni/Rian corridor).
// Verifies every corridor ships & lands real cargo, industrial chains consume imported inputs, Serai transships
// Jimjam grain <-> Silkhead spider-silk/magnets across lbl=54, Double Dark halts domestic barges/kilns, Khaayken <->
// Eternian trade is refused, and SIM.ledger closes with 0.00 residual across all 14 settlements & 10 routes!
const fs = require('fs');
const path = require('path');

global.window = global;

const ROOT = path.resolve(__dirname, '..', '..', '..');
function loadRel(rel) {
  const full = path.join(ROOT, ...rel.split('/'));
  (0, eval)(fs.readFileSync(full, 'utf8'));
}

loadRel('core/rand/08-core-rand.js');
loadRel('core/drawn/10-core-drawn.js');
loadRel('core/space/20-core-space.js');
loadRel('core/tags/50-core-tags.js');
loadRel('core/tags/52-core-tags-vocab.js');
loadRel('core/sched/20-core-sched.js');
loadRel('core/clock/20-core-clock.js');
loadRel('core/charactermodels/src/10-rig.js');
global.JJ_PEOPLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/charactermodels/data/peoples.json'), 'utf8'));

['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js',
 '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js',
 '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js'].forEach(f => loadRel('core/city/' + f));
['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
 '20-hamlet-cultures.js', '21-hamlet-iziz.js', '30-hamlet-village.js'].forEach(f => loadRel('core/hamlet/' + f));
['10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js'].forEach(f => loadRel('core/camp/' + f));

['77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
 '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
 '77-sim-6-govern.js', '77-sim-6-items.js', '77-sim-6-money.js', '77-sim-6-needs.js',
 '77-sim-6-season.js', '77-sim-6-trade.js', '77-sim-6-unrest.js', '77-sim-7-stocks.js',
 '77-sim-7-ledger.js', '77-sim-7-lod.js', '77-sim-6d-decrees.js', '77-sim-6p-pilgrims.js',
 '77-sim-8-export.js'].forEach(f => loadRel('core/simulation/' + f));

loadRel('settlements/jimjam/targets/city/28-jj-model.js');
loadRel('settlements/jimjam/targets/city/30-jj-ground.js');
loadRel('settlements/jimjam/targets/city/32-jj-layout.js');
loadRel('settlements/jimjam/targets/city/34-jj-rules.js');
loadRel('settlements/jimjam/targets/city/78-jj-sim.js');

let bad = 0;
function ok(name, pass, neg, detail) {
  const good = !!(pass && !neg);
  if (!good) bad++;
  console.log((good ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (neg ? ' [negative passed!]' : ''));
}

/* Start at Day 88, 06:00 so our 10-day run crosses Day 89..92 (the 91-day Kauntu Double-Dark Flood + Day 91 Double Dark!)
   and continues through Day 98 steady-state recovery! */
const START_DAY = 88;
const START_HOUR = 6;
const RUN_DAYS = 10;

const clock = { day: START_DAY, hour: START_HOUR, t: START_DAY * 86400 + START_HOUR * 3600 };
const state = JJ_SIM.init(JJ_LAYOUT.plan, (x, z) => JJ_GROUND.h(x, z), { clock: clock });
state.syncClock(START_DAY, START_HOUR, clock.t);
SIM.jump();

const snap0 = SIM.ledgerSnap();
const t0Ms = Date.now();

/* Step minute-by-minute across 10 full simulated days (14,400 minutes) */
const totalMinutes = RUN_DAYS * 1440;
let startMin = START_DAY * 1440 + START_HOUR * 60;
let peakPilgrims = 0;
let peakMarketLots = 0;
let ddKilnOpenChecks = 0;

for (let m = 1; m <= totalMinutes; m++) {
  const curMin = startMin + m;
  const d = Math.floor(curMin / 1440);
  const hr = (curMin % 1440) / 60;
  state.syncClock(d, hr, curMin * 60);
  SIM.step();

  if (m % 60 === 0) {
    /* Sample pilgrim flood & Pilgrim Market activity */
    if (SIM.PILGRIMS) {
      const pRep = SIM.pilgrimReport ? SIM.pilgrimReport('jj.flood') : null;
      if (pRep && pRep.activePilgrims > peakPilgrims) peakPilgrims = pRep.activePilgrims;
      const mkt = SIM.PILGRIMS.markets && SIM.PILGRIMS.markets['jj.great_market'];
      if (mkt && mkt.lots) {
        const nLots = Object.keys(mkt.lots).length;
        if (nLots > peakMarketLots) peakMarketLots = nLots;
      }
    }
    const seas = SIM.season(curMin);
    if (seas && seas.windows && seas.windows['double-dark'] && hr >= 8 && hr <= 16) {
      if (SIM.isOpen(SIM.R.place['jj_day_kilns'], 'WORK', hr)) ddKilnOpenChecks++;
    }
  }
}

const elapsedMs = Date.now() - t0Ms;
const snap1 = SIM.ledgerSnap();
const audit = SIM.ledger(snap0, snap1);
const trRep = SIM.tradeReport();

function sumGoods(obj) {
  let n = 0;
  if (!obj) return 0;
  Object.keys(obj).forEach(k => { n += obj[k] || 0; });
  return n;
}

function legSummary(routeRep, which) {
  const map = (routeRep && routeRep[which]) || {};
  const parts = [];
  let total = 0;
  Object.keys(map).sort().forEach(leg => {
    const gMap = map[leg];
    const items = Object.keys(gMap).sort().map(g => g + ':' + gMap[g]);
    const sub = sumGoods(gMap);
    total += sub;
    if (sub > 0) parts.push(leg + '[' + items.join(',') + ']');
  });
  return { total: total, text: parts.join(' | ') };
}

console.log('\n================================================================================');
console.log('JIMJAM 10-DAY REGIONAL ECONOMY, HINTERLANDS & FOREIGN TRADE RUN (' + elapsedMs + ' ms)');
console.log('Span: Day ' + START_DAY + ' -> Day ' + (START_DAY + RUN_DAYS) + ' (crosses Day 91 Double-Dark & Flood!)');
console.log('================================================================================');

let activeRoutes = 0;
const routeTotals = {};
Object.keys(trRep).forEach(rid => {
  const r = trRep[rid];
  const sh = legSummary(r, 'shipped');
  const la = legSummary(r, 'landed');
  const ti = legSummary(r, 'tithed');
  routeTotals[rid] = { voyages: r.voyages, shipped: sh.total, landed: la.total, tithed: ti.total, waited: (SIM.TRADE.routes[rid].waited || 0) };
  if (la.total > 0 || ti.total > 0) activeRoutes++;
  console.log('  ROUTE ' + rid.padEnd(36) + ' voyages=' + String(r.voyages).padStart(3) +
    '  shipped=' + String(sh.total).padStart(5) + '  landed=' + String(la.total).padStart(5) +
    (ti.total ? '  tithed=' + ti.total : '') +
    (routeTotals[rid].waited ? '  ddWaited=' + routeTotals[rid].waited : ''));
  if (la.text) console.log('        landed: ' + la.text);
});

console.log('\n--- Jimjam Capital (JJ1) 10-Day Ledger Statement (Selected Key Goods) ---');
const jjStmt = audit.towns.jimjam || {};
['rice', 'alabaster', 'clay_gypsum', 'silica', 'alkali_salt', 'glass', 'fine_ceramics', 'paper_cloth',
 'almanacs', 'marble', 'coal', 'potash', 'bronze', 'instruments', 'timber', 'tea', 'saltpeter',
 'spider_silk', 'magnets', 'qiviut', 'goldroot', 'ancient_salvage', 'machine_parts', 'mounts_wool', 'scotch', 'tartan', 'spices'].forEach(g => {
  const s = jjStmt[g];
  if (!s) return;
  console.log('  ' + g.padEnd(16) +
    ' open=' + String(Math.round(s.opening)).padStart(5) +
    ' +made=' + String(Math.round(s.made)).padStart(5) +
    ' +imp=' + String(Math.round(s.imported)).padStart(5) +
    ' -cons=' + String(Math.round(s.consumed)).padStart(5) +
    ' -exp=' + String(Math.round(s.exported)).padStart(5) +
    ' => close=' + String(Math.round(s.closing)).padStart(5) +
    ' (res=' + s.residual.toFixed(2) + ')');
});
console.log('================================================================================\n');

/* Assertions + Negative Controls */

/* 1. Zero accounting residual across all 15 settlements, 31 goods, 10 routes & currencies */
ok(
  'SIM.ledger closes with 0.00 residual across all 15 settlements, 10 corridors & currencies over 10 days',
  audit.ok && audit.problems.length === 0 && Object.keys(audit.towns).length === 15,
  !audit.ok,
  'settlements=' + Object.keys(audit.towns).length + ', problems=' + audit.problems.length + (audit.problems.length ? ': ' + audit.problems.slice(0, 3).join('; ') : '')
);

/* 2. All 10 hinterland, provincial & foreign corridors actively ship & land cargo */
ok(
  'all 10 hinterland, Dilihan, Serai, Silkhead, Shell, Ardent, Palewharf & White-Pass corridors land cargo',
  activeRoutes === 10,
  activeRoutes < 10,
  'activeRoutes=' + activeRoutes + '/10'
);

/* 3. Hinterlands & Crown Tithe: Tamarai-kuppam remits Crown rice/clay/brick tithe, Vellai-kal ships #1 alabaster, JJ2 Barada-Quay ships silica */
const tkTithed = routeTotals.r01_jj1_tamarai_canal.tithed;
const vkAlab = ((trRep.r02_jj1_vellai_barge.landed['vellai_kal>jimjam'] || {}).alabaster) || 0;
const jj2Silica = ((trRep.r03_jj2_barada_granary_barge.landed['jj2_barada_periya>jimjam'] || {}).silica) || 0;
ok(
  'JJ1-JJ2 hinterlands deliver Tamarai Crown tithes, Vellai-kal alabaster & Barada-Quay glass-silica',
  tkTithed > 0 && vkAlab > 0 && jj2Silica > 0,
  tkTithed === 0 || vkAlab === 0 || jj2Silica === 0,
  'tamaraiTithed=' + tkTithed + ', vellaiAlabaster=' + vkAlab + ', baradaSilica=' + jj2Silica
);

/* 4. Jimjam industrial input-output chains manufacture glass (from silica + alkali_salt), fine_ceramics, almanacs & brass instruments */
const madeGlass = (jjStmt.glass && jjStmt.glass.made) || 0;
const madeCeram = (jjStmt.fine_ceramics && jjStmt.fine_ceramics.made) || 0;
const madeAlm   = (jjStmt.almanacs && jjStmt.almanacs.made) || 0;
const madeInst  = (jjStmt.instruments && jjStmt.instruments.made) || 0;
ok(
  'Jimjam workshops manufacture glass, fine_ceramics, almanacs & brass instruments from imported inputs',
  madeGlass > 0 && madeCeram > 0 && madeAlm > 0 && madeInst > 0,
  madeGlass === 0 || madeAlm === 0,
  'made: glass=' + madeGlass + ', ceramics=' + madeCeram + ', almanacs=' + madeAlm + ', instruments=' + madeInst
);

/* 5. Dilihan Province Cut Trunk: Dilihan & Kotgeta/Visas ship white marble, potash, Visas smithing coal, rag-paper & spices north */
const dlToKv = trRep.r05_cut_dilihan_trunk.landed['dilihan>kotgeta_visas'] || {};
const kvToJj = trRep.r05_cut_dilihan_trunk.landed['kotgeta_visas>jimjam'] || {};
const jjToKv = trRep.r05_cut_dilihan_trunk.landed['jimjam>kotgeta_visas'] || {};
const cutNorthTotal = sumGoods(dlToKv) + sumGoods(kvToJj);
const cutSouthTotal = sumGoods(jjToKv);
ok(
  'Dilihan Province & Visas Coalfield ship marble, coal, potash & spices up The Cut in exchange for Jimjam manufactures',
  cutNorthTotal > 0 && cutSouthTotal > 0 && ((jjStmt.marble && jjStmt.marble.imported > 0) || (jjStmt.coal && jjStmt.coal.imported > 0)),
  cutNorthTotal === 0 || cutSouthTotal === 0,
  'cutNorth=' + cutNorthTotal + ' (coalImp=' + ((jjStmt.coal && jjStmt.coal.imported) || 0) + ', marbleImp=' + ((jjStmt.marble && jjStmt.marble.imported) || 0) + '), cutSouth=' + cutSouthTotal
);

/* 6. Serai <-> Silkhead Soda-Lake (lbl=54) Barge Transshipment: Jimjam grain lifeline reaches Silkhead via Serai; Spider-Silk & Magnets reach Jimjam! */
const jjToSeraiRice = ((trRep.r06_ardent_jimjam_serai_triangle.landed['jimjam>serai'] || {}).rice) || 0;
const seraiToSilkRice = ((trRep.r07_serai_silkhead_sodalake_barge.landed['serai>silkhead'] || {}).rice) || 0;
const silkToSeraiSilk = ((trRep.r07_serai_silkhead_sodalake_barge.landed['silkhead>serai'] || {}).spider_silk) || 0;
const seraiToJjSilk = ((trRep.r06_ardent_jimjam_serai_triangle.landed['serai>jimjam'] || {}).spider_silk) || 0;
const seraiToJjAlkali = ((trRep.r06_ardent_jimjam_serai_triangle.landed['serai>jimjam'] || {}).alkali_salt) || 0;
ok(
  'Serai Soda-Lake entrepot transships Jimjam rice to Silkhead across lbl=54 and forwards Spider-Silk, Magnets & Alkali back to Jimjam',
  jjToSeraiRice > 0 && seraiToSilkRice > 0 && silkToSeraiSilk > 0 && seraiToJjSilk > 0 && seraiToJjAlkali > 0,
  seraiToSilkRice === 0 || seraiToJjSilk === 0,
  'jj->serai rice=' + jjToSeraiRice + ' -> silkhead rice=' + seraiToSilkRice + '; silkhead->serai silk=' + silkToSeraiSilk + ' -> jj silk=' + seraiToJjSilk + ', alkali=' + seraiToJjAlkali
);

/* 7. Foreign Rim & West-Lake Corridors: Ardent bronze/mounts, Shell/Goto salvage/spices, Palewharf machine_parts/marble, White-Pass qiviut/goldroot */
const pwLanded = sumGoods(trRep.r09_lbl77_palewharf_eternian_barge.landed['palewharf>jimjam']);
const wpLanded = sumGoods(trRep.r10_whitepass_yeti_trans_rim.landed['whitelake_pass>jimjam']);
const shellHwy = routeTotals.r08_shell_silkhead_imperial_hwy.landed;
ok(
  'Foreign corridors deliver Palewharf machine_parts/marble, White-Pass Khaayken qiviut/goldroot & Shell-Silkhead Imperial Highway trade',
  pwLanded > 0 && wpLanded > 0 && shellHwy > 0,
  pwLanded === 0 || wpLanded === 0 || shellHwy === 0,
  'palewharf->jj=' + pwLanded + ', whitepass->jj=' + wpLanded + ', shellImperialHwy=' + shellHwy
);

/* 8. Double-Dark observance holds domestic lbl=77 / Tamarai barges, shuts kilns, and opens pilgrim flood + Pilgrim Market */
const totalBargeWaited = routeTotals.r01_jj1_tamarai_canal.waited + routeTotals.r02_jj1_vellai_barge.waited +
                         routeTotals.r03_jj2_barada_granary_barge.waited + routeTotals.r09_lbl77_palewharf_eternian_barge.waited;
ok(
  'Day 91 Double Dark holds lake/canal barges, keeps kilns shut, and triggers Pilgrim Flood + Great Pilgrims Market',
  totalBargeWaited > 0 && ddKilnOpenChecks === 0 && peakPilgrims >= 12 && peakMarketLots >= 2,
  ddKilnOpenChecks > 0 || totalBargeWaited === 0,
  'bargeWaited=' + totalBargeWaited + ', ddKilnOpen=' + ddKilnOpenChecks + ', peakPilgrims=' + peakPilgrims + ', marketLots=' + peakMarketLots
);

/* 9. Negative Control: Direct Khaayken Yeti (Whitelake) <-> Eternian (Palewharf) trade is strictly refused */
const illegalDirectTrade = SIM.trades('whitelake_pass', 'palewharf');
ok(
  'Direct Khaayken Yeti <-> Eternian trade is blocked by diplomatic stance (requires separate Jimjam compounds)',
  !illegalDirectTrade && SIM.trades('whitelake_pass', 'jimjam') && SIM.trades('palewharf', 'jimjam'),
  illegalDirectTrade,
  'trades(whitelake,palewharf)=' + illegalDirectTrade
);

if (bad) {
  console.error(bad + ' check(s) FAILED');
  process.exit(1);
}
console.log('OK');
