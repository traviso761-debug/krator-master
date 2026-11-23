// node core/region/tests/test-region-styles.js — Phase 2 KREGION + SIM multi-kit style-unlock, apprenticeship,
// blueprint purchase & ward-zoning verification (core/region/MULTI-KIT-SCOPE.md, Rulings #99-101).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
global.ISLE_DIMS = {};

[
  'core/rand/08-core-rand.js',
  'core/clock/20-core-clock.js',
  'core/kits/10-core-kits.js'
].forEach(load);

fs.readdirSync(path.join(ROOT, 'core', 'simulation'))
  .filter(f => /^77-sim-.*\.js$/.test(f))
  .sort()
  .forEach(f => load('core/simulation/' + f));

const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'kits-manifest.json'), 'utf8'));
KRATOR_KITS.loadManifest(MANIFEST);
const KM = KRATOR_KITS.manifest().kits;

load('core/region/00-region-core.js');
const RH = { TUNE: { sim: {} } };
KREGION.use(RH);
load('core/region/47b-region-build.js');
load('core/region/47m-region-money.js');
load('core/region/47s-region-styles.js');

// ---------------------------------------------------------------- Synthetic regional port settlement on SIM
const clock = { m: 0, day: 0, hour: 0, t: 0 };
RH.TUNE.sim = {
  seed: 53,
  culture: { kit: 'islanders', faction: 'islanders' },
  styles: { foundingKit: 'islanders', trainDays: 3 },
  home: { per: 5, acts: ['SLEEP', 'EAT', 'REST', 'IDLE', 'HOUSEWORK'] },
  kinds: {
    'islanders:is_poor_1': ['home', {}]
  },
  towns: { port: { id: 'port', prefix: 'pt.' } },
  ages: { bands: { child: [4, 15], adult: [18, 50], elder: [55, 75] } },
  items: { wealthSpread: { poor: [0.1, 0.3], middle: [0.4, 0.6], rich: [0.7, 0.95] } },
  money: {
    currencies: {
      shell: { name: 'Kautoan shell', talent: 0.1, unit: 'shells' },
      talent: { name: 'Izani Talent', talent: 1.0, unit: 'Talents' }
    },
    nation: { islanders: 'shell' },
    changers: { shell: 50000, talent: 5000 },
    foreign: { talent: 10000 },
    treasury: 100,
    endow: { poor: 40, middle: 80, rich: 200 }
  },
  build: {
    pace: 2,
    grace: 30,
    kinds: {
      house: { bill: { timber: 12, mats: 8 }, hours: 16, life: 365 },
      longhouse: { bill: { timber: 28, mats: 16 }, hours: 30, life: 365 },
      works: { bill: { timber: 20, stone: 10 }, hours: 24, life: 365 },
      'xan-house': { bill: { stone: 14, brick: 10 }, hours: 18, life: 500 },
      'dil-house': { bill: { brick: 12, timber: 6 }, hours: 14, life: 450 },
      'rep-house': { bill: { stone: 16, timber: 10 }, hours: 20, life: 550 }
    },
    byKit: {
      xanadu: { house: 'xan-house', longhouse: 'xan-house', works: 'works' },
      dilihan: { house: 'dil-house', longhouse: 'dil-house', works: 'works' },
      'highlands-republican': { house: 'rep-house', longhouse: 'rep-house', works: 'works' }
    }
  }
};
RH.households = () => 1;

RH.SIM = {
  clock,
  order: ['port'],
  problems: [],
  lotRecs: {},
  plans: {
    port: {
      G: { frame: { x: 0, z: 0, sea: 0 }, h: () => 3 },
      R: {
        spurs: [{
          id: 'spur-north',
          root: 'north-gate',
          open: false,
          lane: [[0, 120], [40, 120]],
          lots: [
            { id: 501, lot: 'spur0', key: 'islanders:' + KM.islanders.order[0], cls: 'middle', district: 'suburb', x: 10, z: 128, ry: 0, w: 12, d: 12, vacant: true, closed: true },
            { id: 502, lot: 'spur1', key: 'islanders:' + KM.islanders.order[0], cls: 'middle', district: 'suburb', x: 26, z: 128, ry: 0, w: 12, d: 12, vacant: true, closed: true }
          ]
        }]
      }
    }
  }
};

