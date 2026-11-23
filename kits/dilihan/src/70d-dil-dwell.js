// ================================================================= 70d. DILIHAN VASSAL KIT — Dwellings (Poor, Middle, Rich)
// [draw] Seven passive-cooling red-and-orange kiln-brick residential types on the Iziz Vernacular contract (seeds 9801..9849):
//   1. dil_house_poor_dogtrot   (9 x 10 m, poor)    Raised brick-pier cottage with open central dogtrot breezeway & zeer porch
//   2. dil_house_poor_yard      (10 x 10 m, poor)   L-wing brick cottage around a bamboo-pergola work-yard & jali garden wall
//   3. dil_house_mid_courtyard  (14 x 14 m, middle) 2-storey U-plan courtyard house with impluvium, jali gallery & orange fascia
//   4. dil_house_mid_veranda    (13 x 15 m, middle) 2-storey colonial townhouse with brick ground loggia & louvered sleeping veranda
//   5. dil_tenement_windwell    (15 x 16 m, middle) 3-storey multi-family apartment house around a stack-effect wind-well court
//   6. dil_villa_impluvium      (24 x 26 m, rich)   Peristyle orange-brick villa with sunken turquoise pool, silk sails & copper monitor
//   7. dil_manor_breezeway      (26 x 24 m, rich)   Twin-court factor manor with vaulted wind-passage, mirador loggia & malqaf lantern

/* 1. Poor — Raised brick-pier cottage with open central dogtrot breezeway (9 x 10 m) */
function buildDilHousePoorDogtrot(G, o) { reseed(9801 + (o.v | 0));
  const FL = 0.58;
  const H = 2.95;
  const lvC = dlnLouverTint();
  const brkC = dlnBrickTint((o.v & 1) === 1);
  const morC = dlnMortarTint();
  vnReg('Dogtrot brick cottage', 0, 0, 5.2, FL + H + 3.0);

  /* Raised damp-proof brick piers + ventilated undercroft + timber deck spanning full width */
  for (const lx of [-3.4, -1.3, 1.3, 3.4]) {
    for (const lz of [-2.8, 0, 2.8]) {
      vB('dlLateriteB', lx, -0.15, lz, 0.56, 0.25, 0.56, 0, vC(dlnPick(DL_PAL.laterite)));
      vB('dlBrickDeepB', lx, 0.10, lz, 0.44, FL - 0.22, 0.44, 0, vC(dlnPick(DL_PAL.brickDeep)));
    }
  }
  vB('dlMortarB', 0, FL - 0.14, 0, 7.8, 0.14, 6.6, 0, morC);
  vB('vWood', 0, FL - 0.04, 0, 2.4, 0.06, 6.5, 0, lvC);

  /* Twin brick sleeping/living cabins flanking a 2.3 m wide open central dogtrot breezeway */
  for (const s of [-1, 1]) {
    const wx = s * 2.55;
    dlnBrickWing(wx, FL, 0, 2.6, H, 6.2, 0, { c: brkC, quoins: false });
    /* Doors opening inward onto the shaded dogtrot wind-passage (locked on solid sheet) */
    vnDoor(s * 1.25, FL, 0.3, -s * Math.PI * 0.5, 0.92, 2.0, 'vWood', lvC, lvC, false);
    /* Propped louver windows on front, side, and rear for 4-way cross-draft */
    dlnOpenWin(wx, FL + 0.95, 3.1, 0, 1.05, 1.15, { hoodOut: 0.62 });
    dlnOpenWin(s * 3.85, FL + 0.95, -0.6, s * Math.PI * 0.5, 1.10, 1.10, { hoodOut: 0.58 });
    dlnOpenWin(wx, FL + 1.0, -3.1, Math.PI, 0.95, 1.05, { hood: false });
  }

  /* Continuous deep-eaved monsoon gable roof with raised ridge-vent monitor spanning both cabins & breezeway */
  dlnCornice(0, FL + H, 0, 7.7, 6.2, 0);
  dlnMonitorRoof(0, FL + H + 0.54, 0, 7.8, 6.3, 2.15, 0, {
    gable: true, over: 0.72, monW: 4.4, monD: 1.5, monH: 0.58, monRise: 0.52
  });

  /* Shaded front porch + brick entry stair + terracotta zeer evaporative cooling jars */
  vB('dlMortarB', 0, 0, 3.85, 3.2, FL, 1.25, 0, morC);
  vnStairs(0, 0, 4.55, 0, 1.6, FL, 3, 'vStone', morC);
  for (const s of [-1, 1]) vPst('vPost', s * 1.45, FL, 4.32, 0.09, H - 0.1, lvC);
  vnShedRoof(0, FL + H - 0.35, 3.85, 3.5, 1.4, 0.45, 0, 'dlTileB', dlnTileTint(), 0.25, 0.14);
  dlnZeerCluster(-2.6, 0, 3.95, 2, 0);
  vnPlanter(2.7, 0, 3.95, 1.3, 0.75, 0, lvC);
}

