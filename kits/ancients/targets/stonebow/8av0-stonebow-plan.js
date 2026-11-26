// ================================================================= STONEBOW — Soleri's canyon-bridge arcology: the plan (records)
// Paolo Soleri's "21. Stonebow" (plates 34-36), sited across the Ching-Ma Porphyry Shut-In on Scale Model 5.1 at
// px (1196, 179) in Neo-Ozarks / upper Ria Valley, where the Ancient Outland Gate Highway enters the Ria Valley.
//
// [G data]: plain records with stable ids and pure functions, no three.js, no DOM, no Math.random, no Math.sin hash.
// Every procedural draw comes from KRAND.hash(seed, a, b, c) / KRAND.fbm, independent of call order.
const STONEBOW={};

STONEBOW.SITE={
 id:'stonebow.site.chingma',
 name:'Ching-Ma Porphyry Shut-In',
 map:'5.1',
 px:[1196,179],
 riverId:'9109',
 riverName:'Ching-Ma (Clear-Mirror River)',
 highwayId:'outland',
 highwayName:'Outland Gate Highway',
 regions:['neo-ozarks','ria valley'],
 datumM:1215,          // y = 0 in builder space corresponds to the 1,215 m river bed on map 5.1
 innerRimM:1635,       // y = 420 m canyon rim (the highway & linear-city datum)
 outerRimM:1949,       // bilateral 5.1 porphyry/dolomite plateau shoulders (1,938 / 1,960 m -> 723 m gorge relief)
 dischargeM3s:330,     // 218-440 m3/s perennial karst-fed flow
 koppen:'Cfa',
 meanTempC:22,
 rainMm:1443,
 pressureAtm:1.37
};

// local builder metres (x east along highway, z south upstream along gorge) -> Scale Model 5.1 [px, py] (2,000 m/px)
STONEBOW.toPx=function(x,z){
 return [STONEBOW.SITE.px[0]+x/2000,STONEBOW.SITE.px[1]+z/2000];
};

STONEBOW.DIM={
 SPAN:900,             // rim-to-rim canyon span at y = 420 (x = -450 .. +450)
 LEN:1520,             // built linear-city & highway length (x = -760 .. +760)
 CANYON_L:1520,        // canyon length modeled (z = -760 .. +760)
 THROAT:220,           // clear canyon floor width at y = 0 (x = -110 .. +110)
 RY:420,               // canyon rim & main highway deck height over river bed
 CROWN_Y:570,          // +150 m above rim: apex of Cultural Center skylight crown
 FOOT_Y:120,           // lowest cliff-pier footing (570 - 120 = 450 m total structural height)
 BOW_X:378,            // half-span of the upper X-braced bow megatruss
 BOW_Z0:94,            // half-width of the upper bow at rim level (y = 420)
 BOW_Z1:52,            // half-width of the upper bow at crown level (y = 570)
 ARCH_X:412,           // half-span of the main City Center compression arch
 ARCH_Y0:292,          // springing of the main arch on the canyon walls
 ARCH_Y1:388,          // crown soffit of the main arch under City Center (y = 388 .. 420)
 TOUR_X:192,           // half-span of the suspended lower Tourist Center bridge
 TOUR_Z:54,            // half-width of the suspended Tourist Center bridge
 TOUR_Y0:168,          // soffit keel of Tourist Center over the river (570 - 168 = 402 m depth)
 TOUR_Y1:198,          // top promenade deck of Tourist Center
 HWY_Z:118,            // +/-z centreline of twin parallel Ancient highways
 HWY_W:24,             // width of each highway viaduct
 ULOOP_X:492,          // +/-x centre of semicircular rim turnaround loops
 PYLON_X:350,          // +/-x centre of the four twin-shaft abutment pylons
 PYLON_Z:118,          // +/-z centre of the four twin-shaft abutment pylons
 PYLON_W:46,           // pylon x-width at base
 PYLON_D:42,           // pylon z-depth at base
 PYLON_Y0:248,         // pylon cliff-root base
 PYLON_Y1:516,         // pylon top cap
 STO:4.0,              // standard living-working storey height
 SHARE:0.65,           // share of lit floor area devoted to dwellings
 M2:33                 // gross m2 per person (Soleri arcology compact standard)
};

STONEBOW.u=function(seed,a,b,c){
 return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0,c==null?0:c|0));
};
STONEBOW.rng=function(seed,a,b,c,lo,hi){
 return lo+(hi-lo)*STONEBOW.u(seed,a,b,c);
};

