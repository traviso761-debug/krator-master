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
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat.
   The carving rocks and their finishes (PLAN.md 6.1): tuff raw, hewn, plastered, polished; basalt raw and polished; the
   tubes' lining and oxidised breakdown. Constructed: ashlar, earth, paving. Wooden: the kipuka's timber, logs, planks,
   carved wood, thatch. Soft: hide, felt. Fired: terracotta, glaze. The culture's sheets (pat*), the ossuary, the jali. */
const ZJ_LIB={tuff:'tuff',tuffHewn:'tuffHewn',tuffPol:'tuffPol',plaster:'plaster',basalt:'basalt',basaltPol:'basaltPol',lining:'lining',oxide:'oxide',
 ashlar:'ashlar',earth:'earth',paving:'paving',wood:'wood',log:'log',plank:'plank',carved:'carved',thatch:'thatch',hide:'hide',felt:'felt',
 ceramic:'ceramic',glaze:'glaze',ossuary:'ossuary',patLabyrinth:'patLabyrinth',patFrieze:'patFrieze',patFriezeB:'patFriezeB',patFriezeC:'patFriezeC',
 patSkel:'patSkel',patMural:'patMural',patMuralB:'patMuralB',patMuralC:'patMuralC',patTextile:'patTextile',patTextileB:'patTextileB',
 patGlazed:'patGlazed',patGlazedDfly:'patGlazedDfly',patGlazedBeetle:'patGlazedBeetle'};
/* metres per tile when there is no pack (?mat=proc), so the UVs a later pass might use still mean something */
const ZJ_TILE0={tuff:3,tuffHewn:1.5,tuffPol:2,plaster:2,basalt:1.3,basaltPol:1.5,lining:2,oxide:3,ashlar:2,earth:2.5,paving:2.5,wood:1.6,log:1.5,plank:2,
 carved:1.2,thatch:2,hide:.7,felt:.8,ceramic:1,glaze:1,ossuary:1.5,patLabyrinth:1.2,patFrieze:.9,patFriezeB:1.8,patFriezeC:1.8,patSkel:.8,patMural:3,
 patMuralB:3,patMuralC:3,patTextile:1,patTextileB:1,patGlazed:1.2,patGlazedDfly:1.2,patGlazedBeetle:1.2};
const ZJ_CLOTH={felt:1,hide:1,patTextile:1,patTextileB:1,flag:1};   /* thin sheets: double-sided; the flutter attribute (aFlut) */
const ZJ_CUT={tuff:1,tuffHewn:1,tuffPol:1,plaster:1,basalt:1,basaltPol:1,ashlar:1,earth:1,wood:1,log:1,plank:1,carved:1,thatch:1,felt:1,hide:1,
 ceramic:1,glaze:1,patLabyrinth:1,patFrieze:1,patFriezeB:1,patFriezeC:1,patSkel:1,patMural:1,patMuralB:1,patMuralC:1,patTextile:1,patGlazed:1,
 plain:1,copper:1,bronze:1,bone:1,glass:1,flag:1};   /* buckets that carry the cut-away attribute (aCut) */
let TEXANISO=4;   // 90-scene.js raises it to the renderer's maximum (capped at 8) and re-applies it
const ZJ_LIBTEX={};
function zjLibMat(key,o){o=o||{};const fam=ZJ_LIB[key],L=fam&&KMAT.mode==='lib'?KMAT.packed('zeijani',fam):null;
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough===undefined?1:o.rough,metalness:o.metal||(L?L.metal||0:0),side:ZJ_CLOTH[key]?THREE.DoubleSide:THREE.FrontSide});
 TILE[key]=L?L.scale[0]:(ZJ_TILE0[key]||1);
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});ZJ_LIBTEX[key]=T;m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;
  if(m.normalMap){const ns=(L.normalScale||1)*(o.normal===undefined?1:o.normal);m.normalScale.set(ns,ns);}
  m.userData.lib=L;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 MAT[key]=m;return m;}
for(const k in ZJ_LIB)zjLibMat(k,{rough:1});
/* untextured keys: painted and small things (cords, tassels, copper, bone), flags and ribbons (flutter), lamp glass, glow */
MAT.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});TILE.plain=1;
MAT.copper=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.75});TILE.copper=1;
MAT.bronze=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.8});TILE.bronze=1;
MAT.bone=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6});TILE.bone=1;
MAT.obsidian=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.2});TILE.obsidian=1;
MAT.flag=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});TILE.flag=1;
MAT.glass=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.15,metalness:0,transparent:true,opacity:.82,depthWrite:false,emissive:0x000000});TILE.glass=1;
{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.toneMapped=false;MAT.glow=m;TILE.glow=1;}   // embers, lamp flames, glow fungus, lit lattice
MAT.water=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.08,metalness:.1,transparent:true,opacity:.86,depthWrite:false});TILE.water=1;
/* ---------------------------------------------------------------- shared uniforms and the two geometry-side hooks
   ANIMU: uTime (93-anim.js, seconds; pinned by ?t=), uWind, uCut (0/1: the cut-away), uCam (the camera, for the cut).
   CLOTH: vertices move by aFlut x a two-sine wave (aFlut is 0 where the cloth is pinned: emit() writes it from CLOTHW).
   CUT-AWAY: every bucket in ZJ_CUT carries aCut = (cx, cz, baseY, on) of the tent it belongs to (place() sets it for a def
   with cut:true). With uCut on, a fragment of a cut tent above baseY+0.3 whose ground position lies on the camera's half
   of the tent is discarded: the near half of every tent opens, so its furnished interior shows from wherever you look. */
