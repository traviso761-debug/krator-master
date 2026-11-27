// ================================================================= BESPOKE KULANEWA FURNITURE (registered on KratorFurniture)
// Registers culture 'kulanewa' palette and 15 bespoke Karum Ledger-Syndicate & Kula-Na Ikki Covenant-Commune pieces onto
// KratorFurniture (38-furniture-bundle.js). Every part names a palette colour and explicit material family so 91f-furnish.js
// (svfDetail) attaches packed f_* library detail maps onto 100% of furniture meshes with zero coplanar faces.
(function(){
 const KF=KratorFurniture;
 const PAL={
  kura:0xf2efe6,sootstone:0x2e3136,kilnbrick:0xb25238,cobalt:0x1d4c8e,celadon:0x5aa288,
  darkcedar:0x422a1c,cedar:0x7e5236,cedarWarm:0x966848,lacquer:0xa82820,
  nickel:0xdce2e8,paktong:0xc8c6be,iron:0x34383e,bronze:0x9e743c,copper:0x4c8a76,
  amber:0xd89a32,barkPaper:0xebe2ce,
  silkSaffron:0xe6a628,silkIndigo:0x28467e,silkCrimson:0xb22826,
  hemp:0xc4ac72,flameGlow:0xffc460
 };
 KF.FPAL.kulanewa=Object.assign(KF.FPAL.kulanewa||{},PAL);
 function klDefFurn(o){
  o.culture=o.culture||'kulanewa';
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
 KF.def=klDefFurn;

 /* 1. Karum Naruqqum Joint-Stock Assay & Counting Table */
 klDefFurn({key:'kulanewa_naruqqum_table',name:'Karum Naruqqum Assay and Counting Table',type:'table',job:'scribing',
  setting:'indoor',rooms:['study','hall','shop'],w:1.62,d:0.86,h:0.86,materials:['timber','metal','ceramic'],task:[],
  build(F){
   for(const sx of [-.68,.68])for(const sz of [-.34,.34]){
    F.box(sx,0,sz,.1,.72,.1,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.56,0,1.42,.14,.7,0,F.col('cedar'),'wood');
   F.box(0,.72,0,1.58,.06,.82,0,F.col('darkcedar'),'wood');
   F.box(0,.782,0,1.62,.018,.85,0,F.col('nickel'),'pewter');
   F.box(-.42,.804,-.14,.36,.035,.26,0,F.col('amber'),'clay');
   F.box(.12,.804,.04,.48,.02,.34,0,F.col('barkPaper'),'paper');
   F.cyl(.52,.804,-.12,.08,.05,0,F.col('bronze'),'bronze');
  }});

 /* 2. Arch-Nickel-Banded Kura Bullion & Amber-Envelope Safe */
 klDefFurn({key:'kulanewa_amber_safe',name:'Nickel-Banded Kura Bullion Safe',type:'storage',tier:'court',
  setting:'both',rooms:['storage','hall','study','shop'],w:1.24,d:0.74,h:0.96,materials:['stone','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.2,.14,.7,0,F.col('sootstone'),'stone');
   F.box(0,.14,0,1.14,.68,.64,0,F.col('kura'),'plaster');
   F.box(0,.82,0,1.2,.1,.7,0,F.col('iron'),'metal');
   for(const sx of [-.42,0,.42]){
    F.box(sx,.15,0,.06,.66,.67,0,F.col('nickel'),'pewter');
   }
   F.cyl(0,.48,.34,.09,.035,Math.PI/2,F.col('bronze'),'bronze');
  }});

 /* 3. 64-Sign Clay-Envelope & Bark-Draft Filing Rack */
 klDefFurn({key:'kulanewa_tablet_rack',name:'Amber-Envelope and Bark-Draft Rack',type:'storage',job:'scribing',
  setting:'indoor',rooms:['study','hall','storage','shop'],w:1.44,d:0.56,h:1.68,materials:['timber','ceramic','cloth'],task:['storage'],
  build(F){
   for(const sx of [-.64,.64])for(const sz of [-.22,.22]){
    F.box(sx,0,sz,.08,1.62,.08,0,F.col('darkcedar'),'wood');
   }
   for(const y of [.18,.68,1.18]){
    F.box(0,y,0,1.36,.05,.48,0,F.col('cedar'),'wood');
    for(let i=-2;i<=2;i++){
     const isClay=(i+Math.round(y*10))%2===0;
     F.box(i*.24,y+.055,0,.16,.18,.34,0,F.col(isClay?'amber':'barkPaper'),isClay?'clay':'paper');
    }
   }
   F.box(0,1.62,0,1.42,.05,.54,0,F.col('darkcedar'),'wood');
  }});

 /* 4. Floor-Standing Paktong & Bronze Bullion Balance Scale */
 klDefFurn({key:'kulanewa_bullion_scale',name:'Paktong and Bronze Bullion Assay Scale',type:'workstation',job:'trading',
  setting:'both',rooms:['hall','shop','yard','storage'],w:1.18,d:0.64,h:1.62,materials:['stone','metal'],task:[],
  build(F){
   F.box(0,0,0,.58,.14,.48,0,F.col('sootstone'),'stone');
   F.cyl(0,.14,0,.055,1.32,0,F.col('bronze'),'bronze');
   F.box(0,1.46,0,1.08,.045,.05,0,F.col('nickel'),'pewter');
   F.cyl(0,1.505,0,.06,.09,0,F.col('bronze'),'bronze');
   for(const sx of [-.46,.46]){
    F.rod(sx,1.45,0,sx,.96,0,.012,F.col('iron'),'metal');
    F.cyl(sx,.92,0,.18,.038,0,F.col('paktong'),'pewter');
   }
  }});

 /* 5. Carved Newar Dark-Cedar Merchant Settle Bench */
 klDefFurn({key:'kulanewa_cedar_settle',name:'Carved Newar Cedar Merchant Settle',type:'seating',tier:'common',
  setting:'both',rooms:['hall','parlour','bedroom','shop'],w:1.78,d:0.78,h:0.94,materials:['timber','cloth','metal'],task:['resting','socializing'],
  build(F){
   for(const sx of [-.78,.78])for(const sz of [-.3,.3]){
    F.box(sx,0,sz,.09,.36,.09,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.34,0,1.68,.09,.68,0,F.col('cedar'),'wood');
   F.pillow(0,.49,.02,1.54,.1,.56,0,F.col('silkIndigo'),'silk');
   for(const sx of [-.8,.8]){
    F.box(sx,.43,0,.08,.28,.64,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.43,-.31,1.66,.46,.07,0,F.col('darkcedar'),'wood');
   F.box(0,.89,-.31,1.72,.045,.09,0,F.col('bronze'),'bronze');
  }});

 /* 6. Octagonal Cast-Bronze & Arch-Nickel Clearing-Court Brazier */
 klDefFurn({key:'kulanewa_syndicate_brazier',name:'Octagonal Cast-Bronze Syndicate Brazier',type:'brazier',tier:'common',
  setting:'both',rooms:['hall','shrine','yard'],w:0.88,d:0.88,h:1.12,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.4,.14,0,F.col('sootstone'),'stone');
   F.cyl(0,.14,0,.28,.12,0,F.col('nickel'),'pewter');
   F.cyl(0,.26,0,.15,.44,0,F.col('iron'),'metal');
   F.cyl(0,.7,0,.36,.18,0,F.col('bronze'),'bronze');
   F.cyl(0,.88,0,.27,.045,0,F.col('flameGlow'),'glow');
   F.lamp(0,.98,0,1.12,8.5);
  }});

 /* 7. Broker's Copper & Celadon Tea-Tasting Low Table */
 klDefFurn({key:'kulanewa_tea_samovar',name:'Copper Samovar and Celadon Tea Table',type:'table',tier:'common',
  setting:'both',rooms:['hall','parlour','study'],w:1.38,d:0.78,h:0.78,materials:['timber','metal','ceramic'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.56,.56])for(const sz of [-.28,.28]){
    F.box(sx,0,sz,.08,.44,.08,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.44,0,1.32,.07,.74,0,F.col('cedarWarm'),'wood');
   F.cyl(-.28,.515,0,.13,.22,0,F.col('copper'),'bronze');
   F.cone(-.28,.735,0,.09,.06,0,F.col('bronze'),'bronze');
   F.cyl(.18,.515,-.08,.07,.045,0,F.col('celadon'),'ceramic');
   F.cyl(.34,.515,.08,.07,.045,0,F.col('celadon'),'ceramic');
  }});

 /* 8. Kula-Na Uncrowned-Bell Lay-Preacher Covenant Lectern */
 klDefFurn({key:'kulanewa_covenant_lectern',name:'Uncrowned-Bell Covenant Preacher Lectern',type:'shrine',job:'worship',
  setting:'both',rooms:['shrine','hall','study'],w:1.06,d:0.78,h:1.46,materials:['stone','timber','metal'],task:['praying'],
  build(F){
   F.box(0,0,0,.96,.14,.68,0,F.col('sootstone'),'stone');
   F.box(0,.14,0,.78,.14,.54,0,F.col('kura'),'plaster');
   F.box(0,.28,0,.52,.74,.38,0,F.col('darkcedar'),'wood');
   F.box(0,.58,.21,.34,.04,.04,0,F.col('nickel'),'pewter');
   F.cyl(0,.4,.23,.09,.17,0,F.col('bronze'),'bronze');
   F.box(0,1.02,0,.88,.07,.58,0,F.col('cedar'),'wood');
   F.box(0,1.095,-.02,.66,.028,.4,0,F.col('silkSaffron'),'silk');
  }});

 /* 9. Zero-Usury Mujinzo Three-Lock Parish Mutual-Aid Chest */
 klDefFurn({key:'kulanewa_mujinzo_chest',name:'Mujinzo Three-Lock Mutual-Aid Chest',type:'storage',tier:'common',
  setting:'both',rooms:['hall','shrine','storage','bedroom'],w:1.34,d:0.68,h:0.78,materials:['timber','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.28,.1,.62,0,F.col('sootstone'),'stone');
   F.box(0,.1,0,1.22,.52,.58,0,F.col('darkcedar'),'wood');
   F.box(0,.62,0,1.28,.1,.64,0,F.col('cedar'),'wood');
   for(const sx of [-.42,0,.42]){
    F.box(sx,.11,0,.055,.6,.605,0,F.col('iron'),'metal');
    F.box(sx,.44,.315,.08,.1,.025,0,F.col('nickel'),'pewter');
   }
  }});

 /* 10. Ikki Commoner Pike, Pavise-Shield & Repeating-Crossbow Rack */
 klDefFurn({key:'kulanewa_pavise_rack',name:'Ikki Militia Pavise and Crossbow Rack',type:'storage',tier:'common',
  setting:'both',rooms:['hall','storage','yard'],w:1.52,d:0.64,h:1.86,materials:['timber','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.44,.1,.58,0,F.col('darkcedar'),'wood');
   for(const sx of [-.64,.64]){
    F.box(sx,.1,0,.09,1.24,.44,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.68,0,1.34,.06,.48,0,F.col('iron'),'metal');
   for(const sx of [-.42,0,.42]){
    F.box(sx,.14,.24,.32,.78,.045,0,F.col('lacquer'),'lacquer');
    F.box(sx,.38,.272,.14,.32,.02,0,F.col('nickel'),'pewter');
    F.cyl(sx,.12,-.12,.022,1.7,0,F.col('cedarWarm'),'wood');
    F.cone(sx,1.82,-.12,.036,.16,0,F.col('nickel'),'pewter');
   }
  }});

 /* 11. Hydro-Forge Arch-Nickel & Soot-Stone Finery Anvil Block */
 klDefFurn({key:'kulanewa_trip_anvil',name:'Arch-Nickel Finery Anvil and Block',type:'workstation',job:'smithing',
  setting:'both',rooms:['shop','storage','yard','hall'],w:1.08,d:0.74,h:0.94,materials:['stone','timber','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.38,.16,0,F.col('sootstone'),'stone');
   F.cyl(0,.16,0,.31,.38,0,F.col('darkcedar'),'wood');
   F.cyl(0,.34,0,.33,.05,0,F.col('iron'),'metal');
   F.box(0,.54,0,.48,.18,.26,0,F.col('iron'),'metal');
   F.box(0,.72,0,.78,.14,.28,0,F.col('nickel'),'pewter');
   F.cone(.46,.76,0,.09,.18,Math.PI/2,F.col('nickel'),'pewter');
  }});

 /* 12. Parish Cast-Bronze Covenant Bell & Tract Stand */
 klDefFurn({key:'kulanewa_covenant_bell_stand',name:'Parish Bronze Covenant Bell Stand',type:'shrine',job:'worship',
  setting:'both',rooms:['shrine','hall','yard'],w:0.96,d:0.62,h:1.58,materials:['timber','metal'],task:['praying'],
  build(F){
   for(const sx of [-.38,.38]){
    F.box(sx,0,0,.12,.1,.54,0,F.col('sootstone'),'stone');
    F.box(sx,.1,0,.09,1.36,.09,0,F.col('darkcedar'),'wood');
   }
   F.box(0,1.46,0,.92,.09,.14,0,F.col('darkcedar'),'wood');
   F.box(0,1.38,0,.18,.08,.16,0,F.col('nickel'),'pewter');
   F.cyl(0,.86,0,.22,.46,0,F.col('bronze'),'bronze');
   F.cyl(0,.81,0,.26,.05,0,F.col('bronze'),'bronze');
  }});

 /* 13. Cedar & Woven-Hemp Artisan / Sanctuary Cot Bed */
 klDefFurn({key:'kulanewa_trundle_bunk',name:'Cedar and Woven-Hemp Sanctuary Cot',type:'bed',tier:'poor',
  setting:'both',rooms:['bedroom','hall','parlour'],w:1.86,d:0.88,h:0.72,materials:['timber','cloth'],task:['sleeping','resting'],
  build(F){
   for(const sx of [-.82,.82])for(const sz of [-.36,.36]){
    F.box(sx,0,sz,.08,.34,.08,0,F.col('darkcedar'),'wood');
   }
   F.box(0,.28,0,1.78,.08,.82,0,F.col('cedar'),'wood');
   F.pillow(0,.42,0,1.68,.1,.74,0,F.col('hemp'),'reed');
   F.bolster(-.66,.53,0,.66,.09,Math.PI/2,F.col('silkSaffron'),'linen');
   F.box(-.84,.36,0,.06,.32,.8,0,F.col('darkcedar'),'wood');
  }});

 /* 14. Coopered Cedar & Iron-Hooped Mujinzo Grain Tun */
 klDefFurn({key:'kulanewa_grain_bin',name:'Iron-Hooped Cedar Mujinzo Grain Tun',type:'storage',job:'warehousing',
  setting:'both',rooms:['storage','shop','yard','hall'],w:0.92,d:0.92,h:1.16,materials:['timber','metal','food'],task:['storage'],
  build(F){
   F.cyl(0,0,0,.4,.08,0,F.col('sootstone'),'stone');
   F.cyl(0,.08,0,.38,.96,0,F.col('cedar'),'wood');
   for(const y of [.2,.54,.86]){
    F.cyl(0,y,0,.405,.055,0,F.col('iron'),'metal');
   }
   F.cyl(0,1.04,0,.34,.06,0,F.col('amber'),'food');
  }});

 /* 15. Tall Iron & Cast-Bronze Wharf / Cloister Cresset Lantern */
 klDefFurn({key:'kulanewa_oil_cresset',name:'Iron and Bronze Wharf Cresset Lantern',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','shrine','yard','street'],w:0.56,d:0.56,h:1.92,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.1,0,F.col('sootstone'),'stone');
   F.cyl(0,.1,0,.11,.08,0,F.col('iron'),'metal');
   F.cyl(0,.18,0,.036,1.3,0,F.col('darkcedar'),'wood');
   F.cyl(0,1.48,0,.15,.05,0,F.col('bronze'),'bronze');
   F.cyl(0,1.53,0,.1,.19,0,F.col('flameGlow'),'glow');
   F.cone(0,1.72,0,.17,.18,0,F.col('bronze'),'bronze');
   F.lamp(0,1.62,0,1.05,8);
  }});
})();
