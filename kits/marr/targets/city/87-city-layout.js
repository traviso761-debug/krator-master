// ================================================================= MARR CITY — 87-city-layout.js
// Generates the 3 chaotic jittered Inner Islands (via KRAND / 37-city-grid algorithm), the planned turning
// Left Bank (Qartar de Gardonz 3x4 mansion blocks) and Right Bank (De Xedaz 3x4 tenement cuadras),
// the 6 Grid-Break Bands (<=50% lot growth with street vs >50% Park/Market), the South Delta Strip,
// the 4 Extramuros Fincas, the 15 bridges, 7 piers, 3 quays, and Muraya de Marr wall/garitas/bastions/gates.
// Tagged [G data] in PORT.md: no DOM, no Three.js, no numeric || defaults.
reseed(424302);

const PARKS = [];
const MARKETS = [];
const CLUSTERS = [];
const QUOTA = { poor: 160, middle: 140, rich: 56, civic: 24 };
const LIFE_DESTS = { market: [] };

function shrinkPolyTowardCentroid(pts, dist) {
 const n = pts.length;
 let cx = 0, cz = 0;
 for (let i = 0; i < n; i++) { cx += pts[i][0]; cz += pts[i][1]; }
 cx /= n; cz /= n;
 const out = [];
 for (let i = 0; i < n; i++) {
  const dx = pts[i][0] - cx, dz = pts[i][1] - cz;
  const r = Math.hypot(dx, dz);
  const s = r > dist + 1.5 ? (r - dist) / r : 0.72;
  out.push([cx + dx * s, cz + dz * s]);
 }
 return out;
}

function bilerpQuad(q, u, v) {
 const topX = q[0][0] + (q[1][0] - q[0][0]) * u;
 const topZ = q[0][1] + (q[1][1] - q[0][1]) * u;
 const botX = q[3][0] + (q[2][0] - q[3][0]) * u;
 const botZ = q[3][1] + (q[2][1] - q[3][1]) * u;
 return [topX + (botX - topX) * v, topZ + (botZ - topZ) * v];
}

function quadAngle(q) {
 return Math.atan2(
  (q[1][1] - q[0][1]) + (q[2][1] - q[3][1]),
  (q[1][0] - q[0][0]) + (q[2][0] - q[3][0])
 );
}

function orthoRectInsideQuad(q, ang, shrink) {
 const sh = shrink == null ? 0.5 : shrink;
 let cx = 0, cz = 0;
 for (let i = 0; i < 4; i++) { cx += q[i][0]; cz += q[i][1]; }
 cx /= 4; cz /= 4;
 const ux = Math.cos(ang), uz = Math.sin(ang);
 const vx = -uz, vz = ux;
 const us = [], vs = [];
 for (let i = 0; i < 4; i++) {
  const dx = q[i][0] - cx, dz = q[i][1] - cz;
  us.push(dx * ux + dz * uz);
  vs.push(dx * vx + dz * vz);
 }
 us.sort((a, b) => a - b);
 vs.sort((a, b) => a - b);
 const uNeg = us[1], uPos = us[2];
 const vNeg = vs[1], vPos = vs[2];
 const wh = Math.max(4.5, 0.5 * (uPos - uNeg) - sh);
 const hh = Math.max(4.5, 0.5 * (vPos - vNeg) - sh);
 const uc = 0.5 * (uPos + uNeg), vc = 0.5 * (vPos + vNeg);
 const rcx = cx + uc * ux + vc * vx;
 const rcz = cz + uc * uz + vc * vz;
 return {
  cx: rcx, cz: rcz, wh, hh, ang,
  quad: [
   [rcx - wh * ux - hh * vx, rcz - wh * uz - hh * vz],
   [rcx + wh * ux - hh * vx, rcz + wh * uz - hh * vz],
   [rcx + wh * ux + hh * vx, rcz + wh * uz + hh * vz],
   [rcx - wh * ux + hh * vx, rcz - wh * uz + hh * vz]
  ]
 };
}

