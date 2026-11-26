// ================================================================= SLICE — the cliff-slice arcology (after Soleri's 26. Theology): the plan  [G data]
// Sited in a 560 m columnar-jointed cliff rising over a horizontally-stratified 220 m canyon bench and a deep sunken park slot:
//   1. THE UPPER LENTICULAR "SLICE" EYE (y = 410..536 m, 720 m wide): a razor-tipped horizontal biconvex cut in the upper columnar
//      cliff housing the central coffered geodesic CITY CENTER apse dome, flanked by the west CULTURAL CENTER arches and saucer dome,
//      the east vaulted LIVING hall with five porthole oculi, a cantilevered cellular honeycomb belly (PUBLIC / LIVING / DWELLINGS),
//      and a projecting semicircular radial-buttressed PARK & RECREATION amphitheatre fan; backed inside the plateau by concentric
//      horseshoe DWELLINGS arcs, circular RESIDENTIAL and PUBLIC skylight drums, the great hexagonal SKYLIGHT commercial/promenade
//      court, the vaulted MEETING AREAS hypostyle hall, and twin diagonal INTER-CITY TRANSPORTATION portals.
//   2. THE VERTICAL LEARNING & COLLECTION SHAFT (y = 28..412 m): a 60 m-wide monumental 36-storey shaft dropping plumb from the
//      underside collar of the Eye straight into the sunken canyon trench, branching left and right into three rock-cut cliff
//      specimen caverns (RESEARCH, MUSEUMS, ANTHROPOLOGICAL COLLECTION) plus a west bench fieldhouse pavilion at y = 220 m.
//   3. THE DEEP SUNKEN PARK TRENCH, BATTERED DWELLINGS WALL & AUTOMATED INDUSTRIES (y = 0..232 m): a 192 m-deep slot canyon cut
//      through the stratified bench to a watered PARK at y = 28 m, faced on the east by a 26-storey battered stepped DWELLINGS wall
//      linked across the slot by diagonal light-veil ribs, above the subterranean AUTOMATED INDUSTRIES gallery at y = 0..28 m.
//
// [G data]: no three.js, no DOM. Every variation is hashed from (seed, salt, a, b) via KRAND; records carry stable ids;
// SLICE.plan lays out every Work, Live, Recreation and Civic interior space (~13 000 citizens over 34 ha covered), and
// SLICE.ruin + SLICE.modernGuide derive how the shaft neck breach and west brow rockfall govern its modern condition.
const SLICE={};

SLICE.DIM={
 XW:-1080,XE:1080,ZBK:-920,CT0:560,
 BENCH_Y:220,BENCH_Z0:0,BENCH_Z1:186,
 SLOT_XW:-52,SLOT_XE:176,
 PARK_Y:28,IND_Y0:0,IND_Y1:28,
 WSY:6,APRON_Z1:214,RIVER_Z0:214,RIVER_Z1:520,FAR_Z0:520,FAR_Z1:760,FAR_H:400,
 SHAFT:{x0:-30,x1:30,z0:-38,z1:18,y0:28,y1:412,tiers:36,pierW:5.6,coreW:6.4},
 COLLAR:{x0:-48,x1:48,z0:-48,z1:28,y0:400,y1:414},
 EYE:{hw:360,yEq:456,yTop:536,yBot:410,depthBack:205,lipProj:36,ruinCutX:-262},
 DOME:{rOuter:56,rInner:44,y0:456,yApex:512,z0:-58,z1:20,meridians:16,rings:7},
 FAN:{cx:0,cz:18,r0:34,r1:108,y0:416,y1:454,steps:5,piers:7},
 DWALL:{xToe:132,xCrest:160,xBack:178,y0:28,y1:232,z0:-36,z1:180,steps:26},
 HEX:{cx:0,cz:-205,rOuter:68,rSky:24,y0:464,y1:562,tiers:5,drumR:11},
 SURFACE_COVERED_HA:34.0,SHEET_POP:13000,DENSITY_PER_HA:378,
 SHARE_LIT:0.72,M2_PER_PERSON:31.7
};

SLICE.u=function(seed,salt,a,b){
 return KRAND.unit(KRAND.hash(seed|0,salt|0,a==null?0:a|0,b==null?0:b|0));
};

SLICE.clamp=function(v,lo,hi){return v<lo?lo:v>hi?hi:v;};
SLICE.lerp=function(a,b,t){return a+(b-a)*t;};

/* Deterministic value noise free of browser/kit globals so [G data] runs standalone in Node */
SLICE.h2=function(ix,iy,salt){
 return KRAND.unit(KRAND.hash(0x62b7,ix|0,iy|0,salt|0));
};
SLICE.noise2=function(x,y,salt){
 const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
 const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const a=SLICE.h2(xi,yi,salt),b=SLICE.h2(xi+1,yi,salt),c=SLICE.h2(xi,yi+1,salt),d=SLICE.h2(xi+1,yi+1,salt);
 return SLICE.lerp(SLICE.lerp(a,b,u),SLICE.lerp(c,d,u),v);
};
SLICE.fbm2=function(x,y,salt,oct){
 const n=oct==null?3:oct;let acc=0,amp=1,tot=0,fx=x,fy=y;
 for(let i=0;i<n;i++){acc+=SLICE.noise2(fx,fy,salt+i*19)*amp;tot+=amp;amp*=0.5;fx*=2.03;fy*=2.01;}
 return acc/tot;
};

/* ---- Site & Cliff Geometry Functions ---- */
SLICE.ctop=function(x){
 const D=SLICE.DIM,ax=Math.abs(x);
 if(ax<=660)return D.CT0;
 const t=SLICE.clamp((ax-660)/400,0,1),ts=t-0.74*Math.sin(t*Math.PI*6)/(Math.PI*6);
 return D.CT0*SLICE.clamp(1-Math.pow(ts,1.45),0.42,1);
};

SLICE.benchCapY=function(x){
 const D=SLICE.DIM,ax=Math.abs(x);
 if(ax<=680)return D.BENCH_Y;
 const t=SLICE.clamp((ax-680)/380,0,1),ts=t-0.68*Math.sin(t*Math.PI*4)/(Math.PI*4);
 return D.BENCH_Y*SLICE.clamp(1-Math.pow(ts,1.5),0.15,1);
};

/* Lenticular "Slice" Eye upper and lower curves over x in [-360, +360] */
SLICE.eyeTopY=function(x){
 const E=SLICE.DIM.EYE,u=SLICE.clamp(Math.abs(x)/E.hw,0,1);
 if(u>=1)return E.yEq;
 return E.yEq+(E.yTop-E.yEq)*Math.pow(1-u*u,0.78);
};
SLICE.eyeBotY=function(x){
 const E=SLICE.DIM.EYE,u=SLICE.clamp(Math.abs(x)/E.hw,0,1);
 if(u>=1)return E.yEq;
 return E.yEq-(E.yEq-E.yBot)*Math.pow(1-u*u,0.82);
};
SLICE.inEye=function(x,y){
 const E=SLICE.DIM.EYE;
 if(Math.abs(x)>=E.hw-1)return false;
 return y>=SLICE.eyeBotY(x)+0.5&&y<=SLICE.eyeTopY(x)-0.5;
};
SLICE.eyeBackZ=function(x){
 const E=SLICE.DIM.EYE,u=SLICE.clamp(Math.abs(x)/E.hw,0,1);
 return -E.depthBack*Math.pow(1-u*u,0.85);
};
SLICE.eyeLipZ=function(x){
 const E=SLICE.DIM.EYE,u=SLICE.clamp(Math.abs(x)/E.hw,0,1);
 return E.lipProj*Math.pow(1-u*u,0.75);
};

