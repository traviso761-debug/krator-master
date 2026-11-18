/* prefix: sm */
// ================================================================= SHUMARI CITADEL & GORGE DEFENCE (Phase SM4)
// Kars-and-Cairo basalt fortifications: ALL carry role: 'defence' and giant: true (>= 4.4 m portals, >= 5.4 m vaults).

/* 1. sm_citadel_keep: polygonal/battered dark-basalt citadel keep with four octagonal corner towers & +1 spiral dome */
defBuilding({
 key:'sm_citadel_keep',
 name:'Dark-basalt citadel keep',
 seed:8321,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.6,
 w:19.6,
 d:22.0,
 h:22.2,
 tags:{types:['military','civic'],wealth:'rich',style:SM_STYLES.state,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_citadel_keep);
  const plinthY=1.45,wallH=6.65,roofY=plinthY+wallH;
  W(0,0,-.95,0,()=>{
   smPlinth(17.2,16.8,plinthY,{batter:.58,ablaqQuoins:true});
   smHollowAblaq(14.8,14.4,plinthY,wallH,{
    t:.64,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:2.75,h:4.75,kind:'door'},
     {x:-4.4,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false},
     {x:4.4,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false}
    ],
    back:[
     {x:-4.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false},
     {x:4.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false}
    ],
    left:[
     {x:-3.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false},
     {x:3.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false}
    ],
    right:[
     {x:-3.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false},
     {x:3.2,y:plinthY+2.65,w:.62,h:1.95,kind:'window',glassKind:'lit',bars:true,jali:false}
    ]
   });

   /* Four massive octagonal dark-basalt corner bastions with machicolated shurafat crowns */
   svNoWalk(()=>{
    for(const sx of [-1,1])for(const sz of [-1,1]){
     const tx=sx*7.25,tz=sz*7.05,th=wallH+1.65;
     cyl('basalt',tx,plinthY,tz,1.45,th,P('basaltDark'),8,1.32,false);
     cyl('travertine',tx,plinthY+th,tz,1.52,.22,P('travertine'),8,1.62,false);
     for(let k=0;k<8;k++){
      const a=k*PI*.25;
      smShurafatMerlon(tx+Math.cos(a)*1.42,plinthY+th+.22,tz+Math.sin(a)*1.42,PI*.5-a,.78);
     }
    }
   });

   smPishtaq(0,plinthY,7.20,{
    w:6.0,h:9.2,d:1.35,doorW:2.55,doorH:4.55,giant:true,hollow:true,
    doorMk:'iron',doorCol:0x34363c,doorStyle:'banded',socketKind:'banner',doorName:'keep-pishtaq'
   });
   smParapet(15.0,14.6,roofY,{hole:{x0:-2.85,x1:2.85,z0:-2.85,z1:2.85},skipFrontW:6.1});
   const drum=smDrum(0,roofY,0,8.6,{domeD:7.0,transH:2.05,clerH:1.48,hollow:true,windows:12});
   smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:5.74,ribs:22,turns:.45,hollow:true});

   svNoWalk(()=>medallion('kilim',0,plinthY+.03,-.45,4.8,{ry:0}));
   FURNISH('generic_strongbox',-5.25,plinthY+.02,-5.15,PI*.5);
   FURNISH('generic_strongbox',5.25,plinthY+.02,-5.15,-PI*.5);
   FURNISH('generic_barrel',-5.25,plinthY+.02,4.65,PI*.5);
   FURNISH('generic_keg',5.25,plinthY+.02,4.65,-PI*.5);
   FURNISH('generic_rations',0,plinthY+.02,-5.45,0);
   FURNISH('generic_lamp_oil',2.45,plinthY+.02,-5.45,0);
  });

  smCompoundStair(0,10.17,0,plinthY,PI,{w:3.4,going:.34});
  smWalkTarget('approach',0,0,10.55,{outside:true});
  smWalkTarget('keep-war-hall',0,plinthY,-.95,{});
 }
});

