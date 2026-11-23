// prefix: kcanal
// ================================================================= TRANSIT KIT — Miter-Lock Flights, Zero-Head Gate Law & Kinematics ([G data])
// Pure [G data] miter-lock flight builder (1..N risers, single or twin parallel lanes), KSCHED paddle-sluice timelines,
// strict zero-head miter-gate law, and live 2D gate-leaf OBB kinematics for collision auditing.
(function (K) {
  'use strict';

  var PI = Math.PI;
  var r3 = K.r3;

  /* Default 360 s miter-lock paddle-sluice cycle:
     0..65    LOWER_OPEN     (65 s)  y = yLow,  lo = openDeg, hi = 0
     65..85   CLOSING_LOWER  (20 s)  y = yLow,  lo = openDeg->0, hi = 0
     85..155  FILLING        (70 s)  y = yLow->yHigh, lo = 0, hi = 0
     155..175 OPENING_UPPER  (20 s)  y = yHigh, lo = 0, hi = 0->openDeg
     175..240 UPPER_OPEN     (65 s)  y = yHigh, lo = 0, hi = openDeg
     240..260 CLOSING_UPPER  (20 s)  y = yHigh, lo = 0, hi = openDeg->0
     260..340 EMPTYING       (80 s)  y = yHigh->yLow, lo = 0, hi = 0
     340..360 OPENING_LOWER  (20 s)  y = yLow,  lo = 0->openDeg, hi = 0
     Note: For a 2-riser staircase flight:
       - Up-bound synchronized pair:   riser 0 phase = p0, riser 1 phase = (p0 + 185) % 360
         -> at local t in [175, 240], riser 0 is UPPER_OPEN and riser 1 is LOWER_OPEN (both at yMid, zero head!).
       - Down-bound synchronized pair: riser 1 phase = p1, riser 0 phase = (p1 + 175) % 360
         -> when riser 1 reaches LOWER_OPEN ([0, 65]), riser 0 is simultaneously UPPER_OPEN ([175, 240]) at yMid! */
  var DEFAULT_LOCK_PERIOD = 360;

  function miterChamberPoly(F, uMid, hw, sLoHinge, sHiHinge, miterRad) {
    var vOff = hw * Math.tan(miterRad);
    return [
      F.at(uMid - hw, sLoHinge + 0.04),
      F.at(uMid, sLoHinge + vOff),
      F.at(uMid + hw, sLoHinge + 0.04),
      F.at(uMid + hw, sHiHinge - 0.04),
      F.at(uMid, sHiHinge + vOff - 0.06),
      F.at(uMid - hw, sHiHinge - 0.04)
    ];
  }

  function lockTimeline(yLow, yHigh, opt) {
    opt = opt || {};
    var period = opt.period == null ? DEFAULT_LOCK_PERIOD : +opt.period;
    var phase = opt.phase == null ? 0 : +opt.phase;
    var openDeg = opt.openDeg == null ? 68 : +opt.openDeg;
    var k = period / 360.0;
    return KSCHED.timeline({
      period: period,
      phase: phase,
      segments: [
        { dur: 65 * k, from: [yLow, openDeg, 0], to: [yLow, openDeg, 0], ease: 'linear', name: 'LOWER_OPEN' },
        { dur: 20 * k, from: [yLow, openDeg, 0], to: [yLow, 0, 0], ease: 'smooth', name: 'CLOSING_LOWER' },
        { dur: 70 * k, from: [yLow, 0, 0], to: [yHigh, 0, 0], ease: 'smooth', name: 'FILLING' },
        { dur: 20 * k, from: [yHigh, 0, 0], to: [yHigh, 0, openDeg], ease: 'smooth', name: 'OPENING_UPPER' },
        { dur: 65 * k, from: [yHigh, 0, openDeg], to: [yHigh, 0, openDeg], ease: 'linear', name: 'UPPER_OPEN' },
        { dur: 20 * k, from: [yHigh, 0, openDeg], to: [yHigh, 0, 0], ease: 'smooth', name: 'CLOSING_UPPER' },
        { dur: 80 * k, from: [yHigh, 0, 0], to: [yLow, 0, 0], ease: 'smooth', name: 'EMPTYING' },
        { dur: 20 * k, from: [yLow, 0, 0], to: [yLow, openDeg, 0], ease: 'smooth', name: 'OPENING_LOWER' }
      ]
    });
  }

  function chamber(spec, F) {
    var miterDeg = spec.miterDeg == null ? 22.0 : +spec.miterDeg;
    var openDeg = spec.openDeg == null ? 68.0 : +spec.openDeg;
    var miterRad = miterDeg * PI / 180.0;
    var w = spec.w == null ? 5.2 : +spec.w;
    var s0 = +spec.s0, s1 = +spec.s1;
    var l = spec.l == null ? +(s1 - s0).toFixed(3) : +spec.l;
    var yLow = +spec.yLow, yHigh = +spec.yHigh;
    var lift = +(yHigh - yLow).toFixed(4);
    var bedY = spec.bedY == null ? r3(yLow - 2.15) : +spec.bedY;
    var copeY = spec.copeY == null ? r3(yHigh + 1.48) : +spec.copeY;
    var period = spec.period == null ? DEFAULT_LOCK_PERIOD : +spec.period;
    var phase = spec.phase == null ? 0 : +spec.phase;
    var hingeInset = spec.hingeInset == null ? 0.45 : +spec.hingeInset;
    var sLoHinge = +(s0 + hingeInset).toFixed(3);
    var sHiHinge = +(s1 - hingeInset).toFixed(3);
    var leafLen = +((w * 0.5) / Math.cos(miterRad) + 0.04).toFixed(3);

    var c = {
      id: String(spec.id),
      flight: spec.flight || String(spec.id),
      lane: spec.lane || 'single',
      riser: spec.riser == null ? 0 : (spec.riser | 0),
      u: spec.u == null ? 0 : +spec.u,
      s0: s0,
      s1: s1,
      sMid: +(0.5 * (s0 + s1)).toFixed(3),
      sLoHinge: sLoHinge,
      sHiHinge: sHiHinge,
      w: w,
      l: l,
      leafLen: leafLen,
      miterDeg: miterDeg,
      openDeg: openDeg,
      yLow: yLow,
      yHigh: yHigh,
      lift: lift,
      bedY: bedY,
      copeY: copeY,
      period: period,
      phase: phase,
      poly: F ? miterChamberPoly(F, spec.u == null ? 0 : +spec.u, w * 0.49, sLoHinge, sHiHinge, miterRad) : null,
      timeline: lockTimeline(yLow, yHigh, { period: period, phase: phase, openDeg: openDeg })
    };
    return c;
  }

  /* Build a 1..N riser single or twin miter-lock flight with synchronized up-bound & down-bound phases */
  function lockFlight(cfg, F) {
    var id = String(cfg.id || 'L1');
    var risers = cfg.risers == null ? 1 : Math.max(1, cfg.risers | 0);
    var lanes = cfg.lanes == null ? 1 : (cfg.lanes | 0);
    var yBottom = +cfg.yLow;
    var yTop = +cfg.yHigh;
    var stepLift = (yTop - yBottom) / risers;
    var riserLen = cfg.chamberLen == null ? 27.2 : +cfg.chamberLen;
    var sillGap = cfg.sillGap == null ? 0.8 : +cfg.sillGap;
    var w = cfg.chamberW == null ? 5.6 : +cfg.chamberW;
    var islandW = cfg.islandW == null ? 4.0 : +cfg.islandW;
    var sStart = +cfg.s0;
    var period = cfg.period == null ? DEFAULT_LOCK_PERIOD : +cfg.period;
    var basePhase = cfg.phase == null ? 0 : +cfg.phase;
    var k = period / 360.0;

    var chambers = [];
    var laneDefs = lanes === 2
      ? [
          { suffix: 'a', name: 'west', u: -(islandW * 0.5 + w * 0.5), dir: 'up', baseP: basePhase },
          { suffix: 'b', name: 'east', u: +(islandW * 0.5 + w * 0.5), dir: 'down', baseP: (basePhase + 90 * k) % period }
        ]
      : [
          { suffix: '', name: 'center', u: cfg.u == null ? 0 : +cfg.u, dir: 'both', baseP: basePhase }
        ];

    for (var li = 0; li < laneDefs.length; li++) {
      var ld = laneDefs[li];
      for (var ri = 0; ri < risers; ri++) {
        var rS0 = +(sStart + ri * (riserLen + sillGap)).toFixed(3);
        var rS1 = +(rS0 + riserLen).toFixed(3);
        var ryLo = +(yBottom + ri * stepLift).toFixed(4);
        var ryHi = +(yBottom + (ri + 1) * stepLift).toFixed(4);
        var ph;
        if (ld.dir === 'down' && risers > 1) {
          /* Top riser has ld.baseP; lower riser reaches UPPER_OPEN when top riser reaches LOWER_OPEN */
          var fromTop = (risers - 1) - ri;
          ph = (ld.baseP + fromTop * 175 * k) % period;
        } else {
          /* Up-bound staircase: riser ri reaches LOWER_OPEN when riser ri-1 reaches UPPER_OPEN (+185 s) */
          ph = (ld.baseP + ri * 185 * k) % period;
        }
        var suffixR = risers === 1 ? '' : (ri === 0 ? '_low' : (ri === risers - 1 ? '_high' : ('_r' + ri)));
        chambers.push(chamber({
          id: id + ld.suffix + suffixR,
          flight: id,
          lane: ld.name,
          riser: ri,
          u: ld.u,
          s0: rS0,
          s1: rS1,
          w: w,
          l: riserLen,
          yLow: ryLo,
          yHigh: ryHi,
          period: period,
          phase: ph
        }, F));
      }
    }

    return {
      id: id,
      risers: risers,
      lanes: lanes,
      yLow: yBottom,
      yHigh: yTop,
      totalLift: +(yTop - yBottom).toFixed(4),
      maxRiserLift: +stepLift.toFixed(4),
      s0: sStart,
      s1: +(sStart + risers * riserLen + (risers - 1) * sillGap).toFixed(3),
      chamberW: w,
      chamberLen: riserLen,
      islandW: lanes === 2 ? islandW : 0,
      chambers: chambers
    };
  }

  function lockState(ch, t) {
    var tt = t == null ? 0 : +t;
    var st = ch.timeline.at(tt);
    var y = st.value[0], loDeg = st.value[1], hiDeg = st.value[2];
    return {
      id: ch.id,
      phaseName: st.name,
      u: st.u,
      y: y,
      yLow: ch.yLow,
      yHigh: ch.yHigh,
      headLow: Math.abs(y - ch.yLow),
      headHigh: Math.abs(ch.yHigh - y),
      lowerGateDeg: loDeg,
      upperGateDeg: hiDeg,
      sluiceFlow: st.name === 'FILLING' ? 1 : (st.name === 'EMPTYING' ? -1 : 0)
    };
  }

  /* Zero-Head Miter-Gate Law:
     Neither lower nor upper miter gate may swing > 0.05 deg against > 0.02 m of hydraulic head! */
  function miterLawOk(stateSample) {
    if (!stateSample) return false;
    if (stateSample.lowerGateDeg > 0.05 && stateSample.headLow > 0.02) return false;
    if (stateSample.upperGateDeg > 0.05 && stateSample.headHigh > 0.02) return false;
    return true;
  }

  /* Computes the exact 4 articulated miter-gate leaf 2D OBBs + Three.js hinge poses for a chamber at state `st`.
     When deg = 0 (closed), both leaves meet at the upstream-pointing miter V-apex.
     When deg = openDeg (68 deg, with miterDeg = 22 deg -> 90 deg), both leaves recess flush along the side walls u = +-w/2! */
  function gateLeafPoses(ch, st, F) {
    var miterRad = (ch.miterDeg == null ? 22.0 : ch.miterDeg) * PI / 180.0;
    var hw = ch.w * 0.5;
    var leafLen = ch.leafLen == null ? (hw / Math.cos(miterRad)) : ch.leafLen;
    var thick = 0.28;
    var ends = [
      { which: 'lower', s: ch.sLoHinge, deg: st.lowerGateDeg },
      { which: 'upper', s: ch.sHiHinge, deg: st.upperGateDeg }
    ];
    var leaves = [];
    for (var ei = 0; ei < ends.length; ei++) {
      var end = ends[ei];
      var ang = miterRad + (end.deg * PI / 180.0);
      var ca = Math.cos(ang), sa = Math.sin(ang);
      var sides = [-1, 1];
      for (var si = 0; si < 2; si++) {
        var side = sides[si];
        /* Hinge recessed slightly (+0.14 m) into hollow quoin pocket in chamber wall */
        var hu = ch.u + side * (hw + 0.12);
        var hs = end.s;
        /* Direction vector in (u, s) from hinge to miter tip */
        var du = -side * ca;
        var ds = sa;
        var hp = F.at(hu, hs);
        var wx = du * F.UX[0] + ds * F.SX[0];
        var wz = du * F.UX[1] + ds * F.SX[1];
        var yaw = K.vesselYaw(wx, wz);
        var midP = F.at(hu + du * leafLen * 0.5, hs + ds * leafLen * 0.5);
        leaves.push({
          chamberId: ch.id,
          which: end.which,
          side: side,
          deg: end.deg,
          hingeX: hp[0],
          hingeZ: hp[1],
          baseY: ch.copeY - 4.62,
          yaw: yaw,
          obb: K.makeObb(midP[0], midP[1], yaw, leafLen, thick, 0)
        });
      }
    }
    return leaves;
  }

  K.DEFAULT_LOCK_PERIOD = DEFAULT_LOCK_PERIOD;
  K.lockTimeline = lockTimeline;
  K.chamber = chamber;
  K.lockFlight = lockFlight;
  K.lockState = lockState;
  K.miterLawOk = miterLawOk;
  K.gateLeafPoses = gateLeafPoses;
})(KCANAL);
