// prefix: hy
// ================================================================= OUTER WALL SALTPETER, KILN, NEPHRITE & FLUME WORKS (seeds 34301..34307)
//   34301 hy_saltpeter_works     Mirabilis Saltpeter Cave-Earth Leaching & Boiling Works (role: 'mine' -> resSource)
//   34302 hy_ore_adit            Outer Wall Iron, Tin & Silver Mountain Adit (role: 'mine' -> resSource)
//   34303 hy_stoneware_kiln      Mirabilis Celadon & High-Voltage Porcelain Insulator Climbing Kiln
//   34304 hy_nephrite_lapidary   Water-Powered Nephrite Pendulum Wire-Saw & Lapidary Mill (live WATER.flow millrace)
//   34305 hy_larch_flume_yard    Sheritu Ship-Larch & Needle-Cypress Escarpment Flume Headworks (live WATER.flow chute)
//   34306 hy_iron_smithy         Outer Wall Iron & Tin Forge-House
//   34307 hy_plaid_weaver        Cave-Madder & Birch-Tar Hayrant Plaid Weaving & Dye House

/* 25. Mirabilis Saltpeter Cave-Earth Leaching & Boiling Works (role: 'mine') */
defBuilding({key:'hy_saltpeter_works',name:'Mirabilis Saltpeter Leaching and Boiling Works',seed:34301,cut:true,
 w:18.8,d:15.4,h:10.6,budget:125000,
 tags:{types:['industry'],wealth:'middle',style:'hybrid',role:'mine',job:'alchemy'},
 note:'Mirabilis b=200 saltpeter cave-earth leaching vats, white nitre crystallizing beds & vaulted basalt boiling house linked via resSource',
 build(){
  const G=.36;
  hyPlinth(16.0,12.2,G,{stepW:2.8,stepX:-2.8});
  /* West vaulted basalt & loess nitre-boiling hall */
  W(-3.1,0,-.8,0,()=>{
   hyLoessVault(0,0,G,8.6,7.2,3.45,{frontMk:'basalt',lintel:'nephrite',maskMk:'bronze',celadonCrown:true,smoke:true});
  });
  /* East outdoor leaching & solar-evaporation nitre court */
  svNoWalk(()=>{
   for(let i=0;i<2;i++){
    const zz=-2.6+i*3.4;
    box('ashlar',4.4,G,zz,4.6,.34,2.4,P('ashlar'));
    box('efflor',4.4,G+.34,zz,4.1,.08,1.95,P('white'));
   }
  });
  hyPlaidAwning(2.1,-4.4,6.9,3.2,G,2.95,{mk:'hemp',sag:.24});
  hyBilingualSign(-3.1,G+2.55,3.15,0,1.45,.84);

  hyFurnList([
   ['hayrant_saltpeter_vat',-5.2,G,-2.1,0],
   ['hayrant_saltpeter_vat',4.4,G,3.2,0],
   ['eternian_common_stove',-1.2,G,-2.6,0],
   ['job_salt_heap',-5.4,G,1.2,0],
   ['job_salt_tub',-1.2,G,1.1,0],
   ['eternian_common_weighing_scale',-3.1,G,-2.8,0],
   ['generic_barrel',6.2,G,-3.8,0]
  ]);
  hyTarget(-3.1,G,.4,'boiling-vault');
  hyTarget(1.8,G,3.4,'leaching-yard');
 }});

