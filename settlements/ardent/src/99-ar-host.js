/* ================================================================= ARDENT — KHOST Takeover, Preset Views & Runtime Audits
   [web] Hands Ardent to core/host (KHOST.take) with dynamic camera depth scaling (depth: true -> zero cobble z-fighting at
   any distance), 8 preset camera views (zero apostrophes or colons: item 30 VIEW-NAME), day/night hearth-and-forge switching,
   cutaway/section integration, and hostChecks / hostNegatives. */
const VIEWS = (function () {
  const L = AR_LAYOUT.plan;
  const G = AR_GROUND;
  const eyeY = function (x, z, lift) {
    const d = KDRAWN.h(x, z);
    const g = G.h(x, z);
    return Math.max(d == null ? g : d, g) + lift;
  };
  const tc = G.thingCrag;
  const sq0 = (L.plazas && L.plazas[0]) ? L.plazas[0] : { x0: -24, z0: -28, x1: 24, z1: 20 };
  const tx0 = 0.5 * (sq0.x0 + sq0.x1);
  const tz0 = 0.5 * (sq0.z0 + sq0.z1);
  const sq1 = (L.plazas && L.plazas[1]) ? L.plazas[1] : { x0: -140, z0: -195, x1: -95, z1: -155 };
  const cdx = 0.5 * (sq1.x0 + sq1.x1);
  const cdz = 0.5 * (sq1.z0 + sq1.z1);
  const ge = (L.gates && L.gates['u+']) ? L.gates['u+'] : [250, 0];
  const gn = (L.gates && L.gates['v-']) ? L.gates['v-'] : [0, -250];
  const bzC = G.burnZ(gn[0]);

  return {
    'Overview': [-395, eyeY(-395, 430, 260), 430, 0, G.h(0, -10) + 12, -10],
    'Walled gate and ramparts': [ge[0] + 64, eyeY(ge[0] + 64, ge[1] + 50, 22), ge[1] + 50, ge[0] - 8, G.h(ge[0], ge[1]) + 9, ge[1] - 6],
    'High Wynd cobbles': [tx0 - 54, eyeY(tx0 - 54, tz0 + 1, 2.3), tz0 + 1, tx0, G.h(tx0, tz0) + 6.5, tz0 - 2],
    'Tolbooth and dueling ring': [tx0 + 23, eyeY(tx0 + 23, tz0 + 20, 11.5), tz0 + 20, tx0, G.h(tx0, tz0 - 14) + 8.5, tz0 - 14],
    'Capital scotch maltings': [cdx + 22, eyeY(cdx + 22, cdz + 20, 11.5), cdz + 20, cdx, G.h(cdx, cdz - 10) + 9.0, cdz - 10],
    'Thing-Crag and koshki': [-44, eyeY(-44, tc.z - 54, 25), tc.z - 54, tc.x + 4, G.h(tc.x, tc.z) + 8.5, tc.z + 20],
    'Clan scotch distilleries': [-134, eyeY(-134, tc.z - 22, 18), tc.z - 22, -88, G.h(-88, tc.z - 6) + 9.0, tc.z - 6],
    'Bronze foundry and brig': [gn[0] - 46, eyeY(gn[0] - 46, bzC + 44, 19), bzC + 44, 26, G.h(26, -358) + 6.5, -358],
    'Silk-Trail muster green': [332, eyeY(332, 82, 21), 82, 412, G.h(412, 2) + 4.0, 2],
    'Night hearths and forges': [tx0 + 24, eyeY(tx0 + 24, tz0 + 21, 12.0), tz0 + 21, tx0, G.h(tx0, tz0 - 14) + 8.0, tz0 - 14]
  };
})();

KHOST.on(SKY.view, 'view');

function arOnView(name) {
  const hc = KHOST.host && KHOST.host.clock ? KHOST.host.clock : null;
  if (!hc) return;
  if (name === 'Night hearths and forges') {
    hc.day = 0;
    hc.set(1.1);
    NIGHT = true;
    window.HL_HOUR = 1.1;
  } else {
    hc.day = 0;
    hc.set(10.6);
    NIGHT = false;
    window.HL_HOUR = 10.6;
  }
  if (typeof hlSetHands === 'function') hlSetHands();
  SKY.view(0);
}

