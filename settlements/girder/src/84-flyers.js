/* ============================== 84. FLYERS ==============================
   The flying beasts of Girder's beast-riders: quetzalcoatlus, giant bat,
   giant archaeopteryx, giant dragonfly (+ the beast-rider and his saddle).
   Models + vertex-shader skeleton are the Mav's Refuge ones (one InstancedMesh
   per species, + dragonfly wings, + riders, + night glints = 7 draw calls).
   Traffic is Girder's own: 68 roost stalls on the four square roof decks.
     outer stalls  : straight-in approach from outside the square, flare and
                     touchdown on the projecting perch beam, fold, walk in.
     slot stalls   : court-facing stalls outboard of a rope bridge; small
                     species only, down the 42 m slot between two decks.
     court stalls  : court-facing stalls inboard of a bridge; residents only.
   Towers are box obstacles (|dx|,|dz| < 40, y < top+16), the whole block is
   one box for cruise legs, bridges + trunks + crowns + boughs are avoided.
   Turnover: roost <-> far sky, roost <-> circuits (circuit flyers peel off and
   land, perched beasts launch to refill a circuit), bats hunt through the
   night and come home staggered, high sorties toward the volcano / the giant.
   Exports window._flyers (stats + test hooks) and window._legs (for --sweep). */
reseed(840001);
(function(){

var FLY_Q = 0, FLY_B = 1, FLY_A = 2, FLY_D = 3, FLY_R = 4;
var FLY_LABEL = ['Quetzalcoatlus', 'Giant bat', 'Giant archaeopteryx', 'Giant dragonfly'];
var FLY_KEY = ['quetz', 'bat', 'archae', 'dragonfly'];
var FLY_CAP = 140, FLY_RCAP = 140;

/* ------------------------------------------------------------------ geometry kit */
var flyTmpC = new THREE.Color();
function flyCol(hex, f){ flyTmpC.set(f ? shade(hex, f) : hex).convertSRGBToLinear(); return [flyTmpC.r, flyTmpC.g, flyTmpC.b]; }

function FlyGeo(centre){ this.p = []; this.n = []; this.c = []; this.b = []; this.uv = []; this.s = []; this.slots = null; this.mx = 1; this.tris = 0; this.cb = centre || {}; }
FlyGeo.prototype.tri = function(a, b, c, col, bone, uv){   /* uv: optional [[u,v],[u,v],[u,v]] for a, b, c */
  var m = this.mx; if(m < 0){ var t = b; b = c; c = t; if(uv){ t = uv[1]; uv = [uv[0], uv[2], t]; } }
  var ax = a[0]*m, bx = b[0]*m, cx = c[0]*m;
  var ux = bx-ax, uy = b[1]-a[1], uz = b[2]-a[2], vx = cx-ax, vy = c[1]-a[1], vz = c[2]-a[2];
  var nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx, L = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
  nx /= L; ny /= L; nz /= L;
  this.p.push(ax, a[1], a[2], bx, b[1], b[2], cx, c[1], c[2]);
  var sl = (this.slots && this.slots.has(col)) ? this.slots.get(col) : -1;   /* the detail atlas quadrant this colour wears (48-detail.js), -1 none */
  for(var i=0;i<3;i++){ this.s.push(sl); this.uv.push(uv ? uv[i][0] : 0, uv ? uv[i][1] : 0); this.n.push(nx, ny, nz); this.c.push(col[0], col[1], col[2]); this.b.push(bone+1, this.cb[bone] ? 1 : m); }
  this.tris++;
};
FlyGeo.prototype.quad = function(a, b, c, d, col, bone){ this.tri(a, b, c, col, bone); this.tri(a, c, d, col, bone); };
FlyGeo.prototype.plate = function(pts, col, bone, uvs){ for(var i=1;i<pts.length-1;i++) this.tri(pts[0], pts[i], pts[i+1], col, bone, uvs ? [uvs[0], uvs[i], uvs[i+1]] : null); };
/* tapered prism from a to b */
FlyGeo.prototype.limb = function(a, b, r0, r1, col, bone, ns, cap){
  ns = ns || 3;
  var dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2], L = Math.sqrt(dx*dx+dy*dy+dz*dz) || 1; dx/=L; dy/=L; dz/=L;
  var ux, uy, uz; if(Math.abs(dy) < 0.9){ ux = -dz; uy = 0; uz = dx; } else { ux = 1; uy = 0; uz = 0; }
  var d = ux*dx+uy*dy+uz*dz; ux -= d*dx; uy -= d*dy; uz -= d*dz; var ul = Math.sqrt(ux*ux+uy*uy+uz*uz); ux/=ul; uy/=ul; uz/=ul;
  var wx = dy*uz-dz*uy, wy = dz*ux-dx*uz, wz = dx*uy-dy*ux;
  var A = [], B = [];
  for(var i=0;i<ns;i++){ var t = i/ns*TAU + 0.5, c = Math.cos(t), s = Math.sin(t);
    A.push([a[0]+(ux*c+wx*s)*r0, a[1]+(uy*c+wy*s)*r0, a[2]+(uz*c+wz*s)*r0]);
    B.push([b[0]+(ux*c+wx*s)*r1, b[1]+(uy*c+wy*s)*r1, b[2]+(uz*c+wz*s)*r1]); }
  for(i=0;i<ns;i++){ var j = (i+1)%ns;
    if(r1 < 0.012) this.tri(A[i], A[j], b, col, bone); else this.quad(A[i], A[j], B[j], B[i], col, bone); }
  if(cap && r1 >= 0.012) for(i=1;i<ns-1;i++) this.tri(B[0], B[i], B[i+1], col, bone);
};
/* low-poly ellipsoid, long axis z */
FlyGeo.prototype.ell = function(c, r, col, bone, nseg, nring, colBelly){
  nseg = nseg || 6; nring = nring || 4;
  var rings = [];
  for(var i=0;i<=nring;i++){ var ph = Math.PI*i/nring, ring = [], sr = Math.sin(ph), cz = Math.cos(ph);
    for(var j=0;j<nseg;j++){ var th = j/nseg*TAU + Math.PI/nseg;
      ring.push([c[0]+r[0]*sr*Math.cos(th), c[1]+r[1]*sr*Math.sin(th), c[2]+r[2]*cz]); }
    rings.push(ring); }
  for(i=0;i<nring;i++) for(j=0;j<nseg;j++){ var k = (j+1)%nseg;
    var a = rings[i][j], b = rings[i][k], cc = rings[i+1][k], d = rings[i+1][j];
    var my = (a[1]+b[1]+cc[1]+d[1])/4, cl = (colBelly && my < c[1]-r[1]*0.25) ? colBelly : col;
    if(i === 0) this.tri(a, cc, d, cl, bone); else if(i === nring-1) this.tri(a, b, d, cl, bone); else this.quad(a, b, cc, d, cl, bone); }
};
FlyGeo.prototype.box = function(c, s, col, bone){
  var x0 = c[0]-s[0]/2, x1 = c[0]+s[0]/2, y0 = c[1]-s[1]/2, y1 = c[1]+s[1]/2, z0 = c[2]-s[2]/2, z1 = c[2]+s[2]/2;
  this.quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1], col, bone); this.quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0], col, bone);
  this.quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1], col, bone); this.quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0], col, bone);
  this.quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0], col, bone); this.quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1], col, bone);
};
FlyGeo.prototype.both = function(fn){ this.mx = 1; fn(this); this.mx = -1; fn(this); this.mx = 1; };
FlyGeo.prototype.build = function(withUV){
  var g = new THREE.BufferGeometry();
  if(withUV) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
  if(this.slots) g.setAttribute('aDetS', new THREE.Float32BufferAttribute(this.s, 1));
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
  g.setAttribute('aFlyB', new THREE.Float32BufferAttribute(this.b, 2));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
};

