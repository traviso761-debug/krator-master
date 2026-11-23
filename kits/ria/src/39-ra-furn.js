// ================================================================= BESPOKE RIA DYNASTY FURNITURE (registered on KratorFurniture)
// Registers culture 'ria' palette and 14 bespoke Lower Ria (Riwa-Toka) & Upper Ria (Liwa-Toga) dynastic pieces onto
// KratorFurniture (38-furniture-bundle.js). Every part names a palette colour and explicit material family so 91f-furnish.js
// (svfDetail) attaches packed f_* library detail maps onto 100% of furniture meshes with zero coplanar faces.
(function(){
 const KF=KratorFurniture;
 const PAL={
  cobalt:0x1c4a8c,emerald:0x247a66,saffron:0xdca030,celadon:0x5ea68a,terracotta:0xc25836,
  dolomite:0xeee7d8,porphyry:0x7e2b2a,alabaster:0xf6f2ea,
  teak:0x523422,teakWarm:0x744c32,crimson:0xb4241c,ebony:0x261d1a,
  gold:0xe6bc44,bronze:0xa87c40,silver:0xd8dde2,lodestone:0x2a2e36,
  silkSaffron:0xeaa828,silkCrimson:0xb82428,silkIndigo:0x2c4a82,silkIvory:0xf4eee0,
  ropeGold:0xd2b058,flameGlow:0xffc864
 };
 KF.FPAL.ria=Object.assign(KF.FPAL.ria||{},PAL);
 function raDefFurn(o){
  o.culture=o.culture||'ria';
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
 KF.def=raDefFurn;

 /* 1. Chakri-Babylon Gilded Prasat Sovereign Throne Dais */
 raDefFurn({key:'ria_sovereign_throne',name:'Sovereign Prasat Gilded Throne',type:'seating',tier:'court',
  setting:'indoor',rooms:['hall','shrine'],w:1.85,d:1.35,h:2.35,materials:['stone','timber','metal','cloth'],task:['socializing'],
  build(F){
   F.box(0,0,0,1.78,.18,1.28,0,F.col('cobalt'),'tile');
   F.box(0,.18,0,1.56,.16,1.08,0,F.col('porphyry'),'stone');
   F.box(0,.34,0,1.32,.44,.88,0,F.col('gold'),'gold');
   F.pillow(0,.84,.04,1.16,.11,.74,0,F.col('silkCrimson'),'silk');
   for(const sx of [-.56,.56]){
    F.box(sx,.78,.02,.12,.36,.72,0,F.col('crimson'),'lacquer');
    F.cone(sx,1.14,.34,.08,.24,0,F.col('gold'),'gold');
   }
   F.box(0,.78,-.38,1.22,1.02,.1,0,F.col('crimson'),'lacquer');
   F.box(0,.9,-.31,.98,.78,.03,0,F.col('gold'),'gold');
   F.cone(0,1.8,-.38,.36,.52,0,F.col('gold'),'gold');
  }});

 /* 2. Five-Headed Uktena Gilt-Bronze Ceremonial Brazier */
 raDefFurn({key:'ria_uktena_brazier',name:'Uktena Five-Serpent Bronze Brazier',type:'brazier',tier:'court',
  setting:'both',rooms:['hall','shrine','yard'],w:0.92,d:0.92,h:1.28,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.42,.14,0,F.col('dolomite'),'stone');
   F.cyl(0,.14,0,.32,.12,0,F.col('cobalt'),'tile');
   F.cyl(0,.26,0,.16,.52,0,F.col('bronze'),'bronze');
   F.cyl(0,.78,0,.38,.18,0,F.col('gold'),'gold');
   F.cyl(0,.96,0,.29,.04,0,F.col('flameGlow'),'glow');
   for(let i=0;i<5;i++){
    const a=(i-2)*.38;
    F.cone(Math.sin(a)*.32,.94,Math.cos(a)*.32,.055,.26,0,F.col('gold'),'gold');
   }
   F.lamp(0,1.04,0,1.15,9);
  }});

 /* 3. Silver-Bronze Hongsa Crested Water-Swan Treaty Lectern */
 raDefFurn({key:'ria_hongsa_lectern',name:'Hongsa Silver-Bronze Treaty Lectern',type:'workstation',tier:'court',
  setting:'both',rooms:['hall','study','shrine'],w:0.95,d:0.75,h:1.42,materials:['stone','metal','timber'],task:[],
  build(F){
   F.box(0,0,0,.84,.14,.64,0,F.col('porphyry'),'stone');
   F.box(0,.14,0,.68,.12,.48,0,F.col('dolomite'),'stone');
   F.cyl(0,.26,0,.12,.72,0,F.col('silver'),'pewter');
   F.ell(0,.78,.06,.22,.16,.28,0,F.col('silver'),'pewter');
   F.cone(0,1.02,.24,.07,.28,0,F.col('silver'),'pewter');
   F.box(0,1.06,-.04,.78,.06,.52,0,F.col('teak'),'wood');
   F.box(0,1.125,-.04,.64,.025,.38,0,F.col('silkIvory'),'paper');
  }});

 /* 4. Carved Dark-Teak & Brocade Raised Day-Divan */
 raDefFurn({key:'ria_teak_divan',name:'Carved Teak and Brocade Divan',type:'bed',tier:'common',
  setting:'both',rooms:['bedroom','hall','parlour'],w:1.92,d:0.96,h:0.86,materials:['timber','cloth','metal'],task:['sleeping','resting'],
  build(F){
   for(const sx of [-.84,.84])for(const sz of [-.38,.38]){
    F.box(sx,0,sz,.1,.34,.1,0,F.col('teak'),'wood');
   }
   F.box(0,.3,0,1.84,.12,.88,0,F.col('teakWarm'),'wood');
   F.pillow(0,.48,0,1.72,.12,.78,0,F.col('silkSaffron'),'silk');
   F.bolster(-.68,.6,0,.72,.1,Math.PI/2,F.col('silkCrimson'),'silk');
   F.bolster(.68,.6,0,.72,.1,Math.PI/2,F.col('silkCrimson'),'silk');
   F.box(0,.42,-.42,1.82,.36,.07,0,F.col('teak'),'wood');
   F.box(0,.78,-.42,1.86,.05,.09,0,F.col('gold'),'gold');
  }});

 /* 5. Imperial Red-Porphyry & Dolomite Feast Table */
 raDefFurn({key:'ria_porphyry_table',name:'Imperial Porphyry and Dolomite Table',type:'table',tier:'common',
  setting:'both',rooms:['hall','parlour','study'],w:1.75,d:0.92,h:0.76,materials:['stone','metal','ceramic'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.64,.64]){
    F.box(sx,0,0,.22,.1,.68,0,F.col('dolomite'),'stone');
    F.box(sx,.1,0,.16,.56,.52,0,F.col('porphyry'),'stone');
   }
   F.box(0,.66,0,1.72,.08,.88,0,F.col('porphyry'),'stone');
   F.box(0,.62,0,1.58,.04,.76,0,F.col('gold'),'gold');
   F.cyl(-.36,.745,-.08,.11,.05,0,F.col('celadon'),'ceramic');
   F.cyl(.32,.745,.08,.09,.14,0,F.col('gold'),'gold');
  }});

 /* 6. Stepped Lotus-Pedestal & Gilded Shrine Altar */
 raDefFurn({key:'ria_lotus_altar',name:'Stepped Lotus Gilded Shrine Altar',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['shrine','hall','yard'],w:1.45,d:0.95,h:1.88,materials:['stone','metal','emissive'],task:['praying'],
  build(F){
   F.box(0,0,0,1.38,.18,.88,0,F.col('dolomite'),'stone');
   F.box(0,.18,0,1.18,.22,.72,0,F.col('porphyry'),'stone');
   F.box(0,.4,0,1.26,.12,.78,0,F.col('gold'),'gold');
   F.cyl(0,.52,0,.32,.18,0,F.col('alabaster'),'stone');
   F.cyl(0,.7,0,.24,.56,0,F.col('gold'),'gold');
   F.cone(0,1.26,0,.2,.58,0,F.col('gold'),'gold');
   for(const sx of [-.46,.46]){
    F.cyl(sx,.52,.18,.07,.22,0,F.col('bronze'),'bronze');
    F.ell(sx,.785,.18,.045,.045,.045,0,F.col('flameGlow'),'glow');
   }
   F.lamp(0,1.0,0,.95,7);
  }});

 /* 7. 64-Sign Amber-Seal Scribe & Chancellery Desk */
 raDefFurn({key:'ria_amber_seal_desk',name:'Amber-Seal Chancellery Scribe Desk',type:'table',job:'scribing',
  setting:'indoor',rooms:['study','hall','shop'],w:1.42,d:0.78,h:0.86,materials:['timber','metal','cloth'],task:[],
  build(F){
   for(const sx of [-.58,.58])for(const sz of [-.3,.3]){
    F.box(sx,0,sz,.09,.72,.09,0,F.col('teak'),'wood');
   }
   F.box(0,.58,0,1.26,.14,.66,0,F.col('crimson'),'lacquer');
   F.box(0,.72,0,1.38,.06,.76,0,F.col('teakWarm'),'wood');
   F.box(-.36,.785,-.18,.34,.08,.22,0,F.col('gold'),'gold');
   F.box(.14,.785,.04,.46,.02,.34,0,F.col('silkIvory'),'paper');
   F.cyl(.48,.785,-.14,.055,.1,0,F.col('saffron'),'stone');
  }});

 /* 8. Glazed-CeramicCobalt & Celadon Amphora Storage Rack */
 raDefFurn({key:'ria_glazed_amphora_rack',name:'Cobalt and Celadon Amphora Rack',type:'storage',job:'trading',
  setting:'both',rooms:['storage','shop','yard'],w:1.48,d:0.62,h:1.56,materials:['timber','ceramic'],task:['storage'],
  build(F){
   for(const sx of [-.64,.64])for(const sz of [-.24,.24]){
    F.box(sx,0,sz,.08,1.48,.08,0,F.col('teak'),'wood');
   }
   for(const y of [.18,.82]){
    F.box(0,y,0,1.38,.06,.54,0,F.col('teakWarm'),'wood');
    for(let i=-1;i<=1;i++){
     const c=i===0?F.col('cobalt'):i<0?F.col('celadon'):F.col('saffron');
     F.cyl(i*.4,y+.065,0,.14,.42,0,c,'ceramic');
     F.cyl(i*.4,y+.485,0,.07,.1,0,F.col('gold'),'bronze');
    }
   }
  }});

 /* 9. Saffron & Indigo Silk Floor Cushion */
 raDefFurn({key:'ria_saffron_cushion',name:'Ria Brocade Floor Cushion',type:'seating',tier:'common',
  setting:'both',rooms:['hall','parlour','shrine','bedroom'],variants:3,variantNames:['saffron','crimson','indigo'],
  w:0.68,d:0.68,h:0.19,materials:['timber','cloth','metal'],task:['resting','socializing'],
  build(F){
   const c=F.variant===0?F.col('silkSaffron'):F.variant===1?F.col('silkCrimson'):F.col('silkIndigo');
   F.box(0,0,0,.62,.045,.62,0,F.col('teak'),'wood');
   F.pillow(0,.11,0,.64,.13,.64,0,c,'silk');
   F.cyl(0,.18,0,.05,.014,0,F.col('gold'),'gold');
  }});

 /* 10. Three-Leaf Gilded Teak & Brocade Folding Screen */
 raDefFurn({key:'ria_silk_screen',name:'Gilded Teak and Brocade Screen',type:'screen',tier:'court',
  setting:'indoor',rooms:['hall','bedroom','study'],w:1.74,d:0.34,h:1.78,materials:['timber','cloth','metal'],task:[],
  build(F){
   for(let i=-1;i<=1;i++){
    const ry=i===0?0:i*.22,zz=i===0?-.04:.03;
    F.box(i*.54,0,zz,.52,.08,.16,ry,F.col('teak'),'wood');
    F.box(i*.54,.08,zz,.5,1.58,.055,ry,F.col('crimson'),'lacquer');
    F.box(i*.54,.18,zz+.032,.38,1.36,.02,ry,F.col('silkSaffron'),'silk');
    F.box(i*.54,1.66,zz,.52,.06,.075,ry,F.col('gold'),'gold');
   }
  }});

 /* 11. Compass-Hills Lodestone Geomantic Pedestal */
 raDefFurn({key:'ria_lodestone_compass',name:'Compass-Hills Lodestone Geomantic Stand',type:'workstation',tier:'court',
  setting:'both',rooms:['hall','study','shrine','yard'],w:0.86,d:0.86,h:1.34,materials:['stone','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.38,.16,0,F.col('porphyry'),'stone');
   F.cyl(0,.16,0,.28,.64,0,F.col('dolomite'),'stone');
   F.cyl(0,.8,0,.36,.08,0,F.col('silver'),'pewter');
   F.cyl(0,.88,0,.28,.04,0,F.col('gold'),'gold');
   F.ell(0,1.06,0,.14,.14,.14,0,F.col('lodestone'),'obsidian');
   F.rod(-.22,1.06,0,.22,1.06,0,.02,F.col('silver'),'pewter');
  }});

 /* 12. Bronze-Bound Teak & Crimson River-Tribute Chest */
 raDefFurn({key:'ria_tribute_chest',name:'Bronze-Bound River-Tribute Chest',type:'storage',tier:'common',
  setting:'both',rooms:['hall','storage','shop','bedroom'],w:1.32,d:0.66,h:0.74,materials:['timber','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.26,.09,.6,0,F.col('teak'),'wood');
   F.box(0,.09,0,1.22,.48,.56,0,F.col('crimson'),'lacquer');
   F.box(0,.57,0,1.28,.1,.62,0,F.col('teakWarm'),'wood');
   for(const sx of [-.44,0,.44])F.box(sx,.095,0,.06,.58,.585,0,F.col('gold'),'gold');
  }});

 /* 13. Tall Gilded Prasat Oil-Lantern Stand */
 raDefFurn({key:'ria_lantern_stand',name:'Gilded Prasat Lantern Stand',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','shrine','yard','street'],w:0.56,d:0.56,h:1.96,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.1,0,F.col('dolomite'),'stone');
   F.cyl(0,.1,0,.12,.08,0,F.col('bronze'),'bronze');
   F.cyl(0,.18,0,.036,1.32,0,F.col('teak'),'wood');
   F.cyl(0,1.5,0,.14,.05,0,F.col('gold'),'gold');
   F.cyl(0,1.55,0,.1,.2,0,F.col('flameGlow'),'glow');
   F.cone(0,1.75,0,.16,.2,0,F.col('gold'),'gold');
   F.lamp(0,1.64,0,1.05,8);
  }});

 /* 14. Carved Dolomite & Celadon Lotus Ablution Basin */
 raDefFurn({key:'ria_offering_basin',name:'Carved Lotus Ablution Basin',type:'vessel',tier:'common',
  setting:'both',rooms:['yard','shrine','hall'],w:1.05,d:1.05,h:0.92,surface:false,materials:['stone','ceramic','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.44,.16,0,F.col('porphyry'),'stone');
   F.cyl(0,.16,0,.22,.44,0,F.col('dolomite'),'stone');
   F.cyl(0,.6,0,.48,.22,0,F.col('alabaster'),'stone');
   F.cyl(0,.82,0,.41,.035,0,F.col('celadon'),'ceramic');
   F.cyl(0,.855,0,.09,.06,0,F.col('gold'),'gold');
  }});
})();
