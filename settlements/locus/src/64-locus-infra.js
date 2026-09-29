/* ============================== 16R. LOCUS — the warehouse, the fishing dock, and Yuni's tags ==============================
   Two buildings the city needs that neither kit had: the salt-and-oil warehouse on the ring and the fishing
   jetty on the river. And the project's tag rule applied to every Yuni asset the Locus world places, so the
   inspector reports culture and type for all of them, not only the Locus kit's own.                     */
reseed(646001);
(function(){
  var PI=Math.PI;
  /* =============================================================== 1. SALT-AND-OIL WAREHOUSE */
  ASSET({ key:'locus_warehouse', name:'Salt-and-oil warehouse', family:'trade', kit:'locus', group:'Town: warehouse and fishing dock', culture:'yuni', types:['industry','market/shop'],
    districts:['core','market'], wealth:[0.3,0.8], w:42, d:22, h:12, variants:1,
    build:function(F){
      var mud=F.pick(MUDBROWNC), mud2=shade(mud,-0.12), rel=shade(mud,0.16), W=38, D=13, H=8.4, bz=-3.0;
      /* the loading plinth along the front, with steps at both ends */
      F.box(0, 0, 5.2, 40, 1.15, 5.4, 0, mud2, 'adobe'); F.box(0, 1.1, 5.2, 40.2, 0.1, 5.6, 0, PAL.paving[2], 'adobe');
      [-1,1].forEach(function(s){ for(var k=0;k<4;k++) F.box(s*(20.6+k*0.0), k*0.28, 8.1+k*0.0, 1.2, 0.28, 0.4+(3-k)*0.0, 0, shade(mud,0.08), 'adobe'); });
      for(var st=0;st<4;st++) F.box(0, st*0.29, 8.6-st*0.42, 6, 0.29, 0.42, 0, shade(mud,0.06), 'adobe');
      /* the long hall: battered banco, pilaster-pinnacles, toron rows, vents */
      LOCUS.mudBlock(F, 0, bz, W, H, D, mud, { pilasters:8, vents:true, ventX:-12, toronBack:true });
      /* four parabolic loading doors in the front wall */
      [-13.5,-4.5,4.5,13.5].forEach(function(dx){ var zf=bz+D/2*(1-0.16*1.1/H);
        F.box(dx, 1.1, zf-0.30, 3.4, 3.6, 0.5, 0, VOIDC[1], 'dark'); F.archband('relief', dx, 1.1, zf+0.06, 0, 3.4, 4.0, 0.42, 0.18, rel);
        F.box(dx-1.9, 1.1, zf+0.35, 0.12, 3.4, 1.4, 0.55, PLANKC[1], 'plank'); });
      (F.doors||(F.doors=[])).push([F.P(0,0,9.2).x, F.y, F.P(0,0,9.2).z]);
      /* a canvas shade on posts over the plinth, and the timber jib crane at one end */
      [-18,-6,6,18].forEach(function(x){ LOCUS.pole(F, x, 7.7, 4.4, 0.09, TIMBERC[1], true); });
      LOCUS.stripes(F, [-19.5,4.9,bz+D/2*0.93],[19.5,4.9,bz+D/2*0.93],[19.5,4.4,7.7],[-19.5,4.4,7.7], 12, CANVASC[1], GEOBROWNC[2], { sag:0.2 });
      F.cyl(19.2, 1.1, 1.0, 0.18, 7.2, 0, TIMBERC[0], 'timber'); F.rod(19.2, 7.9, 1.0, 19.2, 7.3, 7.8, 0.12, TIMBERC[2], 'timber');
      F.rod(19.2, 7.2, 7.6, 19.2, 3.0, 7.6, 0.02, PAL.people.hair[2], 'timber'); F.box(18.9, 2.3, 7.3, 0.9, 0.7, 0.9, 0.3, CANVASC[3], 'canvas');
      /* the stock on the plinth: drums, salt sacks, bales */
      for(var d=0;d<6;d++) LOCUS.drum(F, -17.5+d*0.72, 1.1, 6.6, RUSTC[d%5]);
      for(var b=0;b<5;b++) F.box(8+b*1.05, 1.1, 6.4, 0.9, 0.55+((b*3)%2)*0.5, 0.7, 0.2*b, b%2?SALTCRUSTC[0]:CANVASC[2], 'canvas');
      for(var b2=0;b2<3;b2++) F.box(-8+b2*1.2, 1.1, 6.7, 1.0, 0.8, 0.9, 0, THATCHC[b2%4], 'thatch');
      F.lantern(-9, 3.4, bz+D/2*0.98+0.3, 0.8, 12, 0); F.lantern(9, 3.4, bz+D/2*0.98+0.3, 0.8, 12, 0);
    } });

  /* =============================================================== 2. FISHING DOCK */
  ASSET({ key:'infra_fishing_dock', name:'Fishing dock', family:'prop', kit:'locus', group:'Town: warehouse and fishing dock', culture:'abyssal-desert', types:['infrastructure'],
    districts:['poor'], wealth:[0,0.6], w:12, d:34, h:5, variants:2, variantNames:['straight jetty','T-head jetty'],
    build:function(F){
      var v=F.variant, pk=F.pick(PLANKC), pc=F.pick(PILEC), Y=1.25, W=3.2, z0=15.5, z1=-16.5;
      /* the landing on the bank: a plank platform and three steps down to the lane */
      F.box(0, 0, 14.2, 7, Y-0.12, 5.4, 0, shade(pk,-0.3), 'timber'); F.box(0, Y-0.12, 14.2, 7.2, 0.12, 5.6, 0, pk, 'plank');
      for(var s=0;s<3;s++) F.box(0, s*0.36, 17.2-s*0.0+0.0, 3.0, 0.36, 0.5+ (2-s)*0.45, 0, shade(pk,-0.1), 'plank');
      /* the jetty: piles in pairs every 3 m, bearers, planks */
      for(var z=z0; z>=z1-0.1; z-=3){ [-1,1].forEach(function(sd){ LOCUS.pile(F, sd*(W/2-0.1), z, Y+0.9, 0.16, pc); }); F.box(0, Y-0.36, z, W+0.5, 0.24, 0.24, 0, shade(pc,-0.1), 'timber'); }
      LOCUS.deck(F, 0, (z0+z1)/2, W, z0-z1, Y, pk);
      if(v===1){ LOCUS.deck(F, 0, z1+1.6, 11.6, 3.2, Y, pk); [-5.4,-2.7,2.7,5.4].forEach(function(x){ LOCUS.pile(F, x, z1+0.2, Y+0.9, 0.16, pc); LOCUS.pile(F, x, z1+3.0, Y+0.9, 0.16, pc); }); }
      /* mooring posts and a rope rail on one side */
      for(var m=0;m<5;m++){ var mz=z0-4-m*6; F.cyl(W/2+0.25, Y-0.3, mz, 0.12, 1.2, 0, TIMBERC[0], 'timber'); F.cyl(-W/2-0.25, Y-0.3, mz-3, 0.12, 1.2, 0, TIMBERC[0], 'timber'); }
      F.rod(-W/2+0.1, Y+0.9, z0-1, -W/2+0.1, Y+0.9, z1+1, 0.03, PAL.people.hair[2], 'timber');
      /* the net shed at the root: reed walls, a canvas roof, nets hung to dry */
      var sx=4.1, sz=13.6; LOCUS.matWall(F, sx, Y, sz-1.6, 3.2, 2.2, 0,-1, null, true); LOCUS.matWall(F, sx+1.6, Y, sz, 3.2, 2.2, 1,0, null, true);
      [[sx-1.6,sz-1.6],[sx+1.6,sz-1.6],[sx+1.6,sz+1.6],[sx-1.6,sz+1.6]].forEach(function(p){ F.cyl(p[0], Y, p[1], 0.07, 2.5, 0, TIMBERC[1], 'timber'); });
      LOCUS.canopy(F, [[sx-2.0,Y+2.6,sz-2.0],[sx+2.0,Y+2.4,sz-2.0],[sx+2.0,Y+2.6,sz+2.0],[sx-2.0,Y+2.4,sz+2.0]], F.pick(CANVASDYEC), { sag:0.2 });
      for(var r=0;r<2;r++){ var rx=-4.3, rz=12.2+r*2.6; F.cyl(rx-1.2, Y, rz, 0.05, 1.9, 0, TIMBERC[1], 'timber'); F.cyl(rx+1.2, Y, rz, 0.05, 1.9, 0, TIMBERC[1], 'timber');
        F.rod(rx-1.25, Y+1.8, rz, rx+1.25, Y+1.8, rz, 0.03, TIMBERC[1], 'timber'); F.box(rx, Y+0.7, rz, 2.3, 1.1, 0.04, 0, 0x6a7a6c, 'cloth'); }
      /* baskets, a fish tray, a lantern at the head of the jetty */
      F.cyl(-2.4, Y, 15.8, 0.36, 0.45, 0, THATCHC[2], 'thatch'); F.cyl(-1.6, Y, 16.3, 0.32, 0.38, 0, THATCHC[1], 'thatch'); F.box(2.2, Y, 16.2, 1.2, 0.18, 0.7, 0.3, pk, 'plank');
      F.cyl(0.9, Y, z1+0.6, 0.06, 2.3, 0, TIMBERC[0], 'timber'); F.lantern(0.9, Y+2.2, z1+0.6, 0.6, 10, 0.3);
      (F.doors||(F.doors=[])).push([F.P(0,0,18.2).x, F.y, F.P(0,0,18.2).z]);
      F.dockHead = [F.P(0,0,z1-1.5).x, F.P(0,0,z1-1.5).z];
    } });

  /* =============================================================== 3. THE PROJECT TAGS, on Yuni's own assets */
  var T = {
    mid_washed_house:['single-family dwelling'], mid_bluewash_townhouse:['single-family dwelling'], mid_djenne_house:['single-family dwelling'], mid_round_tower_house:['single-family dwelling'], mid_courtyard_house:['single-family dwelling'],
    poor_musgum:['single-family dwelling'], poor_egg_hut:['single-family dwelling'], poor_cone_cluster:['multi-family dwelling'], poor_mud_house:['single-family dwelling'], poor_compound:['multi-family dwelling'], poor_shack:['single-family dwelling'],
    rich_family_compound:['multi-family dwelling'], rich_terrace_apartments:['multi-family dwelling'], rich_merchant_palace:['single-family dwelling','market/shop'], rich_tower_house:['single-family dwelling'], rich_emir_palace:['civic','single-family dwelling'],
    trade_shop_house:['market/shop','single-family dwelling'], trade_tavern:['tavern/inn'], trade_smithy:['industry','market/shop'], trade_caravanserai:['tavern/inn','market/shop'], trade_market_hall:['market/shop'],
    prop_market_stall:['market/shop','prop'], prop_fountain_kiosk:['infrastructure','prop'], prop_granary:['farm','prop'], prop_well:['infrastructure','prop'], prop_hangar:['prop'], prop_animal_pen:['farm','prop'],
    civic_chapter_house:['civic','religious'], civic_school:['civic'], civic_library:['civic'], civic_archive:['civic'], civic_hall_records:['civic'], civic_sankore_spire:['religious','civic'], civic_bathhouse:['civic'], civic_bell_tower:['civic','infrastructure'],
    park_serpentine_bench:['prop'], park_hypostyle:['prop'], park_lizard_stair:['prop'], park_gatehouse:['prop','infrastructure'], park_viaduct:['infrastructure','prop'], park_fountain_roundel:['prop']
  };
  var ORDER = { civic_chapter_house:1, civic_school:1, civic_library:1, civic_archive:1, civic_hall_records:1 };
  ASSETS.forEach(function(A){
    if(A.culture) return;
    if(T[A.key]){ A.culture = ORDER[A.key] ? 'order' : 'yuni'; A.types = T[A.key]; if(A.family==='park') A.tags=['outdoor furniture (park piece)']; }
    else if(A.family==='ancient'){ A.culture='ancient'; A.types=['civic']; }
  });
})();
