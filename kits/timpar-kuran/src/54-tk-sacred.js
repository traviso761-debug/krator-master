// prefix: tk
// ================================================================= CLAN SACRED, KANOPI RELIQUARY & POTLATCH HALLS (PLAN.md §3.3, seeds 35101..35106)
// Six ceremonial, funerary, healing & diplomatic buildings:
//   35101 tk_kanopi_shrine        Salvaged 9 m curved Ancient Kanopi arcology canopy-rib reliquary lodge w/ copper tinaa & inau
//   35102 tk_iomante_bear_court   Sacred iomante winter bear-sending precinct w/ raised heper-set log cage, bear & Bear-Clan screen
//   35103 tk_nusa_mortuary_row    Curved Ainu nusa bear/eagle skull-fence paired w/ Tlingit mortuary crest-poles & bone-chests
//   35104 tk_potlatch_feast_hall  Monumental clan potlatch feast & oral crest-genealogy council hall w/ totem-mouth portal
//   35105 tk_shaman_sweat_lodge   Hot-cobble rainforest spring steam sweat-lodge (WATER.still pool) & tusu healer's cise
//   35106 tk_cousin_truce_lodge   Utari-Kuran Veilpass truce-lodge welcoming Hueru-Kuran & Hayrant cousins under shared inau

/* 11. Salvaged Kanopi Arcology Canopy-Rib Reliquary Shrine */
defBuilding({key:'tk_kanopi_shrine',name:'Kanopi Canopy-Rib Reliquary Shrine',seed:35101,cut:true,
 w:15.6,d:14.8,h:10.4,budget:125000,
 tags:{types:['religious'],style:'crest',role:'temple'},
 note:'shamanic clan sanctuary built beneath a salvaged 9.4 m curved titanium-ceramic rib of the shattered Ancient mountain-forest arcology Kanopi',
 build(){
  const G=.44,W=11.6,D=10.8,H=3.55;
  pushM(TF(0,0,-.55));
  tkPlinth(W+.8,D+.8,G,{stepW:2.8});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.46,postR:.28,
   holes:{
    s:[{x:0,y:0,w:2.65,h:2.65}],
    e:[{x:0,y:1.1,w:1.15,h:1.0}],
    w:[{x:0,y:1.1,w:1.15,h:1.0}]
   }
  });
  tkWindow(W/2-.17,G+1.1,0,PI/2,.96,.88,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+1.1,0,-PI/2,.96,.88,{spirit:true,lit:true});
  tkFormlineScreen(0,G+.48,D/2+.01,0,W-.8,H-.56,{crest:'kapac',cutW:2.95,cutH:2.85});
  tkTotemPortal(0,G,D/2-.1,0,8.8,.38,1.34,2.08,{crest:'kapac',wings:true,name:'kanopi-shrine-mouth'});
  tkPlankRoof(W,D,G+H,2.35,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  /* Salvaged 9.4 m curved titanium-ceramic Kanopi arcology canopy rib soaring over the roof ridge + inner relic arch! */
  tkKanopiRib(0,G,-1.2,0,12.8,8.6,{segs:14,w:.46});
  tkKanopiRib(0,G,-3.4,0,7.8,3.2,{segs:10,w:.32});
  /* Relic altar beneath inner Kanopi arch */
  svNoWalk(()=>{
   box('megabreccia',0,G,-3.8,3.2,.54,1.35,hc(SVPAL.megabreccia[0]));
   box('kanopiWhite',0,G+.54,-3.8,2.6,.14,1.1,hc(SVPAL.kanopiWhite[0]));
  });
  tkIroriPit(0,G,.6,1.65,1.65);
  tkNusaFence(-4.4,0,D/2+1.2,.2,2.4,4,{h:1.95});
  tkNusaFence(4.4,0,D/2+1.2,-.2,2.4,4,{h:1.95});
  tkFurnList([
   ['timpar_copper_shield_crest',-2.2,G,-3.6,0],
   ['timpar_copper_shield_crest',2.2,G,-3.6,0],
   ['timpar_kanopi_alloy_lamp',-1.4,G,-2.6,0],
   ['timpar_kanopi_alloy_lamp',1.4,G,-2.6,0],
   ['timpar_inau_nusa_rack',-3.8,G,-.4,PI/2],
   ['timpar_inau_nusa_rack',3.8,G,-.4,-PI/2],
   ['painted_court_bowl',0,G+.68,-3.8,0]
  ]);
  tkTarget(0,G,1.4,'kanopi-sanctuary-floor');
  popM();
 }});

