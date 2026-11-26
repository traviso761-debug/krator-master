// prefix: ynq
// ================================================================= INNS, BELVEDERE VILLAS, APSE MANORS, BAZAAR-DRUMS, SUN-TOWERS & SMELTERS
// Seven freestanding Yonni commercial, residential, watch, and industrial buildings from the 15-reference expansion:
//   1. yn-inn-staineddrum — Stained-Glass Rotunda Inn & Stilted Turret Bridge (8fd4ca67)
//   2. yn-villa-belvedere — Domed Belvedere Merchant Caravanserai & Moucharabieh Villa (c8eaed2a)
//   3. yn-manor-apserose  — Five-Apse Promontory Manor & Slender Spire-Towers (a2ec23c5)
//   4. yn-bazaar-drum     — Umbrella-Cupola Trading Post & Awning Bazaar-Drum (e2e54dd1)
//   5. yn-tower-sunpetal  — Radial Sun-Petal Awning & Crane-Spar Watchtower (56c1059a)
//   6. yn-compound-sails  — Shade-Sail Garrison & Parapet-Bridge Store-Compound (8cc1fce1)
//   7. yn-smelter-scallop — Verdigris Scallop-Cap Assay Smelter & Ringed Signal Pylons (dc78d29d)

/* Helper: radial trapezoidal cloth/plank sun-or-rain awning petal sloped outward from a drum wall */
function ynqAwningPetal(cx,cz,rIn,rOut,a0,a1,yIn,yOut,mk,col){
 const m=mk||'sail',c=col==null?P('sail'):col,iwCol=P('ironwood');
 const p0=[cx+Math.cos(a0)*(rIn+.02),yIn,cz+Math.sin(a0)*(rIn+.02)];
 const p1=[cx+Math.cos(a1)*(rIn+.02),yIn,cz+Math.sin(a1)*(rIn+.02)];
 const p2=[cx+Math.cos(a0)*rOut,yOut,cz+Math.sin(a0)*rOut];
 ynNoCut(()=>svNoWalk(()=>{
  plane4(m,p0,p1,p2,.04,c);
  const am=(a0+a1)*.5;
  beam('ironwood',[cx+Math.cos(am)*(rIn+.02),yOut-.48,cz+Math.sin(am)*(rIn+.02)],[cx+Math.cos(am)*(rOut-.08),yOut-.04,cz+Math.sin(am)*(rOut-.08)],.055,iwCol,true,6);
 }));
}

/* Helper: ringed patinated verdigris & tin-bronze signal/resonator spire-totem on carved relief plinth (dc78d29d) */
function ynqSignalTotem(x,z,hTot){
 const trCol=P('travertine'),rlCol=P('relief'),vdCol=P('verdigris'),bzCol=P('bronze');
 ynNoCut(()=>svNoWalk(()=>W(x,0,z,0,()=>{
  ynBelowGrade(()=>box('cobble',0,-3.8,0,1.65,3.8,1.65,P('cobble')));
  box('travertine',0,.01,0,1.48,1.35,1.48,trCol);
  for(let s=0;s<4;s++){
   W(0,.22,0,s*PI/2,()=>box('relief',0,0,.76,.92,.92,.035,rlCol));
  }
  box('travertine',0,1.37,0,1.24,.24,1.24,trCol);
  /* slender tapered verdigris shaft ringed by stacked acoustic bronze collars & bell-cones */
  const shH=hTot-2.15;
  cyl('verdigris',0,1.62,0,.36,shH,vdCol,12,.16);
  const nRings=6;
  for(let k=0;k<nRings;k++){
   const u=(k+.4)/nRings,yy=1.85+u*(shH-.45),rr0=lerp(.52,.28,u);
   cone(k%2===0?'verdigris':'bronze',0,yy,0,rr0,.26,k%2===0?vdCol:bzCol,12);
   ring('bronze',0,yy-.02,0,rr0+.03,.032,bzCol,0,0,0,12);
  }
  cone('gilt',0,1.63+shH,0,.22,.65,P('gilt'),10);
 })));
}

