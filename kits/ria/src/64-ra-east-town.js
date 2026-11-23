// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — BOAT-LIFT, VIHARN & DWELLINGS (5-8)
// 50/50 Balanced Fusion:
//   5. Flat-Topped Egyptian/Roman Cavetto Bastion Lockhouses + Round-Arch Chute Viaduct + Central Lanna Boat-Lift Winch Sala
//   6. Greco-Egyptian Green-Palm-Capital Stone Basilica + Classical Temple Pediment + Soaring Lanna Clerestory Viharn Spire
//   7. Pompeian-Minoan Flat Stone Balustrade Impluvium Court + Tapered Red-Porphyry Columns + Rear Lanna Multi-Gable Triclinium & Chedi
//   8. Classical Round-Arch Ground Loggia + Flat Minoan Tapered-Porphyry Front Portico + Rear Shan-Lanna Indigo-Slate Gable House

/* 5. Karst Shut-In Cavetto-Viaduct Counterweight Boat-Lift and Winch Sala */
defBuilding({
 key:'ra_east_boatlift_hall',
 name:'Karst Shut-In Cavetto-Viaduct Counterweight Boat-Lift and Winch Sala',
 seed:7205,w:26,d:24,h:20.8,budget:118000,cut:true,
 front:{x:-7.2,z:10.4,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['infrastructure','industry'],role:'boat-lift',job:'shipwrighting'},
 build(){
  /* Central stepped dolomite & porphyry karst shut-in water-chute [-3.6..3.6] with live core/water flow */
  raWaterCourt(0,0,7.4,20.4,.32,.78,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:2,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[0,.1,-9.6],[0,.1,0],[0,.1,9.6]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'karst-boatlift-chute',pts:wPts,width:6.4,speed:.55};
  }

  /* West & East monumental dolomite & red-porphyry Classical lock quays (yQuay = 0.9 m) + north headwall bridge */
  const yQuay=.9,yWinch=5.8,yBastion=9.35;
  for(const s of [-1,1]){
   const qx=s*7.2;
   raFloorSlab(qx+s*.6,yQuay,0,8.2,18.4,{mk:'paving',th:.9});
   raGrandStair(qx,0,10.8,qx,yQuay,9.2,2.6,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.72}});
  }
  raFloorSlab(0,yQuay,-8.2,7.4,2.2,{mk:'dolomite',th:.32});

  /* Twin Towering Flat-Topped Egyptian/Roman Cavetto-and-Balustrade Stone Lock Bastions [qx = -7.2, +7.2]! */
  for(const s of [-1,1]){
   const qx=s*7.2;
   /* Lower lockhouse [qx-2.6..qx+2.6, -5.2..2.2] */
   raWallRing(qx-2.6,-5.2,qx+2.6,2.2,yQuay,yWinch-yQuay,{
    style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
    holes:{
     s:[{at:qx,w:1.55,h:2.3,door:true,crownMk:'silver',name:s<0?'lockmaster-door':'winchhouse-door'}],
     n:[{at:qx,w:1.1,h:1.4,y:1.1}]
    }
   });
   raCeilingSlab(qx,yWinch-.22,-1.5,4.8,6.8,{mk:'cedar',trimMk:'silver'});
   /* Upper stone bastion chamber [qx-2.5..qx+2.5, -5.0..2.0] with open E/W passages onto central Winch Sala! */
   raWallRing(qx-2.5,-5.0,qx+2.5,2.0,yWinch,yBastion-yWinch,{
    style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
    holes:{
     e:[{at:-1.5,w:2.4,h:2.65,door:true,open:true}],
     w:[{at:-1.5,w:2.4,h:2.65,door:true,open:true}],
     s:[{at:qx,w:1.2,h:1.5,y:1.0,pediment:true,crownMk:'silver'}],
     n:[{at:qx,w:1.2,h:1.5,y:1.0}]
    }
   });
   raFlatTerraceRoof(qx,yBastion,-1.5,5.4,7.4,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade'
   });
   /* Exterior stone stairs along outer flanks (x = +-10.75) up to overhead winch deck (yWinch) */
   raGrandStair(qx+s*3.55,yQuay,7.2,qx+s*3.55,yWinch,1.2,1.45,{mk:'dolomite',sideMk:'porphyry',openUnder:true});
  }

  /* Overhead Winch Deck [-11.6..11.6, -5.4..2.4] + Classical Round-Arch Stone Viaduct spanning the water-chute! */
  raFloorSlab(0,yWinch,-1.5,23.2,7.8,{mk:'floor',th:.22});
  raArcade(-4.4,2.15,4.4,2.15,yQuay,yWinch-yQuay-.22,{style:'upper-ria',bays:1,mk:'dolomite',trimMk:'porphyry',pierW:.68,block:false});
  raArcade(-4.4,-5.15,4.4,-5.15,yQuay,yWinch-yQuay-.22,{style:'upper-ria',bays:1,mk:'dolomite',trimMk:'porphyry',pierW:.68,block:false});
  raClassicalBalustrade(-4.5,2.25,4.5,2.25,yWinch,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  raClassicalBalustrade(4.5,-5.25,-4.5,-5.25,yWinch,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});

  svNoWalk(()=>{
   /* Giant Cast-Bronze Pulley Sheaves, Cables, Porphyry-Lodestone Counterweights & Timber Boat-Cradle! */
   for(const sx of [-2.2,2.2])for(const sz of [-3.4,.4]){
    cyl('bronze',sx,yWinch+.65,sz,.56,.16,P('bronze'),14);
    pole('rope',[sx,yWinch+.65,sz],[sx,1.45,sz],.028,P('rope'),6);
    const cwx=sx+(sx<0?-1.3:1.3);
    pole('rope',[sx,yWinch+.95,sz],[cwx,2.6,sz],.028,P('rope'),6);
    box('porphyry',cwx,2.1,sz,.62,.78,.62,P('porphyry'));
    box('lodestone',cwx,2.88,sz,.54,.32,.54,P('lodestone'));
   }
   for(const sx of [-2.2,2.2])box('teak',sx,1.25,-1.5,.22,.22,5.2,P('teak'));
   for(const sz of [-3.4,-1.5,.4])box('cedar',0,1.47,sz,4.8,.16,.24,P('cedar'));
  });

  /* Central 3-Tier Lanna Indigo-Slate & Copper Winch Sala Pavilion strictly over the central chute [-4.4..4.4]! */
  const salaH=3.65;
  for(const bx of [-4.1,0,4.1])for(const bz of [-4.8,1.8]){
   raColumn(bx,yWinch,bz,salaH,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.22,block:false});
  }
  raTieredRoof(0,yWinch+salaH,-1.5,9.2,7.6,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.62,tierRise:1.12,neckH:.4,stepIn:.76,spire:true,spireH:3.8
  });

  raTarget(-7.2,yQuay,-1.5,'lockmaster-office',true);
  raTarget(7.2,yQuay,-1.5,'counterweight-house',true);
  raTarget(0,yWinch,-1.5,'winch-sala-pavilion',true);

  raFurnList([
   ['ria_amber_seal_desk',-7.2,yQuay,-3.2,0],
   ['ria_lodestone_compass',-7.2,yQuay,0,0],
   ['ria_tribute_chest',7.2,yQuay,-3.2,0],
   ['ria_glazed_amphora_rack',7.2,yQuay,0,PI],
   ['ria_hongsa_lectern',0,yWinch,-3.4,0],
   ['ria_tribute_chest',-2.8,yWinch,-3.4,0],
   ['ria_lantern_stand',-2.8,yWinch,.6,0],
   ['ria_lantern_stand',2.8,yWinch,.6,0]
  ]);
 }
});

