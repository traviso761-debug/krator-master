// prefix: sl
// ================================================================= LAKESIDE DWELLINGS, INNS, TEAHOUSES & LEGATION (SL3 + SL1 + SL2)
// 12 defs (seeds 7101..7112): 3 poor, 3 middle, 3 rich houses, plus the Silk-Road hostel inn, lantern-pergola canal teahouse,
// and Ria Hegemony legation pavilion. Every house separates masonry/cedar compression from spider-silk tension (Hum wind-scoop
// spider-lofts, shamiyana awnings, evaporative water-trough wind-veils, catenary velaria, and hypar saddle canopies).

/* 1. Poor House I — Canal Reeler Cottage */
defBuilding({key:'sl_house_poor_reel',name:'Canal Reeler Cottage',seed:7101,cut:true,
 w:8.4,d:8.8,h:6.6,tags:{types:['dwelling-single'],wealth:'poor',style:'spider-lake',job:'weaving'},
 build(){
  const py=slPlinth(6.8,5.6,.42,{stepW:1.8,stepRun:.8});
  slWallRing(-3.1,-2.5,3.1,2.5,py,2.85,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:3.1,w:1.15,h:SL.DOOR_H}],
   e:[{at:2.5,w:1.1,y:.85,h:1.05}],
   w:[{at:2.5,w:1.1,y:.85,h:1.05}]
  }});
  slDoor(0,py,2.5,0,1.15,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar',name:'front'});
  slWindow(3.1,py+.85,0,PI/2,1.1,1.05);
  slWindow(-3.1,py+.85,0,-PI/2,1.1,1.05);
  slHipRoof(0,py+3.07,0,6.6,5.4,.95,{mk:'terracotta',over:.48});
  slSpiderLoft(0,py+3.95,-.2,2.2,2.0,1.85,{roofMk:'terracotta'});
  /* Shamiyana porch canopy shading the reeling basin on the front terrace */
  slShamiyana(-3.0,2.55,3.0,4.15,0,py+2.45,py+2.95,P('silkIndigo'),{skipBackPoles:true});
  slCocoonLantern(-2.6,py+2.4,4.0,.42,false);
  slTarget(0,py,0,'room');
  slFurnList([
   ['generic_poor_straw_bed',-1.9,py,-1.2,PI/2],
   ['spider-lake_low_table',.8,py,-.8,0],
   ['spider-lake_silk_cushion',.8,py,.1,PI,{v:1}],
   ['generic_storage_jar',2.2,py,-1.6,0],
   ['spider-lake_reeling_frame',-1.8,0,3.35,0,{setting:'outdoor'}]
  ]);
 }});

/* 2. Poor House II — Spider-Tender Loft Hut */
defBuilding({key:'sl_house_poor_keeper',name:'Spider-Tender Loft Hut',seed:7102,cut:true,
 w:8.2,d:8.4,h:7.2,tags:{types:['dwelling-single'],wealth:'poor',style:'spider-lake'},
 build(){
  const py=slPlinth(6.4,5.8,.48,{stepW:1.8,stepRun:.85});
  slWallRing(-2.9,-2.6,2.9,2.6,py,2.9,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:2.9,w:1.15,h:SL.DOOR_H}],
   n:[{at:2.9,w:1.2,y:.85,h:1.1}]
  }});
  slDoor(0,py,2.6,0,1.15,SL.DOOR_H,{frameMk:'porphyry',leafMk:'cedar'});
  slWindow(0,py+.85,-2.6,PI,1.2,1.1);
  slHipRoof(0,py+3.12,0,6.2,5.6,.9,{mk:'celadon',over:.46});
  /* Tall open-rafter Hum Spider-Loft Wind-Scoop Tower */
  slSpiderLoft(0,py+3.92,0,2.8,2.5,2.35,{roofMk:'celadon'});
  /* Evaporative silk wind-veil along east breeze side */
  slWindVeils(3.55,-2.2,3.55,2.2,0,py+2.65);
  slCocoonLantern(1.4,py+2.7,2.95,.4,false);
  slTarget(0,py,0,'room');
  slFurnList([
   ['generic_poor_bed',-1.7,py,-1.1,PI/2],
   ['spider-lake_spindle_rack',1.8,py,-1.7,0],
   ['spider-lake_low_table',.4,py,.5,0],
   ['spider-lake_silk_cushion',.4,py,1.35,PI,{v:2}],
   ['generic_basket',-2.0,py,1.4,0]
  ]);
 }});

