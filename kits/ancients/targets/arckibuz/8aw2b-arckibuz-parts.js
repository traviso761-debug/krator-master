/* ================================================================= ARCKIBUZ — [draw] materials, kit defs & geometry parts
   All top-level symbols are prefixed `akb` (shared scope rule in kits/ancients/build.py).
   Builds merged BufferGeometries per material family so each Arckibuz site stays crisp in close-ups while keeping
   draw calls low (< 120) and triangles well within the mega budget. */

TEX.akbCliff = canvasTex(256, 256, (g, w, h) => {
  const id = g.createImageData(w, h), d = id.data;
  for (let y = 0; y < h; y++) {
    const strata = Math.sin(y * 0.24) * 11 + (fbm(0.4, y / 14, 4.2, 2) - 0.5) * 22;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const fiss = Math.pow(Math.abs(fbm(x / 7, y / 48, 8.7, 3) - 0.5) * 2, 2.2) * 38;
      const gr = (fbm(x / 4, y / 4, 2.1, 1) - 0.5) * 16;
      const v = clamp(168 + strata - fiss + gr, 55, 225);
      d[i] = v;
      d[i + 1] = clamp(v * 0.72, 35, 180);
      d[i + 2] = clamp(v * 0.52, 25, 140);
      d[i + 3] = 255;
    }
  }
  g.putImageData(id, 0, 0);
});

TEX.akbCanvas = canvasTex(128, 128, (g, w, h) => {
  const id = g.createImageData(w, h), d = id.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const band = ((x >> 4) % 2 === 0) ? 8 : -6;
      const weave = ((x + y) & 3) === 0 ? -9 : 4;
      const n = (fbm(x / 18, y / 18, 5.1, 2) - 0.5) * 18;
      const r = clamp(214 + band + weave + n, 120, 245);
      d[i] = r;
      d[i + 1] = clamp(r * 0.76, 80, 200);
      d[i + 2] = clamp(r * 0.48, 45, 145);
      d[i + 3] = 255;
    }
  }
  g.putImageData(id, 0, 0);
});

MAT.akbDesert     = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xc8986c, roughness: 1, metalness: 0, side: DS });
MAT.akbCliff      = new THREE.MeshStandardMaterial({ map: TEX.akbCliff, color: 0xd8a882, roughness: 0.98, metalness: 0, side: DS });
MAT.akbCourt      = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xbcb09b, roughness: 0.96, metalness: 0, side: DS });
MAT.akbCourtR     = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0x8d8070, roughness: 1, metalness: 0, side: DS });
MAT.akbShell      = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xede6d8, roughness: 0.92, metalness: 0, side: DS });
MAT.akbShellRehab = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xdfd1ba, roughness: 0.95, metalness: 0, side: DS });
MAT.akbShellR     = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0x8b7e6f, roughness: 1, metalness: 0, side: DS });
MAT.akbRecess     = new THREE.MeshStandardMaterial({ map: TEX.concrete, color: 0x695748, roughness: 0.98, metalness: 0, side: DS });
MAT.akbLouver     = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0xd8cdb8, roughness: 0.9, metalness: 0, side: DS });
MAT.akbLouverR    = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughnessMap: TEX.concreteRM, color: 0x7c7062, roughness: 1, metalness: 0, side: DS });
MAT.akbTent       = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.58, metalness: 0.04, side: DS });
MAT.akbTentRehab  = new THREE.MeshStandardMaterial({ map: TEX.akbCanvas, color: 0xffffff, roughness: 0.86, metalness: 0, side: DS });
MAT.akbFieldGreen = new THREE.MeshStandardMaterial({ map: TEX.concrete, color: 0x567538, roughness: 1, metalness: 0, side: DS });
MAT.akbFieldRehab = new THREE.MeshStandardMaterial({ map: TEX.concrete, color: 0x627c3d, roughness: 1, metalness: 0, side: DS });
MAT.akbFieldDry   = new THREE.MeshStandardMaterial({ map: TEX.concrete, color: 0xa6835d, roughness: 1, metalness: 0, side: DS });
MAT.akbRoad       = new THREE.MeshStandardMaterial({ map: TEX.concrete, color: 0x5c554d, roughness: 0.96, metalness: 0, side: DS });
MAT.akbBulkhead   = new THREE.MeshStandardMaterial({ map: TEX.rust, roughnessMap: TEX.rustRM, color: 0x7a5c46, roughness: 0.78, metalness: 0.42, side: DS });

