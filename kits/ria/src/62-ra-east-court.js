// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — ACROPOLIS, MANDALA & DOME (1-4)
// Fusion grammar: cut imperial red-porphyry & cream-white karst dolomite ashlar + Classical/Egyptian lotus-and-papyrus
// colonnades + Compass-Hills lodestone-capped obelisks (lodestone = 220), crowned by Northern Lanna / Wat Rong Khun white-dolomite
// & indigo-slate multi-tier Prasat roofs, Circular Mandala Cloisters & Shikhara-Prangs, upturned Bagan/Nusantara ribbed Lotus Domes,
// and Silver-Bronze Crested Water-Swan (Hongsa) balustrades & finials.

/* 1. Akwala-Liwayi White-Dolomite and Indigo-Slate Grand Hongsa Terrace-Palace (image_14.png) */
defBuilding({
 key:'ra_east_swan_prasat',
 name:'Akwala-Liwayi White-Dolomite and Indigo-Slate Grand Hongsa Terrace-Palace',
 seed:7201,w:36,d:30,h:27.5,budget:138000,cut:true,
 front:{x:0,z:13.9,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['civic'],role:'palace'},
 build(){
  /* Karst spring reflecting pool across the foreground, spanned by a ceremonial Hongsa causeway bridge-stair! */
  raWaterCourt(0,9.4,31.2,7.2,.36,.62,{style:'upper-ria',curbMk:'dolomite',trimMk:'porphyry',lotus:10,waterMesh:false});
  if(CURREC&&!PLACE_DRY){
   const wPts=[[-14.8,.12,9.4],[0,.12,9.4],[14.8,.12,9.4]].map(q=>{
    const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
    return [v.x,v.z,v.y];
   });
   CURREC.river={name:'akwala-spring-pool',pts:wPts,width:6.2,speed:.25};
  }
  /* Twin sculpted white-alabaster & silver karst spring fountain plumes */
  svNoWalk(()=>{
   for(const fx of [-9.4,9.4]){
    cyl('porphyry',fx,-.2,9.4,.68,.48,P('porphyry'),12);
    cyl('alabaster',fx,.28,9.4,.42,.26,P('alabaster'),12);
    cone('alabaster',fx,.54,9.4,.28,1.65,P('alabaster'),10);
   }
  });

  /* Two-stage carved cream-dolomite & imperial red-porphyry acropolis terraces (yT1 = 1.5 m, yT2 = 3.1 m) */
  const yT1=1.5,yT2=3.1;
  raNoCut(()=>svNoWalk(()=>{
   box('porphyry',0,0,-2.1,31.6,.68,17.8,P('porphyry'));
   box('dolomite',0,.68,-2.1,30.8,.76,17.2,P('dolomite'));
   box('porphyry',0,yT1,-3.0,26.8,.74,14.0,P('porphyry'));
   box('alabaster',0,yT1+.74,-3.0,26.2,.8,13.4,P('alabaster'));
  }));
  raFloorSlab(0,yT1,-2.1,30.4,16.8,{mk:'paving',th:.12});
  raFloorSlab(0,yT2,-3.0,25.8,13.0,{mk:'mosaic',th:.12});

  /* Sweeping ceremonial causeway bridge-stair across the karst spring pool flanked by Silver-Bronze Hongsa balustrades! */
  raFloorSlab(0,.42,13.3,5.2,1.5,{mk:'dolomite',th:.42});
  raStripWalk([0,0,14.1],[0,.42,12.9],4.2);
  raGrandStair(0,.42,12.6,0,yT1,6.0,4.2,{
   mk:'alabaster',sideMk:'porphyry',openUnder:false,rail:'hongsa',railOpts:{scale:1.15}
  });
  raGrandStair(0,yT1,5.2,0,yT2,2.9,3.8,{
   mk:'alabaster',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:1.0}
  });
  /* Flanking lateral stairs linking lower terrace wings to upper acropolis */
  raGrandStair(-11.2,yT1,1.6,-11.2,yT2,-.6,1.8,{mk:'dolomite',sideMk:'porphyry'});
  raGrandStair(11.2,yT1,1.6,11.2,yT2,-.6,1.8,{mk:'dolomite',sideMk:'porphyry'});

  /* White-dolomite & porphyry palace colonnade + central Sovereign Hongsa Hall [-7.6..7.6, -8.8..2.2] */
  const hallH=4.8,yRoof=yT2+hallH;
  raColonnade(-7.2,2.6,7.2,2.6,yT2,hallH,{style:'upper-ria',n:6,skipMid:1.8,mk:'alabaster',altMk:'porphyry',r:.26});
  raCeilingSlab(0,yRoof-.08,2.1,15.2,1.6,{mk:'dolomite',trimMk:'silver'});

  raWallRing(-7.6,-8.8,7.6,1.6,yT2,hallH,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[
     {at:-4.6,w:1.3,h:1.9,y:1.05,pediment:true,crownMk:'silver'},
     {at:0,w:2.3,h:2.85,door:true,crownMk:'silver',name:'hongsa-palace-portal'},
     {at:4.6,w:1.3,h:1.9,y:1.05,pediment:true,crownMk:'silver'}
    ],
    n:[{at:-4.2,w:1.3,h:1.8,y:1.05},{at:0,w:1.5,h:1.9,y:1.05,pediment:true,crownMk:'silver'},{at:4.2,w:1.3,h:1.8,y:1.05}],
    e:[{at:-3.6,w:1.6,h:2.35,door:true,open:true}],
    w:[{at:-3.6,w:1.6,h:2.35,door:true,open:true}]
   }
  });

  /* Twin flanking white-alabaster corner Prasat pavilion towers at x = -10.4 and x = +10.4 */
  for(const sx of [-10.4,10.4]){
   for(const px of [sx-1.9,sx+1.9])for(const pz of [-6.2,-1.6]){
    raColumn(px,yT2,pz,hallH-.2,{style:'upper-ria',mk:'alabaster',baseMk:'porphyry',capMk:'silver',r:.22,block:false});
   }
   raTieredRoof(sx,yT2+hallH-.2,-3.9,4.6,5.2,3,{
    style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
    over:.58,tierRise:1.05,neckH:.38,stepIn:.74,spire:true,spireH:4.8
   });
  }

  /* Soaring 4-Tier Northern Lanna / Wat Rong Khun Indigo-Slate & White-Alabaster Central Prasat Roof + Flame Spire! */
  raTieredRoof(0,yRoof,-3.6,15.8,11.0,4,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.85,tierRise:1.22,neckH:.46,stepIn:.76,spire:true,spireH:5.6
  });
  /* Projecting front gilded-silver & alabaster Mukha porch gable over the central stairhead */
  raTieredRoof(0,yRoof+.2,1.6,5.6,3.8,2,{
   style:'upper-ria',mode:'gable',gableAxis:'z',mk:'indigoslate',trimMk:'silver',soffitMk:'dolomite',
   over:.48,tierRise:1.15,ceiling:false
  });

  raLodestoneObelisk(-13.8,0,12.8,6.8,{w:.68});
  raLodestoneObelisk(13.8,0,12.8,6.8,{w:.68});

  raTarget(0,yT1,5.6,'lower-acropolis-terrace',false);
  raTarget(0,yT2,-3.6,'hongsa-sovereign-hall',true);
  raTarget(-10.4,yT2,-3.9,'west-swan-pavilion',true);
  raTarget(10.4,yT2,-3.9,'east-swan-pavilion',true);

  raFurnList([
   ['ria_sovereign_throne',0,yT2,-6.8,0],
   ['ria_hongsa_lectern',-2.4,yT2,-5.2,.2],
   ['ria_lodestone_compass',2.4,yT2,-5.2,-.2],
   ['ria_silk_screen',-3.4,yT2,-6.9,.22],
   ['ria_silk_screen',3.4,yT2,-6.9,-.22],
   ['ria_porphyry_table',-4.6,yT2,-2.2,0],
   ['ria_porphyry_table',4.6,yT2,-2.2,0],
   ['ria_saffron_cushion',-4.6,yT2,-1.0,PI],
   ['ria_saffron_cushion',4.6,yT2,-1.0,PI],
   ['ria_offering_basin',-10.4,yT2,-3.9,0],
   ['ria_offering_basin',10.4,yT2,-3.9,0],
   ['ria_lantern_stand',-2.8,yT2,.6,0],
   ['ria_lantern_stand',2.8,yT2,.6,0]
  ]);
 }
});

