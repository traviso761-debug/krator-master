// prefix: ync
// ================================================================= CIVIC, SACRED & DEFENCE MONUMENTS
// Dual-Throne Twin-Kande Citadel (861d6426), Lone-Born Seer Rotunda, Sisterhood Spear-Hall, Lore-Tower Scriptorium,
// Rain-Catch Cistern & Steam-Bath, Coastal Cobble Curtain Wall, Twin-Drum Gatehouse, Crag Watch-Tower, Twin-Lance Barracks.

/* 1. Dual-Throne Twin-Kande Citadel (Monumental civic/military seat of the identical Twin Spear-Queens) */
defBuilding({key:'yn-citadel-twinkande',name:'Dual-Throne Twin-Kande Citadel',seed:7201,cls:'building',w:25.6,d:19.4,h:22.4,budget:120000,cut:true,
 tags:{types:['civic','military'],wealth:'rich',style:'freestanding',role:'palace'},
 note:'Monumental central Dual-Throne drum flanked by twin corbel-fin war-towers (861d6426), linked by arched war-galleries under twin verdigris bronze spires.',
 build(){
  const y0=.32,rC=5.2,wt=.44,rIn=rC-wt;
  ynRootSkirt(0,0,rC,6.8,{mk:'cobble',plinthH:y0+.36});
  ynFloorDisc(0,0,rC-.06,y0,'flagstone',P('flagstone'),{seg:22});
  /* massive battered cobble lower drum + sea-lime upper drum */
  ynDrumWall(0,0,rIn,rC,y0,2.8,'cobble',P('cobble'),[
   {a:PI/2,w:1.85,h:2.55,door:true,visor:true,visorOut:.85},
   {a:PI*.18,w:.82,y:1.1,h:1.25},{a:PI*.82,w:.82,y:1.1,h:1.25}
  ]);
  ynDripSkirt(0,0,rC,y0+2.8,.48,.24,'slate',P('slate'));
  ynDrumWall(0,0,rIn-.04,rC-.04,y0+2.8,3.6,'sealime',P('sealime'),[
   {a:PI/2,w:1.1,y:.9,h:1.65},{a:PI*.28,w:.85,y:1.0,h:1.45},{a:PI*.72,w:.85,y:1.0,h:1.45},{a:-PI/2,w:.9,y:1.0,h:1.45}
  ]);
  /* 18 heavy vertical stone corbel-fins carrying the overhanging war-gallery (861d6426) */
  const yG=y0+6.4,rG=6.05;
  ynCorbelFins(0,0,rC-.04,rG-.05,yG-1.65,yG,18,'corbel',P('corbel'),{bronzeTip:true});
  ynFloorDisc(0,0,rG-.08,yG+.16,'floor',P('floor'),{seg:22});
  ynArcadeRing(0,0,rG-.38,rG,yG+.16,3.1,16,{paraMk:'ashlar',colMk:'ironwood',spandrelMk:'sealime',gapA:-PI*.13});
  ynSpiralStair(0,0,rC+.05,0,yG+.16,-PI*.88,PI*.75,{w:1.02});
  ynCanopy(0,0,rG,rG+1.25,yG+3.26,3.85,{mk:'verdigris',ribs:16,finialScale:1.35});
  /* Twin flanking Spear-Queen corbel-fin bastions + flying galleries */
  for(const sg of [-1,1]){
   const bx=sg*8.4,bz=1.6,br=2.85,stA0=sg<0?PI*.65:PI*.35,stSw=sg<0?PI*.75:-PI*.75;
   ynRootSkirt(bx,bz,br,6.2,{mk:'ironstone',plinthH:.48});
   ynFloorDisc(bx,bz,br-.06,.24,'flagstone',P('flagstone'));
   ynDrumWall(bx,bz,br-.36,br,.24,5.4,'cobble',P('cobble'),[
    {a:PI/2,w:1.05,h:2.05,door:true,visor:true},{a:sg>0?0:PI,w:.68,y:2.8,h:1.25}
   ]);
   ynCorbelFins(bx,bz,br,br+.62,4.2,5.64,10,'corbel',P('corbel'),{bronzeTip:true});
   ynFloorDisc(bx,bz,br+.56,5.8,'floor',P('floor'));
   ynArcadeRing(bx,bz,br+.24,br+.62,5.8,2.55,10,{paraMk:'cobble',colMk:'ironwood',spandrelMk:'sealime',gapA:stA0+stSw});
   ynSpiralStair(bx,bz,br+.04,0,5.8,stA0,stSw,{w:.9});
   ynCanopy(bx,bz,br+.62,br+1.45,8.35,3.4,{mk:'verdigris',ribs:10,finialScale:1.1});
   ynFlyingBridge(sg*4.95,3.85,.45,sg*5.75,3.85,1.25,1.45,{roofMk:'verdigris',arch:true,archDrop:1.4});
   ynBanner(sg*3.2,0,5.8,0,3.4,sg<0?P('carnelian'):P('indigo'));
  }
  /* Dual-Throne Hall interior furnishing */
  FURNISH('yonni_court_carpet',0,y0,0,0);
  const yc=y0+.05;
  FURNISH('yonni_court_twin_throne',0,y0,-3.25,0);
  FURNISH('yonni_court_feast_table',0,yc,.2,0);
  for(const sx of [-2.4,2.4]){
   FURNISH('yonni_common_brazier',sx,y0,1.8,0);
   FURNISH('yonni_common_dual_spear_rack',sx*1.45,y0,-1.2,ynFace(sx*1.45,-1.2,0,0));
   FURNISH('yonni_trade_armour_stand',sx*1.35,y0,1.0,ynFace(sx*1.35,1.0,0,0));
   FURNISH('yonni_common_banner',sx*1.1,y0,-3.85,0);
  }
  FURNISH_HANG('yonni_common_storm_lamp',0,yG-.05,0,0);
 }});

