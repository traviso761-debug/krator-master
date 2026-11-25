// ================================================================= HOST — preset views, cutaway/section controls, audits & KHOST.take  [web]
// Hands the page to core/host with both storey-by-storey horizontal cut-aways (X, [ ]) and vertical Soleri cross-sections
// (C, Shift+C), plus full structural, interior-room, ruin, and shader-program assertions for verify.py --assert.

// Preset views: [cx, cy, cz, tx, ty, tz]. View names contain NO apostrophes and NO colons (tools/check_views.py).
const VIEWS = {
  'Vista from south-east': { v: [430, 178, 440, 0, 88, -10], mode: 'day' },
  'Ground aqueduct and tailrace canal': { v: [22.0, 4.2, 432, 0, 92, 20], mode: 'day' },
  'Failed ancient dynamo and busbar splice': { v: [16.5, 16.2, -2.5, -8.5, 13.4, -16.5], mode: 'day' },
  'Central Industrial Hall cataract': { v: [-16.2, 17.5, -6.8, 1.5, 13.8, 9.8], mode: 'day' },
  'Central foundry trip-hammers and cupolas': { v: [12.8, 14.2, -12.5, -1.5, 9.2, -33.5], mode: 'day' },
  'Cross-section refurbished': { v: [0, 118, 360, 0, 96, 0], mode: 'day', section: 'refurbished' },
  'Twin circular gardens and barge dock': { v: [320, 138, 255, 225, 6, -8], mode: 'day' },
  'Deck 0 Tailrace turbine vaults': { v: [48, 72, 118, 18, 1.5, 48], mode: 'day', cut: ['refurbished', 0] },
  'Deck 1 Central Industrial Hall foundry': { v: [52, 74, 112, 0, 7.2, -12], mode: 'day', cut: ['refurbished', 1] },
  'Deck 2 Line-shaft machine galleries': { v: [56, 82, 118, 0, 17.5, -10], mode: 'day', cut: ['refurbished', 2] },
  'Deck 4 Civic market and belvederes': { v: [66, 108, 142, 0, 52.5, 18], mode: 'day', cut: ['refurbished', 4] },
  'Deck 5 Steam bathhouse and drill hall': { v: [58, 122, 126, 0, 67.5, 32], mode: 'day', cut: ['refurbished', 5] },
  'Deck 7 Midlevel living-working ring': { v: [64, 152, 134, 8, 91.5, 24], mode: 'day', cut: ['refurbished', 7] },
  'Deck 11 Cultural Center and roof courts': { v: [72, 224, 150, 0, 162.0, 20], mode: 'day', cut: ['refurbished', 11] },
  'Ancient intact vista': { v: [-540, 165, -340, -900, 88, -700], mode: 'day' },
  'Post-Cataclysm ruin': { v: [1260, 148, -350, 900, 62, -700], mode: 'day' },
  'Night in the Republic': { v: [320, 112, 340, 0, 84, 0], mode: 'night' }
};

const HOST_VIEWS = {};
for (const k in VIEWS) HOST_VIEWS[k] = VIEWS[k].v;

// Cutaway units for 99-host-cutaway.js & 99-host-section.js
const CUT_UNITS = ['refurbished', 'intact'].map(function (sk) {
  const S = AV.SITES[sk];
  return {
    id: sk,
    name: sk === 'refurbished' ? 'Refurbished Cascade Hydropower Arcology' : 'Intact Ancient Cascade Arcology',
    x: S.x,
    z: S.z,
    w: AV.DIM.APOTHEM_CARD * 2 + 16,
    d: AV.DIM.APOTHEM_CARD * 2 + 16,
    levels: S.plan.decks.map(function (L) {
      return { y: L.y, h: L.h, name: L.name + ' [' + L.categories.join('/') + ']' };
    })
  };
});

