/* prefix: sm */
// ================================================================= SHUMARI CIVIC & STATE BUILDINGS (Phase SM4)
// Monumental state halls of the Subaru-su: ALL carry role: 'civic' and giant: true (>= 4.4 m portals, >= 5.4 m vaults).

/* 1. sm_diwan_hall: Grand Council of the Subaru-su under an 8.8 m star-carved Mamluk dome with Giant & human benches */
defBuilding({
 key:'sm_diwan_hall',
 name:'Diwan council hall of the Subaru-su',
 seed:8301,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:7.6,
 w:18.8,
 d:20.4,
 h:22.4,
 tags:{types:['civic'],wealth:'rich',style:SM_STYLES.state,role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_diwan_hall);
  const plinthY=1.25,wallH=6.35,roofY=plinthY+wallH;
  W(0,0,-.95,0,()=>{
   smPlinth(16.6,16.4,plinthY,{ablaqQuoins:true});
   smHollowAblaq(15.2,14.8,plinthY,wallH,{
    t:.54,
    front:[
     {x:0,y:plinthY,w:2.85,h:4.85,kind:'door'},
     {x:-5.0,y:plinthY+1.65,w:1.45,h:2.65,kind:'window',glassKind:'lit',bars:true},
     {x:5.0,y:plinthY+1.65,w:1.45,h:2.65,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-4.6,y:plinthY+1.75,w:1.45,h:2.65,kind:'window',glassKind:'lit',bars:true},
     {x:0,y:plinthY+2.05,w:2.15,h:2.85,kind:'window',glassKind:'lit',bars:true},
     {x:4.6,y:plinthY+1.75,w:1.45,h:2.65,kind:'window',glassKind:'lit',bars:true}
    ],
    left:[
     {x:-3.4,y:plinthY+1.65,w:1.42,h:2.65,kind:'window',glassKind:'lit',bars:true},
     {x:3.4,y:plinthY+1.65,w:1.42,h:2.65,kind:'window',glassKind:'lit',bars:true}
    ],
    right:[
     {x:-3.4,y:plinthY+1.65,w:1.42,h:2.65,kind:'window',glassKind:'lit',bars:true},
     {x:3.4,y:plinthY+1.65,w:1.42,h:2.65,kind:'window',glassKind:'lit',bars:true}
    ]
   });
   svNoWalk(()=>box('frieze_kattu',0,roofY-.56,7.44,15.3,.38,.12,0xffffff));
   smPishtaq(0,plinthY,7.40,{
    w:6.4,h:9.6,d:1.45,doorW:2.60,doorH:4.55,giant:true,hollow:true,socketKind:'banner',doorName:'diwan-pishtaq'
   });
   smParapet(15.4,15.0,roofY,{
    hole:{x0:-3.45,x1:3.45,z0:-3.45,z1:3.45},
    skipFrontW:6.5
   });
   const drum=smDrum(0,roofY,0,10.8,{domeD:8.8,transH:2.35,clerH:1.75,hollow:true,windows:12});
   smDome(0,drum.topY,0,drum.domeD,{style:'carved',h:7.22,hollow:true});

   /* Dual-scale tiered council benches around the central medallion */
   svNoWalk(()=>{
    medallion('kilim',0,plinthY+.03,-.35,5.8,{round:true});
    for(const sx of [-1,1]){
     box('basalt',sx*5.45,plinthY+.02,-.45,1.55,.72,7.6,P('basaltDark'));
     box('travertine',sx*4.25,plinthY+.02,-.45,1.05,.44,7.2,P('travertine'));
     box('kilim',sx*5.45,plinthY+.74,-.45,1.42,.07,7.4,P('kilim'));
    }
    /* High Sword-Marshal dais on -z */
    box('travertine',0,plinthY+.02,-5.65,4.8,.52,1.95,P('travertine'));
    box('lacquer',0,plinthY+.54,-6.35,3.2,3.4,.28,P('lacquer'));
    box('frieze_kattu',0,plinthY+3.94,-6.32,3.4,.34,.32,0xffffff);
   });
   FURNISH('shumari_standard_rack',-5.85,plinthY+.02,5.35,PI*.5);
   FURNISH('shumari_standard_rack',5.85,plinthY+.02,5.35,-PI*.5);
   FURNISH('shumari_kattu_lectern',-1.45,plinthY+.54,-5.45,0);
   FURNISH('shumari_kattu_lectern',1.45,plinthY+.54,-5.45,0);
   FURNISH('generic_candle_supply',-5.85,plinthY+.02,-5.65,0);
   FURNISH('generic_lamp_oil',5.85,plinthY+.02,-5.65,0);
  });

  smCompoundStair(0,9.63,0,plinthY,PI,{w:3.6,going:.34});
  smWalkTarget('approach',0,0,9.95,{outside:true});
  smWalkTarget('council-floor',0,plinthY,-.95,{});
  smWalkTarget('marshal-dais-foot',0,plinthY,-4.45,{});
 }
});

