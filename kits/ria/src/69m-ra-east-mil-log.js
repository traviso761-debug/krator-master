// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — MILITARY & LOGISTICS (29-38)
// 5 Upper Ria military fortifications + 5 Upper Ria karst/pass logistics & hydraulic works in High-Ria stone & Lanna slate grammar:
//   29. ra_east_pylon_rampart       — Walkable red-porphyry & dolomite cavetto rampart wall & Lanna crossbow bastion
//   30. ra_east_chain_drydock       — Hongsa gorge-chain winch pylon & cut-stone war-barge naval slipway
//   31. ra_east_bronze_arsenal      — Porphyry-and-copper brass munitions hall, forge hearth & stone Prang magazine
//   32. ra_east_pack_castellum      — Upland escort & pack-train garrison castellum with Classical dolomite stalls
//   33. ra_east_acropolis_keep      — Two-storey porphyry-pylon & Shikhara-Prang command citadel + lodestone obelisks
//   34. ra_east_counterweight_wharf — Karst stone-counterweight quay-crane wharf & bonded silk-amber entrepot
//   35. ra_east_pass_relay          — Highland lodestone-beacon courier relay & mule station
//   36. ra_east_spring_castellum    — Ptolemaic-Pantheon karst spring reservoir & silver Hongsa nymphaeum
//   37. ra_east_caravan_tollhouse   — Battered porphyry caravan weigh-gate & bullion assay customhouse
//   38. ra_east_terrace_depot       — Buttressed dolomite & indigo-slate provisioning magazine

/* 29. Battered Red-Porphyry Cavetto Rampart and Bolt-Bastion (military) */
defBuilding({
 key:'ra_east_pylon_rampart',
 name:'Battered Red-Porphyry Cavetto Rampart and Bolt-Bastion',
 seed:7229,w:26,d:16,h:17.8,budget:98000,cut:true,
 front:{x:0,z:6.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['military'],role:'wall-bastion'},
 build(){
  const y1=.38,yRamp=4.2,twH=3.85;
  raFloorSlab(0,y1,0,23.6,13.2,{mk:'paving',th:.38});
  raStripWalk([0,0,7.1],[0,y1,5.9],3.2);

  /* Flanking Walkable Dressed-Dolomite & Red-Porphyry Cavetto Curtain Walls [-11.4..-3.8] & [3.8..11.4] */
  for(const s of [-1,1]){
   const wx=s*7.6;
   svNoWalk(()=>{
    box('porphyry',wx,y1+.01,-.6,7.6,yRamp-y1-.32,3.6,P('porphyry'));
    box('dolomite',wx,yRamp-.31,-.6,7.74,.2,3.74,P('dolomite'));
   });
   raFloorSlab(wx,yRamp,-.6,7.6,3.5,{mk:'paving',th:.11});
   raWallBlock(wx,y1,-.6,7.5,3.2,3.4,0);
   raClassicalBalustrade(wx-3.7,1.05,wx+3.7,1.05,yRamp,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:false});
   raClassicalBalustrade(wx+3.7,-2.25,wx-3.7,-2.25,yRamp,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',skipMid:s<0?1.35:0,block:false});
  }
  raGrandStair(-7.6,y1,-5.8,-7.6,yRamp,-2.35,2.2,{mk:'dolomite',sideMk:'porphyry'});

  /* Central Battered Porphyry-and-Dolomite Bolt-Bastion [-3.8..3.8, -4.4..3.6] */
  raWallRing(-3.8,-4.4,3.8,3.6,y1,yRamp-y1,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',cornice:false,
   holes:{
    s:[{at:0,w:1.75,h:2.4,door:true,crownMk:'silver',name:'east-bastion-sally-door'}],
    n:[{at:0,w:1.6,h:2.35,door:true,crownMk:'silver',name:'east-bastion-gorge-door'}],
    e:[{at:-.4,w:.85,h:1.25,y:1.2}],
    w:[{at:-.4,w:.85,h:1.25,y:1.2}]
   }
  });
  raCavettoCornice(0,yRamp-.36,-.4,7.7,8.1,.34,{mk:'dolomite',bandMk:'silver'});
  raFloorSlab(0,yRamp,-.4,7.8,8.0,{mk:'mosaic',th:.16});
  raCeilingSlab(0,yRamp-.22,-.4,7.0,7.2,{mk:'dolomite',trimMk:'silver'});
  raClassicalBalustrade(-3.7,3.45,3.7,3.45,yRamp,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:false});

  raWallRing(-2.9,-3.4,2.9,2.2,yRamp,twH,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    e:[{at:-.6,w:1.45,h:2.2,door:true,open:true}],
    w:[{at:-.6,w:1.45,h:2.2,door:true,open:true}],
    s:[{at:0,w:1.15,h:1.45,y:1.0,pediment:true}],
    n:[{at:0,w:1.4,h:2.15,door:true,crownMk:'silver',name:'east-bastion-turret-door'}]
   }
  });
  raTieredRoof(0,yRamp+twH,-.6,6.2,6.0,2,{
   style:'upper-ria',mode:'hip',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.56,tierRise:.96,spire:true,spireH:3.4
  });
  raBanner(-6.8,yRamp,1.0,0,3.2,P('silkSaffron'),true);
  raBanner(6.8,yRamp,1.0,0,3.2,P('silkIndigo'),true);

  raTarget(0,y1,-.4,'porphyry-bolt-magazine',true);
  raTarget(0,yRamp,-.6,'upper-bolt-turret',true);
  raTarget(-7.6,yRamp,-.6,'west-rampart-walk',false);
  raTarget(7.6,yRamp,-.6,'east-rampart-walk',false);

  raFurnList([
   ['ria_tribute_chest',-2.2,y1,-2.6,PI/2],
   ['ria_tribute_chest',2.2,y1,-2.6,-PI/2],
   ['ria_glazed_amphora_rack',2.2,y1,.8,-PI/2],
   ['ria_hongsa_lectern',0,yRamp,-1.8,0],
   ['ria_lodestone_compass',0,y1,4.8,0],
   ['ria_lantern_stand',-2.2,y1,4.8,0]
  ]);
 }
});

