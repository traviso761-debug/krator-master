// ================================================================= DRUM — 8bh: Kit-Grade Landmarks, Fenestrated Praetorium & Market/Quarry ([draw])
// Builds true multi-storey interiors (F-1..F2, textured floors + ceilingSoffit ceilings) + rich kit-grade exterior architecture:
//   - Praetorium of the Military Governor (Garrison Fortress): 72 recessed mullioned/pedimented windows across F0/F1/F2,
//     battered plinths, pilasters, machicolated merlons, pitched roofDeck wing/keep roofs, bailey colonnades & courtyard planters.
//   - Ordinator Fortress: battered basalt talus, 28 barred lancet windows, Cloister of Ash colonnade, steel Dish-Cradle & Watch Drums.
//   - The Cauldron Arena: 28 steel I-beam ribs, vaulted Sun/Ash vomitoria, gallery roofs, colonnaded VIP boxes & cable-stayed velarium.
//   - Assay Rotunda, Vothic Customs Hall, Quarry Sawtooth Foundry & Drim Rivrh Sluice Wharf brought to full kit-building detail.

const DRUM_LANDMARKS_GROUP = (function buildDrumLandmarks3D() {
  const root = new THREE.Group();
  root.name = 'drum_landmarks_root';
  scene.add(root);

  const buckets = {
    ancientStone: [], ancientDark: [], basalt: [], ashStone: [], porphyry: [],
    gold: [], bronze: [], rustPlate: [], tankSteel: [], verdigris: [],
    timber: [], canvas: [], sand: [], boursePave: [], floorTile: [],
    ceilingSoffit: [], roofDeck: [], cityEarth: [], windowPane: [], windowLit: [], warmGlow: []
  };
  function pushB(matName, geo) {
    if (!geo) return;
    (buckets[matName] || buckets.ashStone).push(geo);
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eu = new THREE.Euler(0, 0, 0, 'YXZ');
  const v3 = new THREE.Vector3();
  const s1 = new THREE.Vector3(1, 1, 1);
  const landmarkPlanters = [];

  function addWorldBox(matName, x, y, z, w, h, d, ry, rz, rx) {
    eu.set(rx == null ? 0 : rx, ry == null ? 0 : ry, rz == null ? 0 : rz);
    q.setFromEuler(eu);
    v3.set(x, y + 0.5 * h, z);
    m4.compose(v3, q, s1);
    pushB(matName, DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(w, h, d), m4));
  }

  function frameOf(lm) {
    const c = Math.cos(lm.ry), s = Math.sin(lm.ry);
    function toW(lx, lz) {
      return [lm.x + lx * c + lz * s, lm.z - lx * s + lz * c];
    }
    const F = {
      box: function (matName, lx, ly, lz, w, h, d, ryLocal, rzLocal, rxLocal) {
        const wpt = toW(lx, lz);
        addWorldBox(matName, wpt[0], lm.y + ly, wpt[1], w, h, d, lm.ry + (ryLocal == null ? 0 : ryLocal), rzLocal, rxLocal);
      },
      cyl: function (matName, lx, ly, lz, rt, rb, h, segs) {
        const wpt = toW(lx, lz);
        m4.makeRotationY(lm.ry).setPosition(wpt[0], lm.y + ly + 0.5 * h, wpt[1]);
        pushB(matName, DRUM_DRAW.bakeGeo(new THREE.CylinderGeometry(rt, rb, h, segs == null ? 14 : segs), m4));
      },
      dome: function (matName, lx, ly, lz, r, h, segs, invert) {
        const wpt = toW(lx, lz);
        const g = new THREE.SphereGeometry(r, segs == null ? 16 : segs, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
        g.scale(1, (invert ? -1 : 1) * (h / r), 1);
        m4.makeRotationY(lm.ry).setPosition(wpt[0], lm.y + ly, wpt[1]);
        pushB(matName, DRUM_DRAW.bakeGeo(g, m4));
      },
      dia: function (lx, ly, lz, sz, ryLocal) {
        const wpt = toW(lx, lz);
        eu.set(0, lm.ry + (ryLocal == null ? 0 : ryLocal), 0.25 * Math.PI);
        q.setFromEuler(eu);
        v3.set(wpt[0], lm.y + ly, wpt[1]);
        m4.compose(v3, q, s1);
        pushB('gold', DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(sz, sz, 0.42), m4));
      },
      // Recessed kit-grade window bay on local face ('+z', '-z', '+x', '-x') with stone sill, jambs, hood/pediment, glazing & mullions!
      win: function (lx, ly, lz, w, h, face, lit, nMull, hoodMat) {
        const isZ = (face === '+z' || face === '-z');
        const dir = (face === '+z' || face === '+x') ? 1 : -1;
        const ryL = isZ ? 0 : 0.5 * Math.PI;
        const nx = isZ ? 0 : dir, nz = isZ ? dir : 0;
        const paneMat = lit ? 'windowLit' : 'windowPane';
        const frameMat = hoodMat || 'ancientStone';
        // Projecting stone sill + side jambs + lintel hood
        F.box('ancientStone', lx + nx * 0.16, ly - 0.16, lz + nz * 0.16, w + 0.44, 0.18, 0.42, ryL);
        F.box(frameMat, lx + nx * 0.18, ly + h, lz + nz * 0.18, w + 0.52, 0.28, 0.46, ryL);
        if (hoodMat === 'porphyry') {
          F.box('gold', lx + nx * 0.22, ly + h + 0.28, lz + nz * 0.22, w * 0.55, 0.16, 0.36, ryL);
        }
        const tx = isZ ? 1 : 0, tz = isZ ? 0 : 1;
        for (let s = -1; s <= 1; s += 2) {
          F.box('ancientDark', lx + s * (0.5 * w + 0.11) * tx + nx * 0.10, ly, lz - s * (0.5 * w + 0.11) * tz + nz * 0.10, 0.22, h, 0.30, ryL);
        }
        // Glazing plane Proud of wall surface by +6cm so never Z-fighting with masonry wall!
        F.box(paneMat, lx + nx * 0.07, ly + 0.02, lz + nz * 0.07, w, h - 0.02, 0.10, ryL);
        // Vertical mullions + horizontal transoms
        const cols = nMull == null ? 2 : nMull;
        for (let m = 1; m < cols; m++) {
          const off = -0.5 * w + (w * m) / cols;
          F.box('tankSteel', lx + off * tx + nx * 0.12, ly + 0.02, lz - off * tz + nz * 0.12, 0.09, h - 0.02, 0.12, ryL);
        }
        const rows = h >= 2.4 ? 2 : 1;
        for (let r = 1; r <= rows; r++) {
          const hy = ly + (h * r) / (rows + 1);
          F.box('tankSteel', lx + nx * 0.12, hy, lz + nz * 0.12, w, 0.08, 0.12, ryL);
        }
      },
      // Rhythmic exterior buttress pilasters along 'x' or 'z'
      pilasters: function (axis, a0, a1, fixed, ly, h, count, matName, capMat) {
        for (let i = 0; i <= count; i++) {
          const pos = a0 + ((a1 - a0) * i) / count;
          const lx = axis === 'x' ? pos : fixed;
          const lz = axis === 'x' ? fixed : pos;
          F.box(matName || 'ancientDark', lx, ly, lz, 0.78, h, 0.78);
          F.box(capMat || 'ancientStone', lx, ly + h - 0.32, lz, 0.98, 0.34, 0.98);
        }
      },
      // Crenellated parapet merlons + underside machicolation corbels along 'x' or 'z'
      merlons: function (axis, a0, a1, fixed, ly, step, merlonMat, corbelMat) {
        const span = a1 - a0;
        const n = Math.max(2, Math.floor(span / step));
        const ryL = axis === 'x' ? 0 : 0.5 * Math.PI;
        for (let i = 0; i < n; i++) {
          const pos = a0 + ((i + 0.5) * span) / n;
          const lx = axis === 'x' ? pos : fixed;
          const lz = axis === 'x' ? fixed : pos;
          F.box(corbelMat || 'ancientDark', lx, ly - 0.38, lz, step * 0.36, 0.38, 1.35, ryL);
          F.box(merlonMat || 'basalt', lx, ly, lz, step * 0.56, 1.08, 0.92, ryL);
        }
      },
      // True pitched gable roof (two sloped roofDeck plates + ridge beam + gable end pediments)
      gableRoof: function (lx, ly, lz, w, d, rise, ridgeAlongZ, roofMat, gableMat) {
        const rMat = roofMat || 'roofDeck';
        const gMat = gableMat || 'ashStone';
        if (ridgeAlongZ) {
          const halfSpan = 0.5 * w + 0.45;
          const slopeLen = Math.hypot(halfSpan, rise);
          const tilt = Math.atan2(rise, halfSpan);
          F.box(rMat, lx - 0.5 * halfSpan, ly + 0.5 * rise, lz, slopeLen, 0.24, d + 0.8, 0, tilt, 0);
          F.box(rMat, lx + 0.5 * halfSpan, ly + 0.5 * rise, lz, slopeLen, 0.24, d + 0.8, 0, -tilt, 0);
          F.box('bronze', lx, ly + rise - 0.05, lz, 0.42, 0.28, d + 0.9, 0);
          for (let s = -1; s <= 1; s += 2) {
            F.box(gMat, lx, ly, lz + s * (0.5 * d - 0.22), w * 0.68, rise * 0.58, 0.44, 0);
          }
        } else {
          const halfSpan = 0.5 * d + 0.45;
          const slopeLen = Math.hypot(halfSpan, rise);
          const tilt = Math.atan2(rise, halfSpan);
          F.box(rMat, lx, ly + 0.5 * rise, lz - 0.5 * halfSpan, w + 0.8, 0.24, slopeLen, 0, 0, -tilt);
          F.box(rMat, lx, ly + 0.5 * rise, lz + 0.5 * halfSpan, w + 0.8, 0.24, slopeLen, 0, 0, tilt);
          F.box('bronze', lx, ly + rise - 0.05, lz, w + 0.9, 0.28, 0.42, 0);
          for (let s = -1; s <= 1; s += 2) {
            F.box(gMat, lx + s * (0.5 * w - 0.22), ly, lz, 0.44, rise * 0.58, d * 0.68, 0);
          }
        }
      },
      planter: function (lx, ly, lz, r, species, scale) {
        F.cyl('porphyry', lx, ly, lz, r, r + 0.22, 0.78, 12);
        F.cyl('cityEarth', lx, ly + 0.58, lz, r - 0.28, r - 0.28, 0.22, 12);
        const wpt = toW(lx, lz);
        landmarkPlanters.push({ x: wpt[0], y: lm.y + ly + 0.80, z: wpt[1], species: species, scale: scale == null ? 0.68 : scale });
      }
    };
    return F;
  }

  // 1. Emit all multi-storey slabs (with ceilingSoffit undersides on F0/F1/F2!), dogleg stairs/ramps, and room walls for the 3 hero landmarks
  for (let li = 0; li < DRUM_STAGE4.landmarks.length; li++) {
    const B = DRUM_STAGE4.landmarks[li];
    for (let si = 0; si < B.slabs.length; si++) {
      const sl = B.slabs[si];
      const soffit = (sl.storey >= 1) ? buckets.ceilingSoffit : null;
      pushB(sl.mat, DRUM_DRAW.slabPolyGeo(sl.pts, sl.thick, soffit));
    }
    for (let sti = 0; sti < B.stairs.length; sti++) {
      const st = B.stairs[sti];
      pushB(st.mat, DRUM_DRAW.stripRampGeo(st.a, st.b, st.w));
    }
    for (let wi = 0; wi < B.walls.length; wi++) {
      const w = B.walls[wi];
      addWorldBox(w.mat, w.x, w.y, w.z, w.w, w.h, w.d, w.ry, 0);
    }
  }

  // 2. PRAETORIUM OF THE MILITARY GOVERNOR (Garrison Fortress — 72 Recessed Windows + Kit-Grade Keep, Wings & Bailey)
  {
    const lm = DRUM_STAGE4.garrison.lm;
    const F = frameOf(lm);

    // Grounded battered basalt talus skirt around all 4 curtain walls (y = -0.35..+1.55m) + stringcourses
    F.box('ancientDark', 0, -0.35, -50.1, 84.4, 1.9, 1.4);
    F.box('ancientDark', -24.5, -0.35, 50.1, 35.4, 1.9, 1.4);
    F.box('ancientDark', 24.5, -0.35, 50.1, 35.4, 1.9, 1.4);
    F.box('ancientDark', -42.1, -0.35, 0, 1.4, 1.9, 100.4);
    F.box('ancientDark', 42.1, -0.35, 0, 1.4, 1.9, 100.4);

    // Exterior buttress pilasters & crenellated machicolation merlons around the F0/F1 curtain ramparts (y = 9.5m)
    F.pilasters('x', -36, 36, -50.2, 0.0, 10.2, 8, 'basalt', 'ancientStone');
    F.pilasters('z', -42, 42, -42.2, 0.0, 9.4, 8, 'basalt', 'ancientStone');
    F.pilasters('z', -42, 42, 42.2, 0.0, 9.4, 8, 'basalt', 'ancientStone');
    F.merlons('x', -38, -11, 49.9, 9.5, 3.8, 'basalt', 'ancientDark');
    F.merlons('x', 11, 38, 49.9, 9.5, 3.8, 'basalt', 'ancientDark');
    F.merlons('x', -38, 38, -49.9, 10.5, 3.8, 'basalt', 'ancientDark');
    F.merlons('z', -45, 45, -41.9, 9.5, 4.0, 'basalt', 'ancientDark');
    F.merlons('z', -45, 45, 41.9, 9.5, 4.0, 'basalt', 'ancientDark');

    // 4 Corner Riveted Tank-Head Bastion Towers (grounded at y=-0.35m, steel hoop bands, gun-slits & bronze domes)
    const corners = [[-41, -49], [41, -49], [-41, 49], [41, 49]];
    for (let k = 0; k < 4; k++) {
      const cx = corners[k][0], cz = corners[k][1];
      F.cyl('basalt', cx, -0.35, cz, 6.5, 7.6, 5.85, 16);
      F.cyl('tankSteel', cx, 5.5, cz, 6.1, 6.1, 5.0, 16);
      F.cyl('rustPlate', cx, 7.1, cz, 6.32, 6.32, 0.34, 16);
      F.cyl('rustPlate', cx, 9.4, cz, 6.32, 6.32, 0.34, 16);
      F.dome('bronze', cx, 10.5, cz, 6.2, 3.0, 16, false);
      F.cyl('gold', cx, 13.4, cz, 0.25, 0.55, 1.5, 8);
      // Bastion observation windows
      F.win(cx + (cx < 0 ? -5.9 : 5.9), 7.55, cz, 1.35, 1.55, cx < 0 ? '-x' : '+x', true, 2, 'rustPlate');
      F.win(cx, 7.55, cz + (cz < 0 ? -5.9 : 5.9), 1.35, 1.55, cz < 0 ? '-z' : '+z', k % 2 === 0, 2, 'rustPlate');
    }

    // Gatehouse of the Purple Diamond (+z = 49): twin towers, pitched roofs, guard windows, portcullis hood & seal
    for (let s = -1; s <= 1; s += 2) {
      F.box('basalt', s * 8.4, -0.35, 50.8, 5.8, 14.2, 6.6);
      F.gableRoof(s * 8.4, 13.85, 50.8, 6.0, 6.8, 2.1, true, 'roofDeck', 'basalt');
      F.win(s * 8.4, 6.4, 54.12, 1.8, 2.4, '+z', true, 2, 'porphyry');
      F.win(s * 8.4, 10.2, 54.12, 1.6, 1.9, '+z', false, 2, 'ancientStone');
    }
    F.box('basalt', 0, 7.6, 51.2, 11.4, 4.6, 4.8);
    F.gableRoof(0, 12.2, 51.2, 11.6, 5.0, 1.6, false, 'roofDeck', 'basalt');
    F.win(-2.6, 8.6, 53.62, 1.8, 2.0, '+z', true, 2, 'porphyry');
    F.win(2.6, 8.6, 53.62, 1.8, 2.0, '+z', true, 2, 'porphyry');
    F.box('porphyry', 0, 5.2, 52.5, 7.2, 2.2, 0.38);
    F.dia(0, 6.3, 52.8, 2.0);

    // --- PRAETORIUM FENESTRATION PASS (60+ Multi-Storey Windows Across All 4 Faces & Courtyard!) ---
    // F0 Exterior Windows (y = 2.0m): West Levy/Barracks (lx=-42.3), East Armoury/Mess (lx=+42.3), Rear Tribunal (lz=-50.3), Front Curtain (lz=+50.3)
    const zF0 = [-36, -24, -12, 0, 18, 30];
    for (let i = 0; i < zF0.length; i++) {
      F.win(-42.32, 2.1, zF0[i], 2.1, 2.5, '-x', i % 2 === 0, 2, 'ancientStone');
      F.win(42.32, 2.1, zF0[i], 2.1, 2.5, '+x', i % 2 === 1, 2, 'ancientStone');
    }
    const xRearF0 = [-30, -19, -9, 9, 19, 30];
    for (let i = 0; i < xRearF0.length; i++) {
      F.win(xRearF0[i], 2.2, -50.32, 2.2, 3.1, '-z', true, 2, 'porphyry');
    }
    const xFrontF0 = [-30, -19, 19, 30];
    for (let i = 0; i < xFrontF0.length; i++) {
      F.win(xFrontF0[i], 2.2, 50.32, 2.0, 2.5, '+z', i % 2 === 0, 2, 'ancientStone');
    }

    // F0 Muster Bailey Courtyard Windows + Covered Timber/Corrugated Colonnade Porches!
    const zCourt = [-2, 8, 17, 31, 38];
    for (let i = 0; i < zCourt.length; i++) {
      F.win(-21.65, 1.85, zCourt[i], 2.2, 2.4, '+x', true, 3, 'ancientStone');
      F.win(21.65, 1.85, zCourt[i], 2.2, 2.4, '-x', true, 3, 'ancientStone');
    }
    // Bailey covered colonnade walkways flanking West Levy Hall & East Mess/Armoury
    for (let s = -1; s <= 1; s += 2) {
      F.box('roofDeck', s * 19.6, 4.35, 16.0, 4.4, 0.22, 50.0, 0, -s * 0.16, 0);
      for (let cz = -6; cz <= 38; cz += 8.8) {
        F.box('ancientStone', s * 17.8, 0.0, cz, 0.58, 4.15, 0.58);
      }
    }
    // F0 Tribunal Facade facing the Muster Bailey (lz = -9.45) + 2-Storey Columned Imperial Balcony Portico!
    const xTrib = [-31, -18, -9, 9, 18, 31];
    for (let i = 0; i < xTrib.length; i++) {
      F.win(xTrib[i], 1.75, -9.42, 2.5, 2.8, '+z', true, 3, 'porphyry');
    }
    // 2-Storey Columned Portico & Balustraded Balconies outside F1 War-Room Door (y=5.5m) & F2 Governor's Terrace Door (y=10.5m)
    F.box('floorTile', 0, 5.18, -7.2, 11.6, 0.34, 4.8);
    F.box('porphyry', 0, 5.52, -4.95, 11.6, 1.05, 0.36);
    F.box('porphyry', -5.6, 5.52, -7.2, 0.36, 1.05, 4.8);
    F.box('porphyry', 5.6, 5.52, -7.2, 0.36, 1.05, 4.8);
    F.box('floorTile', 0, 10.18, -6.2, 9.6, 0.34, 3.8);
    F.box('porphyry', 0, 10.52, -4.45, 9.6, 1.05, 0.36);
    F.box('porphyry', -4.6, 10.52, -6.2, 0.36, 1.05, 3.8);
    F.box('porphyry', 4.6, 10.52, -6.2, 0.36, 1.05, 3.8);
    F.dia(0, 6.05, -4.70, 1.15);
    F.dia(0, 11.05, -4.20, 1.05);
    for (let px = -4.4; px <= 4.4; px += 8.8) {
      F.cyl('ancientStone', px, 0.0, -5.2, 0.48, 0.56, 5.2, 10);
      F.cyl('ancientStone', px * 0.85, 5.52, -5.2, 0.40, 0.46, 4.7, 10);
    }

    // F1 Praetorium Keep Grand State Windows (y = 6.35m: War Room, State Dining Hall & Sun Chapel)
    // Rear Keep wall at lz = -50.3, Bailey Keep wall at lz = -9.6, West/East Keep walls at lx = +-42.3
    const xKeepRear = [-31, -21, -11, 0, 11, 21, 31];
    for (let i = 0; i < xKeepRear.length; i++) {
      F.win(xKeepRear[i], 6.25, -50.32, 2.8, 3.1, '-z', true, 3, 'porphyry');
    }
    const xKeepFront = [-30, -19, -9, 9, 19, 30];
    for (let i = 0; i < xKeepFront.length; i++) {
      F.win(xKeepFront[i], 6.25, -9.55, 2.7, 2.9, '+z', true, 3, 'porphyry');
    }
    const zKeepSide = [-40, -31, -22, -14];
    for (let i = 0; i < zKeepSide.length; i++) {
      F.win(-42.32, 6.25, zKeepSide[i], 2.5, 2.9, '-x', i !== 2, 3, 'porphyry');
      F.win(42.32, 6.25, zKeepSide[i], 2.5, 2.9, '+x', true, 3, 'porphyry');
    }
    // Pitched standing-seam roofs over the outer F1 Keep wings (lx = -40..-24 and +24..+40)
    F.gableRoof(-32.0, 10.45, -29.0, 15.6, 37.5, 2.8, true, 'roofDeck', 'ashStone');
    F.gableRoof(32.0, 10.45, -29.0, 15.6, 37.5, 2.8, true, 'roofDeck', 'ashStone');

    // F2 Governor's Residence & Cipher Suite Panoramic Loggia Windows (y = 11.25m, lx = -24..24, lz = -44..-8)
    const xGovRear = [-17, -8.5, 0, 8.5, 17];
    for (let i = 0; i < xGovRear.length; i++) {
      F.win(xGovRear[i], 11.25, -44.42, 2.8, 2.85, '-z', true, 3, 'porphyry');
    }
    const xGovFront = [-17, -9, 9, 17];
    for (let i = 0; i < xGovFront.length; i++) {
      F.win(xGovFront[i], 11.25, -7.58, 2.6, 2.85, '+z', true, 3, 'porphyry');
    }
    const zGovSide = [-37, -26, -15];
    for (let i = 0; i < zGovSide.length; i++) {
      F.win(-24.42, 11.25, zGovSide[i], 2.8, 2.85, '-x', true, 3, 'porphyry');
      F.win(24.42, 11.25, zGovSide[i], 2.8, 2.85, '+x', true, 3, 'porphyry');
    }
    // Pitched Imperial Roof + Clerestory Ridge Lantern + Masonry Chimneys crowning F2 Governor's Residence (y = 15.25m)
    F.gableRoof(0, 15.25, -26.0, 49.6, 37.6, 3.8, false, 'roofDeck', 'ancientStone');
    F.box('porphyry', 0, 18.6, -26.0, 22.0, 1.35, 4.2);
    F.gableRoof(0, 19.95, -26.0, 22.8, 4.6, 1.1, false, 'verdigris', 'porphyry');
    F.box('basalt', -19.0, 15.25, -39.0, 1.8, 5.2, 1.8);
    F.box('basalt', 19.0, 15.25, -14.0, 1.8, 5.2, 1.8);

    // F0 Tribunal Dais, F1 War-Room 3D Drum Scale Model, F2 Signal Heliograph Drum & 2 Courtyard SWBAY Tree Planters!
    F.box('basalt', 0, 0.0, -41.0, 12.0, 0.6, 7.0);
    F.box('porphyry', 0, 1.2, -47.2, 7.5, 3.8, 0.35);
    F.dia(0, 3.2, -46.9, 1.5);
    F.box('warmGlow', -10, 4.6, -26, 2.8, 0.22, 0.6);
    F.box('warmGlow', 10, 4.6, -26, 2.8, 0.22, 0.6);
    F.box('tankSteel', -2, 5.5, -21, 5.4, 0.85, 5.4);
    F.box('sand', -2, 6.35, -21, 4.8, 0.14, 4.8);
    F.cyl('ancientStone', -2, 6.49, -21, 0.65, 0.85, 0.9, 12);
    F.cyl('tankSteel', -17, 10.5, -36, 4.2, 4.6, 9.2, 14);
    F.dome('verdigris', -17, 19.7, -36, 4.3, 2.2, 14, false);
    F.box('gold', -17, 22.1, -36, 2.2, 1.6, 0.28, 0.4);
    // Socketed Muster Bailey Courtyard Planters for SWBAY trees!
    F.planter(-10.5, 0.02, 18.0, 3.1, 'cherry', 0.68);
    F.planter(10.5, 0.02, 18.0, 3.1, 'dragon', 0.65);
  }

  // 3. ORDINATOR FORTRESS (Inquisition & Watch Bastion — Lancet Windows, Cloister Colonnade, Dish-Cradle & Watch Drums)
  {
    const lm = DRUM_STAGE4.ordinator.lm;
    const F = frameOf(lm);

    // Battered basalt talus skirt + buttress pilasters + machicolated parapet merlons (y = 10.0m)
    F.box('basalt', 0, -0.35, -36.0, 64.4, 2.1, 1.5);
    F.box('basalt', -19.0, -0.35, 36.0, 26.4, 2.1, 1.5);
    F.box('basalt', 19.0, -0.35, 36.0, 26.4, 2.1, 1.5);
    F.box('basalt', -32.0, -0.35, 0, 1.5, 2.1, 72.4);
    F.box('basalt', 32.0, -0.35, 0, 1.5, 2.1, 72.4);
    F.pilasters('x', -26, 26, -36.2, 0.0, 9.8, 6, 'ancientDark', 'porphyry');
    F.pilasters('z', -28, 28, -32.2, 0.0, 9.8, 6, 'ancientDark', 'porphyry');
    F.pilasters('z', -28, 28, 32.2, 0.0, 9.8, 6, 'ancientDark', 'porphyry');
    F.merlons('x', -27, 27, -35.8, 10.0, 3.6, 'basalt', 'porphyry');
    F.merlons('x', -27, -9, 35.8, 10.0, 3.6, 'basalt', 'porphyry');
    F.merlons('x', 9, 27, 35.8, 10.0, 3.6, 'basalt', 'porphyry');
    F.merlons('z', -31, 31, -31.8, 10.0, 3.6, 'basalt', 'porphyry');
    F.merlons('z', -31, 31, 31.8, 10.0, 3.6, 'basalt', 'porphyry');

    // 4 Riveted Iron Corner Bastions + observation slits + bronze caps
    const corners = [[-31, -35], [31, -35], [-31, 35], [31, 35]];
    for (let k = 0; k < 4; k++) {
      const cx = corners[k][0], cz = corners[k][1];
      F.cyl('basalt', cx, -0.35, cz, 5.8, 6.6, 3.4, 14);
      F.cyl('tankSteel', cx, 3.05, cz, 5.4, 5.7, 7.6, 14);
      F.cyl('rustPlate', cx, 6.8, cz, 5.62, 5.62, 0.32, 14);
      F.dome('bronze', cx, 10.65, cz, 5.55, 2.5, 14, false);
      F.win(cx + (cx < 0 ? -5.3 : 5.3), 7.4, cz, 0.95, 1.85, cx < 0 ? '-x' : '+x', true, 1, 'porphyry');
    }

    // Iron-Drum Gatehouse (+z = 35): twin basalt towers, pitched iron roofs, inquisitorial lancets & Gold Sun-Diamond
    for (let s = -1; s <= 1; s += 2) {
      F.box('basalt', s * 7.0, -0.35, 36.4, 4.8, 13.2, 5.8);
      F.gableRoof(s * 7.0, 12.85, 36.4, 5.0, 6.0, 1.9, true, 'roofDeck', 'basalt');
      F.win(s * 7.0, 6.8, 39.32, 1.2, 2.4, '+z', true, 1, 'porphyry');
    }
    F.box('porphyry', 0, 6.2, 37.8, 9.4, 3.6, 3.6);
    F.gableRoof(0, 9.8, 37.8, 9.8, 4.0, 1.4, false, 'roofDeck', 'porphyry');
    F.dia(0, 8.0, 39.7, 2.0);

    // 26 Narrow Barred Inquisitorial Lancet Windows across F0 & F1 Hall of the Rolls (13,500 Dossiers)
    const zOrd = [-26, -16, -6, 6, 16, 25];
    for (let i = 0; i < zOrd.length; i++) {
      F.win(-32.22, 6.3, zOrd[i], 1.25, 2.75, '-x', i % 2 === 0, 1, 'porphyry');
      F.win(32.22, 6.3, zOrd[i], 1.25, 2.75, '+x', true, 1, 'porphyry');
      if (i >= 2) {
        F.win(-32.22, 2.1, zOrd[i], 1.05, 2.1, '-x', false, 1, 'ancientDark');
        F.win(32.22, 2.1, zOrd[i], 1.05, 2.1, '+x', i === 3, 1, 'ancientDark');
      }
    }
    const xOrdRear = [-21, -11, 0, 11, 21];
    for (let i = 0; i < xOrdRear.length; i++) {
      F.win(xOrdRear[i], 6.3, -36.22, 1.35, 2.85, '-z', true, 1, 'porphyry');
    }

    // F0 Cloister of Ash Colonnade Arcade around the Eternal Sun-Brazier (lx=-15..15, lz=2..26)
    F.cyl('basalt', 0, 0.0, 14.0, 2.3, 2.9, 1.2, 12);
    F.cyl('gold', 0, 1.2, 14.0, 1.75, 1.25, 0.58, 12);
    F.box('warmGlow', 0, 1.78, 14.0, 1.45, 0.72, 1.45);
    for (let s = -1; s <= 1; s += 2) {
      F.box('roofDeck', s * 13.8, 4.25, 13.0, 3.6, 0.20, 34.0, 0, -s * 0.15, 0);
      for (let cz = -2; cz <= 26; cz += 7.0) {
        F.box('porphyry', s * 12.2, 0.0, cz, 0.52, 4.1, 0.52);
      }
    }

    // F1 Pitched Scriptorium Roof (front half lz = 4..33) + Steel Lattice Cradle under Gilded Parabolic Sun-Dish (lz = -21)
    F.gableRoof(0, 10.35, 19.0, 58.0, 27.0, 3.2, false, 'roofDeck', 'ashStone');
    for (let r = 0; r < 8; r++) {
      const ra = (r * Math.PI) / 4;
      F.box('tankSteel', 8.2 * Math.cos(ra), 5.5, -21.0 + 8.2 * Math.sin(ra), 0.75, 5.0, 1.4, -ra);
    }
    F.cyl('basalt', 0, 9.4, -21.0, 10.9, 11.2, 0.95, 20);
    F.dome('gold', 0, 10.35, -21.0, 10.6, 3.9, 20, false);
    F.cyl('bronze', 0, 14.25, -21.0, 2.4, 1.6, 1.15, 14);
    F.cyl('gold', 0, 15.4, -21.0, 0.18, 0.35, 3.2, 8); // Focal solar receiver spike!

    // F2 Twin High-Watch Steel Drums (catwalk collar + observation windows + brass spyglasses aimed at Drum Arcology)
    for (let s = -1; s <= 1; s += 2) {
      F.cyl('tankSteel', s * 14, 10.5, -8.0, 4.2, 4.5, 5.4, 14);
      F.cyl('rustPlate', s * 14, 13.4, -8.0, 5.1, 5.1, 0.24, 14);
      F.dome('verdigris', s * 14, 15.9, -8.0, 4.35, 1.9, 14, false);
      F.win(s * 14, 13.8, -3.75, 1.5, 1.2, '+z', true, 2, 'bronze');
      F.box('bronze', s * 14, 13.9, -2.8, 0.32, 0.32, 2.6);
    }
  }

  // 4. THE CAULDRON (Post-Apoc Gladiatorial Arena — 28 I-Beam Ribs, Vaulted Vomitoria, Gallery Roofs & Rigged Velarium)
  {
    const lm = DRUM_STAGE4.arena.lm;
    const F = frameOf(lm);
    // F-1 Hypogeum Central Counterweight Pit-Lift Platform & 4 Guide Columns
    F.cyl('timber', 0, -2.4, 0, 5.8, 5.8, 0.45, 16);
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        F.box('tankSteel', sx * 4.4, -4.5, sz * 4.4, 0.44, 4.5, 0.44);
      }
    }

    // 28-segment Elliptical Split-Tank Shell, Exterior I-Beam Buttress Ribs, Corrugated Gallery Canopy & Stepped Bleachers
    const N = 28;
    for (let i = 0; i < N; i++) {
      const a0 = (2 * Math.PI * i) / N;
      const ca = Math.cos(a0), sa = Math.sin(a0);
      const isGate = Math.abs(sa) < 0.24;
      const yaw = -a0 + 0.5 * Math.PI;
      if (!isGate) {
        // Grounded stone plinth shoe under outer arena shell (y = -0.35..+1.35m)
        F.box('basalt', 43.4 * ca, -0.35, 37.0 * sa, 9.8, 1.7, 2.5, yaw);
        // 3.5m Rusted Clarifier Pit Wall + spiked iron safety grille around Blood-Sand Ellipse
        F.box('rustPlate', 21.5 * ca, 0.0, 16.5 * sa, 6.2, 3.4, 0.85, yaw);
        F.box('tankSteel', 21.5 * ca, 3.4, 16.5 * sa, 6.2, 0.65, 0.16, yaw);
        // 4-Tier Split-Tank & Timber Bleacher Bowl (F0 -> F1)
        for (let t = 0; t < 4; t++) {
          const rx = 25.5 + t * 3.6, rz = 20.2 + t * 3.0;
          F.box(t % 2 === 0 ? 'timber' : 'tankSteel', rx * ca, 1.0 + t * 1.65, rz * sa, 7.4, 1.55, 2.8, yaw);
        }
        // Outer Riveted Tank-Stave & Shipping Container Shell + Exterior Vertical Steel I-Beam Rib + Hoop Bands + Gallery Windows!
        F.box(i % 2 === 0 ? 'tankSteel' : 'rustPlate', 43.2 * ca, 1.35, 36.8 * sa, 9.4, 12.65, 1.8, yaw);
        F.box('ancientDark', 44.5 * ca, -0.35, 37.9 * sa, 0.85, 14.6, 1.15, yaw);
        F.box('rustPlate', 44.2 * ca, 5.4, 37.6 * sa, 9.6, 0.42, 0.55, yaw);
        F.box('tankSteel', 44.2 * ca, 10.2, 37.6 * sa, 9.6, 0.42, 0.55, yaw);
        // Upper concourse arcade window on every segment
        F.box(i % 3 === 0 ? 'windowLit' : 'windowPane', 44.15 * ca, 7.1, 37.55 * sa, 2.8, 2.1, 0.22, yaw);
        // Sloped corrugated roofDeck spectator canopy sheltering the top bleacher ring!
        F.box('roofDeck', 39.2 * ca, 13.85, 33.2 * sa, 9.8, 0.24, 8.6, yaw, 0, -0.14);
      }
      // 8 Tall Girder Shade-Sail Masts + Rigging Cables + Canvas Velarium Ribbons converging on Central Tension Ring!
      if (i % 4 === 1) {
        F.box('tankSteel', 44.2 * ca, -0.35, 37.5 * sa, 1.25, 19.2, 1.25, yaw);
        F.box('canvas', 29.5 * ca, 15.6, 24.8 * sa, 6.8, 0.20, 21.0, yaw);
        F.box('tankSteel', 24.0 * ca, 16.5, 20.0 * sa, 0.16, 0.16, 36.0, yaw);
        F.box('warmGlow', 39.0 * ca, 14.4, 33.0 * sa, 1.5, 0.65, 0.65, yaw);
      }
    }

    // Vaulted Vomitoria Gatehouses: West Gate of the Sun (lx = -43) & East Gate of Ash (lx = +43)
    for (let s = -1; s <= 1; s += 2) {
      const gx = s * 42.8;
      F.box('basalt', gx, -0.35, -6.2, 6.4, 12.8, 4.4);
      F.box('basalt', gx, -0.35, 6.2, 6.4, 12.8, 4.4);
      F.box('porphyry', gx, 7.8, 0, 6.0, 4.2, 16.8);
      F.gableRoof(gx, 12.0, 0, 6.6, 17.2, 2.0, true, 'roofDeck', 'porphyry');
      F.dia(gx + s * 3.2, 9.9, 0, 1.8, 0.5 * Math.PI);
      F.box('warmGlow', gx + s * 3.1, 12.6, -6.2, 1.1, 0.85, 1.1);
      F.box('warmGlow', gx + s * 3.1, 12.6, 6.2, 1.1, 0.85, 1.1);
    }

    // Overhead Thunder-Grid Steel Tension Ring, Cross-Gantry & Suspended Iron Cage
    F.cyl('tankSteel', 0, 16.4, 0, 8.6, 8.6, 0.75, 16);
    F.box('tankSteel', 0, 16.6, 0, 60.0, 0.95, 1.2);
    F.box('tankSteel', 0, 16.6, 0, 1.2, 0.95, 48.0);
    F.cyl('rustPlate', 0, 12.2, 0, 3.4, 3.4, 3.8, 10);

    // Colonnaded Governor's Tank-Head Box (+z = 31 on F1) & Guild Container Loggia (-z = -31 on F1)
    F.box('porphyry', 0, 5.5, 35.4, 16.4, 6.2, 1.2);
    for (let bx = -6; bx <= 6; bx += 4) {
      F.box('gold', bx, 5.5, 29.2, 0.48, 5.6, 0.48);
      if (bx !== 6) F.win(bx + 2.0, 6.8, 36.05, 2.2, 2.4, '+z', true, 2, 'porphyry');
    }
    F.dome('bronze', 0, 11.7, 32.0, 8.4, 3.1, 16, false);
    F.dia(0, 9.6, 36.2, 2.0);

    F.box('rustPlate', 0, 5.5, -35.4, 16.0, 5.2, 1.2);
    F.gableRoof(0, 10.7, -32.2, 16.8, 7.6, 1.6, false, 'roofDeck', 'rustPlate');
    for (let gx = -5; gx <= 5; gx += 5) {
      F.win(gx, 6.7, -36.05, 2.4, 2.1, '-z', true, 2, 'tankSteel');
    }
  }

  // 5.KIT-GRADE SECONDARY LANDMARKS (Assay Rotunda, Voth Customs Hall, Quarry Sawtooth Foundry, Drim Rivrh Sluice Wharf)
  function findLm(id) {
    for (let i = 0; i < DRUM_PLAN.landmarks.length; i++) {
      if (DRUM_PLAN.landmarks[i].id === id) return DRUM_PLAN.landmarks[i];
    }
    return null;
  }

  // 5a. Scrap-Market Assay Rotunda (Grounded octagonal plinth, 16 pilasters, 12 clerestory windows, portico & cupola!)
  const bourse = findLm('scrap_market_rotunda');
  if (bourse) {
    const F = frameOf(bourse);
    F.cyl('basalt', 0, -0.35, 0, 14.4, 15.2, 0.95, 16);
    F.cyl('ashStone', 0, 0.60, 0, 12.4, 13.0, 7.0, 16);
    F.cyl('ancientDark', 0, 7.35, 0, 13.1, 12.6, 0.55, 16);
    for (let i = 0; i < 16; i++) {
      const a = (2 * Math.PI * i) / 16;
      const ca = Math.cos(a), sa = Math.sin(a);
      if (sa > 0.75) continue; // Entry portico side
      F.box('ancientDark', 12.85 * ca, 0.60, 12.85 * sa, 0.85, 6.8, 0.85, -a);
      if (i % 2 === 0) {
        F.box('windowLit', 12.55 * ca, 2.6, 12.55 * sa, 1.8, 2.8, 0.22, -a + 0.5 * Math.PI);
      }
    }
    // Steel clerestory tambour + 12 illuminated assay lantern windows + ribbed verdigris dome & cupola
    F.cyl('tankSteel', 0, 7.90, 0, 10.9, 11.6, 3.1, 16);
    for (let w = 0; w < 12; w++) {
      const wa = (2 * Math.PI * w) / 12;
      F.box('windowLit', 11.3 * Math.cos(wa), 8.55, 11.3 * Math.sin(wa), 2.1, 1.7, 0.24, -wa + 0.5 * Math.PI);
    }
    F.dome('verdigris', 0, 11.0, 0, 11.2, 3.4, 16, false);
    F.cyl('bronze', 0, 14.2, 0, 2.5, 2.7, 2.1, 12);
    F.dome('gold', 0, 16.3, 0, 2.6, 1.2, 12, false);
    // Colonnaded Assay Portico (+z) with pitched roofDeck pediment & hanging brass scale beam
    F.box('basalt', 0, -0.35, 13.8, 12.4, 0.95, 6.4);
    for (let px = -4.8; px <= 4.8; px += 3.2) {
      F.cyl('ancientStone', px, 0.60, 16.2, 0.48, 0.56, 6.6, 10);
    }
    F.box('tankSteel', 0, 7.20, 13.6, 11.6, 1.4, 5.8);
    F.gableRoof(0, 8.60, 13.6, 12.0, 6.2, 2.0, true, 'roofDeck', 'porphyry');
    F.dia(0, 9.5, 16.9, 1.6);
    F.planter(-9.5, 0.02, 16.5, 2.4, 'thorn', 0.58);
    F.planter(9.5, 0.02, 16.5, 2.4, 'dragon', 0.58);
  }

  // 5b. Vothic Customs & Tribute Market Hall (Stepped basalt podium, 6-bay colonnade, 16 windows, twin bronze domes & side roofs)
  const vmarket = findLm('scrap_market_voth_hall');
  if (vmarket) {
    const F = frameOf(vmarket);
    F.box('basalt', 0, -0.35, 0, 28.4, 1.05, 25.4);
    F.box('basalt', 0, 0.70, 0, 25.2, 4.2, 22.0);
    F.box('ancientStone', 0, 4.90, 0, 25.6, 3.6, 22.4);
    F.pilasters('x', -11.5, 11.5, -11.3, 0.70, 7.8, 5, 'ancientDark', 'porphyry');
    F.pilasters('z', -9.5, 9.5, -12.9, 0.70, 7.8, 4, 'ancientDark', 'porphyry');
    F.pilasters('z', -9.5, 9.5, 12.9, 0.70, 7.8, 4, 'ancientDark', 'porphyry');
    // Front (+z) covered Vothic colonnade porch
    F.box('roofDeck', 0, 4.55, 12.6, 25.6, 0.24, 3.6, 0, 0, 0.16);
    for (let cx = -11.0; cx <= 11.0; cx += 4.4) {
      F.box('porphyry', cx, 0.70, 13.8, 0.62, 3.85, 0.62);
    }
    // Clerestory & ground windows across all 4 faces
    for (let wx = -9.6; wx <= 9.6; wx += 4.8) {
      F.win(wx, 5.55, 11.22, 2.2, 2.1, '+z', true, 3, 'porphyry');
      F.win(wx, 5.55, -11.22, 2.2, 2.1, '-z', true, 3, 'porphyry');
    }
    for (let wz = -7.2; wz <= 7.2; wz += 4.8) {
      F.win(-12.82, 5.55, wz, 2.1, 2.1, '-x', true, 2, 'porphyry');
      F.win(12.82, 5.55, wz, 2.1, 2.1, '+x', true, 2, 'porphyry');
      F.win(-12.82, 1.75, wz, 1.8, 2.2, '-x', wz === -2.4, 2, 'ancientStone');
      F.win(12.82, 1.75, wz, 1.8, 2.2, '+x', true, 2, 'ancientStone');
    }
    // Pitched side roofs + twin octagonal windowed drums & gilded bronze domes
    F.gableRoof(0, 8.50, 0, 26.0, 22.8, 2.1, false, 'roofDeck', 'ashStone');
    for (let s = -1; s <= 1; s += 2) {
      F.cyl('porphyry', s * 6.6, 9.4, 0, 5.0, 5.3, 1.8, 12);
      F.dome('bronze', s * 6.6, 11.2, 0, 5.2, 2.8, 14, false);
      F.cyl('gold', s * 6.6, 14.0, 0, 0.22, 0.48, 1.4, 8);
    }
    F.box('porphyry', 0, 6.2, 11.45, 7.6, 2.1, 0.42);
    F.dia(0, 7.25, 11.78, 1.55);
  }

  // 5c. Quarry Salvage Smelter & Foundry (3-Bay Sawtooth Factory Roof, Twin Blast Smokestacks, Overhead Crane & Glowing Tuyeres!)
  const foundry = findLm('quarry_salvage_foundry');
  if (foundry) {
    const F = frameOf(foundry);
    F.box('basalt', 0, -0.45, 0, 28.0, 1.0, 22.0);
    F.box('rustPlate', -4.5, 0.55, 0, 18.4, 8.2, 19.2);
    F.pilasters('z', -8.4, 8.4, -13.8, 0.55, 8.2, 4, 'tankSteel', 'rustPlate');
    F.pilasters('x', -12.5, 3.5, 9.7, 0.55, 8.2, 4, 'tankSteel', 'rustPlate');
    F.pilasters('x', -12.5, 3.5, -9.7, 0.55, 8.2, 4, 'tankSteel', 'rustPlate');
    // Industrial multi-pane factory windows
    for (let wz = -6.0; wz <= 6.0; wz += 6.0) {
      F.win(-13.72, 3.4, wz, 3.2, 3.4, '-x', true, 3, 'tankSteel');
    }
    for (let wx = -10.5; wx <= 0.5; wx += 5.5) {
      F.win(wx, 3.6, 9.62, 3.0, 3.2, '+z', true, 3, 'tankSteel');
      F.win(wx, 3.6, -9.62, 3.0, 3.2, '-z', wx < -4, 3, 'tankSteel');
    }
    // 3-Bay Sawtooth Roof with glazed clerestory north-lights!
    for (let sb = -1; sb <= 1; sb++) {
      const sz = sb * 6.2;
      F.box('roofDeck', -4.5, 9.55, sz - 0.8, 19.0, 0.24, 5.8, 0, 0, 0.34);
      F.box('windowLit', -4.5, 9.45, sz + 1.85, 18.2, 1.55, 0.20);
    }
    // Twin Blast-Furnace Cupolas + Tall Smokestacks (h = 19.5m) + Catwalk Collar + Molten Slag Runner
    F.cyl('tankSteel', 8.8, 0.55, -4.4, 3.8, 4.4, 11.2, 14);
    F.cyl('rustPlate', 8.8, 11.75, -4.4, 1.45, 2.2, 8.2, 12);
    F.cyl('tankSteel', 8.8, 0.55, 4.8, 3.4, 4.0, 10.4, 14);
    F.cyl('rustPlate', 8.8, 10.95, 4.8, 1.35, 2.0, 7.6, 12);
    F.box('tankSteel', 8.8, 8.2, 0.2, 8.6, 0.28, 16.4);
    F.box('warmGlow', 8.8, 1.2, 9.0, 2.8, 2.1, 0.8);
    // Exterior Overhead Bridge-Crane Runway extending into Quarry yard
    for (let cz = -8.5; cz <= 8.5; cz += 17.0) {
      F.box('tankSteel', -18.5, 0.55, cz, 0.65, 7.6, 0.65);
      F.box('rustPlate', -12.5, 7.9, cz, 13.0, 0.65, 0.55);
    }
    F.box('gold', -16.2, 8.2, 0, 1.1, 0.75, 17.8);
  }

  // 5d. Drim Rivrh Fortified Wharf & Sluice (3 Arched Sluices, Pitched Customs Warehouse, Fuel Tank & 2 Slewing Dock Cranes!)
  const wharf = findLm('drum_river_wharf');
  if (wharf) {
    const F = frameOf(wharf);
    // Deep river-bed basalt quay wall + 3 recessed flood-sluice arches & iron grilles
    F.box('basalt', 0, -3.8, 0, 34.0, 6.3, 19.0);
    F.box('floorTile', 0, 2.50, 0, 33.6, 0.22, 18.6);
    for (let sx = -10; sx <= 10; sx += 10) {
      F.box('ancientDark', sx, -2.8, 9.55, 4.6, 4.2, 0.8);
      F.box('rustPlate', sx, -2.6, 9.85, 3.6, 3.6, 0.22);
    }
    // Pitched Corrugated Customs Warehouse (lx = -7.5, ly = 2.72) with windows, loading bay & hoist beam!
    F.box('ashStone', -7.5, 2.72, -1.0, 14.8, 2.4, 14.4);
    F.box('tankSteel', -7.5, 5.12, -1.0, 14.6, 4.6, 14.2);
    F.gableRoof(-7.5, 9.72, -1.0, 15.2, 14.8, 2.6, true, 'roofDeck', 'rustPlate');
    F.box('rustPlate', -7.5, 10.6, 7.2, 0.55, 0.55, 3.2); // Hoist cathead beam!
    for (let wx = -12.0; wx <= -3.0; wx += 4.5) {
      F.win(wx, 6.1, 6.12, 2.2, 2.1, '+z', true, 2, 'rustPlate');
      F.win(wx, 6.1, -8.12, 2.2, 2.1, '-z', true, 2, 'rustPlate');
    }
    F.win(-14.82, 6.1, -1.0, 2.4, 2.1, '-x', true, 2, 'rustPlate');
    // Riveted Water/Fuel Bunker Tank + Conical Cap
    F.cyl('rustPlate', 9.2, 2.72, -3.2, 4.5, 4.6, 7.8, 14);
    F.cyl('tankSteel', 9.2, 6.4, -3.2, 4.72, 4.72, 0.34, 14);
    F.dome('roofDeck', 9.2, 10.52, -3.2, 4.65, 1.6, 14, false);
    // Timber Piling Landing Stage + Bollards + 2 Slewing Cargo Jib-Cranes over Drim Rivrh!
    F.box('timber', 0, 1.55, 13.8, 28.0, 0.65, 9.4);
    for (let px = -12; px <= 12; px += 6) {
      F.cyl('timber', px, -3.6, 17.8, 0.38, 0.42, 6.4, 8);
      F.cyl('tankSteel', px, 2.20, 17.6, 0.28, 0.34, 0.75, 8);
    }
    for (let cs = -1; cs <= 1; cs += 2) {
      const cx = cs * 11.5;
      F.cyl('tankSteel', cx, 2.20, 11.5, 0.65, 0.85, 6.8, 10);
      F.box('rustPlate', cx, 8.6, 15.2, 0.55, 0.65, 9.6, cs * 0.22, 0, -0.28);
    }
  }

  // 6. Regional Scrap-Market Stalls (4 corner posts, pitched awning & display counter!) & ENE Quarry Crane Gantries
  const mq = DRUM_STAGE4.marketQuarry;
  for (let ms = 0; ms < mq.stalls.length; ms++) {
    const st = mq.stalls[ms];
    const c = Math.cos(st.ry), s = Math.sin(st.ry);
    const hw = 0.5 * st.w - 0.18, hd = 0.5 * st.d - 0.18;
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        const px = st.x + (sx * hw) * c + (sz * hd) * s;
        const pz = st.z - (sx * hw) * s + (sz * hd) * c;
        addWorldBox('timber', px, -0.15, pz, 0.20, st.h + 0.15, 0.20, st.ry, 0);
      }
    }
    addWorldBox(st.shade ? 'canvas' : 'roofDeck', st.x, st.h, st.z, st.w + 0.35, 0.18, st.d + 0.35, st.ry, 0.10);
    addWorldBox('timber', st.x, 0.02, st.z, st.w * 0.78, 0.86, 0.75, st.ry, 0);
  }
  for (let qg = 0; qg < mq.gantries.length; qg++) {
    const gt = mq.gantries[qg];
    const c = Math.cos(gt.ry), s = Math.sin(gt.ry);
    for (let side = -1; side <= 1; side += 2) {
      const lz = side * 0.5 * gt.span;
      const gx = gt.x + lz * s, gz = gt.z + lz * c;
      addWorldBox('tankSteel', gx, -0.35, gz, gt.len, 0.55, 1.2, gt.ry, 0);
      addWorldBox('tankSteel', gx, gt.h - 0.75, gz, gt.len, 0.85, 0.75, gt.ry, 0);
      for (let lx = -0.42 * gt.len; lx <= 0.42 * gt.len; lx += 0.84 * gt.len) {
        addWorldBox('rustPlate', gt.x + lx * c + lz * s, -0.35, gt.z - lx * s + lz * c, 0.85, gt.h, 0.85, gt.ry, 0);
      }
    }
    addWorldBox('rustPlate', gt.x, gt.h - 0.5, gt.z, 2.4, 1.1, gt.span + 2.2, gt.ry, 0);
    addWorldBox('roofDeck', gt.x, gt.h + 0.6, gt.z, 3.2, 0.28, 3.8, gt.ry, 0);
    addWorldBox('tankSteel', gt.x, 0.04, gt.z, gt.len + 18.0, 0.18, 2.4, gt.ry, 0);
  }

  root.userData.landmarkPlanters = landmarkPlanters;

  Object.keys(buckets).forEach(function (matKey) {
    const list = buckets[matKey];
    if (!list.length) return;
    const mesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(list), DRUM_DRAW.MATS[matKey]);
    mesh.name = 'drum_lm_' + matKey;
    root.add(mesh);
  });

  return root;
})();
