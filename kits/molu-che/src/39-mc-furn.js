// ================================================================= BESPOKE MOLU-CHE FURNITURE (registered on KratorFurniture)
// Registers culture 'molu-che' palette and 16 bespoke Moleshelf Dikengyuan & Dipu-Bonduwe Vault pieces onto
// KratorFurniture (38-furniture-bundle.js). Every part names a palette colour and explicit material family so 91f-furnish.js
// (svfDetail) attaches packed f_* library detail maps onto 100% of furniture meshes with zero coplanar faces.
(function(){
 const KF=KratorFurniture;
 const PAL={
  loess:0xd4ab6a,limewash:0xf3efe5,dolomite:0xcfc5b0,kilnbrick:0xb4563a,basalt:0x2e3136,
  ochre:0xdc9e36,ironred:0xa83c28,indigo:0x24426e,terracotta:0xc25c3a,
  darkcedar:0x422a1c,cedar:0x7e5236,cedarWarm:0x966848,
  bronze:0xa2763c,copper:0x4c8a76,iron:0x363a40,nickel:0xdce2e8,
  halite:0xf0ece6,amber:0xe2a43a,molefelt:0x5c463c,reed:0xc8ae74,
  tuber:0xe6dec8,flameGlow:0xffc460
 };
 KF.FPAL['molu-che']=Object.assign(KF.FPAL['molu-che']||{},PAL);
 function mcDefFurn(o){
  o.culture=o.culture||'molu-che';
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
 KF.def=mcDefFurn;

 /* 1. Heated Yaodong Kang Brick Bed & Mole-Felt Roll */
 mcDefFurn({key:'molu_kang_hearth_bed',name:'Heated Yaodong Kang Brick Bed and Mole-Felt Roll',type:'bed',tier:'common',
  setting:'indoor',rooms:['bedroom','hall','parlour'],w:1.92,d:1.08,h:0.74,materials:['stone','ceramic','cloth'],task:['sleeping','resting'],
  build(F){
   F.box(0,0,0,1.88,.42,1.02,0,F.col('kilnbrick'),'brick');
   F.box(0,.08,.525,.34,.22,.03,0,F.col('basalt'),'stone');
   F.box(0,.42,0,1.92,.06,1.06,0,F.col('limewash'),'plaster');
   F.box(0,.48,0,1.76,.045,.92,0,F.col('reed'),'reed');
   F.pillow(.14,.57,0,1.38,.085,.78,0,F.col('molefelt'),'cloth');
   F.bolster(-.68,.58,0,.74,.095,Math.PI/2,F.col('ironred'),'cloth');
  }});

 /* 2. Tin-Bronze & Kulanewa Iron Talpathere Claw-Shoe Rack */
 mcDefFurn({key:'molu_claw_shoe_rack',name:'Bronze and Iron Talpathere Claw-Shoe Rack',type:'storage',job:'smithing',
  setting:'both',rooms:['shop','storage','yard','hall'],w:1.54,d:0.62,h:1.68,materials:['timber','metal','leather'],task:['storage'],
  build(F){
   F.box(0,0,0,1.48,.1,.56,0,F.col('dolomite'),'stone');
   for(const sx of [-.64,.64]){
    F.box(sx,.1,0,.09,1.48,.1,0,F.col('darkcedar'),'wood');
   }
   for(const y of [.56,1.12,1.54]){
    F.box(0,y,0,1.42,.065,.42,0,F.col('cedar'),'wood');
   }
   for(const sx of [-.42,0,.42]){
    F.cone(sx,.63,.12,.09,.24,.35,F.col('bronze'),'bronze');
    F.cone(sx,1.19,.12,.09,.24,.35,F.col('iron'),'metal');
   }
   F.box(0,.12,-.12,.92,.28,.22,0,F.col('molefelt'),'leather');
  }});

 /* 3. Basalt & Bronze-Membrane Seismic Listening Table */
 mcDefFurn({key:'molu_seismic_drum_table',name:'Basalt and Bronze Seismic Listening Table',type:'workstation',tier:'court',
  setting:'both',rooms:['study','hall','shrine','yard'],w:1.24,d:1.24,h:0.96,materials:['stone','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.54,.14,0,F.col('dolomite'),'stone');
   F.cyl(0,.14,0,.38,.52,0,F.col('basalt'),'stone');
   F.cyl(0,.66,0,.58,.14,0,F.col('basalt'),'stone');
   F.cyl(0,.8,0,.48,.055,0,F.col('bronze'),'bronze');
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    F.cyl(Math.cos(a)*.38,.86,Math.sin(a)*.38,.055,.08,0,F.col('amber'),'ceramic');
   }
  }});

 /* 4. Dipu-Bonduwe Iron- & Valge-Vask-Banded Bullion Strongbox */
 mcDefFurn({key:'molu_bonduwe_bullion_chest',name:'Dipu-Bonduwe Bonded Bullion Strongbox',type:'storage',tier:'court',
  setting:'both',rooms:['storage','hall','study','shop'],w:1.32,d:0.78,h:0.98,materials:['stone','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.28,.14,.74,0,F.col('basalt'),'stone');
   F.box(0,.14,0,1.2,.68,.66,0,F.col('iron'),'metal');
   F.box(0,.82,0,1.26,.11,.72,0,F.col('iron'),'metal');
   for(const sx of [-.44,0,.44]){
    F.box(sx,.155,0,.065,.65,.695,0,F.col('nickel'),'pewter');
   }
   F.cyl(0,.48,.365,.095,.035,Math.PI/2,F.col('bronze'),'bronze');
  }});

 /* 5. Safe-Conduct Amber-Seal & Ampala-Kiri Ledger Rack */
 mcDefFurn({key:'molu_amber_tally_rack',name:'Safe-Conduct Amber-Seal and Tally Rack',type:'storage',job:'scribing',
  setting:'indoor',rooms:['study','hall','storage','shop'],w:1.46,d:0.56,h:1.68,materials:['timber','ceramic','stone'],task:['storage'],
  build(F){
   for(const sx of [-.65,.65])for(const sz of [-.22,.22]){
    F.box(sx,0,sz,.085,1.62,.085,0,F.col('darkcedar'),'wood');
   }
   for(const y of [.18,.68,1.18]){
    F.box(0,y,0,1.38,.055,.48,0,F.col('cedar'),'wood');
    for(let i=-2;i<=2;i++){
     const isAmb=(i+Math.round(y*10))%2===0;
     F.box(i*.24,y+.06,0,.16,.18,.34,0,F.col(isAmb?'amber':'dolomite'),isAmb?'clay':'stone');
    }
   }
   F.box(0,1.62,0,1.44,.055,.54,0,F.col('darkcedar'),'wood');
  }});

 /* 6. Amber-Lens Low-Light Tapetum Tallow Lamp */
 mcDefFurn({key:'molu_tapetum_oil_cresset',name:'Amber-Lens Tapetum Tallow Lamp Stand',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','shrine','yard','bedroom','storage'],w:0.56,d:0.56,h:1.78,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.11,0,F.col('basalt'),'stone');
   F.cyl(0,.11,0,.11,.09,0,F.col('bronze'),'bronze');
   F.cyl(0,.2,0,.038,1.16,0,F.col('darkcedar'),'wood');
   F.cyl(0,1.36,0,.16,.055,0,F.col('bronze'),'bronze');
   F.cyl(0,1.415,0,.11,.19,0,F.col('flameGlow'),'glow');
   F.cone(0,1.605,0,.18,.16,0,F.col('bronze'),'bronze');
   F.lamp(0,1.51,0,1.08,8.5);
  }});

 /* 7. Irrigated Loess Luma-Papa Gallery-Tuber & Fungus Trough */
 mcDefFurn({key:'molu_tuber_seep_planter',name:'Irrigated Loess Luma-Papa Tuber Trough',type:'workstation',job:'fungiculture',
  setting:'both',rooms:['storage','shop','yard','hall'],w:1.68,d:0.82,h:0.86,materials:['stone','ceramic','food'],task:[],
  build(F){
   F.box(0,0,0,1.64,.44,.78,0,F.col('dolomite'),'stone');
   F.box(0,.44,0,1.52,.12,.66,0,F.col('loess'),'brick');
   for(let i=-2;i<=2;i++){
    F.cyl(i*.28,.56,-.1,.085,.14,0,F.col('tuber'),'food');
    F.cone(i*.28+.05,.56,.12,.09,.18,0,F.col('ochre'),'plant');
   }
  }});

 /* 8. Composted Blind Amber-Grub & Fungal-Loaf Breeding Bin */
 mcDefFurn({key:'molu_amber_grub_trough',name:'Blind Amber-Grub and Fungal-Loaf Bin',type:'workstation',job:'farming',
  setting:'both',rooms:['storage','shop','yard'],w:1.52,d:0.86,h:0.78,materials:['timber','ceramic','food'],task:[],
  build(F){
   F.box(0,0,0,1.48,.1,.82,0,F.col('basalt'),'stone');
   F.box(0,.1,0,1.42,.46,.76,0,F.col('darkcedar'),'wood');
   F.box(0,.56,0,1.3,.09,.64,0,F.col('cedarWarm'),'ash');
   for(const sx of [-.38,0,.38]){
    F.pillow(sx,.69,0,.28,.08,.38,0,F.col('amber'),'food');
   }
  }});

 /* 9. Giant Painted Cucuteni-Spiral Ten-Year Dry-Loess Grain Jar */
 mcDefFurn({key:'molu_cucuteni_grain_pithos',name:'Painted Cucuteni-Spiral Dry-Loess Grain Pithos',type:'storage',job:'warehousing',
  setting:'both',rooms:['storage','shop','yard','hall'],w:0.94,d:0.94,h:1.28,materials:['ceramic','stone','food'],task:['storage'],
  build(F){
   F.cyl(0,0,0,.36,.1,0,F.col('dolomite'),'stone');
   F.cyl(0,.1,0,.43,.78,0,F.col('terracotta'),'terracotta');
   F.cyl(0,.44,0,.448,.14,0,F.col('ironred'),'clay');
   F.cyl(0,.62,0,.445,.08,0,F.col('indigo'),'tile');
   F.cyl(0,.88,0,.31,.24,0,F.col('terracotta'),'terracotta');
   F.cyl(0,1.12,0,.35,.08,0,F.col('limewash'),'plaster');
  }});

 /* 10. Crystalline Halite Salt-Lick & Bronze Claw-Compact Shrine */
 mcDefFurn({key:'molu_halite_compact_altar',name:'Halite Salt-Lick and Claw-Compact Shrine',type:'shrine',job:'worship',
  setting:'both',rooms:['shrine','hall','study'],w:1.22,d:0.78,h:1.42,materials:['stone','metal'],task:['praying'],
  build(F){
   F.box(0,0,0,1.18,.16,.74,0,F.col('basalt'),'stone');
   F.box(0,.16,0,1.02,.52,.6,0,F.col('dolomite'),'stone');
   F.box(0,.68,0,1.12,.08,.68,0,F.col('ironred'),'plaster');
   F.box(-.22,.76,0,.32,.46,.28,.18,F.col('halite'),'stone');
   F.cone(.24,.76,0,.14,.42,0,F.col('bronze'),'bronze');
  }});

 /* 11. Carved Cedar & Slate-Russet Mole-Felt Lonko Settle */
 mcDefFurn({key:'molu_molefelt_divan',name:'Carved Cedar and Mole-Felt Lonko Settle',type:'seating',tier:'common',
  setting:'both',rooms:['hall','parlour','bedroom','shop'],w:1.78,d:0.8,h:0.94,materials:['timber','cloth','metal'],task:['resting','socializing'],
  build(F){
   for(const sx of [-.78,.78])for(const sz of [-.3,.3]){
    F.box(sx,0,sz,.09,.36,.09,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.36,0,1.68,.08,.68,0,F.col('cedar'),'wood');
   F.pillow(0,.5,.02,1.52,.1,.56,0,F.col('molefelt'),'cloth');
   for(const sx of [-.8,.8]){
    F.box(sx,.44,0,.08,.28,.64,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.44,-.31,1.66,.44,.07,0,F.col('darkcedar'),'wood');
   F.box(0,.88,-.31,1.72,.05,.09,0,F.col('bronze'),'bronze');
  }});

 /* 12. Sunken-Pit Cast-Bronze & Kiln-Brick Steppe Hearth Brazier */
 mcDefFurn({key:'molu_hearth_brazier',name:'Cast-Bronze and Kiln-Brick Steppe Hearth Brazier',type:'brazier',tier:'common',
  setting:'both',rooms:['hall','shrine','yard'],w:0.94,d:0.94,h:1.06,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.44,.16,0,F.col('kilnbrick'),'brick');
   F.cyl(0,.16,0,.32,.14,0,F.col('dolomite'),'stone');
   F.cyl(0,.3,0,.18,.38,0,F.col('iron'),'metal');
   F.cyl(0,.68,0,.38,.18,0,F.col('bronze'),'bronze');
   F.cyl(0,.86,0,.28,.05,0,F.col('flameGlow'),'glow');
   F.lamp(0,.96,0,1.14,8.8);
  }});

 /* 13. Basalt-Seated Bronze & Iron Claw-Shoe Farrier Anvil */
 mcDefFurn({key:'molu_claw_forge_anvil',name:'Basalt-Seated Talpathere Claw-Shoe Anvil',type:'workstation',job:'smithing',
  setting:'both',rooms:['shop','storage','yard','hall'],w:1.08,d:0.74,h:0.94,materials:['stone','timber','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.39,.18,0,F.col('basalt'),'stone');
   F.cyl(0,.18,0,.31,.36,0,F.col('darkcedar'),'wood');
   F.box(0,.54,0,.5,.18,.26,0,F.col('iron'),'metal');
   F.box(0,.72,0,.78,.14,.28,0,F.col('bronze'),'bronze');
   F.cone(.46,.76,0,.09,.18,Math.PI/2,F.col('iron'),'metal');
  }});

 /* 14. Bonded-Vault Bullion & Salt Steelyard Assay Table */
 mcDefFurn({key:'molu_bypass_assay_scale',name:'Bonded-Vault Bullion and Salt Assay Table',type:'table',job:'trading',
  setting:'both',rooms:['hall','shop','study','yard'],w:1.64,d:0.86,h:1.38,materials:['timber','stone','metal'],task:[],
  build(F){
   for(const sx of [-.68,.68])for(const sz of [-.34,.34]){
    F.box(sx,0,sz,.1,.72,.1,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.72,0,1.6,.07,.82,0,F.col('cedar'),'wood');
   F.box(-.44,.795,0,.34,.045,.28,0,F.col('nickel'),'pewter');
   F.box(.44,.795,0,.3,.12,.26,0,F.col('halite'),'stone');
   F.cyl(0,.79,0,.04,0.52,0,F.col('bronze'),'bronze');
   F.box(0,1.31,0,.76,.04,.045,0,F.col('bronze'),'bronze');
  }});

 /* 15. Talpathere-Milk Curd Press & Tallow Mould Bench */
 mcDefFurn({key:'molu_curd_press_table',name:'Talpathere-Milk Curd Press and Tallow Bench',type:'workstation',job:'dairy',
  setting:'both',rooms:['shop','storage','hall','yard'],w:1.52,d:0.82,h:1.18,materials:['timber','stone','food'],task:[],
  build(F){
   for(const sx of [-.64,.64])for(const sz of [-.32,.32]){
    F.box(sx,0,sz,.09,.68,.09,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.68,0,1.48,.07,.78,0,F.col('cedarWarm'),'wood');
   F.cyl(-.28,.75,0,.22,.22,0,F.col('dolomite'),'stone');
   F.cyl(-.28,.97,0,.18,.08,0,F.col('tuber'),'food');
   F.box(.32,.75,0,.38,.14,.34,0,F.col('amber'),'tallow');
  }});

 /* 16. Two-Tier Cedar & Woven-Reed Caravan Drover Bunk */
 mcDefFurn({key:'molu_drover_bunk',name:'Two-Tier Cedar and Reed Caravan Drover Bunk',type:'bed',tier:'poor',
  setting:'indoor',rooms:['bedroom','hall','parlour'],w:1.88,d:0.9,h:1.56,materials:['timber','cloth'],task:['sleeping','resting'],
  build(F){
   for(const sx of [-.84,.84])for(const sz of [-.38,.38]){
    F.box(sx,0,sz,.085,1.52,.085,0,F.col('darkcedar'),'wood');
   }
   for(const y of [.28,1.08]){
    F.box(0,y,0,1.76,.07,.82,0,F.col('cedar'),'wood');
    F.pillow(0,y+.12,0,1.62,.08,.72,0,F.col('reed'),'reed');
    F.bolster(-.64,y+.21,0,.64,.08,Math.PI/2,F.col('molefelt'),'cloth');
   }
  }});
})();
