// ================================================================= HOST — stage: 4-station skerry coast, browsewood, kelpfront & cloudslope ([web])
// Implements all four surveyed Scale-Model 5.1 Matron's Coast / Snail Coast (rmwvqchv37nh0) stations (PLAN.md section 4):
//   skerry     (default, dist/matronscoast.html):            Drowned Skerry Sound, KCOAST shores, Coquina Conch-Middens & Megachitons
//   browsewood (dist/matronscoast-browsewood.html):          The 2.2 m Browse-Line Snail Cathedral & Opalescent Mucus Silver-Highways
//   kelpfront  (dist/matronscoast-kelpfront.html):           The Southern Kelp-Grazing Front rasping back Farside landkelp
//   cloudslope (dist/matronscoast-cloudslope.html):          Upper +2,150 m Cfb Cloud-Rainforest, Shell-Tufa Cataract & Shag-Shell Snails
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}

const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];
function REGISTER(o){
 REG.push(o);
 BIO.record(o);
 if(typeof KTAGS!=='undefined'&&KTAGS.page&&o.tagId){
  try{
   KTAGS.page.add({
    id:o.tagId,
    name:o.name,
    class:o.tagClass||'feature',
    at:[o.x,o.y==null?0:o.y,o.z],
    r:o.r,
    h:o.h,
    tags:o.tags||{}
   });
  }catch(e){}
 }
}
function regHas(r,x,y,z){
 const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;
 return dx*dx+dz*dz<=r.r*r.r&&y>=ry-4&&y<=ry+r.h+8;
}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'skerry';
const SITE=SNAIL_SITES[SKEY]||SNAIL_SITES.skerry;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_MIST=PQ.get('mode')==='mist'||PQ.get('fog')==='1';
const MC_STATE={
 mode:INIT_MIST?'mist':'day',
 mist01:INIT_MIST?1.0:0.35
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='cloudslope'?0xc8d8dc:SKEY==='browsewood'?0xcbdad2:0xc6d8dc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='cloudslope'?0.00030:SKEY==='browsewood'?0.00024:0.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
const hemiLight=new THREE.HemisphereLight(0xe4f0f2,0x425244,0.90);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff4e2,1.36);
sun.position.set(420,920,-480);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xcfe4ee,0.26);
fill.position.set(-480,360,520);
scene.add(fill);

// ---------------------------------------------------------------- 4-station coastal, rainforest & cataract heightfields
const TERR={R:560};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

function inCamPad(x,z,extraR){
 const pads=SITE.camPads||[];
 const padAdd=extraR==null?0:extraR;
 for(let i=0;i<pads.length;i++){
  const p=pads[i];
  if(Math.hypot(x-p[0],z-p[1])<p[2]+padAdd)return true;
 }
 return false;
}

function flattenReserves(h,x,z,seed){
 const res=SITE.reserves||[];
 let out=h;
 for(let i=0;i<res.length;i++){
  const R=res[i],d=Math.hypot(x-R.x,z-R.z);
  if(d<R.r*1.42){
   const ty=R.targetY==null?10.0:R.targetY;
   out=mix(out,ty+0.22*n2(x,z,0.024,seed+i*13),smooth(R.r*1.38,R.r*0.72,d));
  }
 }
 return out;
}

/* Freshwater rain-streams terminating cleanly at SEA shoreline (Station 1 skerry & Station 3 kelpfront) */
const STREAMS=(function(){
 if(SKEY==='skerry'){
  return[{
   name:'East Skerry Coquina Rain-Brook',
   w:3.2,
   depth:0.32,
   speed:1.45,
   pts:[[164,46],[138,32],[112,18],[88,6],[66,-4],[46,-10]]
  }];
 }
 if(SKEY==='kelpfront'){
  return[{
   name:'Frontier Saponin-Runoff Coastal Rill',
   w:3.6,
   depth:0.34,
   speed:1.65,
   pts:[[152,24],[118,20],[82,16],[46,14],[12,12],[-18,10],[-46,8]]
  }];
 }
 return[];
})();