/* ================================================================= 1. STAINED-GLASS ROTUNDA INN & TURRET BRIDGE (yn-inn-staineddrum) */
defBuilding({key:'yn-inn-staineddrum',name:'Glas-Hold Stained-Glass Rotunda Inn & Turret Bridge',seed:7601,cls:'building',w:19.6,d:14.8,h:16.4,budget:120000,cut:true,
 tags:{types:['inn','tavern'],wealth:'middle',style:'freestanding',role:'stained-glass rotunda inn',job:'brewing'},
 note:'Sage-tinted sea-lime & cobble cylindrical hostel-inn with a multi-tiered patchwork of stained-glass casements, front oculus gable-bay, ribbed terracotta dome, and an elevated timber bridge spanning to a stilted corner turret.',
 build(){
  const cx=-1.65,cz=-.15,r=4.35,y0=.32,h1=3.65,y2=y0+h1+.16,h2=3.75;
  const sageLime=0xc4d0be,cbCol=P('cobble'),tcCol=P('terracotta'),iwCol=P('ironwood'),trCol=P('travertine');

  ynRootSkirt(cx,cz,r,5.2,{mk:'cobble',col:cbCol,plinthH:y0+.26,seg:20});
  ynFloorDisc(cx,cz,r-.06,y0,'flagstone',P('flagstone'),{seg:18});
  ynNoCut(()=>svStair(cx,cz+r+.95,0,y0,PI,{style:'solid',w:1.65,mk:'flagstone',col:P('flagstone'),run:.95}));

  /* Ground & Upper Hostel Drum with rich stained-glass casement patchwork (8fd4ca67!) */
  ynDrumWall(cx,cz,r-.36,r,y0,h1,'cobble',cbCol,[
   {a:PI/2,w:1.42,h:2.35,door:true,visor:false},
   {a:0,w:1.15,h:2.10,door:true,open:true},
   {a:PI*.22,w:.95,y:.85,h:1.65,pane:'stained'},{a:PI*.78,w:.95,y:.85,h:1.65,pane:'stained'},
   {a:PI,w:1.05,h:2.05,door:true,open:true},
   {a:-PI*.30,w:.95,y:.85,h:1.65,pane:'stained'},{a:-PI*.70,w:.95,y:.85,h:1.65,pane:'stained'}
  ]);
  ynDripSkirt(cx,cz,r,y0+h1,.36,.18,'terracotta',tcCol,{seg:20});
  ynFloorDisc(cx,cz,r-.10,y2,'floor',P('floor'),{seg:18});
  ynDrumWall(cx,cz,r-.38,r-.03,y2,h2,'sealime',sageLime,[
   {a:0,w:1.15,h:2.10,door:true,open:true},
   {a:PI*.18,w:1.05,y:.65,h:1.95,pane:'stained'},{a:PI*.36,w:.92,y:.75,h:1.85,pane:'stained'},
   {a:PI*.64,w:.92,y:.75,h:1.85,pane:'stained'},{a:PI*.82,w:1.05,y:.65,h:1.95,pane:'stained'},
   {a:PI,w:.95,y:.75,h:1.85,pane:'stained'},
   {a:-PI*.28,w:1.05,y:.65,h:1.95,pane:'stained'},{a:-PI*.72,w:1.05,y:.65,h:1.95,pane:'stained'}
  ]);

  /* Tall front Oculus Gable-Bay + Broad Ribbed Terracotta Saucer-Dome */
  const yEave=y2+h2;
  ynNoCut(()=>svNoWalk(()=>{
   const zBay=cz+r+.34;
   box('sealime',cx,y0+.01,zBay,2.35,yEave+1.35,.68,sageLime);
   for(const sx of [-1,1])box('ironwood',cx+sx*1.12,y0+.02,zBay+.35,.12,yEave+1.30,.08,iwCol);
   svPane(cx,y2+.85,zBay+.36,0,1.45,1.95,{kind:'stained',t:.03});
   box('terracotta',cx,yEave+1.37,zBay,2.55,.22,.82,tcCol);
   W(cx,yEave+.45,zBay+.36,0,()=>ynpOculusMedallion(.68,{tailH:0}));
   ynmBulbDome(cx,cz,r+.14,yEave+.02,3.45,'terracotta',tcCol,{bulge:1.01,ribMk:'bronze',ribs:12,finialScale:.98,seg:20});
  }));

  /* +X Stilted Corner Cupola Turret on 6 Oiled Ironwood Piles + Elevated Roofed Bridge! */
  const tx=5.45,tz=-.15,tr=1.95;
  ynNoCut(()=>{
   for(let i=0;i<6;i++){
    const a=i/6*TAU,px=tx+Math.cos(a)*(tr-.32),pz=tz+Math.sin(a)*(tr-.32);
    ynBelowGrade(()=>cyl('cobble',px,-4.2,pz,.28,4.25,cbCol,8));
    cyl('ironwood',px,.008,pz,.15,y2-.16,iwCol,8);
   }
   ynFloorDisc(tx,tz,tr+.08,y2,'floor',P('floor'),{seg:12});
   svNoWalk(()=>{
    ynDrumWall(tx,tz,tr-.30,tr,y2,3.25,'sealime',sageLime,[
     {a:PI,w:1.05,h:1.95,door:true,open:true},
     {a:PI/2,w:.78,y:.65,h:1.55,pane:'stained'},{a:0,w:.78,y:.65,h:1.55,pane:'stained'},{a:-PI/2,w:.78,y:.65,h:1.55,pane:'stained'}
    ]);
    ynmBulbDome(tx,tz,tr+.12,y2+3.27,2.05,'verdigris',P('verdigris'),{ribs:8,finialScale:.68,seg:14});
   });
   ynFlyingBridge(cx+r+.02,y2,cz,tx-tr-.02,y2,tz,1.38,{roofMk:'terracotta'});

   /* -X Cozy Covered Tavern Lean-To Porch balancing +X turret with clean radial & vertical clearance! */
   const lx=cx-r-1.18;
   ynFloorDisc(lx,cz,1.06,y0-.04,'planks',P('planks'),{th:.08,seg:10});
   svNoWalk(()=>{
    for(const sz of [-.85,.85]){
     cyl('ironwood',lx-.88,y0-.03,cz+sz,.11,2.58,iwCol,8);
    }
    plane4('terracotta',[cx-r+.05,y0+3.35,cz-1.45],[cx-r+.05,y0+3.35,cz+1.45],[lx-1.08,y0+2.48,cz-1.45],.05,tcCol);
   });
   ynStormLamp(cx+1.25,y0+2.55,cz+r+.72,0,.95);
  });

  /* Inn Taproom & Upper Hostel Furnishing (8 pieces) */
  ynFurnRoundRoom(cx,cz,r-.42,y0,'middle',{center:'table',bed:false,ceilingY:y2-.16});
  FURNISH('yonni_trade_barrels',cx-2.45,y0,cz-1.65,PI*.25);
  FURNISH('yonni_common_twin_alcove',cx,y2,cz-2.15,0);
  FURNISH('yonni_common_brazier',tx,y2+.006,tz,0);
 }});

