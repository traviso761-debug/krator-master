// ================================================================= 69s. DILIHAN VASSAL KIT — Passive-Cooling Architectural Grammar
// [draw] Reusable local-frame helpers (prefix dln*) over 69b/69c/69e/69e5 and 69r-dil-mat.js:
//   - Splash-proof basalt/laterite monsoon plinths + cream lime-mortar cap courses (dlnPlinth)
//   - Kiln-fired red/terracotta-orange brick wings with quoins & stringcourses (dlnBrickWing)
//   - Corbeled brick + cream mortar + Iziz-orange fascia cornices matched to Vernacular bands (dlnCornice)
//   - Recessed red-brick arched shade loggias & upper sleeping verandas (dlnArcade)
//   - Perforated honeycomb/diamond red-brick jali (cobogo) breeze-screens (dlnJali)
//   - Open tropical windows with outward-propped jalousie louver shutters & slatted sun-hoods (dlnOpenWin, dlnSunHood)
//   - Evaporative cooling impluvium pools, brick courtyards, zaguan breezeways & zeer water jars (dlnImpluvium, dlnCourtyard, dlnZeerCluster)
//   - Taut Iziz-orange/linen courtyard shade-sails & bamboo/teak shade pergolas (dlnShadeSail, dlnPergola)
//   - Deep-eaved monsoon roofs with raised clerestory ridge-vent monitors & malqaf wind-catchers (dlnMonitorRoof, dlnWindCatcher)

function dlnPick(a) { return a[(rng() * a.length) | 0]; }
function dlnBrickTint(warm) { return vC(dlnPick(warm ? DL_PAL.brickWarm : DL_PAL.brick)); }
function dlnMortarTint() { return vC(dlnPick(DL_PAL.mortar)); }
function dlnOrangeTint() { return vC(dlnPick(DL_PAL.orange)); }
function dlnTrimTint() { return vC(dlnPick(DL_PAL.trim)); }
function dlnLouverTint() { return vC(dlnPick(DL_PAL.louver)); }
function dlnTileTint() { return vC(dlnPick(DL_PAL.tile)); }

/* 1. Splash-proof dark basalt/laterite plinth with cream lime-mortar drip cap against monsoon downpours */
function dlnPlinth(x, y, z, w, d, h, ry, o) {
  o = o || {};
  const latC = vC(dlnPick(DL_PAL.laterite));
  const morC = dlnMortarTint();
  const capH = Math.min(0.14, h * 0.26);
  vB('dlLateriteB', x, y - 0.12, z, w + 0.36, h - capH + 0.12, d + 0.36, ry, latC);
  vB('dlMortarB', x, y + h - capH, z, w + 0.24, capH, d + 0.24, ry, morC);
  return y + h;
}

/* 2. Kiln-fired red/orange brick wing with oxblood base course, optional cream mortar belt & corner quoins */
function dlnBrickWing(x, y, z, w, h, d, ry, o) {
  o = o || {};
  const item = o.item || 'dlBrickB';
  const bc = o.c || dlnBrickTint(o.warm);
  const morC = dlnMortarTint();
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  vnBody(item, x, y, z, w, h, d, ry, bc, { t: o.t == null ? 0.30 : o.t });
  /* Oxblood soldier base course just proud of wall */
  if (o.baseBand !== false && h > 1.8) {
    vB('dlBrickDeepB', x, y, z, w + 0.08, 0.26, d + 0.08, ry, deepC);
  }
  /* Mid-height cream lime-mortar stringcourse (multi-storey wings) */
  if (o.beltY != null) {
    vB('dlMortarB', x, y + o.beltY, z, w + 0.18, 0.22, d + 0.18, ry, morC);
    if (o.orangeBelt) {
      vB('vWood', x, y + o.beltY + 0.22, z, w + 0.14, 0.10, d + 0.14, ry, dlnOrangeTint());
    }
  }
  /* Stepped cream-mortar or oxblood-brick corner quoins */
  if (o.quoins !== false && w >= 4.5 && d >= 4.5) {
    const qItem = o.quoinItem || 'dlMortarB';
    const qC = qItem === 'dlMortarB' ? morC : deepC;
    const nQ = Math.max(3, Math.floor(h / 0.72));
    const qh = (h - 0.3) / nQ;
    for (let k = 0; k < nQ; k++) {
      const longX = (k % 2) === 0;
      const qw = longX ? 0.46 : 0.30;
      const qd = longX ? 0.30 : 0.46;
      const yy = y + 0.18 + k * qh;
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const p = loc(x, z, sx * (w * 0.5 - qw * 0.5 + 0.05), sz * (d * 0.5 - qd * 0.5 + 0.05), ry);
          vB(qItem, p[0], yy, p[1], qw, qh * 0.78, qd, ry, qC);
        }
      }
    }
  }
}