/* ------------------------------------------------------------------ skeleton shader
   bones: [ {p:[x,y,z] pivot, a:[x,y,z] axis, par:index|-1, k:0 rot | 1 scale | 2 translate} ]
   Vertices on the right side (aFlyB.y = -1) use the mirrored pivot/axis, so
   one angle drives both wings symmetrically. */
function flySkinHook(bones){
  var piv = [], ax = [], pk = [];
  for(var i=0;i<16;i++){ var B = bones[i] || { p:[0,0,0], a:[1,0,0], par:-1, k:0 };
    piv.push(new THREE.Vector3(B.p[0], B.p[1], B.p[2])); ax.push(new THREE.Vector3(B.a[0], B.a[1], B.a[2]));
    pk.push(new THREE.Vector2(B.par+1, B.k||0)); }
  return function(sh){
    sh.uniforms.uFlyPiv = { value:piv }; sh.uniforms.uFlyAx = { value:ax }; sh.uniforms.uFlyPK = { value:pk };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', ['#include <common>',
        'attribute vec2 aFlyB; attribute vec4 aFlyP0; attribute vec4 aFlyP1; attribute vec4 aFlyP2; attribute vec4 aFlyP3;',
        'uniform vec3 uFlyPiv[16]; uniform vec3 uFlyAx[16]; uniform vec2 uFlyPK[16];',
        'void flySkin(inout vec3 p, inout vec3 n){',
        '  mat4 A = mat4(aFlyP0, aFlyP1, aFlyP2, aFlyP3);',
        '  int b = int(aFlyB.x + 0.5) - 1; float sd = aFlyB.y;',
        '  for(int it=0; it<7; it++){',
        '    if(b < 0) break;',
        '    vec3 pv = uFlyPiv[b]; vec3 ax = uFlyAx[b]; vec2 pk = uFlyPK[b];',
        '    int cI = b/4; float ang = A[cI][b - cI*4];',
        '    if(sd < 0.0){ pv.x = -pv.x; ax = vec3(ax.x, -ax.y, -ax.z); }',
        '    if(pk.y > 1.5){ p += uFlyAx[b]*ang; }',
        '    else if(pk.y > 0.5){ p = pv + (p - pv)*ang; }',
        '    else { float cs = cos(ang), sn = sin(ang); vec3 q = p - pv;',
        '      p = pv + q*cs + cross(ax, q)*sn + ax*dot(ax, q)*(1.0 - cs);',
        '      n = n*cs + cross(ax, n)*sn + ax*dot(ax, n)*(1.0 - cs); }',
        '    b = int(pk.x + 0.5) - 1;',
        '  }',
        '}'].join('\n'))
      .replace('#include <beginnormal_vertex>', 'vec3 flyP = position; vec3 flyN = normal; flySkin(flyP, flyN);\nvec3 objectNormal = flyN;')
      .replace('#include <begin_vertex>', 'vec3 transformed = flyP;');
  };
}

