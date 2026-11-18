/* prefix: sm */
// ================================================================= SHUMARI SWORD-CASTE & GIANT RICH COMPOUNDS (Phase SM3)
// Walled ablaq Sword-officer villas, Mamluk bayt compounds, Gedu-su Free Giant halls, and canyon-rim belvedere pavilions.
// Every def carries giant: true (unlocked >= 4.4 m doorway, >= 5.6 m clear vault, and dual-tread smCompoundStair).

/* 1. sm_sword_villa: walled ablaq Sword-officer villa with 4.4 m pishtaq, domed qa'a hall, and crimson ancestor blade-niche */
defBuilding({
 key:'sm_sword_villa',
 name:'Sword-officer domed villa',
 seed:8221,
 variants:2,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.8,
 w:14.6,
 d:16.8,
 h:17.8,
 tags:{types:['dwelling-single'],wealth:'rich',style:SM_STYLES.sword,role:'dwelling',lit:true},
 build(o){
  const v=(o&&o.v)|0;
  smBindRec(DEFS.sm_sword_villa);
  const plinthY=1.05,wallH=5.80,roofY=plinthY+wallH;
  W(0,0,-.85,0,()=>{
   smPlinth(12.6,13.0,plinthY,{ablaqQuoins:true});
   smHollowAblaq(11.4,11.2,plinthY,wallH,{
    t:.50,
    front:[
     {x:0,y:plinthY,w:2.65,h:4.65,kind:'door'},
     {x:-3.75,y:plinthY+1.55,w:1.25,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:3.75,y:plinthY+1.55,w:1.25,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-3.25,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'},
     {x:3.25,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'}
    ],
    left:[
     {x:-2.4,y:plinthY+1.55,w:1.25,h:2.30,kind:'window',glassKind:'lit'},
     {x:2.2,y:plinthY+2.25,w:2.45,h:2.05,kind:'window',glassKind:'lit',jali:false}
    ],
    right:[
     {x:-2.4,y:plinthY+1.55,w:1.25,h:2.30,kind:'window',glassKind:'lit'},
     {x:2.2,y:plinthY+1.55,w:1.25,h:2.30,kind:'window',glassKind:'lit'}
    ]
   });
   smLacquerBay(-5.70,plinthY+1.85,2.20,3.15,2.55,.88,{ry:-PI*.5,glassKind:'lit'});
   smParapet(11.6,11.4,roofY,{
    hole:{x0:-2.55,x1:2.55,z0:-2.55,z1:2.55},
    skipFrontW:5.8
   });
   smPishtaq(0,plinthY,5.60,{
    w:5.6,h:8.4,d:1.30,doorW:2.42,doorH:SM_GIANT_DOOR,giant:true,hollow:true,socketKind:v?'banner':'shield',doorName:'villa-pishtaq'
   });
   const drum=smDrum(0,roofY,0,8.2,{domeD:6.6,transH:1.95,clerH:1.42,hollow:true,windows:12});
   if(v){
    smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:5.42,ribs:20,turns:.42,hollow:true});
   }else{
    smDome(0,drum.topY,0,drum.domeD,{style:'carved',h:5.42,hollow:true});
   }
   smChimney(v?-4.15:4.15,roofY,-3.85,2.25,{r:.38});

   /* Qa'a carpet, marble salsa fountain bowl & rear crimson-lacquer ancestor blade-niche */
   svNoWalk(()=>{
    medallion('kilim',0,plinthY+.03,-.2,4.4,{ry:0});
    cyl('travertine',0,plinthY+.02,.65,.62,.28,P('travertine'),8,.58,false);
    cyl('paving',0,plinthY+.28,.65,.48,.05,P('glass'),8,null,false);
    W(0,plinthY+.02,-5.05,0,()=>{
     box('lacquer',0,0,0,2.45,3.65,.32,P('lacquer'));
     box('gold',0,3.65,0,2.58,.12,.38,P('gold'));
     for(let b=-1;b<=1;b++){
      box('bronze',b*.52,.65,.18,.07,1.45,.02,P('bronze'));
      cone('bronze',b*.52,2.10,.18,.04,.24,P('bronze'),4);
     }
    });
   });
   FURNISH('shumari_sword_cabinet',-4.25,plinthY+.02,-3.85,PI*.5);
   FURNISH('shumari_apricot_chest',4.25,plinthY+.02,2.95,-PI*.5);
   FURNISH('shumari_brass_kursi',1.65,plinthY+.02,.65,0);
   FURNISH('shumari_samovar_brazier',-1.65,plinthY+.02,.65,0);
   FURNISH('shumari_ancestor_niche',4.35,plinthY+.02,-3.85,PI);
   FURNISH('generic_candle_supply',-2.15,plinthY+.02,-4.65,0);
  });
  smCompoundStair(0,7.69,0,plinthY,PI,{w:2.8,going:.34});
  smWalkTarget('approach',0,0,8.05,{outside:true});
  smWalkTarget('qaa-hall',0,plinthY,-1.85,{});
  smWalkTarget('ancestor-niche',0,plinthY,-4.25,{});
 }
});

