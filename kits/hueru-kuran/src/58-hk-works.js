// prefix: hk
// ================================================================= CROOKSHORE NEPHRITE SAWMILLS, WHALE WORKS & CENSUS TRADES (HK4)
// 16 defs (seeds 8301..8316): Water-Powered Nephrite Pendulum Wire-Saw Mill (core/water), Whale-Blubber & Ambergris Try-Works,
// Baleen-Laminate Bowyer & Cordage Loft, Kelp-Soda & Quartz-Sand Sea-Green Glassworks (silica=150), Harpoon Smithy, Jomon
// Kaen-Doki Climbing Kiln, Smokehouse-Saltery, Bakehouse, Oiled Seal-Hide Tailor, Kelp Brew-Lodge, +690 m Red-Cypress Flume
// Yard, Gutskin Market Stalls, Rat-Proof Granary-Nuraghe, Whale-Oil Vault Warehouse, Terrace Croft, and Nephrite Quarry-Mine.

/* 21. Water-Powered Nephrite Pendulum Wire-Saw Mill (jade=200 + core/water) */
defBuilding({key:'hk_jade_sawmill',name:'Water-Powered Nephrite Pendulum Wire-Saw Mill',seed:8301,cut:true,
 w:21.6,d:16.8,h:9.6,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'masonry'},
 build(){
  /* Live core/water millrace flowing west-to-east along north basalt raceway z = -5.4 */
  if(CURREC&&!PLACE_DRY){
   const a=svW(-9.8,.22,-5.4),b=svW(9.8,.14,-5.4);
   CURREC.river={name:'nephrite_sawmill_race',pts:[[a[0],a[2],a[1]],[b[0],b[2],b[1]]],width:2.4,speed:1.35};
  }
  const py=.52;
  box('columnar',0,0,1.2,19.6,py-.1,10.6,P('columnar'));
  box('paving',0,py-.1,1.2,19.2,.1,10.2,P('paving'));
  wkPad(0,1.2,19.2,10.2,py);
  svNoWalk(()=>{
   for(let i=0;i<3;i++)box('ashlar',0,py*i/3,6.8-.28*i,3.0,py/3,.28,P('ashlar'));
   /* Dressed basalt millrace channel wall along north */
   box('ashlar',0,0,-6.9,19.6,.68,.42,P('ashlar'));
   /* Spoked 3.6 m red-cypress & bronze undershot waterwheel at (-5.2, -5.2) + horizontal drive axle into saw-house */
   W(-5.2,py+1.45,-5.2,0,()=>{
    ring('cypress',0,0,0,1.72,.12,P('cypress'),PI/2,0,0,20);
    ring('bronze',0,0,0,.45,.07,P('bronze'),PI/2,0,0,12);
    for(let k=0;k<8;k++){
     const ang=k*PI/4;
     pole('cypress',[Math.cos(ang)*.5,Math.sin(ang)*.5,0],[Math.cos(ang)*1.66,Math.sin(ang)*1.66,0],.045,P('cypressD'),6);
     box('driftwood',Math.cos(ang)*1.84,Math.sin(ang)*1.84,0,.06,.3,.68,P('driftwood'),0,0,ang);
    }
    pole('cypress',[0,0,-.5],[0,0,4.2],.14,P('cypressD'),10);
   });
   /* Twin heavy red-cypress gallows frames oscillating bronze-wire & quartz-slurry pendulum saws slicing a 4-ton nephrite boulder! */
   W(-5.2,py,.8,0,()=>{
    for(const sx of [-2.4,2.4])for(const sz of [-1.8,1.8]){
     box('cypress',sx,0,sz,.24,3.85,.24,P('cypressD'));
    }
    for(const sz of [-1.8,1.8])box('cypress',0,3.85,sz,5.2,.22,.26,P('cypress'));
    /* Massive 4-ton raw emerald-nephrite boulder with sawn kerf slots on basalt bed */
    box('ashlar',0,0,0,3.4,.34,2.2,P('ashlar'));
    box('nephrite',-.52,.34,0,1.65,1.28,1.52,P('nephrite'));
    box('nephrite',.72,.34,0,.42,1.24,1.48,P('nephriteBright'));
    box('nephrite',1.32,.34,0,.38,1.18,1.46,P('nephrite'));
    /* Twin suspended pendulum wire-saw frames + quartz-sand drip hoppers */
    for(const kz of [-.38,.38]){
     for(const sx of [-1.85,1.85])pole('whalebone',[sx,1.25,kz],[sx*.78,3.78,kz],.055,P('whalebone'),6);
     beam('cypress',[-1.95,1.25,kz],[1.95,1.25,kz],.09,P('cypress'),false);
     pole('bronze',[-1.85,.98,kz],[1.85,.98,kz],.012,P('bronze'),6);
    }
    cone('kaen',0,2.85,0,.36,.52,P('kaen'),10);
   });
  });
  svStripWalk([0,0,6.95],[0,py,6.1],3.0);

  /* East enclosed jade-polishing & chime-tuning lodge + gutskin canopy over wire-saw pit */
  hkWallRing(1.2,-3.2,8.4,5.0,py,3.35,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:3.6,w:1.55,h:2.18}],
   w:[{at:4.1,w:1.4,h:2.1}],
   e:[{at:4.1,w:.92,y:1.05,h:.92}]
  }});
  hkJadeDoor(4.8,py,5.0,0,1.55,2.18);
  hkJadeDoor(1.2,py,.9,-PI/2,1.4,2.1,{open:true});
  hkJadeWindow(8.4,py+1.05,.9,PI/2,.92,.92);
  hkTurfRoof(4.8,py+3.59,.9,7.8,8.8,1.55,{mk:'turf',kaen:true});
  hkGutskinAwning(-8.8,-2.2,-.8,4.2,py+4.15,py+4.65,{sag:.28});
  hkNephriteChimes(-4.8,py+3.95,4.25,0,2.8,1.15,6);

  hkTarget(4.8,py,.9,'polishing workshop');
  hkTarget(-4.8,py,4.6,'pendulum saw deck');
  hkFurnList([
   ['hueru-kuran_jade_saw_bench',4.8,py,-1.2,0],
   ['generic_trade_grindstone',6.8,py,1.8,-PI/2],
   ['hueru-kuran_nephrite_chime_rack',3.2,py,3.2,PI],
   ['generic_sack',-8.2,py,4.6,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',0,py,5.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 22. Whale-Blubber & Ambergris Rendering Try-Works (HK4) */
defBuilding({key:'hk_blubber_tryworks',name:'Whale-Blubber and Ambergris Rendering Try-Works',seed:8302,cut:true,
 w:19.2,d:15.4,h:8.8,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'oil'},
 build(){
  const py=hkPlinth(17.6,13.0,.48,{stepW:3.0,stepRun:.95});
  /* West ambergris & cask storehouse + East cyclopean-basalt twin-cauldron furnace bank under gutskin rain-hood */
  hkChise(-3.8,-.3,py,4.7,2.2,2.65,2.25,{
   ribs:10,crownH:.78,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.12}],
   windows:[{yaw:-PI/2,w:.85,y:1.0,h:.88}]
  });
  svNoWalk(()=>{
   /* Cyclopean basalt try-works furnace bank with twin riveted bronze cauldrons & Jomon kaen-doki smoke flues */
   box('basalt',4.4,py,-1.6,5.8,1.15,3.2,P('basalt'));
   for(const sx of [2.9,5.9]){
    box('glow',sx,py+.18,.02,.46,.42,.08,P('ember'));
    cyl('bronze',sx,py+1.15,-1.4,.95,.72,P('bronze'),14);
    cyl('glow',sx,py+1.87,-1.4,.82,.04,P('flame'),14);
    haloAt(sx,py+1.95,-1.4,0xff9638,true);
    hkKaenCrown(sx,py+1.15,-2.7,.38,1.45,4,{smokeKind:'fire'});
   }
   /* Carved basalt oil-cooling trough */
   box('ashlar',4.4,py,2.4,4.6,.58,1.2,P('ashlar'));
  });
  hkGutskinAwning(1.2,-3.6,7.6,4.2,py,py+3.65,{sag:.26});
  hkWindHanging(-7.4,py,3.8,0,2.2,2.45,{mk:'kelp',panels:2});

  hkTarget(-3.8,py+.08,-.3,'ambergris store');
  hkTarget(4.4,py,4.4,'try-works apron');
  hkFurnList([
   ['hueru-kuran_kaen_storage_jar',-3.8,py+.08,-1.8,0,{v:0}],
   ['hueru-kuran_kaen_storage_jar',-2.6,py+.08,-1.4,0,{v:1}],
   ['generic_barrel',-5.0,py+.08,-.6,0],
   ['hueru-kuran_driftwood_chest',-3.8,py+.08,1.1,PI],
   ['hueru-kuran_blubber_kettle',1.8,py,3.6,0,{setting:'outdoor'}],
   ['job_oil_drum_rack',6.8,py,3.6,-PI/2,{setting:'outdoor'}]
  ]);
 }});

