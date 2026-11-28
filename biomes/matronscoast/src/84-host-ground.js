// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA, KSTACKS & KDRAWN ([draw])
// Implements:
//   - KSTRATA coastal granite/ironstone capped by white-buff biogenic coquina shell-limestone ('ria-carbonate-bluff')
//   - KGROUND <= 3 height-blended layers (ground.coquina, ground.granite, ground.mucus over ground.litter paint -> < 13 samplers!)
//   - Thin-film silver-violet dried-mucin iridescence along vGL.z (0 extra texture samplers; uses kEye, never cameraPosition)
//   - KSTACKS cemented spiral Coquina Conch-Midden banks & wave-notched granite skerry stacks/tors + KDRAWN registration
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'matronscoast'+(SKEY==='skerry'?'':'-'+SKEY)});
 for(let i=0;i<REG.length;i++){
  const r=REG[i];
  if(r&&r.tagId){try{KTAGS.page.add({id:r.tagId,name:r.name,class:r.tagClass||'feature',at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,tags:r.tags||{}});}catch(e){}}
 }
}
const USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 return KSTRATA.create({
  seed:SITE.seed+810,
  range:sc.range,
  formations:sc.formations,
  dip:[0.18,0.94,SKEY==='cloudslope'?0.042:0.022],
  warp:[3.8,1.3]
 });
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x78746a}):null;

// 3-layer KGROUND weights: [0] crushed nacre & coquina shell sand, [1] mossy granite/ironstone, [2] iridescent mucus-highway ribbon
function masksAt(x,z,h,out){
 const coq=FIELD.coquina(x,z),rock=FIELD.rock(x,z),muc=FIELD.mucus(x,z),spray=FIELD.spray(x,z);
 const mucW=clamp(muc*0.95,0,1);
 const coqW=clamp(coq*0.92*(1-mucW*0.65),0,1);
 const grnW=clamp(Math.max(rock*0.86,spray*0.48)*(1-mucW*0.70)*(1-coqW*0.55),0,1);
 out[0]=coqW;
 out[1]=grnW;
 out[2]=mucW;
 out[3]=spray;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const LITTER=K(SKEY==='cloudslope'?0x36543a:0x3e5836);
 const COQUINA=K(0xe8e0d0);
 const GRANITE=K(0x7c7e78);
 const MUCUS=K(0xc8c4dc);
 const KELP_STAIN=K(0x5c582e);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz),klp=FC.at(FC.a.kelp,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,9261)-0.5;
  masksAt(wx,wz,hh,m);
  c.copy(LITTER)
   .lerp(KELP_STAIN,klp*0.42)
   .lerp(GRANITE,m[1]*0.72)
   .lerp(COQUINA,m[0]*0.86)
   .lerp(MUCUS,m[2]*0.78);
  if(SITE.hasSea&&hh<SITE.seaLevel)c.multiplyScalar(0.76);
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdcdad2,roughness:0.80,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdcdad2,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\n#ifndef KHOOK_EYE\n#define KHOOK_EYE\nvec3 kEye(){return -(viewMatrix[3].xyz*mat3(viewMatrix));}\n#endif\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.28,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.28;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{vec3 _stC=strataColor(vSWP,vSWN);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.82);}':'')+
   '{vec3 _vd=normalize(kEye()-vGWP);float _ndv=clamp(abs(dot(normalize(vGWN),_vd)),0.0,1.0);vec3 _mucFilm=0.5+0.5*cos(11.0*_ndv+vec3(0.2,2.1,4.0));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*(0.86+0.32*_mucFilm),vGL.z*0.75);}'+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.58,0.60,0.58),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.14,max(vWet,vGL.z*0.86));');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.6};
 const layers=[
  KGROUND.layer('matronscoast','ground.coquina',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'crushed coquina & nacre shell sand'}),
  KGROUND.layer('matronscoast','ground.granite',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'mossy coastal granite & ironstone'}),
  KGROUND.layer('matronscoast','ground.mucus',{w:'vGL.z',amt:0.90,gain:1.0,tint:'_gT',h:hOpt,name:'opalescent dried mucin silver-highway'})
 ].filter(Boolean);
 /* Register KGROUND layer maps in KMAT.imaged so BIO.packUnsampled sees them without inflating KSHADOW.units on MAT_GROUND */
 ['ground.coquina','ground.granite','ground.mucus'].forEach(slot=>{
  const e=typeof KMAT!=='undefined'&&KMAT.packed?KMAT.packed('matronscoast',slot):null;
  if(e&&e.map)(KMAT.imaged||(KMAT.imaged=[])).push(e.map);
 });
 KGROUND.hook(MAT_GROUND,{
  key:'matronscoast-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  blend:0.20,
  relief:KG_RELIEF?{bump:0.055,cavity:0.70,mesh:1}:null,
  layers:layers
 });
}

