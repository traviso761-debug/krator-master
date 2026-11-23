// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — PANTHEON, DROMOS, DICASTERY & RELIQUARY (19-22)
// Four Upper Ria civic & sacred monuments adapting the 7 attached Rattanakosin & Classical reference photos to the High-Ria
// Liwa-Toga red-porphyry, cream-dolomite, white-alabaster, indigo-slate & silver-bronze architectural grammar (50/50 balance):
//   19. ra_east_thepbidorn_pantheon — Cruciform peristyle royal ancestor Pantheon-Prasat + overlapping roofs + white porcelain Prang
//   20. ra_east_kinnara_dromos      — Spear-guardian statue cloister, arched crimson-shuttered gallery, lotus basins & twin white Prangs
//   21. ra_east_archon_dicastery    — Two-storey porphyry-and-dolomite Classical law-court & senate + Triple Lanna Prasat Spires
//   22. ra_east_caryatid_reliquary  — Pierced marble terrace + Silver-Caryatid Stupa + Battered Bussabok Gate + Peripteral Mondop

/* 19. Cruciform Peristyle Royal Ancestor Pantheon-Prasat (ref 20260202_141629.jpg) */
defBuilding({
 key:'ra_east_thepbidorn_pantheon',
 name:'Cruciform Peristyle Royal Ancestor Pantheon-Prasat',
 seed:7219,w:34,d:32,h:27.2,budget:138000,cut:true,
 front:{x:0,z:14.1,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious','civic'],role:'pantheon',job:'worship'},
 build(){
  /* Elevated imperial red-porphyry & cream-dolomite stylobate + twin Compass-Hills lodestone obelisks */
  const y1=1.45;
  raNoCut(()=>svNoWalk(()=>{
   box('porphyry',0,0,-1.2,27.4,.62,24.2,P('porphyry'));
   box('dolomite',0,.62,-1.2,27.0,.72,23.8,P('dolomite'));
  }));
  raFloorSlab(0,y1,-1.2,26.6,23.4,{mk:'mosaic',th:.11});
  raGrandStair(0,0,13.9,0,y1,10.4,3.8,{mk:'alabaster',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.95}});
  raLodestoneObelisk(-11.2,0,12.8,7.2,{w:.72});
  raLodestoneObelisk(11.2,0,12.8,7.2,{w:.72});
  for(const sx of [-11.4,11.4])for(const sz of [-11.4,8.8]){
   raTopiaryUrn(sx,y1,sz,.85,true);
  }

  /* Open Cruciform Sanctuary [-4.4..4.4, -10.0..7.6] x [-10.4..10.4, -5.6..3.2] (zero duplicate corner posts!) */
  const gh=4.65,yRoof=y1+gh,pw=RA.WALL+.08,hp=pw*.5+.01;
  raWallRing(-4.4,3.2,4.4,7.6,y1,gh,{
   skip:'n',style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',postMk:'dolomite',cornice:false,
   holes:{
    s:[{at:0,w:2.1,h:2.75,door:true,crownMk:'gold',name:'thepbidorn-south-door'}],
    e:[{at:5.4,w:1.15,h:1.7,y:1.05,pediment:true,crownMk:'gold'}],
    w:[{at:5.4,w:1.15,h:1.7,y:1.05,pediment:true,crownMk:'gold'}]
   }
  });
  raWallRing(-4.4,-10.0,4.4,-5.6,y1,gh,{
   skip:'s',style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',postMk:'dolomite',cornice:false,
   holes:{
    n:[{at:0,w:1.4,h:1.85,y:1.05,pediment:true,crownMk:'gold'}],
    e:[{at:-7.8,w:1.15,h:1.7,y:1.05,pediment:true,crownMk:'gold'}],
    w:[{at:-7.8,w:1.15,h:1.7,y:1.05,pediment:true,crownMk:'gold'}]
   }
  });
  /* West & East Transept arms built cleanly outside the central crossing posts (+/-4.4) */
  svNoWalk(()=>{
   for(const cx of [-10.4,10.4])for(const cz of [-5.6,3.2]){
    box('porphyry',cx,y1,cz,pw+.04,.52,pw+.04,P('porphyry'));
    box('dolomite',cx,y1+.52,cz,pw,gh-.52,pw,P('dolomite'));
   }
  });
  for(const cx of [-10.4,10.4])for(const cz of [-5.6,3.2])raWallBlock(cx,y1,cz,pw,gh,pw,0);

  /* West Transept walls */
  raWall(-10.4+hp,3.2,-4.4-hp,3.2,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:(-7.4)-(-10.4+hp),w:1.2,h:1.75,y:1.05,pediment:true,crownMk:'gold'}]
  });
  raWall(-4.4-hp,-5.6,-10.4+hp,-5.6,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:(-4.4-hp)-(-7.4),w:1.2,h:1.75,y:1.05,pediment:true,crownMk:'gold'}]
  });
  raWall(-10.4,-5.6+hp,-10.4,3.2-hp,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:(-1.2)-(-5.6+hp),w:1.85,h:2.55,door:true,crownMk:'gold',name:'thepbidorn-west-door'}]
  });

  /* East Transept walls */
  raWall(4.4+hp,3.2,10.4-hp,3.2,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:7.4-(4.4+hp),w:1.2,h:1.75,y:1.05,pediment:true,crownMk:'gold'}]
  });
  raWall(10.4-hp,-5.6,4.4+hp,-5.6,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:(10.4-hp)-7.4,w:1.2,h:1.75,y:1.05,pediment:true,crownMk:'gold'}]
  });
  raWall(10.4,3.2-hp,10.4,-5.6+hp,y1,gh,{
   style:'upper-ria',mk:'cobalt',socMk:'porphyry',dadoMk:'gold',
   holes:[{at:(3.2-hp)-(-1.2),w:1.85,h:2.55,door:true,crownMk:'gold',name:'thepbidorn-east-door'}]
  });

  raRoom(-4.4,-5.6,4.4,3.2,y1,gh);
  raRoom(-10.4,-5.6,-4.4,3.2,y1,gh);
  raRoom(4.4,-5.6,10.4,3.2,y1,gh);

  /* Full Exterior Peristyle of Tall Dolomite-Porphyry-and-Gold Square Columns around all 4 Cruciform Arms */
  for(const px of [-3.6,-1.4,1.4,3.6]){
   raMosaicSquareCol(px,y1,9.3,gh,{style:'upper-ria',w:.42,block:false});
   raMosaicSquareCol(px,y1,-11.6,gh,{style:'upper-ria',w:.42,block:false});
  }
  for(const pz of [-4.6,-2.4,.2,2.4]){
   raMosaicSquareCol(-12.1,y1,pz,gh,{style:'upper-ria',w:.42,block:false});
   raMosaicSquareCol(12.1,y1,pz,gh,{style:'upper-ria',w:.42,block:false});
  }
  for(const sx of [-6.2,6.2])for(const sz of [5.4,7.8,-7.8,-10.2]){
   raMosaicSquareCol(sx,y1,sz,gh,{style:'upper-ria',w:.4,block:false});
  }

  /* Overlapping Multi-Tier Cruciform Roofs (stepped +0.24 m in Y -> zero coplanar soffits!) + Central Porcelain Prang! */
  raTieredRoof(0,yRoof,-1.2,24.8,9.6,3,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'terracotta',trimMk:'gold',soffitMk:'dolomite',neckMk:'indigoslate',
   over:.66,tierRise:1.04,ceiling:true
  });
  /* Non-overlapping interior & peristyle ceiling slabs for the N and S nave arms */
  raCeilingSlab(0,yRoof+.02,6.5,11.6,5.4,{mk:'dolomite',trimMk:'gold'});
  raCeilingSlab(0,yRoof+.02,-8.9,11.6,5.4,{mk:'dolomite',trimMk:'gold'});

  raTieredRoof(0,yRoof+.24,-1.2,12.2,21.6,3,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'gold',soffitMk:'dolomite',neckMk:'alabaster',
   over:.66,tierRise:1.08,ceiling:false
  });
  raPorcelainPrang(0,yRoof+3.65,-1.2,5.4,15.0,{
   style:'upper-ria',mk:'alabaster',bandMk:'celadon',accMk:'porphyry',trimMk:'gold',vault:false
  });

  raTarget(0,y1,8.5,'pantheon-south-peristyle',true);
  raTarget(0,y1,-1.2,'pantheon-central-crossing',true);
  raTarget(0,y1,-7.8,'pantheon-ancestor-chancel',true);
  raTarget(-7.6,y1,-1.2,'pantheon-west-transept',true);
  raTarget(7.6,y1,-1.2,'pantheon-east-transept',true);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-8.4,0],
   ['ria_lotus_altar',0,y1,-6.2,0],
   ['ria_hongsa_lectern',-2.4,y1,-4.2,.2],
   ['ria_lodestone_compass',2.4,y1,-4.2,-.2],
   ['ria_lotus_altar',-8.2,y1,-1.2,PI/2],
   ['ria_lotus_altar',8.2,y1,-1.2,-PI/2],
   ['ria_silk_screen',-2.8,y1,-8.4,.22],
   ['ria_silk_screen',2.8,y1,-8.4,-.22],
   ['ria_lantern_stand',-2.6,y1,5.2,0],
   ['ria_lantern_stand',2.6,y1,5.2,0]
  ]);
 }
});

