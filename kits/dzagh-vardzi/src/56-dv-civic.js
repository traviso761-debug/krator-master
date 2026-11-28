// prefix: dvc
// ================================================================= CIVIC, SACRED, ROYAL & ARCHAIC GORGE-DEFENCE MONUMENTS (style: 'aul', DV2 + DV4)
// Petty Valley-King Palace-Citadel (`dv-citadel-mepe`), 12-Pleat Akhtamar Gumbat Sanctuary (`dv-sanctuary-gumbat`),
// Nephrite Weregild Court (`dv-hall-weregild`), Champions Duel Covered Chasm Sky-Bridge (`dv-bridge-duel`),
// Qvevri Apricot-Brandy Tavern, Abanot Bathhouse, Lore-Scriptorium, Khachkar Shrine, Duel-Surgeon Healer,
// Curtain Wall, Chasm Flume-Tunnel Gatehouse (`dv-gate-flume`), Vovnashki Watch-Towers, Cousins Barracks, Beacon & Cable-Ferry.

/* 10. Petty Valley-King's Palace-Citadel (`dv-citadel-mepe`) */
defBuilding({key:'dv-citadel-mepe',name:'Dzagh-Mepe Tsikhe Petty Valley-King Palace-Citadel',seed:7201,cls:'building',w:21.6,d:18.4,h:22.4,cut:true,
 tags:{types:['civic','military'],wealth:'rich',style:'aul',role:'palace-citadel',landmark:true},
 note:'Seat of a Valley-King (Dzagh-Mepe): polychrome apricot-tuff & basalt ablaq palace crowned by a soaring 12-pleat verdigris copper gumbat spire and flanked by three razor-slender 5:1 dark-slate & crimson-tuff needle-towers.',
 build(){
  const w0=13.2,d0=11.2,y0=.46,h0=4.85;
  dvRootSkirt(0,.6,w0,d0,6.8,{mk:'colBasalt',plinthH:y0+.28});
  dvFloorRect(0,.6,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,.6,w0,d0,y0,h0,{
   front:[{x:0,w:1.75,h:2.68,door:true},{x:-3.8,w:.98,y:1.1,h:1.42},{x:3.8,w:.98,y:1.1,h:1.42}],
   left:[{x:-1.8,w:.92,y:1.1,h:1.38},{x:1.8,w:.92,y:1.1,h:1.38}],
   right:[{x:-1.8,w:.92,y:1.1,h:1.38},{x:1.8,w:.92,y:1.1,h:1.38}],
   back:[{x:0,w:1.1,y:1.1,h:1.45}]
  });
  dvExtStair(0,.6+d0/2+1.2,0,y0,PI,1.85,1.2);
  for(const sx of [-4.2,0,4.2])if(sx!==0)dvJadeCross(sx,y0+3.65,.6+d0/2+.01,0,.74);
  dvJadeCross(0,y0+3.95,.6+d0/2+.01,0,.82);

  /* stepped upper clerestory drum-base + grand 12-pleat patinated verdigris copper Akhtamar gumbat! */
  const y1=y0+h0;
  dvRoofTerrace(0,.6,w0+.18,d0+.18,y1,{});
  dvAblaqBox(0,.4,7.4,7.2,y1+.02,2.45,{
   front:[{x:-1.8,w:.78,y:.55,h:1.1},{x:1.8,w:.78,y:.55,h:1.1}],
   back:[{x:0,w:.82,y:.55,h:1.1}]
  });
  dvRoofTerrace(0,.4,7.55,7.35,y1+2.47,{parapet:false,walk:false});
  dvGumbat(0,.4,2.65,y1+2.47,3.15,4.15,{mk:'verdigris',windows:8});

  /* three clustered 5:1 dark-slate, basalt & crimson-tuff needle-towers guarding the flanks & rear keep! */
  dvNeedleTower(-8.15,-4.2,2.95,0,15.2,{rootD:6.8,doorYaw:0,pulley:true,pulleyYaw:-PI/2,pulleyDrop:4.2});
  dvNeedleTower(8.15,-4.2,2.85,0,14.4,{rootD:6.8,doorYaw:0});
  dvNeedleTower(-8.05,4.45,2.6,0,12.8,{rootD:6.4,doorYaw:0});
  dvBanner(-2.6,y1,.6+d0/2-.25,0,3.1,P('crimson'));
  dvBanner(2.6,y1,.6+d0/2-.25,0,3.1,P('saffron'));
  dvLampBracket(-1.45,y0+2.45,.6+d0/2+.02,0,1.0);
  dvLampBracket(1.45,y0+2.45,.6+d0/2+.02,0,1.0);

  /* Jade-Throne Hall furnishing */
  dvFurn([
   ['dv_court_carpet',0,y0,.4,0],
   ['dv_throne_mepe',0,y0,-3.65,0],
   ['dv_scale_weregild',-3.4,y0,-2.8,PI*.2],
   ['dv_armour_stand_scale',-4.8,y0,-3.5,.3],
   ['dv_armour_stand_scale',4.8,y0,-3.5,-.3],
   ['dv_feast_table_brandy',-3.1,y0,1.65,PI/2],
   ['dv_feast_table_brandy',3.1,y0,1.65,-PI/2],
   ['dv_rack_buckler_sword',-5.6,y0,.5,PI/2],
   ['dv_rack_buckler_sword',5.6,y0,.5,-PI/2],
   ['dv_brazier_copper',0,y0+.058,2.65,0]
  ]);
  FURNISH_HANG('dv_chandelier_bronze',0,y1-.18,.4,0);
 }});