/* 2. Poor — L-wing red-brick cottage with bamboo-pergola work-yard & perforated jali wall (10 x 10 m) */
function buildDilHousePoorYard(G, o) { reseed(9809 + (o.v | 0));
  const Y0 = 0.44;
  const H = 3.05;
  const brkC = dlnBrickTint((o.v & 1) === 0);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Courtyard brick cottage', 0, 0, 5.4, Y0 + H + 2.8);

  /* Rear main sleeping wing (8.4 x 4.4 m) + left side wing (3.8 x 4.2 m) forming a sheltered SE work-yard */
  dlnPlinth(0, 0, -2.1, 8.4, 4.4, Y0, 0);
  dlnBrickWing(0, Y0, -2.1, 8.4, H, 4.4, 0, { c: brkC });
  dlnCornice(0, Y0 + H, -2.1, 8.4, 4.4, 0);
  dlnMonitorRoof(0, Y0 + H + 0.54, -2.1, 8.4, 4.4, 1.85, 0, { over: 0.68, monW: 4.2, monD: 1.4, monH: 0.52 });

  dlnPlinth(-2.3, 0, 1.8, 3.8, 3.6, Y0, 0);
  dlnBrickWing(-2.3, Y0, 1.8, 3.8, H - 0.35, 3.6, 0, { c: brkC, quoins: false });
  dlnCornice(-2.3, Y0 + H - 0.35, 1.8, 3.8, 3.6, 0);
  dlnMonitorRoof(-2.3, Y0 + H + 0.19, 1.8, 3.8, 3.6, 1.45, 0, { monitor: false, over: 0.58 });

  /* Perforated red-brick jali garden walls enclosing the front-right breeze-yard (+x/+z quadrant) */
  vB('dlBrickOchreB', 1.9, 0, 1.9, 4.6, 0.08, 4.0, 0, vC(dlnPick(DL_PAL.brickOchre)));
  vB('dlBrickB', 2.95, 0, 3.9, 2.5, 1.85, 0.28, 0, brkC);
  dlnJali(2.95, 0.55, 3.92, 0, 2.0, 1.05, { openBack: true, c: brkC });
  vB('dlMortarB', 2.95, 1.85, 3.9, 2.66, 0.12, 0.38, 0, morC);

  vB('dlBrickB', 4.15, 0, 1.8, 0.28, 1.85, 4.0, 0, brkC);
  dlnJali(4.17, 0.55, 1.8, Math.PI * 0.5, 3.0, 1.05, { openBack: true, c: brkC });
  vB('dlMortarB', 4.15, 1.85, 1.8, 0.38, 0.12, 4.12, 0, morC);

  /* Street courtyard gate + house door + louvered windows */
  vB('dlBrickBandB', 0.65, 0, 3.9, 1.95, 2.55, 0.36, 0, brkC);
  vB('vWood', 0.65, 2.55, 3.9, 2.25, 0.14, 0.52, 0, dlnOrangeTint());
  vnDoor(0.65, 0.12, 3.92, 0, 1.10, 2.05, 'vWood', lvC, lvC);
  vnDoor(1.3, Y0, 0.10, 0, 1.0, 2.1, 'vWood', lvC, lvC);

  dlnOpenWin(-2.3, Y0 + 0.88, 3.6, 0, 1.15, 1.15, { canvasHood: true });
  dlnOpenWin(2.8, Y0 + 0.92, 0.10, 0, 1.15, 1.15, { hoodOut: 0.65 });
  dlnOpenWin(0, Y0 + 0.95, -4.3, Math.PI, 1.25, 1.10, { hoodOut: 0.55 });
  dlnOpenWin(-4.2, Y0 + 0.95, -2.1, -Math.PI * 0.5, 1.15, 1.10, { hoodOut: 0.55 });

  /* Bamboo-slat shade pergola over the work-yard + outdoor summer cooking hearth & chimney */
  dlnPergola(2.2, 0.08, 1.8, 3.4, 3.2, 2.45, 0, {});
  vB('dlBrickDeepB', 3.45, 0.08, 0.35, 1.05, 0.95, 0.95, 0, vC(dlnPick(DL_PAL.brickDeep)));
  vBall('vEmber', 3.25, 0.62, 0.55, 0.16);
  vnChimney(3.55, 1.02, 0.30, 1.85, 0.12, false);
  dlnZeerCluster(1.0, 0.08, 1.9, 2, Math.PI * 0.5);
}

