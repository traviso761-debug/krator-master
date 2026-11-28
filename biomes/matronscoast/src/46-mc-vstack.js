// ================================================================= HOST — native vertical-stack graphics & thin-film nacre/mucin sheen ([G shader])
// Implements:
//   - BIO.INDEX_ITEMS = true, merged runtime LOD with 0.15 cross-fade & sphere frustum culling, BIO.setA2C(renderer)
//   - B4 cut-out card fringe dilation via deterministic Canvas2D Porter-Duff compositing (zero getImageData!)
//   - Thin-film nacre & dried-mucin iridescence shader hook (KHOOK, 0 extra texture samplers!)
//   - M1/M2 KMAT_M1 km1RoughAA normal mipVariance specular anti-aliasing on shells, coquina & granite
//   - S6/B5 chromatic hollow/ridge & aspect-moisture vertex tinting + B2 bole grounding & crown AO
{
 BIO.INDEX_ITEMS=PQ.get('index')!=='0';
 BIO.LOD.merge=PQ.get('lodmerge')!=='0';
 BIO.LOD.minTris=1800;
 BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';
}

const MC_VSTACK=(function(){
 const stats={
  indexedItems:BIO.INDEX_ITEMS,
  lodMerge:BIO.LOD.merge,
  lodFade:BIO.LOD.fade,
  lodCull:BIO.LOD.cull,
  a2c:false,
  dilatedCards:0,
  nacreSheenMats:0,
  crownAOInstances:0,
  baseGroundVerts:0,
  chromaticGroundVerts:0,
  roughAAMats:0,
  drawnSources:0
 };

 function dilateCardTextures(packKey,matTable){
  if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||!KMAT.packed||!matTable)return 0;
  for(const k in matTable){
   const m=matTable[k];
   if(!m||!m.isMaterial||!m.userData||!m.userData.libCard||!m.map)continue;
   if(typeof BIO._fringe==='function')BIO._fringe(m.map);
   stats.dilatedCards++;
  }
  return stats.dilatedCards;
 }

 function applyRoughAA(mat,tagKey,mipVars,texSize){
  if(!mat||typeof KHOOK==='undefined'||typeof KMAT_M1==='undefined'||mat.userData.km1RoughAA)return mat;
  const vars=mipVars||[0.002,0.009,0.024,0.052,0.094,0.145,0.195,0.245];
  const sz=texSize==null?512.0:texSize;
  const vLo=new THREE.Vector4(vars[0],vars[1],vars[2],vars[3]);
  const vHi=new THREE.Vector4(vars[4],vars[5],vars[6],vars[7]);
  mat.userData.km1RoughAA=true;
  mat.extensions=Object.assign({},mat.extensions||{},{derivatives:true});
  KHOOK.add(mat,'km1-rough-aa-'+tagKey,{
   uniforms:()=>({
    uKm1VarLo:{value:vLo},
    uKm1VarHi:{value:vHi},
    uKm1TexSz:{value:sz}
   }),
   vertex:{
    head:'varying vec2 vKm1Uv;\n',
    at:[{at:'uv_vertex',after:'vKm1Uv = uv;'}]
   },
   fragment:{
    head:'uniform vec4 uKm1VarLo;\nuniform vec4 uKm1VarHi;\nuniform float uKm1TexSz;\nvarying vec2 vKm1Uv;\n'+KMAT_M1.GLSL_COMMON+'\n',
    at:[{at:'roughnessmap_fragment',after:'roughnessFactor = km1RoughAA(roughnessFactor, dFdx(vKm1Uv), dFdy(vKm1Uv), uKm1TexSz, uKm1VarLo, uKm1VarHi);'}]
   }
  });
  stats.roughAAMats++;
  return mat;
 }

 /* Analytical thin-film aragonite nacre & dried-mucin interference hook (0 extra samplers!) */
 function applyNacreSheen(mat,tagKey,strength,filmPhase){
  if(!mat||typeof KHOOK==='undefined'||mat.userData.mcNacreSheen)return mat;
  const str=strength==null?0.26:strength;
  const phs=filmPhase==null?11.5:filmPhase;
  mat.userData.mcNacreSheen=true;
  KHOOK.add(mat,'mc-nacre-'+tagKey,{
   uniforms:()=>({
    uNacreStr:{value:str},
    uNacrePh:{value:phs}
   }),
   fragment:{
    head:'uniform float uNacreStr;\nuniform float uNacrePh;\n',
    at:[{at:'aomap_fragment',after:'{\n float _ndv=clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0);\n float _fres=pow(1.0-_ndv,2.1);\n vec3 _film=0.5+0.5*cos(uNacrePh*_ndv+vec3(0.0,2.05,4.15));\n reflectedLight.indirectSpecular+=_film*(_fres*uNacreStr);\n}\n'}]
   }
  });
  stats.nacreSheenMats++;
  return mat;
 }

 function tintTerrainMesh(mesh,hFn,spanM){
  if(!mesh||!mesh.geometry||!mesh.geometry.attributes.position)return 0;
  const g=mesh.geometry,P=g.attributes.position,N=g.attributes.normal;
  const n=P.count,e=spanM==null?3.6:spanM;
  const existing=g.attributes.color?g.attributes.color.array:null;
  const col=new Float32Array(n*3);
  for(let i=0;i<n;i++){
   const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
   const hAvg=0.25*(hFn(x+e,z)+hFn(x-e,z)+hFn(x,z+e)+hFn(x,z-e));
   const lap=clamp((y-hAvg)/(e*0.38),-1,1);
   const nx=N?N.getX(i):0,nz=N?N.getZ(i):0;
   const moistAspect=clamp((-nz*0.68+nx*0.38)*0.5+0.5,0,1);
   const hollow=Math.max(0,-lap),ridge=Math.max(0,lap);
   const rMul=clamp(1.0+ridge*0.070-hollow*0.105+(0.5-moistAspect)*0.04,0.75,1.12);
   const gMul=clamp(1.0+ridge*0.045-hollow*0.052+(moistAspect-0.5)*0.03,0.80,1.10);
   const bMul=clamp(1.0+ridge*0.025-hollow*0.075+(moistAspect-0.5)*0.045,0.77,1.09);
   const br=existing?existing[i*3]:1.0,bg=existing?existing[i*3+1]:1.0,bb=existing?existing[i*3+2]:1.0;
   col[i*3]=br*rMul;
   col[i*3+1]=bg*gMul;
   col[i*3+2]=bb*bMul;
  }
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  if(mesh.material&&!Array.isArray(mesh.material)){
   mesh.material.vertexColors=true;
   mesh.material.needsUpdate=true;
  }
  stats.chromaticGroundVerts+=n;
  return n;
 }

 function applyPostBake(groundFn,crownCenters){
  const gFn=groundFn||terrainH;
  scene.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh||!o.userData||!o.userData.biome)return;
   const g=o.geometry,P=g&&g.attributes&&g.attributes.position,C=g&&g.attributes&&g.attributes.color;
   if(!P||!C)return;
   o.updateMatrixWorld();
   const e=o.matrixWorld.elements,n=P.count;
   for(let i=0;i<n;i++){
    const lx=P.getX(i),ly=P.getY(i),lz=P.getZ(i);
    const wx=e[0]*lx+e[4]*ly+e[8]*lz+e[12];
    const wy=e[1]*lx+e[5]*ly+e[9]*lz+e[13];
    const wz=e[2]*lx+e[6]*ly+e[10]*lz+e[14];
    const agl=wy-gFn(wx,wz);
    if(agl>=-0.6&&agl<=0.42){
     const ao=lerp(0.72,1.0,smooth(0.0,0.36,Math.max(0,agl)));
     C.setXYZ(i,C.getX(i)*ao,C.getY(i)*ao*1.01,C.getZ(i)*ao*0.98);
     stats.baseGroundVerts++;
    }
   }
   C.needsUpdate=true;
  });

  if(crownCenters&&crownCenters.length){
   const grid=KSPACE.create({cell:16});
   for(let i=0;i<crownCenters.length;i++){
    const cc=crownCenters[i];
    grid.insert(cc,cc.x,cc.z,cc.r);
   }
   const M4=new THREE.Matrix4(),V=new THREE.Vector3(),near=[];
   scene.traverse(o=>{
    if(!o.isInstancedMesh||!o.userData||!o.userData.biome||!o.instanceColor)return;
    const nm=o.name||'';
    if(!/_fol$|_clump$|_frond$/.test(nm))return;
    o.updateMatrixWorld();
    const ic=o.instanceColor;
    for(let i=0;i<o.count;i++){
     o.getMatrixAt(i,M4);
     V.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld);
     near.length=0;
     grid.query(V.x,V.z,10.5,near);
     let best=null,bd=1e9;
     for(let k=0;k<near.length;k++){
      const c=near[k],d=Math.hypot(V.x-c.x,V.z-c.z);
      if(d<bd){bd=d;best=c;}
     }
     if(best){
      const rNorm=clamp(bd/Math.max(1.5,best.r),0,1.2);
      const hNorm=clamp((V.y-best.y0)/Math.max(2.0,best.h),0,1.1);
      const occ=lerp(0.65,1.0,clamp(0.45*rNorm+0.55*hNorm,0,1));
      ic.setXYZ(i,ic.getX(i)*occ,ic.getY(i)*lerp(occ*1.03,1.0,0.2),ic.getZ(i)*occ*0.97);
      stats.crownAOInstances++;
     }
    }
    ic.needsUpdate=true;
   });
  }
  return stats;
 }

 function enableA2C(rd){
  stats.a2c=!!(typeof BIO.setA2C==='function'&&BIO.setA2C(rd));
  return stats.a2c;
 }

 function noteDrawn(){
  stats.drawnSources=typeof KDRAWN!=='undefined'&&KDRAWN.sources?KDRAWN.sources.length:0;
  return stats.drawnSources;
 }

 return{
  stats:stats,
  dilateCardTextures:dilateCardTextures,
  applyRoughAA:applyRoughAA,
  applyNacreSheen:applyNacreSheen,
  tintTerrainMesh:tintTerrainMesh,
  applyPostBake:applyPostBake,
  enableA2C:enableA2C,
  noteDrawn:noteDrawn
 };
})();
window.MC_VSTACK=MC_VSTACK;