// ---- analytical structural & canyon profiles ----------------------------------------------------------------------
STONEBOW.bowTop=function(x){
 const D=STONEBOW.DIM,ax=Math.abs(x);
 if(ax>=D.BOW_X)return D.RY;
 const t=1-Math.pow(ax/D.BOW_X,1.42);
 return D.RY+(D.CROWN_Y-D.RY)*Math.pow(Math.max(0,t),0.92);
};

STONEBOW.bowHalfZ=function(y){
 const D=STONEBOW.DIM,t=Math.max(0,Math.min(1,(y-D.RY)/(D.CROWN_Y-D.RY)));
 return D.BOW_Z0+(D.BOW_Z1-D.BOW_Z0)*t;
};

STONEBOW.archSoffit=function(x){
 const D=STONEBOW.DIM,ax=Math.abs(x);
 if(ax>=D.ARCH_X)return D.ARCH_Y0;
 const q=ax/D.ARCH_X;
 return D.ARCH_Y1-(D.ARCH_Y1-D.ARCH_Y0)*q*q;
};

// River centreline x(z): gentle S-meander through the shut-in throat, pinned near 0 under the bridge
STONEBOW.riverX=function(z){
 const u=(z+760)/1520;
 const env=0.35+0.65*Math.min(1,Math.abs(z)/260);
 return (KRAND.fbm(u*3.2,0.5,0,2,12401)-0.5)*76*env;
};

STONEBOW.riverW=function(z){
 return 38+10*KRAND.fbm((z+760)/380,1.7,0,2,12402);
};

// Stepped canyon wall x-coordinate at height y (0..RY) on side s (-1 west, +1 east) and upstream coordinate z
STONEBOW.canyonWallX=function(s,z,y){
 const D=STONEBOW.DIM,v=Math.max(0,Math.min(1,y/D.RY));
 // Two dolomite/porphyry karst benches at v ~ 0.33 (y=140) and v ~ 0.67 (y=280)
 const step1=Math.max(0,Math.min(1,(v-0.28)/0.10)),step2=Math.max(0,Math.min(1,(v-0.62)/0.10));
 const baseHalf=D.THROAT*0.5+(D.SPAN*0.5-D.THROAT*0.5)*(0.58*v+0.21*step1+0.21*step2);
 // Shut-in narrows slightly upstream (z < -360) at the porphyry rib
 const narrow=z<-340?24*Math.min(1,(-340-z)/220)*(1-0.6*v):0;
 // Keep wall clean near bridge abutments (|z| < 165) so pylons and arches key cleanly into rock
 const calm=Math.abs(z)<165?0.28:1.0;
 const u=(z+760)/1520;
 const gully=(KRAND.fbm(u*14,v*3.5,s>0?1:0,3,12403)-0.5)*46*calm;
 const rib=(KRAND.fbm(u*5.5,v*9,s>0?2:3,2,12404)-0.5)*18*calm;
 return STONEBOW.riverX(z)*0.35*(1-v)+s*(baseHalf-narrow+gully+rib);
};

// Deterministic canyon & rim plateau height at (x, z)
STONEBOW.groundAt=function(x,z){
 const D=STONEBOW.DIM;
 // Upstream porphyry cataract cliff step above z = -548
 const catLift=z<-548?34*Math.min(1,(-548-z)/10):0;
 const wxW=STONEBOW.canyonWallX(-1,z,0),wxE=STONEBOW.canyonWallX(1,z,0);
 if(x>=wxW&&x<=wxE){
  const rx=STONEBOW.riverX(z),rw=STONEBOW.riverW(z)*0.5;
  const dr=Math.abs(x-rx);
  if(dr<=rw)return 0.6+catLift;
  const bank=Math.min(1,(dr-rw)/28);
  return 1.2+3.4*bank+catLift;
 }
 const s=x<0?-1:1;
 const rimX=STONEBOW.canyonWallX(s,z,D.RY);
 if(s*x>=s*rimX){
  // Outer plateau: flat near the linear city & wings (|z|<320, |x|<760), rising gently further out toward the 723 m porphyry shoulders
  const outX=Math.max(0,(Math.abs(x)-520)/420);
  const outZ=Math.max(0,(Math.abs(z)-310)/450);
  const swell=(KRAND.fbm((x+1000)/320,(z+1000)/320,0,2,12405)-0.5)*8;
  const keepFlat=(Math.abs(x)<750&&Math.abs(z)<155)||(Math.abs(x)>405&&Math.abs(x)<695&&Math.abs(z)<305)?0.15:1.0;
  return D.RY+(58*outX*outX+36*outZ*outZ+swell)*keepFlat;
 }
 // Binary search height y in [0, RY] along the monotone canyon wall profile
 let lo=0,hi=D.RY;
 for(let i=0;i<14;i++){
  const mid=(lo+hi)*0.5,wx=STONEBOW.canyonWallX(s,z,mid);
  if(s*x<s*wx)hi=mid;else lo=mid;
 }
 return (lo+hi)*0.5;
};