/* 12. Sacred Iomante Bear-Sending Court (raised heper-set log bear-cage + shrine lodge) */
defBuilding({key:'tk_iomante_bear_court',name:'Iomante Sacred Bear-Sending Court',seed:35102,cut:true,
 w:16.8,d:15.4,h:9.4,budget:125000,
 tags:{types:['religious','civic'],style:'crest',role:'shrine'},
 note:'sacred winter spirit-sending precinct pairing a notched-log raised heper-set bear-cage and inau corner-posts with a Kuma Bear-Clan feast screen',
 build(){
  const G=.36;
  pushM(TF(0,0,-.45));
  tkPlinth(14.8,12.6,G,{stepW:3.0,stepX:0});
  /* Rear Bear-Clan ceremonial plank-hall (-z half) */
  pushM(TF(0,0,-2.8));
  tkPlankBox(12.4,5.8,G,3.35,{
   mk:'cypress',socle:.4,postR:.26,
   holes:{s:[{x:0,y:0,w:1.85,h:2.28}],e:[{x:0,y:1.0,w:1.0,h:.92}],w:[{x:0,y:1.0,w:1.0,h:.92}]}
  });
  tkDoor(0,G,2.9-.17,0,1.38,2.12,{inau:true,visor:true,crest:'kuma'});
  tkWindow(6.2-.17,G+1.0,0,PI/2,.84,.8,{spirit:true,lit:true});
  tkWindow(-6.2+.17,G+1.0,0,-PI/2,.84,.8,{lit:true});
  tkFormlineScreen(0,G+.44,2.91,0,11.6,2.8,{crest:'kuma',cutW:2.3,cutH:2.42});
  tkPlankRoof(12.4,5.8,G+3.35,2.15,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  popM();
  /* Raised notched-log Ainu heper-set sacred mountain-bear cage on west side of forecourt + carved sacred bear inside! */
  svNoWalk(()=>{
   const cx=-3.9,cz=2.6;
   for(const sx of [-1.25,1.25])for(const sz of [-1.25,1.25]){
    cyl('cypress',cx+sx,G,cz+sz,.14,3.15,hc(SVPAL.cypressD[0]),8);
    tkInauCluster(cx+sx,G+2.65,cz+sz,0,.85,3);
   }
   box('cedar',cx,G+.72,cz,2.6,.14,2.6,hc(SVPAL.cedar[0]));
   for(let i=0;i<5;i++){
    const ly=G+.92+i*.32;
    for(const sz of [-1.18,1.18])box('cypress',cx,ly,cz+sz,2.68,.13,.13,hc(SVPAL.cypress[0]));
    for(const sx of [-1.18,1.18])box('cypress',cx+sx,ly,cz,.13,.13,2.42,hc(SVPAL.cypress[1]));
   }
   box('cedar',cx,G+2.54,cz,2.76,.16,2.76,hc(SVPAL.cedarD[0]));
   /* Sacred Kim-un-kamuy mountain bear inside the heper-set */
   ellip('pelt',cx,G+1.36,cz,.52,.42,.78,hc(SVPAL.pelt[0]),.25,10);
   ellip('pelt',cx+.12,G+1.58,cz+.68,.28,.26,.3,hc(SVPAL.pelt[1]),.25,8);
   for(const sx of [-.75,.75])for(const sz of [-.45,.45])cyl('pelt',cx+sx*.45,G+.86,cz+sz,.11,.52,hc(SVPAL.pelt[0]),7);
  });
  /* Curved nusa skull-fence on east side of forecourt + outdoor feast hearth */
  tkNusaFence(4.1,G,2.8,-PI/2,4.4,5,{h:2.15,curve:.3});
  tkIroriPit(.4,G,2.6,1.6,1.6);
  tkWindBanner(5.8,G,5.4,-.25,1.5,2.2,{mk:'chilkat'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-3.0,0],
   ['timpar_bear_feast_trough',-3.4,G,-2.8,PI/2],
   ['timpar_inau_nusa_rack',3.6,G,-4.4,0],
   ['timpar_copper_shield_crest',-4.6,G,-4.8,0],
   ['timpar_totem_house_post',4.6,G,-4.6,0],
   ['painted_court_bowl',.4,G,4.1,0]
  ]);
  tkTarget(0,G,1.2,'iomante-forecourt');
  tkTarget(0,G,-2.6,'bear-shrine-hall');
  popM();
 }});

