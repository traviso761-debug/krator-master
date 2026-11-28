// prefix: hs
// ================================================================= HUSH-KIN DWELLINGS (PLAN.md §3, seeds 37001..37010)
// Ten stratified Silent-Vales dwellings covering the full 6/6 residential matrix (poor | middle | rich) x (single | multi):
//   37001 hs_slate_cot_poor        High-divide dry-laid granite & blue-slate cot w/ Handspeak sign-stoop (poor, single)
//   37002 hs_lake_croft_poor       Ribbon-lake fisher granite croft w/ open shore porch & net pennant line (poor, single)
//   37003 hs_terrace_pair_poor     Paired granite kin-cottages facing across a shared Handspeak stoop court (poor, multi)
//   37004 hs_sign_loggia_mid       Dressed ashlar artisan house w/ full-width 3-bay Handspeak sign-loggia (middle, single)
//   37005 hs_quartz_gabled_mid     Slate-gabled house crowned w/ a 6-stepped snow-white quartz turret spire (middle, single)
//   37006 hs_courtyard_sign_mid    L-plan courtyard sign-house w/ nephrite chime rack & open-palm stele (middle, single)
//   37007 hs_arcade_row_mid        Two-storey multi-family terraced row w/ ground & upper Handspeak galleries (middle, multi)
//   37008 hs_spire_villa_rich      Rich sanctuary villa w/ colonnaded sign-loggia & 5:1 quartz heliograph tower (rich, single)
//   37009 hs_lithophone_manor_rich Acoustic elder manor w/ pivot sanctuary door, quartz spire & bianzhong court (rich, single)
//   37010 hs_gallery_house_rich    Grand two-wing extended-kin house w/ twin white-quartz spires & double loggia (rich, multi)

/* 1. Poor High-Divide Slate & Granite Cot */
defBuilding({key:'hs_slate_cot_poor',name:'High-Divide Granite and Slate Cot',seed:37001,cut:true,
 w:10.4,d:11.6,h:6.6,budget:55000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'terrace'},
 note:'compact pale pegmatite-granite and blue-slate sanctuary cot with a sheltered front Handspeak sign-stoop and chest-height quartz reflector lamp',
 build(){
  const G=.34,W0=6.8,D0=6.6,H0=2.55;
  pushM(TF(0,0,-.55));
  hsPlinth(W0+.8,D0+2.2,G,{stepW:2.1});
  pushM(TF(0,0,-.8));
  hsBox(W0,D0,G,H0,{mk:'granite',socle:.34,holes:{
   s:[{x:0,y:0,w:1.18,h:2.1}],
   e:[{x:0,y:.86,w:.96,h:.92}],
   w:[{x:0,y:.86,w:.96,h:.92}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.06,2.04);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,.84,.82);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.84,.82);
  hsSlateRoof(W0,D0,G+H0,1.72,{gableMk:'granite'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-1.9,G,-1.6,0],
   ['generic_poor_straw_bed',1.85,G,-1.5,-PI/2],
   ['hush_tea_sign_table',0,G,.35,0],
   ['generic_chest',-2.1,G,1.5,PI/2],
   ['generic_storage_jar',2.15,G,1.55,0]
  ]);
  hsTarget(0,G,0,'cot-room');
  popM();
  /* Front open Handspeak sign-stoop */
  hsSignGallery(0,G,2.95,5.6,1.9,2.42,0,{deck:false,bays:2,openCenter:true});
  hsTarget(0,G,2.85,'sign-stoop');
  popM();
 }});