/* ================================================================= 2. DOMED BELVEDERE MERCHANT CARAVANSERAI (yn-villa-belvedere) */
defBuilding({key:'yn-villa-belvedere',name:'Kande-Vila Domed Belvedere Merchant Caravanserai',seed:7602,cls:'building',w:18.8,d:16.8,h:18.6,budget:120000,cut:true,
 tags:{types:['inn','market','dwelling-multi'],wealth:'rich',style:'freestanding',role:'belvedere caravanserai',job:'trading'},
 note:'Battered warm sea-lime merchant court-villa with twin-pilaster front portal, verdigris ribbed dome on a white colonnaded clerestory, square rear belvedere cupola tower, corbelled moucharabieh bay, and side market awning.',
 build(){
  const y0=.36,cz=-.20,r=4.95,hWall=5.25;
  const slWarm=P('sealimeW'),slCol=P('sealime'),asCol=P('ashlar'),trCol=P('travertine'),vdCol=P('verdigris'),iwCol=P('ironwood');

  ynRootSkirt(0,cz,r+.35,5.4,{mk:'cobble',plinthH:y0+.24,seg:20});
  ynFloorDisc(0,cz,r-.06,y0,'flagstone',P('flagstone'),{seg:18});
  ynNoCut(()=>svStair(0,cz+r+1.15,0,y0,PI,{style:'solid',w:2.15,mk:'travertine',col:trCol,run:1.15}));

  /* Main Battered Sea-Lime Caravanserai Drum */
  ynDrumWall(0,cz,r-.40,r,y0,hWall,'sealimeWarm',slWarm,[
   {a:PI/2,w:1.68,h:2.75,door:true,visor:false},
   {a:0,w:1.15,h:2.15,door:true,open:true},{a:PI,w:.95,y:1.25,h:1.65,pane:'stained'},
   {a:PI*.25,w:.85,y:1.35,h:1.65,pane:'lit'},{a:PI*.75,w:.85,y:1.35,h:1.65,pane:'lit'},
   {a:-PI/2,w:.92,y:1.35,h:1.65,pane:'stained'}
  ]);

  ynNoCut(()=>svNoWalk(()=>{
   /* Twin Battered Front Portal Turret-Pilasters + Keyhole Arch Frame (c8eaed2a!) */
   const zp=cz+r+.28;
   for(const sx of [-1,1]){
    cyl('sealimeWarm',sx*1.55,y0+.008,zp,.62,hWall+.65,slWarm,12,.46);
    cone('verdigris',sx*1.55,y0+hWall+.67,zp,.54,.72,vdCol,12);
   }
   box('travertine',0,y0+3.25,zp,2.45,1.85,.54,trCol);
   W(0,y0+4.18,zp+.28,0,()=>ynpOculusMedallion(.54,{tailH:0}));

   /* White Colonnaded Clerestory Drum + Ribbed Verdigris Dome */
   const yC=y0+hWall+.01,rCl=3.35;
   sector('travertine',0,cz,rCl-.25,r+.22,0,TAU,yC,yC+.32,trCol,20);
   ynArcadeRing(0,cz,rCl-.32,rCl,yC+.33,2.05,12,{paraH:.38,paraMk:'sealime',paraCol:slCol,colMk:'travertine',colCol:trCol,spandrelMk:'sealime',spandrelCol:slCol,archH:.38,colR:.10});
   ynmBulbDome(0,cz,rCl+.08,yC+2.40,3.25,'verdigris',vdCol,{bulge:1.04,ribMk:'bronze',ribs:10,finialScale:1.02,seg:20});

   /* Square Rear-Flank Belvedere Watch-Tower (+X, -Z) with Open 4-Column Cupola (c8eaed2a!) */
   const bx=3.45,bz=cz-3.45;
   ynBelowGrade(()=>box('cobble',bx,-4.6,bz,2.85,4.6,2.85,P('cobble')));
   box('sealimeWarm',bx,y0+.01,bz,2.55,8.65,2.55,slWarm);
   box('travertine',bx,y0+8.67,bz,2.78,.24,2.78,trCol);
   for(const sx of [-.95,.95])for(const sz of [-.95,.95]){
    cyl('ironwood',bx+sx,y0+8.92,bz+sz,.11,2.05,iwCol,8);
   }
   box('travertine',bx,y0+10.98,bz,2.72,.20,2.72,trCol);
   ynCanopy(bx,bz,1.35,2.15,y0+11.20,1.75,{mk:'verdigris',ribs:4,finialScale:.72,seg:4});

   /* -X Corbelled Ironwood Moucharabieh Bay Balcony */
   const mx=-r-.45,mz=cz+.35;
   for(const sz of [-.85,.85])beam('ironwood',[-r+.2,y0+2.15,mz+sz],[mx-.55,y0+2.85,mz+sz],.12,iwCol);
   box('carved',mx-.12,y0+2.86,mz,1.15,1.95,2.35,P('wood'));
   svPane(mx-.71,y0+3.25,mz,-PI/2,1.55,1.05,{kind:'lit',t:.025});
   plane4('verdigris',[-r+.1,y0+5.15,mz-1.35],[-r+.1,y0+5.15,mz+1.35],[mx-.85,y0+4.82,mz-1.35],.05,vdCol);

   /* +X Striped Sail-and-Carnelian Side Market Awning over Merchant Stall */
   const ax=r+.12,az=cz+.85;
   plane4('sail',[ax,y0+3.45,az-1.85],[ax,y0+3.45,az+1.85],[ax+2.15,y0+2.35,az-1.85],.045,P('sail'));
   for(const sz of [-1.65,1.65])cyl('ironwood',ax+1.98,.01,az+sz,.09,y0+2.32,iwCol,8);
  }));
  FURNISH('yonni_trade_stall',r+1.05,.01,cz+.85,-PI/2);

  /* Merchant Villa Interior Furnishing (8 pieces) */
  ynFurnRoundRoom(0,cz,r-.48,y0,'rich',{center:'table',bed:true,ceilingY:y0+hWall-.12});
  FURNISH('yonni_works_weigh_scale',2.55,y0,cz+1.45,-PI*.4);
  FURNISH('yonni_trade_barrels',2.75,y0,cz-.95,-PI/2);
 }});

