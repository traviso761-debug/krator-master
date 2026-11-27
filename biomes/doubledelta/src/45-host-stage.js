// ================================================================= HOST — stage: Double Delta stations (PLAN.md §4, §8)
// Renderer, lighting, deterministic sedimentary delta & Ria Sound bluff landforms from DDELTA_SITES (41), KCOAST tidal shoreline
// shaping, estuarine geochemical fields (salinity PSU, silica mg/L, scour amber/bitumen/mire), and BIO.init({tags:'doubledelta'}).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];
function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const ry=r.y==null?0:r.y,dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-2&&y<=ry+r.h+5;}
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'bioherm';
const SITE=DDELTA_SITES[SKEY]||DDELTA_SITES.bioherm;
const STATION_REGION=SITE.name+' (The Great Double Delta)';

const renderer=new THREE.WebGLRenderer({antialias:!(typeof navigator!=='undefined'&&navigator.webdriver)});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';
 BIO.LOD.minTris=1500;
 BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);

/* 1.60 atm Am tropical monsoon air: warm hazy estuarine light driven by ATMOS.skyBiome (89) */
const scene=new THREE.Scene();
const HAZE=new THREE.Color(0xd6e0dc);
scene.fog=new THREE.FogExp2(HAZE.getHex(),0.00017);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xd4e4ee,0x6e6a56,0.8));
const sun=new THREE.DirectionalLight(0xffffff,1.25);
sun.position.set(-720,1280,-540);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xe2e8ee,0.22);
fill.position.set(680,320,840);
scene.add(fill);

// ---------------------------------------------------------------- landform & hydrography
const TERR={R:2600};
const SNOW_LINE=[9000,9500];
function segFrame(A,B){
 const dx=B[0]-A[0],dz=B[1]-A[1],L0=Math.hypot(dx,dz)||1,ux=dx/L0,uz=dz/L0;
 return{A,B,L:L0,ux,uz,
  at:(x,z)=>{const px=x-A[0],pz=z-A[1];return{s:px*ux+pz*uz,a:px*uz-pz*ux};},
  p:(s,a)=>[A[0]+ux*s+uz*a,A[1]+uz*s-ux*a]};
}
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-0.5;

