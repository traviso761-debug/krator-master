// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — FOUNDRY, ATELIER, PRESS, GRANARY & COTTAGE (14-18)
// 50/50 Balanced Fusion Grammar:
//   14. ra_east_zinc_foundry  — Porphyry ashlar brass & compass furnace hall (zinc = 90) + copper-and-slate clerestory hood
//   15. ra_east_stone_atelier — Egyptian palm-column lapidary stoa + alabaster & porphyry carving court + Lanna studio
//   16. ra_east_saffron_press — Stepped dolomite terrace press-house + Minoan columned drying loggia + Lanna spice-loft gable
//   17. ra_east_cliff_granary — Battered red-porphyry & dolomite cavetto storehouse + raised cedar & indigo-slate ventilated roof
//   18. ra_east_karst_cottage — Dressed dolomite & porphyry ashlar ground room + flat Minoan stone porch + Shan-Lanna slate gable

/* 14. Porphyry Ashlar Brass-Foundry and Copper Clerestory Smithy */
defBuilding({
 key:'ra_east_zinc_foundry',
 name:'Porphyry Ashlar Brass-Foundry and Copper Clerestory Smithy',
 seed:7214,w:20,d:18,h:15.2,budget:94000,cut:true,
 front:{x:-2.2,z:7.9,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['industry','shop'],role:'foundry',job:'smithing'},
 build(){
  const y1=.42,gh=3.75,yRoof=y1+gh;
  raFloorSlab(0,y1,0,17.8,15.0,{mk:'paving',th:.42});
  raStripWalk([-2.2,0,8.1],[-2.2,y1,6.8],3.0);

  /* Front Classical Dolomite & Porphyry Round-Arch Casting Loggia [-8.2..2.0, 2.4..6.8] */
  raArcade(-8.0,6.6,1.8,6.6,y1,gh,{style:'upper-ria',bays:3,mk:'dolomite',trimMk:'porphyry',pierW:.5});
  raFlatTerraceRoof(-3.1,yRoof,4.6,10.2,4.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'n'
  });

  /* East Twin Porphyry & Bronze Zinc-Brass Smelting Furnaces + Patinated Copper Flues (zinc = 90) */
  for(const fz of [3.2,5.6]){
   const fx=5.6;
   svNoWalk(()=>{
    box('porphyry',fx,y1+.01,fz,3.6,2.3,1.8,P('porphyry'));
    box('dolomite',fx,y1+2.31,fz,3.74,.2,1.94,P('dolomite'));
    cyl('copper',fx,y1+2.51,fz,.54,3.6,P('copper'),12);
    cyl('bronze',fx,y1+6.11,fz,.62,.22,P('bronze'),12);
    box('glow',fx-1.86,y1+.48,fz,.14,.74,.86,P('flame'));
   });
   raWallBlock(fx,y1,fz,3.6,3.4,1.8,0);
   smokeAt(fx,y1+6.45,fz,{r:.3,kind:'fire'});
  }
  haloAt(3.55,y1+.85,4.4,0xff9636,true);

  /* Rear Brass & Compass Instrument Foundry Hall [-8.2..8.2, -6.8..2.2] + 2-Tier Copper & Indigo-Slate Clerestory Hood */
  raWallRing(-8.2,-6.8,8.2,2.2,y1,gh,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:-2.8,w:1.85,h:2.35,door:true,crownMk:'silver',name:'foundry-hall-door'},{at:4.6,w:1.1,h:1.4,y:1.05}],
    n:[{at:-4.6,w:1.15,h:1.4,y:1.05},{at:0,w:1.3,h:1.5,y:1.05},{at:4.6,w:1.15,h:1.4,y:1.05}],
    e:[{at:-2.3,w:1.15,h:1.4,y:1.05}],
    w:[{at:-2.3,w:1.45,h:2.2,door:true,crownMk:'silver',name:'foundry-west-door'}]
   }
  });
  raTieredRoof(0,yRoof,-2.3,16.8,9.2,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'copper',trimMk:'silver',soffitMk:'cedar',neckMk:'indigoslate',
   over:.64,tierRise:1.36,neckH:.42,stepIn:.76,spire:true,spireH:2.8
  });

  raTarget(-3.1,y1,4.6,'casting-arch-loggia',true);
  raTarget(0,y1,-2.3,'brass-compass-foundry',true);

  raFurnList([
   ['ria_lodestone_compass',0,y1,-4.2,0],
   ['ria_offering_basin',-.8,y1,4.6,0],
   ['ria_porphyry_table',-3.6,y1,-2.2,0],
   ['ria_porphyry_table',3.6,y1,-2.2,0],
   ['ria_tribute_chest',-6.2,y1,-4.8,0],
   ['ria_tribute_chest',6.2,y1,-4.8,0],
   ['ria_glazed_amphora_rack',6.4,y1,-.4,-PI/2]
  ]);
 }
});

