// prefix: dvw
// ================================================================= DZAGH-VARDZI THREE WONDERS (Hooks 2, 3 & 4 — LORE.md §6.26)
//   Hook 2 (`dv-hall-troubadour`): Hall of Seven Strings & Hero-Troubadour Lodge (Ashugh-Gmiri chivalric knight-bards)
//   Hook 3 (`dv-vault-mepe-qvevri`): Century-Buried Mepe-Qvevri Elixir Cellar & Tasting Loggia (30-100+ yr thin-air cordials)
//   Hook 4 (`dv-organ-beacon`): Chasm-Wind Pipe-Organ Raid-Beacon & Hand-Cranked Aerial Cable-Basket Gondola Prow

/* 24a. Hook 2 — Hall of Seven Strings & Hero-Troubadour Lodge (`dv-hall-troubadour`) */
defBuilding({key:'dv-hall-troubadour',name:'Ashugh-Sakhli Hall of Seven Strings & Hero-Troubadour Lodge',seed:7216,
 cls:'building',w:16.8,d:14.2,h:18.2,cut:true,
 tags:{types:['civic','tavern'],wealth:'rich',style:'aul',role:'troubadour hall',job:'scribing',landmark:true},
 note:'Polychrome apricot-tuff & basalt ablaq lodge of the free-roaming Hero-Troubadours (Ashugh-Gmiri), crowned by a 12-pleat verdigris gumbat spire and dark-slate corner koshki watch-turret, with a raised bardic dais, panduri lute racks, and seven-valley chivalric errand board.',
 build(){
  const cx0=-1.55,cz0=.3,w0=10.8,d0=9.0,y0=.38,h0=4.45;
  dvRootSkirt(cx0,cz0,w0,d0,6.0,{mk:'colBasalt',plinthH:y0+.25});
  dvFloorRect(cx0,cz0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,cz0,w0,d0,y0,h0,{
   front:[{x:0,w:1.54,h:2.42,door:true},{x:-3.25,w:.92,y:1.0,h:1.32},{x:3.25,w:.92,y:1.0,h:1.32}],
   left:[{x:-1.4,w:.88,y:1.0,h:1.28},{x:1.4,w:.88,y:1.0,h:1.28}],
   right:[{x:1.6,w:.88,y:1.0,h:1.28}],
   back:[{x:0,w:.96,y:1.15,h:1.32}]
  });
  dvExtStair(cx0,cz0+d0/2+1.05,0,y0,PI,1.65,1.05);
  dvJadeCross(cx0-3.25,y0+3.38,cz0+d0/2+.01,0,.64);
  dvJadeCross(cx0+3.25,y0+3.38,cz0+d0/2+.01,0,.64);
  dvLampBracket(cx0-1.25,y0+2.25,cz0+d0/2+.02,0,.95);
  dvLampBracket(cx0+1.25,y0+2.25,cz0+d0/2+.02,0,.95);

  /* walkable Dagestani slate roof-plaza + 12-pleat patinated verdigris copper gumbat spire */
  dvRoofTerrace(cx0,cz0,w0+.16,d0+.16,y0+h0,{});
  dvGumbat(cx0,cz0-.15,2.2,y0+h0,2.6,3.5,{mk:'verdigris',windows:8});

  /* dark-slate & crimson-tuff corner koshki watch-turret on east flank (44 cm clear of hall plinth) */
  dvNeedleTower(5.65,-2.05,2.6,0,12.6,{rootD:6.2,doorYaw:0,pulley:true,pulleyYaw:0,pulleyDrop:3.1});

  /* heralds safe-conduct standards (SV_CLOTH) across K1-K7 */
  dvBanner(cx0-3.6,y0+h0,cz0+d0/2-.28,0,2.85,P('crimson'));
  dvBanner(cx0-1.3,y0+h0,cz0+d0/2-.28,0,2.85,P('saffron'));
  dvBanner(cx0+1.3,y0+h0,cz0+d0/2-.28,0,2.85,P('indigo'));
  dvBanner(cx0+3.6,y0+h0,cz0+d0/2-.28,0,2.85,P('apricot'));

  /* exterior Chivalric Errand & Oath Tablet Board with emerald-nephrite seals */
  dvNoCut(()=>svNoWalk(()=>{
   const bx=1.9,bz=5.72;
   box('basalt',bx,.006,bz,1.86,.28,.42,P('basalt'));
   for(const sx of [-.76,.76])box('cypress',bx+sx,.292,bz,.11,1.76,.12,P('cypress'));
   box('planks',bx,.72,bz,1.34,1.12,.06,P('planks'));
   box('tuffPolished',bx,2.058,bz,1.98,.16,.38,P('tuffCrimson'));
   cyl('gold',bx,2.225,bz,.075,.08,P('gold'),8);
   for(const sx of [-.42,0,.42]){
    box('shellrender',bx+sx,.92,bz+.048,.32,.68,.018,P('shellrender'));
    box('jade',bx+sx,.98,bz+.072,.09,.09,.016,P('jadeBright'));
   }
  }));

  /* interior raised Ashugh-Gmiri bardic performance dais */
  const yDais=y0+.267;
  svNoWalk(()=>{
   box('skarn',cx0,y0+.006,cz0-2.45,4.4,.2,2.1,P('skarn'));
   box('floor',cx0,y0+.212,cz0-2.45,4.16,.055,1.88,P('cypress'));
  });
  wkPad(cx0,cz0-2.45,4.1,1.8,yDais);

  dvFurn([
   ['dv_panduri_lute_rack',cx0-1.25,yDais,cz0-2.75,0],
   ['dv_panduri_lute_rack',cx0+1.25,yDais,cz0-2.75,0],
   ['dv_carved_chair',cx0,yDais,cz0-2.15,0],
   ['dv_court_carpet',cx0,y0,cz0+.85,0],
   ['dv_feast_table_brandy',cx0-2.85,y0,cz0+.95,PI/2],
   ['dv_feast_table_brandy',cx0+2.85,y0,cz0+.95,-PI/2],
   ['dv_armour_stand_scale',cx0-3.95,y0,cz0-2.75,.25],
   ['dv_rack_buckler_sword',cx0+3.95,y0,cz0-2.75,-.25],
   ['dv_scriptorium_lectern',cx0+3.75,y0,cz0+2.95,-PI*.75],
   ['dv_brazier_copper',cx0,y0+.058,cz0+.85,0]
  ]);
  FURNISH_HANG('dv_chandelier_bronze',cx0,y0+h0-.18,cz0+.4,0);
 }});

