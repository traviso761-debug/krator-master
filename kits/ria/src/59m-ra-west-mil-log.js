// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — MILITARY & LOGISTICS (29-38)
// Shared dock/weighing mechanics + 5 Lower Ria military fortifications + 5 Lower Ria river/road logistics & hydraulic works:
//   29. ra_west_curtain_bastion  — Walkable glazed-brick crenellated curtain-wall, gorge stair & crossbow bastion
//   30. ra_west_boom_arsenal     — Uktena river-chain capstan boom tower & vaulted war-barge naval arsenal
//   31. ra_west_siege_armoury    — Classical vaulted lamellar armoury, forge hearth & Pyatthat munition tower
//   32. ra_west_mule_castellum   — Fortified war-mule & river-scout garrison castellum with arched stalls
//   33. ra_west_strategion_keep  — Two-storey Ishtar-Prasat command strategion citadel & crenellated war-parapet
//   34. ra_west_crane_wharf      — Treadwheel river-quay cargo crane wharf & Classical bonded entrepot
//   35. ra_west_courier_mansio   — Royal Amber-Seal courier relay, hitching arcade & signal-lantern Pyatthat
//   36. ra_west_aqueduct_cistern — Roman-Babylonian 3-arch aqueduct castellum, reservoir & Uktena nymphaeum
//   37. ra_west_weigh_station    — Drive-through caravan steelyard weigh-arch & bonded customs tollhouse
//   38. ra_west_barge_commissary — Multi-bay vaulted grain, salt & amphora river commissary depot

/* Monumental River-Quay Cargo Crane (Treadwheel twin-jib shear-legs for Lower Ria; Stone-Counterweight slewing jib for Upper Ria). */
function raCargoCrane(x,y0,z,yaw,upper){
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   const pMk=upper?'porphyry':'cobalt',stMk=upper?'dolomite':'travertine',mMk=upper?'silver':'bronze';
   /* Heavy ashlar crane pedestal + slewing king-post */
   box(pMk,0,.01,0,2.6,.48,2.6,P(pMk));
   box(stMk,0,.49,0,2.2,.38,2.2,P(stMk));
   cyl('teak',0,.87,0,.28,4.6,P('teak'),10);
   if(upper){
    /* Upper Ria: Counterweight stone ballast box on rear boom + forward iron-bound cedar jib */
    beam('cedar',[0,4.8,-2.2],[0,6.6,3.8],.18,P('cedar'),false);
    beam('cedar',[0,3.2,0],[0,5.8,2.2],.14,P('cedar'),false);
    box('porphyry',0,4.2,-2.1,1.3,1.1,1.3,P('porphyry'));
    box(mMk,0,5.31,-2.1,1.38,.12,1.38,P(mMk));
   }else{
    /* Lower Ria: Twin-drum Roman treadwheel housing + raked teak shear-leg jib */
    for(const sx of [-.78,.78]){
     ring('teak',sx,2.55,-.4,1.35,.14,P('teak'),0,PI/2,0,16);
     for(let k=0;k<6;k++){
      const a=k/6*PI;
      beam('cedar',[sx,2.55+Math.cos(a)*1.3,-.4+Math.sin(a)*1.3],[sx,2.55-Math.cos(a)*1.3,-.4-Math.sin(a)*1.3],.05,P('cedar'));
     }
    }
    cyl('teak',0,2.55,-.4,.16,1.8,P('teak'),8,.16,false);
    beam('teak',[-.55,.95,.2],[0,6.6,3.8],.14,P('teak'),false);
    beam('teak',[.55,.95,.2],[0,6.6,3.8],.14,P('teak'),false);
   }
   /* Pulley sheave, hemp hoist cable (+z overhanging water/quay) & suspended bronze-bound cargo crate */
   cyl(mMk,0,6.55,3.8,.24,.14,P(mMk),10);
   cyl('rope',0,3.2,3.8,.035,3.35,P('rope'),6);
   box('crimson',0,2.35,3.8,1.1,.82,1.1,P('crimson'));
   box('gold',0,2.76,3.8,1.16,.08,1.16,P('gold'));
  });
  raWallBlock(0,0,0,2.4,3.8,2.4,0);
 });
}

/* Suspended Giant Bronze Steelyard Balance-Scale hung beneath a Caravan Weigh-Arch (svNoWalk). */
function raSteelyardScale(x,yHang,z,yaw,upper){
 W(x,0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   const mMk=upper?'silver':'gold';
   cyl('bronze',0,yHang-.75,0,.035,.75,P('bronze'),6);
   beam('bronze',[-1.65,yHang-.75,0],[1.65,yHang-.75,0],.055,P('bronze'),true,8);
   /* Sliding counterweight poise + suspended weighing pan */
   sph(mMk,-1.2,yHang-.95,0,.18,P(mMk),1,8);
   for(const sx of [.95,1.55])beam('rope',[1.25,yHang-.75,0],[sx,yHang-1.65,0],.02,P('rope'));
   cyl(mMk,1.25,yHang-1.72,0,.46,.07,P(mMk),12);
  });
 });
}

