// prefix: hy
// ================================================================= HIGHLAND FOOD, GRANARY, ESCARPMENT HOIST, MARKET & FARMS (seeds 34308..34322)
//   34308 hy_millet_bakehouse     Dustmillet, Redstem Buckwheat & Cave-Date Bakehouse
//   34309 hy_smokehouse_butcher   Larch-Smoke Nuraghe & Highland Butcher
//   34310 hy_buckwheat_brewery    Loess-Cellar Buckwheat Brewery & Spiced Tea House
//   34311 hy_pelt_tannery         Birch-Tar & Larch-Bark Yak-Pelt Tannery
//   34312 hy_granary_nuraghe      Tholos Basalt Granary-Nuraghe & Mountain Gristmill (live WATER.flow)
//   34313 hy_warehouse_vault      Cyclopean Bonded Pass-Freight Warehouse Vault
//   34314 hy_escarpment_hoist     Water-Ballast Escarpment Cliff Hoist (live WATER.still cistern + upper deck)
//   34315 hy_caravanserai_inn     Walled Pass-Road Yak & Mule Caravanserai Inn
//   34316 hy_hearth_tavern        Great Cruck-Rib Irori Hearth Tavern
//   34317 hy_market_hall          Hexagonal Dust-Sheltered Highland Market Hall
//   34318 hy_healer_bath          Spring-Fed Hot-Stone Soaking Bath & Goldroot Apothecary (live WATER.still pool)
//   34319 hy_terrace_farmstead    Contoured Loess Terrace & Frost-Trap Jujube Farmstead
//   34320 hy_fell_fold            Megabreccia Yak & Sheep Winter Byre and Cheese Cellar
//   34321 hy_mushroom_drift       Dark Loess Pale-Fungi & Moon-Cap Drift
//   34322 hy_trench_fishery       Sag-Pond Trench-Lake Basalt Fishery & Skiff Shed (live WATER.still basin)

/* 32. Dustmillet, Redstem Buckwheat & Cave-Date Bakehouse */
defBuilding({key:'hy_millet_bakehouse',name:'Dustmillet and Buckwheat Bakehouse',seed:34308,cut:true,
 w:14.6,d:12.8,h:9.6,budget:105000,
 tags:{types:['shop','industry'],wealth:'middle',style:'hybrid',job:'baking'},
 note:'hybrid basalt and white-lime bakery with domed kaen-terracotta beehive bread oven, plaid counter awning & bilingual signboard',
 build(){
  const G=.38,W=10.6,D=8.0,H=3.7;
  pushM(TF(0,0,-.45));
  hyPlinth(W+.6,D+.6,G,{stepW:2.6,stepX:-1.8});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'lime',socle:.68,socleMk:'basalt',
   holes:{
    s:[{at:W/2-1.8,y:0,w:1.8,h:2.65},{at:W/2+2.0,y:.9,w:1.6,h:1.45}],
    n:[{at:W/2,y:1.0,w:1.2,h:1.3}]
   }
  });
  hyDoor(-1.8,G,D/2,0,1.36,2.16,{lintel:'nephrite',maskMk:'kaen'});
  hyWindow(2.0,G+.9,D/2,0,1.36,1.22,{light:'alabaster',stepHead:true});
  hyWindow(0,G+1.0,-D/2,PI,.96,1.1,{light:'steel'});
  hyRoofHip(0,G+H+.24,0,W+.2,D+.2,2.45,{mk:'celadon',smoke:true});
  hyPlaidAwning(.2,D/2+.35,4.2,D/2+1.85,0,G+2.45,{mk:'plaid',sag:.18});
  hyBilingualSign(-3.6,G+2.3,D/2+.34,0,1.3,.78);
  /* Beehive bread oven dome inside NW corner */
  svNoWalk(()=>{
   cyl('basalt',-3.4,G,-2.2,1.25,.65,P('basalt'),14);
   lathe('kaen',-3.4,-2.2,[[1.18,G+.65],[.96,G+1.35],[.38,G+1.85]],14,P('kaen'));
   box('glow',-3.4,G+.78,-1.06,.42,.34,.08,new THREE.Color(0xff7a24));
  });

  hyFurnList([
   ['pa_shop_counter',1.8,G,1.8,PI],
   ['generic_bread_basket',1.8,G,2.6,0],
   ['generic_bread',2.6,G,1.8,0],
   ['generic_meal_ark',3.6,G,-2.6,0],
   ['eternian_common_stove',-.2,G,-2.8,0],
   ['generic_sack',-1.6,G,-2.9,0],
   ['hayrant_kaen_jar',3.8,G,-.2,0,0]
  ]);
  hyTarget(0,G,.8,'bakehouse-floor');
  popM();
 }});

/* 33. Larch-Smoke Nuraghe & Highland Butcher */
defBuilding({key:'hy_smokehouse_butcher',name:'Larch-Smoke Nuraghe and Highland Butcher',seed:34309,cut:true,
 w:15.8,d:13.2,h:10.6,budget:115000,
 tags:{types:['shop','industry'],wealth:'middle',style:'hybrid',job:'butchery'},
 note:'conical basalt-and-bark larch smokehouse nuraghe paired with a hybrid butcher shop hung with braided bench-garlic',
 build(){
  svNoWalk(()=>box('paving',0,0,2.6,11.6,.06,3.2,P('paving')));
  wkPad(0,2.6,11.6,3.2,.06);
  /* West conical smoking nuraghe with active larch-smoke kaen-doki flue */
  hyNuraghe(-4.1,-.6,0,2.75,1.95,5.8,{
   celadonCap:false,
   doors:[{yaw:0,w:1.16,h:2.04,lintel:'larch',maskMk:'kaen'}]
  });
  hyKaenCrown(-4.1,6.94,-.6,.44,.84,4,{celadon:false,smoke:true});

  /* East Butcher Shop */
  W(2.4,0,-.4,0,()=>{
   const G=.34,BW=7.6,BD=7.6,BH=3.55;
   hyPlinth(BW+.4,BD+.4,G,{stepW:2.2,stepX:-1.2});
   hyWallRing(-BW/2,-BD/2,BW/2,BD/2,G,BH,{
    mk:'lime',socle:.62,socleMk:'basalt',
    holes:{s:[{at:BW/2-1.2,y:0,w:1.7,h:2.55},{at:BW/2+1.6,y:.9,w:1.4,h:1.35}]}
   });
   hyDoor(-1.2,G,BD/2,0,1.28,2.1,{lintel:'nephrite',maskMk:'bronze'});
   hyWindow(1.6,G+.9,BD/2,0,1.16,1.14,{light:'nephrite',stepHead:true});
   hyRoofHip(0,G+BH+.24,0,BW+.2,BD+.2,2.25,{mk:'tile',smoke:false});
   hyEavesBraid(0,G+3.15,BD/2+.28,0,4.8,{sag:.22});
   hyFurnList([
    ['pa_shop_counter',1.2,G,1.6,PI],
    ['generic_cured_meat',-1.8,G,-2.2,0],
    ['generic_hanging_larder',1.8,G,-2.2,0],
    ['job_salt_tub',2.4,G,-.2,0],
    ['eternian_common_table',-.8,G,-.4,0]
   ]);
   hyTarget(-.6,G,.8,'butcher-shop');
  });
  hyFurnList([
   ['eternian_poor_hearth',-4.1,.06,-.6,0],
   ['hayrant_kaen_jar',-4.1,.06,-1.9,0,0]
  ]);
  hyTarget(-4.1,.06,-.6,'smoke-nuraghe');
 }});