/* 3. Poor House III — Ham-Tsek Shared Canal Tenement */
defBuilding({key:'sl_house_poor_row',name:'Ham-Tsek Shared Canal Tenement',seed:7103,cut:true,
 w:11.6,d:8.6,h:6.8,tags:{types:['dwelling-multi'],wealth:'poor',style:'ham-tsek'},
 build(){
  const py=slPlinth(10.2,5.8,.44,{stepW:2.4,stepRun:.8});
  slWallRing(-4.8,-2.6,4.8,2.6,py,2.95,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:2.4,w:1.1,h:SL.DOOR_H},{at:7.2,w:1.1,h:SL.DOOR_H}],
   e:[{at:2.6,w:1.1,y:.85,h:1.05}],
   w:[{at:2.6,w:1.1,y:.85,h:1.05}]
  }});
  /* Open arched party-wall pass so both units are walkable from front */
  slWall(0,-2.3,0,2.3,py,2.9,{mk:'plaster',holes:[{at:2.3,w:1.2,h:2.1}]});
  slDoor(-2.4,py,2.6,0,1.1,SL.DOOR_H,{frameMk:'porphyry',leafMk:'cedar'});
  slDoor(2.4,py,2.6,0,1.1,SL.DOOR_H,{frameMk:'porphyry',leafMk:'cedar'});
  slWindow(4.8,py+.85,0,PI/2,1.1,1.05);
  slWindow(-4.8,py+.85,0,-PI/2,1.1,1.05);
  slHipRoof(0,py+3.17,0,10.0,5.6,1.05,{mk:'terracotta',over:.5});
  slSpiderLoft(-2.4,py+4.1,0,2.1,1.9,1.7,{roofMk:'terracotta'});
  slSpiderLoft(2.4,py+4.1,0,2.1,1.9,1.7,{roofMk:'terracotta'});
  slShamiyana(-4.4,2.65,4.4,4.05,0,py+2.45,py+2.9,P('silkSaffron'),{skipBackPoles:true});
  slCocoonLantern(0,py+2.45,3.95,.42,false);
  slTarget(-2.4,py,0,'west unit');
  slTarget(2.4,py,0,'east unit');
  slFurnList([
   ['generic_poor_straw_bed',-3.6,py,-1.2,PI/2],
   ['generic_poor_table',-2.0,py,-.8,0],
   ['generic_poor_bed',3.5,py,-1.2,-PI/2],
   ['spider-lake_low_table',2.0,py,-.6,0],
   ['spider-lake_silk_cushion',2.0,py,.25,PI,{v:0}],
   ['generic_crate',-4.0,py,1.5,0]
  ]);
 }});

