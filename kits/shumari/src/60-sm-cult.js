/* prefix: sm */
// ================================================================= SHUMARI REGIMENTAL & ANCESTOR MONUMENTS (Phase SM2)
// sm_regiment_qubba (v=0 right-handed spiral dome, v=1 carved star-relief dome) and sm_doriyan_stele (mirror-handed -1 spiral dome).

/* Interior sacred fittings for sm_regiment_qubba: columbarium ash-urn niches, ancestor blade-racks, and eternal oil braziers */
function smQubbaInterior(chamberW,chamberD){
 const hw=chamberW*.5-.32,hd=chamberD*.5-.32;
 svNoWalk(()=>{
  /* Woven crimson-and-gold highland kilim sanctuary carpet */
  medallion('kilim',0,.03,0,4.8,{ry:0});

  /* Left & right tiered basalt columbarium ash-urn niches */
  for(const sx of [-1,1]){
   W(sx*(hw-.12),.02,-.2,sx>0?-PI*.5:PI*.5,()=>{
    box('basalt',0,0,0,4.4,3.45,.34,P('basaltDark'));
    box('travertine',0,3.45,0,4.6,.18,.40,P('travertine'));
    for(let row=0;row<3;row++){
     const ny=.42+row*.98;
     box('travertine',0,ny-.06,.06,4.1,.06,.30,P('travShade'));
     for(let col=-2;col<=2;col++){
      const nx=col*.78;
      box('basalt',nx+.39,ny,.04,.12,.82,.26,P('basalt'));
      /* Cinerary bronze or alabaster-travertine regiment ash urn */
      const isBronze=(row+col+4)%2===0;
      cyl(isBronze?'bronzeCast':'ashlar',nx,ny,0.06,.12,.34,isBronze?P('bronze'):P('ashlar'),12,.16,false);
      cyl('gold',nx,ny+.34,0.06,.09,.06,P('gold'),12,.06,false);
      sph(isBronze?'bronze':'travertine',nx,ny+.42,0.06,.065,isBronze?P('bronze'):P('travertine'),.8,10);
     }
    }
   });
  }

  /* Rear (-z) mihrab-style memorial niche & flanking crimson-lacquer ancestor blade-racks (blades point-up) */
  W(0,.02,-(hd-.14),0,()=>{
   box('basalt',0,0,0,2.5,4.1,.36,P('basaltDark'));
   for(const sx of [-1,1]){
    cyl('travertine',sx*1.05,.18,.18,.10,2.85,P('travertine'),12,null,false);
    box('bronzeCast',sx*1.05,3.03,.18,.24,.12,.24,P('bronze'));
   }
   W(0,3.15,.08,0,()=>smAblaqArch(2.4,.95,.34,{openW:1.65,springY:.08,voussoirs:11}));
   box('frieze',0,4.12,.08,2.6,.32,.34,0xffffff);
   /* Hanging sanctuary bronze oil lamp inside memorial niche */
   cord('bronze',[[0,4.0,.22],[0,2.75,.22]],.014,P('bronze'));
   cyl('bronzeCast',0,2.55,.22,.16,.14,P('bronze'),12,.08,false);
   sph('glow',0,2.66,.22,.075,P('flame'),1.2,10);
   haloAt(0,2.66,.22,0xffb85c,false);

   /* Twin crimson-lacquered ancestor blade-racks flanking the memorial niche */
   for(const sx of [-1,1]){
    W(sx*2.65,0,.22,0,()=>{
     box('basalt',0,0,0,1.55,.22,.56,P('basalt'));
     for(const rx of [-.64,.64]){
      box('lacquer',rx,.22,0,.10,2.25,.14,P('lacquer'));
      box('gold',rx,2.47,0,.14,.08,.18,P('gold'));
     }
     box('lacquer',0,.62,0,1.46,.09,.22,P('lacquer'));
     box('lacquer',0,1.52,0,1.46,.09,.22,P('lacquer'));
     /* Five notched Giant & regiment service blades standing point-up per rack */
     for(let b=-2;b<=2;b++){
      const bx=b*.26;
      const isBronzeB=Math.abs(b)===1;
      box('cedar',bx,.26,0,.045,.42,.055,P('cedar'));
      box('bronzeCast',bx,.68,0,.18,.045,.07,P('bronze'));
      box(isBronzeB?'bronze':'iron',bx,.725,0,.068,1.38,.018,isBronzeB?P('bronze'):P('iron'));
      cone(isBronzeB?'bronze':'iron',bx,2.105,0,.036,.24,isBronzeB?P('bronze'):P('iron'),4);
     }
    });
   }
  });
 });

 /* Twin octagonal basalt-and-bronze eternal oil braziers flanking the central walk aisle */
 for(const sx of [-1,1]){
  W(sx*2.35,.02,-.6,0,()=>{
   box('basalt',0,0,0,.92,.72,.92,P('basaltDark'));
   svNoWalk(()=>{
    cyl('travertine',0,.72,0,.48,.16,P('travertine'),8,.54,false);
    cyl('bronzeCast',0,.88,0,.52,.26,P('bronze'),8,.62,false);
    cyl('glow',0,1.12,0,.42,.04,P('ember'),12,null,false);
    cone('glow',0,1.14,0,.18,.42,P('flame'),10);
   });
   haloAt(0,1.36,0,0xff9438,true);
  });
 }

 /* Catalog furnishings (>= 6 pieces along perimeter walls, keeping central walk path wide open) */
 FURNISH('generic_strongbox',-3.3,.02,2.8,PI*.5);
 FURNISH('generic_chest',3.3,.02,2.8,-PI*.5);
 FURNISH('generic_storage_jar',-3.6,.02,-3.4,PI*.25);
 FURNISH('generic_storage_jar',3.6,.02,-3.4,-PI*.25);
 FURNISH('generic_candle_supply',-1.45,.02,-3.7,0);
 FURNISH('generic_lamp_oil',1.45,.02,-3.7,0);
 FURNISH('generic_fruit_bowl',0,.02,-3.75,0);
}

