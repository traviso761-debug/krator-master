/* prefix: sm */
// ================================================================= SHUMARI EXTRACTIVE WORKS & HEAVY CRAFTS (Phase SM4)
// Hearth-Commons (-ra) and Cadet (-ko) canyon works: smithy, saltpeter, lacquer-inlay, stonecutters, mine, salt pans,
// plus census-discovered sm_charcoal_kiln and sm_placer_sluice (settlements/shumar/BUILD-OUT.md section 4a).

/* 1. sm_blade_smithy: double-forge watered-steel bloomery & notched-blade smithy with twin chimneys & quench trough */
defBuilding({
 key:'sm_blade_smithy',
 name:'Watered-steel blade smithy',
 seed:8401,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.8,
 w:12.8,
 d:12.4,
 h:9.2,
 tags:{types:['industry','shop'],wealth:'middle',style:SM_STYLES.hearth,job:'smithing',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_blade_smithy);
  const plinthY=.44,wallH=3.85,roofY=plinthY+wallH;
  W(0,0,-.35,0,()=>{
   smPlinth(10.8,9.8,plinthY,{ablaqQuoins:true,topMk:'cobble',topPal:'cobble'});
   smHollowAblaq(10.0,8.6,plinthY,wallH,{
    t:.48,
    mode:'basalt',
    front:[
     {x:-1.85,y:plinthY,w:1.55,h:2.35,kind:'door'},
     {x:2.05,y:plinthY,w:2.25,h:2.55,kind:'arch'}
    ],
    back:[{x:0,y:plinthY+1.35,w:1.15,h:1.45,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.35,w:1.15,h:1.45,kind:'window',glassKind:'lit',bars:true}],
    right:[{x:0,y:plinthY+1.35,w:1.15,h:1.45,kind:'window',glassKind:'lit',bars:true}]
   });
   smHumanDoor(-1.85,plinthY,4.30,0,1.42,SM_HUMAN_DOOR,{mk:'iron',col:0x36383e,style:'banded',name:'smithy-door'});
   smParapet(10.2,8.8,roofY,{});
   /* Twin heavy octagonal basalt forge chimneys */
   smChimney(-2.85,roofY,-2.65,2.85,{r:.44,smokeScale:.42});
   smChimney(2.85,roofY,-2.65,2.85,{r:.44,smokeScale:.42});

   /* Double hearth bloomery forges, iron anvil, basalt snowmelt quench trough & notched-blade rack */
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     box('basalt',sx*2.85,plinthY+.02,-2.75,2.15,1.45,1.55,P('basaltDark'));
     box('glow',sx*2.85,plinthY+.72,-1.96,.72,.38,.10,P('ember'));
     cone('glow',sx*2.85,plinthY+.92,-2.15,.22,.36,P('flame'),8);
     haloAt(sx*2.85,plinthY+1.05,-1.95,0xff7a28,true);
    }
    /* Anvil & snowmelt quench trough */
    box('timber',.65,plinthY+.02,-.25,.58,.52,.58,P('timber'));
    box('iron',.65,plinthY+.54,-.25,.76,.28,.32,P('iron'));
    box('basalt',3.45,plinthY+.02,.65,1.15,.68,2.45,P('basaltDark'));
    box('paving',3.45,plinthY+.58,.65,.88,.08,2.15,P('glass'));
    /* Display rack of notched regimental steel & bronze blades */
    W(-3.85,plinthY+.02,.45,PI*.5,()=>{
     box('lacquer',0,0,0,2.2,.18,.42,P('lacquer'));
     box('lacquer',0,1.15,0,2.2,.10,.34,P('lacquer'));
     for(let b=-3;b<=3;b++)box('iron',b*.28,.18,0,.065,1.45,.02,P('iron'));
    });
   });
   FURNISH('generic_fuel',-3.85,plinthY+.02,-2.65,0);
   FURNISH('generic_barrel',3.65,plinthY+.02,-2.45,0);
   FURNISH('generic_crate',-3.85,plinthY+.02,2.65,PI*.5);
   FURNISH('generic_strongbox',0,plinthY+.02,-3.15,0);
  });

  svStair(-1.85,5.35,0,plinthY,PI,{w:1.8,run:.85,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-1.85,0,5.75,{outside:true});
  smWalkTarget('forge-floor',-1.25,plinthY,.25,{});
 }
});