SIM.init({
  seed: 53,
  hour: () => clock.hour,
  day: () => clock.day,
  t: () => clock.t,
  err: m => RH.SIM.problems.push(m)
});
['SLEEP', 'EAT', 'REST', 'IDLE', 'HOUSEWORK', 'WORK', 'SOCIALIZE', 'BUY'].forEach(id => {
  SIM.activity({ id, indoor: id !== 'WORK' });
});
SIM.faction({ id: 'islanders', name: 'Ring Sea Islanders' });
SIM.settlement({ id: 'port', name: 'Port Test', faction: 'islanders', x: 0, z: 0 });
SIM.org({ id: 'port.folk', name: 'Port Folk', faction: 'islanders', settlement: 'port' });

// Economy with warehouse stocked with building materials so projects finish cleanly and book 'used'
const wh = SIM.place({
  id: 'port.wh0', name: 'port warehouse', kind: 'warehouse',
  x: -20, y: 3, z: 0, ry: 0, door: { x: -20, y: 3, z: -4 },
  activities: {}, indoor: true, settlement: 'port',
  tags: { key: 'islanders:' + KM.islanders.order[0], cls: 'middle', district: 'artisan' }
});
SIM.economy({
  goods: { timber: { unit: 'lot' }, mats: { unit: 'lot' }, stone: { unit: 'lot' }, brick: { unit: 'lot' } },
  every: 60, window: 1440
}, { settlement: 'port' });
SIM.withEcon('port', () => {
  SIM.store(wh.id, { kind: 'warehouse' });
  ['timber', 'mats', 'stone', 'brick'].forEach(g => { wh.stock[g] = 2000; });
});

// Founding standing homes so citizens have beds and treasury receives opening reserve
for (let i = 0; i < 4; i++) {
  const P = SIM.place({
    id: 'port.home' + i, name: 'founding house ' + i, kind: 'home',
    x: i * 12, y: 3, z: 0, ry: 0, door: { x: i * 12, y: 3, z: -4 },
    activities: { SLEEP: 5, EAT: 5, REST: 5, IDLE: 5, HOUSEWORK: 5 },
    indoor: true, settlement: 'port',
    tags: { key: 'islanders:' + KM.islanders.order[0], cls: 'middle', district: 'artisan' }
  });
  P.people = 5;
  P.cls = 'middle';
}

// 6 vacant lots across artisan & giant wards
const lotDefs = [
  { id: 'port.lot0', ward: 'artisan', x: 0, z: 30, w: 14, d: 14 },
  { id: 'port.lot1', ward: 'artisan', x: 18, z: 30, w: 14, d: 14 },
  { id: 'port.lot2', ward: 'artisan', x: 36, z: 30, w: 14, d: 14 },
  { id: 'port.lot3', ward: 'artisan', x: 54, z: 30, w: 14, d: 14 },
  { id: 'port.lot6', ward: 'artisan', x: 72, z: 30, w: 14, d: 14 },
  { id: 'port.lot4', ward: 'giant', x: 0, z: 75, w: 16, d: 16 },
  { id: 'port.lot5', ward: 'giant', x: 22, z: 75, w: 16, d: 16 }
];
const baseIslKey = 'islanders:' + KM.islanders.order[0];
lotDefs.forEach((ld, idx) => {
  const rec = { id: 100 + idx, lot: ld.id.split('.')[1], key: baseIslKey, cls: 'middle', district: ld.ward, ward: ld.ward, x: ld.x, z: ld.z, ry: 0, w: ld.w, d: ld.d, vacant: true };
  RH.SIM.lotRecs[ld.id] = rec;
  const P = SIM.place({
    id: ld.id, name: 'an empty lot', kind: 'lot',
    x: ld.x, y: 3, z: ld.z, ry: 0, door: { x: ld.x, y: 3, z: ld.z - 4 },
    activities: { WORK: 2 }, indoor: {}, settlement: 'port',
    tags: { key: baseIslKey, lot: rec.id, cls: 'middle', district: ld.ward, ward: ld.ward, vacant: true, hh: 1 }
  });
  P.cls = 'middle';
});