/* 2. Lone-Born Seer Rotunda (Sacred sanctuary of the rare 10% single-born Yonni seers, Loni-Borna) */
defBuilding({key:'yn-rotunda-seer',name:'Loni-Borna Lone-Born Seer Rotunda',seed:7202,cls:'building',w:16.4,d:16.4,h:15.8,cut:true,
 tags:{types:['religious','funerary'],wealth:'rich',style:'freestanding',role:'temple',job:'worship'},
 note:'Sacred peripteral sea-lime rotunda ringed by a colonnaded ironwood ambulatory under a broad verdigris rain-canopy, centred on the amber scrying basin.',
 build(){
  const rAmb=5.8,rSan=3.85,y0=.28;
  ynRootSkirt(0,0,rAmb,5.4,{mk:'granite',plinthH:y0+.28});
  ynFloorDisc(0,0,rAmb-.05,y0,'flagstone',P('flagstone'),{seg:24});
  /* outer colonnade of 16 oiled ironwood & bronze columns carrying the broad ambulatory eave */
  ynNoCut(()=>{
   const asCol=P('ashlar'),iwCol=P('ironwood'),bzCol=P('bronze');
   for(let i=0;i<16;i++){
    const a=i/16*TAU,px=Math.cos(a)*(rAmb-.36),pz=Math.sin(a)*(rAmb-.36);
    cyl('ashlar',px,y0+.005,pz,.24,.315,asCol,10);
    cyl('ironwood',px,y0+.325,pz,.15,3.44,iwCol,12);
    cyl('bronze',px,y0+3.77,pz,.21,.115,bzCol,12);
   }
   sector('ashlar',0,0,rAmb-.55,rAmb-.16,0,TAU,y0+3.89,y0+4.25,asCol,32);
   ynCanopy(0,0,rAmb-.16,rAmb+1.05,y0+4.25,1.65,{mk:'slate',ribs:16,finial:false,rHub:rSan+.08});
  });
  /* inner sea-lime sanctuary drum rising above the ambulatory into a bronze-ribbed dome/cone */
  ynDrumWall(0,0,rSan-.36,rSan,y0,6.8,'sealime',P('sealime'),[
   {a:PI/2,w:1.45,h:2.35,door:true,visor:false},{a:-PI/2,w:.85,y:3.8,h:1.45},
   {a:0,w:.85,y:3.8,h:1.45},{a:PI,w:.85,y:3.8,h:1.45}
  ]);
  ynCanopy(0,0,rSan,rSan+.95,y0+6.8,3.45,{mk:'verdigris',ribs:12,bell:.32,finialScale:1.15});
  /* Sanctuary interior */
  FURNISH('yonni_court_carpet',0,y0,0,0);
  FURNISH('yonni_common_seer_basin',0,y0+.05,0,0);
  for(let i=0;i<4;i++){
   const a=i*PI/2+PI/4,rx=Math.cos(a)*2.55,rz=Math.sin(a)*2.55;
   FURNISH(i%2===0?'yonni_common_brazier':'yonni_common_post_lamp',rx,y0+.006,rz,0);
  }
  FURNISH('yonni_common_banner',0,y0,-3.1,0);
  FURNISH('yonni_works_scribe_desk',-1.95,y0,-1.4,PI*.25);
 }});

