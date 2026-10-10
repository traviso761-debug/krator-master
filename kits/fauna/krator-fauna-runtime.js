/* ======================================================================
   Krator Fauna: the runtime (kits/fauna/krator-fauna-runtime.js), the only thing the bundle exposes:

     KratorFauna.list()                      every entry: { key, name, group, variants, variantNames, w, d, h, breeds }
     KratorFauna.entry(key)                  the entry (data: tags, traits, yields, life, data)
     KratorFauna.build(key, { variant, breed, pose, seed })   -> a THREE.Group: one child group per PART turned about its
                                             pivot (userData.parts: { body, head, tail, jaw, earL, earR, legs:[4] }),
                                             userData { key, name, variant, breed, tags, traits, yields, life, data,
                                             anchors, tris, w, d, h }. Origin under the body on the ground, +z the snout.
     KratorFauna.animate(group, t, mode, o)  mode 'idle' | 'graze' | 'walk' | 'rest'; t seconds; o.phase offsets the herd.
                                             It only turns the part groups (and bobs the body): the geometry never changes.
     KratorFauna.profile(key, breed, pose)   the body profile a host fits tack to (the salamander's: at(t) -> {z,y,hw,hh})
     KratorFauna.lifeOf(key)                 the life layer's record: faction-free data a world gives a faction and a job
     KratorFauna.setTextures(on), textures() the library detail maps (FA_TEX, packed by fauna_bundle.py): { pending, families }
     KratorFauna.warm()                      start every detail map decoding now
   Materials are shared per family across every animal on a page (one program each). A family with a packed map gets
   it as a triplanar DETAIL map in the part's own frame (the pattern rides on a moving leg); the vertex colour keeps
   the animal's colour and the set's mean brightness is divided back out. Colours are linear (the renderer's sRGB
   output converts them).
   ====================================================================== */
