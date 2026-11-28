// ================================================================= CASCADE — materials & geometry accumulator  [draw]
// Binds the 13 packed library families (materials.json -> tex/), builds interior-mapped glazing for both Ancient and
// Iron Republic states (reading eye from viewMatrix, never cameraPosition), and provides a winding-safe merged-bucket
// builder whose opaque structural meshes carry userData.cap = true for 99-host-section's hatched section cuts.
(function () {
  'use strict';

  AV.ROOM_GLSL = [
    'vec3 avRoom(vec3 P, vec3 rd, vec3 n, vec3 warmTint, float strength) {',
    '  const float S = 3.6, W = 5.2, D = 6.8;',
    '  vec3 up = abs(n.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);',
    '  vec3 t = normalize(cross(up, n));',
    '  float a = dot(P, t);',
    '  float ia = floor(a / W), fa = a / W - ia, iy = floor(P.y / S), fy = P.y / S - iy;',
    '  vec3 q = vec3(dot(rd, t), rd.y, -dot(rd, n));',
    '  float tx = (q.x > 0.0 ? 1.0 - fa : fa) * W / max(abs(q.x), 1e-3);',
    '  float ty = (q.y > 0.0 ? 1.0 - fy : fy) * S / max(abs(q.y), 1e-3);',
    '  float tz = D / max(q.z, 1e-3);',
    '  float T = min(tx, min(ty, tz));',
    '  float h = fract(sin(ia * 12.9898 + iy * 78.233) * 437.5453);',
    '  vec3 c = T == ty ? (q.y > 0.0 ? warmTint * 1.15 : warmTint * 0.55) : (T == tz ? mix(warmTint * 0.48, warmTint * 1.10, h) : warmTint * 0.72);',
    '  return c * exp(-T * 0.13) * (0.35 + 0.85 * step(0.28, h)) * strength;',
    '}'
  ].join('\n');

  var WIN_GAIN = { value: 1.0 };
  AV.windowMat = function (baseOpts, warmVec3, strength, keySuffix) {
    var m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, baseOpts));
    var wStr = 'vec3(' + KHOOK.glf(warmVec3[0], 3) + ',' + KHOOK.glf(warmVec3[1], 3) + ',' + KHOOK.glf(warmVec3[2], 3) + ')';
    var kStr = KHOOK.glf(strength, 3);
    KHOOK.add(m, 'av-window-' + keySuffix, {
      eye: true,
      uniforms: { uAvGain: WIN_GAIN },
      vertex: {
        head: 'varying vec3 vAvW;\nvarying vec3 vAvN;\n',
        at: [{ at: 'begin_vertex', after: 'vAvW = (modelMatrix * vec4(position, 1.0)).xyz;\nvAvN = normalize(mat3(modelMatrix) * normal);' }]
      },
      fragment: {
        head: 'uniform float uAvGain;\nvarying vec3 vAvW;\nvarying vec3 vAvN;\n' + AV.ROOM_GLSL + '\n',
        at: [{ at: 'emissivemap_fragment', after: 'totalEmissiveRadiance += avRoom(vAvW, normalize(vAvW - kEye()), normalize(vAvN), ' + wStr + ', ' + kStr + ' * uAvGain);' }]
      }
    });
    return m;
  };

  var MATS = null;
  AV.mats = function () {
    if (MATS) return MATS;
    function fam(name, extra) {
      var P = KMAT.mode === 'lib' ? KMAT.packed('cascade', name) : null;
      var T = P ? KMAT.textures(P, { aniso: 8 }) : {};
      if (P && P.scale) {
        [T.map, T.normalMap, T.roughnessMap].forEach(function (tex) {
          if (tex) tex.repeat.set(4 / P.scale[0], 4 / P.scale[1]);
        });
      }
      return new THREE.MeshStandardMaterial(Object.assign({
        map: T.map || null,
        normalMap: T.normalMap || null,
        roughnessMap: T.roughnessMap || null,
        vertexColors: true,
        metalness: P ? (P.metal == null ? 0 : P.metal) : 0,
        roughness: 1.0
      }, extra || {}));
    }
    MATS = {
      white: fam('white', { metalness: 0.12 }),
      concrete: fam('concrete'),
      relief: fam('relief'),
      bronze: fam('bronze', { metalness: 0.28, roughness: 0.52, color: 0xe0bc8c }),
      iron: fam('iron', { metalness: 0.26, roughness: 0.56, color: 0x7c828c }),
      corrugate: fam('corrugate', { metalness: 0.24, roughness: 0.62, color: 0xa8a49a }),
      timber: fam('timber', { color: 0xc8a476 }),
      celadon: fam('celadon', { roughness: 0.36, color: 0x78a88c }),
      stone: fam('stone'),
      pave: fam('pave'),
      rubble: fam('rubble'),
      tilled: fam('tilled'),
      turf: fam('turf', { color: 0x769658 }),
      slab: fam('concrete', { vertexColors: false }),
      partWall: fam('white', { vertexColors: true, metalness: 0.05 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x8fe9ee, emissive: 0x2ed4de, emissiveIntensity: 1.15, roughness: 0.35, metalness: 0.0, vertexColors: true }),
      cyanDead: new THREE.MeshStandardMaterial({ color: 0x2c3438, roughness: 0.85, metalness: 0.12, vertexColors: true }),
      repGlow: new THREE.MeshStandardMaterial({ color: 0xffc878, emissive: 0xe68828, emissiveIntensity: 1.25, roughness: 0.35, metalness: 0.0, vertexColors: true }),
      repArc: new THREE.MeshStandardMaterial({ color: 0xa8ecff, emissive: 0x52c8ff, emissiveIntensity: 1.45, roughness: 0.25, metalness: 0.1, vertexColors: true }),
      repRed: new THREE.MeshStandardMaterial({ color: 0x8c242c, roughness: 0.82, metalness: 0.0, vertexColors: true, side: THREE.DoubleSide }),
      repOchre: new THREE.MeshStandardMaterial({ color: 0xd19a3a, roughness: 0.68, metalness: 0.15, vertexColors: true }),
      dark: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.95, metalness: 0.0, vertexColors: true }),
      glassClear: new THREE.MeshStandardMaterial({ color: 0xa8cfdc, roughness: 0.08, metalness: 0.22, transparent: true, opacity: 0.30, depthWrite: false, vertexColors: true, side: THREE.DoubleSide }),
      glassAnc: AV.windowMat({ color: 0x0d202a, roughness: 0.12, metalness: 0.32 }, [0.16, 0.24, 0.28], 0.85, 'anc'),
      glassRep: AV.windowMat({ color: 0x161c20, roughness: 0.16, metalness: 0.26 }, [0.34, 0.24, 0.13], 0.95, 'rep'),
      glassRuin: new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: 0.92, metalness: 0.05, vertexColors: true })
    };
    for (var k in MATS) MATS[k].name = 'av.' + k;
    return MATS;
  };

  AV.setNight = function (k) {
    var nk = k == null ? 0 : k;
    WIN_GAIN.value = 1.0 + 1.85 * nk;
    if (MATS) {
      MATS.repGlow.emissiveIntensity = 1.25 + 1.8 * nk;
      MATS.repArc.emissiveIntensity = 1.45 + 2.4 * nk;
      MATS.cyan.emissiveIntensity = 1.15 + 1.5 * nk;
    }
    return WIN_GAIN.value;
  };

  var NO_CAP = { glassClear: 1, repRed: 1, cyan: 1, repGlow: 1, repArc: 1 };

  // ---- Outward-winding geometry accumulator ----
  AV.builder = function () {
    var B = { b: {} };
    function bucket(name) {
      return B.b[name] || (B.b[name] = { p: [], n: [], u: [], c: [], i: [] });
    }

    // Emit one quad [P0, P1, P2, P3] guaranteed wound counter-clockwise when viewed against normal N
    B.quad = function (name, P0, P1, P2, P3, N, opt) {
      opt = opt || {};
      var q = bucket(name), U = opt.uv == null ? 4.0 : opt.uv, cl = opt.col || [1, 1, 1];
      var ux = P1[0] - P0[0], uy = P1[1] - P0[1], uz = P1[2] - P0[2];
      var vx = P2[0] - P0[0], vy = P2[1] - P0[1], vz = P2[2] - P0[2];
      var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      var dot = cx * N[0] + cy * N[1] + cz * N[2];
      var pts = dot >= 0 ? [P0, P1, P2, P3] : [P0, P3, P2, P1];
      var w = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]);
      var h = Math.hypot(pts[3][0] - pts[0][0], pts[3][1] - pts[0][1], pts[3][2] - pts[0][2]);
      var v = q.p.length / 3;
      var uvs = [[0, 0], [w / U, 0], [w / U, h / U], [0, h / U]];
      for (var k = 0; k < 4; k++) {
        var P = pts[k];
        var vc = opt.colFn ? opt.colFn(P[0], P[1], P[2], cl) : cl;
        q.p.push(P[0], P[1], P[2]);
        q.n.push(N[0], N[1], N[2]);
        q.u.push(uvs[k][0], uvs[k][1]);
        q.c.push(vc[0], vc[1], vc[2]);
      }
      q.i.push(v, v + 1, v + 2, v, v + 2, v + 3);
    };

    B.tri = function (name, P0, P1, P2, N, opt) {
      opt = opt || {};
      var q = bucket(name), U = opt.uv == null ? 4.0 : opt.uv, cl = opt.col || [1, 1, 1];
      var ux = P1[0] - P0[0], uy = P1[1] - P0[1], uz = P1[2] - P0[2];
      var vx = P2[0] - P0[0], vy = P2[1] - P0[1], vz = P2[2] - P0[2];
      var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      var pts = (cx * N[0] + cy * N[1] + cz * N[2]) >= 0 ? [P0, P1, P2] : [P0, P2, P1];
      var v = q.p.length / 3;
      for (var k = 0; k < 3; k++) {
        var P = pts[k];
        var vc = opt.colFn ? opt.colFn(P[0], P[1], P[2], cl) : cl;
        q.p.push(P[0], P[1], P[2]);
        q.n.push(N[0], N[1], N[2]);
        q.u.push((P[0] + P[2]) / U, P[1] / U);
        q.c.push(vc[0], vc[1], vc[2]);
      }
      q.i.push(v, v + 1, v + 2);
    };

    B.box = function (name, x0, x1, y0, y1, z0, z1, opt) {
      B.quad(name, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], opt);
      B.quad(name, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], opt);
      B.quad(name, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], opt);
      B.quad(name, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], opt);
      B.quad(name, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], opt);
      if (!opt || opt.bottom !== false) {
        B.quad(name, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], opt);
      }
    };

    // Oriented box: yaw rotates local +x -> (cos yaw, sin yaw) and local +z -> (-sin yaw, cos yaw)
    B.obox = function (name, cx, cy, cz, yaw, w, h, d, opt) {
      var c = Math.cos(yaw), s = Math.sin(yaw), hw = w * 0.5, hh = h * 0.5, hd = d * 0.5;
      function T(lx, ly, lz) { return [cx + lx * c - lz * s, cy + ly, cz + lx * s + lz * c]; }
      function N(nx, ny, nz) { return [nx * c - nz * s, ny, nx * s + nz * c]; }
      B.quad(name, T(-hw, -hh, hd), T(hw, -hh, hd), T(hw, hh, hd), T(-hw, hh, hd), N(0, 0, 1), opt);
      B.quad(name, T(hw, -hh, -hd), T(-hw, -hh, -hd), T(-hw, hh, -hd), T(hw, hh, -hd), N(0, 0, -1), opt);
      B.quad(name, T(hw, -hh, hd), T(hw, -hh, -hd), T(hw, hh, -hd), T(hw, hh, hd), N(1, 0, 0), opt);
      B.quad(name, T(-hw, -hh, -hd), T(-hw, -hh, hd), T(-hw, hh, hd), T(-hw, hh, -hd), N(-1, 0, 0), opt);
      B.quad(name, T(-hw, hh, hd), T(hw, hh, hd), T(hw, hh, -hd), T(-hw, hh, -hd), [0, 1, 0], opt);
      if (!opt || opt.bottom !== false) {
        B.quad(name, T(-hw, -hh, -hd), T(hw, -hh, -hd), T(hw, -hh, hd), T(-hw, -hh, hd), [0, -1, 0], opt);
      }
    };

    // 3D rectangular strut from A=[x,y,z] to B2=[x,y,z]
    B.beam = function (name, A, B2, w, h, opt) {
      var dx = B2[0] - A[0], dy = B2[1] - A[1], dz = B2[2] - A[2];
      var L = Math.hypot(dx, dy, dz);
      if (L < 0.02) return;
      var fx = dx / L, fy = dy / L, fz = dz / L;
      var ux = 0, uy = 1, uz = 0;
      if (Math.abs(fy) > 0.96) { ux = 1; uy = 0; uz = 0; }
      var rx = uy * fz - uz * fy, ry = uz * fx - ux * fz, rz = ux * fy - uy * fx;
      var rl = Math.hypot(rx, ry, rz) || 1;
      rx /= rl; ry /= rl; rz /= rl;
      var vx = fy * rz - fz * ry, vy = fz * rx - fx * rz, vz = fx * ry - fy * rx;
      var hw = w * 0.5, hh = h * 0.5;
      function P(t, su, sv) {
        return [
          A[0] + dx * t + rx * hw * su + vx * hh * sv,
          A[1] + dy * t + ry * hw * su + vy * hh * sv,
          A[2] + dz * t + rz * hw * su + vz * hh * sv
        ];
      }
      B.quad(name, P(0, 1, -1), P(1, 1, -1), P(1, 1, 1), P(0, 1, 1), [rx, ry, rz], opt);
      B.quad(name, P(1, -1, -1), P(0, -1, -1), P(0, -1, 1), P(1, -1, 1), [-rx, -ry, -rz], opt);
      B.quad(name, P(0, -1, 1), P(1, -1, 1), P(1, 1, 1), P(0, 1, 1), [vx, vy, vz], opt);
      B.quad(name, P(1, -1, -1), P(0, -1, -1), P(0, 1, -1), P(1, 1, -1), [-vx, -vy, -vz], opt);
      B.quad(name, P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1), [fx, fy, fz], opt);
      B.quad(name, P(0, 1, -1), P(0, -1, -1), P(0, -1, 1), P(0, 1, 1), [-fx, -fy, -fz], opt);
    };

    // Closed cylinder/frustum from y0 to y1 around (cx, cz)
    B.cyl = function (name, cx, cz, y0, y1, r0, r1, segs, opt) {
      opt = opt || {};
      var n = segs || 24, a0 = opt.a0 == null ? 0 : opt.a0, a1 = opt.a1 == null ? Math.PI * 2 : opt.a1;
      var dr = r0 - r1, dy = y1 - y0, L = Math.hypot(dr, dy) || 1;
      var ny = dr / L, nr = dy / L;
      for (var i = 0; i < n; i++) {
        var t0 = a0 + (a1 - a0) * (i / n), t1 = a0 + (a1 - a0) * ((i + 1) / n), tm = (t0 + t1) * 0.5;
        if (opt.skip && opt.skip(tm)) continue;
        var c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
        var P0 = [cx + r0 * c0, y0, cz + r0 * s0], P1 = [cx + r0 * c1, y0, cz + r0 * s1];
        var P2 = [cx + r1 * c1, y1, cz + r1 * s1], P3 = [cx + r1 * c0, y1, cz + r1 * s0];
        var nrm = opt.inward ? [-nr * Math.cos(tm), -ny, -nr * Math.sin(tm)] : [nr * Math.cos(tm), ny, nr * Math.sin(tm)];
        B.quad(name, P0, P1, P2, P3, nrm, opt);
        if (opt.caps !== false && !opt.inward) {
          if (r1 > 0.02) B.tri(name, [cx, y1, cz], P3, P2, [0, 1, 0], opt);
          if (r0 > 0.02) B.tri(name, [cx, y0, cz], P0, P1, [0, -1, 0], opt);
        }
      }
    };

    // Extrude a ring between two matching-count 2D polygons outerPts[i] & innerPts[i] from y0 to y1
    B.ringSlab = function (name, outerPts, innerPts, y0, y1, opt) {
      var n = outerPts.length;
      for (var i = 0; i < n; i++) {
        var j = (i + 1) % n;
        var oa = outerPts[i], ob = outerPts[j], ia = innerPts[i], ib = innerPts[j];
        // Top & bottom caps
        B.quad(name, [ia[0], y1, ia[1]], [ib[0], y1, ib[1]], [ob[0], y1, ob[1]], [oa[0], y1, oa[1]], [0, 1, 0], opt);
        B.quad(name, [oa[0], y0, oa[1]], [ob[0], y0, ob[1]], [ib[0], y0, ib[1]], [ia[0], y0, ia[1]], [0, -1, 0], opt);
        // Outer wall (outward normal away from origin)
        var omx = (oa[0] + ob[0]) * 0.5, omz = (oa[1] + ob[1]) * 0.5;
        var edx = ob[0] - oa[0], edz = ob[1] - oa[1], el = Math.hypot(edx, edz) || 1;
        var onx = -edz / el, onz = edx / el;
        if (onx * omx + onz * omz < 0) { onx = -onx; onz = -onz; }
        B.quad(name, [oa[0], y0, oa[1]], [ob[0], y0, ob[1]], [ob[0], y1, ob[1]], [oa[0], y1, oa[1]], [onx, 0, onz], opt);
        // Inner wall (inward normal toward origin)
        var imx = (ia[0] + ib[0]) * 0.5, imz = (ia[1] + ib[1]) * 0.5;
        var idx = ib[0] - ia[0], idz = ib[1] - ia[1], il = Math.hypot(idx, idz) || 1;
        var inx = -idz / il, inz = idx / il;
        if (inx * imx + inz * imz > 0) { inx = -inx; inz = -inz; }
        B.quad(name, [ib[0], y0, ib[1]], [ia[0], y0, ia[1]], [ia[0], y1, ia[1]], [ib[0], y1, ib[1]], [inx, 0, inz], opt);
      }
    };

    B.finish = function (prefix) {
      var G = new THREE.Group(), M = AV.mats();
      G.name = prefix;
      var tris = 0, calls = 0;
      for (var name in B.b) {
        var q = B.b[name];
        if (!q.i.length) continue;
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(q.p, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(q.n, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(q.u, 2));
        g.setAttribute('color', new THREE.Float32BufferAttribute(q.c, 3));
        g.setIndex(q.p.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(q.i, 1) : new THREE.Uint16BufferAttribute(q.i, 1));
        g.computeBoundingSphere();
        g.computeBoundingBox();
        var m = new THREE.Mesh(g, M[name]);
        m.name = prefix + '.' + name;
        if (!NO_CAP[name]) m.userData.cap = true;
        G.add(m);
        tris += q.i.length / 3;
        calls++;
      }
      G.userData = { tris: Math.round(tris), calls: calls };
      return G;
    };

    return B;
  };
})();
