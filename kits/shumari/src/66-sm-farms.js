/* prefix: sm */
// ================================================================= SHUMARI HIGHLAND FARMS, ORCHARDS & WATERMILL (Phase SM4)
// Snowmelt chute watermill, twist-apricot canyon terrace orchard, dry-stone millet/oat bench farm, dark fungus cellar, and stock fold.

/* 1. sm_watermill: basalt canyon-chute millhouse with stone aqueduct flume and overshot timber-and-iron waterwheel */
defBuilding({
 key:'sm_watermill',
 name:'Snowmelt canyon-chute watermill',
 seed:8441,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.5,
 w:13.6,
 d:11.8,
 h:9.4,
 tags:{types:['industry','farm'],wealth:'middle',style:SM_STYLES.hearth,job:'milling',role:'farm',lit:true},
 build(){
  smBindRec(DEFS.sm_watermill);
  const plinthY=.48,wallH=3.65,roofY=plinthY+wallH;
  W(-.85,0,-.35,0,()=>{
   smPlinth(9.4,8.8,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.6,8.0,plinthY,wallH,{
    t:.48,
    mode:'basalt',
    front:[
     {x:-1.45,y:plinthY,w:1.45,h:2.35,kind:'door'},
     {x:1.75,y:plinthY+1.05,w:1.15,h:1.45,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:plinthY+1.15,w:1.15,h:1.45,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:plinthY+1.15,w:1.15,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.35,w:.85,h:1.25,kind:'window',glassKind:'smoked'}]
   });
   smHumanDoor(-1.45,plinthY,4.00,0,1.35,SM_HUMAN_DOOR,{mk:'cedar',style:'banded',name:'watermill-door'});
   smParapet(8.8,8.2,roofY,{});

   /* East (+x) basalt snowmelt aqueduct flume & 4.2 m overshot timber-and-iron waterwheel */
   svNoWalk(()=>{
    const wx=4.95,wy=plinthY+2.05,wR=2.05;
    box('basalt',wx+.65,0,-2.85,1.25,plinthY+3.85,2.45,P('basaltDark'));
    box('basalt',wx+.15,plinthY+3.65,-1.25,.85,.48,3.65,P('basalt'));
    box('paving',wx+.15,plinthY+4.02,-1.25,.58,.08,3.55,P('glass'));
    /* Waterwheel axle, twin rims, spokes & paddles */
    beam('iron',[3.95,wy,0],[wx+.85,wy,0],.12,P('iron'));
    for(const rx of [wx-.28,wx+.28]){
     ring('timber',rx,wy,0,wR,.10,P('timber'),0,0,PI*.5,20);
     ring('iron',rx,wy,0,wR+.06,.03,P('iron'),0,0,PI*.5,20);
    }
    for(let s=0;s<12;s++){
     const a=s/12*TAU;
     const cy=wy+Math.sin(a)*wR,cz=Math.cos(a)*wR;
     beam('timber',[wx-.28,wy,0],[wx-.28,cy,cz],.05,P('cedar'));
     beam('timber',[wx+.28,wy,0],[wx+.28,cy,cz],.05,P('cedar'));
     box('cedar',wx,cy,cz,.54,.06,.34,P('cedar'));
    }
    /* Interior basalt millstone pair */
    cyl('basalt',1.65,plinthY+.02,-.65,.88,.42,P('basaltDark'),16,.88,false);
    cyl('travertine',1.65,plinthY+.44,-.65,.84,.32,P('travertine'),16,.84,false);
   });
   FURNISH('generic_sack',-2.45,plinthY+.02,-2.45,0);
   FURNISH('generic_sack',-1.65,plinthY+.02,-2.55,PI*.3);
   FURNISH('generic_meal_ark',2.35,plinthY+.02,2.15,-PI*.5);
  });

  svStair(-2.30,5.00,0,plinthY,PI,{w:1.85,run:.95,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-2.30,0,5.40,{outside:true});
  smWalkTarget('mill-floor',-2.05,plinthY,-.35,{});
 }
});

/* 2. sm_apricot_orchard: dry-stone canyon terrace plot with gnarled twist-apricot trees, drying trays & kernel press */
defBuilding({
 key:'sm_apricot_orchard',
 name:'Terraced twist-apricot orchard and kernel press',
 seed:8442,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.1,
 w:15.2,
 d:13.4,
 h:7.8,
 tags:{types:['farm'],wealth:'middle',style:SM_STYLES.hearth,job:'farming',role:'farm',lit:true},
 build(){
  smBindRec(DEFS.sm_apricot_orchard);
  const lowY=.36,terY=.92,wallH=3.15,roofY=lowY+wallH;

  /* Lower press & drying house on -x; raised dry-stone orchard bench on +x */
  W(-3.85,0,.55,0,()=>{
   smPlinth(5.6,8.2,lowY,{ablaqQuoins:true});
   smHollowAblaq(5.0,7.4,lowY,wallH,{
    t:.46,
    mode:'basalt',
    front:[
     {x:0,y:lowY,w:1.38,h:2.28,kind:'door'},
     {x:-1.35,y:lowY+1.05,w:.85,h:1.25,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:lowY+1.10,w:.88,h:1.20,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:lowY+1.10,w:.88,h:1.20,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:lowY+1.10,w:.88,h:1.20,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,lowY,3.70,0,1.28,2.20,{mk:'lacquer',col:0xa83031,style:'plank',name:'orchard-shed-door'});
   smParapet(5.2,7.6,roofY,{});
   /* Sun-drying woven apricot trays spread across the flat stone roof */
   svNoWalk(()=>{
    for(const [tx,tz] of [[-1.1,-1.6],[1.1,-1.6],[-1.1,1.4],[1.1,1.4]]){
     box('cedar',tx,roofY+.02,tz,1.65,.08,2.15,P('cedar'));
     box('gold',tx,roofY+.08,tz,1.48,.05,1.98,0xe4882e);
    }
   });
   FURNISH('generic_fruit_bowl',-1.35,lowY+.02,-2.25,0);
   FURNISH('generic_preserves',1.35,lowY+.02,-2.25,0);
  });

  /* Stepped dry-stone basalt orchard terrace on +x with three gnarled blossoming twist-apricot trees */
  W(2.65,0,-.25,0,()=>{
   smPlinth(7.2,10.2,terY,{ablaqQuoins:false,topMk:'earth',topPal:'earth'});
   svNoWalk(()=>{
    const trees=[[-1.65,-2.65],[1.65,-1.85],[.35,2.15]];
    for(const [tx,tz] of trees){
     W(tx,terY,tz,0,()=>{
      tube('cedar',t=>[Math.cos(t*TAU)*.12*t,t*1.85,Math.sin(t*TAU)*.12*t],t=>{const r=lerp(.20,.10,t);return[r,r];},8,6,0x5e342a);
      for(let b=0;b<4;b++){
       const a=b*TAU*.25+.3;
       beam('cedar',[0,1.65,0],[Math.cos(a)*1.25,2.65,Math.sin(a)*1.25],.08,0x5e342a);
       sph('thatch',Math.cos(a)*1.25,2.78,Math.sin(a)*1.25,.82,0x688642,.72,10);
       sph('ashlar',Math.cos(a)*1.15,3.05,Math.sin(a)*1.15,.44,0xf8dce4,.65,8);
      }
     });
    }
   });
  });
  svStair(-1.05,3.65,lowY,terY,PI*.5,{w:1.35,run:1.45,style:'solid',mk:'basalt',col:P('basalt')});

  smWalkTarget('approach',-3.85,0,5.25,{outside:true});
  smWalkTarget('press-shed',-3.85,lowY,.55,{});
  smWalkTarget('orchard-bench',1.85,terY,3.45,{});
 }
});

/* 3. sm_terrace_farm: stepped dry-stone basalt bench plots of dustmillet/frostoat, circular threshing floor & seed house */
defBuilding({
 key:'sm_terrace_farm',
 name:'Dry-stone millet terrace farm and threshing floor',
 seed:8443,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.0,
 w:15.6,
 d:13.6,
 h:7.2,
 tags:{types:['farm'],wealth:'poor',style:SM_STYLES.hearth,job:'farming',role:'farm',lit:true},
 build(){
  smBindRec(DEFS.sm_terrace_farm);
  const lowY=.34,wallH=3.05,roofY=lowY+wallH;
  smPlinth(13.8,11.4,lowY,{ablaqQuoins:false,topMk:'earth',topPal:'earth'});

  /* Seed & ploughshare stone storehouse on -x/+z */
  W(-4.15,0,1.65,0,()=>{
   smHollowAblaq(4.6,5.8,lowY,wallH,{
    t:.44,
    mode:'basalt',
    front:[{x:0,y:lowY,w:1.34,h:2.22,kind:'door'}],
    back:[{x:0,y:lowY+1.10,w:.74,h:1.10,kind:'window',glassKind:'smoked'}],
    left:[{x:0,y:lowY+1.10,w:.74,h:1.10,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:lowY+1.10,w:.74,h:1.10,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,lowY,2.90,0,1.24,2.15,{mk:'timber',col:0x523928,style:'plank',name:'seed-house-door'});
   smParapet(4.8,6.0,roofY,{});
   FURNISH('generic_sack',-1.15,lowY+.02,-1.65,0);
   FURNISH('generic_veg_basket',1.15,lowY+.02,-1.65,0);
  });

  /* Circular flagstone threshing floor on +x/+z + two rear stepped dry-stone grain benches */
  svNoWalk(()=>{
   cyl('paving',2.65,lowY+.02,2.25,2.65,.12,P('paving'),20,2.65,false);
   ring('rubble',2.65,lowY+.16,2.25,2.65,.16,P('rubble'),0,PI*.5,0,20);
   cone('thatch',3.85,lowY+.14,1.25,.85,1.45,P('thatch'),10);
   /* Rear stepped grain benches */
   for(let b=0;b<2;b++){
    const by=lowY+.38+b*.42,bz=-2.15-b*2.15;
    box('rubble',.95,lowY,bz,10.8,by-lowY,1.95,P('rubble'));
    box('earth',.95,by,bz,10.4,.08,1.65,P('earth'));
    for(let row=-4;row<=4;row++){
     box('thatch',.95+row*1.08,by+.08,bz,.26,.52,1.45,P('thatch'));
    }
   }
  });

  smWalkTarget('approach',-4.15,0,6.15,{outside:true});
  smWalkTarget('seed-house',-4.15,lowY,1.65,{});
  smWalkTarget('threshing-floor',1.85,lowY,2.25,{});
 }
});

/* 4. sm_fungus_cellar: half-buried earth-and-basalt barrel-vaulted dark cellar for alecap & pale fungi */
defBuilding({
 key:'sm_fungus_cellar',
 name:'Barrel-vaulted dark fungus cellar',
 seed:8444,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.0,
 w:11.6,
 d:11.8,
 h:6.8,
 tags:{types:['farm'],wealth:'poor',style:SM_STYLES.hearth,job:'fungiculture',role:'farm',lit:true},
 build(){
  smBindRec(DEFS.sm_fungus_cellar);
  const plinthY=.34,wallH=2.85;
  W(0,0,-.35,0,()=>{
   smPlinth(9.8,9.4,plinthY,{batter:.55,ablaqQuoins:false,topMk:'paving',topPal:'paving'});
   /* Thick windowless dark-grown basalt walls + earth-mounded barrel vault + stone air vents */
   smHollowAblaq(8.6,8.2,plinthY,wallH,{
    t:.54,
    mode:'basalt',
    front:[{x:0,y:plinthY,w:1.38,h:2.24,kind:'door'}],
    back:[],
    left:[],
    right:[]
   });
   smHumanDoor(0,plinthY,4.10,0,1.28,2.16,{mk:'tarred',col:0x2c2623,style:'banded',name:'cellar-door'});

   svNoWalk(()=>{
    /* Earth-bermed barrel vault roof with stone moisture-chimney cowls */
    psurf('rubble',(u,v)=>{
     const ang=u*PI;
     return [-Math.cos(ang)*4.45,plinthY+wallH+Math.sin(ang)*1.75,lerp(-4.2,4.2,v)];
    },12,4,P('rubble'),{flip:true});
    psurf('earth',(u,v)=>{
     const ang=.08+u*(PI-.16);
     return [-Math.cos(ang)*4.52,plinthY+wallH+.06+Math.sin(ang)*1.82,lerp(-4.0,4.0,v)];
    },10,4,P('earth'),{flip:true});
    /* Front basalt headwall framing the barrel vault */
    W(0,plinthY+wallH,4.05,0,()=>smAblaqArch(8.6,1.85,.48,{openW:1.2,springY:.05,voussoirs:13}));
    for(const vz of [-2.0,2.0]){
     cyl('basalt',0,plinthY+wallH+1.55,vz,.28,.75,P('basaltDark'),8,.24,false);
     cone('slate',0,plinthY+wallH+2.30,vz,.38,.28,P('slate'),8);
    }
   });
   FURNISH('generic_mushrooms',-2.45,plinthY+.02,-2.15,0);
   FURNISH('generic_mushrooms',2.45,plinthY+.02,-2.15,0);
   FURNISH('generic_barrel',-2.45,plinthY+.02,1.85,0);
   FURNISH('generic_floor_basket',2.45,plinthY+.02,1.85,0);
  });

  smWalkTarget('approach',0,0,5.35,{outside:true});
  smWalkTarget('spore-aisle',0,plinthY,-.35,{});
 }
});

/* 5. sm_stock_fold: walled basalt pack-mule/sheep/goat corral, winter byre & highland cheese dairy */
defBuilding({
 key:'sm_stock_fold',
 name:'Highland pack-mule and sheep stock-fold',
 seed:8445,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.2,
 w:14.6,
 d:13.2,
 h:7.6,
 tags:{types:['farm'],wealth:'poor',style:SM_STYLES.hearth,job:'dairy',role:'farm',lit:true},
 build(){
  smBindRec(DEFS.sm_stock_fold);
  const plinthY=.36,wallH=3.25,roofY=plinthY+wallH;
  smPlinth(12.8,11.0,plinthY,{ablaqQuoins:false,topMk:'earth',topPal:'earth'});

  /* Rear (-z) roofed winter byre & highland sheep-cheese dairy room */
  W(0,0,-2.35,0,()=>{
   smHollowAblaq(12.2,5.4,plinthY,wallH,{
    t:.48,
    mode:'basalt',
    front:[
     {x:-2.85,y:plinthY,w:1.42,h:2.30,kind:'door'},
     {x:2.65,y:plinthY,w:2.05,h:2.35,kind:'arch'}
    ],
    back:[
     {x:-3.1,y:plinthY+1.25,w:.82,h:1.10,kind:'window',glassKind:'smoked'},
     {x:3.1,y:plinthY+1.25,w:.82,h:1.10,kind:'window',glassKind:'smoked'}
    ],
    left:[{x:0,y:plinthY+1.25,w:.85,h:1.15,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.25,w:.85,h:1.15,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-2.85,plinthY,2.70,0,1.32,2.22,{mk:'cedar',style:'plank',front:false,name:'dairy-byre-door'});
   smParapet(12.4,5.6,roofY,{});
   smChimney(-4.35,roofY,-1.25,1.85,{r:.32,smokeScale:.24});
   FURNISH('generic_churn',-4.25,plinthY+.02,-.85,0);
   FURNISH('generic_cheese',-3.35,plinthY+.02,-1.65,0);
   FURNISH('generic_dairy',-2.15,plinthY+.02,-1.65,0);
  });

  /* Front (+z) walled basalt corral with wide timber corral gate, hayrick & stone snowmelt trough */
  W(0,plinthY,2.85,0,()=>{
   box('rubble',-3.95,0,2.25,4.5,1.45,.38,P('rubble'));
   box('rubble',3.95,0,2.25,4.5,1.45,.38,P('rubble'));
   box('rubble',-6.02,0,-.15,.38,1.45,5.1,P('rubble'));
   box('rubble',6.02,0,-.15,.38,1.45,5.1,P('rubble'));
   svDoorway(0,0,2.25,0,1.95,2.15,{
    hollow:true,locked:false,split:true,mk:'timber',col:0x523928,style:'plank',ajar:.85,name:'corral-gate'
   });
   door(0,0,2.28,0,1.95,2.15);
   svNoWalk(()=>{
    box('basalt',3.65,0,.35,2.6,.58,.85,P('basaltDark'));
    box('paving',3.65,.48,.35,2.3,.06,.58,P('glass'));
    cone('thatch',-3.85,0,.45,1.05,1.75,P('thatch'),12);
   });
  });

  smWalkTarget('approach',0,0,6.05,{outside:true});
  smWalkTarget('corral',0,plinthY,2.15,{});
  smWalkTarget('dairy-byre',-2.85,plinthY,-2.35,{});
 }
});