/* 11. 12-Pleat Akhtamar Umbrella Gumbat Sanctuary (`dv-sanctuary-gumbat`) */
defBuilding({key:'dv-sanctuary-gumbat',name:'Surb-Gumbat 12-Pleat Akhtamar Sanctuary',seed:7202,cls:'building',w:15.2,d:15.2,h:19.6,cut:true,
 tags:{types:['religious','civic'],wealth:'rich',style:'aul',role:'gumbat sanctuary',job:'worship',landmark:true},
 note:'Cruciform polychrome apricot-tuff & basalt sanctuary inlaid with sawn emerald nephrite cross-medallions and golden-skarn tympanums under a 12-pleat fluted conical gumbat spire.',
 build(){
  const y0=.42,hArm=4.65;
  /* central square core + 4 projecting cruciform gable arms (non-overlapping wings so zero corner z-fighting!) */
  dvRootSkirt(0,0,11.6,11.6,6.0,{mk:'colBasalt',plinthH:y0+.26});
  dvFloorRect(0,0,10.8,10.8,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,7.8,7.8,y0,hArm+1.15,{});
  /* front (+z) & back (-z) arms */
  dvAblaqBox(0,4.95,5.2,2.0,y0,hArm,{front:[{x:0,w:1.48,h:2.48,door:true}]});
  dvGableRoof(0,4.95,5.2,2.0,y0+hArm,1.55,{mk:'tuffPolished',col:P('tuffCrimson')});
  dvAblaqBox(0,-4.95,5.2,2.0,y0,hArm,{back:[{x:0,w:.76,y:1.25,h:1.45}]});
  dvGableRoof(0,-4.95,5.2,2.0,y0+hArm,1.55,{mk:'tuffPolished',col:P('tuffCrimson')});
  /* east (+x) & west (-x) transept arms */
  dvAblaqBox(4.95,0,2.0,5.2,y0,hArm,{right:[{x:0,w:.82,y:1.2,h:1.45}]});
  W(4.95,0,0,PI/2,()=>dvGableRoof(0,0,5.2,2.0,y0+hArm,1.55,{mk:'tuffPolished',col:P('tuffCrimson')}));
  dvAblaqBox(-4.95,0,2.0,5.2,y0,hArm,{left:[{x:0,w:.82,y:1.2,h:1.45}]});
  W(-4.95,0,0,PI/2,()=>dvGableRoof(0,0,5.2,2.0,y0+hArm,1.55,{mk:'tuffPolished',col:P('tuffCrimson')}));

  dvExtStair(0,7.05,0,y0,PI,1.65,1.1);
  dvRoofTerrace(0,0,7.95,7.95,y0+hArm+1.15,{parapet:false});
  /* soaring 12-pleat patinated verdigris copper Akhtamar umbrella gumbat! */
  dvGumbat(0,0,2.45,y0+hArm+1.15,3.25,4.25,{mk:'verdigris',windows:8});
  for(const a of [0,PI/2,PI,-PI/2]){
   dvJadeCross(Math.sin(a)*5.96,y0+3.55,Math.cos(a)*5.96,a,.68);
  }
  dvFurn([
   ['dv_court_carpet',0,y0,0,0],
   ['dv_sanctuary_altar',0,y0,-2.65,0],
   ['dv_brazier_copper',-2.2,y0,1.6,0],
   ['dv_brazier_copper',2.2,y0,1.6,0],
   ['dv_scriptorium_lectern',-2.5,y0,-1.2,PI/2],
   ['dv_carved_chair',2.5,y0,-1.2,-PI/2]
  ]);
  FURNISH_HANG('dv_chandelier_bronze',0,y0+hArm+.95,0,0);
 }});