/* 20. Spear-Guardian Statue Cloister, Lustral Basins and Twin White Prangs (ref 20260202_132923.jpg) */
defBuilding({
 key:'ra_east_kinnara_dromos',
 name:'Spear-Guardian Statue Cloister, Lustral Basins and Twin White Prangs',
 seed:7220,w:28,d:30,h:22.8,budget:134000,cut:true,
 front:{x:0,z:14.1,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious','park'],role:'dromos-cloister',job:'worship'},
 build(){
  const y1=.62,ySanct=1.36;
  raNoCut(()=>svNoWalk(()=>{
   box('porphyry',0,0,.4,24.8,.32,26.6,P('porphyry'));
   box('dolomite',0,.32,.4,24.5,.22,26.3,P('dolomite'));
  }));
  raFloorSlab(0,y1,.4,24.2,26.0,{mk:'paving',th:.08});
  raGrandStair(0,0,14.0,0,y1,12.6,3.8,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.75}});

  /* East & West White-Alabaster Classical Round-Arch Cloister Walls with Crimson-Lacquer Shutters (ref 132923) */
  for(const s of [-1,1]){
   const ax=s*11.2;
   raArcade(ax,12.2,ax,-2.2,y1,3.6,{style:'upper-ria',bays:4,mk:'alabaster',trimMk:'dolomite',pierW:.52});
   svNoWalk(()=>{
    for(let b=0;b<4;b++){
     const bz=lerp(10.4,-.4,b/3);
     box('crimson',ax+s*.28,y1+.82,bz,.08,1.42,1.38,P('crimson'));
     box('gold',ax+s*.24,y1+.82,bz,.03,1.28,.08,P('gold'));
    }
   });
  }

  /* Sacred Dromos Avenue of 6 Pale-Alabaster Spear-Bearing Kinnara Guardians + Twin Lotus Lustral Basins */
  for(const gz of [10.0,6.0,2.0]){
   raGuardianStatue(-3.2,y1,gz,PI/2,.96,true);
   raGuardianStatue(3.2,y1,gz,-PI/2,.96,true);
  }
  raWaterCourt(-7.4,7.4,4.8,4.2,y1+.34,.44,{style:'upper-ria',curbMk:'porphyry',trimMk:'celadon',lotus:5});
  raWaterCourt(7.4,7.4,4.8,4.2,y1+.34,.44,{style:'upper-ria',curbMk:'porphyry',trimMk:'celadon',lotus:5});
  for(const sx of [-7.4,7.4])for(const sz of [11.2,3.8]){
   raTopiaryUrn(sx,y1,sz,.8,true);
  }

  /* Twin White-and-Cobalt Porcelain Stepped Prangs flanking the north end of the Guardian Avenue (ref 132923) */
  for(const sx of [-7.6,7.6]){
   raPorcelainPrang(sx,y1,.8,3.5,11.6,{
    style:'upper-ria',mk:'alabaster',bandMk:'cobalt',accMk:'porphyry',trimMk:'silver',vault:false
   });
   raWallBlock(sx,y1,.8,3.1,4.4,3.1,0);
  }

  /* Rear Raised Reliquary Viharn Sanctuary [-8.4..8.4, -11.8..-4.8] */
  raNoCut(()=>svNoWalk(()=>{
   box('porphyry',0,y1+.01,-8.0,19.6,.38,9.0,P('porphyry'));
   box('alabaster',0,y1+.39,-8.0,19.2,.28,8.7,P('alabaster'));
  }));
  raFloorSlab(0,ySanct,-8.0,18.8,8.4,{mk:'mosaic',th:.08});
  raGrandStair(0,y1,-1.8,0,ySanct,-3.9,3.2,{mk:'alabaster',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.72}});

  const gh=4.15;
  raColonnade(-7.8,-4.1,7.8,-4.1,ySanct,gh,{style:'upper-ria',n:6,skipMid:1.6,mk:'alabaster',altMk:'porphyry',r:.22,capital:'palm',block:false});
  raCeilingSlab(0,ySanct+gh-.08,-4.55,16.4,1.15,{mk:'dolomite',trimMk:'silver'});
  raWallRing(-8.4,-11.8,8.4,-5.0,ySanct,gh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[
     {at:-4.6,w:1.25,h:1.65,y:1.05,pediment:true,crownMk:'silver'},
     {at:0,w:2.0,h:2.6,door:true,crownMk:'silver',name:'kinnara-viharn-door'},
     {at:4.6,w:1.25,h:1.65,y:1.05,pediment:true,crownMk:'silver'}
    ],
    e:[{at:-8.4,w:1.25,h:1.65,y:1.05,pediment:true}],
    w:[{at:-8.4,w:1.25,h:1.65,y:1.05,pediment:true}]
   }
  });
  raTieredRoof(0,ySanct+gh,-8.4,17.2,7.4,3,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.68,tierRise:1.1,spire:true,spireH:5.0
  });

  raTarget(0,y1,6.0,'kinnara-guardian-dromos',false);
  raTarget(0,ySanct,-4.5,'viharn-palm-portico',true);
  raTarget(0,ySanct,-8.4,'reliquary-viharn-sanctum',true);

  raFurnList([
   ['ria_lotus_altar',0,ySanct,-10.2,0],
   ['ria_hongsa_lectern',-2.6,ySanct,-8.2,.2],
   ['ria_lodestone_compass',2.6,ySanct,-8.2,-.2],
   ['ria_saffron_cushion',-1.5,ySanct,-6.8,0],
   ['ria_saffron_cushion',1.5,ySanct,-6.8,0],
   ['ria_tribute_chest',-6.2,ySanct,-9.8,PI/2],
   ['ria_tribute_chest',6.2,ySanct,-9.8,-PI/2],
   ['ria_offering_basin',-5.2,y1,-1.8,0],
   ['ria_offering_basin',5.2,y1,-1.8,0],
   ['ria_lantern_stand',-2.6,ySanct,-4.4,0],
   ['ria_lantern_stand',2.6,ySanct,-4.4,0]
  ]);
 }
});

