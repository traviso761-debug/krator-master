// ================================================================= BESPOKE SPIDER-LAKE FURNITURE (registered on KratorFurniture)
// Registers culture 'spider-lake' palette and 12 bespoke lakeside silk-principality pieces onto KratorFurniture (38-furniture-bundle.js),
// alongside the shared generic, generic-goods and jobs pieces. Every part uses palette keys and an explicit material family so
// core/engine/91f-furnish.js (svfDetail) binds packed f_* library detail maps onto 100% of furniture meshes, and adjacent parts
// step cleanly with zero coplanar overlap.
(function(){
 const KF=KratorFurniture;
 const PAL={
  lacquerRed:0xb4281e,lacquerDark:0x281e1b,cedarWarm:0x8e603e,cedarDark:0x5e3c26,
  dolomite:0xeae2d0,porphyry:0x7c2e2c,bronze:0xa87e42,gold:0xdcb244,jade:0x3e8868,
  celadon:0x82a894,terracotta:0xb45a3a,
  silkIvory:0xf4eee0,silkSaffron:0xe6a628,silkCrimson:0xb22428,silkIndigo:0x28487a,silkTurq:0x2c8c92,silkAmber:0xd89c36,
  cocoonGlow:0xffcf70,ropeGold:0xd2b058,waterDye:0x243e6e
 };
 KF.FPAL['spider-lake']=Object.assign(KF.FPAL['spider-lake']||{},PAL);
 function slDefFurn(o){
  o.culture=o.culture||'spider-lake';
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
 KF.def=slDefFurn;

 /* 1. Copper basin & lacquered cedar A-frame silk-reeling workstation */
 slDefFurn({key:'spider-lake_reeling_frame',name:'Copper Silk-Reeling Frame',type:'workstation',job:'weaving',
  setting:'both',rooms:['workshop','yard'],w:1.3,d:0.9,h:1.55,materials:['timber','metal','stone','cloth'],task:[],
  build(F){
   F.box(0,0,.18,.86,.46,.52,0,F.col('dolomite'),'stone');
   F.cyl(0,.46,.18,.34,.18,0,F.col('bronze'),'bronze');
   F.cyl(0,.64,.18,.29,.03,0,F.col('silkIvory'),'cloth');
   for(const s of [-1,1]){
    F.beam(s*.52,0,-.34,s*.46,1.38,-.16,.07,.07,F.col('cedarWarm'),'wood');
    F.beam(s*.52,0,.12,s*.46,1.38,-.16,.06,.06,F.col('cedarDark'),'wood');
   }
   F.rod(-.54,1.34,-.16,.54,1.34,-.16,.035,F.col('bronze'),'bronze');
   for(const x of [-.28,0,.28]){
    F.cyl(x,1.18,-.16,.18,.08,Math.PI/2,F.col('lacquerRed'),'lacquer');
   }
   F.box(0,1.26,-.16,.76,.14,.18,0,F.col('silkAmber'),'cloth');
   for(const x of [-.24,0,.24])F.rod(x,.67,.16,x,1.24,-.14,.01,F.col('ropeGold'),'rope');
  }});

 /* 2. Vermilion-and-cedar brocade drawloom */
 slDefFurn({key:'spider-lake_drawloom',name:'Principality Brocade Drawloom',type:'loom',job:'weaving',
  setting:'indoor',rooms:['workshop'],w:1.55,d:1.85,h:1.95,materials:['timber','cloth','metal'],task:[],
  build(F){
   for(const sx of [-.66,.66])for(const sz of [-.8,.8]){
    F.box(sx,0,sz,.09,1.82,.09,0,F.col('cedarDark'),'wood');
   }
   for(const sx of [-.66,.66]){
    F.box(sx,1.82,0,.09,.08,1.72,0,F.col('lacquerRed'),'lacquer');
    F.box(sx,.72,0,.07,.07,1.5,0,F.col('cedarWarm'),'wood');
   }
   for(const sz of [-.8,.8])F.box(0,1.74,sz,1.22,.07,.07,0,F.col('cedarWarm'),'wood');
   F.rod(-.62,.78,-.68,.62,.78,-.68,.06,F.col('cedarWarm'),'wood');
   F.rod(-.62,.76,.64,.62,.76,.64,.05,F.col('lacquerRed'),'lacquer');
   F.box(0,.77,-.02,1.08,.025,1.24,0,F.col('silkCrimson'),'cloth');
   F.box(0,.795,.28,1.06,.02,.48,0,F.col('silkSaffron'),'cloth');
   F.box(0,1.32,-.05,1.14,.32,.04,0,F.col('cedarWarm'),'wood');
   F.box(0,.02,.84,.9,.42,.26,0,F.col('cedarDark'),'wood');
  }});

 /* 3. Stepped dolomite & bronze-rimmed silk dye vat */
 slDefFurn({key:'spider-lake_dye_vat',name:'Stepped Stone Silk Dye-Vat',type:'vessel',job:'dyeing',
  setting:'both',rooms:['workshop','yard'],variants:3,variantNames:['crimson','saffron','indigo'],
  w:1.25,d:1.25,h:0.92,surface:false,materials:['stone','metal','cloth'],task:[],
  build(F){
   const dye=F.variant===0?F.col('silkCrimson'):F.variant===1?F.col('silkSaffron'):F.col('silkIndigo');
   F.cyl(0,0,0,.58,.22,0,F.col('dolomite'),'stone');
   F.cyl(0,.22,0,.52,.52,0,F.col('porphyry'),'stone');
   F.cyl(0,.74,0,.55,.08,0,F.col('bronze'),'bronze');
   F.cyl(0,.82,0,.46,.03,0,dye,'cloth');
   F.beam(-.42,.85,-.1,.48,.92,.15,.045,.045,F.col('cedarWarm'),'wood');
   F.box(.12,.56,.49,.28,.32,.06,0,dye,'cloth');
  }});

 /* 4. Cedar & bronze dragline-silk spindle rack */
 slDefFurn({key:'spider-lake_spindle_rack',name:'Dragline-Silk Bobbin Rack',type:'rack',job:'weaving',
  setting:'both',rooms:['workshop','storage'],w:1.35,d:0.48,h:1.62,materials:['timber','metal','cloth'],task:['storage'],
  build(F){
   for(const sx of [-.58,.58]){
    F.box(sx,0,0,.08,.08,.42,0,F.col('cedarDark'),'wood');
    F.box(sx,.08,0,.07,1.48,.09,0,F.col('lacquerDark'),'lacquer');
   }
   for(const y of [.42,.88,1.34]){
    F.rod(-.54,y,0,.54,y,0,.022,F.col('bronze'),'bronze');
    for(let i=-2;i<=2;i++){
     const col=i%2===0?F.col('silkAmber'):i<0?F.col('silkCrimson'):F.col('silkTurq');
     F.cyl(i*.21,y-.11,0,.055,.22,0,col,'cloth');
    }
   }
  }});

 /* 5. Ria-proportioned vermilion & ebony low lacquered table */
 slDefFurn({key:'spider-lake_low_table',name:'Ria Lacquered Low Table',type:'table',tier:'common',
  setting:'both',rooms:['hall','parlour','study'],w:1.35,d:0.75,h:0.44,materials:['timber','metal'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.56,.56])for(const sz of [-.28,.28]){
    F.box(sx,0,sz,.08,.05,.08,0,F.col('bronze'),'bronze');
    F.box(sx,.05,sz,.07,.31,.07,0,F.col('lacquerDark'),'lacquer');
   }
   F.box(0,.32,0,1.22,.04,.62,0,F.col('lacquerDark'),'lacquer');
   F.box(0,.36,0,1.32,.06,.72,0,F.col('lacquerRed'),'lacquer');
   F.cyl(-.28,.42,-.08,.08,.02,0,F.col('celadon'),'ceramic');
   F.cyl(.22,.42,.06,.065,.02,0,F.col('jade'),'jade');
  }});

 /* 6. Tufted brocade & spider-silk floor cushion */
 slDefFurn({key:'spider-lake_silk_cushion',name:'Tufted Silk Floor Cushion',type:'seating',tier:'common',
  setting:'both',rooms:['hall','parlour','bedroom'],variants:3,variantNames:['crimson','saffron','indigo'],
  w:0.68,d:0.68,h:0.18,materials:['cloth'],task:['resting','socializing'],
  build(F){
   const c=F.variant===0?F.col('silkCrimson'):F.variant===1?F.col('silkSaffron'):F.col('silkIndigo');
   F.box(0,0,0,.62,.04,.62,0,F.col('cedarDark'),'wood');
   F.pillow(0,.105,0,.64,.13,.64,0,c,'cloth');
   F.cyl(0,.172,0,.045,.012,0,F.col('gold'),'bronze');
  }});

 /* 7. Bronze & ebony stand with glowing oiled-silk cocoon lantern */
 slDefFurn({key:'spider-lake_cocoon_stand',name:'Oiled-Silk Cocoon Lantern Stand',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','street','yard','shrine'],w:0.55,d:0.55,h:1.88,materials:['metal','timber','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.22,.08,0,F.col('dolomite'),'stone');
   F.cyl(0,.08,0,.09,.06,0,F.col('bronze'),'bronze');
   F.cyl(0,.14,0,.032,1.62,0,F.col('lacquerDark'),'lacquer');
   F.beam(-.02,1.72,0,.24,1.8,0,.04,.04,F.col('bronze'),'bronze');
   F.rod(.22,1.62,0,.22,1.78,0,.008,F.col('ropeGold'),'rope');
   F.ell(.22,1.42,0,.13,.2,.13,0,F.col('cocoonGlow'),'glow');
   F.cyl(.22,1.62,0,.06,.03,0,F.col('bronze'),'bronze');
   F.cyl(.22,1.19,0,.05,.03,0,F.col('bronze'),'bronze');
   F.lamp(.22,1.42,0,1.1,8);
  }});

 /* 8. Resonant Hum aeolian silk-stringed calming harp */
 slDefFurn({key:'spider-lake_hum_harp',name:'Hum Acoustic Silk-String Frame',type:'shrine',job:'worship',tier:'court',
  setting:'both',rooms:['shrine','hall','yard'],w:1.15,d:0.45,h:1.72,materials:['stone','timber','metal'],task:['praying'],
  build(F){
   F.box(0,0,0,1.08,.18,.4,0,F.col('dolomite'),'stone');
   F.box(0,.18,0,.96,.12,.28,0,F.col('porphyry'),'stone');
   for(const sx of [-.42,.42]){
    F.box(sx,.3,0,.08,1.28,.1,0,F.col('lacquerRed'),'lacquer');
   }
   F.box(0,1.58,0,1.06,.1,.14,0,F.col('lacquerDark'),'lacquer');
   F.cyl(0,1.68,0,.09,.04,0,F.col('jade'),'jade');
   for(let i=-3;i<=3;i++)F.rod(i*.1,.31,0,i*.1,1.57,0,.006,F.col('gold'),'bronze');
  }});

 /* 9. Camphor-lined cedar & bronze silk-merchant bolt chest */
 slDefFurn({key:'spider-lake_bolt_chest',name:'Silk-Merchant Bolt Chest',type:'storage',job:'trading',
  setting:'both',rooms:['shop','storage','hall'],w:1.28,d:0.64,h:0.78,materials:['timber','metal','cloth'],task:['storage'],
  build(F){
   F.box(0,0,0,1.22,.08,.58,0,F.col('lacquerDark'),'lacquer');
   F.box(0,.08,0,1.18,.46,.54,0,F.col('cedarWarm'),'wood');
   F.box(0,.54,0,1.22,.06,.58,0,F.col('bronze'),'bronze');
   for(let i=-1;i<=1;i++){
    const c=i<0?F.col('silkCrimson'):i===0?F.col('silkSaffron'):F.col('silkTurq');
    F.bolster(i*.34,.68,0,.3,.09,Math.PI/2,c,'cloth');
   }
  }});

 /* 10. Raised cedar divan bed with spider-silk bolster & canopy frame */
 slDefFurn({key:'spider-lake_sleeping_divan',name:'Canopied Silk Divan Bed',type:'bed',tier:'common',
  setting:'indoor',rooms:['bedroom'],w:1.35,d:2.05,h:1.85,materials:['timber','cloth'],task:['sleeping'],
  build(F){
   for(const sx of [-.58,.58])for(const sz of [-.92,.92]){
    F.box(sx,0,sz,.08,1.76,.08,0,F.col('cedarDark'),'wood');
   }
   F.box(0,.28,0,1.18,.12,1.86,0,F.col('cedarWarm'),'wood');
   F.pillow(0,.46,0,1.12,.12,1.78,0,F.col('silkIvory'),'cloth');
   F.bolster(0,.58,-.72,.92,.1,0,F.col('silkCrimson'),'cloth');
   F.box(0,1.76,0,1.28,.06,1.98,0,F.col('lacquerRed'),'lacquer');
   F.box(0,1.66,.96,1.14,.1,.03,0,F.col('silkSaffron'),'cloth');
  }});

 /* 11. Tripod bronze charcoal tea-brazier with celadon kettle */
 slDefFurn({key:'spider-lake_tea_brazier',name:'Bronze Tripod Tea-Brazier',type:'brazier',tier:'common',
  setting:'both',rooms:['hall','parlour','yard'],w:0.65,d:0.65,h:0.64,materials:['stone','metal','emissive'],task:['socializing'],
  build(F){
   F.cyl(0,0,0,.3,.06,0,F.col('dolomite'),'stone');
   for(let i=0;i<3;i++){
    const a=i*F.TAU/3;
    F.beam(Math.cos(a)*.22,.06,Math.sin(a)*.22,Math.cos(a)*.15,.28,Math.sin(a)*.15,.045,.045,F.col('bronze'),'bronze');
   }
   F.cyl(0,.26,0,.22,.18,0,F.col('bronze'),'bronze');
   F.cyl(0,.44,0,.17,.025,0,F.col('cocoonGlow'),'glow');
   F.dome(0,.47,0,.11,.13,0,F.col('celadon'),'ceramic');
   F.lamp(0,.48,0,.85,6);
  }});

 /* 12. Three-leaf ebony & crimson lacquered standing silk screen */
 slDefFurn({key:'spider-lake_lacquer_screen',name:'Three-Leaf Painted Silk Screen',type:'screen',tier:'court',
  setting:'indoor',rooms:['hall','study','bedroom'],w:1.68,d:0.32,h:1.72,materials:['timber','cloth'],task:[],
  build(F){
   for(let i=-1;i<=1;i++){
    const ry=i===0?0:i*.24,zz=i===0?-.04:.03;
    F.box(i*.52,0,zz,.5,.07,.16,ry,F.col('lacquerDark'),'lacquer');
    F.box(i*.52,.07,zz,.48,1.58,.05,ry,F.col('lacquerRed'),'lacquer');
    F.box(i*.52,.16,zz+.03,.38,1.38,.02,ry,F.col('silkIvory'),'cloth');
    F.box(i*.52,1.65,zz,.5,.05,.07,ry,F.col('bronze'),'bronze');
   }
  }});

 /* 13. Bonded Golden-Cable & Lake-Sheen Gossamer corded silk-bale stack */
 slDefFurn({key:'spider-lake_silk_bales',name:'Bonded Golden-Cable Silk-Bale Stack',type:'storage',job:'trading',
  setting:'both',rooms:['storage','shop','yard'],w:1.45,d:1.05,h:1.16,materials:['timber','cloth','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.38,.09,.96,0,F.col('cedarDark'),'wood');
   for(let i=-1;i<=1;i++){
    const bx=i*.42,bc=i===0?F.col('silkAmber'):i<0?F.col('silkIvory'):F.col('silkSaffron');
    F.box(bx,.09,0,.38,.38,.86,0,bc,'silk');
    F.box(bx,.24,0,.4,.05,.88,0,F.col('ropeGold'),'rope');
    F.box(bx,.28,.445,.1,.08,.025,0,F.col('bronze'),'bronze');
   }
   for(const sx of [-.23,.23]){
    const uc=sx<0?F.col('silkCrimson'):F.col('silkTurq');
    F.box(sx,.48,0,.4,.36,.78,0,uc,'silk');
    F.box(sx,.63,0,.42,.045,.8,0,F.col('ropeGold'),'rope');
   }
   F.bolster(0,.95,0,.76,.1,0,F.col('silkAmber'),'silk');
  }});

 /* 14. Grand Silkhead Bourse bronze & nephrite-jade silk-weighing balance scale */
 slDefFurn({key:'spider-lake_bourse_scale',name:'Grand Bronze & Nephrite Silk Balance',type:'workstation',job:'trading',tier:'court',
  setting:'both',rooms:['shop','hall','yard'],w:1.52,d:0.72,h:1.78,materials:['stone','metal','timber','cloth'],task:[],
  build(F){
   F.box(0,0,0,.86,.16,.58,0,F.col('dolomite'),'stone');
   F.box(0,.16,0,.68,.12,.44,0,F.col('porphyry'),'stone');
   F.cyl(0,.28,0,.075,1.34,0,F.col('lacquerRed'),'lacquer');
   F.cyl(0,.92,0,.095,.08,0,F.col('bronze'),'bronze');
   F.cyl(0,1.62,0,.11,.08,0,F.col('jade'),'jade');
   F.cone(0,1.7,0,.065,.08,0,F.col('gold'),'gold');
   F.rod(-.58,1.58,0,.58,1.58,0,.028,F.col('bronze'),'bronze');
   for(const s of [-1,1]){
    const px=s*.54;
    for(const rz of [-.14,.14])F.rod(px,1.57,0,px+.06*s,.94,rz,.008,F.col('ropeGold'),'rope');
    F.cyl(px+.04*s,.9,0,.22,.04,0,F.col('bronze'),'bronze');
   }
   F.cyl(-.56,.94,0,.08,.12,0,F.col('jade'),'jade');
   F.bolster(.56,.99,0,.24,.065,0,F.col('silkSaffron'),'silk');
  }});

 /* 15. Caravan mule & yak stepped dolomite water-trough with cedar hitching rail */
 slDefFurn({key:'spider-lake_pack_trough',name:'Caravan Dolomite Water-Trough & Hitching Rail',type:'vessel',job:'trading',
  setting:'outdoor',rooms:['yard','stable','street'],w:1.86,d:0.74,h:0.92,surface:false,materials:['stone','timber','metal'],task:[],
  build(F){
   F.box(0,0,.08,1.76,.1,.54,0,F.col('dolomite'),'stone');
   for(const sz of [-.14,.3])F.box(0,.1,sz,1.76,.38,.09,0,F.col('dolomite'),'stone');
   for(const sx of [-.83,.83])F.box(sx,.1,.08,.1,.38,.35,0,F.col('porphyry'),'stone');
   F.box(0,.1,.08,1.54,.31,.34,0,F.col('celadon'),'ceramic');
   for(const sx of [-.78,.78]){
    F.box(sx,0,-.26,.09,.88,.09,0,F.col('cedarDark'),'wood');
    F.cyl(sx,.88,-.26,.055,.04,0,F.col('bronze'),'bronze');
   }
   F.rod(-.84,.76,-.26,.84,.76,-.26,.032,F.col('lacquerRed'),'lacquer');
   F.box(0,.52,-.26,.44,.18,.14,0,F.col('ropeGold'),'wicker');
  }});
})();
