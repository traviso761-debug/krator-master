// prefix: hs
// ================================================================= HUSH-KIN SILENT WORKS, QUARRIES, LAPIDARIES & FERRIES (seeds 37301..37308)
// Eight core Silent-Vales extraction, harmonic-craft, textile, lake-ferry and food works (PLAN.md §3):
//   37301 hs_quartz_quarry         Milky-Quartz & Pegmatite Crystal Quarry (resSource: mine)
//   37302 hs_lithophone_lapidary   Water-Driven Quartz-Prism & Nephrite Lithophone Grinding Mill (WATER.flow)
//   37303 hs_bell_foundry          Harmonic Bianzhong Two-Tone Bronze Bell Foundry (resSource: mine)
//   37304 hs_felt_weaver           Sound-Damping Wool Felt-Sole & Handspeak Linen Loom-House
//   37305 hs_silent_ferry          Ribbon-Lake Underwater-Cable Silent Ferry & White-Quartz Beacon Landing (WATER.still)
//   37306 hs_reed_skiff_shed       Scull-Oar Lake Boatyard & Char Net-Drying Pier (WATER.still)
//   37307 hs_slate_bakehouse       Radiant Soapstone & Slate Sanctuary Bakehouse
//   37308 hs_herb_smokehouse       Alpine Herb & Cold-Smoked Lake-Char Smokehouse

/* 21. Milky-Quartz & Pegmatite Crystal Quarry (resSource mine) */
defBuilding({key:'hs_quartz_quarry',name:'Milky-Quartz and Pegmatite Crystal Quarry',seed:37301,cut:true,
 w:16.4,d:14.6,h:10.4,budget:115000,
 tags:{types:['industry'],role:'mine',job:'mining',style:'terrace'},
 note:'feather-and-wedge silent granite quarry face exposing giant snow-white milky-quartz and rock-crystal veins beside a mason dressing shed',
 build(){
  const G=.36;
  pushM(TF(0,0,-.45));
  hsPlinth(14.4,11.6,G,{stepW:2.8,stepX:-2.4});
  /* West mason's dressing & tool lodge */
  pushM(TF(-3.2,0,-.4));
  hsBox(6.8,7.4,G,2.85,{mk:'granite',socle:.36,holes:{
   s:[{x:0,y:0,w:1.3,h:2.14}],
   w:[{x:0,y:.86,w:1.04,h:.98}],
   n:[{x:0,y:.88,w:1.04,h:.96}]
  }});
  hsDoor(0,G,3.7-HS.WALL/2,0,1.16,2.06);
  hsWindow(-3.4+HS.WALL/2,G+.86,0,-PI/2,.92,.88);
  hsWindow(0,G+.88,-3.7+HS.WALL/2,PI,.92,.86);
  hsSlateRoof(6.8,7.4,G+2.85,1.76,{gableMk:'granite'});
  hsFurnList([
   ['hush_lapidary_grinding_bench',0,G,-1.8,0],
   ['generic_crate',-2.0,G,1.6,PI/2],
   ['generic_sack',2.0,G,1.6,-PI/2],
   ['job_plank_stack',-2.0,G,.1,PI/2],
   ['hush_handspeak_mirror_lamp',2.1,G,-1.8,-.5]
  ]);
  hsTarget(0,G,0,'quarry-shed');
  popM();
  /* East stepped pegmatite-granite quarry benches & protruding hexagonal snow-white quartz crystal clusters */
  svNoWalk(()=>{
   box('granite',3.6,G,-2.2,5.6,1.35,4.8,P('granite'));
   box('granite',4.1,G+1.35,-2.8,4.4,1.35,3.4,P('graniteD'));
   for(const q of [[2.8,G+1.35,-1.2,.44,2.1,.18],[4.2,G+2.7,-2.2,.52,2.5,-.16],[5.1,G+1.35,-1.5,.38,1.85,.24],[2.2,G,.8,.36,1.5,-.2]]){
    WX(q[0],q[1],q[2],.3,q[5],-.14,()=>{
     cyl('quartz',0,0,0,q[3],q[4],P('quartzPure'),6);
     cone('crystal',0,q[4],0,q[3],q[3]*1.35,P('crystal'),6);
    });
   }
   /* Silent felt-rope shear-legs timber hoist */
   beam('cypress',[1.8,G,2.6],[3.2,G+4.4,1.2],.14,P('cypressD'));
   beam('cypress',[4.6,G,2.6],[3.2,G+4.4,1.2],.14,P('cypressD'));
   beam('rope',[3.2,G+4.3,1.2],[3.2,G+1.4,1.2],.03,P('rope'));
   box('quartz',3.2,G+.7,1.2,.86,.68,.86,P('quartzPure'));
  });
  hsSignGallery(-3.2,G,4.15,6.4,1.8,2.52,0,{deck:false,bays:2,openCenter:true});
  hsTarget(1.8,G,2.8,'quarry-yard');
  popM();
 }});