/* 24b. Hook 3 — Century-Buried Mepe-Qvevri Elixir Cellar & Tasting Loggia (`dv-vault-mepe-qvevri`) */
defBuilding({key:'dv-vault-mepe-qvevri',name:'Mepe-Marani Century-Buried Qvevri Elixir Cellar & Tasting Loggia',seed:7217,
 cls:'building',w:14.8,d:14.2,h:13.4,cut:true,
 tags:{types:['industry','shop'],wealth:'rich',style:'aul',role:'elixir cellar',job:'brewing',landmark:true},
 note:'Vaulted ablaq & golden-skarn subterranean elixir cellar and arcaded tasting loggia embedding beeswax- and placer-gold-sealed Mepe-Qvevri amphora necks (30-100+ year apricot brandy, saffron, sky-poppy resin & skarn water prized on < 0.75 atm passes).',
 build(){
  const w0=11.6,y0=.34,h0=4.15;
  dvRootSkirt(0,.25,w0,10.6,6.0,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(0,.25,w0-.08,10.52,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,-.85,w0-.16,8.2,y0,h0,{
   front:[{x:0,w:1.52,h:2.38,door:true},{x:-3.45,w:.86,y:1.1,h:1.18},{x:3.45,w:.86,y:1.1,h:1.18}],
   left:[{x:0,w:.86,y:1.1,h:1.18}],right:[{x:0,w:.86,y:1.1,h:1.18}],
   back:[{x:0,w:.92,y:1.15,h:1.2}]
  });
  dvExtStair(0,6.55,0,y0,PI,1.85,1.0);
  dvJadeCross(-3.45,y0+3.22,3.26,0,.58);
  dvJadeCross(3.45,y0+3.22,3.26,0,.58);

  /* open-arcaded front Tasting Loggia with carved cypress columns, skarn architrave & verdigris pent-roof */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-4.4,-1.65,1.65,4.4]){
    box('basalt',sx,y0+.006,5.22,.44,.32,.44,P('basalt'));
    cyl('cypress',sx,y0+.332,5.22,.13,2.48,P('cypress'),10);
    box('skarn',sx,y0+2.818,5.22,.48,.14,.48,P('skarn'));
   }
   box('skarn',0,y0+2.964,5.22,11.1,.22,.38,P('skarn'));
   box('verdigris',0,y0+3.44,4.44,11.3,.095,2.22,P('verdigris'),.21,0,0);
  }));

  /* upper sunny apricot-steeping roof-plaza + 12-pleat crimson-tuff gumbat + copper alembic vent-hood */
  dvRoofTerrace(0,-.85,11.6,8.36,y0+h0,{});
  dvGumbat(0,-.85,1.95,y0+h0,2.25,2.95,{mk:'tuffPolished',col:P('tuffCrimson'),windows:4});
  dvSparkHood(3.85,y0+h0,-2.55,1.55,2.05);

  /* interior nephrite vintage-year tally plaques + copper/terracotta saffron & sky-poppy infusion still */
  svNoWalk(()=>{
   for(const sx of [-3.6,-2.2,-.8,.8,2.2,3.6]){
    if(Math.abs(sx)<1.1)continue;
    box('skarn',sx,y0+1.85,-4.555,.56,.72,.024,P('skarn'));
    box('jade',sx,y0+1.93,-4.525,.42,.56,.022,P('jade'));
    box('gold',sx,y0+2.32,-4.498,.24,.08,.016,P('gold'));
   }
   box('basalt',3.95,y0+.006,-2.65,1.65,.42,1.35,P('basalt'));
   box('glow',3.95,y0+.14,-1.94,.46,.18,.04,0xff6e24);
   cyl('terracotta',3.55,y0+.432,-2.65,.46,.52,P('terracotta'),12);
   cyl('bronze',3.55,y0+.958,-2.65,.36,.44,P('bronze'),12);
   cone('verdigris',3.55,y0+1.404,-2.65,.38,.48,P('verdigris'),12);
   beam('bronze',[3.62,y0+1.72,-2.65],[4.42,y0+1.08,-2.65],.055,P('bronze'));
   cyl('terracotta',4.45,y0+.432,-2.65,.22,.56,P('terracotta'),10);
   cyl('gold',4.45,y0+.998,-2.65,.14,.06,P('gold'),10);
  });

  dvFurn([
   ['dv_mepe_qvevri_seal',-2.85,y0,-2.85,0],
   ['dv_mepe_qvevri_seal',0,y0,-2.85,0],
   ['dv_mepe_qvevri_seal',-2.85,y0,-.55,0],
   ['dv_qvevri_floor_pit',1.85,y0,-.55,0],
   ['dv_qvevri_rack',-4.65,y0,1.35,PI/2],
   ['dv_scale_weregild',3.65,y0,1.45,-PI*.25],
   ['dv_shelves_provisions',4.65,y0,-.25,-PI/2],
   ['dv_feast_table_brandy',-2.65,y0,4.35,0],
   ['dv_carved_chair',-2.65,y0,3.62,0],
   ['dv_brazier_copper',3.45,y0,4.35,0]
  ]);
  dvNoCut(()=>FURNISH('dv_apricot_drying_tray',-3.2,y0+h0+.006,-.85,0));
  FURNISH_HANG('dv_chandelier_bronze',0,y0+h0-.18,-.85,0);
 }});