/* ------------------------------------------------------------------ the models
   Model space: +z nose, +y up, +x LEFT wing. Rest pose = wings spread flat,
   legs trailing, neck forward. Origin at the shoulders. */
var X = [1,0,0], Y = [0,1,0], Z = [0,0,1];
var flyBones = [], flyFold = [], flyGeoms = [], flyTris = [];

/* --- QUETZALCOATLUS: span 12 m --- */
(function(){
  var C = PAL.beast.quetz, body = flyCol(C[0]), belly = flyCol(C[0], 0.25), dark = flyCol(C[0], -0.35), mem = flyCol(C[1]), mem2 = flyCol(C[1], -0.18),
      crest = flyCol(C[2]), beak = flyCol(C[0], 0.35), eye = flyCol(0x181410);
  var S = [0.35,0.10,0.25], W = [2.55,0.10,0.80], H = [0.22,-0.15,-1.05], NK = [0,0.12,0.5], HD = [0,0.30,3.3];
  flyBones[FLY_Q] = [
    { p:NK, a:X, par:-1 }, { p:HD, a:X, par:0 }, { p:HD, a:Y, par:1 },
    { p:S, a:Y, par:-1 }, { p:S, a:Z, par:3 }, { p:S, a:X, par:4 },
    { p:W, a:Y, par:5 }, { p:W, a:Z, par:6 }, { p:H, a:X, par:-1 } ];
  /*            neck  headP headY wSw   wFlap wTw  oSw   oFlap leg */
  flyFold[FLY_Q] = [-0.85, 1.05, 0,   0.30,-1.22, 0,   0.35, 2.50,-1.25, 0,0,0,0,0,0,0];
  var g = new FlyGeo({0:1,1:1,2:1});
  g.slots = new Map([[body,0],[belly,0],[dark,0],[mem,1],[mem2,1],[crest,2],[beak,3]]);   /* detail atlas (FLY_DETAIL): fuzz, membrane, crest feathers, horn */
  g.ell([0,-0.05,-0.35], [0.42,0.40,0.98], body, -1, 6, 4, belly);
  g.limb([0,-0.05,-1.25], [0,-0.02,-1.75], 0.12, 0.01, body, -1, 3);
  g.limb([0,0.12,0.40], [0,0.30,3.32], 0.21, 0.13, body, 0, 4);
  g.ell([0,0.37,3.62], [0.17,0.21,0.45], body, 2, 5, 3);
  g.limb([0,0.40,3.90], [0,0.30,5.75], 0.15, 0.005, beak, 2, 3);
  g.limb([0,0.24,3.85], [0,0.24,5.55], 0.09, 0.005, beak, 2, 3);
  g.plate([[0,0.52,3.35],[0,1.12,3.05],[0,1.00,3.80],[0,0.56,4.15]], crest, 2);
  g.both(function(g){
    g.tri([0.16,0.45,3.72],[0.16,0.36,3.82],[0.16,0.36,3.62], eye, 2);
    g.limb(S, W, 0.13, 0.085, body, 5, 3);
    g.tri(W, [2.62,0.10,1.12], [2.80,0.10,0.78], dark, 5);
    g.plate([[0.35,0.06,0.30], W, [2.62,0.06,-0.78], [1.55,0.06,-0.95], [0.30,0.02,-1.25]], mem, 5);
    g.tri([0.35,0.06,0.30], [0.25,0.10,0.65], W, mem2, 5);
    g.limb(W, [6.0,0.10,-0.50], 0.075, 0.015, body, 7, 3);
    g.plate([W, [4.3,0.07,0.18], [4.75,0.06,-0.72], [3.60,0.06,-0.88], [2.62,0.06,-0.78]], mem, 7);
    g.plate([[4.3,0.07,0.18], [6.0,0.10,-0.50], [4.75,0.06,-0.72]], mem2, 7);
    g.limb(H, [0.27,-0.18,-2.05], 0.12, 0.07, body, 8, 3);
    g.limb([0.27,-0.18,-2.05], [0.27,-0.20,-2.92], 0.07, 0.04, dark, 8, 3);
    g.tri([0.17,-0.2,-2.9], [0.37,-0.2,-2.9], [0.27,-0.12,-3.3], dark, 8);
  });
  flyGeoms[FLY_Q] = g.build(); flyTris[FLY_Q] = g.tris;
})();