/* ================================================================= 3. FIVE-APSE PROMONTORY MANOR & SPIRE-TOWERS (yn-manor-apserose) */
defBuilding({key:'yn-manor-apserose',name:'Ros-Aps Five-Apse Promontory Manor & Spire-Court',seed:7613,cls:'building',w:20.4,d:18.6,h:19.4,budget:120000,cut:true,
 tags:{types:['dwelling-multi','civic'],wealth:'rich',style:'freestanding',role:'five-apse promontory manor'},
 note:'Promontory Spear-Noble manor centered on a tall sea-lime rotunda ringed by five radiating semicircular apse-wings with half-conical terracotta roofs, flanked by twin slender eave-capped spire-towers and indigo-awning loggias.',
 build(){
  const y0=.36,cz=.95,rMain=4.25,hMain=7.65;
  const slCol=P('sealime'),tcCol=P('terracotta'),trCol=P('travertine'),cbCol=P('cobble'),iwCol=P('ironwood');

  ynRootSkirt(0,cz,rMain+.35,5.6,{mk:'cobble',col:cbCol,plinthH:y0+.26,seg:20});
  ynFloorDisc(0,cz,rMain-.06,y0,'flagstone',P('flagstone'),{seg:18});
  ynNoCut(()=>svStair(0,cz+rMain+1.05,0,y0,PI,{style:'solid',w:1.85,mk:'travertine',col:trCol,run:1.05}));

  /* Central Tall Sea-Lime Manor Rotunda + Ribbed Terracotta Conical Roof */
  ynDrumWall(0,cz,rMain-.38,rMain,y0,hMain,'sealime',slCol,[
   {a:PI/2,w:1.55,h:2.55,door:true,visor:true,visorOut:.82},
   {a:PI*.30,w:.78,y:4.45,h:1.65,pane:'stained'},{a:PI*.70,w:.78,y:4.45,h:1.65,pane:'stained'},
   {a:0,w:.78,y:4.45,h:1.65,pane:'lit'},{a:PI,w:.78,y:4.45,h:1.65,pane:'lit'},
   {a:-PI/2,w:.82,y:4.45,h:1.65,pane:'stained'}
  ]);
  ynCanopy(0,cz,rMain,rMain+1.05,y0+hMain,3.85,{mk:'terracotta',col:tcCol,ribs:12,finialScale:1.05,seg:22});

  /* Five Radiating Semicircular Apse-Chapels with Half-Conical Terracotta Roofs (a2ec23c5!) */
  const apseAngles=[PI*.16,PI*.84,-PI*.16,-PI*.50,-PI*.84];
  for(const aa of apseAngles){
   const ax=Math.cos(aa)*(rMain+.55),az=cz+Math.sin(aa)*(rMain+.55),ar=1.95,ah=3.85;
   ynRootSkirt(ax,az,ar,4.8,{mk:'cobble',col:cbCol,plinthH:y0+.20,a0:aa-PI*.62,a1:aa+PI*.62,seg:12});
   ynFloorDisc(ax,az,ar-.08,y0-.012,'floor',P('floor'),{a0:aa-PI*.55,a1:aa+PI*.55,seg:10});
   ynDrumWall(ax,az,ar-.32,ar,y0,ah,'sealime',slCol,[
    {a:aa,w:.62,y:1.05,h:1.45,pane:'stained'}
   ],{a0:aa-PI*.58,a1:aa+PI*.58});
   ynCanopy(ax,az,ar,ar+.55,y0+ah,1.85,{mk:'terracotta',col:tcCol,ribs:5,a0:aa-PI*.60,a1:aa+PI*.60,seg:12});
  }

  /* Twin Slender White Spire-Chimney Towers + Balanced Arcaded Indigo-Awning Loggias (a2ec23c5!) */
  ynNoCut(()=>svNoWalk(()=>{
   for(const sx of [-1,1]){
    const tx=sx*5.85,tz=cz-2.15;
    ynRootSkirt(tx,tz,1.25,4.8,{mk:'cobble',col:cbCol,plinthH:y0+.22,seg:12});
    lathe('sealime',tx,tz,[[1.18,y0+.22],[.96,6.8],[.78,13.2]],14,slCol,{uv:'arc'});
    /* Twin flared slate eave-collars near top of slender white spire */
    ynDripSkirt(tx,tz,.84,10.6,.48,.24,'slate',P('slate'),{seg:14});
    ynCanopy(tx,tz,.78,1.45,13.22,2.25,{mk:'slate',ribs:6,finialScale:.68,seg:14});

    /* Side Arcaded Loggia Bay with Indigo Sun-Awning */
    const lx=sx*6.25,lz=cz+1.45;
    ynBelowGrade(()=>box('cobble',lx,-4.2,lz,2.65,4.2,3.45,cbCol));
    box('travertine',lx,.01,lz,2.45,y0-.02,3.25,trCol);
    for(const sz of [-1.25,0,1.25]){
     cyl('travertine',lx+sx*.95,y0+.008,lz+sz,.14,2.85,trCol,8);
    }
    box('sealime',lx,y0+2.87,lz,2.35,.55,3.15,slCol);
    plane4('terracotta',[lx-sx*1.1,y0+3.85,lz-1.65],[lx-sx*1.1,y0+3.85,lz+1.65],[lx+sx*1.35,y0+3.44,lz-1.65],.05,tcCol);
    withCloth(clothHang(.78,.05),()=>quad('flag',lx+sx*1.02,y0+2.38,lz,2.65,.78,P('indigo'),sx*PI/2));
   }
  }));

  /* Promontory Manor Interior Furnishing (8 pieces) */
  ynFurnRoundRoom(0,cz,rMain-.45,y0,'rich',{center:'table',bed:true,ceilingY:y0+4.2});
  FURNISH('yonni_works_scribe_desk',-2.45,y0,cz+1.55,PI*.3);
  FURNISH('yonni_common_banner',2.45,y0,cz-2.15,-PI*.2);
 }});

