// ================================================================= DILIHAN — Dual-Kit Placement, KCONS, Water, KWALK, Cut Flora & Night
// [draw] Isolates JJFURN from VERN KXF, locks JJ_SOLSTICE to -31.50 deg S, registers KTAGS, builds KCONS + KCITY.constructMesh
// scaffolded expansion lots, places all 5 zones' JJ & VERN buildings + walls + RES_ORE skarn nodes + citizens, draws core/water
// (-1,608 m Cut Salt Lake, West-Wall spring stream, Hykkousoi cistern & D2 potash pans), wires KWALK, bakes warped biomes/cut
// flora, and drives dual-regime night lighting (electric Izani/civic glow vs. warm oil lamps in the brick colonia).
const DL_PLACE = (function () {
  /* 1. Isolate JJFURN.place from 69c-vern-helpers.js KXF/_XFSTACK and strip PointLights to keep uniform/sampler counts low */
  if (typeof JJFURN !== 'undefined' && typeof JJFURN.place === 'function') {
    const jjFurnPlace0 = JJFURN.place;
    JJFURN.place = function (sc, key, x, z, ry, opts) {
      const savedKxf = KXF;
      const savedStack = typeof _XFSTACK !== 'undefined' ? _XFSTACK.slice() : null;
      KXF = null;
      if (typeof _XFSTACK !== 'undefined') _XFSTACK.length = 0;
      let grp = null;
      try {
        grp = jjFurnPlace0.call(this, sc, key, x, z, ry, opts);
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

  const t0 = performance.now();
  const L = DL_LAYOUT.plan;

  /* 2. Lock 74-jj-sacred.js JJ_SOLSTICE to Dilihan's exact -31.50 deg S ephemeris before jj_temple_sun builds */
  if (typeof JJ_SOLSTICE !== 'undefined' && L.solstice && L.solstice.ephemeris) {
    const ep = L.solstice.ephemeris;
    JJ_SOLSTICE.day = ep.day;
    JJ_SOLSTICE.targetAltDeg = ep.targetAltDeg;
    JJ_SOLSTICE.hour = ep.hour;
    JJ_SOLSTICE.azimuthDeg = ep.azimuthDeg;
    JJ_SOLSTICE.altitudeDeg = ep.altitudeDeg;
    JJ_SOLSTICE.ry = L.solstice.ry;
  }

  /* 3. Register every building, wall, ore node and citizen in core/tags BEFORE drawing */
  const T = (typeof KTAGS !== 'undefined' && KTAGS.page) ? KTAGS.page : KTAGS.create({ build: 'dilihan' });
  T.build = 'dilihan';
  KTAGS.page = T;
  const tagCount = DL_RULES.registerTags(L, T);

  const placed = [];
  const missing = [];
  const constructBuilt = [];
  const occSpace = KSPACE.create({ cell: 28 });
  const plinthMarble = vC(0xe6dfd2);
  const plinthGranite = vC(0x7c746b);
  const plinthCap = vC(0xf0eae0);

  function minCornerGround(x, z, w, d, ry) {
    const hw = w * 0.48;
    const hd = d * 0.48;
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    let lo = DL_GROUND.h(x, z);
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]];
    for (let i = 0; i < pts.length; i++) {
      const lx = pts[i][0];
      const lz = pts[i][1];
      const gy = DL_GROUND.h(x + lx * c + lz * s, z - lx * s + lz * c);
      if (gy < lo) lo = gy;
    }
    return lo;
  }

  function addSlopePlinth(r) {
    if (r.key === 'dl_stream_bridge' || r.key === 'dl_evaporite_pan') return;
    const lo = minCornerGround(r.x, r.z, r.w, r.d, r.ry);
    const bot = Math.min(lo - 0.9, r.y - 0.75);
    const top = r.y - 0.02;
    const h = top - bot;
    if (h <= 0.05) return;
    const q = r.ry ? qEuler(0, r.ry, 0) : null;
    const baseCol = (r.zone === 1 || r.zone === 2) ? plinthMarble : plinthGranite;
    kput('vStone', [r.x, bot + h * 0.5, r.z], q, [r.w * 0.96, h, r.d * 0.96], baseCol);
    if (h > 1.0) {
      kput('vStone', [r.x, top - 0.12, r.z], q, [r.w * 0.99, 0.22, r.d * 0.99], plinthCap);
    }
  }

  /* 4. Flatten helper for VERN pieces going up under KCONS.site + KCITY.constructMesh (exact world-UV & color bake) */
  function dlDenorm(a) {
    if (!a.normalized) return 1;
    const r = a.array;
    if (r instanceof Uint8Array || r instanceof Uint8ClampedArray) return 1 / 255;
    if (r instanceof Uint16Array) return 1 / 65535;
    if (r instanceof Int8Array) return 1 / 127;
    if (r instanceof Int16Array) return 1 / 32767;
    return 1;
  }

  function dlFlattenGroup(G) {
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
            const csc = src ? dlDenorm(src) : 1;
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
          const sc = dlDenorm(src);
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

  const consProtoCache = {};
  function getConstructParts(key, v) {
    const cid = key + '#' + (v | 0);
    if (consProtoCache[cid]) return consProtoCache[cid];
    if (typeof VERN === 'undefined' || !VERN.defs[key]) return null;

    /* Snapshot clean KIT.items state (runs before main building loop, so KIT.items are empty) */
    const r0 = REG.length;
    const d0 = (typeof KDOOR !== 'undefined' && KDOOR.list) ? KDOOR.list.length : 0;
    KIT.order.forEach(function (n) { KIT.items[n].length = 0; });

    const protoG = new THREE.Group();
    withFlatGround(function () {
      VERN.place(protoG, key, 0, 0, 0, { y: 0, v: v | 0, scale: 1, lit: false });
    });
    kbake(protoG);
    const parts = dlFlattenGroup(protoG);

    /* Restore global KIT, REG & KDOOR so main pass starts 100% clean */
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
    wrap.name = 'dl-construct-' + r.id;
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
      name: 'Scaffolded Izani Expansion Lot (' + r.key + ', ' + Math.round(r.construct.progress * 100) + '%)',
      key: r.key,
      cls: 'building',
      x: r.x,
      y: r.y,
      z: r.z,
      r: Math.max(r.w, r.d) * 0.52,
      h: Math.max(3.5, r.h * r.construct.progress + 1.5),
      tags: { culture: r.culture, type: r.types, wealth: r.wealth || 'middle', job: 'masonry' }
    });
    placed.push(r.id);
    constructBuilt.push({ id: r.id, key: r.key, progress: r.construct.progress, tris: cm.tris });
    return true;
  }

  /* Build the 8 KCONS + KCITY.constructMesh expansion lots FIRST while KIT.items are empty */
  for (let i = 0; i < L.structures.length; i++) {
    const r = L.structures[i];
    if (r.construct) {
      if (!placeConstructRecord(r)) {
        r._fallbackNormal = true;
      }
    }
  }

  /* 5. Place all remaining Zone 1..5 JJ & VERN structures and Colonia circuit walls */
  function placeRecord(r) {
    if (r.construct && !r._fallbackNormal) return;
    const v = r.v == null ? (KRAND.hash(744663, r.id) % 3) : r.v;
    const wTier = r.wealth === 'poor' ? 0 : r.wealth === 'rich' ? 2 : r.wealth === null ? 3 : 1;
    const opts = {
      id: r.id,
      y: r.y,
      v: v,
      w: wTier,
      scale: r.scale == null ? 1 : r.scale,
      lit: !!r.lit,
      crop: r.crop || null
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

    if (G) {
      placed.push(r.id);
    } else {
      missing.push(r.id + ':' + r.key);
    }
  }

  for (let i = 0; i < L.structures.length; i++) {
    placeRecord(L.structures[i]);
  }
  for (let wi = 0; wi < L.walls.length; wi++) {
    placeRecord(L.walls[wi]);
  }

  /* 6. Place visible RES_ORE cassiterite tin, magnetite iron & copper skarn nodes */
  for (let ni = 0; ni < L.oreNodes.length; ni++) {
    DL_LANDMARKS.placeOreNode(L.oreNodes[ni]);
    placed.push(L.oreNodes[ni].id);
  }

  /* 7. Place instanced Citizens, Eastern Muster Cohort & North Caravanserai Pack Train (zero extra draw calls via figB/figH) */
  const citPalette = {
    iziz: [0xe8d9b8, 0xe07a2a, 0x3b4a8a, 0xd8c8a8, 0xc9442a],
    jimjam: [0xa8322a, 0xd9a33a, 0x3aa6a0, 0xe8d7b1, 0x7e2220],
    hykkousoi: [0x267c85, 0xede6d6, 0xd49b38, 0x2f5f78],
    rustic: [0x7a5c3e, 0x5c6b48, 0x8e6f4a, 0x6b4e38]
  };
  for (let ci = 0; ci < L.citizens.length; ci++) {
    const ct = L.citizens[ci];
    const pal = citPalette[ct.culture] || citPalette.iziz;
    const robeHex = pal[KRAND.hash(744663, ct.id, 3) % pal.length];
    const skinHex = (ci % 3 === 0) ? 0xb98a64 : (ci % 3 === 1) ? 0xc9a17e : 0x9e714f;
    kput('figB', [ct.x, ct.y, ct.z], qEuler(0, ct.ry, 0), 1, vC(robeHex));
    kput('figH', [ct.x, ct.y, ct.z], null, 1, vC(skinHex));
    if (ct.group === 'eastern-muster') {
      /* Bronze-tipped legionary spears along the muster ranks */
      kput('vPost', [ct.x + 0.34, ct.y, ct.z + 0.18], null, [0.035, 2.35, 0.035], vC(0x5c442c));
    }
  }
  /* Pack mules & baggage loads at North Highway Caravanserai (66, -446) & Lower-Town Customs Fork (-402, -38) */
  const muleSpots = [
    [36, -442, 0.2], [44, -444, 0.15], [52, -443, -0.1], [60, -445, 0.05],
    [-402, -32, 1.4], [-404, -40, 1.5], [-401, -48, 1.6]
  ];
  for (let mi = 0; mi < muleSpots.length; mi++) {
    const ms = muleSpots[mi];
    const my = DL_GROUND.h(ms[0], ms[1]);
    const mq = qEuler(0, ms[2], 0);
    kput('vWood', [ms[0], my + 0.92, ms[1]], mq, [0.58, 0.56, 1.48], vC(0x6c4f38));
    kput('vWood', [ms[0], my + 1.32, ms[1] + Math.cos(ms[2]) * 0.68], mq, [0.34, 0.44, 0.52], vC(0x5e432e));
    kput('vSack', [ms[0] - 0.36, my + 1.18, ms[1]], mq, [0.32, 0.36, 0.48], vC(0xc8b48e));
    kput('vSack', [ms[0] + 0.36, my + 1.18, ms[1]], mq, [0.32, 0.36, 0.48], vC(0xb89e76));
    for (const lx of [-0.2, 0.2]) {
      for (const lz of [-0.48, 0.48]) {
        const lp = loc(ms[0], ms[1], lx, lz, ms[2]);
        kput('vPost', [lp[0], my, lp[1]], null, [0.06, 0.78, 0.06], vC(0x4d3826));
      }
    }
  }

  /* 8. Flush indexed KFURN catalog furniture & bake Ancients/JJ/VERN instancer */
  TSTAT.cur = null;
  DL_LANDMARKS.furn.flush(scene);
  kbake(scene);

  /* 9. Draw core/water: -1,608 m Cut Salt Lake SE sump (8 km north), West-Wall spring stream, Hykkousoi cistern & D2 pans */
  const waterDrawn = { lake: null, stream: null, still: [] };
  if (typeof WATER !== 'undefined') {
    /* 9a. Cut Salt Lake SE Hypersaline Sump (-1,608 m ASL = DL_GROUND.lakeY = -719.4 m rel, 8 km north) */
    const lakeS = WATER.still({
      name: 'Cut Salt Lake SE Hypersaline Sump (-1,608 m ASL)',
      level: DL_GROUND.lakeY,
      poly: [
        [-14800, -15150],
        [14800, -15150],
        [14800, -7640],
        [-14800, -7640]
      ]
    });
    waterDrawn.lake = WATER.drawStill(lakeS, {
      THREE: THREE,
      scene: scene,
      color: 0x225866,
      roughness: 0.08,
      metalness: 0.16,
      envMapIntensity: 0.62
    });

    /* 9b. Perennial West-Wall Contact-Marble Spring Stream (WATER.flow [x, z, y]) */
    const sPts = DL_GROUND.stream.pts.map(function (p) {
      return [p[0], p[1], DL_GROUND.stream.surfaceY(p[0], p[1])];
    });
    const streamS = WATER.flow({
      name: 'West-Wall Contact-Marble Perennial Spring Stream',
      pts: sPts,
      densify: 16,
      width: 6.4,
      speed: 1.35
    });
    waterDrawn.stream = WATER.drawFlow(streamS, {
      THREE: THREE,
      scene: scene,
      color: 0x2a6a76,
      shallow: 0x5ea2a8,
      deep: 0x1c4a56,
      roughness: 0.12,
      metalness: 0.10,
      envMapIntensity: 0.52,
      step: 7,
      across: 6,
      margin: 1.2
    });

    /* 9c. Walled Hykkousoi League Envoys' House Cistern Court (-360, 84) */
    const legRec = L.structures.find(function (r) { return r.id === L.landmarks.legationId; });
    if (legRec) {
      const cp = loc(legRec.x, legRec.z, 0, 2.0, legRec.ry);
      const cS = WATER.still({
        name: 'Hykkousoi Envoys House Rainwater Cistern',
        level: legRec.y + 0.36,
        poly: [
          [cp[0] - 4.8, cp[1] - 5.6],
          [cp[0] + 4.8, cp[1] - 5.6],
          [cp[0] + 4.8, cp[1] + 5.6],
          [cp[0] - 4.8, cp[1] + 5.6]
        ]
      });
      waterDrawn.still.push(WATER.drawStill(cS, {
        THREE: THREE,
        scene: scene,
        color: 0x1d5b66,
        roughness: 0.05,
        metalness: 0.14,
        envMapIntensity: 0.55,
        pick: true
      }));
    }

    /* 9d. Five D2 Potash & Halite Solar Evaporation Pans on the north lake shore */
    for (let si = 0; si < L.structures.length; si++) {
      const sr = L.structures[si];
      if (sr.key === 'dl_evaporite_pan') {
        const pS = WATER.still({
          name: sr.name || 'Potash Brine Pan',
          level: sr.y + 0.52,
          poly: [
            [sr.x - 16.0, sr.z - 11.4],
            [sr.x + 16.0, sr.z - 11.4],
            [sr.x + 16.0, sr.z + 11.4],
            [sr.x - 16.0, sr.z + 11.4]
          ]
        });
        waterDrawn.still.push(WATER.drawStill(pS, {
          THREE: THREE,
          scene: scene,
          color: 0x8b6a72,
          roughness: 0.07,
          metalness: 0.12,
          envMapIntensity: 0.48
        }));
      }
    }
  }
  window._water = {
    surfaces: typeof WATER !== 'undefined' ? WATER.surfaces.length : 0,
    still: waterDrawn.still.length + (waterDrawn.lake ? 1 : 0),
    flow: waterDrawn.stream ? 1 : 0
  };

  /* 10. Wire KWALK navigation strips & civic plazas across all 5 zones */
  if (typeof KWALK !== 'undefined') {
    const allWays = L.ways || [];
    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      const pts = w.pts || [];
      const ww = w.w == null ? 6.0 : w.w;
      for (let pi = 0; pi + 1 < pts.length; pi++) {
        const a = pts[pi];
        const b = pts[pi + 1];
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
        KWALK.strip({
          a: [a[0], a[1], DL_GROUND.h(a[0], a[1])],
          b: [b[0], b[1], DL_GROUND.h(b[0], b[1])],
          w: ww,
          name: w.id || 'dilihan-street',
          tag: 'road'
        });
      }
    }
    const forumRec = L.structures.find(function (r) { return r.id === L.landmarks.forumId; });
    const bridgeRec = L.structures.find(function (r) { return r.id === L.landmarks.bridgeId; });
    KWALK.floor({ rect: [-30, 30, -84, -36], y: (forumRec ? forumRec.y : DL_GROUND.h(0, -60)) + 1.12, name: 'Colonia Contact-Marble Forum', tag: 'plaza' });
    KWALK.floor({ rect: [232, 288, 224, 266], y: DL_GROUND.h(260, 245), name: 'Governor Palace Forecourt', tag: 'plaza' });
    KWALK.floor({ rect: [26, 106, -468, -422], y: DL_GROUND.h(66, -445), name: 'North Caravanserai Yard', tag: 'plaza' });
    KWALK.floor({ rect: [512, 568, -42, 14], y: DL_GROUND.h(540, -14), name: 'Eastern Muster Ground', tag: 'plaza' });
    if (bridgeRec) {
      KWALK.floor({ rect: [bridgeRec.x - 14, bridgeRec.x + 14, bridgeRec.z - 6, bridgeRec.z + 6], y: bridgeRec.y + 0.42, name: 'Spring Stream Bridge Deck', tag: 'road' });
    }
    for (let bi = 0; bi < L.structures.length; bi++) {
      const br = L.structures[bi];
      if (!br || br.cls !== 'building') continue;
      if (br.key === 'dl_colonia_forum' || br.key === 'dl_stream_bridge' || br.key === 'jj_wall_gate' || br.key === 'dl_customs_post') continue;
      const hw = Math.max(1.5, br.w * 0.36);
      const hd = Math.max(1.5, br.d * 0.36);
      KWALK.block([br.x - hw, br.x + hw, br.z - hd, br.z + hd, br.y - 1.5, br.y + 8.0], 'building');
    }
  }

  /* 11. Warped Cut & Dense-Air Monsoon Flora (biomes/cut + nwlowlands + nhighlands read in place) */
  const floraSummary = { cut: null, nwlow: null, nhl: null, baked: null };
  if (typeof DL_FLORA !== 'undefined' && DL_FLORA.BIO && DL_FLORA.CUT) {
    const obsList = [];
    for (let i = 0; i < L.structures.length; i++) {
      const r = L.structures[i];
      obsList.push({ x: r.x, z: r.z, r: Math.hypot(r.w, r.d) * 0.58 + 5.5 });
    }
    for (let wi = 0; wi < L.walls.length; wi++) {
      const wr = L.walls[wi];
      obsList.push({ x: wr.x, z: wr.z, r: Math.hypot(wr.w, wr.d) * 0.55 + 3.5 });
    }

    const isUrbanOrRoad = function (x, z, pad) {
      const p = pad == null ? 0 : pad;
      if (DL_STAGE.roadMask.sample(x, z) > 0.08) return true;
      /* Keep Colonia, Vernacular Districts, Palace Precinct & Lower Town urban footprints clear of wild groves */
      if (x > -275 - p && x < 785 + p && z > -585 - p && z < 675 + p) return true;
      if (x > -545 - p && x < -275 + p && z > -265 - p && z < 285 + p) return true;
      /* Keep Solstice sunset sightline corridor 100% clear */
      const rx = x - L.solstice.x;
      const rz = z - L.solstice.z;
      const sdx = Math.sin(L.solstice.ry);
      const sdz = Math.cos(L.solstice.ry);
      const along = rx * sdx + rz * sdz;
      if (along > 15 && along < 950 && Math.abs(-rx * sdz + rz * sdx) < 36 + p) return true;
      if (DL_GROUND.stream.dist(x, z) < 8.5 + p) return true;
      if (occSpace.some(x, z, 20 + p, function () { return true; })) return true;
      return false;
    };

    DL_FLORA.BIO.init({
      THREE: THREE,
      scene: scene,
      terrainH: function (x, z) { return DL_GROUND.h(x, z); },
      waterH: function () { return DL_GROUND.lakeY; },
      obstacles: obsList,
      ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },
      seed: 744663,
      origin: [[0, -60]],
      center: [0, -240],
      mask: function (x, z) {
        if (isUrbanOrRoad(x, z, 6)) return 0;
        if (DL_GROUND.slope(x, z, 8) > 0.42) return 0;
        return z > 350 ? 0.55 : 0.42;
      },
      fields: {
        cold: function (x, z) {
          const asl = DL_GROUND.asl(x, z);
          return Math.max(0.05, Math.min(0.88, (asl + 950) / 1400));
        },
        wet: function (x, z) {
          if (DL_GROUND.stream.dist(x, z) < 65) return 0.88;
          return z > -400 ? 0.72 : Math.max(0.18, 0.65 + z / 4200);
        },
        flow: function (x, z) { return DL_GROUND.stream.dist(x, z) < 28 ? 0.65 : 0.08; },
        mist: function (x, z) { return z < -800 ? 0.28 : 0.16; },
        rock: function (x, z) { return DL_GROUND.slope(x, z, 8) > 0.22 ? 0.80 : 0.24; },
        upland: function (x, z) { return DL_GROUND.asl(x, z) > -780 ? 0.72 : 0.22; }
      }
    });

    /* 11a. Cut native flora: hyperbamboo groves, rankgrass rows, 3-size measuremelon vines, and non-touching circlelichen */
    const cutZone = function (x, z) {
      if (isUrbanOrRoad(x, z, 10)) return { grove: 0, reed: 0, rank: 0, melon: 0 };
      /* Cut warp & native density increases downslope northwards toward the -1,608 m bowl */
      const down = Math.max(0.15, Math.min(1.0, (-z + 300) / 1800));
      const nearStream = DL_GROUND.stream.dist(x, z) < 95 ? 0.35 : 0;
      return {
        grove: Math.min(0.95, 0.35 + down * 0.50 + nearStream),
        reed: DL_GROUND.stream.dist(x, z) < 18 ? 0.65 : 0,
        rank: Math.min(0.95, 0.25 + down * 0.65),
        melon: (z < -480 && z > -1450) ? 0.75 : 0.15
      };
    };

    floraSummary.cut = DL_FLORA.CUT.build({
      R: 1120,
      q: 0.11,
      spine: [[-540, -640], [380, -680], [840, -180], [-560, 160]],
      rankR: 115,
      reeds: false,
      ground: function (x, z) { return DL_GROUND.h(x, z); },
      toBowl: DL_GROUND.toBowl,
      alt: function (y) { return DL_GROUND.datum + y; },
      zone: cutZone,
      clear: function (x, z, r) { return !isUrbanOrRoad(x, z, r == null ? 2 : r); },
      melons: function () {
        return DL_FLORA.CUT.planMelons({
          box: [-335, -745, -255, -665],
          ground: function (x, z) { return DL_GROUND.h(x, z); },
          toBowl: DL_GROUND.toBowl,
          tread: function (x, z) { return (!isUrbanOrRoad(x, z, 2) && DL_GROUND.slope(x, z, 4) < 0.09) ? 0.85 : 0; },
          clear: function (x, z, r) { return !isUrbanOrRoad(x, z, r); }
        });
      },
      lichen: function () {
        return DL_FLORA.CUT.planLichen({
          spine: [[-266, -135], [-266, 15]],
          r: 42,
          ground: function (x, z) { return DL_GROUND.h(x, z); },
          bare: function (x, z) { return DL_GROUND.slope(x, z, 6) > 0.22 ? 0.90 : 0; },
          normal: function (x, z) {
            const gx = (DL_GROUND.h(x + 2, z) - DL_GROUND.h(x - 2, z)) * 0.25;
            const gz = (DL_GROUND.h(x, z + 2) - DL_GROUND.h(x, z - 2)) * 0.25;
            const ln = Math.hypot(gx, 1, gz);
            return [-gx / ln, 1 / ln, -gz / ln];
          }
        });
      }
    });

    const groves = DL_FLORA.CUT.PLANTS ? DL_FLORA.CUT.PLANTS.groves : [];
    for (let gi = 0; gi < groves.length; gi++) {
      obsList.push({ x: groves[gi].x, z: groves[gi].z, r: groves[gi].r + 4 });
    }

    /* 11b. Dense-air monsoon & upper-wall read-in trees warped by CUT.warpKit (CUT handles floor cover) */
    if (DL_FLORA.NWLOW) {
      DL_FLORA.NWLOW.buildFloor = null;
      DL_FLORA.CUT.warpKit(DL_FLORA.NWLOW, {
        ground: function (x, z) { return DL_GROUND.h(x, z); },
        toBowl: DL_GROUND.toBowl,
        alt: function (y) { return DL_GROUND.datum + y; }
      });
      floraSummary.nwlow = DL_FLORA.NWLOW.build({
        R: 820,
        quality: 0.02,
        avenues: []
      });
    }
    if (DL_FLORA.NHL) {
      const oldMask = DL_FLORA.BIO.host.mask;
      DL_FLORA.BIO.host.mask = function (x, z) {
        return z > 420 ? oldMask(x, z) * 0.55 : 0;
      };
      DL_FLORA.CUT.warpKit(DL_FLORA.NHL, {
        ground: function (x, z) { return DL_GROUND.h(x, z); },
        toBowl: DL_GROUND.toBowl,
        alt: function (y) { return DL_GROUND.datum + y; }
      });
      floraSummary.nhl = DL_FLORA.NHL.build({
        R: 820,
        quality: 0.02,
        flora: false,
        box: [-820, 920, 420, 1100]
      });
      DL_FLORA.BIO.host.mask = oldMask;
    }

    floraSummary.baked = DL_FLORA.BIO.bake();
  }

  /* 12. Dual-Regime Night Lighting (PLAN.md §2.4 & §3 P4):
         - Cool-warm electric glow (0xffe8b6) on rich/civic Vernacular, Governor's Palace drum/dome & Solstice Temple
         - Warm amber oil lanterns (0xff9234) along the Colonia's brick courtyard streets, Wall Streets & Lower Town */
  const nightLighting = (function () {
    const elecPts = [];
    const oilPts = [];
    for (let i = 0; i < L.structures.length; i++) {
      const r = L.structures[i];
      if (r.lit) {
        const ef = loc(r.x, r.z, 0, r.d * 0.54 + 1.15, r.ry);
        elecPts.push([ef[0], r.y + Math.min(r.h * 0.48, 4.4), ef[1], 0.95, 1.15]);
        if (r.id === L.landmarks.palaceId) {
          /* Exterior drum windows, forecourt loggia arches & Cut signal-room lantern on Governor's Palace */
          for (let k = 0; k < 8; k++) {
            const a = k * Math.PI * 0.25;
            elecPts.push([r.x + Math.sin(a) * 6.9, r.y + 16.2, r.z + Math.cos(a) * 6.9 + 4.0, 1.15, 1.65]);
          }
          for (let lx = -12; lx <= 12; lx += 6) {
            elecPts.push([r.x + lx, r.y + 4.6, r.z - 9.2, 0.95, 1.25]);
          }
          elecPts.push([r.x, r.y + 27.6, r.z + 4.0, 2.35, 2.65]);
        } else if (r.id === L.landmarks.templeId) {
          /* Exterior solstice portal lantern & shikhara crown on jj_temple_sun */
          elecPts.push([L.solstice.archBaseWorld[0], L.solstice.archBaseWorld[1] + 9.2, L.solstice.archBaseWorld[2], 1.65, 2.05]);
        }
      } else if (r.zone === 1 || r.zone === 4 || r.wallStreet) {
        /* Warm oil street & courtyard lamps outside Jimjam Colonia, Wall Street & Lower Town facades */
        const front = loc(r.x, r.z, 0, r.d * 0.54 + 1.05, r.ry);
        oilPts.push([front[0], r.y + 3.05, front[1], 0.88, 1.08]);
      }
    }
    /* Oil lantern chains along Colonia cardo, decumanus, Forum & Wall Streets */
    for (let s = -240; s <= 230; s += 24) {
      oilPts.push([-5.2, DL_GROUND.h(-5.2, s) + 3.4, s, 0.92, 1.12]);
      oilPts.push([248.5, DL_GROUND.h(248.5, s) + 3.4, s, 0.95, 1.15]);
    }
    for (let s = -230; s <= 240; s += 24) {
      oilPts.push([s, DL_GROUND.h(s, -54.8) + 3.4, -54.8, 0.92, 1.12]);
      oilPts.push([s, DL_GROUND.h(s, 191.0) + 3.4, 191.0, 0.92, 1.12]);
    }
    /* Electric lamp standards along Vernacular East Wall Street & radial avenues */
    for (let s = -220; s <= 260; s += 28) {
      elecPts.push([265.5, DL_GROUND.h(265.5, s) + 4.2, s, 0.92, 1.12]);
    }

    function makeGlowInst(pts, hex) {
      const mat = new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });
      const geo = new THREE.SphereGeometry(0.5, 10, 8);
      const im = new THREE.InstancedMesh(geo, mat, Math.max(1, pts.length));
      const m4 = new THREE.Matrix4();
      const p3 = new THREE.Vector3();
      const q0 = new THREE.Quaternion();
      const s3 = new THREE.Vector3();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p3.set(p[0], p[1], p[2]);
        s3.set(p[3], p[4], p[3]);
        m4.compose(p3, q0, s3);
        im.setMatrixAt(i, m4);
      }
      im.instanceMatrix.needsUpdate = true;
      im.frustumCulled = false;
      im.visible = false;
      im.name = 'dl-night-glow-' + hex.toString(16);
      im.userData.probeSkip = true;
      im.userData.lodSkip = true;
      scene.add(im);
      return im;
    }

    const elecMesh = makeGlowInst(elecPts, 0xfff0c4);
    const oilMesh = makeGlowInst(oilPts, 0xff8c28);
    let lastNight = null;

    function syncNight() {
      const hc = (typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock) ? KHOST.host.clock : null;
      const hr = hc && typeof hc.hour === 'number' ? hc.hour : 11.4;
      const isNight = NIGHT || hr < 5.3 || hr > 19.4;
      if (isNight === lastNight) return;
      lastNight = isNight;
      elecMesh.visible = isNight;
      oilMesh.visible = isNight;
      if (typeof JMAT !== 'undefined' && JMAT.glass && JMAT.glass.emissive) {
        JMAT.glass.emissive.setHex(isNight ? 0xd99b4e : 0x000000);
        JMAT.glass.emissiveIntensity = isNight ? 0.85 : 0.0;
      }
    }
    FRAME_HOOKS.push(syncNight);
    return {
      electricCount: elecPts.length,
      oilCount: oilPts.length,
      sync: syncNight
    };
  })();

  /* 13. Attach interactive door host */
  if (typeof KDOORHOST !== 'undefined' && typeof KDOORHOST.attach === 'function') {
    KDOORHOST.attach({ THREE: THREE, scene: scene, camera: camera, ticks: TICKS });
  }

  return {
    placed: placed,
    missing: missing,
    construct: constructBuilt,
    tags: T,
    tagCount: tagCount,
    water: waterDrawn,
    flora: floraSummary,
    night: nightLighting,
    ms: Math.round(performance.now() - t0)
  };
})();
