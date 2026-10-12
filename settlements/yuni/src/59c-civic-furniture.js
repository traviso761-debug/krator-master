  /* =====================================================================================================
     15. FURNITURE  (culture 'order': the Historians' library and school fittings)
     Registered here so the catalogue and the buildings can never drift apart; the buildings place them
     with placeFurn() below.
     ===================================================================================================== */
  var BOOKC=[PLANKC[3],TILEC[0],BLUEDC[0],MOSWARMC[4],PAL.paintRed[0],TIMBERC[2],MOSGREENC[2],GILDC[3],BLUEDC[2],TILEC[3]];

  FURN({ key:'order_bookcase', name:'Library bookcase', culture:'order', room:'library', w:3.4, d:0.85, h:5.15, variants:2,
    variantNames:['tall range','gallery case'],
    build:function(F){ var h=F.variant?2.9:5.15, dep=0.80, nsh=F.variant?2:4, w=3.4, zb=-dep/2;
      /* an OPEN-FRONTED carcass: back, two sides, top and bottom, so the spines are seen */
      F.box(0,0,zb+0.06, w,h,0.12, 0, TIMBERC[1], 'timber');
      [-1,1].forEach(function(sg){ F.box(sg*(w/2-0.06),0,0, 0.12,h,dep, 0, TIMBERC[1], 'timber'); });
      F.box(0,0,0, w,0.16,dep, 0, TIMBERC[3], 'timber');
      F.box(0,h-0.18,0, w+0.14,0.18,dep+0.10, 0, TIMBERC[0], 'timber');                      /* cornice */
      F.box(0,0,dep/2-0.02, w+0.10,0.16,0.12, 0, TIMBERC[3], 'timber');                      /* plinth rail */
      for(var sh=0;sh<nsh;sh++){ var y=0.30+sh*1.05;
        F.box(0, y-0.09, 0, w-0.16,0.09,dep-0.10, 0, TIMBERC[3], 'timber');                  /* shelf board */
        for(var b=0;b<3;b++){ var off=(b-1)*(w/3);
          F.box(off, y, 0.05, w/3-0.14,0.66,0.46, 0, F.pick(BOOKC), 'plank');                /* a block of spines */
          F.box(off, y, 0.30, w/3-0.16,0.60,0.05, 0, F.pick(BOOKC), 'plank');
          if(F.chance(0.5)) F.box(off+F.rr(-0.35,0.35), y, 0.26, 0.12,0.52,0.20, F.rr(-0.3,0.3), F.pick(BOOKC), 'plank'); } }
      if(!F.variant) F.box(0,h-0.02,0, w-0.5,0.22,dep*0.7, 0, F.pick([MOSBLUEC[0],MOSWARMC[0]]), 'mosaic'); } });

  FURN({ key:'order_reading_table', name:'Reading table and benches', culture:'order', room:'library', w:2.9, d:3.0, h:0.82, variants:2,
    variantNames:['open books','with lamp'],
    build:function(F){
      F.box(0,0.72,0, 2.8,0.10,1.15, 0, PLANKC[1], 'plank');
      F.box(0,0.60,0, 2.5,0.12,0.40, 0, PLANKC[2], 'plank');                                  /* the stretcher shelf */
      [-1,1].forEach(function(sg){ F.box(sg*1.15,0,0, 0.18,0.72,0.90, 0, TIMBERC[0], 'timber');
        F.box(sg*1.05,0.42,0, 0.09,0.09,0.90, 0, TIMBERC[3], 'timber');
        F.box(0,0.42,sg*1.05, 2.4,0.09,0.34, 0, PLANKC[2], 'plank');                          /* bench */
        [-0.85,0.85].forEach(function(bx){ F.box(bx,0,sg*1.05, 0.14,0.42,0.30, 0, TIMBERC[0], 'timber'); }); });
      F.box(0.62,0.80,0.10, 0.52,0.06,0.38, 0.30, F.pick(BOOKC), 'plank');
      F.box(-0.70,0.80,-0.12, 0.46,0.07,0.34, -0.22, F.pick(BOOKC), 'plank');
      if(F.variant===1){ F.cyl(0,0.82,0, 0.10,0.34, 0, BRASSC[0], 'metal'); F.lantern(0, 1.30, 0, 0.55, 7, 0); }
      else F.box(0,0.80,0, 0.5,0.05,0.34, 0.1, PLANKC[0], 'plank'); } });

  FURN({ key:'order_lectern', name:'Reading lectern', culture:'order', room:'library', w:0.95, d:0.85, h:1.35, variants:2,
    variantNames:['plain','gilded'],
    build:function(F){ F.cyl(0,0,0, 0.30,0.10, 0, TIMBERC[3], 'timber');
      F.lathe('timber', 0,0, [[0.16,0.10],[0.10,0.40],[0.13,0.72],[0.09,1.00]], TIMBERC[0], { seg:8 });
      F.box(0,1.00,0, 0.86,0.10,0.66, [0.44,0,0], PLANKC[0], 'plank');
      F.box(0,1.12,0.02, 0.44,0.07,0.32, [0.44,0,0], F.pick(BOOKC), 'plank');
      F.box(0,0.96,0.30, 0.86,0.07,0.10, 0, TIMBERC[3], 'timber');
      if(F.variant===1){ F.box(0,1.04,-0.30, 0.90,0.06,0.10, 0, GILDC[0], 'metal'); F.ball(0,1.28,-0.30, 0.09, GILDC[0], 'metal'); } } });

  FURN({ key:'order_library_ladder', name:'Library ladder', culture:'order', room:'library', w:0.75, d:1.15, h:4.20, variants:1,
    build:function(F){ var lean=0.85, h=4.2;
      [-1,1].forEach(function(sg){ F.rod(sg*0.30,0,0.42, sg*0.30,h,0.42-lean, 0.055, TIMBERC[2], 'timber'); });
      for(var r=0;r<9;r++){ var t=r/9; F.box(0, 0.22+r*0.44, 0.42-lean*((0.22+r*0.44)/h), 0.60,0.05,0.10, 0, TIMBERC[2], 'timber'); }
      F.box(0,h-0.05,0.42-lean, 0.66,0.08,0.14, 0, TIMBERC[0], 'timber'); } });

  FURN({ key:'order_globe_stand', name:'Gilded globe on its pedestal', culture:'order', room:'library', w:2.4, d:2.4, h:3.85, variants:2,
    variantNames:['globe','armillary'],
    build:function(F){ F.lathe('plaster', 0,0, [[1.15,0],[0.85,0.5],[0.55,1.7],[0.80,2.0]], STONEC[2], { seg:12 });
      F.cyl(0,2.0,0, 0.90,0.12, 0, MOSBLUEC[0], 'mosaic');
      if(F.variant===0){ F.ball(0,2.95,0, 0.85, GILDC[0], 'metal');
        for(var b=0;b<3;b++) F.cyl(0,2.10+b*0.62,0, 0.87-Math.abs(b-1)*0.12, 0.05, 0, MOSBLUEC[2], 'mosaic'); }
      else { for(var r=0;r<3;r++){ var a=r*PI/3; F.tube('metal', (function(){ var pts=[]; for(var k=0;k<=12;k++){ var t=k/12*PI;
            pts.push({ x:Math.cos(a)*0.82*Math.sin(t), y:2.12+0.82-0.82*Math.cos(t), z:Math.sin(a)*0.82*Math.sin(t), r:0.05 }); } return pts; })(), GILDC[0], { seg:5 }); }
        F.ball(0,2.94,0, 0.22, GILDC[2], 'metal'); } } });

  FURN({ key:'order_pupil_desk', name:'Pupils’ bench-desk', culture:'order', room:'school', w:2.5, d:1.25, h:0.78, variants:2,
    variantNames:['two places','four places'],
    build:function(F){ var n=F.variant?4:2;
      F.box(0,0.62,-0.18, 2.4,0.08,0.62, [ -0.12,0,0], PLANKC[1], 'plank');                    /* sloped desk top */
      F.box(0,0.50,-0.46, 2.4,0.14,0.10, 0, PLANKC[0], 'plank');
      F.box(0,0.20,0.10, 2.4,0.42,0.08, 0, PLANKC[2], 'plank');                                /* the front apron */
      F.box(0,0.58,0.12, 2.4,0.10,0.12, 0, PLANKC[0], 'plank');
      [-1,1].forEach(function(sg){ F.box(sg*1.12,0,-0.18, 0.12,0.62,0.60, 0, TIMBERC[0], 'timber');
        F.box(sg*1.05,0,0.36, 0.10,0.40,0.30, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.40,0.36, 2.4,0.08,0.32, 0, PLANKC[2], 'plank');                                /* the bench */
      for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*(2.2/n);
        F.box(lx,0.68,-0.30, 0.34,0.05,0.24, 0, F.pick(BOOKC), 'plank');
        if(F.chance(0.5)) F.box(lx+0.14,0.70,-0.10, 0.16,0.03,0.12, 0.2, PAL.mosaicWhite[0], 'plank'); } } });

  FURN({ key:'order_master_chair', name:'Master’s chair', culture:'order', room:'school', w:0.85, d:0.95, h:1.45, variants:1,
    build:function(F){ [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ F.cyl(s[0]*0.33,0,s[1]*0.36, 0.055,0.46, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.46,0, 0.80,0.09,0.80, 0, PLANKC[1], 'plank');
      F.box(0,0.55,-0.36, 0.80,0.85,0.10, 0, PLANKC[0], 'plank');
      F.box(0,0.70,-0.30, 0.56,0.50,0.05, 0, MOSBLUEC[0], 'mosaic');
      F.box(0,1.36,-0.36, 0.86,0.10,0.16, 0, TIMBERC[3], 'timber'); F.ball(0,1.52,-0.36, 0.09, GILDC[0], 'metal');
      [-1,1].forEach(function(sg){ F.box(sg*0.38,0.55,0, 0.07,0.26,0.72, 0, TIMBERC[0], 'timber'); }); } });

  FURN({ key:'order_writing_board', name:'Slate writing board', culture:'order', room:'school', w:2.3, d:0.75, h:1.95, variants:2,
    variantNames:['slate','slate with abacus'],
    build:function(F){ [-1,1].forEach(function(sg){ F.rod(sg*0.95,0,0.28, sg*0.80,1.85,-0.06, 0.06, TIMBERC[0], 'timber');
      F.rod(sg*0.95,0,-0.28, sg*0.80,1.85,-0.06, 0.06, TIMBERC[0], 'timber'); });
      F.box(0,0.70,-0.04, 2.20,1.20,0.10, [ -0.06,0,0], TIMBERC[1], 'timber');
      F.box(0,0.76,0.03, 2.00,1.05,0.06, [ -0.06,0,0], PAL.paintBlack[0], 'plaster');
      F.box(0,0.66,0.07, 2.10,0.10,0.16, 0, PLANKC[2], 'plank');
      for(var c=0;c<3;c++) F.box(-0.7+c*0.5,0.74,0.10, 0.12,0.04,0.04, 0, PAL.mosaicWhite[0], 'plank');
      if(F.variant===1){ for(var r=0;r<4;r++){ F.rod(-0.85,1.05+r*0.20,0.14, 0.85,1.05+r*0.20,0.14, 0.02, BRASSC[0], 'metal');
        for(var b=0;b<6;b++) F.ball(-0.75+b*0.28, 1.05+r*0.20, 0.14, 0.055, F.pick([MOSBLUEC[0],MOSWARMC[0],MOSGREENC[0]]), 'mosaic'); } } } });

  /* w covers x -1.20..+0.87 centred (the mat rolls grow from their base along -x and hang 0.29 m out of the
     left end: KNOWN_ISSUES.md); h covers the basket on variant 1. */
  FURN({ key:'order_mat_rack', name:'Rack of rolled mats', culture:'order', room:'school', w:2.4, d:0.70, h:1.70, variants:2,
    variantNames:['four mats','six mats and a basket'],
    build:function(F){ [-1,1].forEach(function(sg){ F.box(sg*0.82,0,0, 0.10,1.35,0.62, 0, TIMBERC[0], 'timber'); });
      F.box(0,0.55,0, 1.70,0.08,0.58, 0, PLANKC[2], 'plank'); F.box(0,1.25,0, 1.74,0.09,0.62, 0, PLANKC[0], 'plank');
      var n=F.variant?6:4;
      for(var i=0;i<n;i++){ var lx=(i-(n-1)/2)*(1.5/n), lo=i%2;
        F.cyl(lx,0.63+lo*0.0,0, 0.14,0.58, [0,0,PI/2], F.pick(CLOTHC), 'cloth');
        F.cyl(lx,0.10,0, 0.13,0.52, [0,0,PI/2], F.pick(CLOTHC), 'cloth'); }
      if(F.variant===1) F.lathe('thatch', 0.55,0, [[0.24,1.34],[0.30,1.52],[0.26,1.66]], THATCHC[1], { seg:10 }); } });

  /* place a registered piece from inside an ASSET's local frame */
  function placeFurn(F, key, lx,lz, yaw, ly, seedOff, variant){ var q=F.p(lx,lz);
    buildFurn(key, q[0], q[1], F.ry+(yaw||0), { y:F.y+(ly||0), seed:((F.seed||1)*31+(seedOff||0))|0, variant:variant||0, wealth:F.wealth }); }

})();
