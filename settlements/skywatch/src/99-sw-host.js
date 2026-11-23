// ================================================================= SKYWATCH — KHOST Takeover, Preset Views & Runtime Audits
// [web] Hands Skywatch to core/host (KHOST.take) with 10 preset camera views (zero apostrophes or colons: item 30 VIEW-NAME),
// clock/sky switching for Solstice sightline and Night beacons, cutaway/section integration, and hostChecks / hostNegatives.
const VIEWS = (function () {
  const L = SW_LAYOUT.plan;
  const G = SW_GROUND;
  const eyeY = function (x, z, lift) {
    const d = KDRAWN.h(x, z);
    const g = G.h(x, z);
    return Math.max(d == null ? g : d, g) + lift;
  };

  /* Solstice sightline camera sits on the open Sanctuary Meridian Court just behind the alidade, sighting Az 242.17 deg */
  const sol = L.solstice;
  const cs = Math.cos(sol.ry);
  const ss = Math.sin(sol.ry);
  const sancRec = L.structures.find(function (r) { return r.id === sol.sanctuaryId; });
  const solEyeX = sancRec.x + ss * (-7.8);
  const solEyeZ = sancRec.z + cs * (-7.8);
  const solEyeY = sancRec.y + 5.2 + 2.4;
  const solTarX = sancRec.x + ss * 120.0;
  const solTarZ = sancRec.z + cs * 120.0;
  const solTarY = solEyeY + 127.8 * Math.tan(sol.altitudeDeg * Math.PI / 180);

  const c0 = L.cisterns[0];
  const moot = L.moot;
  const nneRad = 22.5 * Math.PI / 180;
  const nneDx = Math.sin(nneRad);
  const nneDz = -Math.cos(nneRad);
  const nneDist = 9000;

  return {
    'Overview': [420, eyeY(420, 540, 260), 540, -35, G.h(-35, -110) + 10, -110],
    'Observatory crag': [-468, eyeY(-468, -158, 42), -158, -608, G.h(-608, -288) + 12, -288],
    'Solstice sightline': [solEyeX, solEyeY, solEyeZ, solTarX, solTarY, solTarZ],
    'Pass gate and town': [-88, eyeY(-88, 258, 52), 258, 12, G.h(12, -55) + 6, -55],
    'Step cisterns': [c0.x, c0.rimY + 7.2, c0.z - 22.5, c0.x, c0.waterY + 0.6, c0.z + 2.5],
    'Convoy caravanserai': [342, eyeY(342, 318, 46), 318, 505, G.h(505, 210) + 8, 210],
    'Skarn brass works': [565, eyeY(565, -75, 48), -75, 725, G.h(725, -215) + 7, -215],
    'The Silent Moot': [moot.x - 42, eyeY(moot.x - 42, moot.z + 36, 17), moot.z + 36, moot.x + 4, G.h(moot.x, moot.z) + 2.6, moot.z - 4],
    'NNE vista': [-550, eyeY(-550, -264, 5.4), -264, -550 + nneDx * nneDist, G.h(-550, -264) - 65, -264 + nneDz * nneDist],
    'Night beacons': [-435, eyeY(-435, 505, 34), 505, G.beaconSouth.x, G.h(G.beaconSouth.x, G.beaconSouth.z) + 16, G.beaconSouth.z]
  };
})();

KHOST.on(SKY.view, 'view');

