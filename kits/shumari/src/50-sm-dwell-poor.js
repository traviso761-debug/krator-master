/* prefix: sm */
// ================================================================= SHUMARI POOR & UPLAND DWELLINGS (Phase SM3)
// Cadet-Probationer (-ko), Free Giant candidate (Gedu-ko), Hearth herder (-ra), and foreign caravanner (-no) dwellings.

/* 1. sm_cadet_cell: austere dark-basalt rubble probationer cell with slit lancets and thermal-mass basalt stove chimney */
defBuilding({
 key:'sm_cadet_cell',
 name:'Cadet probationer cell',
 seed:8201,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.cadet,
 vaultH:3.0,
 w:7.4,
 d:8.6,
 h:6.2,
 tags:{types:['dwelling-single'],wealth:'poor',style:SM_STYLES.cadet,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_cadet_cell);
  const plinthY=.42,wallH=3.05,roofY=plinthY+wallH;
  W(0,0,-.4,0,()=>{
   smPlinth(5.8,6.2,plinthY,{ablaqQuoins:false});
   smHollowAblaq(5.4,5.8,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.38,h:2.20,kind:'door'},
     {x:1.68,y:plinthY+1.15,w:.52,h:1.18,kind:'window',glassKind:'smoked',bars:true,jali:false}
    ],
    back:[{x:-1.3,y:plinthY+1.25,w:.48,h:1.08,kind:'window',glassKind:'smoked',bars:true,jali:false}],
    left:[{x:0,y:plinthY+1.20,w:.52,h:1.12,kind:'window',glassKind:'smoked',bars:true,jali:false}],
    right:[{x:0,y:plinthY+1.20,w:.52,h:1.12,kind:'window',glassKind:'smoked',bars:true,jali:false}]
   });
   smHumanDoor(0,plinthY,2.90,0,1.24,2.15,{mk:'timber',col:0x4a3323,style:'plank',name:'cadet-door'});
   /* Plain lime-pargeted basalt parapet without rich merlons */
   svWell('paving',0,roofY-.24,0,5.5,.24,5.9,P('paving'),null,{walk:false});
   svNoWalk(()=>{
    box('basalt',0,roofY,.0,5.6,.34,6.0,P('basaltDark'));
    box('travertine',0,roofY-.02,0,5.1,.28,5.5,P('travShade'));
    /* Austere Cadet sleeping suffa bench and blade peg inside */
    box('basalt',-1.55,plinthY+.02,-1.65,1.65,.46,1.85,P('basaltDark'));
    box('kilim',-1.55,plinthY+.48,-1.65,1.55,.06,1.75,P('kilim'));
   });
   smChimney(1.65,roofY,-1.75,1.85,{r:.30,smokeScale:.5});
   FURNISH('generic_poor_straw_bed',-1.55,plinthY+.02,-1.65,0);
   FURNISH('generic_water',1.65,plinthY+.02,-1.85,0);
  });
  svStair(0,3.62,0,plinthY,PI,{w:1.5,run:.92,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',0,0,4.05,{outside:true});
  smWalkTarget('cell',0,plinthY,-.4,{});
 }
});

