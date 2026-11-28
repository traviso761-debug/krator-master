// prefix: hy
// ================================================================= HAYRANT VASSAL DWELLINGS (PLAN.md §3 & §5, seeds 34001..34010)
// Ten stratified dwellings across Bench Poor ('bench'), Hybrid Town ('hybrid'), and Rich Vassal ('prefect'):
//   34001 hy_loess_yaodong        horizontal loess cliff-bank yaodong vault (never an open sunken pit), kaen-doki smoke-pot
//   34002 hy_larch_chise_poor     steamed fur-larch & century-puya cruck-rib chise lodge (inland sister of Hueru-Kuran whale-rib)
//   34003 hy_scarp_cellar_poor    half-dug basalt & loess winter scarp cellar with madder-plaid wind-flap lean-to
//   34004 hy_terrace_row_poor     three-flat loess & cast-block vassal workers terrace with shared interior walk & kaen-doki pots
//   34005 hy_bench_house_mid      two-storey basalt + white-lime Deco house (cornice 7.16 m, within 0.04 m of et_canal_house)
//   34006 hy_nuraghe_chise_mid    battered Sardinian nuraghe keep paired with a fur-larch cruck hearth-chise across a court
//   34007 hy_courtyard_loess_mid  walled hybrid forecourt in front of a limewashed loess vault with nephrite oculus & chimes
//   34008 hy_corner_turret_mid    two-storey corner trader shop & flat with bilingual sign, plaid awning & corner nuraghe tower
//   34009 hy_clan_lord_compound   Utari Clan-Lord walled compound: 3-ton nephrite gate, whalebone arch, Deco hall & heirloom chise
//   34010 hy_merchant_tower_rich  three-storey basalt-and-brick organ-pipe merchant house (cornice 11.82 m vs et_merchant_house 11.90 m)

/* 1. Bench Poor Horizontal Loess-Bank Yaodong Vault */
defBuilding({key:'hy_loess_yaodong',name:'Loess-Bank Yaodong Vault',seed:34001,cut:true,
 w:11.2,d:10.6,h:6.4,budget:65000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'bench'},
 note:'horizontal golden-buff loess cliff-bank vault with megabreccia socle, larch lintel, kaen-doki smoke-pot, garlic eaves & closed-eye mask',
 build(){
  const G=.34;
  pushM(TF(0,0,-.45));
  hyPlinth(9.0,7.2,G,{baseMk:'megabreccia',midMk:'basalt',topMk:'paving'});
  hyLoessVault(0,-.2,G,8.2,6.2,3.05,{frontMk:'loess',lintel:'larch',maskMk:'kaen',winLight:'nephrite'});
  hyFormlineTympanum(0,G+3.36,2.92,5.0,.62,0,{arch:true,backMk:'loess',tertiary:'nephrite'});
  hyInauCluster(-1.32,G+2.12,3.16,0,{scale:.72});
  hyInauCluster(1.32,G+2.12,3.16,0,{scale:.72});
  hyEavesBraid(0,G+2.85,3.22,0,5.2,{sag:.22});
  hyWindHanging(-3.4,G,3.45,.18,1.5,2.15,{mk:'plaid',panels:2});
  svNoWalk(()=>{
   /* Stacked split fur-larch winter firewood cord against east cheek */
   box('larch',3.6,G,3.25,1.1,.52,.62,P('larchD'));
   box('bark',3.6,G+.52,3.25,1.16,.08,.68,P('bark'));
  });
  hyFurnList([
   ['hayrant_irori_hearth',0,G,-.4,0],
   ['hayrant_yak_pelt_mat',-1.6,G,-.4,PI/2],
   ['hayrant_yak_pelt_mat',1.6,G,-.4,-PI/2],
   ['hayrant_inau_ancestor_shelf',-2.4,G,-2.6,0,1],
   ['hayrant_kaen_jar',2.7,G,-2.4,0,0],
   ['generic_sack',2.8,G,1.6,0]
  ]);
  hyTarget(0,G,.9,'yaodong-hall');
  popM();
  if(CURREC)CURREC.corniceH=G+3.05;
 }});

