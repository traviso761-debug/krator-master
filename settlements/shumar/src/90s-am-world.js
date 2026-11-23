/* ================================================================= AMARO 3D WORLD ASSEMBLY (Step A2)
   [draw] Replaces the flat kit sheet ground with Amaro's 3-tier displaced terrain (4-tier ablaq canyon + plateau steppe,
   textured via Shumari ground PBR + KGROUND hex-tiled triplanar layers), draws the 3 confluence rivers + mill-race leat
   via core/water, populates SITES with the 52 hero landmarks, instances ~1,783 city & ring buildings sharing MAT[mk],
   builds battered basalt ishigaki plinths, stone arch bridges, the Sullam al-Gedu compound stair, draped streets, and
   KCONS + KCITY.constructMesh building sites, and binds AM_SIM. */

SM_SM6 = qs.get('sm6') !== '0';
if (!SM_SM6) {
  if (MAT.bronzeCast) { MAT.bronzeCast.roughness = 0.42; MAT.bronzeCast.metalness = 0.68; }
  if (MAT.bronze) { MAT.bronze.roughness = 0.36; MAT.bronze.metalness = 0.74; }
  if (MAT.brass) { MAT.brass.roughness = 0.38; MAT.brass.metalness = 0.75; }
  if (MAT.gold) { MAT.gold.roughness = 0.26; MAT.gold.metalness = 0.84; }
  if (MAT.tracery) { MAT.tracery.roughness = 0.45; MAT.tracery.metalness = 0.50; }
  if (MAT.iron) { MAT.iron.roughness = 0.52; MAT.iron.metalness = 0.55; }
  if (typeof svHwMat === 'function') { const hw = svHwMat(); hw.roughness = 0.32; hw.metalness = 0.85; }
}

/* 1. Camera far plane, dynamic near plane, and crisp 1.06 atm highland sky/haze */
camera.far = 36000;
camera.updateProjectionMatrix();
SKY.dens = 0.88;
SKY.hour = qs.get('hour') ? +qs.get('hour') : 9.6;
scene.fog.density = 0.00018;
skyApply();

FRAME_HOOKS.push(function amNearPlane() {
  const gy = amaroH(camera.position.x, camera.position.z);
  const alt = Math.max(2, camera.position.y - gy);
  const nr = clamp(alt * 0.035, 0.15, 22);
  if (Math.abs(nr - camera.near) > camera.near * 0.15) {
    camera.near = nr;
    camera.updateProjectionMatrix();
  }
});

/* Remove flat sheet placeholder ground */
if (typeof groundM !== 'undefined' && groundM) {
  scene.remove(groundM);
}