function planKirstabalJitterIsland(mapUvFn, nu, nv, seed, jit, pDrop, pBend, aveU, aveV, skipFn) {
 const U = (a, b, c) => KRAND.unit(KRAND.hash(seed, a, b == null ? 0 : b, c == null ? 0 : c));
 const S = (a, b, c) => U(a, b, c) * 2.0 - 1.0;
 const cu = 1.0 / nu, cv = 1.0 / nv;
 const au = [], bv = [];
 for (let i = 0; i <= nu; i++) au.push(cu * i + (0 < i && i < nu ? S(11, i) * jit * cu : 0.0));
 for (let j = 0; j <= nv; j++) bv.push(cv * j + (0 < j && j < nv ? S(12, j) * jit * cv : 0.0));
 const N = [];
 for (let i = 0; i <= nu; i++) {
  const col = [];
  for (let j = 0; j <= nv; j++) {
   let u = au[i], v = bv[j];
   if (0 < i && i < nu && 0 < j && j < nv) {
    u += S(13, i, j) * jit * cu * 0.48;
    v += S(14, i, j) * jit * cv * 0.48;
   }
   u = Math.max(0.0, Math.min(1.0, u));
   v = Math.max(0.0, Math.min(1.0, v));
   col.push(mapUvFn(u, v));
  }
  N.push(col);
 }
 const edges = [];
 for (let j = 1; j < nv; j++) {
  for (let i = 0; i < nu; i++) {
   edges.push({ line: 'u', index: j, k: i, a: [i, j], b: [i + 1, j], av: j === aveU, uDrop: U(41, 0, j, i), uBend: U(51, 0, j, i), sBend: S(52, 0, j, i) });
  }
 }
 for (let i = 1; i < nu; i++) {
  for (let j = 0; j < nv; j++) {
   edges.push({ line: 'v', index: i, k: j, a: [i, j], b: [i, j + 1], av: i === aveV, uDrop: U(41, 1, i, j), uBend: U(51, 1, i, j), sBend: S(52, 1, i, j) });
  }
 }
 const deg = {};
 for (let i = 0; i <= nu; i++) {
  for (let j = 0; j <= nv; j++) {
   const onB = (i === 0 || i === nu) && (j === 0 || j === nv);
   const onS = i === 0 || i === nu || j === 0 || j === nv;
   deg[i + ',' + j] = onB ? 2 : (onS ? 3 : 4);
  }
 }
 const cand = edges.filter(e => !e.av && e.uDrop < pDrop).sort((a, b) => a.uDrop - b.uDrop);
 for (let k = 0; k < cand.length; k++) {
  const e = cand[k];
  const ka = e.a[0] + ',' + e.a[1], kb = e.b[0] + ',' + e.b[1];
  if (deg[ka] <= 2 || deg[kb] <= 2) continue;
  e.dropped = true;
  deg[ka]--; deg[kb]--;
 }
 const segPts = e => {
  const pa = N[e.a[0]][e.a[1]], pb = N[e.b[0]][e.b[1]];
  if (!e.av && e.uBend < pBend) {
   const dx = pb[0] - pa[0], dz = pb[1] - pa[1];
   const d = (e.sBend >= 0 ? 1.0 : -1.0) * (0.045 + 0.04 * Math.abs(e.sBend));
   const mid = [0.5 * (pa[0] + pb[0]) - dz * d, 0.5 * (pa[1] + pb[1]) + dx * d];
   return [pa, mid, pb];
  }
  return [pa, pb];
 };
 const streets = [];
 for (let j = 1; j < nv; j++) {
  let run = [];
  for (let i = 0; i < nu; i++) {
   const e = edges.find(ed => ed.line === 'u' && ed.index === j && ed.k === i);
   const bothSkip = skipFn ? (skipFn(i, j - 1) && skipFn(i, j)) : false;
   if (e.dropped || bothSkip) {
    if (run.length > 1) streets.push({ ave: j === aveU, pts: run });
    run = [];
   } else {
    const sp = segPts(e);
    run.push(...(run.length ? sp.slice(1) : sp));
   }
  }
  if (run.length > 1) streets.push({ ave: j === aveU, pts: run });
 }
 for (let i = 1; i < nu; i++) {
  let run = [];
  for (let j = 0; j < nv; j++) {
   const e = edges.find(ed => ed.line === 'v' && ed.index === i && ed.k === j);
   const bothSkip = skipFn ? (skipFn(i - 1, j) && skipFn(i, j)) : false;
   if (e.dropped || bothSkip) {
    if (run.length > 1) streets.push({ ave: i === aveV, pts: run });
    run = [];
   } else {
    const sp = segPts(e);
    run.push(...(run.length ? sp.slice(1) : sp));
   }
  }
  if (run.length > 1) streets.push({ ave: i === aveV, pts: run });
 }
 const ring = [];
 for (let i = 0; i < nu; i++) ring.push(N[i][0]);
 for (let j = 0; j < nv; j++) ring.push(N[nu][j]);
 for (let i = nu; i > 0; i--) ring.push(N[i][nv]);
 for (let j = nv; j > 0; j--) ring.push(N[0][j]);
 ring.push(N[0][0]);
 streets.push({ ave: false, pts: ring });

 const droppedSet = new Set();
 for (let k = 0; k < edges.length; k++) {
  const e = edges[k];
  if (!e.dropped) continue;
  if (e.line === 'u') {
   const i = e.a[0], j = e.index;
   droppedSet.add(i + ',' + (j - 1) + '->' + i + ',' + j);
   droppedSet.add(i + ',' + j + '->' + i + ',' + (j - 1));
  } else {
   const i = e.index, j = e.a[1];
   droppedSet.add((i - 1) + ',' + j + '->' + i + ',' + j);
   droppedSet.add(i + ',' + j + '->' + (i - 1) + ',' + j);
  }
 }
 const cellsOut = [];
 const visited = new Set();
 for (let i = 0; i < nu; i++) {
  for (let j = 0; j < nv; j++) {
   if (skipFn && skipFn(i, j)) continue;
   const kij = i + ',' + j;
   if (visited.has(kij)) continue;
   const kr = (i + 1) + ',' + j, kb = i + ',' + (j + 1);
   if (i + 1 < nu && !(skipFn && skipFn(i + 1, j)) && droppedSet.has(kij + '->' + kr) && !visited.has(kr)) {
    visited.add(kij); visited.add(kr);
    cellsOut.push({ i, j, quad: [N[i][j], N[i + 2][j], N[i + 2][j + 1], N[i][j + 1]], merged: 'u' });
   } else if (j + 1 < nv && !(skipFn && skipFn(i, j + 1)) && droppedSet.has(kij + '->' + kb) && !visited.has(kb)) {
    visited.add(kij); visited.add(kb);
    cellsOut.push({ i, j, quad: [N[i][j], N[i + 1][j], N[i + 1][j + 2], N[i][j + 2]], merged: 'v' });
   } else {
    visited.add(kij);
    cellsOut.push({ i, j, quad: [N[i][j], N[i + 1][j], N[i + 1][j + 1], N[i][j + 1]], merged: null });
   }
  }
 }
 return { cells: cellsOut, streets, N };
}

