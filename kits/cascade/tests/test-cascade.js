#!/usr/bin/env node
/* kits/cascade/tests/test-cascade.js: node tests for all [G data] fragments (40..44), room/recipe audits on the
   real catalog (republican & ancient), settlement SIM slot hand-over, edits overlay, and site/crops generation. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.join(__dirname, '..');
const ROOT = path.join(HERE, '..', '..');

// 1. Load [G data] fragments in a clean VM with NO THREE and NO DOM first, proving Godot portability
{
  const ctx = vm.createContext({ Math, Object, Array, String, Number, JSON, Set, Map, Float64Array, Uint32Array });
  ctx.globalThis = ctx;
  const ixCore = fs.readdirSync(path.join(ROOT, 'kits', 'interiors', 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort()
    .map(f => path.join(ROOT, 'kits', 'interiors', 'src', f));
  const aiCore = fs.readdirSync(path.join(ROOT, 'kits', 'ancients-interiors', 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort()
    .map(f => path.join(ROOT, 'kits', 'ancients-interiors', 'src', f));
  const pureFiles = [
    path.join(ROOT, 'core', 'rand', '08-core-rand.js'),
    path.join(ROOT, 'kits', 'crops', 'src', '10-crop-core.js'),
    path.join(ROOT, 'kits', 'crops', 'src', '20-crop-records.js'),
    path.join(ROOT, 'kits', 'crops', 'src', '22-crop-material.js'),
    path.join(ROOT, 'kits', 'crops', 'src', '40-crop-query.js'),
    ...ixCore,
    ...aiCore,
    path.join(HERE, 'src', '40-av-records.js'),
    path.join(HERE, 'src', '41-av-plans.js'),
    path.join(HERE, 'src', '42-av-facade.js'),
    path.join(HERE, 'src', '43-av-audit.js'),
    path.join(HERE, 'src', '44-av-site.js')
  ];
  for (const f of pureFiles) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  ctx.KratorAncientsInteriors.install(ctx.KratorInteriors);

  const pRef1 = ctx.AV.plan({ state: 'refurbished', seed: 19690 });
  const pRef2 = ctx.AV.plan({ state: 'refurbished', seed: 19690 });
  T.ok('pure [G data] VM runs without THREE or DOM and is deterministic',
    JSON.stringify(pRef1) === JSON.stringify(pRef2) && pRef1.apses.length === 8 && pRef1.towers.length === 12);

  const audRef = ctx.AV.audit(pRef1, ctx.KratorAncientsInteriors);
  const audInt = ctx.AV.audit(ctx.AV.plan({ state: 'intact', seed: 19690 }), ctx.KratorAncientsInteriors);
  const audRui = ctx.AV.audit(ctx.AV.plan({ state: 'ruined', seed: 19690 }), ctx.KratorAncientsInteriors);
  T.ok('structural & room audit passes on refurbished, intact, and ruined',
    audRef.ok && audInt.ok && audRui.ok,
    JSON.stringify({ ref: audRef.fails, int: audInt.fails, rui: audRui.fails }));

  // Negative controls on AV.audit (crown height, light-well intrusion, debris in canal, and broken aqueduct head)
  T.neg('audit catches wrong crown height',
    h => { const P = ctx.AV.plan({ state: 'refurbished' }); P.lantern.y1 = h; return ctx.AV.audit(P, ctx.KratorAncientsInteriors).ok; },
    185.0, 220.0);
  T.neg('audit catches tower intruding into central light well',
    xy => { const P = ctx.AV.plan({ state: 'refurbished' }); P.towers[0].x = xy; P.towers[0].z = xy; return ctx.AV.audit(P, ctx.KratorAncientsInteriors).ok; },
    18.0, 46.0);
  T.neg('audit catches ruin debris blocking canal or base',
    dx => { const P = ctx.AV.plan({ state: 'ruined' }); P.debris[0].x = dx; P.debris[0].z = 160; return ctx.AV.audit(P, ctx.KratorAncientsInteriors).ok; },
    0.0, 160.0);
  T.neg('audit catches invalid headrace aqueduct hydraulic head',
    hy => { const P = ctx.AV.plan({ state: 'refurbished' }); P.hydroHall.aqueduct.yWater = hy; return ctx.AV.audit(P, ctx.KratorAncientsInteriors).ok; },
    4.0, 31.8);
  T.neg('audit catches line-shaft colliding with failed Ancient Prime Dynamo',
    lz => {
      const P = ctx.AV.plan({ state: 'refurbished' });
      P.hydroHall.lineShafts.forEach(ls => { if (ls.axis === 'x') ls.z = lz; });
      return ctx.AV.audit(P, ctx.KratorAncientsInteriors).ok;
    },
    -15.8, -25.2);

  // Ancient Prime Dynamo progression (online -> shattered -> failed-stabilized + spliced into hydroHall)
  const pInt = ctx.AV.plan({ state: 'intact', seed: 19690 });
  const pRui = ctx.AV.plan({ state: 'ruined', seed: 19690 });
  T.ok('ancientRelics transitions cleanly from online Ancient Prime Dynamo to failed-stabilized relic spliced into hydroHall',
    pInt.ancientRelics.primeDynamo.status === 'online' && pInt.hydroHall === null && pInt.portals.length === 8 &&
    pRui.ancientRelics.primeDynamo.status === 'shattered' && pRui.hydroHall === null &&
    pRef1.ancientRelics.primeDynamo.status === 'failed-stabilized' && !!pRef1.ancientRelics.statorCradle &&
    pRef1.ancientRelics.busTrunks.length === 4 && pRef1.ancientRelics.busTrunks.every(t => t.spliced) &&
    pRef1.hydroHall.replacesRelic === 'av.relic.prime_dynamo');

  // Settlement SIM slots, portals (8 ground/tailrace + 1 elevated aqueduct = 9), and hydroHall machinery
  const slots = ctx.AV.settlementSlots(pRef1, ctx.KratorAncientsInteriors);
  T.ok('settlementSlots covers living, work, rec, civic, trades, hydroHall machinery, and 9 portals',
    slots.categories.living >= 20 && slots.categories.work >= 20 && slots.categories.rec >= 10 && slots.categories.civic >= 10 &&
    slots.capacityPopulation >= 4000 && slots.capacityPopulation <= 15000 &&
    slots.jobs.smithing > 0 && slots.jobs.warehousing > 0 && slots.jobs.farming > 0 && slots.portals.length === 9 &&
    pRef1.hydroHall.wheels.length === 4 && pRef1.hydroHall.dynamos.length === 4 && pRef1.hydroHall.tripHammers.length === 2,
    JSON.stringify(slots));

  // Edits overlay positive & negative
  T.neg('applyEdits applies matching kind and skips mismatched expectKind',
    ek => {
      const P = ctx.AV.plan({ state: 'refurbished' });
      const res = ctx.AV.applyEdits(P, { set: { 'av.portal.2': { expectKind: ek, w: 20.0 } } });
      return res.applied === 1 && P.portals[2].w === 20.0;
    },
    'street', 'canal');

  // Site ground, canal trench, sluices, barges, and crops
  const site = ctx.AV.sitePlan(19690);
  T.ok('sitePlan carves canal to -3.2 m, keeps arcology pads at 0 m, places sluices & barges, and picks nhighlands crops',
    Math.abs(ctx.AV.groundH(0, 0) - (-3.2)) < 1e-6 &&
    Math.abs(ctx.AV.groundH(0, 220) - (-3.2)) < 1e-6 &&
    Math.abs(ctx.AV.groundH(100, 100)) < 1e-6 &&
    Math.abs(ctx.AV.groundH(-900, -700)) < 1e-6 &&
    Math.abs(ctx.AV.groundH(900, -700)) < 1e-6 &&
    site.beds.length > 30 && site.flora.length > 20 && site.sluices.length === 3 && site.barges.length === 4 && site.crops.vegetable.length === 4);
}

// 2. Full furnishing & room/recipe audit on the real catalog (republican + ancient)
{
  const bundleScript = `
import importlib.util, os, sys
ROOT = ${JSON.stringify(ROOT)}
def load(n, p):
    s = importlib.util.spec_from_file_location(n, p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
fb = load('av_fb', os.path.join(ROOT, 'kits', 'catalog', 'furniture_bundle.py'))
ib = load('av_ib', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
ab = load('av_ab', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))
sys.stdout.write(fb.bundle(['republican', 'generic', 'generic-goods', 'generic-fruit', 'jobs', 'arms', 'post-apoc', 'scrap'], harvested=True, tex=False))
sys.stdout.write('\\n' + ib.bundle(['noahs-regret', 'highlands']) + '\\n' + ab.bundle())
`;
  const bundleJs = cp.execFileSync('python3', ['-c', bundleScript], { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' });
  global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
  global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }), width: 0, height: 0 }) };
  (0, eval)(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8'));
  (0, eval)(bundleJs + '\nglobal.KF=typeof KratorFurniture!=="undefined"?KratorFurniture:globalThis.KratorFurniture;global.IX=typeof KratorInteriors!=="undefined"?KratorInteriors:globalThis.KratorInteriors;global.AI=typeof KratorAncientsInteriors!=="undefined"?KratorAncientsInteriors:globalThis.KratorAncientsInteriors;');
  AI.install(IX);
  for (const f of ['40-av-records.js', '41-av-plans.js', '42-av-facade.js', '43-av-audit.js', '44-av-site.js']) {
    (0, eval)(fs.readFileSync(path.join(HERE, 'src', f), 'utf8'));
  }
  const cat = IX.runtimeAdapter(KF, KF.batch());

  for (const [state, culture, cultures] of [
    ['refurbished', 'republican', ['republican', 'generic', 'scrap']],
    ['intact', 'ancient', ['ancient', 'generic', 'post-apoc']]
  ]) {
    const P = AV.plan({ state, culture, seed: 19690 });
    const storeys = P.decks.map(d => AV.storey(P, d.k, AI));
    const furn = AI.furnishPlan({ type: 'arcvillage', furnish: true, culture, buildings: [{ id: 'av', storeys }] }, cat, { culture, cultures, seed: 77 });
    const fails = [];
    for (const r of furn.rooms) {
      if (r.recipe) {
        const A = AI.audit(r.recipe, furn.catalog);
        if (!A.ok) fails.push(r.R.id + ' (recipe ' + r.R.recipe + '): ' + JSON.stringify(A.fails[0]));
      } else {
        const A = IX.audit(r.room, r.plan, furn.adapter);
        if (!A.ok) fails.push(r.R.id + ' (' + r.R.kind + '): ' + JSON.stringify(A.fails[0]));
      }
    }
    T.ok(state + ' (' + culture + ') furnishes all 14 decks and passes every room & recipe audit',
      furn.rooms.length >= 120 && furn.pieces >= 600 && fails.length === 0,
      'rooms=' + furn.rooms.length + ' pieces=' + furn.pieces + ' fails=' + JSON.stringify(fails.slice(0, 5)));
  }
}

T.done();