let swSolClock = null;
function resolveAtmosSolsticeClock() {
  if (swSolClock) return swSolClock;
  const target = SW_LAYOUT.plan.solar.sunDir;
  const tx = target[0];
  const ty = target[1];
  const tz = target[2];
  const site = ATMOS.skySite || ATMOS.siteAt(SW_MODEL.px, SW_MODEL.py);
  let bestDot = -2;
  let bestDay = 91;
  let bestHour = 19.0;
  for (let d = 0; d < 365; d += 5) {
    for (let h = 15.0; h <= 21.5; h += 0.25) {
      const sd = ATMOS.skyState(site, h, d).sunDir;
      const dot = sd[0] * tx + sd[1] * ty + sd[2] * tz;
      if (dot > bestDot) {
        bestDot = dot;
        bestDay = d;
        bestHour = h;
      }
    }
  }
  const d0 = bestDay;
  const h0 = bestHour;
  for (let dd = -4; dd <= 4; dd += 1) {
    const dc = (d0 + dd + 365) % 365;
    for (let dh = -0.30; dh <= 0.30; dh += 0.02) {
      const sd = ATMOS.skyState(site, h0 + dh, dc).sunDir;
      const dot = sd[0] * tx + sd[1] * ty + sd[2] * tz;
      if (dot > bestDot) {
        bestDot = dot;
        bestDay = dc;
        bestHour = h0 + dh;
      }
    }
  }
  swSolClock = { day: bestDay, hour: bestHour };
  return swSolClock;
}

function swOnView(name) {
  const hc = KHOST.host && KHOST.host.clock ? KHOST.host.clock : null;
  if (!hc) return;
  if (name === 'Night beacons') {
    hc.day = 0;
    hc.set(1.1);
    NIGHT = true;
  } else if (name === 'Solstice sightline') {
    const sc = resolveAtmosSolsticeClock();
    hc.day = sc.day;
    hc.set(sc.hour);
    NIGHT = false;
  } else {
    hc.day = 0;
    hc.set(11.2);
    NIGHT = false;
  }
  SKY.view(0);
}

function skywatchChecks() {
  const L = SW_LAYOUT.plan;
  const R = [];
  const rules = SW_RULES.checks(L);
  for (let i = 0; i < rules.length; i++) {
    const c = rules[i];
    R.push({ name: 'layout: ' + c.name, ok: !!c.pass, detail: String(c.detail || '').trim() });
  }
  const totalExpected = L.structures.length + L.walls.length + L.oreNodes.length;
  R.push({
    name: 'every structure, wall and skarn node placed',
    ok: SW_PLACE.missing.length === 0 && SW_PLACE.placed.length === totalExpected,
    detail: SW_PLACE.placed.length + ' placed of ' + totalExpected +
      (SW_PLACE.missing.length ? '; missing: ' + SW_PLACE.missing.join(', ') : '') +
      ' (' + SW_PLACE.ms + ' ms)'
  });
  R.push({
    name: 'still water drawn in both vaulted step-cisterns',
    ok: SW_PLACE.still.length === 2,
    detail: SW_PLACE.still.length + ' WATER.drawStill surfaces'
  });
  const A = SW_PLACE.tags.audit();
  R.push({
    name: 'tags: known vocabulary and culture on every building',
    ok: A.unknown === 0 && A.missingCulture === 0 && A.records >= totalExpected,
    detail: A.records + ' records, unknown ' + A.unknown + ', missingCulture ' + A.missingCulture
  });
  return R;
}