/* 2. Bench Poor Steamed Fur-Larch & Puya Cruck-Rib Chise Hut */
defBuilding({key:'hy_larch_chise_poor',name:'Fur-Larch Cruck-Rib Chise Hut',seed:34002,cut:true,
 w:11.4,d:11.6,h:7.2,budget:70000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'bench'},
 note:'megabreccia ring-wall under steamed fur-larch and century-puya cruck-ribs, gale-cobble threshold hood, kaen-doki crown & lead door mask',
 build(){
  hyChise(0,-.45,0,4.35,.66,2.22,2.52,{
   ribs:10,
   doors:[{yaw:0,w:1.3,h:2.04,lintel:'larch',maskMk:'lead'}],
   windows:[{yaw:1.45,w:.72,h:.76,y:.92,light:'nephrite'},{yaw:-1.45,w:.72,h:.76,y:.92,light:'nephrite'}]
  });
  hyGaleCobbleRoof(0,2.42,4.68,2.55,1.00,.48,0,{posts:true,postY0:.06,mk:'larch',overZ:.18});
  hyInauCluster(-1.26,1.88,5.08,0,{scale:.66});
  hyWindHanging(3.1,0,3.55,-.35,1.65,2.2,{mk:'plaid',panels:2});
  hyEavesBraid(-2.8,1.95,3.4,.35,1.8,{sag:.18});
  hyFurnList([
   ['hayrant_irori_hearth',0,.06,-.45,0],
   ['hayrant_larch_cruck_bed',-1.95,.06,-1.1,PI/2],
   ['hayrant_yak_pelt_mat',1.55,.06,-.3,-PI/2],
   ['hayrant_inau_ancestor_shelf',0,.06,-3.1,0,1],
   ['hayrant_kaen_jar',2.25,.06,1.2,0,0],
   ['eternian_poor_block_bench',-1.6,.06,1.4,PI]
  ]);
  hyTarget(0,.06,-.45,'chise-hearth');
  if(CURREC)CURREC.corniceH=2.34;
 }});

/* 3. Bench Poor Basalt Scarp Winter Cellar & Madder-Plaid Lean-To */
defBuilding({key:'hy_scarp_cellar_poor',name:'Basalt Scarp Winter Cellar',seed:34003,cut:true,
 w:11.2,d:10.4,h:6.2,budget:65000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'bench'},
 note:'battered basalt and loess winter cellar with gale-cobble threshold hood, lead ancestor mask, braided garlic eaves & plaid wind-shelter',
 build(){
  const G=.3;
  pushM(TF(-.85,0,-.4));
  hyPlinth(7.8,6.8,G,{stepX:0});
  hyLoessVault(0,-.15,G,7.0,5.6,2.85,{frontMk:'basalt',lintel:'larch',maskMk:'lead',relieving:false});
  hyGaleCobbleRoof(0,G+2.68,3.65,2.5,.96,.46,0,{posts:true,postY0:G,mk:'larch',overZ:.18});
  hyInauCluster(-1.22,G+1.95,4.05,0,{scale:.64});
  /* Side madder-plaid wind-rigged work shelter on +x, clear of vault wall */
  svNoWalk(()=>box('paving',5.15,0,.1,2.3,.12,4.4,P('paving')));
  wkPad(5.15,.1,2.3,4.4,.12);
  hyPlaidAwning(4.1,-1.9,6.2,2.1,.12,2.45,{mk:'plaid',sag:.22});
  hyFurnList([
   ['eternian_poor_hearth',-.9,G,-.5,0],
   ['hayrant_yak_pelt_mat',1.1,G,-.4,-PI/2],
   ['eternian_poor_mask_board',-2.4,G,-2.1,0],
   ['hayrant_kaen_jar',2.1,G,-2.0,0,0],
   ['generic_fuel',5.0,.12,-1.1,0],
   ['generic_storage_jar',5.2,.12,1.1,0]
  ]);
  hyTarget(0,G,.8,'cellar-room');
  popM();
  if(CURREC)CURREC.corniceH=G+2.85;
 }});

