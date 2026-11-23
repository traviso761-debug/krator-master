// ================================================================= HOST — stage: Station 1, The Breached Throat (PLAN.md sections 5, 6.3a, 7)
// South-East Rift Graben of the Throne (+1,380 m, 1.18 atm, +26 degC ambient, 920 mm rain):
//   the graben       a fault-bounded basalt trough (~290 m across, 52 m fault scarps NE and SW) along strike 0.34 rad
//   the throat pit   a collapsed skylight at (0, 0) dropping 21 m into a live 365-545 degC dry-acid volcanic conduit
//   the fumaroles    four satellite hornitos and fissure mouths (ticking choked pipe, white-rime rotting vent, bismuth seam, crust hornito)
//   the lava bench   a 42-day pahoehoe sill roof at (76, -22) buoyed over hot gas by basal foam-reef rafts
//   the vitriol pots two pH 1.4-1.8 hot sulfuric pools where surface rainwater meets rising SO2/HF gas
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-2&&y<=ry+r.h+5;}
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'throat',SITE=RHEO_SITES[SKEY];
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xcfc8be);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00032);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.4,16000);
scene.add(new THREE.HemisphereLight(0xe4ddd2,0x5a4c42,.78));
const sun=new THREE.DirectionalLight(0xfff2de,1.32);sun.position.set(-780,1150,-520);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdce2ea,.18);fill.position.set(640,340,760);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:900};
const SNOW_LINE=[1e5,1e5];
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
const PIT=SITE.pit,BENCH=SITE.crustBench,GRAB=SITE.graben,VENTS=SITE.vents,SPRINGS=SITE.springs;
const STRIKE_C=Math.cos(GRAB.strike),STRIKE_S=Math.sin(GRAB.strike);

// cross-strike coordinate u (perpendicular to graben axis) and along-strike v
function grabenUV(x,z){return[x*STRIKE_C-z*STRIKE_S,x*STRIKE_S+z*STRIKE_C];}

function baseFloorY(x,z){
 const uv=grabenUV(x,z),u=uv[0],v=uv[1];
 const wob=12*n2(x,z,.0035,14)+4*n2(x,z,.012,15);
 const au=Math.abs(u+wob);
 // graben floor ~0 m locally (= 1,380 m ASL), stepping up 52 m across the twin normal-fault scarps
 const scarp=GRAB.wallH*smooth(GRAB.halfW-18,GRAB.halfW+34,au)+14*smooth(GRAB.halfW+60,GRAB.halfW+260,au);
 // gentle Throne-flank slope down toward the SE (+v)
 const tilt=-0.016*v+2.4*n2(x,z,.003,18)+0.75*n2(x,z,.016,19)+0.22*n2(x,z,.06,20);
 return scarp+tilt;
}