/* 2. sm_curtain_wall: battered ishigaki-dressed basalt curtain wall (8 m wall-walk) with Giant sally-port & rear compound stair */
defBuilding({
 key:'sm_curtain_wall',
 name:'Battered basalt curtain wall',
 seed:8322,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:18.4,
 d:11.6,
 h:11.2,
 tags:{types:['military','infrastructure'],wealth:'middle',style:SM_STYLES.state,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_curtain_wall);
  const plinthY=.52,wallH=6.85,walkY=plinthY+wallH;
  smPlinth(16.6,8.6,plinthY,{batter:.48,ablaqQuoins:true});

  /* Main curtain rampart along +z half with central Giant sally-port passage */
  W(0,0,1.25,0,()=>{
   smHollowAblaq(16.2,4.2,plinthY,wallH,{
    t:.62,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:2.65,h:4.60,kind:'door'},
     {x:-5.2,y:plinthY+3.45,w:.38,h:1.65,kind:'window',glassKind:'smoked',bars:true,jali:false},
     {x:5.2,y:plinthY+3.45,w:.38,h:1.65,kind:'window',glassKind:'smoked',bars:true,jali:false}
    ],
    back:[{x:0,y:plinthY,w:2.65,h:4.60,kind:'arch'}],
    left:[],
    right:[]
   });
   smGiantPortal(0,plinthY,2.10,0,2.45,SM_GIANT_DOOR,{
    mk:'iron',col:0x32343a,style:'banded',name:'sally-port-gate'
   });
   /* Walkable allure wall-walk slab + corbelled machicolations & shurafat battlements */
   box('paving',0,walkY-.22,0,16.2,.22,4.2,P('paving'));
   svNoWalk(()=>{
    smMuqarnasRow(0,walkY-.48,2.10,16.2,.48,.36,0,2);
    box('basalt',0,walkY,1.98,16.4,.68,.36,P('basaltDark'));
    for(let i=-8;i<=8;i++)smShurafatMerlon(i*.96,walkY+.68,2.04,0,.92);
    box('basalt',0,walkY,-1.98,16.4,.42,.24,P('basalt'));
   });
  });

  /* Rear (-z) dual-tread garrison stair climbing along X up onto the wall-walk */
  smCompoundStair(-6.25,-2.25,plinthY,walkY,PI*.5,{w:2.5,going:.26});
  svLanding(4.85,-1.55,walkY,3.4,2.8,{mk:'paving',col:P('paving')});
  svStair(0,5.25,0,plinthY,PI,{w:3.2,run:.95,style:'solid',mk:'basalt',col:P('basalt')});

  smWalkTarget('outer-glacis',0,0,5.55,{outside:true});
  smWalkTarget('sally-passage',0,plinthY,1.25,{});
  smWalkTarget('wall-walk',0,walkY,1.25,{});
 }
});