/* --- GIANT BAT: span 9 m --- */
(function(){
  var C = PAL.beast.bat, fur = flyCol(C[0]), fur2 = flyCol(C[1]), mem = flyCol(C[1], -0.1), mem2 = flyCol(C[1], -0.3), bone = flyCol(C[2]), ear = flyCol(C[2], -0.1), eye = flyCol(0x0c0a08);
  var S = [0.40,0.10,0.20], E = [1.50,0.10,-0.10], W = [2.60,0.10,0.60], H = [0.20,-0.10,-1.0], HD = [0,0.10,0.65];
  flyBones[FLY_B] = [
    { p:HD, a:X, par:-1 }, { p:HD, a:Y, par:0 }, { p:HD, a:X, par:-1 },
    { p:S, a:Y, par:-1 }, { p:S, a:Z, par:3 }, { p:S, a:X, par:4 },
    { p:E, a:Z, par:5 }, { p:W, a:Y, par:6 }, { p:W, a:Z, par:7 }, { p:H, a:X, par:-1 } ];
  /*            head headY -   wSw  wFlap wTw mFlap oSw  oFlap leg */
  flyFold[FLY_B] = [-0.6, 0,   0,  0.25,-1.30, 0, -1.25, 1.10,-0.70, 0, 0,0,0,0,0,0];
  var g = new FlyGeo({0:1,1:1,2:1});
  g.slots = new Map([[fur,0],[fur2,0],[mem,1],[mem2,1],[ear,1],[bone,2]]);   /* detail atlas: fur, membrane, bone */
  g.ell([0,0,-0.30], [0.45,0.42,0.88], fur, -1, 6, 4);
  g.ell([0,0.06,0.28], [0.54,0.47,0.46], fur2, -1, 6, 3);
  g.ell([0,0.20,0.98], [0.28,0.27,0.36], fur, 1, 5, 3);
  g.limb([0,0.13,1.22], [0,0.10,1.55], 0.14, 0.07, fur2, 1, 3, true);
  var T1 = [4.5,0.10,-0.10], T2 = [3.95,0.10,-1.35], T3 = [3.05,0.10,-1.75], K = [2.72,0.06,-1.62], J = [1.40,0.04,-1.50];
  g.both(function(g){
    g.plate([[0.10,0.36,0.92],[0.46,1.12,0.84],[0.32,0.40,1.10]], ear, 1);
    g.tri([0.20,0.27,1.22],[0.26,0.22,1.12],[0.20,0.19,1.24], eye, 1);
    g.limb(S, E, 0.11, 0.08, fur2, 5, 3);
    g.plate([[0.40,0.06,0.15], E, J, [0.30,0.0,-1.15]], mem, 5);
    g.tri([0.40,0.08,0.30], [1.9,0.09,0.42], E, mem2, 5);
    g.limb(E, W, 0.08, 0.06, fur2, 6, 3);
    g.plate([E, W, K, J], mem, 6);
    g.tri(E, [1.9,0.09,0.42], W, mem2, 6);
    g.tri(W, [2.62,0.14,0.95], [2.78,0.10,0.62], bone, 8);
    g.limb(W, T1, 0.045, 0.012, bone, 8, 3); g.limb(W, T2, 0.04, 0.012, bone, 8, 3); g.limb(W, T3, 0.04, 0.012, bone, 8, 3);
    g.plate([W, T1, [4.0,0.07,-0.62], T2], mem, 8);
    g.plate([W, T2, [3.38,0.07,-1.38], T3], mem2, 8);
    g.plate([W, T3, K], mem, 8);
    g.limb(H, [0.32,-0.10,-1.95], 0.08, 0.04, fur2, 9, 3);
    g.tri([0.24,-0.1,-1.95], [0.40,-0.1,-1.95], [0.32,-0.04,-2.22], bone, 9);
    g.plate([[0.0,-0.04,-1.0], [0.30,0.0,-1.15], [0.32,-0.06,-1.9], [0,-0.06,-1.55]], mem2, -1);
  });
  flyGeoms[FLY_B] = g.build(); flyTris[FLY_B] = g.tris;
})();