/* 12. Nephrite Weregild Court & Weigh-Hall (`dv-hall-weregild`) */
defBuilding({key:'dv-hall-weregild',name:'Dzedi-Sakhli Nephrite Weregild Court & Weigh-Hall',seed:7203,cls:'building',w:14.8,d:12.8,h:16.4,cut:true,
 tags:{types:['civic'],wealth:'rich',style:'aul',role:'weregild court',job:'customs'},
 note:'Polychrome ablaq law-court crowned by a 12-pleat crimson/apricot tuff gumbat spire, where sawn emerald nephrite slabs settle blood-prices after champions duels.',
 build(){
  const w0=11.2,d0=9.0,y0=.38,h0=4.35;
  dvRootSkirt(0,0,w0,d0,5.8,{mk:'colBasalt',plinthH:y0+.25});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.52,h:2.45,door:true},{x:-3.3,w:.95,y:1.0,h:1.35},{x:3.3,w:.95,y:1.0,h:1.35}],
   left:[{x:0,w:.92,y:1.0,h:1.3}],right:[{x:0,w:.92,y:1.0,h:1.3}],back:[{x:0,w:1.0,y:1.0,h:1.35}]
  });
  dvExtStair(0,d0/2+1.05,0,y0,PI,1.6,1.05);
  dvRoofTerrace(0,0,w0+.16,d0+.16,y0+h0,{});
  dvGumbat(0,0,2.25,y0+h0,2.65,3.55,{mk:'tuffPolished',col:P('tuffCrimson'),windows:8});
  dvJadeCross(-3.3,y0+3.35,d0/2+.008,0,.64);
  dvJadeCross(3.3,y0+3.35,d0/2+.008,0,.64);
  dvFurn([
   ['dv_court_carpet',0,y0,-.2,0],
   ['dv_scale_weregild',-1.45,y0+.055,.35,0],
   ['dv_scale_weregild',1.45,y0+.055,.35,0],
   ['dv_throne_mepe',0,y0,-3.15,0],
   ['dv_scriptorium_lectern',-3.8,y0,-2.4,PI*.25],
   ['dv_scriptorium_lectern',3.8,y0,-2.4,-PI*.25],
   ['dv_chest_jade_inlay',-4.1,y0,2.2,PI/2],
   ['dv_chest_jade_inlay',4.1,y0,2.2,-PI/2]
  ]);
 }});

/* 13. Champions' Duel Covered Chasm Sky-Bridge (`dv-bridge-duel`) */
defBuilding({key:'dv-bridge-duel',name:'Gmiri-Khidi Champions Duel Covered Chasm Sky-Bridge',seed:7204,cls:'building',w:20.4,d:9.2,h:16.8,cut:true,
 front:{x:-6.8,z:2.9,yaw:0},
 tags:{types:['infrastructure','civic','military'],wealth:'rich',style:'aul',role:'duel sky-bridge',landmark:true},
 note:'High-arch basalt & apricot-tuff chasm bridge with a covered duel-gallery and central 12-pleat verdigris gumbat pavilion where 1-v-1 and 3-v-3 champions settle valley borders.',
 build(){
  /* west (-x) and east (+x) chasm-rim stone gate-abutments standing on solid y = 0 banks (`|x| >= 5.2`) */
  const yDeck=2.55;
  for(const sg of [-1,1]){
   const ax=sg*6.8;
   dvRootSkirt(ax,0,4.6,5.8,6.6,{mk:'colBasalt',plinthH:.42});
   dvFloorRect(ax,0,4.4,5.6,.22,'flagstone',P('flagstone'));
   dvAblaqBox(ax,0,4.6,5.8,.22,2.33,{
    front:[{x:0,w:1.25,h:1.95,door:true}],
    back:[{x:0,w:.75,y:.8,h:.95}]
   });
   /* approach stairs rising from chasm rim + interior abutment ladder up onto duel deck yDeck */
   dvExtStair(ax+sg*3.65,0,0,yDeck,sg<0?PI/2:-PI/2,1.55,2.75);
   wkLadder(ax,.22,-1.6,ax,yDeck,-1.6);
  }
  /* soaring pointed basalt & golden-skarn chasm arch spanning x = -4.5 .. +4.5 over the Crookwash river! */
  dvNoCut(()=>svNoWalk(()=>{
   const nA=12;
   for(let i=0;i<nA;i++){
    const u0=i/nA,u1=(i+1)/nA,x0=lerp(-4.6,4.6,u0),x1=lerp(-4.6,4.6,u1);
    const archY=u=>-1.2+3.55*(1-Math.pow(Math.abs(u*2-1),1.55));
    const vw=i%2?.48:.41,vh=i%2?.52:.45;
    for(const sz of [-1.85,1.85]){
     beam(i%2?'skarn':'basalt',[x0,archY(u0),sz],[x1,archY(u1),sz],vw,i%2?P('skarn'):P('basalt'),false,undefined,vh);
    }
   }
  }));
  /* walkable covered duel-gallery deck spanning full 16.2 m across chasm */
  dvFloorRect(0,0,16.2,4.6,yDeck,'flagstone',P('flagstone'));
  /* open-arcaded duel parapet & timber-column gallery along ±z + central 12-pleat gumbat truce kiosk! */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sz of [-1,1]){
    box('tuff',0,yDeck+.005,sz*2.12,16.0,.92,.28,P('tuff'));
    box('skarn',0,yDeck+.93,sz*2.12,16.1,.08,.34,P('skarn'));
    for(const px of [-6.4,-4.2,-2.2,2.2,4.2,6.4]){
     cyl('cypress',px,yDeck+1.02,sz*2.12,.11,2.18,P('cypress'),8);
    }
   }
  }));
  /* side duel-gallery roofs flanking central gumbat pavilion */
  W(-4.55,0,0,PI/2,()=>dvGableRoof(0,0,4.6,4.5,yDeck+3.22,1.15,{mk:'slate',jadeGable:false}));
  W(4.55,0,0,PI/2,()=>dvGableRoof(0,0,4.6,4.5,yDeck+3.22,1.15,{mk:'slate',jadeGable:false}));
  /* central truce kiosk drum-box + 12-pleat patinated verdigris copper gumbat! */
  dvAblaqBox(0,0,4.2,4.6,yDeck+3.22,1.15,{frieze:false});
  dvGumbat(0,0,1.75,yDeck+4.38,2.15,2.95,{mk:'verdigris',windows:4});
  dvJadeCross(0,yDeck+3.85,2.32,0,.62);
  dvJadeCross(0,yDeck+3.85,-2.32,PI,.62);
  dvBanner(-2.1,yDeck,2.35,0,2.8,P('crimson'));
  dvBanner(2.1,yDeck,2.35,0,2.8,P('indigo'));

  /* duelling champions' weapon racks, truce brazier & weregild scale on the sky-bridge deck */
  dvFurn([
   ['dv_rack_buckler_sword',-5.2,yDeck,-1.65,0],
   ['dv_rack_buckler_sword',5.2,yDeck,-1.65,0],
   ['dv_scale_weregild',0,yDeck,-1.55,0],
   ['dv_brazier_copper',-2.6,yDeck,1.35,0],
   ['dv_brazier_copper',2.6,yDeck,1.35,0]
  ]);
 }});

