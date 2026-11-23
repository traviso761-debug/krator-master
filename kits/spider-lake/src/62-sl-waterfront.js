// prefix: sl
// ================================================================= WATERFRONT QUAYS, WEIR-BRIDGES & LAKESIDE DEFENCE (SL4 + SL1)
// 8 defs (seeds 7401..7408): Silk-Weir harvest & fishing dock, Princely Barge-Quay & customs pavilion, lakeside boatwright
// slipway, arched dolomite Weir-Bridge & pergola ferry landing, Mast-Obelisk lake lighthouse, dolomite Weir-Bastion, Ham-Tsek
// Mast-Gatehouse, and Principality Silk-Guard barracks.

/* 37. Silk-Weir Harvest & Fishing Dock (SL4) */
defBuilding({key:'sl_weir_dock',name:'Silk-Weir Harvest and Fishing Dock',seed:7401,
 front:{x:0,z:5.8,yaw:0},
 w:16.4,d:13.6,h:6.8,tags:{types:['infrastructure','industry'],wealth:'poor',style:'spider-lake',job:'fishing'},
 build(){
  /* Shore quay on south (+z) + two stone-and-cedar weir jetties extending north over water with tensioned silk weir nets! */
  svNoWalk(()=>{
   box('water',0,0,-1.8,15.6,.12,8.4,P('water'));
  });
  const py=.48;
  box('dolomite',0,0,4.0,15.2,py,3.6,P('dolomiteD'));
  wkPad(0,4.0,15.2,3.6,py);
  svNoWalk(()=>{
   for(let i=0;i<3;i++)box('dolomite',0,py*i/3,6.2-.26*i,2.6,py/3,.26,P('dolomite'));
  });
  svStripWalk([0,0,6.35],[0,py,5.65],2.6);
  for(const jx of [-4.4,4.4]){
   box('porphyry',jx,0,-1.6,2.4,py-.04,7.6,P('porphyry'));
   box('floor',jx,py-.04,-1.6,2.2,.08,7.5,P('floor'));
   wkPad(jx,-1.6,2.2,7.5,py+.04);
   slPergola(jx-1.1,-4.8,jx+1.1,-.4,py+.04,2.65,{lanterns:true});
  }
  /* Tensioned silk weir mist/fish trap stretched between the two jetty tips */
  slSilkBolt([-3.2,py+2.2,-4.6],[3.2,py+2.2,-4.6],1.4,.55,P('silkIvory'));
  slCocoonLantern(0,py+2.4,4.0,.42,true);
  slTarget(0,py,4.0,'shore quay');
  slTarget(-4.4,py+.04,-2.0,'west weir pier');
  slTarget(4.4,py+.04,-2.0,'east weir pier');
  slFurnList([
   ['job_net_frame',-5.6,py,4.0,0,{setting:'outdoor'}],
   ['job_fish_tray',-2.2,py,4.0,0,{setting:'outdoor'}],
   ['generic_basket',2.2,py,4.0,0,{setting:'outdoor'}],
   ['generic_barrel',5.6,py,4.0,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',0,py,3.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 38. Princely Barge-Quay & Customs Pavilion (SL1 + SL4) */
defBuilding({key:'sl_barge_quay',name:'Princely Barge-Quay and Customs Pavilion',seed:7402,cut:true,
 w:20.4,d:16.4,h:10.4,tags:{types:['infrastructure','civic'],wealth:'rich',style:'spider-lake',job:'customs'},
 build(){
  svNoWalk(()=>{
   box('water',0,0,-4.8,19.6,.14,5.6,P('water'));
  });
  const py=.62;
  box('dolomite',0,0,2.2,19.2,py-.1,9.2,P('dolomite'));
  box('mosaic',0,py-.1,2.2,18.8,.1,8.8,P('mosaic'));
  wkPad(0,2.2,18.8,8.8,py);
  svNoWalk(()=>{
   for(let i=0;i<4;i++)box('dolomite',0,py*i/4,7.2-.28*i,3.4,py/4,.28,P('dolomite'));
   /* Moored silk-canopied princely lake barge along north quay edge z = -4.6 */
   W(0,.16,-4.6,0,()=>{
    prism('lacquer',[[-4.6,-.95],[4.6,-.95],[5.6,0],[4.6,.95],[-4.6,.95],[-5.6,0]],0,.52,P('lacquer'));
    box('floor',0,.52,0,8.6,.08,1.65,P('floor'));
    for(const sx of [-2.4,2.4])for(const sz of [-.68,.68])cyl('ebony',sx,.6,sz,.05,1.65,P('ebony'),8);
    withCloth((lp,out)=>{
     const u=clamp((lp.x+2.6)/5.2,0,1),v=clamp((lp.z+.78)/1.56,0,1);
     const pw=slSilkMath.cornerPin(u,v)*.16;out.set(0,pw,pw*.2);
    },()=>{
     psurf('brocade',(u,v)=>[(u-.5)*5.2,2.25+.32*Math.sin(PI*v),(v-.5)*1.56],8,6,WHITE,{up:true});
    });
    slCocoonLantern(-2.5,2.2,0,.35,false);
    slCocoonLantern(2.5,2.2,0,.35,false);
   });
  });
  svStripWalk([0,0,7.35],[0,py,6.1],3.4);
  /* Customs registry pavilion + Mast-Obelisks rigging a crimson-and-saffron velarium over the quay */
  slWallRing(-4.6,.4,4.6,5.2,py,3.4,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:4.6,w:1.75,h:2.3}],
   n:[{at:4.6,w:1.6,h:2.25}]
  }});
  slDoor(0,py,5.2,0,1.75,2.3,{frameMk:'porphyry',leafMk:'lacquer'});
  slDoor(0,py,.4,PI,1.6,2.25,{frameMk:'porphyry',leafMk:'lacquer',ajar:.7});
  slHipRoof(0,py+3.62,2.8,9.8,5.4,1.25,{mk:'celadon',over:.55});
  const ym=slMastObelisk(-7.8,py,-1.6,8.6,0);
  slMastObelisk(7.8,py,-1.6,8.6,0);
  slMastObelisk(-7.8,py,2.2,8.6,0);
  slMastObelisk(7.8,py,2.2,8.6,0);
  slVelarium(-7.5,-1.5,7.5,2.1,ym-.25,.75,P('silkCrimson'),{pleats:7,stripe:hc(0xe8a828)});
  slTarget(0,py,2.8,'customs hall');
  slTarget(0,py,-1.2,'barge quay');
  slFurnList([
   ['generic_poor_counter',-2.2,py,3.2,0],
   ['generic_writing_supplies',-2.2,py+.88,3.2,0],
   ['generic_strongbox',2.8,py,3.8,0],
   ['spider-lake_bolt_chest',-6.0,py,-.6,PI/2,{setting:'outdoor'}],
   ['job_bales',6.0,py,-.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',-4.2,py,-1.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',4.2,py,-1.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 39. Lakeside Boatwright & Barge Slipway */
defBuilding({key:'sl_dockyard',name:'Lakeside Boatwright and Barge Slipway',seed:7403,cut:true,
 w:16.2,d:14.4,h:8.2,tags:{types:['industry','infrastructure'],wealth:'middle',style:'ham-tsek',job:'shipwrighting'},
 build(){
  const py=.38;
  box('dolomite',0,0,1.2,14.6,py,10.2,P('dolomiteD'));
  wkPad(0,1.2,14.6,10.2,py);
  svNoWalk(()=>{
   box('water',0,0,-5.0,14.6,.12,2.6,P('water'));
   for(let i=0;i<2;i++)box('dolomite',0,py*i/2,6.6-.3*i,2.8,py/2,.3,P('dolomite'));
   /* Cedar hull keel and curved ribs of a barge on slipway stocks on east bay */
   W(3.2,py,.4,0,()=>{
    box('cedar',0,.28,0,.28,.24,7.2,P('cedarD'));
    for(let i=-4;i<=4;i++){
     const zz=i*.75,wRib=1.25-.05*i*i;
     beam('cedar',[0,.35,zz],[-wRib,1.25,zz],.09,P('cedar'),false);
     beam('cedar',[0,.35,zz],[wRib,1.25,zz],.09,P('cedar'),false);
    }
   });
  });
  svStripWalk([0,0,6.8],[0,py,6.1],2.8);
  /* West enclosed tool-and-sail loft + east open slipway roof */
  slWallRing(-6.4,-3.2,-.6,4.8,py,3.3,{mk:'cedar',postMk:'lacquer',holes:{
   s:[{at:2.9,w:1.55,h:2.2}],
   e:[{at:4.0,w:1.5,h:2.15}]
  }});
  slDoor(-3.5,py,4.8,0,1.55,2.2,{frameMk:'lacquer',leafMk:'cedar'});
  slDoor(-.6,py,.8,PI/2,1.5,2.15,{open:true});
  slHipRoof(-3.5,py+3.52,.8,6.4,8.6,1.15,{mk:'terracotta',over:.5});
  slPergola(.2,-3.4,6.4,4.6,py,3.5,{lanterns:true});
  slTarget(-3.5,py,.8,'sail loft');
  slTarget(1.2,py,3.2,'slipway deck');
  slFurnList([
   ['job_saw_bench',-4.6,py,-1.2,PI/2],
   ['generic_poor_workbench',-2.2,py,-2.0,0],
   ['job_plank_stack',-4.8,py,2.6,0],
   ['generic_barrel',5.2,py,3.6,0,{setting:'outdoor'}],
   ['spider-lake_bolt_chest',-2.0,py,3.2,PI]
  ]);
 }});

/* 40. Arched Dolomite Weir-Bridge & Pergola Ferry Landing (SL4) */
defBuilding({key:'sl_ferry_bridge',name:'Weir-Bridge and Pergola Ferry Landing',seed:7404,
 front:{x:0,z:7.2,yaw:0},
 w:14.8,d:16.4,h:8.4,tags:{types:['infrastructure'],wealth:'middle',style:'spider-lake'},
 build(){
  /* Flowing east-west canal stream registered on core/water, spanned north-south by an arched dolomite bridge */
  if(CURREC&&!PLACE_DRY){
   const a=svW(-7.0,.16,0),b=svW(7.0,.16,0);
   CURREC.river={name:'weir_bridge_canal',pts:[[a[0],a[2],a[1]],[b[0],b[2],b[1]]],width:4.4,speed:.85};
  }
  /* South & North stone abutments + stepped arched bridge deck rising to y = 1.95 at z = 0 */
  const bw=3.8,crownY=1.95;
  box('dolomite',0,0,5.6,8.4,.36,3.6,P('dolomiteD'));
  wkPad(0,5.6,8.4,3.6,.36);
  box('dolomite',0,0,-5.6,8.4,.36,3.6,P('dolomiteD'));
  wkPad(0,-5.6,8.4,3.6,.36);
  svNoWalk(()=>{
   for(let i=0;i<2;i++)box('dolomite',0,.36*i/2,7.6-.25*i,3.4,.36/2,.25,P('dolomite'));
   /* Arch piers & stepped bridge treads north and south of crown platform */
   for(const sz of [-2.4,2.4])box('porphyry',0,0,sz,bw+.36,1.15,.65,P('porphyry'));
   const nSeg=6;
   for(let i=0;i<nSeg;i++){
    const f0=i/nSeg,f1=(i+1)/nSeg;
    const zS0=lerp(4.2,1.2,f0),zS1=lerp(4.2,1.2,f1),y0=lerp(.36,crownY,f0),y1=lerp(.36,crownY,f1);
    box('dolomite',0,y0,(zS0+zS1)/2,bw,Math.max(.22,y1-y0+.18),Math.abs(zS0-zS1),P('dolomite'));
    box('dolomite',0,y0,-(zS0+zS1)/2,bw,Math.max(.22,y1-y0+.18),Math.abs(zS0-zS1),P('dolomite'));
   }
   /* Carved dolomite bridge balustrades */
   for(const sx of [-bw/2+.14,bw/2-.14]){
    beam('dolomite',[sx,.95,4.2],[sx,crownY+.75,1.2],.18,P('dolomite'),false);
    beam('dolomite',[sx,crownY+.75,1.2],[sx,crownY+.75,-1.2],.18,P('dolomite'),false);
    beam('dolomite',[sx,crownY+.75,-1.2],[sx,.95,-4.2],.18,P('dolomite'),false);
   }
  });
  /* Flat crown deck + walkable strips up south ramp, across crown, and down north ramp! */
  box('mosaic',0,crownY-.24,0,bw,.24,2.4,P('mosaic'));
  wkPad(0,0,bw,2.6,crownY);
  svStripWalk([0,0,7.7],[0,.36,7.1],3.4);
  svStripWalk([0,.36,4.3],[0,crownY,1.1],bw-.4);
  svStripWalk([0,crownY,-1.1],[0,.36,-4.3],bw-.4);
  /* SL4 Cedar pergola parasol & glowing cocoon lanterns crowning the bridge! */
  slPergola(-bw/2-.1,-1.4,bw/2+.1,1.4,crownY,2.85,{lanterns:true});
  slCocoonLantern(-1.6,crownY+2.8,0,.45,true);
  slCocoonLantern(1.6,crownY+2.8,0,.45,true);
  slTarget(0,.36,5.6,'south ferry landing');
  slTarget(0,crownY,0,'bridge crown');
  slTarget(0,.36,-5.6,'north ferry landing');
  slFurnList([
   ['generic_poor_bench',-2.8,.36,5.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',2.8,.36,5.6,0,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',-2.8,.36,-5.6,0,{setting:'outdoor'}],
   ['generic_barrel',2.8,.36,-5.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 41. Mast-Obelisk Lake Lighthouse & Signal Pavilion */
defBuilding({key:'sl_beacon_tower',name:'Mast-Obelisk Lake Lighthouse',seed:7405,cut:true,
 w:12.2,d:12.4,h:15.4,tags:{types:['infrastructure'],wealth:'rich',style:'spider-lake',landmark:true},
 build(){
  const py=slPlinth(9.6,9.6,.62,{stepW:2.6,stepRun:1.05});
  const h1=3.8,y2=py+h1+.24,h2=3.8,y3=y2+h2+.24;
  slWallRing(-3.9,-3.9,3.9,3.9,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:3.9,w:1.5,h:2.25}]
  }});
  slDoor(0,py,3.9,0,1.5,2.25,{frameMk:'porphyry',leafMk:'lacquer'});
  const sc=svStairCase({x0:-1.4,x1:2.8,z0:-2.2,z1:-.2},[py,y2,y3],{w:.85,mk:'cedar',col:P('cedar')});
  svWell('floor',0,py+h1,0,7.2,.24,7.2,P('floor'),sc.wells[0]);
  slWallRing(-3.7,-3.7,3.7,3.7,y2,h2,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:3.7,w:1.1,y:1.0,h:1.2}],
   n:[{at:3.7,w:1.1,y:1.0,h:1.2}]
  }});
  slWindow(0,y2+1.0,3.7,0,1.1,1.2);
  slWindow(0,y2+1.0,-3.7,PI,1.1,1.2);
  svWell('dolomite',0,y2+h2,0,7.2,.24,7.2,P('dolomite'),sc.wells[1]);
  /* Open colonnaded lantern gallery + great bronze signal brazier & vertical crimson silk wind-pennants */
  slColonnade(-3.0,3.0,3.0,3.0,y3,2.9,{n:3,r:.16});
  slColonnade(-3.0,-3.0,3.0,-3.0,y3,2.9,{n:3,r:.16});
  slHipRoof(0,y3+2.9,0,6.8,6.8,1.35,{mk:'celadon',over:.48});
  svNoWalk(()=>{
   cyl('bronze',1.0,y3,1.5,.68,.62,P('bronze'),12);
   sph('glow',1.0,y3+.78,1.5,.4,0xffb448,1.2,10);
   for(const sx of [-3.5,3.5]){
    pole('lacquer',[sx,y2+1.2,3.85],[sx,y3+2.4,3.85],.045,P('lacquer'),6);
    withCloth((lp,out)=>{
     const v=clamp((y3+2.2-lp.y)/3.8,0,1),pw=slSilkMath.hangPin(v)*.34;
     out.set(pw*.3,0,pw);
    },()=>{
     psurf('streamer',(u,v)=>[sx+(u-.5)*.55,y3+2.2-v*3.8,3.92+.03*Math.sin(PI*u)*v],3,10,P('silkCrimson'),{flip:true});
    });
   }
  });
  haloAt(1.0,y3+.92,1.5,0xffb850,true);
  smokeAt(1.0,y3+1.35,1.5,{r:.32,kind:'fire'});
  slTarget(-2.4,py,1.6,'keeper room');
  slTarget(-2.4,y2,1.4,'watch landing');
  slTarget(-2.4,y3,1.4,'beacon deck');
  slFurnList([
   ['generic_poor_bed',2.2,py,2.0,-PI/2],
   ['generic_lamp_oil',2.2,py,.6,0],
   ['generic_fuel',2.0,y2,1.8,0],
   ['spider-lake_cocoon_stand',-2.6,py,4.3,0,{setting:'outdoor'}]
  ]);
 }});

/* 42. Dolomite Weir-Bastion & Coast-Guard Berth */
defBuilding({key:'sl_weir_bastion',name:'Dolomite Weir-Bastion and Berth',seed:7406,cut:true,
 w:16.4,d:14.2,h:9.6,tags:{types:['military','infrastructure'],wealth:'middle',style:'ham-tsek'},
 build(){
  const py=slPlinth(14.6,12.0,.56,{stepW:3.0,stepRun:1.0});
  const h1=3.8,yDeck=py+h1+.26;
  slWallRing(-6.4,-5.2,6.4,3.8,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   s:[{at:6.4,w:1.8,h:2.35}],
   n:[{at:6.4,w:3.2,h:2.6}]
  }});
  slDoor(0,py,3.8,0,1.8,2.35,{frameMk:'porphyry',leafMk:'lacquer'});
  slDoor(0,py,-5.2,PI,3.2,2.6,{open:true});
  const st=svStair(-4.8,1.8,py,yDeck,PI,{w:1.05,mk:'dolomite',col:P('dolomite'),style:'open'});
  svWell('paving',0,py+h1,-.7,12.6,.26,8.8,P('paving'),st);
  /* Crenellated dolomite parapet & tensioned saffron watch shamiyana on roof deck */
  svNoWalk(()=>{
   for(const sz of [-5.1,3.7])box('dolomite',0,yDeck,sz,12.8,.85,.34,P('dolomite'));
   for(const sx of [-6.3,6.3])box('dolomite',sx,yDeck,-.7,.34,.85,8.4,P('dolomite'));
  });
  slShamiyana(-4.2,-3.6,4.2,2.2,yDeck,yDeck+2.7,yDeck+3.35,P('silkSaffron'));
  slCocoonLantern(-3.6,yDeck+2.6,2.2,.45,true);
  slCocoonLantern(3.6,yDeck+2.6,2.2,.45,true);
  slTarget(0,py,0,'guard berth');
  slTarget(1.2,yDeck,-.6,'bastion parapet');
  slFurnList([
   ['generic_trade_weapon_rack',-4.2,py,-2.8,0],
   ['generic_trade_bunk',4.2,py,-2.2,-PI/2],
   ['generic_barrel',4.4,py,1.8,0],
   ['generic_training_archery_butt',2.6,yDeck,-2.2,0,{setting:'outdoor'}],
   ['spider-lake_tea_brazier',0,yDeck,0,0,{setting:'outdoor'}]
  ]);
 }});

/* 43. Ham-Tsek Mast-Gatehouse (SL1) */
defBuilding({key:'sl_mast_gatehouse',name:'Ham-Tsek Mast-Gatehouse',seed:7407,cut:true,
 w:17.6,d:11.6,h:11.4,tags:{types:['military','infrastructure'],wealth:'rich',style:'ham-tsek'},
 build(){
  box('paving',0,0,0,16.2,.24,9.8,P('paving'));
  wkPad(0,0,16.2,9.8,.24);
  const py=.24,h1=4.2,yWalk=py+h1+.26;
  /* Twin dolomite & porphyry flanking gate-towers + central vaulted passage */
  slWallRing(-7.2,-3.8,-2.2,3.8,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   e:[{at:3.8,w:1.4,h:2.2}]
  }});
  slDoor(-2.2,py,0,PI/2,1.4,2.2,{frameMk:'porphyry',leafMk:'lacquer',ajar:.65});
  slWallRing(2.2,-3.8,7.2,3.8,py,h1,{mk:'dolomite',postMk:'porphyry',holes:{
   w:[{at:3.8,w:1.4,h:2.2}]
  }});
  slDoor(2.2,py,0,-PI/2,1.4,2.2,{frameMk:'porphyry',leafMk:'lacquer',ajar:.65});
  /* Main gate doors on +z entrance of passage */
  slDoor(0,py,3.6,0,3.6,3.4,{frameMk:'porphyry',leafMk:'lacquer',ajar:.8,name:'city-gate'});
  const sc=svStairCase({x0:-6.4,x1:-4.2,z0:-3.1,z1:2.4},[py,yWalk],{w:.9,mk:'cedar',col:P('cedar')});
  svWell('paving',-4.7,py+h1,0,4.8,.26,7.4,P('paving'),sc.wells[0]);
  box('paving',0,py+h1,0,4.6,.26,7.4,P('paving'));
  wkPad(0,0,4.6,7.4,yWalk);
  box('paving',4.7,py+h1,0,4.8,.26,7.4,P('paving'));
  wkPad(4.7,0,4.8,7.4,yWalk);
  svNoWalk(()=>{
   for(const sz of [-3.7,3.7])box('porphyry',0,yWalk,sz,14.6,.88,.34,P('porphyry'));
  });
  /* Twin Mast-Obelisks on tower tops rigging a crimson catenary velarium over the gate-walk! */
  const ym=slMastObelisk(-6.2,yWalk,-2.6,5.6,0,{w:.56});
  slMastObelisk(6.2,yWalk,-2.6,5.6,0,{w:.56});
  slMastObelisk(-6.2,yWalk,2.6,5.6,0,{w:.56});
  slMastObelisk(6.2,yWalk,2.6,5.6,0,{w:.56});
  slVelarium(-6.0,-2.5,6.0,2.5,ym-.25,.6,P('silkCrimson'),{pleats:6});
  slCocoonLantern(-2.6,py+3.8,4.0,.45,true);
  slCocoonLantern(2.6,py+3.8,4.0,.45,true);
  slTarget(0,py,0,'gate passage');
  slTarget(-4.7,py,0,'west guardroom');
  slTarget(4.7,py,0,'east guardroom');
  slTarget(0,yWalk,0,'gate wall-walk');
  slFurnList([
   ['generic_trade_weapon_rack',-4.7,py,-2.8,0],
   ['generic_trade_weapon_rack',4.7,py,-2.8,0],
   ['generic_poor_bench',4.7,py,1.8,PI],
   ['spider-lake_tea_brazier',0,yWalk,0,0,{setting:'outdoor'}]
  ]);
 }});

/* 44. Principality Silk-Guard Barracks & Watch-Pavilion (SL1 + SL3) */
defBuilding({key:'sl_watch_barracks',name:'Principality Silk-Guard Barracks',seed:7408,cut:true,
 w:18.4,d:15.8,h:9.6,tags:{types:['military'],wealth:'middle',style:'spider-lake'},
 build(){
  const py=slPlinth(16.6,13.6,.52,{stepW:3.2,stepRun:1.0});
  slWallRing(-7.4,-6.2,7.4,-.6,py,3.35,{mk:'dolomite',postMk:'lacquer',holes:{
   s:[{at:7.4,w:1.8,h:2.3},{at:2.8,w:1.25,y:.85,h:1.15},{at:12.0,w:1.25,y:.85,h:1.15}]
  }});
  slDoor(0,py,-.6,0,1.8,2.3,{frameMk:'porphyry',leafMk:'lacquer'});
  slWindow(-4.6,py+.85,-.6,0,1.25,1.15);
  slWindow(4.6,py+.85,-.6,0,1.25,1.15);
  slHipRoof(0,py+3.57,-3.4,15.4,6.2,1.25,{mk:'celadon',over:.55,lanterns:true});
  slSpiderLoft(0,py+4.7,-3.4,3.0,2.4,2.4,{roofMk:'celadon'});
  /* Drill court shaded by a crimson-and-saffron velarium on 4 Mast-Obelisks */
  const ym=slMastObelisk(-6.8,py,.2,7.8,0);
  slMastObelisk(6.8,py,.2,7.8,0);
  slMastObelisk(-6.8,py,5.8,7.8,0);
  slMastObelisk(6.8,py,5.8,7.8,0);
  slVelarium(-6.5,.4,6.5,5.6,ym-.25,.75,P('silkCrimson'),{pleats:6,stripe:hc(0xe8a828)});
  slTarget(0,py,-3.4,'dormitory');
  slTarget(0,py,3.0,'drill court');
  slFurnList([
   ['generic_trade_bunk',-5.2,py,-3.4,PI/2],
   ['generic_trade_bunk',5.2,py,-3.4,-PI/2],
   ['generic_trade_weapon_rack',-2.2,py,-5.2,0],
   ['generic_trade_weapon_rack',2.2,py,-5.2,0],
   ['generic_training_training_dummy',-3.6,py,3.0,0,{setting:'outdoor'}],
   ['generic_training_archery_butt',3.6,py,3.0,PI,{setting:'outdoor'}],
   ['spider-lake_cocoon_stand',0,py,5.2,0,{setting:'outdoor'}]
  ]);
 }});
