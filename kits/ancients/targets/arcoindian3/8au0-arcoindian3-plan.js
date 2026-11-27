// ================================================================= ARCOINDIAN III — the cliff-niche arcology: the plan (records)
// Sited in a sheer bedded-sandstone canyon cliff above a gorge river, uniting three architectural registers:
//   1. THE STEPPED BARREL-VAULT SPINE (centre): a monumental warm-travertine barrel-vaulted Great Hall high in the cliff
//      cut with tall narrow round-headed flank arcades and a deep dark-glazed arch mouth, stepping down toward the river
//      in six bold semicircular-arched terraces with trabeated pavilions nested inside each arch and twin grand stairs
//      cascading down both flanks.
//   2. THE FLUTED CHALICE TOWERS AND ARCH SKYBRIDGES (outer cliff flanks): eight clustered cylindrical drums wrapped in
//      vertical organic ribs that flare into chalice rims, scooped with curved glass and hanging-garden cutaways, topped
//      with circular woodland crowns and linked across the void by sweeping flared-ribbed parabolic arch skybridges.
//   3. THE TERRACOTTA OCULUS COURTS AND EMERALD POOLS (sheltered side courts): twelve warm rose-terracotta courts tucked
//      between the central spine and the fluted towers, pierced by stacked giant circular moon-gate oculi over ground
//      arches, cantilevered skylight slabs with circular soffit cutouts, warm glowing alcove sconces, trailing vines,
//      and twenty-four sunken emerald-mosaic plunge and reflecting pools fed by twin cliffside springs.
//
// [G data]: no three.js, no DOM. Every variation is hashed from (seed, salt, a, b) via KRAND; records carry stable ids;
// ARCO3.program lays out every Work, Live, Recreation and Civic interior space, and ARCO3.ruin + ARCO3.modernGuide derive
// how the original state governs its modern ruined and reinhabitable condition.
const ARCO3={};

ARCO3.DIM={
 XW:-1080,XE:1080,ZBK:-940,CT0:560,
 NICHE_W:320,NICHE_Z:-220,FACE_Z:64,
 WSY:6,QY:14,
 RIVER_Z0:168,RIVER_Z1:510,FAR_Z0:510,FAR_Z1:760,FAR_H:480,
 STO:4.15,
 VAULT:{w:124,y0:364,ySpring:436,r:62,y1:498,th:13,z0:-220,z1:-68,recess:20,bays:7},
 QUAY:{w:436,y0:0,y1:14,z0:96,z1:168,piers:[-116,0,116],pierW:18,pierL:28},
 NT:6,TERR_Y0:14,TERR_H:58.333333333333336,
 STAIR_W:12,
 SHARE_LIT:0.68,M2_PER_PERSON:45
};

ARCO3.u=function(seed,salt,a,b){
 return KRAND.unit(KRAND.hash(seed|0,salt|0,a==null?0:a|0,b==null?0:b|0));
};

ARCO3.clamp=function(v,lo,hi){return v<lo?lo:v>hi?hi:v;};
ARCO3.lerp=function(a,b,t){return a+(b-a)*t;};

/* Smooth deterministic periodic noise free of browser/kit globals so [G data] runs standalone in Node */
ARCO3.h2=function(ix,iy,salt){
 return KRAND.unit(KRAND.hash(0x51a3,ix|0,iy|0,salt|0));
};
ARCO3.noise2=function(x,y,salt){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
 const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=ARCO3.h2(xi,yi,salt),b=ARCO3.h2(xi+1,yi,salt),c=ARCO3.h2(xi,yi+1,salt),d=ARCO3.h2(xi+1,yi+1,salt);
 return ARCO3.lerp(ARCO3.lerp(a,b,u),ARCO3.lerp(c,d,u),v);
};
ARCO3.fbm2=function(x,y,salt,oct){
 const n=oct==null?3:oct;let acc=0,amp=1,tot=0,fx=x,fy=y;
 for(let i=0;i<n;i++){acc+=ARCO3.noise2(fx,fy,salt+i*17)*amp;tot+=amp;amp*=0.5;fx*=2.03;fy*=2.01;}
 return acc/tot;
};

/* ---- Site & sheer cliff geometry functions ---- */
ARCO3.ctop=function(x){
 const D=ARCO3.DIM,ax=Math.abs(x);
 if(ax<=620)return D.CT0;
 const t=ARCO3.clamp((ax-620)/440,0,1),ts=t-0.72*Math.sin(t*Math.PI*6)/(Math.PI*6);
 return D.CT0*ARCO3.clamp(1-Math.pow(ts,1.45),0.12,1);
};

/* Back wall of the sheer horseshoe cliff niche: -220 m at x=0, curving forward to +64 m at |x|=320 */
ARCO3.nicheBaseZ=function(x){
 const D=ARCO3.DIM,ax=Math.abs(x);
 if(ax>=D.NICHE_W)return D.FACE_Z+18*Math.sin(x*0.0055)+12*(ARCO3.fbm2(x*0.008,1.7,11,3)-0.5);
 const u=ax/D.NICHE_W;
 return D.NICHE_Z+(D.FACE_Z-D.NICHE_Z)*Math.pow(u,2.15);
};

ARCO3.scarCut=function(x,y,dd){
 if(!(dd>0))return 0;
 /* West brow rockfall scar: bites back into the cliff rim over x in [-295, -120], y > 330 */
 const wx=ARCO3.clamp(1-Math.abs(x+212)/92,0,1),wy=ARCO3.clamp((y-328)/140,0,1);
 if(wx<=0||wy<=0)return 0;
 return 58*Math.pow(wx,1.3)*Math.pow(wy,0.85)*(0.75+0.5*ARCO3.fbm2(x*0.025,y*0.02,91,2));
};

/* Sheer cliff face Z(x, y): vertical sandstone strata with faint overhang near the brow and basal talus */
ARCO3.cliffZ=function(x,y,dd){
 const base=ARCO3.nicheBaseZ(x),top=ARCO3.ctop(x);
 const hFrac=ARCO3.clamp(y/(top+1),0,1);
 /* Slight sheer lean-out near upper rim (+14 m) so it reads like an Ancestral Puebloan cliff wall */
 const lean=14*Math.pow(hFrac,1.8)-8*Math.pow(ARCO3.clamp((hFrac-0.9)/0.1,0,1),1.3);
 const strata=3.2*Math.sin(y*0.085+ARCO3.fbm2(x*0.006,0,21,2)*4)+2.4*Math.round(Math.sin(y*0.042)*2)/2;
 const joint=16*Math.pow(Math.abs(ARCO3.fbm2(x*0.019,y*0.004,31,3)-0.5)*2,2.2)-6;
 const inNiche=ARCO3.clamp(1-Math.abs(x)/330,0,1);
 /* Keep the niche floor clean behind the built spine; outside the niche, talus banks out to the river */
 const talus=(1-0.82*inNiche)*52*Math.pow(ARCO3.clamp(1-y/135,0,1),1.75);
 return base+lean-strata-joint+talus-ARCO3.scarCut(x,y,dd);
};