/* --- GIANT ARCHAEOPTERYX: span 7 m --- */
(function(){
  var C = PAL.beast.archae, blue = flyCol(C[0]), blue2 = flyCol(C[0], 0.22), rust = flyCol(C[1]), rust2 = flyCol(C[1], -0.22), cream = flyCol(C[2]), eye = flyCol(0x100c08), skin = flyCol(C[2], -0.35);
  var S = [0.35,0.15,0.20], W = [1.70,0.15,0.52], H = [0.22,-0.20,-0.70], NK = [0,0.15,0.40], HD = [0,0.58,1.15], TL = [0,0.0,-1.15];
  flyBones[FLY_A] = [
    { p:NK, a:X, par:-1 }, { p:HD, a:Y, par:0 }, { p:TL, a:X, par:-1 },
    { p:S, a:Y, par:-1 }, { p:S, a:Z, par:3 }, { p:S, a:X, par:4 },
    { p:W, a:Y, par:5 }, { p:W, a:Z, par:6 }, { p:H, a:X, par:-1 }, { p:TL, a:Y, par:2 } ];
  /*            neck headY tailP wSw  wFlap  wTw oSw   oFlap leg   tailY */
  flyFold[FLY_A] = [-0.35, 0,  0.30, 1.25,-0.38, 0.15, 0.22, 0.10,-1.07, 0, 0,0,0,0,0,0];
  var g = new FlyGeo({0:1,1:1,2:1,9:1});
  g.slots = new Map([[blue,0],[blue2,0],[rust,0],[rust2,0],[cream,0],[skin,1]]);   /* detail atlas: feathers, scaled skin */
  g.ell([0,0,-0.35], [0.40,0.42,0.92], blue, -1, 6, 4, cream);
  g.limb([0,0.12,0.35], [0,0.58,1.17], 0.22, 0.13, blue, 0, 4);
  g.ell([0,0.64,1.36], [0.17,0.17,0.29], blue2, 1, 5, 3);
  g.limb([0,0.64,1.55], [0,0.57,2.20], 0.11, 0.035, skin, 1, 4, true);
  g.limb([0,0.53,1.50], [0,0.50,2.10], 0.07, 0.025, skin, 1, 3);
  g.plate([[0,0.78,1.30],[0,1.02,0.95],[0,0.80,1.05]], rust, 1);
  g.limb(TL, [0,0,-4.35], 0.13, 0.02, blue, 9, 3);
  g.both(function(g){
    g.tri([0.16,0.70,1.46],[0.16,0.64,1.54],[0.16,0.64,1.38], eye, 1);
    for(var t=0;t<3;t++){ var tz = 1.68+t*0.16; g.tri([0.06,0.56,tz],[0.06,0.56,tz+0.1],[0.05,0.47,tz+0.05], cream, 1); }
    for(var i=0;i<6;i++){ var zb = -1.45-i*0.52, w = 0.50+i*0.05, cl = (i%2) ? rust : blue2;
      g.quad([0.02,0.01,zb], [w,0.01,zb-0.62], [w-0.05,0.01,zb-0.95], [0.02,0.01,zb-0.34], cl, 9); }
    g.quad([0.02,0.01,-4.3], [0.34,0.01,-5.05], [0.12,0.01,-5.35], [0,0.01,-4.6], rust2, 9);
    g.limb(S, W, 0.12, 0.07, blue, 5, 3);
    g.plate([[0.35,0.12,0.22], W, [1.82,0.12,-0.98], [1.10,0.12,-1.08], [0.40,0.10,-1.0]], rust, 5);
    g.plate([[0.35,0.17,0.24], [1.70,0.17,0.50], [1.74,0.17,-0.30], [0.40,0.17,-0.38]], blue, 5);
    g.limb(W, [2.65,0.15,0.22], 0.06, 0.03, blue, 7, 3);
    for(var c=0;c<3;c++) g.tri([1.72+c*0.12,0.15,0.50-c*0.03], [1.84+c*0.12,0.15,0.46-c*0.03], [1.86+c*0.12,0.13,0.86-c*0.05], cream, 7);
    var tips = [[3.5,0.15,-0.42],[3.38,0.14,-1.02],[3.02,0.13,-1.38],[2.60,0.12,-1.52],[2.18,0.11,-1.46]];
    for(var f=0;f<5;f++){ var k = f/5*0.72, r0 = [mix(W[0],2.65,k), 0.15-f*0.008, mix(W[2],0.22,k)], r1 = [r0[0]-0.22, r0[1], r0[2]-0.12], tp = tips[f];
      g.quad(r0, [tp[0]+0.10,tp[1],tp[2]+0.16], [tp[0]-0.12,tp[1],tp[2]-0.10], r1, (f%2) ? rust2 : rust, 7); }
    g.plate([[1.70,0.18,0.50], [2.65,0.18,0.22], [2.45,0.18,-0.38], [1.74,0.18,-0.30]], blue2, 7);
    g.limb(H, [0.26,-0.30,-1.48], 0.25, 0.10, blue, 8, 4);
    g.limb([0.26,-0.30,-1.48], [0.26,-0.30,-2.20], 0.07, 0.045, cream, 8, 3);
    g.tri([0.14,-0.3,-2.18], [0.38,-0.3,-2.18], [0.26,-0.22,-2.55], cream, 8);
  });
  flyGeoms[FLY_A] = g.build(); flyTris[FLY_A] = g.tris;
})();

