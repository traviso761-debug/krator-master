// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — CIVIC, MARKET, INN & MILITARY (9-13)
// 50/50 Balanced Fusion Grammar:
//   9.  ra_west_covered_bazaar    — Vaulted Classical round-arch & glazed-lapis souk bazaar + Burmese Pyatthat lantern cupola
//   10. ra_west_lotus_thermae     — Stepped Roman Pantheon saucer-domed hypocaust bathhouse + Uktena lotus court & chofa portico
//   11. ra_west_amber_scriptorium — Persepolitan protome-column chancellery & Amber-Seal library + Thai Prasat reading gable
//   12. ra_west_caravanserai_inn  — Two-storey Babylonian round-arch courtyard serai + merlon wings & carved-teak Thai dining hall
//   13. ra_west_ishtar_barracks   — Battered cobalt-and-saffron merlon guardhouse + Classical armoury loggia + Pyatthat watch turret

/* 9. Babylonian Glazed Souk Vault and Pyatthat Market Bazaar */
defBuilding({
 key:'ra_west_covered_bazaar',
 name:'Babylonian Glazed Souk Vault and Pyatthat Market Bazaar',
 seed:7109,w:24,d:20,h:18.0,budget:110000,cut:true,
 front:{x:0,z:9.1,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['market','shop'],role:'bazaar',job:'trading'},
 build(){
  const y1=raPlinth(20.6,15.6,.65,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'paving',
   stepW:3.6,stepRun:1.5,rail:'naga',railOpts:{scale:.68}
  });

  /* Classical travertine & lapis-cobalt round-arch souk arcades flanking a central Babylonian Ishtar market portal */
  const gh=4.1,yRoof=y1+gh;
  raArcade(-9.6,7.1,-2.6,7.1,y1,gh,{style:'lower-ria',bays:2,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raArcade(2.6,7.1,9.6,7.1,y1,gh,{style:'lower-ria',bays:2,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raIshtarPortal(0,y1,7.05,0,2.4,2.85,{buttW:1.15,d:.95,hTot:4.75,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raCeilingSlab(0,yRoof-.14,5.9,19.4,2.0,{mk:'teak',trimMk:'gold'});

  /* Enclosed merchant souk hall [-9.4..9.4, -6.8..4.8] */
  raWallRing(-9.4,-6.8,9.4,4.8,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-6.0,w:1.5,h:2.3,door:true,name:'souk-west-door'},
     {at:0,w:2.1,h:2.6,door:true,name:'souk-main-gate'},
     {at:6.0,w:1.5,h:2.3,door:true,name:'souk-east-door'}
    ],
    n:[{at:-5.6,w:1.2,h:1.5,y:1.05},{at:0,w:1.6,h:2.3,door:true,name:'souk-rear-door'},{at:5.6,w:1.2,h:1.5,y:1.05}],
    e:[{at:-1.0,w:1.3,h:1.55,y:1.0,pediment:true}],
    w:[{at:-1.0,w:1.3,h:1.55,y:1.0,pediment:true}]
   }
  });
  /* Colorful merchant silk awnings over front arcade bays (in svNoWalk, stepped proud) */
  svNoWalk(()=>{
   for(const sx of [-6.1,6.1]){
    box('teak',sx,y1+2.95,7.65,5.2,.07,.08,P('teak'));
    poly('silk',[[sx-2.5,y1+2.98,7.62],[sx+2.5,y1+2.98,7.62],[sx+2.5,y1+2.42,8.45],[sx-2.5,y1+2.42,8.45]],P(sx<0?'silkSaffron':'silkCrimson'),true);
   }
  });

  /* 50/50 CROWN: Flat Babylonian Crow-Step Merlon Stone Side Vaults + Central 4-Tier Burmese Pyatthat Lantern Cupola */
  raFlatTerraceRoof(-6.4,yRoof,-1.0,6.4,12.0,{
   style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:'e'
  });
  raFlatTerraceRoof(6.4,yRoof,-1.0,6.4,12.0,{
   style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:'w'
  });
  raTieredRoof(0,yRoof,-1.0,7.2,12.2,4,{
   style:'lower-ria',mode:'hip',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.65,tierRise:.96,neckH:.38,stepIn:.76,spire:true,spireH:3.8
  });

  raTarget(0,y1,5.9,'souk-front-arcade',true);
  raTarget(0,y1,-1.0,'bazaar-central-crossing',true);
  raTarget(-6.2,y1,-1.0,'west-silk-stall-vault',true);
  raTarget(6.2,y1,-1.0,'east-spice-stall-vault',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-7.8,y1,-3.8,PI/2],
   ['ria_glazed_amphora_rack',-7.8,y1,1.2,PI/2],
   ['ria_glazed_amphora_rack',7.8,y1,-3.8,-PI/2],
   ['ria_tribute_chest',7.8,y1,1.2,-PI/2],
   ['ria_porphyry_table',-4.8,y1,-1.4,0],
   ['ria_porphyry_table',4.8,y1,-1.4,0],
   ['ria_amber_seal_desk',0,y1,-4.6,0],
   ['ria_lantern_stand',-2.4,y1,2.4,0],
   ['ria_lantern_stand',2.4,y1,2.4,0]
  ]);
 }
});

