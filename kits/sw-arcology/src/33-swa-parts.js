// ---------------------------------------------------------------- SW Arcology reclaimed tank, silo, sphere & ag-dome cores
// Built on the KratorPostApoc geometry & material engine (30-geo.js .. 36-def.js). Every builder draws in the CURRENT frame
// with its foot at y=0, +z facing the street. Avoids || <number> (ORNUM); uses KRAND rng/rr/pick only.

const swaCols = {
  tank: [0x8b8e88, 0x7c8480, 0x8e8374, 0x6f7b7c, 0x979388],
  stain: [0xb8bec0, 0xaab2b6, 0xc4c9ca],
  drum: [0x7a543c, 0x4c6670, 0x8c6d3e, 0x5c6a58, 0x7c483c],
  vothStone: [0x8c8579, 0x958e80, 0x87816f],
  basalt: [0x2e2c2a, 0x363330],
  porph: [0x5e1e2d, 0x6a2434]
};

function swaNum(v, d) { return v == null ? d : v; }

// Riveted chemical or oil drum core (vertical): concrete pad, rolled steel rings, manway hatch, roof vent
function swaDrum(o) {
  o = o || {};
  const r = swaNum(o.r, 2.6), h = swaNum(o.h, 5.4);
  const col = o.col === undefined ? jc(pick(swaCols.drum), 0.05) : jc(o.col, 0.04);
  const bandC = jc(0x3e3934, 0.05), padC = jc(0x989488, 0.05);
  cyl('conc', 0, 0, 0, r + 0.18, 0.32, padC, 18);
  cyl('sheet', 0, 0.3, 0, r, h - 0.3, col, 18, r, true);
  const nb = Math.max(2, Math.round(h / 1.5));
  for (let i = 1; i < nb; i++) {
    cyl('iron', 0, 0.3 + (h - 0.3) * (i / nb), 0, r + 0.045, 0.09, bandC, 18);
  }
  const rh = swaNum(o.roofRise, r * 0.22);
  cyl('iron', 0, h - 0.06, 0, r + 0.1, 0.12, bandC, 18);
  cyl('sheet', 0, h, 0, r + 0.14, rh, jc(swaNum(o.roofCol, 0x6c665e), 0.05), 18, r * 0.18);
  cyl('iron', 0, h + rh - 0.04, 0, r * 0.2, 0.24, bandC, 10);
  if (o.manway !== false) {
    const ma = swaNum(o.manwayAng, 1.85);
    W(Math.sin(ma) * (r + 0.04), 1.15, Math.cos(ma) * (r + 0.04), ma, () => {
      cylH('iron', 0, 0, 0, 0.42, 0.16, bandC, 'z', 12);
      cylH('steel', 0, 0, 0.09, 0.34, 0.06, jc(0x7c7a74, 0.05), 'z', 12);
    });
  }
  return { r: r, h: h, top: h + rh };
}

// Conical-bottom feed/scrap hopper on 4 braced H-beam legs
function swaHopper(o) {
  o = o || {};
  const r = swaNum(o.r, 2.1), legH = swaNum(o.legH, 2.5), bodyH = swaNum(o.bodyH, 2.8);
  const col = o.col === undefined ? jc(pick(swaCols.tank), 0.05) : jc(o.col, 0.04);
  const ir = jc(0x463e38, 0.05);
  for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * PI / 2;
    const lx = Math.cos(a) * (r * 0.86), lz = Math.sin(a) * (r * 0.86);
    box('conc', lx, 0, lz, 0.45, 0.22, 0.45, jc(0x8e8a80, 0.04));
    beam('iron', [lx, 0.2, lz], [lx * 0.96, legH + 0.9, lz * 0.96], 0.13, ir);
    const b = (i + 1.5) * PI / 2;
    beam('iron', [lx, 0.8, lz], [Math.cos(b) * (r * 0.84), legH + 0.3, Math.sin(b) * (r * 0.84)], 0.06, ir);
  }
  // Inverted cone chute: frustum from small mouth r*0.28 up to r
  cyl('sheet', 0, legH - 0.9, 0, r * 0.26, 1.1, jc(0x5c554e, 0.05), 14, r, true);
  box('iron', 0, legH - 1.02, 0, r * 0.64, 0.14, r * 0.64, ir);
  cyl('corrH', 0, legH + 0.2, 0, r, bodyH, col, 16, r, true);
  cyl('iron', 0, legH + 0.2 + bodyH - 0.06, 0, r + 0.09, 0.12, ir, 16);
  cyl('sheet', 0, legH + 0.2 + bodyH, 0, r + 0.15, r * 0.28, jc(0x9a4e30, 0.05), 16, r * 0.16);
  return { r: r, top: legH + 0.2 + bodyH + r * 0.28 };
}