/* 3. Hybrid Dilihan cornice: corbeled red/ochre brick step + cream mortar fillet + Iziz Imperial orange fascia */
function dlnCornice(x, y, z, w, d, ry, o) {
  o = o || {};
  const morC = dlnMortarTint();
  const brkC = vC(dlnPick(DL_PAL.brickOchre));
  const orgC = dlnOrangeTint();
  vB('dlBrickOchreB', x, y, z, w + 0.24, 0.20, d + 0.24, ry, brkC);
  vB('dlMortarB', x, y + 0.20, z, w + 0.44, 0.18, d + 0.44, ry, morC);
  vB('vWood', x, y + 0.38, z, w + 0.56, 0.16, d + 0.56, ry, orgC);
  return y + 0.54;
}

/* 4. Angled slatted jalousie sun-hood or striped Iziz-orange shade canopy over a window/door */
function dlnSunHood(x, y, z, ry, w, out, o) {
  o = o || {};
  const lvC = dlnLouverTint();
  const pr = out == null ? 0.78 : out;
  const tilt = 0.42;
  const hc = loc(x, z, 0, pr * 0.5 + 0.08, ry);
  const q = vQ(ry, tilt, 0);
  if (o.canvas) {
    const useRed = o.stripeRed || (((Math.round(x * 2) + Math.round(z * 2)) & 1) === 1);
    kput(useRed ? 'vClothRB' : 'vClothB', [hc[0], y - Math.tan(tilt) * pr * 0.45 + 0.12, hc[1]], q,
      [w + 0.36, 0.06, pr / Math.cos(tilt)], useRed ? vC(0xffffff) : dlnOrangeTint());
    /* Scalloped orange valance bar at front edge */
    const vf = loc(x, z, 0, pr + 0.06, ry);
    vB('vWood', vf[0], y - Math.tan(tilt) * pr - 0.02, vf[1], w + 0.36, 0.12, 0.05, ry, dlnOrangeTint());
  } else {
    /* Slatted timber/terracotta brise-soleil hood with individual louver blades */
    kput('vWood', [hc[0], y - Math.tan(tilt) * pr * 0.45 + 0.12, hc[1]], q, [w + 0.38, 0.06, pr / Math.cos(tilt)], lvC);
    const nSlats = Math.max(3, Math.round(pr / 0.18));
    for (let k = 1; k <= nSlats; k++) {
      const t = k / (nSlats + 1);
      const sp = loc(x, z, 0, 0.10 + pr * t, ry);
      vB('vWood', sp[0], y + 0.10 - Math.tan(tilt) * pr * t, sp[1], w + 0.30, 0.04, 0.11, ry, lvC);
    }
    const vf = loc(x, z, 0, pr + 0.08, ry);
    vB('vWood', vf[0], y - Math.tan(tilt) * pr + 0.04, vf[1], w + 0.40, 0.09, 0.06, ry, dlnOrangeTint());
  }
  /* Diagonal knee-brackets back to wall jambs */
  for (const s of [-1, 1]) {
    const a = loc(x, z, s * (w * 0.5 - 0.06), 0.06, ry);
    const b = loc(x, z, s * (w * 0.5 - 0.06), pr * 0.85, ry);
    vBeam([a[0], y - 0.38, a[1]], [b[0], y - Math.tan(tilt) * pr * 0.82 + 0.06, b[1]], 0.06, lvC);
  }
}

