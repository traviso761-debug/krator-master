// prefix: kl
// ================================================================= KARUM LEDGER-SYNDICATES — CIVIC, BANKING & EXCHANGE HALLS (8101..8105)
// Downstream & Confluence Ports (Pak-Ma & Tong-Ma):
//   8101. kl_karum_grand_bank    — Grand Naruqqum Banking House, Kura Bullion Vault, Kiyomizu Trestle & Nickel-Hooped Strongtower
//   8102. kl_karum_clearing_hall — Syndicate Bell-Hall & Amber-Envelope Remittance Clearing Court
//   8103. kl_karum_treaty_factor — Ria-Treaty Extraterritorial Assay & Counting-House
//   8104. kl_karum_mill_bridge   — Two-Storey Covered Karum Market & Undershot Mill-Bridge
//   8105. kl_karum_guild_thermae — Syndicate Steam-Bath & Tea-Brokerage Court

/* 1. Grand Suurgild Kaarum Banking House, Kivi-Ait Vault & Hooped Strongtower */
defBuilding({
 key:'kl_karum_grand_bank',
 name:'Grand Suurgild Kaarum Banking House and Hooped Strongtower',
 seed:8101,w:30,d:24,h:21.5,budget:130000,cut:true,
 front:{x:2.4,z:10.6,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['civic','market'],role:'bank',job:'trading'},
 build(){
  const y1=.76,h1=3.8,y2=y1+h1,h2=3.55,y3=y2+h2,h3=3.15,yRoof=y3+h3;

  /* West canal & barge slip beside the hooped strongtower (walk: false inside klWaterChannel) */
  klWaterChannel(-10.8,-.4,5.4,20.2,.32,.78,{river:{name:'karum-bank-canal',axis:'z',speed:.48}});

  /* Stone quay apron + front-east interlocking dark-cedar Kiyomizu river-trestle stepping out over the bank! */
  klFloorSlab(2.4,y1,-.6,19.6,18.4,{mk:'paving',th:y1});
  klStair(2.4,0,10.5,2.4,y1,8.6,3.4,{mk:'sootstone',sideMk:'kura'});
  klKiyomizuTrestle(8.2,7.8,7.6,3.4,0,y1,{rails:'se'});

  /* AF3 Ground Register: Battered chalk-white kura bullion & ledger vault [-5.6..10.8, -8.4..6.2] with stepped udatsu wings */
  klWallRing(-5.6,-8.4,10.8,6.2,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.4,udatsuH:h1+.5,
   holes:{
    s:[
     {at:2.6,w:2.05,h:2.55,door:true,torana:true,leafMk:'darkcedar',name:'bank-torana-door'},
     {at:-2.6,w:1.2,h:1.35,y:1.05},
     {at:7.8,w:1.2,h:1.35,y:1.05}
    ],
    e:[
     {at:1.8,w:1.65,h:2.3,door:true,torana:false,name:'bank-trestle-door'},
     {at:-3.8,w:1.2,h:1.35,y:1.05}
    ],
    n:[{at:-1.2,w:1.2,h:1.35,y:1.05},{at:5.8,w:1.2,h:1.35,y:1.05}],
    w:[{at:1.8,w:1.45,h:2.25,door:true,torana:false,name:'bank-vault-bridge-door'}]
   }
  });
  /* Short ground stone causeway connecting main bank vault west door (-5.6, 1.8) into strongtower ground vault (-9.8, 1.8) */
  klTimberBridge(-5.8,1.8,-7.2,1.8,0,y1,2.4,{rails:false});

  /* Interior stair climbing y1 -> y2 with >= 2.6 m clear floor margin around both ends! */
  const st1=klInteriorStair(7.2,-4.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(2.6,y2,-1.1,16.0,14.2,{mk:'floor',th:.18,hole:st1});
  klCeilingSlab(.2,y2-.28,-1.1,11.0,13.6,{mk:'darkcedar',trimMk:'cedar'});

  /* Style A Mid-Register: Warm Newar kilnbrick + cobalt Ria dado frieze + projecting carved sanjhya counting-oriels! */
  klWallRing(-5.4,-8.2,10.6,6.0,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[
     {at:-2.2,w:1.55,h:1.5,y:.95},
     {at:2.6,w:1.75,h:1.55,y:.95},
     {at:7.4,w:1.55,h:1.5,y:.95}
    ],
    e:[{at:-4.2,w:1.45,h:1.45,y:.95},{at:1.8,w:1.45,h:1.45,y:.95}],
    n:[{at:-1.4,w:1.45,h:1.45,y:.95},{at:6.2,w:1.45,h:1.45,y:.95}],
    w:[{at:1.4,w:1.35,h:1.45,y:.95,flat:true}]
   }
  });

  /* Interior stair climbing y2 -> y3 open clearing loggia (placed on west-center bay with >= 2.5 m clear margin!) */
  const st2=klInteriorStair(-1.8,-4.2,y2,y3,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(2.6,y3,-1.1,15.8,14.0,{mk:'floor',th:.18,hole:st2});
  klCeilingSlab(5.4,y3-.28,-1.1,9.6,13.4,{mk:'darkcedar',trimMk:'cedar'});

  /* Third-storey open bracketed dark-cedar Syndicate clearing gallery + hanging bronze steelyard scale! */
  klTimberColonnade(-5.1,5.7,10.3,5.7,y3,h3,{style:'karum',n:6,trimMk:'bronze'});
  klTimberColonnade(10.3,-7.9,-5.1,-7.9,y3,h3,{style:'karum',n:6,trimMk:'bronze'});
  klTimberColonnade(10.3,5.1,10.3,-7.3,y3,h3,{style:'karum',n:5,trimMk:'bronze'});
  klTimberColonnade(-5.1,-7.3,-5.1,.2,y3,h3,{style:'karum',n:4,trimMk:'bronze'});
  klParapet(-5.0,5.75,10.2,5.75,y3,{kind:'timber'});
  klParapet(10.2,-7.95,-5.0,-7.95,y3,{kind:'timber'});
  klParapet(10.35,5.5,10.35,-7.7,y3,{kind:'timber'});
  klSteelyard(4.8,yRoof-.18,5.95,0,2.2,{bell:true});

  /* AF1 Multi-Eave Newar Terracotta Hipped Roof + Octagonal Bronze Syndicate Bell-Cupola! */
  klNewarRoof(2.6,yRoof,-1.1,16.2,14.4,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.78,tierRise:1.32,cupola:true,cupolaR:2.2,cupolaH:4.1
  });

  /* AF4 Vertical Accent: Inhabited Arch-Nickel & Black-Iron-Hooped Slatted-Cedar Strongtower in the canal, linked by Sky-Walk! */
  klHoopedFrustum(-9.8,1.8,3.25,2.15,0,17.8,{
   plinthH:y1,hoops:5,midY:y3,
   opens:[
    {a:0,y:0,w:1.45,h:2.2,door:true,name:'strongtower-vault-door'},
    {a:0,y:y3-y1,w:1.55,h:2.25,door:true,open:true},
    {a:PI/2,y:3.8,w:.95,h:1.2},
    {a:-PI/2,y:9.8,w:.9,h:1.15}
   ]
  });
  klSkywalk(-4.8,1.8,-7.8,1.8,y3,1.95);

  klTarget(2.6,y1,-1.2,'ground-naruqqum-vault',true);
  klTarget(8.2,y1,7.8,'kiyomizu-wharf-deck',false);
  klTarget(3.4,y2,-1.2,'sanjhya-counting-hall',true);
  klTarget(4.2,y3,1.2,'upper-clearing-loggia',true);
  klTarget(-9.8,y1,1.8,'strongtower-bullion-cell',true);
  klTarget(-9.8,y3,1.8,'strongtower-hoist-deck',true);

  klFurnList([
   ['kulanewa_amber_safe',-2.8,y1,-5.8,0],
   ['kulanewa_amber_safe',.2,y1,-5.8,0],
   ['kulanewa_bullion_scale',5.2,y1,-2.6,PI],
   ['kulanewa_naruqqum_table',2.6,y2,-1.8,0],
   ['kulanewa_tablet_rack',-3.4,y2,-6.2,0],
   ['kulanewa_cedar_settle',7.8,y2,2.4,-PI/2],
   ['kulanewa_tea_samovar',5.6,y3,1.4,0],
   ['kulanewa_syndicate_brazier',1.2,y3,2.2,0],
   ['kulanewa_amber_safe',-9.8,y1,.9,0],
   ['kulanewa_oil_cresset',5.8,y1,7.4,0]
  ]);
 }
});