/* 10. Roman Pantheon Hypocaust Thermae and Uktena Lotus Bathhouse */
defBuilding({
 key:'ra_west_lotus_thermae',
 name:'Roman Pantheon Hypocaust Thermae and Uktena Lotus Bathhouse',
 seed:7110,w:24,d:22,h:17.2,budget:112000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic'],role:'bathhouse',job:'healing'},
 build(){
  /* Twin steaming lotus plunge basins flanking the grand Uktena Naga entrance stair */
  raWaterCourt(-7.2,7.6,6.2,4.2,.36,.54,{style:'lower-ria',curbMk:'travertine',trimMk:'emerald',lotus:5});
  raWaterCourt(7.2,7.6,6.2,4.2,.36,.54,{style:'lower-ria',curbMk:'travertine',trimMk:'emerald',lotus:5});

  const y1=raPlinth(20.4,13.6,.95,{
   style:'lower-ria',baseMk:'cobalt',midMk:'emerald',capMk:'travertine',topMk:'mosaic',
   stepW:3.4,stepRun:2.4,rail:'naga',railOpts:{scale:.8},
   /* Shift plinth stair cleanly forward between the two lotus plunge courts */
   steps:false
  });
  raGrandStair(0,0,10.2,0,y1,6.9,3.4,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.82}});

  /* Front Thai Rattanakosin Chofa-Gable Portico on Classical fluted travertine columns */
  const gh=4.15,yRoof=y1+gh;
  raColonnade(-3.0,6.2,3.0,6.2,y1,3.55,{style:'lower-ria',n:4,skipMid:1.25,mk:'travertine',friezeMk:'cobalt',r:.22,block:false});
  raTieredRoof(0,y1+3.55,5.1,6.6,2.8,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'emerald',trimMk:'gold',soffitMk:'teak',over:.52,tierRise:.92
  });

  /* Tripartite bathhouse shell [-9.6..9.6, -6.2..4.0] + indoor warm plunge pool at center */
  raWallRing(-9.6,-6.2,9.6,4.0,y1,gh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',postMk:'cobalt',
   holes:{
    s:[
     {at:-6.4,w:1.25,h:1.55,y:1.05,pediment:true},
     {at:0,w:2.0,h:2.55,door:true,name:'thermae-portal'},
     {at:6.4,w:1.25,h:1.55,y:1.05,pediment:true}
    ],
    n:[{at:-6.0,w:1.2,h:1.5,y:1.05},{at:0,w:1.4,h:1.65,y:1.05,pediment:true},{at:6.0,w:1.2,h:1.5,y:1.05}],
    e:[{at:-1.1,w:1.3,h:1.55,y:1.05,pediment:true}],
    w:[{at:-1.1,w:1.3,h:1.55,y:1.05,pediment:true}]
   }
  });
  raWaterCourt(0,-1.8,4.6,3.8,y1+.28,.38,{style:'lower-ria',curbMk:'alabaster',trimMk:'cobalt',lotus:3});

  /* Flat Classical Balustrade Stone Side Apodyterium Roofs + Central Stepped Roman Pantheon Saucer-Rotunda Dome! */
  raFlatTerraceRoof(-6.8,yRoof,-1.1,5.8,10.4,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'travertine',trimMk:'gold',parapet:'balustrade',skip:'e'
  });
  raFlatTerraceRoof(6.8,yRoof,-1.1,5.8,10.4,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'travertine',trimMk:'gold',parapet:'balustrade',skip:'w'
  });
  raCeilingSlab(0,yRoof+.02,-1.1,8.0,10.2,{mk:'travertine',trimMk:'gold'});
  raPantheonRotundaDome(0,yRoof+.18,-1.1,4.6,8.2,{
   style:'lower-ria',drumMk:'travertine',mk:'celadon',ribMk:'gold',soffitMk:'alabaster'
  });
  /* Hypocaust furnace chimney stack on rear NW corner with gentle warm steam plume */
  svNoWalk(()=>{
   box('brick',-8.4,yRoof+.52,-5.2,1.1,2.4,1.1,P('brick'));
   box('cobalt',-8.4,yRoof+2.92,-5.2,1.22,.22,1.22,P('cobalt'));
  });
  smokeAt(-8.4,yRoof+3.2,-5.2,{r:.28,kind:'smoke'});

  raTarget(0,y1,5.0,'thermae-chofa-portico',true);
  raTarget(0,y1,2.2,'caldarium-rotunda-walk',true);
  raTarget(-6.8,y1,-1.1,'west-apodyterium',true);
  raTarget(6.8,y1,-1.1,'east-tepidarium',true);

  raFurnList([
   ['ria_offering_basin',-3.4,y1,1.8,0],
   ['ria_offering_basin',3.4,y1,1.8,0],
   ['ria_teak_divan',-7.2,y1,-3.4,0],
   ['ria_teak_divan',7.2,y1,-3.4,0],
   ['ria_silk_screen',-5.2,y1,-3.8,.2],
   ['ria_silk_screen',5.2,y1,-3.8,-.2],
   ['ria_uktena_brazier',-3.4,y1,-4.2,0],
   ['ria_uktena_brazier',3.4,y1,-4.2,0],
   ['ria_saffron_cushion',-7.2,y1,.8,PI],
   ['ria_saffron_cushion',7.2,y1,.8,PI]
  ]);
 }
});

