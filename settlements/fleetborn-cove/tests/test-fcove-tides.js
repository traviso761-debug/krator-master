// node settlements/fleetborn-cove/tests/test-fcove-tides.js
// Verifies FCOVE_TIDE ([G data]) over a full 92-day tidal cycle at Fleetborn Cove (px [236, 242], slice box [226, 232, 246, 252],
// mean range 11 m): Double Dark & Double Full syzygies (45.5 d / 91 d), Week (3.5 d) & Thirteen (6.5 d) beats, all three graving
// cradles, sill slack windows, |v|^3 paktong rotors & smelt-hearth campaigns, tide-mill head/duty, White Stacks low-water causeway,
// and negative fault-injection guards.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

const KTIDE = require(path.join(ROOT, 'core/water/tide/23-core-water-tide.js'));
const FCOVE_TIDE = require(path.join(__dirname, '..', 'src/40-fcove-tide-rules.js'));

const TIDES_PATH = path.join(ROOT, 'tools/scale-model/model/data/tides.json');
const FULL_DATA = JSON.parse(fs.readFileSync(TIDES_PATH, 'utf8'));

/* Slice box [226, 232, 246, 252] via core/water/tide/tide.py, matching build.py's inlined KTIDE_DATA */
const SLICE_JSON = cp.execFileSync(
  process.env.PYTHON || 'python3',
  [path.join(ROOT, 'core/water/tide/tide.py'), '--box', '226', '232', '246', '252'],
  {encoding: 'utf8'}
);
const SLICE_DATA = JSON.parse(SLICE_JSON);

const near = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 1e-6 : eps);

const R = FCOVE_TIDE.create(SLICE_DATA, {ktide: KTIDE});
const R_FULL = FCOVE_TIDE.create(FULL_DATA, {ktide: KTIDE});

/* 0. Pure [G data] & slice equivalence */
T.ok('slice box [226,232,246,252] matches full tides.json bit-for-bit at Fleetborn Cove',
  [0, 12345, 44 * 86400 + 21600, 90 * 86400 + 43200].every(t =>
    near(R.site.level(t), R_FULL.site.level(t), 1e-12) && near(R.sillVelocity(t), R_FULL.sillVelocity(t), 1e-12)));

/* Simulate full 92-day cycle d = 0..91 (plus Double Dark epoch day -1) */
const DAYS = R.cycleSummary(0, 92);
const DAY_EPOCH = R.daySummary(-1);
T.ok('cycleSummary simulates 92 consecutive days', DAYS.length === 92 && DAYS[0].day === 0 && DAYS[91].day === 91);

const ranges = DAYS.map(x => x.range);
const minRange = Math.min(...ranges), maxRange = Math.max(...ranges);
const minLow = Math.min(...DAYS.map(x => x.lowest)), maxHigh = Math.max(...DAYS.map(x => x.highest));

T.ok('92-day range spans ~7.5 m neaps to ~14.3 m greatest springs around 11 m mean',
  minRange > 7.3 && minRange < 7.8 && maxRange > 14.2 && maxRange < 14.5,
  minRange.toFixed(3) + '..' + maxRange.toFixed(3));

T.ok('92-day extremes stay inside ~[-7.35, +7.20] m cliff zonation envelope',
  minLow > -7.4 && minLow < -7.1 && maxHigh > 7.0 && maxHigh < 7.25,
  minLow.toFixed(3) + '..' + maxHigh.toFixed(3));

/* Double Dark (~day -1 & day 90, 91 d apart) and Double Full (~day 44, ~45.5 d apart) */
const dFull = DAYS[44], dDark2 = DAYS[90];
T.ok('Double Dark (day -1 and day 90) and Double Full (day 44) hit 1.45 spring factor and >14.25 m range',
  near(DAY_EPOCH.springMax, 1.45, 0.005) && near(dFull.springMax, 1.45, 0.005) && near(dDark2.springMax, 1.45, 0.005) &&
  DAY_EPOCH.range > 14.25 && dFull.range > 14.25 && dDark2.range > 14.25,
  JSON.stringify({d_1: DAY_EPOCH.range, d44: dFull.range, d90: dDark2.range}));

const springDays = DAYS.filter(x => x.phase === 'spring');
const neapDays = DAYS.filter(x => x.phase === 'neap');
T.ok('92-day cycle contains multiple Week/Thirteen spring and neap beats',
  springDays.length >= 20 && neapDays.length >= 12,
  'springs=' + springDays.length + ' neaps=' + neapDays.length);

/* 1. Graving Cradles: cradle_deep (-3.0 m blocks, +5.6 m gate), cradle_great (+6.6 m gate), cradle_shallow (-1.0 m blocks) */
const deepOpenOnNeaps = neapDays.filter(x => x.cradles.cradle_deep.open);
const deepOpenOnSprings = springDays.filter(x => x.cradles.cradle_deep.open);
T.ok('cradle_deep (+5.6 m gate) NEVER opens on neap days and opens on spring days',
  deepOpenOnNeaps.length === 0 && deepOpenOnSprings.length >= 20,
  'neapOpen=' + deepOpenOnNeaps.length + ' springOpen=' + deepOpenOnSprings.length);