/* 23. Baleen-Laminate Bowyer & Harpoon-Line Cordage Loft (HK3 + HK4) */
defBuilding({key:'hk_baleen_loft',name:'Baleen-Laminate Bowyer and Cordage Loft',seed:8303,cut:true,
 w:19.4,d:14.6,h:8.4,tags:{types:['industry','shop'],wealth:'middle',style:'hueru-kuran',job:'ropemaking'},
 build(){
  const py=hkPlinth(17.8,12.2,.46,{stepW:2.8,stepRun:.95});
  hkWallRing(-8.0,-4.4,1.4,3.4,py,3.25,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:4.7,w:1.5,h:2.15},{at:1.6,w:.9,y:1.0,h:.9}],
   e:[{at:3.9,w:1.35,h:2.05}]
  }});
  hkJadeDoor(-3.3,py,3.4,0,1.5,2.15);
  hkJadeWindow(-6.4,py+1.0,3.4,0,.9,.9);
  hkJadeDoor(1.4,py,-.5,PI/2,1.35,2.05,{open:true});
  hkTurfRoof(-3.3,py+3.49,-.5,10.0,8.4,1.55,{mk:'bark',kaen:true});

  /* Outdoor harpoon-cordage ropewalk bollards & catenary twisted baleen cables */
  svNoWalk(()=>{
   for(const sx of [2.6,7.6]){
    box('columnar',sx,py,-2.6,.44,1.35,.44,P('columnar'));
    box('columnar',sx,py,1.8,.44,1.35,.44,P('columnar'));
    cyl('cypress',sx,py+1.35,-2.6,.18,.28,P('cypress'),10);
    cyl('cypress',sx,py+1.35,1.8,.18,.28,P('cypress'),10);
   }
   for(const sz of [-2.6,1.8]){
    sagRope('rope',[2.6,py+1.52,sz],[7.6,py+1.52,sz],.24,.022,P('rope'),10);
    sagRope('rope',[2.6,py+1.18,sz],[7.6,py+1.18,sz],.18,.018,P('baleen'),10);
   }
  });
  hkWindHanging(5.1,py,4.2,0,3.2,2.5,{mk:'netting',panels:3});

  hkTarget(-3.3,py,-.5,'bowyer loft');
  hkTarget(5.1,py,-.4,'cordage walk');
  hkFurnList([
   ['hueru-kuran_baleen_bow_trough',-5.2,py,-1.8,0],
   ['hueru-kuran_baleen_loom',-1.4,py,-2.2,0],
   ['hueru-kuran_harpoon_rack',-6.4,py,1.4,PI/2],
   ['generic_training_archery_butt',7.2,py,-.4,-PI/2,{setting:'outdoor'}],
   ['hueru-kuran_driftwood_chest',-1.6,py,1.6,PI]
  ]);
 }});