/* 14. Qvevri Apricot-Brandy Tavern & Champions' Feast-Hall */
defBuilding({key:'dv-tavern-qvevri',name:'Marani-Dukhan Qvevri Apricot-Brandy Tavern & Feast-Hall',seed:7205,cls:'building',w:14.4,d:12.2,h:12.4,cut:true,
 tags:{types:['tavern','inn'],wealth:'middle',style:'aul',role:'brandy tavern',job:'brewing'},
 note:'Vaulted apricot-tuff & basalt tavern where rival valley cousins toast sky-bridge duels with qvevri-aged apricot brandy from ibex drinking horns.',
 build(){
  const w0=11.0,d0=8.6,y0=.32,h0=3.95;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.45,h:2.28,door:true},{x:-3.2,w:.95,y:.9,h:1.25},{x:3.2,w:.95,y:.9,h:1.25}],
   left:[{x:0,w:.88,y:.95,h:1.2}],right:[{x:0,w:.88,y:.95,h:1.2}]
  });
  dvExtStair(0,d0/2+.95,0,y0,PI,1.5,.95);
  dvRoofTerrace(0,0,w0+.16,d0+.16,y0+h0,{});
  dvGumbat(0,-.4,1.65,y0+h0,1.95,2.55,{mk:'verdigris',windows:4});
  smokeAt(-3.6,y0+h0+.6,-2.4);
  dvLampBracket(-1.3,y0+2.15,d0/2+.02,0,.95);
  dvLampBracket(1.3,y0+2.15,d0/2+.02,0,.95);
  dvFurn([
   ['dv_feast_table_brandy',-2.3,y0,.2,0],
   ['dv_feast_table_brandy',2.3,y0,.2,0],
   ['dv_dedabodzi_hearth',0,y0,-2.1,0],
   ['dv_qvevri_rack',-4.2,y0,-2.9,0],
   ['dv_qvevri_floor_pit',3.6,y0,-2.8,0],
   ['dv_common_stool',-2.3,y0,1.15,PI],
   ['dv_common_stool',2.3,y0,1.15,PI]
  ]);
 }});