/* Optional library sheet for the dragonfly wings: a build sets FLYTEX = { wing: THREE.Texture | image URL } before this fragment. An alpha cut-out of ONE wing,
   root at the left edge, leading edge at the top, stretched over each wing's bounding box (the fore and hind wings share it). Absent: the vertex-coloured wings. */
var FLY_WINGTEX = null;
(function(){   /* the library's wing sheet (materials.json family 'flywing', optional): a card, so it keeps its alpha */
  var L = (typeof KMAT !== 'undefined' && KMAT.mode === 'lib') ? KMAT.packed('girder', 'flywing') : null;
  if(L){ FLY_WINGTEX = KMAT.textures(L, { aniso: FAST ? 1 : 4 }).map; FLY_WINGTEX.generateMipmaps = true;
    FLY_WINGTEX.minFilter = THREE.LinearMipmapLinearFilter; FLY_WINGTEX.magFilter = THREE.LinearFilter; }
})();
if(!FLY_WINGTEX && typeof FLYTEX !== 'undefined' && FLYTEX && FLYTEX.wing){
  FLY_WINGTEX = (typeof FLYTEX.wing === 'string') ? new THREE.TextureLoader().load(FLYTEX.wing) : FLYTEX.wing;
  FLY_WINGTEX.anisotropy = 8; FLY_WINGTEX.encoding = THREE.sRGBEncoding;
}
/* --- GIANT DRAGONFLY: 6 m body, 4 wings (separate translucent mesh) --- */
var flyWingGeom, flyWingTris;
(function(){
  var C = PAL.beast.dragonfly, teal = flyCol(C[0]), teal2 = flyCol(C[0], -0.3), blu = flyCol(C[1]), blu2 = flyCol(C[1], 0.3), wing = flyCol(C[2]), vein = flyCol(C[1], -0.45), legc = flyCol(0x1c1a16);
  var AB = [0,0,-0.45], AB2 = [0,0,-2.55], LG = [0.30,-0.35,0.45], FW = [0.28,0.50,0.78], HW = [0.28,0.50,0.12];
  flyBones[FLY_D] = [
    { p:AB, a:X, par:-1 }, { p:AB2, a:X, par:0 }, { p:LG, a:Z, par:-1 },
    { p:FW, a:Z, par:-1 }, { p:HW, a:Z, par:-1 }, { p:FW, a:Z, par:-1 }, { p:HW, a:Z, par:-1 }, { p:[0,0,1.0], a:Y, par:-1 } ];
  /*            abd  abd2 legs  fw hw fwg hwg headY */
  flyFold[FLY_D] = [-0.12, -0.10, -0.75, 0.04, -0.04, 0.04, -0.04, 0, 0,0,0,0,0,0,0,0];
  var g = new FlyGeo({0:1,1:1,7:1});
  g.slots = new Map([[teal,0],[teal2,0],[blu,0],[blu2,0],[legc,1]]);   /* detail atlas: iridescent chitin, bristled legs */
  g.ell([0,0,0.30], [0.50,0.56,0.82], teal, -1, 6, 4, blu);
  g.ell([0,0.05,1.28], [0.36,0.32,0.30], teal2, 7, 5, 3);
  g.limb([0,-0.10,1.5], [0,-0.18,1.78], 0.16, 0.06, legc, 7, 3);
  var zs = [-0.45,-1.2,-1.9,-2.6,-3.3,-4.0,-4.7], rs = [0.30,0.24,0.21,0.19,0.17,0.15,0.11];
  for(var i=0;i<6;i++) g.limb([0,0,zs[i]], [0,0,zs[i+1]+0.06], rs[i], rs[i+1], (i%2) ? blu : teal, i<3 ? 0 : 1, 4, true);
  g.both(function(g){
    g.ell([0.30,0.13,1.38], [0.30,0.29,0.30], blu2, 7, 5, 3);
    g.tri([0.05,0,-4.66], [0.16,0,-5.15], [0.02,0,-4.9], legc, 1);
    for(var l=0;l<3;l++){ var z0 = 0.85-l*0.4, kx = 0.80+l*0.06;
      g.limb([0.30,-0.35,z0], [kx,-0.62,z0-0.18], 0.06, 0.04, legc, 2, 3);
      g.limb([kx,-0.62,z0-0.18], [kx-0.1,-1.12,z0+0.12-l*0.22], 0.04, 0.015, legc, 2, 3); }
  });
  flyGeoms[FLY_D] = g.build(); flyTris[FLY_D] = g.tris;
  var w = new FlyGeo();
  function oneWing(w, root, len, sweep, bone, y){
    var z = root[2], dx = function(u){ return root[0]+len*u; }, dz = function(u, o){ return z + sweep*u + o; };
    var pts = [[root[0],y,z+0.05], [dx(0.35),y,dz(0.35,0.40)], [dx(0.85),y,dz(0.85,0.36)], [dx(1.0),y,dz(1.0,0.05)], [dx(0.88),y,dz(0.88,-0.36)], [dx(0.30),y,dz(0.30,-0.30)], [root[0],y,z-0.08]];
    var x0 = root[0], x1 = dx(1.0), z0 = 1e9, z1 = -1e9, uvs = [];
    for(var i=0;i<pts.length;i++){ z0 = Math.min(z0, pts[i][2]); z1 = Math.max(z1, pts[i][2]); }
    for(i=0;i<pts.length;i++) uvs.push([(pts[i][0]-x0)/(x1-x0), (pts[i][2]-z0)/(z1-z0)]);   /* u root to tip, v trailing to leading edge */
    w.plate(pts, wing, bone, uvs);
  }
  w.both(function(w){
    oneWing(w, FW, 3.35, 0.35, 3, 0.50); oneWing(w, HW, 3.15, -0.45, 4, 0.50);
    oneWing(w, FW, 3.35, 0.35, 5, 0.50); oneWing(w, HW, 3.15, -0.45, 6, 0.50);
    /* veins + pterostigma on the real wings (a library sheet draws its own) */
    if(FLY_WINGTEX) return;
    w.quad([0.28,0.52,0.86], [3.2,0.52,1.42], [3.2,0.52,1.34], [0.28,0.52,0.78], vein, 3);
    w.quad([2.75,0.52,1.36], [3.15,0.52,1.42], [3.15,0.52,1.24], [2.75,0.52,1.18], vein, 3);
    w.quad([0.28,0.52,0.74], [3.3,0.52,0.92], [3.3,0.52,0.86], [0.28,0.52,0.68], vein, 3);
    w.quad([0.28,0.52,0.20], [3.0,0.52,-0.02], [3.0,0.52,-0.10], [0.28,0.52,0.12], vein, 4);
    w.quad([2.6,0.52,0.02], [3.0,0.52,-0.04], [3.0,0.52,-0.22], [2.6,0.52,-0.16], vein, 4);
    w.quad([0.28,0.52,0.06], [3.1,0.52,-0.42], [3.1,0.52,-0.48], [0.28,0.52,0.0], vein, 4);
  });
  flyWingGeom = w.build(!!FLY_WINGTEX); flyWingTris = w.tris;
})();