function planGridBreakBand(NStart, NEnd, SStart, SEnd, nx, opts) {
 const angN = Math.atan2(NEnd[1] - NStart[1], NEnd[0] - NStart[0]);
 let vnx = -Math.sin(angN), vnz = Math.cos(angN);
 if (vnz < 0) { vnx = -vnx; vnz = -vnz; }

 const angS = Math.atan2(SEnd[1] - SStart[1], SEnd[0] - SStart[0]);
 let vsx = -Math.sin(angS), vsz = Math.cos(angS);
 if (vsz < 0) { vsx = -vsx; vsz = -vsz; }

 const stHalf = 2.6;
 const spanStart = Math.hypot(SStart[0] - NStart[0], SStart[1] - NStart[1]);
 const spanEnd = Math.hypot(SEnd[0] - NEnd[0], SEnd[1] - NEnd[1]);
 const minSpan = Math.min(spanStart, spanEnd);
 const dCore = Math.max(12.0, 0.44 * (minSpan - 2.0 * stHalf));

 const B0All = [NStart[0] + dCore * vnx, NStart[1] + dCore * vnz];
 const B1All = [NEnd[0] + dCore * vnx, NEnd[1] + dCore * vnz];
 const C0All = [SStart[0] - dCore * vsx, SStart[1] - dCore * vsz];
 const C1All = [SEnd[0] - dCore * vsx, SEnd[1] - dCore * vsz];
 const gapStart = Math.hypot(C0All[0] - B0All[0], C0All[1] - B0All[1]);
 const gapEnd = Math.hypot(C1All[0] - B1All[0], C1All[1] - B1All[1]);
 const emptyMin = Math.max(0.0, Math.min(gapStart, gapEnd) - 2.0 * stHalf);
 const emptyMax = Math.max(1.0, Math.max(gapStart, gapEnd) - 2.0 * stHalf);

 const lots = [];
 const openCells = [];
 const streets = [
  [NStart, NEnd],
  [SStart, SEnd]
 ];

 for (let ix = 0; ix < nx; ix++) {
  const s0 = ix / nx, s1 = (ix + 1) / nx;
  const padS = 0.015;
  const u0 = s0 + padS, u1 = s1 - padS;
  const A0 = [NStart[0] + (NEnd[0] - NStart[0]) * u0, NStart[1] + (NEnd[1] - NStart[1]) * u0];
  const A1 = [NStart[0] + (NEnd[0] - NStart[0]) * u1, NStart[1] + (NEnd[1] - NStart[1]) * u1];
  const B0 = [A0[0] + dCore * vnx, A0[1] + dCore * vnz];
  const B1 = [A1[0] + dCore * vnx, A1[1] + dCore * vnz];

  const D0 = [SStart[0] + (SEnd[0] - SStart[0]) * u0, SStart[1] + (SEnd[1] - SStart[1]) * u0];
  const D1 = [SStart[0] + (SEnd[0] - SStart[0]) * u1, SStart[1] + (SEnd[1] - SStart[1]) * u1];
  const C0 = [D0[0] - dCore * vsx, D0[1] - dCore * vsz];
  const C1 = [D1[0] - dCore * vsx, D1[1] - dCore * vsz];

  const M0 = [0.5 * (B0[0] + C0[0]), 0.5 * (B0[1] + C0[1])];
  const M1 = [0.5 * (B1[0] + C1[0]), 0.5 * (B1[1] + C1[1])];
  const msdx = M1[0] - M0[0], msdz = M1[1] - M0[1];
  const msl = Math.max(1e-6, Math.hypot(msdx, msdz));
  let mnx = -msdz / msl, mnz = msdx / msl;
  if (mnz < 0) { mnx = -mnx; mnz = -mnz; }

  const gapM = 0.5 * (Math.hypot(C0[0] - B0[0], C0[1] - B0[1]) + Math.hypot(C1[0] - B1[0], C1[1] - B1[1]));
  const emptyM = Math.max(0.0, gapM - 2.0 * stHalf);
  const growRatio = (emptyM - emptyMin) / Math.max(1.0, emptyMax - emptyMin);

  const coreN = [A0, A1, B1, B0];
  const coreS = [C0, C1, D1, D0];

  if (growRatio <= 0.501) {
   const B0Ext = [M0[0] - stHalf * mnx, M0[1] - stHalf * mnz];
   const B1Ext = [M1[0] - stHalf * mnx, M1[1] - stHalf * mnz];
   const C0Ext = [M0[0] + stHalf * mnx, M0[1] + stHalf * mnz];
   const C1Ext = [M1[0] + stHalf * mnx, M1[1] + stHalf * mnz];
   streets.push([M0, M1]);
   lots.push({ outer: [A0, A1, B1Ext, B0Ext], core: coreN, ang: angN, patio: opts.patio, wealth: opts.wealth, name: (opts.labels && opts.labels[ix]) || opts.name });
   lots.push({ outer: [C0Ext, C1Ext, D1, D0], core: coreS, ang: angS, patio: opts.patio, wealth: opts.wealth, name: opts.name });
  } else {
   lots.push({ outer: coreN, core: coreN, ang: angN, patio: opts.patio, wealth: opts.wealth, name: (opts.labels && opts.labels[ix]) || opts.name });
   lots.push({ outer: coreS, core: coreS, ang: angS, patio: opts.patio, wealth: opts.wealth, name: opts.name });
   openCells.push([B0, B1, C1, C0]);
  }
 }

 let wedge = null;
 if (openCells.length > 0) {
  const firstC = openCells[0], lastC = openCells[openCells.length - 1];
  const poly = shrinkPolyTowardCentroid([
   [firstC[0][0] + stHalf * vnx, firstC[0][1] + stHalf * vnz],
   [lastC[1][0] + stHalf * vnx, lastC[1][1] + stHalf * vnz],
   [lastC[2][0] - stHalf * vsx, lastC[2][1] - stHalf * vsz],
   [firstC[3][0] - stHalf * vsx, firstC[3][1] - stHalf * vsz]
  ], 1.5);
  const cx = 0.25 * (poly[0][0] + poly[1][0] + poly[2][0] + poly[3][0]);
  const cz = 0.25 * (poly[0][1] + poly[1][1] + poly[2][1] + poly[3][1]);
  wedge = { kind: opts.wedgeKind, name: opts.wedgeLabel, poly, x: cx, z: cz, r: 16 };
 }
 return { lots, streets, wedge };
}

// =========================================================================
// 1. INNER 3 ISLANDS (Isla de Sidi Olda 3x7, Isla de Marchondaz 3x3, Isla de Kanal 3x6)
// =========================================================================
function mapIsland1(u, v) {
 const zm = -94.0 + v * (sautaCz(-60.0) - sautaHw() - 7.0 - (-94.0));
 const x0 = gardR(zm, 8.0), x1 = gretaL(zm, 8.0);
 return [x0 + u * (x1 - x0), zm];
}
const ISLAND1 = planKirstabalJitterIsland(mapIsland1, 3, 7, 9811, 0.18, 0.25, 0.42, 2, 1, (i, j) => i >= 1 && j <= 3);

function mapIsland2(u, v) {
 const zTop = -92.0;
 const xApprox = 20.0 + u * 124.0;
 const zBot = ismogCz(xApprox) - ismogHw() - 7.5;
 const zm = zTop + v * (zBot - zTop);
 const x0 = gretaR(zm, 8.0), x1 = xedL(zm, 8.0);
 return [x0 + u * (x1 - x0), zm];
}
const ISLAND2 = planKirstabalJitterIsland(mapIsland2, 3, 3, 9829, 0.19, 0.26, 0.44, 1, 1, (i, j) => i >= 1 && (j === 1 || j === 2));
const ISLAND2_BAND = planGridBreakBand(
 [ISLAND2.N[1][1][0] + 4, -60], [ISLAND2.N[3][2][0] - 5, -52],
 [ISLAND2.N[1][3][0] + 4, -10], [ISLAND2.N[3][3][0] - 5, -14],
 3, { patio: 'working', wealth: 'middle', wedgeKind: 'market', wedgeLabel: 'Markita de Porta', name: 'Korta de Marchondaz' }
);