/* 11. Persepolitan Protome Chancellery and Amber-Seal Prasat Library */
defBuilding({
 key:'ra_west_amber_scriptorium',
 name:'Persepolitan Protome Chancellery and Amber-Seal Prasat Library',
 seed:7111,w:22,d:19,h:17.2,budget:105000,cut:true,
 front:{x:0,z:8.6,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic'],role:'school',job:'scribing'},
 build(){
  const y1=raPlinth(18.6,14.2,.85,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'mosaic',
   stepW:3.2,stepRun:1.9,rail:'naga',railOpts:{scale:.72}
  });

  /* Achaemenid Persepolitan Double-Protome Front Colonnade + Twin Battered Glazed Corner Pylons */
  const gh=4.35,yRoof=y1+gh;
  for(const sx of [-8.3,8.3]){
   raBatteredPylon(sx,5.8,1.9,1.9,y1,gh+.28,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }
  for(const cx of [-5.2,-1.9,1.9,5.2]){
   raColumn(cx,y1,6.1,gh,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.26,capital:'protome',protomeYaw:0});
  }

  /* Scriptorium & Amber-Seal Archive Hall [-8.2..8.2, -6.4..4.2] */
  raWallRing(-8.2,-6.4,8.2,4.2,y1,gh-.24,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-4.6,w:1.25,h:1.65,y:1.0,pediment:true},
     {at:0,w:2.0,h:2.55,door:true,name:'scriptorium-door'},
     {at:4.6,w:1.25,h:1.65,y:1.0,pediment:true}
    ],
    n:[{at:-4.6,w:1.25,h:1.65,y:1.0},{at:0,w:1.45,h:1.75,y:1.0,pediment:true},{at:4.6,w:1.25,h:1.65,y:1.0}],
    e:[{at:-1.1,w:1.5,h:2.25,door:true,name:'archive-east-door'}],
    w:[{at:-1.1,w:1.3,h:1.6,y:1.0,pediment:true}]
   }
  });

  /* 50/50 CROWN: Wide Flat Merlon-Crenellated Persepolitan Terrace + Central 3-Tier Gilded Thai Prasat Reading Clerestory */
  const yTer=raFlatTerraceRoof(0,yRoof,-.2,17.8,13.4,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
  });
  raTieredRoof(0,yTer+.02,-1.1,9.2,7.8,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.68,tierRise:1.08,neckH:.38,stepIn:.76,spire:true,spireH:3.4,ceiling:false
  });

  raTarget(0,y1,5.2,'protome-portico',true);
  raTarget(0,y1,-1.2,'amber-seal-reading-hall',true);
  raTarget(-5.6,y1,-1.2,'west-tablet-archive',true);

  raFurnList([
   ['ria_amber_seal_desk',-3.8,y1,-1.8,0],
   ['ria_amber_seal_desk',3.8,y1,-1.8,0],
   ['ria_hongsa_lectern',0,y1,-4.2,0],
   ['ria_silk_screen',0,y1,-5.3,0],
   ['ria_tribute_chest',-6.4,y1,-4.4,PI/2],
   ['ria_tribute_chest',6.4,y1,-4.4,-PI/2],
   ['ria_porphyry_table',0,y1,1.0,0],
   ['ria_saffron_cushion',-1.3,y1,1.0,PI/2],
   ['ria_saffron_cushion',1.3,y1,1.0,-PI/2],
   ['ria_lantern_stand',-2.6,y1,2.8,0],
   ['ria_lantern_stand',2.6,y1,2.8,0]
  ]);
 }
});