/* 30. Hongsa Gorge-Chain Winch Tower and War-Barge Slipway (military + infrastructure) */
defBuilding({
 key:'ra_east_chain_drydock',
 name:'Hongsa Gorge-Chain Winch Tower and War-Barge Slipway',
 seed:7230,w:28,d:22,h:20.2,budget:118000,cut:true,
 front:{x:-5.6,z:9.8,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['military','infrastructure'],role:'naval-arsenal',job:'shipwrighting'},
 build(){
  /* East Cut-Dolomite Gorge Slipway [x = 4.6..11.8] + Silver-Bronze Boom Chain across channel */
  raWaterCourt(8.2,0,7.4,19.2,.32,.74,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:1,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[8.2,.1,-9.0],[8.2,.1,0],[8.2,.1,9.0]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'hongsa-chain-slip',pts:wPts,width:6.4,speed:.4};
  }
  const y1=.65,gh=4.2,y2=y1+gh;
  raFloorSlab(-4.2,y1,0,17.2,18.8,{mk:'paving',th:.65});
  raFloorSlab(12.2,y1,0,1.8,18.8,{mk:'dolomite',th:.65,walk:false});
  raFloorSlab(8.2,y1,-8.6,7.4,2.0,{mk:'dolomite',th:.38,walk:false});
  raGrandStair(-5.6,0,10.0,-5.6,y1,8.8,3.2,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.72}});

  raChainCapstan(2.2,y1,5.4,true);
  svNoWalk(()=>{
   cyl('porphyry',12.2,y1+.01,5.4,.52,1.15,P('porphyry'),10);
   cyl('silver',12.2,y1+1.16,5.4,.58,.18,P('silver'),10);
   beam('silver',[2.4,y1+.85,5.4],[7.3,y1+.38,5.4],.085,P('silver'),true,8);
   beam('silver',[7.3,y1+.38,5.4],[12.1,y1+.85,5.4],.085,P('silver'),true,8);
   raHongsaSculpt(4.2,y1+.2,8.2,0,.95);
  });

  /* West Classical Palm-Column & Dolomite Hull-Rigging Arsenal [-12.0..-.6, -8.2..6.8] */
  raWallRing(-12.0,-8.2,-.6,6.8,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-6.3,w:2.1,h:2.65,door:true,crownMk:'silver',name:'drydock-south-gate'}],
    e:[{at:-1.2,w:1.8,h:2.45,door:true,crownMk:'silver',name:'drydock-slip-door'}],
    n:[{at:-6.3,w:1.35,h:1.6,y:1.05,pediment:true}],
    w:[{at:-1.0,w:1.35,h:1.6,y:1.05,pediment:true}]
   }
  });
  raTieredRoof(-6.3,y2,-.7,11.8,15.4,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.64,tierRise:1.08
  });

  /* Battered Red-Porphyry Gorge-Chain Winch Pylon & Stone Shikhara-Prang [x = -.6..4.0, z = -5.6..1.6] */
  raWallRing(-.6,-5.6,4.0,1.6,y1,gh+2.6,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:1.7,w:1.5,h:2.3,door:true,crownMk:'silver',name:'chain-pylon-door'}],
    e:[{at:-2.0,w:1.1,h:1.5,y:4.4,pediment:true}]
   }
  });
  raCeilingSlab(1.7,y1+gh+2.62,-2.0,4.2,6.8,{mk:'dolomite',trimMk:'silver'});
  raPrang(1.7,y1+gh+2.72,-2.0,4.2,7.2,{style:'upper-ria',mk:'alabaster',bandMk:'porphyry',trimMk:'silver',vault:true});

  raTarget(1.7,y1,7.2,'hongsa-winch-quay',false);
  raTarget(-6.3,y1,-.7,'hull-armoury-hall',true);
  raTarget(1.7,y1,-2.0,'chain-pylon-guardroom',true);

  raFurnList([
   ['ria_porphyry_table',-6.3,y1,-2.4,0],
   ['ria_tribute_chest',-10.2,y1,-5.8,PI/2],
   ['ria_tribute_chest',-10.2,y1,-2.8,PI/2],
   ['ria_glazed_amphora_rack',-2.4,y1,-5.8,-PI/2],
   ['ria_hongsa_lectern',1.7,y1,-3.6,0],
   ['ria_lodestone_compass',-6.3,y1,3.2,0],
   ['ria_lantern_stand',2.2,y1,7.6,0]
  ]);
 }
});