/* 2. sm_kattu_chancery: State registry & Sumaru-kattu scriptorium with prominent frieze_kattu epigraphic lintel & bullseyes */
defBuilding({
 key:'sm_kattu_chancery',
 name:'Sumaru-kattu chancery and registry',
 seed:8302,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:16.2,
 d:16.2,
 h:13.2,
 tags:{types:['civic'],wealth:'rich',style:SM_STYLES.state,job:'scribing',role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_kattu_chancery);
  const plinthY=.96,wallH=5.65,roofY=plinthY+wallH;
  W(0,0,-.75,0,()=>{
   smPlinth(14.2,12.2,plinthY,{ablaqQuoins:true});
   smHollowAblaq(13.2,11.2,plinthY,wallH,{
    t:.50,
    front:[
     {x:0,y:plinthY,w:2.65,h:4.55,kind:'door'},
     {x:-4.15,y:plinthY+1.45,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:4.15,y:plinthY+1.45,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-3.85,y:plinthY+1.55,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:0,y:plinthY+1.55,w:1.55,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:3.85,y:plinthY+1.55,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    left:[
     {x:-2.4,y:plinthY+1.55,w:1.28,h:2.30,kind:'window',glassKind:'lit',bars:true},
     {x:2.4,y:plinthY+1.55,w:1.28,h:2.30,kind:'window',glassKind:'lit',bars:true}
    ],
    right:[
     {x:-2.4,y:plinthY+1.55,w:1.28,h:2.30,kind:'window',glassKind:'lit',bars:true},
     {x:2.4,y:plinthY+1.55,w:1.28,h:2.30,kind:'window',glassKind:'lit',bars:true}
    ]
   });

   /* Prominent carved Sumaru-kattu cuneiform lintel & full perimeter epigraphic band */
   smGiantPortal(0,plinthY,5.60,0,2.45,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xb83234,style:'banded',name:'chancery-portal'
   });
   svNoWalk(()=>{
    box('frieze_kattu',0,plinthY+4.85,5.68,13.3,.46,.14,0xffffff);
    box('frieze_kattu',0,plinthY+4.85,-5.68,13.3,.46,.14,0xffffff);
    for(const qx of [-4.15,4.15]){
     smQamariyya(qx,plinthY+4.25,5.64,.30,0,false);
    }
    /* Stone tablet & regiment-roll archive pigeonholes along -x and +x walls */
    for(const sx of [-1,1]){
     W(sx*5.65,plinthY+.02,-.25,sx>0?-PI*.5:PI*.5,()=>{
      box('travertine',0,0,0,7.4,3.45,.42,P('travertine'));
      for(let r=0;r<4;r++)box('basalt',0,.75+r*.72,.08,7.1,.08,.36,P('basaltDark'));
     });
    }
   });
   smParapet(13.4,11.4,roofY,{});
   smChimney(-4.85,roofY,-3.95,2.15,{r:.36});

   FURNISH('shumari_kattu_lectern',-3.45,plinthY+.02,-3.85,0);
   FURNISH('shumari_kattu_lectern',3.45,plinthY+.02,-3.85,0);
   FURNISH('shumari_sword_cabinet',-4.65,plinthY+.02,3.65,PI*.5);
   FURNISH('shumari_sword_cabinet',4.65,plinthY+.02,3.65,-PI*.5);
   FURNISH('shumari_apricot_chest',0,plinthY+.02,-4.15,0);
   FURNISH('generic_candle_supply',1.85,plinthY+.02,-4.15,0);
  });

  smCompoundStair(0,7.39,0,plinthY,PI,{w:2.9,going:.34});
  smWalkTarget('approach',0,0,7.75,{outside:true});
  smWalkTarget('registry-hall',0,plinthY,-.75,{});
 }
});