/* 5. Wide airy window with outward-propped hinged louver shutters, cream mortar sill, brick lintel & sun-hood */
function dlnOpenWin(x, y, z, ry, w, h, o) {
  o = o || {};
  const lvC = dlnLouverTint();
  const morC = dlnMortarTint();
  const orgC = dlnOrangeTint();
  const kind = o.kind || (vLit() ? 'lit' : 'open');
  vnWin(x, y, z, ry, w, h, kind, 'vWood', lvC, false);
  /* Cream mortar projecting drip-sill + ochre brick soldier lintel + Iziz orange keystone */
  const ps = loc(x, z, 0, 0.13, ry);
  vB('dlMortarB', ps[0], y - 0.15, ps[1], w + 0.44, 0.13, 0.28, ry, morC);
  vB('dlBrickOchreB', ps[0], y + h + 0.02, ps[1], w + 0.42, 0.22, 0.22, ry, vC(dlnPick(DL_PAL.brickOchre)));
  const pk = loc(x, z, 0, 0.16, ry);
  vB('vWood', pk[0], y + h + 0.01, pk[1], 0.24, 0.26, 0.24, ry, orgC);

  /* Hinged slatted jalousie shutters swung open (~34 deg) on both jambs to catch cross-breezes */
  if (o.shutters !== false) {
    const leafW = Math.max(0.36, w * 0.46);
    const nBlades = Math.max(4, Math.round(h / 0.22));
    for (const s of [-1, 1]) {
      const q = loc(x, z, s * (w * 0.5 + 0.12 + leafW * 0.38), 0.22, ry);
      const rot = vQ(ry, 0, 0).multiply(qEuler(0, -s * 0.62, 0));
      kput('vWood', [q[0], y + h * 0.5, q[1]], rot, [leafW, h, 0.045], lvC);
      /* Accent trim rail at shutter mid-height */
      const qm = loc(x, z, s * (w * 0.5 + 0.12 + leafW * 0.38), 0.245, ry);
      kput('vWood', [qm[0], y + h * 0.52, qm[1]], rot, [leafW * 0.94, 0.07 + nBlades * 0.002, 0.055], orgC);
    }
  }
  if (o.hood !== false) {
    dlnSunHood(x, y + h + 0.22, z, ry, w + 0.20, o.hoodOut == null ? 0.72 : o.hoodOut, { canvas: !!o.canvasHood });
  }
}

/* 6. Perforated honeycomb / staggered red-brick jali (cobogo) breeze-screen */
function dlnJali(x, y, z, ry, w, h, o) {
  o = o || {};
  const morC = dlnMortarTint();
  const brkC = o.c || dlnBrickTint(true);
  const voidC = vC(DL_PAL.shadeVoid);
  /* Recessed cool room shadow behind the perforated lattice (unless freestanding courtyard screen) */
  if (!o.openBack) {
    const bv = loc(x, z, 0, 0.02, ry);
    vB('vPlaster', bv[0], y, bv[1], w, h, 0.05, ry, voidC);
  }
  /* Cream mortar surround frame (sill, head, jambs) */
  const pf = loc(x, z, 0, 0.09, ry);
  vB('dlMortarB', pf[0], y - 0.10, pf[1], w + 0.24, 0.11, 0.22, ry, morC);
  vB('dlMortarB', pf[0], y + h, pf[1], w + 0.24, 0.12, 0.22, ry, morC);
  for (const s of [-1, 1]) {
    const pj = loc(x, z, s * (w * 0.5 + 0.06), 0.09, ry);
    vB('dlMortarB', pj[0], y, pj[1], 0.12, h, 0.20, ry, morC);
  }
  /* Checkerboard / honeycomb staggered red-brick cobogo cells leaving crisp open air-diamonds */
  const cellW = 0.34;
  const rowH = 0.20;
  const nRows = Math.max(3, Math.min(16, Math.floor(h / rowH)));
  const nCols = Math.max(3, Math.min(22, Math.floor(w / cellW)));
  const stepX = w / nCols;
  const stepY = h / nRows;
  for (let r = 0; r < nRows; r++) {
    const yy = y + r * stepY + stepY * 0.12;
    /* Thin horizontal brick bed-rib every 3rd course for structural tie */
    if (r > 0 && r % 3 === 0) {
      const pr = loc(x, z, 0, 0.10, ry);
      vB('dlBrickOchreB', pr[0], yy - 0.02, pr[1], w, 0.045, 0.14, ry, brkC);
    }
    const parity = r % 2;
    for (let c = 0; c < nCols; c++) {
      if ((c % 2) !== parity) continue;
      const lx = -w * 0.5 + (c + 0.5) * stepX;
      const pb = loc(x, z, lx, 0.10, ry);
      vB('dlBrickB', pb[0], yy, pb[1], stepX * 0.62, stepY * 0.76, 0.15, ry, brkC);
    }
  }
}