/* 4. Bench Poor Three-Flat Stepped Loess & Cast-Block Terrace Row */
defBuilding({key:'hy_terrace_row_poor',name:'Loess and Block Vassal Terrace Row',seed:34004,cut:true,
 w:16.6,d:10.8,h:7.4,budget:95000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'bench'},
 note:'three-door vassal workers row in golden loess and cast block with sleeping-eye formline tympanums, willow inau & twin kaen-doki smoke-pots',
 build(){
  const G=.36,W=14.4,D=6.6,H=3.25;
  pushM(TF(0,0,-.5));
  hyPlinth(W+.6,D+.8,G,{stepW:3.2,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'loess',socle:.64,socleMk:'megabreccia',
   holes:{
    s:[
     {at:2.4,y:0,w:1.55,h:2.65},{at:W/2,y:0,w:1.65,h:2.65},{at:W-2.4,y:0,w:1.55,h:2.65},
     {at:4.8,y:.95,w:.95,h:1.05},{at:W-4.8,y:.95,w:.95,h:1.05}
    ],
    n:[{at:3.6,y:1.0,w:.95,h:1.0},{at:W-3.6,y:1.0,w:.95,h:1.0}]
   }
  });
  /* Internal dwarf arch-piers dividing the 3 flats while leaving wide 1.8 m central passages */
  for(const px of [-2.4,2.4]){
   hyWall(px,-D/2+.35,px,D/2-.35,G,H,{mk:'block',socle:.3,holes:[{at:D/2-.35,y:0,w:1.85,h:2.35}]});
  }
  hyDoor(-W/2+2.4,G,D/2,0,1.18,2.04,{lintel:'larch',maskMk:'lead'});
  hyDoor(0,G,D/2,0,1.26,2.08,{lintel:'nephrite',maskMk:'kaen'});
  hyDoor(W/2-2.4,G,D/2,0,1.18,2.04,{lintel:'larch',maskMk:'lead'});
  for(const wx of [-W/2+4.8,W/2-4.8])hyWindow(wx,G+.95,D/2,0,.78,.86,{light:'nephrite'});
  for(const wx of [-W/2+3.6,W/2-3.6])hyWindow(wx,G+1.0,-D/2,PI,.76,.82,{light:'steel'});
  hyFormlineTympanum(-2.4,G+2.14,D/2+.24,2.4,.68,0,{arch:true,backMk:'loess',tertiary:'nephrite'});
  hyFormlineTympanum(2.4,G+2.14,D/2+.24,2.4,.68,0,{arch:true,backMk:'loess',tertiary:'nephrite'});
  hyInauCluster(-6.4,G+2.05,D/2+.26,0,{scale:.68});
  hyInauCluster(6.4,G+2.05,D/2+.26,0,{scale:.68});
  /* Stepped loess parapet & snow-shedding slate-grey tile hip with twin kaen-doki crowns */
  svNoWalk(()=>{
   box('lime',0,G+H+.23,0,W+.36,.24,D+.36,P('limeShade'));
   etHip(W+.2,D+.2,G+H+.47,1.85,{mk:'tile',ov:.45,ribs:.36,under:P('larchD'),cap:P('ashlar')});
   hyKaenCrown(-3.6,G+H+2.36,0,.32,.62,4,{celadon:false,smoke:true});
   hyKaenCrown(3.6,G+H+2.36,0,.32,.62,4,{celadon:false,smoke:true});
  });
  hyEavesBraid(0,G+2.95,D/2+.28,0,4.2,{sag:.2});
  hyFurnList([
   ['eternian_poor_hearth',-4.8,G,-1.6,0],
   ['hayrant_yak_pelt_mat',-4.8,G,.8,0],
   ['hayrant_irori_hearth',0,G,-.8,0],
   ['hayrant_inau_ancestor_shelf',0,G,-2.5,0,1],
   ['hayrant_larch_cruck_bed',-1.2,G,-1.8,0],
   ['eternian_poor_hearth',4.8,G,-1.6,0],
   ['hayrant_kaen_jar',5.6,G,1.4,0,0],
   ['eternian_poor_block_bench',3.8,G,1.2,PI]
  ]);
  hyTarget(-4.6,G,0,'flat-west');
  hyTarget(0,G,.6,'flat-mid');
  hyTarget(4.6,G,0,'flat-east');
  popM();
  if(CURREC)CURREC.corniceH=G+H+1.75;
 }});

