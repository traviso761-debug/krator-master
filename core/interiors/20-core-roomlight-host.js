// ================================================================= INTERIORS — the web host's light: the night light volume and the room table
// [web] K4 (GRAPHICS-TERRAIN-PROPOSAL.md 12d): the light layers a page draws its lit interiors with, one shared copy.
//
//   KNLV.create(cfg) -> V   THE NIGHT LIGHT VOLUME, until now pasted into four builds (girder, yuni, locus, mavs-refuge
//     45-kit.js "NIGHT LIGHT VOLUME"). A stacked city's lamps baked into cfg.ns horizontal slabs of cfg.res^2 texels packed in
//     one atlas texture (cols x rows), sampled with two fetches and a lerp: R warm flames, G window spill, B cool lamps.
//     cfg: {res, ext, ns, cols, rows, y0, dy, max, lampGain, winGain, coolGain, winAmp, winRad, lamps, windows, flame,
//           ix?, pool?}. lamps [[x,y,z, amp, radius, cool]], windows [[x,y,z, nx,nz, ...]] and ix [[x,y,z, amp, radius]]
//     (the lights inside rooms, spilled with the windows) are the build's own lists, read at bake time; flame() gives
//     {warm, cool} (the build's PAL.flame). pool > 0 adds the room-banded pool of the nearest interior lights
//     (U.uIxP/uIxC/uIxF/uIxN, Mav's Refuge's 57c fills them each frame).
//     V.tex, V.U (the uniforms every hooked material shares), V.bake() -> {lamps, windows, [interior,] peak},
//     V.addIx(list) (lights found after the bake: splat and re-encode), V.hook(sh, wpName) (the shader hook: the text
//     each build's applyNightGlow wrote, byte for byte, so a build that takes the module draws the same pixels),
//     V.material(mat, key, extraHook, wpName) (nlMaterial).
//
//   KRLHOST: THE ROOM TABLE ON THE WEB, the twin of Godot's KInteriorsLight room_light_tex (godot/krator/kinteriors_light.gd
//     _build_room_light_tex, library_interior.gdshader): KROOMLIGHT.buildTable's rows as a two-row texture, read per room
//     with a nearest fetch, replacing a room's sky ambient by its portal daylight and lamp bounce (I1-I2).
//     KRLHOST.texData(table) -> {data: Float32Array (w x 2 RGBA), width, uById, fallbackU}: row 0 = daylight x tint, lamp
//       ambience; row 1 = lamp colour, vault. A last column is the fallback for an unassigned indoor piece.
//     KRLHOST.texture(table) -> {tex (THREE.DataTexture, nearest), uById, fallbackU}
//     KRLHOST.apply(mat, {tex, u, indoor, sunDay, lampAmb}) -> mat: a MeshStandard/Physical or Lambert material in one
//       room (its u from uById) takes the room's light in place of the sky's ambient where indoor is 1. The room's
//       corner AO stays in the vertex colour (kits/interiors 50-shell.js bakes it).
var KNLV = (function(){
  'use strict';
  function create(c){
    var tex = new THREE.DataTexture(new Uint8Array(c.res*c.cols*c.res*c.rows*4), c.res*c.cols, c.res*c.rows, THREE.RGBAFormat);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false; tex.flipY = false; tex.needsUpdate = true;
    var pool = c.pool | 0, U = { uNlMap:{ value:tex }, uNlNight:{ value:0 }, uNlWin:{ value:0 } };
    if(pool){
      U.uIxP = { value:[] }; U.uIxC = { value:[] }; U.uIxF = { value:[] }; U.uIxN = { value:0 };
      for(var k=0; k<pool; k++){ U.uIxP.value.push(new THREE.Vector4()); U.uIxC.value.push(new THREE.Vector4()); U.uIxF.value.push(new THREE.Vector2()); }
    }
    var V = { cfg:c, tex:tex, U:U, acc:null };
    V.splat = function(ch, x,y,z, amp, rad){
      var N = c.res, S = N/(2*c.ext);
      var cx=(x+c.ext)*S, cz=(z+c.ext)*S, pr=Math.max(1.3, rad*S), pr2=pr*pr;
      var i0=Math.max(0,Math.floor(cx-pr)), i1=Math.min(N-1,Math.ceil(cx+pr));
      var j0=Math.max(0,Math.floor(cz-pr)), j1=Math.min(N-1,Math.ceil(cz+pr));
      var f=(y-c.y0)/c.dy, s0=Math.floor(f), fr=f-s0, A=V.acc[ch];
      for(var ds=0; ds<2; ds++){
        var sl=s0+ds, wv = ds ? fr : 1-fr; if(sl<0||sl>=c.ns||wv<=0) continue;
        var base=sl*N*N;
        for(var j=j0;j<=j1;j++){ var dz=(j+0.5)-cz;
          for(var i=i0;i<=i1;i++){ var dx=(i+0.5)-cx, d2=dx*dx+dz*dz; if(d2>=pr2) continue;
            var t=1-d2/pr2; A[base+j*N+i] += amp*wv*t*t; } }
      }
    };
    V.encode = function(){
      var N = c.res, AW = N*c.cols, d = tex.image.data, peak=[0,0,0];
      for(var sl=0; sl<c.ns; sl++){
        var tc = sl % c.cols, tr = Math.floor(sl/c.cols);
        for(var j=0;j<N;j++) for(var i=0;i<N;i++){
          var o = ((tr*N + j)*AW + tc*N + i)*4, k = sl*N*N + j*N + i;
          for(var ch=0; ch<3; ch++){ var v=V.acc[ch][k]; if(v>peak[ch]) peak[ch]=v; d[o+ch] = v>0 ? Math.min(255, Math.round(v/c.max*255)) : 0; }
          d[o+3] = 255;
        }
      }
      tex.needsUpdate = true;
      return peak;
    };
    V.bake = function(){
      var n = c.res*c.res*c.ns;
      V.acc = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
      c.lamps.forEach(function(L){ V.splat(L[5]?2:0, L[0],L[1],L[2], L[3], L[4]); });
      c.windows.forEach(function(W){ V.splat(1, W[0]+W[3]*2.5, W[1]-0.6, W[2]+W[4]*2.5, c.winAmp, c.winRad); });
      if(c.ix) c.ix.forEach(function(L){ V.splat(1, L[0],L[1],L[2], L[3], L[4]); });
      var peak = V.encode(), r = { lamps:c.lamps.length, windows:c.windows.length };
      if(c.ix) r.interior = c.ix.length;
      r.peak = peak.map(function(v){ return +v.toFixed(2); });
      return r;
    };
    /* interior lights found after the bake: splat them and re-encode (tens of ms: call it with a batch, not per light) */
    V.addIx = function(list){
      list.forEach(function(L){ c.ix.push(L); if(V.acc) V.splat(1, L[0],L[1],L[2], L[3], L[4]); });
      if(V.acc && list.length) V.encode();
    };
    /* Shader hook. Lambert in r128 is Gouraud, but the BRDF multiply happens in the fragment shader; `#include
       <aomap_fragment>` is the last line before outgoingLight is assembled, so the pool term carries its own diffuseColor.
       wpName lets a material that already has a world-position varying share it. */
    V.hook = function(sh, wpName){
      var wp = wpName || 'vNlWP';
      sh.uniforms.uNlMap = U.uNlMap; sh.uniforms.uNlNight = U.uNlNight; sh.uniforms.uNlWin = U.uNlWin;
      if(pool){ sh.uniforms.uIxP = U.uIxP; sh.uniforms.uIxC = U.uIxC; sh.uniforms.uIxF = U.uIxF; sh.uniforms.uIxN = U.uIxN; }
      /* a lit material on the shared position varying also passes its world normal: an interior light (the pool below)
         then lights only the faces turned toward it, so a lamp in a room does not light the outside of its own wall */
      var useN = !!pool && !wpName && /Lambert|Standard|Phong/.test(sh.shaderName || '');
      if(!wpName){
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;' + (useN ? '\nvarying vec3 vNlN;' : ''))
          .replace('#include <project_vertex>',
            '#ifdef USE_INSTANCING\n  vNlWP = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n' +
            '#else\n  vNlWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n#endif\n' +
            (useN ? '  vNlN = (vec4(transformedNormal, 0.0) * viewMatrix).xyz;\n' : '') + '#include <project_vertex>');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vNlWP;' + (useN ? '\nvarying vec3 vNlN;' : ''));
      }
      var C = c.flame(), T = (c.res).toFixed(1);
      var lines = [
        'if(uNlNight > 0.002){',
        '  vec2 _nuv = (' + wp + '.xz + ' + c.ext.toFixed(1) + ') / ' + (2*c.ext).toFixed(1) + ';',
        '  if(_nuv.x > 0.0 && _nuv.x < 1.0 && _nuv.y > 0.0 && _nuv.y < 1.0){',
        '    float _f = clamp((' + wp + '.y - (' + c.y0.toFixed(1) + ')) / ' + c.dy.toFixed(1) + ', 0.0, ' + (c.ns-1.001).toFixed(3) + ');',
        '    float _s0 = floor(_f), _fr = _f - _s0, _s1 = _s0 + 1.0;',
        '    vec2 _t = clamp(_nuv, 0.5/' + T + ', 1.0 - 0.5/' + T + ');',
        '    vec2 _g = vec2(' + c.cols.toFixed(1) + ', ' + c.rows.toFixed(1) + ');',
        '    vec3 _a = texture2D(uNlMap, (vec2(mod(_s0,_g.x), floor(_s0/_g.x)) + _t)/_g).rgb;',
        '    vec3 _b = texture2D(uNlMap, (vec2(mod(_s1,_g.x), floor(_s1/_g.x)) + _t)/_g).rgb;',
        '    vec3 _p = mix(_a,_b,_fr) * ' + c.max.toFixed(2) + ';',
        '    vec3 _warm = vec3(' + C.warm.map(function(v){return v.toFixed(3);}).join(',') + ');',
        '    vec3 _cool = vec3(' + C.cool.map(function(v){return v.toFixed(3);}).join(',') + ');',
        '    reflectedLight.indirectDiffuse += (_warm*(_p.r*' + c.lampGain.toFixed(3) + ' + _p.g*uNlWin*' + c.winGain.toFixed(3) + ')',
        '       + _cool*_p.b*' + c.coolGain.toFixed(3) + ') * uNlNight * diffuseColor.rgb;',
        '  }',
        '}'];
      if(pool) lines = lines.concat([
        'for(int _i = 0; _i < ' + pool + '; _i++){',
        '  if(float(_i) >= uIxN) break;',
        '  if(' + wp + '.y < uIxF[_i].x - 0.05 || ' + wp + '.y > uIxF[_i].y + 0.05) continue;',
        '  vec3 _d = ' + wp + ' - uIxP[_i].xyz; float _q = dot(_d,_d) / (uIxP[_i].w*uIxP[_i].w);',
        (useN ? '  float _fc = dot(normalize(vNlN), -_d) / max(1e-4, length(_d)); if(_fc <= 0.0) continue;' : '  float _fc = 1.0;'),
        '  if(_q < 1.0){ float _t = 1.0 - _q; reflectedLight.indirectDiffuse += uIxC[_i].rgb * (_t*_t) * (0.35 + 0.65*_fc) * diffuseColor.rgb; }',
        '}']);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D uNlMap;\nuniform float uNlNight;\nuniform float uNlWin;' + (pool ? '\n' +
                 'uniform vec4 uIxP[' + pool + '];\nuniform vec4 uIxC[' + pool + '];\nuniform vec2 uIxF[' + pool + '];\nuniform float uIxN;' : ''))
        .replace('#include <aomap_fragment>', lines.concat(['#include <aomap_fragment>']).join('\n'));
    };
    /* one call for any material a later fragment creates itself (bark, foliage, terrain, creatures): the hook and a key */
    V.material = function(mat, key, extraHook, wpName){
      mat.onBeforeCompile = function(sh){ if(extraHook) extraHook(sh); V.hook(sh, wpName); };
      mat.customProgramCacheKey = function(){ return 'nlv|'+(key||''); };
      return mat;
    };
    return V;
  }
  return { create:create };
})();