/* 7. Recessed red-brick arched shade arcade / colonnaded loggia along a wall or courtyard face */
function dlnArcade(x, y, z, ry, len, h, bays, o) {
  o = o || {};
  const nB = Math.max(1, bays | 0);
  const bayW = len / nB;
  const pierW = o.pierW == null ? Math.min(0.58, bayW * 0.20) : o.pierW;
  const depth = o.depth == null ? 0.44 : o.depth;
  const brkC = o.c || dlnBrickTint(false);
  const morC = dlnMortarTint();
  const orgC = dlnOrangeTint();
  const archItem = o.band ? 'dlBrickBandB' : 'dlBrickB';
  const springY = y + h * 0.62;
  const archH = h * 0.38;

  /* Piers + cream mortar plinths and impost capitals */
  for (let i = 0; i <= nB; i++) {
    const lx = -len * 0.5 + i * bayW;
    const p = loc(x, z, lx, 0, ry);
    vB('dlMortarB', p[0], y, p[1], pierW + 0.10, 0.22, depth + 0.10, ry, morC);
    vB(archItem, p[0], y + 0.22, p[1], pierW, springY - y - 0.36, depth, ry, brkC);
    vB('dlMortarB', p[0], springY - 0.14, p[1], pierW + 0.12, 0.14, depth + 0.12, ry, morC);
  }
  /* Extruded brick arch spandrels + Iziz-orange keystones over every bay */
  for (let i = 0; i < nB; i++) {
    const cx = -len * 0.5 + (i + 0.5) * bayW;
    const pa = loc(x, z, cx, 0, ry);
    kput('dlArchSpandrel', [pa[0], springY, pa[1]], ry ? qEuler(0, ry, 0) : null, [bayW, archH * 2.0, depth], brkC);
    /* Extrados cream mortar hood-mould & Iziz-orange keystone */
    const pk = loc(x, z, cx, 0, ry);
    vB('vWood', pk[0], y + h - 0.26, pk[1], 0.24, 0.30, depth + 0.08, ry, orgC);
  }
  /* Continuous frieze band tying the arcade crest */
  vB('dlMortarB', x, y + h, z, len + pierW + 0.12, 0.18, depth + 0.10, ry, morC);
  /* Optional timber/iron balustrade between piers (for upper verandas) */
  if (o.rail) {
    const lvC = dlnLouverTint();
    for (let i = 0; i < nB; i++) {
      const cx = -len * 0.5 + (i + 0.5) * bayW;
      const span = bayW - pierW - 0.06;
      if (span <= 0.2) continue;
      const pr = loc(x, z, cx, 0, ry);
      if (o.jaliRail) {
        dlnJali(pr[0], y + 0.10, pr[1], ry, span, 0.86, { openBack: true, c: brkC });
      } else {
        vB('vWood', pr[0], y + 0.88, pr[1], span, 0.09, 0.12, ry, lvC);
        const nb = Math.max(3, Math.round(span / 0.28));
        for (let k = 1; k < nb; k++) {
          const bp = loc(x, z, cx - span * 0.5 + (span * k) / nb, 0, ry);
          vPst('vPost', bp[0], y + 0.08, bp[1], 0.035, 0.80, lvC);
        }
      }
    }
  }
}