/* 31. Porphyry-and-Copper Brass Munitions and Shield Arsenal (military + industry) */
defBuilding({
 key:'ra_east_bronze_arsenal',
 name:'Porphyry-and-Copper Brass Munitions and Shield Arsenal',
 seed:7231,w:24,d:20,h:17.8,budget:106000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['military','industry'],role:'armoury',job:'smithing'},
 build(){
  const y1=.55,gh=4.15,yRoof=y1+gh;
  raPlinth(20.6,16.2,y1,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.6,stepRun:1.4,rail:'hongsa',railOpts:{scale:.68}
  });

  raColonnade(-9.2,7.1,9.2,7.1,y1,gh,{style:'upper-ria',n:6,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.24,capital:'palm'});
  raCeilingSlab(0,yRoof-.12,5.6,19.4,2.8,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-9.6,-7.2,9.6,4.2,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-5.4,w:1.6,h:2.35,door:true,crownMk:'silver',name:'east-arsenal-w-door'},
     {at:0,w:2.2,h:2.65,door:true,crownMk:'silver',name:'east-arsenal-main-gate'},
     {at:5.4,w:1.6,h:2.35,door:true,crownMk:'silver',name:'east-arsenal-e-door'}
    ],
    n:[{at:-5.2,w:1.15,h:1.45,y:1.1},{at:5.2,w:1.15,h:1.45,y:1.1}],
    w:[{at:-1.5,w:1.2,h:1.5,y:1.1,pediment:true}]
   }
  });

  /* East Brass-Casting Armourer's Furnace + Patinated Copper Flue */
  svNoWalk(()=>{
   box('porphyry',7.6,y1+.01,-4.4,2.8,2.4,2.4,P('porphyry'));
   box('glow',6.14,y1+.45,-4.4,.12,.72,.88,P('flame'));
   cyl('copper',7.6,yRoof+.45,-4.4,.52,2.9,P('copper'),10);
  });
  raWallBlock(7.6,y1,-4.4,2.8,3.2,2.4,0);
  smokeAt(7.6,yRoof+3.45,-4.4,{r:.26,kind:'fire'});
  haloAt(6.0,y1+.8,-4.4,0xff9436,true);

  for(const sx of [-6.6,6.6]){
   raFlatTerraceRoof(sx,yRoof,-1.5,6.2,11.6,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:sx<0?'e':'w'
   });
  }
  raCeilingSlab(0,yRoof+.02,-1.5,7.0,11.0,{mk:'dolomite',trimMk:'silver'});
  raTieredRoof(0,yRoof+.18,-1.5,7.4,11.8,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'copper',trimMk:'silver',soffitMk:'cedar',neckMk:'porphyry',
   over:.62,tierRise:1.02,ceiling:false,spire:true,spireH:3.8
  });

  raTarget(0,y1,5.6,'arsenal-palm-portico',true);
  raTarget(0,y1,-1.5,'brass-shield-hall',true);
  raTarget(-6.4,y1,-1.5,'bolt-and-spear-vault',true);

  raFurnList([
   ['ria_porphyry_table',0,y1,-2.2,0],
   ['ria_tribute_chest',-7.6,y1,-4.8,PI/2],
   ['ria_tribute_chest',-7.6,y1,-1.6,PI/2],
   ['ria_glazed_amphora_rack',-7.6,y1,1.6,PI/2],
   ['ria_hongsa_lectern',-3.4,y1,-4.8,0],
   ['ria_lodestone_compass',-3.6,y1,5.6,0],
   ['ria_lantern_stand',3.6,y1,5.6,0]
  ]);
 }
});