/* 26. Outer Wall Iron, Tin & Silver Mountain Adit (role: 'mine') */
defBuilding({key:'hy_ore_adit',name:'Outer Wall Iron and Tin Mountain Adit',seed:34302,cut:true,
 w:17.8,d:15.4,h:11.2,budget:120000,
 tags:{types:['industry'],wealth:'middle',style:'bench',role:'mine',job:'mining'},
 note:'timbered fur-larch adit collar cut into megabreccia and loess, iron ore-hoist headframe, cassiterite sorting bin & tally cabin',
 build(){
  const G=.34;
  hyPlinth(14.8,11.8,G,{stepW:2.8,stepX:2.8});
  /* West rock-cut megabreccia & loess adit drift portal */
  W(-3.6,0,-1.2,0,()=>{
   hyLoessVault(0,0,G,6.8,6.8,3.25,{frontMk:'megabreccia',lintel:'larch',maskMk:'lead',smoke:false});
   /* Heavy fur-larch headframe & iron winding drum in front of the adit mouth */
   svNoWalk(()=>{
    for(const sx of [-1.45,1.45]){
     beam('larch',[sx,G,4.6],[sx*.65,G+5.2,2.4],.16,P('larchD'));
     beam('larch',[sx,G,2.1],[sx*.65,G+5.2,2.4],.16,P('larch'));
    }
    box('larch',0,G+5.2,2.4,2.4,.22,.36,P('larchD'));
    pole('iron',[-.45,G+4.75,2.4],[.45,G+4.75,2.4],.52,P('iron'),14);
    /* Twin iron mine-rail sleepers emerging from adit */
    for(const rx of [-.42,.42])box('iron',rx,G,3.2,.07,.06,4.2,P('iron'));
    box('gossan',-2.2,G,4.2,1.6,.48,1.4,P('stoneD'));
    box('cassiterite',2.2,G,4.2,1.5,.44,1.3,P('ashlar'));
   });
  });

  /* East Assay & Miner Tally Cabin */
  W(3.4,0,-.4,0,()=>{
   const CW=6.4,CD=6.8,CH=3.35;
   hyWallRing(-CW/2,-CD/2,CW/2,CD/2,G,CH,{
    mk:'basalt',socle:.55,socleMk:'megabreccia',
    holes:{s:[{at:CW/2,y:0,w:1.65,h:2.55},{at:1.4,y:.95,w:1.0,h:1.2}]}
   });
   hyDoor(0,G,CD/2,0,1.24,2.1,{lintel:'nephrite',maskMk:'lead'});
   hyWindow(-CW/2+1.4,G+.95,CD/2,0,.8,.98,{light:'steel'});
   hyRoofHip(0,G+CH+.24,0,CW+.2,CD+.2,2.15,{mk:'tile',smoke:true});
  });
  hyWindHanging(-3.6,G,4.8,0,1.8,2.3,{mk:'hide',panels:2});

  hyFurnList([
   ['eternian_common_weighing_scale',3.4,G,-2.1,0],
   ['eternian_common_register_desk',5.1,G,-.4,-PI/2],
   ['pa_tool_rack',1.6,G,-2.2,0],
   ['eternian_poor_hearth',2.2,G,1.4,PI],
   ['generic_crate',-3.6,G,-.8,0],
   ['generic_lamp_oil',-5.2,G,-.8,0]
  ]);
  hyTarget(-3.6,G,.2,'adit-drift');
  hyTarget(3.4,G,.4,'tally-cabin');
 }});