function streamDistAt(x,z){
 let best=1e9;
 for(let s=0;s<STREAMS.length;s++){
  const P=STREAMS[s].pts;
  for(let i=0;i<P.length-1;i++){
   const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];
   const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
   const t=l2>1e-6?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0;
   const d=Math.hypot(ax+dx*t-x,az+dz*t-z);
   if(d<best)best=d;
  }
 }
 return best;
}

function bareGround(x,z){
 const macro=10.5*n2(x,z,0.0028,9210)+3.6*n2(x,z,0.0075,9211);
 const mh=SNAIL_PHYS.mucusHighwayAt(x,z,SITE,0.12);

 if(SKEY==='skerry'){
  /* Two drowned granite-and-coquina skerry islands separated by a 22 m-deep jade Skerry Sound around x = 8 */
  const dWest=Math.hypot((x+88)/118,(z-22)/128)+0.10*n2(x,z,0.012,9212);
  const dEast=Math.hypot((x-106)/112,(z+4)/122)+0.10*n2(x,z,0.012,9213);
  const dSouthSpit=Math.hypot((x+24)/95,(z-168)/82);
  const wLift=32.5*Math.pow(clamp(1.16-dWest,0,1.16),1.35);
  const eLift=30.0*Math.pow(clamp(1.14-dEast,0,1.14),1.35);
  const sLift=24.0*Math.pow(clamp(1.10-dSouthSpit,0,1.10),1.4);
  let h=-22.5+Math.max(wLift,eLift,sLift)+macro*0.42;
  /* Perched shell-dammed emerald coquina pool basin on West Matron Skerry at (-68, 26) */
  const dPool=Math.hypot(x+68,z-26);
  if(dPool<14.5){
   h=mix(h,6.15,smooth(13.5,6.5,dPool));
  }
  /* Incise stream notch on East Skerry above sea level */
  const sd=streamDistAt(x,z);
  h-=(1-smooth(2.8,11.0,sd))*smooth(1.2,9.0,h)*1.55;
  h-=mh.grooveDepthM;
  return flattenReserves(h,x,z,9219);
 }

 if(SKEY==='browsewood'){
  /* Vaulted lowland Yonni rainforest basin (+5..+36 m local) incised by sunken Mucus Silver-Highways */
  const rC=Math.hypot(x,z);
  let h=7.4+18.5*smooth(55,340,rC)+8.5*smooth(180,520,z+120)+macro*0.52+1.2*n2(x,z,0.022,9221);
  /* Mucus-sealed emerald vernal lime-pool in the central cathedral hollow at (-8, 22) */
  const dVernal=Math.hypot((x+8)*0.92,(z-22)*1.08);
  if(dVernal<16.5){
   h=mix(h,5.05,smooth(15.5,7.2,dVernal));
  }
  h-=mh.grooveDepthM;
  return flattenReserves(h,x,z,9229);
 }

 if(SKEY==='kelpfront'){
  /* Exposed WNW ocean (-24 m) rising eastward across the kelp-grazing littoral bench (+1.5..+16 m) to +48 m bluffs */
  const shoreX=-42.0+22.0*Math.sin(z*0.014)+16.0*n2(0,z,0.006,9231);
  const u=x-shoreX;
  let h;
  if(u<0){
   h=-24.0*smooth(0,-220,u)-1.35*smooth(0,-16,u);
  }else{
   /* Broad wave-sprayed coquina & wrack grazing bench (u = 0..145 m -> +1.6..+13.5 m), then coastal forest bluff */
   h=1.6+12.0*smooth(0,145,u)+32.0*smooth(135,420,u)+0.85*n2(x,z,0.020,9232);
  }
  /* Perched coquina tide-basin at (18, -62) */
  const dTide=Math.hypot(x-18,z+62);
  if(dTide<12.5){
   h=mix(h,4.35,smooth(11.5,5.5,dTide));
  }
  const sd=streamDistAt(x,z);
  h-=(1-smooth(3.0,12.0,sd))*smooth(1.2,10.0,h)*1.65;
  h+=macro*0.38-mh.grooveDepthM;
  return flattenReserves(h,x,z,9239);
 }

 /* Station 4: cloudslope (+2,150 m Cfb cloud-rainforest gorge & 6-tread shell-cemented tufa cataract) */
 const catZ=5.5*Math.sin((x+40)*0.022);
 const dz=Math.abs(z-catZ);
 const slopeRise=smooth(95,-210,x);
 let h=3.6+44.0*Math.pow(slopeRise,0.92)+22.0*smooth(32,195,dz)+macro*0.58+0.9*n2(x,z,0.024,9241);

 /* 6 stepped shell-tufa cataract bowls along x = -44..+56, |z - catZ| < 24 m */
 if(x>=-48&&x<=62&&dz<28){
  const u=clamp((x+44)/100,0,1);
  const stepIdx=Math.min(5,Math.floor(u*6));
  const levels=[26.2,21.6,17.2,12.8,8.6,4.6];
  const treadY=levels[stepIdx]-0.92;
  const inCat=smooth(25,12,dz)*smooth(-48,-40,x)*smooth(62,52,x);
  h=mix(h,treadY,inCat*0.92);
 }
 /* Calm lower plunge tarn around (76, 0) at water level +2.85 m */
 const dPlunge=Math.hypot((x-76)/24,z/18);
 if(dPlunge<1.25){
  h=mix(h,1.25,smooth(1.20,0.62,dPlunge));
 }
 h-=mh.grooveDepthM;
 return flattenReserves(h,x,z,9249);
}

