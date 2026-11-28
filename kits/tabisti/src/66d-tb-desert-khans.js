// prefix: tb
/* ================================================================= DESERT TABISTI — ROW 6A: ROUNDED CARAVAN KHANS & WAYSTATIONS (10460..10465)
   The caravan-road variants of the Urban Tabisti kit (plates: desert-Kenshi rounded mass, sand-hide roofs, beehive stalls,
   battered drums with a teal tile band, red mesa beacon tower). Same materials, doors, walk and audits as the urban set.
   10460. tb_dz_khan_rotunda — Round Courtyard Khan with Beehive Stalls and Drum Gate (innkeepers/grooms, bug handlers)
   10461. tb_dz_khan_sweep   — Sand-Hide Sweep-Roof Longcrawler Khan with a Belvedere Hive Tower
   10462. tb_dz_khan_cistern — Cistern-Domed Square Khan with Four Round Corner Drums
   10463. tb_dz_way_beehive  — Beehive Waystation: three domed cells, well court and wind-tower
   10464. tb_dz_way_beacon   — Mesa Beacon Waystation: red banded tower on a stepped rock plinth
   10465. tb_dz_way_shade    — Windcatcher Shade Station: open ayvan, well and a belvedere drum */

/* a rounded stall: square posts and walls under a beehive dome, door toward the local +z (the yard), placed on a ring */
function tbDzHiveCell(px,pz,ry,y1,k,o){
 o=o||{};
 const hw=o.hw||2.1,hd=o.hd||1.6,h=o.h||3.4;
 W(px,0,pz,ry,()=>{
  tbWallRing(-hw,-hd,hw,hd,y1,h,{
   register:'hazarbaf',t:.44,
   holes:{s:[{at:0,w:1.5,h:2.3,door:true,name:(o.name||'stall')+'-'+k}],n:[{at:0,w:.8,h:.9,y:1.5,flat:true}]}
  });
  const rd=Math.hypot(hw,hd)+.12;
  tbDome(0,0,rd,y1+h+.14,o.domeH||2.5,{mk:k%3===0?'zsolnay':(k%3===1?'terracotta':'stucco'),spire:.4});
  tbTarget(0,y1,0,(o.name||'stall')+'-'+k,true);
  if(o.furn!==false)tbFurnList([
   ['tb_bonded_bale_stack',-hw*.5,y1,-hd*.45,0],
   ['tb_ustun_daybed',hw*.45,y1,-hd*.4,0]
  ]);
 });
}