/* Heavy River-Chain Boom Capstan Winch (svNoWalk + raWallBlock). */
function raChainCapstan(x,y0,z,upper){
 svNoWalk(()=>{
  const pMk=upper?'porphyry':'cobalt',mMk=upper?'silver':'bronze';
  cyl(pMk,x,y0+.01,z,.95,.28,P(pMk),12);
  cyl(mMk,x,y0+.29,z,.48,1.05,P(mMk),12);
  cyl('gold',x,y0+1.34,z,.62,.16,P('gold'),12);
  for(let k=0;k<4;k++){
   const a=k*PI/2+.35;
   beam('teak',[x,y0+1.18,z],[x+Math.cos(a)*1.45,y0+1.18,z+Math.sin(a)*1.45],.055,P('teak'));
  }
 });
 raWallBlock(x,y0,z,1.7,1.6,1.7,0);
}

/* 29. Glazed-Brick Crenellated Curtain-Wall and Crossbow Bastion (military) */
defBuilding({
 key:'ra_west_curtain_bastion',
 name:'Glazed-Brick Crenellated Curtain-Wall and Crossbow Bastion',
 seed:7129,w:26,d:16,h:17.4,budget:98000,cut:true,
 front:{x:0,z:6.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['military'],role:'wall-bastion'},
 build(){
  const y1=.35,yRamp=4.2,twH=3.8;
  raFloorSlab(0,y1,0,23.6,13.2,{mk:'paving',th:.35});
  raStripWalk([0,0,7.1],[0,y1,5.9],3.2);

  /* Flanking Walkable Babylonian Glazed-Lapis Curtain Walls [-11.4..-3.8] & [3.8..11.4] at yRamp = 4.2 m */
  for(const s of [-1,1]){
   const wx=s*7.6;
   svNoWalk(()=>{
    box('cobalt',wx,y1+.01,-.6,7.6,yRamp-y1-.28,3.6,P('cobalt'));
    box('saffron',wx,yRamp-.27,-.6,7.72,.18,3.72,P('saffron'));
   });
   raFloorSlab(wx,yRamp,-.6,7.6,3.5,{mk:'paving',th:.1});
   raWallBlock(wx,y1,-.6,7.5,3.2,3.4,0);
   raMerlonParapet(wx-3.7,1.05,wx+3.7,1.05,yRamp,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:false});
   raMerlonParapet(wx+3.7,-2.25,wx-3.7,-2.25,yRamp,{mk:'cobalt',bandMk:'saffron',capMk:'gold',skipMid:s>0?1.35:0,block:false});
  }
  /* Rear stone gorge-stair ascending from y1 (z = -5.6) to East curtain-wall rampart yRamp (z = -2.35) */
  raGrandStair(7.6,y1,-5.8,7.6,yRamp,-2.35,2.2,{mk:'travertine',sideMk:'cobalt'});

  /* Projecting Central Battered Crossbow Bastion [-3.8..3.8, -4.4..3.6]: ground magazine + upper watch cupola */
  raWallRing(-3.8,-4.4,3.8,3.6,y1,yRamp-y1,{
   style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'saffron',postMk:'travertine',cornice:false,
   holes:{
    s:[{at:0,w:1.75,h:2.4,door:true,name:'bastion-sally-door'}],
    n:[{at:0,w:1.6,h:2.35,door:true,name:'bastion-gorge-door'}],
    e:[{at:-.4,w:.85,h:1.25,y:1.2}],
    w:[{at:-.4,w:.85,h:1.25,y:1.2}]
   }
  });
  raFloorSlab(0,yRamp,-.4,7.8,8.0,{mk:'mosaic',th:.16});
  raCeilingSlab(0,yRamp-.22,-.4,7.0,7.2,{mk:'teak',trimMk:'gold'});
  raMerlonParapet(-3.7,3.45,3.7,3.45,yRamp,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:false});

  /* Upper Bastion Crossbow Turret [-2.9..2.9, -3.4..2.2] opening onto both left & right curtain walls! */
  raWallRing(-2.9,-3.4,2.9,2.2,yRamp,twH,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
   holes:{
    e:[{at:-.6,w:1.45,h:2.2,door:true,open:true}],
    w:[{at:-.6,w:1.45,h:2.2,door:true,open:true}],
    s:[{at:0,w:1.15,h:1.45,y:1.0,pediment:true}],
    n:[{at:0,w:1.4,h:2.15,door:true,name:'bastion-rear-turret-door'}]
   }
  });
  raTieredRoof(0,yRamp+twH,-.6,6.2,6.0,2,{
   style:'lower-ria',mode:'hip',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.56,tierRise:.95,spire:true,spireH:3.2
  });
  raBanner(-6.8,yRamp,1.0,0,3.2,P('silkCrimson'),false);
  raBanner(6.8,yRamp,1.0,0,3.2,P('silkSaffron'),false);

  raTarget(0,y1,-.4,'bastion-lower-magazine',true);
  raTarget(0,yRamp,-.6,'bastion-command-turret',true);
  raTarget(-7.6,yRamp,-.6,'west-wall-walk',false);
  raTarget(7.6,yRamp,-.6,'east-wall-walk',false);

  raFurnList([
   ['ria_tribute_chest',-2.2,y1,-2.6,PI/2],
   ['ria_tribute_chest',2.2,y1,-2.6,-PI/2],
   ['ria_glazed_amphora_rack',-2.2,y1,.8,PI/2],
   ['ria_amber_seal_desk',0,yRamp,-1.8,0],
   ['ria_uktena_brazier',0,y1,4.8,0],
   ['ria_lantern_stand',2.2,y1,4.8,0]
  ]);
 }
});

