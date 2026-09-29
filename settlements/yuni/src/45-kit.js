/* ============================== 10. KIT ==============================
   Two ways to make geometry, both bucketed by material FAMILY so the whole
   city folds into a handful of draw calls:

   A. INSTANCED PRIMITIVES (boxes, cylinders, cones...). One InstancedMesh per
      (shape, family).  BOX(x,y,z, w,h,d, rot, colour, family)
        - y is the BASE, not the centre.
        - rot is a number (yaw about +y, Voth convention) OR [rx,ry,rz]
          (Euler 'YXZ': yaw, then pitch, then roll) for sloped things.
      BEAM(ax,ay,az, bx,by,bz, w,d, colour, family) spans two points.

   B. MERGED CUSTOM MESHES (the MB builder): annular-sector prisms, sector
      roofs, tubes, free quads — everything a round timber city needs that a
      scaled box cannot be. One Mesh per family, vertex-coloured, UVs already
      in world units.

   NEVER `new THREE.Mesh` for static fabric. A new family is a new draw call
   (two if used by both A and B) and needs the planner's approval.         */
reseed(450001);

/* ------------------------------------------------------------------ A. instanced */
var BUCKET = {}, KIT_EMITTED = false, KIT_LATE = 0;
function push(shape, fam, rec){
  if(KIT_EMITTED){ if(!KIT_LATE++) ERR('kit: '+shape+'|'+fam+' pushed AFTER the kit was emitted (75-terrain.js) - it will never render. Static fabric belongs in a fragment < 75.'); return; }
  var k = shape+'|'+fam;
  (BUCKET[k] || (BUCKET[k] = { shape:shape, fam:fam, list:[] })).list.push(rec);
}
function BOX (x,y,z,w,h,d,rot,c,f){ push('box',  f||'timber',[x,y,z,w,h,d,rot||0,c]); }
function FR8 (x,y,z,w,h,d,rot,c,f){ push('fr8',  f||'timber',[x,y,z,w,h,d,rot||0,c]); }   /* gentle batter */
function FR5 (x,y,z,w,h,d,rot,c,f){ push('fr5',  f||'timber',[x,y,z,w,h,d,rot||0,c]); }   /* strong taper */
function PYR (x,y,z,w,h,d,rot,c,f){ push('pyr',  f||'thatch',[x,y,z,w,h,d,rot||0,c]); }   /* 4-sided pyramid roof */
function CYL (x,y,z,r,h,rot,c,f)  { push('cyl',  f||'timber',[x,y,z,r,h,r,rot||0,c]); }
function CONE(x,y,z,r,h,rot,c,f)  { push('cone', f||'thatch',[x,y,z,r,h,r,rot||0,c]); }
function DOME(x,y,z,r,h,rot,c,f)  { push('dome', f||'thatch',[x,y,z,r,h,r,rot||0,c]); }
function BLOB(x,y,z,r,h,rot,c,f)  { push('blob', f||'leafy', [x,y,z,r,h,r,rot||0,c]); }
function BALL(x,y,z,r,c,f)        { push('ball', f||'leafy', [x,y-r,z,r,r,r,0,c]); }        /* full sphere centred at y */
/* a box (w wide, d deep) running from point a to point b */
var _bq = new THREE.Quaternion(), _bm = new THREE.Matrix4();
var _bX = new THREE.Vector3(), _bY = new THREE.Vector3(), _bZ = new THREE.Vector3(), _bup = new THREE.Vector3(0,1,0);
/* orientation with local +y along a->b and NO roll: local x stays horizontal
   (so `w` is the horizontal thickness and `d` the thickness in the vertical plane) */
function beamQuat(ax,ay,az,bx,by,bz){
  _bY.set(bx-ax,by-ay,bz-az).normalize();
  _bX.crossVectors(_bup,_bY); if(_bX.lengthSq() < 1e-8) _bX.set(1,0,0); _bX.normalize();
  _bZ.crossVectors(_bX,_bY);
  _bm.makeBasis(_bX,_bY,_bZ); _bq.setFromRotationMatrix(_bm);
  return {q:[_bq.x,_bq.y,_bq.z,_bq.w]};
}
function BEAM(ax,ay,az,bx,by,bz,w,d,c,f){
  var L = Math.hypot(bx-ax,by-ay,bz-az); if(L < 1e-4) return;
  push('box', f||'timber', [ax,ay,az,w,L,d,beamQuat(ax,ay,az,bx,by,bz),c]);
}
function ROD(ax,ay,az,bx,by,bz,r,c,f){               /* round version: ropes, poles, spars */
  var L = Math.hypot(bx-ax,by-ay,bz-az); if(L < 1e-4) return;
  push('cyl6', f||'rope', [ax,ay,az,r,L,r,beamQuat(ax,ay,az,bx,by,bz),c]);
}