/* 2. Syndicate Bell-Hall and Amber-Envelope Remittance Clearing Court */
defBuilding({
 key:'kl_karum_clearing_hall',
 name:'Syndicate Bell-Hall and Amber-Envelope Clearing Court',
 seed:8102,w:26,d:22,h:20.5,budget:118000,cut:true,
 front:{x:0,z:9.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['civic'],role:'clearing-hall',job:'scribing'},
 build(){
  const y1=.72,h1=3.8,y2=y1+h1,h2=3.5,yRoof=y2+h2;
  klKuraPlinth(21.6,17.2,y1,{stepW:3.4,stepRun:1.6});

  /* Open front Syndicate clearing portico with twin hanging bronze steelyard scales */
  klTimberColonnade(-9.6,7.6,9.6,7.6,y1,h1,{style:'karum',n:7,skipMid:1.8,trimMk:'bronze'});
  klCeilingSlab(0,y2-.26,6.1,19.8,2.8,{mk:'darkcedar',trimMk:'cedar'});
  klSteelyard(-5.4,y2-.15,7.8,0,1.9,{bell:true});
  klSteelyard(5.4,y2-.15,7.8,0,1.9,{bell:false});
  klBanner(-9.8,y1,8.1,0,3.1,'silkCrimson');
  klBanner(9.8,y1,8.1,0,3.1,'silkIndigo');

  /* Ground kura remittance registry [-9.8..9.8, -7.8..4.6] */
  klWallRing(-9.8,-7.8,9.8,4.6,y1,h1,{
   style:'karum',register:'kura',udatsu:'ew',udatsuD:1.3,
   holes:{
    s:[
     {at:0,w:2.0,h:2.5,door:true,torana:true,leafMk:'darkcedar',name:'clearing-main-door'},
     {at:-5.6,w:1.25,h:1.35,y:1.05},
     {at:5.6,w:1.25,h:1.35,y:1.05}
    ],
    n:[{at:-4.8,w:1.2,h:1.35,y:1.05},{at:4.8,w:1.2,h:1.35,y:1.05}],
    e:[{at:-1.6,w:1.45,h:2.25,door:true,torana:false,name:'clearing-east-door'}],
    w:[{at:-1.6,w:1.45,h:2.25,door:true,torana:false,name:'clearing-west-door'}]
   }
  });

  const st=klInteriorStair(6.6,-4.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'bronze',col:P('darkcedar'),scol:P('bronze'),rail:'both'});
  klFloorSlab(0,y2,-1.6,19.2,12.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-1.6,14.2,11.4,{mk:'darkcedar',trimMk:'cedar'});

  /* Second-storey Newar kilnbrick + celadon/cobalt dado Syndicate Council Chamber */
  klWallRing(-9.5,-7.5,9.5,4.4,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-5.4,w:1.55,h:1.5,y:.95},{at:0,w:1.8,h:1.55,y:.95},{at:5.4,w:1.55,h:1.5,y:.95}],
    n:[{at:-4.8,w:1.45,h:1.45,y:.95},{at:4.8,w:1.45,h:1.45,y:.95}],
    e:[{at:-1.6,w:1.45,h:1.45,y:.95}],
    w:[{at:-1.6,w:1.45,h:1.45,y:.95}]
   }
  });

  /* 3-Tier Newar Terracotta Roof crowned by the Octagonal Cast-Bronze Syndicate Bell-Cupola! */
  klNewarRoof(0,yRoof,-1.55,19.6,12.4,3,{
   style:'karum',mode:'hip',mk:'terracotta',over:.76,tierRise:1.15,cupola:true,cupolaR:2.35,cupolaH:4.3
  });

  klTarget(0,y1,6.2,'clearing-front-portico',true);
  klTarget(-1.8,y1,-1.6,'amber-envelope-registry',true);
  klTarget(-1.8,y2,-1.6,'syndicate-council-chamber',true);

  klFurnList([
   ['kulanewa_naruqqum_table',-3.4,y1,-1.8,0],
   ['kulanewa_naruqqum_table',2.6,y1,-1.8,0],
   ['kulanewa_tablet_rack',-7.4,y1,-5.4,0],
   ['kulanewa_amber_safe',-7.4,y1,1.8,PI],
   ['kulanewa_naruqqum_table',-2.2,y2,-2.2,0],
   ['kulanewa_cedar_settle',-2.2,y2,.6,PI],
   ['kulanewa_tea_samovar',2.8,y2,-.8,0],
   ['kulanewa_syndicate_brazier',0,y1,6.0,0]
  ]);
 }
});

