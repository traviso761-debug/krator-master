// prefix: ra
// ================================================================= UPPER RIA / EASTERN DYNASTY (LIWA-TOGA) — ACROPOLIS, MANDALA & DOME (1-4)
// 50/50 Balanced Fusion Grammar:
//   - Egyptian / Classical / Ptolemaic (50%): Colossal flat-topped battered imperial red-porphyry & cream-dolomite pylons with deep
//     flaring cavetto cornices, Egyptian green palm-frond capitals, Classical Greco-Roman circular peristyle colonnades, stepped
//     Roman Pantheon saucer-rotundas, sculpted triangular temple pediments, and Compass-Hills lodestone obelisks (lodestone = 220).
//   - Southeast Asian (50%): Northern Lanna white-alabaster & indigo-slate multi-tier Prasat crowns, Angkor-Bagan stepped stone
//     Shikhara-Prangs, gilded lotus Hti spires, and Silver-Bronze Crested Water-Swan (Hongsa) balustrades & finials.

/* 1. Akwala-Liwayi Egyptian Palm-Hypostyle and Grand Hongsa Prasat Palace */
defBuilding({
 key:'ra_east_swan_prasat',
 name:'Akwala-Liwayi Egyptian Palm-Hypostyle and Grand Hongsa Prasat Palace',
 seed:7201,w:36,d:30,h:27.5,budget:140000,cut:true,
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
  raGrandStair(-11.2,yT1,1.6,-11.2,yT2,-.6,1.8,{mk:'dolomite',sideMk:'porphyry'});
  raGrandStair(11.2,yT1,1.6,11.2,yT2,-.6,1.8,{mk:'dolomite',sideMk:'porphyry'});

  /* Ptolemaic-Egyptian Palm-Frond Front Portico + Classical Triangular Pediment + Central Sovereign Hall [-7.4..7.4, -8.8..1.6] */
  const hallH=4.8,yRoof=yT2+hallH;
  raColonnade(-7.0,2.7,7.0,2.7,yT2,hallH,{style:'upper-ria',n:6,skipMid:1.8,mk:'alabaster',altMk:'porphyry',r:.26,capital:'palm'});
  raCeilingSlab(0,yRoof-.08,2.15,14.8,1.5,{mk:'dolomite',trimMk:'silver'});
  raClassicalPediment(0,yRoof+.06,2.45,0,7.8,1.55,1.9,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  raWallRing(-7.4,-8.8,7.4,1.6,yT2,hallH,{
   style:'upper-ria',mk:'alabaster',socMk:'porphyry',dadoMk:'carve',postMk:'dolomite',
   holes:{
    s:[
     {at:-4.5,w:1.3,h:1.9,y:1.05,pediment:true,crownMk:'silver'},
     {at:0,w:2.3,h:2.85,door:true,crownMk:'silver',name:'hongsa-palace-portal'},
     {at:4.5,w:1.3,h:1.9,y:1.05,pediment:true,crownMk:'silver'}
    ],
    n:[{at:-4.2,w:1.3,h:1.8,y:1.05},{at:0,w:1.5,h:1.9,y:1.05,pediment:true,crownMk:'silver'},{at:4.2,w:1.3,h:1.8,y:1.05}],
    e:[{at:-3.6,w:1.6,h:2.35,door:true,open:true}],
    w:[{at:-3.6,w:1.6,h:2.35,door:true,open:true}]
   }
  });

  /* 50/50 FLANKING WINGS: Twin Flat-Topped Egyptian Battered Pylon & Green-Palm Hypostyle Wings (replacing side pitched roofs!) */
  for(const sx of [-10.5,10.5]){
   const s=sx<0?-1:1;
   raBatteredPylon(sx+s*1.85,-7.9,2.1,2.1,yT2,hallH+.38,{style:'upper-ria',mk:'porphyry',bandMk:'dolomite',relMk:'alabaster'});
   for(const px of [sx-1.7,sx+1.7])for(const pz of [-6.0,-3.2,-.4]){
    raColumn(px,yT2,pz,hallH-.18,{style:'upper-ria',mk:'dolomite',baseMk:'porphyry',capMk:'gold',r:.23,capital:'palm',block:false});
   }
   const yWing=raFlatTerraceRoof(sx,yT2+hallH-.18,-3.6,5.2,9.0,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'silver',
    parapet:'balustrade',skip:sx<0?'e':'w'
   });
   raCavettoCornice(sx,yT2+hallH-.06,-3.6,5.4,9.2,.38,{mk:'dolomite',bandMk:'gold'});
   svNoWalk(()=>box('porphyry',sx,yWing+.02,-5.4,2.8,.85,2.8,P('porphyry')));
  }

  /* Soaring 4-Tier Northern Lanna Indigo-Slate & White-Alabaster Central Prasat Crown + Flame Spire! */
  raTieredRoof(0,yRoof,-3.6,14.6,10.8,4,{
   style:'upper-ria',mode:'gable',gableAxis:'x',mk:'indigoslate',trimMk:'alabaster',soffitMk:'dolomite',neckMk:'alabaster',
   over:.78,tierRise:1.22,neckH:.46,stepIn:.76,spire:true,spireH:5.6
  });

  raLodestoneObelisk(-13.8,0,12.8,7.4,{w:.72});
  raLodestoneObelisk(13.8,0,12.8,7.4,{w:.72});

  raTarget(0,yT1,5.6,'lower-acropolis-terrace',false);
  raTarget(0,yT2,-3.6,'hongsa-sovereign-hall',true);
  raTarget(-10.5,yT2,-3.6,'west-palm-hypostyle',true);
  raTarget(10.5,yT2,-3.6,'east-palm-hypostyle',true);

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
   ['ria_offering_basin',-10.5,yT2,-3.6,0],
   ['ria_offering_basin',10.5,yT2,-3.6,0],
   ['ria_lantern_stand',-2.8,yT2,.6,0],
   ['ria_lantern_stand',2.8,yT2,.6,0]
  ]);
 }
});