/* 13. Nusa Skull-Fence & Tlingit Mortuary Totem Row */
defBuilding({key:'tk_nusa_mortuary_row',name:'Nusa Skull-Fence and Mortuary Totem Precinct',seed:35103,cut:true,
 w:17.4,d:13.8,h:11.2,budget:120000,
 tags:{types:['funerary','religious'],style:'crest',role:'funerary'},
 note:'curved Ainu nusa bear-and-eagle skull fence standing before three high-relief Tlingit mortuary crest-poles bearing shamanic cedar bone-chests',
 build(){
  const G=.38;
  pushM(TF(0,0,-.45));
  tkPlinth(15.2,11.2,G,{stepW:3.0,stepX:0});
  /* Mortuary bone-preparation & vigil lodge at rear (-z = -2.6) */
  pushM(TF(0,0,-2.7));
  tkPlankBox(10.8,5.0,G,3.05,{
   mk:'silverwood',socle:.4,postR:.24,
   holes:{s:[{x:0,y:0,w:1.78,h:2.22}],e:[{x:0,y:.95,w:.95,h:.86}],w:[{x:0,y:.95,w:.95,h:.86}]}
  });
  tkDoor(0,G,2.5-.17,0,1.3,2.06,{inau:true});
  tkWindow(5.4-.17,G+.95,0,PI/2,.8,.76,{spirit:true,lit:true});
  tkWindow(-5.4+.17,G+.95,0,-PI/2,.8,.76,{lit:true});
  tkFormlineScreen(0,G+2.24,2.51,0,10.0,.72,{crest:'rapan'});
  tkPlankRoof(10.8,5.0,G+3.05,1.95,{mk:'shingle',cobbles:true,smokeShutter:false,kaenFinials:true});
  popM();
  /* Three tall mortuary totem poles crowned with painted kerfed bone-chests! */
  tkTotemPole(-4.8,G,2.4,0,8.8,.38,{crest:'kuma',figures:3,mortuaryBox:true,wings:false});
  tkTotemPole(0,G,3.1,0,9.6,.42,{crest:'hueru',figures:3,mortuaryBox:true,wings:true,wingSpan:1.65});
  tkTotemPole(4.8,G,2.4,0,8.8,.38,{crest:'rapan',figures:3,mortuaryBox:true,wings:false});
  /* Flanking curved nusa skull-fences & wind-swaying attus mourning banners */
  tkNusaFence(-5.6,G,-.2,PI/2,4.2,5,{h:2.1,curve:.28});
  tkNusaFence(5.6,G,-.2,-PI/2,4.2,5,{h:2.1,curve:.28});
  tkWindBanner(-6.4,G,4.4,.2,1.4,2.1,{mk:'attus'});
  tkWindBanner(6.4,G,4.4,-.2,1.4,2.1,{mk:'attus'});
  tkFurnList([
   ['timpar_kerfed_bentwood_chest',-3.2,G,-3.8,0,0],
   ['timpar_kerfed_bentwood_chest',3.2,G,-3.8,0,1],
   ['timpar_inau_nusa_rack',0,G,-4.1,0],
   ['timpar_kanopi_alloy_lamp',-2.2,G,-1.6,0],
   ['timpar_kanopi_alloy_lamp',2.2,G,-1.6,0],
   ['hl_tri_stone_altar',-2.4,G,2.2,0]
  ]);
  tkTarget(0,G,1.2,'mortuary-totem-court');
  tkTarget(0,G,-2.6,'vigil-lodge');
  popM();
 }});