const L=(function(){
 const S=SITE;

 if(SKEY==='bioherm'){
  /* Western open estuarine bay (x < -1280): natural meandering tidal front, zero rocky islands */
  const bayShoreX=z=>-1320+190*Math.sin(z*0.0014+0.6)+95*n2(0,z,0.0022,11);
  const CH=S.channels.map((c,idx)=>{
   const F=segFrame(c.a,c.b);
   const off=s=>c.wigA*Math.sin(s*c.wigK+idx*1.7)*smooth(0,220,s)*smooth(F.L,F.L-220,s);
   let mouthS=F.L;
   for(let s=0;s<=F.L;s+=8){
    const p=F.p(s,off(s));
    if(p[0]<=bayShoreX(p[1])){mouthS=s;break;}
   }
   const lv=s=>lerp(1.45,0.0,clamp(s/Math.max(1,mouthS),0,1));
   return Object.assign({F,off,lv,mouthS},c);
  });
  const WR=S.wrackLines.map((w,idx)=>{
   const F=segFrame(w.a,w.b);
   const off=s=>55*Math.sin(s*0.0034+idx*2.1);
   return Object.assign({F,off},w);
  });
  function chanDist(x,z){
   let best=1e9;
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s<-80||q.s>c.mouthS+40)continue;
    const sc=clamp(q.s,0,c.mouthS);
    const d=Math.abs(q.a-c.off(sc))-c.w*0.5;
    if(d<best)best=d;
   }
   return best;
  }
  function land(x,z){
   const sx=bayShoreX(z),bayD=x-sx;
   /* Gentle alluvial gradient rising eastward from 0 m tidal front to +6.5 m inner silt plain */
   let h=bayD<0
    ?-0.35-5.6*smooth(0,-1150,bayD)+0.55*n2(x,z,0.0035,12)
    :0.35+4.8*smooth(0,3400,bayD)+1.35*n2(x,z,0.0016,13)+0.45*n2(x,z,0.012,14);
   /* Biogenic spicule-bound sponge bioherm mounds (1-6 m gentle sedimentary hummocks, NOT rock islands) */
   for(const m of S.biohermMounds){
    const d=Math.hypot(x-m.x,z-m.z);
    if(d<m.r*1.65){
     const dome=smooth(m.r*1.65,m.r*0.22,d);
     const terrace=0.22*Math.sin(d*0.18)*dome;
     h+=m.lift*dome+terrace+0.4*dome*n2(x,z,0.035,15);
    }
   }
   /* Braided distributary channels terminating at bayShoreX(z) with natural silt/shell levees on landward banks */
   const onLand=smooth(-35,85,bayD);
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s<-120||q.s>c.mouthS+140)continue;
    const sc=clamp(q.s,0,c.mouthS),aa=Math.abs(q.a-c.off(sc)),hw=c.w*0.5;
    const endW=smooth(-120,40,q.s)*smooth(c.mouthS+140,c.mouthS-30,q.s);
    if(aa<hw+95){
     const lv=c.lv(sc);
     /* Natural alluvial levee crest +1.4 m outside channel bank (tapers to zero at bayShoreX mouth) */
     const levee=1.45*smooth(hw+95,hw+18,aa)*smooth(hw-4,hw+16,aa);
     h+=levee*endW*onLand;
     const cut=smooth(hw+18,hw-8,aa)*endW;
     const bed=lv-c.depth*(0.35+0.65*smooth(hw,hw*0.2,aa));
     h=mix(h,Math.min(h,bed),cut);
    }
   }
   /* Slackwater peat-mat ponds with slightly domed floating central peat rafts */
   for(const p of S.ponds){
    const d=Math.hypot(x-p.x,z-p.z);
    if(d<p.r*1.28){
     const basin=p.level-1.9*smooth(p.r*1.12,p.r*0.62,d);
     const raft=d<p.r*0.52?(p.level+0.52*smooth(p.r*0.52,p.r*0.14,d)+0.15*n2(x,z,0.04,16)):basin;
     h=mix(h,raft,smooth(p.r*1.28,p.r*0.88,d));
    }
   }
   return h;
  }
  function water(x,z){
   const sx=bayShoreX(z);
   if(x<sx+140&&land(x,z)<0.02)return 0.0;
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s>=-30&&q.s<=c.mouthS+24){
     const sc=clamp(q.s,0,c.mouthS),aa=Math.abs(q.a-c.off(sc));
     if(aa<c.w*0.5+6&&land(x,z)<c.lv(sc)+0.05)return Math.max(0.0,c.lv(sc));
    }
   }
   for(const p of S.ponds){
    if(Math.hypot(x-p.x,z-p.z)<p.r*1.04&&land(x,z)<p.level)return p.level;
   }
   return -1e9;
  }
  const LAG=(x,z)=>{
   const sx=bayShoreX(z),nearBay=smooth(650,-120,x-sx);
   let nearLevee=0;
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s>=0&&q.s<=c.mouthS){
     const aa=Math.abs(q.a-c.off(q.s))-c.w*0.5;
     nearLevee=Math.max(nearLevee,smooth(55,8,Math.abs(aa-16)));
    }
   }
   return clamp(0.65*nearBay+0.55*nearLevee+0.2*n2(x,z,0.008,17),0,1);
  };
  const PEAT=(x,z)=>{
   let a=0;
   for(const p of S.ponds)a=Math.max(a,smooth(p.r*1.35,p.r*0.35,Math.hypot(x-p.x,z-p.z)));
   return clamp(a+0.35*smooth(-200,1100,x-bayShoreX(z))*(1-LAG(x,z)),0,1);
  };
  const WRACK=(x,z)=>{
   let a=0;
   for(const w of WR){
    const q=w.F.at(x,z);
    if(q.s>=0&&q.s<=w.F.L)a=Math.max(a,smooth(w.w,w.w*0.25,Math.abs(q.a-w.off(q.s))));
   }
   return a;
  };
  return{
   land,water,CH,WR,bayShoreX,chanDist,LAG,PEAT,WRACK,
   AMBER:()=>0,BITUMEN:()=>0,BLUECLAY:()=>0,MIRE:()=>0,BLUFF:()=>0,
   farBase:0.2,
   spine:[[0,0],[-160,-140],[340,210],[-690,-360],[520,-640],[-950,0]]
  };
 }

 if(SKEY==='bitumen'){
  const SC=S.scours.map((c,idx)=>{
   const F=segFrame(c.a,c.b);
   const off=s=>c.wigA*Math.sin(s*c.wigK+idx*1.9)*smooth(0,180,s)*smooth(F.L,F.L-180,s);
   const lv=s=>lerp(0.75,-0.15,clamp(s/F.L,0,1));
   return Object.assign({F,off,lv},c);
  });
  function chanDist(x,z){
   let best=1e9;
   for(const c of SC){
    const q=c.F.at(x,z);
    if(q.s<-60||q.s>c.F.L+60)continue;
    const sc=clamp(q.s,0,c.F.L);
    const d=Math.abs(q.a-c.off(sc))-c.w*0.5;
    if(d<best)best=d;
   }
   return best;
  }
  function land(x,z){
   /* Compaction-faulted peat & lignite marsh plain (+2.2 to +7.6 m) */
   let h=3.6+1.8*smooth(-2200,2200,x)+1.55*n2(x,z,0.0014,31)+0.55*n2(x,z,0.009,32);
   /* Incised V-cut tsunami backwash scour-gullies exposing slate-blue glauconite clay */
   for(const c of SC){
    const q=c.F.at(x,z);
    if(q.s<-90||q.s>c.F.L+90)continue;
    const sc=clamp(q.s,0,c.F.L),aa=Math.abs(q.a-c.off(sc)),hw=c.w*0.5;
    const endW=smooth(-90,50,q.s)*smooth(c.F.L+90,c.F.L-50,q.s);
    if(aa<hw+68){
     const lv=c.lv(sc);
     /* Steep lignite ledge scarp dropping into blue-clay eddy bed */
     const bench=aa<hw+22&&aa>=hw?h-1.4*smooth(hw+22,hw,aa):h;
     const bed=lv-c.depth*(0.28+0.72*smooth(hw,hw*0.18,aa))+0.35*n2(x,z,0.04,33);
     h=mix(bench,bed,smooth(hw+8,hw-6,aa)*endW);
    }
   }
   /* Amber eddy gravel/clay bars slightly proud of gully water (+0.15..+0.95 m) so amber nodules gleam at water's edge */
   for(const a of S.amberPockets){
    const d=Math.hypot(x-a.x,z-a.z);
    if(d<a.r*1.25){
     const barH=0.55+0.45*smooth(a.r,0,d)+0.18*n2(x,z,0.06,34);
     h=mix(h,barH,0.78*smooth(a.r*1.25,a.r*0.35,d));
    }
   }
   /* Natural bitumen/asphalt seeps: raised asphaltic collar rim around glossy flat tar pool */
   for(const ts of S.tarSeeps){
    const d=Math.hypot(x-ts.x,z-ts.z);
    if(d<ts.r*1.85){
     const baseH=3.6+1.8*smooth(-2200,2200,ts.x)+1.55*n2(ts.x,ts.z,0.0014,31);
     const collar=ts.rim*Math.exp(-Math.pow((d-ts.r*1.08)/(ts.r*0.28),2));
     const poolFloor=baseH-0.55;
     const profH=d<ts.r*0.96?poolFloor:baseH+collar;
     h=mix(h,profH,smooth(ts.r*1.85,ts.r*1.12,d));
     ts.level=+(baseH+0.12).toFixed(2);
    }
   }
   return h;
  }
  /* Prime tar-seep levels once deterministically */
  for(const ts of S.tarSeeps)land(ts.x,ts.z);
  function water(x,z){
   for(const ts of S.tarSeeps){
    if(Math.hypot(x-ts.x,z-ts.z)<ts.r*1.02)return ts.level;
   }
   for(const c of SC){
    const q=c.F.at(x,z);
    if(q.s>=0&&q.s<=c.F.L){
     const aa=Math.abs(q.a-c.off(q.s));
     if(aa<c.w*0.36&&land(x,z)<c.lv(q.s))return c.lv(q.s);
    }
   }
   return -1e9;
  }
  const BLUECLAY=(x,z)=>{
   let a=0;
   for(const c of SC){
    const q=c.F.at(x,z);
    if(q.s>=-20&&q.s<=c.F.L+20)a=Math.max(a,smooth(c.w*0.95,c.w*0.32,Math.abs(q.a-c.off(clamp(q.s,0,c.F.L)))));
   }
   for(const p of S.amberPockets)a=Math.max(a,smooth(p.r*1.35,p.r*0.4,Math.hypot(x-p.x,z-p.z)));
   return clamp(a,0,1);
  };
  const AMBER=(x,z)=>{
   let a=0;
   for(const p of S.amberPockets)a=Math.max(a,smooth(p.r*1.15,p.r*0.25,Math.hypot(x-p.x,z-p.z)));
   const sc=DDELTA_PHYS.scourExpose({elevM:land(x,z),backwashSlope:0.09*BLUECLAY(x,z),yearsSinceMega:14,coalByte:228,clayByte:255,oilByte:146,amberByte:120});
   return clamp(Math.max(a*0.92,sc.amberLag01),0,1);
  };
  const BITUMEN=(x,z)=>{
   let a=0;
   for(const ts of S.tarSeeps)a=Math.max(a,smooth(ts.r*1.95,ts.r*0.92,Math.hypot(x-ts.x,z-ts.z)));
   return clamp(a,0,1);
  };
  const MIRE=(x,z)=>{
   let a=0;
   for(const m of S.mires)a=Math.max(a,smooth(m.r*1.2,m.r*0.3,Math.hypot(x-m.x,z-m.z)));
   return a;
  };
  return{
   land,water,SC,chanDist,BLUECLAY,AMBER,BITUMEN,MIRE,
   LAG:(x,z)=>0.25*BLUECLAY(x,z),
   PEAT:(x,z)=>clamp((1-BLUECLAY(x,z))*(1-BITUMEN(x,z)),0,1),
   WRACK:(x,z)=>0.35*BLUECLAY(x,z),
   BLUFF:()=>0,
   farBase:2.2,
   spine:[[0,0],[-120,-180],[-290,-20],[310,140],[420,-230],[-540,360]]
  };
 }

 if(SKEY==='throat'){
  const soundShoreX=z=>-1480+140*Math.sin(z*0.0016)+65*n2(0,z,0.0022,50);
  const CH=S.channels.map((c,idx)=>{
   const F=segFrame(c.a,c.b);
   const off=s=>c.wigA*Math.sin(s*c.wigK+idx*1.5)*smooth(0,200,s)*smooth(F.L,F.L-200,s);
   let mouthS=F.L;
   for(let s=0;s<=F.L;s+=8){
    const p=F.p(s,off(s));
    if(p[0]<=soundShoreX(p[1])){mouthS=s;break;}
   }
   const lv=s=>lerp(1.2,0.0,clamp(s/Math.max(1,mouthS),0,1));
   return Object.assign({F,off,lv,mouthS},c);
  });
  /* Bluff foot line curves organically along x ~ +240 m, indented by the southern Riwa-Wata throat water-gap (z > 320) */
  const bluffFootX=z=>S.bluffX0+110*Math.sin(z*0.0013-0.4)+75*n2(200,z,0.0025,51)+520*smooth(220,540,z)*smooth(1080,680,z);
  function chanDist(x,z){
   let best=1e9;
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s<-80||q.s>c.mouthS+40)continue;
    const sc=clamp(q.s,0,c.mouthS);
    const d=Math.abs(q.a-c.off(sc))-c.w*0.5;
    if(d<best)best=d;
   }
   return best;
  }
  function land(x,z){
   const fx=bluffFootX(z),u=x-fx,sx=soundShoreX(z);
   /* Western delta throat plain (u < 0): flat sponge-and-reed bars (+0.4..+6.2 m) and open estuarine sound mouth (x < sx) */
   let h=x<sx
    ?-0.4-5.2*smooth(sx,sx-1020,x)+0.45*n2(x,z,0.003,52)
    :1.4+3.6*smooth(-1450,200,x)+1.2*n2(x,z,0.0018,53)+0.35*n2(x,z,0.015,54);
   /* Eastern Ria Sound carbonate-shelf & loess bluff (u > 0):
      1. Steep wave-cut limestone riser (u = 0..190) up to +41.3 m lower slipway bench
      2. Upper limestone-to-loess scarp (u = 360..760) rising to +78..+142 m safe bluff plateau */
   if(u>-40){
    const step1=41.3*smooth(-25,185,u);
    const step2=(52.0+46.0*smooth(760,2100,u)+9.5*n2(x,z,0.0012,55))*smooth(340,760,u);
    const cliffRough=2.4*smooth(0,60,u)*smooth(220,140,u)*n2(x,z,0.024,56)+2.8*smooth(360,480,u)*smooth(780,640,u)*n2(x,z,0.02,57);
    let bluffH=1.8+step1+step2+cliffRough;
    /* Lower +41.3 m stone slipway bench flattened around S.slipwayBench */
    const db=Math.hypot(x-S.slipwayBench.x,z-S.slipwayBench.z);
    if(db<S.slipwayBench.r*1.2)bluffH=mix(bluffH,S.slipwayBench.elevM+0.4*n2(x,z,0.02,58),0.82*smooth(S.slipwayBench.r*1.2,S.slipwayBench.r*0.45,db));
    /* Safe +65..+140 m Ria Sound permanent settlement reserve gently terraced around S.settlementReserve (y ~ +92..+106 m) */
    const dr=Math.hypot(x-S.settlementReserve.x,z-S.settlementReserve.z);
    if(dr<S.settlementReserve.r*1.15){
     const padY=96.0+6.0*smooth(-S.settlementReserve.r,S.settlementReserve.r,x-S.settlementReserve.x)+0.6*n2(x,z,0.01,59);
     bluffH=mix(bluffH,padY,0.75*smooth(S.settlementReserve.r*1.15,S.settlementReserve.r*0.5,dr));
    }
    h=Math.max(h,bluffH);
   }
   /* Throat distributary channels exiting westward beneath the bluff and terminating cleanly at soundShoreX(z) */
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s<-100||q.s>c.mouthS+140)continue;
    const sc=clamp(q.s,0,c.mouthS),aa=Math.abs(q.a-c.off(sc)),hw=c.w*0.5;
    if(aa<hw+95){
     const lv=c.lv(sc);
     const cut=smooth(hw+28,hw-8,aa)*smooth(-100,40,q.s)*smooth(c.mouthS+140,c.mouthS-30,q.s);
     const bed=lv-c.depth*(0.32+0.68*smooth(hw,hw*0.2,aa));
     h=mix(h,Math.min(h,bed),cut);
    }
   }
   return h;
  }
  function water(x,z){
   const sx=soundShoreX(z);
   if(x<sx+120&&land(x,z)<0.02)return 0.0;
   for(const c of CH){
    const q=c.F.at(x,z);
    if(q.s>=-30&&q.s<=c.mouthS+24){
     const sc=clamp(q.s,0,c.mouthS),aa=Math.abs(q.a-c.off(sc));
     if(aa<c.w*0.5+6&&land(x,z)<c.lv(sc)+0.05)return Math.max(0.0,c.lv(sc));
    }
   }
   return -1e9;
  }
  const BLUFF=(x,z)=>smooth(-20,160,x-bluffFootX(z));
  return{
   land,water,CH,bluffFootX,soundShoreX,chanDist,BLUFF,
   LAG:(x,z)=>clamp(0.5*smooth(60,-10,Math.abs(x-bluffFootX(z)))+0.35*smooth(-1200,-1600,x),0,1),
   PEAT:(x,z)=>clamp((1-BLUFF(x,z))*0.55,0,1),
   WRACK:(x,z)=>smooth(45,6,Math.abs(x-bluffFootX(z)+22))*(land(x,z)<6?1:0),
   AMBER:()=>0,BITUMEN:()=>0,BLUECLAY:()=>0,MIRE:()=>0,
   farBase:1.2,
   spine:[[0,0],[460,-120],[1180,-160],[-620,-180],[-1150,120]]
  };
 }

 throw new Error('doubledelta: unknown station '+SKEY);
})();

