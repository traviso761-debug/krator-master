// ================================================================= HOST TAKE — Views, KHOST cutaway, UI controls, checks & negatives
// Hands Arcoforte to `core/host` (`KHOST.take` + `KHOST.standard`): 14 preset views (zero apostrophes or colons: item 30),
// interactive cutaway (`X`, `[` / `]`), first-person walking (`F`) on `KWALK`, interactive doors (`E`) on `KDOORHOST`,
// live culture socket selector (`ARCOFORTE_HOST.socket`), state switcher (`?state=refurbished|intact|ruined`), and full asserts.

const VIEWS = {
  'Sea cliff vista': [-430, 218, -565, 10, 108, -75],
  'Central park and waterways': [-44, 88, 72, 10, 115, -72],
  'Multilevel harbour lift platform': [-128, 34, -395, 0, 16, -265],
  'North west marina and cliff ramp': [-345, 58, -310, -230, 24, -185],
  'Sub cliff fishing works and vaults': [-42, 11.5, -214, 18, 10.0, -207],
  'Battered neocliff dwelling bastions': [385, 138, 125, 195, 112, 25],
  'Promenade oculus skylights and belvederes': [178, 174, 148, 165, 146, -15],
  'Southern linear city spine': [135, 142, 515, 0, 98, 250],
  'Domed rotunda and skybridges': [92, 168, -28, 0, 145, -125],
  'Seven cliff skyscrapers and trays': [235, 165, -365, -10, 155, -225],
  'Sky crown cultural hall and heliport': [265, 298, -265, 15, 268, -215],
  'Inside rotunda concourse': [28, 108, -42, -18, 72, -108],
  'Inside city center workshops': [-108, 138, 22, -178, 88, 20],
  'Inside bastion apartments': [-285, 156, 205, -214, 106, 140]
};

const AF_CUTAWAY_VIEWS = {
  'Inside rotunda concourse': ['rotunda', 0],
  'Inside city center workshops': ['city_west', 0],
  'Inside bastion apartments': ['bastion_west', 2]
};

function nightSet(on) {
  NIGHT = !!on;
  if (typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock) {
    KHOST.host.clock.set(NIGHT ? 0.5 : 10.25);
  }
}

function cutSet(on) {
  if (typeof KHOST === 'undefined' || !KHOST.cut) return;
  if (!on) KHOST.cut.off();
  else KHOST.cut.to('rotunda', 0);
}

KHOST.on(SKY.view, 'view');

{
  const doorTip = KDOORHOST.tip(() => camera.position, () => !!(KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk));
  TICKS.push(function stepAfDoors(dt) {
    KDOORHOST.tick(dt == null ? 0.016 : dt);
    doorTip();
  });
}

