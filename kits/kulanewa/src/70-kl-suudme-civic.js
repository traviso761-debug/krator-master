// prefix: kl
// ================================================================= SUUDME-KAARUM ESTUARY TOWNS — BOURSES, SHRINES & TREATY PONTOONS (8143..8147)
// Rian-Assimilated Lowland Estuary Kuruneva (East Bluff Suudme-Kuluuna & Floating City Tooka-Hoov Wards along Ria Sound):
//   8143. kl_suudme_amber_bourse       — Tooka-Suurgild Amber Bourse, Ishtar-Kura Vault, Hooped Glaze Pylon & 4-Tier Bell-Mondop
//   8144. kl_suudme_sauna_thermae      — Saunakoda-Sala Lotus Peristyle and Steam-Brokerage Court
//   8145. kl_suudme_uktena_bell_shrine — Uktena-Kell Porcelain Prang and Twin Bell Covenant Shrine
//   8146. kl_suudme_pontoon_factor     — Tooka-Hoov Amphibious Pontoon Factor and Bell-Pyatthat
//   8147. kl_suudme_covered_bazaar     — Ishtar-Glazed Arcade and Covered Canal-Bridge Souk

/* 43. Tooka-Suurgild Amber Bourse and Four-Tier Bell-Mondop */
defBuilding({
 key:'kl_suudme_amber_bourse',
 name:'Tooka-Suurgild Amber Bourse and Four-Tier Bell-Mondop',
 seed:8143,w:30,d:24,h:22.4,budget:136000,cut:true,
 front:{x:2.6,z:10.4,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['civic','market'],role:'bank',job:'trading'},
 build(){
  const y1=.76,h1=3.85,y2=y1+h1,h2=3.55,y3=y2+h2,h3=3.2,yRoof=y3+h3;

  /* West Ria Sound barge slip beside the paktong-hooped glazed strongtower */
  klWaterChannel(-10.8,-.4,5.4,19.8,.32,.8,{river:{name:'suudme-bourse-slip',axis:'z',speed:.48}});

  /* Travertine quay apron + grand bimetallic Uktena serpent stair + SE Kiyomizu tidal landing stage! */
  klFloorSlab(2.4,y1,-.6,19.6,18.2,{mk:'paving',col:P('travertine'),th:y1});
  klSuudmeStair(2.6,0,10.2,2.6,y1,8.5,3.4,{nagaScale:.72});
  klKiyomizuTrestle(8.4,7.6,7.0,3.2,0,y1,{rails:'se'});

  /* Combinator 1: Ishtar-Kura Ground Bullion Vault [-5.6..10.8, -8.4..6.0] with cobalt udatsu wings & Ishtar round-arch portal! */
  klIshtarKuraVault(-5.6,-8.4,10.8,6.0,y1,h1,{
   portalX:2.6,portalW:2.1,portalH:2.55,buttW:1.18,udatsu:'ew',udatsuD:1.4,
   portalName:'bourse-ishtar-door',
   holes:{
    s:[{at:-2.8,w:1.2,h:1.35,y:1.05},{at:8.0,w:1.2,h:1.35,y:1.05}],
    e:[{at:1.8,w:1.6,h:2.3,door:true,torana:false,leafMk:'lacquer',name:'bourse-trestle-door'},{at:-3.8,w:1.2,h:1.35,y:1.05}],
    n:[{at:-1.2,w:1.2,h:1.35,y:1.05},{at:5.8,w:1.2,h:1.35,y:1.05}],
    w:[{at:1.8,w:1.45,h:2.25,door:true,torana:false,leafMk:'iron',name:'bourse-pylon-bridge-door'}]
   }
  });
  klTimberBridge(-5.8,1.8,-7.2,1.8,0,y1,2.4,{rails:false});

  /* Second storey: Ruan-Thai dark-teak & Sanjhya counting gallery! */
  const st1=klInteriorStair(7.2,-4.4,y1,y2,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'brass',col:P('teak'),scol:P('gilt')});
  klFloorSlab(2.6,y2,-1.2,16.0,14.0,{mk:'floor',th:.18,hole:st1});
  klCeilingSlab(.2,y2-.28,-1.2,11.0,13.4,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klTeakSanjhyaGallery(-5.4,-8.2,10.6,5.8,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-2.2,w:1.55,h:1.5,y:.95,roofMk:'celadon'},{at:2.6,w:1.75,h:1.55,y:.95,roofMk:'celadon'},{at:7.4,w:1.55,h:1.5,y:.95,roofMk:'celadon'}],
    e:[{at:-4.2,w:1.45,h:1.45,y:.95,roofMk:'celadon'},{at:1.8,w:1.45,h:1.45,y:.95,roofMk:'celadon'}],
    n:[{at:-1.4,w:1.45,h:1.45,y:.95,roofMk:'celadon'},{at:6.2,w:1.45,h:1.45,y:.95,roofMk:'celadon'}],
    w:[{at:1.4,w:1.35,h:1.45,y:.95,flat:true}]
   }
  });

  /* Third storey: Open Classical travertine round-arch clearing loggia + cantilevered paktong steelyard! */
  const st2=klInteriorStair(-1.8,-4.2,y2,y3,0,{w:1.25,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(2.6,y3,-1.2,15.8,13.8,{mk:'paving',col:P('travertine'),th:.18,hole:st2});
  klCeilingSlab(5.4,y3-.28,-1.2,9.6,13.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  klRoundArcade(-5.0,5.45,10.2,5.45,y3,h3,{bays:5,spandrelPal:'cobalt'});
  klRoundArcade(10.2,-7.85,-5.0,-7.85,y3,h3,{bays:5,spandrelPal:'cobalt'});
  klRoundArcade(10.2,5.0,10.2,-7.4,y3,h3,{bays:4,spandrelPal:'emerald'});
  klPeristyle(-5.0,-7.4,-5.0,.1,y3,h3,{n:4,friezePal:'saffron'});
  klMerlonParapet(-4.9,5.55,10.1,5.55,y3,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(10.1,-7.95,-4.9,-7.95,y3,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klSteelyard(4.8,yRoof-.16,5.85,0,2.2,{bell:true});

  /* Combinator 5: 4-Tier Glazed Celadon & Gilt Bell-Mondop opening into the Cast-Bronze Kellakoda Bell-Lantern! */
  klBellMondop(2.6,yRoof,-1.2,16.2,14.2,4,{
   mk:'celadon',over:.78,tierRise:1.06,neckH:.36,bell:true,cupolaR:2.15,cupolaH:4.0,cupolaMk:'brass'
  });

  /* Combinator 4: Inhabited Travertine-and-Cobalt Glazed Paktong-Hooped Strongtower + Pyatthat Skywalk! */
  klHoopedGlazePylon(-9.8,1.8,3.25,2.2,0,17.4,{
   plinthH:y1,hoops:5,midY:y3,
   opens:[
    {a:0,y:0,w:1.45,h:2.2,door:true,name:'bourse-pylon-vault-door'},
    {a:0,y:y3-y1,w:1.55,h:2.25,door:true,open:true},
    {a:PI/2,y:3.8,w:.95,h:1.2},
    {a:-PI/2,y:9.6,w:.9,h:1.15}
   ]
  });
  klPyatthatSkywalk(-5.0,1.8,-7.8,1.8,y3,2.0,{roofMk:'celadon'});

  klTarget(2.6,y1,-1.2,'ishtar-kura-bullion-vault',true);
  klTarget(8.4,y1,7.6,'kiyomizu-tidal-stage',false);
  klTarget(3.4,y2,-1.2,'teak-sanjhya-counting-hall',true);
  klTarget(4.2,y3,1.2,'travertine-clearing-loggia',true);
  klTarget(-9.8,y1,1.8,'glaze-pylon-bullion-cell',true);
  klTarget(-9.8,y3,1.8,'glaze-pylon-hoist-deck',true);

  klFurnList([
   ['kulanewa_amber_safe',-2.8,y1,-5.8,0],
   ['kulanewa_amber_safe',.4,y1,-5.8,0],
   ['kulanewa_bullion_scale',5.2,y1,-2.6,PI],
   ['kulanewa_naruqqum_table',2.6,y2,-1.8,0],
   ['kulanewa_tablet_rack',-3.4,y2,-6.2,0],
   ['kulanewa_lotus_divan',7.6,y2,2.2,-PI/2],
   ['kulanewa_tea_samovar',5.6,y3,1.4,0],
   ['kulanewa_uktena_brazier',1.2,y3,2.2,0],
   ['kulanewa_amber_safe',-9.8,y1,.9,0],
   ['kulanewa_oil_cresset',5.8,y1,7.2,0]
  ]);
 }
});

/* 44. Saunakoda-Sala Lotus Peristyle and Steam-Brokerage Court */
defBuilding({
 key:'kl_suudme_sauna_thermae',
 name:'Saunakoda-Sala Lotus Peristyle and Steam-Brokerage Court',
 seed:8144,w:26,d:22,h:18.8,budget:118000,cut:true,
 front:{x:0,z:9.9,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['civic','tavern'],role:'thermae',job:'healing'},
 build(){
  const y1=.64,h1=3.65,y2=y1+h1,h2=3.35,yRoof=y2+h2;
  klSuudmePlinth(21.4,16.8,y1,{stepW:3.2,stepRun:1.45,nagaScale:.7});

  /* Classical travertine peristyle court framing a sunken emerald-and-travertine lotus plunge basin! */
  klLotusBasin(-4.6,5.2,5.6,3.4,y1+.28,.46,{lotus:6});
  klWallBlock(-4.6,y1,5.2,5.6,.88,3.4,0);
  klPeristyle(-9.8,7.6,9.8,7.6,y1,h1,{n:7,skipMid:1.9,friezePal:'emerald'});

  /* East Sala-Nam open tea-brokerage pavilion roofed by a 2-tier emerald-glazed Mondop canopy */
  klBellMondop(5.0,y1+h1,5.2,6.4,4.4,2,{mk:'celadon',pal:'emerald',bell:false,over:.48,tierRise:.86,neckH:.3});
  klBanner(-10.0,y1,8.0,0,3.1,'silkSaffron');
  klBanner(10.0,y1,8.0,0,3.1,'silkCrimson');

  /* Vaulted kura & celadon Kuruneva Saunakoda steam-brokerage hall [-9.8..9.8, -8.0..2.2] + paktong-ringed boiler flue */
  klIshtarKuraVault(-9.8,-8.0,9.8,2.2,y1,h1,{
   portalX:1.8,portalW:1.85,portalH:2.4,buttW:1.05,dadoMk:'celadon',
   portalName:'sauna-sala-door',
   holes:{
    s:[{at:-5.2,w:1.2,h:1.25,y:1.1},{at:6.8,w:1.2,h:1.25,y:1.1}],
    n:[{at:-4.4,w:1.15,h:1.25,y:1.1},{at:4.4,w:1.15,h:1.25,y:1.1}],
    e:[{at:-2.8,w:1.35,h:2.2,door:true,torana:false,leafMk:'darkcedar',name:'sauna-boiler-door'}]
   }
  });
  svNoWalk(()=>{
   cyl('copper',-8.4,y1+h1+.32,-6.0,.42,4.6,P('copper'),12,.32);
   cyl('paktong',-8.4,y1+h1+2.4,-6.0,.41,.12,P('paktong'),12);
  });
  smokeAt(-8.4,y1+h1+5.0,-6.0,{r:.28,kind:'fire'});

  const st=klInteriorStair(6.6,-4.8,y1,y2,0,{w:1.2,riser:.18,going:.27,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(0,y2,-2.9,19.0,9.8,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-2.2,y2-.28,-2.9,14.0,9.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Upper Ruan-Thai dark-teak & Sanjhya Tea-Contract Salon + 3-tier Celadon Bell-Mondop! */
  klTeakSanjhyaGallery(-9.4,-7.8,9.4,2.0,y2,h2,{
   friezePal:'emerald',
   holes:{
    s:[{at:-5.0,w:1.5,h:1.45,y:.95,roofMk:'celadon'},{at:0,w:1.65,h:1.5,y:.95,roofMk:'celadon'},{at:5.0,w:1.5,h:1.45,y:.95,roofMk:'celadon'}],
    n:[{at:-4.0,w:1.4,h:1.4,y:.95,roofMk:'celadon'},{at:4.0,w:1.4,h:1.4,y:.95,roofMk:'celadon'}]
   }
  });
  klBellMondop(0,yRoof,-2.9,19.4,10.2,3,{
   mk:'celadon',over:.76,tierRise:1.12,neckH:.38,bell:true,cupolaR:1.95,cupolaH:3.6,cupolaMk:'brass'
  });

  klTarget(5.0,y1,5.2,'sala-nam-lotus-pavilion',true);
  klTarget(-1.8,y1,-2.9,'saunakoda-steam-hall',true);
  klTarget(-2.0,y2,-2.9,'upper-tea-brokerage-salon',true);

  klFurnList([
   ['kulanewa_lotus_divan',-5.2,y1,-5.2,0],
   ['kulanewa_tea_samovar',-1.6,y1,-2.8,0],
   ['kulanewa_uktena_brazier',2.4,y1,-4.2,0],
   ['kulanewa_tea_samovar',5.0,y1,5.2,0],
   ['kulanewa_tea_samovar',-3.4,y2,-3.0,0],
   ['kulanewa_lotus_divan',-3.4,y2,-1.0,PI],
   ['kulanewa_naruqqum_table',1.8,y2,-3.0,0],
   ['kulanewa_oil_cresset',1.2,y1,6.4,0]
  ]);
 }
});

/* 45. Uktena-Kell Porcelain Prang and Twin Bell Covenant Shrine */
defBuilding({
 key:'kl_suudme_uktena_bell_shrine',
 name:'Uktena-Kell Porcelain Prang and Twin Bell Covenant Shrine',
 seed:8145,w:28,d:22,h:19.4,budget:120000,cut:true,
 front:{x:0,z:10.1,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['religious','civic'],role:'shrine',job:'worship'},
 build(){
  const y1=.84,h1=4.05,yRoof=y1+h1;
  klSuudmePlinth(23.6,16.8,y1,{stepW:3.4,stepRun:1.6,nagaScale:.78});

  /* Twin lotus ablution basins flanking the Uktena-and-Bell oath forecourt */
  for(const sx of [-5.8,5.8]){
   klLotusBasin(sx,5.6,3.8,2.6,y1+.26,.42,{lotus:4});
   klWallBlock(sx,y1,5.6,3.8,.88,2.6,0);
  }
  klBanner(-3.2,y1,4.8,0,3.3,'silkSaffron');
  klBanner(3.2,y1,4.8,0,3.3,'silkIndigo');

  /* Central Covenant Sanctuary [-5.2..5.2, -7.4..2.8] crowned by a Celadon & Paktong Porcelain Prang! */
  klIshtarKuraVault(-5.2,-7.4,5.2,2.8,y1,h1,{
   portalX:0,portalW:2.0,portalH:2.55,buttW:1.12,
   portalName:'shrine-ishtar-door',
   holes:{
    e:[{at:-2.3,w:1.15,h:1.3,y:1.15}],
    w:[{at:-2.3,w:1.15,h:1.3,y:1.15}],
    n:[{at:-2.2,w:1.15,h:1.3,y:1.15},{at:2.2,w:1.15,h:1.3,y:1.15}]
   }
  });
  klBellMondop(0,yRoof,-2.3,11.0,10.6,1,{mk:'celadon',bell:false,over:.66,tierRise:1.18});
  klPorcelainPrang(0,yRoof+1.32,-2.3,6.6,11.2,{vault:true});

  /* Flanking West & East Inhabited Paktong-Hooped Glazed Bell-Turrets (where oaths are rung on twin Kellakoda bells!) */
  for(const sx of [-8.8,8.8]){
   klHoopedGlazePylon(sx,-2.3,2.25,1.72,y1,9.4,{
    hoops:4,bell:true,bellR:1.62,bellH:3.2,bellMk:'brass',
    opens:[
     {a:PI/2,y:0,w:1.35,h:2.15,door:true,name:sx<0?'west-bell-turret-door':'east-bell-turret-door'},
     {a:sx<0?PI:0,y:4.2,w:.85,h:1.1}
    ]
   });
  }

  klTarget(0,y1,5.2,'uktena-kell-oath-court',false);
  klTarget(0,y1,-2.3,'prang-covenant-sanctuary',true);
  klTarget(-8.8,y1,-2.3,'west-paktong-bell-turret',true);
  klTarget(8.8,y1,-2.3,'east-paktong-bell-turret',true);

  klFurnList([
   ['kulanewa_covenant_lectern',0,y1,-5.0,0],
   ['kulanewa_covenant_bell_stand',-2.6,y1,-4.8,0],
   ['kulanewa_uktena_brazier',2.6,y1,-4.8,0],
   ['kulanewa_lotus_divan',-3.0,y1,-.6,PI/2],
   ['kulanewa_cedar_settle',3.0,y1,-.6,-PI/2],
   ['kulanewa_amber_safe',-8.8,y1,-3.0,0],
   ['kulanewa_covenant_bell_stand',8.8,y1,-3.0,0],
   ['kulanewa_uktena_brazier',0,y1,6.6,0]
  ]);
 }
});

/* 46. Tooka-Hoov Amphibious Pontoon Factor and Bell-Pyatthat */
defBuilding({
 key:'kl_suudme_pontoon_factor',
 name:'Tooka-Hoov Amphibious Pontoon Factor and Bell-Pyatthat',
 seed:8146,w:26,d:20,h:17.8,budget:114000,cut:true,
 front:{x:0,z:9.2,yaw:0},
 tags:{style:'suudme',wealth:'rich',types:['market','infrastructure'],role:'pontoon-factor',job:'customs'},
 build(){
  const yDeck=.86,h1=3.5,y2=yDeck+h1,h2=3.2,yRoof=y2+h2;

  /* Sheltered Floating-City harbour berth channel behind & under the moored pontoon */
  klWaterChannel(0,-6.2,23.2,5.0,.28,.84,{river:{name:'tooka-hoov-berth',axis:'x',speed:.42}});

  /* South travertine shore abutment + Uktena stair + hinged paktong-and-cedar gangway bridge onto the pontoon! */
  klFloorSlab(0,yDeck,6.8,10.6,2.0,{mk:'paving',col:P('travertine'),th:yDeck});
  klSuudmeStair(0,0,9.1,0,yDeck,7.7,3.0,{nagaScale:.68});
  klTimberBridge(0,5.9,0,4.1,0,yDeck,2.8,{rails:true});

  /* Copper- and paktong-sheathed dark-cedar amphibious barge pontoon hull [-10.4..10.4, -4.4..4.2] */
  klBelowGrade(()=>{
   box('darkcedar',0,-1.4,-.1,19.8,1.42,8.0,P('darkcedar'));
  });
  klNoCut(()=>svNoWalk(()=>{
   box('copper',0,.02,-.1,20.8,.4,8.8,P('copper'));
   box('darkcedar',0,.424,-.1,21.1,.31,9.0,P('teak'));
   box('paktong',0,.738,-.1,21.3,.11,9.2,P('paktong'));
   /* Twin 5-headed bimetallic Uktena serpent figureheads guarding the West & East pontoon prows! */
   klPaktongNagaHead5(-10.85,.38,-.1,-PI/2,.82);
   klPaktongNagaHead5(10.85,.38,-.1,PI/2,.82);
   for(const bx of [-9.4,9.4])for(const bz of [-3.8,3.6]){
    cyl('bronze',bx,yDeck+.01,bz,.16,.38,P('bronze'),8);
    cyl('paktong',bx,yDeck+.394,bz,.21,.07,P('paktong'),8);
   }
  }));
  klFloorSlab(0,yDeck,-.1,20.4,8.6,{mk:'floor',th:.12});
  klParapet(-10.0,4.05,-1.8,4.05,yDeck,{kind:'timber'});
  klParapet(1.8,4.05,10.0,4.05,yDeck,{kind:'timber'});
  klParapet(10.0,-4.25,-10.0,-4.25,yDeck,{kind:'timber'});

  /* Ground amphibious cobalt-dado & kura counting-house [-7.8..7.8, -3.8..2.6] + front veranda + paktong steelyard! */
  klPeristyle(-7.4,3.6,7.4,3.6,yDeck,h1,{n:6,skipMid:1.8,friezePal:'saffron'});
  klCeilingSlab(0,y2-.24,3.1,15.4,1.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});
  klSteelyard(-5.8,y2-.14,3.85,0,1.85,{bell:true});

  klWallRing(-7.8,-3.8,7.8,2.6,yDeck,h1,{
   style:'suudme',register:'kura',dadoMk:'cobalt',
   holes:{
    s:[
     {at:0,w:1.85,h:2.4,door:true,torana:true,leafMk:'lacquer',name:'pontoon-main-door'},
     {at:-4.6,w:1.15,h:1.25,y:1.05},
     {at:4.6,w:1.15,h:1.25,y:1.05}
    ],
    e:[{at:-.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'darkcedar',name:'pontoon-east-deck-door'}],
    w:[{at:-.6,w:1.35,h:2.15,door:true,torana:false,leafMk:'darkcedar',name:'pontoon-west-deck-door'}],
    n:[{at:-3.8,w:1.15,h:1.25,y:1.05},{at:3.8,w:1.15,h:1.25,y:1.05}]
   }
  });

  const st=klInteriorStair(5.4,-1.8,yDeck,y2,-PI/2,{w:1.15,riser:.18,going:.26,mk:'darkcedar',smk:'paktong',col:P('teak'),scol:P('paktong')});
  klFloorSlab(0,y2,-.6,15.2,6.0,{mk:'floor',th:.18,hole:st});
  klCeilingSlab(-4.2,y2-.28,-.6,6.4,5.4,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});

  /* Second-storey Ruan-Thai dark-teak & Sanjhya treaty ledger gallery + 3-tier Bell-Mondop! */
  klTeakSanjhyaGallery(-7.6,-3.6,7.6,2.4,y2,h2,{
   friezePal:'saffron',
   holes:{
    s:[{at:-4.4,w:1.45,h:1.4,y:.9,roofMk:'celadon'},{at:0,w:1.6,h:1.45,y:.9,roofMk:'celadon'},{at:4.4,w:1.45,h:1.4,y:.9,roofMk:'celadon'}],
    n:[{at:-3.6,w:1.35,h:1.35,y:.9,roofMk:'celadon'},{at:3.6,w:1.35,h:1.35,y:.9,roofMk:'celadon'}]
   }
  });
  klBellMondop(0,yRoof,-.6,15.6,6.6,3,{
   mk:'celadon',over:.72,tierRise:1.02,neckH:.34,bell:true,cupolaR:1.68,cupolaH:3.2,cupolaMk:'brass'
  });

  klTarget(-9.0,yDeck,-.1,'pontoon-bow-apron',false);
  klTarget(-3.6,yDeck,-.6,'amphibious-customs-vault',true);
  klTarget(-3.6,y2,-.6,'tooka-hoov-ledger-loft',true);

  klFurnList([
   ['kulanewa_bullion_scale',-3.8,yDeck,.8,0],
   ['kulanewa_naruqqum_table',-1.6,yDeck,-1.6,0],
   ['kulanewa_amber_safe',-5.8,yDeck,-2.2,PI/2],
   ['kulanewa_flux_binnacle',1.8,yDeck,.8,0],
   ['kulanewa_naruqqum_table',-3.8,y2,-.8,0],
   ['kulanewa_tablet_rack',-6.0,y2,-2.2,0],
   ['kulanewa_tea_samovar',-1.6,y2,.6,0],
   ['kulanewa_oil_cresset',9.0,yDeck,2.6,0]
  ]);
 }
});

/* 47. Ishtar-Glazed Arcade and Covered Canal-Bridge Souk */
defBuilding({
 key:'kl_suudme_covered_bazaar',
 name:'Ishtar-Glazed Arcade and Covered Canal-Bridge Souk',
 seed:8147,w:28,d:22,h:18.8,budget:122000,cut:true,
 front:{x:-8.6,z:9.4,yaw:0},
 tags:{style:'suudme',wealth:'middle',types:['market','infrastructure','shop'],role:'bazaar-bridge',job:'trading'},
 build(){
  const yQuay=.56,yBridge=4.05,hGal=3.45,yRoof=yBridge+hGal;

  /* Central navigable Sound-ward canal flowing N-S under the Classical round-arch viaduct */
  klWaterChannel(0,0,8.2,19.6,.3,.82,{river:{name:'suudme-souk-canal',axis:'z',speed:.54}});

  /* West & East stone quays + glazed kura pier-vault shops + exterior travertine stairs to covered bazaar street */
  for(const s of [-1,1]){
   const qx=s*8.6;
   klFloorSlab(qx,yQuay,0,8.2,17.2,{mk:'paving',col:P('travertine'),th:yQuay});
   klSuudmeStair(qx,0,9.5,qx,yQuay,8.3,2.8,{naga:s<0,nagaScale:.66});

   klWallRing(qx-2.9,-4.4,qx+2.9,3.2,yQuay,yBridge-yQuay-.22,{
    style:'suudme',register:'kura',dadoMk:'cobalt',
    holes:{
     s:[{at:qx-s*1.0,w:1.55,h:2.25,door:true,torana:true,leafMk:'lacquer',name:s<0?'west-souk-pier-door':'east-souk-pier-door'}],
     n:[{at:qx,w:1.15,h:1.25,y:1.05}]
    }
   });
   klCeilingSlab(qx,yBridge-.24,-.6,5.4,7.2,{mk:'darkcedar',col:P('teak'),trimMk:'brass',trimCol:P('gilt')});
   klStair(qx+s*1.8,yQuay,8.4,qx+s*1.8,yBridge,4.3,1.65,{
    mk:'ashlar',col:P('travertine'),sideMk:'cobalt',sideCol:P('cobalt'),openUnder:true
   });
  }

  /* Classical travertine & polychrome cobalt-saffron round-arch viaduct spanning the canal! */
  klFloorSlab(0,yBridge,0,23.8,8.8,{mk:'paving',col:P('travertine'),th:.22});
  klRoundArcade(-5.0,3.85,5.0,3.85,yQuay,yBridge-yQuay-.22,{bays:2,spandrelPal:'cobalt'});
  klRoundArcade(5.0,-3.85,-5.0,-3.85,yQuay,yBridge-yQuay-.22,{bays:2,spandrelPal:'cobalt'});

  /* Covered Ruan-Thai & Classical bazaar colonnade + saffron/crimson silk sun-awnings + crow-step merlons! */
  klPeristyle(-11.2,4.15,11.2,4.15,yBridge,hGal,{n:8,friezePal:'saffron'});
  klPeristyle(11.2,-4.15,-11.2,-4.15,yBridge,hGal,{n:8,friezePal:'emerald'});
  klMerlonParapet(-8.2,4.28,8.2,4.28,yBridge,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  klMerlonParapet(11.0,-4.28,-11.0,-4.28,yBridge,{pal:'cobalt',bandPal:'saffron',accPal:'emerald'});
  svNoWalk(()=>{
   for(const sx of [-5.8,5.8]){
    poly('silk',[[sx-2.8,yBridge+2.75,4.45],[sx+2.8,yBridge+2.75,4.45],[sx+2.8,yBridge+2.18,5.3],[sx-2.8,yBridge+2.18,5.3]],P(sx<0?'silkSaffron':'silkCrimson'),true);
   }
  });
  klSteelyard(0,yRoof-.16,4.45,0,1.85,{bell:true});

  /* 3-Tier Terracotta & Gilt Bell-Mondop crowning the covered canal-bridge souk! */
  klBellMondop(0,yRoof,0,24.2,9.4,3,{
   mk:'terracotta',over:.72,tierRise:1.06,neckH:.34,bell:true,cupolaR:1.95,cupolaH:3.6,cupolaMk:'celadon'
  });

  klTarget(-8.6,yQuay,-.6,'west-pier-spice-vault',true);
  klTarget(8.6,yQuay,-.6,'east-pier-customs-room',true);
  klTarget(0,yBridge,0,'covered-souk-bridge',true);

  klFurnList([
   ['kulanewa_grain_bin',-8.6,yQuay,-2.4,0],
   ['kulanewa_amber_safe',8.6,yQuay,-2.2,0],
   ['kulanewa_bullion_scale',-3.8,yBridge,-2.4,0],
   ['kulanewa_naruqqum_table',0,yBridge,-2.4,0],
   ['kulanewa_tea_samovar',3.8,yBridge,-2.4,0],
   ['kulanewa_lotus_divan',7.2,yBridge,-2.4,0],
   ['kulanewa_uktena_brazier',-6.2,yBridge,0,0],
   ['kulanewa_uktena_brazier',6.2,yBridge,0,0]
  ]);
 }
});