ARCO3.platY=function(x,z,dd){
 const D=ARCO3.DIM,top=ARCO3.ctop(x);
 const backT=ARCO3.clamp((z-D.ZBK)/260,0,1);
 const und=9*(ARCO3.fbm2(x*0.005,z*0.005,41,3)-0.5);
 const sc=dd>0?0.45*ARCO3.scarCut(x,top,dd):0;
 return (top+und)*backT-sc;
};

/* Far canyon wall across the gorge (+z) */
ARCO3.farWallY=function(x,z){
 const D=ARCO3.DIM;
 if(z<=D.FAR_Z0)return 0;
 const t=ARCO3.clamp((z-D.FAR_Z0)/(D.FAR_Z1-D.FAR_Z0),0,1);
 const step=t-0.35*Math.sin(t*Math.PI*4)/(Math.PI*4);
 const rim=D.FAR_H*(0.78+0.22*ARCO3.fbm2(x*0.0025,2.1,51,2));
 const gull=22*(ARCO3.fbm2(x*0.014,z*0.014,57,3)-0.5)*Math.sin(t*Math.PI);
 return Math.max(0,rim*Math.pow(step,0.72)+gull);
};

/* Gorge floor / river bed / talus ground height for water & KRUINS ground truth */
ARCO3.groundY=function(x,z,dd){
 const D=ARCO3.DIM;
 if(z>=D.FAR_Z0)return ARCO3.farWallY(x,z);
 if(z>=D.RIVER_Z0){
  /* River channel bed: 0.4 m at centre, rising to 6.5 m banks at z=168 and z=510 */
  const u=(z-D.RIVER_Z0)/(D.RIVER_Z1-D.RIVER_Z0);
  const bank=Math.pow(Math.abs(u-0.5)*2,3.2);
  return 0.5+6.2*bank+0.8*(ARCO3.fbm2(x*0.02,z*0.02,63,2)-0.5);
 }
 /* Shore bench and talus apron between cliff toe and river edge (z in [80, 168]) */
 const bankY=6.8+5.2*ARCO3.clamp((168-z)/72,0,1);
 /* In the ruin, a low debris bench of rockfall talus banks on the west shore */
 const spoil=(dd>0)?4.5*Math.exp(-Math.pow((x+195)/75,2))*Math.exp(-Math.pow((z-136)/42,2)):0;
 return bankY+spoil;
};

/* ---- Tower radius profile (Reference 2: organic fluted drum flaring into chalice rims) ---- */
ARCO3.towerRadius=function(tw,y){
 const h=tw.y1-tw.y0,ly=ARCO3.clamp(y-tw.y0,0,h),t=h>0?ly/h:0;
 const baseFlare=0.16*Math.pow(ARCO3.clamp(1-t/0.22,0,1),1.8);
 const crownFlare=0.14*Math.pow(ARCO3.clamp((t-0.78)/0.22,0,1),1.6);
 const waist=-0.06*Math.sin(t*Math.PI);
 let scoopFlare=0;
 for(let i=0;i<tw.scoops.length;i++){
  const sc=tw.scoops[i],d=(y-sc.y0)/22;
  if(d>-1&&d<1.2)scoopFlare+=0.08*Math.exp(-d*d*2.2);
 }
 return tw.r*(1+baseFlare+crownFlare+waist+scoopFlare);
};