defBuilding({
 key:'sm_regiment_qubba',
 name:'Regimental qubba',
 seed:8101,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:8.8,
 w:14.2,
 d:17.2,
 h:19.6,
 tags:{types:['religious','funerary'],wealth:'rich',style:SM_STYLES.sword,role:'sacred',lit:true},
 build(o){
  smBindRec(DEFS.sm_regiment_qubba);
  const v=(o&&o.v)|0;
  const domeStyle=v===1?'carved':'spiral';
  const plinthY=1.20;
  const wallH=5.80;
  const roofY=plinthY+wallH;

  /* 1. Battered ishigaki basalt plinth + compound Giant/human front flight */
  W(0,0,-.8,0,()=>smPlinth(12.8,13.6,plinthY,{ablaqQuoins:true}));
  smCompoundStair(0,8.04,0,plinthY,PI,{w:3.0,going:.34});

  /* 2. Hollow walkable 10.4 x 10.4 m ablaq mausoleum chamber */
  const sideWins=[
   {x:-2.35,y:plinthY+1.45,w:1.35,h:2.55,kind:'window',glassKind:'lit',bars:true},
   {x:2.35,y:plinthY+1.45,w:1.35,h:2.55,kind:'window',glassKind:'lit',bars:true}
  ];
  const backWins=[
   {x:-3.05,y:plinthY+1.65,w:1.15,h:2.25,kind:'window',glassKind:'lit',bars:true},
   {x:3.05,y:plinthY+1.65,w:1.15,h:2.25,kind:'window',glassKind:'lit',bars:true}
  ];
  W(0,0,-1.0,0,()=>{
   smHollowAblaq(10.4,10.4,plinthY,wallH,{
    t:.48,
    front:[{x:0,y:plinthY,w:2.65,h:4.65,kind:'door'}],
    back:backWins,
    left:sideWins,
    right:sideWins
   });

   /* 3. Flat snow-load roof with shurafat merlons & central 5.8 x 5.8 m drum throat opening */
   smParapet(10.6,10.6,roofY,{
    hole:{x0:-2.9,x1:2.9,z0:-2.9,z1:2.9},
    skipFrontW:5.9
   });

   /* 4. Soaring Mamluk pishtaq portal on +z with unlocked 4.4 m Giant double-doors */
   smPishtaq(0,plinthY,5.20,{
    w:5.8,
    h:8.6,
    d:1.35,
    doorW:2.45,
    doorH:SM_GIANT_DOOR,
    giant:true,
    hollow:true,
    socketKind:'banner',
    doorName:'qubba-portal'
   });

   /* 5. Mamluk Turkish-triangle + 1-over-2 qamariyya transition drum + pointed dome */
   const drum=smDrum(0,roofY,0,9.6,{
    domeD:7.8,
    transH:2.25,
    clerH:1.65,
    hollow:true,
    windows:12
   });
   smDome(0,drum.topY,0,drum.domeD,{
    style:domeStyle,
    hand:1,
    h:6.45,
    ribs:22,
    turns:.45,
    hollow:true
   });

   /* 6. Interior columbarium niches, ancestor blade-racks, eternal braziers & catalog offerings */
   W(0,plinthY,0,0,()=>smQubbaInterior(10.4,10.4));
  });

  /* 7. Outside & inside walk targets for reachability audit */
  smWalkTarget('approach',0,0,8.35,{outside:true});
  smWalkTarget('porch',0,plinthY,4.95,{});
  smWalkTarget('sanctuary',0,plinthY,-1.0,{});
  smWalkTarget('memorial-niche',0,plinthY,-3.6,{});
 }
});