function mapIsland3(u, v) {
 const xApprox = 20.0 + u * 115.0;
 const zTop = ismogCz(xApprox) + ismogHw() + 7.5;
 const zBot = sautaCz(xApprox) - sautaHw() - 7.0;
 const zm = zTop + v * (zBot - zTop);
 const x0 = gretaR(zm, 8.0), x1 = xedL(zm, 8.0);
 return [x0 + u * (x1 - x0), zm];
}
const ISLAND3 = planKirstabalJitterIsland(mapIsland3, 3, 6, 9847, 0.19, 0.26, 0.44, 2, 1, (i, j) => i >= 1 && (j === 4 || j === 5));
const ISLAND3_BAND = planGridBreakBand(
 [ISLAND3.N[1][4][0] + 4, 205], [ISLAND3.N[3][5][0] - 5, 213],
 [ISLAND3.N[1][6][0] + 4, 291], [ISLAND3.N[3][6][0] - 5, 287],
 3, { patio: 'vegetable', wealth: 'middle', wedgeKind: 'park', wedgeLabel: 'Gardon de Kanal', name: 'Korta de Kanal' }
);

// =========================================================================
// 2. LEFT BANK (Poinda de Navigadarz, Qartar de Gardonz 3x4 Mansion Grid & West Qartar Lo)
// =========================================================================
const LEFT_BAND1 = planGridBreakBand(
 [-350, -168], [-242, -206],
 [-354, -124], [-224, -114],
 4, { patio: 'pleasure', wealth: 'rich', wedgeKind: 'park', wedgeLabel: 'Gardon de Pilotaz', name: 'Korta de Pilotaz', labels: { 0: 'Korta de Pilotaz', 2: 'Rro de Kaptinz' } }
);

function mapLeftTurned(u, v) {
 const zBase = -92.0 + v * (264.0 - (-92.0));
 const slopeDeg = 4.8 * (1.0 - v) + (-4.5) * v;
 const dz = (u - 0.5) * 210.0 * Math.tan(slopeDeg * Math.PI / 180.0);
 const zm = zBase + dz;
 const xLeft = westWallX(zm) + 12.0;
 const xRight = gardL(zm, 10.0);
 const xm = xLeft + u * (xRight - xLeft);
 return [xm, zm];
}

const U_LEFT_COLS = [[0.02, 0.27], [0.29, 0.55], [0.66, 0.98]];
const V_LEFT_ROWS = [[0.02, 0.24], [0.265, 0.485], [0.51, 0.73], [0.755, 0.98]];
const LEFT_LABELS = {
 '0,0': 'Korta de Palmaz', '1,0': 'Vila de Bayz', '2,0': 'Palas de Iston',
 '0,1': 'Vila de Fontinz', '1,1': 'Omz de Gardonz', '2,1': 'Om de Tailz',
 '0,2': 'Vila de Sitrus', '1,2': 'De Terasaz', '2,2': 'Palas de Admirol',
 '0,3': 'Vila de Orkidz', '1,3': 'Korta de Magnoliaz', '2,3': 'Palas de Kistal'
};
const LEFT_MANSION_BLOCKS = [];
for (let ci = 0; ci < U_LEFT_COLS.length; ci++) {
 for (let rj = 0; rj < V_LEFT_ROWS.length; rj++) {
  const u0 = U_LEFT_COLS[ci][0], u1 = U_LEFT_COLS[ci][1];
  const v0 = V_LEFT_ROWS[rj][0], v1 = V_LEFT_ROWS[rj][1];
  const q = [mapLeftTurned(u0, v0), mapLeftTurned(u1, v0), mapLeftTurned(u1, v1), mapLeftTurned(u0, v1)];
  LEFT_MANSION_BLOCKS.push({ ci, rj, quad: q, name: LEFT_LABELS[ci + ',' + rj] });
 }
}

const LEFT_BAND2 = planGridBreakBand(
 [-346, 282], [-118, 266],
 [-328, 370], [-96, 338],
 6, { patio: 'vegetable', wealth: 'poor', wedgeKind: 'park', wedgeLabel: 'Gardon de Guesta', name: 'Kotijz de Guesta', labels: { 1: 'Kotijz de Guesta', 3: 'Kotijz Lo', 5: 'Rro de Kreol' } }
);

// =========================================================================
// 3. RIGHT BANK (De Xedaz 3x4 Tenement Grid & East Qartar Lo)
// =========================================================================
const RIGHT_BAND3 = planGridBreakBand(
 [176, -118], [344, -142],
 [176, -24], [348, -38],
 6, { patio: 'working', wealth: 'poor', wedgeKind: 'market', wedgeLabel: 'Markita de Xedaz', name: 'Korta de Salta', labels: { 0: 'Guarfa de Ismoglarz', 3: 'Korta de Salta', 5: 'Korta de Netaz' } }
);

function mapRightTurned(u, v) {
 const zBase = -24.0 + v * (264.0 - (-24.0));
 const slopeDeg = -4.8 * (1.0 - v) + 4.5 * v;
 const dz = (u - 0.5) * 180.0 * Math.tan(slopeDeg * Math.PI / 180.0);
 const zm = zBase + dz;
 const xRiver = xedR(zm, 10.0);
 const xWall = eastWallX(zm) - 12.0;
 const xm = xRiver + u * (xWall - xRiver);
 return [xm, zm];
}

const U_RIGHT_COLS = [[0.02, 0.32], [0.35, 0.65], [0.68, 0.98]];
const V_RIGHT_ROWS = [[0.02, 0.24], [0.265, 0.485], [0.51, 0.73], [0.755, 0.98]];
const RIGHT_LABELS = {
 '0,0': 'Tavarnaz de Xedaz', '1,0': 'Om de Landarnaz', '2,0': 'Korta de Dais',
 '0,1': 'Yarda de Xedaz', '1,1': 'Yarda de Rropa & Tar', '2,1': 'Korta de Bilj',
 '0,2': 'Islipa de Barjaz', '1,2': 'Yarda de Tanarz', '2,2': 'Korta de Smoka',
 '0,3': 'Korta de Kordel', '1,3': 'Yarda de Kalafatez', '2,3': 'Bodega de Melaza'
};
const RIGHT_CUADRA_BLOCKS = [];
for (let ci = 0; ci < U_RIGHT_COLS.length; ci++) {
 for (let rj = 0; rj < V_RIGHT_ROWS.length; rj++) {
  const u0 = U_RIGHT_COLS[ci][0], u1 = U_RIGHT_COLS[ci][1];
  const v0 = V_RIGHT_ROWS[rj][0], v1 = V_RIGHT_ROWS[rj][1];
  const q = [mapRightTurned(u0, v0), mapRightTurned(u1, v0), mapRightTurned(u1, v1), mapRightTurned(u0, v1)];
  RIGHT_CUADRA_BLOCKS.push({ ci, rj, quad: q, name: RIGHT_LABELS[ci + ',' + rj], patio: (ci === 1 && rj === 0) ? 'pleasure' : 'working' });
 }
}