/* 3. sm_wikala_caravanserai: fortified customs wikala with 4.6 m Giant gate-iwan, cobbled pack-court, and upper -no galleries */
defBuilding({
 key:'sm_wikala_caravanserai',
 name:'Wikala customs caravanserai',
 seed:8303,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.outlander,
 vaultH:5.6,
 w:22.4,
 d:21.6,
 h:15.4,
 tags:{types:['inn','market','civic'],wealth:'middle',style:SM_STYLES.state,job:'customs',role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_wikala_caravanserai);
  const plinthY=.72,gH=5.45,uY=plinthY+gH,uH=3.15,roofY=uY+uH;
  W(0,0,-.55,0,()=>{
   smPlinth(20.4,18.6,plinthY,{ablaqQuoins:true,topMk:'cobble',topPal:'cobble'});

   /* Outer perimeter enclosure with 4.6 m Giant customs gate-iwan */
   smHollowAblaq(19.6,17.8,plinthY,gH,{
    t:.54,
    floor:false,
    front:[
     {x:0,y:plinthY,w:3.05,h:4.85,kind:'door'},
     {x:-6.4,y:plinthY+1.65,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true},
     {x:6.4,y:plinthY+1.65,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true}
    ],
    back:[
     {x:-6.0,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true},
     {x:6.0,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true}
    ],
    left:[
     {x:-4.4,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true},
     {x:4.4,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true}
    ],
    right:[
     {x:-4.4,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true},
     {x:4.4,y:plinthY+1.75,w:1.25,h:2.15,kind:'window',glassKind:'smoked',bars:true}
    ]
   });
   smPishtaq(0,plinthY,8.90,{
    w:6.2,h:9.0,d:1.35,doorW:2.85,doorH:4.60,giant:true,hollow:true,socketKind:'shield',doorName:'wikala-customs-gate'
   });

   /* Open central pack-court (10.4 x 9.2 m) ringed by walkable upper gallery slab & crimson-lacquered -no merchant bays */
   svWell('paving',0,uY-.24,0,19.4,.24,17.6,P('paving'),{x0:-5.2,x1:5.2,z0:-4.6,z1:4.6},{walk:true});
   smCompoundStair(-6.85,4.15,plinthY,uY,PI,{w:2.45,going:.30});

   /* Upper storey merchant lodging around the court */
   smHollowAblaq(19.6,17.8,uY,uH,{
    t:.46,
    floor:false,
    front:[
     {x:-6.2,y:uY+.85,w:2.25,h:1.75,kind:'window',glassKind:'lit',jali:false},
     {x:6.2,y:uY+.85,w:2.25,h:1.75,kind:'window',glassKind:'lit',jali:false}
    ],
    back:[
     {x:-5.6,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'},
     {x:0,y:uY+.95,w:1.45,h:1.55,kind:'window',glassKind:'lit'},
     {x:5.6,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'}
    ],
    left:[
     {x:-4.2,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'},
     {x:4.2,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'}
    ],
    right:[
     {x:-4.2,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'},
     {x:4.2,y:uY+.95,w:1.25,h:1.55,kind:'window',glassKind:'lit'}
    ]
   });
   smLacquerBay(-6.2,uY+.35,8.90,3.15,2.35,.86,{glassKind:'lit',solid:true});
   smLacquerBay(6.2,uY+.35,8.90,3.15,2.35,.86,{glassKind:'lit',solid:true});
   smParapet(19.8,18.0,roofY,{
    hole:{x0:-5.2,x1:5.2,z0:-4.6,z1:4.6},
    skipFrontW:6.3
   });

   /* Courtyard pack-beast watering trough & upper crimson court-gallery balustrades */
   svNoWalk(()=>{
    box('basalt',2.65,plinthY+.02,0,3.4,.68,1.15,P('basaltDark'));
    box('paving',2.65,plinthY+.58,0,3.1,.08,.85,P('glass'));
    box('lacquer',0,uY+.88,-4.65,10.6,.10,.10,P('lacquer'));
    box('lacquer',0,uY+.88,4.65,10.6,.10,.10,P('lacquer'));
    box('lacquer',5.25,uY+.88,0,.10,.10,9.4,P('lacquer'));
   });

   FURNISH('generic_crate',-7.45,plinthY+.02,-6.85,0);
   FURNISH('generic_barrel',-5.85,plinthY+.02,-6.85,0);
   FURNISH('generic_sack',6.85,plinthY+.02,-6.85,PI*.25);
   FURNISH('generic_strongbox',7.45,plinthY+.02,6.45,-PI*.5);
   FURNISH('generic_bottle_crate',4.85,plinthY+.02,-6.85,0);
   FURNISH('generic_pantry_boxes',7.45,uY+.02,0,-PI*.5);
  });

  smCompoundStair(0,10.07,0,plinthY,PI,{w:3.4,going:.33});
  smWalkTarget('approach',0,0,10.45,{outside:true});
  smWalkTarget('pack-court',-.85,plinthY,-.55,{});
  smWalkTarget('upper-gallery',0,uY,-6.85,{});
 }
});

/* 4. sm_hammam: domed Mamluk bathhouse with pierced bathLens glass-oculus blister domes and carved entry vestibule */
defBuilding({
 key:'sm_hammam',
 name:'Pierced-dome Mamluk hammam',
 seed:8304,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.hearth,
 vaultH:5.4,
 w:16.8,
 d:16.4,
 h:15.2,
 tags:{types:['civic'],wealth:'middle',style:SM_STYLES.state,role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_hammam);
  const plinthY=.76,wallH=5.45,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(14.8,13.6,plinthY,{ablaqQuoins:true});
   /* Thick windowless steam-retaining ablaq walls on the hot rooms; lit windows only on +z changing hall */
   smHollowAblaq(13.8,12.6,plinthY,wallH,{
    t:.56,
    front:[
     {x:-2.85,y:plinthY,w:2.55,h:4.55,kind:'door'},
     {x:3.25,y:plinthY+1.65,w:1.35,h:2.25,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[],
    left:[{x:3.2,y:plinthY+1.75,w:1.15,h:2.10,kind:'window',glassKind:'lit'}],
    right:[]
   });
   smGiantPortal(-2.85,plinthY,6.30,0,2.40,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xa83031,style:'banded',name:'hammam-portal'
   });
   smParapet(14.0,12.8,roofY,{hole:{x0:-4.8,x1:-.9,z0:.4,z1:4.3}});

   /* Entry changing-hall (maslakh) crowned by a true carved Mamluk dome */
   const drum=smDrum(-2.85,roofY,2.35,5.8,{domeD:4.8,transH:1.58,clerH:1.18,hollow:true,windows:10});
   smDome(-2.85,drum.topY,2.35,drum.domeD,{style:'carved',h:3.94,hollow:true});

   /* Clusters of low hemispherical bathLens pierced glass-lens steam domes over tepidarium & caldarium */
   smBathDome(2.95,roofY,2.15,4.8,2.15);
   smBathDome(2.45,roofY,-2.85,5.8,2.55);
   smBathDome(-2.85,roofY,-3.05,4.4,1.98);

   /* Rear masonry hypocaust boiler room & tall basalt furnace chimney */
   smChimney(5.25,roofY,-4.65,3.15,{r:.46,smokeScale:.38});
   FURNISH('generic_soap',1.85,plinthY+.02,3.45,0);
   FURNISH('generic_water',3.45,plinthY+.02,3.45,0);
  });

  smCompoundStair(-2.85,7.47,0,plinthY,PI,{w:2.8,going:.33});
  smWalkTarget('approach',-2.85,0,7.85,{outside:true});
  smWalkTarget('maslakh-hall',-2.85,plinthY,1.25,{});
  smWalkTarget('steam-hall',1.85,plinthY,-2.65,{});
 }
});

/* 5. sm_bimaristan: regimental hospital & house of healing around an octagonal snowmelt basin */
defBuilding({
 key:'sm_bimaristan',
 name:'Regimental bimaristan hospital',
 seed:8305,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.hearth,
 vaultH:5.5,
 w:18.4,
 d:19.0,
 h:15.6,
 tags:{types:['civic'],wealth:'rich',style:SM_STYLES.state,job:'healing',role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_bimaristan);
  const plinthY=.88,wallH=5.55,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(16.4,14.8,plinthY,{ablaqQuoins:true});
   smHollowAblaq(15.4,13.8,plinthY,wallH,{
    t:.50,
    front:[
     {x:0,y:plinthY,w:2.65,h:4.65,kind:'door'},
     {x:-4.85,y:plinthY+1.55,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:4.85,y:plinthY+1.55,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-4.65,y:plinthY+1.65,w:1.35,h:2.35,kind:'window',glassKind:'lit'},
     {x:0,y:plinthY+1.65,w:1.65,h:2.45,kind:'window',glassKind:'lit'},
     {x:4.65,y:plinthY+1.65,w:1.35,h:2.35,kind:'window',glassKind:'lit'}
    ],
    left:[
     {x:-3.1,y:plinthY+1.65,w:1.30,h:2.30,kind:'window',glassKind:'lit'},
     {x:3.1,y:plinthY+1.65,w:1.30,h:2.30,kind:'window',glassKind:'lit'}
    ],
    right:[
     {x:-3.1,y:plinthY+1.65,w:1.30,h:2.30,kind:'window',glassKind:'lit'},
     {x:3.1,y:plinthY+1.65,w:1.30,h:2.30,kind:'window',glassKind:'lit'}
    ]
   });
   smPishtaq(0,plinthY,6.90,{
    w:5.8,h:8.4,d:1.30,doorW:2.45,doorH:SM_GIANT_DOOR,giant:true,hollow:true,socketKind:'shield',doorName:'bimaristan-pishtaq'
   });
   smParapet(15.6,14.0,roofY,{
    hole:{x0:-2.4,x1:2.4,z0:-2.4,z1:2.4},
    skipFrontW:5.9
   });
   const drum=smDrum(0,roofY,-2.65,6.6,{domeD:5.4,transH:1.68,clerH:1.25,hollow:true,windows:10});
   smDome(0,drum.topY,-2.65,drum.domeD,{style:'carved',h:4.45,hollow:true});
   smChimney(-5.65,roofY,-4.85,2.25,{r:.38});

   /* Soothing central snowmelt basin & apothecary shelves */
   svNoWalk(()=>{
    cyl('travertine',0,plinthY+.02,.65,1.18,.34,P('travertine'),8,1.12,false);
    cyl('paving',0,plinthY+.34,.65,.98,.05,P('glass'),8,null,false);
    medallion('kilim',-4.65,plinthY+.03,-2.45,3.2,{ry:0});
    medallion('kilim',4.65,plinthY+.03,-2.45,3.2,{ry:0});
   });
   FURNISH('generic_medicine',-5.65,plinthY+.02,4.45,PI*.5);
   FURNISH('generic_herb_bundles',5.65,plinthY+.02,4.45,-PI*.5);
   FURNISH('generic_poor_straw_bed',-5.45,plinthY+.02,-3.85,PI*.5);
   FURNISH('generic_poor_straw_bed',5.45,plinthY+.02,-3.85,-PI*.5);
   FURNISH('generic_canister_set',0,plinthY+.02,-5.45,0);
   FURNISH('generic_water',2.45,plinthY+.02,-5.45,0);
  });

  smCompoundStair(0,8.79,0,plinthY,PI,{w:3.0,going:.34});
  smWalkTarget('approach',0,0,9.15,{outside:true});
  smWalkTarget('healing-court',0,plinthY,2.45,{});
  smWalkTarget('ward-iwan',-4.25,plinthY,-2.65,{});
 }
});

