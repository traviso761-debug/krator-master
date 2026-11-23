/* ================================================================= SKYWATCH — layout rules, sightlines & tag registration
   [G data] Pure validation functions over SW_MODEL (28), SW_GROUND (30), SW_LAYOUT (32), and KTAGS (50/52).
   Runs identically in Node (tests/test-skywatch.js), verify.py --assert (_api.hostChecks / _api.hostNegatives), and Godot. */
var SW_RULES = (function () {
  'use strict';

  function r2(v) { return Math.round(v * 100) / 100; }

  /* 1. Canonical Scale Model 5.1 Pin & Datum Check */
  function pinCheck(L) {
    var P = L.pin || {};
    var y0 = SW_GROUND.asl(0, 0);
    var ok = L.id === 's8921htcjy' && P.px === 776 && P.py === 470 &&
             Math.abs(P.datum - 3745.5) < 0.2 && Math.abs(y0 - 3745.5) < 0.5 &&
             P.cragAsl > 3815 && P.cragAsl < 3820;
    return {
      name: 'pin s8921htcjy at (776, 470) stands at +3,745.5 m ASL beside +3,817.3 m crag',
      pass: ok,
      detail: 'pin (' + P.px + ',' + P.py + ') asl=' + r2(y0) + ' m, cragAsl=' + P.cragAsl + ' m'
    };
  }

  /* 2. All Five Tiers Populated & Permanent Town Census Check */
  function tiersCheck(L) {
    var T = L.tiers || {};
    var counts = [1, 2, 3, 4, 5].map(function (k) { return (T[k] || []).length; });
    var minOk = counts[0] >= 5 && counts[1] >= 40 && counts[2] >= 20 && counts[3] >= 8 && counts[4] >= 25;
    var pop = L.census ? L.census.permanent : 0;
    var popOk = pop >= 1100 && pop <= 2200;
    var waysOk = (L.ways || []).length >= 16 && (L.walls || []).length >= 20 && (L.hamlets || []).length >= 2;
    return {
      name: 'all 5 architectural tiers, walls, ways, hamlets and census populated',
      pass: minOk && popOk && waysOk,
      detail: 'tiers [' + counts.join(', ') + '], walls=' + (L.walls || []).length +
              ', ways=' + (L.ways || []).length + ', hamlets=' + (L.hamlets || []).length + ', pop=' + pop
    };
  }

  /* 3. Zero Building-Footprint Overlaps Check (exact OBB separating axis across all non-wall structures) */
  function overlapsCheck(L) {
    var S = (L.structures || []).filter(function (r) { return !r.wallRun; });
    var bad = [];
    for (var i = 0; i < S.length; i++) {
      var a = S[i];
      for (var j = i + 1; j < S.length; j++) {
        var b = S[j];
        var maxR = (Math.hypot(a.w, a.d) + Math.hypot(b.w, b.d)) * 0.5 + 1;
        if (Math.abs(a.x - b.x) > maxR || Math.abs(a.z - b.z) > maxR) continue;
        if (SW_LAYOUT.boxesOverlap(a, b, 0.2)) {
          bad.push(a.id + '<->' + b.id);
        }
      }
    }
    return {
      name: 'zero building footprint overlaps across all five tiers',
      pass: S.length > 0 && bad.length === 0,
      detail: S.length + ' structures checked, overlaps=' + bad.length + (bad.length ? ' (' + bad.slice(0, 5).join(', ') + ')' : '')
    };
  }

  /* 4. Rock-Cut Vaulted Step-Cisterns Check (water surface strictly recessed below rim and above floor) */
  function cisternCheck(L) {
    var C = L.cisterns || [];
    var bad = [];
    for (var i = 0; i < C.length; i++) {
      var c = C[i];
      var centerGround = SW_GROUND.h(c.x, c.z);
      if (!(c.waterY <= c.rimY - 1.2 && c.waterY >= c.floorY + 1.0 && centerGround < c.waterY - 0.5)) {
        bad.push(c.id + ' (rim=' + c.rimY + ', water=' + c.waterY + ', floor=' + c.floorY + ', h=' + r2(centerGround) + ')');
      }
    }
    return {
      name: 'step-cistern water surfaces sit cleanly below rim pads and above excavated rock floors',
      pass: C.length === 2 && bad.length === 0,
      detail: C.length + ' step-cisterns' + (bad.length ? '; bad: ' + bad.join('; ') : ' (upper water ' + C[0].waterY + ' m, lower water ' + C[1].waterY + ' m)')
    };
  }

  /* 5. Tier V Silent Moot Megalithic Circle Geometry & Zero-Totem Rule */
  function mootCheck(L) {
    var M = L.moot;
    if (!M || !M.monoliths) return { name: 'Silent Moot 13-monolith equinox ring', pass: false, detail: 'missing moot' };
    var monos = M.monoliths;
    var badR = [], totems = 0;
    for (var i = 0; i < monos.length; i++) {
      var m = monos[i];
      var d = Math.hypot(m.x - M.x, m.z - M.z);
      if (Math.abs(d - M.R) > 0.25) badR.push(m.id);
      if (/totem|painted/i.test(m.key) || m.culture === 'painted') totems++;
    }
    /* Verify East Equinox Sunrise ray (Az 90.00 deg -> +x from gong center) passes cleanly between portal stones 01 and 13 */
    var eastBlocked = false;
    for (var j = 0; j < monos.length; j++) {
      var mj = monos[j];
      if (mj.x > M.x && Math.abs(mj.z - M.z) < mj.w * 0.5 + 0.6) eastBlocked = true;
    }
    var ok = monos.length === 13 && Math.abs(M.R - 14.0) < 0.05 && badR.length === 0 &&
             totems === 0 && !eastBlocked && !!M.gong && !!M.northSlab && !!M.southSlab &&
             Math.abs(M.equinoxAzDeg - 90.0) < 0.25;
    return {
      name: 'Silent Moot has 13 frost-split basalt monoliths on R=14 m with clear Az 90 deg Equinox portal and zero totems',
      pass: ok,
      detail: monos.length + ' monoliths on R=' + M.R + ' m, eastBlocked=' + eastBlocked + ', totems=' + totems + ', eqAz=' + M.equinoxAzDeg + ' deg'
    };
  }

  /* 6. JJ_SOLSTICE Sanctuary Arch & Horizon Sightline Check (Day 350 sunset Az 242.17 deg, Alt +3.00 deg) */
  function solsticeCheck(L) {
    var S = L.solstice;
    if (!S || !S.eye || !S.archCenter || !S.sunDir) {
      return { ok: false, pass: false, name: 'JJ_SOLSTICE sightline through Sanctuary arch', detail: 'missing solstice record' };
    }
    var dir = S.sunDir;
    /* Intersect ray E + t * dir with vertical plane through archCenter with normal n = (sin ry, 0, cos ry) */
    var nx = Math.sin(S.ry), nz = Math.cos(S.ry);
    var denom = dir[0] * nx + dir[2] * nz;
    if (denom <= 1e-6) {
      return { ok: false, pass: false, name: 'JJ_SOLSTICE sightline through Sanctuary arch', detail: 'ray parallel/away' };
    }
    var t = ((S.archCenter[0] - S.eye[0]) * nx + (S.archCenter[2] - S.eye[2]) * nz) / denom;
    var hitX = S.eye[0] + dir[0] * t;
    var hitY = S.eye[1] + dir[1] * t;
    var hitZ = S.eye[2] + dir[2] * t;
    /* Lateral offset along arch local +x = (cos ry, -sin ry) */
    var ux = Math.cos(S.ry), uz = -Math.sin(S.ry);
    var lat = (hitX - S.archCenter[0]) * ux + (hitZ - S.archCenter[2]) * uz;
    var inWidth = Math.abs(lat) <= S.archHalfW - 0.5;
    var inHeight = hitY >= S.archFloorY + 0.8 && hitY <= S.archCrownY - 0.6;

    /* Check Scale Model 5.1 horizon clearance at Az ~242 deg */
    var azIdx = ((Math.round(S.azimuthDeg) % 360) + 360) % 360;
    var hzAlt = SW_MODEL.horizonAlt ? SW_MODEL.horizonAlt[azIdx] : 0;
    var hzMargin = S.altitudeDeg - hzAlt;

    /* Also verify local ground along the WSW ray out to 2,000 m never blocks the +3.00 deg beam */
    var groundClear = true;
    for (var dist = 30; dist <= 2000; dist += 25) {
      var gx = S.eye[0] + dir[0] * dist;
      var gz = S.eye[2] + dir[2] * dist;
      var beamY = S.eye[1] + dir[1] * dist;
      if (SW_GROUND.h(gx, gz) > beamY - 1.0) { groundClear = false; break; }
    }
    var ok = t > 10 && inWidth && inHeight && hzMargin > 2.5 && groundClear;
    return {
      ok: ok,
      pass: ok,
      name: 'JJ_SOLSTICE sunset ray (Az 242.17 deg, Alt +3.00 deg) threads Sanctuary arch and clears 5.1 horizon',
      azimuthDeg: S.azimuthDeg,
      altitudeDeg: S.altitudeDeg,
      lateralOffsetM: r2(lat),
      hitY: r2(hitY),
      horizonAltDeg: hzAlt,
      horizonClearanceDeg: r2(hzMargin),
      groundClear: groundClear,
      detail: 'az=' + S.azimuthDeg + ' deg, alt=+' + S.altitudeDeg + ' deg, archLat=' + r2(lat) +
              ' m, hitY=' + r2(hitY) + ' m in [' + S.archFloorY + '..' + S.archCrownY + '], hzClear=+' + r2(hzMargin) + ' deg'
    };
  }

  /* 7. 360-Degree Observatory Horizon & NNE 300-km Outer-Wall Window Check */
  function horizonCheck(L) {
    var hz = SW_MODEL.horizonAlt || [], hd = SW_MODEL.horizonDistKm || [];
    if (hz.length !== 360 || hd.length !== 360) {
      return { ok: false, pass: false, name: '360-deg horizon and NNE Outer-Wall window', detail: 'missing 360 profile' };
    }
    var maxAlt = -90, minAlt = 90, nneMaxKm = 0;
    for (var az = 0; az < 360; az++) {
      if (hz[az] > maxAlt) maxAlt = hz[az];
      if (hz[az] < minAlt) minAlt = hz[az];
      if (az >= 15 && az <= 30 && hd[az] > nneMaxKm) nneMaxKm = hd[az];
    }
    var giantClear = 25.0 - hz[66];
    var eqClear = 0.0 - hz[90];
    /* Also check local ground NNE from Horizon Ring (-550, -264, eye +2.5 m) doesn't block view over N brow */
    var ring = (L.tiers && L.tiers[1] || []).find(function (r) { return r.id === 'sw.crag.horizon_ring'; });
    var ringClear = true;
    if (ring) {
      var eyeY = ring.y + 2.5, rAz = 22 * Math.PI / 180;
      var dx = Math.sin(rAz), dz = -Math.cos(rAz);
      for (var d = 40; d <= 1800; d += 40) {
        if (SW_GROUND.h(ring.x + dx * d, ring.z + dz * d) > eyeY + d * Math.tan(0.5 * Math.PI / 180)) {
          ringClear = false;
          break;
        }
      }
    }
    var ok = maxAlt <= 0.45 && nneMaxKm >= 270 && giantClear > 25.5 && eqClear > 0.8 && ringClear;
    return {
      ok: ok,
      pass: ok,
      name: '360-deg horizon <= +0.45 deg, NNE 15-30 deg window reaches 300+ km, and Gas Giant clears by +25.9 deg',
      minHorizonDeg: minAlt,
      maxHorizonDeg: maxAlt,
      nneWindowKm: nneMaxKm,
      giantClearanceDeg: r2(giantClear),
      equinoxClearanceDeg: r2(eqClear),
      detail: 'hz [' + minAlt + '..+' + maxAlt + ' deg], NNE maxDist=' + nneMaxKm + ' km, Giant clear=+' + r2(giantClear) + ' deg'
    };
  }

  /* 8. Copper-Zinc Skarn Nodes & Wind-Furnace Brass Works Check */
  function skarnCheck(L) {
    var nodes = L.oreNodes || [], t4 = (L.tiers && L.tiers[4]) || [];
    var hasCu = false, hasZn = false, furnaces = 0;
    for (var i = 0; i < t4.length; i++) {
      var r = t4[i];
      if (r.source && r.source.kind === 'copper' && r.source.rate > 0) hasCu = true;
      if (r.source && r.source.kind === 'zinc' && r.source.rate > 0) hasZn = true;
      if (r.key === 'sw_wind_furnace' || r.key === 'hl_rep_smelter') furnaces++;
    }
    var geo = SW_MODEL.geology || {};
    var ok = nodes.length >= 6 && hasCu && hasZn && furnaces >= 3 && geo.copper === 120 && geo.zinc === 96;
    return {
      name: 'copper (120) and zinc (96) skarn adits link via resSource to katabatic brass works',
      pass: ok,
      detail: nodes.length + ' ore nodes, copperLinked=' + hasCu + ', zincLinked=' + hasZn + ', furnaces=' + furnaces
    };
  }

  /* 9. KCAMP Convoy Laagers & 1.35x Sasquatch Equinox Camps Check */
  function campsCheck(L) {
    var C = L.camps || [];
    var convoys = C.filter(function (c) { return c.culture === 'skywatch-convoy'; });
    var sq = C.filter(function (c) { return c.culture === 'sasquatch' && Math.abs(c.scaleRig - 1.35) < 0.01; });
    var shortAny = C.some(function (c) { return (c.short || []).length > 0 || (c.records || []).length < 5; });
    var ok = convoys.length === 2 && sq.length === 3 && !shortAny;
    return {
      name: '2 armed convoy laagers and 3 Sasquatch 1.35x equinox bands pitched cleanly via KCAMP',
      pass: ok,
      detail: convoys.length + ' convoy laagers (' + (L.census ? L.census.transientConvoy : 0) + ' ppl), ' +
              sq.length + ' Sasquatch camps (' + (L.census ? L.census.equinoxSasquatch : 0) + ' ppl)'
    };
  }

  /* 10. Curtain Wall-to-Tower, Bastion & Gatehouse Joins Check (planar 0.35-0.75 m embed + vertical overlap) */
  function wallTowerJoins(L) {
    var W = L.walls || [];
    var townC = (L.grid && L.grid.c) ? L.grid.c : [10, -70];
    var nodes = [];
    var segs = [];
    var byId = {};
    for (var i = 0; i < W.length; i++) {
      var wr = W[i];
      if (!wr) continue;
      byId[wr.id] = wr;
      if (wr.key === 'jj_wall_seg') segs.push(wr);
      else if (wr.key === 'jj_wall_tower' || wr.key === 'jj_wall_corner' || wr.key === 'jj_wall_gate') nodes.push(wr);
    }
    nodes.sort(function (a, b) {
      var ia = a.ringIdx == null ? 0 : a.ringIdx;
      var ib = b.ringIdx == null ? 0 : b.ringIdx;
      return ia - ib;
    });
    var spans = {};
    for (var si0 = 0; si0 < segs.length; si0++) {
      var sg0 = segs[si0];
      var k = sg0.spanIdx == null ? -1 : sg0.spanIdx;
      if (!spans[k]) spans[k] = [];
      spans[k].push(sg0);
    }
    var violations = [];
    var checkedEnds = 0;
    var checkedJoints = 0;

    function segEndsAlong(seg, ux, uz) {
      var lx = Math.cos(seg.ry), lz = -Math.sin(seg.ry);
      var sgn = (lx * ux + lz * uz) >= 0 ? 1 : -1;
      var hw = seg.w * 0.5;
      var dx = sgn * lx * hw, dz = sgn * lz * hw;
      return {
        near: [seg.x - dx, seg.z - dz],
        far: [seg.x + dx, seg.z + dz]
      };
    }

    function checkEndEmbed(label, endSeg, endPt, node, ux, uz, towardNodeSign) {
      checkedEnds++;
      /* Distance from node center along span toward interior of span */
      var dEnd = towardNodeSign * ((endPt[0] - node.x) * ux + (endPt[1] - node.z) * uz);
      var latErr = Math.abs((endPt[0] - node.x) * (-uz) + (endPt[1] - node.z) * ux);
      if (latErr > 0.25) {
        violations.push(label + ':lateral-misalign(' + r2(latErr) + 'm)');
      }

      var halfWallT = 2.50;
      if (node.key === 'jj_wall_gate') {
        /* Gate length (24 m, solid piers x in [+-2.6, +-12.0]) runs along gate local x; road passage (5.2 m) runs along local z */
        var gcx = Math.cos(node.ry), gcz = -Math.sin(node.ry);
        var alignX = Math.abs(ux * gcx + uz * gcz);
        if (alignX < 0.96) {
          violations.push(label + ':gate-misaligned(align=' + r2(alignX) + ')');
        }
        var dx = endPt[0] - node.x, dz = endPt[1] - node.z;
        var lx = dx * Math.cos(node.ry) - dz * Math.sin(node.ry);
        var lz = dx * Math.sin(node.ry) + dz * Math.cos(node.ry);
        var embedGate = 12.00 - Math.abs(lx);
        if (embedGate < 0.35 || embedGate > 0.75) {
          violations.push(label + ':gate-embed(' + r2(embedGate) + 'm not in 0.35..0.75m)');
        }
        if (Math.abs(lx) < 8.6 || Math.abs(lz) + halfWallT > 4.0) {
          violations.push(label + ':gate-passage-or-flank(lx=' + r2(lx) + ',lz=' + r2(lz) + ')');
        }
      } else {
        /* Round tower (R_walk=4.38 m) or corner bastion (R_walk=5.35 m): check brick-face chord at |z|=2.50 m and corner radii */
        var rWalk = node.key === 'jj_wall_corner' ? 5.35 : 4.38;
        var dSurf = Math.sqrt(rWalk * rWalk - halfWallT * halfWallT);
        var embed = dSurf - dEnd;
        var nx = -uz, nz = ux;
        var c1 = Math.hypot(endPt[0] + nx * halfWallT - node.x, endPt[1] + nz * halfWallT - node.z);
        var c2 = Math.hypot(endPt[0] - nx * halfWallT - node.x, endPt[1] - nz * halfWallT - node.z);
        var radEmbed = rWalk - Math.max(c1, c2);
        if (embed < 0.35 || embed > 0.75) {
          violations.push(label + ':tower-embed(' + r2(embed) + 'm not in 0.35..0.75m)');
        }
        if (dEnd < 1.5 || radEmbed < 0.35) {
          violations.push(label + ':tower-socket(dEnd=' + r2(dEnd) + 'm,radEmbed=' + r2(radEmbed) + 'm)');
        }
      }

      /* Vertical masonry & sloped-plinth overlap check */
      var wallTop = endSeg.y + 10.0;
      var wallPlinth = endSeg.plinthH == null ? 0.8 : endSeg.plinthH;
      var wallBot = endSeg.y - wallPlinth;
      var nodeSolidH = node.key === 'jj_wall_gate' ? 14.0 : (node.key === 'jj_wall_corner' ? 15.4 : 14.6);
      var nodeTop = node.y + nodeSolidH;
      var nodePlinth = node.plinthH == null ? 0.8 : node.plinthH;
      var nodeBot = node.y - nodePlinth;
      var vertOverlap = Math.min(wallTop, nodeTop) - Math.max(endSeg.y, node.y);
      var plinthSeal = Math.min(endSeg.y, node.y) - Math.max(wallBot, nodeBot);
      var minGround = endSeg.minGroundY == null ? endSeg.y : endSeg.minGroundY;
      if (Math.abs(endSeg.y - node.y) > 1.8 || vertOverlap < 8.5 || plinthSeal < 0.25 || wallBot > minGround - 0.25) {
        violations.push(label + ':vertical-gap(overlap=' + r2(vertOverlap) + 'm,plinthSeal=' + r2(plinthSeal) + 'm)');
      }
    }

    if (nodes.length < 20) {
      violations.push('insufficient-wall-nodes(' + nodes.length + ')');
    } else {
      for (var ni = 0; ni < nodes.length; ni++) {
        var nodeA = nodes[ni];
        var nodeB = nodes[(ni + 1) % nodes.length];
        var sList = (spans[ni] || []).slice().sort(function (a, b) {
          var sa = a.segIdx == null ? 0 : a.segIdx;
          var sb = b.segIdx == null ? 0 : b.segIdx;
          return sa - sb;
        });
        if (!sList.length) {
          violations.push('missing-span:' + nodeA.id + '->' + nodeB.id);
          continue;
        }
        var sdx = nodeB.x - nodeA.x, sdz = nodeB.z - nodeA.z;
        var sL = Math.hypot(sdx, sdz);
        if (sL < 2) {
          violations.push('degenerate-span:' + nodeA.id + '->' + nodeB.id);
          continue;
        }
        var ux = sdx / sL, uz = sdz / sL;
        var mx = 0.5 * (nodeA.x + nodeB.x) - townC[0], mz = 0.5 * (nodeA.z + nodeB.z) - townC[1];
        var outSgn = (mx * uz - mz * ux) >= 0 ? 1 : -1;
        var outNx = outSgn * uz, outNz = -outSgn * ux;

        for (var j = 0; j < sList.length; j++) {
          var sjRec = sList[j];
          /* Verify outer crenellated parapet (local +z = sin ry, cos ry) faces outward */
          var fDot = Math.sin(sjRec.ry) * outNx + Math.cos(sjRec.ry) * outNz;
          if (fDot < 0.85) {
            violations.push(sjRec.id + ':inverted-parapet(dot=' + r2(fDot) + ')');
          }
          if (j + 1 < sList.length) {
            checkedJoints++;
            var nextRec = sList[j + 1];
            var e0 = segEndsAlong(sjRec, ux, uz).far;
            var e1 = segEndsAlong(nextRec, ux, uz).near;
            var p0 = (e0[0] - nodeA.x) * ux + (e0[1] - nodeA.z) * uz;
            var p1 = (e1[0] - nodeA.x) * ux + (e1[1] - nodeA.z) * uz;
            var seamOverlap = p0 - p1;
            var seamLat = Math.hypot(e0[0] - e1[0] - (p0 - p1) * ux, e0[1] - e1[1] - (p0 - p1) * uz);
            var seamVert = Math.min(sjRec.y + 10.0, nextRec.y + 10.0) - Math.max(sjRec.y, nextRec.y);
            if (seamOverlap < 0.01 || seamOverlap > 0.45 || seamLat > 0.12 || seamVert < 8.0) {
              violations.push(sjRec.id + '->' + nextRec.id + ':seam-gap(ov=' + r2(seamOverlap) + 'm,lat=' + r2(seamLat) + 'm,v=' + r2(seamVert) + 'm)');
            }
          }
        }

        var firstSeg = sList[0];
        var lastSeg = sList[sList.length - 1];
        var startEnd = segEndsAlong(firstSeg, ux, uz).near;
        var finishEnd = segEndsAlong(lastSeg, ux, uz).far;
        var refA = byId[firstSeg.nodeA] || nodeA;
        var refB = byId[lastSeg.nodeB] || nodeB;
        checkEndEmbed(firstSeg.id + '@' + refA.id, firstSeg, startEnd, refA, ux, uz, 1);
        checkEndEmbed(lastSeg.id + '@' + refB.id, lastSeg, finishEnd, refB, ux, uz, -1);
      }
    }

    var ok = violations.length === 0 && checkedEnds >= 60;
    return {
      ok: ok,
      pass: ok,
      name: 'every curtain-wall run sockets 0.35-0.75 m inside its guard towers, bastions and gatehouses with zero gaps',
      violations: violations,
      checkedEnds: checkedEnds,
      checkedJoints: checkedJoints,
      detail: checkedEnds + ' wall-to-tower/gate ends & ' + checkedJoints + ' segment joints checked, violations=' +
              violations.length + (violations.length ? ' (' + violations.slice(0, 4).join('; ') + ')' : '')
    };
  }

  function checks(L) {
    return [
      pinCheck(L),
      tiersCheck(L),
      overlapsCheck(L),
      wallTowerJoins(L),
      cisternCheck(L),
      mootCheck(L),
      solsticeCheck(L),
      horizonCheck(L),
      skarnCheck(L),
      campsCheck(L)
    ];
  }

  /* ---- Register every placed building, wall, cistern, ore node, monolith & camp tent in core/tags ---- */
  function registerTags(L, T) {
    if (!T || typeof T.add !== 'function') return 0;
    var count = 0;
    var regOne = function (cls, id, key, name, x, y, z, w, d, h, ry, tags) {
      T.add({
        id: id,
        class: cls,
        key: key,
        name: name || id,
        at: [x, y, z],
        ry: ry,
        size: [w, d, h],
        tags: tags
      });
      count++;
    };

    /* 1. All 5 tiers' structures (buildings, landmarks, cisterns, monoliths, camp tents) */
    var S = L.structures || [];
    for (var i = 0; i < S.length; i++) {
      var r = S[i];
      var cls = r.key === 'sw_moot_monolith' || r.key === 'sw_truce_gong' || r.key === 'sw_horizon_ring' ? 'landmark' :
                r.key === 'sw_step_cistern' || r.key === 'sw_boundary_cairn' ? 'infrastructure' : 'building';
      var t = {
        culture: r.culture || 'rustic',
        types: r.types && r.types.length ? r.types : ['civic'],
        state: r.state || 'intact',
        koppen: 'Dfb',
        quarter: r.quarter || ('tier-' + r.tier)
      };
      if (r.wealth) t.wealth = r.wealth;
      if (r.job) t.job = r.job;
      if (r.landmark) t.landmark = true;
      if (r.lit) {
        t.lit = true;
        t.light = r.role === 'beacon' ? 'flame' : 'brazier';
      }
      if (r.family) t.family = r.family;
      if (r.role) t.role = r.role;
      regOne(cls, r.id, r.key, r.name || r.id, r.x, r.y, r.z, r.w, r.d, r.h, r.ry, t);
    }

    /* 2. Pass Curtain Wall gates, bastions, towers & segments */
    var W = L.walls || [];
    for (var wi = 0; wi < W.length; wi++) {
      var wr = W[wi];
      var wt = {
        culture: 'jimjam',
        types: wr.types || ['military', 'infrastructure'],
        state: 'intact',
        koppen: 'Dfb',
        quarter: 'walls'
      };
      if (wr.job) wt.job = wr.job;
      if (wr.landmark) wt.landmark = true;
      if (wr.lit) { wt.lit = true; wt.light = 'brazier'; }
      regOne(wr.key === 'jj_wall_seg' ? 'infrastructure' : 'building', wr.id, wr.key, wr.name || wr.id, wr.x, wr.y, wr.z, wr.w, wr.d, wr.h, wr.ry, wt);
    }

    /* 3. Skarn Ore Nodes (copper, zinc, iron, saltpeter, turquoise) */
    var N = L.oreNodes || [];
    for (var ni = 0; ni < N.length; ni++) {
      var nd = N[ni];
      regOne('feature', nd.id, 'res_ore_' + nd.kind, nd.kind + ' skarn (' + nd.grade + ')', nd.x, nd.y, nd.z, nd.size, nd.size, nd.size * 0.65, 0, {
        culture: 'rustic',
        types: ['industry'],
        job: 'mining',
        state: 'intact',
        koppen: 'Dfb',
        quarter: 'skarn',
        rock: nd.kind,
        variant: nd.grade
      });
    }
    return count;
  }

  return {
    pinCheck: pinCheck,
    tiersCheck: tiersCheck,
    overlapsCheck: overlapsCheck,
    wallTowerJoins: wallTowerJoins,
    cisternCheck: cisternCheck,
    mootCheck: mootCheck,
    solsticeCheck: solsticeCheck,
    horizonCheck: horizonCheck,
    skarnCheck: skarnCheck,
    campsCheck: campsCheck,
    checks: checks,
    registerTags: registerTags
  };
})();