/* 14. Monumental Clan Potlatch Feast & Council Hall */
defBuilding({key:'tk_potlatch_feast_hall',name:'Potlatch Feast and Oral Crest-Council Hall',seed:35104,cut:true,
 w:21.6,d:17.6,h:12.2,budget:165000,
 tags:{types:['civic','tavern'],wealth:'rich',style:'crest',role:'council'},
 note:'great potlatch council house where non-literate clan-speakers chant yukar genealogies, smash or gift copper tinaa shields and feast over twin irori fires',
 build(){
  const G=.46,W=19.6,D=13.8,H=4.3;
  pushM(TF(0,0,-.65));
  tkPlinth(W+.8,D+.8,G,{stepW:3.6,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.48,postR:.34,
   holes:{
    s:[{x:0,y:0,w:2.95,h:2.9},{x:-6.2,y:1.25,w:1.25,h:1.15},{x:6.2,y:1.25,w:1.25,h:1.15}],
    n:[{x:-4.8,y:1.35,w:1.25,h:1.15},{x:4.8,y:1.35,w:1.25,h:1.15}],
    e:[{x:0,y:1.35,w:1.3,h:1.15}],
    w:[{x:0,y:1.35,w:1.3,h:1.15}]
   }
  });
  for(const sx of [-6.2,6.2])tkWindow(sx,G+1.25,D/2-.17,0,1.02,.96,{lit:true});
  for(const sx of [-4.8,4.8])tkWindow(sx,G+1.35,-D/2+.17,PI,1.02,.96,{lit:true});
  tkWindow(W/2-.17,G+1.35,0,PI/2,1.06,.96,{spirit:true,lit:true});
  tkWindow(-W/2+.17,G+1.35,0,-PI/2,1.06,.96,{lit:true});
  tkFormlineScreen(0,G+.5,D/2+.01,0,W-.9,H-.58,{crest:'rapan',cutW:3.3,cutH:3.08});
  tkTotemPortal(0,G,D/2-.1,0,10.8,.45,1.46,2.16,{crest:'rapan',wings:true,name:'potlatch-mouth'});
  /* War-loot Eternian trophy heads & open-eyed Timpar-Kuran visors flanking the potlatch porch */
  for(const sx of [-1,1]){
   tkWarVisor(sx*4.1,G+3.3,D/2+.22,0,.5,{crest:'rapan'});
   tkLootHead(sx*8.2,G+1.6,D/2+.65,0,.48,{mk:'bronze',inverted:true,warPaint:true});
  }
  tkPlankRoof(W,D,G+H,2.85,{mk:'cypress',cobbles:true,smokeShutter:true,kaenFinials:true});
  tkFormlineGable(0,G+H+.1,D/2-.08,0,W-.5,2.7,{crest:'rapan'});
  const ys=tkDaakTiers(W-.9,D-.9,G,2,{stepH:.36,benchD:1.85});
  tkIroriPit(-3.0,G,.4,1.9,1.9);
  tkIroriPit(3.0,G,.4,1.9,1.9);
  tkWindBanner(-7.8,G,D/2+.95,.15,1.65,2.4,{mk:'chilkat'});
  tkWindBanner(7.8,G,D/2+.95,-.15,1.65,2.4,{mk:'chilkat'});
  tkFurnList([
   ['painted_court_throne',0,ys[2],-4.9,0],
   ['timpar_copper_shield_crest',-2.6,ys[2],-5.1,0],
   ['timpar_copper_shield_crest',2.6,ys[2],-5.1,0],
   ['timpar_eternian_trophy_rack',-5.8,ys[2],-4.9,0],
   ['timpar_kerfed_bentwood_chest',5.8,ys[2],-4.9,0,1],
   ['timpar_bear_feast_trough',-3.0,G,2.6,0],
   ['timpar_bear_feast_trough',3.0,G,2.6,0],
   ['painted_court_table',0,G,-1.8,0],
   ['timpar_totem_house_post',-4.6,G,-1.5,PI/2],
   ['timpar_totem_house_post',4.6,G,-1.5,-PI/2],
   ['timpar_kanopi_alloy_lamp',0,G,3.2,0]
  ]);
  tkTarget(0,G,1.4,'potlatch-feast-floor');
  tkTarget(0,ys[2],-4.5,'potlatch-speaker-daak');
  popM();
 }});

