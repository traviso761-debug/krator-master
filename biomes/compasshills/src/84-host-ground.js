// ================================================================= HOST — ground (KGROUND + custom banded-ironstone KSTRATA + KDRAWN; [G shader])
// Draws core's KSTRATA recipe 'banded-ironstone' (core/terrain/35-core-strata.js: jet-black specular magnetite & crimson jasper-chert bands over warm
// ferruginous cuesta sandstone), binds 4 library KGROUND layers per station (<= 12 samplers total), steers sub-metre
// black Fe3O4 sand ripples along COMPASS_PHYS.sandStreamAt tangents via vertex attribute aBDir, and registers KDRAWN ground.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 const opt={
  seed:9122,
  recipe:sc.recipe,
  range:sc.range,
  dip:[0.14,0.99,0.018],
  warp:[4.8,1.5]
 };
 if(sc.lateral){
  opt.lateral={recipe:sc.lateral,range:sc.range,dir:sc.dir,at:[0,0],d0:sc.d0,d1:sc.d1,tongue:sc.tongue};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='tors'?0x504c48:SKEY==='cuesta'?0xb69468:0x786854}):null;

function masksAt(x,z,h,out){
 const rock=FC.at(FC.a.rock,x,z),sand=FC.at(FC.a.sand,x,z),trail=FC.at(FC.a.trail,x,z);
 const goss=FC.at(FC.a.gossan,x,z),lich=FC.at(FC.a.lichen,x,z),wet=FC.at(FC.a.wet,x,z);
 if(SKEY==='foundry'){
  // [0] golden cuesta grass, [1] pine-oak litter, [2] tangent-steered black Fe3O4 sand ripples, [3] quench-trench gossan & delver trail
  const g4=clamp(Math.max(goss,trail*0.85,rock*0.52),0,1);
  const s3=clamp(sand*(1-g4*0.55),0,1);
  const n2w=clamp(wet*0.58*(1-s3*0.7)*(1-g4*0.7),0,1);
  const gr1=clamp((1-s3*0.82)*(1-g4*0.80)*(1-n2w*0.55),0,1);
  out[0]=gr1;out[1]=n2w;out[2]=s3;out[3]=g4;
  return out;
 }
 if(SKEY==='tors'){
  // [0] cuesta grass, [1] pine-oak needles, [2] black magnetite sand ripples, [3] isogauss lichen crust & quarry gravel
  const l4=clamp(Math.max(lich*0.88,trail*0.82,rock*0.58),0,1);
  const s3=clamp(sand*(1-l4*0.45),0,1);
  const n2w=clamp(wet*0.62*(1-s3*0.7)*(1-l4*0.65),0,1);
  const gr1=clamp((1-s3*0.80)*(1-l4*0.75)*(1-n2w*0.55),0,1);
  out[0]=gr1;out[1]=n2w;out[2]=s3;out[3]=l4;
  return out;
 }
 if(SKEY==='cuesta'){
  // [0] warm Csa dry grass, [1] pine-pistache needles, [2] domain-saddle magnetite sand streaks, [3] cuesta sandstone lichen crust
  const l4=clamp(Math.max(lich*0.65,trail*0.80,rock*0.62),0,1);
  const s3=clamp(sand*(1-l4*0.45),0,1);
  const n2w=clamp(wet*0.52*(1-s3*0.65),0,1);
  const gr1=clamp((1-s3*0.75)*(1-l4*0.70)*(1-n2w*0.48),0,1);
  out[0]=gr1;out[1]=n2w;out[2]=s3;out[3]=l4;
  return out;
 }
 // Station 4 (gorge): [0] terrace grass, [1] riparian plane/mulberry litter, [2] black magnetite-amber placer sand, [3] river cobble gravel
 const g4=clamp(Math.max(FC.at(FC.a.flow,x,z)*0.85,trail*0.85,rock*0.58),0,1);
 const s3=clamp(sand*(1-trail*0.75),0,1);
 const n2w=clamp(wet*0.64*(1-s3*0.75)*(1-g4*0.65),0,1);
 const gr1=clamp((1-s3*0.85)*(1-g4*0.78)*(1-n2w*0.55),0,1);
 out[0]=gr1;out[1]=n2w;out[2]=s3;out[3]=g4;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const GRASS=K(0xa89258),NEEDLE=K(0x565c3a),MAGSAND=K(0x20232b),GOSS=K(0x6e4238),LICH=K(0x787664),GRAV=K(0x7c7468),AMBER=K(0xb8863c);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/22,0.5,y/22,2,940)-0.5;
  masksAt(wx,wz,hh,m);
  const fourthCol=SKEY==='foundry'?GOSS:(SKEY==='gorge'?GRAV:LICH);
  c.copy(GRASS).lerp(NEEDLE,m[1]*0.72).lerp(fourthCol,m[3]*0.68).lerp(MAGSAND,m[2]*0.90);
  if(SKEY==='gorge'&&m[2]>0.45){
   const ambStreak=smooth(0.62,0.86,KRAND.fbm(x/12,0.5,y/12,2,941));
   c.lerp(AMBER,ambStreak*m[2]*0.26);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xded8cc,roughness:0.86,metalness:0.02}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xded8cc});
MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;attribute vec3 aBDir;varying vec3 vBDir;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;vBDir=aBDir;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;varying vec3 vBDir;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.28,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.35;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   // Tangent-steered sub-metre magnetite Fe3O4 sand streamline ripples along COMPASS_PHYS.sandStreamAt(x, z)!
   '{vec2 _bd=normalize(vBDir.xy+vec2(1e-5,0.0));vec2 _bn=vec2(-_bd.y,_bd.x);float _ph=dot(vGWP.xz,_bn)*11.5+sin(dot(vGWP.xz,_bd)*1.8)*0.85;float _rip=0.5+0.5*sin(_ph);float _wSand=clamp(vGL.z*vBDir.z,0.0,1.0)*(1.0-gSteep);diffuseColor.rgb*=mix(1.0,0.74+0.46*_rip,_wSand*0.85);}'+
   (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.82);':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.54,0.50),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>',
   '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.28,clamp(vGL.z*vBDir.z,0.0,1.0)*0.65);\nroughnessFactor=mix(roughnessFactor,0.26,vWet);');
 }
};

if(USE_KG){
 const fourthSlot=SKEY==='foundry'?'ground.gossan':(SKEY==='gorge'?'ground.gravel':'ground.lichen');
 const fourthName=SKEY==='foundry'?'quench-trench rust-slag & trail':(SKEY==='gorge'?'river cobble & ferry gravel':'isogauss & cuesta lichen crust');
 const layers=[
  KGROUND.layer('compasshills','ground.grass',{w:'vGL.x',amt:0.85,gain:1.0,tint:'_gT',name:'Mediterranean cuesta turf'}),
  KGROUND.layer('compasshills','ground.needles',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'stone-pine & cork-oak litter'}),
  KGROUND.layer('compasshills','ground.sand.magnetite',{w:'vGL.z',amt:0.90,gain:1.0,tint:'_gT',name:'field-line black Fe3O4 magnetite sand'}),
  KGROUND.layer('compasshills',fourthSlot,{w:'vGL.w',amt:0.84,gain:1.0,tint:'_gT',name:fourthName})
 ];
 KGROUND.hook(MAT_GROUND,{key:'compasshills-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.06,cavity:0.72,mesh:1}:null,layers:layers});
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
 const N=256,S=TERR.R*2.2,HR=S*0.5,AL=0.20,BC=1-AL,nx=N+1,m4=[0,0,0,0];
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
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),bdir=new Float32Array(nx*nx*3),hh=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=X[i],z=X[j],y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hh[k]=y;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
  const mf=COMPASS_PHYS.fieldAt(x,z,SKEY);
  const sl=FC.at(FC.a.slope,x,z);
  const sr=COMPASS_PHYS.sandStreamAt(x,z,sl,SITE.minerals.iron,mf.bMagMt,mf.gradB2);
  bdir[k*3]=Math.cos(sr.rippleYawRad);
  bdir[k*3+1]=Math.sin(sr.rippleYawRad);
  bdir[k*3+2]=Math.max(0.45,sr.streakContrast01);
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
 g.setAttribute('aBDir',new THREE.BufferAttribute(bdir,3));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);
 m.name='ground';
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();
