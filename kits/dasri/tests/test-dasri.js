/* node kits/dasri/tests/test-dasri.js: pure data planners, box contracts, Voth census trades & bundle execution.
   Uses tools/ktest.js (T.ok, T.neg with fault + fix, T.done()). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.join(__dirname, '..');
const ROOT = path.join(HERE, '..', '..');

const plan = require(path.join(HERE, 'src', '32-ds-plan.js'));
const { DS_BOX, dsDims, dsStepPlan, dsCliffSeat, DS_HAMLET_ROWS } = plan;

const keys = Object.keys(DS_BOX);
const urbKeys = keys.filter(k => k.startsWith('ds_jabal_'));
const vilKeys = keys.filter(k => k.startsWith('ds_vil_'));

T.ok('28 total building defs across Jabal urban (16) and Dasri village/oasis (12)',
  keys.length === 28 && urbKeys.length === 16 && vilKeys.length === 12,
  `${urbKeys.length} urban + ${vilKeys.length} village`);

T.ok('every def has positive w, d, h, floors, and valid register',
  keys.every(k => {
    const b = DS_BOX[k];
    const d = dsDims(k);
    return d && d.w > 3 && d.d > 3 && d.h > 4 && b.floors >= 1 &&
      (k.startsWith('ds_jabal_') ? b.register === 'urban' : b.register === 'village');
  }));

T.neg('dsDims returns null for unknown key and dimensions for known key',
  k => dsDims(k) !== null,
  'ds_nonesuch_tower',
  'ds_jabal_rock_palace');

T.ok('urban Jabal tower-houses rise taller than village vernacular houses',
  DS_BOX.ds_jabal_house_poor.h > DS_BOX.ds_vil_house_elder.h &&
  DS_BOX.ds_jabal_rock_palace.h > 24 &&
  vilKeys.every(k => DS_BOX[k].h <= 13.0));

/* Stepped rear-high massing planner */
const sp = dsStepPlan({
  w: 14, d: 16,
  tiers: [
    { back: 0, front: 1.0, wFrac: 1.0, y0: 0, h: 6.4 },
    { back: 0, front: 0.65, wFrac: 0.85, y0: 6.4, h: 6.2 },
    { back: 0, front: 0.4, wFrac: 0.65, y0: 12.6, h: 6.4 }
  ]
});
T.ok('dsStepPlan aligns rear spine flush at -d/2 and steps front terraces cleanly down toward +z',
  sp.tiers.length === 3 &&
  sp.tiers.every(t => t.rearFlush && t.z0 === -8) &&
  sp.tiers[0].z1 > sp.tiers[1].z1 && sp.tiers[1].z1 > sp.tiers[2].z1 &&
  sp.maxH === 19.0);

/* Cliff seating calculator */
const cliffGround = (x, z) => (z < -4 ? 14 : z < 4 ? 5 : 0.5);
const seatCliff = dsCliffSeat({ key: 'ds_jabal_house_mid', x: 0, z: 0, ry: 0 }, DS_BOX.ds_jabal_house_mid, cliffGround, {});
const seatFlat = dsCliffSeat({ key: 'ds_jabal_house_mid', x: 0, z: 0, ry: 0 }, DS_BOX.ds_jabal_house_mid, () => 2.0, {});

T.neg('dsCliffSeat detects steep rear cliff rise and extends deep cliff skirt without burying front facade',
  s => s.cliff === true && s.y <= 5.5 && s.skirt >= 4.8 && s.lo <= -4.8,
  seatFlat,
  seatCliff);

T.ok('DS_HAMLET_ROWS exports valid village and oasis hamlet configurations referencing real DS_BOX keys',
  ['dasri_village', 'dasri_oasis'].every(rk => {
    const r = DS_HAMLET_ROWS[rk];
    return r && DS_BOX[r.houses.poor] && DS_BOX[r.houses.mid] && DS_BOX[r.houses.rich] &&
      DS_BOX[r.civic] && DS_BOX[r.well] && DS_BOX[r.watch];
  }));

/* Execute sealed dasri_bundle.py in Node against local THREE to prove standalone host consumption & cliff contract! */
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
const bundleJs = cp.execSync('python "' + path.join(HERE, 'dasri_bundle.py') + '" --no-tex --js', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const ctx = { THREE, console, Math, Object, Array, Number, String, Boolean, Set, Map, Float32Array, Float64Array, Uint16Array, Uint32Array, Int32Array, performance: { now: () => 0 } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(bundleJs, ctx, { filename: 'dasri_bundle.js' });

const DASRI = ctx.DASRI;
T.ok('dasri_bundle.py seals all 28 defs with zero build errors',
  DASRI && Object.keys(DASRI.DEFS).length === 28 && DASRI.errors.length === 0,
  DASRI ? `defs=${Object.keys(DASRI.DEFS).length} errs=${DASRI.errors.length}` : 'no DASRI');

/* Draw a mixed urban + village cliff test cluster via DASRI.draw */
const scene = new THREE.Group();
const drawn = DASRI.draw({
  records: [
    { id: 't1', key: 'ds_jabal_rock_palace', x: 0, z: 0, ry: 0, cliff: true },
    { id: 't2', key: 'ds_jabal_house_mid', x: 20, z: 0, ry: 0, cliff: true, v: 1 },
    { id: 't3', key: 'ds_vil_oasis_qasr', x: 50, z: 0, ry: 0, cliff: false },
    { id: 't4', key: 'ds_vil_house_elder', x: 80, z: 0, ry: 0, cliff: true }
  ]
}, { scene, ground: cliffGround, seed: 42 });

T.ok('DASRI.draw builds meshes, tracks tris, and passes both box and cliff-lock checks',
  drawn.recs.length === 4 && drawn.tris > 5000 && Object.keys(drawn.missing).length === 0 &&
  DASRI.check.box(drawn.recs).ok &&
  DASRI.check.cliff(drawn.recs.filter(r => r.ds && r.ds.cliff)).ok,
  `tris=${drawn.tris}`);

T.neg('DASRI.draw reports missing keys cleanly without throwing',
  d => Object.keys(d.missing).length === 0,
  DASRI.draw({ records: [{ key: 'ds_missing_piece', x: 0, z: 0 }] }, { ground: () => 0 }),
  drawn);

T.done();
