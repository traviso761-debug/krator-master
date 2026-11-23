// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — BOAT-LIFT, VIHARN & DWELLINGS (5-8)
// Implements Karst Shut-In Counterweight Boat-Lift & Tiered Sala Pavilion, Upper-Ria Colonnaded Saffron & Treaty Viharn Hall,
// Liwa-Toga Porphyry-Peristyle & Lanna-Gable Patrician Villa, and Upland Porphyry-Plinth & Shan-Lanna Tiered-Roof Townhouse.

/* 5. Karst Shut-In Counterweight Boat-Lift and Tiered Sala Pavilion (CROOK-RIA-DECISIONS.md 2.4) */
defBuilding({
 key:'ra_east_boatlift_hall',
 name:'Karst Shut-In Counterweight Boat-Lift and Tiered Sala Pavilion',
 seed:7205,w:26,d:24,h:20.8,budget:110000,cut:true,
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
  const yQuay=.9,yWinch=5.8;
  for(const s of [-1,1]){
   const qx=s*7.2;
   raFloorSlab(qx+s*.6,yQuay,0,8.2,18.4,{mk:'paving',th:.9});
   raGrandStair(qx,0,10.8,qx,yQuay,9.2,2.6,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.72}});
  }
  /* North headwall lock cross-walk linking West and East quays at yQuay */
  raFloorSlab(0,yQuay,-8.2,7.4,2.2,{mk:'dolomite',th:.32});

  /* West lockmaster tollhouse [-9.8..-4.6, -5.2..2.2] + East counterweight winch house [4.6..9.8, -5.2..2.2] */
  for(const s of [-1,1]){
   const qx=s*7.2;
   raWallRing(qx-2.6,-5.2,qx+2.6,2.2,yQuay,yWinch-yQuay,{
    style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
    holes:{
     s:[{at:qx,w:1.55,h:2.3,door:true,crownMk:'silver',name:s<0?'lockmaster-door':'winchhouse-door'}],
     n:[{at:qx,w:1.1,h:1.4,y:1.1}]
    }
   });
   raCeilingSlab(qx,yWinch-.22,-1.5,4.8,6.8,{mk:'cedar',trimMk:'silver'});
   /* Exterior stone stairs along outer flanks (x = +-10.75, clear of house walls) up to overhead winch Sala (yWinch) */
   raGrandStair(qx+s*3.55,yQuay,7.2,qx+s*3.55,yWinch,1.2,1.45,{mk:'dolomite',sideMk:'porphyry',openUnder:true});
  }

  /* Overhead Winch & Sala Pavilion Deck [-11.6..11.6, -5.4..2.4] spanning the shut-in chute */
  raFloorSlab(0,yWinch,-1.5,23.2,7.8,{mk:'floor',th:.22});
  svNoWalk(()=>{
   box('carvedwood',0,yWinch+.01,-5.25,20.0,.88,.12,P('cedar'));
   box('carvedwood',0,yWinch+.01,2.25,13.6,.88,.12,P('cedar'));

   /* Giant Cast-Bronze Pulley Sheaves, Twisted Hemp/Gold Cables, Porphyry-Lodestone Counterweights & Timber Boat-Cradle! */
   for(const sx of [-2.4,2.4])for(const sz of [-3.4,.4]){
    /* Bronze overhead sheave wheel */
    cyl('bronze',sx,yWinch+.65,sz,.56,.16,P('bronze'),14);
    /* Cable down to boat-cradle in chute */
    pole('rope',[sx,yWinch+.65,sz],[sx,1.45,sz],.028,P('rope'),6);
    /* Counterweight cable out to suspended porphyry + lodestone counterweight block */
    const cwx=sx+(sx<0?-1.4:1.4);
    pole('rope',[sx,yWinch+.95,sz],[cwx,2.6,sz],.028,P('rope'),6);
    box('porphyry',cwx,2.1,sz,.62,.78,.62,P('porphyry'));
    box('lodestone',cwx,2.88,sz,.54,.32,.54,P('lodestone'));
   }
   /* Suspended timber boat-cradle hovering cleanly at y = 1.25 m over the chute */
   for(const sx of [-2.4,2.4])box('teak',sx,1.25,-1.5,.22,.22,5.2,P('teak'));
   for(const sz of [-3.4,-1.5,.4])box('cedar',0,1.47,sz,5.2,.16,.24,P('cedar'));
  });

  /* Monumental columns on winch deck supporting a 3-Tiered Lanna/Burmese Indigo-Slate & Copper Sala Roof */
  const salaH=3.6;
  for(const bx of [-9.4,-4.6,0,4.6,9.4])for(const bz of [-5.0,2.0]){
   raColumn(bx,yWinch,bz,salaH,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.22,block:false});
  }
  raTieredRoof(0,yWinch+salaH,-1.5,20.6,8.0,3,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.72,tierRise:1.15,neckH:.42,stepIn:.76,spire:true,spireH:3.8
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
   ['ria_tribute_chest',-4.2,yWinch,-3.4,0],
   ['ria_lantern_stand',-3.2,yWinch,.6,0],
   ['ria_lantern_stand',3.2,yWinch,.6,0]
  ]);
 }
});