/* 3. sm_pishtaq_gate: twin-turret ablaq fortress gatehouse with 4.6 m bronze-strapped Giant gates & murder-hole iwan */
defBuilding({
 key:'sm_pishtaq_gate',
 name:'Twin-turret ablaq fortress gatehouse',
 seed:8323,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.4,
 w:17.6,
 d:14.4,
 h:15.8,
 tags:{types:['military','infrastructure'],wealth:'rich',style:SM_STYLES.state,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_pishtaq_gate);
  const plinthY=.76,wallH=7.45,roofY=plinthY+wallH;
  smPlinth(15.6,10.2,plinthY,{batter:.50,ablaqQuoins:true,topMk:'cobble',topPal:'cobble'});
  smCompoundStair(0,6.42,0,plinthY,PI,{w:3.6,going:.33});
  smCompoundStair(0,-6.42,0,plinthY,0,{w:3.6,going:.33});

  smHollowAblaq(14.6,9.2,plinthY,wallH,{
   t:.60,
   front:[
    {x:0,y:plinthY,w:3.05,h:4.85,kind:'door'},
    {x:-4.65,y:plinthY+2.45,w:.56,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false},
    {x:4.65,y:plinthY+2.45,w:.56,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false}
   ],
   back:[
    {x:0,y:plinthY,w:3.05,h:4.85,kind:'arch'},
    {x:-4.65,y:plinthY+2.45,w:.56,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false},
    {x:4.65,y:plinthY+2.45,w:.56,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false}
   ],
   left:[{x:0,y:plinthY+2.65,w:.62,h:1.85,kind:'window',glassKind:'smoked',bars:true,jali:false}],
   right:[{x:0,y:plinthY+2.65,w:.62,h:1.85,kind:'window',glassKind:'smoked',bars:true,jali:false}]
  });

  /* Twin projecting octagonal flanking drum-turrets */
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    const tx=sx*6.25,tz=4.35,th=wallH+1.85;
    cyl('basalt',tx,plinthY,tz,1.65,th*.55,P('basaltDark'),8,1.55,false);
    cyl('travertine',tx,plinthY+th*.55,tz,1.55,th*.45,P('travertine'),8,1.50,false);
    box('frieze_kattu',tx,plinthY+th-.65,tz+1.45,1.35,.34,.18,0xffffff);
    for(let k=0;k<8;k++){
     const a=k*PI*.25;
     smShurafatMerlon(tx+Math.cos(a)*1.45,plinthY+th+.02,tz+Math.sin(a)*1.45,PI*.5-a,.82);
    }
   }
  });

  smPishtaq(0,plinthY,4.60,{
   w:6.2,h:10.4,d:1.40,doorW:2.85,doorH:4.60,giant:true,hollow:true,
   doorMk:'bronzeCast',doorCol:0x7c5c26,doorStyle:'banded',ajar:1.05,socketKind:'banner',doorName:'fortress-gate'
  });
  smParapet(14.8,9.4,roofY,{skipFrontW:6.4});

  smWalkTarget('outer-road',0,0,6.75,{outside:true});
  smWalkTarget('gate-passage',0,plinthY,0,{});
  smWalkTarget('inner-ward',0,0,-6.75,{});
 }
});

