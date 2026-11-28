// ================================================================= VERTICAL-STACK GRAPHICS: K1 UNIFORM DEDUP, M2 SPECULAR AA, M3 POM & M4 GROUNDING
// Implements GRAPHICS-TERRAIN-PROPOSAL.md Stages 5 (M1-M4) and 12d (K1):
//   - K1: Uniform-driven uKmSpec & uKmBreak + sine-free 3D hash so all lit MeshStandardMaterials share minimal WebGL programs.
//   - M2: KMAT_M1.GLSL_COMMON km1RoughAA normal mip-variance specular anti-aliasing on paktong, verdigris, serpentinite, brucite & glazes.
//   - M3: Distance-faded (< 18 m) 6-step + 1 secant planar POM (uPomDepth) on hero Arch masonry families.
//   - M4: World-space plot-base wall/plinth contact AO + concave-only mortar/pore cavity.
const SK_M2_FAMS={
 serpentinite:1,dunite:1,laterite:1,pillowbasalt:1,brucite:1,paving:1,
 tarmangrove:1,ohia:1,catechutrim:1,terracotta:1,
 paktong:1,verdigris:1,bronze:1,iron:1,bitumen:1,shellchime:1,brass:1
};
const SK_POM_FAMS={serpentinite:1,dunite:1,laterite:1,pillowbasalt:1,brucite:1,paving:1};
const SK_NO_BASE_AO={ground:1,sharkhide:1,rayhide:1,catechu:1,byssus:1,kelp:1,netting:1,shellchime:1,flag:1,rope:1};
const SK_VSTACK_META={materials:{},mipFamilies:0,pomFamilies:0};