SIM.role({
  id: 'port.builder', org: 'port.folk', name: 'builder', settlement: 'port',
  homes: ['home'], work: { kinds: ['lot'], act: 'WORK' }
});

// Local builder who will co-work and apprentice under the Xanadu master
const localBuilder = SIM.actor({ id: 'pt.b_local', role: 'port.builder', home: 'port.home0', work: 'port.lot0' });
localBuilder.ageBand = 'adult'; localBuilder.age = 24; localBuilder.status = 'employed'; localBuilder.job = 'builder';

RH.simMoney();
RH.simBuild();
RH.simStyles();

const snap0 = RH.styleBooks();

// ---------------------------------------------------------------- 1. Ruling #99: Migrant masters, co-working apprenticeship & standingOnly
const xanMaster = SIM.actor({ id: 'pt.m_xan', role: 'port.builder', home: 'port.home1', work: 'port.lot0' });
xanMaster.ageBand = 'adult'; xanMaster.age = 38; xanMaster.status = 'employed'; xanMaster.job = 'mason'; xanMaster.homeKit = 'xanadu';

const dilMaster = SIM.actor({ id: 'pt.m_dil', role: 'port.builder', home: 'port.home2', work: 'port.lot1' });
dilMaster.ageBand = 'adult'; dilMaster.age = 41; dilMaster.status = 'employed'; dilMaster.job = 'builder'; dilMaster.homeKit = 'dilihan';

const sync1 = RH.syncStyleTradesmen('port');
T.ok('arriving Xanadu and Dilihan master builders unlock Tier 2 vernacular styles in port',
  sync1.xanadu.active && sync1.xanadu.effectiveTier === 2 && sync1.dilihan.active && sync1.dilihan.effectiveTier === 2,
  'xanadu tier=' + sync1.xanadu.effectiveTier + ', dilihan tier=' + sync1.dilihan.effectiveTier);

// Commission lot1 and lot3 to Dilihan houses (lot0 + lot1 build first under pace=2; when lot1 finishes, lot2 starts, leaving lot3 unstarted 'empty')
const fitDil = Object.values(KM.dilihan.pieces).find(p => p.tier <= 2 && p.w <= 14 && p.d <= 14);
const fitXan = Object.values(KM.xanadu.pieces).find(p => p.tier <= 2 && p.w <= 14 && p.d <= 14);
const cLot0 = RH.commissionLotStyle('port', 'port.lot0', fitXan.qkey);
const cLot1 = RH.commissionLotStyle('port', 'port.lot1', fitDil.qkey);
const cLot3 = RH.commissionLotStyle('port', 'port.lot3', fitDil.qkey);
// Clear pin on lot3 so it behaves as an unpinned unstarted Dilihan lot when Dilihan goes dormant
KRATOR_KITS.pinLot(RH.styleStateOf('port'), 'port.lot3', null);

T.ok('unlocked Xanadu and Dilihan pieces route to their kit-specific SIM.BUILD bills (xan-house, dil-house)',
  cLot0.ok && cLot1.ok && cLot3.ok &&
  SIM.BUILD.lots['port.lot0'].kind === 'xan-house' &&
  SIM.BUILD.lots['port.lot1'].kind === 'dil-house',
  'lot0=' + SIM.BUILD.lots['port.lot0'].kind + ', lot1=' + SIM.BUILD.lots['port.lot1'].kind);