/* 21. Porphyry-and-Dolomite Triple-Spire Civic Dicastery and Senate (ref 20260202_142701.jpg in Upper Ria grammar) */
defBuilding({
 key:'ra_east_archon_dicastery',
 name:'Porphyry-and-Dolomite Triple-Spire Civic Dicastery and Senate',
 seed:7221,w:34,d:24,h:25.0,budget:136000,cut:true,
 front:{x:0,z:10.8,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['civic'],role:'courthouse',job:'scribing'},
 build(){
  const y1=raPlinth(28.4,15.2,1.25,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'paving',
   stepW:4.0,stepRun:2.7,rail:'hongsa',railOpts:{scale:.9}
  });
  raLodestoneObelisk(-12.2,0,10.2,6.8,{w:.68});
  raLodestoneObelisk(12.2,0,10.2,6.8,{w:.68});
  for(const ux of [-8.4,-4.2,4.2,8.4]){
   raTopiaryUrn(ux,0,9.6,.9,true);
  }

  /* Ground-floor rusticated red-porphyry & cream-dolomite round-arch loggias + central palm portico */
  const gh=4.15,y2=y1+gh;
  raArcade(-12.6,6.9,-3.2,6.9,y1,gh,{style:'upper-ria',bays:3,mk:'dolomite',trimMk:'porphyry',pierW:.54});
  raArcade(3.2,6.9,12.6,6.9,y1,gh,{style:'upper-ria',bays:3,mk:'dolomite',trimMk:'porphyry',pierW:.54});
  raColonnade(-2.8,7.1,2.8,7.1,y1,gh,{style:'upper-ria',n:4,skipMid:1.2,mk:'alabaster',altMk:'porphyry',r:.24,capital:'palm',block:false});
  raCeilingSlab(0,y2-.14,5.65,25.8,2.4,{mk:'dolomite',trimMk:'silver'});

  /* Three-wing Dicastery ground shell [-12.8..12.8, -7.0..4.4] */
  raWallRing(-12.8,-7.0,12.8,4.4,y1,gh,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-8.2,w:1.55,h:2.4,door:true,crownMk:'silver',name:'dicastery-west-archive-door'},
     {at:-4.4,w:1.25,h:1.65,y:1.05,pediment:true,crownMk:'silver'},
     {at:0,w:2.2,h:2.8,door:true,crownMk:'silver',name:'dicastery-senate-portal'},
     {at:4.4,w:1.25,h:1.65,y:1.05,pediment:true,crownMk:'silver'},
     {at:8.2,w:1.55,h:2.4,door:true,crownMk:'silver',name:'dicastery-east-assize-door'}
    ],
    n:[{at:-7.8,w:1.3,h:1.65,y:1.05},{at:0,w:1.5,h:1.8,y:1.05,pediment:true,crownMk:'silver'},{at:7.8,w:1.3,h:1.65,y:1.05}],
    e:[{at:-1.3,w:1.35,h:1.65,y:1.05,pediment:true}],
    w:[{at:-1.3,w:1.35,h:1.65,y:1.05,pediment:true}]
   }
  });
  for(const ix of [-5.2,5.2]){
   raWall(ix,-6.5,ix,3.9,y1,gh,{
    style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',
    holes:[{at:5.2,w:1.85,h:2.5,door:true,open:true}]
   });
  }

  /* Interior West-wing stone stair ascending from y1 (1.25) to upper senate y2 (5.40) */
  const st=svStair(-9.2,-5.0,y1,y2,0,{w:1.35,riser:.18,going:.27,mk:'dolomite',smk:'silver',col:P('dolomite'),scol:P('silver'),rail:'both'});
  raFloorSlab(0,y2,-1.3,25.2,11.0,{mk:'mosaic',th:.2,hole:st});
  raCeilingSlab(0,y2-.26,-1.3,9.8,10.6,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(9.0,y2-.26,-1.3,6.8,10.6,{mk:'dolomite',trimMk:'silver'});

  /* Upper-Storey Classical Porphyry-Pilaster Senate Gallery [-12.2..12.2, -6.4..4.0] */
  const uh=3.8,yRoof=y2+uh;
  raWallRing(-12.2,-6.4,12.2,4.0,y2,uh,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[
     {at:-8.8,w:1.25,h:1.65,y:.95,pediment:true,crownMk:'silver'},
     {at:-5.4,w:1.25,h:1.65,y:.95,pediment:true,crownMk:'silver'},
     {at:0,w:1.85,h:2.4,door:true,crownMk:'silver',name:'dicastery-balcony-door'},
     {at:5.4,w:1.25,h:1.65,y:.95,pediment:true,crownMk:'silver'},
     {at:8.8,w:1.25,h:1.65,y:.95,pediment:true,crownMk:'silver'}
    ],
    n:[{at:-7.6,w:1.25,h:1.6,y:.95},{at:0,w:1.45,h:1.7,y:.95,pediment:true,crownMk:'silver'},{at:7.6,w:1.25,h:1.6,y:.95}],
    e:[{at:-1.2,w:1.3,h:1.6,y:.95,pediment:true}],
    w:[{at:-1.2,w:1.3,h:1.6,y:.95,pediment:true}]
   }
  });
  svNoWalk(()=>{
   for(const px of [-10.8,-7.1,-3.5,3.5,7.1,10.8]){
    box('porphyry',px,y2+.48,4.26,.3,uh-.76,.08,P('porphyry'));
    box('silver',px,y2+uh-.28,4.28,.4,.14,.11,P('silver'));
   }
  });

  /* Projecting Upper Classical Palm-Column Portico & Pediment */
  raFloorSlab(0,y2,5.55,6.2,2.9,{mk:'dolomite',th:.18});
  raClassicalBalustrade(-2.9,6.92,2.9,6.92,y2,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry',skipMid:1.15});
  raColonnade(-2.8,6.85,2.8,6.85,y2,uh-.12,{style:'upper-ria',n:4,skipMid:1.2,mk:'alabaster',altMk:'porphyry',r:.22,capital:'palm',block:false});
  raCeilingSlab(0,yRoof-.1,5.5,5.8,2.7,{mk:'dolomite',trimMk:'silver'});
  raClassicalPediment(0,yRoof-.06,5.65,0,6.4,1.38,2.8,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* 50/50 TRIPLE LANNA PRASAT CROWN: Classical Dolomite Balustrade Decks + Twin Corner Spires + Central Lanna Prasat! */
  for(const lx of [-5.2,5.2]){
   raFlatTerraceRoof(lx,yRoof,-1.2,3.0,10.4,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',parapet:'balustrade',skip:'ew'
   });
  }
  for(const sx of [-9.4,9.4]){
   raTieredRoof(sx,yRoof,-1.2,5.6,10.6,3,{
    style:'upper-ria',mode:'hip',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'porphyry',
    over:.56,tierRise:.95,neckH:.38,stepIn:.76,spire:true,spireH:4.2
   });
  }
  raCeilingSlab(0,yRoof+.02,-1.2,7.4,10.2,{mk:'dolomite',trimMk:'silver'});
  svNoWalk(()=>{
   box('porphyry',0,yRoof+.12,-1.2,7.8,.36,10.6,P('porphyry'));
   box('alabaster',0,yRoof+.48,-1.2,7.96,.1,10.76,P('alabaster'));
  });
  raTieredRoof(0,yRoof+.58,-1.2,7.8,10.6,4,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.68,tierRise:1.06,neckH:.42,stepIn:.76,ceiling:false,spire:true,spireH:5.4
  });

  raTarget(0,y1,5.6,'dicastery-front-arcade',true);
  raTarget(0,y1,-1.3,'archon-tribunal-hall',true);
  raTarget(-9.0,y1,1.8,'west-charter-stair-hall',true);
  raTarget(9.0,y1,-1.3,'east-assize-chamber',true);
  raTarget(0,y2,-1.2,'upper-senate-chamber',true);
  raTarget(0,y2,5.5,'senate-portico-balcony',true);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-4.6,0],
   ['ria_hongsa_lectern',-2.2,y1,-3.2,.2],
   ['ria_lodestone_compass',2.2,y1,-3.2,-.2],
   ['ria_amber_seal_desk',8.8,y1,-3.2,0],
   ['ria_amber_seal_desk',8.8,y1,.4,PI],
   ['ria_tribute_chest',10.8,y1,-5.2,-PI/2],
   ['ria_sovereign_throne',0,y2,-4.2,0],
   ['ria_porphyry_table',6.8,y2,-1.4,0],
   ['ria_hongsa_lectern',-6.4,y2,-2.2,PI/2],
   ['ria_silk_screen',-2.8,y2,-4.5,.2],
   ['ria_silk_screen',2.8,y2,-4.5,-.2],
   ['ria_lantern_stand',-3.2,y1,2.4,0],
   ['ria_lantern_stand',3.2,y1,2.4,0]
  ]);
 }
});

