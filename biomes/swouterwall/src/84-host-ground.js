// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA megabreccia, KDRAWN, KSTACKS & aufeis ([draw])
// Implements:
//   - KSTRATA tilted impact 'megabreccia' across all 4 SW Outer Wall stations (zero thick loess!)
//   - KGROUND <= 3 height-blended layers per station so MAT_GROUND stays <= 11 samplers (strictly < 13!)
//   - S6/B5 chromatic hollow/ridge & cold-aspect vertex tinting via SWOW_VSTACK.tintTerrainMesh
//   - KSTACKS frost-shattered megabreccia tors/buttresses + KFROST aufeis (naled) winter overflow ice sheets
//   - KDRAWN.add on ALL ground, tor, and aufeis meshes!
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'swouterwall'+(SKEY==='boreallakes'?'':'-'+SKEY)});
 for(let i=0;i<REG.length;i++){
  const r=REG[i];
  if(r&&r.tagId){
   try{
    KTAGS.page.add({id:r.tagId,name:r.name,class:r.tagClass||'feature',at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,tags:r.tags||{}});
   }catch(e){}
  }
 }
}
const USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 return KSTRATA.create({
  seed:SITE.seed,
  recipe:'megabreccia',
  range:SITE.strata.range,
  dip:[0.16,0.96,SKEY==='breathvale'?0.036:0.022],
  warp:[6.4,1.8]
 });
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='boreallakes'?0x585c56:0x605c58}):null;

