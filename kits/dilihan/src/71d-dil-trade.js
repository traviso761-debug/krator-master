// ================================================================= 71d. DILIHAN VASSAL KIT — Markets, Hospitality & Monsoon Workshops
// [draw] Twelve ventilated red/terracotta-orange brick trade & craft buildings on the Iziz Vernacular contract (seeds 9857..9945):
//   8.  dil_shop_arcade         (12 x 14 m, middle)  Street-arcade shophouse with striped Iziz-orange awnings & rear breeze court
//   9.  dil_bazaar_pavilion     (22 x 18 m, middle)  Open-sided brick-pier market hall under double-tier ventilation monitor roof
//   10. dil_tavern_pergola      (15 x 15 m, middle)  Courtyard chay & palm-wine house with shade pergola & cooling fountain jar
//   11. dil_inn_courtyard       (22 x 22 m, middle)  2-storey arcaded brick caravanserai-inn around a watered mule courtyard
//   12. dil_godown_ventilated   (18 x 16 m, middle)  Raised damp-proof pier spice/potash godown with upper jali vent frieze
//   13. dil_bakery_breezeway    (13 x 13 m, middle)  Split-plan breezeway bakehouse isolating the hot brick oven across a court
//   14. dil_smithy_monitor      (14 x 14 m, middle)  Open-arch brick forge with tall jack-roof smoke/heat monitor & quench court
//   15. dil_brick_pottery       (15 x 14 m, middle)  Terracotta zeer evaporative water-jar workshop with shade-racks & beehive kiln
//   16. dil_weaver_dyecourt     (15 x 15 m, middle)  2-storey louvered loom loft with shaded indigo/orange dye-vat colonnade
//   17. dil_press_mill          (14 x 15 m, middle)  Ventilated brick-grill sugar & whorl-olive press house with shaded veranda
//   18. dil_butcher_icehouse    (12 x 13 m, middle)  Thick-walled thermal-mass meat & salted-fish hall with jali cross-draft vents
//   19. dil_carpenter_yard      (15 x 14 m, middle)  Open-bay brick-pier louver-shutter & timber joinery shed with shaded saw court

/* 8. Street-arcade shophouse (12 x 14 m, cornice 6.60 m — matches vern_shops 6.60 m) */
function buildDilShopArcade(G, o) { reseed(9857 + (o.v | 0));
  const Y0 = 0.48;
  const H1 = 3.22;
  const H2 = 2.36;   /* 0.48 + 3.22 + 2.36 + 0.54 = 6.60 m */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Arcaded brick shophouse', 0, 0, 7.2, 6.60 + 3.4);

  /* Front 2-storey shophouse over a 2.2 m deep street-front brick shade arcade + small rear breeze-court */
  dlnPlinth(0, 0, 0.5, 10.6, 11.4, Y0, 0);
  dlnBrickWing(0, Y0, -0.6, 10.4, H1, 9.2, 0, { c: brkC });
  /* Upper floor projects forward over the continuous street-front 3-arch five-foot-way arcade */
  dlnArcade(0, Y0, 5.1, 0, 10.2, H1 - 0.06, 3, { c: brkC, band: true, depth: 0.48 });
  dlnBrickWing(0, Y0 + H1, 0.5, 10.6, H2, 11.4, 0, { item: 'dlBrickBandB', c: brkC });
  dlnCornice(0, Y0 + H1 + H2, 0.5, 10.6, 11.4, 0);
  dlnMonitorRoof(0, 6.60, 0.5, 10.6, 11.4, 2.35, 0, { over: 0.65, monW: 5.8, monD: 2.0, monH: 0.68 });

  /* Striped Iziz-orange canvas awnings projecting from the arcade arches + open folding shop counters */
  for (const lx of [-3.3, 0, 3.3]) {
    dlnSunHood(lx, Y0 + H1 - 0.18, 5.38, 0, 2.8, 0.95, { canvas: true, stripeRed: lx === 0 });
  }
  vnDoor(0, Y0, 4.0, 0, 1.35, 2.35, 'vWood', lvC, dlnTrimTint(), false);
  vnStairs(0, 0, 6.45, 0, 2.8, Y0, 3, 'vStone', morC);
  for (const s of [-1, 1]) {
    /* Wide open shopfront counter windows + goods crates & amphorae */
    vnWin(s * 3.1, Y0 + 0.85, 4.0, 0, 2.1, 1.45, 'open', 'vWood', lvC, true);
    vB('vWood', s * 3.1, Y0 + 0.02, 4.35, 2.2, 0.82, 0.55, 0, lvC);
    vnCrate(s * 3.8, Y0, 4.85, 0.68, 0.2, lvC);
    dlnOpenWin(s * 3.2, Y0 + H1 + 0.55, 6.20, 0, 1.35, 1.25, { hoodOut: 0.58 });
    dlnOpenWin(s * 5.3, Y0 + H1 + 0.55, 0.5, s * Math.PI * 0.5, 1.30, 1.20, { hoodOut: 0.55 });
  }
  dlnJali(0, Y0 + H1 + 0.50, 6.20, 0, 1.95, 1.35, { c: brkC });

  /* Rear ventilated utility yard (-z) with jali wall & zeer cooling jars */
  vB('dlBrickB', 0, 0, -6.4, 10.4, 1.85, 0.32, 0, brkC);
  dlnJali(-2.6, 0.52, -6.56, Math.PI, 2.8, 1.05, { openBack: true, c: brkC });
  dlnJali(2.6, 0.52, -6.56, Math.PI, 2.8, 1.05, { openBack: true, c: brkC });
  vnSacks(-2.4, 0, -5.6, 3);
  dlnZeerCluster(2.5, 0, -5.6, 2, Math.PI);
}