/* 2. Multi-tier textured terrain (TERR_IN + TERR_MID + TERR_FAR) & KDRAWN registration */
const AM_GROUND = (function () {
  const city = AM_CITY.get();
  const ring = AM_RING.get();

  /* Build fast spatial lookup for urban cobble ground tint */
  const cobbleSpace = KSPACE.create({ cell: 32 });
  const allWays = city.ways.concat(ring.ways);
  for (let wi = 0; wi < allWays.length; wi++) {
    const w = allWays[wi];
    const rad = (w.w == null ? 6 : w.w) * 0.65 + 3.0;
    for (let pi = 1; pi < w.pts.length; pi++) {
      const a = w.pts[pi - 1], b = w.pts[pi];
      const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const st = Math.max(1, Math.ceil(segL / 12));
      for (let s = 0; s <= st; s++) {
        const t = s / st;
        const px = a[0] + (b[0] - a[0]) * t;
        const pz = a[1] + (b[1] - a[1]) * t;
        cobbleSpace.insert({ x: px, z: pz, r: rad, hwy: w.kind === 'highway' }, px, pz, rad);
      }
    }
  }

  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.02,
    vertexColors: true
  });

  const Lg = KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, 'ground') : null;
  if (Lg) {
    const Tg = KMAT.textures(Lg, { aniso: TEXANISO });
    mat.map = Tg.map;
    mat.normalMap = Tg.normalMap;
    mat.roughnessMap = Tg.roughnessMap;
    if (mat.normalMap) {
      const ns = Lg.normalScale == null ? 0.85 : Lg.normalScale;
      mat.normalScale.set(ns, ns);
    }
    mat.userData.lib = Lg;
  }

  /* Custom ablaq cliff strata + KGROUND zone varyings */
  if (typeof KHOOK !== 'undefined') {
    KHOOK.add(mat, 'am-strata', function (sh) {
      KHOOK.v(
        sh,
        '#include <common>',
        '#include <common>\nattribute vec4 aAmGL;\nvarying vec4 vAmGL;\nvarying vec3 vAmWP;\nvarying float vAmRock;',
        'am-strata'
      );
      KHOOK.v(
        sh,
        '#include <project_vertex>',
        'vAmGL = aAmGL;\nvAmWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvAmRock = clamp(1.0 - abs(normalize(mat3(modelMatrix) * objectNormal).y), 0.0, 1.0);\n#include <project_vertex>',
        'am-strata'
      );
      const ablaqFrag = [
        '/*KGROUND*/',
        '{',
        '  float abW = smoothstep(0.28, 0.68, vAmRock) * smoothstep(244.0, 218.0, vAmWP.y);',
        '  float warp = sin(vAmWP.x * 0.0038 + vAmWP.z * 0.0029) * 5.2 + sin(vAmWP.x * 0.013 - vAmWP.z * 0.011) * 2.0;',
        '  float cyc = fract((vAmWP.y + warp) / 58.0);',
        '  float b1 = smoothstep(0.55, 0.60, cyc) * (1.0 - smoothstep(0.75, 0.79, cyc));',
        '  float b2 = smoothstep(0.82, 0.86, cyc) * (1.0 - smoothstep(0.94, 0.98, cyc));',
        '  float lime = clamp(b1 + b2, 0.0, 1.0);',
        '  float colJ = 0.86 + 0.14 * sin(vAmWP.x * 1.45 + sin(vAmWP.z * 0.7) * 1.3) * sin(vAmWP.z * 1.3);',
        '  vec3 basC = diffuseColor.rgb * vec3(0.32, 0.34, 0.39) * colJ;',
        '  float rust = smoothstep(0.45, 0.86, fract(vAmWP.x * 0.0061 - vAmWP.z * 0.0047 + cyc * 2.7));',
        '  vec3 limC = diffuseColor.rgb * mix(vec3(1.24, 1.14, 0.96), vec3(1.04, 0.68, 0.46), rust * 0.55);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, mix(basC, limC, lime), abW * 0.76);',
        '}'
      ].join('\n');
      KHOOK.f(
        sh,
        '#include <common>',
        '#include <common>\nvarying vec4 vAmGL;\nvarying vec3 vAmWP;\nvarying float vAmRock;',
        'am-strata'
      );
      KHOOK.f(
        sh,
        'void main() {',
        '#undef r0\n#undef v0\n#undef m0\n#undef r1\n#undef v1\n#undef m1\n#undef r4\n#undef v4\n#undef m4\n#undef r5\n#undef v5\n#undef m5\n#undef r6\n#undef v6\n#undef m6\nvoid main() {',
        'am-strata'
      );
      KHOOK.f(
        sh,
        '#include <map_fragment>',
        '#include <map_fragment>\n' + ablaqFrag,
        'am-strata'
      );
    }, { key: 'am-strata-v2' });

    if (typeof KGROUND !== 'undefined' && KMAT.mode === 'lib') {
      const lyPuna = KGROUND.layer('shigh', 'ground.puna', { w: 'vAmGL.x', amt: 0.58, gain: 1.22, tint: 'diffuse', name: 'plateau steppe' });
      const lyGravel = KGROUND.layer('shigh', 'ground.gravel', { w: 'vAmGL.y', amt: 0.72, gain: 1.18, tint: 'diffuse', name: 'canyon gravel' });
      const lyRock = KGROUND.layer('shigh', 'rock.basalt', { w: 'vAmGL.z', amt: 0.66, gain: 1.18, tint: 'diffuse', name: 'ablaq basalt' });
      const lyCobble = KGROUND.layer('shumari', 'cobble', { w: 'vAmGL.w', amt: 0.74, gain: 1.12, tint: 'diffuse', name: 'city cobble' });
      KGROUND.hook(mat, {
        key: 'amaro',
        layers: [lyPuna, lyGravel, lyRock, lyCobble],
        tri: true,
        relief: { bump: 0.045, cavity: 0.48 }
      });
    }
  }

  const cLoess = SRGB2LIN(new THREE.Color(0xa69464));
  const cOlive = SRGB2LIN(new THREE.Color(0x868250));
  const cStraw = SRGB2LIN(new THREE.Color(0xbca772));
  const cGravel = SRGB2LIN(new THREE.Color(0x8a8376));
  const cSeep = SRGB2LIN(new THREE.Color(0x4f5f3d));
  const cBasalt = SRGB2LIN(new THREE.Color(0x363840));
  const cLime = SRGB2LIN(new THREE.Color(0xc8b696));
  const cUrban = SRGB2LIN(new THREE.Color(0x9a9182));
  const cTmp = new THREE.Color();
  const cRock = new THREE.Color();

  const scaleUV = Lg && Lg.scale ? Lg.scale[0] : 3.2;

  function buildTerrainPatch(name, cx, cz, size, segs, holeBox, sinkM) {
    const g = new THREE.PlaneGeometry(size, size, segs, segs);
    g.rotateX(-PI / 2);
    const P = g.attributes.position;
    const U = g.attributes.uv;
    const col = new Float32Array(P.count * 3);
    const gl = new Float32Array(P.count * 4);

    for (let i = 0; i < P.count; i++) {
      const wx = P.getX(i) + cx;
      const wz = P.getZ(i) + cz;
      let wy = amaroH(wx, wz);
      if (holeBox && wx > holeBox[0] && wx < holeBox[2] && wz > holeBox[1] && wz < holeBox[3]) {
        wy -= sinkM;
      }
      P.setXYZ(i, wx, wy, wz);
      U.setXY(i, wx / scaleUV, wz / scaleUV);

      const sl = amaroSlope(wx, wz, size > 6000 ? 16 : 4);
      const tier = AM.tierAt(wx, wz);
      const wt = amaroWater(wx, wz);
      const n1 = KRAND.fbm(wx * 0.0042 + 2.3, wz * 0.0042 - 4.1, 0, 2, 7401);
      const n2 = KRAND.fbm(wx * 0.013 - 1.7, wz * 0.013 + 5.2, 0, 2, 7402);

      const rk = clamp(smooth(0.38, 0.85, sl), 0, 1);
      let urb = (tier === 'upper' || tier === 'citadel' || tier === 'customs' || tier === 'necropolis') && rk < 0.35 ? 0.55 : 0;
      if (size <= 4000) {
        const hits = cobbleSpace.query(wx, wz, 18);
        for (let hi = 0; hi < hits.length; hi++) {
          const d = Math.hypot(wx - hits[hi].x, wz - hits[hi].z);
          if (d < hits[hi].r) {
            urb = Math.max(urb, hits[hi].hwy ? 0.45 : 0.92);
          }
        }
      }
      const gr = clamp((wt.wet ? 0.95 : 0) + (wy < 42 ? 0.72 : 0) + ((tier === 'ledge1' || tier === 'ledge2' || tier === 'gisr') ? 0.58 : 0), 0, 1) * (1 - rk * 0.75);
      const bn = clamp((1 - rk) * (1 - gr * 0.8) * (1 - urb * 0.85), 0, 1);

      cTmp.copy(cLoess).lerp(cOlive, smooth(0.36, 0.68, n1) * 0.72).lerp(cStraw, smooth(0.50, 0.78, n2) * 0.48);
      cTmp.lerp(cGravel, gr * 0.82);
      if (wt.wet || (wy < 32 && n1 > 0.54)) cTmp.lerp(cSeep, 0.42);
      if (urb > 0.05) cTmp.lerp(cUrban, urb * 0.78);

      const cyc = (((wy + n1 * 9) % 58) + 58) % 58 / 58;
      const bed = smooth(0.54, 0.64, cyc) * (1 - smooth(0.92, 0.98, cyc));
      cRock.copy(cBasalt).lerp(cLime, bed);
      cTmp.lerp(cRock, rk * 0.88);

      col[i * 3] = cTmp.r;
      col[i * 3 + 1] = cTmp.g;
      col[i * 3 + 2] = cTmp.b;

      gl[i * 4] = bn;
      gl[i * 4 + 1] = gr;
      gl[i * 4 + 2] = rk;
      gl[i * 4 + 3] = urb * (1 - rk);
    }

    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aAmGL', new THREE.BufferAttribute(gl, 4));
    g.computeVertexNormals();
    g.computeBoundingSphere();

    const m = new THREE.Mesh(g, mat);
    m.name = name;
    m.receiveShadow = size <= 4000;
    m.userData.isGround = true;
    scene.add(m);
    return m;
  }

  /* High-resolution 8.3 m canyon-lip, shelves & eastern switchback patch (2000x2000 m at 240x240) */
  const clCx = 140, clCz = -560, clSize = 2000, clSegs = 240;
  const terrCliff = buildTerrainPatch('terrain:cliff', clCx, clCz, clSize, clSegs, null, 0);
  const clMargin = 55;
  const cliffHole = [clCx - clSize * 0.5 + clMargin, clCz - clSize * 0.5 + clMargin, clCx + clSize * 0.5 - clMargin, clCz + clSize * 0.5 - clMargin];

  /* Inner city + plateau patch (3400x3400 m at 256x256) */
  const inCx = 0, inCz = -180, inSize = 3400, inSegs = 256;
  const terrIn = buildTerrainPatch('terrain:inner', inCx, inCz, inSize, inSegs, cliffHole, 18);
  const inMargin = 85;
  const inHole = [inCx - inSize * 0.5 + inMargin, inCz - inSize * 0.5 + inMargin, inCx + inSize * 0.5 - inMargin, inCz + inSize * 0.5 - inMargin];

  /* Mid plateau + ring hamlet patch (10400x10400 m) */
  const midSize = 10400;
  const terrMid = buildTerrainPatch('terrain:mid', 0, 120, midSize, 136, inHole, 22);
  const midHole = [-midSize * 0.5 + 240, 120 - midSize * 0.5 + 240, midSize * 0.5 - 240, 120 + midSize * 0.5 - 240];

  /* Far highland horizon skirt (26000x26000 m) */
  const terrFar = buildTerrainPatch('terrain:far', 0, 200, 26000, 84, midHole, 48);

  /* Build grid height arrays and exact PlaneGeometry triangle-surface evaluator meshH(x, z) so roads/stairs never float */
  function makeGridSampler(cx, cz, size, segs) {
    const x0 = cx - size * 0.5, z0 = cz - size * 0.5;
    const dx = size / segs, dz = size / segs;
    const hArr = new Float32Array((segs + 1) * (segs + 1));
    for (let j = 0; j <= segs; j++) {
      for (let i = 0; i <= segs; i++) {
        hArr[j * (segs + 1) + i] = amaroH(x0 + i * dx, z0 + j * dz);
      }
    }
    function triH(x, z) {
      const u = (x - x0) / dx, v = (z - z0) / dz;
      if (u < 0 || v < 0 || u > segs || v > segs) return null;
      const i = Math.min(segs - 1, Math.floor(u));
      const j = Math.min(segs - 1, Math.floor(v));
      const fx = u - i, fz = v - j;
      const stride = segs + 1;
      const h00 = hArr[j * stride + i];
      const h10 = hArr[j * stride + i + 1];
      const h01 = hArr[(j + 1) * stride + i];
      const h11 = hArr[(j + 1) * stride + i + 1];
      /* Matches THREE.PlaneGeometry quad diagonal (i,j+1)-(i+1,j) */
      if (fx + fz <= 1) {
        return h00 + fx * (h10 - h00) + fz * (h01 - h00);
      }
      return h11 + (1 - fx) * (h01 - h11) + (1 - fz) * (h10 - h11);
    }
    return { x0: x0, z0: z0, dx: dx, dz: dz, nx: segs, nz: segs, h: hArr, triH: triH };
  }

  const cliffGrid = makeGridSampler(clCx, clCz, clSize, clSegs);
  const innerGrid = makeGridSampler(inCx, inCz, inSize, inSegs);

  function meshH(x, z) {
    if (x > cliffHole[0] && x < cliffHole[2] && z > cliffHole[1] && z < cliffHole[3]) {
      const ch = cliffGrid.triH(x, z);
      if (ch != null) return ch;
    }
    const ih = innerGrid.triH(x, z);
    return ih != null ? ih : amaroH(x, z);
  }

  if (typeof KDRAWN !== 'undefined') {
    KDRAWN.clear();
    KDRAWN.add(KDRAWN.grid(cliffGrid));
    KDRAWN.add(KDRAWN.grid(innerGrid));
  }

  return { mat: mat, cliff: terrCliff, inner: terrIn, mid: terrMid, far: terrFar, meshH: meshH };
})();