var KRLHOST = (function(){
  'use strict';
  var FALLBACK = [[0.20, 0.22, 0.25, 0.07], [1.0, 0.75, 0.43, 0.0]];   /* kinteriors_light.gd: an indoor piece of no room */
  function texData(table){
    var order = (table && table.order) || [], byId = (table && table.byId) || {}, w = Math.max(1, order.length) + 1;
    var data = new Float32Array(w * 2 * 4), uById = {};
    var put = function(x, y, c){ var o = (y * w + x) * 4; data[o] = c[0]; data[o+1] = c[1]; data[o+2] = c[2]; data[o+3] = c[3]; };
    for(var i = 0; i < order.length; i++){
      var row = byId[order[i]] || {}, dl = row.daylight == null ? 0 : row.daylight, dt = row.daylightTint || [0.85, 0.91, 1.0];
      var la = row.lampAmbience == null ? 0.06 : row.lampAmbience, lc = row.lampColor || [1.0, 0.75, 0.43];
      put(i, 0, [dl * dt[0], dl * dt[1], dl * dt[2], la]);
      put(i, 1, [lc[0], lc[1], lc[2], row.vault ? 1 : 0]);
      uById[order[i]] = (i + 0.5) / w;
    }
    put(w - 1, 0, FALLBACK[0]); put(w - 1, 1, FALLBACK[1]);
    return { data:data, width:w, uById:uById, fallbackU:(w - 0.5) / w };
  }
  function texture(table){
    var D = texData(table), tex = new THREE.DataTexture(D.data, D.width, 2, THREE.RGBAFormat, THREE.FloatType);
    tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.flipY = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
    return { tex:tex, uById:D.uById, fallbackU:D.fallbackU, width:D.width };
  }
  /* the room's light: (daylight x sunDay x a normal lift) + lamp ambience x lampAmb x lamp colour, as library_interior's
     room_irr, in place of the sky's ambient irradiance (r128: irradiance before RE_IndirectDiffuse; Lambert: the
     accumulated indirect before its BRDF). x PI: three's Lambert BRDF divides by it, Godot's EMISSION does not. */
  var GLSL_ROOM = 'vec4 _rl0 = texture2D(uRlTex, vec2(uRlU, 0.25)); vec4 _rl1 = texture2D(uRlTex, vec2(uRlU, 0.75));\n' +
    'vec3 _rIrr = (_rl0.rgb * uRlSun * (0.88 + 0.12 * clamp(_rlN.y, -1.0, 1.0)) + _rl0.a * uRlLamp * _rl1.rgb) * PI;\n';
  function apply(mat, o){
    var u = { uRlTex:{ value:o.tex }, uRlU:{ value:o.u == null ? 0 : o.u }, uRlIndoor:{ value:o.indoor == null ? 1 : o.indoor },
              uRlSun:{ value:o.sunDay == null ? 1 : o.sunDay }, uRlLamp:{ value:o.lampAmb == null ? 1 : o.lampAmb } };
    var prev = mat.onBeforeCompile, lambert = !!mat.isMeshLambertMaterial;
    mat.userData.roomLight = u;
    mat.onBeforeCompile = function(sh, r){
      if(prev) prev.call(this, sh, r);
      for(var k in u) sh.uniforms[k] = u[k];
      var decl = '#include <common>\nuniform sampler2D uRlTex;\nuniform float uRlU;\nuniform float uRlIndoor;\nuniform float uRlSun;\nuniform float uRlLamp;';
      if(lambert){
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRlN;')
          .replace('#include <project_vertex>', 'vRlN = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);\n#include <project_vertex>');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', decl + '\nvarying vec3 vRlN;')
          .replace('#include <lightmap_fragment>', '#include <lightmap_fragment>\n{ vec3 _rlN = vRlN;\n' + GLSL_ROOM +
                   'reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse, _rIrr, uRlIndoor); }');
      } else {
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', decl)
          .replace('#include <lights_fragment_end>', '{ vec3 _rlN = inverseTransformDirection(geometry.normal, viewMatrix);\n' + GLSL_ROOM +
                   'irradiance = mix(irradiance, _rIrr, uRlIndoor); }\n#include <lights_fragment_end>');
      }
    };
    var pk = mat.customProgramCacheKey && mat.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey ? mat.customProgramCacheKey() : '';
    mat.customProgramCacheKey = function(){ return pk + '|rl'; };
    mat.needsUpdate = true;
    return mat;
  }
  return { texData:texData, texture:texture, apply:apply };
})();
if(typeof module !== 'undefined' && module.exports) module.exports = { KNLV:KNLV, KRLHOST:KRLHOST };
