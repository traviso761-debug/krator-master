// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — WATERWORKS, WATCH & DWELLINGS (5-8)
// 50/50 Balanced Fusion:
//   5. Flat-crenellated Babylonian Lapis-Glazed Ishtar Gate Bastions + Roman Canal Viaduct Arch + Central 5-Tier Burmese Pyatthat Bridge
//   6. Squared Merlon-Crenellated Babylonian-Samarra Helical Ziggurat + Classical Blind-Arch Drum + Gilded Pyatthat Beacon Cupola
//   7. Rusticated Classical Round-Arch Villa + Pedimented Portico + Open Roman Balustrade Roof-Court + Rear Thai Chofa-Gable Salon
//   8. Vaulted Babylonian Glazed-Brick Round-Arch Flood-Loggia + Merlon-Crenellated Court Pavilion + Steep Dark-Teak Ruan-Thai House

/* 5. Ishtar-Pyatthat Crenellated Canal Water-Gate and Covered Bridge */
defBuilding({
 key:'ra_west_water_gate',
 name:'Ishtar-Pyatthat Crenellated Canal Water-Gate and Covered Bridge',
 seed:7105,w:28,d:22,h:22.0,budget:125000,cut:true,
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

  /* West & East stone quays at yQuay = 0.55 m + Towering Flat-Crenellated Babylonian Lapis Ishtar Gate Bastions! */
  const yQuay=.55,yBridge=5.2,yTower=8.95;
  for(const s of [-1,1]){
   const qx=s*8.2;
   raFloorSlab(qx+s*.6,yQuay,0,9.4,17.2,{mk:'paving',th:.55});
   raGrandStair(qx,0,9.8,qx,yQuay,8.6,2.8,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.7}});

   /* Lower bastion guardroom [qx-3.0..qx+3.0, -4.8..4.8] */
   raWallRing(qx-3.0,-4.8,qx+3.0,4.8,yQuay,yBridge-yQuay,{
    style:'lower-ria',mk:'cobalt',socMk:'travertine',dadoMk:'saffron',postMk:'emerald',
    holes:{
     s:[{at:qx,w:1.65,h:2.35,door:true,name:s<0?'west-pylon-door':'east-pylon-door'}],
     n:[{at:qx,w:1.1,h:1.4,y:1.2}]
    }
   });
   /* Upper Ishtar Bastion Tower story [qx-2.85..qx+2.85, -4.4..4.4] with open E/W arched portals for bridge walk! */
   raWallRing(qx-2.85,-4.4,qx+2.85,4.4,yBridge,yTower-yBridge,{
    style:'lower-ria',mk:'cobalt',socMk:'saffron',dadoMk:'emerald',postMk:'travertine',
    holes:{
     e:[{at:0,w:2.5,h:2.7,door:true,open:true}],
     w:[{at:0,w:2.5,h:2.7,door:true,open:true}],
     s:[{at:qx,w:1.25,h:1.6,y:1.05,pediment:true}],
     n:[{at:qx,w:1.25,h:1.6,y:1.05}]
    }
   });
   /* Polychrome Babylonian glazed-brick relief friezes on bastion faces */
   svNoWalk(()=>{
    box('saffron',qx-s*3.08,yQuay+1.3,0,.06,2.1,4.6,P('saffron'));
    box('emerald',qx+s*3.08,yQuay+1.3,0,.06,2.1,4.6,P('emerald'));
    for(const sz of [-4.48,4.48])box('saffron',qx,yBridge+2.4,sz,3.6,.55,.05,P('saffron'));
   });
   /* Flat Merlon-Crenellated Babylonian Ishtar Summit Roof (replacing side pitched roofs -> unmistakable Ishtar towers!) */
   raFlatTerraceRoof(qx,yTower,0,6.1,9.2,{
    style:'lower-ria',mk:'cobalt',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
    parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
   });

   /* Exterior stone stair along outer flank (x = +-12.15) climbing from yQuay to yBridge */
   raGrandStair(qx+s*3.95,yQuay,7.4,qx+s*3.95,yBridge,1.2,1.55,{
    mk:'travertine',sideMk:'cobalt',openUnder:true,cheek:true
   });
  }
  raCeilingSlab(-8.2,yBridge-.24,0,5.4,9.0,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(8.2,yBridge-.24,0,5.4,9.0,{mk:'teak',trimMk:'gold'});

  /* Monumental Roman-Babylonian Round-Arch Masonry Viaduct spanning the canal [-5.1..5.1] */
  raFloorSlab(0,yBridge,0,26.2,7.6,{mk:'floor',th:.24});
  raArcade(-5.0,3.45,5.0,3.45,yQuay,yBridge-yQuay-.24,{style:'lower-ria',bays:1,mk:'travertine',trimMk:'cobalt',pierW:.72,block:false});
  raArcade(-5.0,-3.45,5.0,-3.45,yQuay,yBridge-yQuay-.24,{style:'lower-ria',bays:1,mk:'travertine',trimMk:'cobalt',pierW:.72,block:false});
  raMerlonParapet(-5.1,3.65,5.1,3.65,yBridge,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(5.1,-3.65,-5.1,-3.65,yBridge,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});

  /* Central 5-Tier Gilded Burmese Konbaung Pyatthat Bridge-Pavilion strictly over the canal span! */
  const galH=3.55;
  for(const bx of [-3.8,-1.5,1.5,3.8])for(const bz of [-3.2,3.2]){
   raColumn(bx,yBridge,bz,galH,{style:'lower-ria',mk:'crimson',bandMk:'gold',capMk:'gold',baseMk:'cobalt',r:.2,block:false});
  }
  raTieredRoof(0,yBridge+galH,0,8.4,7.4,5,{
   style:'lower-ria',mode:'hip',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.58,tierRise:.84,neckH:.34,stepIn:.78,spire:true,spireH:4.2
  });

  raTarget(-8.2,yQuay,0,'west-pylon-guardroom',true);
  raTarget(8.2,yQuay,0,'east-pylon-customs',true);
  raTarget(0,yBridge,0,'canal-bridge-gallery',true);

  raFurnList([
   ['ria_amber_seal_desk',-8.2,yQuay,-2.2,0],
   ['ria_tribute_chest',-8.2,yQuay,2.0,PI],
   ['ria_glazed_amphora_rack',8.2,yQuay,-2.2,0],
   ['ria_tribute_chest',8.2,yQuay,2.0,PI],
   ['ria_uktena_brazier',0,yBridge,-1.8,0],
   ['ria_porphyry_table',-2.4,yBridge,0,PI/2],
   ['ria_lantern_stand',2.6,yBridge,-1.6,0],
   ['ria_lantern_stand',-2.6,yBridge,1.6,0]
  ]);
 }
});

