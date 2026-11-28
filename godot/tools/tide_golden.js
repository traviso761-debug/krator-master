// Writes core/water/tide/golden-tide.json from core/water/tide/23-core-water-tide.js (KTIDE) on
// tools/scale-model/model/data/tides.json, covering:
//   1. Fleetborn Cove slice (px [236, 242], range: 11 m semidiurnal D2 + Week/Thirteen springs)
//   2. Deep-Ward slice (px [148, 492], natural ~1.88 m diurnal D1, coast: 1 nearest-wet search)
// across 92 days (d = -1..90: Double Dark at -0.5 d, neaps, Double Full ~+45 d, hourly curves,
// rates, states, spring factors, nextSpring/nextNeap, lag/gain/springs:false, origin & worldSeconds).
// Synced to godot/tests/water/golden-tide.json by godot/tools/sync_core.py; checked by ktide_test.gd.
//   node godot/tools/tide_golden.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const KTIDE = require(path.join(ROOT, 'core/water/tide/23-core-water-tide.js'));
const FULL = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/scale-model/model/data/tides.json'), 'utf8'));

const GRIDS16 = ['amp1', 'amp2', 'depth'];
const GRIDS8 = ['ph1', 'ph2', 'vmax'];

function cutGrid(b64, nx, i0, j0, i1, j1, bytesPerCell) {
  const raw = Buffer.from(b64, 'base64');
  const rows = [];
  for (let j = j0; j < j1; j++) {
    rows.push(raw.subarray((j * nx + i0) * bytesPerCell, (j * nx + i1) * bytesPerCell));
  }
  return Buffer.concat(rows).toString('base64');
}

function sliceBox(rec, x0, y0, x1, y1, reach) {
  const r = reach == null ? 3 : reach;
  const out = {};
  for (const k of Object.keys(rec)) {
    if (k !== 'basins') out[k] = rec[k];
  }
  out.slice = [x0, y0, x1, y1];
  out.basins = [];
  for (const b of rec.basins) {
    const c = b.cell, nx = b.nx, ny = b.ny;
    const i0 = Math.max(0, Math.floor((x0 - b.x0) / c) - r - 1);
    const j0 = Math.max(0, Math.floor((y0 - b.y0) / c) - r - 1);
    const i1 = Math.min(nx, Math.ceil((x1 - b.x0) / c) + r + 1);
    const j1 = Math.min(ny, Math.ceil((y1 - b.y0) / c) + r + 1);
    if (i1 <= i0 || j1 <= j0) continue;
    const nb = {};
    for (const k of Object.keys(b)) {
      if (!GRIDS16.includes(k) && !GRIDS8.includes(k)) nb[k] = b[k];
    }
    nb.x0 = b.x0 + i0 * c;
    nb.y0 = b.y0 + j0 * c;
    nb.nx = i1 - i0;
    nb.ny = j1 - j0;
    for (const g of GRIDS16) nb[g] = cutGrid(b[g], nx, i0, j0, i1, j1, 2);
    for (const g of GRIDS8) nb[g] = cutGrid(b[g], nx, i0, j0, i1, j1, 1);
    out.basins.push(nb);
  }
  return out;
}

const DAY = KTIDE.DAY;
const fullTide = KTIDE.load(FULL);

const coveSlice = sliceBox(FULL, 216, 222, 256, 262, 3);
const deepWardSlice = sliceBox(FULL, 128, 472, 168, 512, 3);

const coveTD = KTIDE.load(coveSlice, { origin: [236, 242] });
const deepTD = KTIDE.load(deepWardSlice, { origin: [148, 492] });

const coveSite = coveTD.site({ px: 236, py: 242 }, { range: 11 });
const deepSite = deepTD.site({ px: 148, py: 492 }, {});

// Sanity-assert slice parity against full 0.8 MB record before writing golden
const fullCove = fullTide.site({ px: 236, py: 242 }, { range: 11 });
const fullDeep = fullTide.site({ px: 148, py: 492 }, {});
if (Math.abs(coveSite.level(12345) - fullCove.level(12345)) > 1e-12 ||
    Math.abs(deepSite.level(12345) - fullDeep.level(12345)) > 1e-12) {
  throw new Error('tide_golden: slice diverged from full tides.json');
}

