// ================================================================= BESPOKE TIMPAR-KURAN FURNITURE (registered on KratorFurniture)
// Registers culture 'timpar-kuran' palette and 14 bespoke Veiled-Mountain Jomon/Ainu + PNW/Tlingit pieces onto KratorFurniture
// (38-furniture-bundle.js), alongside the read-only painted, generic, generic-goods, jobs, scrap and arms catalog sets.
// Every part uses explicit material family names so core/engine/91f-furnish.js (svfDetail) binds packed f_* library detail maps,
// and adjacent faces step cleanly by >= 1.5 cm so zero coplanar triangles ever overlap in zfightAudit.
(function(){
 const KF=KratorFurniture;
 const PAL={
  cypress:0x8c4c32,cypressDark:0x562e1e,cedarPale:0xa86b49,silverWood:0x8e8b82,inauWhite:0xefe8d5,
  formBlack:0x15171a,formRed:0xb63124,formTeal:0x1f6e6c,formOchre:0xc88e32,
  cobble:0x585a5e,megabreccia:0x44474e,kaenTerra:0xb45834,kaenSoot:0x6c3521,celadon:0x88b49c,
  copper:0xb8683c,bronze:0x98763a,verdigris:0x4e927c,iron:0x3a3632,kanopiAlloy:0x9ea8b2,
  chilkatGold:0xc89a3c,attusBuff:0xc8b896,bearPelt:0x483628,salmonRed:0xc44e34,boneSkull:0xe8e0cc,jade:0x2c7e58,
  emberGlow:0xff6e22,lampGlow:0xffbe62
 };
 KF.FPAL['timpar-kuran']=Object.assign(KF.FPAL['timpar-kuran']||{},PAL);
 function tkDefFurn(o){
  o.culture=o.culture||'timpar-kuran';
  o.variants=o.variants==null?1:o.variants;
  o.rooms=Array.isArray(o.rooms)?o.rooms:[o.room||'hall'];
  o.room=o.rooms[0];
  o.tier=o.tier||'common';
  o.wealth=o.wealth||(o.tier==='court'?[.7,1]:o.tier==='poor'?[0,.35]:[.3,.75]);
  o.setting=o.setting||'indoor';
  o.anchor=o.anchor||'floor';
  o.clearance=o.clearance||{front:.5};
  o.task=o.task||[];
  KF.FURNS.push(o);
  KF.FURN_BY_KEY[o.key]=o;
  return o;
 }

 /* 1. Cobble-and-cypress sunken-curb irori hearth with jizai-kagi fish-hook & sculptural kaen-doki flame-rimmed stewpot */
 tkDefFurn({key:'timpar_irori_kaen_hearth',name:'Irori Hearth with Kaen-Doki Flame Pot',type:'hearth',tier:'common',
  setting:'both',rooms:['hall','kitchen','tavern'],w:1.52,d:1.52,h:1.42,materials:['stone','timber','ceramic','emissive'],task:['cooking','socializing'],
  build(F){
   F.box(0,0,0,1.46,.14,1.46,0,F.col('cobble'),'stone');
   F.box(0,.14,0,1.24,.09,1.24,0,F.col('cypressDark'),'wood');
   F.box(0,.23,0,.92,.04,.92,0,F.col('emberGlow'),'glow');
   for(const sx of [-.56,.56])F.box(sx,.23,0,.09,1.08,.09,0,F.col('cypress'),'wood');
   F.box(0,1.31,0,1.32,.08,.11,0,F.col('cypressDark'),'wood');
   F.rod(0,.72,0,0,1.31,0,.014,F.col('iron'),'metal');
   /* Wooden fish-shaped jizai-kagi adjuster */
   F.box(0,.98,.03,.22,.07,.04,0,F.col('cypress'),'wood');
   /* Cord-marked kaen-doki flame-rimmed stewpot */
   F.cyl(0,.34,0,.17,.22,0,F.col('kaenSoot'),'clay');
   F.cyl(0,.56,0,.23,.12,0,F.col('kaenTerra'),'clay');
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4;
    F.box(Math.cos(a)*.21,.68,Math.sin(a)*.21,.065,.11,.085,a,F.col('kaenTerra'),'clay');
   }
   F.lamp(0,.44,0,1.25,8.5);
  }});

 /* 2. Steam-kerfed red-cypress Tlingit bentwood storage chest painted with stepped black-red-teal ovoids */
 tkDefFurn({key:'timpar_kerfed_bentwood_chest',name:'Kerfed Cedar Formline Chest',type:'chest',tier:'common',
  setting:'indoor',rooms:['hall','bedroom','storage','shop'],variants:2,variantNames:['bear-crest','storm-eagle'],
  w:1.18,d:0.68,h:0.76,materials:['timber','bronze'],task:['storage'],
  build(F){
   F.box(0,0,0,1.12,.1,.62,0,F.col('cypressDark'),'wood');
   F.box(0,.1,0,1.04,.5,.54,0,F.col('cypress'),'wood');
   F.box(0,.6,0,1.14,.12,.64,0,F.col('cypressDark'),'wood');
   /* Stepped non-coplanar front formline ovoids (+1.8 cm, +3.6 cm, +5.2 cm) */
   F.box(0,.22,.288,.78,.28,.02,0,F.col('formBlack'),'paint');
   F.box(0,.26,.308,.52,.19,.018,0,F.variant===0?F.col('formRed'):F.col('formTeal'),'paint');
   for(const sx of [-.16,.16])F.box(sx,.31,.326,.11,.08,.016,0,F.col('copper'),'bronze');
  }});

 /* 3. Indoor/outdoor Ainu-style shaved-willow inau spirit-wand & bear-skull nusa shrine rack */
 tkDefFurn({key:'timpar_inau_nusa_rack',name:'Shaved-Willow Inau and Bear-Skull Nusa Rack',type:'shrine',job:'worship',tier:'common',
  setting:'both',rooms:['shrine','hall','yard'],w:1.38,d:0.48,h:1.68,materials:['stone','timber','bone'],task:['praying'],
  build(F){
   for(const sx of [-.54,.54]){
    F.box(sx,0,0,.18,.12,.4,0,F.col('megabreccia'),'stone');
    F.box(sx,.12,0,.09,1.32,.09,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.82,0,1.28,.07,.12,0,F.col('cypress'),'wood');
   F.box(0,1.38,0,1.24,.07,.12,0,F.col('cypress'),'wood');
   /* Five pale shaved-willow inau wands with cascading curl cones */
   for(let i=-2;i<=2;i++){
    const x=i*.22;
    F.rod(x,.14,.06,x,1.52,.06,.016,F.col('inauWhite'),'wood');
    F.cone(x,1.18,.06,.07,.24,0,F.col('inauWhite'),'bark');
    F.cone(x,1.34,.06,.055,.18,0,F.col('inauWhite'),'bark');
   }
   /* Central sacred bear skull on top rail */
   F.box(0,1.45,-.01,.22,.16,.28,0,F.col('boneSkull'),'bone');
   F.box(0,1.46,.16,.13,.09,.12,0,F.col('boneSkull'),'bone');
  }});

 /* 4. Lashed hardwood rod-and-slat cuirass armour stand with painted Bear crest */
 tkDefFurn({key:'timpar_slat_cuirass_stand',name:'Hardwood Slat-Cuirass Armour Stand',type:'armour_stand',tier:'common',
  setting:'both',rooms:['hall','barracks','workshop','yard'],w:0.84,d:0.56,h:1.66,materials:['stone','timber','hide','rope'],task:[],
  build(F){
   F.box(0,0,0,.58,.1,.48,0,F.col('cypressDark'),'wood');
   F.cyl(0,.1,0,.055,1.42,0,F.col('cypress'),'wood');
   F.box(0,1.22,0,.68,.08,.1,0,F.col('cypressDark'),'wood');
   /* Hardwood vertical slat cuirass laced with spruce-root cord */
   F.box(0,.68,0,.48,.52,.28,0,F.col('cedarPale'),'wood');
   F.box(0,.82,.158,.36,.26,.02,0,F.col('formBlack'),'paint');
   F.box(0,.86,.178,.22,.16,.018,0,F.col('formRed'),'paint');
   /* Elk-hide throat & shoulder guard */
   F.box(0,1.24,0,.56,.11,.32,0,F.col('bearPelt'),'hide');
   /* Crown post cap */
   F.cyl(0,1.52,0,.09,.1,0,F.col('formTeal'),'paint');
  }});

 /* 5. Fierce open-eyed Tlingit carved wooden beast war-visor helmet on display block */
 tkDefFurn({key:'timpar_visor_war_helm',name:'Open-Eyed Beast War-Visor Helmet',type:'art',tier:'court',
  setting:'both',rooms:['hall','barracks','shrine'],w:0.58,d:0.54,h:0.96,materials:['timber','bronze','bone'],task:[],
  build(F){
   F.box(0,0,0,.44,.1,.42,0,F.col('cypressDark'),'wood');
   F.cyl(0,.1,0,.05,.42,0,F.col('cypress'),'wood');
   /* Heavy carved red-cypress Bear/Storm-Bird war-visor dome */
   F.cyl(0,.5,0,.21,.28,0,F.col('cypress'),'wood');
   F.box(0,.54,.14,.32,.18,.16,0,F.col('formBlack'),'paint');
   F.box(0,.46,.22,.24,.07,.12,0,F.col('formRed'),'paint');
   /* Wide-open glaring copper & ivory eyes (contrasting with Eternian closed eyes!) */
   for(const sx of [-.1,.1]){
    F.box(sx,.62,.232,.08,.06,.02,0,F.col('inauWhite'),'bone');
    F.box(sx,.62,.252,.042,.042,.018,0,F.col('copper'),'bronze');
    /* Carved ears */
    F.box(sx*1.4,.78,.02,.08,.12,.09,0,F.col('formBlack'),'paint');
   }
  }});

 /* 6. Raided Eternian war-loot rack: celadon jars + inverted war-painted bronze ancestor trophy head */
 tkDefFurn({key:'timpar_eternian_trophy_rack',name:'Captured Eternian War-Loot Trophy Rack',type:'rack',tier:'court',
  setting:'both',rooms:['hall','barracks','yard'],w:1.32,d:0.52,h:1.64,materials:['timber','bronze','ceramic'],task:[],
  build(F){
   for(const sx of [-.54,.54]){
    F.box(sx,0,0,.14,.1,.44,0,F.col('megabreccia'),'stone');
    F.box(sx,.1,0,.085,1.44,.085,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.52,0,1.22,.06,.38,0,F.col('cypress'),'wood');
   F.box(0,1.18,0,1.22,.07,.12,0,F.col('cypressDark'),'wood');
   /* Looted Eternian celadon crackle jars on lower shelf */
   for(const sx of [-.34,.34]){
    F.cyl(sx,.58,0,.11,.24,0,F.col('celadon'),'ceramic');
    F.cyl(sx,.82,0,.07,.06,0,F.col('celadon'),'ceramic');
   }
   /* Inverted closed-eye bronze Eternian trophy head impaled/hung on upper rail with red-ochre slash */
   F.box(0,.96,.04,.24,.3,.2,0,F.col('bronze'),'bronze');
   F.box(0,.9,.04,.16,.06,.14,0,F.col('bronze'),'bronze');
   /* Closed-eye slit & cinnabar war-paint slash stepped +1.8 cm clear */
   for(const sx of [-.06,.06])F.box(sx,1.06,.156,.06,.018,.016,0,F.col('cypressDark'),'bronze');
   F.box(0,1.11,.158,.22,.036,.018,.28,F.col('formRed'),'paint');
  }});

 /* 7. Upright half-beam Tlingit/Ainu Chilkat & attus crest-blanket loom */
 tkDefFurn({key:'timpar_chilkat_loom',name:'Chilkat Goat-Wool and Attus Bark Loom',type:'loom',job:'weaving',tier:'common',
  setting:'indoor',rooms:['workshop','hall'],w:1.42,d:0.64,h:1.88,materials:['stone','timber','cloth'],task:[],
  build(F){
   for(const sx of [-.58,.58]){
    F.box(sx,0,0,.16,.12,.52,0,F.col('cobble'),'stone');
    F.box(sx,.12,0,.095,1.68,.095,0,F.col('cypress'),'wood');
   }
   F.box(0,1.76,0,1.34,.09,.12,0,F.col('cypressDark'),'wood');
   /* Half-woven yellow/teal/black Chilkat crest blanket with free warp fringe */
   F.box(0,1.24,.02,.96,.84,.026,0,F.col('chilkatGold'),'cloth');
   F.box(0,1.32,.05,.74,.44,.018,0,F.col('formBlack'),'cloth');
   F.box(0,1.32,.07,.46,.24,.016,0,F.col('formTeal'),'cloth');
   for(let i=-3;i<=3;i++){
    F.rod(i*.13,.46,.02,i*.13,.82,.02,.008,F.col('attusBuff'),'rope');
    F.cyl(i*.13,.34,.02,.032,.12,0,F.col('cobble'),'stone');
   }
  }});

 /* 8. Carved indoor red-cypress totem house-post (Bear holding copper shield under Raven) */
 tkDefFurn({key:'timpar_totem_house_post',name:'Carved Bear-and-Raven Clan House Post',type:'statue',tier:'court',
  setting:'both',rooms:['hall','shrine','court'],w:0.86,d:0.86,h:2.76,materials:['stone','timber','bronze'],task:[],
  build(F){
   F.box(0,0,0,.78,.14,.78,0,F.col('megabreccia'),'stone');
   F.cyl(0,.14,0,.3,2.48,0,F.col('cypress'),'wood');
   /* Lower Bear figure */
   F.box(0,.78,.28,.36,.44,.12,0,F.col('formBlack'),'paint');
   F.box(0,.42,.3,.28,.3,.08,0,F.col('copper'),'bronze');
   for(const sx of [-.11,.11])F.box(sx,.96,.36,.07,.06,.02,0,F.col('formRed'),'paint');
   /* Upper Raven figure with projecting beak */
   F.cyl(0,1.38,0,.32,.05,0,F.col('formTeal'),'paint');
   F.box(0,1.86,.28,.34,.42,.12,0,F.col('formBlack'),'paint');
   F.box(0,1.82,.42,.11,.1,.22,0,F.col('formOchre'),'paint');
   F.box(0,2.62,0,.72,.12,.72,0,F.col('cypressDark'),'wood');
  }});

 /* 9. Split-cedar A-frame salmon smoking & drying rack hung with red king-salmon fillets */
 tkDefFurn({key:'timpar_smoked_salmon_frame',name:'Split-Cedar Smoked Salmon Drying Frame',type:'rack',job:'fishing',tier:'common',
  setting:'both',rooms:['kitchen','workshop','yard','storage'],w:1.68,d:0.86,h:1.74,materials:['timber','food'],task:['cooking','storage'],
  build(F){
   for(const sx of [-.72,.72]){
    F.beam(sx,0,-.34,sx,1.64,0,.075,.075,F.col('cypressDark'),'wood');
    F.beam(sx,0,.34,sx,1.64,0,.075,.075,F.col('cypressDark'),'wood');
   }
   F.box(0,1.62,0,1.58,.07,.09,0,F.col('cypress'),'wood');
   F.box(0,1.08,0,1.54,.055,.07,0,F.col('cypress'),'wood');
   for(let i=-3;i<=3;i++){
    const x=i*.19;
    F.box(x,1.22,0,.1,.38,.032,0,F.col('salmonRed'),'food');
    F.box(x,.72,0,.095,.34,.03,0,F.col('salmonRed'),'food');
   }
  }});

 /* 10. Salvaged Kanopi arcology titanium-ceramic shard mounted as a salmon-oil clan standing lamp */
 tkDefFurn({key:'timpar_kanopi_alloy_lamp',name:'Kanopi Salvage Alloy Fish-Oil Lamp',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','shrine','workshop','yard'],w:0.58,d:0.58,h:1.58,materials:['stone','timber','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.12,0,F.col('megabreccia'),'stone');
   F.cyl(0,.12,0,.07,1.02,0,F.col('cypressDark'),'wood');
   /* Curved Kanopi titanium-alloy reflector fin & copper oil pan */
   F.cyl(0,1.14,0,.2,.07,0,F.col('copper'),'bronze');
   F.box(0,1.21,-.09,.28,.34,.04,0,F.col('kanopiAlloy'),'metal');
   F.cyl(0,1.21,.02,.08,.12,0,F.col('lampGlow'),'glow');
   F.lamp(0,1.28,.02,1.2,9);
  }});

 /* 11. 2.6 m carved Bear-prow dugout grease-and-berry potlatch feast trough */
 tkDefFurn({key:'timpar_bear_feast_trough',name:'Carved Bear-Prow Potlatch Feast Trough',type:'table',tier:'court',
  setting:'both',rooms:['hall','tavern','court'],w:2.42,d:0.78,h:0.64,materials:['timber','bronze','food'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.82,.82])F.box(sx,0,0,.22,.16,.58,0,F.col('cypressDark'),'wood');
   F.box(0,.16,0,2.04,.28,.64,0,F.col('cypress'),'wood');
   /* Stepped grease/berry feast fill inside trough */
   F.box(0,.44,0,1.76,.03,.44,0,F.col('salmonRed'),'food');
   /* Carved Bear head prow (+x) and tail crest (-x) */
   for(const sx of [-1,1]){
    F.box(sx*1.12,.22,0,.26,.34,.48,0,F.col('formBlack'),'paint');
    F.box(sx*1.26,.28,0,.1,.14,.28,0,F.col('formRed'),'paint');
   }
  }});

 /* 12. Adzed cedar plank bench stacked with retted elm-bark attus bales & mountain-goat pelts */
 tkDefFurn({key:'timpar_attus_bale_bench',name:'Cedar Plank Bench with Attus Bark Bales',type:'bench',tier:'poor',
  setting:'both',rooms:['hall','bedroom','workshop','shop'],w:1.58,d:0.62,h:0.62,materials:['timber','cloth','hide'],task:['resting','socializing'],
  build(F){
   for(const sx of [-.62,.62])F.box(sx,0,0,.16,.38,.52,0,F.col('cypressDark'),'wood');
   F.box(0,.38,0,1.52,.07,.58,0,F.col('cypress'),'wood');
   F.pillow(-.36,.51,0,.58,.11,.46,0,F.col('bearPelt'),'hide');
   F.bolster(.42,.52,0,.44,.1,0,F.col('attusBuff'),'cloth');
  }});

 /* 13. Ceremonial cold-hammered native copper Tlingit tinaa wealth-shield on carved post */
 tkDefFurn({key:'timpar_copper_shield_crest',name:'Hammered Native-Copper Tinaa Wealth Shield',type:'art',tier:'court',
  setting:'both',rooms:['hall','shrine','office','court'],w:0.78,d:0.42,h:1.54,materials:['stone','timber','bronze'],task:[],
  build(F){
   F.box(0,0,0,.52,.12,.38,0,F.col('megabreccia'),'stone');
   F.box(0,.12,-.06,.14,1.36,.1,0,F.col('cypressDark'),'wood');
   /* Classic Tlingit waisted trapezoidal tinaa copper shield with T-ridge */
   F.box(0,.42,.04,.52,.44,.032,0,F.col('copper'),'bronze');
   F.box(0,.86,.04,.66,.5,.032,0,F.col('copper'),'bronze');
   /* Raised T-backbone stepped +2 cm forward */
   F.box(0,.84,.064,.68,.055,.02,0,F.col('formBlack'),'paint');
   F.box(0,.44,.064,.06,.4,.02,0,F.col('formBlack'),'paint');
   for(const sx of [-.16,.16])F.box(sx,1.1,.066,.09,.07,.018,0,F.col('verdigris'),'bronze');
  }});

 /* 14. River-raider's cedar rack of leaf-bladed dugout paddles, fish-harpoons & splitting wedges */
 tkDefFurn({key:'timpar_dugout_paddle_rack',name:'Dugout Canoe Paddle and Harpoon Rack',type:'rack',job:'shipwrighting',tier:'common',
  setting:'both',rooms:['workshop','storage','yard','hall'],w:1.36,d:0.52,h:1.78,materials:['timber','bone','bronze'],task:['storage'],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,0,.14,.1,.46,0,F.col('cypressDark'),'wood');
    F.box(sx,.1,0,.08,1.38,.08,0,F.col('cypress'),'wood');
   }
   F.box(0,.34,0,1.24,.06,.28,0,F.col('cypressDark'),'wood');
   F.box(0,1.22,0,1.24,.06,.12,0,F.col('cypressDark'),'wood');
   /* Four painted leaf-bladed cedar paddles + two antler-tipped salmon harpoons */
   for(let i=-2;i<=1;i++){
    const x=i*.22-.08;
    F.rod(x,.14,0,x,1.68,0,.018,F.col('cypress'),'wood');
    F.box(x,1.28,.02,.13,.38,.024,0,i%2===0?F.col('formRed'):F.col('formBlack'),'paint');
   }
   for(const x of [.34,.48]){
    F.rod(x,.14,0,x,1.74,0,.016,F.col('cedarPale'),'wood');
    F.cone(x,1.64,0,.032,.14,0,F.col('boneSkull'),'bone');
   }
  }});
})();
