/* ============================== 84. FLYERS ==============================
   The flying beasts of the beast-rider culture: quetzalcoatlus, giant bat,
   giant archaeopteryx, giant dragonfly (+ the beast-rider and his saddle).
   One InstancedMesh per species (+ dragonfly wings, + riders, + night glints);
   each model is ONE merged low-poly geometry whose vertices carry a bone index;
   a small skeleton is posed in the vertex shader from 16 per-instance angles
   that the CPU writes every frame (flap cycle, glide, flare, fold, idle).
   Traffic: background transients on straight lines, roost arrivals/departures
   with validated approach paths, Rookery training circuits, city patrols.
   Exports window._flyers (stats + test hooks) and window._legs (for --sweep). */
reseed(840001);
(function(){

var FLY_Q = 0, FLY_B = 1, FLY_A = 2, FLY_D = 3, FLY_R = 4;
var FLY_LABEL = ['Quetzalcoatlus', 'Giant bat', 'Giant archaeopteryx', 'Giant dragonfly'];
var FLY_KEY = ['quetz', 'bat', 'archae', 'dragonfly'];
var FLY_CAP = 300, FLY_RCAP = 260;

/* ------------------------------------------------------------------ geometry kit */
var flyTmpC = new THREE.Color();
function flyCol(hex, f){ flyTmpC.set(f ? shade(hex, f) : hex).convertSRGBToLinear(); return [flyTmpC.r, flyTmpC.g, flyTmpC.b]; }

function FlyGeo(centre){ this.p = []; this.n = []; this.c = []; this.b = []; this.mx = 1; this.tris = 0; this.cb = centre || {}; }
FlyGeo.prototype.tri = function(a, b, c, col, bone){
  var m = this.mx; if(m < 0){ var t = b; b = c; c = t; }
  var ax = a[0]*m, bx = b[0]*m, cx = c[0]*m;
  var ux = bx-ax, uy = b[1]-a[1], uz = b[2]-a[2], vx = cx-ax, vy = c[1]-a[1], vz = c[2]-a[2];
  var nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx, L = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
  nx /= L; ny /= L; nz /= L;
  this.p.push(ax, a[1], a[2], bx, b[1], b[2], cx, c[1], c[2]);
  for(var i=0;i<3;i++){ this.n.push(nx, ny, nz); this.c.push(col[0], col[1], col[2]); this.b.push(bone+1, this.cb[bone] ? 1 : m); }
  this.tris++;
};
FlyGeo.prototype.quad = function(a, b, c, d, col, bone){ this.tri(a, b, c, col, bone); this.tri(a, c, d, col, bone); };
FlyGeo.prototype.plate = function(pts, col, bone){ for(var i=1;i<pts.length-1;i++) this.tri(pts[0], pts[i], pts[i+1], col, bone); };
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
FlyGeo.prototype.build = function(){
  var g = new THREE.BufferGeometry();
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
    w.plate([[root[0],y,z+0.05], [dx(0.35),y,dz(0.35,0.40)], [dx(0.85),y,dz(0.85,0.36)], [dx(1.0),y,dz(1.0,0.05)], [dx(0.88),y,dz(0.88,-0.36)], [dx(0.30),y,dz(0.30,-0.30)], [root[0],y,z-0.08]], wing, bone);
  }
  w.both(function(w){
    oneWing(w, FW, 3.35, 0.35, 3, 0.50); oneWing(w, HW, 3.15, -0.45, 4, 0.50);
    oneWing(w, FW, 3.35, 0.35, 5, 0.50); oneWing(w, HW, 3.15, -0.45, 6, 0.50);
    /* veins + pterostigma on the real wings */
    w.quad([0.28,0.52,0.86], [3.2,0.52,1.42], [3.2,0.52,1.34], [0.28,0.52,0.78], vein, 3);
    w.quad([2.75,0.52,1.36], [3.15,0.52,1.42], [3.15,0.52,1.24], [2.75,0.52,1.18], vein, 3);
    w.quad([0.28,0.52,0.74], [3.3,0.52,0.92], [3.3,0.52,0.86], [0.28,0.52,0.68], vein, 3);
    w.quad([0.28,0.52,0.20], [3.0,0.52,-0.02], [3.0,0.52,-0.10], [0.28,0.52,0.12], vein, 4);
    w.quad([2.6,0.52,0.02], [3.0,0.52,-0.04], [3.0,0.52,-0.22], [2.6,0.52,-0.16], vein, 4);
    w.quad([0.28,0.52,0.06], [3.1,0.52,-0.42], [3.1,0.52,-0.48], [0.28,0.52,0.0], vein, 4);
  });
  flyWingGeom = w.build(); flyWingTris = w.tris;
})();