// ---- the plan ([G data] records) ----------------------------------------------------------------------------------
STONEBOW.plan=function(o){
 o=o==null?{}:o;
 const D=STONEBOW.DIM,S=o.seed==null?12400:o.seed,U=STONEBOW.u;
 const P={
  id:'stonebow',seed:S,site:STONEBOW.SITE,dim:D,
  pylons:[],highways:[],uloops:[],trusses:[],struts:[],bowTiers:[],wells:[],
  crown:null,cityArch:null,tourist:null,cantilevers:[],vaults:[],mechRoots:[],
  wings:[],park:null,bulkheads:[],dress:[],nodes:[],links:[]
 };

 // 1. Four twin-shaft abutment pylons on the canyon rims
 const pNames=[['nw',-1,-1,'North-West Gate Pylon'],['sw',-1,1,'South-West Gate Pylon'],
               ['ne',1,-1,'North-East Gate Pylon'],['se',1,1,'South-East Gate Pylon']];
 for(const [tag,sx,sz,label] of pNames){
  const px=sx*D.PYLON_X,pz=sz*D.PYLON_Z;
  P.pylons.push({
   id:'stonebow.pylon.'+tag,tag:tag,name:label,sx:sx,sz:sz,
   x:px,z:pz,w0:D.PYLON_W,d0:D.PYLON_D,w1:32,d1:30,
   y0:D.PYLON_Y0,y1:D.PYLON_Y1,
   portal:{y0:D.RY,y1:D.RY+28,w:20},
   shafts:[{id:'stonebow.pylon.'+tag+'.shaft.a',x:px-9,z:pz,r:5.2},
           {id:'stonebow.pylon.'+tag+'.shaft.b',x:px+9,z:pz,r:5.2}]
  });
 }

 // 2. Twin outer highways across the 900 m gorge + rim hairpin U-loops
 for(const [tag,sz,label] of [['n',-1,'North Outland Gate Highway'],['s',1,'South Outland Gate Highway']]){
  P.highways.push({
   id:'stonebow.hwy.'+tag,tag:tag,name:label,
   x0:-D.LEN*0.5,x1:D.LEN*0.5,z:sz*D.HWY_Z,y:D.RY,w:D.HWY_W,thick:4.5,guideway:true
  });
 }
 for(const [tag,sx,label] of [['w',-1,'West Rim Turnaround Loop'],['e',1,'East Rim Turnaround Loop']]){
  P.uloops.push({
   id:'stonebow.uloop.'+tag,tag:tag,name:label,
   cx:sx*D.ULOOP_X,cz:0,r:D.HWY_Z,sx:sx,y:D.RY,w:18,thick:4.0
  });
 }

 // 3. Upper X-braced Living-Working bow megatruss (6 bays across -360..+360 on both faces z = +/-94)
 const nb=6,bx0=-360,bw=720/nb;
 for(let i=0;i<nb;i++){
  const xa=bx0+i*bw,xb=xa+bw,xm=(xa+xb)*0.5;
  const ya=STONEBOW.bowTop(xa),yb=STONEBOW.bowTop(xb),ym=STONEBOW.bowTop(xm);
  for(const sz of [-1,1]){
   const ftag=sz<0?'n':'s';
   P.trusses.push({
    id:'stonebow.truss.'+ftag+'.'+i,bay:i,sz:sz,
    xa:xa,xb:xb,ya0:D.RY,ya1:ya,yb0:D.RY,yb1:yb,ym1:ym,
    z0:sz*D.BOW_Z0,zTopA:sz*STONEBOW.bowHalfZ(ya),zTopB:sz*STONEBOW.bowHalfZ(yb)
   });
  }
 }

 // Stepped Living-Working & Promenade Garden tiers inside & flanking the upper bow (Soleri's 1:500 community stacks)
 const tierHeights=[428,444,460,476,492,510,528];
 for(let ti=0;ti<tierHeights.length;ti++){
  const ty=tierHeights[ti];
  // Find x extent where bowTop(x) >= ty + 8
  let hx=0;
  for(let x=0;x<=D.BOW_X;x+=4){if(STONEBOW.bowTop(x)>=ty+6)hx=x;}
  if(hx<48)continue;
  const hz=STONEBOW.bowHalfZ(ty);
  P.bowTiers.push({
   id:'stonebow.bow.tier.'+ti,tier:ti,y:ty,h:14,
   x0:-hx,x1:hx,zHalf:hz,cantilever:ti%2===0?8.5:5.0,garden:ti%2===0
  });
 }

 // 4. Nine spine Light Wells + Twin Rosette Oculi + Cultural Center Crown
 const wellSpecs=[
  [-282,'rect',34,26,'West Outer Light Well'],
  [-210,'rect',36,28,'West Mid Light Well'],
  [-138,'rect',38,30,'West Inner Light Well'],
  [-58,'rosette',20,20,'West Rosette Oculus'],
  [0,'central',44,36,'Cultural Center Light Well'],
  [58,'rosette',20,20,'East Rosette Oculus'],
  [138,'rect',38,30,'East Inner Light Well'],
  [210,'rect',36,28,'East Mid Light Well'],
  [282,'rect',34,26,'East Outer Light Well']
 ];
 for(let wi=0;wi<wellSpecs.length;wi++){
  const [wx,wkind,ww,wd,wname]=wellSpecs[wi];
  const yTop=STONEBOW.bowTop(wx);
  P.wells.push({
   id:'stonebow.well.'+wi,index:wi,kind:wkind,name:wname,
   x:wx,z:0,w:ww,d:wd,r:ww*0.5,y0:D.RY,y1:yTop,skylightH:wkind==='central'?12:7
  });
 }

 P.crown={
  id:'stonebow.crown',name:'Cultural Center and Skylight Crown',
  x0:-82,x1:82,z0:-50,z1:50,y0:492,y1:D.CROWN_Y,
  skylight:{w:96,d:44,h:14}
 };

 // 5. Main City Center compression arch & 3-storey civic concourse
 P.cityArch={
  id:'stonebow.city',name:'City Center Arch and Civic Concourse',
  x0:-D.ARCH_X,x1:D.ARCH_X,z0:-88,z1:88,
  ySpring:D.ARCH_Y0,yCrown:D.ARCH_Y1,yDeck:D.RY,storeys:3
 };

 // 6. Suspended lower Tourist Center bridge, diagonal cliff struts & cliffside promenade cantilevers
 P.tourist={
  id:'stonebow.tourist',name:'Suspended Tourist Center Bridge',
  x0:-D.TOUR_X,x1:D.TOUR_X,z0:-D.TOUR_Z,z1:D.TOUR_Z,
  y0:D.TOUR_Y0,y1:D.TOUR_Y1,storeys:3
 };

 for(const sx of [-1,1]){
  const stag=sx<0?'w':'e';
  P.mechRoots.push({
   id:'stonebow.mech.'+stag,sx:sx,name:(sx<0?'West':'East')+' Cliff Mechanical Facilities',
   x0:sx<0?-410:334,x1:sx<0?-334:410,z0:-68,z1:68,y0:252,y1:300,delve:true
  });
  for(const sz of [-1,1]){
   const zt=sz<0?'n':'s';
   // Lower diagonal box-strut from cliff mechanical root down to Tourist Center end
   P.struts.push({
    id:'stonebow.strut.low.'+stag+'.'+zt,role:'tourist',sx:sx,sz:sz,
    a:[sx*364,264,sz*44],b:[sx*(D.TOUR_X-10),D.TOUR_Y0+6,sz*44],w:8.5,h:10
   });
   // Upper diagonal compression strut from cliff mechanical root up to main bridge quarter-point
   P.struts.push({
    id:'stonebow.strut.high.'+stag+'.'+zt,role:'arch',sx:sx,sz:sz,
    a:[sx*368,274,sz*72],b:[sx*216,D.RY-6,sz*72],w:9.5,h:11
   });
  }
  // Two stepped canyon-wall cantilever galleries per cliff (Soleri's stepped void framing in plate 36)
  P.cantilevers.push({
   id:'stonebow.cant.'+stag+'.upper',sx:sx,name:(sx<0?'West':'East')+' Upper Canyon Overlook',
   x0:sx<0?-336:246,x1:sx<0?-246:336,z0:-48,z1:48,y0:236,y1:258
  });
  P.cantilevers.push({
   id:'stonebow.cant.'+stag+'.lower',sx:sx,name:(sx<0?'West':'East')+' Lower Canyon Overlook',
   x0:sx<0?-298:208,x1:sx<0?-208:298,z0:-42,z1:42,y0:204,y1:224
  });
 }

 // 7. Cut-and-cover vaulted rim chambers: Warehousing above, Automated Industries (W) & Factories/Utilities (E) below
 for(const sx of [-1,1]){
  const stag=sx<0?'w':'e';
  const roleName=sx<0?'Automated Industries and Warehousing':'Factories, Utilities and Warehousing';
  for(let vi=0;vi<5;vi++){
   const xa=sx*(424+vi*62),xb=sx*(424+(vi+1)*62);
   const x0=Math.min(xa,xb),x1=Math.max(xa,xb);
   P.vaults.push({
    id:'stonebow.vault.'+stag+'.'+vi,sx:sx,index:vi,name:(sx<0?'West ':'East ')+roleName+' Bay '+(vi+1),
    x0:x0,x1:x1,z0:-96,z1:96,y0:338,yMid:376,y1:D.RY,archR:24,delve:true
   });
  }
  // Bulkhead gates at the pylons separating the refurbished bridge city from the deep delving vaults
  P.bulkheads.push({
   id:'stonebow.bulkhead.'+stag,sx:sx,name:(sx<0?'West':'East')+' Vault Bulkhead Gate',
   x:sx*418,y:362,z:0,sealed:true
  });
 }

 // 8. Four splayed polygonal rim neighborhood apron wings with circular amphitheater bowls (plates 34 & 35)
 for(const [tag,sx,sz,label] of [['nw',-1,-1,'North-West Neighborhood Wing'],
                                 ['sw',-1,1,'South-West Neighborhood Wing'],
                                 ['ne',1,-1,'North-East Utilities and Garden Wing'],
                                 ['se',1,1,'South-East Living Terrace Wing']]){
  const poly=[
   [sx*404,sz*140],[sx*692,sz*140],[sx*642,sz*284],[sx*452,sz*298],[sx*384,sz*208]
  ];
  P.wings.push({
   id:'stonebow.wing.'+tag,tag:tag,sx:sx,sz:sz,name:label,
   poly:poly,y0:D.RY,y1:D.RY+26,tiers:3,
   bowls:[
    {id:'stonebow.wing.'+tag+'.bowl.0',cx:sx*496,cz:sz*212,r:38,depth:12},
    {id:'stonebow.wing.'+tag+'.bowl.1',cx:sx*594,cz:sz*202,r:28,depth:10}
   ]
  });
 }

 // 9. Canyon-floor Park & vertical cliff lifts connecting rim, Tourist Center & river floor
 P.park={
  id:'stonebow.park',name:'Ching-Ma Canyon Floor Park',
  z0:-460,z1:520,bridge:{id:'stonebow.park.bridge',z:56,y:5.2,w:8},
  lifts:[
   {id:'stonebow.lift.w',sx:-1,x:-92,z:0,y0:2,y1:D.TOUR_Y0+4,r:5.5,name:'West Gorge Lift'},
   {id:'stonebow.lift.e',sx:1,x:92,z:0,y0:2,y1:D.TOUR_Y0+4,r:5.5,name:'East Gorge Lift'}
  ]
 };

 // 10. Rooftop, terrace & canyon-park flora/garden records (KRAND-seeded by cell, independent of draw count)
 for(let ti=0;ti<P.bowTiers.length;ti++){
  const T=P.bowTiers[ti];
  if(!T.garden)continue;
  const nSlots=Math.floor((T.x1-T.x0)/36);
  for(let k=0;k<nSlots;k++){
   const gx=T.x0+18+k*36+(U(S,501,ti,k)-0.5)*10;
   for(const sz of [-1,1]){
    if(U(S,502,ti*2+(sz>0?1:0),k)<0.28)continue;
    const gz=sz*(T.zHalf+T.cantilever*0.55);
    P.dress.push({
     id:'stonebow.garden.tree.'+ti+'.'+(sz>0?'s':'n')+'.'+k,
     kind:'tree',zone:'bow',at:[gx,T.y+0.4,gz],h:6+5*U(S,503,ti,k)
    });
   }
  }
 }
 // Wing amphitheater garden trees
 for(let wi=0;wi<P.wings.length;wi++){
  const W=P.wings[wi];
  for(let bi=0;bi<W.bowls.length;bi++){
   const Bw=W.bowls[bi];
   for(let j=0;j<8;j++){
    const a=j*Math.PI/4+0.2*U(S,510,wi*2+bi,j),rr=Bw.r*0.72;
    P.dress.push({
     id:Bw.id+'.tree.'+j,kind:'tree',zone:'wing.'+W.tag,
     at:[Bw.cx+Math.cos(a)*rr,D.RY+4,Bw.cz+Math.sin(a)*rr],h:7+5*U(S,511,wi*2+bi,j)
    });
   }
  }
 }
 // Canyon floor park grove trees (kept strictly off the river channel)
 for(let k=0;k<44;k++){
  const pz=-420+k*21+(U(S,520,k,0)-0.5)*10;
  const side=k%2===0?-1:1;
  const rx=STONEBOW.riverX(pz),rw=STONEBOW.riverW(pz)*0.5;
  const px=rx+side*(rw+14+26*U(S,521,k,1));
  const wx=STONEBOW.canyonWallX(side,pz,4);
  if(side*px>side*wx-8)continue;
  P.dress.push({
   id:'stonebow.park.tree.'+k,kind:'tree',zone:'park',
   at:[px,STONEBOW.groundAt(px,pz),pz],h:9+8*U(S,522,k,2)
  });
 }

 // 11. Coarse navigation graph (nodes + links) for reachability verification
 const addN=(id,role,x,y,z,delve)=>P.nodes.push({id:id,role:role,at:[x,y,z],delve:!!delve});
 const addL=(a,b,via)=>P.links.push({a:a,b:b,via:via==null?null:via});
 addN('hwy.w','entry',-720,D.RY,0,false);
 addN('hwy.e','entry',720,D.RY,0,false);
 addN('pylon.nw','pylon',-D.PYLON_X,D.RY,-D.PYLON_Z,false);
 addN('pylon.sw','pylon',-D.PYLON_X,D.RY,D.PYLON_Z,false);
 addN('pylon.ne','pylon',D.PYLON_X,D.RY,-D.PYLON_Z,false);
 addN('pylon.se','pylon',D.PYLON_X,D.RY,D.PYLON_Z,false);
 addN('city.w','city',-180,D.RY-12,0,false);
 addN('city.c','city',0,D.RY-12,0,false);
 addN('city.e','city',180,D.RY-12,0,false);
 addN('bow.w','bow',-140,456,0,false);
 addN('bow.e','bow',140,456,0,false);
 addN('crown','crown',0,512,0,false);
 addN('tourist.w','tourist',-96,D.TOUR_Y1,0,false);
 addN('tourist.e','tourist',96,D.TOUR_Y1,0,false);
 addN('park','park',0,4,40,false);
 addN('wing.nw','wing',-510,D.RY+6,-205,false);
 addN('wing.sw','wing',-510,D.RY+6,205,false);
 addN('wing.ne','wing',510,D.RY+6,-205,false);
 addN('wing.se','wing',510,D.RY+6,205,false);
 addN('vaults.w','delve',-540,356,0,true);
 addN('vaults.e','delve',540,356,0,true);
 addN('mech.w','delve',-366,272,0,true);
 addN('mech.e','delve',366,272,0,true);

 addL('hwy.w','pylon.nw','stonebow.hwy.n');
 addL('hwy.w','pylon.sw','stonebow.hwy.s');
 addL('hwy.e','pylon.ne','stonebow.hwy.n');
 addL('hwy.e','pylon.se','stonebow.hwy.s');
 addL('pylon.nw','pylon.sw','stonebow.uloop.w');
 addL('pylon.ne','pylon.se','stonebow.uloop.e');
 addL('pylon.nw','wing.nw',null);
 addL('pylon.sw','wing.sw',null);
 addL('pylon.ne','wing.ne','stonebow.wing.ne');
 addL('pylon.se','wing.se',null);
 addL('pylon.nw','city.w',null);
 addL('pylon.sw','city.w',null);
 addL('pylon.ne','city.e',null);
 addL('pylon.se','city.e',null);
 addL('city.w','city.c',null);
 addL('city.c','city.e','stonebow.city.east');
 addL('city.w','bow.w',null);
 addL('city.e','bow.e','stonebow.truss.4');
 addL('bow.w','crown',null);
 addL('bow.e','crown','stonebow.truss.4');
 addL('pylon.sw','tourist.w','stonebow.strut.low.w.s');
 addL('pylon.se','tourist.e','stonebow.strut.low.e.s');
 addL('tourist.w','tourist.e','stonebow.tourist.east');
 addL('tourist.w','park','stonebow.lift.w');
 addL('tourist.e','park','stonebow.lift.e');
 // Delving vaults connect ONLY through the two pylon bulkheads
 addL('pylon.nw','vaults.w','stonebow.bulkhead.w');
 addL('vaults.w','mech.w','stonebow.bulkhead.w');
 addL('pylon.ne','vaults.e','stonebow.bulkhead.e');
 addL('vaults.e','mech.e','stonebow.bulkhead.e');

 P.stats=STONEBOW.computeStats(P,'intact');
 return P;
};