/* 32. Upland Escort and Pack-Train Garrison Castellum (military) */
defBuilding({
 key:'ra_east_pack_castellum',
 name:'Upland Escort and Pack-Train Garrison Castellum',
 seed:7232,w:26,d:22,h:16.0,budget:108000,cut:true,
 front:{x:0,z:9.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['military'],role:'cavalry-fort',job:'herding'},
 build(){
  const y1=.42,gh=3.7,yRoof=y1+gh;
  raFloorSlab(0,y1,0,23.2,18.8,{mk:'paving',th:.42});
  raStripWalk([0,0,10.0],[0,y1,8.8],3.4);

  raBatteredPylon(-9.8,7.8,2.4,2.4,y1,4.9,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  raBatteredPylon(9.8,7.8,2.4,2.4,y1,4.9,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  raClassicalBalustrade(-8.2,8.4,-2.2,8.4,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(2.2,8.4,8.2,8.4,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raWaterCourt(-5.4,4.4,5.2,2.4,y1+.34,.38,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:0});

  /* West Classical Dolomite Stall Arcade [-11.0..-6.4, -7.8..1.2] + Rear Escort Garrison Hall */
  raArcade(-6.4,1.0,-6.4,-7.6,y1,gh-.3,{style:'upper-ria',bays:3,mk:'dolomite',trimMk:'porphyry',pierW:.48});
  raWall(-11.0,-7.8,-11.0,1.2,y1,gh-.3,{style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve'});
  raWall(-6.4,-7.8,-11.0,-7.8,y1,gh-.3,{style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve'});
  raFlatTerraceRoof(-8.7,y1+gh-.3,-3.3,4.8,9.2,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade',skip:'e'
  });

  raWallRing(-5.8,-8.2,10.8,-1.0,y1,gh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-1.8,w:1.6,h:2.35,door:true,crownMk:'silver',name:'east-castellum-mess-door'},
     {at:2.8,w:1.25,h:1.55,y:1.0,pediment:true},
     {at:6.8,w:1.6,h:2.35,door:true,crownMk:'silver',name:'east-castellum-capt-door'}
    ],
    n:[{at:0,w:1.25,h:1.5,y:1.05},{at:6.4,w:1.25,h:1.5,y:1.05}],
    e:[{at:-4.6,w:1.25,h:1.5,y:1.05}]
   }
  });
  raTieredRoof(2.5,yRoof,-4.6,17.0,7.8,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.62,tierRise:1.06
  });

  raTarget(2.0,y1,4.2,'escort-muster-court',false);
  raTarget(-8.7,y1,-3.3,'pack-train-stalls',true);
  raTarget(2.5,y1,-4.6,'escort-barracks-hall',true);

  raFurnList([
   ['ria_porphyry_table',.4,y1,-4.8,0],
   ['ria_teak_divan',8.2,y1,-6.2,0],
   ['ria_hongsa_lectern',5.2,y1,-3.4,PI],
   ['ria_tribute_chest',-3.8,y1,-6.4,PI/2],
   ['ria_glazed_amphora_rack',-9.6,y1,-5.4,PI/2],
   ['ria_lantern_stand',2.8,y1,1.6,0]
  ]);
 }
});

/* 33. Two-Storey Porphyry-Pylon and Shikhara Command Citadel (military + civic) */
defBuilding({
 key:'ra_east_acropolis_keep',
 name:'Two-Storey Porphyry-Pylon and Shikhara Command Citadel',
 seed:7233,w:28,d:24,h:24.8,budget:132000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['military','civic'],role:'citadel'},
 build(){
  const y1=1.4,gh=4.2,y2=y1+gh,uh=3.85,yRoof=y2+uh;
  raPlinth(23.6,18.4,y1,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.8,stepRun:2.8,rail:'hongsa',railOpts:{scale:.88}
  });
  raLodestoneObelisk(-11.4,0,10.2,6.8,{w:.68});
  raLodestoneObelisk(11.4,0,10.2,6.8,{w:.68});

  /* Four colossal battered red-porphyry cavetto corner bastions */
  for(const sx of [-10.4,10.4])for(const sz of [-7.6,6.8]){
   raBatteredPylon(sx,sz,2.8,2.8,y1,gh+1.5,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  }
  raClassicalPediment(0,y1+3.65,7.05,0,5.2,1.2,1.2,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  raWallRing(-9.8,-7.8,9.8,6.6,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-5.8,w:1.1,h:1.45,y:1.15},
     {at:0,w:2.2,h:2.7,door:true,crownMk:'silver',name:'acropolis-keep-gate'},
     {at:5.8,w:1.1,h:1.45,y:1.15}
    ],
    n:[{at:-5.4,w:1.1,h:1.45,y:1.15},{at:0,w:1.55,h:2.35,door:true,crownMk:'silver',name:'acropolis-postern'},{at:5.4,w:1.1,h:1.45,y:1.15}],
    e:[{at:-.6,w:1.15,h:1.5,y:1.15,pediment:true}],
    w:[{at:-.6,w:1.15,h:1.5,y:1.15,pediment:true}]
   }
  });

  const st=svStair(-7.2,-5.8,y1,y2,0,{w:1.3,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,-.6,19.2,14.0,{mk:'mosaic',th:.2,hole:st});
  raCeilingSlab(1.8,y2-.24,-.6,14.6,13.4,{mk:'dolomite',trimMk:'silver'});

  raClassicalBalustrade(-9.4,6.2,9.4,6.2,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(9.4,-7.4,-9.4,-7.4,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(9.4,5.9,9.4,-7.1,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});
  raClassicalBalustrade(-9.4,-7.1,-9.4,5.9,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',block:true});

  raWallRing(-6.6,-5.2,6.6,4.0,y2,uh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-3.4,w:1.15,h:1.5,y:1.0,pediment:true},{at:0,w:1.75,h:2.35,door:true,crownMk:'silver',name:'acropolis-council-s-door'},{at:3.4,w:1.15,h:1.5,y:1.0,pediment:true}],
    e:[{at:-.6,w:1.5,h:2.25,door:true,crownMk:'silver',name:'acropolis-council-e-door'}],
    w:[{at:-.6,w:1.5,h:2.25,door:true,crownMk:'silver',name:'acropolis-council-w-door'}]
   }
  });
  raCeilingSlab(0,yRoof+.02,-.6,12.8,8.8,{mk:'dolomite',trimMk:'silver'});
  raTieredRoof(0,yRoof+.16,-.6,13.6,9.6,2,{
   style:'upper-ria',mode:'hip',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.64,tierRise:.96,ceiling:false
  });
  raPrang(0,yRoof+2.35,-.6,5.2,11.2,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'gold',vault:false});

  raTarget(1.8,y1,-.6,'acropolis-guard-chamber',true);
  raTarget(0,y2,-.6,'high-command-chamber',true);
  raTarget(0,y2,5.1,'balustraded-watch-deck',false);

  raFurnList([
   ['ria_porphyry_table',1.8,y1,-2.2,0],
   ['ria_tribute_chest',7.4,y1,-5.4,-PI/2],
   ['ria_tribute_chest',7.4,y1,2.4,-PI/2],
   ['ria_lodestone_compass',-3.2,y1,3.2,0],
   ['ria_hongsa_lectern',3.2,y1,3.2,0],
   ['ria_sovereign_throne',0,y2,-3.2,0],
   ['ria_amber_seal_desk',3.4,y2,0,-PI/2],
   ['ria_silk_screen',-2.6,y2,-3.4,.2],
   ['ria_silk_screen',2.6,y2,-3.4,-.2]
  ]);
 }
});