/* 3. Confluence rivers (Betun-Narun r007, Payaru-Buruqu r288, Qappu-Narun r287) + mill-race leat + Meydan pool */
const AM_WATER = (function () {
  if (typeof WATER === 'undefined' || !WATER.flow || !WATER.drawFlow) return { flows: [], still: null };
  WATER.surfaces.length = 0;
  if (WATER.drawn) WATER.drawn.length = 0;

  const flows = [];
  const mouths = [[40, -915, 28], [-210, -870, 24]];
  for (let i = 0; i < AM.RIVERS.length; i++) {
    const R = AM.RIVERS[i];
    const lift = R.leat ? 0.25 : 0.42;
    const pts = R.pts.map(p => [p[0], p[1], p[2] + lift]);
    const widths = R.pts.map(p => p[3]);
    const S = WATER.flow({
      name: R.name,
      pts: pts,
      width: widths,
      speed: R.leat ? 1.9 : 2.7,
      densify: 18,
      rapids: [0.008, 0.036]
    });
    const D = WATER.drawFlow(S, {
      THREE: THREE,
      scene: scene,
      shallow: R.leat ? 0x5d857a : 0x548078,
      deep: 0x1a3c44,
      mouths: R.leat ? null : mouths,
      step: 10,
      across: R.leat ? 5 : 8,
      margin: R.leat ? 0.6 : 1.8,
      renderOrder: 1
    });
    flows.push(D);
  }

  /* Reflective Mamluk sabil pool in the Upper City Lip Meydan */
  let still = null;
  if (WATER.still && WATER.drawStill) {
    const py = amaroH(0, -390) + 0.24;
    const pool = WATER.still({
      name: 'Lip Meydan Sabil Basin',
      level: py,
      bounds: [-6.2, -396.2, 6.2, -383.8],
      fountain: [0, -390]
    });
    still = WATER.drawStill(pool, {
      THREE: THREE,
      scene: scene,
      color: 0x1f4946,
      roughness: 0.05,
      metalness: 0.16,
      renderOrder: 2
    });
  }

  return { flows: flows, still: still };
})();