/* 3. Middle — 2-storey U-plan red/orange brick courtyard house (14 x 14 m, cornice 6.70 m) */
function buildDilHouseMidCourtyard(G, o) { reseed(9817 + (o.v | 0));
  const Y0 = 0.50;
  const H1 = 3.15;
  const H2 = 2.51;   /* Y0(0.50) + H1(3.15) + H2(2.51) + cornice(0.54) = 6.70 m (matches vern_house_mid_a!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('U-plan brick courtyard house', 0, 0, 7.6, 6.70 + 3.4);

  /* Rear transverse hall (12.4 x 4.4 m) + flanking side wings (3.4 x 7.4 m) enclosing a 5.6 x 6.8 m open court */
  dlnPlinth(0, 0, -3.9, 12.4, 4.4, Y0, 0);
  dlnBrickWing(0, Y0, -3.9, 12.4, H1 + H2, 4.4, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -3.9, 12.4, 4.4, 0);
  dlnMonitorRoof(0, 6.70, -3.9, 12.4, 4.4, 2.15, 0, { over: 0.74, monW: 6.4, monD: 1.6, monH: 0.66 });

  for (const s of [-1, 1]) {
    const wx = s * 4.5;
    dlnPlinth(wx, 0, 1.8, 3.4, 7.0, Y0, 0);
    dlnBrickWing(wx, Y0, 1.8, 3.4, H1 + H2, 7.0, 0, { c: brkC, beltY: H1, orangeBelt: true });
    dlnCornice(wx, Y0 + H1 + H2, 1.8, 3.4, 7.0, 0);
    dlnMonitorRoof(wx, 6.70, 1.8, 3.4, 7.0, 1.65, Math.PI * 0.5, { monitor: false, over: 0.62 });
  }

  /* Street-front zaguan gateway screen wall + perforated jali upper breeze gallery */
  vB('dlLateriteB', 0, 0, 5.1, 5.6, Y0, 0.56, 0, vC(dlnPick(DL_PAL.laterite)));
  vB('dlBrickBandB', 0, Y0, 5.1, 5.6, 3.35, 0.46, 0, brkC);
  dlnJali(-1.75, Y0 + 1.45, 5.34, 0, 1.35, 1.25, { openBack: true, c: brkC });
  dlnJali(1.75, Y0 + 1.45, 5.34, 0, 1.35, 1.25, { openBack: true, c: brkC });
  vB('dlMortarB', 0, Y0 + 3.35, 5.1, 5.8, 0.22, 0.62, 0, morC);
  vB('vWood', 0, Y0 + 3.57, 5.1, 5.9, 0.14, 0.68, 0, dlnOrangeTint());
  dlnSunOrb(0, Y0 + 2.95, 5.34, 0, 0.34);
  vnDoor(0, Y0, 5.34, 0, 1.35, 2.35, 'vWood', lvC, dlnTrimTint());

  /* Central brick courtyard with sunken evaporative impluvium pool & taut shade-sail */
  dlnCourtyard(0, Y0 - 0.32, 1.2, 5.4, 5.8, 0, {
    pool: true, poolW: 2.8, poolD: 3.0, sail: true, sailY: Y0 + H1 + 1.85
  });
  /* Shaded courtyard brick arcade & upper jali gallery along rear hall */
  dlnArcade(0, Y0, -1.55, 0, 5.4, H1 - 0.1, 3, { c: brkC, band: true });
  dlnArcade(0, Y0 + H1 + 0.18, -1.55, 0, 5.4, H2 - 0.25, 3, { c: brkC, rail: true, jaliRail: true });

  /* Exterior street & flank louver windows + jali stairwell vents */
  for (const s of [-1, 1]) {
    dlnOpenWin(s * 4.5, Y0 + 0.95, 5.30, 0, 1.25, 1.30, { canvasHood: true, hoodOut: 0.72 });
    dlnOpenWin(s * 4.5, Y0 + H1 + 0.65, 5.30, 0, 1.25, 1.25, { hoodOut: 0.68 });
    dlnOpenWin(s * 6.2, Y0 + 0.95, 1.8, s * Math.PI * 0.5, 1.30, 1.25, { hoodOut: 0.62 });
    dlnJali(s * 6.2, Y0 + H1 + 0.55, -0.4, s * Math.PI * 0.5, 1.8, 1.35, { c: brkC });
    dlnOpenWin(s * 6.2, Y0 + H1 + 0.65, 3.1, s * Math.PI * 0.5, 1.20, 1.20, { hoodOut: 0.60 });
  }
  for (const lx of [-3.6, 0, 3.6]) {
    dlnOpenWin(lx, Y0 + H1 + 0.65, -6.1, Math.PI, 1.25, 1.20, { hoodOut: 0.58 });
  }
}