/* 8. Sunken evaporative cooling pool / rain-catchment impluvium with cream mortar rim-bench & spout */
function dlnImpluvium(x, y, z, w, d, ry, o) {
  o = o || {};
  const morC = dlnMortarTint();
  const watC = vC(dlnPick(DL_PAL.water));
  const rimW = 0.32;
  const rimH = o.rimH == null ? 0.34 : o.rimH;
  /* Four cream-mortar coping benches framing the basin */
  for (const s of [-1, 1]) {
    const pz = loc(x, z, 0, s * (d * 0.5 - rimW * 0.5), ry);
    vB('dlMortarB', pz[0], y, pz[1], w, rimH, rimW, ry, morC);
    const px = loc(x, z, s * (w * 0.5 - rimW * 0.5), 0, ry);
    vB('dlMortarB', px[0], y, px[1], rimW, rimH, Math.max(0.2, d - rimW * 2), ry, morC);
  }
  /* Tiled basin floor + shimmering turquoise water sheet */
  vB('dlBrickDeepB', x, y, z, Math.max(0.4, w - rimW * 2), 0.08, Math.max(0.4, d - rimW * 2), ry, vC(dlnPick(DL_PAL.brickDeep)));
  vB('dlWaterB', x, y + 0.08, z, Math.max(0.4, w - rimW * 2), rimH - 0.14, Math.max(0.4, d - rimW * 2), ry, watC);
  /* Central stone/verdigris-copper cooling fountain column */
  if (o.fountain !== false && w >= 2.2 && d >= 2.2) {
    vPst('dlMortarPost', x, y + 0.08, z, 0.22, rimH + 0.48, morC);
    kput('vDomeC', [x, y + rimH + 0.52, z], null, [0.42, 0.18, 0.42], null);
    vPst('vPipeC', x, y + rimH + 0.52, z, 0.06, 0.34, null);
  }
}

/* 9. Unglazed porous terracotta zeer evaporative cooling water-jars on timber rack */
function dlnZeerCluster(x, y, z, n, ry) {
  const count = Math.max(1, n | 0);
  const lvC = dlnLouverTint();
  for (let i = 0; i < count; i++) {
    const lx = (i - (count - 1) * 0.5) * 0.62;
    const p = loc(x, z, lx, 0, ry || 0);
    const jarC = vC(dlnPick(DL_PAL.terracotta));
    vB('vWood', p[0], y, p[1], 0.46, 0.18, 0.46, ry || 0, lvC);
    vBall('vGourd', p[0], y + 0.44, p[1], 0.25, jarC, 0.36);
    vPst('vClayPot', p[0], y + 0.68, p[1], 0.13, 0.16, jarC);
    vB('vWood', p[0], y + 0.84, p[1], 0.30, 0.04, 0.30, ry || 0, lvC);
  }
}

/* 10. Taut courtyard / terrace canvas shade-sail (alternating unbleached linen & Iziz orange stripes) */
function dlnShadeSail(x, y, z, w, d, ry, o) {
  o = o || {};
  const tiltX = o.tiltX == null ? 0.10 : o.tiltX;
  const tiltZ = o.tiltZ == null ? -0.06 : o.tiltZ;
  const lvC = dlnLouverTint();
  const linenC = vC(dlnPick(DL_PAL.linen));
  const orgC = dlnOrangeTint();
  const q = vQ(ry || 0, tiltX, tiltZ);
  /* Main taut linen sheet + Iziz-orange center & edge bands */
  kput('vClothB', [x, y, z], q, [w, 0.045, d], o.orange ? orgC : linenC);
  kput('vClothB', [x, y + 0.015, z], q, [w * 0.28, 0.05, d * 0.98], orgC);
  /* Tensioned corner guy-ropes or slim masts */
  if (o.posts) {
    const postH = o.postH == null ? 2.5 : o.postH;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const p = loc(x, z, sx * (w * 0.5 + 0.08), sz * (d * 0.5 + 0.08), ry || 0);
        const topH = postH - sz * Math.tan(tiltX) * d * 0.5 + sx * Math.tan(tiltZ) * w * 0.5;
        vPst('vPost', p[0], y - postH, p[1], 0.07, Math.max(0.6, topH + 0.12), lvC);
      }
    }
  }
}

