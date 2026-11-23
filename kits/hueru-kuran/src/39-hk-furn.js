// ================================================================= BESPOKE HUERU-KURAN FURNITURE (registered on KratorFurniture)
// Registers culture 'hueru-kuran' palette and 14 bespoke Whale-Clan pieces onto KratorFurniture (38-furniture-bundle.js),
// alongside the shared generic, generic-goods and jobs pieces. Every part uses palette keys and an explicit material family so
// core/engine/91f-furnish.js (svfDetail) binds packed f_* library detail maps onto 100% of furniture meshes, and adjacent parts
// step cleanly by >= 1 cm with zero coplanar overlap.
(function(){
 const KF=KratorFurniture;
 const PAL={
  basalt:0x3a3e44,basaltDark:0x282b30,whalebone:0xe8e1cf,whaleboneAged:0xcfc5ae,baleen:0x29272b,ivory:0xf2ecdc,
  nephrite:0x267e56,jadeBright:0x3aa876,cypress:0x8c4c34,cypressDark:0x583020,driftwood:0x9a9080,
  kaenTerra:0xb85834,verdigris:0x488874,bronze:0xa67c40,iron:0x3e3c3a,
  sealHide:0x7e5c40,sealFur:0x564638,gutskin:0xe4d29a,kelpGreen:0x3c5a32,ropeBast:0xb49660,
  oilGlow:0xffb654,emberGlow:0xff6e24,jadeGlow:0x4ce098
 };
 KF.FPAL['hueru-kuran']=Object.assign(KF.FPAL['hueru-kuran']||{},PAL);
 function hkDefFurn(o){
  o.culture=o.culture||'hueru-kuran';
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
 KF.def=hkDefFurn;

 /* 1. Carved basalt whale-oil hearth with whalebone spit-arch & glowing blubber-lamp bowls */
 hkDefFurn({key:'hueru-kuran_whale_oil_hearth',name:'Basalt Whale-Oil Hearth and Spit',type:'hearth',tier:'common',
  setting:'both',rooms:['hall','kitchen','yard'],w:1.45,d:1.45,h:1.18,materials:['stone','bone','metal','emissive'],task:['cooking','socializing'],
  build(F){
   F.cyl(0,0,0,.68,.18,0,F.col('basaltDark'),'stone');
   F.cyl(0,.18,0,.58,.14,0,F.col('basalt'),'stone');
   F.cyl(0,.32,0,.44,.04,0,F.col('emberGlow'),'glow');
   for(const s of [-1,1]){
    F.beam(s*.52,.32,0,s*.16,1.08,0,.07,.07,F.col('whalebone'),'bone');
   }
   F.rod(-.44,.94,0,.44,.94,0,.024,F.col('bronze'),'bronze');
   F.cyl(0,.52,0,.22,.22,0,F.col('kaenTerra'),'clay');
   F.cyl(0,.74,0,.24,.04,0,F.col('verdigris'),'ceramic');
   F.lamp(0,.46,0,1.25,8);
  }});

 /* 2. Red-cypress & whalebone frame suspending 5 graduated sawn emerald-nephrite chime-slabs */
 hkDefFurn({key:'hueru-kuran_nephrite_chime_rack',name:'Tuned Emerald-Nephrite Chime Rack',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['shrine','hall','yard'],w:1.42,d:0.48,h:1.76,materials:['stone','timber','bone','jade'],task:['praying'],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,0,.18,.12,.42,0,F.col('basalt'),'stone');
    F.box(sx,.12,0,.09,1.52,.1,0,F.col('cypress'),'wood');
   }
   F.box(0,1.64,0,1.36,.09,.14,0,F.col('whalebone'),'bone');
   F.box(0,.28,0,1.02,.06,.08,0,F.col('cypressDark'),'wood');
   for(let i=-2;i<=2;i++){
    const x=i*.22,hSlab=.68-Math.abs(i)*.08,yTop=1.52;
    F.rod(x,yTop,0,x,1.64,0,.008,F.col('ropeBast'),'rope');
    F.box(x,yTop-hSlab,0,.13,hSlab,.035,0,i%2===0?F.col('nephrite'):F.col('jadeBright'),'jade');
   }
  }});

 /* 3. Pelagic whale-rib sleeping cot with stitched seal-hide & thick sea-otter pelt mattress */
 hkDefFurn({key:'hueru-kuran_whalebone_cot',name:'Whale-Rib and Seal-Pelt Sleeping Cot',type:'bed',tier:'common',
  setting:'indoor',rooms:['bedroom','hall'],w:1.18,d:1.96,h:0.86,materials:['bone','hide','timber'],task:['sleeping'],
  build(F){
   for(const sx of [-.48,.48])for(const sz of [-.84,.84]){
    F.beam(sx,0,sz,sx*.92,.36,sz,.08,.08,F.col('whalebone'),'bone');
   }
   F.box(0,.34,0,1.06,.08,1.84,0,F.col('cypressDark'),'wood');
   F.pillow(0,.49,0,1.0,.14,1.76,0,F.col('sealFur'),'hide');
   F.bolster(0,.62,-.68,.84,.1,0,F.col('gutskin'),'skin');
   /* Curved whalebone headboard arch at -z */
   for(const sx of [-.46,.46])F.beam(sx,.42,-.88,sx*.32,.82,-.9,.065,.065,F.col('whaleboneAged'),'bone');
   F.box(0,.79,-.9,.36,.06,.07,0,F.col('nephrite'),'jade');
  }});

 /* 4. Quartz-sand slurry & bronze pendulum wire-saw bench slicing an emerald-nephrite block */
 hkDefFurn({key:'hueru-kuran_jade_saw_bench',name:'Nephrite Quartz-Slurry Wire-Saw Bench',type:'workstation',job:'masonry',
  setting:'both',rooms:['workshop','yard'],w:1.58,d:0.92,h:1.52,materials:['stone','timber','metal','jade'],task:[],
  build(F){
   for(const sx of [-.64,.64])for(const sz of [-.34,.34]){
    F.box(sx,0,sz,.12,.68,.12,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.68,0,1.48,.1,.82,0,F.col('basalt'),'stone');
   /* Partially sawn emerald-nephrite boulder on slurry bed */
   F.box(-.06,.78,0,.64,.34,.44,0,F.col('nephrite'),'jade');
   F.box(.34,.78,.04,.16,.28,.38,.08,F.col('jadeBright'),'jade');
   /* Overhead cypress gallows & bronze wire-saw bow */
   for(const sx of [-.64,.64])F.box(sx,.78,-.32,.09,.68,.09,0,F.col('cypress'),'wood');
   F.box(0,1.46,-.32,1.42,.07,.09,0,F.col('cypress'),'wood');
   F.beam(-.52,1.18,0,.52,1.18,0,.045,.045,F.col('whalebone'),'bone');
   F.rod(-.5,.96,0,.5,.96,0,.009,F.col('bronze'),'bronze');
   F.cyl(-.54,.78,.22,.11,.14,0,F.col('kaenTerra'),'clay');
  }});

 /* 5. Sculptural Jomon kaen-doki ("flame-rimmed") terracotta & verdigris storage jar */
 hkDefFurn({key:'hueru-kuran_kaen_storage_jar',name:'Jomon Kaen-Doki Flame-Rim Jar',type:'vessel',tier:'common',
  setting:'both',rooms:['kitchen','storage','hall','shop'],variants:3,variantNames:['whale-oil','ambergris','kelp-brine'],
  w:0.68,d:0.68,h:0.96,materials:['stone','ceramic'],task:['storage'],
  build(F){
   const rimCol=F.variant===0?F.col('kaenTerra'):F.variant===1?F.col('verdigris'):F.col('cypress');
   F.cyl(0,0,0,.26,.1,0,F.col('basaltDark'),'stone');
   F.cyl(0,.1,0,.18,.26,0,F.col('kaenTerra'),'clay');
   F.cyl(0,.36,0,.27,.34,0,F.col('kaenTerra'),'clay');
   F.cyl(0,.7,0,.29,.08,0,rimCol,'ceramic');
   /* Four sculptural Jomon flame-cockscomb projections around rim */
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4;
    F.box(Math.cos(a)*.25,.78,Math.sin(a)*.25,.08,.16,.12,a,F.col('kaenTerra'),'clay');
   }
   F.cyl(0,.78,0,.2,.04,0,F.col('cypressDark'),'wood');
  }});

 /* 6. Basalt furnace ring & riveted bronze whale-blubber rendering kettle */
 hkDefFurn({key:'hueru-kuran_blubber_kettle',name:'Bronze Whale-Blubber Try-Kettle',type:'workstation',job:'oil',
  setting:'both',rooms:['workshop','kitchen','yard'],w:1.26,d:1.26,h:1.08,materials:['stone','metal','emissive'],task:['cooking'],
  build(F){
   F.cyl(0,0,0,.58,.44,0,F.col('basalt'),'stone');
   F.box(0,.08,.54,.28,.24,.12,0,F.col('emberGlow'),'glow');
   F.cyl(0,.44,0,.52,.44,0,F.col('bronze'),'bronze');
   F.cyl(0,.88,0,.55,.06,0,F.col('verdigris'),'bronze');
   F.cyl(0,.94,0,.46,.025,0,F.col('oilGlow'),'glow');
   F.beam(-.38,.97,-.08,.48,1.05,.16,.04,.04,F.col('driftwood'),'plank');
   F.lamp(0,.5,0,1.05,7);
  }});

 /* 7. Upright red-cypress & whalebone warp-weighted baleen-and-bast loom */
 hkDefFurn({key:'hueru-kuran_baleen_loom',name:'Whalebone and Nephrite-Weight Loom',type:'loom',job:'weaving',
  setting:'indoor',rooms:['workshop','hall'],w:1.38,d:0.68,h:1.86,materials:['timber','bone','jade','cloth'],task:[],
  build(F){
   for(const sx of [-.58,.58]){
    F.box(sx,0,.18,.12,.1,.48,0,F.col('basalt'),'stone');
    F.beam(sx,.1,.26,sx,1.78,-.14,.08,.08,F.col('cypress'),'wood');
   }
   F.box(0,1.78,-.14,1.34,.08,.1,0,F.col('whalebone'),'bone');
   F.rod(-.54,1.06,.04,.54,1.06,.04,.03,F.col('baleen'),'bone');
   F.box(0,1.22,-.04,.96,.88,.025,0,F.col('gutskin'),'cloth');
   /* Sawn nephrite warp-weights hanging cleanly along bottom hem */
   for(let i=-2;i<=2;i++){
    F.rod(i*.2,.42,.08,i*.2,.78,.04,.007,F.col('ropeBast'),'rope');
    F.box(i*.2,.28,.08,.08,.14,.05,0,F.col('nephrite'),'jade');
   }
  }});

 /* 8. Whalebone & basalt harpoon, toggle-lance and float rack */
 hkDefFurn({key:'hueru-kuran_harpoon_rack',name:'Whale-Harpoon and Gutskin-Float Rack',type:'rack',job:'fishing',
  setting:'both',rooms:['hall','workshop','storage','yard'],w:1.36,d:0.52,h:1.88,materials:['stone','bone','timber','metal'],task:['storage'],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,0,.16,.12,.44,0,F.col('basaltDark'),'stone');
    F.box(sx,.12,0,.08,1.22,.09,0,F.col('whalebone'),'bone');
   }
   F.box(0,.34,0,1.04,.07,.28,0,F.col('cypressDark'),'wood');
   F.box(0,1.26,0,1.22,.07,.14,0,F.col('cypress'),'wood');
   for(let i=-2;i<=2;i++){
    const x=i*.21;
    F.rod(x,.38,0,x,1.74,0,.018,F.col('cypress'),'wood');
    F.cone(x,1.74,0,.032,.14,0,i%2===0?F.col('bronze'):F.col('iron'),'bronze');
   }
   F.ell(-.32,.48,.14,.12,.09,.16,0,F.col('gutskin'),'skin');
   F.ell(.32,.48,.14,.12,.09,.16,0,F.col('gutskin'),'skin');
  }});

 /* 9. Dugout red-cypress whale-feast trencher table with nephrite inlay */
 hkDefFurn({key:'hueru-kuran_cedar_feast_trough',name:'Red-Cypress and Nephrite Feast Table',type:'table',tier:'common',
  setting:'both',rooms:['hall','parlour','tavern'],w:1.62,d:0.78,h:0.52,materials:['stone','timber','jade','bone'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.62,.62]){
    F.box(sx,0,0,.18,.38,.62,0,F.col('basalt'),'stone');
   }
   F.box(0,.38,0,1.56,.09,.74,0,F.col('cypress'),'wood');
   F.box(0,.47,0,.92,.025,.24,0,F.col('nephrite'),'jade');
   for(const sx of [-.52,.52]){
    F.cyl(sx,.47,0,.1,.045,0,F.col('ivory'),'bone');
   }
  }});

 /* 10. Stitched sea-beast pelt & baleen-edged seating mat */
 hkDefFurn({key:'hueru-kuran_seal_pelt_mat',name:'Stitched Sea-Beast Pelt Mat',type:'seating',tier:'common',
  setting:'both',rooms:['hall','bedroom','parlour'],variants:3,variantNames:['fur-seal','sea-otter','oiled-hide'],
  w:0.86,d:0.72,h:0.15,materials:['hide','jade'],task:['resting','socializing'],
  build(F){
   const c=F.variant===0?F.col('sealFur'):F.variant===1?F.col('sealHide'):F.col('gutskin');
   F.box(0,0,0,.82,.035,.68,0,F.col('baleen'),'bone');
   F.pillow(0,.085,0,.76,.1,.62,0,c,'hide');
   for(const sx of [-.35,.35])for(const sz of [-.27,.27]){
    F.cyl(sx,.035,sz,.035,.03,0,F.col('nephrite'),'jade');
   }
  }});

 /* 11. Columnar-basalt & translucent sawn emerald-nephrite whale-oil standing lamp */
 hkDefFurn({key:'hueru-kuran_jade_lamp_pedestal',name:'Nephrite and Whale-Oil Lamp Pedestal',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','shrine','street','yard'],w:0.52,d:0.52,h:1.58,materials:['stone','jade','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.24,.14,0,F.col('basaltDark'),'stone');
   F.cyl(0,.14,0,.1,.96,0,F.col('basalt'),'stone');
   F.cyl(0,1.1,0,.18,.06,0,F.col('bronze'),'bronze');
   /* Translucent glowing emerald-nephrite lantern cage & whale-oil flame */
   F.box(0,1.16,0,.22,.26,.22,0,F.col('jadeBright'),'jade');
   F.ell(0,1.29,0,.07,.09,.07,0,F.col('oilGlow'),'glow');
   F.cone(0,1.42,0,.19,.14,0,F.col('verdigris'),'bronze');
   F.lamp(0,1.3,0,1.15,8);
  }});

 /* 12. Bronze-strapped driftwood & baleen mariner sea-chest */
 hkDefFurn({key:'hueru-kuran_driftwood_chest',name:'Baleen-Inlaid Driftwood Sea-Chest',type:'storage',tier:'common',
  setting:'both',rooms:['bedroom','storage','shop','hall'],w:1.24,d:0.62,h:0.68,materials:['timber','bone','metal','jade'],task:['storage'],
  build(F){
   F.box(0,0,0,1.2,.08,.58,0,F.col('basaltDark'),'stone');
   F.box(0,.08,0,1.16,.44,.54,0,F.col('driftwood'),'plank');
   F.box(0,.52,0,1.2,.1,.58,0,F.col('cypress'),'wood');
   for(const sx of [-.42,0,.42]){
    F.box(sx,.08,0,.05,.55,.59,0,F.col('bronze'),'bronze');
   }
   F.box(0,.34,.28,.16,.12,.03,0,F.col('nephrite'),'jade');
  }});

 /* 13. Santa Cristina aquifer-drawdown float & nephrite warning-bell plinth */
 hkDefFurn({key:'hueru-kuran_tide_gauge_plinth',name:'Tsunami-Drawdown Aquifer Chime Gauge',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['shrine','yard','study'],w:0.78,d:0.78,h:1.68,materials:['stone','jade','metal','bone'],task:[],
  build(F){
   F.box(0,0,0,.72,.28,.72,0,F.col('basaltDark'),'stone');
   F.cyl(0,.28,0,.26,.34,0,F.col('basalt'),'stone');
   for(const sx of [-.24,.24])F.box(sx,.62,0,.07,.94,.08,0,F.col('whalebone'),'bone');
   F.box(0,1.56,0,.62,.08,.12,0,F.col('bronze'),'bronze');
   F.rod(0,.72,0,0,1.56,0,.01,F.col('ropeBast'),'rope');
   F.cyl(0,.98,0,.12,.28,0,F.col('jadeBright'),'jade');
   F.cyl(0,.64,0,.15,.08,0,F.col('verdigris'),'bronze');
  }});

 /* 14. Steaming red-cypress clamping bench for baleen-laminate whale-bows */
 hkDefFurn({key:'hueru-kuran_baleen_bow_trough',name:'Baleen-Laminate Bow Steaming Bench',type:'workstation',job:'carpentry',
  setting:'both',rooms:['workshop','yard'],w:1.74,d:0.66,h:0.96,materials:['timber','bone','metal'],task:[],
  build(F){
   for(const sx of [-.68,.68])for(const sz of [-.24,.24]){
    F.box(sx,0,sz,.1,.62,.1,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.62,0,1.66,.16,.56,0,F.col('cypress'),'wood');
   /* Recurve baleen-and-ivory composite bow clamped on form */
   F.beam(-.64,.82,-.06,0,.92,.08,.05,.04,F.col('baleen'),'bone');
   F.beam(0,.92,.08,.64,.82,-.06,.05,.04,F.col('baleen'),'bone');
   F.box(0,.78,.08,.14,.12,.14,0,F.col('ivory'),'bone');
   for(const sx of [-.36,.36])F.cyl(sx,.78,0,.035,.14,0,F.col('bronze'),'bronze');
  }});
})();
