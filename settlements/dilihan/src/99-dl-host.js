// ================================================================= DILIHAN — KHOST Takeover, 8 Required Views & Runtime Audits
// [web] Hands Dilihan (solqo7hz7s, px 744, py 663, -888.6 m ASL) to core/host (KHOST.take) with the 8 required preset views
// (zero apostrophes or colons: VIEW-NAME), summer-solstice (-31.50 deg S) & night clock switching, and hostChecks / hostNegatives.
const VIEWS = (function () {
  const L = DL_LAYOUT.plan;
  const G = DL_GROUND;
  const eyeY = function (x, z, lift) {
    const d = KDRAWN.h(x, z);
    const g = G.h(x, z);
    return Math.max(d == null ? g : d, g) + lift;
  };

  const forumRec = L.structures.find(function (r) { return r.id === L.landmarks.forumId; });
  const templeRec = L.structures.find(function (r) { return r.id === L.landmarks.templeId; });
  const palaceRec = L.structures.find(function (r) { return r.id === L.landmarks.palaceId; });
  const seraiRec = L.structures.find(function (r) { return r.id === L.landmarks.seraiId; });

  /* Exact sanctuary observer eye & summer-solstice sunset ray along Az 245.39 deg (+4.00 deg alt) */
  const sol = L.solstice;
  const ep = sol.ephemeris;
  const solEye = sol.eyeWorld;
  const lookDist = 140.0;
  const solTar = [
    solEye[0] + ep.sunDir[0] * lookDist,
    solEye[1] + ep.sunDir[1] * lookDist,
    solEye[2] + ep.sunDir[2] * lookDist
  ];

  const forumDeckY = (forumRec ? forumRec.y : G.h(0, -60)) + 1.1;

  return {
    'Overview': [560, eyeY(560, 780, 345), 780, 35, G.h(35, -140) + 12, -140],
    'The forum at eye level': [12.0, Math.max(eyeY(12.0, -55.0, 1.85), forumDeckY + 1.85), -55.0, -175, (templeRec ? templeRec.y : G.h(-182, -72)) + 15.5, -70],
    'Summer solstice sunset': [solEye[0], Math.max(eyeY(solEye[0], solEye[2], 1.8), solEye[1]), solEye[2], solTar[0], solTar[1], solTar[2]],
    'The wall street': [257.0, eyeY(257.0, 164.0, 4.8), 164.0, 256.0, G.h(256.0, -55.0) + 6.8, -55.0],
    'The palace from the forecourt': [252.0, eyeY(252.0, 218.0, 8.2), 218.0, 260.0, (palaceRec ? palaceRec.y : G.h(260, 294)) + 13.0, 298.0],
    'The north caravanserai': [-22.0, eyeY(-22.0, -486.0, 26.0), -486.0, 72.0, (seraiRec ? seraiRec.y : G.h(66, -402)) + 9.5, -398.0],
    'The lower town and handu apron': [-456.0, eyeY(-456.0, 218.0, 48.0), 218.0, -386.0, G.h(-386.0, -65.0) + 5.0, -65.0],
    'Night': [182.0, eyeY(182.0, 148.0, 52.0), 148.0, 268.0, (palaceRec ? palaceRec.y : G.h(260, 294)) + 12.0, 298.0]
  };
})();

KHOST.on(SKY.view, 'view');

let dlCurDay = 0;
let dlCurHour = 10.8;
function dlOnView(name) {
  const hc = KHOST.host && KHOST.host.clock ? KHOST.host.clock : null;
  if (!hc) return;
  let wantDay = 0;
  let wantHour = 10.8;
  let wantNight = false;
  if (name === 'Night') {
    wantDay = 0;
    wantHour = 1.2;
    wantNight = true;
  } else if (name === 'Summer solstice sunset') {
    const ep = DL_LAYOUT.plan.solstice.ephemeris;
    wantDay = ep.dayCount;
    wantHour = ep.hour;
    wantNight = false;
  }
  const changed = (dlCurDay !== wantDay || Math.abs(dlCurHour - wantHour) > 0.005 || NIGHT !== wantNight);
  dlCurDay = wantDay;
  dlCurHour = wantHour;
  NIGHT = wantNight;
  if (changed) {
    hc.day = wantDay;
    hc.set(wantHour);
    if (DL_PLACE && DL_PLACE.night && typeof DL_PLACE.night.sync === 'function') {
      DL_PLACE.night.sync();
    }
    SKY.view(0);
  }
}