// BFS reachability from entry nodes (default ['hwy.w', 'hwy.e']), respecting blocked link/node ids
STONEBOW.reach=function(P,blocked,starts){
 const blk=new Set(blocked==null?[]:blocked);
 const adj=new Map();
 for(const n of P.nodes)adj.set(n.id,[]);
 for(const l of P.links){
  if(l.via&&blk.has(l.via))continue;
  if(blk.has(l.a)||blk.has(l.b))continue;
  adj.get(l.a).push(l.b);
  adj.get(l.b).push(l.a);
 }
 const seen=new Set(),q=[];
 for(const s of (starts==null?['hwy.w','hwy.e']:starts)){
  if(!blk.has(s)&&adj.has(s)){seen.add(s);q.push(s);}
 }
 while(q.length){
  const u=q.shift();
  for(const v of (adj.get(u)||[])){
   if(!seen.has(v)){seen.add(v);q.push(v);}
  }
 }
 return seen;
};

// Ruin overlay (d = 1): eastern Tourist Center & SE strut collapsed onto canyon floor; bow bay 4 & east oculus breached; NE wing ruined
STONEBOW.ruin=function(P){
 const S=P.seed,U=STONEBOW.u;
 const wrecks=[];
 // Fallen eastern Tourist Center deck & strut chunks seated on the canyon floor throat (groundAt, x = 42..92)
 const wSpecs=[
  [44,14,[36,9,30],0.18,-0.14],
  [68,-22,[30,8,26],-0.22,0.19],
  [88,24,[24,7,20],0.31,0.12],
  [76,-44,[26,5.5,11],-0.15,-0.25]
 ];
 for(let i=0;i<wSpecs.length;i++){
  const [wx,wz,sz,rx,rz]=wSpecs[i];
  wrecks.push({
   id:'stonebow.ruin.wreck.'+i,kind:i<3?'deck':'strut',
   x:wx,z:wz,yFloor:STONEBOW.groundAt(wx,wz),size:sz,
   rot:[rx,U(S,701,i,0)*Math.PI*2,rz]
  });
 }
 return {
  state:'ruined',
  cut:[
   'stonebow.tourist.east','stonebow.strut.low.e.s','stonebow.strut.low.e.n',
   'stonebow.lift.e','stonebow.truss.4','stonebow.wing.ne',
   'stonebow.bulkhead.w','stonebow.bulkhead.e'
  ],
  brokenTrussBay:4,
  brokenWells:[5,6],
  brokenTouristX:28,     // eastern half (x > 28) collapsed in the ruin
  slumpedWing:'ne',
  wrecks:wrecks
 };
};

