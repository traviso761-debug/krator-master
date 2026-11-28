// prefix: hk
// ================================================================= VILLAGGIO NURAGICO DOMESTIC CHISE LODGES, INNS & LEGATION (HK3 + HK1)
// 12 defs (seeds 8101..8112): 3 poor whale-rib chise huts, 3 middle craft & skipper lodges, 3 rich clan compounds & nuraghe
// manors, plus cliff-terrace hostel, Leviathan-jawbone blubber-lamp tavern, and Hayrant sister-clan legation.

/* 1. Poor Whale-Flenser's Basalt-Ring Chise Hut (HK3) */
defBuilding({key:'hk_house_poor_flenser',name:'Whale-Flenser Basalt-Ring Chise Hut',seed:8101,cut:true,
 w:12.8,d:13.6,h:7.6,tags:{types:['dwelling-single'],wealth:'poor',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(11.2,11.2,.42,{stepW:2.2,stepRun:.85});
  /* 2.2 m thick battered cyclopean basalt ring-wall + pelagic whale-rib turf dome + Jomon kaen-doki crown */
  hkChise(0,-.3,py,4.9,2.2,2.55,2.25,{
   ribs:8,crownH:.72,crownFins:4,
   doors:[{yaw:0,w:1.35,h:2.05}],
   windows:[{yaw:PI/2,w:.78,y:.95,h:.85},{yaw:-PI/2,w:.78,y:.95,h:.85}]
  });
  /* Outdoor drying kelp curtain rack on east apron */
  hkWindHanging(4.5,py,3.8,0,2.2,2.35,{mk:'kelp',panels:2});
  hkTarget(0,py+.08,-.3,'chise hearth');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,py+.08,-.3,0],
   ['hueru-kuran_whalebone_cot',-1.45,py+.08,-.8,PI/2],
   ['hueru-kuran_seal_pelt_mat',1.35,py+.08,-.2,-PI/2],
   ['hueru-kuran_kaen_storage_jar',1.4,py+.08,-1.55,0,{v:0}],
   ['hueru-kuran_harpoon_rack',-1.2,py+.08,1.35,PI],
   ['generic_basket',-4.3,py,3.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 2. Poor Kelp-Gatherer's Turf-Capped Chise & Gutskin Porch (HK3) */
defBuilding({key:'hk_house_poor_kelper',name:'Kelp-Gatherer Chise and Gutskin Porch',seed:8102,cut:true,
 w:13.2,d:14.4,h:7.5,tags:{types:['dwelling-single'],wealth:'poor',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(11.6,12.0,.4,{stepW:2.3,stepRun:.85});
  hkChise(-.4,-.6,py,4.85,2.2,2.5,2.15,{
   ribs:8,crownH:.68,crownFins:4,floorMk:'paving',
   doors:[{yaw:0,w:1.35,h:2.05}],
   windows:[{yaw:PI*.65,w:.75,y:.95,h:.82},{yaw:-PI*.65,w:.75,y:.95,h:.82}]
  });
  /* Wind-rigged translucent gutskin porch canopy & braided kelp net */
  hkGutskinAwning(-2.4,3.3,1.8,5.5,py,py+2.55,{sag:.24});
  hkWindHanging(4.4,py,2.4,-PI/2,2.4,2.3,{mk:'netting',panels:2});
  hkTarget(-.4,py+.08,-.6,'kelper room');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-.4,py+.08,-.6,0],
   ['generic_poor_straw_bed',-1.85,py+.08,-.9,PI/2],
   ['hueru-kuran_seal_pelt_mat',1.0,py+.08,-.5,0,{v:2}],
   ['hueru-kuran_kaen_storage_jar',.95,py+.08,-1.85,0,{v:2}],
   ['hueru-kuran_driftwood_chest',-1.5,py+.08,1.0,0],
   ['job_fish_tray',-1.4,py,4.3,0,{setting:'outdoor'}]
  ]);
 }});