/* 34. Karst Counterweight Quay-Crane and Silk-Amber Bonded Entrepot (logistics / warehousing) */
defBuilding({
 key:'ra_east_counterweight_wharf',
 name:'Karst Counterweight Quay-Crane and Silk-Amber Bonded Entrepot',
 seed:7234,w:28,d:22,h:17.2,budget:112000,cut:true,
 front:{x:-4.6,z:9.8,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['infrastructure','market'],role:'crane-wharf',job:'warehousing'},
 build(){
  raWaterCourt(8.4,5.9,8.4,7.0,.34,.7,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:1,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[4.6,.1,5.9],[8.4,.1,5.9],[12.2,.1,5.9]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'karst-crane-berth',pts:wPts,width:6.0,speed:.32};
  }

  const y1=.65,gh=4.05,yRoof=y1+gh;
  raFloorSlab(-4.4,y1,1.2,16.8,16.4,{mk:'paving',th:.65});
  raFloorSlab(8.4,y1,-3.8,8.8,10.8,{mk:'paving',th:.65});
  raGrandStair(-4.6,0,9.9,-4.6,y1,8.7,3.4,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.7}});

  /* Stone-Counterweight Slewing Cargo Crane overhanging the karst barge basin */
  raCargoCrane(8.4,y1,.4,0,true);

  raColonnade(-11.4,3.8,3.4,3.8,y1,gh,{style:'upper-ria',n:6,skipMid:1.6,mk:'dolomite',altMk:'porphyry',r:.23,capital:'palm',block:false});
  raCeilingSlab(-4.0,yRoof-.12,2.7,15.8,2.2,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-12.0,-8.2,4.0,1.6,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-8.2,w:1.75,h:2.4,door:true,crownMk:'silver',name:'east-wharf-silk-door'},
     {at:-1.2,w:2.0,h:2.55,door:true,crownMk:'silver',name:'east-wharf-main-door'}
    ],
    e:[{at:-3.3,w:1.75,h:2.4,door:true,crownMk:'silver',name:'east-wharf-crane-door'}],
    n:[{at:-8.0,w:1.15,h:1.4,y:1.1},{at:-1.2,w:1.15,h:1.4,y:1.1}]
   }
  });
  raTieredRoof(-4.0,yRoof,-3.3,16.6,10.4,3,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.64,tierRise:1.06
  });

  raTarget(-4.6,y1,6.4,'karst-wharf-apron',false);
  raTarget(-4.0,y1,2.7,'palm-tally-porch',true);
  raTarget(-4.0,y1,-3.3,'silk-amber-entrepot',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-10.2,y1,-5.8,PI/2],
   ['ria_glazed_amphora_rack',-10.2,y1,-1.8,PI/2],
   ['ria_tribute_chest',-6.4,y1,-6.2,0],
   ['ria_tribute_chest',-2.4,y1,-6.2,0],
   ['ria_hongsa_lectern',1.4,y1,-4.8,PI],
   ['ria_porphyry_table',-4.2,y1,-2.2,0],
   ['ria_lantern_stand',4.8,y1,.4,0]
  ]);
 }
});