kdef('akbCropG', new THREE.BoxGeometry(1, 1, 1), MAT.lawn);
kdef('akbCropY', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x8f983c, roughness: 1 }));
kdef('akbCropD', new THREE.BoxGeometry(1, 1, 1), MAT.akbFieldDry);
kdef('akbBulkP', new THREE.BoxGeometry(1, 1, 1), MAT.akbBulkhead);

function akbBox(x0, x1, y0, y1, z0, z1) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  if (w <= 0.01 || h <= 0.01 || d <= 0.01) return null;
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate((x0 + x1) * 0.5, (y0 + y1) * 0.5, (z0 + z1) * 0.5);
  return g;
}

function akbCyl(cx, cz, rTop, rBot, y0, y1, segs) {
  const h = y1 - y0;
  if (h <= 0.01) return null;
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs == null ? 16 : segs);
  g.translate(cx, (y0 + y1) * 0.5, cz);
  return g;
}

function akbPolySlab(poly, y0, y1, holePoly) {
  const h = y1 - y0;
  if (!poly || poly.length < 3 || h <= 0.01) return null;
  const sh = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], -p[1])));
  if (holePoly && holePoly.length >= 3) {
    sh.holes.push(new THREE.Path(holePoly.map(p => new THREE.Vector2(p[0], -p[1]))));
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y0, 0);
  /* Scale UVs to 12 m tiles so concrete/earth maps read cleanly */
  const uv = g.attributes.uv;
  if (uv) {
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 12, uv.getY(i) / 12);
  }
  return g;
}

/* Continuous desert mesa landform (RIM_Y = 28 m sloping to 0 m at MESA_R1 = 352 m, open over the 228 x 228 m pit),
   plus the 4 striated vertical desert sandstone cliff walls, moat floor, highway roadbed, and eastern rock outcrops. */