/* 3. Ria-Treaty Extraterritorial Assay and Counting-House */
defBuilding({
 key:'kl_karum_treaty_factor',
 name:'Ria-Treaty Extraterritorial Assay and Counting-House',
 seed:8103,w:24,d:20,h:17.2,budget:108000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['civic','infrastructure'],role:'customs-house',job:'customs'},
 build(){
  const y1=.64,h1=3.65,y2=y1+h1,h2=3.4,yRoof=y2+h2;
  klKuraPlinth(19.8,15.6,y1,{stepW:3.0,stepRun:1.5});

  /* Ground kura assay & treaty-tariff vault [-8.8..8.8, -6.8..5.6] */
  klWallRing(-8.8,-6.8,8.8,5.6,y1,h1,{
   style:'karum',register:'kura',
   holes:{
    s:[
     {at:0,w:1.95,h:2.45,door:true,torana:true,leafMk:'darkcedar',name:'treaty-main-door'},
     {at:-5.0,w:1.2,h:1.3,y:1.05},
     {at:5.0,w:1.2,h:1.3,y:1.05}
    ],
    n:[{at:-4.2,w:1.2,h:1.3,y:1.05},{at:4.2,w:1.2,h:1.3,y:1.05}],
    e:[{at:-.6,w:1.4,h:2.2,door:true,torana:false,name:'treaty-east-door'}],
    w:[{at:-.6,w:1.4,h:2.2,door:true,torana:false,name:'treaty-west-door'}]
   }
  });

  const st=klInteriorStair(5.8,-3.6,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'nickel',col:P('darkcedar'),scol:P('nickel'),rail:'both'});
  klFloorSlab(0,y2,-.6,17.2,12.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.0,y2-.28,-.6,12.8,11.4,{mk:'darkcedar',trimMk:'cedar'});

  /* Dual-glazed dado frieze (cobalt Lower-Ria + celadon Upper-Ria treaty bands) on kilnbrick upper envoy hall! */
  klWallRing(-8.6,-6.6,8.6,5.4,y2,h2,{
   style:'karum',register:'brick',dadoMk:'cobalt',
   holes:{
    s:[{at:-4.8,w:1.5,h:1.45,y:.95},{at:0,w:1.65,h:1.5,y:.95},{at:4.8,w:1.5,h:1.45,y:.95}],
    n:[{at:-4.0,w:1.4,h:1.4,y:.95},{at:4.0,w:1.4,h:1.4,y:.95}],
    e:[{at:-.6,w:1.4,h:1.4,y:.95}],
    w:[{at:-.6,w:1.4,h:1.4,y:.95}]
   }
  });
  klDadoFrieze(0,y2+h2-.48,-.6,17.5,12.3,.22,{mk:'celadon'});

  klNewarRoof(0,yRoof,-.6,17.8,12.6,2,{
   style:'karum',mode:'gable',gableAxis:'x',mk:'terracotta',over:.74,tierRise:1.28
  });

  klTarget(-1.8,y1,-.6,'treaty-assay-customs',true);
  klTarget(-1.8,y2,-.6,'extraterritorial-ledger-salon',true);

  klFurnList([
   ['kulanewa_bullion_scale',-4.2,y1,1.6,0],
   ['kulanewa_bullion_scale',4.2,y1,1.6,0],
   ['kulanewa_naruqqum_table',-1.8,y1,-2.8,0],
   ['kulanewa_amber_safe',-6.4,y1,-4.4,PI/2],
   ['kulanewa_naruqqum_table',-2.4,y2,-1.6,0],
   ['kulanewa_tablet_rack',-6.4,y2,-4.4,0],
   ['kulanewa_tea_samovar',1.8,y2,1.6,0],
   ['kulanewa_cedar_settle',1.8,y2,3.2,PI]
  ]);
 }
});