/* 6. sm_state_granary: buttressed basalt-and-ablaq vaulted citadel grain & dried-apricot storehouse */
defBuilding({
 key:'sm_state_granary',
 name:'Citadel vaulted state granary',
 seed:8306,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.hearth,
 vaultH:5.8,
 w:16.6,
 d:16.0,
 h:12.4,
 tags:{types:['civic','infrastructure'],wealth:'middle',style:SM_STYLES.state,job:'warehousing',role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_state_granary);
  const plinthY=.95,wallH=5.85,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(14.6,11.6,plinthY,{ablaqQuoins:true});
   smHollowAblaq(13.4,10.4,plinthY,wallH,{
    t:.58,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:2.65,h:4.55,kind:'door'},
     {x:-4.2,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false},
     {x:4.2,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false}
    ],
    back:[
     {x:-4.2,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false},
     {x:0,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false},
     {x:4.2,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false}
    ],
    left:[{x:0,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false}],
    right:[{x:0,y:plinthY+3.25,w:.52,h:1.45,kind:'window',glassKind:'smoked',bars:true,jali:false}]
   });
   /* Heavy battered basalt buttresses & rooftop timber sack-hoist beam */
   svNoWalk(()=>{
    for(const bx of [-5.8,-2.4,2.4,5.8])for(const sz of [-1,1]){
     box('basalt',bx,plinthY,sz*5.35,.68,wallH*.82,.56,P('basaltDark'));
    }
    beam('timber',[0,roofY+.45,4.1],[0,roofY+.65,6.15],.16,P('timber'));
    ring('iron',0,roofY+.35,5.95,.18,.03,P('iron'),0,PI*.5,0,10);
    cord('timber',[[0,roofY+.32,5.95],[0,plinthY+2.65,5.95]],.022,P('thatch'));
   });
   smGiantPortal(0,plinthY,5.20,0,2.48,SM_GIANT_DOOR,{
    kattu:true,mk:'iron',col:0x38383c,style:'banded',name:'granary-giant-doors'
   });
   smParapet(13.6,10.6,roofY,{});
   FURNISH('generic_sack',-4.45,plinthY+.02,2.45,0);
   FURNISH('generic_sack',-3.65,plinthY+.02,2.45,PI*.3);
   FURNISH('generic_barrel',4.45,plinthY+.02,2.45,0);
   FURNISH('generic_meal_ark',4.15,plinthY+.02,-2.85,-PI*.5);
  });

  smCompoundStair(0,7.19,0,plinthY,PI,{w:3.0,going:.34});
  smWalkTarget('approach',0,0,7.55,{outside:true});
  smWalkTarget('granary-aisle',0,plinthY,-.65,{});
 }
});