// Refurbished centerpiece overlay: main bridge, highway loops, 4 pylons, Crown, Bow, City Center & stabilized Tourist Center kept;
// deep West/East Rim industrial vaults & NE wing sealed behind pylon bulkheads as delving ruins
STONEBOW.refurb=function(P){
 const S=P.seed,U=STONEBOW.u,crops=[];
 // Cultivated rooftop crop strips & greenhouses on the refurbished bow terraces & active wings
 for(let ti=0;ti<P.bowTiers.length;ti++){
  const T=P.bowTiers[ti];
  if(ti>3)continue;
  const n=Math.floor((T.x1-T.x0)/48);
  for(let k=0;k<n;k++){
   const cx=T.x0+24+k*48;
   if(Math.abs(cx)<36)continue;
   crops.push({
    id:'stonebow.refurb.crop.'+ti+'.'+k,
    kind:k%3===0?'greenhouse':'cropbed',
    at:[cx,T.y+0.35,(k%2===0?1:-1)*(T.zHalf+3)],
    size:[22,k%3===0?3.8:0.7,6.5],
    crop:['grain','pulse','greens','herb'][(ti+k)%4]
   });
  }
 }
 return {
  state:'refurbished',
  keptZones:['crown','bow','city','tourist','pylons','highways','park','wing.nw','wing.sw','wing.se'],
  delveZones:['vaults-w','vaults-e','mech.w','mech.e','wing.ne'],
  sealedBulkheads:['stonebow.bulkhead.w','stonebow.bulkhead.e'],
  blockedNodes:['wing.ne'],
  bracedTrussBay:4,       // timber-and-steel salvage truss bridge across the old bay-4 scar
  stabilizerCables:[
   {id:'stonebow.refurb.cable.n',a:[342,422,-50],b:[176,198,-46]},
   {id:'stonebow.refurb.cable.s',a:[342,422,50],b:[176,198,46]},
   {id:'stonebow.refurb.cable.wn',a:[-342,422,-50],b:[-176,198,-46]},
   {id:'stonebow.refurb.cable.ws',a:[-342,422,50],b:[-176,198,46]}
  ],
  crops:crops,
  stats:STONEBOW.computeStats(P,'refurbished')
 };
};

