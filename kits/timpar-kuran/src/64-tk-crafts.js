// prefix: tk
// ================================================================= RAINFOREST CROFTS, GREASE TRY-WORKS, TOTEM CARVERS & CORRALS (seeds 35313..35316)
// Four specialist Veiled-Mountain clan craft, food & pass-transport buildings completing the 38-def Timpar-Kuran roster:
//   35313 tk_camas_earth_oven    Rainforest camas/taro root croft, CMT stripped-cedar posts & steaming fern-starch/acorn earth-oven
//   35314 tk_grease_tryworks     PNW/Tlingit eulachon/candlefish & salmon-grease hot-stone rendering canoes & bentwood box press
//   35315 tk_totem_carving_shed  Red-cypress horizontal totem-trunk carving long-shed, nephrite adzes & open-eyed war-visor pegs
//   35316 tk_pony_hound_corral   Veilpass smuggling pack-pony turf stable, split-cedar rail corral & inau-hung bear-hound kennels

/* 35. Rainforest Camas Croft and Fern-Starch Earth-Oven */
defBuilding({key:'tk_camas_earth_oven',name:'Rainforest Camas Croft and Fern-Starch Earth-Oven',seed:35313,cut:true,
 w:17.2,d:14.6,h:7.6,budget:100000,
 tags:{types:['farm','shop'],wealth:'poor',style:'jomon',role:'bakery',job:'farming'},
 note:'megabreccia-edged camas and mountain-taro beds, CMT bark-stripped cloud-cedars, hot-cobble fern-starch & acorn loaf earth-oven under rain-hood, and cise drying shed',
 build(){
  const G=.34;
  pushM(TF(0,0,-.45));
  tkPlinth(15.2,11.6,G,{stepW:2.8,stepX:-3.2});
  /* West side: stepped Ainu bark/reed cise root-drying & loaf-kneading shed with Bear/Salmon gable */
  pushM(TF(-3.8,0,-.6));
  tkPlankBox(6.8,7.4,G,2.65,{
   mk:'bark',socle:.4,postR:.21,
   holes:{s:[{x:0,y:0,w:1.62,h:2.08}],e:[{x:0,y:.9,w:.92,h:.82}]}
  });
  tkDoor(0,G,3.7-.17,0,1.2,1.94,{inau:true});
  tkWindow(3.4-.17,G+.9,0,PI/2,.74,.7,{spirit:true,lit:true});
  tkCiseRoof(6.8,7.4,G+2.65,2.05,{courses:5,crownR:.3,crownH:.54});
  tkFormlineGable(0,G+2.72,3.82,0,5.2,1.45,{crest:'kuma'});
  popM();
  /* Centre-North: split-cypress 4-post rain-hood sheltering a steaming hot-cobble acorn & fern-starch earth-oven pit */
  svNoWalk(()=>{
   const ox=1.4,oz=-2.5;
   for(const sx of [-1.45,1.45])for(const sz of [-1.35,1.35]){
    cyl('cypress',ox+sx,G,oz+sz,.12,2.35,hc(SVPAL.cypressD[0]),8);
   }
   plane4('shingle',[ox-1.75,G+2.25,oz-1.65],[ox,G+2.95,oz-1.65],[ox-1.75,G+2.25,oz+1.65],.09,hc(SVPAL.shingle[0]));
   plane4('shingle',[ox,G+2.95,oz-1.65],[ox+1.75,G+2.25,oz-1.65],[ox,G+2.95,oz+1.65],.09,hc(SVPAL.shingle[0]));
   /* Steaming cobble-kerbed baking mound */
   cyl('cobble',ox,G,oz,1.15,.26,hc(SVPAL.cobble[0]),12);
   cyl('earth',ox,G+.26,oz,.88,.24,hc(SVPAL.earth[0]),12,.58);
   cyl('glow',ox,G+.5,oz,.38,.05,0xff6e22,10);
   /* East side: raised digging-stick camas & taro mulch beds edged with megabreccia cobbles + CMT stripped cloud-cedar posts */
   for(const bz of [-.4,2.3]){
    box('megabreccia',4.6,G,bz,4.4,.28,1.8,hc(SVPAL.megabreccia[0]));
    box('turf',4.6,G+.28,bz,4.04,.09,1.46,hc(SVPAL.turf[0]));
   }
   for(const [tx,tz] of [[6.9,-3.8],[6.9,4.2]]){
    /* Culturally modified cloud-cedar (CMT): pale stripped inner-bark harvest scar below rough red bark crown */
    cyl('bark',tx,G,tz,.28,.55,hc(SVPAL.bark[0]),10);
    cyl('inau',tx,G+.55,tz,.25,1.85,hc(SVPAL.cypressPale[0]),10);
    cyl('bark',tx,G+2.4,tz,.27,1.45,hc(SVPAL.bark[1]),10,.22);
   }
  });
  haloAt(1.4,G+.75,-2.5,0xff7c2a,true);
  smokeAt(1.4,G+.95,-2.5,{r:.36,kind:'fire'});
  tkDryingLine(.2,3.8,3.6,3.8,G+1.95,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-3.8,G,-.8,0],
   ['hl_tri_grain_mortar',-1.6,G,2.2,0],
   ['generic_bread_basket',-5.4,G,-2.6,PI/2],
   ['generic_veg_basket',1.8,G,.8,0],
   ['timpar_attus_bale_bench',-5.4,G,1.2,PI/2],
   ['generic_sack',-2.2,G,-2.8,0],
   ['timpar_smoked_salmon_frame',-3.8,G,-3.1,0]
  ]);
  tkTarget(-3.8,G,.8,'camas-drying-shed');
  tkTarget(1.4,G,1.2,'earth-oven-apron');
  popM();
 }});