function akbBuildLandscape(L, P, d) {
  const D = P.dim, PH = D.PIT_HALF, MR = D.MESA_R1 + 8;
  const desertGeos = [], cliffGeos = [], roadGeos = [], fieldGeos = [];

  /* 1. Desert mesa heightfield grid with clean hole over the 228 x 228 m rock-cut pit */
  const N = 88;
  desertGeos.push(gridSurface((u, v) => {
    const x = -MR + 2 * MR * u, z = -MR + 2 * MR * v;
    const ax = Math.abs(x), az = Math.abs(z);
    if (ax < PH && az < PH) {
      /* Clamp pit boundary vertices onto the cliff lip */
      return [x, D.RIM_Y, z];
    }
    let y = ARCKIBUZ.groundAt(x, z, d);
    if (y > 0.2 && (ax > D.RIM_HALF + 6 || az > D.RIM_HALF + 6)) {
      y += (KRAND.fbm(x * 0.018 + 3, z * 0.018 + 9, 0, 2, P.seed + 5) - 0.5) * 0.9 * clamp(y / D.RIM_Y, 0, 1);
    }
    return [x, Math.max(0, y), z];
  }, N, N, {
    uS: 28, vS: 28,
    hole: (u, v) => {
      const x = -MR + 2 * MR * u, z = -MR + 2 * MR * v;
      return Math.abs(x) < PH - 0.5 && Math.abs(z) < PH - 0.5;
    }
  }));

  /* 2. Pit bedrock pad (y = 0.01..0.08) & perimeter moat floor (y = 0.08..moatY) around subterranean podium */
  const moatY = d === 1 ? D.MOAT_Y + 0.35 : D.MOAT_Y;
  desertGeos.push(akbBox(-PH - 2, PH + 2, 0.01, 0.08, -PH - 2, PH + 2));
  desertGeos.push(akbBox(-PH - 2, -D.POD_HX, 0.08, moatY, -PH - 2, PH + 2));
  desertGeos.push(akbBox(D.POD_HX, PH + 2, 0.08, moatY, -PH - 2, PH + 2));
  desertGeos.push(akbBox(-D.POD_HX, D.POD_HX, 0.08, moatY, -PH - 2, -D.POD_HZ));
  desertGeos.push(akbBox(-D.POD_HX, D.POD_HX, 0.08, moatY, D.POD_HZ, PH + 2));

  /* 3. Four vertical striated desert sandstone cliff walls (y = moatY - 0.3 .. RIM_Y + 0.4) */
  const cliffSides = [
    { axis: 'x', sgn: -1, fixed: -PH },
    { axis: 'x', sgn: 1,  fixed: PH },
    { axis: 'z', sgn: -1, fixed: -PH },
    { axis: 'z', sgn: 1,  fixed: PH }
  ];
  cliffSides.forEach((cs, idx) => {
    cliffGeos.push(gridSurface((u, v) => {
      const s = -PH + 2 * PH * u;
      const y = (moatY - 0.3) + (D.RIM_Y + 0.35 - (moatY - 0.3)) * v;
      const jag = (1 - Math.pow(2 * v - 1, 4)) *
        ((KRAND.fbm(u * 14 + idx * 7, v * 3.5, 0, 3, P.seed + 19) - 0.5) * 3.6 +
         Math.sin(v * 18 + idx) * 0.45);
      if (cs.axis === 'x') return [cs.fixed - cs.sgn * Math.max(0, jag), y, s];
      return [s, y, cs.fixed - cs.sgn * Math.max(0, jag)];
    }, 56, 18, { uS: 16, vS: 4 }));
  });

  /* 4. Rim retaining parapet wall framing the 250 x 250 m (6.25 ha) excavation perimeter */
  const R0 = PH, R1 = D.RIM_HALF;
  /* North rim (continuous), West rim (split at z = -10..10 causeway), South rim (split at x = -4..16), East rim (split at z = -11..11 bridge) */
  roadGeos.push(akbBox(-R1, R1, D.RIM_Y - 0.6, D.RIM_Y + 1.5, -R1, -R1 + 3.2));
  roadGeos.push(akbBox(-R1, -R1 + 3.2, D.RIM_Y - 0.6, D.RIM_Y + 1.5, -R1, -11));
  roadGeos.push(akbBox(-R1, -R1 + 3.2, D.RIM_Y - 0.6, D.RIM_Y + 1.5, 11, R1));
  roadGeos.push(akbBox(-R1, -5, D.RIM_Y - 0.6, D.RIM_Y + 1.5, R1 - 3.2, R1));
  roadGeos.push(akbBox(17, R1, D.RIM_Y - 0.6, D.RIM_Y + 1.5, R1 - 3.2, R1));
  roadGeos.push(akbBox(R1 - 3.2, R1, D.RIM_Y - 0.6, D.RIM_Y + 1.5, -R1, -12));
  roadGeos.push(akbBox(R1 - 3.2, R1, D.RIM_Y - 0.6, D.RIM_Y + 1.5, 12, R1));

  /* 5. Eastern sunken desert highway pavement (x = 143..165, z = -245..245) & radial access causeways */
  roadGeos.push(akbBox(D.HWY_X - 10.5, D.HWY_X + 10.5, D.HWY_Y - 0.1, D.HWY_Y + 0.22, -244, 244));
  roadGeos.push(akbBox(-242, -PH, D.RIM_Y - 0.1, D.RIM_Y + 0.28, -8.5, 8.5));
  roadGeos.push(akbBox(-2, 14, D.RIM_Y - 0.1, D.RIM_Y + 0.28, PH, 242));

  /* 6. Two weathered flat-topped desert sandstone mesa outcrops south of SHELTER (Sheet 1 General Plan 2) */
  for (let i = 0; i < P.outcrops.length; i++) {
    const oc = P.outcrops[i];
    cliffGeos.push(gridSurface((u, v) => {
      const th = u * TAU;
      const rK = v < 0.72 ? (1 - 0.34 * v) : (0.755 * (1 - (v - 0.72) / 0.28));
      const hK = v < 0.72 ? (v / 0.72) : (1 + 0.06 * Math.sin(th * 3) * (1 - (v - 0.72) / 0.28));
      const wob = 0.82 + 0.32 * KRAND.fbm(Math.cos(th) * 2 + i * 5, Math.sin(th) * 2, v * 1.5, 2, P.seed + 83);
      return [
        oc.x + oc.rx * rK * wob * Math.cos(th),
        D.RIM_Y - 0.6 + hK * oc.h * 0.68,
        oc.z + oc.rz * rK * wob * Math.sin(th)
      ];
    }, 20, 8, { uS: 4, vS: 2 }));
  }

  /* 7. Polygonal VEGETABLE GARDENS bastion pads, outer stone windbreak bunds, and crop furrow beds */
  for (let gi = 0; gi < P.gardens.length; gi++) {
    const g = P.gardens[gi];
    fieldGeos.push(akbPolySlab(g.poly, D.RIM_Y - 0.05, D.RIM_Y + 0.16));
    /* Perimeter windbreak bund wall along outer polygon edges */
    const poly = g.poly;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const mx = (a[0] + b[0]) * 0.5, mz = (a[1] + b[1]) * 0.5;
      if (Math.abs(mx) < R1 + 4 && Math.abs(mz) < R1 + 4) continue;
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
      if (len < 2) continue;
      const bh = d === 1 ? 1.1 : 1.9;
      kput(BOXC(d === 1 ? 1 : 0), [mx, D.RIM_Y + bh * 0.5 - 0.12, mz], qEuler(0, Math.atan2(-dz, dx), 0), [len, bh, 2.2], null);
    }
    /* Furrow crop rows */
    for (let bi = 0; bi < g.beds.length; bi++) {
      const bd = g.beds[bi];
      if (d === 1) {
        if (bi % 2 === 0) kput('akbCropD', [bd.x, D.RIM_Y + 0.26, bd.z], qEuler(0, bd.ry, 0), [bd.w, 0.22, bd.d * 0.55], null);
      } else if (d === 0 || bd.active3) {
        const kName = (bd.crop === 'grain' || bd.crop === 'pulse') ? 'akbCropY' : 'akbCropG';
        kput(kName, [bd.x, D.RIM_Y + 0.42, bd.z], qEuler(0, bd.ry, 0), [bd.w, 0.55, bd.d * 0.42], null);
        kput(kName, [bd.x - Math.sin(bd.ry) * 1.8, D.RIM_Y + 0.38, bd.z + Math.cos(bd.ry) * 1.8], qEuler(0, bd.ry, 0), [bd.w * 0.94, 0.48, bd.d * 0.38], null);
      }
    }
  }

  /* 8. Irrigation aqueduct trough linings from ARCKIBUZ.HULL.canalTroughs */
  const courtGeos = [];
  const troughs = ARCKIBUZ.HULL.canalTroughs;
  for (let ti = 0; ti < troughs.length; ti++) {
    const tr = troughs[ti];
    courtGeos.push(akbBox(tr[0], tr[1], D.RIM_Y - 0.3, D.RIM_Y + 0.42, tr[2], tr[3]));
  }

  const desertM = meshMerged(desertGeos, MAT.akbDesert, L);
  const cliffM  = meshMerged(cliffGeos, MAT.akbCliff, L);
  const roadM   = meshMerged(roadGeos, MAT.akbRoad, L);
  const fieldMat = d === 1 ? MAT.akbFieldDry : (d === 3 ? MAT.akbFieldRehab : MAT.akbFieldGreen);
  const fieldM  = meshMerged(fieldGeos, fieldMat, L);
  const troughM = meshMerged(courtGeos, d === 1 ? MAT.akbCourtR : MAT.akbCourt, L);
  [desertM, cliffM, roadM, fieldM, troughM].forEach(m => { if (m) m.userData.akbGround = true; });
}

