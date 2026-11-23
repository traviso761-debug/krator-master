// prefix: dvf
// ================================================================= FLUME-FORGE KEEP, TRIPLE WATERWHEEL FORGE & SPECIALIZED HAMLET WORKS (style: 'flume', DV3)
// Chasm-Straddling Flume-Forge Keep (`dv-flume-keep` with a 30 m red-cypress log shooting through its vaulted belly!),
// Stacked Triple Overshot Cliffside Waterwheel Stamp-Mill & Trip-Hammer Forge (`dv-flume-forge`), Gravity Timber Log-Flume
// Trestle & Splash-Basin (`dv-flume-trestle`), Nephrite Pendulum Wire-Saw Mill (`dv-sawmill-jade`), Sheepskin Golden-Fleece
// Placer-Gold Sluice-Weir (`dv-sluice-fleece`), Foundry, Heirloom Armourer, Qvevri Distillery, Bakery, Smokehouse, Kilim Weaver & Fleece Tannery.

/* 25. Chasm-Straddling Flume-Forge Keep (`dv-flume-keep`) */
defBuilding({key:'dv-flume-keep',name:'Flumi-Tsikhe Chasm-Straddling Flume-Forge Keep',seed:7301,cls:'building',w:18.2,d:31.6,h:19.8,cut:true,
 front:{x:-5.6,z:3.8,yaw:0},
 tags:{types:['military','industry','infrastructure'],wealth:'rich',style:'flume',role:'flume-forge keep',job:'carpentry',landmark:true},
 note:'Buttressed basalt & apricot-tuff fortress seated astride a pointed chasm-arch where a timber gravity V-flume shoots a full 30 m red-cypress log straight through a vaulted tunnel in the keep belly.',
 build(p){
  /* twin chasm-rim stone bastions at x = +-5.6 standing on solid y = 0 banks, spanning x = -3.4..+3.4 chasm arch */
  for(const sg of [-1,1]){
   const bx=sg*5.6;
   dvRootSkirt(bx,0,4.8,7.4,6.8,{mk:'colBasalt',plinthH:.42});
   dvFloorRect(bx,0,4.6,7.2,.24,'flagstone',P('flagstone'));
   dvAblaqBox(bx,0,4.8,7.4,.24,3.4,{
    front:[{x:0,w:1.3,h:2.18,door:true}],
    back:[{x:0,w:.82,y:.95,h:1.15}]
   });
  }
  /* pointed basalt & golden-skarn chasm arch bridging between the twin bastions under the flume belly */
  dvNoCut(()=>svNoWalk(()=>{
   const nA=10;
   for(let i=0;i<nA;i++){
    const u0=i/nA,u1=(i+1)/nA,x0=lerp(-3.15,3.15,u0),x1=lerp(-3.15,3.15,u1);
    const ay=u=>-1.35+2.65*(1-Math.pow(Math.abs(u*2-1),1.5));
    const vw=i%2?.52:.44,vh=i%2?.54:.46;
    for(const sz of [-2.8,0,2.8]){
     beam(i%2?'skarn':'colBasalt',[x0,ay(u0),sz],[x1,ay(u1),sz],vw,i%2?P('skarn'):P('colBasalt'),false,undefined,vh);
    }
   }
  }));
  /* central vaulted flume-tunnel belly (x = -3.14..+3.14, cleanly between bastions at +-3.20; d = 6.96 inset from 7.4) */
  const yWard=3.85;
  dvFloorRect(0,0,15.6,7.1,yWard,'floor',P('floor'));
  svStair(-5.6,-2.4,.24,yWard,0,{style:'ladder',w:.82,mk:'cypress',col:P('cypress')});
  dvAblaqBox(0,0,6.28,6.96,1.35,2.34,{
   front:[{x:0,w:2.55,y:.05,h:2.02,door:true,open:true,leaf:false}],
   back:[{x:0,w:2.55,y:.05,h:2.02,door:true,open:true,leaf:false}],frieze:false
  });
  dvAblaqBox(0,0,12.8,7.4,yWard+.02,4.15,{
   front:[{x:-3.4,w:.92,y:.95,h:1.3},{x:0,w:1.05,y:.95,h:1.35},{x:3.4,w:.92,y:.95,h:1.3}],
   back:[{x:-3.2,w:.9,y:.95,h:1.25},{x:3.2,w:.9,y:.95,h:1.25}],
   left:[{x:0,w:.88,y:.95,h:1.25}],right:[{x:0,w:.88,y:.95,h:1.25}]
  });
  dvRoofTerrace(0,0,13.0,7.6,yWard+4.17,{footY:yWard});
  dvNeedleTower(4.8,-1.8,2.65,yWard+4.17,6.8,{skirt:false,walkFloor:false,pulley:true,pulleyYaw:PI/2,pulleyDrop:4.5});
  dvJadeCross(0,yWard+3.25,3.71,0,.72);

  /* 30 m gravity timber V-flume + FULL 30 m RED-CYPRESS LOG shooting straight through the vaulted keep belly!
     (When p.externalFlume is true in the settlement demo, the settlement's continuous flume & animated logs run through this exact tunnel.) */
  if(!(p&&p.externalFlume)){
   dvLogFlumeSeg([0,2.45,14.9],[0,1.15,-14.9],1.55,{log:false,bents:4,yGround:0});
   dvNoCut(()=>dvCypressLog([0,2.92,14.8],[0,1.62,-14.8],.34));
  }

  /* furnish upper ward-hall & west bastion */
  dvFurn([
   ['dv_court_carpet',0,yWard,0,0],
   ['dv_feast_table_brandy',-2.2,yWard+.054,0,0],
   ['dv_anvil_triphammer',-5.6,.24,-1.4,0],
   ['dv_armour_stand_scale',3.6,yWard,-2.2,-.3],
   ['dv_rack_buckler_sword',-5.2,yWard,-2.8,0],
   ['dv_brazier_copper',2.4,yWard,1.8,0],
   ['dv_pulley_basket',5.6,.24,1.6,0]
  ]);
 }});