/* 34. Loess-Cellar Buckwheat Brewery & Spiced Tea House */
defBuilding({key:'hy_buckwheat_brewery',name:'Loess-Cellar Buckwheat Brewery',seed:34310,cut:true,
 w:16.2,d:13.8,h:9.6,budget:115000,
 tags:{types:['industry','shop'],wealth:'middle',style:'hybrid',job:'brewing'},
 note:'warm loess-banked mash vault and bronze brew-kettle hall fermenting dustmillet beer, buckwheat mash & spiced highland tea',
 build(){
  const G=.38;
  hyPlinth(13.6,10.4,G,{stepW:2.8,stepX:0});
  hyLoessVault(0,-.6,G,11.8,7.8,3.55,{
   frontMk:'lime',lintel:'nephrite',maskMk:'bronze',celadonCrown:true,smoke:true,stepHead:true,winLight:'alabaster'
  });
  /* Bronze mash tun & condenser coil on west side of hall */
  svNoWalk(()=>{
   cyl('basalt',-3.8,G,-2.2,1.05,.46,P('basaltD'),14);
   cyl('bronze',-3.8,G+.46,-2.2,.96,1.25,P('bronze'),16);
   lathe('bronze',-3.8,-2.2,[[.96,G+1.71],[.42,G+2.35],[.18,G+2.95]],14,P('bronze'));
  });
  hyPlaidAwning(-3.6,3.5,3.6,5.2,G,2.65,{mk:'plaid',sag:.2});
  hyBilingualSign(-3.4,G+2.4,3.45,0,1.35,.82);

  hyFurnList([
   ['hayrant_kaen_jar',2.2,G,-2.8,0,1],
   ['hayrant_kaen_jar',3.4,G,-2.8,0,1],
   ['hayrant_kaen_jar',4.4,G,-2.0,0,0],
   ['generic_barrel',-4.2,G,.8,0],
   ['generic_keg',-2.8,G,1.2,0],
   ['hayrant_larch_feast_table',1.8,G,.8,0],
   ['generic_tea_set',1.8,G+0.54,.8,0]
  ]);
  hyTarget(0,G,1.2,'brew-vault');
 }});

/* 35. Birch-Tar & Larch-Bark Yak-Pelt Tannery */
defBuilding({key:'hy_pelt_tannery',name:'Birch-Tar and Larch-Bark Yak-Pelt Tannery',seed:34311,cut:true,
 w:16.8,d:14.2,h:9.2,budget:110000,
 tags:{types:['industry'],wealth:'poor',style:'bench',job:'tanning'},
 note:'megabreccia currier lodge, sunken birch-tar and larch-tannin liquor vats & katabatic wind-rigged stretched yak hides',
 build(){
  const G=.34;
  hyPlinth(14.2,10.8,G,{stepW:2.6,stepX:-2.8});
  /* West currier shed */
  W(-2.8,0,-.5,0,()=>{
   const TW=7.8,TD=7.6,TH=3.3;
   hyWallRing(-TW/2,-TD/2,TW/2,TD/2,G,TH,{
    mk:'basalt',socle:.6,socleMk:'megabreccia',
    holes:{s:[{at:TW/2,y:0,w:1.75,h:2.55},{at:1.6,y:.95,w:1.05,h:1.2}]}
   });
   hyDoor(0,G,TD/2,0,1.32,2.1,{lintel:'larch',maskMk:'lead'});
   hyWindow(-TW/2+1.6,G+.95,TD/2,0,.84,.98,{light:'nephrite'});
   hyRoofHip(0,G+TH+.24,0,TW+.2,TD+.2,2.15,{mk:'bark',smoke:true});
  });
  /* East tanning vat court & 3 wind-rigged stretched yak-hide frames */
  svNoWalk(()=>{
   for(let i=0;i<2;i++){
    const zz=-2.2+i*2.6;
    box('ashlar',3.8,G,zz,3.2,.44,1.9,P('ashlar'));
    box('tarwood',3.8,G+.44,zz,2.8,.06,1.5,P('tarwood'));
   }
  });
  hyWindHanging(2.6,G,3.4,0,2.3,2.75,{mk:'hide',panels:2});
  hyWindHanging(5.2,G,3.4,0,2.1,2.75,{mk:'hide',panels:2});
  hyWindHanging(3.9,G,-4.4,0,2.6,2.75,{mk:'hide',panels:2});

  hyFurnList([
   ['pa_vice_bench',-4.6,G,-2.4,0],
   ['hayrant_yak_pelt_mat',-1.2,G,-2.2,0,0],
   ['job_salt_tub',-4.8,G,.8,0],
   ['pa_water_trough',-1.2,G,1.2,PI],
   ['generic_barrel',1.6,G,-3.2,0],
   ['pa_tool_rack',-.2,G,-.5,-PI/2]
  ]);
  hyTarget(-2.8,G,.8,'currier-shed');
  hyTarget(1.8,G,2.2,'tanning-yard');
 }});

/* 36. Tholos Basalt Granary-Nuraghe & Mountain Gristmill (FLOW STREAM #3 on core/water) */
defBuilding({key:'hy_granary_nuraghe',name:'Tholos Granary-Nuraghe and Mountain Gristmill',seed:34312,cut:true,
 w:19.2,d:15.8,h:11.8,budget:130000,
 tags:{types:['industry','farm'],wealth:'middle',style:'hybrid',job:'milling'},
 note:'frost-proof corbelled basalt silo nuraghe paired with a water-powered overshot mountain dustmillet & buckwheat gristmill',
 build(){
  /* Live core/water mountain millstream along north z = -5.4 */
  hyFlowStream('hayrant_gristmill_stream',[[-8.8,.24,-5.4],[8.8,.14,-5.4]],1.9,1.35);

  svNoWalk(()=>box('paving',0,0,1.4,14.8,.08,8.4,P('paving')));
  wkPad(0,1.4,14.8,8.4,.08);
  /* West rat- and frost-proof corbelled Basalt Granary-Nuraghe */
  hyNuraghe(-4.2,-.2,.08,3.35,2.52,6.8,{
   celadonCap:true,capH:2.35,smoke:false,
   doors:[{yaw:0,w:1.26,h:2.12,lintel:'nephrite',maskMk:'bronze'}],
   windows:[{yaw:0,w:.58,h:.85,y:3.6,light:'nephrite'}]
  });

  /* East Water-Powered Gristmill Hall + Larch Waterwheel */
  W(3.2,0,-.2,0,()=>{
   const G=.36,MW=7.8,MD=7.6,MH=3.75;
   hyPlinth(MW+.4,MD+.4,G,{stepW:2.2,stepX:0});
   hyWallRing(-MW/2,-MD/2,MW/2,MD/2,G,MH,{
    mk:'lime',socle:.72,socleMk:'basalt',
    holes:{
     s:[{at:MW/2,y:0,w:1.8,h:2.65},{at:1.6,y:.95,w:1.15,h:1.3}],
     n:[{at:MW/2,y:1.0,w:1.2,h:1.3}]
    }
   });
   hyDoor(0,G,MD/2,0,1.36,2.14,{lintel:'nephrite',maskMk:'kaen'});
   hyWindow(-MW/2+1.6,G+.95,MD/2,0,.92,1.08,{light:'alabaster',stepHead:true});
   hyWindow(0,G+1.0,-MD/2,PI,.96,1.08,{light:'steel'});
   hyRoofHip(0,G+MH+.24,0,MW+.2,MD+.2,2.45,{mk:'celadon',smoke:false});
   /* Waterwheel on north face overhanging millstream, + basalt millstone pair inside */
   svNoWalk(()=>{
    W(0,G+1.35,-MD/2-.65,0,()=>{
     ring('larch',0,0,0,1.55,.11,P('larchD'),0,PI/2,0,18);
     for(let i=0;i<8;i++){
      const a=i*TAU/8;
      box('larch',Math.cos(a)*1.48,Math.sin(a)*1.48,0,.08,.34,.44,P('larch'));
     }
     pole('iron',[0,0,-.3],[0,0,1.25],.11,P('iron'),10);
    });
    cyl('basalt',1.6,G,-1.4,.78,.42,P('basalt'),16);
    cyl('ashlar',1.6,G+.42,-1.4,.72,.28,P('ashlar'),16);
   });
   hyFurnList([
    ['job_winnowing_tub',-1.8,G,-1.8,0],
    ['job_winnowing_mat',-1.8,G,.6,0],
    ['generic_sack',2.1,G,1.4,0],
    ['generic_sack',-2.4,G,2.1,0]
   ]);
   hyTarget(-.6,G,1.2,'gristmill-floor');
  });
  hyFurnList([
   ['job_sheaf_rack',-4.2,.14,-1.8,0],
   ['hayrant_kaen_jar',-5.4,.14,-.2,0,1],
   ['eternian_common_weighing_scale',-2.8,.14,-.2,-PI/2]
  ]);
  hyTarget(-4.2,.14,-.2,'granary-silo');
 }});