/* 4. sm_payaru_tower: polygonal Mamluk watch-minaret & beacon tower (refs/02) with muqarnas balconies & top signal brazier */
defBuilding({
 key:'sm_payaru_tower',
 name:'Payaru polygonal watch-minaret',
 seed:8324,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.5,
 w:11.6,
 d:13.4,
 h:22.8,
 tags:{types:['military'],wealth:'rich',style:SM_STYLES.state,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_payaru_tower);
  const plinthY=.92,baseH=5.65,s1Y=plinthY+baseH,s1H=5.45,s2Y=s1Y+s1H,s2H=4.65,topY=s2Y+s2H;
  W(0,0,-.55,0,()=>{
   /* 1. Square Giant guardhouse base (refs/02) */
   smPlinth(8.8,8.8,plinthY,{ablaqQuoins:true});
   smHollowAblaq(7.8,7.8,plinthY,baseH,{
    t:.52,
    front:[{x:0,y:plinthY,w:2.55,h:4.55,kind:'door'}],
    back:[{x:0,y:plinthY+1.85,w:.95,h:2.15,kind:'window',glassKind:'lit',bars:true}],
    left:[{x:0,y:plinthY+1.85,w:.95,h:2.15,kind:'window',glassKind:'lit',bars:true}],
    right:[{x:0,y:plinthY+1.85,w:.95,h:2.15,kind:'window',glassKind:'lit',bars:true}]
   });
   smGiantPortal(0,plinthY,3.90,0,2.35,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xb83234,style:'banded',name:'payaru-base-door'
   });
   smParapet(8.0,8.0,s1Y,{});

   /* 2. Octagonal ablaq shaft + first muqarnas watch-balcony + fluted upper cylinder + bronze beacon pavilion (refs/02) */
   svNoWalk(()=>{
    /* Turkish-triangle base collar */
    for(let k=0;k<8;k++){
     const a=k*PI*.25,rOct=2.45,fw=2*rOct*Math.tan(PI/8)+.06;
     W(0,s1Y,0,a,()=>{
      for(let c=0;c<10;c++){
       const m=smAblaqCourse(c);
       box(m.mk,0,c*(s1H/10),rOct-.18,fw,s1H/10,.36,m.col);
      }
      box('jali',0,1.65,rOct+.02,fw*.52,1.85,.03,P('travertine'));
      svPane(0,1.65,rOct-.06,0,fw*.48,1.80,{kind:'lit',solid:true});
      smMuqarnasRow(0,s1H-.42,rOct-.04,fw+.24,.42,.42,0,3);
     });
    }
    /* First octagonal carved jali watch-balcony */
    cyl('travertine',0,s2Y,0,2.95,.18,P('travertine'),8,3.02,false);
    for(let k=0;k<8;k++){
     const a=k*PI*.25;
     W(0,s2Y+.18,0,a,()=>{
      box('jali',0,0,2.85,2.15,.92,.05,P('travertine'));
      box('chiselled',0,.92,2.85,2.22,.08,.12,P('ashlar'));
     });
    }
    /* Upper 12-faceted carved ashlar shaft + second muqarnas collar */
    cyl('domeCarved',0,s2Y+.18,0,1.95,s2H-.38,P('domeStone'),12,1.88,false);
    cyl('frieze_kattu',0,topY-.65,0,1.94,.34,0xffffff,16,1.94,true);
    cyl('travertine',0,topY-.20,0,2.38,.20,P('travertine'),8,2.48,false);

    /* Open 8-column bronze-and-travertine beacon mabkhara lantern with blazing gorge signal brazier */
    for(let k=0;k<8;k++){
     const a=k*PI*.25;
     cyl('travertine',Math.cos(a)*1.75,topY,Math.sin(a)*1.75,.11,2.35,P('travertine'),10,null,false);
    }
    cyl('chiselled',0,topY+2.35,0,2.05,.18,P('travertine'),8,1.95,false);
    const capProf=[];
    for(let i=0;i<=10;i++){
     const u=i/10;
     capProf.push([i===10?0:smDomeRadius(u,3.4),topY+2.53+u*2.45]);
    }
    lathe('domeCarved',0,0,capProf,16,P('domeStone'));
    smJamur(0,topY+4.98,0,1.15);

    /* Blazing bronze signal brazier inside the open lantern */
    cyl('bronzeCast',0,topY+.02,0,.78,.62,P('bronze'),10,.92,false);
    cyl('glow',0,topY+.62,0,.68,.08,P('ember'),12,null,false);
    cone('glow',0,topY+.68,0,.38,.95,P('flame'),10);
   });
   haloAt(0,topY+1.15,0,0xff9438,true);
   smokeAt(0,topY+1.55,0,{r:.42,kind:'fire'});
  });

  smCompoundStair(0,5.89,0,plinthY,PI,{w:2.6,going:.34});
  smWalkTarget('approach',0,0,6.25,{outside:true});
  smWalkTarget('guard-chamber',0,plinthY,-.55,{});
 }
});