const KratorFaunaAPI = (function () {
  'use strict';
  /* per family: [roughness, metalness, detail strength (0 the vertex colour alone, 1 the full map)] */
  const LOOK = { coat: [0.95, 0, 0.6], hair: [0.9, 0, 0.8], skin: [0.45, 0, 0.75], horn: [0.5, 0, 0.8], hoof: [0.6, 0, 1], eye: [0.12, 0, 1], mouth: [0.6, 0, 1], plain: [0.8, 0, 1],
    chitin: [0.35, 0.05, 0.8], membrane: [0.88, 0, 0.7], glow: [1, 0, 0], scale: [0.55, 0, 0.85], sleek: [0.7, 0, 0.55], feather: [0.85, 0, 0.7], shag: [0.95, 0, 0.75] };
  const MATS = {}, TEXST = { on: typeof FA_TEX !== 'undefined' && !!FA_TEX, pending: 0, families: [] }, TEXC = {};
  function detail(fam) {
    if (!TEXST.on || typeof FA_TEX === 'undefined' || !FA_TEX || !FA_TEX[fam]) return null;
    if (TEXC[fam]) return TEXC[fam];
    const L = FA_TEX[fam], t = new THREE.Texture(), img = new Image();
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    TEXST.pending++; img.onload = function () { t.image = img; t.needsUpdate = true; TEXST.pending--; }; img.onerror = function () { TEXST.pending--; };
    img.src = L.map; TEXST.families.push(fam);
    return (TEXC[fam] = { map: t, tile: 1 / (L.scale || 0.3), gain: 1 / Math.max(0.05, Math.pow(L.mean == null ? 0.5 : L.mean, 2.2)) });
  }
  function material(fam) {
    if (MATS[fam]) return MATS[fam];
    const lk = LOOK[fam] || LOOK.plain;
    /* glow: unlit, its vertex colour is its light (a glint's abdomen); membrane and hair: seen from both sides (wings, locks) */
    if (fam === 'glow') return (MATS[fam] = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: lk[0], metalness: lk[1], side: fam === 'hair' || fam === 'membrane' || fam === 'feather' ? THREE.DoubleSide : THREE.FrontSide });
    if (fam === 'eye') m.emissive = new THREE.Color(0x050403);
    const D = detail(fam);
    if (D) {
      m.map = D.map;
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uDetTile = { value: D.tile }; sh.uniforms.uDetGain = { value: D.gain }; sh.uniforms.uDetMix = { value: lk[2] == null ? 1 : lk[2] };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFaP;varying vec3 vFaN;')
          .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFaP=position;vFaN=normal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vFaP;varying vec3 vFaN;uniform float uDetTile;uniform float uDetGain;uniform float uDetMix;')
          .replace('#include <map_fragment>', ['#ifdef USE_MAP', 'vec3 fW=pow(abs(normalize(vFaN))+1e-4,vec3(4.0));fW/=(fW.x+fW.y+fW.z);vec3 fP=vFaP*uDetTile;',
            'vec4 texelColor=texture2D(map,fP.zy)*fW.x+texture2D(map,fP.xz)*fW.y+texture2D(map,fP.xy)*fW.z;texelColor=mapTexelToLinear(texelColor);',
            'diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*uDetGain,uDetMix);', '#endif'].join('\n'));
      };
      m.customProgramCacheKey = function () { return 'fauna-det-' + fam; };
    }
    return (MATS[fam] = m);
  }
  function mesh(b, fam) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
    g.setIndex(b.pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.idx, 1) : new THREE.Uint16BufferAttribute(b.idx, 1));
    g.computeVertexNormals(); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, material(fam)); m.castShadow = fam !== 'eye'; m.receiveShadow = true; m.userData.family = fam;
    return m;
  }
  /* ---- model variants: a baked model (Meshy) packed by models_pack.py into FA_MODELS, one per entry variant (entry.models:
       { variant: modelKey }). A model is a tree of nodes (each a part with its own pivot), its clips and three baked maps;
       it is built into the same shape as any animal: a Group whose userData.parts names the kit's parts (head, tail,
       leg0..N, wingL/R, wing2L/R, segN), animated by animate() from its clips: idle and rest play 'perch', walk plays 'walk',
       fly plays 'flap' (or 'glide' when o.glide). Geometry and maps are decoded once per model and shared by every build. */
  const MODELC = {};
  function buf64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; }
  function modelTex(url, srgb) {
    const t = new THREE.Texture(), img = new Image(); t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; if (srgb) t.encoding = THREE.sRGBEncoding;
    TEXST.pending++; img.onload = function () { t.image = img; t.needsUpdate = true; TEXST.pending--; }; img.onerror = function () { TEXST.pending--; };
    img.src = url; return t;
  }
  function modelOf(mkey) {
    if (MODELC[mkey]) return MODELC[mkey];
    const M = typeof FA_MODELS !== 'undefined' && FA_MODELS && FA_MODELS[mkey]; if (!M) throw new Error('KratorFauna: model ' + mkey + ' is not in this bundle');
    const geo = {};
    for (const n in M.meshes) {
      const m = M.meshes[n], p16 = new Uint16Array(buf64(m.pos)), pos = new Float32Array(p16.length), n8 = new Int8Array(buf64(m.nrm)), nrm = new Float32Array(n8.length), u16 = new Uint16Array(buf64(m.uv)), uv = new Float32Array(u16.length);
      for (let i = 0; i < p16.length; i++) pos[i] = m.min[i % 3] + p16[i] / 65535 * m.size[i % 3];
      for (let i = 0; i < n8.length; i++) nrm[i] = n8[i] / 127;
      for (let i = 0; i < u16.length; i++) uv[i] = u16[i] / 65535;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(new THREE.BufferAttribute(m.wide ? new Uint32Array(buf64(m.idx)) : new Uint16Array(buf64(m.idx)), 1)); g.computeBoundingSphere(); geo[n] = g;
    }
    const mr = modelTex(M.tex.mr, false);
    const mat = new THREE.MeshStandardMaterial({ map: modelTex(M.tex.map, true), normalMap: modelTex(M.tex.nrm, false), metalnessMap: mr, roughnessMap: mr, metalness: 1, roughness: 1, side: THREE.DoubleSide });
    const clips = {};
    for (const cn in M.anims) {
      const A = M.anims[cn], tr = [];
      for (const k of A.tracks) { const t = new Float32Array(buf64(k.t)), v = new Float32Array(buf64(k.v));
        tr.push(k.path === 'quaternion' ? new THREE.QuaternionKeyframeTrack(k.node + '.quaternion', t, v) : new THREE.VectorKeyframeTrack(k.node + (k.path === 'scale' ? '.scale' : '.position'), t, v)); }
      clips[cn] = new THREE.AnimationClip(cn, A.dur, tr);
    }
    return (MODELC[mkey] = { M: M, geo: geo, mat: mat, clips: clips });
  }
  function buildModel(E, key, opt) {
    const v = opt.variant | 0, mc = modelOf(E.models[v]), M = mc.M, S = M.scale, root = new THREE.Group(); root.name = 'fauna:' + key;
    const top = new THREE.Group(); top.scale.setScalar(S); top.position.set(-M.rest.center[0] * S, -M.rest.ground * S, -M.rest.center[1] * S); root.add(top);
    const gs = M.nodes.map(nd => { const g = new THREE.Group(); g.name = nd.name; g.position.set(nd.t[0], nd.t[1], nd.t[2]); g.userData.rest = { x: nd.t[0] * S, y: nd.t[1] * S, z: nd.t[2] * S };
      const geo = mc.geo[nd.name]; if (geo) { const m = new THREE.Mesh(geo, mc.mat); m.castShadow = true; m.receiveShadow = true; m.userData.family = 'model'; g.add(m); } return g; });
    M.nodes.forEach((nd, i) => (nd.parent < 0 ? top : gs[nd.parent]).add(gs[i]));
    const P = { legs: [] }, side = s => (s === 'R' ? 1 : 0);
    M.nodes.forEach((nd, i) => { const g = gs[i], n = nd.name; let m;
      if ((m = /^leg(\d)([LR])$/.exec(n))) P.legs[2 * +m[1] + side(m[2])] = g;           /* hexapod: leg0L, leg0R, leg1L ... = the kit's order */
      else if ((m = /^leg([LR])$/.exec(n))) P.legs[side(m[1])] = g;                     /* biped */
      else if ((m = /^leg(\d+)$/.exec(n))) P.legs[+m[1]] = g;                           /* a chain: front to back, left then right */
      else if ((m = /^seg(\d+)$/.exec(n))) (P.segs || (P.segs = []))[+m[1]] = g;
      else if (n === 'head' || n === 'tail' || /^wing2?[LR]$/.test(n)) P[n] = g;
      else if (n === 'abd') P.tail = g;
      else if (!P.body && /^(torso|thorax|rig)$/.test(n)) P.body = g; });
    if (!P.body) P.body = top;
    const dm = (E.variantDims && E.variantDims[v]) || { w: E.w, d: E.d, h: E.h };
    let walk = M.anims.walk && M.anims.walk.extras;
    root.userData = { key: key, name: E.name, variant: v, variantName: E.variantNames[v] || '', breed: null, S: 1, model: E.models[v], tags: E.tags, traits: E.traits, yields: E.yields, life: E.life, data: E.data, size: E.size, source: E.source,
      anchors: {}, parts: P, tris: M.tris, w: dm.w, d: dm.d, h: dm.h, fauna: true, walkSpeed: walk ? walk.speed * S : 0, walkStride: walk ? walk.stride * S : 0, modelTop: top };
    const mixer = new THREE.AnimationMixer(top), acts = {};
    for (const cn in mc.clips) { acts[cn] = mixer.clipAction(mc.clips[cn]); acts[cn].setLoop(THREE.LoopRepeat, Infinity); }
    root.userData._mx = { mixer: mixer, acts: acts, cur: null, clips: mc.clips };
    animate(root, 0, 'idle'); return root;
  }
  function animateModel(g, t, mode, o) {
    o = o || {}; const mx = g.userData._mx, has = n => !!mx.acts[n];
    const cn = mode === 'walk' && has('walk') ? 'walk' : mode === 'fly' ? (o.glide && has('glide') ? 'glide' : has('flap') ? 'flap' : has('hover') ? 'hover' : 'perch') : 'perch';
    if (mx.cur !== cn) { if (mx.cur) mx.acts[mx.cur].stop(); mx.acts[cn].reset().play(); mx.cur = cn; }
    const a = mx.acts[cn], dur = mx.clips[cn].duration, tm = t * (o.rate || 1) + (o.phase || 0) / TAU * dur;
    a.time = ((tm % dur) + dur) % dur; mx.mixer.update(0);
  }
  function build(key, opt) {
    const E = ANIMAL_BY_KEY[key]; if (!E) throw new Error('KratorFauna.build: no animal ' + key);
    opt = opt || {};
    if (E.models && E.models[opt.variant | 0]) return buildModel(E, key, opt);
    const A = faunaFrame(E, opt);
    E.build(A);
    const root = new THREE.Group(); root.name = 'fauna:' + key;
    const P = { legs: [] }; let tris = 0;
    const order = Object.keys(A.parts).sort((a, b) => (a === 'body' ? -1 : b === 'body' ? 1 : 0));
    for (const name of order) {
      const part = A.parts[name], grp = new THREE.Group();
      grp.name = name; grp.position.set(part.pivot[0], part.pivot[1], part.pivot[2]); grp.userData.rest = { x: part.pivot[0], y: part.pivot[1], z: part.pivot[2] };
      for (const fam in part.buckets) { const b = part.buckets[fam]; if (!b.idx.length) continue; grp.add(mesh(b, fam)); tris += b.idx.length / 3; }
      root.add(grp);
      const m = /^leg(\d+)$/.exec(name), sg = /^seg(\d+)$/.exec(name);
      if (m) P.legs[+m[1]] = grp; else if (sg) (P.segs || (P.segs = []))[+sg[1]] = grp; else P[name] = grp;
    }
    /* parts that hang off the head (ears, the jaw) turn with it: reparent them into the head, keeping their place */
    for (const n of ['earL', 'earR', 'jaw', 'beard', 'crest']) if (P[n] && P.head) { const g = P[n]; g.position.sub(P.head.position); P.head.add(g); }
    const vd = (E.variantDims && E.variantDims[A.variant]) || { w: E.w, d: E.d, h: E.h };
    root.userData = { key: key, name: E.name, variant: A.variant, variantName: E.variantNames[A.variant] || '', breed: A.breed, S: A.S,
      tags: E.tags, traits: E.traits, yields: E.yields, life: E.life, data: E.data, size: E.size, source: E.source, anchors: A.anchors, parts: P, tris: Math.round(tris),
      w: vd.w * A.S, d: vd.d * A.S, h: vd.h * A.S, fauna: true };
    animate(root, 0, 'idle');   /* a bare build stands in its rest pose (a flyer's wings folded) */
    return root;
  }
  /* ---- animation: turns only, by the animal's gait (data.gait.type):
       quadruped  diagonal pairs swing about x (front left with hind right)      biped   two legs alternate, the head bobs
       sprawl     legs swing about y, body and tail weave (salamanders, lizards)  hexapod tripods alternate (0,3,4 / 1,2,5)
       octopod    alternating fours swing about y (spiders)                       multipede  a wave runs down the legs and segments
       flyer      wings flap about z (mode 'fly'; folded at 'idle'/'rest'), legs tucked in flight (flap.tuck); a flyer with legs
                  walks as a biped (2 legs), a quadruped (4) or a hexapod (6), and so does an insect
       insect     wings beat fast (any mode but 'rest')                            swimmer  tail and segments sweep side to side
       climber    hangs from a bough (a 'grip' anchor); walks hand over hand along it (limbs swing about z)
       none       nothing moves
     modes: idle, graze, walk, rest, fly, swim. The geometry never changes; only the part groups turn (and the body bobs).
     Opt-in data, read only when an animal sets it:
       flap.sweep  perched, the wings also turn back about y by this much (left +, right -): a fold along the flanks
       flap.foldScale  perched, the wing is shortened along its span to this fraction (a folded wing is about half its spread)
       flap.roll   perched, the wing turns about its own span first (radians; ~1.3 hangs it down the flank, not across the back)
       flap.tuck   in flight the legs swing back about x by this much
       flap.sync   the second wing pair beats with the first (a moth), not against it (a dragonfly)
       swim.axis   'x': the tail beats up and down (flukes), not side to side
       chain       { amp, wave } metres: the head, segments, legs and tail ride one travelling side-to-side wave (a body
                   that snakes) in 'walk' and 'swim', not each segment yawing in place
       idle        { headYaw, headPitch, tailYaw } radians: how far the head looks about and the tail sways at idle */
  function animate(g, t, mode, o) {
    if (g.userData._mx) return animateModel(g, t, mode, o);   /* a model variant plays its own clips */
    o = o || {}; const u = g.userData, P = u.parts, D = u.data || {}, gait = D.gait || { type: 'quadruped', freq: 1.5, stride: 0.4 };
    const ph = (o.phase || 0), f = gait.freq || 1.5, w = TAU * f * t + ph, type = gait.type || 'quadruped';
    const set = (p, x, y, z) => { if (p) p.rotation.set(x || 0, y || 0, z || 0); };
    const legs = P.legs.filter(Boolean), body = P.body, segs = P.segs || [];
    if (body) body.position.y = body.userData.rest ? body.userData.rest.y : 0;
    legs.forEach(L => set(L)); segs.forEach(S => set(S)); set(body); set(P.head); set(P.tail); set(P.jaw);   /* every frame starts from rest (a mode leaves nothing behind) */
    const CH = D.chain, chained = CH ? [P.head, P.tail, P.jaw && P.jaw.parent === g ? P.jaw : null].concat(segs, legs).filter(Boolean) : null;
    if (chained) chained.forEach(q => { if (q.userData.rest) q.position.x = q.userData.rest.x; });
    const snake = (ph2, amp) => { const k = TAU / (CH.wave || 3);
      for (const q of chained) { const z0 = q.userData.rest ? q.userData.rest.z : 0, a = ph2 + k * z0;
        q.position.x = (q.userData.rest ? q.userData.rest.x : 0) + amp * Math.sin(a);
        if (legs.indexOf(q) < 0) q.rotation.y = Math.atan(amp * k * Math.cos(a)); } };
    /* wings: a flyer flaps in 'fly' (with glides), holds them folded otherwise; an insect beats them unless resting */
    const fl = D.flap || { freq: 2, amp: 0.7, glide: 0 }, wf = TAU * (fl.freq || 2) * t + ph;
    const flying = (type === 'flyer' && mode === 'fly') || (type === 'insect' && mode !== 'rest');
    const glide = fl.glide ? (Math.sin(TAU * 0.07 * t + ph) > 1 - 2 * fl.glide ? 0.15 : 1) : 1;
    const flapA = flying ? (fl.amp || 0.7) * glide * Math.sin(wf) : (type === 'flyer' ? -(fl.fold || 0) : 0);
    const sweep = flying || type !== 'flyer' ? 0 : (fl.sweep || 0), fsc = flying || type !== 'flyer' ? 1 : (fl.foldScale || 1);
    for (const n of ['wingL', 'wingR', 'wing2L', 'wing2R']) if (P[n]) P[n].scale.x = fsc;
    /* roll (perched): the wing turns about its own span first (rotation order YZX), so a folded wing hangs down the flank */
    const roll = flying || type !== 'flyer' ? 0 : (fl.roll || 0);
    for (const [n, s] of [['wingL', 1], ['wingR', -1], ['wing2L', 1], ['wing2R', -1]]) if (P[n]) {
      if (fl.roll && P[n].rotation.order !== 'YZX') P[n].rotation.order = 'YZX';
      set(P[n], -roll, s * sweep, s * (n.indexOf('2') > 0 && !fl.sync ? -flapA : flapA)); }
    if (flying && type === 'flyer' && fl.tuck) legs.forEach(L => set(L, fl.tuck, 0, 0));
    if (type === 'flyer' && mode === 'fly' && body) body.position.y = 0.04 * (u.S || 1) * Math.sin(wf + 1);
    const wt = (type === 'flyer' || type === 'insect') ? (legs.length === 2 ? 'biped' : legs.length === 4 ? 'quadruped' : legs.length === 6 ? 'hexapod' : type) : type;
    if (mode === 'walk' && !(flying && type === 'flyer')) {
      if (wt === 'sprawl') {
        const a = 0.45;
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, 0, s * a * Math.sin(w), (i % 2 ? -1 : 1) * 0.18 * Math.max(0, s * Math.cos(w))); });
        set(body, 0, 0.06 * Math.sin(w), 0); set(P.tail, 0, -0.32 * Math.sin(w - 0.8), 0); set(P.head, 0, -0.12 * Math.sin(w + 0.4), 0);
      } else if (wt === 'biped') {
        legs.forEach((L, i) => set(L, (i % 2 ? -1 : 1) * 0.5 * Math.sin(w), 0, 0));
        set(P.head, 0.08 * Math.sin(2 * w), 0, 0); set(P.tail, 0.1 * Math.sin(2 * w), 0, 0);
        if (body) body.position.y = 0.015 * Math.abs(Math.sin(w)) * (u.S || 1);
      } else if (wt === 'hexapod' || wt === 'octopod') {
        const group = i => wt === 'hexapod' ? ([0, 3, 4].indexOf(i) >= 0 ? 1 : -1) : ((Math.floor(i / 2) + i) % 2 ? -1 : 1);
        legs.forEach((L, i) => { const s = group(i); set(L, 0, s * 0.35 * Math.sin(w), (i % 2 ? -1 : 1) * 0.15 * Math.max(0, s * Math.cos(w))); });
      } else if (type === 'multipede') {
        legs.forEach((L, i) => { const k = Math.floor(i / 2); set(L, 0.45 * Math.sin(w - k * 0.6 + (i % 2) * Math.PI), 0, 0); });
        if (chained) snake(w * 0.5, CH.amp || 0.15); else segs.forEach((S, i) => set(S, 0, 0.08 * Math.sin(w * 0.5 - i * 0.5), 0));
      } else if (wt === 'climber') {   /* hanging hand over hand along a bough (along x): diagonal pairs swing about z */
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, 0, 0, s * 0.35 * Math.sin(w)); });
        set(P.head, 0, 0.1 * Math.sin(w), 0);
      } else if (wt === 'quadruped') {
        legs.forEach((L, i) => { const s = (i === 0 || i === 3) ? 1 : -1; set(L, s * 0.42 * Math.sin(w), 0, 0); });
        if (body) body.position.y = 0.012 * Math.abs(Math.sin(w)) * (u.S || 1);
        set(P.head, 0.06 * Math.sin(2 * w), 0, 0); set(P.tail, 0.15 * Math.sin(2 * w), 0, 0);
      }
    } else if (mode === 'swim' || type === 'swimmer') {
      const sw = D.swim || { freq: 0.6, amp: 0.25 }, s = TAU * (sw.freq || 0.6) * t + ph;
      if (sw.axis === 'x') { set(P.tail, (sw.amp || 0.25) * Math.sin(s), 0, 0); if (body) body.rotation.x = -0.03 * Math.sin(s - 1); set(P.head, 0.04 * Math.sin(s + 0.6), 0, 0); }
      else if (chained) snake(s, CH.amp || 0.15);
      else { set(P.tail, 0, (sw.amp || 0.25) * Math.sin(s), 0); segs.forEach((S, i) => set(S, 0, (sw.amp || 0.25) * 0.4 * Math.sin(s - i * 0.7), 0)); set(P.head, 0, -0.05 * Math.sin(s), 0); }
    } else if (mode === 'graze') {
      const nod = 0.06 * Math.sin(TAU * 0.7 * t + ph);
      set(P.head, (D.grazePitch == null ? 0.95 : D.grazePitch) + nod, 0.15 * Math.sin(TAU * 0.11 * t + ph), 0);
      set(P.tail, 0.25 * Math.max(0, Math.sin(TAU * 0.6 * t + ph * 2)), 0, 0);
      if (P.jaw) set(P.jaw, 0.12 * Math.max(0, Math.sin(TAU * 1.6 * t + ph)), 0, 0);
    } else if (mode !== 'fly') {   /* idle and rest: breathing, a slow look about, the tail */
      const k = mode === 'rest' ? 0.4 : 1, I = D.idle || {};
      if (type === 'sprawl' || type === 'octopod' || type === 'multipede') { set(P.tail, 0, (I.tailYaw == null ? 0.16 : I.tailYaw) * k * Math.sin(TAU * 0.11 * t + ph), 0); set(P.head, (I.headPitch == null ? 0.03 : I.headPitch) * Math.sin(TAU * 0.09 * t + ph), (I.headYaw == null ? 0.12 : I.headYaw) * k * Math.sin(TAU * 0.05 * t + ph * 1.7), 0); }
      else if (type !== 'none') { set(P.tail, 0.2 * k * Math.max(0, Math.sin(TAU * 0.5 * t + ph)), (I.tailYaw == null ? 0.1 : I.tailYaw) * Math.sin(TAU * 0.3 * t), 0); set(P.head, -0.05 + (I.headPitch == null ? 0.05 : I.headPitch) * Math.sin(TAU * 0.07 * t + ph), (I.headYaw == null ? 0.35 : I.headYaw) * k * Math.sin(TAU * 0.04 * t + ph * 1.3), 0); }
    }
    for (const n of ['earL', 'earR']) if (P[n]) set(P[n], 0, 0, (n === 'earL' ? 1 : -1) * 0.18 * Math.max(0, Math.sin(TAU * 0.23 * t + ph * 3)) ** 8);
  }
  function profile(key, breed, pose) {
    const E = ANIMAL_BY_KEY[key]; if (!E) return null;
    const A = faunaFrame(E, { breed: breed, pose: pose }); E.build(A);
    return A.profileFn ? { at: A.profileFn, S: A.S, anchors: A.anchors } : null;
  }
  function lifeOf(key) {
    const E = ANIMAL_BY_KEY[key]; if (!E) return null;
    return { kind: key, name: E.name, habitat: E.tags.habitat, locomotion: E.tags.locomotion, diet: E.tags.diet, feeding: E.tags.feeding, activity: E.tags.activity, temperament: E.tags.temperament,
      fleeDistance: E.data.fleeDistance || 0, aggression: E.data.aggression || 0, herd: E.data.herd || null,
      speed: E.data.speed || null, schedule: (E.data.schedule || new Array(24).fill(E.tags.activity === 'nocturnal' ? 'REST' : 'GRAZE')).slice(),
      traits: Object.assign({}, E.traits), yields: Object.assign({}, E.yields), life: Object.assign({}, E.life) };
  }
  return {
    version: 1, FAMILIES: FAUNA_FAMILIES, VOCAB: FAUNA_VOCAB, YIELDS: FAUNA_YIELDS,
    list: function () { return ANIMALS.map(e => ({ key: e.key, name: e.name, group: e.group, variants: e.variants, variantNames: e.variantNames.slice(),
      w: e.w, d: e.d, h: e.h, breeds: e.breeds ? Object.keys(e.breeds) : null, variantDims: e.variantDims || null, poses: e.poses || null })); },
    entry: function (key) { return ANIMAL_BY_KEY[key] || null; },
    has: function (key) { return !!ANIMAL_BY_KEY[key]; },
    build: build, animate: animate, profile: profile, lifeOf: lifeOf,
    setTextures: function (on) { TEXST.on = !!on && typeof FA_TEX !== 'undefined' && !!FA_TEX; },
    textures: function () { return { pending: TEXST.pending, families: TEXST.families.slice(), on: TEXST.on }; },
    /* start every packed detail map decoding now (a host that will build later, or builds only a few animals) */
    warm: function () { if (TEXST.on && typeof FA_TEX !== 'undefined' && FA_TEX) for (const f in FA_TEX) detail(f); }
  };
})();