/* 35. Highland Lodestone-Beacon Courier Relay and Mule Station (logistics / inn) */
defBuilding({
 key:'ra_east_pass_relay',
 name:'Highland Lodestone-Beacon Courier Relay and Mule Station',
 seed:7235,w:22,d:20,h:18.6,budget:98000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['infrastructure','inn'],role:'relay-post',job:'customs'},
 build(){
  const y1=.45,gh=3.7,yRoof=y1+gh;
  raFloorSlab(0,y1,0,19.2,16.8,{mk:'paving',th:.45});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.2);

  /* Compass-Hills Wayfinder Lodestone Obelisk on East Forecourt */
  raLodestoneObelisk(7.2,y1,6.6,6.4,{w:.64});

  raColonnade(-8.8,7.2,2.8,7.2,y1,gh,{style:'upper-ria',n:5,skipMid:1.4,mk:'dolomite',altMk:'porphyry',r:.21,taper:'minoan',block:false});
  raCeilingSlab(-3.0,yRoof-.1,5.6,12.2,3.0,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-9.0,-7.4,3.4,4.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-6.0,w:1.45,h:2.25,door:true,crownMk:'silver',name:'pass-relay-bunk-door'},
     {at:-1.2,w:1.75,h:2.4,door:true,crownMk:'silver',name:'pass-relay-office-door'}
    ],
    e:[{at:-1.7,w:1.5,h:2.25,door:true,open:true}],
    n:[{at:-5.8,w:1.15,h:1.45,y:1.05},{at:-1.2,w:1.15,h:1.45,y:1.05}]
   }
  });
  raTieredRoof(-2.8,yRoof,-1.7,12.8,11.8,2,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.6,tierRise:1.02
  });

  raWallRing(3.4,-5.2,8.8,4.0,y1,gh+2.6,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:6.1,w:1.5,h:2.3,door:true,crownMk:'silver',name:'pass-strongroom-door'}],
    e:[{at:-.6,w:1.1,h:1.45,y:4.2,pediment:true}]
   }
  });
  haloAt(6.1,y1+gh+3.4,-.6,0xffc454,true);
  raMondopSpireRoof(6.1,y1+gh+2.6,-.6,5.8,9.6,3,4.2,{
   style:'upper-ria',mk:'indigoslate',trimMk:'silver',soffitMk:'dolomite',neckMk:'porphyry',tierRise:.88
  });

  raTarget(-3.0,y1,5.6,'mule-hitching-porch',true);
  raTarget(-2.8,y1,-1.7,'pass-courier-hall',true);
  raTarget(6.1,y1,-.6,'charter-strongroom',true);

  raFurnList([
   ['ria_hongsa_lectern',-1.8,y1,-3.8,0],
   ['ria_teak_divan',-6.6,y1,-4.8,0],
   ['ria_porphyry_table',-4.8,y1,-.6,0],
   ['ria_tribute_chest',6.1,y1,-3.2,0],
   ['ria_lodestone_compass',7.0,y1,.8,-PI/2],
   ['ria_lantern_stand',0,y1,5.6,0]
  ]);
 }
});