/* 2. Circular Dolomite and Porphyry Mandala Cloister and Shikhara-Prang Sanctuary (image_15.png) */
defBuilding({
 key:'ra_east_mandala_cloister',
 name:'Circular Dolomite and Porphyry Mandala Cloister and Shikhara-Prang Sanctuary',
 seed:7202,w:32,d:32,h:26.0,budget:135000,cut:true,
 front:{x:0,z:14.7,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious'],role:'sanctuary',job:'worship'},
 build(){
  /* Raised circular dolomite & imperial red-porphyry stylobate (r = 13.4 m, y1 = 1.15 m) */
  const y1=1.15;
  svNoWalk(()=>{
   cyl('porphyry',0,0,.6,13.8,.56,P('porphyry'),32);
   cyl('dolomite',0,.56,.6,13.5,.59,P('dolomite'),32);
  });
  raFloorDisc(0,.6,13.4,y1,'paving',P('paving'),{seg:32,th:.16});
  raGrandStair(0,0,15.0,0,y1,13.2,3.4,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.85}});

  /* Concentric circular Classical-Khmer stone colonnade [rIn = 9.4 .. rOut = 12.6] centred at (0, 0.6) */
  const clH=3.8,yRingTop=y1+clH;
  const opens=[{a:PI/2,w:2.4,h:2.65,door:true,crownMk:'silver',name:'mandala-south-gate'}];
  for(let k=1;k<12;k++){
   const a=PI/2+k/12*TAU;
   if(Math.abs(Math.sin(a)+1)<.18)continue; /* leave north arc solid behind central Shikhara-Prang */
   opens.push({a,w:1.15,h:1.45,y:1.05});
  }
  raDrumWall(0,.6,12.15,12.65,y1,clH,'dolomite',P('dolomite'),opens,{style:'upper-ria'});

  /* Inner ring of 16 fluted porphyry & dolomite columns + solid annular stone ceiling & entablature */
  for(let k=0;k<16;k++){
   const a=k/16*TAU;
   if(Math.sin(a)<-.78)continue;
   raColumn(Math.cos(a)*9.55,y1,.6+Math.sin(a)*9.55,clH,{
    style:'upper-ria',mk:k%2===0?'dolomite':'porphyry',capMk:'silver',baseMk:'porphyry',r:.22,block:false
   });
  }
  svNoWalk(()=>{
   /* Solid annular ceiling + cornice ring over the entire circular cloister gallery (zero sky leaks!) */
   sector('dolomite',0,.6,9.2,12.75,0,TAU,yRingTop,yRingTop+.34,P('dolomite'),32);
   sector('porphyry',0,.6,9.12,12.84,0,TAU,yRingTop+.34,yRingTop+.52,P('porphyry'),32);
  });

  /* 12 Gilded Stepped Pyramidal Cupola-Caps ringing the circular Mandala cloister roof! */
  for(let k=0;k<12;k++){
   const a=PI/2+k/12*TAU;
   if(Math.sin(a)<-.82)continue;
   const cx=Math.cos(a)*10.95,cz=.6+Math.sin(a)*10.95;
   raOctPavilionRoof(cx,yRingTop+.52,cz,1.45,2,{style:'upper-ria',seg:4,mk:'giltroof',trimMk:'gold',soffitMk:'dolomite',tierRise:.68});
  }

  /* Inlaid porphyry, saffron & alabaster 8-petal Lotus-Mandala floor at court center (stepped +2.5 cm proud -> 0 z-fighting!) */
  svNoWalk(()=>{
   cyl('porphyry',0,y1+.02,.6,5.2,.03,P('porphyry'),24);
   for(let p=0;p<8;p++){
    const a=p/8*TAU;
    W(Math.cos(a)*2.9,y1+.052,.6+Math.sin(a)*2.9,-a+PI/2,()=>{
     box('saffron',0,0,0,1.35,.03,2.2,P('saffron'),PI/4);
    });
   }
   cyl('alabaster',0,y1+.085,.6,1.85,.035,P('alabaster'),16);
   cyl('gold',0,y1+.122,.6,.72,.04,P('gold'),12);
  });

  /* Bundled Stone Shikhara-Prang Sanctuary rising on the north axis (z = -5.8) + twin subsidiary Pranglets! */
  const ySanct=y1+.95;
  raFloorSlab(0,ySanct,-6.2,9.8,7.6,{mk:'mosaic',th:.95});
  raGrandStair(0,y1,-.6,0,ySanct,-2.6,2.4,{mk:'alabaster',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.7}});

  const shH=3.9;
  raWallRing(-3.4,-9.2,3.4,-3.0,ySanct,shH,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{s:[{at:0,w:1.75,h:2.4,door:true,crownMk:'silver',name:'shikhara-cella-door'}]}
  });
  raCeilingSlab(0,ySanct+shH+.02,-6.1,6.4,5.8,{mk:'dolomite',trimMk:'gold'});
  raPrang(0,ySanct+shH+.12,-6.1,7.0,17.2,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'gold',vault:true,openFront:true});
  for(const sx of [-4.2,4.2]){
   raPrang(sx,ySanct,-6.4,2.5,8.6,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'silver',vault:false});
   raWallBlock(sx,ySanct,-6.4,2.2,4.2,2.2,0);
  }

  raTarget(0,y1,10.8,'mandala-south-gallery',true);
  raTarget(-10.8,y1,.6,'mandala-west-gallery',true);
  raTarget(10.8,y1,.6,'mandala-east-gallery',true);
  raTarget(0,y1,1.6,'lotus-mandala-court',false);
  raTarget(0,ySanct,-6.1,'shikhara-inner-sanctum',true);

  raFurnList([
   ['ria_lotus_altar',0,ySanct,-7.6,0],
   ['ria_hongsa_lectern',-1.8,ySanct,-5.0,.25],
   ['ria_lodestone_compass',1.8,ySanct,-5.0,-.25],
   ['ria_offering_basin',-5.8,y1,3.2,0],
   ['ria_offering_basin',5.8,y1,3.2,0],
   ['ria_saffron_cushion',-10.8,y1,-2.2,PI/2],
   ['ria_saffron_cushion',-10.8,y1,2.8,PI/2],
   ['ria_saffron_cushion',10.8,y1,-2.2,-PI/2],
   ['ria_saffron_cushion',10.8,y1,2.8,-PI/2],
   ['ria_lantern_stand',-2.8,y1,9.6,0],
   ['ria_lantern_stand',2.8,y1,9.6,0]
  ]);
 }
});