function dilihanChecks() {
  const L = DL_LAYOUT.plan;
  const R = [];
  const rules = DL_RULES.checks(L);
  for (let i = 0; i < rules.length; i++) {
    const c = rules[i];
    R.push({ name: 'layout: ' + c.name, ok: !!c.pass, detail: String(c.detail || '').trim() });
  }

  const totalExpected = L.structures.length + L.walls.length + L.oreNodes.length;
  R.push({
    name: 'every structure, wall and skarn node placed',
    ok: DL_PLACE.missing.length === 0 && DL_PLACE.placed.length === totalExpected,
    detail: DL_PLACE.placed.length + ' placed of ' + totalExpected +
      (DL_PLACE.missing.length ? '; missing: ' + DL_PLACE.missing.join(', ') : '') +
      ' (' + DL_PLACE.ms + ' ms)'
  });

  /* Runtime verification of ATMOS.skyState + JJ_TEMPLE_OBS world-space solstice portal alignment */
  let rtSolOk = false;
  let rtSolDetail = 'missing ATMOS or JJ_TEMPLE_OBS';
  if (typeof ATMOS !== 'undefined' && ATMOS.skyState && ATMOS.skySite && typeof JJ_TEMPLE_OBS !== 'undefined' && JJ_TEMPLE_OBS) {
    const ep = L.solstice.ephemeris;
    const sd = ATMOS.skyState(ATMOS.skySite, ep.hour, ep.dayCount).sunDir;
    const obs = JJ_TEMPLE_OBS;
    const dx = obs.archOrigin[0] - obs.eye[0];
    const dz = obs.archOrigin[2] - obs.eye[2];
    const denom = dx * obs.archNormal[0] + dz * obs.archNormal[2];
    const rayFwd = sd[0] * obs.archNormal[0] + sd[2] * obs.archNormal[2];
    const t = rayFwd > 1e-5 ? denom / rayFwd : -1;
    const hx = obs.eye[0] + sd[0] * t - obs.archOrigin[0];
    const hy = obs.eye[1] + sd[1] * t - obs.archOrigin[1];
    const hz = obs.eye[2] + sd[2] * t - obs.archOrigin[2];
    const u = hx * obs.archRight[0] + hz * obs.archRight[2];
    const altDeg = Math.asin(Math.max(-1, Math.min(1, sd[1]))) * 180 / Math.PI;
    rtSolOk = t > 0 && Math.abs(u) <= 1.8 && hy >= 6.0 && hy <= 13.0 && altDeg > ep.horizonAltDeg + 0.25;
    rtSolDetail = 'ATMOS sunAlt=' + altDeg.toFixed(2) + ' deg > rim ' + ep.horizonAltDeg.toFixed(2) +
      ' deg; JJ_TEMPLE_OBS portal hit u=' + u.toFixed(2) + ' m, v=' + hy.toFixed(2) + ' m';
  }
  R.push({
    name: 'runtime ATMOS + JJ_TEMPLE_OBS solstice portal ray',
    ok: rtSolOk,
    detail: rtSolDetail
  });

  R.push({
    name: 'KCONS + KCITY.constructMesh active expansion scaffolds',
    ok: DL_PLACE.construct.length >= 6,
    detail: DL_PLACE.construct.length + ' scaffolded Vernacular expansion lots'
  });

  const fSum = DL_LANDMARKS.furn.summary();
  const fMissKeys = Object.keys(fSum.missing || {});
  R.push({
    name: 'KFURN catalog furniture placed with zero missing keys',
    ok: fSum.placed >= 10 && fMissKeys.length === 0,
    detail: fSum.placed + ' catalog pieces placed, missing=' + fMissKeys.length
  });

  R.push({
    name: 'water drawn on Cut Salt Lake (-1,608 m), West-Wall spring stream & cisterns',
    ok: !!(DL_PLACE.water.lake && DL_PLACE.water.stream && DL_PLACE.water.still.length >= 4),
    detail: 'lake=1, stream=1, still=' + DL_PLACE.water.still.length
  });

  const A = DL_PLACE.tags.audit();
  R.push({
    name: 'tags: known vocabulary and culture on every record',
    ok: A.unknown === 0 && A.missingCulture === 0 && A.records >= totalExpected,
    detail: A.records + ' records, unknown ' + A.unknown + ', missingCulture ' + A.missingCulture
  });

  return R;
}

