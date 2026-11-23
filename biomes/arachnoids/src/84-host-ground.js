// ================================================================= HOST — ground, KSTRATA, KDRAWN, KSTACKS dike fins & KSPELEO alcoves ([G shader])
// Four library KGROUND layers per station (keeping MAT_GROUND <= 12 samplers, well under the 15 survey ceiling),
// KSTRATA horizontal arch-rift-basalt colonnade + baked red bolus contact shading, KDRAWN warped ground registration,
// KSTACKS standing radial basalt/vitrophyre dike fins, and KCAVERN + KSPELEO alcoves (HYPOGENE saltpeter on nexus; SMOKY Kluft on ledges).
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 const opt={
  seed:5920,
  recipe:sc.recipe,
  range:sc.range,
  dip:[0.14,0.98,0.015],
  warp:[5.2,1.7]
 };
 if(sc.lateral){
  opt.lateral={recipe:sc.lateral,range:sc.range,dir:sc.dir,at:[0,0],d0:sc.d0,d1:sc.d1,tongue:sc.tongue};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='nexus'?0x524c48:SKEY==='fumarole'?0x5c5850:SKEY==='ledges'?0x7a7062:0x686a6e}):null;

function masksAt(x,z,h,out){
 const rock=FC.at(FC.a.rock,x,z),wet=FC.at(FC.a.wet,x,z),vitro=FC.at(FC.a.vitro,x,z);
 if(SKEY==='nexus'){
  // [0] chilled black vitrophyre dike talus, [1] canyon mist moss, [2] 9102 river sandbars, [3] dry overhang saltpeter nitre crust
  const fl=FC.at(FC.a.flow,x,z),nit=FC.at(FC.a.nitre,x,z);
  const sand=clamp(Math.max(fl*0.85,smooth(-6.0,-13.5,h)*0.65)*(1.0-nit),0,1);
  const vit=clamp(Math.max(vitro*0.88,rock*0.52)*(1.0-sand*0.5)*(1.0-nit*0.7),0,1);
  const moss=clamp(wet*(1.0-vit*0.55)*(1.0-sand*0.65)*(1.0-nit),0,1);
  out[0]=vit;out[1]=moss;out[2]=sand;out[3]=nit;
  return out;
 }
 if(SKEY==='fumarole'){
  // [0] thermophilic orange-gold-jade biofilm, [1] white silica sinter apron, [2] humid canyon moss, [3] cassiterite/gold placer sand
  const sint=FC.at(FC.a.sinter,x,z),thm=FC.at(FC.a.therm,x,z),fl=FC.at(FC.a.flow,x,z);
  let poolK=0;
  for(let i=0;i<STEP_POOLS.length;i++){
   const P=STEP_POOLS[i],d=Math.hypot(x-P.x,z-P.z);
   if(d<P.r*1.58)poolK=Math.max(poolK,smooth(P.r*1.55,P.r*0.92,d));
  }
  const bioMat=clamp(Math.max(sint*0.85,poolK*0.82)*(1.0-thm*0.5),0,1);
  const whiteSinter=clamp(Math.max(thm*0.92,sint*0.55,poolK*0.45),0,1);
  const placer=clamp(Math.max(fl*0.82,rock*0.48)*(1.0-whiteSinter*0.7)*(1.0-bioMat*0.6),0,1);
  const moss=clamp((1.0-bioMat*0.75)*(1.0-whiteSinter*0.75)*(1.0-placer*0.65),0,1);
  out[0]=bioMat;out[1]=whiteSinter;out[2]=moss;out[3]=placer;
  return out;
 }
 if(SKEY==='ledges'){
  // [0] columnarpine & oak needles, [1] Csa dry sun-bench grass, [2] vitrophyre/tuff dike gravel, [3] granite/colonnade lichen crust
  const vit=clamp(Math.max(vitro*0.82,rock*0.60),0,1);
  const lich=clamp(rock*0.68*(1.0-vit*0.4),0,1);
  const grass=clamp(smooth(-20.0,45.0,h)*(1.0-rock*0.7)*(0.45+0.55*smooth(-40.0,65.0,z)),0,1);
  const need=clamp((1.0-vit*0.65)*(1.0-lich*0.55)*(1.0-grass*0.5),0,1);
  out[0]=need;out[1]=grass;out[2]=vit;out[3]=lich;
  return out;
 }
 // Station 4 (frostrim): [0] KFROST sorted stone polygon turf, [1] jet-black vitrophyre glass scree, [2] alpine lichen, [3] leeward snow patch
 const sn=FC.at(FC.a.snow,x,z);
 const frostPoly=FROST?FROST.sample(x,z,{}).poly:0;
 const vit=clamp(Math.max(vitro*0.92,frostPoly*0.65)*(1.0-sn*0.8),0,1);
 const lich=clamp(rock*0.72*(1.0-vit*0.5)*(1.0-sn*0.85),0,1);
 const turf=clamp((1.0-sn)*(1.0-vit*0.68)*(1.0-lich*0.55),0,1);
 out[0]=turf;out[1]=vit;out[2]=lich;out[3]=sn;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const VIT=K(0x22262e),MOSS=K(0x3a5232),SAND=K(0x6e685c),NITRE=K(0xe2dfd4),BOLUS=K(0x8e3e2e);
 const THERM_O=K(0xc8742c),THERM_J=K(0x4e8c68),SINT_W=K(0xdcd8cc);
 const NEED=K(0x445236),GRASS=K(0x867e50),LICH=K(0x82846c);
 const FTURF=K(0x525842),SNOW=K(0xe6ecf2);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,594)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='nexus'){
   const bolusBand=smooth(0.45,0.82,FC.at(FC.a.vitro,wx,wz))*(1.0-smooth(0.82,0.96,FC.at(FC.a.vitro,wx,wz)));
   c.copy(MOSS).lerp(SAND,m[2]*0.65).lerp(BOLUS,bolusBand*0.55).lerp(VIT,m[0]*0.86).lerp(NITRE,m[3]*0.88);
  }else if(SKEY==='fumarole'){
   const jMix=KRAND.fbm(x/16,0.5,y/16,2,595);
   const thCol=new THREE.Color().copy(THERM_O).lerp(THERM_J,smooth(0.45,0.78,jMix));
   c.copy(MOSS).lerp(SAND,m[3]*0.64).lerp(SINT_W,m[1]*0.84).lerp(thCol,m[0]*0.82);
  }else if(SKEY==='ledges'){
   c.copy(NEED).lerp(GRASS,m[1]*0.64).lerp(LICH,m[3]*0.58).lerp(VIT,m[2]*0.72);
  }else{
   c.copy(FTURF).lerp(LICH,m[2]*0.58).lerp(VIT,m[1]*0.84).lerp(SNOW,m[3]*0.92);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdad8d0,roughness:0.86,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdad8d0});
MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.28,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.36;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.80);':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.54,0.52),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.26,vWet);');
 }
};

if(USE_KG){
 const layers=SKEY==='nexus'?[
  KGROUND.layer('arachnoids','ground.vitrophyre',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'chilled obsidian-vitrophyre dike talus'}),
  KGROUND.layer('arachnoids','ground.moss',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'mist-fed slot gorge moss'}),
  KGROUND.layer('arachnoids','ground.sand',{w:'vGL.z',amt:0.80,gain:1.0,tint:'_gT',name:'Ham-Tsek river eddy sandbars'}),
  KGROUND.layer('arachnoids','ground.nitre',{w:'vGL.w',amt:0.88,gain:1.0,tint:'_gT',name:'dry overhang saltpeter nitre crust'})
 ]:SKEY==='fumarole'?[
  KGROUND.layer('arachnoids','ground.therm',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',name:'thermophilic orange-gold-jade fumarole mat'}),
  KGROUND.layer('arachnoids','ground.sinter',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',name:'hydrothermal white silica sinter'}),
  KGROUND.layer('arachnoids','ground.moss',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',name:'steaming cauldron floor moss'}),
  KGROUND.layer('arachnoids','ground.sand',{w:'vGL.w',amt:0.82,gain:1.0,tint:'_gT',name:'cassiterite & gold placer sandbar'})
 ]:SKEY==='ledges'?[
  KGROUND.layer('arachnoids','ground.needles',{w:'vGL.x',amt:0.85,gain:1.0,tint:'_gT',name:'columnarpine & canyon oak litter'}),
  KGROUND.layer('arachnoids','ground.grass',{w:'vGL.y',amt:0.82,gain:1.0,tint:'_gT',name:'Csa sun-baked bench turf'}),
  KGROUND.layer('arachnoids','ground.vitrophyre',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',name:'colonnade dike scree'}),
  KGROUND.layer('arachnoids','ground.lichen',{w:'vGL.w',amt:0.82,gain:1.0,tint:'_gT',name:'granite & tuff crustose lichen'})
 ]:[
  KGROUND.layer('arachnoids','ground.frost',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'KFROST sorted stone polygon rings'}),
  KGROUND.layer('arachnoids','ground.vitrophyre',{w:'vGL.y',amt:0.88,gain:1.0,tint:'_gT',name:'jet-black obsidian-vitrophyre dike scree'}),
  KGROUND.layer('arachnoids','ground.lichen',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',name:'alpine granite felsenmeer lichen'}),
  KGROUND.layer('arachnoids','ground.snow',{w:'vGL.w',amt:0.92,gain:1.0,tint:'vec3(1.0)',name:'leeward rime & snow patches'})
 ];
 KGROUND.hook(MAT_GROUND,{key:'arachnoids-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,layers:layers});
}

let DRAWN_SRC=null;
function DRAWN_H(x,z){const h=DRAWN_SRC?DRAWN_SRC.h(x,z):null;return h===null?terrainH(x,z):h;}
function DRAWN_N(x,z,span){
 const e=span==null?0.45:span;
 const hx=DRAWN_H(x+e,z)-DRAWN_H(x-e,z),hz=DRAWN_H(x,z+e)-DRAWN_H(x,z-e);
 const nx=-hx,ny=2*e,nz=-hz,L=Math.hypot(nx,ny,nz);
 const inv=L>1e-9?1/L:1;
 return[nx*inv,ny*inv,nz*inv];
}

const GROUND=(function(){
 const N=360,S=TERR.R*2.2,HR=S*0.5,AL=0.20,BC=1-AL,nx=N+1,m4=[0,0,0,0];
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
 DRAWN_SRC={
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
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);
 m.name='ground';
 m.userData.heightAt=DRAWN_H;
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// ---------------------------------------------------------------- KSTACKS standing radial arch-rift-basalt & vitrophyre dike fins
const STACK_MESHES=(function(){
 if(!DIKE_STACKS.length||typeof KSTACKS==='undefined')return[];
 const out=[];
 for(let i=0;i<DIKE_STACKS.length;i++){
  const B=DIKE_STACKS[i];
  const M0=KSTACKS.mesh(B,{step:3.6});
  if(!M0||!M0.idx||!M0.idx.length)continue;
  const nv=M0.pos.length/3,col=new Float32Array(nv*3),uv=new Float32Array(nv*2);
  for(let k=0;k<nv;k++){
   const oc=0.58+0.42*M0.occ[k];
   const tint=B.vitro?[0.52,0.56,0.64]:[0.74,0.76,0.82];
   col[k*3]=tint[0]*oc;col[k*3+1]=tint[1]*oc;col[k*3+2]=tint[2]*oc;
   uv[k*2]=M0.uv[k*2]*0.28;uv[k*2+1]=M0.uv[k*2+1]*0.28;
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
  sg.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  sg.setAttribute('color',new THREE.BufferAttribute(col,3));
  sg.setIndex(new THREE.BufferAttribute(M0.idx,1));
  sg.computeVertexNormals();
  sg.computeBoundingSphere();
  const mat=B.vitro?ARACHNOIDS.M.rockVitrophyreVC:ARACHNOIDS.M.rockBasaltVC;
  const sm=new THREE.Mesh(sg,mat);
  sm.name='stack:'+B.id;
  sm.castShadow=true;sm.receiveShadow=true;
  sm.userData.host=true;
  sm.userData.inspectLabel=B.vitro?'Glassy Obsidian-Vitrophyre Dike Hogback Rib (KSTACKS)':'Radial Arch-Rift-Basalt Columnar Shut-In Dike Fin (KSTACKS)';
  scene.add(sm);
  out.push(sm);
 }
 return out;
})();

// ---------------------------------------------------------------- KCAVERN + KSPELEO Alcoves (Station 1 HYPOGENE saltpeter; Station 3 SMOKY Kluft)
const ALCOVE=(function(){
 if(!SITE.alcove||GQ.get('alcove')==='0'||typeof KCAVERN==='undefined'||typeof KSPELEO==='undefined')return null;
 try{
  const A=SITE.alcove,px=A.portal[0],pz=A.portal[1],hx=A.hall[0],hz=A.hall[1];
  const isSmoky=A.speleo==='SMOKY';
  const C=KCAVERN.create({
   ground:DRAWN_H,
   cell:0.8,
   chunk:16,
   seed:KRAND.child(5941,'arachnoids/'+SKEY+'/alcove'),
   minRock:0.8,
   walk:typeof KWALK!=='undefined'?KWALK:null
  });
  const pts=[[px,A.floorY-0.2,pz],[0.5*(px+hx),A.floorY,0.5*(pz+hz)],[hx,A.floorY+0.2,hz]];
  C.tube({id:A.id+'-throat',owner:A.id,pts:pts,w:isSmoky?5.2:6.4,h:isSmoky?7.5:5.6,spring:0.45,rock:isSmoky?'basalt':'tuff',finish:'raw',walkW:4.2});
  C.hall({id:A.id+'-chamber',owner:A.id,c:[hx,A.floorY+0.2,hz],rx:A.hallRx,rz:A.hallRz,h:A.hallH,belly:0.28});
  C.opening({id:A.id+'-mouth',c:[px,pz],r:9.5,rim:5.5,kind:'well'});
  C.build();

  // Open the portal mouth in GROUND.geometry cleanly
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

  const slotName=isSmoky?'rock.granite':'rock.sandstone';
  const L0=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('arachnoids',slotName):null;
  const fallbackMap=isSmoky?ARACHNOIDS.M.rockGranite.map:ARACHNOIDS.M.rockSandstone.map;
  const LT=L0?KMAT.textures(L0,{aniso:8}):{map:fallbackMap,normalMap:null,roughnessMap:null};
  const rockMat=new THREE.MeshStandardMaterial({
   map:LT.map||fallbackMap,
   normalMap:LT.normalMap||null,
   roughnessMap:LT.roughnessMap||null,
   color:isSmoky?0xd8d2c8:0xdcc8b0,
   roughness:0.76,
   metalness:0.04,
   emissive:isSmoky?0x241e1a:0x262420,
   emissiveIntensity:0.22,
   vertexColors:true,
   side:THREE.DoubleSide
  });
  if(typeof KCAVERN.cutLayer==='function'){
   KCAVERN.cutLayer(rockMat,{attr:'aKCut'});
   KCAVERN.cut.above(2.4);
  }

  const cutW=typeof KCAVERN.cutWeight==='function'?KCAVERN.cutWeight(C):null;
  const RIM=15.0,S=TERR.R*2.2,UVS=2.4,PRIM_GND=65535;
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
    const oc=0.52+0.48*ch.occ[vi];
    RK.col.push(oc,oc*0.97,oc*0.93);
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
   rm.name='alcove:rock-'+SKEY;
   rm.userData.host=true;rm.userData.cave=true;rm.userData.probeSkip=true;
   rm.userData.inspectLabel=isSmoky?'Radial Tension-Fissure Kluft Wall (Granite-Basalt Contact)':'Dry Canyon-Wall Saltpeter Overhang Alcove (saltpeter=200)';
   scene.add(rm);
  }
  if(GR.idx.length){
   const gg=new THREE.BufferGeometry();
   gg.setAttribute('position',new THREE.Float32BufferAttribute(GR.pos,3));
   gg.setAttribute('normal',new THREE.Float32BufferAttribute(GR.nrm,3));
   gg.setAttribute('uv',new THREE.Float32BufferAttribute(GR.uv,2));
   gg.setAttribute('aGL',new THREE.Float32BufferAttribute(GR.gl,4));
   gg.setAttribute('aWet',new THREE.Float32BufferAttribute(new Float32Array(GR.n),1));
   gg.setIndex(GR.idx);
   gg.computeBoundingSphere();
   const gmMesh=new THREE.Mesh(gg,MAT_GROUND);
   gmMesh.name='alcove:rim-'+SKEY;
   gmMesh.userData.host=true;gmMesh.userData.cave=true;gmMesh.userData.probeSkip=true;
   gmMesh.userData.inspectLabel=SITE.name;
   scene.add(gmMesh);
  }

  const kindsPreset=isSmoky?(KSPELEO.SMOKY||KSPELEO.VUG):KSPELEO.HYPOGENE;
  const recs=KSPELEO.place(C,{
   box:[hx-A.hallRx-2,hz-A.hallRz-2,hx+A.hallRx+2,hz+A.hallRz+2],
   y:A.floorY+2.4,
   cell:1.6,
   world:KRAND.child(5942,'arachnoids/'+SKEY+'/speleo'),
   kinds:kindsPreset,
   accept:r=>Math.hypot(r.x-px,r.z-pz)>3.0
  });

  if(recs.length){
   const M0=KSPELEO.mesh(recs,{seg:6}),nv=M0.pos.length/3;
   const uvA=new Float32Array(nv*2),colA=new Float32Array(nv*3);
   const tint=isSmoky?[0.68,0.60,0.54]:[0.95,0.93,0.88];
   for(let i=0;i<nv;i++){
    const vx=M0.pos[i*3],vy=M0.pos[i*3+1],vz=M0.pos[i*3+2];
    uvA[i*2]=(vx+vz)*0.55;uvA[i*2+1]=vy*0.65;
    const sh=0.80+0.20*KRAND.unit(KRAND.hash(5949,i,1,7));
    colA[i*3]=tint[0]*sh;colA[i*3+1]=tint[1]*sh;colA[i*3+2]=tint[2]*sh;
   }
   const sg=new THREE.BufferGeometry();
   sg.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
   sg.setAttribute('normal',new THREE.BufferAttribute(M0.nrm,3));
   sg.setAttribute('uv',new THREE.BufferAttribute(uvA,2));
   sg.setAttribute('color',new THREE.BufferAttribute(colA,3));
   sg.setIndex(new THREE.BufferAttribute(M0.idx,1));
   sg.computeBoundingSphere();
   const sm=new THREE.Mesh(sg,isSmoky?ARACHNOIDS.M.crystalSmoky:ARACHNOIDS.M.crystalNitre);
   sm.name='alcove:speleo-'+SKEY;
   sm.userData.host=true;
   sm.userData.inspectLabel=isSmoky?'Smoky-Quartz & Chlorite Kluft Druse (KSPELEO.SMOKY)':'Gypsum-Nitrate Saltpeter Crusts & Chandeliers (KSPELEO.HYPOGENE, saltpeter=200)';
   scene.add(sm);
  }

  const hallLight=new THREE.PointLight(isSmoky?0xffe8d0:0xfff6e8,1.5,32,1.6);
  hallLight.position.set(hx,A.floorY+4.5,hz);
  scene.add(hallLight);

  if(typeof KSPELEO.blocks==='function'){
   const blks=KSPELEO.blocks(recs);
   for(let i=0;i<blks.length;i++){
    const bx0=blks[i].box;
    SPACE.insert({kind:'speleo',id:blks[i].id},0.5*(bx0[0]+bx0[1]),0.5*(bx0[2]+bx0[3]),1.0);
   }
  }
  REGISTER({
   tagId:'arachnoids:'+A.id,
   name:isSmoky?'Smoky-Quartz Radial Tension Kluft (KSPELEO.SMOKY)':'Dry Overhang Saltpeter & Nitre-Swiftlet Alcove (KSPELEO.HYPOGENE)',
   tagClass:'landmark',
   x:hx,y:A.floorY,z:hz,r:16,h:A.hallH+2,
   tags:{biome:'arachnoids',speleo:A.speleo,crystals:recs.length}
  });
  return{C:C,crystals:recs.length,speleo:A.speleo};
 }catch(e){
  reportErr('alcove: '+(e.stack||e));
  return null;
 }
})();
window._alcove=ALCOVE?{crystals:ALCOVE.crystals,speleo:ALCOVE.speleo}:null;
