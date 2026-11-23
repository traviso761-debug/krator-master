// prefix: sl
// ================================================================= MONUMENTAL CIVIC, PALACE & RELIGIOUS ARCHITECTURE (SL1 + SL2 + SL3)
// 8 defs (seeds 7201..7208): Silk-Prince Lotus-Saddle Palace, Great Hum Acoustic Sanctuary, Silk Bourse, Treaty Hall,
// Velarium Guild Plaza, Academy & Spider-Keeper Collegium, Calm-Pitch House of Healing, and Cocoon-Lantern Ancestor Shrine.

/* 13. Silk-Prince Lotus-Saddle Palace Pavilion (SL2 + SL1) */
defBuilding({key:'sl_palace_pavilion',name:'Silk-Prince Lotus-Saddle Palace',seed:7201,cut:true,
 w:26.4,d:24.8,h:15.2,budget:150000,tags:{types:['civic'],wealth:'rich',style:'spider-lake',landmark:true,role:'palace'},
 build(){
  /* Two-tier stepped cream-dolomite & imperial red-porphyry ceremonial platform */
  const p1=slPlinth(22.4,20.4,.68,{stepW:4.6,stepRun:1.35,topMk:'paving'});
  const p2=.56,yTop=p1+p2;
  svNoWalk(()=>box('porphyry',0,p1,0,17.8,.28,16.0,P('porphyry')));
  box('mosaic',0,p1+.28,0,17.4,.28,15.6,P('mosaic'));
  wkPad(0,0,17.4,15.6,yTop);
  svNoWalk(()=>{
   for(let i=0;i<3;i++){
    const za=lerp(8.9,7.8,i/3),zb=lerp(8.9,7.8,(i+1)/3);
    box('dolomite',0,p1+p2*i/3,(za+zb)/2,4.0,p2/3,Math.abs(za-zb),P('dolomite'));
   }
  });
  svStripWalk([0,p1,9.0],[0,yTop,7.7],4.0);
  /* Inner throne & audience chamber framed by Ria stone peristyle colonnades */
  slWallRing(-6.0,-5.4,6.0,4.2,yTop,4.1,{mk:'dolomite',postMk:'lacquer',holes:{
   s:[{at:6.0,w:2.2,h:2.55},{at:2.2,w:1.35,y:.95,h:1.35},{at:9.8,w:1.35,y:.95,h:1.35}],
   n:[{at:6.0,w:1.8,y:.95,h:1.4}],
   e:[{at:4.8,w:1.6,y:.95,h:1.4}],
   w:[{at:4.8,w:1.6,y:.95,h:1.4}]
  }});
  slDoor(0,yTop,4.2,0,2.2,2.55,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-3.8,yTop+.95,4.2,0,1.35,1.35);
  slWindow(3.8,yTop+.95,4.2,0,1.35,1.35);
  slWindow(0,yTop+.95,-5.4,PI,1.8,1.4);
  slWindow(6.0,yTop+.95,-.6,PI/2,1.6,1.4);
  slWindow(-6.0,yTop+.95,-.6,-PI/2,1.6,1.4);
  slColonnade(-8.2,7.2,8.2,7.2,yTop,4.1,{n:7});
  slColonnade(-8.2,-7.2,8.2,-7.2,yTop,4.1,{n:7});
  slColonnade(-8.2,-5.0,-8.2,5.0,yTop,4.1,{n:5});
  slColonnade(8.2,-5.0,8.2,5.0,yTop,4.1,{n:5});
  /* Soaring SL2 Hyperbolic-Paraboloid ("Lotus-Saddle") amber-waxed silk palace roof on raked vermilion King-Masts! */
  slHyparCanopy(0,-.3,10.2,9.4,yTop,yTop+5.4,yTop+12.2,P('silkAmber'),{mastR:.22,sag:.28,amp:.32});
  /* Sheer ivory veranda silk wind-veils & glowing cocoon lanterns */
  slWindVeils(-8.4,-4.4,-8.4,4.4,yTop,yTop+3.7);
  slWindVeils(8.4,-4.4,8.4,4.4,yTop,yTop+3.7);
  for(const xx of [-5.4,-1.8,1.8,5.4])slCocoonLantern(xx,yTop+3.95,7.4,.55,true);
  /* Raised porphyry & brocade dais inside audience hall */
  box('porphyry',0,yTop,-3.4,4.4,.22,2.4,P('porphyry'));
  box('brocade',0,yTop+.22,-3.4,4.0,.04,2.0,WHITE);
  slTarget(0,yTop,0,'audience hall');
  slTarget(0,yTop,5.8,'palace portico');
  slFurnList([
   ['spider-lake_lacquer_screen',0,yTop+.26,-4.3,0],
   ['spider-lake_low_table',0,yTop+.26,-3.1,0],
   ['spider-lake_silk_cushion',0,yTop+.26,-3.85,0,{v:0}],
   ['spider-lake_hum_harp',-4.2,yTop,-3.4,PI/4],
   ['spider-lake_hum_harp',4.2,yTop,-3.4,-PI/4],
   ['spider-lake_tea_brazier',-2.4,yTop,-.4,0],
   ['spider-lake_tea_brazier',2.4,yTop,-.4,0],
   ['spider-lake_bolt_chest',-4.4,yTop,2.2,PI/2],
   ['spider-lake_bolt_chest',4.4,yTop,2.2,-PI/2],
   ['spider-lake_cocoon_stand',-3.6,yTop,5.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.6,yTop,5.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 14. Great Hum Acoustic Sanctuary (SL2 + SL3 + SL1) */
defBuilding({key:'sl_hum_sanctuary',name:'Great Hum Acoustic Sanctuary',seed:7202,cut:true,
 w:22.4,d:22.4,h:15.6,budget:140000,tags:{types:['religious'],wealth:'rich',style:'spider-lake',job:'worship',landmark:true},
 build(){
  const py=slPlinth(18.4,18.4,.68,{stepW:3.8,stepRun:1.3,topMk:'mosaic'});
  /* Octagonal/square stone colonnade ring supporting a towering central Hum Spider-Loft resonance spire & ivory saddle canopy */
  slColonnade(-7.4,7.4,7.4,7.4,py,4.2,{n:6});
  slColonnade(-7.4,-7.4,7.4,-7.4,py,4.2,{n:6});
  slColonnade(-7.4,-5.0,-7.4,5.0,py,4.2,{n:5});
  slColonnade(7.4,-5.0,7.4,5.0,py,4.2,{n:5});
  slWallRing(-4.6,-4.6,4.6,4.6,py,3.9,{mk:'carve',postMk:'porphyry',holes:{
   s:[{at:4.6,w:2.0,h:2.45}],
   n:[{at:4.6,w:1.6,y:1.0,h:1.4}],
   e:[{at:4.6,w:1.6,y:1.0,h:1.4}],
   w:[{at:4.6,w:1.6,y:1.0,h:1.4}]
  }});
  slDoor(0,py,4.6,0,2.0,2.45,{frameMk:'porphyry',leafMk:'lacquer',ajar:.5});
  slWindow(0,py+1.0,-4.6,PI,1.6,1.4);
  slWindow(4.6,py+1.0,0,PI/2,1.6,1.4);
  slWindow(-4.6,py+1.0,0,-PI/2,1.6,1.4);
  /* Anticlastic ivory-and-saffron acoustic silk canopy + central Hum Spider-Loft resonance tower! */
  slHyparCanopy(0,0,8.6,8.6,py,py+4.8,py+9.6,P('silkIvory'),{mastR:.19,sag:.2,crown:false});
  slSpiderLoft(0,py+4.12,0,4.6,4.6,5.2,{roofMk:'celadon'});
  /* Evaporative calming water-troughs & silk louvers on 3 sides */
  slWindVeils(-8.2,-5.6,-8.2,5.6,py,py+3.8);
  slWindVeils(8.2,-5.6,8.2,5.6,py,py+3.8);
  slWindVeils(-5.6,-8.2,5.6,-8.2,py,py+3.8);
  for(const sx of [-4.2,4.2])slCocoonLantern(sx,py+4.0,7.5,.52,true);
  slTarget(0,py,0,'resonance chamber');
  slTarget(0,py,6.0,'ambulatory');
  slFurnList([
   ['spider-lake_hum_harp',0,py,-2.6,0],
   ['spider-lake_hum_harp',-2.6,py,0,PI/2],
   ['spider-lake_hum_harp',2.6,py,0,-PI/2],
   ['spider-lake_tea_brazier',0,py,.6,0],
   ['spider-lake_silk_cushion',-1.4,py,1.6,PI,{v:1}],
   ['spider-lake_silk_cushion',0,py,1.9,PI,{v:0}],
   ['spider-lake_silk_cushion',1.4,py,1.6,PI,{v:2}],
   ['spider-lake_cocoon_stand',-5.6,py,5.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',5.6,py,5.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 15. Principality Silk Bourse & Guild Hall (SL1) */
defBuilding({key:'sl_silk_bourse',name:'Principality Silk Bourse and Guild Hall',seed:7203,cut:true,
 w:21.6,d:17.2,h:11.4,tags:{types:['civic','market'],wealth:'rich',style:'spider-lake',job:'trading'},
 build(){
  const py=slPlinth(19.6,14.8,.62,{stepW:3.8,stepRun:1.15,topMk:'mosaic'});
  /* Rear stone registry vault + open colonnaded silk-weighing floor under a multi-pleat saffron/crimson velarium */
  slWallRing(-8.4,-6.8,8.4,-1.8,py,3.8,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:8.4,w:2.0,h:2.4},{at:3.4,w:1.35,y:.9,h:1.25},{at:13.4,w:1.35,y:.9,h:1.25}]
  }});
  slDoor(0,py,-1.8,0,2.0,2.4,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-5.0,py+.9,-1.8,0,1.35,1.25);
  slWindow(5.0,py+.9,-1.8,0,1.35,1.25);
  slHipRoof(0,py+4.02,-4.3,17.4,5.6,1.35,{mk:'celadon',over:.58,lanterns:true});
  slColonnade(-8.4,6.4,8.4,6.4,py,3.8,{n:7});
  slColonnade(-8.4,-1.2,-8.4,3.8,py,3.8,{n:3});
  slColonnade(8.4,-1.2,8.4,3.8,py,3.8,{n:3});
  const ym=slMastObelisk(-8.8,py,-1.0,9.4,0);
  slMastObelisk(8.8,py,-1.0,9.4,0);
  slMastObelisk(-8.8,py,6.6,9.4,0);
  slMastObelisk(8.8,py,6.6,9.4,0);
  slVelarium(-8.5,-.8,8.5,6.4,ym-.3,.95,P('silkCrimson'),{pleats:8,stripe:hc(0xe8a828)});
  for(const xx of [-5.2,0,5.2])slCocoonLantern(xx,py+3.7,6.5,.5,true);
  slTarget(0,py,-4.2,'registry vault');
  slTarget(0,py,2.6,'silk bourse floor');
  slFurnList([
   ['spider-lake_bolt_chest',-6.0,py,-5.2,0],
   ['spider-lake_bolt_chest',6.0,py,-5.2,0],
   ['generic_strongbox',-2.8,py,-5.4,0],
   ['spider-lake_low_table',0,py,-4.2,0],
   ['generic_writing_supplies',0,py+.44,-4.2,0],
   ['generic_poor_counter',-4.2,py,2.4,0,{setting:'outdoor'}],
   ['generic_poor_counter',4.2,py,2.4,0,{setting:'outdoor'}],
   ['spider-lake_spindle_rack',0,py,1.2,0,{setting:'outdoor'}],
   ['job_bales',-6.2,py,4.2,0,{setting:'outdoor'}],
   ['job_bales',6.2,py,4.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 16. Ham-Tsek Treaty & Council Pavilion (SL2 + SL1) */
defBuilding({key:'sl_treaty_hall',name:'Ham-Tsek Treaty and Council Pavilion',seed:7204,cut:true,
 w:18.2,d:16.8,h:11.6,tags:{types:['civic'],wealth:'rich',style:'ham-tsek'},
 build(){
  const py=slPlinth(14.4,13.2,.64,{stepW:3.4,stepRun:1.15,topMk:'mosaic'});
  slColonnade(-6.2,5.6,6.2,5.6,py,3.7,{n:5});
  slColonnade(-6.2,-5.6,6.2,-5.6,py,3.7,{n:5});
  slColonnade(-6.2,-3.4,-6.2,3.4,py,3.7,{n:4});
  slColonnade(6.2,-3.4,6.2,3.4,py,3.7,{n:4});
  /* Central council chamber enclosed by carved screens + operable double doors */
  slWallRing(-4.0,-3.6,4.0,3.2,py,3.3,{mk:'carve',postMk:'lacquer',holes:{
   s:[{at:4.0,w:1.85,h:2.3}]
  }});
  slDoor(0,py,3.2,0,1.85,2.3,{frameMk:'porphyry',leafMk:'lacquer',ajar:.65});
  slHyparCanopy(0,0,7.4,6.8,py,py+4.4,py+9.2,P('silkCrimson'),{mastR:.18,sag:.22});
  slCocoonLantern(-3.0,py+3.6,5.7,.48,true);
  slCocoonLantern(3.0,py+3.6,5.7,.48,true);
  slTarget(0,py,0,'council floor');
  slFurnList([
   ['spider-lake_lacquer_screen',0,py,-2.5,0],
   ['spider-lake_low_table',0,py,-.4,0],
   ['generic_writing_supplies',0,py+.44,-.4,0],
   ['spider-lake_silk_cushion',-1.2,py,-.4,PI/2,{v:0}],
   ['spider-lake_silk_cushion',1.2,py,-.4,-PI/2,{v:1}],
   ['spider-lake_silk_cushion',0,py,.7,PI,{v:2}],
   ['spider-lake_hum_harp',-2.6,py,-2.0,PI/4],
   ['spider-lake_tea_brazier',2.4,py,1.4,0]
  ]);
 }});

/* 17. Velarium Guild Plaza & Acoustic Lotus Fountain (SL1) */
defBuilding({key:'sl_guild_square',name:'Velarium Guild Plaza and Fountain',seed:7205,
 front:{x:0,z:7.6,yaw:0},
 w:17.6,d:17.6,h:10.4,tags:{types:['plaza','civic','fountain'],wealth:'rich',style:'spider-lake'},
 build(){
  const py=slPlinth(15.6,15.6,.42,{stepW:3.6,stepRun:.85,topMk:'mosaic'});
  /* Four corner notched Mast-Obelisks rigging an overhead saffron-and-ivory catenary velarium over a carved fountain */
  const ym=slMastObelisk(-6.6,py,-6.6,8.8,PI/4);
  slMastObelisk(6.6,py,-6.6,8.8,-PI/4);
  slMastObelisk(-6.6,py,6.6,8.8,3*PI/4);
  slMastObelisk(6.6,py,6.6,8.8,-3*PI/4);
  slVelarium(-6.3,-6.3,6.3,6.3,ym-.3,1.05,P('silkSaffron'),{pleats:7,stripe:hc(0xf5efe0)});
  /* Central stepped dolomite & porphyry lotus fountain basin (non-overlapping rings) */
  svNoWalk(()=>{
   cyl('dolomite',0,py,0,2.5,.18,P('dolomiteD'),16);
   cyl('porphyry',0,py+.18,0,2.25,.38,P('porphyry'),16);
   cyl('water',0,py+.56,0,1.98,.06,P('water'),16);
   cyl('dolomite',0,py+.62,0,.42,1.35,P('dolomite'),12);
   cyl('jade',0,py+1.97,0,.95,.16,P('jade'),14);
   cyl('water',0,py+2.13,0,.8,.05,P('water'),14);
   cone('bronze',0,py+2.18,0,.18,.55,P('bronze'),10);
  });
  for(const [sx,sz] of [[-4.8,-4.8],[4.8,-4.8],[-4.8,4.8],[4.8,4.8]]){
   slCocoonLantern(sx,ym-1.8,sz,.6,true);
  }
  slTarget(0,py,4.4,'plaza walk');
  slFurnList([
   ['generic_poor_bench',-4.2,py,0,PI/2,{setting:'outdoor'}],
   ['generic_poor_bench',4.2,py,0,-PI/2,{setting:'outdoor'}],
   ['spider-lake_hum_harp',0,py,-4.8,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',-3.4,py,5.2,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.4,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 18. Ria-Hum Academy & Spider-Keeper Collegium (SL3 + SL1) */
defBuilding({key:'sl_school_scriptorium',name:'Ria-Hum Academy and Collegium',seed:7206,cut:true,
 w:16.4,d:14.2,h:9.4,tags:{types:['civic'],wealth:'middle',style:'spider-lake',job:'scribing'},
 build(){
  const py=slPlinth(14.6,11.8,.54,{stepW:3.0,stepRun:1.0});
  slWallRing(-6.4,-5.2,6.4,1.8,py,3.45,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:6.4,w:1.75,h:2.25},{at:2.4,w:1.3,y:.85,h:1.2},{at:10.4,w:1.3,y:.85,h:1.2}],
   n:[{at:3.4,w:1.3,y:.85,h:1.2},{at:9.4,w:1.3,y:.85,h:1.2}]
  }});
  slDoor(0,py,1.8,0,1.75,2.25,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.0,py+.85,1.8,0,1.3,1.2);
  slWindow(4.0,py+.85,1.8,0,1.3,1.2);
  slWindow(-3.0,py+.85,-5.2,PI,1.3,1.2);
  slWindow(3.0,py+.85,-5.2,PI,1.3,1.2);
  slColonnade(-6.4,4.8,6.4,4.8,py,3.45,{n:6});
  slHipRoof(0,py+3.67,-.2,13.6,10.6,1.35,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(-3.2,py+4.9,-.2,2.8,2.4,2.3,{roofMk:'celadon'});
  slSpiderLoft(3.2,py+4.9,-.2,2.8,2.4,2.3,{roofMk:'celadon'});
  slWindVeils(-6.8,-4.2,-6.8,1.2,py,py+3.1);
  slWindVeils(6.8,-4.2,6.8,1.2,py,py+3.1);
  slTarget(0,py,-1.6,'lecture hall');
  slTarget(0,py,3.4,'scholar colonnade');
  slFurnList([
   ['spider-lake_low_table',-3.2,py,-2.4,0],
   ['generic_writing_supplies',-3.2,py+.44,-2.4,0],
   ['spider-lake_silk_cushion',-3.2,py,-1.5,PI,{v:2}],
   ['spider-lake_low_table',3.2,py,-2.4,0],
   ['generic_writing_supplies',3.2,py+.44,-2.4,0],
   ['spider-lake_silk_cushion',3.2,py,-1.5,PI,{v:1}],
   ['generic_poor_board',0,py,-4.6,0],
   ['spider-lake_hum_harp',0,py,.2,0],
   ['spider-lake_cocoon_stand',-4.4,py,3.3,0,{setting:'outdoor'}]
  ]);
 }});

/* 19. Calm-Pitch House of Healing (SL3) */
defBuilding({key:'sl_healer_pavilion',name:'Calm-Pitch House of Healing',seed:7207,cut:true,
 w:14.8,d:13.4,h:8.8,tags:{types:['civic','religious'],wealth:'middle',style:'spider-lake',job:'healing'},
 build(){
  const py=slPlinth(12.8,11.0,.52,{stepW:2.8,stepRun:.95});
  slWallRing(-5.0,-4.4,5.0,2.2,py,3.25,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:5.0,w:1.65,h:2.25},{at:1.8,w:1.2,y:.85,h:1.15},{at:8.2,w:1.2,y:.85,h:1.15}]
  }});
  slDoor(0,py,2.2,0,1.65,2.25,{frameMk:'porphyry',leafMk:'cedar'});
  slWindow(-3.2,py+.85,2.2,0,1.2,1.15);
  slWindow(3.2,py+.85,2.2,0,1.2,1.15);
  slHipRoof(0,py+3.47,-1.1,10.8,7.4,1.2,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(0,py+4.55,-1.1,3.2,2.6,2.35,{roofMk:'celadon'});
  /* Surrounding evaporative cooling water-trough wind-veils & front shamiyana porch */
  slWindVeils(-5.8,-3.8,-5.8,1.8,py,py+2.95);
  slWindVeils(5.8,-3.8,5.8,1.8,py,py+2.95);
  slShamiyana(-4.6,2.3,4.6,4.9,py,py+2.9,py+3.45,P('silkCeladon'),{skipBackPoles:true});
  slTarget(0,py,-1.0,'infirmary');
  slTarget(0,py,3.5,'cooling porch');
  slFurnList([
   ['spider-lake_sleeping_divan',-3.2,py,-2.1,PI/2],
   ['spider-lake_sleeping_divan',3.2,py,-2.1,-PI/2],
   ['generic_poor_workbench',0,py,-3.4,0],
   ['generic_medicine',-.3,py+.82,-3.4,0],
   ['generic_herb_bundles',.35,py+.82,-3.4,0],
   ['spider-lake_hum_harp',0,py,.6,0],
   ['spider-lake_tea_brazier',-2.4,py,3.5,0,{setting:'outdoor'}]
  ]);
 }});

/* 20. Cocoon-Lantern Ancestor & Silk-Shroud Shrine (SL1 + SL4) */
defBuilding({key:'sl_funerary_shrine',name:'Cocoon-Lantern Ancestor Shrine',seed:7208,cut:true,
 w:13.6,d:13.2,h:9.6,tags:{types:['religious','funerary'],wealth:'rich',style:'ham-tsek',job:'worship'},
 build(){
  const py=slPlinth(11.6,10.8,.64,{stepW:2.8,stepRun:1.15,topMk:'mosaic'});
  slWallRing(-3.8,-4.2,3.8,1.2,py,3.5,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:3.8,w:1.65,h:2.3}]
  }});
  slDoor(0,py,1.2,0,1.65,2.3,{frameMk:'porphyry',leafMk:'lacquer',ajar:.5});
  slHipRoof(0,py+3.72,-1.5,8.2,6.0,1.35,{mk:'celadon',over:.52});
  /* White raw-silk funerary velarium suspended between 4 Mast-Obelisks over the memorial forecourt */
  const ym=slMastObelisk(-5.0,py,1.4,7.8,0);
  slMastObelisk(5.0,py,1.4,7.8,0);
  slMastObelisk(-5.0,py,4.8,7.8,0);
  slMastObelisk(5.0,py,4.8,7.8,0);
  slVelarium(-4.8,1.5,4.8,4.7,ym-.25,.5,P('silkIvory'),{pleats:5});
  for(const xx of [-3.2,0,3.2])slCocoonLantern(xx,ym-1.6,3.1,.52,true);
  slTarget(0,py,-1.5,'sanctum');
  slTarget(0,py,3.1,'memorial portico');
  slFurnList([
   ['generic_trade_altar',0,py,-3.0,0],
   ['spider-lake_hum_harp',-2.2,py,-2.2,PI/4],
   ['spider-lake_hum_harp',2.2,py,-2.2,-PI/4],
   ['spider-lake_cocoon_stand',-1.8,py,0,0],
   ['spider-lake_cocoon_stand',1.8,py,0,0],
   ['spider-lake_tea_brazier',0,py,2.8,0,{setting:'outdoor'}]
  ]);
 }});