/* 2. Poor Ribbon-Lake Shorefisher Croft */
defBuilding({key:'hs_lake_croft_poor',name:'Ribbon-Lake Granite Shore Croft',seed:37002,cut:true,
 w:11.6,d:12.0,h:6.8,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'terrace'},
 note:'lakeside granite and coursed-slate fisher croft with wide open sign-porch, char-net drying line and white-quartz gable finial',
 build(){
  const G=.38,W0=7.4,D0=6.8,H0=2.6;
  pushM(TF(0,0,-.5));
  hsPlinth(W0+1.2,D0+2.4,G,{stepW:2.3});
  pushM(TF(-.3,0,-.85));
  hsBox(W0,D0,G,H0,{mk:'slateWall',socleMk:'granite',socle:.38,holes:{
   s:[{x:.4,y:0,w:1.2,h:2.12},{x:-1.9,y:.84,w:1.0,h:.94}],
   e:[{x:0,y:.86,w:1.0,h:.92}],
   n:[{x:0,y:.9,w:.92,h:.86}]
  }});
  hsDoor(.4,G,D0/2-HS.WALL/2,0,1.08,2.04);
  hsWindow(-1.9,G+.84,D0/2-HS.WALL/2,0,.88,.84);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,.88,.82);
  hsWindow(0,G+.9,-D0/2+HS.WALL/2,PI,.8,.76);
  hsSlateRoof(W0,D0,G+H0,1.82,{gableMk:'granite'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-2.2,G,-1.6,0],
   ['generic_poor_straw_bed',2.1,G,-1.7,-PI/2],
   ['generic_pantry_shelf',-2.4,G,1.2,PI/2],
   ['hush_handspeak_mirror_lamp',2.2,G,1.6,-.6],
   ['job_fish_tray',0,G,-.3,0],
   ['generic_basket',1.8,G,.4,0]
  ]);
  hsTarget(0,G,0,'croft-floor');
  popM();
  hsSignGallery(-.3,G,3.15,6.6,2.0,2.45,0,{deck:false,bays:2,openCenter:true});
  hsSpanPennants(3.8,-2.2,3.8,2.8,G+2.1,{mk:'netting'});
  popM();
 }});

/* 3. Poor Paired Kin Terrace Cottages (poor dwelling-multi) */
defBuilding({key:'hs_terrace_pair_poor',name:'Paired Handspeak Stoop Cottages',seed:37003,cut:true,
 w:16.8,d:12.2,h:7.0,budget:80000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'terrace'},
 note:'two poor granite-and-slate cottages flanking a shared open Handspeak stoop court so kin converse silently from doorway to doorway',
 build(){
  const G=.36;
  pushM(TF(0,0,-.5));
  hsPlinth(14.8,8.8,G,{stepW:2.8});
  for(const sx of [-4.2,4.2]){
   pushM(TF(sx,0,-.75));
   hsBox(5.4,6.4,G,2.58,{mk:'granite',socle:.34,holes:{
    s:[{x:sx<0?.6:-.6,y:0,w:1.16,h:2.08}],
    e:sx<0?[{x:0,y:.84,w:.96,h:.88}]:[{x:0,y:.84,w:.92,h:.86}],
    w:sx>0?[{x:0,y:.84,w:.96,h:.88}]:[{x:0,y:.84,w:.92,h:.86}]
   }});
   hsDoor(sx<0?.6:-.6,G,3.2-HS.WALL/2,0,1.04,2.02);
   hsWindow(2.7-HS.WALL/2,G+.84,0,PI/2,.82,.78);
   hsWindow(-2.7+HS.WALL/2,G+.84,0,-PI/2,.82,.78);
   hsSlateRoof(5.4,6.4,G+2.58,1.68,{gableMk:'ashlar'});
   hsFurnList([
    ['hush_quartz_brazier_stove',sx<0?-1.4:1.4,G,-1.6,0],
    ['generic_poor_straw_bed',sx<0?1.3:-1.3,G,-1.5,sx<0?-PI/2:PI/2],
    ['generic_chest',0,G,-2.2,0],
    ['generic_poor_log_seat',0,G,.3,0],
    ['generic_storage_jar',sx<0?-1.6:1.6,G,1.4,0]
   ]);
   hsTarget(0,G,0,sx<0?'west-cot':'east-cot');
   popM();
  }
  /* Shared central Handspeak sign-loggia linking both cottages */
  hsSignGallery(0,G,3.05,12.4,2.0,2.46,0,{deck:false,bays:4,openCenter:true});
  hsPalmMonolith(0,G,-3.2,2.35,0);
  hsTarget(0,G,2.8,'shared-stoop');
  popM();
 }});

