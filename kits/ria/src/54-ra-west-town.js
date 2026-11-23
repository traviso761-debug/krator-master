// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — WATERWORKS, WATCH & DWELLINGS (5-8)
// Implements Ishtar-Pyatthat Fortified Canal Water-Gate, Mandalay-Ziggurat Helical Glazed-Brick River Watchtower,
// Riwa-Toka Classical Arcade & Teak-Veranda Merchant Mansion, and Heartland Ruan-Thai Raised Teak Stilt House.

/* 5. Ishtar-Pyatthat Fortified Canal Water-Gate and Covered Bridge (image_9.png, image_2.png) */
defBuilding({
 key:'ra_west_water_gate',
 name:'Ishtar-Pyatthat Fortified Canal Water-Gate and Covered Bridge',
 seed:7105,w:28,d:22,h:22.0,budget:115000,cut:true,
 front:{x:-8.2,z:9.6,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['infrastructure','military'],role:'water-gate',job:'customs'},
 build(){
  /* Central navigable canal channel [-4.0..4.0] flowing N-S through the fortified water-gate */
  raWaterCourt(0,0,8.2,19.6,.28,.75,{style:'lower-ria',curbMk:'travertine',trimMk:'cobalt',lotus:4,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[0,.08,-9.2],[0,.08,0],[0,.08,9.2]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'ishtar-canal-gate',pts:wPts,width:7.2,speed:.45};
  }

  /* West & East stone quays at y1 = 0.55 m + twin hollow Babylonian cobalt-glazed serpent-relief bastion pylons */
  const yQuay=.55,yBridge=5.2;
  for(const s of [-1,1]){
   const qx=s*8.2;
   raFloorSlab(qx+s*.6,yQuay,0,9.4,17.2,{mk:'paving',th:.55});
   raGrandStair(qx,0,9.8,qx,yQuay,8.6,2.8,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.7}});

   /* Hollow lower bastion guardroom [-11.2..-5.2] / [5.2..11.2], z in [-4.8..4.8] */
   raWallRing(qx-3.0,-4.8,qx+3.0,4.8,yQuay,yBridge-yQuay,{
    style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'saffron',postMk:'emerald',
    holes:{
     s:[{at:qx,w:1.65,h:2.35,door:true,name:s<0?'west-pylon-door':'east-pylon-door'}],
     n:[{at:qx,w:1.1,h:1.4,y:1.2}]
    }
   });
   /* Decorative Babylonian serpent relief plaques on canal & outer faces */
   svNoWalk(()=>{
    box('saffron',qx-s*3.08,yQuay+1.3,0,.06,2.1,4.6,P('saffron'));
    box('emerald',qx+s*3.08,yQuay+1.3,0,.06,2.1,4.6,P('emerald'));
   });
   /* Exterior stone stair along outer flank (x = +-12.15, outside pylon wall!) climbing from yQuay to yBridge */
   raGrandStair(qx+s*3.95,yQuay,7.4,qx+s*3.95,yBridge,1.2,1.55,{
    mk:'travertine',sideMk:'cobalt',openUnder:true,cheek:true
   });
  }
  /* Ceiling slabs inside both lower pylon guardrooms */
  raCeilingSlab(-8.2,yBridge-.24,0,5.4,9.0,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(8.2,yBridge-.24,0,5.4,9.0,{mk:'teak',trimMk:'gold'});

  /* Elevated Covered Burmese Multi-Pyatthat Teak Bridge-Gallery spanning across the canal [-13.1..13.1, -3.8..3.8] */
  raFloorSlab(0,yBridge,0,26.2,7.6,{mk:'floor',th:.24});
  /* Massive arched corbel brackets over the canal waterway */
  svNoWalk(()=>{
   for(const sz of [-2.8,2.8]){
    beam('crimson',[-4.2,yBridge-1.8,sz],[-1.2,yBridge-.24,sz],.34,P('crimson'));
    beam('crimson',[4.2,yBridge-1.8,sz],[1.2,yBridge-.24,sz],.34,P('crimson'));
    box('gold',0,yBridge-.48,sz,8.4,.22,.38,P('gold'));
   }
   /* Bridge gallery balustrades along N and S faces (with openings at the E/W stair landings on +z!) */
   box('carvedwood',0,yBridge+.01,-3.65,22.4,.92,.14,P('carvedGilt'));
   box('carvedwood',0,yBridge+.01,3.65,14.2,.92,.14,P('carvedGilt'));
  });
  /* Teak gallery columns supporting the 3 gilded Pyatthat spires */
  const galH=3.5;
  for(const bx of [-10.4,-6.2,-2.4,2.4,6.2,10.4])for(const bz of [-3.4,3.4]){
   raColumn(bx,yBridge,bz,galH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.2,block:false});
  }
  /* Continuous bridge-gallery roof + 3 Gilded Tiered Pyatthat Spires (5-tier center + twin 3-tier pylon spires) */
  raTieredRoof(0,yBridge+galH,0,22.8,7.4,2,{style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',over:.55,tierRise:.95});
  raTieredRoof(0,yBridge+galH+2.1,0,7.8,7.6,5,{style:'lower-ria',mode:'hip',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',over:.5,tierRise:.82,neckH:.34,spire:true,spireH:4.0});
  for(const sx of [-8.2,8.2]){
   raTieredRoof(sx,yBridge+galH+2.1,0,5.8,6.6,3,{style:'lower-ria',mode:'hip',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'cobalt',over:.45,tierRise:.78,neckH:.32,spire:true,spireH:3.0});
  }

  raTarget(-8.2,yQuay,0,'west-pylon-guardroom',true);
  raTarget(8.2,yQuay,0,'east-pylon-customs',true);
  raTarget(0,yBridge,0,'canal-bridge-gallery',true);

  raFurnList([
   ['ria_amber_seal_desk',-8.2,yQuay,-2.2,0],
   ['ria_tribute_chest',-8.2,yQuay,2.0,PI],
   ['ria_glazed_amphora_rack',8.2,yQuay,-2.2,0],
   ['ria_tribute_chest',8.2,yQuay,2.0,PI],
   ['ria_uktena_brazier',0,yBridge,-1.8,0],
   ['ria_porphyry_table',-4.2,yBridge,0,PI/2],
   ['ria_lantern_stand',4.2,yBridge,-1.6,0],
   ['ria_lantern_stand',-4.2,yBridge,1.6,0]
  ]);
 }
});

/* 6. Mandalay-Ziggurat Helical Glazed-Brick River Watchtower (image_11.png spiral tower) */
defBuilding({
 key:'ra_west_spiral_beacon',
 name:'Mandalay-Ziggurat Helical Glazed-Brick River Watchtower',
 seed:7106,w:19,d:19,h:23.5,budget:95000,cut:true,
 front:{x:0,z:8.4,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure','military'],role:'beacon'},
 build(){
  /* Circular stepped cobalt & travertine ziggurat base */
  const y1=1.05;
  svNoWalk(()=>{
   cyl('cobalt',0,0,0,7.8,.52,P('cobalt'),24);
   cyl('travertine',0,.52,0,7.3,.53,P('travertine'),24);
  });
  raFloorDisc(0,0,7.2,y1,'paving',P('paving'),{seg:24,th:.16});
  raGrandStair(0,0,8.7,0,y1,7.0,2.6,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.72}});

  /* Cylindrical kiln-fired brick & cobalt-lapis frieze watchtower core (rIn=3.4, rOut=4.4, h=11.0 m -> yTop=12.05 m) */
  const tH=11.0,yTop=y1+tH;
  raDrumWall(0,0,3.4,4.4,y1,tH,'brick',P('brick'),[
   {a:PI/2,w:1.55,h:2.3,door:true,name:'watchtower-door'},
   {a:0,w:1.0,h:1.3,y:2.2},
   {a:PI,w:1.0,h:1.3,y:4.8},
   {a:-PI/2,w:1.0,h:1.3,y:7.4}
  ],{style:'lower-ria'});

  /* Kiln-fired lapis-cobalt & saffron glazed decorative bands stepped +3 cm outside brick drum */
  svNoWalk(()=>{
   for(const fy of [3.6,7.2,10.4]){
    cyl('cobalt',0,y1+fy,0,4.44,.32,P('cobalt'),24);
    cyl('saffron',0,y1+fy+.32,0,4.46,.14,P('saffron'),24);
   }
  });
  /* Solid interior ceiling over ground-floor guard chamber at y1 + 4.2 m */
  svNoWalk(()=>cyl('teak',0,y1+4.2,0,3.38,.14,P('teak'),20));

  /* Continuous walkable exterior arcaded helical ramp climbing from a = PI/2 + 0.45 up 1.35 turns to yTop! */
  const a0=PI/2+.48,sweep=TAU*1.32;
  raSpiralRamp(0,0,4.45,1.65,y1,yTop,a0,sweep,{mk:'travertine',paraMk:'cobalt'});
  /* Top circular watch-deck + perimeter gilded parapet (leaving clean arrival gap at a0 + sweep) */
  raFloorDisc(0,0,6.05,yTop,'mosaic',P('mosaic'),{seg:24,th:.2});
  const aArr=(a0+sweep)%TAU;
  svNoWalk(()=>{
   sector('cobalt',0,0,5.82,6.06,aArr+.32,aArr+TAU-.32,yTop+.01,yTop+.88,P('cobalt'),20);
  });

  /* Gilded 3-Tier Pyatthat Beacon Pavilion crowning the watchtower (with inward ceiling soffit!) */
  for(let k=0;k<8;k++){
   const a=k/8*TAU;
   raColumn(Math.cos(a)*2.85,yTop,Math.sin(a)*2.85,3.2,{style:'lower-ria',mk:'crimson',capMk:'gold',baseMk:'cobalt',r:.18,block:false});
  }
  raOctPavilionRoof(0,yTop+3.2,0,3.6,3,{style:'lower-ria',seg:8,mk:'giltroof',trimMk:'gold',soffitMk:'teak',tierRise:1.3});
  smokeAt(0,yTop+1.35,0,{r:.32,kind:'fire'});
  haloAt(0,yTop+1.2,0,0xffbc58,true);

  raTarget(0,y1,0,'watchtower-guardroom',true);
  raTarget(0,yTop,0,'beacon-crown-deck',true);

  raFurnList([
   ['ria_amber_seal_desk',-1.4,y1,-1.2,PI/4],
   ['ria_teak_divan',1.4,y1,-1.1,-PI/2],
   ['ria_tribute_chest',0,y1,-2.2,0],
   ['ria_glazed_amphora_rack',-1.8,y1,.9,PI/2],
   ['ria_uktena_brazier',0,yTop,0,0],
   ['ria_lantern_stand',1.8,yTop,1.6,0]
  ]);
 }
});

/* 7. Riwa-Toka Classical Arcade and Teak-Veranda Merchant Mansion (image_2.png Indo-Classical/Sino-Siamese villa) */
defBuilding({
 key:'ra_west_arcade_villa',
 name:'Riwa-Toka Classical Arcade and Teak-Veranda Merchant Mansion',
 seed:7107,w:22,d:19,h:15.0,budget:95000,cut:true,
 front:{x:0,z:8.6,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['dwelling-single','shop'],role:'mansion',job:'trading'},
 build(){
  const y1=raPlinth(18.4,14.2,.75,{
   style:'lower-ria',baseMk:'cobalt',midMk:'emerald',capMk:'travertine',topMk:'paving',
   stepW:3.0,stepRun:1.6,rail:'naga',railOpts:{scale:.68}
  });

  /* Ground-floor rusticated Classical round-arch loggia around the merchant counting-house */
  const gh=3.85,y2=y1+gh;
  raArcade(-8.6,6.5,8.6,6.5,y1,gh,{style:'lower-ria',bays:5,mk:'travertine',trimMk:'celadon',pierW:.52});
  raArcade(-8.6,-6.5,8.6,-6.5,y1,gh,{style:'lower-ria',bays:5,mk:'travertine',trimMk:'celadon',pierW:.52});
  raArcade(-8.6,-6.5,-8.6,6.5,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'celadon',pierW:.52});
  raArcade(8.6,-6.5,8.6,6.5,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'celadon',pierW:.52});

  /* Inner counting-house walls [-6.2..6.2, -4.4..4.4] */
  raWallRing(-6.2,-4.4,6.2,4.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'emerald',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:0,w:1.8,h:2.4,door:true,name:'counting-house-door'},{at:-3.6,w:1.2,h:1.5,y:1.0},{at:3.6,w:1.2,h:1.5,y:1.0}],
    n:[{at:-3.2,w:1.2,h:1.5,y:1.0},{at:3.2,w:1.2,h:1.5,y:1.0}],
    e:[{at:0,w:1.4,h:2.25,door:true,name:'loggia-east-door'}],
    w:[{at:0,w:1.4,h:2.25,door:true,name:'loggia-west-door'}]
   }
  });

  /* Interior teak stair climbing to 2nd-storey wraparound veranda & salon */
  const st=svStair(4.4,-3.2,y1,y2,0,{w:1.15,riser:.18,going:.26,mk:'teak',smk:'crimson',col:P('teak'),scol:P('crimson'),rail:'both'});
  raFloorSlab(0,y2,0,17.8,13.6,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-1.2,y2-.24,0,9.4,8.2,{mk:'teak',trimMk:'gold'});

  /* Second-storey wraparound carved-teak veranda balustrade + columns + upper salon */
  const uh=3.45,yRoof=y2+uh;
  svNoWalk(()=>{
   for(const sz of [-6.65,6.65])box('carvedwood',0,y2+.01,sz,17.4,.88,.1,P('teak'));
   for(const sx of [-8.75,8.75])box('carvedwood',sx,y2+.01,0,.1,.88,13.2,P('teak'));
  });
  for(const sx of [-8.5,-4.2,0,4.2,8.5])for(const sz of [-6.5,6.5]){
   raColumn(sx,y2,sz,uh,{style:'lower-ria',mk:'teak',capMk:'gold',baseMk:'celadon',r:.17,block:false});
  }
  raWallRing(-5.8,-4.0,5.8,4.0,y2,uh,{
   style:'lower-ria',mk:'carvedwood',col:P('teakL'),socMk:'crimson',dadoMk:'gold',postMk:'teak',
   holes:{
    s:[{at:0,w:1.65,h:2.25,door:true,name:'veranda-salon-door'},{at:-3.4,w:1.2,h:1.45,y:.95},{at:3.4,w:1.2,h:1.45,y:.95}],
    n:[{at:-2.8,w:1.2,h:1.45,y:.95},{at:2.8,w:1.2,h:1.45,y:.95}],
    e:[{at:0,w:1.4,h:2.15,door:true,open:true}],
    w:[{at:0,w:1.2,h:1.45,y:.95}]
   }
  });

  /* 3-Tier Celadon & Terracotta Thai Gable Roof with solid coffered teak ceiling over entire veranda + salon */
  raTieredRoof(0,yRoof,0,17.8,13.6,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'celadon',
   over:.72,tierRise:1.08,neckH:.42,stepIn:.76
  });

  raTarget(0,y1,5.4,'ground-arcade-loggia',true);
  raTarget(-1.2,y1,0,'merchant-counting-house',true);
  raTarget(-1.2,y2,0,'upper-merchant-salon',true);
  raTarget(0,y2,5.4,'upper-teak-veranda',true);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,-1.8,0],
   ['ria_glazed_amphora_rack',-4.8,y1,.8,PI/2],
   ['ria_glazed_amphora_rack',-4.8,y1,-2.2,PI/2],
   ['ria_tribute_chest',1.2,y1,-2.8,0],
   ['ria_teak_divan',-2.6,y2,-2.2,0],
   ['ria_porphyry_table',-2.2,y2,.4,0],
   ['ria_saffron_cushion',-2.2,y2,1.6,PI],
   ['ria_silk_screen',1.4,y2,-2.4,-.2],
   ['ria_lantern_stand',-6.8,y2,5.2,0]
  ]);
 }
});

