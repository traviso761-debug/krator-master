/* ================================================================= HOST — ground, KSTRATA, <=3-layer KGROUND, KDRAWN, A-tents, KSTACKS hogbacks & KSPELEO.SMOKY Kluft ([draw])
   Implements:
     - Custom KSTRATA 'laccolith-shell' (+ lateral 'ring-dike-collar' on moat) surface-parallel rock shading
     - KGROUND (<= 3 layers with zero-weight guard, keeping active shader samplers <= 12 < 15) + M2 km1RoughAA specular AA + S6 chromatic vertex tint
     - KDRAWN.add on ALL curved dome terrain, exfoliation steps, cantilevered A-tent lithophone arches, KSTACKS ring-dike hogbacks, and walkable cleft floor/bridge meshes
     - Station 4 (cleft): KCAVERN hydrothermal wall-pockets + KSPELEO.SMOKY (39b2-core-speleo-cleft.js) smoky-quartz & chlorite-microcline megaprisms + KSPELEO.blocks
*/
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
if(typeof BIO!=='undefined'&&typeof BIO.tagReg==='function')BIO.tagReg();
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 DOME_SITES.registerStrata();
 const opt={
  seed:SITE.seed+19,
  recipe:SITE.strataStack||'laccolith-shell',
  range:SITE.strataRange||[-120,260],
  dip:[0.06,0.99,SKEY==='crown'?0.008:0.022],
  warp:[4.2,1.5]
 };
 if(SITE.lateralStrata){
  opt.lateral={recipe:SITE.lateralStrata,range:opt.range,dir:[0,-1],at:[0,-65],d0:-28,d1:42,tongue:18};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='moat'?0x7a6660:0x968882}):null;

/* Exactly 3 KGROUND layer masks per station (zero-weight guarded in 43-core-ground.js -> <= 12 samplers!) */
function masksAt(x,z,h,out){
 const step=FC.at(FC.a.step,x,z),flute=FC.at(FC.a.flute,x,z),rim=FC.at(FC.a.rim,x,z),fen=FC.at(FC.a.fen,x,z);
 if(SKEY==='moat'){
  /* [0] golden sphagnum seepage peat, [1] smooth exfoliation granite-porphyry shell, [2] hogback & riser feldspar grus */
  const sphag=clamp(fen*0.92,0,1);
  const grus=clamp(Math.max(step*0.65,smooth(-55,-95,z)*0.55)*(1-sphag*0.8),0,1);
  const gran=clamp((1-sphag*0.85)*(1-grus*0.55),0,1);
  out[0]=sphag;out[1]=gran;out[2]=grus;out[3]=0;
  return out;
 }
 if(SKEY==='crown'){
  /* [0] smooth summit granite-porphyry shell, [1] contour-riser & pan-rim feldspar grus, [2] bullseye crustose lichen */
  const grus=clamp(Math.max(step*0.78,rim*0.85),0,1);
  const lich=clamp((0.46+0.34*KRAND.fbm(x*0.025,0.5,z*0.025,2,6331))*(1-grus*0.75)*(1-FC.at(FC.a.gnamma,x,z)),0,1);
  const gran=clamp(1-grus*0.65-lich*0.42,0,1);
  out[0]=gran;out[1]=grus;out[2]=lich;out[3]=0;
  return out;
 }
 if(SKEY==='cleft'){
  /* [0] stacked laccolith-shell granite, [1] radial Kluft chockstone & riser feldspar grus, [2] high-shoulder bullseye lichen */
  const inSlot=FC.at(FC.a.cleft,x,z);
  const grus=clamp(Math.max(step*0.72,inSlot*0.68),0,1);
  const lich=clamp(0.42*(1-inSlot)*(1-grus*0.65),0,1);
  const gran=clamp(1-grus*0.58-lich*0.35,0,1);
  out[0]=gran;out[1]=grus;out[2]=lich;out[3]=0;
  return out;
 }
 /* Station 1 (apron): [0] smooth rose-grey granite-porphyry shell, [1] riser & gnamma-rim feldspar grus, [2] dark cyanobacteria scour flutes */
 const scour=clamp(flute*0.68,0,1);
 const grus=clamp(Math.max(step*0.76,rim*0.88)*(1-scour*0.55),0,1);
 const gran=clamp((1-scour*0.55)*(1-grus*0.62),0,1);
 out[0]=gran;out[1]=grus;out[2]=scour;out[3]=0;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const SHELL=K(0xc9b2a8),LEUCO=K(0xdad4ce),GRUS=K(0xd6c2b4),SCOUR=K(0x7c7476);
 const SPHAG=K(0x9a7e38),MOSS_W=K(0x366e44),PORPH=K(0x88484c),LICH=K(0x9a9c78);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/26,0.5,y/26,2,6180)-0.5;
  masksAt(wx,wz,hh,m);
  const rim=FC.at(FC.a.rim,wx,wz);
  if(SKEY==='moat'){
   const dikeBand=smooth(-58,-105,wz);
   c.copy(SHELL).lerp(GRUS,m[2]*0.65).lerp(SPHAG,m[0]*0.82).lerp(PORPH,dikeBand*0.68);
  }else if(SKEY==='crown'){
   c.copy(LEUCO).lerp(SHELL,0.45).lerp(GRUS,m[1]*0.68).lerp(LICH,m[2]*0.52).lerp(MOSS_W,rim*0.62);
  }else if(SKEY==='cleft'){
   const slot=FC.at(FC.a.cleft,wx,wz);
   c.copy(SHELL).lerp(GRUS,m[1]*0.62).lerp(LICH,m[2]*0.46).lerp(SCOUR,slot*0.32);
  }else{
   c.copy(SHELL).lerp(LEUCO,0.32).lerp(GRUS,m[1]*0.65).lerp(SCOUR,m[2]*0.46).lerp(MOSS_W,rim*0.58);
  }
  const k=1+n*0.08;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xe2dcd6,roughness:0.74,metalness:0.02,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xe2dcd6,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.24,0.58,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.32;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.74);':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.78,0.76,0.74),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.16,vWet);');
 }
};

