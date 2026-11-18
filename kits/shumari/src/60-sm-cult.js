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
