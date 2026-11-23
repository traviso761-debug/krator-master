// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — COURT & SACRED MONUMENTS (1-4)
// Fusion grammar: kiln-fired Babylonian polychrome glazed-brick battered pylons (cobalt-lapis, emerald-celadon, saffron-gold) +
// Classical fluted travertine arcades + Egyptian cavetto cornices, crowned by 3-to-7-tier Thai Rattanakosin Prasat & Burmese
// Konbaung Pyatthat glazed-tile roofs, upturned gilded chofa/hang hong flame-finials, and 5-Headed Uktena Naga balustrades.

/* 1. Chakri-Ishtar Grand Sovereign Prasat Palace (image_3.png, image_4.png, image_13.png) */
defBuilding({
 key:'ra_west_prasat_palace',
 name:'Chakri-Ishtar Grand Sovereign Prasat Palace',
 seed:7101,w:36,d:28,h:27.5,budget:135000,cut:true,
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

  /* Twin Babylonian cobalt-glazed corner bastion pylons anchoring the lower terrace */
  for(const sx of [-13.2,13.2]){
   raBatteredPylon(sx,-6.8,3.6,3.6,y1,8.6,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'emerald'});
  }

  /* Ground-floor Classical fluted travertine round-arch front loggia + tripartite masonry palace halls */
  const gh=4.4,y2=y1+gh;
  raArcade(-13.4,8.4,13.4,8.4,y1,gh,{style:'lower-ria',bays:7,mk:'travertine',trimMk:'cobalt',pierW:.58});
  raCeilingSlab(0,y2-.14,6.8,26.8,2.8,{mk:'teak',trimMk:'gold'});

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
  /* Internal tripartite cross-walls with wide arched portals */
  for(const ix of [-5.2,5.2]){
   raWall(ix,-7.2,ix,4.8,y1,gh,{
    style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',
    holes:[{at:6.0,w:1.9,h:2.6,door:true,open:true}]
   });
  }

  /* Interior grand stair in East Wing ascending from y1 (2.0) to 2nd-storey gallery y2 (6.4) */
  const st=svStair(9.2,-5.6,y1,y2,0,{w:1.35,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-1.2,24.8,12.8,{mk:'mosaic',th:.2,hole:st});
  /* Ground ceiling under the non-stair bays so looking up from ground throne hall shows gilded teak coffers */
  raCeilingSlab(0,y2-.26,-1.2,9.8,12.2,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(-8.8,y2-.26,-1.2,6.4,12.2,{mk:'teak',trimMk:'gold'});

  /* Second-storey Classical-Siamese State Gallery & Peristyle [-11.8..11.8, -6.8..4.6] */
  const uh=3.9,yRoof=y2+uh;
  raWallRing(-11.8,-6.8,11.8,4.6,y2,uh,{
   style:'lower-ria',mk:'travertine',socMk:'emerald',dadoMk:'gold',postMk:'cobalt',
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
  /* Projecting gilded balcony over central entrance on 2nd floor */
  raFloorSlab(0,y2,5.6,5.6,1.8,{mk:'travertine',th:.16});
  svNoWalk(()=>{
   box('gold',0,y2+.01,6.42,5.6,.86,.1,P('gold'));
   for(const sx of [-2.75,2.75])box('gold',sx,y2+.01,5.6,.1,.86,1.6,P('gold'));
  });

  /* THREE SOARING GILDED PRASAT CROWNS: 5-tier central Prasat + twin 4-tier flanking Prasat spires! */
  raTieredRoof(0,yRoof,-1.1,11.6,12.2,5,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.85,tierRise:1.12,neckH:.48,stepIn:.76,spire:true,spireH:5.8
  });
  for(const sx of [-8.8,8.8]){
   raTieredRoof(sx,yRoof,-1.1,7.2,11.2,4,{
    style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'cobalt',
    over:.68,tierRise:.96,neckH:.4,stepIn:.75,spire:true,spireH:4.2
   });
  }

  raBanner(-4.2,y1,8.9,0,3.8,P('silkCrimson'),false);
  raBanner(4.2,y1,8.9,0,3.8,P('silkSaffron'),false);

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

/* 2. Emerald-Celadon Star Sala-Nam Water-Pavilion Complex (image.png, image_12.png) */
defBuilding({
 key:'ra_west_lotus_pavilion',
 name:'Emerald-Celadon Star Sala-Nam Water-Pavilion Complex',
 seed:7102,w:32,d:28,h:18.5,budget:125000,cut:true,
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

  /* South entrance stone ghat dock rising to boardwalk deck yDeck = 1.15 m */
  const yDeck=1.15;
  raFloorSlab(0,yDeck,10.3,5.2,2.8,{mk:'travertine',th:.26});
  raGrandStair(0,0,13.5,0,yDeck,11.5,3.0,{mk:'travertine',sideMk:'emerald',rail:'naga',railOpts:{scale:.85}});

  /* Central Star / Cruciform Sala-Nam island deck + 4 corner hexagonal gazebo decks */
  raFloorSlab(0,yDeck,-1.2,11.6,11.6,{mk:'floor',th:.24});
  for(const [wx,wz,ww,wd] of [[0,5.2,4.8,2.4],[0,-7.6,4.8,2.4],[-6.4,-1.2,2.4,4.8],[6.4,-1.2,2.4,4.8]]){
   raFloorSlab(wx,yDeck,wz,ww,wd,{mk:'floor',th:.22});
  }
  /* Glazed emerald-and-cobalt submerged piers supporting the central pavilion */
  svNoWalk(()=>{
   for(const sx of [-4.8,0,4.8])for(const sz of [-6.0,-1.2,3.6]){
    cyl('cobalt',sx,-.3,sz,.32,yDeck+.05,P('cobalt'),10);
   }
  });

  /* Serpentine / angled gilt-teak boardwalks linking entrance dock, central Sala-Nam and 4 corner gazebos! */
  raBoardwalk(0,9.4,0,6.4,-.25,yDeck,2.2,{postMk:'crimson',railMk:'gold'});
  const corners=[[-9.8,6.8],[9.8,6.8],[-9.8,-8.2],[9.8,-8.2]];
  for(const [gx,gz] of corners){
   raFloorDisc(gx,gz,2.45,yDeck,'floor',P('floor'),{seg:6,th:.2});
   svNoWalk(()=>cyl('emerald',gx,-.3,gz,.38,yDeck+.1,P('emerald'),8));
   /* Hexagonal columns + 2-tier emerald-and-gold gazebo roof (with inward soffit!) */
   for(let k=0;k<6;k++){
    const a=k/6*TAU+.26;
    raColumn(gx+Math.cos(a)*2.05,yDeck,gz+Math.sin(a)*2.05,2.95,{style:'lower-ria',mk:'crimson',capMk:'gold',baseMk:'emerald',r:.15,block:false});
   }
   raOctPavilionRoof(gx,yDeck+2.95,gz,2.75,2,{style:'lower-ria',seg:6,mk:'emerald',trimMk:'gold',soffitMk:'teak',tierRise:.95});
  }
  /* Connect all 4 hexagonal gazebos by angled gilt-teak boardwalks */
  raBoardwalk(-2.0,10.2,-9.2,7.1,-.25,yDeck,1.7,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(2.0,10.2,9.2,7.1,-.25,yDeck,1.7,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(-9.6,5.2,-6.6,-1.2,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(9.6,5.2,6.6,-1.2,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(-6.6,-1.2,-9.6,-6.8,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});
  raBoardwalk(6.6,-1.2,9.6,-6.8,-.25,yDeck,1.65,{postMk:'crimson',railMk:'gold'});

  /* Central Cruciform Sala-Nam Pavilion: carved teak & crimson inner chamber + open perimeter colonnade */
  const chH=3.75;
  for(const sx of [-5.1,5.1])for(const sz of [-6.3,-2.9,.5,3.9]){
   raColumn(sx,yDeck,sz,chH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'emerald',r:.2});
  }
  raWallRing(-3.6,-4.8,3.6,2.4,yDeck,chH,{
   style:'lower-ria',mk:'carvedwood',col:P('teak'),socMk:'emerald',dadoMk:'gold',postMk:'crimson',
   holes:{
    s:[{at:0,w:1.8,h:2.35,door:true,name:'sala-south-door'}],
    n:[{at:0,w:1.6,h:2.3,door:true,name:'sala-north-door'}],
    e:[{at:-1.2,w:1.5,h:2.25,door:true,open:true}],
    w:[{at:-1.2,w:1.5,h:2.25,door:true,open:true}]
   }
  });

  /* Star multi-gabled emerald-celadon wings + soaring 4-tier octagonal emerald & gold central spire roof! */
  raTieredRoof(0,yDeck+chH,-1.2,11.4,6.4,2,{style:'lower-ria',mode:'gable',gableAxis:'x',mk:'emerald',trimMk:'gold',soffitMk:'teak',over:.65,tierRise:1.05});
  raTieredRoof(0,yDeck+chH,-1.2,6.4,12.2,2,{style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',over:.65,tierRise:1.05,ceiling:false});
  raCeilingSlab(0,yDeck+chH+.02,-1.2,11.0,11.4,{mk:'teak',trimMk:'gold'});
  raOctPavilionRoof(0,yDeck+chH+2.65,-1.2,4.4,4,{style:'lower-ria',seg:8,mk:'emerald',trimMk:'gold',soffitMk:'teak',tierRise:1.35});

  raTarget(0,yDeck,-1.2,'central-sala-nam',true);
  raTarget(-9.8,yDeck,6.8,'sw-lotus-gazebo',true);
  raTarget(9.8,yDeck,6.8,'se-lotus-gazebo',true);
  raTarget(-9.8,yDeck,-8.2,'nw-lotus-gazebo',true);
  raTarget(9.8,yDeck,-8.2,'ne-lotus-gazebo',true);

  raFurnList([
   ['ria_teak_divan',0,yDeck,-3.2,0],
   ['ria_porphyry_table',0,yDeck,-.8,0],
   ['ria_saffron_cushion',-1.2,yDeck,-.8,PI/2],
   ['ria_saffron_cushion',1.2,yDeck,-.8,-PI/2],
   ['ria_uktena_brazier',0,yDeck,1.2,0],
   ['ria_offering_basin',-9.8,yDeck,6.8,0],
   ['ria_lantern_stand',9.8,yDeck,6.8,0],
   ['ria_saffron_cushion',-9.8,yDeck,-8.2,0],
   ['ria_saffron_cushion',9.8,yDeck,-8.2,0]
  ]);
 }
});

/* 3. Konbaung-Babylon Crimson-Teak 7-Tier Pyatthat Tribute Hall (image_10.png, image_11.png) */
defBuilding({
 key:'ra_west_pyatthat_hall',
 name:'Konbaung-Babylon Crimson-Teak 7-Tier Pyatthat Tribute Hall',
 seed:7103,w:26,d:24,h:27.0,budget:115000,cut:true,
 front:{x:0,z:11.2,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic','religious'],role:'tribute-hall'},
 build(){
  /* Stepped glazed-lapis & saffron brick Babylonian terrace + corner battered pylons */
  const y1=raPlinth(20.8,17.2,1.85,{
   style:'lower-ria',baseMk:'cobalt',midMk:'saffron',capMk:'travertine',topMk:'paving',
   stepW:3.6,stepRun:3.7,rail:'naga'
  });
  for(const sx of [-9.4,9.4])for(const sz of [-7.6,7.6]){
   raBatteredPylon(sx,sz,2.2,2.2,y1,2.2,{style:'lower-ria',mk:'cobalt',bandMk:'gold',relMk:'emerald'});
  }

  /* Colossal vermilion-crimson & gold Hypostyle teak columns rising 5.2 m around the tribute hall */
  const colH=5.1,yRoof=y1+colH;
  for(const sx of [-8.2,-4.2,0,4.2,8.2])for(const sz of [-6.4,6.4]){
   if(sz>0&&Math.abs(sx)<1.0)continue;
   raColumn(sx,y1,sz,colH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.3});
  }
  for(const sx of [-8.2,8.2])for(const sz of [-2.2,2.2]){
   raColumn(sx,y1,sz,colH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.3});
  }

  /* Inner crimson-and-teak sanctuary hall [-6.4..6.4, -4.8..4.6] + full peristyle ceiling so Hypostyle hall has 0 sky leaks */
  raCeilingSlab(0,yRoof-.08,0,17.2,13.6,{mk:'teak',trimMk:'gold'});
  raWallRing(-6.4,-4.8,6.4,4.6,y1,colH-.32,{
   style:'lower-ria',mk:'crimson',socMk:'cobalt',dadoMk:'gold',postMk:'teak',
   holes:{
    s:[{at:0,w:2.2,h:2.75,door:true,name:'tribute-portal'},{at:-3.8,w:1.2,h:1.8,y:1.05,pediment:true},{at:3.8,w:1.2,h:1.8,y:1.05,pediment:true}],
    n:[{at:-3.4,w:1.2,h:1.8,y:1.05},{at:3.4,w:1.2,h:1.8,y:1.05}],
    e:[{at:0,w:1.6,h:2.35,door:true,name:'east-hypostyle-door'}],
    w:[{at:0,w:1.6,h:2.35,door:true,name:'west-hypostyle-door'}]
   }
  });

  /* Dramatic 7-Tiered Burmese Konbaung Pyatthat roof with filigree gold Hti spire! */
  raTieredRoof(0,yRoof,0,15.6,13.2,7,{
   style:'lower-ria',mode:'hip',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.95,tierRise:.92,neckH:.38,stepIn:.79,spire:true,spireH:5.0
  });

  raTarget(0,y1,0,'hypostyle-tribute-hall',true);
  raTarget(0,y1,5.6,'hypostyle-portico',true);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-3.1,0],
   ['ria_uktena_brazier',-2.2,y1,-2.2,0],
   ['ria_uktena_brazier',2.2,y1,-2.2,0],
   ['ria_tribute_chest',-4.6,y1,-2.8,PI/2],
   ['ria_tribute_chest',4.6,y1,-2.8,-PI/2],
   ['ria_tribute_chest',-4.6,y1,1.4,PI/2],
   ['ria_glazed_amphora_rack',4.6,y1,1.4,-PI/2],
   ['ria_porphyry_table',0,y1,.4,0],
   ['ria_saffron_cushion',-1.4,y1,.4,PI/2],
   ['ria_saffron_cushion',1.4,y1,.4,-PI/2],
   ['ria_lantern_stand',-3.2,y1,3.2,0],
   ['ria_lantern_stand',3.2,y1,3.2,0]
  ]);
 }
});

/* 4. Rattanakosin River-Ghat Prang and Colonnaded Sanctuary (image_7.png, image_8.png) */
defBuilding({
 key:'ra_west_prang_cloister',
 name:'Rattanakosin River-Ghat Prang and Colonnaded Sanctuary',
 seed:7104,w:30,d:30,h:25.0,budget:125000,cut:true,
 front:{x:0,z:14.1,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['religious'],role:'sanctuary',job:'worship'},
 build(){
  /* Stepped river-ghat platform + square Classical-Thai colonnaded cloister court */
  const yCourt=raPlinth(25.6,24.4,1.1,{
   style:'lower-ria',baseMk:'cobalt',midMk:'travertine',capMk:'travertine',topMk:'paving',
   stepW:4.4,stepRun:2.6,rail:'naga',railOpts:{scale:.9}
  });

  /* Perimeter cloister wall + inward colonnade + 4 roofed cloister galleries (with solid teak ceilings) */
  const clH=3.6;
  raWallRing(-12.2,-11.6,12.2,11.6,yCourt,clH,{
   style:'lower-ria',mk:'plaster',socMk:'cobalt',dadoMk:'emerald',postMk:'travertine',
   holes:{
    s:[{at:0,w:2.5,h:2.65,door:true,name:'ghat-gateway'},{at:-6.5,w:1.2,h:1.5,y:1.0},{at:6.5,w:1.2,h:1.5,y:1.0}],
    n:[{at:-5.5,w:1.2,h:1.5,y:1.0},{at:0,w:1.2,h:1.5,y:1.0},{at:5.5,w:1.2,h:1.5,y:1.0}],
    e:[{at:-4.5,w:1.2,h:1.5,y:1.0},{at:4.5,w:1.2,h:1.5,y:1.0}],
    w:[{at:-4.5,w:1.2,h:1.5,y:1.0},{at:4.5,w:1.2,h:1.5,y:1.0}]
   }
  });
  /* Inner cloister colonnades framing the open sanctuary court */
  raColonnade(-8.8,9.0,8.8,9.0,yCourt,clH,{style:'lower-ria',n:6,skipMid:1.8,r:.21});
  raColonnade(-8.8,-9.0,8.8,-9.0,yCourt,clH,{style:'lower-ria',n:6,r:.21});
  raColonnade(-9.4,-6.8,-9.4,6.8,yCourt,clH,{style:'lower-ria',n:5,r:.21});
  raColonnade(9.4,-6.8,9.4,6.8,yCourt,clH,{style:'lower-ria',n:5,r:.21});

  /* Cloister gallery roofs + gilded South Gopura entrance gable */
  raTieredRoof(0,yCourt+clH,10.3,24.4,2.8,1,{style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',over:.42,tierRise:1.0});
  raTieredRoof(0,yCourt+clH,-10.3,24.4,2.8,1,{style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',over:.42,tierRise:1.0});
  raTieredRoof(-10.8,yCourt+clH,0,2.8,18.2,1,{style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'gold',soffitMk:'teak',over:.42,tierRise:1.0});
  raTieredRoof(10.8,yCourt+clH,0,2.8,18.2,1,{style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'gold',soffitMk:'teak',over:.42,tierRise:1.0});
  raTieredRoof(0,yCourt+clH+1.1,10.3,5.2,3.4,2,{style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',over:.45,tierRise:1.05});

  /* Raised central Prang terrace (y2 = 2.35 m) reached by front stair from court */
  const yPrang=yCourt+1.25;
  raFloorSlab(0,yPrang,-.4,12.6,12.2,{mk:'mosaic',th:1.25});
  svNoWalk(()=>box('cobalt',0,yCourt,-.4,12.9,.42,12.5,P('cobalt')));
  raGrandStair(0,yCourt,7.4,0,yPrang,5.6,2.4,{mk:'alabaster',sideMk:'cobalt',rail:'naga',railOpts:{scale:.75}});

  /* Central hollow Khmer-Thai porcelain/glazed-brick Prang cella + 4 corner Pranglets! */
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