/* 11. Slatted bamboo / teak courtyard pergola casting cool dappled shade */
function dlnPergola(x, y, z, w, d, h, ry, o) {
  o = o || {};
  const postC = dlnLouverTint();
  const slatC = vC(dlnPick(DL_PAL.bamboo));
  const nx = Math.max(1, Math.round(w / 3.2));
  const nz = Math.max(1, Math.round(d / 3.2));
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= nz; j++) {
      if (i > 0 && i < nx && j > 0 && j < nz) continue;
      const p = loc(x, z, -w * 0.5 + (w * i) / nx, -d * 0.5 + (d * j) / nz, ry || 0);
      if (o.brickPiers) {
        vB('dlBrickB', p[0], y, p[1], 0.34, h, 0.34, ry || 0, dlnBrickTint(false));
      } else {
        vPst('vPost', p[0], y, p[1], 0.09, h, postC);
      }
    }
  }
  /* Perimeter tie-beams */
  for (const s of [-1, 1]) {
    const pz = loc(x, z, 0, s * (d * 0.5 - 0.08), ry || 0);
    vB('vWood', pz[0], y + h - 0.14, pz[1], w + 0.24, 0.14, 0.12, ry || 0, postC);
    const px = loc(x, z, s * (w * 0.5 - 0.08), 0, ry || 0);
    vB('vWood', px[0], y + h - 0.26, px[1], 0.12, 0.14, d + 0.24, ry || 0, postC);
  }
  /* Closely spaced hyperbamboo / timber shade slats + woven linen runner */
  const nSlats = Math.max(6, Math.round(d / 0.36));
  for (let k = 0; k <= nSlats; k++) {
    const lz = -d * 0.5 + (d * k) / nSlats;
    const ps = loc(x, z, 0, lz, ry || 0);
    vB('vWood', ps[0], y + h + 0.01, ps[1], w + 0.30, 0.045, 0.10, ry || 0, slatC);
  }
  if (o.clothStrip !== false) {
    kput('vClothB', [x, y + h + 0.07, z], vQ(ry || 0, 0, 0), [w * 0.62, 0.03, d * 0.72], vC(dlnPick(DL_PAL.linen)));
    kput('vClothB', [x, y + h + 0.085, z], vQ(ry || 0, 0, 0), [w * 0.18, 0.03, d * 0.72], dlnOrangeTint());
  }
}

/* 12. Brick-paved open courtyard with optional impluvium pool, planters, zeer jars & shade-sail */
function dlnCourtyard(x, y, z, w, d, ry, o) {
  o = o || {};
  /* Herringbone/patterned warm brick courtyard floor + cream mortar border */
  vB('dlMortarB', x, y - 0.04, z, w, 0.06, d, ry || 0, dlnMortarTint());
  vB('dlBrickOchreB', x, y + 0.02, z, Math.max(0.6, w - 0.48), 0.05, Math.max(0.6, d - 0.48), ry || 0, vC(dlnPick(DL_PAL.brickOchre)));
  if (o.pool !== false && w >= 4.2 && d >= 4.2) {
    const pw = o.poolW == null ? Math.min(4.6, w * 0.46) : o.poolW;
    const pd = o.poolD == null ? Math.min(4.6, d * 0.46) : o.poolD;
    dlnImpluvium(x, y + 0.06, z, pw, pd, ry || 0, { fountain: o.fountain !== false });
  }
  /* Corner tropical shade planters */
  if (o.planters !== false && w >= 5.0 && d >= 5.0) {
    const lvC = dlnLouverTint();
    for (const sx of [-1, 1]) {
      const pp = loc(x, z, sx * (w * 0.5 - 0.85), -d * 0.5 + 0.85, ry || 0);
      vnPlanter(pp[0], y + 0.06, pp[1], 1.25, 1.05, ry || 0, lvC);
    }
  }
  if (o.zeer !== false) {
    const zp = loc(x, z, w * 0.5 - 0.85, d * 0.5 - 0.95, ry || 0);
    dlnZeerCluster(zp[0], y + 0.06, zp[1], 2, (ry || 0) + Math.PI * 0.5);
  }
  if (o.sail && o.sailY != null) {
    dlnShadeSail(x, o.sailY, z, w * 0.76, d * 0.68, ry || 0, { tiltX: 0.09, tiltZ: -0.05 });
  }
}