/* 5. sm_regiment_barracks: quadrangle tuppu barracks with muster porch, weapon racks, and Giant + human dormitories */
defBuilding({
 key:'sm_regiment_barracks',
 name:'Regimental tuppu barracks',
 seed:8325,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.6,
 w:19.2,
 d:17.2,
 h:12.8,
 tags:{types:['military','dwelling-multi'],wealth:'middle',style:SM_STYLES.sword,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_regiment_barracks);
  const plinthY=.84,wallH=5.65,roofY=plinthY+wallH;
  W(0,0,-.65,0,()=>{
   smPlinth(17.2,13.4,plinthY,{ablaqQuoins:true});
   smHollowAblaq(16.2,11.6,plinthY,wallH,{
    t:.52,
    front:[
     {x:0,y:plinthY,w:2.65,h:4.60,kind:'door'},
     {x:-5.15,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit',bars:true},
     {x:5.15,y:plinthY+1.65,w:1.25,h:2.25,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-5.15,y:plinthY+1.75,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true},
     {x:0,y:plinthY+1.75,w:1.35,h:2.20,kind:'window',glassKind:'lit',bars:true},
     {x:5.15,y:plinthY+1.75,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true}
    ],
    left:[
     {x:-2.6,y:plinthY+1.65,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true},
     {x:2.6,y:plinthY+1.65,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true}
    ],
    right:[
     {x:-2.6,y:plinthY+1.65,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true},
     {x:2.6,y:plinthY+1.65,w:1.25,h:2.20,kind:'window',glassKind:'lit',bars:true}
    ]
   });
   smGiantPortal(0,plinthY,5.80,0,2.45,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xa83031,style:'banded',name:'barracks-portal'
   });
   smSocket('banner',-3.25,plinthY+3.65,5.95,0,{scale:1.05});
   smSocket('banner',3.25,plinthY+3.65,5.95,0,{scale:1.05});
   smParapet(16.4,11.8,roofY,{});
   smChimney(-5.65,roofY,-3.85,2.25,{r:.38});
   smChimney(5.65,roofY,-3.85,2.25,{r:.38});

   /* Muster weapon racks & Giant/human sleeping bays */
   svNoWalk(()=>{
    for(const sx of [-1,1]){
     W(sx*4.25,plinthY+.02,4.45,0,()=>{
      box('lacquer',0,0,0,2.4,.18,.48,P('lacquer'));
      box('lacquer',0,1.25,0,2.4,.12,.38,P('lacquer'));
      for(let b=-3;b<=3;b++)pole('iron',[b*.30,.18,0],[b*.30,2.35,0],.024,P('iron'),6);
     });
    }
   });
   FURNISH('generic_poor_straw_bed',-6.45,plinthY+.02,-3.85,PI*.5);
   FURNISH('generic_poor_straw_bed',-6.45,plinthY+.02,-1.65,PI*.5);
   FURNISH('generic_chest',6.45,plinthY+.02,-3.85,-PI*.5);
   FURNISH('generic_strongbox',6.45,plinthY+.02,2.45,-PI*.5);
   FURNISH('generic_rations',0,plinthY+.02,-4.45,0);
   FURNISH('generic_barrel',2.65,plinthY+.02,-4.45,0);
  });

  smCompoundStair(0,7.75,0,plinthY,PI,{w:3.2,going:.34});
  smWalkTarget('approach',0,0,8.15,{outside:true});
  smWalkTarget('barracks-hall',0,plinthY,-.65,{});
 }
});

/* 6. sm_ordeal_yard: walled sand-and-basalt Urudiru trial & training court with Giant entry arch & viewing iwan */
defBuilding({
 key:'sm_ordeal_yard',
 name:'Urudiru ordeal and drill yard',
 seed:8326,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.cadet,
 vaultH:5.4,
 w:18.6,
 d:19.0,
 h:12.2,
 tags:{types:['military'],wealth:'middle',style:SM_STYLES.sword,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_ordeal_yard);
  const plinthY=.68,wallH=5.45,iwanY=plinthY+.76;
  smPlinth(16.8,14.8,plinthY,{ablaqQuoins:true,topMk:'earth',topPal:'earth'});
  smCompoundStair(0,8.72,0,plinthY,PI,{w:3.2,going:.33});

  /* Walled drill enclosure on +z, -x, +x */
  W(0,0,7.15,0,()=>smAblaqWall(16.8,plinthY,3.85,[
   {x:0,y:plinthY,w:2.65,h:4.55,kind:'door'}
  ],{t:.48}));
  smGiantPortal(0,plinthY,7.40,0,2.45,SM_GIANT_DOOR,{
   kattu:true,mk:'bronzeCast',col:0x8f6b2d,style:'grille',ajar:1.05,name:'ordeal-yard-gate'
  });
  W(-8.16,0,.95,-PI*.5,()=>smAblaqWall(12.2,plinthY,3.85,[],{t:.46,mode:'basalt'}));
  W(8.16,0,.95,PI*.5,()=>smAblaqWall(12.2,plinthY,3.85,[],{t:.46,mode:'basalt'}));

  /* Rear (-z) raised Sword-master viewing iwan reached by compound steps */
  W(0,0,-5.05,0,()=>{
   svNoWalk(()=>box('basalt',0,plinthY,0,16.4,.66,4.2,P('basaltDark')));
   box('paving',0,iwanY-.10,0,16.4,.10,4.2,P('paving'));
   smHollowAblaq(16.4,4.2,iwanY,wallH,{
    t:.50,
    floor:false,
    front:[
     {x:0,y:iwanY,w:4.25,h:4.55,kind:'arch'},
     {x:-5.2,y:iwanY+1.45,w:1.35,h:2.15,kind:'window',glassKind:'lit'},
     {x:5.2,y:iwanY+1.45,w:1.35,h:2.15,kind:'window',glassKind:'lit'}
    ],
    back:[],
    left:[],
    right:[]
   });
   smParapet(16.6,4.4,iwanY+wallH,{});
  });
  smCompoundStair(0,-1.63,plinthY,iwanY,PI,{w:2.8,going:.33});

  /* Practice peles, weapon racks & Giant stone trial weights set to left/right of the central drill axis */
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    for(const pz of [1.2,3.6]){
     cyl('timber',sx*4.65,plinthY+.02,pz,.18,2.35,P('timber'),8,.16,false);
     cyl('thatch',sx*4.65,plinthY+1.05,pz,.28,.85,P('thatch'),10,.28,false);
    }
    cyl('basalt',sx*5.45,plinthY+.02,-1.45,.48,.68,P('basaltDark'),10,.42,false);
    ring('iron',sx*5.45,plinthY+.78,-1.45,.18,.04,P('iron'),0,PI*.5,0,10);
   }
  });

  smWalkTarget('approach',0,0,9.10,{outside:true});
  smWalkTarget('sand-arena',0,plinthY,2.15,{});
  smWalkTarget('masters-iwan',0,iwanY,-5.05,{});
 }
});