/* 27. Mirabilis Celadon & High-Voltage Porcelain Insulator Climbing Kiln */
defBuilding({key:'hy_stoneware_kiln',name:'Mirabilis Celadon and Insulator Climbing Kiln',seed:34303,cut:true,
 w:18.6,d:15.0,h:11.6,budget:130000,
 tags:{types:['industry'],wealth:'middle',style:'hybrid',job:'pottery'},
 note:'three-chamber ascending noborigama kiln firing celadon kaen-doki vessels and Eternal State high-voltage porcelain insulators',
 build(){
  const G=.36;
  hyPlinth(15.8,11.6,G,{stepW:2.8,stepX:2.8});
  /* West 3-chamber stepped climbing kiln (noborigama) terminating in a tall celadon kaen-doki flue */
  svNoWalk(()=>{
   for(let i=0;i<3;i++){
    const zz=2.4-i*2.65,yb=G+i*.46,chW=3.8,chD=2.45,chH=2.15;
    box('basalt',-4.2,G,zz,chW+.24,yb-G+.32,chD+.12,P('basalt'));
    box('kaen',-4.2,yb+.32,zz,chW,chH*.68,chD,P('kaen'));
    pole('brick',[-4.2,yb+.32+chH*.68,zz-chD*.48],[-4.2,yb+.32+chH*.68,zz+chD*.48],chW*.48,P('brick'),14);
    /* Glowing stokehole on +x side */
    box('glow',-2.26,yb+.48,zz,.06,.42,.38,new THREE.Color(0xff7824));
   }
   /* North chimney stack */
   box('brick',-4.2,G,-5.0,1.65,5.8,1.65,P('brick'));
   hyKaenCrown(-4.2,G+5.8,-5.0,.52,.95,4,{celadon:true,smoke:true});
  });

  /* East Potter & Insulator Glazing Hall */
  W(2.8,0,-.4,0,()=>{
   const PW=8.4,PD=8.2,PH=3.75;
   hyWallRing(-PW/2,-PD/2,PW/2,PD/2,G,PH,{
    mk:'lime',socle:.68,socleMk:'basalt',
    holes:{
     s:[{at:PW/2,y:0,w:1.85,h:2.65},{at:1.8,y:.95,w:1.25,h:1.45},{at:PW-1.8,y:.95,w:1.25,h:1.45}],
     n:[{at:PW/2,y:1.0,w:1.35,h:1.45}]
    }
   });
   hyDoor(0,G,PD/2,0,1.38,2.18,{lintel:'nephrite',maskMk:'kaen'});
   for(const sx of [-PW/2+1.8,PW/2-1.8])hyWindow(sx,G+.95,PD/2,0,1.02,1.22,{light:'alabaster',stepHead:true});
   hyWindow(0,G+1.0,-PD/2,PI,1.1,1.22,{light:'nephrite'});
   hyRoofHip(0,G+PH+.24,0,PW+.2,PD+.2,2.55,{mk:'celadon',smoke:false});
   hyBilingualSign(-2.4,G+2.35,PD/2+.34,0,1.35,.8);
  });
  hyPlaidAwning(-6.2,3.4,-1.8,5.4,G,2.75,{mk:'hemp',sag:.2});

  hyFurnList([
   ['hayrant_insulator_rack',.2,G,-3.2,0],
   ['hayrant_insulator_rack',5.2,G,-3.2,0],
   ['hayrant_kaen_jar',5.6,G,1.8,0,1],
   ['hayrant_kaen_jar',4.4,G,2.4,0,0],
   ['eternian_common_table',2.8,G,-.4,0],
   ['eternian_common_bench',2.8,G,.7,PI],
   ['generic_fuel',-4.2,G,4.4,0]
  ]);
  hyTarget(2.8,G,1.2,'glazing-hall');
  hyTarget(-1.2,G,3.8,'kiln-yard');
 }});

