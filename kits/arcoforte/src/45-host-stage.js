// ================================================================= HOST STAGE — renderer, coastal strata ground (KDRAWN), materials & mesh accumulator
// Reads ?state=refurbished|intact|ruined and ?culture=... from the URL, builds AF_PLAN, meshes the sea-cliff headland,
// harbour bench, NW marina, sheltered central park, and inland plateau into AF_GROUND (registered with KDRAWN and KWALK),
// and sets up the merged geometry accumulator AF_ACC so the whole megastructure draws in ~8 draw calls.
const AF_PARAMS = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const AF_STATE = ARCOFORTE.STATES.indexOf(AF_PARAMS.get('state')) >= 0 ? AF_PARAMS.get('state') : 'refurbished';
const AF_CULTURE_INIT = AF_INT.SOCKETS[AF_PARAMS.get('culture')] ? AF_PARAMS.get('culture') : (AF_STATE === 'intact' ? 'ancient' : 'refurbished');
const AF_PLAN = ARCOFORTE.plan({ seed: 14800, state: AF_STATE });

const renderer = new THREE.WebGLRenderer({ antialias: true });
{
  const gl = renderer.getContext();
  const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
  const rStr = (gl && dbg) ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
  const maxPR = /SwiftShader|llvmpipe|Software/i.test(rStr) ? 1.0 : 1.5;
  renderer.setPixelRatio(Math.min(typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1, maxPR));
}
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xb8c8d0, 0.00011);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.6, 36000);
const hemi = new THREE.HemisphereLight(0xd8e8f2, 0x5c5244, 0.62);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dc, 1.35);
sun.position.set(-2600, 3800, -1900);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xb8d4f8, 0.24);
fill.position.set(2200, 1600, 2400);
scene.add(fill);
let NIGHT = false;

const AF_STAGE = {
  ground(x, z) { return ARCOFORTE.groundAt(AF_PLAN, x, z); }
};