/* Verify exact [tOpen, tClose] root accuracy on every open cradle_deep window */
let badWindow = null;
for (const x of DAYS) {
  const cd = x.cradles.cradle_deep;
  for (const w of cd.windows) {
    const mid = 0.5 * (w[0] + w[1]);
    const lvMid = R.site.level(mid);
    const t0 = x.day * 86400, t1 = (x.day + 1) * 86400;
    const openAtBoundary = near(w[0], t0, 0.05) || near(R.site.level(w[0]), cd.gateLevel, 2e-3);
    const closeAtBoundary = near(w[1], t1, 0.05) || near(R.site.level(w[1]), cd.gateLevel, 2e-3);
    if (!(w[1] > w[0] && lvMid >= cd.gateLevel - 1e-4 && openAtBoundary && closeAtBoundary)) {
      badWindow = {day: x.day, w, lvMid};
      break;
    }
  }
}
T.ok('every cradle_deep [tOpen, tClose] window hits exact +5.6 m gate crossings and stays >= +5.6 m inside',
  badWindow === null, JSON.stringify(badWindow));

T.ok('careened Ark hull in cradle_deep rests on -3.0 m blocks (+2.6 m waterline) below +2.6 m and floats above +2.6 m',
  near(R.hullWaterlineY(-6.5, 'cradle_deep'), 2.6, 1e-9) &&
  near(R.hullWaterlineY(2.6, 'cradle_deep'), 2.6, 1e-9) &&
  near(R.hullWaterlineY(6.4, 'cradle_deep'), 6.4, 1e-9));

const greatOpenDays = DAYS.filter(x => x.cradles.cradle_great.open);
const midTrough1Closed = DAYS.slice(14, 30).every(x => !x.cradles.cradle_great.open);
const midTrough2Closed = DAYS.slice(66, 76).every(x => !x.cradles.cradle_great.open);
T.ok('cradle_great (>= +6.6 m) opens ONLY around Double Dark & Double Full Great Careenings, shut across mid-cycle & neaps',
  DAY_EPOCH.cradles.cradle_great.open && dFull.cradles.cradle_great.open && dDark2.cradles.cradle_great.open &&
  greatOpenDays.length >= 4 && greatOpenDays.length <= 12 && midTrough1Closed && midTrough2Closed &&
  neapDays.every(x => !x.cradles.cradle_great.open),
  'greatOpenDays=' + greatOpenDays.map(x => x.day).join(','));

T.ok('cradle_shallow (-1.0 m blocks, <= 2.2 m draft) opens on ALL 92 days (both spring and neap)',
  DAYS.every(x => x.cradles.cradle_shallow.open && x.cradles.cradle_shallow.hours > 4.0));

/* 2. The Sill Gate: reversible 5.2 m/s race, slack <= 0.65 m/s shorter at springs than neaps */
let maxFlood = 0, minEbb = 0;
for (let t = 0; t < 92 * 86400; t += 300) {
  const v = R.sillVelocity(t);
  if (v > maxFlood) maxFlood = v;
  if (v < minEbb) minEbb = v;
}
T.ok('sill race velocity reverses cleanly between strong ebb (<-4.4 m/s) and +5.2 m/s flood peak',
  maxFlood > 5.05 && maxFlood <= 5.2001 && minEbb < -4.4 && minEbb >= -5.2001,
  minEbb.toFixed(3) + '..' + maxFlood.toFixed(3));

const meanSpringSlack = springDays.reduce((a, x) => a + x.sill.slackHours, 0) / springDays.length;
const meanNeapSlack = neapDays.reduce((a, x) => a + x.sill.slackHours, 0) / neapDays.length;
const minNeapSlack = Math.min(...neapDays.map(x => x.sill.slackHours));
T.ok('sill slack windows (|v| <= 0.65 m/s) are shorter on springs than on neaps',
  meanSpringSlack < meanNeapSlack * 0.75 && dFull.sill.slackHours < minNeapSlack && dDark2.sill.slackHours < minNeapSlack,
  'meanSpring=' + meanSpringSlack.toFixed(2) + 'h vs meanNeap=' + meanNeapSlack.toFixed(2) + 'h');