/* 26. Stacked Triple Overshot Cliffside Waterwheel Stamp-Mill & Trip-Hammer Forge (`dv-flume-forge`) */
defBuilding({key:'dv-flume-forge',name:'Sami-Borbali Stacked Triple Waterwheel Stamp-Mill & Forge',seed:7302,cls:'building',w:17.8,d:14.2,h:15.4,cut:true,
 tags:{types:['industry'],wealth:'middle',style:'flume',role:'triple-waterwheel forge',job:'smithing',landmark:true},
 note:'Stepped cliffside forge driven by THREE cascading animated overshot waterwheels powering ore stamps and magnetite trip-hammer anvils under verdigris copper spark-hoods.',
 build(){
  const w0=11.4,d0=9.4,cx0=-1.6,y0=.28,h0=4.65;
  dvRootSkirt(cx0,0,w0,d0,6.2,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(cx0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,0,w0,d0,y0,h0,{
   front:[{x:-1.2,w:1.65,h:2.45,door:true},{x:2.6,w:1.05,y:.9,h:1.3}],
   left:[{x:0,w:1.0,y:.95,h:1.25}],back:[{x:0,w:1.0,y:.95,h:1.25}]
  });
  dvExtStair(cx0-1.2,d0/2+.9,0,y0,PI,1.55,.9);
  /* stepped upper stamp-mill loft on rear half */
  const y1=y0+h0;
  dvRoofTerrace(cx0,2.2,w0+.14,4.8,y1,{openBack:true});
  dvAblaqBox(cx0,-2.1,w0,4.6,y1+.02,3.1,{
   front:[{x:0,w:1.05,h:2.0,door:true},{x:-3.2,w:.82,y:.85,h:1.1},{x:3.2,w:.82,y:.85,h:1.1}]
  });
  dvGableRoof(cx0,-2.1,w0,4.6,y1+3.12,1.6,{mk:'slate'});
  /* twin patinated verdigris copper forge spark-hoods rising cleanly above front roof-plaza! */
  dvSparkHood(cx0-2.8,y1+.02,2.1,2.1,2.65);
  dvSparkHood(cx0+1.8,y1+.02,2.1,1.9,2.35);

  /* THREE stacked rotating overshot waterwheels cascading down the +x cliff-race (`z = -3.2, 0.0, +3.2`)! */
  dvNoCut(()=>svNoWalk(()=>{
   box('colBasalt',5.45,0,-3.2,2.4,4.6,2.8,P('colBasalt'));
   box('colBasalt',5.45,0,0,2.4,2.8,2.8,P('colBasalt'));
  }));
  dvWaterwheel(5.45,6.35,-3.2,1.85,.82,'x',1.35);
  dvWaterwheel(5.45,4.15,0,1.95,.84,'x',1.25);
  dvWaterwheel(5.45,1.95,3.2,2.05,.86,'x',1.15);

  dvFurn([
   ['dv_anvil_triphammer',cx0-2.6,y0,-1.8,0],
   ['dv_anvil_triphammer',cx0+1.8,y0,-1.8,0],
   ['dv_brazier_copper',cx0-2.8,y0,1.8,0],
   ['dv_brazier_copper',cx0+1.8,y0,1.8,0],
   ['dv_rack_buckler_sword',cx0-4.6,y0,0,PI/2],
   ['dv_shelves_provisions',cx0+4.5,y0,.8,-PI/2]
  ]);
 }});

/* 27. Gravity Timber Log-Flume Trestle & Splash-Basin (`dv-flume-trestle`) */
defBuilding({key:'dv-flume-trestle',name:'Khe-Flumi Gravity Timber Log-Flume Trestle & Splash-Basin',seed:7303,cls:'building',w:15.4,d:20.6,h:11.6,cut:true,
 front:{x:-3.8,z:5.8,yaw:0},
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'flume',role:'log-flume trestle',job:'carpentry'},
 note:'Cross-braced red-cypress trestle viaduct carrying a steep gravity V-flume that shoots mountain logs into a stone-curbed splash-basin beside the flume-master cabin.',
 build(){
  /* flume-master tally cabin at -x */
  const cx=-3.8,cz=2.6,w0=6.2,d0=6.2,y0=.26,h0=3.45;
  dvRootSkirt(cx,cz,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{
   front:[{x:0,w:1.12,h:2.1,door:true}],right:[{x:0,w:.88,y:.9,h:1.15}]
  });
  dvGableRoof(cx,cz,w0,d0,y0+h0,1.55,{mk:'slate'});

  /* stone-curbed foaming splash-basin at (+2.6, -5.6) + 17 m elevated timber V-flume trestle! */
  dvNoCut(()=>svNoWalk(()=>{
   const bx=2.6,bz=-5.6;
   box('colBasalt',bx,0,bz,6.8,.88,6.4,P('colBasalt'));
   box('flumeWater',bx,.9,bz,5.8,.08,5.4,P('flumeFoam'));
   dvCypressLog([bx-1.8,.98,bz-.8],[bx+1.9,.98,bz+.9],.26);
  }));
  dvLogFlumeSeg([2.6,6.4,9.2],[2.6,1.35,-3.2],1.42,{bents:5,yGround:0,log:true,logR:.28});

  dvFurn([
   ['dv_common_table',cx,y0,cz-.4,0],
   ['dv_common_stool',cx,y0,cz+.55,PI],
   ['dv_pulley_basket',cx-1.8,y0,cz+1.6,0],
   ['dv_shelves_provisions',cx-2.1,y0,cz-2.1,0],
   ['dv_brazier_copper',cx+1.8,y0,cz+1.6,0]
  ]);
 }});