/* 22. Water-Driven Quartz-Prism & Nephrite Lithophone Lapidary (WATER.flow) */
defBuilding({key:'hs_lithophone_lapidary',name:'Water-Driven Quartz and Nephrite Lapidary Mill',seed:37302,cut:true,
 w:16.8,d:14.6,h:10.6,budget:120000,
 tags:{types:['industry'],job:'masonry',style:'gallery'},
 note:'silent undershot watermill driving wet garnet-sand saws that slice emerald-nephrite 440/660 Hz lithophone bars and optical rock-crystal prisms',
 build(){
  const G=.4;
  pushM(TF(0,0,-.45));
  hsPlinth(11.2,11.4,G,{stepW:2.6,stepX:-1.8});
  pushM(TF(-1.8,0,-.6));
  hsBox(8.8,7.6,G,3.0,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.34,h:2.18},{x:-2.5,y:.84,w:1.12,h:1.06}],
   w:[{x:0,y:.86,w:1.1,h:1.02}],
   n:[{x:0,y:.88,w:1.1,h:1.0}]
  }});
  hsDoor(0,G,3.8-HS.WALL/2,0,1.2,2.1);
  hsWindow(-2.5,G+.84,3.8-HS.WALL/2,0,.98,.96);
  hsWindow(-4.4+HS.WALL/2,G+.86,0,-PI/2,.96,.92);
  hsWindow(0,G+.88,-3.8+HS.WALL/2,PI,.96,.9);
  hsSlateRoof(8.8,7.6,G+3.0,1.98,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_lapidary_grinding_bench',-2.1,G,-1.6,0],
   ['hush_lapidary_grinding_bench',1.8,G,-1.6,0],
   ['hush_nephrite_lithophone',-2.2,G,1.6,PI/2],
   ['hush_heliograph_tripod',2.1,G,1.6,-.4],
   ['generic_crate',0,G,-2.6,0]
  ]);
  hsTarget(0,G,0,'lapidary-hall');
  popM();
  /* East granite millrace channel + silent felt-bushed undershot cypress waterwheel + WATER.flow */
  svNoWalk(()=>{
   for(const sx of [4.2,6.6])box('granite',sx,0,-.2,.38,.72,10.6,P('granite'));
   box('slate',5.4,0,-.2,2.02,.14,10.6,P('slateD'));
   /* Undershot waterwheel on horizontal bronze axle */
   cyl('bronze',3.6,1.45,-.6,.14,2.1,P('bronze'),8,.14);
   W(5.4,1.45,-.6,PI/2,()=>{
    ring('cypress',0,0,0,1.25,.12,P('cypressD'),PI/2,0,0,14);
    for(let i=0;i<8;i++){
     const a=i*TAU/8;
     box('birch',Math.cos(a)*1.18,Math.sin(a)*1.18,0,.32,.06,.78,P('birch'),0,0,a);
    }
   });
  });
  if(CURREC&&!PLACE_DRY){
   const a=new THREE.Vector3(5.4,0,-5.1).applyMatrix4(CM),b=new THREE.Vector3(5.4,0,4.7).applyMatrix4(CM);
   const m=new THREE.Vector3(5.4,0,-.2).applyMatrix4(CM);
   CURREC.river={name:'lapidary_millrace',pts:[[a.x,a.z,.28],[m.x,m.z,.26],[b.x,b.z,.24]],width:1.56,speed:1.1};
  }
  hsSignGallery(-1.8,G,4.15,8.2,1.9,2.6,0,{deck:false,bays:3,openCenter:true});
  hsHarmonicRack(2.1,G,4.2,2.1,0,{chimes:4});
  popM();
 }});