/* ---- Master Plan Generator ---- */
ARCO3.plan=function(o){
 o=o||{};
 const D=ARCO3.DIM,S=o.seed==null?12400:o.seed,U=ARCO3.u;
 const P={
  id:'arco3',seed:S,dim:D,
  terraces:[],towers:[],bridges:[],courts:[],pools:[],deepGalleries:[],
  cores:[],stairs:[],links:[],program:[],springs:[]
 };

 /* 1. River Quay & Water Gate (y = 0..14 m) */
 P.quay={
  id:'arco3.quay',name:'Gorge River Quay and Water Gate',
  x0:-D.QUAY.w/2,x1:D.QUAY.w/2,y0:0,y1:D.QUAY.y1,z0:D.QUAY.z0,z1:D.QUAY.z1,
  piers:D.QUAY.piers.map((px,i)=>({
   id:'arco3.quay.pier.'+i,x0:px-D.QUAY.pierW/2,x1:px+D.QUAY.pierW/2,
   z0:D.QUAY.z1,z1:D.QUAY.z1+D.QUAY.pierL,y0:0,y1:8.6
  }))
 };

 /* 2. Six Stepped Semicircular-Arched Spine Terraces (Reference 1: k = 0..5 bottom to top) */
 for(let k=0;k<D.NT;k++){
  const y0=Math.round((D.TERR_Y0+k*D.TERR_H)*100)/100;
  const y1=Math.round((D.TERR_Y0+(k+1)*D.TERR_H)*100)/100;
  const w=148-k*4;
  const z1=126-k*38.8;
  const z0=Math.max(D.NICHE_Z,z1-156);
  const archW=84-k*4;
  const archR=archW/2;
  const archSpringY=y0+16;
  const loggiaD=26;
  /* Nested post-and-lintel pavilion inside each semicircular arch (Ref 1 signature) */
  const pavW=archW*0.64,pavH=22,pavZ1=z1-5,pavZ0=z1-23;
  P.terraces.push({
   id:'arco3.terr.'+k,k:k,name:'Spine Terrace '+(k+1),
   x0:-w/2,x1:w/2,y0:y0,y1:y1,z0:Math.round(z0*10)/10,z1:Math.round(z1*10)/10,
   deckZ0:Math.round((k<D.NT-1?126-(k+1)*38.8:D.VAULT.z1)*10)/10,
   arch:{w:archW,r:archR,springY:archSpringY,crownY:archSpringY+archR,depth:loggiaD},
   pavilion:{id:'arco3.terr.'+k+'.pav',w:Math.round(pavW*10)/10,y0:y0,y1:y0+pavH,z0:Math.round(pavZ0*10)/10,z1:Math.round(pavZ1*10)/10,cols:4},
   sideArches:2
  });
 }

 /* 3. Crown Barrel-Vault Great Hall & Flank Arcades (Reference 1 summit: y = 364..498 m) */
 P.vault={
  id:'arco3.vault',name:'The Great Barrel-Vault Conservatory and Council Hall',
  x0:-D.VAULT.w/2,x1:D.VAULT.w/2,y0:D.VAULT.y0,ySpring:D.VAULT.ySpring,y1:D.VAULT.y1,
  z0:D.VAULT.z0,z1:D.VAULT.z1,th:D.VAULT.th,recess:D.VAULT.recess,
  innerW:D.VAULT.w-2*D.VAULT.th,innerR:D.VAULT.r-D.VAULT.th,
  flankBays:D.VAULT.bays
 };

 /* 4. Eight Vertically-Fluted Chalice Towers (Reference 2: 4 West, 4 East, rooted structurally) */
 const TSPECS=[
  {key:'W1',side:'west',name:'West Gorge Bastion',     cx:-154,cz:106,y0:0, y1:218,r:26,flutes:30,scoops:[{y0:82,y1:146,th:0.95,span:1.55}]},
  {key:'E1',side:'east',name:'East Gorge Bastion',     cx: 156,cz:102,y0:0, y1:234,r:27,flutes:30,scoops:[{y0:88,y1:156,th:2.18,span:1.55}]},
  {key:'W2',side:'west',name:'West Chalice Tower',     cx:-206,cz: 22,y0:0, y1:332,r:30,flutes:34,scoops:[{y0:122,y1:182,th:1.10,span:1.65},{y0:218,y1:276,th:0.75,span:1.45}]},
  {key:'E2',side:'east',name:'East Chalice Tower',     cx: 208,cz: 18,y0:0, y1:348,r:31,flutes:34,scoops:[{y0:130,y1:192,th:2.04,span:1.65},{y0:228,y1:290,th:2.38,span:1.45}]},
  {key:'W3',side:'west',name:'West Rim Buttress Tower',cx:-244,cz:-72,y0:6, y1:448,r:33,flutes:36,scoops:[{y0:186,y1:254,th:1.22,span:1.60},{y0:312,y1:382,th:0.92,span:1.50}]},
  {key:'E3',side:'east',name:'East Rim Buttress Tower',cx: 246,cz:-76,y0:6, y1:464,r:33,flutes:36,scoops:[{y0:192,y1:262,th:1.92,span:1.60},{y0:320,y1:394,th:2.22,span:1.50}]},
  {key:'W4',side:'west',name:'West Crown Grove Drum',  cx:-126,cz:-156,y0:14,y1:516,r:28,flutes:32,scoops:[{y0:258,y1:330,th:1.35,span:1.45},{y0:392,y1:458,th:1.18,span:1.40}]},
  {key:'E4',side:'east',name:'East Crown Grove Drum',  cx: 128,cz:-158,y0:14,y1:528,r:29,flutes:32,scoops:[{y0:266,y1:340,th:1.78,span:1.45},{y0:400,y1:468,th:1.96,span:1.40}]}
 ];
 for(let i=0;i<TSPECS.length;i++){
  const s=TSPECS[i];
  P.towers.push(Object.assign({id:'arco3.tower.'+s.key,idx:i,groveTrees:9+(i%3)*2},s));
 }
 const twByKey={};for(const t of P.towers)twByKey[t.key]=t;

 /* 5. Seven Sweeping Flared-Ribbed Arch Skybridges (Reference 2 catenary/parabolic bridges) */
 const BSPECS=[
  {key:'B1w',name:'West Lower Skybridge', y:188,w:18,archDrop:38,from:[-68,188,42],  to:[twByKey.W1.cx,188,twByKey.W1.cz],aId:'arco3.terr.2',bId:'arco3.tower.W1'},
  {key:'B1e',name:'East Lower Skybridge', y:188,w:18,archDrop:38,from:[ 68,188,42],  to:[twByKey.E1.cx,188,twByKey.E1.cz],aId:'arco3.terr.2',bId:'arco3.tower.E1'},
  {key:'B2w',name:'West Mid Skybridge',   y:305,w:20,archDrop:46,from:[twByKey.W2.cx,305,twByKey.W2.cz],to:[twByKey.W3.cx,305,twByKey.W3.cz],aId:'arco3.tower.W2',bId:'arco3.tower.W3'},
  {key:'B2e',name:'East Mid Skybridge',   y:305,w:20,archDrop:46,from:[twByKey.E2.cx,305,twByKey.E2.cz],to:[twByKey.E3.cx,305,twByKey.E3.cz],aId:'arco3.tower.E2',bId:'arco3.tower.E3'},
  {key:'B3w',name:'West Crown Skybridge', y:364,w:20,archDrop:48,from:[-62,364,-96], to:[twByKey.W3.cx,364,twByKey.W3.cz],aId:'arco3.vault', bId:'arco3.tower.W3'},
  {key:'B3e',name:'East Crown Skybridge', y:364,w:20,archDrop:48,from:[ 62,364,-96], to:[twByKey.E3.cx,364,twByKey.E3.cz],aId:'arco3.vault', bId:'arco3.tower.E3'},
  /* Reference 2 iconic High Forest Skybridge spanning between W4 and E4 above the vault's rear crown */
  {key:'B4c',name:'The High Forest Arch', y:502,w:24,archDrop:42,from:[twByKey.W4.cx,502,twByKey.W4.cz],to:[twByKey.E4.cx,502,twByKey.E4.cz],aId:'arco3.tower.W4',bId:'arco3.tower.E4',grove:true}
 ];
 for(const b of BSPECS)P.bridges.push(Object.assign({id:'arco3.bridge.'+b.key},b));

 /* 6. Twelve Sheltered Terracotta Oculus Courts & Twenty-Four Emerald Mosaic Pools (Reference 3) */
 for(let k=0;k<D.NT;k++){
  const T=P.terraces[k];
  const cy=T.y0;
  const cz1=T.z1-8,cz0=cz1-54;
  for(const sd of [-1,1]){
   const side=sd<0?'west':'east',tag=(sd<0?'CW':'CE')+k;
   const innerX=sd*(Math.abs(T.x1)-2);
   const outerX=sd*(Math.abs(T.x1)+68);
   const x0=Math.min(innerX,outerX),x1=Math.max(innerX,outerX);
   const courtId='arco3.court.'+tag;
   const wallH=31.5; /* 3 storeys: 9.5 m ground arch + two 11 m circular oculus storeys */
   const oculusR=4.2,oculusCols=3;
   const mx=(x0+x1)*0.5,mz=(cz0+cz1)*0.5;
   /* Paired emerald mosaic plunge & reflecting pools (Ref 3 foreground) */
   const pA={
    id:courtId+'.pool.a',courtId:courtId,side:side,level:k,
    name:(sd<0?'West ':'East ')+'Emerald Upper Basin '+(k+1),
    x0:Math.round((mx-20)*10)/10,x1:Math.round((mx+20)*10)/10,
    z0:Math.round((mz-16)*10)/10,z1:Math.round((mz-2)*10)/10,
    y:cy,depth:1.65,waterY:Math.round((cy-0.22)*100)/100
   };
   const pB={
    id:courtId+'.pool.b',courtId:courtId,side:side,level:k,
    name:(sd<0?'West ':'East ')+'Emerald Plunge Pool '+(k+1),
    x0:Math.round((mx-20)*10)/10,x1:Math.round((mx+18)*10)/10,
    z0:Math.round((mz+1)*10)/10,z1:Math.round((mz+17)*10)/10,
    y:cy,depth:1.85,waterY:Math.round((cy-0.22)*100)/100
   };
   P.pools.push(pA,pB);
   P.courts.push({
    id:courtId,key:tag,k:k,side:side,sd:sd,
    name:(sd<0?'West ':'East ')+'Oculus Sanctuary Court '+(k+1),
    x0:Math.round(x0*10)/10,x1:Math.round(x1*10)/10,
    z0:Math.round(cz0*10)/10,z1:Math.round(cz1*10)/10,
    y0:cy,wallH:wallH,oculusR:oculusR,oculusCols:oculusCols,
    /* Cantilevered slab with circular soffit skylight oculus (Ref 3 upper-right) */
    cantilever:{
     x0:sd<0?x0:x1-22,x1:sd<0?x0+22:x1,
     z0:Math.round((cz0+6)*10)/10,z1:Math.round((cz1-6)*10)/10,
     y:cy+20.5,skylightR:2.6
    },
    pools:[pA,pB]
   });
  }
 }

 /* 7. Twin Cliffside Artesian Springs (feeding the East and West Court Pool chains) */
 P.springs=[
  {id:'arco3.spring.west',side:'west',name:'West Cliff Spring',at:[-98,386,-168],targetCourt:'arco3.court.CW5'},
  {id:'arco3.spring.east',side:'east',name:'East Cliff Spring',at:[ 98,386,-168],targetCourt:'arco3.court.CE5'}
 ];

 /* 8. Six Deep Cliff-Keyed Galleries (WORK & INFRA behind the daylight zone, z in [-220, -110]) */
 const DG_ROLES=[
  {kind:'hydro_turbine',cat:'work',name:'Lower Penstock Turbine and River Pump Hall',jobs:85},
  {kind:'cold_store',   cat:'work',name:'Rock-Cut Cisterns and Grain Vaults',        jobs:60},
  {kind:'workshop',     cat:'work',name:'Foundry, Ceramic Kilns and Stoneworks',     jobs:140},
  {kind:'hydroponics',  cat:'work',name:'Lamp-Lit Mycelial and Aquaponic Tiers I',   jobs:165},
  {kind:'hydroponics',  cat:'work',name:'Lamp-Lit Hydroponic Orchard Tiers II',      jobs:175},
  {kind:'archive_vault',cat:'civic',name:'Deep Seed Bank and Memory Archive',        jobs:70}
 ];
 for(let k=0;k<D.NT;k++){
  const T=P.terraces[k],R=DG_ROLES[k];
  const zBack=D.NICHE_Z+6,zFront=Math.min(T.z1-42,D.NICHE_Z+88);
  P.deepGalleries.push({
   id:'arco3.deep.'+k,k:k,name:R.name,kind:R.kind,category:R.cat,jobs:R.jobs,
   x0:-54,x1:54,y0:T.y0,y1:T.y1-4,z0:zBack,z1:zFront
  });
 }

 /* 9. Vertical Circulation: Cores, Twin Grand Flanking Stairs, and Guarded Rim Stair */
 P.cores.push(
  {id:'arco3.core.quay.w',sys:'quay',name:'West Quay Freight Lift',x:-52,z:112,r:6.5,y0:0,y1:130},
  {id:'arco3.core.quay.e',sys:'quay',name:'East Quay Freight Lift',x: 52,z:112,r:6.5,y0:0,y1:130},
  {id:'arco3.core.spine.low',sys:'spine',name:'Lower Spine Central Core',x:0,z:-48,r:8.0,y0:14,y1:246},
  {id:'arco3.core.spine.high',sys:'spine',name:'Upper Spine Vault Core',x:0,z:-128,r:8.5,y0:188,y1:482},
  {id:'arco3.core.rim.east',sys:'rim',name:'Guarded Plateau Rim Stair',x:88,z:-198,r:5.5,y0:364,y1:560}
 );
 for(const tw of P.towers){
  P.cores.push({
   id:'arco3.core.'+tw.key,sys:'tower',towerKey:tw.key,
   name:tw.name+' Spiral Lift Core',x:tw.cx,z:tw.cz,r:5.8,y0:tw.y0,y1:tw.y1
  });
 }
 for(const sd of [-1,1]){
  const side=sd<0?'west':'east',flights=[];
  for(let k=0;k<D.NT;k++){
   const T=P.terraces[k];
   const sx=sd*(Math.abs(T.x1)+D.STAIR_W*0.5-1);
   flights.push({
    id:'arco3.stair.'+side+'.'+k,k:k,side:side,
    x:Math.round(sx*10)/10,w:D.STAIR_W,
    y0:T.y0,y1:T.y1,z0:T.z1,z1:Math.round((T.z1-36)*10)/10,
    fromNode:k===0?'arco3.quay':'arco3.terr.'+(k-1),toNode:'arco3.terr.'+k
   });
  }
  P.stairs.push({id:'arco3.stair.'+side,side:side,sd:sd,w:D.STAIR_W,flights:flights});
 }

 /* Build the structural circulation graph links (undirected edges with carrier id) */
 const link=(a,b,via)=>P.links.push({a:a,b:b,via:via});
 /* Quay connects to river, lower sentinel towers, lower courts, quay lifts, and bottom stair flights */
 link('entry.river','arco3.quay','quay.dock');
 link('arco3.quay','arco3.tower.W1','quay.apron');
 link('arco3.quay','arco3.tower.E1','quay.apron');
 link('arco3.quay','arco3.court.CW0','quay.west');
 link('arco3.quay','arco3.court.CE0','quay.east');
 link('arco3.quay','arco3.terr.0','arco3.core.quay.w');
 link('arco3.quay','arco3.terr.1','arco3.core.quay.e');
 /* Rim entry connects via the guarded plateau rim stair to the Crown Vault */
 link('entry.rim','arco3.vault','arco3.core.rim.east');
 /* Grand stair flights connect terrace to terrace */
 for(const st of P.stairs)for(const fl of st.flights)link(fl.fromNode,fl.toNode,fl.id);
 /* Spine cores connect the spine terraces, deep galleries, and Crown Vault */
 for(let k=0;k<D.NT;k++){
  const tid='arco3.terr.'+k;
  link(tid,'arco3.deep.'+k,tid+'.deepdoor');
  link(tid,'arco3.court.CW'+k,tid+'.westarch');
  link(tid,'arco3.court.CE'+k,tid+'.eastarch');
  if(k<=3&&k>0)link('arco3.terr.'+(k-1),tid,'arco3.core.spine.low');
  if(k>=3)link('arco3.terr.'+(k-1),tid,'arco3.core.spine.high');
 }
 link('arco3.terr.5','arco3.vault','arco3.core.spine.high');
 /* Courts connect horizontally to their adjacent Fluted Towers */
 const COURT_TOWER_MAP={
  CW0:'W1',CE0:'E1',CW1:'W1',CE1:'E1',CW2:'W2',CE2:'E2',
  CW3:'W2',CE3:'E2',CW4:'W3',CE4:'E3',CW5:'W4',CE5:'E4'
 };
 for(const ck in COURT_TOWER_MAP){
  const tk=COURT_TOWER_MAP[ck];
  link('arco3.court.'+ck,'arco3.tower.'+tk,'arco3.core.'+tk);
 }
 /* Skybridges connect their endpoint structures */
 for(const br of P.bridges)link(br.aId,br.bId,br.id);

 /* 10. Interior Program Blueprint: Work, Live, Recreation, and Civic units */
 const addProg=u=>{
  const storeys=u.storeys==null?1:u.storeys;
  const planM2=u.shape==='circle'?(Math.PI*u.r*u.r):((u.x1-u.x0)*(u.z1-u.z0));
  const gross=Math.round(planM2*storeys*(u.fill==null?0.82:u.fill));
  const litFrac=u.litFrac==null?1:u.litFrac;
  const lit=Math.round(gross*litFrac);
  const cap=u.category==='live'?Math.round(lit*D.SHARE_LIT/D.M2_PER_PERSON):(u.capacity==null?0:u.capacity);
  const jobs=u.jobs==null?0:u.jobs;
  P.program.push(Object.assign({},u,{storeys:storeys,grossM2:gross,litM2:lit,capacity:cap,jobs:jobs}));
 };

 /* A. Quay & Water-Gate Logistics (WORK + RECREATION promenade) */
 addProg({id:'arco3.prog.quay.whW',partId:'arco3.quay',zone:'quay',category:'work',kind:'warehouse',
  name:'West Barge Warehouse and Crane Hall',shape:'box',x0:-204,x1:-42,z0:102,z1:156,y0:2,y1:13.5,storeys:2,litFrac:0.55,jobs:120,waterSide:'river',
  note:'River cargo handling, dry stores, and hoist winches below the west quay deck'});
 addProg({id:'arco3.prog.quay.whE',partId:'arco3.quay',zone:'quay',category:'work',kind:'warehouse',
  name:'East Barge Warehouse and Boatyard',shape:'box',x0:42,x1:204,z0:102,z1:156,y0:2,y1:13.5,storeys:2,litFrac:0.55,jobs:125,waterSide:'river',
  note:'Timber and alloy boat slips, net lofts, and customs weigh-house'});
 addProg({id:'arco3.prog.quay.gate',partId:'arco3.quay',zone:'quay',category:'civic',kind:'water_gate',
  name:'Central Plunge Basin and Water Gate',shape:'box',x0:-38,x1:38,z0:98,z1:162,y0:0,y1:14,storeys:1,litFrac:0.9,capacity:180,jobs:24,waterSide:'both',
  note:'Receives the stepped emerald-court outfall cascade into the gorge basin'});
 addProg({id:'arco3.prog.quay.prom',partId:'arco3.quay',zone:'quay',category:'recreation',kind:'esplanade',
  name:'Riverfront Quay Esplanade and Anglers Piers',shape:'box',x0:-210,x1:210,z0:142,z1:168,y0:14,y1:18,storeys:1,fill:0.95,capacity:450,jobs:30,waterSide:'river',
  note:'Open waterside market walk and three stone mooring piers'});

 /* B. Six Spine Terraces: Daylight Perimeter Apartments (LIVE), Nested Arch Pavilions (RECREATION), Deep Galleries (WORK) */
 const PAV_NAMES=[
  'Harbourmarket Pavilion and Ferry Loggia',
  'Lower Amphitheatre and Feast Commons',
  'Artisans Bazaar and Tea Colonnade',
  'Mid-Cliff Botanical Loggia and Music Court',
  'Scholars Cloister and Canyon Overlook',
  'High Forecourt Loggia under the Vault'
 ];
 for(let k=0;k<D.NT;k++){
  const T=P.terraces[k],DG=P.deepGalleries[k],pv=T.pavilion;
  /* Nested post-and-lintel pavilion + arched loggia (RECREATION) */
  addProg({id:'arco3.prog.terr.'+k+'.pav',partId:T.id,zone:'spine',category:'recreation',kind:'arch_pavilion',
   name:PAV_NAMES[k],shape:'box',x0:-pv.w/2,x1:pv.w/2,z0:pv.z0,z1:pv.z1,y0:T.y0,y1:pv.y1,storeys:3,fill:0.78,
   capacity:280+k*20,jobs:22,waterSide:'both',
   note:'Trabeated stone pavilion nested inside the semicircular arch; roof terrace planted above'});
  /* West and East perimeter apartment wings along the side arcades facing the Oculus Courts (LIVE) */
  for(const sd of [-1,1]){
   const sTag=sd<0?'W':'E',xA=sd<0?T.x0:T.arch.r-12,xB=sd<0?-T.arch.r+12:T.x1;
   addProg({id:'arco3.prog.terr.'+k+'.live'+sTag,partId:T.id,zone:'spine',category:'live',kind:'terrace_apartments',
    name:'Terrace '+(k+1)+' '+(sd<0?'West':'East')+' Arcade Residences',
    shape:'box',x0:Math.min(xA,xB),x1:Math.max(xA,xB),z0:T.z1-84,z1:T.z1-4,y0:T.y0,y1:T.y1-2,
    storeys:13,fill:0.88,litFrac:0.95,waterSide:sd<0?'west':'east',
    note:'13 storeys of daylight flats opening onto the flank arcades, court loggias, and stepped roof gardens'});
  }
  /* Planted roof garden & orchard deck on each terrace step (RECREATION / food) */
  addProg({id:'arco3.prog.terr.'+k+'.deck',partId:T.id,zone:'spine',category:'recreation',kind:'terrace_garden',
   name:'Terrace '+(k+1)+' Hanging Orchard and Promenade',
   shape:'box',x0:T.x0+4,x1:T.x1-4,z0:T.deckZ0,z1:T.z1,y0:T.y1,y1:T.y1+4,storeys:1,fill:0.88,
   capacity:220,jobs:12,waterSide:'both',
   note:'Irrigated open roof terrace with shade trees, crop beds, and canyon parapet walk'});
  /* Deep rock-keyed cliff gallery behind the lit zone (WORK / INFRA) */
  addProg({id:'arco3.prog.deep.'+k,partId:DG.id,zone:'deep_cliff',category:DG.category,kind:DG.kind,
   name:DG.name,shape:'box',x0:DG.x0,x1:DG.x1,z0:DG.z0,z1:DG.z1,y0:DG.y0,y1:DG.y1,
   storeys:10,fill:0.76,litFrac:0.0,jobs:DG.jobs,capacity:DG.category==='civic'?120:0,waterSide:'both',
   note:'Windowless cliff-back zone: never used for housing; lamp-lit works, hydroponics, and vaults'});
 }

 /* C. The Crown Barrel-Vault Hall (Reference 1 top: CIVIC + WORK conservatory/labs + RECREATION sky court) */
 addProg({id:'arco3.prog.vault.forecourt',partId:'arco3.vault',zone:'vault',category:'recreation',kind:'sky_plaza',
  name:'Barrel-Vault Threshold Garden and Sky Loggia',
  shape:'box',x0:-49,x1:49,z0:-88,z1:-68,y0:364,y1:480,storeys:1,fill:0.92,capacity:500,jobs:16,waterSide:'both',
  note:'Shadowed monumental arch mouth framed by the 13 m stone vault hood'});
 addProg({id:'arco3.prog.vault.hall',partId:'arco3.vault',zone:'vault',category:'civic',kind:'great_hall',
  name:'The Great Arched Assembly and Conservatory Nave',
  shape:'box',x0:-48,x1:48,z0:-158,z1:-88,y0:364,y1:436,storeys:6,fill:0.65,litFrac:0.95,capacity:1200,jobs:95,waterSide:'both',
  note:'Six stepped gallery balconies behind the monumental dark-glazed arch and tall flank arcades'});
 addProg({id:'arco3.prog.vault.labs',partId:'arco3.vault',zone:'vault',category:'work',kind:'botanical_institute',
  name:'High Acclimatization Conservatory and Solar Observatory',
  shape:'box',x0:-44,x1:44,z0:-214,z1:-158,y0:364,y1:472,storeys:14,fill:0.74,litFrac:0.78,jobs:210,waterSide:'both',
  note:'Seed acclimatization, atmospheric instruments, and governance offices under the rear vault'});

 /* D. Twelve Terracotta Oculus Courts: Moon-Gate Residences (LIVE) + Emerald Mosaic Baths (RECREATION) */
 for(const C of P.courts){
  addProg({id:'arco3.prog.court.'+C.key+'.live',partId:C.id,zone:'oculus_courts',category:'live',kind:'oculus_maisonettes',
   name:C.name+' Moon-Gate Maisonettes',
   shape:'box',x0:C.x0,x1:C.x1,z0:C.z0,z1:C.z0+28,y0:C.y0,y1:C.y0+C.wallH,
   storeys:8,fill:0.90,litFrac:0.96,waterSide:C.side,
   note:'Warm terracotta apartments lit through giant circular moon-gate oculi and cantilevered skylight balconies'});
  addProg({id:'arco3.prog.court.'+C.key+'.baths',partId:C.id,zone:'oculus_courts',category:'recreation',kind:'emerald_pool_court',
   name:C.name+' Emerald Plunge Baths and Sconce Loggia',
   shape:'box',x0:C.x0+4,x1:C.x1-4,z0:C.z0+28,z1:C.z1,y0:C.y0,y1:C.y0+9.5,
   storeys:1,fill:0.92,capacity:160,jobs:14,waterSide:C.side,
   note:'Paired emerald-mosaic reflecting and plunge pools divided by stone causeways; warm alcove sconces'});
 }

 /* E. Eight Vertically-Fluted Chalice Towers: Lower Guild/Lab Drums (WORK), Upper Panorama Drums (LIVE), Crown Groves (RECREATION) */
 const TW_WORK_NAMES={
  W1:'West River Hydraulics and Fishery Guild',E1:'East River Customs and Ropewalk Guild',
  W2:'West Geological and Cliff-Bore Institute',E2:'East Agronomy and Orchard Guildhall',
  W3:'West Aerology and Glider Hangar',E3:'East Glassblowers and Mosaic Atelier',
  W4:'West Astronomical and Chronicle Tower',E4:'East Water-Keepers and Physicians College'
 };
 for(const tw of P.towers){
  const h=tw.y1-tw.y0,ySplit=Math.round(tw.y0+h*0.28);
  const workSt=Math.max(4,Math.floor((ySplit-tw.y0)/D.STO));
  const liveSt=Math.max(8,Math.floor((tw.y1-8-ySplit)/D.STO));
  addProg({id:'arco3.prog.tower.'+tw.key+'.work',partId:tw.id,zone:'fluted_towers',category:'work',kind:'tower_guild_labs',
   name:TW_WORK_NAMES[tw.key],shape:'circle',cx:tw.cx,cz:tw.cz,r:tw.r*0.86,y0:tw.y0,y1:ySplit,
   storeys:workSt,fill:0.76,litFrac:0.72,jobs:workSt*16,waterSide:tw.side,
   note:'Lower fluted drum workshops, laboratories, and skybridge hub concourses'});
  addProg({id:'arco3.prog.tower.'+tw.key+'.live',partId:tw.id,zone:'fluted_towers',category:'live',kind:'tower_residences',
   name:tw.name+' Fluted Residential Drum',shape:'circle',cx:tw.cx,cz:tw.cz,r:tw.r*0.92,y0:ySplit,y1:tw.y1-8,
   storeys:liveSt,fill:0.86,litFrac:0.92,waterSide:tw.side,
   note:'Curved-glass residences behind the organic vertical ribs, opening onto scooped chalice garden decks'});
  addProg({id:'arco3.prog.tower.'+tw.key+'.grove',partId:tw.id,zone:'fluted_towers',category:'recreation',kind:'crown_grove',
   name:tw.name+' Circular Woodland Crown',shape:'circle',cx:tw.cx,cz:tw.cz,r:tw.r*1.10,y0:tw.y1,y1:tw.y1+14,
   storeys:1,fill:0.92,capacity:140,jobs:6,waterSide:tw.side,
   note:'Deep soil chalice planter on the tower summit with shade trees and canyon lookout ring'});
 }

 /* F. Skybridge Promenades (RECREATION / circulation) */
 for(const br of P.bridges){
  const len=Math.hypot(br.to[0]-br.from[0],br.to[2]-br.from[2]);
  const mx=(br.from[0]+br.to[0])*0.5,mz=(br.from[2]+br.to[2])*0.5;
  addProg({id:'arco3.prog.bridge.'+br.key,partId:br.id,zone:'skybridges',category:'recreation',kind:'skybridge_walk',
   name:br.name+' Promenade',shape:'box',x0:Math.round(mx-len*0.5),x1:Math.round(mx+len*0.5),
   z0:Math.round(mz-br.w*0.5),z1:Math.round(mz+br.w*0.5),y0:br.y,y1:br.y+4,
   storeys:1,fill:0.9,capacity:Math.round(len*0.9),jobs:4,waterSide:mx<-20?'west':mx>20?'east':'both',
   note:br.grove?'Tree-planted summit arch viaduct spanning 254 m between the two high crown drums':'Flared-ribbed parabolic arch promenade'});
 }

 /* 11. Aggregate Statistics */
 const byCat={live:{gross:0,lit:0,count:0},work:{gross:0,lit:0,count:0},recreation:{gross:0,lit:0,count:0},civic:{gross:0,lit:0,count:0}};
 let totGross=0,totLit=0,totPop=0,totJobs=0,totRecCap=0,openGardenM2=0;
 for(const u of P.program){
  const c=byCat[u.category];
  c.gross+=u.grossM2;c.lit+=u.litM2;c.count++;
  totGross+=u.grossM2;totLit+=u.litM2;
  totPop+=u.capacity*(u.category==='live'?1:0);
  totJobs+=u.jobs;
  if(u.category==='recreation')totRecCap+=u.capacity;
  if(u.kind==='terrace_garden'||u.kind==='crown_grove'||u.kind==='emerald_pool_court'||u.kind==='skybridge_walk'||u.kind==='sky_plaza'){
   openGardenM2+=u.grossM2;
  }
 }
 let poolWaterM2=0;
 for(const pl of P.pools)poolWaterM2+=(pl.x1-pl.x0)*(pl.z1-pl.z0);
 P.stats={
  height:528,cliffHeight:D.CT0,vaultApex:D.VAULT.y1,
  grossFloorM2:totGross,grossFloorHa:Math.round(totGross/100)/100,
  litFloorM2:totLit,litFloorHa:Math.round(totLit/100)/100,
  population:totPop,jobs:totJobs,recreationCapacity:totRecCap,
  openGardenHa:Math.round(openGardenM2/100)/100,
  poolWaterM2:Math.round(poolWaterM2),
  pools:P.pools.length,towers:P.towers.length,terraces:P.terraces.length,courts:P.courts.length,
  programUnits:P.program.length,
  byCategory:byCat
 };
 return P;
};

