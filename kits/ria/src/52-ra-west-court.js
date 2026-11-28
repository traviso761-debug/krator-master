// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — COURT & SACRED MONUMENTS (1-4)
// 50/50 Balanced Fusion Grammar:
//   - Near-Eastern / Classical / Egyptian (50%): Babylonian polychrome lapis-cobalt & saffron glazed-brick Ishtar round-arch portals,
//     stepped crow-step merlon Hanging-Garden ziggurat wings, Persepolitan double-protome Apadana hypostyle halls, Classical
//     semicircular curved exedra colonnades, Pantheon stepped saucer-rotundas, and Cosmatesque Solomonic spiral marble cloisters.
//   - Southeast Asian (50%): Multi-tier Thai Rattanakosin Prasat & Burmese Konbaung Pyatthat spires, cruciform emerald Sala-Nam
//     water pavilions, Khmer-Thai glazed porcelain Prangs, chofa flame-finials, and 5-Headed Uktena Naga balustrades.

/* 1. Chakri-Ishtar Hanging-Garden Ziggurat and Sovereign Prasat Palace */
defBuilding({
 key:'ra_west_prasat_palace',
 name:'Chakri-Ishtar Hanging-Garden Ziggurat and Sovereign Prasat Palace',
 seed:7101,w:36,d:28,h:27.5,budget:138000,cut:true,
 front:{x:0,z:13.1,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic'],role:'palace'},
 build(){
  /* Monumental battered cobalt, emerald & travertine plinth + twin forecourt lotus water basins */
  const y1=raPlinth(29.6,18.4,2.0,{
   style:'lower-ria',baseMk:'cobalt',midMk:'emerald',capMk:'travertine',topMk:'mosaic',
   stepW:4.2,stepRun:4.2,rail:'naga',railOpts:{scale:1.1}
  });
  raWaterCourt(-10.2,10.9,6.8,3.6,.38,.52,{style:'lower-ria',lotus:5});
  raWaterCourt(10.2,10.9,6.8,3.6,.38,.52,{style:'lower-ria',lotus:5});

  /* Four battered Babylonian lapis-cobalt & saffron glazed corner bastion pylons anchoring the palace */
  for(const sx of [-13.2,13.2])for(const sz of [-6.8,4.8]){
   raBatteredPylon(sx,sz,3.2,3.2,y1,8.8,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }

  /* Ground-floor Classical fluted travertine round-arch loggias flanking a monumental Babylonian Ishtar Round-Arch Portal! */
  const gh=4.4,y2=y1+gh;
  raArcade(-12.8,8.4,-3.0,8.4,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.56});
  raArcade(3.0,8.4,12.8,8.4,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.56});
  raIshtarPortal(0,y1,8.35,0,2.8,3.1,{buttW:1.35,d:1.1,hTot:5.4,mk:'cobalt',bandMk:'saffron',accMk:'emerald'});
  raCeilingSlab(0,y2-.14,6.8,26.4,2.8,{mk:'teak',trimMk:'gold'});

  /* Tripartite ground shell [-12.6..12.6, -7.8..5.4] with operable grand sovereign portal & side wing doors */
  raWallRing(-12.6,-7.8,12.6,5.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-8.2,w:1.6,h:2.5,door:true,name:'west-envoy-door'},
     {at:-4.4,w:1.3,h:1.7,y:1.05,pediment:true},
     {at:0,w:2.4,h:2.9,door:true,name:'sovereign-gate'},
     {at:4.4,w:1.3,h:1.7,y:1.05,pediment:true},
     {at:8.2,w:1.6,h:2.5,door:true,name:'east-chancellery-door'}
    ],
    n:[{at:-7.5,w:1.4,h:1.7,y:1.05},{at:0,w:1.6,h:1.9,y:1.05,pediment:true},{at:7.5,w:1.4,h:1.7,y:1.05}],
    e:[{at:-1.2,w:1.4,h:1.7,y:1.05,pediment:true}],
    w:[{at:-1.2,w:1.4,h:1.7,y:1.05,pediment:true}]
   }
  });
  for(const ix of [-5.2,5.2]){
   raWall(ix,-7.2,ix,4.8,y1,gh,{
    style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',
    holes:[{at:6.0,w:1.9,h:2.6,door:true,open:true}]
   });
  }

  /* Interior grand stair in East Wing ascending from y1 (2.0) to 2nd-storey gallery y2 (6.4) */
  const st=svStair(9.2,-5.6,y1,y2,0,{w:1.35,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-1.2,24.8,12.8,{mk:'mosaic',th:.2,hole:st});
  raCeilingSlab(0,y2-.26,-1.2,9.8,12.2,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(-8.8,y2-.26,-1.2,6.4,12.2,{mk:'teak',trimMk:'gold'});

  /* Second-storey Classical-Babylonian Ziggurat Gallery [-11.8..11.8, -6.8..4.6] */
  const uh=3.9,yRoof=y2+uh;
  raWallRing(-11.8,-6.8,11.8,4.6,y2,uh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
   holes:{
    s:[
     {at:-7.8,w:1.3,h:1.65,y:.95,pediment:true},
     {at:-3.8,w:1.3,h:1.65,y:.95,pediment:true},
     {at:0,w:1.9,h:2.45,door:true,name:'upper-balcony-door'},
     {at:3.8,w:1.3,h:1.65,y:.95,pediment:true},
     {at:7.8,w:1.3,h:1.65,y:.95,pediment:true}
    ],
    n:[{at:-6.8,w:1.3,h:1.6,y:.95},{at:0,w:1.5,h:1.7,y:.95,pediment:true},{at:6.8,w:1.3,h:1.6,y:.95}],
    e:[{at:-1.1,w:1.3,h:1.6,y:.95,pediment:true}],
    w:[{at:-1.1,w:1.3,h:1.6,y:.95,pediment:true}]
   }
  });
  /* Projecting Classical-Babylonian balcony over central Ishtar portal */
  raFloorSlab(0,y2,5.6,5.6,1.8,{mk:'travertine',th:.16});
  raClassicalBalustrade(-2.7,6.42,2.7,6.42,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold'});

  /* 50/50 CROWN: Twin Flat Merlon-Crenellated Babylonian Hanging-Garden Ziggurat Wings + Central 5-Tier Thai Prasat Spire! */
  for(const sx of [-8.7,8.7]){
   const yWing=raFlatTerraceRoof(sx,yRoof,-1.1,6.4,11.6,{
    style:'lower-ria',mk:'cobalt',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold',skip:sx<0?'e':'w',garden:true
   });
   /* Stepped upper Babylonian ziggurat altar-tier on rear of each wing */
   svNoWalk(()=>{
    box('cobalt',sx,yWing+.02,-4.4,4.2,1.35,3.6,P('cobalt'));
    box('saffron',sx,yWing+1.37,-4.4,4.3,.22,3.7,P('saffron'));
   });
   raMerlonParapet(sx-2.0,-2.7,sx+2.0,-2.7,yWing+1.59,{mk:'cobalt',bandMk:'saffron',capMk:'gold',pitch:.95});
   raMerlonParapet(sx+2.0,-6.1,sx-2.0,-6.1,yWing+1.59,{mk:'cobalt',bandMk:'saffron',capMk:'gold',pitch:.95});
  }
  raTieredRoof(0,yRoof,-1.1,10.2,12.0,5,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.78,tierRise:1.12,neckH:.48,stepIn:.76,spire:true,spireH:5.8
  });

  raBanner(-4.6,y1,8.9,0,3.8,P('silkCrimson'),false);
  raBanner(4.6,y1,8.9,0,3.8,P('silkSaffron'),false);

  raTarget(0,y1,6.8,'arcade-loggia',true);
  raTarget(0,y1,-1.5,'sovereign-throne-hall',true);
  raTarget(-8.6,y1,-1.5,'west-envoy-hall',true);
  raTarget(8.6,y1,-.5,'east-chancellery',true);
  raTarget(0,y2,-.8,'upper-prasat-gallery',true);
  raTarget(0,y2,5.5,'royal-balcony',false);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-5.4,0],
   ['ria_uktena_brazier',-2.4,y1,-4.2,0],
   ['ria_uktena_brazier',2.4,y1,-4.2,0],
   ['ria_silk_screen',-3.2,y1,-5.8,.25],
   ['ria_silk_screen',3.2,y1,-5.8,-.25],
   ['ria_porphyry_table',-8.8,y1,-2.2,0],
   ['ria_saffron_cushion',-8.8,y1,-.9,0],
   ['ria_saffron_cushion',-8.8,y1,-3.5,PI],
   ['ria_amber_seal_desk',8.6,y1,-.8,PI],
   ['ria_tribute_chest',-10.6,y1,-5.8,0],
   ['ria_sovereign_throne',0,y2,-4.6,0],
   ['ria_porphyry_table',-6.4,y2,-1.6,0],
   ['ria_lantern_stand',-3.6,y1,2.8,0],
   ['ria_lantern_stand',3.6,y1,2.8,0]
  ]);
 }
});