function cleanCheckName(s) {
  return String(s).replace(/[:'\\/*?"<>|]/g, '-');
}

function afChecks() {
  const R = [];
  AF_RULES.checks(AF_PLAN, AF_INT_HOST.built, AF_INT_HOST.area).forEach(c => {
    R.push({ name: cleanCheckName('layout - ' + c.name), ok: !!c.pass, detail: c.detail });
  });

  const TA = AF_TAGS.audit();
  R.push({
    name: 'tags-vocabulary',
    ok: TA.unknown === 0 && TA.missingCulture === 0 && TA.missingTypes === 0,
    detail: TA.records + ' records, unknown ' + TA.unknown + ', missingCulture ' + TA.missingCulture + ', missingTypes ' + TA.missingTypes
  });

  const fu = AF_INT_HOST.furnSummary();
  const miss = Object.keys(fu.missing || {});
  const minFurn = AF_STATE === 'ruined' ? 0 : 4000;
  R.push({
    name: 'furniture-keys-and-placement',
    ok: miss.length === 0 && fu.placed >= minFurn,
    detail: miss.length ? ('missing keys ' + miss.join(', ')) : (fu.placed + ' pieces placed across ' + fu.keys + ' catalog keys (' + AF_INT_HOST.getSocket() + ')')
  });

  const wp = WATER.checkPrograms ? WATER.checkPrograms(renderer, scene) : [];
  R.push({
    name: 'water-programs-linked',
    ok: wp.length === 0,
    detail: wp.length ? wp.join('; ') : 'all 4 core/water surface kinds linked cleanly'
  });

  const da = AF_INT_HOST.doorsAudit();
  R.push({
    name: 'doors-valid',
    ok: da.bad.length === 0 && da.doors >= 6,
    detail: da.doors + ' doors (' + da.locked + ' locked)'
  });

  const rr = KRUINS.report();
  const rBad = rr.filter(x => !x.ok);
  R.push({
    name: 'ruins-seated',
    ok: rr.length >= 1 && rBad.length === 0,
    detail: rBad.length ? rBad.map(x => x.name + ' ' + x.detail).join('; ') : rr.map(x => x.name + ' ok').join(', ')
  });

  const sp = AF_INT_HOST.simPlaces();
  const acts = new Set(sp.map(p => p.activity));
  const simOk = AF_STATE === 'ruined' ? sp.length >= 1 : (sp.length >= 40 && acts.has('SLEEP') && acts.has('WORK') && acts.has('LEISURE'));
  R.push({
    name: 'sim-places-ready',
    ok: simOk,
    detail: sp.length + ' simulation places (' + Array.from(acts).join(', ') + ')'
  });

  const HL = ARCOFORTE.HULL;
  const hullOk = !!(HL && HL.span === 576 && HL.H === 300 && HL.toe(0) === -242 && HL.waterlineZ(0) === -334 &&
    HL.plinth && HL.plinth.rAt(84) === 288 && HL.plinth.rAt(144) === 264);
  R.push({
    name: 'hull-descriptor-curves',
    ok: hullOk,
    detail: HL ? ('span ' + HL.span + ' m, H ' + HL.H + ' m, toe(0) ' + HL.toe(0) + ', rAt(84..144) ' + HL.plinth.rAt(84) + '->' + HL.plinth.rAt(144)) : 'missing'
  });

  /* Verify synthetic rock PRNG isolation: toggling opts.noTerrain leaves the megastructure PRNG stream identical */
  const mWith = AF_STAGE.buildRockTerrain({ noTerrain: false });
  const rWith = [rng(), rng(), rng()];
  if (mWith && mWith.geometry) mWith.geometry.dispose();
  AF_STAGE.buildRockTerrain({ noTerrain: true });
  const rNo = [rng(), rng(), rng()];
  const prngIso = rWith[0] === rNo[0] && rWith[1] === rNo[1] && rWith[2] === rNo[2];
  R.push({
    name: 'no-terrain-prng-isolation',
    ok: prngIso,
    detail: 'post-rock rng ' + rWith[0].toFixed(6) + ' vs noTerrain ' + rNo[0].toFixed(6)
  });

  return R;
}

function afNegatives() {
  const R = [];
  const brokenTower = JSON.parse(JSON.stringify(AF_PLAN));
  brokenTower.towers[3].yTop = 210;
  const tCheck = AF_RULES.checks(brokenTower, AF_INT_HOST.built, AF_INT_HOST.area).find(c => /skyscrapers/.test(c.name));
  R.push({ name: 'shortened-tower-fails-crown-rule', ok: !!(tCheck && !tCheck.pass), detail: tCheck ? tCheck.detail : 'missing' });

  const brokenWalk = JSON.parse(JSON.stringify(AF_PLAN));
  brokenWalk.links = brokenWalk.links.filter(e => e[0] !== 'af.linear.drum.0' && e[1] !== 'af.linear.drum.0');
  const wCheck = AF_RULES.checks(brokenWalk, AF_INT_HOST.built, AF_INT_HOST.area).find(c => /reachable/.test(c.name));
  R.push({ name: 'severed-throat-fails-walk-rule', ok: !!(wCheck && !wCheck.pass), detail: wCheck ? wCheck.detail : 'missing' });

  const brokenWater = JSON.parse(JSON.stringify(AF_PLAN));
  brokenWater.ways.find(w => w.id === 'af.way.stream').pts[2][2] = 95;
  const wtCheck = AF_RULES.checks(brokenWater, AF_INT_HOST.built, AF_INT_HOST.area).find(c => /waterways/.test(c.name));
  R.push({ name: 'uphill-canal-fails-water-rule', ok: !!(wtCheck && !wtCheck.pass), detail: wtCheck ? wtCheck.detail : 'missing' });

  const st = KRUINS.selfTest();
  R.push({ name: 'ruins-self-test-catches-floating-and-buried', ok: !!st.ok, detail: st.detail });
  return R;
}

const stateCtrl = {
  id: 'af-state-sel',
  select: [
    ['refurbished', 'State - Refurbished'],
    ['intact', 'State - Intact Ancient'],
    ['ruined', 'State - Unreclaimed Ruin']
  ],
  on: v => {
    const u = new URL(location.href);
    u.searchParams.set('state', v);
    location.href = u.toString();
  }
};

const socketCtrl = {
  id: 'af-socket-sel',
  select: Object.keys(AF_INT.SOCKETS).map(k => [k, 'Culture - ' + AF_INT.SOCKETS[k].label]),
  on: v => AF_INT_HOST.socket(v)
};

window._build = {
  state: AF_STATE,
  socket: AF_INT_HOST.getSocket(),
  parts: AF_PLAN.parts.length,
  archTris: Math.round(AF_DRAWN.archTris),
  archMeshes: AF_DRAWN.archMeshes,
  cutawayUnits: AF_INT_HOST.cutawayUnits.length,
  furnPlaced: AF_INT_HOST.furnSummary().placed,
  grossM2: AF_INT_HOST.area.grossM2,
  peakPopulation: AF_INT_HOST.area.peakPopulation,
  refurbishedPopulation: AF_INT_HOST.area.refurbishedPopulation
};

KHOST.take(KHOST.standard({
  build: 'arcoforte',
  title: 'Arcoforte — Sea-Cliff Arcology',
  hint: 'Inspired by Paolo Soleri\'s Arcoforte: multilevel boat-lift harbour & NW marina, sub-cliff fishing works & sealed automated vaults, 7 sea-cliff skyscrapers & 300 m Sky-Crown, fluted Domed Rotunda, 9-bastion Horseshoe Neocliff with 13 oculus skylights & 6 mushroom-pier belvederes, sheltered Central Park & Southern Linear City. Press X to open interiors ([ / ] storey), E for doors, F to walk.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: (x, z) => AF_STAGE.ground(x, z),
  floor: (x, z) => {
    const wh = WATER.heightAt(x, z, 0);
    const gh = AF_STAGE.ground(x, z);
    return wh != null && wh > gh ? wh : gh;
  },
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.8,
  minR: 3,
  maxR: 6500,
  registry: REG,
  views: VIEWS,
  onView: vn => {
    if (typeof KHOST === 'undefined' || !KHOST.cut) return;
    const cv = AF_CUTAWAY_VIEWS[vn];
    if (cv) KHOST.cut.to(cv[0], cv[1]);
    else if (KHOST.cut.on) KHOST.cut.off();
  },
  ticks: TICKS,
  clock: { hour: 10.25 },
  draw: SKY.draw,
  controls: [stateCtrl, socketCtrl],
  std: {
    door: () => KDOORHOST.toggleNear(camera.position, !!(KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk)),
    night: { on: () => nightSet(!NIGHT), state: () => NIGHT }
  },
  cutaway: {
    units: AF_INT_HOST.cutawayUnits,
    cutAt: 2.3,
    margin: 2.5,
    show: AF_INT_HOST.showUnit,
    bar: AF_INT_HOST.barText
  },
  records: () => AF_TAGS.query({}),
  stats: () => {
    const fu = AF_INT_HOST.furnSummary();
    return 'state ' + AF_STATE + ' (' + AF_INT_HOST.getSocket() + ')\n' +
      'parts ' + AF_PLAN.parts.length + ' · furn ' + fu.placed + '\n' +
      'pop ~' + AF_INT_HOST.area.refurbishedPopulation + ' / ' + AF_INT_HOST.area.peakPopulation;
  },
  minimap: { title: 'Arcoforte' },
  exporters: {
    tags: () => AF_TAGS.export(),
    places: () => AF_INT_HOST.simPlaces(),
    doors: () => KDOOR.export(),
    water: () => WATER.export()
  },
  budget: {
    showcase: { tris: 2500000, calls: 600 },
    cls: {},
    type: {}
  },
  api: {
    hostChecks: afChecks,
    hostNegatives: afNegatives,
    hull: () => ARCOFORTE.HULL,
    arcoforte: () => ({
      plan: AF_PLAN,
      hull: ARCOFORTE.HULL,
      area: AF_INT_HOST.area,
      furnish: AF_INT_HOST.furnSummary(),
      socket: AF_INT_HOST.getSocket(),
      simPlaces: AF_INT_HOST.simPlaces()
    }),
    socket: c => AF_INT_HOST.socket(c)
  }
}));

if (stateCtrl.el) stateCtrl.el.value = AF_STATE;
if (socketCtrl.el) socketCtrl.el.value = AF_INT_HOST.getSocket();