/* 23. Harmonic Bianzhong Two-Tone Bronze Bell Foundry (resSource mine) */
defBuilding({key:'hs_bell_foundry',name:'Harmonic Bianzhong Bronze Bell Foundry',seed:37303,cut:true,
 w:16.2,d:14.8,h:13.8,budget:125000,
 tags:{types:['industry'],role:'mine',job:'smithing',style:'spire'},
 note:'two-tone elliptic bianzhong bronze bell and heliograph shutter foundry linked to copper/tin ore veins via resSource, with a pitch-test harmonic court',
 build(){
  const G=.42,W0=9.4,D0=8.0,H0=3.15;
  pushM(TF(0,0,-.5));
  hsPlinth(14.2,11.8,G,{stepW:2.8,stepX:-1.6});
  pushM(TF(-1.8,0,-.9));
  hsBox(W0,D0,G,H0,{mk:'granite',socleMk:'slateWall',socle:.4,holes:{
   s:[{x:0,y:0,w:1.38,h:2.22},{x:-2.6,y:.86,w:1.08,h:1.06}],
   w:[{x:0,y:.86,w:1.08,h:1.04}],
   n:[{x:0,y:.88,w:1.08,h:1.0}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.24,2.14);
  hsWindow(-2.6,G+.86,D0/2-HS.WALL/2,0,.96,.96);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.96,.94);
  hsWindow(0,G+.88,-D0/2+HS.WALL/2,PI,.96,.9);
  hsSlateRoof(W0,D0,G+H0,2.1,{gableMk:'granite'});
  /* Tall granite casting-flue stack crowned with a 6-stepped snow-white quartz tuning cap + smoke plume */
  svNoWalk(()=>box('granite',-2.8,G+H0+.6,-2.2,1.65,2.6,1.65,P('graniteD')));
  hsQuartzPyramid(-2.8,-2.2,1.72,G+H0+3.2,2.1,6,{heliograph:false});
  smokeAt(-2.8,G+H0+6.4,-2.2,{r:.36,kind:'fire'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-2.6,G,-2.0,0],
   ['hush_bianzhong_bell_rack',2.2,G,-2.1,-.2],
   ['hush_lapidary_grinding_bench',2.2,G,1.4,-PI/2],
   ['generic_barrel',-2.8,G,1.8,0],
   ['generic_crate',0,G,-2.7,0]
  ]);
  hsTarget(0,G,0,'foundry-floor');
  popM();
  /* East outdoor harmonic bell-tuning stand */
  hsHarmonicRack(4.6,G,.8,2.8,-PI/2,{chimes:6,h:2.65});
  hsSignGallery(-1.8,G,4.05,8.6,1.95,2.62,0,{deck:false,bays:3,openCenter:true});
  hsTarget(4.2,G,2.6,'tuning-yard');
  popM();
 }});

/* 24. Sound-Damping Wool Felt-Sole & Handspeak Linen Loom-House */
defBuilding({key:'hs_felt_weaver',name:'Sound-Damping Felt and Linen Loom-House',seed:37304,cut:true,
 w:15.2,d:13.8,h:8.8,budget:105000,
 tags:{types:['industry','shop'],job:'weaving',style:'gallery'},
 note:'weaver hall fulling thick sound-damping wool felt boot-soles and high-contrast indigo and undyed linen Handspeak banners',
 build(){
  const G=.4,W0=10.8,D0=7.6,H0=3.0;
  pushM(TF(0,0,-.5));
  hsPlinth(13.2,11.2,G,{stepW:2.8});
  pushM(TF(0,0,-1.05));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.36,h:2.2},{x:-3.1,y:.84,w:1.18,h:1.1},{x:3.1,y:.84,w:1.18,h:1.1}],
   e:[{x:0,y:.86,w:1.1,h:1.04}],
   w:[{x:0,y:.86,w:1.1,h:1.04}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.22,2.12);
  hsWindow(-3.1,G+.84,D0/2-HS.WALL/2,0,1.04,1.0);
  hsWindow(3.1,G+.84,D0/2-HS.WALL/2,0,1.04,1.0);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,.96,.94);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.96,.94);
  hsSlateRoof(W0,D0,G+H0,2.05,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_felt_sole_loom',-3.2,G,-1.6,0],
   ['hush_felt_sole_loom',3.2,G,-1.6,0],
   ['job_bales',0,G,-2.2,0],
   ['generic_pantry_shelf',-3.8,G,1.6,PI/2],
   ['hush_handspeak_mirror_lamp',3.6,G,1.8,-.5]
  ]);
  hsTarget(0,G,0,'loom-hall');
  popM();
  hsSignGallery(0,G,3.75,10.4,2.15,2.68,0,{deck:false,bays:3,openCenter:true});
  hsSpanPennants(-5.8,-2.5,-5.8,3.5,G+2.3,{mk:'felt'});
  hsSignBanner(5.8,G,3.8,0,3.4,{mk:'linen'});
  popM();
 }});