function rectFrus(tx,tz){
  var b=0.5, X=tx*0.5, Z=tz*0.5;
  var v=[[-b,0,-b],[b,0,-b],[b,0,b],[-b,0,b],[-X,1,-Z],[X,1,-Z],[X,1,Z],[-X,1,Z]];
  var faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
  var uvOf=[function(p){return [p[0]+0.5,p[1]];},function(p){return [p[2]+0.5,p[1]];},
            function(p){return [p[0]+0.5,p[1]];},function(p){return [p[2]+0.5,p[1]];},
            function(p){return [p[0]+0.5,p[2]+0.5];},function(p){return [p[0]+0.5,p[2]+0.5];}];
  var pos=[],uv=[];
  faces.forEach(function(f,i){
    [[0,2,1],[0,3,2]].forEach(function(t){ t.forEach(function(k){
      pos.push(v[f[k]][0],v[f[k]][1],v[f[k]][2]);
      var q=uvOf[i](v[f[k]]); uv.push(q[0],q[1]);
    });});
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  g.computeVertexNormals();
  return g;
}
var SHAPES = {
  box : function(){ return new THREE.BoxGeometry(1,1,1).translate(0,0.5,0); },
  fr8 : function(){ return rectFrus(0.84,0.84); },
  fr5 : function(){ return rectFrus(0.50,0.50); },
  pyr : function(){ return rectFrus(0.02,0.02); },
  cyl : function(){ return new THREE.CylinderGeometry(1,1,1,10).translate(0,0.5,0); },
  cyl6: function(){ return new THREE.CylinderGeometry(1,1,1,5,1,true).translate(0,0.5,0); },
  cone: function(){ return new THREE.ConeGeometry(1,1,10).translate(0,0.5,0); },
  dome: function(){ return new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI*0.5); },
  blob: function(){ return new THREE.SphereGeometry(1,7,4,0,Math.PI*2,0,Math.PI*0.5); },
  ball: function(){ return new THREE.SphereGeometry(1,7,5).translate(0,1,0); }
};

/* world-unit texture tiling for instanced primitives (see Voth 45-kit.js) */
function applyWorldUV(sh, sc){
  var su = sc[0].toFixed(2), sv = sc[1].toFixed(2);
  sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>',
    '#include <uv_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  vec3 _isc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));\n' +
    '  float _ay = step(0.5, abs(normal.y));\n' +
    '  float _ax = step(0.5, abs(normal.x));\n' +
    '  float _u = mix(mix(_isc.x, _isc.z, _ax), _isc.x, _ay);\n' +
    '  float _v = mix(_isc.y, _isc.z, _ay);\n' +
    '  vec2 _uoff = fract(sin(vec2(dot(instanceMatrix[3].xz, vec2(12.9898,78.233)),\n' +
    '                              dot(instanceMatrix[3].xz, vec2(39.3468,11.1352)))) * vec2(43758.5453, 24634.6345));\n' +
    '  vUv = uv * vec2(_u / ' + su + ', _v / ' + sv + ') + _uoff;\n' +
    '#endif\n');
}
/* wind sway for the 'cloth' family: local y=1 is the hung edge, y=0 swings */
var CLOTH_TIME = { value: 0 };
function applyClothSway(sh){
  sh.uniforms.uWindTime = CLOTH_TIME;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWindTime;');
  sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n' +
    '#ifdef USE_INSTANCING\n' +
    '  float _swayPhase = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898,78.233))) * 43758.5453) * 6.28318;\n' +
    '  float _swayAmt = (1.0 - position.y) * (1.0 - position.y);\n' +
    '  float _sway = sin(uWindTime * 1.6 + _swayPhase) * 0.16 + sin(uWindTime * 2.7 + _swayPhase * 1.3) * 0.07;\n' +
    '  transformed.x += _sway * _swayAmt;\n' +
    '  transformed.z += _sway * _swayAmt;\n' +
    '#endif\n');
}