/* 24c. Hook 4 — Chasm-Wind Pipe-Organ Raid-Beacon & Gondola Prow (`dv-organ-beacon`) */
defBuilding({key:'dv-organ-beacon',name:'Kari-Tsikhe Chasm-Wind Pipe-Organ Raid-Beacon & Gondola Prow',seed:7218,
 cls:'building',w:15.2,d:14.8,h:16.2,cut:true,front:{x:-2.2,z:4.8,yaw:0},
 tags:{types:['military','infrastructure'],wealth:'middle',style:'flume',role:'chasm-organ beacon',landmark:true},
 note:'Zero-podium battered colBasalt cliff-prow watchhouse mounting a monumental wind-driven acoustic Chasm-Organ of hollow chamberbamboo and verdigris copper flues (145-290 Hz Timpar-Kuran raid chords across 15 km) beside a hand-cranked aerial cable-basket gondola.',
 build(){
  const cx0=-1.8,cz0=1.4,w0=8.4,d0=6.6,y0=.3,h0=3.75;
  dvRootSkirt(cx0,cz0,w0,d0,6.2,{mk:'colBasalt',plinthH:y0+.24,batter:.18});
  dvFloorRect(cx0,cz0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx0,cz0,w0,d0,y0,h0,{
   front:[{x:-.4,w:1.25,h:2.18,door:true},{x:2.2,w:.85,y:.95,h:1.18}],
   left:[{x:0,w:.82,y:.95,h:1.15}],
   back:[{x:0,w:1.35,h:2.18,door:true,open:true,leaf:false}]
  });
  dvExtStair(cx0-.4,cz0+d0/2+.95,0,y0,PI,1.35,.95);
  dvJadeCross(cx0+2.2,y0+2.75,cz0+d0/2+.01,0,.56);
  dvRoofTerrace(cx0,cz0,w0+.14,d0+.14,y0+h0,{openBack:true});

  /* blazing raid-warning copper pitch-cresset on upper watch-deck */
  dvNoCut(()=>svNoWalk(()=>{
   cyl('bronze',-4.8,y0+h0+.008,3.6,.44,.62,P('bronze'),10);
   sph('glow',-4.8,y0+h0+.72,3.6,.32,0xff9e38,1,8);
  }));
  haloAt(-4.8,y0+h0+.85,3.6,0xffa63c,false);
  smokeAt(-4.8,y0+h0+1.12,3.6);

  /* cliff-prow acoustic Chasm-Wind Pipe-Organ (battered colBasalt spur + 13 verdigris & chamberbamboo flues) */
  const cxOrg=-1.8,czOrg=-3.45;
  dvRootSkirt(cxOrg,czOrg,6.4,2.4,6.4,{mk:'colBasalt',plinthH:.38});
  dvFloorRect(cxOrg,-2.06,2.2,.26,y0,'flagstone',P('flagstone'));
  dvNoCut(()=>svNoWalk(()=>{
   box('tuffPolished',cxOrg,.39,czOrg,6.1,1.52,2.1,P('tuffCrimson'));
   box('skarn',cxOrg,1.918,czOrg,6.28,.22,2.26,P('skarn'));
   for(const sx of [-1.95,0,1.95])box('basalt',cxOrg+sx,.62,czOrg-1.12,1.18,1.05,.12,P('colBasalt'));

   /* front 145 Hz bass rank: 7 patinated verdigris copper & bronze-collared canyon flues */
   const xs=[-2.46,-1.64,-.82,0,.82,1.64,2.46],hs=[6.4,7.9,9.6,11.4,9.6,7.9,6.4],rs=[.16,.18,.21,.25,.21,.18,.16];
   for(let i=0;i<7;i++){
    const px=cxOrg+xs[i],py=2.146,pz=czOrg-.42;
    cyl('bronze',px,py,pz,rs[i]+.032,.26,P('bronze'),12);
    cyl('verdigris',px,py+.268,pz,rs[i],hs[i],P('verdigris'),12);
    cyl('bronze',px,py+.276+hs[i],pz,rs[i]*.98,.24,P('bronze'),12,rs[i]*1.28);
   }
   /* rear 290 Hz harmonic rank: 6 seasoned hollow chamberbamboo / timber resonance flues */
   const xsB=[-2.05,-1.23,-.41,.41,1.23,2.05],hsB=[5.2,6.5,7.8,7.8,6.5,5.2];
   for(let j=0;j<6;j++){
    const bx=cxOrg+xsB[j],by=2.146,bz=czOrg+.44;
    cyl('wood',bx,by,bz,.145,hsB[j],0xb88e4a,10);
    cyl('bronze',bx,by+hsB[j]+.008,bz,.16,.12,P('bronze'),10);
   }
   /* timber cross-collars cleanly between the two pipe ranks + iron raid-stop pull-rods */
   box('cypress',cxOrg,5.4,czOrg+.02,5.8,.14,.14,P('cypress'));
   box('cypress',cxOrg,8.8,czOrg+.02,3.8,.13,.13,P('cypress'));
   for(const sx of [-.9,.9])beam('iron',[cxOrg+sx,1.65,-1.98],[cxOrg+sx,1.65,czOrg+1.08],.035,P('iron'));
  }));

  /* east prow: hand-cranked bronze-and-cypress aerial cable-basket gondola bastion */
  const cxG=4.35,czG=-.85;
  dvRootSkirt(cxG,czG,3.0,4.2,5.8,{mk:'colBasalt',plinthH:.36});
  dvFloorRect(cxG,czG,2.88,4.08,.3,'planks',P('planks'));
  dvExtStair(cxG,czG+2.95,0,.3,PI,1.15,.85);
  dvPulleyRig(cxG-.85,4.65,-2.55,PI,1.15,1.95);
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-1.15,1.15])for(const sz of [-1.75,.65])box('cypress',cxG+sx,.308,czG+sz,.18,4.35,.18,P('cypress'));
   for(const sz of [-1.75,.65])box('cypress',cxG,4.666,czG+sz,2.66,.2,.24,P('cypress'));
   for(const sx of [-.58,.58])box('cypress',cxG+sx,4.874,czG-1.05,.16,.18,3.9,P('cypress'));
   /* hand-cranked bronze capstan drum */
   for(const sx of [-.62,.62])box('basalt',cxG+sx,.308,czG+.55,.22,.92,.32,P('basalt'));
   tube('bronze',t=>[cxG+(t-.5)*.98,1.05,czG+.55],()=>[.22,.22],3,10,P('bronze'),{caps:true});
   for(const sx of [-.56,.56])box('iron',cxG+sx,.72,czG+.55,.045,.68,.06,P('iron'));
   /* suspended passenger & cargo cable-basket gondola carriage over the chasm */
   const gx=4.7,gz=-5.15,rp=P('rope');
   for(const sx of [-.42,.42]){
    sagRope('rope',[gx+sx,4.88,-2.95],[gx+sx,3.85,-6.45],.16,.026,rp,7);
    cyl('bronze',gx+sx,4.28,gz,.12,.06,P('bronze'),10);
    cyl('iron',gx+sx,2.8,gz,.022,1.46,P('iron'),6);
   }
   box('cypress',gx,1.85,gz,1.32,.08,1.48,P('cypress'));
   for(const sz of [-.69,.69]){
    box('planks',gx,1.938,gz+sz,1.28,.78,.065,P('planks'));
    box('bronze',gx,2.724,gz+sz,1.36,.055,.09,P('bronze'));
   }
   for(const sx of [-.61,.61]){
    box('planks',gx+sx,1.938,gz,.065,.78,1.26,P('planks'));
    box('bronze',gx+sx,2.724,gz,.09,.055,1.24,P('bronze'));
   }
  }));

  dvFurn([
   ['dv_chasm_organ_console',cx0-1.85,y0,cz0-2.15,0],
   ['dv_armour_stand_scale',cx0+2.45,y0,cz0-2.15,-.3],
   ['dv_rack_buckler_sword',cx0+3.35,y0,cz0+.35,-PI/2],
   ['dv_pulley_basket',cx0+2.35,y0,cz0+1.85,0],
   ['dv_poor_pallet',cx0-3.05,y0,cz0+1.55,PI/2],
   ['dv_brazier_copper',cx0-.15,y0,cz0+.85,0]
  ]);
 }});