/* --- BEAST-RIDER + SADDLE. Origin = top of the seat. --- */
(function(){
  var U = PAL.uniform, leather = flyCol(U.brown), leather2 = flyCol(U.brown, -0.3), green = flyCol(U.green), green2 = flyCol(U.green, -0.25), trim = flyCol(U.trim),
      skin = flyCol(PAL.people.skin[0]), blanket = flyCol(PAL.cloth[0]), pennon = flyCol(PAL.cloth[3]), wood = flyCol(PAL.timber[1]), dark = flyCol(0x14120e), rope = flyCol(PAL.rope[0]);
  var O = [0,0,0], HIP = [0.17,0.10,-0.05], KNEE = [0.19,-0.32,-0.05], SH = [0.25,0.64,-0.05], HDp = [0,0.76,-0.04], LB = [-0.46,-0.35,0.12], LT = [-0.46,3.0,-0.25];
  flyBones[FLY_R] = [
    { p:[0,0.10,-0.05], a:X, par:8 }, { p:HDp, a:Y, par:0 }, { p:SH, a:X, par:0 }, { p:HIP, a:X, par:8 }, { p:KNEE, a:X, par:3 },
    { p:LB, a:[0,0,0], par:-1, k:1 }, { p:LT, a:Y, par:5 },
    { p:O, a:X, par:10, k:2 }, { p:O, a:Y, par:7, k:2 }, { p:O, a:[0,0,0], par:-1, k:1 }, { p:O, a:X, par:9 } ];
  var g = new FlyGeo({0:1,1:1,5:1,6:1,7:1,8:1,9:1,10:1});
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

/* ------------------------------------------------------------------ obstacles
   flyHit(x,y,z, mT,mP,mB, skipPlat) -> 0 clear | 1 trunk | 2 platform | 3 bridge | 4 bough | 5 ground */
var FLY_CELL = 32, flyHash = {}, flyBr = [], flyPathStatsFol = 0;
(function(){
  function put(x, y, z, r){
    var R = r + 8, i0 = Math.floor((x-R)/FLY_CELL), i1 = Math.floor((x+R)/FLY_CELL), j0 = Math.floor((z-R)/FLY_CELL), j1 = Math.floor((z+R)/FLY_CELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k = i*8192+j; (flyHash[k] || (flyHash[k] = [])).push(x, y, z, r); }
  }
  BRANCHES.forEach(function(B){
    for(var i=0;i<B.pts.length-1;i++){ var a = B.pts[i], b = B.pts[i+1];
      if(Math.max(a.r, b.r) <= 2) continue;
      var L = Math.hypot(b.x-a.x, b.y-a.y, b.z-a.z), n = Math.max(1, Math.ceil(L/4));
      for(var s=0;s<n;s++){ var t = s/n, r = mix(a.r, b.r, t); if(r > 2) put(mix(a.x,b.x,t), mix(a.y,b.y,t), mix(a.z,b.z,t), r); } }
  });
  /* leaf clumps: read the real foliage instances the tree pass emitted */
  var flyFolN = 0;
  scene.traverse(function(o){
    if(!o.isInstancedMesh || !o.userData.trees || !/foliage/i.test(o.userData.inspectLabel || '')) return;
    var M = o.instanceMatrix.array;
    for(var i=0;i<o.count;i++){ var k = i*16, sx = Math.hypot(M[k], M[k+1], M[k+2]);
      if(sx < 6 || Math.abs(M[k+12]) > 1700 || Math.abs(M[k+14]) > 1700) continue;
      put(M[k+12], M[k+13], M[k+14], Math.max(1, sx*0.5-3)); flyFolN++; }
  });
  flyPathStatsFol = flyFolN;
  BRIDGES.forEach(function(br){ flyBr.push({ br:br, x0:Math.min(br.a.x,br.b.x), x1:Math.max(br.a.x,br.b.x), z0:Math.min(br.a.z,br.b.z), z1:Math.max(br.a.z,br.b.z),
    y0:Math.min(br.a.y,br.b.y)-br.sag-1, y1:Math.max(br.a.y,br.b.y)+3 }); });
})();
function flyHit(x, y, z, mT, mP, mB, skipPlat){
  var i, d;
  for(i=0;i<TREES.length;i++){ var T = TREES[i];
    if(y > T.y0+T.H+4) continue;
    d = Math.hypot(x-T.x, z-T.z); if(d < 60+mT && d < trunkR(T, y)+mT) return 1; }
  for(i=0;i<PLATS.length;i++){ var P = PLATS[i]; if(P === skipPlat) continue;
    var Rm = P.R*Math.max(P.sx, P.sz), dx = x-P.x, dz = z-P.z;
    if(Math.abs(dx) > Rm+mP || Math.abs(dz) > Rm+mP) continue;
    d = Math.hypot(dx, dz);
    var top = P.y + (P.kind === 'council' ? 46 : P.main ? 22 : (P.support === 'over' || P.support === 'hang') ? 34 : 15);
    if(y > P.yBottom-3-mP*0.4 && y < top+mP*0.4 && d < Rm+mP) return 2;
    if(P.main && y <= P.yBottom && y > P.yBottom-42){ if(d < Rm*(1-(P.yBottom-y)/42) + mP*0.5) return 2; } }
  for(i=0;i<flyBr.length;i++){ var b = flyBr[i];
    if(x < b.x0-8 || x > b.x1+8 || z < b.z0-8 || z > b.z1+8 || y < b.y0-mB || y > b.y1+mB) continue;
    var br = b.br, ex = br.b.x-br.a.x, ez = br.b.z-br.a.z, t = clamp(((x-br.a.x)*ex+(z-br.a.z)*ez)/(ex*ex+ez*ez), 0, 1);
    if(Math.hypot(x-br.a.x-ex*t, z-br.a.z-ez*t) < br.w*0.5+4 && Math.abs(y-bridgeY(br, t)-1) < mB) return 3; }
  var cell = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
  if(cell) for(i=0;i<cell.length;i+=4){ var ax = x-cell[i], ay = y-cell[i+1], az = z-cell[i+2], rr2 = cell[i+3]+6;
    if(ax*ax+ay*ay+az*az < rr2*rr2) return 4; }
  return 0;
}
/* a straight leg a->b: 2-D tests against every trunk (near + far) and platform, sampled boughs + ground */
function flyLineHit(ax, ay, az, bx, by, bz, mT, mP, halfW){
  var i, d, L = Math.hypot(bx-ax, bz-az), ym = Math.min(ay, by), yM = Math.max(ay, by);
  halfW = halfW || 0;
  for(var pass=0; pass<2; pass++){ var arr = pass ? FARTREES : TREES;
    for(i=0;i<arr.length;i++){ var T = arr[i]; if(ym > T.y0+T.H+4) continue;
      d = segDist(T.x, T.z, ax, az, bx, bz); if(d < trunkR(T, ym)+mT+halfW) return 1; } }
  for(i=0;i<PLATS.length;i++){ var P = PLATS[i];
    if(yM < P.yBottom-45 || ym > P.y+50) continue;
    d = segDist(P.x, P.z, ax, az, bx, bz); if(d < P.R*Math.max(P.sx,P.sz)+mP+halfW) return 2; }
  var n = Math.ceil(L/6);
  for(i=0;i<=n;i++){ var t = i/n, x = mix(ax,bx,t), z = mix(az,bz,t), y = mix(ay,by,t);
    if(Math.abs(x) < 1700 && Math.abs(z) < 1700){
      var c = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
      if(c) for(var k=0;k<c.length;k+=4){ var ex = x-c[k], ey = y-c[k+1], ez = z-c[k+2], r2 = c[k+3]+6+halfW; if(ex*ex+ey*ey+ez*ez < r2*r2) return 4; }
      if(y < 240){ var h3 = flyHit(x, y, z, 0, 0, 5+halfW*0.3, null); if(h3 === 3) return 3; }
    }
    if(i%10 === 0 && y < terrainH(x, z)+28) return 5; }
  return 0;
}

/* ------------------------------------------------------------------ paths
   A path is a polyline {p:Float32Array xyz, cum:Float32Array, n, len, closed}. */
var flyV = new THREE.Vector3();
function flyPathFromPts(pts, closed){
  var n = pts.length, P = new Float32Array(n*3), C = new Float32Array(n), L = 0;
  for(var i=0;i<n;i++){ P[i*3] = pts[i][0]; P[i*3+1] = pts[i][1]; P[i*3+2] = pts[i][2];
    if(i) L += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1], pts[i][2]-pts[i-1][2]); C[i] = L; }
  return { p:P, cum:C, n:n, len:L, closed:!!closed };
}
function flyCurvePts(curve, step, out){
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.max(8, Math.ceil(L/step));
  for(var i=0;i<=n;i++){ curve.getPointAt(i/n, flyV); out.push([flyV.x, flyV.y, flyV.z]); }
  return L;
}
var flyS = [0,0,0,0];    /* x,y,z,seg */
function flyPathAt(path, s, seg){
  var C = path.cum, n = path.n;
  if(s <= 0){ seg = 0; s = 0; } else if(s >= path.len){ seg = n-2; s = path.len; }
  else { if(seg > n-2) seg = n-2; while(seg > 0 && C[seg] > s) seg--; while(seg < n-2 && C[seg+1] < s) seg++; }
  var d = C[seg+1]-C[seg], t = d > 0 ? (s-C[seg])/d : 0, P = path.p, k = seg*3;
  flyS[0] = P[k]+(P[k+3]-P[k])*t; flyS[1] = P[k+1]+(P[k+4]-P[k+1])*t; flyS[2] = P[k+2]+(P[k+5]-P[k+2])*t; flyS[3] = seg;
}
var FLY_EDGE = 3100;
function flyEdge(x, z, dx, dz){         /* distance along (dx,dz) from (x,z) to the spawn circle */
  var b = x*dx+z*dz, c = x*x+z*z-FLY_EDGE*FLY_EDGE; return -b+Math.sqrt(Math.max(0, b*b-c));
}
var flyPathStats = { accepted:0, rejected:0, reason:{ trunk:0, platform:0, bridge:0, bough:0, ground:0 }, blockedBays:0, usableBays:0 };
var FLY_REASON = ['', 'trunk', 'platform', 'bridge', 'bough', 'ground'];
function flyReject(code){ flyPathStats.rejected++; flyPathStats.reason[FLY_REASON[code]]++; return null; }
function flyCurveHit(curve, R, ownNear){
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.ceil(L/5);
  for(var i=0;i<=n;i++){ curve.getPointAt(i/n, flyV);
    var own = Math.hypot(flyV.x-R.px, flyV.z-R.pz) < ownNear;
    var h = flyHit(flyV.x, flyV.y, flyV.z, 12, 10, 5, own ? R.plat : null);
    if(!h && own){   /* in the mouth of the bay: stay in the slot between this floor and the one above */
      var dr = Math.hypot(flyV.x-R.plat.x, flyV.z-R.plat.z) - (R.rout+4.5);
      if(dr < 0 && (flyV.y < R.y+0.5 || flyV.y > R.y+R.H-0.3)) h = 2; }
    if(!h && flyV.y < terrainH(flyV.x, flyV.z)+20) h = 5;
    if(h){ flyLastHit = [h, i, n, flyV.x|0, flyV.y|0, flyV.z|0, own, R.y|0]; return h; } }
  return 0;
}
var flyLastHit = null;

/* ------------------------------------------------------------------ roost bays */
var flyBays = [];
(function(){
  var satSeen = {};
  ROOSTS.forEach(function(R0){
    var P = R0.plat, Lv = P.levels[R0.lvl], ang = R0.ang;
    /* keep the centre-line >= 1.7 m from the nearest gallery post */
    var np = P.main ? Math.round(TAU*Lv.Rout/5.2) : Math.max(6, Math.round(TAU*Lv.Rout/3.4)), stepA = TAU/np;
    var postA = (Math.round(ang/stepA-0.5)+0.5)*stepA, off = wrapPi(ang-postA), need = (P.main ? 1.7 : 1.1)/Lv.Rout;
    if(Math.abs(off) < need) ang = postA + (off >= 0 ? need : -need);
    var p = platXZ(P, Lv.Rout-1.2, ang), o = platOutDir(P, ang);
    var B = { id:R0.id, roost:R0, plat:P, px:p[0], y:Lv.y, pz:p[1], ox:o[0], oz:o[1], H:Lv.H, big:R0.big, rout:Lv.Rout,
              inward:Math.min(3.0, Lv.Rout*0.3), ok:true, occ:null, reserved:false, rook:P === P_RK };
    if(!P.main){ if(satSeen[P.id]) B.ok = false; satSeen[P.id] = 1; }
    flyBays.push(B);
  });
})();

