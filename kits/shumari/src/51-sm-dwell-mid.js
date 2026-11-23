/* prefix: sm */
// ================================================================= SHUMARI HEARTH-COMMONS MIDDLE DWELLINGS (Phase SM3)
// Dressed highland basalt houses of the -ra Hearth-Commons: ablaq door arches, crimson-lacquer winter bays, and artisan courts.

/* 1. sm_hearth_house: 2-storey dressed basalt Hearth family house with ablaq arch, crimson mashrabiya bay & internal stair */
defBuilding({
 key:'sm_hearth_house',
 name:'Hearth-Commons family house',
 seed:8211,
 variants:2,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:10.6,
 d:11.6,
 h:10.2,
 tags:{types:['dwelling-single'],wealth:'middle',style:SM_STYLES.hearth,role:'dwelling',lit:true},
 build(o){
  const v=(o&&o.v)|0;
  smBindRec(DEFS.sm_hearth_house);
  const plinthY=.62,gH=3.45,uY=plinthY+gH,uH=3.35,roofY=uY+uH;
  W(0,0,-.45,0,()=>{
   smPlinth(8.6,8.8,plinthY,{ablaqQuoins:true});
   /* Ground floor dressed basalt (or ablaq in v=1) with polychrome ablaq door surround */
   smHollowAblaq(8.0,8.2,plinthY,gH,{
    t:.48,
    mode:v?'ablaq':'basalt',
    front:[
     {x:-1.45,y:plinthY,w:1.45,h:2.35,kind:'door'},
     {x:1.75,y:plinthY+1.05,w:1.18,h:1.55,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-1.85,y:plinthY+1.15,w:1.05,h:1.45,kind:'window',glassKind:'lit'},
     {x:1.85,y:plinthY+1.15,w:1.05,h:1.45,kind:'window',glassKind:'lit'}
    ],
    left:[{x:.4,y:plinthY+1.15,w:1.08,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:1.08,h:1.45,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-1.45,plinthY,4.10,0,1.35,SM_HUMAN_DOOR,{mk:v?'cedar':'lacquer',col:v?0x6e452b:0xa83031,style:'banded',name:'hearth-front'});

   /* Internal stone-and-cedar flight along -x wall climbing to 2nd floor well */
   const st=svStair(-2.55,1.85,plinthY,uY,PI,{w:1.15,run:3.65,mk:'cedar',col:P('cedar'),smk:'timber',scol:P('timber'),rail:'right'});
   svWell('paving',0,uY-.22,0,7.4,.22,7.6,P('paving'),{x0:st.x0-.08,x1:st.x1+.08,z0:st.z0-.25,z1:st.z1+.15},{walk:true});

   /* Upper storey with projecting crimson-lacquered mashrabiya winter bay */
   smHollowAblaq(8.0,8.2,uY,uH,{
    t:.46,
    mode:v?'basalt':'ablaq',
    front:[
     {x:-1.85,y:uY+.95,w:1.05,h:1.55,kind:'window',glassKind:'lit'},
     {x:1.35,y:uY+.85,w:2.25,h:1.85,kind:'window',glassKind:'lit',jali:false}
    ],
    back:[
     {x:-1.75,y:uY+1.05,w:1.05,h:1.45,kind:'window',glassKind:'lit'},
     {x:1.75,y:uY+1.05,w:1.05,h:1.45,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:uY+1.05,w:1.12,h:1.50,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:uY+1.05,w:1.12,h:1.50,kind:'window',glassKind:'lit'}]
   });
   smLacquerBay(1.35,uY+.45,4.10,3.25,2.55,.92,{glassKind:'lit',solid:false});
   smParapet(8.2,8.4,roofY,{});
   smChimney(v?-2.45:2.45,roofY,-2.35,v?2.45:2.25,{r:.36});
   if(v){
    svNoWalk(()=>{
     box('travertine',2.35,roofY,-2.15,1.35,1.45,1.15,P('travertine'));
     box('lacquer',2.35,roofY+1.45,-2.10,1.48,.16,1.28,P('lacquer'));
    });
   }

   /* Interior thermal-mass basalt hearth & woven kilim carpet */
   svNoWalk(()=>{
    medallion('kilim',.65,plinthY+.03,-.35,2.8,{ry:0});
    box('basalt',2.55,plinthY+.02,-2.55,1.55,1.85,1.25,P('basaltDark'));
    box('travertine',2.55,plinthY+1.87,-2.55,1.68,.16,1.38,P('travertine'));
    box('glow',2.55,plinthY+.28,-1.92,.56,.42,.08,P('ember'));
   });
   FURNISH('shumari_apricot_chest',2.55,plinthY+.02,2.35,-PI*.5);
   FURNISH('generic_pantry_shelf',.35,plinthY+.02,-3.25,0);
   FURNISH('shumari_samovar_brazier',.95,plinthY+.02,-.35,0);
   FURNISH('shumari_millet_jar',-2.75,plinthY+.02,-2.95,PI*.25);
   FURNISH('generic_spice_box',2.45,uY+.02,2.25,PI);
  });
  svStair(-1.45,4.95,0,plinthY,PI,{w:1.85,run:1.05,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-1.45,0,5.35,{outside:true});
  smWalkTarget('ground-hall',.65,plinthY,-.45,{});
  smWalkTarget('winter-room',.85,uY,-.45,{});
 }
});

/* 2. sm_courtyard_house: artisan walled work-court house with snowmelt cistern, external stone stair, and shurafat parapet */
defBuilding({
 key:'sm_courtyard_house',
 name:'Artisan courtyard house',
 seed:8212,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:13.4,
 d:13.6,
 h:9.4,
 tags:{types:['dwelling-single'],wealth:'middle',style:SM_STYLES.hearth,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_courtyard_house);
  const plinthY=.48,gH=3.35,uY=plinthY+gH,uH=3.05,roofY=uY+uH;
  smPlinth(11.6,11.6,plinthY,{ablaqQuoins:true,topMk:'cobble',topPal:'cobble'});
  svStair(-2.2,6.65,0,plinthY,PI,{w:1.8,run:.88,style:'solid',mk:'basalt',col:P('basalt')});

  /* Front (+z) & East (+x) walled artisan courtyard with ablaq street gate */
  W(0,0,5.56,0,()=>smAblaqWall(11.6,plinthY,2.95,[
   {x:-2.2,y:plinthY,w:1.56,h:2.42,kind:'door'},
   {x:2.3,y:plinthY+1.05,w:1.15,h:1.25,kind:'window',glassKind:'smoked',bars:true}
  ],{t:.44}));
  smHumanDoor(-2.2,plinthY,5.78,0,1.42,2.35,{mk:'lacquer',col:0x9e2a2b,style:'banded',name:'court-gate'});
  W(5.58,0,.65,PI*.5,()=>smAblaqWall(9.4,plinthY,2.95,[
   {x:1.5,y:plinthY+1.05,w:1.05,h:1.25,kind:'window',glassKind:'smoked',bars:true}
  ],{t:.44}));
  W(-5.58,0,2.45,-PI*.5,()=>smAblaqWall(5.8,plinthY,2.95,[],{t:.44}));
  svNoWalk(()=>{
   for(let i=-5;i<=5;i++)smShurafatMerlon(i*1.02,plinthY+2.95,5.58,0,.78);
   /* Octagonal courtyard snowmelt cistern rim */
   cyl('basalt',1.85,plinthY+.02,2.05,.92,.62,P('basaltDark'),8,.88,false);
   cyl('travertine',1.85,plinthY+.64,2.05,.98,.12,P('travertine'),8,.94,false);
   cyl('paving',1.85,plinthY+.48,2.05,.74,.08,P('glass'),8,null,false);
  });

  /* Rear (-z) two-storey main dwelling wing */
  W(0,0,-2.55,0,()=>{
   smHollowAblaq(11.2,5.8,plinthY,gH,{
    t:.48,
    front:[
     {x:-1.85,y:plinthY,w:1.42,h:2.32,kind:'door'},
     {x:1.95,y:plinthY+.95,w:1.35,h:1.55,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-2.6,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'},
     {x:2.6,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-1.85,plinthY,2.90,0,1.30,2.24,{mk:'cedar',style:'banded',front:false,name:'wing-door'});
   box('paving',0,uY-.22,.45,11.2,.22,6.7,P('paving'));
   smHollowAblaq(11.2,5.8,uY,uH,{
    t:.44,
    floor:false,
    front:[
     {x:2.45,y:uY,w:1.30,h:2.18,kind:'door'},
     {x:-1.85,y:uY+.85,w:2.15,h:1.75,kind:'window',glassKind:'lit',jali:false}
    ],
    back:[
     {x:-2.4,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'},
     {x:2.4,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(2.45,uY,2.90,0,1.22,2.14,{mk:'cedar',style:'plank',front:false,name:'upper-loggia-door'});
   smLacquerBay(-1.85,uY+.42,2.90,2.95,2.35,.84,{glassKind:'lit'});
   smParapet(11.4,6.0,roofY,{});
   smChimney(-3.65,roofY,-1.45,2.05,{r:.35});

   FURNISH('generic_chest',-3.85,plinthY+.02,-1.65,PI*.5);
   FURNISH('generic_pantry_boxes',3.85,plinthY+.02,-1.65,-PI*.5);
   FURNISH('generic_storage_jar',3.95,plinthY+.02,1.45,PI);
   FURNISH('generic_tea_set',0,plinthY+.02,-1.55,0);
   FURNISH('generic_basket',-3.65,plinthY+.02,1.45,0);
  });

  /* External courtyard stone flight climbing along +x wall up to the upper gallery */
  svStair(4.45,4.15,plinthY,uY,PI,{w:1.2,run:3.55,style:'solid',mk:'basalt',col:P('basalt'),rail:'left',smk:'cedar',scol:P('cedar')});

  smWalkTarget('approach',-2.2,0,7.05,{outside:true});
  smWalkTarget('work-court',-1.2,plinthY,2.65,{});
  smWalkTarget('ground-hall',-1.85,plinthY,-2.55,{});
  smWalkTarget('upper-terrace',2.45,uY,.95,{});
 }
});

/* 3. sm_terrace_house: narrow 3-storey canyon-ledge house on tall battered ishigaki plinth with crimson winter gallery */
defBuilding({
 key:'sm_terrace_house',
 name:'Canyon-ledge terrace house',
 seed:8213,
 variants:2,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.3,
 w:9.4,
 d:11.8,
 h:14.2,
 tags:{types:['dwelling-multi'],wealth:'middle',style:SM_STYLES.hearth,role:'dwelling',lit:true},
 build(o){
  const v=(o&&o.v)|0;
  smBindRec(DEFS.sm_terrace_house);
  const plinthY=1.25,s1H=3.15,s2Y=plinthY+s1H,s2H=3.05,s3Y=s2Y+s2H,s3H=2.95,roofY=s3Y+s3H;
  W(0,0,-.65,0,()=>{
   smPlinth(7.2,8.4,plinthY,{ablaqQuoins:true});
   /* Storey 1: basalt cellar & street entry */
   smHollowAblaq(6.6,7.8,plinthY,s1H,{
    t:.48,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.42,h:2.32,kind:'door'},
     {x:-1.85,y:plinthY+1.05,w:.82,h:1.25,kind:'window',glassKind:'smoked',bars:true},
     {x:1.85,y:plinthY+1.05,w:.82,h:1.25,kind:'window',glassKind:'smoked',bars:true}
    ],
    back:[{x:0,y:plinthY+1.15,w:.95,h:1.30,kind:'window',glassKind:'smoked'}],
    left:[{x:0,y:plinthY+1.15,w:.95,h:1.30,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:.95,h:1.30,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,plinthY,3.90,0,1.32,SM_HUMAN_DOOR,{mk:v?'cedar':'lacquer',col:v?0x684228:0xa83031,style:'banded',name:'terrace-door'});
   if(v)smSocket('shield',2.55,plinthY+2.45,3.92,0,{scale:.75});

   /* Storey 2: ablaq ashlar family level */
   svNoWalk(()=>box('paving',0,s2Y-.18,0,6.4,.18,7.6,P('paving')));
   smHollowAblaq(6.6,7.8,s2Y,s2H,{
    t:.46,
    mode:v?'basalt':'ablaq',
    floor:false,
    front:[
     {x:-1.45,y:s2Y+.92,w:1.12,h:1.52,kind:'window',glassKind:'lit'},
     {x:1.45,y:s2Y+.92,w:1.12,h:1.52,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-1.45,y:s2Y+.95,w:1.02,h:1.42,kind:'window',glassKind:'lit'},
     {x:1.45,y:s2Y+.95,w:1.02,h:1.42,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:s2Y+.95,w:1.08,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:s2Y+.95,w:1.08,h:1.45,kind:'window',glassKind:'lit'}]
   });

   /* Storey 3: full-width cantilevered crimson-lacquer winter gallery overlooking the gorge */
   svNoWalk(()=>box('paving',0,s3Y-.18,0,6.4,.18,7.6,P('paving')));
   smHollowAblaq(6.6,7.8,s3Y,s3H,{
    t:.44,
    floor:false,
    front:[{x:0,y:s3Y+.75,w:3.25,h:1.85,kind:'window',glassKind:'lit',jali:false}],
    back:[{x:0,y:s3Y+.95,w:1.25,h:1.42,kind:'window',glassKind:'lit'}],
    left:[{x:.6,y:s3Y+.85,w:1.35,h:1.55,kind:'window',glassKind:'lit'}],
    right:[{x:.6,y:s3Y+.85,w:1.35,h:1.55,kind:'window',glassKind:'lit'}]
   });
   smLacquerBay(0,s3Y+.35,3.90,4.85,2.45,1.02,{glassKind:'lit',solid:true});
   smParapet(6.8,8.0,roofY,{});
   smChimney(v?1.95:-1.95,roofY,-2.25,v?2.35:2.15,{r:.34});
  });
  svStair(0,5.55,0,plinthY,PI,{w:2.05,run:2.05,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',0,0,5.95,{outside:true});
  smWalkTarget('ground-entry',0,plinthY,-.65,{});
 }
});

/* 4. sm_shop_house: arched ground-floor ablaq stone shopfront + external stair to upper family dwelling */
defBuilding({
 key:'sm_shop_house',
 name:'Ablaq shop-house',
 seed:8214,
 variants:2,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.5,
 w:11.6,
 d:11.4,
 h:10.2,
 tags:{types:['shop','dwelling-single'],wealth:'middle',style:SM_STYLES.hearth,job:'trading',role:'dwelling',lit:true},
 build(o){
  const v=(o&&o.v)|0;
  smBindRec(DEFS.sm_shop_house);
  const plinthY=.52,gH=3.55,uY=plinthY+gH,uH=3.25,roofY=uY+uH;
  W(-.55,0,-.45,0,()=>{
   smPlinth(8.8,8.6,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.2,8.0,plinthY,gH,{
    t:.48,
    mode:v?'basalt':'ablaq',
    front:[
     {x:-1.45,y:plinthY,w:2.05,h:2.55,kind:'door'},
     {x:2.05,y:plinthY,w:1.38,h:2.30,kind:'door'}
    ],
    back:[
     {x:-1.85,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'},
     {x:1.85,y:plinthY+1.15,w:1.05,h:1.42,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.15,w:1.12,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:1.12,h:1.45,kind:'window',glassKind:'lit'}]
   });
   /* Wide pointed ablaq shop arch + operable cedar double shutters */
   W(-1.45,plinthY+2.45,4.02,0,()=>smAblaqArch(2.55,.95,.42,{openW:1.98,springY:.06,voussoirs:11}));
   svDoorway(-1.45,plinthY,4.00,0,1.92,2.42,{
    hollow:true,locked:false,split:true,mk:'cedar',col:0x784e30,style:'plank',ajar:1.15,name:'shop-arch-shutters'
   });
   door(-1.45,plinthY,4.02,0,1.92,2.42);
   smHumanDoor(2.05,plinthY,4.00,0,1.28,2.22,{mk:'lacquer',col:0xa83031,style:'banded',front:false,name:'house-door'});

   /* Crimson or gold-ochre awning & stone shop counter to the side of the entry walk */
   svNoWalk(()=>{
    psurf('kilim',(u,v)=>[lerp(-3.05,.15,u),lerp(plinthY+2.85,plinthY+2.32,v),lerp(4.05,5.05,v)],3,2,P(v?'gold':'lacquer'),{up:true});
    box('travertine',-2.65,plinthY+.02,1.65,1.25,.92,2.25,P('travertine'));
   });

   /* Upper family dwelling floor */
   box('paving',.35,uY-.22,0,8.9,.22,8.0,P('paving'));
   smHollowAblaq(8.2,8.0,uY,uH,{
    t:.44,
    floor:false,
    front:[
     {x:-1.35,y:uY+.82,w:2.25,h:1.80,kind:'window',glassKind:'lit',jali:false},
     {x:2.05,y:uY+.95,w:1.05,h:1.45,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-1.85,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'},
     {x:1.85,y:uY+1.05,w:1.02,h:1.38,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:uY+1.05,w:1.08,h:1.42,kind:'window',glassKind:'lit'}],
    right:[{x:-1.65,y:uY,w:1.28,h:2.18,kind:'door'}]
   });
   smHumanDoor(4.10,uY,1.65,PI*.5,1.18,2.12,{mk:'cedar',style:'plank',front:false,name:'upper-family-door'});
   smLacquerBay(-1.35,uY+.40,4.00,3.15,2.40,.88,{glassKind:'lit'});
   smParapet(8.4,8.2,roofY,{});
   smChimney(v?2.45:-2.55,roofY,-2.45,2.10,{r:.34});

   FURNISH('generic_spice_box',-2.65,plinthY+.94,1.65,PI*.5);
   FURNISH('generic_crate',-2.85,plinthY+.02,-2.45,0);
   FURNISH('generic_sack',.65,plinthY+.02,-2.65,PI*.25);
   FURNISH('generic_storage_jar',2.75,plinthY+.02,-2.55,0);
   FURNISH('generic_bread_basket',-2.65,plinthY+.94,2.25,0);
  });

  svStair(-2.00,4.85,0,plinthY,PI,{w:2.35,run:1.05,style:'solid',mk:'basalt',col:P('basalt')});
  /* Side external stair on +x climbing to upper family door */
  box('paving',4.35,0,-2.65,1.45,.22,1.65,P('paving'));
  svStair(4.35,-1.85,.22,uY,0,{w:1.18,run:3.15,style:'solid',mk:'basalt',col:P('basalt'),rail:'right',smk:'cedar',scol:P('cedar')});
  svLanding(4.25,1.65,uY,1.55,1.55,{mk:'paving',col:P('paving')});

  smWalkTarget('approach',-2.00,0,5.25,{outside:true});
  smWalkTarget('shop-hall',-1.25,plinthY,-.45,{});
  smWalkTarget('upper-dwelling',-.55,uY,1.20,{});
 }
});