/* 4. Middle Dressed-Ashlar Sign-Loggia House */
defBuilding({key:'hs_sign_loggia_mid',name:'Handspeak Sign-Loggia Artisan House',seed:37004,cut:true,
 w:13.2,d:13.2,h:8.2,budget:85000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'gallery'},
 note:'dressed pale-ashlar and blue-slate house fronted by a deep three-bay Handspeak sign-loggia illuminated at chest height by parabolic quartz lamps',
 build(){
  const G=.44,W0=9.6,D0=7.6,H0=3.05;
  pushM(TF(0,0,-.55));
  hsPlinth(W0+1.2,D0+2.8,G,{stepW:2.6});
  pushM(TF(0,0,-1.05));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.4,holes:{
   s:[{x:0,y:0,w:1.34,h:2.22},{x:-2.8,y:.84,w:1.14,h:1.12},{x:2.8,y:.84,w:1.14,h:1.12}],
   e:[{x:0,y:.86,w:1.12,h:1.08}],
   w:[{x:0,y:.86,w:1.12,h:1.08}],
   n:[{x:0,y:.9,w:1.1,h:1.02}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.2,2.14);
  hsWindow(-2.8,G+.84,D0/2-HS.WALL/2,0,1.0,1.0);
  hsWindow(2.8,G+.84,D0/2-HS.WALL/2,0,1.0,1.0);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,.98,.98);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.98,.98);
  hsWindow(0,G+.9,-D0/2+HS.WALL/2,PI,.96,.92);
  hsSlateRoof(W0,D0,G+H0,2.15,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',0,G,-.2,0],
   ['hush_quartz_brazier_stove',-3.2,G,-2.1,0],
   ['hush_nephrite_lithophone',3.1,G,-2.2,-.3],
   ['hush_crystal_reliquary_chest',-3.3,G,1.8,PI/2],
   ['hush_scroll_chronicle_rack',3.3,G,1.6,-PI/2],
   ['generic_poor_straw_bed',0,G,-2.6,0]
  ]);
  hsTarget(0,G,0,'hall');
  popM();
  hsSignGallery(0,G,3.6,9.4,2.3,2.68,0,{deck:false,bays:3,openCenter:true});
  hsTarget(0,G,3.4,'sign-loggia');
  popM();
 }});

/* 5. Middle White-Quartz Turret-Gabled House */
defBuilding({key:'hs_quartz_gabled_mid',name:'White-Quartz Turret-Gabled House',seed:37005,cut:true,
 w:13.4,d:13.0,h:12.6,budget:95000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'spire'},
 note:'middle sanctuary house pairing a dressed granite hall and Handspeak porch with a gleaming 6-stepped snow-white quartz corner spire',
 build(){
  const G=.42,W0=8.6,D0=8.0,H0=3.0;
  pushM(TF(0,0,-.5));
  hsPlinth(10.8,9.8,G,{stepW:2.5,stepX:-.8});
  pushM(TF(-.8,0,-.65));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'slateWall',socle:.38,holes:{
   s:[{x:0,y:0,w:1.28,h:2.18},{x:-2.4,y:.85,w:1.06,h:1.06}],
   w:[{x:0,y:.85,w:1.08,h:1.04}],
   n:[{x:0,y:.88,w:1.08,h:1.0}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.16,2.1);
  hsWindow(-2.4,G+.85,D0/2-HS.WALL/2,0,.94,.96);
  hsWindow(-W0/2+HS.WALL/2,G+.85,0,-PI/2,.96,.94);
  hsWindow(0,G+.88,-D0/2+HS.WALL/2,PI,.96,.9);
  hsSlateRoof(W0,D0,G+H0,2.05,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',-.4,G,-.2,0],
   ['hush_quartz_brazier_stove',-2.8,G,-2.2,0],
   ['hush_handspeak_mirror_lamp',2.6,G,2.1,-.5],
   ['hush_crystal_reliquary_chest',2.6,G,-2.3,-PI/2],
   ['generic_poor_straw_bed',-2.6,G,1.8,PI/2],
   ['generic_pantry_shelf',0,G,-2.9,0]
  ]);
  hsTarget(0,G,0,'main-hall');
  popM();
  /* Attached slender snow-white quartz spire tower on +x corner */
  hsQuartzSpireTower(3.95,-1.2,2.45,G,6.8,{steps:6,roofRise:2.85,heliograph:false});
  hsSignGallery(-.8,G,4.0,7.8,1.9,2.58,0,{deck:false,bays:3,openCenter:true});
  popM();
 }});