/* terminal curve of an arrival: G0 -> G (on the inbound line) -> line-up -> 60 m straight final -> touchdown */
function flyArrCurve(B, sp, theta, yOff, gDist){
  var S = FLY_SPEC[sp], ox = B.ox, oz = B.oz, c = Math.cos(theta), s = Math.sin(theta), dx = ox*c-oz*s, dz = ox*s+oz*c;
  var qx = -oz, qz = ox, lat = clamp(theta, -1, 1)*70, yIn = B.y + B.H*0.55, yG = yIn + yOff;
  var end = sp === FLY_B ? [B.px-ox*2.0, B.y+B.H-S.stand, B.pz-oz*2.0] : [B.px-ox*1.0, B.y+S.stand, B.pz-oz*1.0];
  var pts = [
    new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)),
    new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist),
    new THREE.Vector3(B.px+ox*200+qx*lat, yIn+Math.min(16, yOff*0.3), B.pz+oz*200+qz*lat),
    new THREE.Vector3(B.px+ox*104, yIn+3, B.pz+oz*104),
    new THREE.Vector3(B.px+ox*64, yIn+1, B.pz+oz*64),
    new THREE.Vector3(B.px+ox*15, yIn, B.pz+oz*15),
    new THREE.Vector3(end[0], end[1], end[2]) ];
  return { curve:new THREE.CatmullRomCurve3(pts, false, 'centripetal'), dx:dx, dz:dz, yG:yG, g0:pts[0] };
}
function flyDepCurve(B, sp, theta, yOff, gDist){
  var S = FLY_SPEC[sp], ox = B.ox, oz = B.oz, c = Math.cos(theta), s = Math.sin(theta), dx = ox*c-oz*s, dz = ox*s+oz*c;
  var qx = -oz, qz = ox, lat = clamp(theta, -1, 1)*60, y0 = B.y + S.stand, yG = B.y + B.H*0.55 + yOff, pts;
  if(sp === FLY_B){ var yc = B.y+B.H-S.stand;
    pts = [ new THREE.Vector3(B.px-ox*2.0, yc, B.pz-oz*2.0), new THREE.Vector3(B.px+ox*1.5, yc-3.2, B.pz+oz*1.5),
            new THREE.Vector3(B.px+ox*13, B.y+2.2, B.pz+oz*13), new THREE.Vector3(B.px+ox*38, B.y+2.5, B.pz+oz*38) ];
  } else {
    var dip = Math.min(2.4, (S.stand-0.65)*2);      /* drop off the lip, but never below the floor line inside the mouth */
    pts = [ new THREE.Vector3(B.px+ox*0.9, y0, B.pz+oz*0.9), new THREE.Vector3(B.px+ox*11, y0-dip, B.pz+oz*11),
            new THREE.Vector3(B.px+ox*32, y0-dip-1.4, B.pz+oz*32) ];
  }
  pts.push(new THREE.Vector3(B.px+ox*75, B.y+B.H*0.55+2, B.pz+oz*75),
           new THREE.Vector3(B.px+ox*185+qx*lat, B.y+B.H*0.55+Math.min(26, yOff*0.4), B.pz+oz*185+qz*lat),
           new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist),
           new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)));
  return { curve:new THREE.CatmullRomCurve3(pts, false, 'centripetal'), dx:dx, dz:dz, yG:yG, g0:pts[pts.length-1] };
}
/* try a handful of azimuth/altitude variants; returns {path, curve, far:[x,y,z]} or null */
function flyRoute(B, sp, arriving, tries, nearOnly){
  for(var t=0; t<tries; t++){
    var low = (t%2) === 1, theta = (flyRand()*2-1)*(t < 3 ? 0.7 : 1.25), yOff = low ? -40+flyRand()*50 : arriving ? 30+flyRand()*90 : 50+flyRand()*100, gD = 380+flyRand()*110;
    var C = arriving ? flyArrCurve(B, sp, theta, yOff, gD) : flyDepCurve(B, sp, theta, yOff, gD);
    var h = flyCurveHit(C.curve, B, 50);
    if(h){ flyReject(h); continue; }
    var dist = flyEdge(C.g0.x, C.g0.z, C.dx, C.dz), fx = C.g0.x+C.dx*dist, fz = C.g0.z+C.dz*dist;
    if(!nearOnly){ h = flyLineHit(C.g0.x, C.yG, C.g0.z, fx, C.yG, fz, 15, 25, 0); if(h){ flyReject(h); continue; } }
    flyPathStats.accepted++;
    var pts = [];
    if(arriving){ pts.push([fx, C.yG, fz]); flyCurvePts(C.curve, 2.5, pts); }
    else { flyCurvePts(C.curve, 2.5, pts); pts.push([fx, C.yG, fz]); }
    var path = flyPathFromPts(pts, false); path.curve = C.curve; path.straight = dist;
    return path;
  }
  return null;
}

/* ------------------------------------------------------------------ meshes */
var flyMesh = [], flyPose = [], flyPoseBuf = [], flyUsed = [], flySlotOwner = [], flyWingMesh = null;
function flyMakeMesh(sp, geom, cap, mat, share){
  var arr, ib;
  if(share){ arr = flyPose[share]; ib = flyPoseBuf[share]; }
  else { arr = new Float32Array(cap*16); ib = new THREE.InstancedInterleavedBuffer(arr, 16, 1); ib.setUsage(THREE.DynamicDrawUsage); }
  for(var k=0;k<4;k++) geom.setAttribute('aFlyP'+k, new THREE.InterleavedBufferAttribute(ib, 4, k*4));
  var m = new THREE.InstancedMesh(geom, mat, cap);
  m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  if(share){ m.instanceMatrix = flyMesh[share].instanceMatrix; m.instanceColor = flyMesh[share].instanceColor; }
  else {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(var i=0;i<cap*16;i++) m.instanceMatrix.array[i] = 0;
    var c = new THREE.Color(1,1,1); for(i=0;i<cap;i++) m.setColorAt(i, c);
    flyPose[sp] = arr; flyPoseBuf[sp] = ib; flyUsed[sp] = new Uint8Array(cap); flySlotOwner[sp] = new Array(cap);
  }
  m.count = 1; scene.add(m);
  return m;
}
for(var flyI=0; flyI<5; flyI++){
  flyMesh[flyI] = flyMakeMesh(flyI, flyGeoms[flyI], flyI === FLY_R ? FLY_RCAP : FLY_CAP,
    nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide }), 'fly'+flyI, flySkinHook(flyBones[flyI])));
}
flyWingMesh = flyMakeMesh(FLY_D, flyWingGeom, FLY_CAP,
  nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide, transparent:true, opacity:0.55, depthWrite:false }), 'flyWing', flySkinHook(flyBones[FLY_D])), FLY_D);
flyWingMesh.renderOrder = 3;

function flySlotGet(sp, owner){
  var U = flyUsed[sp], n = U.length;
  for(var i=0;i<n;i++) if(!U[i]){ U[i] = 1; flySlotOwner[sp][i] = owner; if(i+1 > flyMesh[sp].count) flyMesh[sp].count = i+1; return i; }
  return -1;
}
function flySlotFree(sp, i){
  if(i < 0) return;
  var U = flyUsed[sp], M = flyMesh[sp].instanceMatrix.array; U[i] = 0; flySlotOwner[sp][i] = null;
  for(var k=0;k<16;k++) M[i*16+k] = 0;
  var c = flyMesh[sp].count; while(c > 1 && !U[c-1]) c--; flyMesh[sp].count = c;
}

/* night glints: rider lanterns + bat eyes */
var FLY_NGL = 64, flyGlPos = new Float32Array(FLY_NGL*3), flyGlCol = new Float32Array(FLY_NGL*4), flyGlGeo = new THREE.BufferGeometry();
flyGlGeo.setAttribute('position', new THREE.BufferAttribute(flyGlPos, 3).setUsage(THREE.DynamicDrawUsage));
flyGlGeo.setAttribute('aCol', new THREE.BufferAttribute(flyGlCol, 4).setUsage(THREE.DynamicDrawUsage));
var flyGlMat = new THREE.ShaderMaterial({
  uniforms:{ uK:{ value:0 }, uScale:{ value:400 } }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:'attribute vec4 aCol; varying vec4 vC; uniform float uScale; uniform float uK;\nvoid main(){ vC = vec4(aCol.rgb, uK); vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(aCol.a*uScale/max(1.0,-mv.z), 1.5, 48.0); }',
  fragmentShader:'varying vec4 vC;\nvoid main(){ vec2 d = gl_PointCoord-0.5; float r = length(d)*2.0; float a = smoothstep(1.0,0.0,r); a = a*a*0.55 + smoothstep(0.35,0.0,r)*0.6; gl_FragColor = vec4(vC.rgb*a*vC.a, 1.0); }'
});
var flyGlints = new THREE.Points(flyGlGeo, flyGlMat); flyGlints.frustumCulled = false; flyGlints.visible = false; flyGlints.renderOrder = 4;
flyGlGeo.setDrawRange(0, 1); scene.add(flyGlints);
var flyLampC = new THREE.Color(PAL.glowWarm).convertSRGBToLinear(), flyEyeC = new THREE.Color(PAL.beast.quetz[2]).convertSRGBToLinear();