function land(x,z){
 let h=baseFloorY(x,z);
 // blistered pahoehoe lava-crust bench on the east floor
 {const dx=(x-BENCH.x)/BENCH.rx,dz=(z-BENCH.z)/BENCH.rz,d=Math.hypot(dx,dz)*(1+.1*n2(x,z,.03,24));
  if(d<1.35){const pad=smooth(1.32,.86,d);
   const dome=1.25*pad+.32*pad*Math.sin(x*.22+n2(x,z,.05,25)*4)*Math.cos(z*.24+n2(x,z,.05,26)*4);
   h+=dome;}}
 // satellite fumarole hornitos (vents 1..4): low sinter-scoria cones with a dark hot throat depression
 for(let i=1;i<VENTS.length;i++){
  const V=VENTS[i],r0=i===3?11:8.5,d=Math.hypot(x-V.x,z-V.z)/(r0*(1+.12*n2(x,z,.05,30+i)));
  if(d<1.8){
   const cone=2.6*smooth(1.75,.32,d);
   const mouth=3.9*smooth(.36,.06,d);
   h+=cone-mouth;
  }
 }
 // fault-trace fissure groove running through south-fissure and main throat
 {const uv=grabenUV(x-6,z-10),groove=Math.abs(uv[0]+4*n2(x,z,.02,41));
  if(groove<7.5&&Math.abs(uv[1])<115&&Math.hypot(x,z)>PIT.r*1.05){
   h-=1.35*smooth(7.2,1.2,groove)*smooth(115,65,Math.abs(uv[1]));
  }}
 // hot vitriol spring basins
 for(let i=0;i<SPRINGS.length;i++){
  const S=SPRINGS[i],d=Math.hypot(x-S.x,z-S.z)/(S.r*(1+.08*n2(x,z,.08,50+i)));
  if(d<1.65){
   const rim=.42*smooth(1.62,1.08,d)*smooth(.86,1.08,d);
   const bowl=1.55*smooth(1.06,.35,d);
   h+=rim-bowl;
  }
 }
 // THE BREACHED THROAT at (0, 0): raised tuff-sinter collar rim (+3.6 m), stepped inner bench, and steep 21 m conduit shaft
 {const ang=Math.atan2(z,x),asym=1+.08*Math.cos(3*ang+.4)+.05*n2(x,z,.06,61);
  const r=Math.hypot(x,z)/asym;
  if(r<PIT.r*1.65){
   const rim=PIT.rim*smooth(PIT.r*1.62,PIT.r*.96,r)*smooth(PIT.r*.58,PIT.r*.95,r);
   h+=rim;
   if(r<PIT.r){
    // outer bench (r = 12..26 m -> y = -4.5..+2.8 m), inner dry-acid throat wall (r = 4.6..12 m -> y = -20.6..-4.5 m)
    const shelf=mix(-4.8,baseFloorY(x,z)+PIT.rim*.78,smooth(PIT.throatR*1.55,PIT.r,r));
    const shaft=mix(PIT.floor+.4*n2(x,z,.14,62),-4.8,smooth(PIT.throatR*.52,PIT.throatR*1.55,r));
    const flute=.45*Math.sin(5*ang+r*.25)*smooth(PIT.r*.9,PIT.throatR*.7,r)*smooth(PIT.throatR*.4,PIT.throatR*.8,r);
    h=r<PIT.throatR*1.55?shaft+flute:shelf+flute*.4;
   }
  }
 }
 return h;
}

const SPRING_LEVELS=SPRINGS.map(S=>baseFloorY(S.x,S.z)-.22);
function water(x,z){
 for(let i=0;i<SPRINGS.length;i++){
  const S=SPRINGS[i];
  if(Math.hypot(x-S.x,z-S.z)<S.r*1.04)return SPRING_LEVELS[i];
 }
 return -1e9;
}

const L={land,water,VENTS,SPRINGS,PIT,BENCH,farBase:0,
 spine:[[0,0],[BENCH.x,BENCH.z],[-120,-80],[120,90]].concat(VENTS.slice(1).map(v=>[v.x,v.z]))};
