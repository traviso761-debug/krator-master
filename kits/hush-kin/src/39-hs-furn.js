// ================================================================= BESPOKE HUSH-KIN FURNITURE (registered on KratorFurniture)
// Registers culture 'hush-kin' palette and 14 bespoke Silent-Vales pieces onto KratorFurniture (38-furniture-bundle.js),
// alongside the read-only generic, generic-goods, jobs, arms and scrap catalog sets.
// Every part names an explicit material family so core/engine/91f-furnish.js (svfDetail) binds packed f_* library detail maps,
// and every relief/inlay steps cleanly by >= 2.0 cm so zero coplanar triangles ever overlap in zfightAudit.
(function(){
 const KF=KratorFurniture;
 const PAL={
  quartzWhite:0xf6f8fb,crystalIce:0xe6f1fa,alabaster:0xefeae0,
  granitePale:0xb8bec6,graniteDark:0x7e858e,slateBlue:0x465464,slateDark:0x323d4a,
  nephrite:0x28845c,jadePale:0x3c9a78,
  bronze:0xa88240,verdigris:0x4e9680,brass:0xc89e44,iron:0x42464c,
  cypress:0x8c5236,cypressDark:0x583220,birch:0xd8ccb8,
  feltIndigo:0x344a66,feltCream:0xe4dfd4,linen:0xeeeae0,rope:0xb09666,
  lampGlow:0xffd88a,prismGlow:0xfff2cc
 };
 KF.FPAL['hush-kin']=Object.assign(KF.FPAL['hush-kin']||{},PAL);
 function hsDefFurn(o){
  o.culture=o.culture||'hush-kin';
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

 /* 1. Two-tone elliptic bianzhong bronze bell rack (440 / 660 Hz harmonics) with lacquered cypress mallets */
 hsDefFurn({key:'hush_bianzhong_bell_rack',name:'Two-Tone Bianzhong Harmonic Bell Rack',type:'instrument',tier:'court',
  setting:'both',rooms:['hall','shrine','school','yard'],w:1.56,d:0.52,h:1.74,materials:['stone','timber','bronze'],task:['praying','socializing'],
  build(F){
   for(const sx of [-.64,.64]){
    F.box(sx,0,0,.22,.12,.44,0,F.col('granitePale'),'stone');
    F.box(sx,.12,0,.09,1.52,.09,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.92,0,1.46,.07,.11,0,F.col('cypress'),'wood');
   F.box(0,1.58,0,1.52,.08,.12,0,F.col('cypressDark'),'wood');
   F.box(0,1.66,0,.36,.08,.14,0,F.col('quartzWhite'),'stone');
   for(let i=-2;i<=2;i++){
    const bx=i*.24,bh=.22-Math.abs(i)*.018;
    F.cyl(bx,1.58-bh-.08,0,.058,bh,0,F.col('bronze'),'bronze');
    F.cyl(bx,.92-bh-.06,0,.068,bh+.02,0,F.col('bronze'),'bronze');
   }
   F.rod(-.42,.18,.16,.42,.18,.16,.016,F.col('birch'),'wood');
  }});

 /* 2. Sawn emerald-nephrite L-shaped qing lithophone chime stand (440 / 660 Hz sinusoidal stones) */
 hsDefFurn({key:'hush_nephrite_lithophone',name:'Emerald-Nephrite 440 Hz Lithophone Stand',type:'instrument',tier:'common',
  setting:'both',rooms:['hall','shrine','school','workshop'],w:1.42,d:0.48,h:1.58,materials:['stone','timber','jade','bronze'],task:['praying'],
  build(F){
   for(const sx of [-.58,.58]){
    F.box(sx,0,0,.2,.11,.42,0,F.col('slateBlue'),'stone');
    F.box(sx,.11,0,.085,1.38,.085,0,F.col('birch'),'wood');
   }
   F.box(0,1.44,0,1.34,.08,.11,0,F.col('cypressDark'),'wood');
   for(let i=-2;i<=2;i++){
    const nx=i*.22,nh=.28-Math.abs(i)*.022;
    F.rod(nx,1.28,0,nx,1.44,0,.008,F.col('brass'),'bronze');
    F.box(nx,1.28-nh,0,.15,nh,.036,.18,F.col('nephrite'),'jade');
   }
  }});

 /* 3. Shuttered rock-crystal prism & bronze optical heliograph signalling tripod */
 hsDefFurn({key:'hush_heliograph_tripod',name:'Shuttered Rock-Crystal Heliograph Tripod',type:'lamp',tier:'common',
  setting:'both',rooms:['yard','barracks','workshop','hall'],w:0.86,d:0.86,h:1.68,materials:['timber','bronze','stone','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.34,.08,0,F.col('granitePale'),'stone');
   for(let i=0;i<3;i++){
    const a=i*F.TAU/3;
    F.rod(Math.cos(a)*.26,.08,Math.sin(a)*.26,0,1.08,0,.026,F.col('cypressDark'),'wood');
   }
   F.cyl(0,1.08,0,.18,.07,0,F.col('bronze'),'bronze');
   F.cyl(0,1.15,0,.12,.34,0,F.col('prismGlow'),'glow');
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4+.35;
    F.box(Math.cos(a)*.17,1.16,Math.sin(a)*.17,.08,.3,.018,a+.4,F.col('brass'),'bronze');
   }
   F.cone(0,1.49,0,.2,.18,0,F.col('quartzWhite'),'stone');
   F.lamp(0,1.32,0,1.3,9.0);
  }});

 /* 4. Chest-height (1.28 m) white-quartz parabolic reflector Handspeak sign-lamp */
 hsDefFurn({key:'hush_handspeak_mirror_lamp',name:'Chest-Height Quartz Reflector Handspeak Lamp',type:'lamp',tier:'common',
  setting:'both',rooms:['hall','tavern','inn','school','yard'],w:0.56,d:0.52,h:1.48,materials:['stone','bronze','emissive'],task:['socializing'],
  build(F){
   F.box(0,0,0,.42,.1,.4,0,F.col('slateBlue'),'stone');
   F.cyl(0,.1,0,.055,1.02,0,F.col('granitePale'),'stone');
   /* Dished white-quartz parabolic reflector behind chest-height crystal lamp */
   F.box(0,1.12,-.08,.38,.34,.05,0,F.col('quartzWhite'),'plaster');
   F.box(0,1.16,-.03,.28,.26,.024,0,F.col('crystalIce'),'stone');
   F.cyl(0,1.12,.06,.1,.04,0,F.col('bronze'),'bronze');
   F.cyl(0,1.16,.06,.075,.18,0,F.col('lampGlow'),'glow');
   F.cone(0,1.34,.06,.11,.1,0,F.col('bronze'),'bronze');
   F.lamp(0,1.25,.08,1.15,7.5);
  }});

 /* 5. Carved pale-granite & snow-white-quartz Raised Open-Palm Sanctuary Stele */
 hsDefFurn({key:'hush_open_palm_stele',name:'Raised Open-Palm Sanctuary Stele',type:'shrine',job:'worship',tier:'common',
  setting:'both',rooms:['shrine','hall','yard'],w:0.88,d:0.46,h:1.76,materials:['stone','jade'],task:['praying'],
  build(F){
   F.box(0,0,0,.82,.14,.42,0,F.col('slateBlue'),'stone');
   F.box(0,.14,0,.64,1.32,.24,0,F.col('granitePale'),'stone');
   F.box(0,1.46,0,.72,.12,.28,0,F.col('quartzWhite'),'plaster');
   F.cone(0,1.58,0,.22,.18,0,F.col('quartzWhite'),'plaster');
   /* Z-stepped quartz halo (+2.2 cm), sculpted open palm (+4.4 cm) & nephrite heart (+6.6 cm) */
   F.box(0,.82,.142,.44,.54,.022,0,F.col('quartzWhite'),'plaster');
   F.box(0,.74,.166,.22,.22,.022,0,F.col('alabaster'),'stone');
   for(let i=-2;i<=1;i++)F.box((i+.5)*.052,.94,.166,.036,.18,.022,0,F.col('alabaster'),'stone');
   F.box(-.14,.78,.166,.042,.13,.022,.35,F.col('alabaster'),'stone');
   F.box(0,.74,.188,.08,.08,.02,0,F.col('nephrite'),'jade');
  }});

 /* 6. Slate & white-quartz engraved Handspeak two-handed gesture primer lectern for mute outsiders */
 hsDefFurn({key:'hush_primer_tablet_stand',name:'Engraved Handspeak Gesture Primer Stand',type:'desk',job:'scribing',tier:'common',
  setting:'both',rooms:['inn','school','hall','shop'],w:0.94,d:0.58,h:1.28,materials:['stone','timber','bronze'],task:['reading'],
  build(F){
   F.box(0,0,0,.78,.1,.5,0,F.col('granitePale'),'stone');
   for(const sx of [-.28,.28])F.box(sx,.1,0,.08,.94,.08,0,F.col('birch'),'wood');
   F.box(0,1.04,0,.88,.08,.48,0,F.col('cypress'),'wood');
   F.box(0,1.12,-.02,.76,.06,.38,0,F.col('slateDark'),'stone');
   for(const sx of [-.2,.2]){
    F.box(sx,1.182,-.02,.26,.022,.28,0,F.col('quartzWhite'),'plaster');
    F.box(sx,1.206,-.02,.12,.02,.14,0,F.col('bronze'),'bronze');
   }
  }});

 /* 7. Upright silver-birch & cypress loom weaving sound-damping felt soles and indigo sign-banners */
 hsDefFurn({key:'hush_felt_sole_loom',name:'Sound-Damping Wool Felt and Banner Loom',type:'loom',job:'weaving',tier:'common',
  setting:'indoor',rooms:['workshop','hall'],w:1.38,d:0.62,h:1.82,materials:['stone','timber','cloth'],task:[],
  build(F){
   for(const sx of [-.56,.56]){
    F.box(sx,0,0,.18,.12,.52,0,F.col('granitePale'),'stone');
    F.box(sx,.12,0,.09,1.62,.09,0,F.col('birch'),'wood');
   }
   F.box(0,1.68,0,1.28,.09,.12,0,F.col('cypressDark'),'wood');
   F.box(0,.54,0,1.22,.07,.12,0,F.col('cypress'),'wood');
   F.box(0,.98,.02,.92,.76,.032,0,F.col('feltIndigo'),'cloth');
   F.box(0,1.02,.056,.62,.36,.022,0,F.col('feltCream'),'linen');
  }});

 /* 8. Smokeless radiant soapstone/granite & white-quartz thermal stove */
 hsDefFurn({key:'hush_quartz_brazier_stove',name:'Radiant Granite and White-Quartz Thermal Stove',type:'hearth',tier:'common',
  setting:'both',rooms:['hall','kitchen','bedroom','inn','tavern'],w:1.08,d:1.08,h:1.54,materials:['stone','bronze','emissive'],task:['cooking'],
  build(F){
   F.box(0,0,0,1.02,.14,1.02,0,F.col('slateBlue'),'stone');
   F.box(0,.14,0,.84,.68,.84,0,F.col('granitePale'),'stone');
   F.box(0,.34,.442,.42,.28,.024,0,F.col('lampGlow'),'glow');
   F.box(0,.82,0,.92,.1,.92,0,F.col('bronze'),'bronze');
   F.box(0,.92,0,.58,.36,.58,0,F.col('quartzWhite'),'plaster');
   F.cone(0,1.28,0,.26,.26,0,F.col('quartzWhite'),'plaster');
   F.lamp(0,.48,.32,1.1,7.0);
  }});

 /* 9. Tiered silver-birch & bronze Handspeak visual chronicle & sign-diagram scroll cabinet */
 hsDefFurn({key:'hush_scroll_chronicle_rack',name:'Handspeak Visual Chronicle Scroll Cabinet',type:'shelf',job:'scribing',tier:'common',
  setting:'indoor',rooms:['school','hall','shop','shrine'],w:1.34,d:0.46,h:1.72,materials:['timber','paper','bronze'],task:['reading','storage'],
  build(F){
   F.box(0,0,0,1.28,.1,.42,0,F.col('cypressDark'),'wood');
   for(const sx of [-.58,.58])F.box(sx,.1,0,.08,1.52,.38,0,F.col('birch'),'wood');
   for(const sy of [.52,.98,1.44]){
    F.box(0,sy,0,1.14,.05,.36,0,F.col('cypress'),'wood');
    for(let i=-2;i<=2;i++)F.cyl(i*.19,sy+.05,0,.048,.22,0,i%2===0?F.col('linen'):F.col('feltCream'),'paper');
   }
   F.box(0,1.62,0,1.32,.08,.44,0,F.col('cypressDark'),'wood');
  }});

 /* 10. Wet quartz-sand & emerald-nephrite prism-polishing lapidary bench */
 hsDefFurn({key:'hush_lapidary_grinding_bench',name:'Quartz-Prism and Nephrite Lapidary Bench',type:'workbench',job:'masonry',tier:'common',
  setting:'both',rooms:['workshop','yard'],w:1.48,d:0.74,h:1.12,materials:['stone','timber','jade','bronze'],task:[],
  build(F){
   for(const sx of [-.58,.58])F.box(sx,0,0,.18,.78,.64,0,F.col('granitePale'),'stone');
   F.box(0,.78,0,1.42,.09,.7,0,F.col('cypressDark'),'wood');
   F.box(-.32,.87,0,.48,.1,.46,0,F.col('slateBlue'),'stone');
   F.cyl(-.32,.97,0,.17,.08,0,F.col('quartzWhite'),'plaster');
   F.box(.32,.87,0,.42,.09,.32,0,F.col('nephrite'),'jade');
   F.cyl(.32,.96,0,.08,.14,0,F.col('crystalIce'),'stone');
  }});

 /* 11. Low circular sightline cypress tea table with alabaster cups & felt floor cushions (never blocks Handspeak!) */
 hsDefFurn({key:'hush_tea_sign_table',name:'Low Sightline Handspeak Tea Table and Felt Cushions',type:'table',tier:'common',
  setting:'both',rooms:['hall','tavern','inn','yard'],w:1.36,d:1.36,h:0.54,materials:['timber','cloth','ceramic','bronze'],task:['eating','socializing'],
  build(F){
   F.cyl(0,0,0,.28,.08,0,F.col('cypressDark'),'wood');
   F.cyl(0,.08,0,.14,.3,0,F.col('birch'),'wood');
   F.cyl(0,.38,0,.52,.06,0,F.col('cypress'),'wood');
   F.cyl(0,.44,0,.1,.1,0,F.col('bronze'),'bronze');
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4+.78;
    F.cyl(Math.cos(a)*.28,.44,Math.sin(a)*.28,.045,.055,0,F.col('alabaster'),'ceramic');
    F.box(Math.cos(a)*.52,0,Math.sin(a)*.52,.32,.09,.32,a,i%2===0?F.col('feltIndigo'):F.col('feltCream'),'cloth');
   }
  }});

 /* 12. Sanctuary border-watch stand holding felt-wrapped staves, yew bows & 440 Hz bronze tuning-forks */
 hsDefFurn({key:'hush_silent_warden_rack',name:'Sanctuary Warden Staff and Tuning-Fork Rack',type:'weapon_rack',tier:'common',
  setting:'both',rooms:['barracks','hall','yard'],w:1.24,d:0.48,h:1.68,materials:['stone','timber','bronze','cloth'],task:[],
  build(F){
   for(const sx of [-.5,.5]){
    F.box(sx,0,0,.18,.11,.42,0,F.col('slateBlue'),'stone');
    F.box(sx,.11,0,.08,1.44,.08,0,F.col('cypressDark'),'wood');
   }
   F.box(0,.62,0,1.14,.06,.14,0,F.col('birch'),'wood');
   F.box(0,1.34,0,1.14,.06,.14,0,F.col('birch'),'wood');
   for(let i=-2;i<=2;i++){
    const wx=i*.18;
    F.rod(wx,.12,.04,wx,1.62,-.03,.018,F.col('cypress'),'wood');
    F.cyl(wx,.92,.01,.028,.18,0,F.col('feltIndigo'),'cloth');
   }
   F.box(0,1.4,.092,.18,.22,.024,0,F.col('bronze'),'bronze');
  }});

 /* 13. Silent felt-bushed cypress & bronze underwater-cable ferry capstan winch */
 hsDefFurn({key:'hush_cable_capstan',name:'Felt-Bushed Silent Underwater-Cable Capstan',type:'machine',job:'shipwrighting',tier:'common',
  setting:'both',rooms:['yard','workshop'],w:1.26,d:1.26,h:1.18,materials:['stone','timber','bronze','rope'],task:[],
  build(F){
   F.cyl(0,0,0,.52,.14,0,F.col('granitePale'),'stone');
   F.cyl(0,.14,0,.32,.1,0,F.col('feltIndigo'),'cloth');
   F.cyl(0,.24,0,.24,.58,0,F.col('rope'),'rope');
   F.cyl(0,.82,0,.34,.14,0,F.col('cypressDark'),'wood');
   for(let i=0;i<4;i++){
    const a=i*F.TAU/4;
    F.box(Math.cos(a)*.38,.86,Math.sin(a)*.38,.44,.06,.07,a,F.col('birch'),'wood');
   }
   F.cyl(0,.96,0,.14,.18,0,F.col('bronze'),'bronze');
  }});

 /* 14. Brass-bound cypress & snow-white-quartz prism reliquary / storage chest */
 hsDefFurn({key:'hush_crystal_reliquary_chest',name:'White-Quartz and Cypress Reliquary Chest',type:'chest',tier:'common',
  setting:'indoor',rooms:['hall','bedroom','storage','shrine','shop'],w:1.14,d:0.64,h:0.78,materials:['timber','stone','bronze','cloth'],task:['storage'],
  build(F){
   F.box(0,0,0,1.08,.09,.58,0,F.col('feltIndigo'),'cloth');
   F.box(0,.09,0,1.02,.48,.52,0,F.col('cypress'),'wood');
   F.box(0,.57,0,1.1,.12,.6,0,F.col('cypressDark'),'wood');
   F.box(0,.69,0,.44,.09,.28,0,F.col('quartzWhite'),'plaster');
   F.box(0,.26,.282,.64,.24,.022,0,F.col('quartzWhite'),'plaster');
   for(const sx of [-.18,.18])F.box(sx,.31,.306,.12,.1,.02,0,F.col('brass'),'bronze');
  }});
})();