const RIGHT_BAND4 = planGridBreakBand(
 [142, 268], [342, 282],
 [112, 338], [324, 370],
 6, { patio: 'vegetable', wealth: 'poor', wedgeKind: 'market', wedgeLabel: 'Markita de Marxa', name: 'Kotijz de Marxa', labels: { 0: 'Kotijz de Bodabildarz', 2: 'Rro de Karpindarz', 4: 'Kotijz de Marxa' } }
);

// =========================================================================
// 4. SOUTHERN WALLED QUARTER PLATTING (z = 324..575 m inside the new South Wall) & EXTRAMUROS FINCAS
// =========================================================================
const SOUTH_DELTA_BLOCKS = [];
const SOUTH_STREETS = [];

(function planSouthernExtension() {
 // Transverse E-W streets connecting all 4 southern bands across the 3 canals at z = 382, 443, 504
 for (const zSt of [382, 443, 504]) {
  const xW = Math.max(-325, marInterp(zSt, [367.3, 523.4], [-332.9, -187.4]) + 10);
  const xE = Math.min(325, marInterp(zSt, [369.0, 492.1, 570.9], [331.3, 242.6, 120.7]) - 10);
  SOUTH_STREETS.push({ ave: zSt === 443, pts: [[xW, zSt], [gardL(zSt, 4), zSt]] });
  SOUTH_STREETS.push({ ave: zSt === 443, pts: [[gardR(zSt, 4), zSt], [gretaL(zSt, 4), zSt]] });
  SOUTH_STREETS.push({ ave: zSt === 443, pts: [[gretaR(zSt, 4), zSt], [xedL(zSt, 4), zSt]] });
  SOUTH_STREETS.push({ ave: zSt === 443, pts: [[xedR(zSt, 4), zSt], [xE, zSt]] });
 }

 // Central N-S avenues on South-West Island (between Knal de Gardonz & Knal Greta) and South-East Island (leading to Porta de Tera)
 const nsWest = [], nsEast = [];
 for (let z = 322; z <= 566; z += 20) {
  nsWest.push([0.5 * (gardR(z, 8) + gretaL(z, 8)), z]);
  nsEast.push([0.5 * (gretaR(z, 8) + xedL(z, 8)), z]);
 }
 SOUTH_STREETS.push({ ave: true, pts: nsWest });
 SOUTH_STREETS.push({ ave: true, pts: nsEast });

 // Perimeter wall-side paseo street just inside the new South Wall
 const wallPaseo = [];
 for (let i = 0; i < SOUTH_WALL_PTS.length; i++) {
  const p = SOUTH_WALL_PTS[i];
  wallPaseo.push([p[0] * 0.94, p[1] - 11.0]);
 }
 SOUTH_STREETS.push({ ave: false, pts: wallPaseo });

 // Band B & C: 4 rows x 2 columns on South-West Island & South-East Island (16 cuadra blocks)
 const zRows = [[326, 377], [387, 438], [448, 499], [509, 558]];
 const swNames = [
  ['Kotijz de Sauta', 'Korta de Sauta'],
  ['Korta de Trapiche', 'Bodegaz de Sauta'],
  ['Korta de Kistal Sauta', 'Korta de Alambik Sauta'],
  ['Korta de Arka Guesta', 'Kotijz de Muraya Guesta']
 ];
 const seNames = [
  ['Kotijz de Delta', 'Korta de Delta'],
  ['Korta de Cistal', 'Bodegaz de Delta'],
  ['Korta de Tera Nord', 'Korta de Melaza Sauta'],
  ['Korta de Porta Tera', 'Kotijz de Muraya Esta']
 ];
 for (let r = 0; r < zRows.length; r++) {
  const z0 = zRows[r][0], z1 = zRows[r][1];
  for (let c = 0; c < 2; c++) {
   const u0 = c === 0 ? 0.02 : 0.54, u1 = c === 0 ? 0.46 : 0.98;
   const xW0 = gardR(z0, 8), xW1 = gretaL(z0, 8);
   const xW2 = gardR(z1, 8), xW3 = gretaL(z1, 8);
   SOUTH_DELTA_BLOCKS.push({
    quad: [
     [xW0 + u0 * (xW1 - xW0), z0],
     [xW0 + u1 * (xW1 - xW0), z0],
     [xW2 + u1 * (xW3 - xW2), z1],
     [xW2 + u0 * (xW3 - xW2), z1]
    ],
    name: swNames[r][c],
    patio: (r + c) % 2 === 0 ? 'vegetable' : 'pleasure',
    wealth: r < 2 ? 'middle' : 'poor'
   });

   const xE0 = gretaR(z0, 8), xE1 = xedL(z0, 8);
   const xE2 = gretaR(z1, 8), xE3 = xedL(z1, 8);
   SOUTH_DELTA_BLOCKS.push({
    quad: [
     [xE0 + u0 * (xE1 - xE0), z0],
     [xE0 + u1 * (xE1 - xE0), z0],
     [xE2 + u1 * (xE3 - xE2), z1],
     [xE2 + u0 * (xE3 - xE2), z1]
    ],
    name: seNames[r][c],
    patio: (r + c) % 2 === 0 ? 'working' : 'vegetable',
    wealth: r < 2 ? 'middle' : 'poor'
   });
  }
 }

 // Band A: Southwest Quarter (between SW Wall [-332.9, 367.3] -> [-187.4, 523.4] and Knal de Gardonz)
 const swWallX = z => marInterp(z, [367.3, 523.4, 586.9], [-332.9, -187.4, -42.5]) + 14.0;
 const swBandRows = [[356, 408], [418, 466], [474, 518]];
 for (let r = 0; r < swBandRows.length; r++) {
  const z0 = swBandRows[r][0], z1 = swBandRows[r][1];
  const xL0 = swWallX(z0), xR0 = gardL(z0, 8);
  const xL1 = swWallX(z1), xR1 = gardL(z1, 8);
  const span0 = xR0 - xL0, span1 = xR1 - xL1;
  if (Math.min(span0, span1) > 88) {
   const xm0 = 0.5 * (xL0 + xR0), xm1 = 0.5 * (xL1 + xR1);
   SOUTH_STREETS.push({ ave: false, pts: [[xm0, z0], [xm1, z1]] });
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xL0, z0], [xm0 - 4, z0], [xm1 - 4, z1], [xL1, z1]],
    name: 'Korta de Guesta Sauta ' + (r * 2 + 1),
    patio: r === 0 ? 'pleasure' : 'vegetable',
    wealth: r === 0 ? 'middle' : 'poor'
   });
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xm0 + 4, z0], [xR0, z0], [xR1, z1], [xm1 + 4, z1]],
    name: 'Korta de Guesta Sauta ' + (r * 2 + 2),
    patio: 'vegetable',
    wealth: 'middle'
   });
  } else if (Math.min(span0, span1) > 34) {
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xL0, z0], [xR0, z0], [xR1, z1], [xL1, z1]],
    name: 'Korta de Baluarte Guesta ' + (r + 1),
    patio: 'vegetable',
    wealth: 'poor'
   });
  }
 }

 // Band D: Southeast Quarter (between Knal de Xedaz and SE Wall [331.3, 369.0] -> [242.6, 492.1] -> [120.7, 570.9])
 const seWallX = z => marInterp(z, [369.0, 492.1, 570.9], [331.3, 242.6, 120.7]) - 14.0;
 const seBandRows = [[356, 408], [418, 466], [474, 520]];
 for (let r = 0; r < seBandRows.length; r++) {
  const z0 = seBandRows[r][0], z1 = seBandRows[r][1];
  const xL0 = xedR(z0, 8), xR0 = seWallX(z0);
  const xL1 = xedR(z1, 8), xR1 = seWallX(z1);
  const span0 = xR0 - xL0, span1 = xR1 - xL1;
  if (Math.min(span0, span1) > 88) {
   const xm0 = 0.5 * (xL0 + xR0), xm1 = 0.5 * (xL1 + xR1);
   SOUTH_STREETS.push({ ave: false, pts: [[xm0, z0], [xm1, z1]] });
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xL0, z0], [xm0 - 4, z0], [xm1 - 4, z1], [xL1, z1]],
    name: 'Korta de Marxa Sauta ' + (r * 2 + 1),
    patio: 'working',
    wealth: 'middle',
    shades: true
   });
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xm0 + 4, z0], [xR0, z0], [xR1, z1], [xm1 + 4, z1]],
    name: 'Korta de Marxa Sauta ' + (r * 2 + 2),
    patio: 'vegetable',
    wealth: 'poor',
    shades: true
   });
  } else if (Math.min(span0, span1) > 34) {
   SOUTH_DELTA_BLOCKS.push({
    quad: [[xL0, z0], [xR0, z0], [xR1, z1], [xL1, z1]],
    name: 'Korta de Baluarte Esta ' + (r + 1),
    patio: 'working',
    wealth: 'poor',
    shades: true
   });
  }
 }
})();