/* Open canopy memorial pavilion over three NW-facing basalt impactite steles under a mirror-handed (-1) spiral dome */
defBuilding({
 key:'sm_doriyan_stele',
 name:'Doriyan mirror cenotaph',
 seed:8105,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.4,
 w:11.6,
 d:13.6,
 h:16.2,
 tags:{types:['religious','funerary','statue'],wealth:'rich',style:SM_STYLES.sword,role:'sacred',lit:true},
 build(){
  smBindRec(DEFS.sm_doriyan_stele);
  const plinthY=.92;
  const pierH=4.85;
  const roofY=plinthY+pierH;

  /* 1. Battered basalt plinth + compound Giant/human front stair */
  W(0,0,-.5,0,()=>smPlinth(9.4,9.4,plinthY,{ablaqQuoins:true}));
  smCompoundStair(0,6.24,0,plinthY,PI,{w:2.6,going:.34});

  W(0,0,-.5,0,()=>{
   /* Thin decorative travertine inlay (smPlinth provides the walkable KWALK floor at plinthY) */
   svNoWalk(()=>{
    box('travertine',0,plinthY-.01,0,7.8,.03,7.8,P('travShade'));
    medallion('kilim',0,plinthY+.03,.6,3.2,{round:true});
   });

   /* 2. Eight heavy ablaq perimeter piers framing four >= 4.4 m Giant pointed archways */
   const hs=3.75;
   const pierPos=[
    [-hs,hs],[-1.55,hs],[1.55,hs],[hs,hs],
    [-hs,-hs],[-1.55,-hs],[1.55,-hs],[hs,-hs],
    [-hs,-1.55],[-hs,1.55],[hs,-1.55],[hs,1.55]
   ];
   for(const [px,pz] of pierPos){
    box('basalt',px,plinthY+.04,pz,.66,pierH-.08,.66,P('basalt'));
    svNoWalk(()=>{
     const nc=12,ch=pierH/nc;
     for(let c=0;c<nc;c++){
      const m=smAblaqCourse(c);
      box(m.mk,px,plinthY+c*ch,pz,.72,ch,.72,m.col);
     }
     box('chiselled',px,plinthY+pierH-.18,pz,.80,.18,.80,P('travertine'));
    });
   }

   /* Pointed ablaq voussoir arches on all four faces (clear height 4.45 m) */
   for(let f=0;f<4;f++){
    W(0,plinthY,0,f*PI*.5,()=>{
     W(0,3.15,hs,0,()=>smAblaqArch(3.10,1.70,.68,{openW:2.42,springY:.12,voussoirs:13}));
     svNoWalk(()=>{
      box('frieze',0,pierH-.22,hs,8.1,.24,.74,0xffffff);
      /* Corner spandrel masonry panels between corner and inner piers */
      for(const sx of [-1,1]){
       for(let c=0;c<4;c++){
        const m=smAblaqCourse(c+2);
        box(m.mk,sx*2.65,3.35+c*.37,hs,1.52,.37,.66,m.col);
       }
      }
     });
    });
   }

   /* Unlocked 4.4 m tall bronze-grille ceremonial Giant gate standing open on the +z archway */
   svDoorway(0,plinthY+.02,hs,0,2.40,SM_GIANT_DOOR,{
    hollow:true,
    locked:false,
    split:true,
    mk:'bronzeCast',
    col:0x9a7432,
    style:'grille',
    hwCol:0xb8861b,
    ajar:1.08,
    name:'doriyan-arch-gate'
   });
   door(0,plinthY+.02,hs,0,2.40,SM_GIANT_DOOR);

   /* 3. Shurafat parapet + octagonal transition drum + MIRROR-HANDED (hand = -1) spiral dome */
   smParapet(8.3,8.3,roofY,{
    hole:{x0:-2.35,x1:2.35,z0:-2.35,z1:2.35}
   });
   const drum=smDrum(0,roofY,0,7.6,{
    domeD:6.2,
    transH:1.85,
    clerH:1.35,
    hollow:true,
    windows:8
   });
   smDome(0,drum.topY,0,drum.domeD,{
    style:'spiral',
    hand:-1,
    h:5.08,
    ribs:20,
    turns:.45,
    hollow:true
   });

   /* 4. Three polished black basalt impactite steles angled NW (3*PI/4) toward lost Doriyan */
   W(0,plinthY+.02,-1.35,3*PI*.25,()=>{
    box('basalt',0,0,0,2.8,.74,1.35,P('basaltDark'));
    const steles=[[-.86,2.45,.46],[0,3.15,.56],[.86,2.62,.48]];
    for(const [sx,sh,sw] of steles){
     box('basalt',sx,.74,0,sw,sh-.34,.26,P('basaltDark'));
     svNoWalk(()=>{
      cone('basalt',sx,.74+sh-.34,0,sw*.54,.38,P('basaltDark'),4);
      box('gold',sx,1.55,.135,sw*.68,.06,.02,P('gold'));
      ring('bronzeCast',sx,2.02,.14,.14,.022,P('bronze'),0,PI*.5,0,12);
     });
    }
   });

   /* Eternal bronze memorial oil lamp bowl before the steles */
   W(0,plinthY+.02,-.05,0,()=>{
    box('basalt',0,0,0,.72,.74,.72,P('basaltDark'));
    svNoWalk(()=>{
     cyl('bronzeCast',0,.74,0,.42,.22,P('bronze'),12,.50,false);
     cyl('glow',0,.94,0,.32,.04,P('ember'),10,null,false);
     cone('glow',0,.96,0,.14,.34,P('flame'),10);
    });
    haloAt(0,1.18,0,0xff9438,true);
   });

   /* Catalog memorial offerings */
   FURNISH('generic_candle_supply',-2.3,plinthY+.02,-2.3,PI*.25);
   FURNISH('generic_lamp_oil',2.3,plinthY+.02,-2.3,-PI*.25);
   FURNISH('generic_storage_jar',-2.4,plinthY+.02,2.1,PI*.75);
   FURNISH('generic_fruit_bowl',2.4,plinthY+.02,2.1,-PI*.75);
  });

  smWalkTarget('approach',0,0,6.65,{outside:true});
  smWalkTarget('pavilion',0,plinthY,1.15,{});
 }
});

