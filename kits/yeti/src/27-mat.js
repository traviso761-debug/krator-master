// ================================================================= MATERIALS: one material per key, library maps from the pack
// The geometry engine (30-geo.js) merges every piece of a key into one mesh with vertex colours and UVs in world
// metres / TILE[key]. A key whose family is in the library pack (materials.json -> tex/ -> 26-matlib-pack.js) draws
// with the set's colour, normal and roughness maps; the vertex colour is the palette tint (a near-grey map for the
// cloth, stone and wood sets, the pattern sheets' own colours under a white tint). ?mat=proc draws vertex colours only.
// Colours are sRGB hex; hc() converts them to the linear working space once.
const MAT={},TILE={};
const SRGB2LIN=c=>{c.convertSRGBToLinear();return c;};
const _HC={};function hc(hex){let c=_HC[hex];if(!c){c=SRGB2LIN(new THREE.Color(hex));_HC[hex]=c;}return c;}
/* a jittered copy of a hex colour (value drift, a little hue), deterministic through the PRNG */
function jc(hex,j){j=j===undefined?.06:j;const c=new THREE.Color(hex);const f=1+rr(-j,j);c.r=clamp(c.r*f,0,1);c.g=clamp(c.g*(1+rr(-j,j)*.5+(f-1)*.5),0,1);c.b=clamp(c.b*(1+(f-1)*.6),0,1);return SRGB2LIN(c);}
/* SHADER HOOKS. A material may take several onBeforeCompile hooks (the library's specular and break-up, the cloth flutter,
   the cut-away); each is registered with a key, and the program cache key is the list of keys, so two materials with
   different hooks never share a compiled program (core/materials/README.md, "The world-UV fix"). */
function matHook(m,key,fn){const H=m.userData.hooks||(m.userData.hooks=[]);if(H.some(h=>h.key===key))return;   /* a material shared by two keys (a fallback pattern) takes each hook once */
 H.push({key,fn});
 m.onBeforeCompile=sh=>{for(const h of m.userData.hooks)h.fn(sh,m);};const ck=H.map(h=>h.key).join('|');m.customProgramCacheKey=()=>ck;m.needsUpdate=true;}
let TEXANISO=4;   // 90-scene.js raises it to the renderer's maximum (capped at 8) and re-applies it
const SV_LIBTEX={};
function svLibMat(key,o){o=o||{};const fam=SV_LIB[key],L=fam&&KMAT.mode==='lib'?KMAT.packed(KIT.pack,fam):null;
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough===undefined?1:o.rough,metalness:o.metal||(L?L.metal||0:0),side:SV_CLOTH[key]?THREE.DoubleSide:THREE.FrontSide});
 TILE[key]=L?L.scale[0]:(SV_TILE0[key]||1);
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});SV_LIBTEX[key]=T;m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;
  if(m.normalMap){const ns=(L.normalScale||1)*(o.normal===undefined?1:o.normal);m.normalScale.set(ns,ns);}
  m.userData.lib=L;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 MAT[key]=m;return m;}
for(const k in SV_LIB)svLibMat(k,{rough:1,metal:k==='iron'?.35:0});
/* a family whose set is not packed yet draws as another (KIT_FALLBACK, 26k-kit.js: [key, stand-in])
   until the owner's sheet is processed */
for(const [k,f] of KIT_FALLBACK)if(KMAT.mode==='lib'&&!KMAT.packed(KIT.pack,k)&&KMAT.packed(KIT.pack,f)){MAT[k]=MAT[f];TILE[k]=TILE[f];}
/* untextured keys: painted and small things (cords, tassels, brass, bone), flags and ribbons (flutter), lamp glass, glow */
MAT.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});TILE.plain=1;
MAT.brass=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.38,metalness:.75});TILE.brass=1;
MAT.bone=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6});TILE.bone=1;
MAT.flag=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});TILE.flag=1;
MAT.glass=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.15,metalness:0,transparent:true,opacity:.82,depthWrite:false,emissive:0x000000});TILE.glass=1;
{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.toneMapped=false;MAT.glow=m;TILE.glow=1;}   // embers, lamp flames, lit glass
MAT.water=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.1,transparent:true,opacity:.86,depthWrite:false});TILE.water=1;
/* ---------------------------------------------------------------- shared uniforms and the two geometry-side hooks
   ANIMU: uTime (93-anim.js, seconds; pinned by ?t=), uWind, uCut (0/1: the cut-away), uCam (the camera, for the cut).
   CLOTH: vertices move by aFlut x a two-sine wave (aFlut is 0 where the cloth is pinned: emit() writes it from CLOTHW).
   CUT-AWAY: every bucket in SV_CUT carries aCut = (cx, cz, baseY, on) of the tent it belongs to (place() sets it for a def
   with cut:true). With uCut on, a fragment of a cut tent above baseY+0.3 whose ground position lies on the camera's half
   of the tent is discarded: the near half of every tent opens, so its furnished interior shows from wherever you look. */
const ANIMU={uTime:{value:0},uWind:{value:1},uCut:{value:0},uCam:{value:new THREE.Vector3()}};
const GLSL_FLICK='float flick(vec3 p,float t){vec3 c=floor(p/1.5);float ph=fract(sin(dot(c,vec3(12.9898,78.233,37.719)))*43758.5453)*6.2832;return .5*sin(t*9.1+ph)+.3*sin(t*15.3+ph*2.1)+.2*sin(t*23.7+ph*3.7);}\n';
function svAnimHooks(){
 for(const k in SV_CLOTH){const m=MAT[k];if(!m)continue;
  matHook(m,'flut',sh=>{sh.uniforms.uTime=ANIMU.uTime;sh.uniforms.uWind=ANIMU.uWind;
   sh.vertexShader='uniform float uTime;uniform float uWind;attribute vec3 aFlut;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float ph=dot(position,vec3(.9,.7,1.3));float s=.62*sin(uTime*3.1+ph*1.7)+.38*sin(uTime*5.3+ph*3.1+1.7);transformed+=aFlut*s*uWind;}');});}
 for(const k in SV_CUT){const m=MAT[k];if(!m)continue;
  matHook(m,'cut',sh=>{sh.uniforms.uCut=ANIMU.uCut;sh.uniforms.uCam=ANIMU.uCam;
   sh.vertexShader='attribute vec4 aCut;varying vec4 vCut;varying vec3 vCutW;\n'+sh.vertexShader.replace('#include <project_vertex>','vCut=aCut;vCutW=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');
   sh.fragmentShader='uniform float uCut;uniform vec3 uCam;varying vec4 vCut;varying vec3 vCutW;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(uCut>.5&&vCut.w>.5&&vCutW.y>vCut.z+.3&&dot(vCutW.xz-vCut.xy,uCam.xz-vCut.xy)>0.)discard;');});}
 matHook(MAT.glow,'flick',sh=>{sh.uniforms.uTime=ANIMU.uTime;
  sh.vertexShader='uniform float uTime;attribute float aFlk;varying float vFlk;\n'+GLSL_FLICK+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlk=1.+aFlk*.3*flick(position,uTime);');
  sh.fragmentShader='varying float vFlk;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=vFlk;');});}
svAnimHooks();
const WHITE=new THREE.Color(1,1,1);
