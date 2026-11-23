// prefix: ynt
// ================================================================= VOTH-CENSUS TRADES PART I: Smithy, Foundry, Bakery, Butcher, Weaver, Tannery, Potter, Joiner, Alchemist, Tavern

/* 1. Ironstone Smithy & Spear-Armoury */
defBuilding({key:'yn-smithy',name:'Irn-Forj Ironstone Smithy & Spear-Armoury',seed:7301,cls:'building',w:12.8,d:11.6,h:12.6,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'freestanding',role:'smithy',job:'smithing'},
 note:'Open-arch rust-ironstone cobble forge-drum with twin-flue chimney cone, horned anvil, quench trough, and dual-spear racks.',
 build(){
  const r=3.55,y0=.2;
  ynRootSkirt(0,0,r,4.8,{mk:'ironstone',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.36,r,y0,3.8,'ironstone',P('ironstone'),[
   {a:PI/2,w:1.85,h:2.35,door:true,open:true,visor:true,visorOut:.8},
   {a:0,w:1.35,h:2.1,door:true,open:true},{a:PI*.85,w:.68,y:1.1,h:1.1}
  ]);
  ynCanopy(0,0,r,r+.95,y0+3.8,2.65,{mk:'slate',ribs:8});
  /* stone forge chimney rising clear on the west flank */
  ynNoCut(()=>{
   cyl('cobble',-2.85,y0+.01,-1.95,.62,6.8,P('cobble'),12,.4);
   cyl('bronze',-2.85,y0+6.82,-1.95,.46,.22,P('verdigris'),12);
   smokeAt(-2.85,y0+7.15,-1.95,{r:.38});
  });
  ynFurn([
   ['yonni_trade_forge',0,y0,-2.1,0],
   ['yonni_trade_anvil',.1,y0,-.35,0],
   ['yonni_trade_trough',1.95,y0,-.6,-PI/2],
   ['yonni_common_dual_spear_rack',-2.05,y0,.35,PI/2],
   ['yonni_trade_workbench',0,y0,1.65,PI]
  ]);
 }});

/* 2. Tin-Bronze Foundry (tin = 200 + copper) */
defBuilding({key:'yn-foundry-bronze',name:'Tin-Bronz Coastal Tin-Bronze Foundry',seed:7302,cls:'building',w:14.4,d:13.2,h:15.2,cut:true,
 tags:{types:['industry'],wealth:'middle',style:'freestanding',role:'foundry',job:'smithing'},
 note:'Heavy corbel-fin smelting rotunda alloying Scoured-Hills cassiterite tin (tin = 200) and copper into Spear-Queen bronzes.',
 build(){
  const r=4.1,y0=.24;
  ynRootSkirt(0,0,r,5.4,{mk:'ironstone',plinthH:y0+.28});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.38,r,y0,4.4,'cobble',P('cobble'),[
   {a:PI/2,w:1.65,h:2.3,door:true,visor:true,visorOut:.78},
   {a:PI*.15,w:.75,y:1.4,h:1.25},{a:PI*.85,w:.75,y:1.4,h:1.25}
  ]);
  ynCorbelFins(0,0,r,r+.55,3.2,4.64,12,'corbel',P('corbel'),{bronzeTip:true});
  ynCanopy(0,0,r+.55,r+1.4,4.8,3.2,{mk:'verdigris',ribs:12,rHub:.65,finial:false});
  /* twin bronze smelting flues crowning the canopy */
  ynNoCut(()=>{
   for(const sx of [-.48,.48]){
    cyl('bronze',sx,8.0,0,.25,1.65,P('bronze'),10);
    cone('verdigris',sx,9.85,0,.36,.28,P('verdigris'),10);
    smokeAt(sx,10.2,0,{r:.34});
   }
   ynOreHeap(4.45,1.8,'tin',.85);
  });
  ynFurn([
   ['yonni_trade_forge',-1.1,y0,-2.35,0],
   ['yonni_trade_forge',1.2,y0,-2.35,0],
   ['yonni_trade_anvil',0,y0,-.2,0],
   ['yonni_trade_trough',-2.4,y0,.5,PI/2],
   ['yonni_works_weigh_scale',2.3,y0,.6,-PI/2],
   ['yonni_common_dual_spear_rack',0,y0,2.85,PI]
  ]);
 }});