/* 5. Hybrid Middle Stone-and-Lime Bench House (Mixed-Street Peer of et_canal_house: cornice 7.16 m vs 7.20 m) */
defBuilding({key:'hy_bench_house_mid',name:'Hybrid Basalt and Lime Bench House',seed:34005,cut:true,
 w:12.2,d:12.4,h:10.2,budget:110000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'hybrid'},
 note:'battered basalt ground storey with sawn Crookshore nephrite lintel, white-lime Deco upper floor, oculus crown & celadon kaen-doki chimney',
 build(){
  const G=.44,F1=3.84,E=7.16,W=9.4,D=8.2;
  pushM(TF(0,0,-.5));
  hyPlinth(W+.5,D+.5,G,{stepX:-2.1,stepW:2.4});
  /* Ground storey: battered dark basalt ashlar */
  hyWallRing(-W/2,-D/2,W/2,D/2,G,F1-G,{
   mk:'basalt',socle:.58,socleMk:'megabreccia',
   holes:{
    s:[{at:W/2-2.1,y:0,w:1.72,h:2.85},{at:W/2+2.1,y:.95,w:1.36,h:1.48}],
    n:[{at:2.4,y:1.0,w:1.2,h:1.35},{at:W-2.4,y:1.0,w:1.2,h:1.35}],
    e:[{at:D/2,y:1.0,w:1.2,h:1.35}],
    w:[{at:D/2,y:1.0,w:1.2,h:1.35}]
   }
  });
  hyDoor(-2.1,G,D/2,0,1.28,2.16,{lintel:'nephrite',maskMk:'bronze'});
  hyWindow(2.1,G+.95,D/2,0,1.12,1.24,{light:'nephrite',stepHead:true});
  hyWindow(-W/2+2.4,G+1.0,-D/2,PI,.98,1.12,{light:'steel'});
  hyWindow(W/2-2.4,G+1.0,-D/2,PI,.98,1.12,{light:'steel'});
  hyWindow(W/2,G+1.0,0,PI/2,.98,1.12,{light:'nephrite'});
  hyWindow(-W/2,G+1.0,0,-PI/2,.98,1.12,{light:'nephrite'});

  /* Interior stair up the west side from G to F1 & upper floor slab with stairwell opening */
  const SF=svStair(-3.4,2.4,G,F1,PI,{w:.96,mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD'),rail:'right'});
  svWell('planks',0,F1-.18,0,W-.68,.18,D-.68,P('planks'),SF);

  /* Upper storey: Eternian white limewash with Deco stepped window heads & nephrite string course */
  svNoWalk(()=>box('nephrite',0,F1-.06,0,W+.26,.14,D+.26,P('nephrite')));
  hyWallRing(-W/2,-D/2,W/2,D/2,F1+.08,E-(F1+.08),{
   mk:'lime',socle:0,postMk:'ashlar',
   holes:{
    s:[{at:W/2-2.1,y:.9,w:1.3,h:1.65},{at:W/2+2.1,y:.9,w:1.3,h:1.65}],
    n:[{at:W/2,y:.95,w:1.25,h:1.5}],
    e:[{at:D/2,y:.95,w:1.2,h:1.45}]
   }
  });
  for(const sx of [-2.1,2.1])hyWindow(sx,F1+.98,D/2,0,1.06,1.42,{light:'alabaster',stepHead:true});
  hyWindow(0,F1+1.03,-D/2,PI,1.0,1.28,{light:'nephrite',stepHead:true});
  hyWindow(W/2,F1+1.03,0,PI/2,.96,1.24,{light:'alabaster',stepHead:true});

  /* Cornice at E = 7.16 m + stepped Deco front crown with nephrite oculus & celadon-glazed kaen-doki crown */
  svNoWalk(()=>{
   box('lime',0,E+.23,0,W+.22,.2,D+.22,P('limeShade'));
   etParapet(W+.16,D+.16,E+.43,.84,{crown:true,crownX:-2.1,crownW:2.9,steps:3,col:P('lime'),cope:P('limeShade')});
   hyOculus(-2.1,E+1.62,D/2+.08,0,.4,{mk:'nephrite'});
   hyKaenCrown(2.4,E+.43,-1.6,.36,.74,4,{celadon:true,smoke:true});
  });
  hyWindHanging(3.2,G,D/2+.36,0,1.5,2.3,{mk:'plaid',panels:2});
  hyFurnList([
   ['hayrant_irori_hearth',1.4,G,-.6,0],
   ['hayrant_larch_feast_table',1.4,G,1.5,0],
   ['eternian_common_register_desk',-1.2,G,-2.8,0],
   ['hayrant_inau_ancestor_shelf',3.4,G,-2.9,0,0],
   ['hayrant_kaen_jar',3.6,G,2.4,0,1],
   ['hayrant_larch_cruck_bed',2.2,F1,-2.2,0],
   ['eternian_common_chest',-.4,F1,-2.9,0],
   ['eternian_common_bench',1.8,F1,2.4,PI]
  ]);
  hyTarget(1.2,G,.6,'ground-hall');
  hyTarget(1.6,F1,.4,'upper-parlour');
  popM();
  if(CURREC)CURREC.corniceH=E;
 }});

/* 6. Hybrid Middle Nuraghe Keep & Cruck-Rib Chise Compound */
defBuilding({key:'hy_nuraghe_chise_mid',name:'Nuraghe Keep and Chise Hearth Compound',seed:34006,cut:true,
 w:16.2,d:13.4,h:10.8,budget:125000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'hybrid'},
 note:'Sardinian concave-battered basalt nuraghe tower under a celadon hex-hip paired with a fur-larch cruck hearth-chise across a paved court',
 build(){
  /* Shared forecourt paving pad at y = 0.06 connecting both doorways without touching wall courses */
  svNoWalk(()=>box('paving',0,0,2.8,11.4,.055,3.2,P('paving')));
  wkPad(0,2.8,11.4,3.2,.055);
  /* West Sardinian nuraghe storage & sleeping tower */
  hyNuraghe(-4.1,-.7,0,3.15,2.42,5.9,{
   celadonCap:true,capH:2.25,smoke:false,
   doors:[{yaw:0,w:1.24,h:2.1,lintel:'nephrite',maskMk:'bronze'}],
   windows:[{yaw:.9,w:.68,h:.92,y:2.8,light:'alabaster'},{yaw:-.9,w:.68,h:.92,y:2.8,light:'nephrite'}]
  });
  /* East fur-larch & puya cruck-rib family hearth chise with celadon-glazed kaen-doki crown */
  hyChise(3.8,-.5,0,3.45,.62,2.38,2.48,{
   celadonCrown:true,
   doors:[{yaw:0,w:1.28,h:2.08,lintel:'nephrite',maskMk:'kaen'}],
   windows:[{yaw:1.4,w:.74,h:.82,y:.95,light:'nephrite'}]
  });
   /* Covered larch & madder-plaid breezeway awning over the central court */
  hyPlaidAwning(-1.3,1.2,1.4,3.8,.055,2.65,{mk:'plaid',sag:.2});
  hyFormlineFrieze(0,2.74,3.92,2.7,.56,0,{backMk:'larch',tertiary:'celadon'});
  hySeismicChimes(0,2.58,3.85,0,1.4,1.05,5);
  hyFurnList([
   ['hayrant_larch_cruck_bed',-4.1,.06,-1.6,0],
   ['hayrant_formline_chest',-5.1,.06,-.2,PI/2,0],
   ['hayrant_inau_ancestor_shelf',-4.1,.06,-2.4,0,0],
   ['hayrant_irori_hearth',3.8,.06,-.5,0],
   ['hayrant_larch_feast_table',3.8,.06,1.1,0],
   ['hayrant_yak_pelt_mat',2.3,.06,-.5,PI/2],
   ['hayrant_kaen_jar',5.2,.06,-1.6,0,1]
  ]);
  hyTarget(-4.1,.06,-.7,'nuraghe-keep');
  hyTarget(3.8,.06,-.5,'chise-hall');
  if(CURREC)CURREC.corniceH=7.04;
 }});

