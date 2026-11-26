#!/usr/bin/env node
'use strict';
/* tools/scale-model/tides/solve_tides.js: the scale model's tidal calculator (run by bake_tides.py, not by hand).

   A 2D barotropic Laplace tidal-equation solver (linear momentum + quadratic bed drag, Coriolis on an f-plane per cell,
   C-grid, semi-implicit friction, Flather radiation on open edges) run on each sea basin of Scale Model 5.1, forced by
   Krator's equilibrium tide:
     D1 (24 h): the Giant's libration and obliquity nod (the moon is locked, so only the eccentricity and inclination
                breathe) plus the Day's daily conjunction wave;
     D2 (12 h): solar S2 plus the Day's close-pass second harmonic and the Four-Day moon.
   After a spin-up it does a least-squares harmonic analysis over a whole number of days, so every wet cell ends with
   (amplitude, phase) for D1 and D2: eta(t) = A1 cos(w1 t - p1) + A2 cos(w2 t - p2) about mean sea level. That is the
   record core/water/tide (KTIDE) reads. t = 0 is the forcing's epoch (the Giant's sub-point on the solver's meridian).

   Input: --work DIR holding bathy_<id>.bin (Float32 LE depth in metres, 0 = dry, 2 km pixels) and basins.json (written
   by bake_tides.py). Output: --out FILE (tides.json). Deterministic: no randomness; float64 throughout, quantised on
   output. */
const fs = require('fs');
const path = require('path');

function arg(name, dflt){
 const i = process.argv.indexOf('--' + name);
 return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : dflt;
}
const WORK = arg('work', null);
const OUT = arg('out', null);
const QUICK = process.argv.indexOf('--quick') > 0;
if (!WORK || !OUT) { console.error('usage: solve_tides.js --work DIR --out tides.json [--quick]'); process.exit(2); }

/* Krator (LORE.md, core/atmos 89-atmos-e-skymodel.js) */
const G = 7.4;                        /* m/s^2 */
const DAY = 86400.0;                  /* s; the synchronous day */
const OMEGA = 2.0 * Math.PI / DAY;    /* rad/s */
const DEG = Math.PI / 180.0;
const PX_M = 2000.0;                  /* metres per model pixel */

/* Scale Model 5.1 pixel -> latitude and longitude from the Giant's sub-point (the globe's frame, gallery/krator-globe) */
function siteAt51(px, py){
 const ox = px - 272.0, oy = py - 330.0;
 const lat = -40.0 - (oy - 690.0) * 2.0 / 84.0;
 const subLon = 57.0 - (ox - 446.0) * 2.0 / (84.0 * Math.cos(lat * DEG));
 return { lat: lat, subLon: subLon };
}

/* Equilibrium-tide spatial basis per cell, so the time loop is trig-free */
function makeForcing(nx, ny, x0, y0, step){
 const N = nx * ny;
 const F = { coriolis: new Float64Array(N), c1: new Float64Array(N), s1: new Float64Array(N), nod: new Float64Array(N),
  c2: new Float64Array(N), s2: new Float64Array(N) };
 const H0 = 17400.0;      /* static bulge times the elastic Love factor (gamma_2 ~ 0.70) */
 const E_DYN = 0.000045;  /* heat-flow-consistent eccentricity: ~0.8 m libration range */
 const INC_DYN = 0.00018; /* heat-flow-consistent obliquity: ~0.5 m nod range */
 for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
   const s = siteAt51(x0 + (i + 0.5) * step, y0 + (j + 0.5) * step);
   const k = j * nx + i;
   const sl = Math.sin(s.lat * DEG), cl = Math.cos(s.lat * DEG);
   const lon = s.subLon * DEG, clon = Math.cos(lon), slon = Math.sin(lon);
   F.coriolis[k] = 2.0 * OMEGA * sl;
   const p20 = 0.5 * (3.0 * cl * cl * clon * clon - 1.0);
   F.c1[k] = 3.0 * E_DYN * H0 * p20 + 0.45 * cl * Math.cos(lon - 0.7);
   F.s1[k] = -6.0 * E_DYN * H0 * cl * cl * clon * slon + 0.45 * cl * Math.sin(lon - 0.7);
   F.nod[k] = 3.0 * INC_DYN * H0 * sl * cl * clon;
   F.c2[k] = 0.55 * cl * cl * Math.cos(2.0 * lon);
   F.s2[k] = 0.55 * cl * cl * Math.sin(2.0 * lon);
  }
 }
 return F;
}