/* 2. sm_giant_cadet_cell: high-vaulted dark-basalt initiation cell for Gedu-ko Free Giant candidates (4.4 m door, 5.4 m vault) */
defBuilding({
 key:'sm_giant_cadet_cell',
 name:'Giant cadet cell',
 seed:8202,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.cadet,
 vaultH:5.4,
 w:9.8,
 d:12.0,
 h:9.4,
 tags:{types:['dwelling-single'],wealth:'poor',style:SM_STYLES.cadet,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_giant_cadet_cell);
  const plinthY=.76,wallH=5.45,roofY=plinthY+wallH;
  W(0,0,-.6,0,()=>{
   smPlinth(8.0,8.6,plinthY,{ablaqQuoins:false});
   smHollowAblaq(7.4,8.0,plinthY,wallH,{
    t:.52,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:2.55,h:4.55,kind:'door'},
     {x:-2.35,y:plinthY+2.45,w:.68,h:1.75,kind:'window',glassKind:'lit',bars:true,jali:false},
     {x:2.35,y:plinthY+2.45,w:.68,h:1.75,kind:'window',glassKind:'lit',bars:true,jali:false}
    ],
    back:[{x:0,y:plinthY+2.65,w:.88,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false}],
    left:[{x:0,y:plinthY+2.45,w:.76,h:1.75,kind:'window',glassKind:'lit',bars:true,jali:false}],
    right:[{x:0,y:plinthY+2.45,w:.76,h:1.75,kind:'window',glassKind:'lit',bars:true,jali:false}]
   });
   smGiantPortal(0,plinthY,4.00,0,2.35,SM_GIANT_DOOR,{
    mk:'timber',
    col:0x4a3323,
    style:'banded',
    name:'giant-cadet-door'
   });
   smParapet(7.6,8.2,roofY,{});
   smChimney(-2.45,roofY,-2.55,2.05,{r:.36,smokeScale:.6});
   svNoWalk(()=>{
    /* Oversized stone Giant sleeping bench & ordeal training weight */
    box('basalt',-2.05,plinthY+.02,-1.65,2.15,.68,3.60,P('basaltDark'));
    box('kilim',-2.05,plinthY+.70,-1.65,2.00,.08,3.40,P('kilim'));
    cyl('basalt',2.15,plinthY+.02,-2.15,.42,.62,P('basalt'),10,.38,false);
    ring('iron',2.15,plinthY+.72,-2.15,.16,.035,P('iron'),0,PI*.5,0,10);
   });
   FURNISH('shumari_cadet_chest',2.25,plinthY+.02,1.95,-PI*.5);
   FURNISH('shumari_cadet_rack',2.25,plinthY+.02,.65,-PI*.5);
   FURNISH('shumari_millet_jar',-2.35,plinthY+.02,2.15,0);
   FURNISH('generic_rations',1.95,plinthY+.02,-1.05,0);
  });
  smCompoundStair(0,5.02,0,plinthY,PI,{w:2.6,going:.33});
  smWalkTarget('approach',0,0,5.45,{outside:true});
  smWalkTarget('cell-hall',0,plinthY,-.6,{});
 }
});

/* 3. sm_cliff_cot: two-level rubble-basalt cottage stepped onto a gorge-ledge plinth with slate/thatch lean-to */
defBuilding({
 key:'sm_cliff_cot',
 name:'Gorge-ledge cottage',
 seed:8203,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.cadet,
 vaultH:3.0,
 w:9.2,
 d:9.8,
 h:7.8,
 tags:{types:['dwelling-single'],wealth:'poor',style:SM_STYLES.cadet,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_cliff_cot);
  const lowY=.52,upY=1.68,wallH=3.05;
  /* Stepped gorge bench: lower fore-terrace (+x) & higher basalt ledge (-x) */
  W(1.85,0,0,0,()=>smPlinth(4.0,7.2,lowY,{ablaqQuoins:false}));
  W(-1.35,0,-.35,0,()=>smPlinth(4.8,7.4,upY,{ablaqQuoins:false}));
  svStair(1.85,4.55,0,lowY,PI,{w:1.4,run:.95,style:'solid',mk:'basalt',col:P('basalt')});
  svStair(.75,2.25,lowY,upY,-PI*.5,{w:1.25,run:1.65,style:'solid',mk:'basalt',col:P('basalt')});

  /* Main upper basalt cottage on the (-x) ledge */
  W(-1.35,0,-.45,0,()=>{
   smHollowAblaq(4.4,6.4,upY,wallH,{
    t:.44,
    mode:'basalt',
    front:[{x:.65,y:upY+1.05,w:.72,h:1.15,kind:'window',glassKind:'lit',bars:true}],
    right:[{x:-1.45,y:upY,w:1.34,h:2.22,kind:'door'}],
    back:[{x:0,y:upY+1.15,w:.68,h:1.10,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:upY+1.15,w:.68,h:1.10,kind:'window',glassKind:'lit',bars:true}]
   });
   smHumanDoor(2.20,upY,1.45,PI*.5,1.22,2.15,{mk:'cedar',style:'plank',name:'cot-door'});
   smParapet(4.5,6.5,upY+wallH,{});
   smChimney(-1.25,upY+wallH,-1.85,1.95,{r:.30,smokeScale:.24});
  });

  /* Lower slate-and-thatch lean-to fuel & goat-tack shed on (+x, -z) */
  W(1.95,lowY,-1.45,0,()=>{
   svNoWalk(()=>{
    for(const [px,pz] of [[-1.35,1.45],[1.35,1.45],[-1.35,-1.45],[1.35,-1.45]]){
     box('timber',px,0,pz,.16,2.25,.16,P('timber'));
    }
    box('rubble',0,0,-1.45,2.85,2.35,.32,P('rubble'));
    box('rubble',1.38,0,0,.30,2.15,2.90,P('rubble'));
    psurf('slate',(u,v)=>[lerp(-1.55,1.55,u),lerp(2.65,2.05,u),lerp(-1.65,1.65,v)],3,2,P('slate'));
    box('thatch',0,2.38,0,2.85,.12,3.10,P('thatch'));
   });
   FURNISH('generic_fuel',-.45,.02,-.65,0);
   FURNISH('generic_sack',.55,.02,-.65,PI*.25);
  });

  smWalkTarget('approach',1.85,0,4.95,{outside:true});
  smWalkTarget('lower-terrace',1.85,lowY,2.15,{});
  smWalkTarget('upper-cot',-1.35,upY,.85,{});
 }
});

