// ================================================================= BESPOKE HAYRANT HIGHLAND FURNITURE (registered on KratorFurniture)
// Registers culture 'hayrant' palette and 12 bespoke Western Outer Wall clan & vassal pieces onto KratorFurniture
// (38-furniture-bundle.js), alongside the shared eternian, generic, generic-goods, jobs, scrap and arms sets.
// Every part uses explicit material family names so core/engine/91f-furnish.js (svfDetail) binds packed f_* library detail maps,
// and adjacent vertical/horizontal parts step cleanly by >= 1 cm so zero coplanar faces ever overlap.
(function(){
 const KF=KratorFurniture;
 const PAL={
  basalt:0x3a3e44,basaltDark:0x282b30,loess:0xc6ae82,lime:0xe8e0ce,
  larch:0x8a4e34,larchDark:0x563020,tarwood:0x2b2521,willowWhite:0xede6d4,
  nephrite:0x287e58,jadeBright:0x38a272,celadon:0x88b49c,kaenTerra:0xb65a36,porcelain:0xeeeae2,
  whalebone:0xe8e1cf,bronze:0x9c7a3c,gold:0xd8b24a,iron:0x3c3834,
  plaidRed:0x94322a,plaidDark:0x2a2426,yakFur:0x584638,hempRope:0xb69862,nitreWhite:0xe6e4dc,
  emberGlow:0xff7224,lampGlow:0xffbe62
 };
 KF.FPAL['hayrant']=Object.assign(KF.FPAL['hayrant']||{},PAL);
 function hyDefFurn(o){
  o.culture=o.culture||'hayrant';
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

 /* 1. Sunken-curb basalt & fur-larch irori hearth with suspended iron tea/stew kettle & fish/garlic smoke-frame */
 hyDefFurn({key:'hayrant_irori_hearth',name:'Basalt and Larch Irori Hearth',type:'hearth',tier:'common',
  setting:'both',rooms:['hall','kitchen','tavern'],w:1.48,d:1.48,h:1.36,materials:['stone','timber','metal','emissive'],task:['cooking','socializing'],
  build(F){
   F.box(0,0,0,1.42,.16,1.42,0,F.col('basaltDark'),'stone');
   F.box(0,.16,0,1.22,.1,1.22,0,F.col('larchDark'),'wood');
   F.box(0,.26,0,.92,.04,.92,0,F.col('emberGlow'),'glow');
   for(const sx of [-.54,.54]){
    F.box(sx,.26,0,.09,1.02,.09,0,F.col('larch'),'wood');
   }
   F.box(0,1.28,0,1.28,.08,.11,0,F.col('larchDark'),'wood');
   F.rod(0,.68,0,0,1.28,0,.014,F.col('iron'),'metal');
   F.cyl(0,.46,0,.21,.22,0,F.col('iron'),'metal');
   F.cyl(0,.68,0,.23,.035,0,F.col('bronze'),'bronze');
   F.lamp(0,.44,0,1.2,8);
  }});

 /* 2. Carved larch & bronze rack suspending 5 tuned emerald-nephrite seismic rockfall/avalanche chime-slabs */
 hyDefFurn({key:'hayrant_seismic_chime_rack',name:'Nephrite Seismic Chime Rack',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['shrine','hall','office','yard'],w:1.38,d:0.46,h:1.72,materials:['stone','timber','jade','metal'],task:['praying'],
  build(F){
   for(const sx of [-.54,.54]){
    F.box(sx,0,0,.18,.12,.4,0,F.col('basalt'),'stone');
    F.box(sx,.12,0,.085,1.48,.09,0,F.col('larch'),'wood');
   }
   F.box(0,1.6,0,1.32,.09,.13,0,F.col('bronze'),'bronze');
   F.box(0,.28,0,.98,.055,.075,0,F.col('larchDark'),'wood');
   for(let i=-2;i<=2;i++){
    const x=i*.21,hSlab=.64-Math.abs(i)*.075,yTop=1.48;
    F.rod(x,yTop,0,x,1.6,0,.008,F.col('hempRope'),'rope');
    F.box(x,yTop-hSlab,0,.125,hSlab,.034,0,i%2===0?F.col('nephrite'):F.col('jadeBright'),'jade');
   }
  }});

 /* 3. Hybrid Hayrant-Eternian household shrine: closed-eye bronze/terracotta ancestor mask + shaved-willow inau wands + celadon cup */
 hyDefFurn({key:'hayrant_inau_ancestor_shelf',name:'Ancestor Mask and Willow Inau Shrine',type:'shrine',tier:'common',
  setting:'indoor',rooms:['hall','shrine','bedroom'],variants:2,variantNames:['bronze-court','kaen-clan'],
  w:1.16,d:0.52,h:1.56,materials:['stone','timber','metal','ceramic'],task:['praying'],
  build(F){
   F.box(0,0,0,1.1,.14,.48,0,F.col('basaltDark'),'stone');
   F.box(0,.14,0,1.02,.64,.42,0,F.col('larchDark'),'wood');
   F.box(0,.78,0,1.14,.07,.48,0,F.col('larch'),'wood');
   /* Back stele & closed-eye ancestor head block */
   F.box(0,.85,-.14,.56,.62,.08,0,F.col('basalt'),'stone');
   F.box(0,.96,-.04,.24,.34,.12,0,F.variant===0?F.col('bronze'):F.col('kaenTerra'),F.variant===0?'bronze':'clay');
   F.box(0,1.3,-.04,.28,.06,.14,0,F.col('celadon'),'ceramic');
   /* Twin Ainu-style shaved-willow inau ritual wands flanking the ancestor */
   for(const sx of [-.38,.38]){
    F.cyl(sx,.85,.04,.05,.08,0,F.col('kaenTerra'),'clay');
    F.rod(sx,.93,.04,sx,1.42,.04,.016,F.col('willowWhite'),'wood');
    F.cone(sx,1.24,.04,.075,.2,0,F.col('willowWhite'),'cloth');
   }
   F.cyl(0,.85,.12,.09,.09,0,F.col('celadon'),'ceramic');
  }});

 /* 4. Upright fur-larch & nephrite-weighted loom weaving cave-madder red and birch-tar black Hayrant plaid */
 hyDefFurn({key:'hayrant_plaid_loom',name:'Cave-Madder Highland Plaid Loom',type:'loom',job:'weaving',tier:'common',
  setting:'indoor',rooms:['workshop','hall'],w:1.36,d:0.68,h:1.84,materials:['stone','timber','cloth','jade'],task:[],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,.16,.13,.1,.46,0,F.col('basalt'),'stone');
    F.beam(sx,.1,.22,sx,1.74,-.12,.08,.08,F.col('larch'),'wood');
   }
   F.box(0,1.74,-.12,1.3,.08,.11,0,F.col('larchDark'),'wood');
   F.box(0,1.18,-.02,.94,.86,.028,0,F.col('plaidRed'),'cloth');
   F.box(0,1.18,.012,.94,.16,.016,0,F.col('plaidDark'),'cloth');
   for(let i=-2;i<=2;i++){
    F.rod(i*.19,.4,.06,i*.19,.75,.02,.007,F.col('hempRope'),'rope');
    F.box(i*.19,.26,.06,.075,.14,.048,0,F.col('nephrite'),'jade');
   }
  }});

 /* 5. Sculptural Jomon kaen-doki flame-rimmed storage jar (sooty terracotta or celadon-glazed) */
 hyDefFurn({key:'hayrant_kaen_jar',name:'Kaen-Doki Highland Grain and Beer Jar',type:'vessel',tier:'common',
  setting:'both',rooms:['kitchen','storage','hall','shop','tavern'],variants:2,variantNames:['cord-marked','celadon-rim'],
  w:0.66,d:0.66,h:0.94,materials:['stone','ceramic'],task:['storage'],
  build(F){
   const rc=F.variant===0?F.col('kaenTerra'):F.col('celadon');
   F.cyl(0,0,0,.25,.1,0,F.col('basaltDark'),'stone');
   F.cyl(0,.1,0,.18,.26,0,F.col('kaenTerra'),'clay');
   F.cyl(0,.36,0,.26,.32,0,F.col('kaenTerra'),'clay');
   F.cyl(0,.68,0,.28,.08,0,rc,'ceramic');
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4;
    F.box(Math.cos(a)*.24,.76,Math.sin(a)*.24,.075,.15,.11,a,rc,'ceramic');
   }
   F.cyl(0,.76,0,.19,.04,0,F.col('larchDark'),'wood');
  }});

 /* 6. Mirabilis saltpeter (b=200) cave-earth leaching tub with white nitre crystal crust & bronze spigot */
 hyDefFurn({key:'hayrant_saltpeter_vat',name:'Mirabilis Saltpeter Leaching Vat',type:'workstation',job:'alchemy',tier:'common',
  setting:'both',rooms:['workshop','yard'],w:1.32,d:1.32,h:1.06,materials:['stone','timber','metal'],task:[],
  build(F){
   F.cyl(0,0,0,.6,.22,0,F.col('basalt'),'stone');
   F.cyl(0,.22,0,.54,.62,0,F.col('tarwood'),'wood');
   F.cyl(0,.44,0,.56,.045,0,F.col('iron'),'metal');
   F.cyl(0,.72,0,.56,.045,0,F.col('iron'),'metal');
   F.cyl(0,.84,0,.48,.05,0,F.col('nitreWhite'),'stone');
   F.rod(0,.32,.52,0,.32,.66,.028,F.col('bronze'),'bronze');
  }});

 /* 7. Adzed fur-larch low feast table inlaid with emerald-nephrite stringing */
 hyDefFurn({key:'hayrant_larch_feast_table',name:'Fur-Larch and Nephrite Feast Table',type:'table',tier:'common',
  setting:'both',rooms:['hall','parlour','tavern','office'],w:1.6,d:0.78,h:0.54,materials:['stone','timber','jade','ceramic'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.6,.6]){
    F.box(sx,0,0,.17,.4,.62,0,F.col('basalt'),'stone');
   }
   F.box(0,.4,0,1.54,.09,.74,0,F.col('larch'),'wood');
   F.box(0,.49,0,.96,.024,.22,0,F.col('nephrite'),'jade');
   for(const sx of [-.48,.48])F.cyl(sx,.49,0,.085,.05,0,F.col('celadon'),'ceramic');
  }});

 /* 8. Thick winter yak & mountain-sheep fleece floor mat bordered with cave-madder plaid */
 hyDefFurn({key:'hayrant_yak_pelt_mat',name:'Yak-Fleece and Madder-Plaid Mat',type:'seating',tier:'poor',
  setting:'indoor',rooms:['hall','bedroom','parlour'],variants:2,variantNames:['yak-fleece','madder-plaid'],
  w:0.92,d:0.76,h:0.14,materials:['cloth','hide'],task:['resting','socializing'],
  build(F){
   F.box(0,0,0,.88,.035,.72,0,F.col('plaidRed'),'cloth');
   F.pillow(0,.085,0,.78,.095,.62,0,F.variant===0?F.col('yakFur'):F.col('loess'),'hide');
  }});

 /* 9. Fur-larch & steamed-cruck sleeping bunk with yak-pelt bedding & closed-eye headboard medallion */
 hyDefFurn({key:'hayrant_larch_cruck_bed',name:'Larch Cruck and Yak-Pelt Bunk',type:'bed',tier:'common',
  setting:'indoor',rooms:['bedroom','hall'],w:1.16,d:1.94,h:0.88,materials:['timber','hide','jade'],task:['sleeping'],
  build(F){
   for(const sx of [-.48,.48])for(const sz of [-.84,.84]){
    F.box(sx,0,sz,.1,.36,.1,0,F.col('larchDark'),'wood');
   }
   F.box(0,.36,0,1.08,.08,1.84,0,F.col('larch'),'wood');
   F.pillow(0,.51,0,.98,.13,1.72,0,F.col('yakFur'),'hide');
   F.bolster(0,.63,-.68,.82,.095,0,F.col('plaidRed'),'cloth');
   F.box(0,.44,-.88,1.04,.42,.07,0,F.col('larchDark'),'wood');
   F.box(0,.62,-.83,.2,.2,.03,0,F.col('nephrite'),'jade');
  }});

 /* 10. Kiln-master's rack of celadon & white high-voltage porcelain electrical insulators (Mirabilis specialty) */
 hyDefFurn({key:'hayrant_insulator_rack',name:'High-Voltage Porcelain Insulator Rack',type:'rack',job:'pottery',tier:'common',
  setting:'both',rooms:['workshop','storage','yard'],w:1.34,d:0.54,h:1.62,materials:['timber','ceramic','metal'],task:['storage'],
  build(F){
   for(const sx of [-.56,.56])for(const sz of [-.2,.2]){
    F.box(sx,0,sz,.08,1.54,.08,0,F.col('larchDark'),'wood');
   }
   for(const sy of [.36,.88,1.38]){
    F.box(0,sy,0,1.26,.055,.46,0,F.col('larch'),'wood');
    for(let i=-2;i<=2;i++){
     const c=i%2===0?F.col('porcelain'):F.col('celadon');
     F.cyl(i*.22,sy+.055,0,.075,.07,0,c,'ceramic');
     F.cyl(i*.22,sy+.125,0,.055,.06,0,c,'ceramic');
     F.cyl(i*.22,sy+.185,0,.07,.05,0,c,'ceramic');
    }
   }
  }});

 /* 11. Battered basalt & emerald-nephrite yukimi snow-lantern with celadon hex-cap */
 hyDefFurn({key:'hayrant_jade_lantern_post',name:'Basalt and Nephrite Snow-Lantern',type:'lamp',tier:'common',
  setting:'outdoor',rooms:['street','yard','shrine'],w:0.64,d:0.64,h:1.66,materials:['stone','jade','ceramic','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.28,.16,0,F.col('basaltDark'),'stone');
   F.cyl(0,.16,0,.11,.88,0,F.col('basalt'),'stone');
   F.cyl(0,1.04,0,.22,.08,0,F.col('basaltDark'),'stone');
   F.cyl(0,1.12,0,.15,.26,0,F.col('jadeBright'),'jade');
   F.cyl(0,1.16,0,.09,.18,0,F.col('lampGlow'),'glow');
   F.cone(0,1.38,0,.32,.26,0,F.col('celadon'),'ceramic');
   F.lamp(0,1.24,0,1.3,10);
  }});

 /* 12. Quartz-sand pendulum nephrite wire-saw & stone-dressing bench (shared Hueru-Kuran cousin craft) */
 hyDefFurn({key:'hayrant_nephrite_saw_bench',name:'Nephrite Pendulum Wire-Saw Bench',type:'workstation',job:'masonry',tier:'common',
  setting:'both',rooms:['workshop','yard'],w:1.54,d:0.88,h:1.48,materials:['stone','timber','jade','metal'],task:[],
  build(F){
   for(const sx of [-.62,.62])for(const sz of [-.32,.32]){
    F.box(sx,0,sz,.11,.66,.11,0,F.col('larchDark'),'wood');
   }
   F.box(0,.66,0,1.44,.1,.78,0,F.col('basalt'),'stone');
   F.box(-.05,.76,0,.6,.32,.42,0,F.col('nephrite'),'jade');
   F.box(.33,.76,.03,.15,.26,.36,.06,F.col('jadeBright'),'jade');
   for(const sx of [-.62,.62])F.box(sx,.76,-.3,.085,.64,.085,0,F.col('larch'),'wood');
   F.box(0,1.4,-.3,1.38,.07,.09,0,F.col('larchDark'),'wood');
   F.rod(-.48,.94,0,.48,.94,0,.009,F.col('bronze'),'bronze');
  }});
})();
