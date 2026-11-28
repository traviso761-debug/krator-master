// prefix: ynk2
// ================================================================= GRAND CLIFF-FLUSH ENGAGED HOLDS & VIADUCT ACROPOLIS (style: 'cliff')
// Two monumental Scoured-Hills cliff-engaged complexes from the 15-reference expansion:
//   1. yn-cliff-lanternhold  — Cliff-Clinging Tiered Saucer-Lantern Pods (c6dceae2: dark ironstone & bronze saucer-domes over glowing amber slit-bands)
//   2. yn-cliff-viaduct-hall — Fluted-Pillar Cliff Acropolis & Viaduct Rotundas (415694b5: fluted chasm columns + mossy verdigris domes + high colonnaded viaduct)

/* Helper: cantilevered dark ironstone & bronze cliff saucer-pod with continuous glowing horizontal lantern-slit band (c6dceae2) */
function ynk2LanternPod(cx,cz,rStem,rPod,y0,yPod,hPod,o){
 o=o||{};const irCol=P('ironstone'),bzCol=P('bronze'),slD=P('slateD'),flCol=P('floor');
 ynRootSkirt(cx,cz,rStem,5.4,{mk:'ironstone',col:irCol,plinthH:y0+.26,a0:-.08*PI,a1:1.08*PI,seg:14});
 ynFloorDisc(cx,cz,rStem-.06,y0,'flagstone',P('flagstone'),{a0:0,a1:PI,seg:12});
 ynDrumWall(cx,cz,rStem-.34,rStem,y0,yPod-y0-.16,'ironstone',irCol,
  o.groundDoor?[{a:PI/2,w:1.25,h:2.15,door:true,visor:true,visorOut:.78}]:[{a:PI/2,w:.68,y:1.15,h:1.35,pane:'lit'}],
  {a0:-.06*PI,a1:1.06*PI});

 /* Flared bronze-tipped corbel ribs + cantilevered saucer deck */
 ynCorbelFins(cx,cz,rStem,rPod-.05,yPod-1.45,yPod-.02,12,'corbel',P('corbel'),{a0:-.08*PI,a1:1.08*PI,bronzeTip:true});
 ynFloorDisc(cx,cz,rPod-.06,yPod,'floor',flCol,{seg:18});

 /* Dark ironstone & bronze saucer-pod wall with continuous glowing amber horizontal lantern-slit band! */
 const slitOpens=[];
 for(let i=0;i<5;i++){
  const a=lerp(PI*.12,PI*.88,i/4);
  slitOpens.push({a,w:rPod*.42,y:hPod*.42,h:.78,pane:'lit',visor:false,quoins:false});
 }
 if(o.sideOpenA!=null)slitOpens.push({a:o.sideOpenA,w:1.05,h:1.95,door:true,open:true,visor:false,quoins:false});
 ynDrumWall(cx,cz,rPod-.34,rPod,yPod,hPod,'ironstone',irCol,slitOpens,{a0:-.08*PI,a1:1.08*PI,visors:false});

 /* Continuous bronze lantern-sill & brow rings + broad low-slung ribbed bronze-and-slate saucer dome! */
 ynNoCut(()=>svNoWalk(()=>{
  ring('bronze',cx,yPod+hPod*.38,cz,rPod+.12,.04,bzCol,0,0,0,22);
  ring('bronze',cx,yPod+hPod*.42+.84,cz,rPod+.12,.042,bzCol,0,0,0,22);
  ynStormLamp(cx+Math.cos(PI*.30)*(rPod+.12),yPod+hPod*.55,cz+Math.sin(PI*.30)*(rPod+.12),ynYawFromA(PI*.30),.9);
  ynStormLamp(cx+Math.cos(PI*.70)*(rPod+.12),yPod+hPod*.55,cz+Math.sin(PI*.70)*(rPod+.12),ynYawFromA(PI*.70),.9);
  ynCanopy(cx,cz,rPod,rPod+.92,yPod+hPod,o.rise==null?1.75:o.rise,{mk:'slate',col:slD,ribs:12,bell:.24,finialScale:.82,seg:20});
 }));
}

