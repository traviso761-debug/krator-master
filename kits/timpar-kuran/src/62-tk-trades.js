// prefix: tk
// ================================================================= FOREST CRAFTS, SALMON WEIRS, WORKS & BARTER (PLAN.md §3.4 & §4, seeds 35301..35312)
// Twelve trade, harvest, mining & craft buildings carrying all 41 active Voth census trades in TK_TRADES with 0 gaps:
//   35301 tk_salmon_weir_smokehouse  Live WATER.flow salmon stream w/ basket-trap timber weir, split-cedar smokehouse & racks
//   35302 tk_dugout_armour_yard      Steamed red-cypress dugout canoe shed on WATER.flow landing + slat-armour & wedge yard
//   35303 tk_kaen_firing_court       Cord-marked kaen-doki flame-ware open-pit firing clamp, WATER.still clay pit & potter shed
//   35304 tk_attus_chilkat_loom      Stepped cise elm-bark attus retting & goat-wool Chilkat crest-blanket loom-house
//   35305 tk_copper_cold_forge       role:'mine' native-copper cold-hammering tinaa smithy & raided-steel forge (resSource!)
//   35306 tk_jade_adze_grinder       role:'mine' nephrite/jade wet adze-grinder on WATER.flow flume & megabreccia quarry shed (resSource!)
//   35307 tk_spore_flash_apothecary  Nurse-log forest fungus & spore-flash / spruce-resin apothecary lodge
//   35308 tk_kanopi_salvage_yard     Shored megabreccia delve adit & salvaged Kanopi titanium-alloy shearing / oil-lamp yard
//   35309 tk_pu_clan_granary         Elevated rat-baffled pu stilt granary, crest-chest warehouse & acorn/camas earth-oven
//   35310 tk_berry_mead_tavern       Cloudberry/salmonberry mash & salmon-grease longhouse tavern w/ pack-pony tether court
//   35311 tk_goat_pelt_byre          Mountain-goat, pack-pony & bear-hound byre, smoke-tannery & camas/berry root garden
//   35312 tk_barter_crest_post       Clan barter hall, notched tally-stick moot & war-loot exchange

/* Helper: records a stone-banked mountain stream channel on CURREC.river (drawn via WATER.flow in 91z-tk-world.js). */
function tkStreamChannel(ptsLocal,width,speed,nameSuffix){
 svNoWalk(()=>{
  for(let i=0;i<ptsLocal.length-1;i++){
   const a=ptsLocal[i],b=ptsLocal[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);
   W((a[0]+b[0])/2,0,(a[2]+b[2])/2,yaw,()=>{
    box('cobble',0,0,0,width+1.3,.05,L+.3,hc(SVPAL.cobble[1]));
    for(const sx of [-1,1])box('megabreccia',sx*(width/2+.36),.05,0,.64,.34,L+.2,hc(SVPAL.megabreccia[0]));
   });
  }
 });
 if(CURREC&&!PLACE_DRY){
  const wPts=ptsLocal.map(p=>{
   const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(CM);
   return [v.x,v.y,v.z];
  });
  CURREC.river={name:CURREC.key+'-'+(nameSuffix||'stream'),pts:wPts,width,speed:speed==null?1.35:speed};
 }
}

/* 23. Live Mountain Salmon Weir & Split-Cedar Smokehouse (WATER.flow!) */
defBuilding({key:'tk_salmon_weir_smokehouse',name:'Mountain Salmon Weir and Alder Smokehouse',seed:35301,cut:true,
 w:18.2,d:15.6,h:8.2,budget:115000,
 tags:{types:['industry','shop'],style:'plank',role:'fishery',job:'fishing'},
 note:'live WATER.flow glacial salmon torrent spanned by a staked cedar basket-trap weir beside an alder-smoke fish curing house',
 build(){
  const G=.36;
  /* South (+z) dry bank: split-cedar smokehouse & curing apron */
  pushM(TF(0,0,2.1));
  tkPlinth(13.8,7.8,G,{stepW:2.6,stepX:0});
  tkPlankBox(11.4,6.2,G,3.05,{
   mk:'cedar',socle:.38,postR:.24,
   holes:{
    s:[{x:0,y:0,w:1.72,h:2.18},{x:-3.4,y:.95,w:.95,h:.88},{x:3.4,y:.95,w:.95,h:.88}],
    n:[{x:0,y:0,w:1.58,h:2.08}]
   }
  });
  tkDoor(0,G,3.1-.17,0,1.28,2.04,{inau:true,visor:true,crest:'hueru'});
  tkDoor(0,G,-3.1+.17,PI,1.16,1.96,{inau:false});
  for(const sx of [-3.4,3.4])tkWindow(sx,G+.95,3.1-.17,0,.78,.76,{lit:true});
  tkFormlineScreen(0,G+2.24,3.11,0,10.6,.72,{crest:'hueru'});
  tkPlankRoof(11.4,6.2,G+3.05,2.1,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.6,G,-.2,0],
   ['timpar_smoked_salmon_frame',2.4,G,-1.2,0],
   ['timpar_smoked_salmon_frame',2.4,G,1.1,0],
   ['timpar_dugout_paddle_rack',-4.6,G,-1.8,PI/2],
   ['generic_fish',-2.6,G,1.8,0],
   ['generic_barrel',4.6,G,1.8,0]
  ]);
  tkTarget(0,G,.4,'smokehouse-curing-floor');
  popM();
  /* North (-z = -4.2) mountain salmon stream channel (WATER.flow) + timber weir & walkable weir footbridge! */
  tkStreamChannel([[-8.0,.14,-4.2],[-2.5,.13,-4.35],[2.5,.12,-4.15],[8.0,.11,-4.3]],2.6,1.55,'salmon-torrent');
  /* Walkable cedar plank bridge from smokehouse north door across the salmon weir to north landing */
  box('cypress',0,.38,-3.9,1.85,.14,4.8,hc(SVPAL.cypress[0]));
  box('cobble',0,0,-6.6,3.6,.38,1.2,hc(SVPAL.cobble[0]));
  svNoWalk(()=>{
   /* Slanted cedar weir stakes & conical wicker salmon basket-traps across stream */
   for(let i=-5;i<=5;i++){
    if(Math.abs(i)<=1)continue;
    WX(i*1.15,.12,-4.25,0,-.22,0,()=>cyl('silverwood',0,0,0,.055,1.45,hc(SVPAL.silverwood[0]),7));
   }
   box('silverwood',0,1.15,-4.35,12.4,.09,.1,hc(SVPAL.silverwood[0]));
   for(const sx of [-3.2,3.2]){
    WX(sx,.26,-4.2,PI/2,0,-PI/2,()=>cone('netting',0,0,0,.38,1.35,hc(SVPAL.netting[0]),10));
   }
  });
  tkDryingLine(-5.8,-2.2,-2.2,-2.2,2.1,{mk:'hide'});
  tkTarget(0,.52,-4.2,'salmon-weir-bridge');
 }});

