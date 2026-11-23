// prefix: hk
// ================================================================= CIVIC NURAGHI COMPLESSI, SANTA CRISTINA STEP-WELL & SACRED HALLS
// 8 defs (seeds 8201..8208): Quadrilobate Nuraghe Complesso Clan Citadel (Su Nuraxi), Santa Cristina Inverted-Keyhole Tsunami-
// Drawdown Sacred Step-Well (core/water), Ukor Tuned-Nephrite Chime-Council Hall, High Matron Ukor Long-Lodge, Emerald-Nephrite
// Clan Bourse, Tide-Reckoners Scriptorium, Thermal-Brine Healer Lodge, and Leviathan-Rib Tomba dei Giganti Ancestor Ossuary.

/* 13. Quadrilobate Nuraghe Complesso Clan Citadel — Su Nuraxi Massing (HK1) */
defBuilding({key:'hk_nuraghe_complesso',name:'Quadrilobate Nuraghe Complesso Clan Citadel',seed:8201,cut:true,
 w:25.6,d:23.6,h:14.2,tags:{types:['civic','military'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  const py=hkPlinth(23.6,20.6,.68,{stepW:3.8,stepRun:1.25});
  /* Central 2-storey Mastio Nuraghe keep with interior stair & upper tholos chamber */
  const yUpper=py+4.4;
  hkNuraghe(0,-.6,py,5.1,3.7,11.2,{
   wallT:1.45,courses:11,
   doors:[{yaw:0,w:1.68,h:2.35}],
   windows:[{yaw:0,w:.92,y:5.4,h:1.05},{yaw:PI/2,w:.88,y:5.4,h:1.0},{yaw:-PI/2,w:.88,y:5.4,h:1.0},{yaw:PI,w:.88,y:5.4,h:1.0}]
  });
  const stM=svStairCase({x0:-2.2,x1:2.2,z0:-2.6,z1:-.4},[py+.06,yUpper],{w:.88,mk:'ashlar',col:P('ashlar'),style:'solid'});
  svWell('paving',0,yUpper-.22,-.6,4.6,.22,4.6,P('paving'),stM.wells[0]);

  /* Four corner bastion torri (quadrilobate Su Nuraxi layout) */
  const bast=[[-7.4,-6.0,-PI*.75],[7.4,-6.0,PI*.75],[-7.4,4.8,-PI*.25],[7.4,4.8,PI*.25]];
  for(const [bx,bz,byaw] of bast){
   hkNuraghe(bx,bz,py,3.15,2.35,7.2,{
    wallT:1.08,courses:8,
    doors:[{yaw:byaw+PI,w:1.25,h:2.05,ajar:.6}],
    windows:[{yaw:byaw,w:.72,y:3.4,h:.85}]
   });
  }
  /* Concave/battered cyclopean basalt curtain walls linking the four corner bastions, with massive nephrite south gate */
  hkWall(-4.6,-6.2,4.6,-6.2,py,4.2,{mk:'basalt',t:.95});
  hkWall(-7.6,-3.1,-7.6,1.9,py,4.2,{mk:'basalt',t:.95});
  hkWall(7.6,-3.1,7.6,1.9,py,4.2,{mk:'basalt',t:.95});
  hkWall(-4.6,5.0,-1.7,5.0,py,4.2,{mk:'basalt',t:.95});
  hkWall(1.7,5.0,4.6,5.0,py,4.2,{mk:'basalt',t:.95});
  hkJadeDoor(0,py,5.0,0,2.45,2.55,{t:.95,lintelH:.44,open:true});

  /* Leviathan jawbone arch inside court + Whale-Clan banners & nephrite alarm chimes */
  hkWhaleJawArch(0,py,7.4,0,4.6,4.5);
  hkWindHanging(-4.2,py,7.8,0,2.4,3.1,{mk:'banner',panels:2});
  hkWindHanging(4.2,py,7.8,0,2.4,3.1,{mk:'banner',panels:2});

  hkTarget(1.2,py+.08,.6,'mastio ground tholos');
  hkTarget(1.2,yUpper,.85,'mastio upper tholos');
  hkTarget(-7.4,py+.08,4.8,'southwest bastion');
  hkTarget(7.4,py+.08,4.8,'southeast bastion');
  hkTarget(0,py,2.4,'citadel ward');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',1.2,py+.08,-.2,0],
   ['hueru-kuran_cedar_feast_trough',1.2,py+.08,-2.1,0],
   ['hueru-kuran_nephrite_chime_rack',-1.8,py+.08,.9,0],
   ['hueru-kuran_harpoon_rack',2.4,py+.08,.4,-PI/2],
   ['hueru-kuran_whalebone_cot',1.2,yUpper,-1.2,0],
   ['generic_strongbox',-1.2,yUpper,-1.6,0],
   ['hueru-kuran_tide_gauge_plinth',-3.4,py,2.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-2.4,py,8.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.4,py,8.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 14. Sardinian Santa Cristina Inverted-Keyhole Tsunami-Drawdown Sacred Step-Well (HK2, core/water) */
defBuilding({key:'hk_stepwell_sanctuary',name:'Santa Cristina Tsunami-Drawdown Sacred Step-Well',seed:8202,
 front:{x:0,z:8.2,yaw:0},
 w:19.6,d:20.4,h:8.6,tags:{types:['religious','infrastructure'],wealth:'rich',style:'hueru-kuran',job:'worship',landmark:true},
 build(){
  /* Raised cyclopean-basalt sacred peribolos at yTop = 1.48 m surrounding a sunken precision-dressed inverted-keyhole
     step-well descending 8 ashlar steps down to a live core/water (WATER.still) coastal-aquifer mirror pool at y = 0.20 m! */
  const yTop=1.48,yPool=.20,yLip=.26;
  /* Register live core/water still coastal-aquifer mirror pool in the north keyhole basin */
  if(CURREC&&!PLACE_DRY){
   const c0=svW(-2.1,yPool,-5.8),c1=svW(2.1,yPool,-1.6);
   const x0=Math.min(c0[0],c1[0]),x1=Math.max(c0[0],c1[0]),z0=Math.min(c0[2],c1[2]),z1=Math.max(c0[2],c1[2]);
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'santa_cristina_aquifer_well',level:yPool,bounds:[x0,z0,x1,z1],
    color:0x164a4c,roughness:.03,metalness:.22,envMapIntensity:.85
   });
  }
  /* Outer terraced peribolos U-deck around the sunken keyhole well [-3.2..3.2, -6.4..4.6] */
  /* West, East, North & South peribolos platforms */
  box('columnar',-6.0,0,-.4,5.4,yTop-.12,14.8,P('columnar'));
  box('ashlar',-6.0,yTop-.12,-.4,5.2,.12,14.6,P('ashlar'));
  wkPad(-6.0,-.4,5.2,14.6,yTop);

  box('columnar',6.0,0,-.4,5.4,yTop-.12,14.8,P('columnar'));
  box('ashlar',6.0,yTop-.12,-.4,5.2,.12,14.6,P('ashlar'));
  wkPad(6.0,-.4,5.2,14.6,yTop);

  box('columnar',0,0,-7.4,17.2,yTop-.12,2.2,P('columnar'));
  box('ashlar',0,yTop-.12,-7.4,17.0,.12,2.0,P('ashlar'));
  wkPad(0,-7.4,17.0,2.0,yTop);

  box('columnar',0,0,5.8,17.2,yTop-.12,2.8,P('columnar'));
  box('ashlar',0,yTop-.12,5.8,17.0,.12,2.6,P('ashlar'));
  wkPad(0,5.8,17.0,2.6,yTop);

  /* Front entrance stair climbing from ground y=0 up to south peribolos yTop at z=7.2..8.8 */
  const nFront=8;
  svNoWalk(()=>{
   for(let i=0;i<nFront;i++){
    const f0=i/nFront,f1=(i+1)/nFront,za=lerp(8.9,7.2,f0),zb=lerp(8.9,7.2,f1);
    box('ashlar',0,yTop*f0,(za+zb)/2,3.6,yTop/nFront,Math.abs(za-zb),P('ashlar'));
   }
   for(const s of [-1,1])box('columnar',s*1.98,0,8.05,.28,yTop+.2,1.8,P('columnar'));
  });
  svStripWalk([0,0,8.95],[0,yTop,7.1],3.6);

  /* Precision-dressed Santa Cristina inverted-keyhole stair descending from z=4.3 (yTop, wide) down to z=-1.4 (yLip, narrow) */
  const nWell=8;
  svNoWalk(()=>{
   /* Dark basalt basin floor under the water pool */
   box('basalt',0,0,-3.7,6.2,.08,5.2,P('basaltD'));
   for(let i=0;i<nWell;i++){
    const f0=i/nWell,f1=(i+1)/nWell;
    const zA=lerp(4.3,-.8,f0),zB=lerp(4.3,-.8,f1);
    const yHi=lerp(yTop,yLip,f0),yLo=lerp(yTop,yLip,f1);
    const hw=hkRigMath.keyholeHalfWidth(3.1,1.85,f0);
    box('ashlar',0,0,(zA+zB)/2,hw*2,yLo,Math.abs(zA-zB),P('ashlar'));
    /* Converging precision-dressed side cheek walls framing the inverted keyhole! */
    for(const s of [-1,1]){
     const cxW=s*(hw+(3.35-hw)/2);
     box('ashlar',cxW,0,(zA+zB)/2,3.35-hw,yTop+.42,Math.abs(zA-zB)-.01,P('ashlar'));
    }
   }
   /* Corbelled semicircular tholos apse enclosing the north aquifer basin */
   sector('ashlar',0,-3.7,2.15,3.35,PI,TAU,0,yTop+.85,P('ashlar'),20);
   sector('corbel',0,-3.7,1.45,2.65,PI,TAU,yTop+.85,yTop+2.25,P('corbel'),20);
   /* Massive 3-ton sawn emerald-nephrite portal lintel spanning the keyhole mouth + relieving slit */
   for(const s of [-1,1])box('columnar',s*2.85,yTop,4.2,.52,2.65,.62,P('columnar'));
   box('nephrite',0,yTop+2.65,4.2,6.4,.44,.72,P('nephrite'));
   for(const s of [-1,1])box('corbel',s*1.65,yTop+3.09,4.2,1.8,.42,.56,P('corbel'));
  });
  /* Walkable observation lip at bottom of keyhole stair (z=-1.15, y=yLip) + strip down the keyhole steps! */
  box('ashlar',0,0,-1.15,2.2,yLip,.65,P('ashlar'));
  wkPad(0,-1.15,2.2,.65,yLip);
  svStripWalk([0,yTop,4.35],[0,yLip,-.9],1.8);

  /* Suspended emerald-nephrite tsunami-drawdown tide-chimes directly above the mirror pool & keyhole threshold! */
  hkNephriteChimes(0,yTop+2.55,4.2,0,3.2,1.25,7);
  hkNephriteChimes(0,yTop+2.1,-2.2,0,2.4,1.35,5);
  haloAt(0,yPool+.45,-3.6,0x4ce89c,true);

  hkTarget(0,yTop,5.8,'keyhole threshold');
  hkTarget(0,yLip,-1.15,'aquifer drawdown lip');
  hkTarget(-6.0,yTop,0,'west sacred terrace');
  hkTarget(6.0,yTop,0,'east sacred terrace');
  hkFurnList([
   ['hueru-kuran_tide_gauge_plinth',-2.4,yTop,-6.8,0,{setting:'outdoor'}],
   ['hueru-kuran_tide_gauge_plinth',2.4,yTop,-6.8,0,{setting:'outdoor'}],
   ['hueru-kuran_nephrite_chime_rack',-6.2,yTop,-2.4,PI/2,{setting:'outdoor'}],
   ['hueru-kuran_nephrite_chime_rack',6.2,yTop,-2.4,-PI/2,{setting:'outdoor'}],
   ['hueru-kuran_whale_oil_hearth',-6.0,yTop,2.6,0,{setting:'outdoor'}],
   ['hueru-kuran_whale_oil_hearth',6.0,yTop,2.6,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-3.6,yTop,6.2,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',3.6,yTop,6.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 15. Ukor Tuned-Nephrite Chime-Council Hall (HK3 + HK4) */
defBuilding({key:'hk_ukor_council',name:'Ukor Tuned-Nephrite Chime-Council Hall',seed:8203,cut:true,
 w:22.4,d:21.2,h:11.2,tags:{types:['civic'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  const py=hkPlinth(20.4,18.4,.62,{stepW:3.6,stepRun:1.15});
  /* Great circular 2.75 m basalt ring-wall + 14 pelagic whale-rib vault + 6-fin Jomon kaen-doki crown */
  hkChise(0,-.6,py,7.6,2.75,3.35,3.45,{
   ribs:14,rSmoke:.95,crownH:1.05,crownFins:6,floorMk:'paving',
   doors:[{yaw:0,w:1.85,h:2.35},{yaw:PI,w:1.5,h:2.15,ajar:.6}],
   windows:[{yaw:PI/2,w:1.05,y:1.15,h:1.05},{yaw:-PI/2,w:1.05,y:1.15,h:1.05},{yaw:PI*.28,w:.92,y:1.15,h:.98,seaglass:true},{yaw:-PI*.28,w:.92,y:1.15,h:.98,seaglass:true}]
  });
  /* Leviathan jawbone council arch + four wind-rigged tuned nephrite chime batteries round the perimeter */
  hkWhaleJawArch(0,py,7.5,0,4.8,4.6);
  hkNephriteChimes(-5.6,py+3.2,6.8,0,2.8,1.35,6);
  hkNephriteChimes(5.6,py+3.2,6.8,0,2.8,1.35,6);
  hkWindHanging(-8.2,py,2.2,PI/2,2.8,3.2,{mk:'banner',panels:2});
  hkWindHanging(8.2,py,2.2,-PI/2,2.8,3.2,{mk:'banner',panels:2});

  hkTarget(0,py+.08,-.6,'ukor chime floor');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,py+.08,-.6,0],
   ['hueru-kuran_nephrite_chime_rack',0,py+.08,-3.8,0],
   ['hueru-kuran_nephrite_chime_rack',-3.4,py+.08,-.6,PI/2],
   ['hueru-kuran_nephrite_chime_rack',3.4,py+.08,-.6,-PI/2],
   ['hueru-kuran_cedar_feast_trough',-2.2,py+.08,1.4,PI/4],
   ['hueru-kuran_cedar_feast_trough',2.2,py+.08,1.4,-PI/4],
   ['hueru-kuran_seal_pelt_mat',0,py+.08,-2.4,0,{v:0}],
   ['hueru-kuran_jade_lamp_pedestal',-3.2,py,7.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',3.2,py,7.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 16. High Matron's Twin-Vaulted Whale-Rib Ukor Long-Lodge (HK3) */
defBuilding({key:'hk_ukor_matron_lodge',name:'High Matron Pelagic Whale-Rib Ukor Long-Lodge',seed:8204,cut:true,
 w:22.8,d:16.8,h:10.4,tags:{types:['civic','dwelling-single'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(21.0,14.2,.58,{stepW:3.4,stepRun:1.1});
  /* Thick battered basalt long-hall walls vaulted by 7 transverse bleached whale-rib arches & twin Jomon kaen-doki crowns */
  hkWallRing(-8.8,-5.2,8.8,4.2,py,3.3,{mk:'basalt',postMk:'columnar',t:.68,holes:{
   s:[{at:8.8,w:1.85,h:2.3},{at:3.6,w:1.0,y:1.1,h:1.0},{at:14.0,w:1.0,y:1.1,h:1.0}],
   n:[{at:4.4,w:1.0,y:1.1,h:1.0},{at:8.8,w:1.0,y:1.1,h:1.0},{at:13.2,w:1.0,y:1.1,h:1.0}],
   e:[{at:4.7,w:1.0,y:1.1,h:1.0}],
   w:[{at:4.7,w:1.0,y:1.1,h:1.0}]
  }});
  hkJadeDoor(0,py,4.2,0,1.85,2.3,{t:.68});
  for(const sx of [-5.2,5.2])hkJadeWindow(sx,py+1.1,4.2,0,1.0,1.0,{t:.68});
  for(const sx of [-4.4,0,4.4])hkJadeWindow(sx,py+1.1,-5.2,PI,1.0,1.0,{t:.68,seaglass:sx===0});
  hkJadeWindow(8.8,py+1.1,-.5,PI/2,1.0,1.0,{t:.68});
  hkJadeWindow(-8.8,py+1.1,-.5,-PI/2,1.0,1.0,{t:.68});

  const yR=py+3.54;
  hkTurfRoof(0,yR,-.5,18.2,10.0,2.25,{mk:'turf',over:.55});
  /* Proud exterior & interior transverse pelagic whale-rib arches clamping the long-lodge roof + twin kaen-doki crowns */
  svNoWalk(()=>{
   for(let i=-3;i<=3;i++){
    const xx=i*2.55;
    tube('whalebone',t=>{
     const zz=lerp(-5.45,4.45,t),u=2*t-1,yy=yR+.15+2.35*(1-u*u);
     return [xx,yy,zz];
    },()=>[.08,.12],12,6,P('whalebone'),{caps:true});
   }
  });
  hkKaenCrown(-3.8,yR+2.38,-.5,.44,.82,4);
  hkKaenCrown(3.8,yR+2.38,-.5,.44,.82,4);
  hkWhaleJawArch(0,py,5.8,0,4.0,3.9);

  hkTarget(-4.2,py,-.5,'west feast bay');
  hkTarget(4.2,py,-.5,'east matron dais');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-3.8,py,-.5,0],
   ['hueru-kuran_whale_oil_hearth',3.8,py,-.5,0],
   ['hueru-kuran_cedar_feast_trough',-3.8,py,-2.6,0],
   ['hueru-kuran_cedar_feast_trough',0,py,-2.6,0],
   ['hueru-kuran_nephrite_chime_rack',6.8,py,-.5,-PI/2],
   ['hueru-kuran_whalebone_cot',6.6,py,-3.2,-PI/2],
   ['hueru-kuran_seal_pelt_mat',4.6,py,-2.4,0,{v:0}],
   ['hueru-kuran_harpoon_rack',-7.2,py,-2.8,PI/2],
   ['hueru-kuran_jade_lamp_pedestal',-2.6,py,5.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.6,py,5.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 17. Crookshore Emerald-Nephrite & Ambergris Clan Bourse (HK1 + HK4) */
defBuilding({key:'hk_jade_exchange',name:'Emerald-Nephrite and Ambergris Clan Bourse',seed:8205,cut:true,
 w:19.6,d:15.8,h:9.8,tags:{types:['civic','market'],wealth:'rich',style:'hueru-kuran',job:'trading',market:true},
 build(){
  const py=hkPlinth(18.0,13.4,.54,{stepW:3.2,stepRun:1.05});
  /* West basalt assay nuraghe + East sawn-nephrite colonnaded weighing court under translucent gutskin sail */
  hkNuraghe(-4.4,-.4,py,3.9,2.85,7.8,{
   wallT:1.25,courses:8,
   doors:[{yaw:0,w:1.45,h:2.15},{yaw:PI/2,w:1.3,h:2.05,ajar:.7}],
   windows:[{yaw:-PI/2,w:.82,y:3.6,h:.9}]
  });
  svNoWalk(()=>{
   for(const sx of [1.2,4.2,7.2])for(const sz of [-4.2,3.6]){
    box('ashlar',sx,py,sz,.56,.22,.56,P('ashlar'));
    box('nephrite',sx,py+.22,sz,.36,2.75,.36,P('nephrite'));
   }
   box('cypress',4.2,py+2.97,-4.2,6.8,.22,.48,P('cypress'));
   box('cypress',4.2,py+2.97,3.6,6.8,.22,.48,P('cypress'));
  });
  hkGutskinAwning(.8,-4.5,7.6,3.9,py+3.19,py+3.55,{posts:false,sag:.26});
  hkNephriteChimes(4.2,py+2.9,3.6,0,2.8,1.05,6);

  hkTarget(-4.4,py+.08,-.4,'jade assay vault');
  hkTarget(4.2,py,-.3,'weighing court');
  hkFurnList([
   ['generic_strongbox',-4.4,py+.08,-1.6,0],
   ['generic_poor_counter',-3.4,py+.08,-.2,-PI/2],
   ['generic_writing_supplies',-3.4,py+.96,-.2,-PI/2],
   ['hueru-kuran_jade_saw_bench',2.8,py,-1.8,0,{setting:'outdoor'}],
   ['hueru-kuran_kaen_storage_jar',5.8,py,-2.2,0,{v:1,setting:'outdoor'}],
   ['hueru-kuran_driftwood_chest',5.8,py,.8,PI,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',.8,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 18. Tide-Reckoners & Tsunami-Chronicle Scriptorium (HK3) */
defBuilding({key:'hk_lore_hall',name:'Tide-Reckoners and Tsunami-Chronicle Hall',seed:8206,cut:true,
 w:16.8,d:14.6,h:8.8,tags:{types:['civic'],wealth:'middle',style:'hueru-kuran',job:'scribing'},
 build(){
  const py=hkPlinth(15.2,12.2,.48,{stepW:2.8,stepRun:.95});
  hkChise(0,-.3,py,5.6,2.45,2.85,2.55,{
   ribs:12,crownH:.84,crownFins:4,
   doors:[{yaw:0,w:1.5,h:2.15}],
   windows:[{yaw:PI/2,w:.95,y:1.05,h:.98,seaglass:true},{yaw:-PI/2,w:.95,y:1.05,h:.98,seaglass:true},{yaw:PI,w:.95,y:1.05,h:.98}]
  });
  hkNephriteChimes(-4.6,py+2.65,4.6,0,2.2,1.05,5);
  hkTarget(0,py+.08,-.3,'tide scriptorium');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,py+.08,-.3,0],
   ['hueru-kuran_cedar_feast_trough',-1.9,py+.08,-.4,PI/2],
   ['generic_writing_supplies',-1.9,py+.6,-.4,PI/2],
   ['hueru-kuran_tide_gauge_plinth',1.9,py+.08,-1.4,0],
   ['hueru-kuran_nephrite_chime_rack',0,py+.08,-2.5,0],
   ['hueru-kuran_seal_pelt_mat',1.6,py+.08,1.1,-PI/2,{v:2}]
  ]);
 }});

/* 19. Ambergris & Thermal-Brine Healer Lodge (HK3 + core/water) */
defBuilding({key:'hk_healer_lodge',name:'Ambergris and Thermal-Brine Healer Lodge',seed:8207,cut:true,
 w:18.2,d:14.8,h:8.4,tags:{types:['civic'],wealth:'middle',style:'hueru-kuran',job:'healing'},
 build(){
  const py=hkPlinth(16.6,12.4,.48,{stepW:2.8,stepRun:.95});
  /* West healer chise + East sunken basalt-rimmed thermal brine soaking pool on core/water (WATER.still)! */
  hkChise(-2.8,-.3,py,4.95,2.3,2.7,2.35,{
   ribs:10,crownH:.78,crownFins:4,
   doors:[{yaw:0,w:1.42,h:2.1},{yaw:PI/2,w:1.25,h:2.0,ajar:.7}],
   windows:[{yaw:-PI/2,w:.85,y:1.0,h:.88,seaglass:true},{yaw:PI,w:.85,y:1.0,h:.88}]
  });
  if(CURREC&&!PLACE_DRY){
   const a=svW(3.4,py+.22,-2.6),b=svW(6.8,py+.22,1.6);
   const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[2],b[2]),z1=Math.max(a[2],b[2]);
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'healer_thermal_brine_pool',level:py+.22,bounds:[x0,z0,x1,z1],
    color:0x286e68,roughness:.05,metalness:.14,envMapIntensity:.75
   });
  }
  svNoWalk(()=>{
   /* Raised dressed basalt curbing enclosing the thermal brine pool [3.4..6.8, -2.6..1.6] */
   for(const sz of [-2.8,1.8])box('ashlar',5.1,py,sz,3.9,.34,.32,P('ashlar'));
   for(const sx of [3.25,6.95])box('ashlar',sx,py,-.5,.32,.34,4.28,P('ashlar'));
   box('basalt',5.1,py,-.5,3.38,.06,3.96,P('basaltD'));
  });
  smokeAt(5.1,py+.35,-.5,{r:.45,kind:'steam'});
  hkGutskinAwning(3.0,-3.2,7.2,2.2,py,py+2.85,{sag:.25});

  hkTarget(-2.8,py+.08,-.3,'apothecary chise');
  hkTarget(5.1,py,3.4,'thermal pool deck');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.8,py+.08,-.3,0],
   ['hueru-kuran_whalebone_cot',-4.3,py+.08,-.8,PI/2],
   ['generic_medicine',-2.8,py+.08,-2.1,0],
   ['generic_herb_bundles',-1.4,py+.08,-1.6,0],
   ['hueru-kuran_kaen_storage_jar',-3.8,py+.08,1.1,0,{v:1}],
   ['hueru-kuran_jade_lamp_pedestal',2.8,py,3.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 20. Leviathan-Rib Tomba dei Giganti Ancestor Ossuary (HK1 + HK3) */
defBuilding({key:'hk_ossuary_barrow',name:'Leviathan-Rib Tomba dei Giganti Ossuary',seed:8208,cut:true,
 w:19.4,d:17.2,h:8.6,tags:{types:['funerary','religious'],wealth:'rich',style:'hueru-kuran',job:'worship'},
 build(){
  const py=hkPlinth(17.6,14.8,.52,{stepW:3.2,stepRun:1.05});
  /* Elongated basalt & turf funerary gallery mound + Sardinian semicircular orthostat exedra of basalt & nephrite stelae! */
  hkWallRing(-3.4,-6.2,3.4,1.6,py,2.9,{mk:'basalt',postMk:'columnar',t:.72,holes:{
   s:[{at:3.4,w:1.35,h:1.95}]
  }});
  hkJadeDoor(0,py,1.6,0,1.35,1.95,{t:.72,lintelH:.42});
  hkTurfRoof(0,py+3.16,-2.3,7.6,8.4,1.85,{mk:'turf',over:.45});
  svNoWalk(()=>{
   for(let i=-2;i<=2;i++){
    const zz=-2.3+i*1.65;
    tube('whalebone',t=>{
     const xx=lerp(-4.1,4.1,t),u=2*t-1,yy=py+3.2+1.95*(1-u*u);
     return [xx,yy,zz];
    },()=>[.075,.11],10,6,P('whalebone'),{caps:true});
   }
   /* Semicircular Sardinian Tomba dei Giganti orthostat stelae exedra curving south around forecourt */
   for(let k=-4;k<=4;k++){
    if(k===0)continue;
    const f=k/4,ang=f*1.18,rx=Math.sin(ang)*5.8,rz=1.8+(1-Math.cos(ang))*3.6;
    const sh=3.35-Math.abs(f)*1.35,isJade=Math.abs(k)===1;
    box(isJade?'nephrite':'columnar',rx,py,rz,.58,sh,.34,P(isJade?'nephrite':'columnar'),-ang*.6);
   }
  });
  hkWhaleJawArch(0,py,2.5,0,3.4,3.8);
  hkNephriteChimes(0,py+2.6,5.2,0,2.4,1.0,5);

  hkTarget(0,py,-2.3,'ossuary chamber');
  hkTarget(0,py,4.2,'exedra forecourt');
  hkFurnList([
   ['generic_trade_altar',0,py,-4.5,0],
   ['hueru-kuran_nephrite_chime_rack',-1.9,py,-2.4,PI/2],
   ['hueru-kuran_kaen_storage_jar',1.9,py,-3.8,0,{v:1}],
   ['hueru-kuran_kaen_storage_jar',1.9,py,-1.2,0,{v:0}],
   ['hueru-kuran_jade_lamp_pedestal',-2.2,py,4.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.2,py,4.4,0,{setting:'outdoor'}]
  ]);
 }});