function pickSiteNearTarget() {
  const t = KHOST.cam && KHOST.cam.ctl ? KHOST.cam.ctl.target : { x: 0, z: 0 };
  const dInt = Math.hypot(t.x - AV.SITES.intact.x, t.z - AV.SITES.intact.z);
  const dRef = Math.hypot(t.x - AV.SITES.refurbished.x, t.z - AV.SITES.refurbished.z);
  return dInt < dRef ? 'intact' : 'refurbished';
}

function applyViewState(name) {
  const V = VIEWS[name];
  if (!V) return;
  setLightMode(V.mode || 'day');
  if (V.cut) {
    if (KHOST.section && KHOST.section.mode && KHOST.section.mode !== 'unit') KHOST.section.off();
    if (KHOST.cut) KHOST.cut.to(V.cut[0], V.cut[1]);
  } else if (V.section) {
    if (KHOST.cut && KHOST.cut.on) KHOST.cut.off();
    AV.openSectionDecks(V.section);
    if (KHOST.section) KHOST.section.set('section');
  } else {
    if (KHOST.cut && KHOST.cut.on) KHOST.cut.off();
    if (KHOST.section && KHOST.section.mode) KHOST.section.off();
    AV.closeDecks();
  }
}

function describeHit(h0, hits) {
  const vis = hits.filter(function (h) {
    if (!h.object.visible) return false;
    if (KHOST.section && KHOST.section.clipped && KHOST.section.clipped(h.point.x, h.point.y, h.point.z)) return false;
    return true;
  });
  if (!vis.length) return '(nothing)';
  const p = vis[0].point, o = vis[0].object;
  const lab = (o.userData && o.userData.inspectLabel) || o.name || 'structure';
  return lab + '\n' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1) + '  range ' + camera.position.distanceTo(p).toFixed(0) + ' m';
}

const DECK_SELECT = [['', 'open interior deck...']].concat(AV.SITES.refurbished.plan.decks.map(function (L) {
  return [String(L.k), L.name + ' (' + L.categories.join('/') + ')'];
}));

const LCTL = ['day', 'dawn', 'night'].map(function (m) {
  return {
    button: m[0].toUpperCase() + m.slice(1),
    title: m === 'night' ? 'Night (N) — warm Republican forge & window glow and arc-beacon' : '',
    on: function () { setLightMode(m); },
    m: m
  };
});
LIGHT_HOOKS.push(function (m) {
  for (let i = 0; i < LCTL.length; i++) {
    if (LCTL[i].el) LCTL[i].el.classList.toggle('on', LCTL[i].m === m);
  }
});

// ---- Audits & Probe Checks (verify.py --assert) ----
const BUDGET = {
  showcase: { tris: 2500000, calls: 320, rendered: 2200000 },
  cls: { pass: 1200000, host: 1800000 },
  type: { host: 'host' }
};

function avDeckAudit(siteKey, deckIdx) {
  const rec = AV.ensureRecords(siteKey);
  const d = rec && rec.byDeck ? rec.byDeck[deckIdx] : null;
  if (!d) return { ok: false, rooms: 0, pieces: 0, fails: ['no deck ' + deckIdx] };
  const st = d.storey, furn = d.furnished;
  const fails = [];
  let pieces = 0;
  (furn.rooms || []).forEach(function (rm) {
    pieces += rm.placements.length;
    if (rm.recipe) {
      const A = KratorAncientsInteriors.audit(rm.recipe, furn.catalog);
      if (!A.ok) fails.push(rm.R.id + ' ' + JSON.stringify(A.fails[0]));
    } else if (rm.room && rm.plan) {
      const A = KratorInteriors.audit(rm.room, rm.plan, furn.adapter);
      if (!A.ok) fails.push(rm.R.id + ' ' + JSON.stringify(A.fails[0]));
    }
  });
  return { ok: fails.length === 0 && pieces > 0, rooms: st.rooms.length, pieces: pieces, fails: fails };
}

