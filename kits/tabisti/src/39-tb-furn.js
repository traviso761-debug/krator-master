/* ================================================================= BESPOKE URBAN TABISTI FURNITURE (registered on KratorFurniture)
   Registers 16 bespoke Urban Tabisti pieces onto KratorFurniture (38-furniture-bundle.js) under culture 'eastabyss' so zero
   unknown culture tags are emitted and 100% of furniture meshes receive packed f_* library detail maps with zero coplanar faces. */
(function(){
 const KF=KratorFurniture;
 const PAL={
  buffBrick:0xe0ccb0,roseBrick:0xc46b54,stuccoCream:0xeee4d0,ganchWhite:0xf5f2eb,alabasterWhite:0xf6f3ec,
  kashiTeal:0x1c9b95,zsolnaySea:0x2ca69d,cobaltGlaze:0x1d4e8c,escataGold:0xe2b24a,
  ustunDark:0x523422,cedarWarm:0x825638,lacquerCrimson:0x9e2c26,
  verdigrisTeal:0x4a9c86,giltGold:0xdcb03c,bronzeCast:0x9c723a,ironWrought:0x36383c,
  crystalBlue:0x4cc4e4,silkTeal:0x228e88,silkRose:0xc4544a,silkSaffron:0xe4ae3a,reedWoven:0xc8b482,flameGlow:0xffc45c
 };
 KF.FPAL.eastabyss=Object.assign(KF.FPAL.eastabyss||{},PAL);
 function tbDefFurn(o){
  o.culture='eastabyss';
  o.variants=o.variants==null?1:o.variants;
  o.rooms=Array.isArray(o.rooms)?o.rooms:[o.room||'hall'];
  o.room=o.rooms[0];
  o.tier=o.tier||'common';
  o.wealth=o.wealth||(o.tier==='court'?[.7,1]:o.tier==='poor'?[0,.35]:[.3,.75]);
  o.setting=o.setting||'both';
  o.anchor=o.anchor||'floor';
  o.clearance=o.clearance||{front:.5};
  o.task=o.task||[];
  KF.FURNS.push(o);
  KF.FURN_BY_KEY[o.key]=o;
  return o;
 }

 /* 1. Liikofi Abyss-Lac & Teal-Silk Ayvan Breeze Divan */
 tbDefFurn({key:'tb_kundal_divan',name:'Abyss-Lac and Teal-Silk Ayvan Divan',type:'seating',tier:'court',
  rooms:['hall','parlour','bedroom'],w:1.86,d:0.86,h:0.88,materials:['timber','cloth','metal'],task:['resting','socializing'],
  build(F){
   for(const sx of [-.82,.82])for(const sz of [-.34,.34]){
    F.cyl(sx,0,sz,.055,.32,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.32,0,1.78,.1,.78,0,F.col('lacquerCrimson'),'lacquer');
   F.pillow(0,.48,.02,1.64,.11,.66,0,F.col('silkTeal'),'silk');
   F.bolster(-.68,.58,0,.62,.095,Math.PI/2,F.col('silkSaffron'),'silk');
   F.bolster(.68,.58,0,.62,.095,Math.PI/2,F.col('silkRose'),'silk');
   F.box(0,.42,-.35,1.74,.42,.07,0,F.col('ustunDark'),'wood');
   F.box(0,.84,-.35,1.8,.04,.09,0,F.col('giltGold'),'gold');
  }});

 /* 2. Octagonal Turquoise-Tiled Courtyard Shadirvan Fountain Basin */
 tbDefFurn({key:'tb_shadirvan_fountain',name:'Octagonal Kashi Courtyard Shadirvan Basin',type:'workstation',tier:'common',
  rooms:['yard','hall','shrine'],w:1.48,d:1.48,h:0.96,materials:['ceramic','stone','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.68,.14,0,F.col('alabasterWhite'),'stone');
   F.cyl(0,.14,0,.62,.28,0,F.col('kashiTeal'),'tile');
   F.cyl(0,.42,0,.66,.06,0,F.col('alabasterWhite'),'stone');
   F.cyl(0,.48,0,.14,.32,0,F.col('verdigrisTeal'),'bronze');
   F.cyl(0,.8,0,.28,.07,0,F.col('giltGold'),'gold');
   F.cyl(0,.87,0,.07,.09,0,F.col('crystalBlue'),'jade');
  }});

 /* 3. Carved Ustun & Woven-Reed Elevated Sleeping Daybed */
 tbDefFurn({key:'tb_ustun_daybed',name:'Carved Ustun Ventilated Woven-Reed Daybed',type:'bed',tier:'common',
  rooms:['bedroom','parlour','hall'],w:1.92,d:0.92,h:0.78,materials:['timber','cloth'],task:['sleeping','resting'],
  build(F){
   for(const sx of [-.86,.86])for(const sz of [-.38,.38]){
    F.cyl(sx,0,sz,.05,.38,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.34,0,1.84,.08,.86,0,F.col('cedarWarm'),'wood');
   F.pillow(0,.47,0,1.74,.09,.78,0,F.col('reedWoven'),'reed');
   F.bolster(-.68,.57,0,.68,.09,Math.PI/2,F.col('silkTeal'),'linen');
   F.box(-.88,.42,0,.06,.34,.84,0,F.col('ustunDark'),'wood');
  }});

 /* 4. Gaudí Trencadís Mosaic & Wrought-Iron Breeze-Loggia Table */
 tbDefFurn({key:'tb_trencadis_table',name:'Trencadis Mosaic and Wrought-Iron Loggia Table',type:'table',tier:'common',
  rooms:['hall','parlour','yard','shop'],w:1.36,d:0.84,h:0.78,materials:['ceramic','metal'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.54,.54])for(const sz of [-.3,.3]){
    F.cyl(sx,0,sz,.035,.68,0,F.col('ironWrought'),'metal');
   }
   F.box(0,.22,0,.96,.04,.48,0,F.col('ironWrought'),'metal');
   F.box(0,.68,0,1.3,.06,.78,0,F.col('roseBrick'),'terracotta');
   F.box(0,.742,0,1.34,.035,.82,0,F.col('kashiTeal'),'tile');
  }});

 /* 5. Brass Samovar & Mint-Glaze Tea Tray Low Table */
 tbDefFurn({key:'tb_tea_samovar_low',name:'Brass Samovar and Kashi Tea Low Table',type:'table',tier:'common',
  rooms:['hall','parlour','study','shop'],w:1.28,d:0.76,h:0.76,materials:['timber','metal','ceramic'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.52,.52])for(const sz of [-.28,.28]){
    F.box(sx,0,sz,.075,.42,.075,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.42,0,1.22,.065,.72,0,F.col('lacquerCrimson'),'lacquer');
   F.cyl(-.26,.49,0,.13,.22,0,F.col('giltGold'),'gold');
   F.cone(-.26,.71,0,.09,.06,0,F.col('bronzeCast'),'bronze');
   F.cyl(.18,.49,-.08,.065,.045,0,F.col('kashiTeal'),'ceramic');
   F.cyl(.34,.49,.08,.065,.045,0,F.col('cobaltGlaze'),'ceramic');
  }});

 /* 6. Sheltered Ganch-Inlaid Cedar Lattice Screen Bench */
 tbDefFurn({key:'tb_ganch_screen_bench',name:'Carved Cedar and Ganch Lattice Settle',type:'seating',tier:'common',
  rooms:['hall','parlour','study','shrine'],w:1.72,d:0.72,h:1.06,materials:['timber','stone','cloth'],task:['resting'],
  build(F){
   for(const sx of [-.76,.76])for(const sz of [-.28,.28]){
    F.box(sx,0,sz,.085,.36,.085,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.36,0,1.64,.08,.64,0,F.col('cedarWarm'),'wood');
   F.pillow(0,.49,.03,1.5,.09,.52,0,F.col('silkRose'),'cloth');
   F.box(0,.44,-.29,1.62,.58,.06,0,F.col('ustunDark'),'wood');
   F.box(0,.54,-.25,1.34,.36,.028,0,F.col('ganchWhite'),'plaster');
  }});

 /* 7. Pierced Verdigris-Bronze & Amber-Glass Floor Lantern Stand (Zero-Electricity Rule) */
 tbDefFurn({key:'tb_brass_lantern_stand',name:'Pierced Verdigris-Bronze Oil Lantern Stand',type:'lamp',tier:'common',
  rooms:['hall','shrine','yard','street','parlour'],w:0.56,d:0.56,h:1.88,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.1,0,F.col('alabasterWhite'),'stone');
   F.cyl(0,.1,0,.11,.1,0,F.col('verdigrisTeal'),'bronze');
   F.cyl(0,.2,0,.038,1.22,0,F.col('bronzeCast'),'bronze');
   F.cyl(0,1.42,0,.16,.055,0,F.col('giltGold'),'gold');
   F.cyl(0,1.475,0,.11,.21,0,F.col('flameGlow'),'glow');
   F.cone(0,1.685,0,.18,.19,0,F.col('verdigrisTeal'),'bronze');
   F.lamp(0,1.58,0,1.08,8.5);
  }});

 /* 8. Sacred Stepped Alabaster & Blue-Crystal Offering Brazier (LORE.md 6.9) */
 tbDefFurn({key:'tb_crystal_altar_brazier',name:'Alabaster and Blue-Crystal Salt-Altar Brazier',type:'shrine',job:'worship',
  rooms:['shrine','hall','yard'],w:1.12,d:1.12,h:1.36,materials:['stone','metal','emissive'],task:['praying'],
  build(F){
   F.box(0,0,0,1.04,.16,1.04,0,F.col('alabasterWhite'),'stone');
   F.box(0,.16,0,.8,.16,.8,0,F.col('alabasterWhite'),'stone');
   F.cyl(0,.32,0,.28,.34,0,F.col('kashiTeal'),'tile');
   F.cyl(0,.66,0,.36,.16,0,F.col('giltGold'),'gold');
   F.cyl(0,.82,0,.24,.05,0,F.col('flameGlow'),'glow');
   for(const a of [0,1.57,3.14,4.71]){
    F.cone(Math.cos(a)*.36,.32,Math.sin(a)*.36,.075,.36,0,F.col('crystalBlue'),'jade');
   }
   F.lamp(0,.94,0,1.15,9.0);
  }});

 /* 9. Syndic Potash, Lac & Caravan Ledger Counting Desk */
 tbDefFurn({key:'tb_syndic_ledger_desk',name:'Syndic Lacquered Caravan and Potash Ledger Desk',type:'table',job:'scribing',
  rooms:['study','hall','shop'],w:1.62,d:0.86,h:0.88,materials:['timber','ceramic','metal'],task:[],
  build(F){
   for(const sx of [-.68,.68])for(const sz of [-.34,.34]){
    F.box(sx,0,sz,.095,.74,.095,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.58,0,1.44,.14,.7,0,F.col('cedarWarm'),'wood');
   F.box(0,.74,0,1.58,.065,.82,0,F.col('lacquerCrimson'),'lacquer');
   F.box(-.38,.808,-.12,.38,.032,.28,0,F.col('kashiTeal'),'tile');
   F.box(.18,.808,.04,.46,.024,.34,0,F.col('stuccoCream'),'paper');
   F.cyl(.54,.808,-.14,.075,.055,0,F.col('giltGold'),'gold');
  }});

 /* 10. Kashi & Zsolnay Glazed-Tile Drying Rack */
 tbDefFurn({key:'tb_kashi_tile_rack',name:'Kashi and Zsolnay Glazed-Tile Drying Rack',type:'storage',job:'smithing',
  rooms:['shop','storage','yard'],w:1.48,d:0.62,h:1.72,materials:['timber','ceramic'],task:['storage'],
  build(F){
   for(const sx of [-.66,.66])for(const sz of [-.24,.24]){
    F.box(sx,0,sz,.08,1.66,.08,0,F.col('ustunDark'),'wood');
   }
   for(const y of [.22,.72,1.22]){
    F.box(0,y,0,1.4,.05,.52,0,F.col('cedarWarm'),'wood');
    for(let i=-2;i<=2;i++){
     const colName=i%2===0?'kashiTeal':(i<0?'cobaltGlaze':'escataGold');
     F.box(i*.25,y+.055,0,.18,.22,.36,0,F.col(colName),'tile');
    }
   }
   F.box(0,1.66,0,1.46,.05,.58,0,F.col('ustunDark'),'wood');
  }});

 /* 11. Liikofi Abyss-Lac & Rubber Straining & Curing Vat */
 tbDefFurn({key:'tb_lac_curing_vat',name:'Liikofi Abyss-Lac Boiling and Straining Vat',type:'workstation',job:'smithing',
  rooms:['shop','yard','storage'],w:1.18,d:1.18,h:1.08,materials:['brick','metal','timber'],task:[],
  build(F){
   F.cyl(0,0,0,.54,.44,0,F.col('buffBrick'),'brick');
   F.cyl(0,.44,0,.5,.42,0,F.col('bronzeCast'),'bronze');
   for(const y of [.52,.76])F.cyl(0,y,0,.52,.045,0,F.col('ironWrought'),'metal');
   F.cyl(0,.86,0,.44,.04,0,F.col('lacquerCrimson'),'lacquer');
   F.box(0,.92,0,1.12,.055,.14,0,F.col('ustunDark'),'wood');
  }});

 /* 12. Copper Rosewater & Abyssal Incense Alembic Still */
 tbDefFurn({key:'tb_incense_alembic',name:'Copper Rosewater and Incense Alembic Still',type:'workstation',job:'brewing',
  rooms:['shop','storage','yard'],w:1.24,d:0.78,h:1.54,materials:['brick','metal','ceramic'],task:[],
  build(F){
   F.box(0,0,0,1.16,.48,.7,0,F.col('roseBrick'),'brick');
   F.box(0,.48,0,1.2,.055,.74,0,F.col('kashiTeal'),'tile');
   F.cyl(-.28,.535,0,.24,.44,0,F.col('bronzeCast'),'bronze');
   F.cone(-.28,.975,0,.22,.34,0,F.col('giltGold'),'gold');
   F.rod(-.22,1.26,0,.32,.96,0,.032,F.col('bronzeCast'),'bronze');
   F.cyl(.34,.535,0,.18,.42,0,F.col('verdigrisTeal'),'ceramic');
  }});

 /* 13. Potash & Halite Brine Crystallization Trough */
 tbDefFurn({key:'tb_potash_pan_trough',name:'Glazed Potash and Salt Crystallization Trough',type:'workstation',job:'mining',
  rooms:['yard','storage','shop'],w:1.68,d:0.96,h:0.68,materials:['brick','ceramic','stone'],task:[],
  build(F){
   F.box(0,0,0,1.62,.38,.9,0,F.col('buffBrick'),'brick');
   F.box(0,.38,0,1.68,.16,.96,0,F.col('kashiTeal'),'tile');
   F.box(0,.542,0,1.44,.05,.74,0,F.col('alabasterWhite'),'stone');
  }});

 /* 14. Brick & Terracotta Dome Tannur Bread Oven */
 tbDefFurn({key:'tb_tannur_oven',name:'Glazed-Hood Brick Tannur Bread Oven',type:'hearth',job:'baking',
  rooms:['kitchen','shop','yard'],w:1.26,d:1.12,h:1.52,materials:['brick','ceramic','emissive'],task:['cooking'],
  build(F){
   F.box(0,0,0,1.2,.56,1.06,0,F.col('buffBrick'),'brick');
   F.box(0,.56,0,1.24,.06,1.1,0,F.col('roseBrick'),'terracotta');
   F.cyl(0,.62,-.04,.44,.54,0,F.col('stuccoCream'),'plaster');
   F.cone(0,1.16,-.04,.38,.34,0,F.col('kashiTeal'),'tile');
   F.cyl(0,.64,.24,.18,.045,0,F.col('flameGlow'),'glow');
   F.lamp(0,.74,.28,.95,6.5);
  }});

 /* 15. Evaporative Porous-Clay Zeer Cold-Storage Jar Rack */
 tbDefFurn({key:'tb_zeer_cold_rack',name:'Evaporative Porous-Clay Zeer Cold-Jar Rack',type:'storage',tier:'common',
  rooms:['storage','kitchen','shop','yard'],w:1.42,d:0.66,h:1.18,materials:['timber','ceramic'],task:['storage'],
  build(F){
   for(const sx of [-.62,.62])for(const sz of [-.24,.24]){
    F.box(sx,0,sz,.08,.62,.08,0,F.col('ustunDark'),'wood');
   }
   F.box(0,.46,0,1.34,.06,.56,0,F.col('cedarWarm'),'wood');
   for(const sx of [-.42,0,.42]){
    F.cyl(sx,.52,0,.16,.46,0,F.col('roseBrick'),'terracotta');
    F.cyl(sx,.98,0,.11,.1,0,F.col('kashiTeal'),'ceramic');
   }
  }});

 /* 16. Bonded Silk, Lacquer & Spice Bale Pallet */
 tbDefFurn({key:'tb_bonded_bale_stack',name:'Bonded Caravan Bale and Lacquer-Cask Pallet',type:'storage',job:'warehousing',
  rooms:['storage','shop','yard'],w:1.46,d:1.06,h:1.14,materials:['timber','cloth','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.4,.12,1.0,0,F.col('cedarWarm'),'wood');
   F.box(-.32,.12,0,.64,.46,.82,0,F.col('silkSaffron'),'cloth');
   F.box(-.32,.58,0,.58,.42,.74,0,F.col('silkTeal'),'silk');
   F.cyl(.38,.12,-.18,.22,.68,0,F.col('lacquerCrimson'),'lacquer');
   F.cyl(.38,.12,.24,.2,.58,0,F.col('ustunDark'),'wood');
  }});
})();
