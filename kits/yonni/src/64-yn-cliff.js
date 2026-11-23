// prefix: ynk
// ================================================================= CLIFF-FLUSH ENGAGED MODE (style: 'cliff', 02f9f0ab & 171af084)
// Engaged half/three-quarter cylinders, cantilevered fluted-corbel Rotunda Loggia (02f9f0ab), arched stone cleft-bridges,
// cliff-ledge cots, rock-vented smithies, and hanging eyrie watch-cupolas built flush against rock scarps (back at -z).

/* Helper: sculpted faceted coastal-granite & ironstone crag buttress behind each engaged cliff piece (-z) so every
   cliff building reads dramatically both standalone (?only=) and along the Cliff-Flush Engaged Scarp row without boxy slabs! */
function ynkScarpBack(w,h,zBack,dRock){
 const zb=zBack==null?-2.4:zBack,dr=dRock==null?1.9:dRock,grCol=P('granite'),stCol=P('stoneD'),tfCol=P('turf');
 const rz=Math.min(2.25,Math.max(1.55,dr*.95)),zc=zb-rz*.55;
 ynBelowGrade(()=>{
  for(let i=-1;i<=1;i++)cyl('granite',i*w*.27,-4.6,zc,rz*1.05,4.6,grCol,7,rz*.9);
 });
 ynNoCut(()=>{
  svNoWalk(()=>{
   /* four overlapping 7-faceted coastal granite crag spires along X with controlled Z-depth so footprints stay centered */
   const spires=[
    {x:-w*.31,z:zc+.08,r0:rz*.92,r1:rz*.58,hh:h*.78,ry:.25},
    {x:-w*.10,z:zc-.06,r0:rz*1.02,r1:rz*.64,hh:h,ry:.55},
    {x:w*.12,z:zc-.04,r0:rz*.98,r1:rz*.62,hh:h*.91,ry:-.2},
    {x:w*.31,z:zc+.08,r0:rz*.9,r1:rz*.56,hh:h*.74,ry:-.42}
   ];
   spires.forEach((s,idx)=>{
    W(s.x,.006*idx,s.z,s.ry,()=>{
     cyl('granite',0,0,0,s.r0,s.hh,idx%2===0?grCol:stCol,7,s.r1);
     cyl('turf',0,s.hh+.005,0,s.r1*.94,.16,tfCol,7,s.r1*.78);
    });
   });
  });
 });
}