function hostChecks() {
  const R = [];
  function add(name, ok, detail) { R.push({ name: name, ok: !!ok, detail: detail || '' }); }

  add('stage ready', AV.STAGE.ready, '3 arcology states + failed Ancient dynamo + hydropower replacement');
  if (!AV.STAGE.ready) return R;

  ['refurbished', 'intact', 'ruined'].forEach(function (sk) {
    const S = AV.SITES[sk];
    const A = AV.audit(S.plan, KratorAncientsInteriors);
    add(sk + ' plan passes structural & functional audit', A.ok,
      A.ok ? (S.plan.footprint.areaHa + ' ha, ' + A.rooms + ' rooms (' + JSON.stringify(A.categories) + ')') : A.fails.slice(0, 3).join('; '));
    const hd = S.hero.userData;
    add(sk + ' hero within triangle & draw-call budget', hd.tris <= 650000 && hd.calls <= 36,
      hd.tris + ' tris, ' + hd.calls + ' calls');
  });

  // Failed Ancient Prime Dynamo relics + careful Hydropower replacement & busbar splices
  const AR = AV.SITES.refurbished.plan.ancientRelics;
  const ARInt = AV.SITES.intact.plan.ancientRelics;
  const HH = AV.SITES.refurbished.plan.hydroHall;
  const sUD = AV.STAGE.siteGroup && AV.STAGE.siteGroup.userData ? AV.STAGE.siteGroup.userData : {};
  add('failed ancient dynamo stabilized, stator cradle rigged & 4 hydro-to-ancient busbar splices active',
    !!AR && AR.primeDynamo.status === 'failed-stabilized' && !!AR.statorCradle &&
    AR.busTrunks.length === 4 && AR.capacitors.length === 6 &&
    !!ARInt && ARInt.primeDynamo.status === 'online' && AV.SITES.intact.plan.hydroHall === null &&
    !!AV.SITES.refurbished.hallProps && AV.SITES.refurbished.hallProps.userData.count >= 14,
    'primeDynamo=' + AR.primeDynamo.status + ', ' + AR.busTrunks.length + ' spliced trunks, ' +
    AR.capacitors.length + ' monoliths, ' + AV.SITES.refurbished.hallProps.userData.count + ' hall floor fixtures');

  add('hydropower aqueduct, 3 cataracts, wheels, dynamos, trip-hammers, cupolas, sluices & barges active',
    !!HH && AV_WATER.falls.length === 3 && AV_WATER.flows.length === 8 &&
    HH.wheels.length === 4 && HH.dynamos.length === 4 && HH.tripHammers.length === 2 && HH.cupolas.length === 2 &&
    sUD.sluices === 3 && sUD.barges === 4,
    AV_WATER.falls.length + ' cataracts, ' + AV_WATER.flows.length + ' flows, ' +
    HH.wheels.length + ' wheels, ' + HH.dynamos.length + ' dynamos, ' + sUD.sluices + ' sluices, ' + sUD.barges + ' barges');

  // Sample decks across all 4 functional categories (work, civic, living, rec)
  [0, 1, 2, 4, 5, 7, 11, 12].forEach(function (dk) {
    const da = avDeckAudit('refurbished', dk);
    add('refurbished L' + dk + ' interior furniture audit', da.ok,
      da.rooms + ' rooms, ' + da.pieces + ' pieces' + (da.fails.length ? ' — ' + da.fails[0] : ''));
  });

  // Settlement integration contract (AV.settlementSlots + AV.portals)
  const slots = AV.settlementSlots(AV.SITES.refurbished.plan, KratorAncientsInteriors);
  const portals = AV.portals(AV.SITES.refurbished.plan);
  const jobCount = Object.keys(slots.jobs || {}).reduce(function (s, k) { return s + slots.jobs[k]; }, 0);
  add('settlement slots & portals ready for host settlement',
    slots.households >= 500 && slots.capacityPopulation >= 4000 && jobCount >= 400 && portals.length === 9,
    slots.households + ' households, pop ' + slots.capacityPopulation + ', ' + jobCount + ' jobs, ' + portals.length + ' portals');

  // Camera-independent KTAGS registration check
  const ta = TAGS.audit();
  add('buildings, relics, aqueduct, sluices, barges, gardens & interior rooms registered in KTAGS', ta.records >= 1000,
    ta.records + ' KTAGS records ' + JSON.stringify(ta.byClass));

  // Ruin stability audit (KRUINS.report + KRUINS.selfTest)
  const ruinRep = KRUINS.report()[0];
  add('ruined arcology has zero floaters & seated wrecks (KRUINS)',
    !!ruinRep && ruinRep.ok,
    ruinRep ? ruinRep.detail : 'no report');
  const st = KRUINS.selfTest();
  add('KRUINS negative self-test', st && st.ok, st ? JSON.stringify(st) : '');

  // Shader program link & anchor check (KHOOK + WATER)
  const wp = WATER.checkPrograms(renderer, scene);
  const kp = KHOOK.checkPrograms(renderer, scene);
  add('water, cataract & window shader hooks link cleanly', wp.length === 0 && kp.length === 0,
    'water bad ' + wp.length + ', khook bad ' + kp.length);

  return R;
}