function advanceMinutes(mins, workLot1) {
  for (let m = 60; m <= mins; m += 60) {
    clock.m += 60;
    clock.day = Math.floor(clock.m / 1440);
    clock.hour = (clock.m % 1440) / 60;
    SIM.step(clock.m);
    // Keep localBuilder + xanMaster co-working on lot0 (slow work so lot0 stays 'building' during 3-day apprenticeship)
    // while dilMaster finishes lot1 quickly
    if (SIM.BUILD.lots['port.lot0'].state === 'building') {
      localBuilder.work = 'port.lot0';
      if (xanMaster.present !== false) xanMaster.work = 'port.lot0';
      SIM.buildWork('port.lot0', 0.15, clock.m);
    }
    if (workLot1 && SIM.BUILD.lots['port.lot1'].state === 'building') {
      if (dilMaster.present !== false) dilMaster.work = 'port.lot1';
      SIM.buildWork('port.lot1', 1.0, clock.m);
    }
  }
}

// Advance 3 full days: lot1 (dil-house, 14 hours) finishes -> becomes a built home; localBuilder completes 3 days with xanMaster!
advanceMinutes(3 * 1440, true);

T.ok('co-working local builder earns certified Xanadu apprenticeship after trainDays, while Dilihan lot1 finishes as a standing home',
  !!(localBuilder.learnedKits && localBuilder.learnedKits.xanadu) &&
  SIM.R.place['port.lot1'].kind === 'home' &&
  RH.SIM.lotRecs['port.lot1'].built === true,
  'learned=' + JSON.stringify(localBuilder.learnedKits) + ', lot1.kind=' + SIM.R.place['port.lot1'].kind);

// Now BOTH foreign masters emigrate from port!
xanMaster.present = false; SIM.remove('actor', xanMaster.id);
dilMaster.present = false; SIM.remove('actor', dilMaster.id);
const syncAfterLeave = RH.syncStyleTradesmen('port');

T.ok('Ruling #99: after foreign masters depart, Xanadu stays active via certified local apprentice while un-apprenticed Dilihan flips to standingOnly',
  syncAfterLeave.xanadu.active === true &&
  syncAfterLeave.xanadu.practitioners === 1 &&
  syncAfterLeave.dilihan.active === false &&
  syncAfterLeave.dilihan.standingOnly === true,
  'xanadu=' + JSON.stringify(syncAfterLeave.xanadu) + ', dilihan=' + JSON.stringify(syncAfterLeave.dilihan));

T.ok('Ruling #99: already-built Dilihan home (port.lot1) remains standing with its beds, while unstarted empty lot3 re-keys away from dormant Dilihan',
  SIM.R.place['port.lot1'].kind === 'home' &&
  SIM.R.place['port.lot1'].activities.SLEEP === 5 &&
  SIM.BUILD.lots['port.lot3'].state === 'empty' &&
  KRATOR_KITS.parseKey(SIM.R.place['port.lot3'].tags.key, 'islanders').kitId !== 'dilihan',
  'lot1.kind=' + SIM.R.place['port.lot1'].kind + ', lot3.key=' + SIM.R.place['port.lot3'].tags.key);

// ---------------------------------------------------------------- 2. Ruling #100: Blueprint purchase & Relic schematic unlock
const tooDear = RH.buyBlueprint('port', { kitId: 'highlands-republican', tier: 2, price: 99999999, id: 'folio:too-dear' });
const boughtRep = RH.buyBlueprint('port', { kitId: 'highlands-republican', tier: 2, price: 250, id: 'folio:rep:guild' });

T.neg('buying a guild blueprint rejects insufficient treasury funds and succeeds with ledger-conserved payment when affordable',
  res => res.ok === true,
  tooDear,
  boughtRep);

