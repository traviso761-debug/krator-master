// prefix: tb
/* ================================================================= DESERT TABISTI — ROW 6B: ROUND KEEPS, THE QASR, CITY WALL & TOWERS (10466..10471)
   10466. tb_dz_keep_round    — Battered Round Keep with a Flared Lantern Chamber (soldiers, town guard)
   10467. tb_dz_fort_quad     — Qasr: Square Garrison Fort with Four Round Corner Drums (soldiers, town guard)
   10468. tb_dz_tower_ovoid   — Ovoid Teal-Patina Watchtower on a Banded Base (soldiers, coast guard)
   10469. tb_dz_wall_scallop  — Scalloped Niche-Relief City Wall Curtain with Rampart Stair (soldiers, town guard)
   10470. tb_dz_wall_tower    — Round City Wall Tower with Belvedere Crown (soldiers, town guard)
   10471. tb_dz_wall_gate     — Round-Towered City Gate under Sand-Hide Plates (town guard, customs officers) */

/* 72. Battered Round Keep with a Flared Lantern Chamber (plate: gun-ported donjon) */
defBuilding({
 key:'tb_dz_keep_round',
 name:'Battered Round Keep with Flared Lantern Chamber',
 seed:10466,w:18,d:18,h:25,budget:120000,cut:true,
 front:{x:0,z:6.4,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','civic'],role:'keep'},
 build(){
  const y1=.5,r=5.6,hR=4.8;
  tbRoundPlinth(0,0,r+1.3,y1,{skipA:PI/2,skipW:.45});
  tbFloorDisc(0,0,r+1.1,y1,'paving',P('paving'),{th:.16,seg:28});
  tbStair(0,0,r+4.4,0,y1,r+1.0,2.6,{});
  /* guard hall: the round ground room with the single door */
  tbRoundRoom(0,0,r,y1,hR,{gapW:2.0,gapA:PI/2,t:.7,b:.05,band:'cobalt',name:'keep-door'});
  /* the great battered drum above, gun-port slits and iron-capped bosses */
  const rb=r*(1-.05),yD=y1+hR;
  tbDrumSolid(0,0,rb,yD-.04,10.4,{b:.1,slits:true,nSlits:8,block:false,band:'kashi'});
  const rt=rb*(1-.1);
  svNoWalk(()=>{
   for(let k=0;k<8;k++){
    const a=k/8*TAU+PI/8,rr=rb*(1-.1*.8)+.06;
    cyl('iron',Math.cos(a)*rr,yD+10.4*.78,Math.sin(a)*rr,.2,.5,P('iron'),8);
   }
  });
  /* machicolated crown and the flared lantern chamber with its lit windows */
  const yF=tbRoundCrown(0,0,rt,yD+10.4,{walk:false});
  const yL=tbDrumSolid(0,0,rt+.5,yF,2.7,{b:-.1,band:'cobalt',slits:false,block:false,mk:'stucco'});
  svNoWalk(()=>{
   for(let k=0;k<12;k++){
    const a=k/12*TAU,rr=(rt+.5)*1.04+.02;
    box('crystal',Math.cos(a)*rr,yF+1.0,Math.sin(a)*rr,.52,.7,.06,P('crystal'),-a-PI/2);
   }
  });
  tbDome(0,0,rt+.9,yL+.1,2.6,{mk:'zsolnay',spire:1.8});
  tbTarget(0,y1,0,'keep-guard-hall',true);
  tbFurnList([
   ['tb_ustun_daybed',-2.6,y1,-2.2,0],
   ['tb_ustun_daybed',-2.6,y1,-.2,0],
   ['tb_syndic_ledger_desk',2.4,y1,-2.4,0],
   ['tb_bonded_bale_stack',2.8,y1,.2,0],
   ['tb_brass_lantern_stand',0,y1,2.6,0]
  ]);
 }
});

/* 73. Qasr: Square Garrison Fort with Four Round Corner Drums */
defBuilding({
 key:'tb_dz_fort_quad',
 name:'Qasr Garrison Fort with Four Round Corner Drums',
 seed:10467,w:40,d:40,h:19,budget:190000,cut:true,
 front:{x:0,z:17.6,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','civic'],role:'fort'},
 build(){
  const y1=.52,C=16.0,hw=4.8;
  tbPorticoPlinth(36.0,36.0,y1,{stepW:4.4,stepRun:1.3});
  /* curtain walls between the drums; the south has the gate gap */
  for(const s of [-1,1])tbWall(s*(C-2.2),C,s*3.2,C,y1,hw,{register:'banded',t:1.0});
  tbPishtaqPortal(0,y1,C,0,6.6,6.4,{openW:4.0,openH:4.3,dep:1.7,door:false});
  tbWall(-C,-(C-2.2),-C,C-2.2,y1,hw,{register:'banded',t:1.0});
  tbWall(C,-(C-2.2),C,C-2.2,y1,hw,{register:'banded',t:1.0});
  tbWall(-(C-2.2),-C,C-2.2,-C,y1,hw,{register:'banded',t:1.0});
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const x=sx*C,z=sz*C;
   tbDrumSolid(x,z,2.7,y1,10.2,{rot:sx*sz});
   const yF=tbRoundCrown(x,z,2.7*.92,y1+10.2,{walk:false});
   tbDome(x,z,2.4,yF,2.8,{mk:sz<0?'terracotta':'zsolnay',spire:.9});
  }
  tbBanner(-3.8,y1,C+1.6,5.4,{pal:'flag'});
  tbBanner(3.8,y1,C+1.6,5.4,{pal:'silkSaffron'});

  /* barracks hall on the north side under three sand-hide plates, belvedere watch-drum on top */
  tbWallRing(-12.2,-13.2,12.2,-6.4,y1,4.4,{
   register:'banded',t:.5,
   holes:{
    s:[{at:-7.6,w:1.8,h:2.4,door:true,name:'qasr-dorm'},{at:0,w:2.0,h:2.6,door:true,name:'qasr-mess'},{at:7.6,w:1.8,h:2.4,door:true,name:'qasr-armoury'}],
    n:[{at:-7.6,w:1.1,h:1.1,y:1.6,flat:true},{at:0,w:1.1,h:1.1,y:1.6,flat:true},{at:7.6,w:1.1,h:1.1,y:1.6,flat:true}]
   }
  });
  const yR=tbHideRoof(0,-9.8,26.4,9.6,y1+4.4+.14,{layers:3,step:2.6,rise:.68,spines:8});
  tbDrumSolid(0,-9.8,2.3,yR-.04,5.6,{block:false,band:'cobalt'});
  tbBelvedere(0,-9.8,2.3*.92,yR+5.56,{cols:8,colH:1.8,domeH:2.0,mk:'zsolnay'});
  tbTarget(-7.6,y1,-9.8,'qasr-dormitory',true);
  tbTarget(0,y1,-9.8,'qasr-mess-hall',true);
  tbTarget(7.6,y1,-9.8,'qasr-armoury',true);

  /* the parade court: drill ground, a domed well-house and a shadirvan */
  tbRoundRoom(9.0,3.0,3.3,y1,3.8,{gapW:1.6,gapA:PI,t:.5,b:.05,name:'qasr-wellhouse-door'});
  tbDome(9.0,3.0,3.4,y1+3.9,2.6,{mk:'terracotta',spire:.5});
  tbTarget(9.0,y1,3.0,'qasr-well-house',true);
  tbShadirvanPool(-6.0,3.0,4.0,3.0,y1+.3,.46,{jet:true});
  tbTarget(0,y1,5.6,'qasr-parade-court',false);
  tbFurnList([
   ['tb_ustun_daybed',-9.4,y1,-11.2,0],
   ['tb_ustun_daybed',-6.4,y1,-11.2,0],
   ['tb_trencadis_table',-1.2,y1,-11.0,0],
   ['tb_ganch_screen_bench',1.4,y1,-11.4,0],
   ['tb_bonded_bale_stack',8.0,y1,-11.0,0],
   ['tb_zeer_cold_rack',10.2,y1,-8.4,0],
   ['tb_syndic_ledger_desk',9.0,y1,3.0,0]
  ]);
 }
});

/* 74. Ovoid Teal-Patina Watchtower on a Banded Base (plate: glazed egg tower) */
defBuilding({
 key:'tb_dz_tower_ovoid',
 name:'Ovoid Teal-Patina Watchtower on a Banded Base',
 seed:10468,w:18,d:18,h:33,budget:130000,cut:true,
 front:{x:0,z:7.0,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','infrastructure'],role:'watchtower'},
 build(){
  const y1=.5,r=5.0,hB=4.6;
  tbRoundPlinth(0,0,r+1.4,y1,{skipA:PI/2,skipW:.45});
  tbFloorDisc(0,0,r+1.2,y1,'paving',P('paving'),{th:.16,seg:28});
  tbStair(0,0,r+4.6,0,y1,r+1.1,2.4,{});
  tbRoundRoom(0,0,r,y1,hB,{gapW:1.9,gapA:PI/2,t:.7,b:0,plain:true,name:'ovoid-door'});
  /* the egg: one lathe profile, buff brick below, a patchy teal glaze creeping up the east and south faces */
  const y0=y1+hB-.04;
  const prof=[[r+.02,0],[r+.55,2.6],[r+.5,7.0],[r-.5,12.4],[r-1.8,17.6],[r-3.0,21.4],[r-4.0,23.8],[.1,25.2]];
  const P2=prof.map(q=>[q[0],y0+q[1]]);
  const prof2=prof.map(q=>[q[0]+.05,y0+q[1]]);
  svNoWalk(()=>{
   lathe('buffbrick',0,0,P2,TB_DZ_SEG,P('buffbrick'),{uv:'cone'});
   lathe('kashi',0,0,prof2.slice(2,7),TB_DZ_SEG,P('kashi'),{a0:-.6,a1:2.3});
   lathe('kashi',0,0,prof2.slice(3,6),TB_DZ_SEG,P('kashi'),{a0:3.4,a1:4.3});
   for(const yy of [2.6,11.0]){
    const f=yy/25.2;
    cyl('rosebrick',0,y0+yy,0,r+.58-f*3.2,.28,P('rosebrick'),TB_DZ_SEG);
   }
   for(let k=0;k<10;k++){
    const a=k/10*TAU+.2,yy=6+(k%4)*4.2,rad=prof[Math.min(6,Math.floor(yy/4))][0]-.2+.0;
    box('iron',Math.cos(a)*(rad+.08),y0+yy,Math.sin(a)*(rad+.08),.16,.7,.12,P('iron'),-a);
   }
  });
  tbBio().windTowers++;   /* the belly arcade vents the egg's stack */
  /* belly gallery: a corbelled ring with an arcade of arched lamps at the widest point */
  svNoWalk(()=>{
   const yG=y0+7.8;
   for(let s=0;s<3;s++)cyl(s%2?'kashi':'rosebrick',0,yG+s*.18,0,r+.6+.18*s,.18,P(s%2?'kashi':'rosebrick'),TB_DZ_SEG);
   for(let k=0;k<14;k++){
    const a=k/14*TAU;
    box('crystal',Math.cos(a)*(r+.65),yG+.7,Math.sin(a)*(r+.65),.5,.8,.06,P('crystal'),-a-PI/2);
   }
   cyl('ashlar',0,yG+1.8,0,r+.9,.22,P('ashlar'),TB_DZ_SEG);
  });
  tbDome(0,0,3.2,y0+23.3,2.4,{mk:'zsolnay',spire:1.4});
  tbTarget(0,y1,0,'ovoid-ground-chamber',true);
  tbFurnList([
   ['tb_ustun_daybed',-2.2,y1,-1.8,0],
   ['tb_syndic_ledger_desk',2.2,y1,-2.0,0],
   ['tb_bonded_bale_stack',-2.6,y1,.8,0],
   ['tb_brass_lantern_stand',2.4,y1,.9,0]
  ]);
 }
});

/* 75. Scalloped Niche-Relief City Wall Curtain with Rampart Stair (plate: carved sand-brick wall) */
defBuilding({
 key:'tb_dz_wall_scallop',
 name:'Scalloped Niche-Relief City Wall Curtain',
 seed:10469,w:22,d:12,h:11,budget:100000,cut:false,
 front:{x:0,z:4.4,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','infrastructure'],role:'wall-curtain'},
 build(){
  const y1=.5,hWall=4.8,yW=y1+hWall,L=19.0,t=2.4;
  tbPorticoPlinth(20.0,8.0,y1,{stepW:3.0,stepRun:1.0});
  tbWall(-L/2,0,L/2,0,y1,hWall,{register:'banded',t:t,mk:'buffbrick'});
  /* niche panels and pointed pilasters on the city-facing side (z = +t/2) and the field face (z = -t/2) */
  const xs=[-7.2,-3.6,0,3.6,7.2];
  for(const sd of [-1,1]){
   const zf=sd*(t/2+.07);
   for(const x of xs)W(x,0,zf,sd<0?PI:0,()=>tbNichePanel(0,y1+.5,0,2.2,hWall-.9));
   for(const x of [-9.3,-5.4,-1.8,1.8,5.4,9.3]){
    svNoWalk(()=>{
     box('rosebrick',x,y1,sd*(t/2+.14),.7,hWall,.28,P('rosebrick'));
     box('kashi',x,yW-.05,sd*(t/2+.14),.5,.5,.3,P('kashi'),0,0,PI/4);
    });
   }
  }
  /* scalloped merlons on both parapets and the walkable top */
  tbFloorSlab(0,yW,0,L-.2,t-.9,{mk:'paving',th:.2});
  svNoWalk(()=>{
   for(const sd of [-1,1])for(let k=0;k<22;k++){
    const x=-L/2+.5+k*(L-1)/21,z=sd*(t/2-.2);
    if(sd>0&&x>5.2&&x<8.3)continue;   /* the stair lands here */
    cyl('buffbrick',x,yW,z,.26,.62,P('buffbrick'),8);
    sph('buffbrick',x,yW+.62,z,.26,P('buffbrick'),.8,8);
   }
  });
  /* rampart stair behind the wall to the walk */
  tbWindTower(-8.6,3.4,.9,y1,6.6,{pedH:1.6});
  tbStair(-3.0,y1,2.6,5.6,yW,2.6,1.5,{});
  tbFloorSlab(6.7,yW-.04,1.8,2.4,2.6,{mk:'paving',th:.2});
  tbTarget(0,yW,0,'scallop-rampart-walk',false);
 }
});

/* 76. Round City Wall Tower with Belvedere Crown (plate: flared-crown wall towers) */
defBuilding({
 key:'tb_dz_wall_tower',
 name:'Round City Wall Tower with Belvedere Crown',
 seed:10470,w:22,d:16,h:26,budget:130000,cut:true,
 front:{x:0,z:5.8,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','infrastructure'],role:'wall-tower'},
 build(){
  const y1=.5,r=4.7,hR=4.4;
  tbRoundPlinth(0,0,r+1.0,y1,{skipA:PI/2,skipW:.45});
  tbFloorDisc(0,0,r+.8,y1,'paving',P('paving'),{th:.16,seg:28});
  tbStair(0,0,r+3.6,0,y1,r+.9,2.4,{});
  tbRoundRoom(0,0,r,y1,hR,{gapW:1.8,gapA:PI/2,t:.7,b:.04,name:'wall-tower-door'});
  /* curtain stubs either side, with niche panels */
  for(const s of [-1,1]){
   tbWall(s*(r-.4),0,s*9.4,0,y1,4.4,{register:'banded',t:1.8});
   W(s*7.2,0,.97,0,()=>tbNichePanel(0,y1+.5,0,2.0,3.5));
   W(s*7.2,0,-.97,PI,()=>tbNichePanel(0,y1+.5,0,2.0,3.5));
  }
  /* the shaft, then the belvedere */
  const rb=r*(1-.04),yD=y1+hR;
  tbDrumSolid(0,0,rb,yD-.04,12.2,{b:.1,nSlits:6,block:false,band:'kashi'});
  const rt=rb*(1-.1);
  tbBelvedere(0,0,rt,yD+12.16,{cols:10,colH:2.1,domeH:2.4,mk:'terracotta'});
  tbBanner(-r-1.0,y1,r+1.4,6.4,{pal:'flag'});
  tbBanner(r+1.0,y1,r+1.4,6.4,{pal:'silkSaffron'});
  tbTarget(0,y1,0,'wall-tower-guard-room',true);
  tbFurnList([
   ['tb_ustun_daybed',-2.2,y1,-1.8,0],
   ['tb_syndic_ledger_desk',2.2,y1,-2.0,0],
   ['tb_bonded_bale_stack',-2.6,y1,.8,0],
   ['tb_brass_lantern_stand',2.4,y1,.9,0]
  ]);
 }
});

/* 77. Round-Towered City Gate under Sand-Hide Plates */
defBuilding({
 key:'tb_dz_wall_gate',
 name:'Round-Towered City Gate under Sand-Hide Plates',
 seed:10471,w:34,d:22,h:21,budget:170000,cut:true,
 front:{x:0,z:9.0,yaw:0},
 tags:{style:'urban',variant:'desert',types:['military','infrastructure','civic'],role:'city-gate',job:'customs'},
 build(){
  const y1=.52,h1=4.4,y2=y1+h1,h2=3.2,yRoof=y2+h2;
  tbPorticoPlinth(24.0,15.4,y1,{stepW:4.8,stepRun:1.25});
  tbPishtaqPortal(0,y1,6.0,0,7.8,6.8,{openW:3.8,openH:4.3,dep:1.6,door:false});
  /* the round drums that flank the gate */
  for(const s of [-1,1]){
   const x=s*11.0,z=3.8;
   tbDrumSolid(x,z,3.0,y1,11.6,{rot:s});
   const yF=tbRoundCrown(x,z,3.0*.92,y1+11.6,{walk:false});
   tbDome(x,z,2.6,yF,2.8,{mk:s<0?'terracotta':'zsolnay',spire:1.0});
   tbBanner(x,y1,z+3.6,5.8,{pal:s<0?'flag':'silkSaffron'});
  }
  for(const s of [-1,1]){
   const xA=s<0?-8.0:2.4,xB=s<0?-2.4:8.0,cx=(xA+xB)/2;
   tbWallRing(xA,-6.4,xB,4.6,y1,h1,{
    register:'banded',t:.48,
    holes:{
     s:[{at:cx,w:1.55,h:2.3,door:true,name:'dgate-guard-'+(s<0?'w':'e')}],
     e:s<0?[{at:-1.0,w:1.55,h:2.3,door:true,name:'dgate-passage-w'}]:[{at:-1.0,w:1.1,h:1.3,y:1.2,flat:true}],
     w:s>0?[{at:-1.0,w:1.55,h:2.3,door:true,name:'dgate-passage-e'}]:[{at:-1.0,w:1.1,h:1.3,y:1.2,flat:true}],
     n:[{at:cx,w:1.2,h:1.3,y:1.2,flat:true}]
    }
   });
  }
  const st=tbInteriorStair(5.2,-3.8,y1,y2,0,{w:1.18});
  tbFloorSlab(0,y2,-.9,16.2,10.8,{mk:'floor',th:.2,hole:st});
  tbKundalCeiling(0,y2-.28,-.9,4.4,10.2,{mk:'kundal'});
  tbKundalCeiling(-5.2,y2-.28,-.9,5.0,10.2,{mk:'kundal'});
  /* customs gallery over the passage, then three sand-hide plates */
  tbWallRing(-8.0,-6.2,8.0,4.4,y2,h2,{
   register:'secession',
   holes:{
    s:[{at:-4.8,w:1.5,h:1.5,y:.92},{at:0,w:1.7,h:1.55,y:.92,proj:.44},{at:4.8,w:1.5,h:1.5,y:.92}],
    n:[{at:-4.6,w:1.4,h:1.4,y:.95},{at:0,w:1.5,h:1.45,y:.95},{at:4.6,w:1.4,h:1.4,y:.95}]
   }
  });
  tbHideRoof(0,-.9,19.0,13.2,yRoof+.14,{layers:3,step:3.6,rise:.7,spines:8});
  tbBanner(-4.2,y1,7.2,5.4,{pal:'flag'});
  tbBanner(4.2,y1,7.2,5.4,{pal:'flag'});
  tbTarget(0,y1,-.9,'dgate-breezeway-passage',true);
  tbTarget(-5.2,y1,-.9,'dgate-west-customs-room',true);
  tbTarget(5.2,y1,2.6,'dgate-east-guard-room',true);
  tbTarget(-2.0,y2,-.9,'dgate-portcullis-gallery',true);
  tbFurnList([
   ['tb_syndic_ledger_desk',-5.2,y1,-2.8,0],
   ['tb_bonded_bale_stack',-5.2,y1,1.6,PI],
   ['tb_ganch_screen_bench',5.2,y1,-5.2,0],
   ['tb_syndic_ledger_desk',-2.6,y2,-2.6,0],
   ['tb_zeer_cold_rack',1.8,y2,1.8,PI],
   ['tb_brass_lantern_stand',-1.6,y1,3.2,0],
   ['tb_brass_lantern_stand',1.6,y1,-4.2,0]
  ]);
 }
});