/* 15. Gorge Hot-Spring Abanot Bathhouse */
defBuilding({key:'dv-bath-sulfur',name:'Abanot-Dzagh Sulfur Hot-Spring Bathhouse',seed:7206,cls:'building',w:12.6,d:11.6,h:12.2,cut:true,
 tags:{types:['civic'],wealth:'middle',style:'aul',role:'bathhouse',job:'healing'},
 note:'Low polychrome ablaq masonry bathhouse crowned by a 12-pleat verdigris copper steam-gumbat over warm tiled gorge hot-spring plunge basins.',
 build(){
  const w0=9.4,d0=8.4,y0=.28,h0=3.45;
  dvRootSkirt(0,0,w0,d0,5.0,{mk:'colBasalt',plinthH:y0+.2});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.28,h:2.18,door:true},{x:-2.6,w:.72,y:1.35,h:.95},{x:2.6,w:.72,y:1.35,h:.95}],
   back:[{x:0,w:.78,y:1.35,h:.95}]
  });
  dvExtStair(0,d0/2+.85,0,y0,PI,1.4,.85);
  dvRoofTerrace(0,0,w0+.14,d0+.14,y0+h0,{parapet:false});
  dvGumbat(0,0,1.85,y0+h0,1.85,2.45,{mk:'verdigris',windows:4});
  /* interior stone plunge-pool curb + warm water sheet */
  svNoWalk(()=>{
   box('skarn',0,y0+.006,-.65,3.6,.42,2.6,P('skarn'));
   box('flumeWater',0,y0+.44,-.65,3.1,.05,2.1,P('flumeWater'));
  });
  dvFurn([
   ['dv_brazier_copper',-3.1,y0,1.8,0],
   ['dv_brazier_copper',3.1,y0,1.8,0],
   ['dv_shelves_provisions',-3.6,y0,-2.6,PI/2],
   ['dv_common_stool',-2.4,y0,-.65,PI/2],
   ['dv_common_stool',2.4,y0,-.65,-PI/2]
  ]);
 }});

/* 16. Chivalric Genealogy & Gorge-Lore Scriptorium */
defBuilding({key:'dv-scriptorium-lore',name:'Matiane-Tur Chivalric Genealogy & Lore Scriptorium',seed:7207,cls:'building',w:11.8,d:11.2,h:15.2,cut:true,
 tags:{types:['civic','religious'],wealth:'middle',style:'aul',role:'scriptorium',job:'scribing'},
 note:'Stepped apricot-tuff & golden-skarn archive tower under a 12-pleat tuff gumbat, preserving 300-year cousin pedigrees, duel charters, and liturgical codices.',
 build(){
  const w0=8.4,d0=7.8,y0=.34,h0=4.2;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.18,h:2.2,door:true},{x:-2.3,w:.78,y:1.05,h:1.35},{x:2.3,w:.78,y:1.05,h:1.35}],
   left:[{x:0,w:.82,y:1.05,h:1.35}],right:[{x:0,w:.82,y:1.05,h:1.35}]
  });
  dvExtStair(0,d0/2+.95,0,y0,PI,1.35,.95);
  dvRoofTerrace(0,0,w0+.14,d0+.14,y0+h0,{});
  dvGumbat(0,0,1.85,y0+h0,2.35,3.05,{mk:'tuffPolished',col:P('tuffCrimson'),windows:4});
  dvJadeCross(0,y0+3.35,d0/2+.008,0,.58);
  dvFurn([
   ['dv_rug_kilim',0,y0,0,0],
   ['dv_scriptorium_lectern',-2.3,y0,-2.1,0],
   ['dv_scriptorium_lectern',2.3,y0,-2.1,0],
   ['dv_carved_chair',-2.3,y0,-1.1,PI],
   ['dv_carved_chair',2.3,y0,-1.1,PI],
   ['dv_shelves_provisions',-3.2,y0,.8,PI/2],
   ['dv_brazier_copper',0,y0+.052,1.6,0]
  ]);
 }});

/* 17. Nephrite Gorge-Pass Khachkar Way-Shrine */
defBuilding({key:'dv-shrine-cross',name:'Khachkar-Dzagh Nephrite Cross Way-Shrine',seed:7208,cls:'building',w:8.4,d:8.4,h:11.6,cut:true,
 tags:{types:['religious','statue'],wealth:'middle',style:'aul',role:'way-shrine',job:'worship'},
 note:'Four-pier golden-skarn & apricot-tuff baldachin crowned by a 12-pleat verdigris copper gumbat sheltering a carved emerald nephrite khachkar cross-stele.',
 build(){
  const w0=5.6,y0=.36,hP=3.45;
  dvRootSkirt(0,0,w0,w0,4.8,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,w0-.08,y0,'flagstone',P('flagstone'));
  dvExtStair(0,w0/2+.95,0,y0,PI,1.4,.95);
  door(0,y0,w0/2-.2,0,1.8,2.8);
  svNoWalk(()=>{
   for(const sx of [-2.1,2.1])for(const sz of [-2.1,2.1]){
    box('basalt',sx,y0+.005,sz,.62,.48,.62,P('basalt'));
    box('tuffPolished',sx,y0+.49,sz,.52,hP-.5,.52,P('tuff'));
   }
   box('skarn',0,y0+hP,0,w0-.2,.42,w0-.2,P('skarn'));
  });
  dvGumbat(0,0,1.65,y0+hP+.42,1.85,2.45,{mk:'verdigris',windows:4});
  dvFurn([
   ['dv_sanctuary_altar',0,y0,-.55,0],
   ['dv_brazier_copper',-1.45,y0,1.15,0],
   ['dv_brazier_copper',1.45,y0,1.15,0],
   ['dv_qvevri_rack',0,y0,-1.95,0]
  ]);
 }});