const EXTRAMUROS_FINCAS = [
 { quad: [[-348, 538], [-202, 538], [-202, 610], [-348, 610]], name: 'Farma de Sitrus (Extramuros Finca)', crop: 'citrus' },
 { quad: [[-176, 608], [gretaL(608, 16), 608], [gretaL(672, 16), 672], [-176, 672]], name: 'Farma de Rrivar (Extramuros Finca)', crop: 'cane' },
 { quad: [[gretaR(608, 16), 608], [182, 608], [182, 672], [gretaR(672, 16), 672]], name: 'Farma de Mil de Rrom (Extramuros)', crop: 'cane' },
 { quad: [[202, 538], [342, 538], [342, 610], [202, 610]], name: 'Farma de Koton & Indigo (Extramuros)', crop: 'indigo' }
];

// =========================================================================
// 5. 26 FULL-SPAN ARCHED CANAL BRIDGES, 13 SHORE-ATTACHED HARBOUR PIERS & MURAYA DE MARR
// =========================================================================
const MAR_BRIDGES = [
 { name: 'Poinda de Gardonz Nord', x: gardonzCx(-82), z: -82, ry: 0, span: 33 },
 { name: 'Poinda de Gardonz', x: gardonzCx(10), z: 10, ry: 0, span: 33 },
 { name: 'Poinda de Terasaz', x: gardonzCx(102), z: 102, ry: 0, span: 33 },
 { name: 'Poinda de Kistal', x: gardonzCx(198), z: 198, ry: 0, span: 33 },
 { name: 'Poinda de Kreol', x: gardonzCx(280), z: 280, ry: 0, span: 33 },
 { name: 'Poinda de Sauta Gardonz', x: gardonzCx(382), z: 382, ry: 0, span: 33 },
 { name: 'Poinda de Trapiche', x: gardonzCx(443), z: 443, ry: 0, span: 33 },
 { name: 'Poinda de Arka Guesta', x: gardonzCx(504), z: 504, ry: 0, span: 33 },
 { name: 'Poinda de Kostomz', x: gretaCx(-92), z: -92, ry: 0, span: 44 },
 { name: 'Poinda Greta', x: gretaCx(-12), z: -12, ry: 0, span: 44 },
 { name: 'Poinda de Govarnar', x: gretaCx(82), z: 82, ry: 0, span: 44 },
 { name: 'Poinda de Rrom', x: gretaCx(184), z: 184, ry: 0, span: 44 },
 { name: 'Poinda de Alambik', x: gretaCx(278), z: 278, ry: 0, span: 44 },
 { name: 'Poinda de Sauta Greta', x: gretaCx(382), z: 382, ry: 0, span: 44 },
 { name: 'Poinda de Cistal', x: gretaCx(443), z: 443, ry: 0, span: 44 },
 { name: 'Poinda de Tera', x: gretaCx(504), z: 504, ry: 0, span: 44 },
 { name: 'Poinda de Xedaz Nord', x: xedazCx(-55), z: -55, ry: 0, span: 31 },
 { name: 'Poinda de Xedaz', x: xedazCx(48), z: 48, ry: 0, span: 31 },
 { name: 'Poinda de Tanarz', x: xedazCx(152), z: 152, ry: 0, span: 31 },
 { name: 'Poinda de Melaza', x: xedazCx(248), z: 248, ry: 0, span: 31 },
 { name: 'Poinda de Sauta Xedaz', x: xedazCx(382), z: 382, ry: 0, span: 31 },
 { name: 'Poinda de Delta', x: xedazCx(443), z: 443, ry: 0, span: 31 },
 { name: 'Poinda de Arka Esta', x: xedazCx(504), z: 504, ry: 0, span: 31 },
 { name: 'Poinda de Ismoglarz', x: 82, z: ismogCz(82), ry: Math.PI / 2, span: 26 },
 { name: 'Poinda de Sauta Guesta', x: -55, z: sautaCz(-55), ry: Math.PI / 2, span: 25 },
 { name: 'Poinda de Sauta Esta', x: 65, z: sautaCz(65), ry: Math.PI / 2, span: 25 }
];