/* Circular Stepped Council Amphitheater (Plan 1 on Sheet 2) inside the COMMUNITY tier (y = 35.2..38.4). */
function akbCouncilBowlGeos(D) {
  const geos = [];
  const steps = 6, rOuter = D.BOWL_R, rInner = D.BOWL_R0;
  /* Solid bowl undercroft slab connecting down into the City Center ceiling at y = 35.0..38.1 */
  geos.push(akbCyl(0, 0, rOuter + 3.5, rOuter + 1.5, 34.8, 35.6, 32));
  for (let s = 0; s < steps; s++) {
    const f0 = s / steps, f1 = (s + 1) / steps;
    const ra = lerp(rInner, rOuter, f0), rb = lerp(rInner, rOuter, f1);
    const yTop = 35.6 + (s + 1) * 0.46;
    /* 4 curved seating quadrants separated by 4 radial stepped aisles */
    for (let q = 0; q < 4; q++) {
      const a0 = q * Math.PI * 0.5 + 0.11, a1 = (q + 1) * Math.PI * 0.5 - 0.11;
      const segs = 7, outer = [], inner = [];
      for (let k = 0; k <= segs; k++) {
        const th = lerp(a0, a1, k / segs);
        outer.push([rb * Math.cos(th), rb * Math.sin(th)]);
        inner.push([ra * Math.cos(th), ra * Math.sin(th)]);
      }
      geos.push(akbPolySlab(outer.concat(inner.reverse()), 35.4, yTop));
    }
  }
  /* Central circular council speaker's table/ring dais */
  geos.push(akbCyl(0, 0, 3.2, 3.5, 35.5, 36.15, 20));
  return geos;
}