/* West Eye Brow columnar rockfall scar in d = 1 */
SLICE.scarCut=function(x,y,dd){
 if(!(dd>0))return 0;
 const wx=SLICE.clamp(1-Math.abs(x+292)/78,0,1),wy=SLICE.clamp((y-418)/130,0,1);
 if(wx<=0||wy<=0)return 0;
 return 46*Math.pow(wx,1.25)*Math.pow(wy,0.85)*(0.75+0.5*SLICE.fbm2(x*0.03,y*0.02,93,2));
};

/* Columnar-jointed upper cliff face Z(x, y) for y in [220, 560] (Soleri's tall vertical rock monoliths) */
SLICE.upperCliffZ=function(x,y,dd){
 const colW=28;
 const cid=Math.floor((x+2048)/colW);
 const lx=(x+2048)-cid*colW;
 const edgeDist=Math.min(lx,colW-lx);
 /* Each vertical monolith column steps slightly forward/back (+/- 4.8 m) with sharp vertical joint grooves */
 const colStep=(SLICE.h2(cid,7,11)-0.5)*9.6+(SLICE.h2(Math.floor(cid/3),3,17)-0.5)*7.0;
 const groove=edgeDist<1.8?-(1.8-edgeDist)*2.6:0;
 const gentlePlan=-6*Math.cos(SLICE.clamp(x/420,-1,1)*Math.PI*0.5);
 const top=SLICE.ctop(x);
 const browLean=5.5*Math.pow(SLICE.clamp((y-220)/Math.max(40,top-220),0,1),1.4);
 return gentlePlan+colStep+groove+browLean-SLICE.scarCut(x,y,dd);
};

/* Lower horizontally-stratified canyon bench front Z(x, y) at z ~ 186 for y in [0, 220] */
SLICE.benchFrontZ=function(x,y){
 const D=SLICE.DIM;
 const strata=2.4*Math.sin(y*0.14)+1.8*Math.round(Math.sin(y*0.055)*2)/2;
 const wave=7*(SLICE.fbm2(x*0.006,0.9,29,2)-0.5);
 const toe=12*Math.pow(SLICE.clamp(1-y/65,0,1),1.8);
 return D.BENCH_Z1+wave-strata+toe;
};

/* Battered Dwellings Wall west face X(y) rising from x = 132 at y = 28 to x = 160 at y = 232 */
SLICE.dwallWestX=function(y){
 const W=SLICE.DIM.DWALL;
 const t=SLICE.clamp((y-W.y0)/(W.y1-W.y0),0,1);
 return SLICE.lerp(W.xToe,W.xCrest,t);
};

/* West slot canyon rock wall X(y) battering from x = -52 at y = 220 to x = -30 at y = 28 (matching image_2.png) */
SLICE.slotWestX=function(y){
 const D=SLICE.DIM;
 const t=SLICE.clamp((y-D.PARK_Y)/(D.BENCH_Y-D.PARK_Y),0,1);
 return SLICE.lerp(D.SHAFT.x0,D.SLOT_XW,t);
};

/* Caprock plateau surface Y(x, z) for z <= upperCliffZ */
SLICE.platY=function(x,z,dd){
 const D=SLICE.DIM,top=SLICE.ctop(x);
 const backT=SLICE.clamp((z-D.ZBK)/220,0,1);
 const und=6*(SLICE.fbm2(x*0.0045,z*0.0045,43,3)-0.5)*SLICE.clamp((-z-24)/60,0,1);
 const sc=dd>0?0.35*SLICE.scarCut(x,top,dd):0;
 return (top+und)*(0.35+0.65*backT)-sc;
};

/* Lower stratified bench top surface Y(x, z) for z in [0, 186] outside the central slot */
SLICE.benchSurfaceY=function(x,z,dd){
 const base=SLICE.benchCapY(x);
 const und=1.6*(SLICE.fbm2(x*0.012,z*0.012,51,2)-0.5);
 const spoil=(dd>0)?2.2*Math.exp(-Math.pow((x+205)/52,2))*Math.exp(-Math.pow((z-96)/48,2)):0;
 return base+und+spoil;
};

/* Far canyon wall across the foreground gorge river (+z) */
SLICE.farWallY=function(x,z){
 const D=SLICE.DIM;
 if(z<=D.FAR_Z0)return 0;
 const t=SLICE.clamp((z-D.FAR_Z0)/(D.FAR_Z1-D.FAR_Z0),0,1);
 const step=t-0.32*Math.sin(t*Math.PI*4)/(Math.PI*4);
 const rim=D.FAR_H*(0.80+0.20*SLICE.fbm2(x*0.0028,2.3,59,2));
 const gull=18*(SLICE.fbm2(x*0.014,z*0.014,61,3)-0.5)*Math.sin(t*Math.PI);
 return Math.max(0,rim*Math.pow(step,0.74)+gull);
};

/* Ground truth surface height Y(x, z, dd) for core/water and KRUINS.watch */
SLICE.groundY=function(x,z,dd){
 const D=SLICE.DIM;
 if(z>=D.FAR_Z0)return SLICE.farWallY(x,z);
 if(z>=D.RIVER_Z0){
  const u=(z-D.RIVER_Z0)/(D.RIVER_Z1-D.RIVER_Z0);
  const bank=Math.pow(Math.abs(u-0.5)*2,3.0);
  return 0.6+6.0*bank+0.7*(SLICE.fbm2(x*0.02,z*0.02,67,2)-0.5);
 }
 if(z>=D.BENCH_Z1){
  /* Foreground shore bench between bench cliff toe (z = 186) and river edge (z = 214) */
  const t=SLICE.clamp((D.RIVER_Z0-z)/(D.RIVER_Z0-D.BENCH_Z1),0,1);
  const spoil=(dd>0)?1.8*Math.exp(-Math.pow((x+110)/65,2)):0;
  return 6.8+3.8*t+spoil;
 }
 /* On the West or East Stratified Bench shoulders (outside the central slot, in front of the upper cliff) */
 if(z>=8&&x<=D.SLOT_XW-6)return SLICE.benchSurfaceY(x,z,dd);
 if(z>=8&&x>=D.DWALL.xBack+6)return SLICE.benchSurfaceY(x,z,dd);
 /* Inside the central slot trench & cliff core: bedrock datum is y = 0 (Automated Industries base) */
 return 0;
};

/* Test whether plateau point (x, z) lies inside one of the excavated skylight wells or transit portals */
SLICE.inPlateauHole=function(x,z){
 /* 1. Great Hexagonal Skylight Court (cx = 0, cz = -205, R = 66) */
 const dxH=Math.abs(x),dzH=Math.abs(z+205);
 if(Math.max(dxH*0.866025+dzH*0.5,dzH)<64)return true;
 /* 2. West Circular Residential Drum Well (cx = -196, cz = -168, R = 40) */
 if(Math.hypot(x+196,z+168)<39)return true;
 /* 3. East Public Rotunda Drum Wells (cx = +178, cz = -192, R = 42; cx = +236, cz = -138, R = 28) */
 if(Math.hypot(x-178,z+192)<41)return true;
 if(Math.hypot(x-236,z+138)<27)return true;
 /* 4. North-East Meeting Areas Skylight & Council Drum (box + circle) */
 if(x>=36&&x<=180&&z>=-344&&z<=-272)return true;
 if(Math.hypot(x-198,z+308)<21)return true;
 /* 5. North-Central Polygonal Lightwells from image.png Plan 1 (cx = -68, cz = -296; cx = -6, cz = -326) */
 if(Math.hypot(x+68,z+296)<18)return true;
 if(Math.hypot(x+6,z+326)<22)return true;
 /* 6. Twin Diagonal Inter-City Transportation Trench (from [-220, -182] to [-425, -495], half-width 29 m) */
 const ax=-220,az=-182,bx=-425,bz=-495;
 const vx=bx-ax,vz=bz-az,len2=vx*vx+vz*vz;
 const t=SLICE.clamp(((x-ax)*vx+(z-az)*vz)/len2,0,1);
 if(t>0.01&&t<0.99&&Math.hypot(x-(ax+vx*t),z-(az+vz*t))<28)return true;
 return false;
};