const pylonKey = KM.pylon.order[0];
const schemRes = RH.grantSchematic('port', { kitId: 'pylon', keys: [pylonKey], source: 'relic:monolith', id: 'schem:pylon:0' });
const stPort = RH.styleStateOf('port');
T.ok('Ruling #100: purchased Republic folio unlocks Tier 2 permanently (0 practitioners) and granted Pylon schematic unlocks exact named piece',
  boughtRep.status.active && boughtRep.status.blueprintTier === 2 && boughtRep.status.practitioners === 0 &&
  schemRes.ok && KRATOR_KITS.pieceUnlocked(stPort, 'pylon', pylonKey, KM.pylon.pieces[pylonKey]),
  'repTier=' + boughtRep.status.blueprintTier + ', pylonPiece=' + pylonKey);

// ---------------------------------------------------------------- 3. Ruling #101: Ward zoning, Giant clearance & openSpur
const yetiMaster = SIM.actor({ id: 'pt.m_yeti', role: 'port.builder', home: 'port.home3', work: 'port.lot0' });
yetiMaster.ageBand = 'adult'; yetiMaster.age = 35; yetiMaster.status = 'employed'; yetiMaster.job = 'carpenter'; yetiMaster.homeKit = 'yeti';
RH.syncStyleTradesmen('port');

const giantWardRes = RH.setWardStyle('port', 'giant', { allowedKits: ['islanders', 'yeti'], minDoorH: 3.2 });
const lot4Key = SIM.R.place['port.lot4'].tags.key;
const lot4Dm = KRATOR_KITS.dims(lot4Key, 0, 'islanders');

T.ok('Ruling #101: setting Giant ward minDoorH=3.2 m re-keys vacant Giant lots to Yeti pieces with >= 3.2 m doors',
  giantWardRes.rekeyedLots === 2 && lot4Dm.kit === 'yeti' && lot4Dm.doorH >= 3.2,
  'rekeyed=' + giantWardRes.rekeyedLots + ', lot4=' + lot4Key + ' (' + lot4Dm.doorH + ' m)');

const lowDoorComm = RH.commissionLotStyle('port', 'port.lot5', baseIslKey);
const fitRep = Object.values(KM['highlands-republican'].pieces).find(p => p.tier <= 2 && p.w <= 14 && p.d <= 14);
const okRepComm = RH.commissionLotStyle('port', 'port.lot6', fitRep.qkey);

T.neg('Ruling #101: commissioning rejects a 2.2 m door house in the Giant ward and accepts an unlocked Republic blueprint in Artisan ward',
  res => res.ok === true,
  lowDoorComm,
  okRepComm);

// Pin suburb ward to highlands-republican and open the closed spur outside the gate
RH.setWardStyle('port', 'suburb', { pinnedKit: 'highlands-republican', rekeyVacant: false });
const spurOpened = RH.openSpur('port');
const spurLotP = SIM.R.place['port.spur0'];

T.ok('opening a street spur outside the gate automatically assigns unlocked ward-zoned Republic blueprints and rep-house bills',
  spurOpened === true &&
  spurLotP &&
  KRATOR_KITS.parseKey(spurLotP.tags.key, 'islanders').kitId === 'highlands-republican' &&
  SIM.BUILD.lots['port.spur0'].kind === 'rep-house',
  'spur0=' + (spurLotP && spurLotP.tags.key) + ' billKind=' + SIM.BUILD.lots['port.spur0'].kind);

// Advance 2 more days so upkeep & projects draw materials, then verify all styleChecks & SIM.ledger invariants
advanceMinutes(2 * 1440, false);
const snapEnd = RH.styleBooks();
const checks = RH.styleChecks(snap0, snapEnd);
const failedChecks = checks.filter(c => !c.ok);

T.ok('all RH.styleChecks and SIM.ledger goods + money conservation invariants hold end-to-end',
  checks.length === 4 && failedChecks.length === 0,
  failedChecks.length ? failedChecks.map(c => c.name + ': ' + c.detail).join('; ') : '4/4 style & ledger checks green');

T.done();