/* 3. sm_hall_of_blades: twin-domed symmetric Mamluk waqf complex (refs/03) with central pishtaq, snowmelt court & twin carved domes */
defBuilding({
 key:'sm_hall_of_blades',
 name:'Twin-domed Hall of Blades',
 seed:8102,
 cls:'building',
 cut:true,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:7.4,
 w:24.8,
 d:18.6,
 h:19.6,
 tags:{types:['religious','funerary'],wealth:'rich',style:SM_STYLES.sword,role:'sacred',lit:true},
 build(){
  smBindRec(DEFS.sm_hall_of_blades);
  const plinthY=1.15,wallH=6.15,roofY=plinthY+wallH;
  W(0,0,-.85,0,()=>{
   smPlinth(22.6,14.2,plinthY,{ablaqQuoins:true});

   /* Central vestibule & snowmelt court flanked by West (human captains) & East (Gedu-su Giant captains) domed mausolea */
   smHollowAblaq(21.4,12.4,plinthY,wallH,{
    t:.52,
    front:[
     {x:0,y:plinthY,w:2.75,h:4.75,kind:'door'},
     {x:-6.6,y:plinthY+1.55,w:1.35,h:2.55,kind:'window',glassKind:'lit',bars:true},
     {x:-4.2,y:plinthY+1.55,w:1.25,h:2.45,kind:'window',glassKind:'lit',bars:true},
     {x:4.2,y:plinthY+1.55,w:1.25,h:2.45,kind:'window',glassKind:'lit',bars:true},
     {x:6.6,y:plinthY+1.55,w:1.35,h:2.55,kind:'window',glassKind:'lit',bars:true}
    ],
    back:[
     {x:-6.2,y:plinthY+1.65,w:1.35,h:2.45,kind:'window',glassKind:'lit',bars:true},
     {x:0,y:plinthY+1.75,w:1.85,h:2.65,kind:'window',glassKind:'lit',bars:true},
     {x:6.2,y:plinthY+1.65,w:1.35,h:2.45,kind:'window',glassKind:'lit',bars:true}
    ],
    left:[
     {x:-2.4,y:plinthY+1.55,w:1.30,h:2.45,kind:'window',glassKind:'lit',bars:true},
     {x:2.4,y:plinthY+1.55,w:1.30,h:2.45,kind:'window',glassKind:'lit',bars:true}
    ],
    right:[
     {x:-2.4,y:plinthY+1.55,w:1.30,h:2.45,kind:'window',glassKind:'lit',bars:true},
     {x:2.4,y:plinthY+1.55,w:1.30,h:2.45,kind:'window',glassKind:'lit',bars:true}
    ]
   });

   /* Continuous Sumaru-kattu epigraphic belt & corner engaged octagonal Mamluk buttress turrets (refs/03) */
   svNoWalk(()=>{
    box('frieze_kattu',0,roofY-.58,6.24,21.5,.38,.12,0xffffff);
    box('frieze_kattu',0,roofY-.58,-6.24,21.5,.38,.12,0xffffff);
    for(const sx of [-1,1])for(const sz of [-1,1]){
     const tx=sx*10.72,tz=sz*6.22;
     cyl('basalt',tx,plinthY,tz,.68,wallH+.85,P('basaltDark'),8,.64,false);
     cyl('travertine',tx,roofY+.85,tz,.74,.18,P('travertine'),8,.78,false);
     cone('domeCarved',tx,roofY+1.03,tz,.68,1.15,P('domeStone'),8);
    }
   });

   /* Central soaring Mamluk pishtaq portal */
   smPishtaq(0,plinthY,6.20,{
    w:6.2,h:9.2,d:1.42,doorW:2.55,doorH:4.50,giant:true,hollow:true,socketKind:'banner',doorName:'blades-pishtaq'
   });

   /* Roof parapet with twin dome wells + central skylight oculus */
   smWellRoof(21.6,12.6,roofY);

   /* Twin symmetric carved geometric star-relief Mamluk domes (refs/03) */
   for(const sx of [-1,1]){
    const drum=smDrum(sx*6.0,roofY,0,8.4,{domeD:6.8,transH:2.05,clerH:1.50,hollow:true,windows:12});
    smDome(sx*6.0,drum.topY,0,drum.domeD,{style:'carved',h:5.58,hollow:true});
   }

   /* Central octagonal snowmelt ablution court + ancestor-roll colonnade & twin blade sanctuaries */
   svNoWalk(()=>{
    cyl('travertine',0,plinthY+.02,.85,1.05,.32,P('travertine'),8,1.0,false);
    cyl('paving',0,plinthY+.32,.85,.86,.05,P('glass'),8,null,false);
    for(const sx of [-1,1]){
     medallion('kilim',sx*6.0,plinthY+.03,0,4.2,{ry:0});
     /* Ancestor blade-rack & bronze brazier in each twin hall */
     W(sx*6.0,plinthY+.02,-4.65,0,()=>{
      box('lacquer',0,0,0,2.85,3.45,.34,P('lacquer'));
      box('frieze_kattu',0,3.45,0,2.95,.32,.38,0xffffff);
      for(let b=-2;b<=2;b++){
       const isG=sx>0;
       const bh=isG?1.85:1.35;
       box(b%2===0?'bronze':'iron',b*.44,.55,.20,.075,bh,.022,b%2===0?P('bronze'):P('iron'));
       cone('gold',b*.44,.55+bh,.20,.042,.24,P('gold'),4);
      }
     });
     cyl('bronzeCast',sx*3.15,plinthY+.02,-2.25,.42,.86,P('bronze'),8,.48,false);
     cone('glow',sx*3.15,plinthY+.88,-2.25,.18,.36,P('flame'),8);
     haloAt(sx*3.15,plinthY+1.12,-2.25,0xff983c,true);
    }
   });

   FURNISH('generic_strongbox',-8.85,plinthY+.02,-4.45,PI*.5);
   FURNISH('generic_strongbox',8.85,plinthY+.02,-4.45,-PI*.5);
   FURNISH('generic_chest',-8.85,plinthY+.02,3.85,PI*.5);
   FURNISH('generic_chest',8.85,plinthY+.02,3.85,-PI*.5);
   FURNISH('generic_candle_supply',-3.45,plinthY+.02,-4.75,0);
   FURNISH('generic_lamp_oil',3.45,plinthY+.02,-4.75,0);
   FURNISH('generic_writing_supplies',0,plinthY+.02,-4.85,0);
  });

  smCompoundStair(0,8.29,0,plinthY,PI,{w:3.4,going:.34});
  smWalkTarget('approach',0,0,8.65,{outside:true});
  smWalkTarget('central-court',0,plinthY,-1.95,{});
  smWalkTarget('west-sanctuary',-6.0,plinthY,-.85,{});
  smWalkTarget('east-giant-sanctuary',6.0,plinthY,-.85,{});
 }
});