/* 37. Cyclopean Bonded Pass-Freight Warehouse Vault */
defBuilding({key:'hy_warehouse_vault',name:'Cyclopean Bonded Pass-Freight Warehouse',seed:34313,cut:true,
 w:19.4,d:14.6,h:11.6,budget:130000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'prefect',job:'warehousing'},
 note:'three-bay battered megabreccia and pale-brick bonded freight vault with twin-ancestor cargo portal & larch jib hoist',
 build(){
  const G=.46,W=15.6,D=9.6,H=4.65;
  pushM(TF(0,0,-.4));
  hyPlinth(W+.6,D+.6,G,{stepW:3.6,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'basalt',socle:1.05,socleMk:'megabreccia',postMk:'columnar',
   holes:{
    s:[{at:W/2,y:0,w:3.2,h:3.45},{at:2.8,y:1.4,w:1.1,h:1.45},{at:W-2.8,y:1.4,w:1.1,h:1.45}],
    n:[{at:4.2,y:1.4,w:1.1,h:1.4},{at:W-4.2,y:1.4,w:1.1,h:1.4}]
   }
  });
  hyDoor(0,G,D/2,0,2.05,2.65,{lintel:'civic',ancestorMk:'bronze'});
  for(const sx of [-W/2+2.8,W/2-2.8])hyWindow(sx,G+1.4,D/2,0,.88,1.22,{light:'steel',stepHead:true});
  for(const sx of [-W/2+4.2,W/2-4.2])hyWindow(sx,G+1.4,-D/2,PI,.88,1.18,{light:'steel'});
  hySteppedPierFront(0,G+H+.24,D/2+.16,0,6.2,1.15,.32,5,{mk:'brick',centreMetal:'bronze',sideMetal:'gunmetal'});
  hyRoofHip(0,G+H+.24,0,W+.24,D+.24,3.25,{mk:'tile',kaenFinial:false});
  /* Projecting fur-larch cargo jib beam & bronze pulley over portal */
  svNoWalk(()=>{
   beam('larch',[3.4,G+3.95,D/2-.2],[3.4,G+4.15,D/2+1.45],.16,P('larchD'));
   ring('bronze',3.4,G+3.92,D/2+1.3,.16,.035,P('bronze'),0,PI/2,0,10);
   pole('rope',[3.4,G+3.85,D/2+1.3],[3.4,G+1.8,D/2+1.3],.014,P('rope'),6);
  });

  hyFurnList([
   ['generic_crate',-5.2,G,-2.8,0],
   ['generic_crate',-3.6,G,-2.8,0],
   ['generic_crate',4.8,G,-2.8,0],
   ['generic_barrel',5.4,G,.8,0],
   ['generic_barrel',5.4,G,2.2,0],
   ['eternian_common_weighing_scale',-2.4,G,1.2,0],
   ['eternian_common_register_desk',2.6,G,1.4,PI]
  ]);
  hyTarget(0,G,1.2,'warehouse-vault');
  popM();
 }});

/* 38. Water-Ballast Escarpment Cliff Hoist (STILL POOL #2 on core/water + walkable upper hoist deck) */
defBuilding({key:'hy_escarpment_hoist',name:'Water-Ballast Escarpment Cliff Hoist',seed:34314,cut:true,
 w:19.6,d:16.2,h:13.8,budget:135000,
 tags:{types:['infrastructure','industry'],wealth:'middle',style:'prefect',job:'warehousing'},
 note:'counterweighted water-ballast cliff hoist lifting lowland Fulcrum freight up the 2 km escarpment, with live core/water ballast cistern',
 build(){
  const G=.34,yDeck=3.95;
  /* Live core/water water-ballast counterweight cistern on NW side */
  hyStillPool('escarpment_ballast_cistern',-7.4,-5.2,-3.6,-1.6,.22,{color:0x1b5054,roughness:.04});

  /* Ground plinth covering the east freight tally lodge & stair approach */
  W(2.2,0,.4,0,()=>{
   hyPlinth(11.6,10.8,G,{stepW:2.8,stepX:0});
  });
  /* Dressed ashlar basin curb around NW ballast cistern */
  svNoWalk(()=>{
   for(const sz of [-5.4,-1.4])box('ashlar',-5.5,0,sz,4.2,.52,.36,P('ashlar'));
   for(const sx of [-7.6,-3.4])box('ashlar',sx,0,-3.4,.36,.52,4.36,P('ashlar'));
  });

  /* East Hoist-Master Tally Cabin on G */
  W(3.8,0,.2,0,()=>{
   const TW=7.2,TD=7.6,TH=3.45;
   hyWallRing(-TW/2,-TD/2,TW/2,TD/2,G,TH,{
    mk:'basalt',socle:.62,socleMk:'megabreccia',
    holes:{s:[{at:TW/2,y:0,w:1.75,h:2.55},{at:1.6,y:.95,w:1.1,h:1.25}]}
   });
   hyDoor(0,G,TD/2,0,1.34,2.12,{lintel:'nephrite',maskMk:'bronze'});
   hyWindow(-TW/2+1.6,G+.95,TD/2,0,.88,1.04,{light:'steel',stepHead:true});
   hyRoofHip(0,G+TH+.24,0,TW+.2,TD+.2,2.2,{mk:'celadon',smoke:true});
  });

  /* Heavy Cyclopean & Fur-Larch Cliff Hoist Gantry at (-1.8, -2.6) with walkable upper deck at yDeck = 3.95 */
  svNoWalk(()=>{
   for(const sx of [-3.4,-.2])for(const sz of [-4.6,-.6]){
    box('columnar',sx,0,sz,.78,yDeck-.18,.78,P('columnar'));
   }
   box('planks',-1.8,yDeck-.18,-2.6,4.2,.18,4.8,P('planks'));
   /* Overhead sheave headframe rising to y = 10.6 */
   for(const sx of [-3.1,-.5])for(const sz of [-4.2,-1.0]){
    beam('larch',[sx,yDeck,sz],[sx*.92-.14,yDeck+5.6,sz],.16,P('larchD'));
   }
   box('larch',-1.8,yDeck+5.6,-2.6,3.4,.28,3.8,P('larchD'));
   etHip(3.8,4.2,yDeck+5.88,1.95,{mk:'tile',ov:.35,under:P('larchD'),cap:P('ashlar')});
   /* Twin bronze winding sheaves, iron cargo cage & water-ballast bucket cables */
   ring('bronze',-1.8,yDeck+5.1,-2.6,.68,.09,P('bronze'),0,PI/2,0,16);
   pole('rope',[-1.8,yDeck+5.1,-2.6],[-1.8,yDeck+1.1,-2.6],.02,P('iron'),6);
   box('iron',-1.8,yDeck+.35,-2.6,1.45,1.1,1.45,P('iron'));
   /* Bronze feed pipe from gantry to ballast cistern */
   beam('bronze',[-3.4,yDeck+.6,-3.4],[-5.5,.65,-3.4],.09,P('bronze'));
  });
  wkPad(-1.8,-2.6,4.0,4.6,yDeck);
  /* Walkable exterior timber stair climbing from plinth (x=-1.8, z=3.8, y=G) north to upper hoist deck (x=-1.8, z=-.2, y=yDeck) */
  svStair(-1.8,4.2,G,yDeck,PI,{w:1.05,run:4.3,mk:'larch',col:P('larch'),smk:'larch',scol:P('larchD'),rail:'both'});

  hyFurnList([
   ['eternian_common_register_desk',3.8,G,-2.1,0],
   ['eternian_common_weighing_scale',5.4,G,.4,-PI/2],
   ['generic_crate',2.2,G,-2.2,0],
   ['generic_barrel',5.6,G,2.2,0],
   ['pa_tool_rack',2.0,G,1.8,PI/2],
   ['generic_crate',-1.8,yDeck,-3.8,0]
  ]);
  hyTarget(3.8,G,1.2,'hoist-tally');
  hyTarget(-1.8,yDeck,-1.6,'hoist-upper-deck');
 }});