/* 30. Uktena River-Chain Boom Tower and War-Barge Arsenal (military + infrastructure) */
defBuilding({
 key:'ra_west_boom_arsenal',
 name:'Uktena River-Chain Boom Tower and War-Barge Arsenal',
 seed:7130,w:28,d:22,h:19.6,budget:118000,cut:true,
 front:{x:-5.6,z:9.8,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['military','infrastructure'],role:'naval-arsenal',job:'shipwrighting'},
 build(){
  /* East War-Barge Wet-Slipway Canal [x = 4.6..11.8] + heavy bronze river-boom chain stretched across channel! */
  raWaterCourt(8.2,0,7.4,19.2,.3,.72,{style:'lower-ria',curbMk:'travertine',trimMk:'cobalt',lotus:2,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[8.2,.08,-9.0],[8.2,.08,0],[8.2,.08,9.0]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'boom-arsenal-slip',pts:wPts,width:6.4,speed:.35};
  }
  const y1=.6,gh=4.2,y2=y1+gh;
  raFloorSlab(-4.2,y1,0,17.2,18.8,{mk:'paving',th:.6});
  raFloorSlab(12.2,y1,0,1.8,18.8,{mk:'travertine',th:.6,walk:false});
  raFloorSlab(8.2,y1,-8.6,7.4,2.0,{mk:'travertine',th:.35,walk:false});
  raGrandStair(-5.6,0,10.0,-5.6,y1,8.8,3.2,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.72}});

  /* Heavy Bronze Boom-Chain spanning from Boom Winch-Tower (x = 2.4, z = 5.4) to East Anchor Bollard (x = 12.2, z = 5.4) */
  raChainCapstan(2.2,y1,5.4,false);
  svNoWalk(()=>{
   cyl('cobalt',12.2,y1+.01,5.4,.52,1.15,P('cobalt'),10);
   cyl('gold',12.2,y1+1.16,5.4,.58,.18,P('gold'),10);
   beam('bronze',[2.4,y1+.85,5.4],[7.3,y1+.38,5.4],.085,P('bronze'),true,8);
   beam('bronze',[7.3,y1+.38,5.4],[12.1,y1+.85,5.4],.085,P('bronze'),true,8);
   raNagaHead5(4.2,y1+.35,8.2,0,.9);
  });

  /* Boom-Chain Winch Bastion Tower [-.6..4.2, 2.2..7.8] + West Vaulted War-Galley Rigging & Oar Arsenal [-12.0..-.6, -8.2..6.8] */
  raWallRing(-12.0,-8.2,-.6,6.8,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:-6.3,w:2.1,h:2.65,door:true,name:'arsenal-south-gate'}],
    e:[{at:-1.2,w:1.8,h:2.45,door:true,name:'arsenal-quay-door'}],
    n:[{at:-6.3,w:1.35,h:1.6,y:1.05,pediment:true}],
    w:[{at:-1.0,w:1.35,h:1.6,y:1.05,pediment:true}]
   }
  });
  raTieredRoof(-6.3,y2,-.7,11.8,15.4,3,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'cobalt',
   over:.64,tierRise:1.08
  });

  /* Two-Storey Glazed-Lapis Boom Watchtower [x = -.6..4.0, z = -5.6..1.6] */
  raWallRing(-.6,-5.6,4.0,1.6,y1,gh+2.8,{
   style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'saffron',postMk:'emerald',
   holes:{
    s:[{at:1.7,w:1.5,h:2.3,door:true,name:'boom-tower-door'}],
    e:[{at:-2.0,w:1.1,h:1.5,y:4.4,pediment:true}]
   }
  });
  raCeilingSlab(1.7,y1+gh+2.82,-2.0,4.2,6.8,{mk:'teak',trimMk:'gold'});
  raPrasatSpire(1.7,y1+gh+2.9,-2.0,4.2,6.4,{style:'lower-ria',mk:'gold',accMk:'emerald',vault:true});

  raTarget(1.7,y1,7.2,'boom-winch-quay',false);
  raTarget(-6.3,y1,-.7,'war-barge-oar-hall',true);
  raTarget(1.7,y1,-2.0,'chain-guard-chamber',true);

  raFurnList([
   ['ria_porphyry_table',-6.3,y1,-2.4,0],
   ['ria_tribute_chest',-10.2,y1,-5.8,PI/2],
   ['ria_tribute_chest',-10.2,y1,-2.8,PI/2],
   ['ria_glazed_amphora_rack',-2.4,y1,-5.8,-PI/2],
   ['ria_amber_seal_desk',1.7,y1,-3.6,0],
   ['ria_uktena_brazier',-6.3,y1,3.2,0],
   ['ria_lantern_stand',2.2,y1,7.6,0]
  ]);
 }
});

