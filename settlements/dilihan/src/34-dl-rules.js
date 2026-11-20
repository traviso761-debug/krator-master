/* ================================================================= DILIHAN — Pure Invariant Rules & KTAGS Registration ([G data])
   [G data] Pure functions over DL_LAYOUT.plan, DL_GROUND, DL_MODEL, KSPACE, KTAGS: no THREE, no DOM.
   Shared identically by:
     - settlements/dilihan/tests/test-dilihan.js (plain Node on tools/ktest.js)
     - settlements/dilihan/verify.py --assert (headless Chromium WebGL)
     - src/99-dl-host.js (_api.hostChecks, _api.hostNegatives) */
var DL_RULES = (function () {
  'use strict';

  function r2(v) { return Math.round(v * 100) / 100; }

  /* 1. Scale Model 5.1 Pin, Cut Bowl Coordinates & Shaped Bench Geometry Check */
  function pinCheck(L) {
    var p = L.pin;
    var colAsl = DL_GROUND.asl(0, -60);
    var colSlope = DL_GROUND.slope(0, -60, 12);
    var palAsl = DL_GROUND.asl(260, 294);
    var lowAsl = DL_GROUND.asl(-410, -40);
    var scarpDrop = colAsl - lowAsl;
    var lakeBedAsl = DL_GROUND.asl(0, -8600);
    var bowlPt = DL_GROUND.toBowl(0, 0);

    var ok = p.id === 'solqo7hz7s' &&
      p.px === 744 && p.py === 663 &&
      p.legacyPx[0] === 472 && p.legacyPx[1] === 333 &&
      Math.abs(p.datum - (-888.6)) < 0.25 &&
      Math.abs(p.latitude - (-31.50)) < 0.05 &&
      bowlPt[0] === 24000 && bowlPt[1] === 62000 &&
      colAsl >= -894.5 && colAsl <= -889.5 && colSlope <= 0.03 &&
      palAsl >= -880.5 && palAsl <= -875.5 &&
      lowAsl >= -926.5 && lowAsl <= -919.5 &&
      scarpDrop >= 18.0 && scarpDrop <= 35.0 &&
      lakeBedAsl < -1608.0;

    return {
      name: 'Scale Model 5.1 pin (744, 663), Cut bowl & Dellu bench datum',
      pass: ok,
      detail: 'datum=' + p.datum + ' m, colonia=' + r2(colAsl) + ' m (slope ' + r2(colSlope) +
        '), palace=' + r2(palAsl) + ' m, lowertown=' + r2(lowAsl) + ' m (scarp ' + r2(scarpDrop) +
        ' m), lakeBed=' + r2(lakeBedAsl) + ' m'
    };
  }

  /* 2. Settled 1:4 Colonia-to-Vernacular Districts Area Ratio Check (PLAN.md §1.7: [3.2, 4.8]) */
  function areaRatioCheck(L) {
    var a = L.areas;
    var c = L.census;
    var builtRatio = a.vernacularBuiltM2 / Math.max(1, a.coloniaBuiltM2);
    var polyRatio = a.vernacularPolyKm2 / Math.max(0.001, a.coloniaPolyKm2);
    var jjShare = c.vernacularJjShare;
    var ok = builtRatio >= 3.20 && builtRatio <= 4.80 &&
      polyRatio >= 3.80 && polyRatio <= 4.20 &&
      a.coloniaBuiltM2 >= 25000 &&
      jjShare >= 0.05 && jjShare <= 0.20;
    return {
      name: '1 to 4 colonia-to-Vernacular built area ratio and 10 pct Jimjam mix',
      pass: ok,
      detail: 'builtRatio=' + r2(builtRatio) + ':1 (' + Math.round(a.vernacularBuiltM2) + ' vs ' +
        Math.round(a.coloniaBuiltM2) + ' m2), polyRatio=' + r2(polyRatio) + ':1, districtJjShare=' +
        r2(jjShare * 100) + '%'
    };
  }

  /* 3. Wall-Street Cornice Match Check (PLAN.md §2.1 & VASSAL-KITS.md §2: <= 0.50 m mismatch) */
  function corniceCheck(L) {
    var pairs = L.wallStreetPairs || [];
    var maxDelta = 0;
    var bad = 0;
    for (var i = 0; i < pairs.length; i++) {
      var pr = pairs[i];
      var d = Math.abs(pr.jjCornice - pr.vnCornice);
      if (d > maxDelta) maxDelta = d;
      if (d > 0.50) bad++;
    }
    var ok = pairs.length >= 10 && bad === 0 && maxDelta <= 0.50;
    return {
      name: 'wall-street cornice height match within 0.50 m via o.scale',
      pass: ok,
      detail: pairs.length + ' paired facades, maxDelta=' + r2(maxDelta) + ' m, over0.5m=' + bad
    };
  }

  /* 4. Zero Building-Footprint Overlaps Check (KSPACE + exact separating-axis OBB) */
  function overlapsCheck(L) {
    var list = L.structures || [];
    var sp = KSPACE.create({ cell: 32 });
    var collisions = [];
    var hits = [];
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var rad = Math.hypot(a.w, a.d) * 0.5 + 32;
      sp.query(a.x, a.z, rad, hits);
      for (var j = 0; j < hits.length; j++) {
        var b = hits[j];
        if (DL_LAYOUT.boxesOverlap(a, b, 0.15)) {
          collisions.push(a.id + '<>' + b.id);
        }
      }
      sp.insert(a, a.x, a.z, Math.hypot(a.w, a.d) * 0.5);
    }
    return {
      name: 'zero OBB building footprint overlaps across all 5 zones',
      pass: list.length >= 180 && collisions.length === 0,
      detail: list.length + ' structures checked, overlaps=' + collisions.length +
        (collisions.length ? ' (' + collisions.slice(0, 4).join(', ') + ')' : '')
    };
  }

  /* 5. Re-Aimed jj_temple_sun Summer-Solstice Sunset Portal & SW Cut Rim Sightline Check (PLAN.md §2.2) */
  function solsticeCheck(L) {
    var S = L.solstice;
    if (!S || !S.ephemeris) return { name: 'solstice sunset arch check', pass: false, detail: 'missing solstice record' };
    var ep = S.ephemeris;
    var sd = ep.sunDir;
    var eye = S.eyeWorld;
    var arch = S.archBaseWorld;

    /* Temple local frame unit vectors (+z front along ry, +x right) */
    var nx = Math.sin(S.ry), nz = Math.cos(S.ry);
    var rx = Math.cos(S.ry), rz = -Math.sin(S.ry);

    /* Intersect ray P(t) = eye + t * sd with arch plane (P - arch) . n = 0 */
    var denom = sd[0] * nx + sd[2] * nz;
    if (denom <= 0.1) {
      return { name: 'solstice sunset arch check', pass: false, detail: 'sun ray points away from arch front' };
    }
    var tHit = ((arch[0] - eye[0]) * nx + (arch[2] - eye[2]) * nz) / denom;
    var hitX = eye[0] + sd[0] * tHit;
    var hitY = eye[1] + sd[1] * tHit;
    var hitZ = eye[2] + sd[2] * tHit;

    var uArch = (hitX - arch[0]) * rx + (hitZ - arch[2]) * rz;   /* horizontal offset from portal centerline (m) */
    var vArch = hitY - arch[1];                                  /* height above temple platform PH=6.0 m */

    /* Portal opening check: inside 4 x 7 m core window (|u| <= 2.0 m, v in [6.0, 13.0] m above platform) */
    var inCorePortal = Math.abs(uArch) <= S.coreHalfW && vArch >= 6.0 && vArch <= 13.0;
    var hzClear = ep.altitudeDeg - ep.horizonAltDeg;
    var latOk = Math.abs(ep.latitude - (-31.50)) < 0.05;
    var altOk = Math.abs(ep.altitudeDeg - 4.00) < 0.08 && Math.abs(ep.azimuthDeg - 245.39) < 0.12;

    /* Verify no non-temple building or circuit wall blocks the ray between t = 35 m and t = 500 m */
    var blockers = [];
    var all = (L.structures || []).concat(L.walls || []);
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      if (b.id === S.templeId) continue;
      var bx = b.x - eye[0], bz = b.z - eye[2];
      var along = bx * sd[0] + bz * sd[2];
      if (along < 32 || along > 480) continue;
      var rayX = eye[0] + sd[0] * along;
      var rayY = eye[1] + sd[1] * along;
      var rayZ = eye[2] + sd[2] * along;
      var br = Math.hypot(b.w, b.d) * 0.5;
      if (Math.hypot(rayX - b.x, rayZ - b.z) < br && b.y + b.h > rayY - 1.5) {
        blockers.push(b.id);
      }
    }

    var ok = latOk && altOk && inCorePortal && hzClear >= 0.30 && blockers.length === 0;
    return {
      name: 'jj_temple_sun summer-solstice sunset portal & SW Cut horizon clearance',
      pass: ok,
      detail: 'lat=' + ep.latitude + ' deg, day=' + ep.day + ', hr=' + ep.hour + ', az=' + ep.azimuthDeg +
        ' deg, alt=+' + ep.altitudeDeg + ' deg (SW Cut rim +' + ep.horizonAltDeg + ' deg, clear +' + r2(hzClear) +
        ' deg), portalHit=(u=' + r2(uArch) + ' m, v=' + r2(vArch) + ' m), blockers=' + blockers.length
    };
  }

  /* 6. Vassal Governor's Palace (govpalace, VASSAL-KITS.md §3 & PLAN.md §2.3) Check */
  function palaceCheck(L) {
    var P = L.palace;
    if (!P || !P.pavilions) return { name: 'governor palace check', pass: false, detail: 'missing palace metadata' };
    var pavs = P.pavilions;
    var n14 = pavs.filter(function (q) { return q.dM === 14 && q.dome === 'ribbed-slate' && q.lantern; }).length;
    var n11 = pavs.filter(function (q) { return q.dM === 11 && q.dome === 'terracotta'; }).length;
    var n8  = pavs.filter(function (q) { return q.dM === 8; }).length;
    var hasKitchen = pavs.some(function (q) { return q.id === 'kitchen' && q.dome === 'vented-tudor'; });
    var hasGuardTower = (L.zones[2] || []).some(function (r) { return r.key === 'vern_guard_tower'; });
    var hasBarracks = (L.zones[2] || []).some(function (r) { return r.key === 'vern_barracks'; });
    var orangeOk = P.orangeRestrictedTo && P.orangeRestrictedTo.length === 3 &&
      P.orangeRestrictedTo.indexOf('banners') >= 0 &&
      P.orangeRestrictedTo.indexOf('forecourt-gate') >= 0 &&
      P.orangeRestrictedTo.indexOf('window-arch-reveals') >= 0;

    var ok = P.groundsM[0] === 70 && P.groundsM[1] === 56 &&
      P.terraceH === 1.2 && P.domeKind === 'gold-onion' &&
      pavs.length === 7 && n14 === 2 && n11 === 2 && n8 === 3 && hasKitchen &&
      P.floors.length === 4 && P.floors[0] === 'B' &&
      hasGuardTower && hasBarracks && orangeOk;

    return {
      name: 'govpalace 7-chhatri, gold onion dome, undercroft & Iziz-orange discipline',
      pass: ok,
      detail: 'grounds=70x56m, pavilions=' + pavs.length + ' (14m:' + n14 + ', 11m:' + n11 + ', 8m:' + n8 +
        ', kitchen:' + hasKitchen + '), dome=' + P.domeKind + ', floors=' + P.floors.join('/')
    };
  }

  /* 7. Five Zones, 8 Handu Allotments, CROPS Cut Basket, KCONS Sites & RES_ORE Skarn Links Check */
  function zonesAndHanduCheck(L) {
    var zOk = [1, 2, 3, 4, 5].every(function (k) { return (L.zones[k] || []).length >= 5; });
    var handuFarms = (L.hamlets || []).filter(function (h) { return h.focus === 'farming'; });
    var hasBrick = (L.hamlets || []).some(function (h) { return h.focus === 'clay'; });
    var hasSkarn = (L.hamlets || []).some(function (h) { return h.focus === 'mine' && h.source; });
    var hasSalt = (L.hamlets || []).some(function (h) { return h.focus === 'salt'; });
    var nodeIds = {};
    for (var ni = 0; ni < (L.oreNodes || []).length; ni++) nodeIds[L.oreNodes[ni].id] = L.oreNodes[ni];
    var linkedWorks = (L.structures || []).filter(function (r) { return r.source && !!nodeIds[r.source]; });
    var cropsOk = L.crops && L.crops.totalBiome >= 100 && L.crops.canPlaid &&
      L.crops.benchRainfed.indexOf('rice') >= 0 && L.crops.benchRainfed.indexOf('measuremelon') >= 0;
    var censusOk = L.census.urban === 12000 && L.census.handuAllotments === 4000 && L.census.metropolitan === 16000;
    var consOk = (L.constructSites || []).length >= 6;
    var hasLegation = (L.zones[4] || []).some(function (r) { return r.key === 'dl_hykkousoi_legation'; });
    var hasCustoms = (L.zones[4] || []).some(function (r) { return r.key === 'dl_customs_post'; });
    var hasBridge = (L.zones[4] || []).some(function (r) { return r.key === 'dl_stream_bridge'; });
    var hasPortal = (L.zones[4] || []).some(function (r) { return r.key === 'dl_portvisas_portal'; });

    var ok = zOk && handuFarms.length === 8 && hasBrick && hasSkarn && hasSalt &&
      linkedWorks.length >= 7 && cropsOk && censusOk && consOk &&
      hasLegation && hasCustoms && hasBridge && hasPortal;

    return {
      name: 'all 5 zones, 8 handu hamlets, CROPS Cut basket, KCONS sites & RES_ORE skarn links',
      pass: ok,
      detail: 'metroPop=' + L.census.metropolitan + ' (urban ' + L.census.urban + ' + handu ' + L.census.handuAllotments +
        '), handuVillages=' + handuFarms.length + ', skarnLinks=' + linkedWorks.length +
        ', consSites=' + (L.constructSites || []).length + ', cutCrops=' + (L.crops ? L.crops.totalBiome : 0)
    };
  }

  function checks(L) {
    return [
      pinCheck(L),
      areaRatioCheck(L),
      corniceCheck(L),
      overlapsCheck(L),
      solsticeCheck(L),
      palaceCheck(L),
      zonesAndHanduCheck(L)
    ];
  }

  /* 8. Register every placed structure, wall segment, ore node & citizen cohort in KTAGS before drawing */
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
      if (r.wealth) tags.wealth = r.wealth;
      if (r.job) tags.job = r.job;
      if (r.landmark) tags.landmark = true;
      if (r.construct) tags.state = 'intact';
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
    for (var ni = 0; ni < (L.oreNodes || []).length; ni++) {
      var nd = L.oreNodes[ni];
      T.add({
        class: 'feature',
        key: 'ore_' + nd.kind,
        name: nd.kind + ' skarn lode (' + nd.grade + ')',
        at: [nd.x, nd.y, nd.z],
        size: [nd.r * 2, nd.r * 2, 3.2],
        tags: {
          culture: nd.culture,
          types: ['industry'],
          job: 'mining',
          district: 'works.skarn'
        },
        src: nd.id
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
    pinCheck: pinCheck,
    areaRatioCheck: areaRatioCheck,
    corniceCheck: corniceCheck,
    overlapsCheck: overlapsCheck,
    solsticeCheck: solsticeCheck,
    palaceCheck: palaceCheck,
    zonesAndHanduCheck: zonesAndHanduCheck,
    checks: checks,
    registerTags: registerTags
  };
})();