/* ================================================================= 1. CLIFF-CLINGING SAUCER-LANTERN HOLD (yn-cliff-lanternhold) */
defBuilding({key:'yn-cliff-lanternhold',name:'Glo-Skarp Cliff-Clinging Saucer-Lantern Hold',seed:7607,cls:'building',w:20.4,d:13.8,h:19.6,budget:120000,cut:true,
 tags:{types:['dwelling-multi','tavern'],wealth:'rich',style:'cliff',role:'cliff saucer-lantern hold'},
 note:'Three staggered dark ironstone & bronze saucer-domed cliff pods cantilevered out of the coastal rock scarp, glowing with continuous warm amber horizontal lantern-bands and linked by ironwood cliff-balconies.',
 build(){
  ynkScarpBack(18.6,18.8,-2.05,2.0);

  /* Center High Sovereign Pod + Left & Right Staggered Cliff-Lantern Pods */
  ynk2LanternPod(0,1.05,2.45,3.45,.28,7.45,2.85,{groundDoor:true,rise:2.15});
  ynk2LanternPod(-5.15,.85,2.05,2.85,.24,4.45,2.45,{groundDoor:false,sideOpenA:0,rise:1.65});
  ynk2LanternPod(5.15,.85,2.05,2.85,.24,5.45,2.45,{groundDoor:false,sideOpenA:PI,rise:1.72});

  /* Exterior Spiral Stairs & Sloped Ironwood Cliff Gangplanks linking the 3 tiered saucer-pods */
  ynSpiralStair(0,1.05,2.52,.28,4.45,PI*.85,-PI*.75,{w:.88});
  ynGangplank(-2.35,4.45,.95,-1.55,4.45,1.02,1.15,{});
  ynGangplank(1.55,5.45,1.02,2.35,5.45,.95,1.15,{});
  ynNoCut(()=>svStair(0,4.25,0,.28,PI,{style:'solid',w:1.35,mk:'flagstone',col:P('flagstone'),run:.65}));

  /* Warm Tavern & Eyrie Pod Furnishing (8 pieces) */
  FURNISH('yonni_court_carpet',0,7.45,1.05,0);
  FURNISH('yonni_court_feast_table',0,7.50,1.05,0);
  FURNISH('yonni_common_brazier',-1.85,7.456,1.85,0);
  FURNISH('yonni_common_brazier',1.85,7.456,1.85,0);
  FURNISH('yonni_common_twin_alcove',-5.15,4.45,.25,0);
  FURNISH('yonni_common_dual_spear_rack',-3.45,4.45,.85,-PI/2);
  FURNISH('yonni_common_round_table',5.15,5.45,.85,0);
  FURNISH('yonni_trade_barrels',6.45,5.45,.55,-PI/2);
 }});

