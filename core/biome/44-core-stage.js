// ================================================================= STAGE — the page's light, air, sky and ground as data
// [web]: reads the three.js scene and renderer and renders the sky; no build calls it while it draws. The exporters
// carry what it returns as their `stage` (BIO.export, ATMOS.export, godot/tools/export_spike.py), so a Godot scene can
// be lit, fogged, tonemapped and skied like the page (godot/krator/stage.gd). Standalone: it needs only THREE.
//
//   KSTAGE.capture({ scene, renderer, at: [x, y, z], sky: 1024, box, step, ground: h(x, z) }) -> the stage record
//     scene, renderer  default: what the page rendered last frame (godot/tools/stage_hook.js records it), else the
//                      globals `scene` and `renderer`
//     at               where the sky panorama is taken from (the tile's centre, above the ground)
//     sky              the panorama's width in pixels (height half); 0 leaves the sky out
//     box, step, ground  with a box: the ground's look sampled on that grid (below)
//
// The record (colours are three's working values, linear, as hex; a Godot importer converts them to sRGB for a
// light or an Environment colour):
//   { format: 'krator-stage', version: 1,
//     renderer: { toneMapping: 'ACESFilmic' | 'Linear' | 'Reinhard' | 'Cineon' | 'None', exposure, output: 'sRGB' | 'linear' },
//     lights: { directional: [{ dir (unit vector the light TRAVELS along), colour, intensity, shadow }],
//               hemisphere: [{ sky, ground, intensity }], ambient: [{ colour, intensity }], points: n },
//     fog: { type: 'exp2', colour, density } | { type: 'linear', colour, near, far } | null,
//     environment: { specular, diffuse, source } | null (the page lights standard materials from its sky: scene.environment),
//     background: colour | 'texture' | null,
//     sky: { png (equirectangular, sRGB, the page's sky and far scenery from `at`, nearer than skyNear clipped), size, at, near } | null,
//       skyNear defaults to half the box's shorter side, so the panorama holds exactly what the export leaves out (the page's
//       forest right outside the tile, hazed at its true distance); 1500 m without a box. What rises above `at` + near
//       (a hero canopy) is in both.
//     ground: { x0, z0, step, nx, nz, uv (per sample; exact when the ground is planar-mapped: uvFit), colour (per sample,
//               linear, the nearest vertex's; null without vertex colours), mesh, rays (how many of nine rays found it),
//               material: { type, colour, map (png), repeat, offset, flipY, vertexColours, roughness, hooked } } | null }
var KSTAGE = (function(){
 'use strict';
 const K = {};
 const hex = c => c && c.isColor ? '#' + c.getHexString() : null;
 const TONE = { 0: 'None', 1: 'Linear', 2: 'Reinhard', 3: 'Cineon', 4: 'ACESFilmic' };
 function pick(o){
  const h = window.__kstage, last = h && h.last;
  const scenes = o.scenes || (last && last.scenes.length ? last.scenes : null) ||
   [o.scene || (typeof scene !== 'undefined' ? scene : null)].filter(Boolean);
  const r = o.renderer || (last && last.renderer) || (typeof renderer !== 'undefined' ? renderer : null);
  return { scenes, renderer: r, main: o.scene || scenes[scenes.length - 1] };
 }
 K.lights = function(scenes){
  const T = THREE, L = { directional: [], hemisphere: [], ambient: [], points: 0 }, a = new T.Vector3(), b = new T.Vector3();
  scenes.forEach(s => s.traverse(o => {
   if(!o.isLight || o.visible === false) return;
   if(o.isDirectionalLight){ o.updateMatrixWorld(); a.setFromMatrixPosition(o.matrixWorld); o.target.updateMatrixWorld(); b.setFromMatrixPosition(o.target.matrixWorld);
    const d = b.sub(a).normalize(); L.directional.push({ dir: [d.x, d.y, d.z], colour: hex(o.color), intensity: o.intensity, shadow: !!o.castShadow }); }
   else if(o.isHemisphereLight) L.hemisphere.push({ sky: hex(o.color), ground: hex(o.groundColor), intensity: o.intensity });
   else if(o.isAmbientLight) L.ambient.push({ colour: hex(o.color), intensity: o.intensity });
   else L.points++; }));
  L.directional.sort((p, q) => q.intensity - p.intensity);   // the sun first
  return L;
 };
 // the sky as an equirectangular PNG: a cube camera at `at` renders every scene the page renders (its sky scene
 // first, as the page does), clipping everything nearer than `near`, and a pass unwraps the cube
 K.sky = function(scenes, r, at, w, near){
  const T = THREE, h = w / 2, size = Math.min(1024, w / 2);
  const crt = new T.WebGLCubeRenderTarget(size, { format: T.RGBAFormat, type: T.UnsignedByteType, generateMipmaps: false });
  const cam = new T.CubeCamera(near, 40000, crt); cam.position.set(at[0], at[1], at[2]); cam.updateMatrixWorld(true);
  const ac = r.autoClear, tm = r.toneMapping, cc = r.getClearColor(new T.Color()), ca = r.getClearAlpha(); r.toneMapping = T.NoToneMapping;
  // one face at a time so several scenes stack like the page's passes
  const faces = cam.children;
  for(let f = 0; f < 6; f++){ r.setRenderTarget(crt, f); r.setClearColor(0x000000, 1); r.clear();
   r.autoClear = false; scenes.forEach(s => r.render(s, faces[f])); }
  r.autoClear = ac; r.setClearColor(cc, ca);
  const rt = new T.WebGLRenderTarget(w, h, { type: T.UnsignedByteType });
  const q = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: { cube: { value: crt.texture } }, depthTest: false, depthWrite: false,
   vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
   fragmentShader: 'uniform samplerCube cube; varying vec2 vUv;\n' +
    'vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }\n' +
    'void main(){ float lon = (vUv.x - 0.5) * 6.2831853, lat = (vUv.y - 0.5) * 3.1415927;\n' +
    '  vec3 d = vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat));\n' +   // u 0.5 looks along -z (Godot's forward)
    '  vec4 c = textureCube(cube, d); gl_FragColor = vec4(toSRGB(clamp(c.rgb, 0.0, 1.0)), 1.0); }' }));
  const qs = new T.Scene(); qs.add(q); const qc = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  r.setRenderTarget(rt); r.render(qs, qc);
  const px = new Uint8Array(w * h * 4); r.readRenderTargetPixels(rt, 0, 0, w, h, px);
  r.setRenderTarget(null); r.toneMapping = tm;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'), id = g.createImageData(w, h);
  for(let y = 0; y < h; y++) id.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);   // GL rows bottom-up
  g.putImageData(id, 0, 0);
  crt.dispose(); rt.dispose(); q.geometry.dispose(); q.material.dispose();
  return { png: cv.toDataURL('image/png'), size: [w, h], at, near };
 };
 // the ground's look on a grid. The ground mesh is chosen by rays: from high above nine points of the box, the
 // candidate (opaque, not instanced, overlapping the box) hit most often at the ground height h(x, z) wins, so a
 // world-wide merged bucket of tree limbs never passes for the forest floor. Its uv is an exact affine fit of the
 // mesh's vertices over (x, z) when the ground is planar-mapped (a PlaneGeometry), else the nearest vertex's; its
 // colour is the nearest vertex's (a spatial hash).
 K.ground = function(scenes, box, step, hFn){
  const T = THREE, cands = [];
  scenes.forEach(s => s.traverse(o => {
   if(!o.isMesh || o.isInstancedMesh || o.visible === false || !o.geometry || !o.geometry.attributes.position) return;
   const m = Array.isArray(o.material) ? o.material[0] : o.material; if(!m || m.transparent) return;
   if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); o.updateMatrixWorld();
   const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
   if(bb.max.x < box[0] || bb.min.x > box[2] || bb.max.z < box[1] || bb.min.z > box[3]) return;
   cands.push(o); }));
  if(!cands.length || !hFn) return null;
  const rc = new T.Raycaster(), down = new T.Vector3(0, -1, 0), score = new Map();
  for(let a = 1; a <= 3; a++) for(let b = 1; b <= 3; b++){
   const x = box[0] + (box[2] - box[0]) * a / 4, z = box[1] + (box[3] - box[1]) * b / 4, y = hFn(x, z);
   rc.set(new T.Vector3(x, y + 5000, z), down); rc.far = 10000;
   for(const o of cands){ const h = rc.intersectObject(o, false)[0]; if(h && Math.abs(h.point.y - y) < 2) score.set(o, (score.get(o) || 0) + 1); } }
  let main = null, best = 0; score.forEach((n, o) => { if(n > best){ best = n; main = o; } });
  if(!main) return null;
  const g = main.geometry, P = g.attributes.position, U = g.attributes.uv, Cc = g.attributes.color, v = new T.Vector3(), W = new Float32Array(P.count * 3);
  for(let i = 0; i < P.count; i++){ v.fromBufferAttribute(P, i).applyMatrix4(main.matrixWorld); W[i * 3] = v.x; W[i * 3 + 1] = v.y; W[i * 3 + 2] = v.z; }
  // uv as an affine function of (x, z): least squares over the vertices, kept when it fits to 1e-4
  let fit = null;
  if(U){ const A = [[0,0,0],[0,0,0],[0,0,0]], bu = [0,0,0], bv = [0,0,0];
   for(let i = 0; i < P.count; i++){ const r = [W[i * 3], W[i * 3 + 2], 1], u = U.getX(i), w = U.getY(i);
    for(let p = 0; p < 3; p++){ bu[p] += r[p] * u; bv[p] += r[p] * w; for(let q = 0; q < 3; q++) A[p][q] += r[p] * r[q]; } }
   const solve = (M, y) => { const m = M.map((row, i) => row.concat([y[i]]));
    for(let c = 0; c < 3; c++){ let piv = c; for(let r = c + 1; r < 3; r++) if(Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r; [m[c], m[piv]] = [m[piv], m[c]];
     if(Math.abs(m[c][c]) < 1e-12) return null; for(let r = 0; r < 3; r++) if(r !== c){ const f = m[r][c] / m[c][c]; for(let k = c; k < 4; k++) m[r][k] -= f * m[c][k]; } }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]]; };
   const cu = solve(A, bu), cv = solve(A, bv);
   if(cu && cv){ let err = 0; for(let i = 0; i < P.count; i += Math.max(1, P.count >> 10)){ const x = W[i * 3], z = W[i * 3 + 2];
     err = Math.max(err, Math.abs(cu[0] * x + cu[1] * z + cu[2] - U.getX(i)), Math.abs(cv[0] * x + cv[1] * z + cv[2] - U.getY(i))); }
    if(err < 1e-4) fit = { u: cu, v: cv }; } }
  const C = 8, map = new Map();
  for(let i = 0; i < P.count; i++){ const k = Math.floor(W[i * 3] / C) + ',' + Math.floor(W[i * 3 + 2] / C); let a = map.get(k); if(!a) map.set(k, a = []); a.push(i); }
  const nearest = (x, z) => { let bi = -1, bd = Infinity; for(let r = 1; r < 6 && bi < 0; r++){ const cx = Math.floor(x / C), cz = Math.floor(z / C);
    for(let dx = -r; dx <= r; dx++) for(let dz = -r; dz <= r; dz++){ const a = map.get((cx + dx) + ',' + (cz + dz)); if(!a) continue;
     for(const i of a){ const ex = W[i * 3] - x, ez = W[i * 3 + 2] - z, d = ex * ex + ez * ez; if(d < bd){ bd = d; bi = i; } } } }
   return bi; };
  const nx = Math.floor((box[2] - box[0]) / step) + 1, nz = Math.floor((box[3] - box[1]) / step) + 1;
  const UV = new Float32Array(nx * nz * 2), COL = new Float32Array(nx * nz * 3).fill(1);
  for(let j = 0; j < nz; j++) for(let i = 0; i < nx; i++){ const x = box[0] + i * step, z = box[1] + j * step, s = j * nx + i;
   const k = (fit && !Cc) ? -1 : nearest(x, z);
   if(fit){ UV[s * 2] = fit.u[0] * x + fit.u[1] * z + fit.u[2]; UV[s * 2 + 1] = fit.v[0] * x + fit.v[1] * z + fit.v[2]; }
   else if(U && k >= 0){ UV[s * 2] = U.getX(k); UV[s * 2 + 1] = U.getY(k); }
   if(Cc && k >= 0){ COL[s * 3] = Cc.getX(k); COL[s * 3 + 1] = Cc.getY(k); COL[s * 3 + 2] = Cc.getZ(k); } }
  const m = Array.isArray(main.material) ? main.material[0] : main.material, t = m.map;
  let png = null; if(t && t.image){ try{ const im = t.image;
   if(im.toDataURL) png = im.toDataURL('image/png');
   else if(im.width){ const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); png = cv.toDataURL('image/png'); } }catch(e){} }
  const enc = a => { const u = new Uint8Array(a.buffer); let s = ''; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
   return { type: 'Float32Array', n: a.length, b64: btoa(s) }; };
  return { x0: box[0], z0: box[1], step, nx, nz, uv: enc(UV), colour: Cc ? enc(COL) : null, uvFit: fit, rays: best + '/9',
   mesh: main.name || main.userData.inspectLabel || '',
   material: { type: m.type, colour: hex(m.color), map: png, repeat: t ? [t.repeat.x, t.repeat.y] : [1, 1], offset: t ? [t.offset.x, t.offset.y] : [0, 0],
    flipY: t ? !!t.flipY : true, vertexColours: !!m.vertexColors, roughness: m.roughness == null ? null : m.roughness,
    hooked: !!(m.onBeforeCompile && m.onBeforeCompile !== T.Material.prototype.onBeforeCompile) } };
 };
 K.capture = function(o){
  o = o || {}; const T = THREE, P = pick(o), r = P.renderer, sc = P.main;
  const out = { format: 'krator-stage', version: 1,
   convention: { colours: 'linear (three\'s working values, as hex)', dir: 'the direction a light travels, world, unit', sky: 'equirectangular, sRGB, u=0.5 faces -z' },
   renderer: r ? { toneMapping: TONE[r.toneMapping] || String(r.toneMapping), exposure: r.toneMappingExposure, output: r.outputEncoding === T.sRGBEncoding ? 'sRGB' : 'linear' } : null,
   lights: K.lights(P.scenes),
   fog: sc && sc.fog ? (sc.fog.isFogExp2 ? { type: 'exp2', colour: hex(sc.fog.color), density: sc.fog.density } : { type: 'linear', colour: hex(sc.fog.color), near: sc.fog.near, far: sc.fog.far }) : null,
   background: sc && sc.background ? (sc.background.isColor ? hex(sc.background) : 'texture') : null,
   // scene.environment: the page's sky as the light on its standard materials (core/atmos/89-atmos-b-skylight.js). Godot
   // reflects its own Sky; specular and diffuse are the shares the page gives the map (PRESETS.skylight), 1 and 0 by default
   environment: sc && sc.environment ? (function(){ var P = typeof ATMOS !== 'undefined' && ATMOS.PRESETS && ATMOS.PRESETS.skylight;
     return { specular: P ? P.specular : 1, diffuse: P ? P.diffuse : 0, source: P ? 'atmos skylight' : 'envMap' }; })() : null,
   scenes: P.scenes.length, sky: null, ground: null };
  if(r && o.sky !== 0 && o.at) try{ out.sky = K.sky(P.scenes, r, o.at, o.sky || 1024, o.skyNear || (o.box ? Math.min(o.box[2] - o.box[0], o.box[3] - o.box[1]) / 2 : 1500)); }catch(e){ out.skyError = String(e.message || e); }
  if(o.box) try{ out.ground = K.ground(P.scenes, o.box, o.step || 4, o.ground); }catch(e){ out.groundError = String(e.message || e); }
  return out;
 };
 return K;
})();