/* Helper for twin-dome roof slab with shurafat merlons on sm_hall_of_blades */
function smWellRoof(w,d,y){
 svNoWalk(()=>{
  /* Outer frame & central bridge slab leaving twin 5.2x5.2 m openings at x = -6.0 and +6.0 */
  box('paving',0,y-.26,4.45,w,.26,3.7,P('paving'));
  box('paving',0,y-.26,-4.45,w,.26,3.7,P('paving'));
  box('paving',0,y-.26,0,6.8,.26,5.2,P('paving'));
  box('paving',-9.7,y-.26,0,2.2,.26,5.2,P('paving'));
  box('paving',9.7,y-.26,0,2.2,.26,5.2,P('paving'));
 });
 smParapet(w,d,y,{roofSlab:false,skipFrontW:6.3});
}

/* 4. sm_sabil_shrine: street-corner domed snowmelt fountain behind tracery bronze grilles + upper crimson cadet kuttab loggia */
defBuilding({
 key:'sm_sabil_shrine',
 name:'Sabil snowmelt fountain and kuttab',
 seed:8103,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:5.4,
 w:12.6,
 d:15.0,
 h:16.8,
 tags:{types:['religious','fountain'],wealth:'rich',style:SM_STYLES.sword,role:'sacred',lit:true},
 build(){
  smBindRec(DEFS.sm_sabil_shrine);
  const plinthY=.92,gH=5.45,uY=plinthY+gH,kH=2.85,roofY=uY;
  W(0,0,-.65,0,()=>{
   smPlinth(10.6,10.8,plinthY,{ablaqQuoins:true});
   smHollowAblaq(9.6,9.8,plinthY,gH,{
    t:.48,
    front:[
     {x:-1.95,y:plinthY,w:2.48,h:4.52,kind:'door'},
     {x:2.25,y:plinthY+.82,w:2.35,h:2.55,kind:'window',glassKind:'smoked',jali:false}
    ],
    right:[
     {x:-2.15,y:plinthY+.82,w:2.35,h:2.55,kind:'window',glassKind:'smoked',jali:false},
     {x:2.15,y:plinthY+1.55,w:1.22,h:2.25,kind:'window',glassKind:'lit'}
    ],
    back:[
     {x:-2.15,y:plinthY+1.55,w:1.22,h:2.25,kind:'window',glassKind:'lit'},
     {x:2.15,y:plinthY+1.55,w:1.22,h:2.25,kind:'window',glassKind:'lit'}
    ],
    left:[{x:0,y:plinthY+1.55,w:1.35,h:2.35,kind:'window',glassKind:'lit'}]
   });
   /* Street-corner twin cast-bronze tracery grilles dispensing snowmelt water on +z and +x */
   smSabilGrille(2.25,plinthY,4.92,0,2.25,2.55);
   smSabilGrille(4.82,plinthY,2.15,PI*.5,2.25,2.55);
   smGiantPortal(-1.95,plinthY,4.90,0,2.35,SM_GIANT_DOOR,{
    kattu:true,mk:'lacquer',col:0xb83234,style:'banded',name:'sabil-giant-portal'
   });

   smParapet(9.8,10.0,roofY,{hole:{x0:-3.6,x1:.2,z0:-2.6,z1:1.2}});
   /* Right-handed (+1) spiral qubba dome over the west shrine bay */
   const drum=smDrum(-1.7,roofY,-.7,6.2,{domeD:5.0,transH:1.65,clerH:1.22,hollow:true,windows:10});
   smDome(-1.7,drum.topY,-.7,drum.domeD,{style:'spiral',hand:1,h:4.12,ribs:20,turns:.45,hollow:true});

   /* Upper open crimson-lacquered cadet recitation loggia (kuttab) over the east sabil corner */
   W(2.35,roofY,1.65,0,()=>{
    svNoWalk(()=>{
     box('lacquer',0,0,0,4.4,.18,5.6,P('lacquer'));
     for(const [px,pz] of [[-1.95,2.55],[0,2.55],[1.95,2.55],[-1.95,-2.55],[1.95,-2.55],[1.95,0]]){
      box('lacquer',px,.18,pz,.18,kH,.18,P('lacquer'));
      box('gold',px,kH-.18,pz,.24,.12,.24,P('gold'));
     }
     box('jali',0,.18,2.55,3.9,.86,.04,P('travertine'));
     box('jali',1.95,.18,0,.04,.86,5.1,P('travertine'));
     box('lacquer',0,kH+.18,0,4.7,.22,5.9,P('lacquer'));
     psurf('slate',(u,v)=>[lerp(-2.55,2.55,u),kH+.40+(1-Math.abs(u-.5)*2)*.48,lerp(-3.15,3.15,v)],4,2,P('slate'),{up:true});
    });
   });
   FURNISH('generic_water',1.85,plinthY+.02,1.65,0);
   FURNISH('generic_storage_jar',2.85,plinthY+.02,1.65,0);
  });

  smCompoundStair(-1.95,6.79,0,plinthY,PI,{w:2.8,going:.34});
  smWalkTarget('approach',-1.95,0,7.15,{outside:true});
  smWalkTarget('sabil-hall',-1.75,plinthY,-1.35,{});
 }
});

