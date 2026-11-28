/* ==== 4-Limb Combat Animator: Thorax (Left2/Right2) & Dorsal (Spine2 Scapula Rig) [draw] ====
   Procedural/keyframed 4-limb combat animation and dorsal rig articulation layer for KCharFigure
   (Godot 4 twin: godot/krator/combat/kcombat_fourarms.gd).
   Chains cleanly after 75-extraplanar.js's KCharFigure Proxy:
   - Part A (Thorax-Mounted 4-Limb Animator): drives Left2Arm/ForeArm/Hand & Right2Arm/ForeArm/Hand
     across 4 Thorax signature moves (thorax_quad_flurry, thorax_pin_cleave, thorax_aegis_viper,
     thorax_x_crusher) + reactive thorax_mid_parry + empty-hand lower-fist closure.
   - Part B (Dorsal-Mounted 4-Limb Articulator on Spine2):
     1) Live connected-component vertex-group articulation of clich_{m,f}_reliquary_servo_arms into
        5 clean sub-meshes (base, upperL, upperR, foreL, foreR) pivoted on the exact bronze/jade
        shoulder turret (sh_turret) and elbow drum (elbow_p) centers.
     2) Procedural attachable Articulated Obsidian-Cyan Mantis Scythe-Rig when rec.dorsal_rig === 'mantis'.
     Drives sinister predatory idle breathing/sway and 4 Dorsal combat moves (dorsal_mantis_impale,
     dorsal_scissor_shear, dorsal_canopy_parry, dorsal_tri_beam).
*/
(function(){
  if(typeof KCharFigure === 'undefined' || typeof THREE === 'undefined') return;
  if(KCharFigure._fourArmsWrapped) return;

  var DEG = Math.PI / 180;
  var AX_X = new THREE.Vector3(1, 0, 0);
  var AX_Y = new THREE.Vector3(0, 1, 0);
  var AX_Z = new THREE.Vector3(0, 0, 1);

  /* ---- Normalized [0..1] Hermite Keyframe Tables (shared 1:1 with kcombat_fourarms.gd) ----
     Thorax channels (10): [l_pitch, l_yaw, l_flare, l_elbow, l_wrist, r_pitch, r_yaw, r_flare, r_elbow, r_wrist] (deg)
     Dorsal channels (10): [l_sh_pitch, l_sh_yaw, l_sh_roll, l_el_pitch, l_el_yaw,
                            r_sh_pitch, r_sh_yaw, r_sh_roll, r_el_pitch, r_el_yaw] (deg)
  */
  var THORAX_GUARD = [22, 14, -6, 68, 0, 22, 14, -6, 68, 0];
  var THORAX_ZERO  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  var THORAX_KEYFRAMES = {
    thorax_quad_flurry: [
      [0.00, THORAX_GUARD],
      [0.12, [-24, -12,  16,  86,   6,   34,  18,  -8,  74,   0]],
      [0.22, [ 84,  14,   0, -18, -10,  -26, -14,  18,  88,   8]],
      [0.38, [ 22, -32,  28,  68,   8,   86,  16,  -2, -20, -12]],
      [0.54, [ 72,  38, -12,  42,  18,  -18, -10,  14,  84,   6]],
      [0.70, [ 36,  16,  -6,  68,   4,   98,  22, -10,  46,  16]],
      [0.86, [ 26,  15,  -6,  70,   0,   28,  15,  -6,  70,   0]],
      [1.00, THORAX_GUARD]
    ],
    thorax_pin_cleave: [
      [0.00, THORAX_GUARD],
      [0.18, [ 48, -46,  34,  18, -12,   48, -46,  34,  18, -12]],
      [0.35, [ 66,  34, -10,  28,  18,   66,  34, -10,  28,  18]],
      [0.56, [ 70,  38, -14,  32,  24,   70,  38, -14,  32,  24]],
      [0.75, [ 64,  34, -10,  30,  20,   64,  34, -10,  30,  20]],
      [0.88, [ 30,  16,  -6,  62,   4,   30,  16,  -6,  62,   4]],
      [1.00, THORAX_GUARD]
    ],
    thorax_aegis_viper: [
      [0.00, THORAX_GUARD],
      [0.20, [-30, -14,  20,  90,  10,  -30, -14,  20,  90,  10]],
      [0.42, [ 82,  10,   2, -22, -12,   82,  10,   2, -22, -12]],
      [0.56, [ 86,  12,   0, -24, -14,   86,  12,   0, -24, -14]],
      [0.68, [ 76,  10,   2, -16, -10,   76,  10,   2, -16, -10]],
      [0.86, [ 28,  14,  -4,  64,   0,   28,  14,  -4,  64,   0]],
      [1.00, THORAX_GUARD]
    ],
    thorax_x_crusher: [
      [0.00, THORAX_GUARD],
      [0.28, [ 10, -38,  48, -12, -14,   10, -38,  48, -12, -14]],
      [0.50, [ 80,  34, -16,  16,  20,   80,  34, -16,  16,  20]],
      [0.64, [ 84,  40, -18,  22,  24,   84,  40, -18,  22,  24]],
      [0.74, [ 74,  32, -14,  26,  18,   74,  32, -14,  26,  18]],
      [0.88, [ 28,  15,  -6,  64,   2,   28,  15,  -6,  64,   2]],
      [1.00, THORAX_GUARD]
    ],
    thorax_mid_parry: [
      [0.00, THORAX_GUARD],
      [0.18, [ 66,  44, -16,  64,  18,   58,  40, -14,  58,  16]],
      [0.52, [ 68,  46, -18,  66,  20,   60,  42, -16,  60,  18]],
      [0.78, [ 54,  34, -12,  64,  12,   48,  30, -10,  60,  10]],
      [1.00, THORAX_GUARD]
    ]
  };

  var DORSAL_GUARD = [8, 20, 6, -16, 12, 8, 20, 6, -16, 12];

  var DORSAL_KEYFRAMES = {
    dorsal_mantis_impale: [
      [0.00, DORSAL_GUARD],
      [0.26, [-28,  24,  46, -24,  16,  -28,  24,  46, -24,  16]],
      [0.44, [ 38,  66,  -4, -32,  16,   38,  66,  -4, -32,  16]],
      [0.56, [ 42,  68,  -6, -34,  18,   42,  68,  -6, -34,  18]],
      [0.68, [ 36,  62,  -4, -30,  16,   36,  62,  -4, -30,  16]],
      [0.86, [ 14,  28,   4, -18,  13,   14,  28,   4, -18,  13]],
      [1.00, DORSAL_GUARD]
    ],
    dorsal_scissor_shear: [
      [0.00, DORSAL_GUARD],
      [0.25, [  8, -24, -16, -28, -20,    8, -24, -16, -28, -20]],
      [0.45, [ 28,  76,  -6, -28,  38,   35,  76, -18, -26,  38]],
      [0.58, [ 30,  80,  -8, -30,  42,   37,  80, -20, -28,  42]],
      [0.68, [ 26,  72,  -6, -26,  36,   33,  72, -16, -24,  36]],
      [0.86, [ 12,  26,   4, -18,  14,   12,  26,   4, -18,  14]],
      [1.00, DORSAL_GUARD]
    ],
    dorsal_canopy_parry: [
      [0.00, DORSAL_GUARD],
      [0.18, [ 24,  62,  14, -24,  48,  -22,  18,  38, -18,  12]],
      [0.38, [ 26,  64,  12, -26,  48,   36,  68,  -2, -34,  20]],
      [0.54, [ 25,  62,  12, -25,  46,   40,  70,  -4, -36,  22]],
      [0.66, [ 22,  56,  10, -22,  40,   34,  64,  -2, -32,  18]],
      [0.86, [ 12,  26,   6, -17,  16,   12,  26,   6, -17,  14]],
      [1.00, DORSAL_GUARD]
    ],
    dorsal_tri_beam: [
      [0.00, DORSAL_GUARD],
      [0.20, [ 24,  58,   6, -36,   8,   24,  58,   6, -36,   8]],
      [0.46, [ 28,  62,   4, -40,  10,   28,  62,   4, -40,  10]],
      [0.64, [ 26,  61,   5, -39,   9,   26,  61,   5, -39,   9]],
      [0.78, [ 25,  59,   6, -37,   9,   25,  59,   6, -37,   9]],
      [0.89, [ 14,  30,   6, -22,  11,   14,  30,   6, -22,  11]],
      [1.00, DORSAL_GUARD]
    ]
  };

  var DEFEND_CLIPS = {
    parry: 1, parry_2h: 1, block: 1, block_2: 1,
    ual_sword_block: 1, ual_shield_up: 1,
    guard_block_1: 1, guard_block_2: 1, guard_block_3: 1
  };

  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function hermite01(x){ var t = clamp01(x); return t * t * (3 - 2 * t); }
  function moveEnvelope(u){
    var uCl = clamp01(u);
    var wIn = uCl < 0.12 ? hermite01(uCl / 0.12) : 1.0;
    var wOut = uCl > 0.85 ? (1.0 - hermite01((uCl - 0.85) / 0.15)) : 1.0;
    return wIn * wOut;
  }

  function evalTrack(kfs, fallback, u){
    if(!kfs || !kfs.length) return fallback.slice();
    var uc = clamp01(u);
    if(uc <= kfs[0][0]) return kfs[0][1].slice();
    var last = kfs[kfs.length - 1];
    if(uc >= last[0]) return last[1].slice();
    for(var i = 0; i < kfs.length - 1; i++){
      var a = kfs[i], b = kfs[i + 1];
      if(uc >= a[0] && uc <= b[0]){
        var span = Math.max(1e-6, b[0] - a[0]);
        var s = hermite01((uc - a[0]) / span);
        var va = a[1], vb = b[1], out = new Array(va.length);
        for(var c = 0; c < va.length; c++) out[c] = va[c] + (vb[c] - va[c]) * s;
        return out;
      }
    }
    return last[1].slice();
  }

  function sampleThoraxPose(moveKey, u){
    var kfs = THORAX_KEYFRAMES[moveKey];
    var v = evalTrack(kfs, THORAX_GUARD, u);
    var env = kfs ? moveEnvelope(u) : 0.0;
    return {
      move: moveKey,
      u: clamp01(u),
      blend: env,
      l_pitch: v[0], l_yaw: v[1], l_flare: v[2], l_elbow: v[3], l_wrist: v[4],
      r_pitch: v[5], r_yaw: v[6], r_flare: v[7], r_elbow: v[8], r_wrist: v[9],
      channels: v
    };
  }

  function sampleDorsalPose(moveKey, u){
    var kfs = DORSAL_KEYFRAMES[moveKey];
    var v = evalTrack(kfs, DORSAL_GUARD, u);
    var env = kfs ? moveEnvelope(u) : 0.0;
    return {
      move: moveKey,
      u: clamp01(u),
      blend: env,
      l_sh_pitch: v[0], l_sh_yaw: v[1], l_sh_roll: v[2], l_el_pitch: v[3], l_el_yaw: v[4],
      r_sh_pitch: v[5], r_sh_yaw: v[6], r_sh_roll: v[7], r_el_pitch: v[8], r_el_yaw: v[9],
      channels: v
    };
  }

  /* ---- Reusable Math Scratch ---- */
  var _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
  var _qTarget = new THREE.Quaternion(), _qCurl = new THREE.Quaternion(), _qIdent = new THREE.Quaternion();

  /* ---- Part A Setup: Precompute Lower-Arm Rest Frames from Skeleton ---- */
  function buildThoraxRig(skel, byName){
    if(!skel || !skel.joints) return null;
    var J = skel.joints;
    if(byName.Left2Arm === undefined || byName.Right2Arm === undefined) return null;

    var wq = new Array(J.length), wp = new Array(J.length);
    for(var i = 0; i < J.length; i++){
      var j = J[i];
      var q = new THREE.Quaternion().fromArray(j.r);
      var t = new THREE.Vector3().fromArray(j.t);
      if(j.parent >= 0){
        t.applyQuaternion(wq[j.parent]).add(wp[j.parent]);
        q.premultiply(wq[j.parent]);
      }
      wq[i] = q;
      wp[i] = t;
    }

    var sides = ['Left', 'Right'].map(function(side){
      var sx = side === 'Left' ? 1 : -1;
      var handKey = side === 'Left' ? 'L2' : 'R2';
      var ia = byName[side + '2Arm'], ifa = byName[side + '2ForeArm'], ih = byName[side + '2Hand'];
      if(ia === undefined || ifa === undefined || ih === undefined) return null;

      var dirFa = wp[ih].clone().sub(wp[ifa]);
      if(dirFa.lengthSq() < 1e-8) dirFa.set(sx * 0.2, -0.8, 0.5);
      dirFa.normalize();
      var hinge = dirFa.clone().cross(AX_Z);
      if(hinge.lengthSq() < 1e-8) hinge.set(-1, 0, 0);
      hinge.normalize();

      var hSpec = skel.hands && skel.hands[handKey];
      var rawCurls = (hSpec && (hSpec.curls ? hSpec.curls.fist : hSpec.curl)) || [];
      var curls = rawCurls.map(function(c){
        var bi = c[0];
        return {
          bi: bi,
          rest: J[bi] ? new THREE.Quaternion().fromArray(J[bi].r) : new THREE.Quaternion(),
          curl: new THREE.Quaternion(c[1], c[2], c[3], c[4])
        };
      });

      return {
        side: side,
        handKey: handKey,
        sx: sx,
        ia: ia,
        ifa: ifa,
        ih: ih,
        armRest: new THREE.Quaternion().fromArray(J[ia].r),
        armWq: wq[ia].clone(),
        armWqInv: wq[ia].clone().invert(),
        foreRest: new THREE.Quaternion().fromArray(J[ifa].r),
        foreWq: wq[ifa].clone(),
        foreWqInv: wq[ifa].clone().invert(),
        foreHinge: hinge,
        handRest: new THREE.Quaternion().fromArray(J[ih].r),
        handWq: wq[ih].clone(),
        handWqInv: wq[ih].clone().invert(),
        curls: curls
      };
    }).filter(Boolean);

    var sp2Idx = byName.Spine2;
    return {
      sides: sides,
      spine2Idx: sp2Idx,
      spine2Wq: sp2Idx !== undefined ? wq[sp2Idx].clone() : new THREE.Quaternion(),
      spine2Wp: sp2Idx !== undefined ? wp[sp2Idx].clone() : new THREE.Vector3(0, 1.30, -0.02)
    };
  }

  function applyThoraxSide(bones, held, sideRig, pitch, yaw, flare, elbow, wrist, weight){
    var sx = sideRig.sx;
    // Upper lower-arm: figure-space pitch (-X), flare (+sx*Z), inward yaw (-sx*Y) -> bone local
    _q1.setFromAxisAngle(AX_Y, -sx * yaw * DEG);
    _q2.setFromAxisAngle(AX_X, -pitch * DEG);
    _q3.setFromAxisAngle(AX_Z, sx * flare * DEG);
    _q1.multiply(_q2).multiply(_q3);
    _qTarget.copy(sideRig.armWqInv).multiply(_q1).multiply(sideRig.armWq).premultiply(sideRig.armRest);
    bones[sideRig.ia].quaternion.slerp(_qTarget, weight);

    // Forearm elbow hinge flex/extension
    _q1.setFromAxisAngle(sideRig.foreHinge, elbow * DEG);
    _qTarget.copy(sideRig.foreWqInv).multiply(_q1).multiply(sideRig.foreWq).premultiply(sideRig.foreRest);
    bones[sideRig.ifa].quaternion.slerp(_qTarget, weight);

    // Wrist snap
    if(Math.abs(wrist) > 0.01){
      _q1.setFromAxisAngle(AX_X, -wrist * DEG);
      _qTarget.copy(sideRig.handWqInv).multiply(_q1).multiply(sideRig.handWq).premultiply(sideRig.handRest);
      bones[sideRig.ih].quaternion.slerp(_qTarget, weight);
    }

    // Close empty L2/R2 fingers into a crisp combat fist during active Thorax moves
    if(!(held && held[sideRig.handKey]) && sideRig.curls.length){
      var fistAmt = 0.45 + 0.55 * weight;
      for(var k = 0; k < sideRig.curls.length; k++){
        var fc = sideRig.curls[k];
        if(!bones[fc.bi]) continue;
        _qCurl.copy(_qIdent).slerp(fc.curl, fistAmt);
        _qTarget.copy(fc.rest).multiply(_qCurl);
        bones[fc.bi].quaternion.slerp(_qTarget, weight);
      }
    }
  }

  /* ---- Part B1: Connected-Component Articulation of clich_{m,f}_reliquary_servo_arms ---- */
  function buildSubGeometry(P, N, U, triIndices, ibm, nrmMat, pivotLocal){
    var remap = new Map();
    var posArr = [], nrmArr = [], uvArr = [], newIdx = [];
    var vTmp = new THREE.Vector3(), nTmp = new THREE.Vector3();
    for(var t = 0; t < triIndices.length; t++){
      var oldVi = triIndices[t];
      var nv = remap.get(oldVi);
      if(nv === undefined){
        nv = posArr.length / 3;
        remap.set(oldVi, nv);
        vTmp.fromBufferAttribute(P, oldVi).applyMatrix4(ibm);
        posArr.push(vTmp.x - pivotLocal.x, vTmp.y - pivotLocal.y, vTmp.z - pivotLocal.z);
        if(N){
          nTmp.fromBufferAttribute(N, oldVi).applyMatrix3(nrmMat).normalize();
          nrmArr.push(nTmp.x, nTmp.y, nTmp.z);
        }
        if(U) uvArr.push(U.getX(oldVi), U.getY(oldVi));
      }
      newIdx.push(nv);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    if(nrmArr.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrmArr, 3));
    if(uvArr.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    geo.setIndex(newIdx);
    geo.computeBoundingSphere();
    return geo;
  }

  function buildReliquaryServoRig(fig, m, state){
    var sp2Idx = state.thorax ? state.thorax.spine2Idx : state.byName.Spine2;
    if(sp2Idx === undefined || !fig.bones[sp2Idx]) return null;
    var i0 = m.userData.index0;
    var g = m.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    if(!i0 || !P || i0.length < 300) return null;

    var morphKey = (m.userData.morph && m.userData.morph.key) || 'base';
    if(m.userData._faServo && m.userData._faServo.morphKey === morphKey){
      // Ensure base SkinnedMesh index stays empty so no duplicate static arms render
      if(!g.index || g.index.count !== 0) g.setIndex([]);
      return m.userData._faServo;
    }
    if(m.userData._faServo && m.userData._faServo.root && m.userData._faServo.root.parent){
      m.userData._faServo.root.parent.remove(m.userData._faServo.root);
    }

    var nVerts = P.count, nTris = Math.floor(i0.length / 3);
    var parent = new Int32Array(nVerts);
    for(var vi = 0; vi < nVerts; vi++) parent[vi] = vi;
    function find(x){
      while(parent[x] !== x){ parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    }
    for(var ti = 0; ti < nTris; ti++){
      var a = find(i0[3 * ti]), b = find(i0[3 * ti + 1]), c = find(i0[3 * ti + 2]);
      parent[b] = a; parent[c] = a;
    }
    var compMap = new Map();
    for(var t2 = 0; t2 < nTris; t2++){
      var r = find(i0[3 * t2]);
      var list = compMap.get(r);
      if(!list){ list = []; compMap.set(r, list); }
      list.push(t2);
    }

    var baseIdx = [], upLIdx = [], upRIdx = [], foreLIdx = [], foreRIdx = [];
    var shModelL = null, shModelR = null, elModelL = null, elModelR = null;
    var tipSumL = new THREE.Vector3(), tipCntL = 0, tipSumR = new THREE.Vector3(), tipCntR = 0;

    compMap.forEach(function(tList){
      var vSeen = new Set();
      var sx = 0, sy = 0, sz = 0, vc = 0;
      var minX = Infinity, minY = Infinity, minZ = Infinity;
      var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for(var k = 0; k < tList.length; k++){
        var tr = tList[k];
        for(var c2 = 0; c2 < 3; c2++){
          var vId = i0[3 * tr + c2];
          if(!vSeen.has(vId)){
            vSeen.add(vId);
            var vx = P.getX(vId), vy = P.getY(vId), vz = P.getZ(vId);
            sx += vx; sy += vy; sz += vz; vc++;
            if(vx < minX) minX = vx; if(vx > maxX) maxX = vx;
            if(vy < minY) minY = vy; if(vy > maxY) maxY = vy;
            if(vz < minZ) minZ = vz; if(vz > maxZ) maxZ = vz;
          }
        }
      }
      var cx = sx / Math.max(1, vc), ax = Math.abs(cx);
      var targetArr;
      if(ax < 0.125){
        targetArr = baseIdx;
      } else if(ax < 0.390){
        targetArr = cx > 0 ? upLIdx : upRIdx;
        // Exact shoulder turret bearing sphere (sh_joint_L/R: ~224 tris centered at |x|=0.165)
        if(ax > 0.150 && ax < 0.180 && tList.length >= 180){
          var shMid = new THREE.Vector3(0.5 * (minX + maxX), 0.5 * (minY + maxY), 0.5 * (minZ + maxZ));
          if(cx > 0) shModelL = shMid; else shModelR = shMid;
        }
      } else {
        targetArr = cx > 0 ? foreLIdx : foreRIdx;
        // Exact jade/bronze elbow drum sphere (elbow_drum_L/R: ~224 tris centered at |x|=0.420)
        if(ax > 0.405 && ax < 0.435 && tList.length >= 180){
          var elMid = new THREE.Vector3(0.5 * (minX + maxX), 0.5 * (minY + maxY), 0.5 * (minZ + maxZ));
          if(cx > 0) elModelL = elMid; else elModelR = elMid;
        }
        if(ax > 0.615){
          if(cx > 0){ tipSumL.x += sx; tipSumL.y += sy; tipSumL.z += sz; tipCntL += vc; }
          else { tipSumR.x += sx; tipSumR.y += sy; tipSumR.z += sz; tipCntR += vc; }
        }
      }
      for(var q = 0; q < tList.length; q++){
        var ti2 = tList[q];
        targetArr.push(i0[3 * ti2], i0[3 * ti2 + 1], i0[3 * ti2 + 2]);
      }
    });

    if(!shModelL) shModelL = new THREE.Vector3( 0.165, 1.55, -0.155);
    if(!shModelR) shModelR = new THREE.Vector3(-0.165, 1.55, -0.155);
    if(!elModelL) elModelL = new THREE.Vector3( 0.420, 1.71, -0.200);
    if(!elModelR) elModelR = new THREE.Vector3(-0.420, 1.71, -0.200);
    var tipModelL = tipCntL > 0 ? tipSumL.multiplyScalar(1 / tipCntL) : new THREE.Vector3( 0.66, 1.50, 0.06);
    var tipModelR = tipCntR > 0 ? tipSumR.multiplyScalar(1 / tipCntR) : new THREE.Vector3(-0.66, 1.50, 0.06);

    var ibm = (m.skeleton && m.skeleton.boneInverses && m.skeleton.boneInverses[sp2Idx])
      ? m.skeleton.boneInverses[sp2Idx]
      : ((m.userData.ibm && m.userData.ibm[sp2Idx]) || new THREE.Matrix4());
    var nrmMat = new THREE.Matrix3().getNormalMatrix(ibm);

    var zeroV = new THREE.Vector3();
    var shLocL = shModelL.clone().applyMatrix4(ibm);
    var shLocR = shModelR.clone().applyMatrix4(ibm);
    var elLocL = elModelL.clone().applyMatrix4(ibm);
    var elLocR = elModelR.clone().applyMatrix4(ibm);
    var tipLocL = tipModelL.clone().applyMatrix4(ibm);
    var tipLocR = tipModelR.clone().applyMatrix4(ibm);

    // Character-aligned axes in Spine2's local space (handles male +16° vs female -5° Spine2 tilt identically!)
    var axX = new THREE.Vector3(1, 0, 0).transformDirection(ibm).normalize();
    var axY = new THREE.Vector3(0, 1, 0).transformDirection(ibm).normalize();
    var axZ = new THREE.Vector3(0, 0, 1).transformDirection(ibm).normalize();

    var subMat = new THREE.MeshStandardMaterial({
      map: m.material.map || null,
      normalMap: m.material.normalMap || null,
      roughnessMap: m.material.roughnessMap || null,
      metalnessMap: m.material.metalnessMap || null,
      roughness: m.material.roughness != null ? m.material.roughness : 0.42,
      metalness: m.material.metalness != null ? m.material.metalness : 0.68,
      vertexColors: !!m.material.vertexColors,
      side: THREE.DoubleSide
    });
    subMat.color = m.material.color; // Share Color reference so apply() dyes transfer live

    var root = new THREE.Group();
    root.name = 'fa:reliquary_servo_arms';

    function makePartMesh(idxArr, piv, name){
      var geo = buildSubGeometry(P, N, U, idxArr, ibm, nrmMat, piv);
      var sm = new THREE.Mesh(geo, subMat);
      sm.name = name;
      sm.castShadow = true;
      sm.receiveShadow = true;
      sm.frustumCulled = false;
      return sm;
    }

    var baseMesh = makePartMesh(baseIdx, zeroV, 'fa:servo_base');
    root.add(baseMesh);

    var upperL = new THREE.Group(); upperL.position.copy(shLocL);
    upperL.add(makePartMesh(upLIdx, shLocL, 'fa:servo_upperL'));
    var foreL = new THREE.Group(); foreL.position.copy(elLocL).sub(shLocL);
    foreL.add(makePartMesh(foreLIdx, elLocL, 'fa:servo_foreL'));
    var tipAnchorL = new THREE.Object3D(); tipAnchorL.position.copy(tipLocL).sub(elLocL);
    foreL.add(tipAnchorL);
    upperL.add(foreL);
    root.add(upperL);

    var upperR = new THREE.Group(); upperR.position.copy(shLocR);
    upperR.add(makePartMesh(upRIdx, shLocR, 'fa:servo_upperR'));
    var foreR = new THREE.Group(); foreR.position.copy(elLocR).sub(shLocR);
    foreR.add(makePartMesh(foreRIdx, elLocR, 'fa:servo_foreR'));
    var tipAnchorR = new THREE.Object3D(); tipAnchorR.position.copy(tipLocR).sub(elLocR);
    foreR.add(tipAnchorR);
    upperR.add(foreR);
    root.add(upperR);

    fig.bones[sp2Idx].add(root);
    g.setIndex([]);

    var servo = {
      kind: 'reliquary_servo',
      hostMesh: m,
      morphKey: morphKey,
      root: root,
      upperL: upperL,
      upperR: upperR,
      foreL: foreL,
      foreR: foreR,
      tipL: tipAnchorL,
      tipR: tipAnchorR,
      axX: axX,
      axY: axY,
      axZ: axZ
    };
    m.userData._faServo = servo;
    return servo;
  }

  /* ---- Part B2: Procedural Attachable Obsidian-Cyan Mantis Scythe-Rig (dorsal_rig: 'mantis') ---- */
  function orientTubeBetween(mesh, p0, p1){
    var dir = new THREE.Vector3().subVectors(p1, p0);
    var len = dir.length();
    mesh.position.copy(p0).addScaledVector(dir, 0.5);
    if(len > 1e-5){
      dir.divideScalar(len);
      mesh.quaternion.setFromUnitVectors(AX_Y, dir);
    }
    mesh.scale.set(1, Math.max(0.01, len), 1);
    return mesh;
  }

  var _mantisMats = null;

  function _sstep01(e0, e1, x){
    var t = clamp01((x - e0) / Math.max(1e-6, e1 - e0));
    return t * t * (3 - 2 * t);
  }

  function _makeDataTex(rgba, sz, isSRGB){
    var tex = new THREE.DataTexture(rgba, sz, sz, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    if(isSRGB){
      if(THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
      if('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.needsUpdate = true;
    return tex;
  }

  function _makeNormalTex(hgt, sz, strength){
    var rgba = new Uint8Array(sz * sz * 4);
    var mask = sz - 1;
    for(var y = 0; y < sz; y++){
      var ym = (y - 1) & mask, yp = (y + 1) & mask;
      for(var x = 0; x < sz; x++){
        var xm = (x - 1) & mask, xp = (x + 1) & mask;
        var dx = ((hgt[ym * sz + xp] + 2 * hgt[y * sz + xp] + hgt[yp * sz + xp]) -
                  (hgt[ym * sz + xm] + 2 * hgt[y * sz + xm] + hgt[yp * sz + xm])) * 0.125 * strength;
        var dy = ((hgt[yp * sz + xm] + 2 * hgt[yp * sz + x] + hgt[yp * sz + xp]) -
                  (hgt[ym * sz + xm] + 2 * hgt[ym * sz + x] + hgt[ym * sz + xp])) * 0.125 * strength;
        var nx = -dx, ny = -dy, nz = 1.0;
        var nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
        var o = (y * sz + x) * 4;
        rgba[o]     = Math.round(clamp01((nx / nl) * 0.5 + 0.5) * 255);
        rgba[o + 1] = Math.round(clamp01((ny / nl) * 0.5 + 0.5) * 255);
        rgba[o + 2] = Math.round(clamp01((nz / nl) * 0.5 + 0.5) * 255);
        rgba[o + 3] = 255;
      }
    }
    return _makeDataTex(rgba, sz, false);
  }

  function getMantisMaterials(){
    if(_mantisMats) return _mantisMats;
    var sz = 256, nPx = sz * sz, TWO_PI = Math.PI * 2;

    // 1. Carbon-Obsidian Hex-Carapace & Armored Panel Seams
    var obsAlb = new Uint8Array(nPx * 4), obsMr = new Uint8Array(nPx * 4), obsH = new Float32Array(nPx);
    // 2. Burnished Bronze Bearing Knurling & Rotary Grooves
    var brzAlb = new Uint8Array(nPx * 4), brzMr = new Uint8Array(nPx * 4), brzH = new Float32Array(nPx);
    // 3. Glowing Cyan Plasma Razor-Edge & Emitter Ribs
    var cynAlb = new Uint8Array(nPx * 4), cynEm = new Uint8Array(nPx * 4), cynMr = new Uint8Array(nPx * 4), cynH = new Float32Array(nPx);

    for(var y = 0; y < sz; y++){
      var v = (y + 0.5) / sz;
      for(var x = 0; x < sz; x++){
        var u = (x + 0.5) / sz;
        var idx = y * sz + x, o = idx * 4;

        // --- A) Carbon-Obsidian Hex & Panel Lines ---
        var pu = (u * 3.0) % 1.0, pv = (v * 2.0) % 1.0;
        var du = Math.min(pu, 1.0 - pu), dv = Math.min(pv, 1.0 - pv);
        var seam = Math.max(1.0 - _sstep01(0.018, 0.042, du), 1.0 - _sstep01(0.016, 0.038, dv));
        var bev = Math.max((1.0 - _sstep01(0.042, 0.088, du)) * _sstep01(0.018, 0.042, du),
                           (1.0 - _sstep01(0.038, 0.080, dv)) * _sstep01(0.016, 0.038, dv));
        // Periodic hex-carbon micro-lattice
        var hx = u * 18.0, hy = v * 18.0;
        var h1 = Math.cos(TWO_PI * hx), h2 = Math.cos(TWO_PI * (0.5 * hx + 0.8660254 * hy)), h3 = Math.cos(TWO_PI * (0.5 * hx - 0.8660254 * hy));
        var hexCell = clamp01(0.5 + 0.22 * (h1 + h2 + h3));
        var trace = (1.0 - _sstep01(0.010, 0.024, Math.abs(pu - 0.5))) * _sstep01(0.14, 0.20, pv) * (1.0 - _sstep01(0.80, 0.86, pv));
        var rivD = Math.hypot((Math.abs(du - 0.095)) / 3.0, (Math.abs(((v * 12.0) % 1.0) - 0.5)) / 12.0);
        var riv = (1.0 - _sstep01(0.008, 0.015, rivD)) * (1.0 - seam);

        var rO = 26 + 18 * hexCell + 38 * bev + 46 * riv, gO = 36 + 22 * hexCell + 44 * bev + 52 * riv, bO = 48 + 26 * hexCell + 52 * bev + 60 * riv;
        rO = rO * (1.0 - trace) + 24 * trace; gO = gO * (1.0 - trace) + 126 * trace; bO = bO * (1.0 - trace) + 148 * trace;
        rO = rO * (1.0 - seam) + 10 * seam;   gO = gO * (1.0 - seam) + 14 * seam;   bO = bO * (1.0 - seam) + 20 * seam;
        obsAlb[o] = Math.round(clamp01(rO / 255) * 255);
        obsAlb[o + 1] = Math.round(clamp01(gO / 255) * 255);
        obsAlb[o + 2] = Math.round(clamp01(bO / 255) * 255);
        obsAlb[o + 3] = 255;
        var rghO = 0.30 - 0.08 * hexCell - 0.10 * bev + 0.26 * seam - 0.08 * riv;
        var metO = 0.78 + 0.14 * bev + 0.16 * riv - 0.34 * seam - 0.12 * (1.0 - hexCell);
        obsMr[o] = 255; obsMr[o + 1] = Math.round(clamp01(rghO) * 255); obsMr[o + 2] = Math.round(clamp01(metO) * 255); obsMr[o + 3] = 255;
        obsH[idx] = 0.50 + 0.16 * hexCell - 0.42 * seam + 0.10 * bev - 0.18 * trace + 0.34 * riv;

        // --- B) Bronze Bearing Knurling & Rotary Grooves ---
        var kn1 = Math.sin(TWO_PI * (24.0 * u + 12.0 * v)), kn2 = Math.sin(TWO_PI * (24.0 * u - 12.0 * v));
        var inKn = _sstep01(0.20, 0.26, v) * (1.0 - _sstep01(0.74, 0.80, v));
        var flute = 0.5 + 0.5 * Math.cos(TWO_PI * 32.0 * u);
        var knH = (0.5 + 0.5 * kn1 * kn2) * inKn + flute * (1.0 - inKn) * 0.7;
        var bGroove = (1.0 - _sstep01(0.015, 0.036, Math.abs(v - 0.20))) + (1.0 - _sstep01(0.015, 0.036, Math.abs(v - 0.80))) +
                      (1.0 - _sstep01(0.012, 0.028, Math.abs(v - 0.50))) * 0.65;
        bGroove = clamp01(bGroove);
        var bWear = (1.0 - _sstep01(0.036, 0.075, Math.min(Math.abs(v - 0.20), Math.abs(v - 0.80)))) * (1.0 - bGroove);
        var rB = 166 + 52 * (knH - 0.35) + 46 * bWear, gB = 126 + 42 * (knH - 0.35) + 42 * bWear, bB = 64 + 26 * (knH - 0.35) + 32 * bWear;
        rB = rB * (1.0 - bGroove) + 46 * bGroove; gB = gB * (1.0 - bGroove) + 32 * bGroove; bB = bB * (1.0 - bGroove) + 16 * bGroove;
        brzAlb[o] = Math.round(clamp01(rB / 255) * 255);
        brzAlb[o + 1] = Math.round(clamp01(gB / 255) * 255);
        brzAlb[o + 2] = Math.round(clamp01(bB / 255) * 255);
        brzAlb[o + 3] = 255;
        var rghB = 0.28 + 0.14 * (1.0 - knH) - 0.08 * bWear + 0.22 * bGroove;
        var metB = 0.88 + 0.08 * bWear - 0.24 * bGroove;
        brzMr[o] = 255; brzMr[o + 1] = Math.round(clamp01(rghB) * 255); brzMr[o + 2] = Math.round(clamp01(metB) * 255); brzMr[o + 3] = 255;
        brzH[idx] = 0.45 + 0.34 * knH + 0.08 * bWear - 0.38 * bGroove;

        // --- C) Glowing Cyan Plasma Blade Edge & Emitter Housing ---
        var edgeRamp = _sstep01(0.12, 0.92, u);
        var hotCore = _sstep01(0.68, 0.98, u);
        var harmonic = 0.84 + 0.16 * Math.sin(TWO_PI * (14.0 * v + 2.0 * u));
        var emitterRib = (1.0 - _sstep01(0.16, 0.26, u)) * (0.5 + 0.5 * Math.cos(TWO_PI * 16.0 * v));
        var plasma = clamp01(edgeRamp * harmonic);
        var rC = 22 * (1.0 - plasma) + 56 * plasma + 168 * hotCore - 12 * emitterRib;
        var gC = 112 * (1.0 - plasma) + 242 * plasma + 13 * hotCore - 38 * emitterRib;
        var bC = 132 * (1.0 - plasma) + 255 * plasma - 36 * emitterRib;
        cynAlb[o] = Math.round(clamp01(rC / 255) * 255);
        cynAlb[o + 1] = Math.round(clamp01(gC / 255) * 255);
        cynAlb[o + 2] = Math.round(clamp01(bC / 255) * 255);
        cynAlb[o + 3] = 255;
        var emGain = 0.30 + 0.70 * plasma;
        cynEm[o]     = Math.round(clamp01((14 + 180 * hotCore) * emGain / 255) * 255);
        cynEm[o + 1] = Math.round(clamp01((198 + 57 * hotCore) * emGain / 255) * 255);
        cynEm[o + 2] = Math.round(clamp01((232 + 23 * hotCore) * emGain / 255) * 255);
        cynEm[o + 3] = 255;
        cynMr[o] = 255;
        cynMr[o + 1] = Math.round(clamp01(0.24 - 0.14 * plasma + 0.10 * emitterRib) * 255);
        cynMr[o + 2] = Math.round(clamp01(0.62 * (1.0 - plasma) + 0.18 * plasma) * 255);
        cynMr[o + 3] = 255;
        cynH[idx] = 0.50 - 0.22 * emitterRib + 0.10 * hotCore;
      }
    }

    var obsMrTex = _makeDataTex(obsMr, sz, false);
    var brzMrTex = _makeDataTex(brzMr, sz, false);
    var cynMrTex = _makeDataTex(cynMr, sz, false);

    _mantisMats = {
      obs: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: _makeDataTex(obsAlb, sz, true),
        roughnessMap: obsMrTex,
        metalnessMap: obsMrTex,
        normalMap: _makeNormalTex(obsH, sz, 3.2),
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 1.0,
        metalness: 1.0,
        side: THREE.DoubleSide
      }),
      brz: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: _makeDataTex(brzAlb, sz, true),
        roughnessMap: brzMrTex,
        metalnessMap: brzMrTex,
        normalMap: _makeNormalTex(brzH, sz, 3.0),
        normalScale: new THREE.Vector2(0.90, 0.90),
        roughness: 1.0,
        metalness: 1.0
      }),
      cyan: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: _makeDataTex(cynAlb, sz, true),
        emissive: 0xffffff,
        emissiveMap: _makeDataTex(cynEm, sz, true),
        emissiveIntensity: 0.95,
        roughnessMap: cynMrTex,
        metalnessMap: cynMrTex,
        normalMap: _makeNormalTex(cynH, sz, 2.2),
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughness: 1.0,
        metalness: 1.0,
        side: THREE.DoubleSide
      })
    };
    return _mantisMats;
  }

  function buildMantisBladeGeometry(sx){
    // Sleek 6-station curved mantis scythe-blade with diamond spine & razor plasma inner edge
    // Runs in character-aligned forearm space from wrist (sx*0.145, -0.135, +0.145) to tip (sx*0.235, -0.255, +0.365)
    var stations = [
      { p: [sx * 0.142, -0.130, 0.140], w: 0.018, h: 0.048 },
      { p: [sx * 0.168, -0.145, 0.195], w: 0.016, h: 0.056 },
      { p: [sx * 0.192, -0.168, 0.252], w: 0.014, h: 0.052 },
      { p: [sx * 0.210, -0.196, 0.305], w: 0.011, h: 0.040 },
      { p: [sx * 0.220, -0.228, 0.348], w: 0.007, h: 0.024 },
      { p: [sx * 0.215, -0.262, 0.382], w: 0.002, h: 0.004 }
    ];
    var spinePos = [], spineUv = [], edgePos = [], edgeUv = [];
    function pushTri(posArr, uvArr, a, b, c, ua, ub, uc){
      posArr.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      uvArr.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
    }
    function ringOf(st){
      var cx = st.p[0], cy = st.p[1], cz = st.p[2], w = st.w, h = st.h;
      return {
        top:   [cx, cy + h * 0.55, cz - h * 0.22],
        left:  [cx + w, cy + h * 0.08, cz],
        right: [cx - w, cy + h * 0.08, cz],
        midL:  [cx + w * 0.42, cy - h * 0.25, cz + h * 0.16],
        midR:  [cx - w * 0.42, cy - h * 0.25, cz + h * 0.16],
        razor: [cx - sx * 0.003, cy - h * 0.68, cz + h * 0.36]
      };
    }
    var rings = stations.map(ringOf);
    var nSeg = rings.length - 1;
    for(var i = 0; i < nSeg; i++){
      var r0 = rings[i], r1 = rings[i + 1];
      var v0 = (i / nSeg) * 2.2, v1 = ((i + 1) / nSeg) * 2.2;
      // Obsidian dorsal spine facets with seamless across-spine UVs
      pushTri(spinePos, spineUv, r0.top, r0.left, r1.top,   [0.50, v0], [0.22, v0], [0.50, v1]);
      pushTri(spinePos, spineUv, r1.top, r0.left, r1.left,  [0.50, v1], [0.22, v0], [0.22, v1]);
      pushTri(spinePos, spineUv, r0.top, r1.top, r0.right,  [0.50, v0], [0.50, v1], [0.78, v0]);
      pushTri(spinePos, spineUv, r1.top, r1.right, r0.right,[0.50, v1], [0.78, v1], [0.78, v0]);
      pushTri(spinePos, spineUv, r0.left, r0.midL, r1.left, [0.22, v0], [0.04, v0], [0.22, v1]);
      pushTri(spinePos, spineUv, r1.left, r0.midL, r1.midL, [0.22, v1], [0.04, v0], [0.04, v1]);
      pushTri(spinePos, spineUv, r0.right, r1.right, r0.midR,[0.78, v0], [0.78, v1], [0.96, v0]);
      pushTri(spinePos, spineUv, r1.right, r1.midR, r0.midR,[0.78, v1], [0.96, v1], [0.96, v0]);
      // Glowing cyan razor bevel facets (u=0.06 emitter spine-join -> u=0.98 incandescent razor edge)
      pushTri(edgePos, edgeUv, r0.midL, r0.razor, r1.midL,  [0.06, v0], [0.98, v0], [0.06, v1]);
      pushTri(edgePos, edgeUv, r1.midL, r0.razor, r1.razor, [0.06, v1], [0.98, v0], [0.98, v1]);
      pushTri(edgePos, edgeUv, r0.midR, r1.midR, r0.razor,  [0.06, v0], [0.06, v1], [0.98, v0]);
      pushTri(edgePos, edgeUv, r1.midR, r1.razor, r0.razor, [0.06, v1], [0.98, v1], [0.98, v0]);
    }
    // Cap proximal tang
    pushTri(spinePos, spineUv, rings[0].top, rings[0].right, rings[0].left, [0.50, 0.0], [0.78, 0.0], [0.22, 0.0]);
    pushTri(edgePos, edgeUv, rings[0].left, rings[0].right, rings[0].razor, [0.10, 0.0], [0.10, 0.0], [0.98, 0.0]);

    var gSpine = new THREE.BufferGeometry();
    gSpine.setAttribute('position', new THREE.Float32BufferAttribute(spinePos, 3));
    gSpine.setAttribute('uv', new THREE.Float32BufferAttribute(spineUv, 2));
    gSpine.computeVertexNormals();
    var gEdge = new THREE.BufferGeometry();
    gEdge.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
    gEdge.setAttribute('uv', new THREE.Float32BufferAttribute(edgeUv, 2));
    gEdge.computeVertexNormals();
    return { spine: gSpine, edge: gEdge, tip: new THREE.Vector3(sx * 0.215, -0.262, 0.382) };
  }

  function buildProceduralMantisRig(fig, state){
    if(state.mantisRig) return state.mantisRig;
    var sp2Idx = state.thorax ? state.thorax.spine2Idx : state.byName.Spine2;
    if(sp2Idx === undefined || !fig.bones[sp2Idx]) return null;

    var sp2Wq = state.thorax ? state.thorax.spine2Wq : new THREE.Quaternion();
    // Root aligns Spine2 local space back to character-space (+X Left, +Y Up, +Z Fwd) at rest!
    var root = new THREE.Group();
    root.name = 'fa:mantis_scythe_rig';
    root.quaternion.copy(sp2Wq).invert();

    var mats = getMantisMaterials();
    var matObs = mats.obs, matBrz = mats.brz, matCyan = mats.cyan;

    var cylUnit = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
    var sphUnit = new THREE.SphereGeometry(1, 16, 12);

    function makeTube(r0, r1, p0, p1, mat){
      var g = new THREE.CylinderGeometry(r1, r0, 1, 14, 1);
      var segLen = p0.distanceTo(p1);
      var vScale = Math.max(0.35, segLen / 0.18);
      var uvAttr = g.attributes.uv;
      if(uvAttr){
        for(var ui = 0; ui < uvAttr.count; ui++) uvAttr.setY(ui, uvAttr.getY(ui) * vScale);
        uvAttr.needsUpdate = true;
      }
      var mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      return orientTubeBetween(mesh, p0, p1);
    }
    function makeNode(rad, pos, mat, scaleV){
      var mesh = new THREE.Mesh(sphUnit, mat);
      mesh.position.copy(pos);
      if(scaleV) mesh.scale.copy(scaleV);
      else mesh.scale.setScalar(rad);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      return mesh;
    }

    // 1. Dorsal Scapula Carapace Mount (relative to Spine2 origin in character axes)
    var hubHi = new THREE.Vector3(0, 0.14, -0.095);
    var hubLo = new THREE.Vector3(0, -0.08, -0.088);
    var spineHub = makeTube(0.042, 0.052, hubLo, hubHi, matObs);
    spineHub.scale.x *= 1.35;
    spineHub.scale.z *= 0.65;
    root.add(spineHub);
    root.add(makeTube(0.014, 0.016, new THREE.Vector3(0, -0.06, -0.118), new THREE.Vector3(0, 0.13, -0.122), matCyan));
    root.add(makeNode(0.024, new THREE.Vector3(0, 0.06, -0.126), matCyan));

    var sides = {};
    [-1, 1].forEach(function(sx){
      var key = sx > 0 ? 'L' : 'R';
      var pylonStart = new THREE.Vector3(sx * 0.036, 0.12, -0.098);
      var shPos = new THREE.Vector3(sx * 0.165, 0.245, -0.115);
      root.add(makeTube(0.030, 0.026, pylonStart, shPos, matObs));
      root.add(makeTube(0.012, 0.012, new THREE.Vector3(sx * 0.032, 0.04, -0.096), shPos, matBrz));

      var upper = new THREE.Group();
      upper.position.copy(shPos);
      // Shoulder rotary drum + glowing bearing ring
      var shDrum = new THREE.Mesh(cylUnit, matBrz);
      shDrum.rotation.x = Math.PI / 2;
      shDrum.scale.set(0.044, 0.052, 0.044);
      shDrum.castShadow = true;
      upper.add(shDrum);
      upper.add(makeNode(0.020, new THREE.Vector3(0, 0, -0.028), matCyan));

      var elRel = new THREE.Vector3(sx * 0.250, 0.162, -0.042);
      upper.add(makeTube(0.032, 0.025, new THREE.Vector3(0, 0, 0), elRel, matObs));
      // Parallel hydraulic piston under humerus
      upper.add(makeTube(0.012, 0.010, new THREE.Vector3(sx * 0.02, -0.032, 0.01),
        new THREE.Vector3(elRel.x - sx * 0.02, elRel.y - 0.028, elRel.z + 0.01), matBrz));

      var fore = new THREE.Group();
      fore.position.copy(elRel);
      var elDrum = new THREE.Mesh(cylUnit, matBrz);
      elDrum.rotation.x = Math.PI / 2;
      elDrum.scale.set(0.038, 0.046, 0.038);
      elDrum.castShadow = true;
      fore.add(elDrum);
      fore.add(makeNode(0.017, new THREE.Vector3(0, 0, -0.024), matCyan));

      var wristRel = new THREE.Vector3(sx * 0.148, -0.136, 0.148);
      fore.add(makeTube(0.030, 0.022, new THREE.Vector3(0, 0, 0), wristRel, matObs));
      fore.add(makeTube(0.010, 0.009, new THREE.Vector3(0, 0.024, -0.018),
        new THREE.Vector3(wristRel.x * 0.86, wristRel.y + 0.022, wristRel.z - 0.018), matBrz));
      fore.add(makeNode(0.024, wristRel, matBrz));

      var blade = buildMantisBladeGeometry(sx);
      var spineMesh = new THREE.Mesh(blade.spine, matObs);
      spineMesh.castShadow = true;
      spineMesh.frustumCulled = false;
      var edgeMesh = new THREE.Mesh(blade.edge, matCyan);
      edgeMesh.frustumCulled = false;
      fore.add(spineMesh);
      fore.add(edgeMesh);

      var tipAnchor = new THREE.Object3D();
      tipAnchor.position.copy(blade.tip);
      fore.add(tipAnchor);

      upper.add(fore);
      root.add(upper);
      sides[key] = { upper: upper, fore: fore, tip: tipAnchor };
    });

    fig.bones[sp2Idx].add(root);
    state.mantisRig = {
      kind: 'mantis_scythe',
      root: root,
      upperL: sides.L.upper,
      upperR: sides.R.upper,
      foreL: sides.L.fore,
      foreR: sides.R.fore,
      tipL: sides.L.tip,
      tipR: sides.R.tip,
      axX: AX_X,
      axY: AX_Y,
      axZ: AX_Z
    };
    return state.mantisRig;
  }

  function applyDorsalSide(rig, isLeft, shPitch, shYaw, shRoll, elPitch, elYaw){
    var sx = isLeft ? 1 : -1;
    var upper = isLeft ? rig.upperL : rig.upperR;
    var fore = isLeft ? rig.foreL : rig.foreR;
    if(!upper || !fore) return;

    _q1.setFromAxisAngle(rig.axX, shPitch * DEG);
    _q2.setFromAxisAngle(rig.axY, -sx * shYaw * DEG);
    _q3.setFromAxisAngle(rig.axZ, sx * shRoll * DEG);
    upper.quaternion.copy(_q1).multiply(_q2).multiply(_q3);

    _q1.setFromAxisAngle(rig.axX, elPitch * DEG);
    _q2.setFromAxisAngle(rig.axY, -sx * elYaw * DEG);
    fore.quaternion.copy(_q1).multiply(_q2);
  }

  /* ---- Sync & Per-Frame Update ---- */
  function syncFourArms(fig){
    var state = fig._faState;
    if(!state || !fig.live) return;

    // 1. Check for worn clich_{m,f}_reliquary_servo_arms mesh
    var activeServo = null;
    var keys = Object.keys(fig.live);
    for(var i = 0; i < keys.length; i++){
      var m = fig.live[keys[i]];
      var pt = m && m.userData && m.userData.part;
      if(pt && pt.key && pt.key.indexOf('reliquary_servo_arms') >= 0){
        if(m.visible){
          activeServo = buildReliquaryServoRig(fig, m, state);
          if(activeServo) activeServo.root.visible = true;
        } else if(m.userData._faServo && m.userData._faServo.root){
          m.userData._faServo.root.visible = false;
        }
      }
    }
    state.servoRig = activeServo;

    // 2. Check for procedural dorsal_rig: 'mantis' on fig.record
    var wantMantis = !!(fig.record && fig.record.dorsal_rig === 'mantis' && !activeServo);
    if(wantMantis){
      var mr = buildProceduralMantisRig(fig, state);
      if(mr) mr.root.visible = true;
    } else if(state.mantisRig && state.mantisRig.root){
      state.mantisRig.root.visible = false;
    }

    state.activeDorsal = activeServo || (wantMantis ? state.mantisRig : null);
    fig.hasDorsalArms = !!state.activeDorsal;
    updateFourArms(fig, 0);
  }

  function updateFourArms(fig, dt){
    var state = fig._faState;
    if(!state || !fig.bones) return;

    var step = dt > 0 ? Math.min(dt, 0.1) : 0;
    state.clock += step;
    var mv = state.move;
    if(mv){
      mv.t += step;
      if(mv.t >= mv.dur){
        state.move = null;
        fig._faMove = null;
        mv = null;
      }
    }

    var changed = false;

    // Part A: Thorax-Mounted 4-Limb Animator (Left2* / Right2*)
    if(fig.fourArms && state.thorax && state.thorax.sides.length === 2){
      var isThoraxMove = !!(mv && THORAX_KEYFRAMES[mv.key]);
      var clipName = (fig.action && fig.action.getClip && fig.action.getClip().name) || '';
      var inCombatGuard = (clipName === 'combat_idle' || clipName === 'unarmed_guard' || clipName === 'ual_sword_idle' || !!DEFEND_CLIPS[clipName]);

      if(isThoraxMove){
        var uT = clamp01(mv.t / mv.dur);
        var tp = sampleThoraxPose(mv.key, uT);
        var wT = tp.blend;
        if(wT > 0.001){
          applyThoraxSide(fig.bones, fig.held, state.thorax.sides[0], tp.l_pitch, tp.l_yaw, tp.l_flare, tp.l_elbow, tp.l_wrist, wT);
          applyThoraxSide(fig.bones, fig.held, state.thorax.sides[1], tp.r_pitch, tp.r_yaw, tp.r_flare, tp.r_elbow, tp.r_wrist, wT);
          changed = true;
        }
      } else if(inCombatGuard){
        // Crisp 4-arm combat guard breathing & ready fists when standing in combat stance
        var breath = Math.sin(state.clock * 2.4);
        var sway = Math.cos(state.clock * 1.7);
        applyThoraxSide(fig.bones, fig.held, state.thorax.sides[0],
          24 + 3.5 * breath, 16 + 2.5 * sway, -6, 68 + 3.0 * breath, 0, 0.55);
        applyThoraxSide(fig.bones, fig.held, state.thorax.sides[1],
          24 - 3.5 * breath, 16 - 2.5 * sway, -6, 68 - 3.0 * breath, 0, 0.55);
        changed = true;
      }
    }

    // Part B: Dorsal-Mounted 4-Limb Articulator (Spine2 Scapula Over-Shoulder Arms)
    var dRig = state.activeDorsal;
    if(dRig && dRig.root && dRig.root.visible){
      if(dRig.hostMesh && !dRig.hostMesh.visible){
        dRig.root.visible = false;
        fig.hasDorsalArms = false;
      } else {
        var t = state.clock;
        // Sinister predatory idle breathing & counter-phased sway
        var idPitchL = 8 + 4.2 * Math.sin(t * 2.1);
        var idYawL   = 20 + 5.0 * Math.cos(t * 1.55);
        var idRollL  = 6 + 3.2 * Math.sin(t * 1.85 + 0.6);
        var idElPL   = -16 + 4.5 * Math.cos(t * 2.1 + 0.4);
        var idElYL   = 12 + 3.5 * Math.sin(t * 1.55);

        var idPitchR = 8 + 4.2 * Math.sin(t * 2.1 + 0.9);
        var idYawR   = 20 + 5.0 * Math.cos(t * 1.55 + 0.9);
        var idRollR  = 6 + 3.2 * Math.sin(t * 1.85 + 1.5);
        var idElPR   = -16 + 4.5 * Math.cos(t * 2.1 + 1.3);
        var idElYR   = 12 + 3.5 * Math.sin(t * 1.55 + 0.9);

        var isDorsalMove = !!(mv && DORSAL_KEYFRAMES[mv.key]);
        if(isDorsalMove){
          var uD = clamp01(mv.t / mv.dur);
          var dp = sampleDorsalPose(mv.key, uD);
          var wD = dp.blend;
          // Subtle high-frequency plasma tremor during sustained dorsal_tri_beam lock!
          var beamTremor = (mv.key === 'dorsal_tri_beam' && uD > 0.28 && uD < 0.78) ? Math.sin(t * 42.0) * 1.4 : 0;
          applyDorsalSide(dRig, true,
            idPitchL + (dp.l_sh_pitch - idPitchL) * wD + beamTremor,
            idYawL   + (dp.l_sh_yaw   - idYawL)   * wD,
            idRollL  + (dp.l_sh_roll  - idRollL)  * wD,
            idElPL   + (dp.l_el_pitch - idElPL)   * wD - beamTremor,
            idElYL   + (dp.l_el_yaw   - idElYL)   * wD);
          applyDorsalSide(dRig, false,
            idPitchR + (dp.r_sh_pitch - idPitchR) * wD - beamTremor,
            idYawR   + (dp.r_sh_yaw   - idYawR)   * wD,
            idRollR  + (dp.r_sh_roll  - idRollR)  * wD,
            idElPR   + (dp.r_el_pitch - idElPR)   * wD + beamTremor,
            idElYR   + (dp.r_el_yaw   - idElYR)   * wD);
        } else {
          applyDorsalSide(dRig, true, idPitchL, idYawL, idRollL, idElPL, idElYL);
          applyDorsalSide(dRig, false, idPitchR, idYawR, idRollR, idElPR, idElYR);
        }
        changed = true;
      }
    }

    if(changed && fig.inner){
      fig.inner.updateMatrixWorld(true);
    }
  }

  function attachFourArms(fig, bodyArg){
    var byName = {};
    (fig.bones || []).forEach(function(b, i){ byName[b.name] = i; });
    var skel = bodyArg && bodyArg.skeleton;
    var thoraxRig = buildThoraxRig(skel, byName);

    fig._faState = {
      clock: 0,
      byName: byName,
      thorax: thoraxRig,
      servoRig: null,
      mantisRig: null,
      activeDorsal: null,
      move: null
    };
    fig._faMove = null;
    fig.hasDorsalArms = false;

    fig.playFourArmMove = function(moveKey, durSec){
      if(!moveKey || (!THORAX_KEYFRAMES[moveKey] && !DORSAL_KEYFRAMES[moveKey])) return false;
      var m = {
        key: moveKey,
        t: 0,
        dur: Math.max(0.18, durSec == null ? 0.85 : +durSec)
      };
      fig._faState.move = m;
      fig._faMove = m;
      return true;
    };

    fig.clearFourArmMove = function(){
      if(fig._faState) fig._faState.move = null;
      fig._faMove = null;
    };

    fig.getDorsalTipsWorld = function(outL, outR){
      var d = fig._faState && fig._faState.activeDorsal;
      if(!d || !d.root || !d.root.visible || !d.tipL || !d.tipR) return false;
      fig.group.updateMatrixWorld(true);
      if(outL) d.tipL.getWorldPosition(outL);
      if(outR) d.tipR.getWorldPosition(outR);
      return true;
    };

    var origApply = fig.apply;
    fig.apply = function(rec){
      return origApply.call(fig, rec).then(function(res){
        syncFourArms(fig);
        return res;
      });
    };

    var origPlay = fig.play;
    fig.play = function(name){
      // Automatic reactive lower-arm / dorsal canopy parry when any 4-limb fighter plays a block/parry clip!
      if(name && DEFEND_CLIPS[name] && (fig.fourArms || fig.hasDorsalArms)){
        var cur = fig._faState && fig._faState.move;
        if(!cur || cur.t > 0.08){
          fig.playFourArmMove(fig.hasDorsalArms ? 'dorsal_canopy_parry' : 'thorax_mid_parry', 0.44);
        }
      }
      return origPlay.call(fig, name);
    };

    var origUpdate = fig.update;
    fig.update = function(dt){
      origUpdate.call(fig, dt);
      updateFourArms(fig, dt);
    };

    var origDispose = fig.dispose;
    fig.dispose = function(){
      if(fig._faState){
        var s = fig._faState;
        if(s.servoRig && s.servoRig.root && s.servoRig.root.parent) s.servoRig.root.parent.remove(s.servoRig.root);
        if(s.mantisRig && s.mantisRig.root && s.mantisRig.root.parent) s.mantisRig.root.parent.remove(s.mantisRig.root);
        s.servoRig = null;
        s.mantisRig = null;
        s.activeDorsal = null;
        s.move = null;
      }
      fig._faMove = null;
      return origDispose.call(fig);
    };
  }

  var _PrevKCharFigure = KCharFigure;
  KCharFigure = new Proxy(_PrevKCharFigure, {
    construct: function(Target, args, newTarget){
      var fig = Reflect.construct(Target, args, newTarget);
      attachFourArms(fig, args && args[0]);
      return fig;
    }
  });
  KCharFigure._fourArmsWrapped = true;
  KCharFigure.FourArms = {
    THORAX_MOVES: Object.keys(THORAX_KEYFRAMES),
    DORSAL_MOVES: Object.keys(DORSAL_KEYFRAMES),
    sampleThoraxPose: sampleThoraxPose,
    sampleDorsalPose: sampleDorsalPose
  };
})();