function hostNegatives() {
  const R = [];
  // 1. Height violation
  {
    const bad = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
    bad.lantern = Object.assign({}, bad.lantern, { y1: 95 });
    R.push({ name: 'truncated arcology height fails audit', failed: !AV.audit(bad, KratorAncientsInteriors).ok });
  }
  // 2. Column-tower inside central light well
  {
    const bad = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
    bad.towers = bad.towers.map(function (t, i) { return i === 0 ? Object.assign({}, t, { x: 8, z: 8 }) : t; });
    R.push({ name: 'column-tower encroaching light well fails audit', failed: !AV.audit(bad, KratorAncientsInteriors).ok });
  }
  // 3. Headrace aqueduct without hydraulic drop
  {
    const bad = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
    bad.hydroHall.aqueduct = Object.assign({}, bad.hydroHall.aqueduct, { yWater: 6.0 });
    R.push({ name: 'headrace aqueduct without hydraulic drop fails audit', failed: !AV.audit(bad, KratorAncientsInteriors).ok });
  }
  // 4. Overhead line-shaft colliding with Failed Ancient Prime Dynamo
  {
    const bad = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
    bad.hydroHall.lineShafts = bad.hydroHall.lineShafts.map(function (ls) {
      return ls.axis === 'x' ? Object.assign({}, ls, { z: -15.8 }) : ls;
    });
    R.push({ name: 'line-shaft colliding with failed ancient dynamo fails audit', failed: !AV.audit(bad, KratorAncientsInteriors).ok });
  }
  // 5. Rubble mound dumped inside central water basin
  {
    const bad = AV.plan({ state: 'ruined', culture: 'ancient', seed: 19690 });
    bad.debris = bad.debris.concat([{ id: 'bad.debris', x: 0, z: 0, rx: 12, rz: 12, h: 6 }]);
    R.push({ name: 'debris inside central water basin fails audit', failed: !AV.audit(bad, KratorAncientsInteriors).ok });
  }
  // 6. Unknown edit id skipped cleanly
  {
    const p = AV.plan({ state: 'refurbished', culture: 'republican', seed: 19690 });
    const res = AV.applyEdits(p, { set: { 'nonexistent.id.999': { x: 10 } } });
    R.push({ name: 'unknown edit target skipped', failed: res.skipped === 1 && res.applied === 0 });
  }
  return R;
}

KHOST.on(function lodTick() {
  camera.updateMatrixWorld();
  if (BIO.lodTick) BIO.lodTick(camera);
}, 'view');
KHOST.on(SKY.view, 'view');