/* ------------------------------------------------------------------ animals */
var flyList = [], flyNextId = 1, flySimT = 0, flyEvents = { arr:[], dep:[] }, flyTotals = { arrivals:0, departures:0, transientsSpawned:0 };
var flyCircuits = [], flyTintC = new THREE.Color();
function flyNew(sp, ridden){
  var S = FLY_SPEC[sp], a = { id:flyNextId++, sp:sp, ridden:!!ridden, lance:ridden && Math.random() < 0.4, slot:-1, rslot:-1,
    state:'fly', pop:'', path:null, s:0, seg:0, vc:S.v[0]+Math.random()*(S.v[1]-S.v[0]), v:0,
    x:0, y:0, z:0, yaw:0, pitch:0, roll:0, yawRate:0, ph:Math.random()*TAU, amp:1, flapOn:true, flapT:2+Math.random()*4,
    fold:0, flare:0, launchT:99, t:0, bay:null, offL:0, offY:0, offS:0, size:0.92+Math.random()*0.16,
    hover:false, hoverT:2+Math.random()*5, yawOff:0, hy:0, hyT:0, hyTarget:0, shuf:0, riderMode:0, riderT:0, dest:'', perchSince:0,
    fx:0, fy:0, fz:0, tx:0, ty:0, tz:0, yaw0:0, p0:0, depPath:null, prepT:0, idleSeed:Math.random()*100, crouch:0, patrol:false };
  a.v = a.vc; a.riderMode = ridden ? 1 : 0;
  a.slot = flySlotGet(sp, a);
  if(a.slot < 0) return null;
  var b = 0.80+Math.random()*0.32, w = (Math.random()-0.5)*0.12;
  flyTintC.setRGB(b*(1+w), b, b*(1-w)); flyMesh[sp].setColorAt(a.slot, flyTintC); flyMesh[sp].instanceColor.needsUpdate = true;
  flyList.push(a);
  return a;
}
function flyRemove(a){
  flySlotFree(a.sp, a.slot); if(a.rslot >= 0){ flySlotFree(FLY_R, a.rslot); a.rslot = -1; }
  var i = flyList.indexOf(a); if(i >= 0){ flyList[i] = flyList[flyList.length-1]; flyList.pop(); }
  a.slot = -1; a.state = 'gone';
}
function flyPlaceOnPath(a){
  flyPathAt(a.path, a.s, a.seg); a.seg = flyS[3]; var x = flyS[0], y = flyS[1], z = flyS[2];
  var s2 = Math.min(a.path.len, a.s+4), back = false; if(s2-a.s < 1){ s2 = Math.max(0, a.s-4); back = true; }
  flyPathAt(a.path, s2, a.seg);
  var tx = flyS[0]-x, ty = flyS[1]-y, tz = flyS[2]-z; if(back){ tx = -tx; ty = -ty; tz = -tz; }
  var hl = Math.sqrt(tx*tx+tz*tz) || 1e-6;
  a.x = x - (tz/hl)*a.offL*-1; a.z = z - (tx/hl)*a.offL; a.y = y + a.offY;
  a.tx = tx; a.ty = ty; a.tz = tz;
}
function flySnapHeading(a){ a.yaw = Math.atan2(a.tx, a.tz); a.pitch = clamp(Math.atan2(a.ty, Math.hypot(a.tx, a.tz)), -0.6, 0.6); a.roll = 0; a.yawRate = 0; }

function flyHourW(sp, hour, arriving){
  var dusk = hour >= 17.5 && hour < 23, night = hour >= 23 || hour < 4.5, dawn = hour >= 4.5 && hour < 7;
  if(sp === FLY_B) return dusk ? (arriving ? 1.2 : 3.2) : night ? 2.2 : dawn ? (arriving ? 3.2 : 0.6) : 0.08;
  var w = sp === FLY_D ? 0.8 : 1;
  return dusk ? w*0.5 : night ? w*0.14 : w;
}
function flyPickSp(hour, arriving, big){
  var w = [flyHourW(0,hour,arriving)*(big?3:1), big ? 0 : flyHourW(1,hour,arriving), flyHourW(2,hour,arriving), big ? 0 : flyHourW(3,hour,arriving)];
  var t = Math.random()*(w[0]+w[1]+w[2]+w[3]);
  for(var i=0;i<4;i++){ t -= w[i]; if(t <= 0) return i; }
  return 0;
}

/* --- transients --- */
var FLY_TRANSIENTS = 26;
function flySpawnTransient(prefill, hour){
  var dusk = hour >= 17 || hour < 5.5;
  var w = [0.30, dusk ? 0.55 : 0.05, 0.30, 0.25], t = Math.random()*(w[0]+w[1]+w[2]+w[3]), sp = 0;
  for(var i=0;i<4;i++){ t -= w[i]; if(t <= 0){ sp = i; break; } }
  var flock = ((sp === FLY_A && Math.random() < 0.4) || (sp === FLY_B && dusk && Math.random() < 0.6)) ? 3+Math.floor(Math.random()*5) : 1;
  var ridden = flock === 1 && Math.random() < 0.28;
  for(var tr=0; tr<(prefill ? 40 : 8); tr++){
    var ax, az, bx, bz, y, r = Math.random(), dx, dz, L;
    if(r < 0.2){            /* low, along the river corridor */
      var s1 = RIVER_LEN*(0.30+Math.random()*0.15), s2 = RIVER_LEN*(0.55+Math.random()*0.15), p1 = riverAt(s1), p2 = riverAt(s2);
      dx = p2.x-p1.x; dz = p2.z-p1.z; L = Math.hypot(dx, dz); dx /= L; dz /= L; if(Math.random() < 0.5){ dx = -dx; dz = -dz; }
      ax = p1.x-dx*flyEdge(p1.x, p1.z, -dx, -dz); az = p1.z-dz*flyEdge(p1.x, p1.z, -dx, -dz);
      y = Math.max(riverLevel(s1), riverLevel(s2)) + 40+Math.random()*50;
    } else {
      var an = Math.random()*TAU; ax = Math.cos(an)*FLY_EDGE; az = Math.sin(an)*FLY_EDGE;
      var gx = (Math.random()-0.5)*2400 - 40, gz = (Math.random()-0.5)*2400 - 250;
      dx = gx-ax; dz = gz-az; L = Math.hypot(dx, dz); dx /= L; dz /= L;
      y = r < 0.55 ? 115+Math.random()*80 : r < 0.68 ? 200+Math.random()*140 : 470+Math.random()*90;
    }
    var D = flyEdge(ax+dx, az+dz, dx, dz)+1; bx = ax+dx*D; bz = az+dz*D;
    if(flyLineHit(ax, y, az, bx, y, bz, 25, 40, flock > 1 ? 26 : 0)){ flyPathStats.rejected++; flyPathStats.reason.trunk += 0; continue; }
    flyPathStats.accepted++;
    var path = flyPathFromPts([[ax,y,az],[bx,y,bz]], false), s0 = prefill ? Math.random()*path.len*0.9 : 0, lead = null;
    for(var k=0;k<flock;k++){
      var a = flyNew(sp, ridden); if(!a) break;
      a.pop = 'transient'; a.path = path;
      if(k){ var rank = Math.ceil(k/2); a.offL = ((k%2) ? 1 : -1)*rank*(7+Math.random()*3); a.offS = -rank*(8+Math.random()*4); a.offY = Math.random()*4-2; a.vc = lead.vc; a.v = lead.v; }
      else lead = a;
      a.s = Math.max(0, s0 + a.offS + 40); a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a);
    }
    flyTotals.transientsSpawned += flock;
    return true;
  }
  return false;
}

/* --- roost traffic --- */
function flyFreeBays(plat){ var out = []; for(var i=0;i<flyBays.length;i++){ var B = flyBays[i]; if(B.ok && !B.occ && !B.reserved && (!plat || B.plat === plat)) out.push(B); } return out; }
function flySpawnArrival(plat, spForce, near, hour){
  var free = flyFreeBays(plat); if(!free.length) return null;
  for(var tr=0; tr<(near ? 12 : 4); tr++){
    var B = free[Math.floor(Math.random()*free.length)];
    if(!plat && !B.rook && Math.random() < 0.35) continue;            /* the Rookery is the busiest */
    var sp = (spForce === undefined || spForce === null) ? flyPickSp(hour, true, B.big) : spForce;
    var path = flyRoute(B, sp, true, 4, !!near); if(!path) continue;
    var a = flyNew(sp, Math.random() < (B.rook ? 0.9 : 0.72)); if(!a) return null;
    a.pop = 'arr'; a.bay = B; B.reserved = true; a.path = path; a.dest = B.plat.name;
    a.s = near ? Math.max(0, path.straight-60) : 0; flyPlaceOnPath(a); flySnapHeading(a);
    return a;
  }
  return null;
}
function flyStartDeparture(plat, spForce, quick, hour){
  var best = null, bw = 0;
  for(var i=0;i<flyList.length;i++){ var a = flyList[i];
    if(a.state !== 'perch' || (plat && a.bay.plat !== plat) || (spForce !== undefined && spForce !== null && a.sp !== spForce)) continue;
    if(!quick && flySimT-a.perchSince < 45) continue;
    var w = (quick ? 1 : flyHourW(a.sp, hour, false))*(a.bay.rook ? 1.6 : 1)*Math.random(); if(w > bw){ bw = w; best = a; } }
  if(!best) return null;
  var path = flyRoute(best.bay, best.sp, false, 8, false); if(!path) return null;
  best.depPath = path; best.state = 'prep'; best.t = 0;
  best.ridden = Math.random() < (best.bay.rook ? 0.9 : 0.72); best.lance = best.ridden && Math.random() < 0.4;
  best.prepT = quick ? (best.ridden ? 2.5 : 0.5) : (best.ridden ? 8+Math.random()*10 : 1+Math.random()*3);
  best.riderMode = best.ridden ? 2 : 0; best.dest = best.bay.plat.name;
  return best;
}
function flyPerchPoint(a, out){
  var B = a.bay, S = FLY_SPEC[a.sp];
  if(a.sp === FLY_B){ out[0] = B.px-B.ox*2.0; out[1] = B.y+B.H-S.stand; out[2] = B.pz-B.oz*2.0; }
  else { var d = 1.0+B.inward; out[0] = B.px-B.ox*d; out[1] = B.y+S.stand*a.size; out[2] = B.pz-B.oz*d; }
}
var flyP3 = [0,0,0];
function flyPerchNow(a, B){          /* put an animal straight onto a perch (load time) */
  a.bay = B; B.occ = a; a.pop = 'roost'; a.state = 'perch'; a.fold = 1; a.amp = 0; a.riderMode = 0; a.ridden = false; a.dest = B.plat.name;
  flyPerchPoint(a, flyP3); a.x = flyP3[0]; a.y = flyP3[1]; a.z = flyP3[2];
  a.yaw = a.sp === FLY_B ? Math.atan2(-B.ox, -B.oz) : Math.atan2(B.ox, B.oz); a.pitch = FLY_SPEC[a.sp].perchPitch; a.roll = 0; a.perchSince = -Math.random()*300; a.v = 0;
}