// 3-layer KGROUND weights per station (w0, w1, w2 in aGL.xyz; aGL.w holds periglacial polygon trough accent)
function masksAt(x,z,h,out){
 const rock=FIELD.rock(x,z),wet=FIELD.wet(x,z),poly=FIELD.poly(x,z),snow=FIELD.snow(x,z);

 if(SKEY==='boreallakes'){
  // [0] wet glacial moraine cobble & scarp, [1] russet-green sphagnum peat fen, [2] spire-spruce & fur-larch needle duff
  const mor=clamp(Math.max(rock*0.82,smooth(38,95,h)*0.48),0,1);
  const sph=clamp(wet*0.88*(1-mor*0.55),0,1);
  const lit=clamp((1-mor*0.68)*(1-sph*0.62),0,1);
  out[0]=mor;out[1]=sph;out[2]=lit;out[3]=0;
  return out;
 }
 if(SKEY==='morainetarn'){
  // [0] glacial-flour terminal moraine cobble, [1] KFROST sorted-stone frost-polygon turf, [2] krummholz & dwarf-birch duff
  const mor=clamp(Math.max(rock*0.80,wet*0.55,poly*0.52),0,1);
  const pol=clamp((0.38+0.62*(1-rock))*(1-wet*0.42)*smooth(6,38,h),0,1);
  const lit=clamp((1-mor*0.65)*smooth(34,6,h),0,1);
  out[0]=mor;out[1]=pol;out[2]=lit;out[3]=poly;
  return out;
 }
 // Stations 3 & 4 (trigemini & breathvale): [0] frost-shattered megabreccia, [1] KFROST polygon fines, [2] katabatic rime-snow
 const snw=clamp(snow*0.92,0,1);
 const meg=clamp(Math.max(rock*0.88,poly*0.64,smooth(95,240,h)*0.75)*(1-snw*0.55),0,1);
 const pol=clamp((1-meg*0.68)*(1-snw*0.65),0,1);
 out[0]=meg;out[1]=pol;out[2]=snw;out[3]=poly;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const NEEDLE=K(0x3e5236),SPHAG=K(0x6c5e34),MORAINE=K(0x6e706c),POLY=K(0x646c52);
 const MEGAB=K(0x524c48),RIME=K(0xdce4ec),HYPOX=K(0x3e424e);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,SITE.seed+22)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='boreallakes'){
   c.copy(NEEDLE).lerp(SPHAG,m[1]*0.72).lerp(MORAINE,m[0]*0.74);
  }else if(SKEY==='morainetarn'){
   c.copy(POLY).lerp(NEEDLE,m[2]*0.58).lerp(MORAINE,m[0]*0.74);
  }else{
   c.copy(POLY).lerp(MEGAB,m[0]*0.82).lerp(RIME,m[2]*0.84);
   if(SKEY==='breathvale'&&SITE.baseElevM+hh>SWOW_PHYS.HYPOXIA_CEILING_M){
    c.lerp(HYPOX,0.42);
   }
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d8d4,roughness:0.84,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d8d4,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.24,0.58,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.28;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{vec3 _stC=strataColor(vSWP,vSWN);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.84);}':'')+
   'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.76,0.77,0.80),vGL.w*0.38);'+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.58,0.60),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,vWet);');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.6};
 const layers=SKEY==='boreallakes'?[
  KGROUND.layer('swouterwall','ground.moraine',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'glaciated paternoster boulder cobble'}),
  KGROUND.layer('swouterwall','ground.sphagnum',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'quaking boreal sphagnum peat fen'}),
  KGROUND.layer('swouterwall','ground.needles',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'spire-spruce & fur-larch needle litter'})
 ]:SKEY==='morainetarn'?[
  KGROUND.layer('swouterwall','ground.moraine',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'glacial-flour terminal moraine cobble'}),
  KGROUND.layer('swouterwall','ground.polygon',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'KFROST sorted-stone frost-polygon tundra'}),
  KGROUND.layer('swouterwall','ground.needles',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',h:hOpt,name:'krummholz stone-pine & dwarf-birch duff'})
 ]:[
  KGROUND.layer('swouterwall','ground.megabreccia',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'frost-shattered impact megabreccia scree'}),
  KGROUND.layer('swouterwall','ground.polygon',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'periglacial sorted-polygon fines'}),
  KGROUND.layer('swouterwall','ground.rimesnow',{w:'vGL.z',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'wind-packed katabatic rime-snow'})
 ];
 KGROUND.hook(MAT_GROUND,{
  key:'swouterwall-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  blend:0.20,
  relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,
  layers:layers
 });
 MAT_GROUND.uniforms={
  uKG0:{value:layers[0].map},
  uKG1:{value:layers[1].map},
  uKG2:{value:layers[2].map}
 };
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
 if(typeof SWOW_VSTACK!=='undefined')SWOW_VSTACK.tintTerrainMesh(m,rawTerrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// Build KSTACKS megabreccia tors/buttresses & register in KDRAWN and KTAGS
const TORS_MESH=(function(){
 if(!STACK_BODIES||!STACK_BODIES.length||typeof KSTACKS==='undefined')return null;
 const pos=[],uv=[],col=[],idx=[];
 let vBase=0;
 for(let b=0;b<STACK_BODIES.length;b++){
  const B=STACK_BODIES[b];
  const M=KSTACKS.mesh(B,{step:4.0});
  const nV=M.pos.length/3;
  for(let k=0;k<nV;k++){
   const wx=M.pos[k*3],wy=M.pos[k*3+1],wz=M.pos[k*3+2];
   pos.push(wx,wy,wz);
   uv.push(M.uv[k*2]*0.22,M.uv[k*2+1]*0.22);
   const occ=1.0-0.36*(M.occ?M.occ[k]:0);
   const stC=STRATA?STRATA.at(wx,wy,wz).colour:[0.58,0.55,0.52];
   col.push(occ*(0.65+0.55*stC[0]),occ*(0.65+0.55*stC[1]),occ*(0.65+0.55*stC[2]));
  }
  for(let k=0;k<M.idx.length;k++)idx.push(M.idx[k]+vBase);
  vBase+=nV;
  REGISTER({
   tagId:'swow:tor-'+B.id,
   name:'Frost-Shattered Impact Megabreccia Buttress ('+B.id+')',
   tagClass:'feature',
   x:B.x,y:B.y0,z:B.z,r:B.R,h:B.top-B.y0+4,
   tags:{biome:'swouterwall',lithology:'megabreccia'}
  });
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setIndex(idx);
 geo.computeVertexNormals();
 geo.computeBoundingSphere();
 const m=new THREE.Mesh(geo,SWOW.M.rockMegabreccia);
 m.name='megabreccia-tors';
 m.castShadow=true;m.receiveShadow=true;
 m.userData.host=true;m.userData.ground=true;
 m.userData.inspectLabel='Tilted Impact Megabreccia Cirque Buttress (KSTACKS)';
 scene.add(m);
 if(typeof KDRAWN!=='undefined'){
  const ds=KDRAWN.fromObject(m);
  if(ds){ds.name='megabreccia-tors';KDRAWN.add(ds);}
 }
 BIO.host.terrainH=DRAWN_H;
 return m;
})();

// Build KFROST aufeis (naled) winter spring-overflow ice sheets on morainetarn & trigemini
const AUFEIS_MESH=(function(){
 if(!FROST||!FROST.aufeis||!FROST.aufeis.length)return null;
 const pos=[],uv=[],col=[],idx=[],sOut={};
 let vBase=0;
 for(let a=0;a<FROST.aufeis.length;a++){
  const au=FROST.aufeis[a],bx=au.box;
  const step=3.5;
  const nx=Math.max(2,Math.ceil((bx[2]-bx[0])/step))+1;
  const nz=Math.max(2,Math.ceil((bx[3]-bx[1])/step))+1;
  const mapIdx=new Int32Array(nx*nz).fill(-1);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
   const x=bx[0]+i*step,z=bx[1]+j*step;
   FROST.sample(x,z,sOut);
   if(sOut.iceH>0.03){
    const gy=rawTerrainH(x,z);
    mapIdx[j*nx+i]=vBase;
    pos.push(x,gy+sOut.iceH,z);
    uv.push(x*0.22,z*0.22);
    const tint=lerp(0.84,1.02,clamp(sOut.iceH/1.2,0,1));
    col.push(tint*0.90,tint*0.96,tint*1.02);
    vBase++;
   }
  }
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){
   const v0=mapIdx[j*nx+i],v1=mapIdx[(j+1)*nx+i],v2=mapIdx[(j+1)*nx+i+1],v3=mapIdx[j*nx+i+1];
   if(v0>=0&&v1>=0&&v3>=0){idx.push(v0,v1,v3);}
   if(v1>=0&&v2>=0&&v3>=0){idx.push(v1,v2,v3);}
  }
 }
 if(!idx.length)return null;
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setIndex(idx);
 geo.computeVertexNormals();
 geo.computeBoundingSphere();
 const m=new THREE.Mesh(geo,SWOW.M.iceAufeis);
 m.name='frost-aufeis';
 m.receiveShadow=true;
 m.userData.host=true;m.userData.ground=true;
 m.userData.inspectLabel='Layered Winter Spring-Overflow Aufeis Sheet (KFROST)';
 scene.add(m);
 if(typeof KDRAWN!=='undefined'){
  const ds=KDRAWN.fromObject(m);
  if(ds){ds.name='frost-aufeis';KDRAWN.add(ds);}
 }
 BIO.host.terrainH=DRAWN_H;
 return m;
})();