/* 18. Apricot-Balm & Duel-Surgeon Infirmary */
defBuilding({key:'dv-healer-apricot',name:'Mkurnal-Sakli Duel-Surgeon & Apricot-Balm Infirmary',seed:7209,cls:'building',w:11.6,d:10.4,h:10.4,cut:true,
 tags:{types:['civic'],wealth:'middle',style:'aul',role:'infirmary',job:'healing'},
 note:'Calm sunlit ablaq clinic tending cousin-champions sword cuts after sky-bridge duels with apricot-kernel salves, mountain herbs, and sulfur poultices.',
 build(){
  const w0=8.6,d0=7.4,y0=.3,h0=3.65;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.22,h:2.18,door:true},{x:-2.4,w:.86,y:.9,h:1.2},{x:2.4,w:.86,y:.9,h:1.2}],
   left:[{x:0,w:.82,y:.95,h:1.15}],right:[{x:0,w:.82,y:.95,h:1.15}]
  });
  dvExtStair(0,d0/2+.9,0,y0,PI,1.35,.9);
  dvGableRoof(0,0,w0,d0,y0+h0,1.8,{mk:'slate'});
  dvFurn([
   ['dv_poor_pallet',-2.6,y0,-1.8,0],
   ['dv_poor_pallet',2.6,y0,-1.8,0],
   ['dv_common_table',0,y0,-.4,0],
   ['dv_shelves_provisions',-3.3,y0,1.6,PI/2],
   ['dv_brazier_copper',2.8,y0,1.8,0]
  ]);
 }});

/* ---- ARCHAIC GORGE DEFENCE (6) ---- */
/* 19. Ablaq Gorge Curtain-Wall & Mashikul Walk */
defBuilding({key:'dv-wall-curtain',name:'Dzagh-Kedeli Ablaq Gorge Curtain-Wall',seed:7210,cls:'building',w:12.4,d:4.2,h:8.4,cut:false,
 front:{x:0,z:1.8,yaw:0},
 tags:{types:['military','infrastructure'],wealth:'middle',style:'aul',role:'curtain wall'},
 note:'Battered basalt & apricot-tuff crenellated gorge wall with mashikul machicolation boxes and nephrite cross-inlay (built against cavalry & cousin raids, never cannon).',
 build(){
  const w=11.2,d=2.4,h=5.6;
  dvRootSkirt(0,0,w,d,5.4,{mk:'colBasalt',plinthH:.38});
  dvAblaqBox(0,0,w,d,0,h,{frieze:true});
  dvFloorRect(0,0,w-.2,d-.2,h,'flagstone',P('flagstone'));
  dvExtStair(-3.4,-d/2-.65,0,h,PI/2,1.05,6.0);
  wkPad(2.8,-d/2-.35,1.25,1.15,h);
  svNoWalk(()=>{
   for(let i=-4;i<=4;i+=2){
    box('tuff',i*1.12,h+.006,d/2-.18,1.05,1.05,.34,P('tuff'));
   }
  });
  dvMashikul(-2.8,h-.85,d/2+.01,0,.95);
  dvMashikul(2.8,h-.85,d/2+.01,0,.95);
  dvJadeCross(0,h*.62,d/2+.01,0,.64);
 }});

/* 20. Chasm Flume-Tunnel & Twin-Needle Gatehouse (`dv-gate-flume`) */
defBuilding({key:'dv-gate-flume',name:'Flumi-Kari Chasm Flume-Tunnel & Twin-Needle Gatehouse',seed:7211,cls:'building',w:15.6,d:10.6,h:18.2,cut:true,
 front:{x:-1.5,z:3.2,yaw:0},
 tags:{types:['military','infrastructure'],wealth:'rich',style:'aul',role:'flume-tunnel gatehouse'},
 note:'Fortified polychrome ablaq valley gatehouse flanked by twin 5:1 dark-slate & basalt needle-towers, combining a road portal with a vaulted timber log-flume culvert.',
 build(){
  /* central gatehouse block with road passage at x = -1.5 and log-flume culvert at x = +1.8 */
  const wC=6.6,dC=5.8,y0=.22,hC=6.2;
  dvRootSkirt(0,0,wC,dC,6.0,{mk:'colBasalt',plinthH:.38});
  dvFloorRect(-1.5,0,2.4,dC-.1,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,wC,dC,y0,hC,{
   front:[{x:-1.45,w:1.85,h:2.85,door:true},{x:1.65,w:1.65,y:.35,h:1.95,door:true,open:true,leaf:false}],
   back:[{x:-1.45,w:1.85,h:2.85,door:true,open:true,leaf:false},{x:1.65,w:1.65,y:.35,h:1.95,door:true,open:true,leaf:false}]
  });
  dvJadeCross(0,y0+4.85,dC/2+.01,0,.68);
  /* timber V-flume & 10 m red-cypress log shooting right through the east culvert tunnel! */
  dvLogFlumeSeg([1.65,.78,-4.6],[1.65,.52,4.6],1.18,{log:true,logR:.22,bents:false});

  /* upper guard-chamber over the gatehouse */
  const yU=y0+3.35;
  dvFloorRect(0,0,wC-.76,dC-.76,yU,'floor',P('floor'));
  svStair(-2.1,-1.8,y0,yU,0,{style:'ladder',w:.76,mk:'cypress',col:P('cypress')});
  dvRoofTerrace(0,0,wC+.14,dC+.14,y0+hC,{footY:yU});
  /* twin flanking 5:1 dark-slate, basalt & crimson-tuff needle-towers */
  dvNeedleTower(-5.25,0,2.75,0,13.4,{rootD:6.2,doorYaw:0,pulley:true,pulleyYaw:-PI/2});
  dvNeedleTower(5.25,0,2.75,0,13.4,{rootD:6.2,doorYaw:0});
  dvBanner(-1.8,y0+hC,dC/2-.2,0,2.7,P('crimson'));
  dvBanner(1.8,y0+hC,dC/2-.2,0,2.7,P('saffron'));
  dvFurn([
   ['dv_rack_buckler_sword',-2.1,yU,-1.9,0],
   ['dv_armour_stand_scale',2.1,yU,-1.9,-.3],
   ['dv_common_table',0,yU,.2,0],
   ['dv_brazier_copper',-1.8,yU,1.6,0]
  ]);
 }});