/* 7. sm_cistern_hall: half-sunken groin-vaulted snowmelt reservoir with octagonal ablaq draw-head & +1 spiral dome */
defBuilding({
 key:'sm_cistern_hall',
 name:'Vaulted snowmelt cistern hall',
 seed:8307,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.hearth,
 vaultH:5.6,
 w:14.4,
 d:16.8,
 h:16.8,
 tags:{types:['civic','infrastructure','fountain'],wealth:'rich',style:SM_STYLES.state,role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_cistern_hall);
  const plinthY=.82,wallH=5.60,roofY=plinthY+wallH;
  W(0,0,-.55,0,()=>{
   smPlinth(12.2,12.2,plinthY,{ablaqQuoins:true});
   smHollowAblaq(11.0,11.0,plinthY,wallH,{
    t:.52,
    front:[
     {x:0,y:plinthY,w:2.55,h:4.55,kind:'door'},
     {x:-3.35,y:plinthY+1.65,w:1.15,h:2.25,kind:'window',glassKind:'smoked',bars:true},
     {x:3.35,y:plinthY+1.65,w:1.15,h:2.25,kind:'window',glassKind:'smoked',bars:true}
    ],
    back:[{x:0,y:plinthY+1.75,w:1.45,h:2.35,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.75,w:1.45,h:2.35,kind:'window',glassKind:'smoked',bars:true}],
    right:[{x:0,y:plinthY+1.75,w:1.45,h:2.35,kind:'window',glassKind:'smoked',bars:true}]
   });
   smGiantPortal(0,plinthY,5.50,0,2.40,SM_GIANT_DOOR,{
    kattu:true,mk:'bronzeCast',col:0x9a7432,style:'grille',ajar:.95,name:'cistern-portal'
   });
   smParapet(11.2,11.2,roofY,{hole:{x0:-2.55,x1:2.55,z0:-2.55,z1:2.55}});
   const drum=smDrum(0,roofY,0,7.6,{domeD:6.2,transH:1.85,clerH:1.35,hollow:true,windows:12});
   smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:5.08,ribs:22,turns:.45,hollow:true});

   /* Octagonal ablaq wellhead & bronze bucket-wheel over the sunken snowmelt basin (set toward -z so walk aisle stays open) */
   svNoWalk(()=>{
    W(0,plinthY+.02,-1.65,0,()=>{
     cyl('basalt',0,0,0,1.65,.78,P('basaltDark'),8,1.58,false);
     cyl('travertine',0,.78,0,1.74,.14,P('travertine'),8,1.68,false);
     cyl('paving',0,.52,0,1.38,.08,P('glass'),8,null,false);
     for(const sx of [-1,1])box('bronzeCast',sx*1.45,.92,0,.18,1.85,.22,P('bronze'));
     beam('bronze',[-1.55,2.65,0],[1.55,2.65,0],.06,P('bronze'));
     ring('bronzeCast',0,2.65,0,.58,.05,P('bronze'),0,0,PI*.5,14);
    });
    /* Exterior basalt snowmelt aqueduct intake channel on -x */
    box('basalt',-5.85,plinthY+.45,0,.65,.42,3.4,P('basaltDark'));
   });
   FURNISH('generic_water',-3.65,plinthY+.02,2.85,0);
   FURNISH('generic_storage_jar',3.65,plinthY+.02,2.85,0);
  });

  smCompoundStair(0,7.59,0,plinthY,PI,{w:2.8,going:.34});
  smWalkTarget('approach',0,0,7.95,{outside:true});
  smWalkTarget('cistern-walk',0,plinthY,1.65,{});
 }
});