/* ============================== NIGHT LIGHT VOLUME ==============================
   Voth bakes every lamp into a 2-D world-XZ light map with one height channel.
   That cannot work here: this city is STACKED — a deck, three galleries and a
   roost level share the same XZ. So the light field is a VOLUME: NLV_NS
   horizontal slabs of NLV_RES^2 texels packed into one atlas texture, sampled
   with two fetches and a lerp (manual trilinear). Every material in the
   build — kit, merged meshes, terrain, bark, foliage — calls applyNightGlow(),
   so lamp light pools on decks, climbs trunks and lights the leaves above.

   Channels: R = warm flames   G = window spill   B = cool (bioluminescent) lamps
   Cost: zero draw calls, two texture fetches per fragment, ~10 MB of texture. */
var NLV_RES = 256, NLV_EXT = CATALOG ? 320 : SHEET ? 1700 : 1100, NLV_NS = 40, NLV_COLS = 8, NLV_ROWS = 5;
var NLV_Y0 = -40, NLV_DY = 8;
var NLV_MAX = 3.0;                    /* byte 255 == this much summed intensity: also the blow-out ceiling */
var NLV_LAMP_GAIN = 0.55, NLV_WIN_GAIN = 0.30, NLV_COOL_GAIN = 0.50;
var NLV_WIN_AMP = 0.5, NLV_WIN_RAD = 11;
var NL_LAMPS = [];                    /* [x,y,z, amp, radius, cool(0|1)] — every static flame */
var NL_WINDOWS = [];                  /* [x,y,z, nx,nz, w,h, hOn, hOff, allNight, cool] */
function nlLampAdd(x,y,z,amp,rad,cool){ NL_LAMPS.push([x,y,z, amp==null?1:amp, rad==null?16:rad, cool?1:0]); }
/* a lit window pane: centre, outward horizontal normal, size. Registered by
   WINPANE (below) — every window in the build goes through it. */
function nlWinAdd(x,y,z,nx,nz,w,h,cool){
  NL_WINDOWS.push([x,y,z,nx,nz,w,h, phash(x,y,z,1.7), phash(x,y,z,5.3), phash(x,y,z,11.9) < 0.05, cool?1:0]);
}
function WINPANE(x,y,z,nx,nz,w,h,cool){ nlWinAdd(x,y,z,nx,nz,w,h,cool); }

var nlvTex = new THREE.DataTexture(new Uint8Array(NLV_RES*NLV_COLS*NLV_RES*NLV_ROWS*4),
                                   NLV_RES*NLV_COLS, NLV_RES*NLV_ROWS, THREE.RGBAFormat);
nlvTex.minFilter = nlvTex.magFilter = THREE.LinearFilter;
nlvTex.wrapS = nlvTex.wrapT = THREE.ClampToEdgeWrapping;
nlvTex.generateMipmaps = false; nlvTex.flipY = false; nlvTex.needsUpdate = true;
var NLV_U = { uNlMap:{ value:nlvTex }, uNlNight:{ value:0 }, uNlWin:{ value:0 } };

function nlvBake(){
  var N = NLV_RES, S = N/(2*NLV_EXT), AW = N*NLV_COLS;
  var acc = [new Float32Array(N*N*NLV_NS), new Float32Array(N*N*NLV_NS), new Float32Array(N*N*NLV_NS)];
  function splat(ch, x,y,z, amp, rad){
    var cx=(x+NLV_EXT)*S, cz=(z+NLV_EXT)*S, pr=Math.max(1.3, rad*S), pr2=pr*pr;
    var i0=Math.max(0,Math.floor(cx-pr)), i1=Math.min(N-1,Math.ceil(cx+pr));
    var j0=Math.max(0,Math.floor(cz-pr)), j1=Math.min(N-1,Math.ceil(cz+pr));
    var f=(y-NLV_Y0)/NLV_DY, s0=Math.floor(f), fr=f-s0, A=acc[ch];
    for(var ds=0; ds<2; ds++){
      var sl=s0+ds, wv = ds ? fr : 1-fr; if(sl<0||sl>=NLV_NS||wv<=0) continue;
      var base=sl*N*N;
      for(var j=j0;j<=j1;j++){ var dz=(j+0.5)-cz;
        for(var i=i0;i<=i1;i++){ var dx=(i+0.5)-cx, d2=dx*dx+dz*dz; if(d2>=pr2) continue;
          var t=1-d2/pr2; A[base+j*N+i] += amp*wv*t*t; } }
    }
  }
  NL_LAMPS.forEach(function(L){ splat(L[5]?2:0, L[0],L[1],L[2], L[3], L[4]); });
  NL_WINDOWS.forEach(function(W){ splat(1, W[0]+W[3]*2.5, W[1]-0.6, W[2]+W[4]*2.5, NLV_WIN_AMP, NLV_WIN_RAD); });
  var d = nlvTex.image.data, peak=[0,0,0];
  for(var sl=0; sl<NLV_NS; sl++){
    var tc = sl % NLV_COLS, tr = Math.floor(sl/NLV_COLS);
    for(var j=0;j<N;j++) for(var i=0;i<N;i++){
      var o = ((tr*N + j)*AW + tc*N + i)*4, k = sl*N*N + j*N + i;
      for(var ch=0; ch<3; ch++){ var v=acc[ch][k]; if(v>peak[ch]) peak[ch]=v; d[o+ch] = v>0 ? Math.min(255, Math.round(v/NLV_MAX*255)) : 0; }
      d[o+3] = 255;
    }
  }
  nlvTex.needsUpdate = true;
  return { lamps:NL_LAMPS.length, windows:NL_WINDOWS.length, peak:peak.map(function(v){ return +v.toFixed(2); }) };
}
/* Shader hook. Lambert in r128 is Gouraud, but the BRDF multiply happens in
   the fragment shader; `#include <aomap_fragment>` is the last line before
   outgoingLight is assembled, so the pool term carries its own diffuseColor.
   wpName lets a material that already has a world-position varying share it. */