/* --- BEAST-RIDER + SADDLE. Origin = top of the seat. --- */
(function(){
  var U = PAL.uniform, leather = flyCol(U.brown), leather2 = flyCol(U.brown, -0.3), green = flyCol(U.green), green2 = flyCol(U.green, -0.25), trim = flyCol(U.trim),
      skin = flyCol(PAL.people.skin[0]), blanket = flyCol(PAL.cloth[0]), pennon = flyCol(PAL.cloth[3]), wood = flyCol(PAL.timber[1]), dark = flyCol(0x14120e), rope = flyCol(PAL.rope[0]);
  var O = [0,0,0], HIP = [0.17,0.10,-0.05], KNEE = [0.19,-0.32,-0.05], SH = [0.25,0.64,-0.05], HDp = [0,0.76,-0.04], LB = [-0.46,-0.35,0.12], LT = [-0.46,3.0,-0.25];
  flyBones[FLY_R] = [
    { p:[0,0.10,-0.05], a:X, par:8 }, { p:HDp, a:Y, par:0 }, { p:SH, a:X, par:0 }, { p:HIP, a:X, par:8 }, { p:KNEE, a:X, par:3 },
    { p:LB, a:[0,0,0], par:8, k:1 }, { p:LT, a:Y, par:5 },     /* lance: carried by the rider (parent = his translate), so it leaves the saddle with him */
    { p:O, a:X, par:10, k:2 }, { p:O, a:Y, par:7, k:2 }, { p:O, a:[0,0,0], par:-1, k:1 }, { p:O, a:X, par:9 } ];
  var g = new FlyGeo({0:1,1:1,5:1,6:1,7:1,8:1,9:1,10:1});
  g.slots = new Map([[blanket,0],[pennon,0],[leather,1],[leather2,1],[dark,1],[wood,2],[rope,3]]);   /* detail atlas: saddle blanket, leather, lance wood, rope */
  /* saddle, blanket, bedroll, reins (no bone: stay on the beast) */
  g.box([0,-0.08,0], [0.50,0.16,0.80], leather, -1);
  g.box([0,0.08,-0.42], [0.46,0.26,0.10], leather2, -1);
  g.limb([-0.32,0.02,-0.62], [0.32,0.02,-0.62], 0.13, 0.13, green2, -1, 4, true);
  g.both(function(g){
    g.plate([[0.26,-0.04,0.38],[0.52,-0.62,0.32],[0.52,-0.62,-0.36],[0.26,-0.04,-0.38]], blanket, -1);
    g.tri([0.52,-0.62,0.32],[0.52,-0.74,0.0],[0.52,-0.62,-0.36], trim, -1);
    /* legs */
    g.limb(HIP, KNEE, 0.10, 0.085, leather, 3, 3);
    g.limb(KNEE, [0.19,-0.76,-0.03], 0.08, 0.065, dark, 4, 3, true);
    g.tri([0.13,-0.76,-0.10],[0.25,-0.76,-0.10],[0.19,-0.74,0.16], dark, 4);
    /* arms */
    g.limb(SH, [0.28,0.20,0.02], 0.07, 0.055, green, 2, 3, true);
  });
  g.box([0,0.42,-0.05], [0.44,0.58,0.26], green, 0);
  g.box([0,0.36,-0.05], [0.46,0.07,0.28], trim, 0);
  g.plate([[-0.22,0.68,-0.19],[0.22,0.68,-0.19],[0.27,0.30,-0.80],[-0.27,0.30,-0.80]], green2, 0);
  g.ell([0,0.86,-0.03], [0.11,0.13,0.12], skin, 1, 5, 3);
  g.ell([0,0.91,-0.05], [0.13,0.10,0.14], leather, 1, 5, 3);
  g.box([0,0.87,0.075], [0.21,0.055,0.06], dark, 1);
  g.limb(LB, LT, 0.03, 0.02, wood, 5, 3);
  g.tri(LT, [-0.46,3.35,-0.27], [-0.46,3.0,-0.22], trim, 5);
  g.plate([[-0.46,2.95,-0.25],[-0.46,2.55,-0.25],[-0.46,2.72,-1.45]], pennon, 6);
  flyGeoms[FLY_R] = g.build(); flyTris[FLY_R] = g.tris;
})();
/*            torso head arm   thigh shin lance pen sx sy scale unpitch */
var FLY_RSEAT = [0.50, 0,  -1.15,-1.30, 1.35, 1,   0,  0, 0, 1,   0, 0,0,0,0,0];