/* 3. Twin-Dome Bakehouse */
defBuilding({key:'yn-bakery',name:'Bred-Ovn Twin-Dome Bakehouse',seed:7303,cls:'building',w:12.2,d:11.8,h:11.6,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'freestanding',role:'bakery',job:'baking'},
 note:'Sea-lime bakehouse drum with exterior beehive oven dome, flour bins, kneading table, and covered bread counter.',
 build(){
  const r=3.45,y0=.18,cx=-.38;
  ynRootSkirt(cx,0,r,4.6,{mk:'cobble',plinthH:y0+.24});
  ynFloorDisc(cx,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(cx,0,r-.34,r,y0,3.6,'sealime',P('sealimeW'),[
   {a:PI/2,w:1.35,h:2.15,door:true,visor:true,visorOut:.75},
   {a:PI*.22,w:.95,y:.85,h:1.15},{a:PI*.78,w:.72,y:.95,h:1.1}
  ]);
  ynCanopy(cx,0,r,r+.95,y0+3.6,2.55,{mk:'shingle',ribs:8});
  /* engaged exterior stone oven dome + terracotta chimney on +x */
  ynNoCut(()=>{
   cyl('cobble',3.45,0,-.4,1.35,1.15,P('cobble'),14);
   sph('sealimeWarm',3.45,1.15,-.4,1.28,P('sealimeW'),.85,14);
   cyl('terracotta',3.45,2.15,-.4,.24,1.65,P('terracotta'),10);
   smokeAt(3.45,3.9,-.4,{r:.28});
  });
  ynFurn([
   ['yonni_works_bread_oven',cx,y0,-2.05,0],
   ['yonni_trade_bin',cx-1.75,y0,-.2,PI/2],
   ['yonni_common_round_table',cx+.2,y0,.25,0],
   ['yonni_trade_stall',cx+1.35,y0,1.55,PI],
   ['yonni_common_shelves',cx+2.15,y0,-1.1,-PI*.35]
  ]);
 }});

/* 4. Butcher & Coastal Smokehouse */
defBuilding({key:'yn-butcher',name:'Smok-Tur Butcher & Coastal Smokehouse',seed:7304,cls:'building',w:12.4,d:11.8,h:12.8,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'freestanding',role:'butcher',job:'butchery'},
 note:'Coarse river-cobble & sea-lime smokehouse drum crowned by a louvered bronze smoke-lantern over fish and mutton racks.',
 build(){
  const r=3.4,y0=.2;
  ynRootSkirt(0,0,r,4.6,{mk:'rivercobble',plinthH:y0+.25});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.35,r,y0,3.8,'rivercobble',P('rivercobble'),[
   {a:PI/2,w:1.3,h:2.15,door:true,visor:true},
   {a:0,w:.68,y:1.1,h:1.05},{a:PI,w:.68,y:1.1,h:1.05}
  ]);
  ynCanopy(0,0,r,r+.92,y0+3.8,2.3,{mk:'slate',ribs:8,rHub:.85,finial:false});
  ynNoCut(()=>{
   ynArcadeRing(0,0,.62,.88,y0+6.1,1.15,6,{paraH:.15,paraMk:'bronze',colMk:'ironwood',spandrelMk:'slate',archH:.28,colR:.05});
   ynCanopy(0,0,.88,1.35,y0+7.25,1.05,{mk:'verdigris',ribs:6,finialScale:.75});
   smokeAt(0,y0+7.1,0,{r:.32});
  });
  ynFurn([
   ['yonni_works_butcher_block',0,y0,.2,0],
   ['yonni_works_smoke_rack',-1.35,y0,-1.45,PI*.2],
   ['yonni_works_smoke_rack',1.35,y0,-1.45,-PI*.2],
   ['yonni_trade_barrels',-2.1,y0,.8,PI/2],
   ['yonni_common_brazier',0,y0,-1.65,0],
   ['yonni_trade_stall',1.4,y0,1.4,PI*.85]
  ]);
 }});

