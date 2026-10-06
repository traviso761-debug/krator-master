/* ======================================================================
   Krator Mechs: the runtime (kits/mechs/mechs-runtime.js)

   The API the bundle returns as the single global `KratorMechs` (KM below).
   mech_bundle.py wraps the catalog core, the culture symbols, the vehicle frame,
   mechs-core.js, mechs-parts.js, the culture files and this file in ONE closure;
   nothing else leaks. It needs only THREE (r128).

     KM.list()                          -> [{ key, name, culture, role, origin, tags, variants, variantNames, w, d, h, data }]
     KM.build(key, { variant, seed, linear })  -> THREE.Group (posed standing; null for an unknown key)
     KM.update(group, dt, { ground })   advance and pose it; returns the events of this step (fire, impact, step)
     KM.setState(group, 'idle'|'walk')  KM.attack(group) -> the clip's length; KM.state(group)
     KM.speed(group)                    the ground speed (m/s) the host moves it at while walking, so its feet do not slide
     KM.lights(group, on)               lamps and eye slits; KM.projectile(kind) -> a bolt, harpoon or rivet to fly
     KM.useTextures({ plate, metal, bronze, cloth, banner })   library detail maps (see API.md)
     KM.has, KM.get, KM.cultures, KM.palette, KM.dataOf, KM.setDetail, KM.dispose, KM.reset

   The group: its root bone ('body' and anything else without a parent), up to six SkinnedMeshes on one
   Skeleton (mesh:plate, mesh:metal, mesh:bronze, mesh:cloth, mesh:glass, mesh:glow), and one cloth mesh per
   banner, hung on its bone. The bones are the rig's (KM.get(key) to read the entry; group.userData.bones the
   names). The host moves and turns the group; the feet stay where they were planted while it does.

   Colours: the palettes are sRGB; the merged vertex colours are LINEAR unless { linear:false }.
   ====================================================================== */