/* 15. Shaman's Hot-Cobble Sweat-Lodge & Spring Pool (WATER.still!) */
defBuilding({key:'tk_shaman_sweat_lodge',name:'Shaman Sweat-Lodge and Cold-Spring Plunge',seed:35105,cut:true,
 w:14.2,d:13.4,h:7.2,budget:85000,
 tags:{types:['religious','civic'],style:'jomon',role:'healer',job:'healing'},
 note:'bark-and-moss tusu shamanic steam sweat-lodge beside a stone-kerbed cold mountain spring plunge-pool (WATER.still) and herb drying rack',
 build(){
  const G=.34;
  pushM(TF(0,0,-.4));
  tkPlinth(12.2,10.4,G,{stepW:2.4,stepX:-2.2});
  /* West side: domed/stepped bark & turf sweat-lodge */
  pushM(TF(-2.3,0,-.4));
  tkPlankBox(6.4,6.8,G,2.45,{
   mk:'bark',socle:.42,postR:.21,
   holes:{s:[{x:0,y:0,w:1.56,h:2.04}],e:[{x:0,y:.9,w:.88,h:.78}]}
  });
  tkDoor(0,G,3.4-.17,0,1.14,1.92,{inau:true});
  tkWindow(3.2-.17,G+.9,0,PI/2,.72,.66,{spirit:true,lit:true});
  tkCiseRoof(6.4,6.8,G+2.45,2.15,{courses:6,mk:'turf',crownR:.32,crownH:.58});
  popM();
  /* East side: megabreccia-kerbed cold mountain spring plunge basin (registered for WATER.still in 91z-tk-world.js!) */
  const bx=3.5,bz=-.2,bw=3.6,bd=4.8,rimH=.42;
  svNoWalk(()=>{
   for(const sz of [-1,1])box('megabreccia',bx,G,bz+sz*(bd/2-.22),bw,.42,.44,hc(SVPAL.megabreccia[0]));
   for(const sx of [-1,1])box('megabreccia',bx+sx*(bw/2-.22),G,bz,.44,.42,bd-.88,hc(SVPAL.megabreccia[1]));
   box('cobble',bx,G,bz,bw-.88,.08,bd-.88,hc(SVPAL.cobble[0]));
  });
  tkNusaFence(3.5,G,-3.4,0,3.2,4,{h:1.9,curve:.18});
  tkDryingLine(1.8,3.2,5.0,3.2,G+1.9,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',-2.3,G,-.6,0],
   ['timpar_inau_nusa_rack',-2.3,G,-2.9,0],
   ['hl_tri_herb_rack',-4.4,G,-.4,PI/2],
   ['timpar_attus_bale_bench',-.6,G,1.2,-PI/2],
   ['timpar_kanopi_alloy_lamp',1.2,G,2.4,0],
   ['generic_storage_jar',-4.2,G,1.8,0]
  ]);
  tkTarget(-2.3,G,.8,'sweat-lodge-hearth');
  tkTarget(3.5,G,3.0,'spring-pool-apron');
  if(CURREC&&!PLACE_DRY){
   const c0=new THREE.Vector3(bx-1.32,G+rimH-.1,bz-1.92).applyMatrix4(CM);
   const c1=new THREE.Vector3(bx+1.32,G+rimH-.1,bz+1.92).applyMatrix4(CM);
   const x0=Math.min(c0.x,c1.x),x1=Math.max(c0.x,c1.x),z0=Math.min(c0.z,c1.z),z1=Math.max(c0.z,c1.z);
   (CURREC.stills=CURREC.stills||[]).push({
    name:CURREC.key+'-spring',level:c0.y,bounds:[x0,z0,x1,z1],
    poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],color:0x1b5250
   });
  }
  popM();
 }});