// Every pier/wharf is positioned so its landward stone abutment sockets directly into the stone shoreline seawall at coastZ(x)
const MAR_PIERS = [
 { name: 'Berth de Kostgarda', key: 'vern_coastguard_berth', x: -162, z: coastZ(-162) - 4.2, ry: Math.PI },
 { name: 'Kostgarda Pier', key: 'vern_pier', x: -102, z: coastZ(-102) - 9.8, ry: Math.PI },
 { name: 'Guarfa de Aduana', key: 'vern_crane_wharf', x: -78, z: coastZ(-78) - 2.4, ry: Math.PI },
 { name: 'Piar de Kostomz', key: 'vern_pier', x: -54, z: coastZ(-54) - 9.8, ry: Math.PI },
 { name: 'Piar de Sidi Olda', key: 'vern_pier', x: -30, z: coastZ(-30) - 9.8, ry: Math.PI },
 { name: 'Islipa de Feri', key: 'vern_ferry_slip', x: 26, z: coastZ(26) - 5.2, ry: Math.PI },
 { name: 'Guarfa de Kren', key: 'vern_crane_wharf', x: 56, z: coastZ(56) - 2.4, ry: Math.PI },
 { name: 'Piar de Marchondaz Guesta', key: 'vern_pier', x: 86, z: coastZ(86) - 9.8, ry: Math.PI },
 { name: 'Piar de Marchondaz Esta', key: 'vern_pier', x: 118, z: coastZ(118) - 9.8, ry: Math.PI },
 { name: 'Landiñ de Fix', key: 'vern_fish_landing', x: 194, z: coastZ(194) - 4.5, ry: Math.PI },
 { name: 'Piar de Xedaz', key: 'vern_pier', x: 226, z: coastZ(226) - 9.8, ry: Math.PI },
 { name: 'Guarfa de Rropa', key: 'vern_crane_wharf', x: 256, z: coastZ(256) - 2.4, ry: Math.PI },
 { name: 'Piar de Rropa', key: 'vern_pier', x: 288, z: coastZ(288) - 9.8, ry: Math.PI }
];

// Muraya de Marr Curtain Wall Chains following the exact user South Wall polyline:
// [[331.3, 369], [242.6, 492.1], [120.7, 570.9], [40.7, 595.3], [-42.5, 586.9], [-187.4, 523.4], [-332.9, 367.3]]
const MAR_WALL_CHAINS = [
 [
  [-256, coastInland(-256, 6)],
  [-328, coastInland(-328, 6)],
  [-364, coastInland(-364, 8)],
  [-374, -80],
  [-374, 40],
  [-370, 155],
  [-362, 265],
  [-332.9, 367.3],
  [-270.0, 434.8]
 ],
 [
  [-250.0, 456.2],
  [-187.4, 523.4],
  [-102.0, 560.8]
 ],
 [
  [-72.0, 574.0],
  [-42.5, 586.9],
  [gretaL(591, 4), southWallZ(gretaL(591, 4))]
 ],
 [
  [gretaR(591, 4), southWallZ(gretaR(591, 4))],
  [28.0, 594.0]
 ],
 [
  [53.0, 591.5],
  [82.0, 582.7]
 ],
 [
  [110.0, 574.2],
  [120.7, 570.9],
  [242.6, 492.1],
  [278.0, 443.0]
 ],
 [
  [296.0, 418.0],
  [331.3, 369.0],
  [356, 265],
  [364, 155],
  [366, 40],
  [366, -55],
  [354, coastInland(354, 6)]
 ]
];

// Outer perimeter rampart towers & bastions (including the vertices of the new South Wall!)
const MAR_BASTIONS = [
 { x: -364, z: coastInland(-364, 8), name: 'Tauar de Pilotaz', kind: 'garita' },
 { x: -374, z: -80, name: 'Tauar de Palmaz', kind: 'garita' },
 { x: -374, z: 40, name: 'Tauar de Fontinz', kind: 'garita' },
 { x: -370, z: 155, name: 'Tauar de Sitrus', kind: 'garita' },
 { x: -362, z: 265, name: 'Tauar de Orkidz', kind: 'garita' },
 { x: -332.9, z: 367.3, name: 'Baluarte de Guesta', kind: 'bastion' },
 { x: -187.4, z: 523.4, name: 'Baluarte de Sauta Guesta', kind: 'bastion' },
 { x: -42.5, z: 586.9, name: 'Tauar de Sauta Guesta', kind: 'garita' },
 { x: 120.7, z: 570.9, name: 'Tauar de Sauta Esta', kind: 'garita' },
 { x: 242.6, z: 492.1, name: 'Baluarte de Sauta Esta', kind: 'bastion' },
 { x: 331.3, z: 369.0, name: 'Baluarte de Marxa', kind: 'bastion' },
 { x: 356, z: 265, name: 'Tauar de Melaza', kind: 'garita' },
 { x: 364, z: 155, name: 'Tauar de Karpindarz', kind: 'garita' },
 { x: 366, z: 40, name: 'Tauar de Smoka', kind: 'garita' },
 { x: 366, z: -55, name: 'Tauar de Dais', kind: 'garita' },
 { x: 354, z: coastInland(354, 6), name: 'Baluarte de Rropa', kind: 'garita' }
];

const MAR_GARITAS = [
 [-295, coastInland(-295, 5), Math.PI],
 [-346, coastInland(-346, 6), Math.PI],
 [-254, -236, -Math.PI / 2],
 [-222, -250, Math.PI],
 [-194, -228, Math.PI / 2],
 [-172, coastInland(-172, 5), Math.PI],
 [-370, -118, -Math.PI / 2],
 [-374, -20, -Math.PI / 2],
 [-372, 96, -Math.PI / 2],
 [-366, 210, -Math.PI / 2],
 [-348, 316, -Math.PI / 2],
 [-296.5, 406.3, -0.75],
 [-223.8, 484.4, -0.75],
 [-138.0, 545.0, -0.42],
 [-18.0, 589.4, 0],
 [78.0, 583.9, 0.3],
 [181.6, 531.5, 0.58],
 [264.8, 461.3, 0.94],
 [309.1, 399.8, 0.94],
 [344, 316, Math.PI / 2],
 [360, 210, Math.PI / 2],
 [365, 96, Math.PI / 2],
 [366, -8, Math.PI / 2],
 [360, -110, Math.PI / 2],
 [326, coastInland(326, 5), Math.PI],
 [258, coastInland(258, 5), Math.PI]
];

