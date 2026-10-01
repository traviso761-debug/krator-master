/* ============================== 16X-G. ABYSS — farming and storage ==============================
   The rural stilt farmhouse (pen, drying racks, threshing deck), the granary (domed silos on a raised deck), the
   WINDPUMP (a lattice tower with a multi-blade salvaged wheel and a tail vane, lifting brine-free water into a tank on
   stilts — the wheel and pump rod ANIMATE through LOCUS.anim(F,'windpump',...), 76-locus-anim.js) and the warehouse.
   The salt-rice farm itself is the Locus asset farm_saltrice, on this sheet too.                                   */
reseed(659001);
(function(){
  var PI=Math.PI, G='Farming and storage';

  /* =============================================================== FARMHOUSE */
  ASSET({ key:'abyss_farmhouse', name:'Marsh farmhouse', family:'poor', kit:'abyss', group:G, culture:'abyssal-desert', types:['farm','single-family dwelling'],
    wealth:[0.2,0.5], w:24, d:22, h:9, variants:2, variantNames:['stilt house, pen and threshing deck','drum-and-reed farm with a granary basket'], sim:{ activity:'FARM', capacity:8 },
    build:function(F){ var v=F.variant, H=1.6, pk=F.pick(PLANKC), tc=F.pick(TIMBERC);
      ABYSS.water(F, -5,-4, 12,12);
      if(v===0){ ABYSS.platform(F, -11,-1, -9,0, H); var WH=2.6;
        F.box(-6,H,-6, 7,WH,4.4, 0, pk, 'plank'); F.pyr(-6,H+WH,-6, 9.2,2.6,6.6, 0, F.pick(THATCHC), 'thatch'); F.box(-6,H+WH-0.02,-6, 9.3,0.06,6.7, 0, shade(THATCHC[3],-0.3), 'thatch');
        F.door(-7.4,-3.78, 0,1, 0.95, 2.0, PLANKC[3], H); LOCUS.shutterWin(F, -4.6,H+1.6,-3.78, 0,1, 0.8,0.7);
        ABYSS.railRect(F, -11,-1,-9,0, H, [['f',-4,-2.6]]); LOCUS.stair(F, -3.3, H*1.15, 0,-1, H, 1.2);
        LOCUS.pole(F, -10.6,-0.4, H+2.4, 0.08); LOCUS.pole(F, -1.4,-0.4, H+2.4, 0.08);
        LOCUS.canopy(F, [[-9.4,H+WH,-3.7],[-2.6,H+WH,-3.7],[-1.4,H+2.4,-0.4],[-10.6,H+2.4,-0.4]], F.pick(CANVASC), { sag:0.25 }); }
      else { ABYSS.platform(F, -11,-1, -9,-1, H);
        ABYSS.vessel(F, 'drum', -6.2,H,-6.0, { r:1.4, len:6.0, col:ABYSS.rust(F), win:[[-1.2,0],[1.2,0]], awning:PAL.abTarpBlue, door:'end' });
        LOCUS.matWall(F, -6,H, -2.6, 6, 2.2, 0,1); F.box(-6,H+2.2,-3.0, 7,0.08,2.0, [0.2,0,0], ABYSS.rust(F), 'corrugate');
        ABYSS.railRect(F, -11,-1,-9,-1, H, [['f',-4,-2.6]]); LOCUS.stair(F, -3.3, -1+H*1.15, 0,-1, H, 1.2);
        /* a reed granary basket on legs */
        [[2.2,-7],[4.2,-7],[2.2,-5],[4.2,-5]].forEach(function(p){ F.cyl(p[0],0,p[1], 0.1,1.4, 0, tc, 'timber'); });
        F.lathe('thatch', 3.2,-6, [[1.0,1.4],[1.4,2.4],[1.3,3.4]], F.pick(REEDMATC), { seg:12 }); F.cone(3.2,3.4,-6, 1.7,1.6, 0, F.pick(THATCHC), 'thatch'); }
      /* the animal pen: a post-and-rail fence round a beaten yard, a trough and a shade */
      F.box(6,0,-5, 9,0.06,8, 0, 0x9a8460, 'adobe');
      [[1.5,-9,10.5,-9],[10.5,-9,10.5,-1],[10.5,-1,1.5,-1],[1.5,-1,1.5,-9]].forEach(function(s,i){ var n=Math.round(Math.hypot(s[2]-s[0],s[3]-s[1])/1.6);
        for(var k=0;k<=n;k++){ var t=k/n; F.cyl(mix(s[0],s[2],t),0,mix(s[1],s[3],t), 0.07,1.2, 0, tc, 'timber'); }
        if(i!==2){ [0.5,1.0].forEach(function(y){ F.rod(s[0],y,s[1], s[2],y,s[3], 0.04, tc, 'timber'); }); } else { [0.5,1.0].forEach(function(y){ F.rod(s[0],y,s[1], 7.5,y,s[3], 0.04, tc, 'timber'); }); } });
      ABYSS.furn(F, 'abyss_beast_shade', 7.4,-6.0, 0);
      /* the threshing deck: a round timber floor with a centre post and a sweep */
      F.sector('plank', -2,6, 0, 4.2, 0, TAU, 0, 0.35, pk, { faces:'tos', step:1.0 }); F.cyl(-2,0.35,6, 0.14,1.8, 0, tc, 'timber'); F.rod(-2,1.6,6, 1.6,0.8,6.4, 0.06, tc, 'timber');
      F.edome(-3.2,0.35,5.0, 1.2,0.5,0.9, 0, PAL.paddy[3], 'leafy');
      ABYSS.furn(F, 'abyss_smoking_rack', 7,4, 0.2, { variant:1 }); ABYSS.furn(F, 'abyss_smoking_rack', 7,7.6, 0.2); ABYSS.furn(F, 'abyss_water_butt', -0.4,-1.6, 0);
      ABYSS.plant(F, 'salt_rice_stand', 3.0,9.0, 0, { variant:1 }); ABYSS.plant(F, 'salt_reed', -9.6,7.6, 0); ABYSS.plant(F, 'abyss_lily_pads', -7,-7.5, 0);
    } });

  /* =============================================================== GRANARY */
  ASSET({ key:'abyss_granary', name:'Silo granary', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['farm','infrastructure'],
    wealth:[0.3,0.7], w:28, d:24, h:16, variants:1, sim:{ activity:'STORE', capacity:12 },
    build:function(F){ var H=1.6;
      ABYSS.platform(F, -13,13, -10,8, H, { span:3.0 });
      var S=[[-8,-4.5,3.2,7.5],[-1,-5,3.6,8.5],[6.6,-4.5,3.0,7],[-4.5,3.5,2.6,6],[3.0,3.6,2.8,6.5]];
      /* the silo-cluster picture: cream render with grey bands and pale domes, not bare grey sheet */
      S.forEach(function(s,i){ ABYSS.vessel(F, 'silo', s[0],H,s[1], { r:s[2], h:s[3], col:F.pick(PAL.abCream), capCol:PAL.abCreamCap, fam:'plaster', port:true, win:[[PI/2,s[3]*0.55]], hatch:true, ladder:i%2?0:PI, door:i<3?PI/2:null }); });
      /* a catwalk joining the back three near their tops: it runs along their FRONT faces (z -1.1..-0.1, the nearest silo
         face is at z -1.4), a bracket back to each silo wall */
      var cy=H+7.2; F.box(-0.8,cy,-0.6, 14,0.12,1.0, 0, STEELDC[0], 'rust'); LOCUS.rail(F, -7.6,-0.15, 6.2,-0.15, cy, STEELDC[0], 0.9);
      S.slice(0,3).forEach(function(s){ var zf=s[1]+s[2]; F.box(s[0],cy-0.25,(zf-1.1)/2, 0.8,0.25,Math.abs(zf+1.1)+0.3, 0, STEELDC[0], 'rust'); });
      /* blue tarps over a working deck between the silos, and a small shed */
      LOCUS.pole(F, -10.8,6.8, H+3.2, 0.08); LOCUS.pole(F, -6.6,7.4, H+3.0, 0.08);
      ABYSS.sail(F, [[-9.6,H+4.0,0.6],[-6.4,H+4.4,0.0],[-6.6,H+3.0,7.4],[-10.8,H+3.2,6.8]], PAL.abTarpBlue, { swoop:0.3, sag:0.25 });
      [[-9.6,0.6,H+4.0],[-6.4,0.0,H+4.4],[0.4,-0.2,H+4.6],[5.6,0.4,H+4.0]].forEach(function(p){ LOCUS.pole(F, p[0],p[1], p[2], 0.08); });   /* the back corners' poles */
      ABYSS.sail(F, [[0.4,H+4.6,-0.2],[5.6,H+4.0,0.4],[6.4,H+3.0,7.6],[-0.4,H+3.2,7.2]], PAL.abTarpBlue, { swoop:0.3, sag:0.3 });
      LOCUS.pole(F, 6.4,7.6, H+3.0, 0.08); LOCUS.pole(F, -0.4,7.2, H+3.2, 0.08);
      F.box(9.6,H,4.0, 4,2.6,4.6, 0, F.pick(PLANKC), 'plank'); ABYSS.corrRoof(F, 9.6,H+2.6,4.0, 4.6,5.2, 0.4, ABYSS.rust(F));
      ABYSS.furn(F, 'abyss_crates', -8.6,4.4, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_crates', 1.6,6.0, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_baskets', -2,7.0, 0, { ly:H });
      ABYSS.railRect(F, -13,13,-10,8, H, [['f',-1.6,1.6]]); LOCUS.stair(F, 0, 8+H*1.15, 0,-1, H, 3.0);
      /* the antenna mast beside it, as in the silo-cluster picture */
      ABYSS.lattice(F, 11.6,-7.4, 1.8, 12, { y0:H }); ABYSS.antenna(F, 11.6,H+12,-7.4, 'mast', { h:2.6 }); ABYSS.antenna(F, 12.0,H+9,-7.0, 'dish', { r:0.9, face:PI/3 });
    } });

  /* =============================================================== WINDPUMP */
  ASSET({ key:'abyss_windmill', name:'Windpump and water tank', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['farm','infrastructure'],
    wealth:[0.2,0.6], w:16, d:14, h:16, variants:1, sim:{ activity:'FARM', capacity:2 },
    build:function(F){ var tx=-3.0, tz=-1.0, TH=11.5, hubY=TH+0.9, R1=2.4, col=F.pick([PAL.abTin, PAL.abRustB, METALC[1]]);
      F.box(tx,0,tz, 3.6,0.4,3.6, 0, PAL.abRubble, 'rubble');
      ABYSS.lattice(F, tx,tz, 3.0, TH, { y0:0.4, top:0.25 });
      F.box(tx,TH+0.3,tz, 1.0,0.6,1.0, 0, STEELDC[1], 'rust');                                           /* the gearbox head */
      F.rod(tx,hubY,tz-0.2, tx,hubY,tz+0.75, 0.09, STEELDC[2], 'rust');                                  /* the shaft */
      F.ball(tx,hubY,tz+0.75, 0.32, STEELDC[0], 'rust');                                                  /* the hub */
      /* the static rim rings that carry the blades (round, so they need not turn) */
      [R1, 1.3].forEach(function(r){ var pts=[], n=20; for(var k=0;k<=n;k++){ var a=k/n*TAU; pts.push({ x:tx+Math.cos(a)*r, y:hubY+Math.sin(a)*r, z:tz+0.72, r:0.04 }); } F.tube('rust', pts, STEELDC[0], { seg:5 }); });
      /* the tail vane, behind the wheel */
      F.rod(tx,hubY,tz-0.2, tx,hubY+0.2,tz-3.6, 0.07, STEELDC[1], 'rust');
      F.box(tx,hubY-0.6,tz-3.6, 0.04,1.6,2.0, 0, F.pick([PAL.abSailRed, PAL.abBrightYellow, PAL.abBrightTeal]), 'corrugate');
      /* the moving parts: 18 blades and the pump rod (animated in 76-locus-anim.js) */
      LOCUS.anim(F, 'windpump', { hub:[tx,hubY,tz+0.78], R0:0.45, R1:R1, n:18, bw:0.5, col:col, fam:'corrugate', speed:F.rr(1.6,2.4), phase:F.rr(0,TAU), yaw:0,
        rod:{ x:tx, z:tz, y0:1.0, len:TH-1.2, amp:0.35 } });
      /* the pump head and a pipe to the tank */
      F.cyl(tx,0.4,tz, 0.25,1.0, 0, STEELDC[0], 'rust'); LOCUS.pipe(F, [[tx,1.1,tz],[tx+2.0,1.1,tz],[tx+2.0,1.1,tz+0.5],[3.4,1.1,tz+0.5],[3.4,6.3,tz+0.5]], 0.09, PIPEC[0], 'rust');
      /* the tank on a timber stand */
      var sx=4.2, sz=-1.0, SH=5.0; [[-1.6,-1.6],[1.6,-1.6],[1.6,1.6],[-1.6,1.6]].forEach(function(c){ F.cyl(sx+c[0],0,sz+c[1], 0.16,SH, 0, F.pick(PILEC), 'bark'); });
      F.rod(sx-1.6,0.4,sz-1.6, sx+1.6,SH-0.5,sz-1.6, 0.06, F.pick(TIMBERC), 'timber'); F.rod(sx+1.6,0.4,sz+1.6, sx-1.6,SH-0.5,sz+1.6, 0.06, F.pick(TIMBERC), 'timber');
      F.box(sx,SH-0.2,sz, 4.0,0.25,4.0, 0, F.pick(PLANKC), 'plank');
      ABYSS.vessel(F, 'tank', sx,SH+0.05,sz, { r:1.8, h:2.6, col:ABYSS.rust(F), ladder:0 });
      LOCUS.pipe(F, [[sx-1.9,SH+0.6,sz],[sx-2.4,SH+0.6,sz],[sx-2.4,0.6,sz+2.4],[sx-2.4,0.6,sz+4.6]], 0.08, PIPEC[1], 'rust');
      F.box(sx-2.4,0,sz+5.6, 3.4,0.55,1.4, 0, ABYSS.rust(F), 'rust'); F.box(sx-2.4,0.42,sz+5.6, 3.2,0.08,1.2, 0, SALTWATERC[1], 'plaster');   /* the trough */
      LOCUS.ladder(F, tx+1.6,0.4,tz, 1,0, TH-0.4, STEELDC[0]);
    } });

  /* =============================================================== WAREHOUSE */
  ASSET({ key:'abyss_warehouse', name:'Salt-marsh warehouse', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['industry','market/shop'],
    wealth:[0.3,0.7], w:36, d:22, h:12, variants:2, variantNames:['corrugated shed on piles','containers under a shared sail'], sim:{ activity:'STORE', capacity:20 },
    build:function(F){ var v=F.variant;
      if(v===0){ var H=1.2, W=32, D=13, WH=6.0, c=ABYSS.rust(F);
        ABYSS.platform(F, -W/2-1,W/2+1, -D/2-1,D/2+2.4, H, { span:3.2 });
        F.box(0,H,-0.5, W,WH,D, 0, c, 'corrugate');
        for(var k=-5;k<=5;k++) F.box(k*W/11,H,-0.5+D/2+0.03, 0.12,WH,0.06, 0, STEELDC[0], 'rust');
        /* a gabled corrugated roof */
        var pa=Math.atan2(2.2,D/2), ph=D/2+0.6;                                                          /* +pitch lowers the front (as ABYSS.corrRoof) */
        [1,-1].forEach(function(s){ F.box(0,H+WH+2.2-ph/2*Math.tan(pa)+0.02,-0.5+s*ph/2, W+1.2,0.08,ph/Math.cos(pa), [s*pa,0,0], ABYSS.rust(F), 'corrugate'); });
        F.tri('corrugate', [-W/2,H+WH,-0.5-D/2],[-W/2,H+WH,-0.5+D/2],[-W/2,H+WH+2.2,-0.5], c, [-1,0,0]); F.tri('corrugate', [W/2,H+WH,-0.5-D/2],[W/2,H+WH,-0.5+D/2],[W/2,H+WH+2.2,-0.5], c, [1,0,0]);
        /* the sliding doors on their top rail, one slid open */
        F.box(0,H+4.9,-0.5+D/2+0.25, W-2,0.18,0.18, 0, STEELDC[1], 'rust');
        [[-9,0],[-4.2,0],[5.2,1],[10,0]].forEach(function(d){ F.box(d[0],H+0.05,-0.5+D/2+0.18, 4.6,4.8,0.1, 0, d[1]?shade(c,0.1):shade(c,-0.08), 'corrugate'); });
        F.box(0.2,H,-0.5+D/2+0.02, 4.6,4.6,0.05, 0, VOIDC[1], 'dark');
        ABYSS.furn(F, 'abyss_crates', -8,D/2+0.9, 0, { ly:H }); ABYSS.furn(F, 'abyss_crates', 8,D/2+0.9, 0, { ly:H, variant:2 });
        LOCUS.stair(F, 0.2, D/2+2.4+H*1.15, 0,-1, H, 4.6); ABYSS.sign(F, 13,H+4.4,-0.5+D/2+0.06, 0,1, 1.4,0.8, 'sack'); }
      else { F.box(0,0,0, 34,0.1,18, 0, PAL.abRubble, 'rubble');
        [-12.2,-6.1,0,6.1,12.2].forEach(function(x,i){ ABYSS.vessel(F, 'container', x,0.1,-5.5, { len:6.1, yaw:PI/2, col:ABYSS.cont(F), door:'end', doorEnd:-1 });
          if(i%2===0) ABYSS.vessel(F, 'container', x,2.8,-5.5, { len:6.1, yaw:PI/2, col:ABYSS.cont(F) }); });
        var C=[[-16.4,9.4,-9.2],[0,10.4,-9.2],[16.4,9.4,-9.2],[16.4,7.0,2.6],[0,8.0,2.6],[-16.4,7.0,2.6]]; C.forEach(function(q){ ABYSS.mast(F, q[0],q[2], q[1], { r:0.16 }); });
        ABYSS.sail(F, [C[0],C[1],C[4],C[5]], F.pick(CANVASC), { swoop:1.0, band:PAL.abSailRed, bandW:0.6 }); ABYSS.sail(F, [C[1],C[2],C[3],C[4]], F.pick(CANVASC), { swoop:1.0, band:PAL.abSailRed, bandW:0.6 });
        /* the yard: crates and drums */
        for(var d=0;d<6;d++) LOCUS.drum(F, -14+d*0.75, 0.1, 5.5, null, false);
        LOCUS.drum(F, -9,0.1,6.6, null, true, 0.3); LOCUS.drum(F, -8.2,0.1,7.4, null, true, 0.5);
        ABYSS.furn(F, 'abyss_crates', -3,6, 0, { variant:0 }); ABYSS.furn(F, 'abyss_crates', 1,6.4, 0.4, { variant:1 }); ABYSS.furn(F, 'abyss_crates', 6,5.8, -0.3, { variant:2 }); ABYSS.furn(F, 'abyss_crates', 11,6.6, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_lantern_post', 15.6,8.4, PI, { variant:0 }); }
    } });
})();