/* The five structural links crossing the y = 188 m Neck between the lower river ruins (k = 0..1) and the Upper Sanctuary (k = 2..5) */
ARCO3.NECK_CUTS=function(){
 return [
  'arco3.bridge.B1w','arco3.bridge.B1e',
  'arco3.stair.west.2','arco3.stair.east.2',
  'arco3.core.spine.low'
 ];
};

/* ---- Ruin Deltas by Stable ID (d = 1) ---- */
ARCO3.ruin=function(P){
 const S=P.seed,U=ARCO3.u;
 const R={
  id:'arco3.ruin',
  /* 1. West Brow rockfall sheared Tower W3 at y = 292 m */
  towerCuts:{'arco3.tower.W3':292},
  /* 2. Lower neck skybridges (B1w, B1e) and West Mid/Crown skybridges (B2w, B3w) fell or were dropped at the Neck */
  goneBridges:['arco3.bridge.B1w','arco3.bridge.B1e','arco3.bridge.B2w','arco3.bridge.B3w'],
  /* 3. Neck grand stair flights (k = 2 on both sides) cut at y = 188 m, plus west flight 4 crushed by rockfall */
  brokenFlights:[
   'arco3.stair.west.2','arco3.stair.east.2','arco3.stair.west.4'
  ],
  /* 4. Lower spine core silted/sealed at the Neck, and rockfall choked the west court arches at k = 2..4 */
  blockedCores:[
   'arco3.core.spine.low',
   'arco3.terr.2.westarch','arco3.terr.3.westarch','arco3.terr.4.westarch'
  ],
  /* 5. West spring breached above CW4 (y = 305 m): west courts CW0..CW4 lost pool water; wild waterfall drops from CW4 */
  breachedSpring:'arco3.spring.west',
  dryCourts:['arco3.court.CW0','arco3.court.CW1','arco3.court.CW2','arco3.court.CW3','arco3.court.CW4'],
  damagedParts:['arco3.tower.W3','arco3.court.CW4','arco3.court.CW3','arco3.terr.3'],
  wildCascade:{name:'The Breached West Cascade',lipA:[-156,246,-18],lipB:[-138,246,-18],drop:238},
  /* 6. Seated wrecks on the west shore bench / quay apron (height < 25 m, seated directly on groundY) */
  wrecks:[]
 };
 const WPOS=[
  {id:'arco3.wreck.drum.0',kind:'fluted_drum',x:-252,z:124,r:9.5, h:15,yaw:0.42,tilt:1.38},
  {id:'arco3.wreck.drum.1',kind:'fluted_drum',x:-284,z:138,r:8.5, h:14,yaw:1.85,tilt:1.42},
  {id:'arco3.wreck.arch.0',kind:'bridge_rib', x:-242,z:148,w:19,  h:7.5,d:11,yaw:0.28,tilt:0.16},
  {id:'arco3.wreck.arch.1',kind:'bridge_rib', x:-298,z:116,w:18,  h:7.0,d:10,yaw:-0.55,tilt:0.20},
  {id:'arco3.wreck.vault.0',kind:'arch_voussoir',x:-266,z:154,w:15,h:6.5,d:10,yaw:0.95,tilt:0.14}
 ];
 for(let i=0;i<WPOS.length;i++){
  const w=WPOS[i];
  R.wrecks.push(Object.assign({},w,{jitter:(U(S,810,i,0)-0.5)*0.12}));
 }
 return R;
};