/* 39. Walled Pass-Road Yak & Mule Caravanserai Inn */
defBuilding({key:'hy_caravanserai_inn',name:'Pass-Road Yak and Mule Caravanserai Inn',seed:34315,cut:true,
 w:23.4,d:19.6,h:11.6,budget:155000,
 tags:{types:['inn'],wealth:'middle',style:'hybrid',job:'trading'},
 note:'walled pack-train courtyard with stone watering troughs, yak hitching rails & two-storey hybrid stone-and-lime guest lodge',
 build(){
  svNoWalk(()=>box('paving',0,0,0,20.6,.08,16.8,P('paving')));
  wkPad(0,0,20.6,16.8,.08);
  hyWallRing(-10.3,-8.4,10.3,8.4,.08,2.65,{
   mk:'basalt',socle:.68,socleMk:'megabreccia',
   holes:{s:[{at:10.3,y:0,w:3.6,h:2.65}]}
  });
  hyDoor(0,.08,8.4,0,2.2,2.45,{lintel:'nephrite',maskMk:'bronze'});
  hyBilingualSign(-2.8,1.15,8.76,0,1.5,.88);

  /* North Guest Lodge across the rear of the courtyard */
  W(0,0,-4.2,0,()=>{
   const G=.38,LW=16.4,LD=6.6,LH=4.25;
   hyPlinth(LW+.4,LD+.4,G,{stepW:3.2,stepX:0});
   hyWallRing(-LW/2,-LD/2,LW/2,LD/2,G,LH,{
    mk:'lime',socle:.82,socleMk:'basalt',
    holes:{
     s:[{at:LW/2,y:0,w:2.1,h:2.85},{at:3.2,y:.95,w:1.35,h:1.5},{at:LW-3.2,y:.95,w:1.35,h:1.5}],
     n:[{at:4.2,y:1.0,w:1.25,h:1.4},{at:LW-4.2,y:1.0,w:1.25,h:1.4}]
    }
   });
   hyDoor(0,G,LD/2,0,1.56,2.26,{lintel:'nephrite',maskMk:'bronze'});
   for(const sx of [-LW/2+3.2,LW/2-3.2])hyWindow(sx,G+.95,LD/2,0,1.1,1.28,{light:'alabaster',stepHead:true});
   for(const sx of [-LW/2+4.2,LW/2-4.2])hyWindow(sx,G+1.0,-LD/2,PI,1.0,1.18,{light:'nephrite'});
   hyRoofHip(0,G+LH+.24,0,LW+.24,LD+.24,3.1,{mk:'celadon',smoke:true});
   hyFurnList([
    ['hayrant_irori_hearth',0,G,-.4,0],
    ['hayrant_larch_feast_table',-3.4,G,-.2,0],
    ['hayrant_larch_cruck_bed',5.2,G,-1.4,0],
    ['hayrant_larch_cruck_bed',5.2,G,1.1,0],
    ['hayrant_inau_ancestor_shelf',-6.4,G,-2.1,PI/2,0]
   ]);
   hyTarget(0,G,.8,'inn-hall');
  });
  /* Covered pack-beast shelter awning along west court wall */
  hyPlaidAwning(-9.4,.8,-5.2,6.8,.08,2.75,{mk:'hemp',sag:.22});
  hyFurnList([
   ['pa_water_trough',6.8,.08,3.6,PI/2],
   ['pa_hitching_post',6.8,.08,1.2,0],
   ['pa_hay_bales',-7.6,.08,4.6,0],
   ['generic_barrel',-7.6,.08,2.1,0]
  ]);
  hyTarget(0,.08,3.4,'pack-court');
 }});