/* 2. sm_captain_bayt: Mamluk bayt compound with snowmelt court, reception iwan, +1 spiral blade-shrine dome, and retainers wing */
defBuilding({
 key:'sm_captain_bayt',
 name:'Regiment captain bayt compound',
 seed:8222,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:18.2,
 d:18.6,
 h:16.8,
 tags:{types:['dwelling-multi'],wealth:'rich',style:SM_STYLES.sword,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_captain_bayt);
  const plinthY=.92,wallH=5.65,roofY=plinthY+wallH;
  W(0,0,-.55,0,()=>{
   smPlinth(16.2,15.8,plinthY,{ablaqQuoins:true,topMk:'paving',topPal:'paving'});

   /* Front (+z) compound wall with 4.4 m Giant pishtaq portal opening into the paved court */
   W(0,0,7.62,0,()=>smAblaqWall(16.2,plinthY,4.85,[
    {x:0,y:plinthY,w:2.65,h:4.65,kind:'door'},
    {x:-5.4,y:plinthY+1.55,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true},
    {x:5.4,y:plinthY+1.55,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true}
   ],{t:.50}));
   smPishtaq(0,plinthY,7.65,{
    w:5.6,h:8.2,d:1.25,doorW:2.45,doorH:SM_GIANT_DOOR,giant:true,hollow:true,socketKind:'banner',doorName:'bayt-gate'
   });
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     for(let i=0;i<5;i++)smShurafatMerlon(sx*(3.3+i*1.05),plinthY+4.85,7.64,0,.88);
    }
    /* Octagonal courtyard snowmelt fountain */
    cyl('travertine',-.85,plinthY+.02,2.25,1.15,.36,P('travertine'),8,1.10,false);
    cyl('paving',-.85,plinthY+.36,2.25,.95,.05,P('glass'),8,null,false);
    cyl('bronzeCast',-.85,plinthY+.38,2.25,.14,.55,P('bronze'),10,.08,false);
   });

   /* West (-x) perimeter curtain & crimson mashrabiya gallery */
   W(-7.85,0,2.25,-PI*.5,()=>smAblaqWall(10.2,plinthY,4.85,[
    {x:0,y:plinthY+1.45,w:1.25,h:2.15,kind:'window',glassKind:'lit'}
   ],{t:.48}));

   /* Rear (-z) reception maq'ad & deep vaulted iwan hall */
   W(-1.65,0,-4.45,0,()=>{
    smHollowAblaq(12.2,6.4,plinthY,wallH,{
     t:.50,
     front:[
      {x:0,y:plinthY,w:3.25,h:4.65,kind:'arch'},
      {x:-4.1,y:plinthY+1.55,w:1.25,h:2.25,kind:'window',glassKind:'lit'},
      {x:4.1,y:plinthY+1.55,w:1.25,h:2.25,kind:'window',glassKind:'lit'}
     ],
     back:[
      {x:-3.2,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'},
      {x:3.2,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'}
     ],
     left:[{x:0,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'}],
     right:[{x:0,y:plinthY,w:2.35,h:4.45,kind:'door'}]
    });
    smParapet(12.4,6.6,roofY,{});
    smChimney(-4.65,roofY,-1.85,2.25,{r:.38});
    svNoWalk(()=>medallion('kilim',0,plinthY+.03,-.25,3.8,{ry:0}));
   });

   /* East (+x) regimental blade-shrine wing under a right-handed (+1) spiral dome */
   W(5.15,0,-1.25,0,()=>{
    smHollowAblaq(5.4,11.8,plinthY,wallH,{
     t:.48,
     front:[{x:0,y:plinthY,w:2.35,h:4.45,kind:'door'}],
     back:[{x:0,y:plinthY+1.65,w:1.15,h:2.20,kind:'window',glassKind:'lit'}],
     right:[
      {x:-2.8,y:plinthY+1.65,w:1.15,h:2.20,kind:'window',glassKind:'lit'},
      {x:2.8,y:plinthY+1.65,w:1.15,h:2.20,kind:'window',glassKind:'lit'}
     ],
     left:[{x:2.8,y:plinthY,w:2.35,h:4.45,kind:'arch'}]
    });
    smGiantPortal(0,plinthY,5.90,0,2.25,SM_GIANT_DOOR,{
     mk:'bronzeCast',col:0x9a7432,style:'grille',ajar:.95,front:false,name:'shrine-wing-gate'
    });
    smParapet(5.6,12.0,roofY,{hole:{x0:-1.75,x1:1.75,z0:-1.75,z1:1.75}});
    const drum=smDrum(0,roofY,0,5.0,{domeD:4.2,transH:1.55,clerH:1.15,hollow:true,windows:8});
    smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:3.48,ribs:18,turns:.45,hollow:true});
   });

   FURNISH('generic_strongbox',-6.25,plinthY+.02,-6.15,PI*.5);
   FURNISH('generic_chest',2.65,plinthY+.02,-6.15,0);
   FURNISH('generic_tea_set',-1.65,plinthY+.02,-5.45,0);
   FURNISH('generic_storage_jar',6.35,plinthY+.02,-5.65,PI);
   FURNISH('generic_candle_supply',5.15,plinthY+.02,-5.85,0);
   FURNISH('generic_writing_supplies',-4.25,plinthY+.02,-6.05,0);
  });

  smCompoundStair(0,9.39,0,plinthY,PI,{w:2.9,going:.34});
  smWalkTarget('approach',0,0,9.75,{outside:true});
  smWalkTarget('courtyard',-1.85,plinthY,2.15,{});
  smWalkTarget('reception-iwan',-1.65,plinthY,-4.65,{});
  smWalkTarget('blade-shrine',5.15,plinthY,-1.80,{});
 }
});