/* 24. Red-Cypress Dugout Canoe & Hardwood Slat-Armour Yard (WATER.flow!) */
defBuilding({key:'tk_dugout_armour_yard',name:'Red-Cypress Dugout Canoe and Slat-Armour Yard',seed:35302,cut:true,
 w:18.6,d:15.8,h:8.4,budget:120000,
 tags:{types:['industry','shop'],style:'plank',role:'shipyard',job:'shipwrighting'},
 note:'steamed red-cypress river dugout carving shed beside a live WATER.flow stream slipway, antler-wedge log splitter and hardwood slat-armour bench',
 build(){
  const G=.38;
  pushM(TF(-1.8,0,.6));
  tkPlinth(12.6,10.6,G,{stepW:2.6,stepX:0});
  tkPlankBox(10.8,8.2,G,3.25,{
   mk:'cypress',socle:.4,postR:.25,
   holes:{
    s:[{x:0,y:0,w:1.85,h:2.24},{x:-3.2,y:.98,w:1.0,h:.92}],
    e:[{x:0,y:0,w:1.68,h:2.12}],
    w:[{x:0,y:.98,w:1.0,h:.92}]
   }
  });
  tkDoor(0,G,4.1-.17,0,1.38,2.1,{inau:true,visor:true,crest:'rapan'});
  tkDoor(5.4-.17,G,0,PI/2,1.24,1.98,{inau:false});
  tkWindow(-3.2,G+.98,4.1-.17,0,.82,.8,{lit:true});
  tkWindow(-5.4+.17,G+.98,0,-PI/2,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.34,4.11,0,10.0,.78,{crest:'rapan'});
  tkPlankRoof(10.8,8.2,G+3.25,2.15,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:false});
  /* Half-adzed 5.6 m red-cypress river dugout hull on trestles inside yard! */
  svNoWalk(()=>{
   for(const sz of [-1.6,1.6])box('cypress',2.4,G,sz,1.25,.38,.28,hc(SVPAL.cypressD[0]));
   ellip('cypress',2.4,G+.62,0,.58,.36,2.75,hc(SVPAL.cypress[0]),0,12);
   for(const sz of [-2.55,2.55])box('formBlack',2.4,G+.68,sz,.36,.52,.44,hc(SVPAL.formBlack[0]));
  });
  tkFurnList([
   ['painted_common_workbench',-3.2,G,-2.4,0],
   ['timpar_slat_cuirass_stand',-3.6,G,.6,PI/2],
   ['timpar_dugout_paddle_rack',-1.2,G,-3.3,0],
   ['timpar_visor_war_helm',-3.6,G,2.4,PI/2],
   ['painted_trade_lathe',2.4,G,-3.1,0],
   ['generic_crate',3.8,G,2.6,0]
  ]);
  tkTarget(-1.2,G,1.2,'dugout-carving-floor');
  popM();
  /* East (+x = 6.4) river landing channel (WATER.flow) + timber canoe jetty */
  tkStreamChannel([[6.4,.13,-6.8],[6.5,.12,-2.0],[6.35,.11,2.5],[6.45,.1,6.8]],2.3,1.25,'canoe-slipway');
  box('cedar',4.8,.38,.6,2.1,.14,3.4,hc(SVPAL.cedar[0]));
  tkWindBanner(-6.8,0,5.2,.18,1.4,2.05,{mk:'attus'});
  tkTarget(4.6,.52,.6,'canoe-landing-jetty');
 }});