/* 66. Round Courtyard Khan with Beehive Stalls and Drum Gate */
defBuilding({
 key:'tb_dz_khan_rotunda',
 name:'Round Courtyard Khan with Beehive Stalls and Drum Gate',
 seed:10460,w:32,d:36,h:15.5,budget:170000,cut:false,
 front:{x:0,z:17.2,yaw:0},
 tags:{style:'urban',variant:'desert',types:['inn','market','infrastructure'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.5,R=14,wallH=5.0;
  /* low stepped base and the walkable paved court */
  tbRoundPlinth(0,0,R+.9,y1,{skipA:PI/2,skipW:.45});
  tbFloorDisc(0,0,R+.7,y1,'paving',P('paving'),{th:.16,seg:28});
  tbStair(0,0,R+3.6,0,y1,R+.8,4.4,{});

  /* the round curtain with its gate gap, flanked by two crowned drums */
  tbRoundShell(0,0,R,y1,wallH,{gapW:4.8,gapA:PI/2,t:.8,b:.05,door:false,plain:true});
  tbPishtaqPortal(0,y1,R-.35,0,9.0,6.6,{openW:4.4,openH:4.3,dep:1.7,door:false});
  for(const s of [-1,1]){
   const a=PI/2+s*.36,x=Math.cos(a)*R,z=Math.sin(a)*R;
   tbDrumSolid(x,z,2.2,y1,8.2,{rot:a});
   const yF=tbRoundCrown(x,z,2.2*.92,y1+8.2,{walk:false});
   tbDome(x,z,1.9,yF,2.4,{mk:'zsolnay',spire:.8});
   tbBanner(x*1.25,y1,z*1.25+1.2,5.6,{pal:s<0?'flag':'silkSaffron'});
  }

  /* six beehive stalls round the court, doors to the middle (the gate sector stays clear) */
  let k=0;
  for(let i=0;i<8;i++){
   const a=(22.5+45*i)*PI/180;
   if(Math.abs(a-PI/2)<.7)continue;
   /* square stalls keep to the cardinal axes (rotated door frames trip the coplanar audit); the door faces the nearer axis toward the court */
   const dx=-Math.cos(a),dz=-Math.sin(a);
   const ry=Math.abs(dx)>=Math.abs(dz)?(dx>0?PI/2:-PI/2):(dz>0?0:PI);
   tbDzHiveCell(Math.cos(a)*9.7,Math.sin(a)*9.7,ry,y1,k++,{name:'khan-stall'});
  }

  /* the watering court */
  tbShadirvanPool(0,-.4,5.6,5.6,y1+.3,.5,{jet:true});
  tbWindTower(0,-8.0,1.2,y1,9.4,{pedH:2.2});
  tbTarget(0,y1,3.6,'khan-round-court',false);
  tbFurnList([['tb_brass_lantern_stand',-3.4,y1,3.4,0],['tb_brass_lantern_stand',3.4,y1,3.4,0]]);
 }
});

/* 67. Sand-Hide Sweep-Roof Longcrawler Khan with a Belvedere Hive Tower */
defBuilding({
 key:'tb_dz_khan_sweep',
 name:'Sand-Hide Sweep-Roof Longcrawler Khan with Belvedere Hive Tower',
 seed:10461,w:36,d:24,h:23,budget:170000,cut:true,
 front:{x:0,z:10.4,yaw:0},
 tags:{style:'urban',variant:'desert',types:['inn','market','infrastructure'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.52,h1=4.6;
  tbPorticoPlinth(26.0,17.0,y1,{stepW:4.0,stepRun:1.2});
  tbShadirvanPool(0,5.6,4.6,3.0,y1+.3,.46,{jet:true});
  tbBanner(-5.6,y1,7.6,5.2,{pal:'flag'});
  tbBanner(5.6,y1,7.6,5.2,{pal:'silkSaffron'});

  /* long hall: stables below, sleeping rooms behind, under three stacked sweeping hide plates */
  tbUstunAyvan(0,.4,24.6,2.6,y1,h1,{n:8,skipMid:2.0,ganchBack:true});
  tbWallRing(-11.4,-7.6,11.4,-.8,y1,h1,{
   register:'banded',t:.5,
   holes:{
    s:[
     {at:-7.2,w:2.2,h:2.8,door:true,name:'sweep-west-stable'},
     {at:0,w:2.2,h:2.8,door:true,name:'sweep-central-hall'},
     {at:7.2,w:2.2,h:2.8,door:true,name:'sweep-east-stable'}
    ],
    n:[{at:-6,w:1.1,h:1.1,y:1.6,flat:true},{at:0,w:1.1,h:1.1,y:1.6,flat:true},{at:6,w:1.1,h:1.1,y:1.6,flat:true}]
   }
  });
  const yR=tbHideRoof(0,-4.1,26.6,14.4,y1+h1+.14,{layers:3,step:3.0,rise:.7,spines:8});
  /* belvedere hive tower rising from the roof stack */
  tbDrumSolid(0,-4.1,2.8,yR-.04,7.2,{block:false,band:'cobalt'});
  tbBelvedere(0,-4.1,2.8*.92,yR+7.16,{cols:8,colH:1.9,domeH:2.2,mk:'zsolnay'});

  /* round end rooms (a hive each side) */
  for(const s of [-1,1]){
   const x=s*14.6,z=-3.9;
   svNoWalk(()=>cyl('ashlar',x,0,z,3.5,y1-.1,P('ashlar'),20));
   tbRoundRoom(x,z,2.9,y1,3.6,{gapW:1.6,gapA:PI/2,t:.5,b:.04,name:'sweep-hive-'+(s<0?'w':'e')});
   tbDome(x,z,3.0,y1+3.7,2.6,{mk:s<0?'terracotta':'zsolnay',spire:.5});
   tbStair(x,0,z+6.6,x,y1,z+3.4,2.0,{});
   tbTarget(x,y1,z,'sweep-hive-room-'+(s<0?'w':'e'),true);
  }
  tbTarget(0,y1,.4,'sweep-shaded-ayvan',true);
  tbTarget(0,y1,-4.2,'sweep-long-hall',true);
  tbFurnList([
   ['tb_bonded_bale_stack',-7.4,y1,-5.4,0],
   ['tb_bonded_bale_stack',7.4,y1,-5.4,PI],
   ['tb_trencadis_table',-1.6,y1,-4.6,0],
   ['tb_ganch_screen_bench',1.6,y1,-6.4,0],
   ['tb_zeer_cold_rack',-9.8,y1,-2.4,0],
   ['tb_brass_lantern_stand',0,y1,-2.2,0]
  ]);
 }
});

/* 68. Cistern-Domed Square Khan with Four Round Corner Drums */
defBuilding({
 key:'tb_dz_khan_cistern',
 name:'Cistern-Domed Square Khan with Four Round Corner Drums',
 seed:10462,w:30,d:30,h:15,budget:165000,cut:true,
 front:{x:0,z:13.6,yaw:0},
 tags:{style:'urban',variant:'desert',types:['inn','market','infrastructure'],role:'caravanserai',job:'trading'},
 build(){
  const y1=.52,hw=4.4;
  tbPorticoPlinth(26.0,26.0,y1,{stepW:4.2,stepRun:1.2});
  const C=11.6;
  /* curtain: south wall with the gate gap, solid east/west/north */
  for(const s of [-1,1])tbWall(s*(C-1.9),C,s*3.0,C,y1,hw,{register:'hazarbaf',t:.7});
  tbPishtaqPortal(0,y1,C,0,6.2,6.0,{openW:3.8,openH:4.1,dep:1.5,door:false});
  tbWall(-C,-(C-1.9),-C,C-1.9,y1,hw,{register:'hazarbaf',t:.7});
  tbWall(C,-(C-1.9),C,C-1.9,y1,hw,{register:'hazarbaf',t:.7});
  tbWall(-(C-1.9),-C,C-1.9,-C,y1,hw,{register:'hazarbaf',t:.7});
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const x=sx*C,z=sz*C;
   tbDrumSolid(x,z,2.1,y1,8.6,{rot:sx+sz});
   const yF=tbRoundCrown(x,z,2.1*.92,y1+8.6,{walk:false});
   tbDome(x,z,1.9,yF,2.2,{mk:sz<0?'terracotta':'zsolnay',spire:.7});
  }
  tbBanner(-3.4,y1,C+1.4,5.0,{pal:'flag'});
  tbBanner(3.4,y1,C+1.4,5.0,{pal:'silkSaffron'});

  /* north range under sand-hide plates */
  tbWallRing(-8.4,-9.2,8.4,-4.4,y1,3.9,{
   register:'banded',t:.46,
   holes:{s:[{at:-4.4,w:1.7,h:2.4,door:true,name:'cistern-khan-store'},{at:4.4,w:1.7,h:2.4,door:true,name:'cistern-khan-rooms'}],
          n:[{at:-4.4,w:1,h:1,y:1.5,flat:true},{at:4.4,w:1,h:1,y:1.5,flat:true}]}
  });
  tbHideRoof(0,-6.8,19.6,8.2,y1+3.9+.14,{layers:2,step:2.4,rise:.66,spines:6});
  tbTarget(-4.4,y1,-6.8,'cistern-khan-store-room',true);
  tbTarget(4.4,y1,-6.8,'cistern-khan-sleeping-room',true);

  /* the domed cistern (anbar) in the court */
  tbRoundRoom(0,2.6,3.8,y1,4.2,{gapW:1.7,gapA:PI/2,t:.55,b:.07,band:'cobalt',name:'cistern-door'});
  tbDome(0,2.6,3.9,y1+4.3,3.0,{mk:'zsolnay',spire:.9});
  tbTarget(0,y1,2.6,'cistern-vault',true);
  tbShadirvanPool(0,7.8,3.4,2.2,y1+.3,.46,{});
  tbFurnList([
   ['tb_zeer_cold_rack',-1.4,y1,2.2,0],
   ['tb_zeer_cold_rack',1.4,y1,2.2,0],
   ['tb_bonded_bale_stack',-6.2,y1,-8.2,0],
   ['tb_ustun_daybed',6.4,y1,-8.0,0],
   ['tb_brass_lantern_stand',-1.0,y1,-5.0,0]
  ]);
 }
});

/* 69. Beehive Waystation: three domed cells, well court and wind-tower */
defBuilding({
 key:'tb_dz_way_beehive',
 name:'Beehive Waystation with Well Court and Wind-Tower',
 seed:10463,w:22,d:16,h:13,budget:100000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 tags:{style:'urban',variant:'desert',types:['inn','infrastructure'],role:'waystation',job:'trading'},
 build(){
  const y1=.5;
  tbPorticoPlinth(20.0,13.4,y1,{stepW:3.2,stepRun:1.1});
  tbUstunAyvan(0,1.0,18.2,2.4,y1,3.2,{n:6,ganchBack:false});
  [-5.6,0,5.6].forEach((x,i)=>tbDzHiveCell(x,-2.0,0,y1,i,{name:'way-cell',domeH:i===1?3.2:2.5}));
  tbWindTower(0,-6.0,1.3,y1,9.4,{pedH:2.2});
  tbShadirvanPool(0,4.4,3.4,2.4,y1+.28,.44,{});
  tbBanner(7.6,y1,5.2,4.6,{pal:'silkSaffron'});
  tbTarget(0,y1,1.0,'way-shaded-ayvan',true);
 }
});

/* 70. Mesa Beacon Waystation: red banded tower on a stepped rock plinth (plate: mesa pharos) */
defBuilding({
 key:'tb_dz_way_beacon',
 name:'Mesa Beacon Waystation on a Stepped Rock Plinth',
 seed:10464,w:16,d:20,h:17,budget:90000,cut:true,
 front:{x:0,z:3.0,yaw:0},
 tags:{style:'urban',variant:'desert',types:['infrastructure','military'],role:'waystation'},
 build(){
  const y1=.5;
  /* rock plinth: a wide tier, a narrow tier, and the walkable top just under the tower */
  tbBio().ventedPlinths++;
  svNoWalk(()=>{
   for(let k=0;k<10;k++){const a=(k+.5)/10*TAU;if(Math.abs(a-PI/2)<.5)continue;box('iron',Math.cos(a)*5.57,.1,Math.sin(a)*5.57,.6,.7,.05,P('iron'),-a-PI/2);}
   cyl('ashlar',0,0,0,5.6,1.34,P('ashlar'),14,5.1);
   cyl('stone',0,1.34,0,4.5,.9,P('stone'),12,4.3);
  });
  const yP=2.4;
  tbFloorDisc(0,0,4.2,yP,'paving',P('paving'),{th:.16,seg:20});
  tbStair(0,0,9.2,0,yP,4.3,2.2,{});
  const h=6.6,r=2.8;
  tbRoundRoom(0,0,r,yP,h,{gapW:1.7,gapA:PI/2,t:.5,b:.05,mk:'terracotta',band:'kashi',name:'beacon-door'});
  /* star panels of cream tile on the red drum */
  svNoWalk(()=>{
   for(let k=0;k<4;k++){
    const a=k*PI/2+PI/4;
    for(const f of [.36,.72]){
     const rr=r*(1-.05*f)+.06;
     box('kashi',Math.cos(a)*rr,yP+h*f-.3,Math.sin(a)*rr,.6,.6,.06,P('kashi'),-a+PI/4);
     box('cobalt',Math.cos(a)*(rr+.03),yP+h*f-.12,Math.sin(a)*(rr+.03),.24,.24,.05,P('cobalt'),-a+PI/4);
    }
   }
  });
  const yF=tbRoundCrown(0,0,r*.95,yP+h,{walk:false});
  const yTop=tbDome(0,0,r*.95+.5,yF+1.0,3.0,{mk:'terracotta',spire:2.0});
  tbBio().windTowers++;   /* the open lantern under the spire draws the tower's stack */
  svNoWalk(()=>cyl('crystal',0,yF+1.0+3.0+.3,0,.26,.7,P('crystal'),8));
  tbTarget(0,yP,0,'beacon-watch-room',true);
  tbFurnList([
   ['tb_ustun_daybed',-1.0,yP,-1.2,0],
   ['tb_syndic_ledger_desk',.9,yP,-1.3,0],
   ['tb_zeer_cold_rack',-1.3,yP,.6,0],
   ['tb_brass_lantern_stand',1.2,yP,.7,0]
  ]);
 }
});

/* 71. Windcatcher Shade Station: open ayvan, well and a belvedere drum */
defBuilding({
 key:'tb_dz_way_shade',
 name:'Windcatcher Shade Station with Well and Belvedere Drum',
 seed:10465,w:20,d:16,h:15,budget:95000,cut:true,
 front:{x:0,z:6.0,yaw:0},
 tags:{style:'urban',variant:'desert',types:['infrastructure','inn'],role:'waystation',job:'trading'},
 build(){
  const y1=.5;
  tbPorticoPlinth(18.0,13.0,y1,{stepW:3.0,stepRun:1.1});
  /* keeper's room under a two-plate sand-hide roof */
  tbWallRing(-7.6,-5.4,-1.8,-.6,y1,3.6,{
   register:'banded',t:.44,
   holes:{s:[{at:-4.7,w:1.6,h:2.3,door:true,name:'shade-keeper-door'}],n:[{at:-4.7,w:.9,h:.9,y:1.5,flat:true}]}
  });
  tbHideRoof(-4.7,-3.0,8.0,6.6,y1+3.6+.14,{layers:2,step:2.0,rise:.6,spines:5});
  tbTarget(-4.7,y1,-3.0,'shade-keeper-room',true);
  /* the belvedere windcatcher drum and the open ayvan beside the well */
  tbDrumSolid(5.0,-3.4,1.9,y1,7.6,{});
  const yF=tbRoundCrown(5.0,-3.4,1.9*.92,y1+7.6,{walk:false});
  tbBelvedere(5.0,-3.4,1.9*.92,yF+.1,{cols:6,colH:1.6,domeH:1.8,mk:'zsolnay'});
  tbUstunAyvan(0,3.6,14.0,2.4,y1,3.2,{n:5,ganchBack:false});
  tbShadirvanPool(0,.4,3.2,2.2,y1+.28,.44,{});
  tbBanner(-7.6,y1,5.4,4.6,{pal:'flag'});
  tbTarget(0,y1,3.6,'shade-open-ayvan',true);
  tbFurnList([
   ['tb_ustun_daybed',-6.2,y1,-4.4,0],
   ['tb_trencadis_table',-3.6,y1,-4.2,0],
   ['tb_zeer_cold_rack',-2.8,y1,-1.4,0],
   ['tb_brass_lantern_stand',-4.7,y1,.4,0]
  ]);
 }
});
