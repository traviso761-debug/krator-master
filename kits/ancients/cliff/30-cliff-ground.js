// ================================================================= KCLIFF — the cliff city's ground: the rock material and the meshed ground ([draw])
// Lifted from Ledge's 45-host-stage.js (2026-11-22) when Shelf took the same form. A build hands its own groundAt and its words.
//
//   KCLIFF.rock(o) -> material    core/terrain KSTRATA's beds on every steep face, drawn `tanMix` toward a warm tan; the library's grain
//                                 over them (the build's pack: a natural wall, the Ancients' dressed cut, a high flat and a low flat; aDress
//                                 picks the cut), triplanar in world metres; a flat keeps its vertex colour
//     o: {recipe, seed, range [lo, hi], pack, lib {wall, dressed, flat, low}, lowY [a, b] (the low flat's grain below a, the high's above b),
//         tanMix (.45), key (the program cache key)}
//   KCLIFF.ground(o) -> {near, far, verts}   the near grid (columns every dx[0] m within xDense of the middle, dx[1] beyond; rows every dz[0]
//                                 within zDense, dz[1] beyond, plus o.rows: the sheer pairs) and the far ring (200 m cells to `far`, the near
//                                 square left out), vertex-coloured by o.colour / o.farColour; KDRAWN gets the near grid's triangles
//     o: {H(x, z), page, far, xDense, zDense [z0, z1], dx [a, b], dz [a, b], rows [z...], dressed(x, z, y) -> 0 | 1, colour(x, y, z, n, dress) -> sRGB
//         [r, g, b], farColour(x, y, z, n) -> sRGB, seed, farSeed, mat, scene}
KCLIFF.rock = function (o) {
  var ST = KSTRATA.shade({ recipe: o.recipe, seed: o.seed, range: o.range, dip: [0, 0, 1], warp: [3, .8] }, { THREE: THREE });
  var GREY = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255]), 1, 1); GREY.needsUpdate = true;
  var lib = function (n) { var E = (typeof KMAT !== 'undefined' && KMAT.mode === 'lib') ? KMAT.packed(o.pack, n) : null; return E ? { t: KMAT.textures(E, { aniso: 8 }).map, s: 1 / (E.scale || [8, 8])[0] } : { t: GREY, s: .1 }; };
  var g = function (v) { return (v % 1 === 0 ? v.toFixed(1) : String(v)); };
  var tm = o.tanMix == null ? .45 : o.tanMix, ly = o.lowY;
  var m = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
  m.onBeforeCompile = function (sh) {
    ST.inject(sh); var W = lib(o.lib.wall), D = lib(o.lib.dressed), T = lib(o.lib.flat), S = lib(o.lib.low);
    Object.assign(sh.uniforms, { uW: { value: W.t }, uWs: { value: W.s }, uD: { value: D.t }, uDs: { value: D.s }, uT: { value: T.t }, uTs: { value: T.s }, uS: { value: S.t }, uSs: { value: S.s } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aDress;varying float vDress;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvDress=aDress;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uW,uD,uT,uS;uniform float uWs,uDs,uTs,uSs;varying float vDress;')
      .replace('#include <color_fragment>', ['#include <color_fragment>',
        '{vec3 nn=normalize(vSWN),n=abs(nn);float sx=n.x/(n.x+n.z+1e-4),up=smoothstep(.55,.85,nn.y);',
        ' vec3 gw=texture2D(uW,vSWP.zy*uWs).rgb*sx+texture2D(uW,vSWP.xy*uWs).rgb*(1.0-sx);',
        ' vec3 gd=texture2D(uD,vSWP.zy*uDs).rgb*sx+texture2D(uD,vSWP.xy*uDs).rgb*(1.0-sx);',
        ' vec3 wall=mix(gw,gd,vDress),flt=mix(texture2D(uS,vSWP.xz*uSs).rgb,texture2D(uT,vSWP.xz*uTs).rgb,smoothstep(' + g(ly[0]) + ',' + g(ly[1]) + ',vSWP.y));',
        ' flt=mix(flt,texture2D(uD,vSWP.xz*uDs).rgb,vDress);',
        ' float l=dot(mix(wall,flt,up),vec3(.333)),g=mix(1.0,clamp(pow(l/.47,1.3),.45,1.6),.6);',
        ' vec3 rock=mix(mix(strataColor(vSWP,vSWN),vec3(.62,.52,.42),' + g(tm) + '),vec3(.74,.70,.63),vDress);',
        ' diffuseColor.rgb=mix(rock,diffuseColor.rgb,up)*g;}'].join('\n'));
  };
  m.customProgramCacheKey = function () { return o.key; };
  return m;
};

KCLIFF.ground = function (o) {
  var PG = o.page, H = o.H;
  var xs = []; for (var x = -PG; x <= PG + .01; x += (Math.abs(x) < o.xDense ? o.dx[0] : o.dx[1])) xs.push(x);
  if (xs[xs.length - 1] < PG - .01) xs.push(PG);   /* the near grid always meets the far ring's edge (no sliver of sky at the seam) */
  var zs = new Set(); for (var z = -PG; z <= PG + .01; z += (z > o.zDense[0] && z < o.zDense[1] ? o.dz[0] : o.dz[1])) zs.add(Math.round(z * 100) / 100);
  (o.rows || []).forEach(function (r) { zs.add(r); }); zs.add(PG); zs.add(-PG);
  var ZS = Array.from(zs).sort(function (a, b) { return a - b; });
  var nx = xs.length, nz = ZS.length, NV = nx * nz, P = new Float32Array(NV * 3), C = new Float32Array(NV * 3), Dr = new Float32Array(NV);
  for (var j = 0; j < nz; j++) for (var i = 0; i < nx; i++) {
    var xx = xs[i], zz = ZS[j], k = j * nx + i, y = H(xx, zz); P[k * 3] = xx; P[k * 3 + 1] = y; P[k * 3 + 2] = zz; Dr[k] = o.dressed(xx, zz, y);
  }
  var I = []; for (j = 0; j < nz - 1; j++) for (i = 0; i < nx - 1; i++) { var a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; I.push(a, c, b, b, c, d); }
  var gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.BufferAttribute(P, 3)); gm.setIndex(I); gm.computeVertexNormals();
  for (k = 0; k < NV; k++) {
    var px = P[k * 3], py = P[k * 3 + 1], pz = P[k * 3 + 2], n = KRAND.fbm(px / 70, py / 50, pz / 70, 3, o.seed), col = o.colour(px, py, pz, n, Dr[k]);
    C[k * 3] = Math.pow(col[0], 2.2); C[k * 3 + 1] = Math.pow(col[1], 2.2); C[k * 3 + 2] = Math.pow(col[2], 2.2);
  }
  gm.setAttribute('color', new THREE.BufferAttribute(C, 3)); gm.setAttribute('aDress', new THREE.BufferAttribute(Dr, 1));
  var mesh = new THREE.Mesh(gm, o.mat); mesh.name = 'ground'; mesh.userData.ground = true; mesh.userData.probeSkip = true; o.scene.add(mesh);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.mesh(Array.from(P), I, null, { cell: 40 }));
  // the far ring: 200 m cells to the far edge, its cells inside the near square left out (the near grid draws them)
  var F = o.far, st = 200, fx = []; for (x = -F; x <= F + .01; x += st) fx.push(x);
  var fn = fx.length, FP = new Float32Array(fn * fn * 3), FC = new Float32Array(fn * fn * 3), FD = new Float32Array(fn * fn), FI = [];
  for (j = 0; j < fn; j++) for (i = 0; i < fn; i++) {
    var X = fx[i], Z = fx[j], kk = j * fn + i, Y = H(X, Z), nn = KRAND.fbm(X / 900, 0, Z / 900, 3, o.farSeed), cc = o.farColour(X, Y, Z, nn);
    FP[kk * 3] = X; FP[kk * 3 + 1] = Y; FP[kk * 3 + 2] = Z;
    FC[kk * 3] = Math.pow(cc[0], 2.2); FC[kk * 3 + 1] = Math.pow(cc[1], 2.2); FC[kk * 3 + 2] = Math.pow(cc[2], 2.2);
  }
  for (j = 0; j < fn - 1; j++) for (i = 0; i < fn - 1; i++) {
    if (fx[i] >= -PG && fx[i + 1] <= PG && fx[j] >= -PG && fx[j + 1] <= PG) continue;
    var a2 = j * fn + i, b2 = a2 + 1, c2 = a2 + fn, d2 = c2 + 1; FI.push(a2, c2, b2, b2, c2, d2);
  }
  var fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(FP, 3)); fg.setIndex(FI); fg.computeVertexNormals();
  fg.setAttribute('color', new THREE.BufferAttribute(FC, 3)); fg.setAttribute('aDress', new THREE.BufferAttribute(FD, 1));
  var fm = new THREE.Mesh(fg, o.mat); fm.name = 'ground far'; fm.userData.ground = true; fm.userData.probeSkip = true; o.scene.add(fm);
  return { near: mesh, far: fm, verts: NV + fn * fn };
};