/* KCOAST natural shoreline field on the open tidal water body (bioherm & throat) */
const COAST_FIELD=(function(){
 if(typeof KCOAST==='undefined'||SKEY==='bitumen')return null;
 const cell=32,R=TERR.R*1.1,nx=Math.round(R*2/cell),nz=nx,data=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const x=-R+(i+0.5)*cell,z=-R+(j+0.5)*cell;
  if(L.water(x,z)>-1e8&&L.land(x,z)<=0.08)data[j*nx+i]=255;
 }
 try{
  return KCOAST.build({
   id:'ddelta-'+SKEY,level:0,seed:SITE.seed,salt:17,sourceCell:400,
   mask:{x0:-R,z0:-R,cell,cellZ:cell,nx,nz,data},
   sample:{
    bare:(x,z)=>L.land(x,z),
    rock:(x,z)=>L.BLUFF(x,z)>0.35?0.82:0.04,
    wet:()=>0.88,
    temp:()=>SITE.temp.mean,
    chan:(x,z)=>L.chanDist(x,z),
    keep:(x,z)=>L.BLUFF(x,z)>0.5?1:0
   }
  });
 }catch(e){return null;}
})();

function landH(x,z){return L.land(x,z);}
function floor0(){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){
 if(x===_tm.x&&z===_tm.z)return _tm.h;
 const h=L.land(x,z);
 _tm.x=x;_tm.z=z;_tm.h=h;
 return h;
}
function waterH(x,z){return L.water(x,z);}