/* 8. Heartland Ruan-Thai Raised Teak House on Glazed-Brick Flood Piers (image_2.png stilt houses) */
defBuilding({
 key:'ra_west_stilt_house',
 name:'Heartland Ruan-Thai Raised Teak House on Glazed-Brick Flood Piers',
 seed:7108,w:18,d:18,h:13.4,budget:80000,cut:true,
 front:{x:0,z:8.1,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['dwelling-single'],role:'house'},
 build(){
  /* Ground paved boat/storage pad + 12 glazed-brick & lotus-capital flood piers lifting the chaan deck to y1 = 2.65 m */
  const yChaan=2.65;
  raFloorSlab(0,.12,-.8,14.8,11.6,{mk:'paving',th:.12});
  for(const px of [-6.4,-2.2,2.2,6.4])for(const pz of [-6.0,-1.0,4.0]){
   raColumn(px,.12,pz,yChaan-.28,{style:'lower-ria',mk:'cobalt',bandMk:'emerald',capMk:'travertine',baseMk:'travertine',r:.24});
  }

  /* Elevated central airy teak chaan deck + wide gentle exterior front stair (run = 4.2 m for 2.53 m rise) */
  raFloorSlab(0,yChaan,-1.0,14.4,11.2,{mk:'floor',th:.2});
  raGrandStair(0,.12,8.0,0,yChaan,3.8,2.2,{mk:'teak',sideMk:'cobalt',openUnder:true,rail:'naga',railOpts:{scale:.68}});

  /* Chaan deck perimeter carved-teak balustrade (leaving stair arrival gap at x in [-1.3..1.3] on +z!) */
  svNoWalk(()=>{
   box('carvedwood',-4.2,yChaan+.01,4.5,5.6,.86,.1,P('teak'));
   box('carvedwood',4.2,yChaan+.01,4.5,5.6,.86,.1,P('teak'));
   box('carvedwood',6.95,yChaan+.01,1.4,.1,.86,6.2,P('teak'));
  });

  /* Main rear Ruan-Thai dark-teak house [-6.6..6.6, -5.8..-0.2] + West kitchen/guest pavilion [-6.8..-2.2, 0.2..4.4] */
  const hCab=3.35;
  raWallRing(-6.6,-5.8,6.6,-.2,yChaan,hCab,{
   style:'lower-ria',mk:'teak',socMk:'crimson',dadoMk:'carvedwood',postMk:'teak',cornice:false,
   holes:{
    s:[{at:0,w:1.65,h:2.2,door:true,leafMk:'carvedwood',crownMk:'gold',name:'ruan-main-door'},{at:-4.0,w:1.15,h:1.35,y:.95},{at:4.0,w:1.15,h:1.35,y:.95}],
    n:[{at:-3.6,w:1.15,h:1.35,y:.95},{at:3.6,w:1.15,h:1.35,y:.95}],
    e:[{at:-3.0,w:1.15,h:1.35,y:.95}],
    w:[{at:-3.0,w:1.15,h:1.35,y:.95}]
   }
  });
  raTieredRoof(0,yChaan+hCab,-3.0,13.4,5.8,2,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'teak',
   over:.72,tierRise:1.45,neckH:.32,stepIn:.76
  });

  raWallRing(-6.8,.4,-2.2,4.6,yChaan,2.95,{
   style:'lower-ria',mk:'teak',socMk:'crimson',dadoMk:'carvedwood',postMk:'teak',cornice:false,
   holes:{
    e:[{at:2.5,w:1.4,h:2.1,door:true,leafMk:'carvedwood',crownMk:'gold',name:'ruan-side-door'}],
    s:[{at:-4.5,w:1.05,h:1.25,y:.9}]
   }
  });
  raTieredRoof(-4.5,yChaan+2.95,2.5,4.8,4.4,2,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'teak',
   over:.58,tierRise:1.18,neckH:.28,stepIn:.76
  });

  raTarget(0,.12,1.6,'under-croft-shade',true);
  raTarget(2.2,yChaan,2.2,'central-chaan-deck',false);
  raTarget(0,yChaan,-3.0,'ruan-thai-main-hall',true);
  raTarget(-4.5,yChaan,2.5,'ruan-side-cabin',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-4.2,.12,-2.2,0],
   ['ria_tribute_chest',4.2,.12,-2.2,0],
   ['ria_teak_divan',-3.6,yChaan,-4.2,0],
   ['ria_porphyry_table',2.4,yChaan,-3.2,0],
   ['ria_saffron_cushion',2.4,yChaan,-2.0,PI],
   ['ria_saffron_cushion',2.4,yChaan,-4.4,0],
   ['ria_offering_basin',3.8,yChaan,2.6,0],
   ['ria_saffron_cushion',-4.5,yChaan,3.4,PI]
  ]);
 }
});