/* 12. Babylonian Round-Arch Courtyard Serai and Teak Prasat Inn */
defBuilding({
 key:'ra_west_caravanserai_inn',
 name:'Babylonian Round-Arch Courtyard Serai and Teak Prasat Inn',
 seed:7112,w:26,d:24,h:15.8,budget:118000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['tavern','inn'],role:'caravanserai',job:'brewing'},
 build(){
  const y1=.36,gh=3.65,y2=y1+gh;
  raFloorSlab(0,y1,0,23.6,20.8,{mk:'paving',th:.36});
  raStripWalk([0,0,11.2],[0,y1,9.8],3.6);

  /* Front Babylonian Ishtar Gateway + Courtyard Watering Basin */
  raIshtarPortal(0,y1,9.6,0,2.8,2.95,{buttW:1.25,d:.95,hTot:4.6,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raMerlonParapet(-11.4,9.85,-2.9,9.85,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(2.9,9.85,11.4,9.85,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raWaterCourt(0,3.2,4.6,3.8,y1+.28,.42,{style:'lower-ria',curbMk:'travertine',trimMk:'cobalt',lotus:4});

  /* West & East Flat Merlon-Crenellated Classical Round-Arch Guest & Pack-Stall Wings */
  for(const s of [-1,1]){
   const wx=s*9.1;
   raWallRing(wx-2.3,-1.6,wx+2.3,8.8,y1,gh,{
    style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
    holes:s<0
     ?{e:[{at:3.6,w:1.55,h:2.25,door:true,name:'serai-west-wing-door'},{at:0,w:1.1,h:1.35,y:.95},{at:7.0,w:1.1,h:1.35,y:.95}],w:[{at:3.6,w:1.1,h:1.35,y:.95}]}
     :{w:[{at:3.6,w:1.55,h:2.25,door:true,name:'serai-east-wing-door'},{at:0,w:1.1,h:1.35,y:.95},{at:7.0,w:1.1,h:1.35,y:.95}],e:[{at:3.6,w:1.1,h:1.35,y:.95}]}
   });
   raArcade(wx-s*2.55,-1.2,wx-s*2.55,8.4,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.46,block:false});
   raFlatTerraceRoof(wx,y2,3.6,4.9,10.8,{
    style:'lower-ria',mk:'cobalt',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
   });
  }

  /* Rear Two-Storey Dining Tavern & Carved Dark-Teak Thai Chofa-Gable Sleeping Hall [-11.2..11.2, -9.8..-2.2] */
  raArcade(-8.6,-2.0,8.6,-2.0,y1,gh,{style:'lower-ria',bays:5,mk:'travertine',trimMk:'cobalt',pierW:.5});
  raWallRing(-11.0,-9.8,11.0,-2.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-5.8,w:1.5,h:2.25,door:true,name:'tavern-west-door'},
     {at:0,w:2.0,h:2.45,door:true,name:'tavern-hall-door'},
     {at:5.8,w:1.25,h:1.45,y:1.0,pediment:true}
    ],
    n:[{at:-6.0,w:1.2,h:1.45,y:1.0},{at:0,w:1.3,h:1.5,y:1.0},{at:6.0,w:1.2,h:1.45,y:1.0}]
   }
  });
  const st=svStair(8.8,-6.2,y1,y2,-PI/2,{w:1.15,riser:.18,going:.26,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-5.9,21.6,7.6,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-2.2,y2-.24,-6.1,16.0,6.8,{mk:'teak',trimMk:'gold'});

  const uh=3.35,yRoof=y2+uh;
  raWallRing(-10.6,-9.5,10.6,-3.2,y2,uh,{
   style:'lower-ria',mk:'teak',socMk:'crimson',dadoMk:'carvedwood',postMk:'crimson',cornice:false,
   holes:{
    s:[{at:-5.4,w:1.2,h:1.4,y:.95},{at:0,w:1.65,h:2.2,door:true,leafMk:'carvedwood',name:'inn-balcony-door'},{at:5.4,w:1.2,h:1.4,y:.95}],
    n:[{at:-5.2,w:1.2,h:1.4,y:.95},{at:5.2,w:1.2,h:1.4,y:.95}]
   }
  });
  raClassicalBalustrade(-10.5,-2.25,10.5,-2.25,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold'});
  raTieredRoof(0,yRoof,-6.35,21.6,6.8,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.68,tierRise:1.18,neckH:.38,stepIn:.76
  });

  raTarget(0,y1,6.4,'serai-courtyard',false);
  raTarget(-9.1,y1,3.6,'west-caravan-cell',true);
  raTarget(9.1,y1,3.6,'east-caravan-cell',true);
  raTarget(-1.5,y1,-6.0,'tavern-feast-hall',true);
  raTarget(-1.5,y2,-6.2,'upper-teak-dormitory',true);

  raFurnList([
   ['ria_porphyry_table',-3.6,y1,-5.8,0],
   ['ria_porphyry_table',2.2,y1,-5.8,0],
   ['ria_saffron_cushion',-3.6,y1,-4.5,PI],
   ['ria_saffron_cushion',2.2,y1,-4.5,PI],
   ['ria_glazed_amphora_rack',-9.1,y1,6.4,0],
   ['ria_tribute_chest',9.1,y1,6.4,0],
   ['ria_teak_divan',-6.8,y2,-7.6,0],
   ['ria_teak_divan',-1.2,y2,-7.6,0],
   ['ria_lantern_stand',-3.8,y1,-.8,0],
   ['ria_lantern_stand',3.8,y1,-.8,0]
  ]);
 }
});