function ardentChecks() {
  const L = AR_LAYOUT.plan;
  const R = [];
  const rules = AR_RULES.checks(L);
  for (let i = 0; i < rules.length; i++) {
    const c = rules[i];
    R.push({ name: 'layout: ' + c.name, ok: !!c.pass, detail: String(c.detail || '').trim() });
  }
  const totalExpected = L.structures.length + L.walls.length + L.oreNodes.length + L.camps.length;
  R.push({
    name: 'every structure, curtain wall, copper/tin ore node and Silk-Trail camp placed',
    ok: AR_PLACE.missing.length === 0 && AR_PLACE.placed.length === totalExpected,
    detail: AR_PLACE.placed.length + ' placed of ' + totalExpected +
      (AR_PLACE.missing.length ? '; missing: ' + AR_PLACE.missing.join(', ') : '') +
      ' (' + AR_PLACE.ms + ' ms)'
  });
  R.push({
    name: 'terrain-draped MAT.cobble street ribbons and plazas drawn without VBOX clipping',
    ok: !!(AR_PLACE.cobbleMesh && AR_PLACE.cobbleMesh.parent === scene && AR_PLACE.cobbleMesh.geometry.index.count > 600),
    detail: AR_PLACE.cobbleMesh ? (AR_PLACE.cobbleMesh.geometry.index.count / 3) + ' draped cobble tris' : 'missing'
  });
  R.push({
    name: 'Ardent Burn flowing ribbon drawn via WATER.drawFlow',
    ok: !!(AR_PLACE.burn && AR_PLACE.burn.mesh && AR_PLACE.burn.mesh.parent === scene),
    detail: AR_PLACE.burn && AR_PLACE.burn.ribbon ? AR_PLACE.burn.ribbon.rows + ' flow rows' : 'missing'
  });
  const A = AR_PLACE.tags.audit();
  R.push({
    name: 'tags: known vocabulary and culture on every registered record',
    ok: A.unknown === 0 && A.missingCulture === 0 && A.records >= totalExpected,
    detail: A.records + ' records, unknown ' + A.unknown + ', missingCulture ' + A.missingCulture
  });
  return R;
}

function ardentNegatives() {
  const base = AR_LAYOUT.make();
  const R = [];

  /* 1. Injecting a Republican building must fail rusticOnlyCheck */
  const badRep = AR_LAYOUT.make();
  badRep.structures[0] = Object.assign({}, badRep.structures[0], { key: 'hl_rep_hall', branch: 'republican' });
  R.push({
    name: 'Republican building on Ardent fails rusticOnlyCheck',
    ok: AR_RULES.rusticOnlyCheck(base).pass && !AR_RULES.rusticOnlyCheck(badRep).pass
  });

  /* 2. Pulling a curtain-wall span back by 1.2 m from its gate/tower node must fail walledCapitalCheck */
  const badWall = AR_LAYOUT.make();
  const seg0 = badWall.walls.find(function (w) { return w.key === 'hl_rus_burgh_wall' && w.segIdx === 0; });
  if (seg0) {
    const nA = badWall.walls.find(function (w) { return w.id === seg0.nodeA; });
    const dx = seg0.x - nA.x, dz = seg0.z - nA.z, dL = Math.hypot(dx, dz) || 1;
    seg0.w -= 1.2;
    seg0.x += (dx / dL) * 0.6;
    seg0.z += (dz / dL) * 0.6;
  }
  R.push({
    name: '1.2 m curtain-wall socket gap fails walledCapitalCheck',
    ok: AR_RULES.walledCapitalCheck(base).pass && !AR_RULES.walledCapitalCheck(badWall).pass
  });

  /* 3. Moving an ore node >400 m from its mine must fail bronzeOreCheck */
  const badOre = AR_LAYOUT.make();
  badOre.oreNodes[0] = Object.assign({}, badOre.oreNodes[0], { mineDistM: 485 });
  R.push({
    name: 'ore node >400 m from mine fails bronzeOreCheck',
    ok: AR_RULES.bronzeOreCheck(base).pass && !AR_RULES.bronzeOreCheck(badOre).pass
  });

  /* 4. Unpaid Silk-Trail free-company (>14 days arrears) turns its bronze disc to BF-04 broken_kin_reiver */
  const paidSt = AR_RULES.evaluateBandState({ unpaidDays: 0, silkCaravanIndex: 0.75, harvestIndex: 0.70 });
  const unpaidSt = AR_RULES.evaluateBandState({ unpaidDays: 19, silkCaravanIndex: 0.75, harvestIndex: 0.70 });
  const famineSt = AR_RULES.evaluateBandState({ unpaidDays: 0, silkCaravanIndex: 0.18, harvestIndex: 0.25 });
  R.push({
    name: 'unpaid >14d or Silk-Trail bust + bad harvest flips MC-06 escort to BF-04 Broken-Kin reiver',
    ok: paidSt.code === 'MC-06' && !paidSt.discTurned &&
        unpaidSt.code === 'BF-04' && unpaidSt.discTurned &&
        famineSt.code === 'BF-04' && famineSt.discTurned
  });

  /* 5. Removing one of the Three Clan-Seat Great Whiskey/Scotch Distilleries must fail clanDistilleryAndPolityCheck */
  const badDist = AR_LAYOUT.make();
  badDist.structures = badDist.structures.filter(function (s) { return s.id !== 'ar.clan_distillery.1'; });
  R.push({
    name: 'dropping a Clan-Seat Great Scotch Distillery fails clanDistilleryAndPolityCheck',
    ok: AR_RULES.clanDistilleryAndPolityCheck(base).pass && !AR_RULES.clanDistilleryAndPolityCheck(badDist).pass
  });

  return R;
}