/* ---- Master Plan Generator ---- */
SLICE.plan=function(o){
 o=o||{};
 const D=SLICE.DIM,S=o.seed==null?12420:o.seed;
 const P={
  id:'slice',seed:S,dim:D,
  eyeWings:[],honeycomb:[],fanSteps:[],fanPiers:[],
  shaftBands:[],caverns:[],slotRibs:[],dwallSteps:[],
  skylights:[],portals:[],pools:[],springs:[],
  cores:[],stairs:[],links:[],program:[]
 };

 /* 1. Subterranean Automated Industries Gallery (y = 0..28 m, beneath Sunken Park) */
 P.industries={
  id:'slice.industries',name:'Subterranean Automated Industries and Power Hall',
  x0:-30,x1:180,y0:0,y1:D.IND_Y1,z0:-44,z1:D.BENCH_Z1,
  bays:6,sluiceX:50,apronZ1:D.APRON_Z1
 };

 /* 2. Deep Sunken Park Slot Canyon (y = 28 m) & Diagonal Light-Veil Ribs */
 P.park={
  id:'slice.park',name:'The Deep Sunken Canyon Park',
  x0:-28,x1:D.DWALL.xToe,y0:D.PARK_Y,y1:D.BENCH_Y,z0:-36,z1:182,
  canal:{x0:38,x1:64,z0:-22,z1:174,y:D.PARK_Y,depth:1.8,waterY:27.78}
 };

 /* 3. Battered 26-Storey Dwellings Wall on the East Side of the Sunken Slot (y = 28..232 m) */
 P.dwall={
  id:'slice.dwall',name:'The Battered Canyon Dwellings Wall',
  xToe:D.DWALL.xToe,xCrest:D.DWALL.xCrest,xBack:D.DWALL.xBack,
  y0:D.DWALL.y0,y1:D.DWALL.y1,z0:D.DWALL.z0,z1:D.DWALL.z1,steps:D.DWALL.steps
 };
 const dwStepH=(D.DWALL.y1-D.DWALL.y0)/D.DWALL.steps;
 for(let k=0;k<D.DWALL.steps;k++){
  const sy0=Math.round((D.DWALL.y0+k*dwStepH)*100)/100;
  const sy1=Math.round((D.DWALL.y0+(k+1)*dwStepH)*100)/100;
  P.dwallSteps.push({
   id:'slice.dwall.step.'+k,k:k,
   x0:Math.round(SLICE.dwallWestX(sy0)*10)/10,x1:D.DWALL.xBack,
   y0:sy0,y1:sy1,z0:D.DWALL.z0,z1:D.DWALL.z1
  });
 }
 /* Seven diagonal structural light-veil arch ribs spanning from the Dwellings Wall crest to the Learning Shaft */
 for(let i=0;i<7;i++){
  const rz=Math.round(SLICE.lerp(-20,162,i/6)*10)/10;
  const yShaft=96+(i%2)*14;
  P.slotRibs.push({
   id:'slice.rib.'+i,idx:i,name:'Slot Light-Veil Rib '+(i+1),
   z:rz,from:[D.SHAFT.x1,yShaft,rz],to:[D.DWALL.xCrest+1,D.DWALL.y1-4,rz]
  });
 }

 /* 4. Vertical Learning & Collection Shaft (y = 28..412 m, 36 stacked gallery storeys) */
 P.shaft={
  id:'slice.shaft',name:'The Vertical Learning and Collection Shaft',
  x0:D.SHAFT.x0,x1:D.SHAFT.x1,z0:D.SHAFT.z0,z1:D.SHAFT.z1,
  y0:D.SHAFT.y0,y1:D.SHAFT.y1,tiers:D.SHAFT.tiers,
  collar:Object.assign({id:'slice.shaft.collar'},D.COLLAR)
 };
 const shStep=(D.SHAFT.y1-D.SHAFT.y0-12)/D.SHAFT.tiers;
 for(let k=0;k<D.SHAFT.tiers;k++){
  const by0=Math.round((D.SHAFT.y0+4+k*shStep)*100)/100;
  const by1=Math.round((by0+shStep)*100)/100;
  P.shaftBands.push({
   id:'slice.shaft.tier.'+k,k:k,
   role:k<18?'learning':'collection',
   y0:by0,y1:by1
  });
 }

 /* 5. Four Horizontal Side Specimen Caverns & West Bench Fieldhouse Pavilion (image_2.png centre) */
 P.caverns=[
  {
   id:'slice.cavern.research',key:'research',side:'west',
   name:'Upper-West Rock-Cut Research Cavern',label:'RESEARCH',
   category:'work',kind:'research_cavern',jobs:280,capacity:0,
   tunnel:{x0:-88,x1:-30,y0:344,y1:355,z0:-24,z1:4},
   chamber:{x0:-152,x1:-86,y0:344,y1:374,z0:-34,z1:6,peaks:[-120]}
  },
  {
   id:'slice.cavern.museums',key:'museums',side:'east',
   name:'Mid-East Geological Strata and Fossil Museums',label:'MUSEUMS',
   category:'civic',kind:'museum_cavern',jobs:165,capacity:650,
   tunnel:{x0:30,x1:96,y0:312,y1:323,z0:-24,z1:4},
   chamber:{x0:94,x1:176,y0:312,y1:340,z0:-34,z1:6,peaks:[118,154]}
  },
  {
   id:'slice.cavern.anthro',key:'anthro',side:'west',
   name:'Mid-West Anthropological Collection Cavern',label:'ANTHROPOLOGICAL COLLECTION',
   category:'civic',kind:'anthro_cavern',jobs:155,capacity:580,
   tunnel:{x0:-104,x1:-30,y0:266,y1:278,z0:-24,z1:4},
   chamber:{x0:-184,x1:-102,y0:268,y1:300,z0:-34,z1:6,peaks:[-146]}
  },
  {
   id:'slice.cavern.pavilion',key:'pavilion',side:'west',
   name:'West Stratified Bench Observatory and Fieldhouse',label:'FIELDHOUSE',
   category:'work',kind:'bench_pavilion',jobs:95,capacity:180,
   tunnel:{x0:-66,x1:-30,y0:218,y1:226,z0:8,z1:26},
   chamber:{x0:-120,x1:-64,y0:220,y1:250,z0:6,z1:48,peaks:[-92]}
  }
 ];

 /* 6. Upper Lenticular "Slice" Eye: Dome, Wing Halls, Cellular Honeycomb & Front Radial Fan */
 P.dome=Object.assign({
  id:'slice.dome',name:'The Coffered Geodesic City Center Apse Dome'
 },D.DOME);

 P.eyeWings=[
  {id:'slice.eye.westTip',  key:'westTip',  side:'west',name:'West Eye Cantilevered Studio Terraces',x0:-352,x1:-262,y0:444,y1:476,z0:-64,z1:18},
  {id:'slice.eye.cultural', key:'cultural', side:'west',name:'West Cultural Center Arcade and Saucer Dome',x0:-262,x1:-56,y0:456,y1:500,z0:-118,z1:24,arches:9,domeX:-132,domeR:42},
  {id:'slice.eye.eastCivic',key:'eastCivic',side:'east',name:'East City Center Colonnade and Forum',x0:56,x1:156,y0:456,y1:498,z0:-118,z1:24,arches:5},
  {id:'slice.eye.eastLive', key:'eastLive', side:'east',name:'East Vaulted Living Hall and Porthole Gallery',x0:156,x1:352,y0:442,y1:500,z0:-98,z1:22,portholes:5},
  {id:'slice.eye.belly',    key:'belly',    side:'both',name:'Lower Lenticular Honeycomb Public and Dwelling Tiers',x0:-262,x1:285,y0:410,y1:456,z0:-76,z1:34}
 ];

 /* Deterministic cellular honeycomb modules in the lower belly of the Eye (y = 412..455 m) */
 const nRows=5;
 for(let r=0;r<nRows;r++){
  const cy0=412+r*8.6,cy1=cy0+8.2;
  /* Find horizontal half-span where eyeBotY(x) <= cy0 + 2 */
  for(let bx=-296;bx<=296;bx+=18){
   const cx=bx+9;
   if(SLICE.eyeBotY(cx)>cy0+1.5)continue;
   const lip=SLICE.eyeLipZ(cx);
   const zFront=Math.round((lip-2-(nRows-1-r)*3.6+(SLICE.u(S,301,r,bx+400)-0.5)*4)*10)/10;
   const zBack=Math.round((zFront-18)*10)/10;
   const openFrame=SLICE.u(S,302,r,bx+400)<0.34;
   P.honeycomb.push({
    id:'slice.cell.'+r+'.'+(bx+300),row:r,
    x0:bx+0.6,x1:bx+17.4,y0:cy0,y1:cy1,z0:zBack,z1:zFront,
    open:openFrame,porthole:(r===3&&cx>182&&cx<262)
   });
  }
 }

 /* Semicircular Front Terraced Park & Recreation Amphitheatre Fan (image.png bottom-centre) */
 P.fan={
  id:'slice.fan',name:'Semicircular Radial-Buttressed Park and Recreation Fan',
  cx:D.FAN.cx,cz:D.FAN.cz,r0:D.FAN.r0,r1:D.FAN.r1,y0:D.FAN.y0,y1:D.FAN.y1
 };
 for(let s=0;s<D.FAN.steps;s++){
  const t0=s/D.FAN.steps,t1=(s+1)/D.FAN.steps;
  P.fanSteps.push({
   id:'slice.fan.step.'+s,s:s,
   rIn:Math.round(SLICE.lerp(D.FAN.r0,D.FAN.r1,t0)*10)/10,
   rOut:Math.round(SLICE.lerp(D.FAN.r0,D.FAN.r1,t1)*10)/10,
   y:Math.round(SLICE.lerp(D.FAN.y1,D.FAN.y0+8,t0)*10)/10
  });
 }
 for(let p=0;p<D.FAN.piers;p++){
  const ang=SLICE.lerp(-Math.PI*0.44,Math.PI*0.44,p/(D.FAN.piers-1));
  P.fanPiers.push({
   id:'slice.fan.pier.'+p,p:p,ang:Math.round(ang*1000)/1000
  });
 }

 /* 7. Excavated Rear Chambers, Plateau Skylight Courts & Twin Transport Portals (image.png Plan 1 & 3) */
 P.skylights=[
  {id:'slice.rear.hex',      key:'hex',      kind:'hexagon',name:'The Great Hexagonal Skylight Commercial and Promenade Court',cx:0,cz:-205,r:68,rSky:24,y0:464,y1:562},
  {id:'slice.rear.horseshoe',key:'horseshoe',kind:'arc',    name:'Concentric Cave Dwellings Horseshoe Arcs',cx:0,cz:-90,rIn:66,rOut:138,y0:456,y1:504},
  {id:'slice.rear.resW',     key:'resW',     kind:'drum',   name:'West Circular Residential Skylight Drum',cx:-196,cz:-168,r:42,rSky:19,y0:468,y1:562},
  {id:'slice.rear.pubE1',    key:'pubE1',    kind:'drum',   name:'East Great Public Rotunda Skylight Drum',cx:178,cz:-192,r:44,rSky:20,y0:468,y1:562},
  {id:'slice.rear.pubE2',    key:'pubE2',    kind:'drum',   name:'Outer-East Public Forum Skylight Drum',cx:236,cz:-138,r:30,rSky:13,y0:468,y1:562},
  {id:'slice.rear.meeting',  key:'meeting',  kind:'hall',   name:'North-East Vaulted Meeting Areas Hypostyle Hall',x0:32,x1:184,z0:-348,z1:-268,y0:472,y1:564,council:{cx:198,cz:-308,r:22}}
 ];

 P.portals=[
  {id:'slice.portal.west',name:'Inter-City Transportation West Guideway Portal',from:[-234,-192],to:[-434,-502],w:16,y0:476,y1:562},
  {id:'slice.portal.east',name:'Inter-City Transportation East Guideway Portal',from:[-206,-172],to:[-406,-482],w:16,y0:476,y1:562}
 ];

 /* 8. Water Basins & Artesian Springs (for core/water) */
 P.pools=[
  {
   id:'slice.pool.parkCanal',partId:'slice.park',zone:'trench',side:'both',
   name:'The Sunken Park Reflecting Canal',
   x0:38,x1:64,z0:-22,z1:174,y:28,depth:1.8,waterY:27.78
  },
  {
   id:'slice.pool.fanBasin',partId:'slice.fan',zone:'eye',side:'east',
   name:'The Front Amphitheatre Reflecting Pool',
   x0:-28,x1:28,z0:26,z1:52,y:450,depth:1.5,waterY:449.8
  },
  {
   id:'slice.pool.hexMirror',partId:'slice.rear.hex',zone:'rear',side:'east',
   name:'The Hexagonal Skylight Mirror Basin',
   x0:-16,x1:16,z0:-221,z1:-189,y:464,depth:1.4,waterY:463.8
  },
  {
   id:'slice.pool.eastCistern',partId:'slice.rear.pubE1',zone:'rear',side:'east',
   name:'East Rotunda Sanctuary Fountain Basin',
   x0:166,x1:190,z0:-204,z1:-180,y:468,depth:1.4,waterY:467.8
  }
 ];

 P.springs=[
  {id:'slice.spring.parkFall',name:'The Sunken Park Outfall Cascade',lipA:[42,27.6,184],lipB:[60,27.6,184],drop:21.5},
  {id:'slice.spring.sluice',  name:'Automated Industries Cooling Sluice',lipA:[-12,12.5,186],lipB:[4,12.5,186],drop:6.4}
 ];

 /* 9. Vertical & Horizontal Circulation Cores, Stairs & Graph Links */
 P.cores=[
  {id:'slice.core.gorge.sluice',sys:'trench',name:'Gorge Apron to Automated Industries Ramp',x:50,z:184,r:6.5,y0:6,y1:28},
  {id:'slice.core.dwall.lift',  sys:'trench',name:'Battered Dwellings Wall Inclined Lift',x:152,z:48,r:6.0,y0:28,y1:232},
  {id:'slice.core.shaft.low',   sys:'shaft', name:'Lower Learning Shaft Express Core',x:0,z:-8,r:7.5,y0:0,y1:236},
  {id:'slice.core.shaft.neck',  sys:'shaft', name:'Mid-Shaft Transfer Core (y = 220..272)',x:0,z:-8,r:7.5,y0:220,y1:272},
  {id:'slice.core.shaft.high',  sys:'shaft', name:'Upper Collection to Eye Collar Core',x:0,z:-8,r:8.0,y0:266,y1:458},
  {id:'slice.core.hex.drums',   sys:'rear',  name:'Hexagonal Court Vertical Struct Drums',x:0,z:-205,r:11.0,y0:456,y1:560},
  {id:'slice.core.portal.transit',sys:'rear',name:'Inter-City Portal Escalator Concourse',x:-212,z:-176,r:9.0,y0:468,y1:560}
 ];
 P.stairs=[
  {id:'slice.stair.shaft.west',side:'west',x:-22,z:4,w:5.5,y0:220,y1:272},
  {id:'slice.stair.shaft.east',side:'east',x: 22,z:4,w:5.5,y0:220,y1:272},
  {id:'slice.stair.park.east', side:'east',x:134,z:96,w:7.0,y0:28,y1:232}
 ];

 const link=(a,b,via)=>P.links.push({a:a,b:b,via:via});
 /* Lower Gorge -> Automated Industries -> Sunken Park -> Battered Dwellings Wall -> Lower Shaft & Bench Pavilion */
 link('entry.gorge','slice.industries','slice.core.gorge.sluice');
 link('slice.industries','slice.park','slice.core.shaft.low');
 link('slice.park','slice.dwall','slice.stair.park.east');
 link('slice.dwall','slice.park','slice.core.dwall.lift');
 link('slice.industries','slice.shaft','slice.core.shaft.low');
 link('slice.shaft','slice.cavern.pavilion','slice.cavern.pavilion.tunnel');
 /* The Mid-Shaft Neck (y = 220..272 m): the ONLY links between the lower trench/shaft and the Upper Eye Sanctuary */
 link('slice.shaft','slice.upperShaft','slice.core.shaft.neck');
 link('slice.shaft','slice.upperShaft','slice.stair.shaft.west');
 link('slice.shaft','slice.upperShaft','slice.stair.shaft.east');
 /* Upper Shaft -> Specimen Caverns (Anthro, Museums, Research) -> Upper Eye Dome & Wings */
 link('slice.upperShaft','slice.cavern.anthro','slice.cavern.anthro.tunnel');
 link('slice.upperShaft','slice.cavern.museums','slice.cavern.museums.tunnel');
 link('slice.upperShaft','slice.cavern.research','slice.cavern.research.tunnel');
 link('slice.upperShaft','slice.dome','slice.core.shaft.high');
 link('slice.dome','slice.eye.belly','slice.core.shaft.high');
 link('slice.dome','slice.fan','slice.fan.concourse');
 link('slice.dome','slice.eye.cultural','slice.eye.promW');
 link('slice.eye.cultural','slice.eye.westTip','slice.eye.westWalk');
 link('slice.dome','slice.eye.eastCivic','slice.eye.promE');
 link('slice.eye.eastCivic','slice.eye.eastLive','slice.eye.eastWalk');
 /* Upper Eye <-> Excavated Rear Chambers <-> Plateau Rim & Transport Portals */
 link('slice.dome','slice.rear.horseshoe','slice.rear.apseGate');
 link('slice.rear.horseshoe','slice.rear.hex','slice.rear.hexGate');
 link('slice.eye.cultural','slice.rear.resW','slice.rear.westGate');
 link('slice.rear.resW','slice.portal.west','slice.core.portal.transit');
 link('slice.rear.resW','slice.portal.east','slice.core.portal.transit');
 link('slice.eye.eastCivic','slice.rear.pubE1','slice.rear.eastGate');
 link('slice.rear.pubE1','slice.rear.pubE2','slice.rear.pubGallery');
 link('slice.rear.hex','slice.rear.meeting','slice.rear.meetingGallery');
 link('entry.plateau','slice.rear.hex','slice.core.hex.drums');
 link('entry.plateau','slice.portal.west','slice.core.portal.transit');

 /* 10. Interior Program Blueprint: Work, Live, Recreation, and Civic units (~13 000 population over 34 ha) */
 const addProg=u=>{
  const storeys=u.storeys==null?1:u.storeys;
  const planM2=u.shape==='circle'?(Math.PI*u.r*u.r):((u.x1-u.x0)*(u.z1-u.z0));
  const gross=Math.round(planM2*storeys*(u.fill==null?0.80:u.fill));
  const litFrac=u.litFrac==null?1:u.litFrac;
  const lit=Math.round(gross*litFrac);
  const cap=u.category==='live'?Math.round(lit*D.SHARE_LIT/D.M2_PER_PERSON):(u.capacity==null?0:u.capacity);
  const jobs=u.jobs==null?0:u.jobs;
  P.program.push(Object.assign({},u,{storeys:storeys,grossM2:gross,litM2:lit,capacity:cap,jobs:jobs}));
 };

 /* A. Subterranean Automated Industries (y = 0..28 m: WORK, zero daylight housing) */
 addProg({
  id:'slice.prog.ind.power',partId:'slice.industries',zone:'subterranean_work',category:'work',kind:'automated_power',
  name:'Automated Geothermal, Hydro-Turbine and Climate Plant',
  shape:'box',x0:-28,x1:46,z0:-40,z1:180,y0:0,y1:27,storeys:3,fill:0.78,litFrac:0,jobs:180,waterSide:'both',
  note:'Air-tight climate-controlled power, air-draft exchange, and water recycling plant beneath the canyon floor'
 });
 addProg({
  id:'slice.prog.ind.fab',partId:'slice.industries',zone:'subterranean_work',category:'work',kind:'automated_industries',
  name:'Automated Industries Cybernetic Synthesis and Freight Hall',
  shape:'box',x0:48,x1:176,z0:-40,z1:180,y0:0,y1:27,storeys:3,fill:0.82,litFrac:0,jobs:260,waterSide:'both',
  note:'Soleri automated production bays freeing surface and cliff chambers from heavy industrial machinery'
 });

 /* B. Deep Sunken Park & Battered Dwellings Wall (y = 28..232 m: RECREATION + LIVE) */
 addProg({
  id:'slice.prog.park.floor',partId:'slice.park',zone:'sunken_trench',category:'recreation',kind:'canyon_park',
  name:'Sunken Slot Canyon Park, Canal Walk and Grove',
  shape:'box',x0:-26,x1:130,z0:-32,z1:180,y0:28,y1:36,storeys:1,fill:0.92,litFrac:1.0,capacity:1400,jobs:35,waterSide:'both',
  note:'Sheltered 192 m-deep microclimate canyon floor with reflecting canal, bridges, and shade trees'
 });
 addProg({
  id:'slice.prog.dwall.low',partId:'slice.dwall',zone:'sunken_trench',category:'live',kind:'battered_dwellings',
  name:'Battered Canyon Dwellings Wall Lower Tiers (Storeys 1-13)',
  shape:'box',x0:132,x1:176,z0:-32,z1:176,y0:28,y1:130,storeys:13,fill:0.74,litFrac:0.88,waterSide:'both',
  note:'West-facing stepped terrace apartments looking onto the Sunken Park and reflecting canal'
 });
 addProg({
  id:'slice.prog.dwall.high',partId:'slice.dwall',zone:'sunken_trench',category:'live',kind:'battered_dwellings',
  name:'Battered Canyon Dwellings Wall Upper Tiers (Storeys 14-26)',
  shape:'box',x0:146,x1:176,z0:-32,z1:176,y0:130,y1:232,storeys:13,fill:0.74,litFrac:0.92,waterSide:'both',
  note:'Upper stepped residences rising above the canyon shade into direct western sun beneath the wind-hood crest'
 });

 /* C. Vertical Learning & Collection Shaft + Four Side Caverns (y = 28..412 m: WORK + CIVIC) */
 addProg({
  id:'slice.prog.shaft.learning',partId:'slice.shaft',zone:'shaft',category:'work',kind:'learning_shaft',
  name:'Lower Vertical Shaft Learning Studios and Seminar Galleries',
  shape:'box',x0:-26,x1:26,z0:-32,z1:16,y0:32,y1:220,storeys:18,fill:0.75,litFrac:0.86,jobs:920,capacity:1600,waterSide:'both',
  note:'Eighteen stacked vertical university and pedagogical studio levels linking park and upper city'
 });
 addProg({
  id:'slice.prog.shaft.collection',partId:'slice.upperShaft',zone:'shaft',category:'work',kind:'collection_shaft',
  name:'Upper Vertical Shaft World-History and Specimen Collection',
  shape:'box',x0:-26,x1:26,z0:-32,z1:16,y0:266,y1:406,storeys:15,fill:0.76,litFrac:0.88,jobs:780,capacity:1200,waterSide:'east',
  note:'Fifteen stacked stratigraphic archive and specimen study tiers directly feeding the side cliff caverns'
 });
 for(const cv of P.caverns){
  const ch=cv.chamber;
  addProg({
   id:'slice.prog.cavern.'+cv.key,partId:cv.id,zone:'specimen_caverns',category:cv.category,kind:cv.kind,
   name:cv.name,shape:'box',x0:ch.x0,x1:ch.x1,z0:ch.z0,z1:ch.z1,y0:ch.y0,y1:ch.y1,
   storeys:4,fill:0.72,litFrac:0.78,jobs:cv.jobs,capacity:cv.capacity,
   waterSide:cv.key==='anthro'?'west':'east',
   note:'Rock-cut fossil and geological strata cavern exposed to cliff daylight and linked horizontally to the Shaft'
  });
 }

 /* D. Upper Lenticular "Slice" Eye: Dome, Wing Halls, Honeycomb & Front Park Fan */
 addProg({
  id:'slice.prog.dome.nave',partId:'slice.dome',zone:'eye',category:'civic',kind:'ecumenical_dome',
  name:'The Coffered Geodesic City Center Ecumenical Rotunda',
  shape:'circle',cx:0,cz:-18,r:44,y0:456,y1:512,storeys:4,fill:0.70,litFrac:0.96,capacity:2800,jobs:140,waterSide:'east',
  note:'Monumental coffered hemispherical apse dome under the cave vault for ecumenical assembly and civic life'
 });
 addProg({
  id:'slice.prog.eye.cultural',partId:'slice.eye.cultural',zone:'eye',category:'civic',kind:'cultural_center',
  name:'West Cultural Center Arched Promenade and Saucer Dome',
  shape:'box',x0:-258,x1:-58,z0:-92,z1:20,y0:456,y1:496,storeys:5,fill:0.74,litFrac:0.92,capacity:1500,jobs:310,waterSide:'west',
  note:'Theatres, ateliers, music halls and libraries along the west lenticular arcade'
 });
 addProg({
  id:'slice.prog.eye.westTip',partId:'slice.eye.westTip',zone:'eye',category:'live',kind:'eye_studios',
  name:'West Eye Tip Cantilevered Atelier Residences',
  shape:'box',x0:-348,x1:-262,z0:-54,z1:16,y0:446,y1:474,storeys:5,fill:0.76,litFrac:0.95,waterSide:'west',
  note:'Tapered western tip studio flats cantilevered out into the razor point of the cliff slice'
 });
 addProg({
  id:'slice.prog.eye.eastCivic',partId:'slice.eye.eastCivic',zone:'eye',category:'civic',kind:'city_forum',
  name:'East City Center Colonnade and Public Commons',
  shape:'box',x0:58,x1:154,z0:-92,z1:20,y0:456,y1:494,storeys:4,fill:0.72,litFrac:0.92,capacity:1100,jobs:220,waterSide:'east',
  note:'Civic forum, refectories, and arcaded promenade east of the central coffered dome'
 });
 addProg({
  id:'slice.prog.eye.eastLive',partId:'slice.eye.eastLive',zone:'eye',category:'live',kind:'vaulted_living',
  name:'East Vaulted Living Hall and Porthole Residences',
  shape:'box',x0:156,x1:346,z0:-74,z1:20,y0:444,y1:496,storeys:8,fill:0.78,litFrac:0.94,waterSide:'east',
  note:'Eight storeys of sunlit terrace apartments under the east cave vault and five circular porthole oculi'
 });
 addProg({
  id:'slice.prog.eye.bellyLiveW',partId:'slice.eye.belly',zone:'eye',category:'live',kind:'honeycomb_dwellings',
  name:'Lower Eye Cellular Honeycomb Dwellings (West Crescent)',
  shape:'box',x0:-255,x1:-32,z0:-52,z1:30,y0:414,y1:455,storeys:6,fill:0.74,litFrac:0.90,waterSide:'west',
  note:'Stepped Brutalist cellular apartment modules projecting along the cantilevered lower lip of the eye'
 });
 addProg({
  id:'slice.prog.eye.bellyLiveE',partId:'slice.eye.belly',zone:'eye',category:'live',kind:'honeycomb_dwellings',
  name:'Lower Eye Cellular Honeycomb Dwellings (East Crescent)',
  shape:'box',x0:32,x1:275,z0:-52,z1:30,y0:414,y1:455,storeys:6,fill:0.74,litFrac:0.92,waterSide:'east',
  note:'Sun-trap south-facing cellular apartments and loggias cantilevered over the 400 m cliff drop'
 });
 addProg({
  id:'slice.prog.eye.bellyPub',partId:'slice.dome',zone:'eye',category:'recreation',kind:'suspended_commons',
  name:'Central Eye Belly Public Concourse and Overlook',
  shape:'box',x0:-32,x1:32,z0:-46,z1:28,y0:412,y1:455,storeys:5,fill:0.82,litFrac:0.90,capacity:900,jobs:85,waterSide:'east',
  note:'Suspended central transfer concourse and glass canyon-floor overlook directly above the Learning Shaft'
 });
 addProg({
  id:'slice.prog.fan.park',partId:'slice.fan',zone:'eye',category:'recreation',kind:'amphitheatre_fan',
  name:'Front Semicircular Terraced Park and Recreation Amphitheatre',
  shape:'circle',cx:0,cz:52,r:74,y0:418,y1:454,storeys:2,fill:0.86,litFrac:1.0,capacity:2200,jobs:48,waterSide:'east',
  note:'Five semicircular planted terraces and reflecting basin cantilevered on seven radial stone buttress piers'
 });

 /* E. Excavated Rear Chambers, Skylight Courts & Transport Portals (image.png Plan 1 & 3) */
 addProg({
  id:'slice.prog.rear.horseshoe',partId:'slice.rear.horseshoe',zone:'rear_excavated',category:'live',kind:'cave_dwellings_arc',
  name:'Concentric Horseshoe Cave-Dwelling Terraces',
  shape:'box',x0:-128,x1:128,z0:-158,z1:-64,y0:456,y1:502,storeys:6,fill:0.74,litFrac:0.86,waterSide:'east',
  note:'Four concentric curved bands of rock-sheltered dwellings stepped between the Eye vault and Hexagonal Skylight'
 });
 addProg({
  id:'slice.prog.rear.hexComm',partId:'slice.rear.hex',zone:'rear_excavated',category:'work',kind:'hex_commercial',
  name:'Hexagonal Skylight Court Commercial Galleries and Craft Souk',
  shape:'circle',cx:0,cz:-205,r:62,y0:464,y1:496,storeys:4,fill:0.68,litFrac:0.90,jobs:640,capacity:950,waterSide:'east',
  note:'Midlevel hexagonal commercial arcades and six vertical-struct lift drums around the central skylight well'
 });
 addProg({
  id:'slice.prog.rear.hexLive',partId:'slice.rear.hex',zone:'rear_excavated',category:'live',kind:'hex_dwellings',
  name:'Hexagonal Skylight Upper Promenade Residences',
  shape:'circle',cx:0,cz:-205,r:64,y0:496,y1:556,storeys:6,fill:0.58,litFrac:0.92,waterSide:'east',
  note:'Stepped hexagonal housing galleries terraced back toward the plateau skylight rim'
 });
 addProg({
  id:'slice.prog.rear.hexProm',partId:'slice.rear.hex',zone:'rear_excavated',category:'recreation',kind:'skylight_promenade',
  name:'Hexagonal Skylight Mirror Court and Rim Promenade',
  shape:'circle',cx:0,cz:-205,r:32,y0:464,y1:562,storeys:2,fill:0.85,litFrac:1.0,capacity:750,jobs:22,waterSide:'east',
  note:'Sunlit hexagonal atrium floor with mirror basin and six-sided plateau rim walk'
 });
 addProg({
  id:'slice.prog.rear.resW',partId:'slice.rear.resW',zone:'rear_excavated',category:'live',kind:'drum_residences',
  name:'West Circular Skylight Drum Residences',
  shape:'circle',cx:-196,cz:-168,r:40,y0:468,y1:556,storeys:8,fill:0.68,litFrac:0.92,waterSide:'west',
  note:'Radial rock-cut apartment drum lit by a 38 m circular plateau lightwell adjacent to the transit hub'
 });
 addProg({
  id:'slice.prog.rear.pubE1',partId:'slice.rear.pubE1',zone:'rear_excavated',category:'civic',kind:'public_rotunda',
  name:'East Great Public Rotunda and Sanctuary Fountain Hall',
  shape:'circle',cx:178,cz:-192,r:42,y0:468,y1:558,storeys:4,fill:0.70,litFrac:0.94,capacity:1100,jobs:95,waterSide:'east',
  note:'Colonnaded circular civic rotunda open to the plateau sky and fed by the East Plateau Cistern'
 });
 addProg({
  id:'slice.prog.rear.pubE2',partId:'slice.rear.pubE2',zone:'rear_excavated',category:'recreation',kind:'public_baths',
  name:'Outer-East Rotunda Thermal Court and Garden Well',
  shape:'circle',cx:236,cz:-138,r:28,y0:468,y1:558,storeys:3,fill:0.78,litFrac:0.96,capacity:520,jobs:34,waterSide:'east',
  note:'Radiant-heated winter garden and thermal bath court inside the outer-east drum'
 });
 addProg({
  id:'slice.prog.rear.meeting',partId:'slice.rear.meeting',zone:'rear_excavated',category:'civic',kind:'meeting_hall',
  name:'North-East Vaulted Meeting Areas Hypostyle Hall and Council Drum',
  shape:'box',x0:32,x1:212,z0:-348,z1:-268,y0:472,y1:556,storeys:3,fill:0.72,litFrac:0.88,capacity:2400,jobs:110,waterSide:'east',
  note:'Pillared subterranean assembly hall and circular council chamber crowned by plateau skylight shells'
 });
 addProg({
  id:'slice.prog.portal.transit',partId:'slice.portal.west',zone:'rear_excavated',category:'work',kind:'intercity_transit',
  name:'Twin Diagonal Inter-City Transportation Concourse and Depots',
  shape:'box',x0:-340,x1:-204,z0:-360,z1:-172,y0:476,y1:512,storeys:2,fill:0.52,litFrac:0.75,jobs:240,capacity:800,waterSide:'west',
  note:'Twin NW diagonal high-speed rail and glider guideway portals linking Slice across the plateau'
 });

 /* 11. Aggregate Statistics */
 const byCat={live:{gross:0,lit:0,count:0},work:{gross:0,lit:0,count:0},recreation:{gross:0,lit:0,count:0},civic:{gross:0,lit:0,count:0}};
 let totGross=0,totLit=0,totPop=0,totJobs=0,totRecCap=0,openParkM2=0;
 for(const u of P.program){
  const c=byCat[u.category];
  c.gross+=u.grossM2;c.lit+=u.litM2;c.count++;
  totGross+=u.grossM2;totLit+=u.litM2;
  totPop+=u.category==='live'?u.capacity:0;
  totJobs+=u.jobs;
  if(u.category==='recreation')totRecCap+=u.capacity;
  if(u.kind==='canyon_park'||u.kind==='amphitheatre_fan'||u.kind==='skylight_promenade'||u.kind==='public_baths'){
   openParkM2+=u.grossM2;
  }
 }
 let poolWaterM2=0;
 for(const pl of P.pools)poolWaterM2+=(pl.x1-pl.x0)*(pl.z1-pl.z0);
 P.stats={
  height:D.CT0,eyeCrown:D.EYE.yTop,eyeSill:D.EYE.yBot,benchHeight:D.BENCH_Y,
  surfaceCoveredHa:D.SURFACE_COVERED_HA,
  sheetPopulation:D.SHEET_POP,
  population:totPop,
  densityPerHa:Math.round(totPop/D.SURFACE_COVERED_HA),
  grossFloorM2:totGross,grossFloorHa:Math.round(totGross/100)/100,
  litFloorM2:totLit,litFloorHa:Math.round(totLit/100)/100,
  jobs:totJobs,recreationCapacity:totRecCap,
  openParkHa:Math.round(openParkM2/100)/100,
  poolWaterM2:Math.round(poolWaterM2),
  pools:P.pools.length,caverns:P.caverns.length,shaftTiers:D.SHAFT.tiers,dwallSteps:D.DWALL.steps,
  programUnits:P.program.length,
  byCategory:byCat
 };
 return P;
};

