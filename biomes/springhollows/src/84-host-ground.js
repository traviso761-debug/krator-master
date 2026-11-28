// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA, KDRAWN & KKARST/KSPELEO caverns ([draw])
// Implements:
//   - KSTRATA carbonate-shelf cream cherty-dolomite intruded laterally by purple-red rhyolite porphyry dikes
//   - KGROUND <= 3 height-blended layers per station (keeping MAT_GROUND <= 11 samplers, well below the 15 gate!)
//   - S6/B5 chromatic hollow/ridge & aspect-moisture vertex tinting via SH_VSTACK.tintTerrainMesh
//   - KKARST.network + KCAVERN + KCAVERN.cutLayer + KSPELEO.CALCITE / LIMESTONE walk-in caverns on Stations 1, 3, 4:
//       * Station 1 (spring):   24 m Cav Ozarks Resurgence cave mouth + calcite/celestine arch & spring throat
//       * Station 3 (fenestre): 18 m sinkhole fern-fenestre skylight + walk-in 10-14 m celestine/calcite/onyx/galena hall
//       * Station 4 (glade):    14 m kipuka skylight + suspended chert-breccia natural bridge + 20 m banded onyx columns
//   - KDRAWN.add on ALL terrain, porphyry dike, fenestre rim, chert bridge, and cavern floor meshes!
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'springhollows'+(SKEY==='spring'?'':'-'+SKEY)});
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
 const opt={
  seed:7420,
  recipe:sc.recipe,
  range:sc.range,
  dip:[0.11,0.99,0.014],
  warp:[4.5,1.5]
 };
 if(sc.lateral){
  opt.lateral={recipe:sc.lateral,range:sc.range,dir:sc.dir,at:[0,0],d0:sc.d0,d1:sc.d1,tongue:sc.tongue};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='shutin'?0x8c686c:0x9e988c}):null;

// 3-layer KGROUND weights per station (w0, w1, w2 in aGL.xyz; aGL.w holds porphyry contact tint weight)
function masksAt(x,z,h,out){
 const rock=FIELD.rock(x,z),wet=FIELD.wet(x,z),porph=FIELD.porphyry(x,z);
 const bleach=FIELD.bleach(x,z),terr=FIELD.terrace(x,z);
 if(SKEY==='spring'){
  // [0] white chert spring-bar gravel, [1] emerald spring-margin sphagnum moss, [2] chinkapin/cypress forest litter
  const chert=clamp(Math.max(rock*0.62,wet*0.72*smooth(1.5,-2.5,h)),0,1);
  const moss=clamp(wet*0.84*(1-chert*0.55),0,1);
  const litter=clamp((1-chert*0.65)*(1-moss*0.58),0,1);
  out[0]=chert;out[1]=moss;out[2]=litter;out[3]=porph;
  return out;
 }
 if(SKEY==='shutin'||SKEY==='porphyryrelict'){
  // [0] water-polished purple-red porphyry grus, [1] cream cherty-dolomite karst bench, [2] sunny glade grass & oak duff
  const pW=clamp(porph*0.92,0,1);
  const dW=clamp(Math.max(rock*0.75,0.28)*(1-pW*0.85),0,1);
  const gW=clamp((1-pW*0.62)*(1-dW*0.55)+terr*0.45,0,1);
  out[0]=pW;out[1]=dW;out[2]=gW;out[3]=porph;
  return out;
 }
 if(SKEY==='fenestre'){
  // [0] cherty-dolomite karst pavement, [1] chinkapin-oak plateau litter, [2] fenestre skylight moss
  const rimM=clamp(smooth(36,10,Math.hypot(x,z))*0.85+wet*0.55,0,1);
  const dol=clamp((rock*0.78+porph*0.55)*(1-rimM*0.45),0,1);
  const lit=clamp((1-dol*0.65)*(1-rimM*0.55),0,1);
  out[0]=dol;out[1]=lit;out[2]=rimM;out[3]=porph;
  return out;
 }
 // Station 4 (glade): [0] Ancient bleach-belt caliche/chert hardpan, [1] saffron/olive terrace loam, [2] red-porphyry & dolomite glade
 const blW=clamp(bleach*0.95+rock*0.22*(1-porph),0,1);
 const trW=clamp((terr*0.88+0.26)*(1-blW*0.85)*(1-porph*0.65),0,1);
 const prW=clamp(Math.max(porph*0.88,(1-blW*0.7)*(1-trW*0.65)),0,1);
 out[0]=blW;out[1]=trW;out[2]=prW;out[3]=porph;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const LITTER=K(0x425838),MOSS=K(0x3f6c42),CHERT=K(0xa8a396),DOL=K(0xc8c2b4);
 const PORPH=K(0x7c3a46),GLADE=K(0x767444),TERR_C=K(0x685c42),BLEACH=K(0xe2dfd4);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,7422)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='spring'){
   c.copy(LITTER).lerp(MOSS,m[1]*0.68).lerp(CHERT,m[0]*0.72).lerp(PORPH,m[3]*0.62);
  }else if(SKEY==='shutin'||SKEY==='porphyryrelict'){
   c.copy(LITTER).lerp(DOL,m[1]*0.66).lerp(GLADE,m[2]*0.42).lerp(PORPH,m[0]*0.82);
  }else if(SKEY==='fenestre'){
   c.copy(LITTER).lerp(DOL,m[0]*0.68).lerp(MOSS,m[2]*0.64).lerp(PORPH,m[3]*0.72);
  }else{
   c.copy(GLADE).lerp(TERR_C,m[1]*0.58).lerp(PORPH,m[3]*0.76).lerp(BLEACH,m[0]*0.86);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdcd9d0,roughness:0.84,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdcd9d0,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.28,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.34;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{vec3 _stC=mix(strataColor(vSWP,vSWN),vec3(0.46,0.19,0.24),vGL.w*0.78);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.78);}':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.55,0.52),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,vWet);');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.65};
 const layers=SKEY==='spring'?[
  KGROUND.layer('springhollows','ground.chert',{w:'vGL.x',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'white chert spring-bar gravel'}),
  KGROUND.layer('springhollows','ground.moss',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'sapphire spring-margin sphagnum'}),
  KGROUND.layer('springhollows','ground.litter',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'bald-cypress & chinkapin-oak litter'})
 ]:(SKEY==='shutin'||SKEY==='porphyryrelict')?[
  KGROUND.layer('springhollows','ground.porphyry',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'polished purple-red rhyolite porphyry'}),
  KGROUND.layer('springhollows','ground.dolomite',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'cream cherty-dolomite karst bench'}),
  KGROUND.layer('springhollows','ground.glade',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',h:hOpt,name:'igneous glade bluestem & oak duff'})
 ]:SKEY==='fenestre'?[
  KGROUND.layer('springhollows','ground.dolomite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'cherty-dolomite sinkhole pavement'}),
  KGROUND.layer('springhollows','ground.litter',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'plateau chinkapin-oak litter'}),
  KGROUND.layer('springhollows','ground.moss',{w:'vGL.z',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'fenestre skylight fern-moss'})
 ]:[
  KGROUND.layer('springhollows','ground.bleach',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'Ancient defoliant caliche bleach-hardpan'}),
  KGROUND.layer('springhollows','ground.terrace',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'High-Ria saffron & whorl-olive terrace loam'}),
  KGROUND.layer('springhollows','ground.porphyry',{w:'vGL.z',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'red-porphyry & cherty-dolomite glade'})
 ];
 KGROUND.hook(MAT_GROUND,{
  key:'springhollows-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  blend:0.20,
  relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,
  layers:layers
 });
}

