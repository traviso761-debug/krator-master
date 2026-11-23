// prefix: hk
// ================================================================= MEGATSUNAMI WATERFRONT, PROU-TORRE, CLIFF HOIST & DEFENCE (HK4 + HK1)
// 9 defs (seeds 8401..8409): Prow-Shaped Hexagonal Columnar-Basalt Lagoon Wave-Splitter with Leviathan Whale-Jawbone Arch,
// Streamlined Intertidal Nuraghe Prou-Torre Refuge Keep (+8 m solid basalt prow), 90-Second Gravity Water-Counterweight Cliff
// Hoist & Via Ferrata Stair, Perched Tsunami-Safe Baidarka Shipyard, Caldera-Throat Quay, Columnar Weir-Bridge (core/water),
// Whale-Oil Beacon Nuraghe Lighthouse, Trilobate Nuraghe Cliff Gatehouse, and Tsunami-Watch Harpoon-Guard Barracks.

/* 37. Prow-Shaped Hexagonal Columnar-Basalt Lagoon Wave-Splitter & Leviathan Jawbone Arch */
defBuilding({key:'hk_wave_splitter',name:'Columnar-Basalt Lagoon Wave-Splitter and Jawbone Arch',seed:8401,
 front:{x:0,z:7.4,yaw:0},
 w:16.8,d:19.6,h:10.6,tags:{types:['infrastructure'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  /* Surrounding lagoon water sheet on north/flanks + sharp 32-degree stepped hexagonal columnar-basalt cutwater prow pointing
     seaward (-z), walkable upper spine deck, and monumental bleached Leviathan Whale-Jawbone Arch! */
  svNoWalk(()=>{
   box('water',0,0,-1.8,15.8,.12,13.6,P('water'));
   /* Lower & mid stepped hexagonal basalt prow wedges shearing tsunami bores */
   prism('columnar',[[-5.6,6.2],[5.6,6.2],[4.2,-1.2],[0,-8.6],[-4.2,-1.2]],0,1.45,P('columnar'));
   prism('basalt',[[-4.6,5.8],[4.6,5.8],[3.3,-.8],[0,-7.0],[-3.3,-.8]],1.45,2.85,P('basalt'));
   /* Vertical basalt organ-pipe column clusters flanking the seaward cutwater nose */
   for(let i=-3;i<=3;i++){
    const f=Math.abs(i)/3,px=i*1.15,pz=-7.0+f*4.8;
    cyl('columnar',px,0,pz,.48,3.25-.38*Math.abs(i),P('columnar'),6);
   }
   /* Access stair on shoreward (+z) stern climbing from y=0 to spine deck y=3.05 */
   const ns=14;
   for(let i=0;i<ns;i++){
    const f0=i/ns,f1=(i+1)/ns,za=lerp(8.4,5.4,f0),zb=lerp(8.4,5.4,f1);
    box('ashlar',0,3.05*f0,(za+zb)/2,2.8,3.05/ns,Math.abs(za-zb),P('ashlar'));
   }
  });
  /* Walkable upper spine platform at y = 3.05 + stair strip from front */
  box('paving',0,2.85,1.8,6.8,.2,7.2,P('paving'));
  wkPad(0,1.8,6.8,7.2,3.05);
  svStripWalk([0,0,8.5],[0,3.05,5.3],2.8);

  /* Monumental bleached Leviathan Whale-Jawbone Arch + tuned nephrite bore-warning chimes crowning the splitter! */
  hkWhaleJawArch(0,3.05,.8,0,5.6,6.2);
  hkWindHanging(-2.8,3.05,4.2,0,1.8,2.6,{mk:'banner',panels:2});
  hkWindHanging(2.8,3.05,4.2,0,1.8,2.6,{mk:'banner',panels:2});
  haloAt(0,7.8,.8,0xffb454,true);

  hkTarget(0,3.05,2.2,'wave-splitter crown');
  hkFurnList([
   ['hueru-kuran_tide_gauge_plinth',-2.4,3.05,-.8,0,{setting:'outdoor'}],
   ['hueru-kuran_whale_oil_hearth',0,3.05,3.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.4,3.05,-.8,0,{setting:'outdoor'}],
   ['hueru-kuran_harpoon_rack',2.4,3.05,2.4,-PI/2,{setting:'outdoor'}]
  ]);
 }});

/* 38. Streamlined Intertidal Nuraghe Prou-Torre Megatsunami Refuge Keep (+8 m solid prow + elevated hatch!) */
defBuilding({key:'hk_prou_torre',name:'Intertidal Nuraghe Prou-Torre Tsunami Refuge Keep',seed:8402,cut:true,
 front:{x:0,z:7.8,yaw:0},
 w:16.4,d:18.8,h:14.6,tags:{types:['infrastructure','military'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  /* Solid battered columnar-basalt lower prow up to yHatch = 8.0 m so megatsunami bores pass around solid stone,
     surmounted by a hollow corbelled refuge chamber (y = 8.0..11.8 m), mensoloni crown, and external stair flight! */
  const yMid=4.0,yHatch=8.0;
  svNoWalk(()=>{
   /* Seaward (-z) hydrodynamic columnar-basalt cutwater prow up to +8.0 m */
   prism('columnar',[[-4.2,-.6],[4.2,-.6],[2.8,-5.2],[0,-8.2],[-2.8,-5.2]],0,4.2,P('columnar'));
   prism('basalt',[[-3.5,-.6],[3.5,-.6],[2.2,-4.4],[0,-6.8],[-2.2,-4.4]],4.2,yHatch,P('basalt'));
  });
  /* Main Nuraghe Prou-Torre: solidBelow = 8.0 m, hollow refuge tholos from 8.0 m to 12.2 m! */
  hkNuraghe(0,-.4,0,5.2,3.65,12.2,{
   wallT:1.28,courses:13,solidBelow:yHatch,
   doors:[{yaw:0,y:yHatch,w:1.32,h:2.05}],
   windows:[{yaw:PI/2,y:yHatch+1.1,w:.78,h:.88},{yaw:-PI/2,y:yHatch+1.1,w:.78,h:.88},{yaw:PI,y:yHatch+1.1,w:.78,h:.88}]
  });
  /* Walkable interior refuge floor at y = yHatch + 0.08 */
  svNoWalk(()=>cyl('floor',0,yHatch,-.4,2.55,.08,P('floor'),18));
  svFloor(hkOctPts(0,-.4,2.5,12),yHatch+.08);

  /* External two-flight rock-cut & bronze-railed tsunami escape stair on south/east flank:
     Flight 1: ground (0, 0, 7.6) -> mid corbelled landing (4.8, 4.0, 4.4)
     Flight 2: mid landing (4.8, 4.0, 3.6) -> elevated +8.0 m nephrite-lintel hatch gallery (0, 8.0, 4.4)! */
  box('columnar',0,0,7.4,3.4,.28,1.8,P('columnar'));
  wkPad(0,7.4,3.4,1.8,.28);

  box('corbel',4.8,yMid-.32,4.0,2.4,.32,2.6,P('corbel'));
  wkPad(4.8,4.0,2.4,2.6,yMid);

  box('corbel',0,yHatch-.32,4.35,3.2,.32,1.9,P('corbel'));
  wkPad(0,4.35,3.2,1.9,yHatch);

  svNoWalk(()=>{
   /* Supporting basalt pier under mid landing */
   box('columnar',4.8,0,4.0,1.4,yMid-.32,1.4,P('columnar'));
   const drawSteps=(a,b,n)=>{
    for(let i=0;i<n;i++){
     const f=(i+.5)/n;
     box('cypress',lerp(a[0],b[0],f),lerp(a[1],b[1],f)-.06,lerp(a[2],b[2],f),1.15,.08,.36,P('cypress'),Math.atan2(b[0]-a[0],b[2]-a[2]));
    }
    beam('bronze',[a[0],a[1]+.88,a[2]],[b[0],b[1]+.88,b[2]],.045,P('bronze'),true,6);
   };
   drawSteps([1.2,.28,7.2],[4.4,yMid,4.8],14);
   drawSteps([4.2,yMid,3.4],[1.2,yHatch,4.35],15);
  });
  svStripWalk([1.0,.28,7.3],[4.5,yMid,4.6],1.2);
  svStripWalk([4.4,yMid,3.5],[1.1,yHatch,4.35],1.2);
  wkPad(0,3.2,1.8,2.4,yHatch+.08);

  hkNephriteChimes(0,yHatch+2.6,4.5,0,2.0,.95,4);

  hkTarget(0,.28,7.4,'intertidal foot');
  hkTarget(4.8,yMid,4.0,'mid escape landing');
  hkTarget(0,yHatch+.08,-.4,'+8 m tsunami refuge tholos');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',0,yHatch+.08,-.4,0],
   ['hueru-kuran_whalebone_cot',-1.35,yHatch+.08,-.6,PI/2],
   ['hueru-kuran_kaen_storage_jar',1.35,yHatch+.08,-1.2,0,{v:0}],
   ['generic_rations',1.2,yHatch+.08,.6,0],
   ['hueru-kuran_jade_lamp_pedestal',-1.4,yHatch,4.5,0,{setting:'outdoor'}]
  ]);
 }});