/* 31. Classical Vaulted Lamellar Armoury and Torsion-Engine Hall (military + industry) */
defBuilding({
 key:'ra_west_siege_armoury',
 name:'Classical Vaulted Lamellar Armoury and Torsion-Engine Hall',
 seed:7131,w:24,d:20,h:17.2,budget:106000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['military','industry'],role:'armoury',job:'smithing'},
 build(){
  const y1=.52,gh=4.1,yRoof=y1+gh;
  raPlinth(20.6,16.2,y1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'brick',capMk:'travertine',topMk:'paving',
   stepW:3.6,stepRun:1.4,rail:'naga',railOpts:{scale:.68}
  });

  /* Rusticated Classical 4-bay travertine artillery porch + armourer's hearth flue */
  raArcade(-9.4,7.2,9.4,7.2,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.56});
  raCeilingSlab(0,yRoof-.12,5.6,19.4,2.8,{mk:'teak',trimMk:'gold'});

  raWallRing(-9.6,-7.2,9.6,4.2,y1,gh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
   holes:{
    s:[
     {at:-5.4,w:1.6,h:2.35,door:true,name:'armoury-west-door'},
     {at:0,w:2.2,h:2.65,door:true,name:'armoury-engine-gate'},
     {at:5.4,w:1.6,h:2.35,door:true,name:'armoury-east-door'}
    ],
    n:[{at:-5.2,w:1.15,h:1.45,y:1.1},{at:5.2,w:1.15,h:1.45,y:1.1}],
    w:[{at:-1.5,w:1.2,h:1.5,y:1.1,pediment:true}]
   }
  });

  /* East Armouring Forge Hearth + Brick Chimney Flue (smokeAt + haloAt) */
  svNoWalk(()=>{
   box('brick',7.6,y1+.01,-4.4,2.8,2.4,2.4,P('brick'));
   box('glow',6.14,y1+.45,-4.4,.12,.72,.88,P('flame'));
   cyl('cobalt',7.6,yRoof+.4,-4.4,.52,2.8,P('cobalt'),10);
  });
  raWallBlock(7.6,y1,-4.4,2.8,3.2,2.4,0);
  smokeAt(7.6,yRoof+3.3,-4.4,{r:.26,kind:'fire'});
  haloAt(6.0,y1+.8,-4.4,0xff9436,true);

  /* Flat Babylonian Merlon Parapet Vaults on flanks + Central 3-Tier Pyatthat Munition Tower */
  for(const sx of [-6.6,6.6]){
   raFlatTerraceRoof(sx,yRoof,-1.5,6.2,11.6,{
    style:'lower-ria',mk:'cobalt',topMk:'paving',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:sx<0?'e':'w'
   });
  }
  raTieredRoof(0,yRoof+.18,-1.5,7.4,11.8,3,{
   style:'lower-ria',mode:'hip',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.62,tierRise:.98,spire:true,spireH:3.6
  });

  raTarget(0,y1,5.6,'armoury-engine-loggia',true);
  raTarget(0,y1,-1.5,'lamellar-armoury-hall',true);
  raTarget(-6.4,y1,-1.5,'shield-and-lance-vault',true);

  raFurnList([
   ['ria_porphyry_table',0,y1,-2.2,0],
   ['ria_tribute_chest',-7.6,y1,-4.8,PI/2],
   ['ria_tribute_chest',-7.6,y1,-1.6,PI/2],
   ['ria_glazed_amphora_rack',-7.6,y1,1.6,PI/2],
   ['ria_amber_seal_desk',-3.4,y1,-4.8,0],
   ['ria_uktena_brazier',-3.6,y1,5.6,0],
   ['ria_uktena_brazier',3.6,y1,5.6,0]
  ]);
 }
});