KHOST.take({
  build: 'ardent',
  title: 'Ardent',
  hint: 'Ardent (px 830, 553; +2,801.9 m ASL): Walled narrow-cobbled capital of the Free Clans (42,668 km2 across FC1-FC4), Clanthing seat of the Nine Clans, Silk-Trail free-company muster, and home of the Three Chartered Clan-Seat Great Scotch & Highland Whiskey Distilleries (settlements/ardent/PLAN.md; core/region/FREE-CLANS-SCOPE.md). Enclosed by battered Highland-Caucasus granite curtain walls, Svaneti-Baronial watchtowers, octagonal pepperpot corner bastions and four twin-koshki gatehouses; inside, Scottish Baronial crow-stepped gables and pend closes meet Old Tbilisi overhanging wooden aivani balconies, Doig double-pagoda malt kilns, a Georgian darbazi Law-Hall and cast tin-bronze bells and field guns. Zero electric light.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: function (x, z) { return AR_GROUND.h(x, z); },
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  depth: true,
  clear: 1.7,
  minR: 2,
  maxR: 12000,
  registry: REG,
  views: VIEWS,
  onView: arOnView,
  start: 'Overview',
  ticks: TICKS,
  clock: { hour: 10.6 },
  draw: SKY.draw,
  records: function () { return AR_PLACE.tags.query({}); },
  stats: function () {
    return 'inst ' + (window._instances == null ? 0 : window._instances) +
      '\nplaced ' + AR_PLACE.placed.length +
      '\nclans ' + AR_LAYOUT.plan.census.clans + ' / pop ' + AR_LAYOUT.plan.census.onScreenPop;
  },
  minimap: { title: 'Ardent (+2,802 m)' },
  cutaway: typeof hlfUnits === 'function' ? { units: hlfUnits(HLF, VERN.defs), band: true, section: true } : null,
  budget: { showcase: { tris: 4000000, calls: 900 }, cls: {}, type: {} },
  api: {
    view: function (k) { return KHOST.go(k); },
    hostChecks: ardentChecks,
    hostNegatives: ardentNegatives,
    evaluateBandState: AR_RULES.evaluateBandState,
    ardent: function () {
      return {
        pin: AR_LAYOUT.plan.pin,
        census: AR_LAYOUT.plan.census,
        clans: AR_LAYOUT.plan.clans.length,
        greatDistilleries: AR_LAYOUT.plan.clanDistilleries.length,
        polityKm2: AR_LAYOUT.plan.polityScope.totalDryKm2,
        placed: AR_PLACE.placed.length,
        missing: AR_PLACE.missing,
        ms: AR_PLACE.ms
      };
    }
  }
});