/* 39. 90-Second Gravity Water-Counterweight Cliff Hoist & Via Ferrata Stair */
defBuilding({key:'hk_cliff_hoist',name:'Gravity Water-Counterweight Cliff Hoist and Via Ferrata',seed:8403,
 front:{x:0,z:7.6,yaw:0},
 w:19.6,d:17.8,h:13.8,tags:{types:['infrastructure'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  /* 8.2 m columnar-basalt cliff buttress on north (-z), lower harbour loading apron on south (+z), overhead red-cypress
     & bronze-sheave headframe at +12.4 m, suspended crew/boat cage on west shaft, counterbalancing banded water-ballast
     tank on east shaft, and walkable rock-cut zigzag via ferrata stair climbing all the way to yCliff = 8.2 m! */
  const py=.44,yMid=4.3,yCliff=8.2;
  /* Lower quay apron */
  box('columnar',0,0,4.8,17.6,py-.08,5.6,P('columnar'));
  box('paving',0,py-.08,4.8,17.2,.08,5.2,P('paving'));
  wkPad(0,4.8,17.2,5.2,py);
  svNoWalk(()=>{
   for(let i=0;i<3;i++)box('ashlar',0,py*i/3,7.9-.26*i,3.2,py/3,.26,P('ashlar'));
  });
  svStripWalk([0,0,8.05],[0,py,7.25],3.2);

  /* Upper +8.2 m basalt cliff-rim terrace platform on north [-8.2..8.2, -7.2..-2.2] */
  svNoWalk(()=>box('columnar',0,0,-4.7,16.4,yCliff-.16,5.0,P('columnar')));
  box('ashlar',0,yCliff-.16,-4.7,16.0,.16,4.8,P('ashlar'));
  wkPad(0,-4.7,16.0,4.8,yCliff);

  /* Live core/water ballast-charging cistern on upper cliff terrace feeding the counterweight tank! */
  if(CURREC&&!PLACE_DRY){
   const a=svW(1.8,yCliff+.26,-6.2),b=svW(5.6,yCliff+.26,-4.2);
   const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),z0=Math.min(a[2],b[2]),z1=Math.max(a[2],b[2]);
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'cliff_hoist_ballast_cistern',level:yCliff+.26,bounds:[x0,z0,x1,z1],
    color:0x1e5c60,roughness:.05,metalness:.16,envMapIntensity:.75
   });
  }

  svNoWalk(()=>{
   /* Cistern curbing on upper cliff */
   for(const sz of [-6.35,-4.05])box('ashlar',3.7,yCliff,sz,4.2,.38,.28,P('ashlar'));
   for(const sx of [1.65,5.75])box('ashlar',sx,yCliff,-5.2,.28,.38,2.02,P('ashlar'));
   /* Cantilevered red-cypress & bronze A-frame hoist headframe projecting over cliff lip (z = -2.2 .. +1.2) */
   const yHead=yCliff+3.8;
   for(const sx of [-4.8,-1.6,1.6,4.8]){
    beam('cypress',[sx,yCliff,-4.2],[sx,yHead,.8],.22,P('cypress'),false);
    beam('cypress',[sx,yCliff-2.4,-2.1],[sx,yHead,.8],.18,P('cypressD'),false);
   }
   box('cypress',0,yHead,.8,10.6,.26,.65,P('cypress'));
   /* Twin giant cast-bronze hoist sheaves + braided baleen-and-iron counterweight cables */
   for(const sx of [-3.2,3.2]){
    cyl('bronze',sx,yHead-.45,.8,.62,.18,P('bronze'),16);
   }
   /* West shaft: suspended crew & cargo cage at y = 3.2 m */
   pole('rope',[-3.2,py+3.95,.8],[-3.2,yHead-.2,.8],.03,P('rope'),8);
   W(-3.2,py+2.1,.8,0,()=>{
    box('cypress',0,0,0,2.4,.14,2.2,P('cypress'));
    for(const cx of [-1.1,1.1])for(const cz of [-1.0,1.0])pole('cypress',[cx,.14,cz],[cx,1.85,cz],.06,P('cypressD'),6);
    box('whalebone',0,1.85,0,2.4,.1,2.2,P('whalebone'));
   });
   /* East shaft: counterbalancing bronze-banded red-cypress water-ballast tank at y = 5.4 m */
   pole('rope',[3.2,py+6.8,.8],[3.2,yHead-.2,.8],.03,P('rope'),8);
   cyl('tarwood',3.2,py+4.8,.8,1.05,1.85,P('tarwood'),16);
   for(const dy of [.25,.92,1.6])ring('bronze',3.2,py+4.8+dy,.8,1.08,.045,P('bronze'),0,0,0,16);
  });

  /* Rock-cut zigzag Via Ferrata stair climbing west & north cliff face:
     Flight 1: lower apron (-6.8, py, 2.8) -> mid cliff shelf (-6.8, yMid, .2)
     Flight 2: mid cliff shelf (-6.2, yMid, -1.1) -> upper cliff rim (-2.6, yCliff, -2.5) */
  box('corbel',-6.6,yMid-.28,-.5,2.8,.28,2.6,P('corbel'));
  wkPad(-6.6,-.5,2.8,2.6,yMid);
  svNoWalk(()=>{
   box('columnar',-6.6,0,-.5,2.4,yMid-.28,2.2,P('columnar'));
   const vfSteps=(a,b,n)=>{
    for(let i=0;i<n;i++){
     const f=(i+.5)/n;
     box('ashlar',lerp(a[0],b[0],f),lerp(a[1],b[1],f)-.07,lerp(a[2],b[2],f),1.15,.09,.34,P('ashlar'),Math.atan2(b[0]-a[0],b[2]-a[2]));
    }
    beam('iron',[a[0],a[1]+.85,a[2]+.52],[b[0],b[1]+.85,b[2]+.52],.035,P('iron'),true,6);
   };
   vfSteps([-6.8,py,4.4],[-6.8,yMid,.2],18);
   vfSteps([-6.0,yMid,-1.1],[-1.6,yCliff,-2.4],18);
  });
  svStripWalk([-6.8,py,4.5],[-6.8,yMid,.1],1.25);
  svStripWalk([-6.1,yMid,-1.1],[-1.6,yCliff,-2.5],1.25);

  hkNephriteChimes(0,yCliff+3.55,.8,0,2.2,1.0,4);

  hkTarget(0,py,4.8,'lower hoist quay');
  hkTarget(-6.7,yMid,-.7,'via ferrata switchback');
  hkTarget(-2.4,yCliff,-4.7,'upper cliff headframe');
  hkFurnList([
   ['hueru-kuran_driftwood_chest',-3.2,py,5.2,0,{setting:'outdoor'}],
   ['generic_barrel',3.2,py,5.2,0,{setting:'outdoor'}],
   ['hueru-kuran_tide_gauge_plinth',-2.4,yCliff,-5.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',0,py,6.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',0,yCliff,-3.2,0,{setting:'outdoor'}]
  ]);
 }});