/* 32. Fortified War-Mule and River-Scout Castellum (military) */
defBuilding({
 key:'ra_west_mule_castellum',
 name:'Fortified War-Mule and River-Scout Castellum',
 seed:7132,w:26,d:22,h:15.6,budget:108000,cut:true,
 front:{x:0,z:9.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['military'],role:'cavalry-fort',job:'herding'},
 build(){
  const y1=.38,gh=3.65,yRoof=y1+gh;
  raFloorSlab(0,y1,0,23.2,18.8,{mk:'paving',th:.38});
  raStripWalk([0,0,10.0],[0,y1,8.8],3.4);

  /* Twin Battered Glazed-Brick Gate Turrets + Paddock Watering Trough */
  raBatteredPylon(-9.8,7.8,2.4,2.4,y1,4.8,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  raBatteredPylon(9.8,7.8,2.4,2.4,y1,4.8,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  raMerlonParapet(-8.2,8.4,-2.2,8.4,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(2.2,8.4,8.2,8.4,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raWaterCourt(-5.4,4.4,5.2,2.4,y1+.34,.38,{style:'lower-ria',curbMk:'travertine',trimMk:'cobalt',lotus:0});

  /* West Arched War-Mule Stable Loggia [-11.0..-6.4, -7.8..1.2] + Rear Scout Captain's Hall [-6.0..11.0, -8.2..-1.2] */
  raArcade(-6.4,1.0,-6.4,-7.6,y1,gh-.3,{style:'lower-ria',bays:3,mk:'brick',trimMk:'travertine',pierW:.48});
  raWall(-11.0,-7.8,-11.0,1.2,y1,gh-.3,{style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron'});
  raWall(-6.4,-7.8,-11.0,-7.8,y1,gh-.3,{style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron'});
  raFlatTerraceRoof(-8.7,y1+gh-.3,-3.3,4.8,9.2,{
   style:'lower-ria',mk:'brick',topMk:'paving',soffitMk:'cedar',trimMk:'saffron',parapet:'merlon',parMk:'cobalt',skip:'e'
  });

  raWallRing(-5.8,-8.2,10.8,-1.0,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-1.8,w:1.6,h:2.35,door:true,name:'castellum-mess-door'},
     {at:2.8,w:1.25,h:1.55,y:1.0,pediment:true},
     {at:6.8,w:1.6,h:2.35,door:true,name:'castellum-captain-door'}
    ],
    n:[{at:0,w:1.25,h:1.5,y:1.05},{at:6.4,w:1.25,h:1.5,y:1.05}],
    e:[{at:-4.6,w:1.25,h:1.5,y:1.05}]
   }
  });
  raTieredRoof(2.5,yRoof,-4.6,17.0,7.8,2,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.62,tierRise:1.05
  });

  raTarget(2.0,y1,4.2,'castellum-muster-yard',false);
  raTarget(-8.7,y1,-3.3,'arched-mule-stalls',true);
  raTarget(2.5,y1,-4.6,'scout-garrison-hall',true);

  raFurnList([
   ['ria_porphyry_table',.4,y1,-4.8,0],
   ['ria_teak_divan',8.2,y1,-6.2,0],
   ['ria_amber_seal_desk',5.2,y1,-3.4,PI],
   ['ria_tribute_chest',-3.8,y1,-6.4,PI/2],
   ['ria_glazed_amphora_rack',-9.6,y1,-5.4,PI/2],
   ['ria_lantern_stand',2.8,y1,1.6,0]
  ]);
 }
});

/* 33. Two-Storey Ishtar-Prasat Command Strategion Citadel (military + civic) */
defBuilding({
 key:'ra_west_strategion_keep',
 name:'Two-Storey Ishtar-Prasat Command Strategion Citadel',
 seed:7133,w:28,d:24,h:23.6,budget:130000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['military','civic'],role:'citadel'},
 build(){
  const y1=1.35,gh=4.2,y2=y1+gh,uh=3.8,yRoof=y2+uh;
  raPlinth(23.6,18.4,y1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'paving',
   stepW:3.8,stepRun:2.8,rail:'naga',railOpts:{scale:.88}
  });

  /* Four battered glazed-lapis corner fortress bastions + Central Babylonian Ishtar Keep Portal */
  for(const sx of [-10.4,10.4])for(const sz of [-7.6,6.8]){
   raBatteredPylon(sx,sz,2.8,2.8,y1,gh+1.4,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }
  raIshtarPortal(0,y1,7.2,0,2.4,2.85,{buttW:1.25,d:1.05,hTot:4.9,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});

  raWallRing(-9.8,-7.8,9.8,6.6,y1,gh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
   holes:{
    s:[
     {at:-5.8,w:1.1,h:1.45,y:1.15},
     {at:0,w:2.2,h:2.7,door:true,name:'strategion-main-gate'},
     {at:5.8,w:1.1,h:1.45,y:1.15}
    ],
    n:[{at:-5.4,w:1.1,h:1.45,y:1.15},{at:0,w:1.55,h:2.35,door:true,name:'strategion-postern'},{at:5.4,w:1.1,h:1.45,y:1.15}],
    e:[{at:-.6,w:1.15,h:1.5,y:1.15,pediment:true}],
    w:[{at:-.6,w:1.15,h:1.5,y:1.15,pediment:true}]
   }
  });

  const st=svStair(7.2,-5.8,y1,y2,0,{w:1.3,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-.6,19.2,14.0,{mk:'mosaic',th:.2,hole:st});
  raCeilingSlab(-1.8,y2-.24,-.6,14.6,13.4,{mk:'teak',trimMk:'gold'});

  /* Walkable Crenellated Perimeter War-Parapet on y2 surrounding Central Upper War-Council Chamber [-6.8..6.8, -5.2..4.0] */
  raMerlonParapet(-9.4,6.2,9.4,6.2,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(9.4,-7.4,-9.4,-7.4,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(9.4,5.9,9.4,-7.1,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(-9.4,-7.1,-9.4,5.9,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});

  raWallRing(-6.6,-5.2,6.6,4.0,y2,uh,{
   style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'gold',postMk:'travertine',
   holes:{
    s:[{at:-3.4,w:1.15,h:1.5,y:1.0,pediment:true},{at:0,w:1.75,h:2.35,door:true,name:'war-council-south-door'},{at:3.4,w:1.15,h:1.5,y:1.0,pediment:true}],
    e:[{at:-.6,w:1.5,h:2.25,door:true,name:'war-council-east-door'}],
    w:[{at:-.6,w:1.5,h:2.25,door:true,name:'war-council-west-door'}]
   }
  });
  raTieredRoof(0,yRoof,-.6,13.8,9.8,4,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.68,tierRise:1.06,spire:true,spireH:4.8
  });

  raTarget(0,y1,-.6,'strategion-guard-hall',true);
  raTarget(0,y2,-.6,'upper-war-council-room',true);
  raTarget(0,y2,5.1,'crenellated-front-rampart',false);

  raFurnList([
   ['ria_porphyry_table',-1.8,y1,-2.2,0],
   ['ria_tribute_chest',-7.4,y1,-5.4,PI/2],
   ['ria_tribute_chest',-7.4,y1,2.4,PI/2],
   ['ria_uktena_brazier',-3.2,y1,3.2,0],
   ['ria_uktena_brazier',3.2,y1,3.2,0],
   ['ria_sovereign_throne',0,y2,-3.2,0],
   ['ria_amber_seal_desk',-3.4,y2,0,PI/2],
   ['ria_silk_screen',-2.6,y2,-3.4,.2],
   ['ria_silk_screen',2.6,y2,-3.4,-.2]
  ]);
 }
});

/* 34. Treadwheel River-Quay Crane Wharf and Bonded Entrepot (logistics / warehousing) */
defBuilding({
 key:'ra_west_crane_wharf',
 name:'Treadwheel River-Quay Crane Wharf and Bonded Entrepot',
 seed:7134,w:28,d:22,h:16.8,budget:112000,cut:true,
 front:{x:-4.6,z:9.8,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure','market'],role:'crane-wharf',job:'warehousing'},
 build(){
  /* Front East Mooring Basin [x = 4.2..12.6, z = 2.4..9.4] + Monumental Treadwheel Cargo Crane overhanging the barge berth! */
  raWaterCourt(8.4,5.9,8.4,7.0,.32,.68,{style:'lower-ria',curbMk:'travertine',trimMk:'cobalt',lotus:2,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[4.6,.08,5.9],[8.4,.08,5.9],[12.2,.08,5.9]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'crane-wharf-berth',pts:wPts,width:6.0,speed:.28};
  }

  const y1=.62,gh=4.0,yRoof=y1+gh;
  raFloorSlab(-4.4,y1,1.2,16.8,16.4,{mk:'paving',th:.62});
  raFloorSlab(8.4,y1,-3.8,8.8,10.8,{mk:'paving',th:.62});
  raGrandStair(-4.6,0,9.9,-4.6,y1,8.7,3.4,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.7}});

  /* Treadwheel River-Quay Cargo Crane slewed toward the mooring basin (+z) */
  raCargoCrane(8.4,y1,.4,0,false);

  /* Classical Travertine Bonded Tally Arcade + Multi-Bay Glazed-Brick & Celadon Entrepot [-12.0..4.0, -8.2..1.6] */
  raArcade(-11.6,3.8,3.6,3.8,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raCeilingSlab(-4.0,yRoof-.12,2.7,15.8,2.2,{mk:'teak',trimMk:'gold'});

  raWallRing(-12.0,-8.2,4.0,1.6,y1,gh,{
   style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-8.2,w:1.75,h:2.4,door:true,name:'wharf-west-bay-door'},
     {at:-1.2,w:2.0,h:2.55,door:true,name:'wharf-main-cargo-door'}
    ],
    e:[{at:-3.3,w:1.75,h:2.4,door:true,name:'wharf-crane-door'}],
    n:[{at:-8.0,w:1.15,h:1.4,y:1.1},{at:-1.2,w:1.15,h:1.4,y:1.1}]
   }
  });
  raTieredRoof(-4.0,yRoof,-3.3,16.6,10.4,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'cobalt',
   over:.64,tierRise:1.04
  });

  raTarget(-4.6,y1,6.4,'wharf-customs-apron',false);
  raTarget(-4.0,y1,2.7,'tally-arcade',true);
  raTarget(-4.0,y1,-3.3,'bonded-entrepot-vault',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-10.2,y1,-5.8,PI/2],
   ['ria_glazed_amphora_rack',-10.2,y1,-1.8,PI/2],
   ['ria_tribute_chest',-6.4,y1,-6.2,0],
   ['ria_tribute_chest',-2.4,y1,-6.2,0],
   ['ria_amber_seal_desk',1.4,y1,-4.8,PI],
   ['ria_porphyry_table',-4.2,y1,-2.2,0],
   ['ria_lantern_stand',4.8,y1,.4,0]
  ]);
 }
});