/* 28. Nephrite Pendulum Wire-Saw Watermill (`dv-sawmill-jade`) */
defBuilding({key:'dv-sawmill-jade',name:'Dzedi-Kherkhi Nephrite Pendulum Wire-Saw Watermill',seed:7304,cls:'building',w:15.2,d:11.8,h:11.8,cut:true,
 tags:{types:['industry'],wealth:'middle',style:'flume',role:'nephrite wire-saw mill',job:'masonry'},
 note:'Animated overshot waterwheel driving reciprocating iron pendulum wire-saws fed with quartz-sand slurry to slice emerald nephrite boulders into medallions and weregild slabs.',
 build(){
  const cx=-1.4,w0=9.6,d0=8.2,y0=.28,h0=3.95;
  dvRootSkirt(cx,0,w0,d0,5.6,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(cx,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.52,h:2.32,door:true},{x:-2.8,w:.9,y:.95,h:1.2},{x:2.8,w:.9,y:.95,h:1.2}],
   left:[{x:0,w:.9,y:.95,h:1.2}],back:[{x:0,w:.95,y:.95,h:1.2}]
  });
  dvExtStair(cx,d0/2+.9,0,y0,PI,1.5,.9);
  dvGableRoof(cx,0,w0,d0,y0+h0,1.95,{mk:'slate'});
  /* animated overshot waterwheel on +x race */
  dvWaterwheel(4.55,2.25,0,2.05,.86,'x',1.18);
  /* exterior raw emerald nephrite boulders waiting in yard */
  dvNoCut(()=>svNoWalk(()=>{
   box('jade',-5.2,.01,3.2,.85,.62,.74,P('jade'));
   box('jade',-4.2,.01,3.4,.64,.48,.58,P('jadeBright'),.3);
  }));
  dvFurn([
   ['dv_wiresaw_frame',cx-2.2,y0,-1.4,0],
   ['dv_wiresaw_frame',cx+2.0,y0,-1.4,0],
   ['dv_scale_weregild',cx-2.6,y0,1.8,PI/4],
   ['dv_chest_jade_inlay',cx+2.8,y0,2.1,-PI/2],
   ['dv_brazier_copper',cx,y0,2.1,0]
  ]);
 }});