/* 2. sm_saltpeter_works: stone leaching vats, copper boiling cauldron over flued furnace, and sulfur/powder drying shed */
defBuilding({
 key:'sm_saltpeter_works',
 name:'Saltpeter and sulfur leaching works',
 seed:8402,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:13.4,
 d:12.2,
 h:8.4,
 tags:{types:['industry'],wealth:'middle',style:SM_STYLES.hearth,job:'alchemy',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_saltpeter_works);
  const plinthY=.38,wallH=3.45,roofY=plinthY+wallH;
  smPlinth(11.6,10.2,plinthY,{ablaqQuoins:false,topMk:'paving',topPal:'paving'});

  /* West (-x) ventilated basalt powder-drying & refining house */
  W(-2.55,0,-.65,0,()=>{
   smHollowAblaq(5.8,7.8,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[{x:0,y:plinthY,w:1.42,h:2.30,kind:'door'}],
    back:[{x:0,y:plinthY+1.35,w:.95,h:1.25,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.35,w:.95,h:1.25,kind:'window',glassKind:'smoked',bars:true}],
    right:[{x:0,y:plinthY,w:1.35,h:2.22,kind:'door'}]
   });
   smHumanDoor(0,plinthY,3.90,0,1.30,SM_HUMAN_DOOR,{mk:'timber',col:0x4a3323,style:'banded',name:'saltpeter-door'});
   smHumanDoor(2.90,plinthY,0,PI*.5,1.22,2.15,{mk:'timber',col:0x4a3323,front:false,name:'vat-yard-door'});
   smParapet(6.0,8.0,roofY,{});
  });

  /* East (+x) open stone leaching vats & copper crystallizing cauldron over flued basalt furnace */
  W(3.05,plinthY,-.45,0,()=>{
   svNoWalk(()=>{
    for(let v=0;v<3;v++){
     const vz=-2.65+v*1.95;
     box('basalt',1.15,0,vz,2.15,.72,1.55,P('basaltDark'));
     box('travertine',1.15,.62,vz,1.85,.08,1.25,P('ashlar'));
    }
    /* Copper boiling cauldron & chimney at north end */
    cyl('basalt',-1.15,0,-2.75,.88,.92,P('basaltDark'),10,.84,false);
    box('glow',-1.15,.22,-1.88,.38,.28,.10,P('ember'));
    cyl('bronze',-1.15,.88,-2.75,.82,.58,P('bronze'),14,.92,false);
   });
   smChimney(-1.15,0,-3.65,4.25,{r:.36,smokeScale:.34});
   FURNISH('generic_barrel',1.15,.02,3.15,0);
   FURNISH('generic_sack',.25,.02,3.15,PI*.25);
  });

  smWalkTarget('approach',-2.55,0,5.55,{outside:true});
  smWalkTarget('drying-shed',-2.55,plinthY,-.65,{});
  smWalkTarget('vat-yard',1.65,plinthY,2.25,{});
 }
});