/* 7. Hybrid Middle Walled Forecourt & Limewashed Loess Vault */
defBuilding({key:'hy_courtyard_loess_mid',name:'Walled Forecourt and Loess Vault House',seed:34007,cut:true,
 w:15.6,d:14.6,h:8.8,budget:115000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'hybrid'},
 note:'walled basalt and cast-block forecourt with ovoid ancestor-collar nephrite gate, sleeping-eye friezes, chime rack & limewashed loess vault',
 build(){
  const G=.38;
  hyPlinth(12.8,11.4,G,{stepW:2.6,stepX:0});
  /* Rear limewashed loess-bank vault hall */
  hyLoessVault(0,-2.4,G,10.8,5.6,3.45,{
   frontMk:'lime',lintel:'nephrite',maskMk:'bronze',celadonCrown:true,stepHead:true,oculus:true,winLight:'alabaster'
  });
  /* Forecourt enclosing walls on south, east & west (skipping north where vault stands clear) */
  hyWallRing(-5.8,.8,5.8,5.3,G,2.35,{
   mk:'block',socle:.48,socleMk:'basalt',skip:'n',
   holes:{s:[{at:5.8,y:0,w:2.05,h:2.35}]}
  });
  hyDoor(0,G,5.3,0,1.56,2.18,{lintel:'nephrite',mask:false,relieving:false});
  hyOvoidPortal(0,G,5.63,2.14,2.42,0,{surroundOnly:true,headMk:'bronze'});
  hyFormlineFrieze(-3.6,G+1.35,5.55,2.6,.66,0,{backMk:'loess',tertiary:'celadon'});
  hyFormlineFrieze(3.6,G+1.35,5.55,2.6,.66,0,{backMk:'loess',tertiary:'celadon'});
  hyPlaidAwning(-4.8,1.4,-1.6,4.6,G,2.6,{mk:'hemp',sag:.22});
  hyFurnList([
   ['hayrant_seismic_chime_rack',3.6,G,2.8,PI],
   ['hayrant_jade_lantern_post',-3.6,G,4.2,0],
   ['hayrant_irori_hearth',0,G,-2.2,0],
   ['hayrant_larch_feast_table',-2.8,G,-2.0,PI/2],
   ['hayrant_larch_cruck_bed',3.2,G,-2.6,-PI/2],
   ['hayrant_formline_chest',3.2,G,-.7,PI,1],
   ['hayrant_inau_ancestor_shelf',0,G,-4.4,0,0],
   ['hayrant_kaen_jar',-4.2,G,-4.0,0,1]
  ]);
  hyTarget(0,G,2.8,'forecourt');
  hyTarget(0,G,-2.2,'vault-hall');
  if(CURREC)CURREC.corniceH=6.98;
 }});