/* 25. Ribbon-Lake Underwater-Cable Silent Ferry & White-Quartz Landing (WATER.still) */
defBuilding({key:'hs_silent_ferry',name:'Ribbon-Lake Underwater-Cable Silent Ferry Landing',seed:37305,cut:true,
 w:19.4,d:17.8,h:15.2,budget:145000,
 tags:{types:['infrastructure'],job:'shipwrighting',style:'spire',landmark:true},
 note:'mirror-calm ribbon-lake granite quay basin with a felt-bushed underwater-cable ferry pontoon, snow-white quartz optical heliograph spire and 440 Hz arrival chime',
 build(){
  const G=.42;
  /* South landward granite quay terrace */
  pushM(TF(0,0,3.2));
  hsPlinth(17.2,8.4,G,{stepW:3.2});
  popM();
  /* North enclosed mirror-calm ribbon-lake ferry basin (WATER.still) */
  const bw=16.8,bd=7.8,bz=-4.2,kt=.42;
  svNoWalk(()=>{
   box('slate',0,0,bz,bw,.08,bd,P('slateD'));
   box('granite',0,.08,bz-bd/2+kt/2,bw,.42,kt,P('granite'));
   for(const sx of [-1,1])box('granite',sx*(bw/2-kt/2),.08,bz,kt,.42,bd-kt,P('granite'));
  });
  if(CURREC&&!PLACE_DRY){
   const c=new THREE.Vector3(0,0,bz).applyMatrix4(CM),hw=bw*.5-.46,hd=bd*.5-.46;
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'ribbon_lake_ferry_basin',level:.34,
    bounds:[c.x-hw,c.z-hd,c.x+hw,c.z+hd],
    poly:[[c.x-hw,c.z-hd],[c.x+hw,c.z-hd],[c.x+hw,c.z+hd],[c.x-hw,c.z+hd]],
    color:0x194c5e,roughness:.03
   });
  }
  /* Walkable timber-and-cypress cable-ferry pontoon moored at quay edge + underwater guide rope */
  svNoWalk(()=>{
   box('cypress',0,.28,-1.8,5.6,.28,3.6,P('cypressD'));
   box('birch',0,.56,-1.8,5.2,.08,3.3,P('birch'));
   for(const sx of [-2.4,2.4])for(const sz of [-3.3,-.3])cyl('cypress',sx,.64,sz,.08,.82,P('cypress'),8);
   for(const sx of [-2.4,2.4])box('cypress',sx,1.38,-1.8,.12,.08,3.1,P('cypress'));
   beam('rope',[0,.42,.6],[0,.18,-7.6],.032,P('rope'));
   /* Walkable boarding gangplank bridging quay (z = -1.0, y = G) to pontoon (z = -1.8, y = .64) */
   box('birch',0,.52,-.4,1.6,.08,1.5,P('birch'));
  });
  wkPad(0,-1.8,4.8,2.8,.64);
  svStripWalk([0,G,.4],[0,.64,-1.2],1.5);
  /* Ferrymaster's house on west quay + white-quartz optical heliograph spire on east quay */
  pushM(TF(-4.4,0,2.8));
  hsBox(6.8,5.8,G,2.88,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.28,h:2.14}],
   e:[{x:0,y:.85,w:1.04,h:.98}]
  }});
  hsDoor(0,G,2.9-HS.WALL/2,0,1.14,2.06);
  hsWindow(3.4-HS.WALL/2,G+.85,0,PI/2,.92,.88);
  hsSlateRoof(6.8,5.8,G+2.88,1.72,{gableMk:'ashlar'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-1.9,G,-1.4,0],
   ['hush_primer_tablet_stand',1.8,G,-1.3,-.3],
   ['generic_crate',-1.9,G,1.3,PI/2],
   ['generic_barrel',1.9,G,1.3,0]
  ]);
  hsTarget(0,G,0,'ferry-house');
  popM();
  hsQuartzSpireTower(5.4,2.6,2.65,G,8.6,{steps:7,heliograph:true,doorYaw:0,targetName:'ferry-beacon'});
  hsHarmonicRack(1.8,G,1.4,2.3,0,{chimes:5});
  hsPalmMonolith(5.4,G,6.4,2.75,0);
  hsFurnList([
   ['hush_cable_capstan',0,G,.5,0],
   ['hush_handspeak_mirror_lamp',-2.2,G,.4,PI]
  ]);
  hsTarget(0,.64,-1.8,'ferry-pontoon');
  hsTarget(0,G,3.2,'ferry-quay');
 }});

