// ================================================================= BESPOKE SHORE-KIN FURNITURE (registered on KratorFurniture)
// Registers culture 'shore-kin' palette and 14 bespoke Arch & sea-derived pieces onto KratorFurniture (38-furniture-bundle.js).
// Zero Crookshore nephrite or red cypress: Araucaria offcuts, steamed mangrove knees, pandanus mats, catechu chests, paktong
// tally scales & ingot racks, brucite salt jars, pumice net tubs, kauri-gum cauldrons, sharkskin bellows, and shell oil lamps.
(function(){
 const KF=KratorFurniture;
 const PAL={
  serpentinite:0x3b5847,dunite:0x8d7b58,laterite:0x9c472c,brucite:0xe7e1d2,pumice:0xc6bfb2,
  araucaria:0x8a6443,mangrove:0x5b3f2e,tarmangrove:0x2b221d,ohia:0x6e3528,salvage:0x745c48,paperbark:0xd8ccb8,
  terracotta:0xbe5636,catechu:0x8c3526,verdigris:0x4c947e,paktong:0xdce1e6,bronze:0xa67a3e,iron:0x484b50,
  pandanus:0xc2ab78,byssus:0xd8ad48,sharkhide:0xb8ad96,rope:0xc4a262,shell:0xf0ebe2,salt:0xf2efe8,
  bitumen:0x1d1b1a,flameGlow:0xffc260
 };
 KF.FPAL['shore-kin']=Object.assign(KF.FPAL['shore-kin']||{},PAL);

 function skDefFurn(o){
  o.culture=o.culture||'shore-kin';
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

 /* 1. Plaited Pandanus & Mangrove-Frame Sleeping Mat */
 skDefFurn({key:'sk_pandan_sleep_mat',name:'Plaited Pandanus and Paperbark Sleeping Platform',type:'bed',tier:'poor',
  rooms:['bedroom','hall'],w:1.86,d:0.94,h:0.42,materials:['timber','fibre','cloth'],task:['sleeping','resting'],
  build(F){
   for(const sx of [-.8,.8])for(const sz of [-.36,.36])F.box(sx,0,sz,.09,.22,.09,0,F.col('mangrove'),'wood');
   F.box(0,.22,0,1.82,.06,.9,0,F.col('salvage'),'plank');
   F.box(0,.285,0,1.74,.05,.82,0,F.col('pandanus'),'reed');
   F.bolster(-.66,.37,0,.68,.08,Math.PI/2,F.col('catechu'),'cloth');
  }});

 /* 2. Araucaria Spar-Offcut Trestle Feast & Work Table */
 skDefFurn({key:'sk_araucaria_trestle_table',name:'Araucaria Offcut Trestle Table',type:'table',tier:'common',
  rooms:['hall','shop','yard'],w:1.68,d:0.86,h:0.78,materials:['timber','ceramic'],task:['eating','socializing'],
  build(F){
   for(const sx of [-.62,.62]){
    F.box(sx,0,0,.14,.08,.68,0,F.col('mangrove'),'wood');
    F.box(sx,.08,0,.11,.6,.14,0,F.col('mangrove'),'wood');
   }
   F.box(0,.34,0,1.36,.07,.09,0,F.col('mangrove'),'wood');
   F.box(0,.68,0,1.66,.07,.84,0,F.col('araucaria'),'plank');
   F.cyl(-.32,.755,-.08,.11,.08,0,F.col('terracotta'),'ceramic');
   F.cyl(.34,.755,.1,.08,.14,0,F.col('shell'),'shell');
  }});

 /* 3. Steamed Mangrove-Knee Tripod Stool */
 skDefFurn({key:'sk_mangrove_knee_stool',name:'Steamed Mangrove-Knee Stool',type:'seating',tier:'common',
  rooms:['hall','shop','yard'],w:0.52,d:0.52,h:0.46,materials:['timber','fibre'],task:['resting','socializing'],
  build(F){
   for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    F.box(Math.cos(a)*.15,0,Math.sin(a)*.15,.07,.39,.07,a,F.col('mangrove'),'wood');
   }
   F.cyl(0,.39,0,.22,.055,0,F.col('araucaria'),'wood');
   F.cyl(0,.448,0,.19,.02,0,F.col('pandanus'),'reed');
  }});

 /* 4. Catechu-Stained & Paktong-Bound Sea Chest */
 skDefFurn({key:'sk_catechu_sea_chest',name:'Catechu and Paktong Sea-Chest',type:'storage',tier:'common',
  rooms:['hall','bedroom','storage','shop'],w:1.24,d:0.62,h:0.68,materials:['timber','metal'],task:['storage'],
  build(F){
   F.box(0,0,0,1.2,.08,.58,0,F.col('tarmangrove'),'wood');
   F.box(0,.08,0,1.16,.48,.54,0,F.col('catechu'),'lacquer');
   F.box(0,.56,0,1.22,.09,.6,0,F.col('araucaria'),'plank');
   for(const sx of [-.42,0,.42])F.box(sx,.085,0,.055,.57,.565,0,F.col('paktong'),'pewter');
  }});

 /* 5. Caretaker Client Hall Paktong Tally & Assay Scale */
 skDefFurn({key:'sk_paktong_tally_scale',name:'Paktong Client-Tally Balance and Desk',type:'workstation',tier:'court',
  rooms:['hall','shop','study'],w:1.38,d:0.76,h:1.32,materials:['stone','timber','metal'],task:[],
  build(F){
   for(const sx of [-.54,.54])F.box(sx,0,0,.16,.74,.62,0,F.col('brucite'),'stone');
   F.box(0,.74,0,1.36,.07,.74,0,F.col('araucaria'),'wood');
   F.cyl(-.24,.815,0,.09,.05,0,F.col('paktong'),'pewter');
   F.cyl(-.24,.865,0,.022,.42,0,F.col('paktong'),'pewter');
   F.box(-.24,1.26,0,.46,.024,.03,0,F.col('paktong'),'pewter');
   for(const dx of [-.44,-.04])F.cyl(dx,.98,0,.085,.025,0,F.col('paktong'),'pewter');
   F.box(.32,.815,.04,.38,.035,.28,0,F.col('paperbark'),'paper');
  }});

 /* 6. Serpentinite & Flame-Rimmed Laterite Hearth Brazier */
 skDefFurn({key:'sk_laterite_hearth_brazier',name:'Serpentinite and Flame-Terracotta Hearth Brazier',type:'brazier',tier:'common',
  rooms:['hall','shrine','yard'],w:0.96,d:0.96,h:0.94,materials:['stone','ceramic','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.44,.16,0,F.col('serpentinite'),'stone');
   F.cyl(0,.16,0,.36,.34,0,F.col('laterite'),'brick');
   F.cyl(0,.5,0,.4,.22,0,F.col('terracotta'),'ceramic');
   F.cyl(0,.72,0,.31,.045,0,F.col('flameGlow'),'glow');
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    F.box(Math.cos(a)*.38,.72,Math.sin(a)*.38,.09,.18,.12,a,F.col('terracotta'),'ceramic');
   }
   F.lamp(0,.84,0,1.1,8);
  }});

 /* 7. Brucite-Travertine & Laterite Salt-Fish Jar Rack */
 skDefFurn({key:'sk_brucite_salt_jar_rack',name:'Brucite and Terracotta Salt-Jar Rack',type:'storage',tier:'common',
  rooms:['storage','shop','yard','hall'],w:1.42,d:0.58,h:1.46,materials:['timber','ceramic','stone'],task:['storage'],
  build(F){
   for(const sx of [-.62,.62])for(const sz of [-.22,.22])F.box(sx,0,sz,.075,1.4,.075,0,F.col('mangrove'),'wood');
   for(const y of [.16,.78]){
    F.box(0,y,0,1.12,.055,.5,0,F.col('salvage'),'plank');
    for(let i=-1;i<=1;i++){
     F.cyl(i*.34,y+.06,0,.13,.38,0,i===0?F.col('verdigris'):F.col('terracotta'),'ceramic');
     F.cyl(i*.34,y+.445,0,.09,.04,0,F.col('brucite'),'stone');
    }
   }
  }});

 /* 8. Coir & Pumice-Float Fishing Net Tub */
 skDefFurn({key:'sk_pumice_net_tub',name:'Tarred Tub with Pumice-Float Coir Nets',type:'storage',tier:'poor',
  rooms:['yard','storage','shop'],w:0.92,d:0.92,h:0.68,materials:['timber','fibre','stone'],task:['storage'],
  build(F){
   F.cyl(0,0,0,.42,.44,0,F.col('tarmangrove'),'wood');
   F.cyl(0,.14,0,.435,.04,0,F.col('rope'),'rope');
   F.cyl(0,.34,0,.435,.04,0,F.col('rope'),'rope');
   F.ell(0,.46,0,.34,.14,.32,0,F.col('rope'),'ropeTwist');
   for(let i=0;i<4;i++){
    const a=i*1.57+.4;
    F.ell(Math.cos(a)*.22,.56,Math.sin(a)*.22,.08,.055,.08,a,F.col('pumice'),'stone');
   }
  }});

 /* 9. Golden Sea-Byssus & Hibiscus Spinning Frame */
 skDefFurn({key:'sk_byssus_spindle_frame',name:'Spun Sea-Byssus and Bast Loom Frame',type:'workstation',tier:'common',
  rooms:['hall','shop','yard'],w:1.34,d:0.66,h:1.58,materials:['timber','cloth','metal'],task:[],
  build(F){
   F.box(-.56,0,0,.14,.1,.58,0,F.col('mangrove'),'wood');
   F.box(.56,0,0,.14,.1,.58,0,F.col('mangrove'),'wood');
   F.box(-.56,.1,0,.09,1.42,.09,0,F.col('araucaria'),'wood');
   F.box(.56,.1,0,.09,1.42,.09,0,F.col('araucaria'),'wood');
   F.cyl(0,1.42,0,.045,1.22,Math.PI/2,F.col('ohia'),'wood');
   F.box(0,.52,0,1.02,.78,.03,0,F.col('byssus'),'silk');
   F.cyl(0,.46,0,.04,1.16,Math.PI/2,F.col('paktong'),'pewter');
  }});

 /* 10. Gjar Bitumen & Agathis Kauri-Gum Pitch Cauldron */
 skDefFurn({key:'sk_kauri_gum_cauldron',name:'Laterite Hearth and Kauri-Gum Pitch Pot',type:'workstation',tier:'common',
  rooms:['yard','shop'],w:1.08,d:1.08,h:1.02,materials:['stone','metal','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.48,.42,0,F.col('laterite'),'brick');
   F.box(0,.08,.45,.26,.24,.08,0,F.col('flameGlow'),'glow');
   F.cyl(0,.42,0,.42,.38,0,F.col('iron'),'metal');
   F.cyl(0,.805,0,.36,.03,0,F.col('bitumen'),'obsidian');
   F.lamp(0,.32,.48,.95,7);
  }});

 /* 11. Household Ancestor Mask & Shell-Chime Niche Stand */
 skDefFurn({key:'sk_ancestor_mask_shrine',name:'Closed-Eyed Ancestor Mask and Shell Altar',type:'shrine',tier:'common',
  rooms:['hall','shrine','bedroom'],w:1.06,d:0.56,h:1.54,materials:['stone','ceramic','metal','shell'],task:['praying'],
  build(F){
   F.box(0,0,0,.98,.16,.5,0,F.col('serpentinite'),'stone');
   F.box(0,.16,0,.86,.66,.42,0,F.col('brucite'),'stone');
   F.box(0,.82,-.14,.74,.62,.1,0,F.col('ohia'),'wood');
   F.ell(0,1.14,-.05,.16,.22,.09,0,F.col('terracotta'),'ceramic');
   F.cyl(-.28,.825,.08,.07,.12,0,F.col('shell'),'nacre');
   F.cyl(.28,.825,.08,.065,.09,0,F.col('paktong'),'pewter');
   F.ell(.28,.93,.08,.035,.035,.035,0,F.col('flameGlow'),'glow');
   F.lamp(.28,.98,.08,.85,6);
  }});

 /* 12. Oiled Sharkskin & Araucaria Foundry Bellows */
 skDefFurn({key:'sk_sharkskin_bellows',name:'Oiled Sharkskin and Paktong Tuyere Bellows',type:'workstation',tier:'common',
  rooms:['yard','shop','hall'],w:1.28,d:0.78,h:0.96,materials:['timber','hide','metal'],task:[],
  build(F){
   F.box(0,0,0,1.12,.14,.68,0,F.col('serpentinite'),'stone');
   F.box(-.06,.14,0,.86,.08,.62,0,F.col('araucaria'),'wood');
   F.ell(-.08,.38,0,.4,.18,.28,0,F.col('sharkhide'),'skin');
   F.box(-.06,.56,0,.86,.08,.62,.12,F.col('araucaria'),'wood');
   F.cyl(.48,.28,0,.055,.38,Math.PI/2,F.col('paktong'),'pewter');
  }});

 /* 13. Gleaming White Paktong Ingot & Nickel-Ash Rack */
 skDefFurn({key:'sk_paktong_ingot_rack',name:'White Paktong Ingot and Assay Rack',type:'storage',tier:'court',
  rooms:['yard','storage','shop','hall'],w:1.36,d:0.64,h:1.12,materials:['stone','timber','metal'],task:['storage'],
  build(F){
   for(const sx of [-.56,.56])F.box(sx,0,0,.14,.98,.56,0,F.col('tarmangrove'),'wood');
   for(const y of [.22,.64]){
    F.box(0,y,0,.96,.07,.5,0,F.col('araucaria'),'plank');
    for(let i=-2;i<=2;i++){
     F.box(i*.18,y+.075,0,.13,.09,.36,0,F.col('paktong'),'pewter');
    }
   }
  }});

 /* 14. Nacreous Conch-Shell & Carved Mangrove Oil Lamp Stand */
 skDefFurn({key:'sk_shell_oil_lamp',name:'Nacreous Shell and Mangrove Oil-Lamp Stand',type:'lamp',tier:'common',
  rooms:['hall','shrine','yard','bedroom'],w:0.52,d:0.52,h:1.68,materials:['stone','timber','shell','emissive'],task:[],
  build(F){
   F.cyl(0,0,0,.22,.12,0,F.col('serpentinite'),'stone');
   F.cyl(0,.12,0,.045,1.18,0,F.col('mangrove'),'wood');
   F.cyl(0,1.3,0,.18,.08,0,F.col('shell'),'nacre');
   F.ell(0,1.42,0,.08,.07,.08,0,F.col('flameGlow'),'glow');
   F.cone(0,1.52,0,.14,.14,0,F.col('paktong'),'pewter');
   F.lamp(0,1.44,0,.95,7.5);
  }});
})();