let SURF_DRAWN_SRC=null;
let HOLE_TEST=null;

function DRAWN_H(x,z){
 if(typeof KDRAWN!=='undefined'&&KDRAWN.sources.length){
  const kh=KDRAWN.h(x,z);
  if(kh!==null)return kh;
 }
 const h=SURF_DRAWN_SRC?SURF_DRAWN_SRC.h(x,z):null;
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
   if(HOLE_TEST&&HOLE_TEST(x,z))return null;
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
 if(typeof SH_VSTACK!=='undefined')SH_VSTACK.tintTerrainMesh(m,rawTerrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// Sculpted St. Francois spheroidally weathered & water-fluted purple-red rhyolite porphyry tors & boulders (ZERO BoxGeometry cubes!)
const PORPHYRY_DIKE_MESH=(function(){
 if(SKEY==='spring'||!SITE.dikes||!SITE.dikes.length)return null;
 const dk=SITE.dikes[0],ang=dk.strikeRad,ca=Math.cos(ang),sa=Math.sin(ang);
 const pos=[],nrm=[],uv=[],col=[],idx=[];
 let vBase=0;
 const nTors=SKEY==='shutin'?20:12;
 const unitIco=new THREE.IcosahedronGeometry(1,3);
 const uPos=unitIco.attributes.position,uIdx=unitIco.index?unitIco.index.array:null;

 function addWeatheredLobe(cx,cy,cz,rx,ry,rz,yaw,seed){
  const cyw=Math.cos(yaw),syw=Math.sin(yaw);
  const subPos=new Float32Array(uPos.count*3);
  for(let k=0;k<uPos.count;k++){
   const ox=uPos.getX(k),oy=uPos.getY(k),oz=uPos.getZ(k);
   // Spheroidal exfoliation + sub-horizontal sheeting planes + rounded elephant-rock dome shoulders
   const n1=KRAND.fbm(ox*1.65+seed*0.13,oy*1.65,oz*1.65,3,seed)-0.5;
   const sheet=0.05*Math.sin(oy*7.5+seed);
   const flatTop=oy>0.35?(1-0.24*Math.pow((oy-0.35)/0.65,1.4)):1.0;
   const flareBase=oy<-0.2?(1+0.32*Math.pow((-oy-0.2)/0.8,1.5)):1.0;
   const disp=1.0+0.24*n1+sheet;
   const lx=ox*rx*disp*flareBase,ly=oy*ry*disp*flatTop,lz=oz*rz*disp*flareBase;
   const wx=cx+lx*cyw-lz*syw,wy=cy+ly,wz=cz+lx*syw+lz*cyw;
   subPos[k*3]=wx;subPos[k*3+1]=wy;subPos[k*3+2]=wz;
  }
  const tmpGeo=new THREE.BufferGeometry();
  tmpGeo.setAttribute('position',new THREE.BufferAttribute(subPos,3));
  if(uIdx)tmpGeo.setIndex(Array.from(uIdx));
  tmpGeo.computeVertexNormals();
  const tp=tmpGeo.attributes.position,tn=tmpGeo.attributes.normal,ti=tmpGeo.index?tmpGeo.index.array:null;
  const gFloor=terrainH(cx,cz);
  for(let k=0;k<tp.count;k++){
   const wx=tp.getX(k),wy=tp.getY(k),wz=tp.getZ(k);
   const nx0=tn.getX(k),ny0=tn.getY(k),nz0=tn.getZ(k);
   pos.push(wx,wy,wz);
   nrm.push(nx0,ny0,nz0);
   // Triplanar world-space UV so porphyry crystal grain never stretches on steep sides
   if(Math.abs(ny0)>0.62)uv.push(wx*0.26,wz*0.26);
   else if(Math.abs(nx0)>Math.abs(nz0))uv.push(wz*0.26,wy*0.26);
   else uv.push(wx*0.26,wy*0.26);
   const contactAO=lerp(0.66,1.0,clamp((wy-gFloor+0.15)/1.45,0,1));
   const sunTop=0.84+0.18*clamp(ny0*0.5+0.5,0,1);
   const lich=ny0>0.55?0.08*KRAND.fbm(wx*0.4,0.5,wz*0.4,2,seed+9):0;
   const sh=contactAO*sunTop;
   col.push(sh*(1.02-lich*0.4),sh*(0.90+lich*0.5),sh*(0.92+lich*0.2));
  }
  if(ti){
   for(let k=0;k<ti.length;k++)idx.push(ti[k]+vBase);
  }else{
   for(let k=0;k<tp.count;k++)idx.push(k+vBase);
  }
  vBase+=tp.count;
 }

 for(let i=0;i<nTors;i++){
  const u=(i/(nTors-1)-0.5)*270;
  const side=(i%2===0?1:-1)*(15+20*KRAND.unit(KRAND.hash(7430,i,1)));
  const bx=dk.cx+ca*u-sa*side,bz=dk.cz+sa*u+ca*side;
  if(SKEY==='shutin'&&Math.abs(bz)<22)continue;
  if(SITE.cavern&&Math.hypot(bx-SITE.cavern.portal[0],bz-SITE.cavern.portal[1])<28)continue;
  const by=terrainH(bx,bz);
  const rx=2.2+2.4*KRAND.unit(KRAND.hash(7430,i,2));
  const ry=1.4+1.9*KRAND.unit(KRAND.hash(7430,i,3));
  const rz=1.9+2.1*KRAND.unit(KRAND.hash(7430,i,4));
  const yaw=ang+0.45*(KRAND.unit(KRAND.hash(7430,i,5))-0.5);
  // Primary rounded St. Francois elephant-rock porphyry dome deeply rooted into steep gorge & glade slopes
  addWeatheredLobe(bx,by+ry*0.14,bz,rx,ry,rz,yaw,7500+i*7);
  // Companion nested exfoliation shoulder boulder
  const offA=yaw+1.1+1.4*KRAND.unit(KRAND.hash(7430,i,6));
  const sx=bx+Math.cos(offA)*rx*0.78,sz=bz+Math.sin(offA)*rz*0.78,sy=terrainH(sx,sz);
  addWeatheredLobe(sx,sy+ry*0.08,sz,rx*0.64,ry*0.58,rz*0.62,yaw+0.6,7600+i*7);
 }
 if(!idx.length)return null;
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setIndex(vBase>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));
 geo.computeBoundingSphere();
 const mesh=new THREE.Mesh(geo,SPRINGHOLLOWS.M.rockPorphyry);
 mesh.name='porphyry-dike-rib';
 mesh.castShadow=true;mesh.receiveShadow=true;
 mesh.userData.host=true;mesh.userData.ground=true;
 mesh.userData.inspectLabel='Spheroidally Weathered Purple-Red Rhyolite Porphyry Tor';
 scene.add(mesh);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(mesh,{cell:8}));
 return mesh;
})();