let SURF_DRAWN_SRC=null;

function DRAWN_H(x,z){
 if(typeof KDRAWN!=='undefined'&&KDRAWN.sources.length){
  const kh=KDRAWN.h(x,z);
  if(kh!==null)return kh;
 }
 const h=SURF_DRAWN_SRC?SURF_DRAWN_SRC.h(x,z):null;
 return h===null?terrainH(x,z):h;
}

const GROUND=(function(){
 const N=224,S=TERR.R*2.2,HR=S*0.5,AL=0.22,BC=1-AL,nx=N+1,m4=[0,0,0,0];
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
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),hh=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=X[i],z=X[j],y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hh[k]=y;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
 }
 SURF_DRAWN_SRC={
  kind:'warped-grid',
  name:'surface-ground',
  box:[-HR,-HR,HR,HR],
  h(x,z){
   if(!(x>=-HR&&x<=HR&&z>=-HR&&z<=HR))return null;
   const ix=invIdx(x),iz=invIdx(z);
   const u=clamp((x-X[ix])/(X[ix+1]-X[ix]),0,1),v=clamp((z-X[iz])/(X[iz+1]-X[iz]),0,1);
   const a=hh[iz*nx+ix],d=hh[iz*nx+ix+1],b=hh[(iz+1)*nx+ix],c=hh[(iz+1)*nx+ix+1];
   return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
  }
 };
 if(typeof KDRAWN!=='undefined')KDRAWN.add(SURF_DRAWN_SRC);
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
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);
 m.name='ground';
 m.userData.ground=true;
 m.userData.heightAt=DRAWN_H;
 if(typeof MC_VSTACK!=='undefined')MC_VSTACK.tintTerrainMesh(m,terrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

/* Mesh KSTACKS cemented Coquina Conch-Midden banks & granite skerry stacks/tors + register in KDRAWN */
const STACK_MESHES=(function(){
 const out=[];
 if(typeof KSTACKS==='undefined')return out;

 function buildBody(S,mat,label,tintRGB){
  const d=KSTACKS.mesh(S,{step:3.6});
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(d.pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(d.uv,2));
  const nv=d.pos.length/3;
  const col=new Float32Array(nv*3);
  for(let k=0;k<nv;k++){
   const ao=0.58+0.42*(d.occ?d.occ[k]:1.0);
   col[k*3]=ao*tintRGB[0];col[k*3+1]=ao*tintRGB[1];col[k*3+2]=ao*tintRGB[2];
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  geo.setIndex(nv>65535?new THREE.Uint32BufferAttribute(d.idx,1):new THREE.Uint16BufferAttribute(d.idx,1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,mat);
  m.name='stack:'+S.id;
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.ground=true;m.userData.inspectLabel=label;
  scene.add(m);
  m.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const ds=KDRAWN.fromObject(m);
   if(ds){ds.name=m.name;KDRAWN.add(ds);}
  }
  out.push(m);
  return m;
 }

 for(let i=0;i<STACK_RECS.middens.length;i++){
  const S=STACK_RECS.middens[i];
  buildBody(S,MATRON.M.stoneCoquina,'Biogenic Coquina Conch-Midden Bank ('+S.id+')',[1.02,0.99,0.95]);
 }
 for(let j=0;j<STACK_RECS.tors.length;j++){
  const S=STACK_RECS.tors[j];
  buildBody(S,MATRON.M.rockGranite,SITE.hasSea?'Wave-Notched Granite Skerry Stack ('+S.id+')':'Mossy Cloud-Forest Granite Tor ('+S.id+')',[0.90,0.92,0.90]);
 }
 BIO.host.terrainH=DRAWN_H;
 return out;
})();