/* 2. Classical Pantheon-Rotunda and Star Sala-Nam Water-Pavilion Court */
defBuilding({
 key:'ra_west_lotus_pavilion',
 name:'Classical Pantheon-Rotunda and Star Sala-Nam Water-Pavilion Court',
 seed:7102,w:32,d:28,h:18.5,budget:130000,cut:true,
 front:{x:0,z:12.8,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic','park'],role:'pavilion'},
 build(){
  /* Broad stone-curbed lotus basin + live core/water canal flow across the water court */
  raWaterCourt(0,-.4,28.8,22.4,.36,.65,{style:'lower-ria',curbMk:'travertine',trimMk:'emerald',lotus:16,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[-13.8,.12,-.4],[0,.12,-.4],[13.8,.12,-.4]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'sala-nam-basin',pts:wPts,width:20.6,speed:.22};
  }

  /* South Classical Greco-Roman Pedimented Entrance Portico rising to boardwalk deck yDeck = 1.15 m */
  const yDeck=1.15;
  raFloorSlab(0,yDeck,10.3,5.8,2.9,{mk:'travertine',th:.26});
  raGrandStair(0,0,13.5,0,yDeck,11.5,3.0,{mk:'travertine',sideMk:'emerald',rail:'naga',railOpts:{scale:.85}});
  raColonnade(-2.4,11.45,2.4,11.45,yDeck,3.35,{style:'lower-ria',n:4,skipMid:1.15,mk:'travertine',friezeMk:'cobalt',r:.2,block:false});
  raColonnade(-2.4,9.15,2.4,9.15,yDeck,3.35,{style:'lower-ria',n:4,skipMid:1.15,mk:'travertine',friezeMk:'cobalt',r:.2,block:false});
  raCeilingSlab(0,yDeck+3.37,10.3,5.2,2.5,{mk:'travertine',trimMk:'gold'});
  raClassicalPediment(0,yDeck+3.38,10.3,0,5.6,1.3,2.7,{style:'lower-ria',mk:'travertine',tymMk:'cobalt'});

  /* North Classical Pantheon Oculus Rotunda Island + Grounded Rear Travertine & Cobalt Waterside Retaining Promenade */
  raFloorDisc(0,-8.5,3.35,yDeck,'mosaic',P('mosaic'),{seg:20,th:.24});
  svNoWalk(()=>{
   cyl('travertine',0,-.3,-8.5,3.45,1.18,P('travertine'),20);
   /* Grounded rear retaining promenade sitting solidly along the rear masonry bank of the lotus basin (no floating columns) */
   for(const s of [-1,1]){
    const bx=s*9.0;
    box('cobalt',bx,0,-12.35,10.2,.44,1.2,P('cobalt'));
    box('saffron',bx,.44,-12.35,10.28,.12,1.26,P('saffron'));
    box('travertine',bx,.56,-12.35,10.36,.24,1.32,P('travertine'));
    cyl('alabaster',s*13.4,.8,-12.35,.28,.42,P('alabaster'),10);
    cone('gold',s*13.4,1.22,-12.35,.16,.24,P('gold'),8);
   }
  });
  raClassicalBalustrade(-13.8,-12.35,-4.1,-12.35,.8,{style:'lower-ria',mk:'travertine',trimMk:'gold',h:.78});
  raClassicalBalustrade(4.1,-12.35,13.8,-12.35,.8,{style:'lower-ria',mk:'travertine',trimMk:'gold',h:.78});
  for(let k=0;k<8;k++){
   const a=k/8*TAU+.2;
   raColumn(Math.cos(a)*2.85,yDeck,-8.5+Math.sin(a)*2.85,3.65,{style:'lower-ria',mk:'travertine',capMk:'gold',baseMk:'cobalt',r:.21,block:false});
  }
  raPantheonRotundaDome(0,yDeck+3.65,-8.5,3.1,5.1,{style:'lower-ria',drumMk:'travertine',mk:'giltroof',soffitMk:'travertine'});

  /* Central Cruciform Emerald-Celadon Sala-Nam Island + Twin Foreground Hexagonal Thai Water-Gazebos! */
  raFloorSlab(0,yDeck,-.6,11.2,10.6,{mk:'floor',th:.24});
  for(const [wx,wz,ww,wd] of [[0,5.2,4.6,2.2],[0,-6.4,4.6,2.2],[-6.2,-.6,2.2,4.6],[6.2,-.6,2.2,4.6]]){
   raFloorSlab(wx,yDeck,wz,ww,wd,{mk:'floor',th:.22});
  }
  svNoWalk(()=>{
   for(const sx of [-4.6,0,4.6])for(const sz of [-5.0,-.6,3.8]){
    cyl('cobalt',sx,-.3,sz,.32,yDeck+.05,P('cobalt'),10);
   }
  });

  raBoardwalk(0,9.1,0,6.1,-.25,yDeck,2.2,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(0,-5.3,0,-6.6,-.25,yDeck,2.2,{postMk:'crimson',railMk:'gold'});
  for(const [gx,gz] of [[-9.8,6.8],[9.8,6.8]]){
   raFloorDisc(gx,gz,2.45,yDeck,'floor',P('floor'),{seg:6,th:.2});
   svNoWalk(()=>cyl('emerald',gx,-.3,gz,.38,yDeck+.1,P('emerald'),8));
   for(let k=0;k<6;k++){
    const a=k/6*TAU+.26;
    raColumn(gx+Math.cos(a)*2.05,yDeck,gz+Math.sin(a)*2.05,2.95,{style:'lower-ria',mk:'crimson',capMk:'gold',baseMk:'emerald',r:.15,block:false});
   }
   raOctPavilionRoof(gx,yDeck+2.95,gz,2.75,2,{style:'lower-ria',seg:6,mk:'emerald',trimMk:'gold',soffitMk:'teak',tierRise:.95});
  }
  raBoardwalk(-2.2,10.1,-9.2,7.1,-.25,yDeck,1.7,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(2.2,10.1,9.2,7.1,-.25,yDeck,1.7,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(-9.5,5.2,-6.4,-.6,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(9.5,5.2,6.4,-.6,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});

  /* Central Cruciform Thai/Burmese Sala-Nam Pavilion */
  const chH=3.75;
  for(const sx of [-4.9,4.9])for(const sz of [-5.2,-2.1,1.0,4.0]){
   raColumn(sx,yDeck,sz,chH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'emerald',r:.2});
  }
  raWallRing(-3.5,-4.2,3.5,3.0,yDeck,chH,{
   style:'lower-ria',mk:'carvedwood',col:P('teak'),socMk:'emerald',dadoMk:'gold',postMk:'crimson',
   holes:{
    s:[{at:0,w:1.8,h:2.35,door:true,name:'sala-south-door'}],
    n:[{at:0,w:1.6,h:2.3,door:true,name:'sala-north-door'}],
    e:[{at:-.6,w:1.5,h:2.25,door:true,open:true}],
    w:[{at:-.6,w:1.5,h:2.25,door:true,open:true}]
   }
  });
  raTieredRoof(0,yDeck+chH,-.6,11.0,6.0,2,{style:'lower-ria',mode:'gable',gableAxis:'x',mk:'emerald',trimMk:'gold',soffitMk:'teak',over:.62,tierRise:1.02});
  raTieredRoof(0,yDeck+chH,-.6,6.0,11.2,2,{style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',over:.62,tierRise:1.02,ceiling:false});
  raCeilingSlab(0,yDeck+chH+.02,-.6,10.6,10.4,{mk:'teak',trimMk:'gold'});
  raOctPavilionRoof(0,yDeck+chH+2.58,-.6,4.1,4,{style:'lower-ria',seg:8,mk:'emerald',trimMk:'gold',soffitMk:'teak',tierRise:1.3});

  raTarget(0,yDeck,10.3,'classical-south-portico',true);
  raTarget(0,yDeck,-.6,'central-sala-nam',true);
  raTarget(0,yDeck,-8.5,'classical-pantheon-rotunda',true);
  raTarget(-9.8,yDeck,6.8,'sw-lotus-gazebo',true);
  raTarget(9.8,yDeck,6.8,'se-lotus-gazebo',true);

  raFurnList([
   ['ria_teak_divan',0,yDeck,-2.6,0],
   ['ria_porphyry_table',0,yDeck,-.4,0],
   ['ria_saffron_cushion',-1.2,yDeck,-.4,PI/2],
   ['ria_saffron_cushion',1.2,yDeck,-.4,-PI/2],
   ['ria_uktena_brazier',0,yDeck,1.6,0],
   ['ria_lotus_altar',0,yDeck,-9.5,0],
   ['ria_offering_basin',0,yDeck,-7.5,0],
   ['ria_offering_basin',-9.8,yDeck,6.8,0],
   ['ria_lantern_stand',9.8,yDeck,6.8,0]
  ]);
 }
});

/* 3. Persepolitan Protome Apadana and 7-Tier Konbaung Pyatthat Tribute Hall */
defBuilding({
 key:'ra_west_pyatthat_hall',
 name:'Persepolitan Protome Apadana and 7-Tier Konbaung Pyatthat Tribute Hall',
 seed:7103,w:26,d:24,h:27.0,budget:125000,cut:true,
 front:{x:0,z:11.2,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic','religious'],role:'tribute-hall'},
 build(){
  /* Stepped glazed-lapis & saffron Babylonian Apadana terrace + 4 full-height battered corner pylons */
  const y1=raPlinth(20.8,17.2,1.85,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'paving',
   stepW:3.6,stepRun:3.7,rail:'naga'
  });
  const colH=5.15,yRoof=y1+colH;
  for(const sx of [-9.2,9.2])for(const sz of [-7.4,7.4]){
   raBatteredPylon(sx,sz,2.3,2.3,y1,colH+.36,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }

  /* Achaemenid Persepolitan Apadana Hypostyle Columns with turquoise-and-gold Double-Protome Capitals! */
  for(const sx of [-6.2,-2.2,2.2,6.2])for(const sz of [-6.6,6.6]){
   raColumn(sx,y1,sz,colH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.3,capital:'protome',protomeYaw:0});
  }
  for(const sx of [-8.4,8.4])for(const sz of [-3.6,0,3.6]){
   raColumn(sx,y1,sz,colH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.3,capital:'protome',protomeYaw:PI/2});
  }

  /* Inner crimson-and-lapis sanctuary hall [-5.8..5.8, -4.4..4.4] */
  raWallRing(-5.8,-4.4,5.8,4.4,y1,colH-.32,{
   style:'lower-ria',mk:'crimson',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:0,w:2.2,h:2.75,door:true,name:'tribute-portal'},{at:-3.5,w:1.2,h:1.8,y:1.05,pediment:true},{at:3.5,w:1.2,h:1.8,y:1.05,pediment:true}],
    n:[{at:-3.2,w:1.2,h:1.8,y:1.05},{at:3.2,w:1.2,h:1.8,y:1.05}],
    e:[{at:0,w:1.6,h:2.35,door:true,name:'east-hypostyle-door'}],
    w:[{at:0,w:1.6,h:2.35,door:true,name:'west-hypostyle-door'}]
   }
  });

  /* 50/50 CROWN: Wide Flat Merlon-Crenellated Persepolitan Apadana Roof Terrace + Central 7-Tier Konbaung Pyatthat Spire! */
  const yApadana=raFlatTerraceRoof(0,yRoof,0,18.0,14.2,{
   style:'lower-ria',mk:'travertine',topMk:'paving',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
  });
  raTieredRoof(0,yApadana+.02,0,9.4,8.6,7,{
   style:'lower-ria',mode:'hip',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.78,tierRise:.86,neckH:.34,stepIn:.79,spire:true,spireH:4.8,ceiling:false
  });

  raTarget(0,y1,0,'hypostyle-tribute-hall',true);
  raTarget(0,y1,5.6,'hypostyle-portico',true);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-2.9,0],
   ['ria_uktena_brazier',-2.2,y1,-2.0,0],
   ['ria_uktena_brazier',2.2,y1,-2.0,0],
   ['ria_tribute_chest',-4.2,y1,-2.6,PI/2],
   ['ria_tribute_chest',4.2,y1,-2.6,-PI/2],
   ['ria_tribute_chest',-4.2,y1,1.4,PI/2],
   ['ria_glazed_amphora_rack',4.2,y1,1.4,-PI/2],
   ['ria_porphyry_table',0,y1,.4,0],
   ['ria_saffron_cushion',-1.4,y1,.4,PI/2],
   ['ria_saffron_cushion',1.4,y1,.4,-PI/2],
   ['ria_lantern_stand',-3.2,y1,3.0,0],
   ['ria_lantern_stand',3.2,y1,3.0,0]
  ]);
 }
});

