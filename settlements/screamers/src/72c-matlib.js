// ---------------------------------------------------------------- the material library (core/materials/record)
// The packed library sets (materials.json -> tools/textures/pack.py -> tex/ -> the generated 72b-matlib-pack.js) go
// onto the MAT entries each family names, in place: every kdef and builder already holds those objects, so nothing
// else changes, and kbake() carries the hook and its cache key onto each InstancedMesh's clone (30-kit.js).
//
// WORLD-SPACE TRIPLANAR, not UVs. This lineage's UVs are in no one unit -- lathe tiles at 8 m, gridSurface at
// whatever uS/vS its caller passed, a kit box at 0..1 over each face however far the instance stretched it -- which
// is why the board-formed concrete ran at a different size on every surface. The hook samples colour, normal and
// roughness three times, once per world axis plane, at the family's tile size in metres, blended by the surface
// normal (instance transforms included). The normal map is reoriented per plane (whiteout blend), so the relief
// faces the right way on every side of a box. A break-up mask (PLAN.md, "Repetition break-up") blends each sample
// with a shifted copy and varies the brightness slowly, so a 300 m soffit does not show its 4 m tile.
//
// The pack normalises each set's mean brightness to the procedural canvas it replaces, so the palette tints set in
// 54-mat-concrete, 69-mat-salvage (the Screamer retint) and 71-village keep their meaning. A family flagged
// `detail` sits on a material that had no map; its mean is divided back out in the shader.
// The procedural canvases are still made (the eager ones draw from rng(), and the seeded stream must not move);
// they are only no longer sampled. ?mat=proc: nothing is attached (the old look). window._materials: the table.
// Godot: StandardMaterial3D's triplanar mode, world-space, at the same tile size.
const SMLIB=(function(){
 const ON=typeof KMAT!=='undefined'&&KMAT.mode==='lib',fams={},stats={on:ON,families:[],materials:{},missing:[]};
 if(!ON)return {on:false,fams,stats};
 const P=KMAT.packed;
 const tri=[
  'vec4 smTri(sampler2D t,vec3 p,vec3 w,float m){',
  ' vec4 a=texture2D(t,p.zy)*w.x+texture2D(t,p.xz)*w.y+texture2D(t,p.xy)*w.z;',
  ' if(m>0.001){vec4 b=texture2D(t,p.zy+SM_OFF)*w.x+texture2D(t,p.xz+SM_OFF)*w.y+texture2D(t,p.xy+SM_OFF)*w.z;a=mix(a,b,m);}',
  ' return a;}',
  'vec3 smNs(sampler2D t,vec2 c,float m){vec3 n=texture2D(t,c).xyz;if(m>0.001)n=mix(n,texture2D(t,c+SM_OFF).xyz,m);',
  ' n=n*2.0-1.0;n.xy*=uSmNs;return n;}'].join('\n');
 const noise=[
  'float smH(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}',
  'float smN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
  ' return mix(mix(mix(smH(i),smH(i+vec3(1.,0.,0.)),f.x),mix(smH(i+vec3(0.,1.,0.)),smH(i+vec3(1.,1.,0.)),f.x),f.y),',
  '            mix(mix(smH(i+vec3(0.,0.,1.)),smH(i+vec3(1.,0.,1.)),f.x),mix(smH(i+vec3(0.,1.,1.)),smH(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
  'const vec2 SM_OFF=vec2(0.371,0.613);'].join('\n');
 const PARS=['varying vec3 vSmWP;','uniform sampler2D uSmMap;','uniform sampler2D uSmNrm;','uniform sampler2D uSmRgh;',
  'uniform float uSmTile;','uniform float uSmGain;','uniform float uSmNs;','uniform float uSmHasN;','uniform float uSmHasR;',
  'uniform float uSmMix;','uniform float uSmMacro;','uniform float uSmCell;',
  'vec3 smWt;vec3 smP;float smM;vec4 smTexel;',noise,tri].join('\n');
 function hook(F){return function(sh){
  const L=F.L,b=L.breakup||{};
  Object.assign(sh.uniforms,{uSmMap:{value:F.tex.map},uSmNrm:{value:F.tex.normalMap},uSmRgh:{value:F.tex.roughnessMap},
   uSmTile:{value:1/((L.scale&&L.scale[0])||2)},uSmGain:{value:F.gain},uSmNs:{value:L.normalScale==null?1:L.normalScale},
   uSmHasN:{value:F.tex.normalMap?1:0},uSmHasR:{value:F.tex.roughnessMap?1:0},
   uSmMix:{value:KMAT.breakupOn?(b.mix||0):0},uSmMacro:{value:KMAT.breakupOn?(b.macro||0):0},uSmCell:{value:b.cell||8}});
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nvarying vec3 vSmWP;')
   .replace('#include <project_vertex>','#ifdef USE_INSTANCING\n vSmWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n'+
    '#else\n vSmWP=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif\n#include <project_vertex>');
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <common>','#include <common>\n'+PARS)
   .replace('#include <map_fragment>',[
    '{',
    '#ifdef FLAT_SHADED',
    ' vec3 nW=normalize(cross(dFdx(vSmWP),dFdy(vSmWP)));',
    '#else',
    ' vec3 nW=inverseTransformDirection(normalize(vNormal),viewMatrix);',
    '#endif',
    ' smWt=pow(abs(nW)+1e-4,vec3(4.0));smWt/=(smWt.x+smWt.y+smWt.z);',
    ' smP=vSmWP*uSmTile;',
    ' smM=smoothstep(0.3,0.7,smN(vSmWP/uSmCell))*uSmMix;',
    ' smTexel=sRGBToLinear(smTri(uSmMap,smP,smWt,smM));',
    ' smTexel.rgb*=uSmGain*(1.0+uSmMacro*(smN(vSmWP/(uSmCell*2.7)+19.1)*2.0-1.0));',
    ' diffuseColor.rgb*=smTexel.rgb;',
    '}'].join('\n'))
   .replace('#include <emissivemap_fragment>','#ifdef USE_EMISSIVEMAP\n totalEmissiveRadiance*=smTexel.rgb;\n#endif')
   .replace('#include <roughnessmap_fragment>','float roughnessFactor=roughness;\nif(uSmHasR>0.5)roughnessFactor*=smTri(uSmRgh,smP,smWt,smM).g;')
   .replace('#include <normal_fragment_maps>',[
    'if(uSmHasN>0.5){',
    ' vec3 nW=inverseTransformDirection(normal,viewMatrix),sg=sign(nW+1e-6);',
    ' vec3 tx=smNs(uSmNrm,smP.zy,smM),ty=smNs(uSmNrm,smP.xz,smM),tz=smNs(uSmNrm,smP.xy,smM);',
    ' tx.x*=sg.x;ty.x*=sg.y;tz.x*=-sg.z;',
    ' tx=vec3(tx.xy+nW.zy,abs(tx.z)*nW.x);',
    ' ty=vec3(ty.xy+nW.xz,abs(ty.z)*nW.y);',
    ' tz=vec3(tz.xy+nW.xy,abs(tz.z)*nW.z);',
    ' vec3 wn=normalize(tx.zyx*smWt.x+ty.xzy*smWt.y+tz.xyz*smWt.z);',
    ' normal=normalize((viewMatrix*vec4(wn,0.0)).xyz);',
    '}'].join('\n'));
  if(F.prev)F.prev(sh);};}
 return {on:true,fams,stats,hook,attach(fam){
  const L=P('screamers',fam);if(!L||!L.map){stats.missing.push(fam);return null;}
  const tex=KMAT.textures(L,{aniso:8});
  // a detail family's material had no map: divide the set's mean back out (linear light, as the shader works)
  const gain=L.detail?1/Math.max(.05,Math.pow(L.mean==null?.5:L.mean,2.2)):1;
  const F=fams[fam]={L,tex,gain};stats.families.push(fam);
  // table 'apoc': the Post-Apoc set's own materials (70e's closure), which the salvage homes are merged into
  const T=L.table==='apoc'?(typeof KratorPostApoc!=='undefined'?KratorPostApoc.MAT:{}):MAT;
  for(const k of L.mat||[]){const m=T[k];if(!m){stats.missing.push(fam+':'+k);continue;}
   const f=Object.assign({},F,{prev:m.onBeforeCompile&&m.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile?m.onBeforeCompile:null});
   // the hook samples its own maps: drop the procedural ones so three neither uploads nor samples them (the emissive
   // map stays, as a flag: the hook multiplies the library colour into the emission instead)
   m.map=null;m.roughnessMap=null;m.metalnessMap=null;m.bumpMap=null;
   // a family that carries its own colour (a set whose hues ARE the surface: laterite and moss) sets the
   // material's tint instead of being multiplied by the palette's (materials.json "color")
   if(L.color&&m.color)m.color.set(L.color);
   m.extensions=Object.assign(m.extensions||{},{derivatives:true});
   m.onBeforeCompile=hook(f);
   const key0=m.customProgramCacheKey&&m.hasOwnProperty('customProgramCacheKey')?m.customProgramCacheKey.bind(m):null;
   m.customProgramCacheKey=function(){return 'smlib1'+(key0?'|'+key0():'');};
   m.userData.lib=L.lib;m.userData.family=fam;m.needsUpdate=true;
   stats.materials[(L.table==='apoc'?'apoc.':'')+k]={family:fam,lib:L.lib,tile:L.scale,detail:!!L.detail};}
  return F;}};
})();
// every family the generated pack carries (72b-matlib-pack.js declares the list with the pack)
if(SMLIB.on)for(const fam of SMLIB_FAMILIES)SMLIB.attach(fam);
window._materials=SMLIB.stats;