/* 3. sm_giant_sword_hall: heavy polygonal-basalt & ablaq Gedu-su Free Giant residence with courtyard arcade & hearth dais */
defBuilding({
 key:'sm_giant_sword_hall',
 name:'Gedu-su Free Giant sword hall',
 seed:8223,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.2,
 w:16.4,
 d:16.8,
 h:13.8,
 tags:{types:['dwelling-single'],wealth:'rich',style:SM_STYLES.sword,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_giant_sword_hall);
  const plinthY=1.15,wallH=6.25,roofY=plinthY+wallH;
  W(0,0,-.75,0,()=>{
   smPlinth(14.4,13.6,plinthY,{ablaqQuoins:true});

   /* Oversized 3-bay ablaq Giant loggia arcade along +z front */
   for(const px of [-5.8,-1.95,1.95,5.8]){
    box('basalt',px,plinthY+.02,5.65,.74,wallH-.12,.74,P('basaltDark'));
    svNoWalk(()=>{
     for(let c=0;c<14;c++){
      const m=smAblaqCourse(c);
      box(m.mk,px,plinthY+c*(wallH/14),5.65,.82,wallH/14,.82,m.col);
     }
    });
   }
   for(const ax of [-3.88,0,3.88]){
    W(ax,plinthY+4.55,5.65,0,()=>smAblaqArch(3.85,1.68,.78,{openW:3.05,springY:.10,voussoirs:13}));
   }

   /* Great Giant hall behind the loggia */
   W(0,0,-.95,0,()=>{
    smHollowAblaq(13.6,10.6,plinthY,wallH,{
     t:.54,
     front:[
      {x:0,y:plinthY,w:2.75,h:4.75,kind:'door'},
      {x:-4.15,y:plinthY+1.85,w:1.45,h:2.55,kind:'window',glassKind:'lit',bars:true},
      {x:4.15,y:plinthY+1.85,w:1.45,h:2.55,kind:'window',glassKind:'lit',bars:true}
     ],
     back:[
      {x:-3.85,y:plinthY+2.05,w:1.45,h:2.45,kind:'window',glassKind:'lit'},
      {x:3.85,y:plinthY+2.05,w:1.45,h:2.45,kind:'window',glassKind:'lit'}
     ],
     left:[
      {x:-2.35,y:plinthY+1.95,w:1.38,h:2.45,kind:'window',glassKind:'lit'},
      {x:2.35,y:plinthY+1.95,w:1.38,h:2.45,kind:'window',glassKind:'lit'}
     ],
     right:[
      {x:-2.35,y:plinthY+1.95,w:1.38,h:2.45,kind:'window',glassKind:'lit'},
      {x:2.35,y:plinthY+1.95,w:1.38,h:2.45,kind:'window',glassKind:'lit'}
     ]
    });
    smGiantPortal(0,plinthY,5.30,0,2.55,4.55,{
     kattu:true,mk:'lacquer',col:0xb83234,style:'banded',name:'giant-hall-portal'
    });
   });

   smParapet(13.8,12.8,roofY,{});
   smChimney(0,roofY,-4.85,2.65,{r:.46,smokeScale:.85});
   smSocket('banner',-5.8,plinthY+3.8,6.12,0,{scale:1.15});
   smSocket('banner',5.8,plinthY+3.8,6.12,0,{scale:1.15});

   /* Raised stone Giant hearth dais & dual-scale stone feast benches */
   svNoWalk(()=>{
    medallion('kilim',0,plinthY+.03,-.65,5.2,{ry:0});
    box('basalt',0,plinthY+.02,-4.45,4.2,.36,2.2,P('basaltDark'));
    cyl('bronzeCast',0,plinthY+.38,-4.45,.72,.34,P('bronze'),10,.82,false);
    cyl('glow',0,plinthY+.70,-4.45,.58,.05,P('ember'),10,null,false);
    cone('glow',0,plinthY+.74,-4.45,.24,.48,P('flame'),10);
    for(const sx of [-1,1]){
     box('travertine',sx*4.45,plinthY+.02,-1.25,1.35,.68,4.8,P('travertine'));
     box('kilim',sx*4.45,plinthY+.70,-1.25,1.25,.08,4.6,P('kilim'));
    }
   });
   haloAt(0,plinthY+1.05,-4.45,0xff9438,true);

   FURNISH('shumari_giant_divan',-5.15,plinthY+.02,2.45,PI*.5);
   FURNISH('shumari_giant_board',5.15,plinthY+.02,1.85,-PI*.5);
   FURNISH('generic_keg',5.15,plinthY+.02,-.25,-PI*.5);
   FURNISH('generic_roast',0,plinthY+.38,-3.65,0);
   FURNISH('generic_bread_basket',-1.45,plinthY+.38,-4.15,0);
   FURNISH('shumari_standard_rack',-5.15,plinthY+.02,-4.65,0);
  });

  smCompoundStair(0,8.09,0,plinthY,PI,{w:3.2,going:.34});
  smWalkTarget('approach',0,0,8.45,{outside:true});
  smWalkTarget('giant-arcade',0,plinthY,4.15,{});
  smWalkTarget('great-hall',0,plinthY,-1.70,{});
 }
});