/* 3. Poor Abalone & Jade-Pebble Diver's Paired Villaggio Chise (HK3) */
defBuilding({key:'hk_house_poor_diver',name:'Diver Paired Villaggio Chise Huts',seed:8103,cut:true,
 w:17.6,d:13.8,h:7.6,tags:{types:['dwelling-multi'],wealth:'poor',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(16.0,11.4,.44,{stepW:2.8,stepRun:.9});
  /* West & East basalt-ringed whale-rib chise cells opening onto shared paved court */
  hkChise(-3.7,-.4,py,4.2,2.05,2.45,2.05,{
   ribs:8,crownH:.66,crownFins:4,
   doors:[{yaw:.32,w:1.28,h:2.0}],
   windows:[{yaw:-PI/2,w:.72,y:.92,h:.8}]
  });
  hkChise(3.7,-.4,py,4.2,2.05,2.45,2.05,{
   ribs:8,crownH:.66,crownFins:4,
   doors:[{yaw:-.32,w:1.28,h:2.0}],
   windows:[{yaw:PI/2,w:.72,y:.92,h:.8}]
  });
  hkWindHanging(0,py,-3.8,0,2.6,2.45,{mk:'kelp',panels:3});
  hkTarget(-3.7,py+.08,-.4,'west diver cell');
  hkTarget(3.7,py+.08,-.4,'east diver cell');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-3.7,py+.08,-.4,0],
   ['generic_poor_straw_bed',-4.8,py+.08,-.9,PI/2],
   ['hueru-kuran_kaen_storage_jar',-2.7,py+.08,-1.2,0,{v:1}],
   ['hueru-kuran_driftwood_chest',-3.7,py+.08,1.1,PI],
   ['hueru-kuran_whale_oil_hearth',3.7,py+.08,-.4,0],
   ['hueru-kuran_whalebone_cot',4.8,py+.08,-.8,-PI/2],
   ['hueru-kuran_harpoon_rack',2.7,py+.08,-1.1,0],
   ['hueru-kuran_jade_lamp_pedestal',0,py,3.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 4. Middle Nephrite-Carver's Chise & Gutskin Sawing Court (HK3 + HK4) */
defBuilding({key:'hk_house_mid_carver',name:'Nephrite-Carver Chise and Sawing Court',seed:8104,cut:true,
 w:16.8,d:14.8,h:8.4,tags:{types:['dwelling-single','shop'],wealth:'middle',style:'hueru-kuran',job:'masonry'},
 build(){
  const py=hkPlinth(15.2,12.4,.48,{stepW:2.6,stepRun:.95});
  /* 2.4 m thick battered basalt ring-wall chise on west + gutskin-shaded jade-carving court on east */
  hkChise(-2.4,-.3,py,5.2,2.4,2.75,2.45,{
   ribs:10,crownH:.8,crownFins:4,
   doors:[{yaw:0,w:1.42,h:2.12},{yaw:PI/2,w:1.25,h:2.0,ajar:.75}],
   windows:[{yaw:-PI/2,w:.85,y:1.0,h:.9},{yaw:PI,w:.85,y:1.0,h:.9}]
  });
  hkGutskinAwning(2.9,-3.8,7.1,3.8,py,py+2.95,{sag:.28});
  hkNephriteChimes(5.0,py+2.85,3.85,0,2.0,.95,5);
  hkNauticalTotemPole(6.2,py,4.9,-.18,{h:5.2,tiers:['otter','pelican','whale'],pelicanChime:true});
  hkTarget(-2.4,py+.08,-.3,'carver lodge');
  hkTarget(5.0,py,0,'jade sawing court');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.4,py+.08,-.3,0],
   ['hueru-kuran_whalebone_cot',-4.1,py+.08,-.9,PI/2],
   ['hueru-kuran_cedar_feast_trough',-2.2,py+.08,-1.85,0],
   ['hueru-kuran_seal_pelt_mat',-1.1,py+.08,.5,-PI/2,{v:0}],
   ['hueru-kuran_kaen_storage_jar',-3.8,py+.08,1.1,0,{v:1}],
   ['hueru-kuran_jade_saw_bench',5.0,py,-1.2,0,{setting:'outdoor'}],
   ['hueru-kuran_nephrite_chime_rack',5.2,py,1.8,PI,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.8,py,4.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 5. Middle Boat-Steerer's Chise & Baidarka Porch (HK3 + HK4) */
defBuilding({key:'hk_house_mid_harpooneer',name:'Harpooneer Chise and Baidarka Porch',seed:8105,cut:true,
 w:16.6,d:14.6,h:8.5,tags:{types:['dwelling-single'],wealth:'middle',style:'hueru-kuran',job:'fishing'},
 build(){
  const py=hkPlinth(15.0,12.2,.48,{stepW:2.6,stepRun:.95});
  hkChise(-2.2,-.2,py,5.25,2.45,2.8,2.5,{
   ribs:10,crownH:.82,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.12}],
   windows:[{yaw:-PI/2,w:.88,y:1.02,h:.9},{yaw:PI,w:.88,y:1.02,h:.9},{yaw:PI*.45,w:.82,y:1.02,h:.88,seaglass:true}]
  });
  /* Side rack sheltering an oiled-hide baidarka under a taut sea-beast hide canopy */
  hkGutskinAwning(3.2,-3.6,7.0,3.4,py,py+2.85,{mk:'hide',sag:.24});
  hkBaidarka(5.1,py+.48,-.2,0,5.2);
  svNoWalk(()=>{
   for(const sz of [-1.6,1.2])box('cypress',5.1,py,sz,1.5,.48,.18,P('cypressD'));
  });
  hkWhaleJawArch(-2.2,py,5.4,0,3.2,3.4);
  hkNauticalTotemPole(-6.3,py,4.7,.22,{h:5.4,tiers:['seal','whale','pelican'],pelicanChime:true});
  hkTarget(-2.2,py+.08,-.2,'harpooneer hall');
  hkTarget(5.1,py,3.8,'baidarka porch');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.2,py+.08,-.2,0],
   ['hueru-kuran_whalebone_cot',-3.9,py+.08,-.8,PI/2],
   ['hueru-kuran_harpoon_rack',-.6,py+.08,-1.5,0],
   ['hueru-kuran_cedar_feast_trough',-2.2,py+.08,1.35,0],
   ['hueru_nautical_crest_chest',-3.6,py+.08,1.1,PI/2],
   ['job_net_frame',5.2,py,3.9,0,{setting:'outdoor'}]
  ]);
 }});

/* 6. Middle Whale-Skipper's Nuraghe-Buttressed Chise Lodge (HK1 + HK3) */
defBuilding({key:'hk_house_mid_skipper',name:'Whale-Skipper Nuraghe and Chise Lodge',seed:8106,cut:true,
 w:17.8,d:14.8,h:9.8,tags:{types:['dwelling-single'],wealth:'middle',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(16.2,12.4,.52,{stepW:2.8,stepRun:1.0});
  /* West whale-rib chise living hall + East battered Sardinian basalt nuraghe store-keep */
  hkChise(-2.9,-.2,py,5.1,2.35,2.8,2.45,{
   ribs:10,crownH:.82,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.14}],
   windows:[{yaw:-PI/2,w:.86,y:1.0,h:.9},{yaw:PI,w:.86,y:1.0,h:.9}]
  });
  hkNuraghe(4.4,-.4,py,3.35,2.45,6.8,{
   wallT:1.15,courses:7,
   doors:[{yaw:0,w:1.28,h:2.05}],
   windows:[{yaw:PI/2,w:.72,y:3.2,h:.85}]
  });
  hkWindHanging(0.8,py,4.4,0,2.2,2.5,{mk:'banner',panels:2});
  hkNauticalTotemPole(6.6,py,4.6,-.2,{h:6.0,tiers:['crab','pelican','whale'],pelicanChime:true});
  hkTarget(-2.9,py+.08,-.2,'skipper chise');
  hkTarget(4.4,py+.08,-.4,'nuraghe store');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.9,py+.08,-.2,0],
   ['hueru-kuran_whalebone_cot',-4.5,py+.08,-.8,PI/2],
   ['hueru-kuran_cedar_feast_trough',-2.9,py+.08,-1.8,0],
   ['hueru-kuran_seal_pelt_mat',-1.4,py+.08,.4,-PI/2,{v:1}],
   ['hueru-kuran_driftwood_chest',4.4,py+.08,-1.2,0],
   ['hueru-kuran_kaen_storage_jar',3.5,py+.08,-.2,0,{v:0}],
   ['hueru-kuran_harpoon_rack',5.2,py+.08,-.2,-PI/2],
   ['hueru-kuran_jade_lamp_pedestal',1.0,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 7. Rich Terrace Steward's Walled Twin-Chise Compound (HK3) */
defBuilding({key:'hk_house_rich_steward',name:'Terrace Steward Twin-Chise Compound',seed:8107,cut:true,
 w:21.2,d:17.8,h:9.6,tags:{types:['dwelling-single'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(19.4,15.2,.56,{stepW:3.0,stepRun:1.05});
  /* Main 2.6 m-wall whale-rib feast chise + private sleeping chise + cyclopean basalt forecourt wall */
  hkChise(-3.4,-1.2,py,5.8,2.6,3.05,2.85,{
   ribs:12,crownH:.92,crownFins:6,
   doors:[{yaw:0,w:1.55,h:2.2}],
   windows:[{yaw:-PI/2,w:.92,y:1.08,h:.95},{yaw:PI,w:.92,y:1.08,h:.95}]
  });
  hkChise(4.8,-1.6,py,4.45,2.2,2.65,2.2,{
   ribs:10,crownH:.75,crownFins:4,
   doors:[{yaw:-.35,w:1.35,h:2.08}],
   windows:[{yaw:PI/2,w:.82,y:1.0,h:.88,seaglass:true}]
  });
  /* Low cyclopean court breastwork with nephrite-lintel forecourt gate */
  hkWall(-9.0,6.6,-1.6,6.6,py,1.65,{mk:'basalt',t:.52});
  hkWall(1.6,6.6,9.0,6.6,py,1.65,{mk:'basalt',t:.52});
  hkJadeDoor(0,py,6.6,0,2.2,2.35,{open:true,t:.52});
  hkNephriteChimes(1.2,py+2.9,3.2,0,2.4,1.1,5);
  hkTarget(-3.4,py+.08,-1.2,'steward great chise');
  hkTarget(4.8,py+.08,-1.6,'sleeping chise');
  hkTarget(0,py,4.4,'forecourt');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-3.4,py+.08,-1.2,0],
   ['hueru-kuran_cedar_feast_trough',-3.4,py+.08,-3.1,0],
   ['hueru-kuran_seal_pelt_mat',-5.2,py+.08,-1.2,PI/2,{v:0}],
   ['hueru-kuran_seal_pelt_mat',-1.6,py+.08,-1.2,-PI/2,{v:1}],
   ['hueru-kuran_nephrite_chime_rack',-5.4,py+.08,.4,PI/4],
   ['hueru-kuran_whalebone_cot',5.6,py+.08,-2.0,-PI/2],
   ['hueru-kuran_baleen_loom',3.8,py+.08,-2.4,0],
   ['hueru-kuran_driftwood_chest',4.8,py+.08,-.1,PI],
   ['hueru-kuran_jade_lamp_pedestal',-1.8,py,5.2,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',1.8,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 8. Rich Whale-Lord's Two-Storey Nuraghe Keep & Great Chise Manor (HK1 + HK3) */
defBuilding({key:'hk_house_rich_whalelord',name:'Whale-Lord Nuraghe Keep and Chise Manor',seed:8108,cut:true,
 w:21.6,d:17.4,h:11.6,tags:{types:['dwelling-single'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(19.8,14.8,.58,{stepW:3.2,stepRun:1.1});
  /* West Great Chise Feast Dome (2.7 m ring-wall) */
  hkChise(-3.8,-.6,py,5.9,2.7,3.1,2.95,{
   ribs:12,crownH:.95,crownFins:6,
   doors:[{yaw:0,w:1.58,h:2.22}],
   windows:[{yaw:-PI/2,w:.95,y:1.1,h:.96},{yaw:PI,w:.95,y:1.1,h:.96}]
  });
  /* East Two-Storey Sardinian Basalt Nuraghe Keep with walkable upper loft! */
  const yLoft=py+3.85;
  hkNuraghe(4.8,-.6,py,4.35,3.25,8.4,{
   wallT:1.3,courses:9,
   doors:[{yaw:0,w:1.45,h:2.15}],
   windows:[{yaw:PI/2,w:.82,y:1.2,h:.9},{yaw:0,w:.84,y:4.7,h:.95},{yaw:PI/2,w:.84,y:4.7,h:.95}]
  });
  const st=svStairCase({x0:3.0,x1:6.6,z0:-2.5,z1:-.5},[py+.06,yLoft],{w:.84,mk:'cypress',col:P('cypress')});
  svWell('floor',4.8,yLoft-.2,-.6,3.8,.2,3.8,P('floor'),st.wells[0]);
  hkWhaleJawArch(-3.8,py,6.1,0,3.6,3.8);
  hkWindHanging(1.0,py,5.4,0,2.4,2.8,{mk:'banner',panels:2});
  hkNauticalTotemPole(8.2,py,5.4,-.16,{h:7.4,tiers:['crab','octopus','pelican','whale'],pelicanChime:true});
  hkNauticalTotemPole(-8.4,py,5.4,.16,{h:6.4,tiers:['seal','otter','whale','pelican']});
  hkTarget(-3.8,py+.08,-.6,'feast chise');
  hkTarget(5.6,py+.08,.4,'nuraghe ground');
  hkTarget(5.6,yLoft,.65,'nuraghe upper chamber');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-3.8,py+.08,-.6,0],
   ['hueru-kuran_cedar_feast_trough',-3.8,py+.08,-2.5,0],
   ['hueru-kuran_seal_pelt_mat',-5.6,py+.08,-.6,PI/2,{v:0}],
   ['hueru-kuran_nephrite_chime_rack',-2.0,py+.08,-1.8,-PI/4],
   ['hueru-kuran_harpoon_rack',5.8,py+.08,-1.5,-PI/2],
   ['hueru_nautical_crest_chest',5.8,py+.08,.4,-PI/2],
   ['hueru-kuran_whalebone_cot',5.5,yLoft,-.6,-PI/2],
   ['hueru-kuran_jade_lamp_pedestal',1.0,py,6.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 9. Rich Three-Lodge Villaggio Nuragico Clan Cluster (HK3) */
defBuilding({key:'hk_house_rich_clan',name:'Villaggio Nuragico Three-Chise Clan Cluster',seed:8109,cut:true,
 w:22.4,d:19.6,h:9.4,tags:{types:['dwelling-multi'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(20.6,17.2,.56,{stepW:3.2,stepRun:1.08});
  /* Authentic Sardinian Su Nuraxi domestic cluster: north elder chise + west & east family chise round central hearth court */
  hkChise(0,-3.2,py,5.2,2.45,2.95,2.6,{
   ribs:12,crownH:.88,crownFins:6,
   doors:[{yaw:0,w:1.5,h:2.18}],
   windows:[{yaw:PI,w:.9,y:1.05,h:.92}]
  });
  hkChise(-5.6,2.4,py,4.35,2.2,2.6,2.15,{
   ribs:8,crownH:.72,crownFins:4,
   doors:[{yaw:PI*.38,w:1.35,h:2.06}],
   windows:[{yaw:-PI/2,w:.8,y:.98,h:.86}]
  });
  hkChise(5.6,2.4,py,4.35,2.2,2.6,2.15,{
   ribs:8,crownH:.72,crownFins:4,
   doors:[{yaw:-PI*.38,w:1.35,h:2.06}],
   windows:[{yaw:PI/2,w:.8,y:.98,h:.86}]
  });
  hkNephriteChimes(0,py+2.95,6.8,0,2.8,1.15,6);
  hkNauticalTotemPole(-8.5,py,6.9,.2,{h:6.8,tiers:['otter','seal','pelican','whale'],pelicanChime:true});
  hkTarget(0,py+.08,-3.2,'elder chise');
  hkTarget(-5.6,py+.08,2.4,'west kin chise');
  hkTarget(5.6,py+.08,2.4,'east kin chise');
  hkTarget(0,py,2.8,'clan court');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,py+.08,-3.2,0],
   ['hueru-kuran_cedar_feast_trough',0,py+.08,-4.9,0],
   ['hueru-kuran_nephrite_chime_rack',-1.7,py+.08,-3.2,PI/2],
   ['hueru-kuran_whalebone_cot',-6.4,py+.08,2.2,PI/2],
   ['hueru-kuran_seal_pelt_mat',-4.8,py+.08,3.2,0,{v:1}],
   ['hueru-kuran_whalebone_cot',6.4,py+.08,2.2,-PI/2],
   ['hueru-kuran_baleen_loom',4.9,py+.08,1.4,0],
   ['hueru-kuran_whale_oil_hearth',0,py,3.0,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-2.2,py,6.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.2,py,6.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 10. Crookshore Cliff-Terrace Wayfarer Hostel (HK1 + HK3) */
defBuilding({key:'hk_inn_terrace',name:'Crookshore Cliff-Terrace Wayfarer Hostel',seed:8110,cut:true,
 w:19.6,d:15.6,h:9.6,tags:{types:['inn'],wealth:'middle',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(18.0,13.2,.52,{stepW:3.0,stepRun:1.0});
  /* Heavy cyclopean-basalt bunk hall on west + refuge nuraghe corner tower on east + gutskin courtyard shelter */
  hkWallRing(-8.0,-5.2,2.2,2.8,py,3.5,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:5.1,w:1.65,h:2.2},{at:1.8,w:.95,y:1.05,h:.95},{at:8.4,w:.95,y:1.05,h:.95}],
   n:[{at:3.2,w:.95,y:1.05,h:.95},{at:7.0,w:.95,y:1.05,h:.95}]
  }});
  hkJadeDoor(-2.9,py,2.8,0,1.65,2.2);
  hkJadeWindow(-6.2,py+1.05,2.8,0,.95,.95);
  hkJadeWindow(.5,py+1.05,2.8,0,.95,.95);
  hkJadeWindow(-4.8,py+1.05,-5.2,PI,.95,.95,{seaglass:true});
  hkJadeWindow(-1.0,py+1.05,-5.2,PI,.95,.95,{seaglass:true});
  hkTurfRoof(-2.9,py+3.74,-1.2,10.8,8.6,1.65,{mk:'turf',kaen:true});
  hkNuraghe(5.6,-1.6,py,3.1,2.3,6.4,{
   wallT:1.1,courses:7,
   doors:[{yaw:0,w:1.25,h:2.05}],
   windows:[{yaw:PI/2,w:.72,y:3.0,h:.85}]
  });
  hkGutskinAwning(-6.8,3.4,1.2,5.8,py,py+2.85,{sag:.26});
  hkTarget(-2.9,py,-1.2,'hostel bunkroom');
  hkTarget(5.6,py+.08,-1.6,'refuge tower');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.9,py,-1.2,0],
   ['generic_trade_bunk',-6.6,py,-3.4,PI/2],
   ['generic_trade_bunk',-6.6,py,.4,PI/2],
   ['hueru-kuran_whalebone_cot',.6,py,-3.2,-PI/2],
   ['hueru-kuran_cedar_feast_trough',-.4,py,.2,PI/2],
   ['hueru-kuran_driftwood_chest',5.6,py+.08,-2.4,0],
   ['hueru-kuran_cedar_feast_trough',-2.8,py,4.6,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.8,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 11. Leviathan-Jawbone Blubber-Lamp Tavern (HK3 + HK4) */
defBuilding({key:'hk_tavern_whale',name:'Leviathan-Jawbone Blubber-Lamp Tavern',seed:8111,cut:true,
 w:18.4,d:16.4,h:9.2,tags:{types:['tavern'],wealth:'middle',style:'hueru-kuran',job:'brewing'},
 build(){
  const py=hkPlinth(16.8,14.0,.5,{stepW:3.0,stepRun:1.0});
  /* Wide basalt-ringed whale-rib taproom dome + monumental Leviathan jawbone arch portal + outdoor gutskin beer-bench */
  hkChise(0,-.8,py,6.2,2.55,2.95,2.85,{
   ribs:12,crownH:.94,crownFins:6,
   doors:[{yaw:0,w:1.62,h:2.22}],
   windows:[{yaw:PI/2,w:.95,y:1.05,h:.95,seaglass:true},{yaw:-PI/2,w:.95,y:1.05,h:.95,seaglass:true},{yaw:PI,w:.95,y:1.05,h:.95}]
  });
  hkWhaleJawArch(0,py,5.6,0,4.2,4.15);
  hkGutskinAwning(-7.2,2.8,-3.2,6.0,py,py+2.75,{sag:.24});
  hkWindHanging(5.6,py,4.4,0,2.4,2.55,{mk:'kelp',panels:3});
  hkNauticalTotemPole(7.0,py,5.7,-.22,{h:5.8,tiers:['octopus','pelican','whale'],pelicanChime:true});
  hkTarget(0,py+.08,-.8,'whale tavern hall');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,py+.08,-.8,0],
   ['hueru-kuran_cedar_feast_trough',-2.1,py+.08,-.8,PI/2],
   ['hueru-kuran_cedar_feast_trough',2.1,py+.08,-.8,PI/2],
   ['generic_poor_counter',0,py+.08,-2.9,0],
   ['generic_keg',-1.5,py+.08,-3.1,0],
   ['hueru-kuran_kaen_storage_jar',1.5,py+.08,-3.1,0,{v:2}],
   ['hueru-kuran_seal_pelt_mat',-3.0,py+.08,-.8,PI/2,{v:0}],
   ['generic_poor_bench',-5.2,py,4.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.6,py,5.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 12. Hayrant Sister-Clan Highland Diplomatic Legation (HK1 + HK3) */
defBuilding({key:'hk_embassy_hayrant',name:'Hayrant Sister-Clan Diplomatic Legation',seed:8112,cut:true,
 w:19.2,d:15.8,h:10.4,tags:{types:['civic'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(17.6,13.4,.56,{stepW:3.0,stepRun:1.05});
  hkChise(-2.6,-.4,py,5.4,2.5,2.95,2.65,{
   ribs:12,crownH:.9,crownFins:6,
   doors:[{yaw:0,w:1.52,h:2.2}],
   windows:[{yaw:-PI/2,w:.9,y:1.08,h:.94},{yaw:PI,w:.9,y:1.08,h:.94}]
  });
  hkNuraghe(4.8,-.4,py,3.5,2.6,7.4,{
   wallT:1.2,courses:8,
   doors:[{yaw:0,w:1.32,h:2.08}],
   windows:[{yaw:PI/2,w:.78,y:3.5,h:.88}]
  });
  hkWindHanging(-6.6,py,4.8,0,2.4,2.95,{mk:'banner',panels:2});
  hkNephriteChimes(1.2,py+3.05,4.8,0,2.6,1.15,5);
  hkNauticalTotemPole(7.2,py,4.8,-.18,{h:6.6,tiers:['whale','otter','pelican','whale'],pelicanChime:true});
  hkTarget(-2.6,py+.08,-.4,'legation council chise');
  hkTarget(4.8,py+.08,-.4,'treaty archive nuraghe');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.6,py+.08,-.4,0],
   ['hueru-kuran_cedar_feast_trough',-2.6,py+.08,-2.2,0],
   ['hueru-kuran_nephrite_chime_rack',-4.4,py+.08,-.4,PI/2],
   ['hueru-kuran_seal_pelt_mat',-1.0,py+.08,-.4,-PI/2,{v:0}],
   ['generic_writing_supplies',-2.6,py+.6,-2.2,0],
   ['generic_strongbox',4.8,py+.08,-1.3,0],
   ['hueru-kuran_driftwood_chest',3.9,py+.08,-.2,PI/2],
   ['hueru-kuran_jade_lamp_pedestal',1.2,py,5.6,0,{setting:'outdoor'}]
  ]);
 }});