/* ================================================================= 2. FLUTED-PILLAR CLIFF ACROPOLIS & VIADUCT (yn-cliff-viaduct-hall) */
defBuilding({key:'yn-cliff-viaduct-hall',name:'Flut-Viadukt Fluted-Pillar Cliff Acropolis & Viaduct',seed:7609,cls:'building',w:23.8,d:14.6,h:22.8,budget:120000,cut:true,
 tags:{types:['civic','religious'],wealth:'rich',style:'cliff',role:'fluted-pillar cliff viaduct',job:'worship'},
 note:'Monumental Scoured-Hills cliff acropolis: twin deeply fluted dark granite chasm-columns rising to colonnaded lantern rotundas under mossy verdigris domes, joined mid-air by a high arched colonnade viaduct bridge.',
 build(){
  const stCol=P('stoneD'),grCol=P('granite'),trCol=P('travertine'),asCol=P('ashlar'),slWarm=P('sealimeW'),vdCol=P('verdigris'),tfCol=P('turf');
  const yViad=9.35;

  /* Twin Crag Buttress Spires at -Z + Twin Deeply Fluted Chasm Pillars at x = +-5.75, z = +.75 (415694b5!) */
  for(const sg of [-1,1]){
   const px=sg*5.75,pz=.75,rCol=2.55;
   ynNoCut(()=>svNoWalk(()=>{
    ynBelowGrade(()=>cyl('granite',px,-5.4,-2.35,2.65,5.4,grCol,7,2.45));
    cyl('granite',px,.008,-2.35,2.48,19.8,grCol,7,1.65);
    cyl('turf',px,19.82,-2.35,1.58,.18,tfCol,7,1.32);
   }));

   ynRootSkirt(px,pz,rCol,6.2,{mk:'ironstone',col:stCol,plinthH:.42,seg:16});
   ynFloorDisc(px,pz,rCol-.08,.28,'flagstone',P('flagstone'),{seg:14});
   ynDrumWall(px,pz,rCol-.38,rCol,.28,yViad-.46,'stone',stCol,
    sg<0?[{a:PI/2,w:1.30,h:2.20,door:true,visor:true,visorOut:.75}]:[{a:PI/2,w:.62,y:2.4,h:1.85,pane:'lit'}],
    {visors:false});

   /* 12 Deep Vertical Fluted Column-Ribs hugging the tall chasm shaft! */
   ynNoCut(()=>svNoWalk(()=>{
    for(let i=0;i<12;i++){
     const a=i/12*TAU;
     if(sg<0&&Math.abs(a-PI/2)<.28)continue;
     const rx=px+Math.cos(a)*(rCol+.08),rz=pz+Math.sin(a)*(rCol+.08);
     cyl('granite',rx,.44,rz,.22,yViad-1.95,grCol,8,.19);
    }
    ynCorbelFins(px,pz,rCol,3.75,yViad-1.55,yViad-.14,14,'corbel',P('corbel'),{bronzeTip:true});
   }));

   /* Elevated Colonnaded Lantern Rotunda + Mossy Turf-Rimmed Verdigris Dome (y = 9.35 .. 21.4) */
   const rRot=3.82,hRot=3.65;
   ynFloorDisc(px,pz,rRot-.06,yViad,'floor',P('floor'),{seg:18});
   ynDrumWall(px,pz,2.75,3.12,yViad,hRot,'sealimeWarm',slWarm,[
    {a:sg<0?0:PI,w:1.35,h:2.25,door:true,open:true},
    {a:PI/2,w:.88,y:.85,h:1.75,pane:'lit'},{a:PI*.25,w:.82,y:.85,h:1.75,pane:'lit'},{a:PI*.75,w:.82,y:.85,h:1.75,pane:'lit'}
   ]);
   ynNoCut(()=>svNoWalk(()=>{
    ynArcadeRing(px,pz,rRot-.32,rRot,yViad+.008,hRot,12,{
     paraH:.68,paraMk:'travertine',paraCol:trCol,colMk:'travertine',colCol:trCol,spandrelMk:'ashlar',spandrelCol:asCol,archH:.44,colR:.11,gapA:sg<0?0:PI
    });
    /* Mossy coastal turf-cushion ring around the eave + patinated verdigris dome! */
    const yD=yViad+hRot+.01;
    sector('turf',px,pz,rRot-.45,rRot+.28,0,TAU,yD,yD+.26,tfCol,18);
    ynmBulbDome(px,pz,rRot-.18,yD+.28,3.65,'verdigris',vdCol,{bulge:1.03,ribMk:'bronze',ribs:10,finialScale:1.05,seg:18});
   }));
  }

  /* Exterior Spiral Stair around Left Pillar + Monumental High Arched Colonnade Viaduct Bridge (x = -1.95 .. +1.95)! */
  ynSpiralStair(-5.75,.75,2.68,.28,yViad,PI*.38,-PI*.88,{w:.92});
  ynNoCut(()=>{
   const ax=-1.92,bx=1.92,bz=.75,bw=2.35;
   ynGangplank(ax,yViad,bz,bx,yViad,bz,bw,{});
   svNoWalk(()=>{
    /* Deep ashlar viaduct arch spanning the chasm + colonnaded upper viaduct gallery */
    const L=bx-ax;
    for(let i=0;i<8;i++){
     const t0=(i+.14)/8,t1=(i+.86)/8;
     const p0=[lerp(ax,bx,t0),yViad-.32-2.35*(1-Math.sin(t0*PI)),bz];
     const p1=[lerp(ax,bx,t1),yViad-.32-2.35*(1-Math.sin(t1*PI)),bz];
     beam('ashlar',p0,p1,.44,asCol,false,undefined,bw*.74);
    }
    for(const sz of [-1,1]){
     box('travertine',0,yViad+.02,bz+sz*(bw/2-.12),L-.12,.72,.18,trCol);
     for(let c=0;c<4;c++){
      const cx0=lerp(ax+.42,bx-.42,c/3);
      cyl('travertine',cx0,yViad+.75,bz+sz*(bw/2-.12),.10,1.75,trCol,8);
     }
     plane4('verdigris',[ax-.08,yViad+3.12,bz+sz*.04],[bx+.08,yViad+3.12,bz+sz*.04],[ax-.08,yViad+2.54,bz+sz*(bw*.62)],.05,vdCol);
    }
    box('travertine',0,yViad+2.51,bz,L,.18,bw+.08,trCol);
    beam('bronze',[ax-.1,yViad+3.17,bz],[bx+.1,yViad+3.17,bz],.06,P('bronze'));
   });
  });

  /* Twin Acropolis Rotunda Furnishing (8 pieces) */
  FURNISH('yonni_court_carpet',-5.75,yViad,.75,0);
  FURNISH('yonni_common_seer_basin',-5.75,yViad+.05,.75,0);
  FURNISH('yonni_common_brazier',-5.75,yViad+.008,2.35,0);
  FURNISH('yonni_common_dual_spear_rack',-7.65,yViad,.75,PI/2);
  FURNISH('yonni_court_carpet',5.75,yViad,.75,0);
  FURNISH('yonni_court_twin_throne',5.75,yViad+.05,-.55,0);
  FURNISH('yonni_works_scribe_desk',5.75,yViad,2.42,PI);
  FURNISH('yonni_common_banner',7.45,yViad,.75,-PI/2);
 }});