/* 4. sm_rim_pavilion: cantilevered ablaq & crimson-lacquer belvedere pavilion under a pointed star-carved Mamluk dome */
defBuilding({
 key:'sm_rim_pavilion',
 name:'Gorge-rim belvedere pavilion',
 seed:8224,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:12.4,
 d:14.2,
 h:17.2,
 tags:{types:['dwelling-single'],wealth:'rich',style:SM_STYLES.sword,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_rim_pavilion);
  const plinthY=1.20,wallH=5.35,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(9.8,10.2,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.6,8.8,plinthY,wallH,{
    t:.48,
    front:[{x:0,y:plinthY,w:2.55,h:4.55,kind:'door'}],
    back:[{x:0,y:plinthY+1.10,w:3.45,h:2.85,kind:'window',glassKind:'lit',jali:false}],
    left:[{x:0,y:plinthY+1.35,w:2.65,h:2.55,kind:'arch'}],
    right:[{x:0,y:plinthY+1.35,w:2.65,h:2.55,kind:'arch'}]
   });
   /* Glazed winter screens in the side pointed arches + cantilevered canyon-facing crimson lacquer belvedere on -z */
   for(const sx of [-1,1]){
    svPane(sx*4.18,plinthY+1.40,0,sx>0?PI*.5:-PI*.5,2.45,2.35,{kind:'lit',solid:false});
    svNoWalk(()=>box('jali',sx*4.22,plinthY+1.40,0,.03,2.35,2.45,P('travertine')));
   }
   smLacquerBay(0,plinthY+.85,-4.40,4.85,3.25,1.15,{ry:PI,glassKind:'lit',solid:false});
   smGiantPortal(0,plinthY,4.40,0,2.38,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xb83234,style:'banded',name:'belvedere-portal'
   });
   smParapet(8.8,9.0,roofY,{hole:{x0:-2.35,x1:2.35,z0:-2.35,z1:2.35}});
   const drum=smDrum(0,roofY,0,7.2,{domeD:5.8,transH:1.75,clerH:1.30,hollow:true,windows:12});
   smDome(0,drum.topY,0,drum.domeD,{style:'carved',h:4.78,hollow:true});
   svNoWalk(()=>medallion('kilim',0,plinthY+.03,0,3.8,{round:true}));
   FURNISH('generic_tea_set',0,plinthY+.02,-1.25,0);
   FURNISH('generic_fruit_bowl',1.45,plinthY+.02,-1.25,0);
  });

  smCompoundStair(0,6.49,0,plinthY,PI,{w:2.8,going:.34});
  smWalkTarget('approach',0,0,6.85,{outside:true});
  smWalkTarget('belvedere',0,plinthY,-.65,{});
 }
});