/* 29. Sheepskin "Golden-Fleece" Placer-Gold Sluice-Weir (`dv-sluice-fleece`) */
defBuilding({key:'dv-sluice-fleece',name:'Okros-Satsmisi Golden-Fleece Placer Sluice-Weir',seed:7305,cls:'building',w:15.4,d:12.4,h:9.6,cut:true,
 front:{x:-3.4,z:4.1,yaw:0},
 tags:{types:['industry'],wealth:'middle',style:'flume',role:'golden-fleece sluice',job:'mining'},
 note:'Colchian-style river-weir channeling gold-bearing Crookwash gravel over inclined timber troughs lined with lanolin sheepskin fleeces, beside an assaying lodge.',
 build(){
  const cx=-3.4,cz=.6,w0=6.8,d0=6.8,y0=.26,h0=3.45;
  dvRootSkirt(cx,cz,w0,d0,5.4,{mk:'rivercobble',plinthH:y0+.2});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{
   front:[{x:0,w:1.18,h:2.12,door:true}],right:[{x:0,w:.88,y:.9,h:1.15}]
  });
  dvGableRoof(cx,cz,w0,d0,y0+h0,1.65,{mk:'verdigris'});

  /* stepped stone weir + 3 parallel outdoor Golden-Fleece sluice-runs at +x! */
  dvNoCut(()=>{
   svNoWalk(()=>{
    box('rivercobble',3.4,0,-2.8,6.2,1.15,2.2,P('rivercobble'));
    box('flumeWater',3.4,1.17,-2.8,5.6,.07,1.7,P('flumeWater'));
   });
   for(const sx of [1.4,3.4,5.4]){
    FURNISH('dv_sluice_fleece_trough',sx,0,.2,PI/2);
   }
   /* timber drying rack hung with golden-flecked sheepskins */
   svNoWalk(()=>{
    for(const sx of [1.6,5.2])cyl('cypress',sx,0,3.2,.07,2.15,P('cypress'),8);
    beam('cypress',[1.5,2.05,3.2],[5.3,2.05,3.2],.08,P('cypress'));
    for(const sx of [2.4,3.4,4.4])box('fleece',sx,.95,3.2,.72,1.05,.06,P('fleece'));
   });
  });
  dvFurn([
   ['dv_sluice_fleece_trough',cx,y0,cz-1.6,0],
   ['dv_scale_weregild',cx-1.8,y0,cz+1.4,PI/4],
   ['dv_brazier_copper',cx+1.8,y0,cz+1.4,0],
   ['dv_chest_jade_inlay',cx+1.9,y0,cz-.2,-PI/2]
  ]);
 }});

