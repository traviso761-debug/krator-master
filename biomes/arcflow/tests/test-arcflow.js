/* Node unit tests for biomes/arcflow (ARCFLOW_PHYS, ARCFLOW_SITES, 25-species ARCFLOW kit, KSTRATA, KFRONTIER, CROPS & FAUNA) on tools/ktest.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const ROOT = path.resolve(__dirname, '..', '..', '..');
function loadInGlobal(relPath) {
  const full = path.join(ROOT, relPath);
  vm.runInThisContext(fs.readFileSync(full, 'utf8'), { filename: full });
}

loadInGlobal('core/shader/06-core-khook.js');
loadInGlobal('core/shader/06b-core-kcolor.js');
loadInGlobal('core/rand/08-core-rand.js');
loadInGlobal('core/space/20-core-space.js');
loadInGlobal('core/tags/50-core-tags.js');
loadInGlobal('core/tags/52-core-tags-vocab.js');
loadInGlobal('core/biome/37-core-traps.js');
loadInGlobal('core/frontier/18-core-frontier.js');
loadInGlobal('core/terrain/35-core-strata.js');
loadInGlobal('core/terrain/35f-core-strata-arcflow.js');
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { ARCFLOW_PHYS: PHYS, ARCFLOW_SITES: SITES } = require('../src/15-arcflow-phys.js');
const AF_CROPS = require('../src/22-arcflow-crops.js');
const AF_FAUNA = require('../src/24-arcflow-fauna.js');

// 1. Onshore Arch ophiolite / serpentinite toxicity (Mg/Ca > 8, Ni > 2,200 ppm) vs fertile foredeep
{
  const skerry = PHYS.ophioliteBeltAt(-64, -44, SITES.neva);
  const fenLoam = PHYS.ophioliteBeltAt(0, 0, SITES.neva);
  T.ok('kalju-selka serpentinite skerry reaches Mg/Ca > 8 and Ni > 2,200 ppm while surrounding Musta-Jogi fen stays Ca/Mg-safe',
    skerry.serpentinite01 > 0.85 && skerry.mgCaRatio > 8.0 && skerry.niPpm > 2200.0 && skerry.carnelianRefuge01 > 0.85 &&
    fenLoam.mgCaRatio < 2.5 && fenLoam.carnelianRefuge01 === 0);
  T.neg('serpentine Carnelian refuge requires elevated Mg/Ca > 8 rather than foredeep clay-loam',
    pt => PHYS.ophioliteBeltAt(pt[0], pt[1], SITES.neva).carnelianRefuge01 > 0.5,
    [0, 0],
    [-64, -44]);
}

// 2. Active continental serpentinization: pH 11.5 cerulean travertine & abiotic H2/CH4 Jumala-Tuli cold-flames
{
  const vent = PHYS.alkalineSeepAt(-46, -22, SITES.seep);
  const cascade = PHYS.alkalineSeepAt(-8, 0, SITES.seep);
  const nonSeep = PHYS.alkalineSeepAt(0, 0, SITES.klint);
  T.ok('Station 3 (seep) vents pH > 11.2 Ca-OH cerulean travertine and abiotic H2/CH4 cold-flames',
    cascade.ph >= 11.2 && cascade.ceruleanTufa01 > 0.85 && vent.h2FlameProb01 > 0.85 && nonSeep.ceruleanTufa01 === 0);
}

// 3. Helme-Koski zebra-cumulate rapids, Hiidenkirnu pothole Froude number & sampo hydro-head
{
  const calm = PHYS.koskiHydraulicsAt(433.0, false, 0.4);
  const sill = PHYS.koskiHydraulicsAt(433.0, true, 4.8);
  T.ok('Helme-Koski accelerates from subcritical pool (Fr < 0.55) to supercritical sill (Fr > 0.95) with >= 400 kW sampo head',
    calm.froude < 0.55 && sill.froude > 0.95 && sill.pothole01 > 0.70 && sill.millHeadKw >= 400.0);
  T.neg('Hiidenkirnu swirl-kettle drilling requires supercritical chromitite sill hydraulics',
    onSill => PHYS.koskiHydraulicsAt(433.0, onSill, onSill ? 4.8 : 0.4).pothole01 > 0.5,
    false,
    true);
}

// 4. Musta-Jogi humic peat-acid leaching (pH 4.3) & regenerating Fe-Ni raha-maak ("penny-ore") shoals
{
  const humicShoal = PHYS.bogOreShoalAt(4.35, 0.85, 0.78);
  const neutralReach = PHYS.bogOreShoalAt(7.5, 0.85, 0.78);
  T.ok('pH 4.3 humic water meeting oxygenated shoal precipitates >= 10 kg/m2 Fe-Ni penny-ore with >= 5% Ni',
    humicShoal.rakeReady === true && humicShoal.pennyOreKgM2 >= 10.0 && humicShoal.niWtPct >= 5.0 && !neutralReach.rakeReady);
  T.neg('regenerating raha-maak penny-ore requires humic peat acidity rather than neutral river water',
    ph => PHYS.bogOreShoalAt(ph, 0.85, 0.78).rakeReady === true,
    7.5,
    4.35);
}

// 5. NE Ecocide Bleach-Swath & 45 m ecof_soil_auger Lime-Phosphate Oasis partition on Station 5 (auger)
{
  const inSwath = PHYS.frontierQuiltAt(-68, 24, SITES.auger);
  const inOasis = PHYS.frontierQuiltAt(52, -24, SITES.auger);
  const inBarren = PHYS.frontierQuiltAt(-18, -82, SITES.auger);
  T.ok('Station 5 (auger) partitions cleanly into bleach swath, 45 m green Earth lime-oasis, and surrounding Carnelian serpentinite barren',
    inSwath.biosphere === 'bleach' && inSwath.bleachScar01 > 0.85 &&
    inOasis.biosphere === 'earth' && inOasis.augerOasis01 > 0.80 &&
    inBarren.biosphere === 'carnelian' && inBarren.redDominance01 > 0.65);
}

// 6. KSTRATA stacks, KHAZ.make specs, CROPS.BIOMES.arcflow & ARCFLOW_FAUNA contracts across all 5 stations
{
  for (const key of ['klint', 'koski', 'seep', 'neva', 'auger']) {
    const st = SITES[key];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(0, 10, 0);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) throw new Error('KSTRATA failed on station ' + key);
  }
  const hazOk = ['klintdrop', 'koskisweep', 'causticseep', 'coldflame', 'peatmire', 'bleach'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });
  const crops = AF_CROPS.queryAll();
  T.ok('all 5 Arcflow KSTRATA stacks and 6 KHAZ specs compile, CROPS.BIOMES.arcflow yields >= 50 crops, and 6 fauna schedules resolve',
    hazOk && crops.length >= 50 && AF_FAUNA.SPECIES.length === 6 &&
    AF_FAUNA.stateAt('silicagrazer', 12) === 'RASP_ORGANPIPE' &&
    AF_FAUNA.stateAt('belldrifter', 12) === 'DRIFT_SEEP_PLUME');
}

// 7. 25-Species Roster, Genuine Material Library Mappings, Card Guard & Full 5-Station Substrate Invariants
{
  const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
  const matJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'biomes/arcflow/materials.json'), 'utf8'));
  const packJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'biomes/arcflow/tex/pack.json'), 'utf8'));
  const packSets = packJson.sets || packJson.families || {};

  const mockCanvas = (w = 128, h = 128) => ({
    width: w,
    height: h,
    getContext: () => ({
      fillStyle: '',
      strokeStyle: '',
      fillRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      ellipse: () => {},
      arc: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      drawImage: () => {},
      createImageData: (cw, ch) => ({ width: cw, height: ch, data: new Uint8ClampedArray(cw * ch * 4) }),
      getImageData: (x, y, cw, ch) => ({ width: cw, height: ch, data: new Uint8ClampedArray(cw * ch * 4) }),
      putImageData: () => {}
    })
  });

  const ctx = {
    console,
    Math,
    THREE,
    document: { createElement: () => mockCanvas(128, 128) },
    KRAND: globalThis.KRAND,
    KSPACE: globalThis.KSPACE,
    KHOOK: globalThis.KHOOK,
    KCOLOR: globalThis.KCOLOR,
    KFRONTIER: Object.assign({}, globalThis.KFRONTIER),
    ARCFLOW_PHYS: PHYS,
    ARCFLOW_SITES: SITES,
    ARCFLOW_CROPS: AF_CROPS,
    ARCFLOW_FAUNA: AF_FAUNA
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const coreFiles = [
    'core/biome/10-core-head.js',
    'core/biome/20-core-kit.js',
    'core/biome/30-core-foliage.js',
    'core/biome/31b-core-leafset.js',
    'core/biome/31j-core-joint.js',
    'core/biome/33-core-fungoid.js',
    'core/frontier/52-core-frontier-draw.js'
  ];
  for (const f of coreFiles) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8') + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : '');
    vm.runInContext(code, ctx, { filename: f });
  }

  const bioErrs = [];
  ctx.BIO.init({
    THREE,
    scene: new THREE.Scene(),
    seed: 8117,
    terrainH: () => 8.0,
    waterH: () => -1e9,
    err: m => bioErrs.push(m)
  });
  ctx.KMAT = {
    mode: 'lib',
    packed: (kit, slot) => packSets[slot] || null,
    textures: () => ({ map: new THREE.Texture(), normalMap: new THREE.Texture(), roughnessMap: new THREE.Texture() })
  };

  for (const f of ['biomes/arcflow/src/50-arcflow-species.js', 'biomes/arcflow/src/60-arcflow-place.js', 'biomes/arcflow/src/70-arcflow.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }

  const ARCFLOW = ctx.ARCFLOW;
  const expectedEarth = [
    'nevabirch', 'klintspruce', 'mustaalder', 'klintlinden', 'klintrowan',
    'tremblingaspen', 'goatwillow', 'klintjuniper', 'sweetgale', 'cloudberryfen',
    'augerclover', 'fencottongrass', 'bleachfireweed', 'nevasundew', 'bogcranberry',
    'koskireed', 'serpentinespleenwort', 'klinthepatica', 'spraycliffpolypody', 'kulanewawoad'
  ];
  const expectedCarn = [
    'carnelian_organpipe', 'erythra_veil', 'bladder_tether', 'agate_window', 'blood_strangler'
  ];
  const earthSet = new Set(expectedEarth);
  const carnSet = new Set(expectedCarn);

  const allHvOk = ARCFLOW.SPECIES.every(s => {
    const hv = ARCFLOW.HARVEST[s.key];
    return Boolean(hv && s.tags && s.tags.harvest === hv && hv.notes && hv.notes.length >= 12 &&
      Array.isArray(s.items) && s.items.length >= 1 && s.items.every(it => ARCFLOW.speciesOfItem(it) === s));
  });

  const fams = matJson.families || {};
  const standInsFixed =
    fams['bark.birch'] && fams['bark.birch'].lib === 'bark.birch.lichen' &&
    fams.birch && fams.birch.lib === 'card.birch.silver' &&
    fams['bark.alder'] && fams['bark.alder'].lib === 'bark.alder.lichen' &&
    fams.alder && fams.alder.lib === 'card.broadleaf' &&
    fams.clover && fams.clover.lib === 'card.crop.clover' &&
    fams.cottongrass && fams.cottongrass.lib === 'card.cottongrass' &&
    fams['bark.rowan'] && fams['bark.rowan'].lib === 'bark.cherry' &&
    fams.rowan && fams.rowan.lib === 'card.starberry' &&
    fams['bark.aspen'] && fams['bark.aspen'].lib === 'bark.birch.b' &&
    fams.aspen && fams.aspen.lib === 'card.aspen' &&
    fams['bark.willow'] && fams['bark.willow'].lib === 'bark.bark_willow_02' &&
    fams.willow && fams.willow.lib === 'card.weeper' &&
    fams['bark.juniper'] && fams['bark.juniper'].lib === 'bark.juniper' &&
    fams.juniper && fams.juniper.lib === 'card.juniper' &&
    fams.sweetgale && fams.sweetgale.lib === 'card.dwarfbirch' &&
    fams.fireweed && fams.fireweed.lib === 'card.fireweed' &&
    fams.sundew && fams.sundew.lib === 'card.sundew.great' &&
    fams.cranberry && fams.cranberry.lib === 'card.bulbheath' &&
    fams.reed && fams.reed.lib === 'card.reed' &&
    fams.spleenwort && fams.spleenwort.lib === 'card.frond.needle' &&
    fams.hepatica && fams.hepatica.lib === 'card.flower.bluebell' &&
    fams.fern && fams.fern.lib === 'card.fern.green' &&
    fams.woad && fams.woad.lib === 'card.crop.woad';

  T.ok('ARCFLOW.SPECIES defines all 25 species (20 Earth + 5 Carnelian incl. blood_strangler), valid HV tags, genuine library sets, and 0 cardFaults',
    ARCFLOW.SPECIES.length === 25 &&
    expectedEarth.every(k => ARCFLOW.byKey[k] && ARCFLOW.byKey[k].biosphere === 'earth' && ARCFLOW.byKey[k].tags.biosphere === 'earth') &&
    expectedCarn.every(k => ARCFLOW.byKey[k] && ARCFLOW.byKey[k].biosphere === 'carnelian' && ARCFLOW.byKey[k].tags.biosphere === 'carnelian' && ARCFLOW.byKey[k].tags.native === true) &&
    allHvOk && standInsFixed && ctx.BIO.cardFaults.length === 0 && bioErrs.length === 0);

  // Station terrain/water approximations matching 45-host-stage.js for full 5-station placement verification
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function stationEnv(skey) {
    if (skey === 'klint') {
      const zm = x => (x <= 56 ? 0 : 16 * Math.sin(Math.max(0, Math.min(1, (x - 56) / 390)) * 4.2));
      const waterH = (x, z) => {
        if (x <= -14 && Math.abs(z) < 23.5) return 55.4;
        if (Math.hypot((x - 26) / 52, z / 31) < 1.02) return 0.4;
        if (x >= 42 && x <= 450 && Math.abs(z - zm(x)) < 22) return 0.36 - 2.2 * Math.max(0, Math.min(1, (x - 42) / 404));
        return -1e9;
      };
      const terrainH = (x, z) => {
        const w = waterH(x, z);
        if (w > -1e5) return w + (Math.abs(z - zm(x)) > 17 ? 0.45 : -1.5);
        return x < -14 ? 58.5 : (Math.abs(z - zm(x)) < 95 ? 14.0 : 38.0);
      };
      const rock = (x, z) => (Math.abs(x + 14) < 32 ? 0.42 : 0.16);
      const wet = (x, z) => (Math.abs(z - zm(x)) < 44 ? 0.52 : 0.22);
      return { terrainH, waterH, rock, wet };
    }
    if (skey === 'koski') {
      const zr = x => 9.5 * Math.sin((x + 80) * 0.011);
      const wy = x => (x <= -82 ? 12.25 : x >= 82 ? 0.2 : 12.24 - 12.03 * Math.max(0, Math.min(1, (x + 82) / 164)));
      const waterH = (x, z) => {
        const hw = (x > -84 && x < 84) ? 17 : 34;
        return Math.abs(z - zr(x)) <= hw ? wy(x) : -1e9;
      };
      const terrainH = (x, z) => {
        const dz = Math.abs(z - zr(x)), hw = (x > -84 && x < 84) ? 17 : 34;
        if (dz <= hw - 2) return wy(x) - 1.5;
        if (dz <= hw + 4) return wy(x) + 0.48;
        return wy(x) + 2.5 + 18 * smooth(hw + 12, 140, dz);
      };
      const rock = (x, z) => (Math.abs(z - zr(x)) < 38 ? 0.36 : 0.18);
      const wet = (x, z) => (Math.abs(z - zr(x)) < 34 ? 0.56 : 0.20);
      return { terrainH, waterH, rock, wet };
    }
    if (skey === 'seep') {
      const sz = x => 6.0 * Math.sin((x + 30) * 0.022);
      const waterH = (x, z) => (x >= -34 && x <= 72 && Math.abs(z - sz(x)) < 19) ? 12.0 : -1e9;
      const terrainH = (x, z) => (waterH(x, z) > -1e5 ? 11.2 : 18.0 + 28.0 * smooth(48, -160, x));
      return { terrainH, waterH, rock: () => 0.28, wet: (x, z) => (Math.abs(z - sz(x)) < 32 ? 0.42 : 0.22) };
    }
    if (skey === 'neva') {
      const zr = x => 22 * Math.sin((x + 120) * 0.0085) + 6 * Math.cos(x * 0.019);
      const waterH = (x, z) => (Math.abs(z - zr(x)) < 18.5 ? 0.4 : -1e9);
      const terrainH = (x, z) => {
        const dz = Math.abs(z - zr(x));
        if (dz < 15.5) return -1.1;
        if (dz < 21.5) return 0.78;
        return 1.8 + 4.5 * smooth(28, 180, dz);
      };
      return { terrainH, waterH, rock: () => 0.12, wet: () => 0.62 };
    }
    const waterH = (x, z) => (Math.hypot(x - 46, z + 36) < 12.5 ? 5.45 : -1e9);
    const terrainH = (x, z) => {
      const d = Math.hypot(x - 46, z + 36);
      if (d < 11.0) return 4.6;
      if (d < 14.5) return 5.85;
      return 9.2;
    };
    return { terrainH, waterH, rock: () => 0.24, wet: (x, z) => (Math.hypot(x - 46, z + 36) < 18 ? 0.55 : 0.14) };
  }

  const totalsBySpecies = {};
  for (const s of ARCFLOW.SPECIES) totalsBySpecies[s.key] = 0;

  let totalEarth = 0;
  let totalCarn = 0;
  let substrateViolations = 0;
  let spleenwortOutOfBounds = 0;
  const stationStats = {};

  function checkRecordInvariant(rec, site) {
    const [spKey, x, , z, , , meta] = rec;
    if (!meta) return false;
    const fq = PHYS.frontierQuiltAt(x, z, site);
    if (earthSet.has(spKey)) {
      if (meta.biosphere !== 'earth') return false;
      if (fq.biosphere !== 'earth') return false;
      if (fq.bleachScar01 > 0.55 || meta.bleachScar01 > 0.55) return false;
      if ((fq.mgCaRatio > 8.0 || meta.mgCaRatio > 8.0) && !(fq.augerOasis01 > 0.35 && meta.augerOasis01 > 0.35)) return false;
      return true;
    }
    if (carnSet.has(spKey)) {
      return meta.biosphere === 'carnelian' && fq.biosphere === 'carnelian';
    }
    return false;
  }

  for (const skey of ['klint', 'koski', 'seep', 'neva', 'auger']) {
    const env = stationEnv(skey);
    const st = ARCFLOW.build({
      station: skey,
      quality: 1,
      R: 630,
      seed: 8117,
      terrainH: env.terrainH,
      waterH: env.waterH,
      rock: env.rock,
      wet: env.wet,
      space: globalThis.KSPACE.create({ cell: 12 })
    });
    stationStats[skey] = st;
    for (const rec of ARCFLOW.PLACED) {
      const spKey = rec[0];
      totalsBySpecies[spKey] = (totalsBySpecies[spKey] || 0) + 1;
      if (earthSet.has(spKey)) totalEarth++;
      else if (carnSet.has(spKey)) totalCarn++;
      if (!checkRecordInvariant(rec, SITES[skey])) {
        substrateViolations++;
      }
      if (spKey === 'serpentinespleenwort') {
        const mg = rec[6] ? rec[6].mgCaRatio : 0;
        if (!(mg >= 4.5 && mg <= 8.0)) spleenwortOutOfBounds++;
      }
    }
  }

  const missingSpecies = Object.keys(totalsBySpecies).filter(k => totalsBySpecies[k] === 0);
  T.ok('all 25 species place across the 5 stations with 0 substrate violations (Earth never on Mg/Ca > 8 unless augerOasis01 > 0.35, never on bleachScar01 > 0.55; 5 Carnelian clades strictly on carnelian)',
    missingSpecies.length === 0 &&
    totalEarth >= 400 &&
    totalCarn >= 200 &&
    substrateViolations === 0 &&
    spleenwortOutOfBounds === 0 &&
    stationStats.auger.blood_strangler >= 10 &&
    stationStats.seep.blood_strangler >= 5 &&
    stationStats.auger.augerclover >= 15 &&
    stationStats.auger.bleachfireweed >= 5 &&
    bioErrs.length === 0);

  T.neg('Earth species record on unlimed Mg/Ca > 8 serpentinite (-64, -44 on neva) violates substrate partition law',
    rec => checkRecordInvariant(rec, SITES.neva),
    ['nevabirch', -64, 8, -44, 243, 'foredeep', { biosphere: 'earth', mgCaRatio: 13.8, bleachScar01: 0, augerOasis01: 0 }],
    ['nevabirch', 0, 2, 0, 237, 'foredeep', { biosphere: 'earth', mgCaRatio: 1.76, bleachScar01: 0, augerOasis01: 0 }]);

  T.neg('Earth species record inside Bleach-Swath core (-68, 24 on auger, bleachScar01 > 0.55) violates substrate partition law',
    rec => checkRecordInvariant(rec, SITES.auger),
    ['bleachfireweed', -68, 9, 24, 1274, 'foredeep', { biosphere: 'earth', mgCaRatio: 4.0, bleachScar01: 0.92, augerOasis01: 0 }],
    ['augerclover', 52, 7.5, -24, 1273, 'auger_oasis', { biosphere: 'earth', mgCaRatio: 10.07, bleachScar01: 0, augerOasis01: 0.95 }]);
}

T.done();
