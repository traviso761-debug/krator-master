// ================================================================= ISLE DEMO — the towns' texture arrays: a whole piece in one draw call
// [web] Three.js r128 draws one material a call, and a kit piece is many materials (the Iziz Vernacular's houses have
// 40-58, the Islanders' 10-20). So a piece near the camera cost a draw call a material. Here, as Godot's Texture2DArray:
// every colour, normal and roughness map the pieces use is copied once into a WebGL2 texture ARRAY of its kind (512 px
// a layer, the maps' own size, so nothing is lost up close), and a piece's opaque parts are merged into one geometry per
// side (front, double) whose vertices say which layer of each array they sample (`lay`) and the part's roughness,
// metalness, normal strength and the library's specular factor (`rmn`), and a triplanar map's layer, tile and gain
// (`det`: a material tagged userData.courtTri, the Beast Riders' detail maps and Iziz's court finishes); their colour (the material's colour times its vertex colours) goes into the
// vertex colours, and a map's offset and repeat into the uvs. One MeshStandardMaterial per side samples the arrays
// (its map, roughness, metalness and normal chunks replaced). Parts that cannot share it stay as they were: transparent
// or alpha-tested ones, MeshBasicMaterial (lamps, fires), emissive ones, and those whose shader moves them (the cloth
// flutter, the flame flicker). The library's own shader hooks (its specular and break-up) are left out of the merged
// material. Nothing here decides anything: it is how a piece is drawn (88t-world-towns.js uses it for the full ring).
//   ISLE_ATLAS.ok                 WebGL2 (texture arrays); without it 88t draws the pieces part by part, as before
//   ISLE_ATLAS.merge(parts)       parts [{geo, mat}] -> {meshes: [{geo, mat}], rest: [parts], retry} (retry: a map not
//                                 loaded yet: ask again later)
//   ISLE_ATLAS.flush()            uploads the arrays that took new layers since the last flush (once a frame)
//   ISLE_ATLAS.stats              {layers: {alb, nor, rgh}, uploads, merged, rest}
var ISLE_ATLAS=(function(){'use strict';
const S=512,R=typeof HOST!=='undefined'&&HOST.renderer?HOST.renderer:null,ok=!!(R&&R.capabilities.isWebGL2&&THREE.DataTexture2DArray);
const st={layers:{alb:0,nor:0,rgh:0},uploads:0,merged:0,rest:0,grown:0};
function arr(cap){const t=new THREE.DataTexture2DArray(new Uint8Array(S*S*4*cap),S,S,cap);t.format=THREE.RGBAFormat;t.type=THREE.UnsignedByteType;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;return t;}
const K={};['alb','nor','rgh'].forEach(k=>{K[k]={cap:16,n:0,of:new Map(),tex:null,dirty:false,uni:{value:null}};});
if(ok)for(const k in K){K[k].tex=arr(K[k].cap);K[k].uni.value=K[k].tex;}
const cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d',{willReadFrequently:true});
const ready=t=>{const im=t&&t.image;if(!im)return false;if(im.complete===false)return false;return (im.naturalWidth||im.width)>0;};
/* a map's layer in its kind's array: copied once (resized to S, turned as the GPU would read it), the array grown as needed */
function layer(k,t){const A=K[k];if(A.of.has(t.uuid))return A.of.get(t.uuid);
 if(A.n>=A.cap){const cap=Math.ceil(A.cap*1.5)+1,nt=arr(cap);nt.image.data.set(A.tex.image.data);A.tex.dispose();A.tex=nt;A.cap=cap;A.uni.value=nt;st.grown++;}
 cx.save();cx.clearRect(0,0,S,S);if(t.flipY){cx.translate(0,S);cx.scale(1,-1);}cx.drawImage(t.image,0,0,S,S);cx.restore();
 const px=cx.getImageData(0,0,S,S).data;   /* the map's pixels into its layer: drawing, not placement (nothing is placed from them) */
 A.tex.image.data.set(px,A.n*S*S*4);const i=A.n++;A.of.set(t.uuid,i);A.dirty=true;st.layers[k]=A.n;return i;}
function flush(){if(!ok)return;for(const k in K){const A=K[k];if(A.dirty){A.tex.needsUpdate=true;A.dirty=false;st.uploads++;}}}
/* the merged material, one per side */
const DUMMY=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1,THREE.RGBAFormat);DUMMY.needsUpdate=true;
function material(side){const m=new THREE.MeshStandardMaterial({vertexColors:true,side,map:DUMMY,normalMap:DUMMY,roughness:1,metalness:0});
 m.onBeforeCompile=sh=>{sh.uniforms.aAlb=K.alb.uni;sh.uniforms.aNor=K.nor.uni;sh.uniforms.aRgh=K.rgh.uni;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 lay;attribute vec4 rmn;attribute vec3 det;varying vec3 vLay;varying vec4 vRmn;varying vec3 vDet;varying vec3 vKfP;varying vec3 vKfN;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvLay=lay;vRmn=rmn;vDet=det;vKfP=position;vKfN=normal;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nprecision highp sampler2DArray;uniform sampler2DArray aAlb;uniform sampler2DArray aNor;uniform sampler2DArray aRgh;varying vec3 vLay;varying vec4 vRmn;varying vec3 vDet;varying vec3 vKfP;varying vec3 vKfN;')
   .replace('#include <map_fragment>','if(vDet.x>-.5){vec3 kW=pow(abs(normalize(vKfN))+1e-4,vec3(4.0));kW/=(kW.x+kW.y+kW.z);vec3 kP=vKfP*vDet.y;'+
    'vec4 kT=texture(aAlb,vec3(kP.zy,vDet.x))*kW.x+texture(aAlb,vec3(kP.xz,vDet.x))*kW.y+texture(aAlb,vec3(kP.xy,vDet.x))*kW.z;diffuseColor.rgb*=sRGBToLinear(kT).rgb*vDet.z;}'+
    'else if(vLay.x>-.5)diffuseColor*=sRGBToLinear(texture(aAlb,vec3(vUv,vLay.x)));')   /* a triplanar map (userData.courtTri: the catalog's detail maps, the court finishes) in the mesh's own frame, as krator-furniture-detail.js */
   .replace('#include <roughnessmap_fragment>','float roughnessFactor=vRmn.x;if(vLay.z>-.5)roughnessFactor*=texture(aRgh,vec3(vUv,vLay.z)).g;')
   .replace('#include <metalnessmap_fragment>','float metalnessFactor=vRmn.y;')
   .replace('#include <normal_fragment_maps>','if(vLay.y>-.5){vec3 mapN=texture(aNor,vec3(vUv,vLay.y)).xyz*2.0-1.0;mapN.xy*=vRmn.z;normal=perturbNormal2Arb(-vViewPosition,normal,mapN,faceDirection);}')
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directSpecular*=vRmn.w;');};   /* the library's specular (KMAT.specularHook), per part */
 m.customProgramCacheKey=()=>'isle-atlas-'+side;m.userData.atlas=true;return m;}
const MATS=ok?{0:material(THREE.FrontSide),2:material(THREE.DoubleSide)}:{};
/* can a part share the merged material? */
const MOVING=/^(flut|flick)/;
function mergeable(m){if(!m||Array.isArray(m))return false;if(!(m.isMeshStandardMaterial||m.isMeshLambertMaterial))return false;
 if(m.transparent||m.alphaTest>0||m.opacity<1||m.alphaMap||m.emissiveMap||(m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)>.01))return false;
 if(m.side===THREE.BackSide)return false;if(m.userData&&m.userData.hooks&&m.userData.hooks.some(h=>MOVING.test(h.key)))return false;return true;}
const _uv=new THREE.Vector3();
/* a part's library entry: the Islanders' on userData.lib (an entry), a bound material's through KMAT.bound (26-matlib-bind.js) */
function libOf(m){const L=m.userData&&m.userData.lib;if(L&&typeof L==='object')return L;
 const f=typeof m.onBeforeCompile==='function'?String(m.onBeforeCompile):'',q=/KMAT\.bound\[("(?:[^"\\]|\\.)*")\]/.exec(f);
 if(q&&typeof KMAT!=='undefined'&&KMAT.bound){const b=KMAT.bound[JSON.parse(q[1])];if(b&&b.lib)return b.lib;}return null;}
function merge(parts){const out={meshes:[],rest:[],retry:false};if(!ok){out.rest=parts.slice();return out;}
 const by={0:[],2:[]};
 for(const p of parts){const m=p.mat;if(!mergeable(m)){out.rest.push(p);continue;}
  for(const t of [m.map,m.normalMap,m.roughnessMap])if(t&&!ready(t)){out.retry=true;return out;}
  by[m.side===THREE.DoubleSide?2:0].push(p);}
 for(const side of [0,2]){const L=by[side];if(!L.length)continue;let nv=0,ni=0;
  for(const p of L){nv+=p.geo.attributes.position.count;ni+=p.geo.index?p.geo.index.count:p.geo.attributes.position.count;}
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3),lay=new Float32Array(nv*3),det=new Float32Array(nv*3),rmn=new Float32Array(nv*4),idx=new Uint32Array(ni);let o=0,k=0;
  for(const p of L){let g=p.geo;if(!g.attributes.normal){g=g.clone();g.computeVertexNormals();}const m=p.mat,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,C=m.vertexColors?g.attributes.color:null;
   const tri=m.userData&&m.userData.courtTri,dt=tri&&m.map?[layer('alb',m.map),tri.tile,tri.detail?tri.gain:1]:[-1,0,0];
   const la=[m.map&&!tri?layer('alb',m.map):-1,m.normalMap&&!tri?layer('nor',m.normalMap):-1,m.roughnessMap&&!tri?layer('rgh',m.roughnessMap):-1];
   const LB=libOf(m),spec=LB&&LB.specular!=null?LB.specular/.5:1,rough=m.isMeshLambertMaterial?1:m.roughness,metal=m.isMeshLambertMaterial?0:m.metalness,ns=m.normalMap&&m.normalScale?m.normalScale.x:1,c=m.color;
   const K=m.userData&&m.userData.uvK?m.userData.uvK:null;let M3=null;if(!K&&m.map){m.map.updateMatrix();M3=m.map.matrix;}   /* a world-unit material's hook ignores the map's transform and scales by K (58 baked the rest) */
   for(let i=0;i<P.count;i++){const j=o+i;pos[j*3]=P.getX(i);pos[j*3+1]=P.getY(i);pos[j*3+2]=P.getZ(i);nor[j*3]=N.getX(i);nor[j*3+1]=N.getY(i);nor[j*3+2]=N.getZ(i);
    if(U){_uv.set(U.getX(i),U.getY(i),1);if(K)_uv.multiplyScalar(K);else if(M3)_uv.applyMatrix3(M3);uv[j*2]=_uv.x;uv[j*2+1]=_uv.y;}
    col[j*3]=c.r*(C?C.getX(i):1);col[j*3+1]=c.g*(C?C.getY(i):1);col[j*3+2]=c.b*(C?C.getZ(i):1);
    lay[j*3]=la[0];lay[j*3+1]=la[1];lay[j*3+2]=la[2];rmn[j*4]=rough;rmn[j*4+1]=metal;rmn[j*4+2]=ns;rmn[j*4+3]=spec;det[j*3]=dt[0];det[j*3+1]=dt[1];det[j*3+2]=dt[2];}
   if(g.index)for(let i=0;i<g.index.count;i++)idx[k++]=o+g.index.getX(i);else for(let i=0;i<P.count;i++)idx[k++]=o+i;o+=P.count;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  G.setAttribute('uv',new THREE.BufferAttribute(uv,2));G.setAttribute('color',new THREE.BufferAttribute(col,3));G.setAttribute('lay',new THREE.BufferAttribute(lay,3));
  G.setAttribute('rmn',new THREE.BufferAttribute(rmn,4));G.setAttribute('det',new THREE.BufferAttribute(det,3));G.setIndex(new THREE.BufferAttribute(idx,1));G.computeBoundingSphere();
  out.meshes.push({geo:G,mat:MATS[side],parts:L.length});st.merged+=L.length;}
 st.rest+=out.rest.length;return out;}
return{ok,merge,flush,stats:st,S,K};})();