// ---------------- ARCHITECTURAL MATERIALS (PBR + library maps; low sampler count for item 27) ----------------
(function initAfMaterials() {
  const isRuin = AF_STATE === 'ruined', isIntact = AF_STATE === 'intact';
  /* Cyclopean outer shell: warm ivory-travertine concrete in refurbished, bright white in intact, weathered dark stone in ruined */
  MAT.afShell = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM,
    color: isIntact ? 0xeae6dc : isRuin ? 0x80776d : 0xd3c9b7,
    roughness: isIntact ? 0.72 : 0.88, metalness: 0.04, side: THREE.DoubleSide
  });
  /* Structural board-formed concrete for buttresses, piers, harbour caissons, and cliff plinths (distinct mid-value contrast) */
  MAT.afConc = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM,
    color: isIntact ? 0xa49e93 : isRuin ? 0x625b53 : 0x8d8478,
    roughness: 0.94, metalness: 0.02, side: THREE.DoubleSide
  });
  /* Warm bounced-light soffit material under arches, mushroom belvederes, and the 300 m Sky-Crown (VISUAL-BAR Pillar B) */
  MAT.afSoffit = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM,
    color: isRuin ? 0x7c746a : 0xc8bfb0,
    emissive: isRuin ? 0x1c1a18 : 0x3b352c, emissiveMap: TEX.concrete,
    roughness: 0.92, metalness: 0.0, side: THREE.DoubleSide
  });
  /* Architectural bronze / copper for dome ribs, oculus spokes, harbour gantries, and mullions (verdigris in ruined) */
  MAT.afBronze = new THREE.MeshStandardMaterial({
    color: isRuin ? 0x4f8474 : isIntact ? 0xb49252 : 0x8f6e3c,
    roughness: isRuin ? 0.62 : 0.42, metalness: isRuin ? 0.35 : 0.68, side: THREE.DoubleSide
  });
  /* Paved plazas, promenade walks, bridge decks, and heliport apron */
  MAT.afPave = new THREE.MeshStandardMaterial({
    map: TEX.concrete, roughnessMap: TEX.concreteRM,
    color: isRuin ? 0x746e66 : 0xc4bcb0,
    roughness: 0.9, metalness: 0.02, side: THREE.DoubleSide
  });
  /* Planted garden beds on the Promenade, Central Park, Bastion lips, and Sky-Crown */
  MAT.afTurf = new THREE.MeshStandardMaterial({
    map: TEX.concrete,
    color: isRuin ? 0x4f5a38 : 0x4b703c,
    roughness: 0.96, metalness: 0.0, side: THREE.DoubleSide
  });
  /* Glazing:
     - intact: clear sky-tinted Ancient plate glass with soft cyan interior glow
     - refurbished: bronze-tracery mullion grid with warm alabaster/salvage panes (some lit warm, some cool daylight)
     - ruined: dusty dark panes */
  MAT.afGlaze = new THREE.MeshStandardMaterial({
    color: isIntact ? 0x8cc8dc : isRuin ? 0x2e3438 : 0xd8cdb8,
    emissive: isIntact ? 0x1d4e60 : isRuin ? 0x050608 : 0x523c22,
    roughness: isIntact ? 0.18 : 0.36, metalness: isIntact ? 0.25 : 0.18, side: THREE.DoubleSide
  });
  if (AF_STATE === 'refurbished' && typeof KHOOK !== 'undefined') {
    KHOOK.add(MAT.afGlaze, 'af-refurb-tracery', {
      vertex: {
        head: 'varying vec3 vAfW;\n',
        at: [{ at: 'project_vertex', after: 'vAfW = (modelMatrix * vec4(transformed, 1.0)).xyz;' }]
      },
      fragment: {
        head: 'varying vec3 vAfW;\n',
        at: [{
          at: 'emissivemap_fragment',
          after: [
            '{ float mu = fract((vAfW.x + vAfW.z) / 1.5), tr = fract(vAfW.y / 1.9);',
            '  float bar = clamp(max(step(mu, 0.065) + step(0.935, mu), step(tr, 0.055) + step(0.945, tr)), 0.0, 1.0);',
            '  float cell = fract(sin(dot(floor(vec2(vAfW.x + vAfW.z, vAfW.y) / vec2(4.5, 3.8)), vec2(12.9898, 78.233))) * 43758.5453);',
            '  vec3 pane = mix(vec3(0.76, 0.80, 0.78), vec3(0.94, 0.88, 0.74), step(0.42, cell));',
            '  diffuseColor.rgb = mix(pane, vec3(0.46, 0.35, 0.19), bar);',
            '  float warm = step(0.55, cell) * (1.0 - bar);',
            '  totalEmissiveRadiance = vec3(0.85, 0.62, 0.30) * warm * 0.42; }'
          ].join('\n')
        }]
      }
    });
  }
  /* Awakened Ancient cyan accent strips on the Rotunda drum and Sky-Crown */
  MAT.afAccent = new THREE.MeshStandardMaterial({
    color: isRuin ? 0x3b4448 : 0x3cd4e6,
    emissive: isRuin ? 0x000000 : 0x26b4c8,
    emissiveIntensity: isIntact ? 1.3 : 0.75,
    roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide
  });
  /* Warm salvage timber & terracotta for harbour hulls, awnings, and market stalls */
  MAT.afTimber = new THREE.MeshStandardMaterial({
    map: TEX.concrete, color: 0x7d5636, roughness: 0.88, metalness: 0.02, side: THREE.DoubleSide
  });
})();

kdef('afPostB', new THREE.CylinderGeometry(1, 1, 1, 8), MAT.afBronze);
kdef('afBoxB', new THREE.BoxGeometry(1, 1, 1), MAT.afBronze);
kdef('afBoxT', new THREE.BoxGeometry(1, 1, 1), MAT.afTimber);
kdef('afAwning', new THREE.BoxGeometry(1, 0.14, 1), MAT.tarp || MAT.afTimber);
kdef('afLamp', new THREE.SphereGeometry(0.42, 8, 6), MAT.afAccent);

// ---------------- COASTAL STRATA & TERRAIN MESH (isolated PRNG + opts.noTerrain support; registered in KDRAWN) ----------------
const AF_OPTS = Object.assign(
  { noTerrain: AF_PARAMS.get('noTerrain') === '1' || AF_PARAMS.get('noTerrain') === 'true' },
  (typeof window !== 'undefined' && window.ARCOFORTE_OPTS) ? window.ARCOFORTE_OPTS : {}
);