/* 15. Egyptian Palm-Column Lapidary Stoa and Lanna Masters Studio */
defBuilding({
 key:'ra_east_stone_atelier',
 name:'Egyptian Palm-Column Lapidary Stoa and Lanna Masters Studio',
 seed:7215,w:20,d:18,h:13.8,budget:92000,cut:true,
 front:{x:2.2,z:8.0,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['industry','shop'],role:'atelier',job:'masonry'},
 build(){
  const y1=.36,gh=3.55,yRoof=y1+gh;
  raFloorSlab(0,y1,0,17.8,15.2,{mk:'paving',th:.36});
  raStripWalk([2.2,0,8.2],[2.2,y1,6.9],3.0);

  /* Forecourt West Lapidary Carving Yard: Quarried Porphyry, Alabaster & Lodestone Blocks + Half-Carved Hongsa */
  svNoWalk(()=>{
   box('porphyry',-6.2,y1+.01,5.2,1.9,1.15,1.4,P('porphyry'),.18);
   box('alabaster',-3.8,y1+.01,5.6,1.35,.95,1.25,P('alabaster'),-.15);
   box('lodestone',-6.4,y1+.01,2.4,1.1,.85,1.1,P('lodestone'));
   raHongsaSculpt(-4.0,y1+.01,2.5,.35,.9);
  });
  raClassicalBalustrade(-8.5,7.35,-1.6,7.35,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.8,block:true});

  /* East Front Egyptian Green-Palm-Capital Dolomite Carving Stoa [-1.2..8.4, 2.0..6.8] */
  raColonnade(-.6,6.6,8.0,6.6,y1,gh,{style:'upper-ria',n:4,mk:'dolomite',altMk:'porphyry',r:.22,capital:'palm',block:false});
  raFlatTerraceRoof(3.6,yRoof,4.4,9.8,4.8,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'n'
  });

  /* Rear Master Sculptors & Seal-Carvers Studio [-8.4..8.4, -6.8..2.0] + 2-Tier Lanna Indigo-Slate & Alabaster Gable */
  raWallRing(-8.4,-6.8,8.4,2.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-2.8,w:1.5,h:2.2,door:true,crownMk:'silver',name:'carving-yard-door'},
     {at:2.8,w:1.75,h:2.3,door:true,crownMk:'silver',name:'atelier-main-door'},
     {at:6.4,w:1.15,h:1.4,y:1.0}
    ],
    n:[{at:-4.8,w:1.15,h:1.4,y:1.0},{at:0,w:1.3,h:1.5,y:1.0},{at:4.8,w:1.15,h:1.4,y:1.0}],
    e:[{at:-2.4,w:1.15,h:1.4,y:1.0}],
    w:[{at:-2.4,w:1.15,h:1.4,y:1.0}]
   }
  });
  raTieredRoof(0,yRoof,-2.4,17.2,9.0,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'cedar',neckMk:'dolomite',
   over:.64,tierRise:1.32,neckH:.38,stepIn:.76
  });

  raTarget(3.6,y1,4.4,'palm-lapidary-stoa',true);
  raTarget(0,y1,-2.4,'sculptor-atelier-hall',true);
  raTarget(-1.8,y1,4.6,'monolith-carving-court',false);

  raFurnList([
   ['ria_hongsa_lectern',-3.6,y1,-4.2,.2],
   ['ria_lodestone_compass',3.6,y1,-4.2,-.2],
   ['ria_porphyry_table',-2.4,y1,-1.6,0],
   ['ria_porphyry_table',3.0,y1,-1.6,0],
   ['ria_tribute_chest',-6.6,y1,-4.6,PI/2],
   ['ria_glazed_amphora_rack',6.6,y1,-1.8,-PI/2],
   ['ria_offering_basin',5.8,y1,4.4,0]
  ]);
 }
});