/* 4. Prototype builder for instanced non-hero lots, unit plinths, and KCITY.constructMesh sites */
const AM_PROTOS = {};
function amBucketToGeo(b) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3));
  if (b.f) g.setAttribute('aFlut', new THREE.Float32BufferAttribute(b.f, 3));
  if (b.k) {
    /* Disable cut-away on background instanced shells so cutSet only opens hero buildings */
    for (let ki = 3; ki < b.k.length; ki += 4) b.k[ki] = 0;
    g.setAttribute('aCut', new THREE.Float32BufferAttribute(b.k, 4));
  }
  if (b.w) g.setAttribute('aFlk', new THREE.Float32BufferAttribute(b.w, 1));
  g.setIndex(b.p.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.i, 1) : new THREE.Uint16BufferAttribute(b.i, 1));
  g.computeBoundingSphere();
  return g;
}

function amMakeUnitBoxGeo(mk, hex) {
  const uB = {}, keepT = GTARGET, keepTris = GSTAT.tris;
  GTARGET = uB;
  resetCM();
  try {
    svNoWalk(() => {
      box(mk, 0, 0, 0, 1, 1, 1, hex);
    });
  } finally {
    GTARGET = keepT;
    GSTAT.tris = keepTris;
    resetCM();
  }
  return uB[mk] ? amBucketToGeo(uB[mk]) : null;
}

function amGetProto(key, v) {
  const vk = key + '#' + (v | 0);
  if (AM_PROTOS[vk]) return AM_PROTOS[vk];
  const d = DEFS[key];
  if (!d) return null;

  const pB = {};
  const keepT = GTARGET, keepDry = PLACE_DRY, keepTris = GSTAT.tris;
  const keepDomeLen = SM_DOMES.length;
  GTARGET = pB;
  PLACE_DRY = 1;
  resetCM();
  let rec = null;
  let domeTemplates = [];
  try {
    svNoWalk(() => {
      rec = place(key, 0, 0, 0, { v: v | 0, y: 0 });
    });
    domeTemplates = SM_DOMES.slice(keepDomeLen);
    SM_DOMES.length = keepDomeLen;
  } finally {
    PLACE_DRY = keepDry;
    GTARGET = keepT;
    GSTAT.tris = keepTris;
    resetCM();
  }

  const parts = [];
  let tris = 0;
  for (const mk in pB) {
    const b = pB[mk];
    if (!b.i.length || !MAT[mk]) continue;
    const g = amBucketToGeo(b);
    const nt = b.i.length / 3;
    tris += nt;
    parts.push({ mk: mk, geo: g, mat: MAT[mk], tris: nt });
  }

  const proto = { key: key, v: v | 0, parts: parts, tris: tris, rec: rec, domes: domeTemplates };
  AM_PROTOS[vk] = proto;
  return proto;
}

/* 5. Populate SITES with the 52 hero landmarks before 92-world.js runs buildWorld() */
const AM_HERO_LOTS = AM_CITY.get().lots.filter(b => b.hero && !b.vacant && DEFS[b.key]);
SITES.length = 0;
for (let i = 0; i < AM_HERO_LOTS.length; i++) {
  const b = AM_HERO_LOTS[i];
  SITES.push({
    key: b.key,
    x: b.x,
    z: b.z,
    ry: b.ry,
    o: { v: b.v | 0, y: b.y, name: b.why || undefined },
    _lot: b
  });
}