/* KCOAST natural rock, shingle & coquina-sand coastlines on coastal stations (skerry & kelpfront) */
const COAST_OBJ=(function(){
 if(!SITE.hasSea||typeof KCOAST==='undefined'||typeof KMASK==='undefined')return null;
 const x0=-640,z0=-640,cell=32,nx=40,nz=40;
 const data=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const cx=x0+(i+0.5)*cell,cz=z0+(j+0.5)*cell;
  data[j*nx+i]=bareGround(cx,cz)<SITE.seaLevel?255:0;
 }
 return KCOAST.build({
  id:'matronscoast-'+SKEY,
  level:SITE.seaLevel,
  seed:SITE.seed^0x51c0,
  salt:23,
  sourceCell:32,
  opts:{
   sig:22,
   classSig:88,
   warp:{a0:0,l0:16000,a1:28,l1:340,a2:14,l2:135,a3:6,l3:52,k:[0.6,0.85,1.12,1.08,0.5]},
   fine:{a1:8,l1:80,a2:3,l2:26,k:[0.14,0.5,1.0,1.0,0.16]},
   carry:{full:20,out:84,edge:56,rim:20},
   band:{land:150,water:120,lift:115,mask:42}
  },
  frame:{ox:SITE.px[0]*2000,oz:SITE.px[1]*2000},
  mask:{x0:x0,z0:z0,cell:cell,cellZ:cell,nx:nx,nz:nz,data:data},
  sample:{
   bare:bareGround,
   rock:function(x,z){return clamp(0.42+0.35*SNAIL_PHYS.coquinaMiddenAt(x,z,SITE).cemented01,0,1);},
   wet:function(){return 0.94;},
   temp:function(){return 22;}
  }
 });
})();

function coastGround(x,z){
 const h=bareGround(x,z);
 if(!COAST_OBJ)return h;
 /* Preserve camera pads and reserve plinths cleanly while KCOAST shapes the shoreline */
 const shaped=KCOAST.shape(COAST_OBJ,x,z,h,0);
 if(inCamPad(x,z,4))return Math.max(h,shaped);
 return flattenReserves(shaped,x,z,SITE.seed+55);
}