/* 2. Classical Greco-Roman Circular Rotunda-Peristyle and Shikhara-Prang Sanctuary */
defBuilding({
 key:'ra_east_mandala_cloister',
 name:'Classical Greco-Roman Circular Rotunda-Peristyle and Shikhara-Prang Sanctuary',
 seed:7202,w:32,d:32,h:26.0,budget:138000,cut:true,
 front:{x:0,z:14.7,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['religious'],role:'sanctuary',job:'worship'},
 build(){
  /* Raised circular dolomite & imperial red-porphyry Classical stylobate (r = 13.4 m, y1 = 1.15 m) */
  const y1=1.15;
  svNoWalk(()=>{
   cyl('porphyry',0,0,.6,13.8,.56,P('porphyry'),32);
   cyl('dolomite',0,.56,.6,13.5,.59,P('dolomite'),32);
  });
  raFloorDisc(0,.6,13.4,y1,'paving',P('paving'),{seg:32,th:.16});
  raGrandStair(0,0,15.0,0,y1,13.2,3.4,{mk:'dolomite',sideMk:'porphyry',rail:'hongsa',railOpts:{scale:.85}});

  /* Pure Classical Greco-Roman Circular Peristyle Colonnade [rIn = 9.4 .. rOut = 12.65] (no pagoda hats on perimeter!) */
  const clH=3.95,yRingTop=y1+clH;
  const opens=[{a:PI/2,w:2.4,h:2.65,door:true,crownMk:'silver',name:'mandala-south-gate'}];
  for(let k=1;k<12;k++){
   const a=PI/2+k/12*TAU;
   if(Math.abs(Math.sin(a)+1)<.18)continue;
   opens.push({a,w:1.15,h:1.45,y:1.05,pediment:true});
  }
  raDrumWall(0,.6,12.15,12.65,y1,clH,'dolomite',P('dolomite'),opens,{style:'upper-ria'});

  /* Inner ring of 16 fluted porphyry & dolomite Corinthian/Lotus columns */
  for(let k=0;k<16;k++){
   const a=k/16*TAU;
   if(Math.sin(a)<-.78)continue;
   raColumn(Math.cos(a)*9.55,y1,.6+Math.sin(a)*9.55,clH,{
    style:'upper-ria',mk:k%2===0?'dolomite':'porphyry',capMk:'silver',baseMk:'porphyry',r:.23,block:false
   });
  }
  svNoWalk(()=>{
   /* Solid annular Classical entablature + porphyry frieze + flat stone promenade roof + curved attic balustrade! */
   sector('dolomite',0,.6,9.2,12.76,0,TAU,yRingTop,yRingTop+.26,P('dolomite'),32);
   sector('porphyry',0,.6,9.14,12.82,0,TAU,yRingTop+.26,yRingTop+.48,P('porphyry'),32);
   sector('dolomite',0,.6,9.06,12.92,0,TAU,yRingTop+.48,yRingTop+.66,P('dolomite'),32);
   /* Classical turned-stone attic balustrade crowning both inner and outer rims of the circular peristyle */
   for(const rr of [9.35,12.55]){
    sector('dolomite',0,.6,rr-.12,rr+.12,0,TAU,yRingTop+.668,yRingTop+.82,P('dolomite'),32);
    for(let b=0;b<36;b++){
     const ab=b/36*TAU;
     if(rr>11&&Math.sin(ab)>.88)continue; /* clear behind front Classical pediment */
     cyl('dolomite',Math.cos(ab)*rr,yRingTop+.82,Math.sin(ab)*rr+.6,.065,.46,P('dolomite'),8);
    }
    sector('dolomite',0,.6,rr-.15,rr+.15,0,TAU,yRingTop+1.28,yRingTop+1.4,P('dolomite'),32);
   }
  });

  /* Monumental South Classical Hexastyle Temple Propylaeum with Triangular Pediment! */
  raColonnade(-3.2,13.25,3.2,13.25,y1,clH,{style:'upper-ria',n:4,skipMid:1.5,mk:'dolomite',altMk:'porphyry',r:.24,block:false});
  raClassicalPediment(0,yRingTop+.67,12.45,0,7.0,1.65,2.3,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* Inlaid porphyry, saffron & alabaster 8-petal Lotus-Mandala floor at court center */
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

  /* Towering Angkor-Bagan Stepped Stone Shikhara-Prang Sanctuary rising inside the Classical Rotunda! */
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

/* 3. Ptolemaic-Pantheon Stepped Rotunda, Lodestone Obelisks and Bagan Lotus Spire */
defBuilding({
 key:'ra_east_lotus_dome',
 name:'Ptolemaic-Pantheon Stepped Rotunda, Lodestone Obelisks and Bagan Lotus Spire',
 seed:7203,w:28,d:28,h:24.8,budget:130000,cut:true,
 front:{x:0,z:12.6,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['civic','market'],role:'concourse',job:'trading'},
 build(){
  /* Imperial red-porphyry & cream-dolomite stylobate + 4 corner Compass-Hills lodestone-capped obelisk spires! */
  const y1=raPlinth(22.8,21.6,1.35,{
   style:'upper-ria',baseMk:'porphyry',midMk:'dolomite',capMk:'dolomite',topMk:'mosaic',
   stepW:3.8,stepRun:2.8,rail:'hongsa'
  });
  for(const sx of [-10.2,10.2])for(const sz of [-9.6,9.6]){
   raLodestoneObelisk(sx,y1,sz,10.8,{w:.84});
  }

  /* Peripteral Ptolemaic-Classical Palm-Frond Colonnade surrounding the concourse hall */
  const colH=4.7,yEave=y1+colH;
  raColonnade(-8.8,8.4,8.8,8.4,y1,colH,{style:'upper-ria',n:6,skipMid:1.8,mk:'dolomite',altMk:'porphyry',r:.26,capital:'palm'});
  raColonnade(-8.8,-8.4,8.8,-8.4,y1,colH,{style:'upper-ria',n:6,mk:'dolomite',altMk:'porphyry',r:.26,capital:'palm'});
  raColonnade(-8.8,-5.2,-8.8,5.2,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.26,capital:'palm'});
  raColonnade(8.8,-5.2,8.8,5.2,y1,colH,{style:'upper-ria',n:4,mk:'porphyry',altMk:'dolomite',r:.26,capital:'palm'});

  raWallRing(-6.8,-6.6,6.8,6.6,y1,colH-.32,{
   style:'upper-ria',mk:'dolomite',socMk:'porphyry',dadoMk:'carve',postMk:'porphyry',
   holes:{
    s:[{at:0,w:2.2,h:2.65,door:true,crownMk:'silver',name:'concourse-south-door'},{at:-3.8,w:1.3,h:1.6,y:1.05,pediment:true},{at:3.8,w:1.3,h:1.6,y:1.05,pediment:true}],
    n:[{at:0,w:1.8,h:2.4,door:true,crownMk:'silver',name:'concourse-north-door'},{at:-3.8,w:1.3,h:1.6,y:1.05},{at:3.8,w:1.3,h:1.6,y:1.05}],
    e:[{at:0,w:1.8,h:2.4,door:true,open:true}],
    w:[{at:0,w:1.8,h:2.4,door:true,open:true}]
   }
  });

  /* 50/50 CROWN: Flat Classical Balustrade Temple Roof + Sculpted Front Temple Pediment + Colonnaded Tholos Drum +
     Stepped Roman Pantheon Porphyry-and-Gold Rotunda Dome + 4 Corner Bagan Chedi Spires + Soaring Hti Spire! */
  const yTer=raFlatTerraceRoof(0,yEave,0,18.4,17.4,{
   style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'gold',parapet:'balustrade'
  });
  raClassicalPediment(0,yTer+.02,7.9,0,9.4,1.8,2.2,{style:'upper-ria',mk:'dolomite',tymMk:'porphyry'});

  /* Circular Classical Tholos Colonnade around the Pantheon drum */
  const thH=2.85;
  svNoWalk(()=>cyl('dolomite',0,yTer+.02,0,5.65,thH,P('dolomite'),24));
  for(let k=0;k<16;k++){
   const a=k/16*TAU;
   raColumn(Math.cos(a)*6.25,yTer+.02,Math.sin(a)*6.25,thH,{style:'upper-ria',mk:k%2===0?'dolomite':'porphyry',capMk:'gold',baseMk:'porphyry',r:.19,block:false});
  }
  const yDomeTop=raPantheonRotundaDome(0,yTer+thH,0,5.8,10.2,{
   style:'upper-ria',drumMk:'dolomite',mk:'porphyry',ribMk:'gold',soffitMk:'alabaster'
  });
  /* Soaring Bagan-Lanna Gilded Hti Spire atop the Pantheon oculus + 4 corner Chedi spirelets */
  raPrasatSpire(0,yDomeTop-.6,0,2.2,4.4,{style:'upper-ria',mk:'gold',accMk:'silver',vault:false});
  for(const [cx,cz] of [[-7.2,-6.6],[7.2,-6.6],[-7.2,5.6],[7.2,5.6]]){
   raPrang(cx,yTer+.02,cz,2.1,5.2,{style:'upper-ria',mk:'dolomite',bandMk:'porphyry',trimMk:'gold',vault:false});
  }

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

/* 4. Egyptian Battered Cavetto Pylons and Central Angkor Prang Fortress Gate */
defBuilding({
 key:'ra_east_gopura_gate',
 name:'Egyptian Battered Cavetto Pylons and Central Angkor Prang Fortress Gate',
 seed:7204,w:28,d:20,h:24.8,budget:122000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'upper-ria',wealth:'rich',types:['military','infrastructure'],role:'fortress-gate'},
 build(){
  /* Stone gateway causeway at y1 = 0.42 m + Egyptian green-palm portal columns, Lodestone Obelisks & Hongsa guardians */
  const y1=.42,yDeck=5.6,yPylon=9.55;
  raFloorSlab(0,y1,0,26.4,15.6,{mk:'paving',th:.42});
  raStripWalk([0,0,9.0],[0,y1,7.6],4.2);
  for(const sx of [-5.4,5.4]){
   raLodestoneObelisk(sx,y1,6.8,9.2,{w:.76});
   raHongsaSculpt(sx*.48,y1,7.1,0,1.05);
  }
  /* Pair of monumental Egyptian green-palm-frond columns framing the central gateway */
  for(const sx of [-3.1,3.1]){
   raColumn(sx,y1,5.25,yDeck-y1-.2,{style:'upper-ria',mk:'dolomite',baseMk:'porphyry',capMk:'gold',r:.28,capital:'palm'});
  }

  /* Twin Colossal Flat-Topped Egyptian Battered Red-Porphyry & Dolomite Temple Pylons (image_9.png — NO pitched roofs on pylons!) */
  for(const s of [-1,1]){
   const qx=s*7.5;
   /* Lower pylon guardroom [qx-3.6..qx+3.6, -4.6..4.6] */
   raWallRing(qx-3.6,-4.6,qx+3.6,4.6,y1,yDeck-y1,{
    style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',
    holes:{
     s:[{at:qx,w:1.6,h:2.35,door:true,crownMk:'silver',name:s<0?'west-bastion-door':'east-bastion-door'}],
     n:[{at:qx,w:1.1,h:1.45,y:1.2}]
    }
   });
   /* Upper Egyptian Battered Pylon Tower [qx-3.3..qx+3.3, -4.2..4.2] with open E/W passages for rampart walk! */
   raWallRing(qx-3.3,-4.2,qx+3.3,4.2,yDeck,yPylon-yDeck,{
    style:'upper-ria',mk:'porphyry',socMk:'dolomite',dadoMk:'carve',postMk:'dolomite',cornice:false,
    holes:{
     e:[{at:0,w:2.4,h:2.7,door:true,open:true}],
     w:[{at:0,w:2.4,h:2.7,door:true,open:true}],
     s:[{at:qx,w:1.15,h:1.55,y:1.05}],
     n:[{at:qx,w:1.15,h:1.55,y:1.05}]
    }
   });
   /* Sunken alabaster Egyptian pylon relief tablets + vertical flagstaff niches + Deep Flaring Egyptian Cavetto Cornice! */
   svNoWalk(()=>{
    for(const sz of [-4.68,4.68])box('alabaster',qx,y1+2.3,sz,3.4,1.8,.06,P('alabaster'));
    for(const sz of [-4.28,4.28])box('alabaster',qx,yDeck+1.2,sz,3.0,1.7,.06,P('alabaster'));
   });
   raFlatTerraceRoof(qx,yPylon,0,6.8,8.6,{
    style:'upper-ria',mk:'dolomite',topMk:'paving',soffitMk:'dolomite',trimMk:'gold',parapet:'none'
   });
   raCavettoCornice(qx,yPylon+.48,0,7.1,8.9,.58,{mk:'dolomite',bandMk:'gold'});

   /* Outer flank stone bastion stairs (x = +-12.05) climbing from y1 to yDeck */
   raGrandStair(qx+s*4.55,y1,6.4,qx+s*4.55,yDeck,.4,1.5,{
    mk:'dolomite',sideMk:'porphyry',openUnder:true
   });
  }
  raCeilingSlab(-7.5,yDeck-.22,0,6.6,8.6,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(7.5,yDeck-.22,0,6.6,8.6,{mk:'dolomite',trimMk:'silver'});
  raCeilingSlab(0,yDeck-.22,0,7.2,8.8,{mk:'porphyry',trimMk:'silver'});

  /* Upper Gatehouse Saddle Deck [-12.9..12.9, -4.4..4.4] + Cavetto battlements over central gateway */
  raFloorSlab(0,yDeck,0,25.8,8.8,{mk:'mosaic',th:.2});
  raClassicalBalustrade(-3.8,4.28,3.8,4.28,yDeck,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});
  raClassicalBalustrade(3.8,-4.28,-3.8,-4.28,yDeck,{style:'upper-ria',mk:'dolomite',trimMk:'porphyry'});

  /* Central upper Gopura shrine cella + soaring 5-stage Angkor-Bagan stepped stone Prang strictly between the two Egyptian Pylons! */
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
   ['ria_lantern_stand',-3.4,yDeck,2.2,0],
   ['ria_lantern_stand',3.4,yDeck,2.2,0]
  ]);
 }
});