/* --- one simulation step for one animal --- */
function flyStep(a, h){
  var S = FLY_SPEC[a.sp], B = a.bay, k;
  if(a.state === 'fly'){
    var path = a.path, rem = path.len - a.s, vT = a.vc;
    if(a.pop === 'arr'){
      if(rem < 320) vT = mix(a.vc*0.55, a.vc, clamp((rem-70)/250, 0, 1));
      if(rem < 20) vT = mix(a.sp === FLY_B ? 5 : 2.6, a.vc*0.55, rem/20);
      a.flare = a.sp === FLY_B ? 0 : smooth(0, 1, 1-rem/19);
    } else if(a.launchT < 3) vT = mix(7, a.vc, a.launchT/3);
    if(a.sp === FLY_D && (a.pop === 'transient' || a.pop === 'circuit') ){
      a.hoverT -= h;
      if(a.hoverT <= 0){ a.hover = !a.hover; a.hoverT = a.hover ? 0.8+Math.random()*1.6 : 3+Math.random()*6; a.yawOff = a.hover ? (Math.random()-0.5)*1.6 : 0; }
      vT = a.hover ? 1.0 : a.vc*1.15;
      a.v += (vT-a.v)*Math.min(1, h*3.5);
    } else a.v += (vT-a.v)*Math.min(1, h*1.6);
    a.s += a.v*h; a.launchT += h;
    if(path.closed){ if(a.s >= path.len) { a.s -= path.len; a.seg = 0; } }
    else if(a.s >= path.len){
      if(a.pop === 'arr'){                                  /* touchdown */
        a.s = path.len; flyPlaceOnPath(a);
        a.fx = a.x; a.fy = a.y; a.fz = a.z; a.t = 0; a.p0 = a.pitch; a.yaw0 = Math.atan2(-B.ox, -B.oz); a.yaw = a.yaw0; a.roll = 0; a.v = 0;
        a.state = a.sp === FLY_B ? 'flip' : 'walk'; B.occ = a; B.reserved = false; a.pop = 'roost';
        flyEvents.arr.push(flySimT); flyTotals.arrivals++;
      } else flyRemove(a);
      return;
    }
    flyPlaceOnPath(a);
    var yawT = Math.atan2(a.tx, a.tz) + a.yawOff, dy = wrapPi(yawT-a.yaw), kk = Math.min(1, h*(a.hover ? 6 : 3.2)), yr = dy*kk/h;
    a.yaw = wrapPi(a.yaw + dy*kk);
    if(yr !== yr) yr = 0; if(a.yawRate !== a.yawRate) a.yawRate = 0; if(a.roll !== a.roll) a.roll = 0;
    a.yawRate += (yr-a.yawRate)*Math.min(1, h*4);
    var pT = clamp(Math.atan2(a.ty, Math.hypot(a.tx, a.tz)), a.launchT < 2.5 ? -1.2 : -0.55, 0.6) + a.flare*0.72 + (a.hover ? 0.22 : 0);
    if(a.sp === FLY_B && a.launchT < 1.6) pT = mix(-Math.PI/2, pT, smooth(0.35, 1.5, a.launchT));
    if(a.sp === FLY_B && a.pop === 'arr' && rem < 7) pT += (1-rem/7)*0.7;
    a.pitch += (pT-a.pitch)*Math.min(1, h*5);
    var rT = clamp(-Math.atan(a.v*a.yawRate/7.4)*0.9, -1.0, 1.0)*(1-a.flare);
    a.roll += (rT-a.roll)*Math.min(1, h*3);
    if(a.launchT < 1) a.fold = 1-smooth(0, 0.55, a.launchT); else a.fold = 0;
    a.crouch = 0;
  }
  else if(a.state === 'walk'){
    a.t += h; k = clamp(a.t/3.2, 0, 1); flyPerchPoint(a, flyP3);
    a.x = mix(a.fx, flyP3[0], k); a.z = mix(a.fz, flyP3[2], k); a.y = mix(a.fy, flyP3[1], smooth(0, 0.5, k)) + Math.abs(Math.sin(a.t*5))*0.07;
    a.fold = smooth(0.2, 2.2, a.t); a.flare = 1-smooth(0, 0.8, a.t); a.pitch = mix(a.p0, S.perchPitch, smooth(0, 1.2, a.t)); a.yaw = a.yaw0; a.roll = Math.sin(a.t*5)*0.04;
    if(a.t >= 3.2){ a.state = 'turn'; a.t = 0; }
  }
  else if(a.state === 'turn'){
    a.t += h; a.yaw = wrapPi(a.yaw0 + Math.PI*smooth(0, 1, a.t/2.6)); a.roll = Math.sin(a.t*5)*0.04*(a.t < 2.6 ? 1 : 0);
    flyPerchPoint(a, flyP3); a.y = flyP3[1] + Math.abs(Math.sin(a.t*5))*0.06;
    if(a.t >= 2.8){ a.state = 'perch'; a.roll = 0; a.y = flyP3[1]; a.perchSince = flySimT; if(a.ridden){ a.riderMode = 2; a.riderT = 25+Math.random()*40; } a.ridden = false; }
  }
  else if(a.state === 'flip'){
    a.t += h; k = smooth(0, 1, a.t/0.85); flyPerchPoint(a, flyP3);
    a.x = mix(a.fx, flyP3[0], k); a.y = mix(a.fy, flyP3[1], k); a.z = mix(a.fz, flyP3[2], k);
    a.pitch = mix(a.p0, Math.PI*1.5, k); a.fold = smooth(0.4, 1, k); a.yaw = a.yaw0; a.roll = 0;
    if(a.t >= 0.85){ a.state = 'perch'; a.pitch = -Math.PI/2; a.fold = 1; a.perchSince = flySimT; if(a.ridden){ a.riderMode = 2; a.riderT = 25+Math.random()*40; } a.ridden = false; }
  }
  else if(a.state === 'perch'){
    if(a.riderMode === 2){ a.riderT -= h; if(a.riderT <= 0) a.riderMode = 0; }
  }
  else if(a.state === 'prep'){
    a.t += h;
    if(a.ridden) a.riderMode = a.t < a.prepT*0.7 ? 2 : 1;
    if(a.t >= a.prepT){ a.t = 0; a.riderMode = a.ridden ? 1 : 0;
      if(a.sp === FLY_B) flyLaunch(a); else { a.state = 'tolip'; a.fx = a.x; a.fy = a.y; a.fz = a.z; } }
  }
  else if(a.state === 'tolip'){
    a.t += h; k = clamp(a.t/3.0, 0, 1);
    a.x = mix(a.fx, B.px+B.ox*0.9, k); a.z = mix(a.fz, B.pz+B.oz*0.9, k); a.y = a.fy + Math.abs(Math.sin(a.t*5))*0.07; a.roll = Math.sin(a.t*5)*0.04;
    if(a.t >= 3.0){ a.state = 'crouch'; a.t = 0; a.roll = 0; a.y = a.fy; }
  }
  else if(a.state === 'crouch'){
    a.t += h; a.crouch = Math.sin(clamp(a.t/0.6, 0, 1)*Math.PI*0.5); a.fold = 1-0.25*a.crouch;
    if(a.t >= 0.6) flyLaunch(a);
  }
}
function flyLaunch(a){
  var B = a.bay; a.state = 'fly'; a.pop = 'dep'; a.path = a.depPath; a.depPath = null; a.s = 0; a.seg = 0; a.launchT = 0; a.v = a.sp === FLY_B ? 4 : 8;
  a.flapOn = true; a.flapT = 9; a.flare = 0;
  if(B){ B.occ = null; } flyEvents.dep.push(flySimT); flyTotals.departures++;
}

