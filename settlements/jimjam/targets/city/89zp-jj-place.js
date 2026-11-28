// ================================================================= JIMJAM — Multi-Kit Placement, KCONS, Water, KWALK, Flora & Liturgical Light
// [draw] Isolates JJ.place & JJFURN.place from VERN KXF/_XFSTACK, locks JJ_SOLSTICE to -34.34 deg S, registers KTAGS,
// builds KCONS + KCITY.constructMesh scaffolds, places all 11 zones' JJ + Dilihan (dil_*) + Iziz Vernacular (vern_*)
// structures + vessels + 7-gate walls + Great Pilgrim's Market stalls + citizens, draws core/water (+429.78 m Great
// Trough Lake, Four-Day Lotus Tank, Thirteen Tar-Sea Pool & Monsoon Canal), wires KWALK, bakes biomes/nwlowlands flora,
// and drives three-regime liturgical lighting (Day, Whorl-Olive Oil Night, and Double-Dark Fire-Out Vigil).
const JJ_PLACE = (function () {
  /* 1. Isolate JJ.place & JJFURN.place from 69c-vern-helpers.js KXF/_XFSTACK and strip PointLights on city scale */
  function wrapIsolated(obj, method) {
    if (!obj || typeof obj[method] !== 'function') return;
    const orig = obj[method];
    obj[method] = function (sc, key, x, z, ry, opts) {
      const savedKxf = KXF;
      const savedStack = typeof _XFSTACK !== 'undefined' ? _XFSTACK.slice() : null;
      KXF = null;
      if (typeof _XFSTACK !== 'undefined') _XFSTACK.length = 0;
      let grp = null;
      try {
        grp = orig.call(this, sc, key, x, z, ry, opts);
      } finally {
        KXF = savedKxf;
        if (savedStack && typeof _XFSTACK !== 'undefined') {
          _XFSTACK.length = 0;
          for (let i = 0; i < savedStack.length; i++) _XFSTACK.push(savedStack[i]);
        }
      }
      if (grp && grp.children) {
        for (let ci = grp.children.length - 1; ci >= 0; ci--) {
          if (grp.children[ci] && grp.children[ci].isLight) {
            grp.remove(grp.children[ci]);
          }
        }
      }
      return grp;
    };
  }
  wrapIsolated(typeof JJ !== 'undefined' ? JJ : null, 'place');
  wrapIsolated(typeof JJFURN !== 'undefined' ? JJFURN : null, 'place');

  const t0 = performance.now();
  const L = JJ_LAYOUT.plan;

  /* 2. Lock 74-jj-sacred.js JJ_SOLSTICE to Jimjam's exact -34.34 deg S ephemeris before jj_temple_sun builds */
  if (typeof JJ_SOLSTICE !== 'undefined' && L.solstice && L.solstice.ephemeris) {
    const ep = L.solstice.ephemeris;
    JJ_SOLSTICE.day = ep.day;
    JJ_SOLSTICE.targetAltDeg = ep.targetAltDeg;
    JJ_SOLSTICE.hour = ep.hour;
    JJ_SOLSTICE.azimuthDeg = ep.azimuthDeg;
    JJ_SOLSTICE.altitudeDeg = ep.altitudeDeg;
    JJ_SOLSTICE.ry = L.solstice.ry;
  }

  /* 3. Register every building, vessel, wall, market stall & citizen in core/tags BEFORE drawing */
  const T = (typeof KTAGS !== 'undefined' && KTAGS.page) ? KTAGS.page : KTAGS.create({ build: 'jimjam' });
  T.build = 'jimjam';
  KTAGS.page = T;
  const tagCount = JJ_RULES.registerTags(L, T);

  const placed = [];
  const missing = [];
  const constructBuilt = [];
  const occSpace = KSPACE.create({ cell: 32 });
  const plinthBrick = vC(0x8e3328);
  const plinthMarble = vC(0xebe3d5);

  function minCornerGround(x, z, w, d, ry) {
    const hw = w * 0.48;
    const hd = d * 0.48;
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    let lo = JJ_GROUND.h(x, z);
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]];
    for (let i = 0; i < pts.length; i++) {
      const gy = JJ_GROUND.h(x + pts[i][0] * c + pts[i][1] * s, z - pts[i][0] * s + pts[i][1] * c);
      if (gy < lo) lo = gy;
    }
    return lo;
  }

  function addSlopePlinth(r) {
    if (r.cls !== 'building' || r.key === 'jj_barge_quay' || r.key === 'jj_wall_watergate' ||
        r.key === 'jj_dock_crane' || r.key === 'jj_fish_quay' || r.key === 'jj_boatyard' || r.key === 'jj_clay_pit') {
      return;
    }
    const isWall = r.key.indexOf('_wall_') >= 0;
    const lo = minCornerGround(r.x, r.z, r.w, r.d, r.ry);
    const bot = Math.min(lo - 1.1, r.y - 0.95);
    const top = isWall ? (r.y + 0.08) : (r.y - 0.14);
    const h = top - bot;
    if (h <= 0.05) return;
    const q = r.ry ? qEuler(0, r.ry, 0) : null;
    const baseCol = (!isWall && (r.zone === 'zone1.sun' || r.landmark)) ? plinthMarble : plinthBrick;
    const sx = isWall ? r.w * 1.01 : r.w * 0.96;
    const sz = isWall ? Math.min(r.d * 0.92, 5.2) : r.d * 0.96;
    kput('vStone', [r.x, bot + h * 0.5, r.z], q, [sx, h, sz], baseCol);
  }

  /* 4. Flatten helper for VERN / dil_* expansion lots under KCONS.site + KCITY.constructMesh */
  function jjDenorm(a) {
    if (!a.normalized) return 1;
    const r = a.array;
    if (r instanceof Uint8Array || r instanceof Uint8ClampedArray) return 1 / 255;
    if (r instanceof Uint16Array) return 1 / 65535;
    if (r instanceof Int8Array) return 1 / 127;
    if (r instanceof Int16Array) return 1 / 32767;
    return 1;
  }

  function jjFlattenGroup(G) {
    G.updateMatrixWorld(true);
    const groups = {};
    const IM = new THREE.Matrix4();
    const IC = new THREE.Color();
    G.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const mats = Array.isArray(o.material) ? null : o.material;
      if (!mats) return;
      const g = o.geometry;
      const attrSig = Object.keys(g.attributes).filter(function (n) { return n !== 'color'; }).sort().join(',');
      const sig = mats.uuid + '|' + attrSig;
      const list = groups[sig] || (groups[sig] = { mat: mats, parts: [] });
      if (o.isInstancedMesh) {
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, IM);
          let ic = null;
          if (o.instanceColor) {
            o.getColorAt(i, IC);
            ic = [IC.r, IC.g, IC.b];
          }
          const e = IM.elements;
          const ws = mats.userData && mats.userData.uvK
            ? [Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])]
            : null;
          list.parts.push({ g: g, m: new THREE.Matrix4().multiplyMatrices(o.matrixWorld, IM), ic: ic, ws: ws });
        }
      } else {
        list.parts.push({
          g: g,
          m: o.matrixWorld.clone(),
          ic: null,
          ws: mats.userData && mats.userData.uvK ? 1 / mats.userData.uvK : null
        });
      }
    });

    const out = [];
    for (const s in groups) {
      const Q = groups[s];
      const g0 = Q.parts[0].g;
      const names = Object.keys(g0.attributes).filter(function (n) { return n !== 'color'; }).concat(['color']);
      let total = 0;
      let itotal = 0;
      Q.parts.forEach(function (p) {
        total += p.g.attributes.position.count;
        itotal += p.g.index ? p.g.index.count : p.g.attributes.position.count;
      });
      const itemSz = function (nm) { return nm === 'color' ? 3 : g0.attributes[nm].itemSize; };
      const A = {};
      names.forEach(function (nm) { A[nm] = new Float32Array(total * itemSz(nm)); });
      const I = total > 65535 ? new Uint32Array(itotal) : new Uint16Array(itotal);
      let vo = 0;
      let io = 0;
      const v3 = new THREE.Vector3();
      const nm3 = new THREE.Matrix3();

      Q.parts.forEach(function (p) {
        const g = p.g;
        const cnt = g.attributes.position.count;
        const ic = p.ic || [1, 1, 1];
        nm3.getNormalMatrix(p.m);
        names.forEach(function (nm) {
          const src = g.attributes[nm];
          const dst = A[nm];
          if (nm === 'color') {
            const csc = src ? jjDenorm(src) : 1;
            const csz = src ? src.itemSize : 0;
            for (let ci = 0; ci < cnt; ci++) {
              for (let cc = 0; cc < 3; cc++) {
                dst[(vo + ci) * 3 + cc] = (src ? src.array[ci * csz + cc] * csc : 1) * ic[cc];
              }
            }
            return;
          }
          if (!src) return;
          const sz = src.itemSize;
          const sc = jjDenorm(src);
          for (let i = 0; i < cnt; i++) {
            if (nm === 'position') {
              v3.fromBufferAttribute(src, i).applyMatrix4(p.m);
              dst[(vo + i) * 3] = v3.x;
              dst[(vo + i) * 3 + 1] = v3.y;
              dst[(vo + i) * 3 + 2] = v3.z;
            } else if (nm === 'normal') {
              v3.fromBufferAttribute(src, i).applyMatrix3(nm3).normalize();
              dst[(vo + i) * 3] = v3.x;
              dst[(vo + i) * 3 + 1] = v3.y;
              dst[(vo + i) * 3 + 2] = v3.z;
            } else if (nm === 'uv' && p.ws != null) {
              let su = 1;
              let sv = 1;
              const N0 = g.attributes.normal;
              if (typeof p.ws === 'number') {
                su = p.ws;
                sv = p.ws;
              } else if (N0) {
                const ax = Math.abs(N0.getX(i));
                const ay = Math.abs(N0.getY(i));
                if (ay > 0.5) { su = p.ws[0]; sv = p.ws[2]; }
                else if (ax > 0.5) { su = p.ws[2]; sv = p.ws[1]; }
                else { su = p.ws[0]; sv = p.ws[1]; }
              }
              dst[(vo + i) * sz] = src.array[i * sz] * sc * su;
              dst[(vo + i) * sz + 1] = src.array[i * sz + 1] * sc * sv;
            } else {
              for (let c = 0; c < sz; c++) dst[(vo + i) * sz + c] = src.array[i * sz + c] * sc;
            }
          }
        });
        if (g.index) {
          for (let k = 0; k < g.index.count; k++) I[io + k] = g.index.array[k] + vo;
          io += g.index.count;
        } else {
          for (let k2 = 0; k2 < cnt; k2++) I[io + k2] = vo + k2;
          io += cnt;
        }
        vo += cnt;
      });

      const geo = new THREE.BufferGeometry();
      names.forEach(function (nm) { geo.setAttribute(nm, new THREE.BufferAttribute(A[nm], itemSz(nm))); });
      geo.setIndex(new THREE.BufferAttribute(I, 1));
      geo.computeBoundingSphere();
      const matClone = Q.mat.clone();
      if (Q.mat.onBeforeCompile) matClone.onBeforeCompile = Q.mat.onBeforeCompile;
      if (Q.mat.customProgramCacheKey) matClone.customProgramCacheKey = Q.mat.customProgramCacheKey;
      matClone.vertexColors = true;
      matClone.needsUpdate = true;
      out.push({ geo: geo, mat: matClone, tris: itotal / 3 });
    }
    return out;
  }

  /* Fast home-cell coplanar-face resolver (zero Set memory) */
  function jjCityZFixPass(dry) {
    const PUSH = 0.012;
    const EPS = 0.004;
    const CELL = 3.0;
    const all = [];
    for (let oi = 0; oi < KIT.order.length; oi++) {
      const name = KIT.order[oi];
      const def = KIT.defs[name];
      const it = KIT.items[name];
      if (!it || !it.length || !def || !def.geo) continue;
      const g = def.geo;
      let kind = null;
      if (g.type === 'BoxGeometry') kind = 'box';
      else if (g.type === 'CylinderGeometry' && g.parameters && Math.abs(g.parameters.radiusTop - g.parameters.radiusBottom) < 1e-6) kind = 'cyl';
      if (!kind) continue;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox;
      const lcx = (bb.min.x + bb.max.x) * 0.5, lcy = (bb.min.y + bb.max.y) * 0.5, lcz = (bb.min.z + bb.max.z) * 0.5;
      const lhx = (bb.max.x - bb.min.x) * 0.5, lhy = (bb.max.y - bb.min.y) * 0.5, lhz = (bb.max.z - bb.min.z) * 0.5;
      const lh = [lhx, lhy, lhz];
      for (let ii = 0; ii < it.length; ii++) {
        const o = it[ii];
        const q = o.q;
        let yaw = 0;
        if (q) {
          if (Math.abs(q.x) > 1e-4 || Math.abs(q.z) > 1e-4) continue;
          yaw = 2 * Math.atan2(q.y, q.w);
        }
        const s = typeof o.s === 'number' ? [o.s, o.s, o.s] : o.s;
        if (s[0] <= 0 || s[1] <= 0 || s[2] <= 0) continue;
        const c = Math.cos(yaw), sn = Math.sin(yaw);
        const ox = lcx * s[0], oz = lcz * s[2];
        let hx = lhx * s[0], hy = lhy * s[1], hz = lhz * s[2];
        if (kind === 'cyl') { const cr = Math.max(hx, hz); hx = cr; hz = cr; }
        const cx = o.p[0] + ox * c + oz * sn;
        const cy = o.p[1] + lcy * s[1];
        const cz = o.p[2] - ox * sn + oz * c;
        const r = Math.hypot(hx, hz);
        all.push({
          o: o, kind: kind, yaw: yaw, c: c, s: sn,
          cx: cx, cy: cy, cz: cz, hx: hx, hy: hy, hz: hz, r: r, lh: lh,
          i0: Math.floor((cx - r) / CELL), i1: Math.floor((cx + r) / CELL),
          j0: Math.floor((cz - r) / CELL), j1: Math.floor((cz + r) / CELL)
        });
      }
    }
    const grid = new Map();
    for (let n = 0; n < all.length; n++) {
      const e = all[n];
      for (let ci = e.i0; ci <= e.i1; ci++) {
        for (let cj = e.j0; cj <= e.j1; cj++) {
          const gk = ci * 100003 + cj;
          let bkt = grid.get(gk);
          if (!bkt) { bkt = { ci: ci, cj: cj, list: [] }; grid.set(gk, bkt); }
          bkt.list.push(n);
        }
      }
    }
    function footOverlap(A, B) {
      const dx = B.cx - A.cx, dz = B.cz - A.cz;
      if (dx * dx + dz * dz > (A.r + B.r) * (A.r + B.r)) return false;
      if (A.kind === 'cyl' && B.kind === 'cyl') return Math.hypot(dx, dz) < A.hx + B.hx - 0.01;
      const axes = [[A.c, -A.s], [A.s, A.c], [B.c, -B.s], [B.s, B.c]];
      for (let ai = 0; ai < 4; ai++) {
        const ax0 = axes[ai][0], ax1 = axes[ai][1];
        const pa = Math.abs(A.hx * (A.c * ax0 - A.s * ax1)) + Math.abs(A.hz * (A.s * ax0 + A.c * ax1));
        const pb = Math.abs(B.hx * (B.c * ax0 - B.s * ax1)) + Math.abs(B.hz * (B.s * ax0 + B.c * ax1));
        if (Math.abs(dx * ax0 + dz * ax1) > pa + pb - 0.01) return false;
      }
      return true;
    }
    function pushFace(E, axis, sg, dist) {
      const o = E.o;
      if (typeof o.s === 'number') o.s = [o.s, o.s, o.s];
      else o.s = o.s.slice();
      o.s[axis] += dist / (2 * E.lh[axis]);
      const h = dist * 0.5 * sg;
      if (axis === 1) {
        o.p = [o.p[0], o.p[1] + h, o.p[2]];
        E.cy += h; E.hy += dist * 0.5;
      } else {
        const d0 = axis === 0 ? E.c : E.s;
        const d1 = axis === 0 ? -E.s : E.c;
        o.p = [o.p[0] + d0 * h, o.p[1], o.p[2] + d1 * h];
        E.cx += d0 * h; E.cz += d1 * h;
        if (axis === 0) E.hx += dist * 0.5; else E.hz += dist * 0.5;
      }
    }
    const face = new Map();
    const adj = new Map();
    let conf = 0;
    function node(n, axis, sg, area) {
      const k = n * 6 + axis * 2 + (sg > 0 ? 0 : 1);
      if (!face.has(k)) face.set(k, { n: n, axis: axis, sg: sg, area: area });
      return k;
    }
    function link(k1, k2) {
      conf++;
      let s1 = adj.get(k1); if (!s1) { s1 = []; adj.set(k1, s1); }
      if (s1.indexOf(k2) < 0) s1.push(k2);
      let s2 = adj.get(k2); if (!s2) { s2 = []; adj.set(k2, s2); }
      if (s2.indexOf(k1) < 0) s2.push(k1);
    }
    for (const bkt of grid.values()) {
      const ci = bkt.ci, cj = bkt.cj, L2 = bkt.list;
      for (let u = 0; u < L2.length; u++) {
        const idxA = L2[u];
        const A = all[idxA];
        for (let v = u + 1; v < L2.length; v++) {
          const idxB = L2[v];
          const B = all[idxB];
          const hi = A.i0 > B.i0 ? A.i0 : B.i0;
          if (hi !== ci) continue;
          const hj = A.j0 > B.j0 ? A.j0 : B.j0;
          if (hj !== cj) continue;
          for (let si = 0; si < 2; si++) {
            const sg = si === 0 ? 1 : -1;
            if (Math.abs((A.cy + sg * A.hy) - (B.cy + sg * B.hy)) < EPS && footOverlap(A, B)) {
              link(node(idxA, 1, sg, A.hx * A.hz), node(idxB, 1, sg, B.hx * B.hz));
            }
          }
          if (A.kind !== 'box' || B.kind !== 'box') continue;
          const dy = ((A.yaw - B.yaw) % (Math.PI * 0.5) + Math.PI * 0.5) % (Math.PI * 0.5);
          if (Math.min(dy, Math.PI * 0.5 - dy) > 0.01) continue;
          if (Math.min(A.cy + A.hy, B.cy + B.hy) - Math.max(A.cy - A.hy, B.cy - B.hy) < 0.01) continue;
          const Aa = [[A.c, -A.s], [A.s, A.c]], Ba = [[B.c, -B.s], [B.s, B.c]], Ah = [A.hx, A.hz];
          for (let k = 0; k < 2; k++) {
            const N = Aa[k], T2 = Aa[1 - k];
            const Bhn = Math.abs(B.hx * (Ba[0][0] * N[0] + Ba[0][1] * N[1])) + Math.abs(B.hz * (Ba[1][0] * N[0] + Ba[1][1] * N[1]));
            const Bht = Math.abs(B.hx * (Ba[0][0] * T2[0] + Ba[0][1] * T2[1])) + Math.abs(B.hz * (Ba[1][0] * T2[0] + Ba[1][1] * T2[1]));
            const dn = (B.cx - A.cx) * N[0] + (B.cz - A.cz) * N[1];
            const dt = (B.cx - A.cx) * T2[0] + (B.cz - A.cz) * T2[1];
            if (Math.abs(dt) > Ah[1 - k] + Bht - 0.01) continue;
            for (let si2 = 0; si2 < 2; si2++) {
              const sg2 = si2 === 0 ? 1 : -1;
              if (Math.abs((dn + sg2 * Bhn) - sg2 * Ah[k]) < EPS) {
                const bk = Math.abs(Ba[0][0] * N[0] + Ba[0][1] * N[1]) > 0.7 ? 0 : 1;
                const bsg = Math.sign(Ba[bk][0] * N[0] + Ba[bk][1] * N[1]) * sg2;
                link(node(idxA, k === 0 ? 0 : 2, sg2, Ah[1 - k] * A.hy), node(idxB, bk === 0 ? 0 : 2, bsg, Bht * B.hy));
              }
            }
          }
        }
      }
    }
    if (dry) return conf;
    const level = new Map();
    const order = Array.from(adj.keys()).sort(function (a, b) { return face.get(b).area - face.get(a).area || a - b; });
    for (let oi2 = 0; oi2 < order.length; oi2++) {
      const fk = order[oi2];
      const nbs = adj.get(fk);
      let lv = 0;
      while (true) {
        let taken = false;
        for (let ni = 0; ni < nbs.length; ni++) {
          if (level.get(nbs[ni]) === lv) { taken = true; break; }
        }
        if (!taken) break;
        lv++;
      }
      level.set(fk, lv);
      if (lv > 0) {
        const f = face.get(fk);
        pushFace(all[f.n], f.axis, f.sg, lv * PUSH);
      }
    }
    return conf;
  }
  function jjCityZFix() {
    for (let p = 0; p < 2; p++) {
      if (!jjCityZFixPass(false)) break;
    }
  }

  const consProtoCache = {};
  function getConstructParts(key, v) {
    const cid = key + '#' + (v | 0);
    if (consProtoCache[cid]) return consProtoCache[cid];
    if (typeof VERN === 'undefined' || !VERN.defs[key]) return null;
    const r0 = REG.length;
    const d0 = (typeof KDOOR !== 'undefined' && KDOOR.list) ? KDOOR.list.length : 0;
    KIT.order.forEach(function (n) { KIT.items[n].length = 0; });

    const protoG = new THREE.Group();
    withFlatGround(function () {
      VERN.place(protoG, key, 0, 0, 0, { y: 0, v: v | 0, scale: 1, lit: false });
    });
    jjCityZFix();
    kbake(protoG);
    const parts = jjFlattenGroup(protoG);

    KIT.order.forEach(function (n) { KIT.items[n].length = 0; });
    KIT.meshes = {};
    KIT_BAKED = false;
    window._instances = 0;
    REG.length = r0;
    if (typeof KDOOR !== 'undefined' && KDOOR.list && KDOOR.list.length > d0) {
      const dropSet = new Set(KDOOR.list.slice(d0));
      if (typeof KDOOR.prune === 'function') KDOOR.prune(function (D) { return dropSet.has(D); });
      else KDOOR.list.length = d0;
    }
    consProtoCache[cid] = parts;
    return parts;
  }

  function placeConstructRecord(r) {
    const v = r.v == null ? 0 : r.v;
    const parts = getConstructParts(r.key, v);
    if (!parts || !parts.length || typeof KCONS === 'undefined' || typeof KCITY.constructMesh !== 'function') {
      return false;
    }
    occSpace.insert(r, r.x, r.z, Math.hypot(r.w, r.d) * 0.55);
    addSlopePlinth(r);

    const wrap = new THREE.Group();
    wrap.name = 'jj-construct-' + r.id;
    wrap.position.set(r.x, r.y, r.z);
    wrap.rotation.y = r.ry;

    const cm = KCITY.constructMesh(parts);
    cm.set(r.construct.progress);
    wrap.add(cm.group);

    const site = KCONS.site({
      w: r.w,
      d: r.d,
      h: r.h,
      bill: r.construct.bill
    });
    site.set(r.construct.progress);
    wrap.add(site.group);
    scene.add(wrap);

    REG.push({
      name: 'Scaffolded Expansion Lot (' + r.key + ', ' + Math.round(r.construct.progress * 100) + '%)',
      key: r.key,
      cls: 'building',
      x: r.x,
      y: r.y,
      z: r.z,
      r: Math.max(r.w, r.d) * 0.52,
      h: Math.max(3.5, r.h * r.construct.progress + 1.5),
      tags: { culture: r.culture, type: r.types, wealth: r.wealth || 'middle', job: 'masonry', lit: false }
    });
    placed.push(r.id);
    constructBuilt.push({ id: r.id, key: r.key, progress: r.construct.progress, tris: cm.tris });
    return true;
  }

  /* Build the 8 KCONS + KCITY.constructMesh expansion lots FIRST while KIT.items are empty */
  for (let i = 0; i < L.structures.length; i++) {
    const r = L.structures[i];
    if (r.construct) {
      if (!placeConstructRecord(r)) r._fallbackNormal = true;
    }
  }

  /* 5. Place all JJ, Dilihan (dil_*) & Iziz Vernacular (vern_*) structures, lake barges & circuit walls */
  function placeRecord(r) {
    if (r.construct && !r._fallbackNormal) return;
    const v = r.v == null ? (KRAND.hash(745546, r.id) % 3) : r.v;
    const wTier = r.wealth === 'poor' ? 0 : r.wealth === 'rich' ? 2 : r.wealth === null ? 3 : 1;
    const opts = {
      id: r.id,
      y: r.y,
      v: v,
      w: wTier,
      scale: r.scale == null ? 1 : r.scale,
      lit: !!r.lit
    };

    occSpace.insert(r, r.x, r.z, Math.hypot(r.w, r.d) * 0.55);
    addSlopePlinth(r);

    let G = null;
    TSTAT.cur = r.key + '/' + r.id;
    if (typeof JJ !== 'undefined' && JJ.defs[r.key]) {
      G = withFlatGround(function () {
        return JJ.place(scene, r.key, r.x, r.z, r.ry, opts);
      });
    } else if (typeof VERN !== 'undefined' && VERN.defs[r.key]) {
      G = withFlatGround(function () {
        return VERN.place(scene, r.key, r.x, r.z, r.ry, opts);
      });
    } else {
      missing.push(r.id + ':' + r.key);
      return;
    }

    if (G) placed.push(r.id);
    else missing.push(r.id + ':' + r.key);
  }

  for (let i = 0; i < L.structures.length; i++) placeRecord(L.structures[i]);
  for (let wi = 0; wi < L.walls.length; wi++) placeRecord(L.walls[wi]);

  /* 6. Place Veil +-50 deg Sightline Pylons & Great Pilgrim's Market Stalls + KFURN Trade Goods */
  JJ_CITYGLUE.placeVeilPylons(scene);
  for (let mi = 0; mi < L.marketStalls.length; mi++) {
    const ms = L.marketStalls[mi];
    if (typeof JJFURN !== 'undefined') {
      JJFURN.place(scene, 'jj_furn_market_stall', ms.x, ms.z, ms.ry, { y: ms.y, lit: false });
      if (mi % 4 === 0) {
        JJFURN.place(scene, 'jj_furn_brazier', ms.x + 2.8, ms.z, 0, { y: ms.y, lit: true });
      }
    }
    JJ_CITYGLUE.furn.placeWorld(
      ['generic_crate', 'generic_storage_jar', 'generic_basket', 'generic_sack'],
      ms.x + 1.4, ms.y, ms.z + 0.6, ms.ry, ms.id, 0.65
    );
  }

  /* 7. Place Instanced Multi-Stream Citizens, Scholars, Yeti Envoys & Pack Beasts (figB/figH) */
  const citPalette = {
    jimjam:    [0xa8322a, 0xd9a33a, 0x3aa6a0, 0xe8d7b1, 0x7e2220],
    eternian:  [0x234c6e, 0xd8e2ea, 0x8c2d38, 0xc8a64b],
    hykkousoi: [0x267c85, 0xede6d6, 0xd49b38, 0x2f5f78],
    order:     [0x1b4f9c, 0xdce4f2, 0x2c3856],
    khaayken:  [0xebe6dc, 0x7a624a, 0x566472, 0xc8b89e],
    yonni:     [0x7c2d58, 0xd6a648, 0x366b68],
    ria:       [0x6e2a36, 0xc89e48, 0x4a3e58],
    iziz:      [0xe07a2a, 0xe8d9b8, 0x3b4a8a, 0xc9442a]
  };
  for (let ci = 0; ci < L.citizens.length; ci++) {
    const ct = L.citizens[ci];
    const pal = citPalette[ct.culture] || citPalette.jimjam;
    const robeHex = pal[KRAND.hash(745546, ct.id, 3) % pal.length];
    const skinHex = ct.culture === 'khaayken' ? 0xd8d2c8 : ((ci % 3 === 0) ? 0xa67452 : (ci % 3 === 1) ? 0xb98a64 : 0x8e5f40);
    const scaleY = ct.culture === 'khaayken' ? [1.22, 1.28, 1.22] : 1;
    kput('figB', [ct.x, ct.y, ct.z], qEuler(0, ct.ry, 0), scaleY, vC(robeHex));
    kput('figH', [ct.x, ct.y + (ct.culture === 'khaayken' ? 0.36 : 0), ct.z], null, scaleY, vC(skinHex));
  }

  /* Pack yaks/mules at White-Pass Compound (340, -1332), Cut-Gate Caravanserai (136, 1045) & Bustling Lotus Harbour Quays */
  const packSpots = [
    [326, -1330, 0.2, 0x4e3e32], [335, -1328, 0.1, 0x5c4a3c], [345, -1329, -0.15, 0x4e3e32],
    [135, 1038, 1.5, 0x6c4f38], [137, 1045, 1.6, 0x5e432e], [134, 1052, 1.4, 0x6c4f38],
    [-802, -1656, 0.1, 0x5c4a3c], [-748, -1658, -0.2, 0x6c4f38], [-658, -1656, 0.15, 0x4e3e32],
    [-572, -1656, -0.1, 0x5e432e], [-528, -1658, 0.25, 0x6c4f38], [-882, -1648, 0.05, 0x4e3e32]
  ];
  for (let pi = 0; pi < packSpots.length; pi++) {
    const ps = packSpots[pi];
    const py = JJ_GROUND.h(ps[0], ps[1]);
    const pq = qEuler(0, ps[2], 0);
    kput('vWood', [ps[0], py + 0.96, ps[1]], pq, [0.64, 0.60, 1.54], vC(ps[3]));
    kput('vSack', [ps[0] - 0.38, py + 1.22, ps[1]], pq, [0.34, 0.38, 0.50], vC(0xd8ccb4));
    kput('vSack', [ps[0] + 0.38, py + 1.22, ps[1]], pq, [0.34, 0.38, 0.50], vC(0xc4b08c));
  }

  /* Quayside Cargo Stacks (Vellai-kal white alabaster blocks, Palewharf crates, Serai salt sacks) & Izani Occupation Relics (P2) */
  const cargoClusters = [
    [-818, -1658], [-768, -1658], [-724, -1658], [-648, -1658], [-582, -1658], [-540, -1658], [-906, -1716], [-906, -1764]
  ];
  for (let cci = 0; cci < cargoClusters.length; cci++) {
    const ccx = cargoClusters[cci][0], ccz = cargoClusters[cci][1];
    const ccy = JJ_GROUND.h(ccx, ccz);
    kput('vStone', [ccx - 1.6, ccy + 0.55, ccz], null, [1.8, 1.1, 1.3], plinthMarble);
    kput('vStone', [ccx - 1.5, ccy + 1.45, ccz + 0.1], qEuler(0, 0.12, 0), [1.4, 0.72, 1.1], plinthMarble);
    kput('vWood',  [ccx + 1.2, ccy + 0.52, ccz - 0.4], qEuler(0, -0.18, 0), [1.3, 1.04, 1.2], vC(0x7c5c3e));
    kput('vSack',  [ccx + 2.5, ccy + 0.38, ccz + 0.5], null, [0.95, 0.76, 0.82], vC(0xdccfb4));
    JJ_CITYGLUE.furn.placeWorld(
      ['generic_crate', 'generic_storage_jar', 'generic_sack'],
      ccx + 0.4, ccy, ccz + 1.4, cci * 0.7, 'harb.cargo.' + cci, 0.85
    );
  }

  /* Battered Old Izani Legionary Castra Foundation under South Crest Citadel (1140, 860) + Cut-Road Imperial Milestones */
  const izaniOrange = vC(0xd6742c);
  const izaniAshlar = vC(0x9a8e7e);
  kput('vStone', [1140, 49.8 - 2.4, 860], null, [112.0, 3.6, 108.0], izaniAshlar);
  kput('vStone', [1140, 49.8 - 0.55, 860], null, [109.0, 0.75, 105.0], izaniOrange);
  for (let msi = 0; msi < 5; msi++) {
    const msz = 1025 + msi * 135;
    const msx = 69.5;
    const msy = JJ_GROUND.h(msx, msz);
    /* Weathered tilted Izani orange-ashlar league stone paired with upright whitewashed Jamtokku almanac stela */
    kput('vStone', [msx, msy + 0.85, msz], qEuler(0.09, 0.2, -0.07), [0.68, 1.75, 0.68], izaniOrange);
    kput('vStone', [msx + 2.2, msy + 1.05, msz + 0.6], null, [0.56, 2.15, 0.36], plinthMarble);
  }

  /* 7a. Furnish the 6 Formal Curbed Urban Parks & Royal/Temple Gardens with Fountains, Reflecting Pools, Benches & Lamps */
  if (typeof JJFURN !== 'undefined' && L.parks) {
    for (let pki = 0; pki < L.parks.length; pki++) {
      const pk = L.parks[pki];
      const cx = (pk.x0 + pk.x1) * 0.5;
      const cz = (pk.z0 + pk.z1) * 0.5;
      const cy = JJ_GROUND.h(cx, cz);
      JJFURN.place(scene, 'jj_furn_fountain', cx, cz, 0, { y: cy, lit: false });
      JJFURN.place(scene, 'jj_furn_bench', cx - 5.2, cz, Math.PI * 0.5,  { y: JJ_GROUND.h(cx - 5.2, cz), lit: false });
      JJFURN.place(scene, 'jj_furn_bench', cx + 5.2, cz, -Math.PI * 0.5, { y: JJ_GROUND.h(cx + 5.2, cz), lit: false });
      JJFURN.place(scene, 'jj_furn_bench', cx, cz - 5.2, 0,              { y: JJ_GROUND.h(cx, cz - 5.2), lit: false });
      JJFURN.place(scene, 'jj_furn_bench', cx, cz + 5.2, Math.PI,        { y: JJ_GROUND.h(cx, cz + 5.2), lit: false });
      const lampOff = [[-5.8, -5.8], [5.8, -5.8], [-5.8, 5.8], [5.8, 5.8]];
      for (let li = 0; li < lampOff.length; li++) {
        const lx = cx + lampOff[li][0], lz = cz + lampOff[li][1];
        JJFURN.place(scene, 'jj_furn_oil_lamp', lx, lz, 0, { y: JJ_GROUND.h(lx, lz), lit: false });
      }
      if (pk.style === 'charbagh') {
        JJFURN.place(scene, 'jj_furn_pool', cx - 38, cz, 0, { y: JJ_GROUND.h(cx - 38, cz), lit: false });
        JJFURN.place(scene, 'jj_furn_pool', cx + 38, cz, 0, { y: JJ_GROUND.h(cx + 38, cz), lit: false });
        JJFURN.place(scene, 'jj_furn_statue', cx, cz - 38, 0, { y: JJ_GROUND.h(cx, cz - 38), lit: false });
        JJFURN.place(scene, 'jj_furn_statue', cx, cz + 38, Math.PI, { y: JJ_GROUND.h(cx, cz + 38), lit: false });
      }
    }
  }

  TSTAT.cur = null;
  jjCityZFix();
  JJ_CITYGLUE.furn.flush(scene);

  /* 7b. Build Real 3D PBR Paved Streets, Marble Curbstones, Stone Lotus Harbour Seawall/Apron & Civic Plazas */
  const pavedSummary = (function buildPavedStreetsAndPlazas() {
    function makePaveMat(srcMat, fallbackHex, rough, offsetFactor) {
      let m;
      if (srcMat && srcMat.clone) {
        m = srcMat.clone();
        if (srcMat.onBeforeCompile) m.onBeforeCompile = srcMat.onBeforeCompile;
        if (srcMat.customProgramCacheKey) m.customProgramCacheKey = srcMat.customProgramCacheKey;
      } else {
        m = new THREE.MeshStandardMaterial({ color: fallbackHex, roughness: rough });
      }
      m.polygonOffset = true;
      m.polygonOffsetFactor = offsetFactor;
      m.polygonOffsetUnits = offsetFactor;
      m.roughness = rough;
      m.needsUpdate = true;
      return m;
    }

    const matAvePave    = makePaveMat(typeof JMAT !== 'undefined' ? JMAT.bandBrick   : null, 0xb8583c, 0.84, -3);
    const matStreetPave = makePaveMat(typeof JMAT !== 'undefined' ? JMAT.brickYellow : null, 0xc89a52, 0.87, -2);
    const matHwyPave    = makePaveMat(typeof JMAT !== 'undefined' ? (JMAT.concrete || JMAT.brickDark) : null, 0x8f8374, 0.90, -2);
    const matCurbMarble = makePaveMat(typeof JMAT !== 'undefined' ? JMAT.marble      : null, 0xebe4d8, 0.72, -4);
    const matCurbBrick  = makePaveMat(typeof JMAT !== 'undefined' ? JMAT.brickDeep   : null, 0x7a2a22, 0.86, -3);

    function surfY(x, z) {
      const gh = JJ_GROUND.h(x, z);
      const dh = (typeof JJ_STAGE !== 'undefined' && JJ_STAGE.drawnH) ? JJ_STAGE.drawnH(x, z) : gh;
      return Math.max(gh, dh);
    }

    function makeBufBuilder() {
      return { pos: [], nrm: [], uv: [], idx: [] };
    }

    function pushQuad(B, p0, p1, p2, p3, u0, v0, u1, v1) {
      const base = B.pos.length / 3;
      B.pos.push(
        p0[0], p0[1], p0[2],
        p1[0], p1[1], p1[2],
        p2[0], p2[1], p2[2],
        p3[0], p3[1], p3[2]
      );
      const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2];
      const bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
      let nx = ay * bz - az * by;
      let ny = az * bx - ax * bz;
      let nz = ax * by - ay * bx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
      nx /= nl; ny /= nl; nz /= nl;
      for (let k = 0; k < 4; k++) B.nrm.push(nx, ny, nz);
      B.uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
      B.idx.push(base, base + 3, base + 2, base, base + 2, base + 1);
    }

    function addCrownRibbon(B, curbB, pts, width, crownLift, edgeLift, curbW, curbLift) {
      if (!pts || pts.length < 2) return;
      const hw = width * 0.5;
      let distAcc = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const ax = pts[i][0], az = pts[i][1];
        const bx = pts[i + 1][0], bz = pts[i + 1][1];
        const segLen = Math.hypot(bx - ax, bz - az);
        if (segLen < 0.5) continue;
        const ux = (bx - ax) / segLen, uz = (bz - az) / segLen;
        const rx = -uz, rz = ux;
        const steps = Math.max(1, Math.ceil(segLen / 7.0));
        const ds = segLen / steps;
        for (let s = 0; s < steps; s++) {
          const t0 = s * ds, t1 = (s + 1) * ds;
          const x0 = ax + ux * t0, z0 = az + uz * t0;
          const x1 = ax + ux * t1, z1 = az + uz * t1;
          /* Skip sub-segments crossing open lake or the Monsoon Feeder Canal (canal crossings get arched masonry bridges!) */
          const xm = (x0 + x1) * 0.5, zm = (z0 + z1) * 0.5;
          if (JJ_GROUND.h(xm, zm) < JJ_GROUND.lakeY + 0.35 || JJ_GROUND.canal.dist(xm, zm) < 6.8) { distAcc += ds; continue; }

          const yL0 = surfY(x0 - rx * hw, z0 - rz * hw) + edgeLift;
          const yC0 = Math.max(surfY(x0, z0) + crownLift, (yL0 + surfY(x0 + rx * hw, z0 + rz * hw) + edgeLift) * 0.5 + 0.04);
          const yR0 = surfY(x0 + rx * hw, z0 + rz * hw) + edgeLift;

          const yL1 = surfY(x1 - rx * hw, z1 - rz * hw) + edgeLift;
          const yC1 = Math.max(surfY(x1, z1) + crownLift, (yL1 + surfY(x1 + rx * hw, z1 + rz * hw) + edgeLift) * 0.5 + 0.04);
          const yR1 = surfY(x1 + rx * hw, z1 + rz * hw) + edgeLift;

          const v0 = distAcc, v1 = distAcc + ds;
          pushQuad(B,
            [x0 - rx * hw, yL0, z0 - rz * hw],
            [x0,           yC0, z0          ],
            [x1,           yC1, z1          ],
            [x1 - rx * hw, yL1, z1 - rz * hw],
            -hw, v0, 0, v1
          );
          pushQuad(B,
            [x0,           yC0, z0          ],
            [x0 + rx * hw, yR0, z0 + rz * hw],
            [x1 + rx * hw, yR1, z1 + rz * hw],
            [x1,           yC1, z1          ],
            0, v0, hw, v1
          );

          if (curbB && curbW > 0) {
            const cw = hw + curbW;
            const ycL0 = yL0 + curbLift, ycL1 = yL1 + curbLift;
            const ycR0 = yR0 + curbLift, ycR1 = yR1 + curbLift;
            pushQuad(curbB,
              [x0 - rx * cw, ycL0, z0 - rz * cw],
              [x0 - rx * hw, ycL0, z0 - rz * hw],
              [x1 - rx * hw, ycL1, z1 - rz * hw],
              [x1 - rx * cw, ycL1, z1 - rz * cw],
              0, v0, curbW, v1
            );
            pushQuad(curbB,
              [x0 + rx * hw, ycR0, z0 + rz * hw],
              [x0 + rx * cw, ycR0, z0 + rz * cw],
              [x1 + rx * cw, ycR1, z1 + rz * cw],
              [x1 + rx * hw, ycR1, z1 + rz * hw],
              0, v0, curbW, v1
            );
          }
          distAcc += ds;
        }
      }
    }

    function addPavedGridPatch(B, x0, z0, x1, z1, cellM, lift) {
      const nx = Math.max(1, Math.ceil((x1 - x0) / cellM));
      const nz = Math.max(1, Math.ceil((z1 - z0) / cellM));
      const dx = (x1 - x0) / nx, dz = (z1 - z0) / nz;
      for (let j = 0; j < nz; j++) {
        const za = z0 + j * dz, zb = za + dz;
        for (let i = 0; i < nx; i++) {
          const xa = x0 + i * dx, xb = xa + dx;
          const xm = (xa + xb) * 0.5, zm = (za + zb) * 0.5;
          if (JJ_GROUND.canal.dist(xm, zm) < 8.0) continue;
          pushQuad(B,
            [xa, surfY(xa, za) + lift, za],
            [xb, surfY(xb, za) + lift, za],
            [xb, surfY(xb, zb) + lift, zb],
            [xa, surfY(xa, zb) + lift, zb],
            xa, za, xb, zb
          );
        }
      }
    }

    const aveB = makeBufBuilder();
    const stB  = makeBufBuilder();
    const hwyB = makeBufBuilder();
    const mCurbB = makeBufBuilder();
    const bCurbB = makeBufBuilder();

    const allWays = L.ways || [];
    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      const ww = w.w == null ? 8.0 : w.w;
      if (w.cls === 'avenue') {
        addCrownRibbon(aveB, mCurbB, w.pts, ww, 0.13, 0.06, 0.72, 0.09);
      } else if (w.cls === 'highway' || w.cls === 'lane') {
        addCrownRibbon(hwyB, null, w.pts, ww, 0.10, 0.04, 0, 0);
      } else {
        addCrownRibbon(stB, bCurbB, w.pts, ww, 0.10, 0.04, 0.42, 0.06);
      }
    }

    /* Paved Monumental Plazas, Forecourts & Curbed Park Cross-Walks:
       1. Lotus Harbour Stone Quayside Esplanade (-938..-617 & -603..-478, -1668..-1588 — split cleanly round x=-610 Canal!)
       2. Solar Acropolis Central Flagstone Court (-865..-615, -238..68)
       3. White-Pass Trans-Rim Compound Forecourt (292..388, -1425..-1325)
       4. Former Izani Enclave Praetorium Forecourt (802..918, 682..798)
       5. Great Pilgrim's Market Central Flagstone Chowk (-235..-85, 1012..1108)
       6. Axial Banded-Brick Garden Paths + Marble Perimeter Curbs around all 6 Urban Parks & Gardens! */
    addPavedGridPatch(stB,  -938, -1668, -617, -1588, 8.5, 0.09);
    addPavedGridPatch(stB,  -603, -1668, -478, -1588, 8.5, 0.09);
    addPavedGridPatch(aveB, -865, -238,  -615,  68,   12.0, 0.08);
    addPavedGridPatch(stB,   292, -1425,  388, -1325, 10.0, 0.08);
    addPavedGridPatch(stB,   802,  682,   918,  798,  10.0, 0.08);
    addPavedGridPatch(aveB, -235,  1012, -85,   1108, 10.0, 0.08);

    function addParkBorderSpan(ax, az, bx, bz) {
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 1.5) return;
      const steps = Math.max(1, Math.ceil(len / 14.0));
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps, t1 = (s + 1) / steps;
        const x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0;
        const x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
        const xm = (x0 + x1) * 0.5, zm = (z0 + z1) * 0.5;
        const sl = Math.hypot(x1 - x0, z1 - z0);
        const ry = Math.atan2(x1 - x0, z1 - z0);
        const ym = surfY(xm, zm);
        const q = qEuler(0, ry, 0);
        kput('vStone', [xm, ym + 0.16, zm], q, [0.58, 0.36, sl + 0.12], plinthBrick);
        kput('vStone', [xm, ym + 0.39, zm], q, [0.70, 0.14, sl + 0.16], plinthMarble);
      }
    }

    const parkList = L.parks || [];
    for (let pki = 0; pki < parkList.length; pki++) {
      const pk = parkList[pki];
      const cx = (pk.x0 + pk.x1) * 0.5, cz = (pk.z0 + pk.z1) * 0.5;
      addCrownRibbon(aveB, mCurbB, [[pk.x0 + 0.8, cz], [pk.x1 - 0.8, cz]], 4.4, 0.09, 0.05, 0.42, 0.06);
      addCrownRibbon(aveB, mCurbB, [[cx, pk.z0 + 0.8], [cx, pk.z1 - 0.8]], 4.4, 0.09, 0.05, 0.42, 0.06);
      addPavedGridPatch(aveB, cx - 6.8, cz - 6.8, cx + 6.8, cz + 6.8, 6.8, 0.09);
      /* Low brick-and-marble perimeter garden curb broken cleanly by 5.6 m axial entry gates */
      addParkBorderSpan(pk.x0, pk.z0, cx - 2.8, pk.z0);
      addParkBorderSpan(cx + 2.8, pk.z0, pk.x1, pk.z0);
      addParkBorderSpan(pk.x0, pk.z1, cx - 2.8, pk.z1);
      addParkBorderSpan(cx + 2.8, pk.z1, pk.x1, pk.z1);
      addParkBorderSpan(pk.x0, pk.z0, pk.x0, cz - 2.8);
      addParkBorderSpan(pk.x0, cz + 2.8, pk.x0, pk.z1);
      addParkBorderSpan(pk.x1, pk.z0, pk.x1, cz - 2.8);
      addParkBorderSpan(pk.x1, cz + 2.8, pk.x1, pk.z1);
    }

    /* Masonry Lotus Harbour Seawall & Marble Coping along z = -1670.5:
       Split cleanly around BOTH the Stepped Ferry Ghat (x = -718..-696) AND the Canal Outfall Mouth (x = -616.5..-603.5)! */
    const quayDeckY = JJ_GROUND.lakeY + 2.15;
    const seawallSpans = [[-942, -718], [-696, -616.5], [-603.5, -476]];
    for (let si = 0; si < seawallSpans.length; si++) {
      const sx0 = seawallSpans[si][0], sx1 = seawallSpans[si][1];
      const swW = sx1 - sx0, swCx = (sx0 + sx1) * 0.5;
      kput('vStone', [swCx, quayDeckY - 2.1, -1670.5], null, [swW, 4.4, 3.2], plinthBrick);
      kput('vStone', [swCx, quayDeckY + 0.18, -1670.5], null, [swW + 0.4, 0.36, 3.6], plinthMarble);
      for (let bx = sx0 + 8; bx <= sx1 - 8; bx += 20) {
        kput('vIron', [bx, quayDeckY + 0.62, -1671.4], null, [0.42, 0.65, 0.42], vC(0x2c2a28));
      }
    }

    /* Stepped Red-Brick & Marble Lotus Ferry Ghat (x = -718..-696, z = -1669..-1681) descending directly into +429.78 m water! */
    const ghatW = 22.0, ghatCx = -707.0;
    for (let gs = 0; gs < 9; gs++) {
      const stepY = quayDeckY - gs * 0.30;
      const stepZ = -1669.2 - gs * 1.25;
      kput('vStone', [ghatCx, stepY - 0.45, stepZ], null, [ghatW, 0.90, 1.32], plinthBrick);
      kput('vStone', [ghatCx, stepY + 0.04, stepZ - 0.45], null, [ghatW + 0.1, 0.10, 0.42], plinthMarble);
    }
    for (const gSide of [-1, 1]) {
      const gxP = ghatCx + gSide * (ghatW * 0.5 + 0.65);
      kput('vStone', [gxP, quayDeckY - 0.8, -1675.0], null, [1.3, 3.4, 12.5], plinthBrick);
      kput('vStone', [gxP, quayDeckY + 0.98, -1675.0], null, [1.5, 0.22, 12.8], plinthMarble);
      kput('vStone', [gxP, quayDeckY + 1.55, -1680.6], null, [1.1, 0.95, 1.1], plinthMarble);
    }

    /* West & East Curved Banded-Brick Breakwater Moles Enclosing the 25t Barge Basin (PLAN.md Zone 3 / P2) */
    function addBreakwaterMole(pts, moleW, seaSideSign) {
      for (let i = 0; i + 1 < pts.length; i++) {
        const ax = pts[i][0], az = pts[i][1];
        const bx = pts[i + 1][0], bz = pts[i + 1][1];
        const len = Math.hypot(bx - ax, bz - az);
        const ux = (bx - ax) / len, uz = (bz - az) / len;
        const rx = -uz, rz = ux;
        const ry = Math.atan2(ux, uz);
        const q = qEuler(0, ry, 0);
        const steps = Math.max(1, Math.ceil(len / 18.0));
        for (let s = 0; s < steps; s++) {
          const t0 = s / steps, t1 = (s + 1) / steps;
          const xm = ax + (bx - ax) * ((t0 + t1) * 0.5);
          const zm = az + (bz - az) * ((t0 + t1) * 0.5);
          const sl = len / steps + 0.6;
          /* Sub-surface basalt/brick rubble core + marble-coped mole deck + outer wave-wall parapet */
          kput('vStone', [xm, JJ_GROUND.lakeY - 0.9, zm], q, [moleW + 2.4, 6.2, sl], plinthBrick);
          kput('vStone', [xm, quayDeckY + 0.14, zm], q, [moleW, 0.38, sl], plinthMarble);
          const px = xm + rx * seaSideSign * (moleW * 0.5 - 0.65);
          const pz = zm + rz * seaSideSign * (moleW * 0.5 - 0.65);
          kput('vStone', [px, quayDeckY + 0.95, pz], q, [1.25, 1.35, sl], plinthBrick);
          kput('vStone', [px, quayDeckY + 1.68, pz], q, [1.45, 0.18, sl], plinthMarble);
          const bxM = xm - rx * seaSideSign * (moleW * 0.5 - 0.8);
          const bzM = zm - rz * seaSideSign * (moleW * 0.5 - 0.8);
          kput('vIron', [bxM, quayDeckY + 0.58, bzM], null, [0.40, 0.62, 0.40], vC(0x2c2a28));
        }
      }
    }
    addBreakwaterMole([[-936, -1670], [-924, -1768], [-846, -1824]], 11.5, 1);
    addBreakwaterMole([[-482, -1670], [-492, -1778]], 10.5, -1);

    /* Dressed Red-Brick & Marble-Coped Harbour Canal Embankment Walls along x = -616.2 & x = -603.8
       (split around z = -1585..-1575 where jj_wall_watergate's cutwater piers stand!) */
    const canalBankSpans = [[-1671.5, -1586.5], [-1573.5, -1512.0]];
    for (let csi = 0; csi < canalBankSpans.length; csi++) {
      const za = canalBankSpans[csi][0], zb = canalBankSpans[csi][1];
      const steps = Math.max(1, Math.ceil((zb - za) / 14.0));
      for (let s = 0; s < steps; s++) {
        const z0 = za + (zb - za) * (s / steps);
        const z1 = za + (zb - za) * ((s + 1) / steps);
        const zm = (z0 + z1) * 0.5, sl = (z1 - z0) + 0.25;
        for (const side of [-1, 1]) {
          const bx = -610.0 + side * 6.2;
          const topY = Math.max(quayDeckY + 0.18, JJ_GROUND.shapedNoCanal(bx, zm) + 0.15);
          const hWall = topY - (JJ_GROUND.lakeY - 2.4);
          kput('vStone', [bx, JJ_GROUND.lakeY - 2.4 + hWall * 0.5, zm], null, [1.35, hWall, sl], plinthBrick);
          kput('vStone', [bx, topY + 0.12, zm], null, [1.62, 0.24, sl + 0.08], plinthMarble);
        }
      }
    }

    /* Real Cambered Brick-and-Marble Canal Bridges Spanning Major Avenue & Quayside Crossings (Water Flows Freely Underneath!) */
    function addCanalBridge(cx, cz, spanDirRy, deckW) {
      const q = qEuler(0, spanDirRy, 0);
      const c = Math.cos(spanDirRy), s = Math.sin(spanDirRy);
      const bankA = JJ_GROUND.shapedNoCanal(cx - c * 9.5, cz + s * 9.5);
      const bankB = JJ_GROUND.shapedNoCanal(cx + c * 9.5, cz - s * 9.5);
      const wtrY = JJ_GROUND.canal.surfaceY(cx, cz);
      const deckY = Math.max((bankA + bankB) * 0.5 + 0.85, wtrY + 2.15);
      /* Twin bank abutments leaving 9.2 m clear water channel in the middle */
      for (const endS of [-1, 1]) {
        const ax = cx + c * endS * 6.4, az = cz - s * endS * 6.4;
        const abH = deckY - (wtrY - 2.0);
        kput('vStone', [ax, wtrY - 2.0 + abH * 0.5, az], q, [3.4, abH, deckW + 0.8], plinthBrick);
        /* Approach ramps tying bridge deck smoothly down to bank street grade */
        const rx = cx + c * endS * 10.2, rz = cz - s * endS * 10.2;
        const rPitch = endS * 0.14;
        const rq = qEuler(0, spanDirRy, rPitch);
        kput('vStone', [rx, deckY - 0.48, rz], rq, [5.4, 0.42, deckW], plinthBrick);
        kput('vStone', [rx, deckY - 0.22, rz], rq, [5.4, 0.12, deckW + 0.2], plinthMarble);
      }
      /* Vaulted central span (elevated +1.9 m clear over the water!) + marble arch fascia & side parapets */
      kput('vStone', [cx, deckY - 0.22, cz], q, [10.4, 0.44, deckW], plinthBrick);
      kput('vStone', [cx, deckY + 0.05, cz], q, [10.6, 0.14, deckW + 0.3], plinthMarble);
      for (const pSide of [-1, 1]) {
        const px = cx + s * pSide * (deckW * 0.5 - 0.32);
        const pz = cz + c * pSide * (deckW * 0.5 - 0.32);
        kput('vStone', [px, deckY + 0.52, pz], q, [15.6, 0.82, 0.55], plinthBrick);
        kput('vStone', [px, deckY + 0.98, pz], q, [15.8, 0.16, 0.72], plinthMarble);
      }
    }
    /* Quayside Seawall Outfall Sluice Bridge, Harbour Customs Bridge, Promenade Bridge & Intramural Avenue Bridges */
    addCanalBridge(-610.0, -1664.5, 0,            11.0);
    addCanalBridge(-610.0, -1604.0, 0,            10.5);
    addCanalBridge(-610.0, -1546.0, 0,            11.5);
    addCanalBridge(-105.0, -1145.0, 0.62,         10.0);
    addCanalBridge(835.0,  -372.0,  0.58,         10.0);
    addCanalBridge(1062.0, -52.0,   0.58,         11.0);

    /* Stepped Brick & Marble Rims Around All 3 Intramural Kulam & Tar-Sea Mirror Basins (PLAN.md P3) */
    const darkClinker = vC(0x2a2220);
    const kBasins = JJ_GROUND.kulamBasins || [];
    for (let kbi = 0; kbi < kBasins.length; kbi++) {
      const kb = kBasins[kbi];
      const rimCol = kb.dark ? darkClinker : plinthBrick;
      for (let st = 0; st < 4; st++) {
        const inset = st * 0.85;
        const sy = kb.rimY - st * 0.34;
        const bw = kb.w - inset * 2, bd = kb.d - inset * 2;
        kput('vStone', [kb.x, sy, kb.z - bd * 0.5], null, [bw + 1.2, 0.38, 1.1], rimCol);
        kput('vStone', [kb.x, sy, kb.z + bd * 0.5], null, [bw + 1.2, 0.38, 1.1], rimCol);
        kput('vStone', [kb.x - bw * 0.5, sy, kb.z], null, [1.1, 0.38, bd + 1.2], rimCol);
        kput('vStone', [kb.x + bw * 0.5, sy, kb.z], null, [1.1, 0.38, bd + 1.2], rimCol);
      }
      kput('vStone', [kb.x, kb.rimY + 0.24, kb.z - kb.d * 0.5 - 0.3], null, [kb.w + 1.8, 0.16, 1.3], plinthMarble);
      kput('vStone', [kb.x, kb.rimY + 0.24, kb.z + kb.d * 0.5 + 0.3], null, [kb.w + 1.8, 0.16, 1.3], plinthMarble);
      kput('vStone', [kb.x - kb.w * 0.5 - 0.3, kb.rimY + 0.24, kb.z], null, [1.3, 0.16, kb.d + 1.8], plinthMarble);
      kput('vStone', [kb.x + kb.w * 0.5 + 0.3, kb.rimY + 0.24, kb.z], null, [1.3, 0.16, kb.d + 1.8], plinthMarble);
    }

    function emitPaveMesh(B, mat, name) {
      if (!B.idx.length) return 0;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(B.nrm, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
      geo.setIndex(B.idx);
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = name;
      mesh.userData.probeSkip = true;
      mesh.userData.lodSkip = true;
      scene.add(mesh);
      return B.idx.length / 3;
    }

    const tris =
      emitPaveMesh(aveB,   matAvePave,    'jj-paved-avenues') +
      emitPaveMesh(stB,    matStreetPave, 'jj-paved-streets') +
      emitPaveMesh(hwyB,   matHwyPave,    'jj-paved-highways') +
      emitPaveMesh(mCurbB, matCurbMarble, 'jj-curbs-marble') +
      emitPaveMesh(bCurbB, matCurbBrick,  'jj-curbs-brick');
    return { tris: tris, ways: allWays.length };
  })();

  /* Shard any KIT item list exceeding 180k instances before kbake so no InstancedMesh ever nears the 250k cap */
  if (typeof KIT !== 'undefined' && KIT.order && KIT.items && KIT.defs) {
    const SHARD_CAP = 180000;
    const origOrder = KIT.order.slice();
    for (let oi = 0; oi < origOrder.length; oi++) {
      const nm = origOrder[oi];
      const arr = KIT.items[nm];
      if (arr && arr.length > SHARD_CAP) {
        const def = KIT.defs[nm];
        const nShards = Math.ceil(arr.length / SHARD_CAP);
        for (let sk = 1; sk < nShards; sk++) {
          const snm = nm + '__s' + sk;
          kdef(snm, def.geo, def.mat);
          KIT.items[snm] = arr.slice(sk * SHARD_CAP, (sk + 1) * SHARD_CAP);
        }
        arr.length = SHARD_CAP;
      }
    }
  }
  kbake(scene);

  /* 8. Draw core/water: +429.78 m Great Trough Lake & Lotus Harbour Cove, Four-Day & Thirteen Pools, Monsoon Canal */
  const waterDrawn = { lake: null, canal: null, still: [] };
  if (typeof WATER !== 'undefined') {
    const lakeS = WATER.still({
      name: 'Great Trough Lake (+429.78 m ASL, lbl=77) & Lotus Harbour Cove',
      level: JJ_GROUND.lakeY,
      poly: [
        [-15100, -15100],
        [15100, -15100],
        [15100, -1620],
        [-15100, -1620]
      ]
    });
    waterDrawn.lake = WATER.drawStill(lakeS, {
      THREE: THREE,
      scene: scene,
      color: 0x215c70,
      roughness: 0.08,
      metalness: 0.16,
      envMapIntensity: 0.64
    });

    const cPts = JJ_GROUND.canal.pts.map(function (p) {
      return [p[0], p[1], Math.max(JJ_GROUND.lakeY + 0.04, JJ_GROUND.canal.surfaceY(p[0], p[1]))];
    });
    const canalS = WATER.flow({
      name: 'Eastern Monsoon Feeder Canal',
      pts: cPts,
      densify: 16,
      width: 7.6,
      speed: 1.25
    });
    waterDrawn.canal = WATER.drawFlow(canalS, {
      THREE: THREE,
      scene: scene,
      color: 0x2b6e7c,
      shallow: 0x5ca4ac,
      deep: 0x1c4c58,
      roughness: 0.11,
      metalness: 0.12,
      envMapIntensity: 0.56,
      depthBias: 2,
      step: 6,
      across: 6,
      margin: 1.2
    });

    /* Four-Day Outer Lotus Tank Rim Water Sheet (around (680, -560)) + 3 Stepped Intramural Kulam & Tar-Sea Basins (P3) */
    const fdS = WATER.still({
      name: 'Four-Day Humoral Lotus Tank',
      level: -4.2 + 0.82,
      poly: [[648, -592], [712, -592], [712, -528], [648, -528]]
    });
    waterDrawn.still.push(WATER.drawStill(fdS, {
      THREE: THREE,
      scene: scene,
      color: 0x266c78,
      roughness: 0.06,
      metalness: 0.14,
      envMapIntensity: 0.56
    }));

    const kBasinsW = JJ_GROUND.kulamBasins || [];
    for (let kwi = 0; kwi < kBasinsW.length; kwi++) {
      const kb = kBasinsW[kwi];
      const hw = kb.w * 0.5 - 0.6, hd = kb.d * 0.5 - 0.6;
      const ks = WATER.still({
        name: kb.name,
        level: kb.waterY,
        poly: [[kb.x - hw, kb.z - hd], [kb.x + hw, kb.z - hd], [kb.x + hw, kb.z + hd], [kb.x - hw, kb.z + hd]]
      });
      waterDrawn.still.push(WATER.drawStill(ks, {
        THREE: THREE,
        scene: scene,
        color: kb.dark ? 0x13202a : 0x266c78,
        roughness: kb.dark ? 0.04 : 0.06,
        metalness: kb.dark ? 0.22 : 0.14,
        envMapIntensity: kb.dark ? 0.68 : 0.56
      }));
    }
  }

  /* 9. Wire KWALK Navigation Strips & Civic Plazas */
  if (typeof KWALK !== 'undefined') {
    const allWays = L.ways || [];
    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      const pts = w.pts || [];
      const ww = w.w == null ? 6.5 : w.w;
      for (let pi = 0; pi + 1 < pts.length; pi++) {
        const a = pts[pi], b = pts[pi + 1];
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
        KWALK.strip({
          a: [a[0], a[1], JJ_GROUND.h(a[0], a[1])],
          b: [b[0], b[1], JJ_GROUND.h(b[0], b[1])],
          w: ww,
          name: w.id || 'jimjam-avenue',
          tag: 'road'
        });
      }
    }
    KWALK.floor({ rect: [-890, -605, -245, 65], y: 27.85, name: 'Solar Acropolis Esplanade', tag: 'plaza' });
    KWALK.floor({ rect: [-90, 50, -85, 85], y: 14.32, name: 'Great Sunray Plaza Deck', tag: 'plaza' });
    KWALK.floor({ rect: [-310, 20, 995, 1130], y: 40.25, name: 'Great Pilgrims Market Fairground', tag: 'plaza' });
  }

  /* 10. Curated, Zero-Clipping Biome Foliage (biomes/nwlowlands NWLOW.make/grow + park/rural floor):
         - Inside the city, trees & garden beds exist ONLY in the 6 curbed Urban Parks & Gardens (L.parks)
           and along designated wide 18-21 m Ceremonial Boulevards (w.treeAve === true) & the Monsoon Canal.
         - Every tree tests exact 2D OBB distance (>= crownR * 1.18 + 2.2 m) against every building, landmark & wall,
           and builds at full 3D geometry (lv = 2/1, zero low-poly egg-blobs!). */
  let floraSummary = null;
  if (typeof JJ_FLORA_BUNDLE !== 'undefined' && JJ_FLORA_BUNDLE.BIO && JJ_FLORA_BUNDLE.NWLOW) {
    const BIO_I = JJ_FLORA_BUNDLE.BIO;
    const NWLOW_I = JJ_FLORA_BUNDLE.NWLOW;
    const SP = NWLOW_I.SPECIES;
    const spIndexByKey = {};
    for (let si = 0; si < SP.length; si++) spIndexByKey[SP[si].key] = si;

    function ptSegDist2D(px, pz, ax, az, bx, bz) {
      const vx = bx - ax, vz = bz - az;
      const l2 = vx * vx + vz * vz;
      let t = l2 > 1e-6 ? ((px - ax) * vx + (pz - az) * vz) / l2 : 0;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      return Math.hypot(px - (ax + vx * t), pz - (az + vz * t));
    }

    function distToOBB(px, pz, rec) {
      const c = Math.cos(rec.ry || 0), s = Math.sin(rec.ry || 0);
      const dx = px - rec.x, dz = pz - rec.z;
      const lx = Math.abs(dx * c - dz * s) - rec.w * 0.5;
      const lz = Math.abs(dx * s + dz * c) - rec.d * 0.5;
      const ox = lx > 0 ? lx : 0;
      const oz = lz > 0 ? lz : 0;
      if (ox > 0 || oz > 0) return Math.hypot(ox, oz);
      return Math.max(lx, lz);
    }

    const nearHits = [];
    function minStructClearance(x, z, searchR) {
      occSpace.query(x, z, searchR, nearHits);
      let minD = 1e9;
      for (let i = 0; i < nearHits.length; i++) {
        const d = distToOBB(x, z, nearHits[i]);
        if (d < minD) minD = d;
      }
      for (let mi = 0; mi < L.marketStalls.length; mi++) {
        const ms = L.marketStalls[mi];
        const dm = Math.hypot(x - ms.x, z - ms.z) - 2.8;
        if (dm < minD) minD = dm;
      }
      return minD;
    }

    const obsList = [];
    for (let i = 0; i < L.structures.length; i++) {
      const r = L.structures[i];
      obsList.push({ x: r.x, z: r.z, r: Math.hypot(r.w, r.d) * 0.52 + 2.4 });
    }
    for (let wi = 0; wi < L.walls.length; wi++) {
      const wr = L.walls[wi];
      obsList.push({ x: wr.x, z: wr.z, r: Math.max(wr.w, wr.d) * 0.50 + 2.0 });
    }

    const sdx = Math.sin(L.solstice.ry), sdz = Math.cos(L.solstice.ry);
    function inSolsticeRay(x, z, pad) {
      const rx = x - L.solstice.x, rz = z - L.solstice.z;
      const along = rx * sdx + rz * sdz;
      if (along < -25 || along > 2600) return false;
      return Math.abs(-rx * sdz + rz * sdx) < (64 + (pad == null ? 0 : pad));
    }

    function inMonumentalCourt(x, z) {
      if (x > -945 && x < -470 && z > -1685 && z < -1586) return true; /* Lotus Harbour stone quay */
      if (x > -868 && x < -612 && z > -240 && z < 70) return true;     /* Solar Acropolis court */
      if (x > -108 && x < 72 && z > -80 && z < 128) return true;       /* Palace & Sunray Plaza */
      if (x > 290 && x < 390 && z > -1428 && z < -1322) return true;   /* White-Pass forecourt */
      if (x > 800 && x < 920 && z > 680 && z < 800) return true;       /* Izani Ruin forecourt */
      if (x > -312 && x < -12 && z > 992 && z < 1132) return true;     /* Great Pilgrims Market */
      return false;
    }

    function inParkLawnBed(x, z) {
      const parks = L.parks || [];
      for (let i = 0; i < parks.length; i++) {
        const pk = parks[i];
        if (x > pk.x0 + 2.2 && x < pk.x1 - 2.2 && z > pk.z0 + 2.2 && z < pk.z1 - 2.2) {
          const cx = (pk.x0 + pk.x1) * 0.5, cz = (pk.z0 + pk.z1) * 0.5;
          /* Leave axial 4.4 m brick paths & central fountain court clear of shrubs/trees! */
          if (Math.abs(x - cx) < 4.2 || Math.abs(z - cz) < 4.2) return false;
          if (Math.hypot(x - cx, z - cz) < 9.2) return false;
          if (pk.style === 'charbagh' && (Math.hypot(x - (cx - 38), z - cz) < 5.5 || Math.hypot(x - (cx + 38), z - cz) < 5.5)) return false;
          return true;
        }
      }
      return false;
    }

    function inCountrysideFloraZone(x, z) {
      if (JJ_LAYOUT.wallSignedDist && JJ_LAYOUT.wallSignedDist(x, z) > -68.0) return false;
      if (x > -565 && x < 915 && z > 925 && z < 1300) return false;    /* South Cut-Gate Suburb */
      if (x > -980 && x < -445 && z > -1725 && z < -1560) return false;/* Lotus Harbour */
      return true;
    }

    const clamp01 = function (v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };
    const shoreDistM = function (x, z) {
      return (JJ_GROUND.h(x, z) - JJ_GROUND.lakeY) * 14.0;
    };

    const lodOrigins = [];
    for (let oz = -1800; oz <= 1800; oz += 600) {
      for (let ox = -2100; ox <= 2100; ox += 700) {
        lodOrigins.push([ox, oz]);
      }
    }

    const floraRoot = new THREE.Group();
    floraRoot.name = 'jj-nwlowlands-flora-root';
    floraRoot.position.y = JJ_GROUND.lakeY;
    scene.add(floraRoot);
    floraRoot.updateMatrixWorld(true);

    BIO_I.init({
      THREE: THREE,
      scene: floraRoot,
      terrainH: function (x, z) { return JJ_GROUND.h(x, z) - JJ_GROUND.lakeY; },
      waterH: function () { return 0; },
      obstacles: obsList,
      ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },
      seed: 745546,
      origin: lodOrigins,
      center: [0, -200],
      mask: function (x, z) {
        if (inSolsticeRay(x, z, 8)) return 0;
        if (JJ_GROUND.slope(x, z, 8) > 0.40) return 0;
        /* Four-Day Lotus Tank floating lotus pads */
        if (x > 650 && x < 710 && z > -590 && z < -530 && minStructClearance(x, z, 40) > 3.2) return 0.85;
        const y = JJ_GROUND.h(x, z);
        if (y <= JJ_GROUND.lakeY + 0.35) return 0;
        if (JJ_GROUND.canal.dist(x, z) < 5.5) return 0;
        if (inParkLawnBed(x, z)) {
          return minStructClearance(x, z, 45) > 2.8 ? 0.86 : 0;
        }
        if (inCountrysideFloraZone(x, z)) {
          if (JJ_STAGE.roadMask.sample(x, z) > 0.32) return 0;
          return minStructClearance(x, z, 55) > 5.0 ? 0.54 : 0;
        }
        /* Strictly ZERO wild ground scatter in city streets, blocks, or courtyards! */
        return 0;
      },
      fields: {
        tropic: function (x, z) {
          if (inParkLawnBed(x, z)) return 0.66;
          return clamp01(0.82 - (z + 1600) * 0.00014);
        },
        dry: function (x, z) {
          if (inParkLawnBed(x, z)) return 0.12;
          if (Math.hypot(x - 1980, z + 320) < 600) return 0.48;
          return clamp01((z - 900) * 0.00025);
        },
        wet: function (x, z) {
          if (inParkLawnBed(x, z)) return 0.78;
          const dSh = shoreDistM(x, z);
          const dCan = JJ_GROUND.canal.dist(x, z);
          if (dSh < 90 || dCan < 75) return 0.94;
          return clamp01(0.74 - Math.max(0, z - 600) * 0.00015);
        },
        salt: function () { return 0; },
        flow: function (x, z) {
          return clamp01(1.0 - JJ_GROUND.canal.dist(x, z) / 70.0);
        },
        upland: function (x, z) {
          return clamp01((JJ_GROUND.h(x, z) + 20.0) / 140.0);
        },
        shoreM: shoreDistM
      }
    });
    if (typeof BIO_I.setSun === 'function') BIO_I.setSun([-2800, 3600, 1800]);
    NWLOW_I.IMPOSTORS = false;
    if (NWLOW_I.LOD) {
      Object.assign(NWLOW_I.LOD, { tree: 4200, grove: 3200, avenue: 4200, floor: 850, floorMid: 1350, farFloor: 1350 });
    }
    NWLOW_I.TREES.length = 0;

    const placedTrees = [];
    const allWays = L.ways || [];

    function onAnyStreetCarriageway(x, z, crownR, skipWayId) {
      for (let wi = 0; wi < allWays.length; wi++) {
        const w = allWays[wi];
        const pts = w.pts;
        const hw = (w.w == null ? 7.5 : w.w) * 0.5;
        /* Along its own wide boulevard, stay outside the central carriageway (tree verge sits near hw - 2.1 m) */
        const reqD = (w.id === skipWayId) ? Math.max(3.6, hw - 3.0) : (hw + crownR * 0.35 + 0.9);
        for (let k = 0; k + 1 < pts.length; k++) {
          if (ptSegDist2D(x, z, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]) < reqD) return true;
        }
      }
      return false;
    }

    function canPlantTree(x, z, crownR, structPad, skipWayId) {
      const y = JJ_GROUND.h(x, z);
      if (y <= JJ_GROUND.lakeY + 0.65) return false;
      if (JJ_GROUND.slope(x, z, 6) > 0.38) return false;
      if (inSolsticeRay(x, z, crownR + 10.0)) return false;
      if (JJ_GROUND.canal.dist(x, z) < crownR + 4.6) return false;
      if (inMonumentalCourt(x, z)) return false;
      if (onAnyStreetCarriageway(x, z, crownR, skipWayId)) return false;

      /* Exact rotated-OBB clearance against every building, landmark & circuit wall! */
      const reqClear = crownR * 1.18 + (structPad == null ? 2.2 : structPad);
      if (minStructClearance(x, z, reqClear + 72.0) < reqClear) return false;

      for (let ti = 0; ti < placedTrees.length; ti++) {
        const ot = placedTrees[ti];
        if (Math.hypot(x - ot.x, z - ot.z) < (crownR + ot.crownR) * 0.78 + 1.4) return false;
      }
      return true;
    }

    let treeSalt = 1;
    const countByKind = { park: 0, avenue: 0, rural: 0 };

    function plantCuratedTree(spKey, x, z, scaleK, lv, kind, skipWayId) {
      const spIdx = spIndexByKey[spKey];
      if (spIdx == null) return false;
      BIO_I.fn.reseed(745100 + (++treeSalt) * 977);
      const yRel = JJ_GROUND.h(x, z) - JJ_GROUND.lakeY;
      const T = NWLOW_I.make(spIdx, x, yRel, z);
      T.H *= scaleK;
      T.crownR *= scaleK;
      T.rb *= Math.max(0.52, scaleK);
      if (!canPlantTree(x, z, T.crownR, 2.2, skipWayId)) return false;

      const origReg = window.REGISTER;
      if (typeof origReg === 'function') {
        window.REGISTER = function (e) {
          if (e && typeof e.y === 'number') e.y += JJ_GROUND.lakeY;
          return origReg(e);
        };
      }
      try {
        BIO_I.cur = 'nwlow/trees';
        BIO_I.owner = [x, z];
        BIO_I.range = 4200;
        BIO_I.minRange = 0;
        NWLOW_I.grow(T, lv);
      } finally {
        BIO_I.owner = null;
        BIO_I.range = null;
        BIO_I.minRange = 0;
        BIO_I.cur = null;
        window.REGISTER = origReg;
      }

      NWLOW_I.TREES.push(T);
      placedTrees.push({ x: x, z: z, crownR: T.crownR, H: T.H, kind: kind, sp: spKey });
      countByKind[kind] = (countByKind[kind] || 0) + 1;
      return true;
    }

    /* Pass A: Formal Symmetrical Planting Inside All 6 Curbed Urban Parks & Royal/Temple Gardens */
    const parks = L.parks || [];
    for (let pki = 0; pki < parks.length; pki++) {
      const pk = parks[pki];
      const cx = (pk.x0 + pk.x1) * 0.5, cz = (pk.z0 + pk.z1) * 0.5;
      const spList = pk.species || ['mistpalm', 'ginkgo'];
      const perimSp = spList[0];

      /* Perimeter colonnade just inside the marble garden curb */
      for (let px = pk.x0 + 7.0; px <= pk.x1 - 7.0; px += 15.5) {
        if (Math.abs(px - cx) < 7.2) continue;
        plantCuratedTree(perimSp, px, pk.z0 + 6.5, 0.56, 2, 'park', null);
        plantCuratedTree(perimSp, px, pk.z1 - 6.5, 0.56, 2, 'park', null);
      }
      for (let pz = pk.z0 + 18.0; pz <= pk.z1 - 18.0; pz += 15.5) {
        if (Math.abs(pz - cz) < 7.2) continue;
        plantCuratedTree(perimSp, pk.x0 + 6.5, pz, 0.56, 2, 'park', null);
        plantCuratedTree(perimSp, pk.x1 - 6.5, pz, 0.56, 2, 'park', null);
      }

      /* Interior lawn quadrant specimen shade trees */
      let qIdx = 0;
      for (let pz = pk.z0 + 18.0; pz <= pk.z1 - 18.0; pz += 19.0) {
        if (Math.abs(pz - cz) < 8.5) continue;
        for (let px = pk.x0 + 18.0; px <= pk.x1 - 18.0; px += 19.0) {
          if (Math.abs(px - cx) < 8.5) continue;
          if (!inParkLawnBed(px, pz)) continue;
          const spKey = spList[(++qIdx) % spList.length];
          plantCuratedTree(spKey, px, pz, 0.60, 2, 'park', null);
        }
      }
    }

    /* Pass B: Pruned Urban Boulevard Rows Along Wide 18-21 m Ceremonial Boulevards & Monsoon Canal */
    function aveSpeciesFor(id) {
      if (id.indexOf('harbour') >= 0) return 'mistpalm';
      if (id.indexOf('pilgrim') >= 0) return 'paperbark';
      if (id.indexOf('izani') >= 0) return 'needlecypress';
      if (id.indexOf('whitepass') >= 0) return 'wattle';
      if (id.indexOf('sunray') >= 0) return 'paperbark';
      return 'ginkgo';
    }

    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      if (!w.treeAve || !w.pts || w.pts.length < 2) continue;
      const spKey = aveSpeciesFor(w.id || '');
      const off = (w.w == null ? 19.0 : w.w) * 0.5 - 2.0;
      const gap = 22.0;
      let carry = gap * 0.5;
      for (let pi = 0; pi + 1 < w.pts.length; pi++) {
        const a = w.pts[pi], b = w.pts[pi + 1];
        const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (segL < 4.0) continue;
        const ux = (b[0] - a[0]) / segL, uz = (b[1] - a[1]) / segL;
        let d = carry;
        for (; d < segL; d += gap) {
          for (let side = -1; side <= 1; side += 2) {
            const tx = a[0] + ux * d - uz * side * off;
            const tz = a[1] + uz * d + ux * side * off;
            /* Only plant boulevard trees inside the urban footprint (not way out on rural highway tails) */
            const inCity = (JJ_LAYOUT.wallSignedDist && JJ_LAYOUT.wallSignedDist(tx, tz) > -18.0) ||
                           (tx > -530 && tx < 930 && tz > 950 && tz < 1150) ||
                           (tx > -935 && tx < -480 && tz > -1620 && tz < -1530);
            if (inCity) {
              plantCuratedTree(spKey, tx, tz, 0.48, 2, 'avenue', w.id);
            }
          }
        }
        carry = d - segL;
      }
    }

    /* Riparian paperbark & glow-willow promenade along the Monsoon Feeder Canal */
    const cPath = JJ_GROUND.canal.pts;
    for (let ci = 0; ci + 1 < cPath.length; ci++) {
      const a = cPath[ci], b = cPath[ci + 1];
      const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / segL, uz = (b[1] - a[1]) / segL;
      for (let d = 14.0; d < segL; d += 28.0) {
        const spC = ((ci + Math.round(d)) % 3 === 0) ? 'glowwillow' : 'paperbark';
        for (let side = -1; side <= 1; side += 2) {
          const tx = a[0] + ux * d - uz * side * 10.5;
          const tz = a[1] + uz * d + ux * side * 10.5;
          plantCuratedTree(spC, tx, tz, 0.52, 2, 'avenue', null);
        }
      }
    }

    /* Pass C: Natural Monsoon Woodland Groves Strictly in the Rural Countryside (>70 m Outside City Walls) */
    const ruralSpeciesShore  = ['mistpalm', 'paperbark', 'glowwillow', 'pandan', 'treefern'];
    const ruralSpeciesUpland = ['bluegum', 'wattle', 'birch', 'ginkgo', 'ghostgum', 'needlecypress'];
    let rStep = 0;
    for (let gz = -1820; gz <= 1860; gz += 96) {
      for (let gx = -2320; gx <= 2320; gx += 96) {
        rStep++;
        const h1 = KRAND.unit(KRAND.hash(745546, 'rural', rStep, 1));
        const h2 = KRAND.unit(KRAND.hash(745546, 'rural', rStep, 2));
        const rx = gx + (h1 - 0.5) * 56.0;
        const rz = gz + (h2 - 0.5) * 56.0;
        if (!inCountrysideFloraZone(rx, rz)) continue;
        const clump = KRAND.fbm(rx * 0.0028, rz * 0.0028, 2.5, 2, 7459);
        if (clump < 0.45) continue;
        const dSh = shoreDistM(rx, rz);
        const dCan = JJ_GROUND.canal.dist(rx, rz);
        const wetSpot = (dSh < 110 || dCan < 95);
        const list = wetSpot ? ruralSpeciesShore : ruralSpeciesUpland;
        const spKey = list[KRAND.hash(745546, 'ruralSp', rStep) % list.length];
        const distOrigin = Math.hypot(rx, rz + 200);
        const lv = distOrigin < 980 ? 2 : 1;
        plantCuratedTree(spKey, rx, rz, 0.74, lv, 'rural', null);
      }
    }

    /* Pass D: Biome Understorey, Park Flower/Fern Beds, Lotus Pads & Lakeshore Reeds */
    let floorStats = {};
    if (typeof NWLOW_I.buildFloor === 'function') {
      const origRegFloor = window.REGISTER;
      if (typeof origRegFloor === 'function') {
        window.REGISTER = function (e) {
          if (e && typeof e.y === 'number') e.y += JJ_GROUND.lakeY;
          return origRegFloor(e);
        };
      }
      try {
        BIO_I.cur = 'nwlow/floor';
        floorStats = NWLOW_I.buildFloor(2250, 0.24) || {};
      } finally {
        BIO_I.cur = null;
        window.REGISTER = origRegFloor;
      }
    }

    /* Verify 0 tree-structure OBB clips across all placed trees */
    let clipCount = 0;
    let minObsClearM = 999;
    for (let ti = 0; ti < placedTrees.length; ti++) {
      const pt = placedTrees[ti];
      const clr = minStructClearance(pt.x, pt.z, pt.crownR + 65.0) - pt.crownR;
      if (clr < minObsClearM) minObsClearM = clr;
      if (clr < 0.5) clipCount++;
    }

    const bakedFlora = BIO_I.bake();
    /* Split any BIO InstancedMesh exceeding 200k instances so every mesh stays strictly below the 250k cap */
    const overIm = [];
    floraRoot.traverse(function (o) {
      if (o && o.isInstancedMesh && o.count > 200000) overIm.push(o);
    });
    const tmpM = new THREE.Matrix4();
    const tmpC = new THREE.Color();
    for (let oi = 0; oi < overIm.length; oi++) {
      const src = overIm[oi];
      const par = src.parent;
      if (!par) continue;
      const cap = 190000;
      const total = src.count;
      for (let start = cap; start < total; start += cap) {
        const subN = Math.min(cap, total - start);
        const sub = new THREE.InstancedMesh(src.geometry, src.material, subN);
        sub.frustumCulled = src.frustumCulled;
        sub.castShadow = src.castShadow;
        sub.receiveShadow = src.receiveShadow;
        sub.userData = Object.assign({}, src.userData || {});
        for (let k = 0; k < subN; k++) {
          src.getMatrixAt(start + k, tmpM);
          sub.setMatrixAt(k, tmpM);
          if (src.instanceColor) {
            src.getColorAt(start + k, tmpC);
            sub.setColorAt(k, tmpC);
          }
        }
        sub.instanceMatrix.needsUpdate = true;
        if (sub.instanceColor) sub.instanceColor.needsUpdate = true;
        par.add(sub);
      }
      src.count = cap;
      src.instanceMatrix.needsUpdate = true;
      if (src.instanceColor) src.instanceColor.needsUpdate = true;
    }
    floraRoot.updateMatrixWorld(true);
    floraSummary = {
      trees: placedTrees.length,
      park: countByKind.park,
      avenue: countByKind.avenue,
      rural: countByKind.rural,
      clipCount: clipCount,
      minClearanceM: Math.round(minObsClearM * 100) / 100,
      floor: floorStats,
      baked: bakedFlora
    };
  }

  /* 11. Three-Regime Liturgical Lighting: Day, Whorl-Olive Oil Night, & Double-Dark Fire-Out Vigil */
  function syncNight() {
    if (typeof JMAT !== 'undefined') {
      const oilI = !NIGHT ? 0.35 : (DOUBLE_DARK ? 0.02 : 1.75);
      const furnI = !NIGHT ? 0.40 : (DOUBLE_DARK ? 0.02 : 1.90);
      const elecI = !NIGHT ? 0.45 : (DOUBLE_DARK ? 1.55 : 1.85);
      if (JMAT.glow) JMAT.glow.emissiveIntensity = oilI;
      if (typeof jjFurnMat !== 'undefined' && jjFurnMat.glow) jjFurnMat.glow.emissiveIntensity = furnI;
      if (JMAT.jjElectricGlow) JMAT.jjElectricGlow.emissiveIntensity = elecI;
      if (typeof KIT !== 'undefined' && KIT.meshes && KIT.defs) {
        for (const nm in KIT.meshes) {
          const im = KIT.meshes[nm];
          const df = KIT.defs[nm];
          if (!im || !im.material || !df) continue;
          if (df.mat === JMAT.glow) im.material.emissiveIntensity = oilI;
          else if (typeof jjFurnMat !== 'undefined' && df.mat === jjFurnMat.glow) im.material.emissiveIntensity = furnI;
          else if (df.mat === JMAT.jjElectricGlow) im.material.emissiveIntensity = elecI;
        }
      }
    }
  }
  syncNight();

  const ms = Math.round(performance.now() - t0);
  return {
    placed: placed,
    missing: missing,
    construct: constructBuilt,
    water: waterDrawn,
    paved: pavedSummary,
    flora: floraSummary,
    tags: T,
    tagCount: tagCount,
    night: { sync: syncNight },
    ms: ms
  };
})();