/* ================================================================= 4. UMBRELLA-CUPOLA BAZAAR-DRUM (yn-bazaar-drum) */
defBuilding({key:'yn-bazaar-drum',name:'Bazar-Tur Umbrella-Cupola Trading Post & Stall-Drum',seed:7605,cls:'building',w:16.2,d:16.2,h:16.8,budget:120000,cut:true,
 tags:{types:['shop','market'],wealth:'middle',style:'freestanding',role:'umbrella bazaar drum',job:'trading'},
 note:'Organic tapered warm sea-lime trading drum crowned by an open ironwood umbrella-roof lookout pavilion, surrounded by radial terracotta and sailcloth market awnings, produce counters, rigging mast, and water barrels.',
 build(){
  const y0=.28,rB=3.95,rT=3.25,hDrum=7.85;
  const slWarm=P('sealimeW'),cbCol=P('cobble'),tcCol=P('terracotta'),iwCol=P('ironwood');

  ynRootSkirt(0,0,rB,5.0,{mk:'cobble',col:cbCol,plinthH:y0+.24,seg:18});
  ynFloorDisc(0,0,rB-.06,y0,'flagstone',P('flagstone'),{seg:16});

  /* Lower cobble shop-drum + tapered sea-lime upper store-tower + exterior spiral stair to roof lookout */
  ynDrumWall(0,0,rB-.36,rB,y0,3.45,'cobble',cbCol,[
   {a:PI/2,w:1.45,h:2.30,door:true,visor:false},
   {a:0,w:1.25,h:2.10,door:true,open:true},{a:PI,w:1.25,h:2.10,door:true,open:true},
   {a:-PI/2,w:.82,y:.95,h:1.35}
  ],{visors:false});
  ynFloorDisc(0,0,rT+.15,y0+3.55,'floor',P('floor'),{seg:16});
  ynDrumWall(0,0,rT-.34,rT,y0+3.55,hDrum-3.55,'sealimeWarm',slWarm,[
   {a:PI/2,w:.75,y:.95,h:1.45,pane:'lit'},{a:PI*.25,w:.68,y:1.15,h:1.35},
   {a:PI*.75,w:.68,y:1.15,h:1.35},{a:-PI/2,w:.72,y:1.15,h:1.35,pane:'lit'}
  ]);
  ynSpiralStair(0,0,rB+.04,y0,y0+hDrum+.14,-PI*.35,-PI*.95,{w:.88});

  /* Roof Terrace Parapet + Open Timber Umbrella Lookout Cupola + Raked Rigging Mast (e2e54dd1!) */
  const yRoof=y0+hDrum+.14;
  ynFloorDisc(0,0,rT+.22,yRoof,'flagstone',P('flagstone'),{seg:16});
  ynNoCut(()=>{
   sector('sealimeWarm',0,0,rT-.02,rT+.24,-.55*PI,.75*PI,yRoof+.008,yRoof+.78,slWarm,14);
   ynUmbrellaCanopy(0,0,.28,rT+1.15,yRoof,yRoof+2.85,2.05,{mk:'shingle',col:P('shingle'),struts:10});
   /* Raked coastal trade-pennant mast rising beside the umbrella cupola */
   svNoWalk(()=>{
    beam('ironwood',[rT-.35,yRoof+.02,.45],[rT+.85,yRoof+5.45,.85],.11,iwCol,true,6);
    sagRope('rope',[rT+.75,yRoof+5.05,.80],[-rT+.25,yRoof+.82,-.35],.28,.02,P('rope'),5);
    withCloth(clothFlag(1.65,.08),()=>quad('flag',rT+.82,yRoof+4.85,1.62,.52,1.65,P('carnelian'),0));
   });

   /* 6 Wrap-Around Radial Market Awnings over Street-Level Counters! */
   const awns=[PI*.50,-PI*.50,PI*.18,PI*.82,-PI*.18,-PI*.82];
   awns.forEach((am,idx)=>{
    ynqAwningPetal(0,0,rB,rB+2.15,am-.26,am+.26,y0+3.18,y0+2.22,idx%2===0?'terracotta':'sail',idx%2===0?tcCol:P('carnelian'));
    for(const sa of [-.24,.24]){
     const px=Math.cos(am+sa)*(rB+1.98),pz=Math.sin(am+sa)*(rB+1.98);
     cyl('ironwood',px,.008,pz,.08,y0+2.16,iwCol,8);
    }
   });
  });

  /* Street-Level Stalls, Barrels & Interior Counting-Room Furnishing (9 pieces) */
  FURNISH('yonni_trade_stall',4.85,.01,.85,-PI*.42);
  FURNISH('yonni_trade_stall',-4.85,.01,.85,PI*.42);
  FURNISH('yonni_trade_barrels',4.55,.01,-2.15,0);
  FURNISH('yonni_trade_vat',-4.55,.01,-2.15,0);
  FURNISH('yonni_works_weigh_scale',0,y0,1.45,0);
  FURNISH('yonni_trade_workbench',-1.85,y0,-.85,PI/2);
  FURNISH('yonni_common_shelves',1.85,y0,-.85,-PI/2);
  FURNISH('yonni_common_chest',0,y0,-2.35,0);
  FURNISH_HANG('yonni_common_storm_lamp',0,y0+3.35,0,0);
 }});