/* 28. Water-Powered Nephrite Pendulum Wire-Saw & Lapidary Mill (FLOW STREAM #1 on core/water) */
defBuilding({key:'hy_nephrite_lapidary',name:'Nephrite Pendulum Wire-Saw and Lapidary Mill',seed:34304,cut:true,
 w:20.2,d:16.2,h:10.6,budget:135000,
 tags:{types:['industry'],wealth:'middle',style:'hybrid',job:'masonry'},
 note:'water-powered quartz-sand pendulum bronze wire-saws slicing cross-pass Crookshore emerald-nephrite lintels & seismic chimes',
 build(){
  /* Live core/water mountain millrace flowing west-to-east along north basalt raceway z = -5.8 */
  hyFlowStream('hayrant_nephrite_millrace',[[-9.4,.22,-5.8],[9.4,.14,-5.8]],2.2,1.45);

  const G=.46;
  hyPlinth(17.2,10.2,G,{stepW:2.8,stepX:0});
  /* Dressed basalt north raceway curb & spoked fur-larch + bronze undershot waterwheel */
  svNoWalk(()=>{
   box('ashlar',0,0,-7.15,18.8,.68,.38,P('ashlar'));
   W(-5.2,G+1.38,-5.55,0,()=>{
    ring('larch',0,0,0,1.62,.11,P('larchD'),0,PI/2,0,20);
    ring('bronze',0,0,0,1.12,.06,P('bronze'),0,PI/2,0,16);
    for(let i=0;i<8;i++){
     const a=i*TAU/8;
     box('larch',Math.cos(a)*1.55,Math.sin(a)*1.55,0,.08,.36,.48,P('larch'));
    }
    pole('iron',[0,0,-.35],[0,0,1.65],.12,P('iron'),10);
   });
   /* Raw cross-pass Crookshore emerald-nephrite boulder & sawn 3-ton lintel blank in west yard */
   box('nephrite',-6.4,G,1.8,2.4,.76,1.25,P('nephrite'));
   box('jade',-6.4,G+.76,1.8,2.1,.18,.65,P('jade'));
  });

  /* Lapidary & Wire-Saw Hall */
  W(1.6,0,-.2,0,()=>{
   const LW=11.4,LD=8.2,LH=3.85;
   hyWallRing(-LW/2,-LD/2,LW/2,LD/2,G,LH,{
    mk:'basalt',socle:.62,socleMk:'megabreccia',
    holes:{
     s:[{at:LW/2,y:0,w:2.1,h:2.75},{at:2.2,y:.95,w:1.3,h:1.45},{at:LW-2.2,y:.95,w:1.3,h:1.45}],
     n:[{at:3.2,y:1.0,w:1.3,h:1.4},{at:LW-3.2,y:1.0,w:1.3,h:1.4}]
    }
   });
   hyDoor(0,G,LD/2,0,1.52,2.22,{lintel:'nephrite',maskMk:'nephrite'});
   for(const sx of [-LW/2+2.2,LW/2-2.2])hyWindow(sx,G+.95,LD/2,0,1.06,1.22,{light:'nephrite',stepHead:true});
   for(const sx of [-LW/2+3.2,LW/2-3.2])hyWindow(sx,G+1.0,-LD/2,PI,1.04,1.18,{light:'alabaster'});
   hyRoofHip(0,G+LH+.24,0,LW+.2,LD+.2,2.65,{mk:'celadon',smoke:false});
  });
  hySeismicChimes(-5.8,G+2.85,3.8,0,2.2,1.25,7);

  hyFurnList([
   ['hayrant_nephrite_saw_bench',-.8,G,-1.8,0],
   ['hayrant_nephrite_saw_bench',3.8,G,-1.8,0],
   ['job_saw_bench',3.8,G,1.4,PI],
   ['hayrant_seismic_chime_rack',6.1,G,-.2,-PI/2],
   ['eternian_common_weighing_scale',-2.4,G,1.4,0],
   ['pa_tool_rack',-3.1,G,-2.8,0],
   ['generic_crate',-6.4,G,-.8,0]
  ]);
  hyTarget(1.6,G,1.2,'lapidary-hall');
 }});

