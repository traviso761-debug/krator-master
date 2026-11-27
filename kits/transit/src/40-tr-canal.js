// prefix: kcanal
// ================================================================= TRANSIT KIT — Stepped Canals, Bridges, Aqueducts & Street Clipping ([G data])
// Engine-neutral canal engineering prototype (KCANAL / KTRANSIT_CANAL) reusable by any Krator culture
// (eternian, marr, dalab, republican Slussport, yuni, voth). Zero THREE, zero DOM, deterministic on KRAND, KSPACE & KMASK.
var KCANAL = (function () {
  'use strict';

  var PI = Math.PI, TAU = Math.PI * 2;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(e0, e1, v) {
    var d = e1 - e0;
    var t = d === 0 ? (v >= e1 ? 1 : 0) : clamp((v - e0) / d, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function r3(v) { return +(+v).toFixed(3); }

  /* Standard canal right-of-way & waterway gauges (reusable across cultures; host may override per reach) */
  var SPECS = {
    canal_trunk: { rowW: 20.0, waterW: 11.0, depth: 2.50, quayW: 4.50, minSpan: 11.0, minAirDraft: 2.80, minFreeboard: 1.35 },
    canal_ward: { rowW: 14.0, waterW: 7.60, depth: 2.10, quayW: 3.20, minSpan: 7.60, minAirDraft: 2.60, minFreeboard: 1.35 },
    canal_feeder: { rowW: 10.0, waterW: 5.60, depth: 2.00, quayW: 2.20, minSpan: 5.60, minAirDraft: 2.20, minFreeboard: 1.30 }
  };

  /* ---- 1. Oriented canal coordinate frame (u cross-canal, s up-canal) ----
     Supports any bearing in world (x east, z south). Note on vessel vs building yaw in Three.js:
     - Core/engine buildings have front +z, which rotates by ry to [sin(ry), cos(ry)]: yawFromZ(dx, dz) = atan2(dx, dz).
     - Ring Sea / TR_VESSEL hulls have bow +x and starboard +z, so +x rotates by ry to [cos(ry), -sin(ry)]:
       vesselYaw(dx, dz) = atan2(-dz, dx)! */
  function yawFromZ(dx, dz) { return Math.atan2(dx, dz); }
  function vesselYaw(dx, dz) { return Math.atan2(-dz, dx); }

  function frame(opt) {
    opt = opt || {};
    var ox = opt.ox == null ? 0 : opt.ox;
    var oz = opt.oz == null ? 0 : opt.oz;
    var sx, ux;
    if (opt.sx && opt.ux) {
      sx = [opt.sx[0], opt.sx[1]];
      ux = [opt.ux[0], opt.ux[1]];
    } else {
      var deg = opt.bearingDeg == null ? 0 : opt.bearingDeg;
      var rad = deg * PI / 180.0;
      /* Bearing deg clockwise from North (-z): sin(rad) east, -cos(rad) south */
      sx = [Math.sin(rad), -Math.cos(rad)];
      /* Cross axis 90 deg counter-clockwise or explicit perpendicular: [ -sx[1], sx[0] ] or right-hand */
      ux = [-sx[1], sx[0]];
    }
    var F = {
      ox: ox, oz: oz,
      SX: sx, UX: ux,
      /* Building (+z front) yaws along S, -S, U, -U */
      YAW_S: yawFromZ(sx[0], sx[1]),
      YAW_NS: yawFromZ(-sx[0], -sx[1]),
      YAW_U: yawFromZ(ux[0], ux[1]),
      YAW_NU: yawFromZ(-ux[0], -ux[1]),
      /* Vessel (+x bow) yaws along S, -S, U, -U */
      VYAW_S: vesselYaw(sx[0], sx[1]),
      VYAW_NS: vesselYaw(-sx[0], -sx[1]),
      VYAW_U: vesselYaw(ux[0], ux[1]),
      VYAW_NU: vesselYaw(-ux[0], -ux[1]),
      at: function (u, s) {
        return [ox + u * ux[0] + s * sx[0], oz + u * ux[1] + s * sx[1]];
      },
      uOf: function (x, z) {
        var dx = x - ox, dz = z - oz;
        return dx * ux[0] + dz * ux[1];
      },
      sOf: function (x, z) {
        var dx = x - ox, dz = z - oz;
        return dx * sx[0] + dz * sx[1];
      },
      us: function (x, z) {
        var dx = x - ox, dz = z - oz;
        return [dx * ux[0] + dz * ux[1], dx * sx[0] + dz * sx[1]];
      },
      rectPoly: function (u0, u1, s0, s1) {
        return [F.at(u0, s0), F.at(u1, s0), F.at(u1, s1), F.at(u0, s1)];
      }
    };
    return F;
  }

  /* ---- 2. 2D Oriented Bounding Box (SAT) & Polyline-Clipping Primitives ---- */
  /* Building/zone OBB where ry rotates local +x to [cos(ry), -sin(ry)] and local +z to [sin(ry), cos(ry)] */
  function makeObb(x, z, ry, w, d, margin) {
    var m = margin == null ? 0 : margin;
    var ux = Math.cos(ry), uz = -Math.sin(ry);
    var vx = Math.sin(ry), vz = Math.cos(ry);
    var hw = w * 0.5 + m, hd = d * 0.5 + m;
    return { x: x, z: z, ux: ux, uz: uz, vx: vx, vz: vz, hw: hw, hd: hd, r: Math.hypot(hw, hd) };
  }

  /* Vessel OBB where yaw rotates bow (+x, length L) to [cos(yaw), -sin(yaw)] and starboard (+z, beam B) to [sin(yaw), cos(yaw)] */
  function vesselObb(x, z, yaw, L, B, margin) {
    return makeObb(x, z, yaw, L, B, margin);
  }

  function obbCorners(ob) {
    var ax = ob.ux * ob.hw, az = ob.uz * ob.hw;
    var bx = ob.vx * ob.hd, bz = ob.vz * ob.hd;
    return [
      [ob.x - ax - bx, ob.z - az - bz],
      [ob.x + ax - bx, ob.z + az - bz],
      [ob.x + ax + bx, ob.z + az + bz],
      [ob.x - ax + bx, ob.z - az + bz]
    ];
  }

  function obbOverlap(a, b) {
    var dx = b.x - a.x, dz = b.z - a.z;
    if (dx * dx + dz * dz > (a.r + b.r) * (a.r + b.r)) return false;
    var axes = [[a.ux, a.uz], [a.vx, a.vz], [b.ux, b.uz], [b.vx, b.vz]];
    for (var i = 0; i < 4; i++) {
      var ax = axes[i][0], az = axes[i][1];
      var dist = Math.abs(dx * ax + dz * az);
      var ra = a.hw * Math.abs(a.ux * ax + a.uz * az) + a.hd * Math.abs(a.vx * ax + a.vz * az);
      var rb = b.hw * Math.abs(b.ux * ax + b.uz * az) + b.hd * Math.abs(b.vx * ax + b.vz * az);
      if (dist >= ra + rb - 1e-4) return false;
    }
    return true;
  }

  function pointInObb(ob, x, z, pad) {
    var m = pad == null ? 0 : pad;
    var dx = x - ob.x, dz = z - ob.z;
    var lu = Math.abs(dx * ob.ux + dz * ob.uz);
    var lv = Math.abs(dx * ob.vx + dz * ob.vz);
    return lu <= ob.hw + m && lv <= ob.hd + m;
  }

  /* ---- 3. Stepped Pounds, Reaches, Basins, Bridges & Aqueducts ---- */
  function pound(spec) {
    var wlev = +spec.wlev;
    var fb = spec.minFreeboard == null ? 1.35 : +spec.minFreeboard;
    var depth = spec.depth == null ? 2.20 : +spec.depth;
    return {
      id: String(spec.id),
      order: spec.order == null ? 0 : (spec.order | 0),
      wlev: wlev,
      bedMin: spec.bedMin == null ? r3(wlev - depth) : +spec.bedMin,
      minFreeboard: fb,
      quayY: spec.quayY == null ? r3(wlev + fb + 0.13) : +spec.quayY,
      name: spec.name || String(spec.id)
    };
  }

  function poundsMonotonic(pounds, expectedDrop) {
    if (!pounds || pounds.length < 2) return false;
    for (var i = 0; i + 1 < pounds.length; i++) {
      if (!(pounds[i].wlev > pounds[i + 1].wlev)) return false;
    }
    if (expectedDrop != null) {
      var drop = pounds[0].wlev - pounds[pounds.length - 1].wlev;
      if (Math.abs(drop - expectedDrop) > 1e-3) return false;
    }
    return true;
  }

  function bridge(spec, F) {
    var kind = spec.canalKind || 'canal_trunk';
    var cs = SPECS[kind] || SPECS.canal_trunk;
    var wlev = +spec.wlev;
    var soffitY = +spec.soffitY;
    var deckY = spec.deckY == null ? r3(soffitY + 0.42) : +spec.deckY;
    var baseY = spec.baseY == null ? r3(wlev + 1.48) : +spec.baseY;
    var clearSpan = spec.clearSpan == null ? cs.minSpan : +spec.clearSpan;
    var rampHalfLen = spec.rampHalfLen == null ? 12.0 : +spec.rampHalfLen;
    var width = spec.width == null ? (spec.key === 'et_cart_bridge' || spec.styleKind === 'cart_arch' ? 7.4 : 4.0) : +spec.width;
    var u = +spec.u, s = +spec.s;
    var p = F ? F.at(u, s) : [spec.x == null ? u : spec.x, spec.z == null ? s : spec.z];
    var acrossAxis = spec.acrossAxis || 'u';
    var yaw = spec.yaw == null ? (F ? (acrossAxis === 'u' ? F.YAW_U : F.YAW_S) : 0) : spec.yaw;
    var rise = Math.max(0, deckY - baseY);
    var run = Math.max(1.0, rampHalfLen - clearSpan * 0.35);
    return {
      id: String(spec.id),
      key: spec.key || 'canal_bridge',
      styleKind: spec.styleKind || (width >= 6.0 ? 'cart_arch' : 'foot_arch'),
      canalKind: kind,
      pound: spec.pound || 'P1',
      wlev: wlev,
      u: u, s: s,
      x: r3(p[0]), z: r3(p[1]),
      acrossAxis: acrossAxis,
      yaw: yaw,
      width: width,
      baseY: baseY,
      clearSpan: clearSpan,
      soffitY: soffitY,
      deckY: deckY,
      airDraft: r3(soffitY - wlev),
      rampHalfLen: rampHalfLen,
      approachSlope: r3(rise / run),
      minReqAirDraft: spec.minReqAirDraft == null ? cs.minAirDraft : +spec.minReqAirDraft,
      deckObb: makeObb(p[0], p[1], yaw, width, rampHalfLen * 2.0, 0)
    };
  }

  function bridgeClearsVessel(br, vesselSpec, margin) {
    var m = margin == null ? 0.55 : margin;
    var cs = SPECS[br.canalKind] || SPECS.canal_trunk;
    var vH = vesselSpec ? (vesselSpec.H == null ? vesselSpec.airDraft : vesselSpec.H) : 1.88;
    var vB = vesselSpec ? (vesselSpec.B == null ? vesselSpec.beam : vesselSpec.B) : 3.60;
    return br.clearSpan >= cs.minSpan - 1e-4 &&
           br.clearSpan >= vB + 1.20 &&
           br.airDraft >= br.minReqAirDraft - 1e-4 &&
           br.airDraft >= vH + m - 1e-4;
  }

  function aqueduct(spec, F) {
    var u = spec.u == null ? 0 : +spec.u;
    var s = +spec.s;
    var len = spec.len == null ? 48.0 : +spec.len;
    var s0 = spec.s0 == null ? s - len * 0.5 : +spec.s0;
    var s1 = spec.s1 == null ? s + len * 0.5 : +spec.s1;
    var wlev = +spec.wlev;
    var waterW = spec.waterW == null ? 8.30 : +spec.waterW;
    var depth = spec.depth == null ? 2.20 : +spec.depth;
    var troughBedY = spec.troughBedY == null ? r3(wlev - depth) : +spec.troughBedY;
    var archSoffitY = spec.archSoffitY == null ? r3(troughBedY - 1.55) : +spec.archSoffitY;
    var streamWaterY = +spec.streamWaterY;
    var streamBedY = spec.streamBedY == null ? r3(streamWaterY - 1.80) : +spec.streamBedY;
    var p = F ? F.at(u, s) : [spec.x == null ? u : spec.x, spec.z == null ? s : spec.z];
    return {
      id: String(spec.id || 'aqueduct'),
      materialKind: spec.materialKind || 'masonry',
      pound: spec.pound || 'P2',
      u: u, s: s, s0: s0, s1: s1,
      x: r3(p[0]), z: r3(p[1]),
      yaw: spec.yaw == null ? (F ? F.YAW_S : 0) : spec.yaw,
      len: len,
      waterW: waterW,
      totalW: spec.totalW == null ? waterW + 6.7 : +spec.totalW,
      arches: spec.arches == null ? 3 : (spec.arches | 0),
      clearSpan: spec.clearSpan == null ? len * 0.75 : +spec.clearSpan,
      wlev: wlev,
      troughBedY: troughBedY,
      archSoffitY: archSoffitY,
      towpathY: spec.towpathY == null ? r3(wlev + 1.48) : +spec.towpathY,
      streamWaterY: streamWaterY,
      streamBedY: streamBedY,
      underpassClearance: r3(archSoffitY - streamWaterY)
    };
  }

  function aqueductOk(aq, minUnderpass) {
    var req = minUnderpass == null ? 3.20 : minUnderpass;
    return aq && aq.troughBedY > aq.archSoffitY + 0.35 &&
           aq.wlev > aq.troughBedY + 1.60 &&
           aq.underpassClearance >= req - 1e-4;
  }

  /* ---- 4. Canal Network & Street-Over-Canal Intrusion Prevention ----
     Builds a unified spatial representation of all wet canal boxes, basins, lock pits, and quay margins in (u, s)
     and world (x, z), so host cities can:
       1) clip/split street polylines cleanly behind towpath/quay curbs (or at bridge ramp toes),
       2) verify 0 street intrusions across all ways, and
       3) mask KMASK road pixels to 0 across every canal trough, lock chamber, basin, and river channel! */
  function network(cfg) {
    var F = cfg.frame || frame(cfg);
    var pounds = (cfg.pounds || []).map(pound);
    var poundById = {};
    for (var i = 0; i < pounds.length; i++) poundById[pounds[i].id] = pounds[i];

    /* Wet boxes in (u, s): { id, kind, pound, u0, u1, s0, s1, wlev, bedY, curbPad, obb } */
    var troughs = [];
    var rawBoxes = cfg.troughs || [];
    for (var ti = 0; ti < rawBoxes.length; ti++) {
      var tb = rawBoxes[ti];
      var u0 = Math.min(tb.u0, tb.u1), u1 = Math.max(tb.u0, tb.u1);
      var s0 = Math.min(tb.s0, tb.s1), s1 = Math.max(tb.s0, tb.s1);
      var cu = 0.5 * (u0 + u1), cs = 0.5 * (s0 + s1);
      var cp = F.at(cu, cs);
      var curbPad = tb.curbPad == null ? 2.6 : +tb.curbPad;
      troughs.push({
        id: String(tb.id || ('trough.' + ti)),
        kind: tb.kind || 'canal',
        pound: tb.pound || null,
        u0: u0, u1: u1, s0: s0, s1: s1,
        wlev: tb.wlev == null ? 0 : +tb.wlev,
        bedY: tb.bedY == null ? -2.2 : +tb.bedY,
        aqueduct: !!tb.aqueduct,
        curbPad: curbPad,
        wetObb: makeObb(cp[0], cp[1], F.YAW_S, u1 - u0, s1 - s0, 0),
        curbObb: makeObb(cp[0], cp[1], F.YAW_S, u1 - u0, s1 - s0, curbPad),
        poly: F.rectPoly(u0, u1, s0, s1)
      });
    }

    var bridges = (cfg.bridges || []).map(function (b) { return bridge(b, F); });
    var aqueducts = (cfg.aqueducts || []).map(function (a) { return aqueduct(a, F); });
    var rivers = cfg.rivers || []; /* optional [{ id, ptsUs: [[u, s, wlev, halfW], ...] }] */

    return {
      frame: F,
      pounds: pounds,
      poundById: poundById,
      troughs: troughs,
      bridges: bridges,
      aqueducts: aqueducts,
      rivers: rivers,
      chambers: cfg.chambers || []
    };
  }

  function distToRiverUs(ptsUs, u, s) {
    var bestD = 1e9, bestW = 12;
    for (var i = 0; i + 1 < ptsUs.length; i++) {
      var ax = ptsUs[i][0], az = ptsUs[i][1], bx = ptsUs[i + 1][0], bz = ptsUs[i + 1][1];
      var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
      var t = l2 > 1e-9 ? clamp(((u - ax) * dx + (s - az) * dz) / l2, 0, 1) : 0;
      var d = Math.hypot(u - (ax + dx * t), s - (az + dz * t));
      if (d < bestD) {
        bestD = d;
        var w0 = ptsUs[i][3] == null ? 12 : ptsUs[i][3];
        var w1 = ptsUs[i + 1][3] == null ? w0 : ptsUs[i + 1][3];
        bestW = lerp(w0, w1, t);
      }
    }
    return { d: bestD, halfW: bestW };
  }

  /* Returns the intruded canal trough / lock / basin / river at world (x, z), or null if safely outside.
     `extraMargin` > 0 expands the forbidden zone onto the quay wall / curb. */
  function pointInCanalTrough(net, x, z, extraMargin) {
    var F = net.frame;
    var us = F.us(x, z), u = us[0], s = us[1];
    var m = extraMargin == null ? 0 : +extraMargin;
    var trs = net.troughs;
    for (var i = 0; i < trs.length; i++) {
      var tr = trs[i];
      if (u >= tr.u0 - m && u <= tr.u1 + m && s >= tr.s0 - m && s <= tr.s1 + m) {
        return tr;
      }
    }
    var chs = net.chambers || [];
    for (var ci = 0; ci < chs.length; ci++) {
      var ch = chs[ci], hw = ch.w * 0.5 + m;
      if (u >= ch.u - hw && u <= ch.u + hw && s >= ch.s0 - m && s <= ch.s1 + m) {
        return ch;
      }
    }
    var rivs = net.rivers || [];
    for (var ri = 0; ri < rivs.length; ri++) {
      var rv = rivs[ri];
      var rh = distToRiverUs(rv.ptsUs, u, s);
      if (rh.d <= rh.halfW + m) return rv;
    }
    return null;
  }

  /* Checks if world point (x, z) with optional travel direction (du, ds) in (u, s) is carried by an explicit bridge deck */
  function pointOnBridgeDeck(net, x, z, du, ds) {
    var F = net.frame;
    var us = F.us(x, z), u = us[0], s = us[1];
    var brs = net.bridges || [];
    for (var i = 0; i < brs.length; i++) {
      var br = brs[i];
      var hw = br.width * 0.5 + 0.6;
      var hl = br.rampHalfLen + 0.8;
      if (br.acrossAxis === 'u') {
        if (Math.abs(s - br.s) <= hw && Math.abs(u - br.u) <= hl) {
          if (du == null || Math.abs(du) >= Math.abs(ds) * 0.65) return br;
        }
      } else {
        if (Math.abs(u - br.u) <= hw && Math.abs(s - br.s) <= hl) {
          if (ds == null || Math.abs(ds) >= Math.abs(du) * 0.65) return br;
        }
      }
    }
    return null;
  }

  /*Clips/splits street polylines against all canal troughs + quay curbs (`curbMargin`), cutting out BOTH:
     - any unbridged crossing over a canal/basin/lock/river, AND
     - the elevated bridge span itself (stopping the ground street cleanly at the bridge ramp toes on each bank so the
       elevated bridge mesh owns the crossing and zero flat street segments ever touch water or quay copings!). */
  function clipStreetWays(ways, net, opt) {
    opt = opt || {};
    var curbMargin = opt.curbMargin == null ? 2.2 : +opt.curbMargin;
    var stepM = opt.step == null ? 1.0 : +opt.step;
    var minSegLen = opt.minLen == null ? 5.0 : +opt.minLen;
    var out = [];

    function pointBlockedForFlatStreet(x, z, roadHalfW) {
      /* Ground-level street ways must NEVER enter any canal trough + quay wall + road half-width, even under a bridge
         (because at a bridge the elevated bridge structure owns the span between ramp abutments!). */
      if (pointInCanalTrough(net, x, z, curbMargin + roadHalfW * 0.5) !== null) return true;
      /* Also stop flat street ribbons at bridge ramp toes so flat pavement never undercuts a humpback bridge arch */
      var F = net.frame, us = F.us(x, z), u = us[0], s = us[1];
      for (var bi = 0; bi < net.bridges.length; bi++) {
        var br = net.bridges[bi];
        var spanCut = br.rampHalfLen * 0.82;
        if (br.acrossAxis === 'u') {
          if (Math.abs(s - br.s) <= br.width * 0.65 + roadHalfW * 0.4 && Math.abs(u - br.u) < spanCut) return true;
        } else {
          if (Math.abs(u - br.u) <= br.width * 0.65 + roadHalfW * 0.4 && Math.abs(s - br.s) < spanCut) return true;
        }
      }
      return false;
    }

    for (var wi = 0; wi < ways.length; wi++) {
      var w = ways[wi];
      if (!w || !w.pts || w.pts.length < 2) continue;
      var roadW = w.w == null ? (w.width == null ? 6.0 : +w.width) : +w.w;
      var hw = roadW * 0.5;
      /* Densify polyline at stepM and split into contiguous clear runs */
      var dense = [];
      for (var k = 0; k + 1 < w.pts.length; k++) {
        var p0 = w.pts[k], p1 = w.pts[k + 1];
        var segL = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        var nSteps = Math.max(1, Math.ceil(segL / stepM));
        for (var st = 0; st < nSteps; st++) {
          var f = st / nSteps;
          dense.push([lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f)]);
        }
      }
      dense.push([w.pts[w.pts.length - 1][0], w.pts[w.pts.length - 1][1]]);

      var runs = [], cur = [];
      for (var di = 0; di < dense.length; di++) {
        var pt = dense[di];
        if (!pointBlockedForFlatStreet(pt[0], pt[1], hw)) {
          cur.push(pt);
        } else {
          if (cur.length >= 2) runs.push(cur);
          cur = [];
        }
      }
      if (cur.length >= 2) runs.push(cur);

      var partIdx = 0;
      for (var ri = 0; ri < runs.length; ri++) {
        var run = runs[ri];
        /* Simplify collinear interior points while preserving exact clipped endpoints */
        var simp = [run[0]];
        for (var si = 1; si + 1 < run.length; si++) {
          var a = simp[simp.length - 1], b = run[si], c = run[si + 1];
          var ux1 = b[0] - a[0], uz1 = b[1] - a[1], l1 = Math.hypot(ux1, uz1);
          var ux2 = c[0] - b[0], uz2 = c[1] - b[1], l2 = Math.hypot(ux2, uz2);
          if (l1 > 1e-4 && l2 > 1e-4) {
            var cross = Math.abs((ux1 * uz2 - uz1 * ux2) / (l1 * l2));
            if (cross < 0.015 && Math.hypot(c[0] - a[0], c[1] - a[1]) < 24.0) continue;
          }
          simp.push(b);
        }
        simp.push(run[run.length - 1]);
        var totLen = 0;
        for (var q = 0; q + 1 < simp.length; q++) {
          totLen += Math.hypot(simp[q + 1][0] - simp[q][0], simp[q + 1][1] - simp[q][1]);
        }
        if (totLen >= minSegLen) {
          out.push({
            id: runs.length === 1 ? String(w.id) : (w.id + '.' + (partIdx++)),
            cls: w.cls || w.kind || 'side',
            w: roadW,
            width: roadW,
            tag: w.tag || null,
            pts: simp.map(function (p) { return [r3(p[0]), r3(p[1])]; })
          });
        }
      }
    }
    return out;
  }

  /* Audits a list of street ways against a canal network:
     Every 0.8 m sample along every way (expanded by its carriageway half-width) must keep clear of all wet canal troughs,
     lock chambers, basins, and rivers unless carried on an explicit registered bridge deck (`allowBridgeDeck: true`). */
  function streetClearOfCanals(ways, net, opt) {
    opt = opt || {};
    var margin = opt.margin == null ? 0.6 : +opt.margin;
    var allowBridge = !!opt.allowBridgeDeck;
    var F = net.frame;
    var intrusions = [];
    var checkedSegs = 0, checkedSamples = 0;

    for (var wi = 0; wi < (ways || []).length; wi++) {
      var w = ways[wi];
      if (!w || !w.pts || w.pts.length < 2) continue;
      var roadW = w.w == null ? (w.width == null ? 6.0 : +w.width) : +w.w;
      var hw = roadW * 0.45;
      for (var k = 0; k + 1 < w.pts.length; k++) {
        checkedSegs++;
        var p0 = w.pts[k], p1 = w.pts[k + 1];
        var dx = p1[0] - p0[0], dz = p1[1] - p0[1];
        var segL = Math.hypot(dx, dz);
        var nx = segL > 1e-6 ? (-dz / segL * hw) : 0;
        var nz = segL > 1e-6 ? (dx / segL * hw) : 0;
        var us0 = F.us(p0[0], p0[1]), us1 = F.us(p1[0], p1[1]);
        var du = us1[0] - us0[0], ds = us1[1] - us0[1];
        var nSteps = Math.max(1, Math.ceil(segL / 0.8));
        for (var st = 0; st <= nSteps; st++) {
          var f = st / nSteps;
          var cx = lerp(p0[0], p1[0], f), cz = lerp(p0[1], p1[1], f);
          var offsets = [[0, 0], [nx, nz], [-nx, -nz]];
          for (var oi = 0; oi < offsets.length; oi++) {
            checkedSamples++;
            var sx = cx + offsets[oi][0], sz = cz + offsets[oi][1];
            var hit = pointInCanalTrough(net, sx, sz, margin);
            if (hit) {
              if (allowBridge && pointOnBridgeDeck(net, sx, sz, du, ds)) continue;
              intrusions.push({
                wayId: w.id,
                x: r3(sx),
                z: r3(sz),
                targetId: hit.id || 'canal'
              });
              break;
            }
          }
          if (intrusions.length > 64) break;
        }
      }
    }
    return {
      ok: intrusions.length === 0,
      count: intrusions.length,
      intrusions: intrusions,
      checkedSegments: checkedSegs,
      checkedSamples: checkedSamples
    };
  }

  /* ---- 5. Deterministic KMASK Road & Towpath Raster Mask (Zeroed on All Canals) ----
     Paints clipped street ways (red channel) and towpaths (green channel) onto a KMASK.canvas, then explicitly stamps
     every canal trough, lock chamber, basin, and river channel to 0 (`#000`, alpha 1, red=0, green=0) so zero road
     paint ever bleeds into water or across canal walls! */
  function buildRoadMask(ways, towpath, net, opt) {
    if (typeof KMASK === 'undefined' || !KMASK || !KMASK.canvas) return null;
    opt = opt || {};
    var size = opt.size == null ? 512 : (opt.size | 0);
    var halfExtent = opt.halfExtent == null ? 960 : +opt.halfExtent;
    var scale = size / (halfExtent * 2.0);
    var toPx = function (x, z) {
      return [(x + halfExtent) * scale, (z + halfExtent) * scale];
    };
    var cv = KMASK.canvas(size, size);
    var g = cv.getContext();

    /* 1. Paint street ways into R channel (#ff0000) */
    for (var wi = 0; wi < (ways || []).length; wi++) {
      var w = ways[wi];
      if (!w || !w.pts || w.pts.length < 2) continue;
      var rw = (w.w == null ? (w.width == null ? 6.0 : +w.width) : +w.w) * scale;
      g.strokeStyle = '#ff0000';
      g.lineWidth = Math.max(1.2, rw);
      g.beginPath();
      var p0 = toPx(w.pts[0][0], w.pts[0][1]);
      g.moveTo(p0[0], p0[1]);
      for (var k = 1; k < w.pts.length; k++) {
        var pk = toPx(w.pts[k][0], w.pts[k][1]);
        g.lineTo(pk[0], pk[1]);
      }
      g.stroke();
    }

    /* 2. Paint non-bridge towpath strips into G channel (#00ff00) */
    if (towpath && towpath.nodes && towpath.edges) {
      for (var ei = 0; ei < towpath.edges.length; ei++) {
        var ed = towpath.edges[ei];
        if (ed.kind === 'bridge_deck' || ed.kind === 'bridge_ramp' || ed.kind === 'aqueduct_walk') continue;
        var na = towpath.nodes[ed.a], nb = towpath.nodes[ed.b];
        if (!na || !nb) continue;
        g.strokeStyle = '#00ff00';
        g.lineWidth = Math.max(1.0, (ed.w == null ? 3.2 : +ed.w) * scale);
        g.beginPath();
        var qa = toPx(na.x, na.z), qb = toPx(nb.x, nb.z);
        g.moveTo(qa[0], qa[1]);
        g.lineTo(qb[0], qb[1]);
        g.stroke();
      }
    }

    /* 3. Stamp every wet canal trough, lock chamber, basin, and river channel strictly to #000000 (R=0, G=0, B=0) */
    g.fillStyle = '#000000';
    var F = net.frame;
    for (var ti = 0; ti < net.troughs.length; ti++) {
      var tr = net.troughs[ti];
      var padT = Math.min(1.8, (tr.curbPad == null ? 2.6 : tr.curbPad) * 0.7);
      var poly = F.rectPoly(tr.u0 - padT, tr.u1 + padT, tr.s0 - padT, tr.s1 + padT);
      g.beginPath();
      var tp0 = toPx(poly[0][0], poly[0][1]);
      g.moveTo(tp0[0], tp0[1]);
      for (var pi = 1; pi < poly.length; pi++) {
        var tpi = toPx(poly[pi][0], poly[pi][1]);
        g.lineTo(tpi[0], tpi[1]);
      }
      g.closePath();
      g.fill();
    }
    for (var ci = 0; ci < (net.chambers || []).length; ci++) {
      var ch = net.chambers[ci];
      var cpoly = F.rectPoly(ch.u - ch.w * 0.5 - 1.8, ch.u + ch.w * 0.5 + 1.8, ch.s0 - 1.8, ch.s1 + 1.8);
      g.beginPath();
      var cp0 = toPx(cpoly[0][0], cpoly[0][1]);
      g.moveTo(cp0[0], cp0[1]);
      for (var cpi = 1; cpi < cpoly.length; cpi++) {
        var cpNext = toPx(cpoly[cpi][0], cpoly[cpi][1]);
        g.lineTo(cpNext[0], cpNext[1]);
      }
      g.closePath();
      g.fill();
    }
    for (var ri = 0; ri < (net.rivers || []).length; ri++) {
      var rv = net.rivers[ri];
      if (!rv.ptsUs || rv.ptsUs.length < 2) continue;
      var maxHw = 14;
      for (var rpi = 0; rpi < rv.ptsUs.length; rpi++) {
        if (rv.ptsUs[rpi][3] != null && rv.ptsUs[rpi][3] > maxHw) maxHw = rv.ptsUs[rpi][3];
      }
      g.strokeStyle = '#000000';
      g.lineWidth = Math.max(2.0, maxHw * 2.0 * scale);
      g.beginPath();
      var rp0 = F.at(rv.ptsUs[0][0], rv.ptsUs[0][1]);
      var m0 = toPx(rp0[0], rp0[1]);
      g.moveTo(m0[0], m0[1]);
      for (var rpk = 1; rpk < rv.ptsUs.length; rpk++) {
        var rpn = F.at(rv.ptsUs[rpk][0], rv.ptsUs[rpk][1]);
        var mn = toPx(rpn[0], rpn[1]);
        g.lineTo(mn[0], mn[1]);
      }
      g.stroke();
    }

    var raw = cv.data;
    function sample(x, z) {
      var ix = Math.floor((x + halfExtent) * scale);
      var iz = Math.floor((z + halfExtent) * scale);
      if (ix < 0 || iz < 0 || ix >= size || iz >= size) return { road: 0, towpath: 0 };
      var o = (iz * size + ix) * 4;
      return { road: raw[o] / 255.0, towpath: raw[o + 1] / 255.0 };
    }

    /* Audit helper: samples dense grid inside every wet canal trough & lock chamber and counts non-zero road pixels */
    function auditZeroOnCanals() {
      var hits = 0, tested = 0;
      for (var q = 0; q < net.troughs.length; q++) {
        var t = net.troughs[q];
        var du = Math.max(2.0, (t.u1 - t.u0) / 10.0);
        var ds = Math.max(2.5, (t.s1 - t.s0) / 14.0);
        for (var u = t.u0 + 0.9; u <= t.u1 - 0.9; u += du) {
          for (var s = t.s0 + 0.9; s <= t.s1 - 0.9; s += ds) {
            var wp = F.at(u, s);
            var sv = sample(wp[0], wp[1]);
            tested++;
            if (sv.road > 0 || sv.towpath > 0) hits++;
          }
        }
      }
      for (var cIdx = 0; cIdx < (net.chambers || []).length; cIdx++) {
        var chb = net.chambers[cIdx];
        for (var cs = chb.s0 + 1.5; cs <= chb.s1 - 1.5; cs += 4.0) {
          var cwp = F.at(chb.u, cs);
          var csv = sample(cwp[0], cwp[1]);
          tested++;
          if (csv.road > 0 || csv.towpath > 0) hits++;
        }
      }
      return { ok: hits === 0, hits: hits, tested: tested, hash: KMASK.hash(cv) };
    }

    return {
      canvas: cv,
      size: size,
      halfExtent: halfExtent,
      hash: KMASK.hash(cv),
      sample: sample,
      auditZeroOnCanals: auditZeroOnCanals
    };
  }

  /* Towpath connectivity & slope verifier */
  function towpathReachable(graph, startId, requiredIds, maxSlope) {
    if (!graph || !graph.nodes || !graph.edges) return false;
    var cap = maxSlope == null ? 0.18 : +maxSlope;
    var adj = {};
    for (var i = 0; i < graph.edges.length; i++) {
      var e = graph.edges[i];
      if (e.slope > cap + 1e-6) return false;
      (adj[e.a] || (adj[e.a] = [])).push(e.b);
      (adj[e.b] || (adj[e.b] = [])).push(e.a);
    }
    var seen = {}, q = [startId];
    seen[startId] = true;
    while (q.length) {
      var cur = q.shift(), nb = adj[cur] || [];
      for (var j = 0; j < nb.length; j++) {
        if (!seen[nb[j]]) {
          seen[nb[j]] = true;
          q.push(nb[j]);
        }
      }
    }
    var req = requiredIds || [];
    for (var r = 0; r < req.length; r++) {
      if (!seen[req[r]]) return false;
    }
    return true;
  }

  var api = {
    version: 1,
    SPECS: SPECS,
    clamp: clamp,
    lerp: lerp,
    smooth: smooth,
    r3: r3,
    yawFromZ: yawFromZ,
    vesselYaw: vesselYaw,
    frame: frame,
    makeObb: makeObb,
    vesselObb: vesselObb,
    obbCorners: obbCorners,
    obbOverlap: obbOverlap,
    pointInObb: pointInObb,
    pound: pound,
    poundsMonotonic: poundsMonotonic,
    bridge: bridge,
    bridgeClearsVessel: bridgeClearsVessel,
    aqueduct: aqueduct,
    aqueductOk: aqueductOk,
    network: network,
    pointInCanalTrough: pointInCanalTrough,
    pointOnBridgeDeck: pointOnBridgeDeck,
    clipStreetWays: clipStreetWays,
    streetClearOfCanals: streetClearOfCanals,
    buildRoadMask: buildRoadMask,
    towpathReachable: towpathReachable
  };

  var root = typeof globalThis !== 'undefined' ? globalThis : this;
  root.KTRANSIT_CANAL = api;
  return api;
})();