// Covered surface (ha), lit residential/work floor (m2), deep unlit vault floor (m2), and population capacity
STONEBOW.computeStats=function(P,state){
 const D=P.dim;
 // Plan footprint: main linear spine + highways (39.52 ha) + U-loops (5.31 ha) + 4 splayed wings (13.62 ha) + rim terraces (28.27 ha) + sheltered canyon park (42.56 ha) = 129.3 ha (Soleri: 129 ha)
 const mainHa=(D.LEN*260)/10000;
 const loopHa=(Math.PI*130*130)/10000;
 const wingHa=(4*280*152*0.80)/10000;
 const rimTerraceHa=(4*310*228)/10000;
 const parkHa=(D.CANYON_L*280)/10000;
 const coveredHa=Math.round((mainHa+loopHa+wingHa+rimTerraceHa+parkHa)*10)/10;

 // Lit multi-storey floor area across exterior bow terraces, 9 spine light wells, City Center arch, Tourist Center, 4 pylons, rim approaches & 4 wings
 let bowLitM2=0;
 for(let x=-360;x<360;x+=20){
  const h=STONEBOW.bowTop(x)-D.RY;
  const nSt=Math.max(1,Math.floor(h/D.STO));
  bowLitM2+=20*nSt*132;                                          // outer terraced skins + twin inner spine-well skins (6 x 22 m)
 }
 const cityLitM2=900*26*96;                                      // main arch & stepped canyon-wall residential/civic galleries
 const approachLitM2=2*360*32*148;                               // west & east linear-city approaches
 const wingLitM2=4*42500*8;                                      // 4 terraced neighborhood wings & amphitheater bowls
 const pylonLitM2=4*1900*52;                                     // 4 twin-shaft abutment pylon towers
 const touristLitM2=384*8*44;                                    // suspended Tourist Center + cliff cantilevers
 const litFloorM2=Math.round(bowLitM2+cityLitM2+approachLitM2+wingLitM2+pylonLitM2+touristLitM2);
 const deepUnlitM2=Math.round(2*310*192*9+820*90*6);             // deep Automated Industry, Factory & Mechanical vaults

 const intactPop=Math.round((litFloorM2*D.SHARE)/D.M2);          // ~200,000 (Soleri: 200,000)
 const refurbLitM2=Math.round(litFloorM2*0.092);                 // active refurbished centerpiece levels (~9.2% of full megastructure)
 const refurbPop=Math.round((refurbLitM2*D.SHARE)/D.M2);         // ~18,500 residents in refurbished centerpiece
 return {
  coveredHa:coveredHa,
  spanM:D.SPAN,
  heightAboveRimM:D.CROWN_Y-D.RY,
  totalHeightM:D.CROWN_Y-D.FOOT_Y,
  bowDepthM:D.CROWN_Y-D.TOUR_Y0,
  litFloorM2:litFloorM2,
  deepUnlitM2:deepUnlitM2,
  intactPop:intactPop,
  refurbPop:refurbPop,
  activePop:state==='refurbished'?refurbPop:state==='ruined'?0:intactPop
 };
};
