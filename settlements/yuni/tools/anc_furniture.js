/* ------------------------------------------------------------------ FURNITURE (hand-written; tools/anc_furniture.js)
   Two cultures: `ancient` — what the Ancients themselves moulded, still standing inside a worn shell; and
   `ancients-salvage` — the same stock cut up and re-made by Yuni hands. Everything is in METRES: a seat is
   0.44 m off the floor, a table 0.76, a locker wall 2.0. Origin at the footprint centre on the FLOOR, +z is
   the front. Rust dominates the ageing (round 4's rule); nothing grows indoors.                            */
(function(){
  var TARN = PAL.metalTarn, WHT = PAL.metal, RST = PAL.rust, GLS = PAL.glass, VD = PAL.darkVoid;
  /* Rust at furniture scale. A metre-high locker cannot carry the shell pass's long streaks — at 1:1 they read
     as sticks glued to the front — so it is a bled band along the edge itself plus a few small blooms. */
  function bleed(F, lx,ly,lz, w, n, dir){ var z=lz+(dir||0.008);
    F.box(lx, ly-0.012, z, w*0.98, 0.022, 0.006, 0, F.pick(RST), 'rust');
    for(var i=0;i<n;i++){ var t=(i+0.5)/n-0.5+F.rr(-0.04,0.04), h=F.rr(0.03,0.09);
      F.box(lx+t*w, ly-0.012-h, z, F.rr(0.012,0.035), h, 0.005, 0, F.pick(RST), 'rust'); } }
  /* a small oil lamp: the fitting a Yuni tenant actually puts on an Ancient surface (F.lantern is a 0.5 m
     hanging lamp and dwarfs a desk). Geometry here, light through F.lamp. */
  function oilLamp(F, lx,ly,lz){ F.lathe('metal', lx,lz, [[0.055,ly],[0.085,ly+0.05],[0.07,ly+0.10],[0.045,ly+0.12]], F.pick(BRASSC), {seg:10});
    F.ball(lx, ly+0.15, lz, 0.045, PAL.glowWarm[0], 'glowmat'); F.lamp(lx, ly+0.15, lz, 0.5, 4.5); }
  /* the moulded foot every Ancient fitting grows out of: a flare where the piece meets the floor */
  function foot(F, lx,lz, r0, h, col){ F.lathe('metal', lx,lz, [[r0*1.5,0],[r0*1.05,h*0.35],[r0,h]], col, {seg:12}); }
  /* a dead indicator strip, sunk into a fascia. Only the Grand Vault has power: these never light. */
  function deadStrip(F, lx,ly,lz, w, nz){ F.box(lx,ly,lz, w, 0.035, 0.02, 0, VD[0], 'dark');
    F.box(lx,ly-0.018,lz+(nz||0.008), w*0.98, 0.015, 0.012, 0, PAL.concrete[3], 'concrete'); }

  /* ================= ancient: as the Ancients made it ================= */

  FURN({ key:'ancient_moulded_bench', name:'Moulded seating pod', culture:'ancient', room:'hall',
    w:1.9, d:0.95, h:0.72, variants:2, variantNames:['worn','cushioned by the tenants'],
    build:function(F){ var c=F.pick(TARN);
      F.edome(0,0,0.00, 0.86,0.30,0.36, 0, c, 'metal');                                  /* the mound it grows out of */
      F.box(0,0.24,0.00, 1.52,0.10,0.50, 0, shade(c,-0.06), 'metal');                    /* the apron under the seat */
      F.box(0,0.34,0.00, 1.60,0.08,0.56, 0, shade(c,0.07), 'metal');                     /* the seat slab */
      F.edome(0,0.35,0.00, 0.70,0.035,0.24, 0, shade(c,0.02), 'metal');                  /* its moulded dish */
      F.tube('metal', [{x:-0.76,y:0.40,z:-0.18,r:0.045},{x:-0.34,y:0.58,z:-0.26,r:0.055},
                       {x: 0.34,y:0.59,z:-0.26,r:0.055},{x: 0.76,y:0.40,z:-0.18,r:0.045}], shade(c,0.03), {seg:8});
      for(var i=0;i<5;i++) F.box(-0.60+i*0.30, 0.245, 0.252, 0.03, 0.09, 0.012, 0, VD[1], 'dark');   /* moulded flutes in the apron */
      bleed(F, 0, 0.34, 0.284, 1.5, 6, 0.008);
      if(F.variant===1){ F.edome(-0.34,0.42,0.02, 0.40,0.11,0.24, 0, F.pick(CLOTHC), 'cloth');
        F.edome( 0.44,0.42,0.00, 0.28,0.12,0.22, 0.3, F.pick(CLOTHC), 'cloth');
        F.box(0.02,0.43,-0.18, 0.50,0.06,0.26, 0.1, F.pick(AWNINGC), 'cloth'); } } });

  FURN({ key:'ancient_glass_console', name:'Glass-topped console', culture:'ancient', room:'study',
    w:1.6, d:0.72, h:0.80, variants:2, variantNames:['worn','in use again'],
    build:function(F){ var c=F.pick(TARN);
      foot(F, -0.52, 0, 0.13, 0.66, c); foot(F, 0.52, 0, 0.13, 0.66, c);
      F.box(0,0.62,-0.06, 1.44,0.10,0.52, 0, c, 'metal');                                 /* the moulded carcass */
      F.box(0,0.56,0.16, 1.30,0.14,0.16, 0, shade(c,-0.10), 'metal');                      /* the fascia */
      deadStrip(F, 0, 0.60, 0.245, 1.10);
      F.box(0,0.715,0, 1.56,0.035,0.68, 0, shade(c,0.02), 'metal');                         /* the rim the glass sits in */
      F.box(0,0.748,0, 1.36,0.018,0.52, 0, shade(GLS[2],0.30), 'glass');                     /* the blue glass top */
      F.box(0,0.752,0, 0.70,0.010,0.44, 0, shade(GLS[2],0.42), 'glass');
      bleed(F, 0, 0.62, 0.28, 1.2, 6, 0.01);
      if(F.variant===1){ F.box(-0.42,0.76,0.04, 0.34,0.06,0.26, 0.12, PLANKC[1], 'plank');   /* a board and a lamp */
        F.lathe('tile', 0.34, -0.06, [[0.05,0.76],[0.09,0.84],[0.08,0.92],[0.05,0.95]], F.pick(TILEC), {seg:10});
        oilLamp(F, 0.56, 0.77, 0.10); } } });

  FURN({ key:'ancient_cell_wall', name:'Wall of storage cells', culture:'ancient', room:'store',
    w:2.2, d:0.46, h:2.05, variants:2, variantNames:['worn','curtained and lived in'],
    build:function(F){ var c=F.pick(TARN), NX=5, NY=5, cw=2.06/NX, ch=1.86/NY;
      F.box(0,0,-0.16, 2.16, 2.00, 0.12, 0, shade(c,-0.08), 'metal');                       /* the back */
      F.box(0,1.98,0, 2.20, 0.07, 0.44, 0, c, 'metal');                                     /* the capping */
      F.box(0,0,0, 2.20, 0.10, 0.44, 0, shade(c,-0.14), 'metal');                           /* the plinth */
      for(var s=-1;s<=1;s+=2) F.box(s*1.07,0.10,0, 0.06, 1.88, 0.44, 0, c, 'metal');
      for(var iy=0; iy<NY; iy++){ var y=0.10+iy*ch;
        F.box(0, y, 0, 2.08, 0.035, 0.44, 0, shade(c,-0.04), 'metal');                       /* the shelf between courses */
        for(var ix=0; ix<NX; ix++){ var x=(ix-(NX-1)/2)*cw, open=F.chance(0.42);
          F.box(x, y+0.03, -0.02, cw-0.07, ch-0.09, 0.30, 0, VD[0], 'dark');                 /* the socket */
          if(!open){ F.box(x, y+0.03, 0.17, cw-0.08, ch-0.10, 0.035, 0, shade(c,0.04), 'metal');   /* a sealed door */
            F.box(x, y+ch*0.42, 0.20, cw*0.30, 0.03, 0.02, 0, VD[1], 'dark');                /* its moulded pull */
            if(F.chance(0.25)) bleed(F, x, y+0.03, 0.20, cw*0.6, 3, 0.005); }
          else if(F.chance(0.5)) F.box(x, y+0.05, 0.02, cw-0.16, ch*0.45, 0.22, 0, F.pick(PAL.concrete), 'concrete'); } }
      bleed(F, 0, 1.98, 0.23, 2.0, 9, 0.01);
      if(F.variant===1){ for(var k=0;k<3;k++){ var cx=(F.rnd()<0.5?-1:1)*F.rr(0.2,0.9), cy=0.10+Math.floor(F.rr(0,NY))*ch;
          F.box(cx, cy+0.04, 0.20, cw-0.06, ch-0.12, 0.02, 0, F.pick(CLOTHC), 'cloth'); }                /* curtains */
        F.box(0.70, 2.05, 0.02, 0.36, 0.10, 0.30, 0, PLANKC[2], 'plank');                                 /* a box on top */
        F.rod(-0.72,2.02,-0.10, -0.72,2.02,0.22, 0.015, F.pick(RST), 'rust');                              /* a wired-on bracket */
        F.lantern(-0.72, 2.02, 0.22, 0.55, 5, 0.30); } } });

  FURN({ key:'ancient_berth', name:'Sleeping berth shell', culture:'ancient', room:'bedroom',
    w:2.15, d:1.15, h:1.08, variants:2, variantNames:['worn','made up for sleeping'],
    build:function(F){ var c=F.pick(TARN);
      F.box(0,0,-0.02, 2.06,0.30,1.02, 0, shade(c,-0.10), 'metal');                         /* the moulded base */
      F.box(0,0.30,0.00, 1.92,0.06,0.86, 0, shade(c,0.05), 'metal');                        /* the sleeping tray */
      F.box(0,0.30,0.45, 2.02,0.12,0.06, 0, c, 'metal');                                    /* the front lip */
      F.box(0,0.20,-0.50, 2.06,0.86,0.08, 0, shade(c,-0.04), 'metal');                      /* the back */
      F.box(0,0.20,-0.44, 1.90,0.74,0.03, 0, VD[0], 'dark');                                /* its dark lining */
      for(var s=-1;s<=1;s+=2) F.box(s*0.99,0.20,-0.06, 0.08,0.74,0.90, 0, shade(c,-0.02), 'metal');   /* the side fins */
      F.edome(0,0.90,-0.06, 1.03,0.18,0.52, 0, c, 'metal');                                 /* the arched canopy */
      F.box(0,0.86,0.44, 2.02,0.09,0.08, 0, shade(c,0.03), 'metal');                        /* the canopy's front edge */
      deadStrip(F, 0, 0.74, -0.40, 0.9, 0.012);
      bleed(F, 0, 0.30, 0.49, 1.8, 6, 0.01); bleed(F, 0, 0.86, 0.485, 1.8, 5, 0.01);
      if(F.variant===1){ F.box(0,0.36,0.02, 1.84,0.09,0.80, 0, F.pick(WHITEC), 'cloth');
        F.edome(-0.68,0.44,-0.18, 0.28,0.10,0.20, 0, F.pick(WHITEC), 'cloth');
        F.box(0.16,0.41,0.10, 1.40,0.06,0.74, 0, F.pick(AWNINGC), 'cloth');
        var cc=F.pick(CLOTHC);                                                              /* the curtain, half drawn, in folds */
        for(var k=0;k<5;k++) F.box(-0.90+k*0.20, 0.30, 0.42+(k%2?0.03:0), 0.19, 0.55, 0.02, 0, k%2?shade(cc,-0.08):cc, 'cloth');
        F.rod(-0.98,0.855,0.42, 0.98,0.855,0.42, 0.012, F.pick(RST), 'rust'); } } });

  FURN({ key:'ancient_light_stem', name:'Luminous ring on a stem', culture:'ancient', room:'antechamber',
    w:0.86, d:0.86, h:2.30, variants:2, variantNames:['dead','relit by the Order'],
    build:function(F){ var c=F.pick(TARN), lit=(F.variant===1), R=0.38, pts=[], i;
      foot(F, 0,0, 0.17, 0.30, c);
      F.lathe('metal', 0,0, [[0.10,0.28],[0.07,1.10],[0.06,1.86],[0.09,1.96]], c, {seg:12});   /* the stem */
      for(i=0;i<=18;i++){ var a=i/18*Math.PI*2; pts.push({ x:Math.cos(a)*R, y:2.06, z:Math.sin(a)*R, r:0.032 }); }
      F.tube('metal', pts, c, {seg:6});                                                        /* the ring carcass */
      for(i=0;i<=18;i++){ var b=i/18*Math.PI*2; pts[i]={ x:Math.cos(b)*R, y:1.88, z:Math.sin(b)*R, r:0.05 }; }
      F.tube(lit?'glowmat':'dark', pts, lit?PAL.glowWarm[0]:VD[0], {seg:8});                    /* the element, slung below it */
      for(i=0;i<4;i++){ var g=i/4*Math.PI*2+0.4;                                                /* the drops that carry it */
        F.rod(Math.cos(g)*R,2.06,Math.sin(g)*R, Math.cos(g)*R,1.90,Math.sin(g)*R, 0.014, shade(c,-0.10), 'metal'); }
      for(i=0;i<3;i++){ var t=i/3*Math.PI*2; F.rod(Math.cos(t)*0.09,1.92,Math.sin(t)*0.09, Math.cos(t)*(R-0.02),2.05,Math.sin(t)*(R-0.02), 0.022, shade(c,-0.06), 'metal'); }
      bleed(F, 0, 1.90, 0.10, 0.12, 3, 0.01);
      if(lit){ F.lamp(0, 1.88, 0, 0.9, 7); F.box(0.07,0.30,0.08, 0.03,0.9,0.02, 0.2, PAL.rust[1], 'rust'); }  /* a cable run up the stem */
      else deadStrip(F, 0, 0.60, 0.11, 0.10); } });

  FURN({ key:'ancient_refectory_run', name:'Fixed refectory run', culture:'ancient', room:'hall',
    w:3.2, d:1.70, h:0.78, variants:2, variantNames:['worn','set for a meal'],
    build:function(F){ var c=F.pick(TARN), s;
      for(s=-1;s<=1;s+=2) foot(F, s*1.15, 0, 0.19, 0.68, c);                                   /* two moulded pedestals */
      F.box(0,0.62,0, 2.40,0.10,0.52, 0, shade(c,-0.08), 'metal');
      F.box(0,0.72,0, 3.10,0.06,0.74, 0, shade(c,0.05), 'metal');                              /* the table top */
      F.box(0,0.70,0, 2.90,0.02,0.60, 0, GLS[1], 'glass');                                     /* a glass inlay down its spine */
      for(s=-1;s<=1;s+=2){                                                                     /* the fixed benches */
        F.box(0, 0.38, s*0.62, 2.84, 0.07, 0.34, 0, shade(c,0.02), 'metal');
        for(var i=0;i<3;i++) F.lathe('metal', (i-1)*1.10, s*0.62, [[0.13,0],[0.07,0.20],[0.10,0.38]], c, {seg:10}); }
      bleed(F, 0, 0.72, 0.38, 2.8, 11, 0.01); bleed(F, 0, 0.38, 0.79, 2.6, 6, 0.01);
      if(F.variant===1){ F.box(0,0.755,0, 2.60,0.02,0.34, 0, F.pick(CLOTHC), 'cloth');
        for(var k=0;k<5;k++){ var lx=(k-2)*0.58;
          F.lathe('tile', lx, F.rr(-0.14,0.14), [[0.10,0.78],[0.13,0.83],[0.11,0.88]], F.pick(TILEC), {seg:10}); }
        oilLamp(F, 1.18, 0.78, 0.05); } } });

  FURN({ key:'ancient_socket_rack', name:'Instrument rack of sockets', culture:'ancient', room:'workshop',
    w:1.45, d:0.62, h:1.95, variants:2, variantNames:['worn','stripped for parts'],
    build:function(F){ var c=F.pick(TARN), stripped=(F.variant===1), s, r, k;
      for(s=-1;s<=1;s+=2){ F.box(s*0.66, 0, 0, 0.09, 1.86, 0.50, 0, c, 'metal');                /* the frame uprights */
        F.rod(s*0.66,1.86,0, s*0.66,1.92,0, 0.05, shade(c,0.05), 'metal'); }
      F.box(0,0,0, 1.40,0.09,0.54, 0, shade(c,-0.12), 'metal');
      F.box(0,1.86,0, 1.44,0.08,0.54, 0, c, 'metal');
      F.box(0,0.09,-0.20, 1.24,1.77,0.10, 0, shade(c,-0.06), 'metal');                          /* the back plate */
      for(r=0;r<4;r++){ var y=0.30+r*0.40;
        F.box(0, y, 0.10, 1.22, 0.30, 0.16, 0, VD[0], 'dark');                                  /* the socket bay */
        if(!(stripped && r!==3)) for(k=0;k<6;k++){ var x=(k-2.5)*0.20;
          F.cyl(x, y+0.05, 0.19, 0.055, 0.14, [Math.PI/2,0,0], shade(c,-0.02), 'metal');        /* the sockets */
          F.cyl(x, y+0.12, 0.25, 0.032, 0.02, [Math.PI/2,0,0], F.chance(0.3)?GLS[0]:VD[1], F.chance(0.3)?'glass':'dark'); }
        else for(k=0;k<3;k++) F.rod((k-1)*0.34, y+0.16, 0.14, (k-1)*0.34+F.rr(-0.1,0.1), y-0.12, 0.30, 0.012, F.pick(RST), 'rust');  /* cut cable stubs */
        deadStrip(F, 0, y+0.24, 0.19, 1.05); }
      F.box(0,1.66,0.12, 0.62,0.18,0.10, 0, stripped?VD[0]:GLS[0], stripped?'dark':'glass');    /* the reading lens */
      bleed(F, 0, 1.86, 0.28, 1.2, 7, 0.01);
      if(stripped){ F.box(0.30,0.09,0.24, 0.40,0.26,0.24, 0.2, PLANKC[3], 'plank');             /* a crate of the takings */
        for(k=0;k<4;k++) F.cyl(0.18+k*0.08, 0.35, 0.24, 0.045, 0.10, [Math.PI/2,0,0], F.pick(TARN), 'metal'); } } });

  /* ================= ancients-salvage: cut up and re-made by Yuni hands ================= */

  FURN({ key:'salvage_strut_bed', name:'Bed frame of strut stock', culture:'ancients-salvage', room:'bedroom',
    w:2.00, d:1.20, h:0.62, variants:2, variantNames:['bare frame','made up'],
    build:function(F){ var c=F.pick(TARN), s, i;
      for(s=-1;s<=1;s+=2){ F.box(0, 0.30, s*0.54, 1.92, 0.09, 0.07, 0, c, 'metal');             /* cut struts, side rails */
        F.box(0, 0.38, s*0.54, 1.92, 0.05, 0.05, 0, F.pick(RST), 'rust'); }
      for(s=-1;s<=1;s+=2){ F.box(s*0.94, 0.30, 0, 0.07, 0.09, 1.02, 0, c, 'metal');
        for(i=0;i<4;i++){ var sz=(i%2?-1:1)*0.50;                                                /* legs: strut offcuts, welded askew */
          F.rod(s*0.90, 0.30, sz, s*0.86+F.rr(-0.03,0.03), 0, sz+F.rr(-0.05,0.05), 0.035, F.pick(RST), 'rust'); } }
      for(i=0;i<11;i++) F.box(0, 0.35, -0.50+i*0.10, 1.86, 0.03, 0.06, 0, PLANKC[2], 'plank');   /* sawn boards across */
      F.box(-0.96, 0.39, 0, 0.05, 0.52, 1.00, 0, PAL.metalTarn[2], 'metal');                     /* a cut panel as a headboard */
      for(i=0;i<5;i++) F.box(-0.93, 0.45+F.rr(-0.02,0.02), -0.40+i*0.20, 0.012, F.rr(0.10,0.30), 0.03, 0, F.pick(RST), 'rust');
      if(F.variant===1){ F.box(0.05,0.38,0, 1.72,0.11,0.94, 0, F.pick(WHITEC), 'cloth');
        F.edome(-0.66,0.48,0, 0.30,0.10,0.26, 0, F.pick(WHITEC), 'cloth');
        F.box(0.30,0.47,0.06, 1.10,0.05,0.86, 0, F.pick(AWNINGC), 'cloth'); } } });

  FURN({ key:'salvage_panel_screen', name:'Room screen of cut panel', culture:'ancients-salvage', room:'hall',
    w:1.85, d:0.40, h:1.72, variants:2, variantNames:['three leaves','curtained leaf'],
    build:function(F){ var c=F.pick(TARN), ang=[-0.34,0,0.34], i, k;
      for(i=0;i<3;i++){ var lx=(i-1)*0.58, lz=(i===1?-0.05:0.06), a=ang[i];
        F.box(lx, 0.06, lz, 0.56, 1.58, 0.035, a, i===1?PAL.metalTarn[1]:c, 'metal');            /* three cut leaves */
        F.box(lx, 0.0, lz, 0.60, 0.07, 0.10, a, PAL.concrete[1], 'concrete');                    /* on stone feet */
        F.box(lx, 1.64, lz, 0.58, 0.05, 0.06, a, TIMBERC[0], 'timber');                          /* a sawn rail over the top */
        for(k=0;k<3;k++) F.box(lx+F.rr(-0.2,0.2), 0.10+k*0.48, lz+0.022, F.rr(0.03,0.09), F.rr(0.10,0.34), 0.012, a, F.pick(RST), 'rust');
        if(i!==1) for(k=0;k<2;k++) F.box(lx+F.rr(-0.18,0.18), 0.40+k*0.55, lz+0.03, 0.14, 0.20, 0.02, a, VD[0], 'dark'); }  /* cut-outs */
      if(F.variant===1){ F.box(0.58, 0.10, 0.10, 0.52, 1.44, 0.02, 0.34, F.pick(CLOTHC), 'cloth');
        F.rod(0.30,1.66,0.08, 0.86,1.66,0.14, 0.02, TIMBERC[1], 'timber'); } } });

  FURN({ key:'salvage_locker_press', name:'Storage press on a mud plinth', culture:'ancients-salvage', room:'store',
    w:1.50, d:0.62, h:1.80, variants:2, variantNames:['worn','shop counter'],
    build:function(F){ var c=F.pick(TARN), i;
      F.box(0, 0, 0, 1.46, 0.42, 0.60, 0, F.pick(ADOBEC), 'adobe');                              /* the mud plinth */
      F.box(0, 0.42, 0, 1.40, 0.05, 0.58, 0, PAL.concrete[2], 'concrete');
      F.box(0, 0.47, -0.04, 1.32, 1.24, 0.46, 0, c, 'metal');                                    /* the locker bank, cut down */
      for(i=0;i<3;i++){ var y=0.52+i*0.41;
        F.box(0, y, 0.20, 1.20, 0.34, 0.035, 0, shade(c,0.05), 'metal');                         /* doors */
        F.box(0, y+0.15, 0.23, 0.30, 0.03, 0.02, 0, VD[1], 'dark');
        F.box(-0.48, y+0.14, 0.235, 0.07, 0.05, 0.03, 0, F.pick(BRASSC), 'metal'); }             /* a fitted brass catch */
      F.box(0, 1.71, -0.04, 1.40, 0.06, 0.52, 0, PLANKC[1], 'plank');                            /* a sawn board as the top */
      for(i=0;i<6;i++) F.box(-0.55+i*0.22, 0.47, 0.225, 0.02, F.rr(0.10,0.36), 0.012, 0, F.pick(RST), 'rust');
      if(F.variant===1){ F.box(0, 1.77, 0.16, 1.30, 0.05, 0.34, 0, PLANKC[0], 'plank');           /* a counter shelf */
        for(i=0;i<4;i++) F.lathe('tile', -0.45+i*0.30, 0.16, [[0.07,1.82],[0.10,1.88],[0.08,1.94]], F.pick(TILEC), {seg:10});
        F.box(0.56, 1.80, 0.34, 0.26, 0.04, 0.20, 0.2, F.pick(CLOTHC), 'cloth'); } } });

  FURN({ key:'salvage_hearth_hood', name:'Hearth hood of ducting', culture:'ancients-salvage', room:'kitchen',
    w:1.25, d:1.25, h:2.25, variants:2, variantNames:['cold','alight'],
    build:function(F){ var c=F.pick(TARN), i;
      F.cyl(0,0,0, 0.46, 0.22, 0, F.pick(ADOBEC), 'adobe');                                      /* the hearth pad */
      F.lathe('adobe', 0,0, [[0.40,0.20],[0.36,0.34],[0.34,0.44]], F.pick(ADOBEC), {seg:12});
      F.lathe('metal', 0,0, [[0.58,1.05],[0.50,1.32],[0.24,1.52],[0.17,1.62]], c, {seg:14});     /* the hood: a cut duct bell */
      F.lathe('metal', 0,0, [[0.17,1.62],[0.16,2.08],[0.19,2.20]], shade(c,-0.06), {seg:12});    /* the flue */
      for(i=0;i<3;i++){ var a=i/3*Math.PI*2+0.4;                                                 /* it stands on three strut-stock legs */
        F.rod(Math.cos(a)*0.55, 1.04, Math.sin(a)*0.55, Math.cos(a)*0.50, 0.02, Math.sin(a)*0.50, 0.028, F.pick(RST), 'rust');
        F.rod(Math.cos(a)*0.55, 1.04, Math.sin(a)*0.55, Math.cos(a+0.9)*0.52, 0.55, Math.sin(a+0.9)*0.52, 0.016, F.pick(RST), 'rust'); }
      for(i=0;i<8;i++) F.box(Math.cos(i/8*Math.PI*2)*0.57, 1.02, Math.sin(i/8*Math.PI*2)*0.57, 0.05, F.rr(0.08,0.22), 0.012, -i/8*Math.PI*2, F.pick(RST), 'rust');
      F.box(0, 1.14, 0.40, 0.70, 0.05, 0.28, 0, PLANKC[2], 'plank');                             /* a board shelf wired to the hood */
      if(F.variant===1){ for(i=0;i<5;i++){ var b=i/5*Math.PI*2;
          F.box(Math.cos(b)*0.14, 0.24, Math.sin(b)*0.14, 0.09, 0.07, 0.16, b, PAL.rust[2], 'rust'); }
        F.edome(0,0.26,0, 0.20,0.10,0.20, 0, PAL.glowWarm[0], 'glowmat'); F.lamp(0, 0.34, 0, 0.7, 4.5);
        F.lathe('tile', 0.30, -0.16, [[0.12,0.34],[0.16,0.46],[0.13,0.58],[0.09,0.62]], F.pick(TILEC), {seg:10}); } } });

  FURN({ key:'salvage_lamp_stand', name:'Lamp stand from a light stem', culture:'ancients-salvage', room:'hall',
    w:0.60, d:0.60, h:1.75, variants:2, variantNames:['oil lamp','with a cut-panel reflector'],
    build:function(F){ var c=F.pick(TARN);
      F.cyl(0,0,0, 0.22, 0.10, 0, PAL.concrete[1], 'concrete');                                  /* a stone foot for a cut stem */
      F.box(0,0.08,0, 0.30,0.05,0.30, 0.4, F.pick(RST), 'rust');
      F.lathe('metal', 0,0, [[0.055,0.10],[0.045,0.80],[0.040,1.26],[0.065,1.32]], c, {seg:10});
      for(var i=0;i<3;i++) F.box(0.0, 0.30+i*0.34, 0.048, 0.02, F.rr(0.10,0.26), 0.012, 0, F.pick(RST), 'rust');
      F.lathe('metal', 0, 0, [[0.065,1.32],[0.10,1.38],[0.08,1.44],[0.055,1.47]], F.pick(BRASSC), {seg:10});  /* the cut-down head */
      F.lantern(0, 1.48, 0, 0.55, 5);
      F.box(0.045,0.10,0.0, 0.025,1.16,0.018, 0.08, PAL.rust[1], 'rust');                          /* the rewired cable */
      if(F.variant===1){ F.box(0,1.50,-0.17, 0.34,0.30,0.02, [0.34,0,0], PAL.metalTarn[1], 'metal');  /* a cut panel, bent as a reflector */
        for(var k=0;k<3;k++) F.box(-0.10+k*0.10, 1.38, -0.16, 0.02, F.rr(0.05,0.12), 0.012, 0, F.pick(RST), 'rust');
        F.rod(0,1.44,-0.06, 0,1.50,-0.16, 0.012, shade(c,-0.08), 'metal'); } } });
})();