/* 35. Royal Amber-Seal Courier Relay and Dispatch Mansio (logistics / inn) */
defBuilding({
 key:'ra_west_courier_mansio',
 name:'Royal Amber-Seal Courier Relay and Dispatch Mansio',
 seed:7135,w:22,d:20,h:18.2,budget:98000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure','inn'],role:'relay-post',job:'customs'},
 build(){
  const y1=.42,gh=3.7,yRoof=y1+gh;
  raFloorSlab(0,y1,0,19.2,16.8,{mk:'paving',th:.42});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.2);

  /* Front Classical Hitching Arcade + Signal-Lantern Pyatthat Dispatch Tower on East Corner! */
  raColonnade(-8.8,7.2,2.8,7.2,y1,gh,{style:'lower-ria',n:5,skipMid:1.4,mk:'travertine',friezeMk:'cobalt',r:.21,block:false});
  raCeilingSlab(-3.0,yRoof-.1,5.6,12.2,3.0,{mk:'teak',trimMk:'gold'});

  raWallRing(-9.0,-7.4,3.4,4.0,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-6.0,w:1.45,h:2.25,door:true,name:'mansio-bunk-door'},
     {at:-1.2,w:1.75,h:2.4,door:true,name:'mansio-dispatch-door'}
    ],
    e:[{at:-1.7,w:1.5,h:2.25,door:true,open:true}],
    n:[{at:-5.8,w:1.15,h:1.45,y:1.05},{at:-1.2,w:1.15,h:1.45,y:1.05}]
   }
  });
  raTieredRoof(-2.8,yRoof,-1.7,12.8,11.8,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.6,tierRise:1.0
  });

  /* East Signal-Lantern & Tablet Strongroom Tower [3.4..8.8, -5.2..4.0] */
  raWallRing(3.4,-5.2,8.8,4.0,y1,gh+2.6,{
   style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'gold',postMk:'travertine',
   holes:{
    s:[{at:6.1,w:1.5,h:2.3,door:true,name:'dispatch-strongroom-door'}],
    e:[{at:-.6,w:1.1,h:1.45,y:4.2,pediment:true}]
   }
  });
  haloAt(6.1,y1+gh+3.4,-.6,0xffc454,true);
  raMondopSpireRoof(6.1,y1+gh+2.6,-.6,5.8,9.6,3,4.2,{
   style:'lower-ria',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'emerald',tierRise:.88
  });

  raTarget(-3.0,y1,5.6,'courier-hitching-loggia',true);
  raTarget(-2.8,y1,-1.7,'relay-dispatch-hall',true);
  raTarget(6.1,y1,-.6,'sealed-tablet-strongroom',true);

  raFurnList([
   ['ria_amber_seal_desk',-1.8,y1,-3.8,0],
   ['ria_teak_divan',-6.6,y1,-4.8,0],
   ['ria_porphyry_table',-4.8,y1,-.6,0],
   ['ria_tribute_chest',6.1,y1,-3.2,0],
   ['ria_tribute_chest',7.2,y1,.8,-PI/2],
   ['ria_lantern_stand',0,y1,5.6,0]
  ]);
 }
});

