/* ============================== 16X-F. ABYSS — abyssal-desert furniture, indoor and outdoor ==============================
   Registered with FURN (culture 'abyssal-desert'), never modelled inside a building: a building PLACES these through
   ABYSS.furn(F, key, x,z, yaw, {ly, variant}). `room` says where it belongs; `place` is 'indoor' | 'outdoor' | 'both'.
   Lighting rule: variant 0 of every light is UNLIT (oil, cold: poor and middle buildings); variant 1 is LIT (warm),
   for rich, civic, sacred and palace buildings. The crystal ring glows blue (sacred only).                       */
reseed(651001);
(function(){
  var PI=Math.PI, AB='abyssal-desert';
  function wood(F){ return F.pick(TIMBERC); }

  /* ---------- seating and tables ---------- */
  FURN({ key:'abyss_bench', name:'Plank bench on trestles', culture:AB, room:'court', place:'both', w:2.2, d:0.6, h:0.9, variants:2, variantNames:['plain','with a back rail'],
    build:function(F){ var pk=F.pick(PLANKC), tc=wood(F); F.box(0,0.42,0, 2.1,0.07,0.42, 0, pk, 'plank');
      [-0.8,0.8].forEach(function(x){ F.box(x,0,0, 0.08,0.42,0.36, 0, tc, 'timber'); });
      if(F.variant){ [-0.8,0.8].forEach(function(x){ F.box(x,0.42,-0.22, 0.07,0.45,0.06, 0, tc, 'timber'); }); F.box(0,0.78,-0.22, 2.1,0.10,0.05, 0, pk, 'plank'); } } });
  FURN({ key:'abyss_table_stools', name:'Drum table and stools', culture:AB, room:'tavern', place:'both', w:2.0, d:2.0, h:1.0, variants:2, variantNames:['drum table','cable-reel table'],
    build:function(F){ if(F.variant===0){ LOCUS.drum(F, 0,0,0, ABYSS.rust(F)); F.cyl(0,0.88,0, 0.55,0.06, 0, F.pick(PLANKC), 'plank'); }
      else { F.cyl(0,0,0, 0.62,0.08, 0, wood(F), 'plank'); F.cyl(0,0.08,0, 0.22,0.62, 0, wood(F), 'timber'); F.cyl(0,0.70,0, 0.62,0.08, 0, wood(F), 'plank'); }
      for(var i=0;i<3;i++){ var a=i/3*TAU+0.3; F.cyl(Math.cos(a)*0.8,0,Math.sin(a)*0.8, 0.18,0.45, 0, i%2?ABYSS.rust(F):F.pick(PLANKC), i%2?'rust':'plank'); } } });

  /* ---------- light and fire ---------- */
  FURN({ key:'abyss_lantern_post', name:'Lantern post', culture:AB, room:'street', place:'outdoor', w:1.0, d:0.6, h:3.2, variants:2, variantNames:['oil, unlit','lit'],
    build:function(F){ var tc=wood(F); F.cyl(0,0,0, 0.09,3.0, 0, tc, 'timber'); F.rod(0,2.9,0, 0.7,2.9,0, 0.04, tc, 'timber'); ABYSS.lantern(F, 0.65,2.6,0, F.variant===1); } });
  FURN({ key:'abyss_brazier', name:'Drum brazier', culture:AB, room:'court', place:'outdoor', w:0.9, d:0.9, h:1.1, variants:2, variantNames:['cold','burning'],
    build:function(F){ var c=ABYSS.rust(F); [0,1,2].forEach(function(i){ var a=i/3*TAU; F.rod(Math.cos(a)*0.32,0,Math.sin(a)*0.32, Math.cos(a)*0.2,0.5,Math.sin(a)*0.2, 0.03, STEELDC[0], 'rust'); });
      F.lathe('rust', 0,0, [[0.22,0.45],[0.34,0.7],[0.38,0.95]], c, { seg:10 }); F.cyl(0,0.82,0, 0.33,0.06, 0, F.variant?0x3a1a0a:0x2a2622, 'adobe');
      if(F.variant){ LOCUS.flame(F, 0,0.9,0, 0.25, 0.9); } } });
  FURN({ key:'abyss_fire_bowl', name:'Altar fire bowl', culture:AB, room:'shrine', place:'outdoor', w:2.4, d:2.4, h:2.2, variants:2, variantNames:['cold','burning'],
    build:function(F){ F.cyl(0,0,0, 0.9,0.25, 0, PAL.abLacquer, 'plaster'); F.lathe('metal', 0,0, [[0.35,0.25],[0.25,0.9],[0.5,1.1],[1.05,1.35],[1.15,1.5]], PAL.abGild, { seg:18 });
      F.cyl(0,1.32,0, 1.0,0.08, 0, 0x2a1810, 'adobe'); if(F.variant){ LOCUS.flame(F, 0,1.4,0, 0.55, 2.4); } } });
  FURN({ key:'abyss_crystal_ring', name:'Ring of blue crystals', culture:AB, room:'shrine', place:'outdoor', w:5.6, d:5.6, h:1.6, variants:2, variantNames:['dark','glowing'],
    build:function(F){ var n=8, R=2.4, cc=F.variant?PAL.abCrystal:shade(PAL.abCrystal,-0.45), fam=F.variant?'glowmat':'glass';
      for(var i=0;i<n;i++){ var a=i/n*TAU, x=Math.cos(a)*R, z=Math.sin(a)*R, h=F.rr(0.9,1.5);
        F.cyl(x,0,z, 0.28,0.16, 0, PAL.abGild, 'metal'); F.cone(x,0.12,z, 0.17,h, [F.rr(-0.15,0.15),0,F.rr(-0.15,0.15)], cc, fam); F.cone(x+0.12,0.12,z-0.08, 0.10,h*0.6, [0.3,a,0], cc, fam); }
      if(F.variant) F.lamp(0,0.8,0, 0.9, 10); /* NOTE: the night volume has a cool channel; a crystal's blue reads through glowmat */ } });

  /* ---------- canopies over streets ---------- */
  /* strung lanterns between two masts, w apart (the mast feet are part of the piece) */
  FURN({ key:'abyss_lantern_string', name:'String of lanterns on two masts', culture:AB, room:'street', place:'outdoor', w:12, d:0.8, h:5.4, variants:2, variantNames:['oil, unlit','lit'],
    build:function(F){ var tc=wood(F), lit=F.variant===1; [-5.8,5.8].forEach(function(x){ LOCUS.pole(F, x,0, 5.2, 0.1, tc, true); });
      var n=7, prev=null; for(var i=0;i<=n;i++){ var t=i/n, x=mix(-5.8,5.8,t), y=5.0-1.2*4*t*(1-t); if(prev) F.rod(prev[0],prev[1],0, x,y,0, 0.015, PAL.paintBlack[0], 'rust'); prev=[x,y];
        if(i>0 && i<n){ var c=F.pick([PAL.abSailRed, PAL.abSailOrange, PAL.abBrightYellow]); F.box(x,y-0.75,0, 0.04,0.4,0.04, 0, PAL.paintBlack[0], 'timber');
          F.ball(x,y-0.95,0, 0.2, lit?shade(c,0.35):c, lit?'glowmat':'cloth'); if(lit && i%2) F.lamp(x,y-0.95,0, 0.35, 7); } } } });
  /* a canopy of coloured umbrellas hung on wires between four masts at the corners of a w x d bay */
  FURN({ key:'abyss_umbrella_canopy', name:'Umbrella canopy on wires', culture:AB, room:'street', place:'outdoor', w:10, d:10, h:6.2, variants:2, variantNames:['umbrellas','umbrellas and lit lanterns'],
    build:function(F){ var tc=wood(F), H=6.0, S=4.8, C=[[-S,-S],[S,-S],[S,S],[-S,S]];
      C.forEach(function(c){ LOCUS.pole(F, c[0],c[1], H, 0.1, tc, true); });
      var wires=[]; for(var i=0;i<4;i++){ var z=mix(-S,S,(i+0.5)/4); wires.push(z); F.rod(-S,H-0.3,z, S,H-0.3,z, 0.012, PAL.paintBlack[0], 'rust'); }
      F.rod(-S,H-0.3,-S, -S,H-0.3,S, 0.012, PAL.paintBlack[0], 'rust'); F.rod(S,H-0.3,-S, S,H-0.3,S, 0.012, PAL.paintBlack[0], 'rust');
      var cols=[PAL.abBrightYellow, PAL.abBrightTeal, PAL.abBrightPink, PAL.abSailOrange, PAL.abTarpBlue, PAL.abSailRed];
      wires.forEach(function(z,wi){ for(var k=0;k<5;k++){ var x=mix(-S,S,(k+0.5)/5)+F.rr(-0.3,0.3), y=H-0.85+F.rr(-0.25,0.25), c=F.pick(cols), r=F.rr(0.7,0.85);
          var tx=F.rr(-0.25,0.25), tz=F.rr(-0.25,0.25);
          F.edome(x,y,z, r, r*0.42, r, [tx, F.rr(0,TAU), tz], c, 'canvas');                                /* the open umbrella, tilted a little on its wire */
          F.cyl(x,y-0.02,z, r*0.96, 0.02, [tx,0,tz], shade(c,-0.3), 'canvas');                              /* its underside, seen from the street */
          F.rod(x,y-0.75,z, x,y+r*0.42+0.12,z, 0.015, PAL.paintBlack[0], 'rust'); F.rod(x,y+r*0.42,z, x,H-0.3,z, 0.01, PAL.paintBlack[0], 'rust');
          if(F.variant===1 && (k+wi)%2===0){ F.ball(x+0.6,y-0.4,z, 0.16, PAL.glowWarm, 'glowmat'); if((k+wi)%4===0) F.lamp(x+0.6,y-0.4,z, 0.4, 8); } } }); } });

  /* ---------- shop and work furniture ---------- */
  FURN({ key:'abyss_counter', name:'Shop counter', culture:AB, room:'shop', place:'both', w:3.0, d:1.0, h:1.1, variants:2, variantNames:['planks on drums','bar in a cut tank'],
    build:function(F){ if(F.variant===0){ [-1.0,0,1.0].forEach(function(x){ LOCUS.drum(F, x,0,0, ABYSS.rust(F)); }); F.box(0,0.9,0, 3.0,0.08,0.9, 0, F.pick(PLANKC), 'plank'); }
      else { var c=ABYSS.rust(F); F.sector('rust', 0,1.6, 1.55,1.68, PI*1.18,PI*1.82, 0,1.05, c, { faces:'iots', step:0.4 }); F.box(0,1.0,-0.05, 2.9,0.08,0.7, 0, F.pick(PLANKC), 'plank');
        F.box(0,0.55,-0.33, 2.6,0.06,0.04, 0, PAL.abGild, 'metal'); } } });
  FURN({ key:'abyss_rack_spears', name:'Rack of spears and harpoons', culture:AB, room:'shop', place:'both', w:2.4, d:0.8, h:2.6, variants:1,
    build:function(F){ var tc=wood(F); [-1.1,1.1].forEach(function(x){ F.box(x,0,0, 0.1,2.0,0.5, 0, tc, 'timber'); }); [0.6,1.6].forEach(function(y){ F.box(0,y,0.15, 2.3,0.08,0.08, 0, tc, 'timber'); });
      for(var i=0;i<8;i++){ var x=-0.95+i*0.27, harp=i%3===0; F.rod(x,0.05,0.05, x+0.05,2.4,0.2, 0.025, tc, 'timber'); F.cone(x+0.05,2.38,0.2, harp?0.06:0.045, harp?0.32:0.26, [0.06,0,0], PAL.abTin, 'metal');
        if(harp) F.box(x+0.05,2.4,0.2, 0.16,0.05,0.03, 0.4, PAL.abTin, 'metal'); } } });
  FURN({ key:'abyss_forge', name:'Drum forge and anvil', culture:AB, room:'workshop', place:'both', w:2.4, d:1.6, h:2.4, variants:1,
    build:function(F){ var c=ABYSS.rust(F); F.cyl(-0.5,0,0, 0.55,0.85, 0, c, 'rust'); F.cyl(-0.5,0.85,0, 0.5,0.04, 0, 0x3a1a0a, 'adobe'); F.ball(-0.5,0.92,0, 0.25, 0xff7a30, 'glowmat');
      F.cyl(-0.5,0.9,0, 0.12,1.5, 0, STEELDC[0], 'rust'); F.box(0.7,0,0, 0.4,0.6,0.4, 0, wood(F), 'timber'); F.box(0.7,0.6,0, 0.7,0.22,0.26, 0, STEELDC[3], 'rust'); F.cone(1.05,0.62,0, 0.12,0.35, [0,0,-PI/2], STEELDC[3], 'rust'); } });
  FURN({ key:'abyss_armor_stand', name:'Armour stand (Ancient plate)', culture:AB, room:'shop', place:'both', w:0.9, d:0.6, h:1.9, variants:2, variantNames:['breastplate','plate and helm'],
    build:function(F){ var tc=wood(F); F.box(0,0,0, 0.5,0.06,0.4, 0, tc, 'timber'); F.cyl(0,0,0, 0.04,1.5, 0, tc, 'timber'); F.rod(-0.4,1.35,0, 0.4,1.35,0, 0.03, tc, 'timber');
      F.box(0,0.85,0.02, 0.5,0.6,0.22, 0, F.pick(METALC), 'metal'); F.box(0,1.25,0.02, 0.62,0.14,0.24, 0, TARNC[0], 'metal');
      if(F.variant) F.edome(0,1.52,0, 0.19,0.24,0.2, 0, F.pick(METALC), 'metal'); } });
  FURN({ key:'abyss_shield_wall', name:'Shield wall (hung shields)', culture:AB, room:'shop', place:'both', w:3.2, d:0.4, h:2.6, variants:1,
    build:function(F){ var tc=wood(F); F.box(0,0,0, 3.2,2.5,0.1, 0, tc, 'plank');
      for(var i=0;i<6;i++){ var x=-1.1+(i%3)*1.1, y=0.75+Math.floor(i/3)*1.05, c=F.pick([PAL.abSailRed, PAL.abBrightTeal, METALC[1], PAL.abGild]); F.disc(x,y,0.06, 0,1, 0.42, 0.06, c, 'metal'); F.disc(x,y,0.1, 0,1, 0.12, 0.05, TARNC[1], 'metal'); } } });
  FURN({ key:'abyss_shelf_jars', name:'Shelves of jars', culture:AB, room:'shop', place:'indoor', w:2.0, d:0.5, h:2.2, variants:2, variantNames:['clay jars','glass jars (alchemist)'],
    build:function(F){ var tc=wood(F); [-0.95,0.95].forEach(function(x){ F.box(x,0,0, 0.06,2.1,0.42, 0, tc, 'timber'); });
      [0.1,0.7,1.3,1.9].forEach(function(y){ F.box(0,y,0, 1.9,0.04,0.42, 0, tc, 'plank');
        if(y<1.8) for(var i=0;i<5;i++){ var x=-0.75+i*0.37, s=F.rr(0.7,1.1); if(F.variant) F.cyl(x,y+0.04,0, 0.09*s,0.28*s, 0, F.pick([PAL.abCrystal, 0x6aa84a, 0xc84a8a, PAL.abBrightYellow]), 'glass');
          else F.lathe('adobe', x,0, [[0.07*s,y+0.04],[0.12*s,y+0.16*s],[0.06*s,y+0.34*s]], F.pick(ADOBEREDC), { seg:7 }); } }); } });
  FURN({ key:'abyss_crates', name:'Crates, sacks and barrels', culture:AB, room:'yard', place:'both', w:2.6, d:2.0, h:1.6, variants:3, variantNames:['crates','sacks','barrels and a crate'],
    build:function(F){ var v=F.variant;
      if(v===0){ F.box(-0.6,0,0, 0.9,0.8,0.9, 0.1, F.pick(PLANKC), 'plank'); F.box(0.5,0,0.1, 0.8,0.7,0.8, -0.2, F.pick(PLANKC), 'plank'); F.box(-0.5,0.8,0, 0.7,0.6,0.7, 0.3, F.pick(PLANKC), 'plank'); }
      else if(v===1){ for(var i=0;i<5;i++){ var x=-0.8+(i%3)*0.8, y=Math.floor(i/3)*0.4; F.edome(x+(y?0.4:0),y,F.rr(-0.2,0.2), 0.42,0.42,0.3, F.rr(0,PI), 0xc8b080, 'cloth'); } }
      else { LOCUS.drum(F, -0.7,0,-0.2); LOCUS.drum(F, 0,0,0.3); LOCUS.drum(F, 0.8,0,0.5, null, true, 0.3); F.box(-0.6,0,0.6, 0.6,0.5,0.6, 0, F.pick(PLANKC), 'plank'); } } });
  FURN({ key:'abyss_hanging_goods', name:'Hanging goods on a rail', culture:AB, room:'shop', place:'both', w:2.6, d:0.5, h:2.4, variants:1,
    build:function(F){ var tc=wood(F); [-1.2,1.2].forEach(function(x){ F.cyl(x,0,0, 0.05,2.3, 0, tc, 'timber'); }); F.rod(-1.25,2.2,0, 1.25,2.2,0, 0.04, tc, 'timber');
      for(var i=0;i<7;i++){ var x=-1.0+i*0.33, k=i%3; F.rod(x,2.2,0, x,1.9,0, 0.01, PAL.paintBlack[0], 'timber');
        if(k===0) F.box(x,1.25,0, 0.26,0.65,0.05, 0, F.pick(CLOTHC), 'cloth'); else if(k===1) F.lathe('adobe', x,0, [[0.06,1.55],[0.14,1.7],[0.06,1.88]], F.pick(ADOBEREDC), { seg:7 }); else F.box(x,1.5,0, 0.3,0.4,0.2, 0, 0xc8b080, 'cloth'); } } });
  FURN({ key:'abyss_clay_oven', name:'Clay bread-and-fish oven', culture:AB, room:'kitchen', place:'outdoor', w:1.8, d:1.8, h:1.7, variants:1,
    build:function(F){ var c=F.pick(ADOBEC); F.cyl(0,0,0, 0.85,0.5, 0, PAL.abRubble, 'rubble'); F.edome(0,0.5,0, 0.8,0.85,0.8, 0, c, 'adobe');
      F.box(0,0.6,0.62, 0.45,0.4,0.3, 0, VOIDC[0], 'dark'); F.cyl(0.2,1.2,-0.2, 0.1,0.5, 0, shade(c,-0.2), 'adobe'); } });
  FURN({ key:'abyss_smoking_rack', name:'Fish smoking and drying rack', culture:AB, room:'yard', place:'outdoor', w:2.8, d:1.2, h:2.0, variants:2, variantNames:['fish','nets and fish'],
    build:function(F){ var tc=wood(F); [-1.3,1.3].forEach(function(x){ [-0.5,0.5].forEach(function(z){ F.cyl(x,0,z, 0.05,1.95, 0, tc, 'timber'); }); });
      [1.0,1.5].forEach(function(y){ F.rod(-1.35,y,0, 1.35,y,0, 0.03, tc, 'timber'); for(var i=0;i<7;i++){ F.box(-1.1+i*0.36, y-0.38, 0, 0.1,0.36,0.03, 0, F.pick([0xb8a070,0x9a8058,0xc0a888]), 'cloth'); } });
      if(F.variant) F.box(0,1.88,0, 2.6,0.04,1.1, 0, 0x8a7a5a, 'cloth'); } });
  FURN({ key:'abyss_baskets', name:'Baskets of fish and salt-rice', culture:AB, room:'shop', place:'both', w:2.2, d:1.2, h:0.7, variants:1,
    build:function(F){ for(var i=0;i<4;i++){ var x=-0.8+i*0.55, z=(i%2)*0.3-0.15, fish=i%2===0; F.lathe('thatch', x,z, [[0.18,0],[0.26,0.3],[0.27,0.4]], F.pick(REEDMATC), { seg:9 });
        if(fish){ for(var k=0;k<3;k++) F.box(x+F.rr(-0.1,0.1),0.38,z+F.rr(-0.1,0.1), 0.3,0.06,0.08, F.rr(0,PI), 0x9aa8b0, 'metal'); } else F.edome(x,0.36,z, 0.24,0.1,0.24, 0, PAL.paddy[3], 'leafy'); } } });
  FURN({ key:'abyss_salt_cone', name:'Salt cone', culture:AB, room:'yard', place:'outdoor', w:2.2, d:2.2, h:1.8, variants:2, variantNames:['white','grey, raked'],
    build:function(F){ var c=F.variant?SALTCRUSTC[2]:PAL.abSalt; F.cone(0,0,0, 1.0,1.6, 0, c, 'plaster'); F.cyl(0,0,0, 1.05,0.06, 0, shade(c,-0.1), 'plaster'); } });
  FURN({ key:'abyss_canvas_bolts', name:'Bolts of canvas and coils of rope', culture:AB, room:'shop', place:'both', w:2.4, d:1.2, h:1.0, variants:1,
    build:function(F){ var cs=[PAL.abSailOrange, PAL.abSailRed, CANVASC[0], PAL.abBrightTeal]; for(var i=0;i<4;i++){ var x=-0.8+i*0.55; F.rod(x,0.22,-0.4, x,0.22,0.4, 0.2, cs[i], i%2?'pattern':'canvas'); }
      for(var k=0;k<3;k++) F.lathe('thatch', -0.6+k*0.6,0.6, [[0.15,0],[0.35,0.02],[0.36,0.22],[0.15,0.24]], 0xa89060, { seg:10 });
      F.rod(-0.9,0.66,-0.4, 0.9,0.66,-0.4, 0.21, CANVASC[1], 'canvas'); } });

  FURN({ key:'abyss_bookshelf', name:'Bookshelf of codices and scroll tins', culture:AB, room:'library', place:'indoor', w:2.4, d:0.5, h:2.4, variants:1,
    build:function(F){ var tc=wood(F); [-1.15,1.15].forEach(function(x){ F.box(x,0,0, 0.08,2.35,0.45, 0, tc, 'timber'); });
      [0.05,0.62,1.19,1.76,2.33].forEach(function(y){ F.box(0,y,0, 2.3,0.04,0.45, 0, tc, 'plank');
        if(y<2.2){ var x=-1.0; while(x<1.0){ var w=F.rr(0.06,0.14), h=F.rr(0.32,0.5); if(F.chance(0.25)) F.rod(x,y+0.1,-0.1, x,y+0.1,0.15, 0.06, PAL.abTin, 'metal');
            else F.box(x,y+0.04,0, w,h,0.32, F.rr(-0.06,0.06), F.pick([PAL.abSailRed, PAL.abBrightTeal, 0x6a4a2a, PAL.abGild, 0x3a4a6a]), 'cloth'); x+=w+0.02; } } }); } });
  FURN({ key:'abyss_reading_table', name:'Reading table with stools', culture:AB, room:'library', place:'indoor', w:2.4, d:1.6, h:1.0, variants:1,
    build:function(F){ var pk=F.pick(PLANKC); F.box(0,0.72,0, 2.0,0.07,0.8, 0, pk, 'plank'); [[-0.9,-0.3],[0.9,-0.3],[-0.9,0.3],[0.9,0.3]].forEach(function(p){ F.box(p[0],0,p[1], 0.07,0.72,0.07, 0, pk, 'timber'); });
      [-0.6,0.6].forEach(function(x){ [-0.7,0.7].forEach(function(z){ F.cyl(x,0,z, 0.18,0.45, 0, F.pick(PLANKC), 'plank'); }); }); F.box(0.3,0.79,0, 0.4,0.05,0.3, 0.2, PAL.abSailRed, 'cloth'); } });
  /* ---------- yard and water ---------- */
  FURN({ key:'abyss_water_butt', name:'Water butt', culture:AB, room:'yard', place:'outdoor', w:1.0, d:1.0, h:1.3, variants:1,
    build:function(F){ var c=ABYSS.rust(F); F.cyl(0,0,0, 0.45,1.15, 0, c, 'rust'); F.cyl(0,1.15,0, 0.48,0.05, 0, F.pick(PLANKC), 'plank'); F.rod(0.45,0.3,0, 0.6,0.3,0, 0.03, BRASSC[1], 'metal'); } });
  FURN({ key:'abyss_well', name:'Salt-marsh well with a sweep', culture:AB, room:'court', place:'outdoor', w:5.0, d:2.4, h:4.2, variants:1,
    build:function(F){ var tc=wood(F); F.lathe('rubble', 0,0, [[1.0,0],[1.0,0.8]], PAL.abRubble, { seg:14 }); F.cyl(0,0.78,0, 0.8,0.04, 0, SALTWATERC[1], 'plaster');
      F.cyl(1.6,0,0, 0.12,2.6, 0, tc, 'timber'); F.rod(-1.6,3.9,0, 2.4,1.8,0, 0.08, tc, 'timber'); F.box(2.3,1.2,0, 0.5,0.5,0.5, 0, PAL.abRubble, 'rubble'); F.rod(-1.5,3.85,0, -1.5,1.2,0, 0.015, PAL.people.hair[2], 'timber'); LOCUS.drum(F, -1.5,0.55,0, ABYSS.rust(F)); } });
  FURN({ key:'abyss_planter', name:'Planter (a cut can or jar)', culture:AB, room:'balcony', place:'both', w:0.7, d:0.7, h:0.6, variants:2, variantNames:['cut tin','clay jar'],
    build:function(F){ if(F.variant) F.lathe('adobe', 0,0, [[0.2,0],[0.3,0.3],[0.26,0.52]], F.pick(ADOBEREDC), { seg:9 }); else F.cyl(0,0,0, 0.28,0.5, 0, F.pick([PAL.abBrightTeal, PAL.abSailRed, PAL.abBrightYellow, PAL.abTin]), 'corrugate');
      F.cyl(0,0.46,0, 0.24,0.04, 0, 0x3a2a1a, 'adobe'); } });
  FURN({ key:'abyss_beast_shade', name:'Beast yard shade and trough', culture:AB, room:'yard', place:'outdoor', w:6.0, d:4.0, h:3.2, variants:1,
    build:function(F){ var tc=wood(F); [[-2.8,-1.8],[2.8,-1.8],[2.8,1.8],[-2.8,1.8]].forEach(function(c){ LOCUS.pole(F, c[0],c[1], 3.0, 0.1, tc, false); });
      LOCUS.canopy(F, [[-2.8,3.0,-1.8],[2.8,3.0,-1.8],[2.8,3.0,1.8],[-2.8,3.0,1.8]], F.pick(CANVASC), { sag:0.4 });
      F.box(0,0,1.2, 4.0,0.6,0.7, 0, ABYSS.rust(F), 'rust'); F.box(0,0.5,1.2, 3.8,0.06,0.5, 0, SALTWATERC[0], 'plaster');
      F.edome(-1.2,0,-0.6, 1.0,0.35,0.7, 0, 0xc8b070, 'thatch'); } });
})();