/* 25. Kaen-Doki Cord-Marked Flame-Ware Open-Pit Firing Court (WATER.still clay pit!) */
defBuilding({key:'tk_kaen_firing_court',name:'Kaen-Doki Flame-Ware Open-Pit Firing Court',seed:35303,cut:true,
 w:16.4,d:14.2,h:7.8,budget:100000,
 tags:{types:['industry','shop'],style:'jomon',role:'kiln',job:'pottery'},
 note:'Jomon-tradition river-clay levigation basin (WATER.still), potter wheel-less coiling shed and smouldering open-pit clamp firing kaen-doki flame-ware',
 build(){
  const G=.36;
  pushM(TF(0,0,-.45));
  tkPlinth(14.4,11.4,G,{stepW:2.6,stepX:-2.4});
  /* West coiling & cord-impressing shed */
  pushM(TF(-2.8,0,-.6));
  tkPlankBox(7.4,7.4,G,2.85,{
   mk:'bark',socle:.38,postR:.22,
   holes:{s:[{x:0,y:0,w:1.68,h:2.12}],e:[{x:0,y:.95,w:1.0,h:.88}]}
  });
  tkDoor(0,G,3.7-.17,0,1.24,1.98,{inau:true});
  tkWindow(3.7-.17,G+.95,0,PI/2,.82,.78,{lit:true});
  tkCiseRoof(7.4,7.4,G+2.85,2.2,{courses:6,crownR:.38,crownH:.72});
  popM();
  /* East yard: glowing open-pit bark-and-turf pottery clamp + glacial silt-clay settling pit (WATER.still!) */
  svNoWalk(()=>{
   const kx=3.8,kz=-2.2;
   box('cobble',kx,G,kz,3.4,.34,3.4,hc(SVPAL.cobble[0]));
   cyl('earth',kx,G+.34,kz,1.35,.48,hc(SVPAL.earth[0]),12,.95);
   cyl('glow',kx,G+.82,kz,.62,.08,0xff6e22,10);
   for(let i=0;i<4;i++){
    const a=i*TAU/4+.4;
    cyl('kaen',kx+Math.cos(a)*.55,G+.52,kz+Math.sin(a)*.55,.22,.44,hc(SVPAL.kaen[0]),10);
   }
  });
  haloAt(3.8,G+1.05,-2.2,0xff7a28,true);
  smokeAt(3.8,G+1.25,-2.2,{r:.38,kind:'fire'});
  /* South-east clay levigation settling pool (WATER.still) */
  const px=3.9,pz=2.3,pw=3.2,pd=3.2,rimH=.38;
  svNoWalk(()=>{
   for(const sz of [-1,1])box('megabreccia',px,G,pz+sz*(pd/2-.2),pw,rimH,.4,hc(SVPAL.megabreccia[0]));
   for(const sx of [-1,1])box('megabreccia',px+sx*(pw/2-.2),G,pz,.4,rimH,pd-.8,hc(SVPAL.megabreccia[1]));
   box('earth',px,G,pz,pw-.8,.08,pd-.8,hc(SVPAL.earth[0]));
  });
  tkWindBanner(5.6,G,4.6,-.2,1.35,1.95,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.8,G,-.8,0],
   ['painted_common_workbench',-4.6,G,-2.6,PI/2],
   ['painted_trade_kiln',-1.1,G,-2.8,0],
   ['generic_storage_jar',-4.8,G,1.4,0],
   ['timpar_kerfed_bentwood_chest',-1.2,G,1.6,0,0],
   ['timpar_attus_bale_bench',1.4,G,.2,0]
  ]);
  tkTarget(-2.8,G,.8,'potter-coiling-shed');
  tkTarget(1.8,G,1.8,'clamp-firing-yard');
  if(CURREC&&!PLACE_DRY){
   const c0=new THREE.Vector3(px-1.15,G+rimH-.09,pz-1.15).applyMatrix4(CM);
   const c1=new THREE.Vector3(px+1.15,G+rimH-.09,pz+1.15).applyMatrix4(CM);
   const x0=Math.min(c0.x,c1.x),x1=Math.max(c0.x,c1.x),z0=Math.min(c0.z,c1.z),z1=Math.max(c0.z,c1.z);
   (CURREC.stills=CURREC.stills||[]).push({
    name:CURREC.key+'-claypit',level:c0.y,bounds:[x0,z0,x1,z1],
    poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],color:0x3d5c52
   });
  }
  popM();
 }});