/* 8. sm_envoy_house: guarded ablaq embassy residence in the outer -no ward with walled forecourt & banner mounts */
defBuilding({
 key:'sm_envoy_house',
 name:'Guarded envoy embassy residence',
 seed:8308,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.outlander,
 vaultH:5.5,
 w:15.4,
 d:17.6,
 h:14.2,
 tags:{types:['civic','dwelling-multi'],wealth:'rich',style:SM_STYLES.sword,role:'civic',lit:true},
 build(){
  smBindRec(DEFS.sm_envoy_house);
  const plinthY=.92,wallH=5.55,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(13.4,13.2,plinthY,{ablaqQuoins:true});
   smHollowAblaq(12.2,11.6,plinthY,wallH,{
    t:.50,
    front:[
     {x:0,y:plinthY,w:2.65,h:4.60,kind:'door'},
     {x:-3.85,y:plinthY+1.55,w:1.25,h:2.30,kind:'window',glassKind:'lit',bars:true},
     {x:3.85,y:plinthY+2.15,w:2.45,h:2.10,kind:'window',glassKind:'lit',jali:false}
    ],
    back:[
     {x:-3.25,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'},
     {x:3.25,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.65,w:1.35,h:2.25,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.65,w:1.35,h:2.25,kind:'window',glassKind:'lit'}]
   });
   smPishtaq(0,plinthY,5.80,{
    w:5.6,h:8.4,d:1.28,doorW:2.42,doorH:SM_GIANT_DOOR,giant:true,hollow:true,socketKind:'banner',doorName:'envoy-pishtaq'
   });
   smLacquerBay(3.85,plinthY+1.75,5.80,3.05,2.55,.88,{glassKind:'lit',solid:true});
   smParapet(12.4,11.8,roofY,{skipFrontW:5.7});
   smChimney(-4.15,roofY,-3.85,2.25,{r:.36});
   FURNISH('generic_chest',-4.25,plinthY+.02,-3.85,PI*.5);
   FURNISH('generic_tea_set',0,plinthY+.02,-2.25,0);
  });

  smCompoundStair(0,7.99,0,plinthY,PI,{w:2.8,going:.34});
  smWalkTarget('approach',0,0,8.35,{outside:true});
  smWalkTarget('reception-hall',0,plinthY,-.65,{});
 }
});