/* 36. Candlefish and Salmon-Grease Rendering Try-Works */
defBuilding({key:'tk_grease_tryworks',name:'Candlefish and Salmon-Grease Rendering Try-Works',seed:35314,cut:true,
 w:16.8,d:14.4,h:8.2,budget:105000,
 tags:{types:['industry'],wealth:'middle',style:'plank',role:'tryworks',job:'oil'},
 note:'PNW Grease-Trail try-works rendering eulachon/candlefish and salmon oil in hot-cobble wooden canoes, pressed through cedar-bark mats into kerfed grease-boxes',
 build(){
  const G=.38,W=10.4,D=8.6,H=3.15;
  pushM(TF(-1.6,0,-.45));
  tkPlinth(14.6,11.4,G,{stepW:2.8,stepX:0});
  /* Main split-cypress grease-pressing & box-sealing shed */
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.42,postR:.25,
   holes:{
    s:[{x:0,y:0,w:1.82,h:2.22},{x:-3.1,y:.96,w:1.0,h:.92}],
    e:[{x:0,y:0,w:1.64,h:2.1}]
   }
  });
  tkDoor(0,G,D/2-.17,0,1.36,2.08,{inau:true,visor:true,crest:'hueru'});
  tkDoor(W/2-.17,G,0,PI/2,1.2,1.96,{inau:false});
  tkWindow(-3.1,G+.96,D/2-.17,0,.82,.8,{lit:true});
  tkFormlineScreen(0,G+2.32,D/2+.01,0,W-.8,.76,{crest:'hueru'});
  tkPlankRoof(W,D,G+H,2.15,{mk:'cedar',cobbles:true,smokeShutter:true,kaenFinials:true});
  /* East yard (+x = 6.6 .. 8.2 in shifted frame -> 5.8 .. 8.2): cobble stone-heating hearth & twin wooden rendering canoes! */
  svNoWalk(()=>{
   const rx=6.8;
   /* Red-hot river-cobble heating pit */
   box('megabreccia',rx,G,-2.8,2.2,.44,2.2,hc(SVPAL.megabreccia[0]));
   box('glow',rx,G+.44,-2.8,1.25,.07,1.25,0xff6e22);
   for(let i=0;i<5;i++)ellip('cobble',rx+(i-2)*.22,G+.54,-2.8,.16,.11,.14,hc(SVPAL.cobble[0]),0,8);
   /* Twin adzed cedar rendering canoes/troughs + lever-beam & woven cedar-bark press-mats */
   for(const cz of [.2,2.4]){
    box('cypress',rx,G,cz,2.5,.42,.86,hc(SVPAL.cypressD[0]));
    box('matting',rx,G+.42,cz,2.08,.06,.58,hc(SVPAL.matting[0]));
   }
   cyl('totem',rx-1.35,G,1.3,.14,1.35,hc(SVPAL.totem[0]),8);
   box('cypress',rx+.1,G+1.05,1.3,2.9,.11,.14,hc(SVPAL.cypress[0]),0,0,-.08);
  });
  haloAt(6.8,G+.75,-2.8,0xff8230,true);
  smokeAt(6.8,G+1.05,-2.8,{r:.4,kind:'fire'});
  tkWindBanner(-4.2,G,D/2+.85,.15,1.4,2.05,{mk:'chilkat'});
  tkFurnList([
   ['timpar_kerfed_bentwood_chest',-3.4,G,-2.8,0,0],
   ['timpar_kerfed_bentwood_chest',-1.6,G,-2.8,0,1],
   ['timpar_kerfed_bentwood_chest',-3.4,G,-.8,PI/2,0],
   ['painted_trade_press',2.4,G,-2.4,0],
   ['painted_trade_vat',2.6,G,1.6,-PI/2],
   ['timpar_bear_feast_trough',-.4,G,1.8,0],
   ['timpar_kanopi_alloy_lamp',-2.2,G,2.6,0],
   ['generic_barrel',6.8,G,4.1,0]
  ]);
  tkTarget(0,G,.8,'grease-try-shed');
  tkTarget(6.4,G,1.2,'stone-heating-yard');
  popM();
 }});