/* ------------------------------------------------------------------ pose + instance matrices */
var flyE = new THREE.Euler(0, 0, 0, 'YXZ'), flyM = new THREE.Matrix4(), flyQt = new THREE.Quaternion(), flyPv = new THREE.Vector3(), flySc = new THREE.Vector3();
var flyAng = new Float32Array(16);
function flyWrite(a, T){
  var sp = a.sp, S = FLY_SPEC[sp], A = flyAng, F = flyFold[sp], i;
  for(i=0;i<16;i++) A[i] = 0;
  var amp = a.amp, sn = Math.sin(a.ph), cs = Math.cos(a.ph), so = Math.sin(a.ph-S.lag), fl = a.flare;
  var flapA = amp*S.a0*(1+0.3*fl)*sn + 0.06 + (1-amp)*0.10;
  var outA = amp*S.a1*so - (1-amp)*0.04 - amp*0.10;
  var tw = -amp*S.tw*cs - fl*0.22, osw = amp*0.28*Math.max(0, cs);
  var hy = clamp(a.yawRate*1.2, -0.5, 0.5), pc = clamp(a.pitch, -0.6, 0.6);
  if(sp === FLY_Q){
    A[0] = pc*0.35 + fl*0.25; A[1] = 0.04; A[2] = hy; A[3] = -0.15*fl; A[4] = flapA; A[5] = tw; A[6] = osw; A[7] = outA; A[8] = -1.3*fl;
  } else if(sp === FLY_B){
    A[0] = pc*0.3; A[1] = hy; A[3] = osw*0.4; A[4] = flapA*0.72; A[5] = tw; A[6] = amp*S.a0*0.42*Math.sin(a.ph-S.lag*0.5) - 0.06;
    A[7] = osw*1.6; A[8] = outA; A[9] = 0;
  } else if(sp === FLY_A){
    A[0] = pc*0.35 + fl*0.2; A[1] = hy; A[2] = -0.45*fl - 0.04; A[3] = osw*0.3 - 0.12*fl; A[4] = flapA; A[5] = tw; A[6] = osw; A[7] = outA;
    A[8] = -1.2*fl; A[9] = clamp(-a.roll*0.4, -0.35, 0.35);
  } else {
    A[0] = -0.04 + 0.03*Math.sin(T*2.1+a.idleSeed) - (a.hover ? 0.12 : 0); A[1] = A[0]; A[2] = 0.45;
    A[3] = S.a0*sn + 0.10; A[4] = S.a0*Math.sin(a.ph+2.0) + 0.05; A[5] = -S.a0*sn + 0.10; A[6] = -S.a0*Math.sin(a.ph+2.0) + 0.05; A[7] = hy;
  }
  var f = a.fold, P = flyPose[sp], o = a.slot*16;
  for(i=0;i<16;i++) P[o+i] = A[i] + (F[i]-A[i])*f;
  if(f > 0.5){                                           /* perched idle: look about, breathe */
    var iy = 0.55*Math.sin(T*0.21+a.idleSeed)*Math.sin(T*0.13+a.idleSeed*1.7)*f, ib = 0.06*Math.sin(T*0.6+a.idleSeed)*f;
    if(sp === FLY_Q){ P[o+2] += iy; P[o] += ib + a.crouch*0.35; }
    else if(sp === FLY_B){ P[o+1] += iy*0.7; P[o] += ib; }
    else if(sp === FLY_A){ P[o+1] += iy; P[o] += ib + a.crouch*0.3; P[o+2] += ib*1.5; }
    else { P[o+7] += iy*0.5; P[o] += ib*0.5; }
  }
  var k = a.size, y = a.y + S.heave*amp*Math.sin(a.ph-1.9)*(1-f) - a.crouch*0.3;
  flyE.set(-a.pitch, a.yaw, a.roll, 'YXZ'); flyQt.setFromEuler(flyE); flyPv.set(a.x, y, a.z); flySc.set(k, k, k);
  flyM.compose(flyPv, flyQt, flySc);
  var e = flyM.elements, M = flyMesh[sp].instanceMatrix.array;
  for(i=0;i<16;i++) M[o+i] = e[i];
  if(a.rslot >= 0) flyWriteRider(a, e, T, hy);
}
function flyWriteRider(a, e, T, hy){
  var S = FLY_SPEC[a.sp], sd = S.saddle, rs = S.rs, o = a.rslot*16, M = flyMesh[FLY_R].instanceMatrix.array, P = flyPose[FLY_R], i;
  for(i=0;i<12;i++) M[o+i] = e[i]*rs;
  var oy = e[13] + e[1]*sd[0] + e[5]*sd[1] + e[9]*sd[2];
  M[o+12] = e[12] + e[0]*sd[0] + e[4]*sd[1] + e[8]*sd[2]; M[o+13] = oy; M[o+14] = e[14] + e[2]*sd[0] + e[6]*sd[1] + e[10]*sd[2]; M[o+15] = 1;
  var mode = a.riderMode; if(mode === 1 && a.sp === FLY_B && a.state !== 'fly') mode = 2;
  if(mode === 1){
    for(i=0;i<16;i++) P[o+i] = FLY_RSEAT[i];
    P[o] = 0.50 + 0.12*a.flare - (a.launchT < 2 ? 0.2 : 0); P[o+1] = hy*1.4; P[o+5] = a.lance ? 1 : 0; P[o+6] = 0.35*Math.sin(T*6+a.idleSeed);
    P[o+10] = clamp(a.pitch, -0.7, 0.7)*0.6;
  } else {
    for(i=0;i<16;i++) P[o+i] = 0;
    P[o+5] = a.lance ? 1 : 0;
    if(mode === 2 && a.bay){
      var ks = a.size*rs; P[o+9] = 1; P[o+10] = a.pitch;
      P[o+7] = ((a.id&1) ? 1.9 : -1.9)/ks; P[o+8] = (a.bay.y + 0.80*ks - oy)/ks;
      P[o+1] = 0.6*Math.sin(T*0.31+a.idleSeed*2); P[o+2] = -0.25 + 0.2*Math.sin(T*0.47+a.idleSeed); P[o] = 0.04*Math.sin(T*0.8+a.idleSeed);
    }
  }
}

/* ------------------------------------------------------------------ circuits (closed loops) */
function flyMakeCircuit(cx, cz, r0, r1, y0, y1, n){
  for(var tr=0; tr<200; tr++){
    var pts = [], ph0 = flyRand()*TAU, ex = 1+flyRand()*0.5, rot = flyRand()*TAU, R = r0+flyRand()*(r1-r0), yb = y0+flyRand()*(y1-y0), dir = flyRand() < 0.5 ? 1 : -1;
    var cr = Math.cos(rot), sr = Math.sin(rot);
    for(var i=0;i<n;i++){ var t = ph0 + dir*i/n*TAU, q = R*(0.85+0.3*flyRand()), lx = Math.cos(t)*q*ex, lz = Math.sin(t)*q;
      pts.push(new THREE.Vector3(cx+lx*cr-lz*sr, yb+(flyRand()-0.5)*30, cz+lx*sr+lz*cr)); }
    var curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal'); curve.arcLengthDivisions = 400;
    var L = curve.getLength(), m = Math.ceil(L/6), bad = 0;
    for(i=0;i<m && !bad;i++){ curve.getPointAt(i/m, flyV);
      bad = flyHit(flyV.x, flyV.y, flyV.z, 18, 18, 9, null); if(!bad && flyV.y < terrainH(flyV.x, flyV.z)+30) bad = 5; }
    if(bad){ flyReject(bad); continue; }
    flyPathStats.accepted++;
    var out = []; flyCurvePts(curve, 4, out);
    var path = flyPathFromPts(out, true); path.curve = curve;
    return path;
  }
  return null;
}
function flyAddCircuit(path, n, spList, label, wing){
  if(!path) return;
  path.label = label; flyCircuits.push(path);
  var s0 = flyRand()*path.len, lead = null;
  for(var k=0;k<n;k++){
    var a = flyNew(spList[k%spList.length], true); if(!a) return;
    a.pop = 'circuit'; a.path = path; a.dest = label; a.patrol = !!wing;
    if(wing){ if(k){ var rank = Math.ceil(k/2); a.offL = ((k%2) ? 1 : -1)*rank*9; a.offS = -rank*10; a.vc = lead.vc; } else lead = a;
      a.s = (s0 + a.offS + path.len) % path.len; a.lance = true; }
    else a.s = (s0 + k*path.len/n) % path.len;
    a.v = a.vc; a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a);
  }
}

/* ------------------------------------------------------------------ initial population */
var flyLegs = [], flyUsable = 0;
(function(){
  /* prove every bay has at least one clean approach; keep ~60 of the curves for the harness sweep */
  var okBays = [];
  flyBays.forEach(function(B){
    if(!B.ok) return;
    var p = flyRoute(B, B.big ? FLY_Q : FLY_A, true, 8, false);
    if(!p){ B.ok = false; flyPathStats.blockedBays++; return; }
    okBays.push(B); B.testCurve = p.curve;
  });
  flyUsable = flyPathStats.usableBays = okBays.length;
  var stride = Math.max(1, Math.floor(okBays.length/30));
  okBays.forEach(function(B, i){
    if(i%stride === 0 && flyLegs.length < 60){
      flyLegs.push({ name:'arr '+B.plat.name+' #'+B.id, curve:B.testCurve });
      var d = flyRoute(B, B.big ? FLY_Q : FLY_A, false, 5, true); if(d) flyLegs.push({ name:'dep '+B.plat.name+' #'+B.id, curve:d.curve });
    }
    B.testCurve = null;
  });
  /* perched animals in ~55% of the usable bays (bats sleep the day out, so they start perched too) */
  var rslots = 0;
  okBays.forEach(function(B){
    if(flyRand() > 0.55) return;
    var r = flyRand(), sp = B.big ? (r < 0.7 ? FLY_Q : FLY_A) : (r < 0.24 ? FLY_Q : r < 0.52 ? FLY_B : r < 0.84 ? FLY_A : FLY_D);
    var a = flyNew(sp, false); if(!a) return;
    flyPerchNow(a, B);
    a.saddled = flyRand() < (B.rook ? 0.6 : 0.4) && rslots < FLY_RCAP-70; if(a.saddled) rslots++;
    if(a.saddled && flyRand() < 0.25){ a.riderMode = 2; a.riderT = 20+flyRand()*200; a.lance = flyRand() < 0.4; }
    a.hyT = 5+flyRand()*60;
  });
  /* Rookery training circuits + city patrol wings */
  for(var c=0;c<3;c++) flyAddCircuit(flyMakeCircuit(P_RK.x, P_RK.z, 170+c*40, 260+c*60, P_RK.y-62, P_RK.y+12, 8), 3, [c === 1 ? FLY_A : FLY_Q, FLY_A, c === 2 ? FLY_D : FLY_Q], 'Rookery training circuit', false);
  flyAddCircuit(flyMakeCircuit(P_C.x, P_C.z, 480, 640, 95, 135, 10), 3, [FLY_Q], 'City patrol', true);
  flyAddCircuit(flyMakeCircuit(P_C.x, P_C.z, 680, 900, 490, 540, 10), 3, [FLY_A], 'City patrol', true);
})();
flyRand = Math.random;
(function(){
  var h0 = 12; try{ h0 = skyHour(); }catch(err){}
  for(var i=0;i<FLY_TRANSIENTS;i++) flySpawnTransient(true, h0);
  for(i=0;i<7;i++){ var a = flySpawnArrival(i < 3 ? P_RK : null, null, false, h0); if(a){ a.s = Math.random()*Math.max(0, a.path.len-450); a.seg = 0; flyPlaceOnPath(a); flySnapHeading(a); } }
  for(i=0;i<3;i++) flyStartDeparture(i === 0 ? P_RK : null, null, true, h0);
})();