/* 29. Sheritu Ship-Larch & Needle-Cypress Escarpment Flume Headworks (FLOW STREAM #2 on core/water) */
defBuilding({key:'hy_larch_flume_yard',name:'Sheritu Ship-Larch Escarpment Flume Yard',seed:34305,cut:true,
 w:22.0,d:16.4,h:10.8,budget:130000,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'bench',job:'carpentry'},
 note:'hydraulic mountain timber chute floating peeled Sheritu fur-larch and needle-cypress ship spars down the escarpment to Fulcrum',
 build(){
  /* Live core/water rushing hydraulic log-flume channel along z = -5.6 */
  hyFlowStream('sheritu_ship_larch_flume',[[-10.2,.32,-5.6],[10.2,.16,-5.6]],1.85,2.35);

  const G=.38;
  hyPlinth(18.2,10.2,G,{stepW:3.0,stepX:-2.4});
  /* Timber & basalt V-flume guide curbs & peeled ship-larch logs riding in the race */
  svNoWalk(()=>{
   for(const sz of [-6.75,-4.45])box('tarwood',0,0,sz,20.4,.62,.28,P('tarwood'));
   for(let i=-4;i<=4;i++)box('columnar',i*2.3,0,-5.6,.34,.12,2.6,P('columnar'));
   pole('larch',[-6.4,.42,-5.55],[-2.0,.36,-5.55],.24,P('larch'),10);
   pole('larch',[1.4,.34,-5.65],[5.8,.28,-5.65],.22,P('larch'),10);
   /* Stacked peeled ship-masts on east skidway */
   for(let k=0;k<3;k++){
    const zz=k*1.05-1.2;
    pole('larch',[5.2,G+.48,zz],[7.2,G+.48,zz],.22,P('larch'),10);
   }
   for(const sx of [5.1,7.3])box('tarwood',sx,G,-1.2,.24,.24,4.2,P('tarwood'));
  });

  /* West Sawyer & Barking Lodge */
  W(-2.4,0,-.2,0,()=>{
   const SW=10.2,SD=7.8,SH=3.6;
   hyWallRing(-SW/2,-SD/2,SW/2,SD/2,G,SH,{
    mk:'larch',socle:.65,socleMk:'megabreccia',
    holes:{
     s:[{at:SW/2,y:0,w:2.0,h:2.65},{at:2.0,y:.95,w:1.2,h:1.35},{at:SW-2.0,y:.95,w:1.2,h:1.35}],
     n:[{at:SW/2,y:.95,w:1.4,h:1.4}]
    }
   });
   hyDoor(0,G,SD/2,0,1.48,2.16,{lintel:'larch',maskMk:'kaen'});
   for(const sx of [-SW/2+2.0,SW/2-2.0])hyWindow(sx,G+.95,SD/2,0,.96,1.12,{light:'nephrite'});
   hyWindow(0,G+.95,-SD/2,PI,1.15,1.18,{light:'steel'});
   hyRoofHip(0,G+SH+.24,0,SW+.24,SD+.24,2.45,{mk:'bark',smoke:true});
  });
  hyPlaidAwning(3.6,.8,8.2,4.2,G,2.85,{mk:'plaid',sag:.22});

  hyFurnList([
   ['job_saw_bench',-4.6,G,-1.6,0],
   ['job_saw_bench',-.2,G,-1.6,0],
   ['job_plank_stack',-5.2,G,1.6,PI/2],
   ['job_pole_rack',-2.4,G,-2.9,0],
   ['pa_tool_rack',1.4,G,-2.8,0],
   ['eternian_poor_hearth',1.2,G,1.4,PI],
   ['job_plank_stack',5.6,G,2.6,0]
  ]);
  hyTarget(-2.4,G,1.0,'sawyer-lodge');
  hyTarget(4.8,G,2.2,'skidway-yard');
 }});

/* 30. Outer Wall Iron & Tin Forge-House */
defBuilding({key:'hy_iron_smithy',name:'Outer Wall Iron and Tin Forge-House',seed:34306,cut:true,
 w:15.8,d:13.8,h:10.4,budget:115000,
 tags:{types:['industry','shop'],wealth:'middle',style:'hybrid',job:'smithing'},
 note:'battered basalt smithy with roaring twin-tuyere stone forge, celadon kaen-doki flue, open quench porch & bilingual signboard',
 build(){
  const G=.38,W=9.6,D=8.2,H=3.8;
  pushM(TF(-1.4,0,-.4));
  hyPlinth(12.8,9.6,G,{stepW:2.6,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'basalt',socle:.68,socleMk:'megabreccia',
   holes:{
    s:[{at:W/2,y:0,w:2.0,h:2.75},{at:1.9,y:1.0,w:1.2,h:1.35}],
    e:[{at:D/2,y:0,w:2.2,h:2.65}],
    n:[{at:W/2,y:1.05,w:1.2,h:1.3}]
   }
  });
  hyDoor(0,G,D/2,0,1.48,2.2,{lintel:'nephrite',maskMk:'iron'});
  hyWindow(-W/2+1.9,G+1.0,D/2,0,.96,1.12,{light:'steel'});
  hyWindow(0,G+1.05,-D/2,PI,.96,1.1,{light:'steel'});
  hyRoofHip(0,G+H+.24,0,W+.2,D+.2,2.45,{mk:'tile',kaenFinial:false});
  /* Heavy basalt forge chimney rising on NW corner */
  svNoWalk(()=>{
   box('basalt',-2.8,G+H+.24,-2.2,1.5,1.65,1.5,P('basaltD'));
   hyKaenCrown(-2.8,G+H+1.89,-2.2,.46,.86,4,{celadon:true,smoke:true});
  });
  /* East open shoeing & quench awning */
  hyPlaidAwning(W/2+.3,-2.8,W/2+2.9,2.8,G,2.75,{mk:'hide',sag:.2});
  hyBilingualSign(2.4,G+2.35,D/2+.34,0,1.35,.8);

  hyFurnList([
   ['pa_forge',-2.8,G,-2.2,0],
   ['pa_bellows',-1.2,G,-2.4,PI],
   ['pa_anvil',-.8,G,-.4,0],
   ['pa_quench',1.4,G,-.6,0],
   ['pa_vice_bench',2.8,G,-2.6,0],
   ['pa_tool_rack',3.4,G,.8,-PI/2],
   ['pa_anvil',W/2+1.5,G,0,PI/2]
  ]);
  hyTarget(.4,G,1.2,'forge-floor');
  popM();
 }});