/* KSTACKS: Cemented biogenic Coquina Conch-Midden banks (all stations) & wave-notched granite skerry stacks / tors */
const STACK_RECS=(function(){
 if(typeof KSTACKS==='undefined')return{middens:[],tors:[]};
 const middens=[],tors=[];
 const midSpecs=SITE.middens||[];
 for(let i=0;i<midSpecs.length;i++){
  const m=midSpecs[i];
  if(inCamPad(m.x,m.z,m.rx*0.6))continue;
  const y0=coastGround(m.x,m.z)-0.85;
  middens.push(KSTACKS.make({
   id:m.id,
   kind:'butte',
   x:m.x,
   z:m.z,
   y0:y0,
   tiers:[
    {h:m.h*0.56,r:m.rx*0.76,e:m.rx/Math.max(6,m.rz),ry:m.yaw,dx:0,dz:0},
    {h:m.h*0.44,r:m.rx*0.48,e:m.rx/Math.max(6,m.rz),ry:m.yaw+0.18,dx:1.2,dz:-0.8}
   ],
   bed:[0.55,1.15],
   lobes:0.22,
   weather:0.52,
   seed:SITE.seed+301+i*17
  }));
 }
 const skSpecs=SITE.skerries||[];
 for(let j=0;j<skSpecs.length;j++){
  const s=skSpecs[j];
  if(inCamPad(s.x,s.z,s.rx*0.6))continue;
  const y0=Math.min(coastGround(s.x,s.z)-1.8,SITE.hasSea?-3.5:coastGround(s.x,s.z)-1.8);
  tors.push(KSTACKS.make({
   id:s.id,
   kind:SITE.hasSea?'fin':'tor',
   x:s.x,
   z:s.z,
   y0:y0,
   H:s.h+(coastGround(s.x,s.z)-y0)*0.45,
   r:s.rx*0.62,
   e:SITE.hasSea?2.4:1.4,
   ry:s.yaw,
   taper:0.32,
   crown:0.78,
   cols:4,
   block:[1.6,2.8],
   seed:SITE.seed+401+j*19
  }));
 }
 return{middens:middens,tors:tors};
})();

const MIDDEN_TALUS=(typeof KRELIEF!=='undefined'&&KRELIEF.talus&&STACK_RECS.middens.length)
 ?KRELIEF.talus({bodies:STACK_RECS.middens,h:1.15,reach:9.5,seed:SITE.seed+601})
 :null;

function rawTerrainH(x,z){
 let h=coastGround(x,z);
 if(MIDDEN_TALUS)h+=MIDDEN_TALUS(x,z);
 return h;
}

// Fast gridded field cache for <= 3-layer KGROUND masks & deterministic O(1) terrainH/waterH queries
const FC=(function(){
 const R=TERR.R*1.12,N=224,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),slope=new Float32Array(nx*nx),rock=new Float32Array(nx*nx);
 const wet=new Float32Array(nx*nx),coq=new Float32Array(nx*nx),muc=new Float32Array(nx*nx);
 const spray=new Float32Array(nx*nx),kelp=new Float32Array(nx*nx);

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  h[k]=rawTerrainH(x,z);
 }
 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step,y=h[k];
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  const slp=Math.hypot(sx,sz);
  slope[k]=slp;
  rock[k]=clamp(smooth(0.24,0.68,slp),0,1);

  const cm=SNAIL_PHYS.coquinaMiddenAt(x,z,SITE);
  const coastShingle=SITE.hasSea?smooth(5.5,0.2,Math.abs(y-SITE.seaLevel))*0.62:0;
  coq[k]=clamp(Math.max(cm.midden01,coastShingle),0,1);

  const mh=SNAIL_PHYS.mucusHighwayAt(x,z,SITE,slp);
  muc[k]=mh.trail01;

  let wy=-1e9;
  if(SKEY==='skerry'){
   wy=Math.hypot(x+68,z-26)<11.2?7.25:(y<SITE.seaLevel+0.05?SITE.seaLevel:-1e9);
  }else if(SKEY==='browsewood'){
   wy=Math.hypot((x+8)*0.92,(z-22)*1.08)<13.2?6.05:-1e9;
  }else if(SKEY==='kelpfront'){
   wy=Math.hypot(x-18,z+62)<9.6?5.25:(y<SITE.seaLevel+0.05?SITE.seaLevel:-1e9);
  }else{
   const catZ=5.5*Math.sin((x+40)*0.022);
   if(x>=-44&&x<=56&&Math.abs(z-catZ)<18.5){
    const u0=clamp((x+44)/100,0,1);
    wy=[26.2,21.6,17.2,12.8,8.6,4.6][Math.min(5,Math.floor(u0*6))];
   }else if(Math.hypot((x-76)/24,z/18)<1.05){
    wy=2.85;
   }
  }
  wet[k]=wy>-1e5?smooth(4.8,-0.2,y-wy):(SITE.hasSea?smooth(6.0,-0.5,y):0.25);
  spray[k]=SITE.hasSea?clamp(smooth(14.0,0.5,y)*(SKEY==='kelpfront'?smooth(140,-85,x):0.75),0,1):0;
  kelp[k]=SKEY==='kelpfront'?SNAIL_PHYS.kelpFrontBalanceAt(x,z,SITE,{spray01:spray[k]}).kelpArrival01:0;
 }
 return{R:R,a:{h:h,slope:slope,rock:rock,wet:wet,coq:coq,muc:muc,spray:spray,kelp:kelp},at:at};
})();

