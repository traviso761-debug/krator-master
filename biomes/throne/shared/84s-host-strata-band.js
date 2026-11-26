// ================================================================= HOST — a wall's beds on a station's ground, in one texture unit (2026-11-24; PLAN.md "the row's terrain")
// KSTRATA's core shader (host/35-core-strata-shade.js) reads five texture units, and the Throne's grounds read fifteen or sixteen, so a station shows
// its beds this way instead: each vertex carries its stratigraphic height (S.yy: the warp and dip of KSTRATA's own lattice) and the wall's mask
// (aSY), and the fragment reads the column's colour (S.colorAt) from one band texture at half a metre a texel. A mesh without aSY (a fine patch)
// reads 0 and shows none. What it leaves out: the core path's per-pixel warp, cross-bedding, varnish, colonnade joints; the beds' relief is the
// ledge pass on the ground itself (S.ledge, the station's terrainH).
//   const SB = THRONE_STRATA_BAND(S, {pad})    -> {t, y0, k} or null (no S)
//   THRONE_STRATA_HOOK(SB, sh, {normal: 'vGN', cover: 'vL0.x+vL0.y', amt: .88})   in the ground's onBeforeCompile, after its own replaces: the
//       uniforms, the attribute, and the colour just before the roughness (after every layer KGROUND adds at its marker)
//   THRONE_STRATA_ATTR(S, mask, x, y, z, k, SY) fills one vertex's aSY (SY: Float32Array of 2 a vertex)
function THRONE_STRATA_BAND(S,o){if(!S)return null;o=o||{};const pad=o.pad==null?40:o.pad,y0=S.range?S.range[0]-pad:-pad,y1=(S.range?S.range[1]:0)+pad,st=.5,n=Math.ceil((y1-y0)/st),d=new Uint8Array(n*4);
 for(let i=0;i<n;i++){const c=S.colorAt(y0+(i+.5)*st);for(let k=0;k<3;k++)d[i*4+k]=Math.round(Math.min(1,Math.max(0,c[k]))*255);d[i*4+3]=255;}
 const t=new THREE.DataTexture(d,n,1,THREE.RGBAFormat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;
 return{t,y0,k:1/(y1-y0)};}
function THRONE_STRATA_ATTR(S,mask,x,y,z,k,SY){SY[k*2]=S.yy(x,y,z);SY[k*2+1]=mask(x,z);}
function THRONE_STRATA_HOOK(SB,sh,o){if(!SB)return;o=o||{};const N=o.normal||'vGN',C=o.cover||'0.0',A=o.amt==null?.88:o.amt;
 sh.uniforms.uStrBand={value:SB.t};sh.uniforms.uStrR={value:new THREE.Vector2(SB.y0,SB.k)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aSY;varying vec2 vSY;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSY=aSY;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vSY;uniform sampler2D uStrBand;uniform vec2 uStrR;')
  .replace('#include <roughnessmap_fragment>','{float sw=vSY.y*smoothstep(0.30,0.62,1.0-clamp(normalize('+N+').y,0.0,1.0))*(1.0-clamp('+C+',0.0,1.0));\n'+
   ' if(sw>0.001){vec3 bc=pow(texture2D(uStrBand,vec2((vSY.x-uStrR.x)*uStrR.y,0.5)).rgb,vec3(2.2));float lu=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114));\n'+
   '  diffuseColor.rgb=mix(diffuseColor.rgb,bc*clamp(lu/0.16,0.55,1.5),sw*'+A.toFixed(3)+');}}\n#include <roughnessmap_fragment>');}