/* Soleri's sculptural cellular / hieroglyphic recessed loggia cassette on the Housing Crown facades. */
function akbAddCassette(shellGeos, recessGeos, cas, d) {
  const isZ = cas.nz !== 0;
  const nSign = isZ ? cas.nz : cas.nx;
  const halfW = cas.w * 0.5, y0 = cas.y0, y1 = cas.y1;
  const fPlane = isZ ? cas.z : cas.x;

  const mkBox = (u0, u1, ya, yb, d0, d1) => {
    const uMid = (u0 + u1) * 0.5, yMid = (ya + yb) * 0.5;
    const cx = isZ ? uMid : fPlane + nSign * ((d0 + d1) * 0.5);
    const cz = isZ ? fPlane + nSign * ((d0 + d1) * 0.5) : uMid;
    if (d === 1 && ARCKIBUZ.inCollapse(cx, cz, yMid)) return null;
    if (isZ) {
      const za = fPlane + nSign * d0, zb = fPlane + nSign * d1;
      return akbBox(Math.min(u0, u1), Math.max(u0, u1), ya, yb, Math.min(za, zb), Math.max(za, zb));
    }
    const xa = fPlane + nSign * d0, xb = fPlane + nSign * d1;
    return akbBox(Math.min(xa, xb), Math.max(xa, xb), ya, yb, Math.min(u0, u1), Math.max(u0, u1));
  };

  const cCenter = isZ ? cas.x : cas.z;
  const uA = cCenter - halfW, uB = cCenter + halfW;

  /* Bold projecting Soleri macro-frame (1.9 m proud of housing wall) */
  shellGeos.push(mkBox(uA, uB, y1 - 1.5, y1, -0.2, 1.9));
  shellGeos.push(mkBox(uA, uB, y0, y0 + 1.5, -0.2, 1.9));
  shellGeos.push(mkBox(uA, uA + 1.6, y0, y1, -0.2, 1.9));
  shellGeos.push(mkBox(uB - 1.6, uB, y0, y1, -0.2, 1.9));
  /* Shadowed inner loggia backplane */
  recessGeos.push(mkBox(uA + 1.4, uB - 1.4, y0 + 1.3, y1 - 1.3, -0.15, 0.25));

  /* Hieroglyphic cell subdivisions, balconies, and glazed windows */
  for (let i = 0; i < cas.cells.length; i++) {
    const c = cas.cells[i];
    const ca = c.u - c.w * 0.5, cb = c.u + c.w * 0.5;
    const ya = c.y - c.h * 0.5, yb = c.y + c.h * 0.5;
    const wx = isZ ? c.u : fPlane + nSign * 0.35;
    const wz = isZ ? fPlane + nSign * 0.35 : c.u;
    if (d === 1 && ARCKIBUZ.inCollapse(wx, wz, c.y)) continue;

    /* Cell floor balcony lip & vertical divider */
    shellGeos.push(mkBox(ca - 0.35, cb + 0.35, ya - 0.35, ya + 0.25, 0.1, 1.55));
    shellGeos.push(mkBox(ca - 0.35, ca + 0.25, ya, yb, 0.1, 1.45));

    /* Motif-specific sculptural brise-soleil ("hieroglyphic" relief) */
    if (c.motif === 'tee') {
      shellGeos.push(mkBox(ca + 0.4, cb - 0.4, yb - 1.2, yb - 0.3, 0.2, 1.65));
      shellGeos.push(mkBox(c.u - 0.55, c.u + 0.55, ya + 0.2, yb - 0.4, 0.2, 1.55));
    } else if (c.motif === 'stepL') {
      shellGeos.push(mkBox(ca + 0.2, c.u + 0.3, ya + 0.2, ya + c.h * 0.52, 0.2, 1.6));
      shellGeos.push(mkBox(c.u - 0.2, cb - 0.2, yb - 1.3, yb - 0.2, 0.2, 1.6));
    } else if (c.motif === 'arch') {
      shellGeos.push(mkBox(ca + 0.2, ca + 1.3, yb - 1.6, yb - 0.1, 0.2, 1.6));
      shellGeos.push(mkBox(cb - 1.3, cb - 0.2, yb - 1.6, yb - 0.1, 0.2, 1.6));
      shellGeos.push(mkBox(ca + 0.2, cb - 0.2, yb - 0.75, yb - 0.1, 0.2, 1.65));
    } else {
      shellGeos.push(mkBox(c.u - 1.1, c.u - 0.45, ya + 0.2, yb - 0.2, 0.2, 1.5));
      shellGeos.push(mkBox(c.u + 0.45, c.u + 1.1, ya + 0.2, yb - 0.2, 0.2, 1.5));
    }

    /* Recessed dwelling glazing & warm/cyan interior light */
    const qW = qFacing([cas.nx, 0, cas.nz]);
    const paneName = (d === 1 || (d === 3 && cas.dormant)) ? 'paneD' : 'pane';
    kput(paneName, [wx, c.y, wz], qW, [c.w * 0.72, c.h * 0.68, 1], null);

    if (d === 0 && c.lit0) {
      const lx = isZ ? c.u : fPlane + nSign * 0.52;
      const lz = isZ ? fPlane + nSign * 0.52 : c.u;
      kput('cell', [lx, c.y - 0.2, lz], qW, [c.w * 0.42, c.h * 0.32, 0.35], CYAN.clone().multiplyScalar(0.55));
    } else if (d === 3 && c.lit3 && !cas.dormant) {
      const lx = isZ ? c.u : fPlane + nSign * 0.52;
      const lz = isZ ? fPlane + nSign * 0.52 : c.u;
      kput('cell', [lx, c.y - 0.2, lz], qW, [c.w * 0.44, c.h * 0.34, 0.35], WARM);
    }
  }
}