/* ================================================================= 5. SUN-PETAL AWNING & CRANE-SPAR WATCHTOWER (yn-tower-sunpetal) */
defBuilding({key:'yn-tower-sunpetal',name:'Sol-Sfir Sun-Petal Awning & Crane-Spar Watchtower',seed:7611,cls:'building',w:16.8,d:16.8,h:23.8,budget:120000,cut:true,
 tags:{types:['infrastructure','civic'],wealth:'rich',style:'freestanding',role:'sun-petal watchtower'},
 note:'Tall tapered sea-lime & terracotta-banded coastal signal tower ringed around its upper gallery by twelve radial sun-awning petals, twin bronze hoist crane-spars, a cantilevered glazed lookout pod, and a gilt-ribbed dome.',
 build(){
  const y0=.32,rB=3.75,rM=3.15,rT=2.75;
  const slWarm=P('sealimeW'),tcCol=P('terracotta'),cbCol=P('cobble'),bzCol=P('bronze'),iwCol=P('ironwood');

  ynRootSkirt(0,0,rB,5.8,{mk:'cobble',col:cbCol,plinthH:y0+.28,seg:20});
  ynFloorDisc(0,0,rB-.06,y0,'flagstone',P('flagstone'),{seg:18});

  /* Stage 1 Cobble Base + Stage 2 & 3 Tapered Sea-Lime & Terracotta-Banded Shaft (y = 0.32 .. 13.6) */
  ynDrumWall(0,0,rB-.38,rB,y0,3.85,'cobble',cbCol,[
   {a:PI/2,w:1.35,h:2.30,door:true,visor:true,visorOut:.75},
   {a:-PI/2,w:.75,y:1.15,h:1.45}
  ]);
  ynDripSkirt(0,0,rB,y0+3.85,.38,.20,'terracotta',tcCol,{seg:20});
  ynFloorDisc(0,0,rM-.06,y0+3.88,'floor',P('floor'),{seg:16});
  ynDrumWall(0,0,rM-.36,rM,y0+3.88,5.25,'sealimeWarm',slWarm,[
   {a:0,w:.72,y:1.35,h:1.65,pane:'lit'},{a:PI,w:.72,y:1.35,h:1.65,pane:'lit'},
   {a:PI/2,w:.78,y:2.85,h:1.75,pane:'stained'},{a:-PI/2,w:.72,y:2.85,h:1.65,pane:'lit'}
  ]);
  ynSpiralStair(0,0,rB+.04,y0,y0+3.88,PI*.28,-PI*.75,{w:.88});

  const yS3=y0+9.14;
  ynNoCut(()=>sector('terracotta',0,0,rT-.05,rM+.14,0,TAU,yS3,yS3+.42,tcCol,20));
  ynDrumWall(0,0,rT-.34,rT,yS3+.43,4.15,'sealimeWarm',slWarm,[
   {a:PI*.25,w:.65,y:1.05,h:1.55,pane:'lit'},{a:PI*.75,w:.65,y:1.05,h:1.55,pane:'lit'},
   {a:-PI*.25,w:.65,y:1.05,h:1.55,pane:'lit'},{a:-PI*.75,w:.65,y:1.05,h:1.55,pane:'lit'}
  ]);

  /* Cantilevered Glazed Lookout Blister on +Z balanced by Counterweight Cistern Pod on -Z */
  ynNoCut(()=>svNoWalk(()=>{
   for(const sz of [-1,1]){
    const bz=sz*(rM+.55),by=y0+6.55;
    beam('corbel',[0,by-.85,sz*(rM-.2)],[0,by-.12,bz],.75,P('corbel'),false,undefined,.55);
    cyl('terracotta',0,by,bz,1.15,1.85,tcCol,12,1.05);
    if(sz>0)svPane(0,by+.45,bz+1.08,0,1.15,.95,{kind:'lit',t:.025});
    cone('verdigris',0,by+1.87,bz,1.25,.95,P('verdigris'),12);
   }

   /* 12 Radial Trapezoidal Sun-Awning Petals + Twin Symmetric Signal Crane-Spars (56c1059a!) */
   const yGal=yS3+4.59,rGal=3.35;
   ynCorbelFins(0,0,rT,rGal-.04,yGal-1.25,yGal,12,'corbel',P('corbel'),{bronzeTip:true});
   ynFloorDisc(0,0,rGal-.06,yGal+.14,'travertine',P('travertine'),{seg:18,walk:false});
   const nPetals=12;
   for(let i=0;i<nPetals;i++){
    const a0=i/nPetals*TAU+.035,a1=(i+1)/nPetals*TAU-.035;
    ynqAwningPetal(0,0,rGal,5.65,a0,a1,yGal+2.35,yGal+1.45,i%2===0?'sail':'kilim',i%2===0?P('sail'):P('amberCl'));
   }
   /* Twin symmetric bronze & ironwood hoist/signal spars on +-X */
   for(const sx of [-1,1]){
    beam('ironwood',[sx*(rGal-.2),yGal+1.85,0],[sx*6.45,yGal+2.95,0],.12,iwCol,true,6);
    beam('bronze',[sx*(rGal-.1),yGal+.55,0],[sx*4.85,yGal+2.58,0],.075,bzCol,true,6);
    sagRope('rope',[sx*6.25,yGal+2.88,0],[sx*6.25,yGal+.65,0],.02,.02,P('rope'),3);
    ynStormLamp(sx*6.15,yGal+.65,0,sx*PI/2,1.15);
   }

   /* Upper Colonnaded Lantern & Gilt-Ribbed Verdigris Crown Dome */
   ynArcadeRing(0,0,rGal-.32,rGal,yGal+.15,2.45,12,{paraH:.48,paraMk:'terracotta',paraCol:tcCol,colMk:'bronze',spandrelMk:'sealimeWarm',archH:.40,colR:.09});
   ynmBulbDome(0,0,rGal+.06,yGal+2.62,3.45,'verdigris',P('verdigris'),{ribMk:'gilt',ribs:12,finialScale:1.12,seg:18});
  }));

  /* Signal Tower Chart-Room & Watch-Floor Furnishing (6 pieces) */
  ynFurnRoundRoom(0,0,rB-.45,y0,'rich',{center:'table',bed:false,ceilingY:y0+3.7});
  FURNISH('yonni_works_scribe_desk',0,y0,-2.05,0);
  FURNISH('yonni_common_banner',0,y0+3.88,-1.85,0);
 }});