/* 6. Wrap buildWorld() to assemble masonry bridges, cliff stairs, draped ways, instanced districts & construction sites */
const amPrevBuildWorld = buildWorld;
buildWorld = function () {
  SM_DOMES.length = 0;
  const w = amPrevBuildWorld();
  if (!w || PLACE_DRY) return w;

  const city = AM_CITY.get();
  const ring = AM_RING.get();
  const allLots = city.lots.concat(ring.lots);

  /* 6a. Draped masonry infrastructure: Payaru-Gisr stone arch bridge, Citadel causeway, Sullam al-Gedu stair, Lip Meydan & ways */
  const infB = {}, prevT = GTARGET;
  GTARGET = infB;
  resetCM();
  let infraTris = 0;

  /* Payaru-Gisr fortified confluence bridge across Betun-Narun (x = 60, z = -964..-876) */
  {
    const bx = 60, zA = -964, zB = -876, deckY = 5.4, bw = 9.6;
    const span = zB - zA;
    box('cobble', bx, deckY - 0.35, (zA + zB) * 0.5, bw, 0.42, span, P('cobble'));
    box('paving', bx, deckY + 0.04, (zA + zB) * 0.5, bw - 1.4, 0.06, span - 1.0, P('paving'));
    for (const sx of [-bw * 0.5 + 0.32, bw * 0.5 - 0.32]) {
      box('basalt', bx + sx, deckY + 0.04, (zA + zB) * 0.5, 0.56, 0.72, span, P('basalt'));
      box('travertine', bx + sx, deckY + 0.76, (zA + zB) * 0.5, 0.62, 0.28, span, P('travertine'));
    }
    const piers = [-944, -928, -912, -896];
    for (let pi = 0; pi < piers.length; pi++) {
      const pz = piers[pi];
      const footY = Math.min(-2.4, amaroH(bx, pz) - 0.6);
      const ph = deckY - 0.3 - footY;
      box('basalt', bx, footY, pz, bw + 1.4, ph, 3.6, P('basaltDark'));
      cyl('basalt', bx - bw * 0.5 - 0.55, footY, pz, 1.45, ph * 0.88, P('basalt'), 6);
      cyl('basalt', bx + bw * 0.5 + 0.55, footY, pz, 1.45, ph * 0.88, P('basalt'), 6);
      box('travertine', bx, deckY - 1.15, pz, bw + 1.6, 0.42, 3.9, P('travertine'));
    }
    for (const [z0, z1] of [[-986, zA], [zB, -854]]) {
      const steps = 8;
      for (let s = 0; s < steps; s++) {
        const u0 = s / steps, u1 = (s + 1) / steps;
        const zm = z0 + (z1 - z0) * (u0 + u1) * 0.5;
        const y0 = z0 < zA ? amaroH(bx, z0) : deckY;
        const y1 = z0 < zA ? deckY : amaroH(bx, z1);
        const ym = y0 + (y1 - y0) * (u0 + u1) * 0.5;
        const dz = Math.abs(z1 - z0) / steps + 0.35;
        const foot = amaroH(bx, zm) - 0.8;
        box('rubble', bx, foot, zm, bw + 0.8, Math.max(0.6, ym - foot), dz, P('rubble'));
        box('cobble', bx, ym, zm, bw - 0.4, 0.14, dz, P('cobble'));
      }
    }
  }

  /* Qappu al-Subaru Citadel dry-fosse causeway bridge (x = -568..-488, z = -265) */
  {
    const xA = -568, xB = -488, cz = -265, cw = 8.4;
    const segs = 12;
    for (let s = 0; s < segs; s++) {
      const u = (s + 0.5) / segs;
      const cx = xA + (xB - xA) * u;
      const deckY = 261.2 + (241.0 - 261.2) * u;
      const gy = amaroH(cx, cz);
      const ph = Math.max(1.2, deckY - gy + 0.6);
      const dx = (xB - xA) / segs + 0.35;
      if (s % 2 === 0) {
        box('basalt', cx, gy - 0.6, cz, 3.2, ph, cw + 0.8, P('basaltDark'));
        box('travertine', cx, deckY - 1.2, cz, dx, 0.42, cw + 0.9, P('travertine'));
      } else {
        box('basalt', cx, deckY - 1.6, cz, dx, 1.6, cw + 0.4, P('basalt'));
      }
      box('cobble', cx, deckY, cz, dx, 0.18, cw - 0.6, P('cobble'));
      box('ironstone', cx, deckY + 0.18, cz - cw * 0.5 + 0.25, dx, 0.78, 0.46, P('ironstone'));
      box('ironstone', cx, deckY + 0.18, cz + cw * 0.5 - 0.25, dx, 0.78, 0.46, P('ironstone'));
    }
  }

  /* Sullam al-Gedu compound Giant + human rock-cut stair, Lip Meydan, rim parapets & draped streets */
  svNoWalk(() => {
    const mH = AM_GROUND.meshH;
    const cs = AM.COMPOUND_STAIR;
    for (let i = 1; i < cs.length; i++) {
      const a = cs[i - 1], b = cs[i];
      const dxSeg = b[0] - a[0], dzSeg = b[1] - a[1];
      const segL = Math.hypot(dxSeg, dzSeg);
      if (segL < 0.5) continue;
      const isFlight = Math.abs(b[2] - a[2]) > 6.0;
      const stepTarget = isFlight ? 3.5 : 8.0;
      const nFlights = Math.max(2, Math.ceil(segL / stepTarget));
      const yaw = Math.atan2(dxSeg, dzSeg);
      const nx = Math.cos(yaw), nz = -Math.sin(yaw);
      const halfW = 3.4;

      for (let f = 0; f < nFlights; f++) {
        const u0 = f / nFlights, u1 = (f + 1) / nFlights;
        const x0 = a[0] + dxSeg * u0, z0 = a[1] + dzSeg * u0;
        const x1 = a[0] + dxSeg * u1, z1 = a[1] + dzSeg * u1;
        const sx = (x0 + x1) * 0.5, sz = (z0 + z1) * 0.5;
        const stepRun = segL / nFlights;

        const c0 = mH(x0, z0), c1 = mH(x1, z1), cm = mH(sx, sz);
        const c0L = mH(x0 - nx * halfW, z0 - nz * halfW), c0R = mH(x0 + nx * halfW, z0 + nz * halfW);
        const c1L = mH(x1 - nx * halfW, z1 - nz * halfW), c1R = mH(x1 + nx * halfW, z1 + nz * halfW);

        const lift = isFlight ? 0.32 : 0.10;
        const y0 = Math.max(c0, c0L, c0R) + lift;
        const y1 = Math.max(c1, c1L, c1R) + lift;
        const ym = Math.max((y0 + y1) * 0.5, cm + lift * 0.6);
        const dy = y1 - y0;
        const pitch = -Math.atan2(dy, stepRun);
        const slopeL = Math.hypot(dy, stepRun) + 0.36;

        /* Ground-locked vertical basalt masonry pier extending 3.5 m below the lowest rendered mesh corner */
        const minG = Math.min(c0, c1, cm, c0L, c0R, c1L, c1R);
        const pierBot = minG - 3.5;
        const pierTop = Math.min(y0, y1) + 0.05;
        const pierH = Math.max(1.6, pierTop - pierBot);
        W(sx, pierBot, sz, yaw, () => {
          box('basalt', 0, 0, 0, 6.8, pierH, stepRun + 0.45, P('basaltDark'));
        });

        /* Pitched tread deck + Giant central spine + human side treads + ironstone parapets */
        WX(sx, ym, sz, yaw, pitch, 0, () => {
          box('basalt', 0, -0.55, 0, 6.6, 0.55, slopeL, P('basalt'));
          box('travertine', 0, 0, 0, 3.2, 0.22, slopeL, P('travertine'));
          box('paving', -2.15, -0.02, 0, 1.25, 0.20, slopeL, P('paving'));
          box('paving', 2.15, -0.02, 0, 1.25, 0.20, slopeL, P('paving'));
          if (isFlight) {
            box('ironstone', -3.08, 0, 0, 0.44, 0.88, slopeL, P('ironstone'));
            box('ironstone', 3.08, 0, 0, 0.44, 0.88, slopeL, P('ironstone'));
          }
        });
      }
    }

    /* Lip Meydan ceremonial ablaq star court & Sabil basin curb (0, -390) */
    {
      const my = mH(0, -390);
      box('paving', 0, my + 0.02, -390, 82, 0.08, 72, P('paving'));
      box('basalt', 0, my + 0.05, -390, 48, 0.07, 48, P('basalt'));
      box('travertine', 0, my + 0.08, -390, 44, 0.07, 44, P('travertine'));
      box('basalt', 0, my + 0.09, -396.5, 13.4, 0.48, 0.65, P('basaltDark'));
      box('basalt', 0, my + 0.09, -383.5, 13.4, 0.48, 0.65, P('basaltDark'));
      box('basalt', -6.4, my + 0.09, -390, 0.65, 0.48, 12.4, P('basaltDark'));
      box('basalt', 6.4, my + 0.09, -390, 0.65, 0.48, 12.4, P('basaltDark'));
      cyl('bronzeCast', 0, my + 0.10, -390, 0.55, 1.35, P('bronze'), 12);
    }

    /* Cliff-lip ablaq parapet walls along Upper City North Rim (z = -436) and Customs Shelf Rim (z = -638) */
    for (let rx = -430; rx <= 430; rx += 12) {
      if (Math.abs(rx - 0) < 10 || Math.abs(rx - 96) < 14 || Math.abs(rx + 372) < 12 || Math.abs(rx + 182) < 12 ||
          Math.abs(rx - 205) < 12 || Math.abs(rx - 368) < 12) continue;
      const py = mH(rx, -436);
      if (py < 232) continue;
      box('basalt', rx, py - 2.2, -436, 11.8, 3.05, 0.75, P('basalt'));
      box('travertine', rx, py + 0.85, -436, 11.9, 0.32, 0.82, P('travertine'));
    }
    for (let cx = 148; cx <= 398; cx += 12) {
      const py = mH(cx, -638);
      if (py < 194) continue;
      box('basalt', cx, py - 2.2, -638, 11.8, 2.95, 0.72, P('basalt'));
      box('travertine', cx, py + 0.75, -638, 11.9, 0.30, 0.78, P('travertine'));
    }

    /* Helper: check if a street segment duplicates an active Darb al-Kir switchback segment */
    function onSwitchback(x, z) {
      const sw = AM.SWITCHBACK;
      for (let k = 1; k < sw.length; k++) {
        if (AM.segDist(x, z, sw[k - 1][0], sw[k - 1][1], sw[k][0], sw[k][1])[0] < 3.2) return true;
      }
      return false;
    }

    /* Draped stone ribbons & retaining walls for AM.SWITCHBACK (cls: 'highway') + avenue/main ways */
    const waysToDrape = city.ways.filter(wy => {
      const c = wy.cls || wy.kind;
      return c === 'avenue' || c === 'main' || c === 'highway';
    });
    for (let wi = 0; wi < waysToDrape.length; wi++) {
      const wy = waysToDrape[wi];
      const wCls = wy.cls || wy.kind;
      const ww = wy.w == null ? 8 : wy.w;
      const mk = wCls === 'avenue' ? 'paving' : 'cobble';
      const colP = P(mk);
      for (let pi = 1; pi < wy.pts.length; pi++) {
        const a = wy.pts[pi - 1], b = wy.pts[pi];
        const dxSeg = b[0] - a[0], dzSeg = b[1] - a[1];
        const segL = Math.hypot(dxSeg, dzSeg);
        if (segL < 0.5) continue;
        const mx = (a[0] + b[0]) * 0.5, mz = (a[1] + b[1]) * 0.5;
        if ((Math.abs(mx - 60) < 18 && mz < -870 && mz > -970) || (mx < -485 && mx > -575 && Math.abs(mz + 265) < 18)) continue;
        if (wCls !== 'highway' && onSwitchback(mx, mz)) continue;

        const maxStep = wCls === 'highway' ? 8.0 : 12.0;
        const steps = Math.max(1, Math.ceil(segL / maxStep));
        const yaw = Math.atan2(dxSeg, dzSeg);
        const nx = Math.cos(yaw), nz = -Math.sin(yaw);
        /* Chasm-facing (+1 or -1) side along local X so parapets always stand on the downhill/north cliff brink */
        const brinkSign = nz <= 0 ? 1 : -1;

        for (let s = 0; s < steps; s++) {
          const u0 = s / steps, u1 = (s + 1) / steps;
          const x0 = a[0] + dxSeg * u0, z0 = a[1] + dzSeg * u0;
          const x1 = a[0] + dxSeg * u1, z1 = a[1] + dzSeg * u1;
          const xm = (x0 + x1) * 0.5, zm = (z0 + z1) * 0.5;
          const stepRun = segL / steps;

          if (wCls === 'highway') {
            const hw = ww * 0.5 + 0.5;
            const c0 = mH(x0, z0), c1 = mH(x1, z1), cm = mH(xm, zm);
            const c0L = mH(x0 - nx * hw, z0 - nz * hw), c0R = mH(x0 + nx * hw, z0 + nz * hw);
            const c1L = mH(x1 - nx * hw, z1 - nz * hw), c1R = mH(x1 + nx * hw, z1 + nz * hw);
            /* Deck sits cleanly at centerline / uphill shoulder without floating above downhill slope */
            const y0 = Math.max(c0, cm - Math.abs(c1 - c0) * 0.6) + 0.12;
            const y1 = Math.max(c1, cm - Math.abs(c1 - c0) * 0.6) + 0.12;
            const dy = y1 - y0;
            const ym = Math.max((y0 + y1) * 0.5, cm + 0.10);
            const pitch = -Math.atan2(dy, stepRun);
            const slopeL = Math.hypot(dy, stepRun) + 0.42;

            const minG = Math.min(c0, c1, cm, c0L, c0R, c1L, c1R);
            const wallBot = minG - 3.6;
            const wallTop = Math.min(y0, y1) + 0.02;
            const wallH = clamp(wallTop - wallBot, 1.8, 28.0);

            /* World-vertical battered rubble & basalt retaining breastwall rooted into the cliff triangles */
            W(xm, wallTop - wallH, zm, yaw, () => {
              box('rubble', 0, 0, 0, ww + 1.5, wallH, stepRun + 0.55, P('rubble'));
              if (wallH > 4.5) {
                box('travertine', 0, wallH - 1.1, 0, ww + 1.65, 0.34, stepRun + 0.58, P('travertine'));
              }
            });

            /* Pitched cobbled carriage-way & chasm-brink basalt guard parapet */
            WX(xm, ym, zm, yaw, pitch, 0, () => {
              box('basalt', 0, -0.42, 0, ww + 0.8, 0.42, slopeL, P('basalt'));
              box('cobble', 0, 0, 0, ww, 0.12, slopeL, P('cobble'));
              if (zm < -438 && zm > -860) {
                const px = brinkSign * (ww * 0.5 + 0.24);
                box('basalt', px, 0.04, 0, 0.48, 0.78, slopeL, P('basalt'));
                box('travertine', px, 0.82, 0, 0.54, 0.18, slopeL, P('travertine'));
              }
            });
          } else {
            /* Terrain KGROUND already paints lyCobble along streets; add only a subtle flush stone threshold */
            const y0 = mH(x0, z0), y1 = mH(x1, z1), ym = mH(xm, zm);
            const dy = y1 - y0;
            const pitch = -Math.atan2(dy, stepRun);
            const slopeL = Math.hypot(dy, stepRun) + 0.30;
            const deckY = Math.max((y0 + y1) * 0.5, ym) + 0.03;
            WX(xm, deckY, zm, yaw, pitch, 0, () => {
              box('paving', 0, -0.18, 0, ww * 0.68, 0.20, slopeL, colP);
            });
          }
        }
      }
    }
  });

  GTARGET = prevT;
  infraTris = Math.round(GSTAT.tris);
  flushBuckets(infB, w, true);

  /* 6b. Register non-hero & vacant lots in SVTAGS BEFORE drawing, and group instanced lots + plinths */
  const groups = {};
  const plinths = [];
  const vacants = [];
  let instancedCount = 0;
  let instancedTris = 0;

  for (let i = 0; i < allLots.length; i++) {
    const b = allLots[i];
    const d = DEFS[b.key];
    if (!d) continue;

    const drop = b.drop == null ? 0 : b.drop;
    let meshDrop = 0;
    if (!b.vacant && b.z < -380 && b.z > -1150) {
      const cYaw = Math.cos(b.ry || 0), sYaw = Math.sin(b.ry || 0);
      const hw = d.w * 0.5, hd = d.d * 0.5;
      const mMin = Math.min(
        AM_GROUND.meshH(b.x - cYaw * hw - sYaw * hd, b.z + sYaw * hw - cYaw * hd),
        AM_GROUND.meshH(b.x + cYaw * hw - sYaw * hd, b.z - sYaw * hw - cYaw * hd),
        AM_GROUND.meshH(b.x - cYaw * hw + sYaw * hd, b.z + sYaw * hw + cYaw * hd),
        AM_GROUND.meshH(b.x + cYaw * hw + sYaw * hd, b.z - sYaw * hw + cYaw * hd)
      );
      meshDrop = Math.max(0, b.y - mMin);
    }
    const effDrop = Math.max(drop, meshDrop);
    if (!b.vacant && (effDrop > 0.14 || b.district === 'customs' || b.district === 'forges' || b.district === 'necropolis' || b.district === 'gisr')) {
      const ph = Math.max(0.65, effDrop + 0.75);
      plinths.push({ x: b.x, y: b.y - ph, z: b.z, ry: b.ry, w: d.w + 0.9, h: ph, d: d.d + 0.9 });
    }

    if (b.hero && !b.vacant) continue;

    if (SVTAGS) {
      SVTAGS.add({
        'class': d.cls,
        kind: d.kind || d.key,
        key: d.key,
        name: b.why || d.name,
        at: [b.x, b.y, b.z],
        ry: b.ry,
        size: [d.w, d.d, d.h],
        tags: Object.assign({}, d.tags),
        note: b.vacant ? 'under construction' : (b.workId || b.district || ''),
        frag: 'settlements/shumar'
      });
    }

    if (b.vacant) {
      if (vacants.length < 12) vacants.push(b);
      continue;
    }

    const gk = (b.district === 'ring' ? 'ring:' : 'town:') + b.key + '#' + (b.v | 0);
    (groups[gk] || (groups[gk] = [])).push(b);
    instancedCount++;
  }

  /* Emit InstancedMeshes per (scope, key, v, mk) sharing MAT[mk] */
  const dummyM = new THREE.Matrix4();
  const dummyQ = new THREE.Quaternion();
  const dummyP = new THREE.Vector3();
  const dummyS = new THREE.Vector3(1, 1, 1);
  const dummyE = new THREE.Euler();
  const shadowMks = { basalt: 1, plaster: 1 };

  for (const gk in groups) {
    const list = groups[gk];
    const b0 = list[0];
    const isRing = b0.district === 'ring';
    const proto = amGetProto(b0.key, b0.v | 0);
    if (!proto) continue;

    if (proto.domes && proto.domes.length) {
      for (let li = 0; li < list.length; li++) {
        for (let di = 0; di < proto.domes.length; di++) {
          SM_DOMES.push(Object.assign({}, proto.domes[di]));
        }
      }
    }

    for (let pi = 0; pi < proto.parts.length; pi++) {
      const pt = proto.parts[pi];
      const im = new THREE.InstancedMesh(pt.geo, pt.mat, list.length);
      im.frustumCulled = false;
      const shd = pt.mk !== 'glass' && pt.mk !== 'glow' && pt.mk !== 'water' && !(pt.mat.userData && pt.mat.userData.kglass);
      im.castShadow = !isRing && shd && !!shadowMks[pt.mk];
      im.receiveShadow = shd;
      im.userData = { mk: pt.mk, amInstanced: true, key: proto.key, v: proto.v, recs: list };
      for (let li = 0; li < list.length; li++) {
        const it = list[li];
        dummyQ.setFromEuler(dummyE.set(0, it.ry || 0, 0, 'YXZ'));
        dummyP.set(it.x, it.y, it.z);
        dummyM.compose(dummyP, dummyQ, dummyS);
        im.setMatrixAt(li, dummyM);
      }
      im.instanceMatrix.needsUpdate = true;
      w.add(im);
      instancedTris += pt.tris * list.length;
    }
  }

  /* Emit battered highland basalt ishigaki plinths + travertine coping courses with full vertex colours & UVs */
  if (plinths.length > 0 && MAT.rubble && MAT.travertine) {
    const gBase = amMakeUnitBoxGeo('rubble', SVPAL.rubble[0]);
    const gCap = amMakeUnitBoxGeo('travertine', SVPAL.travertine[0]);
    if (gBase && gCap) {
      const imBase = new THREE.InstancedMesh(gBase, MAT.rubble, plinths.length);
      const imCap = new THREE.InstancedMesh(gCap, MAT.travertine, plinths.length);
      imBase.frustumCulled = false;
      imCap.frustumCulled = false;
      imBase.castShadow = false;
      imBase.receiveShadow = true;
      imCap.castShadow = false;
      imCap.receiveShadow = true;
      imBase.userData = { mk: 'rubble', amPlinth: true };
      imCap.userData = { mk: 'travertine', amPlinth: true };

      const scV = new THREE.Vector3();
      for (let i = 0; i < plinths.length; i++) {
        const pl = plinths[i];
        dummyQ.setFromEuler(dummyE.set(0, pl.ry || 0, 0, 'YXZ'));
        dummyP.set(pl.x, pl.y, pl.z);
        scV.set(pl.w, pl.h, pl.d);
        dummyM.compose(dummyP, dummyQ, scV);
        imBase.setMatrixAt(i, dummyM);

        dummyP.set(pl.x, pl.y + pl.h - 0.14, pl.z);
        scV.set(pl.w + 0.16, 0.16, pl.d + 0.16);
        dummyM.compose(dummyP, dummyQ, scV);
        imCap.setMatrixAt(i, dummyM);
      }
      imBase.instanceMatrix.needsUpdate = true;
      imCap.instanceMatrix.needsUpdate = true;
      w.add(imBase);
      w.add(imCap);
      instancedTris += plinths.length * 24;
    }
  }

  /* 6c. Active construction sites (vacant: true lots) with KCONS.libMats('construction') + KCITY.constructMesh */
  const consMats = (typeof KCONS !== 'undefined' && KCONS.libMats) ? KCONS.libMats('construction') : null;
  let consBuilt = 0;
  if (typeof KCONS !== 'undefined' && KCONS.site) {
    for (let i = 0; i < vacants.length; i++) {
      const b = vacants[i];
      const d = DEFS[b.key];
      if (!d) continue;
      const prog = b.progress == null ? 0.45 : b.progress;
      const site = KCONS.site({
        w: d.w,
        d: d.d,
        h: d.h,
        mats: consMats || undefined,
        bill: { stone: 6, timber: 4, lime: 3 }
      });
      site.set(prog);
      const grp = new THREE.Group();
      grp.position.set(b.x, b.y, b.z);
      grp.rotation.y = b.ry || 0;
      grp.add(site.group);

      const proto = amGetProto(b.key, b.v | 0);
      if (proto && proto.parts.length && typeof KCITY !== 'undefined' && KCITY.constructMesh) {
        const cm = KCITY.constructMesh(proto.parts);
        cm.set(prog);
        grp.add(cm.group);
      }
      w.add(grp);
      consBuilt++;
    }
  }

  /* 6d. Initialize live regional economy & compute telemetry for verify.py */
  const simSnap = typeof AM_SIM !== 'undefined' ? AM_SIM.snapshot() : null;
  const gateLot = city.lots.find(b => b.district === 'upper' && b.key === 'sm_pishtaq_gate' && b.z < -400);
  const custLots = city.lots.filter(b => b.district === 'customs');
  const custMeanY = custLots.length ? custLots.reduce((a, c) => a + c.y, 0) / custLots.length : 0;
  const customsDropM = gateLot && custLots.length ? +(custMeanY - gateLot.y).toFixed(2) : 0;

  const skyMons = city.lots.filter(b => b.district === 'necropolis' && b.skyline);
  let skyBlocked = 0;
  for (let i = 0; i < skyMons.length; i++) {
    const m = skyMons[i];
    for (let j = 0; j < city.lots.length; j++) {
      const o = city.lots[j];
      if (o === m || o.district !== 'necropolis') continue;
      if (o.z < m.z - 4 && Math.abs(o.x - m.x) < 16 && o.y + o.h > m.y + 3) {
        skyBlocked++;
        break;
      }
    }
  }

  window._amaro = {
    settlement: 'ssgsv5zbd2',
    name: 'Amaro',
    datum: AM.DATUM,
    census: city.census,
    ringPeople: ring.people,
    ringVillages: ring.villages.length,
    totalBuildings: allLots.length,
    heroCount: SITES.length,
    instancedCount: instancedCount,
    plinthCount: plinths.length,
    vacantCount: consBuilt,
    consTexBound: consMats && consMats._bound ? Object.keys(consMats._bound).length : 0,
    groundLayers: AM_GROUND.mat.userData.kground || [],
    riversCount: typeof WATER !== 'undefined' ? WATER.surfaces.filter(s => s.kind === 'flow').length : 0,
    stillCount: typeof WATER !== 'undefined' ? WATER.surfaces.filter(s => s.kind === 'still').length : 0,
    skylineMonuments: skyMons.length,
    skylineBlocked: skyBlocked,
    customsDropM: customsDropM,
    domesCount: SM_DOMES.length,
    sim: simSnap,
    trisTotal: Math.round(infraTris + instancedTris)
  };

  if (window._build) {
    window._build.tris = Math.round(GSTAT.tris + instancedTris);
    window._build.instanced = instancedCount;
  }

  return w;
};