/* 4. Middle — 2-storey tropical colonial townhouse with ground brick loggia & sleeping veranda (13 x 15 m, cornice 6.65 m) */
function buildDilHouseMidVeranda(G, o) { reseed(9825 + (o.v | 0));
  const Y0 = 0.50;
  const H1 = 3.15;
  const H2 = 2.46;   /* 0.50 + 3.15 + 2.46 + 0.54 = 6.65 m (matches vern_house_mid_b!) */
  const brkC = dlnBrickTint((o.v & 1) === 1);
  const lvC = dlnLouverTint();
  const morC = dlnMortarTint();
  vnReg('Veranda brick townhouse', 0, 0, 7.6, 6.65 + 3.6);

  /* Core masonry block (10.6 x 9.6 m) set behind a 2.8 m deep 2-storey front loggia + sleeping veranda */
  dlnPlinth(0, 0, -0.2, 10.8, 12.4, Y0, 0);
  dlnBrickWing(0, Y0, -1.5, 10.6, H1 + H2, 9.6, 0, { c: brkC, beltY: H1, orangeBelt: true });

  /* Ground-floor 3-bay red-brick arched shade loggia along the +z front */
  dlnArcade(0, Y0, 4.65, 0, 10.4, H1 - 0.08, 3, { c: brkC, band: true, depth: 0.48 });
  for (const s of [-1, 1]) {
    dlnArcade(s * 5.2, Y0, 3.95, s * Math.PI * 0.5, 2.7, H1 - 0.08, 1, { c: brkC, depth: 0.44 });
  }

  /* Upper-storey timber-louvered sleeping veranda deck + slatted jalousie sun-blinds */
  vB('dlMortarB', 0, Y0 + H1, 3.95, 10.8, 0.22, 2.85, 0, morC);
  const nCols = 4;
  for (let i = 0; i <= nCols; i++) {
    const lx = -5.1 + (10.2 * i) / nCols;
    vPst('vPost', lx, Y0 + H1 + 0.22, 5.22, 0.11, H2 - 0.22, lvC);
    if (i < nCols) {
      const cx = -5.1 + (10.2 * (i + 0.5)) / nCols;
      const bw = 10.2 / nCols - 0.24;
      /* Slatted balustrade + half-lowered roll-down woven sun-screen */
      dlnJali(cx, Y0 + H1 + 0.26, 5.22, 0, bw, 0.84, { openBack: true, c: brkC });
      kput('vClothB', [cx, Y0 + H1 + H2 - 0.44, 5.24], vQ(0, 0.08, 0), [bw, 0.72, 0.04],
        (i % 2 === 0) ? dlnOrangeTint() : vC(dlnPick(DL_PAL.linen)));
    }
  }
  for (const s of [-1, 1]) {
    vB('vWood', s * 5.22, Y0 + H1 + 0.98, 3.95, 0.10, 0.10, 2.6, 0, lvC);
  }

  /* Unified cornice + deep-eaved monsoon hip roof with full-width clerestory ridge monitor */
  dlnCornice(0, Y0 + H1 + H2, -0.2, 10.8, 12.2, 0);
  dlnMonitorRoof(0, 6.65, -0.2, 10.8, 12.2, 2.55, 0, {
    over: 0.82, monW: 6.2, monD: 2.2, monH: 0.74, monRise: 0.66
  });

  /* Recessed loggia front door, balcony french doors & side/rear propped louver windows */
  vnDoor(0, Y0, 3.30, 0, 1.25, 2.30, 'vWood', lvC, dlnTrimTint(), false);
  vnStairs(0, 0, 6.25, 0, 2.4, Y0, 3, 'vStone', morC);
  for (const s of [-1, 1]) {
    dlnOpenWin(s * 3.1, Y0 + 0.92, 3.30, 0, 1.25, 1.30, { hood: false });
    dlnOpenWin(s * 2.8, Y0 + H1 + 0.65, 3.30, 0, 1.30, 1.35, { hood: false });
    for (const lz of [-3.8, -0.2]) {
      dlnOpenWin(s * 5.30, Y0 + 0.95, lz, s * Math.PI * 0.5, 1.25, 1.25, { hoodOut: 0.65 });
      dlnOpenWin(s * 5.30, Y0 + H1 + 0.62, lz, s * Math.PI * 0.5, 1.25, 1.20, { hoodOut: 0.65 });
    }
  }
  dlnOpenWin(-2.6, Y0 + 0.95, -6.30, Math.PI, 1.25, 1.20, { hoodOut: 0.60 });
  dlnOpenWin(2.6, Y0 + H1 + 0.62, -6.30, Math.PI, 1.25, 1.20, { hoodOut: 0.60 });
  dlnZeerCluster(-4.1, Y0, 4.2, 2, 0);
  vnPlanter(4.0, 0, 6.1, 1.6, 0.8, 0, lvC);
}