function applyNightGlow(sh, wpName){
  var wp = wpName || 'vNlWP';
  sh.uniforms.uNlMap = NLV_U.uNlMap; sh.uniforms.uNlNight = NLV_U.uNlNight; sh.uniforms.uNlWin = NLV_U.uNlWin;
  if(!wpName){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;')
      .replace('#include <project_vertex>',
        '#ifdef USE_INSTANCING\n  vNlWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n' +
        '#else\n  vNlWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n#endif\n#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;');
  }
  var C = PAL.flame, T = (NLV_RES).toFixed(1);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform sampler2D uNlMap;\nuniform float uNlNight;\nuniform float uNlWin;')
    .replace('#include <aomap_fragment>', [
      'if(uNlNight > 0.002){',
      '  vec2 _nuv = (' + wp + '.xz + ' + NLV_EXT.toFixed(1) + ') / ' + (2*NLV_EXT).toFixed(1) + ';',
      '  if(_nuv.x > 0.0 && _nuv.x < 1.0 && _nuv.y > 0.0 && _nuv.y < 1.0){',
      '    float _f = clamp((' + wp + '.y - (' + NLV_Y0.toFixed(1) + ')) / ' + NLV_DY.toFixed(1) + ', 0.0, ' + (NLV_NS-1.001).toFixed(3) + ');',
      '    float _s0 = floor(_f), _fr = _f - _s0, _s1 = _s0 + 1.0;',
      '    vec2 _t = clamp(_nuv, 0.5/' + T + ', 1.0 - 0.5/' + T + ');',
      '    vec2 _g = vec2(' + NLV_COLS.toFixed(1) + ', ' + NLV_ROWS.toFixed(1) + ');',
      '    vec3 _a = texture2D(uNlMap, (vec2(mod(_s0,_g.x), floor(_s0/_g.x)) + _t)/_g).rgb;',
      '    vec3 _b = texture2D(uNlMap, (vec2(mod(_s1,_g.x), floor(_s1/_g.x)) + _t)/_g).rgb;',
      '    vec3 _p = mix(_a,_b,_fr) * ' + NLV_MAX.toFixed(2) + ';',
      '    vec3 _warm = vec3(' + C.warm.map(function(v){return v.toFixed(3);}).join(',') + ');',
      '    vec3 _cool = vec3(' + C.cool.map(function(v){return v.toFixed(3);}).join(',') + ');',
      '    reflectedLight.indirectDiffuse += (_warm*(_p.r*' + NLV_LAMP_GAIN.toFixed(3) + ' + _p.g*uNlWin*' + NLV_WIN_GAIN.toFixed(3) + ')',
      '       + _cool*_p.b*' + NLV_COOL_GAIN.toFixed(3) + ') * uNlNight * diffuseColor.rgb;',
      '  }',
      '}',
      '#include <aomap_fragment>'
    ].join('\n'));
}
/* one call for any material a later fragment creates itself (bark, foliage,
   terrain, creatures): adds the night-glow hook and a cache key. */