/* 4. Middle House I — Master Weaver Courtyard House */
defBuilding({key:'sl_house_mid_weaver',name:'Master Weaver Courtyard House',seed:7104,cut:true,
 w:13.2,d:12.4,h:7.6,tags:{types:['dwelling-single'],wealth:'middle',style:'spider-lake',job:'weaving'},
 build(){
  const py=slPlinth(11.6,10.2,.5,{stepW:2.4,stepRun:.95});
  /* Main north residential hall */
  slWallRing(-5.4,-4.7,5.4,-.3,py,3.2,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:5.4,w:1.45,h:SL.DOOR_H},{at:2.2,w:1.2,y:.85,h:1.15},{at:8.6,w:1.2,y:.85,h:1.15}],
   e:[{at:2.2,w:1.2,y:.85,h:1.15}],
   w:[{at:2.2,w:1.2,y:.85,h:1.15}]
  }});
  slDoor(0,py,-.3,0,1.45,SL.DOOR_H,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-3.2,py+.85,-.3,0,1.2,1.15);
  slWindow(3.2,py+.85,-.3,0,1.2,1.15);
  slWindow(5.4,py+.85,-2.5,PI/2,1.2,1.15);
  slWindow(-5.4,py+.85,-2.5,-PI/2,1.2,1.15);
  slHipRoof(0,py+3.42,-2.5,11.2,4.8,1.2,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(0,py+4.5,-2.5,3.0,2.4,2.15,{roofMk:'celadon'});
  /* South court flanked by evaporative wind-veils and shaded by an indigo-and-gold shamiyana */
  slWindVeils(-5.3,.4,-5.3,4.2,py,py+2.85);
  slWindVeils(5.3,.4,5.3,4.2,py,py+2.85);
  slShamiyana(-4.2,.3,4.2,4.3,py,py+2.95,py+3.55,P('silkIndigo'));
  slTarget(0,py,-2.5,'hall');
  slTarget(0,py,2.2,'court');
  slFurnList([
   ['spider-lake_sleeping_divan',-3.8,py,-2.6,PI/2],
   ['spider-lake_low_table',0,py,-2.8,0],
   ['spider-lake_silk_cushion',-.85,py,-2.8,PI/2,{v:0}],
   ['spider-lake_silk_cushion',.85,py,-2.8,-PI/2,{v:1}],
   ['spider-lake_drawloom',3.6,py,-2.6,0],
   ['spider-lake_spindle_rack',-1.8,py,2.2,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',2.2,py,2.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 5. Middle House II — Silk Factor Two-Storey Residence */
defBuilding({key:'sl_house_mid_factor',name:'Silk Factor Two-Storey Residence',seed:7105,cut:true,
 w:11.6,d:10.6,h:9.6,tags:{types:['dwelling-single'],wealth:'middle',style:'spider-lake',job:'trading'},
 build(){
  const py=slPlinth(9.8,8.4,.52,{stepW:2.4,stepRun:.95});
  const h1=3.2,y2=py+h1+.22,h2=2.9;
  slWallRing(-4.5,-3.8,4.5,3.8,py,h1,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:4.5,w:1.5,h:SL.DOOR_H},{at:1.6,w:1.15,y:.85,h:1.15},{at:7.4,w:1.15,y:.85,h:1.15}],
   e:[{at:3.8,w:1.2,y:.85,h:1.15}]
  }});
  slDoor(0,py,3.8,0,1.5,SL.DOOR_H,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-2.9,py+.85,3.8,0,1.15,1.15);
  slWindow(2.9,py+.85,3.8,0,1.15,1.15);
  slWindow(4.5,py+.85,0,PI/2,1.2,1.15);
  /* Interior straight stair climbing south->north on west side, upper slab cut around well */
  const st=svStair(-3.3,1.8,py,y2,PI,{w:1.0,mk:'cedar',col:P('cedar'),rail:'right'});
  svWell('floor',0,py+h1,0,8.8,.22,7.4,P('floor'),st);
  /* Second storey recessed behind a south veranda cooled by wind-veils */
  slWallRing(-4.5,-3.8,4.5,1.6,y2,h2,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:4.5,w:1.35,h:SL.DOOR_H}],
   n:[{at:4.5,w:1.3,y:.8,h:1.1}]
  }});
  slDoor(0,y2,1.6,0,1.35,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar',ajar:.7});
  slWindow(0,y2+.8,-3.8,PI,1.3,1.1);
  slWindVeils(-4.1,3.55,4.1,3.55,y2,y2+2.6);
  slHipRoof(0,y2+h2+.22,-.9,9.6,6.4,1.25,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(0,y2+h2+1.38,-.9,2.6,2.2,1.8,{roofMk:'celadon'});
  slTarget(.8,py,0,'ground hall');
  slTarget(.8,y2,-.8,'upper hall');
  slTarget(0,y2,2.6,'upper veranda');
  slFurnList([
   ['spider-lake_bolt_chest',2.6,py,-2.4,0],
   ['spider-lake_low_table',.6,py,-.8,0],
   ['spider-lake_silk_cushion',.6,py,.1,PI,{v:1}],
   ['spider-lake_tea_brazier',2.2,py,1.4,0],
   ['spider-lake_sleeping_divan',2.4,y2,-2.1,-PI/2],
   ['spider-lake_lacquer_screen',-.4,y2,-2.6,0],
   ['spider-lake_cocoon_stand',3.2,y2,2.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 6. Middle House III — Ria-Hum Scribe Pavilion House */
defBuilding({key:'sl_house_mid_scholar',name:'Ria-Hum Scribe Pavilion House',seed:7106,cut:true,
 w:12.4,d:11.4,h:7.8,tags:{types:['dwelling-single'],wealth:'middle',style:'ham-tsek',job:'scribing'},
 build(){
  const py=slPlinth(10.6,9.2,.52,{stepW:2.4,stepRun:.95});
  slWallRing(-4.6,-4.0,4.6,1.6,py,3.15,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:4.6,w:1.4,h:SL.DOOR_H},{at:1.7,w:1.15,y:.85,h:1.15},{at:7.5,w:1.15,y:.85,h:1.15}]
  }});
  slDoor(0,py,1.6,0,1.4,SL.DOOR_H,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-2.9,py+.85,1.6,0,1.15,1.15);
  slWindow(2.9,py+.85,1.6,0,1.15,1.15);
  /* SL1 Ria stone colonnade front portico along z = +4.1 */
  slColonnade(-4.6,4.1,4.6,4.1,py,3.15,{n:4});
  slHipRoof(0,py+3.37,-.9,10.2,9.2,1.25,{mk:'celadon',over:.52,lanterns:true});
  slSpiderLoft(0,py+4.52,-.9,2.8,2.4,2.1,{roofMk:'celadon'});
  slTarget(0,py,-1.2,'study');
  slTarget(0,py,2.9,'portico');
  slFurnList([
   ['spider-lake_low_table',-1.6,py,-1.6,0],
   ['generic_writing_supplies',-1.6,py+.44,-1.6,0],
   ['spider-lake_silk_cushion',-1.6,py,-.75,PI,{v:2}],
   ['spider-lake_sleeping_divan',2.8,py,-2.2,-PI/2],
   ['spider-lake_lacquer_screen',.6,py,-2.8,0],
   ['spider-lake_hum_harp',-3.0,py,2.9,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.0,py,2.9,0,{setting:'outdoor'}]
  ]);
 }});

/* 7. Rich House I — Silk-Merchant Velarium Courtyard Villa (SL1) */
defBuilding({key:'sl_house_rich_villa',name:'Silk-Merchant Velarium Villa',seed:7107,cut:true,
 w:18.6,d:17.6,h:10.2,tags:{types:['dwelling-single'],wealth:'rich',style:'spider-lake'},
 build(){
  const py=slPlinth(16.8,15.4,.62,{stepW:3.2,stepRun:1.15,topMk:'mosaic',topCol:'mosaic'});
  /* North main reception hall */
  slWallRing(-7.4,-7.1,7.4,-2.5,py,3.6,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:7.4,w:1.85,h:2.35},{at:3.0,w:1.3,y:.85,h:1.25},{at:11.8,w:1.3,y:.85,h:1.25}]
  }});
  slDoor(0,py,-2.5,0,1.85,2.35,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.4,py+.85,-2.5,0,1.3,1.25);
  slWindow(4.4,py+.85,-2.5,0,1.3,1.25);
  slHipRoof(0,py+3.82,-4.8,15.4,5.2,1.35,{mk:'celadon',over:.58,lanterns:true});
  slSpiderLoft(0,py+5.05,-4.8,3.4,2.6,2.35,{roofMk:'celadon'});
  /* East and West Ria stone colonnades framing the court + 4 Mast-Obelisks rigging a saffron & crimson catenary velarium! */
  slColonnade(-7.2,-1.8,-7.2,6.2,py,3.5,{n:4});
  slColonnade(7.2,-1.8,7.2,6.2,py,3.5,{n:4});
  const ym=slMastObelisk(-6.2,py,-1.6,8.2,0);
  slMastObelisk(6.2,py,-1.6,8.2,0);
  slMastObelisk(-6.2,py,6.4,8.2,0);
  slMastObelisk(6.2,py,6.4,8.2,0);
  slVelarium(-6.0,-1.4,6.0,6.2,ym-.3,.85,P('silkSaffron'),{pleats:6,stripe:hc(0xb42428)});
  slWindVeils(-7.8,-.8,-7.8,5.4,py,py+3.1);
  slWindVeils(7.8,-.8,7.8,5.4,py,py+3.1);
  slTarget(0,py,-4.8,'north hall');
  slTarget(0,py,2.4,'velarium court');
  slFurnList([
   ['spider-lake_sleeping_divan',-5.2,py,-4.8,PI/2],
   ['spider-lake_lacquer_screen',-2.6,py,-5.2,0],
   ['spider-lake_low_table',1.2,py,-4.8,0],
   ['generic_tea_set',1.2,py+.44,-4.8,0],
   ['spider-lake_silk_cushion',.2,py,-4.8,PI/2,{v:0}],
   ['spider-lake_silk_cushion',2.2,py,-4.8,-PI/2,{v:1}],
   ['spider-lake_bolt_chest',5.2,py,-5.6,0],
   ['spider-lake_hum_harp',-3.4,py,2.4,PI/2,{setting:'outdoor'}],
   ['spider-lake_tea_brazier',0,py,2.4,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.4,py,2.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 8. Rich House II — Noble Lotus-Saddle Pavilion Estate (SL2) */
defBuilding({key:'sl_house_rich_pavilion',name:'Noble Lotus-Saddle Pavilion Estate',seed:7108,cut:true,
 w:18.4,d:17.8,h:11.2,tags:{types:['dwelling-single'],wealth:'rich',style:'spider-lake'},
 build(){
  const py=slPlinth(13.6,13.0,.66,{stepW:3.0,stepRun:1.2,topMk:'mosaic',topCol:'mosaic'});
  slWallRing(-4.8,-4.5,4.8,4.5,py,3.4,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:4.8,w:1.8,h:2.3},{at:1.7,w:1.25,y:.85,h:1.2},{at:7.9,w:1.25,y:.85,h:1.2}],
   n:[{at:4.8,w:1.5,y:.85,h:1.25}],
   e:[{at:4.5,w:1.5,y:.85,h:1.25}],
   w:[{at:4.5,w:1.5,y:.85,h:1.25}]
  }});
  slDoor(0,py,4.5,0,1.8,2.3,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-3.1,py+.85,4.5,0,1.25,1.2);
  slWindow(3.1,py+.85,4.5,0,1.25,1.2);
  slWindow(0,py+.85,-4.5,PI,1.5,1.25);
  slWindow(4.8,py+.85,0,PI/2,1.5,1.25);
  slWindow(-4.8,py+.85,0,-PI/2,1.5,1.25);
  /* SL2 Hyperbolic-paraboloid amber-waxed silk saddle canopy on raked vermilion cedar King-Masts! */
  slHyparCanopy(0,0,7.4,7.1,py,py+4.4,py+8.9,P('silkAmber'),{mastR:.17,sag:.22});
  /* Evaporative trough wind-veils along east & west verandas */
  slWindVeils(-6.2,-3.6,-6.2,3.6,py,py+3.2);
  slWindVeils(6.2,-3.6,6.2,3.6,py,py+3.2);
  slCocoonLantern(-2.8,py+3.5,5.6,.48,true);
  slCocoonLantern(2.8,py+3.5,5.6,.48,true);
  slTarget(0,py,0,'pavilion hall');
  slFurnList([
   ['spider-lake_sleeping_divan',-2.8,py,-2.1,PI/2],
   ['spider-lake_lacquer_screen',0,py,-3.0,0],
   ['spider-lake_low_table',1.8,py,-.4,0],
   ['spider-lake_silk_cushion',1.8,py,.55,PI,{v:0}],
   ['spider-lake_silk_cushion',1.8,py,-1.35,0,{v:2}],
   ['spider-lake_tea_brazier',0,py,1.6,0],
   ['spider-lake_hum_harp',3.1,py,-2.6,-PI/4],
   ['spider-lake_cocoon_stand',-3.2,py,2.4,0]
  ]);
 }});