/* 4. Two-Storey Covered Kaarum Market and Sampo Mill-Bridge */
defBuilding({
 key:'kl_karum_mill_bridge',
 name:'Two-Storey Covered Kaarum Market and Sampo Mill-Bridge',
 seed:8104,w:28,d:22,h:17.4,budget:122000,cut:true,
 front:{x:-9.2,z:9.4,yaw:0},
 tags:{style:'karum',wealth:'middle',types:['market','infrastructure'],role:'mill-bridge',job:'milling'},
 build(){
  const yQuay=.55,yBridge=3.85,hGal=3.35,yRoof=yBridge+hGal;

  /* Navigable Pak-Ma canal raceway [-4.2..4.2] flowing N-S beneath the covered mill-bridge */
  klWaterChannel(0,0,8.4,19.8,.32,.82,{river:{name:'karum-mill-race',axis:'z',speed:.68}});

  /* Twin undershot cedar & Arch-nickel forge/grain waterwheels flanking the cutwater piers! */
  klMillWheel(-3.55,1.45,5.6,0,1.95,.78);
  klMillWheel(3.55,1.45,-5.6,PI,1.95,.78);

  /* West & East stone quays + kura mill-pier rooms + exterior stairs up to the covered bridge street */
  for(const s of [-1,1]){
   const qx=s*8.6;
   klFloorSlab(qx,yQuay,0,8.2,17.2,{mk:'paving',th:yQuay});
   klStair(qx,0,9.6,qx,yQuay,8.4,2.8,{mk:'sootstone',sideMk:'kura'});

   klWallRing(qx-2.9,-4.4,qx+2.9,3.2,yQuay,yBridge-yQuay-.22,{
    style:'karum',register:'kura',
    holes:{
     s:[{at:qx-s*1.0,w:1.5,h:2.25,door:true,torana:false,name:s<0?'west-mill-pier-door':'east-mill-pier-door'}],
     n:[{at:qx,w:1.1,h:1.25,y:1.0}]
    }
   });
   klCeilingSlab(qx,yBridge-.24,-.6,5.4,7.2,{mk:'darkcedar',trimMk:'cedar'});

   /* Exterior stone stair in clear air climbing yQuay (z=8.4) -> south edge of yBridge market street (z=4.3) */
   klStair(qx+s*1.8,yQuay,8.4,qx+s*1.8,yBridge,4.3,1.65,{mk:'sootstone',sideMk:'kura',openUnder:true});
  }

  /* Full-width covered timber market street spanning [-11.8..11.8, -4.4..4.4] at yBridge */
  klFloorSlab(0,yBridge,0,23.8,8.8,{mk:'floor',th:.22});
  /* Heavy timber truss girders supporting bridge span over canal */
  svNoWalk(()=>{
   for(const sz of [-3.9,3.9]){
    box('darkcedar',0,yBridge-.58,sz,11.0,.36,.34,P('darkcedar'));
    beam('darkcedar',[-5.4,yQuay+.8,sz],[-2.2,yBridge-.58,sz],.2,P('darkcedar'));
    beam('darkcedar',[5.4,yQuay+.8,sz],[2.2,yBridge-.58,sz],.2,P('darkcedar'));
   }
  });

  /* Covered Newar kilnbrick & dark-cedar colonnaded market gallery along the bridge */
  klTimberColonnade(-11.2,4.15,11.2,4.15,yBridge,hGal,{style:'karum',n:8,trimMk:'bronze'});
  klTimberColonnade(11.2,-4.15,-11.2,-4.15,yBridge,hGal,{style:'karum',n:8,trimMk:'bronze'});
  klParapet(-8.4,4.25,8.4,4.25,yBridge,{kind:'timber'});
  klParapet(11.0,-4.25,-11.0,-4.25,yBridge,{kind:'timber'});
  klSteelyard(0,yRoof-.16,4.4,0,1.8,{bell:true});

  klNewarRoof(0,yRoof,0,24.2,9.4,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.72,tierRise:1.18,cupola:true,cupolaR:1.95,cupolaH:3.6
  });

  klTarget(-8.6,yQuay,0,'west-millstone-vault',true);
  klTarget(8.6,yQuay,0,'east-toll-grain-room',true);
  klTarget(0,yBridge,0,'covered-bridge-bazaar',true);

  klFurnList([
   ['kulanewa_grain_bin',-8.6,yQuay,-2.4,0],
   ['kulanewa_grain_bin',-7.2,yQuay,-2.4,0],
   ['kulanewa_amber_safe',8.6,yQuay,-2.2,0],
   ['kulanewa_bullion_scale',-3.6,yBridge,-2.4,0],
   ['kulanewa_naruqqum_table',0,yBridge,-2.4,0],
   ['kulanewa_tea_samovar',3.8,yBridge,-2.4,0],
   ['kulanewa_syndicate_brazier',-6.2,yBridge,0,0],
   ['kulanewa_syndicate_brazier',6.2,yBridge,0,0]
  ]);
 }
});