function nlMaterial(mat, key, extraHook, wpName){
  mat.onBeforeCompile = function(sh){ if(extraHook) extraHook(sh); applyNightGlow(sh, wpName); };
  mat.customProgramCacheKey = function(){ return 'nlv|'+(key||''); };
  return mat;
}

var _dm = new THREE.Object3D(), _col = new THREE.Color();
function emitBuckets(){
  var total=0, meshes=0;
  for(var k in BUCKET){
    var B = BUCKET[k];
    if(!B.list.length) continue;
    var geo = SHAPES[B.shape]();
    var fm  = FAMMAT[B.fam] || {};
    var mat = fm.basic ? new THREE.MeshBasicMaterial({ color:0xffffff })
            : new THREE.MeshLambertMaterial({ color:0xffffff, map: fm.tex || null,
                  transparent:false, alphaTest: fm.alpha ? 0.35 : 0, side: (fm.alpha || B.shape==='cyl6') ? THREE.DoubleSide : THREE.FrontSide });
    mat.userData.fam = B.fam;
    if(!fm.basic){
      (function(needsUV, needsSway, sc){
        mat.onBeforeCompile = function(sh){ if(needsUV) applyWorldUV(sh, sc); if(needsSway) applyClothSway(sh); applyNightGlow(sh); };
        mat.customProgramCacheKey = function(){ return (needsUV ? 'wuv'+sc[0].toFixed(2)+'_'+sc[1].toFixed(2) : '') + (needsSway?'|sway':'') + '|nlv'; };
      })(!!fm.tex, B.fam==='cloth', fm.scale || [3,3]);
    }
    var im = new THREE.InstancedMesh(geo, mat, B.list.length);
    im.userData.shape = B.shape; im.userData.fam = B.fam; im.userData.kit = true;
    im.castShadow = !FAST && !fm.basic; im.receiveShadow = !FAST && !fm.basic;
    for(var i=0;i<B.list.length;i++){
      var r = B.list[i], rot = r[6];
      _dm.position.set(r[0],r[1],r[2]);
      _dm.scale.set(r[3],r[4],r[5]);
      if(typeof rot === 'number') _dm.rotation.set(0,rot,0,'YXZ');
      else if(rot.q) _dm.quaternion.set(rot.q[0],rot.q[1],rot.q[2],rot.q[3]);
      else _dm.rotation.set(rot[0],rot[1],rot[2],'YXZ');
      _dm.updateMatrix();
      im.setMatrixAt(i,_dm.matrix);
      im.setColorAt(i,_col.set(r[7]).convertSRGBToLinear());
    }
    if(im.instanceColor) im.instanceColor.needsUpdate = true;
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    scene.add(im);
    total += B.list.length; meshes++;
  }
  return { instances:total, meshes:meshes };
}

function shade(hex, f){
  var c = new THREE.Color(hex);
  if(f>=0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x120f0a), -f);
  return c.getHex();
}

/* ------------------------------------------------------------------ B. merged meshes */
var MBK = {};                         /* family -> { pos:[], nor:[], uv:[], col:[] } */
function mbGet(fam){ if(KIT_EMITTED){ if(!KIT_LATE++) ERR('kit: merged family '+fam+' written AFTER emit - it will never render.'); return { pos:[], nor:[], uv:[], col:[], tris:0 }; } return MBK[fam] || (MBK[fam] = { pos:[], nor:[], uv:[], col:[], tris:0 }); }
var _mbc = new THREE.Color();
function mbCol(hex){ _mbc.set(hex).convertSRGBToLinear(); return [_mbc.r,_mbc.g,_mbc.b]; }
/* one triangle, flat-shaded, CCW seen from outside. UVs are a planar
   projection in world units chosen from the face normal. */
function MTRI(fam, a,b,c, col, smoothN){
  var K = mbGet(fam), sc = (FAMMAT[fam]||{}).scale || [3,3];
  var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, nl=Math.hypot(nx,ny,nz)||1; nx/=nl; ny/=nl; nz/=nl;
  var cc = (typeof col === 'number') ? mbCol(col) : col;
  var P = [a,b,c];
  for(var i=0;i<3;i++){
    var p=P[i]; K.pos.push(p[0],p[1],p[2]);
    if(smoothN){ K.nor.push(smoothN[i][0],smoothN[i][1],smoothN[i][2]); } else K.nor.push(nx,ny,nz);
    if(Math.abs(ny) > 0.72) K.uv.push(p[0]/sc[0], p[2]/sc[1]);
    else { var hl=Math.hypot(nx,nz)||1; K.uv.push((p[0]*(-nz/hl) + p[2]*(nx/hl))/sc[0], p[1]/sc[1]); }
    K.col.push(cc[0],cc[1],cc[2]);
  }
  K.tris++;
}
function MQUAD(fam, a,b,c,d, col){ MTRI(fam,a,b,c,col); MTRI(fam,a,c,d,col); }   /* a,b,c,d CCW from outside */