/* 36. Roman-Babylonian Arched Aqueduct Castellum and Public Nymphaeum (logistics / fountain) */
defBuilding({
 key:'ra_west_aqueduct_cistern',
 name:'Roman-Babylonian Arched Aqueduct Castellum and Public Nymphaeum',
 seed:7136,w:26,d:20,h:16.4,budget:104000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['infrastructure','fountain'],role:'cistern'},
 build(){
  const y1=.45,gh=4.2,yRoof=y1+gh;
  raFloorSlab(0,y1,0,22.8,16.8,{mk:'paving',th:.45});
  raStripWalk([0,0,9.0],[0,y1,7.8],3.6);

  /* Rear Elevated 3-Bay Classical Roman Stone Aqueduct Specus Channel [-11.2..11.2, z = -7.2] */
  raArcade(-11.0,-7.2,11.0,-7.2,y1,5.4,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.64});
  svNoWalk(()=>{
   box('cobalt',0,y1+5.41,-7.2,22.8,.62,1.35,P('cobalt'));
   box('water',0,y1+6.04,-7.2,22.4,.08,.85,P('water'));
  });

  /* Central Settling Cistern Hall [-7.6..7.6, -5.4..1.4] + Stepped Pantheon Dome & Uktena Naga Spout Nymphaeum! */
  raWallRing(-7.6,-5.4,7.6,1.4,y1,gh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',postMk:'cobalt',
   holes:{
    e:[{at:-2.0,w:1.55,h:2.3,door:true,name:'cistern-valve-east-door'}],
    w:[{at:-2.0,w:1.55,h:2.3,door:true,name:'cistern-valve-west-door'}],
    s:[{at:-4.6,w:1.15,h:1.5,y:1.1,pediment:true},{at:4.6,w:1.15,h:1.5,y:1.1,pediment:true}]
   }
  });
  raCeilingSlab(0,yRoof+.02,-2.0,14.6,6.4,{mk:'travertine',trimMk:'gold'});
  raPantheonRotundaDome(0,yRoof+.12,-2.0,3.8,6.2,{
   style:'lower-ria',drumMk:'travertine',mk:'emerald',soffitMk:'travertine',vault:true
  });
  raFlatTerraceRoof(-5.8,yRoof,-2.0,3.6,6.8,{style:'lower-ria',mk:'travertine',parapet:'balustrade',ceiling:false,skip:'e'});
  raFlatTerraceRoof(5.8,yRoof,-2.0,3.6,6.8,{style:'lower-ria',mk:'travertine',parapet:'balustrade',ceiling:false,skip:'w'});

  /* Public Glazed-Lapis & Uktena Naga Fountain Basin on South Plaza [z = 2.0..6.4] */
  raWaterCourt(0,4.2,11.6,4.0,y1+.42,.48,{style:'lower-ria',curbMk:'travertine',trimMk:'emerald',lotus:6});
  raNagaHead5(0,y1+.55,1.85,0,1.05);
  raTopiaryUrn(-7.8,y1,5.2,.82,false);
  raTopiaryUrn(7.8,y1,5.2,.82,false);

  raTarget(0,y1,7.2,'nymphaeum-fountain-plaza',false);
  raTarget(0,y1,-2.0,'aqueduct-settling-chamber',true);

  raFurnList([
   ['ria_offering_basin',-3.8,y1,-2.0,0],
   ['ria_offering_basin',3.8,y1,-2.0,0],
   ['ria_lodestone_compass',0,y1,-3.4,0],
   ['ria_tribute_chest',-5.6,y1,-3.8,PI/2],
   ['ria_lantern_stand',-6.4,y1,6.8,0],
   ['ria_lantern_stand',6.4,y1,6.8,0]
  ]);
 }
});