/* 5. Carnelian Weaver & Dyer */
defBuilding({key:'yn-weaver',name:'Karn-Lum Carnelian Weaver & Dyer',seed:7305,cls:'building',w:13.4,d:12.2,h:13.2,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'freestanding',role:'weaver',job:'weaving'},
 note:'Upper-lit sea-lime weaving rotunda with warp-weighted looms and an exterior dye-vat terrace under a broad rain-skirt.',
 build(){
  const r=3.55,y0=.2,cx=-.98;
  ynRootSkirt(cx,0,r,4.8,{mk:'cobble',plinthH:y0+.24});
  ynFloorDisc(cx,0,r-.05,y0,'floor',P('floor'));
  ynDrumWall(cx,0,r-.34,r,y0,4.2,'sealime',P('sealime'),[
   {a:PI/2,w:1.25,h:2.15,door:true,visor:true},
   {a:PI*.15,w:.88,y:1.05,h:1.45},{a:PI*.82,w:.88,y:1.05,h:1.45},{a:-PI/2,w:.88,y:1.05,h:1.45}
  ]);
  ynCanopy(cx,0,r,r+1.05,y0+4.2,2.75,{mk:'verdigris',ribs:10});
  /* side dye-yard shelter + hung dyed cloths */
  ynNoCut(()=>{
   ynFloorDisc(3.52,0,1.65,.14,'flagstone',P('flagstone'),{seg:12});
   ynUmbrellaCanopy(3.52,0,.16,2.05,.14,2.85,1.05,{mk:'slate',struts:6,finial:false});
   FURNISH('yonni_trade_vat',3.12,.14,.45,0,{setting:'outdoor'});
   FURNISH('yonni_trade_vat',4.02,.14,-.45,0,{setting:'outdoor'});
  });
  ynFurn([
   ['yonni_trade_loom',cx-1.2,y0,-1.55,PI*.2],
   ['yonni_trade_loom',cx+1.2,y0,-1.55,-PI*.2],
   ['yonni_common_rug_round',cx,y0,.25,0],
   ['yonni_common_round_table',cx,y0+.045,.25,0],
   ['yonni_common_banner',cx-2.2,y0,0,PI/2],
   ['yonni_common_shelves',cx+2.45,y0,.2,-PI/2]
  ]);
 }});