/* 3. Tidal Race Rotors (|v|^3) & Paktong Smelt-Hearth Campaigns */
const springCampaigns = springDays.filter(x => x.rotors.smeltActive);
const neapCampaigns = neapDays.filter(x => x.rotors.smeltActive);
const minNeapMWh = Math.min(...neapDays.map(x => x.rotors.mwh));
const maxSpringMWh = Math.max(...springDays.map(x => x.rotors.mwh));
T.ok('paktong |v|^3 rotors yield >4x energy at springs vs neaps: active smelt campaign on springs, banked hearth on neaps',
  maxSpringMWh > 4.5 * minNeapMWh && springCampaigns.length >= 16 && neapCampaigns.length === 0 &&
  dFull.rotors.hearthState === 'campaign' && DAYS[67].rotors.hearthState === 'banked',
  'minNeap=' + minNeapMWh.toFixed(2) + ' MWh, maxSpring=' + maxSpringMWh.toFixed(2) + ' MWh');

/* 4. Impounding Basin & Tide Mill: millHead(d) === dayRange, duty higher on springs than neaps */
const millHeadsMatch = DAYS.every(x => near(R.millHead(x.day), x.range, 2e-3));
const maxNeapDuty = Math.max(...neapDays.map(x => x.mill.duty));
const minGreatSpringDuty = Math.min(DAY_EPOCH.mill.duty, dFull.mill.duty, dDark2.mill.duty);
T.ok('impounding basin fills at dayHighest and drains with H = dayRange, driving heavy stamps on springs only',
  millHeadsMatch && minGreatSpringDuty > maxNeapDuty * 1.6 &&
  dFull.mill.heavyStampsActive && neapDays.every(x => !x.mill.heavyStampsActive && x.mill.ropeWalkActive),
  'neapMaxDuty=' + maxNeapDuty + ' greatSpringMinDuty=' + minGreatSpringDuty);

/* 5. Low-Water White Stacks Causeway & Sea-Byssus Beds (level <= -6.0 m) */
const neapCausewayOpen = neapDays.filter(x => x.causeway.exposed);
const springCausewayOpen = springDays.filter(x => x.causeway.exposed);
T.ok('White Stacks causeway & byssus beds (<= -6.0 m) expose ONLY on spring ebbs and stay submerged all day on neaps',
  neapCausewayOpen.length === 0 && springCausewayOpen.length >= 18 &&
  dFull.causeway.exposed && dFull.causeway.hours > 2.0 && dDark2.causeway.exposed && dDark2.causeway.hours > 2.0,
  'neapExposed=' + neapCausewayOpen.length + ' springExposed=' + springCausewayOpen.length);

/* 6. Live snapshot(t) coherence */
const snapEbb = R.snapshot(dDark2.causeway.windows[0][0] + 1800);
const snapNeap = R.snapshot(67 * 86400 + 43200);
T.ok('snapshot(t) reports coherent live cradle, sill, rotor, mill and causeway state',
  snapEbb.causeway.exposed === true && snapEbb.rotors.hearthState === 'campaign' &&
  snapNeap.causeway.exposed === false && snapNeap.rotors.hearthState === 'banked' &&
  snapNeap.cradleDays.cradle_deep.open === false && snapNeap.cradleDays.cradle_shallow.open === true);

/* 7. Negative fault-injection tests (T.neg: fails on faulty input, passes on fixed input) */
T.neg('refuses non-tides data record',
  d => { FCOVE_TIDE.create(d, {ktide: KTIDE}); return true; },
  {kind: 'wrong-record', version: 1},
  SLICE_DATA);

T.neg('refuses sill slack threshold >= vMax',
  o => { FCOVE_TIDE.create(SLICE_DATA, {ktide: KTIDE, sill: o}); return true; },
  {vMax: 5.2, slackMaxMps: 5.5},
  {vMax: 5.2, slackMaxMps: 0.65});

T.neg('refuses non-positive rotor power cap or campaign threshold',
  o => { FCOVE_TIDE.create(SLICE_DATA, {ktide: KTIDE, rotors: o}); return true; },
  {pCapMW: 0, kMW: 0.022, campaignMinMWh: -5},
  {pCapMW: 2.4, kMW: 0.022, campaignMinMWh: 11.0});

T.neg('refuses zero/negative vessel draft in cradleDay',
  dr => { R.cradleDay('cradle_deep', 44, {draft: dr}); return true; },
  -1.2,
  5.2);

T.neg('refuses unknown cradle id',
  id => { R.cradleAt(id, 0); return true; },
  'cradle_nonexistent',
  'cradle_deep');

T.neg('blocks deep Ark docking on a neap day (day 67) while permitting Double Full (day 44)',
  d => R.cradleDay('cradle_deep', d).open,
  67,
  44);

T.neg('blocks deep-hull sill transit during peak spring flood race while permitting high-water slack',
  t => R.sillAt(t, 'ark_catamaran').deepTransit,
  dFull.greatFloodT - 3 * 3600,
  dFull.greatFloodT);

T.neg('blocks White Stacks byssus gathering on a neap low tide while permitting Double Dark spring low ebb',
  t => R.causewayAt(t).byssusGatherable,
  DAYS[67].greatEbbT,
  dDark2.greatEbbT);

T.done();