/* 26. Scull-Oar Reed-Skiff Boatyard & Net-Drying Pier (WATER.still) */
defBuilding({key:'hs_reed_skiff_shed',name:'Scull-Oar Skiff Shed and Net-Drying Pier',seed:37306,cut:true,
 w:16.4,d:15.8,h:8.6,budget:105000,
 tags:{types:['industry'],job:'fishing',style:'terrace'},
 note:'lakeside boatwright shed building felt-oarlock cypress-and-reed skiffs beside a calm slipway basin and char net-drying frames',
 build(){
  const G=.38;
  pushM(TF(0,0,2.4));
  hsPlinth(14.4,8.6,G,{stepW:2.6});
  popM();
  /* North lake slipway basin (WATER.still) */
  const bw=13.8,bd=5.8,bz=-4.2,kt=.38;
  svNoWalk(()=>{
   box('slate',0,0,bz,bw,.08,bd,P('slateD'));
   box('granite',0,.08,bz-bd/2+kt/2,bw,.38,kt,P('granite'));
   for(const sx of [-1,1])box('granite',sx*(bw/2-kt/2),.08,bz,kt,.38,bd-kt,P('granite'));
   /* Sleek cypress & reed lake skiff moored in basin */
   ellip('cypress',-2.4,.34,bz,.62,.24,2.15,P('cypress'),.12,12);
   ellip('reed',-2.4,.44,bz,.48,.12,1.85,P('reed'),.12,10);
  });
  if(CURREC&&!PLACE_DRY){
   const c=new THREE.Vector3(0,0,bz).applyMatrix4(CM),hw=bw*.5-.42,hd=bd*.5-.42;
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'skiff_slipway_basin',level:.3,
    bounds:[c.x-hw,c.z-hd,c.x+hw,c.z+hd],
    poly:[[c.x-hw,c.z-hd],[c.x+hw,c.z-hd],[c.x+hw,c.z+hd],[c.x-hw,c.z+hd]],
    color:0x1b4e5c,roughness:.04
   });
  }
  pushM(TF(-2.0,0,2.2));
  hsBox(8.6,6.4,G,2.85,{mk:'slateWall',socleMk:'granite',socle:.36,holes:{
   s:[{x:0,y:0,w:1.34,h:2.16}],
   n:[{x:0,y:0,w:1.6,h:2.2}],
   w:[{x:0,y:.85,w:1.04,h:.98}]
  }});
  hsDoor(0,G,3.2-HS.WALL/2,0,1.2,2.08);
  hsDoor(0,G,-3.2+HS.WALL/2,PI,1.44,2.1);
  hsWindow(-4.3+HS.WALL/2,G+.85,0,-PI/2,.92,.88);
  hsSlateRoof(8.6,6.4,G+2.85,1.82,{gableMk:'granite'});
  hsFurnList([
   ['job_saw_bench',-2.2,G,-.8,0],
   ['job_net_frame',2.2,G,-.8,0],
   ['job_fish_tray',-2.1,G,1.5,PI/2],
   ['generic_barrel',2.2,G,1.6,0],
   ['job_pole_rack',0,G,-2.2,0]
  ]);
  hsTarget(0,G,0,'boat-shed');
  popM();
  hsSpanPennants(3.8,-.8,3.8,5.4,G+2.25,{mk:'netting'});
  hsHandLamp(3.2,G+HS.HAND_LAMP_Y,5.8,0,{mountH:HS.HAND_LAMP_Y});
  hsTarget(4.2,G,2.4,'net-pier');
 }});