function solveBasin(B){
 const buf = fs.readFileSync(path.join(WORK, 'bathy_' + B.id + '.bin'));
 const raw = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
 if (raw.length !== B.w * B.h) throw new Error(B.id + ': bathy size ' + raw.length + ' != ' + B.w + 'x' + B.h);
 const step = B.cell;
 const nx = Math.floor(B.w / step), ny = Math.floor(B.h / step);
 const dx = step * PX_M;
 const N = nx * ny;
 const D = new Float64Array(N);
 for (let j = 0; j < ny; j++) {
  for (let i = 0; i < nx; i++) {
   let sum = 0, cnt = 0;
   for (let dj = 0; dj < step; dj++) for (let di = 0; di < step; di++) {
    const v = raw[(j * step + dj) * B.w + (i * step + di)];
    if (v > 0) { sum += v; cnt++; }
   }
   if (cnt >= 2) D[j * nx + i] = Math.max(4.0, sum / cnt);
  }
 }
 const F = makeForcing(nx, ny, B.x0, B.y0, step);
 const eta = new Float64Array(N), eq = new Float64Array(N);
 const u = new Float64Array((nx + 1) * ny), v = new Float64Array(nx * (ny + 1));
 const eMin = new Float64Array(N).fill(1e9), eMax = new Float64Array(N).fill(-1e9), vMax = new Float64Array(N);
 /* harmonic accumulators: mean, D1 cos/sin, D2 cos/sin */
 const hm = new Float64Array(N), h1c = new Float64Array(N), h1s = new Float64Array(N), h2c = new Float64Array(N), h2s = new Float64Array(N);
 let nSamp = 0;

 const dt = 30.0;
 const spinDays = QUICK ? 1 : 2, anaDays = QUICK ? 1 : 2;
 const nSteps = Math.round((spinDays + anaDays) * DAY / dt), spin = Math.round(spinDays * DAY / dt);
 const CD = 0.0022, R0 = 1.0e-4, SAMPLE = 10;

 for (let st = 0; st < nSteps; st++) {
  const t = st * dt, ph = OMEGA * t;
  const cw1 = Math.cos(ph), sw1 = Math.sin(ph), snod = Math.sin(ph + 4.04), cw2 = Math.cos(2 * ph), sw2 = Math.sin(2 * ph);
  for (let k = 0; k < N; k++) if (D[k] > 0) eq[k] = F.c1[k] * cw1 + F.s1[k] * sw1 + F.nod[k] * snod + F.c2[k] * cw2 + F.s2[k] * sw2;

  for (let j = 0; j < ny; j++) for (let i = 1; i < nx; i++) {
   const kL = j * nx + i - 1, kR = kL + 1;
   if (D[kL] > 0 && D[kR] > 0) {
    const dF = 0.5 * (D[kL] + D[kR]);
    const vb = 0.25 * (v[j * nx + i - 1] + v[(j + 1) * nx + i - 1] + v[j * nx + i] + v[(j + 1) * nx + i]);
    const f = 0.5 * (F.coriolis[kL] + F.coriolis[kR]);
    const pgf = -G * ((eta[kR] - eq[kR]) - (eta[kL] - eq[kL])) / dx;
    const iu = j * (nx + 1) + i, u0 = u[iu];
    const drag = (CD * Math.sqrt(u0 * u0 + vb * vb) + R0) / dF;
    u[iu] = (u0 + dt * (pgf - f * vb)) / (1.0 + dt * drag);
   }
  }
  for (let j = 1; j < ny; j++) for (let i = 0; i < nx; i++) {
   const kU = (j - 1) * nx + i, kD = kU + nx;
   if (D[kU] > 0 && D[kD] > 0) {
    const dF = 0.5 * (D[kU] + D[kD]);
    const ub = 0.25 * (u[(j - 1) * (nx + 1) + i] + u[(j - 1) * (nx + 1) + i + 1] + u[j * (nx + 1) + i] + u[j * (nx + 1) + i + 1]);
    const f = 0.5 * (F.coriolis[kU] + F.coriolis[kD]);
    const pgf = -G * ((eta[kD] - eq[kD]) - (eta[kU] - eq[kU])) / dx;
    const iv = j * nx + i, v0 = v[iv];
    const drag = (CD * Math.sqrt(ub * ub + v0 * v0) + R0) / dF;
    v[iv] = (v0 + dt * (pgf + f * ub)) / (1.0 + dt * drag);
   }
  }
  if (B.open) {
   /* Flather radiation on the open west and north edges: the ocean beyond the box carries the equilibrium tide */
   for (let j = 0; j < ny; j++) { const k = j * nx; if (D[k] > 0) u[j * (nx + 1)] = Math.sqrt(G / D[k]) * (eq[k] - eta[k]); }
   for (let i = 0; i < nx; i++) { if (D[i] > 0) v[i] = Math.sqrt(G / D[i]) * (eq[i] - eta[i]); }
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
   const k = j * nx + i;
   if (!(D[k] > 0)) continue;
   const dL = (i > 0 && D[k - 1] > 0) ? 0.5 * (D[k - 1] + D[k]) : (B.open && i === 0 ? D[k] : 0);
   const dR = (i + 1 < nx && D[k + 1] > 0) ? 0.5 * (D[k] + D[k + 1]) : 0;
   const dU = (j > 0 && D[k - nx] > 0) ? 0.5 * (D[k - nx] + D[k]) : (B.open && j === 0 ? D[k] : 0);
   const dD = (j + 1 < ny && D[k + nx] > 0) ? 0.5 * (D[k] + D[k + nx]) : 0;
   eta[k] -= (dt / dx) * (dR * u[j * (nx + 1) + i + 1] - dL * u[j * (nx + 1) + i] + dD * v[(j + 1) * nx + i] - dU * v[j * nx + i]);
  }
  if (st >= spin && st % SAMPLE === 0) {
   nSamp++;
   for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    if (!(D[k] > 0)) continue;
    const e = eta[k];
    if (e < eMin[k]) eMin[k] = e;
    if (e > eMax[k]) eMax[k] = e;
    const uc = 0.5 * (u[j * (nx + 1) + i] + u[j * (nx + 1) + i + 1]), vc = 0.5 * (v[j * nx + i] + v[(j + 1) * nx + i]);
    const sp = Math.sqrt(uc * uc + vc * vc);
    if (sp > vMax[k]) vMax[k] = sp;
    hm[k] += e; h1c[k] += e * cw1; h1s[k] += e * sw1; h2c[k] += e * cw2; h2s[k] += e * sw2;
   }
  }
 }
 /* Over whole days the cos/sin bases are orthogonal: A = 2/n |sum e e^{i w t}|, phase = arg */
 const out = { nx: nx, ny: ny, D: D, a1: new Float64Array(N), p1: new Float64Array(N), a2: new Float64Array(N), p2: new Float64Array(N),
  range: new Float64Array(N), vmax: vMax, mean: new Float64Array(N) };
 for (let k = 0; k < N; k++) {
  if (!(D[k] > 0)) continue;
  out.mean[k] = hm[k] / nSamp;
  out.a1[k] = 2.0 / nSamp * Math.hypot(h1c[k], h1s[k]);
  out.p1[k] = Math.atan2(h1s[k], h1c[k]);
  out.a2[k] = 2.0 / nSamp * Math.hypot(h2c[k], h2s[k]);
  out.p2[k] = Math.atan2(h2s[k], h2c[k]);
  out.range[k] = eMax[k] - eMin[k];
 }
 return out;
}