/* 40. Great Cruck-Rib Irori Hearth Tavern */
defBuilding({key:'hy_hearth_tavern',name:'Great Cruck-Rib Irori Hearth Tavern',seed:34316,cut:true,
 front:{x:0,z:6.8,yaw:0},
 w:16.4,d:16.6,h:9.8,budget:120000,
 tags:{types:['tavern'],wealth:'middle',style:'hybrid',job:'brewing'},
 note:'wide steamed fur-larch cruck-rib tavern chise with imbricated shingle tiers, octagonal celadon irori smoke-lantern & keyed entrance vestibule',
 build(){
  const R=5.35,WT=.68,WH=2.55,DR=2.78,RS=1.18;
  hyChise(0,-.6,0,R,WT,WH,DR,{
   ribs:16,rSmoke:RS,eaveOver:.36,celadonCrown:true,lanternCrown:true,
   doors:[{yaw:0,w:1.62,h:2.24,vestibule:true}],
   windows:[
    {yaw:1.08,w:.92,h:.98,y:.98,light:'alabaster'},
    {yaw:-1.08,w:.92,h:.98,y:.98,light:'alabaster'},
    {yaw:2.18,w:.86,h:.92,y:.98,light:'nephrite'},
    {yaw:-2.18,w:.86,h:.92,y:.98,light:'nephrite'},
    {yaw:PI,w:.88,h:.92,y:1.02,light:'alabaster'}
   ]
  });

  /* Raised Octagonal Irori Smoke-Monitor Clerestory Lantern + Flared Celadon Pagoda Hood + Kaen-Doki Crown */
  const yLan=WH+.19+DR,rPost=RS+.12,lanH=.92;
  W(0,0,-.6,0,()=>{
   svNoWalk(()=>{
    cyl('ashlar',0,yLan-.04,0,RS+.28,.16,P('ashlar'),8);
    for(let i=0;i<8;i++){
     const a=i*TAU/8+PI/8,nx=Math.cos(a),nz=Math.sin(a);
     cyl('larch',nx*rPost,yLan+.12,nz*rPost,.075,lanH,P('larch'),8);
     const aMid=i*TAU/8;
     W(Math.cos(aMid)*(RS+.04),yLan+.20,Math.sin(aMid)*(RS+.04),PI/2-aMid,()=>{
      box('alabaster',0,0,0,.64,lanH-.18,.045,new THREE.Color(1,1,1));
      for(const ly of [.18,.42,.62])box('bronze',0,ly,.03,.68,.038,.06,P('bronze'));
     });
    }
    cyl('tarwood',0,yLan+.12+lanH,0,RS+.32,.11,P('tarwood'),8);
    const cCol=KIT_HAS('celadon')?new THREE.Color(1,1,1):P('celadon');
    etHexHip(RS+.62,yLan+.23+lanH,1.18,{mk:'celadon',ov:.28,under:P('larchD'),cap:cCol});
    haloAt(0,yLan+.52,0,0xffa84c,true);
   });
   hyKaenCrown(0,yLan+1.42+lanH,0,.42,.72,4,{celadon:true,smoke:true});
  });

  /* Keyed Wind-Lock Entrance Vestibule (engaged cleanly into the stone ring-wall, crowned with a celadon hipped hood) */
  svNoWalk(()=>{
   box('paving',0,0,5.35,4.4,.08,3.1,P('paving'));
   for(const sx of [-1.85,1.85]){
    box('megabreccia',sx,.08,5.15,.52,.58,2.95,P('megabreccia'));
    box('basalt',sx,.66,4.65,.46,2.08,1.95,P('basalt'));
    box('ashlar',sx,.08,6.55,.46,.48,.46,P('ashlar'));
    cyl('larch',sx,.56,6.55,.13,2.18,P('larch'),10);
   }
   box('larch',0,2.62,6.55,4.15,.18,.26,P('larch'));
   box('tarwood',0,2.74,5.35,4.28,.12,3.05,P('tarwood'));
  });
  wkPad(0,5.45,4.2,3.0,.08);
  hyDoor(0,.08,5.62,0,1.56,2.2,{lintel:'nephrite',maskMk:'bronze'});
  hyRoofHip(0,2.86,5.35,4.28,3.08,1.34,{mk:'celadon',over:.38,kaenFinial:true,smoke:false});
  hyFormlineFrieze(0,2.74,7.34,2.5,.46,0,{backMk:'larch',tertiary:'celadon'});
  hyWindHanging(0,.12,6.62,0,3.25,2.52,{mk:'plaid',panels:3,drop:1.05,posts:false});
  hyBilingualSign(-2.28,1.58,6.72,0,1.32,.82);
  hyEavesBraid(2.22,2.42,6.68,-.2,1.65,{sag:.16});

  /* Covered West Cask & Kaen-Doki Pickle-Jar Lean-To against the Stone Ring-Wall */
  svNoWalk(()=>{
   box('paving',-5.75,0,-.6,1.65,.08,3.6,P('paving'));
   for(const sz of [-2.1,0.9]){
    box('ashlar',-6.35,.08,sz,.28,.24,.28,P('ashlar'));
    cyl('larch',-6.35,.32,sz,.075,1.68,P('larch'),8);
   }
   box('larch',-6.35,2.0,-.6,.16,.14,3.4,P('larch'));
   W(-5.72,2.18,-.6,0,()=>{
    WX(0,0,0,0,0,.32,()=>box('bark',0,0,0,1.65,.09,3.8,P('bark')));
   });
  });

  hyFurnList([
   ['hayrant_irori_hearth',0,.06,-.6,0],
   ['hayrant_larch_feast_table',-2.3,.06,-.6,PI/2],
   ['hayrant_larch_feast_table',2.3,.06,-.6,-PI/2],
   ['hayrant_yak_pelt_mat',-3.4,.06,-.6,PI/2,1],
   ['hayrant_yak_pelt_mat',3.4,.06,-.6,-PI/2,1],
   ['hayrant_head_totem_post',-3.5,.06,2.0,PI/4,0],
   ['hayrant_formline_chest',3.5,.06,2.0,-3*PI/4,0],
   ['generic_keg',-1.8,.06,-3.6,0],
   ['generic_keg',-5.75,.08,-1.35,PI/2],
   ['generic_ale',2.3,.6,-.6,0],
   ['hayrant_kaen_jar',1.8,.06,-3.6,0,1],
   ['hayrant_kaen_jar',-5.75,.08,.15,0,0],
   ['hayrant_inau_ancestor_shelf',0,.06,-4.1,0,0]
  ]);
  hyTarget(0,.06,1.2,'tavern-hearth');
 }});

/* 41. Hexagonal Dust-Sheltered Highland Market Hall */
defBuilding({key:'hy_market_hall',name:'Hexagonal Dust-Sheltered Highland Market Hall',seed:34317,cut:true,
 front:{x:0,z:5.8,yaw:0},
 w:18.8,d:18.8,h:12.6,budget:135000,
 tags:{types:['market','shop'],wealth:'middle',style:'hybrid',job:'trading',market:true},
 note:'six-sided basalt and pale-brick dust-sheltered market hall under a steep celadon hex-hip, surrounded by madder-plaid awnings',
 build(){
  const G=.38,R=5.8,H=3.85;
  /* Raised hexagonal paved podium + walkable front stair */
  svNoWalk(()=>{
   cyl('megabreccia',0,0,0,R+.45,G*.6,P('megabreccia'),6);
   cyl('paving',0,G*.6,0,R+.15,G*.4,P('paving'),6);
   for(let i=0;i<3;i++)box('ashlar',0,G*i/3,R+.85-.28*i,3.2,G/3,.3,P('ashlar'));
   /* Six heavy columnar basalt corner piers, low dust-baffle screen walls on 3 windward sides, & celadon hex-hip */
   for(let i=0;i<6;i++){
    const a=i*TAU/6+PI/6,px=Math.cos(a)*(R-.35),pz=Math.sin(a)*(R-.35);
    box('columnar',px,G,pz,.62,H,.62,P('columnar'));
    box('nephrite',px,G+H,pz,.72,.18,.72,P('nephrite'));
   }
   /* North windward dust-baffle walls (leaving wide front & side arches open) */
   box('brick',0,G,-R+.55,5.2,2.15,.36,P('brick'));
   cyl('basalt',0,G+H+.18,0,R+.12,.26,P('basalt'),6);
   etHexHip(R+.55,G+H+.44,4.25,{mk:'celadon',ov:.48,under:P('larchD'),cap:P('celadon')});
   hyKaenCrown(0,G+H+4.73,0,.38,.68,6,{celadon:true,smoke:false});
  });
  svFloor(hyOctPts(0,0,R,6),G);
  svStripWalk([0,0,R+1.0],[0,G,R-.25],3.0);
  hyDoor(0,G,R-.48,0,2.4,2.65,{open:true,lintel:'civic',ancestorMk:'bronze'});
  hyPlaidAwning(-6.6,-1.8,-4.2,2.8,0,2.65,{mk:'plaid',sag:.2});
  hyPlaidAwning(4.2,-1.8,6.6,2.8,0,2.65,{mk:'plaid',sag:.2});
  hyBilingualSign(-2.6,G+2.5,R-.2,0,1.4,.82);

  hyFurnList([
   ['pa_shop_counter',-2.2,G,-.8,PI/4],
   ['pa_shop_counter',2.2,G,-.8,-PI/4],
   ['eternian_common_weighing_scale',0,G,-2.8,0],
   ['generic_floor_basket',-2.2,G+.92,-.8,0],
   ['hayrant_kaen_jar',2.2,G+.92,-.8,0,0],
   ['generic_cheese',2.6,G,.8,0],
   ['hayrant_kaen_jar',-3.4,G,1.6,0,1],
   ['hayrant_jade_lantern_post',3.4,G,2.8,0]
  ]);
  hyTarget(0,G,1.2,'market-rotunda');
 }});