/* 6. Samarra-Mandalay Crenellated Helical Ziggurat and Pyatthat Beacon */
defBuilding({
 key:'ra_west_spiral_beacon',
 name:'Samarra-Mandalay Crenellated Helical Ziggurat and Pyatthat Beacon',
 seed:7106,w:19,d:19,h:23.5,budget:105000,cut:true,
 front:{x:0,z:8.4,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['infrastructure','military'],role:'beacon'},
 build(){
  /* Squared Babylonian Merlon-Crenellated Ziggurat Base + Circular Stylobate */
  const y1=1.08;
  raNoCut(()=>svNoWalk(()=>{
   box('cobalt',0,0,0,15.6,.54,15.6,P('cobalt'));
   box('saffron',0,.54,0,15.2,.16,15.2,P('saffron'));
   box('travertine',0,.7,0,14.8,.38,14.8,P('travertine'));
  }));
  raFloorSlab(0,y1,0,14.6,14.6,{mk:'paving',th:.14});
  /* Four Babylonian crow-step merlon corner parapets framing the square ziggurat podium */
  raMerlonParapet(-7.2,7.15,-2.2,7.15,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(2.2,7.15,7.2,7.15,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(7.2,-7.15,-7.2,-7.15,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(-7.15,-6.9,-7.15,6.9,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(7.15,6.9,7.15,-6.9,y1,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raGrandStair(0,0,8.7,0,y1,7.0,2.6,{mk:'travertine',sideMk:'cobalt',rail:'naga',railOpts:{scale:.72}});

  /* Cylindrical kiln-fired brick, Classical pilaster & lapis-cobalt ziggurat core (rIn=3.4, rOut=4.4, h=11.0 m) */
  const tH=11.0,yTop=y1+tH;
  raDrumWall(0,0,3.4,4.4,y1,tH,'brick',P('brick'),[
   {a:PI/2,w:1.55,h:2.3,door:true,name:'watchtower-door'},
   {a:0,w:1.0,h:1.3,y:2.2,pediment:true},
   {a:PI,w:1.0,h:1.3,y:4.8,pediment:true},
   {a:-PI/2,w:1.0,h:1.3,y:7.4,pediment:true}
  ],{style:'lower-ria'});

  /* Glazed lapis-cobalt & saffron frieze bands + Classical travertine blind pilasters around drum */
  svNoWalk(()=>{
   for(const fy of [3.5,7.1,10.3]){
    cyl('cobalt',0,y1+fy,0,4.45,.34,P('cobalt'),24);
    cyl('saffron',0,y1+fy+.34,0,4.47,.15,P('saffron'),24);
   }
   for(let k=0;k<12;k++){
    const a=k/12*TAU+.26;
    W(Math.cos(a)*4.42,y1+.3,Math.sin(a)*4.42,-a+PI/2,()=>box('travertine',0,0,0,.22,tH-.85,.06,P('travertine')));
   }
   cyl('teak',0,y1+4.2,0,3.38,.14,P('teak'),20);
  });

  /* Continuous walkable exterior Samarra helical ramp climbing 1.32 turns to yTop! */
  const a0=PI/2+.48,sweep=TAU*1.32;
  raSpiralRamp(0,0,4.46,1.65,y1,yTop,a0,sweep,{mk:'travertine',paraMk:'cobalt'});
  raFloorDisc(0,0,6.05,yTop,'mosaic',P('mosaic'),{seg:24,th:.2});
  const aArr=(a0+sweep)%TAU;
  svNoWalk(()=>{
   sector('cobalt',0,0,5.8,6.06,aArr+.34,aArr+TAU-.34,yTop+.01,yTop+.56,P('cobalt'),20);
   sector('saffron',0,0,5.78,6.08,aArr+.34,aArr+TAU-.34,yTop+.56,yTop+.7,P('saffron'),20);
   /* Stepped Babylonian merlons crowning the circular watch-deck rim */
   for(let m=1;m<15;m++){
    const am=aArr+.42+m/15*(TAU-.84);
    W(Math.cos(am)*5.93,yTop+.7,Math.sin(am)*5.93,-am+PI/2,()=>{
     box('cobalt',0,0,0,.58,.24,.22,P('cobalt'));
     box('gold',0,.24,0,.26,.18,.18,P('gold'));
    });
   }
  });

  /* Compact Jewel-Like 3-Tier Gilded Burmese Pyatthat Beacon Cupola over the hearth */
  for(let k=0;k<8;k++){
   const a=k/8*TAU;
   raColumn(Math.cos(a)*2.45,yTop,Math.sin(a)*2.45,3.1,{style:'lower-ria',mk:'crimson',capMk:'gold',baseMk:'cobalt',r:.17,block:false});
  }
  raOctPavilionRoof(0,yTop+3.1,0,3.05,3,{style:'lower-ria',seg:8,mk:'giltroof',trimMk:'gold',soffitMk:'teak',tierRise:1.22});
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
   ['ria_lantern_stand',1.6,yTop,1.4,0]
  ]);
 }
});

/* 7. Riwa-Toka Classical Round-Arch Loggia, Roman Terrace and Thai Gable Mansion */
defBuilding({
 key:'ra_west_arcade_villa',
 name:'Riwa-Toka Classical Round-Arch Loggia, Roman Terrace and Thai Gable Mansion',
 seed:7107,w:22,d:19,h:15.0,budget:100000,cut:true,
 front:{x:0,z:8.6,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['dwelling-single','shop'],role:'mansion',job:'trading'},
 build(){
  const y1=raPlinth(18.4,14.2,.75,{
   style:'lower-ria',baseMk:'cobalt',midMk:'emerald',capMk:'travertine',topMk:'paving',
   stepW:3.0,stepRun:1.6,rail:'naga',railOpts:{scale:.68}
  });

  /* Ground-floor rusticated Classical travertine round-arch loggia on all 4 sides */
  const gh=3.85,y2=y1+gh;
  raArcade(-8.6,6.5,8.6,6.5,y1,gh,{style:'lower-ria',bays:5,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raArcade(-8.6,-6.5,8.6,-6.5,y1,gh,{style:'lower-ria',bays:5,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raArcade(-8.6,-6.5,-8.6,6.5,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.52});
  raArcade(8.6,-6.5,8.6,6.5,y1,gh,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.52});

  /* Inner counting-house walls [-6.4..6.4, -5.4..4.4] */
  raWallRing(-6.4,-5.4,6.4,4.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[{at:0,w:1.8,h:2.4,door:true,name:'counting-house-door'},{at:-3.6,w:1.2,h:1.5,y:1.0,pediment:true},{at:3.6,w:1.2,h:1.5,y:1.0,pediment:true}],
    n:[{at:-3.2,w:1.2,h:1.5,y:1.0},{at:3.2,w:1.2,h:1.5,y:1.0}],
    e:[{at:-.5,w:1.4,h:2.25,door:true,name:'loggia-east-door'}],
    w:[{at:-.5,w:1.4,h:2.25,door:true,name:'loggia-west-door'}]
   }
  });

  /* Interior stair climbing along -x inside the rear bay so front half stays a pure open Roman roof-terrace! */
  const st=svStair(5.2,-3.8,y1,y2,-PI/2,{w:1.1,riser:.18,going:.26,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,0,17.8,13.6,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(0,y2-.24,5.5,16.8,1.8,{mk:'travertine',trimMk:'gold'});
  raCeilingSlab(-1.2,y2-.24,1.2,10.0,5.8,{mk:'teak',trimMk:'gold'});

  /* 50/50 SECOND STOREY:
     - Front half [z = 1.2 .. 6.8]: Open Classical Roman Stone Balustrade Roof-Court + Pedimented Travertine Pergola!
     - Rear half  [z = -6.4 .. 1.2]: 2-Tier Carved-Teak & Terracotta Thai Chofa-Gable Merchant Salon! */
  raClassicalBalustrade(-8.7,6.65,8.7,6.65,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold'});
  raClassicalBalustrade(-8.75,1.2,-8.75,6.55,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold'});
  raClassicalBalustrade(8.75,6.55,8.75,1.2,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold'});
  raColonnade(-3.4,6.45,3.4,6.45,y2,3.15,{style:'lower-ria',n:4,skipMid:1.4,mk:'travertine',friezeMk:'cobalt',r:.19,block:false});
  raClassicalPediment(0,y2+3.16,6.45,0,7.4,1.3,1.1,{style:'lower-ria',mk:'travertine',tymMk:'cobalt'});

  const uh=3.45,yRoof=y2+uh;
  raWallRing(-7.2,-6.0,7.2,1.1,y2,uh,{
   style:'lower-ria',mk:'carvedwood',col:P('teakL'),socMk:'crimson',dadoMk:'gold',postMk:'teak',
   holes:{
    s:[{at:0,w:1.75,h:2.25,door:true,name:'veranda-salon-door'},{at:-4.2,w:1.2,h:1.45,y:.95,pediment:true},{at:4.2,w:1.2,h:1.45,y:.95,pediment:true}],
    n:[{at:-3.6,w:1.2,h:1.45,y:.95},{at:3.6,w:1.2,h:1.45,y:.95}],
    e:[{at:-2.4,w:1.2,h:1.45,y:.95}],
    w:[{at:-2.4,w:1.2,h:1.45,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-2.45,15.4,7.6,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'teak',neckMk:'celadon',
   over:.72,tierRise:1.12,neckH:.4,stepIn:.76
  });

  raTarget(0,y1,5.5,'ground-arcade-loggia',true);
  raTarget(-1.2,y1,1.0,'merchant-counting-house',true);
  raTarget(-2.2,y2,-2.2,'upper-merchant-salon',true);
  raTarget(0,y2,4.2,'upper-roman-terrace',false);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,-.2,0],
   ['ria_glazed_amphora_rack',-5.0,y1,1.6,PI/2],
   ['ria_glazed_amphora_rack',-5.0,y1,-1.4,PI/2],
   ['ria_tribute_chest',2.2,y1,2.2,PI],
   ['ria_teak_divan',-3.8,y2,-4.4,0],
   ['ria_porphyry_table',-2.8,y2,-1.8,0],
   ['ria_saffron_cushion',-2.8,y2,-.6,PI],
   ['ria_silk_screen',-1.2,y2,-4.6,-.2],
   ['ria_offering_basin',-5.6,y2,4.2,0],
   ['ria_lantern_stand',5.6,y2,4.2,0]
  ]);
 }
});

/* 8. Heartland Glazed-Arch Flood-Loggia and Ruan-Thai Teak House */
defBuilding({
 key:'ra_west_stilt_house',
 name:'Heartland Glazed-Arch Flood-Loggia and Ruan-Thai Teak House',
 seed:7108,w:18,d:18,h:13.4,budget:88000,cut:true,
 front:{x:0,z:8.1,yaw:0},
 tags:{style:'lower-ria',wealth:'middle',types:['dwelling-single'],role:'house'},
 build(){
  /* Babylonian Glazed-Brick & Travertine Round-Arch Boat/Flood Loggia supporting the upper chaan terrace (yChaan = 2.65 m)! */
  const yChaan=2.65;
  raFloorSlab(0,.12,-.8,14.8,11.6,{mk:'paving',th:.12});
  raArcade(-6.8,4.4,6.8,4.4,.12,yChaan-.26,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.5});
  raArcade(-6.8,-6.2,6.8,-6.2,.12,yChaan-.26,{style:'lower-ria',bays:4,mk:'travertine',trimMk:'cobalt',pierW:.5});
  raArcade(-6.8,-6.2,-6.8,4.4,.12,yChaan-.26,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.5});
  raArcade(6.8,-6.2,6.8,4.4,.12,yChaan-.26,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.5});
  for(const px of [-2.2,2.2])for(const pz of [-1.0]){
   raColumn(px,.12,pz,yChaan-.28,{style:'lower-ria',mk:'cobalt',bandMk:'emerald',capMk:'travertine',baseMk:'travertine',r:.23});
  }
  raCeilingSlab(0,yChaan-.24,-.9,13.6,10.4,{mk:'teak',trimMk:'gold'});

  /* Elevated central terrace + wide gentle exterior Naga stair (run = 4.2 m for 2.53 m rise) */
  raFloorSlab(0,yChaan,-1.0,14.4,11.2,{mk:'mosaic',th:.2});
  raGrandStair(0,.12,8.0,0,yChaan,3.8,2.2,{mk:'travertine',sideMk:'cobalt',openUnder:true,rail:'naga',railOpts:{scale:.68}});

  /* Stepped Babylonian Lapis-and-Saffron Crow-Step Merlon Parapets edging the sunny front terrace! */
  raMerlonParapet(-2.1,4.46,-1.35,4.46,yChaan,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(1.35,4.46,6.9,4.46,yChaan,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});
  raMerlonParapet(6.95,4.2,6.95,-.1,yChaan,{mk:'cobalt',bandMk:'saffron',capMk:'gold'});

  /* West Pavilion [-6.8..-2.2, 0.4..4.5]: Flat Merlon-Crenellated Babylonian Glazed-Brick Summer Loggia! */
  raWallRing(-6.8,.4,-2.2,4.5,yChaan,2.95,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'cobalt',
   holes:{
    e:[{at:2.45,w:1.4,h:2.1,door:true,leafMk:'carvedwood',crownMk:'gold',name:'ruan-side-door'}],
    s:[{at:-4.5,w:1.05,h:1.25,y:.9,pediment:true}]
   }
  });
  raFlatTerraceRoof(-4.5,yChaan+2.95,2.45,4.8,4.3,{
   style:'lower-ria',mk:'cobalt',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',
   parapet:'merlon',parMk:'cobalt',bandMk:'saffron',capMk:'gold'
  });

  /* Rear Main Hall [-6.6..6.6, -5.8..-0.2]: Steep Dark-Teak 2-Tier Ruan-Thai Chofa-Gable House! */
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

  raTarget(0,.12,1.6,'under-croft-shade',true);
  raTarget(2.2,yChaan,2.2,'central-chaan-deck',false);
  raTarget(0,yChaan,-3.0,'ruan-thai-main-hall',true);
  raTarget(-4.5,yChaan,2.45,'ruan-side-cabin',true);

  raFurnList([
   ['ria_glazed_amphora_rack',-4.2,.12,-2.2,0],
   ['ria_tribute_chest',4.2,.12,-2.2,0],
   ['ria_teak_divan',-3.6,yChaan,-4.2,0],
   ['ria_porphyry_table',2.4,yChaan,-3.2,0],
   ['ria_saffron_cushion',2.4,yChaan,-2.0,PI],
   ['ria_saffron_cushion',2.4,yChaan,-4.4,0],
   ['ria_offering_basin',3.8,yChaan,2.6,0],
   ['ria_saffron_cushion',-4.5,yChaan,3.3,PI]
  ]);
 }
});
