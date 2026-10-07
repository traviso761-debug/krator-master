// ================================================================= MATERIALS: one material per key, library maps from the pack
// (forked from kits/scyvoi/src/27-mat.js). The geometry engine (30-geo.js, vendored) merges every piece of a key into one
// mesh with vertex colours and UVs in world metres / TILE[key]. A key whose family is in the library pack (materials.json
// -> tex/ -> 26-matlib-pack.js) draws with the set's colour, normal and roughness maps; the vertex colour is the palette
// tint. ?mat=proc draws vertex colours only. Colours are sRGB hex; hc() converts them to linear once.
const MAT={},TILE={};
const SRGB2LIN=c=>{c.convertSRGBToLinear();return c;};
const _HC={};function hc(hex){let c=_HC[hex];if(!c){c=SRGB2LIN(new THREE.Color(hex));_HC[hex]=c;}return c;}
/* a jittered copy of a hex colour (value drift, a little hue), deterministic through the PRNG */
function jc(hex,j){j=j===undefined?.06:j;const c=new THREE.Color(hex);const f=1+rr(-j,j);c.r=clamp(c.r*f,0,1);c.g=clamp(c.g*(1+rr(-j,j)*.5+(f-1)*.5),0,1);c.b=clamp(c.b*(1+(f-1)*.6),0,1);return SRGB2LIN(c);}
/* SHADER HOOKS: several onBeforeCompile hooks per material, each with a key; the program cache key is the list of keys
   (core/materials/README.md, "The world-UV fix") */
function matHook(m,key,fn){const H=m.userData.hooks||(m.userData.hooks=[]);if(H.some(h=>h.key===key))return;
 H.push({key,fn});
 m.onBeforeCompile=sh=>{for(const h of m.userData.hooks)h.fn(sh,m);};const ck=H.map(h=>h.key).join('|');m.customProgramCacheKey=()=>ck;m.needsUpdate=true;}
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat. */
const NR_LIB={white:'white',conc:'conc',cracked:'cracked',rust:'rust',paint:'paint',deck:'deck',floor:'floor',marble:'marble',grate:'grate',
 plaster:'plaster',turf:'turf',timber:'timber',tarred:'tarred',barn:'barn',sail:'sail',corr:'corr',glyph:'glyph'};
const NR_TILE0={white:4,conc:3,cracked:3.5,rust:2.5,paint:2,deck:2,floor:2.2,marble:2.4,grate:1.6,plaster:2.5,turf:3,timber:2,tarred:1.5,barn:1.2,sail:2.4,corr:2,glyph:2};
/* the vendored geometry engine reads these two tables: thin sheets that flutter (SV_CLOTH) and buckets that carry the tents'
   cut-away attribute (SV_CUT: none here; the arcology is cut by deck, below) */
const SV_CLOTH={sail:1,flag:1};
const SV_CUT={};
let TEXANISO=4;   // 90-scene.js raises it to the renderer's maximum (capped at 8) and re-applies it
const NR_LIBTEX={};
function nrLibMat(key,o){o=o||{};const fam=NR_LIB[key],L=fam&&KMAT.mode==='lib'?KMAT.packed('noahs-regret',fam):null;
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough===undefined?1:o.rough,metalness:o.metal||(L?L.metal||0:0),side:SV_CLOTH[key]?THREE.DoubleSide:THREE.FrontSide});
 TILE[key]=L?L.scale[0]:(NR_TILE0[key]||1);
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});NR_LIBTEX[key]=T;m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;
  if(m.normalMap){const ns=(L.normalScale||1)*(o.normal===undefined?1:o.normal);m.normalScale.set(ns,ns);}
  m.userData.lib=L;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 MAT[key]=m;return m;}
for(const k in NR_LIB)nrLibMat(k,{rough:1,metal:k==='rust'||k==='grate'?.3:k==='paint'?.15:0});
/* untextured keys: small painted things, brass, lamp glow, glass, water, the flag */
MAT.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8});TILE.plain=1;
MAT.brass=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.75});TILE.brass=1;
MAT.dark=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});TILE.dark=1;           // service shafts, voids, ducts
MAT.flag=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});TILE.flag=1;
MAT.glass=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.2,transparent:true,opacity:.55,depthWrite:false});TILE.glass=1;
{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.toneMapped=false;MAT.glow=m;TILE.glow=1;}   // lamp flames, lit lenses
MAT.water=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.06,metalness:.1,transparent:true,opacity:.82,depthWrite:false});TILE.water=1;
/* ---------------------------------------------------------------- shared uniforms and the geometry-side hooks
   ANIMU: uTime (93-anim.js, seconds; pinned by ?t=), uWind, and the DECK CUT: uCutOn (0/1), uCutY (a height in the HULL
   frame), uHullInv (world -> hull). With the cut on, every fragment of a hull material above uCutY is discarded and the
   back faces of solid materials draw in the section colour, so the decks read as a cut plan: walls and slabs show as
   solid sections and the furnished rooms of the deck below lie open. The furniture's materials take the same hook
   (91f-furnish.js). */
