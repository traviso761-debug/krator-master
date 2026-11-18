/* prefix: sm */
// ================================================================= SHUMARI TOWN TRADES, DISTILLERY & LAKE JETTY (Phase SM4)
// Hearth-Commons (-ra) food, cloth, leather, bazaar, spirits still (Sunu-sikaru), and Siru-Yamu lake jetty (BUILD-OUT.md 4a).

/* 1. sm_bakery: domed basalt flatbread tannur oven house with warm bread counter */
defBuilding({
 key:'sm_bakery',
 name:'Domed basalt tannur bakery',
 seed:8421,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:10.8,
 d:10.8,
 h:8.8,
 tags:{types:['shop','industry'],wealth:'middle',style:SM_STYLES.hearth,job:'baking',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_bakery);
  const plinthY=.46,wallH=3.45,roofY=plinthY+wallH;
  W(0,0,-.45,0,()=>{
   smPlinth(8.8,8.4,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.2,7.8,plinthY,wallH,{
    t:.48,
    front:[
     {x:-1.55,y:plinthY,w:1.42,h:2.32,kind:'door'},
     {x:1.65,y:plinthY+.90,w:2.05,h:1.55,kind:'arch'}
    ],
    back:[{x:0,y:plinthY+1.20,w:1.05,h:1.35,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:plinthY+1.20,w:1.05,h:1.35,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.20,w:1.05,h:1.35,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(-1.55,plinthY,3.90,0,1.32,SM_HUMAN_DOOR,{mk:'cedar',style:'banded',name:'bakery-door'});
   svPane(1.65,plinthY+.95,3.82,0,1.85,1.40,{kind:'lit',solid:false});
   smParapet(8.4,8.0,roofY,{});
   smChimney(2.15,roofY,-2.25,2.65,{r:.42,smokeScale:.38});

   /* Beehive clay-and-basalt tannur dome oven inside + warm travertine bread counter outside */
   svNoWalk(()=>{
    cyl('rubble',2.15,plinthY+.02,-2.25,1.25,1.35,P('travShade'),14,.65,false);
    box('glow',2.15,plinthY+.35,-1.02,.48,.38,.08,P('ember'));
    box('travertine',1.65,plinthY+.02,4.15,2.25,.92,.56,P('travertine'));
   });
   haloAt(2.15,plinthY+.55,-.95,0xff8e36,false);
   FURNISH('generic_bread_basket',1.35,plinthY+.94,4.15,0);
   FURNISH('generic_bread',2.05,plinthY+.94,4.15,0);
   FURNISH('generic_sack',-2.65,plinthY+.02,-2.45,0);
  });

  svStair(-1.55,4.65,0,plinthY,PI,{w:1.8,run:.90,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-1.55,0,5.05,{outside:true});
  smWalkTarget('oven-room',-1.25,plinthY,-.45,{});
 }
});

/* 2. sm_butcher: cold-stone carcass hall + upper slatted crimson timber wind-drying basturma jerky loft */
defBuilding({
 key:'sm_butcher',
 name:'Cold-stone butcher and jerky loft',
 seed:8422,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:10.6,
 d:10.8,
 h:10.2,
 tags:{types:['shop'],wealth:'middle',style:SM_STYLES.hearth,job:'butchery',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_butcher);
  const plinthY=.48,gH=3.45,loftY=plinthY+gH,loftH=2.45;
  W(0,0,-.45,0,()=>{
   smPlinth(8.6,8.4,plinthY,{ablaqQuoins:true});
   smHollowAblaq(8.0,7.8,plinthY,gH,{
    t:.50,
    mode:'basalt',
    front:[
     {x:-1.45,y:plinthY,w:1.42,h:2.32,kind:'door'},
     {x:1.65,y:plinthY+.92,w:1.95,h:1.50,kind:'arch'}
    ],
    back:[{x:0,y:plinthY+1.35,w:.88,h:1.20,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.35,w:.88,h:1.20,kind:'window',glassKind:'smoked',bars:true}],
    right:[{x:0,y:plinthY+1.35,w:.88,h:1.20,kind:'window',glassKind:'smoked',bars:true}]
   });
   smHumanDoor(-1.45,plinthY,3.90,0,1.32,SM_HUMAN_DOOR,{mk:'lacquer',col:0x9e2a2b,style:'banded',name:'butcher-door'});
   svPane(1.65,plinthY+.96,3.82,0,1.75,1.35,{kind:'lit',solid:false});

   /* Slatted crimson-lacquered wind-drying basturma & qawurma loft above the cold stone ground hall */
   svNoWalk(()=>{
    box('paving',0,loftY-.22,0,8.2,.22,8.0,P('paving'));
    for(const [px,pz] of [[-3.7,3.6],[0,3.6],[3.7,3.6],[-3.7,-3.6],[0,-3.6],[3.7,-3.6]]){
     box('lacquer',px,loftY,pz,.20,loftH,.20,P('lacquer'));
    }
    for(let l=0;l<6;l++){
     const ly=loftY+.28+l*.34;
     box('cedar',0,ly,3.62,7.6,.08,.06,P('cedar'));
     box('cedar',0,ly,-3.62,7.6,.08,.06,P('cedar'));
     box('cedar',3.72,ly,0,.06,.08,7.2,P('cedar'));
     box('cedar',-3.72,ly,0,.06,.08,7.2,P('cedar'));
    }
    psurf('slate',(u,v)=>[lerp(-4.2,4.2,u),loftY+loftH+(1-Math.abs(v-.5)*2)*.65,lerp(-4.1,4.1,v)],4,3,P('slate'),{up:true});
   });
   FURNISH('generic_cured_meat',1.65,plinthY+.02,2.45,0);
   FURNISH('generic_hanging_larder',2.45,plinthY+.02,-2.25,0);
   FURNISH('generic_barrel',-2.65,plinthY+.02,-2.45,0);
  });

  svStair(-1.45,4.65,0,plinthY,PI,{w:1.75,run:.90,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-1.45,0,5.05,{outside:true});
  smWalkTarget('cold-hall',-1.25,plinthY,-.45,{});
 }
});

/* 3. sm_weaver_dyer: wool kilim loom house + sunken outdoor stone dye vats & hanging crimson/gold kilim cloths */
defBuilding({
 key:'sm_weaver_dyer',
 name:'Kilim weaver and crimson dye-vats',
 seed:8423,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.4,
 w:13.8,
 d:13.0,
 h:8.6,
 tags:{types:['industry','shop'],wealth:'middle',style:SM_STYLES.hearth,job:'weaving',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_weaver_dyer);
  const plinthY=.42,wallH=3.45,roofY=plinthY+wallH;
  smPlinth(12.0,10.0,plinthY,{ablaqQuoins:true});

  /* West (-x) sunlit loom house */
  W(-2.75,0,-.45,0,()=>{
   smHollowAblaq(6.0,8.2,plinthY,wallH,{
    t:.46,
    front:[
     {x:0,y:plinthY,w:1.42,h:2.32,kind:'door'},
     {x:-1.75,y:plinthY+1.00,w:1.15,h:1.45,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:plinthY+1.05,w:1.35,h:1.45,kind:'window',glassKind:'lit'}],
    left:[{x:0,y:plinthY+1.05,w:1.35,h:1.45,kind:'window',glassKind:'lit'}],
    right:[{x:-1.65,y:plinthY,w:1.32,h:2.20,kind:'door'}]
   });
   smHumanDoor(0,plinthY,4.10,0,1.32,SM_HUMAN_DOOR,{mk:'lacquer',col:0xa83031,style:'banded',name:'weaver-door'});
   smHumanDoor(3.00,plinthY,1.65,PI*.5,1.22,2.14,{mk:'cedar',style:'plank',front:false,name:'dye-yard-door'});
   smParapet(6.2,8.4,roofY,{});
  });

  /* East (+x) stone dye-vat court (crimson cave-madder, saffron-gold, deep indigo) + overhead drying poles */
  W(2.95,plinthY,-.45,0,()=>{
   svNoWalk(()=>{
    const dyeCols=[0x9e2a2b,0xc49022,0x243b58];
    for(let v=0;v<3;v++){
     const vz=-2.45+v*2.15;
     cyl('basalt',1.15,0,vz,.78,.68,P('basaltDark'),12,.74,false);
     cyl('travertine',1.15,.68,vz,.82,.10,P('travertine'),12,.80,false);
     cyl('paving',1.15,.56,vz,.66,.06,dyeCols[v],12,null,false);
    }
    /* Cedar drying rack with fluttering dyed kilim bolts */
    for(const pz of [-2.65,2.65]){
     box('cedar',-1.15,0,pz,.14,3.05,.14,P('cedar'));
    }
    beam('cedar',[-1.15,2.95,-2.65],[-1.15,2.95,2.65],.06,P('cedar'));
    withCloth(clothHang(1.65,.07),()=>{
     box('kilim',-1.15,2.05,-1.25,.03,1.65,1.55,0x9e2a2b);
     box('kilim',-1.15,2.05,.95,.03,1.65,1.55,0xb8861b);
    });
   });
   FURNISH('generic_sewing',-2.45,.02,2.85,0);
   FURNISH('generic_basket',1.15,.02,3.45,0);
  });

  svStair(-2.75,5.85,0,plinthY,PI,{w:1.8,run:.85,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-2.75,0,6.20,{outside:true});
  smWalkTarget('loom-hall',-2.75,plinthY,-.45,{});
  smWalkTarget('dye-court',.85,plinthY,1.20,{});
 }
});

/* 4. sm_tannery: canyon-side stone lime/tannin hide-soaking pits, stretching frames & crimson shagreen loft */
defBuilding({
 key:'sm_tannery',
 name:'Shagreen leather and scabbard tannery',
 seed:8424,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.3,
 w:13.6,
 d:12.0,
 h:8.4,
 tags:{types:['industry'],wealth:'poor',style:SM_STYLES.hearth,job:'tanning',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_tannery);
  const plinthY=.38,wallH=3.35,roofY=plinthY+wallH;
  smPlinth(11.8,10.0,plinthY,{ablaqQuoins:false,topMk:'cobble',topPal:'cobble'});

  W(-2.75,0,-.45,0,()=>{
   smHollowAblaq(5.8,8.0,plinthY,wallH,{
    t:.46,
    mode:'basalt',
    front:[{x:0,y:plinthY,w:1.38,h:2.28,kind:'door'}],
    back:[{x:0,y:plinthY+1.20,w:.88,h:1.25,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.20,w:.88,h:1.25,kind:'window',glassKind:'smoked'}],
    right:[{x:-1.55,y:plinthY,w:1.28,h:2.18,kind:'door'}]
   });
   smHumanDoor(0,plinthY,4.00,0,1.28,2.20,{mk:'timber',col:0x523928,style:'plank',name:'tannery-door'});
   smHumanDoor(2.90,plinthY,1.55,PI*.5,1.18,2.12,{mk:'timber',col:0x523928,front:false,name:'pit-door'});
   smParapet(6.0,8.2,roofY,{});
  });

  /* East (+x) stone lime & oak-gall tanning pits + pegged hide-stretching frames */
  W(2.85,plinthY,-.45,0,()=>{
   svNoWalk(()=>{
    for(let r=0;r<2;r++)for(let c=0;c<2;c++){
     const px=-.65+c*1.85,pz=-2.15+r*2.05;
     box('basalt',px,0,pz,1.55,.52,1.65,P('basaltDark'));
     box('paving',px,.44,pz,1.25,.06,1.35,c===0?0xc8c0a8:0x5a3b24);
    }
    /* Timber hide-stretching A-frame */
    box('timber',.35,0,2.45,2.6,.12,.14,P('timber'));
    box('timber',.35,2.15,2.45,2.6,.12,.14,P('timber'));
    box('timber',-.90,0,2.45,.14,2.25,.14,P('timber'));
    box('timber',1.60,0,2.45,.14,2.25,.14,P('timber'));
    box('lacquer',.35,.32,2.45,1.85,1.65,.04,P('lacquer'));
   });
   FURNISH('generic_barrel',2.05,.02,3.15,0);
  });

  smWalkTarget('approach',-2.75,0,5.55,{outside:true});
  smWalkTarget('currier-room',-2.75,plinthY,-.45,{});
  smWalkTarget('tan-yard',.65,plinthY,1.10,{});
 }
});

/* 5. sm_brewery_teahouse: millet-beer boza brewhouse & carved-dome teahouse with copper samovar & kilim rugs */
defBuilding({
 key:'sm_brewery_teahouse',
 name:'Boza brewhouse and samovar teahouse',
 seed:8425,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.8,
 w:13.6,
 d:13.4,
 h:12.8,
 tags:{types:['tavern','inn'],wealth:'middle',style:SM_STYLES.hearth,job:'brewing',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_brewery_teahouse);
  const plinthY=.56,wallH=3.85,roofY=plinthY+wallH;
  W(0,0,-.55,0,()=>{
   smPlinth(11.6,10.8,plinthY,{ablaqQuoins:true});
   smHollowAblaq(10.8,9.8,plinthY,wallH,{
    t:.48,
    front:[
     {x:0,y:plinthY,w:1.52,h:2.42,kind:'door'},
     {x:-3.15,y:plinthY+.95,w:1.45,h:1.65,kind:'window',glassKind:'lit'},
     {x:3.15,y:plinthY+.95,w:1.45,h:1.65,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-2.85,y:plinthY+1.15,w:1.25,h:1.50,kind:'window',glassKind:'lit'},
     {x:2.85,y:plinthY+1.15,w:1.25,h:1.50,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.05,w:1.45,h:1.55,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.05,w:1.45,h:1.55,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,plinthY,4.90,0,1.40,2.35,{mk:'lacquer',col:0xa83031,style:'banded',name:'teahouse-door'});
   smParapet(11.0,10.0,roofY,{hole:{x0:-1.85,x1:1.85,z0:-1.85,z1:1.85}});

   /* Small Hearth-scale carved Mamluk dome crowning the warm teahouse salon */
   const drum=smDrum(0,roofY,0,5.6,{domeD:4.6,transH:1.48,clerH:1.10,hollow:true,windows:8});
   smDome(0,drum.topY,0,drum.domeD,{style:'carved',h:3.78,hollow:true});
   smChimney(-3.85,roofY,-3.25,2.35,{r:.38,smokeScale:.34});

   /* Burnished brass/copper samovar hearth & kilim tea carpets */
   svNoWalk(()=>{
    medallion('kilim',2.45,plinthY+.03,0,3.2,{ry:0});
    box('basalt',-3.65,plinthY+.02,-3.15,1.85,.95,1.35,P('basaltDark'));
    cyl('bronze',-3.65,plinthY+.97,-3.15,.36,.78,P('bronze'),14,.28,false);
    sph('gold',-3.65,plinthY+1.82,-3.15,.14,P('gold'),1.0,10);
   });
   FURNISH('generic_tea_set',2.45,plinthY+.02,.25,0);
   FURNISH('generic_ale',-2.25,plinthY+.02,-3.45,0);
   FURNISH('generic_barrel',-4.25,plinthY+.02,2.65,PI*.5);
   FURNISH('generic_keg',-4.25,plinthY+.02,1.45,PI*.5);
   FURNISH('generic_bread_basket',2.95,plinthY+.02,-.55,0);
  });

  svStair(0,5.85,0,plinthY,PI,{w:2.1,run:1.05,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',0,0,6.25,{outside:true});
  smWalkTarget('tea-salon',1.45,plinthY,-.55,{});
 }
});

/* 6. sm_bazaar_hall: vaulted stone qaysariyya market arcade with pointed ablaq arches & muhtasib booth */
defBuilding({
 key:'sm_bazaar_hall',
 name:'Qaysariyya vaulted stone bazaar hall',
 seed:8426,
 variants:2,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.9,
 w:16.8,
 d:12.6,
 h:9.6,
 tags:{types:['market','shop'],wealth:'middle',style:SM_STYLES.hearth,job:'trading',role:'trade',lit:true},
 build(o){
  const v=(o&&o.v)|0;
  smBindRec(DEFS.sm_bazaar_hall);
  const plinthY=.48,wallH=4.05,roofY=plinthY+wallH;
  W(0,0,-.35,0,()=>{
   smPlinth(15.0,10.2,plinthY,{ablaqQuoins:true});
   smHollowAblaq(14.2,9.2,plinthY,wallH,{
    t:.48,
    mode:v?'basalt':'ablaq',
    front:[
     {x:0,y:plinthY,w:1.65,h:2.55,kind:'door'},
     {x:-4.45,y:plinthY,w:2.35,h:2.75,kind:'arch'},
     {x:4.45,y:plinthY,w:2.35,h:2.75,kind:'arch'}
    ],
    back:[
     {x:-4.25,y:plinthY+1.25,w:1.35,h:1.65,kind:'window',glassKind:'lit'},
     {x:0,y:plinthY+1.25,w:1.55,h:1.65,kind:'window',glassKind:'lit'},
     {x:4.25,y:plinthY+1.25,w:1.35,h:1.65,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.25,w:1.45,h:1.65,kind:'window',glassKind:'lit'}],
    right:[{x:0,y:plinthY+1.25,w:1.45,h:1.65,kind:'window',glassKind:'lit'}]
   });
   smHumanDoor(0,plinthY,4.60,0,1.52,2.45,{mk:'lacquer',col:0xa83031,style:'banded',split:true,ajar:.95,name:'bazaar-door'});
   smParapet(14.4,9.4,roofY,{});
   if(v){
    smBathDome(0,roofY,0,3.8,1.55);
   }

   /* Crimson or gold market awnings & interior stone merchant counters + muhtasib inspector desk */
   svNoWalk(()=>{
    for(const sx of [-4.45,4.45]){
     psurf('kilim',(u,v2)=>[sx+lerp(-1.45,1.45,u),lerp(plinthY+3.05,plinthY+2.45,v2),lerp(4.62,5.65,v2)],3,2,P(v&&sx>0?'gold':'lacquer'),{up:true});
     box('travertine',sx,plinthY+.02,-2.45,2.65,.92,1.05,P('travertine'));
    }
   });
   FURNISH('generic_spice_box',-4.45,plinthY+.94,-2.45,0);
   FURNISH('generic_fruit_bowl',-3.65,plinthY+.94,-2.45,0);
   FURNISH('generic_veg_basket',4.45,plinthY+.94,-2.45,0);
   FURNISH('generic_cheese',3.65,plinthY+.94,-2.45,0);
   FURNISH('generic_sack',-5.85,plinthY+.02,2.15,PI*.25);
   FURNISH('generic_crate',5.85,plinthY+.02,2.15,-PI*.25);
   FURNISH('generic_strongbox',0,plinthY+.02,-3.35,0);
  });

  svStair(0,5.65,0,plinthY,PI,{w:2.6,run:.95,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',0,0,5.95,{outside:true});
  smWalkTarget('bazaar-aisle',0,plinthY,-.35,{});
  smWalkTarget('west-stall',-3.85,plinthY,.65,{});
 }
});

/* 7. sm_spirits_still: canyon aloe/apricot roasting pit + twin riveted copper-dome alembics for Sunu-sikaru (BUILD-OUT.md 4a) */
defBuilding({
 key:'sm_spirits_still',
 name:'Sunu-sikaru twin copper-dome spirits still',
 seed:8427,
 cls:'building',
 cut:true,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.6,
 w:14.4,
 d:12.6,
 h:9.2,
 tags:{types:['industry','shop'],wealth:'middle',style:SM_STYLES.hearth,job:'brewing',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_spirits_still);
  const plinthY=.44,wallH=3.65,roofY=plinthY+wallH;
  smPlinth(12.6,10.4,plinthY,{ablaqQuoins:true,topMk:'paving',topPal:'paving'});

  /* West (-x) cool basalt stoneware aging & bottling room */
  W(-2.95,0,-.45,0,()=>{
   smHollowAblaq(6.0,8.4,plinthY,wallH,{
    t:.48,
    front:[
     {x:0,y:plinthY,w:1.42,h:2.35,kind:'door'},
     {x:-1.75,y:plinthY+1.05,w:1.05,h:1.40,kind:'window',glassKind:'lit'}
    ],
    back:[{x:0,y:plinthY+1.15,w:1.05,h:1.35,kind:'window',glassKind:'smoked',bars:true}],
    left:[{x:0,y:plinthY+1.15,w:1.05,h:1.35,kind:'window',glassKind:'lit'}],
    right:[{x:-1.65,y:plinthY,w:1.32,h:2.22,kind:'door'}]
   });
   smHumanDoor(0,plinthY,4.20,0,1.32,SM_HUMAN_DOOR,{mk:'lacquer',col:0xa83031,style:'banded',name:'still-house-door'});
   smHumanDoor(3.00,plinthY,1.65,PI*.5,1.22,2.14,{mk:'cedar',style:'plank',front:false,name:'alembic-court-door'});
   smParapet(6.2,8.6,roofY,{});
   smChimney(-1.65,roofY,-2.65,2.25,{r:.36,smokeScale:.30});

   FURNISH('shumari_copper_alembic',-1.85,plinthY+.02,-2.85,0);
   FURNISH('shumari_spirit_flask_rack',1.65,plinthY+.02,-2.85,0);
   FURNISH('generic_barrel',-1.95,plinthY+.02,2.15,PI*.5);
   FURNISH('shumari_millet_jar',1.85,plinthY+.02,-.65,-PI*.5);
   FURNISH('generic_preserves',0,plinthY+.02,-3.15,0);
  });

  /* East (+x) open stone distillery court: canyon aloe/apricot roasting pit + TWIN RIVETED COPPER-DOME ALEMBICS + snowmelt condenser */
  W(3.05,plinthY,-.45,0,()=>{
   /* Twin riveted burnished-copper alembic domes echoing miniature Mamluk qubbas, swan-necks dipping into the stone condenser trough */
   smCopperAlembic(-1.05,0,-2.35,1.65,0,2.25);
   smCopperAlembic(1.35,0,-2.35,1.65,0,2.25);
   svNoWalk(()=>{
    /* Long basalt snowmelt cold-water condenser trough receiving the twin copper coils */
    box('basalt',.15,0,.15,4.2,.82,1.15,P('basaltDark'));
    box('travertine',.15,.82,.15,4.3,.10,1.25,P('travertine'));
    box('paving',.15,.68,.15,3.8,.08,.85,P('glass'));
    /* Sunken circular basalt-rimmed canyon-aloe & twist-apricot roasting pit at +z */
    cyl('rubble',1.35,0,2.65,1.18,.48,P('basaltDark'),14,1.10,false);
    cyl('glow',1.35,.22,2.65,.78,.06,P('ember'),12,null,false);
    cone('earth',1.35,.26,2.65,.72,.42,P('earth'),10);
   });
   haloAt(1.35,.55,2.65,0xff7828,false);
   smokeAt(-1.05,2.85,-2.35,{r:.24,kind:'fire'});
   smokeAt(1.35,2.85,-2.35,{r:.24,kind:'fire'});
  });

  svStair(-2.95,5.65,0,plinthY,PI,{w:1.85,run:.90,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-2.95,0,5.95,{outside:true});
  smWalkTarget('bottling-room',-2.95,plinthY,-.45,{});
  smWalkTarget('alembic-court',1.35,plinthY,1.65,{});
 }
});

/* 8. sm_lake_jetty: Siru-Yamu dressed basalt quay steps, tarred-pine skiff/ore-barge slipway & smoked lake-trout rack (BUILD-OUT.md 4a) */
defBuilding({
 key:'sm_lake_jetty',
 name:'Siru-Yamu basalt lake jetty and trout-smoking quay',
 seed:8428,
 cls:'building',
 cut:false,
 giant:false,
 caste:SM_CASTES.hearth,
 vaultH:3.2,
 w:15.2,
 d:13.6,
 h:8.2,
 tags:{types:['infrastructure','market'],wealth:'middle',style:SM_STYLES.hearth,job:'fishing',role:'trade',lit:true},
 build(){
  smBindRec(DEFS.sm_lake_jetty);
  const quayY=.72,wallH=3.25,roofY=quayY+wallH;

  /* 1. Dressed basalt lakefront quay wall & moorings (front +z landward approach, -z extending toward Siru-Yamu water) */
  W(0,0,.35,0,()=>{
   smPlinth(13.4,10.6,quayY,{batter:.36,ablaqQuoins:true,topMk:'paving',topPal:'paving'});

   /* West (-x) basalt quaymaster & lake-trout curing shed */
   W(-3.55,0,.65,0,()=>{
    smHollowAblaq(5.2,6.4,quayY,wallH,{
     t:.46,
     mode:'basalt',
     front:[
      {x:0,y:quayY,w:1.40,h:2.30,kind:'door'},
      {x:1.45,y:quayY+1.05,w:.88,h:1.25,kind:'window',glassKind:'lit'}
     ],
     back:[{x:0,y:quayY+1.15,w:.95,h:1.25,kind:'window',glassKind:'lit'}],
     left:[{x:0,y:quayY+1.15,w:.95,h:1.25,kind:'window',glassKind:'lit'}],
     right:[{x:0,y:quayY+1.15,w:.95,h:1.25,kind:'window',glassKind:'lit'}]
    });
    smHumanDoor(0,quayY,3.20,0,1.30,SM_HUMAN_DOOR,{mk:'tarred',col:0x2c2623,style:'banded',name:'quay-shed-door'});
    smParapet(5.4,6.6,roofY,{});
    smChimney(-1.45,roofY,-1.85,1.95,{r:.32,smokeScale:.28});
   });

   /* East (+x) sloped tarred-pine skiff & ore-barge slipway + tarred pine skiff on chocks + smoked lake-trout A-frame rack */
   W(2.85,quayY,0,0,()=>{
    svNoWalk(()=>{
     /* Sloped timber slipway rails descending toward -z lakefront + basalt mooring bollards */
     psurf('tarred',(u,v)=>[lerp(-1.65,1.65,u),lerp(.04,-.55,v),lerp(.85,-5.45,v)],3,3,P('tarred'));
     for(let r=0;r<7;r++){
      const f=r/6;
      box('timber',0,lerp(.08,-.48,f),lerp(.65,-5.15,f),3.1,.09,.16,P('timber'));
     }
     /* Tarred highland pine lake skiff resting on timber slipway chocks */
     W(0,.28,-1.85,0,()=>{
      psurf('tarred',(u,v)=>{
       const z=lerp(-2.25,2.25,v);
       const beamW=Math.sin(v*PI)*.92;
       const side=(u-.5)*2;
       return [side*beamW,Math.abs(side)*.48+(Math.pow(Math.abs(v-.5)*2,2))*.24,z];
      },6,8,P('tarred'),{up:true});
      for(const tz of [-.85,0,.85])box('cedar',0,.36,tz,1.35,.06,.24,P('cedar'));
     });
     /* Cast-bronze & basalt mooring bollards along -z quay lip */
     for(const bx of [-5.2,-2.2,2.8]){
      cyl('basalt',bx-2.85,0,-4.95,.24,.58,P('basaltDark'),10,.20,false);
      sph('bronzeCast',bx-2.85,.62,-4.95,.18,P('bronze'),.8,10);
     }
     /* A-frame cedar smoked char & lake-trout drying rack on +z/+x */
     W(.45,0,2.85,0,()=>{
      for(const sx of [-1.35,1.35]){
       beam('cedar',[sx,0,-.65],[sx,2.15,0],.08,P('cedar'));
       beam('cedar',[sx,0,.65],[sx,2.15,0],.08,P('cedar'));
      }
      beam('cedar',[-1.45,2.10,0],[1.45,2.10,0],.07,P('cedar'));
      beam('cedar',[-1.45,1.35,0],[1.45,1.35,0],.06,P('cedar'));
      for(let f=-4;f<=4;f++){
       cone('ironstone',f*.26,1.52,0,.06,.42,0xb86842,6);
      }
     });
    });
    FURNISH('generic_fish',-1.45,.02,3.15,0);
    FURNISH('generic_barrel',2.35,.02,3.15,0);
    FURNISH('generic_crate',2.35,.02,2.05,0);
   });
  });

  /* Landward stone steps climbing onto the basalt quay */
  svStair(-3.55,6.15,0,quayY,PI,{w:2.2,run:1.35,style:'solid',mk:'basalt',col:P('basalt')});
  smWalkTarget('approach',-3.55,0,6.45,{outside:true});
  smWalkTarget('quay-shed',-3.55,quayY,1.00,{});
  smWalkTarget('quay-promenade',-.65,quayY,-3.25,{});
 }
});
