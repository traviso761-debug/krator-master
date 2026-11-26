/* ==== Extraplanar VFX, Custom Shaders, Volumetric Smoke & Kinetic Sub-Assemblies. [G shader] (Godot: kchar_extraplanar.gdshader) ====
   Driven automatically whenever KCharFigure equips any kit.json item carrying `it.vfx`:
     - zones[]: triangle/UV slices (`t0..t1`, `v0..v1`) carved from the item's SkinnedMesh into specialized passes:
         * `nebula_rift`:       deep 3D view-ray parallax spiral galaxy, cosmic dust & twinkling starfield portal
         * `fresnel_ghost`:     translucent astral/crystal shell (`depthWrite:false`) w/ blazing Fresnel rim, prism & constellations
         * `alpha_erosion`:     scrolling 3D FBM vertical-tatter & vortex smoke-dissolve w/ glowing erosion edge
         * `accretion_disc`:    differential-swirl incandescent plasma & stardust ring shader
         * `emissive_blaze`:    self-luminous eclipse starburst, lantern spirit-flame, Cyclopean eye & mask-gaze shader
     - zones[].kinetic: extracts rigid sub-meshes into bone-parented (`Head`, `Neck`, `Spine2`, `Hips`) pivots with live
       60 Hz orbital rotation (`orbit`), precession, levitation (`bob`), wave-chorus (`chorus_wave`), or crystal drift
     - emitters[]: bone-anchored live multi-puff GPU-billboarded FBM volumetric smoke plumes & wisp trails (`smoke_emitter`)
*/
(function(){
  if(typeof KCharFigure === 'undefined' || KCharFigure._extraplanarWrapped) return;

  var GLSL_NOISE = [
    'float kxHash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float kxHash13(vec3 p3){ p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }',
    'float kxNoise2(vec2 p){',
    '  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(kxHash12(i), kxHash12(i + vec2(1.0, 0.0)), f.x),',
    '             mix(kxHash12(i + vec2(0.0, 1.0)), kxHash12(i + vec2(1.0, 1.0)), f.x), f.y);',
    '}',
    'float kxNoise3(vec3 p){',
    '  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  float n000 = kxHash13(i), n100 = kxHash13(i + vec3(1,0,0)), n010 = kxHash13(i + vec3(0,1,0)), n110 = kxHash13(i + vec3(1,1,0));',
    '  float n001 = kxHash13(i + vec3(0,0,1)), n101 = kxHash13(i + vec3(1,0,1)), n011 = kxHash13(i + vec3(0,1,1)), n111 = kxHash13(i + vec3(1,1,1));',
    '  return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),',
    '             mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);',
    '}',
    'float kxFbm2(vec2 p){',
    '  float v = 0.0, a = 0.5; mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);',
    '  for(int i = 0; i < 4; i++){ v += a * kxNoise2(p); p = rot * p * 2.03 + vec2(17.1, 31.7); a *= 0.5; }',
    '  return v;',
    '}',
    'float kxFbm3(vec3 p){',
    '  float v = 0.0, a = 0.5;',
    '  for(int i = 0; i < 3; i++){ v += a * kxNoise3(p); p = p * 2.07 + vec3(13.7, 29.3, 7.9); a *= 0.5; }',
    '  return v;',
    '}',
    'float kxStarLayer(vec2 p, float scale, float density, float t){',
    '  vec2 gv = fract(p * scale) - 0.5, id = floor(p * scale);',
    '  float h = kxHash12(id);',
    '  if(h < 1.0 - density) return 0.0;',
    '  vec2 off = vec2(fract(h * 19.31), fract(h * 47.73)) - 0.5;',
    '  float d = length(gv - off * 0.68);',
    '  float tw = 0.68 + 0.32 * sin(t * (2.2 + 4.0 * fract(h * 11.7)) + h * 62.8);',
    '  float core = exp(-d * 26.0) * tw;',
    '  float flare = max(0.0, 1.0 - abs(gv.x - off.x * 0.68) * 38.0) * max(0.0, 1.0 - abs(gv.y - off.y * 0.68) * 9.0)',
    '              + max(0.0, 1.0 - abs(gv.y - off.y * 0.68) * 38.0) * max(0.0, 1.0 - abs(gv.x - off.x * 0.68) * 9.0);',
    '  return core + (h > 0.985 ? flare * 0.55 * tw : 0.0);',
    '}'
  ].join('\n') + '\n';

  function colOf(hex, def){ return new THREE.Color(hex || def || '#ffffff').convertSRGBToLinear(); }

  /* Build a custom MeshStandardMaterial (or unlit cosmic ShaderMaterial) chained after any existing vertex pushOut hook */
  function makeZoneMaterial(srcMat, z, uTime, skinned){
    var kind = z.kind || 'standard';
    var prevHook = skinned && srcMat && srcMat.hasOwnProperty('onBeforeCompile') ? srcMat.onBeforeCompile : null;

    if(kind === 'nebula_rift'){
      var cCore = colOf(z.core_color, '#fff6d8');
      var cArm1 = colOf(z.arm_color, '#7cf4ff');
      var cArm2 = colOf(z.nebula_color, '#5b2cff');
      var cGold = colOf(z.gold_color, '#ffb84a');
      var cVoid = colOf(z.void_color, '#020109');
      var centerY = z.center_y == null ? 1.02 : +z.center_y;
      var galScale = z.galaxy_scale == null ? 2.8 : +z.galaxy_scale;
      var mirrorMode = z.mirror ? 1.0 : 0.0;
      var matN = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.95, metalness: 0.0,
        side: THREE.DoubleSide, skinning: !!skinned
      });
      matN.defines = { USE_UV: '' };
      matN.onBeforeCompile = function(sh, r){
        if(prevHook) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxCore = { value: cCore };
        sh.uniforms.kxArm1 = { value: cArm1 };
        sh.uniforms.kxArm2 = { value: cArm2 };
        sh.uniforms.kxGold = { value: cGold };
        sh.uniforms.kxVoid = { value: cVoid };
        sh.uniforms.kxCenterY = { value: centerY };
        sh.uniforms.kxScale = { value: galScale };
        sh.uniforms.kxMirror = { value: mirrorMode };
        sh.vertexShader = 'varying vec3 vKxFig;\nvarying vec3 vKxWorld;\nvarying vec3 vKxWNrm;\n' +
          sh.vertexShader.replace('#include <project_vertex>',
            '\tvKxFig = transformed;\n\tvKxWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;\n\tvKxWNrm = normalize(mat3(modelMatrix) * objectNormal);\n#include <project_vertex>');
        sh.fragmentShader = 'varying vec3 vKxFig;\nvarying vec3 vKxWorld;\nvarying vec3 vKxWNrm;\n' +
          'uniform float kxTime, kxCenterY, kxScale, kxMirror;\nuniform vec3 kxCore, kxArm1, kxArm2, kxGold, kxVoid;\n' +
          GLSL_NOISE +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tvec3 Vw = normalize(cameraPosition - vKxWorld);',
            '\tvec3 Nw = normalize(vKxWNrm) * (gl_FrontFacing ? 1.0 : -1.0);',
            '\t// Deep 3D interior view-ray parallax into pocket universe',
            '\tvec2 baseP = kxMirror > 0.5 ? (vUv - 0.5) * 0.34 : vec2(vKxFig.x, vKxFig.y - kxCenterY);',
            '\tvec2 par = -Vw.xy / max(0.38, abs(Vw.z) + 0.35);',
            '\tvec2 pNear = baseP + par * 0.055;',
            '\tvec2 pMid  = baseP + par * 0.135;',
            '\tvec2 pDeep = baseP + par * 0.240;',
            '\t// Tilted swirling spiral galaxy core',
            '\tfloat ca = cos(0.32), sa = sin(0.32);',
            '\tvec2 gp = mat2(ca, -sa, sa, ca) * (pDeep * kxScale);',
            '\tgp.y *= 1.32;',
            '\tfloat r = length(gp);',
            '\tfloat th = atan(gp.y, gp.x) - kxTime * 0.38;',
            '\tfloat logR = log(max(r, 0.018));',
            '\tfloat swirl1 = cos(th * 2.0 - logR * 4.4 + kxFbm2(gp * 2.8 + kxTime * 0.08) * 2.4);',
            '\tfloat swirl2 = cos(th * 2.0 - logR * 4.4 + 1.9 + kxFbm2(gp * 4.5 - kxTime * 0.11) * 2.1);',
            '\tfloat armMask1 = pow(max(0.0, swirl1 * 0.5 + 0.5), 3.2) * exp(-r * 1.45) * smoothstep(0.02, 0.16, r);',
            '\tfloat armMask2 = pow(max(0.0, swirl2 * 0.5 + 0.5), 4.0) * exp(-r * 1.85) * smoothstep(0.04, 0.22, r);',
            '\tfloat bulge = exp(-r * 7.8) + 0.55 * exp(-r * 2.8);',
            '\tfloat neb1 = kxFbm2(pMid * 6.2 + vec2(0.0, -kxTime * 0.06));',
            '\tfloat neb2 = kxFbm2(pDeep * 3.8 + vec2(kxTime * 0.04, 2.3));',
            '\tvec3 col = kxVoid;',
            '\tcol += kxArm2 * pow(neb1, 2.2) * 0.85;',
            '\tcol += kxGold * pow(neb2, 2.8) * 0.52 * exp(-r * 1.1);',
            '\tcol += kxArm1 * armMask1 * (1.45 + 0.7 * neb1);',
            '\tcol += mix(kxGold, kxArm1, 0.5) * armMask2 * 1.05;',
            '\tcol += mix(kxGold, kxCore, smoothstep(0.25, 0.95, bulge)) * bulge * 1.55;',
            '\t// Multi-depth parallax twinkling starfields',
            '\tfloat st1 = kxStarLayer(pDeep + vec2(1.7, 3.1), 34.0, 0.20, kxTime);',
            '\tfloat st2 = kxStarLayer(pMid  + vec2(5.3, 8.9), 21.0, 0.14, kxTime * 1.25);',
            '\tfloat st3 = kxStarLayer(pNear + vec2(9.1, 2.4), 13.0, 0.08, kxTime * 1.6);',
            '\tcol += kxCore * (st1 * 0.95 + st2 * 1.35) + kxArm1 * (st3 * 1.65);',
            '\t// Spiral arm bright star-clusters',
            '\tfloat armStars = kxStarLayer(gp * 0.45, 28.0, 0.35, kxTime * 0.9) * (armMask1 + bulge * 0.6);',
            '\tcol += kxCore * armStars * 1.4;',
            '\tif(kxMirror > 0.5){',
            '\t  float fresM = pow(1.0 - clamp(abs(dot(Nw, Vw)), 0.0, 1.0), 2.4);',
            '\t  col = mix(col * 1.25 + kxArm1 * 0.22, kxCore * 1.6, fresM * 0.78);',
            '\t} else {',
            '\t  float edgeDark = smoothstep(0.0, 0.28, abs(dot(Nw, Vw)));',
            '\t  col *= mix(0.35, 1.0, edgeDark);',
            '\t}',
            '\tgl_FragColor = vec4(col, 1.0);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matN.customProgramCacheKey = function(){ return 'kx-nebula-' + (skinned ? 'sk' : 'rg') + '-' + mirrorMode; };
      return matN;
    }

    if(kind === 'fresnel_ghost'){
      var cGhostCore = colOf(z.core_color, '#0b1224');
      var cGhostRim  = colOf(z.rim_color, '#6cf6ff');
      var cGhostAcc  = colOf(z.accent_color, '#c89bff');
      var opacity    = z.opacity == null ? 0.62 : +z.opacity;
      var rimPower   = z.power == null ? 2.2 : +z.power;
      var rimGain    = z.rim_gain == null ? 1.85 : +z.rim_gain;
      var prism      = z.prism == null ? 0.0 : +z.prism;
      var constel    = z.constellation == null ? 0.0 : +z.constellation;
      var matF = new THREE.MeshStandardMaterial({
        map: srcMat ? srcMat.map : null,
        color: 0xffffff,
        roughness: 0.22,
        metalness: 0.15,
        transparent: true,
        depthWrite: !!z.depth_write,
        side: THREE.DoubleSide,
        skinning: !!skinned
      });
      if(!matF.map) matF.defines = { USE_UV: '' };
      matF.onBeforeCompile = function(sh, r){
        if(prevHook) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxCore = { value: cGhostCore };
        sh.uniforms.kxRim  = { value: cGhostRim };
        sh.uniforms.kxAcc  = { value: cGhostAcc };
        sh.uniforms.kxOp   = { value: opacity };
        sh.uniforms.kxPow  = { value: rimPower };
        sh.uniforms.kxGain = { value: rimGain };
        sh.uniforms.kxPrism = { value: prism };
        sh.uniforms.kxConst = { value: constel };
        sh.vertexShader = 'varying vec3 vKxFig;\n' +
          sh.vertexShader.replace('#include <project_vertex>', '\tvKxFig = transformed;\n#include <project_vertex>');
        sh.fragmentShader = 'varying vec3 vKxFig;\nuniform float kxTime, kxOp, kxPow, kxGain, kxPrism, kxConst;\n' +
          'uniform vec3 kxCore, kxRim, kxAcc;\n' + GLSL_NOISE +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tvec3 Vf = normalize(vViewPosition);',
            '\tvec3 Nf = normalize(normal) * (gl_FrontFacing ? 1.0 : -1.0);',
            '\tfloat ndv = clamp(abs(dot(Nf, Vf)), 0.0, 1.0);',
            '\tfloat fres = pow(1.0 - ndv, kxPow);',
            '\tfloat shimmer = 0.85 + 0.15 * sin(kxTime * 2.8 + vKxFig.y * 14.0 + vKxFig.x * 9.0);',
            '\tvec3 rimC = kxRim;',
            '\tif(kxPrism > 0.01){',
            '\t  vec3 spec = 0.5 + 0.5 * cos(ndv * 6.5 + vKxFig.y * 16.0 - kxTime * 1.4 + vec3(0.0, 2.09, 4.18));',
            '\t  rimC = mix(rimC, mix(kxRim, kxAcc, spec.r) * (0.75 + 0.75 * spec), kxPrism);',
            '\t}',
            '\tvec3 baseOut = mix(gl_FragColor.rgb * 0.45, kxCore, 0.72);',
            '\tif(kxConst > 0.01){',
            '\t  vec2 cp = vec2(atan(vKxFig.x, vKxFig.z) * 2.4, vKxFig.y * 7.5);',
            '\t  float swirlLine = 1.0 - smoothstep(0.035, 0.095, abs(sin(cp.x * 3.0 + kxFbm2(cp * 1.4) * 4.2)));',
            '\t  float stars = kxStarLayer(cp, 3.2, 0.28, kxTime);',
            '\t  baseOut += (kxAcc * swirlLine * 0.55 + kxRim * stars * 1.35) * kxConst;',
            '\t}',
            '\tvec3 finalRgb = baseOut + rimC * fres * kxGain * shimmer;',
            '\tfloat finalA = clamp(mix(kxOp, min(1.0, kxOp + 0.52), fres), 0.08, 0.99);',
            '\tgl_FragColor = vec4(finalRgb, finalA);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matF.customProgramCacheKey = function(){ return 'kx-fresnel-' + (skinned ? 'sk' : 'rg'); };
      return matF;
    }

    if(kind === 'alpha_erosion'){
      var cEdge = colOf(z.edge_color, '#7a42ff');
      var cSmoke = colOf(z.smoke_color, '#0c0a12');
      var yTop = z.y_top == null ? 0.62 : +z.y_top;
      var yBot = z.y_bot == null ? 0.04 : +z.y_bot;
      var swirl = z.swirl == null ? 0.0 : +z.swirl;
      var matE = new THREE.MeshStandardMaterial({
        map: srcMat ? srcMat.map : null,
        color: 0xffffff,
        roughness: 0.88,
        metalness: 0.08,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        skinning: !!skinned
      });
      if(!matE.map) matE.defines = { USE_UV: '' };
      matE.onBeforeCompile = function(sh, r){
        if(prevHook && !z.no_push) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxEdge = { value: cEdge };
        sh.uniforms.kxSmoke = { value: cSmoke };
        sh.uniforms.kxYTop = { value: yTop };
        sh.uniforms.kxYBot = { value: yBot };
        sh.uniforms.kxSwirl = { value: swirl };
        sh.vertexShader = 'varying vec3 vKxFig;\nuniform float kxTime, kxYTop, kxYBot, kxSwirl;\n' +
          sh.vertexShader.replace('#include <project_vertex>', [
            '\tfloat kxProgV = clamp((kxYTop - transformed.y) / max(kxYTop - kxYBot, 0.05), 0.0, 1.0);',
            '\tif(abs(kxSwirl) > 0.001 && kxProgV > 0.0){',
            '\t  float angS = kxSwirl * pow(kxProgV, 1.35) + sin(kxTime * 2.4 - kxProgV * 4.2) * 0.34 * kxProgV;',
            '\t  float csS = cos(angS), snS = sin(angS);',
            '\t  vec2 xz = mat2(csS, -snS, snS, csS) * transformed.xz;',
            '\t  transformed.x = xz.x + sin(kxTime * 2.1 + transformed.y * 5.0) * 0.042 * kxProgV;',
            '\t  transformed.z = xz.y + cos(kxTime * 1.7 + transformed.y * 4.5) * 0.036 * kxProgV;',
            '\t}',
            '\tvKxFig = transformed;',
            '#include <project_vertex>'
          ].join('\n'));
        sh.fragmentShader = 'varying vec3 vKxFig;\nuniform float kxTime, kxYTop, kxYBot;\nuniform vec3 kxEdge, kxSmoke;\n' +
          GLSL_NOISE +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tfloat prog = clamp((kxYTop - vKxFig.y) / max(kxYTop - kxYBot, 0.05), 0.0, 1.0);',
            '\tif(prog > 0.01){',
            '\t  float az = atan(vKxFig.x, vKxFig.z);',
            '\t  float streak = 0.5 + 0.5 * sin(az * 13.0 + kxNoise2(vec2(az * 3.0, vKxFig.y * 6.0 - kxTime * 1.4)) * 5.0);',
            '\t  float n3 = kxFbm3(vec3(vKxFig.x * 8.5, vKxFig.y * 5.0 - kxTime * 1.35, vKxFig.z * 8.5));',
            '\t  float field = mix(n3, streak, 0.42);',
            '\t  float cut = pow(prog, 1.12) * 0.96;',
            '\t  float er = field - cut;',
            '\t  if(er < -0.02) discard;',
            '\t  float edgeBand = 1.0 - smoothstep(0.0, 0.14, er);',
            '\t  vec3 baseC = mix(gl_FragColor.rgb, kxSmoke, smoothstep(0.15, 0.85, prog) * 0.78);',
            '\t  baseC += kxEdge * edgeBand * 1.65 * smoothstep(0.05, 0.35, prog);',
            '\t  float alphaE = smoothstep(-0.02, 0.16, er) * (1.0 - 0.52 * prog * prog);',
            '\t  gl_FragColor = vec4(baseC, clamp(alphaE, 0.0, 1.0));',
            '\t}',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matE.customProgramCacheKey = function(){ return 'kx-erosion-' + (skinned ? 'sk' : 'rg') + (z.no_push ? '-np' : ''); };
      return matE;
    }

    if(kind === 'accretion_disc'){
      var cIn  = colOf(z.inner_color, '#fff2c6');
      var cMid = colOf(z.mid_color, '#d88b3c');
      var cOut = colOf(z.outer_color, '#4c5eff');
      var matA = new THREE.MeshStandardMaterial({
        map: srcMat ? srcMat.map : null,
        color: 0xffffff,
        roughness: 0.26,
        metalness: 0.72,
        side: THREE.DoubleSide,
        skinning: !!skinned
      });
      if(!matA.map) matA.defines = { USE_UV: '' };
      matA.onBeforeCompile = function(sh, r){
        if(prevHook) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxIn  = { value: cIn };
        sh.uniforms.kxMid = { value: cMid };
        sh.uniforms.kxOut = { value: cOut };
        sh.fragmentShader = 'uniform float kxTime;\nuniform vec3 kxIn, kxMid, kxOut;\n' + GLSL_NOISE +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tvec3 Vf = normalize(vViewPosition);',
            '\tvec3 Nf = normalize(normal) * (gl_FrontFacing ? 1.0 : -1.0);',
            '\tfloat fres = pow(1.0 - clamp(abs(dot(Nf, Vf)), 0.0, 1.0), 2.2);',
            '\tfloat track = exp(-pow((vUv.y - 0.5) * 6.5, 2.0));',
            '\tfloat band = sin(vUv.x * 37.699 - kxTime * 3.2 + kxFbm2(vec2(vUv.x * 12.0 - kxTime * 0.5, vUv.y * 8.0)) * 4.5);',
            '\tfloat plasma = pow(max(0.0, band * 0.5 + 0.5), 2.4) * (0.28 + 0.72 * track);',
            '\tfloat sparks = kxStarLayer(vec2(vUv.x * 6.0 - kxTime * 0.18, vUv.y * 2.0), 14.0, 0.25, kxTime * 2.0);',
            '\tvec3 glow = mix(kxMid, kxOut, fres) * (0.18 + 0.95 * plasma + 0.35 * fres) + kxIn * (sparks * 1.35 + pow(plasma, 3.2) * 0.85 * track);',
            '\tgl_FragColor = vec4(gl_FragColor.rgb * 0.82 + glow, 1.0);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matA.customProgramCacheKey = function(){ return 'kx-accretion-' + (skinned ? 'sk' : 'rg'); };
      return matA;
    }

    if(kind === 'emissive_blaze'){
      var cEm = colOf(z.color, '#ffffff');
      var gain = z.gain == null ? 1.85 : +z.gain;
      var pulse = z.pulse == null ? 0.18 : +z.pulse;
      var matB = new THREE.MeshStandardMaterial({
        map: srcMat ? srcMat.map : null,
        color: 0xffffff,
        roughness: 0.20,
        metalness: 0.10,
        side: THREE.DoubleSide,
        skinning: !!skinned
      });
      if(!matB.map) matB.defines = { USE_UV: '' };
      matB.onBeforeCompile = function(sh, r){
        if(prevHook) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxCol = { value: cEm };
        sh.uniforms.kxGain = { value: gain };
        sh.uniforms.kxPulse = { value: pulse };
        sh.fragmentShader = 'uniform float kxTime, kxGain, kxPulse;\nuniform vec3 kxCol;\n' +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tfloat p = 1.0 + kxPulse * sin(kxTime * 3.6 + vUv.x * 6.283);',
            '\tgl_FragColor = vec4(mix(gl_FragColor.rgb, kxCol, 0.78) * kxGain * p, 1.0);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matB.customProgramCacheKey = function(){ return 'kx-blaze-' + (skinned ? 'sk' : 'rg'); };
      return matB;
    }

    var clone = srcMat ? srcMat.clone() : new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, skinning: !!skinned });
    clone.skinning = !!skinned;
    return clone;
  }

  /* Build a live GPU-billboarded FBM volumetric smoke emitter (single BufferGeometry of N layered puffs) */
  function buildSmokeEmitter(spec, uTime){
    var count = spec.count || 42;
    var pos = new Float32Array(count * 4 * 3);
    var uv  = new Float32Array(count * 4 * 2);
    var dat = new Float32Array(count * 4 * 4); // (ageOffset, seed, sizeScale, swirlSign)
    var idx = new Uint16Array(count * 6);
    var corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];

    for(var i = 0; i < count; i++){
      // Order back-to-front / high-age (outer grey mist) first, low-age (dense soot core) last so core composites richly!
      var age0 = 1.0 - (i + 0.5) / count;
      var seed = ((i * 0.6180339887) % 1.0);
      var szK  = 0.82 + 0.38 * ((i * 0.381966) % 1.0);
      var sgn  = (i % 2 === 0) ? 1.0 : -1.0;
      for(var c = 0; c < 4; c++){
        var v = i * 4 + c;
        pos[3 * v] = 0; pos[3 * v + 1] = 0; pos[3 * v + 2] = 0;
        uv[2 * v] = corners[c][0] + 0.5;
        uv[2 * v + 1] = corners[c][1] + 0.5;
        dat[4 * v] = age0;
        dat[4 * v + 1] = seed;
        dat[4 * v + 2] = szK;
        dat[4 * v + 3] = sgn;
      }
      idx[6 * i]     = i * 4;
      idx[6 * i + 1] = i * 4 + 1;
      idx[6 * i + 2] = i * 4 + 2;
      idx[6 * i + 3] = i * 4;
      idx[6 * i + 4] = i * 4 + 2;
      idx[6 * i + 5] = i * 4 + 3;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aSmoke', new THREE.BufferAttribute(dat, 4));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    var drift = spec.drift || [0.24, 0.54, -0.06];
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        kxTime:  uTime,
        kxRate:  { value: spec.rate == null ? 0.38 : +spec.rate },
        kxSize0: { value: spec.size0 == null ? 0.105 : +spec.size0 },
        kxSize1: { value: spec.size1 == null ? 0.330 : +spec.size1 },
        kxDrift: { value: new THREE.Vector3(drift[0], drift[1], drift[2]) },
        kxSpread:{ value: spec.spread == null ? 0.055 : +spec.spread },
        kxOp:    { value: spec.opacity == null ? 0.84 : +spec.opacity },
        kxEmber: { value: colOf(spec.ember_color, '#4c2278') },
        kxCore:  { value: colOf(spec.core_color, '#08070c') },
        kxMist:  { value: colOf(spec.mist_color, '#6e6c78') }
      },
      vertexShader: [
        'attribute vec4 aSmoke;',
        'uniform float kxTime, kxRate, kxSize0, kxSize1, kxSpread;',
        'uniform vec3 kxDrift;',
        'varying vec2 vUvS;',
        'varying float vAge;',
        'varying float vSeed;',
        'varying float vSgn;',
        'void main(){',
        '  float age = fract(aSmoke.x + kxTime * kxRate);',
        '  float seed = aSmoke.y;',
        '  float ang0 = seed * 6.2831853;',
        '  float turb = age * kxSpread;',
        '  vec3 cPos = kxDrift * pow(age, 1.12);',
        '  cPos.x += cos(ang0 + age * 5.2 - kxTime * 1.9) * turb + sin(age * 8.4 - kxTime * 2.5 + seed * 9.0) * turb * 0.65;',
        '  cPos.z += sin(ang0 + age * 4.8 - kxTime * 1.7) * turb * 0.85;',
        '  cPos.y += sin(seed * 19.0 + kxTime * 2.1) * 0.012 * age;',
        '  float sz = mix(kxSize0, kxSize1, pow(age, 0.78)) * aSmoke.z;',
        '  float rot = ang0 + aSmoke.w * age * 2.2;',
        '  vec2 corner = (uv - 0.5) * sz;',
        '  float cr = cos(rot), sr = sin(rot);',
        '  vec2 rc = mat2(cr, -sr, sr, cr) * corner;',
        '  vec4 mvCenter = modelViewMatrix * vec4(cPos, 1.0);',
        '  mvCenter.xy += rc;',
        '  vUvS = uv;',
        '  vAge = age;',
        '  vSeed = seed;',
        '  vSgn = aSmoke.w;',
        '  gl_Position = projectionMatrix * mvCenter;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float kxTime, kxOp;',
        'uniform vec3 kxEmber, kxCore, kxMist;',
        'varying vec2 vUvS;',
        'varying float vAge;',
        'varying float vSeed;',
        'varying float vSgn;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvS - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  vec2 baseNp = p * 1.75 + vec2(vSeed * 13.7, vSeed * 29.1 - kxTime * 0.42 * vSgn);',
        '  vec2 warp = vec2(kxFbm2(baseNp * 1.35), kxFbm2(baseNp * 1.35 + vec2(5.2, 1.3))) - 0.5;',
        '  float n = kxFbm2(baseNp * 2.35 + warp * 1.55);',
        '  float n2 = kxFbm2(baseNp * 3.8 - vec2(kxTime * 0.32, vAge * 2.2));',
        '  float billow = smoothstep(0.96, 0.16, r + (n - 0.5) * 0.78 + (n2 - 0.5) * 0.34);',
        '  float life = smoothstep(0.0, 0.12, vAge) * (1.0 - smoothstep(0.48, 1.0, vAge));',
        '  // Subtle flying soot/cinder flecks around outer plume',
        '  float cinder = kxStarLayer(p * 0.45 + vec2(vSeed * 7.1, -vAge * 0.8), 9.0, 0.18, kxTime * 2.4) * (1.0 - smoothstep(0.55, 0.98, r)) * (1.0 - vAge * 0.6);',
        '  float a = clamp(billow * life * kxOp * 0.72 + cinder * 0.55, 0.0, 0.96);',
        '  if(a < 0.008) discard;',
        '  vec3 col = mix(kxCore, kxMist, smoothstep(0.32, 0.95, vAge) * (0.38 + 0.62 * (1.0 - n)));',
        '  float ember = (1.0 - smoothstep(0.0, 0.32, vAge)) * (1.0 - smoothstep(0.0, 0.65, r)) * smoothstep(0.44, 0.80, n2);',
        '  col += kxEmber * (ember * 1.75 + cinder * 1.45 * (1.0 - vAge));',
        '  gl_FragColor = vec4(col, a);',
        '}'
      ].join('\n')
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 6;
    var holder = new THREE.Group();
    holder.add(mesh);
    return {
      holder: holder,
      mesh: mesh,
      boneName: spec.bone || 'Neck',
      offset: new THREE.Vector3().fromArray(spec.offset || [0, 0, 0])
    };
  }

  /* Extract rigid bone-local geometry for a `kinetic` sub-assembly (`orbit`, `bob`, `chorus_wave`, `crystal_float`) */
  function buildKineticSubmesh(m, z, byName, bones, uTime){
    var kin = z.kinetic;
    var bi = byName[kin.bone || 'Head'];
    if(bi === undefined || !bones[bi]) return null;
    var i0 = m.userData.index0;
    if(!i0) return null;
    var g = m.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
    var ibm = m.userData.ibm && m.userData.ibm[bi] ? m.userData.ibm[bi] : new THREE.Matrix4();
    var nrmMat = new THREE.Matrix3().getNormalMatrix(ibm);

    var start = Math.max(0, 3 * (z.t0 || 0)), end = Math.min(i0.length, 3 * (z.t1 || 0));
    if(end <= start) return null;

    var remap = new Map(), posArr = [], nrmArr = [], uvArr = [], newIdx = [];
    var vTmp = new THREE.Vector3(), nTmp = new THREE.Vector3();
    var minV = new THREE.Vector3(Infinity, Infinity, Infinity), maxV = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    for(var k = start; k < end; k++){
      var oldVi = i0[k], nv = remap.get(oldVi);
      if(nv === undefined){
        nv = posArr.length / 3;
        remap.set(oldVi, nv);
        vTmp.fromBufferAttribute(P, oldVi).applyMatrix4(ibm);
        posArr.push(vTmp.x, vTmp.y, vTmp.z);
        minV.min(vTmp); maxV.max(vTmp);
        if(N){
          nTmp.fromBufferAttribute(N, oldVi).applyMatrix3(nrmMat).normalize();
          nrmArr.push(nTmp.x, nTmp.y, nTmp.z);
        }
        if(U) uvArr.push(U.getX(oldVi), U.getY(oldVi));
      }
      newIdx.push(nv);
    }

    var pivotLocal = new THREE.Vector3();
    if(kin.center_gl){
      pivotLocal.fromArray(kin.center_gl).applyMatrix4(ibm);
    } else {
      pivotLocal.addVectors(minV, maxV).multiplyScalar(0.5);
    }
    for(var p = 0; p < posArr.length; p += 3){
      posArr[p]     -= pivotLocal.x;
      posArr[p + 1] -= pivotLocal.y;
      posArr[p + 2] -= pivotLocal.z;
    }

    var subGeo = new THREE.BufferGeometry();
    subGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    if(nrmArr.length) subGeo.setAttribute('normal', new THREE.Float32BufferAttribute(nrmArr, 3));
    if(uvArr.length) subGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    subGeo.setIndex(newIdx);
    subGeo.computeBoundingSphere();

    var localAxis = new THREE.Vector3(0, 1, 0);
    if(kin.axis_gl){
      localAxis.fromArray(kin.axis_gl).transformDirection(ibm).normalize();
    }
    var localUp = new THREE.Vector3(0, 1, 0).transformDirection(ibm).normalize();

    var subMat = makeZoneMaterial(m.material, z, uTime, false);
    var subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.frustumCulled = false;
    subMesh.castShadow = !subMat.transparent;
    if(subMat.transparent) subMesh.renderOrder = 3;

    var pivot = new THREE.Group();
    pivot.position.copy(pivotLocal);
    pivot.add(subMesh);
    bones[bi].add(pivot);

    return {
      pivot: pivot,
      mesh: subMesh,
      basePos: pivotLocal.clone(),
      axis: localAxis,
      upAxis: localUp,
      motion: kin.motion || 'bob',
      speed: kin.speed == null ? 1.4 : +kin.speed,
      amp: kin.amp == null ? 0.014 : +kin.amp,
      phase: kin.phase == null ? 0.0 : +kin.phase,
      precess: kin.precess == null ? 0.08 : +kin.precess
    };
  }

  /* Attach non-kinetic zone SkinnedMesh passes and carve triangles out of the host SkinnedMesh */
  function setupMeshVfx(fig, m, it, state){
    if(m.userData._kxSetup) return m.userData._kxSetup;
    var vfx = it && it.vfx;
    if(!vfx) return null;
    var i0 = m.userData.index0;
    var zones = vfx.zones || [];
    var kinetics = [], subSkinned = [];

    if(zones.length && i0){
      var nTris = Math.floor(i0.length / 3);
      var claimed = new Uint8Array(nTris);
      zones.forEach(function(z){
        var t0 = Math.max(0, z.t0 || 0), t1 = Math.min(nTris, z.t1 || 0);
        for(var t = t0; t < t1; t++) claimed[t] = 1;
        if(z.kinetic){
          var kn = buildKineticSubmesh(m, z, state.byName, fig.bones, state.uTime);
          if(kn) kinetics.push(kn);
        } else {
          var subIdx = [];
          for(var t2 = t0; t2 < t1; t2++) subIdx.push(i0[3 * t2], i0[3 * t2 + 1], i0[3 * t2 + 2]);
          if(!subIdx.length) return;
          var sGeo = new THREE.BufferGeometry();
          Object.keys(m.geometry.attributes).forEach(function(a){ sGeo.setAttribute(a, m.geometry.attributes[a]); });
          sGeo.setIndex(subIdx);
          var sMat = makeZoneMaterial(m.material, z, state.uTime, true);
          var sm = new THREE.SkinnedMesh(sGeo, sMat);
          sm.name = m.name + '|kx:' + (z.name || z.kind);
          sm.frustumCulled = false;
          sm.castShadow = !sMat.transparent;
          if(sMat.transparent) sm.renderOrder = z.kind === 'alpha_erosion' ? 2 : 3;
          sm.bind(m.skeleton, new THREE.Matrix4());
          sm.userData.kxSub = true;
          m.add(sm);
          subSkinned.push(sm);
        }
      });
      var remIdx = [];
      for(var tr = 0; tr < nTris; tr++){
        if(!claimed[tr]) remIdx.push(i0[3 * tr], i0[3 * tr + 1], i0[3 * tr + 2]);
      }
      m.userData._kxRemIdx = remIdx;
      m.geometry.setIndex(remIdx);
    }

    var emitters = (vfx.emitters || []).map(function(es){
      var em = buildSmokeEmitter(es, state.uTime);
      fig.group.add(em.holder);
      return em;
    });

    var rec = { mesh: m, item: it, kinetics: kinetics, subSkinned: subSkinned, emitters: emitters };
    m.userData._kxSetup = rec;
    state.entries.push(rec);
    return rec;
  }

  var tmpW = new THREE.Vector3(), tmpG = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion();

  function syncExtraplanar(fig){
    var state = fig._kxState;
    if(!state || !fig.kit || !fig.live) return;
    Object.keys(fig.live).forEach(function(id){
      var m = fig.live[id];
      var pt = m && m.userData && m.userData.part;
      if(!pt) return;
      var it = state.itemByKey[pt.key];
      if(it && it.vfx){
        var s = setupMeshVfx(fig, m, it, state);
        if(s && s.mesh.userData._kxRemIdx){
          // Keep non-claimed base triangles filtered even if filterArmourMods reset index0
          var curIdx = s.mesh.geometry.index;
          if(!curIdx || curIdx.count !== s.mesh.userData._kxRemIdx.length){
            s.mesh.geometry.setIndex(s.mesh.userData._kxRemIdx);
          }
        }
      }
    });
    updateExtraplanar(fig, 0);
  }

  function updateExtraplanar(fig, dt){
    var state = fig._kxState;
    if(!state) return;
    if(dt > 0) state.uTime.value += Math.min(dt, 0.1);
    var t = state.uTime.value;
    if(!state.entries.length) return;

    fig.group.updateMatrixWorld(true);
    tmpG.copy(fig.group.matrixWorld).invert();

    for(var i = 0; i < state.entries.length; i++){
      var e = state.entries[i];
      var on = !!(e.mesh && e.mesh.visible);
      for(var k = 0; k < e.kinetics.length; k++){
        var kn = e.kinetics[k];
        kn.pivot.visible = on;
        if(!on) continue;
        if(kn.motion === 'orbit'){
          tmpQ.setFromAxisAngle(kn.axis, t * kn.speed + kn.phase);
          if(kn.precess){
            tmpQ2.setFromAxisAngle(kn.upAxis, Math.sin(t * 0.9 + kn.phase) * kn.precess);
            tmpQ.premultiply(tmpQ2);
          }
          kn.mesh.quaternion.copy(tmpQ);
          kn.pivot.position.copy(kn.basePos).addScaledVector(kn.upAxis, Math.sin(t * 1.6 + kn.phase) * kn.amp);
        } else if(kn.motion === 'chorus_wave'){
          var w = Math.sin(t * kn.speed + kn.phase);
          kn.pivot.position.copy(kn.basePos).addScaledVector(kn.upAxis, w * kn.amp);
          kn.mesh.quaternion.setFromAxisAngle(kn.axis, Math.cos(t * kn.speed * 0.8 + kn.phase) * 0.085);
        } else if(kn.motion === 'crystal_float'){
          kn.pivot.position.copy(kn.basePos).addScaledVector(kn.upAxis, Math.sin(t * kn.speed + kn.phase) * kn.amp);
          kn.mesh.rotation.set(
            Math.sin(t * 1.1 + kn.phase) * 0.14,
            t * 0.65 * (kn.phase > 2.0 ? -1 : 1) + kn.phase,
            Math.cos(t * 0.9 + kn.phase) * 0.12
          );
        } else {
          // 'bob': gentle levitation + subtle celestial poise
          kn.pivot.position.copy(kn.basePos).addScaledVector(kn.upAxis, Math.sin(t * kn.speed + kn.phase) * kn.amp);
          kn.mesh.quaternion.setFromAxisAngle(kn.upAxis, Math.sin(t * 0.7 + kn.phase) * 0.08);
        }
      }
      for(var s = 0; s < e.emitters.length; s++){
        var em = e.emitters[s];
        em.holder.visible = on;
        if(!on) continue;
        var bi = state.byName[em.boneName];
        if(bi !== undefined && fig.bones[bi]){
          fig.bones[bi].getWorldPosition(tmpW);
          tmpW.applyMatrix4(tmpG).add(em.offset);
          em.holder.position.copy(tmpW);
        }
      }
    }

    // Post-clip procedural stance overlays:
    // 1. Digitigrade beast stance for Lizardmen & Coyote Men (raised hock, flexed knee, planted toes)
    var rec = fig.record || {};
    var mods = rec.mods || [];
    var isDigitigrade = (rec.people === 'lizardmen' || rec.people === 'coyote_men'
      || mods.indexOf('mod_head_lizard') >= 0 || mods.indexOf('mod_head_coyote') >= 0);
    if(isDigitigrade && fig.bones){
      var applyPitch = function(bname, rad){
        var idx = state.byName[bname];
        if(idx === undefined || !fig.bones[idx]) return;
        tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
        fig.bones[idx].quaternion.multiply(tmpQ);
      };
      applyPitch('LeftUpLeg',   -0.26); applyPitch('RightUpLeg',   -0.26);
      applyPitch('LeftLeg',      0.56); applyPitch('RightLeg',      0.56);
      applyPitch('LeftFoot',    -0.58); applyPitch('RightFoot',    -0.58);
      applyPitch('LeftToeBase',  0.30); applyPitch('RightToeBase',  0.30);
      var hiD = state.byName['Hips'];
      if(hiD !== undefined && fig.bones[hiD]){
        fig.bones[hiD].position.y -= 0.042;
      }
    }

    // 2. Ethereal hover/float locomotion for legless Extraplanar entities (censer_revenant, accretion_djinn, singularity_archon)
    var torsoId = (rec.armour && rec.armour.torso) || '';
    var isFloatEntity = (torsoId.indexOf('ext_') === 0 && (
      torsoId.indexOf('revenant') >= 0 || torsoId.indexOf('djinn') >= 0 || torsoId.indexOf('archon') >= 0
    ));
    if(isFloatEntity && fig.bones){
      var hiF = state.byName['Hips'];
      if(hiF !== undefined && fig.bones[hiF]){
        fig.bones[hiF].position.y += 0.085 + 0.042 * Math.sin(t * 2.4);
      }
      var spF = state.byName['Spine'];
      if(spF !== undefined && fig.bones[spF]){
        tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.065 + 0.025 * Math.sin(t * 1.8));
        fig.bones[spF].quaternion.multiply(tmpQ);
      }
      // Smoothly damp lower-leg marching so legless entities glide cleanly instead of striding
      ['LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg'].forEach(function(bn){
        var idx = state.byName[bn];
        if(idx !== undefined && fig.bones[idx]){
          fig.bones[idx].quaternion.slerp(new THREE.Quaternion(), 0.72);
        }
      });
    }
  }

  function attachExtraplanar(fig){
    var byName = {}, itemByKey = {};
    (fig.bones || []).forEach(function(b, i){ byName[b.name] = i; });
    ((fig.kit && fig.kit.items) || []).forEach(function(it){
      if(it && it.glb) itemByKey[KCHAR.key(it.glb)] = it;
    });
    fig._kxState = {
      uTime: { value: 0.0 },
      byName: byName,
      itemByKey: itemByKey,
      entries: []
    };
    var origApply = fig.apply;
    fig.apply = function(rec){
      return origApply.call(fig, rec).then(function(res){
        syncExtraplanar(fig);
        return res;
      });
    };
    var origUpdate = fig.update;
    fig.update = function(dt){
      origUpdate.call(fig, dt);
      updateExtraplanar(fig, dt);
    };
    var origDispose = fig.dispose;
    fig.dispose = function(){
      if(fig._kxState){
        fig._kxState.entries.forEach(function(e){
          e.kinetics.forEach(function(kn){ if(kn.pivot.parent) kn.pivot.parent.remove(kn.pivot); });
          e.emitters.forEach(function(em){ if(em.holder.parent) em.holder.parent.remove(em.holder); });
        });
        fig._kxState.entries = [];
      }
      return origDispose.call(fig);
    };
  }

  var _OrigKCharFigure = KCharFigure;
  KCharFigure = new Proxy(_OrigKCharFigure, {
    construct: function(Target, args, newTarget){
      var fig = Reflect.construct(Target, args, newTarget);
      attachExtraplanar(fig);
      return fig;
    }
  });
  KCharFigure._extraplanarWrapped = true;
})();