/* 37. Red-Cypress Totem-Pole and War-Visor Carving Long-Shed */
defBuilding({key:'tk_totem_carving_shed',name:'Red-Cypress Totem-Pole and War-Visor Carving Shed',seed:35315,cut:true,
 w:19.2,d:14.8,h:8.8,budget:125000,
 tags:{types:['industry','shop'],wealth:'middle',style:'crest',role:'carver',job:'carpentry'},
 note:'post-and-beam carving long-shed housing an 8.6 m horizontal peeled red-cypress totem trunk mid-carving on trestles, nephrite adzes, tempera mortars & open-eyed war-visors',
 build(){
  const G=.4,W=16.2,D=9.6,H=3.45;
  pushM(TF(0,0,-.5));
  tkPlinth(W+.8,D+2.2,G,{stepW:3.4,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.42,postR:.28,
   holes:{
    s:[{x:0,y:0,w:2.55,h:2.45},{x:-5.0,y:.96,w:1.15,h:1.0},{x:5.0,y:.96,w:1.15,h:1.0}],
    n:[{x:-4.2,y:1.05,w:1.1,h:.96},{x:4.2,y:1.05,w:1.1,h:.96}],
    e:[{x:0,y:1.0,w:1.1,h:.96}],w:[{x:0,y:1.0,w:1.1,h:.96}]
   }
  });
  tkDoor(0,G,D/2-.17,0,2.15,2.26,{inau:true,visor:true,crest:'kapac'});
  for(const sx of [-5.0,5.0])tkWindow(sx,G+.96,D/2-.17,0,.95,.88,{lit:true});
  for(const sx of [-4.2,4.2])tkWindow(sx,G+1.05,-D/2+.17,PI,.92,.84,{lit:true});
  tkWindow(W/2-.17,G+1.0,0,PI/2,.92,.84,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+1.0,0,-PI/2,.92,.84,{lit:true});
  tkFormlineScreen(0,G+2.56,D/2+.01,0,W-.9,.82,{crest:'kapac'});
  tkPlankRoof(W,D,G+H,2.35,{mk:'cypress',ovZ:1.45,cobbles:true,smokeShutter:true,kaenFinials:true});
  /* Full-length 8.4 m horizontal peeled red-cypress trunk on heavy log trestles mid-carving inside shed!
     Partially painted in stepped primary lignite-black, cinnabar-red & celadonite-teal reliefs (>= 2.2 cm step!). */
  svNoWalk(()=>{
   const tz=-1.8,ty=G+.78;
   for(const tx of [-3.0,0,3.0])box('cypress',tx,G,tz,.42,.44,1.25,hc(SVPAL.cypressD[0]));
   WX(0,ty,tz,0,0,PI/2,()=>cyl('totem',0,-4.2,0,.42,8.4,hc(SVPAL.totem[0]),14));
   /* Partially carved & painted Bear + Storm-Bird bands along top (+y) of horizontal log */
   box('formBlack',-2.4,ty+.43,tz,1.65,.06,.56,hc(SVPAL.formBlack[0]));
   box('formRed',-2.4,ty+.495,tz,1.1,.04,.38,hc(SVPAL.formRed[0]));
   box('formTeal',-2.4,ty+.54,tz,.55,.035,.22,hc(SVPAL.formTeal[0]));
   box('formBlack',.8,ty+.43,tz,1.5,.06,.54,hc(SVPAL.formBlack[0]));
   box('formRed',1.55,ty+.45,tz,.44,.22,.22,hc(SVPAL.formOchre[0]));
   /* Raw adzed unpainted tail end at +x = 3.1 showing work-in-progress */
   box('inau',3.1,ty+.425,tz,1.35,.035,.48,hc(SVPAL.cypressPale[0]));
  });
  /* Open-eyed wooden beast war-visors displayed on porch posts */
  tkWarVisor(-3.4,G+2.3,D/2+.22,0,.48,{crest:'kuma'});
  tkWarVisor(3.4,G+2.3,D/2+.22,0,.48,{crest:'wurup'});
  tkWindBanner(-6.8,G,D/2+1.25,.15,1.5,2.2,{mk:'chilkat'});
  tkFurnList([
   ['painted_common_workbench',-5.6,G,2.1,PI/2],
   ['timpar_visor_war_helm',-6.4,G,-2.8,PI/2],
   ['timpar_visor_war_helm',6.4,G,-2.8,-PI/2],
   ['timpar_totem_house_post',6.2,G,.4,-PI/2],
   ['timpar_kerfed_bentwood_chest',4.8,G,2.6,PI,1],
   ['timpar_dugout_paddle_rack',-5.8,G,-3.6,0],
   ['timpar_kanopi_alloy_lamp',2.4,G,2.6,0],
   ['hl_tri_grain_mortar',-2.8,G,2.4,0]
  ]);
  tkTarget(0,G,1.4,'totem-carving-bay');
  tkTarget(-4.6,G,1.4,'tempera-bench-hall');
  popM();
 }});