/* 6. Middle L-Plan Courtyard Sign House */
defBuilding({key:'hs_courtyard_sign_mid',name:'Courtyard Sightline Sign-House',seed:37006,cut:true,
 w:15.2,d:14.6,h:8.4,budget:105000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'gallery'},
 note:'L-plan pale-granite house framing a wind-sheltered paved Handspeak courtyard with nephrite lithophone rack and open-palm stele',
 build(){
  const G=.4;
  pushM(TF(0,0,-.5));
  hsPlinth(13.2,11.6,G,{stepW:2.6,stepX:2.2});
  /* North main wing */
  pushM(TF(0,0,-2.6));
  hsBox(11.8,5.4,G,2.95,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:1.8,y:0,w:1.3,h:2.16},{x:-2.4,y:.84,w:1.12,h:1.05}],
   n:[{x:0,y:.88,w:1.12,h:1.0}],
   e:[{x:0,y:.88,w:1.04,h:.98}]
  }});
  hsDoor(1.8,G,2.7-HS.WALL/2,0,1.18,2.08);
  hsWindow(-2.4,G+.84,2.7-HS.WALL/2,0,1.0,.96);
  hsWindow(0,G+.88,-2.7+HS.WALL/2,PI,1.0,.9);
  hsWindow(5.9-HS.WALL/2,G+.88,0,PI/2,.92,.88);
  hsSlateRoof(11.8,5.4,G+2.95,1.88,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',1.6,G,-.2,0],
   ['hush_quartz_brazier_stove',-4.2,G,-1.2,0],
   ['hush_scroll_chronicle_rack',4.4,G,-1.5,-PI/2],
   ['generic_poor_straw_bed',-4.1,G,1.1,PI/2],
   ['hush_crystal_reliquary_chest',-.8,G,-1.7,0]
  ]);
  hsTarget(1.5,G,0,'north-wing');
  popM();
  /* West studio wing */
  pushM(TF(-3.55,0,2.35));
  hsBox(4.7,4.5,G,2.72,{mk:'granite',socle:.36,holes:{
   e:[{x:0,y:0,w:1.18,h:2.08}],
   s:[{x:0,y:.84,w:1.04,h:.98}]
  }});
  hsDoor(2.35-HS.WALL/2,G,0,PI/2,1.06,2.0);
  hsWindow(0,G+.84,2.25-HS.WALL/2,0,.92,.88);
  hsSlateRoof(4.7,4.5,G+2.72,1.52,{gableMk:'granite'});
  hsFurnList([
   ['hush_nephrite_lithophone',-.8,G,0,PI/2],
   ['hush_primer_tablet_stand',.4,G,-1.1,0]
  ]);
  hsTarget(0,G,0,'west-wing');
  popM();
  /* Sunny Handspeak courtyard colonnade, harmonic rack & open-palm stele */
  hsSignGallery(2.2,G,.95,6.4,1.85,2.52,0,{deck:false,bays:2,openCenter:true});
  hsHarmonicRack(4.6,G,3.2,2.1,-PI/2,{chimes:4,h:2.18});
  hsPalmMonolith(-.2,G,4.6,2.45,0);
  hsTarget(2.2,G,3.0,'sign-court');
  popM();
 }});