/* ================================================================= 6. SHADE-SAIL GARRISON & STORE-COMPOUND (yn-compound-sails) */
defBuilding({key:'yn-compound-sails',name:'Sel-Kasemat Shade-Sail Garrison & Store-Compound',seed:7612,cls:'building',w:19.6,d:16.4,h:15.4,budget:120000,cut:true,
 tags:{types:['military','industry'],wealth:'middle',style:'freestanding',role:'shade-sail garrison compound',job:'warehousing'},
 note:'Clustered battered sea-lime bastion-drums and sloped casemate storehouse spanned by an elevated parapet walkway bridge, wide conical metal saucer roofs, a tall vertical indigo drum-banner, and catenary canvas shade-sails.',
 build(){
  const y0=.30,slWarm=P('sealimeW'),cbCol=P('cobble'),smCol=P('seam'),iwCol=P('ironwood'),asCol=P('ashlar');

  /* Left Tall Drum-Bastion (-4.35, .15) & Right Lower Drum-Bastion (+4.35, .15) */
  const drums=[
   {cx:-4.35,cz:.15,r:3.35,hCob:2.65,hLime:6.15,rise:1.65,banner:true},
   {cx:4.35,cz:.15,r:3.05,hCob:2.45,hLime:4.45,rise:1.45,banner:false}
  ];
  for(const d of drums){
   ynRootSkirt(d.cx,d.cz,d.r,5.2,{mk:'cobble',col:cbCol,plinthH:y0+.24,seg:18});
   ynFloorDisc(d.cx,d.cz,d.r-.06,y0,'flagstone',P('flagstone'),{seg:16});
   ynDrumWall(d.cx,d.cz,d.r-.36,d.r,y0,d.hCob,'cobble',cbCol,[
    {a:PI/2,w:1.30,h:2.20,door:true,visor:true,visorOut:.72},
    {a:d.cx<0?0:PI,w:1.15,h:2.05,door:true,open:true}
   ]);
   ynFloorDisc(d.cx,d.cz,d.r-.12,y0+4.35,'floor',P('floor'),{seg:16});
   ynDrumWall(d.cx,d.cz,d.r-.38,d.r-.04,y0+d.hCob,d.hLime,'sealimeWarm',slWarm,[
    {a:d.cx<0?0:PI,w:1.10,y:1.72,h:2.05,door:true,open:true},
    {a:PI/2,w:.48,y:1.85,h:1.95,pane:'lit'},{a:PI*.25,w:.46,y:2.15,h:1.75},{a:PI*.75,w:.46,y:2.15,h:1.75}
   ]);
   /* Wide low-pitched conical standing-seam metal saucer roof (8cc1fce1!) */
   ynCanopy(d.cx,d.cz,d.r-.04,d.r+1.15,y0+d.hCob+d.hLime,d.rise,{mk:'seam',col:smCol,ribs:10,bell:.06,finialScale:.85,seg:18});
  }

  /* Rear Sloped-Wall Casemate Store-Bay + Elevated Parapet Walkway Bridge + Catenary Shade-Sails! */
  ynNoCut(()=>{
   /* Flagstone supply court strictly between the twin drums (x = [-.90, +.90], top y = .13) */
   const cPts=[[-.90,-.72],[.90,-.72],[.90,2.85],[-.90,2.85]];
   svNoWalk(()=>prism('flagstone',cPts,.02,.13,P('flagstone')));
   svFloor(cPts,.13);
   svNoWalk(()=>{
    ynBelowGrade(()=>box('cobble',0,-4.4,-2.55,5.85,4.4,3.65,cbCol));
    box('sealimeWarm',0,.01,-2.55,5.65,4.32,3.45,slWarm);
    box('ashlar',0,4.34,-2.55,5.82,.18,3.62,asCol);
    /* Elevated Parapet Walkway Bridge spanning between the twin drums at y = 4.65 */
    ynGangplank(-1.15,y0+4.35,.55,1.15,y0+4.35,.55,1.55,{});
    box('sealimeWarm',0,y0+4.40,1.28,2.45,.88,.18,slWarm);
    box('ashlar',0,y0+5.30,1.28,2.55,.10,.24,asCol);

    /* Tall vertical Indigo cloth garrison banner hung down the front of the left bastion drum */
    const bx=-4.35,bz=.15+3.35+.12;
    box('bronze',bx,y0+7.85,bz,1.15,.07,.07,P('bronze'));
    withCloth(clothHang(3.85,.06),()=>quad('flag',bx,y0+5.88,bz+.03,.92,3.85,P('indigo'),0));

    /* Two taut catenary Canvas & Carnelian Shade-Sails stretched across the forecourt! */
    psurf('sail',(u,v)=>{
     const x=lerp(-2.95,2.95,u),z=lerp(.85,4.35,v);
     const sag=.48*Math.sin(u*PI)*Math.sin(v*PI);
     return [x,lerp(5.85,3.65,v)-sag,z];
    },8,6,P('sail'),{dbl:true});
    psurf('kilim',(u,v)=>{
     const x=lerp(-1.85,3.45,u),z=lerp(-1.15,2.15,v);
     const sag=.36*Math.sin(u*PI)*Math.sin(v*PI);
     return [x,lerp(7.15,5.15,u)-sag,z];
    },7,5,P('carnelian'),{dbl:true});
    for(const sx of [-2.95,2.95]){
     cyl('ironwood',sx,.01,4.42,.09,3.68,iwCol,8);
     sagRope('rope',[sx,3.65,4.42],[sx*1.35,.25,5.25],.08,.02,P('rope'),4);
    }
   });
  });

  /* Garrison Armory & Supply Compound Furnishing (8 pieces) */
  FURNISH('yonni_trade_bunk',-4.35,y0,-1.25,0);
  FURNISH('yonni_common_dual_spear_rack',-2.65,y0,.15,-PI/2);
  FURNISH('yonni_trade_armour_stand',-5.95,y0,.15,PI/2);
  FURNISH('yonni_common_brazier',-4.35,y0+.006,1.35,0);
  FURNISH('yonni_trade_barrels',4.35,y0,-1.15,0);
  FURNISH('yonni_trade_bin',4.35,y0,1.25,PI);
  FURNISH('yonni_trade_workbench',0,.138,-.15,0);
  FURNISH('yonni_works_weigh_scale',0,.138,1.55,PI);
 }});