/* 5. sm_ordeal_gate: stark dark-basalt initiation pishtaq arch & +1 spiral dome astride the Urudiru trial ramp */
defBuilding({
 key:'sm_ordeal_gate',
 name:'Ordeal initiation gate',
 seed:8104,
 cls:'building',
 cut:false,
 giant:true,
 caste:SM_CASTES.sword,
 vaultH:6.0,
 w:13.8,
 d:12.6,
 h:17.8,
 tags:{types:['religious','military'],wealth:'rich',style:SM_STYLES.state,role:'sacred',lit:true},
 build(){
  smBindRec(DEFS.sm_ordeal_gate);
  const plinthY=.84,wallH=6.05,roofY=plinthY+wallH;
  smPlinth(11.8,8.6,plinthY,{ablaqQuoins:false});
  /* Front & back compound flights so initiates walk straight through the gate */
  smCompoundStair(0,5.66,0,plinthY,PI,{w:3.2,going:.34});
  smCompoundStair(0,-5.66,0,plinthY,0,{w:3.2,going:.34});

  /* Austere dark-basalt gatehouse bastions flanking the Giant vaulted passage */
  smHollowAblaq(11.0,7.6,plinthY,wallH,{
   t:.58,
   mode:'basalt',
   front:[
    {x:0,y:plinthY,w:2.85,h:4.75,kind:'door'},
    {x:-3.65,y:plinthY+2.25,w:.62,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false},
    {x:3.65,y:plinthY+2.25,w:.62,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false}
   ],
   back:[
    {x:0,y:plinthY,w:2.85,h:4.75,kind:'arch'},
    {x:-3.65,y:plinthY+2.25,w:.62,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false},
    {x:3.65,y:plinthY+2.25,w:.62,h:1.85,kind:'window',glassKind:'lit',bars:true,jali:false}
   ],
   left:[{x:0,y:plinthY+2.35,w:.68,h:1.85,kind:'window',glassKind:'smoked',bars:true,jali:false}],
   right:[{x:0,y:plinthY+2.35,w:.68,h:1.85,kind:'window',glassKind:'smoked',bars:true,jali:false}]
  });

  /* Stark basalt pishtaq with Sumaru-kattu lintel & open Giant bronze-grille ordeal gates */
  smPishtaq(0,plinthY,3.80,{
   w:5.8,
   h:8.6,
   d:1.15,
   doorW:2.60,
   doorH:4.50,
   giant:true,
   hollow:true,
   doorMk:'bronzeCast',
   doorCol:0x6c5124,
   doorStyle:'grille',
   ajar:1.18,
   socketKind:'shield',
   doorName:'ordeal-gate-leaves'
  });
  svNoWalk(()=>{
   box('frieze_kattu',0,plinthY+5.05,4.96,5.8,.38,.12,0xffffff);
   for(const sx of [-1,1]){
    cyl('basalt',sx*4.15,plinthY+.02,4.15,.44,.86,P('basaltDark'),8,.48,false);
    cone('glow',sx*4.15,plinthY+.88,4.15,.20,.40,P('flame'),8);
   }
  });
  haloAt(-4.15,plinthY+1.15,4.15,0xff8c34,true);
  haloAt(4.15,plinthY+1.15,4.15,0xff8c34,true);

  smParapet(11.2,7.8,roofY,{hole:{x0:-2.35,x1:2.35,z0:-2.35,z1:2.35},skipFrontW:5.9});
  const drum=smDrum(0,roofY,0,6.8,{domeD:5.6,transH:1.78,clerH:1.28,hollow:true,windows:10});
  smDome(0,drum.topY,0,drum.domeD,{style:'spiral',hand:1,h:4.62,ribs:20,turns:.45,hollow:true});

  smWalkTarget('south-ramp',0,0,6.05,{outside:true});
  smWalkTarget('gate-vault',0,plinthY,0,{});
  smWalkTarget('north-ramp',0,0,-6.05,{});
 }
});

