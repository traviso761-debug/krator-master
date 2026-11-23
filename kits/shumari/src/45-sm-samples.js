/* prefix: sm */
// ================================================================= SHUMARI TOOLKIT SAMPLES (Phase SM2)
// sm_sample_pishtaq (Giant-clearance 4.4 m portal + compound stair) and sm_sample_hearth_bay (human-scale 2.25 m door + lacquer bay).

defBuilding({
 key:'sm_sample_pishtaq',
 name:'Sample Giant pishtaq',
 seed:8141,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:11.6,
 d:11.6,
 h:10.6,
 tags:{types:['civic'],wealth:'rich',style:SM_STYLES.sword,role:'sample',lit:true},
 build(){
  smBindRec(DEFS.sm_sample_pishtaq);
  const plinthY=1.00;
  const wallH=5.60;
  const roofY=plinthY+wallH;

  W(0,0,-.7,0,()=>smPlinth(10.2,7.4,plinthY,{ablaqQuoins:true}));
  smCompoundStair(0,5.04,0,plinthY,PI,{w:2.65,going:.34});

  W(0,0,-1.3,0,()=>{
   smHollowAblaq(9.4,5.8,plinthY,wallH,{
    t:.48,
    front:[{x:0,y:plinthY,w:2.60,h:4.60,kind:'door'}],
    back:[{x:0,y:plinthY+1.55,w:1.55,h:2.35,kind:'window',glassKind:'lit',bars:true}],
    left:[{x:0,y:plinthY+1.55,w:1.35,h:2.25,kind:'window',glassKind:'lit',bars:true}],
    right:[{x:0,y:plinthY+1.55,w:1.35,h:2.25,kind:'window',glassKind:'lit',bars:true}]
   });
   smParapet(9.6,6.0,roofY,{skipFrontW:5.7});
   smPishtaq(0,plinthY,2.90,{
    w:5.6,
    h:8.2,
    d:1.25,
    doorW:2.40,
    doorH:SM_GIANT_DOOR,
    giant:true,
    hollow:true,
    socketKind:'shield',
    doorName:'sample-giant-pishtaq'
   });

   /* Interior vestibule wall sconces & catalog chests */
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     cyl('bronzeCast',sx*3.2,plinthY+2.6,-2.2,.14,.24,P('bronze'),10,.08,false);
     sph('glow',sx*3.2,plinthY+2.88,-2.2,.08,P('flame'),1.2,10);
     haloAt(sx*3.2,plinthY+2.88,-2.2,0xffb060,false);
    }
   });
   FURNISH('generic_strongbox',-3.1,plinthY+.02,-1.8,0);
   FURNISH('generic_chest',3.1,plinthY+.02,-1.8,0);
   FURNISH('generic_storage_jar',-3.2,plinthY+.02,1.4,PI*.5);
   FURNISH('generic_lamp_oil',3.2,plinthY+.02,1.4,-PI*.5);
  });

  smWalkTarget('approach',0,0,5.45,{outside:true});
  smWalkTarget('vestibule',0,plinthY,-1.3,{});
 }
});

defBuilding({
 key:'sm_sample_hearth_bay',
 name:'Sample Hearth mashrabiya bay',
 seed:8142,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:9.8,
 d:9.8,
 h:8.6,
 tags:{types:['dwelling-single'],wealth:'middle',style:SM_STYLES.hearth,role:'sample',lit:true},
 build(){
  smBindRec(DEFS.sm_sample_hearth_bay);
  const plinthY=.60;
  const wallH=6.60;
  const roofY=plinthY+wallH;

  /* Dressed basalt plinth + standard human-scale stone entry steps */
  W(0,0,-.4,0,()=>smPlinth(8.6,7.2,plinthY,{ablaqQuoins:false}));
  svStair(0,4.16,0,plinthY,PI,{w:1.55,style:'solid',mk:'basalt',col:P('basalt'),riser:.16,run:.96});

  W(0,0,-.7,0,()=>{
   /* Hearth-Commons (-ra) basalt ashlar walls with warm travertine trim and human-scale 2.25 m doorway */
   smHollowAblaq(8.0,6.2,plinthY,wallH,{
    t:.44,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:1.45,h:2.42,kind:'door'},
     {x:-2.35,y:plinthY+1.05,w:1.05,h:1.45,kind:'window',glassKind:'lit',bars:true},
     {x:2.35,y:plinthY+1.05,w:1.05,h:1.45,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-1.8,y:plinthY+1.10,w:1.10,h:1.50,kind:'window',glassKind:'lit'},
     {x:1.8,y:plinthY+1.10,w:1.10,h:1.50,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.10,w:1.15,h:1.50,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.10,w:1.15,h:1.50,kind:'window',glassKind:'lit'}]
   });

   /* Carved ablaq lintel & arch hood framing the human-scale 2.25 m crimson-lacquered entrance door */
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     box('travertine',sx*.82,plinthY,3.10,.22,2.45,.28,P('travertine'));
    }
    W(0,plinthY+2.36,3.10,0,()=>smAblaqArch(2.05,.88,.30,{openW:1.30,springY:.08,voussoirs:9}));
    /* Travertine stringcourse belt between ground and winter gallery storey */
    box('travertine',0,plinthY+3.42,0,8.16,.16,6.36,P('travertine'));
   });

   svDoorway(0,plinthY,3.02,0,1.28,SM_HUMAN_DOOR,{
    hollow:true,
    locked:false,
    split:false,
    mk:'lacquer',
    col:0xa82e30,
    style:'panel',
    hwCol:0x9a7432,
    name:'hearth-human-door'
   });
   door(0,plinthY,3.06,0,1.28,SM_HUMAN_DOOR);

   /* Projecting upper-storey crimson-lacquered mashrabiya winter bay */
   smLacquerBay(0,plinthY+3.58,3.10,3.85,2.58,.92,{glassKind:'lit',solid:true});
   haloAt(0,plinthY+4.75,3.55,0xffb85c,false);

   /* Ground-storey interior timber ceiling soffit (vaultH = 3.4 m) & flat shurafat roof */
   svNoWalk(()=>box('cedar',0,plinthY+3.36,0,7.2,.08,5.4,P('cedar')));
   smParapet(8.2,6.4,roofY,{});

   /* Hearth-Commons ground room catalog furnishings */
   FURNISH('generic_chest',-2.6,plinthY+.02,-1.8,0);
   FURNISH('generic_bread_basket',2.5,plinthY+.02,-1.8,0);
   FURNISH('generic_tea_set',2.5,plinthY+.02,-.8,0);
   FURNISH('generic_storage_jar',-2.6,plinthY+.02,1.2,PI*.5);
  });

  smWalkTarget('approach',0,0,4.55,{outside:true});
  smWalkTarget('hearth-room',0,plinthY,-.7,{});
 }
});