/* 4. sm_herder_house: low thick-walled upland stone house + dry-stone winter sheepfold */
defBuilding({
 key:'sm_herder_house',
 name:'Upland herder house and fold',
 seed:8204,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.1,
 w:11.6,
 d:10.4,
 h:6.6,
 tags:{types:['dwelling-single','farm'],wealth:'poor',style:SM_STYLES.hearth,job:'herding',role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_herder_house);
  const plinthY=.38,wallH=3.15,roofY=plinthY+wallH;
  /* House on -x, sheltered dry-stone sheepfold on +x */
  W(-2.15,0,-.3,0,()=>{
   smPlinth(6.2,7.6,plinthY,{ablaqQuoins:true});
   smHollowAblaq(5.8,7.2,plinthY,wallH,{
    t:.48,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.38,h:2.25,kind:'door'},
     {x:-1.65,y:plinthY+1.05,w:.76,h:1.18,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:plinthY+1.15,w:.74,h:1.10,kind:'window',glassKind:'smoked'}],
    left:[{x:0,y:plinthY+1.15,w:.78,h:1.15,kind:'window',glassKind:'lit'}],
    right:[{x:-1.45,y:plinthY,w:1.26,h:2.15,kind:'door'}]
   });
   smHumanDoor(0,plinthY,3.60,0,1.28,2.20,{mk:'lacquer',col:0x9e2a2b,style:'plank',name:'herder-front'});
   smHumanDoor(2.90,plinthY,1.45,PI*.5,1.16,2.10,{mk:'timber',col:0x523928,front:false,name:'fold-pass'});
   smParapet(5.9,7.3,roofY,{});
   smChimney(-1.65,roofY,-2.05,2.05,{r:.34});
  });

  /* Windward dry-stone basalt sheepfold (+x) with low fodder shelter & hayrick */
  W(2.85,0,-.3,0,()=>{
   box('earth',0,0,0,4.4,.18,7.4,P('earth'));
   box('rubble',0,.18,-3.52,4.4,1.35,.36,P('rubble'));
   box('rubble',2.02,.18,0,.36,1.35,7.4,P('rubble'));
   box('rubble',-1.25,.18,3.52,1.9,1.35,.36,P('rubble'));
   box('rubble',1.55,.18,3.52,1.3,1.35,.36,P('rubble'));
   svDoorway(.25,.18,3.52,0,1.35,2.05,{
    hollow:true,locked:false,mk:'timber',col:0x523928,style:'plank',ajar:.65,name:'sheepfold-gate'
   });
   svNoWalk(()=>{
    /* Slatted winter fodder manger & water trough along north wall */
    box('timber',0,1.52,-2.35,4.2,.10,2.2,P('timber'));
    psurf('thatch',(u,v)=>[lerp(-2.15,2.15,u),lerp(2.25,1.62,v),lerp(-3.55,-1.15,v)],3,2,P('thatch'));
    box('basalt',-.85,.18,-2.75,1.8,.52,.64,P('basaltDark'));
    cone('thatch',.95,.18,-1.85,.78,1.35,P('thatch'),10);
   });
   FURNISH('generic_churn',-1.35,.18,.35,0);
   FURNISH('generic_dairy',-1.35,.18,-.65,0);
  });

  smWalkTarget('approach',-2.15,0,4.25,{outside:true});
  smWalkTarget('hearth-room',-2.15,plinthY,-.3,{});
  smWalkTarget('sheepfold',2.85,.18,1.15,{});
 }
});

