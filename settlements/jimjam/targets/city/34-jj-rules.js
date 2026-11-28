/* ================================================================= JIMJAM — Pure Invariant Rules & KTAGS Registration ([G data])
   [G data] Pure functions over JJ_LAYOUT.plan, JJ_GROUND, JJ_MODEL, KSPACE, KTAGS: no THREE, no DOM, no Math.random. */
var JJ_RULES = (function () {
  'use strict';

  function r2(v) { return Math.round(v * 100) / 100; }

  /* 1. Scale Model 5.1 Pin (745, 546), +486.2 m Datum & +429.78 m Great Trough Lake Cove Check */
  function pinAndLakeCheck(L) {
    var p = L.pin;
    var acroAsl = JJ_GROUND.asl(-820, -80);
    var palAsl = JJ_GROUND.asl(0, 40);
    var quayRec = null;
    for (var qi = 0; qi < L.structures.length; qi++) {
      if (L.structures[qi].id === 'harb.quay.centre') { quayRec = L.structures[qi]; break; }
    }
    var quayDeckAsl = quayRec ? (quayRec.y + JJ_GROUND.datum) : JJ_GROUND.asl(-680, -1632);
    var shoreApronAsl = JJ_GROUND.asl(-680, -1620);
    var coveBedAsl = JJ_GROUND.asl(-680, -1760);
    var openLakeAsl = JJ_GROUND.asl(-680, -2200);

    var ok = p.id === 'st5e01l76v' &&
      p.px === 745 && p.py === 546 &&
      Math.abs(p.datum - 486.2) < 0.25 &&
      Math.abs(p.lakeAsl - 429.78) < 0.10 &&
      Math.abs(p.latitude - (-34.34)) < 0.05 &&
      Math.abs(acroAsl - 514.0) < 0.5 &&
      Math.abs(palAsl - 496.0) < 0.5 &&
      quayDeckAsl > p.lakeAsl + 1.5 &&
      shoreApronAsl > p.lakeAsl + 0.8 &&
      coveBedAsl < p.lakeAsl - 2.5 &&
      openLakeAsl < p.lakeAsl - 5.0;

    return {
      name: 'Scale Model 5.1 pin (745, 546), +486.2 m bench & +429.78 m Lotus Harbour cove',
      pass: ok,
      detail: 'datum=' + p.datum + ' m, lake=' + p.lakeAsl + ' m, acropolis=' + r2(acroAsl) +
        ' m, palace=' + r2(palAsl) + ' m, quayDeck=' + r2(quayDeckAsl) + ' m, shore=' + r2(shoreApronAsl) +
        ' m, coveBed=' + r2(coveBedAsl) + ' m'
    };
  }

  /* 2. Summer-Solstice Sunset Portal (-34.34 deg S, Az 244.04 deg, +3.00 deg) & WSW Headland Clearance Check */
  function solsticeCheck(L) {
    var S = L.solstice;
    if (!S || !S.ephemeris) return { name: 'solstice sunset arch check', pass: false, detail: 'missing solstice record' };
    var ep = S.ephemeris;
    var sd = ep.sunDir;
    var eye = S.eyeWorld;
    var arch = S.archBaseWorld;

    var nx = Math.sin(S.ry), nz = Math.cos(S.ry);
    var rx = Math.cos(S.ry), rz = -Math.sin(S.ry);
    var denom = sd[0] * nx + sd[2] * nz;
    if (denom <= 0.1) return { name: 'solstice sunset arch check', pass: false, detail: 'sun ray points away from arch' };

    var tHit = ((arch[0] - eye[0]) * nx + (arch[2] - eye[2]) * nz) / denom;
    var hitX = eye[0] + sd[0] * tHit;
    var hitY = eye[1] + sd[1] * tHit;
    var hitZ = eye[2] + sd[2] * tHit;
    var uArch = (hitX - arch[0]) * rx + (hitZ - arch[2]) * rz;
    var vArch = hitY - arch[1];

    var inArch = Math.abs(uArch) <= 3.8 && vArch >= 4.0 && vArch <= 15.2;
    var hzClear = ep.altitudeDeg - ep.horizonAltDeg;
    var latOk = Math.abs(ep.latitude - (-34.34)) < 0.05;
    var altOk = Math.abs(ep.altitudeDeg - 3.00) < 0.08 && Math.abs(ep.azimuthDeg - 244.04) < 0.18;

    /* Check zero building/wall/windmill blockers out to 1,200 m along Az 244.04 deg */
    var blockers = [];
    var all = (L.structures || []).concat(L.walls || []);
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      if (b.id === S.templeId) continue;
      var bx = b.x - eye[0], bz = b.z - eye[2];
      var along = bx * sd[0] + bz * sd[2];
      if (along < 30 || along > 1200) continue;
      var rayX = eye[0] + sd[0] * along;
      var rayY = eye[1] + sd[1] * along;
      var rayZ = eye[2] + sd[2] * along;
      var br = Math.hypot(b.w, b.d) * 0.5;
      if (Math.hypot(rayX - b.x, rayZ - b.z) < br && b.y + b.h > rayY - 1.5) {
        blockers.push(b.id);
      }
    }

    var ok = latOk && altOk && inArch && hzClear >= 1.5 && blockers.length === 0;
    return {
      name: 'jj_temple_sun -34.34 deg S solstice sunset portal & WSW horizon clearance',
      pass: ok,
      detail: 'lat=' + ep.latitude + ' deg, az=' + ep.azimuthDeg + ' deg, alt=+' + ep.altitudeDeg +
        ' deg (horizon +' + ep.horizonAltDeg + ' deg, clear +' + r2(hzClear) + ' deg), portal=(u=' +
        r2(uArch) + ' m, v=' + r2(vArch) + ' m), blockers=' + blockers.length
    };
  }

  /* 3. Flush 85.0 m Raja's Palace + Sunray Plaza Podium Seam & All 6 Moon + 6 Planet Sanctuaries Check */
  function palaceAndCelestialCheck(L) {
    var byId = {};
    var structs = L.structures || [];
    for (var i = 0; i < structs.length; i++) byId[structs[i].id] = structs[i];

    var pal = byId[L.landmarks.palaceId];
    var plz = byId[L.landmarks.palacePlazaId];
    var seamOk = false;
    var dist = -1, dy = 99;
    if (pal && plz) {
      var ex = pal.x + 85.0 * Math.sin(pal.ry);
      var ez = pal.z + 85.0 * Math.cos(pal.ry);
      dist = Math.hypot(plz.x - ex, plz.z - ez);
      dy = Math.abs(pal.y - plz.y);
      seamOk = dist <= 0.05 && dy <= 0.02 && Math.abs(pal.ry - plz.ry) <= 0.002;
    }

    var moonsFound = 0;
    for (var m = 0; m < L.landmarks.moonTempleIds.length; m++) {
      if (byId[L.landmarks.moonTempleIds[m]]) moonsFound++;
    }
    var planetsFound = 0;
    for (var p = 0; p < L.landmarks.planetShrineIds.length; p++) {
      if (byId[L.landmarks.planetShrineIds[p]]) planetsFound++;
    }
    var hasEye = !!byId[L.landmarks.rajasEyeId];
    var hasOrder = !!byId[L.landmarks.chapterhouseId];

    var ok = seamOk && moonsFound === 6 && planetsFound === 6 && hasEye && hasOrder;
    return {
      name: 'flush 85 m Palace-Sunray seam, Raja Eye, Order chapterhouse, 6 Moon Temples & 6 Planet Shrines',
      pass: ok,
      detail: 'palaceSeamErr=' + r2(dist) + 'm (dy=' + r2(dy) + 'm), moonTemples=' + moonsFound +
        '/6, planetShrines=' + planetsFound + '/6, rajasEye=' + hasEye + ', chapterhouse=' + hasOrder
    };
  }

  /* 4. Separate White-Pass Compound vs Eternian Lotus Water-Gate & Former Izani / Dilihan Building Mix Check */
  function whitePassAndDilihanMixCheck(L) {
    var byId = {};
    var all = (L.structures || []).concat(L.walls || []);
    for (var i = 0; i < all.length; i++) byId[all[i].id] = all[i];

    var wp = byId[L.landmarks.whitePassId];
    var lg = byId[L.landmarks.lotusGateId];
    var izRuin = byId[L.landmarks.izaniRuinId];
    var sepM = (wp && lg) ? Math.hypot(wp.x - lg.x, wp.z - lg.z) : 0;

    var kc = L.census.kitCounts || {};
    var iz = L.census.izaniZoneCounts || {};
    var izShare = L.census.izaniForeignShare || 0;

    var ok = !!(wp && lg && izRuin) &&
      sepM >= 950 &&
      (kc.dil || 0) >= 18 &&
      (kc.vern || 0) >= 8 &&
      izShare >= 0.30 && izShare <= 0.80;

    return {
      name: 'separate White-Pass compound (>950 m from Eternian Water-Gate) & Dilihan/Izani quarter mix',
      pass: ok,
      detail: 'whitePassSeparation=' + Math.round(sepM) + ' m, cityDilihan=' + (kc.dil || 0) +
        ', cityVern=' + (kc.vern || 0) + ', izaniEnclaveForeignShare=' + r2(izShare * 100) + '% (' +
        ((iz.dil || 0) + (iz.vern || 0)) + '/' + (iz.total || 0) + ')'
    };
  }

  /* 5. Zero OBB Building Overlaps & Full Housing/Trade Variety Span Check */
  function overlapsAndVarietyCheck(L) {
    var list = (L.structures || []).filter(function (r) { return r.cls === 'building'; });
    var sp = KSPACE.create({ cell: 36 });
    var collisions = [];
    var hits = [];
    var houseVarieties = {};
    var tradeKeys = {};

    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.key.indexOf('jj_house_') === 0) houseVarieties[a.key] = true;
      if (a.job) tradeKeys[a.key] = true;

      var rad = Math.hypot(a.w, a.d) * 0.5 + 36;
      sp.query(a.x, a.z, rad, hits);
      for (var j = 0; j < hits.length; j++) {
        var b = hits[j];
        if (JJ_LAYOUT.boxesOverlap(a, b, 0.15)) {
          collisions.push(a.id + '<>' + b.id);
        }
      }
      sp.insert(a, a.x, a.z, Math.hypot(a.w, a.d) * 0.5);
    }

    var nHouses = Object.keys(houseVarieties).length;
    var nTrades = Object.keys(tradeKeys).length;
    var ok = list.length >= 3000 && collisions.length === 0 && nHouses === 18 && nTrades >= 28;
    return {
      name: 'dense street-frontage packing (>=3,000 buildings), zero OBB overlaps, 18 houses & full trade span',
      pass: ok,
      detail: list.length + ' buildings checked, overlaps=' + collisions.length +
        ', jjHouseVarieties=' + nHouses + '/18, activeTradeKeys=' + nTrades +
        (collisions.length ? ' (' + collisions.slice(0, 4).join(', ') + ')' : '')
    };
  }

  /* 6. 50,000 Voth-Scale Census, 6 Curbed Parks, 6 Handu Villages & Great Pilgrim's Market Check */
  function censusAndHanduCheck(L) {
    var c = L.census;
    var ok = c.urban === 50000 &&
      c.sliceHinterland === 8500 &&
      c.metropolitanSliceTotal === 58500 &&
      (L.parks || []).length === 6 &&
      (L.hamlets || []).length === 6 &&
      (L.marketStalls || []).length >= 30 &&
      (L.constructSites || []).length >= 6 &&
      (L.walls || []).length >= 120;
    return {
      name: '50,000 urban + 8,500 handu census, 6 curbed parks, 6 KHAMLET villages & Great Pilgrim Market',
      pass: ok,
      detail: 'urban=' + c.urban + ', handu=' + c.sliceHinterland + ', parks=' + (L.parks || []).length +
        ', hamlets=' + (L.hamlets || []).length + ', pilgrimStalls=' + (L.marketStalls || []).length +
        ', consSites=' + (L.constructSites || []).length + ', wallPieces=' + (L.walls || []).length
    };
  }

  /* 7. Continuous Zero-Gap 7-Gate Circuit Wall & Paved Street Grid Check */
  function wallContinuityAndStreetsCheck(L) {
    var ring = L.wallRing || [];
    var wsp = KSPACE.create({ cell: 24 });
    var wlList = L.walls || [];
    for (var i = 0; i < wlList.length; i++) {
      var w = wlList[i];
      wsp.insert(w, w.x, w.z, Math.max(w.w, w.d) * 0.52);
    }
    var uncovered = 0;
    var totalSamples = 0;
    for (var li = 0; li < ring.length; li++) {
      var leg = ring[li];
      var dx = leg.x1 - leg.x0, dz = leg.z1 - leg.z0;
      var len = Math.hypot(dx, dz);
      var ux = dx / len, uz = dz / len;
      for (var s = 0; s <= len; s += 2.0) {
        totalSamples++;
        var px = leg.x0 + ux * s, pz = leg.z0 + uz * s;
        var covered = wsp.some(px, pz, 14.0, function (piece) {
          var halfSpan = piece.w * 0.5 + 0.25;
          var pdx = px - piece.x, pdz = pz - piece.z;
          var along = Math.abs(pdx * ux + pdz * uz);
          var perp = Math.abs(-pdx * uz + pdz * ux);
          return along <= halfSpan && perp <= 6.5;
        });
        if (!covered) uncovered++;
      }
    }
    var nWays = (L.ways || []).length;
    var ok = ring.length === 9 && uncovered === 0 && nWays >= 60;
    return {
      name: 'continuous gapless 7-gate + 2-watergate circuit wall & full paved street network',
      pass: ok,
      detail: 'wallSamples=' + (totalSamples - uncovered) + '/' + totalSamples +
        ' (uncovered=' + uncovered + '), wallPieces=' + wlList.length + ', pavedWays=' + nWays
    };
  }

  /* 8. P2-P3 Water-Portals, Canal-to-Lake Outfall, Bustling Harbour, KCAMP Maidans & Gridded Handu Check */
  function waterPortalsAndP2P3Check(L) {
    var byId = {};
    var all = (L.structures || []).concat(L.walls || []);
    var vessels = 0, cranes = 0;
    for (var i = 0; i < all.length; i++) {
      var r = all[i];
      byId[r.id] = r;
      if (r.cls === 'vessel') vessels++;
      if (r.key === 'jj_dock_crane') cranes++;
    }
    var hs = byId[L.landmarks.harbourSluiceId];
    var es = byId[L.landmarks.eastSluiceId];
    var cSun = byId[L.landmarks.courtSunId];
    var cWeek = byId[L.landmarks.courtWeekId];
    var cPts = JJ_GROUND.canal.pts;
    var lastPt = cPts[cPts.length - 1];
    var mouthBed = JJ_GROUND.h(lastPt[0], -1670.5);
    var mouthSurf = JJ_GROUND.canal.surfaceY(lastPt[0], lastPt[1]);
    var camps = (L.pilgrimCamps || []).length;
    var hFields = L.handuFieldCount || 0;

    var ok = !!(hs && hs.key === 'jj_wall_watergate' && es && es.key === 'jj_wall_watergate') &&
      !!(cSun && cWeek) &&
      lastPt[1] <= -1680 &&
      mouthBed < JJ_GROUND.lakeY - 1.2 &&
      Math.abs(mouthSurf - JJ_GROUND.lakeY) < 0.15 &&
      vessels >= 28 &&
      cranes >= 5 &&
      camps === 2 &&
      hFields >= 70;

    return {
      name: 'P2-P3 water-portals, canal-to-lake outfall, 31-vessel bustling dockyard, High Courts, KCAMP Maidans & Handu grids',
      pass: ok,
      detail: 'waterGates=' + (!!hs + !!es) + '/2, canalMouth=(' + lastPt[0] + ',' + lastPt[1] + ', bedRelLake=' +
        r2(mouthBed - JJ_GROUND.lakeY) + 'm), vessels=' + vessels + ', cranes=' + cranes +
        ', courts=' + (!!cSun + !!cWeek) + '/2, kcampMaidans=' + camps + ', handuFields=' + hFields
    };
  }

  function checks(L) {
    return [
      pinAndLakeCheck(L),
      solsticeCheck(L),
      palaceAndCelestialCheck(L),
      whitePassAndDilihanMixCheck(L),
      overlapsAndVarietyCheck(L),
      censusAndHanduCheck(L),
      wallContinuityAndStreetsCheck(L),
      waterPortalsAndP2P3Check(L)
    ];
  }

  /* Register every placed structure, vessel, wall, market stall & citizen in KTAGS with 0 unknowns */
  function registerTags(L, T) {
    if (!T || typeof T.add !== 'function') return 0;
    var count = 0;
    var allBld = (L.structures || []).concat(L.walls || []);
    for (var i = 0; i < allBld.length; i++) {
      var r = allBld[i];
      var tags = {
        culture: r.culture,
        types: r.types,
        district: r.district,
        lit: !!r.lit
      };
      if (r.style) tags.style = r.style;
      if (r.state) tags.state = r.state;
      if (r.wealth) tags.wealth = r.wealth;
      if (r.job) tags.job = r.job;
      if (r.propulsion) tags.propulsion = r.propulsion;
      if (r.hull) tags.hull = r.hull;
      if (r.landmark) tags.landmark = true;
      if (r.electric) tags.light = 'electric';
      else if (r.lit) tags.light = 'oil-lantern';
      if (r.construct && !tags.state) tags.state = 'intact';

      T.add({
        class: r.cls || 'building',
        key: r.key,
        name: r.name || r.key,
        at: [r.x, r.y, r.z],
        ry: r.ry,
        size: [r.w, r.d, r.h],
        tags: tags,
        src: r.id
      });
      count++;
    }

    for (var mi = 0; mi < (L.marketStalls || []).length; mi++) {
      var ms = L.marketStalls[mi];
      T.add({
        class: 'prop',
        kind: 'market-stall',
        key: 'jj_furn_market_stall',
        name: 'Great Pilgrims Market Stall (' + ms.stream + ')',
        at: [ms.x, ms.y, ms.z],
        ry: ms.ry,
        size: [3.6, 2.8, 3.1],
        tags: {
          culture: ms.stream,
          types: ['market'],
          market: true,
          district: 'zone10.pilgrim_gates'
        },
        src: ms.id
      });
      count++;
    }

    for (var ci = 0; ci < (L.citizens || []).length; ci++) {
      var ct = L.citizens[ci];
      T.add({
        class: 'life',
        key: 'citizen_' + ct.culture,
        name: ct.group,
        at: [ct.x, ct.y, ct.z],
        ry: ct.ry,
        size: [0.6, 0.6, 1.72],
        tags: {
          culture: ct.culture,
          district: ct.group
        },
        src: ct.id
      });
      count++;
    }
    return count;
  }

  return {
    pinAndLakeCheck: pinAndLakeCheck,
    solsticeCheck: solsticeCheck,
    palaceAndCelestialCheck: palaceAndCelestialCheck,
    whitePassAndDilihanMixCheck: whitePassAndDilihanMixCheck,
    overlapsAndVarietyCheck: overlapsAndVarietyCheck,
    censusAndHanduCheck: censusAndHanduCheck,
    checks: checks,
    registerTags: registerTags
  };
})();