/* Peaked TENT STRUCTURE tensile canopy + central steel mast anchored directly onto y0 roof deck. */
function akbAddTent(tentGeos, steelGeos, t, d, idx) {
  /* Central mast seated into roof slab (y0 - 0.4 .. yPeak + 0.8) so KRUINS joins it to main body */
  const peakY = d === 1 ? t.y0 + (t.yPeak - t.y0) * 0.72 : t.yPeak;
  steelGeos.push(akbCyl(t.cx, t.cz, 0.32, 0.52, t.y0 - 0.4, peakY + 0.7, 10));
  /* 4 corner perimeter stanchions seated into roof parapet */
  for (let k = 0; k < 4; k++) {
    const a = (k + 0.5) * Math.PI * 0.5;
    const px = t.cx + t.rx * 0.92 * Math.cos(a), pz = t.cz + t.rz * 0.92 * Math.sin(a);
    steelGeos.push(akbCyl(px, pz, 0.22, 0.28, t.y0 - 0.4, t.y0 + 2.4, 8));
    /* Ridge cable/strut from stanchion top to mast peak so everything touches in d = 1 */
    const dx = t.cx - px, dy = (peakY + 0.2) - (t.y0 + 2.2), dz = t.cz - pz;
    const L = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(0.14, 0.14, L, 6);
    const q = new THREE.Quaternion().setFromUnitVectors(_UP, new THREE.Vector3(dx / L, dy / L, dz / L));
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));
    g.translate((px + t.cx) * 0.5, (t.y0 + 2.2 + peakY + 0.2) * 0.5, (pz + t.cz) * 0.5);
    steelGeos.push(g);
  }
  if (d === 1 && idx >= 2) return; /* In ruin, 3 canopies lost their fabric; 2 keep torn strips */

  tentGeos.push(gridSurface((u, v) => {
    const th = u * TAU;
    const rFactor = v;
    const scallop = 1 - 0.12 * Math.pow(Math.sin(th * 4), 2) * v;
    const x = t.cx + t.rx * rFactor * scallop * Math.cos(th);
    const z = t.cz + t.rz * rFactor * scallop * Math.sin(th);
    const sag = Math.pow(1 - v, 1.85);
    const y = (t.y0 + 2.2) + (peakY - (t.y0 + 2.2)) * sag - 0.65 * Math.sin(Math.PI * v) * Math.pow(Math.sin(th * 4), 2);
    return [x, y, z];
  }, 28, 10, {
    uS: 4, vS: 2,
    hole: d === 1 ? (u, v) => v > 0.58 || KRAND.fbm(u * 9 + idx * 3, v * 6, 0, 2, 12791) < 0.48 : null
  }));
}