// Elevated Horton-sphere pressure vessel on n braced tubular columns
function swaSphere(o) {
  o = o || {};
  const r = swaNum(o.r, 4.4), cy = swaNum(o.cy, 7.6), legs = swaNum(o.legs, 6);
  const col = o.col === undefined ? jc(pick(swaCols.stain), 0.04) : jc(o.col, 0.04);
  const ir = jc(0x48423c, 0.05);
  sph('steel', 0, cy, 0, r, col, 0.96);
  // Equatorial weld belt & meridian seam bands
  cyl('iron', 0, cy - 0.09, 0, r + 0.05, 0.18, ir, 24);
  cyl('iron', 0, cy + r * 0.52, 0, r * 0.86, 0.08, ir, 20);
  cyl('iron', 0, cy - r * 0.52, 0, r * 0.86, 0.08, ir, 20);
  const lr = r * 0.94;
  for (let i = 0; i < legs; i++) {
    const a = (i / legs) * TAU + 0.26;
    const x0 = Math.cos(a) * (lr + 0.45), z0 = Math.sin(a) * (lr + 0.45);
    const x1 = Math.cos(a) * lr, z1 = Math.sin(a) * lr;
    cyl('conc', x0, 0, z0, 0.42, 0.35, jc(0x928e84, 0.04), 10);
    beam('iron', [x0, 0.3, z0], [x1, cy - 0.2, z1], 0.15, ir, true, 8);
    const b = ((i + 1) / legs) * TAU + 0.26;
    const nx0 = Math.cos(b) * (lr + 0.45), nz0 = Math.sin(b) * (lr + 0.45);
    const nx1 = Math.cos(b) * lr, nz1 = Math.sin(b) * lr;
    beam('iron', [x0, 1.3, z0], [nx1, cy - 1.6, nz1], 0.055, ir, true, 6);
    beam('iron', [nx0, 1.3, nz0], [x1, cy - 1.6, z1], 0.055, ir, true, 6);
  }
  // Crown relief valve & catwalk ring
  cyl('iron', 0, cy + r * 0.93, 0, 0.65, 0.35, ir, 12);
  cyl('steel', 0, cy + r * 0.93 + 0.35, 0, 0.18, 0.9, col, 8);
  return { r: r, cy: cy, top: cy + r * 0.96 + 1.2 };
}

// Polished stainless bioreactor / seed-vault cylinder on a riveted skirt
function swaReactor(o) {
  o = o || {};
  const r = swaNum(o.r, 2.8), h = swaNum(o.h, 6.8);
  const col = jc(pick(swaCols.stain), 0.03), ir = jc(0x464442, 0.04);
  cyl('conc', 0, 0, 0, r + 0.24, 0.38, jc(0xa6a298, 0.04), 20);
  cyl('iron', 0, 0.36, 0, r + 0.06, 1.1, ir, 20);
  cyl('steel', 0, 1.42, 0, r, h - 1.8, col, 22, r, true);
  for (const f of [0.35, 0.68, 0.95]) {
    cyl('iron', 0, 1.42 + (h - 1.8) * f, 0, r + 0.05, 0.09, ir, 22);
  }
  sph('steel', 0, h - 0.45, 0, r, col, 0.38);
  // Louvered botanical vent hood at apex
  cyl('iron', 0, h + r * 0.34, 0, r * 0.36, 0.55, ir, 12);
  cone('steel', 0, h + r * 0.34 + 0.52, 0, r * 0.48, 0.42, col, 12);
  return { r: r, top: h + r * 0.34 + 0.94 };
}

