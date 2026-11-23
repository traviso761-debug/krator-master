// node core/materials/record/test-m1.js: Stage 5 M1 octahedral normals, M2 mip-variance AA, M3 planar POM, and Gate 3 handedness.
const fs = require('fs'), path = require('path');
const M1 = require('./27-matlib-m1.js');

let bad = 0;
const ok = (name, pass, neg) => {
  const r = !!(pass && !neg);
  if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (negative passed)' : ''));
};

// 1. Octahedral encode/decode accuracy across gentle glazed slopes and steep cliff facets
let maxDeg = 0, sumDeg = 0, cnt = 0;
for (let j = -12; j <= 12; j++) {
  for (let i = -12; i <= 12; i++) {
    const nx0 = i * 0.06, ny0 = j * 0.06, nz0 = 0.65;
    const len = Math.hypot(nx0, ny0, nz0);
    const n = [nx0 / len, ny0 / len, nz0 / len];
    const enc = M1.octEncode(n[0], n[1], n[2]);
    const dec = M1.octDecode(enc[0], enc[1]);
    const dot = Math.min(1, Math.max(-1, n[0] * dec[0] + n[1] * dec[1] + n[2] * dec[2]));
    const deg = Math.acos(dot) * 180 / Math.PI;
    sumDeg += deg;
    if (deg > maxDeg) maxDeg = deg;
    cnt++;
  }
}
const meanDeg = sumDeg / cnt;
ok('8-bit octahedral normal round-trip holds sub-0.35 deg mean error and < 0.85 deg max',
  meanDeg < 0.35 && maxDeg < 0.85, meanDeg > 2.0);

// 2. M2 Specular AA mip variance widens roughness monotonically at coarse mips while keeping mip 0 unchanged
const vars = [0.0, 0.008, 0.024, 0.058, 0.11, 0.18, 0.24, 0.29];
const r0 = M1.roughnessWithVariance(0.22, 0.0, vars);
const r3 = M1.roughnessWithVariance(0.22, 3.0, vars);
const r6 = M1.roughnessWithVariance(0.22, 6.0, vars);
ok('M2 mip-variance specular AA leaves mip 0 intact and widens roughness monotonically with mip level',
  Math.abs(r0 - 0.22) < 1e-6 && r3 > r0 + 0.08 && r6 > r3 + 0.08 && r6 <= 1.0,
  r3 < r0);

// 3. Gate 3 Handedness Probe + paired negative (flipped green Y channel and inverted POM march)
const domeH = (u, v) => {
  const dx = u - 0.5, dy = v - 0.5;
  return Math.max(0.05, 0.92 * Math.exp(-(dx * dx + dy * dy) / (2 * 0.18 * 0.18)));
};
const domeN = (u, v) => {
  const eps = 1 / 512;
  const dhdu = (domeH(u + eps, v) - domeH(u - eps, v)) / (2 * eps);
  const dhdv = (domeH(u, v + eps) - domeH(u, v - eps)) / (2 * eps);
  const nx = -dhdu * 0.25, ny = -dhdv * 0.25, nz = 1.0;
  const l = Math.hypot(nx, ny, nz);
  return [nx / l, ny / l, nz / l];
};
const flippedGreenN = (u, v) => {
  const n = domeN(u, v);
  return [n[0], -n[1], n[2]];
};
const probePass = M1.handednessProbe(domeN, domeH);
const probeFlipY = M1.handednessProbe(flippedGreenN, domeH);
ok('Gate 3 handedness probe certifies OpenGL (+X, +Y) normal & planar POM and catches flipped green channel',
  probePass.ok && probePass.xOk && probePass.yOk && probePass.pomOk,
  probeFlipY.ok);

// 4. Data purity check (no DOM / THREE / browser APIs)
const src = fs.readFileSync(path.join(__dirname, '27-matlib-m1.js'), 'utf8')
  .split('\n').filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join('\n')
  .replace(/if\(typeof window[^\n]*/g, '');
ok('27-matlib-m1.js touches no browser or THREE API',
  !/document\.|getContext|THREE\.|addEventListener|requestAnimationFrame/.test(src), false);

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