/* 7. Middle Two-Storey Sightline Arcade Row (middle dwelling-multi) */
defBuilding({key:'hs_arcade_row_mid',name:'Two-Storey Handspeak Arcade Row',seed:37007,cut:true,
 w:18.2,d:14.2,h:11.2,budget:125000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'gallery'},
 note:'two-storey multi-family terraced sanctuary row with both ground and upper-level colonnaded Handspeak sign-galleries linked by exterior slate stairs',
 build(){
  const G=.42,W0=13.2,D0=7.2,H1=2.95,H2=2.75,Y2=G+H1;
  pushM(TF(0,0,-.6));
  hsPlinth(16.2,D0+4.4,G,{stepW:3.0});
  pushM(TF(.4,0,-1.4));
  /* Ground storey */
  hsBox(W0,D0,G,H1,{mk:'granite',socle:.38,holes:{
   s:[{x:-3.2,y:0,w:1.28,h:2.14},{x:3.2,y:0,w:1.28,h:2.14},{x:0,y:.85,w:1.2,h:1.05}],
   e:[{x:0,y:.85,w:1.1,h:1.0}],
   w:[{x:0,y:.85,w:1.1,h:1.0}]
  }});
  hsDoor(-3.2,G,D0/2-HS.WALL/2,0,1.14,2.06);
  hsDoor(3.2,G,D0/2-HS.WALL/2,0,1.14,2.06);
  hsWindow(0,G+.85,D0/2-HS.WALL/2,0,1.06,.96);
  hsWindow(W0/2-HS.WALL/2,G+.85,0,PI/2,.98,.92);
  hsWindow(-W0/2+HS.WALL/2,G+.85,0,-PI/2,.98,.92);
  /* Upper storey slab & walls */
  svNoWalk(()=>box('paving',0,Y2-.16,0,W0-.2,.16,D0-.2,P('paving')));
  wkPad(0,.2,W0-.8,D0-.6,Y2);
  hsBox(W0,D0,Y2,H2,{mk:'ashlar',socle:0,holes:{
   s:[{x:-3.2,y:0,w:1.28,h:2.1},{x:3.2,y:0,w:1.28,h:2.1},{x:0,y:.82,w:1.16,h:1.0}],
   n:[{x:-3.2,y:.82,w:1.08,h:.96},{x:3.2,y:.82,w:1.08,h:.96}]
  }});
  hsDoor(-3.2,Y2,D0/2-HS.WALL/2,0,1.12,2.0,{quartzCrown:false});
  hsDoor(3.2,Y2,D0/2-HS.WALL/2,0,1.12,2.0,{quartzCrown:false});
  hsWindow(0,Y2+.82,D0/2-HS.WALL/2,0,1.02,.9);
  hsWindow(-3.2,Y2+.82,-D0/2+HS.WALL/2,PI,.96,.88);
  hsWindow(3.2,Y2+.82,-D0/2+HS.WALL/2,PI,.96,.88);
  hsSlateRoof(W0,D0,Y2+H2,2.15,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',-3.2,G,-.3,0],
   ['hush_tea_sign_table',3.2,G,-.3,0],
   ['hush_quartz_brazier_stove',0,G,-2.1,0],
   ['generic_poor_straw_bed',-4.6,Y2,-1.6,PI/2],
   ['generic_poor_straw_bed',4.6,Y2,-1.6,-PI/2],
   ['hush_scroll_chronicle_rack',0,Y2,-2.3,0],
   ['hush_crystal_reliquary_chest',-1.8,Y2,1.6,0],
   ['hush_handspeak_mirror_lamp',1.8,Y2,1.6,0]
  ]);
  hsTarget(-3.2,G,0,'ground-west');
  hsTarget(3.2,G,0,'ground-east');
  hsTarget(-3.2,Y2,0,'upper-west');
  hsTarget(3.2,Y2,0,'upper-east');
  popM();
  /* Ground & upper projecting Handspeak sign-balconies + exterior walkable stair clear west of the house wall */
  hsSignGallery(.4,G,3.35,11.6,2.1,2.78,0,{deck:false,bays:4,openCenter:true,banner:false});
  svNoWalk(()=>{
   box('paving',-.4,Y2-.14,3.35,13.6,.14,2.3,P('paving'));
   box('paving',-7.15,Y2-.14,1.54,1.5,.14,1.28,P('paving'));
  });
  hsSignGallery(.4,Y2,3.35,11.6,2.1,2.52,0,{deck:false,bays:4,openCenter:false,walk:false});
  /* Exterior west flight at x = -7.15 (strictly west of house wall x = -6.2), gentle 37 deg climb onto Y2 */
  svStair(-7.15,5.3,G,Y2,PI,{w:1.05,run:3.8,style:'open',mk:'slate',col:P('slate'),rail:'left'});
  wkPad(-.8,2.9,14.6,3.2,Y2);
  hsTarget(.4,Y2,3.35,'upper-sign-gallery');
  popM();
 }});

