/* ============================== 15c. THE FURNITURE CATALOGUE — SEED SET ==============================
   PLANNER-OWNED starter vocabulary: the pieces every Yuni interior needs, one per culture band,
   so a builder can pull a piece instead of re-inventing it and so the catalogue target has a
   spine to hang the rest on. Every piece is tagged with the culture that made it.
   Frame: origin at the footprint centre on the FLOOR, +z is the FRONT (the side you face it from). */
reseed(630001);
(function(){
  function legs(F, w,d, h, r0, col){ [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
    F.cyl(s[0]*(w/2-r0*1.6), 0, s[1]*(d/2-r0*1.6), r0, h, 0, col, 'timber'); }); }
  function cushion(F, lx,ly,lz, w,d, col){ F.edome(lx, ly, lz, w/2, 0.13, d/2, 0, col, 'cloth'); }

  /* ---------- yuni-common: the ordinary townhouse ---------- */
  FURN({ key:'common_low_table', name:'Low round table', culture:'yuni-common', room:'hall',
    w:1.1, d:1.1, h:0.42, variants:2, variantNames:['plain','painted rim'],
    build:function(F){ F.cyl(0,0.34,0, 0.55, 0.06, 0, PLANKC[1], 'plank');
      F.cyl(0,0,0, 0.09, 0.34, 0, TIMBERC[0], 'timber'); F.cyl(0,0,0, 0.30, 0.05, 0, TIMBERC[1], 'timber');
      if(F.variant===1) F.cyl(0,0.40,0, 0.57, 0.03, 0, F.pick(PAL.paintRed), 'paintcol'); } });

  FURN({ key:'common_floor_seating', name:'Floor mat and cushions', culture:'yuni-common', room:'hall',
    w:2.4, d:1.6, h:0.34, variants:2, variantNames:['three cushions','bolstered'],
    build:function(F){ F.box(0,0.02,0, 2.3, 0.05, 1.5, 0, F.pick(CLOTHC), 'cloth');
      for(var i=0;i<3;i++) cushion(F, (i-1)*0.72, 0.06, -0.25, 0.62, 0.62, F.pick(CLOTHC));
      if(F.variant===1){ F.cyl(0, 0.20, -0.62, 0.20, 2.0, [0,0,Math.PI/2], F.pick(CLOTHC), 'cloth'); } } });

  FURN({ key:'common_storage_chest', name:'Banded storage chest', culture:'yuni-common', room:'bedroom',
    w:1.2, d:0.62, h:0.68, variants:2, variantNames:['plain','brass-banded'],
    build:function(F){ F.box(0,0.10,0, 1.16, 0.50, 0.58, 0, PLANKC[2], 'plank');
      F.box(0,0.60,0, 1.20, 0.10, 0.62, 0, PLANKC[0], 'plank');
      legs(F, 1.16, 0.58, 0.10, 0.05, TIMBERC[3]);
      var nb = F.variant===1 ? 3 : 1;
      for(var i=0;i<nb;i++) F.box((i-(nb-1)/2)*0.40, 0.10, 0.30, 0.07, 0.52, 0.03, 0, BRASSC[0], 'metal'); } });

  FURN({ key:'common_water_jars', name:'Water jar stand', culture:'yuni-common', room:'kitchen',
    w:1.0, d:0.7, h:1.25, variants:2, variantNames:['two jars','three jars'],
    build:function(F){ F.box(0,0.55,0, 0.96, 0.07, 0.66, 0, PLANKC[3], 'plank');
      legs(F, 0.96, 0.66, 0.55, 0.045, TIMBERC[0]);
      var n=F.variant+2; for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*0.32;
        F.lathe('clay', lx, 0, [[0.09,0.62],[0.17,0.74],[0.19,0.88],[0.12,1.02],[0.08,1.10],[0.11,1.16]], F.pick(TILEC), {seg:10}); } } });

  /* ---------- yuni-court: the Emir, the oligarchs, the high houses ---------- */
  FURN({ key:'court_mosaic_divan', name:'Mosaic divan', culture:'yuni-court', room:'court',
    w:2.6, d:1.0, h:0.95, variants:2, variantNames:['bench','with back'],
    build:function(F){ F.box(0,0,0, 2.5, 0.40, 0.92, 0, MOSBLUEC[0], 'mosaic');
      for(var i=0;i<16;i++) F.box(F.rr(-1.2,1.2), F.rr(0.04,0.36), 0.47, F.rr(0.10,0.22), F.rr(0.10,0.20), 0.03, 0, F.pick(MOSWARMC), 'mosaic');
      F.box(0,0.40,0, 2.42, 0.16, 0.86, 0, F.pick(CLOTHC), 'cloth');
      for(var k=0;k<3;k++) cushion(F, (k-1)*0.80, 0.56, -0.16, 0.56, 0.52, F.pick(CLOTHC));
      if(F.variant===1){ F.box(0,0.56,-0.46, 2.5, 0.60, 0.14, 0, MOSBLUEC[2], 'mosaic');
        for(var j=0;j<10;j++) F.box(F.rr(-1.2,1.2), F.rr(0.60,1.10), -0.53, F.rr(0.10,0.20), F.rr(0.10,0.18), 0.03, 0, F.pick(MOSWARMC), 'mosaic'); } } });

  FURN({ key:'court_brass_brazier', name:'Standing brazier', culture:'yuni-court', room:'hall',
    w:0.8, d:0.8, h:1.15, variants:2, variantNames:['plain','pierced'],
    build:function(F){ for(var i=0;i<3;i++){ var a=i/3*TAU; F.rod(Math.cos(a)*0.32,0,Math.sin(a)*0.32, 0,0.62,0, 0.045, BRASSC[1], 'metal'); }
      F.lathe('metal', 0,0, [[0.10,0.58],[0.32,0.74],[0.36,0.92],[0.33,0.96]], BRASSC[0], {seg:14});
      if(F.variant===1) for(var k=0;k<8;k++){ var b=k/8*TAU; F.box(Math.cos(b)*0.345, 0.82, Math.sin(b)*0.345, 0.07,0.12,0.04, Math.atan2(Math.cos(b),Math.sin(b)), VOIDC[0], 'dark'); }
      F.lantern(0, 0.98, 0, 0.55, 5.5); } });

  FURN({ key:'court_writing_desk', name:'Curved writing desk', culture:'yuni-court', room:'study',
    w:1.7, d:0.9, h:0.78, variants:1,
    build:function(F){ F.box(0,0.70,0, 1.66, 0.07, 0.84, 0, PLANKC[0], 'plank');
      F.box(0,0.44,-0.18, 1.30, 0.26, 0.42, 0, PLANKC[1], 'plank');
      for(var s=-1;s<=1;s+=2) F.tube('timber', [{x:s*0.74,y:0,z:0.30,r:0.07},{x:s*0.62,y:0.36,z:0.16,r:0.05},{x:s*0.76,y:0.70,z:0.0,r:0.06}], TIMBERC[2], {seg:8});
      F.box(0.50,0.77,0.10, 0.34,0.05,0.26, 0.2, PAL.plank[3], 'plank'); } });

  /* ---------- sahelian / neo-African ---------- */
  FURN({ key:'sahelian_carved_stool', name:'Carved stool', culture:'sahelian', room:'hall',
    w:0.5, d:0.5, h:0.46, variants:3, variantNames:['plain','waisted','painted'],
    build:function(F){ F.cyl(0,0.38,0, 0.24, 0.07, 0, TIMBERC[1], 'timber');
      if(F.variant===1) F.lathe('timber', 0,0, [[0.20,0],[0.11,0.18],[0.11,0.24],[0.20,0.38]], TIMBERC[0], {seg:10});
      else { for(var i=0;i<4;i++){ var a=i/4*TAU+0.4; F.rod(Math.cos(a)*0.17,0,Math.sin(a)*0.17, Math.cos(a)*0.13,0.38,Math.sin(a)*0.13, 0.035, TIMBERC[0], 'timber'); } }
      if(F.variant===2) for(var k=0;k<6;k++){ var b=k/6*TAU; F.box(Math.cos(b)*0.245, 0.41, Math.sin(b)*0.245, 0.09,0.05,0.02, Math.atan2(Math.cos(b),Math.sin(b)), F.pick(PAL.paintRed), 'paintcol'); } } });

  FURN({ key:'sahelian_loom', name:'Narrow-strip loom', culture:'sahelian', room:'workshop',
    w:1.4, d:2.6, h:1.5, variants:1,
    build:function(F){ for(var s=-1;s<=1;s+=2){ F.cyl(s*0.56,0,-1.10, 0.06, 1.42, 0, TIMBERC[3], 'timber'); F.cyl(s*0.56,0, 0.60, 0.06, 0.92, 0, TIMBERC[3], 'timber'); }
      F.beam(-0.56,1.40,-1.10, 0.56,1.40,-1.10, 0.09,0.09, TIMBERC[0], 'timber');
      F.beam(-0.56,0.88,-1.10, 0.56,0.88, 0.60, 0.05,0.05, PLANKC[2], 'plank');
      for(var i=0;i<7;i++) F.beam(-0.18+i*0.06, 0.92, -1.02, -0.18+i*0.06, 0.90, 0.56, 0.02,0.02, F.pick(CLOTHC), 'cloth');
      F.box(0,0.20,0.95, 0.9, 0.34, 0.5, 0, PLANKC[1], 'plank'); } });

  /* ---------- the Order of Historians ---------- */
  FURN({ key:'order_reading_desk', name:'Reading desk', culture:'order', room:'study',
    w:1.3, d:0.8, h:1.15, variants:2, variantNames:['sloped','with lamp'],
    build:function(F){ F.box(0,0.02,0, 1.20, 0.06, 0.70, 0, PLANKC[3], 'plank');
      F.cyl(0,0,0, 0.10, 0.86, 0, TIMBERC[0], 'timber');
      F.box(0,0.86,0, 1.10, 0.06, 0.60, [0.28,0,0], PLANKC[0], 'plank');
      F.box(0,0.96,0.26, 1.10, 0.05, 0.06, 0, TIMBERC[2], 'timber');
      F.box(0,0.96,-0.02, 0.36,0.05,0.44, [0.28,0,0], F.pick(WHITEC), 'plaster');
      if(F.variant===1){ F.rod(0.52,0.92,-0.22, 0.52,1.20,-0.10, 0.03, BRASSC[2], 'metal'); F.lantern(0.52, 1.20, -0.10, 0.5, 4.5); } } });

  FURN({ key:'order_shelf_run', name:'Archive shelf run', culture:'order', room:'library',
    w:2.2, d:0.55, h:2.4, variants:2, variantNames:['scrolls','codices'],
    build:function(F){ F.box(0,0,-0.24, 2.16, 2.40, 0.07, 0, PLANKC[1], 'plank');
      for(var s=-1;s<=1;s+=2) F.box(s*1.05,0,0, 0.08, 2.40, 0.54, 0, PLANKC[1], 'plank');
      for(var r=0;r<5;r++){ var y=0.36+r*0.48; F.box(0,y,0, 2.02, 0.05, 0.50, 0, PLANKC[2], 'plank');
        if(F.variant===1){ for(var b=0;b<16;b++){ var lx=-0.96+b*0.125+F.rr(-0.01,0.01), hh=F.rr(0.22,0.34);
            F.box(lx, y+0.05, 0.02, F.rr(0.045,0.085), hh, 0.34, 0, F.pick(PAL.cloth), 'cloth'); } }
        else { for(var c=0;c<9;c++) F.cyl(-0.90+c*0.225, y+0.05, 0.0, 0.075, 0.44, [0,0,Math.PI/2], F.pick(WHITEC), 'plaster'); } }
      F.box(0,2.40,0, 2.24, 0.08, 0.60, 0, TIMBERC[0], 'timber'); } });

  /* ---------- yuni-poor: mud, thatch, reed ---------- */
  FURN({ key:'poor_reed_mat_bed', name:'Reed sleeping platform', culture:'yuni-poor', room:'bedroom',
    w:1.9, d:1.0, h:0.40, variants:2, variantNames:['bare','blanket'],
    build:function(F){ for(var s=-1;s<=1;s+=2){ F.box(s*0.86,0,0, 0.12, 0.28, 0.92, 0, ADOBEC[1], 'adobe'); }
      for(var i=0;i<9;i++) F.rod(-0.90, 0.30, -0.44+i*0.11, 0.90, 0.30, -0.44+i*0.11, 0.035, THATCHC[2], 'thatch');
      F.box(0,0.33,0, 1.76, 0.05, 0.90, 0, THATCHC[0], 'reedmat');
      if(F.variant===1) F.box(0,0.37,0.08, 1.60, 0.05, 0.70, 0, F.pick(CLOTHC), 'cloth'); } });

  FURN({ key:'poor_hearth_stones', name:'Three-stone hearth', culture:'yuni-poor', room:'kitchen',
    w:1.0, d:1.0, h:0.55, variants:1,
    build:function(F){ F.cyl(0,0,0, 0.42, 0.06, 0, ADOBEC[3], 'adobe');
      for(var i=0;i<3;i++){ var a=i/3*TAU+0.5; F.blob(Math.cos(a)*0.26, 0.02, Math.sin(a)*0.26, 0.13, 0.22, a, PAL.concrete[3], 'rock'); }
      F.lathe('clay', 0,0, [[0.16,0.24],[0.24,0.34],[0.22,0.46],[0.15,0.52]], TILEC[1], {seg:10});
      F.lamp(0, 0.20, 0, 0.42, 3.2); } });

  /* ---------- salvaged Ancient parts, re-made by Yuni hands ---------- */
  FURN({ key:'salvage_panel_table', name:'Salvaged panel table', culture:'ancients-salvage', room:'workshop',
    w:1.8, d:0.9, h:0.80, variants:2, variantNames:['on struts','on masonry'],
    build:function(F){ F.box(0,0.74,0, 1.76, 0.06, 0.86, 0, PAL.metalTarn[0], 'metal');
      for(var i=0;i<4;i++) F.box(-0.66+i*0.44, 0.71, 0, 0.03, 0.05, 0.86, 0, PAL.rust[0], 'rust');
      if(F.variant===1){ for(var s=-1;s<=1;s+=2) F.box(s*0.72, 0, 0, 0.26, 0.74, 0.74, 0, F.pick(ADOBEC), 'adobe'); }
      else { for(var k=0;k<4;k++){ var sx=k<2?-1:1, sz=k%2?-1:1;
        F.rod(sx*0.74, 0, sz*0.36, sx*0.62, 0.74, sz*0.28, 0.045, PAL.metalTarn[2], 'metal'); } } } });
})();
