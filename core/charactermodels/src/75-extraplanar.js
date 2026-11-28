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
  function makeZoneMaterial(srcMat, z, uTime, skinned, uPower){
    var kind = z.kind || 'standard';
    var prevHook = skinned && srcMat && srcMat.hasOwnProperty('onBeforeCompile') ? srcMat.onBeforeCompile : null;
    var pwrUniform = uPower || { value: 0.0 };

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
        sh.uniforms.kxPower = pwrUniform;
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
          'uniform float kxTime, kxPower, kxCenterY, kxScale, kxMirror;\nuniform vec3 kxCore, kxArm1, kxArm2, kxGold, kxVoid;\n' +
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
            '\t// Tilted swirling spiral galaxy core (accelerates & brightens during power surge)',
            '\tfloat ca = cos(0.32), sa = sin(0.32);',
            '\tvec2 gp = mat2(ca, -sa, sa, ca) * (pDeep * kxScale * (1.0 - 0.16 * kxPower));',
            '\tgp.y *= 1.32;',
            '\tfloat r = length(gp);',
            '\tfloat th = atan(gp.y, gp.x) - kxTime * (0.38 + 0.65 * kxPower);',
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
            '\tcol += kxArm1 * armMask1 * (1.45 + 0.7 * neb1) * (1.0 + 0.55 * kxPower);',
            '\tcol += mix(kxGold, kxArm1, 0.5) * armMask2 * 1.05 * (1.0 + 0.45 * kxPower);',
            '\tcol += mix(kxGold, kxCore, smoothstep(0.25, 0.95, bulge)) * bulge * (1.55 + 0.95 * kxPower);',
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
            '\tif(kxConst > 1.5){',
            '\t  float texLum = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));',
            '\t  baseOut = mix(mix(gl_FragColor.rgb * 0.85, kxCore, 0.55), vec3(1.05, 1.08, 1.15), smoothstep(0.26, 0.62, texLum));',
            '\t}',
            '\tif(kxConst > 0.01){',
            '\t  vec2 cp = vec2(atan(vKxFig.x, vKxFig.z) * 2.4, vKxFig.y * 7.5);',
            '\t  float swirlLine = 1.0 - smoothstep(0.035, 0.095, abs(sin(cp.x * 3.0 + kxFbm2(cp * 1.4) * 4.2)));',
            '\t  float stars = kxStarLayer(cp, 3.2, 0.28, kxTime);',
            '\t  float cAmt = min(kxConst, 1.0);',
            '\t  baseOut += (kxAcc * swirlLine * 0.55 + kxRim * stars * 1.35) * cAmt;',
            '\t}',
            '\tvec3 finalRgb = baseOut + rimC * fres * kxGain * shimmer;',
            '\tfloat finalA = clamp(mix(kxOp, min(1.0, kxOp + 0.52), fres), 0.08, 0.99) * opacity;',
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
            '\t  gl_FragColor = vec4(baseC, clamp(alphaE, 0.0, 1.0) * opacity);',
            '\t} else {',
            '\t  gl_FragColor.a *= opacity;',
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
            '\tgl_FragColor = vec4(gl_FragColor.rgb * 0.82 + glow, opacity);',
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
            '\tgl_FragColor = vec4(mix(gl_FragColor.rgb, kxCol, 0.78) * kxGain * p, opacity);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matB.customProgramCacheKey = function(){ return 'kx-blaze-' + (skinned ? 'sk' : 'rg'); };
      return matB;
    }

    if(kind === 'neutrino_phase'){
      var cNuCore = colOf(z.core_color, '#061538');
      var cNuCher = colOf(z.cherenkov_color, '#38f6ff');
      var cNuMuon = colOf(z.muon_color, '#2068ff');
      var cNuTau  = colOf(z.tau_color, '#b04cff');
      var nuOp    = z.opacity == null ? 0.56 : +z.opacity;
      var nuPow   = z.power == null ? 2.05 : +z.power;
      var nuGain  = z.rim_gain == null ? 2.35 : +z.rim_gain;
      var matNP = new THREE.MeshStandardMaterial({
        map: srcMat ? srcMat.map : null,
        color: 0xffffff,
        roughness: 0.16,
        metalness: 0.20,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        skinning: !!skinned
      });
      if(!matNP.map) matNP.defines = { USE_UV: '' };
      matNP.onBeforeCompile = function(sh, r){
        if(prevHook) prevHook(sh, r);
        sh.uniforms.kxTime = uTime;
        sh.uniforms.kxCore = { value: cNuCore };
        sh.uniforms.kxCher = { value: cNuCher };
        sh.uniforms.kxMuon = { value: cNuMuon };
        sh.uniforms.kxTau  = { value: cNuTau };
        sh.uniforms.kxOp   = { value: nuOp };
        sh.uniforms.kxPow  = { value: nuPow };
        sh.uniforms.kxGain = { value: nuGain };
        sh.vertexShader = 'varying vec3 vKxFig;\n' +
          sh.vertexShader.replace('#include <project_vertex>', '\tvKxFig = transformed;\n#include <project_vertex>');
        sh.fragmentShader = 'varying vec3 vKxFig;\nuniform float kxTime, kxOp, kxPow, kxGain;\n' +
          'uniform vec3 kxCore, kxCher, kxMuon, kxTau;\n' + GLSL_NOISE +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tvec3 Vf = normalize(vViewPosition);',
            '\tvec3 Nf = normalize(normal) * (gl_FrontFacing ? 1.0 : -1.0);',
            '\tfloat ndv = clamp(abs(dot(Nf, Vf)), 0.0, 1.0);',
            '\tfloat fres = pow(1.0 - ndv, kxPow);',
            '\t// 3-flavor quantum oscillation wave interference (nu_e <-> nu_mu <-> nu_tau)',
            '\tfloat az = atan(vKxFig.x, vKxFig.z);',
            '\tfloat wE  = 0.5 + 0.5 * sin(vKxFig.y * 14.0 - kxTime * 3.8 + az * 2.0);',
            '\tfloat wMu = 0.5 + 0.5 * sin(vKxFig.y * 19.5 - kxTime * 5.1 - az * 3.0 + 2.094);',
            '\tfloat wTa = 0.5 + 0.5 * sin(vKxFig.y * 11.0 + kxTime * 2.9 + kxFbm2(vec2(az * 2.2, vKxFig.y * 5.5 - kxTime * 0.9)) * 4.2);',
            '\tvec3 flavorC = normalize(vec3(0.001) + kxCher * (0.45 + wE) + kxMuon * (0.35 + wMu) + kxTau * (0.35 * wTa * wTa));',
            '\tflavorC *= (0.85 + 0.55 * wE);',
            '\t// Relativistic ballistic neutrino/lepton ionization tracks streaming through volume',
            '\tvec2 trkUv = vec2(az * 7.64, vKxFig.y * 3.4 - kxTime * 3.6);',
            '\tfloat trkId = floor(trkUv.x);',
            '\tfloat trkH = kxHash12(vec2(trkId, floor(trkUv.y)));',
            '\tfloat trkX = abs(fract(trkUv.x) - (0.2 + 0.6 * fract(trkH * 17.3)));',
            '\tfloat trkY = smoothstep(0.95, 0.15, fract(trkUv.y + fract(trkH * 31.7)));',
            '\tfloat streak = (trkH > 0.58 ? exp(-trkX * 36.0) * trkY : 0.0);',
            '\tfloat vertexSpark = kxStarLayer(vec2(az * 2.2, vKxFig.y * 6.0 - kxTime * 0.5), 4.0, 0.30, kxTime * 3.2);',
            '\t// Quantum tunneling phase-band modulation',
            '\tfloat tunnel = 0.72 + 0.28 * sin(vKxFig.y * 24.0 - kxTime * 6.2 + kxNoise2(vec2(az * 3.0, kxTime * 1.8)) * 3.5);',
            '\tvec3 bodyRgb = mix(gl_FragColor.rgb * 0.30, kxCore, 0.76) + flavorC * 0.32 + kxCher * (streak * 1.85 + vertexSpark * 1.55);',
            '\tvec3 rimRgb = mix(kxCher, flavorC, 0.38) * fres * kxGain * (0.88 + 0.22 * wE);',
            '\tfloat alphaOut = clamp(mix(kxOp * tunnel, min(0.98, kxOp + 0.54), fres) + streak * 0.35, 0.12, 0.98);',
            '\tgl_FragColor = vec4(bodyRgb + rimRgb, alphaOut);',
            '#include <dithering_fragment>'
          ].join('\n'));
      };
      matNP.customProgramCacheKey = function(){ return 'kx-neutrino-' + (skinned ? 'sk' : 'rg'); };
      return matNP;
    }

    if(kind === 'light_array'){
      var cLaCore = colOf(z.core_color, '#eaffff');
      var cLaPri  = colOf(z.primary_color, '#3cf6ff');
      var cLaSec  = colOf(z.secondary_color, '#2874ff');
      var cLaAcc  = colOf(z.accent_color, '#b458ff');
      var laScale = z.halo_scale == null ? 0.64 : +z.halo_scale;
      var laSpin  = z.spin == null ? 1.0 : +z.spin;
      var laZOff  = z.z_offset == null ? -0.18 : +z.z_offset;
      var laGain  = z.gain == null ? 1.75 : +z.gain;
      var laV0    = z.v0 == null ? 0.0 : +z.v0;
      var laV1    = z.v1 == null ? 1.0 : +z.v1;
      var matLA = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendSrcAlpha: THREE.ZeroFactor,
        blendDstAlpha: THREE.OneFactor,
        side: THREE.DoubleSide,
        uniforms: {
          kxTime:  uTime,
          kxCore:  { value: cLaCore },
          kxPri:   { value: cLaPri },
          kxSec:   { value: cLaSec },
          kxAcc:   { value: cLaAcc },
          kxScale: { value: laScale },
          kxSpin:  { value: laSpin },
          kxZOff:  { value: laZOff },
          kxGain:  { value: laGain },
          kxV0:    { value: laV0 },
          kxV1:    { value: laV1 }
        },
        vertexShader: [
          'uniform float kxScale, kxZOff, kxV0, kxV1;',
          'varying vec2 vLaUv;',
          'void main(){',
          '  vec2 uvN = vec2(uv.x, clamp((uv.y - kxV0) / max(kxV1 - kxV0, 1e-4), 0.0, 1.0));',
          '  vLaUv = uvN;',
          '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
          '  vec2 p2 = (uvN - 0.5) * 2.0 * kxScale;',
          '  mvOrigin.xy += p2;',
          '  mvOrigin.z += kxZOff;',
          '  gl_Position = projectionMatrix * mvOrigin;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform float kxTime, kxSpin, kxGain;',
          'uniform vec3 kxCore, kxPri, kxSec, kxAcc;',
          'varying vec2 vLaUv;',
          'void main(){',
          '  vec2 p = (vLaUv - 0.5) * 2.0;',
          '  float r = length(p);',
          '  if(r > 1.0 || r < 0.24) discard;',
          '  float ang = atan(p.y, p.x);',
          '  float pulse = 0.5 + 0.5 * sin(kxTime * 3.4 + kxSpin * 1.1);',
          '  float rB = r / (0.955 + 0.045 * pulse);',
          '  // 1. Inner rotating ring of 24 pulsing photonic star-nodes',
          '  float a1 = ang - kxTime * 0.72 * kxSpin;',
          '  float n1 = 24.0;',
          '  float idx1 = floor(a1 * n1 / 6.2831853);',
          '  float sec1 = (fract(a1 * n1 / 6.2831853 + 0.5) - 0.5) * (6.2831853 / n1) * rB;',
          '  float dBead1 = length(vec2(sec1, rB - 0.50));',
          '  float wv1 = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(idx1 * 0.7854 - kxTime * 5.4), 2.0);',
          '  float beads1 = (exp(-dBead1 * 105.0) * 2.1 + exp(-dBead1 * 28.0) * 0.42) * wv1;',
          '  // 2. Counter-rotating segmented interferometer light-arcs & 48 vernier ticks',
          '  float a2 = ang + kxTime * 0.52 * kxSpin;',
          '  float arcSeg = smoothstep(0.05, 0.28, sin(a2 * 8.0));',
          '  float arcs = exp(-abs(rB - 0.63) * 115.0) * arcSeg * (0.75 + 0.45 * pulse);',
          '  float ticks = exp(-abs(rB - 0.58) * 85.0) * pow(max(0.0, cos(a2 * 48.0)), 20.0) * (0.55 + 0.45 * pulse);',
          '  // 3. Outer rotating ring of 16 harmonic beacon nodes + pulsing wave-outline',
          '  float a3 = ang - kxTime * 0.42 * kxSpin;',
          '  float n3 = 16.0;',
          '  float idx3 = floor(a3 * n3 / 6.2831853);',
          '  float sec3 = (fract(a3 * n3 / 6.2831853 + 0.5) - 0.5) * (6.2831853 / n3) * rB;',
          '  float dBead3 = length(vec2(sec3, rB - 0.76));',
          '  float wv3 = 0.40 + 0.60 * pow(0.5 + 0.5 * cos(idx3 * 1.178 - kxTime * 4.2), 2.0);',
          '  float beads3 = (exp(-dBead3 * 95.0) * 1.75 + exp(-dBead3 * 26.0) * 0.38) * wv3;',
          '  float rimWave = exp(-abs(rB - (0.76 + 0.016 * sin(ang * 8.0 + kxTime * 4.0 * kxSpin))) * 110.0) * (0.45 + 0.40 * sin(ang * 4.0 - kxTime * 3.6));',
          '  // 4. Pulsing radial array of 32 fine Cherenkov light-lances & 8 harmonic pillars',
          '  float lenMod = 0.84 + 0.11 * sin(a3 * 4.0 + kxTime * 4.4);',
          '  float envR = smoothstep(0.44, 0.54, rB) * (1.0 - smoothstep(lenMod - 0.14, lenMod, rB));',
          '  float fineRays = exp(-abs(sin(a3 * 16.0)) * 46.0 * rB) * envR * (0.55 + 0.45 * wv3);',
          '  float mainRays = exp(-abs(sin(a2 * 4.0)) * 62.0 * rB) * smoothstep(0.40, 0.52, rB) * (1.0 - smoothstep(0.82, 0.97, rB)) * (0.65 + 0.55 * pulse);',
          '  // Combine photonic light channels with smooth inner/outer fade (zero polygon boundary)',
          '  float edgeFade = smoothstep(0.26, 0.42, r) * (1.0 - smoothstep(0.88, 0.99, r));',
          '  float softHalo = exp(-pow((rB - 0.63) * 6.5, 2.0)) * 0.14 * (0.7 + 0.3 * pulse);',
          '  vec3 col = kxPri * (arcs * 1.15 + ticks * 0.95 + fineRays * 1.05 + softHalo)',
          '           + kxSec * (rimWave * 1.10 + softHalo * 0.85)',
          '           + kxAcc * (beads3 * 0.55 + rimWave * 0.45 * (0.5 + 0.5 * sin(ang * 3.0 + kxTime * 2.5)))',
          '           + kxCore * (beads1 * 1.10 + beads3 * 0.85 + mainRays * 1.15);',
          '  col *= edgeFade * kxGain;',
          '  float lum = max(col.r, max(col.g, col.b));',
          '  if(lum < 0.004) discard;',
          '  gl_FragColor = vec4(col, clamp(lum, 0.0, 1.0));',
          '}'
        ].join('\n')
      });
      return matLA;
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

  /* ---- Shared Blending Helpers & Procedural 3D Aura / Trail Builders (`it.vfx.auras[]`) ----
     1. `rainbow_aura`   (Prism Matriarch): full-spectrum rainbow dispersion corona, stained-glass caustics & prism motes
     2. `seraph_glyphs`  (Ophanim Seraph): divine solar-gold halo + 36 orbiting sacred celestial glyphs fading in & out
     3. `shifting_masks` (Chorus of Seven Masks): 16 translucent, expression-morphing Noh/Oni/Kitsune apparition masks
     4. `gravity_lens`   (Singularity Archon): Schwarzschild shadow, warped Einstein-arc starlight & chromatic photon ring
                         that dynamically expands and intensifies with power use (`uPower` / `fig.triggerExtraplanarSurge`)
     5. `chrono_trail`   (Clockwork Aeon): 4 world-space skinned-pose holographic time-echo clones + trailing clockwork gears
     6. `brimstone_aura` (Ashen Calamity): roaring crimson-red brimstone flame corona, rising hellfire cinders & magma ring
  */
  var GLSL_GLYPH_AND_MASK = [
    'float kxSeg(vec2 p, vec2 a, vec2 b){',
    '  vec2 pa = p - a, ba = b - a;',
    '  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);',
    '  return length(pa - ba * h);',
    '}',
    'float kxRing(vec2 p, float r){ return abs(length(p) - r); }',
    'float kxSacredGlyph(vec2 p, float gid){',
    '  float d = 10.0;',
    '  vec2 ap = vec2(abs(p.x), p.y);',
    '  if(gid < 1.0){',
    '    // 0: Winged Solar Eye of the Ophanim',
    '    float lid = abs(abs(p.y) - max(0.0, 0.28 - p.x * p.x * 1.15));',
    '    d = min(lid, kxRing(p, 0.14));',
    '    d = min(d, length(p) - 0.045);',
    '    d = min(d, kxSeg(ap, vec2(0.32, 0.06), vec2(0.68, 0.24)));',
    '    d = min(d, kxSeg(ap, vec2(0.30, -0.05), vec2(0.64, -0.18)));',
    '  } else if(gid < 2.0){',
    '    // 1: Nested Celestial Hexagram Seal',
    '    for(int k = 0; k < 2; k++){',
    '      float s = k == 0 ? 1.0 : -1.0;',
    '      vec2 v0 = vec2(0.0, 0.56 * s), v1 = vec2(0.485, -0.28 * s), v2 = vec2(-0.485, -0.28 * s);',
    '      d = min(d, min(kxSeg(p, v0, v1), min(kxSeg(p, v1, v2), kxSeg(p, v2, v0))));',
    '    }',
    '    d = min(d, kxRing(p, 0.62));',
    '  } else if(gid < 3.0){',
    '    // 2: Intersecting Ophanim Wheel-Cross',
    '    d = min(kxRing(p, 0.56), kxRing(p, 0.32));',
    '    d = min(d, min(kxSeg(p, vec2(-0.66, 0.0), vec2(0.66, 0.0)), kxSeg(p, vec2(0.0, -0.66), vec2(0.0, 0.66))));',
    '    d = min(d, abs(abs(p.x) + abs(p.y) - 0.22));',
    '  } else if(gid < 4.0){',
    '    // 3: Sacred Tri-Arc Pillar & Crown',
    '    d = min(d, kxSeg(p, vec2(0.0, -0.64), vec2(0.0, 0.64)));',
    '    d = min(d, kxRing(p - vec2(0.0, 0.22), 0.26));',
    '    d = min(d, kxRing(ap - vec2(0.22, -0.14), 0.24));',
    '  } else if(gid < 5.0){',
    '    // 4: Enochian Angular Celestial Rune',
    '    d = min(d, kxSeg(p, vec2(-0.36, -0.56), vec2(-0.36, 0.52)));',
    '    d = min(d, kxSeg(p, vec2(-0.36, 0.52), vec2(0.38, 0.52)));',
    '    d = min(d, kxSeg(p, vec2(0.38, 0.52), vec2(-0.12, 0.02)));',
    '    d = min(d, kxSeg(p, vec2(-0.12, 0.02), vec2(0.42, -0.54)));',
    '    d = min(d, length(p - vec2(0.24, 0.16)) - 0.055);',
    '  } else if(gid < 6.0){',
    '    // 5: Eight-Pointed Melkizedek Stargram',
    '    d = min(d, max(abs(p.x), abs(p.y)) - 0.42);',
    '    d = abs(d);',
    '    d = min(d, abs((abs(p.x) + abs(p.y)) * 0.7071 - 0.42));',
    '    d = min(d, kxRing(p, 0.16));',
    '  } else if(gid < 7.0){',
    '    // 6: Solar Crescent & Seraphic Spire',
    '    float c1 = kxRing(p - vec2(0.0, -0.06), 0.46);',
    '    float c2 = kxRing(p - vec2(0.0, 0.12), 0.36);',
    '    d = min(c1, c2);',
    '    d = min(d, kxSeg(p, vec2(0.0, -0.58), vec2(0.0, 0.62)));',
    '    d = min(d, kxSeg(ap, vec2(0.0, 0.42), vec2(0.26, 0.20)));',
    '  } else {',
    '    // 7: Vertical Sacred Script Cartouche',
    '    d = min(d, kxRing(vec2(p.x * 1.45, p.y * 0.82), 0.56));',
    '    d = min(d, kxSeg(p, vec2(-0.22, 0.32), vec2(0.22, 0.32)));',
    '    d = min(d, kxSeg(p, vec2(0.0, 0.32), vec2(0.0, -0.04)));',
    '    d = min(d, kxRing(p - vec2(0.0, -0.26), 0.14));',
    '  }',
    '  float stroke = smoothstep(0.052, 0.012, d);',
    '  float glow   = exp(-max(d, 0.0) * 8.5) * 0.58;',
    '  return stroke + glow;',
    '}'
  ].join('\n') + '\n';

  function makePureLightMaterial(uniforms, vs, fs){
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
      side: THREE.DoubleSide,
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs
    });
  }

  function makePremultOverMaterial(uniforms, vs, fs){
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      side: THREE.DoubleSide,
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs
    });
  }

  function makeBillboardCloudGeo(count, makeQuadData){
    var pos = new Float32Array(count * 4 * 3);
    var uv  = new Float32Array(count * 4 * 2);
    var a0  = new Float32Array(count * 4 * 4);
    var a1  = new Float32Array(count * 4 * 4);
    var idx = new Uint16Array(count * 6);
    var corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for(var i = 0; i < count; i++){
      var qd = makeQuadData(i, count);
      for(var c = 0; c < 4; c++){
        var v = i * 4 + c;
        pos[3 * v] = qd.p ? qd.p[0] : 0;
        pos[3 * v + 1] = qd.p ? qd.p[1] : 0;
        pos[3 * v + 2] = qd.p ? qd.p[2] : 0;
        uv[2 * v] = corners[c][0];
        uv[2 * v + 1] = corners[c][1];
        a0[4 * v] = qd.a[0]; a0[4 * v + 1] = qd.a[1]; a0[4 * v + 2] = qd.a[2]; a0[4 * v + 3] = qd.a[3];
        a1[4 * v] = qd.b[0]; a1[4 * v + 1] = qd.b[1]; a1[4 * v + 2] = qd.b[2]; a1[4 * v + 3] = qd.b[3];
      }
      idx[6 * i] = i * 4; idx[6 * i + 1] = i * 4 + 1; idx[6 * i + 2] = i * 4 + 2;
      idx[6 * i + 3] = i * 4; idx[6 * i + 4] = i * 4 + 2; idx[6 * i + 5] = i * 4 + 3;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aAura0', new THREE.BufferAttribute(a0, 4));
    geo.setAttribute('aAura1', new THREE.BufferAttribute(a1, 4));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    return geo;
  }

  function makeBackdropDiscGeo(radius){
    var geo = new THREE.PlaneGeometry(radius * 2.0, radius * 2.0, 1, 1);
    return geo;
  }

  var VS_VIEW_HALO = [
    'uniform float kxScale, kxZOff;',
    'varying vec2 vUvA;',
    'void main(){',
    '  vUvA = uv;',
    '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
    '  mvOrigin.xy += (uv - 0.5) * 2.0 * kxScale;',
    '  mvOrigin.z += kxZOff;',
    '  gl_Position = projectionMatrix * mvOrigin;',
    '}'
  ].join('\n');

  function buildAuraSystem(spec, state){
    var kind = spec.kind;
    var holder = new THREE.Group();
    var boneName = spec.bone || 'Spine1';
    var offset = new THREE.Vector3().fromArray(spec.offset || [0, 0, 0]);

    var groundMeshRef = null;
    if(kind === 'rainbow_aura'){
      // 1a. View-aligned full-spectrum Rainbow Dispersion & Stained-Glass Caustic Corona
      var haloMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxScale: { value: spec.scale == null ? 1.12 : +spec.scale },
        kxZOff: { value: -0.14 },
        kxGain: { value: spec.gain == null ? 1.35 : +spec.gain }
      }, VS_VIEW_HALO, [
        'uniform float kxTime, kxGain;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'vec3 kxSpectrum(float h){ return 0.54 + 0.46 * cos(6.2831853 * (h + vec3(0.0, 0.3333, 0.6667))); }',
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  p.y *= 0.84;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  float n = kxFbm2(p * 2.6 + vec2(kxTime * 0.22, -kxTime * 0.34));',
        '  float hue = fract(ang / 6.2831853 - kxTime * 0.20 + r * 0.75 + (n - 0.5) * 0.35);',
        '  vec3 spec = kxSpectrum(hue);',
        '  vec3 spec2 = kxSpectrum(hue + 0.18);',
        '  // Soft multi-band rainbow corona + 14 stained-glass prismatic God-rays + interference rings',
        '  float rays = pow(0.5 + 0.5 * sin(ang * 14.0 - kxTime * 1.35 + n * 3.2), 3.0) * smoothstep(0.18, 0.44, r) * (1.0 - smoothstep(0.55, 0.98, r));',
        '  float rings = (exp(-abs(r - 0.46 - 0.04 * sin(kxTime * 2.2 + ang * 3.0)) * 24.0) * 0.55',
        '               + exp(-abs(r - 0.68 + 0.03 * cos(kxTime * 1.8 - ang * 4.0)) * 18.0) * 0.42);',
        '  float veil = smoothstep(0.12, 0.38, r) * pow(max(0.0, 1.0 - r), 1.65) * (0.52 + 0.48 * n);',
        '  vec3 col = (spec * (veil * 0.72 + rays * 0.92) + spec2 * rings + vec3(1.0, 0.98, 0.95) * (rays * 0.22)) * kxGain;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var haloMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), haloMat);
      haloMesh.frustumCulled = false; haloMesh.renderOrder = 2;
      holder.add(haloMesh);

      // 1b. 28 3D-orbiting spectral prism shards & rainbow wisp ribbons wrapping front & sides
      var wispGeo = makeBillboardCloudGeo(28, function(i, n){
        var frac = i / n;
        var rad = 0.34 + 0.36 * ((i * 0.618034) % 1.0);
        var y0 = -0.68 + 1.48 * ((i * 0.381966) % 1.0);
        var sz = 0.18 + 0.14 * ((i * 0.754877) % 1.0);
        var spd = (i % 2 === 0 ? 1.0 : -1.0) * (0.55 + 0.45 * ((i * 0.29) % 1.0));
        return { a: [frac * 6.2831853, rad, y0, sz], b: [spd, frac, 0, 0] };
      });
      var wispMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxGain: { value: 1.20 }
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvW;',
        'varying float vHue, vLife;',
        'void main(){',
        '  float life = fract(aAura1.y + kxTime * 0.28);',
        '  float ang = aAura0.x + kxTime * aAura1.x;',
        '  float rad = aAura0.y * (0.90 + 0.20 * sin(kxTime * 1.7 + aAura0.x));',
        '  vec3 cPos = vec3(cos(ang) * rad, aAura0.z + life * 0.38 - 0.19, sin(ang) * rad);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  float rot = kxTime * 0.8 * sign(aAura1.x) + aAura0.x;',
        '  vec2 c = (uv - 0.5) * aAura0.w * vec2(0.72, 1.45);',
        '  mv.xy += mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * c;',
        '  vUvW = uv;',
        '  vHue = fract(aAura1.y + kxTime * 0.24 + life * 0.35);',
        '  vLife = sin(life * 3.14159265);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxGain;',
        'varying vec2 vUvW;',
        'varying float vHue, vLife;',
        'void main(){',
        '  vec2 p = (vUvW - 0.5) * 2.0;',
        '  float d = abs(p.x) * 1.35 + abs(p.y) * 0.85;',
        '  float diamond = smoothstep(0.95, 0.08, d);',
        '  float core = exp(-length(p) * 5.0);',
        '  vec3 spec = 0.54 + 0.46 * cos(6.2831853 * (vHue + p.y * 0.25 + vec3(0.0, 0.3333, 0.6667)));',
        '  vec3 col = (spec * diamond * 0.72 + vec3(1.0) * core * 0.42) * vLife * kxGain;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var wispMesh = new THREE.Mesh(wispGeo, wispMat);
      wispMesh.frustumCulled = false; wispMesh.renderOrder = 5;
      holder.add(wispMesh);

    } else if(kind === 'seraph_glyphs'){
      // 2a. Divine Solar-Gold Halo Corona (restrained inner core so Seraph's white-gold wings stay crisp)
      var goldHaloMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxScale: { value: spec.scale == null ? 1.12 : +spec.scale },
        kxZOff: { value: -0.15 },
        kxGain: { value: spec.gain == null ? 1.05 : +spec.gain * 0.78 }
      }, VS_VIEW_HALO, [
        'uniform float kxTime, kxGain;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  float pulse = 0.86 + 0.14 * sin(kxTime * 2.4);',
        '  float corona = smoothstep(0.24, 0.46, r) * pow(max(0.0, 1.0 - r), 2.1) * pulse;',
        '  float ring1 = exp(-abs(r - 0.56) * 62.0) * (0.45 + 0.55 * smoothstep(0.1, 0.6, sin(ang * 12.0 + kxTime * 0.9)));',
        '  float ring2 = exp(-abs(r - 0.78) * 70.0) * (0.40 + 0.60 * smoothstep(0.1, 0.6, cos(ang * 18.0 - kxTime * 0.7)));',
        '  float rays = pow(0.5 + 0.5 * cos(ang * 8.0 - kxTime * 0.5), 7.0) * smoothstep(0.32, 0.50, r) * (1.0 - smoothstep(0.66, 0.98, r));',
        '  vec3 cGold = vec3(1.0, 0.72, 0.12);',
        '  vec3 cCore = vec3(1.0, 0.93, 0.62);',
        '  vec3 col = (cGold * (corona * 0.42 + rays * 0.46) + cCore * (ring1 * 0.72 + ring2 * 0.58)) * kxGain;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var goldHalo = new THREE.Mesh(makeBackdropDiscGeo(1.0), goldHaloMat);
      goldHalo.frustumCulled = false; goldHalo.renderOrder = 2;
      holder.add(goldHalo);

      // 2b. 36 Orbiting Celestial Sacred Glyphs that smoothly fade in and out
      var glyphGeo = makeBillboardCloudGeo(36, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var gid = i % 8;
        var rad = 0.46 + 0.46 * ((i * 0.381966) % 1.0);
        var y0 = -0.56 + 1.44 * ((i * 0.7548776) % 1.0);
        var sz = 0.145 + 0.075 * ((i * 0.56984) % 1.0);
        var rate = 0.18 + 0.14 * seed;
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [gid, seed, rate, (i % 2 === 0 ? 1.0 : -1.0) * 0.28] };
      });
      var glyphMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxGain: { value: 1.28 }
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvG;',
        'varying float vGid, vFade;',
        'void main(){',
        '  float phase = fract(aAura1.y + kxTime * aAura1.z);',
        '  // Smooth fade-in, luminous sustain, smooth fade-out',
        '  float fade = smoothstep(0.0, 0.28, phase) * (1.0 - smoothstep(0.58, 1.0, phase));',
        '  float ang = aAura0.x + kxTime * aAura1.w;',
        '  vec3 cPos = vec3(cos(ang) * aAura0.y, aAura0.z + phase * 0.20 - 0.10, sin(ang) * aAura0.y);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  float scale = aAura0.w * (0.86 + 0.22 * sin(phase * 3.14159265));',
        '  mv.xy += (uv - 0.5) * 2.0 * scale;',
        '  vUvG = uv;',
        '  vGid = aAura1.x;',
        '  vFade = fade;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxGain;',
        'varying vec2 vUvG;',
        'varying float vGid, vFade;',
        GLSL_GLYPH_AND_MASK,
        'void main(){',
        '  if(vFade < 0.01) discard;',
        '  vec2 p = (vUvG - 0.5) * 2.0;',
        '  if(length(p) > 1.0) discard;',
        '  float g = kxSacredGlyph(p, vGid);',
        '  float softHalo = exp(-length(p) * 3.8) * 0.045;',
        '  vec3 cGold = vec3(1.0, 0.72, 0.10);',
        '  vec3 cWhiteGold = vec3(1.0, 0.94, 0.70);',
        '  vec3 col = (mix(cGold, cWhiteGold, clamp(g * 0.65, 0.0, 1.0)) * g + cGold * softHalo) * vFade * kxGain;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var glyphMesh = new THREE.Mesh(glyphGeo, glyphMat);
      glyphMesh.frustumCulled = false; glyphMesh.renderOrder = 5;
      holder.add(glyphMesh);

    } else if(kind === 'shifting_masks'){
      // 3. Chorus of Seven Masks: 16 orbiting, shifting translucent Noh/Oni/Kitsune apparition masks
      var maskGeo = makeBillboardCloudGeo(16, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var rad = 0.42 + 0.36 * ((i * 0.381966) % 1.0);
        var y0 = -0.38 + 1.18 * ((i * 0.7548776) % 1.0);
        var sz = 0.145 + 0.055 * ((i * 0.56984) % 1.0);
        var spd = (i % 2 === 0 ? 1.0 : -1.0) * (0.30 + 0.20 * seed);
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.14 + 0.10 * seed, spd, i % 3] };
      });
      var maskMat = makePremultOverMaterial({
        kxTime: state.uTime
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvM;',
        'varying float vSeed, vFade, vPal;',
        'void main(){',
        '  float phase = fract(aAura1.x + kxTime * aAura1.y);',
        '  float fade = smoothstep(0.0, 0.24, phase) * (1.0 - smoothstep(0.68, 1.0, phase));',
        '  float ang = aAura0.x + kxTime * aAura1.z;',
        '  float bob = sin(kxTime * 1.8 + aAura0.x * 2.0) * 0.05;',
        '  vec3 cPos = vec3(cos(ang) * aAura0.y, aAura0.z + bob + (phase - 0.5) * 0.14, sin(ang) * aAura0.y);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  float tilt = sin(kxTime * 1.4 + aAura1.x * 12.0) * 0.16;',
        '  vec2 corner = (uv - 0.5) * 2.0 * aAura0.w;',
        '  mv.xy += mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * corner;',
        '  vUvM = uv;',
        '  vSeed = aAura1.x;',
        '  vFade = fade;',
        '  vPal = aAura1.w;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvM;',
        'varying float vSeed, vFade, vPal;',
        GLSL_NOISE,
        'void main(){',
        '  if(vFade < 0.01) discard;',
        '  vec2 p = (vUvM - 0.5) * 2.0;',
        '  // Tapered Noh/Oni ovoid mask silhouette',
        '  float taper = 1.0 + 0.28 * (-p.y) + 0.14 * max(0.0, -p.y);',
        '  vec2 mp = vec2(p.x * taper * 1.18, p.y * 0.96);',
        '  float r2 = dot(mp, mp);',
        '  // Optional Oni horns morphing in with expression state',
        '  float morphT = 0.5 + 0.5 * sin(kxTime * 0.95 + vSeed * 18.85);',
        '  float morphU = 0.5 + 0.5 * cos(kxTime * 0.67 + vSeed * 9.42);',
        '  vec2 hp = vec2(abs(p.x) - 0.44 - (p.y - 0.55) * 0.35, p.y - 0.68);',
        '  float horn = (p.y > 0.45 && p.y < 0.95) ? smoothstep(0.11 * (1.0 - (p.y - 0.45) * 1.6), 0.02, abs(hp.x)) * morphT : 0.0;',
        '  float faceMask = smoothstep(0.84, 0.70, r2);',
        '  float silhouette = clamp(faceMask + horn, 0.0, 1.0);',
        '  if(silhouette < 0.01) discard;',
        '  // 3D curved mask surface shading & translucent rim',
        '  vec3 nrm = normalize(vec3(mp.x * 1.25, mp.y * 0.85, sqrt(max(0.06, 0.86 - r2))));',
        '  float rim = pow(1.0 - nrm.z, 1.75);',
        '  // Shifting eyes & mouth expressions (Weeping Noh <-> Fierce Oni <-> Third-Eye Oracle)',
        '  vec2 ep = vec2(abs(p.x) - 0.28, p.y - 0.12);',
        '  float tiltE = mix(-0.32, 0.45, morphT);',
        '  float eyeSlit = smoothstep(0.065, 0.020, abs(ep.y - ep.x * tiltE)) * smoothstep(0.19, 0.11, abs(ep.x));',
        '  float thirdEye = smoothstep(0.09, 0.03, length(vec2(p.x * 1.6, p.y - 0.36))) * morphU;',
        '  float tear = (1.0 - morphT) * smoothstep(0.028, 0.008, abs(abs(p.x) - 0.27)) * smoothstep(0.10, -0.02, p.y) * smoothstep(-0.42, -0.15, p.y);',
        '  float smileCurve = mix(-0.22, 0.28, morphT) * (p.x * p.x * 6.0);',
        '  float mouth = smoothstep(0.065 + 0.035 * morphT, 0.022, abs(p.y + 0.34 - smileCurve)) * smoothstep(0.28, 0.16, abs(p.x));',
        '  float fangs = morphT * mouth * step(0.55, sin(p.x * 46.0));',
        '  // Ghostly porcelain / spectral jade / crimson lacquer tint',
        '  vec3 baseTint = vPal < 0.5 ? vec3(0.82, 0.90, 1.0) : (vPal < 1.5 ? vec3(0.45, 0.96, 0.86) : vec3(1.0, 0.38, 0.48));',
        '  vec3 glowCol  = vPal < 0.5 ? vec3(0.42, 0.86, 1.0) : (vPal < 1.5 ? vec3(0.30, 1.0, 0.78) : vec3(1.0, 0.22, 0.36));',
        '  float wisp = kxFbm2(p * 2.8 + vec2(vSeed * 7.0, -kxTime * 0.5));',
        '  vec3 col = baseTint * (0.42 + 0.52 * nrm.z + 0.45 * rim) * (0.78 + 0.32 * wisp);',
        '  // Darken recessed eye/mouth sockets slightly or blaze with inner spirit light',
        '  float sockets = clamp(eyeSlit + mouth - fangs, 0.0, 1.0);',
        '  col = mix(col, glowCol * 2.1, clamp(eyeSlit * 0.85 + thirdEye + tear * 0.9 + rim * 0.55, 0.0, 1.0));',
        '  col = mix(col, vec3(0.04, 0.02, 0.08), mouth * 0.65 * (1.0 - fangs));',
        '  col += vec3(1.0, 0.95, 0.9) * fangs * 0.9;',
        '  // Translucent see-through alpha (`0.22 .. 0.56`)',
        '  float a = silhouette * vFade * clamp(0.22 + 0.32 * rim + 0.22 * sockets + 0.18 * thirdEye, 0.0, 0.62);',
        '  if(a < 0.008) discard;',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var maskMesh = new THREE.Mesh(maskGeo, maskMat);
      maskMesh.frustumCulled = false; maskMesh.renderOrder = 5;
      holder.add(maskMesh);

    } else if(kind === 'gravity_lens'){
      var lensBaseScale = spec.scale == null ? 1.0 : +spec.scale;
      var isAccretion = spec.tint === 'accretion';
      var cGridVec = isAccretion ? new THREE.Vector3(0.72, 0.56, 1.0) : new THREE.Vector3(0.48, 0.86, 1.0);
      var cArcVec  = isAccretion ? new THREE.Vector3(1.0, 0.72, 0.36) : new THREE.Vector3(0.55, 0.78, 1.0);
      var cWaveVec = isAccretion ? new THREE.Vector3(0.42, 0.92, 1.0) : new THREE.Vector3(0.82, 0.62, 1.0);

      // 4a. Schwarzschild Event-Horizon Shadow & Gravitationally Lensed Background Star-Grid (`uPower` intensifies!)
      var lensDarkMat = makePremultOverMaterial({
        kxTime: state.uTime,
        kxPower: state.uPower,
        kxBaseSc: { value: lensBaseScale },
        kxGridC: { value: cGridVec },
        kxZOff: { value: -0.11 }
      }, [
        'uniform float kxPower, kxBaseSc, kxZOff;',
        'varying vec2 vUvA;',
        'varying float vFloorFade;',
        'void main(){',
        '  vUvA = uv;',
        '  float sc = kxBaseSc * (0.94 + 0.56 * kxPower);',
        '  vec2 off = (uv - 0.5) * 2.0 * sc;',
        '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
        '  mvOrigin.xy += off;',
        '  mvOrigin.z += kxZOff;',
        '  vec3 wApprox = (modelMatrix * vec4(0.0, off.y, 0.0, 1.0)).xyz;',
        '  vFloorFade = smoothstep(0.02, 0.28, wApprox.y);',
        '  gl_Position = projectionMatrix * mvOrigin;',
        '}'
      ].join('\n'), [
        'uniform float kxTime, kxPower;',
        'uniform vec3 kxGridC;',
        'varying vec2 vUvA;',
        'varying float vFloorFade;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  // Schwarzschild deflection: rays near the Einstein radius bend strongly around the singularity!',
        '  float rs = 0.22 + 0.14 * kxPower;',
        '  float defl = (rs * rs) / max(r * r, 0.035);',
        '  float swirlA = (0.38 + 0.88 * kxPower) / max(r, 0.18);',
        '  mat2 sw = mat2(cos(swirlA), -sin(swirlA), sin(swirlA), cos(swirlA));',
        '  vec2 pLensed = sw * (p * (1.0 - defl));',
        '  // Warped space-time metric gridlines & lensed background Einstein star-arcs',
        '  vec2 gp = pLensed * (5.8 + 2.2 * kxPower);',
        '  float grid = (1.0 - smoothstep(0.02, 0.085, abs(fract(gp.x) - 0.5))) + (1.0 - smoothstep(0.02, 0.085, abs(fract(gp.y) - 0.5)));',
        '  grid *= smoothstep(0.20, 0.44, r) * (1.0 - smoothstep(0.72, 0.98, r)) * (0.32 + 0.58 * kxPower);',
        '  float stars = kxStarLayer(pLensed + vec2(kxTime * 0.03, -kxTime * 0.02), 8.5, 0.36, kxTime * 2.0) * smoothstep(0.22, 0.44, r) * (1.0 - smoothstep(0.78, 0.99, r));',
        '  // Dark gravitational shadow moat framing the photon sphere',
        '  float moat = smoothstep(0.14, 0.34, r) * (1.0 - smoothstep(0.46, 0.76, r));',
        '  float a = clamp(moat * (0.46 + 0.34 * kxPower) + (grid * 0.38 + stars * 0.58) * (0.65 + 0.40 * kxPower), 0.0, 0.85) * vFloorFade;',
        '  if(a < 0.006) discard;',
        '  vec3 col = vec3(0.008, 0.004, 0.024) * moat + kxGridC * grid + vec3(0.94, 0.97, 1.0) * stars * 1.85;',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var lensDarkMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), lensDarkMat);
      lensDarkMesh.frustumCulled = false; lensDarkMesh.renderOrder = 1;
      holder.add(lensDarkMesh);

      // 4b. Chromatically Split Relativistic Einstein Photon-Ring & Power-Surge Gravitational Waves (pure additive)
      var lensGlowMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxPower: state.uPower,
        kxBaseSc: { value: lensBaseScale },
        kxArcC: { value: cArcVec },
        kxWaveC: { value: cWaveVec },
        kxZOff: { value: -0.09 }
      }, [
        'uniform float kxPower, kxBaseSc, kxZOff;',
        'varying vec2 vUvA;',
        'void main(){',
        '  vUvA = uv;',
        '  float sc = kxBaseSc * (0.94 + 0.56 * kxPower);',
        '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
        '  mvOrigin.xy += (uv - 0.5) * 2.0 * sc;',
        '  mvOrigin.z += kxZOff;',
        '  gl_Position = projectionMatrix * mvOrigin;',
        '}'
      ].join('\n'), [
        'uniform float kxTime, kxPower;',
        'uniform vec3 kxArcC, kxWaveC;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  float disp = 0.012 + 0.028 * kxPower;',
        '  float rE = 0.47 + 0.03 * sin(ang * 2.0 - kxTime * (1.8 + 3.2 * kxPower));',
        '  // Chromatically split Einstein ring (relativistic Doppler beaming)',
        '  float ringB = exp(-abs(r - (rE - disp)) * (48.0 - 14.0 * kxPower));',
        '  float ringG = exp(-abs(r - rE) * (54.0 - 16.0 * kxPower));',
        '  float ringR = exp(-abs(r - (rE + disp)) * (44.0 - 12.0 * kxPower));',
        '  float doppler = 0.68 + 0.32 * sin(ang - kxTime * (1.5 + 2.5 * kxPower));',
        '  vec3 einstein = vec3(ringR * 0.95, ringG * 0.88, ringB * 1.25) * doppler;',
        '  // Infalling lensed light arcs & surge gravitational-wave ripples',
        '  float spiral = sin(ang * 3.0 + 7.5 / max(r, 0.22) + kxTime * (2.2 + 4.5 * kxPower));',
        '  float arcs = pow(max(0.0, spiral * 0.5 + 0.5), 5.0) * smoothstep(0.24, 0.44, r) * (1.0 - smoothstep(0.58, 0.96, r));',
        '  float gWave = kxPower * exp(-abs(r - fract(kxTime * 1.35) * 0.95) * 32.0) * smoothstep(0.22, 0.40, r) * (1.0 - smoothstep(0.82, 0.99, r));',
        '  float gain = 0.92 + 2.15 * kxPower;',
        '  vec3 col = (einstein * 1.15 + kxArcC * arcs * (0.60 + 0.85 * kxPower) + kxWaveC * gWave * 1.6) * gain;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var lensGlowMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), lensGlowMat);
      lensGlowMesh.frustumCulled = false; lensGlowMesh.renderOrder = 3;
      holder.add(lensGlowMesh);

      // 4c. Foreground Abdominal/Core Singularity Micro-Lens (`kxZOff = +0.16` right over the singularity core!)
      var coreLensMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxPower: state.uPower,
        kxArcC: { value: cArcVec },
        kxZOff: { value: 0.16 }
      }, [
        'uniform float kxPower, kxZOff;',
        'varying vec2 vUvA;',
        'void main(){',
        '  vUvA = uv;',
        '  float sc = 0.28 + 0.16 * kxPower;',
        '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
        '  mvOrigin.xy += (uv - 0.5) * 2.0 * sc;',
        '  mvOrigin.z += kxZOff;',
        '  gl_Position = projectionMatrix * mvOrigin;',
        '}'
      ].join('\n'), [
        'uniform float kxTime, kxPower;',
        'uniform vec3 kxArcC;',
        'varying vec2 vUvA;',
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  float ring = exp(-abs(r - 0.42) * 52.0) * (0.72 + 0.28 * sin(ang * 2.0 - kxTime * 4.2));',
        '  float jet = exp(-abs(p.y) * 24.0) * smoothstep(0.18, 0.42, abs(p.x)) * (1.0 - smoothstep(0.55, 0.98, abs(p.x)));',
        '  vec3 col = (vec3(1.0, 0.94, 0.80) * ring * 1.15 + kxArcC * (ring * 0.65 + jet * 0.85)) * (0.85 + 1.35 * kxPower);',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var coreLensMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), coreLensMat);
      coreLensMesh.frustumCulled = false; coreLensMesh.renderOrder = 6;
      holder.add(coreLensMesh);

    } else if(kind === 'vox_shimmer'){
      // 7. Vox Solus: Iridescent Prismatic Mirage Halo + 30 Phase-Refraction Glints (brightens as body fades out of view!)
      var mirageMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxPhase: state.uPhase,
        kxScale: { value: spec.scale == null ? 1.16 : +spec.scale },
        kxZOff: { value: -0.06 }
      }, VS_VIEW_HALO, [
        'uniform float kxTime, kxPhase;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'vec3 kxSpectrum(float h){ return 0.54 + 0.46 * cos(6.2831853 * (h + vec3(0.0, 0.3333, 0.6667))); }',
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  p.x *= 1.55;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  // Soft holographic phase-interference scanlines & shimmering vertical refraction veil (no hard circle)!',
        '  float n = kxFbm2(vec2(p.x * 3.2, p.y * 4.5 - kxTime * 1.8));',
        '  float scan = pow(0.5 + 0.5 * sin(p.y * 46.0 - kxTime * 11.0 + n * 5.0), 2.2);',
        '  float streaks = pow(0.5 + 0.5 * sin(p.x * 22.0 + n * 6.0), 4.0) * exp(-abs(p.x) * 2.4);',
        '  float mirage = (exp(-r * 2.4) * (0.38 * scan + 0.52 * streaks)) * (1.0 - smoothstep(0.58, 0.98, r));',
        '  float vanishBoost = 0.48 + 1.35 * (1.0 - kxPhase);',
        '  vec3 specC = kxSpectrum(fract(p.y * 0.85 - kxTime * 0.35 + n * 0.5));',
        '  vec3 col = mix(vec3(0.62, 0.95, 1.0), specC, 0.62) * mirage * vanishBoost;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var mirageMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), mirageMat);
      mirageMesh.frustumCulled = false; mirageMesh.renderOrder = 3;
      holder.add(mirageMesh);

      var glintGeo = makeBillboardCloudGeo(30, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var rx = (seed - 0.5) * 0.68;
        var ry = -0.78 + 1.56 * ((i * 0.381966) % 1.0);
        var rz = (((i * 0.7548776) % 1.0) - 0.5) * 0.42;
        var sz = 0.08 + 0.09 * seed;
        return { a: [rx, ry, rz, sz], b: [seed, 1.4 + 1.6 * seed, (i / n), 0] };
      });
      var glintMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxPhase: state.uPhase
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvS;',
        'varying float vTwinkle, vHue;',
        'void main(){',
        '  float tw = pow(0.5 + 0.5 * sin(kxTime * aAura1.y * 2.8 + aAura1.x * 18.0), 3.0);',
        '  vec3 cPos = aAura0.xyz + vec3(sin(kxTime * 2.2 + aAura1.x * 9.0) * 0.04, cos(kxTime * 1.7 + aAura1.x * 7.0) * 0.04, 0.0);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  mv.xy += (uv - 0.5) * 2.0 * vec2(0.45, 1.85) * aAura0.w * (0.65 + 0.55 * tw);',
        '  vUvS = uv; vTwinkle = tw; vHue = fract(aAura1.z + kxTime * 0.18);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxPhase;',
        'varying vec2 vUvS;',
        'varying float vTwinkle, vHue;',
        GLSL_NOISE,
        'vec3 kxSpectrum(float h){ return 0.54 + 0.46 * cos(6.2831853 * (h + vec3(0.0, 0.3333, 0.6667))); }',
        'void main(){',
        '  vec2 p = (vUvS - 0.5) * 2.0;',
        '  float flare = exp(-abs(p.x) * 9.5) * exp(-abs(p.y) * 2.8) + exp(-abs(p.y) * 11.0) * exp(-abs(p.x) * 3.2);',
        '  float boost = 0.55 + 1.15 * (1.0 - kxPhase);',
        '  vec3 col = mix(kxSpectrum(vHue), vec3(1.0), 0.45) * flare * vTwinkle * boost * 0.95;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var glintMesh = new THREE.Mesh(glintGeo, glintMat);
      glintMesh.frustumCulled = false; glintMesh.renderOrder = 5;
      holder.add(glintMesh);

    } else if(kind === 'obscuring_fog'){
      // 8. Censer Revenant: Wide Area-Projecting Obscuring Dark Miasma Fog (`makePremultOverMaterial` light-absorbing!)
      var fogCarpetGeo = new THREE.PlaneGeometry(3.4, 3.4, 1, 1);
      fogCarpetGeo.rotateX(-Math.PI * 0.5);
      var fogCarpetMat = makePremultOverMaterial({
        kxTime: state.uTime
      }, [
        'varying vec2 vUvG;',
        'void main(){ vUvG = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvG;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvG - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float n1 = kxFbm2(p * 2.6 + vec2(kxTime * 0.14, -kxTime * 0.11));',
        '  float n2 = kxFbm2(p * 4.8 - vec2(kxTime * 0.09, kxTime * 0.13));',
        '  float density = smoothstep(1.0, 0.15, r + (n1 - 0.5) * 0.48) * (0.65 + 0.35 * n2);',
        '  float a = clamp(density * 0.78, 0.0, 0.82);',
        '  if(a < 0.006) discard;',
        '  vec3 col = mix(vec3(0.018, 0.016, 0.028), vec3(0.075, 0.068, 0.115), n2 * 0.65);',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var fogCarpetMesh = new THREE.Mesh(fogCarpetGeo, fogCarpetMat);
      fogCarpetMesh.position.set(0, -0.90, 0);
      fogCarpetMesh.frustumCulled = false; fogCarpetMesh.renderOrder = 1;
      holder.add(fogCarpetMesh);
      groundMeshRef = fogCarpetMesh;

      var fogCloudGeo = makeBillboardCloudGeo(36, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var isLow = i < 22 ? 1.0 : 0.0;
        var rad = isLow > 0.5 ? (0.28 + 1.18 * ((i * 0.381966) % 1.0)) : (0.22 + 0.68 * ((i * 0.381966) % 1.0));
        var y0 = isLow > 0.5 ? (-0.92 + 0.62 * ((i * 0.7548776) % 1.0)) : (-0.35 + 0.95 * ((i * 0.7548776) % 1.0));
        var sz = isLow > 0.5 ? (0.48 + 0.28 * seed) : (0.36 + 0.22 * seed);
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.12 + 0.08 * seed, (i % 2 === 0 ? 1.0 : -1.0), isLow] };
      });
      var fogCloudMat = makePremultOverMaterial({
        kxTime: state.uTime
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvF;',
        'varying float vAge, vSeed, vLow;',
        'void main(){',
        '  float age = fract(aAura1.x + kxTime * aAura1.y);',
        '  float ang = aAura0.x + age * 0.55 * aAura1.z;',
        '  float rOut = aAura0.y + age * (aAura1.w > 0.5 ? 0.35 : 0.16);',
        '  vec3 cPos = vec3(cos(ang) * rOut, aAura0.z + age * 0.18, sin(ang) * rOut);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  vec2 sc = vec2(1.45, 0.85) * aAura0.w * (0.85 + 0.45 * age);',
        '  mv.xy += (uv - 0.5) * 2.0 * sc;',
        '  vUvF = uv; vAge = age; vSeed = aAura1.x; vLow = aAura1.w;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvF;',
        'varying float vAge, vSeed, vLow;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvF - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float n = kxFbm2(p * 2.2 + vec2(vSeed * 13.0 + kxTime * 0.22, -kxTime * 0.18));',
        '  float billow = smoothstep(0.96, 0.18, r + (n - 0.5) * 0.62);',
        '  float life = smoothstep(0.0, 0.22, vAge) * (1.0 - smoothstep(0.58, 1.0, vAge));',
        '  float a = clamp(billow * life * (vLow > 0.5 ? 0.62 : 0.48), 0.0, 0.68);',
        '  if(a < 0.006) discard;',
        '  // Heavy charcoal-slate graveyard fog with subtle eerie lantern-violet scatter at billow rims',
        '  vec3 darkCore = vec3(0.022, 0.020, 0.032);',
        '  vec3 mistRim  = vec3(0.095, 0.088, 0.145);',
        '  vec3 col = mix(darkCore, mistRim, clamp((1.0 - billow) * 0.85 + n * 0.25, 0.0, 1.0));',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var fogCloudMesh = new THREE.Mesh(fogCloudGeo, fogCloudMat);
      fogCloudMesh.frustumCulled = false; fogCloudMesh.renderOrder = 4;
      holder.add(fogCloudMesh);

    } else if(kind === 'shadow_swarm'){
      // 9. Ocular Umbra (Image 1): Light-Devouring Pitch-Black Ink-Shadow Monolith Shroud + Swirling Crow/Fleck Swarm
      var inkHaloMat = makePremultOverMaterial({
        kxTime: state.uTime,
        kxScale: { value: spec.scale == null ? 1.38 : +spec.scale },
        kxZOff: { value: -0.10 }
      }, [
        'uniform float kxScale, kxZOff;',
        'varying vec2 vUvA;',
        'void main(){',
        '  vUvA = uv;',
        '  vec4 mvOrigin = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);',
        '  mvOrigin.xy += (uv - 0.5) * 2.0 * vec2(kxScale * 0.85, kxScale * 1.18);',
        '  mvOrigin.z += kxZOff;',
        '  gl_Position = projectionMatrix * mvOrigin;',
        '}'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(vec2(p.x * 1.28, p.y * 1.08));',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  float tendrils = pow(0.5 + 0.5 * sin(ang * 19.0 + kxFbm2(p * 3.6 - kxTime * 0.7) * 5.2), 2.4) * (1.0 - smoothstep(0.68, 0.98, r));',
        '  float splatter = kxStarLayer(p * 0.75 + vec2(0.0, -kxTime * 0.08), 16.0, 0.45, kxTime * 1.8);',
        '  float shroud = smoothstep(0.95, 0.22, r - tendrils * 0.22) + splatter * smoothstep(0.95, 0.40, r) * 0.65;',
        '  float a = clamp(shroud * 0.86, 0.0, 0.90) * (1.0 - smoothstep(0.84, 1.0, r));',
        '  if(a < 0.008) discard;',
        '  vec3 col = vec3(0.005, 0.004, 0.008);',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var inkHaloMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), inkHaloMat);
      inkHaloMesh.frustumCulled = false; inkHaloMesh.renderOrder = 2;
      holder.add(inkHaloMesh);

      // 44 Swirling Pitch-Black Crow Silhouettes & Ink-Shard Flecks bursting from the shadow
      var crowGeo = makeBillboardCloudGeo(44, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var rad = 0.24 + 0.58 * ((i * 0.381966) % 1.0);
        var y0 = -0.82 + 1.68 * ((i * 0.7548776) % 1.0);
        var sz = 0.085 + 0.075 * seed;
        var isCrow = i < 26 ? 1.0 : 0.0;
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.28 + 0.22 * seed, isCrow, (i % 2 === 0 ? 1.0 : -1.0)] };
      });
      var crowMat = makePremultOverMaterial({
        kxTime: state.uTime
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvC;',
        'varying float vAge, vFlap, vCrow;',
        'void main(){',
        '  float age = fract(aAura1.x + kxTime * aAura1.y);',
        '  float ang = aAura0.x + age * 1.15 * aAura1.w;',
        '  float rOut = aAura0.y + age * 0.42;',
        '  vec3 cPos = vec3(cos(ang) * rOut, aAura0.z + age * 0.26 - 0.08, sin(ang) * rOut);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  float rot = atan(sin(ang), cos(ang)) * 0.35 + sin(kxTime * 2.5 + aAura1.x * 6.28) * 0.25;',
        '  vec2 c = (uv - 0.5) * 2.0 * aAura0.w * (1.1 - 0.35 * age);',
        '  mv.xy += mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * c;',
        '  vUvC = uv; vAge = age; vFlap = sin(kxTime * 9.5 + aAura1.x * 25.0); vCrow = aAura1.z;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'varying vec2 vUvC;',
        'varying float vAge, vFlap, vCrow;',
        'void main(){',
        '  vec2 p = (vUvC - 0.5) * 2.0;',
        '  float life = smoothstep(0.0, 0.15, vAge) * (1.0 - smoothstep(0.65, 1.0, vAge));',
        '  float mask;',
        '  if(vCrow > 0.5){',
        '    // Crisp winged crow/raven silhouette SDF',
        '    float ax = abs(p.x);',
        '    float wingY = 0.28 * vFlap * ax - 0.22 * ax * ax;',
        '    float wing = smoothstep(0.22 * (1.0 - 0.75 * ax), 0.02, abs(p.y - wingY)) * (1.0 - smoothstep(0.85, 1.0, ax));',
        '    float body = smoothstep(0.18, 0.04, length(vec2(p.x * 2.2, p.y * 0.9)));',
        '    mask = max(wing, body);',
        '  } else {',
        '    // Jagged ink-splatter & barbed arrow-tendril shard',
        '    mask = smoothstep(0.55, 0.10, abs(p.x) * 1.8 + abs(p.y) * 0.85);',
        '  }',
        '  float a = clamp(mask * life * 0.90, 0.0, 0.92);',
        '  if(a < 0.01) discard;',
        '  vec3 col = vec3(0.008, 0.006, 0.012);',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var crowMesh = new THREE.Mesh(crowGeo, crowMat);
      crowMesh.frustumCulled = false; crowMesh.renderOrder = 5;
      holder.add(crowMesh);

    } else if(kind === 'white_tendril_flame'){
      // 10. Astral Pyre (Image 2): Crisp Sinuous Kalligraphic White Flame/Smoke Tendrils + Ultramarine-White Ground Pool
      var wfGeo = makeBillboardCloudGeo(32, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var isSpark = i >= 20 ? 1.0 : 0.0;
        var rad = isSpark > 0.5 ? (0.24 + 0.48 * ((i * 0.381966) % 1.0)) : (0.20 + 0.34 * ((i * 0.381966) % 1.0));
        var y0 = isSpark > 0.5 ? (-0.05 + 0.95 * ((i * 0.7548776) % 1.0)) : (0.06 + 0.62 * ((i * 0.7548776) % 1.0));
        var sz = isSpark > 0.5 ? (0.040 + 0.030 * seed) : (0.22 + 0.14 * seed);
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.34 + 0.22 * seed, isSpark, (i % 2 === 0 ? 1.0 : -1.0)] };
      });
      var wfMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxGain: { value: spec.gain == null ? 0.58 : +spec.gain * 0.48 }
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvW;',
        'varying float vAge, vSeed, vSpark, vDir;',
        'void main(){',
        '  float age = fract(aAura1.x + kxTime * aAura1.y);',
        '  float ang = aAura0.x + age * 0.55 * aAura1.w;',
        '  float climb = aAura1.z > 0.5 ? age * 0.85 : age * 0.62;',
        '  vec3 cPos = vec3(cos(ang) * (aAura0.y + age * 0.14), aAura0.z + climb, sin(ang) * (aAura0.y + age * 0.14));',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  vec2 sc = aAura1.z > 0.5 ? vec2(0.65, 1.6) * aAura0.w : vec2(0.70, 2.05) * aAura0.w * (1.06 - 0.26 * age);',
        '  mv.xy += (uv - 0.5) * 2.0 * sc;',
        '  vUvW = uv; vAge = age; vSeed = aAura1.x; vSpark = aAura1.z; vDir = aAura1.w;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxTime, kxGain;',
        'varying vec2 vUvW;',
        'varying float vAge, vSeed, vSpark, vDir;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvW - 0.5) * 2.0;',
        '  float life = smoothstep(0.0, 0.18, vAge) * (1.0 - smoothstep(0.50, 1.0, vAge));',
        '  vec3 col;',
        '  if(vSpark > 0.5){',
        '    float d = length(vec2(p.x * 1.8, p.y));',
        '    float sp = exp(-d * 4.8) * life;',
        '    col = mix(vec3(0.65, 0.80, 1.0), vec3(1.0, 1.0, 1.0), exp(-d * 6.0)) * sp * 1.8 * kxGain;',
        '  } else {',
        '    // Narrow, whip-curling kalligraphic S-curl white flame tendril!',
        '    float uUp = p.y * 0.5 + 0.5;',
        '    float curl = sin(uUp * 5.8 - kxTime * 2.8 + vSeed * 6.28) * 0.48 * uUp * vDir;',
        '    float taper = 0.19 * (1.0 - 0.78 * uUp * uUp);',
        '    float dx = abs(p.x - curl) / max(taper, 0.035);',
        '    float n = kxFbm2(vec2(p.x * 2.8 + vSeed * 7.0, p.y * 2.6 - kxTime * 2.4));',
        '    float wisp = smoothstep(1.05, 0.12, dx + (n - 0.5) * 0.42) * smoothstep(-1.0, -0.55, p.y) * (1.0 - smoothstep(0.65, 1.0, p.y)) * life;',
        '    vec3 cSilverBlue = vec3(0.68, 0.78, 0.98);',
        '    vec3 cPureWhite  = vec3(1.0, 1.0, 1.0);',
        '    col = mix(cSilverBlue, cPureWhite, clamp(wisp * 1.4, 0.0, 1.0)) * wisp * kxGain;',
        '  }',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var wfMesh = new THREE.Mesh(wfGeo, wfMat);
      wfMesh.frustumCulled = false; wfMesh.renderOrder = 5;
      holder.add(wfMesh);

      // Ultramarine-Cobalt & White Starlit Nebula Reflection Pool at feet (Image 2!)
      var pyrePoolGeo = new THREE.PlaneGeometry(1.85, 1.85, 1, 1);
      pyrePoolGeo.rotateX(-Math.PI * 0.5);
      var pyrePoolMat = makePureLightMaterial({
        kxTime: state.uTime
      }, [
        'varying vec2 vUvG;',
        'void main(){ vUvG = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvG;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvG - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float n = kxFbm2(p * 3.4 + vec2(kxTime * 0.12, -kxTime * 0.16));',
        '  float pool = smoothstep(0.96, 0.18, r + (n - 0.5) * 0.45);',
        '  float stars = kxStarLayer(p + vec2(kxTime * 0.02, 0.0), 10.0, 0.35, kxTime * 2.0) * pool;',
        '  vec3 col = vec3(0.14, 0.34, 0.98) * pool * 0.65 + vec3(0.95, 0.98, 1.0) * (pow(pool, 2.4) * 0.55 + stars * 1.4);',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var pyrePoolMesh = new THREE.Mesh(pyrePoolGeo, pyrePoolMat);
      pyrePoolMesh.position.set(0, -0.90, 0);
      pyrePoolMesh.frustumCulled = false; pyrePoolMesh.renderOrder = 1;
      holder.add(pyrePoolMesh);
      groundMeshRef = pyrePoolMesh;

    } else if(kind === 'spiky_dark_array'){
      // 11. Nightmare Urchin (Image 3): Razor-Sharp Pitch-Black Needle Starburst Corona around Head + Crimson Dread Bleed
      var spikeDarkMat = makePremultOverMaterial({
        kxTime: state.uTime,
        kxScale: { value: spec.scale == null ? 0.82 : +spec.scale },
        kxZOff: { value: -0.05 }
      }, VS_VIEW_HALO, [
        'uniform float kxTime;',
        'varying vec2 vUvA;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvA - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float ang = atan(p.y, p.x);',
        '  // Layer 1: 32 primary long razor-sharp uneven black sea-urchin needles',
        '  float twitch1 = sin(kxTime * 4.8 + sin(ang * 7.0) * 3.0) * 0.014;',
        '  float a1 = ang + twitch1 + kxTime * 0.08;',
        '  float id1 = floor((a1 + 3.14159265) / 6.2831853 * 32.0);',
        '  float h1 = kxHash12(vec2(id1, 3.7));',
        '  float maxR1 = 0.62 + 0.36 * h1;',
        '  float sec1 = abs(fract((a1 + 3.14159265) / 6.2831853 * 32.0) - 0.5) * 2.0;',
        '  float width1 = max(0.02, 0.34 * (1.0 - r / maxR1));',
        '  float spikes1 = smoothstep(width1, width1 * 0.15, sec1) * step(r, maxR1) * smoothstep(0.10, 0.22, r);',
        '  // Layer 2: 46 secondary counter-twitching fine black quills',
        '  float a2 = ang - kxTime * 0.11 + cos(kxTime * 6.2 + ang * 5.0) * 0.012;',
        '  float id2 = floor((a2 + 3.14159265) / 6.2831853 * 46.0);',
        '  float h2 = kxHash12(vec2(id2, 9.1));',
        '  float maxR2 = 0.44 + 0.38 * h2;',
        '  float sec2 = abs(fract((a2 + 3.14159265) / 6.2831853 * 46.0) - 0.5) * 2.0;',
        '  float width2 = max(0.018, 0.26 * (1.0 - r / maxR2));',
        '  float spikes2 = smoothstep(width2, width2 * 0.12, sec2) * step(r, maxR2) * smoothstep(0.10, 0.20, r);',
        '  // Dark dread vignette halo behind the needles',
        '  float dread = exp(-r * 2.8) * 0.58 * (1.0 - smoothstep(0.65, 1.0, r));',
        '  float needle = max(spikes1, spikes2 * 0.92);',
        '  float a = clamp(max(needle * 0.96, dread), 0.0, 0.96);',
        '  if(a < 0.008) discard;',
        '  // Pitch-black needles with sinister faint blood-crimson inner root bleed',
        '  float redRoot = needle * exp(-max(0.0, r - 0.18) * 7.5) * (0.65 + 0.35 * sin(kxTime * 3.5 + id1));',
        '  vec3 col = mix(vec3(0.006, 0.004, 0.008), vec3(0.62, 0.05, 0.08), redRoot * 0.55);',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var spikeDarkMesh = new THREE.Mesh(makeBackdropDiscGeo(1.0), spikeDarkMat);
      spikeDarkMesh.frustumCulled = false; spikeDarkMesh.renderOrder = 5;
      holder.add(spikeDarkMesh);

    } else if(kind === 'brimstone_aura'){
      // 6a. Dark Sulfurous Crimson-Soot Brimstone Shroud (`makePremultOverMaterial`)
      var sootGeo = makeBillboardCloudGeo(22, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var rad = 0.20 + 0.34 * ((i * 0.381966) % 1.0);
        var y0 = -0.82 + 1.45 * ((i * 0.7548776) % 1.0);
        var sz = 0.24 + 0.18 * seed;
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.34 + 0.18 * seed, (i % 2 === 0 ? 1.0 : -1.0), 0] };
      });
      var sootMat = makePremultOverMaterial({
        kxTime: state.uTime
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvB;',
        'varying float vAge, vSeed;',
        'void main(){',
        '  float age = fract(aAura1.x + kxTime * aAura1.y);',
        '  float ang = aAura0.x + age * 1.2 * aAura1.z;',
        '  vec3 cPos = vec3(cos(ang) * (aAura0.y + age * 0.14), aAura0.z + age * 0.55, sin(ang) * (aAura0.y + age * 0.14));',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  mv.xy += (uv - 0.5) * 2.0 * aAura0.w * (0.8 + 0.55 * age);',
        '  vUvB = uv; vAge = age; vSeed = aAura1.x;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvB;',
        'varying float vAge, vSeed;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvB - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float n = kxFbm2(p * 2.4 + vec2(vSeed * 11.0, -kxTime * 0.9));',
        '  float billow = smoothstep(0.95, 0.20, r + (n - 0.5) * 0.65);',
        '  float life = smoothstep(0.0, 0.18, vAge) * (1.0 - smoothstep(0.55, 1.0, vAge));',
        '  float a = clamp(billow * life * 0.48, 0.0, 0.55);',
        '  if(a < 0.008) discard;',
        '  vec3 col = mix(vec3(0.45, 0.03, 0.02), vec3(0.09, 0.03, 0.03), smoothstep(0.2, 0.85, vAge));',
        '  gl_FragColor = vec4(col * a, a);',
        '}'
      ].join('\n'));
      var sootMesh = new THREE.Mesh(sootGeo, sootMat);
      sootMesh.frustumCulled = false; sootMesh.renderOrder = 2;
      holder.add(sootMesh);

      // 6b. Roaring Red Brimstone Flame Corona & Rising Hellfire Ember Vortex (`makePureLightMaterial`)
      var fireGeo = makeBillboardCloudGeo(38, function(i, n){
        var seed = ((i * 0.6180339887) % 1.0);
        var isCinder = i >= 22 ? 1.0 : 0.0;
        var rad = isCinder > 0.5 ? (0.28 + 0.48 * ((i * 0.381966) % 1.0)) : (0.18 + 0.28 * ((i * 0.381966) % 1.0));
        var y0 = -0.88 + 1.50 * ((i * 0.7548776) % 1.0);
        var sz = isCinder > 0.5 ? (0.045 + 0.035 * seed) : (0.26 + 0.16 * seed);
        return { a: [(i / n) * 6.2831853, rad, y0, sz], b: [seed, 0.48 + 0.32 * seed, isCinder, (i % 2 === 0 ? 1.0 : -1.0)] };
      });
      var fireMat = makePureLightMaterial({
        kxTime: state.uTime,
        kxGain: { value: 1.42 }
      }, [
        'attribute vec4 aAura0, aAura1;',
        'uniform float kxTime;',
        'varying vec2 vUvF;',
        'varying float vAge, vSeed, vCinder;',
        'void main(){',
        '  float age = fract(aAura1.x + kxTime * aAura1.y);',
        '  float swirl = age * (aAura1.z > 0.5 ? 2.6 : 0.9) * aAura1.w;',
        '  float ang = aAura0.x + swirl;',
        '  float climb = aAura1.z > 0.5 ? age * 0.95 : age * 0.52;',
        '  vec3 cPos = vec3(cos(ang) * aAura0.y, aAura0.z + climb, sin(ang) * aAura0.y);',
        '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
        '  vec2 sc = aAura1.z > 0.5 ? vec2(0.55, 2.2) * aAura0.w : vec2(0.85, 1.55) * aAura0.w * (1.05 - 0.35 * age);',
        '  mv.xy += (uv - 0.5) * 2.0 * sc;',
        '  vUvF = uv; vAge = age; vSeed = aAura1.x; vCinder = aAura1.z;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'), [
        'uniform float kxTime, kxGain;',
        'varying vec2 vUvF;',
        'varying float vAge, vSeed, vCinder;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvF - 0.5) * 2.0;',
        '  float life = smoothstep(0.0, 0.14, vAge) * (1.0 - smoothstep(0.45, 1.0, vAge));',
        '  vec3 col;',
        '  if(vCinder > 0.5){',
        '    float d = length(vec2(p.x * 2.2, p.y));',
        '    float spark = exp(-d * 4.2) * life;',
        '    col = mix(vec3(0.95, 0.03, 0.02), vec3(1.0, 0.28, 0.06), exp(-d * 6.0)) * spark * 2.1 * kxGain;',
        '  } else {',
        '    p.x *= 1.25 + 0.55 * (p.y * 0.5 + 0.5);',
        '    float r = length(p);',
        '    if(r > 1.0) discard;',
        '    float n = kxFbm2(vec2(p.x * 2.5 + vSeed * 9.0, p.y * 2.2 - kxTime * 2.8));',
        '    float tongue = smoothstep(0.92, 0.12, r + (n - 0.5) * 0.72) * life;',
        '    vec3 cDeepRed = vec3(0.76, 0.01, 0.02);',
        '    vec3 cScarlet = vec3(1.0, 0.05, 0.02);',
        '    vec3 cHotCore = vec3(1.0, 0.22, 0.05);',
        '    col = mix(cDeepRed, mix(cScarlet, cHotCore, clamp(tongue * 0.85, 0.0, 1.0)), clamp(tongue * 1.15, 0.0, 1.0)) * tongue * 0.85 * kxGain;',
        '  }',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var fireMesh = new THREE.Mesh(fireGeo, fireMat);
      fireMesh.frustumCulled = false; fireMesh.renderOrder = 4;
      holder.add(fireMesh);

      // 6c. Scorched Ground Brimstone Magma Fissure Ring beneath hooves
      var groundGeo = new THREE.PlaneGeometry(1.55, 1.55, 1, 1);
      groundGeo.rotateX(-Math.PI * 0.5);
      var groundMat = makePureLightMaterial({
        kxTime: state.uTime
      }, [
        'varying vec2 vUvG;',
        'void main(){ vUvG = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
      ].join('\n'), [
        'uniform float kxTime;',
        'varying vec2 vUvG;',
        GLSL_NOISE,
        'void main(){',
        '  vec2 p = (vUvG - 0.5) * 2.0;',
        '  float r = length(p);',
        '  if(r > 1.0) discard;',
        '  float n1 = kxFbm2(p * 3.8 + vec2(kxTime * 0.18, -kxTime * 0.14));',
        '  float cracks = exp(-abs(n1 - 0.50) * 28.0) * smoothstep(0.08, 0.25, r) * (1.0 - smoothstep(0.65, 0.98, r));',
        '  float rim = exp(-abs(r - 0.72) * 22.0) * 0.45;',
        '  float pulse = 0.80 + 0.20 * sin(kxTime * 3.2 - r * 5.0);',
        '  vec3 col = (vec3(0.95, 0.03, 0.02) * (cracks * 1.35 + rim) + vec3(1.0, 0.20, 0.04) * pow(cracks, 2.0) * 1.2) * pulse;',
        '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'));
      var groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.position.set(0, -0.90, 0);
      groundMesh.frustumCulled = false; groundMesh.renderOrder = 1;
      holder.add(groundMesh);
      groundMeshRef = groundMesh;
    }

    return {
      kind: kind,
      holder: holder,
      boneName: boneName,
      offset: offset,
      groundMesh: groundMeshRef
    };
  }

  /* Build 4 World-Space Skinned-Pose Holographic Time-Echo Clones + Trailing Clockwork Gears (`chrono_trail`) */
  function buildChronoTrail(fig, state){
    var N_GHOSTS = 4;
    var HIST_LEN = 28;
    var lags = [4, 9, 15, 22];
    var alphas = [0.48, 0.35, 0.24, 0.14];
    var holder = new THREE.Group();
    holder.matrixAutoUpdate = false;
    fig.group.add(holder);

    var nBones = (fig.bones || []).length;
    var ring = [];
    for(var h = 0; h < HIST_LEN; h++){
      var snap = [];
      for(var b = 0; b < nBones; b++) snap.push(new THREE.Matrix4());
      ring.push({ bones: snap, rootPos: new THREE.Vector3(), ready: false });
    }

    var ghosts = [];
    for(var g = 0; g < N_GHOSTS; g++){
      var gFrac = g / Math.max(1, N_GHOSTS - 1);
      var dummyBones = [];
      for(var db = 0; db < nBones; db++){
        var bo = new THREE.Bone();
        bo.matrixAutoUpdate = false;
        dummyBones.push(bo);
      }
      var cTint = new THREE.Color().lerpColors(colOf('#ffd264'), colOf('#48dcff'), gFrac * 0.72);
      var matG = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: cTint,
        emissiveIntensity: 1.55 - 0.35 * gFrac,
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: alphas[g],
        depthWrite: false,
        side: THREE.DoubleSide,
        skinning: true
      });
      matG.onBeforeCompile = function(sh){
        sh.vertexShader = 'varying vec3 vChNrm;\nvarying vec3 vChView;\n' +
          sh.vertexShader.replace('#include <project_vertex>',
            '#include <project_vertex>\n\tvChNrm = normalize(transformedNormal);\n\tvChView = normalize(-mvPosition.xyz);');
        sh.fragmentShader = 'varying vec3 vChNrm;\nvarying vec3 vChView;\n' +
          sh.fragmentShader.replace('#include <dithering_fragment>', [
            '\tfloat fres = pow(1.0 - clamp(abs(dot(normalize(vChNrm), normalize(vChView))), 0.0, 1.0), 1.45);',
            '\tgl_FragColor.rgb = totalEmissiveRadiance * (0.45 + 1.45 * fres);',
            '\tgl_FragColor.a *= (0.48 + 0.90 * fres);',
            '\t#include <dithering_fragment>'
          ].join('\n'));
      };
      matG.customProgramCacheKey = function(){ return 'kx-chrono-ghost'; };
      var gGroup = new THREE.Group();
      holder.add(gGroup);
      ghosts.push({ group: gGroup, dummyBones: dummyBones, skel: null, mat: matG, lag: lags[g], meshesByKey: {} });
    }

    // Trailing golden escapement gear & clock-tick motes streaming behind the Time-Warden
    var gearGeo = makeBillboardCloudGeo(26, function(i, n){
      var seed = ((i * 0.6180339887) % 1.0);
      var rx = (seed - 0.5) * 0.56;
      var ry = -0.55 + 1.35 * ((i * 0.381966) % 1.0);
      var sz = 0.065 + 0.065 * ((i * 0.7548776) % 1.0);
      return { a: [rx, ry, -0.08 - 0.14 * seed, sz], b: [seed, 0.42 + 0.25 * seed, (i % 2 === 0 ? 1.0 : -1.0), 0] };
    });
    var gearMat = makePureLightMaterial({
      kxTime: state.uTime
    }, [
      'attribute vec4 aAura0, aAura1;',
      'uniform float kxTime;',
      'varying vec2 vUvC;',
      'varying float vAge, vSpin;',
      'void main(){',
      '  float age = fract(aAura1.x + kxTime * aAura1.y);',
      '  vec3 cPos = vec3(aAura0.x + sin(age * 4.0 + aAura1.x * 6.28) * 0.08, aAura0.y + age * 0.10, aAura0.z - age * 0.68);',
      '  vec4 mv = modelViewMatrix * vec4(cPos, 1.0);',
      '  float rot = kxTime * 2.4 * aAura1.z + aAura1.x * 6.28;',
      '  vec2 c = (uv - 0.5) * 2.0 * aAura0.w * (1.05 - 0.40 * age);',
      '  mv.xy += mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * c;',
      '  vUvC = uv; vAge = age; vSpin = aAura1.z;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'), [
      'varying vec2 vUvC;',
      'varying float vAge, vSpin;',
      'void main(){',
      '  vec2 p = (vUvC - 0.5) * 2.0;',
      '  float r = length(p);',
      '  if(r > 1.0) discard;',
      '  float ang = atan(p.y, p.x);',
      '  float teeth = step(0.2, cos(ang * 12.0)) * smoothstep(0.68, 0.74, r) * (1.0 - smoothstep(0.88, 0.96, r));',
      '  float rim = exp(-abs(r - 0.68) * 32.0) + exp(-abs(r - 0.22) * 36.0);',
      '  float spokes = exp(-abs(sin(ang * 3.0)) * 28.0 * r) * smoothstep(0.20, 0.26, r) * (1.0 - smoothstep(0.64, 0.70, r));',
      '  float g = clamp(teeth + rim * 0.85 + spokes * 0.75, 0.0, 1.4);',
      '  float fade = smoothstep(0.0, 0.15, vAge) * (1.0 - smoothstep(0.48, 1.0, vAge));',
      '  vec3 col = mix(vec3(1.0, 0.80, 0.28), vec3(0.35, 0.88, 1.0), vAge * 0.65) * g * fade * 1.35;',
      '  if(max(col.r, max(col.g, col.b)) < 0.004) discard;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n'));
    var gearHolder = new THREE.Group();
    var gearMesh = new THREE.Mesh(gearGeo, gearMat);
    gearMesh.frustumCulled = false; gearMesh.renderOrder = 4;
    gearHolder.add(gearMesh);
    fig.group.add(gearHolder);

    return {
      holder: holder,
      gearHolder: gearHolder,
      ring: ring,
      headIdx: 0,
      accumDt: 0,
      ghosts: ghosts,
      HIST_LEN: HIST_LEN
    };
  }

  var tmpChronoSlip = new THREE.Matrix4(), tmpChronoRot = new THREE.Matrix4(), tmpRootNow = new THREE.Vector3();

  function syncChronoMeshes(fig, trail){
    if(!trail || !fig.live) return;
    var refSkel = null;
    Object.keys(fig.live).forEach(function(k){
      var m = fig.live[k];
      if(m && m.isSkinnedMesh && m.skeleton && !refSkel) refSkel = m.skeleton;
    });
    if(!refSkel) return;
    for(var g = 0; g < trail.ghosts.length; g++){
      var gh = trail.ghosts[g];
      if(!gh.skel){
        gh.skel = new THREE.Skeleton(gh.dummyBones, refSkel.boneInverses);
      }
      Object.keys(fig.live).forEach(function(k){
        var m = fig.live[k];
        var pt = m && m.userData && m.userData.part;
        if(!m || !m.isSkinnedMesh || !pt || pt.role !== 'armour') return;
        if(gh.meshesByKey[k]) return;
        var gGeo = new THREE.BufferGeometry();
        Object.keys(m.geometry.attributes).forEach(function(a){ gGeo.setAttribute(a, m.geometry.attributes[a]); });
        if(m.userData.index0){
          var i0 = m.userData.index0;
          gGeo.setIndex((i0.isBufferAttribute || Array.isArray(i0)) ? i0 : new THREE.BufferAttribute(i0, 1));
        } else if(m.geometry.index){
          gGeo.setIndex(m.geometry.index);
        }
        var sm = new THREE.SkinnedMesh(gGeo, gh.mat);
        sm.frustumCulled = false;
        sm.castShadow = false;
        sm.receiveShadow = false;
        sm.renderOrder = 1;
        sm.bind(gh.skel, new THREE.Matrix4());
        gh.group.add(sm);
        gh.meshesByKey[k] = { ghostMesh: sm, srcMesh: m };
      });
    }
  }

  function updateChronoTrail(fig, state, trail, dt, invGroupWorld){
    if(!trail || !fig.bones || !fig.bones.length) return;
    syncChronoMeshes(fig, trail);
    var hipsIdx = state.byName['Hips'] !== undefined ? state.byName['Hips'] : 0;
    fig.bones[hipsIdx].getWorldPosition(tmpRootNow);

    trail.accumDt += dt;
    var firstFill = !trail.ring[0].ready;
    if(firstFill || trail.accumDt >= 0.032){
      trail.accumDt = 0;
      if(firstFill){
        for(var f = 0; f < trail.HIST_LEN; f++){
          for(var b0 = 0; b0 < fig.bones.length; b0++) trail.ring[f].bones[b0].copy(fig.bones[b0].matrixWorld);
          trail.ring[f].rootPos.copy(tmpRootNow);
          trail.ring[f].ready = true;
        }
        trail.headIdx = 0;
      } else {
        trail.headIdx = (trail.headIdx + 1) % trail.HIST_LEN;
        var slot = trail.ring[trail.headIdx];
        for(var b1 = 0; b1 < fig.bones.length; b1++) slot.bones[b1].copy(fig.bones[b1].matrixWorld);
        slot.rootPos.copy(tmpRootNow);
        slot.ready = true;
      }
    }

    // Holder transforms world-space skinned vertices back into `fig.group` local space
    trail.holder.matrix.copy(invGroupWorld);
    trail.holder.matrixWorldNeedsUpdate = true;

    // Position escapement gear stream behind Spine2
    var sp2 = state.byName['Spine2'];
    if(sp2 !== undefined && fig.bones[sp2]){
      fig.bones[sp2].getWorldPosition(tmpW);
      tmpW.applyMatrix4(invGroupWorld);
      trail.gearHolder.position.copy(tmpW);
    }

    var t = state.uTime.value;
    for(var g = 0; g < trail.ghosts.length; g++){
      var gh = trail.ghosts[g];
      if(!gh.skel) continue;
      var sIdx = (trail.headIdx - gh.lag + trail.HIST_LEN * 2) % trail.HIST_LEN;
      var snap = trail.ring[sIdx];
      var movedDist = tmpRootNow.distanceTo(snap.rootPos);
      // When stationary or slow, project a graceful backwards-fanning chronometric echo stream!
      var slipW = Math.max(0.0, 1.0 - movedDist / 0.22);
      var lagFrac = (g + 1) / trail.ghosts.length;
      if(slipW > 0.001){
        var swayX = (-0.22 - 0.05 * Math.sin(t * 1.5 + g)) * lagFrac * 2.1 * slipW;
        var swayY = (0.030 * lagFrac) * slipW;
        var swayZ = (-0.30 - 0.05 * Math.cos(t * 1.2)) * lagFrac * 2.0 * slipW;
        tmpChronoSlip.makeTranslation(swayX, swayY, swayZ);
        tmpChronoRot.makeRotationY(0.12 * lagFrac * slipW * Math.sin(t * 1.1));
        tmpChronoSlip.multiply(tmpChronoRot);
      }
      for(var bj = 0; bj < gh.dummyBones.length; bj++){
        if(slipW > 0.001){
          gh.dummyBones[bj].matrixWorld.multiplyMatrices(tmpChronoSlip, snap.bones[bj]);
        } else {
          gh.dummyBones[bj].matrixWorld.copy(snap.bones[bj]);
        }
      }
      Object.keys(gh.meshesByKey).forEach(function(mk){
        var pair = gh.meshesByKey[mk];
        pair.ghostMesh.visible = !!(pair.srcMesh && pair.srcMesh.parent && pair.srcMesh.visible);
      });
      gh.skel.update();
    }
  }

  /* Extract rigid bone-local geometry for a `kinetic` sub-assembly (`orbit`, `bob`, `chorus_wave`, `crystal_float`) */
  function buildKineticSubmesh(m, z, byName, bones, uTime, uPower){
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

    var subMat = makeZoneMaterial(m.material, z, uTime, false, uPower);
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
          var kn = buildKineticSubmesh(m, z, state.byName, fig.bones, state.uTime, state.uPower);
          if(kn) kinetics.push(kn);
        } else {
          var subIdx = [];
          for(var t2 = t0; t2 < t1; t2++) subIdx.push(i0[3 * t2], i0[3 * t2 + 1], i0[3 * t2 + 2]);
          if(!subIdx.length) return;
          var sGeo = new THREE.BufferGeometry();
          Object.keys(m.geometry.attributes).forEach(function(a){ sGeo.setAttribute(a, m.geometry.attributes[a]); });
          sGeo.setIndex(subIdx);
          var sMat = makeZoneMaterial(m.material, z, state.uTime, true, state.uPower);
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

    var auras = [], chronoTrails = [];
    (vfx.auras || []).forEach(function(as){
      if(!as || !as.kind) return;
      if(as.kind === 'chrono_trail'){
        chronoTrails.push(buildChronoTrail(fig, state));
      } else {
        var au = buildAuraSystem(as, state);
        fig.group.add(au.holder);
        auras.push(au);
      }
    });

    var rec = { mesh: m, item: it, kinetics: kinetics, subSkinned: subSkinned, emitters: emitters, auras: auras, chronoTrails: chronoTrails };
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
    for(var i = 0; i < state.entries.length; i++){
      var ct = state.entries[i].chronoTrails;
      if(ct && ct.length){
        for(var j = 0; j < ct.length; j++) ct[j].synced = false;
      }
    }
    updateExtraplanar(fig, 0);
  }

  function updateExtraplanar(fig, dt){
    var state = fig._kxState;
    if(!state) return;
    var stepDt = dt > 0 ? Math.min(dt, 0.1) : 0.0;
    if(stepDt > 0) state.uTime.value += stepDt;
    var t = state.uTime.value;

    // Update power-use intensity uniform (`uPower`, 0..1+) for Singularity Archon's gravitational lensing & galaxy core
    if(state.pinnedPower !== null){
      state.uPower.value = state.pinnedPower;
    } else {
      var clipPower = 0.0;
      if(fig.action && fig.action.getClip){
        var clipObj = fig.action.getClip();
        var cname = ((clipObj && clipObj.name) || '').toLowerCase();
        if(cname && cname.indexOf('idle') < 0 && cname.indexOf('stand') < 0 && cname.indexOf('guard') < 0 && cname.indexOf('breath') < 0){
          clipPower = (cname.indexOf('burst') >= 0 || cname.indexOf('blast') >= 0 || cname.indexOf('cast') >= 0 || cname.indexOf('beam') >= 0 || cname.indexOf('strike') >= 0 || cname.indexOf('attack') >= 0) ? 0.95 : 0.62;
        }
      }
      if(state.surgeHold > 0){
        state.surgeHold = Math.max(0.0, state.surgeHold - stepDt);
      } else if(stepDt > 0){
        state.surgePeak = Math.max(0.0, state.surgePeak - stepDt * 1.15);
      }
      var targetPwr = Math.max(state.surgePeak, clipPower);
      var rate = targetPwr > state.uPower.value ? 8.5 : 2.6;
      state.uPower.value += (targetPwr - state.uPower.value) * (stepDt > 0 ? Math.min(1.0, stepDt * rate) : 1.0);
    }

    // Update `uPhase` (0.05 .. 1.0) for `vox_shimmer` so Vox Solus shimmers and fades all the way out and back in!
    if(state.pinnedPhase !== null){
      state.uPhase.value = state.pinnedPhase;
    } else {
      var rawWave = 0.5 + 0.5 * Math.sin(t * 1.85);
      var smoothVis = rawWave * rawWave * (3.0 - 2.0 * rawWave);
      var ripple = 0.07 * Math.sin(t * 16.0) * (1.0 - Math.abs(smoothVis * 2.0 - 1.0));
      state.uPhase.value = Math.max(0.05, Math.min(1.0, 0.05 + 0.95 * smoothVis + ripple));
    }

    if(!state.entries.length) return;

    fig.group.updateMatrixWorld(true);
    tmpG.copy(fig.group.matrixWorld).invert();

    var hasPhaseFade = false;
    for(var i0 = 0; i0 < state.entries.length; i0++){
      var e0 = state.entries[i0];
      if(e0.mesh && e0.mesh.parent && e0.mesh.visible && e0.auras){
        for(var a0 = 0; a0 < e0.auras.length; a0++){
          if(e0.auras[a0].kind === 'vox_shimmer') hasPhaseFade = true;
        }
      }
    }

    // Apply (or cleanly restore) full-figure phase-fade across all armour, subSkinned, and kinetic meshes!
    if(hasPhaseFade || state.wasPhaseFaded){
      var visAlpha = hasPhaseFade ? state.uPhase.value : 1.0;
      var applyMatFade = function(meshObj){
        if(!meshObj || !meshObj.material) return;
        var mats = Array.isArray(meshObj.material) ? meshObj.material : [meshObj.material];
        for(var mi = 0; mi < mats.length; mi++){
          var mt = mats[mi];
          if(!mt) continue;
          if(mt.userData._kxOrigTrans === undefined){
            mt.userData._kxOrigTrans = !!mt.transparent;
            mt.userData._kxOrigDepth = mt.depthWrite !== false;
            mt.userData._kxOrigOp = mt.opacity == null ? 1.0 : mt.opacity;
          }
          if(hasPhaseFade){
            if(!mt.transparent){ mt.transparent = true; mt.needsUpdate = true; }
            mt.depthWrite = visAlpha > 0.72 ? mt.userData._kxOrigDepth : false;
            mt.opacity = mt.userData._kxOrigOp * visAlpha;
          } else {
            if(mt.transparent !== mt.userData._kxOrigTrans){ mt.transparent = mt.userData._kxOrigTrans; mt.needsUpdate = true; }
            mt.depthWrite = mt.userData._kxOrigDepth;
            mt.opacity = mt.userData._kxOrigOp;
          }
        }
      };
      if(fig.live){
        Object.keys(fig.live).forEach(function(lk){
          var lm = fig.live[lk];
          if(lm && lm.userData && lm.userData.part && lm.userData.part.role === 'armour'){
            applyMatFade(lm);
          }
        });
      }
      for(var ip = 0; ip < state.entries.length; ip++){
        var ep = state.entries[ip];
        for(var sp = 0; sp < ep.subSkinned.length; sp++) applyMatFade(ep.subSkinned[sp]);
        for(var kp = 0; kp < ep.kinetics.length; kp++) applyMatFade(ep.kinetics[kp].mesh);
      }
      state.wasPhaseFaded = hasPhaseFade;
    }

    for(var i = 0; i < state.entries.length; i++){
      var e = state.entries[i];
      var on = !!(e.mesh && e.mesh.parent && e.mesh.visible);
      var pwrSpeed = 1.0 + 1.15 * state.uPower.value;
      for(var k = 0; k < e.kinetics.length; k++){
        var kn = e.kinetics[k];
        kn.pivot.visible = on;
        if(!on) continue;
        if(kn.motion === 'orbit'){
          tmpQ.setFromAxisAngle(kn.axis, t * kn.speed * pwrSpeed + kn.phase);
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
      if(e.auras){
        for(var a = 0; a < e.auras.length; a++){
          var au = e.auras[a];
          au.holder.visible = on;
          if(!on) continue;
          var abi = state.byName[au.boneName];
          if(abi !== undefined && fig.bones[abi]){
            fig.bones[abi].getWorldPosition(tmpW);
            tmpW.applyMatrix4(tmpG).add(au.offset);
            au.holder.position.copy(tmpW);
            if(au.groundMesh){
              au.groundMesh.position.set(-au.offset.x, 0.018 - au.holder.position.y, -au.offset.z);
            }
          }
        }
      }
      if(e.chronoTrails){
        for(var c = 0; c < e.chronoTrails.length; c++){
          var tr = e.chronoTrails[c];
          tr.holder.visible = on;
          tr.gearHolder.visible = on;
          if(on) updateChronoTrail(fig, state, tr, stepDt, tmpG);
        }
      }
    }

    // Post-clip procedural stance overlay:
    // Ethereal hover/float locomotion for legless Extraplanar entities (censer_revenant, accretion_djinn, singularity_archon, ophanim_seraph, abyssal_medusa)
    var rec = fig.record || {};
    var torsoId = (rec.armour && rec.armour.torso) || '';
    var isFloatEntity = ((torsoId.indexOf('ext_') === 0 || torsoId.indexOf('ext2_') === 0 || torsoId.indexOf('ext3_') === 0 || torsoId.indexOf('ext4_') === 0) && (
      torsoId.indexOf('revenant') >= 0 || torsoId.indexOf('djinn') >= 0 || torsoId.indexOf('archon') >= 0
      || torsoId.indexOf('seraph') >= 0 || torsoId.indexOf('medusa') >= 0 || torsoId.indexOf('neutrino') >= 0
      || torsoId.indexOf('umbra') >= 0 || torsoId.indexOf('urchin') >= 0
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
      uPower: { value: 0.0 },
      uPhase: { value: 1.0 },
      pinnedPower: null,
      pinnedPhase: null,
      wasPhaseFaded: false,
      surgePeak: 0.0,
      surgeHold: 0.0,
      byName: byName,
      itemByKey: itemByKey,
      entries: []
    };
    fig.setExtraplanarPhase = function(val){
      var st = fig._kxState;
      if(!st) return;
      if(val == null){
        st.pinnedPhase = null;
      } else {
        st.pinnedPhase = Math.max(0.04, Math.min(1.0, +val));
        st.uPhase.value = st.pinnedPhase;
      }
    };
    fig.triggerExtraplanarSurge = function(amp, holdSec){
      var st = fig._kxState;
      if(!st) return;
      st.surgePeak = Math.max(st.surgePeak, amp == null ? 1.0 : Math.max(0.0, Math.min(1.5, +amp)));
      st.surgeHold = Math.max(st.surgeHold, holdSec == null ? 1.2 : Math.max(0.0, +holdSec));
    };
    fig.setExtraplanarPower = function(val){
      var st = fig._kxState;
      if(!st) return;
      if(val == null){
        st.pinnedPower = null;
      } else {
        st.pinnedPower = Math.max(0.0, Math.min(1.5, +val));
        st.uPower.value = st.pinnedPower;
      }
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
          if(e.auras) e.auras.forEach(function(au){ if(au.holder.parent) au.holder.parent.remove(au.holder); });
          if(e.chronoTrails) e.chronoTrails.forEach(function(tr){
            if(tr.holder.parent) tr.holder.parent.remove(tr.holder);
            if(tr.gearHolder.parent) tr.gearHolder.parent.remove(tr.gearHolder);
          });
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