/* 8. Rich White-Quartz Heliograph Spire Villa */
defBuilding({key:'hs_spire_villa_rich',name:'White-Quartz Heliograph Spire Villa',seed:37008,cut:true,
 w:17.2,d:15.4,h:17.6,budget:140000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'spire'},
 note:'rich Silent-Vales sanctuary villa uniting a dressed pale-ashlar hall, colonnaded Handspeak loggia and a 5.4:1 snow-white quartz optical heliograph spire',
 build(){
  const G=.48,W0=11.2,D0=8.6,H0=3.45;
  pushM(TF(0,0,-.55));
  hsPlinth(14.8,12.2,G,{stepW:3.0,stepX:-1.4});
  pushM(TF(-1.4,0,-1.1));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.44,holes:{
   s:[{x:0,y:0,w:1.48,h:2.38},{x:-3.3,y:.88,w:1.22,h:1.24},{x:3.3,y:.88,w:1.22,h:1.24}],
   w:[{x:0,y:.88,w:1.22,h:1.2}],
   n:[{x:-2.5,y:.9,w:1.18,h:1.14},{x:2.5,y:.9,w:1.18,h:1.14}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.34,2.28,{pivot:true});
  hsWindow(-3.3,G+.88,D0/2-HS.WALL/2,0,1.08,1.12);
  hsWindow(3.3,G+.88,D0/2-HS.WALL/2,0,1.08,1.12);
  hsWindow(-W0/2+HS.WALL/2,G+.88,0,-PI/2,1.08,1.08);
  hsWindow(-2.5,G+.9,-D0/2+HS.WALL/2,PI,1.04,1.02);
  hsWindow(2.5,G+.9,-D0/2+HS.WALL/2,PI,1.04,1.02);
  hsSlateRoof(W0,D0,G+H0,2.35,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',0,G,.2,0],
   ['hush_bianzhong_bell_rack',-3.6,G,-2.6,.2],
   ['hush_quartz_brazier_stove',3.6,G,-2.5,0],
   ['hush_scroll_chronicle_rack',-4.2,G,.8,PI/2],
   ['hush_crystal_reliquary_chest',4.1,G,1.4,-PI/2],
   ['hush_open_palm_stele',0,G,-3.1,0],
   ['hush_handspeak_mirror_lamp',-2.4,G,2.6,0]
  ]);
  hsTarget(0,G,0,'villa-hall');
  popM();
  /* 5.4:1 battered pale-granite & snow-white quartz heliograph spire tower on +x flank */
  hsQuartzSpireTower(5.3,-1.6,2.6,G,10.2,{steps:8,heliograph:true,doorYaw:0,targetName:'villa-spire'});
  hsSignGallery(-1.4,G,4.15,10.8,2.3,2.88,0,{deck:false,bays:4,openCenter:true});
  hsPalmMonolith(5.3,G,3.8,2.75,0);
  hsTarget(-1.4,G,4.0,'villa-loggia');
  popM();
 }});

/* 9. Rich Lithophone & Bianzhong Sanctuary Manor */
defBuilding({key:'hs_lithophone_manor_rich',name:'Lithophone and Bianzhong Sanctuary Manor',seed:37009,cut:true,
 w:18.2,d:15.8,h:15.4,budget:145000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'spire'},
 note:'acoustic sanctuary elder manor crowned by a stepped snow-white quartz roof lantern, balanced pivot portal and twin 440/660 Hz harmonic chime frames',
 build(){
  const G=.5,W0=13.2,D0=9.2,H0=3.6;
  pushM(TF(0,0,-.55));
  hsPlinth(15.8,12.8,G,{stepW:3.2});
  pushM(TF(0,0,-1.2));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.46,holes:{
   s:[{x:0,y:0,w:1.56,h:2.44},{x:-4.0,y:.9,w:1.28,h:1.26},{x:4.0,y:.9,w:1.28,h:1.26}],
   e:[{x:0,y:.9,w:1.24,h:1.22}],
   w:[{x:0,y:.9,w:1.24,h:1.22}],
   n:[{x:-3.2,y:.92,w:1.2,h:1.16},{x:3.2,y:.92,w:1.2,h:1.16}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.42,2.34,{pivot:true});
  hsWindow(-4.0,G+.9,D0/2-HS.WALL/2,0,1.14,1.14);
  hsWindow(4.0,G+.9,D0/2-HS.WALL/2,0,1.14,1.14);
  hsWindow(W0/2-HS.WALL/2,G+.9,0,PI/2,1.1,1.1);
  hsWindow(-W0/2+HS.WALL/2,G+.9,0,-PI/2,1.1,1.1);
  hsWindow(-3.2,G+.92,-D0/2+HS.WALL/2,PI,1.06,1.04);
  hsWindow(3.2,G+.92,-D0/2+HS.WALL/2,PI,1.06,1.04);
  const yHip=hsHipSlateRoof(W0,D0,G+H0,2.25);
  hsQuartzPyramid(0,0,3.2,yHip,3.8,7,{heliograph:true});
  hsFurnList([
   ['hush_bianzhong_bell_rack',-4.2,G,-2.8,.25],
   ['hush_nephrite_lithophone',4.2,G,-2.8,-.25],
   ['hush_tea_sign_table',0,G,.3,0],
   ['hush_quartz_brazier_stove',-4.6,G,1.6,PI/2],
   ['hush_scroll_chronicle_rack',4.8,G,1.4,-PI/2],
   ['hush_open_palm_stele',0,G,-3.3,0],
   ['hush_crystal_reliquary_chest',-2.2,G,-3.3,0],
   ['hush_primer_tablet_stand',2.2,G,2.4,PI]
  ]);
  hsTarget(0,G,0,'manor-hall');
  popM();
  hsSignGallery(0,G,4.45,12.4,2.4,2.95,0,{deck:false,bays:4,openCenter:true});
  hsHarmonicRack(-6.3,G,4.2,2.3,PI/4,{chimes:5});
  hsHarmonicRack(6.3,G,4.2,2.3,-PI/4,{chimes:5});
  hsTarget(0,G,4.3,'manor-gallery');
  popM();
 }});