/* 1. Cantilevered Fluted-Corbel Rotunda Loggia (02f9f0ab hero piece!) */
defBuilding({key:'yn-cliff-rotunda',name:'Skarp-Loggia Cantilevered Fluted-Corbel Rotunda',seed:7501,cls:'building',w:16.8,d:15.4,h:18.6,cut:true,
 tags:{types:['civic','religious'],wealth:'rich',style:'cliff',role:'cliff rotunda loggia',job:'worship'},
 note:'Signature cantilevered circular loggia jutting from the cliff scarp on deep fluted stone corbel-ribs under a broad domed sea-lime & bronze rain-canopy (02f9f0ab).',
 build(){
  ynkScarpBack(15.2,17.8,-3.35,2.2);
  /* rock-rooted stem cylinder + deep flared fluted stone corbel basket (y = .2 .. 6.2) */
  const cy=0,cz=.22,rStem=2.65,rDeck=5.25,yDeck=6.35;
  ynRootSkirt(cy,cz,rStem,5.4,{mk:'cobble',plinthH:.45});
  ynNoCut(()=>{
   lathe('sealimeWarm',cy,cz,[[rStem,.45],[rStem-.12,2.6],[rStem+.55,4.2],[rDeck-.35,5.65],[rDeck+.12,yDeck-.17]],26,P('sealimeW'));
   /* 18 bold radial fluted corbel-ribs fanning out under the cantilevered circular deck (02f9f0ab) */
   ynCorbelFins(cy,cz,rStem-.05,rDeck,2.3,yDeck-.16,18,'corbel',P('corbel'),{a0:-.08*PI,a1:1.08*PI,th:.22,bronzeTip:true});
  });
  /* ground-level rock-cut entry portal in the stem + spiral cliff stair up to the cantilevered loggia */
  door(0,0,cz+rStem,0,1.15,2.15);
  svLeaf(0,.01,cz+rStem-.12,0,1.08,2.08,{mk:'ironwood',col:P('ironwood'),name:'stem door'});
  ynSpiralStair(cy,cz,rStem+.08,0,yDeck,-.05*PI,PI*.95,{w:1.05});
  /* cantilevered circular arcaded loggia deck + domed bell-cone rain-canopy */
  ynFloorDisc(cy,cz,rDeck-.05,yDeck,'flagstone',P('flagstone'),{seg:24});
  ynArcadeRing(cy,cz,rDeck-.38,rDeck,yDeck,3.25,14,{a0:-.12*PI,a1:1.12*PI,paraMk:'sealimeWarm',colMk:'ashlar',colCol:P('ashlar'),spandrelMk:'sealimeWarm',gapA:PI*.9});
  /* central inner sanctuary drum + oversailing domed bell-canopy (02f9f0ab) */
  const yTop=yDeck+3.25;
  ynCanopy(cy,cz,rDeck,rDeck+1.35,yTop,1.65,{mk:'sealimeWarm',ribs:14,finial:false,rHub:2.85,bell:.22});
  lathe('sealimeWarm',cy,cz,[[2.85,yTop+1.65],[2.65,yTop+3.05],[1.65,yTop+4.35],[.22,yTop+5.05]],24,P('sealimeW'),{uv:'cone'});
  lathe('planks',cy,cz,[[2.80,yTop+1.60],[2.59,yTop+2.99],[1.59,yTop+4.29],[.01,yTop+4.99]],24,P('planks'),{uv:'cone',inward:true});
  ynTwinSpearFinial(cy,yTop+5.05,cz,1.15);
  /* Loggia furnishing */
  FURNISH('yonni_court_carpet',cy,yDeck,cz,0);
  FURNISH('yonni_court_twin_throne',cy,yDeck,cz-2.15,0);
  FURNISH('yonni_common_seer_basin',cy,yDeck+.05,cz+.35,0);
  FURNISH('yonni_common_brazier',cy-2.4,yDeck,cz+1.4,0);
  FURNISH('yonni_common_brazier',cy+2.4,yDeck,cz+1.4,0);
  FURNISH('yonni_common_dual_spear_rack',cy-3.4,yDeck,cz-.6,PI/2);
 }});