/* 9. Open-sided brick-pier bazaar pavilion under double-tier monitor roof (22 x 18 m, cornice 5.60 m) */
function buildDilBazaarPavilion(G, o) { reseed(9865 + (o.v | 0));
  const Y0 = 0.56;
  const H1 = 4.50;   /* 0.56 + 4.50 + 0.54 = 5.60 m (matches vern_market 5.50 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Open-arch bazaar pavilion', 0, 0, 11.4, 5.60 + 5.6);

  dlnPlinth(0, 0, 0, 19.6, 15.6, Y0, 0);
  vB('dlBrickOchreB', 0, Y0 - 0.02, 0, 19.2, 0.06, 15.2, 0, vC(dlnPick(DL_PAL.brickOchre)));

  /* Open 4-sided red-and-ochre brick arcades so breezes blow straight through every market aisle */
  for (const sz of [-1, 1]) {
    dlnArcade(0, Y0, sz * 7.55, sz > 0 ? 0 : Math.PI, 19.0, H1, 5, { c: brkC, band: true, depth: 0.56 });
  }
  for (const sx of [-1, 1]) {
    dlnArcade(sx * 9.5, Y0, 0, sx * Math.PI * 0.5, 14.6, H1, 4, { c: brkC, band: true, depth: 0.56 });
  }
  /* Small central brick weigh-kiosk with locked tally-office door inside the hall (satisfies KDOOR invariant cleanly) */
  dlnBrickWing(0, Y0, -2.2, 4.6, 3.3, 3.8, 0, { c: brkC, quoins: false });
  vnDoor(0, Y0, -0.30, 0, 1.15, 2.15, 'vWood', lvC, dlnTrimTint(), false);
  dlnJali(-1.4, Y0 + 0.95, -0.30, 0, 0.9, 1.0, { c: brkC });
  dlnJali(1.4, Y0 + 0.95, -0.30, 0, 0.9, 1.0, { c: brkC });

  /* Double-tiered terracotta ventilation monitor roof (lower hipped skirt + airy louver clerestory + upper monitor cap) */
  dlnCornice(0, Y0 + H1, 0, 19.6, 15.6, 0);
  dlnRingBox('vWood', 0, 5.44, 0, 21.3, 0.16, 17.3, 0.24, 0, dlnOrangeTint());
  kput('dlSkirtTile', [0, 5.61, 0], null, [21.2, 2.34, 17.2], dlnTileTint());
  /* Clerestory louver drum between lower skirt and upper monitor roof */
  dlnRingBox('dlMortarB', 0, 5.61 + 2.24, 0, 10.2, 0.20, 8.8, 0.36, 0, morC);
  dlnJali(0, 5.60 + 2.45, 4.35, 0, 8.8, 0.95, { openBack: true, c: brkC });
  dlnJali(0, 5.60 + 2.45, -4.35, Math.PI, 8.8, 0.95, { openBack: true, c: brkC });
  dlnMonitorRoof(0, 5.60 + 3.45, 0, 10.2, 8.8, 1.85, 0, { over: 0.78, monitor: false });

  /* Perimeter striped Iziz-orange shade awnings + market stalls, spice sacks, baskets & zeer jars */
  for (const lx of [-6.8, 0, 6.8]) {
    dlnSunHood(lx, Y0 + 3.25, 7.82, 0, 3.6, 0.92, { canvas: true, stripeRed: lx !== 0 });
  }
  vnStairs(0, 0, 8.35, 0, 3.6, Y0, 3, 'vStone', morC);
  vnStairs(0, 0, -8.35, Math.PI, 3.2, Y0, 3, 'vStone', morC);

  for (const sx of [-1, 1]) {
    for (const lz of [-4.2, 2.8]) {
      const kx = sx * 5.8;
      vB('vWood', kx, Y0, lz, 2.8, 0.86, 1.35, 0, lvC);
      kput('vClothB', [kx, Y0 + 2.25, lz], vQ(0, sx * 0.10, 0), [3.0, 0.05, 1.75],
        (lz > 0) ? dlnOrangeTint() : vC(dlnPick(DL_PAL.linen)));
      for (const p of [-1.25, 1.25]) vPst('vPost', kx + p, Y0, lz - 0.55, 0.05, 2.25, lvC);
      vnSacks(kx + sx * 0.8, Y0, lz + 1.0, 3);
    }
  }
  dlnZeerCluster(-3.4, Y0, 4.6, 3, 0);
  vnFolk(0, 3.5, 4, 3.2);
}

/* 10. Courtyard chay & palm-wine tavern with shade pergola & cooling fountain (15 x 15 m, cornice 6.85 m) */
function buildDilTavernPergola(G, o) { reseed(9873 + (o.v | 0));
  const Y0 = 0.48;
  const H1 = 3.25;
  const H2 = 2.58;   /* 0.48 + 3.25 + 2.58 + 0.54 = 6.85 m (matches vern_tavern 6.95 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Pergola courtyard tavern', 0, 0, 8.2, 6.85 + 3.4);

  /* L-shaped 2-storey red-brick tavern hall framing a front-right shaded drinking pergola court */
  dlnPlinth(0, 0, -3.6, 13.4, 5.2, Y0, 0);
  dlnBrickWing(0, Y0, -3.6, 13.4, H1 + H2, 5.2, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -3.6, 13.4, 5.2, 0);
  dlnMonitorRoof(0, 6.85, -3.6, 13.4, 5.2, 2.25, 0, { over: 0.72, monW: 6.8, monD: 1.8, monH: 0.68 });

  dlnPlinth(-4.2, 0, 2.4, 5.0, 6.8, Y0, 0);
  dlnBrickWing(-4.2, Y0, 2.4, 5.0, H1 + H2 - 0.45, 6.8, 0, { c: brkC, beltY: H1 });
  dlnCornice(-4.2, Y0 + H1 + H2 - 0.45, 2.4, 5.0, 6.8, 0);
  dlnMonitorRoof(-4.2, 6.40, 2.4, 5.0, 6.8, 1.85, Math.PI * 0.5, { monitor: false, over: 0.62 });

  /* Open-arch bar front facing the pergola court + upper louvered balcony */
  dlnArcade(2.2, Y0, -0.85, 0, 8.0, H1 - 0.10, 3, { c: brkC, band: true });
  vnDoor(0.6, Y0, -1.0, 0, 1.25, 2.25, 'vWood', lvC, dlnTrimTint(), false);
  vnDoor(-4.2, Y0, 5.80, 0, 1.20, 2.25, 'vWood', lvC, dlnTrimTint());

  /* Front-right pergola drinking court (+x/+z) with evaporative fountain jar, tables, barrels & low jali curb */
  dlnCourtyard(2.4, 0.04, 2.6, 8.2, 6.6, 0, { pool: true, poolW: 2.4, poolD: 2.4 });
  dlnPergola(2.4, 0.10, 2.6, 7.2, 5.6, 2.95, 0, { brickPiers: true });
  vB('dlBrickB', 5.2, 0, 5.9, 2.8, 1.25, 0.30, 0, brkC);
  dlnJali(5.2, 0.35, 6.06, 0, 2.2, 0.75, { openBack: true, c: brkC });
  vB('dlBrickB', 6.55, 0, 2.6, 0.30, 1.55, 6.6, 0, brkC);
  dlnJali(6.71, 0.42, 2.6, Math.PI * 0.5, 4.8, 0.92, { openBack: true, c: brkC });

  /* Wine barrels, outdoor benches & louvered windows */
  vnBarrel(-1.1, 0.10, 1.8, 0.42, 1.0, lvC);
  vnBarrel(-1.1, 0.10, 3.0, 0.42, 1.0, lvC);
  for (const lz of [1.2, 4.2]) {
    vB('vWood', 4.6, 0.10, lz, 1.6, 0.74, 0.9, 0, lvC);
  }
  dlnOpenWin(-4.2, Y0 + H1 + 0.55, 5.80, 0, 1.35, 1.25, { canvasHood: true });
  for (const lx of [-3.6, 0.8, 4.4]) {
    dlnOpenWin(lx, Y0 + H1 + 0.58, -1.0, 0, 1.30, 1.25, { hoodOut: 0.62 });
    dlnOpenWin(lx, Y0 + H1 + 0.58, -6.20, Math.PI, 1.25, 1.20, { hoodOut: 0.55 });
  }
  vnBannerPole(-1.5, 0, 6.1, 0, 5.4, dlnOrangeTint());
  vnChimney(-5.2, 6.40 + 0.8, -4.6, 2.1, 0.18, false);
}