/* ------------------------------------------------------------------ scheduler + per-frame update */
var flyTimeScale = 1, flyNextArr = 3, flyNextDep = 5, flyFrame = 0, flyFollow = null, flyFollowD = 30, flyCpu = 0;
var flyCnt = { aloft:0, perched:0, ground:0, reserved:0, transient:0, bySp:[0,0,0,0], aloftSp:[0,0,0,0] };
function flyCount(){
  var C = flyCnt; C.aloft = C.perched = C.ground = C.transient = 0; C.bySp[0] = C.bySp[1] = C.bySp[2] = C.bySp[3] = 0; C.aloftSp[0] = C.aloftSp[1] = C.aloftSp[2] = C.aloftSp[3] = 0;
  for(var i=0;i<flyList.length;i++){ var a = flyList[i]; C.bySp[a.sp]++;
    if(a.state === 'fly'){ C.aloft++; C.aloftSp[a.sp]++; if(a.pop === 'transient') C.transient++; } else { C.perched++; if(a.state !== 'perch') C.ground++; } }
}
function flyOcc(){ var n = 0, r = 0; for(var i=0;i<flyBays.length;i++){ var B = flyBays[i]; if(!B.ok) continue; if(B.occ) n++; else if(B.reserved) r++; } flyCnt.reserved = r; return n/Math.max(1, flyUsable); }
function flySchedule(h, hour){
  var night = hour >= 23 || hour < 4.5, act = night ? 0.5 : 1;
  flyNextArr -= h; flyNextDep -= h;
  if(flyNextArr <= 0 || flyNextDep <= 0){
    var occ = flyOcc(), occA = occ + flyCnt.reserved/Math.max(1, flyUsable);
    if(flyNextArr <= 0){
      flyNextArr = (8+Math.random()*7)/act*(occA > 0.60 ? 1.7 : occA < 0.50 ? 0.65 : 1);
      if(occA < 0.69){ if(!flySpawnArrival(null, null, false, hour)) flyNextArr = 1.5; }
    }
    if(flyNextDep <= 0){
      flyNextDep = (8+Math.random()*7)/act*(occ < 0.50 ? 1.7 : occ > 0.60 ? 0.65 : 1);
      if(occ > 0.41){ if(!flyStartDeparture(null, null, false, hour)) flyNextDep = 1.5; }
    }
  }
  if(flyCnt.transient < FLY_TRANSIENTS && Math.random() < h*0.5){ flySpawnTransient(false, hour); flyCnt.transient += 1; }
  while(flyEvents.arr.length && flyEvents.arr[0] < flySimT-600) flyEvents.arr.shift();
  while(flyEvents.dep.length && flyEvents.dep[0] < flySimT-600) flyEvents.dep.shift();
}
function flyAnimate(a, h){
  var S = FLY_SPEC[a.sp];
  if(a.state === 'fly'){
    var rem = a.path.closed ? 1e9 : a.path.len-a.s, tl = Math.hypot(a.tx, a.ty, a.tz) || 1;
    if((a.pop === 'arr' && rem < 160) || a.launchT < 6 || S.on[0] >= 99 || a.ty/tl > 0.07) a.flapOn = true;
    else { a.flapT -= h; if(a.flapT <= 0){ a.flapOn = !a.flapOn; var R = a.flapOn ? S.on : S.off; a.flapT = R[0]+Math.random()*(R[1]-R[0]); } }
    a.amp += ((a.flapOn ? 1 : 0)-a.amp)*Math.min(1, h*2.5);
    a.ph += TAU*S.hz*h*(0.55+0.45*a.amp)*((a.launchT < 2.5 || a.flare > 0.3) ? 1.35 : 1);
  } else {
    a.amp += (0-a.amp)*Math.min(1, h*2); a.ph += TAU*S.hz*h*0.6;
    if(a.state === 'perch' && (a.sp === FLY_A || a.sp === FLY_B)){          /* now and then stretch the wings */
      a.hyT -= h; if(a.hyT <= 0){ a.shuf = 2.6; a.hyT = 25+Math.random()*70; }
      if(a.shuf > 0){ a.shuf -= h; a.fold = 1-0.32*Math.sin(Math.PI*clamp(1-a.shuf/2.6, 0, 1)); if(a.shuf <= 0) a.fold = 1; }
    }
  }
  if(a.ph > 1e4) a.ph -= TAU*1000;
}
function flySim(simDt, hour){
  if(!(simDt > 1e-5)) return;
  var n = Math.min(60, Math.max(1, Math.ceil(simDt/0.1))), h = simDt/n;
  for(var st=0; st<n; st++){
    flySimT += h;
    for(var i=flyList.length-1;i>=0;i--){ var a = flyList[i]; if(!a) continue; flyStep(a, h); if(a.state !== 'gone') flyAnimate(a, h); }
    flyCount(); flySchedule(h, hour);
  }
}
function flyUpdate(dt, hour, nightK){
  var t0 = performance.now();
  flyFrame++;
  flySim(Math.min(dt, 0.1)*flyTimeScale, hour);
  var T = flySimT, i, a, rUsed = false;
  for(i=0;i<flyList.length;i++){ a = flyList[i];
    if(a.ridden || a.riderMode) a.saddled = true;
    if(a.saddled && a.rslot < 0){ a.rslot = flySlotGet(FLY_R, a); if(a.rslot < 0) a.saddled = false; }
    if(a.state === 'perch' && a.shuf <= 0 && a.written && ((flyFrame+a.id)%4)) continue;
    flyWrite(a, T); a.written = true;
  }
  flyWingMesh.count = flyMesh[FLY_D].count;
  for(i=0;i<5;i++){ flyMesh[i].instanceMatrix.needsUpdate = true; flyPoseBuf[i].needsUpdate = true; }
  /* night glints: rider lanterns (<= 30) then bat eyes */
  var n = 0;
  if(nightK > 0.05){
    var RM = flyMesh[FLY_R].instanceMatrix.array, o, lamps = 0;
    for(i=0;i<flyList.length && lamps < 30;i++){ a = flyList[i]; if(a.rslot < 0 || a.state !== 'fly' || !a.ridden) continue;
      o = a.rslot*16; flyGlPos[n*3] = RM[o+12]+RM[o+4]*0.5+RM[o+8]*0.7; flyGlPos[n*3+1] = RM[o+13]+RM[o+5]*0.5+RM[o+9]*0.7; flyGlPos[n*3+2] = RM[o+14]+RM[o+6]*0.5+RM[o+10]*0.7;
      flyGlCol[n*4] = flyLampC.r; flyGlCol[n*4+1] = flyLampC.g; flyGlCol[n*4+2] = flyLampC.b; flyGlCol[n*4+3] = 1.0; n++; lamps++; }
    for(i=0;i<flyList.length && n < FLY_NGL;i++){ a = flyList[i]; if(a.sp !== FLY_B || a.state !== 'fly') continue;
      flyGlPos[n*3] = a.x+Math.sin(a.yaw)*1.3; flyGlPos[n*3+1] = a.y+0.25; flyGlPos[n*3+2] = a.z+Math.cos(a.yaw)*1.3;
      flyGlCol[n*4] = flyEyeC.r; flyGlCol[n*4+1] = flyEyeC.g; flyGlCol[n*4+2] = flyEyeC.b; flyGlCol[n*4+3] = 0.35; n++; }
    flyGlGeo.attributes.position.needsUpdate = true; flyGlGeo.attributes.aCol.needsUpdate = true;
  }
  flyGlints.visible = n > 0; flyGlGeo.setDrawRange(0, Math.max(1, n)); flyGlMat.uniforms.uK.value = nightK; flyNGl = n;
  if(flyFollow){
    a = flyFollow;
    if(a.state === 'gone') flyFollow = null;
    else { var d = flyFollowD, dx, dz;
      if(a.state !== 'fly' && a.bay){ var B = a.bay, fc = Math.cos(flyFollowA-0.3), fs = Math.sin(flyFollowA-0.3); dx = B.ox*fc-B.oz*fs; dz = B.ox*fs+B.oz*fc; }
      else { dx = Math.sin(a.yaw+flyFollowA); dz = Math.cos(a.yaw+flyFollowA); }
      window._dbg.setView(a.x+dx*d, a.y+d*flyFollowUp, a.z+dz*d, a.x, a.y, a.z); }
  }
  flyCpu += (performance.now()-t0-flyCpu)*0.05;
}
var flyNGl = 0, flyFollowA = 0.9, flyFollowUp = 0.22;
TICKS.push(flyUpdate);

