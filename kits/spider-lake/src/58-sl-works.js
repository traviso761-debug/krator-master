// prefix: sl
// ================================================================= CANAL SILK WORKS, MARKETS & VOTH CENSUS TRADES (SL4 + SL1 + SL3)
// 16 defs (seeds 7301..7316): open-air copper silk-reeling market, canal dye-house with twin 16 m drying-towers draping 19.2 m
// catenary dyed silk bolts over flowing canal water, brocade drawloom hall, pergola market stalls, lacquerer shophouse, spindle
// smithy, celadon kiln, bakehouse, smokehouse, amber-wax yard, mast-wright yard, silk godown, watermill/granary, mulberry farm,
// stock byre/pens, and dolomite/nephrite quarry-mine linked to kits/resources.

/* 21. Open-Air Copper Silk-Reeling Market (SL1 + SL4) */
defBuilding({key:'sl_reeling_market',name:'Open-Air Copper Silk-Reeling Market',seed:7301,
 front:{x:0,z:6.4,yaw:0},
 w:18.8,d:14.4,h:10.2,tags:{types:['market','industry'],wealth:'middle',style:'spider-lake',job:'weaving'},
 build(){
  const py=slPlinth(17.0,12.2,.48,{stepW:3.4,stepRun:.9});
  /* Open Ria stone colonnades flanking rows of copper reeling basins under a pleated saffron velarium */
  slColonnade(-7.4,5.2,7.4,5.2,py,3.6,{n:6});
  slColonnade(-7.4,-5.2,7.4,-5.2,py,3.6,{n:6});
  const ym=slMastObelisk(-7.8,py,-5.4,8.6,0);
  slMastObelisk(7.8,py,-5.4,8.6,0);
  slMastObelisk(-7.8,py,5.4,8.6,0);
  slMastObelisk(7.8,py,5.4,8.6,0);
  slVelarium(-7.5,-5.2,7.5,5.2,ym-.3,.85,P('silkSaffron'),{pleats:7,stripe:hc(0xf5efe0)});
  for(const xx of [-4.5,0,4.5]){
   slCocoonLantern(xx,py+3.5,5.2,.45,false);
   smokeAt(xx,py+1.1,-1.8,{r:.18,kind:'steam'});
  }
  slTarget(0,py,0,'reeling floor');
  slFurnList([
   ['spider-lake_reeling_frame',-4.6,py,-1.8,0,{setting:'outdoor'}],
   ['spider-lake_reeling_frame',0,py,-1.8,0,{setting:'outdoor'}],
   ['spider-lake_reeling_frame',4.6,py,-1.8,0,{setting:'outdoor'}],
   ['spider-lake_reeling_frame',-3.0,py,2.0,PI,{setting:'outdoor'}],
   ['spider-lake_reeling_frame',3.0,py,2.0,PI,{setting:'outdoor'}],
   ['spider-lake_spindle_rack',-6.2,py,0,PI/2,{setting:'outdoor'}],
   ['spider-lake_spindle_rack',6.2,py,0,-PI/2,{setting:'outdoor'}],
   ['generic_basket',0,py,2.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 22. Canal Dye-Works & 20 m Hanging Silk-Streamer Towers (SL4) */
defBuilding({key:'sl_dyehouse_canal',name:'Canal Dye-Works and Streamer Towers',seed:7302,cut:true,
 w:25.6,d:16.8,h:16.4,budget:130000,tags:{types:['industry'],wealth:'middle',style:'spider-lake',job:'dyeing',landmark:true},
 build(){
  /* Stone quay banks north and south of an east-west canal channel, connected by a flagged stone footbridge */
  box('dolomite',0,0,-4.8,23.6,.56,5.8,P('dolomiteD'));
  box('paving',0,.56,-4.8,23.2,.08,5.5,P('paving'));
  wkPad(0,-4.8,23.2,5.5,.64);
  box('dolomite',0,0,4.8,23.6,.56,5.4,P('dolomiteD'));
  box('paving',0,.56,4.8,23.2,.08,5.1,P('paving'));
  wkPad(0,4.8,23.2,5.1,.64);
  /* Entrance steps up onto south quay + stone footbridge spanning the canal at x = 0 */
  svNoWalk(()=>{
   for(let i=0;i<3;i++)box('dolomite',0,.64*i/3,7.9-.28*i,3.0,.64/3,.28,P('dolomite'));
   for(const sx of [-1.4,1.4])box('porphyry',sx,.64,0,.22,.72,4.0,P('porphyry'));
  });
  svStripWalk([0,0,8.1],[0,.64,7.1],3.0);
  box('dolomite',0,.52,0,3.2,.18,4.1,P('dolomite'));
  wkPad(0,0,2.8,4.2,.7);
  /* Register flowing canal river in world space so 91z-sl-world.js draws WATER.drawFlow! */
  if(CURREC&&!PLACE_DRY){
   const a=svW(-11.8,.18,0),b=svW(11.8,.18,0);
   CURREC.river={name:'dyehouse_canal',pts:[[a[0],a[2],a[1]],[b[0],b[2],b[1]]],width:3.4,speed:.9};
  }
  const py=.64;
  /* North dye-vat workshop */
  slWallRing(-5.2,-7.1,5.2,-2.6,py,3.25,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:5.2,w:1.65,h:2.2}],
   e:[{at:2.25,w:1.2,y:.85,h:1.1}],
   w:[{at:2.25,w:1.2,y:.85,h:1.1}]
  }});
  slDoor(0,py,-2.6,0,1.65,2.2,{frameMk:'porphyry',leafMk:'cedar',ajar:.6});
  slWindow(5.2,py+.85,-4.85,PI/2,1.2,1.1);
  slWindow(-5.2,py+.85,-4.85,-PI/2,1.2,1.1);
  slHipRoof(0,py+3.47,-4.85,11.0,5.1,1.15,{mk:'terracotta',over:.5});
  smokeAt(-3.4,py+4.5,-5.4,{r:.24,kind:'steam'});
  /* Twin 15.2 m open-frame lacquered cedar Drying-Towers at x = -9.6 and x = +9.6! */
  for(const tx of [-9.6,9.6]){
   W(tx,py,4.4,0,()=>{
    for(const sx of [-1.35,1.35])for(const sz of [-1.25,1.25]){
     box('dolomite',sx,0,sz,.36,.32,.36,P('dolomiteD'));
     box('lacquer',sx,.32,sz,.2,14.2,.2,P('lacquer'));
    }
    svNoWalk(()=>{
     for(const yy of [4.2,8.2,11.8,14.3]){
      for(const sz of [-1.25,1.25])box('cedar',0,yy,sz,2.9,.14,.14,P('cedar'));
      for(const sx of [-1.35,1.35])box('cedar',sx,yy+.14,0,.14,.14,2.7,P('cedarD'));
     }
    });
    slHipRoof(0,14.66,0,3.2,3.0,.75,{mk:'terracotta',over:.42});
   });
  }
  /* FOUR 19.2 m CATENARY DYED SPIDER-SILK STREAMERS draped high between the twin drying-towers over the canal! */
  slSilkBolt([-9.6,py+14.1,3.5],[9.6,py+14.1,3.5],.95,3.2,P('silkCrimson'));
  slSilkBolt([-9.6,py+13.6,4.4],[9.6,py+13.6,4.4],.95,3.6,P('silkSaffron'));
  slSilkBolt([-9.6,py+13.1,5.3],[9.6,py+13.1,5.3],.95,3.9,P('silkIndigo'));
  slSilkBolt([-9.6,py+11.4,3.8],[9.6,py+11.4,3.8],.95,2.9,P('silkTurquoise'));
  /* Vertical hanging 13 m dyed silk bolts inside each drying-tower */
  for(const [tx,col] of [[-9.6,P('silkCrimson')],[9.6,P('silkSaffron')]]){
   W(tx,py,4.4,0,()=>{
    svNoWalk(()=>{
     withCloth((lp,out)=>{
      const v=clamp((13.8-lp.y)/12.6,0,1),pw=slSilkMath.hangPin(v)*.36;
      out.set(pw*.25,0,pw);
     },()=>{
      psurf('streamer',(u,v)=>[(u-.5)*.9,13.8-v*12.6,.04*Math.sin(PI*u)*v],4,14,col,{flip:true});
     });
    });
   });
  }
  for(const xx of [-5.2,0,5.2])slCocoonLantern(xx,py+2.8,2.6,.42,true);
  slTarget(0,py,4.8,'south canal quay');
  slTarget(0,py,-4.8,'dye hall');
  slFurnList([
   ['spider-lake_dye_vat',-3.2,py,-4.8,0,{v:0}],
   ['spider-lake_dye_vat',0,py,-5.2,0,{v:1}],
   ['spider-lake_dye_vat',3.2,py,-4.8,0,{v:2}],
   ['spider-lake_dye_vat',-4.2,py,4.8,0,{v:0,setting:'outdoor'}],
   ['spider-lake_dye_vat',4.2,py,4.8,0,{v:2,setting:'outdoor'}],
   ['spider-lake_spindle_rack',-6.6,py,4.8,0,{setting:'outdoor'}],
   ['spider-lake_bolt_chest',6.6,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 23. Brocade Drawloom Hall (SL3) */
defBuilding({key:'sl_weaver_hall',name:'Brocade Drawloom Hall',seed:7303,cut:true,
 w:16.8,d:12.6,h:8.8,tags:{types:['industry'],wealth:'middle',style:'spider-lake',job:'weaving'},
 build(){
  const py=slPlinth(15.0,10.4,.5,{stepW:3.0,stepRun:.95});
  slWallRing(-6.8,-4.6,6.8,4.6,py,3.55,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:6.8,w:1.8,h:2.3},{at:2.6,w:1.4,y:.85,h:1.3},{at:11.0,w:1.4,y:.85,h:1.3}],
   n:[{at:3.2,w:1.5,y:.85,h:1.35},{at:10.4,w:1.5,y:.85,h:1.35}]
  }});
  slDoor(0,py,4.6,0,1.8,2.3,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.2,py+.85,4.6,0,1.4,1.3);
  slWindow(4.2,py+.85,4.6,0,1.4,1.3);
  slWindow(-3.6,py+.85,-4.6,PI,1.5,1.35);
  slWindow(3.6,py+.85,-4.6,PI,1.5,1.35);
  slHipRoof(0,py+3.77,0,14.2,9.8,1.3,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(-3.4,py+4.95,0,2.8,2.4,2.2,{roofMk:'celadon'});
  slSpiderLoft(3.4,py+4.95,0,2.8,2.4,2.2,{roofMk:'celadon'});
  slTarget(0,py,0,'loom floor');
  slFurnList([
   ['spider-lake_drawloom',-4.4,py,-2.0,0],
   ['spider-lake_drawloom',0,py,-2.0,0],
   ['spider-lake_drawloom',4.4,py,-2.0,0],
   ['spider-lake_spindle_rack',-5.2,py,2.2,PI/2],
   ['spider-lake_spindle_rack',5.2,py,2.2,-PI/2],
   ['spider-lake_bolt_chest',-2.4,py,2.6,PI],
   ['spider-lake_bolt_chest',2.4,py,2.6,PI]
  ]);
 }});

/* 24. Pergola Silk & Spice Market Row (SL4 + SL3) */
defBuilding({key:'sl_market_stalls',name:'Pergola Silk and Spice Market Row',seed:7304,
 front:{x:0,z:4.8,yaw:0},
 w:16.4,d:10.6,h:6.2,tags:{types:['market','shop'],wealth:'middle',style:'ham-tsek',job:'trading',market:true},
 build(){
  const py=slPlinth(14.8,8.4,.36,{stepW:3.2,stepRun:.7});
  slPergola(-6.8,-3.6,-.6,3.6,py,3.1,{lanterns:true});
  slPergola(.6,-3.6,6.8,3.6,py,3.1,{lanterns:true});
  slShamiyana(-3.2,-3.2,3.2,3.2,py+3.25,py+3.85,py+4.45,P('silkCrimson'));
  slTarget(0,py,0,'market aisle');
  slFurnList([
   ['generic_trade_stall',-3.8,py,-1.4,0,{setting:'outdoor'}],
   ['generic_trade_stall',3.8,py,-1.4,0,{setting:'outdoor'}],
   ['spider-lake_bolt_chest',-5.2,py,1.6,PI/2,{setting:'outdoor'}],
   ['spider-lake_bolt_chest',5.2,py,1.6,-PI/2,{setting:'outdoor'}],
   ['generic_spice_box',-3.8,py+.88,-1.4,0,{setting:'outdoor'}],
   ['generic_bread_basket',3.8,py+.88,-1.4,0,{setting:'outdoor'}],
   ['spider-lake_spindle_rack',0,py,-2.2,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',0,py,2.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 25. Lacquerer, Scribe & Mercer Shophouse */
defBuilding({key:'sl_shophouse_lacquer',name:'Lacquerer and Mercer Shophouse',seed:7305,cut:true,
 w:10.8,d:11.6,h:9.4,tags:{types:['shop','industry'],wealth:'middle',style:'ham-tsek',job:'trading'},
 build(){
  const py=slPlinth(9.0,9.4,.48,{stepW:2.4,stepRun:.9});
  const h1=3.2,y2=py+h1+.22,h2=2.85;
  slWallRing(-4.1,-4.3,4.1,2.5,py,h1,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:4.1,w:1.6,h:2.2},{at:1.4,w:1.15,y:.85,h:1.15},{at:6.8,w:1.15,y:.85,h:1.15}]
  }});
  slDoor(0,py,2.5,0,1.6,2.2,{frameMk:'lacquer',leafMk:'lacquer',ajar:.65});
  slWindow(-2.7,py+.85,2.5,0,1.15,1.15);
  slWindow(2.7,py+.85,2.5,0,1.15,1.15);
  const st=svStair(-2.9,.6,py,y2,PI,{w:.95,mk:'cedar',col:P('cedar'),rail:'right'});
  svWell('floor',0,py+h1,-.9,7.8,.22,6.4,P('floor'),st);
  slWallRing(-4.1,-4.3,4.1,2.5,y2,h2,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:4.1,w:1.4,y:.8,h:1.15}]
  }});
  slWindow(0,y2+.8,2.5,0,1.4,1.15);
  slHipRoof(0,y2+h2+.22,-.9,8.8,7.4,1.15,{mk:'terracotta',over:.52,lanterns:true});
  slShamiyana(-3.9,2.6,3.9,4.4,py,py+2.75,py+3.25,P('silkSaffron'),{skipBackPoles:true});
  slTarget(.6,py,-.8,'shop');
  slTarget(.8,y2,-1.2,'living loft');
  slFurnList([
   ['generic_poor_counter',1.4,py,.2,0],
   ['spider-lake_bolt_chest',2.4,py,-2.8,0],
   ['spider-lake_lacquer_screen',-1.2,py,-3.4,0],
   ['spider-lake_sleeping_divan',2.0,y2,-2.2,-PI/2],
   ['spider-lake_low_table',-.4,y2,-1.6,0],
   ['spider-lake_cocoon_stand',-3.0,py,3.5,0,{setting:'outdoor'}]
  ]);
 }});

/* 26. Bronze-Sheave & Spindle Smithy */
defBuilding({key:'sl_smithy_spindle',name:'Bronze-Sheave and Spindle Smithy',seed:7306,cut:true,
 w:12.4,d:11.2,h:7.6,tags:{types:['industry'],wealth:'middle',style:'ham-tsek',job:'smithing'},
 build(){
  const py=slPlinth(10.8,9.2,.44,{stepW:2.6,stepRun:.85});
  slWallRing(-4.8,-4.1,1.6,3.6,py,3.2,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:3.2,w:1.5,h:2.2}],
   e:[{at:3.85,w:1.6,h:2.2}]
  }});
  slDoor(-1.6,py,3.6,0,1.5,2.2,{frameMk:'porphyry',leafMk:'cedar',ajar:.7});
  slDoor(1.6,py,-.25,PI/2,1.6,2.2,{open:true});
  slHipRoof(-1.6,py+3.42,-.25,7.0,8.2,1.15,{mk:'terracotta',over:.5});
  /* Stone forge chimney stack + open east pergola anvil bay */
  box('porphyry',-3.8,py+3.42,-2.8,1.2,2.1,1.2,P('porphyry'));
  box('dolomite',-3.8,py+5.52,-2.8,1.36,.18,1.36,P('dolomite'));
  smokeAt(-3.8,py+5.85,-2.8,{r:.28,kind:'fire'});
  slPergola(1.8,-3.8,5.0,3.6,py,3.0,{lanterns:true});
  slTarget(-1.4,py,0,'forge room');
  slTarget(3.4,py,0,'anvil yard');
  slFurnList([
   ['generic_trade_forge',-3.4,py,-2.4,PI/2],
   ['generic_trade_anvil',-1.2,py,-1.2,0],
   ['generic_trade_grindstone',3.4,py,-2.0,0,{setting:'outdoor'}],
   ['generic_trade_trough',3.4,py,1.4,PI/2,{setting:'outdoor'}],
   ['generic_poor_rack',-.6,py,-3.5,0],
   ['generic_fuel',-3.6,py,1.8,0]
  ]);
 }});