/* Quantised little-endian base64 grids (u16 amplitude in mm, u8 phase in 1/256 turn, u8 speed in 0.02 m/s, u16 depth m) */
function b64u16(arr){ const b = Buffer.alloc(arr.length * 2); for (let i = 0; i < arr.length; i++) b.writeUInt16LE(arr[i], i * 2); return b.toString('base64'); }
function b64u8(arr){ return Buffer.from(arr).toString('base64'); }
function median(a){ if (!a.length) return 0; const s = a.slice().sort(function(x, y){ return x - y; }); return s[s.length >> 1]; }

const spec = JSON.parse(fs.readFileSync(path.join(WORK, 'basins.json'), 'utf8'));
const basinsOut = [];
for (const B of spec.basins) {
 const t0 = Date.now();
 const R = solveBasin(B);
 const N = R.nx * R.ny;
 const A1 = new Uint16Array(N), P1 = new Uint8Array(N), A2 = new Uint16Array(N), P2 = new Uint8Array(N), V = new Uint8Array(N), DEP = new Uint16Array(N);
 const ranges = [], open = [];
 let wet = 0, maxR = 0, maxV = 0;
 for (let k = 0; k < N; k++) {
  if (!(R.D[k] > 0)) { A1[k] = 0xFFFF; A2[k] = 0xFFFF; continue; }
  wet++;
  A1[k] = Math.min(0xFFFE, Math.round(R.a1[k] * 1000));
  A2[k] = Math.min(0xFFFE, Math.round(R.a2[k] * 1000));
  P1[k] = ((Math.round(R.p1[k] / (2 * Math.PI) * 256) % 256) + 256) % 256;
  P2[k] = ((Math.round(R.p2[k] / (2 * Math.PI) * 256) % 256) + 256) % 256;
  V[k] = Math.min(255, Math.round(R.vmax[k] / 0.02));
  DEP[k] = Math.min(0xFFFF, Math.round(R.D[k]));
  ranges.push(R.range[k]);
  if (R.D[k] >= 1000) open.push(R.range[k]);
  if (R.range[k] > maxR) maxR = R.range[k];
  if (R.vmax[k] > maxV) maxV = R.vmax[k];
 }
 basinsOut.push({
  id: B.id, name: B.name, level: B.level, open: !!B.open,
  x0: B.x0, y0: B.y0, cell: B.cell, nx: R.nx, ny: R.ny,
  amp1: b64u16(A1), ph1: b64u8(P1), amp2: b64u16(A2), ph2: b64u8(P2), vmax: b64u8(V), depth: b64u16(DEP),
  stats: { wet: wet, medianRange: +median(ranges).toFixed(3), deepMedianRange: +median(open).toFixed(3),
   maxRange: +maxR.toFixed(3), maxSpeed: +maxV.toFixed(3) }
 });
 console.log(B.id + ': ' + R.nx + 'x' + R.ny + ' cells of ' + (B.cell * 2) + ' km, ' + wet + ' wet, median range ' +
  median(ranges).toFixed(2) + ' m, max ' + maxR.toFixed(2) + ' m, max race ' + maxV.toFixed(2) + ' m/s (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
}

const doc = {
 kind: 'krator-tides', version: 1,
 note: 'Made by tools/scale-model/tides/bake_tides.py from Scale Model 5.1 (h.png, wl.png). Read it with core/water/tide (KTIDE). ' +
  'eta(t) = sum_k A_k cos(w_k t - p_k) metres about mean sea level; t in seconds from the forcing epoch.',
 model: '5.1', pxM: PX_M, g: G, daySec: DAY, quick: QUICK,
 constituents: [
  { id: 'D1', periodSec: DAY, what: 'Giant libration and obliquity nod, Day conjunction wave' },
  { id: 'D2', periodSec: DAY / 2, what: 'solar S2, Day close-pass harmonic, Four-Day moon' }
 ],
 encoding: { amp: 'u16 LE mm, 65535 = dry', ph: 'u8 turn/256 (phase lag p in eta = A cos(w t - p))', vmax: 'u8 x 0.02 m/s', depth: 'u16 LE m',
  grid: 'row-major nx x ny; cell (i, j) covers model px [x0 + i*cell, x0 + (i+1)*cell) x [y0 + j*cell, ...)' },
 basins: basinsOut
};
fs.writeFileSync(OUT, JSON.stringify(doc) + '\n', { encoding: 'utf8' });
console.log('wrote ' + OUT + ' (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB)');