/* per species: cruise speed range, flap Hz, flap/outer amplitudes, heave, stand height, perched pitch, saddle offset, rider scale */
var FLY_SPEC = [
  { v:[18,24], hz:0.70, a0:0.62, a1:0.55, lag:0.95, tw:0.26, heave:0.28, stand:2.30, perchPitch:0.35, saddle:[0,0.40,0.10], rs:1.0,  on:[3,6], off:[5,10], halfSpan:6.2 },
  { v:[12,16], hz:2.00, a0:0.78, a1:0.60, lag:1.10, tw:0.30, heave:0.38, stand:1.60, perchPitch:-Math.PI/2, saddle:[0,0.44,-0.15], rs:1.0, on:[99,99], off:[0,0], halfSpan:4.6 },
  { v:[14,20], hz:1.40, a0:0.80, a1:0.50, lag:0.75, tw:0.25, heave:0.18, stand:1.95, perchPitch:0.50, saddle:[0,0.45,-0.15], rs:1.0, on:[3,5], off:[1.5,3], halfSpan:3.7 },
  { v:[25,35], hz:9.00, a0:0.50, a1:0,    lag:0,    tw:0,    heave:0.03, stand:1.05, perchPitch:0.08, saddle:[0,0.58,0.25], rs:0.85, on:[99,99], off:[0,0], halfSpan:3.6 }
];

var flyRand = rnd;      /* seeded during setup, Math.random at run time */