// Concrete water-treatment clarifier ring with central bridge pier
function swaClarifier(o) {
  o = o || {};
  const R = swaNum(o.R, 7.6), wallH = swaNum(o.wallH, 2.4), th = swaNum(o.th, 0.55);
  const gap = swaNum(o.gap, 0.32), concC = jc(0xa6a094, 0.04), rimC = jc(0x888278, 0.04);
  // Ring wall leaving front entry gap around +z (angle PI/2 in sector coords)
  const fa = PI / 2;
  sector('conc', 0, 0, R - th, R, fa + gap, fa + TAU - gap, 0, wallH, concC);
  sector('conc', 0, 0, R - th - 0.08, R + 0.08, fa + gap, fa + TAU - gap, wallH, 0.18, rimC);
  cyl('conc', 0, 0, 0, R - th, 0.16, jc(0x7c786e, 0.05), 24);
  cyl('conc', 0, 0.16, 0, 1.25, wallH + 0.5, concC, 14);
  cyl('iron', 0, wallH + 0.66, 0, 1.35, 0.16, jc(0x48403a, 0.05), 14);
  return { R: R, wallH: wallH };
}

// Exterior spiral / stepped bracket stair wrapping a cylindrical tank of radius r
function swaSpiralStair(r, y0, y1, a0, turns, w) {
  const ww = swaNum(w, 0.95), dy = y1 - y0;
  const steps = Math.max(6, Math.round(dy / 0.24));
  const da = (turns * TAU) / steps;
  const fc = jc(0x4a4038, 0.05), tc = jc(0x827e78, 0.05);
  for (let i = 0; i <= steps; i++) {
    const a = a0 + i * da, y = y0 + (dy * i) / steps;
    const mr = r + ww * 0.5 + 0.06;
    const x = Math.sin(a) * mr, z = Math.cos(a) * mr;
    W(x, y, z, a + PI / 2, () => {
      box('steel', 0, -0.04, 0, 0.34, 0.04, ww, tc);
      beam('iron', [0, -0.22, -ww * 0.48], [0, -0.02, ww * 0.46], 0.05, fc);
      if (i % 2 === 0) {
        beam('iron', [0, 0, ww * 0.46], [0, 0.96, ww * 0.46], 0.04, fc, true, 5);
      }
    });
    if (i > 0) {
      const pa = a0 + (i - 1) * da, py = y0 + (dy * (i - 1)) / steps;
      const or = r + ww + 0.04;
      beam('iron',
        [Math.sin(pa) * or, py + 0.96, Math.cos(pa) * or],
        [Math.sin(a) * or, y + 0.96, Math.cos(a) * or], 0.045, fc, true, 5);
    }
  }
}

// Header pipe manifold with gate-valve wheels along a wall
function swaValveHeader(x, y, z, L, ry, n) {
  const cnt = swaNum(n, 3), pc = jc(0x565c58, 0.05), wc = jc(0xa8382c, 0.05);
  W(x, y, z, swaNum(ry, 0), () => {
    cylH('iron', 0, 0.85, 0, 0.11, L, pc, 'x', 10);
    for (let i = 0; i < cnt; i++) {
      const px = cnt === 1 ? 0 : -L * 0.38 + (i * L * 0.76) / (cnt - 1);
      cyl('iron', px, 0, 0, 0.08, 0.85, pc, 8);
      cylH('iron', px, 0.85, 0.18, 0.05, 0.26, pc, 'z', 6);
      tire(px, 0.85, 0.32, 0.22, 0.035, wc, 0, PI / 2, 0);
    }
  });
}

