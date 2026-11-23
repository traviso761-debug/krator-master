/* prefix: sm */
// ================================================================= SHUMARI STEPPED GORGE-RIM STREET ENSEMBLE (Phase SM3)
// sm_gorge_street: Mamluk Cairo-on-the-gorge street canyon combining battered ishigaki plinths, dual-tread street steps,
// a street-corner bronze-grilled sabil, a projecting crimson mashrabiya Hearth house-front, and a Giant pishtaq + spiral qubba.

defBuilding({
 key:'sm_gorge_street',
 name:'Stepped gorge-rim street ensemble',
 seed:8256,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.2,
 w:22.4,
 d:19.6,
 h:19.8,
 tags:{types:['infrastructure','civic'],wealth:'rich',style:SM_STYLES.sword,role:'street',lit:true},
 build(){
  smBindRec(DEFS.sm_gorge_street);
  const lowStreetY=.68,upStreetY=1.48;

  /* 1. Stepped basalt flagstone street lane down the middle (x in [-2.6..2.6]), climbing from +z toward -z */
  W(0,0,3.85,0,()=>smPlinth(5.6,6.8,lowStreetY,{ablaqQuoins:false,topMk:'cobble',topPal:'cobble'}));
  W(0,0,-3.25,0,()=>smPlinth(5.6,7.6,upStreetY,{ablaqQuoins:false,topMk:'cobble',topPal:'cobble'}));
  smCompoundStair(0,8.57,0,lowStreetY,PI,{w:3.4,going:.33});
  smCompoundStair(0,1.77,lowStreetY,upStreetY,PI,{w:3.4,going:.33});

  /* Overhead Mamluk timber-and-stone sabat street arch bridging the stepped canyon lane */
  svNoWalk(()=>{
   W(0,upStreetY+4.75,-1.85,0,()=>{
    smAblaqArch(5.6,1.65,1.85,{openW:4.65,springY:.12,voussoirs:15});
    box('frieze_kattu',0,1.65,0,5.6,.32,1.92,0xffffff);
    for(let i=-3;i<=3;i++)smShurafatMerlon(i*.78,1.97,.82,0,.78);
   });
   /* Hanging street bronze lantern under the sabat arch */
   cord('bronze',[[0,upStreetY+5.25,-1.85],[0,upStreetY+3.95,-1.85]],.016,P('bronze'));
   cyl('bronzeCast',0,upStreetY+3.72,-1.85,.18,.22,P('bronze'),10,.12,false);
   sph('glow',0,upStreetY+3.82,-1.85,.09,P('flame'),1.2,10);
  });
  haloAt(0,upStreetY+3.82,-1.85,0xffb454,true);

  /* 2. West (-x) Hearth-Commons house front + street-corner cast-bronze sabil fountain */
  const westY=lowStreetY,westG=3.55,westU=westY+westG,westUH=3.35,westRoof=westU+westUH;
  W(-6.65,0,.35,0,()=>{
   smPlinth(7.6,13.6,westY,{ablaqQuoins:true});
   smHollowAblaq(7.0,12.8,westY,westG,{
    t:.48,
    mode:'basalt',
    right:[
     {x:1.65,y:westY,w:1.42,h:2.32,kind:'door'},
     {x:-2.45,y:westY+1.05,w:1.15,h:1.45,kind:'window',glassKind:'lit',bars:true}
    ],
    front:[{x:.65,y:westY+.85,w:2.25,h:2.45,kind:'window',glassKind:'smoked',jali:false}],
    back:[{x:0,y:westY+1.15,w:1.05,h:1.45,kind:'window',glassKind:'lit'}],
    left:[
     {x:-2.8,y:westY+1.15,w:1.05,h:1.45,kind:'window',glassKind:'lit'},
     {x:2.8,y:westY+1.15,w:1.05,h:1.45,kind:'window',glassKind:'lit'}
    ]
   });
   /* Street-corner bronze sabil fountain on the +z/+x chamfer corner of the west block */
   smSabilGrille(.65,westY,6.42,0,2.15,2.45);
   smHumanDoor(3.50,westY,-1.65,PI*.5,1.30,SM_HUMAN_DOOR,{
    mk:'lacquer',col:0xa83031,style:'banded',front:false,name:'street-hearth-door'
   });

   /* Upper crimson-lacquer mashrabiya gallery cantilevered out over the stepped street */
   svNoWalk(()=>box('paving',0,westU-.18,0,6.8,.18,12.6,P('paving')));
   smHollowAblaq(7.0,12.8,westU,westUH,{
    t:.46,
    floor:false,
    right:[
     {x:2.15,y:westU+.75,w:2.85,h:1.95,kind:'window',glassKind:'lit',jali:false},
     {x:-2.85,y:westU+.95,w:1.15,h:1.55,kind:'window',glassKind:'lit'}
    ],
    front:[{x:0,y:westU+.85,w:2.45,h:1.85,kind:'window',glassKind:'lit',jali:false}],
    back:[{x:0,y:westU+1.05,w:1.12,h:1.45,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:westU+1.05,w:1.12,h:1.45,kind:'window',glassKind:'lit'}]
   });
   smLacquerBay(3.50,westU+.35,-2.15,3.85,2.50,.96,{ry:PI*.5,glassKind:'lit',solid:true});
   smLacquerBay(0,westU+.35,6.40,3.25,2.45,.88,{ry:0,glassKind:'lit',solid:true});
   smParapet(7.2,13.0,westRoof,{});
   smChimney(-1.95,westRoof,-4.25,2.20,{r:.36});
  });

  /* 3. East (+x) monumental Sword-caste qubba & soaring 4.4 m Giant pishtaq fronting the upper street */
  const eastY=upStreetY,eastH=6.05,eastRoof=eastY+eastH;
  W(6.85,0,-1.15,0,()=>{
   smPlinth(8.4,13.8,eastY,{ablaqQuoins:true});
   smHollowAblaq(7.8,12.6,eastY,eastH,{
    t:.50,
    left:[
     {x:-1.85,y:eastY,w:2.65,h:4.65,kind:'door'},
     {x:3.15,y:eastY+1.55,w:1.25,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    front:[
     {x:-1.65,y:eastY+1.55,w:1.22,h:2.35,kind:'window',glassKind:'lit',bars:true},
     {x:1.65,y:eastY+1.55,w:1.22,h:2.35,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[{x:0,y:eastY+1.65,w:1.35,h:2.35,kind:'window',glassKind:'lit',bars:true}],
    right:[
     {x:-2.85,y:eastY+1.65,w:1.22,h:2.35,kind:'window',glassKind:'lit'},
     {x:2.85,y:eastY+1.65,w:1.22,h:2.35,kind:'window',glassKind:'lit'}
    ]
   });
   /* Soaring Giant pishtaq facing -x into the street canyon */
   smPishtaq(-3.90,eastY,-1.85,{
    ry:-PI*.5,
    w:5.4,
    h:8.8,
    d:1.18,
    doorW:2.42,
    doorH:SM_GIANT_DOOR,
    giant:true,
    hollow:true,
    socketKind:'banner',
    doorName:'street-qubba-pishtaq'
   });
   smParapet(8.0,12.8,eastRoof,{hole:{x0:-2.45,x1:2.45,z0:-2.45,z1:2.45}});
   const drum=smDrum(0,eastRoof,0,7.2,{domeD:6.0,transH:1.90,clerH:1.40,hollow:true,windows:12});
   smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:4.92,ribs:22,turns:.45,hollow:true});

   /* Interior offerings & regimental fittings inside the street qubba */
   svNoWalk(()=>medallion('kilim',0,eastY+.03,0,3.8,{ry:0}));
   FURNISH('generic_strongbox',2.45,eastY+.02,-4.65,-PI*.5);
   FURNISH('generic_chest',2.45,eastY+.02,4.45,-PI*.5);
   FURNISH('generic_storage_jar',-2.35,eastY+.02,4.55,PI*.25);
   FURNISH('generic_storage_jar',-2.35,eastY+.02,-4.65,0);
   FURNISH('generic_candle_supply',2.35,eastY+.02,0,-PI*.5);
   FURNISH('generic_lamp_oil',2.35,eastY+.02,-1.65,-PI*.5);
  });

  smWalkTarget('street-foot',0,0,9.05,{outside:true});
  smWalkTarget('lower-lane',0,lowStreetY,3.85,{});
  smWalkTarget('upper-lane',0,upStreetY,-2.85,{});
  smWalkTarget('street-qubba',6.85,eastY,-1.15,{});
  smWalkTarget('hearth-room',-6.65,westY,1.95,{});
 }
});
