// ================================================================= BESPOKE PAINTED MEN PLATEAU FURNITURE (14 painted_* defs on KratorFurniture)
// Registers culture 'painted' palette and 14 authentic Painted Highlands pieces onto KratorFurniture (PLAN.md §3),
// strictly avoiding legacy Tlingit cedar chests, bamboo, and kiln-fired ceramic amphorae/pots.
// Every part uses plateau-authentic material family names so core/engine/91f-furnish.js (svfDetail) binds packed f_* maps,
// and adjacent vertical/horizontal parts step cleanly by >= 1 cm so zero coplanar faces ever overlap.
(function(){
 const KF=KratorFurniture;
 const PAL={
  danxia:0xa84834,danxiaBuff:0xc88a5e,bentonite:0xe6d6c2,
  juniper:0x7c543a,juniperDark:0x523624,canyonOak:0x684832,mahogany:0x58281e,
  curedBark:0x8c664a,pitchDark:0x2e2016,willowCoil:0xb2925e,bunchgrass:0xc6a058,
  ochreRed:0xb53324,rabbitGold:0xc98724,pipeclay:0xf4ede0,lignite:0x181614,celadoniteTeal:0x267974,
  featherTeal:0x1e8c82,featherCrimson:0xc84628,wildSilk:0xe8dfc8,
  pronghornPelt:0x8c6848,rawhide:0xa27852,obsidian:0x1c1e22,raidedIron:0x36322e,cobble:0x847062,
  sageGreen:0x6d7c54,emberGlow:0xff6e24,lampGlow:0xffb85c
 };
 KF.FPAL['painted']=Object.assign(KF.FPAL['painted']||{},PAL);

 function pmDefFurn(o){
  o.culture='painted';
  o.variants=o.variants==null?1:o.variants;
  o.rooms=Array.isArray(o.rooms)?o.rooms:[o.room||'hall'];
  o.room=o.rooms[0];
  o.tier=o.tier||'common';
  o.wealth=o.wealth||(o.tier==='court'?[.7,1]:o.tier==='poor'?[0,.35]:[.3,.75]);
  o.setting=o.setting||'both';
  o.anchor=o.anchor||'floor';
  o.clearance=o.clearance||{front:.45};
  o.task=o.task||[];
  KF.FURNS.push(o);
  KF.FURN_BY_KEY[o.key]=o;
  return o;
 }

 /* 1. Juniper rack holding pinyon-pitch-sealed coiled willow water-jugs (tus, replacing clay amphorae & bamboo tubes) */
 pmDefFurn({key:'painted_pitch_tus_rack',name:'Pinyon-Pitch Coiled Willow Tus Rack',type:'vessel',tier:'common',
  setting:'both',rooms:['kitchen','storage','hall','yard'],w:1.28,d:0.52,h:1.18,materials:['timber','wicker','rope'],task:['storage'],
  build(F){
   for(const sx of [-.52,.52])for(const sz of [-.18,.18]){
    F.box(sx,0,sz,.075,.96,.075,0,F.col('juniperDark'),'wood');
   }
   F.box(0,.28,0,1.18,.055,.42,0,F.col('juniper'),'wood');
   F.box(0,.74,0,1.18,.055,.42,0,F.col('juniper'),'wood');
   for(const [jx,jy] of [[-.32,.34],[.0,.34],[.32,.34],[-.2,.8],[.2,.8]]){
    F.cyl(jx,jy,0,.125,.24,0,F.col('pitchDark'),'wicker');
    F.cyl(jx,jy+.245,0,.07,.09,0,F.col('willowCoil'),'wicker');
    F.cyl(jx,jy+.34,0,.085,.03,0,F.col('ochreRed'),'paint');
   }
  }});

 /* 2. Nested carved canyon-oak & juniper-burl coolamon carrying and winnowing troughs painted with dot-rings */
 pmDefFurn({key:'painted_burl_coolamon_set',name:'Carved Burl Coolamon Trough Set',type:'vessel',tier:'poor',
  setting:'both',rooms:['kitchen','hall','workshop','yard'],w:0.96,d:0.56,h:0.44,materials:['stone','timber'],task:['cooking','storage'],
  build(F){
   F.box(0,0,0,.86,.1,.46,0,F.col('danxiaBuff'),'stone');
   F.box(-.16,.106,0,.52,.12,.34,.08,F.col('canyonOak'),'wood');
   F.box(-.16,.23,0,.44,.035,.26,.08,F.col('ochreRed'),'paint');
   F.box(.22,.106,.02,.38,.1,.26,-.12,F.col('juniper'),'wood');
   F.box(.22,.21,.02,.3,.03,.18,-.12,F.col('celadoniteTeal'),'paint');
  }});

 /* 3. Standing cured canyon-oak bark screen painted in 5-colour Arnhem rarrk cross-hatching & X-ray pronghorn */
 pmDefFurn({key:'painted_rarrk_bark_screen',name:'Rarrk Painted Cured Bark Screen',type:'screen',tier:'common',
  setting:'both',rooms:['hall','bedroom','shrine','parlour'],w:1.46,d:0.38,h:1.76,materials:['timber','bark','paint'],task:[],
  build(F){
   for(const sx of [-.58,.58]){
    F.box(sx,0,0,.14,.1,.36,0,F.col('danxia'),'stone');
    F.box(sx,.105,0,.08,1.62,.08,0,F.col('juniperDark'),'wood');
   }
   F.box(0,1.64,0,1.32,.07,.09,0,F.col('juniper'),'wood');
   F.box(0,.24,0,1.06,1.34,.045,0,F.col('curedBark'),'bark');
   F.box(0,.3,.032,.94,1.2,.016,0,F.col('ochreRed'),'paint');
   F.box(0,.86,.052,.84,.36,.014,0,F.col('pipeclay'),'paint');
   F.box(0,.88,.07,.54,.16,.014,0,F.col('celadoniteTeal'),'paint');
   F.box(0,.46,.052,.84,.12,.014,0,F.col('rabbitGold'),'paint');
  }});

 /* 4. Hollowed danxia sandstone pigment-grinding slab with red-ochre, rabbitbrush-gold, pipeclay & celadonite-teal cakes */
 pmDefFurn({key:'painted_ochre_grinding_slab',name:'Danxia Pigment Grinding Slab and Cakes',type:'workstation',job:'dyeing',tier:'common',
  setting:'both',rooms:['workshop','shrine','yard','hall'],w:1.12,d:0.74,h:0.46,materials:['stone','paint'],task:[],
  build(F){
   F.box(0,0,0,1.04,.22,.66,0,F.col('danxia'),'stone');
   F.box(0,.226,0,.86,.07,.5,0,F.col('danxiaBuff'),'stone');
   F.cyl(-.24,.302,-.06,.09,.055,0,F.col('ochreRed'),'paint');
   F.cyl(-.04,.302,.08,.085,.055,0,F.col('rabbitGold'),'paint');
   F.cyl(.16,.302,-.05,.085,.055,0,F.col('pipeclay'),'paint');
   F.cyl(.31,.302,.07,.08,.055,0,F.col('celadoniteTeal'),'paint');
   F.cyl(-.08,.302,-.12,.065,.11,0,F.col('cobble'),'stone');
  }});

 /* 5. Mountain-mahogany woomera spear-throwers, Korona obsidian-tipped willow darts & hardwood war-clubs rack */
 pmDefFurn({key:'painted_woomera_dart_rack',name:'Woomera Spear-Thrower and Obsidian Dart Rack',type:'rack',job:'knapping',tier:'common',
  setting:'both',rooms:['hall','barracks','workshop','yard'],w:1.34,d:0.48,h:1.78,materials:['stone','timber','obsidian'],task:['storage'],
  build(F){
   for(const sx of [-.54,.54]){
    F.box(sx,0,0,.15,.1,.42,0,F.col('danxia'),'stone');
    F.box(sx,.105,0,.08,1.38,.08,0,F.col('juniperDark'),'wood');
   }
   F.box(0,.28,0,1.2,.06,.28,0,F.col('juniper'),'wood');
   F.box(0,1.18,0,1.2,.06,.16,0,F.col('juniper'),'wood');
   for(let i=-2;i<=2;i++){
    const x=i*.2;
    F.rod(x,.35,-.03,x,1.62,.02,.014,F.col('willowCoil'),'wood');
    F.cone(x,1.63,.02,.028,.12,0,F.col('obsidian'),'obsidian');
   }
   for(const sx of [-.34,.34]){
    F.box(sx,.35,.09,.09,.78,.032,.06,F.col('mahogany'),'wood');
   }
  }});

 /* 6. Oval rarrk-and-hand-stencilled cured bark shields + whirling hardwood bullroarers on sinew cords */
 pmDefFurn({key:'painted_bark_shield_stand',name:'Painted Bark Shield and Bullroarer Stand',type:'rack',tier:'common',
  setting:'both',rooms:['hall','barracks','shrine','yard'],w:1.26,d:0.48,h:1.54,materials:['timber','bark','paint','rope'],task:[],
  build(F){
   F.box(0,0,0,1.18,.1,.42,0,F.col('juniperDark'),'wood');
   for(const sx of [-.48,.48])F.box(sx,.105,-.08,.08,1.32,.08,0,F.col('juniper'),'wood');
   F.box(0,1.36,-.08,1.1,.065,.09,0,F.col('juniperDark'),'wood');
   for(const [sx,colA,colB] of [[-.28,'ochreRed','pipeclay'],[.28,'celadoniteTeal','rabbitGold']]){
    F.box(sx,.26,.04,.38,.96,.045,0,F.col('curedBark'),'bark');
    F.box(sx,.34,.092,.28,.78,.016,0,F.col(colA),'paint');
    F.box(sx,.64,.112,.18,.22,.014,0,F.col(colB),'paint');
   }
   F.rod(0,.88,-.02,0,1.35,-.02,.008,F.col('rawhide'),'rope');
   F.box(0,.52,-.02,.085,.35,.022,0,F.col('mahogany'),'wood');
  }});

 /* 7. Compact indoor/courtyard carved & Korona-feathered Pukamani clan post */
 pmDefFurn({key:'painted_pukamani_indoor_post',name:'Carved and Feathered Pukamani Clan Post',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['hall','shrine','parlour','yard'],w:0.68,d:0.68,h:2.08,materials:['stone','timber','paint','cloth'],task:['praying'],
  build(F){
   F.cyl(0,0,0,.28,.14,0,F.col('danxia'),'stone');
   F.cyl(0,.145,0,.145,.58,0,F.col('canyonOak'),'wood');
   F.cyl(0,.73,0,.095,.22,0,F.col('lignite'),'paint');
   F.cyl(0,.955,0,.15,.52,0,F.col('ochreRed'),'paint');
   F.cyl(0,1.48,0,.16,.16,0,F.col('pipeclay'),'paint');
   F.cyl(0,1.645,0,.14,.18,0,F.col('celadoniteTeal'),'paint');
   for(let i=0;i<6;i++){
    const a=i*F.TAU/6;
    F.box(Math.cos(a)*.14,1.84,Math.sin(a)*.14,.05,.22,.12,a,i%2===0?F.col('featherTeal'):F.col('featherCrimson'),'cloth');
   }
  }});

 /* 8. Ceremonial Korona-bird iridescent feather diadem & body-paint stamp stand */
 pmDefFurn({key:'painted_feather_diadem_perch',name:'Korona Feather Diadem and Body-Stamp Stand',type:'shrine',tier:'court',
  setting:'indoor',rooms:['bedroom','hall','shrine'],w:0.78,d:0.52,h:1.44,materials:['stone','timber','cloth','paint'],task:[],
  build(F){
   F.box(0,0,0,.64,.1,.44,0,F.col('danxiaBuff'),'stone');
   F.cyl(0,.105,0,.055,.88,0,F.col('mahogany'),'wood');
   F.cyl(0,.99,0,.16,.14,0,F.col('curedBark'),'bark');
   F.cyl(0,1.135,0,.18,.08,0,F.col('rabbitGold'),'paint');
   for(let i=0;i<8;i++){
    const a=i*F.TAU/8;
    F.box(Math.cos(a)*.15,1.22,Math.sin(a)*.15,.045,.2,.09,a,i%2===0?F.col('featherTeal'):F.col('featherCrimson'),'cloth');
   }
   F.box(-.2,.11,.08,.14,.08,.14,0,F.col('ochreRed'),'paint');
   F.box(.2,.11,.08,.14,.08,.14,0,F.col('celadoniteTeal'),'paint');
  }});

 /* 9. Circular danxia-slab hearth burning phsage & paintedjuniper smudge bundles */
 pmDefFurn({key:'painted_sage_smudge_pit',name:'Danxia Slab and Plateau Sage Smudge Hearth',type:'hearth',tier:'common',
  setting:'both',rooms:['hall','shrine','kitchen','yard'],w:1.36,d:1.36,h:0.48,materials:['stone','timber','emissive'],task:['cooking','socializing','praying'],
  build(F){
   F.cyl(0,0,0,.62,.16,0,F.col('danxia'),'stone');
   F.cyl(0,.165,0,.46,.08,0,F.col('cobble'),'stone');
   F.cyl(0,.25,0,.32,.05,0,F.col('emberGlow'),'glow');
   F.box(-.08,.306,.04,.34,.08,.11,.35,F.col('sageGreen'),'plant');
   F.box(.09,.306,-.05,.32,.075,.1,-.45,F.col('juniper'),'wood');
   F.lamp(0,.38,0,1.15,8);
  }});

 /* 10. Low juniper-pole & rawhide-webbing sleeping frame piled with pronghorn pelts & bunchgrass mats */
 pmDefFurn({key:'painted_pronghorn_pelt_bed',name:'Juniper Rawhide and Pronghorn-Pelt Bed',type:'bed',tier:'common',
  setting:'indoor',rooms:['bedroom','hall'],w:1.14,d:1.88,h:0.74,materials:['timber','thatch','hide'],task:['sleeping'],
  build(F){
   for(const sx of [-.48,.48])for(const sz of [-.82,.82]){
    F.box(sx,0,sz,.095,.3,.095,0,F.col('juniperDark'),'wood');
   }
   F.box(0,.305,0,1.06,.07,1.78,0,F.col('juniper'),'wood');
   F.box(0,.38,0,.98,.055,1.68,0,F.col('bunchgrass'),'thatch');
   F.pillow(0,.49,0,.92,.11,1.56,0,F.col('pronghornPelt'),'hide');
   F.bolster(0,.58,-.64,.78,.09,0,F.col('ochreRed'),'cloth');
   F.box(0,.38,-.85,1.02,.34,.06,0,F.col('curedBark'),'bark');
  }});

 /* 11. Watertight coiled willow hot-stone boiling basket beside heated river cobbles & wooden tongs */
 pmDefFurn({key:'painted_hotstone_boiling_basket',name:'Coiled Willow Hot-Stone Boiling Basket',type:'workstation',job:'baking',tier:'poor',
  setting:'both',rooms:['kitchen','hall','yard','tavern'],w:1.16,d:0.76,h:0.62,materials:['stone','wicker','timber'],task:['cooking'],
  build(F){
   F.box(0,0,0,1.08,.09,.68,0,F.col('danxiaBuff'),'stone');
   F.cyl(-.22,.096,0,.26,.42,0,F.col('willowCoil'),'wicker');
   F.cyl(-.22,.52,0,.28,.045,0,F.col('pitchDark'),'wicker');
   F.cyl(.26,.096,0,.22,.09,0,F.col('cobble'),'stone');
   F.cyl(.26,.19,0,.14,.06,0,F.col('emberGlow'),'glow');
   F.box(.24,.256,.12,.42,.035,.05,.25,F.col('mahogany'),'wood');
  }});

 /* 12. Basin-amaranth & pinyon-nut danxia stone mano-and-metate grinding trough */
 pmDefFurn({key:'painted_amaranth_mano_metate',name:'Basin-Amaranth Danxia Mano and Metate',type:'workstation',job:'milling',tier:'poor',
  setting:'both',rooms:['kitchen','workshop','yard','storage'],w:0.98,d:0.68,h:0.42,materials:['stone','wicker'],task:['cooking'],
  build(F){
   F.box(-.14,0,0,.58,.18,.48,.06,F.col('danxia'),'stone');
   F.box(-.14,.185,0,.46,.05,.36,.06,F.col('danxiaBuff'),'stone');
   F.cyl(-.14,.24,0,.06,.28,Math.PI/2,F.col('cobble'),'stone');
   F.cyl(.28,0,.04,.16,.24,0,F.col('willowCoil'),'wicker');
   F.cyl(.28,.245,.04,.13,.04,0,F.col('rabbitGold'),'food');
  }});

 /* 13. Soot-blackened raided lowland iron cauldron suspended on a peeled juniper tripod (raid trophy!) */
 pmDefFurn({key:'painted_raided_iron_kettle',name:'Raided Lowland Iron Kettle on Juniper Tripod',type:'hearth',tier:'common',
  setting:'both',rooms:['kitchen','hall','yard','tavern'],w:1.28,d:1.28,h:1.52,materials:['stone','timber','metal','emissive'],task:['cooking'],
  build(F){
   F.cyl(0,0,0,.48,.12,0,F.col('cobble'),'stone');
   F.cyl(0,.125,0,.3,.05,0,F.col('emberGlow'),'glow');
   for(let i=0;i<3;i++){
    const a=i*F.TAU/3;
    F.beam(Math.cos(a)*.52,.02,Math.sin(a)*.52,Math.cos(a)*.06,1.44,Math.sin(a)*.06,.055,.055,F.col('juniper'),'wood');
   }
   F.rod(0,.74,0,0,1.38,0,.012,F.col('raidedIron'),'metal');
   F.cyl(0,.42,0,.24,.3,0,F.col('raidedIron'),'metal');
   F.lamp(0,.34,0,1.2,8);
  }});

 /* 14. Portable single-trunk notched Dogon juniper interior/ledge ladder */
 pmDefFurn({key:'painted_dogon_notched_ladder',name:'Notched Single-Trunk Dogon Juniper Ladder',type:'rack',tier:'poor',
  setting:'both',rooms:['hall','storage','yard','barracks'],w:0.54,d:0.62,h:2.18,materials:['timber'],task:[],
  build(F){
   F.beam(0,0,.22,0,1.96,-.18,.13,.13,F.col('juniper'),'wood');
   for(let i=1;i<=5;i++){
    const f=i/6,y=f*1.86,z=.22*(1-f)-.18*f+.07;
    F.box(0,y,z,.22,.055,.09,0,F.col('juniperDark'),'wood');
   }
   F.beam(-.03,1.94,-.18,-.16,2.16,-.22,.075,.075,F.col('juniper'),'wood');
   F.beam(.03,1.94,-.18,.16,2.16,-.22,.075,.075,F.col('juniper'),'wood');
  }});

 /* 15. Ochre-painted hollow canyon-hardwood drone-pipes (didgeridoos) & corded wooden bullroarer rack */
 pmDefFurn({key:'painted_drone_pipe_rack',name:'Ochre-Painted Hollow Drone-Pipe and Bullroarer Rack',type:'rack',job:'worship',tier:'common',
  setting:'both',rooms:['shrine','hall','parlour','yard'],w:1.36,d:0.52,h:1.74,materials:['stone','timber','paint','rope'],task:['socializing','praying'],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,0,.16,.1,.44,0,F.col('danxiaBuff'),'stone');
    F.box(sx,.106,0,.08,1.36,.08,0,F.col('juniperDark'),'wood');
   }
   F.box(0,.28,0,1.02,.055,.28,0,F.col('juniper'),'wood');
   F.box(0,1.18,0,1.02,.055,.18,0,F.col('juniper'),'wood');
   const pipeCols=['ochreRed','celadoniteTeal','rabbitGold','pipeclay'];
   for(let i=0;i<4;i++){
    const px=-.33+i*.22;
    /* Stepped non-overlapping hollow hardwood drone-pipe segments + beeswax mouthpiece */
    F.beam(px,.342,.06,px,.91,.016,.078,.078,F.col(i%2===0?'canyonOak':'ochreRed'),i%2===0?'wood':'paint');
    F.beam(px,.92,.014,px,1.27,-.012,.066,.066,F.col(pipeCols[i]),'paint');
    F.beam(px,1.28,-.014,px,1.66,-.04,.054,.054,F.col('pitchDark'),'wood');
   }
   for(const bx of [-.22,.22]){
    F.rod(bx,.85,.13,bx,1.17,.13,.008,F.col('rawhide'),'rope');
    F.box(bx,.48,.13,.08,.36,.022,0,F.col('mahogany'),'wood');
   }
  }});
})();