/* 16. Minoan Columned Drying-Loggia and Lanna Saffron Press-House */
defBuilding({
 key:'ra_east_saffron_press',
 name:'Minoan Columned Drying-Loggia and Lanna Saffron Press-House',
 seed:7216,w:20,d:17,h:13.8,budget:90000,cut:true,
 front:{x:0,z:7.6,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['industry','farm'],role:'press',job:'milling'},
 build(){
  const y1=raPlinth(17.2,13.6,.58,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:2.8,stepRun:1.4,rail:'hongsa',railOpts:{scale:.64}
  });

  /* Front Minoan Tapered Red-Porphyry Columned Loggia + Rotary Porphyry Millstone Press */
  const gh=3.5,yRoof=y1+gh;
  for(const cx of [-7.6,-3.8,0,3.8,7.6]){
   if(cx===0)continue;
   raColumn(cx,y1,5.9,gh-.16,{style:'upper-ria',mk:'porphyry',capMk:'gold',baseMk:'dolomite',r:.21,taper:'minoan',block:false});
  }
  svNoWalk(()=>{
   /* Rotary porphyry & dolomite spice/oil millstone bed in the west loggia bay */
   cyl('dolomite',-5.6,y1+.01,4.0,1.25,.52,P('dolomite'),16);
   cyl('porphyry',-5.6,y1+.53,4.0,1.05,.28,P('porphyry'),16);
   box('cedar',-5.6,y1+.82,4.0,2.5,.12,.14,P('cedar'),.4);
  });
  raWallBlock(-5.6,y1,4.0,2.4,1.2,2.4,0);
  const yLog=raFlatTerraceRoof(0,yRoof-.16,4.1,16.8,4.0,{
   style:'upper-ria',mk:'dolomite',topMk:'mosaic',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade',skip:'n'
  });
  /* Saffron blossom drying trays on sunny stone loggia roof (svNoWalk) */
  svNoWalk(()=>{
   for(const tx of [-5.2,0,5.2]){
    box('cedar',tx,yLog+.01,4.1,2.8,.1,1.8,P('cedar'));
    box('saffron',tx,yLog+.11,4.1,2.56,.05,1.56,P('saffron'));
   }
  });

  /* Rear Enclosed Saffron & Oil Press Hall [-8.0..8.0, -6.2..2.0] + 2-Tier Lanna Indigo-Slate & Copper Gable */
  raWallRing(-8.0,-6.2,8.0,2.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'saffron',postMk:'porphyry',
   holes:{
    s:[{at:0,w:1.8,h:2.3,door:true,crownMk:'silver',name:'press-hall-door'},{at:4.8,w:1.15,h:1.4,y:.95}],
    n:[{at:-4.5,w:1.15,h:1.4,y:.95},{at:0,w:1.25,h:1.45,y:.95},{at:4.5,w:1.15,h:1.4,y:.95}],
    e:[{at:-2.1,w:1.15,h:1.4,y:.95}],
    w:[{at:-2.1,w:1.15,h:1.4,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-2.1,16.4,8.4,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.62,tierRise:1.32,neckH:.36,stepIn:.76
  });

  raTarget(2.4,y1,4.1,'minoan-mill-loggia',true);
  raTarget(0,y1,-2.1,'saffron-press-hall',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-6.4,y1,-3.8,PI/2],
   ['ria_glazed_amphora_rack',6.4,y1,-3.8,-PI/2],
   ['ria_porphyry_table',-2.4,y1,-2.2,0],
   ['ria_porphyry_table',2.8,y1,-2.2,0],
   ['ria_tribute_chest',0,y1,-4.6,0],
   ['ria_offering_basin',5.2,y1,4.1,0],
   ['ria_saffron_cushion',-2.4,y1,-.9,PI]
  ]);
 }
});