/* 7. sm_armoury: iron-barred vaulted arsenal & saltpeter magazine with heavy buttressed basalt blast roof */
defBuilding({
 key:'sm_armoury',
 name:'Vaulted citadel armoury and magazine',
 seed:8327,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.4,
 w:15.2,
 d:15.6,
 h:11.6,
 tags:{types:['military','industry'],wealth:'rich',style:SM_STYLES.state,role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_armoury);
  const plinthY=.88,wallH=5.45,roofY=plinthY+wallH;
  W(0,0,-.55,0,()=>{
   smPlinth(13.2,11.2,plinthY,{batter:.52,ablaqQuoins:true});
   smHollowAblaq(12.0,10.0,plinthY,wallH,{
    t:.64,
    mode:'basalt',
    front:[
     {x:0,y:plinthY,w:2.55,h:4.55,kind:'door'},
     {x:-3.85,y:plinthY+2.65,w:.48,h:1.35,kind:'window',glassKind:'smoked',bars:true,jali:false},
     {x:3.85,y:plinthY+2.65,w:.48,h:1.35,kind:'window',glassKind:'smoked',bars:true,jali:false}
    ],
    back:[{x:0,y:plinthY+2.75,w:.52,h:1.35,kind:'window',glassKind:'smoked',bars:true,jali:false}],
    left:[{x:0,y:plinthY+2.75,w:.52,h:1.35,kind:'window',glassKind:'smoked',bars:true,jali:false}],
    right:[{x:0,y:plinthY+2.75,w:.52,h:1.35,kind:'window',glassKind:'smoked',bars:true,jali:false}]
   });
   smGiantPortal(0,plinthY,5.00,0,2.40,SM_GIANT_DOOR,{
    kattu:true,mk:'iron',col:0x2f3034,style:'banded',name:'armoury-blast-door'
   });
   smParapet(12.2,10.2,roofY,{});
   /* Stepped stone blast vault cap over the magazine roof */
   svNoWalk(()=>{
    box('basalt',0,roofY,0,8.8,.52,7.2,P('basaltDark'));
    box('travertine',0,roofY+.52,0,6.4,.42,5.2,P('travShade'));
   });
   FURNISH('generic_barrel',-3.85,plinthY+.02,-2.85,0);
   FURNISH('generic_keg',-2.85,plinthY+.02,-2.85,0);
   FURNISH('generic_strongbox',3.85,plinthY+.02,-2.85,-PI*.5);
   FURNISH('generic_crate',3.85,plinthY+.02,2.45,-PI*.5);
  });

  smCompoundStair(0,6.99,0,plinthY,PI,{w:2.9,going:.34});
  smWalkTarget('approach',0,0,7.35,{outside:true});
  smWalkTarget('magazine',0,plinthY,-.55,{});
 }
});

