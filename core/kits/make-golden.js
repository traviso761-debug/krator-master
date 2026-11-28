// node core/kits/make-golden.js — generates core/kits/golden-kits.json for Godot 4.7.2 twin parity (kkit_test.gd).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');

const KK = require('./10-core-kits.js');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'kits-manifest.json'), 'utf8'));
KK.loadManifest(MANIFEST);

const ctx = { KCITY: {} };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'core', 'city', '54-city-host-construct.js'), 'utf8'), ctx);

// 1. Key parsing & dims vectors
const keyCases = [
  { in: ['xanadu:xa_house_poor_1', 'islanders'], out: KK.parseKey('xanadu:xa_house_poor_1', 'islanders') },
  { in: ['is_poor_1', 'islanders'], out: KK.parseKey('is_poor_1', 'islanders') },
  { in: ['rep_hall', null], out: KK.parseKey('rep_hall', null) }
];

const sampleDims = [
  'islanders:' + KK.manifest().kits.islanders.order[0],
  'xanadu:' + KK.manifest().kits.xanadu.order[0],
  'yeti:' + KK.manifest().kits.yeti.order[0],
  'beast-riders:' + KK.manifest().kits['beast-riders'].order[0]
].map(qk => ({ qkey: qk, dims: KK.dims(qk, 1, 'islanders') }));

// 2. Rulings #99-101 unlock & candidate vectors
const st = KK.createStyleState('islanders');
KK.updateTradesmen(st, 'dilihan', { masters: 2, wardId: 'harbour', wardCount: 3 });
KK.unlockBlueprint(st, { kitId: 'xanadu', tier: 2, keys: [KK.manifest().kits.xanadu.order[0]], id: 'folio:xan:1' });
KK.updateTradesmen(st, 'yeti', { masters: 2, wardId: 'giant', wardCount: 2 });
KK.setWardPolicy(st, 'harbour', { allowedKits: ['islanders', 'dilihan'], weights: { dilihan: 2.0, islanders: 0.5 } });
KK.setWardPolicy(st, 'giant', { allowedKits: ['islanders', 'yeti'], minDoorH: 3.2 });
const pinnedTarget = 'xanadu:' + KK.manifest().kits.xanadu.order[0];
KK.pinLot(st, 'lot_pinned', pinnedTarget);

const harbourPoor = KK.candidates(st, { wardId: 'harbour', cls: 'poor' }).map(c => ({ qkey: c.qkey, weight: c.weight }));
const giantAny = KK.candidates(st, { wardId: 'giant' }).map(c => ({ qkey: c.qkey, doorH: c.doorH, weight: c.weight }));
const pinnedCands = KK.candidates(st, { lotId: 'lot_pinned', wardId: 'harbour', cls: 'poor' }).map(c => c.qkey);

// Departing Dilihan masters -> standingOnly: true
KK.updateTradesmen(st, 'dilihan', { masters: 0, apprentices: 0 });
const dilihanAfterDepart = KK.kitStatus(st, 'dilihan');
const xanaduAfterDepart = KK.kitStatus(st, 'xanadu');

// 3. KCITY.constructOrder vector: a miniature 4-triangle house (1 plinth tri, 1 slender post tri, 1 wall panel tri, 1 roof tri)
const pos = [
  // tri 0: roof triangle near top (y = 4.2..5.5, normal mostly +Y, area >= 0.25)
  -2, 4.2, -2,   2, 4.2, -2,   0, 5.5, 0,
  // tri 1: broad wall panel in band (y = 0.5..3.0, normal +Z)
  -2, 0.5, 2,    2, 0.5, 2,    2, 3.0, 2,
  // tri 2: slender vertical post in same band (y = 0.5..3.0, width 0.08 -> slim=true, goes BEFORE broad wall panel!)
  -2, 0.5, -2,  -1.92, 0.5, -2,  -2, 3.0, -2,
  // tri 3: low plinth wholly in bottom 12% of height (y = 0.0..0.35 of H=5.5 -> ymax/H = 0.0636 < 0.12 -> footing phase 0!)
  -2.2, 0.0, -2.2,  2.2, 0.0, -2.2,  2.2, 0.35, -2.2
];
const idx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const co = ctx.KCITY.constructOrder({ pos, index: idx });

const golden = {
  format: 'krator-kits-golden',
  version: 1,
  kitCount: KK.listKits().length,
  keyCases,
  sampleDims,
  candidates: {
    harbourPoorCount: harbourPoor.length,
    harbourPoorFirst5: harbourPoor.slice(0, 5),
    giantCount: giantAny.length,
    giantAllYeti: giantAny.every(c => c.qkey.startsWith('yeti:') && c.doorH >= 3.2),
    pinnedCands
  },
  statuses: {
    dilihanAfterDepart,
    xanaduAfterDepart
  },
  usedByLots: KK.kitsUsedByLots([
    { key: 'xanadu:xa_house_poor_1', died: null },
    { kit: 'yeti', key: 'yeti:yt_house', died: null },
    { key: 'dilihan:dil_shop', died: 8 },
    { key: 'is_poor_1', died: null }
  ], 'islanders'),
  constructOrder: {
    pos,
    index: idx,
    tris: Array.from(co.tris),
    keys: Array.from(co.keys).map(x => +x.toFixed(6))
  }
};

const outPath = path.join(__dirname, 'golden-kits.json');
fs.writeFileSync(outPath, JSON.stringify(golden, null, 2) + '\n', 'utf8');
console.log('wrote ' + outPath + ' (tris order: ' + golden.constructOrder.tris.join(', ') + ')');