/* 4. Cosmatesque Cloister, Classical Pediment Gate and Rattanakosin Prang Sanctuary */
defBuilding({
 key:'ra_west_prang_cloister',
 name:'Cosmatesque Cloister, Classical Pediment Gate and Rattanakosin Prang Sanctuary',
 seed:7104,w:30,d:30,h:25.0,budget:130000,cut:true,
 front:{x:0,z:14.1,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['religious'],role:'sanctuary',job:'worship'},
 build(){
  /* Stepped river-ghat platform + square Classical-Cosmatesque colonnaded cloister court */
  const yCourt=raPlinth(25.6,24.4,1.1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'travertine',capMk:'travertine',topMk:'paving',
   stepW:4.4,stepRun:2.6,rail:'naga',railOpts:{scale:.9}
  });

  /* Perimeter cloister wall + Cosmatesque Solomonic spiral marble columns + round Classical courtyard arches! */
  const clH=3.7;
  raWallRing(-12.2,-11.6,12.2,11.6,yCourt,clH,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',postMk:'cobalt',
   holes:{
    s:[{at:0,w:2.5,h:2.65,door:true,name:'ghat-gateway'},{at:-6.5,w:1.2,h:1.5,y:1.0,pediment:true},{at:6.5,w:1.2,h:1.5,y:1.0,pediment:true}],
    n:[{at:-5.5,w:1.2,h:1.5,y:1.0},{at:0,w:1.2,h:1.5,y:1.0},{at:5.5,w:1.2,h:1.5,y:1.0}],
    e:[{at:-4.5,w:1.2,h:1.5,y:1.0},{at:4.5,w:1.2,h:1.5,y:1.0}],
    w:[{at:-4.5,w:1.2,h:1.5,y:1.0},{at:4.5,w:1.2,h:1.5,y:1.0}]
   }
  });
  /* Inner courtyard Cosmatesque twisted spiral marble-and-gold colonnades */
  raColonnade(-8.8,9.0,8.8,9.0,yCourt,clH,{style:'lower-ria',n:6,skipMid:1.8,mk:'alabaster',r:.22,spiral:true,spiralMk:'cobalt'});
  raColonnade(-8.8,-9.0,8.8,-9.0,yCourt,clH,{style:'lower-ria',n:6,mk:'alabaster',r:.22,spiral:true,spiralMk:'emerald'});
  raColonnade(-9.4,-6.8,-9.4,6.8,yCourt,clH,{style:'lower-ria',n:5,mk:'alabaster',r:.22,spiral:true,spiralMk:'cobalt'});
  raColonnade(9.4,-6.8,9.4,6.8,yCourt,clH,{style:'lower-ria',n:5,mk:'alabaster',r:.22,spiral:true,spiralMk:'cobalt'});

  /* Flat Classical Balustrade-Crowned Stone Cloister Gallery Roofs (replacing 4 pitched roofs -> 50/50 legibility!) */
  raFlatTerraceRoof(0,yCourt+clH,10.3,24.4,2.6,{style:'lower-ria',mk:'travertine',soffitMk:'teak',parapet:'balustrade'});
  raFlatTerraceRoof(0,yCourt+clH,-10.3,24.4,2.6,{style:'lower-ria',mk:'travertine',soffitMk:'teak',parapet:'balustrade'});
  raFlatTerraceRoof(-10.8,yCourt+clH,0,2.6,17.2,{style:'lower-ria',mk:'travertine',soffitMk:'teak',parapet:'balustrade',skip:'sn'});
  raFlatTerraceRoof(10.8,yCourt+clH,0,2.6,17.2,{style:'lower-ria',mk:'travertine',soffitMk:'teak',parapet:'balustrade',skip:'sn'});

  /* Monumental South Classical Hexastyle Temple Portico & Triangular Pediment framing the Thai Prang! */
  raColonnade(-2.8,12.15,2.8,12.15,yCourt,clH,{style:'lower-ria',n:4,skipMid:1.4,mk:'travertine',friezeMk:'cobalt',r:.23,block:false});
  raClassicalPediment(0,yCourt+clH+.52,10.9,0,6.2,1.55,3.2,{style:'lower-ria',mk:'travertine',tymMk:'cobalt'});

  /* Raised central Prang terrace (yPrang = 2.35 m) + Khmer-Thai Glazed Porcelain Prang & 4 Corner Pranglets! */
  const yPrang=yCourt+1.25;
  raFloorSlab(0,yPrang,-.4,12.6,12.2,{mk:'mosaic',th:1.25});
  svNoWalk(()=>box('cobalt',0,yCourt,-.4,12.9,.42,12.5,P('cobalt')));
  raGrandStair(0,yCourt,7.4,0,yPrang,5.6,2.4,{mk:'alabaster',sideMk:'cobalt',rail:'naga',railOpts:{scale:.75}});

  const cellaH=3.8;
  raWallRing(-3.2,-3.6,3.2,2.8,yPrang,cellaH,{
   style:'lower-ria',mk:'alabaster',socMk:'cobalt',dadoMk:'gold',postMk:'emerald',
   holes:{s:[{at:0,w:1.65,h:2.35,door:true,name:'prang-sanctum-door'}]}
  });
  raCeilingSlab(0,yPrang+cellaH+.02,-.4,6.1,6.1,{mk:'gold',trimMk:'emerald'});
  raPrang(0,yPrang+cellaH+.12,-.4,6.8,17.2,{style:'lower-ria',mk:'alabaster',bandMk:'cobalt',trimMk:'gold',vault:true,openFront:true});

  for(const [px,pz] of [[-4.8,-4.8],[4.8,-4.8],[-4.8,4.0],[4.8,4.0]]){
   raPrang(px,yPrang,pz,2.4,7.2,{style:'lower-ria',mk:'alabaster',bandMk:'emerald',trimMk:'gold',vault:false});
   raWallBlock(px,yPrang,pz,2.2,4.0,2.2,0);
  }

  raTarget(0,yCourt,10.2,'cloister-south-gallery',true);
  raTarget(-10.6,yCourt,0,'cloister-west-gallery',true);
  raTarget(0,yPrang,4.2,'prang-upper-terrace',false);
  raTarget(0,yPrang,-.5,'prang-inner-cella',true);

  raFurnList([
   ['ria_lotus_altar',0,yPrang,-2.1,0],
   ['ria_uktena_brazier',-1.8,yPrang,1.2,0],
   ['ria_uktena_brazier',1.8,yPrang,1.2,0],
   ['ria_offering_basin',-5.6,yCourt,6.4,0],
   ['ria_offering_basin',5.6,yCourt,6.4,0],
   ['ria_saffron_cushion',-10.6,yCourt,-3.2,PI/2],
   ['ria_saffron_cushion',-10.6,yCourt,3.2,PI/2],
   ['ria_saffron_cushion',10.6,yCourt,-3.2,-PI/2],
   ['ria_saffron_cushion',10.6,yCourt,3.2,-PI/2],
   ['ria_lantern_stand',-3.4,yCourt,10.2,0],
   ['ria_lantern_stand',3.4,yCourt,10.2,0]
  ]);
 }
});
