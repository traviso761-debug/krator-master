// prefix: ynr
// ================================================================= SPEAR-QUEEN FRONTIER & CLIFF-PASS BASTION (yn-border-fort)
// Inspired by borderfort.jpg + YC2 / yn-cliff-cluster engaged cliff-flush defensive grammar:
//   - Engaged coastal-granite & dark-basalt cliff-scarp shoulders hugging the rear mountain pass (-z)
//   - Battered dark-basalt & pale sea-lime lower enceinte with twin drum/prow corner bastions, blazing bronze
//     beacon-braziers, corbelled parapet walk, and defended machicolated gate-passage (+z)
//   - Soaring 5-tier overhanging annular war-gallery redoubt (borderfort.jpg) swelling outward on stone corbel-fins,
//     sliced up the front axis by a continuous vertical counterpoise lift-spine and crowned by a shallow ribbed
//     sea-lime & verdigris dome with perimeter watch-pinnacles and Twin-Spear finial.

/* Helper: blazing tin-bronze frontier beacon-brazier on stone pedestal */
function ynrBeaconBrazier(x,y,z,s){
 const sc=s==null?1:s,bzCol=P('bronze'),irCol=P('iron');
 ynNoCut(()=>W(x,y,z,0,()=>{
  cyl('ashlar',0,.005,0,.62*sc,.34*sc,P('ashlar'),12);
  for(let i=0;i<3;i++){
   const a=i/3*TAU+.3;
   beam('bronze',[Math.cos(a)*.46*sc,.35*sc,Math.sin(a)*.46*sc],[Math.cos(a)*.30*sc,.98*sc,Math.sin(a)*.30*sc],.07*sc,bzCol,true,6);
  }
  lathe('bronze',0,0,[[.24*sc,.92*sc],[.68*sc,1.22*sc],[.74*sc,1.42*sc]],14,bzCol);
  cyl('iron',0,1.24*sc,0,.54*sc,.14*sc,irCol,12);
  sph('glow',0,1.52*sc,0,.42*sc,0xff9e32,.85,10);
  haloAt(0,1.62*sc,0,0xffa438,true);
  smokeAt(0,2.35*sc,0,{r:.38*sc});
 }));
}

/* Helper: battered dark-basalt & sea-lime Drum/Prow Corner Bastion (with angled stone cutwater prow at +z) */
function ynrProwBastion(cx,cz,r,h,sg){
 const bsCol=P('stoneD'),slCol=P('sealime'),asCol=P('ashlar'),cbCol=P('cobble');
 ynRootSkirt(cx,cz,r,6.2,{mk:'cobble',col:cbCol,plinthH:.48});
 ynFloorDisc(cx,cz,r-.06,.24,'flagstone',P('flagstone'),{seg:16});
 /* lower battered dark-basalt drum + upper pale sea-lime bastion wall */
 ynDrumWall(cx,cz,r-.38,r,.24,h*.52,'stone',bsCol,[
  {a:sg<0?0:PI,w:.95,h:2.0,door:true,open:true},{a:PI/2+sg*.35,w:.36,y:1.35,h:1.15,visor:false}
 ],{visors:false});
 ynDripSkirt(cx,cz,r,.24+h*.52,.36,.18,'slate',P('slate'));
 ynDrumWall(cx,cz,r-.42,r-.04,.24+h*.52,h*.48,'sealime',slCol,[
  {a:PI/2,w:.42,y:.85,h:1.15},{a:PI/2+sg*.55,w:.42,y:.85,h:1.15}
 ]);
 /* triangular stone cutwater / bastion prow projecting toward +z (cleanly outside r+.02) */
 ynNoCut(()=>svNoWalk(()=>{
  const prowPts=[[cx-.95,cz+r-.22],[cx,cz+r+1.18],[cx+.95,cz+r-.22]];
  prism('stone',prowPts,.02,.24+h*.50,bsCol);
  prism('ashlar',[[cx-.82,cz+r-.18],[cx,cz+r+1.04],[cx+.82,cz+r-.18]],.25+h*.50,.20+h,asCol);
 }));
 /* corbelled parapet walk + crenels + bronze beacon-brazier on top */
 const yTop=.24+h,rTop=r+.48;
 ynCorbelFins(cx,cz,r-.04,rTop-.04,yTop-1.25,yTop,12,'corbel',P('corbel'),{bronzeTip:true});
 ynFloorDisc(cx,cz,rTop-.05,yTop+.15,'flagstone',P('flagstone'),{seg:18});
 ynNoCut(()=>{
  for(let i=0;i<10;i++){
   const a0=i/10*TAU,a1=a0+TAU/16;
   sector('stone',cx,cz,rTop-.32,rTop,a0,a1,yTop+.156,yTop+1.02,bsCol,2);
   sector('ashlar',cx,cz,rTop-.35,rTop+.04,a0-.02,a1+.02,yTop+1.026,yTop+1.14,asCol,2);
  }
 });
 ynrBeaconBrazier(cx,yTop+.15,cz,.92);
}