// Preserved Ancient geodesic glass/polycarbonate conservatory ag-dome (Tenders' herb & reagent domes)
function swaGeoDome(o) {
  o = o || {};
  const R = swaNum(o.R, 7.2), ringH = swaNum(o.ringH, 1.55), domeH = swaNum(o.domeH, 6.2);
  const seg = 12, rings = 4;
  const concC = jc(0xd0ccc2, 0.03), ribC = jc(0xb8bebc, 0.04), hdrC = jc(0x526466, 0.05);
  const glsC = jc(0x9ec8c2, 0.05), warmC = jc(0xebd08c, 0.04);
  const gap = 0.28, fa = PI / 2;
  // Bolted Ancient ceramic/steel header ring leaving airlock gap at +z
  sector('conc', 0, 0, R - 0.42, R + 0.12, fa + gap, fa + TAU - gap, 0, ringH, concC);
  cyl('conc', 0, 0, 0, R - 0.4, 0.14, jc(0x948e82, 0.04), 20);
  // Header water/nutrient pipe circling waist
  for (let i = 1; i < seg - 1; i++) {
    const a0 = fa + gap + (i / seg) * (TAU - 2 * gap);
    const a1 = fa + gap + ((i + 1) / seg) * (TAU - 2 * gap);
    beam('iron',
      [Math.cos(a0) * (R + 0.2), ringH * 0.65, Math.sin(a0) * (R + 0.2)],
      [Math.cos(a1) * (R + 0.2), ringH * 0.65, Math.sin(a1) * (R + 0.2)], 0.09, hdrC, true, 6);
  }
  // Geodesic rib lattice & glazed facets
  for (let r = 0; r < rings; r++) {
    const t0 = (r / rings) * (PI * 0.46), t1 = ((r + 1) / rings) * (PI * 0.46);
    const rad0 = Math.cos(t0) * R, y0 = ringH + Math.sin(t0) * domeH;
    const rad1 = Math.cos(t1) * R, y1 = ringH + Math.sin(t1) * domeH;
    for (let s = 0; s < seg; s++) {
      const a0 = (s / seg) * TAU, a1 = ((s + 1) / seg) * TAU;
      const p00 = [Math.cos(a0) * rad0, y0, Math.sin(a0) * rad0];
      const p10 = [Math.cos(a1) * rad0, y0, Math.sin(a1) * rad0];
      const p01 = [Math.cos(a0) * rad1, y1, Math.sin(a0) * rad1];
      const p11 = [Math.cos(a1) * rad1, y1, Math.sin(a1) * rad1];
      beam('steel', p00, p10, 0.075, ribC);
      beam('steel', p00, p01, 0.075, ribC);
      beam('steel', p00, p11, 0.05, ribC);
      // Glazed polycarbonate/glass panel (every 5th panel slightly frosted/vented)
      if ((r + s) % 5 === 0 && r === 1) {
        plane4('sheet', p00, p10, p01, p11, 0.03, jc(0xc8c4ba, 0.04));
      } else {
        plane4('glass', p00, p10, p01, p11, 0.03, (r === 0 && s % 3 === 0) ? warmC : glsC);
      }
    }
  }
  // Crown climate louver ring & misting lamp halo
  cyl('steel', 0, ringH + domeH * 0.97, 0, R * 0.2, 0.48, ribC, 12);
  cone('steel', 0, ringH + domeH * 0.97 + 0.46, 0, R * 0.28, 0.35, concC, 12);
  sph('glow', 0, ringH + domeH * 0.68, 0, 0.24, jc(0xffe09a, 0.03));
  // Interior raised botanical beds visible through glazing
  for (const sx of [-1, 1]) {
    box('conc', sx * (R * 0.42), 0.14, -0.4, R * 0.36, 0.62, R * 0.88, jc(0x8e887c, 0.04));
    box('earth', sx * (R * 0.42), 0.74, -0.4, R * 0.3, 0.08, R * 0.8, jc(0x4e3c2c, 0.05));
    for (const pz of [-2.2, 0, 1.8]) {
      plant(sx < 0 ? 'shrub' : 'crop', sx * (R * 0.42), 0.8, pz - 0.4, { r: 0.55, h: 1.1, moisture: 'wet' });
    }
  }
  return { R: R, top: ringH + domeH + 0.8 };
}

