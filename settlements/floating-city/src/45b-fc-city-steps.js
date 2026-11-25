// ================================================================= FLOATING CITY — Dense Imperial Multi-Kit City Layout & Support Audit [G data]
// Places 750+ non-Ancient buildings (KLK 'suudme' + RIK 'lower-ria' & 'upper-ria') across:
//   1. Mainland Bluff Street-Gridded Burgh (D6 & D7, >= +65.0 m, fronting 5 Avenues, 13 Cross-Streets & 4 Civic Squares)
//   2. 3 Radial Boulevard-Dyke Masonry Quay Terraces (+6.2 m) & Upper Promenades (+22.0 m)
//   3. 6 Inner Sea-Ring Venetian Harbour-Quay Shelves (+6.2 m) & Sea-Ring Weir Bastions (+18.0 m)
//   4. D5 East & West Stone Harbour Moles (+7.8 m, non-residential maritime works flanking the 4 Cliff-Funiculars)
//   5. Dense Floating Pontoon Archipelago (~46 octagonal Moon-Pool wards, 6..8 buildings each, 70+ hinged bascule bridges)
//   6. Central Sumeru & Bussabok Royal Terraces (D1)
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND, 0 OBB overlaps, 0 unsupported/floating corners!
const FC_CITY = (function () {
  'use strict';

  function obbCorners(L, pad) {
    const p = pad == null ? 0 : pad;
    const hw = (L.w * 0.5) + p, hd = (L.d * 0.5) + p;
    const c = Math.cos(L.ry), s = Math.sin(L.ry);
    return [
      [L.x - hw * c - hd * s, L.z - hw * s + hd * c],
      [L.x + hw * c - hd * s, L.z + hw * s + hd * c],
      [L.x + hw * c + hd * s, L.z + hw * s - hd * c],
      [L.x - hw * c + hd * s, L.z - hw * s - hd * c]
    ];
  }

  function obbOverlap(A, B, pad) {
    const dx = A.x - B.x, dz = A.z - B.z;
    const rMax = 0.55 * (Math.hypot(A.w, A.d) + Math.hypot(B.w, B.d)) + (pad == null ? 0 : pad * 2);
    if (dx * dx + dz * dz > rMax * rMax) return false;
    const cA = obbCorners(A, pad), cB = obbCorners(B, pad);
    const axes = [
      [Math.cos(A.ry), Math.sin(A.ry)], [-Math.sin(A.ry), Math.cos(A.ry)],
      [Math.cos(B.ry), Math.sin(B.ry)], [-Math.sin(B.ry), Math.cos(B.ry)]
    ];
    for (let i = 0; i < 4; i++) {
      const ax = axes[i][0], az = axes[i][1];
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (let k = 0; k < 4; k++) {
        const pA = cA[k][0] * ax + cA[k][1] * az;
        const pB = cB[k][0] * ax + cB[k][1] * az;
        if (pA < minA) minA = pA;
        if (pA > maxA) maxA = pA;
        if (pB < minB) minB = pB;
        if (pB > maxB) maxB = pB;
      }
      if (maxA <= minB + 1e-4 || maxB <= minA + 1e-4) return false;
    }
    return true;
  }

  function normDeg(d) {
    let x = d % 360;
    if (x < 0) x += 360;
    return x;
  }

  function inArcDeg(deg, a0, a1) {
    const d = normDeg(deg), s = normDeg(a0), e = normDeg(a1);
    if (s <= e) return d >= s && d <= e;
    return d >= s || d <= e;
  }

  /* Deterministic 46+ Pontoon Archipelago Generator inside the 1,400 m Lagoon (clear of Dykes, Ziggurats & Bussabok) */
  function generateArchipelago(mega) {
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;
    const pontoons = [];
    const rings = [
      { r: 248, rOut: 43, nCand: 30 },
      { r: 348, rOut: 45, nCand: 42 },
      { r: 450, rOut: 45, nCand: 54 },
      { r: 552, rOut: 43, nCand: 66 }
    ];

    function clearOfMega(px, pz, rOut) {
      const dx = px - CX, dz = pz - CZ;
      const rC = Math.hypot(dx, dz);
      if (rC - rOut < 201.0 || rC + rOut > 602.0) return false;

      /* Keep clear of South Royal Bussabok Island & its twin Naga causeways */
      const B = mega.sumeru.bussabok;
      if (Math.abs(px - B.cx) < B.w * 0.5 + rOut + 12.0 && pz > CZ + 135.0 && pz < B.cz + B.d * 0.5 + rOut + 12.0) {
        return false;
      }

      /* Keep clear of all 3 Boulevard-Dyke +6.2 m Masonry Quay Terraces */
      for (let i = 0; i < mega.dykes.length; i++) {
        const D = mega.dykes[i], a = D.angDeg * Math.PI / 180;
        const ux = Math.cos(a), uz = Math.sin(a);
        const along = dx * ux + dz * uz;
        const perp = Math.abs(-dx * uz + dz * ux);
        if (along > 90.0 && along < 680.0 && perp < D.quayHalfW + rOut + 9.0) return false;
      }

      /* Keep clear of all 6 Ancient Ziggurat Water-Pods */
      for (let i = 0; i < mega.zigguratPods.length; i++) {
        const Z = mega.zigguratPods[i];
        if (Math.hypot(px - Z.x, pz - Z.z) < 34.0 + rOut + 9.0) return false;
      }

      /* Keep crisp 11 m Venetian canal streets between adjacent pontoons */
      for (let i = 0; i < pontoons.length; i++) {
        const P = pontoons[i];
        if (Math.hypot(px - P.x, pz - P.z) < P.rOut + rOut + 11.0) return false;
      }
      return true;
    }

    let kCnt = 0, uCnt = 0, fCnt = 0, pCnt = 0;
    for (let ri = 0; ri < rings.length; ri++) {
      const rg = rings[ri];
      for (let s = 0; s < rg.nCand; s++) {
        const jitA = (KRAND.unit(KRAND.hash(0xFC220, ri, s, 3)) - 0.5) * (0.28 / rg.nCand) * Math.PI * 2;
        const jitR = (KRAND.unit(KRAND.hash(0xFC220, ri, s, 9)) - 0.5) * 12.0;
        const ang = (s / rg.nCand) * Math.PI * 2 + ri * 0.19 + jitA;
        const rr = rg.r + jitR;
        const px = +(CX + rr * Math.cos(ang)).toFixed(1);
        const pz = +(CZ + rr * Math.sin(ang)).toFixed(1);
        if (!clearOfMega(px, pz, rg.rOut)) continue;

        const deg = normDeg(ang * 180 / Math.PI);
        let kind = 'ria', id = '';
        if (deg >= 285 || deg < 26) {
          kind = 'suudme';
          id = 'K' + (++kCnt);
        } else if (deg >= 26 && deg < 72) {
          kind = 'upper';
          id = 'U' + (++uCnt);
        } else if (deg >= 170 && deg < 218) {
          kind = 'free';
          id = 'F' + (++fCnt);
        } else {
          kind = (s % 4 === 0 && deg > 218) ? 'suudme' : 'ria';
          id = 'P' + (++pCnt);
        }

        pontoons.push({
          id: id,
          x: px,
          z: pz,
          rOut: rg.rOut,
          rMoon: 8.0,
          sides: 8,
          kind: kind,
          freeboardM: kind === 'upper' ? 2.3 : 2.2,
          draftM: 3.2,
          bedY: -13.0
        });
      }
    }
    return pontoons;
  }

  function generateBascules(pontoons) {
    const links = [];
    const adj = {};
    const fixedAnchors = [
      { id: 'sala_ne', x: 172, z: -108 },
      { id: 'sala_se', x: 172, z: 248 },
      { id: 'sala_sw', x: -152, z: 246 },
      { id: 'sala_w',  x: -158, z: -118 },
      { id: 'dyke_nne', x: 148, z: -145 }
    ];

    pontoons.forEach(function (p) { adj[p.id] = []; });
    fixedAnchors.forEach(function (a) { adj[a.id] = []; });

    /* 1. Connect each fixed Sala-Nam / Dyke anchor to its 2 nearest pontoons */
    for (let a = 0; a < fixedAnchors.length; a++) {
      const FA = fixedAnchors[a];
      const sorted = pontoons.slice().sort(function (p, q) {
        return Math.hypot(p.x - FA.x, p.z - FA.z) - Math.hypot(q.x - FA.x, q.z - FA.z);
      });
      for (let k = 0; k < Math.min(2, sorted.length); k++) {
        const P = sorted[k];
        const d = Math.hypot(P.x - FA.x, P.z - FA.z);
        if (d < 210) {
          links.push({
            id: 'basc_anchor_' + FA.id + '_' + k,
            from: FA.id,
            to: P.id,
            x0: FA.x, z0: FA.z, x1: P.x, z1: P.z,
            spanM: +Math.max(36.0, d - P.rOut * 0.85).toFixed(2),
            maxPitchDeg: 12.0
          });
          adj[FA.id].push(P.id);
          adj[P.id].push(FA.id);
        }
      }
    }

    /* 2. Connect nearby pontoon neighbours across Venetian canals (dist <= 168 m, up to 3 bridges per pontoon) */
    const degCount = {};
    let bIdx = 0;
    for (let i = 0; i < pontoons.length; i++) {
      for (let j = i + 1; j < pontoons.length; j++) {
        const A = pontoons[i], B = pontoons[j];
        const d = Math.hypot(B.x - A.x, B.z - A.z);
        if (d <= 165.0 && (degCount[A.id] || 0) < 3 && (degCount[B.id] || 0) < 3) {
          degCount[A.id] = (degCount[A.id] || 0) + 1;
          degCount[B.id] = (degCount[B.id] || 0) + 1;
          links.push({
            id: 'basc_p_' + (++bIdx),
            from: A.id,
            to: B.id,
            x0: A.x, z0: A.z, x1: B.x, z1: B.z,
            spanM: +Math.max(34.0, d - (A.rOut + B.rOut) * 0.82).toFixed(2),
            maxPitchDeg: 12.0
          });
          adj[A.id].push(B.id);
          adj[B.id].push(A.id);
        }
      }
    }

    /* 3. Guarantee 100% connected archipelago via shortest spanning bridges if any sector cluster is isolated */
    function getReachable() {
      const seen = new Set(fixedAnchors.map(function (f) { return f.id; }));
      const q = Array.from(seen);
      while (q.length) {
        const u = q.shift();
        const nb = adj[u] || [];
        for (let i = 0; i < nb.length; i++) {
          if (!seen.has(nb[i])) { seen.add(nb[i]); q.push(nb[i]); }
        }
      }
      return seen;
    }

    let guard = 0;
    while (guard++ < 60) {
      const seen = getReachable();
      const un = pontoons.filter(function (p) { return !seen.has(p.id); });
      if (!un.length) break;
      let bestU = null, bestR = null, bestD = Infinity;
      const reachedList = pontoons.filter(function (p) { return seen.has(p.id); }).concat(fixedAnchors);
      for (let i = 0; i < un.length; i++) {
        for (let j = 0; j < reachedList.length; j++) {
          const d = Math.hypot(un[i].x - reachedList[j].x, un[i].z - reachedList[j].z);
          if (d < bestD) { bestD = d; bestU = un[i]; bestR = reachedList[j]; }
        }
      }
      if (!bestU || !bestR) break;
      links.push({
        id: 'basc_span_' + guard,
        from: bestR.id,
        to: bestU.id,
        x0: bestR.x, z0: bestR.z, x1: bestU.x, z1: bestU.z,
        spanM: +Math.max(38.0, bestD - 72.0).toFixed(2),
        maxPitchDeg: 12.0
      });
      adj[bestR.id].push(bestU.id);
      adj[bestU.id].push(bestR.id);
    }

    return links;
  }

  /* Verify that ALL 4 OBB CORNERS of a lot sit squarely on its intended solid structural support! */
  function isLotSupported(cand, mega, pontoonsById) {
    const corners = obbCorners(cand, -0.2);
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;

    if (cand.instance === 'pontoons') {
      const W = pontoonsById[cand.wardId];
      if (!W) return false;
      /* Octagon inscribed radius = rOut * cos(22.5 deg) = 0.92388 * rOut */
      const rInscribed = W.rOut * 0.922;
      for (let c = 0; c < 4; c++) {
        const dist = Math.hypot(corners[c][0] - W.x, corners[c][1] - W.z);
        if (dist > rInscribed || dist < W.rMoon + 0.3) return false;
      }
      return true;
    }

    if (cand.instance === 'bluff') {
      for (let c = 0; c < 4; c++) {
        const gx = corners[c][0], gz = corners[c][1];
        const gy = FC_SITE.elevAt(gx, gz);
        if (gy < 65.0) return false;
        if (FC_BLUFF_PLAN.inReservoirBasin(gx, gz, 2.0)) return false;
      }
      return true;
    }

    /* Fixed masonry platforms: Harbour Moles (+7.8 m), Dyke Quays (+6.2 m) / Dyke Crowns (+22.0 m),
       Sea-Ring Quays (+6.2 m) / Weir Promenade (+18.0 m), Sumeru Plinth (+14/+22 m), Bussabok Island (+8.5 m) */
    for (let c = 0; c < 4; c++) {
      const x = corners[c][0], z = corners[c][1];
      let okCorner = false;

      /* Check D5 Stone Harbour Moles (+7.8 m) */
      if (Math.abs(cand.y - 7.8) < 0.35 && FC_SITE.isOnMole(x, z, 1.5)) okCorner = true;

      /* Check Sumeru Upper/Mid Plinths & Bussabok Island */
      const dx = x - CX, dz = z - CZ, rC = Math.hypot(dx, dz);
      if (!okCorner && Math.abs(cand.y - 22.0) < 0.35 && rC <= mega.sumeru.upperCourtR * 0.92) okCorner = true;
      if (!okCorner && Math.abs(cand.y - 14.0) < 0.35 && rC <= 128.0 * 0.92) okCorner = true;
      const B = mega.sumeru.bussabok;
      if (!okCorner && Math.abs(cand.y - B.plinthY) < 0.35 &&
          Math.abs(x - B.cx) <= B.w * 0.5 - 1.0 && Math.abs(z - B.cz) <= B.d * 0.5 - 1.0) {
        okCorner = true;
      }

      /* Check 3 Boulevard-Dyke Masonry Quay Terraces (+6.2 m) & Upper Crowns (+22.0 m) */
      if (!okCorner) {
        for (let d = 0; d < mega.dykes.length; d++) {
          const D = mega.dykes[d], a = D.angDeg * Math.PI / 180;
          const ux = Math.cos(a), uz = Math.sin(a);
          const along = dx * ux + dz * uz;
          const perp = Math.abs(-dx * uz + dz * ux);
          if (Math.abs(cand.y - D.quayY) < 0.35 && along >= D.quayR0 + 1.0 && along <= D.quayR1 - 1.0 && perp <= D.quayHalfW - 1.0) {
            okCorner = true; break;
          }
          if (Math.abs(cand.y - D.crownY) < 0.35 && along >= D.r0 + 2.0 && along <= D.r1 - 2.0 && perp <= D.widthM * 0.5 + 3.0) {
            okCorner = true; break;
          }
        }
      }

      /* Check 6 Inner Sea-Ring Venetian Harbour-Quay Shelves (+6.2 m) & +18.0 m Sea-Ring Promenade */
      if (!okCorner) {
        const deg = normDeg(Math.atan2(dz, dx) * 180 / Math.PI);
        if (Math.abs(cand.y - 6.2) < 0.35 && rC >= 612.5 && rC <= 675.5) {
          for (let q = 0; q < mega.seaRing.quays.length; q++) {
            const Q = mega.seaRing.quays[q];
            if (inArcDeg(deg, Q.ang0 - 0.6, Q.ang1 + 0.6)) { okCorner = true; break; }
          }
        }
        if (Math.abs(cand.y - 18.0) < 0.35 && rC >= 660.0 && rC <= 704.0) okCorner = true;
      }

      if (!okCorner) return false;
    }
    return true;
  }

  function buildPlans(opts) {
    opts = opts || {};
    const tags = opts.tags || null;
    const mega = FC_MEGA.plan();
    const pontoons = generateArchipelago(mega);
    const pontoonsById = {};
    pontoons.forEach(function (p) { pontoonsById[p.id] = p; });
    const bascules = generateBascules(pontoons);
    const bluffWays = FC_BLUFF_PLAN.buildWays();

    const lots = [];
    const byDistrict = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0 };

    function tryPlace(spec) {
      const dim = FC_DIMS[spec.key];
      if (!dim) throw new Error('FC_CITY: unknown building key ' + spec.key);
      const cand = {
        id: spec.id,
        key: spec.key,
        kit: dim.kit,
        style: dim.style,
        district: spec.district,
        instance: spec.instance,
        wardId: spec.wardId || null,
        x: +spec.x.toFixed(2),
        y: +spec.y.toFixed(2),
        localY: spec.localY == null ? 0 : +spec.localY.toFixed(2),
        z: +spec.z.toFixed(2),
        ry: +(spec.ry == null ? 0 : spec.ry).toFixed(4),
        v: spec.v == null ? 0 : (spec.v | 0),
        w: dim.w,
        d: dim.d,
        h: dim.h,
        wealth: dim.wealth,
        res: dim.res,
        hh: dim.hh,
        pop: dim.pop,
        role: dim.role
      };
      if (!isLotSupported(cand, mega, pontoonsById)) {
        if (spec.required) throw new Error('FC_CITY: required lot ' + cand.id + ' is unsupported at (' + cand.x + ',' + cand.y + ',' + cand.z + ')');
        return null;
      }
      const pad = spec.pad == null ? 0.45 : spec.pad;
      for (let i = 0; i < lots.length; i++) {
        if (obbOverlap(cand, lots[i], pad)) {
          if (spec.required) throw new Error('FC_CITY: required lot ' + cand.id + ' overlaps ' + lots[i].id);
          return null;
        }
      }
      lots.push(cand);
      byDistrict[cand.district] = (byDistrict[cand.district] || 0) + 1;
      if (tags && tags.add) {
        const rec = tags.add({
          id: cand.id,
          class: 'building',
          kind: cand.key,
          name: cand.key.replace(/_/g, ' '),
          at: [cand.x, cand.y, cand.z],
          ry: cand.ry,
          size: [cand.w, cand.d, cand.h],
          tags: {
            culture: cand.kit === 'kulanewa' ? 'kulanewa' : 'ria',
            style: cand.style,
            wealth: cand.wealth,
            types: [cand.res ? 'dwelling' : 'civic']
          }
        });
        cand.tag = rec.id;
      }
      return cand;
    }

    /* -----------------------------------------------------------------------
       1. MAINLAND CROWN HEADLAND STREET-GRIDDED BURGH (D6 & D7, >= +65.0 m)
       ----------------------------------------------------------------------- */
    function nearCrossStreet(x, halfW) {
      for (let i = 0; i < FC_BLUFF_PLAN.CROSS_X.length; i++) {
        if (Math.abs(x - FC_BLUFF_PLAN.CROSS_X[i]) < 6.2 + halfW) return true;
      }
      return false;
    }
    function inCivicPlaza(x, dInland) {
      for (let i = 0; i < FC_BLUFF_PLAN.PLAZAS.length; i++) {
        const P = FC_BLUFF_PLAN.PLAZAS[i];
        if (x > P.x0 + 4 && x < P.x1 - 4 && dInland > P.d0 + 4 && dInland < P.d1 - 4) return true;
      }
      return false;
    }
    function nearHoistHead(x, z) {
      for (let i = 0; i < FC_SITE.CLIFF_HOISTS.length; i++) {
        const H = FC_SITE.CLIFF_HOISTS[i];
        if (Math.hypot(x - H.x1, z - H.z1) < 28.0) return true;
      }
      return false;
    }

    /* Civic Landmark Anchors fronting the Grand Plazas */
    const civicSpecs = [
      { id: 'fc.bluff.as01_chancellery', key: 'ra_west_chakri_chancellery', x: 265, dIn: 268 },
      { id: 'fc.bluff.suudme_bourse',    key: 'kl_suudme_amber_bourse',     x: 438, dIn: 268 },
      { id: 'fc.bluff.as01_scriptorium', key: 'ra_west_amber_scriptorium',  x: 348, dIn: 266 },
      { id: 'fc.bluff.strategion',       key: 'ra_west_strategion_keep',    x: 162, dIn: 196 },
      { id: 'fc.bluff.suudme_keep',      key: 'kl_suudme_strategion_keep',  x: 832, dIn: 268 },
      { id: 'fc.bluff.mondop_lib',       key: 'ra_west_mondop_library',     x: 265, dIn: 342 },
      { id: 'fc.bluff.suudme_thermae',   key: 'kl_suudme_sauna_thermae',    x: 438, dIn: 342 },
      { id: 'fc.bluff.suudme_shrine',    key: 'kl_suudme_uktena_bell_shrine',x: 832, dIn: 340 },
      { id: 'fc.bluff.cistern',          key: 'ra_west_aqueduct_cistern',   x: 928, dIn: 268 },
      { id: 'fc.bluff.beacon_suudme',    key: 'kl_suudme_beacon_frustum',   x: 148, dIn: 264 }
    ];
    for (let i = 0; i < civicSpecs.length; i++) {
      const C = civicSpecs[i];
      const z = FC_SITE.bluffShoreZ(C.x) - C.dIn;
      const sl = (FC_SITE.bluffShoreZ(C.x + 10) - FC_SITE.bluffShoreZ(C.x - 10)) / 20.0;
      const ry = Math.atan2(sl, 1.0);
      tryPlace({ id: C.id, key: C.key, district: 'D6', instance: 'bluff', x: C.x, y: FC_SITE.elevAt(C.x, z), z: z, ry: ry, required: true });
    }

    /* Dense Street-Fronting Urban Rows along both sides of all 5 Bluff Avenues */
    const bluffFrontPools = [
      /* Ave 0 & Ave 1: Rich Esplanade Palazzos, Mandarin Courts, Bazaars, Guilds & Insulae */
      [
        'kl_suudme_patrician_palazzo', 'ra_west_mandarin_court', 'kl_suudme_arcade_insula',
        'ra_west_insula_apartments', 'kl_suudme_covered_bazaar', 'ra_west_covered_bazaar',
        'kl_suudme_mandarin_court', 'ra_west_clan_compound', 'ra_west_lotus_pavilion',
        'ra_west_pyatthat_hall', 'kl_suudme_compass_atelier', 'ra_east_archon_residences'
      ],
      /* Ave 2 & Ave 3: Bustling Shophouses, Tenements, Caravanserais, Thermae & Craft Lofts */
      [
        'ra_west_artisan_shophouse', 'kl_suudme_arcade_insula', 'ra_west_insula_apartments',
        'kl_suudme_quay_tenement', 'ra_west_courtyard_tenement', 'kl_suudme_sanjhya_villa',
        'ra_west_arcade_villa', 'kl_suudme_caravanserai', 'ra_west_caravanserai_inn',
        'ra_west_lotus_thermae', 'kl_suudme_silk_dyeworks', 'ra_west_silk_dyeworks',
        'ra_west_celadon_prang_terrace', 'ra_east_peristyle_villa'
      ],
      /* Ave 4 (D7): Loess Terrace Granaries, Villas, Kilns & Cottages */
      [
        'kl_suudme_ziggurat_granary', 'ra_west_ziggurat_granary', 'kl_suudme_sanjhya_villa',
        'ra_west_arcade_villa', 'kl_suudme_trestle_cottage', 'ra_west_stilt_house',
        'kl_suudme_glaze_kilnworks', 'ra_west_bronze_smithy'
      ]
    ];

    let bluffSeq = 0;
    for (let a = 0; a < FC_BLUFF_PLAN.AVE_OFFSETS.length; a++) {
      const av = FC_BLUFF_PLAN.AVE_OFFSETS[a];
      const pool = a <= 1 ? bluffFrontPools[0] : (a <= 3 ? bluffFrontPools[1] : bluffFrontPools[2]);
      /* On Ave 0 (Cliff-Lip Esplanade), place only on the inland (+1) side so the cliff-edge ocean view stays open! */
      const sides = (a === 0) ? [1] : [-1, 1];
      for (let si = 0; si < sides.length; si++) {
        const sgn = sides[si];
        let x = 96.0;
        while (x <= 1396.0) {
          const key = pool[(bluffSeq++) % pool.length];
          const dim = FC_DIMS[key];
          const setback = av.widthM * 0.5 + dim.d * 0.5 + 2.8;
          const dIn = av.dInland + sgn * setback;
          const z = FC_SITE.bluffShoreZ(x) - dIn;

          if (!nearCrossStreet(x, dim.w * 0.5) && !inCivicPlaza(x, dIn) && !nearHoistHead(x, z) && !FC_BLUFF_PLAN.inReservoirBasin(x, z, 18.0)) {
            const sl = (FC_SITE.bluffShoreZ(x + 8) - FC_SITE.bluffShoreZ(x - 8)) / 16.0;
            const baseYaw = Math.atan2(sl, 1.0);
            /* Face directly onto the avenue! */
            const ry = sgn > 0 ? baseYaw : baseYaw + Math.PI;
            tryPlace({
              id: 'fc.bluff.st_' + a + '_' + (sgn > 0 ? 'N' : 'S') + '_' + Math.round(x),
              key: key,
              district: a >= 4 ? 'D7' : 'D6',
              instance: 'bluff',
              x: x,
              y: FC_SITE.elevAt(x, z),
              z: z,
              ry: ry,
              v: bluffSeq % 3
            });
          }
          x += dim.w + 3.6;
        }
      }
    }

    /* -----------------------------------------------------------------------
       2. THREE BOULEVARD-DYKE MASONRY QUAYS (+6.2 m) & UPPER CROWNS (+22.0 m)
       ----------------------------------------------------------------------- */
    const dykeQuayNE = [
      'kl_suudme_arcade_insula', 'ra_west_artisan_shophouse', 'kl_suudme_pontoon_factor',
      'kl_suudme_covered_bazaar', 'kl_suudme_paktong_braziery', 'kl_suudme_compass_atelier',
      'kl_suudme_silk_dyeworks', 'kl_suudme_quay_tenement', 'ra_west_insula_apartments'
    ];
    const dykeQuayWest = [
      'ra_west_artisan_shophouse', 'ra_west_insula_apartments', 'ra_west_covered_bazaar',
      'ra_west_courtyard_tenement', 'ra_west_glaze_kiln', 'ra_west_silk_dyeworks',
      'ra_west_bronze_smithy', 'kl_suudme_glaze_kilnworks', 'kl_suudme_arcade_insula'
    ];

    for (let d = 0; d < mega.dykes.length; d++) {
      const D = mega.dykes[d];
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const pool = D.tag === 'nne' ? dykeQuayNE : dykeQuayWest;
      let dqSeq = 0;

      for (let sgn = -1; sgn <= 1; sgn += 2) {
        let rf = D.quayR0 + 18.0;
        while (rf <= D.quayR1 - 18.0) {
          /* Leave vaulted barge-tunnel portals wide open! */
          let nearGate = false;
          for (let g = 0; g < D.gates.length; g++) {
            if (Math.abs(rf - D.gates[g]) < 24.0) { nearGate = true; break; }
          }
          const key = pool[(dqSeq++) % pool.length];
          const dim = FC_DIMS[key];
          if (!nearGate) {
            const lat = D.widthM * 0.5 + dim.d * 0.5 + 3.2;
            const px = FC_SITE.WEIR_CX + rf * ux + sgn * lat * nx;
            const pz = FC_SITE.WEIR_CZ + rf * uz + sgn * lat * nz;
            /* Face outward onto the waterfront quay promenade & canal! */
            const ry = Math.atan2(sgn * nx, sgn * nz);
            tryPlace({
              id: 'fc.dyke.' + D.tag + '_' + (sgn > 0 ? 'R' : 'L') + '_' + Math.round(rf),
              key: key,
              district: 'D3',
              instance: 'dykes',
              x: px, y: D.quayY, z: pz,
              ry: ry,
              v: dqSeq % 3
            });
          }
          rf += dim.w + 3.4;
        }
      }

      /* Monumental Gatehouses & Watch-Pavilions atop the +22.0 m Boulevard Crown */
      const crownStations = [195, 335, 490, 640];
      const crownKeys = ['kl_suudme_ishtar_watergate', 'ra_west_bussabok_gate', 'ra_west_water_gate', 'kl_suudme_beacon_frustum'];
      for (let cs = 0; cs < crownStations.length; cs++) {
        const rc = crownStations[cs];
        tryPlace({
          id: 'fc.dyke.' + D.tag + '_crown_' + cs,
          key: crownKeys[(d + cs) % crownKeys.length],
          district: 'D3',
          instance: 'dykes',
          x: FC_SITE.WEIR_CX + rc * ux,
          y: D.crownY,
          z: FC_SITE.WEIR_CZ + rc * uz,
          ry: Math.atan2(ux, uz),
          v: cs % 2
        });
      }
    }

    /* -----------------------------------------------------------------------
       3. SIX INNER SEA-RING VENETIAN HARBOUR QUAYS (+6.2 m) & WEIR PROMENADE (+18.0 m)
       ----------------------------------------------------------------------- */
    const ringSuudmePool = [
      'kl_suudme_tidal_wharf', 'kl_suudme_arcade_insula', 'kl_suudme_quay_tenement',
      'kl_suudme_pontoon_factor', 'kl_suudme_covered_bazaar', 'kl_suudme_caravanserai',
      'kl_suudme_ziggurat_granary', 'kl_suudme_paktong_braziery', 'ra_west_artisan_shophouse'
    ];
    const ringRiaPool = [
      'ra_west_crane_wharf', 'ra_west_barge_commissary', 'ra_west_insula_apartments',
      'ra_west_courtyard_tenement', 'ra_west_artisan_shophouse', 'ra_west_covered_bazaar',
      'ra_west_caravanserai_inn', 'ra_west_weigh_station', 'ra_west_boom_arsenal',
      'ra_east_stoa_agora', 'ra_east_archon_residences'
    ];

    let rqSeq = 0;
    for (let q = 0; q < mega.seaRing.quays.length; q++) {
      const Q = mega.seaRing.quays[q];
      const pool = Q.style === 'suudme' ? ringSuudmePool : ringRiaPool;
      const frontCompact = Q.style === 'suudme'
        ? ['kl_suudme_quay_tenement', 'kl_suudme_sanjhya_villa', 'kl_suudme_trestle_cottage', 'kl_suudme_compass_atelier', 'ra_west_artisan_shophouse']
        : ['ra_west_artisan_shophouse', 'ra_west_stilt_house', 'ra_west_canal_cottage', 'ra_west_arcade_villa', 'ra_west_glaze_kiln'];
      let spanDeg = Q.ang1 - Q.ang0;
      if (spanDeg < 0) spanDeg += 360;
      /* Back-row warehouses & insulae at r=660 m + Front-row canal shophouses at r=625 m flanking a 13 m Harbour Ring Street! */
      const ringRows = [
        { r: 660.0, stepDeg: 2.55, p: pool },
        { r: 625.0, stepDeg: 2.15, p: frontCompact }
      ];
      for (let rr = 0; rr < ringRows.length; rr++) {
        const rowSpec = ringRows[rr];
        for (let da = 1.6; da <= spanDeg - 1.6; da += rowSpec.stepDeg) {
          const deg = Q.ang0 + da;
          const a = deg * Math.PI / 180;
          const rx = FC_SITE.WEIR_CX + rowSpec.r * Math.cos(a);
          const rz = FC_SITE.WEIR_CZ + rowSpec.r * Math.sin(a);
          const ry = Math.atan2(-Math.cos(a), -Math.sin(a));
          const key = rowSpec.p[(rqSeq++) % rowSpec.p.length];
          tryPlace({
            id: 'fc.ringquay.' + Q.id + '_' + rr + '_' + rqSeq,
            key: key,
            district: 'D4',
            instance: 'dykes',
            x: rx, y: Q.deckY, z: rz,
            ry: ry,
            v: rqSeq % 3
          });
        }
      }
    }

    /* +18.0 m Sea-Ring Upper Promenade Watch-Beacons, Gates & Keeps */
    const weirTopAngles = [-42, -5, 18, 48, 92, 118, 138, 168, 204, 242, 268, 304];
    const weirTopKeys = [
      'kl_suudme_ishtar_watergate', 'kl_suudme_beacon_frustum', 'ra_east_stoa_agora',
      'ra_west_spiral_beacon', 'ra_west_bussabok_gate', 'ra_west_water_gate',
      'ra_west_strategion_keep', 'kl_suudme_strategion_keep'
    ];
    for (let i = 0; i < weirTopAngles.length; i++) {
      const a = weirTopAngles[i] * Math.PI / 180;
      const wx = FC_SITE.WEIR_CX + 686.0 * Math.cos(a);
      const wz = FC_SITE.WEIR_CZ + 686.0 * Math.sin(a);
      tryPlace({
        id: 'fc.weirtop.' + i,
        key: weirTopKeys[i % weirTopKeys.length],
        district: 'D4',
        instance: 'dykes',
        x: wx, y: 18.0, z: wz,
        ry: Math.atan2(-Math.cos(a), -Math.sin(a)),
        v: i % 2
      });
    }

    /* -----------------------------------------------------------------------
       4. D5 STONE HARBOUR MOLES (+7.8 m, Strictly Non-Residential Maritime Works!)
       ----------------------------------------------------------------------- */
    const moleWorks = [
      /* West Harbour Mole (flanking Funiculars 1..3 & NNE Boulevard Sea-Viaduct Landing) */
      { id: 'fc.d5.w_wharf_1', key: 'kl_suudme_tidal_wharf',    x: 185, z: -762, ry: 0.0 },
      { id: 'fc.d5.w_crane_1', key: 'ra_west_crane_wharf',      x: 232, z: -762, ry: 0.0 },
      { id: 'fc.d5.w_comm_1',  key: 'ra_west_barge_commissary', x: 282, z: -762, ry: 0.0 },
      { id: 'fc.d5.w_gate',    key: 'kl_suudme_ishtar_watergate',x: 356, z: -756, ry: 0.0 },
      { id: 'fc.d5.w_weigh',   key: 'ra_west_weigh_station',    x: 412, z: -762, ry: 0.0 },
      { id: 'fc.d5.w_arsenal', key: 'ra_west_boom_arsenal',     x: 462, z: -762, ry: 0.0 },
      { id: 'fc.d5.w_braz',    key: 'kl_suudme_paktong_braziery',x: 192, z: -835, ry: 1.57 },
      { id: 'fc.d5.w_bazaar',  key: 'kl_suudme_covered_bazaar', x: 265, z: -842, ry: 0.0 },
      { id: 'fc.d5.w_inn',     key: 'ra_west_caravanserai_inn', x: 345, z: -842, ry: 0.0 },
      /* East Harbour Mole (flanking Funicular 4 & Suudme Timber Basin) */
      { id: 'fc.d5.e_wharf_1', key: 'kl_suudme_tidal_wharf',    x: 678, z: -698, ry: 0.0 },
      { id: 'fc.d5.e_crane_1', key: 'ra_west_crane_wharf',      x: 728, z: -698, ry: 0.0 },
      { id: 'fc.d5.e_wharf_2', key: 'kl_suudme_tidal_wharf',    x: 782, z: -698, ry: 0.0 },
      { id: 'fc.d5.e_comm_1',  key: 'ra_west_barge_commissary', x: 838, z: -698, ry: 0.0 },
      { id: 'fc.d5.e_beacon',  key: 'kl_suudme_beacon_frustum', x: 912, z: -698, ry: 0.0 },
      { id: 'fc.d5.e_granary', key: 'kl_suudme_ziggurat_granary',x: 712, z: -775, ry: 0.0 },
      { id: 'fc.d5.e_kiln',    key: 'kl_suudme_glaze_kilnworks',x: 848, z: -775, ry: 0.0 }
    ];
    for (let i = 0; i < moleWorks.length; i++) {
      const M = moleWorks[i];
      tryPlace({ id: M.id, key: M.key, district: 'D5', instance: 'dykes', x: M.x, y: 7.8, z: M.z, ry: M.ry, required: true });
    }

    /* -----------------------------------------------------------------------
       5. DENSE FLOATING PONTOON ARCHIPELAGO (49 Pontoons, 6..7 Buildings Each!)
       ----------------------------------------------------------------------- */
    const suudmeRingPool = [
      'kl_suudme_trestle_cottage', 'kl_suudme_sanjhya_villa', 'ra_west_artisan_shophouse',
      'ra_west_canal_cottage', 'kl_suudme_quay_tenement', 'kl_suudme_compass_atelier',
      'kl_suudme_pontoon_factor', 'kl_suudme_glaze_kilnworks', 'kl_suudme_silk_dyeworks'
    ];
    const riaRingPool = [
      'ra_west_canal_cottage', 'ra_west_artisan_shophouse', 'ra_west_stilt_house',
      'ra_west_bronze_smithy', 'ra_west_glaze_kiln', 'ra_west_silk_dyeworks',
      'ra_west_arcade_villa', 'ra_west_courtyard_tenement', 'ra_west_amber_scriptorium'
    ];
    const upperRingPool = [
      'ra_east_peristyle_villa', 'ra_west_artisan_shophouse', 'ra_east_stoa_agora',
      'ra_west_arcade_villa', 'ra_west_amber_scriptorium', 'ra_west_canal_cottage'
    ];
    const freeRingPool = [
      'kl_suudme_trestle_cottage', 'ra_west_canal_cottage', 'ra_west_artisan_shophouse',
      'ra_west_stilt_house', 'kl_suudme_sanjhya_villa', 'kl_suudme_quay_tenement'
    ];

    const initLagoonY = FC_TIDE.tideY('lagoon', 0);
    for (let p = 0; p < pontoons.length; p++) {
      const W = pontoons[p];
      const pose = KCITY.floatPose(W, initLagoonY);
      const pool = W.kind === 'suudme' ? suudmeRingPool
                 : W.kind === 'upper'  ? upperRingPool
                 : W.kind === 'free'   ? freeRingPool
                 : riaRingPool;
      const slots = 7;
      const rPlace = W.rOut * 0.59;
      for (let k = 0; k < slots; k++) {
        const ang = (k * (2 * Math.PI / slots)) + (p % 2) * (Math.PI / slots);
        const bx = W.x + rPlace * Math.cos(ang);
        const bz = W.z + rPlace * Math.sin(ang);
        /* Alternate inward Moon-Pool frontage and outward Venetian canal frontage! */
        const ry = (k % 2 === 0)
          ? Math.atan2(W.x - bx, W.z - bz)
          : Math.atan2(bx - W.x, bz - W.z);

        /* Try pool candidates starting from compact/medium defs until one fits cleanly with 0 overlap & 100% corner support */
        for (let tryOff = 0; tryOff < pool.length; tryOff++) {
          const key = pool[(p * 3 + k + tryOff) % pool.length];
          const placed = tryPlace({
            id: 'fc.pontoon.' + W.id + '_' + k,
            key: key,
            district: 'D2',
            instance: 'pontoons',
            wardId: W.id,
            x: bx,
            y: pose.deckY,
            localY: 0.0,
            z: bz,
            ry: ry,
            v: (p + k) % 3,
            pad: 0.35
          });
          if (placed) break;
        }
      }
    }

    /* -----------------------------------------------------------------------
       6. CENTRAL SUMERU & BUSSABOK ROYAL HALLS (D1 — 100% Inside Terrace Bounds!)
       ----------------------------------------------------------------------- */
    tryPlace({
      id: 'fc.d1.prasat_palace',
      key: 'ra_west_prasat_palace',
      district: 'D1',
      instance: 'dykes',
      x: 0, y: 22.0, z: 148, ry: 0, required: true
    });
    tryPlace({
      id: 'fc.d1.hongsa_prasat',
      key: 'ra_east_swan_prasat',
      district: 'D1',
      instance: 'dykes',
      x: 0, y: 8.5, z: 338, ry: Math.PI, required: true
    });

    /* Continuous Pedestrian, Bascule, Cliff-Funicular & Submarine Lift Walk Graph */
    const walkNodes = ['bluff_as01', 'd5_ghat', 'dyke_nne', 'sumeru_plinth', 'dynamo_minus90', 'sala_ne', 'sala_se', 'sala_sw', 'sala_w'];
    pontoons.forEach(function (w) { walkNodes.push(w.id); });
    const walkEdges = [
      ['bluff_as01', 'd5_ghat'],
      ['d5_ghat', 'dyke_nne'],
      ['dyke_nne', 'sumeru_plinth'],
      ['sumeru_plinth', 'dynamo_minus90'],
      ['sumeru_plinth', 'sala_ne'],
      ['sumeru_plinth', 'sala_se'],
      ['sumeru_plinth', 'sala_sw'],
      ['sumeru_plinth', 'sala_w']
    ];
    bascules.forEach(function (b) { walkEdges.push([b.from, b.to]); });

    const cableChains = bascules.slice(0, 28).map(function (b) { return { from: b.from, to: b.to }; });

    return {
      lots: lots,
      byDistrict: byDistrict,
      pontoons: pontoons,
      bascules: bascules,
      cables: cableChains,
      bluffWays: bluffWays,
      walkGraph: { nodes: walkNodes, edges: walkEdges }
    };
  }

  function auditLayout(planOut) {
    const L = planOut.lots;
    const mega = FC_MEGA.plan();
    const pontoonsById = {};
    planOut.pontoons.forEach(function (p) { pontoonsById[p.id] = p; });

    let overlaps = 0, badMainlandDwell = 0, unsupportedLots = 0;
    let suudmeCount = 0, lowerRiaCount = 0, upperRiaCount = 0;
    for (let i = 0; i < L.length; i++) {
      const a = L[i];
      if (a.style === 'suudme') suudmeCount++;
      else if (a.style === 'lower-ria') lowerRiaCount++;
      else if (a.style === 'upper-ria') upperRiaCount++;

      if (!isLotSupported(a, mega, pontoonsById)) unsupportedLots++;

      if (a.instance === 'bluff' || (a.instance === 'dykes' && a.district === 'D5')) {
        if (a.res) {
          const corners = obbCorners(a, 0);
          for (let c = 0; c < 4; c++) {
            if (FC_SITE.elevAt(corners[c][0], corners[c][1]) < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
          }
          if (a.y < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
        }
      }
      for (let j = i + 1; j < L.length; j++) {
        if (obbOverlap(a, L[j], 0.15)) overlaps++;
      }
    }

    const adj = {};
    planOut.walkGraph.nodes.forEach(function (n) { adj[n] = []; });
    planOut.walkGraph.edges.forEach(function (e) {
      if (adj[e[0]] && adj[e[1]]) {
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
      }
    });
    const seen = new Set(['bluff_as01']);
    const q = ['bluff_as01'];
    while (q.length) {
      const cur = q.shift();
      const nb = adj[cur] || [];
      for (let i = 0; i < nb.length; i++) {
        if (!seen.has(nb[i])) {
          seen.add(nb[i]);
          q.push(nb[i]);
        }
      }
    }
    const unreached = planOut.walkGraph.nodes.filter(function (n) { return !seen.has(n); });

    return {
      ok: overlaps === 0 && unsupportedLots === 0 && badMainlandDwell === 0 && unreached.length === 0 &&
          L.length >= 600 && suudmeCount >= 180 && lowerRiaCount >= 350 && upperRiaCount >= 20,
      totalLots: L.length,
      pontoons: planOut.pontoons.length,
      bascules: planOut.bascules.length,
      overlaps: overlaps,
      unsupportedLots: unsupportedLots,
      badMainlandDwell: badMainlandDwell,
      suudmeCount: suudmeCount,
      lowerRiaCount: lowerRiaCount,
      upperRiaCount: upperRiaCount,
      unreachedNodes: unreached
    };
  }

  return {
    obbCorners: obbCorners,
    obbOverlap: obbOverlap,
    isLotSupported: isLotSupported,
    buildPlans: buildPlans,
    auditLayout: auditLayout
  };
})();
