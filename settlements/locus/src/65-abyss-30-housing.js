/* ============================== 16X-H. ABYSS — housing: poor, middle, rich ==============================
   Poor: salvage on piles — a drum, a container, a reed-and-sheet lean-to; little paint, mostly rust and reed, no lamps.
   Middle: stacked containers, a silo joined to a cabin by a tarp, a painted townhouse under a sail.
   Rich: a cone-shell house over terraces and a pool court; a walled sail compound on piles with a dock; a tapering
   tin-mirror tower on a rubble base. Lit lanterns only on the rich houses.                                       */
reseed(653001);
(function(){
  var PI=Math.PI;
  function plinthWin(F, x,y,z, nx,nz, w,h, col){ F.window(x,y,z, nx,nz, w,h); var yaw=Math.atan2(nx,nz); F.box(x+nx*0.06, y-h/2-0.12, z+nz*0.06, w+0.3,0.12,0.2, yaw, col, 'plaster'); }

  /* =============================================================== POOR */
  ASSET({ key:'abyss_house_poor', name:'Salvage shack', family:'poor', kit:'abyss', group:'Housing — poor', culture:'abyssal-desert', types:['single-family dwelling'],
    wealth:[0,0.3], w:10, d:10, h:7, variants:3, variantNames:['drum house','container shack','reed-and-sheet lean-to'], sim:{ activity:'REST', capacity:5 },
    build:function(F){ var v=F.variant, pc=F.pick(PILEC), tarp=PAL.abTarpBlue;
      ABYSS.water(F, 0,-1, 10,8);
      if(v===0){ /* (a) a horizontal salvaged drum on a pile deck */
        var H=1.6; ABYSS.platform(F, -3.6,3.6, -3.4,2.0, H, { pile:pc });
        var D=ABYSS.vessel(F, 'drum', -0.2,H,-1.2, { r:1.35, len:5.4, col:ABYSS.rust(F), win:[[-0.9,0]], awning:tarp, door:'end' });
        F.box(2.75,H,-1.2, 0.6,0.55,1.0, 0, F.pick(PLANKC), 'plank');                                  /* the step up to the end door */
        ABYSS.railRect(F, -3.6,3.6,-3.4,2.0, H, [['f',-1.6,-0.6],['b',-3.7,3.7],['r',-3.5,-0.4]]);
        LOCUS.ladder(F, -1.1,0,2.35, 0,1, H+0.4);
        ABYSS.furn(F, 'abyss_water_butt', 2.8,1.2, 0, { ly:H }); ABYSS.furn(F, 'abyss_smoking_rack', 1.5,3.6, 0.1);
        ABYSS.cables(F, [-2.6,D.top+0.1,-1.2], [-4.6,3.2,3.6], 0.4, 1); F.cyl(-4.6,0,3.6, 0.07,3.4, 0, F.pick(TIMBERC), 'timber');
        ABYSS.lantern(F, 1.2, H+2.3, -0.1, false); }
      else if(v===1){ /* (b) a container shack on piles, corrugated porch, water butt */
        var H1=1.2, cc=ABYSS.cont(F); ABYSS.platform(F, -4.4,4.4, -3.6,2.8, H1, { pile:pc });
        ABYSS.vessel(F, 'container', 0,H1,-1.9, { len:6.1, col:cc, win:[[1.6,1.5]], door:'side', doorAt:-1.2, doorEnd:-1 });
        F.box(0.6,H1+2.73,-1.9, 3.0,0.14,1.8, 0.05, ABYSS.rust(F), 'corrugate');                        /* a patch sheet on the roof */
        var tc=F.pick(TIMBERC); [-2.9,2.9].forEach(function(x){ F.cyl(x,H1,2.5, 0.08,2.3, 0, tc, 'timber'); });
        ABYSS.corrRoof(F, 0,H1+2.25,0.3, 6.6,2.6, 0.45, ABYSS.rust(F));
        ABYSS.furn(F, 'abyss_water_butt', 3.6,-0.2, 0, { ly:H1 }); ABYSS.furn(F, 'abyss_bench', -1.6,1.6, PI, { ly:H1 });
        LOCUS.stair(F, 1.8, 2.8+H1*1.15, 0,-1, H1, 1.0);
        ABYSS.railRect(F, -4.4,4.4,-3.6,2.8, H1, [['f',1.2,2.4],['b',-4.5,4.5]]);
        ABYSS.antenna(F, -2.2,H1+2.7,-1.9, 'mast', { h:2.4 }); ABYSS.lantern(F, -0.6, H1+2.15, 1.6, false); }
      else { /* (c) reed mats and patched sheet: a lean-to with a two-pole porch canopy */
        var H2=0.9, WH=2.5; ABYSS.platform(F, -4.0,4.0, -3.8,2.6, H2, { pile:pc });
        var hw=3.4, hz0=-3.5, hz1=0.4;
        LOCUS.matWall(F, 0, H2, hz0, 2*hw, WH+0.8, 0,-1); LOCUS.matWall(F, -hw, H2, (hz0+hz1)/2, hz1-hz0, WH, -1,0); LOCUS.matWall(F, hw, H2, (hz0+hz1)/2, hz1-hz0, WH, 1,0);
        LOCUS.matWall(F, -2.2, H2, hz1, 2.4, WH, 0,1); LOCUS.matWall(F, 2.3, H2, hz1, 2.2, WH, 0,1);
        F.box(2.3, H2+0.4, hz1+0.08, 1.6,1.3,0.05, 0.05, ABYSS.rust(F), 'corrugate');                  /* a patch nailed over the reed */
        F.box(-hw-0.08, H2+0.6, -2.0, 0.05,1.6,1.8, 0, ABYSS.rust(F), 'corrugate');
        F.door(-0.1, hz1+0.02, 0,1, 0.9, 1.9, F.pick(PLANKC), H2);
        for(var i=0;i<4;i++) ABYSS.corrRoof(F, -2.7+i*1.8, H2+WH-0.1, (hz0+hz1)/2+F.rr(-0.1,0.1), 1.95, hz1-hz0+1.2, 0.9, ABYSS.rust(F));
        LOCUS.pole(F, -3.5,2.3, H2+2.3, 0.08); LOCUS.pole(F, 3.5,2.3, H2+2.3, 0.08);
        LOCUS.canopy(F, [[-3.6,H2+WH-0.1,hz1+0.1],[3.6,H2+WH-0.1,hz1+0.1],[3.5,H2+2.3,2.3],[-3.5,H2+2.3,2.3]], F.pick(CANVASC), { sag:0.25 });
        LOCUS.stair(F, -2.4, 2.6+H2*1.15, 0,-1, H2, 1.0); ABYSS.furn(F, 'abyss_crates', 2.6,4.2, 0.2, { variant:1 }); ABYSS.furn(F, 'abyss_water_butt', 3.3,1.5, 0, { ly:H2 }); }
    } });

  /* =============================================================== MIDDLE */
  ASSET({ key:'abyss_house_mid', name:'Abyssal family house', family:'mid', kit:'abyss', group:'Housing — middle', culture:'abyssal-desert', types:['single-family dwelling'],
    wealth:[0.3,0.7], w:14, d:14, h:12, variants:3, variantNames:['stacked containers','silo house','painted townhouse'], sim:{ activity:'REST', capacity:8 },
    build:function(F){ var v=F.variant, pc=F.pick(PILEC);
      if(v===0){ /* (a) stacked, offset, cantilevered containers with an outside stair, balconies, cables and a dish */
        var H=0.8; ABYSS.platform(F, -6.4,6.4, -6.0,4.4, H, { pile:pc });
        var c1=ABYSS.cont(F), c2=ABYSS.cont(F), c3=ABYSS.cont(F), y2=H+2.7, y3=y2+2.7;
        ABYSS.vessel(F, 'container', -0.4,H,-3.4, { len:12.2, col:c1, win:[[-3.5,1.5],[3.0,1.5]], door:'side', doorAt:0 });
        ABYSS.vessel(F, 'container', 2.3,y2,-3.2, { len:6.1, col:c2, win:[[0.5,1.5]], door:'side', doorAt:-1.8, doorEnd:-1 });
        ABYSS.vessel(F, 'container', -3.2,y2,-4.0, { len:6.1, yaw:0.08, col:ABYSS.rust(F), fam:'rust', win:[[1.0,1.5]] });
        ABYSS.vessel(F, 'container', 0.4,y3,-3.6, { len:6.1, yaw:PI/2, col:c3, win:[[-1.0,1.5,1],[1.2,1.5,-1]] });      /* the top box turned across, cantilevered front and back */
        /* a balcony deck on the lower box's roof in front of the second level, with a rail */
        F.box(-0.4,y2-0.02,-1.4, 12.2,0.12,1.5, 0, F.pick(PLANKC), 'plank'); LOCUS.rail(F, -6.4,-0.65, 5.7,-0.65, y2+0.1, null, 1.0);
        /* the outside stair: deck -> balcony, along the front */
        ABYSS.flight(F, -5.6,-0.4, 1,0, H,y2, 1.0);
        ABYSS.railRect(F, -6.4,6.4,-6.0,4.4, H, [['b',-6.5,6.5],['f',-1.2,1.2]]);
        LOCUS.stair(F, 0, 4.4+H*1.15, 0,-1, H, 1.2);
        ABYSS.corrRoof(F, 3.0,H+2.3,1.3, 6.0,3.2, 0.4, ABYSS.rust(F)); [0.3,5.7].forEach(function(x){ F.cyl(x,H,2.7, 0.08,2.0, 0, F.pick(TIMBERC), 'timber'); });
        ABYSS.antenna(F, 1.3,y3+2.7,-3.6, 'dish', { r:0.75 }); ABYSS.antenna(F, -0.6,y3+2.7,-4.4, 'mast', { h:3 });
        ABYSS.cables(F, [-0.6,y3+4.8,-4.4], [-6.6,5.5,4.0], 0.8, 2); F.cyl(-6.6,0,4.0, 0.08,6.5, 0, F.pick(TIMBERC), 'timber');
        ABYSS.billboard(F, 5.5,y3-0.4,-3.6, 1,0, 3.2,1.6);
        ABYSS.furn(F, 'abyss_planter', 4.6,-1.0, 0, { ly:y2 }); ABYSS.plant(F, 'abyss_herbs', 4.6,-1.0, 0, { ly:y2+0.48 });
        ABYSS.furn(F, 'abyss_planter', -2.4,-1.0, 0, { ly:y2, variant:1 }); ABYSS.plant(F, 'abyss_herbs', -2.4,-1.0, 0, { ly:y2+0.5, variant:1 });
        ABYSS.lantern(F, 2.5, H+2.0, 2.0, false); }
      else if(v===1){ /* (b) a domed silo with portholes and a ring balcony, joined to a timber cabin by a tarp */
        var H1=1.0; ABYSS.platform(F, -6.6,6.4, -6.2,4.6, H1, { pile:pc });
        ABYSS.vessel(F, 'silo', -3.2,H1,-2.2, { r:2.7, h:6.4, col:F.pick(METALC), win:[[PI/2,1.6],[PI/2+0.7,4.4],[PI*0.95,4.4]], port:true, door:PI*0.35, balcony:3.6, ladder:PI*1.15, hatch:true });
        var cw=5.4, cd=4.6, cx=3.4, cz=-2.6, WH=2.9, pk=F.pick(PLANKC);
        F.box(cx,H1,cz, cw,WH,cd, 0, pk, 'plank'); F.box(cx,H1,cz, cw+0.06,0.4,cd+0.06, 0, shade(pk,-0.3), 'timber');
        ABYSS.corrRoof(F, cx,H1+WH,cz, cw+0.8,cd+0.8, 0.6, ABYSS.rust(F));
        F.door(cx-1.2, cz+cd/2+0.02, 0,1, 1.0, 2.1, PLANKC[3], H1); LOCUS.shutterWin(F, cx+1.2, H1+1.7, cz+cd/2+0.02, 0,1, 0.9,0.8);
        LOCUS.shutterWin(F, cx+cw/2+0.02, H1+1.7, cz, 1,0, 0.9,0.8);
        /* the tarp between silo and cabin, over the shared porch */
        LOCUS.pole(F, -0.6,2.4, H1+2.6, 0.08); LOCUS.pole(F, 2.6,2.6, H1+2.5, 0.08);
        ABYSS.sail(F, [[-0.6,H1+5.0,-2.4],[0.9,H1+WH+0.2,cz-1.0],[2.6,H1+2.5,2.6],[-0.6,H1+2.6,2.4]], PAL.abTarpBlue, { swoop:0.25, sag:0.3, fam:'canvas' });
        ABYSS.railRect(F, -6.6,6.4,-6.2,4.6, H1, [['f',-1.6,-0.2],['b',-6.7,6.5]]);
        LOCUS.stair(F, -0.9, 4.6+H1*1.15, 0,-1, H1, 1.1);
        ABYSS.furn(F, 'abyss_table_stools', 1.0,0.8, 0, { ly:H1 }); ABYSS.furn(F, 'abyss_water_butt', 5.6,1.6, 0, { ly:H1 });
        ABYSS.antenna(F, cx+1.6,H1+WH+0.5,cz-1.2, 'dish', { r:0.6 });
        ABYSS.furn(F, 'abyss_planter', 4.6,1.9, 0, { ly:H1, variant:1 }); ABYSS.plant(F, 'abyss_herbs', 4.6,1.9, 0, { ly:H1+0.5 }); }
      else { /* (c) a painted townhouse: three storeys of bright lime-wash, iron balconies, a mural, a roof terrace under a sail */
        var col=F.pick([PAL.abBrightYellow, PAL.abBrightTeal, PAL.abBrightPink, PASTELC[1], PASTELC[0]]), band=shade(col,-0.3), W=9, D=8, P=0.9, FH=3.1, n=3;
        F.box(0,0,-1, W+0.6,P,D+0.6, 0, PAL.abRubble, 'rubble');
        F.box(0,P,-1, W,FH*n,D, 0, col, 'plaster'); F.box(0,P,-1, W+0.06,0.5,D+0.06, 0, band, 'plaster');
        for(var f=1;f<n;f++) F.box(0,P+FH*f-0.1,-1, W+0.1,0.18,D+0.1, 0, band, 'relief');
        F.box(0,P+FH*n,-1, W+0.3,0.25,D+0.3, 0, band, 'relief');                                       /* cornice */
        var top=P+FH*n+0.25; LOCUS.parapet(F, 0,top,-1, W,D, 0.22,0.8, col, band);
        F.door(0, -1+D/2+0.02, 0,1, 1.2, 2.3, PAL.abBrightTeal===col?PAL.abSailRed:PAL.abBrightTeal, P);
        [-2.8,2.8].forEach(function(x){ plinthWin(F, x,P+1.7,-1+D/2+0.02, 0,1, 1.0,1.3, band); });
        for(var fl=1; fl<n; fl++){ var yy=P+FH*fl; [-2.6,0,2.6].forEach(function(x){ plinthWin(F, x,yy+1.6,-1+D/2+0.02, 0,1, 1.0,1.6, band); F.box(x,yy+0.02,-1+D/2+0.06, 1.1,1.9,0.04, 0, VOIDC[1], 'dark'); });
          ABYSS.balcony(F, 0,yy+0.02,-1+D/2, 0,1, 7.0, 1.0); }
        [1,-1].forEach(function(s){ for(var fl2=0; fl2<n; fl2++) plinthWin(F, s*(W/2+0.02),P+FH*fl2+1.7,-1, s,0, 0.9,1.2, band); });
        ABYSS.mural(F, W/2+0.02, P+FH*1.2, -1-1.8, 1,0, 2.6, 3.4);
        /* the roof terrace sail on four poles */
        var ph=top+2.6; [[-3.8,-4.4],[3.8,-4.4],[3.8,2.4],[-3.8,2.4]].forEach(function(c,i){ LOCUS.pole(F, c[0],c[1], ph+(i%2?0.4:0), 0.07, null, true); });
        ABYSS.sail(F, [[-3.8,ph,-4.4],[3.8,ph+0.4,-4.4],[3.8,ph,2.4],[-3.8,ph+0.4,2.4]], F.pick(CANVASDYEC), { swoop:0.5, band:PAL.abSailOrange, bandW:0.5 });
        ABYSS.furn(F, 'abyss_bench', 0,-3.0, 0, { ly:top }); ABYSS.furn(F, 'abyss_planter', 3.4,1.6, 0, { ly:top }); ABYSS.plant(F, 'abyss_herbs', 3.4,1.6, 0, { ly:top+0.48, variant:1 });
        ABYSS.furn(F, 'abyss_planter', -1.2,-1+D/2+0.9, 0, { ly:P+FH+0.02, variant:1 }); ABYSS.plant(F, 'abyss_herbs', -1.2,-1+D/2+0.9, 0, { ly:P+FH+0.5 });
        LOCUS.stair(F, 0, -1+D/2+0.3+P*1.15, 0,-1, P, 1.6);
        ABYSS.sign(F, -3.4, P+FH-0.3, -1+D/2+0.06, 0,1, 1.2,0.7, 'cup');
        ABYSS.lantern(F, 1.1, P+2.6, -1+D/2+0.35, false); }
    } });

  /* =============================================================== RICH */
  ASSET({ key:'abyss_house_rich', name:'Abyssal great house', family:'rich', kit:'abyss', group:'Housing — rich', culture:'abyssal-desert', types:['single-family dwelling'],
    wealth:[0.7,1.0], w:24, d:24, h:20, variants:3, variantNames:['cone shell over terraces','sail-roofed compound with a dock','tin-mirror tower house'], sim:{ activity:'REST', capacity:16 },
    build:function(F){ var v=F.variant, pc=F.pick(PILEC);
      if(v===0){ /* (a) a tall cone shell, open in a great arch, over three terraced floors with planting; a pool court in front */
        var H=1.2; ABYSS.platform(F, -11,11, -11,4, H, { pile:pc, span:3.2 });
        F.box(0,0,7.5, 16,H,7, 0, PAL.abRubble, 'rubble'); F.box(0,H-0.05,7.5, 15.4,0.1,6.4, 0, PAL.abSalt, 'plaster');   /* the court, on a rubble plinth */
        F.box(0,H-0.02,8.0, 8,0.08,3.6, 0, SALTWATERC[1], 'plaster'); F.box(0,H-0.12,8.0, 8.6,0.2,4.2, 0, PAL.abRubble, 'rubble');   /* the pool */
        ABYSS.plant(F, 'abyss_lily_pads', 1.5,8.0, 0, { ly:H+0.02, variant:1 });
        var tc=F.pick(TIMBERC), cz=-3.5, R=8.6;
        [[6.8,H,0.9],[4.8,H+2.6,0.9],[2.9,H+5.2,0.8]].forEach(function(t,i){ F.sector('plank', 0,cz, 0,t[0], 0,TAU, t[1],t[1]+t[2], F.pick(PLANKC), { faces:'tos', step:1.2 });
          F.sector('plaster', 0,cz, t[0]-0.05,t[0]+0.12, 0,TAU, t[1]+t[2],t[1]+t[2]+0.55, PASTELC[(i*3+F.variant)%PASTELC.length], { faces:'tio', step:1.0 });
          for(var k=0;k<5;k++){ var a=PI/2+(k-2)*0.45, rr=t[0]-0.5; ABYSS.furn(F, 'abyss_planter', Math.cos(a)*rr, cz+Math.sin(a)*rr, 0, { ly:t[1]+t[2], variant:k%2 });
            ABYSS.plant(F, 'abyss_herbs', Math.cos(a)*rr, cz+Math.sin(a)*rr, 0, { ly:t[1]+t[2]+0.48, variant:(k+i)%2 }); } });
        ABYSS.flight(F, 3.2,cz+5.9, -1,0, H+0.9,H+3.5, 0.9);
        ABYSS.coneShell(F, 0,cz, R, 17.5, { y0:H+0.9, fam:F.pick(['thatch','tile']), col:F.pick([THATCHC[0], 0x8a7a68]), arch:{ w:7.5, h:7.0 }, archCol:PAL.abLacquer, ring:PAL.abLacquer, k:1.3 });
        ABYSS.coneShell(F, -8.6,-8.6, 2.0, 7.5, { y0:H, fam:'tinmirror', col:PAL.abTin, k:1.0, ring:PAL.abLacquer, arch:null });
        ABYSS.coneShell(F, 8.6,-8.6, 2.0, 7.5, { y0:H, fam:'tinmirror', col:PAL.abTin, k:1.0, ring:PAL.abLacquer, arch:null });
        LOCUS.stair(F, -8-H*1.15, 9.0, 1,0, H, 1.8); ABYSS.railRect(F, -11,11,-11,4, H, [['f',-8,8]]);
        [-7.4,7.4].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,10.6, PI, { variant:1 }); });
        ABYSS.furn(F, 'abyss_bench', -5.0,6.0, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_bench', 5.0,6.0, 0, { ly:H, variant:1 });
        ABYSS.plant(F, 'abyss_creeper', -10.2,3.6, 0, { ly:H }); ABYSS.plant(F, 'abyss_creeper', 10.2,3.6, 0, { ly:H }); }
      else if(v===1){ /* (b) a walled deck compound on piles with several swooping sail roofs and a private dock at the back */
        var H1=1.8, wc=F.pick(PASTELC), band=PASTELDC[F.variant%PASTELDC.length];
        ABYSS.water(F, 0,-2, 24,20);
        ABYSS.platform(F, -11,11, -8,10, H1, { pile:pc, span:3.0 });
        /* the compound wall, open at the front gate and onto the dock, with lattice screens */
        var wall=function(x0,z0,x1,z1){ var L=Math.hypot(x1-x0,z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2, yaw=Math.atan2(x1-x0,z1-z0)+PI/2; F.box(mx,H1,mz, L,2.4,0.3, yaw, wc, 'plaster'); F.box(mx,H1+2.4,mz, L+0.1,0.2,0.45, yaw, band, 'relief'); };
        wall(-11,10, -2.2,10); wall(2.2,10, 11,10); wall(-11,-8, -3,-8); wall(3,-8, 11,-8); wall(-11,-8,-11,10); wall(11,-8,11,10);
        [-7,7].forEach(function(x){ LOCUS.lattice(F, x,H1+1.7,10.17, 0,1, 2.2,1.2); });
        [-2.2,2.2].forEach(function(x){ F.box(x,H1,10, 0.8,3.6,0.8, 0, band, 'plaster'); F.ball(x,H1+3.85,10, 0.3, PAL.abGild, 'metal'); });
        /* three pavilions, each under its own swooping sail */
        var pav=[[-6,-3,6.5,5.5],[5.5,-3.5,7,6],[0,4.2,8,4.0]];
        pav.forEach(function(p,i){ var x=p[0], z=p[1], w=p[2], d=p[3], wh=3.0, c=i===2?PAL.abBrightTeal:F.pick(PASTELC);
          if(i<2){ F.box(x,H1,z, w-1.2,wh,d-1.6, 0, c, 'plaster'); F.box(x,H1,z, w-1.1,0.45,d-1.5, 0, shade(c,-0.3), 'plaster');
            F.door(x, z+(d-1.6)/2+0.02, 0,1, 1.2, 2.3, PAL.abSailRed, H1); [-1.8,1.8].forEach(function(o){ LOCUS.lattice(F, x+o,H1+2.0,z+(d-1.6)/2+0.02, 0,1, 1.0,1.2); }); }
          var ph=H1+wh+2.0, C=[[x-w/2,ph+0.6,z-d/2],[x+w/2,ph+0.3,z-d/2],[x+w/2,ph+0.6,z+d/2],[x-w/2,ph+0.3,z+d/2]];
          C.forEach(function(q){ LOCUS.pole(F, q[0],q[2], q[1], 0.09, F.pick(TIMBERC), PAL.abGild); });
          ABYSS.sail(F, C, i===2?PAL.abSailOrange:F.pick([PAL.abSailOrange, CANVASDYEC[0], CANVASDYEC[5]]), { swoop:1.3, band:PAL.abSailOrange, bandW:0.6 }); });
        ABYSS.furn(F, 'abyss_table_stools', 0,4.2, 0, { ly:H1, variant:1 }); ABYSS.furn(F, 'abyss_bench', -2.6,5.8, PI, { ly:H1, variant:1 }); ABYSS.furn(F, 'abyss_bench', 2.6,5.8, PI, { ly:H1, variant:1 });
        ABYSS.furn(F, 'abyss_umbrella_canopy', 0,-2.0, 0, { ly:H1, variant:1 });
        /* the private dock out the back, over the water */
        ABYSS.platform(F, -2.6,2.6, -11.8,-8.0, H1-0.5, { pile:pc }); F.box(0,H1-0.62,-8.0, 5.2,0.5,0.3, 0, F.pick(PLANKC), 'plank');
        [-2.4,2.4].forEach(function(x){ F.cyl(x,0,-11.6, 0.14,H1+0.6, 0, PILEC[2], 'bark'); });
        F.edome(4.4,0.02,-10.6, 1.0,0.35,2.6, 0, PAL.abSailRed, 'plank');                                /* a moored skiff */
        LOCUS.stair(F, 0, 10+H1*1.15+0.2, 0,-1, H1, 2.6);
        [-4,4].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,11.6, PI, { variant:1 }); });
        ABYSS.plant(F, 'abyss_lily_pads', -6,-10.5, 0, { variant:1 }); ABYSS.plant(F, 'abyss_creeper', 10.2,6, -PI/2, { ly:H1 }); }
      else { /* (c) a tapering tin-mirror tower on a rubble base, salvaged-trim windows, a lantern top; a pastel annex and court */
        var B=3.4, tx=-3, tz=-4;
        F.box(tx,0,tz, 11,B,11, 0, PAL.abRubble, 'rubble'); F.box(tx,B,tz, 11.3,0.3,11.3, 0, PAL.abSalt, 'plaster');
        var prof=[[4.6,B+0.3],[4.1,B+5],[3.3,B+10],[2.5,B+14]], top=B+14;
        F.lathe('plaster', tx,tz, prof, PASTELC[6], { seg:20 }); ABYSS.tinClad(F, { lathe:[tx,tz,prof], seg:20 });
        F.lathe('relief', tx,tz, [[4.75,B+0.3],[4.75,B+0.9]], PAL.abLacquer, { seg:20 });
        [[PI/2,B+2.6],[PI/2,B+7.2],[PI/2,B+11.4],[0.2,B+4.8],[PI-0.2,B+4.8],[0.5,B+9.6],[PI-0.5,B+9.6]].forEach(function(w){ var a=w[0], rr=mix(4.6,2.5,(w[1]-B)/14)+0.06, nx=Math.cos(a), nz=Math.sin(a);
          F.window(tx+nx*rr, w[1], tz+nz*rr, nx,nz, 1.0,1.5); ABYSS.trim(F, tx+nx*rr, w[1]-0.75, tz+nz*rr, nx,nz, 1.0,1.5); });
        /* the lantern top: a lacquered gallery, a glazed drum and a tin cone */
        F.cyl(tx,top,tz, 2.9,0.3, 0, PAL.abLacquer, 'plaster'); F.cyl(tx,top+0.3,tz, 1.7,2.2, 0, PAL.glowWarm, 'glowmat'); F.lamp(tx,top+1.4,tz, 1.4, 22);
        for(var k=0;k<8;k++){ var a2=k/8*TAU; F.cyl(tx+Math.cos(a2)*1.75,top+0.3,tz+Math.sin(a2)*1.75, 0.1,2.2, 0, PAL.abGild, 'metal'); }
        F.mcone('tinmirror', tx,top+2.5,tz, 2.4, 0.05, 3.4, PAL.abTin, 20, { under:true }); F.ball(tx,top+6.2,tz, 0.3, PAL.abGild, 'metal');
        F.door(tx, tz+4.62, 0,1, 1.3, 2.5, PAL.abLacquer, B+0.3);
        LOCUS.stair(F, tx, tz+5.6+B*1.15, 0,-1, B, 2.2);
        /* the annex and its court */
        var ac=F.pick([PAL.abBrightPink, PASTELC[0], PASTELC[3]]); F.box(6.5,0,-3, 8,4.2,10, 0, ac, 'plaster'); F.box(6.5,0,-3, 8.1,0.6,10.1, 0, shade(ac,-0.3), 'plaster');
        LOCUS.parapet(F, 6.5,4.2,-3, 8,10, 0.2,0.6, ac, shade(ac,-0.3)); [ -1,1 ].forEach(function(s){ LOCUS.lattice(F, 6.5+s*2,2.6,2.02, 0,1, 1.4,1.4); });
        ABYSS.trim(F, 6.5,2.0,2.02, 0,1, 1.2,1.6); F.door(6.5, 2.02, 0,1, 1.2, 2.3, PAL.abBrightTeal, 0);
        F.box(1,0,6.8, 22,0.12,9, 0, PAL.abSalt, 'plaster');                                         /* the court */
        [-10.5,11].forEach(function(x){ F.box(x,0,6.8, 0.5,1.6,9, 0, PAL.abRubble, 'rubble'); }); F.box(-6,0,11.2, 9.5,1.6,0.5, 0, PAL.abRubble, 'rubble'); F.box(7.5,0,11.2, 7.5,1.6,0.5, 0, PAL.abRubble, 'rubble');
        ABYSS.furn(F, 'abyss_well', 4,7, 0); ABYSS.furn(F, 'abyss_bench', -5,8.5, 0, { variant:1 }); ABYSS.furn(F, 'abyss_lantern_post', -1.6,10.4, PI, { variant:1 }); ABYSS.furn(F, 'abyss_lantern_post', 1.6,10.4, PI, { variant:1 });
        ABYSS.plant(F, 'abyss_creeper', 10.6,4, -PI/2); }
    } });
})();