/* ---- Circulation Graph Reachability ---- */
ARCO3.blockedCarriers=function(RU){
 if(!RU)return new Set();
 return new Set([].concat(RU.goneBridges||[],RU.brokenFlights||[],RU.blockedCores||[]));
};

ARCO3.reach=function(P,startNodes,blockedSet){
 const blk=blockedSet instanceof Set?blockedSet:new Set(blockedSet||[]);
 const adj={};
 for(const e of P.links){
  if(blk.has(e.via))continue;
  (adj[e.a]||(adj[e.a]=[])).push(e.b);
  (adj[e.b]||(adj[e.b]=[])).push(e.a);
 }
 const seen=new Set(),q=[];
 for(const s of startNodes){seen.add(s);q.push(s);}
 while(q.length){
  const cur=q.pop(),nb=adj[cur]||[];
  for(const nxt of nb)if(!seen.has(nxt)){seen.add(nxt);q.push(nxt);}
 }
 return seen;
};

/* ---- Modern Condition Blueprint Guide (derived directly from Original Plan + Ruin Deltas) ---- */
ARCO3.modernGuide=function(P,RU){
 const ru=RU||ARCO3.ruin(P);
 const blk=ARCO3.blockedCarriers(ru);
 const fromRiver=ARCO3.reach(P,['entry.river'],blk);
 const fromRim=ARCO3.reach(P,['entry.rim'],blk);
 const drySet=new Set(ru.dryCourts||[]);
 const dmgSet=new Set(ru.damagedParts||[]);
 const goneBr=new Set(ru.goneBridges||[]);

 const units=[],summary={
  sanctuary:{units:0,liveCap:0,irrigatedM2:0,workM2:0},
  river_salvage:{units:0,liveCap:0,workM2:0},
  isolated_west:{units:0,liveCap:0,workM2:0},
  collapsed:{units:0}
 };

 for(const u of P.program){
  let zoneState='isolated_west',modernRole='Sealed explorer ruin: intact Ancient rooms reachable only by rope or climb';
  const twCut=ru.towerCuts[u.partId];
  if(goneBr.has(u.partId)||(twCut!=null&&u.y0>=twCut-2)){
   zoneState='collapsed';
   modernRole='Fallen in the West Brow rockfall: wreckage lies on the west shore talus';
   summary.collapsed.units++;
  }else if(fromRim.has(u.partId)&&!fromRiver.has(u.partId)){
   const watered=u.waterSide==='east'||u.waterSide==='both';
   const damaged=dmgSet.has(u.partId)||drySet.has(u.partId);
   if(watered&&!damaged){
    zoneState='sanctuary';
    summary.sanctuary.units++;
    summary.sanctuary.liveCap+=u.category==='live'?u.capacity:0;
    summary.sanctuary.workM2+=u.category==='work'?u.grossM2:0;
    if(u.kind==='terrace_garden'||u.kind==='crown_grove'||u.kind==='hydroponics'||u.kind==='emerald_pool_court'){
     summary.sanctuary.irrigatedM2+=u.grossM2;
    }
    modernRole=u.category==='live'?'Inhabitable sanctuary housing (watered by East Spring, defended above broken stairs)'
     :u.category==='work'?'Active sanctuary guildhall, workshop, or irrigated cliff farm'
     :u.category==='civic'?'High Sanctuary Council and Shrine in the Barrel Vault'
     :'Watered emerald bath court, orchard deck, or high sky-promenade';
   }else{
    zoneState='isolated_west';
    summary.isolated_west.units++;
    summary.isolated_west.liveCap+=u.category==='live'?u.capacity:0;
    summary.isolated_west.workM2+=u.category==='work'?u.grossM2:0;
    modernRole=drySet.has(u.partId)?'Dry west oculus court (spring breached): rain-cistern camp or storehouse':'Rockfall-scarred west flank: buffer watchpost and salvage';
   }
  }else if(fromRiver.has(u.partId)){
   zoneState='river_salvage';
   summary.river_salvage.units++;
   summary.river_salvage.liveCap+=u.category==='live'?u.capacity:0;
   summary.river_salvage.workM2+=u.category==='work'?u.grossM2:0;
   modernRole='River-level port, boat-builders quay, and salvage trading post';
  }else{
   summary.isolated_west.units++;
   summary.isolated_west.liveCap+=u.category==='live'?u.capacity:0;
   summary.isolated_west.workM2+=u.category==='work'?u.grossM2:0;
  }
  units.push({id:u.id,name:u.name,partId:u.partId,category:u.category,kind:u.kind,y0:u.y0,y1:u.y1,
   originalCap:u.capacity,originalJobs:u.jobs,zoneState:zoneState,modernRole:modernRole});
 }
 /* Sustainable modern population fed by the surviving irrigated sanctuary terraces & hydroponics (~160 people/ha) */
 const irrHa=summary.sanctuary.irrigatedM2/10000;
 summary.sanctuary.irrigatedHa=Math.round(irrHa*100)/100;
 summary.sanctuary.sustainableModernPop=Math.round(irrHa*165);
 return {
  riverTouchesRim:fromRiver.has('arco3.vault'),
  vaultReachableFromRim:fromRim.has('arco3.vault'),
  summary:summary,
  units:units
 };
};