/* 31. Cave-Madder & Birch-Tar Hayrant Plaid Weaving & Dye House */
defBuilding({key:'hy_plaid_weaver',name:'Cave-Madder Highland Plaid Weaving House',seed:34307,cut:true,
 w:16.0,d:14.0,h:9.8,budget:115000,
 tags:{types:['industry','shop'],wealth:'middle',style:'hybrid',job:'weaving'},
 note:'white-lime and basalt loom hall with alabaster north-lights, cave-madder and birch-tar dye vats & katabatic wind-rigged plaid lines',
 build(){
  const G=.38,W=9.8,D=7.8,H=3.7;
  pushM(TF(-1.5,0,-.5));
  hyPlinth(13.0,9.8,G,{stepW:2.6,stepX:0});
  hyWallRing(-W/2,-D/2,W/2,D/2,G,H,{
   mk:'lime',socle:.64,socleMk:'basalt',
   holes:{
    s:[{at:W/2,y:0,w:1.85,h:2.65},{at:1.9,y:.95,w:1.3,h:1.45},{at:W-1.9,y:.95,w:1.3,h:1.45}],
    n:[{at:2.4,y:.95,w:1.4,h:1.5},{at:W-2.4,y:.95,w:1.4,h:1.5}]
   }
  });
  hyDoor(0,G,D/2,0,1.38,2.16,{lintel:'nephrite',maskMk:'bronze'});
  for(const sx of [-W/2+1.9,W/2-1.9])hyWindow(sx,G+.95,D/2,0,1.06,1.22,{light:'alabaster',stepHead:true});
  for(const sx of [-W/2+2.4,W/2-2.4])hyWindow(sx,G+.95,-D/2,PI,1.16,1.28,{light:'alabaster',stepHead:true});
  hyRoofHip(0,G+H+.24,0,W+.2,D+.2,2.4,{mk:'celadon',smoke:true});
  hyBilingualSign(-2.4,G+2.3,D/2+.34,0,1.35,.8);

  /* East dye-vat court & 3 katabatic wind-rigged Hayrant plaid drying frames */
  svNoWalk(()=>{
   const cols=['plaid','plaidGold','plaidDark'];
   for(let i=0;i<3;i++){
    const zz=-2.2+i*1.65;
    cyl('basalt',W/2+1.65,G,zz,.52,.56,P('basaltD'),12);
    cyl('plaid',W/2+1.65,G+.56,zz,.44,.06,P(cols[i]),12);
   }
  });
  hyWindHanging(W/2+1.65,G,2.6,0,2.4,2.85,{mk:'plaid',panels:3});
  hyWindHanging(-2.8,G,D/2+.65,0,1.8,2.4,{mk:'plaid',panels:2});

  hyFurnList([
   ['hayrant_plaid_loom',-2.8,G,-2.2,0],
   ['hayrant_plaid_loom',2.8,G,-2.2,0],
   ['job_bales',-3.4,G,1.2,PI/2],
   ['generic_sewing',0,G,-2.6,0],
   ['eternian_common_table',0,G,.4,0],
   ['eternian_common_bench',0,G,1.4,PI],
   ['hayrant_kaen_jar',3.4,G,1.6,0,1]
  ]);
  hyTarget(0,G,1.4,'loom-hall');
  popM();
 }});
