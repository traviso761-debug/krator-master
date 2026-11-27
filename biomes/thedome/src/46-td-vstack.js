/* ================================================================= HOST — native vertical-stack graphics (B1-B5, S1-S6, M1/M2; [G shader])
   Implements GRAPHICS-TERRAIN-PROPOSAL.md Stages 1, 3-5 & Section 12d (B1-B5, M1/M2) natively inside biomes/thedome:
     B1: Normal-aware leaf transmittance backlight gate on foliage shaders
     B2: Baked under-crown radial/height self-occlusion on tree foliage + 0.72..1.00 bole/slab base contact AO
     B4: Cut-out card fringe dilation (canvas destination-over opaque neighbor bleed, zero getImageData!) + BIO.INDEX_ITEMS + BIO.setA2C
     B5/S6: Chromatic convex rose-feldspar nose / cool slate-violet hollow / cyanobacteria scour-flute vertex tinting + KDRAWN ground registry
     M1/M2: KMAT_M1 (27-matlib-m1.js) km1RoughAA mip-variance specular anti-aliasing on rain-slicked granite slabs & KSPELEO.SMOKY quartz prisms
*/
const TD_VSTACK=(function(){
 'use strict';

 const stats={
  version:1,
  indexedItems:!!BIO.INDEX_ITEMS,
  lodMerge:!!BIO.LOD.merge,
  lodCull:!!BIO.LOD.cull,
  a2c:false,
  dilatedCards:0,
  normalGatedLeaves:0,
  crownGroundedInstances:0,
  baseGroundedVerts:0,
  chromaticGroundVerts:0,
  roughAAMats:0,
  drawnSources:0,
  groundLayers:0,
  m1Loaded:typeof KMAT_M1!=='undefined'&&!!KMAT_M1.GLSL_COMMON
 };

 /* B4: Dilate cut-out card fringes on a 2D canvas using destination-over multi-ring bleed (zero getImageData!) */
 function dilateTexture(tex,meanRgb){
  if(!tex||!tex.image||tex.userData&&tex.userData.tdDilated)return false;
  const img=tex.image,w=img.width||0,h=img.height||0;
  if(!(w>=16&&h>=16)||typeof document==='undefined')return false;
  try{
   const cv=document.createElement('canvas');
   cv.width=w;cv.height=h;
   const ctx=cv.getContext('2d');
   ctx.clearRect(0,0,w,h);
   ctx.globalCompositeOperation='source-over';
   ctx.drawImage(img,0,0,w,h);

   /* Bleed opaque neighbor RGB outward behind semi-transparent border pixels without touching alpha!
      Wait: destination-over modifies alpha too if drawn directly onto the main canvas, whereas we ONLY want RGB dilated
      while preserving the exact original alpha channel! Let's check: how do we preserve exact alpha without getImageData?
      No — on a premultiplied/cutout alphaTest + A2C texture, wait: if we use a color-bleed canvas behind RGB and mask with
      destination-in of the original image? Wait: destination-in multiplies alpha by src alpha, keeping alpha = 0 -> 0!
      Even better: in WebGL alphaTest / A2C, dark fringes happen where alpha is 0.02..0.45 and RGB was black [0,0,0] in PNG!
      Wait: pack.py already packs WebP cards, and in a Scratch canvas:
      1. cRGB draws 8-neighbor offsets at 1px & 2px + solid meanRgb backdrop (opaque everywhere!).
      2. When alpha > 0 in img, source-atop on img replaces semi-transparent black RGB? Wait: source-atop draws new pixels
         keeping destination alpha! Let's verify Porter-Duff 'source-atop':
         Result_A = Dst_A (EXACT original card alpha preserved 100% unchanged!!)
         Result_RGB = Src_RGB * Dst_A * Src_A + Dst_RGB * (1 - Src_A)!
         Wait: if Dst is original image, and we first draw original image onto `out`, its alpha is `A_orig`.
         If we build an opaque dilated RGB sheet `cBleed` (meanRgb fill + 8 neighbor draws of `img` + center `img` on top),
         then on `out` (which has `img` with `A_orig`):
         `outCtx.globalCompositeOperation = 'source-atop'; outCtx.drawImage(cBleed, 0, 0);`
         Since `cBleed` has `Src_A = 1.0` everywhere:
         - `Result_A = A_orig` (100.0% bit-exact original alpha channel!)
         - `Result_RGB = cBleed_RGB` (where opaque pixels have `img_RGB`, and semi-transparent edge pixels have neighbor leaf RGB + meanRgb!) */
   const bleed=document.createElement('canvas');
   bleed.width=w;bleed.height=h;
   const bc=bleed.getContext('2d');
   const mr=meanRgb||[96,118,84];
   bc.fillStyle='rgb('+(mr[0]|0)+','+(mr[1]|0)+','+(mr[2]|0)+')';
   bc.fillRect(0,0,w,h);
   const offs=[[-2,0],[2,0],[0,-2],[0,2],[-2,-2],[2,-2],[-2,2],[2,2],[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
   for(let i=0;i<offs.length;i++){
    bc.drawImage(img,offs[i][0],offs[i][1],w,h);
   }
   bc.drawImage(img,0,0,w,h);

   ctx.globalCompositeOperation='source-atop';
   ctx.drawImage(bleed,0,0,w,h);
   ctx.globalCompositeOperation='source-over';
   ctx.drawImage(img,0,0,w,h);

   tex.image=cv;
   tex.needsUpdate=true;
   tex.userData=tex.userData||{};
   tex.userData.tdDilated=true;
   stats.dilatedCards++;
   return true;
  }catch(e){
   return false;
  }
 }

 /* Hook BIO.libSwap so all cutout foliage cards (both swlowlands kin and thedome) get B4 fringe dilation + B1 normal backlight gate */
 if(typeof BIO!=='undefined'&&typeof BIO.libSwap==='function'&&!BIO._tdVstackWrapped){
  BIO._tdVstackWrapped=true;
  const origSwap=BIO.libSwap;
  BIO.libSwap=function(kitName,matTable){
   const res=origSwap.apply(this,arguments);
   if(matTable){
    Object.keys(matTable).forEach(k=>{
     const m=matTable[k];
     if(!m||!m.isMaterial)return;
     if(m.alphaTest>0&&m.map){
      const lc=m.userData&&m.userData.libCard;
      const mn=(lc&&Array.isArray(lc.mean))?lc.mean.map(v=>Math.round(clamp(v,0,1)*255)):[92,116,84];
      if(m.map.image&&m.map.image.width>=16){
       dilateTexture(m.map,mn);
      }else if(m.map.image&&typeof m.map.image.addEventListener==='function'&&!(m.map.userData&&m.map.userData.tdHooked)){
       m.map.userData=m.map.userData||{};
       m.map.userData.tdHooked=true;
       const mapRef=m.map;
       mapRef.image.addEventListener('load',()=>{dilateTexture(mapRef,mn);},{once:true});
      }
      injectLeafNormalGate(m,k);
     }
    });
   }
   return res;
  };
 }

 /* B1: Normal-aware leaf transmittance gate on BIO.leafMat materials (Lambert & Standard safe via varying vTdNz) */
 function injectLeafNormalGate(mat,tag){
  if(!mat||mat.userData&&mat.userData.tdLeafGate)return;
  mat.userData=mat.userData||{};
  mat.userData.tdLeafGate=true;
  if(typeof KHOOK!=='undefined'&&KHOOK.add){
   KHOOK.add(mat,'td-b1-leafgate',sh=>{
    if(sh.fragmentShader.indexOf('totalEmissiveRadiance')>=0&&sh.fragmentShader.indexOf('tdLeafGate')===-1){
     sh.vertexShader=sh.vertexShader
      .replace('#include <common>','#include <common>\nvarying float vTdNz;')
      .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvTdNz=normalize(normalMatrix*objectNormal).z;');
     sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\nvarying float vTdNz;')
      .replace(
       '#include <emissivemap_fragment>',
       '#include <emissivemap_fragment>\n{float tdLeafGate=clamp(0.62+0.38*(1.0-abs(vTdNz)),0.35,1.0);totalEmissiveRadiance*=tdLeafGate;}'
      );
    }
   },{key:()=>'td-b1-'+(tag||'leaf')});
  }
  stats.normalGatedLeaves++;
 }

 /* S6 / B5: Chromatic hollow/nose & cyanobacteria sheetwash-streak vertex tinting across dome meshes */
 function tintLandShape(geo,hFn,opt){
  if(!geo||!geo.attributes||!geo.attributes.position)return 0;
  opt=opt||{};
  const pos=geo.attributes.position,n=pos.count;
  const span=opt.span==null?3.5:opt.span;
  let colAttr=geo.attributes.color;
  const arr=colAttr?colAttr.array:new Float32Array(n*3);
  if(!colAttr){
   for(let i=0;i<n*3;i++)arr[i]=1.0;
  }
  for(let i=0;i<n;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   const hE=hFn(x+span,z),hW=hFn(x-span,z),hN=hFn(x,z-span),hS=hFn(x,z+span);
   const lap=((hE+hW+hN+hS)*0.25)-y;
   /* Positive lap = concave hollow (cool slate-violet shadow + moisture); Negative lap = convex nose (warm rose-feldspar sun lift) */
   const hollow=clamp(lap*0.42,0,1);
   const nose=clamp(-lap*0.42,0,1);
   const sh=DOME_PHYS.shellAt(x,z,SITE);
   const cyano=sh.slickFlute01*(SKEY==='crown'?0.18:0.35);

   let r=arr[i*3],g=arr[i*3+1],b=arr[i*3+2];
   /* Convex exfoliation nose: warm pale rose-aplite lift */
   r*=1.0+0.075*nose-0.11*hollow-0.12*cyano;
   g*=1.0+0.045*nose-0.09*hollow-0.10*cyano;
   b*=1.0+0.025*nose-0.05*hollow-0.07*cyano;
   arr[i*3]=clamp(r,0.34,1.18);
   arr[i*3+1]=clamp(g,0.34,1.18);
   arr[i*3+2]=clamp(b,0.36,1.18);
  }
  if(!colAttr)geo.setAttribute('color',new THREE.BufferAttribute(arr,3));
  else colAttr.needsUpdate=true;
  stats.chromaticGroundVerts+=n;
  return n;
 }

 /* B2: Crown radial-and-height self-occlusion + trunk/boulder base grounding (0.72..1.00 over lowest 0.35 m) */
 function groundMeshBase(geo,groundFn){
  if(!geo||!geo.attributes||!geo.attributes.position)return 0;
  const pos=geo.attributes.position,n=pos.count;
  let col=geo.attributes.color;
  const arr=col?col.array:new Float32Array(n*3).fill(1.0);
  let touched=0;
  for(let i=0;i<n;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   const gy=groundFn(x,z);
   const dy=y-gy;
   if(dy>=-0.8&&dy<=0.42){
    const ao=lerp(0.72,1.0,clamp((dy+0.05)/0.40,0,1));
    arr[i*3]*=ao;arr[i*3+1]*=ao;arr[i*3+2]*=ao;
    touched++;
   }
  }
  if(!col)geo.setAttribute('color',new THREE.BufferAttribute(arr,3));
  else col.needsUpdate=true;
  stats.baseGroundedVerts+=touched;
  return touched;
 }

 /* M1 / M2: KMAT_M1 km1RoughAA normal mip-variance specular anti-aliasing on slick stone & smoky-quartz prisms */
 function applyRoughAA(mat,key,mipVars,texSz){
  if(!mat||typeof KMAT_M1==='undefined'||!KMAT_M1.GLSL_COMMON||typeof KHOOK==='undefined')return false;
  if(mat.userData&&mat.userData.tdRoughAA)return true;
  const vars=(mipVars&&mipVars.length===8)?mipVars:[0.002,0.006,0.014,0.028,0.048,0.075,0.110,0.155];
  const sz=texSz==null?512.0:texSz;
  const vLo=new THREE.Vector4(vars[0],vars[1],vars[2],vars[3]);
  const vHi=new THREE.Vector4(vars[4],vars[5],vars[6],vars[7]);
  mat.userData=mat.userData||{};
  mat.userData.tdRoughAA=true;
  mat.userData.mipVariance=vars.slice();

  KHOOK.add(mat,'td-m2-roughaa',sh=>{
   sh.uniforms.uKmTexSz={value:sz};
   sh.uniforms.uKmVarLo={value:vLo};
   sh.uniforms.uKmVarHi={value:vHi};
   sh.vertexShader=sh.vertexShader
    .replace('#include <common>','#include <common>\nvarying vec2 vKmUv;')
    .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvKmUv=vUv;\n#else\nvKmUv=uv;\n#endif');
   sh.fragmentShader=sh.fragmentShader
    .replace('#include <common>','#include <common>\nvarying vec2 vKmUv;\nuniform float uKmTexSz;\nuniform vec4 uKmVarLo;\nuniform vec4 uKmVarHi;\n'+KMAT_M1.GLSL_COMMON)
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=km1RoughAA(roughnessFactor,dFdx(vKmUv),dFdy(vKmUv),uKmTexSz,uKmVarLo,uKmVarHi);');
  },{key:()=>'td-m2-'+key});

  stats.roughAAMats++;
  return true;
 }

 function recordCrownAO(count){
  stats.crownGroundedInstances+=count;
 }

 function finalize(groundMat,rendererRef){
  stats.indexedItems=!!BIO.INDEX_ITEMS;
  stats.lodMerge=!!BIO.LOD.merge;
  stats.lodCull=!!BIO.LOD.cull;
  if(typeof BIO.setA2C==='function'&&rendererRef){
   stats.a2c=!!BIO.setA2C(rendererRef);
  }
  stats.drawnSources=(typeof KDRAWN!=='undefined'&&KDRAWN.sources)?KDRAWN.sources.length:0;
  stats.groundLayers=(groundMat&&groundMat.userData&&groundMat.userData.kground)?groundMat.userData.kground.length:0;
  window._vstack=Object.assign({},stats);
  return window._vstack;
 }

 window._vstack=stats;
 return{
  stats:stats,
  dilateTexture:dilateTexture,
  injectLeafNormalGate:injectLeafNormalGate,
  tintLandShape:tintLandShape,
  groundMeshBase:groundMeshBase,
  applyRoughAA:applyRoughAA,
  recordCrownAO:recordCrownAO,
  finalize:finalize
 };
})();