/* ------------------------------------------------------------------ inspector, path viz, hooks */
var FLY_STATE_LABEL = { perch:'perched', walk:'just landed', turn:'just landed', flip:'just landed', prep:'being readied', tolip:'walking to the lip', crouch:'about to launch' };
function flyDescribe(a){
  if(!a) return 'Flying beast';
  var s = FLY_LABEL[a.sp];
  if(a.state === 'fly'){
    s += a.ridden ? ' and rider' : ' (wild)';
    s += a.pop === 'arr' ? ' - inbound to ' + a.dest : a.pop === 'dep' ? ' - outbound from ' + a.dest : a.pop === 'circuit' ? ' - ' + a.dest : ' - passing over';
  } else s += ' - ' + (FLY_STATE_LABEL[a.state] || a.state) + ', ' + a.dest;
  return s;
}
for(flyI=0; flyI<4; flyI++) (function(sp){ flyMesh[sp].userData.inspectFn = function(i){ return flyDescribe(flySlotOwner[sp][i]); }; flyMesh[sp].userData.flyers = FLY_KEY[sp]; })(flyI);
flyWingMesh.userData.inspectFn = flyMesh[FLY_D].userData.inspectFn; flyWingMesh.userData.flyers = 'dragonflyWings';
flyMesh[FLY_R].userData.inspectFn = function(i){ var a = flySlotOwner[FLY_R][i]; return a ? (a.riderMode === 0 ? 'Saddle and tack (' : 'Beast-rider (') + FLY_LABEL[a.sp].toLowerCase() + ')' : 'Beast-rider'; };
flyMesh[FLY_R].userData.flyers = 'riders'; flyGlints.userData.flyers = 'glints';

function flyPolyOf(path, stride){
  var out = [], n = path.n; for(var i=0;i<n;i+=stride) out.push([path.p[i*3], path.p[i*3+1], path.p[i*3+2]]);
  if((n-1)%stride) out.push([path.p[(n-1)*3], path.p[(n-1)*3+1], path.p[(n-1)*3+2]]);
  return out;
}
function flyPathsOf(test, stride){ var seen = [], out = []; flyList.forEach(function(a){ if(a.state === 'fly' && a.path && test(a) && seen.indexOf(a.path) < 0){ seen.push(a.path); out.push(flyPolyOf(a.path, stride)); } }); return out; }
PATHVIZ.push({ key:'flyTransients', label:'Flyers: passing over (straight lines)', color:PAL.pathviz[0], paths:function(){ return flyPathsOf(function(a){ return a.pop === 'transient'; }, 1); } });
PATHVIZ.push({ key:'flyArrivals', label:'Flyers: live roost arrivals', color:PAL.pathviz[1], paths:function(){ return flyPathsOf(function(a){ return a.pop === 'arr'; }, 6); } });
PATHVIZ.push({ key:'flyDepartures', label:'Flyers: live roost departures', color:PAL.pathviz[2], paths:function(){
  var out = flyPathsOf(function(a){ return a.pop === 'dep'; }, 6); flyList.forEach(function(a){ if(a.depPath) out.push(flyPolyOf(a.depPath, 6)); }); return out; } });
PATHVIZ.push({ key:'flyCircuits', label:'Flyers: Rookery circuits + city patrols', color:PAL.pathviz[4], paths:function(){ return flyCircuits.map(function(p){ return flyPolyOf(p, 4); }); } });

window._legs = (window._legs || []).concat(flyLegs);

function flyPlatOf(name){ if(!name) return null; if(PIDX[name]) return PIDX[name]; for(var i=0;i<PLATS.length;i++) if(PLATS[i].name.toLowerCase().indexOf(String(name).toLowerCase()) >= 0) return PLATS[i]; return null; }
function flyById(id){ for(var i=0;i<flyList.length;i++) if(flyList[i].id === id) return flyList[i]; return null; }
function flyRate(ev){ var n = 0, w = Math.min(300, Math.max(1, flySimT)); for(var i=0;i<ev.length;i++) if(ev[i] >= flySimT-w) n++; return Math.round(n/(w/60)*100)/100; }
function flyTrisNow(){ var t = 0; for(var i=0;i<5;i++) t += flyMesh[i].count*flyTris[i]; return t + flyWingMesh.count*flyWingTris; }
var flyHooks = {
  list:function(){ return flyList.map(function(a){ return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, x:Math.round(a.x), y:Math.round(a.y), z:Math.round(a.z), dest:a.dest }; }); },
  find:function(state, sp, pop){ var out = []; flyList.forEach(function(a){ if((!state || a.state === state) && (sp === undefined || sp === null || FLY_KEY[a.sp] === sp || a.sp === sp) && (!pop || a.pop === pop)) out.push(a.id); }); return out; },
  info:function(id){ var a = flyById(id); if(!a) return null; return { id:a.id, sp:FLY_KEY[a.sp], state:a.state, pop:a.pop, ridden:a.ridden, riderMode:a.riderMode, x:a.x, y:a.y, z:a.z, yaw:a.yaw, pitch:a.pitch, roll:a.roll, yawRate:a.yawRate, v:a.v,
    fold:a.fold, flare:a.flare, amp:a.amp, rem:a.path && a.state === 'fly' ? a.path.len-a.s : null, bayY:a.bay ? a.bay.y : null, bayH:a.bay ? a.bay.H : null, dest:a.dest, label:flyDescribe(a) }; },
  forceArrival:function(platName, sp){ var a = flySpawnArrival(flyPlatOf(platName), sp === undefined ? null : (typeof sp === 'string' ? FLY_KEY.indexOf(sp) : sp), true, skyHour()); return a ? a.id : null; },
  forceDeparture:function(platName, sp){ var a = flyStartDeparture(flyPlatOf(platName), sp === undefined ? null : (typeof sp === 'string' ? FLY_KEY.indexOf(sp) : sp), true, skyHour()); return a ? a.id : null; },
  focus:function(id, dist, ang, up){ var a = typeof id === 'number' ? (flyById(id) || flyList[id]) : null; flyFollow = a || null; flyFollowD = dist || 30; flyFollowA = ang === undefined ? 0.9 : ang; flyFollowUp = up === undefined ? 0.22 : up; return a ? flyDescribe(a) : null; },
  skip:function(sec){ var h = skyHour(), n = Math.ceil(sec/2); for(var i=0;i<n;i++) flySim(sec/n, h); return flySimT; },
  routeTest:function(n, arr){ var out = []; for(var i=0;i<flyBays.length && out.length<n;i+=7){ var B = flyBays[i]; if(!B.ok) continue; flyLastHit = null; var p = flyRoute(B, FLY_A, !!arr, 1, true); out.push(p ? 'ok' : flyLastHit); } return out; },
  foliageObstacles:flyPathStatsFol, pathStats:flyPathStats, totals:flyTotals, bays:flyBays.length, modelTris:flyTris.concat([flyWingTris]), drawCalls:7, circuits:flyCircuits.length
};
Object.defineProperties(flyHooks, {
  timeScale:{ get:function(){ return flyTimeScale; }, set:function(v){ flyTimeScale = Math.max(0, +v || 0); }, enumerable:true },
  aloft:{ get:function(){ flyCount(); return flyCnt.aloft; }, enumerable:true },
  perched:{ get:function(){ flyCount(); return flyCnt.perched; }, enumerable:true },
  occupancy:{ get:function(){ return Math.round(flyOcc()*1000)/1000; }, enumerable:true },
  usableBays:{ get:function(){ return flyUsable; }, enumerable:true },
  arrivalsPerMin:{ get:function(){ return flyRate(flyEvents.arr); }, enumerable:true },
  departuresPerMin:{ get:function(){ return flyRate(flyEvents.dep); }, enumerable:true },
  bySpecies:{ get:function(){ flyCount(); var o = {}; for(var i=0;i<4;i++) o[FLY_KEY[i]] = { total:flyCnt.bySp[i], aloft:flyCnt.aloftSp[i] }; return o; }, enumerable:true },
  riders:{ get:function(){ var n = 0; for(var i=0;i<FLY_RCAP;i++) n += flyUsed[FLY_R][i]; return n; }, enumerable:true },
  glints:{ get:function(){ return flyNGl; }, enumerable:true },
  tris:{ get:flyTrisNow, enumerable:true },
  cpuMs:{ get:function(){ return Math.round(flyCpu*100)/100; }, enumerable:true },
  simT:{ get:function(){ return Math.round(flySimT); }, enumerable:true }
});
window._flyers = flyHooks;

})();