/* 40. Perched Tsunami-Safe Slipway & Baidarka Shipyard */
defBuilding({key:'hk_baidarka_yard',name:'Perched Tsunami-Safe Slipway and Baidarka Shipyard',seed:8404,cut:true,
 w:21.2,d:16.8,h:9.4,tags:{types:['industry','infrastructure'],wealth:'middle',style:'hueru-kuran',job:'shipwrighting'},
 build(){
  const py=.48;
  box('columnar',0,0,1.6,19.2,py-.08,10.4,P('columnar'));
  box('paving',0,py-.08,1.6,18.8,.08,10.0,P('paving'));
  wkPad(0,1.6,18.8,10.0,py);
  svNoWalk(()=>{
   box('water',0,0,-5.4,19.2,.12,3.4,P('water'));
   for(let i=0;i<3;i++)box('ashlar',0,py*i/3,7.2-.26*i,3.0,py/3,.26,P('ashlar'));
   /* Greased tarwood launch rails sloping into north caldera throat + two baidarka/umiak hulls on stocks! */
   for(const rx of [2.4,4.2,6.2,7.8]){
    beam('tarwood',[rx,py+.08,3.6],[rx,.12,-5.6],.16,P('tarwood'),false);
   }
   hkBaidarka(3.3,py+.38,-.2,PI,6.8);
   hkBaidarka(7.0,py+.34,.4,PI,5.4);
   /* Massive 11 m cantilevered salt-bleached driftwood flensing & boat-launch crane boom! */
   cyl('columnar',0,py,-2.4,.52,1.2,P('columnar'),8);
   beam('driftwood',[0,py+1.1,-2.4],[4.8,py+6.8,-4.8],.22,P('driftwood'),true,10,.13);
   beam('cypress',[0,py+3.6,-2.4],[2.6,py+4.2,-3.7],.12,P('cypress'),false);
   pole('rope',[4.6,py+6.6,-4.7],[4.6,py+2.2,-4.7],.02,P('rope'),6);
  });
  svStripWalk([0,0,7.35],[0,py,6.55],3.0);

  /* West whale-rib & gutskin skin-boat sewing chise */
  hkChise(-4.8,.8,py,4.6,2.2,2.65,2.25,{
   ribs:10,crownH:.78,crownFins:4,
   doors:[{yaw:0,w:1.45,h:2.12},{yaw:PI/2,w:1.3,h:2.0,ajar:.75}],
   windows:[{yaw:-PI/2,w:.84,y:1.0,h:.88}]
  });
  hkGutskinAwning(1.8,-2.8,8.6,4.2,py,py+3.55,{sag:.26});

  hkTarget(-4.8,py+.08,.8,'skin-boat loft');
  hkTarget(4.8,py,4.8,'slipway stage');
  hkFurnList([
   ['hueru-kuran_baleen_bow_trough',-4.8,py+.08,-.8,0],
   ['hueru-kuran_harpoon_rack',-6.2,py+.08,.8,PI/2],
   ['hueru-kuran_kaen_storage_jar',-3.5,py+.08,2.0,0,{v:0}],
   ['job_saw_bench',1.8,py,4.8,0,{setting:'outdoor'}],
   ['hueru-kuran_blubber_kettle',-1.2,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 41. Caldera-Throat Columnar Quay & Tide-Gauge Customs Berth */
defBuilding({key:'hk_crater_quay',name:'Caldera-Throat Columnar Quay and Customs Berth',seed:8405,cut:true,
 w:20.4,d:16.4,h:9.6,tags:{types:['infrastructure','civic'],wealth:'rich',style:'hueru-kuran',job:'customs'},
 build(){
  const py=.58;
  svNoWalk(()=>{
   box('water',0,0,-4.8,19.6,.14,5.4,P('water'));
   for(let i=-4;i<=4;i++)cyl('columnar',i*2.15,0,-2.0,.42,py+.48,P('columnar'),6);
   /* Moored whale-clan skin-and-cypress sea-tender along north quay */
   hkBaidarka(-3.2,.18,-4.5,PI/2,8.4);
   for(let i=0;i<4;i++)box('ashlar',0,py*i/4,7.2-.28*i,3.4,py/4,.28,P('ashlar'));
  });
  box('columnar',0,0,2.2,19.2,py-.1,9.0,P('columnar'));
  box('paving',0,py-.1,2.2,18.8,.1,8.6,P('paving'));
  wkPad(0,2.2,18.8,8.6,py);
  svStripWalk([0,0,7.35],[0,py,6.2],3.4);

  /* Customs registry nuraghe + gutskin cargo inspection canopy */
  hkNuraghe(-4.6,1.8,py,3.75,2.75,7.4,{
   wallT:1.2,courses:8,
   doors:[{yaw:0,w:1.45,h:2.15},{yaw:PI,w:1.3,h:2.05,ajar:.7}],
   windows:[{yaw:PI/2,w:.8,y:3.5,h:.88}]
  });
  hkGutskinAwning(1.2,-1.4,7.8,4.8,py,py+3.25,{sag:.26});
  hkNephriteChimes(4.5,py+3.15,-1.4,0,2.6,1.05,5);

  hkTarget(-4.6,py+.08,1.8,'customs nuraghe');
  hkTarget(4.5,py,1.6,'cargo berth');
  hkFurnList([
   ['generic_poor_counter',-4.6,py+.08,.6,0],
   ['generic_writing_supplies',-4.6,py+.96,.6,0],
   ['generic_strongbox',-5.6,py+.08,2.6,PI/2],
   ['hueru-kuran_tide_gauge_plinth',.2,py,-1.2,0,{setting:'outdoor'}],
   ['hueru-kuran_driftwood_chest',3.6,py,1.6,0,{setting:'outdoor'}],
   ['job_bales',6.2,py,1.6,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',0,py,5.6,0,{setting:'outdoor'}]
  ]);
 }});

/* 42. Columnar-Basalt Caldera Weir-Bridge & Cable Ferry (core/water) */
defBuilding({key:'hk_ferry_causeway',name:'Columnar-Basalt Caldera Weir-Bridge and Ferry',seed:8406,
 front:{x:0,z:7.2,yaw:0},
 w:15.6,d:16.8,h:8.8,tags:{types:['infrastructure'],wealth:'middle',style:'hueru-kuran'},
 build(){
  if(CURREC&&!PLACE_DRY){
   const a=svW(-7.4,.16,0),b=svW(7.4,.16,0);
   CURREC.river={name:'caldera_weir_channel',pts:[[a[0],a[2],a[1]],[b[0],b[2],b[1]]],width:4.6,speed:.95};
  }
  const bw=4.0,crownY=2.05;
  box('columnar',0,0,5.8,9.2,.38,3.6,P('columnar'));
  wkPad(0,5.8,9.2,3.6,.38);
  box('columnar',0,0,-5.8,9.2,.38,3.6,P('columnar'));
  wkPad(0,-5.8,9.2,3.6,.38);
  svNoWalk(()=>{
   for(let i=0;i<2;i++)box('ashlar',0,.38*i/2,7.8-.26*i,3.4,.38/2,.26,P('ashlar'));
   for(const sz of [-2.5,2.5])box('columnar',0,0,sz,bw+.48,1.25,.75,P('columnar'));
   const nSeg=6;
   for(let i=0;i<nSeg;i++){
    const f0=i/nSeg,f1=(i+1)/nSeg;
    const zS0=lerp(4.2,1.3,f0),zS1=lerp(4.2,1.3,f1),y0=lerp(.38,crownY,f0),y1=lerp(.38,crownY,f1);
    box('ashlar',0,y0,(zS0+zS1)/2,bw,Math.max(.24,y1-y0+.18),Math.abs(zS0-zS1),P('ashlar'));
    box('ashlar',0,y0,-(zS0+zS1)/2,bw,Math.max(.24,y1-y0+.18),Math.abs(zS0-zS1),P('ashlar'));
   }
   for(const sx of [-bw/2+.16,bw/2-.16]){
    beam('basalt',[sx,.98,4.2],[sx,crownY+.78,1.3],.2,P('basalt'),false);
    beam('basalt',[sx,crownY+.78,1.3],[sx,crownY+.78,-1.3],.2,P('basalt'),false);
    beam('basalt',[sx,crownY+.78,-1.3],[sx,.98,-4.2],.2,P('basalt'),false);
   }
  });
  box('paving',0,crownY-.24,0,bw,.24,2.6,P('paving'));
  wkPad(0,0,bw,2.8,crownY);
  svStripWalk([0,0,7.9],[0,.38,7.3],3.4);
  svStripWalk([0,.38,4.3],[0,crownY,1.2],bw-.4);
  svStripWalk([0,crownY,-1.2],[0,.38,-4.3],bw-.4);

  /* Leviathan whale-jawbone arch crowning the bridge span! */
  hkWhaleJawArch(0,crownY,0,0,bw-.3,4.2);

  hkTarget(0,.38,5.8,'south causeway head');
  hkTarget(0,crownY,0,'weir-bridge crown');
  hkTarget(0,.38,-5.8,'north causeway head');
  hkFurnList([
   ['generic_poor_bench',-3.0,.38,5.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',3.0,.38,5.8,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',-3.0,.38,-5.8,0,{setting:'outdoor'}],
   ['hueru-kuran_tide_gauge_plinth',3.0,.38,-5.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 43. Whale-Oil Beacon Nuraghe Lighthouse (HK1) */
defBuilding({key:'hk_beacon_nuraghe',name:'Whale-Oil Beacon Nuraghe Lighthouse',seed:8407,cut:true,
 w:14.4,d:14.8,h:15.6,tags:{types:['infrastructure'],wealth:'rich',style:'hueru-kuran',landmark:true},
 build(){
  const py=hkPlinth(12.4,12.2,.62,{stepW:2.8,stepRun:1.05});
  const yDeck=py+11.2;
  hkNuraghe(0,-.3,py,4.8,3.35,11.2,{
   wallT:1.35,courses:12,tholos:false,
   doors:[{yaw:0,w:1.5,h:2.2}],
   windows:[{yaw:0,w:.82,y:5.2,h:.95},{yaw:PI/2,w:.82,y:5.2,h:.95},{yaw:-PI/2,w:.82,y:5.2,h:.95}]
  });
  const yMid=py+5.6;
  const sc=svStairCase({x0:-1.8,x1:2.2,z0:-2.1,z1:-.1},[py+.08,yMid,yDeck],{w:.85,mk:'cypress',col:P('cypress')});
  svWell('floor',0,yMid-.22,-.3,4.4,.22,4.4,P('floor'),sc.wells[0]);
  svWell('ashlar',0,yDeck-.24,-.3,5.2,.24,5.2,P('ashlar'),sc.wells[1]);

  /* Great cast-bronze whale-oil beacon cauldron + polished emerald-nephrite parabolic reflector slabs on watch crown! */
  svNoWalk(()=>{
   cyl('bronze',1.2,yDeck,1.2,.78,.68,P('bronze'),14);
   sph('glow',1.2,yDeck+.84,1.2,.44,0xffb648,1.2,10);
   for(const ang of [PI*.75,PI,-PI*.75]){
    box('nephrite',1.2+Math.sin(ang)*1.35,yDeck,1.2+Math.cos(ang)*1.35,.72,1.65,.14,P('nephriteBright'),ang);
   }
  });
  haloAt(1.2,yDeck+1.0,1.2,0xffba54,true);
  smokeAt(1.2,yDeck+1.45,1.2,{r:.36,kind:'fire'});

  hkTarget(-1.8,py+.08,1.4,'keeper room');
  hkTarget(-1.6,yMid,1.2,'watch landing');
  hkTarget(-1.4,yDeck,1.2,'beacon crown');
  hkFurnList([
   ['hueru-kuran_whalebone_cot',1.8,py+.08,1.4,-PI/2],
   ['hueru-kuran_kaen_storage_jar',-2.0,py+.08,1.6,0,{v:0}],
   ['generic_fuel',1.8,yMid,1.2,0],
   ['hueru-kuran_jade_lamp_pedestal',-2.8,py,4.8,0,{setting:'outdoor'}]
  ]);
 }});

/* 44. Trilobate Nuraghe Terrace Gatehouse (HK1) */
defBuilding({key:'hk_cliff_gatehouse',name:'Trilobate Nuraghe Terrace Gatehouse',seed:8408,cut:true,
 front:{x:0,z:5.8,yaw:0},
 w:19.6,d:14.2,h:10.8,tags:{types:['military','infrastructure'],wealth:'rich',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(18.0,11.6,.52,{stepW:3.8,stepRun:1.0});
  /* Twin flanking Sardinian nuraghe bastions joined over a central terraced gate-passage spanned by a massive 3-ton
     sawn emerald-nephrite monolith lintel & mensoloni wall-walk! */
  hkNuraghe(-5.4,-.2,py,3.55,2.65,7.8,{
   wallT:1.2,courses:8,
   doors:[{yaw:PI/2,w:1.3,h:2.08,ajar:.65}],
   windows:[{yaw:0,w:.78,y:3.8,h:.9}]
  });
  hkNuraghe(5.4,-.2,py,3.55,2.65,7.8,{
   wallT:1.2,courses:8,
   doors:[{yaw:-PI/2,w:1.3,h:2.08,ajar:.65}],
   windows:[{yaw:0,w:.78,y:3.8,h:.9}]
  });
  svNoWalk(()=>{
   /* Massive emerald-nephrite gate lintel + basalt curtain bridge over central road-passage [-2.1..2.1] */
   box('nephrite',0,py+3.4,1.8,5.2,.48,1.25,P('nephrite'));
   box('nephrite',0,py+3.4,-2.2,5.2,.48,1.25,P('nephrite'));
   box('basalt',0,py+3.88,-.2,4.8,2.15,5.2,P('basalt'));
   for(const sz of [-2.75,2.35])box('corbel',0,py+6.03,sz,4.8,.75,.38,P('corbel'));
  });
  hkWindHanging(-5.4,py,4.4,0,2.2,2.8,{mk:'banner',panels:2});
  hkWindHanging(5.4,py,4.4,0,2.2,2.8,{mk:'banner',panels:2});

  hkTarget(0,py,-.2,'gate passage');
  hkTarget(-5.4,py+.08,-.2,'west gate tower');
  hkTarget(5.4,py+.08,-.2,'east gate tower');
  hkFurnList([
   ['hueru-kuran_harpoon_rack',-5.4,py+.08,-1.4,0],
   ['generic_trade_weapon_rack',5.4,py+.08,-1.4,0],
   ['hueru-kuran_kaen_storage_jar',-6.2,py+.08,.6,0,{v:0}],
   ['hueru-kuran_driftwood_chest',6.2,py+.08,.6,-PI/2],
   ['hueru-kuran_jade_lamp_pedestal',-2.4,py,4.4,0,{setting:'outdoor'}],
   ['hueru-kuran_jade_lamp_pedestal',2.4,py,4.4,0,{setting:'outdoor'}]
  ]);
 }});

/* 45. Crookshore Tsunami-Watch & Harpoon-Guard Barracks */
defBuilding({key:'hk_watch_barracks',name:'Crookshore Tsunami-Watch and Harpoon-Guard Barracks',seed:8409,cut:true,
 w:19.4,d:15.4,h:9.6,tags:{types:['military'],wealth:'middle',style:'hueru-kuran'},
 build(){
  const py=hkPlinth(17.8,13.0,.52,{stepW:3.2,stepRun:1.0});
  hkWallRing(-8.0,-4.8,2.4,3.2,py,3.4,{mk:'basalt',postMk:'columnar',holes:{
   s:[{at:5.2,w:1.65,h:2.2},{at:1.8,w:.95,y:1.05,h:.95},{at:8.6,w:.95,y:1.05,h:.95}]
  }});
  hkJadeDoor(-2.8,py,3.2,0,1.65,2.2);
  hkJadeWindow(-6.2,py+1.05,3.2,0,.95,.95);
  hkJadeWindow(.6,py+1.05,3.2,0,.95,.95);
  hkTurfRoof(-2.8,py+3.64,-.8,11.0,8.6,1.65,{mk:'turf',kaen:true});

  /* East watch-nuraghe turret + alarm nephrite chime-frame */
  hkNuraghe(5.6,-.8,py,3.15,2.35,7.2,{
   wallT:1.1,courses:8,
   doors:[{yaw:0,w:1.28,h:2.05}],
   windows:[{yaw:PI/2,w:.74,y:3.5,h:.86}]
  });
  hkNephriteChimes(2.4,py+2.95,4.8,0,2.4,1.1,5);

  hkTarget(-2.8,py,-.8,'guard squadroom');
  hkTarget(5.6,py+.08,-.8,'watch turret');
  hkFurnList([
   ['hueru-kuran_whale_oil_hearth',-2.8,py,-.8,0],
   ['generic_trade_bunk',-6.6,py,-3.0,PI/2],
   ['generic_trade_bunk',-6.6,py,.8,PI/2],
   ['hueru-kuran_harpoon_rack',.8,py,-2.8,-PI/2],
   ['generic_trade_weapon_rack',.8,py,.6,-PI/2],
   ['hueru-kuran_driftwood_chest',5.6,py+.08,-1.6,0],
   ['generic_training_training_dummy',5.6,py,4.2,0,{setting:'outdoor'}]
  ]);
 }});