/* 3. Bagan-Ptolemaic Upturned-Tiered Lotus-Dome Concourse (image_5.png, image_6.png) */
defBuilding({
 key:'ra_east_lotus_dome',
 name:'Bagan-Ptolemaic Upturned-Tiered Lotus-Dome Concourse',
 seed:7203,w:28,d:28,h:24.8,budget:120000,cut:true,
 front:{x:0,z:12.6,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['civic','market'],role:'concourse',job:'trading'},
 build(){
  /* Imperial red-porphyry & cream-dolomite stylobate + 4 corner Compass-Hills lodestone-capped obelisk spires! */
  const y1=raPlinth(22.8,21.6,1.35,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',
   stepW:3.8,stepRun:2.8,rail:'hongsa'
  });
  for(const sx of [-10.2,10.2])for(const sz of [-9.6,9.6]){
   raLodestoneObelisk(sx,y1,sz,10.4,{w:.82});
  }

  /* Peripteral Ptolemaic-Classical porphyry & dolomite colonnade surrounding the concourse hall */
  const colH=4.6,yEave=y1+colH;
  raColonnade(-8.8,8.4,8.8,8.4,y1,colH,{style:'upper-ria',n:6,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.26});
  raColonnade(-8.8,-8.4,8.8,-8.4,y1,colH,{style:'upper-ria',n:6,mk:'dolomite',altMk:'porphyry',r:.26});
  raColonnade(-8.8,-5.2,-8.8,5.2,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.26});
  raColonnade(8.8,-5.2,8.8,5.2,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.26});

  raWallRing(-6.8,-6.6,6.8,6.6,y1,colH-.32,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.2,h:2.65,door:true,crownMk:'silver',name:'concourse-south-door'},{at:-3.8,w:1.3,h:1.6,y:1.05},{at:3.8,w:1.3,h:1.6,y:1.05}],
    n:[{at:0,w:1.8,h:2.4,door:true,crownMk:'silver',name:'concourse-north-door'},{at:-3.8,w:1.3,h:1.6,y:1.05},{at:3.8,w:1.3,h:1.6,y:1.05}],
    e:[{at:0,w:1.8,h:2.4,door:true,open:true}],
    w:[{at:0,w:1.8,h:2.4,door:true,open:true}]
   }
  });

  /* Three sweeping upturned Bagan/Nusantara copper-and-slate eave-skirts + Ribbed Porphyry-and-Gilt Lotus Dome! */
  raCeilingSlab(0,yEave-.08,0,18.2,17.2,{mk:'dolomite',trimMk:'gold'});
  const ySkirtTop=raTieredRoof(0,yEave,0,18.4,17.6,3,{
   style:'upper-ria',mode:'hip',mk:'copper',trimMk:'gold',soffitMk:'dolomite',neckMk:'porphyry',
   over:.85,tierRise:1.15,neckH:.48,stepIn:.76
  });
  raLotusDome(0,ySkirtTop-.42,0,4.8,9.2,{style:'upper-ria',mk:'porphyry',ribMk:'gold',ribs:12});

  raTarget(0,y1,0,'lotus-dome-concourse',true);
  raTarget(0,y1,7.5,'peripteral-portico',true);

  raFurnList([
   ['ria_lodestone_compass',0,y1,0,0],
   ['ria_hongsa_lectern',0,y1,-3.6,0],
   ['ria_amber_seal_desk',-3.8,y1,-3.2,PI/4],
   ['ria_amber_seal_desk',3.8,y1,-3.2,-PI/4],
   ['ria_porphyry_table',-3.8,y1,2.2,PI/2],
   ['ria_porphyry_table',3.8,y1,2.2,-PI/2],
   ['ria_tribute_chest',-5.2,y1,-.6,PI/2],
   ['ria_glazed_amphora_rack',5.2,y1,-.6,-PI/2],
   ['ria_lantern_stand',-2.6,y1,4.8,0],
   ['ria_lantern_stand',2.6,y1,4.8,0]
  ]);
 }
});