/* 3. Sisterhood Spear-Hall & Guild-Moot */
defBuilding({key:'yn-hall-sisterhood',name:'Sisterhood Spear-Hall & Guild-Moot',seed:7203,cls:'building',w:17.2,d:17.2,h:15.4,cut:true,
 tags:{types:['civic'],wealth:'rich',style:'freestanding',role:'guild hall'},
 note:'Broad circular council & guild-moot hall of the Spear-Sisters with overhanging ironwood clerestory gallery, moot ring, and twin-hearth braziers.',
 build(){
  const r=5.4,y0=.24;
  ynRootSkirt(0,0,r,5.4,{mk:'cobble',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.06,y0,'flagstone',P('flagstone'),{seg:22});
  ynDrumWall(0,0,r-.38,r,y0,4.2,'cobble',P('cobble'),[
   {a:PI/2,w:1.65,h:2.35,door:true,visor:true,visorOut:.75},
   {a:PI*.18,w:.82,y:1.2,h:1.35},{a:PI*.82,w:.82,y:1.2,h:1.35},{a:-PI*.25,w:.82,y:1.2,h:1.35},{a:-PI*.75,w:.82,y:1.2,h:1.35}
  ]);
  ynCorbelFins(0,0,r,r+.65,3.1,4.44,16,'corbel',P('corbel'));
  ynArcadeRing(0,0,r+.28,r+.65,4.6,2.35,14,{paraMk:'sealime',colMk:'ironwood',spandrelMk:'sealime'});
  ynCanopy(0,0,r+.65,r+1.75,6.95,3.6,{mk:'slate',ribs:14,finialScale:1.2});
  /* Moot interior */
  FURNISH('yonni_court_carpet',0,y0,0,0);
  FURNISH('yonni_court_feast_table',0,y0+.05,0,0);
  for(let i=0;i<6;i++){
   const a=i*TAU/6+.3;
   FURNISH('yonni_common_bench',Math.cos(a)*3.65,y0,Math.sin(a)*3.65,ynFace(Math.cos(a),Math.sin(a),0,0));
  }
  FURNISH('yonni_works_scribe_desk',0,y0,-3.9,0);
  FURNISH('yonni_common_dual_spear_rack',-4.3,y0,-.5,PI/2);
  FURNISH('yonni_common_dual_spear_rack',4.3,y0,-.5,-PI/2);
  FURNISH_HANG('yonni_common_storm_lamp',0,6.6,0,0);
 }});

/* 4. Lore-Tower Scriptorium & School */
defBuilding({key:'yn-school-scriptorium',name:'Lor-Tur Seer-Scribes Lore-Tower',seed:7204,cls:'building',w:12.6,d:12.6,h:14.8,cut:true,
 tags:{types:['civic'],wealth:'middle',style:'freestanding',role:'school',job:'scribing'},
 note:'Two-storey sea-lime scriptorium & school rotunda with glazed ribbon windows under crescent rain-visors, tally desks, and scroll shelves.',
 build(){
  const r=3.8,y0=.2;
  ynRootSkirt(0,0,r,5.0,{mk:'cobble',plinthH:y0+.24});
  ynFloorDisc(0,0,r-.05,y0,'floor',P('floor'),{seg:20});
  ynDrumWall(0,0,r-.34,r,y0,3.2,'cobble',P('cobble'),[{a:PI/2,w:1.2,h:2.15,door:true,visor:true}]);
  ynDripSkirt(0,0,r,y0+3.2,.45,.22,'slate',P('slate'));
  ynDrumWall(0,0,r-.38,r-.04,y0+3.2,3.4,'sealime',P('sealime'),[
   {a:PI/2,w:.9,y:.75,h:1.45},{a:PI*.15,w:.9,y:.75,h:1.45},{a:PI*.85,w:.9,y:.75,h:1.45},
   {a:-PI*.25,w:.9,y:.75,h:1.45},{a:-PI*.75,w:.9,y:.75,h:1.45}
  ]);
  ynSpiralStair(0,0,r+.03,0,y0+3.35,PI*.65,PI*.85);
  ynCanopy(0,0,r-.04,r+.95,y0+6.6,2.95,{mk:'verdigris',ribs:10});
  ynFurn([
   ['yonni_works_scribe_desk',-1.35,y0,-.8,PI*.15],
   ['yonni_works_scribe_desk',1.35,y0,-.8,-PI*.15],
   ['yonni_common_chair',-1.35,y0,.1,PI],
   ['yonni_common_chair',1.35,y0,.1,PI],
   ['yonni_common_shelves',0,y0,-2.85,0],
   ['yonni_common_brazier',0,y0,1.25,0]
  ]);
 }});

/* 5. Rain-Catch Cistern & Steam-Bath */
defBuilding({key:'yn-bath-cistern',name:'Ren-Kistern Rain-Catch Cistern & Steam-Bath',seed:7205,cls:'building',w:14.2,d:14.2,h:11.2,cut:true,
 tags:{types:['civic','infrastructure'],wealth:'middle',style:'freestanding',role:'cistern bathhouse'},
 note:'Inverted verdigris bronze rain-funnel roof harvesting 2,200 mm/yr coastal squalls into a central stone cistern and vaulted cobble steam-bath.',
 build(){
  const r=4.6,y0=.2;
  ynRootSkirt(0,0,r,5.2,{mk:'granite',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'),{seg:20});
  ynDrumWall(0,0,r-.38,r,y0,4.6,'sealime',P('sealimeW'),[
   {a:PI/2,w:1.3,h:2.15,door:true,visor:true},{a:0,w:.72,y:2.2,h:.95},{a:PI,w:.72,y:2.2,h:.95},{a:-PI/2,w:.72,y:2.2,h:.95}
  ]);
  ynFunnelRoof(0,0,r,r+1.15,y0+4.6,1.15,{rSpout:.52});
  /* central stone catch-basin inside */
  cyl('granite',0,y0,0,1.45,.62,P('granite'),16);
  cyl('water',0,y0+.62,0,1.22,.06,0x2a7880,16);
  smokeAt(0,y0+1.1,0,{r:.35});
  ynFurn([
   ['yonni_common_bench',-2.6,y0,-1.4,PI*.35],
   ['yonni_common_bench',2.6,y0,-1.4,-PI*.35],
   ['yonni_common_brazier',-2.2,y0,1.6,0],
   ['yonni_common_brazier',2.2,y0,1.6,0],
   ['yonni_common_shelves',0,y0,-3.55,0]
  ]);
 }});

/* ---- DEFENCE: Twin-Drum Gatehouse, Crag Watch-Tower & Twin-Lance Barracks (Formline walls/portal/tower in 57-yn-forts.js) ---- */
defBuilding({key:'yn-gate-twindrum',name:'Tvin-Get Twin-Drum Gatehouse',seed:7207,cls:'building',w:18.4,d:11.6,h:15.8,cut:true,
 tags:{types:['infrastructure','military'],wealth:'middle',style:'freestanding',role:'gatehouse'},
 note:'Twin battered cobble round-towers flanking a quoined stone gate passage, bridged by a corbel-fin overhanging war-gallery and broad slate canopy.',
 build(){
  for(const sg of [-1,1]){
   const gx=sg*4.65,r=2.95;
   ynRootSkirt(gx,0,r,5.6,{mk:'cobble',plinthH:.42});
   ynFloorDisc(gx,0,r-.06,.18,'flagstone',P('flagstone'));
   ynDrumWall(gx,0,r-.38,r,.18,5.8,'cobble',P('cobble'),[
    {a:sg<0?0:PI,w:.95,h:2.0,door:true},{a:PI/2,w:.52,y:2.6,h:1.25}
   ]);
   ynCorbelFins(gx,0,r,r+.55,4.6,5.98,10,'corbel',P('corbel'));
   ynCanopy(gx,0,r+.55,r+1.35,6.14,2.85,{mk:'slate',ribs:8});
   ynFurn([
    ['yonni_common_dual_spear_rack',gx,0.18,-1.85,0],
    ['yonni_trade_armour_stand',gx+sg*.9,0.18,0,-sg*PI/2],
    ['yonni_common_brazier',gx,0.18,.8,0]
   ]);
  }
  /* central vaulted stone gate arch + overhanging bridge war-gallery */
  box('ashlar',0,3.8,0,3.85,2.15,4.2,P('ashlar'));
  ynArcadeRing(0,0,1.65,2.35,5.95,2.25,8,{paraMk:'sealime',colMk:'ironwood',spandrelMk:'sealime'});
  ynCanopy(0,0,2.35,3.25,8.2,2.1,{mk:'verdigris',ribs:8});
  door(0,0,2.1,0,3.2,3.6);
  svLeaf(0,0,0,0,3.2,3.55,{mk:'ironwood',col:P('ironwood'),split:true,t:.1,name:'city gate'});
  ynBanner(-2.1,3.9,2.25,0,2.6,P('carnelian'));
  ynBanner(2.1,3.9,2.25,0,2.6,P('indigo'));
 }});

defBuilding({key:'yn-watchtower',name:'Skor-Woch Scoured-Crag Watch-Tower',seed:7208,cls:'building',w:10.8,d:10.8,h:18.4,cut:true,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'freestanding',role:'watchtower'},
 note:'Slender battered ironstone & sea-lime watch-shaft flaring on 12 vertical corbel-fins to an overhanging lookout gallery and storm-beacon.',
 build(){
  const r=2.65,y0=.24;
  ynRootSkirt(0,0,r,6.0,{mk:'ironstone',plinthH:y0+.3});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.36,r,y0,3.4,'ironstone',P('ironstone'),[{a:PI/2,w:1.0,h:2.05,door:true,visor:true}]);
  ynDripSkirt(0,0,r,y0+3.4,.38,.2,'slate',P('slate'));
  ynDrumWall(0,0,r-.4,r-.04,y0+3.4,4.6,'sealime',P('sealime'),[
   {a:PI/2,w:.55,y:1.6,h:1.2},{a:0,w:.55,y:1.6,h:1.2},{a:PI,w:.55,y:1.6,h:1.2},{a:-PI/2,w:.55,y:1.6,h:1.2}
  ]);
  const yG=y0+8.0,rG=3.45;
  ynCorbelFins(0,0,r-.04,rG-.04,yG-1.5,yG,12,'corbel',P('corbel'),{bronzeTip:true});
  ynFloorDisc(0,0,rG-.06,yG+.16,'floor',P('floor'));
  ynArcadeRing(0,0,rG-.32,rG,yG+.16,2.45,10,{paraMk:'cobble',colMk:'ironwood',spandrelMk:'sealime',gapA:PI*1.52});
  ynSpiralStair(0,0,r+.03,0,yG+.16,PI*.58,PI*.94);
  ynCanopy(0,0,rG,rG+.95,yG+2.61,3.05,{mk:'verdigris',ribs:10});
  ynFurn([
   ['yonni_trade_bunk',0,y0,-1.25,0],
   ['yonni_common_dual_spear_rack',1.65,y0,0,-PI/2],
   ['yonni_trade_armour_stand',-1.65,y0,0,PI/2],
   ['yonni_common_brazier',0,y0,.95,0],
   ['yonni_common_brazier',0,yG+.16,0,0]
  ]);
 }});

defBuilding({key:'yn-barracks-lance',name:'Tvin-Lans Twin-Lance Barracks',seed:7209,cls:'building',w:18.6,d:12.6,h:14.4,cut:true,
 tags:{types:['military','dwelling-multi'],wealth:'middle',style:'freestanding',role:'barracks'},
 note:'Paired garrison drums for Twin-Lance spear-companies joined by a roofed muster bridge, furnished with twin-bunks, armour stands, and spear racks.',
 build(){
  for(const sg of [-1,1]){
   const bx=sg*4.5,r=3.35,y0=.22;
   ynRootSkirt(bx,0,r,5.4,{mk:'cobble',plinthH:y0+.26});
   ynFloorDisc(bx,0,r-.06,y0,'flagstone',P('flagstone'));
   ynDrumWall(bx,0,r-.36,r,y0,2.5,'cobble',P('cobble'),[{a:PI/2,w:1.15,h:2.1,door:true,visor:true}]);
   ynDripSkirt(bx,0,r,y0+2.5,.38,.18,'slate',P('slate'));
   ynDrumWall(bx,0,r-.4,r-.04,y0+2.5,2.8,'sealime',P('sealime'),[
    {a:sg<0?0:PI,w:.95,y:.35,h:1.85,door:true,open:true},{a:PI*.5,w:.72,y:.85,h:1.15},{a:-PI/2,w:.72,y:.85,h:1.15}
   ]);
   ynCanopy(bx,0,r-.04,r+.95,y0+5.3,2.75,{mk:'slate',ribs:10});
   ynFurn([
    ['yonni_trade_bunk',bx-.95,y0,-1.45,0],
    ['yonni_trade_bunk',bx+.95,y0,-1.45,0],
    ['yonni_common_dual_spear_rack',bx+sg*2.25,y0,0,-sg*PI/2],
    ['yonni_trade_armour_stand',bx-sg*2.1,y0,.6,sg*PI/2],
    ['yonni_common_brazier',bx,y0,1.05,0]
   ]);
  }
  ynFlyingBridge(-1.2,3.05,0,1.2,3.05,0,1.45,{roofMk:'verdigris'});
  /* outdoor practice dummy in front muster gap */
  FURNISH('generic_training_training_dummy',0,0,2.6,0,{setting:'outdoor'});
 }});