if(USE_KG){
 const layers=SKEY==='moat'?[
  KGROUND.layer('thedome','ground.sphagnum',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'ring-moat golden sphagnum & pitcher peat'}),
  KGROUND.layer('thedome','ground.granite',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'laccolith-shell rose-grey porphyry apron'}),
  KGROUND.layer('thedome','ground.grus',{w:'vGL.z',amt:0.80,gain:1.0,tint:'_gT',name:'ring-dike & collar feldspar-arkose grus'})
 ]:SKEY==='crown'?[
  KGROUND.layer('thedome','ground.granite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'summit leucogranite & porphyry shell'}),
  KGROUND.layer('thedome','ground.grus',{w:'vGL.y',amt:0.82,gain:1.0,tint:'_gT',name:'garland step-riser & pan-rim feldspar grus'}),
  KGROUND.layer('thedome','ground.lichen',{w:'vGL.z',amt:0.80,gain:1.0,tint:'_gT',name:'bullseye summit exfoliation lichen'})
 ]:SKEY==='cleft'?[
  KGROUND.layer('thedome','ground.granite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'stacked laccolith-shell porphyry-granite'}),
  KGROUND.layer('thedome','ground.grus',{w:'vGL.y',amt:0.82,gain:1.0,tint:'_gT',name:'radial Kluft chockstone & feldspar grus'}),
  KGROUND.layer('thedome','ground.lichen',{w:'vGL.z',amt:0.78,gain:1.0,tint:'_gT',name:'high-shoulder crustose granite lichen'})
 ]:[
  KGROUND.layer('thedome','ground.granite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'onion-skin rose-grey quartz-porphyry shell'}),
  KGROUND.layer('thedome','ground.grus',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'exfoliation riser & gnamma-rim feldspar grus'}),
  KGROUND.layer('thedome','ground.scour',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',name:'cyanobacteria rainwater sheetwash scour flute'})
 ];
 KGROUND.hook(MAT_GROUND,{
  key:'thedome-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  relief:KG_RELIEF?{bump:0.05,cavity:0.68,mesh:1}:null,
  layers:layers
 });
}
if(typeof TD_VSTACK!=='undefined'&&USE_KG){
 TD_VSTACK.applyRoughAA(MAT_GROUND,'ground-'+SKEY,[0.002,0.005,0.012,0.026,0.046,0.072,0.108,0.150],512.0);
}

let DRAWN_SRC=null;
function DRAWN_H(x,z){
 if(typeof KDRAWN!=='undefined'&&KDRAWN.sources.length){
  const kh=KDRAWN.h(x,z);
  if(kh!==null)return kh;
 }
 const h=DRAWN_SRC?DRAWN_SRC.h(x,z):null;
 return h===null?terrainH(x,z):h;
}
function DRAWN_N(x,z,span){
 const e=span==null?0.45:span;
 const hx=DRAWN_H(x+e,z)-DRAWN_H(x-e,z),hz=DRAWN_H(x,z+e)-DRAWN_H(x,z-e);
 const nx=-hx,ny=2*e,nz=-hz,L=Math.hypot(nx,ny,nz);
 const inv=L>1e-9?1/L:1;
 return[nx*inv,ny*inv,nz*inv];
}

const GROUND=(function(){
 const N=236,S=TERR.R*2.2,HR=S*0.5,AL=0.18,BC=1-AL,nx=N+1,m4=[0,0,0,0];
 const X=new Float64Array(nx);
 for(let i=0;i<nx;i++){const u=2*(i/N)-1;X[i]=HR*(AL*u+BC*u*u*u);}
 const invIdx=v=>{
  const y=v/HR;
  if(y<=-1)return 0;
  if(y>=1)return N-1;
  const p=AL/BC,q=y/BC,hq=q*0.5,p3=p/3,disc=Math.sqrt(hq*hq+p3*p3*p3);
  const u=Math.cbrt(hq+disc)+Math.cbrt(hq-disc);
  let idx=Math.min(N-1,Math.max(0,Math.floor((u+1)*0.5*N)));
  while(idx>0&&v<X[idx])idx--;
  while(idx<N-1&&v>X[idx+1])idx++;
  return idx;
 };
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),wetA=new Float32Array(nx*nx),hh=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=X[i],z=X[j],y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hh[k]=y;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
  wetA[k]=clamp(Math.max(FC.at(FC.a.flute,x,z)*0.72,FC.at(FC.a.rim,x,z)*0.65,FC.at(FC.a.fen,x,z)*0.75),0,1);
 }
 DRAWN_SRC={
  name:'dome-terrain',
  kind:'warped-grid',
  box:[-HR,-HR,HR,HR],
  h(x,z){
   if(!(x>=-HR&&x<=HR&&z>=-HR&&z<=HR))return null;
   const ix=invIdx(x),iz=invIdx(z);
   const u=clamp((x-X[ix])/(X[ix+1]-X[ix]),0,1),v=clamp((z-X[iz])/(X[iz+1]-X[iz]),0,1);
   const a=hh[iz*nx+ix],d=hh[iz*nx+ix+1],b=hh[(iz+1)*nx+ix],c=hh[(iz+1)*nx+ix+1];
   return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
  }
 };
 if(typeof KDRAWN!=='undefined')KDRAWN.add(DRAWN_SRC);
 BIO.host.terrainH=DRAWN_H;
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setAttribute('aWet',new THREE.BufferAttribute(wetA,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 if(typeof TD_VSTACK!=='undefined')TD_VSTACK.tintLandShape(g,terrainH,{span:4.0});
 const m=new THREE.Mesh(g,MAT_GROUND);
 m.name='ground';
 m.userData.ground=true;
 m.userData.heightAt=DRAWN_H;
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

/* ---------------------------------------------------------------- Station 1 (apron): Cantilevered Hollow A-Tent Pop-Up Lithophone Arches */
const ATENT_ARCHES=(function(){
 if(!SITE.aTents||!SITE.aTents.length)return[];
 const out=[];
 for(let i=0;i<SITE.aTents.length;i++){
  const A=SITE.aTents[i];
  const nx=22,nz=14,hw=A.spanM*0.5,hl=A.lengthM*0.5,th=A.thickM;
  const c=Math.cos(A.ry),sn=Math.sin(A.ry);
  const pos=[],uv=[],col=[],idx=[];
  /* Build 2-surface (top + soffit + side edges) buckled exfoliation granite slab with apex joint gap */
  const vGrid=(layer)=>{
   const base=pos.length/3;
   for(let j=0;j<=nz;j++){
    const vz=(j/nz)*2-1,lz=vz*hl;
    for(let k=0;k<=nx;k++){
     const ux=(k/nx)*2-1,lx=ux*hw;
     const wx=A.x+lx*c-lz*sn,wz=A.z+lx*sn+lz*c;
     const gy=terrainH(wx,wz);
     /* Triangular A-tent buckle profile peaking at center lx = 0 */
     const tentLift=A.gapM*Math.pow(Math.max(0,1-Math.abs(ux)),0.92)*(1-0.18*vz*vz);
     const sinkEnd=Math.abs(ux)>0.92?-0.38*(Math.abs(ux)-0.92)/0.08:0;
     const y=gy+tentLift+sinkEnd+(layer===0?th:0);
     pos.push(wx,y,wz);
     uv.push(lx*0.28,lz*0.28);
     const sh=layer===0?(0.92+0.08*(1-Math.abs(ux))):(0.48+0.18*Math.abs(ux));
     col.push(sh*1.02,sh*0.98,sh*0.96);
    }
   }
   return base;
  };
  const bTop=vGrid(0),bBot=vGrid(1),row=nx+1;
  for(let j=0;j<nz;j++)for(let k=0;k<nx;k++){
   const a=bTop+j*row+k,b=a+row,d=a+1,e=b+1;
   idx.push(a,b,d,b,e,d);
   const a2=bBot+j*row+k,b2=a2+row,d2=a2+1,e2=b2+1;
   idx.push(a2,d2,b2,b2,d2,e2);
  }
  /* Stitch front, back, left, right slab edges so the A-tent shell has crisp 1 m slab thickness */
  for(let k=0;k<nx;k++){
   const tf=bTop+k,bf=bBot+k,tb=bTop+nz*row+k,bb=bBot+nz*row+k;
   idx.push(tf,tf+1,bf,bf,tf+1,bf+1);
   idx.push(tb,bb,tb+1,bb,bb+1,tb+1);
  }
  for(let j=0;j<nz;j++){
   const tl=bTop+j*row,bl=bBot+j*row,tr=bTop+j*row+nx,br=bBot+j*row+nx;
   idx.push(tl,bl,tl+row,bl,bl+row,tl+row);
   idx.push(tr,tr+row,br,br,tr+row,br+row);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  if(typeof TD_VSTACK!=='undefined')TD_VSTACK.groundMeshBase(geo,terrainH);

  const ac=DOME_PHYS.acousticsAt(A.x,A.z,SITE);
  const mesh=new THREE.Mesh(geo,THEDOME.M.rockShell);
  mesh.name='exfoliationarch:'+A.id;
  mesh.userData.host=true;
  mesh.userData.rock=true;
  mesh.userData.inspectLabel='Hollow A-Tent Lithophone Arch ('+A.id+', '+ac.lithophoneHz.toFixed(0)+' Hz flexural stone gong)';
  scene.add(mesh);
  if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(mesh));

  const yBase=terrainH(A.x,A.z);
  REGISTER({
   tagId:'thedome:'+A.id,
   name:'Hollow A-Tent Pop-Up Lithophone Arch ('+ac.lithophoneHz.toFixed(0)+' Hz)',
   tagClass:'feature',
   x:A.x,y:yBase,z:A.z,r:A.spanM*0.58,h:A.gapM+A.thickM+1.5,
   tags:{biome:'thedome',exfoliationarch:true,lithophoneHz:ac.lithophoneHz,hollowGapM:A.gapM}
  });
  out.push({id:A.id,mesh:mesh,lithophoneHz:ac.lithophoneHz});
 }
 return out;
})();

/* ---------------------------------------------------------------- Station 2 (moat): Concentric KSTACKS Ring-Dike & Collar Hogback Fins */
const MOAT_HOGBACKS=(function(){
 if(SKEY!=='moat'||typeof KSTACKS==='undefined')return[];
 const fins=KSTACKS.row({
  id:'moat-ring-dike',
  seed:6261,
  a:[-170,-92],
  b:[140,-96],
  n:7,
  kind:'fin',
  H:[18,38],
  r:[14,24],
  e:[2.6,4.0],
  ground:terrainH
 });
 const meshes=[];
 for(let i=0;i<fins.length;i++){
  const B=fins[i],M0=KSTACKS.mesh(B,{step:4.5});
  const nv=M0.pos.length/3,col=new Float32Array(nv*3);
  for(let k=0;k<nv;k++){
   const oc=0.54+0.46*M0.occ[k];
   col[k*3]=oc*1.04;col[k*3+1]=oc*0.92;col[k*3+2]=oc*0.92;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
  geo.setAttribute('uv',new THREE.BufferAttribute(M0.uv,2));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  geo.setIndex(new THREE.BufferAttribute(M0.idx,1));
  geo.computeVertexNormals();
  if(typeof TD_VSTACK!=='undefined'){
   TD_VSTACK.groundMeshBase(geo,terrainH);
   TD_VSTACK.tintLandShape(geo,terrainH,{span:3.5});
  }
  const mat=(i%3===1)?THEDOME.M.rockSandstone:THEDOME.M.rockPorphyry;
  const fm=new THREE.Mesh(geo,mat);
  fm.name='hogback:fin-'+i;
  fm.userData.host=true;
  fm.userData.rock=true;
  fm.userData.inspectLabel=(i%3===1)?'Upturned Collar Arkose-Carbonate Hogback':'Concentric Red-Porphyry Ring-Dike Fin (+18 dB Whispering Wall)';
  scene.add(fm);
  if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(fm));
  meshes.push(fm);
 }
 REGISTER({
  tagId:'thedome:ring-dike-hogback',
  name:'Concentric Porphyry Ring-Dike & Whispering Scarp',
  tagClass:'feature',
  x:0,y:terrainH(0,-94),z:-94,r:165,h:48,
  tags:{biome:'thedome',ringdike:true,whisperFocusDb:18.5}
 });
 return meshes;
})();

/* ---------------------------------------------------------------- Station 4 (cleft): Walkable Chockstone Ramp/Bridge & KSPELEO.SMOKY Quartz Kluft */
const KLUFT=(function(){
 if(SKEY!=='cleft'||!SITE.cleft||typeof KCAVERN==='undefined'||typeof KSPELEO==='undefined')return null;
 try{
  const CL=SITE.cleft;
  /* 1. Build walkable wedged-chockstone bridge at x = CL.bridgeX (54, 0, y = -13.5) + stepped cleft floor slabs, both registered in KDRAWN! */
  {
   const bg=new THREE.BoxGeometry(11.5,2.6,CL.halfW*2.25,6,2,6);
   const bp=bg.attributes.position,bc=new Float32Array(bp.count*3);
   for(let i=0;i<bp.count;i++){
    const lx=bp.getX(i),ly=bp.getY(i),lz=bp.getZ(i);
    const arch=1.15*(1-(lz/(CL.halfW*1.12))*(lz/(CL.halfW*1.12)));
    const rgh=0.35*(KRAND.unit(KRAND.hash(6441,i,1,3))-0.5);
    bp.setXYZ(i,CL.bridgeX+lx,CL.bridgeY+ly+arch+rgh,lz+0.024*CL.bridgeX);
    const sh=ly>0?0.94:0.56;
    bc[i*3]=sh;bc[i*3+1]=sh*0.97;bc[i*3+2]=sh*0.95;
   }
   bg.setAttribute('color',new THREE.BufferAttribute(bc,3));
   bg.computeVertexNormals();
   const bridgeMesh=new THREE.Mesh(bg,THEDOME.M.rockPegmatite);
   bridgeMesh.name='kluft:chockstone-bridge';
   bridgeMesh.userData.host=true;
   bridgeMesh.userData.rock=true;
   bridgeMesh.userData.inspectLabel='Wedged Granite Chockstone Bridge (Radial Kluft Span)';
   scene.add(bridgeMesh);
   if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(bridgeMesh));

   /* Walkable stepped chockstone ramp treads from x = -124 down to x = +38 along the cleft floor */
   const rPos=[],rUv=[],rCol=[],rIdx=[];
   const nSteps=20;
   for(let s=0;s<nSteps;s++){
    const x0=lerp(-122,36,s/nSteps),x1=lerp(-122,36,(s+0.96)/nSteps);
    const zc=0.024*(x0+x1)*0.5,zw=3.6;
    const yTop=Math.max(terrainH(x0,zc),terrainH(x1,zc))+0.22;
    const yBot=yTop-1.15;
    const b0=rPos.length/3;
    const pts=[
     [x0,yTop,zc-zw],[x1,yTop,zc-zw],[x1,yTop,zc+zw],[x0,yTop,zc+zw],
     [x0,yBot,zc-zw],[x1,yBot,zc-zw],[x1,yBot,zc+zw],[x0,yBot,zc+zw]
    ];
    for(let p=0;p<8;p++){
     rPos.push(pts[p][0],pts[p][1],pts[p][2]);
     rUv.push(pts[p][0]*0.3,pts[p][2]*0.3);
     const sh=p<4?0.92:0.66;
     rCol.push(sh,sh*0.97,sh*0.95);
    }
    rIdx.push(b0,b0+3,b0+2,b0,b0+2,b0+1);
    rIdx.push(b0+1,b0+2,b0+6,b0+1,b0+6,b0+5);
    rIdx.push(b0,b0+4,b0+7,b0,b0+7,b0+3);
   }
   const rg=new THREE.BufferGeometry();
   rg.setAttribute('position',new THREE.Float32BufferAttribute(rPos,3));
   rg.setAttribute('uv',new THREE.Float32BufferAttribute(rUv,2));
   rg.setAttribute('color',new THREE.Float32BufferAttribute(rCol,3));
   rg.setIndex(rIdx);
   rg.computeVertexNormals();
   const rampMesh=new THREE.Mesh(rg,THEDOME.M.rockShell);
   rampMesh.name='kluft:walkable-ramp';
   rampMesh.userData.host=true;
   rampMesh.userData.rock=true;
   rampMesh.userData.inspectLabel='Walkable Wedged-Chockstone Kluft Descent Ramp';
   scene.add(rampMesh);
   if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(rampMesh));
  }

  /* 2. KCAVERN hydrothermal wall vug chambers off the lower Kluft walls + KSPELEO.SMOKY smoky-quartz megaprisms */
  const C=KCAVERN.create({
   ground:terrainH,
   cell:0.5,
   chunk:16,
   seed:KRAND.child(6451,'thedome/cleft/kluft'),
   minRock:0.8,
   walk:typeof KWALK!=='undefined'?KWALK:null
  });
  /* North & south hydrothermal vug pockets opening sideways into the open-sky Kluft floor at y = -35 m (kind: 'door' -> no overhead hole!) */
  C.hall({id:'smoky-pocket-north',owner:'kluft_smoky',c:[14.0,-34.2,-13.5],rx:13.5,rz:7.2,h:9.2,belly:0.32});
  C.opening({id:'smoky-door-north',c:[14.0,-8.2],y:-34.2,r:7.5,h:8.5,kind:'door'});
  C.hall({id:'smoky-pocket-south',owner:'kluft_smoky',c:[-4.0,-34.0,13.5],rx:11.5,rz:6.8,h:8.4,belly:0.30});
  C.opening({id:'smoky-door-south',c:[-4.0,8.2],y:-34.0,r:7.0,h:8.0,kind:'door'});
  C.build();

  const cavDraw=KCAVERN.drawRock(C,{
   THREE:THREE,
   material:THEDOME.M.rockPegmatite,
   tile:64,
   ground:'drop',
   name:'kluft:vug-walls',
   label:'Hydrothermal Pegmatite & Aplite Kluft Vug Wall'
  });
  cavDraw.group.children.forEach(m=>{
   const g=m.geometry,p=g.attributes.position,uv=new Float32Array(p.count*2);
   for(let i=0;i<p.count;i++){uv[i*2]=(p.getX(i)+p.getZ(i))*0.35;uv[i*2+1]=p.getY(i)*0.35;}
   g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   m.userData.probeSkip=true;
  });
  scene.add(cavDraw.group);

  /* Populate pockets using genuine KSPELEO.SMOKY (39b2-core-speleo-cleft.js) boosted for 0.75 g megaprism pockets! */
  const SMOKY_KINDS=Object.assign({},KSPELEO.SMOKY,{
   beam:{p:0.18,len:[0.55,1.45],r:[0.08,0.22],el:[0.45,1.25],minGap:1.4,mineral:'smoky-quartz'},
   block:{p:0.34,len:[0.42,1.25],r:[0.28,0.75],n:[3,7],mineral:'smoky-quartz'},
   druse:{p:0.46,len:[0.08,0.32],r:[0.65,1.8],n:[12,26],mineral:'smoky-quartz'}
  });
  const recsN=KSPELEO.place(C,{
   box:[1.0,-20.0,27.0,-7.0],
   y:-31.5,
   cell:1.6,
   world:KRAND.child(6452,'thedome/cleft/smoky-n'),
   kinds:SMOKY_KINDS
  });
  const recsS=KSPELEO.place(C,{
   box:[-15.0,7.0,7.0,20.0],
   y:-31.5,
   cell:1.7,
   world:KRAND.child(6453,'thedome/cleft/smoky-s'),
   kinds:SMOKY_KINDS
  });
  const recs=recsN.concat(recsS);

  function buildSmokyMesh(subRecs,mat,rgbBody,rgbChlorite,label){
   if(!subRecs.length)return null;
   const M0=KSPELEO.mesh(subRecs,{seg:6}),nv=M0.pos.length/3;
   const uvA=new Float32Array(nv*2),colA=new Float32Array(nv*3);
   for(let i=0;i<nv;i++){
    const vx=M0.pos[i*3],vy=M0.pos[i*3+1],vz=M0.pos[i*3+2];
    uvA[i*2]=(vx+vz)*0.65;uvA[i*2+1]=vy*0.75;
    const chShare=KRAND.unit(KRAND.hash(6459,i,2,11))<0.22?0.35:0.0;
    const sh=0.76+0.24*KRAND.unit(KRAND.hash(6459,i,1,7));
    colA[i*3]=lerp(rgbBody[0],rgbChlorite[0],chShare)*sh;
    colA[i*3+1]=lerp(rgbBody[1],rgbChlorite[1],chShare)*sh;
    colA[i*3+2]=lerp(rgbBody[2],rgbChlorite[2],chShare)*sh;
   }
   const sg=new THREE.BufferGeometry();
   sg.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
   sg.setAttribute('normal',new THREE.BufferAttribute(M0.nrm,3));
   sg.setAttribute('uv',new THREE.BufferAttribute(uvA,2));
   sg.setAttribute('color',new THREE.BufferAttribute(colA,3));
   sg.setIndex(new THREE.BufferAttribute(M0.idx,1));
   sg.computeBoundingSphere();
   const sm=new THREE.Mesh(sg,mat);
   sm.name='kluft:'+label.slice(0,18);
   sm.userData.host=true;
   sm.userData.inspectLabel=label;
   scene.add(sm);
   return sm;
  }

  const prismRecs=recs.filter(r=>r.kind==='beam'||r.kind==='block');
  const druseRecs=recs.filter(r=>r.kind==='druse');
  buildSmokyMesh(prismRecs,THEDOME.M.crystalSmoky,[0.68,0.56,0.46],[0.38,0.54,0.32],'Smoky-Quartz & Chlorite-Dusted Megaprisms (KSPELEO.SMOKY)');
  buildSmokyMesh(druseRecs,THEDOME.M.crystalDruse,[0.88,0.85,0.80],[0.42,0.58,0.36],'Microcline & Quartz Kluft Druse Lining (KSPELEO.SMOKY)');

  /* Visible hexagonal smoky-quartz & chlorite-dusted megaprism clusters jutting from the open Kluft wall vugs (y = -34.5..-25.5 m) */
  {
   const nPrisms=64;
   const pg=new THREE.CylinderGeometry(0.06,0.28,1.0,6,1);
   pg.translate(0,0.5,0);
   const pv=pg.attributes.position,pc=new Float32Array(pv.count*3);
   for(let i=0;i<pv.count;i++){
    const t=clamp(pv.getY(i),0,1);
    const sh=0.62+0.38*t;
    pc[i*3]=sh*0.92;pc[i*3+1]=sh*0.80;pc[i*3+2]=sh*0.68;
   }
   pg.setAttribute('color',new THREE.BufferAttribute(pc,3));
   pg.computeVertexNormals();
   const im=new THREE.InstancedMesh(pg,THEDOME.M.crystalSmoky,nPrisms);
   im.name='kluft:ledge-smoky-megaprisms';
   im.userData.host=true;
   im.userData.inspectLabel='Hydrothermal Kluft Smoky-Quartz Megaprism Cluster';
   const dummy=new THREE.Object3D(),cTmp=new THREE.Color();
   for(let k=0;k<nPrisms;k++){
    const hs=KRAND.hash(6461,k,1,9);
    const u=s=>KRAND.unit(KRAND.hash(hs,s,0,9));
    const cluster=k<28;
    const side=cluster?-1:(k%2===0?-1:1);
    const px=cluster?lerp(8.5,19.5,u(1)):lerp(-18,44,u(1));
    const pz=0.024*px+side*lerp(5.2,CL.halfW-1.4,u(2));
    const py=cluster?lerp(-33.8,-27.2,u(3)):lerp(-34.2,-25.8,u(3));
    const len=cluster?lerp(1.15,2.65,u(4)):lerp(0.75,1.85,u(4));
    const rad=lerp(0.55,1.35,u(5));
    dummy.position.set(px,py,pz);
    dummy.quaternion.copy(qEuler(-side*(0.55+0.48*u(6)),u(7)*TAU,0.28*(u(8)-0.5)));
    dummy.scale.set(rad,len,rad);
    dummy.updateMatrix();
    im.setMatrixAt(k,dummy.matrix);
    cTmp.setHex(u(9)<0.26?0x7d8f72:0xb89a82).convertSRGBToLinear();
    im.setColorAt(k,cTmp);
   }
   im.instanceMatrix.needsUpdate=true;
   if(im.instanceColor)im.instanceColor.needsUpdate=true;
   im.frustumCulled=false;
   scene.add(im);
  }

  /* Sun-slit bounce lights illuminating the smoky-quartz megaprism vug walls inside the Kluft (zero shadow maps, zero sampler cost!) */
  const lN=new THREE.PointLight(0xffdfba,2.35,38,1.5);
  lN.position.set(12.5,-29.2,-3.6);
  scene.add(lN);
  const lS=new THREE.PointLight(0xdceee4,1.65,32,1.5);
  lS.position.set(4.0,-29.8,3.6);
  scene.add(lS);

  let blockCount=0;
  if(typeof KSPELEO.blocks==='function'){
   const blks=KSPELEO.blocks(recs);
   blockCount=blks.length;
   for(let i=0;i<blks.length;i++){
    const bx0=blks[i].box;
    SPACE.insert({kind:'speleo',id:blks[i].id},0.5*(bx0[0]+bx0[1]),0.5*(bx0[2]+bx0[3]),1.1);
   }
  }
  REGISTER({
   tagId:'thedome:kluft-smoky-vault',
   name:'Radial Kluft Smoky-Quartz & Microcline Crystal Vault (KSPELEO.SMOKY)',
   tagClass:'feature',
   x:14.0,y:-34.5,z:-10.5,r:24,h:14,
   tags:{biome:'thedome',speleo:'SMOKY',mineral:'smoky-quartz',crystals:recs.length,blocks:blockCount}
  });
  return{C:C,crystals:recs.length,prisms:prismRecs.length,druse:druseRecs.length,blocks:blockCount};
 }catch(e){
  reportErr('kluft: '+(e.stack||e));
  return null;
 }
})();
window._kluft=KLUFT?{crystals:KLUFT.crystals,prisms:KLUFT.prisms,druse:KLUFT.druse,blocks:KLUFT.blocks}:null;