/* Annular-sector prism in a platform's polar frame: radius r0..r1, angle
   a0..a1 (a1 > a0), height yb..yt. opt.faces: string of t(op) b(ottom)
   i(nner) o(uter) s(ides); default all. opt.step: max arc step in metres.
   P is any object with {x,z,ry,sx,sz,shape} — a platform, or platFrame(). */
function platFrame(x,z,ry){ return { x:x, z:z, ry:ry||0, sx:1, sz:1, shape:'round' }; }
function SECTOR(fam, P, r0,r1, a0,a1, yb,yt, col, opt){
  opt = opt||{};
  var faces = opt.faces || 'tbios', full = (a1-a0) >= TAU-1e-4;
  var n = Math.max(1, Math.ceil((a1-a0)*Math.max(r1,1)/(opt.step||4.5)));
  if(full) n = Math.max(n, 16);
  var cc = mbCol(col), ci = opt.colInner!=null ? mbCol(opt.colInner) : cc, ct = opt.colTop!=null ? mbCol(opt.colTop) : cc;
  for(var i=0;i<n;i++){
    var A=a0+(a1-a0)*i/n, B=a0+(a1-a0)*(i+1)/n;
    var iA=platXZ(P,r0,A), iB=platXZ(P,r0,B), oA=platXZ(P,r1,A), oB=platXZ(P,r1,B);
    if(faces.indexOf('t')>=0) MQUAD(fam,[iA[0],yt,iA[1]],[iB[0],yt,iB[1]],[oB[0],yt,oB[1]],[oA[0],yt,oA[1]],ct);
    if(faces.indexOf('b')>=0) MQUAD(fam,[iA[0],yb,iA[1]],[oA[0],yb,oA[1]],[oB[0],yb,oB[1]],[iB[0],yb,iB[1]],cc);
    if(faces.indexOf('o')>=0) MQUAD(fam,[oA[0],yb,oA[1]],[oA[0],yt,oA[1]],[oB[0],yt,oB[1]],[oB[0],yb,oB[1]],cc);
    if(faces.indexOf('i')>=0 && r0>0.01) MQUAD(fam,[iA[0],yb,iA[1]],[iB[0],yb,iB[1]],[iB[0],yt,iB[1]],[iA[0],yt,iA[1]],ci);
  }
  if(faces.indexOf('s')>=0 && !full){
    var s0i=platXZ(P,r0,a0), s0o=platXZ(P,r1,a0), s1i=platXZ(P,r0,a1), s1o=platXZ(P,r1,a1);
    MQUAD(fam,[s0i[0],yb,s0i[1]],[s0i[0],yt,s0i[1]],[s0o[0],yt,s0o[1]],[s0o[0],yb,s0o[1]],cc);
    MQUAD(fam,[s1i[0],yb,s1i[1]],[s1o[0],yb,s1o[1]],[s1o[0],yt,s1o[1]],[s1i[0],yt,s1i[1]],cc);
  }
}
/* annulus r0..r1 with rectangular (polar) holes: holes = [{a0,a1,r0,r1}], disjoint in angle */
function RING_HOLES(fam, P, r0,r1, yb,yt, col, holes, opt){
  holes = (holes||[]).map(function(h){ var a=wrapPi(h.a0); return { a0:a, a1:a+(h.a1-h.a0), r0:h.r0, r1:h.r1 }; })
                     .sort(function(p,q){ return p.a0-q.a0; });
  if(!holes.length){ SECTOR(fam,P,r0,r1,0,TAU,yb,yt,col,opt); return; }
  var o2 = {}; for(var k in (opt||{})) o2[k]=opt[k];
  for(var i=0;i<holes.length;i++){
    var h=holes[i], nx=holes[(i+1)%holes.length], end = i===holes.length-1 ? nx.a0+TAU : nx.a0;
    o2.faces = 'tbios';
    if(end > h.a1) SECTOR(fam,P,r0,r1,h.a1,end,yb,yt,col,o2);
    o2.faces = 'tbio';
    if(h.r0 > r0+0.01) SECTOR(fam,P,r0,h.r0,h.a0,h.a1,yb,yt,col,o2);
    if(h.r1 < r1-0.01) SECTOR(fam,P,h.r1,r1,h.a0,h.a1,yb,yt,col,o2);
  }
}
/* Hipped roof over a sector footprint (with overhang). Ridge runs along the
   mid-radius arc. h = ridge height above yb; opt.over = eave overhang;
   opt.ridge = 0..1 fraction of the arc the ridge spans (0 = pyramid point). */