const HOSTED = KHOST.take({
  build: 'cascade',
  title: 'Krator — Cascade Hydropowered Industrial Arcology (Refurbished, Intact & Ruin)',
  hint: 'Cascade — Iron Republic hydropowered arcology engineered around a failed Ancient Prime Toroidal Dynamo (elevated 32 m headrace aqueduct, central waterfall cataracts, 4 overshot hydro-wheels, bevel-gear line-shafts routed around the iron-shored Ancient core, 4 scroll-case hydro-dynamos spliced into severed Ancient power trunks, trip-hammers & blast cupolas). Press X ([ ]) for deck cut-aways; C for live hatched cross-section; F to walk; N for night.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: terrainH,
  walk: KWALK,
  clear: 1.6,
  minR: 3,
  maxR: 6500,
  registry: REG,
  views: HOST_VIEWS,
  start: 'Vista from south-east',
  ticks: TICKS,
  onView: applyViewState,
  controls: [
    {
      select: DECK_SELECT,
      id: 'avDeckSelect',
      on: function (v) {
        if (v === '') {
          if (KHOST.cut && KHOST.cut.on) KHOST.cut.off();
        } else {
          if (KHOST.cut) KHOST.cut.to(pickSiteNearTarget(), +v);
        }
      }
    }
  ].concat(LCTL),
  keys: {
    n: function () { setLightMode(LIGHT_MODE === 'night' ? 'day' : 'night'); }
  },
  cutaway: {
    units: CUT_UNITS,
    cutAt: 3.2,
    margin: 6.0,
    show: function (u, storey) {
      if (storey == null) AV.closeDecks();
      else AV.openDeck(u.id, storey, true);
    },
    caps: { color: '#34302c', hatch: true },
    section: { key: 'c', offset: 0, slab: 16 }
  },
  clock: { hour: 15.2 },
  draw: location.search.indexOf('nosky') >= 0 ? undefined : SKY.draw,
  inspect: describeHit,
  stats: function () {
    const r = AV.SITES.refurbished.hero.userData;
    const op = AV.IX.openGroups.length;
    return 'hero ' + (r.tris / 1000).toFixed(0) + 'k tris, ' + r.calls + ' calls\nopen decks ' + op + (AV.IX.sectionOpen ? ' (section stack)' : '');
  },
  layers: {
    'arcologies': { match: function (o) { return !!(o.userData && o.userData.host); } },
    'gardens and flora': { match: function (o) { return !!(o.userData && (o.userData.biome || o.userData.decor)); } }
  },
  minimap: { title: 'Cascade & Twin Gardens' },
  budget: BUDGET,
  types: function () { return BIO.stats; },
  api: {
    hostChecks: hostChecks,
    hostNegatives: hostNegatives,
    avDeckAudit: avDeckAudit,
    openDeck: function (sk, dk) { if (KHOST.cut) KHOST.cut.to(sk, dk); },
    openSection: function (sk) {
      AV.openSectionDecks(sk || 'refurbished');
      if (KHOST.section) KHOST.section.set('section');
    },
    settlementSlots: function () { return AV.settlementSlots(AV.SITES.refurbished.plan); },
    portals: function () { return AV.portals(AV.SITES.refurbished.plan); },
    stage: function () {
      return {
        ready: AV.STAGE.ready,
        openDecks: AV.IX.openGroups.length,
        sectionMode: KHOST.section ? KHOST.section.mode : null,
        cutStorey: KHOST.cut && KHOST.cut.on ? KHOST.cut.storey : null
      };
    }
  }
});

// Wrap KHOST.section.set / .off so interactive C / Shift+C automatically populates the 8-deck interior section stack!
if (KHOST.section) {
  const _secSet = KHOST.section.set;
  const _secOff = KHOST.section.off;
  KHOST.section.set = function (mode) {
    if ((mode === 'section' || mode === 'slab') && KHOST.section.mode !== mode) {
      if (!AV.IX.sectionOpen) AV.openSectionDecks(pickSiteNearTarget());
    } else if (mode === KHOST.section.mode && AV.IX.sectionOpen) {
      AV.closeDecks();
    }
    return _secSet.call(KHOST.section, mode);
  };
  KHOST.section.off = function () {
    if (AV.IX.sectionOpen) AV.closeDecks();
    return _secOff.call(KHOST.section);
  };
}