/* 37. Drive-Through Caravan Steelyard Weigh-Arch and Toll Customhouse (logistics / civic) */
defBuilding({
 key:'ra_west_weigh_station',
 name:'Drive-Through Caravan Steelyard Weigh-Arch and Toll Customhouse',
 seed:7137,w:26,d:20,h:18.0,budget:108000,cut:true,
 front:{x:0,z:8.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure','civic'],role:'weigh-house',job:'customs'},
 build(){
  const y1=.32,gh=4.2,yRoof=y1+gh;
  raFloorSlab(0,y1,0,23.2,17.2,{mk:'paving',th:.32});
  raStripWalk([0,0,9.0],[0,y1,8.0],4.2);

  /* Central Paved Drive-Through Caravan Weigh-Passage [-2.6..2.6] spanned by Twin Ishtar Portals + Giant Bronze Steelyard! */
  raIshtarPortal(0,y1,5.6,0,4.2,3.6,{buttW:1.2,d:1.0,hTot:5.4,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raIshtarPortal(0,y1,-5.6,PI,4.2,3.6,{buttW:1.2,d:1.0,hTot:5.4,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raCeilingSlab(0,yRoof+.4,0,5.2,10.6,{mk:'teak',trimMk:'gold'});
  raSteelyardScale(0,yRoof+.35,0,0,false);

  /* Flanking West Assay Office & East Bonded Bullion/Bale Vault [-10.8..-3.4] & [3.4..10.8, -5.8..5.8] */
  for(const s of [-1,1]){
   const cx=s*7.1;
   raWallRing(cx-3.6,-5.8,cx+3.6,5.8,y1,gh,{
    style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
    holes:{
     s:[{at:cx,w:1.55,h:2.3,door:true,name:s<0?'weigh-west-office-door':'weigh-east-vault-door'}],
     w:s>0?[{at:0,w:1.5,h:2.25,door:true,open:true}]:[{at:0,w:1.2,h:1.5,y:1.05,pediment:true}],
     e:s<0?[{at:0,w:1.5,h:2.25,door:true,open:true}]:[{at:0,w:1.2,h:1.5,y:1.05,pediment:true}]
    }
   });
   raFlatTerraceRoof(cx,yRoof,0,7.4,11.8,{
    style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
   });
  }
  raTieredRoof(0,yRoof+.52,0,6.8,11.2,3,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.58,tierRise:1.0,ceiling:false,spire:true,spireH:3.4
  });

  raTarget(0,y1,0,'steelyard-weigh-passage',true);
  raTarget(-7.1,y1,0,'customs-assay-office',true);
  raTarget(7.1,y1,0,'bonded-bale-strongroom',true);

  raFurnList([
   ['ria_amber_seal_desk',-7.1,y1,-2.6,0],
   ['ria_amber_seal_desk',-7.1,y1,1.8,PI],
   ['ria_tribute_chest',-8.8,y1,-4.2,PI/2],
   ['ria_tribute_chest',8.6,y1,-3.6,-PI/2],
   ['ria_tribute_chest',8.6,y1,-.6,-PI/2],
   ['ria_glazed_amphora_rack',8.6,y1,2.8,-PI/2],
   ['ria_lantern_stand',-2.4,y1,6.8,0],
   ['ria_lantern_stand',2.4,y1,6.8,0]
  ]);
 }
});

/* 38. Multi-Bay Vaulted Grain, Salt and Amphora River Commissary Depot (logistics / warehousing) */
defBuilding({
 key:'ra_west_barge_commissary',
 name:'Multi-Bay Vaulted Grain, Salt and Amphora River Commissary Depot',
 seed:7138,w:28,d:18,h:15.4,budget:104000,cut:true,
 front:{x:0,z:7.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure'],role:'warehouse',job:'warehousing'},
 build(){
  const y1=.78,gh=3.9,yRoof=y1+gh;
  /* Raised flood-proof brick & travertine cargo loading platform + wide loading ramp */
  raPlinth(24.6,13.6,y1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'brick',capMk:'travertine',topMk:'paving',
   stepW:4.4,stepRun:1.9,rail:'naga',railOpts:{scale:.68}
  });

  /* Full-width 6-bay Classical loading dock colonnade */
  raColonnade(-11.2,5.8,11.2,5.8,y1,gh,{style:'lower-ria',n:7,skipMid:1.9,mk:'travertine',friezeMk:'cobalt',r:.23,block:false});
  raCeilingSlab(0,yRoof-.1,4.6,23.2,2.4,{mk:'teak',trimMk:'gold'});

  raWallRing(-11.6,-6.2,11.6,3.4,y1,gh,{
   style:'lower-ria',mk:'brick',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-7.4,w:1.85,h:2.45,door:true,name:'commissary-grain-bay'},
     {at:0,w:2.1,h:2.55,door:true,name:'commissary-central-bay'},
     {at:7.4,w:1.85,h:2.45,door:true,name:'commissary-amphora-bay'}
    ],
    n:[{at:-7.4,w:1.1,h:.9,y:2.1},{at:0,w:1.1,h:.9,y:2.1},{at:7.4,w:1.1,h:.9,y:2.1}]
   }
  });

  /* Triple Ventilated Clerestory Roof: Two Terracotta Side Gables + Elevated Central Celadon Commissary Crown */
  for(const sx of [-7.8,7.8]){
   raTieredRoof(sx,yRoof,-1.4,7.6,9.8,2,{
    style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'gold',soffitMk:'cedar',neckMk:'brick',
    over:.52,tierRise:.92
   });
  }
  raCeilingSlab(0,yRoof+.02,-1.4,7.8,9.4,{mk:'cedar',trimMk:'gold'});
  raTieredRoof(0,yRoof+.32,-1.4,8.2,10.0,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'cedar',neckMk:'cobalt',
   over:.58,tierRise:1.02,ceiling:false
  });

  raTarget(0,y1,4.6,'commissary-loading-dock',true);
  raTarget(-7.4,y1,-1.4,'west-grain-bay',true);
  raTarget(0,y1,-1.4,'central-tally-bay',true);
  raTarget(7.4,y1,-1.4,'east-amphora-bay',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-9.8,y1,-3.8,PI/2],
   ['ria_glazed_amphora_rack',-9.8,y1,0,PI/2],
   ['ria_glazed_amphora_rack',9.8,y1,-3.8,-PI/2],
   ['ria_glazed_amphora_rack',9.8,y1,0,-PI/2],
   ['ria_tribute_chest',-4.2,y1,-4.2,0],
   ['ria_tribute_chest',4.2,y1,-4.2,0],
   ['ria_amber_seal_desk',0,y1,-3.6,0],
   ['ria_lantern_stand',-3.6,y1,4.6,0],
   ['ria_lantern_stand',3.6,y1,4.6,0]
  ]);
 }
});