function buildAfRockTerrain(opts) {
  /* Dedicated reseed() sub-block for synthetic rock so toggling opts.noTerrain NEVER shifts the megastructure PRNG stream */
  reseed(14802);
  const rockSalt = Math.floor(rng() * 65536);
  let mesh = null;
  if (!(opts && opts.noTerrain)) {
    const ST = KSTRATA.shade({ recipe: 'pillar', seed: 14802, range: [-24, 110], dip: [0.4, 0, 0.2], warp: [2.2, 0.55] }, { THREE: THREE });
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    KHOOK.add(mat, 'af-coastal-ground', function (sh) {
      ST.inject(sh);
      KHOOK.f(sh, '#include <color_fragment>', [
        '#include <color_fragment>',
        '{ vec3 nn = normalize(vSWN); float steep = 1.0 - smoothstep(0.55, 0.86, nn.y);',
        '  vec3 cliffCol = mix(strataColor(vSWP, vSWN), vec3(0.46, 0.43, 0.38), 0.52);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, cliffCol, steep * 0.78); }'
      ].join('\n'), 'af-coastal-ground');
    });

    function axisPts(lo, hi, fineLo, fineHi, dFine, dCoarse) {
      const out = [];
      let v = lo;
      while (v <= hi + 0.01) {
        out.push(v);
        v += (v >= fineLo && v < fineHi) ? dFine : dCoarse;
      }
      return out;
    }
    const xs = axisPts(-960, 960, -350, 350, 5, 24);
    const zs = axisPts(-720, 920, -350, 480, 5, 24);
    const nx = xs.length, nz = zs.length, nv = nx * nz;
    const P = new Float32Array(nv * 3), C = new Float32Array(nv * 3);
    for (let j = 0; j < nz; j++) {
      const z = zs[j];
      for (let i = 0; i < nx; i++) {
        const x = xs[i], y = AF_STAGE.ground(x, z), k = (j * nx + i) * 3;
        P[k] = x; P[k + 1] = y; P[k + 2] = z;
      }
    }
    const I = [];
    for (let j = 0; j < nz - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
        I.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setIndex(I);
    g.computeVertexNormals();
    const N = g.attributes.normal;
    for (let k = 0; k < nv; k++) {
      const x = P[k * 3], y = P[k * 3 + 1], z = P[k * 3 + 2], ny = N.getY(k);
      const n = KRAND.fbm(x / 52, y / 34, z / 52, 3, 14805 + (rockSalt & 7));
      const inPark = Math.hypot(x - AF_PLAN.dim.RING_CX, z - AF_PLAN.dim.RING_CZ) < AF_PLAN.dim.R_IN && z > -146;
      let r, gg, b;
      if (y < 0.8) {
        r = 0.22 + 0.06 * n; gg = 0.27 + 0.06 * n; b = 0.26 + 0.05 * n;
      } else if (y < 9.0) {
        r = 0.38 + 0.06 * n; gg = 0.37 + 0.05 * n; b = 0.34 + 0.04 * n;
      } else if (ny < 0.76) {
        const bed = Math.floor((y + n * 7) / 11) & 1;
        r = (bed ? 0.56 : 0.44) + 0.08 * n; gg = (bed ? 0.52 : 0.41) + 0.07 * n; b = (bed ? 0.46 : 0.37) + 0.06 * n;
      } else if (inPark) {
        r = 0.27 + 0.07 * n; gg = 0.46 + 0.08 * n; b = 0.22 + 0.04 * n;
      } else {
        r = 0.39 + 0.08 * n; gg = 0.45 + 0.07 * n; b = 0.28 + 0.05 * n;
      }
      C[k * 3] = Math.pow(Math.max(0, r), 2.2);
      C[k * 3 + 1] = Math.pow(Math.max(0, gg), 2.2);
      C[k * 3 + 2] = Math.pow(Math.max(0, b), 2.2);
    }
    g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    mesh = new THREE.Mesh(g, mat);
    mesh.name = 'ground';
    mesh.userData.ground = true;
    mesh.userData.probeSkip = true;
    mesh.userData.lodSkip = true;
  }
  /* Reset megastructure PRNG stream to its canonical starting seed whether terrain was built or skipped */
  reseed(14810);
  return mesh;
}

const AF_GROUND = buildAfRockTerrain(AF_OPTS);
if (AF_GROUND) {
  scene.add(AF_GROUND);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(AF_GROUND));
}
AF_STAGE.buildRockTerrain = buildAfRockTerrain;
AF_STAGE.hull = AF_PLAN.hull;