/* The mid-shaft Neck cuts (y = 220..266 m) separating the Sunken Trench from the Upper Eye & Skylight Sanctuary */
SLICE.NECK_CUTS=function(){
 return [
  'slice.core.shaft.neck',
  'slice.stair.shaft.west',
  'slice.stair.shaft.east'
 ];
};

/* ---- Ruin Deltas by Stable ID (d = 1) ---- */
SLICE.ruin=function(P){
 const S=P.seed,U=SLICE.u;
 const R={
  id:'slice.ruin',
  /* 1. Outer West Eye Tip (x < -262 m) sheared off by a columnar-joint rockfall */
  eyeWestCutX:P.dim.EYE.ruinCutX,
  /* 2. Mid-Shaft blowout between y = 226 m and y = 264 m severs the vertical lift & stair neck */
  shaftBreach:{y0:226,y1:264},
  goneRibs:['slice.rib.1','slice.rib.4'],
  brokenStairs:['slice.stair.shaft.west','slice.stair.shaft.east'],
  blockedCores:[
   'slice.core.shaft.neck',
   'slice.eye.westWalk',
   'slice.rear.westGate'
  ],
  damagedParts:['slice.eye.cultural','slice.cavern.anthro','slice.rear.resW'],
  /* 3. Wild cascades from the breached Anthropological Cavern onto the West Bench and down into the Sunken Park */
  wildCascades:[
   {name:'The Anthropological Cavern Breach Fall',lipA:[-126,268,5],lipB:[-110,268,5],drop:47.8,plungeY:220.2},
   {name:'The West Slot Rim Wild Cascade',lipA:[-48,219.5,58],lipB:[-32,219.5,58],drop:191.5,plungeY:28.1}
  ],
  /* 4. Seated architectural wrecks (< 22 m tall) on the West Stratified Bench (y ~ 220) and Foreground Shore (y ~ 8..10) */
  wrecks:[]
 };
 const WPOS=[
  {id:'slice.wreck.cell.0',kind:'eye_cell',    x:-212,z:82, w:17,h:9.5, d:14,yaw:0.38, tilt:0.22},
  {id:'slice.wreck.cell.1',kind:'eye_cell',    x:-176,z:118,w:15,h:8.5, d:13,yaw:1.15, tilt:-0.18},
  {id:'slice.wreck.col.0', kind:'basalt_col',  x:-238,z:112,r:6.2,h:18,      yaw:0.92, tilt:1.28},
  {id:'slice.wreck.arch.0',kind:'dome_rib',    x:-96, z:201,w:19,h:8.0, d:11,yaw:0.24, tilt:0.16},
  {id:'slice.wreck.rib.0', kind:'slot_truss',  x: 18, z:199,w:21,h:7.0, d:9, yaw:-0.48,tilt:0.19},
  {id:'slice.wreck.col.1', kind:'basalt_col',  x: 112,z:202,r:5.6,h:15,      yaw:2.10, tilt:1.32}
 ];
 for(let i=0;i<WPOS.length;i++){
  const w=WPOS[i];
  R.wrecks.push(Object.assign({},w,{jitter:(U(S,820,i,0)-0.5)*0.12}));
 }
 return R;
};

