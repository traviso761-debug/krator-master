/* ==== 10. BLOCK KIT ==== */
reseed(450001);

var BUCKET = {};
function push(shape, fam, rec){
  var k = shape+'|'+fam;
  (BUCKET[k] || (BUCKET[k] = { shape:shape, fam:fam, list:[] })).list.push(rec);
}
/* rec = [x, y(base), z, sx, sy, sz, ry, color] */
function BOX (x,y,z,w,h,d,ry,c,f){ push('box',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }
function FR8 (x,y,z,w,h,d,ry,c,f){ push('fr8',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // gentle batter
function FR6 (x,y,z,w,h,d,ry,c,f){ push('fr6',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // strong taper
function FR3 (x,y,z,w,h,d,ry,c,f){ push('fr3',  f||'stone',[x,y,z,w,h,d,ry||0,c]); }  // spire
function DOME(x,y,z,r,h,ry,c,f)  { push('dome', f||'dome', [x,y,z,r,h,r,ry||0,c]); }
function BLOB(x,y,z,r,h,ry,c,f)  { push('blob', f||'leaf', [x,y,z,r,h,r,ry||0,c]); }
function STK (x,y,z,r,h,ry,c,f)  { push('stk',  f||'trunk',[x,y,z,r,h,r,ry||0,c]); }
function CYL (x,y,z,r,h,ry,c,f)  { push('cyl',  f||'stone',[x,y,z,r,h,r,ry||0,c]); }
function CONE(x,y,z,r,h,ry,c,f)  { push('cone', f||'roof', [x,y,z,r,h,r,ry||0,c]); }

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
  fr8 : function(){ return rectFrus(0.86,0.86); },
  fr6 : function(){ return rectFrus(0.60,0.60); },
  fr3 : function(){ return rectFrus(0.26,0.26); },
  dome: function(){ return new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*0.5); },
  blob: function(){ return new THREE.SphereGeometry(1,8,5,0,Math.PI*2,0,Math.PI*0.5); },
  cyl : function(){ return new THREE.CylinderGeometry(1,1,1,10).translate(0,0.5,0); },
  stk : function(){ return new THREE.CylinderGeometry(0.8,1,1,6).translate(0,0.5,0); },
  cone: function(){ return new THREE.ConeGeometry(1,1,6).translate(0,0.5,0); }
};

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

var CLOTH_TIME = { value: 0 };
function applyClothSway(sh){
  sh.uniforms.uWindTime = CLOTH_TIME;

  sh.vertexShader = sh.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uWindTime;');
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

/* ==== NIGHT ILLUMINATION ==== */
var NLM_RES  = 1024;                 /* ~7.6 world units per texel over CITY_EXT */
var NLM_EXT  = CITY_EXT;

var NLM_LAMP_MAX = 3.0;
var NLM_WIN_MAX  = 1.2;
var NLM_Y0 = -12, NLM_YSPAN = 268;   /* height-channel encode range, world units */
var NLM_WARM = PAL.flame.warm;       /* LINEAR-space flame colour (~#ffc480 after sRGB out) */

var NLM_LAMP_GAIN  = 0.48;           /* irradiance added per unit of pooled lamp intensity */
var NLM_WIN_GAIN   = 0.22;
var NLM_VFALL_LAMP = 0.050;          /* e-folding height, 1/world-units */
var NLM_VFALL_WIN  = 0.070;
var NLM_WIN_AMP = 0.55, NLM_WIN_RAD = 14;
var NLM_ALLNIGHT_FRAC = 0.05;

var NL_LAMPS = [];
/* [x, yCentre, z, ry, lx, ly, lz, hOn, hOff, allNight] — every window. */
var NL_WINDOWS = [];

function nlHash(x,y,z,salt){
  var v = Math.sin(x*12.9898 + z*78.233 + y*37.719 + salt*93.9898) * 43758.5453;
  return v - Math.floor(v);
}
function nlLampAdd(x,y,z,amp,rad){
  NL_LAMPS.push([x,y,z, amp==null?1:amp, rad==null?17:rad]);
}
/* ==== COLOURED lamps ==== */
var NLM_GREEN_MAX = 4;
var NLM_GREEN_COL = PAL.flame.green;      /* LINEAR-space, like NLM_WARM — a saturated flame green */
var NL_GREEN = [];                        /* [x,y,z,amp,rad] */
function nlGreenAdd(x,y,z,amp,rad){
  if(NL_GREEN.length >= NLM_GREEN_MAX) return false;
  NL_GREEN.push([x,y,z, amp==null?1:amp, rad==null?24:rad]);
  return true;
}

function nlWinAdd(x,yCentre,z,ry,lx,ly,lz){
  NL_WINDOWS.push([x,yCentre,z,ry,lx,ly,lz,
                   nlHash(x,yCentre,z,1.7), nlHash(x,yCentre,z,5.3),
                   nlHash(x,yCentre,z,11.9) < NLM_ALLNIGHT_FRAC]);
}

function WINBOX(x,y,z,w,h,d,ry,c,f){
  BOX(x,y,z,w,h,d,ry,c,f);
  nlWinAdd(x, y + h*0.5, z, ry||0, w, h, d);
}

var nlmTex = new THREE.DataTexture(new Uint8Array(NLM_RES*NLM_RES*4), NLM_RES, NLM_RES, THREE.RGBAFormat);
nlmTex.minFilter = nlmTex.magFilter = THREE.LinearFilter;
nlmTex.wrapS = nlmTex.wrapT = THREE.ClampToEdgeWrapping;
nlmTex.generateMipmaps = false;
nlmTex.flipY = false;                /* row 0 of the data is v=0; the row<->z map below assumes it */
nlmTex.needsUpdate = true;

var NLM_U = { uNlMap:{ value:nlmTex }, uNlExt:{ value:NLM_EXT },
              uNlNight:{ value:0 }, uNlWin:{ value:0 },

              uNlG:{ value: (function(){ var a=[]; for(var i=0;i<NLM_GREEN_MAX;i++) a.push(new THREE.Vector4(0,0,0,0)); return a; })() },
              uNlGAmp:{ value: (function(){ var a=[]; for(var i=0;i<NLM_GREEN_MAX;i++) a.push(0); return a; })() } };

function nlmBake(){
  var N = NLM_RES, S = N/(2*NLM_EXT), NN = N*N;
  var la = new Float32Array(NN), ly = new Float32Array(NN);
  var wa = new Float32Array(NN), wy = new Float32Array(NN);
  function splat(acc, accY, x, y, z, amp, rad){
    var cx = (x + NLM_EXT)*S, cz = (NLM_EXT - z)*S, pr = Math.max(1.0, rad*S);
    var i0 = Math.max(0, Math.floor(cx-pr)), i1 = Math.min(N-1, Math.ceil(cx+pr));
    var j0 = Math.max(0, Math.floor(cz-pr)), j1 = Math.min(N-1, Math.ceil(cz+pr));
    var pr2 = pr*pr;
    for(var j=j0;j<=j1;j++){
      var dz = (j+0.5)-cz, row = j*N;
      for(var i=i0;i<=i1;i++){
        var dx = (i+0.5)-cx, d2 = dx*dx + dz*dz;
        if(d2 >= pr2) continue;
        var t = 1 - d2/pr2, w = amp*t*t;          /* smooth quartic pool, 0 at the rim */
        acc[row+i] += w; accY[row+i] += w*y;
      }
    }
  }
  NL_LAMPS.forEach(function(L){ splat(la, ly, L[0], L[1], L[2], L[3], L[4]); });
  NL_WINDOWS.forEach(function(W){ splat(wa, wy, W[0], W[1], W[2], NLM_WIN_AMP, NLM_WIN_RAD); });
  var d = nlmTex.image.data, peakL = 0, peakW = 0;
  for(var k=0;k<NN;k++){
    var av = la[k], bv = wa[k];
    if(av > peakL) peakL = av;
    if(bv > peakW) peakW = bv;
    d[k*4]   = av > 0 ? Math.min(255, Math.round(av/NLM_LAMP_MAX*255)) : 0;
    d[k*4+1] = av > 0 ? Math.max(0, Math.min(255, Math.round(((ly[k]/av)-NLM_Y0)/NLM_YSPAN*255))) : 0;
    d[k*4+2] = bv > 0 ? Math.min(255, Math.round(bv/NLM_WIN_MAX*255)) : 0;
    d[k*4+3] = bv > 0 ? Math.max(0, Math.min(255, Math.round(((wy[k]/bv)-NLM_Y0)/NLM_YSPAN*255))) : 0;
  }
  nlmTex.needsUpdate = true;

  for(var gi=0; gi<NLM_GREEN_MAX; gi++){
    var G = NL_GREEN[gi];
    NLM_U.uNlG.value[gi].set(G?G[0]:0, G?G[1]:0, G?G[2]:0, G?G[4]:0);
    NLM_U.uNlGAmp.value[gi] = G ? G[3] : 0;
  }
  return { lamps:NL_LAMPS.length, windows:NL_WINDOWS.length, green:NL_GREEN.length, res:NLM_RES,
           peakLampPool:+peakL.toFixed(2), peakWinPool:+peakW.toFixed(2) };
}

function applyNightGlow(sh, wpName){
  var wp = wpName || 'vNlWP';
  sh.uniforms.uNlMap   = NLM_U.uNlMap;
  sh.uniforms.uNlExt   = NLM_U.uNlExt;
  sh.uniforms.uNlNight = NLM_U.uNlNight;
  sh.uniforms.uNlWin   = NLM_U.uNlWin;
  sh.uniforms.uNlG     = NLM_U.uNlG;
  sh.uniforms.uNlGAmp  = NLM_U.uNlGAmp;
  if(!wpName){
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;')
      .replace('#include <project_vertex>',
        '#ifdef USE_INSTANCING\n' +
        '  vNlWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n' +
        '#else\n' +
        '  vNlWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n' +
        '#endif\n' +
        '#include <project_vertex>');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;');
  }
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>',
      '#include <common>\nuniform sampler2D uNlMap;\nuniform float uNlExt;\nuniform float uNlNight;\nuniform float uNlWin;\n' +
      'uniform vec4 uNlG[' + NLM_GREEN_MAX + '];\nuniform float uNlGAmp[' + NLM_GREEN_MAX + '];')
    .replace('#include <aomap_fragment>', [
      'if(uNlNight > 0.002){',
      '  vec2 _nuv = vec2((' + wp + '.x + uNlExt)/(2.0*uNlExt), (uNlExt - ' + wp + '.z)/(2.0*uNlExt));',
      '  if(_nuv.x > 0.0 && _nuv.x < 1.0 && _nuv.y > 0.0 && _nuv.y < 1.0){',
      '    vec4 _nlm = texture2D(uNlMap, _nuv);',
      '    float _lI = _nlm.r * ' + NLM_LAMP_MAX.toFixed(3) + ';',
      '    float _wI = _nlm.b * ' + NLM_WIN_MAX.toFixed(3) + ' * uNlWin;',
      '    float _lY = _nlm.g * ' + NLM_YSPAN.toFixed(1) + ' + (' + NLM_Y0.toFixed(1) + ');',
      '    float _wY = _nlm.a * ' + NLM_YSPAN.toFixed(1) + ' + (' + NLM_Y0.toFixed(1) + ');',
      '    float _lf = exp(-abs(' + wp + '.y - _lY) * ' + NLM_VFALL_LAMP.toFixed(4) + ');',
      '    float _wf = exp(-abs(' + wp + '.y - _wY) * ' + NLM_VFALL_WIN.toFixed(4) + ');',
      '    float _pool = _lI*_lf*' + NLM_LAMP_GAIN.toFixed(4) + ' + _wI*_wf*' + NLM_WIN_GAIN.toFixed(4) + ';',
      '    reflectedLight.indirectDiffuse += vec3(' + NLM_WARM[0].toFixed(3) + ',' + NLM_WARM[1].toFixed(3) + ',' + NLM_WARM[2].toFixed(3) + ')',
      '      * _pool * uNlNight * diffuseColor.rgb;',
      '  }',

      '  float _gp = 0.0;',
      '  for(int _gi=0; _gi<' + NLM_GREEN_MAX + '; _gi++){',
      '    vec4 _g = uNlG[_gi];',
      '    if(_g.w > 0.0){',
      '      vec2 _gd = vec2(' + wp + '.x - _g.x, ' + wp + '.z - _g.z);',
      '      float _gq = dot(_gd,_gd) / (_g.w*_g.w);',
      '      if(_gq < 1.0){',
      '        float _gt = 1.0 - _gq;',
      '        _gp += uNlGAmp[_gi] * _gt * _gt * exp(-abs(' + wp + '.y - _g.y) * ' + NLM_VFALL_LAMP.toFixed(4) + ');',
      '      }',
      '    }',
      '  }',
      '  if(_gp > 0.0){',
      '    reflectedLight.indirectDiffuse += vec3(' + NLM_GREEN_COL[0].toFixed(3) + ',' + NLM_GREEN_COL[1].toFixed(3) + ',' + NLM_GREEN_COL[2].toFixed(3) + ')',
      '      * _gp * ' + NLM_LAMP_GAIN.toFixed(4) + ' * uNlNight * diffuseColor.rgb;',
      '  }',
      '}',
      '#include <aomap_fragment>'
    ].join('\n'));
}

var _dm = new THREE.Object3D(), _col = new THREE.Color();
function emitBuckets(){
  var total=0, meshes=0;
  for(var k in BUCKET){
    var B = BUCKET[k];
    if(!B.list.length) continue;
    var geo = SHAPES[B.shape]();
    var fm  = FAMMAT[B.fam] || {};
    var mat = new THREE.MeshLambertMaterial({ color:0xffffff, map: fm.tex || null });
    mat.userData.fam = B.fam;

    (function(needsUV, needsSway, sc){
      mat.onBeforeCompile = function(sh){
        if(needsUV) applyWorldUV(sh, sc);
        if(needsSway) applyClothSway(sh);
        applyNightGlow(sh);
      };
      mat.customProgramCacheKey = function(){
        return (needsUV ? 'wuv'+sc[0].toFixed(2)+'_'+sc[1].toFixed(2) : '') + (needsSway ? '|sway' : '') + '|nl';
      };
    })(!!fm.tex, B.fam === 'cloth', fm.scale || [4,4]);
    var im = new THREE.InstancedMesh(geo, mat, B.list.length);
    im.userData.shape = B.shape; im.userData.fam = B.fam;
    im.castShadow = !FAST; im.receiveShadow = !FAST;
    for(var i=0;i<B.list.length;i++){
      var r = B.list[i];
      _dm.position.set(r[0],r[1],r[2]);
      _dm.scale.set(r[3],r[4],r[5]);
      _dm.rotation.set(0,r[6],0);
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

/* ==== palette ==== */

function tone(){ return pick(TONES); }

/* ==== shared architectural vocabulary ==== */
function structure(x, yb, z, w, d, h, ry, kind, col, opt){
  opt = opt || {};
  var roof = opt.roof || pick(ROOFS);

  var wallFam = opt.poor ? 'plaster' : undefined;
  if(kind === 'velothi'){
    var seg = Math.max(2, Math.round(h/13));
    var y = yb, cw = w, cd = d;
    for(var i=0;i<seg;i++){
      var sh = h/seg;
      FR8(x, y, z, cw, sh*1.02, cd, ry, col);
      y += sh;
      BOX(x, y-0.9, z, cw*0.90, 1.5, cd*0.90, ry, shade(col,-0.12));   // string course
      cw *= 0.87; cd *= 0.87;
    }
    if(opt.cap === 'dome' || (opt.cap===undefined && chance(0.22)))
      DOME(x, y, z, cw*0.56, cw*0.42, ry, pick(DOMEC), 'dome');
    else
      CONE(x, y, z, cw*0.60, cw*0.95, ry, roof);
    return;
  }
  if(kind === 'domed'){
    BOX(x, yb, z, w, h, d, ry, col);
    BOX(x, yb+h, z, w*1.06, 1.6, d*1.06, ry, shade(col,-0.10));
    var dr = Math.min(w,d)*0.42;
    CYL(x, yb+h+1.6, z, dr*1.10, Math.max(2.5,h*0.12), ry, shade(col,0.05));
    DOME(x, yb+h+1.6+Math.max(2.5,h*0.12), z, dr, dr*0.80, ry, pick(DOMEC), 'dome');
    return;
  }
  if(kind === 'hovel'){
    BOX(x, yb, z, w, h, d, ry, col, wallFam);
    if(chance(0.55)){
      var lw=w*rr(0.4,0.7), lh=h*rr(0.35,0.6);
      var o = loc(x,z, w*0.5+lw*0.5-0.6, 0, ry);
      BOX(o[0], yb, o[1], lw, lh, d*rr(0.5,0.85), ry, shade(col,-0.06), wallFam);
    }
    if(chance(0.4)) BOX(x, yb+h, z, w*1.04, 0.9, d*1.04, ry, shade(col,-0.14), wallFam);
    return;
  }
  /* hlaalu: stacked, stepping back, flat roofs with parapets */
  var lev = Math.max(1, Math.round(h/11));
  var y0 = yb, cw2 = w, cd2 = d;
  for(var L=0; L<lev; L++){
    var lh2 = h/lev;
    BOX(x, y0, z, cw2, lh2, cd2, ry, col, wallFam);
    BOX(x, y0+lh2-0.6, z, cw2*1.05, 1.4, cd2*1.05, ry, shade(col,-0.13), wallFam);  // cornice
    y0 += lh2;
    if(L < lev-1){
      /* step back, and jog the upper block off-centre */
      var jx = rr(-0.10,0.10)*cw2, jz = rr(-0.10,0.10)*cd2;
      var o2 = loc(x,z,jx,jz,ry);
      x = o2[0]; z = o2[1];
      cw2 *= rr(0.68,0.86); cd2 *= rr(0.68,0.86);
    }
  }
  BOX(x, y0, z, cw2*1.02, 1.1, cd2*1.02, ry, shade(col,-0.16), wallFam);            // parapet
  if(opt.cap === 'dome' || (opt.cap===undefined && chance(0.045))){
    var dr2 = Math.min(cw2,cd2)*0.36;
    DOME(x, y0+1.1, z, dr2, dr2*0.78, ry, pick(DOMEC), 'dome');
  }
  if(chance(0.30)) CYL(x+rr(-cw2*0.3,cw2*0.3), y0+1.1, z+rr(-cd2*0.3,cd2*0.3), rr(1.0,1.9), rr(3,7), 0, shade(col,-0.2));
}

function shade(hex, f){
  var c = new THREE.Color(hex);
  if(f>=0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x1a1712), -f);
  return c.getHex();
}
function loc(x,z,lx,lz,ry){
  return [ x + lx*Math.cos(ry) + lz*Math.sin(ry), z - lx*Math.sin(ry) + lz*Math.cos(ry) ];
}