function SECTOR_ROOF(fam, P, r0,r1, a0,a1, yb,h, col, opt){
  opt = opt||{};
  var ov = opt.over==null ? 0.8 : opt.over, rm=(r0+r1)/2, rg = opt.ridge==null ? 0.6 : opt.ridge;
  var R0=Math.max(0.05,r0-ov), R1=r1+ov, A0=a0-ov/rm, A1=a1+ov/rm, am=(A0+A1)/2, ha=(A1-A0)/2*rg;
  var n = Math.max(2, Math.ceil((A1-A0)*R1/4)), yt=yb+h, cc=mbCol(col), c2=mbCol(shade(col,-0.10));
  function P3(r,a,y){ var p=platXZ(P,r,a); return [p[0],y,p[1]]; }
  for(var i=0;i<n;i++){
    var A=A0+(A1-A0)*i/n, B=A0+(A1-A0)*(i+1)/n;
    var rA=clamp(A,am-ha,am+ha), rB=clamp(B,am-ha,am+ha);
    /* outer slope and inner slope */
    MQUAD(fam, P3(R1,A,yb), P3(rm,rA,yt), P3(rm,rB,yt), P3(R1,B,yb), cc);
    MQUAD(fam, P3(R0,A,yb), P3(R0,B,yb), P3(rm,rB,yt), P3(rm,rA,yt), c2);
  }
  /* the two hip ends */
  MTRI(fam, P3(R0,A0,yb), P3(rm,am-ha,yt), P3(R1,A0,yb), c2);
  MTRI(fam, P3(R0,A1,yb), P3(R1,A1,yb), P3(rm,am+ha,yt), c2);
  /* soffit so it is not see-through from below */
  if(!opt.noSoffit) SECTOR(fam,P,R0,R1,A0,A1,yb-0.05,yb,shade(col,-0.35),{faces:'b'});
}
/* cone / polygonal roof or frustum about a vertical axis (round huts, canopies, the council roof tiers) */
function MCONE(fam, x,yb,z, rb, rt, h, col, seg, opt){
  opt=opt||{}; seg=seg||16; var cc=mbCol(col), c2=mbCol(shade(col,-0.10));
  for(var i=0;i<seg;i++){
    var A=i/seg*TAU, B=(i+1)/seg*TAU;
    var a=[x+Math.cos(A)*rb,yb,z+Math.sin(A)*rb], b=[x+Math.cos(B)*rb,yb,z+Math.sin(B)*rb];
    var c=[x+Math.cos(B)*rt,yb+h,z+Math.sin(B)*rt], d=[x+Math.cos(A)*rt,yb+h,z+Math.sin(A)*rt];
    if(rt > 0.01) MQUAD(fam, a,d,c,b, (i%2)?cc:c2); else MTRI(fam, a,[x,yb+h,z],b, (i%2)?cc:c2);
    if(opt.under) MTRI(fam, a,b,[x,yb+(opt.underDy||0),z], mbCol(shade(col,-0.4)));
  }
}
/* generalised cylinder along a polyline. pts = [{x,y,z,r}], smooth-shaded.
   opt.seg radial segments, opt.cap end caps, opt.rfn(i,ang) radius multiplier
   (buttresses, burls), opt.vscale overrides texture v tiling. */