defBuilding({key:'yn-border-fort',name:'Skarp-Bastion Spear-Queen Frontier Border-Fort',seed:7507,cls:'building',w:27.6,d:21.6,h:28.2,budget:120000,cut:true,
 tags:{types:['military','civic','infrastructure'],wealth:'rich',style:'cliff',role:'fortress'},
 note:'Commanding Spear-Queen frontier pass bastion (borderfort.jpg + YC2 cliff grammar): engaged granite/basalt cliff shoulders, twin drum-prow corner bastions with bronze beacon-braziers, defended gate-passage & corbelled parapet walk, and a 5-tier overhanging annular war-redoubt with vertical front lift-spine and ribbed dome crown.',
 build(){
  const bsCol=P('stoneD'),grCol=P('granite'),slCol=P('sealime'),slWarm=P('sealimeW'),asCol=P('ashlar'),iwCol=P('ironwood'),bzCol=P('bronze'),vdCol=P('verdigris');

  /* 1. Engaged Cliff-Scarp & Dark-Basalt Ridge Shoulders (-z = -8.9 .. -2.6, balanced against +z = +8.9 so oz ~ 0.00!) */
  ynBelowGrade(()=>{
   for(const sx of [-8.8,-4.4,0,4.4,8.8])cyl('granite',sx,-5.2,-6.2,2.05,5.2,grCol,7,1.85);
  });
  ynNoCut(()=>svNoWalk(()=>{
   const crags=[
    {x:-9.6,z:-5.4,r0:2.45,r1:1.55,hh:14.2,ry:.3,mk:'stone',col:bsCol},
    {x:-5.4,z:-6.1,r0:2.65,r1:1.72,hh:18.6,ry:.55,mk:'granite',col:grCol},
    {x:0,z:-6.35,r0:2.65,r1:1.80,hh:20.4,ry:.15,mk:'stone',col:bsCol},
    {x:5.4,z:-6.1,r0:2.65,r1:1.72,hh:18.2,ry:-.45,mk:'granite',col:grCol},
    {x:9.6,z:-5.4,r0:2.45,r1:1.55,hh:13.8,ry:-.25,mk:'stone',col:bsCol}
   ];
   crags.forEach((c,i)=>{
    W(c.x,.006*i,c.z,c.ry,()=>{
     cyl(c.mk,0,0,0,c.r0,c.hh,c.col,7,c.r1);
     cyl('turf',0,c.hh+.005,0,c.r1*.92,.16,P('turf'),7,c.r1*.76);
    });
   });
  }));

  /* 2. Twin Battered Drum/Prow Corner Bastions + Defended Gate-Passage & Corbelled Parapet Walk (z = +4.65) */
  const bx=8.15,bz=4.65,bR=3.15,bH=5.35;
  ynrProwBastion(-bx,bz,bR,bH,-1);
  ynrProwBastion(bx,bz,bR,bH,1);

  /* Defended Gate-Passage Rampart spanning between the twin corner bastions (|x| = 1.98 .. 4.96, strictly disjoint from jambs!) */
  const gW=3.05,gH=3.55,wH=4.65,wD=2.35;
  ynBelowGrade(()=>{
   for(const sg of [-1,1])box('cobble',sg*3.25,-4.8,bz,3.15,4.8,wD+.5,P('cobble'));
  });
  for(const sg of [-1,1]){
   /* quoined ashlar gate-arch jambs: |x| = 1.525 .. 1.945 */
   box('ashlar',sg*(gW/2+.21),0,bz,.42,gH+.18,wD+.14,asCol);
   /* flanking dark-basalt & sea-lime gate curtain cheeks: |x| = 1.98 .. 4.96 */
   box('stone',sg*3.47,0,bz,2.98,2.45,wD,bsCol);
   box('sealime',sg*3.47,2.456,bz,2.98,wH-2.466,wD-.08,slCol);
  }
  /* gate lintel + machicolated corbelled parapet walk spanning continuously over the gate-passage */
  box('ashlar',0,gH+.02,bz,gW+.84,wH-gH-.02,wD+.08,asCol);
  ynNoCut(()=>{
   /* corbel fins under gate parapet walk + semicircular YC2 machicolation rain-visor over gate */
   for(let i=-4;i<=4;i++){
    box('corbel',i*1.08,wH-.72,bz+wD/2+.14,.22,.68,.26,P('corbel'));
   }
   ynCrescentVisor(0,bz+wD/2-.65,.85,PI/2,1.18,gH+.35,.82,'slate',P('slate'));
   const pPts=[[-5.0,bz-wD/2-.12],[5.0,bz-wD/2-.12],[5.0,bz+wD/2+.26],[-5.0,bz+wD/2+.26]];
   svNoWalk(()=>prism('flagstone',pPts,wH+.006,wH+.14,P('flagstone')));
   svFloor(pPts,wH+.14);
   /* front crenellated basalt & ashlar parapet along gate-walk (leaving center notch for vertical spine) */
   for(const ix of [-4.1,-2.5,-1.15,1.15,2.5,4.1]){
    box('stone',ix,wH+.146,bz+wD/2+.04,1.02,.88,.34,bsCol);
    box('ashlar',ix,wH+1.032,bz+wD/2+.04,1.12,.11,.42,asCol);
   }
   /* operable heavy ironwood & bronze double fort gates */
   door(0,0,bz+wD/2,0,gW,gH);
   svLeaf(0,.01,bz+.15,0,gW-.08,gH-.06,{mk:'ironwood',col:iwCol,split:true,t:.11,hwCol:0xb88e48,name:'bastion gate'});
   /* side wing walls closing courtyard flanks between corner bastions and rear cliff crags + parapet steps up to corner bastions */
   for(const sg of [-1,1]){
    box('stone',sg*9.45,0,-.55,1.65,5.1,7.4,bsCol);
    svNoWalk(()=>box('ashlar',sg*9.45,5.106,-.55,1.78,.24,7.5,asCol));
    svStripWalk([sg*4.6,wH+.14,bz],[sg*(bx-bR+.45),.24+bH+.15,bz],1.1);
   }
   /* courtyard stone stairs up to the gate parapet walk (run 4.9 -> slope 0.92) */
   svStair(-4.4,bz-wD/2-.68,.28,wH+.14,PI/2,{style:'solid',w:1.05,mk:'flagstone',col:P('flagstone'),run:4.9});
  });

  /* 3. Monumental 5-Tier Overhanging Annular Hive-Redoubt (borderfort.jpg + YC2 engaged cliff grammar!) */
  const cz=-.35,y0=.28,rCore=4.85,wt=.44;
  ynRootSkirt(0,cz,rCore,6.6,{mk:'cobble',plinthH:y0+.32,seg:20});
  ynFloorDisc(0,cz,rCore-.06,y0,'flagstone',P('flagstone'),{seg:18});
  /* Ground Garrison Hall Drum (y = .28 .. 4.28) */
  ynDrumWall(0,cz,rCore-wt,rCore,y0,4.0,'stone',bsCol,[
   {a:PI/2,w:1.85,h:2.55,door:true,open:true,visor:true,visorOut:.78},
   {a:PI*.22,w:.78,y:1.35,h:1.25},{a:PI*.78,w:.78,y:1.35,h:1.25}
  ]);

  /* 5 Stacked Overhanging Ring-Decks (y = 4.28 .. 19.28) swelling subtly outward like borderfort.jpg! */
  const tiers=[
   {y:4.28,h:3.0,rCore:4.78,rDeck:5.62,mk:'sealimeWarm',bays:14,visors:true},
   {y:7.28,h:3.0,rCore:4.92,rDeck:6.08,mk:'sealime',bays:16,visors:false},
   {y:10.28,h:3.0,rCore:5.05,rDeck:6.44,mk:'sealimeWarm',bays:16,visors:true},
   {y:13.28,h:3.0,rCore:5.02,rDeck:6.58,mk:'sealime',bays:16,visors:false},
   {y:16.28,h:3.0,rCore:4.78,rDeck:6.18,mk:'sealimeWarm',bays:14,visors:true}
  ];
  tiers.forEach((t,idx)=>{
   const prevR=idx===0?rCore:tiers[idx-1].rCore;
   const prevY=idx===0?y0:(tiers[idx-1].y+.15);
   /* stone corbel-fins flaring out to carry the overhanging annular war-deck */
   ynCorbelFins(0,cz,prevR,t.rDeck-.05,t.y-1.18,t.y,t.bays,'corbel',P('corbel'),{a0:-.12*PI,a1:1.12*PI,bronzeTip:idx>=2});
   ynFloorDisc(0,cz,t.rDeck-.06,t.y+.15,'floor',P('floor'),{seg:18});
   /* interior garrison stair climbing cleanly from previous deck up to this tier */
   svStair((idx%2===0?-1.85:1.85),cz-1.45,prevY,t.y+.15,0,{w:.88,mk:'ironwood',col:iwCol,run:2.85});
   /* inner battered sea-lime drum wall for this storey (with open doorway onto outer overhanging war-deck) */
   ynDrumWall(0,cz,t.rCore-wt,t.rCore,t.y+.15,t.h-.16,t.mk,t.mk==='sealimeWarm'?slWarm:slCol,[
    {a:PI/2,w:1.22,h:2.12,door:true,open:true},
    {a:PI*.18,w:.68,y:.85,h:1.25},{a:PI*.38,w:.68,y:.85,h:1.25},
    {a:PI*.62,w:.68,y:.85,h:1.25},{a:PI*.82,w:.68,y:.85,h:1.25}
   ],{a0:-.08*PI,a1:1.08*PI,visors:t.visors});
   /* outer overhanging war-gallery colonnade + dark-basalt parapet + wide razor-sharp slate/bronze ring-eave! */
   ynNoCut(()=>{
    const aA=-.10*PI,aB=1.10*PI,yD=t.y+.15;
    /* leave clean front gap (PI/2 +- .06) for the vertical counterpoise lift-spine */
    sector('stone',0,cz,t.rDeck-.28,t.rDeck,aA,PI/2-.065,yD+.006,yD+.78,bsCol,8);
    sector('stone',0,cz,t.rDeck-.28,t.rDeck,PI/2+.065,aB,yD+.006,yD+.78,bsCol,8);
    for(let k=0;k<=t.bays;k++){
     const a=aA+(aB-aA)*(k/t.bays);
     if(Math.abs(a-PI/2)<.08)continue;
     const px=Math.cos(a)*(t.rDeck-.15),pz=cz+Math.sin(a)*(t.rDeck-.15);
     cyl('ironwood',px,yD+.79,pz,.085,t.h-1.08,iwCol,8);
    }
    /* wide oversailing annular storm-eave ring (borderfort.jpg horizontal layered disc silhouette!) */
    const yE=t.y+t.h-.12,rEave=t.rDeck+.58;
    lathe('slate',0,cz,[[t.rCore+.02,yE-.06],[rEave,yE+.04],[t.rCore+.02,yE+.26]],20,P('slate'),{a0:aA,a1:aB,uv:'arc'});
    lathe('bronze',0,cz,[[rEave-.02,yE-.01],[rEave+.035,yE+.025],[rEave+.035,yE+.075]],20,bzCol,{a0:aA,a1:aB,uv:'arc'});
   });
  });

  /* 4. Signature Continuous Vertical Front Counterpoise Lift-Spine (borderfort.jpg centerline pylon, y = 4.66 .. 20.6!) */
  ynNoCut(()=>svNoWalk(()=>{
   const zSpine=cz+7.36;
   box('ashlar',0,4.66,zSpine,.66,15.85,.44,asCol);
   for(const sx of [-.24,.24])box('bronze',sx,4.72,zSpine+.25,.075,15.72,.05,bzCol);
   tiers.forEach(t=>{
    const zDeck=cz+t.rDeck+.02;
    box('ironwood',0,t.y+.18,(zDeck+zSpine-.22)/2,.52,.22,zSpine-.24-zDeck,iwCol);
   });
   box('travertine',0,20.52,zSpine-.18,.98,1.35,.88,P('travertine'));
   ynCanopy(0,zSpine-.18,.52,.82,21.88,.72,{mk:'verdigris',ribs:4,finial:false,seg:12});
  }));

  /* 5. Broad Shallow Ribbed Dome-Crown & Perimeter Watch-Pinnacles (borderfort.jpg summit, y = 19.28 .. 25.4!) */
  const yDome=19.28,rDome=5.65;
  ynFloorDisc(0,cz,rDome-.08,yDome+.15,'flagstone',P('flagstone'),{seg:20});
  svStair(-1.85,cz-1.45,tiers[tiers.length-1].y+.15,yDome+.15,0,{w:.88,mk:'ironwood',col:iwCol,run:2.85});
  ynNoCut(()=>{
   ynArcadeRing(0,cz,rDome-.36,rDome,yDome+.15,1.55,16,{paraH:.42,paraMk:'travertine',colMk:'bronze',spandrelMk:'sealime',archH:.36,colR:.08});
   const yD0=yDome+1.70;
   lathe('sealimeWarm',0,cz,[
    [rDome+.02,yD0-.06],[rDome+.48,yD0+.06],[rDome*.82,yD0+1.15],[rDome*.52,yD0+2.15],[1.65,yD0+2.85]
   ],22,slWarm,{uv:'cone'});
   lathe('travertine',0,cz,[
    [rDome-.05,yD0-.10],[rDome*.80,yD0+1.09],[rDome*.50,yD0+2.09],[1.60,yD0+2.81]
   ],22,P('travertine'),{uv:'cone',inward:true});
   for(let i=0;i<12;i++){
    const a=i/12*TAU,ca=Math.cos(a),sa=Math.sin(a);
    beam('bronze',[ca*(rDome+.38),yD0+.10,cz+sa*(rDome+.38)],[ca*1.72,yD0+2.88,cz+sa*1.72],.05,bzCol,true,6);
   }
   cyl('travertine',0,yD0+2.86,cz,1.62,.92,P('travertine'),16);
   ynCanopy(0,cz,1.62,2.15,yD0+3.78,1.15,{mk:'verdigris',ribs:8,finialScale:1.15,seg:18});
   const pinAngles=[PI*.16,PI*.84,-PI*.22,-PI*.78];
   pinAngles.forEach((pa,k)=>{
    const px=Math.cos(pa)*(rDome-.15),pz=cz+Math.sin(pa)*(rDome-.15);
    cyl('ashlar',px,yD0+.12,pz,.34,1.95+(k%2)*.55,asCol,8,.22);
    cone('verdigris',px,yD0+2.08+(k%2)*.55,pz,.32,.85,vdCol,8);
   });
  });

  /* 6. Garrison Command Rotunda Interior Furnishing (10 pieces, zero coplanar overlaps) */
  FURNISH('yonni_court_carpet',0,y0,cz,0);
  const yc=y0+.05;
  FURNISH('yonni_court_feast_table',0,yc,cz,0);
  for(const sx of [-1,1]){
   FURNISH('yonni_trade_bunk',sx*2.35,y0,cz-2.35,0);
   FURNISH('yonni_common_dual_spear_rack',sx*3.65,y0,cz-.35,-sx*PI/2);
   FURNISH('yonni_trade_armour_stand',sx*3.35,y0,cz+1.35,-sx*PI/2);
   FURNISH('yonni_common_brazier',sx*2.15,y0+.006,cz+2.15,0);
  }
  FURNISH_HANG('yonni_common_storm_lamp',0,4.15,cz,0);
 }});