function landH(x,z){
 const r=Math.hypot(x,z);
 if(r<=TERR.R*1.08)return L.land(x,z);
 // SE Throne flank continuing outward: rises NW (-v) toward the Throne summit cone, falls SE (+v) toward the lowlands
 const uv=grabenUV(x,z),u=uv[0],v=uv[1];
 const scarp=GRAB.wallH*smooth(GRAB.halfW-18,GRAB.halfW+40,Math.abs(u));
 const flank=-0.032*v+0.0000045*Math.max(0,-v)*Math.max(0,-v)+48*n2(x,z,.00055,71)+16*n2(x,z,.0022,72);
 return mix(L.land(x,z),scarp+flank,smooth(TERR.R*.98,TERR.R*1.35,r));
}
function floor0(){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=L.land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- geochemical fields (pH, water activity, 3D conduit temperature)
let HEAT_AT=(x,z)=>SITE.soil;

// rock/gas temperature at 3D point (x, y, z): surface follows KTHERM; inside the breached pit & fumarole mouths it climbs into the 180-545 degC window
function TEMP3_AT(x,y,z){
 let t=HEAT_AT(x,z);
 const rp=Math.hypot(x-PIT.x,z-PIT.z);
 if(rp<PIT.r*1.08){
  const depthK=smooth(-2.2,-19.8,y)*smooth(PIT.r*1.05,PIT.throatR*.7,rp);
  const wallK=smooth(-1.5,-7.5,y)*smooth(PIT.r*.95,PIT.throatR*1.35,rp);
  t=Math.max(t,mix(145,PIT.deepT,depthK),mix(130,PIT.throatT,wallK));
 }
 for(let i=1;i<VENTS.length;i++){
  const V=VENTS[i],d=Math.hypot(x-V.x,z-V.z);
  if(d<8.5){
   const mK=smooth(6.2,1.1,d)*smooth(baseFloorY(V.x,V.z)+1.8,baseFloorY(V.x,V.z)-1.8,y);
   t=Math.max(t,mix(95,V.T,mK));
  }
 }
 return t;
}

function PH_AT(x,z){
 let pH=5.4+.6*smooth(GRAB.halfW-10,GRAB.halfW+45,Math.abs(grabenUV(x,z)[0]));
 for(let i=0;i<VENTS.length;i++){
  const V=VENTS[i],d=Math.hypot(x-V.x,z-V.z);
  if(d<V.reach*1.25)pH=Math.min(pH,mix(1.05,5.4,smooth(3.5,V.reach*1.15,d)));
 }
 for(let i=0;i<SPRINGS.length;i++){
  const S=SPRINGS[i],d=Math.hypot(x-S.x,z-S.z);
  if(d<S.r*2.8)pH=Math.min(pH,mix(S.pH,5.2,smooth(S.r*.9,S.r*2.8,d)));
 }
 return pH;
}

function AW_AT(x,y,z){
 if(waterH(x,z)>y-.12)return .98;
 const t=TEMP3_AT(x,y,z);
 if(t>=180)return clamp(.03+.08*smooth(320,180,t),0.02,0.12);
 const up=smooth(GRAB.halfW-10,GRAB.halfW+45,Math.abs(grabenUV(x,z)[0]));
 return clamp(mix(.44,.68,up)*smooth(175,85,t)+.04,0.04,0.95);
}

// nearest active rheolith throat distance & temperature for RHEO_PHYS.ranjViability and byproductAt
function NEAREST_VENT(x,z){
 let bestD=1e9,bestV=VENTS[0];
 for(let i=0;i<VENTS.length;i++){
  const V=VENTS[i],d=Math.hypot(x-V.x,z-V.z);
  if(d<bestD){bestD=d;bestV=V;}
 }
 return{d:bestD,vent:bestV};
}

// ---------------------------------------------------------------- the climate fields (core/biome/README.md + throne kin fields)
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),inW=w>-1e8&&w>=h-.05?1:0;
 const uv=grabenUV(x,z),up=smooth(GRAB.halfW-12,GRAB.halfW+42,Math.abs(uv[0]));
 const rock=clamp(Math.max(smooth(.38,.74,slope),up*.45),0,1);
 const nv=NEAREST_VENT(x,z),vent=smooth(28,4,nv.d),plume=smooth(82,16,nv.d)*(1-vent*.65);
 const rp=Math.hypot(x-PIT.x,z-PIT.z),skylight=smooth(PIT.r*1.25,PIT.throatR*1.1,rp);
 const benchD=Math.hypot((x-BENCH.x)/BENCH.rx,(z-BENCH.z)/BENCH.rz),crust=smooth(1.18,.78,benchD);
 const ph=PH_AT(x,z),acid=clamp((4.8-ph)/3.6,0,1);
 const cinder=clamp((1-up)*(1-crust)*(1-skylight)*(.65+.35*fbm(x*.012,z*.012,9.1,2)),0,1);
 const wet=clamp(inW?1:(.16+.34*up+.28*plume-.25*vent-.18*crust),0,1);
 return{
  wet,flow:0,upland:up,canyon:skylight,rim:smooth(PIT.r*1.45,PIT.r*.95,rp)*smooth(PIT.r*.65,PIT.r*.95,rp),
  rock,dune:0,oasis:0,slope,abyss:0,salt:clamp(acid*(1-inW)*.65,0,1),cold:0,geo:clamp(vent+.55*plume,0,1),
  barren:clamp(1-.65*up+.5*vent,0,1),fog:plume*.5,mist:plume*.4,flat:1-rock,
  acid,vent,plume,cinder,skylight,ash:cinder*.7,crust
 };
}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat','acid','vent','plume','cinder','skylight','ash','crust'];
const FC=(function(){const N=320,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
FIELD.geo=(x,z)=>clamp((HEAT_AT(x,z)-SITE.soil)/120,0,1);

// ---------------------------------------------------------------- the host binding
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.08)return 0;return d<.4?(d-.08)/.32:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({tags:'rheolith',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5107,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:180,mid:460,far:1900,floor:[130,340]},
 windows:{water:WBOX}});
BIO.setSun([-780,1150,-520]);