/* Geochemical & tsunami samplers queried by placement (60) and inspector/asserts (99) */
const TRIM_INFO=DDELTA_PHYS.trimlineAt({oceanDistKm:SITE.oceanDistKm,wnwExposure01:SITE.wnwExposure01});
/* On Station 3 (throat), WNW funneling scrubs the lower limestone cliff below +38 m, leaving the +41 m slipway bench open and bluff woods above +42 m */
const MIN_WOODY_Y=SKEY==='throat'?Math.max(38.0,TRIM_INFO.minWoodyElevM):Math.max(25.0,TRIM_INFO.minWoodyElevM);
function salInfoAt(x,z){
 const dKm=Math.max(0.5,SITE.oceanDistKm+(x/1000));
 const chD=Math.max(0,L.chanDist(x,z));
 return DDELTA_PHYS.salinityAt({qLocalM3s:SITE.qLocalM3s,oceanDistKm:dKm,channelDistM:chD,tide01:0.55,monsoon01:0.5});
}
const PSU_AT=(x,z)=>salInfoAt(x,z).psu;
const SILICA_AT=(x,z)=>salInfoAt(x,z).silicaMgL;
const BORE_AT=(x,z)=>{
 const h=terrainH(x,z),dKm=Math.max(0.5,SITE.oceanDistKm+(x/1000));
 return DDELTA_PHYS.boreAt({x,z,elevM:h,oceanDistKm:dKm,wnwExposure01:SITE.wnwExposure01,tier:2});
};
const ECOTONE_AT=(x,z)=>{
 const h=terrainH(x,z),sal=salInfoAt(x,z),bore=BORE_AT(x,z);
 return DDELTA_PHYS.ecotoneAt({
  elevM:h,psu:sal.psu,niPpm:0,boreShearPa:bore.shearPa,silicaMgL:sal.silicaMgL,
  minWoodyElevM:MIN_WOODY_Y,amberLag01:L.AMBER(x,z),bitumenSeep01:L.BITUMEN(x,z)
 });
};