/* 30. Tin-Bronze Smelter & Scale-Plate Foundry */
defBuilding({key:'dv-foundry-bronze',name:'Brindzao-Kura Tin-Bronze & Scale-Plate Foundry',seed:7306,cls:'building',w:13.8,d:11.6,h:12.6,cut:true,
 tags:{types:['industry'],wealth:'middle',style:'flume',role:'bronze foundry',job:'smithing'},
 note:'Twin verdigris-hooded blast furnaces smelting Vardzieti cassiterite tin and copper into heirloom scale-lamellae, gumbat finials, and bronze cauldrons.',
 build(){
  const w0=10.4,d0=8.4,y0=.28,h0=4.1;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.62,h:2.38,door:true},{x:-3.1,w:.88,y:.95,h:1.2},{x:3.1,w:.88,y:.95,h:1.2}],
   left:[{x:0,w:.88,y:.95,h:1.2}],right:[{x:0,w:.88,y:.95,h:1.2}]
  });
  dvRoofTerrace(0,0,w0+.14,d0+.14,y0+h0,{parapet:false});
  dvSparkHood(-2.5,y0+h0,-.8,2.2,2.85);
  dvSparkHood(2.5,y0+h0,-.8,2.2,2.85);
  dvFurn([
   ['dv_anvil_triphammer',-2.4,y0,-1.4,0],
   ['dv_anvil_triphammer',2.4,y0,-1.4,0],
   ['dv_brazier_copper',-2.5,y0,1.8,0],
   ['dv_brazier_copper',2.5,y0,1.8,0],
   ['dv_armour_stand_scale',0,y0,-2.6,0]
  ]);
 }});

/* 31. Magnetite & Silver-Chased Heirloom Armourer */
defBuilding({key:'dv-smithy-armourer',name:'Abjari-Samchedlo Magnetite & Silver Heirloom Armourer',seed:7307,cls:'building',w:12.6,d:10.8,h:11.8,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'flume',role:'heirloom armourer',job:'smithing'},
 note:'Master armourer shop re-lacing 300-year-old magnetite & tin-bronze scale hauberks, setting nephrite buckler bosses, and chasing silver broadsword hilts.',
 build(){
  const w0=9.4,d0=7.8,y0=.28,h0=3.85;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.45,h:2.28,door:true},{x:-2.7,w:.88,y:.9,h:1.2},{x:2.7,w:.88,y:.9,h:1.2}],
   left:[{x:0,w:.85,y:.95,h:1.15}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,1.75,{mk:'slate'});
  dvSparkHood(2.6,y0+h0+1.1,-.6,1.65,2.15);
  dvFurn([
   ['dv_anvil_triphammer',2.2,y0,-1.4,0],
   ['dv_armour_stand_scale',-2.8,y0,-2.2,.25],
   ['dv_armour_stand_scale',-1.1,y0,-2.2,0],
   ['dv_rack_buckler_sword',-3.4,y0,.8,PI/2],
   ['dv_brazier_copper',2.2,y0,1.6,0]
  ]);
 }});