/* 13. Deep-eaved monsoon hip/gable roof with exposed rafter tails, Iziz-orange fascia & raised clerestory monitor */
function dlnMonitorRoof(x, y, z, w, d, rise, ry, o) {
  o = o || {};
  const copper = !!o.copper;
  const over = o.over == null ? 0.95 : o.over;
  const tileC = copper ? null : dlnTileTint();
  const lvC = dlnLouverTint();
  const orgC = dlnOrangeTint();

  if (o.gable) {
    vnGableRoof(x, y, z, w, d, rise, ry || 0,
      copper ? 'vGableCu' : 'dlGableTile', tileC, over,
      o.endItem || 'dlGableBrick', o.endC || dlnBrickTint(false), 0.22);
  } else {
    const hipItem = copper ? 'vHipCu' : 'dlHipTile';
    kput(hipItem, [x, y - 0.26, z], ry ? qEuler(0, ry, 0) : null, [w + 2 * over, rise + 0.26, d + 2 * over], tileC);
    /* Iziz-orange eaves fascia board */
    vB('vWood', x, y - 0.42, z, w + 2 * over + 0.08, 0.18, d + 2 * over + 0.08, ry || 0, orgC);
  }

  /* Exposed tropical timber rafter-tails under the deep monsoon eaves */
  const nRafX = Math.max(3, Math.round((w + over) / 1.1));
  for (let i = 0; i <= nRafX; i++) {
    const lx = -(w * 0.5 + over * 0.6) + ((w + over * 1.2) * i) / nRafX;
    for (const sz of [-1, 1]) {
      const rp = loc(x, z, lx, sz * (d * 0.5 + over * 0.48), ry || 0);
      vB('vWood', rp[0], y - 0.36, rp[1], 0.09, 0.12, over * 0.92, ry || 0, lvC);
    }
  }

  /* Raised stack-effect clerestory ridge-vent / jack-roof monitor */
  if (o.monitor !== false) {
    const mw = o.monW == null ? Math.max(2.2, w * 0.54) : o.monW;
    const md = o.monD == null ? Math.max(1.5, Math.min(3.2, d * 0.34)) : o.monD;
    const mh = o.monH == null ? 0.78 : o.monH;
    const my = y + rise * 0.66;
    /* Monitor base curb + dark louvered exhaust band */
    vB('dlMortarB', x, my - 0.14, z, mw + 0.16, 0.18, md + 0.16, ry || 0, dlnMortarTint());
    vB('vPlaster', x, my + 0.04, z, mw - 0.12, mh, md - 0.12, ry || 0, vC(DL_PAL.shadeVoid));
    /* Corner & intermediate louver posts + horizontal exhaust blades */
    const nPosts = Math.max(2, Math.round(mw / 1.4));
    for (let i = 0; i <= nPosts; i++) {
      const lx = -mw * 0.5 + (mw * i) / nPosts;
      for (const sz of [-1, 1]) {
        const pp = loc(x, z, lx, sz * (md * 0.5), ry || 0);
        vB('vWood', pp[0], my + 0.04, pp[1], 0.11, mh, 0.11, ry || 0, lvC);
      }
    }
    for (const bladeY of [0.24, 0.48, 0.68]) {
      if (bladeY >= mh) continue;
      vB('vWood', x, my + bladeY, z, mw + 0.12, 0.05, md + 0.12, ry || 0, lvC);
    }
    /* Overhanging monitor cap roof */
    const capRise = o.monRise == null ? 0.68 : o.monRise;
    const capOver = 0.48;
    kput(copper ? 'vHipCu' : 'dlHipTile', [x, my + mh - 0.08, z], ry ? qEuler(0, ry, 0) : null,
      [mw + capOver * 2, capRise + 0.14, md + capOver * 2], tileC);
    vB('vWood', x, my + mh - 0.18, z, mw + capOver * 2 + 0.06, 0.12, md + capOver * 2 + 0.06, ry || 0, orgC);
  }
}