/* 6. Greco-Egyptian Palm-Portico Basilica and Lanna Clerestory Treaty Viharn */
defBuilding({
 key:'ra_east_saffron_viharn',
 name:'Greco-Egyptian Palm-Portico Basilica and Lanna Clerestory Treaty Viharn',
 seed:7206,w:24,d:26,h:21.0,budget:115000,cut:true,
 front:{x:0,z:12.0,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious','civic'],role:'viharn',job:'worship'},
 build(){
  /* Raised imperial red-porphyry stylobate + Silver-Bronze Hongsa grand stair */
  const y1=raPlinth(18.8,20.4,1.45,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',
   stepW:3.8,stepRun:3.0,rail:'hongsa'
  });

  /* Double-height fluted cream-dolomite & porphyry Greco-Egyptian Palm-Frond Basilica Peristyle (h = 5.2 m)! */
  const colH=5.2,yRoof=y1+colH;
  raColonnade(-7.8,8.8,7.8,8.8,y1,colH,{style:'upper-ria',n:6,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.27,capital:'palm'});
  raColonnade(-7.8,-8.8,7.8,-8.8,y1,colH,{style:'upper-ria',n:6,mk:'dolomite',altMk:'porphyry',r:.27,capital:'palm'});
  raColonnade(-7.8,-5.4,-7.8,5.4,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.27,capital:'palm'});
  raColonnade(7.8,-5.4,7.8,5.4,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.27,capital:'palm'});

  /* Viharn nave walls [-5.6..5.6, -7.0..5.2] leaving a deep front Greco-Egyptian Palm Portico [5.2..8.8] */
  raWallRing(-5.6,-7.0,5.6,5.2,y1,colH-.34,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'saffron',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.2,h:2.75,door:true,crownMk:'silver',name:'viharn-treaty-portal'},{at:-3.3,w:1.2,h:1.85,y:1.05,pediment:true,crownMk:'silver'},{at:3.3,w:1.2,h:1.85,y:1.05,pediment:true,crownMk:'silver'}],
    n:[{at:-3.1,w:1.2,h:1.85,y:1.05},{at:3.1,w:1.2,h:1.85,y:1.05}],
    e:[{at:-1.0,w:1.6,h:2.35,door:true,name:'viharn-east-door'},{at:-4.3,w:1.15,h:1.7,y:1.05},{at:2.3,w:1.15,h:1.7,y:1.05}],
    w:[{at:-1.0,w:1.6,h:2.35,door:true,name:'viharn-west-door'},{at:-4.3,w:1.15,h:1.7,y:1.05},{at:2.3,w:1.15,h:1.7,y:1.05}]
   }
  });

  /* 50/50 CROWN: Flat Classical Balustrade Stone Basilica Roof + Sculpted Front Temple Pediment + Central 3-Tier Lanna Clerestory Spire! */
  const yBas=raFlatTerraceRoof(0,yRoof,0,17.2,18.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade'
  });
  raClassicalPediment(0,yBas+.02,8.15,0,10.0,1.85,2.2,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});
  raTieredRoof(0,yBas+.02,-.9,10.2,12.4,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'dolomite',neckMk:'copper',
   over:.72,tierRise:1.28,neckH:.44,stepIn:.76,spire:true,spireH:3.6,ceiling:false
  });

  raBanner(-4.8,y1,9.4,0,3.8,P('silkSaffron'),true);
  raBanner(4.8,y1,9.4,0,3.8,P('silkSaffron'),true);

  raTarget(0,y1,7.0,'treaty-viharn-portico',true);
  raTarget(0,y1,-1.2,'saffron-viharn-nave',true);

  raFurnList([
   ['ria_lotus_altar',0,y1,-5.0,0],
   ['ria_hongsa_lectern',-2.2,y1,-3.2,.18],
   ['ria_hongsa_lectern',2.2,y1,-3.2,-.18],
   ['ria_silk_screen',0,y1,-5.9,0],
   ['ria_porphyry_table',0,y1,.2,0],
   ['ria_saffron_cushion',-1.5,y1,.2,PI/2],
   ['ria_saffron_cushion',1.5,y1,.2,-PI/2],
   ['ria_saffron_cushion',-3.4,y1,2.2,0],
   ['ria_saffron_cushion',3.4,y1,2.2,0],
   ['ria_lantern_stand',-2.8,y1,6.8,0],
   ['ria_lantern_stand',2.8,y1,6.8,0]
  ]);
 }
});