/* 16. Utari-Kuran Veilpass Cousin Truce-Lodge (embassy / parley hall) */
defBuilding({key:'tk_cousin_truce_lodge',name:'Utari-Kuran Veilpass Cousin Truce-Lodge',seed:35106,cut:true,
 w:16.4,d:14.2,h:9.6,budget:120000,
 tags:{types:['civic','inn'],wealth:'middle',style:'crest',role:'embassy'},
 note:'Veilpass parley lodge where Timpar-Kuran, coastal Hueru-Kuran and Outer-Wall Hayrant cousins trade nephrite, copper, whalebone and iron under shared inau immunity',
 build(){
  const G=.42,W=13.6,D=10.2,H=3.55;
  pushM(TF(0,0,-.5));
  tkPlinth(W+.7,D+.7,G,{stepW:2.8,stepX:0});
  tkPlankBox(W,D,G,H,{
   mk:'cypress',socle:.44,postR:.28,
   holes:{
    s:[{x:0,y:0,w:2.65,h:2.65},{x:-4.2,y:1.05,w:1.1,h:1.0},{x:4.2,y:1.05,w:1.1,h:1.0}],
    n:[{x:-3.2,y:1.1,w:1.1,h:1.0},{x:3.2,y:1.1,w:1.1,h:1.0}],
    e:[{x:0,y:1.1,w:1.15,h:1.0}]
   }
  });
  for(const sx of [-4.2,4.2])tkWindow(sx,G+1.05,D/2-.17,0,.92,.88,{lit:true});
  for(const sx of [-3.2,3.2])tkWindow(sx,G+1.1,-D/2+.17,PI,.92,.86,{lit:true});
  tkWindow(W/2-.17,G+1.1,0,PI/2,.96,.88,{spirit:true,lit:true});
  /* Hueru ancestral whale crest screen + totem-mouth portal honouring the three Utari-Kuran sister branches */
  tkFormlineScreen(0,G+.46,D/2+.01,0,W-.8,H-.54,{crest:'hueru',cutW:2.95,cutH:2.82});
  tkTotemPortal(0,G,D/2-.1,0,9.0,.39,1.36,2.08,{crest:'hueru',wings:true,name:'cousin-truce-mouth'});
  /* Three kaen-doki smoke-pots along ridge symbolizing Timpar-Kuran, Hueru-Kuran & Hayrant */
  tkPlankRoof(W,D,G+H,2.35,{mk:'cedar',cobbles:true,smokeShutter:false,kaenFinials:false});
  for(const sz of [-3.2,0,3.2])tkKaenCrown(0,G+H+2.55,sz,.3,.58,4,{smoke:sz===0});
  tkWindBanner(-5.6,G,D/2+.85,.18,1.45,2.15,{mk:'chilkat'});
  tkWindBanner(5.6,G,D/2+.85,-.18,1.45,2.15,{mk:'attus'});
  tkFurnList([
   ['timpar_irori_kaen_hearth',0,G,-.2,0],
   ['timpar_bear_feast_trough',-3.4,G,-.4,PI/2],
   ['painted_court_table',3.4,G,-.4,-PI/2],
   ['timpar_inau_nusa_rack',0,G,-3.8,0],
   ['timpar_copper_shield_crest',-4.2,G,-3.9,0],
   ['timpar_kerfed_bentwood_chest',4.2,G,-3.9,0,1],
   ['painted_common_bed',-4.8,G,2.6,PI/2],
   ['timpar_kanopi_alloy_lamp',2.2,G,2.8,0]
  ]);
  tkTarget(0,G,1.2,'truce-parley-hall');
  popM();
 }});