/* 32. Qvevri Apricot-Brandy Distillery & Marani Cellar */
defBuilding({key:'dv-winery-qvevri',name:'Chacha-Marani Qvevri Apricot-Brandy Distillery',seed:7308,cls:'building',w:13.4,d:11.2,h:11.2,cut:true,
 tags:{types:['industry','farm'],wealth:'middle',style:'flume',role:'qvevri distillery',job:'brewing'},
 note:'Cool tuff-vaulted marani cellar with buried terracotta qvevri fermentation jars, verdigris copper alembic still-hood, and sunny apricot-mashing court.',
 build(){
  const w0=10.0,d0=8.2,y0=.26,h0=3.75;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.42,h:2.25,door:true},{x:-2.9,w:.85,y:.95,h:1.15},{x:2.9,w:.85,y:.95,h:1.15}],
   right:[{x:0,w:.85,y:.95,h:1.15}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,1.85,{mk:'verdigris'});
  smokeAt(2.8,y0+h0+1.9,-1.5);
  dvFurn([
   ['dv_qvevri_floor_pit',-2.4,y0,-1.8,0],
   ['dv_qvevri_floor_pit',2.4,y0,-1.8,0],
   ['dv_qvevri_rack',-3.6,y0,1.2,PI/2],
   ['dv_apricot_drying_tray',2.6,y0,1.6,0],
   ['dv_brazier_copper',0,y0,.2,0]
  ]);
 }});

/* 33. Gorge Tone Clay-Oven Bakehouse */
defBuilding({key:'dv-bakery-tone',name:'Tone-Puri Gorge Clay-Oven Bakehouse',seed:7309,cls:'building',w:11.4,d:10.2,h:10.6,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'flume',role:'tone bakehouse',job:'baking'},
 note:'Polychrome stone bakehouse slapping crescent shotis-puri flatbreads inside cylindrical glowing terracotta tone ovens.',
 build(){
  const w0=8.4,d0=7.2,y0=.26,h0=3.55;
  dvRootSkirt(0,0,w0,d0,5.0,{mk:'cobble',plinthH:y0+.2});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.32,h:2.2,door:true},{x:-2.3,w:.88,y:.88,h:1.15},{x:2.3,w:.88,y:.88,h:1.15}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,1.65,{mk:'slate'});
  dvSparkHood(-2.2,y0+h0+1.0,-1.2,1.55,1.95);
  /* cylindrical Georgian terracotta tone bread-well inside */
  svNoWalk(()=>{
   cyl('terracotta',-2.2,y0+.006,-1.4,.72,.86,P('terracotta'),14);
   cyl('glow',-2.2,y0+.88,-1.4,.44,.04,0xff7428,12);
  });
  dvFurn([
   ['dv_common_table',1.6,y0,-.8,0],
   ['dv_shelves_provisions',2.6,y0,-2.2,0],
   ['dv_apricot_drying_tray',-1.8,y0,1.6,0],
   ['dv_common_stool',1.6,y0,.2,PI]
  ]);
 }});

/* 34. Mutton & Smoked-Trout Cure-House */
defBuilding({key:'dv-butcher-smokehouse',name:' Shashkhi-Sakli Mutton & Gorge-Trout Smokehouse',seed:7310,cls:'building',w:11.2,d:10.0,h:11.4,cut:true,
 tags:{types:['shop','industry'],wealth:'middle',style:'flume',role:'smokehouse',job:'butchery'},
 note:'Red-cypress & basalt smokehouse curing mountain mutton hams and Crookwash river trout over fragrant apricot-wood smoke.',
 build(){
  const w0=8.2,d0=7.0,y0=.26,h0=3.6;
  dvRootSkirt(0,0,w0,d0,5.0,{mk:'cobble',plinthH:y0+.2});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.25,h:2.18,door:true},{x:-2.2,w:.8,y:.95,h:1.1},{x:2.2,w:.8,y:.95,h:1.1}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,1.8,{mk:'slate'});
  dvSparkHood(0,y0+h0+1.2,-.8,1.6,2.2);
  dvFurn([
   ['dv_common_table',-1.8,y0,-.6,0],
   ['dv_brazier_copper',0,y0,-1.2,0],
   ['dv_shelves_provisions',2.4,y0,-1.8,-PI/2],
   ['dv_qvevri_rack',-2.2,y0,1.8,0]
  ]);
 }});