/* 21. Clustered 5:1 Slate-Crowned Vovnashki Watch-Towers */
defBuilding({key:'dv-tower-vovnashki',name:'Vovnashki-Dzagh Clustered 5:1 Slate Watch-Towers',seed:7212,cls:'building',w:11.6,d:9.4,h:18.6,cut:true,
 front:{x:.1,z:3.8,yaw:0},
 tags:{types:['military'],wealth:'middle',style:'aul',role:'watch-tower',job:'customs'},
 note:'Paired Ingush-style razor-slender 5:1 battered stone needle-towers crowned with stepped dark mountain-slate & crimson-tuff roofs, joined by a high timber sky-plank and aerial gorge pulley-basket.',
 build(){
  dvNeedleTower(-2.35,0,2.85,0,14.2,{rootD:6.4,doorYaw:-PI/2,pulley:true,pulleyYaw:-PI/2,pulleyDrop:4.0});
  dvNeedleTower(2.55,-.35,2.55,0,12.4,{rootD:6.2,doorYaw:PI/2});
  /* base guard-chamber linking the two towers */
  dvRootSkirt(.1,1.65,4.2,3.4,5.4,{mk:'colBasalt',plinthH:.34});
  dvFloorRect(.1,1.65,4.0,3.2,.24,'flagstone',P('flagstone'));
  dvAblaqBox(.1,1.65,4.2,3.4,.24,2.85,{front:[{x:0,w:1.02,h:2.0,door:true}]});
  dvExtStair(.1,4.85,-1.1,.24,PI,1.15,1.5);
  dvRoofTerrace(.1,1.65,4.3,3.5,3.09,{});
  /* high timber sky-plank between towers at y = 9.4 m */
  dvNoCut(()=>svNoWalk(()=>{
   beam('cypress',[-1.1,9.38,-.15],[1.35,9.38,-.15],.14,P('cypress'));
   beam('planks',[-1.02,9.52,-.15],[1.27,9.52,-.15],.58,P('planks'),false,undefined,.06);
   beam('cypress',[-1.06,10.28,.12],[1.31,10.28,.12],.055,P('cypress'));
  }));
  dvFurn([
   ['dv_rack_buckler_sword',.1,0.24,.45,0],
   ['dv_armour_stand_scale',-1.25,0.24,1.65,PI/2],
   ['dv_brazier_copper',1.25,0.24,1.85,0],
   ['dv_pulley_basket',.1,3.096,1.65,0]
  ]);
 }});

/* 22. Royal Cousins' Scale-Hauberk Retinue Hall */
defBuilding({key:'dv-barracks-retinue',name:'Spaspet-Sakli Royal Cousins Scale-Hauberk Retinue Hall',seed:7213,cls:'building',w:14.8,d:11.6,h:15.8,cut:true,
 tags:{types:['military'],wealth:'middle',style:'aul',role:'retinue barracks'},
 note:'Garrison hall of a Valley-King six-to-ten cousin retinue, racked with 300-year heirloom tin-bronze & magnetite scale hauberks and nephrite bucklers.',
 build(){
  const w0=10.6,d0=8.2,cx0=-1.1,y0=.34,h0=3.85;
  dvRootSkirt(cx0,0,w0,d0,5.6,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(cx0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.35,h:2.28,door:true},{x:-3.0,w:.85,y:.95,h:1.2},{x:3.0,w:.85,y:.95,h:1.2}],
   left:[{x:0,w:.85,y:.95,h:1.2}],back:[{x:0,w:.88,y:.95,h:1.2}]
  });
  dvExtStair(cx0,d0/2+.95,0,y0,PI,1.45,.95);
  dvRoofTerrace(cx0,0,w0+.14,d0+.14,y0+h0,{});
  dvNeedleTower(5.15,-1.6,2.55,0,11.8,{rootD:6.0,doorYaw:0});
  dvBanner(cx0-3.2,y0+h0,d0/2-.2,0,2.6,P('crimson'));
  dvFurn([
   ['dv_armour_stand_scale',cx0-3.6,y0,-2.6,.2],
   ['dv_armour_stand_scale',cx0-1.2,y0,-2.6,0],
   ['dv_armour_stand_scale',cx0+1.2,y0,-2.6,0],
   ['dv_rack_buckler_sword',cx0+3.5,y0,-2.7,0],
   ['dv_feast_table_brandy',cx0,y0,.75,0],
   ['dv_poor_pallet',cx0-3.8,y0,1.9,PI/2],
   ['dv_brazier_copper',cx0+3.4,y0,2.1,0]
  ]);
 }});