/* 6. Oils-and-Hide Tannery */
defBuilding({key:'yn-tannery',name:'Hid-Yard Coastal Oils & Hide Tannery',seed:7306,cls:'building',w:13.6,d:12.4,h:11.8,cut:true,
 tags:{types:['industry'],wealth:'poor',style:'freestanding',role:'tannery',job:'tanning'},
 note:'Ventilated cobble & ironwood-slatted tanning drum with bronze-hooped soaking vats and stretched coastal hides.',
 build(){
  const r=3.5,y0=.18,cx=-.35;
  ynRootSkirt(cx,0,r,4.6,{mk:'ironstone',plinthH:y0+.24});
  ynFloorDisc(cx,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(cx,0,r-.35,r,y0,2.4,'ironstone',P('ironstone'),[{a:PI/2,w:1.35,h:2.1,door:true,visor:true}]);
  ynArcadeRing(cx,0,r-.35,r,y0+2.4,1.55,10,{paraH:.25,paraMk:'cobble',colMk:'ironwood',spandrelMk:'sealime',archH:.35});
  ynCanopy(cx,0,r,r+.95,y0+3.95,2.45,{mk:'shingle',ribs:8});
  /* outdoor hide-stretching frame on +x */
  ynNoCut(()=>{
   for(const sz of [-1.4,1.4])cyl('ironwood',4.72,0,sz,.06,2.25,P('ironwood'),6);
   beam('ironwood',[4.72,2.15,-1.4],[4.72,2.15,1.4],.07,P('ironwood'));
   quad('sail',4.72,1.25,0,2.2,1.55,P('woolPale'),PI/2);
  });
  ynFurn([
   ['yonni_trade_vat',cx-1.25,y0,-1.2,0],
   ['yonni_trade_vat',cx+1.25,y0,-1.2,0],
   ['yonni_trade_trough',cx,y0,.85,0],
   ['yonni_trade_workbench',cx-1.75,y0,.55,PI/2],
   ['yonni_trade_barrels',cx+2.05,y0,.55,-PI/2]
  ]);
 }});

/* 7. Terracotta Potter & Bottle-Kiln */
defBuilding({key:'yn-potter',name:'Kiln-Tur Terracotta Potter & Bottle-Kiln',seed:7307,cls:'building',w:13.2,d:11.8,h:12.6,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'freestanding',role:'potter',job:'pottery'},
 note:'Round potter workshop paired with a bottle-necked terracotta & cobble firing kiln and glazed amphora racks.',
 build(){
  const r=3.35,y0=.18,cx=-.98;
  ynRootSkirt(cx,0,r,4.6,{mk:'cobble',plinthH:y0+.24});
  ynFloorDisc(cx,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(cx,0,r-.34,r,y0,3.7,'sealimeWarm',P('sealimeW'),[
   {a:PI/2,w:1.25,h:2.1,door:true,visor:true},{a:PI*.2,w:.78,y:.95,h:1.15},{a:PI*.8,w:.78,y:.95,h:1.15}
  ]);
  ynCanopy(cx,0,r,r+.9,y0+3.7,2.45,{mk:'slate',ribs:8});
  /* bottle-necked firing kiln on +x */
  ynNoCut(()=>{
   ynRootSkirt(3.65,-.2,1.55,4.2,{mk:'cobble',plinthH:.35});
   lathe('terracotta',3.65,-.2,[[1.55,.35],[1.42,2.1],[.85,3.85],[.52,5.6],[.58,5.9]],16,P('terracotta'));
   box('ironstone',3.65,.35,1.32,.68,.85,.18,0x241c18);
   smokeAt(3.65,6.1,-.2,{r:.3});
  });
  ynFurn([
   ['yonni_trade_potter_wheel',cx-.7,y0,-.3,0],
   ['yonni_trade_potter_wheel',cx+.9,y0,-.3,PI],
   ['yonni_common_shelves',cx,y0,-2.35,0],
   ['yonni_common_shelves',cx-1.85,y0,.4,PI/2],
   ['yonni_trade_stall',cx+1.5,y0,1.35,PI*.85]
  ]);
 }});

/* 8. Ironwood Joiner & Cooper */
defBuilding({key:'yn-carpenter',name:'Irn-Wud Ironwood Joiner & Cooper',seed:7308,cls:'building',w:13.8,d:12.0,h:12.4,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'freestanding',role:'carpenter',job:'carpentry'},
 note:'Oiled-ironwood joinery & cooperage drum with cantilevered timber-stack rain-hood, workbenches, and hooped casks.',
 build(){
  const r=3.5,y0=.2,cx=-.92;
  ynRootSkirt(cx,0,r,4.8,{mk:'cobble',plinthH:y0+.24});
  ynFloorDisc(cx,0,r-.05,y0,'floor',P('floor'));
  ynDrumWall(cx,0,r-.34,r,y0,3.85,'sealime',P('sealime'),[
   {a:PI/2,w:1.45,h:2.18,door:true,visor:true,visorOut:.75},
   {a:0,w:1.15,h:2.05,door:true,open:true},{a:PI*.8,w:.75,y:.95,h:1.15}
  ]);
  ynCanopy(cx,0,r,r+.95,y0+3.85,2.55,{mk:'shingle',ribs:8});
  /* seasoned ironwood log stack under rain-visor on +x */
  ynNoCut(()=>{
   for(let row=0;row<3;row++)for(let k=0;k<4-row;k++){
    const lx=3.52+(k-(3-row)/2)*.34,ly=.16+row*.29;
    WX(lx,ly,0,0,PI/2,0,()=>cyl('ironwood',0,-1.1,0,.14,2.2,P('ironwood'),8));
   }
   ynUmbrellaCanopy(3.52,0,.14,1.85,0,2.75,.95,{mk:'slate',struts:6,finial:false});
  });
  ynFurn([
   ['yonni_trade_workbench',cx,y0,-2.15,0],
   ['yonni_trade_workbench',cx-1.75,y0,.1,PI/2],
   ['yonni_trade_barrels',cx+1.85,y0,-1.35,-PI*.35],
   ['yonni_common_chest',cx+1.45,y0,1.55,PI],
   ['yonni_common_stool',cx,y0,-.95,0]
  ]);
 }});