/* 42. Spring-Fed Hot-Stone Soaking Bath & Goldroot Apothecary (STILL POOL #3 on core/water) */
defBuilding({key:'hy_healer_bath',name:'Hot-Stone Spring Bath and Goldroot Apothecary',seed:34318,cut:true,
 w:17.8,d:15.4,h:10.4,budget:125000,
 tags:{types:['civic','shop'],wealth:'middle',style:'hybrid',job:'healing'},
 note:'spring-fed hot-stone soaking pool on core/water paired with a white-lime goldroot apothecary and herb-drying gallery',
 build(){
  const G=.44;
  /* Live core/water steaming mineral soaking basin on west court */
  hyStillPool('hayrant_hot_stone_bath',-6.4,-3.2,-1.8,1.4,.24,{color:0x1e5c5a,roughness:.03});

  /* East Apothecary Hall & South Threshold Terrace */
  W(3.4,0,-.4,0,()=>{
   const HW=8.2,HD=9.2,HH=3.85;
   hyPlinth(HW+.5,HD+.5,G,{stepW:2.6,stepX:0});
   hyWallRing(-HW/2,-HD/2,HW/2,HD/2,G,HH,{
    mk:'lime',socle:.68,socleMk:'basalt',
    holes:{
     s:[{at:HW/2,y:0,w:1.85,h:2.65},{at:1.8,y:.95,w:1.2,h:1.4}],
     w:[{at:HD/2,y:0,w:1.8,h:2.55}],
     n:[{at:HW/2,y:1.0,w:1.25,h:1.4}]
    }
   });
   hyDoor(0,G,HD/2,0,1.4,2.18,{lintel:'nephrite',maskMk:'silver'});
   hyWindow(-HW/2+1.8,G+.95,HD/2,0,.96,1.18,{light:'alabaster',stepHead:true});
   hyWindow(0,G+1.0,-HD/2,PI,1.0,1.18,{light:'alabaster',stepHead:true});
   hyRoofHip(0,G+HH+.24,0,HW+.2,HD+.2,2.55,{mk:'celadon',smoke:true});
  });
  /* Dressed basalt & nephrite curb surrounding the west soaking pool + walkable pool deck at y = .32 */
  svNoWalk(()=>{
   for(const sz of [-3.5,1.7])box('nephrite',-4.1,0,sz,5.2,.36,.42,P('nephrite'));
   for(const sx of [-6.7,-1.5])box('nephrite',sx,0,-.9,.42,.36,5.6,P('nephrite'));
   box('paving',-4.1,0,3.1,5.6,.32,2.4,P('paving'));
  });
  wkPad(-4.1,3.1,5.6,2.4,.32);
  svStripWalk([-4.1,0,4.8],[-4.1,.32,4.1],2.2);
  hyPlaidAwning(-6.8,-3.6,-1.4,2.0,.36,3.1,{mk:'hemp',sag:.2});
  smokeAt(-4.1,.4,-.9,{r:.55,kind:'chimney'});

  hyFurnList([
   ['eternian_common_bed',5.2,G,-2.8,0],
   ['eternian_common_table',3.4,G,-.4,0],
   ['generic_medicine',3.4,G+.76,-.4,0],
   ['generic_herb_bundles',1.4,G,-3.6,0],
   ['hayrant_irori_hearth',5.2,G,2.1,0],
   ['hayrant_jade_lantern_post',-6.4,.32,3.4,0],
   ['eternian_common_bench',-4.1,.32,3.4,PI]
  ]);
  hyTarget(3.4,G,1.6,'apothecary-hall');
  hyTarget(-4.1,.32,2.8,'bath-terrace');
 }});

/* 43. Contoured Loess Terrace & Frost-Trap Jujube Farmstead */
defBuilding({key:'hy_terrace_farmstead',name:'Contoured Loess Terrace and Jujube Farmstead',seed:34319,cut:true,
 w:20.6,d:17.8,h:8.4,budget:110000,
 tags:{types:['farm','dwelling-single'],wealth:'poor',style:'bench',job:'farming'},
 note:'horizontal loess yaodong farmhouse overlooking contoured dry-stone dustmillet, buckwheat & frost-trap cave-date jujube terraces',
 build(){
  const G=.34;
  /* North loess-vaulted farmhouse */
  W(-2.6,0,-3.2,0,()=>{
   hyPlinth(10.8,7.4,G,{stepW:2.6,stepX:0});
   hyLoessVault(0,-.15,G,9.6,6.2,3.15,{frontMk:'loess',lintel:'larch',maskMk:'kaen',smoke:true});
   hyFormlineTympanum(0,G+3.46,2.92,5.2,.60,0,{arch:true,backMk:'loess',tertiary:'nephrite'});
   hyEavesBraid(0,G+2.9,3.25,0,5.6,{sag:.22});
  });
  /* Compact stone-mushroom pu grain cache beside the threshing yard (clear of farmhouse, terraces & walk paths) */
  hyPuCache(-7.35,0,4.15,2.30,2.10,PI/2,{legH:1.18,rPost:.15,boxH:1.30,rise:.70,maskMk:'lead'});
  /* South & East stepped megabreccia-retained contoured loess cultivation & frost-trap orchard beds */
  svNoWalk(()=>{
   for(let i=0;i<2;i++){
    const zz=2.4+i*3.1,yh=.28-i*.08;
    box('megabreccia',3.8,0,zz,9.4,yh+.08,2.6,P('megabreccia'));
    box('loess',3.8,yh+.08,zz,8.9,.08,2.2,P('loess'));
    for(let k=-3;k<=3;k++)cone('turf',3.8+k*1.15,yh+.16,zz,.32,.62,P('leaf'),7);
   }
   /* Walled frost-trap cave-date jujube court on NE */
   box('basalt',5.6,0,-3.2,5.2,1.65,.34,P('basalt'));
   box('loess',5.6,0,-1.4,4.8,.22,3.2,P('loessD'));
   for(const sx of [4.2,7.0]){
    cyl('larch',sx,.22,-1.4,.12,.95,P('larchD'),7);
    cone('turf',sx,1.05,-1.4,.85,1.45,P('leaf'),8);
   }
  });
  wkPad(-2.6,2.2,6.4,3.8,.06);
  svNoWalk(()=>box('paving',-2.6,0,2.2,6.4,.06,3.8,P('paving')));

  hyFurnList([
   ['hayrant_irori_hearth',-2.6,G,-3.4,0],
   ['hayrant_larch_cruck_bed',-5.6,G,-3.6,PI/2],
   ['hayrant_inau_ancestor_shelf',0,G,-5.4,0,1],
   ['job_sheaf_rack',-4.8,.06,2.4,0],
   ['job_winnowing_mat',-1.2,.06,2.4,0],
   ['generic_veg_basket',-.2,.06,3.4,0],
   ['pa_tool_rack',1.4,G,-1.8,0]
  ]);
  hyTarget(-2.6,G,-2.2,'farm-yaodong');
  hyTarget(-2.6,.06,2.2,'threshing-yard');
 }});