const KM_API = (function () {
  const API = {};
  const V3 = THREE.Vector3, Q = THREE.Quaternion;
  const clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  const smooth = function (u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const EASE = {
    l: function (u) { return u; }, s: smooth,
    i: function (u) { return u * u * u; }, o: function (u) { return 1 - Math.pow(1 - u, 3); },
    b: function (u) { const c = 1.7; u -= 1; return 1 + u * u * ((c + 1) * u + c); }
  };
  /* smooth deterministic noise in about [-1, 1] */
  function wob(t) { return (Math.sin(t) + 0.6 * Math.sin(2.17 * t + 1.3) + 0.3 * Math.sin(4.31 * t + 0.7)) / 1.9; }

  /* ------------------------------------------------------------ materials (shared by every mech) */
  const TEX = {};
  let MATS = null;
  /* [roughness, metalness, bump]: the bump is kept low on the fine metal maps, which alias into sparkle at a distance */
  const LOOK = { plate: [0.62, 0.25, 0.4], livery: [0.58, 0.2, 0.45], metal: [0.45, 0.6, 0.25], bronze: [0.34, 0.75, 0.35], cloth: [0.92, 0.0, 0.35], hair: [0.7, 0.0, 0.3] };
  function std(b) { const L = LOOK[b]; return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: L[0], metalness: L[1], skinning: true }); }
  function mats() {
    if (MATS) return MATS;
    MATS = { plate: std('plate'), livery: std('livery'), metal: std('metal'), bronze: std('bronze'), cloth: std('cloth'), hair: std('hair'),
      glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.38,
        depthWrite: false, skinning: true, side: THREE.DoubleSide }) };
    for (const b of DETAIL) attachDetail(b);
    return MATS;
  }
  const DETAIL = ['plate', 'livery', 'metal', 'bronze', 'cloth', 'hair'];
  /* a library set as a DETAIL map sampled by triplanar projection of the bind-pose position (no UVs; the
     pattern rides on the part), its mean brightness divided back out, and its luminance as a bump */
  function attachDetail(b) {
    const T = TEX[b], m = MATS && MATS[b];
    if (!T || !m) return;
    m.map = T.map;
    const tile = 1 / (T.scale || 1), gain = 1 / Math.max(0.05, Math.pow(T.mean || 0.5, 2.2)), bump = T.bump == null ? LOOK[b][2] : T.bump;
    const chip = T.chip;   /* livery: where the paint has chipped (dark in the map) the vertex colour gives way to bare steel */
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uDetTile = { value: tile }; sh.uniforms.uDetGain = { value: gain }; sh.uniforms.uDetBump = { value: bump * 0.01 };   /* metres of relief per unit of detail brightness */
      sh.uniforms.uChip = { value: new THREE.Vector3(chip ? chip[0] : -2, chip ? chip[1] : -1, 0) };
      sh.uniforms.uChipCol = { value: new THREE.Color(chip ? chip[2] : 0x000000).convertSRGBToLinear() };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vDetP;\nvarying vec3 vDetN;\n')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vDetP = position;\n  vDetN = normal;\n');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vDetP;\nvarying vec3 vDetN;\nuniform float uDetTile;\nuniform float uDetGain;\nuniform float uDetBump;\nuniform vec3 uChip;\nuniform vec3 uChipCol;\n' +
          'vec3 kmBump(vec3 p, vec3 n, float h){ vec3 dpx = dFdx(p), dpy = dFdy(p); float dhx = dFdx(h), dhy = dFdy(h);\n' +
          '  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1); vec3 g = sign(det) * (dhx * r1 + dhy * r2);\n' +
          '  return normalize(abs(det) * n - g); }\n')
        .replace('#include <map_fragment>', [
          'float detL = 0.5; float kmPaint = 1.0;',
          '#ifdef USE_MAP',
          '  vec3 dW = pow(abs(normalize(vDetN)) + 1e-4, vec3(4.0)); dW /= (dW.x + dW.y + dW.z);',
          '  vec3 dP = vDetP * uDetTile;',
          '  vec4 texelColor = texture2D(map, dP.zy) * dW.x + texture2D(map, dP.xz) * dW.y + texture2D(map, dP.xy) * dW.z;',
          '  texelColor = mapTexelToLinear(texelColor);',
          '  detL = dot(texelColor.rgb, vec3(0.299, 0.587, 0.114)) * uDetGain;',
          '  diffuseColor.rgb *= texelColor.rgb * uDetGain;',
          '  kmPaint = smoothstep(uChip.x, uChip.y, detL);',
          '#endif'].join('\n'))
        .replace('#include <color_fragment>', '#ifdef USE_COLOR\n  diffuseColor.rgb *= mix(uChipCol, vColor, kmPaint);\n#endif')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = clamp(roughnessFactor * mix(1.18, 0.82, clamp(detL, 0.0, 1.5) * 0.66), 0.04, 1.0);')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n  normal = kmBump(-vViewPosition, normal, detL * uDetBump);');
    };
    m.extensions = { derivatives: true };
    m.customProgramCacheKey = function () { return 'km-detail'; };
    m.needsUpdate = true;
  }
  function loadTex(src, repeat) {
    if (!src) return null;
    const t = src.isTexture ? src : new THREE.TextureLoader().load(src);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }
  /* { plate:{ src, scale, mean, bump }, metal, bronze, cloth, banner:{ src, cell } }: src a URL (or data URL) or a THREE.Texture */
  API.useTextures = function (o) {
    o = o || {};
    for (const b of DETAIL) {
      if (!o[b]) continue;
      TEX[b] = { map: loadTex(o[b].src || o[b].map), scale: o[b].scale || 1, mean: o[b].mean || 0.5, bump: o[b].bump,
        chip: o[b].chip || (b === 'livery' ? [0.42, 0.62, 0x6a6862] : null) };
      attachDetail(b);
    }
    if (o.banner) TEX.banner = { src: o.banner.src || o.banner.map, cell: o.banner.cell || 0.9 };
    if (o.sunbanner) { const z = o.sunbanner.size || o.sunbanner.scale || 2; TEX.sunbanner = { src: o.sunbanner.src || o.sunbanner.map, size: Array.isArray(z) ? z : [z, z] }; }
    return Object.keys(TEX);
  };

  /* ------------------------------------------------------------ banners: painted on a canvas, flutter on the CPU */
  function css(c) { return '#' + ('000000' + ((c >>> 0) & 0xffffff).toString(16)).slice(-6); }
  const _bannerTex = new Map();
  function bannerTexture(P, w, h) {
    const key = JSON.stringify(P) + '|' + w.toFixed(2) + 'x' + h.toFixed(2);
    if (_bannerTex.has(key)) return _bannerTex.get(key);
    let tex;
    if (P.pattern === 'sun' && TEX.sunbanner) {
      /* the sun sheet: a window from the middle of one tile (the generated sheet is not quite periodic, so no wrap) */
      tex = new THREE.TextureLoader().load(TEX.sunbanner.src);
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
      const S = TEX.sunbanner.size, rx = Math.min(0.92, w / S[0]), ry = Math.min(0.92, h / S[1]);
      tex.repeat.set(rx, ry); tex.offset.set((1 - rx) / 2, (1 - ry) / 2);
    } else if (P.pattern === true && TEX.banner) {
      tex = new THREE.TextureLoader().load(TEX.banner.src && TEX.banner.src.isTexture ? TEX.banner.src.image.src : TEX.banner.src);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
      tex.repeat.set(w / (TEX.banner.cell * 3), h / (TEX.banner.cell * 3));
    } else {
      const ppm = 160, W = Math.max(48, Math.min(512, Math.round(w * ppm))), H = Math.max(48, Math.min(768, Math.round(h * ppm)));
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      g.fillStyle = css(P.field); g.fillRect(0, 0, W, H);
      const e = Math.round(Math.min(W, H) * 0.07);
      if (P.edge != null) { g.fillStyle = css(P.edge); g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H); }
      if (P.band != null) { g.fillStyle = css(P.band); g.fillRect(0, 0, W, e * 1.4); g.fillRect(0, H - e * 1.4, W, e * 1.4); }
      if (P.stripes) {
        const n = P.stripes.length;
        for (let i = 0; i < n * 3; i++) { g.fillStyle = css(P.stripes[i % n]); g.fillRect(0, i * H / (n * 3), W, H / (n * 3) + 1); }
      }
      const R0 = Math.min(W, H) * 0.34, cx = W / 2, cy = P.sym === 'numeral' ? H * 0.36 : H * (P.symY || 0.45);
      const ink = css(P.ink != null ? P.ink : 0xf1dba6), ink2 = css(P.ink2 != null ? P.ink2 : P.field);
      if (P.sym === 'sun' || P.sym === 'numeral') {
        /* the Iziz sun (core/sockets/38-symbols.js) inside a ring of rays */
        g.fillStyle = ink;
        for (let k = 0; k < 16; k++) {
          const a = k * Math.PI / 8, r1 = R0 * 0.98, r2 = R0 * (k % 2 ? 1.18 : 1.32);
          g.beginPath(); g.moveTo(cx + Math.cos(a - 0.11) * r1, cy + Math.sin(a - 0.11) * r1);
          g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.lineTo(cx + Math.cos(a + 0.11) * r1, cy + Math.sin(a + 0.11) * r1); g.fill();
        }
        SYMBOLS.sun(g, cx, cy, R0, ink, ink2);
      } else if (P.sym === 'orb') {
        /* the palace orb: a ring crossed by a long upright bar and a short cross bar (the Iziz banner device) */
        g.strokeStyle = ink; g.lineWidth = R0 * 0.22;
        g.beginPath(); g.arc(cx, cy, R0 * 0.72, 0, Math.PI * 2); g.stroke();
        g.fillStyle = ink; g.fillRect(cx - R0 * 0.1, cy - R0 * 1.12, R0 * 0.2, R0 * 2.24); g.fillRect(cx - R0 * 0.42, cy - R0 * 0.08, R0 * 0.84, R0 * 0.16);
        g.strokeStyle = css(P.line != null ? P.line : 0x9c2d2d); g.lineWidth = Math.max(1, R0 * 0.04);
        g.beginPath(); g.arc(cx, cy, R0 * 0.86, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(cx, cy, R0 * 0.58, 0, Math.PI * 2); g.stroke();
      }
      if (P.sym === 'numeral' && P.numeral) {
        /* a legion's number in bars (I, V, X), under the sun */
        g.fillStyle = ink;
        const s = P.numeral, ch = H * 0.16, cw = ch * 0.62, y0 = H * 0.66, bw = Math.max(2, ch * 0.16);
        let x = cx - (s.length * cw) / 2;
        for (const C of s) {
          if (C === 'I') g.fillRect(x + cw / 2 - bw / 2, y0, bw, ch);
          else if (C === 'V' || C === 'X') {
            g.save(); g.translate(x + cw / 2, y0 + ch / 2);
            for (const sgn of C === 'X' ? [-1, 1] : [-1, 1]) {
              g.save();
              if (C === 'X') { g.rotate(sgn * 0.55); g.fillRect(-bw / 2, -ch * 0.56, bw, ch * 1.12); }
              else { g.translate(sgn * cw * 0.18, 0); g.rotate(-sgn * 0.33); g.fillRect(-bw / 2, -ch / 2, bw, ch); }
              g.restore();
            }
            g.restore();
          }
          x += cw;
        }
        g.fillRect(cx - (s.length * cw) / 2, y0 - bw * 1.6, s.length * cw, bw); g.fillRect(cx - (s.length * cw) / 2, y0 + ch + bw * 0.6, s.length * cw, bw);
      }
      /* the weave and the wear: fine threads, a darker, dirtier foot */
      g.globalAlpha = 0.07; g.fillStyle = '#000';
      for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
      g.globalAlpha = 0.05;
      for (let x = 0; x < W; x += 3) g.fillRect(x, 0, 1, H);
      const grd = g.createLinearGradient(0, H * 0.55, 0, H);
      grd.addColorStop(0, 'rgba(40,30,20,0)'); grd.addColorStop(1, 'rgba(40,30,20,0.35)');
      g.globalAlpha = 1; g.fillStyle = grd; g.fillRect(0, 0, W, H);
      tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    }
    _bannerTex.set(key, tex);
    return tex;
  }
  /* the cloth mesh. kind 'hang': hangs from its top edge (a crossbar), facing z. 'flag' / 'pennant': along its
     pole edge, trailing toward -z, facing x. Top-edge anchor at (x, y, z) of its bone, turned ry. */
  function clothMesh(B) {
    const nx = B.kind === 'hang' ? 6 : 8, ny = B.kind === 'hang' ? 8 : 5;
    const g = new THREE.PlaneGeometry(B.w, B.h, nx, ny);
    g.translate(B.w / 2, -B.h / 2, 0);                         /* x in [0, w], y in [-h, 0] */
    const p = g.attributes.position, uv = g.attributes.uv;
    const W = new Float32Array(p.count), S = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i);
      if (B.kind === 'hang') { x -= B.w / 2; W[i] = clamp(-y / B.h, 0, 1); S[i] = -y; p.setXYZ(i, x, y, 0); }
      else {
        const u = x / B.w;
        if (B.kind === 'pennant') y = -B.h / 2 + (y + B.h / 2) * (1 - 0.82 * u);
        W[i] = clamp(u, 0, 1); S[i] = x;
        p.setXYZ(i, 0, y, -x);
      }
    }
    g.computeVertexNormals();
    const tex = bannerTexture(B.paint, B.w, B.h);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.93, metalness: 0 }));
    m.position.set(B.x, B.y, B.z); m.rotation.y = B.ry || 0;
    m.name = 'banner:' + B.bone; m.castShadow = true; m.receiveShadow = true;
    return { mesh: m, base: Float32Array.from(p.array), W: W, S: S, def: B, seed: (B.x * 13.1 + B.y * 7.7 + B.z * 3.3) };
  }

  /* ------------------------------------------------------------ the build */
  function geomOf(b) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(b.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(b.sw, 4));
    g.computeBoundingSphere();
    g.boundingSphere.radius *= 1.3;
    return g;
  }
  API.list = function () {
    return MECHS.map(function (A) {
      return { key: A.key, name: A.name, culture: A.culture, role: A.role || '', origin: A.origin || '', lore: A.lore || '',
        tags: JSON.parse(JSON.stringify(A.tags || {})), variants: A.variants, variantNames: A.variantNames.slice(),
        w: A.w, d: A.d, h: A.h, data: mechData(A, 0) };
    });
  };
  API.has = function (key) { return !!MECH_BY_KEY[key]; };
  API.get = function (key) { return MECH_BY_KEY[key] || null; };
  API.dataOf = function (key, v) { const A = MECH_BY_KEY[key]; return A ? mechData(A, v) : null; };
  /* a variant's attack clip (variantAttack[v] or the entry's own) */
  API.clip = function (key, v) { const A = MECH_BY_KEY[key]; return A ? mechAttack(A, v) : null; };
  /* the z-fighting audit of a variant's rest pose (mechs-core.js mechAudit): [{ bone, a, b, n, meshes, at }] */
  API.audit = function (key, o) {
    o = o || {};
    const A = MECH_BY_KEY[key];
    if (!A) return null;
    const F = mechFrame({ seed: o.seed || 1, variant: o.variant | 0 });
    F.asset = A; F.data = mechData(A, o.variant | 0);
    const R = mechRig(), prev = _target;
    try { A.build(F, R); } finally { _target = prev; }
    return mechAudit(R, o);
  };
  API.cultures = function () { return Object.keys(MECH_CULTURES); };
  API.palette = function (culture) { return MECH_CULTURES[culture] ? Object.assign({}, FPAL[culture]) : null; };
  API.CLASSES = MECH_CLASSES; API.TYPES = MECH_TYPES; API.DRIVES = MECH_DRIVES; API.PILOTS = MECH_PILOTS; API.WEAPONS = MECH_WEAPONS;
  API.BUCKETS = MECH_BUCKETS;
  API.setDetail = function (k) { _LOD = Math.max(0.25, Math.min(1, +k || 1)); return _LOD; };

  API.build = function (key, o) {
    o = o || {};
    const A = MECH_BY_KEY[key];
    if (!A) { console.error('KratorMechs: no such mech', key); return null; }
    const v = Math.max(0, Math.min(A.variants - 1, o.variant | 0)), seed = o.seed || 1, linear = o.linear !== false;
    const data = mechData(A, v);
    const F = mechFrame({ seed: seed, variant: v });
    F.asset = A; F.data = data;
    const R = mechRig();
    const prev = _target;
    try { A.build(F, R); } finally { _target = prev; }
    if (!R.by.body) throw new Error('mech ' + key + ': no body bone');
    const B = mechMerge(R, linear);
    /* the bones */
    const bones = R.bones.map(function (b) {
      const bone = new THREE.Bone();
      bone.name = b.name;
      bone.position.set(b.p[0], b.p[1], b.p[2]);
      bone.quaternion.setFromEuler(new THREE.Euler(b.r[0], b.r[1], b.r[2], 'YXZ'));
      return bone;
    });
    const g = new THREE.Group();
    g.name = 'mech:' + key;
    R.bones.forEach(function (b, i) { if (b.parent) bones[R.by[b.parent].index].add(bones[i]); else g.add(bones[i]); });
    g.updateMatrixWorld(true);
    const skel = new THREE.Skeleton(bones);
    const M = mats();
    const glow = new THREE.MeshBasicMaterial({ vertexColors: true, skinning: true });
    let tris = 0;
    for (const k of MECH_BUCKETS) {
      if (!B[k] || !B[k].pos.length) continue;
      const mesh = new THREE.SkinnedMesh(geomOf(B[k]), k === 'glow' ? glow : M[k]);
      mesh.name = 'mesh:' + k; mesh.castShadow = k !== 'glass' && k !== 'glow'; mesh.receiveShadow = k !== 'glow';
      if (k === 'glass') mesh.renderOrder = 2;
      g.add(mesh); mesh.bind(skel);
      tris += B[k].pos.length / 9;
    }
    /* the banners, hung on their bones */
    const cloth = R.banners.map(function (Bn) { const c = clothMesh(Bn); bones[R.by[Bn.bone].index].add(c.mesh); tris += c.mesh.geometry.index.count / 3; return c; });
    /* the animation state */
    const by = {};
    bones.forEach(function (b) { by[b.name] = b; });
    const rest = bones.map(function (b) { return { p: b.position.clone(), q: b.quaternion.clone() }; });
    const legBone = {};
    const legs = R.legs.map(function (L) {
      for (const s of ['_yaw', '_hip', '_knee', '_ankle']) legBone[L.name + s] = 1;
      return { def: L, yaw: by[L.name + '_yaw'], hip: by[L.name + '_hip'], knee: by[L.name + '_knee'], ankle: by[L.name + '_ankle'],
        plant: new V3(), from: new V3(), to: new V3(), swing: false, u: 0, lastP: 0, pitch: 0 };
    });
    const dangle = {};
    const dang = R.dangles.map(function (D) { dangle[D.name] = 1; return { def: D, bone: by[D.name], ax: 0, az: 0, vx: 0, vz: 0, p0: null, v0: null, acc: new V3() }; });
    const spin = {};
    const spins = R.spins.map(function (S) { spin[S.name] = S; return { def: S, bone: by[S.name], ang: 0 }; });
    const st = { A: A, variant: v, attack: mechAttack(A, v), key: key, bones: bones, by: by, rest: rest, legs: legs, legBone: legBone, dang: dang, dangle: dangle,
      spins: spins, spin: spin, cloth: cloth, points: R.points, glow: glow, t: 0, mode: 'idle', resume: 'idle', walkW: 0,
      phase: 0, atk: -1, atkW: 0, vel: new V3(), last: null, gq: new Q(), reach: 0, events: [], planted: false,
      gait: A.gait, mass: data.mass || 10 };
    g.userData = { key: key, name: A.name, culture: A.culture, role: A.role || '', origin: A.origin || '',
      tags: JSON.parse(JSON.stringify(A.tags || {})), kind: 'mech', variant: v, variantName: A.variantNames[v] || '', seed: seed,
      w: A.w, d: A.d, h: A.h, tris: Math.round(tris), bones: bones.map(function (b) { return b.name; }),
      legs: R.legs.map(function (L) { return { name: L.name, L1: L.L1, L2: L.L2, knee: L.knee, splay: L.splay, ankleH: L.ankleH, rest: L.rest.slice() }; }),
      points: JSON.parse(JSON.stringify(R.points)), data: data, lightsOn: true };
    Object.defineProperty(g.userData, '_mech', { value: st, enumerable: false });
    API.lights(g, true);
    pose(g, st, 0, null);
    st.planted = false; st.last = null; st.reach = 0;     /* the first update plants the feet wherever the host has put it */
    return g;
  };

  /* ------------------------------------------------------------ the pose layers */
  function add(P, k, name, x, y, z) { const a = P[k][name] || (P[k][name] = [0, 0, 0]); a[0] += x; a[1] += y; a[2] += z; }
  function layerIdle(st, P, t, w) {
    if (w <= 0) return;
    const I = st.A.idle;
    add(P, 's', 'body', 0.018 * Math.sin(t * 0.31) * w, -I.breathe * (0.5 + 0.5 * Math.sin(t * 1.25)) * w, 0);
    add(P, 'b', 'body', 0.012 * Math.sin(t * 1.25 + 0.6) * w, 0, 0.01 * Math.sin(t * 0.31 + 1) * w);
    if (st.by.torso) add(P, 'b', 'torso', 0.02 * wob(t * 0.5 + 2) * w, I.scan * wob(t * 0.19) * w, 0);
    if (st.by.head) add(P, 'b', 'head', 0.07 * wob(t * 0.31 + 3) * w, I.look * wob(t * 0.23 + 7) * w, 0);
    for (const b of st.bones) if (/_pilotHead$/.test(b.name)) add(P, 'b', b.name, 0.12 * wob(t * 0.37 + 5) * w, 0.55 * wob(t * 0.29 + 11) * w, 0);
    if (st.A.anim.idle) st.A.anim.idle(P, t, w, st);
  }
  function stanceOf(p, duty) {     /* 1 in stance, 0 in swing, with soft edges */
    const e = 0.06;
    return smooth(p / e) * smooth((duty - p) / e) + (p > duty ? smooth((p - 1 + e) / e) * 0 : 0);
  }
  function layerWalk(st, P, ph, w) {
    if (w <= 0) return;
    const G = st.gait, n = st.legs.length;
    let bob = 0, side = 0, tw = 0;
    st.legs.forEach(function (L, i) {
      const p = (ph + (G.offsets[i] || 0)) % 1, s = L.def.hip[0] >= 0 ? 1 : -1;
      const d = p - 0.07, dd = Math.min(Math.abs(d), Math.abs(d - 1), Math.abs(d + 1));
      bob += Math.exp(-(dd * dd) / (0.11 * 0.11));
      side += s * stanceOf(p, G.duty);
      tw += s * Math.cos(TAU * p);
    });
    side /= Math.max(1, n / 2); tw /= n;
    add(P, 's', 'body', (G.sway || 0) * side * w, -(G.bob || 0) * bob * w, 0);
    add(P, 'b', 'body', (G.lean || 0) * w, -(G.twist || 0) * tw * w, -(G.roll || 0) * side * w);
    if (st.by.torso) add(P, 'b', 'torso', 0, (G.twist || 0) * 0.7 * tw * w, (G.roll || 0) * 0.5 * side * w);
    const arms = G.arms || {};
    for (const bn in arms) {
      const a = arms[bn], li = a[3] != null ? a[3] : (/_l(_|$)|L$/.test(bn) ? 0 : 1);
      const c = Math.cos(TAU * ((ph + (G.offsets[li] || 0)) % 1) - 0.4);
      add(P, 'b', bn, a[0] * c * w, a[1] * c * w, a[2] * c * w);
    }
    if (st.A.anim.walk) st.A.anim.walk(P, ph, w, st);
  }
  function layerAttack(st, P, a, w) {
    const K = st.attack.keys;
    if (w <= 0 || !K || K.length < 2) return;
    let i = 0;
    while (i < K.length - 2 && a >= K[i + 1][0]) i++;
    const k0 = K[i], k1 = K[i + 1], u = (EASE[k1[2] || 's'] || smooth)(clamp((a - k0[0]) / Math.max(1e-6, k1[0] - k0[0]), 0, 1));
    for (const ch of ['b', 's']) {
      const A0 = k0[1][ch] || {}, A1 = k1[1][ch] || {};
      const names = Object.keys(A0).concat(Object.keys(A1).filter(function (n) { return !(n in A0); }));
      for (const nm of names) {
        const x = A0[nm] || [0, 0, 0], y = A1[nm] || [0, 0, 0];
        add(P, ch, nm, (x[0] + (y[0] - x[0]) * u) * w, (x[1] + (y[1] - x[1]) * u) * w, (x[2] + (y[2] - x[2]) * u) * w);
      }
    }
    const S0 = k0[1].sc || {}, S1 = k1[1].sc || {};
    for (const nm of Object.keys(S0).concat(Object.keys(S1).filter(function (n) { return !(n in S0); }))) {
      const x = S0[nm] == null ? 1 : S0[nm], y = S1[nm] == null ? 1 : S1[nm];
      P.sc[nm] = (P.sc[nm] == null ? 1 : P.sc[nm]) * (1 + (x + (y - x) * u - 1) * w);
    }
  }

  /* ------------------------------------------------------------ legs: planting, stepping, IK */
  const _T = new V3(), _P = new V3(), _S = new V3(), _q1 = new Q(), _q2 = new Q(), _e = new THREE.Euler(), _m = new THREE.Matrix4();
  function restWorld(g, L, out) { return out.set(L.def.rest[0], L.def.ankleH, L.def.rest[1]).applyMatrix4(g.matrixWorld); }
  function groundAt(g, opt, v) { return opt && opt.ground ? opt.ground(v.x, v.z) : g.matrixWorld.elements[13]; }
  function solveLeg(st, L, T, pitch) {
    const d = L.def, yaw = L.yaw;
    _T.copy(T); yaw.parent.worldToLocal(_T);
    const dx = _T.x - yaw.position.x, dy = _T.y - yaw.position.y, dz = _T.z - yaw.position.z;
    let ya = 0, roll = 0, r, h;
    if (d.splay) { ya = Math.atan2(dx, dz); r = Math.hypot(dx, dz); h = dy; }
    else { roll = Math.atan2(dx, -dy); r = dz; h = -Math.hypot(dx, dy); }
    const L1 = d.L1, L2 = d.L2;
    let D = Math.hypot(r, h);
    st.reach = Math.max(st.reach, D / (L1 + L2));
    D = clamp(D, Math.abs(L1 - L2) + 1e-3, (L1 + L2) * 0.9995);
    const ft = Math.atan2(r, -h);
    const a = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
    const k = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
    const s = d.knee, f1 = ft + s * a;
    yaw.quaternion.setFromEuler(_e.set(0, ya, roll, 'YZX'));
    L.hip.quaternion.setFromEuler(_e.set(-f1, 0, 0, 'XYZ'));
    L.knee.quaternion.setFromEuler(_e.set(s * (Math.PI - k), 0, 0, 'XYZ'));
    yaw.updateMatrixWorld(true);
    L.knee.matrixWorld.decompose(_P, _q1, _S);
    _q2.setFromEuler(_e.set(pitch, d.footYaw * ya, 0, 'YXZ')).premultiply(st.gq);
    L.ankle.quaternion.copy(_q1.invert().multiply(_q2));
    L.ankle.updateMatrixWorld(true);
  }
  function stepLegs(g, st, dt, opt, walking) {
    const G = st.gait, Ts = (1 - G.duty) * G.period;
    if (!st.planted) {
      for (const L of st.legs) { restWorld(g, L, L.plant); L.plant.y = groundAt(g, opt, L.plant) + L.def.ankleH; }
      st.planted = true;
    }
    let swinging = 0;
    for (const L of st.legs) if (L.swing) swinging++;
    st.legs.forEach(function (L, i) {
      const p = (st.phase + (G.offsets[i] || 0)) % 1;
      /* start a step: on the phase while walking; when standing, put back a foot that has strayed */
      if (!L.swing) {
        let go = false, late = false;
        if (walking) {
          go = L.lastP < G.duty && p >= G.duty;
          /* a foot left far behind (the host outran the gait, or turned hard) steps at once, from the start of a swing */
          if (!go) { restWorld(g, L, _T); go = late = Math.hypot(_T.x - L.plant.x, _T.z - L.plant.z) > G.stride * 1.05; }
        }
        else if (!swinging) {
          restWorld(g, L, _T);
          if (Math.hypot(_T.x - L.plant.x, _T.z - L.plant.z) > (G.settle || 0.12)) { go = true; swinging++; }
        }
        if (go) { L.swing = true; L.u = walking && !late ? clamp((p - G.duty) / (1 - G.duty), 0, 0.5) : 0; L.from.copy(L.plant); }
      }
      L.lastP = p;
      if (L.swing) {
        L.u += dt / Ts;
        restWorld(g, L, L.to);
        if (walking) L.to.addScaledVector(st.vel, Ts * Math.max(0, 1 - L.u) + G.duty * G.period / 2);
        L.to.y = groundAt(g, opt, L.to) + L.def.ankleH;
        if (L.u >= 1) {
          L.swing = false; L.plant.copy(L.to);
          st.events.push({ type: 'step', key: st.key, leg: L.def.name, pos: [L.plant.x, L.plant.y - L.def.ankleH, L.plant.z], mass: st.mass });
        }
      }
      let pitch = 0;
      if (L.swing) {
        const u = L.u, hu = smooth(Math.min(1, u / 0.85));
        _T.copy(L.from).lerp(L.to, hu);
        _T.y += (G.lift || 0.3) * Math.pow(Math.sin(Math.PI * u), u < 0.5 ? 0.7 : 1.5);
        pitch = L.def.toe * (0.6 * (1 - u) * (1 - u) - 0.5 * Math.sin(Math.PI * u) * u);
      } else {
        _T.copy(L.plant);
        if (walking) pitch = L.def.toe * 0.6 * smooth((p - G.duty * 0.72) / (G.duty * 0.28));
      }
      L.pitch += (pitch - L.pitch) * Math.min(1, dt * 20);
      solveLeg(st, L, _T, L.pitch);
    });
  }

  /* ------------------------------------------------------------ dangles, spins, cloth */
  const _a = new V3(), _gv = new V3();
  function stepDangles(st, dt) {
    for (const D of st.dang) {
      const d = D.def, b = D.bone, par = b.parent;
      _P.copy(b.position).applyMatrix4(par.matrixWorld);
      par.matrixWorld.decompose(_S, _q1, _gv);
      _q1.invert();
      const gl = _gv.set(0, -1, 0).applyQuaternion(_q1);
      if (!D.p0) {
        D.p0 = _P.clone(); D.v0 = new V3();
        /* a hanging thing starts at rest, plumb under its pivot */
        if (d.mode !== 'whip') { D.ax = clamp(Math.atan2(-gl.z, -gl.y), -d.max, d.max); D.az = clamp(Math.atan2(gl.x, -gl.y), -d.max, d.max); }
      }
      if (dt > 0) {
        const v = _a.copy(_P).sub(D.p0).divideScalar(dt);
        D.acc.lerp(v.clone().sub(D.v0).divideScalar(dt), 0.25);
        D.v0.copy(v); D.p0.copy(_P);
      }
      const al = _a.copy(D.acc).applyQuaternion(_q1);
      const n = Math.max(1, Math.ceil(dt / (1 / 60))), h = dt / n, wind = d.wind * (wob(st.t * 2.3 + d.len * 7) + 0.5 * wob(st.t * 5.1 + 3));
      for (let i = 0; i < n; i++) {
        let fx, fz;
        if (d.mode === 'whip') {
          fx = -d.k * D.ax - d.c * D.vx - al.z / d.len * 0.5 + wind * d.k;
          fz = -d.k * D.az - d.c * D.vz + al.x / d.len * 0.5 + wind * d.k * 0.6;
        } else {
          const ex = Math.atan2(-gl.z, -gl.y), ez = Math.atan2(gl.x, -gl.y);
          fx = -d.k * (D.ax - ex) - d.c * D.vx + al.z / d.len + wind * d.k;
          fz = -d.k * (D.az - ez) - d.c * D.vz - al.x / d.len + wind * d.k * 0.6;
        }
        D.vx += fx * h; D.vz += fz * h; D.ax += D.vx * h; D.az += D.vz * h;
        D.ax = clamp(D.ax, -d.max, d.max); D.az = clamp(D.az, -d.max, d.max);
      }
      b.quaternion.copy(st.rest[st.bones.indexOf(b)].q).multiply(_q2.setFromEuler(_e.set(D.ax, 0, D.az, 'XYZ')));
      b.updateMatrixWorld(true);
    }
  }
  function stepCloth(g, st) {
    const t = st.t, sp = st.vel.length();
    for (const C of st.cloth) {
      const B = C.def, m = C.mesh, p = m.geometry.attributes.position, A = (B.flutter || 0.05) + 0.035 * Math.min(sp, 2);
      /* the wind of walking, in the cloth's frame: a hanging banner billows away from where it is going */
      m.matrixWorld.decompose(_S, _q1, _gv);
      const vl = _a.copy(st.vel).applyQuaternion(_q1.invert());
      const bill = B.kind === 'hang' ? -vl.z * 0.12 : -vl.x * 0.1;
      for (let i = 0; i < p.count; i++) {
        const w = C.W[i], s = C.S[i], f = Math.pow(w, 1.3);
        const dsp = f * (A * Math.sin(t * 3.1 + C.seed - s * 4.2) + A * 0.5 * Math.sin(t * 5.3 + C.seed * 2 - s * 7.1)) + w * bill;
        if (B.kind === 'hang') p.setZ(i, C.base[i * 3 + 2] + dsp);
        else p.setX(i, C.base[i * 3] + dsp);
      }
      p.needsUpdate = true;
      m.geometry.computeVertexNormals();
    }
  }

  /* ------------------------------------------------------------ the step */
  function pose(g, st, dt, opt) {
    st.t += dt;
    g.updateMatrixWorld(true);
    g.matrixWorld.decompose(_P, st.gq, _S);
    /* a jump further than it could walk in a frame is a teleport (placed after building, moved by the host): plant afresh */
    if (st.last && _T.copy(_P).sub(st.last).length() > Math.max(1.5, 6 * mechSpeed(st.gait) * dt)) { st.planted = false; st.last = null; st.vel.set(0, 0, 0); }
    if (st.last && dt > 0) st.vel.lerp(_T.copy(_P).sub(st.last).divideScalar(dt), Math.min(1, dt * 8));
    st.last = (st.last || new V3()).copy(_P);
    const G = st.gait, walking = st.mode === 'walk' && st.atk < 0;
    st.walkW = clamp(st.walkW + (walking ? dt / 0.5 : -dt / 0.6), 0, 1);
    if (walking) st.phase = (st.phase + dt / G.period) % 1;
    /* the attack clip */
    let atkW = 0;
    if (st.atk >= 0) {
      const a0 = st.atk, AT = st.attack;
      st.atk += dt;
      for (const E of AT.events || []) if (E.t > a0 && E.t <= st.atk) fire(g, st, E);
      if (st.atk >= AT.dur) { st.atk = -1; st.mode = st.resume; }
      else atkW = smooth(Math.min(st.atk / 0.12, (AT.dur - st.atk) / 0.12, 1));
    }
    st.atkW = atkW;
    const P = { b: {}, s: {}, sc: {} };
    layerIdle(st, P, st.t, 1 - 0.75 * st.walkW);
    layerWalk(st, P, st.phase, st.walkW);
    if (st.atk >= 0) layerAttack(st, P, st.atk, 1);
    /* spins */
    for (const S of st.spins) {
      const r = S.def.rates, base = r.idle + (r.walk - r.idle) * st.walkW;
      S.ang = (S.ang + (base + ((r.attack || base) - base) * atkW) * dt) % TAU;
    }
    /* every bone but the legs' (IK) and the dangles' (springs): rest, then the pose on top */
    st.bones.forEach(function (b, i) {
      if (st.legBone[b.name] || st.dangle[b.name]) return;
      const R0 = st.rest[i], rot = P.b[b.name], sl = P.s[b.name], sc = P.sc[b.name], S = st.spin[b.name];
      b.position.copy(R0.p);
      if (sl) { b.position.x += sl[0]; b.position.y += sl[1]; b.position.z += sl[2]; }
      b.quaternion.copy(R0.q);
      if (rot) b.quaternion.multiply(_q1.setFromEuler(_e.set(rot[0], rot[1], rot[2], 'YXZ')));
      if (S) {
        const sa = st.spins.find(function (x) { return x.def === S; }).ang;
        b.quaternion.multiply(_q1.setFromEuler(_e.set(S.axis === 'x' ? sa : 0, S.axis === 'y' ? sa : 0, S.axis === 'z' ? sa : 0, 'XYZ')));
      }
      const k = sc == null ? 1 : Math.max(1e-4, sc);
      b.scale.set(k, k, k);
    });
    for (const b of st.bones) if (!b.parent.isBone) b.updateMatrixWorld(true);
    stepLegs(g, st, dt, opt, walking);
    stepDangles(st, dt);
    stepCloth(g, st);
    const ev = st.events; st.events = [];
    return ev;
  }
  function fire(g, st, E) {
    const pt = E.at && st.points[E.at], bone = pt ? st.by[pt.bone] : st.by[E.bone];
    if (!bone) return;
    bone.updateMatrixWorld(true);
    const pos = new V3().fromArray(pt ? pt.p : (E.local || [0, 0, 0])).applyMatrix4(bone.matrixWorld);
    bone.matrixWorld.decompose(_P, _q1, _S);
    const dir = new V3().fromArray(E.dir || [0, 0, 1]).applyQuaternion(_q1).normalize();
    st.events.push({ type: E.type, kind: E.kind || '', key: st.key, pos: pos.toArray(), dir: dir.toArray(), speed: E.speed || 0, r: E.r || 0 });
  }

  /* ------------------------------------------------------------ the public face */
  function S(g) { return g && g.userData && g.userData._mech; }
  API.update = function (g, dt, opt) { const st = S(g); return st ? pose(g, st, Math.max(0, Math.min(dt || 0, 0.1)), opt) : []; };
  API.setState = function (g, mode) {
    const st = S(g);
    if (!st || (mode !== 'idle' && mode !== 'walk')) return null;
    if (st.atk >= 0) { st.resume = mode; return mode; }
    if (mode === 'walk' && st.mode !== 'walk') {
      const G = st.gait;
      st.phase = ((G.duty - (G.offsets[0] || 0) - 0.002) % 1 + 1) % 1;
      /* a leg already in its swing part of the cycle steps now, rather than waiting a whole stance and trailing behind */
      st.legs.forEach(function (L, i) {
        const p = (st.phase + (G.offsets[i] || 0)) % 1;
        L.lastP = p;
        if (p >= G.duty && !L.swing) { L.swing = true; L.u = 0; L.from.copy(L.plant); }
      });
    }
    st.mode = mode;
    return mode;
  };
  API.attack = function (g) {
    const st = S(g);
    if (!st || !st.attack || st.atk >= 0) return 0;
    st.resume = st.mode; st.mode = 'idle'; st.atk = 0;
    return st.attack.dur;
  };
  API.state = function (g) {
    const st = S(g);
    return st ? { mode: st.mode, attacking: st.atk >= 0, attackT: st.atk, phase: st.phase, walkW: st.walkW,
      stepping: st.legs.some(function (L) { return L.swing; }), reach: st.reach } : null;
  };
  API.speed = function (g) { const st = S(g); return st ? mechSpeed(st.gait) : 0; };
  /* back to the first frame: standing, feet re-planted where the group now is */
  API.reset = function (g) {
    const st = S(g);
    if (!st) return;
    st.t = 0; st.mode = 'idle'; st.resume = 'idle'; st.walkW = 0; st.phase = 0; st.atk = -1; st.atkW = 0; st.vel.set(0, 0, 0);
    st.last = null; st.planted = false; st.reach = 0;
    for (const L of st.legs) { L.swing = false; L.u = 0; L.pitch = 0; L.lastP = 0; }
    for (const D of st.dang) { D.ax = D.az = D.vx = D.vz = 0; D.p0 = null; D.acc.set(0, 0, 0); }
    for (const Sp of st.spins) Sp.ang = 0;
    pose(g, st, 0, null);
  };
  /* the legs' world plants and the named points, for a host (footprints, muzzle flash) */
  API.feet = function (g) {
    const st = S(g);
    return st ? st.legs.map(function (L) { return { name: L.def.name, planted: !L.swing, pos: [L.plant.x, L.plant.y - L.def.ankleH, L.plant.z] }; }) : [];
  };
  API.point = function (g, name) {
    const st = S(g), pt = st && st.points[name];
    if (!pt) return null;
    const b = st.by[pt.bone];
    b.updateMatrixWorld(true);
    return new V3().fromArray(pt.p).applyMatrix4(b.matrixWorld).toArray();
  };
  API.lights = function (g, on) {
    const st = S(g);
    if (!st) return false;
    st.glow.color.setRGB(on ? 1 : 0.16, on ? 1 : 0.14, on ? 1 : 0.12);
    g.userData.lightsOn = !!on;
    return !!on;
  };
  /* something the mech looses, to fly: 'bolt' (a ballista bolt, 1.5 m), 'harpoon' (2.6 m, barbed, with a line),
     'rivet' (a glowing slug). A plain Group, +z forward, origin at its middle. */
  const _projMat = {};
  API.projectile = function (kind) {
    const F = mechFrame({ seed: 1 });
    F.asset = { culture: '' };
    const g0 = new THREE.Group(), prev = _target;
    _target = g0;
    try {
      if (kind === 'rivet') {
        F.cy(0, 0, 0, 0.11, 0.11, 0.3, 0xff8a2a, 'glow', 'z', 10);
        F.sph(0, 0, 0.15, 0.11, 0.11, 0.08, 0xffc070, 'glow', 10, 6);
      } else {
        const L = kind === 'harpoon' ? 2.6 : 1.5, r = kind === 'harpoon' ? 0.05 : 0.032;
        F.rod(0, 0, -L / 2, 0, 0, L / 2, r, 0x6a4e32, 'wood');
        F.cy(0, 0, L / 2 + 0.12, r * 2.2, 0.004, 0.28, 0x3a3836, 'metal', 'z', 6);
        if (kind === 'harpoon') for (const s of [-1, 1]) F.rod(0, 0, L / 2 - 0.02, s * 0.14, 0, L / 2 - 0.22, 0.02, 0x3a3836, 'metal');
        for (let k = 0; k < 3; k++) { const a = k * TAU / 3; F.tri([0, 0, -L / 2 + 0.05], [Math.cos(a) * 0.1, Math.sin(a) * 0.1, -L / 2], [0, 0, -L / 2 + 0.3], 0xd8742a, 'feather'); }
      }
    } finally { _target = prev; }
    const out = new THREE.Group();
    g0.updateMatrixWorld(true);
    g0.traverse(function (o) {
      if (!o.isMesh) return;
      const fam = o.material.userData.family || '', glow = fam === 'glow';
      const key = (glow ? 'g' : 's') + o.material.color.getHexString();
      const m = _projMat[key] || (_projMat[key] = glow ? new THREE.MeshBasicMaterial({ color: o.material.color.clone().convertSRGBToLinear() })
        : new THREE.MeshStandardMaterial({ color: o.material.color.clone().convertSRGBToLinear(), roughness: 0.7, metalness: fam === 'metal' ? 0.5 : 0 }));
      const mesh = new THREE.Mesh(o.geometry, m);
      mesh.applyMatrix4(o.matrixWorld); mesh.castShadow = true;
      out.add(mesh);
    });
    out.name = 'projectile:' + (kind || 'bolt');
    return out;
  };
  API.dispose = function (g) {
    const st = S(g);
    g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    if (st) { st.glow.dispose(); for (const C of st.cloth) C.mesh.material.dispose(); }
  };
  return API;
})();