// ---------------------------------------------------------------- climate & coast fields
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;
 let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*28,z+Math.sin(a)*28)>-1e8){near=Math.max(near,0.88);break;}}
 for(let k=0;k<8&&wd&&near<0.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*85,z+Math.sin(a)*85)>-1e8){near=Math.max(near,0.48);break;}}
 const rock=clamp(Math.max(smooth(0.36,0.68,slope),L.BLUFF(x,z)*smooth(0.22,0.48,slope)),0,1);
 const salt=clamp(PSU_AT(x,z)/34.5,0,1);
 const wet=clamp(0.45+0.48*near+0.2*L.PEAT(x,z)-0.3*rock+0.06*n2(x,z,0.002,131),0,1);
 const out={wet,flow:0,upland:smooth(25,95,h),canyon:L.BLUECLAY(x,z),rim:L.BLUFF(x,z),rock,dune:L.LAG(x,z),oasis:0,slope,abyss:0,salt,cold:0,geo:L.BITUMEN(x,z),barren:L.MIRE(x,z),fog:0.35,mist:0.35*near,flat:1-slope};
 if(COAST_FIELD&&KCOAST.fields)KCOAST.fields(COAST_FIELD,x,z,out);
 return out;
}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){
 const N=256,S=TERR.R*2.2,a={};
 FNAMES.forEach(n=>{a[n]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)];
  const hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i];
  const slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);
  FNAMES.forEach(n=>{a[n][k]=F[n];});
 }
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{
  if(x!==Lc.x||z!==Lc.z){
   const u=clamp((x/S+0.5)*(N-1),0,N-1.001),v=clamp((z/S+0.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);
   Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;
  }
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;
  return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;
 };
 return{N,S,a,at};
})();
const FIELD={};
FNAMES.forEach(n=>{FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z);});

// ---------------------------------------------------------------- host binding & KSPACE
/* Intertidal species (seapen, whippen, snaphydroid, penshell, tetherpad) have their own shallow-water pass; dry-land rootMask gates terrestrial flora */
function rootMask(x,z){
 if(L.BITUMEN(x,z)>0.55)return 0;
 const d=terrainH(x,z)-waterH(x,z);
 if(d<-1.8)return 0;
 return d<0.4?clamp((d+1.8)/2.2,0.15,1):1;
}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const DD_SPACE=KSPACE.create({cell:18});
BIO.init({
 tags:'doubledelta',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed==null?1:SITE.seed,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:240,mid:580,far:2400,floor:[190,460]},
 windows:{water:WBOX}
});
BIO.setSun([-720,1280,-540]);