/* 9. Rich House III — Ham-Tsek Guildmaster Clan Manor */
defBuilding({key:'sl_house_rich_clan',name:'Ham-Tsek Guildmaster Clan Manor',seed:7109,cut:true,
 w:16.8,d:14.6,h:10.6,tags:{types:['dwelling-multi'],wealth:'rich',style:'ham-tsek'},
 build(){
  const py=slPlinth(15.0,12.2,.6,{stepW:3.2,stepRun:1.1,topMk:'mosaic',topCol:'mosaic'});
  const h1=3.4,y2=py+h1+.24,h2=3.0;
  slWallRing(-6.6,-5.4,6.6,2.4,py,h1,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:6.6,w:1.85,h:2.3},{at:2.6,w:1.3,y:.85,h:1.2},{at:10.6,w:1.3,y:.85,h:1.2}],
   e:[{at:3.9,w:1.3,y:.85,h:1.2}],
   w:[{at:3.9,w:1.3,y:.85,h:1.2}]
  }});
  slDoor(0,py,2.4,0,1.85,2.3,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.0,py+.85,2.4,0,1.3,1.2);
  slWindow(4.0,py+.85,2.4,0,1.3,1.2);
  slWindow(6.6,py+.85,-1.5,PI/2,1.3,1.2);
  slWindow(-6.6,py+.85,-1.5,-PI/2,1.3,1.2);
  slColonnade(-6.6,5.2,6.6,5.2,py,h1,{n:5});
  const st=svStair(-4.8,.8,py,y2,PI,{w:1.1,mk:'cedar',col:P('cedar'),rail:'right'});
  svWell('floor',0,py+h1,-1.7,11.8,.24,6.4,P('floor'),st);
  slWallRing(-6.2,-5.2,6.2,1.8,y2,h2,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:6.2,w:1.5,y:.8,h:1.15},{at:2.4,w:1.2,y:.8,h:1.1},{at:10.0,w:1.2,y:.8,h:1.1}]
  }});
  slWindow(0,y2+.8,1.8,0,1.5,1.15);
  slWindow(-3.8,y2+.8,1.8,0,1.2,1.1);
  slWindow(3.8,y2+.8,1.8,0,1.2,1.1);
  slHipRoof(0,y2+h2+.22,-1.7,13.0,7.6,1.35,{mk:'celadon',over:.58,lanterns:true});
  slSpiderLoft(-3.6,y2+h2+1.45,-1.7,2.6,2.2,2.1,{roofMk:'celadon'});
  slSpiderLoft(3.6,y2+h2+1.45,-1.7,2.6,2.2,2.1,{roofMk:'celadon'});
  slShamiyana(-5.4,2.5,5.4,5.1,py+h1+.42,py+h1+2.1,py+h1+2.65,P('silkCrimson'));
  slTarget(0,py,-1.5,'ground hall');
  slTarget(1.2,y2,-1.5,'upper clan gallery');
  slFurnList([
   ['spider-lake_low_table',0,py,-2.2,0],
   ['spider-lake_silk_cushion',-1.0,py,-2.2,PI/2,{v:0}],
   ['spider-lake_silk_cushion',1.0,py,-2.2,-PI/2,{v:1}],
   ['spider-lake_bolt_chest',4.6,py,-3.8,0],
   ['spider-lake_lacquer_screen',0,py,-4.2,0],
   ['spider-lake_sleeping_divan',-2.4,y2,-3.2,0],
   ['spider-lake_sleeping_divan',3.2,y2,-3.2,0],
   ['spider-lake_tea_brazier',.4,y2,-.8,0],
   ['spider-lake_cocoon_stand',-4.2,py,3.8,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',4.2,py,3.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 10. Silk-Road Lakeside Caravan Hostel Inn */
defBuilding({key:'sl_inn_caravan',name:'Silk-Road Lakeside Hostel Inn',seed:7110,cut:true,
 w:18.2,d:16.4,h:9.8,tags:{types:['inn'],wealth:'middle',style:'ham-tsek',job:'trading'},
 build(){
  const py=slPlinth(16.4,14.2,.52,{stepW:3.2,stepRun:1.0});
  const h1=3.25,y2=py+h1+.22,h2=2.85;
  /* Two-storey north lodging block + open colonnaded bale & mule court under a saffron velarium */
  slWallRing(-7.4,-6.5,7.4,-.9,py,h1,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:7.4,w:1.75,h:2.25},{at:2.8,w:1.2,h:SL.DOOR_H},{at:12.0,w:1.2,h:SL.DOOR_H}]
  }});
  slDoor(0,py,-.9,0,1.75,2.25,{frameMk:'porphyry',leafMk:'lacquer'});
  slDoor(-4.6,py,-.9,0,1.2,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  slDoor(4.6,py,-.9,0,1.2,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  const st=svStair(-6.8,-2.0,py,y2,PI/2,{w:1.0,mk:'cedar',col:P('cedar'),rail:'right'});
  svWell('floor',0,py+h1,-3.7,14.2,.22,5.0,P('floor'),st);
  slWallRing(-7.4,-6.5,7.4,-.9,y2,h2,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:3.4,w:1.2,y:.8,h:1.1},{at:7.4,w:1.4,y:.8,h:1.1},{at:11.4,w:1.2,y:.8,h:1.1}]
  }});
  slWindow(-4.0,y2+.8,-.9,0,1.2,1.1);
  slWindow(0,y2+.8,-.9,0,1.4,1.1);
  slWindow(4.0,y2+.8,-.9,0,1.2,1.1);
  slHipRoof(0,y2+h2+.22,-3.7,15.2,6.2,1.25,{mk:'terracotta',over:.55,lanterns:true});
  slMastObelisk(-6.8,py,-.2,7.8,0);
  const ym=slMastObelisk(6.8,py,-.2,7.8,0);
  slMastObelisk(-6.8,py,6.2,7.8,0);
  slMastObelisk(6.8,py,6.2,7.8,0);
  slVelarium(-6.6,0,6.6,6.0,ym-.3,.75,P('silkSaffron'),{pleats:6});
  slTarget(0,py,-3.6,'inn common room');
  slTarget(0,y2,-3.6,'upper guest rooms');
  slTarget(0,py,3.0,'caravan court');
  slFurnList([
   ['generic_poor_counter',-2.8,py,-4.8,0],
   ['spider-lake_low_table',1.2,py,-3.6,0],
   ['spider-lake_silk_cushion',1.2,py,-2.7,PI,{v:1}],
   ['generic_barrel',5.8,py,-5.2,0],
   ['spider-lake_sleeping_divan',-2.2,y2,-4.4,0],
   ['spider-lake_sleeping_divan',2.8,y2,-4.4,0],
   ['generic_trade_trough',-5.2,py,3.6,PI/2,{setting:'outdoor'}],
   ['job_bales',4.8,py,3.4,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',0,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 11. Lantern-Pergola Canal Teahouse & Wine-Hall (SL4) */
defBuilding({key:'sl_tavern_canal',name:'Lantern-Pergola Canal Teahouse',seed:7111,cut:true,
 w:15.2,d:13.6,h:7.8,tags:{types:['tavern'],wealth:'middle',style:'spider-lake',job:'brewing'},
 build(){
  const py=slPlinth(13.4,11.2,.5,{stepW:2.8,stepRun:.95});
  slWallRing(-5.8,-5.0,5.8,.4,py,3.25,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:5.8,w:1.7,h:2.25},{at:2.2,w:1.3,y:.8,h:1.2},{at:9.4,w:1.3,y:.8,h:1.2}]
  }});
  slDoor(0,py,.4,0,1.7,2.25,{frameMk:'lacquer',leafMk:'lacquer',ajar:.6});
  slWindow(-3.6,py+.8,.4,0,1.3,1.2);
  slWindow(3.6,py+.8,.4,0,1.3,1.2);
  slHipRoof(0,py+3.47,-2.3,12.2,6.0,1.2,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(0,py+4.55,-2.3,2.8,2.2,2.0,{roofMk:'celadon'});
  /* SL4 Cedar pergola parasols & glowing cocoon lanterns over the canal-facing tea deck */
  slPergola(-5.8,.6,5.8,5.1,py,3.05,{lanterns:true});
  for(const xx of [-3.6,0,3.6])slCocoonLantern(xx,py+3.0,2.8,.5,true);
  slWindVeils(-6.2,1.0,-6.2,4.8,py,py+2.8);
  slWindVeils(6.2,1.0,6.2,4.8,py,py+2.8);
  slTarget(0,py,-2.3,'wine hall');
  slTarget(0,py,2.8,'pergola tea deck');
  slFurnList([
   ['generic_poor_counter',-3.6,py,-3.8,0],
   ['generic_trade_still',4.2,py,-3.6,-PI/2],
   ['generic_barrel',4.4,py,-1.4,0],
   ['generic_keg',-4.8,py,-1.8,0],
   ['spider-lake_low_table',-2.6,py,2.8,0,{setting:'outdoor'}],
   ['generic_tea_set',-2.6,py+.44,2.8,0,{setting:'outdoor'}],
   ['spider-lake_silk_cushion',-2.6,py,3.65,PI,{v:0,setting:'outdoor'}],
   ['spider-lake_low_table',2.6,py,2.8,0,{setting:'outdoor'}],
   ['spider-lake_silk_cushion',2.6,py,3.65,PI,{v:1,setting:'outdoor'}],
   ['spider-lake_tea_brazier',0,py,2.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 12. Ria Hegemony Legation Pavilion (SL1) */
defBuilding({key:'sl_embassy_ria',name:'Ria Hegemony Legation Pavilion',seed:7112,cut:true,
 w:16.8,d:15.2,h:9.6,tags:{types:['civic','inn'],wealth:'rich',style:'spider-lake',role:'embassy'},
 build(){
  const py=slPlinth(14.8,12.8,.68,{stepW:3.4,stepRun:1.25,topMk:'mosaic',topCol:'mosaic'});
  slWallRing(-5.4,-5.0,5.4,2.2,py,3.7,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:5.4,w:1.9,h:2.4},{at:2.0,w:1.25,y:.9,h:1.3},{at:8.8,w:1.25,y:.9,h:1.3}],
   n:[{at:5.4,w:1.6,y:.9,h:1.3}]
  }});
  slDoor(0,py,2.2,0,1.9,2.4,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-3.4,py+.9,2.2,0,1.25,1.3);
  slWindow(3.4,py+.9,2.2,0,1.25,1.3);
  slWindow(0,py+.9,-5.0,PI,1.6,1.3);
  /* Surrounding red-porphyry & cream-dolomite Ria peristyle colonnade + crimson velarium forecourt */
  slColonnade(-6.8,5.6,6.8,5.6,py,3.7,{n:6});
  slColonnade(-6.8,-5.6,-6.8,2.6,py,3.7,{n:4});
  slColonnade(6.8,-5.6,6.8,2.6,py,3.7,{n:4});
  slHipRoof(0,py+3.92,-1.4,11.6,8.0,1.45,{mk:'celadon',over:.6,lanterns:true});
  const ym=slMastObelisk(-6.2,py,5.8,8.0,0);
  slMastObelisk(6.2,py,5.8,8.0,0);
  slMastObelisk(-6.2,py,2.4,8.0,0);
  slMastObelisk(6.2,py,2.4,8.0,0);
  slVelarium(-6.0,2.5,6.0,5.7,ym-.25,.55,P('silkCrimson'),{pleats:5});
  slTarget(0,py,-1.4,'envoy hall');
  slTarget(0,py,4.0,'peristyle portico');
  slFurnList([
   ['spider-lake_lacquer_screen',0,py,-3.8,0],
   ['spider-lake_low_table',0,py,-1.6,0],
   ['generic_writing_supplies',0,py+.44,-1.6,0],
   ['spider-lake_silk_cushion',-1.1,py,-1.6,PI/2,{v:0}],
   ['spider-lake_silk_cushion',1.1,py,-1.6,-PI/2,{v:0}],
   ['spider-lake_sleeping_divan',-3.6,py,-2.6,PI/2],
   ['spider-lake_bolt_chest',3.8,py,-3.6,0],
   ['spider-lake_cocoon_stand',-3.2,py,3.9,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.2,py,3.9,0,{setting:'outdoor'}]
  ]);
 }});