/* 35. Caucasian Kilim & Madder/Saffron Dye-House */
defBuilding({key:'dv-weaver-kilim',name:'ardagi-Sakli Kilim Loom & Madder Dye-House',seed:7311,cls:'building',w:12.8,d:10.8,h:11.2,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'flume',role:'kilim weaver',job:'weaving'},
 note:'Timber-galleried loom workshop boiling crimson madder and saffron dye-vats and hanging patterned Vardzieti kilim carpets to dry.',
 build(){
  const w0=9.4,d0=7.6,y0=.28,h0=3.8;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.35,h:2.22,door:true},{x:-2.7,w:.88,y:.9,h:1.2},{x:2.7,w:.88,y:.9,h:1.2}],
   right:[{x:0,w:.88,y:.9,h:1.2}]
  });
  dvRoofTerrace(0,0,w0+.14,d0+.14,y0+h0,{});
  /* crimson & saffron kilims draped from roof-terrace drying poles */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-2.8,0,2.8])cyl('cypress',sx,y0+h0+.006,2.6,.065,2.2,P('cypress'),8);
   beam('cypress',[-2.9,y0+h0+2.1,2.6],[2.9,y0+h0+2.1,2.6],.075,P('cypress'));
   quad('kilim',-1.4,y0+h0+1.25,2.68,1.9,1.45,P('crimson'),0);
   quad('kilim',1.4,y0+h0+1.25,2.68,1.9,1.45,P('saffron'),0);
  }));
  dvFurn([
   ['dv_rug_kilim',0,y0,0,0],
   ['dv_common_table',-2.4,y0,-1.5,0],
   ['dv_shelves_provisions',2.8,y0,-2.1,0],
   ['dv_chest_jade_inlay',-2.8,y0,1.8,PI/2],
   ['dv_common_stool',-2.4,y0,-.5,PI]
  ]);
 }});

/* 36. Sheepskin Fleece & Buckler-Hide Tannery */
defBuilding({key:'dv-tannery-fleece',name:'Tkhavi-Sakli Sheepskin Fleece & Buckler-Hide Tannery',seed:7312,cls:'building',w:12.6,d:11.0,h:9.8,cut:true,
 tags:{types:['industry'],wealth:'poor',style:'flume',role:'fleece tannery',job:'tanning'},
 note:'Streamside stone soaking-vat yard curing lanolin-rich Golden-Fleece sheepskins for gold sluices and heavy bull-hide linings for nephrite bucklers.',
 build(){
  const w0=8.6,d0=7.2,cx0=-1.2,y0=.26,h0=3.45;
  dvRootSkirt(cx0,0,w0,d0,5.0,{mk:'rivercobble',plinthH:y0+.2});
  dvFloorRect(cx0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.25,h:2.15,door:true},{x:-2.3,w:.82,y:.95,h:1.1}],
   right:[{x:0,w:.85,y:.95,h:1.1}]
  });
  dvGableRoof(cx0,0,w0,d0,y0+h0,1.55,{mk:'slate'});
  /* outdoor stone lime-soaking vats & stretched sheepskin frame at +x */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sz of [-1.4,1.4]){
    box('basalt',4.2,0,sz,1.85,.62,1.85,P('basalt'));
    box('flumeWater',4.2,.64,sz,1.45,.05,1.45,P('flumeWater'));
   }
  }));
  dvFurn([
   ['dv_sluice_fleece_trough',cx0,y0,-1.6,0],
   ['dv_common_table',cx0-2.1,y0,1.2,0],
   ['dv_qvevri_rack',cx0+2.4,y0,-2.1,0],
   ['dv_brazier_copper',cx0+2.1,y0,1.6,0]
  ]);
 }});