const ANIMU={uTime:{value:0},uWind:{value:1},uCut:{value:0},uCam:{value:new THREE.Vector3()}};
const GLSL_FLICK='float flick(vec3 p,float t){vec3 c=floor(p/1.5);float ph=fract(sin(dot(c,vec3(12.9898,78.233,37.719)))*43758.5453)*6.2832;return .5*sin(t*9.1+ph)+.3*sin(t*15.3+ph*2.1)+.2*sin(t*23.7+ph*3.7);}\n';
function zjAnimHooks(){
 for(const k in ZJ_CLOTH){const m=MAT[k];if(!m)continue;
  matHook(m,'flut',sh=>{sh.uniforms.uTime=ANIMU.uTime;sh.uniforms.uWind=ANIMU.uWind;
   sh.vertexShader='uniform float uTime;uniform float uWind;attribute vec3 aFlut;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float ph=dot(position,vec3(.9,.7,1.3));float s=.62*sin(uTime*3.1+ph*1.7)+.38*sin(uTime*5.3+ph*3.1+1.7);transformed+=aFlut*s*uWind;}');});}
 for(const k in ZJ_CUT){const m=MAT[k];if(!m)continue;
  matHook(m,'cut',sh=>{sh.uniforms.uCut=ANIMU.uCut;sh.uniforms.uCam=ANIMU.uCam;
   sh.vertexShader='attribute vec4 aCut;varying vec4 vCut;varying vec3 vCutW;\n'+sh.vertexShader.replace('#include <project_vertex>','vCut=aCut;vCutW=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');
   sh.fragmentShader='uniform float uCut;uniform vec3 uCam;varying vec4 vCut;varying vec3 vCutW;\n'+sh.fragmentShader.replace('void main() {','void main() {\nif(uCut>.5&&vCut.w>.5&&vCutW.y>vCut.z+.3&&dot(vCutW.xz-vCut.xy,uCam.xz-vCut.xy)>0.)discard;');});}
 matHook(MAT.glow,'flick',sh=>{sh.uniforms.uTime=ANIMU.uTime;
  sh.vertexShader='uniform float uTime;attribute float aFlk;varying float vFlk;\n'+GLSL_FLICK+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlk=1.+aFlk*.3*flick(position,uTime);');
  sh.fragmentShader='varying float vFlk;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=vFlk;');});}
zjAnimHooks();
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const ZJPAL={
 /* the palette (kits/zeijani/PLAN.md section 10): the rocks and their finishes */
 tuff:[0xd9c8a6,0xd2c09c,0xdccdae],tuffRose:[0xc9a28c,0xc29a84],tuffDark:[0xa8987a,0x9e8e70],
 basalt:[0x5c6672,0x56606c,0x626c78],basaltDark:[0x2b2e34,0x32353c],lining:[0xaab4c0],
 /* the oxides (the tubes' breakdown; polished in the red rooms) */
 oxideRed:[0x9a3a3c],oxideRose:[0xc06a74],rust:[0xb4602e],mauve:[0x9a6a86],magenta:[0x74406e],violet:[0x4a4e8a],teal:[0x4a9490],
 sulphur:[0xd6c25a],mineral:[0xdcd8d0],
 /* the alecap and the pigments */
 alecap:[0x5e3470,0x683a7a],lilac:[0x9a78ac],cinnabar:[0xa23a2a],ochre:[0xc49a4a],turquoise:[0x3f8f88],soot:[0x221e1c],bone:[0xe8e0cc,0xe0d6c0],
 copper:[0xa8683a,0x9a5e32],bronze:[0x9a7a3a],
 /* timber, thatch and earth (the kipuka) */
 wood:[0x8a6a48,0x7e6040,0x967450],woodD:[0x4a3424,0x54392a],thatch:[0xb09a64,0xa48c58,0xbaa46e],earth:[0x8a7458,0x7e6a50],
 plaster:[0xe6dcc6,0xeae2ce],hide:[0xa87a4a,0x9a6e42],felt:[0x6e5440,0x7a5e48],ceramic:[0xb0683e,0xa86034],
 glow:[0x8fe8c8],flame:[0xffb04a],ember:[0xff6a1a],white:[0xffffff]
};
function P(k){return jc(pick(ZJPAL[k]),.05);}
const WHITE=new THREE.Color(1,1,1);