/* 6. Upper-Ria Colonnaded Saffron and Treaty Viharn Hall (image_2.png, image_6.png) */
defBuilding({
 key:'ra_east_saffron_viharn',
 name:'Upper-Ria Colonnaded Saffron and Treaty Viharn Hall',
 seed:7206,w:24,d:26,h:21.0,budget:105000,cut:true,
 front:{x:0,z:12.0,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious','civic'],role:'viharn',job:'worship'},
 build(){
  /* Raised imperial red-porphyry stylobate + Silver-Bronze Hongsa grand stair */
  const y1=raPlinth(18.8,20.4,1.45,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',
   stepW:3.8,stepRun:3.0,rail:'hongsa'
  });

  /* Double-height fluted cream-dolomite & porphyry Egyptian-Classical peristyle columns (h = 5.2 m) */
  const colH=5.2,yRoof=y1+colH;
  raColonnade(-7.8,8.8,7.8,8.8,y1,colH,{style:'upper-ria',n:5,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.28});
  raColonnade(-7.8,-8.8,7.8,-8.8,y1,colH,{style:'upper-ria',n:5,mk:'dolomite',altMk:'porphyry',r:.28});
  raColonnade(-7.8,-5.4,-7.8,5.4,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.28});
  raColonnade(7.8,-5.4,7.8,5.4,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.28});

  /* Viharn nave walls [-5.8..5.8, -7.2..5.4] leaving a deep front Treaty Portico [5.4..8.8] */
  raWallRing(-5.8,-7.2,5.8,5.4,y1,colH-.34,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'saffron',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.2,h:2.75,door:true,crownMk:'silver',name:'viharn-treaty-portal'},{at:-3.4,w:1.2,h:1.85,y:1.05,pediment:true,crownMk:'silver'},{at:3.4,w:1.2,h:1.85,y:1.05,pediment:true,crownMk:'silver'}],
    n:[{at:-3.2,w:1.2,h:1.85,y:1.05},{at:3.2,w:1.2,h:1.85,y:1.05}],
    e:[{at:-1.0,w:1.6,h:2.35,door:true,name:'viharn-east-door'},{at:-4.4,w:1.15,h:1.7,y:1.05},{at:2.4,w:1.15,h:1.7,y:1.05}],
    w:[{at:-1.0,w:1.6,h:2.35,door:true,name:'viharn-west-door'},{at:-4.4,w:1.15,h:1.7,y:1.05},{at:2.4,w:1.15,h:1.7,y:1.05}]
   }
  });

  /* 3-Tier Telescopic Copper & Indigo-Slate Lanna Viharn Roof (solid coffered ceiling over entire nave + portico!) */
  raTieredRoof(0,yRoof,0,16.8,18.6,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'dolomite',neckMk:'copper',
   over:.85,tierRise:1.38,neckH:.48,stepIn:.76,spire:true,spireH:3.6
  });

  raBanner(-4.6,y1,9.4,0,3.8,P('silkSaffron'),true);
  raBanner(4.6,y1,9.4,0,3.8,P('silkSaffron'),true);

  raTarget(0,y1,7.0,'treaty-viharn-portico',true);
  raTarget(0,y1,-1.2,'saffron-viharn-nave',true);

  raFurnList([
   ['ria_lotus_altar',0,y1,-5.2,0],
   ['ria_hongsa_lectern',-2.2,y1,-3.2,.18],
   ['ria_hongsa_lectern',2.2,y1,-3.2,-.18],
   ['ria_silk_screen',0,y1,-6.1,0],
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

/* 7. Liwa-Toga Porphyry-Peristyle and Lanna-Gable Patrician Villa */
defBuilding({
 key:'ra_east_peristyle_villa',
 name:'Liwa-Toga Porphyry-Peristyle and Lanna-Gable Patrician Villa',
 seed:7207,w:24,d:22,h:17.2,budget:100000,cut:true,
 front:{x:0,z:10.2,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['dwelling-single'],role:'villa'},
 build(){
  const y1=raPlinth(20.2,17.6,.85,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:3.2,stepRun:1.8,rail:'hongsa',railOpts:{scale:.7}
  });

  /* Central sunken karst-spring impluvium pool + 8 fluted porphyry peristyle columns */
  raWaterCourt(0,.6,5.4,4.8,y1,.48,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  const gh=3.75,y2=y1+gh;
  for(const sx of [-3.4,0,3.4])for(const sz of [-2.6,3.8]){
   raColumn(sx,y1,sz,gh,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.2,block:false});
  }
  for(const sx of [-3.4,3.4]){
   raColumn(sx,y1,.6,gh,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.2,block:false});
  }

  /* Outer villa perimeter wall [-9.4..9.4, -8.2..8.0] + rear triclinium hall [-9.0..9.0, -8.0..-3.0] */
  raWallRing(-9.4,-8.2,9.4,8.0,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.0,h:2.45,door:true,crownMk:'silver',name:'villa-vestibule-door'},{at:-5.6,w:1.2,h:1.5,y:1.0},{at:5.6,w:1.2,h:1.5,y:1.0}],
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
  /* Ceilings over the South, West, and East peristyle walkways around the open impluvium court! */
  raCeilingSlab(0,y2-.14,5.9,18.2,3.8,{mk:'cedar',trimMk:'silver'});
  raCeilingSlab(-6.4,y2-.14,.4,5.4,6.6,{mk:'cedar',trimMk:'silver'});
  raCeilingSlab(6.4,y2-.14,.4,5.4,6.6,{mk:'cedar',trimMk:'silver'});
  raTieredRoof(0,y2,6.0,18.8,4.0,1,{style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',over:.42,tierRise:.95});
  raTieredRoof(-6.6,y2,.5,5.2,7.2,1,{style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',over:.42,tierRise:.95});
  raTieredRoof(6.6,y2,.5,5.2,7.2,1,{style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',over:.42,tierRise:.95});

  /* Interior stair in rear triclinium wing climbing along -x from (7.6, -5.5) to (2.4, -5.5) cleanly inside [-9.0..9.0, -8.0..-3.0] */
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
  /* Upper balcony overlooking impluvium pool */
  raFloorSlab(0,y2,-2.1,6.4,1.2,{mk:'dolomite',th:.16});
  svNoWalk(()=>box('silver',0,y2+.01,-1.55,6.4,.84,.08,P('silver')));

  /* Upturned Lanna multi-gable roof over rear wing + NE corner stone watch-chedi spire! */
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

/* 8. Upland Porphyry-Plinth and Shan-Lanna Tiered-Roof Townhouse */
defBuilding({
 key:'ra_east_terrace_house',
 name:'Upland Porphyry-Plinth and Shan-Lanna Tiered-Roof Townhouse',
 seed:7208,w:17,d:16,h:14.4,budget:80000,cut:true,
 front:{x:0,z:7.2,yaw:0},
 tags:{style:'upper-ria',wealth:'middle',types:['dwelling-single','shop'],role:'townhouse'},
 build(){
  /* Stepped dolomite & porphyry plinth */
  const y1=raPlinth(13.2,11.6,.52,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:2.6,stepRun:1.2,rail:'hongsa',railOpts:{scale:.62}
  });

  /* Dressed red-porphyry & dolomite ashlar ground-floor vault [-6.0..6.0, -5.2..5.0] with battered stone doorway */
  const gh=3.55,y2=y1+gh;
  raWallRing(-6.0,-5.2,6.0,5.0,y1,gh,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[{at:0,w:1.75,h:2.35,door:true,frameMk:'dolomite',crownMk:'silver',name:'townhouse-vault-door'},{at:-3.6,w:1.1,h:1.35,y:1.0},{at:3.6,w:1.1,h:1.35,y:1.0}],
    n:[{at:-3.2,w:1.1,h:1.35,y:1.0},{at:3.2,w:1.1,h:1.35,y:1.0}],
    e:[{at:0,w:1.1,h:1.35,y:1.0}],
    w:[{at:0,w:1.1,h:1.35,y:1.0}]
   }
  });

  /* Interior stair climbing to overhanging carved cedar/teak upper dwelling */
  const st=svStair(4.0,-3.8,y1,y2,0,{w:1.05,riser:.18,going:.26,mk:'cedar',smk:'teak',col:P('cedar'),scol:P('teak'),rail:'both'});
  /* Overhanging upper floor [-6.5..6.5, -5.6..5.8] cantilevered on carved porphyry & cedar corbel brackets */
  raFloorSlab(0,y2,.1,13.0,11.4,{mk:'floor',th:.18,hole:st});
  raCeilingSlab(-1.2,y2-.24,-.1,9.2,9.4,{mk:'cedar',trimMk:'silver'});
  svNoWalk(()=>{
   for(const bx of [-5.6,-2.8,0,2.8,5.6])for(const bz of [-5.25,5.05]){
    beam('porphyry',[bx,y2-.85,bz*.92],[bx,y2-.18,bz*1.06],.18,P('porphyry'));
   }
  });

  /* Upper carved cedar & teak dwelling [-6.3..6.3, -5.4..4.2] + covered front Lanna balcony [4.2..5.7] */
  const uh=3.3,yRoof=y2+uh;
  svNoWalk(()=>{
   box('carvedwood',0,y2+.01,5.68,12.8,.86,.1,P('cedar'));
   for(const sx of [-6.35,6.35])box('carvedwood',sx,y2+.01,4.95,.1,.86,1.45,P('cedar'));
  });
  for(const bx of [-6.2,-2.2,2.2,6.2]){
   raColumn(bx,y2,5.55,uh,{style:'upper-ria',mk:'teak',capMk:'silver',baseMk:'porphyry',r:.16,block:false});
  }
  raWallRing(-6.3,-5.4,6.3,4.2,y2,uh,{
   style:'upper-ria',mk:'cedar',socMk:'teak',dadoMk:'carvedwood',postMk:'teak',cornice:false,
   holes:{
    s:[{at:0,w:1.55,h:2.15,door:true,leafMk:'teak',crownMk:'silver',name:'townhouse-balcony-door'},{at:-3.6,w:1.15,h:1.4,y:.95},{at:3.6,w:1.15,h:1.4,y:.95}],
    n:[{at:-3.2,w:1.15,h:1.4,y:.95},{at:3.2,w:1.15,h:1.4,y:.95}],
    e:[{at:-.6,w:1.15,h:1.4,y:.95}],
    w:[{at:-.6,w:1.15,h:1.4,y:.95}]
   }
  });

  /* Two-Tier Shan/Lanna Indigo-Slate Roof with Silver-Bronze Hongsa Swan gable finials & solid cedar ceiling! */
  raTieredRoof(0,yRoof,.1,13.0,11.4,2,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'cedar',neckMk:'copper',
   over:.68,tierRise:1.42,neckH:.36,stepIn:.76
  });

  raTarget(-1.2,y1,0,'porphyry-ground-vault',true);
  raTarget(-1.2,y2,-.6,'shan-lanna-upper-hall',true);
  raTarget(0,y2,4.9,'townhouse-front-balcony',true);

  raFurnList([
   ['ria_amber_seal_desk',-2.4,y1,-2.2,0],
   ['ria_glazed_amphora_rack',-4.6,y1,.8,PI/2],
   ['ria_tribute_chest',1.2,y1,-3.4,0],
   ['ria_teak_divan',-3.4,y2,-3.2,0],
   ['ria_porphyry_table',-1.2,y2,.6,0],
   ['ria_saffron_cushion',-1.2,y2,1.8,PI],
   ['ria_saffron_cushion',-1.2,y2,-.6,0],
   ['ria_lantern_stand',-4.2,y2,4.9,0]
  ]);
 }
});