/* 2. Engaged Three-Quarter Cliff-Tower Cluster (02f9f0ab left cluster with crescent rain-visors!) */
defBuilding({key:'yn-cliff-cluster',name:'Skarp-Tur Engaged Cliff-Tower Cluster',seed:7502,cls:'building',w:16.8,d:12.6,h:19.4,cut:true,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'cliff',role:'cliff tower cluster'},
 note:'Three engaged sea-lime & cobble three-quarter cylinders stepping up the cliff face with projecting semicircular rain-visors (02f9f0ab) and conical caps.',
 build(){
  ynkScarpBack(15.8,18.6,-1.65,2.0);
  const flCol=P('flagstone'),cbCol=P('cobble'),slCol=P('sealimeW');
  const specs=[
   {cx:-4.45,cz:.85,r:2.6,y0:.16,h0:2.2,h1:4.8,rise:2.55,visorY:[3.6,5.8]},
   {cx:.05,cz:1.2,r:2.9,y0:.38,h0:2.5,h1:6.7,rise:2.95,visorY:[3.9,6.3,8.3]},
   {cx:4.5,cz:.75,r:2.5,y0:.62,h0:2.05,h1:3.9,rise:2.35,visorY:[3.6]}
  ];
  specs.forEach((s,idx)=>{
   ynRootSkirt(s.cx,s.cz,s.r,5.2,{mk:'cobble',col:cbCol,plinthH:s.y0+.22,a0:-.08*PI,a1:1.08*PI});
   ynFloorDisc(s.cx,s.cz,s.r-.06,s.y0,'flagstone',flCol,{a0:0,a1:PI,seg:12});
   ynDrumWall(s.cx,s.cz,s.r-.35,s.r,s.y0,s.h0,'cobble',cbCol,
    idx===1?[{a:PI/2,w:1.18,h:2.05,door:true,visor:true,visorOut:.82}]:[{a:PI/2,w:.68,y:.85,h:1.05}],
    {a0:-.06*PI,a1:1.06*PI});
   ynDrumWall(s.cx,s.cz,s.r-.38,s.r-.03,s.y0+s.h0,s.h1,'sealimeWarm',slCol,[
    {a:PI/2,w:.68,y:1.1,h:1.25},{a:PI*.24,w:.62,y:2.8,h:1.2},{a:PI*.76,w:.62,y:2.8,h:1.2}
   ],{a0:-.06*PI,a1:1.06*PI});
   for(const vy of s.visorY){
    ynCrescentVisor(s.cx,s.cz,s.r-.02,PI/2,.95,vy,1.05,'sealimeWarm',slCol);
   }
   ynCanopy(s.cx,s.cz,s.r-.03,s.r+.78,s.y0+s.h0+s.h1,s.rise,{mk:idx===1?'verdigris':'slate',ribs:8,a0:-.08*PI,a1:1.08*PI});
  });
  ynNoCut(()=>{
   svStair(.05,4.4,0,.38,PI,{style:'solid',w:1.15,mk:'flagstone',col:flCol,run:.55});
   svStair(4.5,3.9,0,.62,PI,{style:'solid',w:1.05,mk:'flagstone',col:flCol,run:.85});
  });
  ynFurn([
   ['yonni_common_twin_alcove',.05,.38,1.4,PI],
   ['yonni_common_brazier',.05,.386,3.0,0],
   ['yonni_common_round_table',-4.45,.16,1.6,0],
   ['yonni_common_dual_spear_rack',-2.7,.16,1.55,-PI/2],
   ['yonni_common_chest',4.5,.62,1.6,PI],
   ['yonni_common_shelves',5.8,.62,1.45,-PI/2]
  ]);
 }});

/* 3. Arched Stone Cleft-Bridge & Twin Cliff-Towers (02f9f0ab lower arch + 171af084) */
defBuilding({key:'yn-cliff-bridge',name:'Kleft-Brij Arched Cleft-Bridge & Twin-Towers',seed:7503,cls:'building',w:18.4,d:12.2,h:15.2,cut:true,
 tags:{types:['infrastructure','dwelling-single'],wealth:'middle',style:'cliff',role:'cleft bridge house'},
 note:'Two engaged cobble & sea-lime cliff drums spanning a rock cleft on a bold ashlar stone arch with ironwood parapet (02f9f0ab).',
 build(){
  const grCol=P('granite'),tfCol=P('turf');
  for(const sg of [-1,1]){
   ynNoCut(()=>{
    cyl('granite',sg*4.9,.005,-1.95,2.75,13.6,grCol,7,1.85);
    cyl('turf',sg*4.9,13.61,-1.95,1.72,.16,tfCol,7,1.45);
   });
   const cx=sg*4.6,cz=.95,r=2.85;
   ynRootSkirt(cx,cz,r,5.4,{mk:'cobble',plinthH:.42,a0:-.08*PI,a1:1.08*PI});
   ynFloorDisc(cx,cz,r-.06,.22,'flagstone',P('flagstone'),{a0:0,a1:PI,seg:12});
   ynDrumWall(cx,cz,r-.35,r,.22,2.4,'cobble',P('cobble'),[
    {a:PI/2,w:1.1,h:2.05,door:true,visor:true}
   ],{a0:-.06*PI,a1:1.06*PI});
   ynDrumWall(cx,cz,r-.38,r-.03,2.62,3.4,'sealimeWarm',P('sealimeW'),[
    {a:sg<0?0:PI,w:.95,y:1.25,h:1.85,door:true,open:true},{a:PI/2,w:.68,y:1.1,h:1.2}
   ],{a0:-.06*PI,a1:1.06*PI});
   ynCanopy(cx,cz,r-.03,r+.85,6.02,2.65,{mk:'slate',ribs:8,a0:-.08*PI,a1:1.08*PI});
  }
  /* arched stone cleft-bridge spanning between the two cliff drums */
  ynFlyingBridge(-1.85,3.88,.95,1.85,3.88,.95,1.55,{roofMk:'verdigris',arch:true,archDrop:1.75});
  ynFurn([
   ['yonni_common_twin_alcove',-4.6,.22,1.52,PI],
   ['yonni_common_brazier',-4.6,.226,3.02,0],
   ['yonni_common_round_table',4.6,.22,1.95,0],
   ['yonni_common_dual_spear_rack',2.85,.22,1.6,PI/2],
   ['yonni_common_chest',6.05,.22,1.6,-PI/2]
  ]);
 }});