/* ---- Circulation Graph Reachability ---- */
SLICE.blockedCarriers=function(RU){
 if(!RU)return new Set();
 return new Set([].concat(RU.brokenStairs||[],RU.blockedCores||[]));
};

SLICE.reach=function(P,startNodes,blockedSet){
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
SLICE.modernGuide=function(P,RU){
 const ru=RU||SLICE.ruin(P);
 const blk=SLICE.blockedCarriers(ru);
 const fromGorge=SLICE.reach(P,['entry.gorge'],blk);
 const fromPlateau=SLICE.reach(P,['entry.plateau'],blk);
 const dmgSet=new Set(ru.damagedParts||[]);

 const units=[],summary={
  eye_sanctuary:{units:0,liveCap:0,irrigatedM2:0,workM2:0},
  trench_town:{units:0,liveCap:0,workM2:0},
  isolated_west:{units:0,liveCap:0,workM2:0},
  collapsed:{units:0}
 };

 for(const u of P.program){
  let zoneState='isolated_west',modernRole='Rope-access explorer ruin in the fractured west cliff sector';
  if(u.partId==='slice.eye.westTip'){
   zoneState='collapsed';
   modernRole='Sheared off in the West Brow columnar rockfall; cellular blocks lie on the y = 220 m bench below';
   summary.collapsed.units++;
  }else if(fromPlateau.has(u.partId)&&!fromGorge.has(u.partId)){
   const watered=u.waterSide==='east'||u.waterSide==='both';
   const damaged=dmgSet.has(u.partId);
   if(watered&&!damaged){
    zoneState='eye_sanctuary';
    summary.eye_sanctuary.units++;
    summary.eye_sanctuary.liveCap+=u.category==='live'?u.capacity:0;
    summary.eye_sanctuary.workM2+=u.category==='work'?u.grossM2:0;
    if(u.kind==='amphitheatre_fan'||u.kind==='skylight_promenade'||u.kind==='public_baths'){
     summary.eye_sanctuary.irrigatedM2+=u.grossM2;
    }
    modernRole=u.category==='live'?'Kept Upper Eye and Skylight Sanctuary housing (fed by East Cistern, defended above Shaft breach)'
     :u.category==='work'?'Active sanctuary archive, research cavern, or hexagonal craft bazaar'
     :u.category==='civic'?'High Ecumenical Assembly in the Coffered Dome, Museums, and Meeting Hall'
     :'Irrigated front amphitheatre terrace garden and sunlit hexagonal skylight court';
   }else{
    zoneState='isolated_west';
    summary.isolated_west.units++;
    summary.isolated_west.liveCap+=u.category==='live'?u.capacity:0;
    summary.isolated_west.workM2+=u.category==='work'?u.grossM2:0;
    modernRole='Rockfall-scarred west eye arcade or spring-flooded Anthropological Cavern';
   }
  }else if(fromGorge.has(u.partId)){
   zoneState='trench_town';
   summary.trench_town.units++;
   summary.trench_town.liveCap+=u.category==='live'?u.capacity:0;
   summary.trench_town.workM2+=u.category==='work'?u.grossM2:0;
   modernRole='Sunken Canyon Park oasis, Battered Dwellings Wall terraces, and Automated Industries salvage guild';
  }else{
   summary.isolated_west.units++;
   summary.isolated_west.liveCap+=u.category==='live'?u.capacity:0;
   summary.isolated_west.workM2+=u.category==='work'?u.grossM2:0;
  }
  units.push({
   id:u.id,name:u.name,partId:u.partId,category:u.category,kind:u.kind,y0:u.y0,y1:u.y1,
   originalCap:u.capacity,originalJobs:u.jobs,zoneState:zoneState,modernRole:modernRole
  });
 }
 const irrHa=summary.eye_sanctuary.irrigatedM2/10000;
 summary.eye_sanctuary.irrigatedHa=Math.round(irrHa*100)/100;
 summary.eye_sanctuary.sustainableModernPop=Math.round(irrHa*220);
 return {
  gorgeTouchesEye:fromGorge.has('slice.dome'),
  domeReachableFromPlateau:fromPlateau.has('slice.dome'),
  summary:summary,
  units:units
 };
};

/* ---- Deterministic Dress Records (Flora, Vines, Lamps, Boats, Citizens) ---- */
SLICE.dress=function(P,RU){
 const S=P.seed,U=SLICE.u,out=[];

 /* 1. Semicircular Front Park & Recreation Amphitheatre Fan Trees (image.png bottom-centre) */
 for(let s=0;s<P.fanSteps.length;s++){
  const st=P.fanSteps[s],rMid=(st.rIn+st.rOut)*0.5;
  const n=6+s*2;
  for(let j=0;j<n;j++){
   const ang=SLICE.lerp(-Math.PI*0.42,Math.PI*0.42,(j+0.5)/n)+(U(S,201,s,j)-0.5)*0.08;
   const x=Math.sin(ang)*rMid,z=P.fan.cz+Math.cos(ang)*rMid;
   out.push({id:'slice.tree.fan.'+s+'.'+j,kind:'tree',at:[x,st.y+0.35,z],h:6.5+5.5*U(S,202,s,j),sp:(s+j)%3});
  }
 }

 /* 2. Deep Sunken Canyon Park Groves along the Reflecting Canal (y = 28 m) */
 for(let j=0;j<32;j++){
  const eastSide=j%2===0;
  const x=eastSide?(70+U(S,210,j,0)*54):(-20+U(S,210,j,1)*50);
  const z=-18+U(S,211,j,0)*186;
  out.push({id:'slice.tree.park.'+j,kind:'tree',at:[x,P.dim.PARK_Y+0.35,z],h:8.5+8.0*U(S,212,j,0),sp:j%3});
 }

 /* 3. Battered Dwellings Wall Terrace Shrubs/Trees & Skylight Court Groves */
 for(let k=2;k<P.dwallSteps.length;k+=3){
  const st=P.dwallSteps[k];
  for(let j=0;j<3;j++){
   const z=-10+j*68+(U(S,220,k,j)-0.5)*16;
   out.push({id:'slice.tree.dwall.'+k+'.'+j,kind:'tree',at:[st.x0+2.4,st.y1+0.25,z],h:5.0+3.5*U(S,221,k,j),sp:(k+j)%2});
  }
 }
 for(let j=0;j<12;j++){
  const ang=(j/12)*Math.PI*2+0.2;
  const rad=28+14*U(S,230,j,0);
  out.push({id:'slice.tree.hex.'+j,kind:'tree',at:[Math.cos(ang)*rad,464.35,-205+Math.sin(ang)*rad],h:7+5*U(S,231,j,0),sp:j%3});
 }
 for(let j=0;j<6;j++){
  const ang=(j/6)*Math.PI*2;
  out.push({id:'slice.tree.resW.'+j,kind:'tree',at:[-196+Math.cos(ang)*14,468.35,-168+Math.sin(ang)*14],h:6+4*U(S,235,j,0),sp:j%2});
  out.push({id:'slice.tree.pubE.'+j,kind:'tree',at:[ 178+Math.cos(ang)*15,468.35,-192+Math.sin(ang)*15],h:6.5+4*U(S,236,j,0),sp:(j+1)%2});
 }

 /* 4. Glowing Dome & Promenade Lamps + Citizens */
 for(let j=0;j<10;j++){
  const x=-190+j*44;
  if(RU&&x<-195)continue;
  out.push({id:'slice.lamp.prom.'+j,kind:'lamp',at:[x,458.6,18.2],lit:!RU||x>-55});
  if(!RU||x>-40){
   out.push({id:'slice.fig.prom.'+j,kind:'figure',at:[x+4,456.3,14],ry:U(S,250,j,0)*Math.PI*2});
  }
 }
 for(let j=0;j<8;j++){
  const z=-10+j*22;
  out.push({id:'slice.fig.park.'+j,kind:'figure',at:[32+(j%2)*38,28.3,z],ry:U(S,255,j,0)*Math.PI*2});
 }

 /* 5. Foreground Gorge Boats */
 const nBoats=RU?2:4;
 for(let i=0;i<nBoats;i++){
  out.push({
   id:'slice.boat.'+i,kind:'boat',
   at:[-75+i*56,P.dim.WSY+0.15,232+(i%2)*14],
   ry:0.15+(U(S,260,i,0)-0.5)*0.25
  });
 }
 return out;
};