/* 13. Battered Ishtar Merlon Guardhouse and Pyatthat Watch Barracks */
defBuilding({
 key:'ra_west_ishtar_barracks',
 name:'Battered Ishtar Merlon Guardhouse and Pyatthat Watch Barracks',
 seed:7113,w:22,d:18,h:18.0,budget:102000,cut:true,
 front:{x:0,z:8.2,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['military'],role:'guardhouse'},
 build(){
  const y1=raPlinth(18.2,13.6,.75,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'paving',
   stepW:3.0,stepRun:1.6,rail:'naga',railOpts:{scale:.68}
  });

  /* Twin Battered Cobalt & Saffron Babylonian Bastion Pylons + Classical Rusticated Armoury Arcade */
  const gh=3.95,y2=y1+gh;
  for(const sx of [-7.9,7.9]){
   raBatteredPylon(sx,5.2,2.4,2.4,y1,gh+1.35,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }
  raArcade(-5.8,5.8,5.8,5.8,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.54});
  raCeilingSlab(0,y2-.18,4.9,11.6,1.6,{mk:'travertine',trimMk:'gold'});

  /* Barracks & Armoury Hall [-8.2..8.2, -5.8..4.0] + interior stair to walkable merlon rampart roof */
  raWallRing(-8.2,-5.8,8.2,4.0,y1,gh,{
   style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-4.4,w:1.15,h:1.45,y:1.05,pediment:true},
     {at:0,w:1.95,h:2.45,door:true,name:'barracks-main-gate'},
     {at:4.4,w:1.15,h:1.45,y:1.05,pediment:true}
    ],
    n:[{at:-4.6,w:1.1,h:1.4,y:1.1},{at:4.6,w:1.1,h:1.4,y:1.1}],
    e:[{at:-1.0,w:1.45,h:2.2,door:true,name:'armoury-side-door'}],
    w:[{at:-1.0,w:1.1,h:1.4,y:1.1}]
   }
  });
  const st=svStair(6.2,-3.8,y1,y2,-PI/2,{w:1.1,riser:.18,going:.26,mk:'travertine',smk:'cobalt',col:P('travertine'),scol:P('cobalt'),rail:'both'});
  raFloorSlab(0,y2,-.9,16.2,9.8,{mk:'paving',th:.18,hole:st});
  raCeilingSlab(-1.8,y2-.24,-.9,11.8,9.0,{mk:'teak',trimMk:'gold'});

  /* Merlon-Crenellated Rampart Parapets + Central 3-Tier Burmese Pyatthat Watch-Bell Turret */
  raMerlonParapet(-7.9,3.85,7.9,3.85,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(7.9,-5.65,-7.9,-5.65,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(-7.95,-5.4,-7.95,3.6,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});
  raMerlonParapet(7.95,3.6,7.95,-5.4,y2,{mk:'cobalt',bandMk:'saffron',capMk:'gold',block:true});

  const wh=3.25;
  raWallRing(-3.0,-3.4,3.0,1.6,y2,wh,{
   style:'lower-ria',mk:'crimson',socMk:'cobalt',dadoMk:'gold',postMk:'teak',
   holes:{
    s:[{at:0,w:1.5,h:2.15,door:true,name:'watch-turret-door'}],
    e:[{at:-.9,w:1.05,h:1.3,y:.95}],
    w:[{at:-.9,w:1.05,h:1.3,y:.95}]
   }
  });
  raTieredRoof(0,y2+wh,-.9,6.6,5.6,3,{
   style:'lower-ria',mode:'hip',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.58,tierRise:.95,neckH:.34,stepIn:.76,spire:true,spireH:3.5
  });
  raBanner(-5.2,y2,3.4,0,3.2,P('silkCrimson'),false);
  raBanner(5.2,y2,3.4,0,3.2,P('silkSaffron'),false);

  raTarget(0,y1,4.9,'armoury-loggia',true);
  raTarget(-1.8,y1,-1.0,'barracks-guardhall',true);
  raTarget(0,y2,-.9,'pyatthat-watch-chamber',true);
  raTarget(-5.4,y2,1.6,'ishtar-rampart-walk',false);

  raFurnList([
   ['ria_amber_seal_desk',-4.6,y1,1.6,0],
   ['ria_teak_divan',-5.6,y1,-3.8,0],
   ['ria_teak_divan',-.8,y1,-3.8,0],
   ['ria_tribute_chest',-6.4,y1,-.8,PI/2],
   ['ria_tribute_chest',2.4,y1,1.8,PI],
   ['ria_uktena_brazier',0,y2,-2.0,0],
   ['ria_lantern_stand',-2.4,y1,2.8,0],
   ['ria_lantern_stand',2.4,y1,2.8,0]
  ]);
 }
});