const MAR_GATES = [
 { x: -260.1, z: 445.4, name: 'Porta de Gardonz', ry: -0.75 },
 { x: gardonzCx(565), z: southWallZ(gardonzCx(565)), name: 'Arka de Gardonz', ry: 0, waterGate: true, span: 33 },
 { x: gretaCx(591), z: southWallZ(gretaCx(591)), name: 'Arka de Agua & Porta de Iziz', ry: 0, waterGate: true, span: 44 },
 { x: 40.7, z: 595.3, name: 'Porta de Tera', ry: 0 },
 { x: xedazCx(575), z: southWallZ(xedazCx(575)), name: 'Arka de Xedaz', ry: 0, waterGate: true, span: 31 },
 { x: 287.0, z: 430.5, name: 'Porta de Xedaz', ry: 0.94 }
];

// =========================================================================
// 6. PAINT STREETS, WATERFRONT QUAY ESPLANADE, PLAZAS, PARKS & MARKETS ONTO GROUND CANVASES
// =========================================================================
(function paintMarrLayout() {
 // Paint waterfront Malekón quay esplanades along the 4 harbour shoreline fronts
 for (const [x0, x1] of [[-242, -144], [-116, -20], [18, 142], [170, 344]]) {
  const qPts = [];
  for (let k = 0; k <= 12; k++) {
   const x = x0 + (x1 - x0) * (k / 12);
   qPts.push([x, coastZ(x) + 6.5]);
  }
  road(qPts, 11.0, KL.boulevard, { zone: 'thoroughfare' });
 }

 // Paint Island 1, 2, 3 streets
 for (const st of ISLAND1.streets) road(st.pts, st.ave ? 8.5 : 5.5, st.ave ? KL.boulevard : KL.minor, { zone: st.ave ? 'thoroughfare' : 'minor' });
 for (const st of ISLAND2.streets) road(st.pts, st.ave ? 8.0 : 5.5, st.ave ? KL.boulevard : KL.minor, { zone: st.ave ? 'thoroughfare' : 'minor' });
 for (const st of ISLAND3.streets) road(st.pts, st.ave ? 8.0 : 5.5, st.ave ? KL.boulevard : KL.minor, { zone: st.ave ? 'thoroughfare' : 'minor' });

 // Paint Left Bank (Qartar de Gardonz) radiating streets & Paseo de Gardonz
 for (const uSt of [0.01, 0.28, 0.605, 0.99]) {
  const pts = [];
  for (let k = 0; k <= 16; k++) pts.push(mapLeftTurned(uSt, 0.01 + 0.98 * (k / 16)));
  road(pts, uSt === 0.605 ? 14.0 : 6.5, uSt === 0.605 ? KL.boulevard : KL.minor, { zone: uSt === 0.605 ? 'thoroughfare' : 'minor' });
 }
 for (const vSt of [0.01, 0.252, 0.498, 0.742, 0.99]) {
  const pts = [];
  for (let k = 0; k <= 12; k++) pts.push(mapLeftTurned(0.01 + 0.98 * (k / 12), vSt));
  road(pts, 6.5, KL.minor, { zone: 'minor' });
 }

 // Paseo de Gardonz park discs
 for (let k = 0; k < 4; k++) {
  const p = mapLeftTurned(0.605, 0.13 + k * 0.25);
  disc(p[0], p[1], 10, 'park', '#548c46');
  PARKS.push({ x: p[0], z: p[1], r: 10, name: 'Paseo de Gardonz' });
 }

 // Paint Right Bank (De Xedaz) radiating streets
 for (const uSt of [0.01, 0.335, 0.665, 0.99]) {
  const pts = [];
  for (let k = 0; k <= 16; k++) pts.push(mapRightTurned(uSt, 0.01 + 0.98 * (k / 16)));
  road(pts, uSt === 0.335 ? 8.5 : 6.0, uSt === 0.335 ? KL.boulevard : KL.minor, { zone: uSt === 0.335 ? 'thoroughfare' : 'minor' });
 }
 for (const vSt of [0.01, 0.252, 0.498, 0.742, 0.99]) {
  const pts = [];
  for (let k = 0; k <= 12; k++) pts.push(mapRightTurned(0.01 + 0.98 * (k / 12), vSt));
  road(pts, 6.0, KL.minor, { zone: 'minor' });
 }

 // Paint Southern Extension streets
 for (const st of SOUTH_STREETS) {
  road(st.pts, st.ave ? 8.5 : 6.0, st.ave ? KL.boulevard : KL.minor, { zone: st.ave ? 'thoroughfare' : 'minor' });
 }

 // Grid-Break Band streets, Parks & Markets
 for (const B of [ISLAND2_BAND, ISLAND3_BAND, LEFT_BAND1, LEFT_BAND2, RIGHT_BAND3, RIGHT_BAND4]) {
  for (const st of B.streets) road(st, 6.0, KL.minor, { zone: 'minor' });
  if (B.wedge) {
   polyZone(B.wedge.poly, B.wedge.kind === 'park' ? 'park' : 'plaza');
   if (B.wedge.kind === 'park') {
    PARKS.push(B.wedge);
   } else {
    MARKETS.push(B.wedge);
    LIFE_DESTS.market.push([B.wedge.x, B.wedge.z]);
   }
  }
 }

 // Isqer Greta (Grand Civic Plaza on Isla de Sidi Olda between Templa de Son & Si and Palas de Govarnar)
 const isqerPoly = [ISLAND1.N[1][1], ISLAND1.N[3][1], ISLAND1.N[3][2], ISLAND1.N[1][2]];
 polyZone(isqerPoly, 'plaza', '#b8a890');
 const isqerCx = 0.25 * (isqerPoly[0][0] + isqerPoly[1][0] + isqerPoly[2][0] + isqerPoly[3][0]);
 const isqerCz = 0.25 * (isqerPoly[0][1] + isqerPoly[1][1] + isqerPoly[2][1] + isqerPoly[3][1]);
 MARKETS.push({ kind: 'plaza', name: 'Isqer Greta', poly: isqerPoly, x: isqerCx, z: isqerCz, r: 22 });

 // Gate roads extending south to Extramuros Fincas from the new South Wall gates
 road([[40.7, 560], [40.7, 675]], 10.0, KL.boulevard, { zone: 'gate:south' });
 road([[-260, 445], [-275, 610]], 9.0, KL.boulevard, { zone: 'gate:west' });
 road([[287, 430], [275, 610]], 9.0, KL.boulevard, { zone: 'gate:east' });

 cityBakeMasks();
})();