/* 23. Crag Signal-Brazier & Slate Watch-Pinnacle */
defBuilding({key:'dv-beacon-gorge',name:'Tsikhe-Shukura Crag Signal-Brazier & Watch-Pinnacle',seed:7214,cls:'building',w:8.8,d:8.8,h:16.8,cut:true,
 tags:{types:['infrastructure','military'],wealth:'middle',style:'aul',role:'signal beacon'},
 note:'5:1 dark-slate & basalt signal needle and keepers lodge lighting copper pitch-cressets along the misty Crookwash canyon bends.',
 build(){
  dvRootSkirt(0,.8,5.8,5.4,5.6,{mk:'colBasalt',plinthH:.36});
  dvFloorRect(0,.8,5.6,5.2,.26,'flagstone',P('flagstone'));
  dvAblaqBox(0,.8,5.8,5.4,.26,3.2,{front:[{x:0,w:1.05,h:2.05,door:true}]});
  dvRoofTerrace(0,.8,5.9,5.5,3.46,{});
  dvNeedleTower(0,-2.2,2.6,0,12.2,{rootD:6.0});
  /* blazing copper gorge signal-cresset on front roof-terrace */
  dvNoCut(()=>svNoWalk(()=>{
   cyl('bronze',1.8,3.466,2.1,.48,.65,P('bronze'),10);
   sph('glow',1.8,4.22,2.1,.34,0xff9e38,1,8);
  }));
  haloAt(1.8,4.35,2.1,0xffa63c,false);
  smokeAt(1.8,4.65,2.1);
  dvFurn([
   ['dv_poor_pallet',-1.6,.26,-.6,0],
   ['dv_brazier_copper',1.4,.26,1.2,0],
   ['dv_chest_jade_inlay',1.5,.26,-.8,0],
   ['dv_shelves_provisions',-1.8,.26,1.8,PI/2]
  ]);
 }});

/* 24. Gorge Cable-Ferry & Ropeway Winch-Quay */
defBuilding({key:'dv-ferry-ropeway',name:'Borani-Kari Gorge Cable-Ferry & Ropeway Winch-Quay',seed:7215,cls:'building',w:11.6,d:11.8,h:10.8,cut:true,
 tags:{types:['infrastructure'],wealth:'middle',style:'aul',role:'cable-ferry quay',job:'trading'},
 note:'Cliffside river landing and capstan winch-house hauling both a torrent cable-ferry and overhead gorge supply baskets.',
 build(){
  const w0=8.2,d0=6.4,cz0=1.2,y0=.28,h0=3.55;
  dvRootSkirt(0,cz0,w0,d0,5.6,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,cz0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,cz0,w0,d0,y0,h0,{
   front:[{x:0,w:1.25,h:2.18,door:true},{x:-2.4,w:.8,y:.95,h:1.15}],
   back:[{x:0,w:1.35,h:2.18,door:true,open:true,leaf:false}]
  });
  dvRoofTerrace(0,cz0,w0+.14,d0+.14,y0+h0,{});
  dvPulleyRig(0,y0+h0-.2,-2.0,PI,2.2,2.6,{cableTo:[0,-1.2,-5.4]});
  /* timber ferry landing stage jutting north (-z) over the Crookwash river */
  dvNoCut(()=>{
   dvFloorRect(0,-3.55,4.2,3.1,.18,'planks',P('planks'));
   svNoWalk(()=>{
    for(const sx of [-1.75,1.75])for(const sz of [-2.4,-4.7])cyl('cypress',sx,-3.6,sz,.14,3.7,P('cypress'),8);
   });
  });
  dvFurn([
   ['dv_pulley_basket',-2.4,y0,cz0+.6,0],
   ['dv_scale_weregild',2.2,y0,cz0+.4,-PI/2],
   ['dv_chest_jade_inlay',-2.5,y0,cz0-1.8,0],
   ['dv_brazier_copper',2.2,y0,cz0-1.6,0]
  ]);
 }});