function TUBE(fam, pts, col, opt){
  opt = opt||{}; var seg = opt.seg||8, K = mbGet(fam), sc=(FAMMAT[fam]||{}).scale||[3,3];
  var cc = mbCol(col), n=pts.length; if(n<2) return;
  var T=[], N=[], Bn=[];
  for(var i=0;i<n;i++){
    var a=pts[Math.max(0,i-1)], b=pts[Math.min(n-1,i+1)], t=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z).normalize(); T.push(t);
  }
  var ref = Math.abs(T[0].y) > 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
  N[0] = new THREE.Vector3().crossVectors(T[0], ref).normalize(); Bn[0] = new THREE.Vector3().crossVectors(T[0], N[0]).normalize();
  for(var j=1;j<n;j++){
    var nn = N[j-1].clone().sub(T[j].clone().multiplyScalar(N[j-1].dot(T[j]))).normalize();
    N[j]=nn; Bn[j]=new THREE.Vector3().crossVectors(T[j], nn).normalize();
  }
  var rings=[], vAcc=0;
  for(var q=0;q<n;q++){
    if(q>0) vAcc += Math.hypot(pts[q].x-pts[q-1].x, pts[q].y-pts[q-1].y, pts[q].z-pts[q-1].z);
    var ring=[];
    for(var s=0;s<=seg;s++){
      var ang=s/seg*TAU, rad = pts[q].r * (opt.rfn ? opt.rfn(q, ang, pts[q]) : 1);
      var cx=Math.cos(ang), sx=Math.sin(ang);
      var nx=N[q].x*cx+Bn[q].x*sx, ny=N[q].y*cx+Bn[q].y*sx, nz=N[q].z*cx+Bn[q].z*sx;
      ring.push({ p:[pts[q].x+nx*rad, pts[q].y+ny*rad, pts[q].z+nz*rad], n:[nx,ny,nz],
                  uv:[ (s/seg)*Math.max(1,Math.round(TAU*pts[q].r/sc[0])), vAcc/(opt.vscale||sc[1]) ] });
    }
    rings.push(ring);
  }
  function pv(v, c){ K.pos.push(v.p[0],v.p[1],v.p[2]); K.nor.push(v.n[0],v.n[1],v.n[2]); K.uv.push(v.uv[0],v.uv[1]); K.col.push(c[0],c[1],c[2]); }
  for(var r2=0;r2<n-1;r2++){
    var c0 = pts[r2].col!=null ? mbCol(pts[r2].col) : cc, c1 = pts[r2+1].col!=null ? mbCol(pts[r2+1].col) : cc;
    for(var s2=0;s2<seg;s2++){
      var a0=rings[r2][s2], a1=rings[r2][s2+1], b0=rings[r2+1][s2], b1=rings[r2+1][s2+1];
      pv(a0,c0); pv(b1,c1); pv(b0,c1);  pv(a0,c0); pv(a1,c0); pv(b1,c1); K.tris+=2;
    }
  }
  if(opt.cap){
    [[0,-1],[n-1,1]].forEach(function(e){
      var ri=rings[e[0]], ctr=[pts[e[0]].x,pts[e[0]].y,pts[e[0]].z];
      for(var s3=0;s3<seg;s3++){ if(e[1]>0) MTRI(fam,ctr,ri[s3].p,ri[s3+1].p,opt.capCol!=null?opt.capCol:col); else MTRI(fam,ctr,ri[s3+1].p,ri[s3].p,opt.capCol!=null?opt.capCol:col); }
    });
  }
}
var MB_MESHES = {};
function emitMerged(){
  var tris=0, meshes=0;
  for(var fam in MBK){
    var K = MBK[fam]; if(!K.pos.length) continue;
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(K.pos,3));
    g.setAttribute('normal',   new THREE.Float32BufferAttribute(K.nor,3));
    g.setAttribute('uv',       new THREE.Float32BufferAttribute(K.uv,2));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(K.col,3));
    g.computeBoundingSphere();
    var fm = FAMMAT[fam] || {};
    var mat = fm.basic ? new THREE.MeshBasicMaterial({ color:0xffffff, vertexColors:true })
            : new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, map:fm.tex||null,
                  alphaTest: fm.alpha?0.35:0, side: fm.alpha ? THREE.DoubleSide : THREE.FrontSide });
    if(!fm.basic) nlMaterial(mat, 'mb'+fam);
    var m = new THREE.Mesh(g, mat);
    m.userData.fam = fam; m.userData.merged = true;
    m.castShadow = !FAST; m.receiveShadow = !FAST; m.frustumCulled = false;
    scene.add(m); MB_MESHES[fam] = m; tris += K.tris; meshes++;
    K.pos = K.nor = K.uv = K.col = null;
  }
  return { tris:tris, meshes:meshes };
}

/* ------------------------------------------------------------------ site registry
   Every named thing registers a volume here so the inspector (86) can name
   whatever is under the cursor: REGISTER({name, kind, x,y,z, r, h, plat}) —
   a vertical cylinder of radius r from y to y+h. Most specific (smallest) wins. */
var SITES = [];
function REGISTER(o){ SITES.push(o); return o; }