/* 36. Ptolemaic-Pantheon Karst Spring Reservoir and Hongsa Nymphaeum (logistics / fountain) */
defBuilding({
 key:'ra_east_spring_castellum',
 name:'Ptolemaic-Pantheon Karst Spring Reservoir and Hongsa Nymphaeum',
 seed:7236,w:26,d:20,h:16.8,budget:104000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['infrastructure','fountain'],role:'cistern'},
 build(){
  const y1=.48,gh=4.2,yRoof=y1+gh;
  raFloorSlab(0,y1,0,22.8,16.8,{mk:'paving',th:.48});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.6);

  /* Rear 4-Bay Classical Dolomite & Porphyry Karst Aqueduct Arcade */
  raArcade(-11.0,-7.2,11.0,-7.2,y1,5.4,{style:'upper-ria',bays:4,mk:'dolomite',trimMk:'porphyry',pierW:.64});
  svNoWalk(()=>{
   box('porphyry',0,y1+5.41,-7.2,22.8,.62,1.35,P('porphyry'));
   box('water',0,y1+6.04,-7.2,22.4,.08,.85,P('water'));
  });

  raWallRing(-7.6,-5.4,7.6,1.4,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    e:[{at:-2.0,w:1.55,h:2.3,door:true,crownMk:'silver',name:'east-cistern-e-door'}],
    w:[{at:-2.0,w:1.55,h:2.3,door:true,crownMk:'silver',name:'east-cistern-w-door'}],
    s:[{at:-4.6,w:1.15,h:1.5,y:1.1,pediment:true},{at:4.6,w:1.15,h:1.5,y:1.1,pediment:true}]
   }
  });
  raCeilingSlab(0,yRoof+.02,-2.0,14.6,6.4,{mk:'dolomite',trimMk:'silver'});
  raPantheonRotundaDome(0,yRoof+.12,-2.0,3.8,6.4,{
   style:'upper-ria',drumMk:'dolomite',mk:'porphyry',soffitMk:'alabaster',vault:true
  });
  raFlatTerraceRoof(-5.8,yRoof,-2.0,3.6,6.8,{style:'upper-ria',mk:'dolomite',parapet:'balustrade',ceiling:false,skip:'e'});
  raFlatTerraceRoof(5.8,yRoof,-2.0,3.6,6.8,{style:'upper-ria',mk:'dolomite',parapet:'balustrade',ceiling:false,skip:'w'});

  /* Public Porphyry-and-Alabaster Spring Basin + Silver-Bronze Hongsa Spout */
  raWaterCourt(0,4.2,11.6,4.0,y1+.42,.48,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:5});
  raHongsaSculpt(0,y1+.48,1.85,0,1.05);
  raTopiaryUrn(-7.8,y1,5.2,.82,true);
  raTopiaryUrn(7.8,y1,5.2,.82,true);

  raTarget(0,y1,7.2,'hongsa-spring-plaza',false);
  raTarget(0,y1,-2.0,'karst-cistern-rotunda',true);

  raFurnList([
   ['ria_offering_basin',-3.8,y1,-2.0,0],
   ['ria_offering_basin',3.8,y1,-2.0,0],
   ['ria_lodestone_compass',0,y1,-3.4,0],
   ['ria_tribute_chest',5.6,y1,-3.8,-PI/2],
   ['ria_lantern_stand',-6.4,y1,6.8,0],
   ['ria_lantern_stand',6.4,y1,6.8,0]
  ]);
 }
});

/* 37. Battered Porphyry Caravan Toll-Gate and Bullion Assay House (logistics / civic) */
defBuilding({
 key:'ra_east_caravan_tollhouse',
 name:'Battered Porphyry Caravan Toll-Gate and Bullion Assay House',
 seed:7237,w:26,d:20,h:18.4,budget:108000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['infrastructure','civic'],role:'weigh-house',job:'customs'},
 build(){
  const y1=.35,gh=4.2,yRoof=y1+gh;
  raFloorSlab(0,y1,0,23.2,17.2,{mk:'paving',th:.35});
  raStripWalk([0,0,9.0],[0,y1,8.0],4.2);

  /* Drive-through Caravan Assay Passage [-2.6..2.6] flanked by Egyptian Cavetto Pylons + Silver/Bronze Steelyard! */
  for(const sz of [-5.4,5.4])for(const sx of [-3.0,3.0]){
   raBatteredPylon(sx,sz,1.5,1.5,y1,gh+1.0,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  }
  raCeilingSlab(0,yRoof+.4,0,5.2,10.6,{mk:'dolomite',trimMk:'silver'});
  raClassicalPediment(0,yRoof+.52,5.3,0,5.8,1.3,1.6,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});
  raSteelyardScale(0,yRoof+.35,0,0,true);

  for(const s of [-1,1]){
   const cx=s*7.1;
   raWallRing(cx-3.6,-5.8,cx+3.6,5.8,y1,gh,{
    style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
    holes:{
     s:[{at:cx,w:1.55,h:2.3,door:true,crownMk:'silver',name:s<0?'toll-assay-door':'toll-vault-door'}],
     w:s>0?[{at:0,w:1.5,h:2.25,door:true,open:true}]:[{at:0,w:1.2,h:1.5,y:1.05,pediment:true}],
     e:s<0?[{at:0,w:1.5,h:2.25,door:true,open:true}]:[{at:0,w:1.2,h:1.5,y:1.05,pediment:true}]
    }
   });
   raFlatTerraceRoof(cx,yRoof,0,7.4,11.8,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade'
   });
  }
  raTieredRoof(0,yRoof+.52,0,6.8,11.2,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
   over:.58,tierRise:1.02,ceiling:false,spire:true,spireH:3.6
  });

  raTarget(0,y1,0,'caravan-assay-passage',true);
  raTarget(-7.1,y1,0,'bullion-assay-office',true);
  raTarget(7.1,y1,0,'bonded-silk-vault',true);

  raFurnList([
   ['ria_hongsa_lectern',-7.1,y1,-2.6,0],
   ['ria_amber_seal_desk',-7.1,y1,1.8,PI],
   ['ria_lodestone_compass',-8.8,y1,-4.2,PI/2],
   ['ria_tribute_chest',8.6,y1,-3.6,-PI/2],
   ['ria_tribute_chest',8.6,y1,-.6,-PI/2],
   ['ria_glazed_amphora_rack',8.6,y1,2.8,-PI/2],
   ['ria_lantern_stand',-2.4,y1,6.8,0],
   ['ria_lantern_stand',2.4,y1,6.8,0]
  ]);
 }
});

