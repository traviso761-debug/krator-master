/* ================================================================= ARCKIBUZ — [draw] builder: intact (d=0), ruined (d=1), refurbished (d=3)
   Paolo Soleri's Plate 15 desert arcology.
   Opens with reseed(12720+d) (seed block 12720..12729 reserved for arckibuz).
   Registers every placed structure in KTAGS before drawing, registers non-empty click-to-inspect volumes via REGISTER(),
   builds landscape & gardens into L (isolated from repairPass) and arcology superstructure into G, and records water
   bodies in AKB_WATER. */

function akbClippedBox(geos, x0, x1, y0, y1, z0, z1, d, nxSeg) {
  if (d !== 1) {
    geos.push(akbBox(x0, x1, y0, y1, z0, z1));
    return;
  }
  const n = nxSeg == null ? 6 : nxSeg;
  const dx = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * dx, xb = xa + dx;
    const xm = (xa + xb) * 0.5, ym = (y0 + y1) * 0.5, zm = (z0 + z1) * 0.5;
    if (ARCKIBUZ.inCollapse(xm, zm, ym)) continue;
    geos.push(akbBox(xa, xb, y0, y1, z0, z1));
  }
}

function buildArckibuz(scene, gx, gz, d, opts) { reseed(12720 + d);
  KOFF = [gx, 0, gz];
  const o = opts || {};
  const noTerrain = !!o.noTerrain;
  const groundFn = typeof o.ground === 'function' ? o.ground : null;

  const P = ARCKIBUZ.plan();
  const D = P.dim;
  const H = ARCKIBUZ.HULL;
  const stTag = d === 0 ? 'intact' : d === 1 ? 'ruined' : 'reclaimed';
  const cultTag = d === 3 ? 'post-apoc' : 'ancient';
  const stateLabel = d === 3 ? 'refurbished centerpiece' : STATE(d);

  /* ------------------------------------------------------------------
     1. KTAGS REGISTRATION BEFORE DRAWING
     ------------------------------------------------------------------ */
  const T = (typeof AIK !== 'undefined' && AIK.T) ? AIK.T : (typeof KTAGS !== 'undefined' && KTAGS.page ? KTAGS.page : null);
  if (T) {
    const rootRec = T.add({
      'class': 'landmark',
      kind: 'arcology',
      key: 'arckibuz.' + d,
      name: 'Arckibuz — Desert Arcology (' + stateLabel + ')',
      at: [gx, D.PIT_Y, gz],
      size: [D.RIM_HALF * 2, D.RIM_HALF * 2, D.RES_Y1],
      tags: { culture: 'ancient', state: stTag, types: ['dwelling-multi', 'civic', 'infrastructure', 'farm'], landmark: true },
      frag: '8aw3-arckibuz-draw.js'
    });
    for (let i = 0; i < P.blocks.length; i++) {
      const b = P.blocks[i];
      const bState = d === 3 && b.dormant ? 'rehab' : stTag;
      const bCult = d === 3 && !b.dormant ? cultTag : 'ancient';
      T.child(rootRec.id, {
        'class': 'building',
        kind: b.organ,
        key: 'arckibuz.' + b.id,
        name: b.name,
        at: [gx + (b.x0 + b.x1) * 0.5, b.y0, gz + (b.z0 + b.z1) * 0.5],
        size: [b.x1 - b.x0, b.z1 - b.z0, b.y1 - b.y0],
        tags: { culture: bCult, state: bState, types: b.types, lit: d === 0 || (d === 3 && !b.dormant) },
        frag: '8aw3-arckibuz-draw.js'
      });
    }
    if (!noTerrain) {
      for (let i = 0; i < P.gardens.length; i++) {
        const g = P.gardens[i];
        T.child(rootRec.id, {
          'class': 'feature',
          kind: 'garden',
          key: 'arckibuz.' + g.id,
          name: g.name,
          at: [gx + g.cx, D.RIM_Y, gz + g.cz],
          r: 52, h: 2.5,
          tags: { culture: cultTag, state: d === 1 ? 'ruined' : stTag, types: ['farm'], role: g.crop },
          frag: '8aw3-arckibuz-draw.js'
        });
      }
    }
    T.child(rootRec.id, {
      'class': 'infrastructure',
      kind: 'bridge',
      key: 'arckibuz.highway-bridge.' + d,
      name: 'Eastern Highway Rim Bridge',
      at: [gx + 140, D.RIM_Y, gz],
      size: [62, 22, 6],
      tags: { culture: 'ancient', state: stTag, types: ['infrastructure'] },
      frag: '8aw3-arckibuz-draw.js'
    });
    if (d === 3) {
      for (let i = 0; i < P.bulkheads.length; i++) {
        const bh = P.bulkheads[i];
        T.child(rootRec.id, {
          'class': 'fixture',
          kind: 'bulkhead',
          key: 'arckibuz.' + bh.id,
          name: bh.label,
          at: [gx + bh.x, bh.y, gz + bh.z],
          size: [bh.w, bh.d, bh.h],
          tags: { culture: 'post-apoc', state: 'rehab', role: 'expansion-seal' },
          frag: '8aw3-arckibuz-draw.js'
        });
      }
    }
  }

  /* ------------------------------------------------------------------
     2. INSPECTOR VOLUMES (every cylinder holds dense geometry)
     ------------------------------------------------------------------ */
  REGISTER({ name: 'Arckibuz — Desert Arcology (' + stateLabel + ')', x: 0, y: 0, z: 0, r: 260, h: 122 });
  REGISTER({ name: 'Arckibuz — Cantilevered Housing Crown (' + stateLabel + ')', x: 0, y: 53, z: 0, r: 96, h: 48 });
  REGISTER({ name: 'Arckibuz — Community Council Bowl & City Center (' + stateLabel + ')', x: 0, y: 22, z: 0, r: 64, h: 31 });
  REGISTER({ name: 'Arckibuz — Subterranean Pit Works & Promenade (' + stateLabel + ')', x: 0, y: 0, z: 0, r: 108, h: 28 });
  REGISTER({ name: 'Arckibuz — Rooftop Water Reservoir (' + stateLabel + ')', x: 53, y: 95, z: -36, r: 24, h: 26 });
  REGISTER({ name: 'Arckibuz — Subterranean Shelter & Light Shaft (' + stateLabel + ')', x: D.SHELTER.cx, y: 0, z: 0, r: 24, h: 35 });
  if (!noTerrain) {
    REGISTER({ name: 'Arckibuz — Irrigated Vegetable Gardens (' + stateLabel + ')', x: -168, y: 26, z: -96, r: 72, h: 8 });
  }

  /* Water records created first so AKB_WATER.ground is ready when seating d=1 wrecks */
  const waterSite = AKB_WATER.addSite(d, gx, gz, P, o);

  /* 3. Synthetic demo landscape group L (isolated in its own reseed(12725+d) sub-block & skipped when opts.noTerrain is set) */
  if (!noTerrain) {
    reseed(12725 + d);
    const L = new THREE.Group();
    L.position.set(gx, 0, gz);
    L.userData.akbTerrain = true;
    scene.add(L);
    akbBuildLandscape(L, P, d);
  }

  /* Reset PRNG stream to 12720 + d unconditionally so { noTerrain: true } never shifts a single megastructure draw */
  reseed(12720 + d);

  const G = new THREE.Group();
  G.position.set(gx, 0, gz);
  G.userData.hull = H;
  scene.add(G);

  const shellMat  = d === 1 ? MAT.akbShellR : (d === 3 ? MAT.akbShellRehab : MAT.akbShell);
  const courtMat  = d === 1 ? MAT.akbCourtR : MAT.akbCourt;
  const louverMat = d === 1 ? MAT.akbLouverR : MAT.akbLouver;
  const tentMat   = d === 1 ? MAT.rust : (d === 3 ? MAT.akbTentRehab : MAT.akbTent);
  const steelMat  = d === 1 ? MAT.rust : MAT.darkSurf;

  const shellGeos = [];
  const courtGeos = [];
  const recessGeos = [];
  const louverGeos = [];
  const tentGeos = [];
  const steelGeos = [];

  /* ------------------------------------------------------------------
     4. SUBTERRANEAN PIT BASE, SUNKEN COURT PROMENADE & SHELTER
     ------------------------------------------------------------------ */
  /* Foundation pad & subterranean structural subfloor plates (y = 0.08..0.29, 6.85..7.09, plus court roof 13.75..14.2) */
  courtGeos.push(akbBox(-D.POD_HX - 3, D.POD_HX + 3, 0.08, 0.29, -D.POD_HZ - 3, D.POD_HZ + 3));
  courtGeos.push(akbBox(-D.POD_HX, D.POD_HX, 6.85, 7.09, -D.POD_HZ, D.POD_HZ));
  courtGeos.push(akbBox(-D.POD_HX - 1.5, D.POD_HX + 1.5, 13.75, D.COURT_Y, -D.POD_HZ - 1.5, D.POD_HZ + 1.5));

  /* Colonnaded retaining perimeter piers around the subterranean podium facing the shaded rock-cut moat */
  for (let x = -80; x <= 80; x += 16) {
    shellGeos.push(akbBox(x - 1.8, x + 1.8, 0.2, D.COURT_Y, -D.POD_HZ - 1.2, -D.POD_HZ + 2.2));
    shellGeos.push(akbBox(x - 1.8, x + 1.8, 0.2, D.COURT_Y, D.POD_HZ - 2.2, D.POD_HZ + 1.2));
  }
  for (let z = -72; z <= 72; z += 16) {
    shellGeos.push(akbBox(-D.POD_HX - 1.2, -D.POD_HX + 2.2, 0.2, D.COURT_Y, z - 1.8, z + 1.8));
    shellGeos.push(akbBox(D.POD_HX - 2.2, D.POD_HX + 1.2, 0.2, D.COURT_Y, z - 1.8, z + 1.8));
  }
  /* Recessed perimeter shadow walls behind podium colonnades */
  recessGeos.push(akbBox(-D.POD_HX + 1.4, D.POD_HX - 1.4, 0.25, 13.8, -D.POD_HZ + 1.2, -D.POD_HZ + 2.6));
  recessGeos.push(akbBox(-D.POD_HX + 1.4, D.POD_HX - 1.4, 0.25, 13.8, D.POD_HZ - 2.6, D.POD_HZ - 1.2));
  recessGeos.push(akbBox(-D.POD_HX + 1.2, -D.POD_HX + 2.6, 0.25, 13.8, -D.POD_HZ + 1.4, D.POD_HZ - 1.4));
  recessGeos.push(akbBox(D.POD_HX - 2.6, D.POD_HX - 1.2, 0.25, 13.8, -D.POD_HZ + 1.4, D.POD_HZ - 1.4));

  /* Sunken Court Cistern curb (from ARCKIBUZ.HULL.cistern) */
  const C = H.cistern, cw = C.curbW;
  courtGeos.push(akbBox(C.x0 - cw, C.x1 + cw, C.curbY0, C.curbY1, C.z0 - cw, C.z0));
  courtGeos.push(akbBox(C.x0 - cw, C.x1 + cw, C.curbY0, C.curbY1, C.z1, C.z1 + cw));
  courtGeos.push(akbBox(C.x0 - cw, C.x0, C.curbY0, C.curbY1, C.z0 - cw, C.z1 + cw));
  courtGeos.push(akbBox(C.x1, C.x1 + cw, C.curbY0, C.curbY1, C.z0 - cw, C.z1 + cw));

  /* Soleri's stepped Sunken Court PROMENADE terraces (North & East quadrants rising from y = 14.2 to RIM_Y = 28.0) */
  for (let i = 0; i < P.promenadeSteps.length; i++) {
    const ps = P.promenadeSteps[i];
    /* Ground-tied support wall down to moat floor so outer terrace steps never float */
    courtGeos.push(akbBox(ps.x0, ps.x1, 0.2, ps.y1, ps.z0, ps.z1));
    courtGeos.push(akbBox(ps.eastX0, ps.x1, 0.2, ps.y1, ps.z1, ps.eastZ1));
  }

  /* Bridges across the cliff rim: West Causeway Bridge, South Causeway Stair-Bridge, and East Highway Bridge */
  courtGeos.push(akbBox(-D.PIT_HALF - 2, -D.CITY_HX + 2, 26.8, D.RIM_Y + 0.35, -8.5, 8.5));
  courtGeos.push(akbBox(-86, -80, 0.2, 27.2, -7.5, 7.5));
  courtGeos.push(akbBox(-2, 14, 26.8, D.RIM_Y + 0.35, D.CITY_HZ - 2, D.PIT_HALF + 2));
  courtGeos.push(akbBox(1, 11, 0.2, 27.2, 80, 86));
  /* East Highway Bridge (spanning pit moat and sunken highway x = 88..176) */
  courtGeos.push(akbBox(88, 176, 26.8, D.RIM_Y + 0.38, -10.5, 10.5));
  courtGeos.push(akbBox(100, 106, 0.2, 27.2, -9.0, 9.0));
  courtGeos.push(akbBox(137, 142, D.HWY_Y - 0.4, 27.2, -9.0, 9.0));
  courtGeos.push(akbBox(166, 171, D.HWY_Y - 0.4, 27.2, -9.0, 9.0));

  /* Eastern subterranean gallery tunnel (x = 83..200, z = -4.8..4.8) & SHELTER chamber + Flared Hyperbolic Shaft */
  const SH = D.SHELTER;
  shellGeos.push(akbBox(SH.tunnelX0 - 1, SH.tunnelX1 + 2, 0.1, SH.tunnelH + 0.6, -SH.tunnelW * 0.5, SH.tunnelW * 0.5));
  shellGeos.push(akbBox(SH.cx - SH.hx, SH.cx + SH.hx, 0.1, 0.29, SH.cz - SH.hz, SH.cz + SH.hz));
  shellGeos.push(akbBox(SH.cx - SH.hx, SH.cx + SH.hx, 4.55, 4.79, SH.cz - SH.hz, SH.cz + SH.hz));
  shellGeos.push(akbBox(SH.cx - SH.hx, SH.cx + SH.hx, 9.2, SH.y1, SH.cz - SH.hz, SH.cz + SH.hz));
  /* Shelter perimeter walls */
  shellGeos.push(akbBox(SH.cx - SH.hx, SH.cx + SH.hx, 0.2, SH.y1, SH.cz - SH.hz, SH.cz - SH.hz + 1.8));
  shellGeos.push(akbBox(SH.cx - SH.hx, SH.cx + SH.hx, 0.2, SH.y1, SH.cz + SH.hz - 1.8, SH.cz + SH.hz));
  shellGeos.push(akbBox(SH.cx + SH.hx - 1.8, SH.cx + SH.hx, 0.2, SH.y1, SH.cz - SH.hz, SH.cz + SH.hz));
  /* Flared hyperbolic ventilation / light shaft piercing the eastern desert plateau (y = 9.4 .. 33.6 m) */
  const shaftH = SH.shaftY1 - 9.4;
  const shaftGeo = lathe({
    H: shaftH, nu: 28, nv: 18,
    rFn: y => {
      const t = y / shaftH;
      const waist = SH.shaftRMin + (SH.shaftR0 - SH.shaftRMin) * Math.pow(1 - Math.min(1, t / 0.55), 2);
      const flare = t > 0.55 ? (SH.shaftRTop - SH.shaftRMin) * Math.pow((t - 0.55) / 0.45, 2.1) : 0;
      return waist + flare;
    }
  });
  shaftGeo.translate(SH.cx, 9.4, SH.cz);
  shellGeos.push(shaftGeo);
  /* Sculpted desert collar ring around the Shelter shaft at y = 28.0 & rim cap at y = 33.4 */
  shellGeos.push(akbCyl(SH.cx, SH.cz, 7.6, 8.4, D.RIM_Y - 0.5, D.RIM_Y + 0.9, 24));
  shellGeos.push(akbCyl(SH.cx, SH.cz, SH.shaftRTop + 0.55, SH.shaftRTop + 0.2, SH.shaftY1 - 0.6, SH.shaftY1 + 0.2, 24));

  /* Garden Seed & Pump Sheds on the desert rim (shed-nw & shed-sw) */
  for (let i = 0; i < P.sheds.length; i++) {
    const sh = P.sheds[i];
    courtGeos.push(akbBox(sh.x0 - 0.4, sh.x1 + 0.4, sh.y0 - 0.25, sh.y0 + 0.2, sh.z0 - 0.4, sh.z1 + 0.4));
    shellGeos.push(akbBox(sh.x0 - 0.3, sh.x1 + 0.3, sh.y0 + sh.h, sh.y0 + sh.h + 0.65, sh.z0 - 0.3, sh.z1 + 0.3));
    shellGeos.push(akbBox(sh.x0, sh.x0 + 1.0, sh.y0, sh.y0 + sh.h + 0.2, sh.z0, sh.z0 + 1.0));
    shellGeos.push(akbBox(sh.x1 - 1.0, sh.x1, sh.y0, sh.y0 + sh.h + 0.2, sh.z0, sh.z0 + 1.0));
    shellGeos.push(akbBox(sh.x0, sh.x0 + 1.0, sh.y0, sh.y0 + sh.h + 0.2, sh.z1 - 1.0, sh.z1));
    shellGeos.push(akbBox(sh.x1 - 1.0, sh.x1, sh.y0, sh.y0 + sh.h + 0.2, sh.z1 - 1.0, sh.z1));
  }

  /* ------------------------------------------------------------------
     5. STRUCTURAL MEGA-CORES, COUNCIL RING COLUMNS & STAIR DRUMS
     ------------------------------------------------------------------ */
  for (let i = 0; i < P.cores.length; i++) {
    const c = P.cores[i];
    if (c.kind === 'mega') {
      const topY = (d === 1 && c.id === 'core.se') ? 68.0 : c.y1;
      shellGeos.push(akbBox(c.x - c.hx, c.x + c.hx, 0.1, topY, c.z - c.hz, c.z + c.hz));
    } else {
      if (d === 1 && ARCKIBUZ.inCollapse(c.x, c.z, 70)) continue;
      shellGeos.push(akbCyl(c.x, c.z, c.r, c.r, c.y0 - 0.4, c.y1, 20));
    }
  }
  for (let i = 0; i < P.ringCols.length; i++) {
    const rc = P.ringCols[i];
    shellGeos.push(akbCyl(rc.x, rc.z, rc.r, rc.r * 1.12, 0.1, rc.y1, 16));
  }

  /* ------------------------------------------------------------------
     6. CITY CENTER TRUNK (y = 22.0..38.0) & COMMUNITY TIER (y = 38.0..53.0)
     ------------------------------------------------------------------ */
  /* City Center structural subfloors & horizontal sun-shaded gallery ribbons */
  for (const sy of [22.4, 29.8]) {
    shellGeos.push(akbBox(-D.CITY_HX, D.CITY_HX, sy - 0.55, sy - 0.31, -D.CITY_HZ, D.CITY_HZ));
    /* Projecting horizontal sun-hoods around City Center */
    shellGeos.push(akbBox(-D.CITY_HX - 1.8, D.CITY_HX + 1.8, sy + 3.8, sy + 4.5, -D.CITY_HZ - 1.8, -D.CITY_HZ + 1.2));
    shellGeos.push(akbBox(-D.CITY_HX - 1.8, D.CITY_HX + 1.8, sy + 3.8, sy + 4.5, D.CITY_HZ - 1.2, D.CITY_HZ + 1.8));
    shellGeos.push(akbBox(-D.CITY_HX - 1.8, -D.CITY_HX + 1.2, sy + 3.8, sy + 4.5, -D.CITY_HZ, D.CITY_HZ));
    shellGeos.push(akbBox(D.CITY_HX - 1.2, D.CITY_HX + 1.8, sy + 3.8, sy + 4.5, -D.CITY_HZ, D.CITY_HZ));
  }
  /* City Center corner pilasters & aqueduct spout (from HULL.cistern) */
  for (let x = -44; x <= 44; x += 22) {
    shellGeos.push(akbBox(x - 1.6, x + 1.6, D.COURT_Y - 0.3, D.CITY_Y1, -D.CITY_HZ - 0.6, -D.CITY_HZ + 1.8));
    shellGeos.push(akbBox(x - 1.6, x + 1.6, D.COURT_Y - 0.3, D.CITY_Y1, D.CITY_HZ - 1.8, D.CITY_HZ + 0.6));
  }
  courtGeos.push(akbBox(C.lipX0 - 1.0, C.lipX1 + 1.0, C.lipY - 0.7, C.lipY + 0.7, -D.CITY_HZ, C.lipZ + 0.5));

  const commHole = [];
  for (let k = 0; k < 28; k++) {
    const th = (k / 28) * TAU;
    commHole.push([D.BOWL_R * Math.cos(th), D.BOWL_R * Math.sin(th)]);
  }
  const commHoleRev = commHole.slice().reverse();

  /* Flared soffit transition collar from City Center (96 x 88 m) out to Community Tier (128 x 116 m), open over Council Bowl */
  for (let k = 0; k < 4; k++) {
    const t0 = k / 4, t1 = (k + 1) / 4;
    const hx = lerp(D.CITY_HX, D.COMM_HX - 2, t1), hz = lerp(D.CITY_HZ, D.COMM_HZ - 1, t1);
    shellGeos.push(akbPolySlab([[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]], lerp(36.2, 38.09, t0), lerp(36.2, 38.09, t1), commHoleRev));
  }

  /* Central Circular Stepped Council Amphitheater (Plan 1 on Sheet 2) */
  const bowlGeos = akbCouncilBowlGeos(D);
  for (let i = 0; i < bowlGeos.length; i++) courtGeos.push(bowlGeos[i]);

  /* Community Council Ring & 4 Pinwheel Corner Bastions (open r = 23.5 m over Council Bowl) */
  const commPoly = [[-38, -38], [38, -38], [38, 38], [-38, 38]];
  shellGeos.push(akbPolySlab(commPoly, 37.82, 38.40, commHoleRev));
  shellGeos.push(akbPolySlab(commPoly, 45.02, 45.60, commHoleRev));

  for (let i = 0; i < P.bastions.length; i++) {
    const b = P.bastions[i];
    const hs = 15.5;
    shellGeos.push(akbBox(b.cx - hs, b.cx + hs, 37.82, 38.40, b.cz - hs, b.cz + hs));
    shellGeos.push(akbBox(b.cx - hs, b.cx + hs, 45.02, 45.60, b.cz - hs, b.cz + hs));
    shellGeos.push(akbBox(b.cx - hs - 0.8, b.cx + hs + 0.8, 52.2, 53.2, b.cz - hs - 0.8, b.cz + hs + 0.8));
    /* Pinwheel perimeter colonnade piers (notched square bastion profile from Plan 1) */
    for (let s = -12; s <= 12; s += 8) {
      shellGeos.push(akbBox(b.cx + s - 1.3, b.cx + s + 1.3, 38.0, 52.5, b.cz - hs - 0.4, b.cz - hs + 1.6));
      shellGeos.push(akbBox(b.cx + s - 1.3, b.cx + s + 1.3, 38.0, 52.5, b.cz + hs - 1.6, b.cz + hs + 0.4));
      shellGeos.push(akbBox(b.cx - hs - 0.4, b.cx - hs + 1.6, 38.0, 52.5, b.cz + s - 1.3, b.cz + s + 1.3));
      shellGeos.push(akbBox(b.cx + hs - 1.6, b.cx + hs + 0.4, 38.0, 52.5, b.cz + s - 1.3, b.cz + s + 1.3));
    }
  }

  /* ------------------------------------------------------------------
     7. CANTILEVERED SKY-PROMENADE & HOUSING CROWN (y = 53.0..95.1)
     ------------------------------------------------------------------ */
  /* Deep tapered concrete cantilever beams under the 176 x 140 m sky-promenade platform */
  for (let z = -56; z <= 56; z += 28) {
    akbClippedBox(shellGeos, -D.DECK_HX + 2, D.DECK_HX - 2, 49.8, 53.2, z - 2.2, z + 2.2, d, 8);
  }
  for (let x = -64; x <= 64; x += 32) {
    akbClippedBox(shellGeos, x - 2.2, x + 2.2, 49.8, 53.2, -D.DECK_HZ + 2, D.DECK_HZ - 2, d, 4);
  }

  /* Sky-promenade deck framing the open 66 x 48 m PUBLIC Sky Court (clipped on SE shear in d = 1) */
  akbClippedBox(courtGeos, -D.DECK_HX, D.DECK_HX, D.DECK_Y0, D.DECK_Y1, -D.DECK_HZ, -D.SKY_HZ, d, 10);
  akbClippedBox(courtGeos, -D.DECK_HX, D.DECK_HX, D.DECK_Y0, D.DECK_Y1, D.SKY_HZ, D.DECK_HZ, d, 10);
  akbClippedBox(courtGeos, -D.DECK_HX, -D.SKY_HX, D.DECK_Y0, D.DECK_Y1, -D.SKY_HZ, D.SKY_HZ, d, 4);
  akbClippedBox(courtGeos, D.SKY_HX, D.DECK_HX, D.DECK_Y0, D.DECK_Y1, -D.SKY_HZ, D.SKY_HZ, d, 4);
  /* Sky Court floor deck over the Community Council Bowl ring (with central daylight oculus r = 14 m into Council Bowl!) */
  const skyCourtHole = [];
  for (let k = 0; k < 24; k++) {
    const th = (k / 24) * TAU;
    skyCourtHole.push([13.5 * Math.cos(th), 13.5 * Math.sin(th)]);
  }
  courtGeos.push(akbPolySlab(
    [[-D.SKY_HX - 1, -D.SKY_HZ - 1], [D.SKY_HX + 1, -D.SKY_HZ - 1], [D.SKY_HX + 1, D.SKY_HZ + 1], [-D.SKY_HX - 1, D.SKY_HZ + 1]],
    52.8, D.DECK_Y1, skyCourtHole.slice().reverse()
  ));
  shellGeos.push(akbCyl(0, 0, 14.3, 14.3, 52.8, D.DECK_Y1 + 1.2, 24));

  /* Duplex Housing macro-decks & mezzanine slabs + roof deck across all 4 pinwheel quadrants (subfloors y = st.y - 0.55 .. st.y - 0.31) */
  const housSlabs = [56.0, 62.6, 69.2, 75.8, 82.4, 89.0, D.HOUS_Y1 + 0.3];
  for (let i = 0; i < housSlabs.length; i++) {
    const yBase = housSlabs[i];
    const ya = i === housSlabs.length - 1 ? D.HOUS_Y1 - 0.6 : yBase - 0.55;
    const yb = i === housSlabs.length - 1 ? D.HOUS_Y1 - 0.01 : yBase - 0.31;
    akbClippedBox(shellGeos, -68, 68, ya, yb, -62, -26, d, 10);
    akbClippedBox(shellGeos, -68, 68, ya, yb, 26, 62, d, 10);
    akbClippedBox(shellGeos, -74, -36, ya, yb, -26, 26, d, 4);
    akbClippedBox(shellGeos, 36, 74, ya, yb, -26, 26, d, 4);
  }
  /* Housing quadrant end shear walls & inner court gallery piers */
  const cornerWalls = [
    [-68, -65.5, -62, -26], [65.5, 68, -62, -26],
    [-68, -65.5, 26, 62],   [65.5, 68, 26, 62],
    [-74, -36, -26, -23.5], [-74, -36, 23.5, 26],
    [36, 74, -26, -23.5],   [36, 74, 23.5, 26]
  ];
  for (let i = 0; i < cornerWalls.length; i++) {
    const cw = cornerWalls[i];
    akbClippedBox(shellGeos, cw[0], cw[1], D.HOUS_Y0 - 0.3, D.HOUS_Y1 + 1.2, cw[2], cw[3], d, 3);
  }
  /* Inner Sky Court colonnaded walkways */
  for (let x = -24; x <= 24; x += 12) {
    shellGeos.push(akbBox(x - 1.1, x + 1.1, D.HOUS_Y0 - 0.3, D.HOUS_Y1 + 0.5, -27.5, -25.5));
    akbClippedBox(shellGeos, x - 1.1, x + 1.1, D.HOUS_Y0 - 0.3, D.HOUS_Y1 + 0.5, 25.5, 27.5, d, 1);
  }

  /* Soleri's Hieroglyphic Cellular Facade Cassettes across N, S, W, E faces */
  for (let i = 0; i < P.cassettes.length; i++) {
    akbAddCassette(shellGeos, recessGeos, P.cassettes[i], d);
  }

  /* Projecting East & West Horizontal Sun-Breaker Louver Wings (spanning +/-92 m = 184 m total crown width!) */
  for (const sgn of [-1, 1]) {
    const xIn = sgn * (D.HOUS_OUT_X - 2.0), xOut = sgn * D.LOUV_OUT_X;
    const xa = Math.min(xIn, xOut), xb = Math.max(xIn, xOut);
    let keptNorth = false, keptSouth = false;
    /* Top, bottom, and intermediate louver blades bolted into the +/-74 m housing wall & +/-88 m sky-promenade */
    for (let seg = 0; seg < 6; seg++) {
      const za = -D.LOUV_HZ + seg * (2 * D.LOUV_HZ / 6), zb = za + (2 * D.LOUV_HZ / 6);
      const zm = (za + zb) * 0.5;
      if (d === 1 && ARCKIBUZ.inCollapse(sgn * D.HOUS_OUT_X, zm, 74)) continue;
      if (seg === 0) keptNorth = true;
      if (seg === 5) keptSouth = true;
      louverGeos.push(akbBox(xa, xb, 54.8, 57.0, za, zb));
      louverGeos.push(akbBox(xa, xb, 91.2, 93.0, za, zb));
      for (let lv = 1; lv <= 7; lv++) {
        const ly = 56.8 + lv * 4.7;
        louverGeos.push(akbBox(xa + 1.2, xb - 0.4, ly - 0.38, ly + 0.38, za, zb));
      }
    }
    if (keptNorth) {
      louverGeos.push(akbBox(xa, xa + 2.4, 54.8, 93.0, -D.LOUV_HZ - 1.4, -D.LOUV_HZ + 0.8));
      louverGeos.push(akbBox(xb - 2.4, xb, 54.8, 93.0, -D.LOUV_HZ - 1.4, -D.LOUV_HZ + 0.8));
    }
    if (keptSouth) {
      louverGeos.push(akbBox(xa, xa + 2.4, 54.8, 93.0, D.LOUV_HZ - 0.8, D.LOUV_HZ + 1.4));
      louverGeos.push(akbBox(xb - 2.4, xb, 54.8, 93.0, D.LOUV_HZ - 0.8, D.LOUV_HZ + 1.4));
    }
  }

  /* ------------------------------------------------------------------
     8. ROOFTOP PAVILIONS, TENT STRUCTURE CANOPIES & WATER RESERVOIR (y = 95.1..120.2)
     ------------------------------------------------------------------ */
  /* Rooftop promenade pavilion roofs & structural corner piers (hn.roof & hw.roof) */
  for (const pv of [[-25, -3, -52, -34, D.HOUS_Y1 + 4.9], [-70, -42, -10, 10, D.HOUS_Y1 + 5.1]]) {
    const px0 = pv[0], px1 = pv[1], pz0 = pv[2], pz1 = pv[3], py1 = pv[4];
    shellGeos.push(akbBox(px0, px1, py1 - 0.8, py1, pz0, pz1));
    shellGeos.push(akbBox(px0, px0 + 1.4, D.HOUS_Y1 - 0.5, py1 - 0.7, pz0, pz0 + 1.4));
    shellGeos.push(akbBox(px1 - 1.4, px1, D.HOUS_Y1 - 0.5, py1 - 0.7, pz0, pz0 + 1.4));
    shellGeos.push(akbBox(px0, px0 + 1.4, D.HOUS_Y1 - 0.5, py1 - 0.7, pz1 - 1.4, pz1));
    shellGeos.push(akbBox(px1 - 1.4, px1, D.HOUS_Y1 - 0.5, py1 - 0.7, pz1 - 1.4, pz1));
  }

  /* 5 Peaked TENT STRUCTURE tensile canopies spanning the Sky Court & roof terraces */
  for (let i = 0; i < P.tents.length; i++) {
    akbAddTent(tentGeos, steelGeos, P.tents[i], d, i);
  }

  /* Monumental Cubic WATER RESERVOIR Tower on the NE Shoulder (x: 34..72, z: -54..-18, y: 95.1..120.2) */
  const RS = D.RESERVOIR, wt = RS.wallT;
  /* Tank floor slab anchored into NE housing roof */
  shellGeos.push(akbBox(RS.x0, RS.x1, RS.y0 - 0.5, RS.y0 + 2.2, RS.z0, RS.z1));
  /* North & West tank walls (whole in all states) */
  shellGeos.push(akbBox(RS.x0, RS.x1, RS.y0, RS.y1, RS.z0, RS.z0 + wt));
  shellGeos.push(akbBox(RS.x0, RS.x0 + wt, RS.y0, RS.y1, RS.z0, RS.z1));
  /* East & South tank walls (whole in d = 0, 3; V-breached above y = 102 on SE corner in d = 1!) */
  akbClippedBox(shellGeos, RS.x0, RS.x1, RS.y0, d === 1 ? 102.5 : RS.y1, RS.z1 - wt, RS.z1, 0, 1);
  akbClippedBox(shellGeos, RS.x1 - wt, RS.x1, RS.y0, d === 1 ? 102.5 : RS.y1, RS.z0, RS.z1, 0, 1);
  if (d === 1) {
    shellGeos.push(akbBox(RS.x0, 53.5, 102.0, RS.y1, RS.z1 - wt, RS.z1));
    shellGeos.push(akbBox(RS.x1 - wt, RS.x1, 102.0, RS.y1, RS.z0, -35.5));
  }
  /* Vertical concrete pilasters, parapet stanchions & gravity feed standpipes on Water Reservoir */
  for (let k = 0; k < 4; k++) {
    const px = RS.x0 + 4 + k * 9.5;
    shellGeos.push(akbBox(px - 0.9, px + 0.9, RS.y0, RS.y1 + 0.3, RS.z0 - 1.1, RS.z0 + 0.4));
    kput(d === 1 ? 'postR' : 'postW', [px, RS.y1 + 0.6, RS.z0 + 1.2], null, [0.22, 1.6, 0.22], null);
    kput(BOXC(d === 1 ? 1 : 0), [RS.x0 + 0.4, RS.y0 + 4 + k * 5.2, (RS.z0 + RS.z1) * 0.5], null, [1.4, 0.5, 4.2], null);
  }
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * TAU;
    kput(BOXC(d === 1 ? 1 : 0), [SH.cx + 7.2 * Math.cos(th), D.RIM_Y + 0.6, SH.cz + 7.2 * Math.sin(th)],
      qEuler(0, -th, 0), [1.2, 1.8, 0.9], null);
  }
  steelGeos.push(akbCyl(RS.x0 + 3.5, RS.z0 + 3.5, 0.85, 0.85, D.COURT_Y - 0.2, RS.y0 + 1.0, 10));

  /* ------------------------------------------------------------------
     9. STATE-SPECIFIC ACCENTS: INTACT (d=0), RUINED (d=1), REFURBISHED (d=3)
     ------------------------------------------------------------------ */
  if (d === 0) {
    /* Crisp cyan architectural light strips flush with cantilever fascias (<= 0.2 m off face) */
    for (const z of [-D.DECK_HZ - 0.12, D.DECK_HZ + 0.12]) {
      kput('strip', [0, D.DECK_Y0 + 1.2, z], null, [D.DECK_HX * 1.92, 1.4, 1.4], CYAN);
    }
    kput('strip', [0, D.CITY_Y1 - 0.5, -D.CITY_HZ - 0.12], null, [D.CITY_HX * 1.88, 1.2, 1.2], CYAN);
    kput('strip', [0, D.CITY_Y1 - 0.5, D.CITY_HZ + 0.12], null, [D.CITY_HX * 1.88, 1.2, 1.2], CYAN);
  } else if (d === 1) {
    /* Ruined SE shear scar: protruding broken floor stubs (anchored 1.5 m inside intact slab) + seated wrecks + talus */
    for (let i = 0; i < P.wrecks.length; i++) {
      akbSeatWreck(G, P.wrecks[i], shellMat, waterSite);
    }
    /* Mineral water-breach stains below cracked reservoir & talus rubble along cliff toes (skipped by KRUINS.DECOR) */
    kput('stain', [62, 78, -17.8], qFacing([0, 0, 1]), [9, 28, 1], null);
    for (let i = 0; i < 65; i++) {
      const rx = 56 + rng() * 52, rz = -42 + rng() * 144;
      const gy = groundFn ? groundFn(gx + rx, gz + rz) : ARCKIBUZ.groundAt(rx, rz, 1);
      const sc = rr(1.2, 4.2);
      kput('rubble', [rx, gy + sc * 0.35, rz], qEuler(rng() * 3, rng() * 3, rng() * 3),
        [sc * rr(0.8, 1.4), sc * rr(0.5, 0.9), sc * rr(0.8, 1.4)], null);
    }
  } else if (d === 3) {
    /* Refurbished Settlement Centerpiece: visible structural bulkheads sealing housing-e & pit-east + warm lanterns */
    for (let i = 0; i < P.bulkheads.length; i++) {
      const bh = P.bulkheads[i];
      kput('akbBulkP', [bh.x, bh.y + bh.h * 0.5, bh.z], null, [bh.w, bh.h, bh.d], null);
      /* Diagonal timber/iron bracing across the bulkhead face */
      kput('boxR', [bh.x - 0.2, bh.y + bh.h * 0.5, bh.z], qEuler(0.45, 0, 0), [bh.w + 0.35, 0.45, bh.d * 0.92], null);
      kput('boxR', [bh.x - 0.2, bh.y + bh.h * 0.5, bh.z], qEuler(-0.45, 0, 0), [bh.w + 0.35, 0.45, bh.d * 0.92], null);
    }
    /* Warm settlement lantern strips along inhabited West/South/North sky-promenade, Council Bowl, and Causeways */
    kput('strip', [-16, D.DECK_Y0 + 1.2, -D.DECK_HZ - 0.12], null, [104, 1.3, 1.3], WARM);
    kput('strip', [-16, D.DECK_Y0 + 1.2, D.DECK_HZ + 0.12], null, [104, 1.3, 1.3], WARM);
    kput('strip', [-D.DECK_HX - 0.12, D.DECK_Y0 + 1.2, 0], qEuler(0, Math.PI * 0.5, 0), [96, 1.3, 1.3], WARM);
    for (let i = 0; i < 8; i++) {
      const th = (i + 0.5) / 8 * TAU;
      kput('dot', [24.2 * Math.cos(th), 39.2, 24.2 * Math.sin(th)], null, [1.3, 1.3, 1.3], WARM);
    }
    for (let x = noTerrain ? -114 : -210; x <= -60; x += 30) {
      kput('dot', [x, D.RIM_Y + 2.2, -7.8], null, [1.1, 1.1, 1.1], WARM);
      kput('dot', [x, D.RIM_Y + 2.2, 7.8], null, [1.1, 1.1, 1.1], WARM);
    }
    for (let x = 96; x <= 168; x += 24) {
      kput('dot', [x, D.RIM_Y + 2.2, -9.5], null, [1.1, 1.1, 1.1], WARM);
      kput('dot', [x, D.RIM_Y + 2.2, 9.5], null, [1.1, 1.1, 1.1], WARM);
    }
  }

  meshMerged(shellGeos, shellMat, G);
  meshMerged(courtGeos, courtMat, G);
  meshMerged(recessGeos, MAT.akbRecess, G);
  meshMerged(louverGeos, louverMat, G);
  meshMerged(tentGeos, tentMat, G);
  meshMerged(steelGeos, steelMat, G);

  KOFF = [0, 0, 0];
  return G;
}
buildArckibuz.hull = ARCKIBUZ.HULL;