(function(){
 if(typeof KMAT==='undefined'||typeof THREE==='undefined')return;
 const m1Glsl=(typeof KMAT_M1!=='undefined'&&KMAT_M1.GLSL_COMMON)?KMAT_M1.GLSL_COMMON:'';

 const allFams=Object.keys(SV_LIB).concat(['ground']);
 for(const k of allFams){
  const fam=SV_LIB[k]||k;
  const L=KMAT.packed(KIT.pack,fam);
  if(L&&!L._fam){
   L._fam=fam;
   if(SK_M2_FAMS[fam]&&Array.isArray(L.mipVariance)&&L.mipVariance.length>=6)SK_VSTACK_META.mipFamilies++;
   if(SK_POM_FAMS[fam]&&L.pom)SK_VSTACK_META.pomFamilies++;
  }
 }

 const GLSL_VERT_HEAD='varying vec3 vKmWP;\nvarying vec3 vKmWN;';
 const GLSL_VERT_PROJ=[
  '#ifdef USE_INSTANCING',
  '  vKmWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;',
  '  vKmWN = normalize((modelMatrix * instanceMatrix * vec4(objectNormal, 0.0)).xyz);',
  '#else',
  '  vKmWP = (modelMatrix * vec4(transformed, 1.0)).xyz;',
  '  vKmWN = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);',
  '#endif',
  '#include <project_vertex>'
 ].join('\n');

 const GLSL_FRAG_HEAD=[
  m1Glsl,
  'varying vec3 vKmWP;',
  'varying vec3 vKmWN;',
  'uniform float uKmSpec;',
  'uniform vec3 uKmBreak;',
  'uniform float uKmTexSz;',
  'uniform vec4 uMipVarLo;',
  'uniform vec4 uMipVarHi;',
  'uniform float uPomDepth;',
  'uniform float uHasAlphaH;',
  'uniform float uCavityK;',
  'uniform float uGroundAO;',
  'const vec2 KM_OFF = vec2(0.371, 0.613);',
  'float kmH(vec3 p){',
  '  vec3 q = fract(p * vec3(0.1031, 0.1030, 0.0973));',
  '  q += dot(q, q.yxz + 33.33);',
  '  return fract((q.x + q.y) * q.z);',
  '}',
  'float kmN(vec3 p){',
  '  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(mix(kmH(i), kmH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(kmH(i + vec3(0.0, 1.0, 0.0)), kmH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
  '             mix(mix(kmH(i + vec3(0.0, 0.0, 1.0)), kmH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(kmH(i + vec3(0.0, 1.0, 1.0)), kmH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);',
  '}',
  '#if defined(USE_MAP) && defined(USE_ROUGHNESSMAP)',
  'float kmHeightSample(vec2 uv){',
  '  vec4 c = mapTexelToLinear(texture2D(map, uv));',
  '  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));',
  '  float rg = texture2D(roughnessMap, uv).g;',
  '  return uHasAlphaH > 0.5 ? c.a : clamp(0.52 * sqrt(max(lum, 0.0)) + 0.48 * (1.0 - rg), 0.02, 1.0);',
  '}',
  'vec2 kmPomUv(vec2 uv0){',
  '  if(uPomDepth <= 0.0001) return uv0;',
  '  float dist = length(vViewPosition);',
  '  float fade = 1.0 - smoothstep(9.0, 18.0, dist);',
  '  if(fade <= 0.005) return uv0;',
  '  vec3 q0 = dFdx(-vViewPosition.xyz);',
  '  vec3 q1 = dFdy(-vViewPosition.xyz);',
  '  vec2 st0 = dFdx(uv0);',
  '  vec2 st1 = dFdy(uv0);',
  '  float det = st0.x * st1.y - st1.x * st0.y;',
  '  if(abs(det) <= 1e-8) return uv0;',
  '  float inv = sign(det);',
  '  vec3 Tv = normalize((q0 * st1.y - q1 * st0.y) * inv);',
  '  vec3 Bv = normalize((q1 * st0.x - q0 * st1.x) * inv);',
  '  vec3 Vv = normalize(vViewPosition.xyz);',
  '  vec3 Nv = normalize(vNormal);',
  '  float vz = max(dot(Vv, Nv), 0.24);',
  '  vec2 dUv = (vec2(dot(Vv, Tv), dot(Vv, Bv)) / vz) * (uPomDepth * fade) / 6.0;',
  '  vec2 curUv = uv0, prevUv = uv0;',
  '  float curLayer = 0.0, prevLayer = 0.0;',
  '  float curD = 1.0 - kmHeightSample(curUv), prevD = curD;',
  '  for(int s = 0; s < 6; s++){',
  '    if(curLayer >= curD) break;',
  '    prevUv = curUv; prevD = curD; prevLayer = curLayer;',
  '    curUv -= dUv;',
  '    curLayer += 1.0 / 6.0;',
  '    curD = 1.0 - kmHeightSample(curUv);',
  '  }',
  '  float aft = curD - curLayer, bef = prevD - prevLayer;',
  '  float den = aft - bef;',
  '  float w = abs(den) > 1e-5 ? clamp(aft / den, 0.0, 1.0) : 0.0;',
  '  return mix(curUv, prevUv, w);',
  '}',
  '#endif'
 ].join('\n');

 const GLSL_MAP=[
  '#ifdef USE_UV',
  '  vec2 kmUv = vUv;',
  '  #if defined(USE_MAP) && defined(USE_ROUGHNESSMAP)',
  '    kmUv = kmPomUv(vUv);',
  '  #endif',
  '#else',
  '  vec2 kmUv = vec2(0.0);',
  '#endif',
  'float kmCell = max(uKmBreak.z, 0.5);',
  'float kmM = uKmBreak.x > 0.0 ? smoothstep(0.3, 0.7, kmN(vKmWP / kmCell)) * uKmBreak.x : 0.0;',
  '#ifdef USE_MAP',
  '  vec4 texelColor = mix(texture2D(map, kmUv), texture2D(map, kmUv + KM_OFF), kmM);',
  '  texelColor = mapTexelToLinear(texelColor);',
  '  diffuseColor *= texelColor;',
  '#endif',
  'if(uKmBreak.y > 0.0){',
  '  diffuseColor.rgb *= 1.0 + uKmBreak.y * (kmN(vKmWP / (kmCell * 2.7) + 19.1) * 2.0 - 1.0);',
  '}',
  'if(uGroundAO > 0.0){',
  '  float kmWallK = 1.0 - smoothstep(0.55, 0.92, abs(vKmWN.y));',
  '  float kmFoot = mix(1.0 - uGroundAO, 1.0, smoothstep(0.0, 0.34, max(0.0, vKmWP.y)));',
  '  diffuseColor.rgb *= mix(1.0, kmFoot, kmWallK);',
  '}'
 ].join('\n');

 const GLSL_ROUGH=[
  'float roughnessFactor = roughness;',
  '#ifdef USE_ROUGHNESSMAP',
  '  vec4 texelRoughness = mix(texture2D(roughnessMap, kmUv), texture2D(roughnessMap, kmUv + KM_OFF), kmM);',
  '  roughnessFactor *= texelRoughness.g;',
  '  if(uCavityK > 0.0){',
  '    diffuseColor.rgb *= 1.0 - uCavityK * smoothstep(0.54, 0.90, texelRoughness.g);',
  '  }',
  '#endif',
  '#if defined(USE_UV) && defined(KMAT_M1_ROUGH_AA)',
  '  roughnessFactor = km1RoughAA(roughnessFactor, dFdx(vUv), dFdy(vUv), uKmTexSz, uMipVarLo, uMipVarHi);',
  '#endif'
 ].join('\n');

 function skBuildUniforms(L){
  L=L||{};
  const fam=L._fam||'';
  const spec=(L.specular==null?0.5:L.specular)/0.5;
  const b=KMAT.breakupOn&&L.breakup?L.breakup:null;
  const mx=b&&b.mix!=null?b.mix:0,mc=b&&b.macro!=null?b.macro:0,cl=b&&b.cell!=null?b.cell:8;
  const mv=(SK_M2_FAMS[fam]&&Array.isArray(L.mipVariance))?L.mipVariance:null;
  const isPom=!!(SK_POM_FAMS[fam]&&L.pom);
  const u={
   uKmSpec:{value:spec},
   uKmBreak:{value:new THREE.Vector3(mx,mc,cl)},
   uKmTexSz:{value:L.size==null?512:L.size},
   uMipVarLo:{value:mv?new THREE.Vector4(mv[0]||0,mv[1]||0,mv[2]||0,mv[3]||0):new THREE.Vector4(0,0,0,0)},
   uMipVarHi:{value:mv?new THREE.Vector4(mv[4]||0,mv[5]||0,mv[6]||0,mv[7]||0):new THREE.Vector4(0,0,0,0)},
   uPomDepth:{value:isPom?0.014:0},
   uHasAlphaH:{value:L.height?1:0},
   uCavityK:{value:isPom?0.22:0},
   uGroundAO:{value:SK_NO_BASE_AO[fam]?0:0.26}
  };
  if(fam)SK_VSTACK_META.materials[fam]={spec,breakup:[mx,mc,cl],m2:!!mv,pom:isPom,groundAO:u.uGroundAO.value};
  return u;
 }

 function skApplyHooks(sh,L){
  const u=skBuildUniforms(L);
  Object.assign(sh.uniforms,u);
  const defM2=m1Glsl?'#define KMAT_M1_ROUGH_AA 1\n':'';
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\n'+GLSL_VERT_HEAD)
   .replace('#include <project_vertex>',GLSL_VERT_PROJ);
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <clipping_planes_pars_fragment>','#include <clipping_planes_pars_fragment>\n'+defM2+GLSL_FRAG_HEAD)
   .replace('#include <map_fragment>',GLSL_MAP)
   .replace('#include <roughnessmap_fragment>',GLSL_ROUGH)
   .replace('#include <normal_fragment_maps>',THREE.ShaderChunk.normal_fragment_maps
    .split('texture2D( normalMap, vUv ).xyz')
    .join('(normalize(mix(texture2D( normalMap, kmUv ).xyz * 2.0 - 1.0, texture2D( normalMap, kmUv + KM_OFF ).xyz * 2.0 - 1.0, kmM)) * 0.5 + 0.5)'))
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n  reflectedLight.directSpecular *= uKmSpec;');
 }

 KMAT.libKey=function(){return '|km1';};
 KMAT.libHooks=skApplyHooks;

 for(const k in MAT){
  const m=MAT[k];
  if(!m||!m.userData||!m.userData.hooks||!m.userData.lib)continue;
  const L=m.userData.lib;
  if(!L._fam)L._fam=SV_LIB[k]||k;
  const hooks=m.userData.hooks;
  for(let i=0;i<hooks.length;i++){
   if(hooks[i].key.indexOf('lib')===0){
    hooks[i]={key:'lib|km1',fn:sh=>skApplyHooks(sh,L)};
   }
  }
  const ck=hooks.map(h=>h.key).join('|');
  m.customProgramCacheKey=()=>ck;
  m.needsUpdate=true;
 }
})();
