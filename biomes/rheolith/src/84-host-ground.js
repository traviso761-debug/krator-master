// ================================================================= HOST — the ground (PLAN.md section 7; KGROUND 5 layers + KSTRATA + KDRAWN)
// Five library layers from materials.json (under the 16-sampler limit):
//   aGL.x  CINDER         ground.cinder: black scoria ash across the graben floor
//   aGL.y  CRUST          ground.crust: ropy pahoehoe lava roof on the buoyed sill bench
//   aGL.z  SINTER         ground.sinter: cream kalsilite-zeolite collars and aprons round fumaroles and the throat rim
//   aGL.w  EFFLORESCENCE  ground.efflorescence: white silica frost and acid sulfate blooms
//   aSalt  BASALT         ground.basalt: flow-banded basalt on the twin fault scarps and steep throat walls
// Deepest conduit floor (y < -17.2 m inside the breached throat, >520 degC) adds pure Planck blackbody incandescence in the
// ground fragment shader (MAT_GROUND.emissive stays 0x000000). Registers KDRAWN.grid for item 28 (drawn-ground).
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:5120,recipe:'rift',range:[-26,110],dip:[.18,.98,.08],warp:[4,1.6]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x52463e}):null;
function setStones(){}

function masksAt(x,z,h,out){
 const cin=FC.at(FC.a.cinder,x,z),crust=FC.at(FC.a.crust,x,z),vent=FC.at(FC.a.vent,x,z),acid=FC.at(FC.a.acid,x,z),rock=FC.at(FC.a.rock,x,z),up=FC.at(FC.a.upland,x,z);
 const rp=Math.hypot(x-PIT.x,z-PIT.z);
 let sin=smooth(PIT.r*1.45,PIT.throatR*1.2,rp)*smooth(PIT.throatR*.65,PIT.throatR*1.15,rp);
 for(let i=1;i<VENTS.length;i++){
  const V=VENTS[i],d=Math.hypot(x-V.x,z-V.z);
  sin=Math.max(sin,smooth(11,2.5,d));
 }
 const rotD=Math.hypot(x-VENTS[2].x,z-VENTS[2].z);
 const eff=clamp(Math.max(smooth(16,3,rotD)*.92,acid*smooth(.35,.72,fbm(x*.018,z*.018,3.7,2))*(1-crust)*.75),0,1);
 const bas=clamp(Math.max(rock,up*.75,smooth(-4,-12,h)),0,1);
 out[0]=clamp(cin*(1-crust)*(1-sin*.8)*(1-bas*.6),0,1);
 out[1]=clamp(crust*(1-sin*.5),0,1);
 out[2]=clamp(sin*(1-eff*.4),0,1);
 out[3]=eff;
 out[4]=bas;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0,0];
 const SCORIA=K(0x2d2926),PAHOE=K(0x23252c),SINTER=K(0xc8bea6),FROST=K(0xeae6dc),SELEN=K(0x98281c),SULF=K(0xbda83c),BASALT=K(0x46403c),FLANK=K(0x524c3e);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/22,y/22,.4,2)-.5,hh=FC.at(FC.a.h,wx,wz),up=FC.at(FC.a.upland,wx,wz),vent=FC.at(FC.a.vent,wx,wz);
  masksAt(wx,wz,hh,m);
  c.copy(SCORIA).lerp(FLANK,up*.65);
  c.lerp(PAHOE,m[1]*.88);
  c.lerp(BASALT,m[4]*.72);
  c.lerp(SINTER,m[2]*.82);
  c.lerp(SULF,vent*.42*smooth(.45,.75,fbm(x/16,y/16,1.9,2)));
  c.lerp(FROST,m[3]*.78);
  c.lerp(SELEN,m[3]*.38*smooth(.68,.82,fbm(x/11,y/11,4.6,2)));
  const k=1+n*.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;
  d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.9,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{
 sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aSalt;varying float vSalt;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vSalt=aSalt;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vSalt;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=pow(texture2D(uDetail,vGWP.xz*0.165).rgb,vec3(2.2))/0.81;vec3 dt2=pow(texture2D(uDetail,vGWP.xz*0.021+0.37).rgb,vec3(2.2))/0.81;gSteep=smoothstep(0.32,0.64,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.45;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*(1.0-vGL.z)*0.78);':'')+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.58,0.54,0.50),vWet);}')
  .replace('#include <dithering_fragment>','{float rPit=length(vGWP.xz);float inc=smoothstep(-16.2,-20.4,vGWP.y)*smoothstep(8.5,3.8,rPit);gl_FragColor.rgb+=inc*vec3(0.62,0.13,0.018);}\n#include <dithering_fragment>');
 if(USE_KG)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.34,vWet);');
};

if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'rheolith-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.07,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('rheolith','ground.cinder',{w:'vGL.x*0.9',amt:.85,gain:1.0,tint:'_gT',name:'black basaltic scoria'}),
 KGROUND.layer('rheolith','ground.crust',{w:'vGL.y',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'pahoehoe lava crust'}),
 KGROUND.layer('rheolith','ground.sinter',{w:'vGL.z',amt:.88,gain:1.0,tint:'vec3(1.0)',name:'kalsilite-zeolite fumarole sinter'}),
 KGROUND.layer('rheolith','ground.efflorescence',{w:'vGL.w',amt:.78,gain:1.0,tint:'vec3(1.0)',name:'silica frost and acid blooms'}),
 KGROUND.layer('rheolith','ground.basalt',{w:'vSalt',amt:.82,gain:1.0,tint:'_gT',name:'flow-banded fault-scarp basalt'})
]});

let DRAWN_SRC=null;
function DRAWN_H(x,z){const h=DRAWN_SRC?DRAWN_SRC.h(x,z):null;return h===null?terrainH(x,z):h;}
function DRAWN_N(x,z,span){
 const e=span==null?.45:span;
 const hx=DRAWN_H(x+e,z)-DRAWN_H(x-e,z),hz=DRAWN_H(x,z+e)-DRAWN_H(x,z-e);
 const nx=-hx,ny=2*e,nz=-hz,L=Math.hypot(nx,ny,nz)||1;
 return[nx/L,ny/L,nz/L];
}

const GROUND=(function(){
 const N=520,S=TERR.R*2.2,HR=S*.5,AL=.165,BC=1-AL,nx=N+1,m5=[0,0,0,0,0];
 const X=new Float64Array(nx);
 for(let i=0;i<nx;i++){const u=2*(i/N)-1;X[i]=HR*(AL*u+BC*u*u*u);}
 const invIdx=v=>{
  const y=v/HR;
  if(y<=-1)return 0;
  if(y>=1)return N-1;
  const p=AL/BC,q=y/BC,hq=q*.5,p3=p/3,disc=Math.sqrt(hq*hq+p3*p3*p3);
  const u=Math.cbrt(hq+disc)+Math.cbrt(hq-disc);
  let idx=Math.min(N-1,Math.max(0,Math.floor((u+1)*.5*N)));
  while(idx>0&&v<X[idx])idx--;
  while(idx<N-1&&v>X[idx+1])idx++;
  return idx;
 };
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),salt=new Float32Array(nx*nx),hh=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=X[i],z=X[j],y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hh[k]=y;
  uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m5);gl[k*4]=m5[0];gl[k*4+1]=m5[1];gl[k*4+2]=m5[2];gl[k*4+3]=m5[3];salt[k]=m5[4];
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
 g.setAttribute('aSalt',new THREE.BufferAttribute(salt,1));
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
REGISTER({name:SITE.name,x:0,z:0,y:PIT.floor-6,r:240,h:120});