/* 17. Battered Porphyry Cavetto Storehouse and Lanna Ventilated Granary */
defBuilding({
 key:'ra_east_cliff_granary',
 name:'Battered Porphyry Cavetto Storehouse and Lanna Ventilated Granary',
 seed:7217,w:19,d:17,h:15.0,budget:88000,cut:true,
 front:{x:0,z:7.7,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['industry','infrastructure'],role:'granary',job:'warehousing'},
 build(){
  const y1=raPlinth(15.6,12.2,1.2,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:2.8,stepRun:2.5,rail:'hongsa',railOpts:{scale:.68}
  });

  /* Battered Egyptian Red-Porphyry & Dolomite Corner Pylons + Thick Ventilated Ashlar Granary Vault */
  const gh=4.1,yRoof=y1+gh;
  for(const sx of [-6.9,6.9])for(const sz of [-5.2,5.2]){
   raBatteredPylon(sx,sz,1.95,1.95,y1,gh+.28,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
  }
  raWallRing(-6.8,-5.2,6.8,5.2,y1,gh-.22,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:0,w:1.9,h:2.4,door:true,crownMk:'silver',name:'cliff-granary-door'},{at:-3.6,w:.95,h:1.25,y:1.3},{at:3.6,w:.95,h:1.25,y:1.3}],
    n:[{at:-3.6,w:.95,h:1.25,y:1.3},{at:0,w:.95,h:1.25,y:1.3},{at:3.6,w:.95,h:1.25,y:1.3}],
    e:[{at:-2.0,w:.95,h:1.25,y:1.3},{at:2.0,w:.95,h:1.25,y:1.3}],
    w:[{at:-2.0,w:.95,h:1.25,y:1.3},{at:2.0,w:.95,h:1.25,y:1.3}]
   }
  });

  /* 50/50 CROWN: Flat Egyptian Cavetto & Balustrade Stone Deck + Raised Cedar & Indigo-Slate Lanna Ventilated Loft */
  const yDeck=raFlatTerraceRoof(0,yRoof,0,15.0,11.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade'
  });
  svNoWalk(()=>{
   box('cedar',0,yDeck+.02,0,9.4,1.3,6.6,P('cedar'));
   box('copper',0,yDeck+.5,0,9.52,.38,6.72,P('copper'));
  });
  raTieredRoof(0,yDeck+1.32,0,9.8,7.0,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.62,tierRise:1.2,neckH:.34,stepIn:.76,ceiling:false
  });

  raTarget(0,y1,0,'karst-granary-vault',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-5.2,y1,-3.0,PI/2],
   ['ria_glazed_amphora_rack',-5.2,y1,1.8,PI/2],
   ['ria_glazed_amphora_rack',5.2,y1,-3.0,-PI/2],
   ['ria_glazed_amphora_rack',5.2,y1,1.8,-PI/2],
   ['ria_tribute_chest',-2.0,y1,-3.4,0],
   ['ria_tribute_chest',2.0,y1,-3.4,0],
   ['ria_amber_seal_desk',0,y1,2.0,PI],
   ['ria_lantern_stand',2.6,y1,3.0,0]
  ]);
 }
});

/* 18. Dolomite Minoan-Porch and Shan-Lanna Slate Karst Cottage */
defBuilding({
 key:'ra_east_karst_cottage',
 name:'Dolomite Minoan-Porch and Shan-Lanna Slate Karst Cottage',
 seed:7218,w:14,d:14,h:10.8,budget:72000,cut:true,
 front:{x:0,z:6.0,yaw:0},
 tags:{style:'upper-ria',wealth:'poor',types:['dwelling-single'],role:'cottage'},
 build(){
  const y1=raPlinth(10.8,10.2,.58,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:2.1,stepRun:1.3,rail:'none'
  });

  /* Front Flat-Roofed Minoan Tapered Red-Porphyry 2-Column Porch [-4.8..4.8, 1.8..4.8] */
  const gh=3.1,yRoof=y1+gh;
  for(const xCol of [-4.1,4.1]){
   raColumn(xCol,y1,4.55,gh-.16,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.18,taper:'minoan',block:false});
  }
  raClassicalBalustrade(-4.6,4.68,-1.25,4.68,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.78});
  raClassicalBalustrade(1.25,4.68,4.6,4.68,y1,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',h:.78});
  raFlatTerraceRoof(0,yRoof-.16,3.3,10.0,2.9,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade',skip:'n'
  });

  /* Rear Dressed Dolomite & Cedar Cottage Room [-4.8..4.8, -4.8..1.8] + 1-Tier Shan-Lanna Indigo-Slate Gable */
  raWallRing(-4.8,-4.8,4.8,1.8,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'cedar',postMk:'porphyry',cornice:false,
   holes:{
    s:[{at:0,w:1.45,h:2.1,door:true,leafMk:'cedar',crownMk:'silver',pediment:false,name:'karst-cottage-door'},{at:-2.9,w:.95,h:1.15,y:.95},{at:2.9,w:.95,h:1.15,y:.95}],
    n:[{at:-2.4,w:.95,h:1.15,y:.95},{at:2.4,w:.95,h:1.15,y:.95}],
    e:[{at:-1.5,w:.95,h:1.15,y:.95}],
    w:[{at:-1.5,w:.95,h:1.15,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-1.5,10.2,6.8,1,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',
   over:.58,tierRise:1.62
  });

  raTarget(0,y1,3.3,'karst-minoan-porch',true);
  raTarget(0,y1,-1.5,'karst-cottage-room',true);

  raFurnList([
   ['ria_teak_divan',-2.6,y1,-3.2,0],
   ['ria_glazed_amphora_rack',3.3,y1,-2.8,-PI/2],
   ['ria_tribute_chest',-3.1,y1,.2,PI],
   ['ria_saffron_cushion',1.2,y1,-1.6,0],
   ['ria_saffron_cushion',1.2,y1,-.4,PI]
  ]);
 }
});