/* Seat a detached ruin wreck block onto AKB_WATER.ground using KRUINS' exact 5-point gUnder formula. */
function akbSeatWreck(parent, w, mat, site) {
  const grp = new THREE.Group();
  const geos = [];
  geos.push(akbBox(-w.w * 0.5, w.w * 0.5, -w.h * 0.5, w.h * 0.5, -w.d * 0.5, w.d * 0.5));
  if (w.kind === 'cassette') {
    geos.push(akbBox(-w.w * 0.46, w.w * 0.46, w.h * 0.2, w.h * 0.62, w.d * 0.3, w.d * 0.62));
    geos.push(akbBox(-w.w * 0.46, -w.w * 0.28, -w.h * 0.45, w.h * 0.55, w.d * 0.25, w.d * 0.58));
  } else if (w.kind === 'louver') {
    for (let k = -2; k <= 2; k++) {
      geos.push(akbBox(-w.w * 0.48, w.w * 0.48, k * (w.h * 0.2), k * (w.h * 0.2) + 0.45, -w.d * 0.48, w.d * 0.48));
    }
  } else if (w.kind === 'tank') {
    geos.push(akbBox(-w.w * 0.45, -w.w * 0.2, -w.h * 0.45, w.h * 0.72, -w.d * 0.45, w.d * 0.45));
  }
  const m = meshMerged(geos, mat, grp);
  if (m) m.name = w.id;
  grp.rotation.set(w.rx, w.ry, w.rz);
  grp.position.set(w.x, 0, w.z);
  grp.updateMatrixWorld(true);
  const bb = fragBox(grp, new THREE.Matrix4(), new THREE.Box3());
  if (isFinite(bb.min.y)) {
    const dx = w.x - (bb.min.x + bb.max.x) * 0.5;
    const dz = w.z - (bb.min.z + bb.max.z) * 0.5;
    grp.position.x += dx;
    grp.position.z += dz;
    const x0 = bb.min.x + dx + site.gx, x1 = bb.max.x + dx + site.gx;
    const z0 = bb.min.z + dz + site.gz, z1 = bb.max.z + dz + site.gz;
    const gUnder = Math.min(
      AKB_WATER.ground(site, (x0 + x1) * 0.5, (z0 + z1) * 0.5),
      AKB_WATER.ground(site, x0, z0),
      AKB_WATER.ground(site, x1, z1),
      AKB_WATER.ground(site, x0, z1),
      AKB_WATER.ground(site, x1, z0)
    );
    grp.position.y = (gUnder - 0.18) - bb.min.y;
  }
  parent.add(grp);
  return grp;
}