// Cataclysm-cracked quarantined feral ag-dome: welded steel bulkheads, KHAZ warning chevrons, bursting feral vines
function swaFeralDome(o) {
  o = o || {};
  const R = swaNum(o.R, 8.0), ringH = swaNum(o.ringH, 1.7), domeH = swaNum(o.domeH, 6.6);
  const seg = 12, rings = 4;
  const concC = jc(0x9a9488, 0.05), ribC = jc(0x544a42, 0.06), plateC = jc(0x5c4234, 0.06);
  const darkGls = jc(0x3b5848, 0.06), sporeG = jc(0x9ac84a, 0.05);
  cyl('conc', 0, 0, 0, R + 0.15, ringH, concC, 20);
  // Alternating black & ochre quarantine hazard stripes around base ring
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    W(Math.sin(a) * (R + 0.17), 0.25, Math.cos(a) * (R + 0.17), a, () => {
      box('sheet', 0, 0, 0, 0.9, 0.36, 0.04, i % 2 === 0 ? jc(0xd49624, 0.04) : jc(0x242220, 0.03));
    });
  }
  // Cracked geodesic dome with missing top-east breach (sectors 2..4, rings 2..3 blown out)
  for (let r = 0; r < rings; r++) {
    const t0 = (r / rings) * (PI * 0.46), t1 = ((r + 1) / rings) * (PI * 0.46);
    const rad0 = Math.cos(t0) * R, y0 = ringH + Math.sin(t0) * domeH;
    const rad1 = Math.cos(t1) * R, y1 = ringH + Math.sin(t1) * domeH;
    for (let s = 0; s < seg; s++) {
      const breach = (r >= 2 && s >= 1 && s <= 4) || (r === 1 && s === 2);
      const a0 = (s / seg) * TAU, a1 = ((s + 1) / seg) * TAU;
      const p00 = [Math.cos(a0) * rad0, y0, Math.sin(a0) * rad0];
      const p10 = [Math.cos(a1) * rad0, y0, Math.sin(a1) * rad0];
      const p01 = [Math.cos(a0) * rad1, y1, Math.sin(a0) * rad1];
      const p11 = [Math.cos(a1) * rad1, y1, Math.sin(a1) * rad1];
      beam('iron', p00, p10, 0.08, ribC);
      if (!breach) {
        beam('iron', p00, p01, 0.08, ribC);
        if ((r + s) % 3 === 0) {
          // Welded salvage steel patch plate sealing cracked glazing
          plane4('corr', p00, p10, p01, p11, 0.05, plateC);
        } else {
          plane4('glass', p00, p10, p01, p11, 0.03, darkGls);
        }
      } else {
        // Bent snapped rib stub jutting into breach
        beam('iron', p00, [(p00[0] + p01[0]) * 0.5, (p00[1] + p01[1]) * 0.5 + 0.35, (p00[2] + p01[2]) * 0.5], 0.07, ribC);
      }
    }
  }
  // Out-of-control feral flora bursting through the dome breach (tagged via plant() + spore glow)
  sph('glow', 2.4, ringH + domeH * 0.55, 1.6, 0.35, sporeG);
  for (const [vx, vy, vz, vr, vh] of [
    [2.6, ringH + domeH * 0.52, 1.8, 1.4, 3.6],
    [3.8, ringH + domeH * 0.38, 2.5, 1.1, 2.8],
    [1.2, ringH + domeH * 0.68, 2.2, 1.2, 3.2]
  ]) {
    plant('tree', vx, vy - 1.4, vz, { r: vr, h: vh, moisture: 'wet', cultivated: false, tags: { feral: true } });
  }
  return { R: R, top: ringH + domeH + 1.2 };
}