function captureSite(S, px, py, opts) {
  const days = [];
  for (let d = -1; d <= 90; d++) {
    const ds = S.day(d);
    days.push({
      d: d,
      range: ds.range,
      highest: ds.highest,
      lowest: ds.lowest,
      high: ds.high,
      low: ds.low,
      springMid: S.spring((d + 0.5) * DAY),
    });
  }

  const curveDays = [-1, 0, 2, 15, 45, 90];
  const hourly = [];
  for (const d of curveDays) {
    for (let h = 0; h < 24; h++) {
      const t = (d * 24 + h) * 3600;
      hourly.push({
        t: t,
        level: S.level(t),
        rate: S.rate(t),
        state: S.state(t),
        spring: S.spring(t),
      });
    }
  }
  // Also include exact high/low slack instants & non-integer timestamps
  for (const t of [S.high[0], S.low[0], 1234.5, -43200, 3888000.25]) {
    if (t == null) continue;
    hourly.push({
      t: t,
      level: S.level(t),
      rate: S.rate(t),
      state: S.state(t),
      spring: S.spring(t),
    });
  }

  const turnProbes = [-43200, 0, 3 * DAY, 10 * DAY, 25 * DAY, 44.5 * DAY, 60 * DAY, 88 * DAY];
  const turns = turnProbes.map(t => {
    const ns = S.nextSpring(t);
    const nn = S.nextNeap(t);
    return {
      t: t,
      nextSpring: ns,
      springAtNextSpring: ns == null ? null : S.spring(ns),
      nextNeap: nn,
      springAtNextNeap: nn == null ? null : S.spring(nn),
    };
  });

  const doubleDarkT = -43200;
  const doubleFullT = S.nextSpring(doubleDarkT + 44.5 * DAY);

  return {
    px: [px, py],
    opts: opts,
    basin: S.basin,
    a: [S.a[0], S.a[1]],
    p: [S.p[0], S.p[1]],
    gain: S.gain,
    lag: S.lag,
    vmax: S.vmax,
    depth: S.depth,
    coast: S.coast,
    range: S.range,
    high: S.high.slice(),
    low: S.low.slice(),
    springs: S.springs,
    waterTide: S.waterTide(),
    doubleDark: {
      t: doubleDarkT,
      level: S.level(doubleDarkT),
      rate: S.rate(doubleDarkT),
      spring: S.spring(doubleDarkT),
    },
    doubleFull: {
      t: doubleFullT,
      level: S.level(doubleFullT),
      rate: S.rate(doubleFullT),
      spring: S.spring(doubleFullT),
    },
    days: days,
    hourly: hourly,
    turns: turns,
  };
}

const coveLag = coveTD.site({ px: 236, py: 242 }, { range: 11, lag: 1800 });
const coveMean = coveTD.site({ px: 236, py: 242 }, { range: 11, springs: false });
const coveGain = coveTD.site({ px: 236, py: 242 }, { gain: 1.5 });

const golden = {
  source: 'core/water/tide/23-core-water-tide.js on tools/scale-model/model/data/tides.json (92-day span d=-1..90)',
  daySeconds: DAY,
  omega: KTIDE.OMEGA,
  inferred: coveTD.inferred,
  slices: {
    cove: coveSlice,
    deepWard: deepWardSlice,
  },
  cove: captureSite(coveSite, 236, 242, { range: 11 }),
  deepWard: captureSite(deepSite, 148, 492, {}),
  variants: {
    lag1800: {
      lag: 1800,
      range: coveLag.range,
      high: coveLag.high.slice(),
      low: coveLag.low.slice(),
      samples: [0, 1800, 5000, 43200].map(t => ({ t: t, level: coveLag.level(t), rate: coveLag.rate(t) })),
    },
    springsOff: {
      springs: coveMean.springs,
      range: coveMean.range,
      nextSpring: coveMean.nextSpring(0),
      nextNeap: coveMean.nextNeap(0),
      springFactor: coveMean.spring(5000),
      samples: [0, 5000, DAY, DAY + 5000, 37 * DAY + 5000].map(t => ({ t: t, level: coveMean.level(t), rate: coveMean.rate(t) })),
    },
    gain15: {
      gain: coveGain.gain,
      range: coveGain.range,
      a: [coveGain.a[0], coveGain.a[1]],
      vmax: coveGain.vmax,
      level5000: coveGain.level(5000),
    },
    worldCoords: [
      [0, 0, 3600],
      [4000, -2000, 7200],
      [-6000, 4000, 21600],
    ].map(([x, z, t]) => ({
      x: x,
      z: z,
      t: t,
      level: coveTD.level(x, z, t),
      range: coveTD.range(x, z),
    })),
    worldSeconds: [
      { clock: { day: 0, hour: 0 }, s: KTIDE.worldSeconds({ day: 0, hour: 0 }) },
      { clock: { day: 2, hour: 6 }, s: KTIDE.worldSeconds({ day: 2, hour: 6 }) },
      { clock: { day: -0.5, hour: 0 }, s: KTIDE.worldSeconds({ day: -0.5, hour: 0 }) },
      { clock: { day: 45, hour: 12.5 }, s: KTIDE.worldSeconds({ day: 45, hour: 12.5 }) },
      { clock: {}, s: KTIDE.worldSeconds({}) },
    ],
  },
};

const outPath = path.join(ROOT, 'core/water/tide/golden-tide.json');
fs.writeFileSync(outPath, JSON.stringify(golden) + '\n', 'utf8');
console.log(
  'wrote ' + path.relative(ROOT, outPath) + ': cove (' + golden.cove.days.length + ' days, ' +
  golden.cove.hourly.length + ' samples, mean range ' + golden.cove.range.toFixed(2) + ' m) + deepWard (' +
  golden.deepWard.days.length + ' days, ' + golden.deepWard.hourly.length + ' samples, mean range ' +
  golden.deepWard.range.toFixed(3) + ' m, coast ' + golden.deepWard.coast + ')'
);