/* 3. sm_lacquer_inlay_shop: crimson-lacquer curing workshop & gold/bronze damascene blade-hilter */
defBuilding({
 key:'sm_lacquer_inlay_shop',
 name:'Crimson-lacquer and damascene shop',
 seed:8403,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:10.8,
 d:10.8,
 h:8.6,
 tags:{types:['shop','industry'],wealth:'middle',style:SM_STYLES.hearth,job:'carpentry',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_lacquer_inlay_shop);
  const plinthY=.48,wallH=3.55,roofY=plinthY+wallH;
  W(0,0,-.45,0,()=>{
   smPlinth(8.8,8.4,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.2,7.8,plinthY,wallH,{
    t:.46,
    front:[
     {x:-1.55,y:plinthY,w:1.45,h:2.35,kind:'door'},
     {x:1.65,y:plinthY+.85,w:2.25,h:1.95,kind:'window',glassKind:'lit',jali:false}
    ],
    back:[{x:0,y:plinthY+1.15,w:1.25,h:1.45,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:plinthY+1.15,w:1.25,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:1.25,h:1.45,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-1.55,plinthY,3.90,0,1.34,SM_HUMAN_DOOR,{mk:'lacquer',col:0xa83031,style:'banded',name:'lacquer-shop-door'});
   /* Ground-level crimson-lacquer & gold-trimmed show bay displaying inlaid scabbards */
   smLacquerBay(1.65,plinthY+.55,3.90,2.95,2.35,.76,{glassKind:'lit',solid:true});
   smParapet(8.4,8.0,roofY,{});
   smChimney(-2.65,roofY,-2.45,2.05,{r:.32,smokeScale:.22});
   FURNISH('generic_chest',2.65,plinthY+.02,-2.45,-PI*.5);
   FURNISH('generic_canister_set',-2.65,plinthY+.02,-2.45,0);
  });

  svStair(-1.55,4.65,0,plinthY,PI,{w:1.75,run:.90,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-1.55,0,5.05,{outside:true});
  smWalkTarget('inlay-room',-1.25,plinthY,-.45,{});
 }
});

/* 4. sm_stonecutters_yard: ablaq ashlar dressing yard, timber A-frame crane hoist, and Mamluk dome-rib templates */
defBuilding({
 key:'sm_stonecutters_yard',
 name:'Ablaq stonecutters and dome-carving yard',
 seed:8404,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.3,
 w:14.2,
 d:12.6,
 h:8.6,
 tags:{types:['industry'],wealth:'middle',style:SM_STYLES.hearth,job:'masonry',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_stonecutters_yard);
  const plinthY=.36,wallH=3.35,roofY=plinthY+wallH;
  smPlinth(12.4,10.6,plinthY,{ablaqQuoins:true,topMk:'paving',topPal:'paving'});

  /* Master mason's template & drafting lodge on -x */
  W(-3.15,0,-.85,0,()=>{
   smHollowAblaq(5.4,7.6,plinthY,wallH,{
    t:.46,
    front:[
     {x:0,y:plinthY,w:1.42,h:2.30,kind:'door'},
     {x:1.55,y:plinthY+1.05,w:.95,h:1.35,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:plinthY+1.15,w:1.05,h:1.35,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:plinthY+1.15,w:1.05,h:1.35,kind:'window',glassKind:'lit'}],
    right:[{x:-1.55,y:plinthY,w:1.32,h:2.20,kind:'door'}]
   });
   smHumanDoor(0,plinthY,3.80,0,1.32,SM_HUMAN_DOOR,{mk:'cedar',style:'banded',name:'mason-lodge-door'});
   smHumanDoor(2.70,plinthY,1.55,PI*.5,1.22,2.14,{mk:'cedar',style:'plank',front:false,name:'yard-door'});
   smParapet(5.6,7.8,roofY,{});
  });

  /* Open stone-dressing yard on +x: timber A-frame block-hoist crane, stacked basalt/travertine blocks & half-carved dome cap */
  W(2.85,plinthY,-.45,0,()=>{
   svNoWalk(()=>{
    /* Timber A-frame hoist crane */
    beam('timber',[-1.65,0,-1.85],[0,4.65,-.25],.16,P('timber'));
    beam('timber',[1.65,0,-1.85],[0,4.65,-.25],.16,P('timber'));
    beam('timber',[0,0,-3.25],[0,4.65,-.25],.15,P('timber'));
    cord('iron',[[0,4.55,-.25],[0,1.65,-.25]],.025,P('iron'));
    box('travertine',0,.95,-.25,1.15,.68,.85,P('travertine'));
    /* Stacked rough basalt, cream travertine & red ironstone courses + trial carved dome boss */
    box('basalt',1.85,0,2.15,1.45,.62,.95,P('basalt'));
    box('travertine',1.85,.62,2.15,1.35,.52,.85,P('travertine'));
    box('ironstone',.25,0,2.65,1.15,.48,.82,P('ironstone'));
    cyl('domeCarved',-1.45,0,-2.85,.95,.72,P('domeStone'),16,.55,false);
   });
   FURNISH('generic_crate',2.15,.02,-2.85,0);
  });

  smWalkTarget('approach',-3.15,0,5.75,{outside:true});
  smWalkTarget('mason-lodge',-3.15,plinthY,-.85,{});
  smWalkTarget('dressing-yard',1.85,plinthY,.95,{});
 }
});

/* 5. sm_mine_head: timbered basalt adit portal, headframe pulley, ore-sorting grizzly, and assay hut */
defBuilding({
 key:'sm_mine_head',
 name:'Canyon adit mine-head and grizzly',
 seed:8405,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.cadet,
 vaultH:3.2,
 w:13.8,
 d:12.8,
 h:9.4,
 tags:{types:['industry'],wealth:'poor',style:SM_STYLES.cadet,job:'mining',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_mine_head);
  const plinthY=.42,wallH=3.20,roofY=plinthY+wallH;
  smPlinth(12.0,10.6,plinthY,{ablaqQuoins:false,topMk:'cobble',topPal:'cobble'});

  /* Assay & tally house on -x */
  W(-2.95,0,.65,0,()=>{
   smHollowAblaq(5.2,6.4,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.38,h:2.28,kind:'door'},
     {x:-1.45,y:plinthY+1.05,w:.76,h:1.15,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[{x:0,y:plinthY+1.15,w:.78,h:1.15,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.15,w:.78,h:1.15,kind:'window',glassKind:'lit',bars:true}],
    right:[{x:0,y:plinthY+1.15,w:.78,h:1.15,kind:'window',glassKind:'lit',bars:true}]
   });
   smHumanDoor(0,plinthY,3.20,0,1.28,2.20,{mk:'timber',col:0x4a3323,style:'banded',name:'assay-door'});
   smParapet(5.4,6.6,roofY,{});
   smChimney(-1.45,roofY,-1.85,1.95,{r:.32,smokeScale:.25});
  });

  /* Rear/East timbered basalt adit portal, headframe sheave wheel & inclined iron ore grizzly */
  W(2.45,plinthY,-.85,0,()=>{
   svNoWalk(()=>{
    /* Heavy basalt adit collar + timber mine sets */
    box('rubble',0,0,-2.65,4.6,3.65,2.2,P('rubble'));
    box('basalt',0,0,-1.52,3.4,2.85,.42,P('basaltDark'));
    for(const sx of [-1,1])box('timber',sx*1.15,0,-1.28,.24,2.45,.28,P('timber'));
    box('timber',0,2.45,-1.28,2.65,.26,.32,P('timber'));
    /* Locked mine-shaft safety gate so there is zero dark void */
    svDoorway(0,0,-1.32,0,2.05,2.40,{
     hollow:false,locked:true,split:true,mk:'iron',col:0x32343a,style:'grille',name:'adit-grille'
    });
    /* Timber headframe & iron sheave wheel + ore-sorting chute */
    for(const sx of [-1,1]){
     beam('timber',[sx*1.15,0,.35],[sx*.55,5.25,-.65],.16,P('timber'));
     beam('timber',[sx*1.15,0,-2.15],[sx*.55,5.25,-.65],.16,P('timber'));
    }
    beam('timber',[-.75,5.25,-.65],[.75,5.25,-.65],.18,P('timber'));
    ring('iron',0,5.05,-.65,.52,.05,P('iron'),0,0,PI*.5,14);
    /* Inclined grizzly screen & rubble ore bin */
    psurf('iron',(u,v)=>[lerp(-1.2,1.2,u),lerp(1.85,.75,v),lerp(.45,2.55,v)],4,2,P('iron'),{up:true});
    box('rubble',0,0,2.85,2.8,.78,1.45,P('rubble'));
   });
   haloAt(0,2.25,-1.15,0xffa442,false);
   FURNISH('generic_crate',-1.85,.02,2.85,0);
   FURNISH('generic_sack',1.95,.02,2.85,0);
  });

  svStair(-2.95,5.85,0,plinthY,PI,{w:1.75,run:.85,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-2.95,0,6.15,{outside:true});
  smWalkTarget('assay-hut',-2.95,plinthY,.65,{});
  smWalkTarget('adit-yard',-.15,plinthY,2.45,{});
 }
});

/* 6. sm_salt_evaporator: terraced stone brine-evaporation pans & flued halite boiling house */
defBuilding({
 key:'sm_salt_evaporator',
 name:'Terraced brine pans and salt-boiling house',
 seed:8406,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.3,
 w:14.4,
 d:12.4,
 h:8.4,
 tags:{types:['industry'],wealth:'middle',style:SM_STYLES.hearth,job:'salt',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_salt_evaporator);
  const plinthY=.36,wallH=3.35,roofY=plinthY+wallH;
  smPlinth(12.6,10.4,plinthY,{ablaqQuoins:false,topMk:'paving',topPal:'paving'});

  /* West (-x) flued salt-boiling & basket storehouse */
  W(-3.35,0,-.55,0,()=>{
   smHollowAblaq(5.2,8.0,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[{x:0,y:plinthY,w:1.38,h:2.28,kind:'door'}],
    back:[{x:0,y:plinthY+1.25,w:.88,h:1.25,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.25,w:.88,h:1.25,kind:'window',glassKind:'lit'}],
    right:[{x:-1.65,y:plinthY,w:1.28,h:2.18,kind:'door'}]
   });
   smHumanDoor(0,plinthY,4.00,0,1.28,2.22,{mk:'cedar',style:'plank',name:'salt-house-door'});
   smHumanDoor(2.60,plinthY,1.65,PI*.5,1.18,2.12,{mk:'cedar',style:'plank',front:false,name:'pan-pass'});
   smParapet(5.4,8.2,roofY,{});
   smChimney(0,roofY,-2.35,2.65,{r:.40,smokeScale:.38});
  });

  /* East (+x) stepped travertine-rimmed solar brine pans with pale salt crusts */
  W(2.65,plinthY,-.35,0,()=>{
   svNoWalk(()=>{
    for(let row=0;row<3;row++){
     const py=.04+(2-row)*.18,pz=-2.75+row*2.55;
     box('basalt',0,0,pz,5.8,py,2.25,P('basalt'));
     box('travertine',0,py,pz,5.85,.12,2.30,P('travertine'));
     box('ashlar',0,py+.08,pz,5.35,.06,1.85,0xf2ede4);
    }
    /* White salt-cone mounds beside the pans */
    cone('ashlar',-2.15,.02,3.85,.62,.68,0xf4f0e8,10);
    cone('ashlar',-.95,.02,3.95,.48,.52,0xf4f0e8,10);
   });
   FURNISH('generic_sack',1.85,.02,3.75,0);
   FURNISH('generic_basket',2.55,.02,3.75,0);
  });

  smWalkTarget('approach',-3.35,0,5.75,{outside:true});
  smWalkTarget('boiling-house',-3.35,plinthY,-.55,{});
  smWalkTarget('pan-walk',-.35,plinthY,2.15,{});
 }
});