/* 5. Middle Multi-Family — 3-storey brick apartment house around an open stack-effect wind-well (15 x 16 m) */
function buildDilTenementWindwell(G, o) { reseed(9833 + (o.v | 0));
  const Y0 = 0.52;
  const HS = 2.84;   /* 3 storeys: Y0(0.52) + 3*2.84(8.52) + cornice(0.54) = 9.58 m */
  const brkC = dlnBrickTint(false);
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Wind-well brick tenement', 0, 0, 8.6, 9.58 + 3.2);

  /* Four perimeter brick wings (depth 3.8 m) framing a 5.8 x 6.4 m open central stack-effect wind-well */
  dlnPlinth(0, 0, 0, 13.4, 14.0, Y0, 0);
  /* North (-z) & South (+z, split around central breezeway arch) + East/West wings */
  dlnBrickWing(0, Y0, -5.1, 13.4, HS * 3, 3.8, 0, { c: brkC, beltY: HS, orangeBelt: true });
  vB('dlMortarB', 0, Y0 + HS * 2, -5.1, 13.56, 0.20, 3.96, 0, morC);

  for (const s of [-1, 1]) {
    /* Front wings leaving a 2.6 m ground breezeway into the wind-well, bridged by upper 2 storeys */
    dlnBrickWing(s * 4.05, Y0, 5.1, 5.3, HS * 3, 3.8, 0, { item: 'dlBrickBandB', c: bandC, beltY: HS, orangeBelt: true });
    vB('dlMortarB', s * 4.05, Y0 + HS * 2, 5.1, 5.46, 0.20, 3.96, 0, morC);
    /* Flank wings connecting front and rear */
    dlnBrickWing(s * 4.9, Y0, 0, 3.6, HS * 3, 6.4, 0, { c: brkC, beltY: HS, quoins: false });
    vB('dlMortarB', s * 4.9, Y0 + HS * 2, 0, 3.76, 0.20, 6.56, 0, morC);
  }
  /* Bridge stories 2 & 3 over the front wind-tunnel arch */
  vB('dlBrickBandB', 0, Y0 + HS, 5.1, 2.8, HS * 2, 3.8, 0, bandC);
  kput('dlArchSpandrel', [0, Y0 + HS * 0.58, 6.8], null, [2.6, HS * 0.84, 0.56], bandC);
  dlnSunOrb(0, Y0 + HS + 0.52, 7.02, 0, 0.36);

  /* Central wind-well court with rain-catchment cistern & shaded interior cantilevered galleries */
  dlnCourtyard(0, Y0 - 0.04, 0, 5.6, 6.2, 0, { pool: true, poolW: 2.6, poolD: 2.8, sail: true, sailY: Y0 + HS * 3 + 0.4 });
  for (let fl = 1; fl <= 2; fl++) {
    const gy = Y0 + fl * HS;
    for (const sz of [-1, 1]) {
      vB('vWood', 0, gy - 0.12, sz * 2.55, 6.0, 0.14, 1.05, 0, lvC);
      vB('vWood', 0, gy + 0.82, sz * 2.08, 5.8, 0.08, 0.08, 0, lvC);
    }
  }

  /* 4-wing ring cornices + terracotta hipped roofs leaving the central wind-well open to the sky! */
  dlnCornice(0, Y0 + HS * 3, -5.1, 13.4, 3.8, 0);
  dlnMonitorRoof(0, 9.58, -5.1, 13.4, 3.8, 1.75, 0, { over: 0.68, monW: 6.6, monD: 1.4, monH: 0.58 });
  dlnCornice(0, Y0 + HS * 3, 5.1, 13.4, 3.8, 0);
  dlnMonitorRoof(0, 9.58, 5.1, 13.4, 3.8, 1.75, 0, { over: 0.68, monW: 6.6, monD: 1.4, monH: 0.58 });
  for (const s of [-1, 1]) {
    dlnCornice(s * 4.9, Y0 + HS * 3, 0, 3.6, 6.4, 0);
    dlnMonitorRoof(s * 4.9, 9.58, 0, 3.6, 6.4, 1.55, Math.PI * 0.5, { monitor: false, over: 0.55 });
  }

  /* Entry doors inside the breezeway + street doors + louvered windows + jali stairwell towers */
  vnDoor(-1.35, Y0, 1.8, Math.PI * 0.5, 1.05, 2.15, 'vWood', lvC, dlnTrimTint(), false);
  vnDoor(1.35, Y0, 1.8, -Math.PI * 0.5, 1.05, 2.15, 'vWood', lvC, dlnTrimTint(), false);
  vnStairs(0, 0, 7.25, 0, 2.4, Y0, 3, 'vStone', morC);

  for (let fl = 0; fl < 3; fl++) {
    const wy = Y0 + fl * HS + 0.78;
    for (const s of [-1, 1]) {
      dlnOpenWin(s * 4.1, wy, 7.0, 0, 1.25, 1.25, { canvasHood: fl === 0, hoodOut: 0.68 });
      dlnOpenWin(s * 6.7, wy, -3.2, s * Math.PI * 0.5, 1.20, 1.20, { hoodOut: 0.60 });
      dlnOpenWin(s * 6.7, wy, 3.2, s * Math.PI * 0.5, 1.20, 1.20, { hoodOut: 0.60 });
      /* Full-height perforated brick jali stairwell screens on both flanks */
      dlnJali(s * 6.7, wy - 0.15, 0, s * Math.PI * 0.5, 1.85, 1.65, { c: bandC });
    }
    if (fl >= 1) {
      dlnOpenWin(0, wy, 7.0, 0, 1.15, 1.20, { hoodOut: 0.62 });
    }
    for (const lx of [-4.2, 0, 4.2]) {
      dlnOpenWin(lx, wy, -7.0, Math.PI, 1.20, 1.20, { hoodOut: 0.55 });
    }
  }
}