/* 9. Saltpeter Alchemist & Healer's Rotunda */
defBuilding({key:'yn-alchemist',name:'Salt-Herb Saltpeter Alchemist & Healer House',seed:7309,cls:'building',w:12.6,d:12.6,h:13.6,cut:true,
 tags:{types:['shop','civic'],wealth:'middle',style:'freestanding',role:'healer',job:'healing'},
 note:'Sea-lime apothecary & clinic rotunda distilling Scoured-Hills saltpeter and coastal herbs, with copper alembics and twin sickbeds.',
 build(){
  const r=3.75,y0=.22;
  ynRootSkirt(0,0,r,4.9,{mk:'granite',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.05,y0,'floor',P('floor'));
  ynDrumWall(0,0,r-.35,r,y0,4.1,'sealime',P('sealime'),[
   {a:PI/2,w:1.25,h:2.15,door:true,visor:true},
   {a:PI*.18,w:.78,y:1.0,h:1.25,pane:'stained'},{a:PI*.82,w:.78,y:1.0,h:1.25,pane:'stained'},
   {a:-PI*.35,w:.72,y:1.0,h:1.2},{a:-PI*.65,w:.72,y:1.0,h:1.2}
  ]);
  ynDripSkirt(0,0,r,y0+2.5,.38,.18,'verdigris',P('verdigris'));
  ynCanopy(0,0,r,r+.98,y0+4.1,2.85,{mk:'verdigris',ribs:10});
  ynFurn([
   ['yonni_works_alembic',0,y0,-2.55,0],
   ['yonni_works_sickbed',-2.15,y0,-.25,PI/2],
   ['yonni_works_sickbed',2.15,y0,-.25,-PI/2],
   ['yonni_common_shelves',-1.65,y0,-2.15,PI*.25],
   ['yonni_common_brazier',0,y0,.85,0],
   ['yonni_common_round_table',0,y0,-.65,0]
  ]);
 }});

/* 10. Spear-Sisters' Mead-Rotunda Tavern & Inn */
defBuilding({key:'yn-tavern',name:'Med-Rotunda Spear-Sisters Mead-Hall & Inn',seed:7310,cls:'building',w:16.8,d:16.8,h:15.8,cut:true,
 tags:{types:['tavern','inn'],wealth:'middle',style:'freestanding',role:'tavern inn',job:'brewing'},
 note:'Spacious two-tier mead-rotunda & travellers inn with overhanging upper sleeping gallery, spiral stone stair, casks, and ring-tables.',
 build(){
  const r=5.1,y0=.24;
  ynRootSkirt(0,0,r,5.4,{mk:'cobble',plinthH:y0+.28});
  ynFloorDisc(0,0,r-.06,y0,'flagstone',P('flagstone'),{seg:22});
  ynDrumWall(0,0,r-.38,r,y0,3.6,'cobble',P('cobble'),[
   {a:PI/2,w:1.55,h:2.25,door:true,visor:true,visorOut:.82},
   {a:PI*.2,w:.85,y:.95,h:1.25},{a:PI*.8,w:.85,y:.95,h:1.25},{a:-PI*.25,w:.8,y:.95,h:1.2}
  ]);
  ynCorbelFins(0,0,r,r+.62,2.6,3.84,14,'corbel',P('corbel'));
  const uY=4.0,uR=r+.62;
  ynFloorDisc(0,0,uR-.08,uY,'floor',P('floor'),{seg:22});
  ynArcadeRing(0,0,uR-.34,uR,uY,2.55,14,{paraMk:'cobble',colMk:'ironwood',spandrelMk:'sealimeWarm',gapA:PI*1.52});
  ynSpiralStair(0,0,r+.04,0,uY,PI*.64,PI*.88);
  ynCanopy(0,0,uR,uR+1.1,uY+2.55,3.35,{mk:'slate',ribs:14});
  ynBanner(-1.85,0,5.35,0,2.8,P('carnelian'));
  /* Ground taproom + upper inn alcoves */
  FURNISH('yonni_common_rug_round',0,y0,0,0);
  FURNISH('yonni_common_brazier',0,y0+.045,0,0);
  for(const sx of [-2.35,2.35]){
   FURNISH('yonni_common_round_table',sx,y0,.85,0);
   FURNISH('yonni_common_stool',sx-.75,y0,.85,PI/2);
   FURNISH('yonni_common_stool',sx+.75,y0,.85,-PI/2);
  }
  FURNISH('yonni_trade_barrels',-2.2,y0,-3.1,PI*.2);
  FURNISH('yonni_trade_barrels',2.2,y0,-3.1,-PI*.2);
  FURNISH('yonni_trade_stall',0,y0,-3.35,0);
  FURNISH('yonni_common_twin_alcove',0,uY,-3.45,0);
  FURNISH_HANG('yonni_common_storm_lamp',0,3.7,0,0);
 }});