/* 38. Buttressed Dolomite and Indigo-Slate Provisioning Magazine (logistics / warehousing) */
defBuilding({
 key:'ra_east_terrace_depot',
 name:'Buttressed Dolomite and Indigo-Slate Provisioning Magazine',
 seed:7238,w:28,d:18,h:15.8,budget:104000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['infrastructure'],role:'warehouse',job:'warehousing'},
 build(){
  const y1=.8,gh=3.95,yRoof=y1+gh;
  raPlinth(24.6,13.6,y1,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:4.4,stepRun:1.9,rail:'hongsa',railOpts:{scale:.68}
  });

  raColonnade(-11.2,5.8,11.2,5.8,y1,gh,{style:'upper-ria',n:7,skipMid:1.9,mk:'dolomite',altMk:'porphyry',r:.23,capital:'palm',block:false});
  raCeilingSlab(0,yRoof-.1,4.6,23.2,2.4,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-11.6,-6.2,11.6,3.4,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-7.4,w:1.85,h:2.45,door:true,crownMk:'silver',name:'depot-grain-bay'},
     {at:0,w:2.1,h:2.55,door:true,crownMk:'silver',name:'depot-central-bay'},
     {at:7.4,w:1.85,h:2.45,door:true,crownMk:'silver',name:'depot-silk-bay'}
    ],
    n:[{at:-7.4,w:1.1,h:.9,y:2.1},{at:0,w:1.1,h:.9,y:2.1},{at:7.4,w:1.1,h:.9,y:2.1}]
   }
  });
  /* Heavy Porphyry Ashlar Buttresses along rear & side walls (stepped +4 cm proud, svNoWalk) */
  svNoWalk(()=>{
   for(const bx of [-9.6,-3.8,3.8,9.6]){
    box('porphyry',bx,y1+.01,-6.52,.62,gh-.3,.48,P('porphyry'));
   }
  });

  for(const sx of [-7.8,7.8]){
   raFlatTerraceRoof(sx,yRoof,-1.4,7.6,9.8,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:sx<0?'e':'w'
   });
  }
  raCeilingSlab(0,yRoof+.02,-1.4,7.8,9.4,{mk:'cedar',trimMk:'silver'});
  raTieredRoof(0,yRoof+.32,-1.4,8.6,10.0,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'cedar',neckMk:'porphyry',
   over:.6,tierRise:1.04,ceiling:false
  });

  raTarget(0,y1,4.6,'depot-pack-dock',true);
  raTarget(-7.4,y1,-1.4,'west-grain-magazine',true);
  raTarget(0,y1,-1.4,'central-tally-magazine',true);
  raTarget(7.4,y1,-1.4,'east-amber-magazine',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-9.8,y1,-3.8,PI/2],
   ['ria_glazed_amphora_rack',-9.8,y1,0,PI/2],
   ['ria_glazed_amphora_rack',9.8,y1,-3.8,-PI/2],
   ['ria_glazed_amphora_rack',9.8,y1,0,-PI/2],
   ['ria_tribute_chest',-4.2,y1,-4.2,0],
   ['ria_tribute_chest',4.2,y1,-4.2,0],
   ['ria_hongsa_lectern',0,y1,-3.6,0],
   ['ria_lantern_stand',-3.6,y1,4.6,0],
   ['ria_lantern_stand',3.6,y1,4.6,0]
  ]);
 }
});
