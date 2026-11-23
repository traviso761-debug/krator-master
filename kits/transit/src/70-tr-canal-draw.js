// prefix: kcanal
// ================================================================= TRANSIT KIT — Culture-Styled Canal Infrastructure Drawing ([draw])
// Reusable Three.js merge-bucket builder, culture style profiles (eternian, republican, marr, dalab, voth),
// and canal infrastructure meshes (quays, miter-lock risers, articulated miter-gate leaves, humpback/draw bridges,
// navigable multi-arch aqueducts, diversion weirs, desilting sluice gatehouses, spillways, wharf cranes & paved ways).
(function (K) {
  'use strict';

  var PI = Math.PI, TAU = Math.PI * 2;

  /* Deterministic local PRNG seeded via KRAND so every piece builds identically on every machine */
  var _trSeed = 75001;
  function trReseed(s) {
    _trSeed = (s == null ? 75001 : (s >>> 0)) || 1;
    if (typeof reseed === 'function') reseed(_trSeed);
  }
  function trRng() {
    _trSeed = (_trSeed + 0x6D2B79F5) >>> 0;
    var h = KRAND.hash(_trSeed, 0x517cc1b7, 13);
    return (h >>> 0) / 4294967296.0;
  }
  function trRr(lo, hi) { return lo + (hi - lo) * trRng(); }

  /* ---- 1. Culture Style Profiles ----
     Other countries (Iron Republic Slussport, Marr, Dalab, Voth, Yuni) swap materials, coping, bollards,
     parapet railings, and relief emblems here without touching any [G data] canal or lock logic! */
  var STYLES = {
    eternian: {
      culture: 'eternian',
      stoneD: 0x45494f,
      stoneH: 0xc8c2b4,
      paving: 0x9b9587,
      lime: 0xe6e0d2,
      limeShade: 0xd0c9b8,
      timber: 0x3b2a1e,
      timberL: 0x6b5139,
      planks: 0x765a40,
      bronze: 0x7c5d33,
      verdigris: 0x4b7d6d,
      iron: 0x2c3035,
      lead: 0x565b62,
      celadon: 0x6c9987,
      reed: 0xb8a36f,
      silt: 0x9e8c64,
      alabaster: 0xebe7dc,
      gold: 0xc79c3e,
      cloth: 0xcfc5ae,
      glassLit: 0xffe09c,
      lampPoleMat: 'verdigris',
      gateFrameMat: 'bronze',
      roofMat: 'celadon',
      ancestorRelief: true
    },
    republican: {
      culture: 'republican',
      stoneD: 0x4f3d38,
      stoneH: 0x989a9e,
      paving: 0x74777c,
      lime: 0xb8b2a8,
      limeShade: 0x99948b,
      timber: 0x332822,
      timberL: 0x59473b,
      planks: 0x635042,
      bronze: 0x484d54,
      verdigris: 0x383e44,
      iron: 0x262a2f,
      lead: 0x4d5258,
      celadon: 0x47525c,
      reed: 0x9c8b66,
      silt: 0x87795c,
      alabaster: 0xd8d5ce,
      gold: 0x9e8244,
      cloth: 0xa7a299,
      glassLit: 0xffd282,
      lampPoleMat: 'iron',
      gateFrameMat: 'iron',
      roofMat: 'lead',
      ancestorRelief: false
    },
    marr: {
      culture: 'yuni',
      stoneD: 0x8f6b4a,
      stoneH: 0xd9be96,
      paving: 0xc2a67e,
      lime: 0xede0c8,
      limeShade: 0xd4c2a3,
      timber: 0x4a311f,
      timberL: 0x7a5438,
      planks: 0x855d3f,
      bronze: 0x946f34,
      verdigris: 0x527d70,
      iron: 0x36322e,
      lead: 0x635f59,
      celadon: 0x3d7d7a,
      reed: 0xc7af73,
      silt: 0xb09662,
      alabaster: 0xf2e9d8,
      gold: 0xd4a43b,
      cloth: 0xd9c6a3,
      glassLit: 0xffda8a,
      lampPoleMat: 'bronze',
      gateFrameMat: 'bronze',
      roofMat: 'celadon',
      ancestorRelief: false
    },
    dalab: {
      culture: 'dalab',
      stoneD: 0x5c5850,
      stoneH: 0xbdb6a6,
      paving: 0x969082,
      lime: 0xdcd5c5,
      limeShade: 0xc2baa8,
      timber: 0x423022,
      timberL: 0x6e533c,
      planks: 0x785b42,
      bronze: 0x826234,
      verdigris: 0x517868,
      iron: 0x323436,
      lead: 0x5b5d60,
      celadon: 0x6d7d63,
      reed: 0xb59f6b,
      silt: 0x96855c,
      alabaster: 0xe6e0d2,
      gold: 0xc4983a,
      cloth: 0xc9be9f,
      glassLit: 0xffd480,
      lampPoleMat: 'bronze',
      gateFrameMat: 'timber',
      roofMat: 'stone',
      ancestorRelief: false
    },
    voth: {
      culture: 'voth',
      stoneD: 0x363238,
      stoneH: 0x7c747e,
      paving: 0x5e5761,
      lime: 0xc2b8ae,
      limeShade: 0xa69c92,
      timber: 0x38281e,
      timberL: 0x5e4634,
      planks: 0x694f3b,
      bronze: 0x755638,
      verdigris: 0x4b6b68,
      iron: 0x28262b,
      lead: 0x4c4952,
      celadon: 0x564666,
      reed: 0xa8966c,
      silt: 0x8c7c5a,
      alabaster: 0xdad2c8,
      gold: 0xb88e3e,
      cloth: 0xb8ab96,
      glassLit: 0xffc878,
      lampPoleMat: 'bronze',
      gateFrameMat: 'bronze',
      roofMat: 'timber',
      ancestorRelief: false
    }
  };

  function registerStyle(name, spec) {
    STYLES[name] = Object.assign({}, STYLES.eternian, spec || {}, { culture: (spec && spec.culture) || name });
    return STYLES[name];
  }

  function getStyle(nameOrObj) {
    if (!nameOrObj) return STYLES.eternian;
    if (typeof nameOrObj === 'string') return STYLES[nameOrObj] || STYLES.eternian;
    return nameOrObj;
  }

  /* ---- 2. Self-Contained Indexed THREE.BufferGeometry Merge Builder ---- */
  var _matPool = null;
  var _nightOn = false;
  var _glassMats = [];

  var MAT_PROPS = {
    stone: { roughness: 0.86, metalness: 0.04 },
    paving: { roughness: 0.84, metalness: 0.04 },
    lime: { roughness: 0.82, metalness: 0.02 },
    timber: { roughness: 0.78, metalness: 0.05 },
    planks: { roughness: 0.76, metalness: 0.05 },
    bronze: { roughness: 0.38, metalness: 0.78 },
    verdigris: { roughness: 0.56, metalness: 0.48 },
    iron: { roughness: 0.46, metalness: 0.74 },
    lead: { roughness: 0.54, metalness: 0.62 },
    celadon: { roughness: 0.28, metalness: 0.12 },
    reed: { roughness: 0.90, metalness: 0.0 },
    earth: { roughness: 0.94, metalness: 0.0 },
    cloth: { roughness: 0.88, metalness: 0.0 },
    gold: { roughness: 0.26, metalness: 0.88 },
    glass: { roughness: 0.20, metalness: 0.08, emissive: 0xffb85c, emissiveIntensity: 0.55 }
  };

  function ensureMaterials() {
    if (_matPool) return _matPool;
    _matPool = {};
    for (var mk in MAT_PROPS) {
      var mp = MAT_PROPS[mk];
      var cfg = {
        color: 0xffffff,
        vertexColors: true,
        roughness: mp.roughness,
        metalness: mp.metalness
      };
      if (mp.emissive != null) {
        cfg.emissive = new THREE.Color(mp.emissive);
        cfg.emissiveIntensity = _nightOn ? 1.85 : mp.emissiveIntensity;
      }
      var m = new THREE.MeshStandardMaterial(cfg);
      m.name = 'transit:' + mk;
      if (mk === 'glass') _glassMats.push(m);
      _matPool[mk] = m;
    }
    return _matPool;
  }

  function setNightGlow(on) {
    _nightOn = !!on;
    for (var i = 0; i < _glassMats.length; i++) {
      _glassMats[i].emissiveIntensity = _nightOn ? 1.95 : 0.55;
    }
  }

  function linCol(hexOrCol) {
    if (hexOrCol && hexOrCol.isColor) return hexOrCol.clone();
    var c = new THREE.Color(hexOrCol == null ? 0xffffff : hexOrCol);
    if (typeof c.convertSRGBToLinear === 'function') c.convertSRGBToLinear();
    return c;
  }

  function bucket() {
    return { byMat: {}, tris: 0, lights: [] };
  }

  function applyWorldUV(geo, tile) {
    var pos = geo.attributes.position;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    var nrm = geo.attributes.normal;
    var n = pos.count;
    var uv = new Float32Array(n * 2);
    var sc = tile == null ? 2.0 : +tile;
    for (var i = 0; i < n; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
      var u, v;
      if (ay >= ax && ay >= az) { u = x; v = z; }
      else if (ax >= az) { u = z; v = y; }
      else { u = x; v = y; }
      uv[i * 2] = u / sc;
      uv[i * 2 + 1] = v / sc;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return geo;
  }

  var _m4 = null, _q4 = null, _e4 = null, _vPos = null, _vScl = null, _vUp = null;
  function initTmp() {
    if (_m4) return;
    _m4 = new THREE.Matrix4();
    _q4 = new THREE.Quaternion();
    _e4 = new THREE.Euler();
    _vPos = new THREE.Vector3();
    _vScl = new THREE.Vector3(1, 1, 1);
    _vUp = new THREE.Vector3(0, 1, 0);
  }

  function putGeo(B, mk, geo, px, py, pz, rot, scl, hexCol, tile) {
    initTmp();
    var g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    if (!g.attributes.normal) g.computeVertexNormals();

    if (px || py || pz || rot || scl) {
      _vPos.set(px == null ? 0 : px, py == null ? 0 : py, pz == null ? 0 : pz);
      if (!rot) _q4.set(0, 0, 0, 1);
      else if (rot.isQuaternion) _q4.copy(rot);
      else _q4.setFromEuler(_e4.set(rot[0] || 0, rot[1] || 0, rot[2] || 0, 'XYZ'));
      if (scl == null) _vScl.set(1, 1, 1);
      else if (typeof scl === 'number') _vScl.set(scl, scl, scl);
      else _vScl.set(scl[0], scl[1], scl[2]);
      _m4.compose(_vPos, _q4, _vScl);
      g.applyMatrix4(_m4);
    }

    applyWorldUV(g, tile == null ? 2.0 : tile);
    var n = g.attributes.position.count;
    if (!g.attributes.color) {
      var C = linCol(hexCol);
      var cols = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) {
        cols[i * 3] = C.r;
        cols[i * 3 + 1] = C.g;
        cols[i * 3 + 2] = C.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    }

    var matKey = MAT_PROPS[mk] ? mk : 'stone';
    (B.byMat[matKey] || (B.byMat[matKey] = [])).push(g);
    B.tris += n / 3;
    return g;
  }

  /* Primitives in local frame (note: box/cyl/cone take y0 = BOTTOM y, matching core/engine convention!) */
  function gBox(B, mk, x, y0, z, w, h, d, col, rot) {
    var g = new THREE.BoxGeometry(w, h, d);
    return putGeo(B, mk, g, x, y0 + h * 0.5, z, rot, null, col, 2.0);
  }

  function gCyl(B, mk, x, y0, z, rTop, rBot, h, col, seg, rot) {
    var g = new THREE.CylinderGeometry(rTop, rBot, h, seg == null ? 10 : seg, 1);
    return putGeo(B, mk, g, x, y0 + h * 0.5, z, rot, null, col, 1.5);
  }

  function gCone(B, mk, x, y0, z, r, h, col, seg, rot) {
    var g = new THREE.ConeGeometry(r, h, seg == null ? 8 : seg, 1);
    return putGeo(B, mk, g, x, y0 + h * 0.5, z, rot, null, col, 1.5);
  }

  function gSph(B, mk, x, yc, z, r, col, scl, seg) {
    var s = seg == null ? 10 : seg;
    var g = new THREE.SphereGeometry(r, s, Math.max(6, (s * 0.75) | 0));
    return putGeo(B, mk, g, x, yc, z, null, scl, col, 1.2);
  }

  function gRing(B, mk, x, yc, z, R, rTube, col, rx, rz) {
    var g = new THREE.TorusGeometry(R, rTube, 6, 14);
    var rot = [rx == null ? PI * 0.5 : rx, 0, rz == null ? 0 : rz];
    return putGeo(B, mk, g, x, yc, z, rot, null, col, 1.0);
  }

  function gBeam(B, mk, a, b, rad, col, seg) {
    initTmp();
    var va = new THREE.Vector3(a[0], a[1], a[2]);
    var vb = new THREE.Vector3(b[0], b[1], b[2]);
    var d = vb.clone().sub(va);
    var L = d.length();
    if (L < 1e-4) return null;
    var g = new THREE.CylinderGeometry(rad, rad, L, seg == null ? 8 : seg, 1);
    var q = new THREE.Quaternion().setFromUnitVectors(_vUp, d.normalize());
    var mid = va.add(vb).multiplyScalar(0.5);
    return putGeo(B, mk, g, mid.x, mid.y, mid.z, q, null, col, 1.8);
  }

  /* Thickened parallelogram slab defined by corners p00, p10, p01 and thickness `th` */
  function gSheet(B, mk, p00, p10, p01, th, col) {
    var p11 = [p10[0] + p01[0] - p00[0], p10[1] + p01[1] - p00[1], p10[2] + p01[2] - p00[2]];
    var ux = p10[0] - p00[0], uy = p10[1] - p00[1], uz = p10[2] - p00[2];
    var vx = p01[0] - p00[0], vy = p01[1] - p00[1], vz = p01[2] - p00[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    var nl = Math.hypot(nx, ny, nz) || 1;
    if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
    var hx = nx / nl * th * 0.5, hy = ny / nl * th * 0.5, hz = nz / nl * th * 0.5;
    var top = [
      [p00[0] + hx, p00[1] + hy, p00[2] + hz],
      [p10[0] + hx, p10[1] + hy, p10[2] + hz],
      [p11[0] + hx, p11[1] + hy, p11[2] + hz],
      [p01[0] + hx, p01[1] + hy, p01[2] + hz]
    ];
    var bot = [
      [p00[0] - hx, p00[1] - hy, p00[2] - hz],
      [p10[0] - hx, p10[1] - hy, p10[2] - hz],
      [p11[0] - hx, p11[1] - hy, p11[2] - hz],
      [p01[0] - hx, p01[1] - hy, p01[2] - hz]
    ];
    var pos = [];
    function tri(a, b, c) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    }
    function quad(a, b, c, d) { tri(a, c, b); tri(a, d, c); }
    quad(top[0], top[1], top[2], top[3]);
    quad(bot[0], bot[3], bot[2], bot[1]);
    quad(bot[0], top[0], top[1], bot[1]);
    quad(bot[1], top[1], top[2], bot[2]);
    quad(bot[2], top[2], top[3], bot[3]);
    quad(bot[3], top[3], top[0], bot[0]);
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return putGeo(B, mk, g, 0, 0, 0, null, null, col, 2.0);
  }

  /* Planar double-sided or outward polygon fan */
  function gPoly(B, mk, pts, col, doubleSided) {
    var pos = [];
    for (var i = 1; i + 1 < pts.length; i++) {
      var a = pts[0], b = pts[i], c = pts[i + 1];
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      if (doubleSided) {
        pos.push(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2]);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return putGeo(B, mk, g, 0, 0, 0, null, null, col, 2.0);
  }

  /* Parametric surface fn(u, v) -> [x, y, z] for u, v in [0..1] */
  function gPsurf(B, mk, fn, nu, nv, col, flip, colFn) {
    var pos = [], cols = colFn ? [] : null, idx = [];
    for (var j = 0; j <= nv; j++) {
      var v = j / nv;
      for (var i = 0; i <= nu; i++) {
        var u = i / nu;
        var p = fn(u, v);
        pos.push(p[0], p[1], p[2]);
        if (colFn) {
          var cc = linCol(colFn(u, v, p));
          cols.push(cc.r, cc.g, cc.b);
        }
      }
    }
    for (var jj = 0; jj < nv; jj++) {
      for (var ii = 0; ii < nu; ii++) {
        var a = jj * (nu + 1) + ii, b = a + 1, c = a + (nu + 1), d = c + 1;
        if (flip) idx.push(a, d, b, a, c, d);
        else idx.push(a, b, d, a, d, c);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (cols) g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return putGeo(B, mk, g, 0, 0, 0, null, null, col, 1.8);
  }

  /* Flared hipped roof (Eternian celadon / Marr tile / stone) centered at (cx, yBase, cz) */
  function gHipRoof(B, mk, cx, yBase, cz, w, d, h, col, over, flare) {
    var ov = over == null ? 0.24 : +over;
    var fl = flare == null ? 0.14 : +flare;
    var W = w + ov * 2, D = d + ov * 2;
    var ridgeAlongX = W >= D;
    var ridgeHalf = ridgeAlongX ? Math.max(0.15, (W - D) * 0.46) : Math.max(0.15, (D - W) * 0.46);
    gPsurf(B, mk, function (u, v) {
      var ang = u * TAU;
      var ca = Math.cos(ang), sa = Math.sin(ang);
      var m = Math.max(Math.abs(ca), Math.abs(sa));
      var ex = (ca / m) * W * 0.5, ez = (sa / m) * D * 0.5;
      var rx = ridgeAlongX ? K.clamp(ex, -ridgeHalf, ridgeHalf) : 0;
      var rz = ridgeAlongX ? 0 : K.clamp(ez, -ridgeHalf, ridgeHalf);
      var kFlare = fl * Math.pow(1 - v, 2.4);
      var x = cx + K.lerp(ex * (1 + kFlare), rx, v);
      var z = cz + K.lerp(ez * (1 + kFlare), rz, v);
      var y = yBase + v * h - 0.04 * Math.sin(v * PI);
      return [x, y, z];
    }, 20, 6, col, true);
    /* Underside soffit closer so eaves are watertight from below */
    gBox(B, 'timber', cx, yBase - 0.06, cz, W * (1 + fl * 0.5), 0.07, D * (1 + fl * 0.5), 0x3b2a1e);
  }

  /* Faceted Eternian closed-eye ancestor medallion / keystone boss */
  function gReliefEmblem(B, st, x, yc, z, scale, ry) {
    var s = scale == null ? 0.8 : +scale;
    if (st.ancestorRelief) {
      var rot = [0, ry || 0, 0];
      gCyl(B, 'bronze', x, yc - s * 0.48, z, s * 0.34, s * 0.28, s * 0.96, st.bronze, 6, rot);
      /* Closed-eye brow ridge */
      gBox(B, 'bronze', x, yc + s * 0.06, z, s * 0.54, s * 0.09, s * 0.54, st.gold, rot);
    } else {
      gSph(B, 'bronze', x, yc, z, s * 0.32, st.bronze, [1, 1.15, 0.55], 8);
    }
  }

  function gLantern(B, st, x, yBase, z, poleH) {
    var ph = poleH == null ? 2.4 : +poleH;
    var pm = st.lampPoleMat || 'verdigris';
    var pc = st[pm] || st.verdigris;
    gCyl(B, pm, x, yBase, z, 0.065, 0.08, ph, pc, 6);
    gBox(B, 'glass', x, yBase + ph, z, 0.25, 0.35, 0.25, st.glassLit);
    gCone(B, pm, x, yBase + ph + 0.35, z, 0.21, 0.28, pc, 4);
    B.lights.push([x, yBase + ph + 0.18, z]);
  }

  /* Bake bucket into an indexed THREE.Group (one mesh per material key, me.userData.mk set for core/export!) */
  function bake(B, targetGroup, namePrefix) {
    var mats = ensureMaterials();
    var grp = targetGroup || new THREE.Group();
    var keys = Object.keys(B.byMat).sort();
    for (var ki = 0; ki < keys.length; ki++) {
      var mk = keys[ki];
      var list = B.byMat[mk];
      var totalVerts = 0;
      for (var i = 0; i < list.length; i++) totalVerts += list[i].attributes.position.count;
      if (!totalVerts) continue;
      var P = new Float32Array(totalVerts * 3);
      var N = new Float32Array(totalVerts * 3);
      var U = new Float32Array(totalVerts * 2);
      var C = new Float32Array(totalVerts * 3);
      var I = totalVerts > 65535 ? new Uint32Array(totalVerts) : new Uint16Array(totalVerts);
      var off = 0;
      for (var j = 0; j < list.length; j++) {
        var g = list[j];
        var cnt = g.attributes.position.count;
        P.set(g.attributes.position.array, off * 3);
        N.set(g.attributes.normal.array, off * 3);
        U.set(g.attributes.uv.array, off * 2);
        C.set(g.attributes.color.array, off * 3);
        for (var q = 0; q < cnt; q++) I[off + q] = off + q;
        off += cnt;
        g.dispose();
      }
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(P, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(N, 3));
      merged.setAttribute('uv', new THREE.BufferAttribute(U, 2));
      merged.setAttribute('color', new THREE.BufferAttribute(C, 3));
      merged.setIndex(new THREE.BufferAttribute(I, 1));
      merged.computeBoundingSphere();
      var mesh = new THREE.Mesh(merged, mats[mk]);
      mesh.castShadow = mk !== 'glass';
      mesh.receiveShadow = mk !== 'glass';
      mesh.userData.mk = mk;
      mesh.name = (namePrefix || 'canal') + ':' + mk;
      grp.add(mesh);
    }
    grp.userData.tris = Math.round(B.tris);
    grp.userData.lights = B.lights;
    B.byMat = {};
    B.tris = 0;
    return grp;
  }

  /* ---- 3. Canal Infrastructure Builders (write into any bucket B, or return standalone THREE.Group) ---- */
  function emitQuay(B, st, o) {
    o = o || {};
    var len = o.len == null ? 24.0 : +o.len;
    var depth = o.depth == null ? 3.2 : +o.depth;
    var v = (o.v | 0);
    gBox(B, 'stone', 0, -2.75, 0, len, 4.11, depth - 0.1, st.stoneD);
    gBox(B, 'paving', 0, 1.36, -0.10, len, 0.12, depth - 0.3, st.paving);
    gBox(B, 'stone', 0, 1.34, depth * 0.5 - 0.22, len, 0.16, 0.48, st.stoneH);
    var nFend = Math.max(2, Math.round(len / 4.8));
    for (var fi = 0; fi <= nFend; fi++) {
      var fx = -len * 0.42 + fi * (len * 0.84 / nFend);
      gBox(B, 'timber', fx, -0.85, depth * 0.5 - 0.02, 0.22, 2.15, 0.16, st.timber);
    }
    for (var bx = -len * 0.33; bx <= len * 0.34; bx += len * 0.33) {
      gCyl(B, 'bronze', bx, 1.48, depth * 0.5 - 0.45, 0.12, 0.14, 0.48, st.bronze, 8);
      gSph(B, 'bronze', bx, 1.98, depth * 0.5 - 0.45, 0.15, st.bronze);
    }
    if (v === 1) {
      for (var k = 0; k < 5; k++) {
        gBox(B, 'stone', -4.0 + k * 0.42, 0.18 * k, depth * 0.5 - 0.35, 0.44, 0.22, 0.72, st.stoneH);
      }
      gCyl(B, 'bronze', -4.2, 1.48, depth * 0.5 - 0.75, 0.045, 0.05, 0.85, st.bronze, 6);
      gCyl(B, 'bronze', -2.1, 1.48, depth * 0.5 - 0.75, 0.045, 0.05, 0.85, st.bronze, 6);
      gBeam(B, 'bronze', [-4.2, 2.30, depth * 0.5 - 0.75], [-2.1, 2.30, depth * 0.5 - 0.75], 0.04, st.bronze, 6);
    }
    var pm = st.lampPoleMat || 'verdigris';
    gCyl(B, pm, len * 0.25, 1.48, depth * 0.5 - 0.72, 0.065, 0.08, 3.05, st[pm], 6);
    gBeam(B, pm, [len * 0.25, 4.42, depth * 0.5 - 0.72], [len * 0.25, 4.42, depth * 0.5 - 0.22], 0.045, st[pm], 6);
    gBox(B, 'glass', len * 0.25, 4.02, depth * 0.5 - 0.22, 0.26, 0.36, 0.26, st.glassLit);
    gCone(B, pm, len * 0.25, 4.38, depth * 0.5 - 0.22, 0.22, 0.28, st[pm], 4);
    B.lights.push([len * 0.25, 4.18, depth * 0.5 - 0.22]);
  }

  function emitLockRiser(B, st, o) {
    o = o || {};
    var lanes = o.lanes == null ? 2 : (o.lanes | 0);
    var chW = o.chamberW == null ? 5.6 : +o.chamberW;
    var chL = o.chamberLen == null ? 28.0 : +o.chamberLen;
    var islandW = lanes === 2 ? (o.islandW == null ? 4.0 : +o.islandW) : 0;
    var wallW = 2.40;
    var totalW = lanes === 2 ? (islandW + 2 * chW + 2 * wallW) : (chW + 2 * wallW);
    var copeH = (o.v | 0) === 1 ? 4.68 : 4.78;
    var hL = chL * 0.5;
    var gz = hL - 0.70;

    /* Floor slab */
    gBox(B, 'stone', 0, -2.40, 0, totalW, 0.45, chL, 0x2c3034);

    /* Chamber upstream masonry cills */
    var centers = lanes === 2 ? [-(islandW * 0.5 + chW * 0.5), +(islandW * 0.5 + chW * 0.5)] : [0];
    for (var ci = 0; ci < centers.length; ci++) {
      var cx = centers[ci];
      gBox(B, 'stone', cx, -1.95, hL - 0.85, chW, 3.35, 1.65, st.stoneD);
      gBox(B, 'timber', cx, 1.40, hL - 1.65, chW, 0.22, 0.28, st.timber);
    }

    /* Central island pier for twin flights */
    if (lanes === 2) {
      gBox(B, 'stone', 0, -2.10, 0, islandW, copeH + 1.98, chL - 1.2, st.stoneD);
      gBox(B, 'paving', 0, copeH - 0.12, 0, islandW - 0.12, 0.14, chL - 1.4, st.paving);
      var noses = [-(hL - 0.6), +(hL - 0.6)];
      for (var ni = 0; ni < noses.length; ni++) {
        var nz = noses[ni];
        gCyl(B, 'stone', 0, -2.10, nz, islandW * 0.48, islandW * 0.48, copeH + 2.10, st.stoneH, 8);
        gReliefEmblem(B, st, 0, copeH - 1.55, nz + (nz > 0 ? islandW * 0.48 : -islandW * 0.48), 1.05, nz > 0 ? 0 : PI);
      }
    }

    /* Outer side walls, hollow quoins, capstans & stepped towpath stairs */
    var innerEdge = lanes === 2 ? (islandW * 0.5 + chW) : (chW * 0.5);
    var wallCenter = innerEdge + wallW * 0.5;
    var sides = [-1, 1];
    for (var si = 0; si < 2; si++) {
      var sx = sides[si];
      gBox(B, 'stone', sx * wallCenter, -2.10, 0, wallW, copeH + 1.98, chL, st.stoneD);
      gBox(B, 'stone', sx * (wallCenter - 0.05), copeH - 0.14, 0, wallW + 0.12, 0.16, chL, st.stoneH);
      gBox(B, 'paving', sx * wallCenter, copeH - 0.02, 0, wallW - 0.30, 0.06, chL - 0.4, st.paving);

      var gzs = [-gz, gz];
      for (var gi = 0; gi < 2; gi++) {
        var gzv = gzs[gi];
        gBox(B, 'stone', sx * (innerEdge + 0.05), -1.90, gzv, 0.45, copeH + 1.92, 0.75, st.stoneH);
        var wx = sx * (innerEdge + 0.95);
        gCyl(B, 'bronze', wx, copeH, gzv, 0.22, 0.25, 0.78, st.bronze, 10);
        gRing(B, 'bronze', wx, copeH + 0.80, gzv, 0.40, 0.045, st.bronze);
        if (lanes === 2) {
          gBox(B, 'stone', sx * (islandW * 0.5 - 0.05), -1.90, gzv, 0.45, copeH + 1.92, 0.75, st.stoneH);
          var ix = sx * (islandW * 0.5 - 0.85);
          gCyl(B, 'bronze', ix, copeH, gzv + (gzv < 0 ? 1.1 : -1.1), 0.20, 0.23, 0.74, st.bronze, 10);
          gRing(B, 'bronze', ix, copeH + 0.76, gzv + (gzv < 0 ? 1.1 : -1.1), 0.36, 0.045, st.bronze);
        }
      }
      for (var cz = -5.5; cz <= 5.5; cz += 5.5) {
        var gx = lanes === 2 ? sx * (islandW * 0.5 + 0.02) : sx * (innerEdge - 0.02);
        gBox(B, 'bronze', gx, 0.35, cz, 0.08, 0.95, 1.10, st.bronze);
      }
      for (var stp = 0; stp < 14; stp++) {
        var sz = -(hL - 1.4) + stp * ((chL - 2.8) / 13.0);
        var sy = 1.48 + (copeH - 1.48) * ((stp + 1) / 14.0);
        gBox(B, 'stone', sx * (innerEdge + wallW + 0.45), 0, sz, 0.95, sy, (chL - 2.4) / 13.5, st.stoneH);
      }
      gLantern(B, st, sx * wallCenter, copeH, -(hL - 2.5), 2.95);
      gLantern(B, st, sx * wallCenter, copeH, +(hL - 2.5), 2.95);
    }
  }

  /* Articulated miter-gate leaf: hinged at local (0, y, 0), leaf extends along +x to +leafLen! */
  function emitMiterLeaf(B, st, o) {
    o = o || {};
    var leafLen = o.leafLen == null ? 3.02 : +o.leafLen;
    var fm = st.gateFrameMat || 'bronze';
    var fc = st[fm] || st.bronze;
    /* Heel post at (0, y, 0) & miter post at (+leafLen, y, 0) */
    gCyl(B, fm, 0, -1.80, 0, 0.16, 0.16, 6.55, fc, 10);
    gBox(B, fm, leafLen, -1.80, 0, 0.16, 6.45, 0.24, fc);
    /* Heavy ironwood planking + 5 structural metal/bronze ribs */
    gBox(B, 'timber', leafLen * 0.5, -1.75, 0, leafLen - 0.08, 6.25, 0.18, st.timber);
    for (var ry = -1.40; ry <= 4.35; ry += 1.42) {
      gBox(B, fm, leafLen * 0.5, ry, 0, leafLen - 0.02, 0.16, 0.28, fc);
    }
    /* Diagonal tension braces */
    gBeam(B, fm, [0.12, 4.35, 0.12], [leafLen - 0.10, -1.20, 0.12], 0.075, fc, 6);
    gBeam(B, fm, [0.12, 4.35, -0.12], [leafLen - 0.10, -1.20, -0.12], 0.075, fc, 6);
    /* Submerged sluice paddle + vertical rack stem + handwheel */
    gBox(B, 'iron', leafLen * 0.52, -1.10, 0.14, 0.84, 0.78, 0.08, st.iron);
    gCyl(B, 'iron', leafLen * 0.52, -0.35, 0.16, 0.04, 0.04, 5.45, st.iron, 6);
    gRing(B, 'bronze', leafLen * 0.52, 5.12, 0.16, 0.24, 0.04, st.bronze, 0, PI * 0.5);
    /* Top footwalk + handrail */
    gBox(B, 'timber', leafLen * 0.5, 4.52, 0, leafLen - 0.04, 0.10, 0.56, st.timberL);
    var posts = [0.22, leafLen * 0.5, leafLen - 0.20];
    for (var pi = 0; pi < posts.length; pi++) {
      gCyl(B, fm, posts[pi], 4.62, -0.24, 0.03, 0.03, 0.92, fc, 6);
    }
    gBeam(B, fm, [0.18, 5.52, -0.24], [leafLen - 0.16, 5.52, -0.24], 0.035, fc, 6);
    /* Counterweighted balance beam sweeping over lock wall (-x) */
    gBeam(B, 'timber', [0.20, 4.65, 0], [-2.35, 4.88, 0], 0.16, st.timber, 8);
    gBox(B, 'stone', -2.25, 4.68, 0, 0.46, 0.42, 0.44, st.stoneD);
  }

  function emitBridge(B, st, o) {
    o = o || {};
    var width = o.width == null ? 7.4 : +o.width;
    var span = o.clearSpan == null ? 11.4 : +o.clearSpan;
    var totalLen = o.totalLen == null ? 28.0 : +o.totalLen;
    var crownRise = o.crownRise == null ? 1.50 : +o.crownRise;
    var HW = width * 0.5 - 0.15;
    var hSpan = span * 0.5;
    var hLen = totalLen * 0.5;
    var DZ = [-hLen, -hLen * 0.7, -hSpan, -hSpan * 0.45, 0.0, hSpan * 0.45, hSpan, hLen * 0.7, hLen];
    var dTop = crownRise + 0.37;
    var DY = [0.04, dTop * 0.34, dTop * 0.68, dTop * 0.90, dTop, dTop * 0.90, dTop * 0.68, dTop * 0.34, 0.04];

    function deckTop(z) {
      for (var i = 0; i < DZ.length - 1; i++) {
        if (z <= DZ[i + 1]) {
          var f = (z - DZ[i]) / (DZ[i + 1] - DZ[i]);
          return DY[i] + (DY[i + 1] - DY[i]) * f;
        }
      }
      return 0.04;
    }
    function archY(z) {
      var u = Math.min(1, Math.abs(z) / hSpan);
      return 0.28 + (crownRise - 0.28) * Math.sqrt(Math.max(0, 1 - u * u * 0.92));
    }

    var signs = [-1, 1];
    for (var si = 0; si < 2; si++) {
      var sz = signs[si];
      gBox(B, 'stone', 0, -2.50, sz * (hSpan + 0.75), HW * 2, 3.75, 1.50, st.stoneH);
      var rem = hLen - (hSpan + 1.50);
      for (var r = 0; r < 4; r++) {
        var zc = hSpan + 1.50 + (r + 0.5) * (rem / 4.0);
        var ym = deckTop(sz * zc);
        gBox(B, 'stone', 0, -0.55, sz * zc, HW * 2, ym + 0.52, rem / 4.0 + 0.05, st.stoneD);
      }
    }

    var NA = 16;
    for (var k = 0; k < NA; k++) {
      var z0 = -hSpan + k * (span / NA), z1 = z0 + (span / NA);
      var a0 = archY(z0), a1 = archY(z1), t0 = deckTop(z0), t1 = deckTop(z1);
      gSheet(B, 'stone', [-HW, a0, z0], [HW, a0, z0], [-HW, a1, z1], 0.22, st.stoneH);
      gPoly(B, 'stone', [[HW, a0, z0], [HW, t0, z0], [HW, t1, z1], [HW, a1, z1]], st.stoneD, true);
      gPoly(B, 'stone', [[-HW, a0, z0], [-HW, a1, z1], [-HW, t1, z1], [-HW, t0, z0]], st.stoneD, true);
    }

    for (var j = 0; j < DZ.length - 1; j++) {
      gSheet(B, 'paving', [-HW, DY[j], DZ[j]], [HW, DY[j], DZ[j]], [-HW, DY[j + 1], DZ[j + 1]], 0.22, st.paving);
      if (width >= 6.0) {
        var tracks = [-HW * 0.52, HW * 0.52];
        for (var ti = 0; ti < 2; ti++) {
          var tx = tracks[ti];
          gSheet(B, 'stone', [tx - 0.42, DY[j] + 0.03, DZ[j]], [tx + 0.42, DY[j] + 0.03, DZ[j]], [tx - 0.42, DY[j + 1] + 0.03, DZ[j + 1]], 0.16, st.stoneH);
        }
      }
      for (var pi = 0; pi < 2; pi++) {
        var px = signs[pi];
        gSheet(B, 'stone', [px * (HW - 0.16), DY[j], DZ[j]], [px * (HW - 0.16), DY[j] + 0.92, DZ[j]], [px * (HW - 0.16), DY[j], DZ[j + 1]], 0.26, st.stoneD);
        gBeam(B, 'stone', [px * (HW - 0.16), DY[j] + 0.96, DZ[j]], [px * (HW - 0.16), DY[j + 1] + 0.96, DZ[j + 1]], 0.18, st.stoneH, 6);
        if (width >= 6.0 && Math.abs(DZ[j]) <= hLen * 0.72 && Math.abs(DZ[j + 1]) <= hLen * 0.72) {
          gBeam(B, 'bronze', [px * (HW + 0.20), Math.max(crownRise + 0.12, DY[j] - 0.08), DZ[j]],
            [px * (HW + 0.20), Math.max(crownRise + 0.12, DY[j + 1] - 0.08), DZ[j + 1]], 0.12, st.bronze, 8);
        }
      }
    }

    for (var ksi = 0; ksi < 2; ksi++) {
      var ks = signs[ksi];
      gReliefEmblem(B, st, ks * (HW + 0.18), crownRise + 0.06, 0, 0.76, ks * PI * 0.5);
      var endsZ = [-(hLen - 0.6), +(hLen - 0.6)];
      for (var ezi = 0; ezi < 2; ezi++) {
        var ez = endsZ[ezi];
        gBox(B, 'stone', ks * (HW - 0.16), 0, ez, 0.54, 1.32, 0.54, st.stoneH);
        gLantern(B, st, ks * (HW - 0.16), 1.32, ez, 1.85);
      }
    }
  }

  function emitAqueduct(B, st, o) {
    o = o || {};
    var len = o.len == null ? 48.0 : +o.len;
    var arches = o.arches == null ? 3 : Math.max(1, o.arches | 0);
    var waterW = o.waterW == null ? 8.4 : +o.waterW;
    var hLen = len * 0.5;
    var abutLen = 4.5;
    var spanTotal = len - 2 * abutLen;
    var bay = spanTotal / arches;
    var pierZ = bay - 2.6;
    var hwTrough = waterW * 0.5;

    /* End masonry abutments */
    var abuts = [-(hLen - abutLen * 0.5), +(hLen - abutLen * 0.5)];
    for (var ai = 0; ai < 2; ai++) {
      gBox(B, 'stone', 0, -0.80, abuts[ai], waterW + 5.4, 8.27, abutLen, st.stoneD);
    }

    /* Stream cutwater piers */
    for (var p = 0; p <= arches; p++) {
      var pz = -spanTotal * 0.5 + p * bay;
      gBox(B, 'stone', 0, -0.80, pz, waterW + 4.2, 8.27, 2.60, st.stoneD);
      gCyl(B, 'stone', -(hwTrough + 2.15), -0.80, pz, 1.12, 1.15, 7.40, st.stoneH, 6);
      gCyl(B, 'stone', +(hwTrough + 2.15), -0.80, pz, 1.12, 1.15, 7.40, st.stoneH, 6);
    }

    /* Stone arch barrels & spandrels */
    for (var b = 0; b < arches; b++) {
      var cz = -spanTotal * 0.5 + (b + 0.5) * bay;
      var hArch = pierZ * 0.5;
      var NS = 12;
      for (var k = 0; k < NS; k++) {
        var z0 = cz - hArch + k * (pierZ / NS), z1 = z0 + (pierZ / NS);
        var u0 = Math.min(1, Math.abs(z0 - cz) / hArch), u1 = Math.min(1, Math.abs(z1 - cz) / hArch);
        var y0 = 3.50 + 2.45 * Math.sqrt(Math.max(0, 1 - u0 * u0 * 0.94));
        var y1 = 3.50 + 2.45 * Math.sqrt(Math.max(0, 1 - u1 * u1 * 0.94));
        var spW = hwTrough + 1.9;
        gSheet(B, 'stone', [-spW, y0, z0], [spW, y0, z0], [-spW, y1, z1], 0.28, st.stoneH);
        gPoly(B, 'stone', [[spW, y0, z0], [spW, 7.47, z0], [spW, 7.47, z1], [spW, y1, z1]], st.stoneD, true);
        gPoly(B, 'stone', [[-spW, y0, z0], [-spW, y1, z1], [-spW, 7.47, z1], [-spW, 7.47, z0]], st.stoneD, true);
      }
      gReliefEmblem(B, st, -(hwTrough + 2.12), 6.15, cz, 0.92, -PI * 0.5);
      gReliefEmblem(B, st, +(hwTrough + 2.12), 6.15, cz, 0.92, +PI * 0.5);
    }

    /* Lead-caulked navigable canal trough & cantilevered towpath walkways */
    gBox(B, 'stone', 0, 6.85, 0, waterW + 4.0, 0.62, len, st.stoneD);
    gBox(B, 'lead', 0, 7.45, 0, waterW + 0.05, 0.04, len, st.lead);
    var sides = [-1, 1];
    for (var si = 0; si < 2; si++) {
      var tx = sides[si];
      gBox(B, 'stone', tx * (hwTrough + 0.48), 7.40, 0, 0.96, 3.75, len, st.stoneD);
      gBox(B, 'stone', tx * (hwTrough + 0.48), 11.02, 0, 1.12, 0.15, len, st.stoneH);
      for (var cbz = -(hLen - 2.0); cbz <= (hLen - 2.0); cbz += 4.0) {
        gBeam(B, 'stone', [tx * (hwTrough + 0.85), 9.65, cbz], [tx * (hwTrough + 2.75), 11.00, cbz], 0.22, st.stoneH, 6);
      }
      gBox(B, 'paving', tx * (hwTrough + 1.55), 11.00, 0, 2.65, 0.16, len, st.paving);
      for (var rpz = -(hLen - 1.0); rpz <= (hLen - 1.0); rpz += 4.6) {
        gBox(B, 'stone', tx * (hwTrough + 2.75), 11.15, rpz, 0.26, 1.02, 0.26, st.stoneH);
      }
      gBox(B, 'bronze', tx * (hwTrough + 2.75), 11.55, 0, 0.06, 0.56, len - 0.4, st.bronze);
      gBox(B, 'stone', tx * (hwTrough + 2.75), 12.12, 0, 0.28, 0.10, len - 0.2, st.stoneH);
      for (var li = -1; li <= 1; li++) {
        gLantern(B, st, tx * (hwTrough + 2.75), 12.22, li * (len * 0.36), 2.05);
      }
    }
  }

  function emitWeir(B, st) {
    gBox(B, 'stone', 0, -1.20, 0.8, 45.6, 1.85, 12.2, st.stoneD);
    for (var k = 0; k < 5; k++) {
      gBox(B, 'stone', 0, 0.65 + k * 0.60, -2.6 + k * 0.95, 44.8, 0.64, 5.8 - k * 0.72, k % 2 ? st.stoneD : st.stoneH);
    }
    gBox(B, 'stone', 0, 3.35, -1.4, 44.8, 0.34, 2.2, st.stoneH);
    for (var bx = -19; bx <= 19; bx += 3.8) {
      gBox(B, 'stone', bx, 0.65, 5.2, 1.1, 0.75, 1.1, st.stoneH);
    }
    for (var px = -20; px <= 20; px += 10) {
      gBox(B, 'stone', px, -0.80, -0.6, 1.85, 6.25, 6.4, st.stoneD);
      gCyl(B, 'stone', px, -0.80, -3.8, 0.92, 0.92, 6.25, st.stoneH, 8);
      gLantern(B, st, px, 5.45, -1.8, 1.55);
    }
    gBox(B, 'timber', 0, 5.35, -0.6, 42.4, 0.18, 2.10, st.timberL);
    gBeam(B, 'bronze', [-20.8, 6.28, -1.55], [20.8, 6.28, -1.55], 0.04, st.bronze, 6);
    gBeam(B, 'bronze', [-20.8, 6.28, 0.35], [20.8, 6.28, 0.35], 0.04, st.bronze, 6);
    gBeam(B, 'timber', [6.0, 3.62, -5.8], [22.0, 3.62, -3.2], 0.28, st.timber, 8);
    for (var fx = 8; fx <= 20; fx += 4) {
      gCyl(B, 'bronze', fx, 3.45, -5.8 + (fx - 6) * 0.16, 0.26, 0.26, 0.42, st.bronze, 8);
    }
  }

  function emitSluiceGate(B, st) {
    gBox(B, 'stone', 0, -2.40, 0, 13.8, 0.55, 9.6, st.stoneD);
    for (var i = 0; i < 4; i++) {
      var px = -5.4 + i * 3.6;
      gBox(B, 'stone', px, -1.90, 0, 1.35, 6.55, 8.8, st.stoneD);
      gBox(B, 'stone', px, 4.55, 0, 1.55, 0.22, 9.1, st.stoneH);
    }
    gBox(B, 'stone', 0, 2.35, 0, 12.6, 2.30, 3.2, st.stoneH);
    gBox(B, 'paving', 0, 4.65, 0, 13.4, 0.18, 7.6, st.paving);
    for (var b = 0; b < 3; b++) {
      var gx = -3.6 + b * 3.6;
      gBox(B, 'bronze', gx, -1.65, -0.4, 2.25, 4.10, 0.18, st.bronze);
      gCyl(B, 'iron', gx - 0.65, 2.20, -0.4, 0.045, 0.045, 4.35, st.iron, 6);
      gCyl(B, 'iron', gx + 0.65, 2.20, -0.4, 0.045, 0.045, 4.35, st.iron, 6);
      gBox(B, 'bronze', gx, 4.82, -0.4, 1.65, 0.72, 0.65, st.bronze);
      gRing(B, 'bronze', gx, 5.45, 0.02, 0.36, 0.05, st.bronze);
    }
    var colsX = [-5.6, -1.9, 1.9, 5.6], colsZ = [-3.1, 3.1];
    for (var cx = 0; cx < colsX.length; cx++) {
      for (var cz = 0; cz < colsZ.length; cz++) {
        gBox(B, 'lime', colsX[cx], 4.82, colsZ[cz], 0.52, 2.65, 0.52, st.lime);
      }
    }
    gBox(B, 'lime', 0, 7.35, 0, 12.2, 0.32, 6.8, st.limeShade);
    var rm = st.roofMat || 'celadon';
    gHipRoof(B, rm, 0, 7.62, 0, 12.4, 7.0, 1.85, st[rm] || st.celadon, 0.62, 0.16);
    gReliefEmblem(B, st, 0, 5.65, 3.55, 0.88, 0);
  }

  function emitCrane(B, st) {
    gBox(B, 'stone', 0, 0, 0, 2.8, 0.42, 2.8, st.stoneD);
    gRing(B, 'bronze', 0, 0.44, 0, 1.05, 0.08, st.bronze);
    gCyl(B, 'timber', 0, 0.42, 0, 0.26, 0.30, 6.85, st.timber, 10);
    gBeam(B, 'timber', [-1.15, 0.42, -1.05], [0, 3.85, 0], 0.15, st.timber, 8);
    gBeam(B, 'timber', [1.15, 0.42, -1.05], [0, 3.85, 0], 0.15, st.timber, 8);
    gBeam(B, 'timber', [-1.15, 0.42, 1.05], [0, 3.85, 0], 0.15, st.timber, 8);
    gBeam(B, 'timber', [1.15, 0.42, 1.05], [0, 3.85, 0], 0.15, st.timber, 8);
    gBox(B, 'timber', 0, 1.15, -0.85, 1.75, 1.85, 1.65, st.timberL);
    gRing(B, 'bronze', 0.96, 1.95, -0.65, 0.62, 0.06, st.bronze, 0, PI * 0.5);
    gBeam(B, 'timber', [0, 5.20, 0], [0, 7.95, 3.35], 0.18, st.timber, 8);
    gBeam(B, 'iron', [0, 7.15, -0.25], [0, 7.90, 3.25], 0.04, st.iron, 6);
    gCyl(B, 'iron', 0, 4.10, 3.25, 0.025, 0.025, 3.80, st.iron, 6);
    gCyl(B, 'bronze', 0, 3.95, 3.25, 0.16, 0.16, 0.22, st.bronze, 8);
    gBox(B, 'timber', 0, 3.15, 3.25, 0.85, 0.72, 0.85, st.timberL);
  }

  function makeGroupBuilder(emitFn, defaultName) {
    return function (spec, opt) {
      opt = opt || {};
      var st = getStyle(opt.style || (spec && spec.style) || 'eternian');
      trReseed(opt.seed == null ? 75011 : opt.seed);
      var B = bucket();
      emitFn(B, st, spec || {});
      var grp = bake(B, null, (spec && spec.id) || defaultName);
      if (spec && spec.x != null) {
        grp.position.set(spec.x, spec.y == null ? 0 : spec.y, spec.z);
        grp.rotation.y = spec.ry == null ? (spec.yaw || 0) : spec.ry;
      }
      return grp;
    };
  }

  /* Draws clipped street ways & non-bridge towpaths into a merged THREE.Group, strictly zeroed on all canal troughs! */
  function drawPavedWays(ways, towpath, net, hFn, opt) {
    opt = opt || {};
    var st = getStyle(opt.style || 'eternian');
    var B = bucket();
    for (var i = 0; i < (ways || []).length; i++) {
      var w = ways[i];
      if (!w || !w.pts || w.pts.length < 2) continue;
      var hw = (w.w == null ? (w.width == null ? 6.0 : +w.width) : +w.w) * 0.44;
      for (var k = 0; k + 1 < w.pts.length; k++) {
        var p0 = w.pts[k], p1 = w.pts[k + 1];
        var L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        var steps = Math.max(1, Math.ceil(L / 8.0));
        for (var s = 0; s < steps; s++) {
          var f0 = s / steps, f1 = (s + 1) / steps;
          var ax = K.lerp(p0[0], p1[0], f0), az = K.lerp(p0[1], p1[1], f0);
          var bx = K.lerp(p0[0], p1[0], f1), bz = K.lerp(p0[1], p1[1], f1);
          var mx = 0.5 * (ax + bx), mz = 0.5 * (az + bz);
          /* Triple guard: never emit any street paving quad if start, mid, or end touches any canal trough! */
          if (net && (K.pointInCanalTrough(net, ax, az, hw + 0.6) ||
                      K.pointInCanalTrough(net, bx, bz, hw + 0.6) ||
                      K.pointInCanalTrough(net, mx, mz, hw + 0.6))) {
            continue;
          }
          var dx = bx - ax, dz = bz - az, dl = Math.hypot(dx, dz);
          if (dl < 1e-4) continue;
          var nx = -dz / dl * hw, nz = dx / dl * hw;
          var ya = hFn(ax, az) + 0.045, yb = hFn(bx, bz) + 0.045;
          gSheet(B, 'paving', [ax - nx, ya, az - nz], [ax + nx, ya, az + nz], [bx - nx, yb, bz - nz], 0.07, st.paving);
        }
      }
    }
    if (towpath && towpath.nodes && towpath.edges) {
      var nodes = towpath.nodes, edges = towpath.edges;
      for (var ei = 0; ei < edges.length; ei++) {
        var ed = edges[ei];
        if (ed.kind === 'bridge_deck' || ed.kind === 'bridge_ramp' || ed.kind === 'aqueduct_walk' || ed.kind === 'bridge' || ed.kind === 'aqueduct') continue;
        var na = nodes[ed.a], nb = nodes[ed.b];
        if (!na || !nb) continue;
        var edx = nb.x - na.x, edz = nb.z - na.z, edl = Math.hypot(edx, edz);
        if (edl < 1e-4) continue;
        var thw = (ed.w == null ? 3.2 : +ed.w) * 0.44;
        var enx = -edz / edl * thw, enz = edx / edl * thw;
        gSheet(B, 'paving', [na.x - enx, na.y + 0.035, na.z - enz], [na.x + enx, na.y + 0.035, na.z + enz],
          [nb.x - enx, nb.y + 0.035, nb.z - enz], 0.09, ed.kind === 'lock_ramp' ? st.stoneH : st.paving);
      }
    }
    var grp = bake(B, null, 'transit:ways');
    grp.userData.probeSkip = true;
    return grp;
  }

  K.reseed = trReseed;
  K.rng = trRng;
  K.rr = trRr;
  K.styles = STYLES;
  K.registerStyle = registerStyle;
  K.getStyle = getStyle;
  K.setNightGlow = setNightGlow;
  K.geom = {
    linCol: linCol,
    bucket: bucket,
    box: gBox,
    cyl: gCyl,
    cone: gCone,
    sph: gSph,
    ring: gRing,
    beam: gBeam,
    sheet: gSheet,
    poly: gPoly,
    psurf: gPsurf,
    hipRoof: gHipRoof,
    reliefEmblem: gReliefEmblem,
    lantern: gLantern,
    bake: bake
  };
  K.draw = {
    quay: makeGroupBuilder(emitQuay, 'canal_quay'),
    lockRiser: makeGroupBuilder(emitLockRiser, 'miter_lock'),
    miterLeaf: makeGroupBuilder(emitMiterLeaf, 'miter_leaf'),
    bridge: makeGroupBuilder(emitBridge, 'canal_bridge'),
    aqueduct: makeGroupBuilder(emitAqueduct, 'canal_aqueduct'),
    weir: makeGroupBuilder(emitWeir, 'intake_weir'),
    sluiceGate: makeGroupBuilder(emitSluiceGate, 'sluice_gate'),
    crane: makeGroupBuilder(emitCrane, 'cargo_crane'),
    pavedWays: drawPavedWays
  };
})(KCANAL);