/* 44. Megabreccia Yak & Sheep Winter Byre and Cheese Cellar */
defBuilding({key:'hy_fell_fold',name:'Megabreccia Yak Byre and Cheese Cellar',seed:34320,cut:true,
 w:19.4,d:16.4,h:8.6,budget:105000,
 tags:{types:['farm'],wealth:'poor',style:'bench',job:'dairy'},
 note:'cruck-ribbed fur-larch winter yak and sheep byre, gale-cobble threshold hood, turf-roofed cheese cellar & megabreccia windbreak kraal',
 build(){
  svNoWalk(()=>box('paving',0,0,1.2,15.6,.06,10.8,P('paving')));
  wkPad(0,1.2,15.6,10.8,.06);
  /* West Cruck-Rib Cheese & Herder Chise */
  hyChise(-4.2,-1.6,.06,3.85,.64,2.28,2.48,{
   doors:[{yaw:0,w:1.34,h:2.06,lintel:'larch',maskMk:'lead'}],
   windows:[{yaw:1.4,w:.72,h:.78,y:.92,light:'nephrite'}]
  });
  hyGaleCobbleRoof(-4.2,2.44,3.12,2.40,.92,.44,0,{posts:true,postY0:.06,mk:'larch',overZ:.16});
  hyInauCluster(-5.48,1.92,3.48,0,{scale:.64});
  /* East Dry-Stone Megabreccia Winter Kraal & Bark Shelter */
  hyWallRing(.8,-4.2,7.8,4.6,.06,1.65,{
   mk:'megabreccia',socle:.45,socleMk:'columnar',eavesRing:false,
   holes:{s:[{at:3.5,y:0,w:2.4,h:1.65}]}
  });
  hyPlaidAwning(1.2,-3.8,7.4,-.4,.06,2.65,{mk:'hide',sag:.22});

  hyFurnList([
   ['hayrant_irori_hearth',-4.2,.12,-1.6,0],
   ['generic_churn',-5.8,.12,-1.6,PI/2],
   ['generic_cheese',-4.2,.12,-3.6,0],
   ['generic_dairy',-2.8,.12,-3.2,0],
   ['pa_hay_bales',2.4,.06,-2.4,0],
   ['pa_water_trough',5.8,.06,1.6,PI/2],
   ['hayrant_kaen_jar',-2.6,.12,-.2,0,0]
  ]);
  hyTarget(-4.2,.12,-1.6,'cheese-chise');
  hyTarget(4.2,.06,1.2,'yak-kraal');
 }});

/* 45. Dark Loess Pale-Fungi & Moon-Cap Cultivation Drift */
defBuilding({key:'hy_mushroom_drift',name:'Dark Loess Pale-Fungi and Moon-Cap Drift',seed:34321,cut:true,
 w:14.6,d:12.6,h:7.6,budget:90000,
 tags:{types:['farm','industry'],wealth:'poor',style:'bench',job:'fungiculture'},
 note:'humid shuttered loess drift cultivating dark-grown pale-fungi and glowing moon-cap on rotting larch logs',
 build(){
  const G=.32;
  pushM(TF(0,0,-.4));
  hyPlinth(11.8,9.2,G,{stepW:2.4,stepX:0});
  hyLoessVault(0,-.2,G,10.2,7.4,3.15,{frontMk:'basalt',lintel:'larch',maskMk:'lead',smoke:false,relieving:false});
  /* Inoculated fur-larch substrate logs & bioluminescent moon-cap clusters inside the dark vault */
  svNoWalk(()=>{
   for(const sx of [-2.8,2.8]){
    for(let i=0;i<2;i++){
     const zz=-2.1+i*1.85;
     pole('larch',[sx-1.1,G+.2,zz],[sx+1.1,G+.2,zz],.18,P('larchD'),8);
     for(let k=-2;k<=2;k++){
      cyl('glow',sx+k*.42,G+.39,zz,.11,.06,new THREE.Color(0x66f0c8),8);
     }
    }
   }
  });
  haloAt(-2.8,G+.6,-1.2,0x66f0c8,false);
  haloAt(2.8,G+.6,-1.2,0x66f0c8,false);
  hyWindHanging(0,G,3.85,0,1.65,2.25,{mk:'hide',panels:2});

  hyFurnList([
   ['generic_mushrooms',-2.8,G,.9,0],
   ['generic_mushrooms',2.8,G,.9,0],
   ['generic_floor_basket',-1.4,G,1.6,0],
   ['pa_water_butt',3.6,G,2.1,0],
   ['eternian_poor_block_bench',0,G,-2.6,0],
   ['hayrant_kaen_jar',-3.6,G,2.1,0,0]
  ]);
  hyTarget(0,G,1.2,'fungus-drift');
  popM();
 }});