/* 6. Rich — Grand 2-storey orange-brick peristyle impluvium villa (24 x 26 m, cornice 8.60 m, lit: true) */
function buildDilVillaImpluvium(G, o) { reseed(9841 + (o.v | 0));
  const Y0 = 0.65;
  const H1 = 4.05;
  const H2 = 3.36;   /* 0.65 + 4.05 + 3.36 + 0.54 = 8.60 m (exact match to vern_house_rich_a 8.60 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Peristyle impluvium villa', 0, 0, 13.8, 8.60 + 5.8);

  /* Four 2-storey brick wings framing a spacious 11.2 x 12.6 m central peristyle water-court */
  dlnPlinth(0, 0, 0, 22.0, 23.6, Y0, 0);
  /* Rear principal oecus/audience wing (22.0 x 5.4 m) + front portal wing (22.0 x 5.0 m) */
  dlnBrickWing(0, Y0, -9.1, 22.0, H1 + H2, 5.4, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -9.1, 22.0, 5.4, 0);
  dlnMonitorRoof(0, 8.60, -9.1, 22.0, 5.4, 2.85, 0, {
    copper: true, over: 0.92, monW: 11.5, monD: 2.0, monH: 0.88, monRise: 0.78
  });

  dlnBrickWing(0, Y0, 9.3, 22.0, H1 + H2, 5.0, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, 9.3, 22.0, 5.0, 0);
  dlnMonitorRoof(0, 8.60, 9.3, 22.0, 5.0, 2.65, 0, {
    copper: true, over: 0.92, monW: 10.5, monD: 1.8, monH: 0.82, monRise: 0.72
  });

  /* East & West flank wings (4.8 x 13.2 m) */
  for (const s of [-1, 1]) {
    dlnBrickWing(s * 8.6, Y0, 0.2, 4.8, H1 + H2, 13.2, 0, { c: brkC, beltY: H1, orangeBelt: true });
    dlnCornice(s * 8.6, Y0 + H1 + H2, 0.2, 4.8, 13.2, 0);
    dlnMonitorRoof(s * 8.6, 8.60, 0.2, 4.8, 13.2, 2.25, Math.PI * 0.5, {
      copper: true, over: 0.82, monW: 6.4, monD: 1.6, monH: 0.68
    });
  }

  /* 4-sided interior brick-arched peristyle arcade + upper perforated jali gallery around sunken turquoise pool */
  dlnCourtyard(0, Y0 - 0.02, 0.2, 11.8, 12.8, 0, {
    pool: true, poolW: 6.2, poolD: 7.0, sail: false
  });
  /* Twin taut Iziz-orange & cream silk shade-sails rigged diagonally above the peristyle pool */
  dlnShadeSail(-2.2, Y0 + H1 + H2 - 0.4, -1.6, 6.2, 4.8, 0.08, { orange: true, tiltX: 0.11 });
  dlnShadeSail(2.2, Y0 + H1 + H2 - 0.1, 2.1, 6.2, 4.8, -0.08, { orange: false, tiltX: -0.09 });

  for (const sz of [-1, 1]) {
    dlnArcade(0, Y0, 0.2 + sz * 5.8, sz < 0 ? 0 : Math.PI, 11.2, H1 - 0.12, 4, { c: brkC, band: true });
    dlnArcade(0, Y0 + H1 + 0.18, 0.2 + sz * 5.8, sz < 0 ? 0 : Math.PI, 11.2, H2 - 0.28, 4, { c: brkC, rail: true, jaliRail: true });
  }
  for (const sx of [-1, 1]) {
    dlnArcade(sx * 5.6, Y0, 0.2, -sx * Math.PI * 0.5, 11.2, H1 - 0.12, 4, { c: brkC });
    dlnArcade(sx * 5.6, Y0 + H1 + 0.18, 0.2, -sx * Math.PI * 0.5, 11.2, H2 - 0.28, 4, { c: brkC, rail: true, jaliRail: true });
  }

  /* Monumental street portico: 3-arch projecting loggia + Sun-Orb pediment + electric lamps */
  dlnArcade(0, Y0, 12.15, 0, 7.6, H1 - 0.05, 3, { c: brkC, band: true, depth: 0.55 });
  vB('dlMortarB', 0, Y0 + H1, 12.0, 8.2, 0.26, 0.95, 0, morC);
  dlnSunOrb(0, Y0 + H1 + H2 - 0.65, 11.82, 0, 0.52);
  vnDoor(0, Y0, 11.80, 0, 1.65, 2.75, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, 0, 12.55, 0, 3.8, Y0, 4, 'vStone', morC);

  /* Rich exterior fenestration: lit louver windows + perforated jali screens */
  for (const lx of [-7.8, -4.6, 4.6, 7.8]) {
    dlnOpenWin(lx, Y0 + 1.15, 11.80, 0, 1.35, 1.65, { kind: 'lit', hoodOut: 0.78 });
    dlnOpenWin(lx, Y0 + H1 + 0.78, 11.80, 0, 1.35, 1.55, { kind: 'lit', hoodOut: 0.74 });
  }
  dlnJali(-2.1, Y0 + H1 + 0.70, 11.80, 0, 1.85, 1.65, { c: brkC });
  dlnJali(2.1, Y0 + H1 + 0.70, 11.80, 0, 1.85, 1.65, { c: brkC });
  for (const s of [-1, 1]) {
    for (const lz of [-6.8, -2.2, 2.6, 7.2]) {
      dlnOpenWin(s * 11.0, Y0 + 1.15, lz, s * Math.PI * 0.5, 1.35, 1.55, { kind: 'lit', hoodOut: 0.72 });
      dlnOpenWin(s * 11.0, Y0 + H1 + 0.78, lz, s * Math.PI * 0.5, 1.30, 1.45, { kind: 'lit', hoodOut: 0.68 });
    }
  }
  for (const lx of [-7.2, -2.6, 2.6, 7.2]) {
    dlnOpenWin(lx, Y0 + 1.15, -11.80, Math.PI, 1.35, 1.55, { kind: 'lit', hoodOut: 0.68 });
    dlnOpenWin(lx, Y0 + H1 + 0.78, -11.80, Math.PI, 1.35, 1.45, { kind: 'lit', hoodOut: 0.65 });
  }
  for (const s of [-1, 1]) {
    vnBannerPole(s * 4.2, Y0, 12.25, 0, 6.2, dlnOrangeTint());
    vnPlanter(s * 6.4, 0, 12.35, 2.0, 0.85, 0, lvC);
  }
}