/* 26. Elm-Bark Attus & Goat-Wool Chilkat Crest-Blanket Loom-House */
defBuilding({key:'tk_attus_chilkat_loom',name:'Attus Bark and Chilkat Crest-Blanket Loom-House',seed:35304,cut:true,
 w:15.4,d:13.2,h:8.0,budget:95000,
 tags:{types:['industry','shop'],style:'plank',role:'weaver',job:'weaving'},
 note:'split-cypress & stepped-cise weaving lodge where retted mountain-elm inner bark and mountain-goat wool become attus robes and Chilkat crest blankets',
 build(){
  const G=.38,W=11.6,D=9.2,H=3.15;
  pushM(TF(0,0,-.45));
  tkPlinth(W+.8,D+1.2,G,{stepW:2.6,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.38,postR:.24,
   holes:{
    s:[{x:0,y:0,w:1.78,h:2.24},{x:-3.4,y:.95,w:1.1,h:1.0},{x:3.4,y:.95,w:1.1,h:1.0}],
    e:[{x:0,y:.98,w:1.1,h:.95}],w:[{x:0,y:.98,w:1.1,h:.95}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.32,2.1,{inau:true});
  for(const sx of [-3.4,3.4])tkWindow(sx,G+.95,D/2-.17,0,.92,.88,{lit:true});
  tkWindow(W/2-.17,G+.98,0,PI/2,.92,.86,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+.98,0,-PI/2,.92,.86,{lit:true});
  tkFormlineScreen(0,G+2.34,D/2+.01,0,W-.8,.74,{crest:'kapac'});
  tkCiseRoof(W,D,G+H,2.3,{courses:6,crownR:.34,crownH:.64});
  /* Outdoor Chilkat & attus dye-drying racks swaying in valley draft */
  tkWindBanner(-4.4,G,D/2+.95,.15,1.65,2.25,{mk:'chilkat'});
  tkWindBanner(4.4,G,D/2+.95,-.15,1.65,2.25,{mk:'attus'});
  tkFurnList([
   ['timpar_chilkat_loom',-3.4,G,-2.2,0],
   ['timpar_chilkat_loom',3.4,G,-2.2,0],
   ['timpar_irori_kaen_hearth',0,G,.2,0],
   ['timpar_attus_bale_bench',-3.8,G,1.8,PI/2],
   ['painted_trade_vat',3.8,G,1.8,-PI/2],
   ['timpar_kerfed_bentwood_chest',0,G,-3.3,0,0],
   ['painted_court_tapestry',0,G,-3.9,0]
  ]);
  tkTarget(0,G,1.2,'chilkat-loom-hall');
  popM();
 }});

/* 27. Native-Copper Cold-Forge & Raided-Steel Smithy (role: 'mine' -> resSource!) */
defBuilding({key:'tk_copper_cold_forge',name:'Native-Copper Tinaa Cold-Forge and Loot Smithy',seed:35305,cut:true,
 w:15.8,d:13.6,h:8.4,budget:105000,
 tags:{types:['industry','shop'],style:'plank',role:'mine',job:'smithing'},
 note:'works nearest copper/iron node via resSource: cold-hammering native Veiled-Mountain float-copper into tinaa shields and reforging looted Eternian steel',
 build(){
  const G=.4,W=11.4,D=9.0,H=3.25;
  pushM(TF(-1.0,0,-.45));
  tkPlinth(W+2.4,D+.8,G,{stepW:2.6,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.52,postR:.25,
   holes:{
    s:[{x:0,y:0,w:1.85,h:2.24},{x:-3.3,y:1.0,w:1.0,h:.92}],
    e:[{x:0,y:0,w:1.68,h:2.12}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.38,2.1,{inau:true,visor:true,crest:'kuma'});
  tkDoor(W/2-.17,G,0,PI/2,1.24,1.98,{inau:false});
  tkWindow(-3.3,G+1.0,D/2-.17,0,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.34,D/2+.01,0,W-.8,.78,{crest:'kuma'});
  tkPlankRoof(W,D,G+H,2.2,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:true});
  /* Side charcoal & stone annealing forge hood at +x = 6.5 */
  svNoWalk(()=>{
   box('megabreccia',6.5,G,-1.2,1.8,1.25,1.8,hc(SVPAL.megabreccia[0]));
   box('glow',6.5,G+1.25,-1.2,.85,.08,.85,0xff6e22);
   cyl('kaen',6.5,G+1.85,-1.2,.42,1.65,hc(SVPAL.kaenSoot[0]),10,.28);
  });
  haloAt(6.5,G+1.45,-1.2,0xff7a28,true);
  smokeAt(6.5,G+3.6,-1.2,{r:.36,kind:'fire'});
  tkWindBanner(-4.6,G,D/2+.85,.15,1.35,2.0,{mk:'chilkat'});
  tkFurnList([
   ['painted_trade_forge',-3.2,G,-2.4,0],
   ['painted_trade_anvil',-1.2,G,-1.8,0],
   ['hl_tri_quench_tub',1.4,G,-2.4,0],
   ['timpar_copper_shield_crest',3.4,G,-3.2,0],
   ['timpar_copper_shield_crest',-3.6,G,2.4,PI/2],
   ['timpar_eternian_trophy_rack',3.4,G,2.2,-PI/2],
   ['painted_trade_grindstone',6.4,G,1.8,0]
  ]);
  tkTarget(0,G,1.0,'copper-forge-floor');
  tkTarget(6.3,G,.4,'annealing-yard');
  popM();
 }});

/* 28. Nephrite/Jade Boulder Adze-Grinder & Megabreccia Quarry Shed (role: 'mine' -> resSource + WATER.flow!) */
defBuilding({key:'tk_jade_adze_grinder',name:'Jade Adze-Grinder and Megabreccia Quarry Shed',seed:35306,cut:true,
 w:17.2,d:14.6,h:8.0,budget:105000,
 tags:{types:['industry'],style:'jomon',role:'mine',job:'quarrying'},
 note:'works nearest nephrite/emerald/stone node via resSource: wet quartz-sand sandstone slab grinding greenstone adzes beside a live WATER.flow mountain rill',
 build(){
  const G=.38;
  pushM(TF(-1.6,0,.5));
  tkPlinth(11.8,9.8,G,{stepW:2.5,stepX:0});
  tkPlankBox(10.2,7.6,G,2.95,{
   mk:'cedar',socle:.48,postR:.23,
   holes:{
    s:[{x:0,y:0,w:1.72,h:2.14},{x:-3.0,y:.95,w:.95,h:.86}],
    e:[{x:0,y:0,w:1.58,h:2.06}]
   }
  });
  tkDoor(0,G,3.8-.17,0,1.28,2.0,{inau:true});
  tkDoor(5.1-.17,G,0,PI/2,1.16,1.94,{inau:false});
  tkWindow(-3.0,G+.95,3.8-.17,0,.78,.74,{lit:true});
  tkCiseRoof(10.2,7.6,G+2.95,2.1,{courses:5,crownR:.32,crownH:.58});
  /* Sawn emerald-green nephrite boulder & wet sandstone grinding bench inside shed */
  svNoWalk(()=>{
   box('megabreccia',2.4,G,-1.8,1.5,.54,1.1,hc(SVPAL.megabreccia[0]));
   box('jade',2.4,G+.54,-1.8,.86,.42,.62,hc(SVPAL.jade[0]));
  });
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.4,G,-.6,0],
   ['painted_common_workbench',-3.2,G,-2.4,0],
   ['painted_trade_grindstone',1.8,G,1.4,0],
   ['timpar_dugout_paddle_rack',-3.6,G,1.6,PI/2],
   ['generic_crate',3.2,G,2.2,0],
   ['timpar_kanopi_alloy_lamp',0,G,-2.8,0]
  ]);
  tkTarget(-0.8,G,.8,'adze-grinding-shed');
  popM();
  /* East (+x = 5.8) wet grinding rill (WATER.flow) */
  tkStreamChannel([[5.8,.13,-6.2],[5.9,.12,-1.5],[5.75,.11,2.2],[5.85,.1,6.2]],1.9,1.4,'grinding-rill');
  box('cobble',4.4,.38,.5,1.8,.12,2.8,hc(SVPAL.cobble[0]));
  tkWindBanner(-6.2,0,4.6,.18,1.3,1.95,{mk:'attus'});
  tkTarget(4.3,.5,.5,'rill-apron');
 }});

/* 29. Nurse-Log Fungus & Spore-Flash Apothecary Lodge */
defBuilding({key:'tk_spore_flash_apothecary',name:'Spore-Flash and Nurse-Log Fungus Apothecary',seed:35307,cut:true,
 w:14.4,d:12.8,h:7.4,budget:90000,
 tags:{types:['industry','shop'],style:'jomon',role:'apothecary',job:'fungiculture'},
 note:'damp moss-and-bark rainforest lodge cultivating edible and blinding spore-flash fungi on inoculated red-cypress nurse logs alongside spruce-resin salves',
 build(){
  const G=.34,W=10.4,D=8.6,H=2.75;
  pushM(TF(0,0,-.45));
  tkPlinth(W+.8,D+1.2,G,{stepW:2.3,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'bark',socle:.42,postR:.22,
   holes:{
    s:[{x:0,y:0,w:1.68,h:2.12},{x:3.0,y:.92,w:.92,h:.82}],
    e:[{x:0,y:.92,w:.92,h:.82}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.24,1.98,{inau:true});
  tkWindow(3.0,G+.92,D/2-.17,0,.74,.7,{lit:true});
  tkWindow(W/2-.17,G+.92,0,PI/2,.74,.7,{spirit:true,lit:true});
  tkCiseRoof(W,D,G+H,2.2,{courses:6,mk:'turf',crownR:.32,crownH:.6});
  /* Stacked inoculated red-cypress nurse logs fruiting pale & amber rainforest bracket-caps */
  svNoWalk(()=>{
   for(let r=0;r<2;r++){
    const lx=-3.1,lz=-1.8+r*1.6;
    WX(lx,G+.24,lz,0,0,PI/2,()=>cyl('bark',0,-1.2,0,.22,2.4,hc(SVPAL.bark[0]),10));
    for(let c=-2;c<=2;c++){
     cyl('inau',lx+c*.42,G+.46,lz,.11,.06,hc(SVPAL.inau[0]),8);
    }
   }
  });
  tkDryingLine(-4.2,D/2+.85,-1.6,D/2+.85,G+1.9,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',1.8,G,-.6,0],
   ['hl_tri_herb_rack',3.4,G,-2.6,0],
   ['painted_trade_still',-3.2,G,2.0,PI/2],
   ['generic_mushrooms',1.8,G,1.8,0],
   ['timpar_kanopi_alloy_lamp',0,G,-3.1,0],
   ['generic_spice_box',3.4,G,1.8,-PI/2]
  ]);
  tkTarget(0,G,.9,'apothecary-floor');
  popM();
 }});

/* 30. Shored Kanopi Arcology Salvage Delve & Alloy Yard */
defBuilding({key:'tk_kanopi_salvage_yard',name:'Kanopi Arcology Salvage Delve and Alloy Yard',seed:35308,cut:true,
 w:16.6,d:14.4,h:8.8,budget:110000,
 tags:{types:['industry','infrastructure'],style:'plank',role:'salvage'},
 note:'timber-shored delve portal into shattered Kanopi crash-megabreccia where clans shear titanium-ceramic hull ribs into blades, reflectors and fish-oil lamps',
 build(){
  const G=.4;
  pushM(TF(0,0,-.45));
  tkPlinth(14.6,11.6,G,{stepW:2.8,stepX:0});
  /* West sorting & lamp-rigging plank shed */
  pushM(TF(-3.0,0,.4));
  tkPlankBox(7.6,7.8,G,3.1,{
   mk:'cypress',socle:.44,postR:.24,
   holes:{s:[{x:0,y:0,w:1.72,h:2.18}],e:[{x:0,y:0,w:1.58,h:2.08}]}
  });
  tkDoor(0,G,3.9-.17,0,1.28,2.04,{inau:true});
  tkDoor(3.8-.17,G,0,PI/2,1.16,1.94,{inau:false});
  tkFormlineScreen(0,G+2.28,3.91,0,6.8,.72,{crest:'kapac'});
  tkPlankRoof(7.6,7.8,G+3.1,2.0,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:false});
  popM();
  /* East yard: tilted megabreccia crash-mound pierced by a salvaged Kanopi titanium-alloy rib portal! */
  svNoWalk(()=>{
   box('megabreccia',3.8,G,-2.6,5.2,3.4,4.2,hc(SVPAL.megabreccia[0]));
   box('megabreccia',3.8,G+3.4,-2.9,3.8,1.1,3.2,hc(SVPAL.megabreccia[1]));
   box('kanopiWhite',3.8,G+.15,1.8,2.4,.16,1.5,hc(SVPAL.kanopiWhite[0]),.18);
  });
  tkKanopiRib(3.8,G,-.4,0,4.6,3.6,{segs:10,w:.36});
  svDoorway(3.8,G,-.48,0,1.65,2.15,{hollow:false,mk:'kanopiAlloy',col:hc(SVPAL.kanopiAlloy[0]),style:'panel'});
  tkInauCluster(1.9,G,-.2,0,1.35,3);
  tkInauCluster(5.7,G,-.2,0,1.35,3);
  tkWindBanner(5.8,G,4.4,-.2,1.4,2.05,{mk:'chilkat'});
  tkFurnList([
   ['timpar_kanopi_alloy_lamp',-3.0,G,.4,0],
   ['timpar_kanopi_alloy_lamp',1.8,G,2.8,0],
   ['painted_common_workbench',-4.8,G,-1.8,PI/2],
   ['hl_tri_scrap_anvil',-1.4,G,-2.0,0],
   ['timpar_kerfed_bentwood_chest',-4.8,G,2.2,PI/2,1],
   ['scrap_poor_rack',-1.4,G,2.4,PI]
  ]);
  tkTarget(-3.0,G,1.2,'salvage-sorting-shed');
  tkTarget(3.6,G,1.6,'kanopi-delve-apron');
  popM();
 }});

/* 31. Elevated Rat-Baffled Pu Clan Granary & Earth-Oven Bakehouse */
defBuilding({key:'tk_pu_clan_granary',name:'Rat-Baffled Pu Stilt Granary and Acorn Bakehouse',seed:35309,cut:true,
 w:16.8,d:14.6,h:9.4,budget:110000,
 tags:{types:['industry','infrastructure'],style:'plank',role:'granary',job:'milling'},
 note:'elevated Ainu pu clan storehouse on nezumi-gaeshi rat-baffled cedar stilts beside a wooden-mortar acorn/camas pounding & earth-oven bakehouse',
 build(){
  const G=.34;
  pushM(TF(0,0,-.55));
  tkPlinth(14.8,11.6,G,{stepW:2.8,stepX:0});
  /* West side: elevated rat-baffled pu clan granary (walkable stair up to deckY!) */
  pushM(TF(-3.4,0,-.6));
  const deckY=tkPuStilts(6.2,6.2,G,1.78,{postR:.19,stairX:0});
  tkPlankBox(5.8,5.6,deckY,2.55,{
   mk:'cypress',socle:0,postR:.2,
   holes:{s:[{x:0,y:0,w:1.48,h:1.98}]}
  });
  tkDoor(0,deckY,2.8-.17,0,1.1,1.86,{inau:true});
  tkFormlineScreen(0,deckY+1.94,2.81,0,5.2,.56,{crest:'kuma'});
  tkCiseRoof(5.8,5.6,deckY+2.55,1.95,{courses:5,smoke:false,crownR:.26,crownH:.46});
  popM();
  /* East side: ground-level acorn/fern-root pounding & hot-cobble earth-oven bakehouse */
  pushM(TF(3.8,0,-.4));
  tkPlankBox(5.8,7.2,G,2.75,{
   mk:'cedar',socle:.38,postR:.21,
   holes:{s:[{x:0,y:0,w:1.58,h:2.08}],w:[{x:0,y:.92,w:.9,h:.82}]}
  });
  tkDoor(0,G,3.6-.17,0,1.18,1.94,{inau:true});
  tkWindow(-2.9+.17,G+.92,0,-PI/2,.74,.7,{lit:true});
  tkPlankRoof(5.8,7.2,G+2.75,1.75,{mk:'shingle',cobbles:true,smokeShutter:true,kaenFinials:false});
  popM();
  tkWindBanner(6.2,G,4.6,-.2,1.35,1.95,{mk:'attus'});
  tkFurnList([
   ['timpar_kerfed_bentwood_chest',-4.6,deckY,-2.2,PI/2,0],
   ['timpar_kerfed_bentwood_chest',-2.2,deckY,-2.2,-PI/2,1],
   ['generic_sack',-3.4,deckY,-.2,0],
   ['generic_meal_ark',-3.4,G,-.6,0],
   ['timpar_irori_kaen_hearth',3.8,G,-.8,0],
   ['hl_tri_grain_mortar',2.4,G,1.4,0],
   ['generic_bread_basket',5.0,G,1.4,-PI/2],
   ['painted_trade_bin',5.0,G,-2.4,-PI/2]
  ]);
  tkTarget(-3.4,deckY,-.4,'elevated-pu-granary');
  tkTarget(-3.4,G,.8,'pu-undercroft');
  tkTarget(3.8,G,.8,'acorn-bakehouse');
  popM();
 }});

/* 32. Cloudberry-Mash & Grease-Feast Longhouse Tavern */
defBuilding({key:'tk_berry_mead_tavern',name:'Cloudberry-Mash and Grease-Feast Tavern',seed:35310,cut:true,
 w:16.8,d:14.2,h:8.6,budget:115000,
 tags:{types:['tavern','inn'],wealth:'middle',style:'plank',role:'tavern',job:'brewing'},
 note:'smoke-warmed split-cypress trail tavern brewing cloudberry and birch-sap mash in kaen-doki vats with a roofed pack-pony tether court',
 build(){
  const G=.38,W=12.4,D=9.4,H=3.3;
  pushM(TF(-1.2,0,-.45));
  tkPlinth(W+2.6,D+.8,G,{stepW:2.8,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.4,postR:.25,
   holes:{
    s:[{x:0,y:0,w:1.82,h:2.24},{x:-3.6,y:.96,w:1.05,h:.96},{x:3.6,y:.96,w:1.05,h:.96}],
    n:[{x:-3.0,y:1.0,w:1.0,h:.92},{x:3.0,y:1.0,w:1.0,h:.92}],
    e:[{x:0,y:0,w:1.58,h:2.08}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.36,2.1,{inau:true,visor:true,crest:'rapan'});
  tkDoor(W/2-.17,G,0,PI/2,1.16,1.94,{inau:false});
  for(const sx of [-3.6,3.6])tkWindow(sx,G+.96,D/2-.17,0,.86,.84,{lit:true});
  for(const sx of [-3.0,3.0])tkWindow(sx,G+1.0,-D/2+.17,PI,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.34,D/2+.01,0,W-.8,.8,{crest:'rapan'});
  tkPlankRoof(W,D,G+H,2.25,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:true});
  /* Side roofed pack-pony tether lean-to on +x */
  svNoWalk(()=>{
   for(const sz of [-3.2,0,3.2])cyl('cypress',W/2+1.95,G,sz,.14,2.35,hc(SVPAL.cypressD[0]),8);
   plane4('bark',[W/2-.1,G+2.85,-3.8],[W/2+2.15,G+2.25,-3.8],[W/2-.1,G+2.85,3.8],.09,hc(SVPAL.bark[0]));
  });
  tkWindBanner(-5.2,G,D/2+.85,.15,1.45,2.1,{mk:'chilkat'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-.3,0],
   ['timpar_bear_feast_trough',-3.4,G,-.4,PI/2],
   ['painted_common_table',3.4,G,-.4,-PI/2],
   ['painted_trade_vat',-4.2,G,-3.2,0],
   ['painted_trade_barrel',4.2,G,-3.2,0],
   ['timpar_attus_bale_bench',-3.4,G,2.4,PI],
   ['timpar_kanopi_alloy_lamp',2.4,G,2.6,0],
   ['painted_trade_trough',W/2+1.2,G,1.4,PI/2]
  ]);
  tkTarget(0,G,1.2,'tavern-feast-hall');
  tkTarget(W/2+1.0,G,0,'pack-pony-shelter');
  popM();
 }});

/* 33. Mountain-Goat Byre, Smoke-Tannery & Camas Root-Garden */
defBuilding({key:'tk_goat_pelt_byre',name:'Mountain-Goat Byre, Tannery and Camas Root-Beds',seed:35311,cut:true,
 w:17.4,d:14.8,h:7.8,budget:105000,
 tags:{types:['farm','industry'],style:'jomon',role:'farm',job:'herding'},
 note:'bark-roofed wool-goat and bear-hound winter byre paired with an alder-smoke hide-stretching frame and mulched camas/salmonberry beds',
 build(){
  const G=.34;
  pushM(TF(0,0,-.45));
  tkPlinth(15.4,11.8,G,{stepW:2.8,stepX:-2.4});
  /* West wool-goat & tannery barn */
  pushM(TF(-2.8,0,-.6));
  tkPlankBox(8.4,7.8,G,2.85,{
   mk:'bark',socle:.44,postR:.23,
   holes:{
    s:[{x:0,y:0,w:1.78,h:2.14}],
    e:[{x:0,y:0,w:1.62,h:2.06}],
    w:[{x:0,y:.95,w:.95,h:.84}]
   }
  });
  tkDoor(0,G,3.9-.17,0,1.34,2.0,{inau:true});
  tkDoor(4.2-.17,G,0,PI/2,1.2,1.92,{inau:false});
  tkWindow(-4.2+.17,G+.95,0,-PI/2,.78,.72,{lit:true});
  tkCiseRoof(8.4,7.8,G+2.85,2.15,{courses:6,crownR:.34,crownH:.62});
  popM();
  /* East yard: stretched bear/goat hide-tanning rack + raised timber-edged camas & berry mulch beds */
  tkWindBanner(3.8,G,-3.6,0,2.1,2.1,{mk:'hide'});
  svNoWalk(()=>{
   for(const bz of [-.8,2.2]){
    box('cypress',4.2,G,bz,4.6,.26,1.85,hc(SVPAL.cypressD[0]));
    box('turf',4.2,G+.26,bz,4.28,.08,1.54,hc(SVPAL.turf[0]));
   }
   /* Split-rail goat paddock fence along +x/+z corner */
   for(let i=0;i<4;i++)cyl('silverwood',2.0+i*1.5,G,4.6,.065,1.05,hc(SVPAL.silverwood[0]),7);
   box('cedar',4.25,G+.52,4.6,4.7,.07,.08,hc(SVPAL.cedar[0]));
   box('cedar',4.25,G+.86,4.6,4.7,.07,.08,hc(SVPAL.cedar[0]));
  });
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.8,G,-.6,0],
   ['painted_trade_hayrack',-5.6,G,-2.6,PI/2],
   ['painted_trade_trough',-5.4,G,.8,PI/2],
   ['generic_churn',-.6,G,-2.8,0],
   ['generic_cheese',-.6,G,1.8,0],
   ['generic_veg_basket',2.2,G,.8,0],
   ['hl_tri_haycock',6.0,G,-2.8,0]
  ]);
  tkTarget(-2.8,G,.8,'goat-byre-floor');
  tkTarget(2.2,G,.8,'camas-garden-yard');
  popM();
 }});

/* 34. Clan Barter Hall & Notched Tally-Stick Exchange */
defBuilding({key:'tk_barter_crest_post',name:'Clan Barter Hall and Tally-Stick Exchange',seed:35312,cut:true,
 w:16.2,d:13.8,h:9.2,budget:110000,
 tags:{types:['market','shop','civic'],wealth:'middle',style:'crest',role:'market',job:'trading',market:true},
 note:'open-porch clan barter house with frontal crest pole where pelts, smoked salmon, copper tinaa and raided lowland goods change hands by tally-stick',
 build(){
  const G=.4,W=13.2,D=9.2,H=3.45;
  pushM(TF(0,0,-.5));
  tkPlinth(W+.8,D+1.6,G,{stepW:3.0,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.42,postR:.26,
   holes:{
    s:[{x:0,y:0,w:2.6,h:2.62},{x:-4.1,y:.95,w:1.15,h:1.0},{x:4.1,y:.95,w:1.15,h:1.0}],
    n:[{x:-3.2,y:1.05,w:1.05,h:.95},{x:3.2,y:1.05,w:1.05,h:.95}],
    e:[{x:0,y:1.05,w:1.05,h:.95}]
   }
  });
  for(const sx of [-4.1,4.1])tkWindow(sx,G+.95,D/2-.17,0,.96,.88,{lit:true});
  for(const sx of [-3.2,3.2])tkWindow(sx,G+1.05,-D/2+.17,PI,.88,.82,{lit:true});
  tkWindow(W/2-.17,G+1.05,0,PI/2,.88,.84,{spirit:true,lit:true});
  tkFormlineScreen(0,G+.46,D/2+.01,0,W-.8,H-.54,{crest:'kuma',cutW:2.9,cutH:2.8});
  tkTotemPortal(0,G,D/2-.1,0,8.6,.38,1.34,2.06,{crest:'kuma',wings:true,name:'barter-post-mouth'});
  tkPlankRoof(W,D,G+H,2.3,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkWindBanner(-5.4,G,D/2+.95,.18,1.5,2.15,{mk:'chilkat'});
  tkWindBanner(5.4,G,D/2+.95,-.18,1.5,2.15,{mk:'attus'});
  tkFurnList([
   ['painted_common_counter',-3.4,G,1.2,0],
   ['painted_common_counter',3.4,G,1.2,0],
   ['timpar_irori_kaen_hearth',0,G,-1.2,0],
   ['timpar_kerfed_bentwood_chest',-4.4,G,-3.2,0,0],
   ['timpar_kerfed_bentwood_chest',4.4,G,-3.2,0,1],
   ['timpar_copper_shield_crest',-2.0,G,-3.6,0],
   ['timpar_eternian_trophy_rack',2.0,G,-3.6,0],
   ['painted_trade_display',-5.2,G,-.8,PI/2],
   ['painted_common_books',3.4,G+svfH('painted_common_counter',0,.9),1.2,0]
  ]);
  tkTarget(0,G,1.6,'barter-counter-floor');
  popM();
 }});