/* 4. Cliff-Ledge Twin-Cot (poor cliff dwelling) */
defBuilding({key:'yn-cliff-dwelling-poor',name:'Rok-Kot Cliff-Ledge Twin-Cot',seed:7504,cls:'building',w:10.6,d:9.8,h:11.4,cut:true,
 tags:{types:['dwelling-single'],wealth:'poor',style:'cliff',role:'cliff cot'},
 note:'Compact engaged ironstone-cobble half-drum tucked under a coastal rock scarp with crescent rain-visor and paired twin-pallet.',
 build(){
  ynkScarpBack(9.6,10.8,-1.55,1.75);
  const r=2.95,y0=.22,cz=.45;
  ynRootSkirt(0,cz,r,4.6,{mk:'ironstone',plinthH:y0+.24,a0:-.08*PI,a1:1.08*PI});
  ynFloorDisc(0,cz,r-.06,y0,'flagstone',P('flagstone'),{a0:0,a1:PI,seg:12});
  ynDrumWall(0,cz,r-.34,r,y0,3.6,'ironstone',P('ironstone'),[
   {a:PI/2,w:1.05,h:2.0,door:true,visor:true,visorOut:.75},
   {a:PI*.2,w:.62,y:.95,h:1.05},{a:PI*.8,w:.62,y:.95,h:1.05}
  ],{a0:-.06*PI,a1:1.06*PI});
  ynCanopy(0,cz,r,r+.85,y0+3.6,2.25,{mk:'slate',ribs:6,a0:-.08*PI,a1:1.08*PI});
  ynFurn([
   ['yonni_poor_twin_pallet',0,y0,1.02,PI],
   ['yonni_common_brazier',0,y0+.006,2.55,0],
   ['yonni_common_dual_spear_rack',-1.75,y0,1.15,PI/2],
   ['yonni_common_chest',1.75,y0,1.15,-PI/2]
  ]);
 }});