/* ================================================================= 7. VERDIGRIS SCALLOP-CAP SMELTER & SIGNAL PYLONS (yn-smelter-scallop) */
defBuilding({key:'yn-smelter-scallop',name:'Kiln-Sfir Verdigris Scallop-Cap Smelter & Signal Pylons',seed:7608,cls:'building',w:16.8,d:13.8,h:16.8,budget:120000,cut:true,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'freestanding',role:'scallop-cap bronze smelter',job:'smithing'},
 note:'Tapered rust-ironstone & terracotta assay smelter drum crowned by a thick scalloped and oculus-perforated verdigris bronze mushroom dome and smoking flue, flanked by twin ringed bronze signal spire-totems on carved relief plinths.',
 build(){
  const y0=.30,rB=3.65,rT=3.12,hWall=5.65;
  const irCol=P('ironstone'),tcCol=P('terracotta'),vdCol=P('verdigris'),bzCol=P('bronze'),trCol=P('travertine');

  ynRootSkirt(0,0,rB,5.0,{mk:'ironstone',col:irCol,plinthH:y0+.26,seg:18});
  ynFloorDisc(0,0,rB-.06,y0,'flagstone',P('flagstone'),{seg:16});

  /* Tapered Rust-Ironstone & Terracotta Smelter Drum */
  ynDrumWall(0,0,rB-.38,rB,y0,hWall,'ironstone',irCol,[
   {a:PI/2,w:1.55,h:2.35,door:true,open:true,visor:true,visorOut:.82},
   {a:0,w:.82,y:1.25,h:1.45,pane:'lit'},{a:PI,w:.82,y:1.25,h:1.45,pane:'lit'},
   {a:-PI/2,w:.82,y:1.25,h:1.45,pane:'lit'}
  ]);

  /* Thick Scalloped & Oculus-Perforated Verdigris Mushroom Cap + Smoking Assay Flue (dc78d29d!) */
  const yCap=y0+hWall;
  ynNoCut(()=>svNoWalk(()=>{
   sector('terracotta',0,0,rT-.22,rB+.18,0,TAU,yCap+.008,yCap+.36,tcCol,20);
   const rMush=4.25;
   lathe('verdigris',0,0,[
    [rB+.08,yCap+.38],[rMush,yCap+.52],[rMush+.08,yCap+1.35],[rMush*.82,yCap+2.55],[rMush*.44,yCap+3.35],[.95,yCap+3.68]
   ],22,vdCol,{uv:'cone'});
   lathe('travertine',0,0,[
    [rB-.06,yCap+.32],[rMush-.12,yCap+.46],[rMush-.08,yCap+1.28],[rMush*.78,yCap+2.46],[.90,yCap+3.60]
   ],22,trCol,{uv:'cone',inward:true});
   /* 10 arched scallop hoods + recessed dark oculus vents around the mushroom brim! */
   for(let i=0;i<10;i++){
    const a=i/10*TAU,yaw=ynYawFromA(a);
    ynCrescentVisor(0,0,rMush-.02,a,PI/11.5,yCap+.72,.42,'verdigris',vdCol);
    W(Math.cos(a)*(rMush*.94),yCap+1.65,Math.sin(a)*(rMush*.94),yaw,()=>{
     WX(0,0,.012,0,PI/2,0,()=>cyl('ironstone',0,0,0,.24,.02,0x1c1714,10));
     ring('bronze',0,0,.035,.26,.035,bzCol,0,0,0,12);
    });
   }
   /* Central smoking bronze & ironstone smelter chimney rising through the verdigris cap */
   cyl('ironstone',0,yCap+3.69,0,.88,2.45,irCol,14,.68);
   ring('bronze',0,yCap+5.15,0,.82,.06,bzCol,0,0,0,14);
   cone('verdigris',0,yCap+6.15,0,.96,.55,vdCol,14);
   smokeAt(0,yCap+6.85,0,{r:.45});
  }));

  /* Twin Symmetric Ringed Verdigris & Bronze Signal/Resonator Spire-Totems on Carved Plinths (dc78d29d!) */
  ynqSignalTotem(-5.55,.25,14.2);
  ynqSignalTotem(5.55,.25,13.4);
  ynOreHeap(-3.25,3.15,'tin',.85);
  ynOreHeap(3.25,3.15,'iron',.85);

  /* Assay Smelter Interior Furnishing (6 pieces) */
  ynFurn([
   ['yonni_trade_forge',0,y0,-1.45,0],
   ['yonni_trade_anvil',0,y0,.35,0],
   ['yonni_trade_trough',-2.05,y0,-.35,PI/2],
   ['yonni_trade_workbench',2.05,y0,-.35,-PI/2],
   ['yonni_works_weigh_scale',-1.55,y0,1.65,PI*.25],
   ['yonni_trade_barrels',1.65,y0,1.65,-PI*.25]
  ]);
 }});