/* 7. Liwa-Toga Pompeian-Minoan Impluvium Court and Lanna-Gable Patrician Villa */
defBuilding({
 key:'ra_east_peristyle_villa',
 name:'Liwa-Toga Pompeian-Minoan Impluvium Court and Lanna-Gable Patrician Villa',
 seed:7207,w:24,d:22,h:17.2,budget:108000,cut:true,
 front:{x:0,z:10.2,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['dwelling-single'],role:'villa'},
 build(){
  const y1=raPlinth(20.2,17.6,.85,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.2,stepRun:1.8,rail:'hongsa',railOpts:{scale:.7}
  });

  /* Central sunken karst-spring impluvium pool + 8 downward-tapering red-porphyry Minoan peristyle columns (image_8.png)! */
  raWaterCourt(0,.6,5.4,4.8,y1,.48,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  const gh=3.75,y2=y1+gh;
  for(const sx of [-3.4,0,3.4])for(const sz of [-2.4,3.8]){
   raColumn(sx,y1,sz,gh,{style:'upper-ria',mk:'porphyry',capMk:'gold',baseMk:'dolomite',r:.22,taper:'minoan',block:false});
  }
  for(const sx of [-3.4,3.4]){
   raColumn(sx,y1,.7,gh,{style:'upper-ria',mk:'porphyry',capMk:'gold',baseMk:'dolomite',r:.22,taper:'minoan',block:false});
  }

  /* Outer villa perimeter wall [-9.4..9.4, -8.2..8.0] + rear triclinium hall [-9.0..9.0, -8.0..-3.0] */
  raWallRing(-9.4,-8.2,9.4,8.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.0,h:2.45,door:true,crownMk:'silver',name:'villa-vestibule-door'},{at:-5.6,w:1.2,h:1.5,y:1.0,pediment:true},{at:5.6,w:1.2,h:1.5,y:1.0,pediment:true}],
    n:[{at:-5.2,w:1.2,h:1.5,y:1.0},{at:0,w:1.4,h:1.6,y:1.0},{at:5.2,w:1.2,h:1.5,y:1.0}],
    e:[{at:-4.8,w:1.2,h:1.5,y:1.0},{at:2.2,w:1.2,h:1.5,y:1.0}],
    w:[{at:-4.8,w:1.2,h:1.5,y:1.0},{at:2.2,w:1.2,h:1.5,y:1.0}]
   }
  });
  raWall(-8.8,-3.0,8.8,-3.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',
   holes:[
    {at:4.2,w:1.6,h:2.3,door:true,open:true},
    {at:8.8,w:1.9,h:2.4,door:true,crownMk:'silver',name:'triclinium-door'},
    {at:13.4,w:1.6,h:2.3,door:true,open:true}
   ]
  });

  /* FLAT POMPEIAN-MINOAN BALUSTRADE STONE TERRACE ROOFS over S, W, E peristyle walks + Classical Vestibule Pediment! */
  raFlatTerraceRoof(0,y2,5.95,18.8,3.9,{style:'upper-ria',mk:'dolomite',topMk:'mosaic',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade'});
  raFlatTerraceRoof(-6.6,y2,.5,5.2,6.3,{style:'upper-ria',mk:'dolomite',topMk:'mosaic',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade',skip:'sn'});
  raFlatTerraceRoof(6.6,y2,.5,5.2,6.3,{style:'upper-ria',mk:'dolomite',topMk:'mosaic',soffitMk:'cedar',trimMk:'silver',parapet:'balustrade',skip:'sn'});
  raClassicalPediment(0,y2+.54,7.4,0,5.6,1.3,1.8,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* Interior stair in rear triclinium wing climbing along -x cleanly inside [-9.0..9.0, -8.0..-3.0] */
  const st=svStair(7.6,-5.5,y1,y2,-PI/2,{w:1.15,riser:.18,going:.26,mk:'dolomite',smk:'porphyry',col:P('dolomite'),scol:P('porphyry'),rail:'both'});
  raFloorSlab(0,y2,-5.5,18.4,5.4,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-3.2,y2-.24,-5.5,10.8,5.0,{mk:'cedar',trimMk:'silver'});

  const uh=3.45,yRoof=y2+uh;
  raWallRing(-9.0,-8.0,9.0,-2.8,y2,uh,{
   style:'upper-ria',mk:'cedar',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:-4.8,w:1.25,h:1.5,y:.95},{at:0,w:1.65,h:2.2,door:true,crownMk:'silver',name:'upper-gallery-door'},{at:4.8,w:1.25,h:1.5,y:.95}],
    n:[{at:-4.5,w:1.2,h:1.45,y:.95},{at:4.5,w:1.2,h:1.45,y:.95}]
   }
  });
  raFloorSlab(0,y2,-2.1,6.4,1.2,{mk:'dolomite',th:.16});
  raClassicalBalustrade(-3.1,-1.55,3.1,-1.55,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});

  /* Upturned Lanna multi-gable roof over rear wing + NE corner stone Angkor-Lanna Prang-Chedi spire! */
  raTieredRoof(-1.8,yRoof,-5.4,14.8,5.6,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.65,tierRise:1.22,neckH:.36,stepIn:.76
  });
  raPrang(7.2,yRoof,-5.4,3.6,5.8,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'silver',vault:true});

  raTarget(0,y1,5.6,'peristyle-south-walk',true);
  raTarget(-1.2,y1,-5.5,'patrician-triclinium',true);
  raTarget(-1.2,y2,-5.4,'upper-lanna-gallery',true);

  raFurnList([
   ['ria_porphyry_table',-1.8,y1,-5.6,0],
   ['ria_saffron_cushion',-1.8,y1,-4.3,PI],
   ['ria_saffron_cushion',-1.8,y1,-6.9,0],
   ['ria_teak_divan',-6.4,y1,-5.8,PI/2],
   ['ria_offering_basin',-4.6,y1,5.6,0],
   ['ria_teak_divan',-5.8,y2,-5.6,PI/2],
   ['ria_hongsa_lectern',0,y2,-6.6,0],
   ['ria_silk_screen',2.6,y2,-6.6,-.2],
   ['ria_lantern_stand',4.6,y1,5.6,0]
  ]);
 }
});

