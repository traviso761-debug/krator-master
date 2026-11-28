// ================================================================= HOST — ground (KGROUND + KSTRATA + KDRAWN; [G shader])
// Four library KGROUND layers per station (keeping MAT_GROUND <= 13 samplers total, well below the 15/16 survey ceiling),
// KSTRATA lateral rock shading on cliffs and gorge walls, and KDRAWN warped high-resolution ground mesh registration.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 const opt={
  seed:5220,
  recipe:sc.recipe,
  range:sc.range,
  dip:[0.16,0.98,0.014],
  warp:[5.5,1.8]
 };
 if(sc.lateral){
  opt.lateral={recipe:sc.lateral,range:sc.range,dir:sc.dir,at:[0,0],d0:sc.d0,d1:sc.d1,tongue:sc.tongue};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='shore'?0x484c4e:SKEY==='wash'?0x58544c:0x767470}):null;

function masksAt(x,z,h,out){
 const rock=FC.at(FC.a.rock,x,z),wet=FC.at(FC.a.wet,x,z),sunny=FC.at(FC.a.sunny,x,z);
 if(SKEY==='shore'){
  // [0] black basalt spray-bench (< +65 m), [1] conifer needles (>= +65 m), [2] sphagnum fog-bog, [3] boulder-chevron/river gravel
  const spray=clamp(smooth(67,56,h)*(1-smooth(0.4,0.0,h)),0,1);
  const forest=clamp(smooth(61,72,h)*(1-rock*0.55),0,1);
  const bog=clamp(forest*wet*0.78,0,1);
  const grav=clamp(Math.max(FC.at(FC.a.flow,x,z),rock*0.65,spray*0.28),0,1);
  out[0]=spray;out[1]=forest*(1-bog*0.5);out[2]=bog;out[3]=grav;
  return out;
 }
 if(SKEY==='wash'){
  // [0] gorge conifer needles, [1] iron-jade travertine seep crust, [2] skarn/gneiss torrent gravel, [3] sunny lee lichen crust
  const skarn=FC.at(FC.a.skarn,x,z),flow=FC.at(FC.a.flow,x,z);
  let rimK=0;
  for(let i=0;i<RIM_POOLS.length;i++){
   const P=RIM_POOLS[i],d=Math.hypot(x-P.x,z-P.z);
   if(d<P.r*1.65)rimK=Math.max(rimK,smooth(P.r*1.62,P.r*0.85,d));
  }
  const trav=clamp(Math.max(rimK,skarn*wet*0.48),0,1);
  const lich=clamp(smooth(0.55,0.82,sunny)*(0.45+0.55*rock)*(1-trav),0,1);
  const grav=clamp(Math.max(flow,rock*0.62)*(1-trav*0.7),0,1);
  const need=clamp((1-trav)*(1-grav*0.65)*(1-lich*0.6),0,1);
  out[0]=need;out[1]=trav;out[2]=grav;out[3]=lich;
  return out;
 }
 // Station 3 (head): [0] periglacial alpine turf & melt-well peat, [1] granite/moraine gravel, [2] late-spring snowpack, [3] cryo-snow algae
 const sn=FC.at(FC.a.snow,x,z),alg=FC.at(FC.a.algae,x,z);
 const frostPoly=FROST?FROST.sample(x,z,{}).poly:0;
 const grav=clamp(Math.max(rock*0.78,frostPoly*0.85,smooth(38,78,h)*0.65)*(1-sn*0.85),0,1);
 const turf=clamp((1-sn)*(1-grav*0.72),0,1);
 out[0]=turf;out[1]=grav;out[2]=clamp(sn*(1-alg*0.55),0,1);out[3]=alg;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BAS=K(0x282c32),FOREST=K(0x364830),BOG=K(0x465c36),GRAV=K(0x6c6a64);
 const TRAV_T=K(0xb45c38),TRAV_C=K(0x6e9882),LICH=K(0x888668);
 const TURF=K(0x4c5438),PEAT=K(0x2c241e),SNOW=K(0xe8eef2),ALGAE_T=K(0x3c9684),ALGAE_O=K(0xb87836);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,540)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='shore'){
   c.copy(FOREST).lerp(BOG,m[2]*0.65).lerp(GRAV,m[3]*0.55).lerp(BAS,m[0]*0.92);
  }else if(SKEY==='wash'){
   const celMix=smooth(-130,-40,wx)*0.6+0.4*KRAND.fbm(x/18,0.5,y/18,2,541);
   const travCol=c.clone().copy(TRAV_T).lerp(TRAV_C,clamp(celMix,0,1));
   c.copy(FOREST).lerp(GRAV,m[2]*0.62).lerp(LICH,m[3]*0.58).lerp(travCol,m[1]*0.86);
  }else{
   const mw=nearestMeltWell(wx,wz);
   const inWell=(mw.well&&mw.d<mw.well.r*1.18)?smooth(mw.well.r*1.18,mw.well.r*0.65,mw.d):0;
   const algMix=KRAND.fbm(x/14,0.5,y/14,2,542);
   const algCol=new THREE.Color().copy(ALGAE_T).lerp(ALGAE_O,smooth(0.48,0.78,algMix));
   c.copy(TURF).lerp(GRAV,m[1]*0.68).lerp(PEAT,inWell*0.92).lerp(SNOW,m[2]*0.94).lerp(algCol,m[3]*0.86);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdad8d2,roughness:0.88,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdad8d2});
MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.30,0.64,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.38;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.78);':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.54,0.52),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.28,vWet);');
 }
};

if(USE_KG){
 const layers=SKEY==='shore'?[
  KGROUND.layer('crook','ground.basalt',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'tsunami-scoured basalt bench'}),
  KGROUND.layer('crook','ground.needles',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',name:'coastal conifer litter'}),
  KGROUND.layer('crook','ground.sphagnum',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',name:'rainforest sphagnum moss'}),
  KGROUND.layer('crook','ground.gravel',{w:'vGL.w',amt:0.78,gain:1.0,tint:'_gT',name:'chevron & estuary cobbles'})
 ]:SKEY==='wash'?[
  KGROUND.layer('crook','ground.needles',{w:'vGL.x',amt:0.85,gain:1.0,tint:'_gT',name:'gorge red-cypress litter'}),
  KGROUND.layer('crook','ground.travertine',{w:'vGL.y',amt:0.88,gain:1.0,tint:'_gT',name:'iron-jade rimstone sinter'}),
  KGROUND.layer('crook','ground.gravel',{w:'vGL.z',amt:0.80,gain:1.0,tint:'_gT',name:'skarn & gneiss torrent gravel'}),
  KGROUND.layer('crook','ground.lichen',{w:'vGL.w',amt:0.82,gain:1.0,tint:'_gT',name:'rain-shadow lichen crust'})
 ]:[
  KGROUND.layer('crook','ground.turf',{w:'vGL.x',amt:0.85,gain:1.0,tint:'_gT',name:'periglacial moraine turf & peat'}),
  KGROUND.layer('crook','ground.gravel',{w:'vGL.y',amt:0.82,gain:1.0,tint:'_gT',name:'sorted granite & slate moraine'}),
  KGROUND.layer('crook','ground.snow',{w:'vGL.z',amt:0.92,gain:1.0,tint:'vec3(1.0)',name:'late-spring alpine snowpack'}),
  KGROUND.layer('crook','ground.algae',{w:'vGL.w',amt:0.88,gain:1.0,tint:'_gT',name:'malachite-teal & ochre cryo-snow algae'})
 ];
 KGROUND.hook(MAT_GROUND,{key:'crook-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,layers:layers});
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
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();