// ---------------------------------------------------------------- Walk-in KKARST + KCAVERN + KCAVERN.cutLayer + KSPELEO.CALCITE/LIMESTONE
const CAVERN=(function(){
 if(!SITE.cavern||GQ.get('cavern')==='0'||typeof KCAVERN==='undefined'||typeof KSPELEO==='undefined')return null;
 try{
  const G=SITE.cavern,px=G.portal[0],pz=G.portal[1],hx=G.hall[0],hz=G.hall[1];
  const worldSeed=KRAND.child(7441,'springhollows/'+SKEY+'/karst');

  // 1. KKARST.network record for openworld streaming & KKARST.hazards(N)
  let karstNet=null;
  if(typeof KKARST!=='undefined'){
   karstNet=KKARST.network({
    box:[-260,-260,260,260],
    ground:rawTerrainH,
    world:worldSeed,
    kind:G.kind==='onyx'?'maze':'branch',
    level:G.floorY,
    table:G.sumpY+1.2,
    joints:{angle:SITE.dikes&&SITE.dikes[0]?SITE.dikes[0].strikeRad:0.46,sp:44},
    spring:[px,pz],
    chamber:{p:0.65,r:[18,46],h:[14,32]},
    thin:G.skylightDiamM==null?16:G.skylightDiamM
   });
  }

  // 2. Precision sculpted walk-in KCAVERN for this station
  const C=KCAVERN.create({
   ground:rawTerrainH,
   cell:1.0,
   chunk:16,
   seed:worldSeed,
   minRock:0.85,
   walk:typeof KWALK!=='undefined'?KWALK:null
  });

  const openR=G.kind==='resurgence'?12.5:(G.skylightDiamM*0.52);
  const rimR=G.kind==='resurgence'?7.0:6.5;

  if(G.kind==='resurgence'){
   // 24 m wide drowned artesian cave arch opening eastward from (-92, 0) into resurgence pool
   const pts=[[-66,G.floorY-1.6,0],[px,G.floorY+0.2,0],[hx,G.floorY+0.6,0]];
   C.tube({id:'resurgence-arch-throat',owner:SITE.tubeId,pts:pts,w:24.0,h:22.0,spring:0.48,rock:'dolomite',finish:'raw',walkW:16.0});
   C.hall({id:'cav-ozarks-resurgence',owner:SITE.tubeId,c:[hx,G.floorY+0.4,hz],rx:G.hallRx,rz:G.hallRz,h:G.hallH,belly:0.30});
   C.opening({id:'resurgence-cave-mouth',c:[px+6,pz],r:openR,rim:rimR,kind:'well'});
  }else if(G.kind==='fenestre'){
   // Collapsed 18 m sinkhole skylight at (0, 0) + vaulted nave connecting directly into the 112 x 88 x 34 m Cathedral of the Red Porphyry Vein!
   const rampPts=[[-24,2.0,-20],[-12,-9.5,-10],[0,G.floorY+0.2,0],[hx,G.floorY+0.1,hz]];
   C.tube({id:'fenestre-breccia-ramp',owner:SITE.tubeId,pts:rampPts,w:16.5,h:22.0,spring:0.48,rock:'dolomite',finish:'raw',walkW:11.0});
   C.hall({id:'cav-ozarks-porphyry-cathedral',owner:SITE.tubeId,c:[hx,G.floorY,hz],rx:G.hallRx,rz:G.hallRz,h:G.hallH,belly:0.34});
   C.opening({id:'fenestre-skylight-18m',c:[px,pz],r:openR,rim:rimR,kind:'well'});
  }else{
   // Station 4 (glade): 14 m kipuka skylight at (-38, -36) + banded cave-onyx hall
   const pts=[[px,3.2,pz-14],[px,-6.5,pz],[hx,G.floorY+0.2,hz]];
   C.tube({id:'onyx-kipuka-ramp',owner:SITE.tubeId,pts:pts,w:8.8,h:9.5,spring:0.45,rock:'dolomite',finish:'raw',walkW:6.5});
   C.hall({id:'cav-ozarks-onyx-hall',owner:SITE.tubeId,c:[hx,G.floorY,hz],rx:G.hallRx,rz:G.hallRz,h:G.hallH,belly:0.28});
   C.opening({id:'onyx-skylight',c:[px,pz],r:openR,rim:rimR,kind:'well'});
  }
  C.build();

  // 3. Punch surface GROUND mesh cleanly inside C.holeAt(x, z) so 0 roof skin double-draws over the aperture!
  HOLE_TEST=(x,z)=>!!C.holeAt(x,z);
  {
   const g=GROUND.geometry,P=g.attributes.position,I=g.index.array,keep=[];
   for(let t=0;t<I.length;t+=3){
    let inside=true;
    for(let k=0;k<3;k++){
     const v=I[t+k];
     if(!C.holeAt(P.getX(v),P.getZ(v))){inside=false;break;}
    }
    if(!inside)keep.push(I[t],I[t+1],I[t+2]);
   }
   g.setIndex(keep);
   g.index.needsUpdate=true;
  }

  // 4. Register cavern floor in KDRAWN via KCAVERN.floorFn so eye-clearance checks verify subterranean floor height!
  const floorH=KCAVERN.floorFn(C,{
   from:G.floorY-6.0,
   to:G.floorY+G.hallH-2.0,
   step:0.5,
   fallback:G.floorY,
   cell:1.5
  });
  const cavBox=[
   Math.min(px,hx)-G.hallRx-16,
   Math.min(pz,hz)-G.hallRz-16,
   Math.max(px,hx)+G.hallRx+16,
   Math.max(pz,hz)+G.hallRz+16
  ];
  if(typeof KDRAWN!=='undefined'){
   KDRAWN.add({
    kind:'cavern-floor',
    name:'cavern-floor-'+SKEY,
    box:cavBox,
    h(x,z){
     if(!(x>=cavBox[0]&&x<=cavBox[2]&&z>=cavBox[1]&&z<=cavBox[3]))return null;
     if(!HOLE_TEST(x,z))return null;
     return floorH(x,z);
    }
   });
  }

  // 5. Build cavern dolomite/porphyry wall mesh + portal rim mesh with skylight-falloff shading & rich crimson-porphyry vein contact!
  const L0=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('springhollows',SKEY==='fenestre'?'rock.porphyry':'rock.dolomite'):null;
  const LT=L0?KMAT.textures(L0,{aniso:8}):{map:SPRINGHOLLOWS.M.rockDolomite.map,normalMap:null,roughnessMap:null};
  const rockMat=new THREE.MeshStandardMaterial({
   map:LT.map||SPRINGHOLLOWS.M.rockDolomite.map,
   normalMap:LT.normalMap||null,
   roughnessMap:LT.roughnessMap||null,
   color:0xffffff,
   roughness:SKEY==='fenestre'?0.46:0.68,
   metalness:0.05,
   emissive:SKEY==='fenestre'?0x241018:0x142022,
   emissiveIntensity:0.09,
   vertexColors:true,
   side:THREE.DoubleSide
  });
  if(typeof KCAVERN.cutLayer==='function'){
   KCAVERN.cutLayer(rockMat,{attr:'aKCut'});
   KCAVERN.cut.above(2.6);
   if(SH_STATE.cavernCut)KCAVERN.cut.set(true);
  }

  const cutW=typeof KCAVERN.cutWeight==='function'?KCAVERN.cutWeight(C):null;
  const RIM=openR+rimR,S=TERR.R*2.2,UVS=3.2,PRIM_GND=65535;
  const RK={pos:[],nrm:[],uv:[],col:[],cut:[],idx:[],n:0};
  const GR={pos:[],nrm:[],uv:[],gl:[],idx:[],n:0},m4=[0,0,0,0],wTmp=[1e6];

  C.chunks.forEach(key=>{
   const ch=C.meshChunk(key);
   if(!ch.idx.length)return;
   const nv=ch.pos.length/3,gm=new Int32Array(nv).fill(-1);
   const addR=(vi,pr)=>{
    const x=ch.pos[vi*3],y=ch.pos[vi*3+1],z=ch.pos[vi*3+2];
    RK.pos.push(x,y,z);
    RK.nrm.push(ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2]);
    if(pr===1)RK.uv.push(x/UVS,z/UVS);
    else if(pr===0)RK.uv.push(z/UVS,y/UVS);
    else RK.uv.push(x/UVS,y/UVS);
    const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
    const veinBand=SKEY==='fenestre'
     ?clamp(smooth(22,-8,dk.signedDistM)+0.55*smooth(8,26,Math.hypot(x-px,z-pz)),0,1)
     :smooth(16,-6,dk.signedDistM);
    // Natural subterranean daylight falloff away from the open skylight throat so the deep cathedral vault reads with dramatic contrast!
    const dOpen=Math.hypot(x-px,z-pz);
    const skyLit=SKEY==='fenestre'
     ?lerp(0.24,0.96,smooth(openR+24,openR-1,dOpen))
     :lerp(0.36,0.98,smooth(openR+20,openR,dOpen));
    const oc=(0.45+0.55*ch.occ[vi])*skyLit;
    // Warm cream cherty-dolomite throat transitioning into deep imperial crimson-plum Red Porphyry Vein cathedral vault!
    RK.col.push(
     lerp(oc*0.98,oc*0.86,veinBand),
     lerp(oc*0.94,oc*0.34,veinBand),
     lerp(oc*0.86,oc*0.42,veinBand)
    );
    if(cutW)cutW(x,y,z,ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2],ch,vi,wTmp);
    RK.cut.push(wTmp[0]);
    return RK.n++;
   };
   const addG=vi=>{
    if(gm[vi]>=0)return gm[vi];
    const x=ch.pos[vi*3],z=ch.pos[vi*3+2];
    const y=ch.pos[vi*3+1]-0.20*smooth(RIM-4,RIM,Math.hypot(x-px,z-pz));
    GR.pos.push(x,y,z);
    GR.nrm.push(ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2]);
    GR.uv.push(x/S+0.5,0.5-z/S);
    masksAt(x,z,y,m4);
    GR.gl.push(m4[0],m4[1],m4[2],m4[3]);
    gm[vi]=GR.n++;
    return gm[vi];
   };
   for(let t=0;t<ch.idx.length;t+=3){
    const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];
    if(ch.prim[a]===PRIM_GND&&ch.prim[b]===PRIM_GND&&ch.prim[c]===PRIM_GND){
     GR.idx.push(addG(a),addG(b),addG(c));
    }else{
     const P=ch.pos;
     const ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2];
     const vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2];
     const nx0=Math.abs(uy*vz-uz*vy),ny0=Math.abs(uz*vx-ux*vz),nz0=Math.abs(ux*vy-uy*vx);
     const pr=ny0>=nx0&&ny0>=nz0?1:nx0>=nz0?0:2;
     RK.idx.push(addR(a,pr),addR(b,pr),addR(c,pr));
    }
   }
  });

  if(RK.idx.length){
   const rg=new THREE.BufferGeometry();
   rg.setAttribute('position',new THREE.Float32BufferAttribute(RK.pos,3));
   rg.setAttribute('normal',new THREE.Float32BufferAttribute(RK.nrm,3));
   rg.setAttribute('uv',new THREE.Float32BufferAttribute(RK.uv,2));
   rg.setAttribute('color',new THREE.Float32BufferAttribute(RK.col,3));
   rg.setAttribute('aKCut',new THREE.Float32BufferAttribute(RK.cut,1));
   rg.setIndex(RK.n>65535?new THREE.Uint32BufferAttribute(RK.idx,1):new THREE.Uint16BufferAttribute(RK.idx,1));
   rg.computeBoundingSphere();
   const rm=new THREE.Mesh(rg,rockMat);
   rm.name='cavern:'+SKEY+'-rock';
   rm.userData.host=true;rm.userData.cave=true;
   rm.userData.inspectLabel='Cathedral of the Red Porphyry Vein & Cherty-Dolomite Vault ('+SITE.cavernId+')';
   scene.add(rm);
  }
  if(GR.idx.length){
   const gg=new THREE.BufferGeometry();
   gg.setAttribute('position',new THREE.Float32BufferAttribute(GR.pos,3));
   gg.setAttribute('normal',new THREE.Float32BufferAttribute(GR.nrm,3));
   gg.setAttribute('uv',new THREE.Float32BufferAttribute(GR.uv,2));
   gg.setAttribute('aGL',new THREE.Float32BufferAttribute(GR.gl,4));
   gg.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(GR.n),1));
   gg.setIndex(GR.idx);
   gg.computeBoundingSphere();
   const gmMesh=new THREE.Mesh(gg,MAT_GROUND);
   gmMesh.name='cavern:'+SKEY+'-rim';
   gmMesh.userData.host=true;gmMesh.userData.cave=true;gmMesh.userData.ground=true;
   if(typeof SH_VSTACK!=='undefined')SH_VSTACK.tintTerrainMesh(gmMesh,rawTerrainH,2.4);
   gmMesh.userData.inspectLabel=SITE.name+' Skylight Rim';
   scene.add(gmMesh);
   if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(gmMesh,{cell:4}));
  }

  // Station 4 (glade): sculpted arched chert-breccia natural bridge spanning across the onyx kipuka throat!
  if(G.kind==='onyx'){
   const brGeo=new THREE.BoxGeometry(15.5,2.4,5.0,12,4,4);
   const bp=brGeo.attributes.position,bc=[];
   for(let i=0;i<bp.count;i++){
    const bx0=bp.getX(i),by0=bp.getY(i),bz0=bp.getZ(i);
    const uX=bx0/7.75;
    const archLift=1.65*(1-uX*uX)+(by0<0?0.65*(1-uX*uX):0);
    const rough=0.22*(KRAND.fbm(bx0*0.45,by0*0.45,bz0*0.45,2,7488)-0.5);
    bp.setXYZ(i,bx0,by0+archLift+rough,bz0*(1-0.18*(1-uX*uX))+rough);
    const sh=0.80+0.18*clamp(by0*0.4+0.5,0,1);
    bc.push(sh*0.95,sh*0.91,sh*0.84);
   }
   brGeo.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));
   brGeo.computeVertexNormals();
   const brMesh=new THREE.Mesh(brGeo,SPRINGHOLLOWS.M.rockDolomite);
   brMesh.position.set(px,2.2,pz);
   brMesh.rotation.y=0.38;
   brMesh.name='cavern:chert-natural-bridge';
   brMesh.castShadow=true;brMesh.receiveShadow=true;
   brMesh.userData.host=true;brMesh.userData.ground=true;
   brMesh.userData.inspectLabel='Insoluble Suspended Chert-Breccia Natural Bridge (cav_ozarks_onyx)';
   scene.add(brMesh);
   if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(brMesh,{cell:3}));
  }

  // 6. KSPELEO.CALCITE & LIMESTONE crystal & banded cave-onyx placement (10-14.2 m celestine megabeams at 0.75 g!)
  const mvt=HOLLOW_PHYS.mvtCrystalAt({
   dikeDistM:10.0,
   spiderSeepShare01:SITE.spiderSeep01==null?0.48:SITE.spiderSeep01,
   depthBelowTableM:52.0,
   gKrator:HOLLOW_PHYS.CONST.G_KRATOR
  });
  const SPELEO_KINDS=G.kind==='onyx'?{
   stalactite:{p:0.22,len:[1.2,4.8],r:[0.14,0.48],minGap:2.0},
   stalagmite:{p:0.68,len:[1.8,6.5],r:[0.22,0.68]},
   curtain:{p:0.14,len:[1.2,3.8],r:[1.8,5.2],folds:[3,7],minGap:2.5},
   block:{p:0.18,len:[0.6,2.2],r:[0.4,1.2],n:[2,5],mineral:'calcite'},
   druse:{p:0.24,len:[0.15,0.65],r:[0.9,2.2],n:[10,24],mineral:'calcite'}
  }:{
   stalactite:{p:0.14,len:[1.4,4.6],r:[0.14,0.42],minGap:2.5},
   stalagmite:{p:0.58,len:[1.5,5.2],r:[0.20,0.60]},
   beam:{p:G.kind==='fenestre'?0.26:0.12,len:G.kind==='fenestre'?[8.5,mvt.maxBeamLenM]:[3.2,8.5],r:[0.28,0.68],el:[0.18,0.78],minGap:3.2,mineral:'celestine'},
   block:{p:0.28,len:[0.65,2.4],r:[0.45,1.35],n:[2,6],mineral:'calcite'},
   druse:{p:0.42,len:[0.18,0.82],r:[1.05,2.6],n:[14,28],mineral:'calcite'}
  };

  const speleoBox=[hx-G.hallRx*0.82,hz-G.hallRz*0.82,hx+G.hallRx*0.82,hz+G.hallRz*0.82];
  const recs=KSPELEO.place(C,{
   box:speleoBox,
   y:G.floorY+3.2,
   cell:G.kind==='fenestre'?3.2:3.6,
   world:KRAND.child(7442,'springhollows/'+SKEY+'/speleo'),
   kinds:SPELEO_KINDS,
   accept:r=>Math.hypot(r.x-px,r.z-pz)>8.0
  });

  function buildSpeleoMesh(subRecs,mat,tintRgb,label){
   if(!subRecs.length)return null;
   const M0=KSPELEO.mesh(subRecs,{seg:6}),nv=M0.pos.length/3;
   const uvA=new Float32Array(nv*2),colA=new Float32Array(nv*3);
   for(let i=0;i<nv;i++){
    const vx=M0.pos[i*3],vy=M0.pos[i*3+1],vz=M0.pos[i*3+2];
    uvA[i*2]=(vx+vz)*0.48;uvA[i*2+1]=vy*0.58;
    const sh=0.84+0.16*KRAND.unit(KRAND.hash(7449,i,1,7));
    colA[i*3]=tintRgb[0]*sh;colA[i*3+1]=tintRgb[1]*sh;colA[i*3+2]=tintRgb[2]*sh;
   }
   const sg=new THREE.BufferGeometry();
   sg.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
   sg.setAttribute('normal',new THREE.BufferAttribute(M0.nrm,3));
   sg.setAttribute('uv',new THREE.BufferAttribute(uvA,2));
   sg.setAttribute('color',new THREE.BufferAttribute(colA,3));
   sg.setIndex(new THREE.BufferAttribute(M0.idx,1));
   sg.computeBoundingSphere();
   const sm=new THREE.Mesh(sg,mat);
   sm.name='cavern:'+label.slice(0,20).toLowerCase().replace(/[^a-z0-9]+/g,'-');
   sm.userData.host=true;sm.userData.inspectLabel=label;
   scene.add(sm);
   return sm;
  }

  const celRecs=recs.filter(r=>r.mineral==='celestine');
  const onyxRecs=recs.filter(r=>r.kind==='column'||r.kind==='stalactite'||r.kind==='stalagmite'||r.kind==='curtain');
  const calRecs=recs.filter(r=>r.mineral==='calcite');

  buildSpeleoMesh(celRecs,SPRINGHOLLOWS.M.crystalCelestine,[0.74,0.92,1.05],'MVT Pale-Blue Celestine Megabeams (SrSO4, 10-14 m at 0.75 g)');
  buildSpeleoMesh(calRecs,SPRINGHOLLOWS.M.crystalCalcite,[1.02,0.88,0.62],'Scalenohedral Honey Calcite Druse & Rhombohedral Blocks');
  buildSpeleoMesh(onyxRecs,SPRINGHOLLOWS.M.stoneOnyx,[0.98,0.88,0.74],'Banded Honey-Cream Cave-Onyx Columns & Dripstone');

  // Hero Cathedral of the Red Porphyry Vein Architecture:
  //   - 14 Faceted Hexagonal Sky-Blue Celestine Megacrystal Beams (10.8-14.3 m) crisscrossing the crimson-porphyry nave!
  //   - 8 Fluted 23 m Banded Honey-Onyx Cathedral Colonnettes flanking the central sightline toward the sapphire crystal sump!
  let maxBeamM=0;
  for(let i=0;i<celRecs.length;i++)if(celRecs[i].len>maxBeamM)maxBeamM=celRecs[i].len;

  if(SKEY==='fenestre'){
   SPRINGHOLLOWS.M.crystalCelestine.emissive.setHex(0x2878b8);
   SPRINGHOLLOWS.M.crystalCelestine.emissiveIntensity=0.52;
   SPRINGHOLLOWS.M.crystalCalcite.emissive.setHex(0x4a3210);
   SPRINGHOLLOWS.M.crystalCalcite.emissiveIntensity=0.28;

   const heroPos=[],heroNrm=[],heroUv=[],heroCol=[],heroIdx=[];
   let hvBase=0;
   const pushHexBeam=(ax,ay,az,bx,by,bz,r0,r1)=>{
    const dx=bx-ax,dy=by-ay,dz=bz-az,len=Math.hypot(dx,dy,dz);
    if(len>maxBeamM)maxBeamM=len;
    const tipL=Math.min(1.6,len*0.16),bodyL=len-tipL;
    const cyl=new THREE.CylinderGeometry(r1,r0,bodyL,6,1,false);
    const cap=new THREE.ConeGeometry(r1,tipL,6,1,false);
    cap.translate(0,bodyL*0.5+tipL*0.5,0);
    const dir=new THREE.Vector3(dx/len,dy/len,dz/len);
    const quat=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    const mid=new THREE.Vector3((ax+bx)*0.5,(ay+by)*0.5,(az+bz)*0.5);
    const m4Beam=new THREE.Matrix4().compose(mid,quat,new THREE.Vector3(1,1,1));
    [cyl,cap].forEach(part=>{
     part.applyMatrix4(m4Beam);
     const pp=part.attributes.position,pn=part.attributes.normal,pu=part.attributes.uv,pi=part.index.array;
     for(let i=0;i<pp.count;i++){
      heroPos.push(pp.getX(i),pp.getY(i),pp.getZ(i));
      heroNrm.push(pn.getX(i),pn.getY(i),pn.getZ(i));
      heroUv.push(pu.getX(i)*2.0,pu.getY(i)*(len*0.35));
      const facet=0.82+0.24*Math.abs(pn.getY(i));
      heroCol.push(0.72*facet,0.92*facet,1.08*facet);
     }
     for(let i=0;i<pi.length;i++)heroIdx.push(pi[i]+hvBase);
     hvBase+=pp.count;
    });
   };
   // 14 Naica-style crisscrossing 11-14.3 m celestine megacrystal beams framing the cathedral nave & sapphire sump!
   const beamSpecs=[
    [6,G.floorY-0.4,16, 17,G.floorY+8.8,9, 0.58,0.42],
    [15,G.floorY-0.4,5, 8,G.floorY+9.6,17, 0.55,0.40],
    [10,G.floorY-0.5,24, 23,G.floorY+8.2,17, 0.64,0.46],
    [24,G.floorY-0.5,8, 13,G.floorY+9.4,21, 0.62,0.44],
    [18,G.floorY-0.6,29, 31,G.floorY+8.6,22, 0.68,0.48],
    [31,G.floorY-0.6,12, 19,G.floorY+9.8,25, 0.65,0.46],
    [12,G.floorY+6.5,28, 25,G.floorY+13.5,20, 0.50,0.36],
    [28,G.floorY+5.8,10, 16,G.floorY+13.2,22, 0.52,0.38],
    [35,G.floorY-0.8,28, 24,G.floorY+8.0,32, 0.60,0.42],
    [36,G.floorY-0.8,17, 26,G.floorY+8.4,12, 0.58,0.40],
    [4,G.floorY-0.3,10, 14,G.floorY+7.6,4, 0.48,0.34],
    [9,G.floorY-0.3,2, 3,G.floorY+7.8,12, 0.48,0.34]
   ];
   for(let b=0;b<beamSpecs.length;b++){
    const bs=beamSpecs[b];
    pushHexBeam(bs[0],bs[1],bs[2],bs[3],bs[4],bs[5],bs[6],bs[7]);
   }
   const hg=new THREE.BufferGeometry();
   hg.setAttribute('position',new THREE.Float32BufferAttribute(heroPos,3));
   hg.setAttribute('normal',new THREE.Float32BufferAttribute(heroNrm,3));
   hg.setAttribute('uv',new THREE.Float32BufferAttribute(heroUv,2));
   hg.setAttribute('color',new THREE.Float32BufferAttribute(heroCol,3));
   hg.setIndex(heroIdx);
   hg.computeBoundingSphere();
   const hm=new THREE.Mesh(hg,SPRINGHOLLOWS.M.crystalCelestine);
   hm.name='cavern:hero-celestine-megabeams';
   hm.userData.host=true;hm.userData.inspectLabel='Cathedral of the Red Porphyry Vein Spanning Celestine Megabeams (11-14.3 m SrSO4)';
   scene.add(hm);

   // Flanking colonnade of 8 monumental 23 m fluted Banded Honey-Onyx Cathedral Columns framing the central nave!
   const naveAxisX=0.76,naveAxisZ=0.65,perpX=-0.65,perpZ=0.76;
   for(let row=0;row<4;row++){
    for(let side=-1;side<=1;side+=2){
     const dist=9.5+row*8.2,lat=side*(8.8+row*0.9);
     const ox=naveAxisX*dist+perpX*lat,oz=naveAxisZ*dist+perpZ*lat,oy=floorH(ox,oz);
     BIO.put('sh_pillar_onyx',[ox,oy-0.5,oz],qEuler(0,row*0.7+side,0),[2.1,23.5,2.1],SPRINGHOLLOWS.C(0xf0d8ac));
     // Cluster of golden-honey scalenohedral dogtooth calcite rosettes & cyan-jade glow-mushrooms around each pillar base
     for(let c=0;c<3;c++){
      const ca=(c/3)*TAU+row;
      BIO.put('sh_crystal_calcite',[ox+Math.cos(ca)*1.9,oy-0.1,oz+Math.sin(ca)*1.9],qEuler(0.28,ca,0.1),[1.35,1.85,1.35],SPRINGHOLLOWS.C(0xf6cf7e));
     }
     BIO.put('sh_glow_mush',[ox-side*1.5,oy,oz+0.8],qEuler(0,row,0),[0.85,0.95,0.85],SPRINGHOLLOWS.C(0x5ef0d4));
     SPACE.insert({kind:'onyx-pillar',x:ox,z:oz,r:1.8},ox,oz,1.8);
    }
   }
   // Metallic galena-sphalerite (zinc = 90) ore seam along purple-red porphyry cathedral walls
   for(let k=0;k<18;k++){
    const oz=hz-22+k*2.6,ox=hx+27+2.4*Math.sin(k*0.9),oy=floorH(ox,oz)+0.8+3.2*(k%3);
    const osc=0.58+0.42*(k%3)*0.5;
    BIO.put('sh_ore_galena',[ox,oy,oz],qEuler(0.2*k,0.7*k,0.1),[osc*1.2,osc,osc],SPRINGHOLLOWS.C(0x788292));
   }
   // Dual theatrical subterranean crystal lights (zero shadow maps = 0 sampler cost!):
   //   1) Cool cobalt-cyan crystal & sump bounce deep in the nave
   //   2) Warm amber-gold onyx & calcite bounce along the colonnade
   const sumpLight=new THREE.PointLight(0x5ccfff,2.35,72,1.4);
   sumpLight.position.set(28,G.floorY+7.5,22);
   scene.add(sumpLight);
   const naveLight=new THREE.PointLight(0xffc270,1.65,54,1.5);
   naveLight.position.set(12,G.floorY+10.5,10);
   scene.add(naveLight);
  }else{
   for(let k=0;k<8;k++){
    const ang=(k/8)*TAU+0.4,rad=14.0;
    const ox=hx+Math.cos(ang)*rad,oz=hz+Math.sin(ang)*rad,oy=floorH(ox,oz);
    BIO.put('sh_pillar_onyx',[ox,oy-0.4,oz],qEuler(0,ang,0),[1.85,18.5,1.85],SPRINGHOLLOWS.C(0xead8b8));
    SPACE.insert({kind:'onyx-pillar',x:ox,z:oz,r:1.6},ox,oz,1.6);
   }
   const hallLight=new THREE.PointLight(0xb8f0e8,1.75,85,1.5);
   hallLight.position.set(hx,G.floorY+G.hallH*0.48,hz);
   scene.add(hallLight);
  }
  const nOnyxCols=8;

  if(typeof KSPELEO.blocks==='function'){
   const blks=KSPELEO.blocks(recs);
   for(let i=0;i<blks.length;i++){
    const bx0=blks[i].box;
    SPACE.insert({kind:'speleo',id:blks[i].id,x:0.5*(bx0[0]+bx0[1]),z:0.5*(bx0[2]+bx0[3]),r:1.2},0.5*(bx0[0]+bx0[1]),0.5*(bx0[2]+bx0[3]),1.2);
   }
  }

  REGISTER({
   tagId:'springhollows:'+SITE.cavernId,
   name:'Springhollows Karst & MVT Crystal Cavern ('+SITE.cavernId+')',
   tagClass:'landmark',
   x:hx,y:G.floorY,z:hz,r:G.hallRx,h:G.hallH+4,
   tags:{biome:'springhollows',tube:SITE.tubeId,speleo:G.speleo,crystals:recs.length}
  });

  return{
   C:C,
   floorH:floorH,
   karstNet:karstNet,
   crystals:recs.length,
   celestineBeams:celRecs.length,
   calciteClusters:calRecs.length,
   onyxFormations:onyxRecs.length+nOnyxCols,
   maxBeamLenM:+maxBeamM.toFixed(2)
  };
 }catch(e){
  reportErr('cavern: '+(e.stack||e));
  return null;
 }
})();
window._cavern=CAVERN?{
 crystals:CAVERN.crystals,
 celestineBeams:CAVERN.celestineBeams,
 calciteClusters:CAVERN.calciteClusters,
 onyxFormations:CAVERN.onyxFormations,
 maxBeamLenM:CAVERN.maxBeamLenM
}:null;