/* 5. Cliff-Vented Rock-Forge */
defBuilding({key:'yn-cliff-smithy',name:'Skarp-Forj Cliff-Vented Rock-Forge',seed:7505,cls:'building',w:12.8,d:11.4,h:13.8,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'cliff',role:'cliff smithy',job:'smithing'},
 note:'Engaged cobble forge-rotunda venting its bronze-capped rock-flue straight up the cliff scarp, safe from windward squalls.',
 build(){
  ynkScarpBack(11.8,13.2,-1.85,1.95);
  const r=3.45,y0=.22,cz=.45;
  ynRootSkirt(0,cz,r,4.8,{mk:'ironstone',plinthH:y0+.26,a0:-.08*PI,a1:1.08*PI});
  ynFloorDisc(0,cz,r-.06,y0,'flagstone',P('flagstone'),{a0:0,a1:PI,seg:14});
  ynDrumWall(0,cz,r-.36,r,y0,3.9,'cobble',P('cobble'),[
   {a:PI/2,w:1.75,h:2.25,door:true,open:true,visor:true,visorOut:.85},
   {a:PI*.18,w:.75,y:1.0,h:1.15},{a:PI*.82,w:.75,y:1.0,h:1.15}
  ],{a0:-.06*PI,a1:1.06*PI});
  ynCanopy(0,cz,r,r+.92,y0+3.9,2.55,{mk:'verdigris',ribs:8,a0:-.08*PI,a1:1.08*PI});
  ynNoCut(()=>{
   cyl('ironstone',0,y0+3.95,-.8,.48,5.35,P('ironstone'),10);
   cone('bronze',0,y0+9.31,-.8,.65,.38,P('bronze'),10);
   smokeAt(0,y0+9.8,-.8,{r:.36});
  });
  ynFurn([
   ['yonni_trade_forge',0,y0,1.0,0],
   ['yonni_trade_anvil',0,y0,2.1,0],
   ['yonni_trade_trough',-1.95,y0,1.4,PI/2],
   ['yonni_common_dual_spear_rack',1.95,y0,1.4,-PI/2],
   ['yonni_trade_workbench',1.45,y0,2.5,PI*.75]
  ]);
 }});

/* 6. Hanging Eyrie Watch-Cupola (171af084, 861d6426) */
defBuilding({key:'yn-cliff-watch',name:'Eri-Woch Hanging Eyrie Watch-Cupola',seed:7506,cls:'building',w:12.4,d:11.6,h:17.2,cut:true,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'cliff',role:'cliff watchtower'},
 note:'Corbel-fin cantilevered cliff watch-drum projecting from the rock scarp under a bronze-ribbed lookout cupola and storm-beacon.',
 build(){
  ynkScarpBack(11.4,16.4,-1.85,1.95);
  const r=2.65,cz=.3,y0=.24;
  ynRootSkirt(0,cz,r,5.4,{mk:'cobble',plinthH:y0+.28,a0:-.08*PI,a1:1.08*PI});
  ynFloorDisc(0,cz,r-.05,y0,'flagstone',P('flagstone'),{a0:0,a1:PI,seg:12});
  ynDrumWall(0,cz,r-.35,r,y0,5.2,'cobble',P('cobble'),[
   {a:PI/2,w:1.05,h:2.05,door:true,visor:true},{a:PI*.25,w:.55,y:2.8,h:1.15},{a:PI*.75,w:.55,y:2.8,h:1.15}
  ],{a0:-.06*PI,a1:1.06*PI});
  const yG=y0+5.2,rG=3.65;
  ynCorbelFins(0,cz,r,rG-.04,yG-1.5,yG,10,'corbel',P('corbel'),{a0:-.08*PI,a1:1.08*PI,bronzeTip:true});
  ynFloorDisc(0,cz,rG-.06,yG+.16,'floor',P('floor'),{seg:18});
  ynArcadeRing(0,cz,rG-.32,rG,yG+.16,2.55,10,{a0:-.1*PI,a1:1.1*PI,paraMk:'ashlar',colMk:'ironwood',spandrelMk:'sealime',gapA:PI*.08});
  ynSpiralStair(0,cz,r+.05,0,yG+.16,PI*.88,-PI*.8);
  ynCanopy(0,cz,rG,rG+.95,yG+2.71,3.05,{mk:'verdigris',ribs:10});
  ynFurn([
   ['yonni_trade_bunk',0,y0,-.42,0],
   ['yonni_common_dual_spear_rack',-1.65,y0,.45,PI/2],
   ['yonni_trade_armour_stand',1.65,y0,.45,-PI/2],
   ['yonni_common_brazier',0,yG+.166,cz,0]
  ]);
 }});