/* 38. Veilpass Pack-Pony and Bear-Hound Corral */
defBuilding({key:'tk_pony_hound_corral',name:'Veilpass Pack-Pony and Bear-Hound Corral',seed:35316,cut:true,
 w:18.0,d:15.2,h:7.6,budget:100000,
 tags:{types:['farm','infrastructure'],wealth:'poor',style:'jomon',role:'stable',job:'herding'},
 note:'mossy turf-roofed Veilpass smuggling pony stable with tumpline & pack-saddle racks, split-cedar rail corral and elevated slatted bear-hound kennels hung with inau',
 build(){
  const G=.34;
  pushM(TF(0,0,-.45));
  tkPlinth(16.0,12.2,G,{stepW:2.8,stepX:-3.2});
  /* West side: mossy turf-roofed pack-pony & smuggling-tack barn */
  pushM(TF(-3.8,0,-.6));
  tkPlankBox(7.2,7.8,G,2.75,{
   mk:'cedar',socle:.44,postR:.22,
   holes:{
    s:[{x:0,y:0,w:1.82,h:2.16}],
    e:[{x:0,y:0,w:1.72,h:2.08}],
    w:[{x:0,y:.95,w:.9,h:.82}]
   }
  });
  tkDoor(0,G,3.9-.17,0,1.38,2.02,{inau:true});
  tkDoor(3.6-.17,G,0,PI/2,1.28,1.94,{inau:false});
  tkWindow(-3.6+.17,G+.95,0,-PI/2,.74,.7,{lit:true});
  tkCiseRoof(7.2,7.8,G+2.75,2.05,{courses:5,mk:'turf',crownR:.3,crownH:.54});
  popM();
  /* North-East: twin elevated slatted timber bear-hound kennels hung with shaved-willow inau hunting charms! */
  svNoWalk(()=>{
   for(const kx of [2.2,5.2]){
    const kz=-3.2;
    for(const sx of [-.95,.95])for(const sz of [-.85,.85]){
     cyl('cypress',kx+sx,G,kz+sz,.09,1.75,hc(SVPAL.cypressD[0]),8);
    }
    box('cedar',kx,G+.48,kz,2.1,.1,1.9,hc(SVPAL.cedar[0]));
    box('bark',kx,G+.58,kz-.88,2.04,1.05,.12,hc(SVPAL.bark[0]));
    for(const sx of [-.96,.96])box('cedar',kx+sx,G+.58,kz,.1,1.05,1.64,hc(SVPAL.cedar[1]));
    plane4('bark',[kx-1.2,G+1.58,kz-1.1],[kx,G+2.05,kz-1.1],[kx-1.2,G+1.58,kz+1.1],.08,hc(SVPAL.bark[0]));
    plane4('bark',[kx,G+2.05,kz-1.1],[kx+1.2,G+1.58,kz-1.1],[kx,G+2.05,kz+1.1],.08,hc(SVPAL.bark[0]));
    tkInauCluster(kx+.85,G+1.2,kz+.98,0,.68,2);
   }
   /* East & South split-cedar 3-rail pony paddock fence (leaving wide 3.2 m entry opening at x = 0.8..4.0 on +z!) */
   const postPts=[[7.2,-4.4],[7.2,-1.5],[7.2,1.5],[7.2,4.6],[4.4,4.6]];
   for(const [px,pz] of postPts)cyl('silverwood',px,G,pz,.085,1.28,hc(SVPAL.silverwood[0]),8);
   for(const ry of [.42,.78,1.12]){
    box('cedar',7.2,G+ry,.1,.09,.08,9.1,hc(SVPAL.cedar[0]));
    box('cedar',5.8,G+ry,4.6,2.9,.08,.09,hc(SVPAL.cedar[0]));
   }
  });
  tkWindBanner(-6.6,G,4.6,.18,1.35,1.95,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-3.8,G,-.6,0],
   ['painted_trade_hayrack',-6.2,G,-2.6,PI/2],
   ['painted_trade_trough',2.8,G,1.8,0],
   ['timpar_attus_bale_bench',-5.8,G,1.4,PI/2],
   ['generic_sack',-1.8,G,-2.8,0],
   ['hl_tri_haycock',5.4,G,1.4,0],
   ['timpar_kanopi_alloy_lamp',-.4,G,2.8,0]
  ]);
  tkTarget(-3.8,G,.8,'pack-pony-shelter');
  tkTarget(2.8,G,.4,'hound-corral-yard');
  popM();
 }});