/* 14. Rooftop brick malqaf wind-catcher tower scooping Cut valley breezes down into halls & baths */
function dlnWindCatcher(x, y, z, w, d, h, ry, o) {
  o = o || {};
  const brkC = o.c || dlnBrickTint(false);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  const orgC = dlnOrangeTint();
  const scoopH = Math.min(1.35, h * 0.46);
  const shaftH = h - scoopH;

  vB('dlMortarB', x, y - 0.10, z, w + 0.24, 0.18, d + 0.24, ry || 0, morC);
  vB('dlBrickBandB', x, y + 0.08, z, w, shaftH, d, ry || 0, brkC);
  vB('dlMortarB', x, y + shaftH, z, w + 0.22, 0.16, d + 0.22, ry || 0, morC);

  /* 4-directional louvered wind-scoop head with X-baffle partitions inside */
  const sy = y + shaftH + 0.16;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cp = loc(x, z, sx * (w * 0.5 - 0.16), sz * (d * 0.5 - 0.16), ry || 0);
      vB('dlBrickB', cp[0], sy, cp[1], 0.32, scoopH, 0.32, ry || 0, brkC);
    }
  }
  /* Diagonal internal wind-baffle cross */
  vB('dlMortarB', x, sy + 0.04, z, w * 0.78, scoopH - 0.08, 0.10, (ry || 0) + Math.PI * 0.25, morC);
  vB('dlMortarB', x, sy + 0.04, z, w * 0.78, scoopH - 0.08, 0.10, (ry || 0) - Math.PI * 0.25, morC);
  /* Louver intake slats */
  for (const ly of [0.32, 0.68, 1.02]) {
    if (ly >= scoopH) continue;
    vB('vWood', x, sy + ly, z, w + 0.04, 0.06, d + 0.04, ry || 0, lvC);
  }
  /* Cap cornice + pyramidal terracotta or copper hood */
  const topY = sy + scoopH;
  vB('vWood', x, topY, z, w + 0.52, 0.14, d + 0.52, ry || 0, orgC);
  kput(o.copper ? 'vPyrCu' : 'dlPyrTile', [x, topY + 0.10, z], ry ? qEuler(0, ry, 0) : null,
    [w + 0.76, 0.85, d + 0.76], o.copper ? null : dlnTileTint());
}

/* 15. Izani Imperial Sun-Orb wall medallion or roof finial (marks vassal allegiance to Iziz) */
function dlnSunOrb(x, y, z, ry, r) {
  const rad = r == null ? 0.42 : r;
  const p = loc(x, z, 0, 0.08, ry || 0);
  vB('dlMortarB', p[0], y - rad, p[1], rad * 2.1, rad * 2.1, 0.10, ry || 0, dlnMortarTint());
  const p2 = loc(x, z, 0, 0.14, ry || 0);
  vB('vWood', p2[0], y - rad * 0.72, p2[1], rad * 1.44, rad * 1.44, 0.08, (ry || 0) + Math.PI * 0.25, dlnOrangeTint());
  const p3 = loc(x, z, 0, 0.20, ry || 0);
  vBall('dlGiltBall', p3[0], y, p3[1], rad * 0.38, vC(dlnPick(DL_PAL.gilt)), rad * 0.38);
}