/* 10. Rich Double-Wing Sightline Gallery House (rich dwelling-multi) */
defBuilding({key:'hs_gallery_house_rich',name:'Double-Wing Handspeak Gallery House',seed:37010,cut:true,
 w:20.4,d:15.6,h:14.8,budget:160000,
 tags:{types:['dwelling-multi'],wealth:'rich',style:'gallery'},
 note:'monumental multi-lineage Hush-Kin courtyard house flanking an unbroken Handspeak sightline court with twin snow-white quartz spires',
 build(){
  const G=.46;
  pushM(TF(0,0,-.5));
  hsPlinth(18.2,12.6,G,{stepW:3.4});
  /* Rear bridging hall */
  pushM(TF(0,0,-3.1));
  hsBox(16.4,5.4,G,3.35,{mk:'ashlar',socleMk:'granite',socle:.42,holes:{
   s:[{x:0,y:0,w:1.5,h:2.34},{x:-4.8,y:0,w:1.24,h:2.14},{x:4.8,y:0,w:1.24,h:2.14}],
   n:[{x:-3.8,y:.9,w:1.18,h:1.1},{x:3.8,y:.9,w:1.18,h:1.1}]
  }});
  hsDoor(0,G,2.7-HS.WALL/2,0,1.36,2.24,{pivot:true});
  hsDoor(-4.8,G,2.7-HS.WALL/2,0,1.12,2.06);
  hsDoor(4.8,G,2.7-HS.WALL/2,0,1.12,2.06);
  hsWindow(-3.8,G+.9,-2.7+HS.WALL/2,PI,1.04,1.0);
  hsWindow(3.8,G+.9,-2.7+HS.WALL/2,PI,1.04,1.0);
  hsSlateRoof(16.4,5.4,G+3.35,2.05,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_tea_sign_table',0,G,-.1,0],
   ['hush_bianzhong_bell_rack',-6.2,G,-1.4,.2],
   ['hush_nephrite_lithophone',6.2,G,-1.4,-.2],
   ['hush_quartz_brazier_stove',-2.8,G,-1.5,0],
   ['hush_scroll_chronicle_rack',2.8,G,-1.7,0],
   ['hush_crystal_reliquary_chest',-6.4,G,1.2,PI/2],
   ['hush_crystal_reliquary_chest',6.4,G,1.2,-PI/2]
  ]);
  hsTarget(0,G,0,'central-hall');
  popM();
  /* Twin flanking white-quartz spire pavilions framing the Handspeak court */
  for(const sx of [-6.8,6.8]){
   hsQuartzSpireTower(sx,2.8,2.55,G,7.6,{steps:7,heliograph:sx>0,doorYaw:sx<0?PI/2:-PI/2,targetName:sx<0?'west-spire':'east-spire'});
  }
  hsSignGallery(0,G,.75,10.6,2.1,2.82,0,{deck:false,bays:4,openCenter:true});
  hsPalmMonolith(0,G,4.6,2.8,0);
  hsHarmonicRack(-3.4,G,4.4,2.1,0,{chimes:4});
  hsTarget(0,G,2.8,'kin-sign-court');
  popM();
 }});