/* 24. Kelp-Soda & Quartz-Sand Sea-Green Glassworks (silica=150) */
defBuilding({key:'hk_kelp_glassworks',name:'Kelp-Soda and Quartz-Sand Sea-Green Glassworks',seed:8304,cut:true,
 w:18.8,d:15.4,h:9.4,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'lampmaking'},
 build(){
  const py=hkPlinth(17.2,13.0,.5,{stepW:2.8,stepRun:.95});
  /* West glassblower & annealing hall + East corbelled basalt beehive glass-furnace with glowing glory-hole! */
  hkWallRing(-7.8,-4.6,1.2,3.8,py,3.35,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:4.5,w:1.55,h:2.18},{at:1.6,w:1.0,y:1.0,h:1.0}],
   n:[{at:4.5,w:1.0,y:1.0,h:1.0}]
  }});
  hkJadeDoor(-3.3,py,3.8,0,1.55,2.18);
  hkJadeWindow(-6.2,py+1.0,3.8,0,1.0,1.0,{seaglass:true});
  hkJadeWindow(-3.3,py+1.0,-4.6,PI,1.0,1.0,{seaglass:true});
  hkTurfRoof(-3.3,py+3.59,-.4,9.6,9.0,1.5,{mk:'turf'});

  svNoWalk(()=>{
   /* Corbelled basalt beehive glass-furnace at (4.9, -.6) */
   cyl('columnar',4.9,py,-.6,2.65,.85,P('columnar'),18);
   lathe('corbel',4.9,-.6,[[2.55,py+.85],[2.2,py+2.1],[1.45,py+3.35],[.68,py+4.2]],18,P('corbel'));
   hkKaenCrown(4.9,py+4.22,-.6,.58,1.15,6,{smokeKind:'fire'});
   /* Glowing molten glass glory-hole facing +z + stacked sea-green kelp-glass floats */
   box('ashlar',4.9,py+.85,1.88,1.1,.95,.36,P('ashlar'));
   box('glow',4.9,py+1.02,2.08,.56,.54,.08,P('flame'));
   haloAt(4.9,py+1.3,2.25,0xffa442,true);
   for(let i=0;i<3;i++)sph('seaglass',2.6+i*.58,py+.26,3.4,.26,P('seaglass'),1,12);
  });

  hkTarget(-3.3,py,-.4,'glassblowing floor');
  hkTarget(4.9,py,3.6,'furnace apron');
  hkFurnList([
   ['generic_poor_workbench',-5.6,py,-2.2,0],
   ['generic_trade_forge',-1.4,py,-2.4,0],
   ['generic_bottle_crate',-5.8,py,1.4,PI/2],
   ['hueru-kuran_kaen_storage_jar',-1.4,py,1.6,0,{v:2}],
   ['generic_sack',6.8,py,2.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',1.8,py,4.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 25. Bronze & Meteoric-Iron Harpoon Smithy */
defBuilding({key:'hk_harpoon_smithy',name:'Bronze and Meteoric-Iron Harpoon Smithy',seed:8305,cut:true,
 w:16.8,d:14.4,h:8.6,tags:{types:['industry','shop'],wealth:'middle',style:'hueru-kuran',job:'smithing'},
 build(){
  const py=hkPlinth(15.2,12.0,.48,{stepW:2.8,stepRun:.95});
  hkChise(-2.0,-.3,py,4.9,2.3,2.75,2.35,{
   ribs:10,crownH:.9,crownFins:4,
   doors:[{yaw:0,w:1.48,h:2.14},{yaw:PI/2,w:1.3,h:2.05,ajar:.8}],
   windows:[{yaw:-PI/2,w:.85,y:1.0,h:.88}]
  });
  hkGutskinAwning(3.0,-3.4,6.8,3.6,py,py+2.95,{mk:'hide',sag:.22});
  hkTarget(-2.0,py+.08,-.3,'smithy hearth');
  hkTarget(4.8,py,.2,'anvil yard');
  hkFurnList([
   ['generic_trade_forge',-2.0,py+.08,-1.9,0],
   ['generic_trade_anvil',-2.0,py+.08,-.1,0],
   ['hueru-kuran_harpoon_rack',-3.6,py+.08,-.3,PI/2],
   ['generic_fuel',-.6,py+.08,-1.5,0],
   ['generic_trade_grindstone',4.8,py,-1.4,0,{setting:'outdoor'}],
   ['generic_trade_trough',4.8,py,1.4,0,{setting:'outdoor'}],
   ['generic_trade_weapon_rack',6.2,py,0,-PI/2,{setting:'outdoor'}]
  ]);
 }});

/* 26. Jomon Kaen-Doki Flame-Ceramic Climbing Kiln */
defBuilding({key:'hk_kaen_kiln',name:'Jomon Kaen-Doki Flame-Ceramic Climbing Kiln',seed:8306,cut:true,
 w:18.6,d:16.2,h:8.8,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'pottery'},
 build(){
  const py=hkPlinth(17.0,13.6,.48,{stepW:2.8,stepRun:.95});
  /* West potter throwing chise + East 3-chamber stepped Jomon climbing kiln ascending south-to-north */
  hkChise(-3.4,-.2,py,4.65,2.2,2.65,2.2,{
   ribs:8,crownH:.82,crownFins:6,
   doors:[{yaw:0,w:1.4,h:2.1}],
   windows:[{yaw:-PI/2,w:.82,y:1.0,h:.86}]
  });
  svNoWalk(()=>{
   for(let k=0;k<3;k++){
    const zz=2.4-k*2.6,yk=py+k*.42,rk=1.62-.1*k;
    box('basalt',4.4,py,zz,3.6,.38+k*.42,2.35,P('basalt'));
    lathe('kaen',4.4,zz,[[rk,yk+.38],[rk*.88,yk+1.25],[rk*.45,yk+1.95]],14,P('kaen'));
    if(k===2)hkKaenCrown(4.4,yk+1.96,zz,.44,.88,6,{smokeKind:'fire'});
   }
   box('glow',4.4,py+.48,3.6,.48,.44,.08,P('ember'));
   haloAt(4.4,py+.7,3.75,0xff8e36,true);
  });
  hkTarget(-3.4,py+.08,-.2,'throwing room');
  hkTarget(4.4,py,4.8,'kiln stoking apron');
  hkFurnList([
   ['generic_poor_workbench',-3.4,py+.08,-1.8,0],
   ['hueru-kuran_kaen_storage_jar',-4.8,py+.08,-.4,0,{v:0}],
   ['hueru-kuran_kaen_storage_jar',-2.0,py+.08,-.4,0,{v:1}],
   ['hueru-kuran_kaen_storage_jar',-3.4,py+.08,1.2,0,{v:2}],
   ['generic_fuel',2.2,py,4.2,0,{setting:'outdoor'}],
   ['generic_storage_jar',6.4,py,4.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 27. Red-Cypress Whale & Salmon Smokehouse-Saltery */
defBuilding({key:'hk_smokehouse_saltery',name:'Red-Cypress Whale and Salmon Smokehouse-Saltery',seed:8307,cut:true,
 w:18.2,d:14.8,h:8.6,tags:{types:['industry'],wealth:'poor',style:'hueru-kuran',job:'butchery'},
 build(){
  const py=hkPlinth(16.6,12.4,.44,{stepW:2.6,stepRun:.9});
  hkWallRing(-7.2,-4.4,1.6,3.4,py,3.2,{mk:'cypress',postMk:'columnar',holes:{
   s:[{at:4.4,w:1.5,h:2.12}]
  }});
  hkJadeDoor(-2.8,py,3.4,0,1.5,2.12);
  const yR=py+3.44;
  hkTurfRoof(-2.8,yR,-.5,9.4,8.4,1.55,{mk:'bark'});
  hkKaenCrown(-4.8,yR+1.65,-.5,.36,.72,4);
  hkKaenCrown(-0.8,yR+1.65,-.5,.36,.72,4);

  /* Outdoor salt-curing & whale-strip drying racks in ATMOS wind */
  hkWindHanging(4.8,py,-1.8,0,3.4,2.65,{mk:'kelp',panels:3});
  hkWindHanging(4.8,py,2.2,0,3.4,2.65,{mk:'netting',panels:3});

  hkTarget(-2.8,py,-.5,'smokehouse floor');
  hkTarget(4.8,py,4.2,'salting yard');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-4.6,py,-.5,0],
   ['hueru-kuran_whale_oil_hearth',-1.0,py,-.5,0],
   ['generic_cured_meat',-5.8,py,-2.6,0],
   ['generic_poor_rack',-2.8,py,-2.8,0],
   ['job_salt_tub',3.4,py,4.0,0,{setting:'outdoor'}],
   ['job_fish_tray',6.2,py,4.0,0,{setting:'outdoor'}]
  ]);
 }});

/* 28. Basalt-Dome Kelp-Bread & Barley Bakehouse */
defBuilding({key:'hk_bakehouse',name:'Basalt-Dome Kelp-Bread and Barley Bakehouse',seed:8308,cut:true,
 w:16.4,d:14.4,h:8.4,tags:{types:['shop','industry'],wealth:'middle',style:'hueru-kuran',job:'baking'},
 build(){
  const py=hkPlinth(14.8,12.0,.46,{stepW:2.6,stepRun:.9});
  hkChise(-1.6,-.3,py,4.85,2.25,2.7,2.3,{
   ribs:10,crownH:.82,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.12}],
   windows:[{yaw:-PI/2,w:.84,y:1.0,h:.88}]
  });
  svNoWalk(()=>{
   /* Exterior corbelled basalt beehive bread oven on east */
   cyl('basalt',4.6,py,-.6,1.85,.78,P('basalt'),16);
   lathe('corbel',4.6,-.6,[[1.78,py+.78],[1.42,py+1.65],[.52,py+2.25]],16,P('corbel'));
   hkKaenCrown(4.6,py+2.26,-.6,.36,.65,4,{smokeKind:'fire'});
   box('glow',4.6,py+.82,1.18,.44,.38,.08,P('ember'));
   haloAt(4.6,py+1.0,1.35,0xff963c,false);
  });
  hkTarget(-1.6,py+.08,-.3,'bakehouse room');
  hkTarget(4.6,py,3.2,'oven court');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-1.6,py+.08,-.3,0],
   ['generic_poor_counter',-1.6,py+.08,1.3,0],
   ['generic_bread_basket',-1.6,py+.96,1.3,0],
   ['generic_sack',-3.2,py+.08,-1.2,0],
   ['hueru-kuran_kaen_storage_jar',-.1,py+.08,-1.6,0,{v:2}],
   ['generic_fuel',6.0,py,2.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 29. Oiled Seal-Hide, Gutskin & Baleen-Weave Tailor */
defBuilding({key:'hk_sealhide_tailor',name:'Oiled Seal-Hide and Gutskin Tailor',seed:8309,cut:true,
 w:17.6,d:14.6,h:8.4,tags:{types:['shop','industry'],wealth:'middle',style:'hueru-kuran',job:'tanning'},
 build(){
  const py=hkPlinth(16.0,12.2,.46,{stepW:2.6,stepRun:.9});
  hkChise(-2.4,-.3,py,4.9,2.3,2.7,2.35,{
   ribs:10,crownH:.78,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.12}],
   windows:[{yaw:-PI/2,w:.86,y:1.0,h:.9,seaglass:true},{yaw:PI,w:.86,y:1.0,h:.9}]
  });
  /* Wind-rigged oiled gutskin & seal-hide stretching frames on east apron */
  hkWindHanging(4.6,py,-2.0,0,3.2,2.6,{mk:'gutskin',panels:2});
  hkWindHanging(4.6,py,1.8,0,3.2,2.6,{mk:'hide',panels:2});

  hkTarget(-2.4,py+.08,-.3,'tailor chise');
  hkTarget(4.6,py,4.0,'hide curing yard');
  hkFurnList([
   ['hueru-kuran_baleen_loom',-3.8,py+.08,-.8,PI/2],
   ['hueru-kuran_cedar_feast_trough',-1.4,py+.08,-1.6,0],
   ['hueru-kuran_seal_pelt_mat',-2.4,py+.08,.9,0,{v:0}],
   ['hueru-kuran_driftwood_chest',-3.6,py+.08,1.1,PI],
   ['generic_trade_vat',4.6,py,4.1,0,{setting:'outdoor'}]
  ]);
 }});

/* 30. Sea-Malt & Crowberry Brew-Lodge */
defBuilding({key:'hk_brew_kelp',name:'Sea-Malt and Crowberry Brew-Lodge',seed:8310,cut:true,
 w:17.4,d:14.6,h:8.6,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'brewing'},
 build(){
  const py=hkPlinth(15.8,12.2,.48,{stepW:2.8,stepRun:.95});
  hkWallRing(-7.0,-4.4,7.0,3.6,py,3.3,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:7.0,w:1.6,h:2.2},{at:2.4,w:.92,y:1.0,h:.92},{at:11.6,w:.92,y:1.0,h:.92}]
  }});
  hkJadeDoor(0,py,3.6,0,1.6,2.2);
  hkJadeWindow(-4.6,py+1.0,3.6,0,.92,.92);
  hkJadeWindow(4.6,py+1.0,3.6,0,.92,.92);
  hkTurfRoof(0,py+3.54,-.4,14.6,8.6,1.65,{mk:'turf',kaen:true});

  hkTarget(0,py,-.4,'brew hall');
  hkFurnList([
   ['hueru-kuran_blubber_kettle',-4.2,py,-1.8,0],
   ['generic_trade_still',3.8,py,-2.0,0],
   ['generic_barrel',-4.8,py,1.4,0],
   ['generic_keg',-3.2,py,1.6,0],
   ['hueru-kuran_kaen_storage_jar',4.4,py,1.4,0,{v:2}],
   ['hueru-kuran_kaen_storage_jar',2.8,py,1.4,0,{v:0}]
  ]);
 }});

