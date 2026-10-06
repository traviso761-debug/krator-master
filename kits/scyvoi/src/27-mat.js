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
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat. */
const SV_LIB={felt:'felt',canvas:'canvas',goat:'goat',hide:'hide',skin:'skin',wood:'wood',carved:'carved',lacq:'lacq',stone:'stone',rock:'rock',
 paving:'paving',earth:'earth',rug:'rug',rope:'rope',iron:'iron',patFelt:'patFelt',patArch:'patArch',patBlue:'patBlue',patBlack:'patBlack',patRose:'patRose',patPoly:'patPoly',patFlame:'patFlame',patBloom:'patBloom',patKilim:'patKilim',patCold:'patCold',patApp:'patApp',patApp2:'patApp2',patCelest:'patCelest',patStep:'patStep',patQuatre:'patQuatre',
 medSal:'medSal',medBlades:'medBlades',medMoon:'medMoon',medCloud:'medCloud',medStar:'medStar',medSun:'medSun'};   // med*: single panels, mapped once (30-geo.js medallion)
/* metres per tile when there is no pack (?mat=proc), so the UVs a later pass might use still mean something */
const SV_TILE0={felt:.8,canvas:2.4,goat:.5,hide:.7,skin:.35,wood:1.6,carved:1.2,lacq:1.5,stone:2.6,rock:5,paving:3,earth:3,rug:1,rope:.3,iron:.8,patFelt:1.6,patArch:1.4,patBlue:1.2,patBlack:1.2,patRose:2.4,patPoly:2.4,patFlame:2,patBloom:1.8,patKilim:1.6,patCold:1.8,patApp:1.5,patApp2:1.5,patCelest:2.4,patStep:1.6,patQuatre:1.4,medSal:1,medBlades:1,medMoon:1,medCloud:1,medStar:1,medSun:1};
const SV_CLOTH={felt:1,canvas:1,goat:1,hide:1,patFelt:1,patArch:1,patBlue:1,patBloom:1,patKilim:1,patCold:1,patApp:1,patApp2:1,patCelest:1,flag:1};   // thin sheets: double-sided; the flutter attribute (aFlut)
const SV_CUT={felt:1,canvas:1,goat:1,hide:1,patFelt:1,patArch:1,patBlue:1,patBlack:1,patRose:1,patPoly:1,patFlame:1,patBloom:1,patKilim:1,patCold:1,patApp:1,patApp2:1,patCelest:1,lacq:1,wood:1,carved:1,flag:1,plain:1,rope:1,brass:1,bone:1,iron:1,glass:1};   // buckets that carry the cut-away attribute (aCut)
let TEXANISO=4;   // 90-scene.js raises it to the renderer's maximum (capped at 8) and re-applies it
const SV_LIBTEX={};
function svLibMat(key,o){o=o||{};const fam=SV_LIB[key],L=fam&&KMAT.mode==='lib'?KMAT.packed('scyvoi',fam):null;
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough===undefined?1:o.rough,metalness:o.metal||(L?L.metal||0:0),side:SV_CLOTH[key]?THREE.DoubleSide:THREE.FrontSide});
 TILE[key]=L?L.scale[0]:(SV_TILE0[key]||1);
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});SV_LIBTEX[key]=T;m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;
  if(m.normalMap){const ns=(L.normalScale||1)*(o.normal===undefined?1:o.normal);m.normalScale.set(ns,ns);}
  m.userData.lib=L;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 MAT[key]=m;return m;}
for(const k in SV_LIB)svLibMat(k,{rough:1,metal:k==='iron'?.35:0});
/* the rosette strapwork (owner-supplied, optional in materials.json): until its set is processed it draws as the black zellige */
if(KMAT.mode==='lib'&&!KMAT.packed('scyvoi','patRose')&&KMAT.packed('scyvoi','patBlack')){MAT.patRose=MAT.patBlack;TILE.patRose=TILE.patBlack;}
if(KMAT.mode==='lib'&&!KMAT.packed('scyvoi','patPoly')&&KMAT.packed('scyvoi','patBlue')){MAT.patPoly=MAT.patBlue;TILE.patPoly=TILE.patBlue;}
/* the flame zellige and the fire-bloom floral (owner-supplied, optional): until processed they draw as the felt scroll and the arch lining */
for(const [k,f] of [['patFlame','patFelt'],['patBloom','patArch'],['patKilim','patFelt'],['patCold','patBlue']])if(KMAT.mode==='lib'&&!KMAT.packed('scyvoi',k)&&KMAT.packed('scyvoi',f)){MAT[k]=MAT[f];TILE[k]=TILE[f];}
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
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 feltW:[0xf2ece0,0xebe3d2,0xf4efe6,0xe6dcc8],          // white and cream felt (yurt covers)
 feltG:[0x9a9284,0x8a8274,0xa49c8c],                    // grey felt
 feltB:[0x6a5040,0x5c4434,0x7a5a46],                    // brown felt
 canvas:[0xd8c4a0,0xcdb690,0xe0ceaa],                   // bleached tent canvas
 canvasO:[0xd88a2a,0xe0962e,0xc87a22],                  // saffron canvas (bell tent, pavilion)
 khaima:[0x8a6446,0x7c583c,0x946c4c,0x6e4e36],          // brown khaima cloth
 goat:[0xffffff,0xf2eee8,0xe6e2dc],                     // black goat hair: the library set carries the colour (cloth.tent.black); this only varies it
 goatS:[0x9a8a72,0xb0a080,0x7a6a54],                    // the pale woven stripe in a goat-hair roof
 hide:[0x9a6a42,0x8a5c38,0xa8784c,0x7a5032],            // tanned hides
 hideD:[0x4a3020,0x5a3a28],
 madder:[0xa8282a,0x9a2024,0xb43030],crimson:[0xb01a28,0x9e1422],teal:[0x1f5a5e,0x23666a],indigo:[0x23345a,0x2a3c66],
 saffron:[0xd49a2a,0xc88a22],gold:[0xc8a050,0xd8b060],black:[0x1c1a18,0x24201c],cream:[0xece2cc,0xf0e8d6],
 wood:[0xb09a6a,0xa48c5c,0xbca676],woodD:[0x5a3c26,0x4e3220,0x664430],
 lacq:[0xffffff],                                       // the lacquer set keeps its own red
 stone:[0x8e8c86,0x86847e,0x96938a,0x7e7c76,0x9a968c],   // grey andesite (the Baelu)
 stoneD:[0x6a6862,0x5e5c56],
 rock:[0xb07a56,0xa06c4a,0xbc8862],                     // red outcrop
 paving:[0x9a948a,0x8c867c],earth:[0x8a6a4a,0x7a5c40],
 iron:[0x3a3632,0x2e2a26],brass:[0xc8963a,0xb8862e],bone:[0xe4dac4,0xd8ccb0],rope:[0xb89a6a,0xa88a5a],
 skinA:[0x1a1716],skinB:[0x3a2014],spotA:[0xf07818,0xf4a020,0xe85a10],spotB:[0xe8c040,0xd8a830],belly:[0xe8a050,0xd88a3c],
 flame:[0xffb04a],ember:[0xff6a1a],glassR:[0xc0204a],glassA:[0xe0902a],glassB:[0x2a60b0]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
const WHITE=new THREE.Color(1,1,1);