/* 7. Rich — Twin-courtyard colonial factor manor with vaulted wind-passage, mirador loggia & malqaf (26 x 24 m, cornice 8.30 m) */
function buildDilManorBreezeway(G, o) { reseed(9849 + (o.v | 0));
  const Y0 = 0.65;
  const H1 = 3.95;
  const H2 = 3.16;   /* 0.65 + 3.95 + 3.16 + 0.54 = 8.30 m (within 0.30 m of vern_house_rich_b 8.00 m!) */
  const brkC = dlnBrickTint(false);
  const warmC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Breezeway colonial manor', 0, 0, 14.2, 8.30 + 7.2);

  /* Central vaulted cross-axis spine (7.6 x 20.6 m) flanked by East & West shaded garden courts & outer pavilions */
  dlnPlinth(0, 0, 0, 24.0, 21.6, Y0, 0);
  dlnBrickWing(0, Y0, 0, 7.8, H1 + H2, 20.8, 0, { item: 'dlBrickBandB', c: warmC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, 0, 7.8, 20.8, 0);
  dlnMonitorRoof(0, 8.30, 0, 7.8, 20.8, 2.75, Math.PI * 0.5, {
    copper: true, over: 0.90, monW: 11.2, monD: 2.2, monH: 0.82
  });

  /* Rooftop brick malqaf wind-catcher tower over the central hall intersection */
  dlnWindCatcher(0, 8.30 + 1.85, -1.2, 3.4, 3.4, 4.35, 0, { copper: true, c: warmC });

  /* Flanking twin pavilions (-x and +x) & enclosed East/West water-courts */
  for (const s of [-1, 1]) {
    const px = s * 9.5;
    dlnBrickWing(px, Y0, -4.8, 5.0, H1 + H2 - 0.35, 11.2, 0, { c: brkC, beltY: H1, orangeBelt: true });
    dlnCornice(px, Y0 + H1 + H2 - 0.35, -4.8, 5.0, 11.2, 0);
    dlnMonitorRoof(px, 7.95, -4.8, 5.0, 11.2, 2.15, Math.PI * 0.5, { copper: true, over: 0.78, monitor: false });

    /* Front twin-court garden wall with perforated brick jali & bamboo shade pergola */
    vB('dlBrickB', px, Y0, 10.2, 5.0, 2.35, 0.42, 0, brkC);
    dlnJali(px, Y0 + 0.65, 10.42, 0, 3.6, 1.35, { openBack: true, c: brkC });
    vB('dlMortarB', px, Y0 + 2.35, 10.2, 5.2, 0.16, 0.54, 0, morC);
    vB('dlBrickB', s * 11.8, Y0, 5.4, 0.42, 2.35, 9.6, 0, brkC);
    dlnJali(s * 12.02, Y0 + 0.65, 5.4, s * Math.PI * 0.5, 6.8, 1.35, { openBack: true, c: brkC });
    vB('dlMortarB', s * 11.8, Y0 + 2.35, 5.4, 0.54, 0.16, 9.8, 0, morC);

    /* Side water-court with impluvium & pergola */
    dlnCourtyard(s * 7.8, Y0 - 0.02, 5.2, 6.8, 8.8, 0, { pool: true, poolW: 3.0, poolD: 4.2 });
    dlnPergola(s * 7.8, Y0 + 0.04, 5.2, 5.4, 6.8, 2.95, 0, { brickPiers: true });
  }

  /* Projecting cantilevered upper mirador sleeping loggia on the central front facade */
  dlnArcade(0, Y0, 10.75, 0, 7.4, H1 - 0.08, 3, { c: warmC, band: true, depth: 0.52 });
  vB('vWood', 0, Y0 + H1 - 0.08, 10.95, 7.8, 0.24, 1.55, 0, lvC);
  for (let i = -2; i <= 2; i++) {
    vPst('vPost', i * 1.82, Y0 + H1 + 0.16, 11.62, 0.09, H2 - 0.20, lvC);
  }
  dlnJali(0, Y0 + H1 + 0.22, 11.62, 0, 7.2, 0.92, { openBack: true, c: warmC });
  vnShedRoof(0, Y0 + H1 + H2 - 0.12, 10.95, 8.0, 1.75, 0.52, 0, 'vCopperB', null, 0.35, 0.14);
  dlnSunOrb(0, Y0 + H1 + H2 + 0.45, 10.50, 0, 0.44);

  /* Vaulted central wind-passage door + lit louver windows */
  vnDoor(0, Y0, 10.40, 0, 1.60, 2.70, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, 0, 11.45, 0, 3.6, Y0, 4, 'vStone', morC);
  vnDoor(0, Y0, -10.40, Math.PI, 1.45, 2.50, 'vStone', morC, dlnTrimTint(), false);

  for (const s of [-1, 1]) {
    dlnOpenWin(s * 2.3, Y0 + 1.10, 10.40, 0, 1.25, 1.55, { kind: 'lit', hood: false });
    dlnOpenWin(s * 2.3, Y0 + H1 + 0.72, 10.40, 0, 1.30, 1.45, { kind: 'lit', hood: false });
    for (const lz of [-8.0, -4.6, -1.2]) {
      dlnOpenWin(s * 12.0, Y0 + 1.10, lz, s * Math.PI * 0.5, 1.30, 1.50, { kind: 'lit', hoodOut: 0.70 });
      dlnOpenWin(s * 12.0, Y0 + H1 + 0.65, lz, s * Math.PI * 0.5, 1.25, 1.35, { kind: 'lit', hoodOut: 0.65 });
    }
    dlnOpenWin(s * 9.5, Y0 + 1.10, -10.40, Math.PI, 1.35, 1.50, { kind: 'lit', hoodOut: 0.68 });
    dlnOpenWin(s * 9.5, Y0 + H1 + 0.65, -10.40, Math.PI, 1.35, 1.40, { kind: 'lit', hoodOut: 0.65 });
    vnBannerPole(s * 3.8, Y0, 11.2, 0, 6.0, dlnOrangeTint());
  }
}

VERN.def({
  key: 'dil_house_poor_dogtrot',
  name: 'Dogtrot Brick Cottage',
  family: 'dwellings',
  w: 9, d: 10, h: 6.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'poor', type: ['dwelling-single'] },
  build: buildDilHousePoorDogtrot
});
VERN.def({
  key: 'dil_house_poor_yard',
  name: 'Pergola-Yard Brick Cottage',
  family: 'dwellings',
  w: 10, d: 10, h: 6.5,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'poor', type: ['dwelling-single'] },
  build: buildDilHousePoorYard
});
VERN.def({
  key: 'dil_house_mid_courtyard',
  name: 'U-Plan Courtyard Brick House',
  family: 'dwellings',
  w: 14, d: 14, h: 10.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['dwelling-single'] },
  build: buildDilHouseMidCourtyard
});
VERN.def({
  key: 'dil_house_mid_veranda',
  name: 'Sleeping-Veranda Brick Townhouse',
  family: 'dwellings',
  w: 13, d: 15, h: 10.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['dwelling-single'] },
  build: buildDilHouseMidVeranda
});
VERN.def({
  key: 'dil_tenement_windwell',
  name: 'Wind-Well Brick Tenement',
  family: 'dwellings',
  w: 15, d: 16, h: 13.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['dwelling-multi'] },
  build: buildDilTenementWindwell
});
VERN.def({
  key: 'dil_villa_impluvium',
  name: 'Peristyle Impluvium Villa',
  family: 'dwellings',
  w: 24, d: 26, h: 15.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'rich', lit: true, type: ['dwelling-single'] },
  build: buildDilVillaImpluvium
});
VERN.def({
  key: 'dil_manor_breezeway',
  name: 'Breezeway Malqaf Manor',
  family: 'dwellings',
  w: 26, d: 24, h: 16.2,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'rich', lit: true, type: ['dwelling-single'] },
  build: buildDilManorBreezeway
});
