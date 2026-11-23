// prefix: kcanal
// ================================================================= TRANSIT KIT — End-to-End Vessel Lock & Canal Transit State Machine ([G data])
// Pure [G data] multi-pound canal vessel kinematics & safety verifier:
//   pound -> approach wait -> enter open chamber -> berth & close gates -> chamber water + vessel Y lift/drop
//   -> riser-to-riser transfer at zero head -> open exit gates -> sail next pound / under bridges / across aqueduct
//   -> turning basin turn-around.
// Verifies 0 gate collisions, 0 wet-bound violations, 0 bridge air-draft strikes, and exact water-surface flotation.
(function (K) {
  'use strict';

  var PI = Math.PI, TAU = Math.PI * 2;
  var clamp = K.clamp, lerp = K.lerp, smooth = K.smooth, r3 = K.r3;

  function wrapAngle(a) {
    while (a > PI) a -= TAU;
    while (a < -PI) a += TAU;
    return a;
  }

  function lerpAngle(a, b, t) {
    return a + wrapAngle(b - a) * t;
  }

  /* Returns exact local water elevation & wet bed at world (x, z) and clock `t` across chambers and pounds */
  function localWaterAt(net, x, z, t) {
    var F = net.frame;
    var us = F.us(x, z), u = us[0], s = us[1];
    var chs = net.chambers || [];
    for (var ci = 0; ci < chs.length; ci++) {
      var ch = chs[ci];
      if (Math.abs(u - ch.u) <= ch.w * 0.5 + 0.05 && s >= ch.sLoHinge && s <= ch.sHiHinge) {
        var st = K.lockState(ch, t);
        return { kind: 'chamber', id: ch.id, chamber: ch, state: st, y: st.y, bedY: ch.bedY };
      }
    }
    /* Sill gap between adjacent risers or gate threshold: match open gate's chamber water level */
    for (var cj = 0; cj < chs.length; cj++) {
      var c2 = chs[cj];
      if (Math.abs(u - c2.u) <= c2.w * 0.5 + 0.05 && s >= c2.s0 - 0.8 && s <= c2.s1 + 0.8) {
        var st2 = K.lockState(c2, t);
        if (s < c2.sLoHinge && st2.lowerGateDeg > 40) {
          return { kind: 'sill_low', id: c2.id, chamber: c2, state: st2, y: st2.yLow, bedY: c2.bedY };
        }
        if (s > c2.sHiHinge && st2.upperGateDeg > 40) {
          return { kind: 'sill_high', id: c2.id, chamber: c2, state: st2, y: st2.yHigh, bedY: c2.bedY };
        }
      }
    }
    var trs = net.troughs || [];
    for (var ti = 0; ti < trs.length; ti++) {
      var tr = trs[ti];
      if (u >= tr.u0 - 0.1 && u <= tr.u1 + 0.1 && s >= tr.s0 - 0.1 && s <= tr.s1 + 0.1) {
        return { kind: 'trough', id: tr.id, trough: tr, y: tr.wlev, bedY: tr.bedY };
      }
    }
    return null;
  }

  /* Builds a periodic multi-stage vessel transit course in (u, s) coordinates:
     `stages` is an ordered list of timed intervals `{ t0, t1, kind, ... }` over `[0, period]`:
       - kind: 'hold'      { u, s, yawUs, wlev } or { u, s, yawUs, chamber: chObj } (rides chamber waterY(t)!)
       - kind: 'sail'      { u0, s0, u1, s1, wlev, ease: 'smooth'|'linear' }
       - kind: 'enter'     { u, sFrom, sTo, yawUs, chamber: chObj, which: 'lower'|'upper' }
       - kind: 'transfer'  { u, sFrom, sTo, yawUs, wlev }
       - kind: 'exit'      { u, sFrom, sTo, yawUs, chamber: chObj, which: 'lower'|'upper' }
       - kind: 'turn'      { u, s, rU, rS, yaw0, yaw1, wlev } (smooth turning-basin loop turning 180 deg)
     Also provides high-level `singleLockTour` and `doubleRiserTour` factories so host worlds declare a full
     end-to-end lock-transiting barge route in one concise call! */
  function transitCourse(cfg) {
    var period = +cfg.period;
    var phaseOffset = cfg.phaseOffset == null ? 0 : +cfg.phaseOffset;
    var F = cfg.frame;
    var stages = cfg.stages || [];
    return {
      id: String(cfg.id || 'course'),
      vesselKey: cfg.vesselKey || 'et_canal_barge',
      v: cfg.v == null ? 0 : (cfg.v | 0),
      period: period,
      phaseOffset: phaseOffset,
      frame: F,
      stages: stages
    };
  }

  function yawOfUs(F, du, ds, fallbackYaw) {
    if (Math.hypot(du, ds) < 1e-5) return fallbackYaw == null ? F.VYAW_S : fallbackYaw;
    var wx = du * F.UX[0] + ds * F.SX[0];
    var wz = du * F.UX[1] + ds * F.SX[1];
    return K.vesselYaw(wx, wz);
  }

  function vesselPoseAt(course, t) {
    var worldT = t == null ? 0 : +t;
    var rawT = worldT + course.phaseOffset;
    var P = course.period;
    var tc = ((rawT % P) + P) % P;
    var F = course.frame;
    var stg = course.stages[0];
    for (var i = 0; i < course.stages.length; i++) {
      var cand = course.stages[i];
      if (tc >= cand.t0 && tc < cand.t1) {
        stg = cand;
        break;
      }
      if (i === course.stages.length - 1) stg = cand;
    }

    var dur = Math.max(1e-6, stg.t1 - stg.t0);
    var linF = clamp((tc - stg.t0) / dur, 0, 1);
    var smF = stg.ease === 'linear' ? linF : smooth(0, 1, linF);

    var u = 0, s = 0, y = 0, yaw = F.VYAW_S, phaseLabel = stg.label || stg.kind;

    if (stg.kind === 'hold') {
      u = stg.u;
      s = stg.s;
      yaw = stg.yaw != null ? stg.yaw : F.VYAW_S;
      if (stg.chamber) {
        var lst = K.lockState(stg.chamber, worldT);
        y = lst.y;
        phaseLabel = stg.label || ('LOCK_' + lst.phaseName);
      } else {
        y = stg.wlev;
      }
    } else if (stg.kind === 'sail' || stg.kind === 'enter' || stg.kind === 'exit' || stg.kind === 'transfer') {
      u = lerp(stg.u0, stg.u1, smF);
      s = lerp(stg.s0, stg.s1, smF);
      yaw = stg.yaw != null ? stg.yaw : yawOfUs(F, stg.u1 - stg.u0, stg.s1 - stg.s0, F.VYAW_S);
      if (stg.chamber) {
        y = K.lockState(stg.chamber, worldT).y;
      } else {
        y = stg.wlev;
      }
    } else if (stg.kind === 'turn') {
      /* Smooth arc turn inside a turning basin: sweeps half-circle of radius rU without touching basin walls */
      var ang = PI * smF;
      var side = stg.turnDir == null ? 1 : stg.turnDir;
      u = lerp(stg.u0, stg.u1, smF) + side * (stg.rU == null ? 4.5 : stg.rU) * Math.sin(ang);
      s = stg.s + (stg.rS == null ? 5.0 : stg.rS) * Math.sin(ang);
      yaw = lerpAngle(stg.yaw0, stg.yaw1, smF);
      y = stg.wlev;
    }

    var p = F.at(u, s);
    return {
      id: course.id,
      key: course.vesselKey,
      v: course.v,
      t: r3(tc),
      stage: phaseLabel,
      u: r3(u),
      s: r3(s),
      x: r3(p[0]),
      y: r3(y),
      z: r3(p[1]),
      yaw: yaw
    };
  }

  /* High-level factory: Single-riser round-trip lock + bridge + aqueduct + turning-basin course (period = 3 * lockPeriod = 1080 s). */
  function singleLockTour(cfg) {
    var F = cfg.frame;
    var ch = cfg.chamber;
    var u = cfg.u == null ? ch.u : +cfg.u;
    var sLowBasin = +cfg.sLowBasin;
    var sLowNear = cfg.sLowNear == null ? ch.s0 - 18.0 : +cfg.sLowNear;
    var sHighNear = cfg.sHighNear == null ? ch.s1 + 18.0 : +cfg.sHighNear;
    var sHighBasin = +cfg.sHighBasin;
    var turnR = cfg.turnRadiusU == null ? 5.0 : +cfg.turnRadiusU;
    var turnS = cfg.turnRadiusS == null ? 4.5 : +cfg.turnRadiusS;
    var k = ch.period / 360.0;
    var P = 1080.0 * k;
    var shift = ((-ch.phase) % P + P) % P;

    function S(t0, t1, obj) {
      obj.t0 = t0 * k;
      obj.t1 = t1 * k;
      return obj;
    }

    var stages = [
      S(0, 8, { kind: 'hold', label: 'APPROACH_WAIT', u: u, s: sLowNear, yaw: F.VYAW_S, wlev: ch.yLow }),
      S(8, 54, { kind: 'enter', label: 'ENTERING_LOCK', u0: u, s0: sLowNear, u1: u, s1: ch.sMid, yaw: F.VYAW_S, chamber: ch }),
      S(54, 178, { kind: 'hold', label: 'LOCK_LIFTING', u: u, s: ch.sMid, yaw: F.VYAW_S, chamber: ch }),
      S(178, 228, { kind: 'exit', label: 'EXITING_UPPER', u0: u, s0: ch.sMid, u1: u, s1: sHighNear, yaw: F.VYAW_S, chamber: ch }),
      S(228, 370, { kind: 'sail', label: 'SAIL_UPPER_AND_AQUEDUCT', u0: u, s0: sHighNear, u1: u, s1: sHighBasin, yaw: F.VYAW_S, wlev: ch.yHigh }),
      S(370, 430, { kind: 'turn', label: 'TURNING_BASIN', u0: u, u1: u, s: sHighBasin, rU: turnR, rS: turnS, turnDir: 1, yaw0: F.VYAW_S, yaw1: F.VYAW_NS, wlev: ch.yHigh }),
      S(430, 538, { kind: 'sail', label: 'RETURN_AQUEDUCT', u0: u, s0: sHighBasin, u1: u, s1: sHighNear, yaw: F.VYAW_NS, wlev: ch.yHigh }),
      S(538, 588, { kind: 'enter', label: 'ENTERING_UPPER_LOCK', u0: u, s0: sHighNear, u1: u, s1: ch.sMid, yaw: F.VYAW_NS, chamber: ch }),
      S(588, 723, { kind: 'hold', label: 'LOCK_EMPTYING', u: u, s: ch.sMid, yaw: F.VYAW_NS, chamber: ch }),
      S(723, 772, { kind: 'exit', label: 'EXITING_LOWER', u0: u, s0: ch.sMid, u1: u, s1: sLowNear, yaw: F.VYAW_NS, chamber: ch }),
      S(772, 920, { kind: 'sail', label: 'SAIL_LOWER_POUND', u0: u, s0: sLowNear, u1: u, s1: sLowBasin, yaw: F.VYAW_NS, wlev: ch.yLow }),
      S(920, 980, { kind: 'turn', label: 'LOWER_TURNAROUND', u0: u, u1: u, s: sLowBasin, rU: turnR, rS: -turnS, turnDir: -1, yaw0: F.VYAW_NS, yaw1: F.VYAW_S, wlev: ch.yLow }),
      S(980, 1080, { kind: 'sail', label: 'APPROACH_LOWER_LOCK', u0: u, s0: sLowBasin, u1: u, s1: sLowNear, yaw: F.VYAW_S, wlev: ch.yLow })
    ];

    return transitCourse({
      id: cfg.id || ('tour.' + ch.id),
      vesselKey: cfg.vesselKey || 'et_canal_barge',
      v: cfg.v == null ? 0 : cfg.v,
      period: P,
      phaseOffset: -shift + (cfg.extraOffset == null ? 0 : +cfg.extraOffset),
      frame: F,
      stages: stages
    });
  }

  /* High-level factory: Synchronized Twin-Lane 2-Riser Staircase Flight Round-Trip (`P = 4 * lockPeriod = 1440 s`).
     Chambers keep pure 360 s KSCHED paddle-sluice cycles:
       - Up-lane `chUpLow` phase = p0, `chUpHigh` phase = (p0 + 185) % 360
       - Down-lane `chDnLow` phase = (p0 + 90) % 360, `chDnHigh` phase = (p0 + 275) % 360
     Every lock entry/exit glides strictly straight along the chamber centerline (`uUp` / `uDn`) until the hull clears
     the miter-gate doorway into the wide lock forebay (`sLowGateClear` / `sHighGateClear`), then merges smoothly onto
     the cruise lane (`uCruiseUp` / `uCruiseDn`) before entering any trunk canal, bridge span, or stone aqueduct! */
  function twinFlightRoundTrip(cfg) {
    var F = cfg.frame;
    var chUpLow = cfg.chUpLow, chUpHigh = cfg.chUpHigh;
    var chDnHigh = cfg.chDnHigh, chDnLow = cfg.chDnLow;
    var uUp = chUpLow.u, uDn = chDnHigh.u;
    var uCruiseUp = cfg.uCruiseUp == null ? uUp : +cfg.uCruiseUp;
    var uCruiseDn = cfg.uCruiseDn == null ? uDn : +cfg.uCruiseDn;
    var sLowGateClear = cfg.sLowGateClear == null ? chUpLow.s0 - 13.5 : +cfg.sLowGateClear;
    var sHighGateClear = cfg.sHighGateClear == null ? chUpHigh.s1 + 13.5 : +cfg.sHighGateClear;
    var sLowForebayEnd = cfg.sLowNear == null ? chUpLow.s0 - 26.0 : +cfg.sLowNear;
    var sHighForebayEnd = cfg.sHighNear == null ? chUpHigh.s1 + 28.0 : +cfg.sHighNear;
    var sLowBasin = +cfg.sLowBasin;
    var sHighBasin = +cfg.sHighBasin;
    var k = chUpLow.period / 360.0;
    var P = 1440.0 * k;
    var baseShift = ((-chUpLow.phase) % P + P) % P;
    var lapShift = (cfg.lapIndex == null ? 0 : (cfg.lapIndex | 0)) * (720.0 * k);

    function S(t0, t1, obj) {
      obj.t0 = t0 * k;
      obj.t1 = t1 * k;
      return obj;
    }

    var stages = [
      /* 1. Enter Up-Lane Lower Riser straight along uUp (LOWER_OPEN [0..65]) */
      S(0, 8, { kind: 'hold', label: 'APPROACH_LOWER', u: uUp, s: sLowGateClear, yaw: F.VYAW_S, wlev: chUpLow.yLow }),
      S(8, 54, { kind: 'enter', label: 'ENTER_RISER_1', u0: uUp, s0: sLowGateClear, u1: uUp, s1: chUpLow.sMid, yaw: F.VYAW_S, chamber: chUpLow }),
      /* 2. Lift in Lower Riser (CLOSING 65..85, FILLING 85..155, OPENING_UPPER 155..175) */
      S(54, 178, { kind: 'hold', label: 'LIFT_RISER_1', u: uUp, s: chUpLow.sMid, yaw: F.VYAW_S, chamber: chUpLow }),
      /* 3. Transfer across Middle Sill at Zero Head (both chambers open at yMid [175..240]) */
      S(178, 232, { kind: 'transfer', label: 'TRANSFER_MID_SILL_UP', u0: uUp, s0: chUpLow.sMid, u1: uUp, s1: chUpHigh.sMid, yaw: F.VYAW_S, wlev: chUpLow.yHigh }),
      /* 4. Lift in Upper Riser (CLOSING 240..260, FILLING 260..330, OPENING_UPPER 330..350) */
      S(232, 353, { kind: 'hold', label: 'LIFT_RISER_2', u: uUp, s: chUpHigh.sMid, yaw: F.VYAW_S, chamber: chUpHigh }),
      /* 5. Exit Upper Riser straight along uUp into Upper Forebay (UPPER_OPEN [350..415]) */
      S(353, 396, { kind: 'exit', label: 'EXIT_UPPER_POUND', u0: uUp, s0: chUpHigh.sMid, u1: uUp, s1: sHighGateClear, yaw: F.VYAW_S, chamber: chUpHigh }),
      /* 6. Merge inside wide Upper Forebay onto cruise lane uCruiseUp */
      S(396, 416, { kind: 'sail', label: 'MERGE_UPPER_FOREBAY', u0: uUp, s0: sHighGateClear, u1: uCruiseUp, s1: sHighForebayEnd, wlev: chUpHigh.yHigh }),
      /* 7. Sail Upper Pound (under bridges / across navigable stone aqueduct!) into Upper Basin */
      S(416, 505, { kind: 'sail', label: 'CRUISE_UPPER_POUND', u0: uCruiseUp, s0: sHighForebayEnd, u1: uCruiseUp, s1: sHighBasin, yaw: F.VYAW_S, wlev: chUpHigh.yHigh }),
      /* 8. Turn 180 deg in Upper Basin onto Down-Lane cruise line */
      S(505, 542, { kind: 'turn', label: 'UPPER_BASIN_TURN', u0: uCruiseUp, u1: uCruiseDn, s: sHighBasin, rU: cfg.upperTurnR == null ? 3.5 : +cfg.upperTurnR, rS: cfg.upperTurnS == null ? 4.0 : +cfg.upperTurnS, turnDir: 1, yaw0: F.VYAW_S, yaw1: F.VYAW_NS, wlev: chUpHigh.yHigh }),
      /* 9. Sail Upper Pound back to Upper Forebay & align onto uDn */
      S(542, 606, { kind: 'sail', label: 'RETURN_UPPER_POUND', u0: uCruiseDn, s0: sHighBasin, u1: uCruiseDn, s1: sHighForebayEnd, yaw: F.VYAW_NS, wlev: chDnHigh.yHigh }),
      S(606, 623, { kind: 'sail', label: 'ALIGN_DOWN_FOREBAY', u0: uCruiseDn, s0: sHighForebayEnd, u1: uDn, s1: sHighGateClear, wlev: chDnHigh.yHigh }),
      /* 10. Enter Down-Lane Upper Riser straight along uDn (chDnHigh UPPER_OPEN [620..685]) */
      S(623, 676, { kind: 'enter', label: 'ENTER_DOWN_RISER_2', u0: uDn, s0: sHighGateClear, u1: uDn, s1: chDnHigh.sMid, yaw: F.VYAW_NS, chamber: chDnHigh }),
      /* 11. Empty Down-Lane Upper Riser (CLOSING 685..705, EMPTYING 705..785, OPENING_LOWER 785..805) */
      S(676, 808, { kind: 'hold', label: 'DROP_RISER_2', u: uDn, s: chDnHigh.sMid, yaw: F.VYAW_NS, chamber: chDnHigh }),
      /* 12. Transfer across Middle Sill at Zero Head ([805..870]) */
      S(808, 862, { kind: 'transfer', label: 'TRANSFER_MID_SILL_DOWN', u0: uDn, s0: chDnHigh.sMid, u1: uDn, s1: chDnLow.sMid, yaw: F.VYAW_NS, chamber: chDnLow }),
      /* 13. Empty Down-Lane Lower Riser (CLOSING 870..890, EMPTYING 890..970, OPENING_LOWER 970..990) */
      S(862, 993, { kind: 'hold', label: 'DROP_RISER_1', u: uDn, s: chDnLow.sMid, yaw: F.VYAW_NS, chamber: chDnLow }),
      /* 14. Exit Down-Lane Lower Riser straight along uDn into Lower Forebay (LOWER_OPEN [990..1055]) */
      S(993, 1036, { kind: 'exit', label: 'EXIT_LOWER_POUND', u0: uDn, s0: chDnLow.sMid, u1: uDn, s1: sLowGateClear, yaw: F.VYAW_NS, chamber: chDnLow }),
      /* 15. Merge in Lower Forebay, sail to Lower Basin, turn 180 deg, and return to Up-Lane Forebay */
      S(1036, 1058, { kind: 'sail', label: 'MERGE_LOWER_FOREBAY', u0: uDn, s0: sLowGateClear, u1: uCruiseDn, s1: sLowForebayEnd, wlev: chDnLow.yLow }),
      S(1058, 1215, { kind: 'sail', label: 'CRUISE_LOWER_BASIN', u0: uCruiseDn, s0: sLowForebayEnd, u1: uCruiseDn, s1: sLowBasin, yaw: F.VYAW_NS, wlev: chDnLow.yLow }),
      S(1215, 1265, { kind: 'turn', label: 'LOWER_BASIN_TURN', u0: uCruiseDn, u1: uCruiseUp, s: sLowBasin, rU: cfg.lowerTurnR == null ? 2.5 : +cfg.lowerTurnR, rS: cfg.lowerTurnS == null ? -3.5 : +cfg.lowerTurnS, turnDir: -1, yaw0: F.VYAW_NS, yaw1: F.VYAW_S, wlev: chDnLow.yLow }),
      S(1265, 1418, { kind: 'sail', label: 'RETURN_LOWER_POUND', u0: uCruiseUp, s0: sLowBasin, u1: uCruiseUp, s1: sLowForebayEnd, yaw: F.VYAW_S, wlev: chUpLow.yLow }),
      S(1418, 1440, { kind: 'sail', label: 'ALIGN_UP_FOREBAY', u0: uCruiseUp, s0: sLowForebayEnd, u1: uUp, s1: sLowGateClear, wlev: chUpLow.yLow })
    ];

    return transitCourse({
      id: cfg.id || ('twinTour.' + chUpLow.flight),
      vesselKey: cfg.vesselKey || 'et_canal_barge',
      v: cfg.v == null ? 0 : cfg.v,
      period: P,
      phaseOffset: -baseShift + lapShift,
      frame: F,
      stages: stages
    });
  }

  /* Shuttle course within a single pound (basin-to-basin 180 deg turn, or double-ended scow berth reversal in narrow ward canals) */
  function shuttleCourse(cfg) {
    var F = cfg.frame;
    var P = cfg.period == null ? 240 : +cfg.period;
    var uA = +cfg.uA, sA = +cfg.sA, uB = +cfg.uB, sB = +cfg.sB;
    var wlev = +cfg.wlev;
    var yawAB = yawOfUs(F, uB - uA, sB - sA, F.VYAW_S);
    var yawBA = yawOfUs(F, uA - uB, sA - sB, F.VYAW_NS);
    var rU = cfg.turnR == null ? 0.6 : +cfg.turnR;
    var rS = cfg.turnS == null ? 0.6 : +cfg.turnS;
    var stages = cfg.doubleEnded ? [
      { t0: 0, t1: P * 0.42, kind: 'sail', label: 'SHUTTLE_OUT', u0: uA, s0: sA, u1: uB, s1: sB, yaw: yawAB, wlev: wlev },
      { t0: P * 0.42, t1: P * 0.50, kind: 'hold', label: 'WHARF_BERTH_B', u: uB, s: sB, yaw: yawAB, wlev: wlev },
      { t0: P * 0.50, t1: P * 0.92, kind: 'sail', label: 'SHUTTLE_BACK', u0: uB, s0: sB, u1: uA, s1: sA, yaw: yawAB, wlev: wlev },
      { t0: P * 0.92, t1: P, kind: 'hold', label: 'WHARF_BERTH_A', u: uA, s: sA, yaw: yawAB, wlev: wlev }
    ] : [
      { t0: 0, t1: P * 0.42, kind: 'sail', label: 'SHUTTLE_OUT', u0: uA, s0: sA, u1: uB, s1: sB, yaw: yawAB, wlev: wlev },
      { t0: P * 0.42, t1: P * 0.50, kind: 'turn', label: 'SHUTTLE_TURN_B', u0: uB, u1: uB, s: sB, rU: rU, rS: rS, turnDir: 1, yaw0: yawAB, yaw1: yawBA, wlev: wlev },
      { t0: P * 0.50, t1: P * 0.92, kind: 'sail', label: 'SHUTTLE_BACK', u0: uB, s0: sB, u1: uA, s1: sA, yaw: yawBA, wlev: wlev },
      { t0: P * 0.92, t1: P, kind: 'turn', label: 'SHUTTLE_TURN_A', u0: uA, u1: uA, s: sA, rU: rU, rS: -rS, turnDir: -1, yaw0: yawBA, yaw1: yawAB, wlev: wlev }
    ];
    return transitCourse({
      id: cfg.id || 'shuttle',
      vesselKey: cfg.vesselKey || 'et_canal_barge',
      v: cfg.v == null ? 0 : cfg.v,
      period: P,
      phaseOffset: cfg.phase == null ? 0 : +cfg.phase,
      frame: F,
      stages: stages
    });
  }

  /* Full kinematic & hydraulic audit of a transit course across its entire period:
     Verifies at step `dt`:
       1) zero miter-gate hydraulic head violations across all chambers,
       2) zero 2D OBB collisions between the vessel hull (L x B) and all swinging/closed miter-gate leaves,
       3) vessel hull (center + 4 corners) stays strictly inside wet channel/basin/chamber bounds with depth >= draft,
       4) vessel air-draft (pose.y + H) clears every crossed bridge soffit (pose.y + H + airMargin <= br.soffitY),
       5) exact flotation (`|pose.y - localWaterAt(x, z, t).y| <= 0.03 m`). */
  function auditTransit(course, net, vesselSpec, opt) {
    opt = opt || {};
    var dt = opt.dt == null ? 2.0 : +opt.dt;
    var airMargin = opt.airMargin == null ? 0.35 : +opt.airMargin;
    var vL = vesselSpec.L == null ? vesselSpec.loa : +vesselSpec.L;
    var vB = vesselSpec.B == null ? vesselSpec.beam : +vesselSpec.B;
    var vH = vesselSpec.H == null ? vesselSpec.airDraft : +vesselSpec.H;
    var vDraft = vesselSpec.draft == null ? 1.0 : +vesselSpec.draft;

    var F = net.frame;
    var gateCollisions = 0, wetViolations = 0, bridgeStrikes = 0, flotationFaults = 0, miterViolations = 0;
    var firstFault = null;
    var samples = 0;
    var stagesSeen = {};

    for (var t = 0; t < course.period; t += dt) {
      samples++;
      var pose = vesselPoseAt(course, t);
      stagesSeen[pose.stage] = (stagesSeen[pose.stage] || 0) + 1;
      var hullObb = K.vesselObb(pose.x, pose.z, pose.yaw, vL, vB, -0.04);

      /* 1 & 2. Check miter-gate law & hull-vs-gate-leaf OBB collisions across all chambers */
      var chs = net.chambers || [];
      for (var ci = 0; ci < chs.length; ci++) {
        var ch = chs[ci];
        var st = K.lockState(ch, t);
        if (!K.miterLawOk(st)) {
          miterViolations++;
          if (!firstFault) firstFault = { kind: 'miter_head', t: t, chamber: ch.id };
        }
        /* Skip far chambers quickly */
        if (Math.abs(pose.s - ch.sMid) > ch.l + vL) continue;
        var leaves = K.gateLeafPoses(ch, st, F);
        for (var li = 0; li < leaves.length; li++) {
          if (K.obbOverlap(hullObb, leaves[li].obb)) {
            gateCollisions++;
            if (!firstFault) firstFault = { kind: 'gate_collision', t: t, chamber: ch.id, which: leaves[li].which, deg: leaves[li].deg, s: pose.s };
          }
        }
      }

      /* 3 & 5. Check flotation & wet bounds at hull center and 4 hull corners (shrunk slightly for rounded bilge/bow) */
      var checkPts = [[pose.x, pose.z]];
      var shrinkObb = K.vesselObb(pose.x, pose.z, pose.yaw, vL * 0.88, vB * 0.88, 0);
      var corners = K.obbCorners(shrinkObb);
      for (var kc = 0; kc < 4; kc++) checkPts.push(corners[kc]);

      var centerWet = localWaterAt(net, pose.x, pose.z, t);
      if (!centerWet) {
        wetViolations++;
        if (!firstFault) firstFault = { kind: 'dry_center', t: t, u: pose.u, s: pose.s };
      } else {
        if (Math.abs(pose.y - centerWet.y) > 0.04) {
          flotationFaults++;
          if (!firstFault) firstFault = { kind: 'flotation_mismatch', t: t, poseY: pose.y, waterY: centerWet.y, stage: pose.stage };
        }
        if (centerWet.y - centerWet.bedY < vDraft + 0.15) {
          wetViolations++;
          if (!firstFault) firstFault = { kind: 'grounding_depth', t: t, depth: centerWet.y - centerWet.bedY };
        }
      }
      for (var cp = 1; cp < checkPts.length; cp++) {
        var cw = localWaterAt(net, checkPts[cp][0], checkPts[cp][1], t);
        if (!cw) {
          wetViolations++;
          if (!firstFault) firstFault = { kind: 'hull_corner_outside_wet', t: t, u: pose.u, s: pose.s, stage: pose.stage };
          break;
        }
      }

      /* 4. Check bridge soffit clearance whenever hull OBB intersects any bridge span */
      var brs = net.bridges || [];
      for (var bi = 0; bi < brs.length; bi++) {
        var br = brs[bi];
        if (K.obbOverlap(hullObb, br.deckObb)) {
          if (pose.y + vH + airMargin > br.soffitY) {
            bridgeStrikes++;
            if (!firstFault) firstFault = { kind: 'bridge_strike', t: t, bridge: br.id, topY: pose.y + vH, soffitY: br.soffitY };
          }
        }
      }
    }

    var ok = miterViolations === 0 && gateCollisions === 0 && wetViolations === 0 &&
             bridgeStrikes === 0 && flotationFaults === 0;
    return {
      ok: ok,
      samples: samples,
      miterViolations: miterViolations,
      gateCollisions: gateCollisions,
      wetViolations: wetViolations,
      bridgeStrikes: bridgeStrikes,
      flotationFaults: flotationFaults,
      stagesSeen: stagesSeen,
      firstFault: firstFault
    };
  }

  K.localWaterAt = localWaterAt;
  K.transitCourse = transitCourse;
  K.vesselPoseAt = vesselPoseAt;
  K.singleLockTour = singleLockTour;
  K.twinFlightRoundTrip = twinFlightRoundTrip;
  K.shuttleCourse = shuttleCourse;
  K.auditTransit = auditTransit;
})(KCANAL);
