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
  /* the shader text, for a material the page hooks its own way (core/engine's matHook): u = the uniforms (uniforms()), lambert
     its kind, attr: the room and the indoor mask come per vertex (aRlU, aRlIn: wire() sets them) instead of uRlU/uRlIndoor */
  function uniforms(o){
    return { uRlTex:{ value:o.tex }, uRlU:{ value:o.u == null ? 0 : o.u }, uRlIndoor:{ value:o.indoor == null ? 1 : o.indoor },
             uRlSun:{ value:o.sunDay == null ? 1 : o.sunDay }, uRlLamp:{ value:o.lampAmb == null ? 1 : o.lampAmb } };
  }
  function hook(sh, u, lambert, attr){
    for(var k in u) sh.uniforms[k] = u[k];
    var decl = '#include <common>\nuniform sampler2D uRlTex;\nuniform float uRlU;\nuniform float uRlIndoor;\nuniform float uRlSun;\nuniform float uRlLamp;' +
      (attr ? '\nvarying float vRlU;\nvarying float vRlIn;' : '');
    var room = attr ? 'float _rlU = vRlU, _rlIn = vRlIn;\n' : 'float _rlU = uRlU, _rlIn = uRlIndoor;\n';
    var glsl = room + GLSL_ROOM.split('uRlU').join('_rlU');
    if(attr) sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aRlU;\nattribute float aRlIn;\nvarying float vRlU;\nvarying float vRlIn;')
      .replace('#include <project_vertex>', 'vRlU = aRlU; vRlIn = aRlIn;\n#include <project_vertex>');
    if(lambert){
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRlN;')
        .replace('#include <project_vertex>', 'vRlN = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);\n#include <project_vertex>');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', decl + '\nvarying vec3 vRlN;')
        .replace('#include <lightmap_fragment>', '#include <lightmap_fragment>\n{ vec3 _rlN = vRlN;\n' + glsl +
                 'reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse, _rIrr, _rlIn * uRlIndoor); }');
    } else {
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', decl)
        .replace('#include <lights_fragment_end>', '{ vec3 _rlN = inverseTransformDirection(geometry.normal, viewMatrix);\n' + glsl +
                 'irradiance = mix(irradiance, _rIrr, _rlIn * uRlIndoor); }\n#include <lights_fragment_end>');
    }
  }
  function apply(mat, o){
    var u = uniforms(o), prev = mat.onBeforeCompile, lambert = !!mat.isMeshLambertMaterial, attr = !!o.attr;
    mat.userData.roomLight = u;
    mat.onBeforeCompile = function(sh, r){ if(prev) prev.call(this, sh, r); hook(sh, u, lambert, attr); };
    var pk = mat.customProgramCacheKey && mat.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey ? mat.customProgramCacheKey() : '';
    mat.customProgramCacheKey = function(){ return pk + (attr ? '|rla' : '|rl'); };
    mat.needsUpdate = true;
    return mat;
  }
  /* WIRING A PAGE (I1-I2 on merged geometry): every vertex of the meshes that lies in a room (inside its polygon and between its
     floor and ceiling, or on its boundary with its face turned in) takes that room's column (aRlU) and the indoor mask (aRlIn
     1); every other vertex 0, so the outside of a wall keeps the sky. rooms: ROOM() records in world terms (kits/interiors:
     id, poly [[x,z]...], y, h). Meshes in world space or with a matrixWorld; instanced meshes are left alone. -> {vertices, indoor} */
  function inPoly(P, x, z){ var inn = false; for(var i = 0, j = P.length - 1; i < P.length; j = i++){ var a = P[i], b = P[j];
    if((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inn = !inn; } return inn; }
  function edgeDist(P, x, z){ var d = 1e9; for(var i = 0, j = P.length - 1; i < P.length; j = i++){ var a = P[j], b = P[i], dx = b[0] - a[0], dz = b[1] - a[1],
    l2 = dx * dx + dz * dz, t = l2 > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0, ex = a[0] + dx * t - x, ez = a[1] + dz * t - z;
    d = Math.min(d, ex * ex + ez * ez); } return Math.sqrt(d); }
  function tagRooms(meshes, rooms, uById, o){
    o = o || {};
    var tol = o.tol == null ? 0.06 : o.tol, CELL = 8, grid = {}, out = { vertices:0, indoor:0, meshes:0 };
    rooms.forEach(function(R){ var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, cx = 0, cz = 0;
      R.poly.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); cx += p[0]; cz += p[1]; });
      R._rl = { cx:cx / R.poly.length, cz:cz / R.poly.length, u:uById[R.id] };
      if(R._rl.u == null) return;
      for(var gx = Math.floor((x0 - tol) / CELL); gx <= Math.floor((x1 + tol) / CELL); gx++)
        for(var gz = Math.floor((z0 - tol) / CELL); gz <= Math.floor((z1 + tol) / CELL); gz++){ var k = gx + ',' + gz; (grid[k] = grid[k] || []).push(R); } });
    var v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
    meshes.forEach(function(m){
      if(!m || !m.isMesh || m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position) return;
      m.updateMatrixWorld(true); nm.getNormalMatrix(m.matrixWorld);
      var g = m.geometry, P = g.attributes.position, N = g.attributes.normal, cnt = P.count, U = new Float32Array(cnt), I = new Float32Array(cnt), any = 0;
      for(var i = 0; i < cnt; i++){
        v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld);
        var L = grid[Math.floor(v.x / CELL) + ',' + Math.floor(v.z / CELL)]; if(!L) continue;
        if(N) n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
        for(var r = 0; r < L.length; r++){ var R = L[r];
          if(v.y < R.y - tol || v.y > R.y + R.h + tol) continue;
          var inside = inPoly(R.poly, v.x, v.z), edge = !inside && edgeDist(R.poly, v.x, v.z) <= tol;
          if(!inside && !edge) continue;
          if(edge && N && n.x * (R._rl.cx - v.x) + n.z * (R._rl.cz - v.z) <= 0) continue;   /* on the wall line, facing out */
          U[i] = R._rl.u; I[i] = 1; any++; break; }
      }
      g.setAttribute('aRlU', new THREE.BufferAttribute(U, 1)); g.setAttribute('aRlIn', new THREE.BufferAttribute(I, 1));
      out.meshes++; out.vertices += cnt; out.indoor += any;
    });
    return out;
  }
  /* the room-gated light pool (I3) on the web: a fixed number of point lights (the count never changes, so no material
     recompiles) moved each frame to KROOMLIGHT.pickPool's picks for the eye's room; the rest dark */
  function lightPool(scene, n){
    var L = [];
    for(var i = 0; i < n; i++){ var p = new THREE.PointLight(0xffffff, 0, 8, 2); p.name = 'roomlight:pool' + i; scene.add(p); L.push(p); }
    return { lights:L, set:function(pool, gain){ gain = gain == null ? 1 : gain;
      for(var i = 0; i < L.length; i++){ var q = pool && pool[i];
        if(!q){ L[i].intensity = 0; continue; }
        L[i].position.set(q.at[0], q.at[1], q.at[2]); L[i].color.setRGB(q.color[0], q.color[1], q.color[2]);
        L[i].intensity = q.amp * gain; L[i].distance = q.range; } } };
  }
  /* A PAGE THAT GROWS ITS ROOMS (girder, locus, yuni, mavs-refuge: rooms planned at load or built lazily as the camera nears):
     wirePage({ scene, rooms() -> [{id, poly, y, h, doors?, windows?, lamps?, vault?}], table?(rooms) -> KROOMLIGHT table
     (default: each room one exterior door, its windows and lamps if it has them), sunUp?() -> 0..1, every? ms (1000),
     capacity? (8192 rooms) }). Each tick: when the rooms grew, the table is rebuilt into a fixed-width texture (a room keeps its
     column) and the meshes near the new rooms are tagged again; a mesh with new geometry (a furniture batch that grew) is
     tagged; every lit material of a tagged mesh takes the hook once. ?roomlight=0 leaves the page as it was. -> state */
  function wirePage(o){
    var st = { rooms:0, tagged:0, indoor:0, materials:0, on:!(typeof location !== 'undefined' && /[?&]roomlight=0\b/.test(location.search)) };
    if(!st.on || typeof KROOMLIGHT === 'undefined') return st;
    var cap = o.capacity || 8192, D = new Float32Array((cap + 1) * 2 * 4), tex = new THREE.DataTexture(D, cap + 1, 2, THREE.RGBAFormat, THREE.FloatType);
    tex.minFilter = tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.flipY = false; tex.needsUpdate = true;
    var U = uniforms({ tex:tex }), uById = {}, geo = new WeakMap(), hooked = new WeakSet(), list = [];
    st.tex = tex; st.U = U;
    function rec(R){ var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; R.poly.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
      return { id:R.id, box:[x0, R.y, z0, x1, R.y + R.h, z1], doors:R.doors || [{ out:true, w:1 }], windows:R.windows || [], lamps:R.lamps || [], vault:!!R.vault }; }
    function retable(){
      var T = o.table ? o.table(list) : KROOMLIGHT.buildTable({ rooms:list.map(rec) }), d = texData(T), w = cap + 1;
      for(var i = 0; i < T.order.length && i < cap; i++){ var src = i * 4, s1 = (d.width + i) * 4;
        for(var c = 0; c < 4; c++){ D[i * 4 + c] = d.data[src + c]; D[(w + i) * 4 + c] = d.data[s1 + c]; }
        uById[T.order[i]] = (i + 0.5) / w; }
      tex.needsUpdate = true; st.table = T;
    }
    function hookMat(m){ var mt = m.material; if(!mt || Array.isArray(mt) || hooked.has(mt)) return;
      if(!(mt.isMeshStandardMaterial || mt.isMeshLambertMaterial || mt.isMeshPhongMaterial)) return;
      hooked.add(mt); st.materials++;
      var prev = mt.onBeforeCompile, lam = !mt.isMeshStandardMaterial;
      mt.onBeforeCompile = function(sh, r){ if(prev) prev.call(this, sh, r); hook(sh, U, lam, true); };
      var pk = mt.customProgramCacheKey && mt.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey ? mt.customProgramCacheKey() : '';
      mt.customProgramCacheKey = function(){ return pk + '|rla'; }; mt.needsUpdate = true; }
    function tick(){
      var rooms = o.rooms() || [], fresh = rooms.length !== list.length ? rooms.slice(list.length) : [];
      if(fresh.length){ list = rooms.slice(); retable(); st.rooms = list.length; }
      var meshes = [], near = [];
      o.scene.traverse(function(m){ if(!m.isMesh || m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position) return;
        var g = m.geometry, seen = geo.get(m);
        if(!seen || seen.g !== g || seen.n !== g.attributes.position.count) meshes.push(m); else if(fresh.length) near.push(m); });
      var again = fresh.length ? near.filter(function(m){ if(!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
        var c = m.geometry.boundingSphere.center.clone().applyMatrix4(m.matrixWorld), r = m.geometry.boundingSphere.radius * m.matrixWorld.getMaxScaleOnAxis();
        return fresh.some(function(R){ var b = rec(R).box; return c.x + r >= b[0] && c.x - r <= b[3] && c.z + r >= b[2] && c.z - r <= b[5] && c.y + r >= b[1] && c.y - r <= b[4]; }); }) : [];
      var todo = meshes.concat(again);
      if(todo.length && list.length){ var t = tagRooms(todo, list, uById); st.tagged += t.meshes; st.indoor += t.indoor; }
      todo.forEach(function(m){ geo.set(m, { g:m.geometry, n:m.geometry.attributes.position.count }); hookMat(m); });
      if(o.sunUp){ var s = o.sunUp(); U.uRlSun.value = s; U.uRlLamp.value = 1 + 0.6 * (1 - s); }
    }
    st.tick = tick; tick(); if(o.every !== 0 && typeof setInterval === 'function') st.timer = setInterval(tick, o.every || 1000);   /* every 0: the page ticks it itself */
    return st;
  }
  return { texData:texData, texture:texture, uniforms:uniforms, hook:hook, apply:apply, tagRooms:tagRooms, lightPool:lightPool, wirePage:wirePage };
})();
if(typeof module !== 'undefined' && module.exports) module.exports = { KNLV:KNLV, KRLHOST:KRLHOST };