/* 6. sm_wayside_cairn: outdoor stepped ablaq blade-pillar & bronze lamp niche (solid roadside shrine marker) */
defBuilding({
 key:'sm_wayside_cairn',
 name:'Wayside ablaq blade cairn',
 seed:8106,
 cls:'building',
 cut:false,
 giant:false,
 solidMarker:true,
 caste:SM_CASTES.sword,
 vaultH:0,
 w:4.8,
 d:5.2,
 h:6.4,
 front:{x:0,z:2.10,yaw:0},
 tags:{types:['religious','statue'],wealth:'middle',style:SM_STYLES.sword,role:'sacred',lit:true},
 build(){
  smBindRec(DEFS.sm_wayside_cairn);
  const stepY=.32;
  /* Walkable low basalt flagstone apron so travellers step cleanly up to the lamp niche */
  box('paving',0,0,0,3.8,stepY,4.0,P('paving'));
  W(0,stepY,-.35,0,()=>{
   /* Central stepped ablaq pillar (radius kept compact so walker stands freely on +z apron) */
   box('basalt',0,0,0,1.45,.62,1.45,P('basaltDark'));
   svNoWalk(()=>{
    for(let c=0;c<8;c++){
     const m=smAblaqCourse(c);
     const w=1.22-c*.035;
     box(m.mk,0,.62+c*.34,0,w,.34,w,m.col);
    }
    box('frieze_kattu',0,3.34,0,1.04,.32,1.04,0xffffff);
    /* Recessed bronze oil-lamp niche on +z with glazed amber wind-pane */
    box('travertine',0,1.35,.52,.64,.82,.22,P('travertine'));
    box('basalt',0,1.43,.56,.44,.64,.18,P('basaltDark'));
    cyl('bronzeCast',0,1.46,.58,.12,.10,P('bronze'),10,.08,false);
    sph('glow',0,1.58,.58,.065,P('flame'),1.2,8);
    /* Notched bronze regimental finial blade crowning the cairn */
    for(let k=0;k<4;k++)smShurafatMerlon(Math.cos(k*PI*.5)*.40,3.66,Math.sin(k*PI*.5)*.40,PI*.5-k*PI*.5,.52);
    cyl('bronzeCast',0,3.66,0,.22,.28,P('bronze'),8,.16,false);
    box('bronze',0,3.94,0,.11,1.35,.028,P('bronze'));
    cone('gold',0,5.29,0,.065,.32,P('gold'),4);
   });
   svPane(0,1.45,.64,0,.40,.58,{kind:'stained',color:0xd89b3c,solid:false});
   haloAt(0,1.58,.62,0xffa844,false);
   smSocket('shield',0,2.55,.52,0,{scale:.75});
  });

  smWalkTarget('roadside',0,0,2.35,{outside:true});
  smWalkTarget('lamp-apron',0,stepY,1.15,{});
 }
});