/* 11. 2-storey arcaded brick caravanserai-inn around watered courtyard (22 x 22 m, cornice 6.90 m) */
function buildDilInnCourtyard(G, o) { reseed(9881 + (o.v | 0));
  const Y0 = 0.52;
  const H1 = 3.28;
  const H2 = 2.56;   /* 0.52 + 3.28 + 2.56 + 0.54 = 6.90 m (matches vern_caravanserai 6.80 m!) */
  const brkC = dlnBrickTint(false);
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Arcaded brick courtyard inn', 0, 0, 11.8, 6.90 + 3.8);

  dlnPlinth(0, 0, 0, 20.2, 20.2, Y0, 0);
  /* 4 perimeter wings (depth 4.2 m) around an 11.8 x 11.8 m watered pack-court, with arched carriage portal on +z */
  dlnBrickWing(0, Y0, -7.9, 20.0, H1 + H2, 4.2, 0, { c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -7.9, 20.0, 4.2, 0);
  dlnMonitorRoof(0, 6.90, -7.9, 20.0, 4.2, 2.10, 0, { over: 0.72, monW: 9.6, monD: 1.6, monH: 0.66 });

  for (const s of [-1, 1]) {
    dlnBrickWing(s * 6.6, Y0, 7.9, 6.8, H1 + H2, 4.2, 0, { item: 'dlBrickBandB', c: bandC, beltY: H1, orangeBelt: true });
    dlnBrickWing(s * 7.9, Y0, 0, 4.2, H1 + H2, 11.6, 0, { c: brkC, beltY: H1 });
    dlnCornice(s * 7.9, Y0 + H1 + H2, 0, 4.2, 11.6, 0);
    dlnMonitorRoof(s * 7.9, 6.90, 0, 4.2, 11.6, 1.85, Math.PI * 0.5, { monitor: false, over: 0.65 });
  }
  /* Upper gatehouse chamber bridging the 3.6 m wide arched caravan entrance */
  vB('dlBrickBandB', 0, Y0 + H1, 7.9, 3.8, H2, 4.2, 0, bandC);
  kput('dlArchSpandrel', [0, Y0 + H1 * 0.60, 9.75], null, [3.6, H1 * 0.80, 0.62], bandC);
  dlnSunOrb(0, Y0 + H1 + H2 - 0.55, 10.02, 0, 0.42);
  dlnCornice(0, Y0 + H1 + H2, 7.9, 20.0, 4.2, 0);
  dlnMonitorRoof(0, 6.90, 7.9, 20.0, 4.2, 2.10, 0, { over: 0.72, monW: 9.2, monD: 1.6, monH: 0.66 });

  /* Watered central courtyard: stone mule-watering basin, shade-sail & 2-tier interior brick arcades */
  dlnCourtyard(0, Y0 - 0.02, 0, 11.4, 11.4, 0, {
    pool: true, poolW: 4.2, poolD: 2.8, sail: true, sailY: 6.65
  });
  dlnArcade(0, Y0, -5.6, 0, 11.2, H1 - 0.12, 4, { c: brkC, band: true });
  dlnArcade(0, Y0 + H1 + 0.16, -5.6, 0, 11.2, H2 - 0.26, 4, { c: brkC, rail: true });
  for (const s of [-1, 1]) {
    dlnArcade(s * 5.6, Y0, 0, -s * Math.PI * 0.5, 11.0, H1 - 0.12, 4, { c: brkC });
    dlnArcade(s * 5.6, Y0 + H1 + 0.16, 0, -s * Math.PI * 0.5, 11.0, H2 - 0.26, 4, { c: brkC, rail: true });
  }

  /* Innkeeper office door + courtyard doors + baggage crates/barrels + louvered guest windows */
  vnDoor(-2.2, Y0, 6.2, Math.PI * 0.5, 1.15, 2.25, 'vWood', lvC, dlnTrimTint(), false);
  vnDoor(0, Y0, -5.8, 0, 1.35, 2.35, 'vWood', lvC, dlnTrimTint(), false);
  vnStairs(0, 0, 10.25, 0, 3.8, Y0, 3, 'vStone', morC);

  vnSacks(-4.2, Y0, 2.8, 4);
  vnCrate(4.2, Y0, -2.6, 0.92, 0.15, lvC);
  vnBarrel(4.4, Y0, -1.2, 0.44, 1.05, lvC);

  for (const s of [-1, 1]) {
    for (const lx of [4.8, 8.0]) {
      dlnOpenWin(s * lx, Y0 + 0.95, 10.0, 0, 1.25, 1.25, { canvasHood: true, hoodOut: 0.68 });
      dlnOpenWin(s * lx, Y0 + H1 + 0.55, 10.0, 0, 1.25, 1.20, { hoodOut: 0.62 });
    }
    for (const lz of [-6.0, -2.0, 2.0, 6.0]) {
      dlnOpenWin(s * 10.0, Y0 + H1 + 0.55, lz, s * Math.PI * 0.5, 1.20, 1.20, { hoodOut: 0.58 });
    }
    dlnJali(s * 10.0, Y0 + 0.85, 0, s * Math.PI * 0.5, 2.4, 1.45, { c: brkC });
  }
  dlnOpenWin(0, Y0 + H1 + 0.55, 10.0, 0, 1.40, 1.20, { hoodOut: 0.62 });
}

/* 12. Ventilated monsoon spice/grain/potash godown on raised 0.80 m damp-proof brick piers (18 x 16 m, cornice 6.20 m) */
function buildDilGodownVentilated(G, o) { reseed(9889 + (o.v | 0));
  const FL = 0.82;
  const H = 4.84;    /* 0.82 + 4.84 + 0.54 = 6.20 m (matches vern_warehouse 6.10 m!) */
  const brkC = dlnBrickTint(false);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Ventilated brick godown', 0, 0, 9.6, 6.20 + 4.2);

  /* Heavy damp-proof brick pier grid with open monsoon sub-floor airflow tunnels */
  for (let ix = -2; ix <= 2; ix++) {
    for (let iz = -2; iz <= 2; iz++) {
      const px = ix * 3.6;
      const pz = iz * 2.8 - 0.6;
      vB('dlLateriteB', px, -0.15, pz, 0.90, 0.30, 0.90, 0, vC(dlnPick(DL_PAL.laterite)));
      vB('dlBrickDeepB', px, 0.15, pz, 0.72, FL - 0.30, 0.72, 0, vC(dlnPick(DL_PAL.brickDeep)));
    }
  }
  vB('dlMortarB', 0, FL - 0.18, -0.6, 15.8, 0.18, 12.4, 0, morC);

  /* Thick buttressed red-brick storage hall with continuous upper perforated jali ventilation frieze */
  dlnBrickWing(0, FL, -0.6, 15.4, H, 12.0, 0, { c: brkC, beltY: H - 1.55 });
  for (let ix = -2; ix <= 2; ix++) {
    for (const sz of [-1, 1]) {
      if (sz > 0 && ix === 0) continue;
      vB('dlBrickDeepB', ix * 3.55, FL, -0.6 + sz * 6.08, 0.48, H - 0.1, 0.32, 0, vC(dlnPick(DL_PAL.brickDeep)));
    }
  }
  /* Continuous upper jali air-vent slots exhausting warm moist air beneath the eaves */
  for (const lx of [-5.2, -1.8, 1.8, 5.2]) {
    dlnJali(lx, FL + H - 1.25, 5.40, 0, 2.2, 0.92, { c: brkC });
    dlnJali(lx, FL + H - 1.25, -6.60, Math.PI, 2.2, 0.92, { c: brkC });
  }
  for (const lz of [-4.2, -0.6, 3.0]) {
    for (const sx of [-1, 1]) {
      dlnJali(sx * 7.70, FL + H - 1.25, lz, sx * Math.PI * 0.5, 2.2, 0.92, { c: brkC });
    }
  }

  dlnCornice(0, FL + H, -0.6, 15.4, 12.0, 0);
  dlnMonitorRoof(0, 6.20, -0.6, 15.4, 12.0, 2.85, 0, {
    gable: true, over: 0.92, monW: 10.6, monD: 2.2, monH: 0.78, monRise: 0.68
  });

  /* Deep rain-canopy loading dock on +z with twin cargo doors, ramp/stairs, sacks & crates */
  vB('dlMortarB', 0, 0, 6.35, 11.6, FL, 1.90, 0, morC);
  vnStairs(-4.4, 0, 7.45, 0, 2.2, FL, 4, 'vStone', morC);
  for (let i = -2; i <= 2; i++) {
    vPst('vPost', i * 2.65, FL, 7.12, 0.12, 3.15, lvC);
  }
  vnShedRoof(0, FL + 3.15, 6.35, 12.2, 2.2, 0.68, 0, 'dlTileB', dlnTileTint(), 0.42, 0.16);
  vB('vWood', 0, FL + 2.95, 7.55, 12.6, 0.14, 0.08, 0, dlnOrangeTint());

  vnDoor(-2.2, FL, 5.40, 0, 1.65, 2.55, 'vWood', lvC, dlnTrimTint(), false);
  vnDoor(2.2, FL, 5.40, 0, 1.65, 2.55, 'vWood', lvC, dlnTrimTint(), false);
  vnSacks(0, FL, 6.35, 5);
  vnCrate(4.4, FL, 6.35, 0.95, 0.1, lvC);
  vnBarrel(-5.0, FL, 6.25, 0.44, 1.05, lvC);
}

/* 13. Split-plan breezeway bakehouse isolating the hot brick oven across an aired court (13 x 13 m, cornice 6.50 m) */
function buildDilBakeryBreezeway(G, o) { reseed(9897 + (o.v | 0));
  const Y0 = 0.46;
  const H1 = 3.10;
  const H2 = 2.40;   /* 0.46 + 3.10 + 2.40 + 0.54 = 6.50 m (exact match to vern_bakery 6.50 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Breezeway brick bakehouse', 0, 0, 7.2, 6.50 + 3.4);

  /* Front 2-storey cool kneading & bread-counter wing (11.2 x 5.2 m) */
  dlnPlinth(0, 0, 3.1, 11.2, 5.2, Y0, 0);
  dlnBrickWing(0, Y0, 3.1, 11.2, H1 + H2, 5.2, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, 3.1, 11.2, 5.2, 0);
  dlnMonitorRoof(0, 6.50, 3.1, 11.2, 5.2, 2.15, 0, { over: 0.68, monW: 5.8, monD: 1.6, monH: 0.62 });

  /* Open street bread-counter arch + awning + baker door + upper louver windows */
  dlnSunHood(-2.4, Y0 + 2.55, 5.72, 0, 3.4, 0.92, { canvas: true, stripeRed: true });
  vnWin(-2.4, Y0 + 0.88, 5.70, 0, 2.4, 1.35, 'open', 'vWood', lvC, true);
  vB('dlMortarB', -2.4, Y0 + 0.72, 5.95, 2.7, 0.16, 0.52, 0, morC);
  vnDoor(2.2, Y0, 5.70, 0, 1.20, 2.25, 'vWood', lvC, dlnTrimTint());
  for (const lx of [-3.4, 0, 3.4]) {
    dlnOpenWin(lx, Y0 + H1 + 0.55, 5.70, 0, 1.25, 1.18, { hoodOut: 0.60 });
  }

  /* Open central cross-breezeway court (-1.4 m z) shaded by a slatted pergola so oven heat blows away before reaching the shop! */
  vB('dlBrickOchreB', 0, 0, -2.0, 11.2, 0.10, 5.2, 0, vC(dlnPick(DL_PAL.brickOchre)));
  dlnPergola(0, 0.10, -1.2, 9.6, 3.2, 2.85, 0, { brickPiers: true });

  /* Detached rear beehive red-brick bread-oven house & tall chimney stack (-4.6 m z) */
  dlnPlinth(0, 0, -4.6, 9.8, 3.2, Y0, 0);
  vB('dlBrickDeepB', -2.2, Y0, -4.6, 4.8, 2.85, 3.0, 0, vC(dlnPick(DL_PAL.brickDeep)));
  kput('dlDomeTile', [-2.2, Y0 + 2.80, -4.6], null, [2.1, 1.35, 1.45], dlnTileTint());
  vBall('vEmber', -2.2, Y0 + 0.95, -3.05, 0.24);
  vnChimney(-3.4, Y0 + 2.85, -5.1, 4.2, 0.24, false);

  /* Flour store beside oven with jali vent */
  dlnBrickWing(2.6, Y0, -4.6, 4.2, 2.95, 3.0, 0, { c: brkC, quoins: false });
  dlnJali(2.6, Y0 + 1.25, -3.10, 0, 2.2, 1.05, { c: brkC });
  vnShedRoof(2.6, Y0 + 2.95, -4.6, 4.5, 3.3, 0.65, 0, 'dlTileB', dlnTileTint(), 0.35, 0.14);
  vnSacks(2.4, 0.10, -2.2, 4);
  dlnZeerCluster(-4.2, 0.10, -1.5, 2, Math.PI * 0.5);
}

/* 14. Open-arch brick smithy with wide jack-roof smoke/heat monitor & quench court (14 x 14 m, cornice 4.50 m) */
function buildDilSmithyMonitor(G, o) { reseed(9905 + (o.v | 0));
  const Y0 = 0.45;
  const H = 3.51;    /* 0.45 + 3.51 + 0.54 = 4.50 m (matches vern_smithy 4.20 m / vern_tinker 4.50 m!) */
  const brkC = dlnBrickTint(false);
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Monitor-roof brick smithy', 0, 0, 7.6, 4.50 + 4.8);

  /* Main open-arch red-brick forge hall (-1.5 m z) + shaded front quench-trough apron */
  dlnPlinth(0, 0, -1.4, 12.2, 8.8, Y0, 0);
  /* Rear solid fire-wall + open brick arcades on front (+z) and both flanks for maximum forge draft */
  vB('dlBrickDeepB', 0, Y0, -5.55, 12.2, H, 0.52, 0, deepC);
  dlnArcade(0, Y0, 2.75, 0, 11.8, H - 0.06, 3, { c: brkC, band: true, depth: 0.52 });
  for (const sx of [-1, 1]) {
    dlnArcade(sx * 5.85, Y0, -1.4, sx * Math.PI * 0.5, 8.2, H - 0.06, 2, { c: brkC, depth: 0.48 });
  }
  /* Enclosed tool/lock-room bay in NW corner so smithy carries a locked KDOOR */
  dlnBrickWing(-3.8, Y0, -3.4, 4.0, H - 0.1, 3.6, 0, { c: brkC, quoins: false });
  vnDoor(-3.8, Y0, -1.60, 0, 1.10, 2.15, 'vWood', lvC, lvC, false);

  /* High-volume terracotta hipped roof with oversized smoke/heat exhaust monitor + brick forge hood chimney */
  dlnCornice(0, Y0 + H, -1.4, 12.2, 8.8, 0);
  dlnMonitorRoof(0, 4.50, -1.4, 12.2, 8.8, 2.45, 0, {
    over: 0.78, monW: 7.4, monD: 2.6, monH: 0.96, monRise: 0.78
  });

  /* Brick double-hearth forge + glowing embers + chimney stack + iron anvil + stone water-quench trough */
  vB('dlBrickDeepB', 2.2, Y0, -4.1, 3.4, 1.25, 2.0, 0, deepC);
  vB('dlBrickB', 2.2, Y0 + 1.85, -4.1, 3.0, 1.65, 1.6, 0, brkC);
  vBall('vEmber', 2.2, Y0 + 1.32, -3.6, 0.30);
  vnChimney(2.2, 4.50 + 1.6, -4.2, 3.2, 0.28, true);
  vB('vIron', 1.8, Y0, -1.2, 0.85, 0.72, 0.44, 0.2, vC(0x2e2a26));

  /* Shaded front work-apron (+z) with stone quench-water basin & awning */
  vB('dlMortarB', 0, 0, 4.6, 12.0, 0.12, 3.2, 0, morC);
  dlnPergola(0, 0.12, 4.6, 10.6, 2.8, 2.75, 0, {});
  dlnImpluvium(3.4, 0.12, 4.6, 2.4, 1.4, 0, { fountain: false, rimH: 0.48 });
  vnCrate(-4.2, 0.12, 4.6, 0.85, 0.2, lvC);
}

/* 15. Terracotta zeer evaporative water-jar & brick pottery workshop (15 x 14 m, cornice 4.10 m) */
function buildDilBrickPottery(G, o) { reseed(9913 + (o.v | 0));
  const Y0 = 0.42;
  const H = 3.14;    /* 0.42 + 3.14 + 0.54 = 4.10 m */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Zeer water-jar pottery', 0, 0, 8.0, 4.10 + 3.8);

  /* Front open-arcade throwing & display gallery (-x/+z) + shaded drying rack court + stepped beehive kiln */
  dlnPlinth(-2.4, 0, 1.8, 8.4, 7.6, Y0, 0);
  dlnBrickWing(-2.4, Y0, 1.8, 8.4, H, 7.6, 0, { c: brkC });
  dlnCornice(-2.4, Y0 + H, 1.8, 8.4, 7.6, 0);
  dlnMonitorRoof(-2.4, 4.10, 1.8, 8.4, 7.6, 2.05, 0, { over: 0.72, monW: 4.8, monD: 1.6, monH: 0.60 });

  vnDoor(-2.4, Y0, 5.60, 0, 1.20, 2.15, 'vWood', lvC, dlnTrimTint());
  dlnOpenWin(-5.0, Y0 + 0.85, 5.60, 0, 1.35, 1.20, { canvasHood: true });
  dlnOpenWin(0.2, Y0 + 0.85, 5.60, 0, 1.35, 1.20, { canvasHood: true });
  dlnJali(-2.4, Y0 + 0.85, -2.0, Math.PI, 4.2, 1.35, { c: brkC });

  /* Shaded outdoor greenware drying-rack pergola (+x side) filled with rows of terracotta zeer cooler jars */
  vB('dlMortarB', 4.1, 0, 1.6, 4.6, 0.12, 8.0, 0, morC);
  dlnPergola(4.1, 0.12, 1.6, 4.2, 7.4, 2.75, 0, {});
  dlnZeerCluster(4.1, 0.12, 3.8, 3, 0);
  dlnZeerCluster(4.1, 0.12, 1.6, 3, 0);
  dlnZeerCluster(4.1, 0.12, -0.6, 3, 0);

  /* Rear-right red-brick beehive pottery kiln (-z/+x) set well apart from the throwing room */
  vB('dlLateriteB', 3.4, 0, -4.4, 4.8, 0.35, 4.2, 0, vC(dlnPick(DL_PAL.laterite)));
  kput('dlBrickDrum', [3.4, 0.35, -4.4], null, [1.85, 2.35, 1.85], brkC);
  kput('dlDomeTile', [3.4, 2.65, -4.4], null, [1.85, 1.45, 1.85], dlnTileTint());
  vBall('vEmber', 3.4, 0.95, -2.55, 0.22);
  vnChimney(3.4, 3.95, -4.4, 2.2, 0.24, false);
  /* Clay settling pit */
  dlnImpluvium(-3.6, 0.04, -4.5, 3.4, 2.6, 0, { fountain: false, rimH: 0.36 });
}

/* 16. Courtyard cotton/silk weaver & dye-vat colonnade (15 x 15 m, cornice 6.60 m — matches vern_weaver 6.60 m) */
function buildDilWeaverDyecourt(G, o) { reseed(9921 + (o.v | 0));
  const Y0 = 0.48;
  const H1 = 3.16;
  const H2 = 2.42;   /* 0.48 + 3.16 + 2.42 + 0.54 = 6.60 m */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Dyecourt brick weaver', 0, 0, 8.2, 6.60 + 3.4);

  /* Rear 2-storey airy loom-loft wing (13.2 x 5.6 m) + front-left shop wing + open indigo/orange dye-court */
  dlnPlinth(0, 0, -3.6, 13.2, 5.6, Y0, 0);
  dlnBrickWing(0, Y0, -3.6, 13.2, H1 + H2, 5.6, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -3.6, 13.2, 5.6, 0);
  dlnMonitorRoof(0, 6.60, -3.6, 13.2, 5.6, 2.25, 0, { over: 0.72, monW: 7.2, monD: 1.7, monH: 0.66 });

  dlnPlinth(-4.2, 0, 2.6, 4.8, 6.8, Y0, 0);
  dlnBrickWing(-4.2, Y0, 2.6, 4.8, H1, 6.8, 0, { c: brkC });
  dlnCornice(-4.2, Y0 + H1, 2.6, 4.8, 6.8, 0);
  dlnMonitorRoof(-4.2, Y0 + H1 + 0.54, 2.6, 4.8, 6.8, 1.55, Math.PI * 0.5, { monitor: false, over: 0.58 });

  /* Upper loom loft: continuous louvered breeze windows + perforated jali screens */
  for (const lx of [-4.4, -1.5, 1.5, 4.4]) {
    dlnOpenWin(lx, Y0 + H1 + 0.48, -0.80, 0, 1.45, 1.35, { hoodOut: 0.65 });
    dlnOpenWin(lx, Y0 + H1 + 0.48, -6.40, Math.PI, 1.40, 1.30, { hoodOut: 0.58 });
  }
  vnDoor(-4.2, Y0, 6.0, 0, 1.15, 2.20, 'vWood', lvC, dlnTrimTint());
  dlnOpenWin(-4.2, Y0 + 0.90, 6.0, 0, 1.25, 1.15, { hood: false, shutters: false });
  vnDoor(1.2, Y0, -0.80, 0, 1.20, 2.20, 'vWood', lvC, dlnTrimTint(), false);

  /* Shaded dye-vat colonnade & cloth-drying court (+x/+z) with Cut indigo & Iziz-orange vats and drying banners */
  vB('dlMortarB', 2.4, 0, 2.6, 8.2, 0.10, 6.8, 0, morC);
  dlnPergola(2.4, 0.10, 2.6, 7.2, 5.8, 2.95, 0, { brickPiers: true, clothStrip: false });
  /* Brick dye vats (indigo & madder/orange) */
  const vatColors = [DL_PAL.indigo[0], DL_PAL.orange[0], DL_PAL.indigo[1]];
  for (let vi = 0; vi < 3; vi++) {
    const vx = 0.2 + vi * 2.15;
    kput('dlBrickDrum', [vx, 0.10, 4.2], null, [0.72, 0.78, 0.72], brkC);
    kput('dlMortarDrum', [vx, 0.84, 4.2], null, [0.76, 0.08, 0.76], morC);
    vBall('vGourd', vx, 0.82, 4.2, 0.62, vC(vatColors[vi]), 0.10);
  }
  /* Hanging dyed silk/cotton skeins catching the breeze under the pergola */
  vnDryingRack(2.4, 0.10, 1.2, 0, 5.4);
  vB('dlBrickB', 2.4, 0, 6.0, 8.0, 1.35, 0.30, 0, brkC);
  dlnJali(2.4, 0.35, 6.16, 0, 6.4, 0.82, { openBack: true, c: brkC });
}

/* 17. Ventilated brick-grill sugar & whorl-olive press mill (14 x 15 m, cornice 6.20 m — matches vern_mill 6.20 m) */
function buildDilPressMill(G, o) { reseed(9929 + (o.v | 0));
  const Y0 = 0.52;
  const H = 5.14;    /* 0.52 + 5.14 + 0.54 = 6.20 m */
  const brkC = dlnBrickTint(false);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Brick-grill press mill', 0, 0, 8.0, 6.20 + 3.8);

  dlnPlinth(0, 0, -0.8, 12.0, 10.6, Y0, 0);
  dlnBrickWing(0, Y0, -0.8, 12.0, H, 10.6, 0, { c: brkC, beltY: 2.8 });
  /* Large perforated brick-grill jali panels across front, rear & flanks for constant airflow around the press */
  for (const s of [-1, 1]) {
    dlnJali(s * 3.4, Y0 + 1.15, 4.50, 0, 2.8, 2.6, { c: brkC });
    dlnJali(s * 3.4, Y0 + 1.15, -6.10, Math.PI, 2.8, 2.6, { c: brkC });
    dlnJali(s * 6.0, Y0 + 1.15, -0.8, s * Math.PI * 0.5, 4.8, 2.6, { c: brkC });
  }

  dlnCornice(0, Y0 + H, -0.8, 12.0, 10.6, 0);
  dlnMonitorRoof(0, 6.20, -0.8, 12.0, 10.6, 2.65, 0, {
    over: 0.80, monW: 7.2, monD: 2.0, monH: 0.74
  });

  /* Shaded front press-receiving veranda (+z) with visible timber screw-press beam, stone millstone & oil jars */
  vB('dlMortarB', 0, 0, 5.55, 11.4, Y0, 2.1, 0, morC);
  vnStairs(0, 0, 6.75, 0, 2.6, Y0, 3, 'vStone', morC);
  for (let i = -2; i <= 2; i++) vPst('vPost', i * 2.6, Y0, 6.42, 0.11, 3.05, lvC);
  vnShedRoof(0, Y0 + 3.05, 5.55, 11.8, 2.3, 0.62, 0, 'dlTileB', dlnTileTint(), 0.35, 0.15);

  vnDoor(0, Y0, 4.50, 0, 1.45, 2.45, 'vWood', lvC, dlnTrimTint(), false);
  /* Millstone & press beam on veranda */
  kput('dlMortarDrum', [-3.4, Y0, 5.55], null, [0.95, 0.55, 0.95], morC);
  vB('vWood', -3.4, Y0 + 1.25, 5.55, 2.2, 0.24, 0.24, 0.15, lvC);
  vnBarrel(3.4, Y0, 5.50, 0.45, 1.08, lvC);
  dlnZeerCluster(4.5, Y0, 5.55, 2, Math.PI * 0.5);
}

/* 18. Thick-walled evaporative meat & salted-fish hall (12 x 13 m, cornice 5.20 m) */
function buildDilButcherIcehouse(G, o) { reseed(9937 + (o.v | 0));
  const Y0 = 0.62;
  const H = 4.04;    /* 0.62 + 4.04 + 0.54 = 5.20 m */
  const brkC = dlnBrickTint(false);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Evaporative brick butcher hall', 0, 0, 7.0, 5.20 + 4.4);

  /* High thermal-mass battered base + thick windowless lower cold-walls + high jali cross-draft vents */
  dlnPlinth(0, 0, -0.6, 10.2, 9.8, Y0, 0);
  vB('dlBrickDeepB', 0, Y0, -0.6, 10.4, 1.15, 10.0, 0, vC(dlnPick(DL_PAL.brickDeep)));
  dlnBrickWing(0, Y0, -0.6, 10.0, H, 9.6, 0, { c: brkC, beltY: 2.65 });

  /* High-level jali cross-draft vents + rooftop malqaf wind-scoop drawing air over internal wet zeer jars */
  for (const s of [-1, 1]) {
    dlnJali(s * 2.5, Y0 + 2.85, 4.20, 0, 2.2, 0.92, { c: brkC });
    dlnJali(s * 5.0, Y0 + 2.85, -0.6, s * Math.PI * 0.5, 4.6, 0.92, { c: brkC });
  }
  dlnCornice(0, Y0 + H, -0.6, 10.0, 9.6, 0);
  dlnMonitorRoof(0, 5.20, -0.6, 10.0, 9.6, 2.25, 0, { over: 0.95, monitor: false });
  dlnWindCatcher(0, 5.20 + 1.35, -1.2, 2.6, 2.6, 2.85, 0, { c: brkC });

  /* Deep shaded front butcher arcade + marble slab counter + striped Iziz-orange awning */
  dlnArcade(0, Y0, 5.25, 0, 9.6, 3.15, 3, { c: brkC, band: true, depth: 0.48 });
  dlnSunHood(0, Y0 + 3.05, 5.55, 0, 8.8, 0.92, { canvas: true, stripeRed: true });
  vnDoor(-1.8, Y0, 4.20, 0, 1.20, 2.25, 'vWood', lvC, dlnTrimTint(), false);
  vnWin(2.0, Y0 + 0.95, 4.20, 0, 2.2, 1.25, 'open', 'vWood', lvC, true);
  vB('dlMortarB', 2.0, Y0 + 0.80, 4.55, 2.4, 0.16, 0.58, 0, morC);
  vnStairs(0, 0, 5.85, 0, 2.8, Y0, 4, 'vStone', morC);
  dlnZeerCluster(-3.6, Y0, 4.75, 2, 0);
  vnBarrel(3.8, Y0, 4.75, 0.42, 1.0, lvC);
}

/* 19. Louver-shutter & timber joinery court under tall ventilated brick-pier shed (15 x 14 m, cornice 4.40 m) */
function buildDilCarpenterYard(G, o) { reseed(9945 + (o.v | 0));
  const Y0 = 0.44;
  const H = 3.42;    /* 0.44 + 3.42 + 0.54 = 4.40 m */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Ventilated brick joinery yard', 0, 0, 8.0, 4.40 + 3.6);

  /* Enclosed tool/seasoning room on left (-x) + wide open-sided brick-pier joinery shed on right (+x) */
  dlnPlinth(0, 0, -1.5, 13.0, 8.2, Y0, 0);
  dlnBrickWing(-3.8, Y0, -1.5, 5.2, H, 8.0, 0, { c: brkC });
  vnDoor(-3.8, Y0, 2.50, 0, 1.20, 2.15, 'vWood', lvC, dlnTrimTint(), false);
  dlnOpenWin(-3.8, Y0 + 0.95, -5.50, Math.PI, 1.35, 1.15, { hoodOut: 0.58 });
  dlnJali(-6.40, Y0 + 0.95, -1.5, -Math.PI * 0.5, 4.4, 1.35, { c: brkC });

  /* Open 3-bay brick-pier joinery hall (+x half) for seasoning tropical hardwoods in the breeze */
  dlnArcade(2.6, Y0, 2.35, 0, 7.4, H - 0.06, 2, { c: brkC, depth: 0.46 });
  dlnArcade(2.6, Y0, -5.35, Math.PI, 7.4, H - 0.06, 2, { c: brkC, depth: 0.46 });
  dlnArcade(6.25, Y0, -1.5, Math.PI * 0.5, 7.6, H - 0.06, 2, { c: brkC, depth: 0.46 });

  dlnCornice(0, Y0 + H, -1.5, 13.0, 8.2, 0);
  dlnMonitorRoof(0, 4.40, -1.5, 13.0, 8.2, 2.25, 0, {
    gable: true, over: 0.78, monW: 8.2, monD: 1.8, monH: 0.65
  });

  /* Workbenches, stacked seasoned timber planks & canvas shade-sail over front assembly court (+z) */
  vB('dlMortarB', 0, 0, 4.4, 12.8, 0.10, 3.6, 0, morC);
  vnStairs(-3.8, 0, 3.25, 0, 2.0, Y0, 3, 'vStone', morC);
  dlnShadeSail(2.4, 3.35, 4.4, 6.8, 3.2, 0, { posts: true, postH: 3.25, orange: false });
  /* Joiner workbench + stacked planks */
  vB('vWood', 2.4, Y0, -1.5, 3.4, 0.85, 1.1, 0, lvC);
  for (let k = 0; k < 4; k++) {
    vB('vWood', 2.4, 0.12 + k * 0.18, 4.6, 4.2, 0.12, 0.95, 0.04 * (k % 2 ? 1 : -1), vC(dlnPick(VPAL.woodMid)));
  }
  vnCrate(-1.2, 0.10, 4.6, 0.85, 0.25, lvC);
}

VERN.def({
  key: 'dil_shop_arcade',
  name: 'Arcaded Brick Shophouse',
  family: 'trade',
  w: 12, d: 14, h: 10.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['shop', 'market'], job: 'trading' },
  build: buildDilShopArcade
});
VERN.def({
  key: 'dil_bazaar_pavilion',
  name: 'Monitor-Roof Brick Bazaar',
  family: 'trade',
  w: 22, d: 18, h: 11.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['market'], job: 'trading' },
  build: buildDilBazaarPavilion
});
VERN.def({
  key: 'dil_tavern_pergola',
  name: 'Pergola Courtyard Tavern',
  family: 'trade',
  w: 15, d: 15, h: 10.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['tavern'], job: 'brewing' },
  build: buildDilTavernPergola
});
VERN.def({
  key: 'dil_inn_courtyard',
  name: 'Arcaded Courtyard Inn',
  family: 'trade',
  w: 22, d: 22, h: 12.2,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['inn'], job: 'trading' },
  build: buildDilInnCourtyard
});
VERN.def({
  key: 'dil_godown_ventilated',
  name: 'Ventilated Pier Godown',
  family: 'trade',
  w: 18, d: 16, h: 10.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry', 'infrastructure'], job: 'warehousing' },
  build: buildDilGodownVentilated
});
VERN.def({
  key: 'dil_bakery_breezeway',
  name: 'Breezeway Brick Bakehouse',
  family: 'trade',
  w: 13, d: 13, h: 9.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['shop', 'industry'], job: 'baking' },
  build: buildDilBakeryBreezeway
});
VERN.def({
  key: 'dil_smithy_monitor',
  name: 'Monitor-Roof Brick Smithy',
  family: 'trade',
  w: 14, d: 14, h: 10.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry'], job: 'smithing' },
  build: buildDilSmithyMonitor
});
VERN.def({
  key: 'dil_brick_pottery',
  name: 'Zeer Water-Jar Pottery',
  family: 'trade',
  w: 15, d: 14, h: 9.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry', 'shop'], job: 'pottery' },
  build: buildDilBrickPottery
});
VERN.def({
  key: 'dil_weaver_dyecourt',
  name: 'Dyecourt Brick Weaver',
  family: 'trade',
  w: 15, d: 15, h: 10.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry', 'shop'], job: 'weaving' },
  build: buildDilWeaverDyecourt
});
VERN.def({
  key: 'dil_press_mill',
  name: 'Brick-Grill Press Mill',
  family: 'trade',
  w: 14, d: 15, h: 10.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry'], job: 'milling' },
  build: buildDilPressMill
});
VERN.def({
  key: 'dil_butcher_icehouse',
  name: 'Evaporative Brick Butcher Hall',
  family: 'trade',
  w: 12, d: 13, h: 9.2,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['shop'], job: 'butchery' },
  build: buildDilButcherIcehouse
});
VERN.def({
  key: 'dil_carpenter_yard',
  name: 'Ventilated Brick Joinery Yard',
  family: 'trade',
  w: 15, d: 14, h: 9.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'middle', type: ['industry'], job: 'carpentry' },
  build: buildDilCarpenterYard
});