// ---------------- MERGED GEOMETRY ACCUMULATOR (1 mesh per material, outward normals, probePoints) ----------------
const AF_ACC = (function makeAfAcc() {
  const buckets = {};
  const probePts = [];
  const MATS = {
    SHELL: () => MAT.afShell,
    CONC: () => MAT.afConc,
    SOFF: () => MAT.afSoffit,
    BRONZE: () => MAT.afBronze,
    PAVE: () => MAT.afPave,
    TURF: () => MAT.afTurf,
    GLAZE: () => MAT.afGlaze,
    ACCENT: () => MAT.afAccent,
    TIMBER: () => MAT.afTimber
  };

  function mark(x, y, z) {
    probePts.push(x, y, z);
  }

  function quad(key, pts, uv, hintN) {
    const B = buckets[key] || (buckets[key] = { P: [], N: [], U: [], I: [], n: 0 });
    let a = pts[0], b = pts[1], c = pts[2], d = pts[3];
    let uvs = uv || [[0, 0], [1, 0], [1, 1], [0, 1]];
    const ux = c[0] - a[0], uy = c[1] - a[1], uz = c[2] - a[2];
    const vx = d[0] - b[0], vy = d[1] - b[1], vz = d[2] - b[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (hintN && (nx * hintN[0] + ny * hintN[1] + nz * hintN[2] < 0)) {
      const tmpP = b; b = d; d = tmpP;
      const tmpU = uvs[1]; uvs = [uvs[0], uvs[3], uvs[2], tmpU];
      nx = -nx; ny = -ny; nz = -nz;
    }
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    const vs = [a, b, c, d];
    for (let k = 0; k < 4; k++) {
      B.P.push(vs[k][0], vs[k][1], vs[k][2]);
      B.N.push(nx, ny, nz);
      B.U.push(uvs[k][0], uvs[k][1]);
    }
    const m = B.n;
    B.I.push(m, m + 1, m + 2, m, m + 2, m + 3);
    B.n += 4;
  }

  function wall(key, a, b, y0, y1, hintN, tile) {
    const t = tile == null ? 16 : tile, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    quad(key, [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]],
      [[0, y0 / t], [L / t, y0 / t], [L / t, y1 / t], [0, y1 / t]], hintN);
  }

  function polyH(key, pts, y, up, tile) {
    const t = tile == null ? 18 : tile, p0 = pts[0], n = [0, up ? 1 : -1, 0];
    let mx = 0, mz = 0;
    for (let i = 0; i < pts.length; i++) { mx += pts[i][0]; mz += pts[i][1]; }
    if (pts.length) mark(mx / pts.length, y, mz / pts.length);
    for (let i = 1; i < pts.length - 1; i++) {
      const p1 = pts[i], p2 = pts[i + 1];
      quad(key, [[p0[0], y, p0[1]], [p1[0], y, p1[1]], [p2[0], y, p2[1]], [p2[0], y, p2[1]]],
        [[p0[0] / t, p0[1] / t], [p1[0] / t, p1[1] / t], [p2[0] / t, p2[1] / t], [p2[0] / t, p2[1] / t]], n);
    }
  }

  function box(key, cx, y0, y1, cz, w, d, ry, topKey, botKey) {
    mark(cx, (y0 + y1) / 2, cz);
    const a = ry || 0, cs = Math.cos(a), sn = Math.sin(a), hw = w / 2, hd = d / 2;
    const W = (lx, lz) => [cx + lx * cs + lz * sn, cz - lx * sn + lz * cs];
    const c0 = W(-hw, -hd), c1 = W(hw, -hd), c2 = W(hw, hd), c3 = W(-hw, hd);
    wall(key, c0, c1, y0, y1, [-sn, 0, -cs]);
    wall(key, c1, c2, y0, y1, [cs, 0, -sn]);
    wall(key, c2, c3, y0, y1, [sn, 0, cs]);
    wall(key, c3, c0, y0, y1, [-cs, 0, sn]);
    polyH(topKey || key, [c0, c1, c2, c3], y1, true);
    if (botKey !== false) polyH(botKey || 'SOFF', [c0, c1, c2, c3], y0, false);
  }

  function prism(key, pts, y0, y1, topKey, botKey) {
    let mx = 0, mz = 0;
    for (let i = 0; i < pts.length; i++) { mx += pts[i][0]; mz += pts[i][1]; }
    mx /= pts.length; mz /= pts.length;
    mark(mx, (y0 + y1) / 2, mz);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const dx = (a[0] + b[0]) / 2 - mx, dz = (a[1] + b[1]) / 2 - mz;
      wall(key, a, b, y0, y1, [dx, 0, dz]);
    }
    if (topKey !== false) polyH(topKey || key, pts, y1, true);
    if (botKey !== false) polyH(botKey || 'SOFF', pts, y0, false);
  }

  function frustum(key, cx, cz, r0, r1, y0, y1, segs, inward, topKey) {
    mark(cx, (y0 + y1) / 2, cz);
    const n = segs == null ? 24 : segs, sgn = inward ? -1 : 1;
    const topPts = [];
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      const p0 = [cx + r0 * Math.cos(a0), y0, cz + r0 * Math.sin(a0)];
      const p1 = [cx + r0 * Math.cos(a1), y0, cz + r0 * Math.sin(a1)];
      const p2 = [cx + r1 * Math.cos(a1), y1, cz + r1 * Math.sin(a1)];
      const p3 = [cx + r1 * Math.cos(a0), y1, cz + r1 * Math.sin(a0)];
      quad(key, [p0, p1, p2, p3], [[i / n * 6, y0 / 16], [(i + 1) / n * 6, y0 / 16], [(i + 1) / n * 6, y1 / 16], [i / n * 6, y1 / 16]],
        [sgn * Math.cos(am), 0, sgn * Math.sin(am)]);
      topPts.push([p3[0], p3[2]]);
    }
    if (topKey) polyH(topKey, topPts, y1, true);
  }

  function archBay(key, a, b, y0, y1, ys, archFrac, hintN) {
    mark((a[0] + b[0]) / 2, (y0 + y1) / 2, (a[1] + b[1]) / 2);
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    const f = archFrac == null ? 0.66 : archFrac, p0 = (1 - f) / 2, p1 = 1 - p0;
    const pt = u => [a[0] + dx * u, a[1] + dz * u];
    wall(key, a, pt(p0), y0, y1, hintN);
    wall(key, pt(p1), b, y0, y1, hintN);
    const ar = Math.min((y1 - ys) * 0.82, L * f * 0.5), segs = 8;
    for (let i = 0; i < segs; i++) {
      const t0 = Math.PI * i / segs, t1 = Math.PI * (i + 1) / segs;
      const u0 = 0.5 - 0.5 * f * Math.cos(t0), u1 = 0.5 - 0.5 * f * Math.cos(t1);
      const ya0 = ys + ar * Math.sin(t0), ya1 = ys + ar * Math.sin(t1);
      const qa = pt(u0), qb = pt(u1);
      quad(key, [[qa[0], ya0, qa[1]], [qb[0], ya1, qb[1]], [qb[0], y1, qb[1]], [qa[0], y1, qa[1]]],
        [[u0, ya0 / 16], [u1, ya1 / 16], [u1, y1 / 16], [u0, y1 / 16]], hintN);
    }
  }

  function flush(parent) {
    const group = new THREE.Group();
    group.name = 'arcoforte:architecture';
    group.userData.probePoints = probePts;
    let totalTris = 0, meshCount = 0;
    for (const key in buckets) {
      const B = buckets[key];
      if (!B.I.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(B.P, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(B.N, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(B.U, 2));
      g.setIndex(B.I);
      g.computeBoundingSphere();
      g.computeBoundingBox();
      const mat = MATS[key] ? MATS[key]() : MAT.afShell;
      const m = new THREE.Mesh(g, mat);
      m.name = 'arcoforte:' + key.toLowerCase();
      group.add(m);
      totalTris += B.I.length / 3;
      meshCount++;
    }
    parent.add(group);
    return { group: group, tris: totalTris, meshes: meshCount };
  }

  return { mark, quad, wall, polyH, box, prism, frustum, archBay, flush };
})();