function terrainH(x,z){
 if(Math.abs(x)<=FC.R-4&&Math.abs(z)<=FC.R-4)return FC.at(FC.a.h,x,z);
 return rawTerrainH(x,z);
}

function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.12)return terrainH(x,z);
 const rim=terrainH(x*(TERR.R/d),z*(TERR.R/d));
 if(SITE.hasSea&&x<-120){
  return Math.min(-4.0,rim-18.0*smooth(TERR.R*1.12,3600,d));
 }
 const inlandBoost=SKEY==='cloudslope'?95.0:48.0;
 const far=inlandBoost*smooth(TERR.R*1.12,5200,d)*smooth(-260,320,x)+24.0*n2(x,z,0.0005,9280)+9.0*n2(x,z,0.0016,9281);
 return rim+far;
}

function waterH(x,z){
 if(SKEY==='skerry'){
  if(Math.hypot(x+68,z-26)<11.2)return 7.25;
  if(terrainH(x,z)<SITE.seaLevel+0.05)return SITE.seaLevel;
  return -1e9;
 }
 if(SKEY==='browsewood'){
  if(Math.hypot((x+8)*0.92,(z-22)*1.08)<13.2)return 6.05;
  return -1e9;
 }
 if(SKEY==='kelpfront'){
  if(Math.hypot(x-18,z+62)<9.6)return 5.25;
  if(terrainH(x,z)<SITE.seaLevel+0.05)return SITE.seaLevel;
  return -1e9;
 }
 /* Station 4: cloudslope 6-step shell-tufa cataract + plunge tarn */
 const catZ=5.5*Math.sin((x+40)*0.022);
 if(x>=-44&&x<=56&&Math.abs(z-catZ)<18.5){
  const u=clamp((x+44)/100,0,1);
  const levels=[26.2,21.6,17.2,12.8,8.6,4.6];
  return levels[Math.min(5,Math.floor(u*6))];
 }
 if(Math.hypot((x-76)/24,z/18)<1.05)return 2.85;
 return -1e9;
}

const FIELD={
 slope:(x,z)=>FC.at(FC.a.slope,x,z),
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 coquina:(x,z)=>FC.at(FC.a.coq,x,z),
 mucus:(x,z)=>FC.at(FC.a.muc,x,z),
 spray:(x,z)=>FC.at(FC.a.spray,x,z),
 kelp:(x,z)=>FC.at(FC.a.kelp,x,z),
 elevASL:(x,z)=>SITE.baseElevM+terrainH(x,z),
 granite:(x,z)=>FC.at(FC.a.rock,x,z),
 coast:(x,z)=>SITE.hasSea?smooth(18.0,0.0,terrainH(x,z)):0,
 ravine:(x,z)=>SKEY==='cloudslope'?smooth(36.0,6.0,Math.abs(z)):0,
 path:(x,z)=>FC.at(FC.a.muc,x,z),
 cobble:(x,z)=>FC.at(FC.a.coq,x,z),
 tor:(x,z)=>FC.at(FC.a.rock,x,z)*0.5
};

const SPACE=KSPACE.create({cell:12});
const HAZARDS=[];

BIO.init({
 THREE:THREE,
 scene:scene,
 camera:camera,
 renderer:renderer,
 seed:SITE.seed,
 terrainH:terrainH,
 waterH:waterH,
 fields:FIELD,
 mask:(x,z)=>SITE.hasSea?smooth(0.15,1.25,terrainH(x,z)-SITE.seaLevel):1.0,
 center:[0,0],
 radius:TERR.R
});