/* 27. Celadon & Terracotta Kiln-Yard */
defBuilding({key:'sl_potter_kiln',name:'Celadon and Terracotta Kiln-Yard',seed:7307,cut:true,
 w:14.2,d:12.2,h:7.2,tags:{types:['industry'],wealth:'middle',style:'spider-lake',job:'pottery'},
 build(){
  const py=slPlinth(12.4,10.0,.42,{stepW:2.6,stepRun:.8});
  /* West throwing workshop + east stepped climbing celadon kiln */
  slWallRing(-5.6,-4.2,.2,3.6,py,3.05,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:2.9,w:1.45,h:SL.DOOR_H}],
   e:[{at:3.9,w:1.3,y:.85,h:1.1}]
  }});
  slDoor(-2.7,py,3.6,0,1.45,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  slWindow(.2,py+.85,-.3,PI/2,1.3,1.1);
  slHipRoof(-2.7,py+3.27,-.3,6.4,8.2,1.05,{mk:'celadon',over:.48});
  /* Stepped terracotta & stone climbing kiln on east half (clean non-overlapping vaults) */
  svNoWalk(()=>{
   for(let i=0;i<3;i++){
    const zz=2.2-i*2.1,yy=py+i*.34;
    box('dolomite',3.4,py,zz,3.0,.34+i*.34,1.95,P('dolomiteD'));
    cyl('terracotta',3.4,yy+.34,zz,1.15,.95,P('terracotta'),12,.88);
   }
   cyl('porphyry',3.4,py+1.02,-2.9,.42,2.4,P('porphyry'),10);
   sph('glow',3.4,py+.48,3.05,.18,0xff7a28,.8,8);
  });
  haloAt(3.4,py+.55,3.1,0xff8230,true);
  smokeAt(3.4,py+3.6,-2.9,{r:.3,kind:'fire'});
  slShamiyana(1.4,1.8,5.4,4.5,py+1.4,py+3.2,py+3.7,P('silkSaffron'));
  slTarget(-2.7,py,0,'wheel room');
  slTarget(1.4,py,3.4,'kiln yard');
  slFurnList([
   ['generic_poor_workbench',-3.8,py,-2.2,PI/2],
   ['generic_storage_jar',-1.4,py,-2.8,0],
   ['generic_barrel',-4.2,py,1.6,0],
   ['spider-lake_tea_brazier',-1.4,py,-.4,0],
   ['generic_crate',1.5,py,3.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 28. Lakeside Rice-Bread & Pastry Bakehouse */
defBuilding({key:'sl_bakery',name:'Lakeside Rice-Bread Bakehouse',seed:7308,cut:true,
 w:11.8,d:10.8,h:7.4,tags:{types:['industry','shop'],wealth:'middle',style:'spider-lake',job:'baking'},
 build(){
  const py=slPlinth(10.0,8.6,.44,{stepW:2.4,stepRun:.85});
  slWallRing(-4.5,-3.8,4.5,2.4,py,3.1,{mk:'plaster',postMk:'lacquer',holes:{
   s:[{at:4.5,w:1.5,h:SL.DOOR_H},{at:1.6,w:1.15,y:.85,h:1.1}]
  }});
  slDoor(0,py,2.4,0,1.5,SL.DOOR_H,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-2.9,py+.85,2.4,0,1.15,1.1);
  slHipRoof(0,py+3.32,-.7,9.6,6.8,1.1,{mk:'terracotta',over:.5});
  box('porphyry',2.8,py+3.32,-2.4,1.0,1.9,1.0,P('porphyry'));
  smokeAt(2.8,py+5.35,-2.4,{r:.24,kind:'fire'});
  slShamiyana(-4.2,2.5,4.2,4.1,py,py+2.65,py+3.15,P('silkSaffron'),{skipBackPoles:true});
  slTarget(0,py,-.6,'bakehouse');
  slFurnList([
   ['generic_poor_hearth',2.6,py,-2.2,-PI/2],
   ['generic_poor_counter',-2.0,py,.6,0],
   ['generic_bread_basket',-2.0,py+.88,.6,0],
   ['generic_pastries',-1.2,py+.88,.6,0],
   ['generic_trade_bin',-3.2,py,-2.4,0],
   ['generic_sack',3.2,py,.8,0]
  ]);
 }});

/* 29. Waterfront Smokehouse & Butcher */
defBuilding({key:'sl_butcher_smoke',name:'Waterfront Smokehouse and Butcher',seed:7309,cut:true,
 w:11.6,d:10.6,h:7.8,tags:{types:['industry','shop'],wealth:'middle',style:'ham-tsek',job:'butchery'},
 build(){
  const py=slPlinth(9.8,8.4,.44,{stepW:2.4,stepRun:.85});
  slWallRing(-4.4,-3.6,4.4,2.6,py,3.05,{mk:'dolomite',postMk:'cedar',holes:{
   s:[{at:4.4,w:1.5,h:SL.DOOR_H},{at:7.3,w:1.1,y:.85,h:1.1}]
  }});
  slDoor(0,py,2.6,0,1.5,SL.DOOR_H,{frameMk:'porphyry',leafMk:'cedar'});
  slWindow(2.9,py+.85,2.6,0,1.1,1.1);
  slHipRoof(0,py+3.27,-.5,9.4,6.8,1.05,{mk:'terracotta',over:.5});
  slSpiderLoft(-2.2,py+4.22,-.5,2.4,2.0,2.1,{roofMk:'terracotta'});
  smokeAt(-2.2,py+6.5,-.5,{r:.22,kind:'fire'});
  slPergola(-4.2,2.7,4.2,4.1,py,2.7,{lanterns:true});
  slTarget(0,py,-.5,'cutting hall');
  slFurnList([
   ['generic_poor_workbench',1.8,py,-1.6,0],
   ['generic_cured_meat',1.8,py+.82,-1.6,0],
   ['generic_poor_fire',-2.4,py,-1.8,0],
   ['job_fish_tray',-2.4,py,3.3,0,{setting:'outdoor'}],
   ['generic_barrel',3.2,py,1.0,0]
  ]);
 }});

/* 30. Amber-Wax & Silk-Proofing Tannery Yard */
defBuilding({key:'sl_tannery_resin',name:'Amber-Wax and Silk-Proofing Yard',seed:7310,cut:true,
 w:14.4,d:12.4,h:7.2,tags:{types:['industry'],wealth:'poor',style:'ham-tsek',job:'tanning'},
 build(){
  const py=slPlinth(12.6,10.2,.4,{stepW:2.6,stepRun:.8});
  slWallRing(-5.6,-4.5,.4,1.2,py,2.95,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:3.0,w:1.4,h:SL.DOOR_H}]
  }});
  slDoor(-2.6,py,1.2,0,1.4,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  slHipRoof(-2.6,py+3.17,-1.65,6.6,6.3,1.0,{mk:'terracotta',over:.48});
  slPergola(1.0,-4.2,5.8,4.2,py,2.95,{lanterns:true});
  /* Stretched amber-waxed silk proofing sheet in east yard */
  slSilkBolt([1.6,py+2.4,-2.4],[5.2,py+2.4,-2.4],1.2,.25,P('silkAmber'));
  slTarget(-2.6,py,-1.6,'resin shed');
  slTarget(3.4,py,1.2,'proofing yard');
  slFurnList([
   ['generic_trade_vat',-4.0,py,-2.4,0],
   ['generic_trade_vat',3.2,py,.8,0,{setting:'outdoor'}],
   ['spider-lake_dye_vat',3.2,py,2.8,0,{v:1,setting:'outdoor'}],
   ['generic_poor_rack',-1.2,py,-3.2,0],
   ['generic_barrel',-4.2,py,2.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 31. Cedar Mast & Loom-Wright Carpenter Yard */
defBuilding({key:'sl_carpenter_yard',name:'Cedar Mast and Loom-Wright Yard',seed:7311,cut:true,
 w:15.4,d:12.2,h:7.4,tags:{types:['industry'],wealth:'middle',style:'spider-lake',job:'carpentry'},
 build(){
  const py=slPlinth(13.6,10.0,.42,{stepW:2.8,stepRun:.8});
  slWallRing(-6.2,-4.4,1.2,2.2,py,3.15,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:3.7,w:1.65,h:2.2}],
   e:[{at:3.3,w:1.5,h:2.15}]
  }});
  slDoor(-2.5,py,2.2,0,1.65,2.2,{frameMk:'lacquer',leafMk:'cedar',ajar:.6});
  slDoor(1.2,py,-1.1,PI/2,1.5,2.15,{open:true});
  slHipRoof(-2.5,py+3.37,-1.1,8.0,7.2,1.1,{mk:'terracotta',over:.5});
  slPergola(1.6,-4.2,6.2,4.2,py,3.05,{lanterns:true});
  /* Turned vermilion-lacquered King-Mast blank resting on timber trestles in east yard */
  svNoWalk(()=>{
   for(const zz of [-2.4,2.2]){
    box('cedar',4.0,py,zz,1.1,.68,.2,P('cedarD'));
   }
   beam('lacquer',[4.0,py+.84,-3.4],[4.0,py+.84,3.2],.15,P('lacquer'),true,10,.12);
  });
  slTarget(-2.5,py,-1.0,'joinery shop');
  slTarget(2.6,py,1.5,'saw yard');
  slFurnList([
   ['job_saw_bench',-4.2,py,-1.8,0],
   ['generic_poor_workbench',-.8,py,-2.8,0],
   ['job_plank_stack',3.8,py,3.4,0,{setting:'outdoor'}],
   ['job_pole_rack',-4.8,py,3.4,0,{setting:'outdoor'}],
   ['generic_poor_rack',-2.5,py,-3.7,0]
  ]);
 }});

/* 32. Vaulted Silk-Bale Godown Warehouse (SL1) */
defBuilding({key:'sl_warehouse_silk',name:'Vaulted Silk-Bale Godown',seed:7312,cut:true,
 w:17.2,d:13.8,h:9.6,tags:{types:['infrastructure','industry'],wealth:'rich',style:'spider-lake',job:'warehousing'},
 build(){
  const py=slPlinth(15.4,11.6,.6,{stepW:3.2,stepRun:1.1});
  slWallRing(-6.8,-5.0,6.8,1.8,py,3.8,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:6.8,w:2.1,h:2.45},{at:2.4,w:1.0,y:1.6,h:.85},{at:11.2,w:1.0,y:1.6,h:.85}]
  }});
  slDoor(0,py,1.8,0,2.1,2.45,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.4,py+1.6,1.8,0,1.0,.85);
  slWindow(4.4,py+1.6,1.8,0,1.0,.85);
  slHipRoof(0,py+4.02,-1.6,14.4,7.6,1.4,{mk:'celadon',over:.55});
  /* Shaded loading bay under a crimson catenary velarium */
  const ym=slMastObelisk(-6.4,py,2.0,7.8,0);
  slMastObelisk(6.4,py,2.0,7.8,0);
  slMastObelisk(-6.4,py,5.2,7.8,0);
  slMastObelisk(6.4,py,5.2,7.8,0);
  slVelarium(-6.2,2.1,6.2,5.1,ym-.25,.55,P('silkCrimson'),{pleats:6});
  slTarget(0,py,-1.6,'vault');
  slTarget(0,py,3.6,'loading dock');
  slFurnList([
   ['job_bales',-4.6,py,-3.0,0],
   ['job_bales',4.6,py,-3.0,0],
   ['spider-lake_bolt_chest',-4.6,py,-.4,PI/2],
   ['spider-lake_bolt_chest',4.6,py,-.4,-PI/2],
   ['generic_crate',-2.0,py,-3.4,0],
   ['generic_barrel',2.2,py,-3.4,0],
   ['job_bales',-3.8,py,3.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',3.8,py,3.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 33. Weir-Channel Watermill & Raised Granary */
defBuilding({key:'sl_granary_mill',name:'Weir-Channel Watermill and Granary',seed:7313,cut:true,
 w:15.6,d:12.6,h:8.8,tags:{types:['farm','industry','infrastructure'],wealth:'middle',style:'ham-tsek',job:'milling'},
 build(){
  const py=slPlinth(13.6,10.2,.52,{stepW:2.8,stepRun:.95});
  /* West millhouse with stone millrace & spoked cedar waterwheel */
  slWallRing(-5.8,-4.2,.8,3.2,py,3.25,{mk:'dolomite',postMk:'cedar',holes:{
   s:[{at:3.3,w:1.5,h:2.2}],
   n:[{at:3.3,w:1.2,y:.9,h:1.1}]
  }});
  slDoor(-2.5,py,3.2,0,1.5,2.2,{frameMk:'porphyry',leafMk:'cedar'});
  slWindow(-2.5,py+.9,-4.2,PI,1.2,1.1);
  slHipRoof(-2.5,py+3.47,-.5,7.2,8.0,1.15,{mk:'terracotta',over:.5});
  /* Spoked cedar waterwheel on west outer face x = -6.45 */
  svNoWalk(()=>{
   box('dolomite',-6.55,0,-.5,.75,.55,5.6,P('dolomiteD'));
   box('water',-6.55,.55,-.5,.5,.08,5.2,P('water'));
   W(-6.35,py+1.65,-.5,0,()=>{
    ring('cedar',0,0,0,1.65,.1,P('cedar'),0,0,PI/2,18);
    ring('lacquer',0,0,0,1.15,.07,P('lacquer'),0,0,PI/2,16);
    pole('bronze',[-.35,0,0],[.55,0,0],.12,P('bronze'),10);
    for(let i=0;i<8;i++){
     const a=i*TAU/8;
     beam('cedar',[0,0,0],[0,Math.cos(a)*1.65,Math.sin(a)*1.65],.07,P('cedarD'),false);
    }
   });
  });
  /* East ventilated cedar granary pavilion */
  slWallRing(1.8,-3.6,5.8,2.6,py,2.95,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:2.0,w:1.3,h:SL.DOOR_H}]
  }});
  slDoor(3.8,py,2.6,0,1.3,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  slHipRoof(3.8,py+3.17,-.5,4.6,6.8,1.0,{mk:'celadon',over:.48});
  slSpiderLoft(3.8,py+4.08,-.5,2.2,2.0,1.8,{roofMk:'celadon'});
  slTarget(-2.5,py,-.5,'mill floor');
  slTarget(3.8,py,-.5,'granary');
  slFurnList([
   ['generic_trade_bin',-4.2,py,-2.4,PI/2],
   ['generic_sack',-1.0,py,-2.6,0],
   ['generic_trade_bin',3.8,py,-2.2,0],
   ['generic_poor_store',3.8,py,.4,0],
   ['job_winnowing_mat',0,py,4.0,0,{setting:'outdoor'}]
  ]);
 }});

/* 34. Lakeside Mulberry, Chinampa & Reed-Bed Farmstead */
defBuilding({key:'sl_mulberry_farm',name:'Lakeside Mulberry and Chinampa Stead',seed:7314,cut:true,
 w:16.4,d:13.8,h:7.2,tags:{types:['farm'],wealth:'poor',style:'spider-lake',job:'farming'},
 build(){
  /* Raised farmhouse on west + irrigated stone-kerbed chinampa/mulberry raised beds on east */
  const py=.38;
  box('dolomite',-4.2,0,-1.2,7.2,py,8.4,P('dolomiteD'));
  wkPad(-4.2,-1.2,7.2,8.4,py);
  svNoWalk(()=>{
   for(let i=0;i<2;i++)box('dolomite',-4.2,py*i/2,3.4-.3*i,2.0,py/2,.3,P('dolomite'));
  });
  svStripWalk([-4.2,0,3.6],[-4.2,py,2.9],2.0);
  slWallRing(-7.2,-4.8,-1.2,2.4,py,2.9,{mk:'plaster',postMk:'cedar',holes:{
   s:[{at:3.0,w:1.35,h:SL.DOOR_H}],
   e:[{at:3.6,w:1.15,y:.85,h:1.05}]
  }});
  slDoor(-4.2,py,2.4,0,1.35,SL.DOOR_H,{frameMk:'lacquer',leafMk:'cedar'});
  slWindow(-1.2,py+.85,-1.2,PI/2,1.15,1.05);
  slHipRoof(-4.2,py+3.12,-1.2,6.6,7.8,1.05,{mk:'terracotta',over:.48});
  slSpiderLoft(-4.2,py+4.06,-1.2,2.2,2.0,1.75,{roofMk:'terracotta'});
  /* Irrigated lakeside chinampa beds & water channels on east half (x = 0.6..7.2) */
  svNoWalk(()=>{
   box('dolomite',3.8,0,-1.0,6.8,.18,9.6,P('dolomiteD'));
   box('water',3.8,.18,-1.0,6.4,.08,9.2,P('water'));
   for(const zz of [-3.6,-.8,2.0]){
    box('earth',3.8,.26,zz,5.6,.22,1.9,P('earth'));
    for(let k=-2;k<=2;k++)box('bamboo',3.8+k*1.05,.48,zz,.12,.65,.12,P('bamboo'));
   }
  });
  slShamiyana(-7.0,2.5,-1.4,4.8,0,py+2.45,py+2.95,P('silkIndigo'),{skipBackPoles:true});
  slTarget(-4.2,py,-1.2,'farmhouse');
  slFurnList([
   ['generic_poor_straw_bed',-5.8,py,-3.0,PI/2],
   ['generic_poor_table',-3.4,py,-2.4,0],
   ['generic_veg_basket',-3.4,py+.78,-2.4,0],
   ['job_sheaf_rack',-5.8,0,3.8,0,{setting:'outdoor'}],
   ['generic_floor_basket',-2.4,0,3.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 35. Lakeside Water-Stock Byre & Duck Pens */
defBuilding({key:'sl_dairy_pens',name:'Lakeside Water-Stock Byre and Pens',seed:7315,cut:true,
 w:15.2,d:12.6,h:6.8,tags:{types:['farm'],wealth:'poor',style:'ham-tsek',job:'dairy'},
 build(){
  const py=slPlinth(13.4,10.2,.34,{stepW:2.8,stepRun:.7});
  /* North stone-and-cedar byre + south fenced pen with duck pond trough */
  slWallRing(-5.8,-4.6,5.8,-.2,py,2.85,{mk:'cedar',postMk:'cedar',holes:{
   s:[{at:5.8,w:1.8,h:2.2},{at:2.0,w:1.2,y:.9,h:1.0},{at:9.6,w:1.2,y:.9,h:1.0}]
  }});
  slDoor(0,py,-.2,0,1.8,2.2,{frameMk:'lacquer',leafMk:'cedar',ajar:.75});
  slWindow(-3.8,py+.9,-.2,0,1.2,1.0);
  slWindow(3.8,py+.9,-.2,0,1.2,1.0);
  slHipRoof(0,py+3.07,-2.4,12.2,5.0,1.05,{mk:'terracotta',over:.48});
  /* South cedar rail corral with wide gate opening at x = 0 */
  svNoWalk(()=>{
   for(const sx of [-5.8,5.8]){
    for(const zz of [.6,2.4,4.2])box('cedar',sx,py,zz,.14,1.1,.14,P('cedarD'));
    for(const yy of [.4,.85])box('cedar',sx,py+yy,2.4,.08,.08,3.8,P('cedar'));
   }
   for(const s of [-1,1]){
    for(const xx of [s*1.6,s*3.7,s*5.8])box('cedar',xx,py,4.2,.14,1.1,.14,P('cedarD'));
    for(const yy of [.4,.85])box('cedar',s*3.7,py+yy,4.2,4.2,.08,.08,P('cedar'));
   }
   /* Duck water basin on east side of pen */
   box('dolomite',3.6,py,2.2,2.8,.18,1.8,P('dolomiteD'));
   box('water',3.6,py+.18,2.2,2.4,.05,1.4,P('water'));
  });
  slTarget(0,py,-2.4,'byre');
  slTarget(0,py,2.2,'stock yard');
  slFurnList([
   ['generic_trade_hayrack',-3.6,py,-3.4,0],
   ['generic_trade_hayrack',3.6,py,-3.4,0],
   ['generic_churn',-4.4,py,-1.4,0],
   ['generic_dairy',-3.6,py,-1.4,0],
   ['generic_trade_trough',-3.6,py,2.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 36. Dolomite Quarry & Nephrite/Copper Mine-Works (linked to kits/resources via role: 'mine') */
defBuilding({key:'sl_mine_quarry',name:'Dolomite Quarry and Nephrite Mine-Works',seed:7316,cut:true,
 w:16.8,d:14.2,h:8.6,tags:{types:['industry'],wealth:'middle',style:'ham-tsek',role:'mine',job:'mining'},
 build(){
  /* Stepped cream-dolomite & porphyry quarry bench + timbered adit portal on north + sorting pavilion on west */
  box('paving',0,0,1.2,15.2,.24,10.2,P('paving'));
  wkPad(0,1.2,15.2,10.2,.24);
  const py=.24;
  /* Stepped quarry rock face along north (-z) with timbered mine adit mouth */
  svNoWalk(()=>{
   box('dolomite',0,py,-4.6,14.8,2.2,3.2,P('dolomiteD'));
   box('porphyry',0,py+2.2,-5.1,12.4,1.9,2.2,P('porphyry'));
   box('dolomite',-1.2,py+4.1,-5.5,8.8,1.6,1.4,P('dolomite'));
   /* Adit portal frame at x = 2.4, z = -3.0 */
   for(const sx of [1.3,3.5])box('timber',sx,py,-2.95,.26,2.45,.28,P('timber'));
   box('lacquer',2.4,py+2.45,-2.95,2.6,.26,.34,P('lacquer'));
   box('ebony',2.4,py+.04,-3.02,1.9,2.38,.08,P('ebony'));
   /* Bronze-sheave crane tripod & nephrite counterweight lifting cut dolomite blocks */
   for(let k=0;k<3;k++){
    const a=k*TAU/3+.3;
    pole('lacquer',[3.2+Math.cos(a)*1.45,py,1.8+Math.sin(a)*1.45],[3.2,py+4.2,1.8],.08,P('lacquer'),8);
   }
   cyl('bronze',3.2,py+4.15,1.8,.16,.08,P('bronze'),10);
   pole('rope',[3.2,py+4.1,1.8],[3.2,py+1.1,1.8],.014,P('silkGold'),6);
   box('dolomite',3.2,py+.4,1.8,.95,.65,.75,P('dolomite'));
   cyl('jade',3.9,py+2.1,2.2,.14,.28,P('jade'),10);
  });
  /* West sorting & assay pavilion under a shamiyana shade */
  slWallRing(-6.6,-.8,-1.4,4.4,py,2.95,{mk:'dolomite',postMk:'cedar',holes:{
   s:[{at:2.6,w:1.5,h:SL.DOOR_H}],
   e:[{at:2.6,w:1.4,h:SL.DOOR_H}]
  }});
  slDoor(-4.0,py,4.4,0,1.5,SL.DOOR_H,{frameMk:'porphyry',leafMk:'cedar'});
  slDoor(-1.4,py,1.8,PI/2,1.4,SL.DOOR_H,{open:true});
  slHipRoof(-4.0,py+3.17,1.8,5.8,5.8,1.0,{mk:'terracotta',over:.48});
  slShamiyana(.4,-1.2,6.4,4.8,py,py+4.4,py+5.0,P('silkSaffron'));
  slCocoonLantern(2.4,py+2.4,-2.7,.35,false);
  slTarget(-4.0,py,1.8,'assay shed');
  slTarget(2.4,py,1.8,'quarry yard');
  slFurnList([
   ['generic_poor_workbench',-4.8,py,.6,PI/2],
   ['generic_crate',-2.8,py,-.1,0],
   ['generic_strongbox',-5.2,py,3.2,0],
   ['generic_poor_rack',-4.0,py,-.3,0],
   ['spider-lake_cocoon_stand',.6,py,4.4,0,{setting:'outdoor'}]
  ]);
 }});