/* 31. +690 m Flumed Red-Cypress Ship-Log & Mast Yard (124,710 + core/water) */
defBuilding({key:'hk_cypress_flume_yard',name:'Flumed Red-Cypress Ship-Log and Mast Yard',seed:8311,cut:true,
 w:22.4,d:16.4,h:9.4,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',job:'carpentry'},
 build(){
  /* Sloping +690 m terrace timber-flume water chute bringing red-cypress ship-logs down into splash-crib */
  if(CURREC&&!PLACE_DRY){
   const a=svW(-9.4,2.85,-5.2),b=svW(4.2,.32,-5.2);
   CURREC.river={name:'cypress_log_flume',pts:[[a[0],a[2],a[1]],[b[0],b[2],b[1]]],width:1.45,speed:2.4};
  }
  const py=.46;
  box('columnar',0,0,1.4,20.4,py-.08,9.8,P('columnar'));
  box('paving',0,py-.08,1.4,20.0,.08,9.4,P('paving'));
  wkPad(0,1.4,20.0,9.4,py);
  svNoWalk(()=>{
   for(let i=0;i<3;i++)box('ashlar',0,py*i/3,6.6-.26*i,3.0,py/3,.26,P('ashlar'));
   /* Elevated red-cypress trestle bents supporting the sloping log-flume trough + massive 12 m red-cypress logs! */
   for(let k=0;k<5;k++){
    const f=k/4,xx=lerp(-8.8,3.6,f),yh=lerp(2.7,py+.18,f);
    for(const sz of [-6.0,-4.4])box('cypress',xx,0,sz,.24,yh,.24,P('cypressD'));
    box('cypress',xx,yh,-5.2,.32,.18,1.85,P('cypress'));
   }
   /* Massive flumed red-cypress ship-logs stacked on basalt skids */
   for(let i=0;i<3;i++)pole('cypress',[-8.4,py+.42,-1.2+i*.82],[-.8,py+.42,-1.2+i*.82],.34,P('cypress'),12);
   pole('cypress',[-7.8,py+.98,-.8],[-1.2,py+.98,-.8],.32,P('bark'),12);
  });
  svStripWalk([0,0,6.75],[0,py,5.95],3.0);

  /* East enclosed mast-shaping & adze workshop */
  hkWallRing(1.6,-2.6,8.8,4.8,py,3.3,{mk:'cypress',postMk:'columnar',holes:{
   s:[{at:3.6,w:1.55,h:2.16}],
   w:[{at:3.7,w:1.8,h:2.25}]
  }});
  hkJadeDoor(5.2,py,4.8,0,1.55,2.16);
  hkJadeDoor(1.6,py,1.1,-PI/2,1.8,2.25,{open:true});
  hkTurfRoof(5.2,py+3.54,1.1,7.8,8.0,1.45,{mk:'bark'});

  hkTarget(5.2,py,1.1,'mast adze shed');
  hkTarget(-4.6,py,3.4,'log skids');
  hkFurnList([
   ['job_saw_bench',5.2,py,-1.0,0],
   ['hueru-kuran_baleen_bow_trough',6.6,py,2.2,-PI/2],
   ['job_plank_stack',3.6,py,2.8,0],
   ['hueru-kuran_driftwood_chest',7.2,py,-1.2,-PI/2],
   ['job_pole_rack',-5.2,py,3.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 32. Crookshore Gutskin-Awning Clan Market Stalls */
defBuilding({key:'hk_market_terrace',name:'Crookshore Gutskin-Awning Market Stalls',seed:8312,
 front:{x:0,z:5.8,yaw:0},
 w:19.6,d:13.4,h:6.4,tags:{types:['market','shop'],wealth:'middle',style:'hueru-kuran',job:'trading',market:true},
 build(){
  const py=hkPlinth(18.0,10.8,.44,{stepW:3.4,stepRun:.9});
  /* Three wind-rigged translucent gutskin & hide market canopies + central Leviathan rib arch */
  hkGutskinAwning(-8.2,-4.0,-3.0,2.8,py,py+3.1,{sag:.26});
  hkGutskinAwning(-2.4,-4.2,2.4,3.0,py,py+3.45,{mk:'hide',sag:.28});
  hkGutskinAwning(3.0,-4.0,8.2,2.8,py,py+3.1,{sag:.26});
  hkNephriteChimes(0,py+3.35,3.05,0,2.4,.95,5);
  hkWindHanging(-8.4,py,3.6,PI/2,2.2,2.55,{mk:'banner',panels:2});
  hkWindHanging(8.4,py,3.6,-PI/2,2.2,2.55,{mk:'banner',panels:2});

  hkTarget(-5.6,py,0,'jade stall');
  hkTarget(0,py,0,'ambergris stall');
  hkTarget(5.6,py,0,'whale-provisions stall');
  hkFurnList([
   ['generic_trade_stall',-5.6,py,-1.2,0,{setting:'outdoor'}],
   ['generic_trade_stall',0,py,-1.4,0,{setting:'outdoor'}],
   ['generic_trade_stall',5.6,py,-1.2,0,{setting:'outdoor'}],
   ['hueru-kuran_kaen_storage_jar',-3.4,py,1.4,0,{v:1,setting:'outdoor'}],
   ['hueru-kuran_driftwood_chest',3.4,py,1.4,0,{setting:'outdoor'}],
   ['job_fish_tray',6.8,py,1.6,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-2.6,py,4.2,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.6,py,4.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 33. Elevated Rat-Proof Granary-Nuraghe & Quern Mill (HK1) */
defBuilding({key:'hk_granary_nuraghe',name:'Elevated Rat-Proof Granary-Nuraghe and Mill',seed:8313,cut:true,
 w:15.4,d:15.8,h:11.4,tags:{types:['industry','farm'],wealth:'middle',style:'hueru-kuran',job:'milling'},
 build(){
  const py=hkPlinth(13.6,13.2,.54,{stepW:2.8,stepRun:1.0});
  /* Tall battered basalt granary-nuraghe with mid-shaft projecting mensoloni rat-baffle ring! */
  hkNuraghe(0,-.6,py,4.6,3.35,8.6,{
   wallT:1.35,courses:9,
   doors:[{yaw:0,w:1.45,h:2.15}],
   windows:[{yaw:0,w:.78,y:5.2,h:.9},{yaw:PI,w:.78,y:5.2,h:.9}]
  });
  svNoWalk(()=>{
   /* Projecting basalt rat-baffle collar ring around mid-tower */
   sector('corbel',0,-.6,4.05,4.75,0,TAU,py+3.6,py+3.82,P('corbel'),28);
  });
  hkWindHanging(5.2,py,3.8,0,2.2,2.5,{mk:'kelp',panels:2});

  hkTarget(0,py+.08,-.6,'granary quern floor');
  hkFurnList([
   ['generic_trade_bin',-1.6,py+.08,-1.8,0],
   ['generic_trade_bin',1.6,py+.08,-1.8,0],
   ['generic_sack',-2.0,py+.08,.4,0],
   ['hueru-kuran_kaen_storage_jar',1.8,py+.08,.6,0,{v:2}],
   ['job_winnowing_mat',0,py,4.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-2.8,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 34. Cyclopean Whale-Oil & Sawn-Nephrite Vault Warehouse (HK1 + HK4) */
defBuilding({key:'hk_warehouse_vault',name:'Cyclopean Whale-Oil and Nephrite Vault Warehouse',seed:8314,cut:true,
 w:20.4,d:15.6,h:9.2,tags:{types:['industry','infrastructure'],wealth:'middle',style:'hueru-kuran',job:'warehousing'},
 build(){
  const py=hkPlinth(18.8,13.2,.54,{stepW:3.4,stepRun:1.05});
  /* Heavy battered cyclopean-basalt godown with twin 3-ton sawn emerald-nephrite cargo portals */
  hkWallRing(-8.4,-4.8,8.4,3.8,py,3.6,{mk:'basalt',postMk:'columnar',t:.74,holes:{
   s:[{at:4.6,w:1.85,h:2.35},{at:12.2,w:1.85,h:2.35}],
   n:[{at:8.4,w:1.1,y:1.4,h:.95}]
  }});
  hkJadeDoor(-3.8,py,3.8,0,1.85,2.35,{t:.74,lintelH:.42});
  hkJadeDoor(3.8,py,3.8,0,1.85,2.35,{t:.74,lintelH:.42,ajar:.65});
  hkJadeWindow(0,py+1.4,-4.8,PI,1.1,.95,{t:.74});
  hkTurfRoof(0,py+3.84,-.5,17.4,9.2,1.85,{mk:'turf'});

  hkTarget(-3.8,py,-.5,'west oil vault');
  hkTarget(3.8,py,-.5,'east nephrite vault');
  hkFurnList([
   ['job_oil_drum_rack',-6.2,py,-2.6,0],
   ['generic_barrel',-6.2,py,1.2,0],
   ['generic_crate',-2.2,py,-2.8,0],
   ['job_bales',2.2,py,-2.6,0],
   ['hueru-kuran_driftwood_chest',5.8,py,-2.6,-PI/2],
   ['hueru-kuran_kaen_storage_jar',6.2,py,1.2,0,{v:0}],
   ['hueru-kuran_jade_lamp_pedestal',0,py,5.0,0,{setting:'outdoor'}]
  ]);
 }});

/* 35. Salt-Spray Basalt-Walled Sea-Kale & Seal-Duck Terrace Croft */
defBuilding({key:'hk_terrace_croft',name:'Basalt-Walled Sea-Kale and Seal-Duck Terrace Croft',seed:8315,cut:true,
 w:20.4,d:16.8,h:7.6,tags:{types:['farm'],wealth:'poor',style:'hueru-kuran',job:'farming'},
 build(){
  const py=hkPlinth(18.8,14.4,.42,{stepW:2.8,stepRun:.9});
  /* West keeper chise + East sunken basalt wind-break garden beds mulched with peat & kelp wrack + sea-duck stone pen */
  hkChise(-4.6,-.8,py,4.15,2.05,2.45,2.0,{
   ribs:8,crownH:.68,crownFins:4,
   doors:[{yaw:0,w:1.3,h:2.0}],
   windows:[{yaw:-PI/2,w:.74,y:.92,h:.82}]
  });
  svNoWalk(()=>{
   /* Wind-sheltered basalt dry-stone garden walls & kelp-mulch beds on east [1.0..8.2, -5.6..1.2] */
   for(const sz of [-5.8,1.4])box('basalt',4.6,py,sz,7.6,.92,.44,P('basalt'));
   for(const sx of [.9,8.3])box('basalt',sx,py,-2.2,.44,.92,6.76,P('basalt'));
   for(let r=0;r<3;r++){
    const zz=-4.4+r*2.2;
    box('peat',4.6,py,-4.4+r*2.2,6.2,.18,1.35,P('peat'));
    box('turf',4.6,py+.18,zz,5.8,.12,.95,P('turfMoss'));
   }
   /* Low basalt sea-duck & seal-pup pen on southeast [1.2..8.0, 2.4..5.8] */
   for(const sz of [2.3,5.9])box('columnar',4.6,py,sz,7.0,.68,.36,P('columnar'));
   box('columnar',8.1,py,4.1,.36,.68,3.24,P('columnar'));
  });
  hkWindHanging(-4.6,py,4.8,0,2.4,2.3,{mk:'kelp',panels:2});

  hkTarget(-4.6,py+.08,-.8,'crofter chise');
  hkTarget(4.6,py,4.1,'croft yard');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-4.6,py+.08,-.8,0],
   ['generic_poor_straw_bed',-5.7,py+.08,-1.2,PI/2],
   ['hueru-kuran_kaen_storage_jar',-3.5,py+.08,-1.5,0,{v:2}],
   ['hueru-kuran_driftwood_chest',-4.6,py+.08,.7,PI],
   ['generic_trade_trough',4.6,py,3.6,0,{setting:'outdoor'}],
   ['generic_veg_basket',1.8,py,4.8,0,{setting:'outdoor'}],
   ['generic_churn',-1.2,py,4.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 36. Crookshore Nephrite-Boulder & Columnar-Basalt Quarry-Mine (role: 'mine', linked to kits/resources) */
defBuilding({key:'hk_jade_quarry',name:'Nephrite-Boulder and Columnar-Basalt Quarry-Mine',seed:8316,cut:true,
 w:20.6,d:16.4,h:9.6,tags:{types:['industry'],wealth:'middle',style:'hueru-kuran',role:'mine',job:'mining'},
 build(){
  const py=hkPlinth(19.0,14.0,.48,{stepW:3.0,stepRun:.95});
  /* West quarryman tool-nuraghe + East stepped columnar-basalt quarry face exposing a massive emerald-nephrite vein
     and driftwood sheer-legs derrick hoisting a freshly sawn nephrite block! */
  hkNuraghe(-4.8,-.4,py,3.4,2.5,6.8,{
   wallT:1.15,courses:7,
   doors:[{yaw:0,w:1.32,h:2.05}],
   windows:[{yaw:-PI/2,w:.75,y:3.2,h:.85}]
  });
  svNoWalk(()=>{
   /* Stepped hexagonal columnar-basalt quarry benches & exposed emerald-nephrite reef */
   box('columnar',4.2,py,-4.2,8.4,1.35,3.4,P('columnar'));
   box('columnar',4.6,py+1.35,-4.7,7.2,1.35,2.2,P('columnar'));
   box('nephrite',3.8,py,-2.2,3.2,1.65,1.45,P('nephrite'));
   box('nephrite',5.6,py+1.35,-3.3,2.4,1.45,1.2,P('nephriteBright'));
   /* Driftwood tripod sheer-legs derrick hoisting a 2-ton sawn emerald-nephrite block */
   const apex=[3.8,py+6.2,1.6];
   beam('driftwood',[1.4,py,-.2],apex,.14,P('driftwood'),true,8);
   beam('driftwood',[6.2,py,-.2],apex,.14,P('driftwood'),true,8);
   beam('driftwood',[3.8,py,3.8],apex,.14,P('driftwood'),true,8);
   ring('bronze',apex[0],apex[1]-.15,apex[2],.18,.04,P('bronze'),0,PI/2,0,10);
   pole('rope',[apex[0],apex[1]-.2,apex[2]],[apex[0],py+2.35,apex[2]],.02,P('rope'),6);
   box('nephrite',apex[0],py+1.45,apex[2],1.25,.88,.82,P('nephriteBright'));
  });

  hkTarget(-4.8,py+.08,-.4,'quarry tool-nuraghe');
  hkTarget(1.2,py,3.8,'quarry floor');
  hkFurnList([
   ['hueru-kuran_jade_saw_bench',-4.8,py+.08,-1.4,0],
   ['generic_strongbox',-3.8,py+.08,.4,-PI/2],
   ['generic_crate',-5.8,py+.08,.4,PI/2],
   ['generic_poor_workbench',-.2,py,2.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-1.8,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 37. Sea-Spray Brine Evaporation and Kelp-Potash Kiln */
defBuilding({key:'hk_brine_kelp_pan',name:'Sea-Spray Brine Evaporation and Kelp-Potash Kiln',seed:8317,cut:true,
 w:20.2,d:16.2,h:7.8,tags:{types:['industry'],wealth:'poor',style:'hueru-kuran',job:'salt'},
 build(){
  const py=hkPlinth(18.6,13.8,.44,{stepW:2.8,stepRun:.9});
  /* West salt-basket & soda-potash store-chise */
  hkChise(-4.6,-.6,py,4.05,1.95,2.45,1.95,{
   ribs:8,crownH:.66,crownFins:4,
   doors:[{yaw:0,w:1.3,h:2.0}],
   windows:[{yaw:-PI/2,w:.74,y:.92,h:.82}]
  });
  svNoWalk(()=>{
   /* Stepped columnar-basalt tidal spray-settling pans crusted with white sea-salt efflorescence */
   box('columnar',4.4,py,-3.8,6.2,.44,2.1,P('columnar'));
   box('efflor',4.4,py+.44,-3.8,5.5,.07,1.45,0xeae6dc);
   box('columnar',4.4,py,-1.2,6.2,.26,2.1,P('columnar'));
   box('soda',4.4,py+.26,-1.2,5.5,.07,1.45,0xdcdad2);
   /* Twin iron brine-boiling cauldrons over peat & driftwood hearth */
   box('basalt',2.2,py,2.6,2.6,.48,1.5,P('basaltD'));
   box('glow',2.2,py+.48,2.6,1.8,.05,.85,0xff6e20);
   for(const cx of [1.55,2.85]){
    cyl('iron',cx,py+.54,2.6,.46,.42,P('iron'),12);
    cyl('efflor',cx,py+.96,2.6,.4,.04,0xf0ede4,12);
   }
   /* Calcining kelp-ash clamp kiln with white soda/potash crusts for hk_kelp_glassworks */
   cyl('columnar',6.3,py,2.6,1.35,.6,P('columnar'),14);
   cyl('kelp',6.3,py+.6,2.6,1.06,.34,P('kelp'),12,.72);
   cyl('potash',6.3,py+.94,2.6,.72,.18,0xd8d2c6,12,.48);
   cyl('glow',6.3,py+1.12,2.6,.28,.04,0xff7a28,10);
  });
  haloAt(2.2,py+.72,2.6,0xff8632,true);
  smokeAt(2.2,py+1.1,2.6,{r:.4,kind:'steam'});
  smokeAt(6.3,py+1.25,2.6,{r:.36,kind:'fire'});
  hkWindHanging(4.4,py,-5.4,0,3.6,2.3,{mk:'kelp',panels:3});

  hkTarget(-4.6,py+.08,-.6,'salt store chise');
  hkTarget(2.2,py,4.6,'brine pan yard');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-4.6,py+.08,-.6,0],
   ['hueru-kuran_kaen_storage_jar',-5.6,py+.08,-1.3,0,{v:0}],
   ['generic_sack',-3.5,py+.08,-1.2,0],
   ['generic_barrel',-4.6,py+.08,.8,0],
   ['hueru-kuran_blubber_kettle',-.4,py,2.6,0,{setting:'outdoor'}],
   ['generic_trade_bin',5.2,py,4.7,0,{setting:'outdoor'}]
  ]);
 }});