/* 46. Sag-Pond Trench-Lake Basalt Fishery & Skiff Shed (STILL POOL #4 on core/water) */
defBuilding({key:'hy_trench_fishery',name:'Sag-Pond Trench-Lake Fishery and Skiff Shed',seed:34322,cut:true,
 w:18.8,d:16.2,h:9.6,budget:115000,
 tags:{types:['farm','infrastructure'],wealth:'poor',style:'bench',job:'fishing'},
 note:'basalt quay jutting into a Western Outer Wall tectonic sag-pond trench-lake, upturned fur-larch skiff, net-drying rack & smoke hut',
 build(){
  const G=.38;
  /* Live core/water tectonic sag-pond lake basin along north z = [-6.2..-1.8] */
  hyStillPool('sag_pond_trench_basin',-7.8,-6.2,7.8,-1.8,.16,{color:0x17484e,roughness:.04});

  /* South stone quay terrace & north basalt jetty finger */
  W(0,0,2.2,0,()=>{
   hyPlinth(15.6,7.2,G,{stepW:2.8,stepX:-2.8});
  });
  svNoWalk(()=>{
   box('columnar',4.2,0,-3.8,2.6,G+.06,4.6,P('columnar'));
   /* Upturned clinker fur-larch lake skiff on tarwood trestles in east boatyard */
   for(const zz of [.6,3.4])box('tarwood',4.4,G,zz,1.8,.38,.22,P('tarwood'));
   tube('larch',t=>{
    const zz=.2+t*3.6,hw=.68*Math.sin(PI*clamp(t*.92+.04,0,1));
    return [4.4,G+.62+.12*Math.sin(PI*t),zz];
   },t=>{
    const hw=Math.max(.08,.72*Math.sin(PI*clamp(t*.92+.04,0,1)));
    return [hw,.28];
   },10,8,P('larch'),{caps:true});
  });
  wkPad(4.2,-3.8,2.4,4.4,G+.06);

  /* West Fish-Curing & Boatman Shed */
  W(-3.2,0,2.2,0,()=>{
   const FW=7.8,FD=5.8,FH=3.35;
   hyWallRing(-FW/2,-FD/2,FW/2,FD/2,G,FH,{
    mk:'basalt',socle:.58,socleMk:'megabreccia',
    holes:{s:[{at:FW/2,y:0,w:1.7,h:2.55},{at:1.6,y:.95,w:1.05,h:1.2}]}
   });
   hyDoor(0,G,FD/2,0,1.3,2.1,{lintel:'larch',maskMk:'lead'});
   hyWindow(-FW/2+1.6,G+.95,FD/2,0,.84,.98,{light:'nephrite'});
   hyRoofHip(0,G+FH+.24,0,FW+.2,FD+.2,2.15,{mk:'bark',smoke:true});
  });
  hyWindHanging(1.6,G,-.6,0,2.8,2.75,{mk:'netting',panels:2});
  hyEavesBraid(-3.2,G+2.95,5.25,0,4.2,{sag:.2});

  hyFurnList([
   ['hayrant_irori_hearth',-3.2,G,1.8,0],
   ['pa_fish_rack',-5.6,G,1.2,PI/2],
   ['job_fish_tray',-1.2,G,1.2,0],
   ['job_net_frame',1.6,G,3.4,0],
   ['generic_fish',-1.2,G+.45,1.2,0],
   ['generic_barrel',-5.6,G,3.6,0],
   ['pa_tool_rack',-.4,G,.2,-PI/2]
  ]);
  hyTarget(-3.2,G,2.8,'fishery-shed');
  hyTarget(4.2,G+.06,-3.4,'lake-jetty');
 }});

/* 46b. Stone-Mushroom Pu Stilt-Cache Yard & Yak-Tallow Chandlery (seed 34325) */
defBuilding({key:'hy_pu_chandlery',name:'Stone-Mushroom Pu Cache Yard and Tallow Chandlery',seed:34325,cut:true,
 w:14.0,d:12.0,h:7.8,budget:120000,
 tags:{types:['shop','farm'],wealth:'poor',style:'bench',job:'trading'},
 note:'pair of elevated fur-larch pu store-caches on tapered basalt posts with megabreccia nezumi-gaeshi marmot baffles beside a yak-tallow chandlery',
 build(){
  /* West paved pu stilt-cache yard */
  svNoWalk(()=>box('paving',-3.6,0,.2,5.6,.06,9.8,P('paving')));
  wkPad(-3.6,.2,5.6,9.8,.06);

  /* Pair of elevated fur-larch pu caches on basalt posts with stone-mushroom marmot-baffle discs (2.0 m clear between!) */
  hyPuCache(-4.0,.06,-2.45,2.40,2.20,0,{legH:1.24,rPost:.16,boxH:1.36,rise:.74,maskMk:'kaen'});
  hyPuCache(-4.0,.06,2.05,2.30,2.10,PI/2,{legH:1.24,rPost:.16,boxH:1.36,rise:.74,maskMk:'lead'});

  /* East loess-and-larch yak-tallow chandlery & lye-soap house (x in [-1.3..+5.7]) */
  W(2.2,0,-.45,0,()=>{
   const G=.32,CW=6.6,CD=7.2,CH=3.15;
   hyPlinth(CW+.4,CD+.4,G,{stepW:2.2,stepX:-1.0});
   hyWallRing(-CW/2,-CD/2,CW/2,CD/2,G,CH,{
    mk:'loess',socle:.56,socleMk:'megabreccia',postMk:'tarwood',
    holes:{
     s:[{at:CW/2-1.0,y:0,w:1.65,h:2.48},{at:CW/2+1.45,y:.9,w:1.2,h:1.25}],
     n:[{at:CW/2,y:1.0,w:.90,h:1.02}]
    }
   });
   hyDoor(-1.0,G,CD/2,0,1.24,2.06,{lintel:'larch',maskMk:'kaen'});
   hyWindow(1.45,G+.9,CD/2,0,.98,1.04,{light:'nephrite'});
   hyWindow(0,G+1.0,-CD/2,PI,.72,.84,{light:'steel'});
   WX(0,G+CH+.24,-CD/2+.08,0,PI/2,0,()=>prism('loess',[[-CW/2+.08,0],[0,-1.48],[CW/2-.08,0]],-.06,.06,P('loess')));
   hyFormlineTympanum(0,G+CH+.25,CD/2+.04,CW-.16,1.48,0,{backMk:'loess',tertiary:'nephrite'});
   hyGaleCobbleRoof(0,G+CH+.24,0,CW+.16,CD+.18,1.60,0,{mk:'larch',gableFill:false,over:.24,overZ:.24});
   hyEavesBraid(.5,G+2.9,CD/2+.28,0,3.6,{sag:.18});
   hyInauCluster(-2.2,G+1.95,CD/2+.26,0,{scale:.64});

   /* Yak-tallow & wood-ash lye soap boiling cauldron + suspended mine/yaodong candle-dipping wheel */
   svNoWalk(()=>{
    cyl('basalt',-1.7,G,-2.0,.72,.44,P('basaltD'),12);
    cyl('iron',-1.7,G+.44,-2.0,.62,.42,P('iron'),12);
    cyl('bone',-1.7,G+.86,-2.0,.54,.04,P('bone'),12);
    /* Suspended larch candle-dipping wheel & 8 dipped yak-tallow tapers */
    pole('rope',[-1.7,G+2.35,-2.0],[-1.7,G+2.95,-2.0],.012,P('rope'),6);
    ring('larch',-1.7,G+2.32,-2.0,.46,.032,P('larchD'),0,0,0,14);
    for(let ci=0;ci<8;ci++){
     const ca=ci*TAU/8;
     cyl('bone',-1.7+Math.cos(ca)*.44,G+1.84,-2.0+Math.sin(ca)*.44,.018,.44,P('bone'),6);
    }
    /* Stacked highland yak-tallow soap cakes on north shelf */
    box('larch',1.5,G+.82,-2.9,1.6,.06,.44,P('larch'));
    for(let si=-2;si<=2;si++)box('alabaster',1.5+si*.28,G+.88,-2.9,.20,.12,.28,new THREE.Color(1,1,1));
   });
   hyKaenCrown(-1.7,G+CH+1.84,-2.0,.32,.56,4,{celadon:false,smoke:true});

   hyFurnList([
    ['pa_shop_counter',1.3,G,1.5,PI],
    ['eternian_common_weighing_scale',1.4,G,-.5,0],
    ['generic_churn',1.9,G,-1.8,-PI/2],
    ['hayrant_kaen_jar',2.3,G,.4,0,0]
   ]);
   hyTarget(-.4,G,.8,'chandlery-shop');
  });

  hyPlaidAwning(.4,3.4,4.2,4.8,0,2.45,{mk:'plaid',sag:.18});
  hyFurnList([
   ['generic_crate',-2.0,.06,4.0,0],
   ['hayrant_kaen_jar',-2.0,.06,-4.0,0,0]
  ]);
  hyTarget(-2.1,.06,3.6,'pu-cache-yard');
 }});