function dilihanNegatives() {
  const base = DL_LAYOUT.make();
  const R = [];

  /* 1. Unshifted ATMOS.siteAt(744, 663) 4.x refPx trap (-39.36 deg S) must fail solsticeCheck */
  const badLat = DL_LAYOUT.make();
  badLat.solstice = Object.assign({}, badLat.solstice, { ephemeris: badLat.solstice.unshiftedTrap });
  R.push({
    name: 'unshifted ATMOS.siteAt(744, 663) latitude (-39.36 deg S) fails solsticeCheck',
    ok: DL_RULES.solsticeCheck(base).pass && !DL_RULES.solsticeCheck(badLat).pass
  });

  /* 2. Shrinking Zone 3 Vernacular area to 1.4x Colonia must fail areaRatioCheck */
  const badArea = DL_LAYOUT.make();
  badArea.areas = Object.assign({}, badArea.areas, {
    vernacularPolyKm2: 0.35,
    polyRatio: 1.4,
    vernacularBuiltM2: badArea.areas.coloniaBuiltM2 * 1.4,
    builtRatio: 1.4
  });
  R.push({
    name: 'shrunk 1.4:1 Vernacular/Colonia ratio fails areaRatioCheck',
    ok: DL_RULES.areaRatioCheck(base).pass && !DL_RULES.areaRatioCheck(badArea).pass
  });

  /* 3. Unscaled jj_house_mid_c (4.00 m cornice jump) across Wall Street must fail corniceCheck */
  const badCornice = DL_LAYOUT.make();
  badCornice.wallStreetPairs = badCornice.wallStreetPairs.map(function (p, i) {
    return i === 2 ? Object.assign({}, p, { jjScale: 1.0, jjCornice: 10.65, delta: 4.00 }) : p;
  });
  R.push({
    name: 'unscaled 4.00 m Wall-Street cornice jump fails corniceCheck',
    ok: DL_RULES.corniceCheck(base).pass && !DL_RULES.corniceCheck(badCornice).pass
  });

  /* 4. Dropping the round kitchen pavilion from govpalace must fail palaceCheck */
  const badPal = DL_LAYOUT.make();
  badPal.palace = Object.assign({}, badPal.palace, { pavilions: badPal.palace.pavilions.slice(0, 6) });
  R.push({
    name: 'dropping 7th chhatri pavilion fails palaceCheck',
    ok: DL_RULES.palaceCheck(base).pass && !DL_RULES.palaceCheck(badPal).pass
  });

  return R;
}

KHOST.take({
  build: 'dilihan',
  title: 'Dilihan',
  hint: 'Dilihan / Dellu-Handu (pin solqo7hz7s, px 744, py 663; -888.6 m ASL, 1.79 atm): Premiere Izani Veterans Settlement on the Southern Bench of the Cut (settlements/dilihan/PLAN.md). Zone 1: Walled 500x500 m Jimjam brick-and-marble Colonia, raised contact-marble Forum & re-aimed Solstice Temple (-31.50 deg S sunset at +4.00 deg above the +3.58 deg SW Cut rim). Zone 2: Governor Palace (banded brick, contact-marble podium, gold onion dome w/ Cut signal lantern, 7 chhatri pavilions, Iziz orange restricted to banners/gate/reveals). Zone 3: 4x Iziz Vernacular terraces (90% IZV / 10% JJ), matched Wall-Street cornices, bronze/tin skarn foundries, Quiet-Copy workshops, North Caravanserai & KCONS scaffolds. Zone 4: Lower Town (-923 m) customs post, walled Hykkousoi envoys house, spring bridge & Port Visas tunnel portal. Zone 5: 8 Dellu-Handu veteran hamlets, NW brickyards, NE tin/iron skarn adits & -1,608 m Cut Salt Lake D2 potash works.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: function (x, z) { return DL_GROUND.h(x, z); },
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.7,
  minR: 2,
  maxR: 15000,
  registry: REG,
  views: VIEWS,
  onView: dlOnView,
  start: 'Overview',
  ticks: TICKS,
  clock: { hour: 10.8 },
  draw: SKY.draw,
  records: function () { return DL_PLACE.tags.query({}); },
  stats: function () {
    return 'inst ' + (window._instances == null ? 0 : window._instances) +
      '\nplaced ' + DL_PLACE.placed.length +
      '\npop ' + DL_LAYOUT.plan.census.metropolitan;
  },
  minimap: { title: 'Dilihan (-889 m ASL)' },
  budget: { showcase: { tris: 4000000, calls: 900 }, cls: {}, type: {} },
  api: {
    view: function (k) { return KHOST.go(k); },
    hostChecks: dilihanChecks,
    hostNegatives: dilihanNegatives,
    solsticeCheck: function () { return DL_RULES.solsticeCheck(DL_LAYOUT.plan); },
    areaRatioCheck: function () { return DL_RULES.areaRatioCheck(DL_LAYOUT.plan); },
    corniceCheck: function () { return DL_RULES.corniceCheck(DL_LAYOUT.plan); },
    dilihan: function () {
      return {
        pin: DL_LAYOUT.plan.pin,
        census: DL_LAYOUT.plan.census,
        areas: DL_LAYOUT.plan.areas,
        placed: DL_PLACE.placed.length,
        missing: DL_PLACE.missing,
        construct: DL_PLACE.construct.length,
        ms: DL_PLACE.ms
      };
    }
  }
});