/* 4. Egyptian-Angkor Battered Porphyry Pylon and Prang Fortress Gate (image_7.png) */
defBuilding({
 key:'ra_east_gopura_gate',
 name:'Egyptian-Angkor Battered Porphyry Pylon and Prang Fortress Gate',
 seed:7204,w:28,d:20,h:24.8,budget:115000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['military','infrastructure'],role:'fortress-gate'},
 build(){
  /* Stone gateway causeway at y1 = 0.42 m + flanking Compass-Hills lodestone obelisks & Hongsa guardians */
  const y1=.42,yDeck=5.6;
  raFloorSlab(0,y1,0,26.4,15.6,{mk:'paving',th:.42});
  raStripWalk([0,0,9.0],[0,y1,7.6],4.2);
  for(const sx of [-5.2,5.2]){
   raLodestoneObelisk(sx,y1,6.6,8.8,{w:.74});
   raHongsaSculpt(sx*.52,y1,7.0,0,1.05);
  }

  /* Twin battered Egyptian-profile red-porphyry & cream-dolomite pylons [-11.1..-3.9] and [3.9..11.1] */
  for(const s of [-1,1]){
   const qx=s*7.5;
   raWallRing(qx-3.6,-4.6,qx+3.6,4.6,y1,yDeck-y1,{
    style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
    holes:{
     s:[{at:qx,w:1.6,h:2.35,door:true,crownMk:'silver',name:s<0?'west-bastion-door':'east-bastion-door'}],
     n:[{at:qx,w:1.1,h:1.45,y:1.2}]
    }
   });
   /* Silver-bronze Water-Swan relief panels on front & back pylon faces */
   svNoWalk(()=>{
    for(const sz of [-4.68,4.68])box('alabaster',qx,y1+2.6,sz,3.2,1.6,.06,P('alabaster'));
   });
   /* Outer flank stone bastion stairs (x = +-12.05, completely clear of pylon walls) climbing from y1 to yDeck */
   raGrandStair(qx+s*4.55,y1,6.4,qx+s*4.55,yDeck,.4,1.5,{
    mk:'dolomite',sideMk:'porphyry',openUnder:true
   });
  }
  /* Solid stone ceilings over both lower pylon guardrooms + corbelled stone gateway passage [-3.9..3.9] */
  raCeilingSlab(-7.5,yDeck-.22,0,6.6,8.6,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(7.5,yDeck-.22,0,6.6,8.6,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(0,yDeck-.22,0,7.2,8.8,{mk:'porphyry',trimMk:'silver'});

  /* Upper Gatehouse Battlement Deck [-12.9..12.9, -4.4..4.4] + Cavetto battlements */
  raFloorSlab(0,yDeck,0,25.8,8.8,{mk:'mosaic',th:.2});
  svNoWalk(()=>{
   box('dolomite',0,yDeck+.01,4.28,22.2,.92,.18,P('dolomite'));
   box('dolomite',0,yDeck+.01,-4.28,13.6,.92,.18,P('dolomite'));
  });

  /* Central upper Gopura shrine cella + soaring 5-stage Khmer-Bagan stepped stone Prang! */
  const gH=3.5;
  raWallRing(-3.2,-3.2,3.2,3.2,yDeck,gH,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    e:[{at:0,w:1.5,h:2.25,door:true,open:true}],
    w:[{at:0,w:1.5,h:2.25,door:true,open:true}],
    s:[{at:0,w:1.2,h:1.5,y:.95,pediment:true,crownMk:'silver'}]
   }
  });
  raCeilingSlab(0,yDeck+gH+.02,0,6.0,6.0,{mk:'dolomite',trimMk:'gold'});
  raPrang(0,yDeck+gH+.12,0,6.8,14.8,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'silver',vault:true});

  /* Flanking Lanna slate watch-pavilions atop West and East pylons */
  for(const sx of [-7.5,7.5]){
   for(const px of [sx-1.8,sx+1.8])for(const pz of [-2.0,2.0]){
    raColumn(px,yDeck,pz,2.9,{style:'upper-ria',mk:'porphyry',capMk:'silver',baseMk:'dolomite',r:.19,block:false});
   }
   raTieredRoof(sx,yDeck+2.9,0,4.4,4.8,2,{style:'upper-ria',mode:'hip',mk:'indigoslate',trimMk:'silver',soffitMk:'dolomite',over:.45,tierRise:.95});
  }

  raTarget(0,y1,0,'corbelled-gateway-passage',true);
  raTarget(-7.5,y1,0,'west-pylon-guardroom',true);
  raTarget(7.5,y1,0,'east-pylon-guardroom',true);
  raTarget(0,yDeck,0,'upper-prang-gatehouse',true);

  raFurnList([
   ['ria_amber_seal_desk',-7.5,y1,-2.2,0],
   ['ria_tribute_chest',-7.5,y1,2.0,PI],
   ['ria_teak_divan',7.5,y1,-2.0,0],
   ['ria_tribute_chest',7.5,y1,2.0,PI],
   ['ria_lodestone_compass',0,yDeck,0,0],
   ['ria_hongsa_lectern',0,yDeck,-1.8,0],
   ['ria_lantern_stand',-5.2,yDeck,2.2,0],
   ['ria_lantern_stand',5.2,yDeck,2.2,0]
  ]);
 }
});