/* 8. sm_gorge_bridge_tower: pointed-arch ablaq canyon bridge span + Giant toll/cable-ferry guard tower */
defBuilding({
 key:'sm_gorge_bridge_tower',
 name:'Gorge bridgehead and ferry toll-tower',
 seed:8328,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.8,
 w:19.6,
 d:13.8,
 h:16.4,
 tags:{types:['military','infrastructure'],wealth:'rich',style:SM_STYLES.state,job:'customs',role:'defence',lit:true},
 build(){
  smBindRec(DEFS.sm_gorge_bridge_tower);
  const deckY=1.36,towerH=7.85,roofY=deckY+towerH;

  /* 1. Pointed-arch ablaq canyon bridge deck spanning along X from -8.4 to +8.4, approached from +z toll ramp */
  W(0,0,-.35,0,()=>{
   /* Bridge abutments & soaring pointed gorge arch underneath the deck */
   svNoWalk(()=>{
    box('basalt',-6.85,0,0,2.9,deckY-.2,5.6,P('basaltDark'));
    box('basalt',6.85,0,0,2.9,deckY-.2,5.6,P('basaltDark'));
    W(0,0,2.45,0,()=>smAblaqArch(11.2,deckY+.15,.68,{openW:8.4,springY:.05,voussoirs:15}));
    W(0,0,-2.45,0,()=>smAblaqArch(11.2,deckY+.15,.68,{openW:8.4,springY:.05,voussoirs:15}));
    /* Low bridge parapets on +z and -z edges outside the central toll-ramp opening */
    box('basalt',-5.65,deckY,2.62,4.9,.72,.32,P('basalt'));
    box('basalt',5.65,deckY,2.62,4.9,.72,.32,P('basalt'));
    box('basalt',-5.65,deckY,-2.62,4.9,.72,.32,P('basalt'));
    box('basalt',5.65,deckY,-2.62,4.9,.72,.32,P('basalt'));
    /* Heavy timber-and-bronze gorge cable-ferry windlass capstan on the east bridgehead */
    W(6.25,deckY+.02,0,0,()=>{
     cyl('basalt',0,0,0,.78,.32,P('basaltDark'),8,.72,false);
     cyl('timber',0,.32,0,.34,1.25,P('timber'),10,.30,false);
     beam('cedar',[-1.15,1.28,0],[1.15,1.28,0],.07,P('cedar'));
     beam('cedar',[0,1.28,-1.15],[0,1.28,1.15],.07,P('cedar'));
     cord('iron',[[0,.85,0],[2.35,.25,0]],.03,P('iron'));
    });
   });
   /* Walkable cobble bridge deck */
   box('cobble',0,deckY-.22,0,16.8,.22,5.6,P('cobble'));

   /* 2. Central fortified Giant toll-arch tower straddling the bridge deck */
   smHollowAblaq(6.6,6.4,deckY,towerH,{
    t:.56,
    front:[{x:0,y:deckY,w:2.65,h:4.65,kind:'door'}],
    back:[{x:0,y:deckY+2.45,w:.82,h:1.95,kind:'window',glassKind:'lit',bars:true}],
    left:[{x:0,y:deckY,w:2.85,h:4.75,kind:'arch'}],
    right:[{x:0,y:deckY,w:2.85,h:4.75,kind:'arch'}]
   });
   smGiantPortal(0,deckY,3.20,0,2.45,4.50,{
    kattu:true,mk:'iron',col:0x36383e,style:'grille',ajar:1.05,name:'bridge-toll-gate'
   });
   smParapet(6.8,6.6,roofY,{});
   smSocket('banner',-2.45,deckY+4.25,3.35,0,{scale:1.05});
   smSocket('banner',2.45,deckY+4.25,3.35,0,{scale:1.05});
  });

  /* Front compound approach stair from +z road up to the bridge toll gate */
  smCompoundStair(0,5.57,0,deckY,PI,{w:3.2,going:.34});

  smWalkTarget('south-road',0,0,6.25,{outside:true});
  smWalkTarget('toll-vault',0,deckY,-.35,{});
  smWalkTarget('west-span',-6.25,deckY,-.35,{});
  smWalkTarget('east-capstan',4.85,deckY,-.35,{});
 }
});