/* 5. Suurgild Saunakoda Steam-Bath and Raha Brokerage Court */
defBuilding({
 key:'kl_karum_guild_thermae',
 name:'Suurgild Saunakoda Steam-Bath and Raha Brokerage Court',
 seed:8105,w:24,d:20,h:15.8,budget:104000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'karum',wealth:'rich',types:['civic','tavern'],role:'thermae',job:'healing'},
 build(){
  const y1=.58,h1=3.6,y2=y1+h1,h2=3.3,yRoof=y2+h2;
  klKuraPlinth(20.4,16.2,y1,{stepW:3.0,stepRun:1.45});

  /* Front open colonnaded courtyard with warm copper-rimmed plunge basin */
  klWaterChannel(-4.8,4.6,5.2,3.4,y1+.28,.45,{curbMk:'sootstone',bedMk:'celadon'});
  klTimberColonnade(-9.4,7.4,9.4,7.4,y1,h1,{style:'karum',n:6,skipMid:1.8,trimMk:'copper'});
  klCeilingSlab(4.2,y2-.24,5.8,9.8,3.2,{mk:'darkcedar',trimMk:'cedar'});

  /* Ground kura & celadon-tiled steam bathhouse [-9.4..9.4, -7.4..2.4] + copper boiler flue */
  klWallRing(-9.4,-7.4,9.4,2.4,y1,h1,{
   style:'karum',register:'kura',dadoMk:'celadon',
   holes:{
    s:[
     {at:1.8,w:1.75,h:2.35,door:true,torana:true,leafMk:'darkcedar',name:'thermae-entry-door'},
     {at:-4.8,w:1.2,h:1.25,y:1.15},
     {at:6.4,w:1.2,h:1.25,y:1.15}
    ],
    n:[{at:-4.2,w:1.15,h:1.25,y:1.15},{at:4.2,w:1.15,h:1.25,y:1.15}],
    e:[{at:-2.5,w:1.35,h:2.2,door:true,torana:false,name:'thermae-boiler-door'}]
   }
  });
  svNoWalk(()=>{
   cyl('copper',-8.2,y1+h1,-5.8,.42,4.8,P('copper'),12,.32);
   cyl('nickel',-8.2,y1+h1+2.2,-5.8,.41,.1,P('nickel'),12);
  });
  smokeAt(-8.2,y1+h1+4.9,-5.8,{r:.28,kind:'fire'});

  const st=svStair(6.2,-4.4,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'copper',col:P('darkcedar'),scol:P('copper'),rail:'both'});
  klFloorSlab(0,y2,-2.5,18.4,9.6,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-2.5,13.6,9.0,{mk:'darkcedar',trimMk:'cedar'});

  /* Upper kilnbrick + celadon-dado Tea-Brokerage Salon */
  klWallRing(-9.0,-7.2,9.0,2.2,y2,h2,{
   style:'karum',register:'brick',dadoMk:'celadon',
   holes:{
    s:[{at:-4.8,w:1.5,h:1.45,y:.95},{at:0,w:1.65,h:1.5,y:.95},{at:4.8,w:1.5,h:1.45,y:.95}],
    n:[{at:-3.8,w:1.4,h:1.4,y:.95},{at:3.8,w:1.4,h:1.4,y:.95}]
   }
  });

  klNewarRoof(0,yRoof,-2.5,18.6,10.0,2,{
   style:'karum',mode:'hip',mk:'terracotta',over:.74,tierRise:1.22
  });

  klTarget(4.2,y1,5.8,'thermae-entry-loggia',true);
  klTarget(-1.8,y1,-2.5,'steam-bath-hall',true);
  klTarget(-1.8,y2,-2.5,'tea-brokerage-salon',true);

  klFurnList([
   ['kulanewa_cedar_settle',-5.2,y1,-4.8,0],
   ['kulanewa_tea_samovar',-1.6,y1,-2.6,0],
   ['kulanewa_syndicate_brazier',2.2,y1,-3.8,0],
   ['kulanewa_tea_samovar',-3.4,y2,-2.6,0],
   ['kulanewa_cedar_settle',-3.4,y2,-.8,PI],
   ['kulanewa_tea_samovar',1.6,y2,-2.6,0],
   ['kulanewa_oil_cresset',5.2,y1,5.6,0]
  ]);
 }
});
