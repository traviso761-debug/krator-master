// ================================================================= ARCODIGA — water on core/water: the records
// [G data]: no three.js, no DOM. buildArcodiga hands each site's geometry callbacks to ADG_WATER.dam(d, c), which emits
// core/water records in world coordinates; 90w-arcodiga-water.js binds core/atmos and draws them, and hands the ruined
// site (d === 1) to core/ruins (KRUINS.watch).
//   d === 0 intact      full reservoir at 328 m, 5 hydro tailrace falls, Powerhouse basin, Y-shaped Waterways & Linear City canal
//   d === 3 refurbished kept reservoir at 324 m, 3 active hydro tailrace falls, Powerhouse basin, Y-shaped Waterways & silt irrigation
//   d === 1 ruined      lowered reservoir at 213 m (Notch sill + 1), Notch overflow, 211 m cascade down the battered dam face,
//                       plunge pool and scour stream through the severed west stiffening-wing gap
const ADG_WATER = { sites: [] };

ADG_WATER.dam = function (d, c) {
  const gx = c.gx, gz = c.gz, W = (x, z, y) => [x + gx, z + gz, y];
  const ruin = d === 1, refurb = d === 3;
  const site = { d: d, c: c, still: [], flow: [], fall: [] };
  const D = ARCODIGA.DIM, H = ARCODIGA.HULL;
  const wl = H.waterline(d);

  /* 1. Upstream Reservoir snapped directly to HULL.zUp(x) */
  const poly = [];
  const half = H.span / 2 + 250;
  for (let i = 0; i <= 28; i++) {
    const x = -half + (2 * half * i) / 28;
    poly.push([x + gx, gz + D.CANYON_Z0 + 30]);
  }
  for (let i = 28; i >= 0; i--) {
    const x = -half + (2 * half * i) / 28;
    poly.push([x + gx, gz + H.zUp(x) - 3]);
  }
  site.still.push(WATER.still({
    name: ruin ? 'Arcodiga reservoir (drawn down to breach sill)' : refurb ? 'Arcodiga reservoir (kept impoundment)' : 'Arcodiga reservoir',
    level: wl,
    poly: poly
  }));

  if (!ruin) {
    /* 2. Intact & Refurbished: Hydro tailrace falls, Powerhouse tailrace quay basin, and Soleri's Y-Waterways */
    const Q = H.tailraceQuay;
    const chutes = refurb ? [-96, 0, 96] : D.POWER.chutes;
    for (const cx of chutes) {
      site.fall.push(WATER.fall({
        name: 'Powerhouse tailrace chute',
        lip: [W(cx - 8, Q.z - 2, 16), W(cx + 8, Q.z - 2, 16)],
        dir: [0, 1], speed: 3.2, drop: 16 - Q.y, spread: 4
      }));
    }
    const tb = [
      [Q.x0 + gx, Q.z + gz], [Q.x1 + gx, Q.z + gz],
      [Q.x1 + 12 + gx, Q.z + 60 + gz], [Q.x0 - 12 + gx, Q.z + 60 + gz]
    ];
    site.still.push(WATER.still({ name: 'Powerhouse tailrace basin', level: Q.y, poly: tb }));

    /* Y-branching Waterways converging into the Linear City axial canal */
    for (const s of [-1, 1]) {
      const armPts = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const ax = s * ARCODIGA.lerp(116, 14, t), az = ARCODIGA.lerp(Q.z + 54, 424, t);
        armPts.push(W(ax, az, Q.y - 0.05));
      }
      site.flow.push(WATER.flow({
        name: (s < 0 ? 'West' : 'East') + ' waterway branch',
        pts: armPts, width: 22, speed: 1.5
      }));
    }
    const trunkPts = [];
    for (let z = 418; z <= 980; z += 40) trunkPts.push(W(0, z, Q.y - 0.1));
    site.flow.push(WATER.flow({ name: 'Linear City main waterway', pts: trunkPts, width: 32, speed: 1.35 }));

    /* Circular pumped-silt irrigation basins */
    for (let bi = 0; bi < D.SILT_BEDS.length; bi++) {
      const sb = D.SILT_BEDS[bi], cp = [], rIn = sb.r * 0.34;
      for (let k = 0; k < 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        cp.push([sb.x + gx + rIn * Math.cos(a), sb.z + gz + rIn * Math.sin(a)]);
      }
      site.still.push(WATER.still({ name: 'Silt-basin central cistern ' + (bi + 1), level: 3.15, poly: cp }));
    }
  } else {
    /* 3. Ruined (d === 1): Notch overflow, 211 m cascade snapped to HULL.zDs/HULL.toe, plunge pool & scour stream */
    const N = D.NOTCH, NX = N.x, wN = N.wBot;
    const zU = H.zUp(NX) - 2, zLip = H.zDs(NX, N.sill), zToe = H.toe(NX), lipY = wl - 0.6;
    site.flow.push(WATER.flow({
      name: 'Breach sill overflow',
      pts: [W(NX, zU - 8, wl), W(NX, zLip, lipY)],
      width: 2 * wN, speed: 3.4
    }));
    const faceY = (wx, wz) => {
      const lx = wx - gx, lz = wz - gz, dZ = lz - H.zUp(lx);
      const th0 = H.thAt(0), th1 = H.thAt(H.H);
      return Math.max(0, Math.min(N.sill, H.H * (1 - (dZ - th1) / (th0 - th1))));
    };
    site.fall.push(WATER.fall({
      name: 'The breach cascade',
      lip: [W(NX - wN, zLip, lipY), W(NX + wN, zLip, lipY)],
      dir: [0, 1], speed: 3.5, drop: lipY - 1.2,
      foot: W(NX, zToe + 6, 1.2), face: faceY, faceLift: 1.4, spread: 12
    }));
    const pp = [];
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      pp.push([NX + gx + 40 * Math.cos(a), zToe + 24 + gz + 28 * Math.sin(a)]);
    }
    site.still.push(WATER.still({ name: 'Breach plunge pool', level: 1.25, poly: pp }));

    const rivPts = [], rivWid = [];
    for (let z = zToe + 44; z <= 980; z += 36) {
      const t = ARCODIGA.clamp((z - (zToe + 44)) / 820, 0, 1);
      const rx = ARCODIGA.lerp(NX, -55, Math.pow(t, 0.85)) + 18 * Math.sin(t * 7.5);
      rivPts.push(W(rx, z, 1.1));
      rivWid.push(28 + 14 * Math.sin(t * 4.2));
    }
    site.flow.push(WATER.flow({ name: 'Scour outflow river', pts: rivPts, width: rivWid, speed: 2.0 }));
  }

  ADG_WATER.sites.push(site);
  return site;
};

/* Ground elevation at world (x, z) on the ruined site for core/ruins (KRUINS.watch) */
ADG_WATER.ground = function (site, x, z) {
  const c = site.c, H = ARCODIGA.HULL, lx = x - c.gx, lz = z - c.gz;
  if (Math.abs(lx) > H.span / 2 + 120) return 0;
  if (lz < H.zUp(lx) - 2) return c.bedY(lx, lz);
  return Math.max(0, c.floorY(lx, lz));
};