/* 22. Pierced-Marble Terrace, Silver-Caryatid Stupa and Peripteral Scripture Mondop (refs 133726, 141535 & 142016) */
defBuilding({
 key:'ra_east_caryatid_reliquary',
 name:'Pierced-Marble Terrace, Silver-Caryatid Stupa and Peripteral Scripture Mondop',
 seed:7222,w:28,d:26,h:24.2,budget:134000,cut:true,
 front:{x:0,z:11.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious','funerary'],role:'scripture-terrace',job:'worship'},
 build(){
  const y1=1.3;
  raNoCut(()=>svNoWalk(()=>{
   box('porphyry',0,0,-.8,23.8,.52,19.8,P('porphyry'));
   box('dolomite',0,.52,-.8,23.4,.68,19.4,P('dolomite'));
  }));
  raFloorSlab(0,y1,-.8,23.0,19.0,{mk:'paving',th:.1});
  raGrandStair(0,0,11.7,0,y1,8.7,3.2,{mk:'alabaster',sideMk:'porphyry',cheek:false});

  /* South Battered Porphyry-Alabaster-and-Silver Bussabok Precinct Portal + Pierced Dolomite Fretwork Balustrades */
  raBussabokPortal(0,y1,8.35,0,2.25,2.8,{style:'upper-ria',d:1.5,door:true,name:'east-bussabok-portal'});
  raPiercedFretWall(-11.2,8.35,-2.75,8.35,y1,{style:'upper-ria',block:true});
  raPiercedFretWall(2.75,8.35,11.2,8.35,y1,{style:'upper-ria',block:true});
  raPiercedFretWall(11.2,8.05,11.2,-10.05,y1,{style:'upper-ria',block:true});
  raPiercedFretWall(-11.2,-10.05,-11.2,8.05,y1,{style:'upper-ria',block:true});
  raPiercedFretWall(11.2,-10.05,-11.2,-10.05,y1,{style:'upper-ria',block:true});

  /* East Terrace: Silver-and-Gold Indented-Square Stupa on 12 Porphyry & Silver Atlas Caryatids + Lotus Basin */
  raCaryatidChedi(6.4,y1,2.2,4.0,12.2,{style:'upper-ria'});
  raWaterCourt(6.4,-5.2,4.6,4.0,y1+.32,.44,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:4});
  raTopiaryUrn(9.6,y1,6.2,.82,true);
  raTopiaryUrn(-9.6,y1,6.2,.82,true);

  /* West-North Terrace: Peripteral 5x5 Porphyry-and-Gold Square-Column Mondop Scripture Sanctuary (ref 141535) */
  const colH=4.9,yRoof=y1+colH;
  const xs=[-9.2,-6.4,-3.6,-.8,2.0],zs=[-8.4,-5.6,-2.8,0,2.8];
  for(let ix=0;ix<xs.length;ix++){
   for(let iz=0;iz<zs.length;iz++){
    if(ix>0&&ix<xs.length-1&&iz>0&&iz<zs.length-1)continue;
    if(ix===2&&iz===zs.length-1)continue;
    if(ix===xs.length-1&&iz===2)continue;
    raMosaicSquareCol(xs[ix],y1,zs[iz],colH,{style:'upper-ria',mk:'dolomite',inlayMk:'porphyry',capMk:'gold',w:.4,block:false});
   }
  }
  raWallRing(-7.0,-6.2,-.2,.6,y1,colH,{
   style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'gold',postMk:'alabaster',cornice:false,
   holes:{
    s:[{at:-3.6,w:1.8,h:2.55,door:true,crownMk:'gold',name:'east-mondop-south-door'}],
    e:[{at:-2.8,w:1.65,h:2.4,door:true,crownMk:'gold',name:'east-mondop-east-door'}],
    n:[{at:-3.6,w:1.2,h:1.75,y:1.1,pediment:true,crownMk:'gold'}],
    w:[{at:-2.8,w:1.2,h:1.75,y:1.1,pediment:true,crownMk:'gold'}]
   }
  });
  raMondopSpireRoof(-3.6,yRoof,-2.8,12.0,12.0,5,5.8,{
   style:'upper-ria',mk:'indigoslate',trimMk:'gold',soffitMk:'dolomite',neckMk:'porphyry',tierRise:1.06
  });

  raTarget(0,y1,8.35,'east-bussabok-threshold',true);
  raTarget(2.8,y1,4.8,'caryatid-terrace-court',false);
  raTarget(-3.6,y1,1.7,'east-mondop-peristyle',true);
  raTarget(-3.6,y1,-2.8,'amber-tablet-sanctum',true);

  raFurnList([
   ['ria_lotus_altar',-3.6,y1,-4.6,0],
   ['ria_hongsa_lectern',-5.2,y1,-2.4,PI/2],
   ['ria_amber_seal_desk',-2.0,y1,-1.4,PI],
   ['ria_tribute_chest',-5.4,y1,-4.6,PI/2],
   ['ria_lodestone_compass',2.8,y1,2.2,0],
   ['ria_offering_basin',2.8,y1,-1.8,0],
   ['ria_lantern_stand',-1.4,y1,4.8,0],
   ['ria_lantern_stand',2.4,y1,5.6,0]
  ]);
 }
});