/* 27. Radiant Soapstone & Slate Sanctuary Bakehouse */
defBuilding({key:'hs_slate_bakehouse',name:'Radiant Soapstone and Slate Bakehouse',seed:37307,cut:true,
 w:13.8,d:13.2,h:9.6,budget:95000,
 tags:{types:['shop','industry'],job:'baking',style:'gallery'},
 note:'silent sanctuary bakehouse with massive heat-retaining granite-and-slate beehive bread ovens and a Handspeak counter loggia',
 build(){
  const G=.4,W0=9.4,D0=7.4,H0=2.95;
  pushM(TF(0,0,-.5));
  hsPlinth(11.8,10.6,G,{stepW:2.6});
  pushM(TF(0,0,-.95));
  hsBox(W0,D0,G,H0,{mk:'ashlar',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.34,h:2.18},{x:-2.6,y:.84,w:1.14,h:1.04},{x:2.6,y:.84,w:1.14,h:1.04}],
   e:[{x:0,y:.86,w:1.06,h:.98}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.2,2.1);
  hsWindow(-2.6,G+.84,D0/2-HS.WALL/2,0,1.0,.94);
  hsWindow(2.6,G+.84,D0/2-HS.WALL/2,0,1.0,.94);
  hsWindow(W0/2-HS.WALL/2,G+.86,0,PI/2,.94,.88);
  hsSlateRoof(W0,D0,G+H0,1.95,{gableMk:'ashlar'});
  svNoWalk(()=>{
   box('slate',-2.6,G+H0+.5,-2.1,1.4,2.1,1.4,P('slate'));
   box('quartz',-2.6,G+H0+2.6,-2.1,1.56,.18,1.56,P('quartzPure'));
  });
  smokeAt(-2.6,G+H0+3.0,-2.1,{r:.3,kind:'fire'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-2.6,G,-1.9,0],
   ['generic_meal_ark',2.6,G,-2.1,0],
   ['generic_pantry_shelf',-3.4,G,1.4,PI/2],
   ['generic_bread_basket',2.4,G,1.2,0],
   ['generic_sack',0,G,-2.5,0],
   ['hush_tea_sign_table',0,G,.5,0]
  ]);
  hsTarget(0,G,0,'bakehouse');
  popM();
  hsSignGallery(0,G,3.6,9.2,2.05,2.6,0,{deck:false,bays:3,openCenter:true});
  popM();
 }});

/* 28. Alpine Herb & Cold-Smoked Lake-Char Smokehouse */
defBuilding({key:'hs_herb_smokehouse',name:'Alpine Herb and Lake-Char Smokehouse',seed:37308,cut:true,
 w:13.4,d:12.8,h:10.2,budget:90000,
 tags:{types:['industry'],job:'butchery',style:'terrace'},
 note:'granite-and-slate cold-smokehouse curing ribbon-lake arctic char, mountain goat and alpine juniper/gentian herb bundles',
 build(){
  const G=.38,W0=8.6,D0=7.2,H0=2.9;
  pushM(TF(0,0,-.45));
  hsPlinth(11.4,10.2,G,{stepW:2.5});
  pushM(TF(-.6,0,-.85));
  hsBox(W0,D0,G,H0,{mk:'slateWall',socleMk:'granite',socle:.38,holes:{
   s:[{x:0,y:0,w:1.28,h:2.14},{x:2.3,y:.85,w:1.02,h:.98}],
   w:[{x:0,y:.86,w:1.0,h:.96}]
  }});
  hsDoor(0,G,D0/2-HS.WALL/2,0,1.14,2.06);
  hsWindow(2.3,G+.85,D0/2-HS.WALL/2,0,.9,.88);
  hsWindow(-W0/2+HS.WALL/2,G+.86,0,-PI/2,.88,.86);
  hsSlateRoof(W0,D0,G+H0,2.0,{gableMk:'granite'});
  /* Louvred slate smoke-cupola + gentle alder/juniper smoke plume */
  svNoWalk(()=>{
   box('granite',0,G+H0+1.2,0,1.8,1.5,1.8,P('granite'));
   cone('quartz',0,G+H0+2.7,0,1.15,.85,P('quartzPure'),4);
  });
  smokeAt(0,G+H0+3.7,0,{r:.32,kind:'fire'});
  hsFurnList([
   ['hush_quartz_brazier_stove',-2.2,G,-1.8,0],
   ['generic_hanging_larder',2.1,G,-1.8,0],
   ['generic_cured_meat',-2.2,G,1.4,PI/2],
   ['generic_herb_bundles',2.2,G,1.4,-PI/2],
   ['job_fish_tray',0,G,.2,0]
  ]);
  hsTarget(0,G,0,'smokehouse');
  popM();
  hsSignGallery(-.6,G,3.5,7.8,1.9,2.52,0,{deck:false,bays:3,openCenter:true});
  hsSpanPennants(4.2,-2.2,4.2,2.8,G+2.15,{mk:'linen'});
  popM();
 }});
