/* ================================================================= URUNDASHI WORLD SCENE, TERRAIN, MOAT, BRIDGES & INSTANCER
   [draw] Replaces core/engine's specimen-sheet ground and buildWorld with Urundashi's 3-tier steppe & Dubnosriba valley terrain
   (PBR + 4-layer KGROUND hex-tiled triplanar shader, registered in KDRAWN), core/water snowmelt rivers + 2-branch defensive moat
   + crossroads sabil basin, 4 pointed-arch ablaq moat bridges, hero landmarks on SITES (walk, doors, cut-away, ?interiors=1),
   THREE.InstancedMesh rendering for all ~1,080 non-hero town & ring hamlet lots, battered basalt plinths, draped cobble streets,
   cavalry corral walls, and active KCONS + KCITY.constructMesh construction sites. Placement is pure data in 40..45. */

/* 1. Hide the flat specimen-sheet grid & ground plane */
scene.traverse(o => {
  if (o.isGridHelper) o.visible = false;
  if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry') {
    o.visible = false;
    o.raycast = () => {};
  }
});

/* Ensure UR_CITY and UR_RING run first so UR.moat() is registered BEFORE terrain & water meshes sample urundashiH */
UR_CITY.get();
UR_RING.get();

/* 2. Build 3-tier displaced terrain (TERR_IN, TERR_MID, TERR_FAR) with KGROUND 4-layer steppe/gravel/basalt/cobble shader */
const UR_GROUND = (function () {
  const city = UR_CITY.get();
  const ring = UR_RING.get();

  const cobbleSpace = KSPACE.create({ cell: 32 });
  const allWays = city.ways.concat(ring.ways);
  for (let wi = 0; wi < allWays.length; wi++) {
    const w = allWays[wi];
    const rad = (w.w == null ? 6 : w.w) * 0.5 + 4.2;
    for (let i = 1; i < w.pts.length; i++) {
      const a = w.pts[i - 1], b = w.pts[i];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const steps = Math.max(1, Math.ceil(L / 14));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = a[0] + (b[0] - a[0]) * t;
        const pz = a[1] + (b[1] - a[1]) * t;
        cobbleSpace.insert({ x: px, z: pz, r: rad }, px, pz, rad);
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

  if (typeof KHOOK !== 'undefined') {
    KHOOK.add(mat, 'ur-steppe', function (sh) {
      KHOOK.v(
        sh,
        '#include <common>',
        '#include <common>\nattribute vec4 aUrGL;\nvarying vec4 vUrGL;\nvarying vec3 vUrWP;\nvarying float vUrRock;',
        'ur-steppe'
      );
      KHOOK.v(
        sh,
        '#include <project_vertex>',
        'vUrGL = aUrGL;\nvUrWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvUrRock = clamp(1.0 - abs(normalize(mat3(modelMatrix) * objectNormal).y), 0.0, 1.0);\n#include <project_vertex>',
        'ur-steppe'
      );
      const steppeFrag = [
        '/*KGROUND*/',
        '{',
        '  float scarpW = smoothstep(0.24, 0.62, vUrRock);',
        '  float band = smoothstep(0.46, 0.56, fract((vUrWP.y + sin(vUrWP.x * 0.006 + vUrWP.z * 0.005) * 2.4) / 14.0));',
        '  vec3 basC = diffuseColor.rgb * vec3(0.42, 0.43, 0.47);',
        '  vec3 limC = diffuseColor.rgb * vec3(1.16, 1.09, 0.95);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, mix(basC, limC, band), scarpW * 0.55);',
        '}'
      ].join('\n');
      KHOOK.f(
        sh,
        '#include <common>',
        '#include <common>\nvarying vec4 vUrGL;\nvarying vec3 vUrWP;\nvarying float vUrRock;',
        'ur-steppe'
      );
      KHOOK.f(
        sh,
        'void main() {',
        '#undef r0\n#undef v0\n#undef m0\n#undef r1\n#undef v1\n#undef m1\n#undef r4\n#undef v4\n#undef m4\n#undef r5\n#undef v5\n#undef m5\n#undef r6\n#undef v6\n#undef m6\nvoid main() {',
        'ur-steppe'
      );
      KHOOK.f(
        sh,
        '#include <map_fragment>',
        '#include <map_fragment>\n' + steppeFrag,
        'ur-steppe'
      );
    }, { key: 'ur-steppe-v3' });

    if (typeof KGROUND !== 'undefined' && KMAT.mode === 'lib') {
      const lyPuna = KGROUND.layer('shigh', 'ground.puna', { w: 'vUrGL.x', amt: 0.60, gain: 1.20, tint: 'diffuse', name: 'plateau steppe' });
      const lyGravel = KGROUND.layer('shigh', 'ground.gravel', { w: 'vUrGL.y', amt: 0.72, gain: 1.16, tint: 'diffuse', name: 'river gravel' });
      const lyRock = KGROUND.layer('shigh', 'rock.basalt', { w: 'vUrGL.z', amt: 0.64, gain: 1.16, tint: 'diffuse', name: 'steppe basalt' });
      const lyCobble = KGROUND.layer('shumari', 'cobble', { w: 'vUrGL.w', amt: 0.76, gain: 1.12, tint: 'diffuse', name: 'qasba cobble' });
      KGROUND.hook(mat, {
        key: 'urundashi',
        layers: [lyPuna, lyGravel, lyRock, lyCobble],
        tri: true,
        relief: { bump: 0.04, cavity: 0.44 }
      });
    }
  }

  const mix = (a, b, t) => a + (b - a) * t;
  const cSteppe = SRGB2LIN(new THREE.Color(0xa9996b));
  const cMeadow = SRGB2LIN(new THREE.Color(0x6d7d52));
  const cGravel = SRGB2LIN(new THREE.Color(0x747068));
  const cBasalt = SRGB2LIN(new THREE.Color(0x494b53));
  const cCobble = SRGB2LIN(new THREE.Color(0x7c766d));

  function buildTerrainPatch(name, cx, cz, size, segs, holeRect, skirtDrop) {
    const nx = segs, nz = segs;
    const vCount = (nx + 1) * (nz + 1);
    const pos = new Float32Array(vCount * 3);
    const col = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const gl = new Float32Array(vCount * 4);
    const x0 = cx - size * 0.5, z0 = cz - size * 0.5;
    const dx = size / nx, dz = size / nz;

    for (let j = 0; j <= nz; j++) {
      const z = z0 + j * dz;
      for (let i = 0; i <= nx; i++) {
        const x = x0 + i * dx;
        const k = j * (nx + 1) + i;
        let y = urundashiH(x, z);
        if (skirtDrop && (i === 0 || i === nx || j === 0 || j === nz)) {
          y -= skirtDrop;
        }
        pos[k * 3] = x;
        pos[k * 3 + 1] = y;
        pos[k * 3 + 2] = z;
        uv[k * 2] = x * 0.05;
        uv[k * 2 + 1] = z * 0.05;

        const sl = size <= 4000 ? urundashiSlope(x, z, Math.max(3, dx * 0.5)) : 0.08;
        const wt = size <= 4000 ? urundashiWater(x, z) : { wet: false };
        const moatBank = size <= 4000 && UR.inMoat(x, z, 6.0);

        let wCob = 0;
        if (size <= 14000) {
          const hits = cobbleSpace.query(x, z, 24);
          for (let hi = 0; hi < hits.length; hi++) {
            const d = Math.hypot(x - hits[hi].x, z - hits[hi].z);
            if (d < hits[hi].r) {
              wCob = Math.max(wCob, smooth(hits[hi].r, hits[hi].r * 0.42, d));
            }
          }
          if (KCITY.grid.inside(city.grid, x, z)) {
            wCob = Math.max(wCob, 0.62);
          }
        }

        const wRock = clamp(smooth(0.28, 0.72, sl) + (moatBank ? 0.55 : 0), 0, 1);
        const wGrav = clamp((wt.wet ? 0.92 : smooth(18, 2, y)) * (1 - wRock * 0.45), 0, 1);
        const wPuna = clamp(1.0 - Math.max(wRock, wGrav, wCob * 0.85), 0, 1);
        const wMeadow = clamp(smooth(42, 8, y) * (1 - wRock) * (1 - wCob), 0, 0.68);

        gl[k * 4] = wPuna;
        gl[k * 4 + 1] = wGrav;
        gl[k * 4 + 2] = wRock;
        gl[k * 4 + 3] = wCob;

        let r = cSteppe.r, gC = cSteppe.g, b = cSteppe.b;
        r = mix(r, cMeadow.r, wMeadow); gC = mix(gC, cMeadow.g, wMeadow); b = mix(b, cMeadow.b, wMeadow);
        r = mix(r, cGravel.r, wGrav * 0.78); gC = mix(gC, cGravel.g, wGrav * 0.78); b = mix(b, cGravel.b, wGrav * 0.78);
        r = mix(r, cBasalt.r, wRock * 0.82); gC = mix(gC, cBasalt.g, wRock * 0.82); b = mix(b, cBasalt.b, wRock * 0.82);
        r = mix(r, cCobble.r, wCob * 0.74); gC = mix(gC, cCobble.g, wCob * 0.74); b = mix(b, cCobble.b, wCob * 0.74);

        const jit = 0.94 + 0.12 * KRAND.unit(KRAND.hash(Math.round(x * 0.25), Math.round(z * 0.25), 7797));
        col[k * 3] = r * jit;
        col[k * 3 + 1] = gC * jit;
        col[k * 3 + 2] = b * jit;
      }
    }

    const idx = [];
    for (let j = 0; j < nz; j++) {
      const zMid = z0 + (j + 0.5) * dz;
      for (let i = 0; i < nx; i++) {
        const xMid = x0 + (i + 0.5) * dx;
        if (holeRect && xMid > holeRect[0] && xMid < holeRect[2] && zMid > holeRect[1] && zMid < holeRect[3]) {
          continue;
        }
        const a = j * (nx + 1) + i;
        const b = a + 1;
        const c = a + (nx + 1);
        const d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('aUrGL', new THREE.BufferAttribute(gl, 4));
    g.setIndex(vCount > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
    g.computeVertexNormals();
    g.computeBoundingSphere();

    const m = new THREE.Mesh(g, mat);
    m.name = name;
    m.receiveShadow = size <= 4000;
    m.userData.isGround = true;
    scene.add(m);
    return m;
  }

  const inCx = 0, inCz = 60, inSize = 2600, inSegs = 260;
  const terrIn = buildTerrainPatch('terrain:inner', inCx, inCz, inSize, inSegs, null, 0);
  const inMargin = 85;
  const inHole = [inCx - inSize * 0.5 + inMargin, inCz - inSize * 0.5 + inMargin, inCx + inSize * 0.5 - inMargin, inCz + inSize * 0.5 - inMargin];

  const midSize = 13600;
  const terrMid = buildTerrainPatch('terrain:mid', 0, 400, midSize, 136, inHole, 20);
  const midHole = [-midSize * 0.5 + 240, 400 - midSize * 0.5 + 240, midSize * 0.5 - 240, 400 + midSize * 0.5 - 240];

  const terrFar = buildTerrainPatch('terrain:far', 0, 500, 28000, 84, midHole, 48);

  if (typeof KDRAWN !== 'undefined') {
    KDRAWN.clear();
    const nx = inSegs, nz = inSegs;
    const x0 = inCx - inSize * 0.5, z0 = inCz - inSize * 0.5;
    const dx = inSize / nx, dz = inSize / nz;
    const hArr = new Float32Array((nx + 1) * (nz + 1));
    for (let j = 0; j <= nz; j++) {
      for (let i = 0; i <= nx; i++) {
        hArr[j * (nx + 1) + i] = urundashiH(x0 + i * dx, z0 + j * dz);
      }
    }
    KDRAWN.add(KDRAWN.grid({ x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: hArr }));
  }

  return { mat: mat, inner: terrIn, mid: terrMid, far: terrFar };
})();

/* 3. Snowmelt rivers (Dubnosriba, Ayn al-Dubnu, Stud Mill-Race) + 2-branch defensive moat + Sabil al-Rikab pool */
const UR_WATER = (function () {
  if (typeof WATER === 'undefined' || !WATER.flow || !WATER.drawFlow) return { flows: [], moatFlows: [], still: null };
  WATER.surfaces.length = 0;
  if (WATER.drawn) WATER.drawn.length = 0;

  const flows = [];
  const mouths = [[-460, 720, 24]];
  for (let i = 0; i < UR.RIVERS.length; i++) {
    const R = UR.RIVERS[i];
    const isLeat = R.id.indexOf('leat') === 0;
    const lift = isLeat ? 0.22 : 0.36;
    const pts = R.pts.map(p => [p[0], p[1], p[2] + lift]);
    const widths = R.pts.map(p => p[3]);
    const S = WATER.flow({
      name: R.name,
      pts: pts,
      width: widths,
      speed: isLeat ? 1.8 : 2.3,
      densify: 18,
      rapids: [0.008, 0.036]
    });
    const D = WATER.drawFlow(S, {
      THREE: THREE,
      scene: scene,
      shallow: isLeat ? 0x5d857a : 0x507d76,
      deep: 0x1a3c44,
      mouths: R.id === 'r011' ? mouths : null,
      step: 10,
      across: isLeat ? 5 : 8,
      margin: isLeat ? 0.5 : 1.6,
      renderOrder: 1
    });
    flows.push(D);
  }

  /* Two slow-moving moat branches flowing monotonically from NE corner (corners[1]) around N+W and E+S to SW outlet (corners[3]) */
  const moatFlows = [];
  const M = UR.moat();
  const city = UR_CITY.get();
  if (M && M.line && city.grid && city.grid.corners.length === 4) {
    const L = M.line;
    const nLoop = L.length - 1;
    const iNE = city.grid.corners[1].at;
    const iSW = city.grid.corners[3].at;

    const branchES = [];
    for (let k = iNE; k <= iSW; k++) branchES.push(L[k % nLoop]);

    const branchNW = [];
    for (let k = iNE; k >= 0; k--) branchNW.push(L[k]);
    for (let k = nLoop - 1; k >= iSW; k--) branchNW.push(L[k]);

    const branches = [
      { name: 'Ḫandaq al-Qaṣba (East-South Moat)', raw: branchES },
      { name: 'Ḫandaq al-Qaṣba (North-West Moat)', raw: branchNW }
    ];
    for (let bi = 0; bi < branches.length; bi++) {
      const br = branches[bi];
      const pts = [];
      let curY = Infinity;
      for (let pi = 0; pi < br.raw.length; pi++) {
        const p = br.raw[pi];
        curY = Math.min(curY, UR.moatLevel(p[0], p[1]));
        pts.push([p[0], p[1], curY]);
      }
      const Sm = WATER.flow({
        name: br.name,
        pts: pts,
        width: pts.map(() => M.width - 1.2),
        speed: 0.16,
        densify: 16
      });
      const Dm = WATER.drawFlow(Sm, {
        THREE: THREE,
        scene: scene,
        shallow: 0x3b6762,
        deep: 0x1d4042,
        step: 8,
        across: 6,
        margin: 0.8,
        renderOrder: 1
      });
      moatFlows.push(Dm);
    }
  }

  let still = null;
  if (WATER.still && WATER.drawStill) {
    const py = urundashiH(0, 0) + 0.24;
    const pool = WATER.still({
      name: 'Sabil al-Rikāb Crossroads Basin',
      level: py,
      bounds: [-5.2, -5.2, 5.2, 5.2],
      fountain: [0, 0]
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

  return { flows: flows, moatFlows: moatFlows, still: still };
})();

/* 4. Prototype builder for instanced non-hero lots, unit plinths, and KCITY.constructMesh sites */
const UR_PROTOS = {};
function urBucketToGeo(b) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3));
  if (b.f) g.setAttribute('aFlut', new THREE.Float32BufferAttribute(b.f, 3));
  if (b.k) {
    for (let ki = 3; ki < b.k.length; ki += 4) b.k[ki] = 0;
    g.setAttribute('aCut', new THREE.Float32BufferAttribute(b.k, 4));
  }
  if (b.w) g.setAttribute('aFlk', new THREE.Float32BufferAttribute(b.w, 1));
  g.setIndex(b.p.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.i, 1) : new THREE.Uint16BufferAttribute(b.i, 1));
  g.computeBoundingSphere();
  return g;
}

function urMakeUnitBoxGeo(mk, hex) {
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
  return uB[mk] ? urBucketToGeo(uB[mk]) : null;
}

function urGetProto(key, v) {
  const vk = key + '#' + (v | 0);
  if (UR_PROTOS[vk]) return UR_PROTOS[vk];
  const d = DEFS[key];
  if (!d) return null;

  const pB = {};
  const keepT = GTARGET, keepDry = PLACE_DRY, keepTris = GSTAT.tris;
  const keepDomeLen = SM_DOMES.length;
  GTARGET = pB;
  PLACE_DRY = 1;
  resetCM();
  let domeTemplates = [];
  try {
    svNoWalk(() => {
      place(key, 0, 0, 0, { v: v | 0, y: 0 });
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
    const geo = urBucketToGeo(b);
    parts.push({ mk: mk, geo: geo, mat: MAT[mk], tris: b.i.length / 3 });
    tris += b.i.length / 3;
  }
  UR_PROTOS[vk] = { key: key, v: v | 0, parts: parts, tris: tris, domes: domeTemplates };
  return UR_PROTOS[vk];
}

/* 5. Populate SITES with Urundashi's hero landmarks BEFORE buildWorld runs */
(function () {
  const city = UR_CITY.get();
  SITES.length = 0;
  for (let i = 0; i < city.lots.length; i++) {
    const b = city.lots[i];
    if (!b.hero || b.vacant) continue;
    SITES.push({
      key: b.key,
      x: b.x,
      z: b.z,
      ry: b.ry,
      o: { v: b.v | 0, y: b.y, name: b.why }
    });
  }
})();

/* 6. Override buildWorld: build hero SITES, 4 ablaq moat bridges, crossroads meydan, instanced lots, plinths & KCONS sites */
const _urBaseBuildWorld = buildWorld;
buildWorld = function () {
  const w = _urBaseBuildWorld();
  const city = UR_CITY.get();
  const ring = UR_RING.get();
  const allLots = city.lots.concat(ring.lots);

  /* 6a. Civic masonry infrastructure: 4 pointed-arch ablaq moat bridges, Sabil al-Rikab meydan, moat revetment coping & draped avenues */
  const infB = {};
  const prevT = GTARGET;
  GTARGET = infB;
  resetCM();
  let infraTris = 0;

  svNoWalk(() => {
    /* Central Sabil al-Rikab Crossroads Court & octagonal snowmelt fountain coping */
    const my = urundashiH(0, 0);
    box('paving', 0, my - 0.12, 0, 26, 0.22, 26, P('paving'));
    box('travertine', 0, my - 0.02, -5.5, 11.6, 0.62, 0.56, P('travertine'));
    box('travertine', 0, my - 0.02,  5.5, 11.6, 0.62, 0.56, P('travertine'));
    box('travertine', -5.5, my - 0.02, 0, 0.56, 0.62, 10.5, P('travertine'));
    box('travertine',  5.5, my - 0.02, 0, 0.56, 0.62, 10.5, P('travertine'));
    box('basalt', 0, my - 0.42, 0, 11.0, 0.52, 11.0, P('basalt'));

    /* 4 Pointed-arch ablaq stone moat bridges spanning GR.moat.bridges */
    for (let bi = 0; bi < city.moatBridges.length; bi++) {
      const br = city.moatBridges[bi];
      const by = br.y;
      WX(br.x, by, br.z, br.ry, 0, 0, () => {
        /* Bridge roadway deck & ablaq parapets */
        box('cobble', 0, -0.14, 0, br.w, 0.24, br.len, P('cobble'));
        box('basalt', 0, -1.10, 0, br.w + 0.6, 0.98, br.len, P('basalt'));
        box('travertine', 0, -0.45, 0, br.w + 0.72, 0.26, br.len, P('travertine'));
        /* Two cutwater stone piers in the moat bed */
        for (const pz of [-br.len * 0.24, br.len * 0.24]) {
          box('rubble', 0, -3.8, pz, br.w + 1.4, 2.8, 2.8, P('rubble'));
          box('travertine', 0, -1.5, pz, br.w + 1.5, 0.35, 3.0, P('travertine'));
        }
        /* Parapets & brass cresset bollards */
        for (const sx of [-br.w * 0.5 - 0.28, br.w * 0.5 + 0.28]) {
          box('basalt', sx, 0.10, 0, 0.52, 0.92, br.len, P('basalt'));
          box('travertine', sx, 1.02, 0, 0.60, 0.18, br.len, P('travertine'));
        }
      });
    }

    /* Low dry-stone cavalry paddock walls enclosing the SW Rabad al-Dubnu remount meadow */
    for (let px = -215; px <= -25; px += 14) {
      const py = urundashiH(px, 434);
      box('rubble', px, py - 0.4, 434, 13.6, 1.45, 0.65, P('rubble'));
      const py2 = urundashiH(px, 362);
      box('rubble', px, py2 - 0.4, 362, 13.6, 1.45, 0.65, P('rubble'));
    }

    /* Draped stone ribbons for avenues, main grid streets, and highways */
    const waysToDrape = city.ways.filter(wy => wy.kind === 'avenue' || wy.kind === 'main' || wy.kind === 'highway');
    for (let wi = 0; wi < waysToDrape.length; wi++) {
      const wy = waysToDrape[wi];
      const ww = wy.w == null ? 8 : wy.w;
      const mk = wy.kind === 'avenue' ? 'paving' : 'cobble';
      const colP = P(mk);
      for (let pi = 1; pi < wy.pts.length; pi++) {
        const a = wy.pts[pi - 1], b = wy.pts[pi];
        const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (segL < 0.5) continue;
        const steps = Math.max(1, Math.ceil(segL / 16));
        const yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
        for (let s = 0; s < steps; s++) {
          const u0 = s / steps, u1 = (s + 1) / steps;
          const x0 = a[0] + (b[0] - a[0]) * u0, z0 = a[1] + (b[1] - a[1]) * u0;
          const x1 = a[0] + (b[0] - a[0]) * u1, z1 = a[1] + (b[1] - a[1]) * u1;
          const xm = (x0 + x1) * 0.5, zm = (z0 + z1) * 0.5;
          /* Skip draping directly over moat water where masonry arch bridges carry the road */
          if (UR.inMoat(xm, zm, 2.0)) continue;
          const y0 = urundashiH(x0, z0), y1 = urundashiH(x1, z1);
          const dL = segL / steps + 0.35;
          const pitch = -Math.atan2(y1 - y0, segL / steps);
          const ym = (y0 + y1) * 0.5;
          WX(xm, ym + 0.03, zm, yaw, pitch, 0, () => {
            box(mk, 0, 0, 0, ww * 0.86, 0.07, dL, colP);
          });
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
    if (!b.vacant && (drop > 0.14 || b.district === 'stud')) {
      const ph = Math.max(0.50, drop + 0.50);
      plinths.push({ x: b.x, y: b.y - ph, z: b.z, ry: b.ry, w: d.w + 0.8, h: ph, d: d.d + 0.8 });
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
        frag: 'settlements/urundashi'
      });
    }

    if (b.vacant) {
      vacants.push(b);
      continue;
    }

    const gk = (b.district === 'ring' ? 'ring:' : 'town:') + b.key + '#' + (b.v | 0);
    (groups[gk] || (groups[gk] = [])).push(b);
    instancedCount++;
  }

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
    const proto = urGetProto(b0.key, b0.v | 0);
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
      im.userData = { mk: pt.mk, urInstanced: true, key: proto.key, v: proto.v, recs: list };
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

  if (plinths.length > 0 && MAT.rubble && MAT.travertine) {
    const gBase = urMakeUnitBoxGeo('rubble', SVPAL.rubble[0]);
    const gCap = urMakeUnitBoxGeo('travertine', SVPAL.travertine[0]);
    if (gBase && gCap) {
      const imBase = new THREE.InstancedMesh(gBase, MAT.rubble, plinths.length);
      const imCap = new THREE.InstancedMesh(gCap, MAT.travertine, plinths.length);
      imBase.frustumCulled = false;
      imCap.frustumCulled = false;
      imBase.castShadow = false;
      imBase.receiveShadow = true;
      imCap.castShadow = false;
      imCap.receiveShadow = true;
      imBase.userData = { mk: 'rubble', urPlinth: true };
      imCap.userData = { mk: 'travertine', urPlinth: true };

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

      const proto = urGetProto(b.key, b.v | 0);
      if (proto && proto.parts.length && typeof KCITY !== 'undefined' && KCITY.constructMesh) {
        const cm = KCITY.constructMesh(proto.parts);
        cm.set(prog);
        grp.add(cm.group);
      }
      w.add(grp);
      consBuilt++;
    }
  }

  const simSnap = typeof UR_SIM !== 'undefined' ? UR_SIM.snapshot() : null;
  const consBoundCount = consMats && consMats._bound ? Object.keys(consMats._bound).length : 0;

  window._urundashi = {
    settlement: 'srbp1bvh1r',
    name: 'Urundashi',
    datum: UR.DATUM,
    census: city.census,
    ringPeople: ring.people,
    ringVillages: ring.villages.length,
    moatBridges: city.moatBridges.length,
    gridDroppedEdges: city.grid.edges.dropped,
    totalBuildings: allLots.length,
    heroCount: SITES.length,
    instancedCount: instancedCount,
    plinthCount: plinths.length,
    vacantCount: consBuilt,
    consTexBound: consBoundCount,
    groundLayers: UR_GROUND.mat.userData.kground || [],
    riversCount: UR_WATER.flows.length,
    moatFlowsCount: UR_WATER.moatFlows.length,
    stillCount: UR_WATER.still ? 1 : 0,
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