/* 5. sm_outlander_lodging: plain two-storey basalt row-lodging for -no foreign caravanners with external stone stair */
defBuilding({
 key:'sm_outlander_lodging',
 name:'Outlander caravanner lodging',
 seed:8205,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.outlander,
 vaultH:3.2,
 w:11.8,
 d:10.6,
 h:9.4,
 tags:{types:['dwelling-multi','inn'],wealth:'poor',style:SM_STYLES.hearth,role:'dwelling',lit:true},
 build(){
  smBindRec(DEFS.sm_outlander_lodging);
  const plinthY=.46,gH=3.25,uY=plinthY+gH,uH=3.05,roofY=uY+uH;
  W(-.65,0,-.45,0,()=>{
   smPlinth(9.2,7.8,plinthY,{ablaqQuoins:true});
   /* Ground floor: pack-gear & caravanner common room */
   smHollowAblaq(8.6,7.0,plinthY,gH,{
    t:.48,
    mode:'basalt',
    front:[
     {x:-1.65,y:plinthY,w:1.42,h:2.28,kind:'door'},
     {x:1.55,y:plinthY,w:1.38,h:2.22,kind:'door'},
     {x:0,y:plinthY+1.10,w:.86,h:1.25,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-2.1,y:plinthY+1.15,w:.78,h:1.18,kind:'window',glassKind:'smoked'},
     {x:2.1,y:plinthY+1.15,w:.78,h:1.18,kind:'window',glassKind:'smoked'}
    ],
    left:[{x:0,y:plinthY+1.15,w:.82,h:1.20,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.15,w:.82,h:1.20,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-1.65,plinthY,3.50,0,1.32,2.24,{mk:'cedar',style:'banded',name:'lodging-main'});
   smHumanDoor(1.55,plinthY,3.50,0,1.28,2.18,{mk:'timber',style:'plank',front:false,name:'lodging-pack'});

   /* Walkable upper floor slab + external projecting cedar gallery along +z */
   box('paving',0,uY-.22,.75,8.6,.22,8.3,P('paving'));
   smHollowAblaq(8.6,6.4,uY,uH,{
    t:.44,
    mode:'basalt',
    floor:false,
    front:[
     {x:-1.85,y:uY,w:1.30,h:2.18,kind:'door'},
     {x:1.85,y:uY,w:1.30,h:2.18,kind:'door'},
     {x:0,y:uY+1.05,w:.88,h:1.18,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-2.1,y:uY+1.05,w:.78,h:1.12,kind:'window',glassKind:'lit'},
     {x:2.1,y:uY+1.05,w:.78,h:1.12,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:uY+1.05,w:.78,h:1.15,kind:'window',glassKind:'smoked'}],
    right:[{x:0,y:uY+1.05,w:.78,h:1.15,kind:'window',glassKind:'smoked'}]
   });
   smHumanDoor(-1.85,uY,2.90,0,1.20,2.12,{mk:'cedar',style:'plank',front:false,name:'upper-west'});
   smHumanDoor(1.85,uY,2.90,0,1.20,2.12,{mk:'cedar',style:'plank',front:false,name:'upper-east'});

   /* Cedar gallery posts & balustrade on +z */
   svNoWalk(()=>{
    for(const gx of [-3.95,-1.35,1.35,3.95]){
     box('cedar',gx,uY,4.72,.14,uH,.14,P('cedar'));
     beam('cedar',[gx,uY-.55,3.2],[gx,uY-.08,4.68],.10,P('cedar'));
    }
    box('cedar',0,uY+.92,4.72,8.1,.09,.09,P('cedar'));
    box('jali',0,uY+.08,4.72,7.9,.80,.03,P('travertine'));
    psurf('slate',(u,v)=>[lerp(-4.4,4.4,u),lerp(roofY+.05,roofY-.38,v),lerp(3.1,4.95,v)],4,2,P('slate'));
   });
   smParapet(8.7,6.5,roofY,{});
   smChimney(-2.85,roofY,-1.95,1.95,{r:.34});
  });

  /* External stone flight on +x climbing from ground to upper gallery landing */
  box('paving',4.35,0,2.15,1.5,.22,2.2,P('paving'));
  svStair(4.35,-1.65,.22,uY,0,{w:1.25,run:4.95,style:'solid',mk:'basalt',col:P('basalt'),rail:'right',smk:'cedar',scol:P('cedar')});
  svLanding(4.35,3.85,uY,1.65,1.35,{mk:'paving',col:P('paving')});

  FURNISH('generic_crate',3.25,plinthY+.02,3.45,0);
  FURNISH('generic_sack',-4.35,plinthY+.02,3.35,PI*.25);
  smWalkTarget('approach',-2.30,0,4.35,{outside:true});
  smWalkTarget('common-room',-2.30,plinthY,-.45,{});
  smWalkTarget('upper-gallery',-.65,uY,3.65,{});
 }
});