/* ---- Deterministic Dress Records (Flora, Vines, Sconces, Boats, Citizens) ---- */
ARCO3.dress=function(P,RU){
 const S=P.seed,U=ARCO3.u,out=[];
 const twCuts=RU?RU.towerCuts:{},goneBr=new Set(RU?RU.goneBridges:[]),dryC=new Set(RU?RU.dryCourts:[]);

 /* 1. Lush Billowing Circular Woodland Crowns on every standing Fluted Tower (Ref 2) */
 for(let i=0;i<P.towers.length;i++){
  const tw=P.towers[i];
  if(twCuts[tw.id]!=null)continue;
  const n=tw.groveTrees+6,rc=tw.r*0.84;
  for(let j=0;j<n;j++){
   const ang=(j/n)*Math.PI*2+U(S,101,i,j)*0.42;
   const rad=(j<2?0.18*j:0.32+0.66*U(S,102,i,j))*rc;
   const h=15+12*U(S,103,i,j);
   out.push({id:'arco3.tree.tw.'+tw.key+'.'+j,kind:'tree',at:[tw.cx+Math.cos(ang)*rad,tw.y1+0.4,tw.cz+Math.sin(ang)*rad],h:h,sp:j%2===0?0:2});
  }
  /* Scoop chalice hanging-garden trees */
  for(let s=0;s<tw.scoops.length;s++){
   const sc=tw.scoops[s];
   for(let j=0;j<5;j++){
    const ang=sc.th+(j-2)*0.24+(U(S,108,i*4+s,j)-0.5)*0.10;
    const rad=tw.r*0.88;
    out.push({id:'arco3.tree.scoop.'+tw.key+'.'+s+'.'+j,kind:'tree',
     at:[tw.cx+Math.cos(ang)*rad,sc.y0+0.5,tw.cz+Math.sin(ang)*rad],h:9+6*U(S,109,i*4+s,j),sp:0});
   }
  }
 }

 /* 2. High Forest Arch Skybridge Grove (Ref 2 top bridge) */
 for(const br of P.bridges){
  if(!br.grove||goneBr.has(br.id))continue;
  for(let j=0;j<18;j++){
   const t=0.05+0.90*(j/17)+(U(S,120,j,0)-0.5)*0.025;
   const x=ARCO3.lerp(br.from[0],br.to[0],t);
   const z=ARCO3.lerp(br.from[2],br.to[2],t)+(j%2===0?-5.8:5.8)+(U(S,121,j,0)-0.5)*2.6;
   out.push({id:'arco3.tree.br.'+j,kind:'tree',at:[x,br.y+0.4,z],h:14+10*U(S,122,j,0),sp:j%2===0?0:2});
  }
 }

 /* 3. Stepped Spine Terrace Gardens & Pavilion Roof Trees (Ref 1 lush cascading greenery) */
 for(let k=0;k<P.terraces.length;k++){
  const T=P.terraces[k];
  for(let j=0;j<14;j++){
   const side=j%2===0?-1:1;
   const x=side*(10+U(S,140,k,j)*(Math.abs(T.x1)-18));
   const z=ARCO3.lerp(T.deckZ0+5,T.z1-4,U(S,141,k,j));
   out.push({id:'arco3.tree.terr.'+k+'.'+j,kind:'tree',at:[x,T.y1+0.3,z],h:10+8.5*U(S,142,k,j),sp:j%3===1?1:0});
  }
  /* Trees on the nested pavilion roof inside the arch */
  const pv=T.pavilion;
  for(let j=0;j<4;j++){
   const x=(j-1.5)*pv.w*0.22+(U(S,145,k,j)-0.5)*2.5;
   const z=(pv.z0+pv.z1)*0.5;
   out.push({id:'arco3.tree.pav.'+k+'.'+j,kind:'tree',at:[x,pv.y1+0.3,z],h:7.5+4.5*U(S,146,k,j),sp:0});
  }
 }

 /* 4. Terracotta Oculus Court Trees, Trailing Oculus Vines, and Sculptural Wall Sconces (Ref 3) */
 for(let i=0;i<P.courts.length;i++){
  const C=P.courts[i],isDry=dryC.has(C.id);
  const mx=(C.x0+C.x1)*0.5,mz=(C.z0+C.z1)*0.5;
  const stepX=(C.x1-C.x0)/C.oculusCols;
  if(!isDry||U(S,160,i,0)<0.5){
   for(let j=0;j<5;j++){
    const x=j<3?C.x0+6+U(S,161,i,j)*5:C.x1-6-U(S,161,i,j)*5;
    const z=C.z0+24+U(S,162,i,j)*24;
    out.push({id:'arco3.tree.court.'+C.key+'.'+j,kind:'tree',at:[x,C.y0+0.3,z],h:6.5+4.5*U(S,163,i,j),sp:0});
   }
  }
  /* Sconces mounted squarely on the solid terracotta piers between the circular oculi (never floating in an opening!) */
  const litCourt=!RU||C.side==='east';
  for(let s=1;s<C.oculusCols;s++){
   const sx=C.x0+s*stepX;
   out.push({id:'arco3.sconce.'+C.key+'.'+s,kind:'sconce',
    at:[sx,C.y0+7.2+(s%2)*7.8,C.z0+21.1],lit:litCourt});
  }
  /* Trailing greenery hanging directly from the lower sill of each circular moon-gate oculus */
  for(let col=0;col<C.oculusCols;col++)for(let row=0;row<2;row++){
   const ox=C.x0+(col+0.5)*stepX,oy=C.y0+15.0+row*10.6-C.oculusR+0.25;
   out.push({id:'arco3.vine.'+C.key+'.'+col+'.'+row,kind:'vine',
    at:[ox,oy,C.z0+21.0],len:4.5+5.0*U(S,170,i*6+col*2+row,0)});
  }
  /* Citizens in intact courts (and in the surviving East Sanctuary courts in d=1) */
  if(litCourt){
   out.push({id:'arco3.fig.'+C.key,kind:'figure',at:[mx+2,C.y0+0.25,mz-0.5],ry:U(S,175,i,0)*Math.PI*2});
  }
 }

 /* 5. Moored River Boats at the Quay Piers */
 const nBoats=RU?2:5;
 for(let i=0;i<nBoats;i++){
  const pr=P.quay.piers[i%P.quay.piers.length];
  const side=i%2===0?-1:1;
  out.push({id:'arco3.boat.'+i,kind:'boat',
   at:[side>0?pr.x1+4.5:pr.x0-4.5,ARCO3.DIM.WSY+0.15,pr.z0+8+(i%3)*7],
   ry:Math.PI*0.5+(U(S,185,i,0)-0.5)*0.12});
 }
 return out;
};