function skywatchNegatives() {
  const base = SW_LAYOUT.make();
  const R = [];

  /* 1. Flooding cistern water above rim must fail cisternCheck */
  const badC = SW_LAYOUT.make();
  badC.cisterns = JSON.parse(JSON.stringify(badC.cisterns));
  badC.cisterns[0].waterY = badC.cisterns[0].rimY + 0.5;
  R.push({
    name: 'cistern water above rim fails cisternCheck',
    ok: SW_RULES.cisternCheck(base).pass && !SW_RULES.cisternCheck(badC).pass
  });

  /* 2. Shifting Solstice Sanctuary arch off-axis must fail solsticeCheck */
  const badS = SW_LAYOUT.make();
  badS.solstice = Object.assign({}, badS.solstice, {
    archCenter: [badS.solstice.archCenter[0] + 15, badS.solstice.archCenter[1], badS.solstice.archCenter[2] + 15]
  });
  R.push({
    name: 'off-axis Solstice arch fails solsticeCheck',
    ok: SW_RULES.solsticeCheck(base).pass && !SW_RULES.solsticeCheck(badS).pass
  });

  /* 3. Painted-Men totem culture on Silent Moot must fail mootCheck */
  const badM = SW_LAYOUT.make();
  badM.moot.monoliths[0].culture = 'painted';
  R.push({
    name: 'Painted-Men totem culture on Silent Moot fails mootCheck',
    ok: SW_RULES.mootCheck(base).pass && !SW_RULES.mootCheck(badM).pass
  });

  /* 4. 0.5 m planar gap at curtain wall-to-tower join must fail wallTowerJoins */
  const badW = SW_LAYOUT.make();
  const seg0 = badW.walls.find(function (w) { return w.id === 'sw.wall.seg.0.3'; });
  const segPrev = badW.walls.find(function (w) { return w.id === 'sw.wall.seg.0.2'; });
  const tw1 = badW.walls.find(function (w) { return w.id === 'sw.wall.tower.1'; });
  if (seg0 && segPrev && tw1) {
    const dL0 = Math.hypot(tw1.x - segPrev.x, tw1.z - segPrev.z);
    const dL = dL0 > 1e-6 ? dL0 : 1;
    const ux = (tw1.x - segPrev.x) / dL;
    const uz = (tw1.z - segPrev.z) / dL;
    const pullBack = 1.10;
    seg0.w -= pullBack;
    seg0.x -= ux * (pullBack * 0.5);
    seg0.z -= uz * (pullBack * 0.5);
  }
  R.push({
    name: '0.5 m wall-to-tower gap fails wallTowerJoins',
    ok: SW_RULES.wallTowerJoins(base).pass && !SW_RULES.wallTowerJoins(badW).pass
  });

  return R;
}

KHOST.take({
  build: 'skywatch',
  title: 'Skywatch',
  hint: 'Skywatch (px 776, 470; +3,745.5 m ASL): Jimjam northern astronomical observatory, skarn-brass pass citadel and silent-barter moot with the Sasquatch (settlements/skywatch/PLAN.md). Tier I: WNW basalt crag (+3,817 m), Rajas Eye dome, Solstice Sanctuary and heliograph beacons. Tier II: KCITY walled switchback town and vaulted step-cisterns. Tier III: Leeward caravanserai, halite vaults, salvage assay yard and KCAMP convoys. Tier IV: Copper-zinc skarn adits and katabatic wind-furnaces. Tier V: The Silent Moot (13 monoliths) and 1.35x Sasquatch equinox camps.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: function (x, z) { return SW_GROUND.h(x, z); },
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.7,
  minR: 2,
  maxR: 12000,
  registry: REG,
  views: VIEWS,
  onView: swOnView,
  start: 'Overview',
  ticks: TICKS,
  clock: { hour: 11.2 },
  draw: SKY.draw,
  records: function () { return SW_PLACE.tags.query({}); },
  stats: function () {
    return 'inst ' + (window._instances == null ? 0 : window._instances) +
      '\nplaced ' + SW_PLACE.placed.length +
      '\npop ' + SW_LAYOUT.plan.census.permanent;
  },
  minimap: { title: 'Skywatch (+3,745 m)' },
  cutaway: typeof hlfUnits === 'function' ? { units: hlfUnits(HLF, VERN.defs), band: true, section: true } : null,
  budget: { showcase: { tris: 4000000, calls: 900 }, cls: {}, type: {} },
  api: {
    view: function (k) { return KHOST.go(k); },
    hostChecks: skywatchChecks,
    hostNegatives: skywatchNegatives,
    solsticeCheck: function () { return SW_RULES.solsticeCheck(SW_LAYOUT.plan); },
    horizonCheck: function () { return SW_RULES.horizonCheck(SW_LAYOUT.plan); },
    wallPlaced: function () { return SW_PLACE.wallPlaced; },
    skywatch: function () {
      return {
        pin: SW_LAYOUT.plan.pin,
        census: SW_LAYOUT.plan.census,
        placed: SW_PLACE.placed.length,
        missing: SW_PLACE.missing,
        ms: SW_PLACE.ms
      };
    }
  }
});