/* 7. sm_charcoal_kiln: twin stone-banked beehive charcoal clamps + stacked pine/poplar cordwood yard (BUILD-OUT.md 4a) */
defBuilding({
 key:'sm_charcoal_kiln',
 name:'Stone beehive charcoal clamps and cordwood yard',
 seed:8407,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.cadet,
 vaultH:3.0,
 w:14.2,
 d:12.4,
 h:7.2,
 tags:{types:['industry'],wealth:'poor',style:SM_STYLES.cadet,job:'smithing',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_charcoal_kiln);
  const plinthY=.34,wallH=3.05,roofY=plinthY+wallH;
  smPlinth(12.4,10.4,plinthY,{ablaqQuoins:false,topMk:'earth',topPal:'earth'});

  /* Soot-burner's basalt tally & tool hut on -x */
  W(-3.65,0,.85,0,()=>{
   smHollowAblaq(4.4,5.8,plinthY,wallH,{
    t:.44,
    mode:'basalt',
    front:[{x:0,y:plinthY,w:1.35,h:2.22,kind:'door'}],
    back:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,plinthY,2.90,0,1.25,2.15,{mk:'tarred',col:0x2c2623,style:'plank',name:'burner-hut-door'});
   smParapet(4.6,6.0,roofY,{});
  });

  /* Pair of corbelled dark-basalt beehive charcoal clamps + stacked rope-pine & helix-poplar cordwood ricks */
  W(2.15,plinthY,-.55,0,()=>{
   svNoWalk(()=>{
    for(const [kx,kz,R] of [[-.85,-1.85,1.95],[2.45,-.65,1.75]]){
     W(kx,0,kz,0,()=>{
      const prof=[];
      for(let i=0;i<=12;i++){
       const u=i/12;
       prof.push([i===12?.26:R*Math.pow(1-u*.82,.58),u*(R*1.42)]);
      }
      lathe('rubble',0,0,prof,18,P('basaltDark'));
      cyl('basalt',0,R*1.36,0,.38,.22,P('basaltDark'),10,.32,false);
      /* Glowing iron-shuttered air-draught mouth at base */
      box('basalt',0,0,R*.92,.88,1.05,.42,P('basaltDark'));
      box('iron',0,.08,R*1.10,.62,.82,.08,P('iron'));
      box('glow',0,.12,R*1.13,.42,.18,.04,P('ember'));
      haloAt(0,.28,R*1.20,0xff6e24,false);
      smokeAt(0,R*1.62,0,{r:.36,kind:'fire'});
     });
    }
    /* Cordwood stacks of pale poplar & dark pine logs */
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){
     const lx=-1.85+col*.36,ly=.18+row*.30;
     WX(lx,ly,3.15,0,PI*.5,0,()=>cyl(row%2===0?'cedar':'timber',0,0,0,.15,1.95,row%2===0?P('ashlar'):P('cedar'),8,null,false));
    }
    box('timber',-2.15,0,3.15,.14,1.25,2.05,P('timber'));
    box('timber',-.15,0,3.15,.14,1.25,2.05,P('timber'));
   });
   FURNISH('generic_fuel',2.25,.02,3.15,0);
   FURNISH('generic_sack',1.25,.02,3.15,PI*.2);
  });

  smWalkTarget('approach',-3.65,0,5.65,{outside:true});
  smWalkTarget('burner-hut',-3.65,plinthY,.85,{});
  smWalkTarget('clamp-yard',.55,plinthY,1.95,{});
 }
});

