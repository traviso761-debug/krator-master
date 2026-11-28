// ================================================================= TORUS — 8bg: Kit-Grade Landmarks, Tenders' Ag-Domes & Feral Domes ([draw])
// Builds cut-aware, 100%-textured multi-storey 3D interiors (with ceilingSoffit undersides & Z-clean ground slabs) and richly detailed
// kit-grade exteriors (mullioned windows, stone sills/lintels, pilasters, pitched/domed roofs, industrial vats & cranes) for:
//   1. Board Hall & Tenders' Archive (lm_boardhall, F-1..F2)
//   2. Vothic Emissary's Residence & Chichani Compound (lm_emissary, F-1..F2)
//   3. Ordinator Palace of Torus (lm_ordinators, F-1..F2)
//   4. Great Cider-Press & Fruitvine Winch Hall (lm_ciderhall, WY=300m, F-1..F1)
//   5. Imperial Tithe Granary, Ruined Transit Terminal, Tors Rivrh Barge Wharf
//   6. 8 Surviving Tenders' Ag-Domes (zero clipping around Amber-Sap Dome!) & 4 Quarantined Feral Ag-Domes (socketed with real flora in 8bl).

const TORUS_LANDMARKS_GROUP = (function buildTorusLandmarks3D() {
  const root = new THREE.Group();
  root.name = 'torus_landmarks_root';
  scene.add(root);

  const m4 = new THREE.Matrix4();
  const qTmp = new THREE.Quaternion();
  const eulTmp = new THREE.Euler(0, 0, 0, 'YXZ');
  const oneV = new THREE.Vector3(1, 1, 1);

  const landmarkPlanters = [];
  const domeSockets = [];
  const feralDomeSockets = [];

  function frameOf(lm) {
    const c = Math.cos(lm.ry), s = Math.sin(lm.ry);
    function toWorld(lx, ly, lz) {
      return [
        lm.x + lx * c + lz * s,
        lm.y + ly,
        lm.z - lx * s + lz * c
      ];
    }
    return {
      toWorld: toWorld,
      box: function (list, lx, ly, lz, w, h, d, ryLocal, rxLocal, rzLocal) {
        const wpt = toWorld(lx, ly + 0.5 * h, lz);
        eulTmp.set(rxLocal == null ? 0 : rxLocal, lm.ry + (ryLocal == null ? 0 : ryLocal), rzLocal == null ? 0 : rzLocal);
        qTmp.setFromEuler(eulTmp);
        m4.compose(new THREE.Vector3(wpt[0], wpt[1], wpt[2]), qTmp, oneV);
        list.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(w, h, d), m4, false, 4.0));
      },
      cyl: function (list, lx, ly, lz, rt, rb, h, segs, rxLocal, rzLocal) {
        const wpt = toWorld(lx, ly + 0.5 * h, lz);
        eulTmp.set(rxLocal == null ? 0 : rxLocal, lm.ry, rzLocal == null ? 0 : rzLocal);
        qTmp.setFromEuler(eulTmp);
        m4.compose(new THREE.Vector3(wpt[0], wpt[1], wpt[2]), qTmp, oneV);
        list.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(rt, rb, h, segs == null ? 14 : segs), m4, false, 4.0));
      },
      dome: function (list, lx, ly, lz, r, h, segs) {
        const wpt = toWorld(lx, ly, lz);
        const g = new THREE.SphereGeometry(r, segs == null ? 18 : segs, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
        g.scale(1, h / r, 1);
        m4.makeRotationY(lm.ry).setPosition(wpt[0], wpt[1], wpt[2]);
        list.push(TORUS_DRAW.bakeGeo(g, m4, false, 4.5));
      },
      gableRoof: function (list, lx, ly, lz, w, d, rise, ryLocal) {
        const slopeLen = Math.hypot(0.5 * d, rise) + 0.55;
        const pitch = Math.atan2(rise, 0.5 * d);
        const baseRy = ryLocal == null ? 0 : ryLocal;
        for (let side = -1; side <= 1; side += 2) {
          const offX = baseRy === 0 ? 0 : (side * 0.25 * d);
          const offZ = baseRy === 0 ? (side * 0.25 * d) : 0;
          const wpt = toWorld(lx + offX, ly + 0.5 * rise, lz + offZ);
          eulTmp.set(side * pitch, lm.ry + baseRy, 0);
          qTmp.setFromEuler(eulTmp);
          m4.compose(new THREE.Vector3(wpt[0], wpt[1], wpt[2]), qTmp, oneV);
          list.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(w + 0.8, 0.28, slopeLen), m4, false, 3.5));
        }
      },
      dia: function (list, lx, ly, lz, sz, ryLocal) {
        const wpt = toWorld(lx, ly, lz);
        eulTmp.set(0, lm.ry + (ryLocal == null ? 0 : ryLocal), 0.25 * Math.PI);
        qTmp.setFromEuler(eulTmp);
        m4.compose(new THREE.Vector3(wpt[0], wpt[1], wpt[2]), qTmp, oneV);
        list.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(sz, sz, 0.36), m4, false, 2.5));
      },
      // Architectural mullioned window assembly proud of wall surface (zero wall Z-fighting!)
      win: function (paneList, litList, trimList, hoodList, axis, along, fixed, outSign, ly, w, h, isLit) {
        const glassList = isLit ? litList : paneList;
        const offP = outSign * 0.14;
        const offT = outSign * 0.22;
        const lx = axis === 'x' ? along : (fixed + offP);
        const lz = axis === 'x' ? (fixed + offP) : along;
        const tx = axis === 'x' ? along : (fixed + offT);
        const tz = axis === 'x' ? (fixed + offT) : along;
        const ryW = axis === 'x' ? 0 : 0.5 * Math.PI;
        // Glazed pane
        this.box(glassList, lx, ly + 0.12, lz, w - 0.24, h - 0.24, 0.12, ryW);
        // Projecting carved stone sill + side jambs + central mullion + transom
        this.box(trimList, tx, ly - 0.14, tz, w + 0.42, 0.22, 0.36, ryW);
        this.box(trimList, axis === 'x' ? (along - 0.5 * w) : tx, ly, axis === 'x' ? tz : (along - 0.5 * w), 0.22, h + 0.12, 0.28, ryW);
        this.box(trimList, axis === 'x' ? (along + 0.5 * w) : tx, ly, axis === 'x' ? tz : (along + 0.5 * w), 0.22, h + 0.12, 0.28, ryW);
        if (w >= 1.5) {
          this.box(trimList, tx, ly + 0.10, tz, 0.14, h - 0.20, 0.24, ryW);
        }
        if (h >= 2.2) {
          this.box(trimList, tx, ly + 0.58 * h, tz, w - 0.20, 0.14, 0.24, ryW);
        }
        // Moulded lintel hood
        this.box(hoodList || trimList, tx, ly + h + 0.04, tz, w + 0.52, 0.30, 0.42, ryW);
      },
      planter: function (curbList, soilList, lx, ly, lz, w, d, species, scale) {
        this.box(curbList, lx, ly, lz, w, 0.72, d);
        this.box(soilList, lx, ly + 0.72, lz, w - 0.55, 0.12, d - 0.55);
        const wpt = toWorld(lx, ly + 0.80, lz);
        landmarkPlanters.push({ x: wpt[0], y: wpt[1], z: wpt[2], species: species || 'ashcherry', scale: scale == null ? 0.56 : scale });
      }
    };
  }

  function findLm(id) {
    for (let i = 0; i < TORUS_PLAN.landmarks.length; i++) {
      if (TORUS_PLAN.landmarks[i].id === id) return TORUS_PLAN.landmarks[i];
    }
    return null;
  }

  // Helper: build a named cutaway-ready multi-storey group for a Stage 4 hero landmark
  function buildHeroLandmarkGroup(spec, addExteriorTrim) {
    const grp = new THREE.Group();
    grp.name = spec.id;
    const byStoreyMat = {};
    function pushS(st, matKey, geo) {
      if (!geo) return;
      const key = st + '|' + (matKey || 'ancientStone');
      if (!byStoreyMat[key]) byStoreyMat[key] = { st: st, matKey: matKey || 'ancientStone', list: [] };
      byStoreyMat[key].list.push(geo);
    }

    for (let i = 0; i < spec.slabs.length; i++) {
      const sl = spec.slabs[i];
      // Lift F0 (y=0) slabs to +0.16m so outer porticos/courtyards/crush-floors sit cleanly above builtApron (+0.06m) & Wheel deck (300.0m)!
      const isGroundSlab = Math.abs(sl.y) < 0.05;
      const yWorld = spec.lm.y + (isGroundSlab ? 0.16 : sl.y);
      const thick = isGroundSlab ? 0.26 : sl.thick;
      const sp = TORUS_DRAW.quadSlabGeoSplit(sl.pts, thick, yWorld);
      pushS(sl.storey, sl.mat === 'ancientStone' && sl.storey > 0 ? 'floorTile' : sl.mat, sp.top);
      pushS(sl.storey, 'ceilingSoffit', sp.bottom);
    }
    for (let j = 0; j < spec.stairs.length; j++) {
      const st = spec.stairs[j];
      pushS(st.storey, st.mat, TORUS_DRAW.stairFlightGeo(st.a, st.b, st.w));
    }
    for (let k = 0; k < spec.walls.length; k++) {
      const w = spec.walls[k];
      m4.makeRotationY(w.ry).setPosition(w.x, w.y + 0.5 * w.h, w.z);
      pushS(w.storey, w.mat, TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(w.w, w.h, w.d), m4, false, 4.2));
    }

    if (addExteriorTrim) {
      addExteriorTrim(frameOf(spec.lm), function (st, matKey) {
        const key = st + '|' + matKey;
        if (!byStoreyMat[key]) byStoreyMat[key] = { st: st, matKey: matKey, list: [] };
        return byStoreyMat[key].list;
      });
    }

    Object.keys(byStoreyMat).forEach(function (k) {
      const b = byStoreyMat[k];
      const mg = TORUS_DRAW.mergeGeoList(b.list);
      if (!mg) return;
      const mat = TORUS_DRAW.MATS[b.matKey] || TORUS_DRAW.MATS.ancientStone;
      const mesh = new THREE.Mesh(mg, mat);
      mesh.name = spec.id + '_S' + b.st + '_' + b.matKey;
      grp.add(mesh);
    });

    root.add(grp);
    return grp;
  }

  // ----------------------------------------------------------------- 1. Board Hall & Tenders' Botanical Archive (F-1..F2)
  buildHeroLandmarkGroup(TORUS_STAGE4.boardHall, function (F, B) {
    // Ashlar corner pilasters & moulded stringcourses around the 64x46m classical hall
    const pilX = [-32.2, -16.0, 16.0, 32.2];
    for (let ix = 0; ix < pilX.length; ix++) {
      F.box(B(1, 'ashStone'), pilX[ix], 0.16, -25.2, 1.4, 5.25, 1.4);
      F.box(B(1, 'ashStone'), pilX[ix], 0.16, 21.2, 1.4, 5.25, 1.4);
      F.box(B(2, 'ancientStone'), pilX[ix], 5.4, -25.1, 1.2, 4.85, 1.2);
      F.box(B(2, 'ancientStone'), pilX[ix], 5.4, 19.1, 1.2, 4.85, 1.2);
    }
    F.box(B(2, 'bronze'), 0, 5.25, -25.3, 65.4, 0.38, 0.6);
    F.box(B(2, 'bronze'), 0, 5.25, 20.2, 65.4, 0.38, 1.8);
    F.box(B(2, 'bronze'), -32.3, 5.25, -2.0, 0.6, 0.38, 47.2);
    F.box(B(2, 'bronze'), 32.3, 5.25, -2.0, 0.6, 0.38, 47.2);

    // Mullioned windows on F0 & F1 across front, rear, and east/west archive wings
    const winXs = [-25.5, -19.5, -10.5, 10.5, 19.5, 25.5];
    for (let wi = 0; wi < winXs.length; wi++) {
      const wx = winXs[wi];
      const lit0 = (wi % 2 === 0);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'bronze'), 'x', wx, 21.5, 1, 1.25, 2.5, 2.9, lit0);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'bronze'), 'x', wx, -25.5, -1, 1.25, 2.5, 2.9, !lit0);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'bronze'), 'x', wx, 19.45, 1, 6.45, 2.3, 2.6, !lit0);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'bronze'), 'x', wx, -25.45, -1, 6.45, 2.3, 2.6, lit0);
    }
    for (let wz = -18; wz <= 14; wz += 8) {
      const litS = ((wz + 26) % 16 === 0);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'bronze'), 'z', wz, -32.5, -1, 1.25, 2.4, 2.9, litS);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'bronze'), 'z', wz, 32.5, 1, 1.25, 2.4, 2.9, !litS);
      if (wz <= 12) {
        F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'bronze'), 'z', wz, -32.45, -1, 6.45, 2.2, 2.5, !litS);
        F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'bronze'), 'z', wz, 32.45, 1, 6.45, 2.2, 2.5, litS);
      }
    }

    // F0 Classical 8-Column Portico + Pediment facing the Terraces (keeping central portal clear)
    for (let k = -4; k <= 4; k++) {
      if (k === 0) continue;
      const cx = k * 5.8;
      F.box(B(1, 'ashStone'), cx, 0.16, 26.2, 1.85, 0.65, 1.85);
      F.cyl(B(1, 'ancientStone'), cx, 0.81, 26.2, 0.68, 0.78, 7.1, 12);
      F.box(B(1, 'bronze'), cx, 7.91, 26.2, 1.65, 0.42, 1.65);
    }
    F.box(B(2, 'ancientStone'), 0, 8.33, 25.0, 50.0, 1.25, 5.2);
    F.gableRoof(B(2, 'verdigris'), 0, 9.58, 25.0, 50.4, 5.4, 2.35, 0);
    F.box(B(1, 'warmGlow'), 0, 4.45, 21.65, 6.4, 0.65, 0.28);

    // Forecourt Botanical Planters flanking the Portico approach
    F.planter(B(1, 'ashStone'), B(1, 'terraceLoam'), -20.5, 0.16, 25.5, 4.4, 4.4, 'ashcherry', 0.58);
    F.planter(B(1, 'ashStone'), B(1, 'terraceLoam'), 20.5, 0.16, 25.5, 4.4, 4.4, 'fancrown', 0.55);

    // F2 Standing-Seam Roof Deck + Clerestory Assize Rotunda Drum + Verdigris Dome + Herbarium Glass Conservatory
    const rDeck = TORUS_DRAW.quadSlabGeoSplit(
      [F.toWorld(-32.6, 10.25, -25.6), F.toWorld(32.6, 10.25, -25.6), F.toWorld(32.6, 10.25, 19.6), F.toWorld(-32.6, 10.25, 19.6)].map(function (p) { return [p[0], p[2], p[1]]; }),
      0.32, specTopY(TORUS_STAGE4.boardHall, 10.25)
    );
    B(3, 'roofDeck').push(rDeck.top);
    B(3, 'ceilingSoffit').push(rDeck.bottom);
    // Pitched wing roofs left & right of central rotunda
    F.gableRoof(B(3, 'verdigris'), -22.0, 10.25, -3.0, 19.0, 43.5, 2.8, 0.5 * Math.PI);
    F.gableRoof(B(3, 'verdigris'), 22.0, 10.25, 6.5, 18.5, 24.0, 2.5, 0.5 * Math.PI);
    // Central Assize Rotunda Clerestory Drum + Ribbed Verdigris Dome + Harvest Bell Cupola
    F.cyl(B(3, 'ancientStone'), 0, 10.25, -1.5, 13.8, 14.2, 3.2, 20);
    for (let ca = 0; ca < 12; ca++) {
      const ang = (ca * Math.PI * 2) / 12;
      F.box(B(3, ca % 2 === 0 ? 'windowLit' : 'windowPane'), 14.05 * Math.cos(ang), 11.1, -1.5 + 14.05 * Math.sin(ang), 2.2, 1.5, 0.25, -ang + 0.5 * Math.PI);
    }
    F.dome(B(3, 'verdigris'), 0, 13.45, -1.5, 14.2, 5.6, 20);
    F.cyl(B(3, 'bronze'), 0, 18.8, -1.5, 2.6, 3.0, 2.4, 12);
    F.dome(B(3, 'gold'), 0, 21.2, -1.5, 2.7, 1.6, 12);
    // East Herbarium Glass Dome on F2 Lantern Deck
    F.cyl(B(3, 'tankSteel'), 20.0, 11.7, -14.5, 6.6, 6.8, 1.1, 14);
    F.dome(B(3, 'domeGlass'), 20.0, 12.8, -14.5, 6.6, 3.6, 16);
  });

  function specTopY(spec, ly) {
    return spec.lm.y + ly;
  }

  // ----------------------------------------------------------------- 2. Vothic Emissary's Residence & Chichani Compound (F-1..F2)
  buildHeroLandmarkGroup(TORUS_STAGE4.emissary, function (F, B) {
    const hd = 32.0;
    // Battered corner bastions & porphyry cordon band around the 76x64m diplomatic compound wall
    const corners = [[-38.2, -32.2], [38.2, -32.2], [-38.2, 32.2], [38.2, 32.2]];
    for (let ci = 0; ci < corners.length; ci++) {
      const cx = corners[ci][0], cz = corners[ci][1];
      F.cyl(B(1, 'basalt'), cx, 0.16, cz, 3.4, 4.1, 9.6, 10);
      F.cyl(B(2, 'porphyry'), cx, 9.76, cz, 3.7, 3.5, 0.85, 10);
      F.dome(B(2, 'bronze'), cx, 10.61, cz, 3.5, 2.2, 10);
    }
    F.box(B(1, 'porphyry'), 0, 7.85, -32.1, 77.6, 0.65, 1.75);
    F.box(B(1, 'porphyry'), -22.5, 7.85, 32.1, 31.0, 0.65, 1.75);
    F.box(B(1, 'porphyry'), 22.5, 7.85, 32.1, 31.0, 0.65, 1.75);
    F.box(B(1, 'porphyry'), -38.1, 7.85, 0, 1.75, 0.65, 65.6);
    F.box(B(1, 'porphyry'), 38.1, 7.85, 0, 1.75, 0.65, 65.6);

    // Outer compound lancet windows + inner Chancery/Audience Hall gilded mullioned windows
    for (let wx = -28; wx <= 28; wx += 9) {
      if (Math.abs(wx) < 10) continue;
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'x', wx, 32.7, 1, 3.2, 1.6, 2.8, wx % 2 === 0);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'x', wx, -32.7, -1, 3.2, 1.6, 2.8, wx % 2 !== 0);
    }
    for (let wz = -22; wz <= 22; wz += 11) {
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'z', wz, -38.7, -1, 3.2, 1.6, 2.8, true);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'z', wz, 38.7, 1, 3.2, 1.6, 2.8, false);
    }
    // Inner Manor F0 & F1 Audience Hall tall palace windows
    for (let mx = -18; mx <= 18; mx += 7.2) {
      if (Math.abs(mx) > 2.8) {
        F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ancientStone'), B(1, 'porphyry'), 'x', mx, -3.55, 1, 1.35, 2.2, 2.8, true);
      }
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'gold'), 'x', mx, -3.55, 1, 6.35, 2.4, 3.0, Math.abs(mx) < 12);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'gold'), 'x', mx, -26.45, -1, 6.35, 2.4, 3.0, Math.abs(mx) < 12);
    }
    for (let mz = -21; mz <= -9; mz += 6) {
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'gold'), 'z', mz, -24.45, -1, 6.35, 2.2, 2.8, true);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ancientStone'), B(2, 'gold'), 'z', mz, 24.45, 1, 6.35, 2.2, 2.8, true);
    }

    // Treaty Gatehouse flanking pylons, arched bridge gallery, porphyry silk banners & Vothic Sun-Diamond
    for (let side = -1; side <= 1; side += 2) {
      F.box(B(1, 'basalt'), side * 7.2, 0.16, hd + 1.4, 5.2, 12.6, 6.2);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'gold'), 'x', side * 7.2, hd + 4.5, 1, 7.2, 1.5, 2.6, true);
      F.box(B(2, 'porphyry'), side * 7.2, 5.6, hd + 4.65, 1.8, 5.2, 0.24);
      F.gableRoof(B(2, 'bronze'), side * 7.2, 12.76, hd + 1.4, 5.6, 6.4, 2.2, 0);
    }
    F.box(B(2, 'ancientStone'), 0, 8.2, hd + 1.4, 19.6, 3.4, 5.8);
    F.dia(B(2, 'gold'), 0, 9.9, hd + 4.5, 2.2);

    // Courtyard Cloister Roofs over Factoria (west) & Sun-Missionary Cloister (east)
    F.gableRoof(B(2, 'porphyry'), -29.0, 5.4, 10.0, 17.5, 28.5, 2.4, 0.5 * Math.PI);
    F.gableRoof(B(2, 'porphyry'), 29.0, 5.4, 10.0, 17.5, 28.5, 2.4, 0.5 * Math.PI);

    // F2 Palace Roof Deck + Copper & Verdigris Imperial Domes over Audience Hall
    const eRoof = TORUS_DRAW.quadSlabGeoSplit(
      [F.toWorld(-24.6, 10.6, -26.6), F.toWorld(24.6, 10.6, -26.6), F.toWorld(24.6, 10.6, -3.4), F.toWorld(-24.6, 10.6, -3.4)].map(function (p) { return [p[0], p[2], p[1]]; }),
      0.30, specTopY(TORUS_STAGE4.emissary, 10.6)
    );
    B(3, 'porphyry').push(eRoof.top);
    B(3, 'ceilingSoffit').push(eRoof.bottom);
    F.cyl(B(3, 'ancientStone'), 0, 11.9, -15.0, 9.6, 10.0, 2.2, 16);
    F.dome(B(3, 'verdigris'), 0, 14.1, -15.0, 10.0, 4.8, 18);
    F.cyl(B(3, 'gold'), 0, 18.9, -15.0, 0.35, 0.7, 2.2, 8);
    F.dome(B(3, 'bronze'), -14.0, 11.9, -15.0, 5.2, 2.8, 14);
    F.dome(B(3, 'bronze'), 14.0, 11.9, -15.0, 5.2, 2.8, 14);
  });

  // ----------------------------------------------------------------- 3. Ordinator Palace of Torus (F-1..F2)
  buildHeroLandmarkGroup(TORUS_STAGE4.ordinators, function (F, B) {
    const hd = 31.0;
    // Battered Cyclopean basalt buttresses along all 4 fortress walls + crenellated parapet merlons
    for (let bx = -32; bx <= 32; bx += 16) {
      if (Math.abs(bx) > 8) {
        F.box(B(1, 'basalt'), bx, 0.16, 31.9, 2.4, 8.8, 1.8);
      }
      F.box(B(1, 'basalt'), bx, 0.16, -31.9, 2.4, 8.8, 1.8);
    }
    for (let bz = -24; bz <= 24; bz += 16) {
      F.box(B(1, 'basalt'), -36.9, 0.16, bz, 1.8, 8.8, 2.4);
      F.box(B(1, 'basalt'), 36.9, 0.16, bz, 1.8, 8.8, 2.4);
    }
    F.box(B(1, 'porphyry'), 0, 8.8, -31.2, 74.2, 0.75, 2.0);
    F.box(B(1, 'porphyry'), -21.0, 8.8, 31.2, 30.0, 0.75, 2.0);
    F.box(B(1, 'porphyry'), 21.0, 8.8, 31.2, 30.0, 0.75, 2.0);
    F.box(B(1, 'porphyry'), -36.2, 8.8, 0, 2.0, 0.75, 64.2);
    F.box(B(1, 'porphyry'), 36.2, 8.8, 0, 2.0, 0.75, 64.2);

    // Narrow Inquisitorial Lancet Windows on F0 + Tall Surveillance Registry Windows on F1
    for (let wx = -24; wx <= 24; wx += 8) {
      if (Math.abs(wx) >= 12) {
        F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'x', wx, 31.75, 1, 3.6, 1.2, 3.2, wx > 0);
      }
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'ashStone'), B(1, 'porphyry'), 'x', wx, -31.75, -1, 3.6, 1.2, 3.2, wx % 16 === 0);
    }
    for (let rx = -22; rx <= 18; rx += 8) {
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ashStone'), B(2, 'gold'), 'x', rx, 6.45, 1, 6.6, 2.2, 2.8, true);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ashStone'), B(2, 'gold'), 'x', rx, -25.45, -1, 6.6, 2.2, 2.8, rx >= -6);
    }
    for (let rz = -20; rz <= 0; rz += 10) {
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ashStone'), B(2, 'gold'), 'z', rz, -28.45, -1, 6.6, 2.1, 2.8, true);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'ashStone'), B(2, 'gold'), 'z', rz, 24.45, 1, 6.6, 2.1, 2.8, false);
    }

    // Scrutinies Gatehouse Pylons + Sun Emblem
    F.box(B(1, 'basalt'), -7.0, 0.16, hd + 1.4, 5.2, 13.6, 6.4);
    F.box(B(1, 'basalt'), 7.0, 0.16, hd + 1.4, 5.2, 13.6, 6.4);
    F.box(B(2, 'porphyry'), 0, 8.6, hd + 1.4, 19.4, 3.2, 5.8);
    F.dia(B(2, 'gold'), 0, 10.2, hd + 4.5, 2.3);
    // Roof over South Inquisitorial Guardhouse
    F.gableRoof(B(2, 'roofDeck'), 0, 9.2, 18.5, 68.0, 23.0, 2.4, 0);

    // F2 Roof Deck + Octagonal Sun-Sanctuary Drum + Parabolic Bronze Sun-Dish + Scrutiny Watchtower Belfry
    const oRoof = TORUS_DRAW.quadSlabGeoSplit(
      [F.toWorld(-28.4, 10.85, -25.4), F.toWorld(24.4, 10.85, -25.4), F.toWorld(24.4, 10.85, 6.4), F.toWorld(-28.4, 10.85, 6.4)].map(function (p) { return [p[0], p[2], p[1]]; }),
      0.30, specTopY(TORUS_STAGE4.ordinators, 10.85)
    );
    B(3, 'roofDeck').push(oRoof.top);
    B(3, 'ceilingSoffit').push(oRoof.bottom);

    F.cyl(B(3, 'porphyry'), 5.0, 11.15, -9.5, 11.4, 11.8, 2.2, 8);
    F.dome(B(3, 'bronze'), 5.0, 13.35, -9.5, 11.4, 4.2, 16);
    // Articulated Parabolic Sun-Dish on steel trunnion yoke above the Sanctuary
    F.box(B(3, 'tankSteel'), 5.0, 17.5, -9.5, 3.6, 2.2, 1.4);
    F.cyl(B(3, 'gold'), 5.0, 19.4, -9.5, 5.2, 1.2, 1.8, 16, -0.35, 0);

    // Scrutiny Watchtower Belfry (west corner) with mullioned observation lantern & pyramidal steel roof
    F.box(B(3, 'basalt'), -19.0, 11.2, -17.5, 11.4, 7.6, 11.4);
    for (let side = -1; side <= 1; side += 2) {
      F.win(B(3, 'windowPane'), B(3, 'windowLit'), B(3, 'ashStone'), B(3, 'porphyry'), 'x', -19.0, -17.5 + side * 5.7, side, 14.6, 4.2, 2.2, true);
      F.win(B(3, 'windowPane'), B(3, 'windowLit'), B(3, 'ashStone'), B(3, 'porphyry'), 'z', -17.5, -19.0 + side * 5.7, side, 14.6, 4.2, 2.2, true);
    }
    F.gableRoof(B(3, 'tankSteel'), -19.0, 18.8, -17.5, 12.2, 12.2, 2.8, 0);
  });

  // ----------------------------------------------------------------- 4. Great Cider-Press & Fruitvine Winch Hall (WY=300m, F-1..F1)
  buildHeroLandmarkGroup(TORUS_STAGE4.ciderHall, function (F, B) {
    // Riveted steel & stone pilasters + arched factory windows along F0 & F1
    for (let px = -26; px <= 26; px += 13) {
      F.box(B(1, 'rustPlate'), px, 0.16, -18.4, 0.9, 5.5, 0.9);
      F.box(B(1, 'rustPlate'), px, 0.16, 18.4, 0.9, 5.5, 0.9);
    }
    const cWinX = [-20, -11, 11, 20];
    for (let wi = 0; wi < cWinX.length; wi++) {
      const wx = cWinX[wi];
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'rustPlate'), B(1, 'bronze'), 'x', wx, 18.45, 1, 1.4, 3.2, 2.8, true);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'rustPlate'), B(1, 'bronze'), 'x', wx, -18.45, -1, 1.4, 3.2, 2.8, true);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'rustPlate'), B(2, 'verdigris'), 'x', wx, 15.35, 1, 6.5, 3.0, 2.2, wi % 2 === 0);
      F.win(B(2, 'windowPane'), B(2, 'windowLit'), B(2, 'rustPlate'), B(2, 'verdigris'), 'x', wx, -20.85, -1, 6.5, 3.0, 2.2, wi % 2 !== 0);
    }
    for (let wz = -12; wz <= 12; wz += 24) {
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'rustPlate'), B(1, 'bronze'), 'z', wz, -28.45, -1, 1.4, 3.0, 2.8, true);
      F.win(B(1, 'windowPane'), B(1, 'windowLit'), B(1, 'rustPlate'), B(1, 'bronze'), 'z', wz, 28.45, 1, 1.4, 3.0, 2.8, true);
    }

    // Interior Twin Giant Timber-and-Bronze Cider Screw Presses on F0 Crush Floor (visible through cutaway & doors!)
    const pressXs = [-6.0, 8.0];
    for (let pi = 0; pi < pressXs.length; pi++) {
      const prx = pressXs[pi];
      F.cyl(B(1, 'timber'), prx, 0.9, 0, 2.1, 2.3, 2.2, 12);
      F.box(B(1, 'timber'), prx - 2.4, 0.16, 0, 0.55, 4.9, 0.55);
      F.box(B(1, 'timber'), prx + 2.4, 0.16, 0, 0.55, 4.9, 0.55);
      F.box(B(1, 'timber'), prx, 4.85, 0, 5.6, 0.65, 1.1);
      F.cyl(B(1, 'bronze'), prx, 2.8, 0, 0.28, 0.28, 2.8, 10);
    }

    // 6 Colossal Banded Copper & Salvaged-Steel Fermentation Vats + Brass Manifold Pipes + Catwalks
    for (let k = -1; k <= 1; k++) {
      const vz = k * 13.5;
      F.cyl(B(1, 'ashStone'), -35.5, 0.16, vz, 5.6, 5.9, 1.2, 14);
      F.cyl(B(1, 'bronze'), -35.5, 1.36, vz, 5.1, 5.4, 13.8, 16);
      F.cyl(B(1, 'tankSteel'), -35.5, 6.2, vz, 5.35, 5.35, 0.35, 16);
      F.cyl(B(1, 'tankSteel'), -35.5, 11.2, vz, 5.25, 5.25, 0.35, 16);
      F.dome(B(2, 'verdigris'), -35.5, 15.16, vz, 5.3, 2.6, 16);

      F.cyl(B(1, 'ashStone'), 35.5, 0.16, vz, 5.6, 5.9, 1.2, 14);
      F.cyl(B(1, 'tankSteel'), 35.5, 1.36, vz, 5.1, 5.4, 13.8, 16);
      F.cyl(B(1, 'rustPlate'), 35.5, 6.2, vz, 5.35, 5.35, 0.35, 16);
      F.cyl(B(1, 'rustPlate'), 35.5, 11.2, vz, 5.25, 5.25, 0.35, 16);
      F.dome(B(2, 'bronze'), 35.5, 15.16, vz, 5.3, 2.6, 16);
    }
    // Manifold catwalk & brass juice header pipes linking vats into the Press Nave
    F.box(B(2, 'timber'), -35.5, 13.8, 0, 2.2, 0.28, 30.0);
    F.box(B(2, 'timber'), 35.5, 13.8, 0, 2.2, 0.28, 30.0);
    F.cyl(B(2, 'bronze'), -30.5, 9.2, 0, 0.32, 0.32, 10.5, 8, 0, 0.5 * Math.PI);
    F.cyl(B(2, 'bronze'), 30.5, 9.2, 0, 0.32, 0.32, 10.5, 8, 0, 0.5 * Math.PI);

    // Pitched Standing-Seam Verdigris Hall Roof + Clerestory Monitor + Overhead Rim-to-Rim Winch Gantry Truss
    const cRoof = TORUS_DRAW.quadSlabGeoSplit(
      [F.toWorld(-26.8, 10.0, -21.2), F.toWorld(26.8, 10.0, -21.2), F.toWorld(26.8, 10.0, 15.8), F.toWorld(-26.8, 10.0, 15.8)].map(function (p) { return [p[0], p[2], p[1]]; }),
      0.28, specTopY(TORUS_STAGE4.ciderHall, 10.0)
    );
    B(2, 'roofDeck').push(cRoof.top);
    B(2, 'ceilingSoffit').push(cRoof.bottom);
    F.gableRoof(B(2, 'verdigris'), 0, 10.0, -2.7, 54.4, 37.6, 3.8, 0);
    F.box(B(2, 'rustPlate'), 0, 13.2, -2.7, 36.0, 2.2, 9.4);
    F.gableRoof(B(2, 'bronze'), 0, 15.4, -2.7, 36.8, 9.8, 1.5, 0);
    // Rim-to-rim overhead crane girder
    F.box(B(2, 'tankSteel'), 0, 17.4, -2.7, 84.0, 1.4, 4.2);
    F.box(B(1, 'warmGlow'), 0, 4.8, 18.6, 12.0, 0.75, 0.3);
  });

  // ----------------------------------------------------------------- 5. Supporting Landmarks, 8 Surviving Ag-Domes & 4 Quarantined Feral Domes
  const basalt = [], ash = [], anc = [], porphyry = [], gold = [], bronze = [], steel = [], rust = [], verd = [], timber = [];
  const winPane = [], winLit = [], pave = [], glass = [], amberGlass = [], herb = [], loam = [];

  // 5a. Imperial Tithe Granary & Assay Scales (6-Silo Basalt/Bronze Battery + Tallyhouse + Loading Canopy)
  const gran = findLm('lm_tithe_granary');
  if (gran) {
    const F = frameOf(gran);
    F.box(pave, 0, 0.04, 0, 42.0, 0.16, 28.0);
    F.box(basalt, 0, 0.20, -2.0, 35.0, 5.4, 18.0);
    // 6 Ribbed Grain & Seed Silo Drums in two rows + Conical Bronze Roofs + Overhead Conveyor Gallery
    for (let k = -1; k <= 1; k++) {
      const sx = k * 10.6;
      F.cyl(ash, sx, 5.6, -5.2, 4.6, 4.8, 7.6, 14);
      F.dome(bronze, sx, 13.2, -5.2, 4.8, 2.8, 14);
      F.cyl(ash, sx, 5.6, 3.8, 4.6, 4.8, 6.2, 14);
      F.dome(verd, sx, 11.8, 3.8, 4.8, 2.5, 14);
    }
    F.box(steel, 0, 13.8, -5.2, 26.0, 1.8, 3.2);
    // Front Assay Tallyhouse & Covered Weigh-Scale Portico
    F.box(porphyry, 0, 5.6, -2.0, 35.6, 0.45, 18.6);
    for (let wx = -12; wx <= 12; wx += 8) {
      if (wx === 0) continue;
      F.win(winPane, winLit, ash, porphyry, 'x', wx, 7.05, 1, 1.8, 2.0, 2.2, true);
    }
    F.box(timber, 0, 4.4, 9.8, 22.0, 0.35, 5.4);
    for (let pk = -2; pk <= 2; pk++) {
      F.box(timber, pk * 4.8, 0.20, 12.0, 0.38, 4.2, 0.38);
    }
    F.dia(gold, 0, 7.4, 7.2, 1.9);
  }

  // 5b. Ruined Ancient Valley Transit Terminal (Ribbed Concrete Vault + Fractured Steel Skylight + Salvaged Freight Shed)
  const term = findLm('lm_transit_terminal');
  if (term) {
    const F = frameOf(term);
    F.box(pave, 0, 0.04, 0, 50.0, 0.16, 32.0);
    // Platform retaining plinth + side colonnade walls
    F.box(anc, 0, 0.20, 0, 46.0, 1.6, 28.0);
    F.box(anc, 0, 1.80, -12.2, 44.0, 7.4, 1.8);
    F.box(anc, -8.0, 1.80, 12.2, 28.0, 7.4, 1.8);
    for (let rx = -19; rx <= 19; rx += 7.6) {
      F.box(anc, rx, 1.80, -12.2, 1.3, 8.8, 2.8);
      if (rx <= 6) {
        F.box(anc, rx, 1.80, 12.2, 1.3, 8.8, 2.8);
        // Arch ribs spanning the surviving west concourse vault
        F.box(anc, rx, 10.2, 0, 1.2, 1.4, 26.8);
      } else {
        // Exposed rusted steel roof trusses over the collapsed east bays
        F.box(rust, rx, 9.6, -2.0, 0.65, 0.9, 20.0, 0, 0.08, 0);
      }
    }
    F.gableRoof(steel, -8.0, 10.6, 0, 28.5, 25.4, 3.2, 0);
    for (let wx = -18; wx <= 2; wx += 6.6) {
      F.win(winPane, winLit, ash, steel, 'x', wx, 13.15, 1, 3.2, 2.8, 3.4, wx < -4);
      F.win(winPane, winLit, ash, steel, 'x', wx, -13.15, -1, 3.2, 2.8, 3.4, false);
    }
    // Reclaimed Rinkvolk Salvage Freight Shed tucked into the east platform + Broken Transit Clock Pylon
    F.box(rust, 14.0, 1.80, 3.5, 13.0, 4.8, 12.0);
    F.gableRoof(verd, 14.0, 6.60, 3.5, 13.6, 12.6, 1.8, 0);
    F.box(anc, -21.5, 1.80, 13.8, 2.8, 14.5, 2.8);
    F.dia(bronze, -21.5, 14.2, 15.4, 1.6);
  }

  // 5c. Tors Rivrh Cider & Grain Barge Wharf (Ashlar Quay + Twin-Drum Warehouse + Slewing Timber Crane + Barge Pier)
  const wharf = findLm('lm_river_wharf');
  if (wharf) {
    const F = frameOf(wharf);
    // Ashlar quay bulkhead + stone deck + timber fender piles
    F.box(basalt, 0, -2.2, 0, 38.0, 3.6, 20.0);
    F.box(pave, 0, 1.40, 0, 37.4, 0.18, 19.4);
    for (let fp = -16; fp <= 16; fp += 4) {
      F.cyl(timber, fp, -2.4, 10.3, 0.28, 0.28, 4.6, 8);
    }
    // Wharf Twin-Drum Cider & Grain Warehouse with Pitched Roof & Windows
    F.box(ash, -9.5, 1.58, -1.5, 16.0, 6.2, 13.0);
    F.gableRoof(verd, -9.5, 7.78, -1.5, 16.8, 13.8, 2.5, 0);
    F.win(winPane, winLit, anc, bronze, 'x', -13.5, 5.05, 1, 3.2, 2.2, 2.2, true);
    F.win(winPane, winLit, anc, bronze, 'x', -5.5, 5.05, 1, 3.2, 2.2, 2.2, true);
    F.cyl(bronze, 9.5, 1.58, -3.0, 4.6, 4.9, 8.6, 14);
    F.dome(rust, 9.5, 10.18, -3.0, 4.8, 2.2, 14);
    // Timber & Steel Slewing Wharf Crane + Planked Barge Pier
    F.cyl(steel, 13.5, 1.58, 5.8, 0.85, 1.1, 6.8, 10);
    F.box(timber, 13.5, 7.6, 9.4, 0.55, 0.65, 9.8, 0, -0.36, 0);
    F.box(timber, 0, 1.15, 15.2, 26.0, 0.45, 10.4);
    for (let mp = -10; mp <= 10; mp += 5) {
      F.cyl(timber, mp, -2.6, 19.6, 0.30, 0.30, 4.8, 8);
    }
  }

  // ----------------------------------------------------------------- 6. 8 Surviving Tenders' Out-of-Zone & Amber-Sap Ag-Domes (ZERO CLIPPING!)
  for (let i = 0; i < TORUS_PLAN.specimenDomes.length; i++) {
    const dm = TORUS_PLAN.specimenDomes[i];
    const F = frameOf(dm);
    const isAmberSap = (dm.id === 'dome_ancient_medical');

    // Circular stone sanctuary plaza apron (lifted +0.08m above terrace soil; external structures sit on this apron WELL OUTSIDE the r=11.2m dome!)
    F.cyl(pave, 0, 0.04, 0.8, 16.8, 17.2, 0.14, 24);

    // 16-sided stone & bronze conservatory plinth ring wall (r=11.0m, leaving +z airlock portal clear)
    for (let seg = 0; seg < 16; seg++) {
      const a = (seg + 0.5) * (Math.PI * 2 / 16);
      const lx = 11.0 * Math.sin(a), lz = 11.0 * Math.cos(a);
      if (lz > 9.3 && Math.abs(lx) < 2.6) continue;
      F.box(anc, lx, 0.18, lz, 4.45, 2.65, 0.85, a);
      F.box(isAmberSap ? gold : bronze, lx, 2.83, lz, 4.55, 0.24, 1.02, a);
    }

    // Furrowed botanical soil beds inside the conservatory (central walkway & Amber-Sap central pit kept clear!)
    F.box(herb, -4.6, 0.22, -1.2, 5.0, 0.58, 11.4);
    F.box(herb, 4.6, 0.22, -1.2, 5.0, 0.58, 11.4);
    if (isAmberSap) {
      // Sacred central stone planter ring for the Ancient Amber-Sap Mother Tree
      F.cyl(gold, 0, 0.22, -1.8, 2.85, 3.05, 0.68, 16);
      F.cyl(loam, 0, 0.24, -1.8, 2.55, 2.55, 0.72, 16);
    }

    // Faceted Translucent Conservatory Dome + Geodesic Meridian & Hoop Ribs + Crown Ventilator Lantern
    F.dome(isAmberSap ? amberGlass : glass, 0, 3.02, 0, 10.85, 8.8, 20);
    for (let r = 0; r < 8; r++) {
      const ang = (r * Math.PI) / 4;
      for (let b = 0; b < 4; b++) {
        const t0 = (b * 0.5 * Math.PI) / 4, t1 = ((b + 1) * 0.5 * Math.PI) / 4;
        const tm = 0.5 * (t0 + t1);
        const rr = 10.95 * Math.cos(tm);
        const yy = 3.02 + 8.85 * Math.sin(tm);
        const chord = 2.75;
        const tilt = (0.5 * Math.PI - tm);
        F.box(isAmberSap ? bronze : steel, rr * Math.sin(ang), yy - 0.15, rr * Math.cos(ang), 0.26, 0.28, chord, ang, -tilt, 0);
      }
    }
    F.cyl(isAmberSap ? gold : bronze, 0, 11.45, 0, 2.3, 2.7, 1.35, 14);
    F.dome(isAmberSap ? amberGlass : glass, 0, 12.80, 0, 2.2, 1.1, 14);

    // Glazed Airlock Vestibule projecting outward on +z (from z=10.8 to z=13.8, keeping 2.6m KDOOR clear!)
    F.box(steel, -2.05, 0.18, 12.1, 1.3, 3.45, 3.2);
    F.box(steel, 2.05, 0.18, 12.1, 1.3, 3.45, 3.2);
    F.box(verd, 0, 3.45, 12.1, 5.6, 0.48, 3.6);
    F.gableRoof(isAmberSap ? gold : bronze, 0, 3.93, 12.1, 5.8, 3.8, 0.85, 0);

    // External Verdigris Mist-Irrigation Cistern placed CLEANLY OUTSIDE at r = 15.6m (inner edge 13.7m > 11.4m dome wall — ZERO CLIPPING!)
    F.cyl(ash, -11.8, 0.18, 10.2, 2.1, 2.25, 0.65, 12);
    F.cyl(verd, -11.8, 0.83, 10.2, 1.85, 1.95, 4.4, 12);
    F.dome(bronze, -11.8, 5.23, 10.2, 1.9, 0.95, 12);
    // Overhead copper mist feed pipe bridging cleanly into the plinth wall at y=2.35m (below glass!)
    F.cyl(bronze, -9.4, 2.25, 8.2, 0.14, 0.14, 4.2, 8, 0.68, 0.85);

    if (dm.ordinatorsWatch === 'strict_surveillance') {
      // Amber-Sap Ordinator Surveillance Guardhouse placed CLEANLY OUTSIDE at (lx=12.4, lz=10.2 -> r_center=16.05m, inner corner 13.3m > 11.4m dome!)
      F.box(basalt, 12.4, 0.18, 10.2, 4.2, 6.2, 4.2);
      F.box(porphyry, 12.4, 6.15, 10.2, 4.5, 0.42, 4.5);
      F.gableRoof(bronze, 12.4, 6.57, 10.2, 4.6, 4.6, 1.45, 0);
      F.win(winPane, winLit, ash, gold, 'x', 12.4, 12.35, 1, 3.2, 1.6, 1.8, true);
      F.win(winPane, winLit, ash, gold, 'z', 10.2, 10.25, -1, 3.2, 1.6, 1.8, true);
      F.dia(gold, 12.4, 5.4, 12.45, 1.05);
    }

    domeSockets.push({
      id: dm.id,
      code: dm.specimenCode,
      category: dm.category,
      cropIds: dm.cropIds,
      isAmberSap: isAmberSap,
      x: dm.x,
      y: dm.y + 0.80,
      z: dm.z,
      ry: dm.ry
    });
  }

  // ----------------------------------------------------------------- 7. 4 Quarantined Feral Ag-Domes (Ruptured Steel Ribs + Welded Bulkhead; Real Flora in 8bl!)
  for (let i = 0; i < TORUS_PLAN.feralDomes.length; i++) {
    const fd = TORUS_PLAN.feralDomes[i];
    const F = frameOf(fd);
    F.cyl(pave, 0, 0.04, 0.5, 15.6, 16.0, 0.14, 20);
    // Cracked ash-stone containment ring wall + hazard porphyry cordon
    for (let seg = 0; seg < 16; seg++) {
      const a = (seg + 0.5) * (Math.PI * 2 / 16);
      const lx = 11.0 * Math.sin(a), lz = 11.0 * Math.cos(a);
      if (lz > 9.2 && Math.abs(lx) < 2.8) continue;
      const wallH = (seg % 5 === 2) ? 1.9 : 2.9;
      F.box(ash, lx, 0.18, lz, 4.45, wallH, 0.95, a);
      F.box(porphyry, lx, 0.18 + wallH, lz, 4.5, 0.25, 1.05, a);
    }
    // Rich dark overgrown soil mound inside the ruptured dome
    F.cyl(loam, 0, 0.18, 0, 9.8, 10.4, 0.95, 16);

    // Welded Heavy Quarantine Bulkhead Frame & Cross-Barricade Beams on +z
    F.box(rust, -2.3, 0.18, 11.8, 1.5, 3.9, 3.0);
    F.box(rust, 2.3, 0.18, 11.8, 1.5, 3.9, 3.0);
    F.box(rust, 0, 3.55, 11.8, 6.2, 0.75, 3.2);
    F.box(porphyry, 0, 1.85, 12.6, 4.4, 0.32, 0.28, 0, 0, 0.28);
    F.box(porphyry, 0, 1.85, 12.6, 4.4, 0.32, 0.28, 0, 0, -0.28);

    // Jagged Shattered Geodesic Steel Ribs & Surviving Lower Glass Shards curving up and snapping open at the crown
    for (let r = 0; r < 10; r++) {
      const ang = (r * Math.PI * 2) / 10;
      const keepSegs = (r % 3 === 0) ? 3 : 2;
      for (let b = 0; b < keepSegs; b++) {
        const tm = ((b + 0.5) * 0.5 * Math.PI) / 4;
        const rr = 10.9 * Math.cos(tm);
        const yy = 2.95 + 8.6 * Math.sin(tm);
        const bend = (b === keepSegs - 1) ? -0.22 : 0.0;
        const tilt = (0.5 * Math.PI - tm) + bend;
        F.box(rust, rr * Math.sin(ang), yy, rr * Math.cos(ang), 0.34, 0.36, 2.8, ang, -tilt, 0);
      }
      if (r % 2 === 0) {
        const lx = 10.4 * Math.sin(ang + 0.3), lz = 10.4 * Math.cos(ang + 0.3);
        F.box(glass, lx, 3.8, lz, 2.6, 2.2, 0.12, ang + 0.3, -0.24, 0);
      }
    }

    feralDomeSockets.push({
      id: fd.id,
      specimen: fd.specimen,
      x: fd.x,
      y: fd.y + 1.10,
      z: fd.z,
      ry: fd.ry
    });
  }

  function addBatch(list, mat, name) {
    if (!list.length) return;
    const m = new THREE.Mesh(TORUS_DRAW.mergeGeoList(list), mat);
    m.name = name;
    root.add(m);
  }
  addBatch(basalt, TORUS_DRAW.MATS.basalt, 'torus_lm_basalt');
  addBatch(ash, TORUS_DRAW.MATS.ashStone, 'torus_lm_ash');
  addBatch(anc, TORUS_DRAW.MATS.ancientStone, 'torus_lm_ancient');
  addBatch(porphyry, TORUS_DRAW.MATS.porphyry, 'torus_lm_porphyry');
  addBatch(gold, TORUS_DRAW.MATS.gold, 'torus_lm_gold');
  addBatch(bronze, TORUS_DRAW.MATS.bronze, 'torus_lm_bronze');
  addBatch(steel, TORUS_DRAW.MATS.tankSteel, 'torus_lm_steel');
  addBatch(rust, TORUS_DRAW.MATS.rustPlate, 'torus_lm_rust');
  addBatch(verd, TORUS_DRAW.MATS.verdigris, 'torus_lm_verdigris');
  addBatch(timber, TORUS_DRAW.MATS.timber, 'torus_lm_timber');
  addBatch(winPane, TORUS_DRAW.MATS.windowPane, 'torus_lm_windows');
  addBatch(winLit, TORUS_DRAW.MATS.windowLit, 'torus_lm_windows_lit');
  addBatch(pave, TORUS_DRAW.MATS.builtApron, 'torus_lm_aprons');
  addBatch(herb, TORUS_DRAW.MATS.cropHerb, 'torus_dome_beds');
  addBatch(loam, TORUS_DRAW.MATS.terraceLoam, 'torus_dome_loam');
  addBatch(glass, TORUS_DRAW.MATS.domeGlass, 'torus_tender_dome_glass');
  addBatch(amberGlass, TORUS_DRAW.MATS.amberGlass, 'torus_ambersap_dome_glass');

  root.userData.landmarkPlanters = landmarkPlanters;
  root.userData.domeSockets = domeSockets;
  root.userData.feralDomeSockets = feralDomeSockets;
  return root;
})();