const ANIMU={uTime:{value:0},uWind:{value:1},uCutOn:{value:0},uCutY:{value:1e4},uHullInv:{value:new THREE.Matrix4()},uSec:{value:new THREE.Color(0x2a1a16)}};
ANIMU.uHullInv.value.fromArray(NR_HULL.m16).invert();
const NR_SOLID=new Set();      // materials that show the section colour on their back faces while cut
function nrCutHook(m,solid){if(solid)NR_SOLID.add(m);
 matHook(m,'deckcut',sh=>{sh.uniforms.uCutOn=ANIMU.uCutOn;sh.uniforms.uCutY=ANIMU.uCutY;sh.uniforms.uHullInv=ANIMU.uHullInv;sh.uniforms.uSec=ANIMU.uSec;
  sh.vertexShader='uniform mat4 uHullInv;varying float vNrHy;\n'+sh.vertexShader.replace('#include <project_vertex>',
   'vec4 nrW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nnrW=instanceMatrix*nrW;\n#endif\nnrW=modelMatrix*nrW;vNrHy=(uHullInv*nrW).y;\n#include <project_vertex>');
  sh.fragmentShader='uniform float uCutOn;uniform float uCutY;uniform vec3 uSec;varying float vNrHy;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(uCutOn>.5&&vNrHy>uCutY)discard;')
   .replace('#include <dithering_fragment>','#include <dithering_fragment>\n'+(solid?'if(uCutOn>.5&&!gl_FrontFacing)gl_FragColor=vec4(uSec,1.0);':''));});}
const GLSL_FLICK='float flick(vec3 p,float t){vec3 c=floor(p/1.5);float ph=fract(sin(dot(c,vec3(12.9898,78.233,37.719)))*43758.5453)*6.2832;return .5*sin(t*9.1+ph)+.3*sin(t*15.3+ph*2.1)+.2*sin(t*23.7+ph*3.7);}\n';
function nrAnimHooks(){
 for(const k in SV_CLOTH){const m=MAT[k];if(!m)continue;
  matHook(m,'flut',sh=>{sh.uniforms.uTime=ANIMU.uTime;sh.uniforms.uWind=ANIMU.uWind;
   sh.vertexShader='uniform float uTime;uniform float uWind;attribute vec3 aFlut;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float ph=dot(position,vec3(.9,.7,1.3));float s=.62*sin(uTime*3.1+ph*1.7)+.38*sin(uTime*5.3+ph*3.1+1.7);transformed+=aFlut*s*uWind;}');});}
 matHook(MAT.glow,'flick',sh=>{sh.uniforms.uTime=ANIMU.uTime;
  sh.vertexShader='uniform float uTime;attribute float aFlk;varying float vFlk;\n'+GLSL_FLICK+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlk=1.+aFlk*.3*flick(position,uTime);');
  sh.fragmentShader='varying float vFlk;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=vFlk;');});
 for(const k in MAT)nrCutHook(MAT[k],!(k==='glass'||k==='water'||k==='glow'||k==='flag'||k==='sail'));}
nrAnimHooks();
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const NRPAL={
 white:[0xeceae4,0xe6e3dc,0xf0eee8,0xe2ded4],          // the Ancient white panels, weathered
 whiteS:[0xcfc8b8,0xc4bcaa,0xd6cfc0],                   // stained (under ledges, near the waterline)
 conc:[0xb8b4aa,0xaca89e,0xc2beb4],concD:[0x8a867c,0x7e7a70],
 rust:[0xffffff,0xf0e8e0],paint:[0x5a6a72,0x4e5e66,0x667680],paintR:[0x8a3a2a,0x7a3224],
 deck:[0xd8d2c4,0xcec8ba,0xe0dacc],floor:[0xb8946a,0xa88458,0xc4a074],marble:[0xf2ede4,0xece6dc,0xf6f2ea],
 plaster:[0xe8e2d6,0xdcd6c8,0xf0eadc],turf:[0x7a9a4a,0x6e8e40,0x86a456],soil:[0x6a5238,0x5e4830],
 timber:[0xb09068,0xa08058,0xbca07a],tarred:[0x5a4a3a,0x4e4032],barn:[0xffffff],
 sail:[0xd8ccb0,0xccbe9e,0xe2d8be],sailR:[0x9a2a22,0x8a2420],corr:[0xb0a090,0x9a8a7a,0xc0b0a0],
 glass:[0x6a8a98],glassD:[0x2a3a42],dark:[0x2a2c2e,0x24262a],metal:[0x6a6e72,0x5a5e62],brass:[0xc8963a],
 lamp:[0xffc070],glowW:[0xfff0d0],red:[0xa82a22],black:[0x18181a]
};
function P(k){return jc(pick(NRPAL[k]),.05);}
const WHITE=new THREE.Color(1,1,1);