/* 8. sm_placer_sluice: stepped basalt diversion race, riffled timber sluice boxes & washing table (BUILD-OUT.md 4a) */
defBuilding({
 key:'sm_placer_sluice',
 name:'Canyon placer-gold sluice and assay race',
 seed:8408,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.cadet,
 vaultH:3.0,
 w:14.4,
 d:12.2,
 h:7.4,
 tags:{types:['industry'],wealth:'poor',style:SM_STYLES.cadet,job:'mining',role:'works',lit:true},
 build(){
  smBindRec(DEFS.sm_placer_sluice);
  const plinthY=.36,wallH=3.05,roofY=plinthY+wallH;
  smPlinth(12.6,10.2,plinthY,{ablaqQuoins:false,topMk:'cobble',topPal:'cobble'});

  /* Lockbox & gold-weighing stone assay shed on -x */
  W(-3.55,0,.65,0,()=>{
   smHollowAblaq(4.6,6.2,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.36,h:2.24,kind:'door'},
     {x:1.35,y:plinthY+1.05,w:.68,h:1.10,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'smoked',bars:true}],
    right:[{x:0,y:plinthY+1.15,w:.68,h:1.05,kind:'window',glassKind:'lit',bars:true}]
   });
   smHumanDoor(0,plinthY,3.10,0,1.26,2.18,{mk:'iron',col:0x36383e,style:'banded',name:'placer-assay-door'});
   smParapet(4.8,6.4,roofY,{});
   FURNISH('generic_strongbox',-1.25,plinthY+.02,-1.85,PI*.5);
  });

  /* East (+x) stepped basalt head-race flume, long riffled timber sluice boxes & heavy-mineral washing table */
  W(2.25,plinthY,-.25,0,()=>{
   svNoWalk(()=>{
    /* Elevated basalt snowmelt head-race at -z feeding twin inclined riffle sluices running toward +z settling sump */
    box('basalt',0,0,-3.65,5.4,1.95,1.25,P('basaltDark'));
    box('paving',0,1.88,-3.65,4.9,.10,.82,P('glass'));
    for(const sx of [-1.25,1.25]){
     /* Timber trestle legs */
     for(let t=0;t<4;t++){
      const tz=-2.75+t*1.65,ty=lerp(1.65,.62,t/3);
      box('timber',sx-.42,0,tz,.12,ty,.12,P('timber'));
      box('timber',sx+.42,0,tz,.12,ty,.12,P('timber'));
     }
     /* Inclined sluice trough + water sheet + transverse wooden riffle bars */
     psurf('cedar',(u,v)=>[sx+lerp(-.48,.48,u),lerp(1.75,.58,v),lerp(-3.05,2.45,v)],2,4,P('cedar'),{up:true});
     psurf('paving',(u,v)=>[sx+lerp(-.40,.40,u),lerp(1.81,.64,v),lerp(-3.02,2.42,v)],2,4,P('glass'),{up:true});
     for(let r=0;r<9;r++){
      const f=(r+.5)/9;
      box('iron',sx,lerp(1.84,.67,f),lerp(-2.95,2.35,f),.82,.06,.05,P('iron'));
     }
    }
    /* Lower basalt tail-race settling basin & gold-panning table */
    box('basalt',0,0,2.95,4.8,.62,1.35,P('basaltDark'));
    box('paving',0,.52,2.95,4.3,.08,.95,P('glass'));
    box('cedar',-2.45,0,.35,1.25,.88,2.15,P('cedar'));
    cyl('bronze',-2.45,.90,-.15,.26,.07,P('bronze'),14,.18,false);
    cyl('gold',-2.45,.95,-.15,.07,.02,P('gold'),10,null,false);
   });
   FURNISH('generic_crate',2.55,.02,3.45,0);
  });

  smWalkTarget('approach',-3.55,0,5.55,{outside:true});
  smWalkTarget('assay-shed',-3.55,plinthY,.65,{});
  smWalkTarget('panning-walk',-.45,plinthY,3.65,{});
 }
});