/* 8. Hybrid Middle Two-Storey Corner Turret Shop & Flat */
defBuilding({key:'hy_corner_turret_mid',name:'Corner Nuraghe Turret Shop and Flat',seed:34008,cut:true,
 w:15.2,d:13.6,h:11.6,budget:130000,
 tags:{types:['dwelling-multi','shop'],wealth:'middle',style:'hybrid',job:'trading'},
 note:'two-storey basalt shop and white-lime upper flat with bilingual Eternian-Hayrant sign, plaid awning and corner nuraghe tower',
 build(){
  const G=.44,F1=3.88,E=7.24,BW=8.2,BD=8.4;
  /* West two-storey shop & upper flat on plinth */
  W(-2.3,0,-.4,0,()=>{
   hyPlinth(BW+.4,BD+.4,G,{stepX:-1.5,stepW:2.4});
   hyWallRing(-BW/2,-BD/2,BW/2,BD/2,G,F1-G,{
    mk:'basalt',socle:.55,socleMk:'megabreccia',
    holes:{
     s:[{at:BW/2-1.5,y:0,w:1.72,h:2.85},{at:BW/2+1.8,y:.85,w:1.65,h:1.55}],
     n:[{at:BW/2,y:1.0,w:1.2,h:1.3}],
     w:[{at:BD/2,y:1.0,w:1.2,h:1.3}]
    }
   });
   hyDoor(-1.5,G,BD/2,0,1.3,2.16,{lintel:'nephrite',maskMk:'bronze'});
   hyWindow(1.8,G+.85,BD/2,0,1.4,1.32,{light:'steel',stepHead:true});
   hyWindow(0,G+1.0,-BD/2,PI,.96,1.1,{light:'steel'});
   hyWindow(-BW/2,G+1.0,0,-PI/2,.96,1.1,{light:'nephrite'});
   hyBilingualSign(.2,G+2.3,BD/2+.36,0,1.45,.86);
   hyPlaidAwning(.4,BD/2+.38,3.6,BD/2+1.85,0,G+2.42,{mk:'plaid',sag:.18});

   const SF=svStair(-2.8,2.3,G,F1,PI,{w:.92,mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD'),rail:'right'});
   svWell('planks',0,F1-.18,0,BW-.64,.18,BD-.64,P('planks'),SF);
   svNoWalk(()=>box('nephrite',0,F1-.06,0,BW+.22,.13,BD+.22,P('nephrite')));
   hyWallRing(-BW/2,-BD/2,BW/2,BD/2,F1+.07,E-(F1+.07),{
    mk:'lime',socle:0,postMk:'ashlar',
    holes:{
     s:[{at:BW/2-1.6,y:.88,w:1.25,h:1.55},{at:BW/2+1.8,y:.88,w:1.25,h:1.55}],
     n:[{at:BW/2,y:.95,w:1.15,h:1.4}]
    }
   });
   for(const sx of [-1.6,1.8])hyWindow(sx,F1+.95,BD/2,0,1.02,1.34,{light:'alabaster',stepHead:true});
   hyWindow(0,F1+1.02,-BD/2,PI,.94,1.2,{light:'nephrite',stepHead:true});
   hyRoofHip(0,E+.24,0,BW+.16,BD+.16,2.55,{mk:'celadon',smoke:true});
   hyFurnList([
    ['pa_shop_counter',1.4,G,1.8,PI],
    ['eternian_common_weighing_scale',1.4,G,-2.6,0],
    ['hayrant_kaen_jar',3.1,G,-2.8,0,1],
    ['generic_crate',3.0,G,.2,0],
    ['hayrant_larch_cruck_bed',1.8,F1,-2.2,0],
    ['hayrant_larch_feast_table',1.2,F1,1.4,0],
    ['hayrant_inau_ancestor_shelf',-2.4,F1,-3.1,0,0]
   ]);
   hyTarget(0,G,.4,'shop-floor');
   hyTarget(1.2,F1,.4,'upper-flat');
  });
  /* East attached corner Sardinian nuraghe turret (cleanly clear of main block x <= 2.0) */
  hyNuraghe(4.45,-.3,0,2.35,1.82,6.4,{
   celadonCap:true,capH:2.05,smoke:false,
   doors:[{yaw:0,w:1.08,h:2.02,lintel:'nephrite',maskMk:'bronze'}],
   windows:[{yaw:.6,w:.62,h:.86,y:3.1,light:'alabaster'}]
  });
  hyFurnList([
   ['eternian_common_chest',4.45,.06,-1.1,0]
  ]);
  hyTarget(4.45,.06,-.3,'turret-store');
  if(CURREC)CURREC.corniceH=E;
 }});

/* 9. Rich Utari Clan-Lord Walled Compound (Household Service, 3-ton Nephrite Gate & Whalebone Heirloom) */
defBuilding({key:'hy_clan_lord_compound',name:'Utari Clan-Lord Walled Compound',seed:34009,cut:true,
 w:25.6,d:22.0,h:14.2,budget:195000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'prefect'},
 note:'walled vassal clan compound: Sutar-Pira head-totem poles, cross-pass Leviathan whalebone arch, 3-ton nephrite gate, Deco hall & heirloom chise',
 build(){
  /* Paved courtyard deck at y = 0.08 */
  svNoWalk(()=>box('paving',0,0,0,22.8,.08,18.4,P('paving')));
  wkPad(0,0,22.8,18.4,.08);
  /* Perimeter basalt & pale-brick compound wall with twin-ancestor civic nephrite gate on +z */
  hyWallRing(-11.4,-9.2,11.4,9.2,.08,2.75,{
   mk:'brick',socle:.78,socleMk:'megabreccia',
   holes:{s:[{at:11.4,y:0,w:3.6,h:2.75}]}
  });
  hyDoor(0,.08,9.2,0,2.05,2.52,{lintel:'civic',ancestorMk:'silver'});
  /* Flanking syncretic Sutar-Pira Eternian-head totem poles on the outer gate apron */
  hyHeadTotemPole(-5.6,0,10.05,0,{h:5.8,heads:4,r:.28,materials:['gold','nephrite','celadon','tarwood'],crown:'eagle',seed:340091});
  hyHeadTotemPole(5.6,0,10.05,0,{h:5.8,heads:4,r:.28,materials:['silver','alabaster','bronze','kaen'],crown:'sundisc',seed:340092});
  /* Prized cross-pass Hueru-Kuran Leviathan whale-jawbone arch standing 1.1 m inside the gate */
  hyWhaleJawArch(0,.08,7.6,0,4.5,4.7);

  /* Main Prefect-style Hall across the north of the court (z = -4.5) */
  W(0,0,-4.5,0,()=>{
   const G=.56,HW=13.2,HD=6.6,HE=6.2;
   hyPlinth(HW+.5,HD+.5,G,{stepW:3.0,stepX:0});
   hyWallRing(-HW/2,-HD/2,HW/2,HD/2,G,HE-G,{
    mk:'brick',socle:1.35,socleMk:'basalt',postMk:'columnar',
    holes:{
     s:[{at:HW/2,y:0,w:2.2,h:3.35}],
     n:[{at:3.6,y:1.1,w:1.3,h:1.8},{at:HW-3.6,y:1.1,w:1.3,h:1.8}]
    }
   });
   hyDoor(0,G,HD/2,0,1.62,2.55,{lintel:'nephrite',maskMk:'gold',maskSize:.56});
   for(const sx of [-4.1,4.1])hyDualLancets(sx,G+1.05,HD/2+.24,0,3,.58,2.95,{step:.34,oculus:true,oculusR:.34});
   for(const sx of [-HW/2+3.6,HW/2-3.6])hyWindow(sx,G+1.1,-HD/2,PI,1.05,1.55,{light:'alabaster',stepHead:true});
   hySteppedPierFront(0,HE+.24,HD/2+.16,0,6.4,1.35,.38,5,{mk:'brick',centreMetal:'gold',sideMetal:'silver'});
   hyRoofHip(0,HE+.24,0,HW+.2,HD+.2,4.35,{mk:'celadon',smoke:true});
   hyFurnList([
    ['eternian_court_ancestor_niche',0,G,-2.3,0],
    ['eternian_court_alabaster_lamp',-2.2,G,-2.1,0],
    ['eternian_court_alabaster_lamp',2.2,G,-2.1,0],
    ['hayrant_head_totem_post',-5.4,G,-1.8,PI/2,0],
    ['hayrant_larch_feast_table',-3.4,G,.4,0],
    ['eternian_court_canopy_bed',4.2,G,-1.4,0],
    ['hayrant_formline_chest',4.2,G,.5,-PI/2,0],
    ['hayrant_seismic_chime_rack',4.8,G,1.8,PI]
   ]);
   hyTarget(0,G,.4,'clan-hall');
  });

  /* West Servants & Register Wing (household service trade) */
  W(-7.8,0,3.2,PI/2,()=>{
   const SG=.28,SW=6.2,SD=4.4,SH=2.85;
   hyPlinth(SW+.3,SD+.3,SG,{stepW:1.8,stepX:0});
   hyWallRing(-SW/2,-SD/2,SW/2,SD/2,SG,SH,{
    mk:'lime',socle:.52,socleMk:'basalt',
    holes:{s:[{at:SW/2,y:0,w:1.5,h:2.45},{at:1.4,y:.95,w:1.05,h:1.15}]}
   });
   hyDoor(0,SG,SD/2,0,1.12,2.04,{lintel:'nephrite',maskMk:'bronze'});
   hyWindow(-SW/2+1.4,SG+.95,SD/2,0,.84,.96,{light:'nephrite'});
   hyRoofHip(0,SG+SH+.24,0,SW+.15,SD+.15,1.75,{mk:'tile',kaenFinial:false});
   hyFurnList([
    ['eternian_common_register_desk',-1.6,SG,-1.1,0],
    ['hayrant_yak_pelt_mat',1.6,SG,-.9,0],
    ['eternian_poor_hearth',1.8,SG,.9,PI]
   ]);
   hyTarget(0,SG,.2,'servants-wing');
  });

  /* East Heirloom Whalebone-Rib Utari Council Chise */
  hyChise(6.8,3.1,.08,3.25,.58,2.25,2.35,{
   whaleHeirloom:true,celadonCrown:true,
   doors:[{yaw:-PI/2,w:1.24,h:2.05,lintel:'nephrite',maskMk:'silver'}],
   windows:[{yaw:0,w:.72,h:.8,y:.95,light:'alabaster'}]
  });
  hyFurnList([
   ['hayrant_irori_hearth',6.8,.14,3.1,0],
   ['hayrant_inau_ancestor_shelf',8.5,.14,3.1,-PI/2,0],
   ['hayrant_jade_lantern_post',-2.6,.08,5.2,0]
  ]);
  hyTarget(6.8,.14,3.1,'utari-chise');
  hyTarget(0,.08,4.2,'courtyard');
  if(CURREC)CURREC.corniceH=11.55;
 }});

/* 10. Rich Mirabilis Three-Storey Organ-Pipe Merchant Tower (Mixed-Street Peer of et_merchant_house: cornice 11.82 m vs 11.90 m) */
defBuilding({key:'hy_merchant_tower_rich',name:'Mirabilis Organ-Pipe Merchant Tower',seed:34010,cut:true,
 w:14.2,d:13.4,h:18.4,budget:160000,
 tags:{types:['dwelling-multi'],wealth:'rich',style:'prefect'},
 note:'three storeys: battered columnar basalt counting-house with twin-ancestor nephrite portal, pale-brick Deco-Gothic upper floors & celadon hip',
 build(){
  const G=.52,F1=4.32,F2=8.08,E=11.82,W=10.2,D=9.0;
  pushM(TF(0,0,-.45));
  hyPlinth(W+.6,D+.6,G,{stepW:2.8,stepX:0});
  /* Ground storey: battered dark basalt counting-house */
  hyWallRing(-W/2,-D/2,W/2,D/2,G,F1-G,{
   mk:'basalt',socle:.75,socleMk:'megabreccia',postMk:'columnar',
   holes:{
    s:[{at:W/2,y:0,w:2.65,h:3.35},{at:1.8,y:1.0,w:1.2,h:1.55},{at:W-1.8,y:1.0,w:1.2,h:1.55}],
    n:[{at:2.6,y:1.05,w:1.2,h:1.5},{at:W-2.6,y:1.05,w:1.2,h:1.5}],
    w:[{at:D/2,y:1.05,w:1.2,h:1.5}]
   }
  });
  hyDoor(0,G,D/2,0,1.54,2.48,{lintel:'civic',ancestorMk:'bronze'});
  for(const sx of [-W/2+1.8,W/2-1.8])hyWindow(sx,G+1.0,D/2,0,.96,1.32,{light:'nephrite',stepHead:true});
  for(const sx of [-W/2+2.6,W/2-2.6])hyWindow(sx,G+1.05,-D/2,PI,.96,1.28,{light:'steel'});
  hyWindow(-W/2,G+1.05,0,-PI/2,.96,1.28,{light:'alabaster'});

  /* Dog-leg timber staircase in NE corner [G, F1, F2] + upper floor slabs cut with svWell */
  const SC=svStairCase({x0:2.4,x1:W/2-.55,z0:-D/2+.55,z1:.85},[G,F1,F2],{
   w:.84,start:'+',mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD')
  });
  svWell('planks',0,F1-.18,0,W-.68,.18,D-.68,P('planks'),SC.wells[0]);
  svWell('planks',0,F2-.18,0,W-.68,.18,D-.68,P('planks'),SC.wells[1]);

  /* First & second storeys: Eternian pale brick with bundled alabaster + emerald-nephrite lancets */
  for(const fy of [F1,F2]){
   svNoWalk(()=>box('nephrite',0,fy-.05,0,W+.26,.12,D+.26,P('nephrite')));
   hyWallRing(-W/2,-D/2,W/2,D/2,fy+.07,(fy===F1?F2-.05:E)-(fy+.07),{
    mk:'brick',socle:0,postMk:'ashlar',
    holes:{
     n:[{at:2.4,y:.95,w:1.2,h:1.55}],
     w:[{at:D/2,y:.95,w:1.2,h:1.55}]
    }
   });
   for(const sx of [-3.1,3.1])hyDualLancets(sx,fy+.65,D/2+.24,0,3,.52,2.35,{step:.28,oculus:fy===F2,oculusR:.3});
   hyWindow(-W/2+2.4,fy+1.02,-D/2,PI,.96,1.32,{light:'alabaster',stepHead:true});
   hyWindow(-W/2,fy+1.02,0,-PI/2,.96,1.32,{light:'nephrite',stepHead:true});
  }
  /* Gold household head above the portal + Organ-pipe stepped Deco crown & steep celadon hip */
  hyAncestorHead(0,F1+.95,D/2+.3,0,.78,{mk:'gold',plinth:.22});
  hySteppedPierFront(0,E+.24,D/2+.16,0,5.2,1.15,.32,5,{mk:'brick',centreMetal:'gold',sideMetal:'bronze'});
  hyRoofHip(0,E+.24,0,W+.22,D+.22,4.75,{mk:'celadon',smoke:true});

  hyFurnList([
   ['eternian_common_register_desk',-2.8,G,-2.8,0],
   ['eternian_common_weighing_scale',-2.8,G,-.4,0],
   ['generic_strongbox',-3.8,G,-3.4,0],
   ['hayrant_kaen_jar',3.4,G,2.6,0,1],
   ['hayrant_larch_feast_table',-1.4,F1,.4,0],
   ['eternian_court_ancestor_niche',-2.2,F1,-3.4,0],
   ['eternian_court_alabaster_lamp',-3.8,F1,3.1,0],
   ['eternian_court_canopy_bed',-2.2,F2,-2.4,0],
   ['eternian_common_chest',.2,F2,-3.4,0],
   ['hayrant_seismic_chime_rack',-3.8,F2,.8,PI/2]
  ]);
  hyTarget(-1.2,G,.8,'counting-room');
  hyTarget(-1.2,F1,.8,'merchant-hall');
  hyTarget(-1.2,F2,.8,'bedchamber');
  popM();
  if(CURREC)CURREC.corniceH=E;
 }});