/* 8. Upland Minoan Porphyry-Loggia and Shan-Lanna Gable Townhouse */
defBuilding({
 key:'ra_east_terrace_house',
 name:'Upland Minoan Porphyry-Loggia and Shan-Lanna Gable Townhouse',
 seed:7208,w:17,d:16,h:14.4,budget:88000,cut:true,
 front:{x:0,z:7.2,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['dwelling-single','shop'],role:'townhouse'},
 build(){
  /* Stepped dolomite & porphyry plinth */
  const y1=raPlinth(13.6,12.0,.52,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:2.6,stepRun:1.2,rail:'hongsa',railOpts:{scale:.62}
  });

  /* Classical round-arch red-porphyry & dolomite front ground loggia + dressed ashlar ground vault [-6.0..6.0, -5.2..4.4] */
  const gh=3.55,y2=y1+gh;
  raArcade(-5.9,5.35,5.9,5.35,y1,gh,{style:'upper-ria',bays:3,mk:'dolomite',trimMk:'porphyry',pierW:.52});
  raWallRing(-6.0,-5.2,6.0,4.2,y1,gh,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:0,w:1.75,h:2.35,door:true,frameMk:'dolomite',crownMk:'silver',name:'townhouse-vault-door'},{at:-3.6,w:1.1,h:1.35,y:1.0},{at:3.6,w:1.1,h:1.35,y:1.0}],
    n:[{at:-3.2,w:1.1,h:1.35,y:1.0},{at:3.2,w:1.1,h:1.35,y:1.0}],
    e:[{at:-.4,w:1.1,h:1.35,y:1.0}],
    w:[{at:-.4,w:1.1,h:1.35,y:1.0}]
   }
  });

  /* Interior stair running along -x inside the rear bay [-5.8..5.8, -5.2..1.4] */
  const st=svStair(4.6,-3.8,y1,y2,-PI/2,{w:1.05,riser:.18,going:.26,mk:'cedar',smk:'porphyry',col:P('cedar'),scol:P('porphyry'),rail:'both'});
  raFloorSlab(0,y2,.1,13.0,11.4,{mk:'mosaic',th:.18,hole:st});
  raCeilingSlab(-1.2,y2-.24,.2,9.2,8.4,{mk:'cedar',trimMk:'silver'});
  raCeilingSlab(0,y2-.24,4.9,11.8,1.4,{mk:'dolomite',trimMk:'silver'});

  /* 50/50 SECOND STOREY:
     - Front Portico [z = 2.0 .. 5.8]: Flat-Roofed Minoan Tapered Red-Porphyry Columned Loggia & Stone Balustrade!
     - Rear Dwelling [z = -5.5 .. 1.4]: Steep 2-Tier Carved-Cedar & Indigo-Slate Shan-Lanna Hongsa Gable House! */
  const uh=3.3,yRoof=y2+uh;
  raClassicalBalustrade(-6.35,5.68,6.35,5.68,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  raClassicalBalustrade(-6.4,1.6,-6.4,5.55,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  raClassicalBalustrade(6.4,5.55,6.4,1.6,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  for(const bx of [-6.0,-2.1,2.1,6.0]){
   raColumn(bx,y2,5.45,uh-.16,{style:'upper-ria',mk:'porphyry',capMk:'gold',baseMk:'dolomite',r:.19,taper:'minoan',block:false});
  }
  raFlatTerraceRoof(0,yRoof-.16,3.9,13.0,3.7,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'n'
  });

  raWallRing(-6.3,-5.5,6.3,1.4,y2,uh,{
   style:'upper-ria',mk:'cedar',socMk:'porphyry',dadoMk:'carvedwood',postMk:'teak',cornice:false,
   holes:{
    s:[{at:0,w:1.55,h:2.15,door:true,leafMk:'teak',crownMk:'silver',name:'townhouse-balcony-door'},{at:-3.6,w:1.15,h:1.4,y:.95},{at:3.6,w:1.15,h:1.4,y:.95}],
    n:[{at:-3.2,w:1.15,h:1.4,y:.95},{at:3.2,w:1.15,h:1.4,y:.95}],
    e:[{at:-2.0,w:1.15,h:1.4,y:.95}],
    w:[{at:-2.0,w:1.15,h:1.4,y:.95}]
   }
  });
  raTieredRoof(0,yRoof,-2.05,13.0,6.8,2,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.6,tierRise:1.38,neckH:.36,stepIn:.76
  });

  raTarget(-1.2,y1,0,'porphyry-ground-vault',true);
  raTarget(-1.8,y2,-2.0,'shan-lanna-upper-hall',true);
  raTarget(0,y2,4.2,'minoan-front-loggia',true);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,-1.8,0],
   ['ria_glazed_amphora_rack',-4.6,y1,1.2,PI/2],
   ['ria_tribute_chest',1.2,y1,-2.2,0],
   ['ria_teak_divan',-3.8,y2,-4.0,0],
   ['ria_porphyry_table',-1.6,y2,-1.6,0],
   ['ria_saffron_cushion',-1.6,y2,-.4,PI],
   ['ria_offering_basin',-4.2,y2,4.2,0],
   ['ria_lantern_stand',4.2,y2,4.2,0]
  ]);
 }
});
