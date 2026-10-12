  /* =====================================================================================================
     4. SANKORE SPIRE
     ===================================================================================================== */
  ASSET({ key:'civic_sankore_spire', name:'Sankore spire', family:'civic', districts:['prosper','market','poor'], wealth:[0.2,0.8], w:16, d:16, h:22, variants:2,
    build:function(F){
      var white=F.variant===1, fam=white?'plaster':'adobe', c=white?WHITEC[0]:ADOBEC[1], c2=white?WHITEC[1]:ADOBEC[3], base=white?PAL.paintBlack[1]:PAL.adobeDark[0];
      var tz=-1.2, TW=7.8, TH=14.5;
      /* low prayer-hall / reading room behind, walled court in front */
      F.fr8(0,0,-4.2, 13.6,3.9,6.4, 0, c2, fam); F.box(0,3.85,-4.2, 10.6,0.1,4.6, 0, PAL.lane[0], 'adobe');
      [[-6.5,-7.1],[6.5,-7.1],[-6.5,-1.3],[6.5,-1.3]].forEach(function(p){ F.fr5(p[0]*0.97,0,p[1], 1.1,4.6,1.1, 0, c, fam); F.cone(p[0]*0.95,4.5,p[1], 0.36,1.0, 0, c, fam); });
      F.archwall(fam, 0,0,7.3, 0, 15.2,2.5,0.6, 1.9,2.2, c2, {});
      [-1,1].forEach(function(sg){ F.box(sg*7.3,0,0.2, 0.6,2.5,14.2, 0, c2, fam); F.fr5(sg*7.25,0,7.25, 1.0,3.2,1.0, 0, c, fam); F.cone(sg*7.2,3.1,7.2, 0.3,0.8,0,c,fam);
        F.fr5(sg*1.7,0,7.3, 0.9,3.1,0.9, 0, c, fam); F.cone(sg*1.68,3.0,7.28, 0.28,0.8,0,c,fam); });
      F.door(0,7.2, 0,1, 1.5,2.05, PLANKC[F.variant*2]); studs(F,0,0,7.24,1.5,2.05);
      if(white){ F.box(0,0,7.3, 15.3,0.7,0.72, 0, base, 'plaster'); }
      /* the pyramidal tower, two stages, bristling with toron */
      F.fr5(0,0,tz, TW,TH,TW, 0, c, fam); if(white) F.box(0,0,tz, TW+0.1,0.9,TW+0.1, 0, base, 'plaster');
      F.fr5(0,TH,tz, 3.4,4.8,3.4, 0, c, fam); F.cone(0,TH+4.7,tz, 0.95,2.2, 0, c, fam); F.ball(0,TH+7.05,tz, 0.24, PAL.whitewash[2], 'plaster');
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ F.cone(q[0]*1.72,TH-0.05,tz+q[1]*1.72, 0.3,0.9, 0, c, fam); });
      function hw(y){ return TW/2*(1-0.5*y/TH); }
      for(var r=0;r<7;r++){ var y=2.9+r*1.75, h=hw(y), n=Math.max(1,Math.floor(2*h/1.25)); for(var i=0;i<n;i++){ var o=(i-(n-1)/2)*1.2 + ((r%2)?0.3:-0.0)*(n>1?1:0);
        F.toron(o,y,tz+h-0.05, 0,1, 1.05); F.toron(o,y,tz-h+0.05, 0,-1, 1.05); F.toron(h-0.05,y,tz+o, 1,0, 1.05); F.toron(-h+0.05,y,tz+o, -1,0, 1.05); } }
      for(var r2=0;r2<2;r2++){ var y2=TH+1.4+r2*1.5, h2=1.7*(1-0.5*(y2-TH)/4.8); [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(nn){ F.toron(nn[0]*(h2-0.05), y2, tz+nn[1]*(h2-0.05), nn[0],nn[1], 0.9); }); }
      F.fr8(0,0,tz+hw(0)-0.1, 1.9,2.6,1.2, 0, c2, fam); F.door(0,tz+hw(0)+0.46, 0,1, 0.95,1.9, PLANKC[3]);
      F.box(0,8.2,tz+hw(8.2)-0.12, 0.45,1.0,0.3, 0, VOIDC[0],'dark');
      F.lantern(1.5,2.4,7.75, 0.8,12,0); shrub(F,-4.6,4.6,0.9); if(F.wealth>0.4) cypress(F,4.8,4.4,5.5);
    } });

  /* =====================================================================================================
     5. BATHHOUSE / CISTERN
     ===================================================================================================== */
  ASSET({ key:'civic_bathhouse', name:'Bathhouse of the mosaic domes', family:'civic', districts:['prosper','market'], wealth:[0.4,0.95], w:24, d:18, h:9, variants:1,
    build:function(F){
      var wash=WHITEC[1], H=3.5, bz=-2.6;
      F.box(0,0,bz, 18.4,H,10.4, 0, wash, 'plaster'); F.box(0,0,bz, 18.5,0.8,10.5, 0, BLUEDC[1], 'plaster');
      [[-9.2,bz-5.2],[9.2,bz-5.2],[-9.2,bz+5.2],[9.2,bz+5.2]].forEach(function(p){ F.cyl(p[0],0,p[1], 1.5,H+0.5, 0, wash,'plaster'); F.edome(p[0],H+0.5,p[1], 1.5,1.0,1.5, 0, MOSBLUEC[3],'mosaic'); F.cyl(p[0],0,p[1],1.54,0.8,0,BLUEDC[1],'plaster'); });
      F.box(0,H-0.02,bz, 18.6,0.45,10.6, 0, MOSBLUEC[2], 'mosaic');                               /* tile frieze / parapet */
      function dome(x,z,R,hh,col,nb){ F.cyl(x,H+0.3,z, R+0.15,0.75, 0, wash,'plaster'); F.edome(x,H+1.0,z, R,hh,R, 0, col,'mosaic');
        for(var i=0;i<nb;i++){ var a=i/nb*TAU+0.4, el=0.62; F.blob(x+Math.cos(a)*R*Math.cos(el)*0.97, H+1.0+hh*Math.sin(el)*0.97-0.05, z+Math.sin(a)*R*Math.cos(el)*0.97, 0.26,0.26, 0, GLASSC[i%4], 'glass'); }
        F.blob(x,H+1.0+hh-0.06,z, 0.34,0.3, 0, GLASSC[3],'glass'); }
      dome(0,bz, 4.3,3.7, MOSBLUEC[0], 8);
      dome(-6.4,bz-2.3, 2.3,2.1, MOSGREENC[0], 5); dome(6.4,bz-2.3, 2.3,2.1, MOSWARMC[0], 5);
      dome(-6.4,bz+2.5, 2.0,1.8, PAL.mosaicWhite[0], 5); dome(6.4,bz+2.5, 2.0,1.8, MOSBLUEC[4], 5);
      /* parabolic porch */
      F.archwall('plaster', 0,0,4.4, 0, 6.0,4.9,3.6, 3.3,4.0, wash, { colIn:BLUELC[0], seg:16 });
      F.archband('mosaic', 0,0,6.23, 0, 3.3,4.0, 0.5,0.12, MOSBLUEC[1]); F.edome(0,4.9,4.4, 3.0,1.1,1.8, 0, MOSBLUEC[3], 'mosaic');
      [-1,1].forEach(function(sg){ F.fr5(sg*3.1,0,6.0, 1.3,5.2,1.3, 0, wash,'plaster'); F.cone(sg*3.02,5.1,5.92, 0.4,1.2, 0, wash,'plaster'); F.box(sg*3.1,0,6.0, 1.36,0.8,1.36, 0, BLUEDC[1],'plaster'); });
      F.door(0,bz+5.22, 0,1, 1.6,2.4, PLANKC[0]); F.lantern(0,3.3,5.2, 0.9,12,0.6);
      [-6.2,6.2].forEach(function(x){ F.window(x,2.3,bz+5.23, 0,1, 0.7,1.2); F.archband('mosaic', x,1.55,bz+5.26, 0, 0.9,1.5, 0.22,0.06, MOSBLUEC[1]); });
      /* the cistern basin, furnace chimney, fuel stack */
      F.sector('mosaic', 8.2,5.6, 2.3,2.9, 0,TAU, 0,0.8, MOSBLUEC[1], { faces:'tio' }); F.sector('glass', 8.2,5.6, 0,2.3, 0,TAU, 0,0.55, GLASSC[2], { faces:'t' });
      F.lathe('plaster', -10.4,bz-3.0, [[1.0,0],[0.8,4],[0.55,7.6],[0.7,8.0],[0.45,8.4]], wash, { seg:10, cap:true }); F.cyl(-10.4,8.35,bz-3.0, 0.3,0.12, 0, VOIDC[0],'dark');
      for(var i=0;i<4;i++) F.rod(-9.6+i*0.0,0.2+i*0.32,3.6, -6.4,0.2+i*0.32,3.6+ (i%2)*0.2, 0.16, TIMBERC[i%4], 'timber');
      shrub(F,-8.6,6.4,1.0); F.cone(-4.6,0,6.6, 0.5,0.9,0, PAL.shrub[0],'leafy');
    } });

  /* =====================================================================================================
     6. WATCH-AND-BELL TOWER
     ===================================================================================================== */
  ASSET({ key:'civic_bell_tower', name:'Watch-and-bell tower', family:'civic', districts:['core','prosper','market','poor'], wealth:[0.2,1], w:8, d:8, h:22, variants:2,
    variantNames:['whitewashed','adobe'],
    build:function(F){
      var v=F.variant, col=v?ADOBEC[2]:WHITEC[0], fam=v?'adobe':'plaster', band=v?MOSWARMC[0]:MOSBLUEC[0], BH=v?6.2:5.0;
      var SH0=BH+0.9, SH1=SH0+7.2, BEL=SH1+3.4, R0=2.42, R1=1.92;        /* shaft foot, shaft head, belfry head */
      F.box(0,0,0, 6.4,0.18,6.4, 0, PAL.paving[1], 'adobe');
      /* ---- the arcaded base ---- */
      [0,PI/2,PI,-PI/2].forEach(function(f){ var sn=Math.sin(f), cs=Math.cos(f);
        F.arcade(fam, sn*2.95,0,cs*2.95, f, v?1:2, v?6.0:3.0,BH,0.8, col, { pier:v?1.9:0.9, head:1.1, colIn:shade(col,-0.3) });
        if(v) for(var tq=-2;tq<=2;tq++) F.toron(sn*3.3+cs*tq*0.9, BH-0.35, cs*3.3-sn*tq*0.9, sn,cs, 0.9); });
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){ F.fr8(q[0]*3.1,0,q[1]*3.1, 1.5,BH+0.9,1.5, 0, col, fam); F.cone(q[0]*3.06,BH+0.85,q[1]*3.06, 0.5,1.2, 0, col, fam); });
      F.box(0,BH-0.02,0, 7.0,0.55,7.0, 0, band, 'mosaic'); F.box(0,BH+0.5,0, 6.6,0.2,6.6, 0, col, fam);
      /* ---- the shaft: two batters, a string course at the break, fluted, with slit lights ---- */
      F.lathe(fam, 0,0, [[R0+0.22,SH0-0.30],[R0,SH0],[R0-0.30,SH0+2.9],[R0-0.34,SH0+3.1],[R1+0.12,SH1-0.9],[R1,SH1],[R1+0.30,SH1+0.34]], col,
        { seg:18, rfn:function(q,ang){ return 1+0.045*Math.cos(ang*(v?6:8)); } });
      F.lathe('mosaic', 0,0, [[R0-0.16,SH0+2.95],[R0-0.16,SH0+3.55]], band, { seg:18 });                      /* the string course */
      F.lathe('relief', 0,0, [[R0+0.06,SH0+0.10],[R0+0.02,SH0+0.85]], shade(col,0.10), { seg:18 });
      F.lathe('mosaic', 0,0, [[R1+0.34,SH1+0.30],[R1+0.30,SH1+0.60]], PAL.mosaicWhite[0], { seg:18 });
      for(var sl=0;sl<4;sl++){ var sa=sl*1.32+0.4, sy=SH0+1.0+sl*1.75, sr=(sy<SH0+3.1?R0-0.22:R1+0.30);
        F.window(Math.cos(sa)*sr, sy, Math.sin(sa)*sr, Math.cos(sa),Math.sin(sa), 0.40,1.05, {noReveal:true});
        F.box(Math.cos(sa)*(sr+0.04), sy-0.78, Math.sin(sa)*(sr+0.04), 0.56,0.12,0.12, Math.atan2(Math.cos(sa),Math.sin(sa)), shade(col,0.08), fam); }
      /* ---- the BELFRY: a dark void behind four parabolic openings, with a bell you can read ---- */
      F.cyl(0, BEL-0.40, 0, R1-0.06, 0.42, 0, VOIDC[0], 'dark');                                             /* the dark ceiling of the belfry */
      F.cyl(0, SH1+0.22, 0, R1-0.06, 0.30, 0, VOIDC[1], 'dark');                                             /* and its dark floor */
      F.cyl(0, SH1+0.50, 0, 0.62, 2.1, 0, VOIDC[0], 'dark');                                                 /* a dark core behind the bell */
      [0,PI/2,PI,-PI/2].forEach(function(f){ var sn=Math.sin(f), cs=Math.cos(f);
        F.archwall(fam, sn*(R1-0.05), SH1+0.30, cs*(R1-0.05), f, 2.9,3.0,0.62, 2.05,2.45, col, { pointed:1.8, colIn:shade(col,-0.5), noTop:true });
        F.archband('mosaic', sn*(R1+0.26), SH1+0.30, cs*(R1+0.26), f, 2.05,2.45, 0.24,0.10, band);
        F.box(sn*(R1+0.05), SH1+0.22, cs*(R1+0.05), 3.0,0.26,0.26, f, PAL.mosaicWhite[0], 'mosaic');          /* belfry sill */
        F.fr8(sn*(R1+0.02)*1.02+cs*1.42, SH1+0.30, cs*(R1+0.02)*1.02-sn*1.42, 0.62,3.0,0.62, f, col, fam); });/* corner shafts */
      /* headstock, wheel and the bell itself, hung in the middle where every opening frames it */
      var BY=SH1+2.42;
      F.beam(-R1+0.2,BY,0, R1-0.2,BY,0, 0.30,0.34, TIMBERC[1], 'timber');
      F.box(0,BY-0.34,0, 1.05,0.34,0.62, 0, TIMBERC[0], 'timber');
      F.lathe('metal', 0,0, [[0.22,BY-0.52],[0.30,BY-0.40]], TARNC[0], { seg:8 });
      F.lathe('metal', 0,0, [[0.36,BY-2.05],[1.08,BY-1.86],[1.22,BY-1.05],[0.92,BY-0.58],[0.42,BY-0.38]], GILDC[0],
        { seg:14, rfn:function(q,ang){ return 1+0.02*Math.cos(ang*12); } });
      F.lathe('metal', 0,0, [[1.24,BY-1.94],[1.26,BY-1.74]], GILDC[2], { seg:14 });                           /* the sound bow catches the light */
      F.ball(0,BY-2.10,0, 0.22, GILDC[3],'metal');
      for(var wq=0;wq<2;wq++){ var wa=wq*PI/2; F.tube('timber', (function(){ var pts=[]; for(var k=0;k<=10;k++){ var t=k/10*TAU;
          pts.push({ x:Math.cos(wa)*0.78*Math.cos(t), y:BY-0.02+0.78*Math.sin(t), z:Math.sin(wa)*0.78*Math.cos(t), r:0.07 }); } return pts; })(), TIMBERC[2], { seg:5 }); }
      F.rod(0,BY-0.02,0, 0.0,BY-1.9,0.0, 0.03, TIMBERC[3], 'timber');
      /* ---- the cupola ---- */
      F.lathe('mosaic', 0,0, [[R1+0.34,BEL-0.20],[R1+0.30,BEL+0.20]], band, { seg:16 });
      F.edome(0, BEL+0.20, 0, R1+0.10, 2.1, R1+0.10, 0, band, 'mosaic');
      for(var cq=0;cq<10;cq++){ var ca=cq/10*TAU, el=0.55;
        F.blob(Math.cos(ca)*(R1+0.05)*Math.cos(el), BEL+0.20+2.1*Math.sin(el)-0.06, Math.sin(ca)*(R1+0.05)*Math.cos(el), 0.28,0.26, 0, (cq%2)?PAL.mosaicWhite[0]:MOSWARMC[0], 'mosaic'); }
      F.cyl(0, BEL+2.25, 0, 0.14,2.2, 0, BRASSC[0], 'metal'); F.ball(0, BEL+4.85, 0, 0.46, BRASSC[1], 'metal');
      /* ---- the stair turret, climbing to the belfry floor ---- */
      var TX=-2.62, TZ=0.0, TT=SH1+0.55;
      F.lathe(fam, TX,TZ, [[1.06,0],[1.00,BH],[1.04,BH+0.4],[0.96,SH0+3.0],[1.00,TT]], shade(col,-0.04), { seg:12, rfn:function(q,ang){ return 1+0.03*Math.cos(ang*5); } });
      F.lathe('mosaic', TX,TZ, [[1.08,BH+0.42],[1.08,BH+0.80]], band, { seg:12 });
      for(var tw=0;tw<6;tw++){ var ta=0.7+tw*1.15, ty=1.8+tw*2.0; if(ty>TT-1.0) break;
        F.window(TX+Math.cos(ta)*1.00, ty, TZ+Math.sin(ta)*1.00, Math.cos(ta),Math.sin(ta), 0.34,0.80, {noReveal:true}); }
      F.mcone('tile', TX,TT,TZ, 1.32,0.22,1.15, v?TILEC[2]:TILEC[0], 12, { under:true });
      F.ball(TX,TT+1.32,TZ, 0.16, GILDC[0], 'metal');
      F.door(TX+0.0, TZ+1.04, 0,1, 0.95,2.05, PLANKC[2]);
      F.lantern(2.0,3.3,3.55, 0.9,14,0); F.lantern(TX+1.3, 2.4, TZ+1.5, 0.7,10, 0);
    } });

  /* =====================================================================================================
     PARK  7. SERPENTINE BENCH TERRACE
     ===================================================================================================== */
  ASSET({ key:'park_serpentine_bench', name:'Serpentine bench terrace', family:'park', districts:['prosper'], wealth:[0.6,1], w:30, d:14, h:4, variants:1,
    build:function(F){
      var TH=1.3, N=64, X0=-14.4, X1=14.4, zb=-6.6, white=PAL.mosaicWhite[0];
      function cz(x){ return 2.6+2.3*Math.sin(x*TAU/9.6); }
      function pt(i){ var x=X0+(X1-X0)*i/N, z=cz(x), dz=2.3*TAU/9.6*Math.cos(x*TAU/9.6), l=Math.hypot(1,dz); return { x:x, z:z, nx:-dz/l, nz:1/l }; }   /* n = outward (front) normal */
      var top=[]; for(var i=0;i<N;i++){ var p=pt(i), q=pt(i+1), cA=mosCol(F,Math.floor(i/4)), cB=mosCol(F,Math.floor(i/4)+3), hint=[p.nx,0,p.nz], hin=[-p.nx,0,-p.nz];
        function o(P,d){ return [P.x-P.nx*d, P.z-P.nz*d]; }
        var p0=o(p,0), q0=o(q,0), p1=o(p,0.4), q1=o(q,0.4), p2=o(p,1.0), q2=o(q,1.0);
        F.quad('mosaic', [p0[0],0,p0[1]],[q0[0],0,q0[1]],[q0[0],TH,q0[1]],[p0[0],TH,p0[1]], white, hint);                     /* retaining face */
        F.quad('mosaic', [p0[0],TH,p0[1]],[q0[0],TH,q0[1]],[q0[0],TH+1.0,q0[1]],[p0[0],TH+1.0,p0[1]], cA, hint);             /* back of the bench, outside */
        F.quad('mosaic', [p1[0],TH+0.45,p1[1]],[q1[0],TH+0.45,q1[1]],[q1[0],TH+1.0,q1[1]],[p1[0],TH+1.0,p1[1]], cB, hin);   /* backrest */
        F.quad('mosaic', [p1[0],TH+0.45,p1[1]],[q1[0],TH+0.45,q1[1]],[q2[0],TH+0.45,q2[1]],[p2[0],TH+0.45,p2[1]], white, [0,1,0]);  /* seat */
        F.quad('mosaic', [p2[0],TH,p2[1]],[q2[0],TH,q2[1]],[q2[0],TH+0.45,q2[1]],[p2[0],TH+0.45,p2[1]], cA, hin);            /* seat front */
        F.quad('adobe', [p.x,TH,zb],[q.x,TH,zb],[q2[0],TH,q2[1]],[p2[0],TH,p2[1]], PAL.pavingRich[i%3===0?1:0], [0,1,0]);    /* terrace floor */
        top.push({ x:p.x-p.nx*0.2, y:TH+1.02, z:p.z-p.nz*0.2, r:0.27, col:cB }); }
      var e=pt(N); top.push({ x:e.x-e.nx*0.2, y:TH+1.02, z:e.z-e.nz*0.2, r:0.27 }); F.tube('mosaic', top, white, { seg:6, cap:true });
      /* ends and back */
      F.box(0,0,zb-0.2, 28.8,TH+0.9,0.4, 0, STONEW, 'rock');
      [X0,X1].forEach(function(x,k){ var z1=cz(x); F.box(x+(k?0.2:-0.2)*0,0,(zb+z1)/2, 0.4,TH+0.9,z1-zb, 0, STONEW, 'rock'); });
      for(var g=0;g<6;g++){ var gx=-12+g*4.8; F.cone(gx,TH+0.9,zb-0.2, 0.3,0.7,0, STONEW,'rock'); }
      /* life on the terrace */
      [-9.6,0,9.6].forEach(function(x,k){ F.lathe('mosaic', x,-3.4, [[0.5,TH],[0.75,TH+0.5],[0.6,TH+0.9]], mosCol(F,k*2+1), { seg:8 }); F.blob(x,TH+0.8,-3.4, 0.9,0.9, 0, PAL.shrub[k],'leafy'); });
      palm(F,-11.2,-4.6,6.5+TH,0.03); palm(F,11.2,-4.6,6+TH,-0.03);
      for(var d=0;d<3;d++){ var dx=-9.6+d*9.6+2.4; F.blob(dx, 0.75, cz(dx)+0.12, 0.22,0.3, 0, MOSBLUEC[2],'mosaic'); }                  /* drain spouts */
    } });

  /* =====================================================================================================
     PARK  8. HYPOSTYLE HALL
     ===================================================================================================== */
  ASSET({ key:'park_hypostyle', name:'Hypostyle hall of leaning columns', family:'park', districts:['prosper'], wealth:[0.6,1], w:24, d:18, h:8, variants:1,
    build:function(F){
      var CH=5.3, white=PAL.whitewash[0], tilew=PAL.mosaicWhite[1];
      F.box(0,0,0, 21.4,0.12,15.6, 0, PAL.pavingRich[1], 'adobe');
      for(var i=0;i<6;i++) for(var j=0;j<4;j++){ var x=-9+i*3.6, z=-5.1+j*3.4, ox=(i===0?-0.75:i===5?0.75:0), oz=(j===0?-0.75:j===3?0.75:0);
        F.tube('plaster', [{x:x+ox,y:0,z:z+oz,r:0.82,col:tilew},{x:x+ox*0.93,y:0.35,z:z+oz*0.93,r:0.74,col:tilew},{x:x+ox*0.7,y:1.6,z:z+oz*0.7,r:0.7,col:tilew},{x:x+ox*0.69,y:1.65,z:z+oz*0.69,r:0.68},
          {x:x+ox*0.12,y:4.5,z:z+oz*0.12,r:0.56},{x:x+ox*0.06,y:4.8,z:z+oz*0.06,r:0.62},{x:x,y:5.05,z:z,r:0.98},{x:x,y:CH,z:z,r:1.02}], white,
          { seg:10, rfn:function(q,ang){ return (q>=3&&q<=4) ? 1+0.035*Math.cos(ang*10) : 1; } }); }
      /* entablature + roof slab; the roof is a terrace, its wavy rim the bench */
      F.box(0,CH,0, 21.2,0.55,15.2, 0, white, 'plaster'); F.box(0,CH+0.55,0, 21.8,0.5,15.8, 0, tilew, 'mosaic');
      F.box(0,CH+1.04,0, 20.4,0.08,14.4, 0, PAL.pavingRich[0], 'adobe');
      var pts=[], M=96, hx=10.5, hz=7.4, rc=2.6, sx=hx-rc, sz2=hz-rc, per=4*sx+4*sz2+TAU*rc, nw=Math.round(per/4.4);
      function rrect(s){ s=((s%per)+per)%per; var segs=[[2*sz2,1,0],[PI/2*rc],[2*sx,0,1],[PI/2*rc],[2*sz2,-1,0],[PI/2*rc],[2*sx,0,-1],[PI/2*rc]];
        /* start at (hx,-sz2) going +z, corners turn toward -x, etc. */
        var cx=[0,sx,0,-sx,0,-sx,0,sx], czz=[0,sz2,0,sz2,0,-sz2,0,-sz2], a0=[0,0,0,PI/2,0,PI,0,-PI/2];
        var st=[[hx,-sz2,0,1,1,0],null,[sx,hz,-1,0,0,1],null,[-hx,sz2,0,-1,-1,0],null,[-sx,-hz,1,0,0,-1],null];
        for(var i=0;i<8;i++){ var L=segs[i][0]; if(s<=L){ if(st[i]){ var q=st[i]; return [q[0]+q[2]*s, q[1]+q[3]*s, q[4], q[5]]; } var a=a0[i]+s/rc; return [cx[i]+rc*Math.cos(a), czz[i]+rc*Math.sin(a), Math.cos(a), Math.sin(a)]; } s-=L; } return [hx,-sz2,1,0]; }
      for(var k=0;k<=M;k++){ var sp=k/M*per, R=rrect(sp), wv=0.42*Math.sin(sp/per*TAU*nw); pts.push({ x:R[0]+R[2]*wv, y:CH+1.45, z:R[1]+R[3]*wv, r:0.52, col:mosCol(F,Math.floor(k/4)) }); }
      F.tube('mosaic', pts, tilew, { seg:7 });
      for(var g=0;g<10;g++){ var gt=(g+0.5)/10; F.blob(-10.9+gt*21.8, CH+0.35, 7.95, 0.28,0.35, 0, tilew,'mosaic'); }       /* frieze drips */
      /* mosaic roundels on the soffit */
      [[-3.6,0],[3.6,0],[0,-3.4],[0,3.4]].forEach(function(p,k){ F.cyl(p[0],CH-0.1,p[1], 1.25,0.12, 0, mosCol(F,k*3), 'mosaic'); F.cyl(p[0],CH-0.16,p[1], 0.6,0.1, 0, mosCol(F,k*3+1), 'mosaic'); });
      F.lantern(0,4.2,5.1, 0.8,14,0.9);
    } });

  /* =====================================================================================================
     PARK  9. LIZARD STAIR
     ===================================================================================================== */
  ASSET({ key:'park_lizard_stair', name:'Lizard stair', family:'park', districts:['prosper'], wealth:[0.6,1], w:16, d:22, h:7, variants:1,
    build:function(F){
      var white=PAL.mosaicWhite[0], N=20, rise=0.25, run=0.85, z0=10.6, TOP=N*rise;
      for(var s=0;s<N;s++){ var z=z0-run*(s+0.5); [-1,1].forEach(function(sg){ F.box(sg*4.7,0,z, 4.5,rise*(s+1),run+0.02, 0, (s%2)?PAL.pavingRich[0]:PAL.pavingRich[2], 'adobe'); }); }
      F.box(0,0,-8.7, 15.8,TOP,4.5, 0, STONEW, 'rock'); F.box(0,TOP,-8.7, 15.7,0.06,4.4, 0, PAL.pavingRich[1], 'adobe');
      /* central island: four tiers of basins */
      for(var t=0;t<4;t++){ var zt=z0-4.25*t, h=TOP*(t+1)/4; F.box(0,0,zt-2.125, 4.85,h,4.25, 0, white, 'mosaic');
        F.archband('mosaic', 0,h-1.25+0.0,zt+0.03, 0, 2.2,0.95, 0.3,0.0, mosCol(F,t*2)); hdisc(F, 0,h-0.75,zt, 0,1, 0.42,0.06, mosCol(F,t+4), 'mosaic', 0.05);
        F.sector('mosaic', 0,zt-1.6, 1.0,1.3, 0,TAU, h,h+0.35, mosCol(F,t*3+1), { faces:'tio' }); F.sector('glass', 0,zt-1.6, 0,1.0, 0,TAU, h,h+0.22, GLASSC[1], { faces:'t' }); }
      /* the salamander, climbing from tier 1 to tier 2 */
      var y1=TOP/4, y2=TOP/2, zf2=z0-4.25;
      F.tube('mosaic', [{x:0,y:y1+0.62,z:z0-0.35,r:0.05},{x:0,y:y1+0.66,z:z0-0.7,r:0.30,col:MOSBLUEC[3]},{x:0,y:y1+0.72,z:z0-1.2,r:0.36,col:MOSWARMC[0]},{x:0.05,y:y1+0.75,z:z0-1.7,r:0.27,col:MOSGREENC[0]},
        {x:0.1,y:y1+0.85,z:z0-2.4,r:0.46,col:MOSBLUEC[0]},{x:0,y:y1+1.15,z:z0-3.3,r:0.52,col:MOSWARMC[1]},{x:-0.1,y:y2+0.35,z:zf2+0.35,r:0.48,col:MOSGREENC[1]},{x:-0.05,y:y2+0.55,z:zf2-0.5,r:0.40,col:MOSBLUEC[1]},
        {x:0.25,y:y2+0.5,z:zf2-1.3,r:0.28,col:MOSWARMC[3]},{x:0.7,y:y2+0.45,z:zf2-2.0,r:0.17,col:MOSBLUEC[3]},{x:1.2,y:y2+0.42,z:zf2-2.4,r:0.06,col:MOSWARMC[0]}], MOSBLUEC[0], { seg:8, rfn:function(){ return 1.22; } });
      [-1,1].forEach(function(sg){ F.ball(sg*0.2,y1+0.98,z0-1.05, 0.11, MOSWARMC[3],'mosaic');
        F.tube('mosaic', [{x:sg*0.3,y:y1+0.8,z:z0-2.2,r:0.17},{x:sg*0.95,y:y1+0.62,z:z0-1.95,r:0.14},{x:sg*1.2,y:y1+0.3,z:z0-1.5,r:0.12,col:MOSWARMC[0]}], MOSGREENC[0], { seg:5, cap:true });
        F.tube('mosaic', [{x:sg*0.35,y:y2+0.5,z:zf2-0.3,r:0.17},{x:sg*1.0,y:y2+0.5,z:zf2-0.1,r:0.14},{x:sg*1.25,y:y2+0.2,z:zf2+0.12,r:0.12,col:MOSWARMC[0]}], MOSBLUEC[0], { seg:5, cap:true }); });
      /* crenellated mosaic flank walls, stepping with the flights */
      for(var w=0;w<4;w++){ var zc=z0-4.25*w-2.125, hh=TOP*(w+1)/4+1.1; [-1,1].forEach(function(sg){ F.box(sg*7.45,0,zc, 0.9,hh,4.27, 0, white, 'mosaic');
        F.box(sg*7.45,hh-0.5,zc, 0.98,0.3,4.3, 0, mosCol(F,w+(sg>0?5:0)), 'mosaic');
        for(var m=0;m<3;m++){ F.box(sg*7.45,hh,zc+(m-1)*1.45, 0.9,0.6,0.75, 0, (m%2)?white:mosCol(F,w*2+m), 'mosaic'); F.blob(sg*7.45,hh+0.6,zc+(m-1)*1.45, 0.4,0.35, 0, white,'mosaic'); } }); }
      [-1,1].forEach(function(sg){ F.box(sg*7.45,0,-8.7, 0.9,TOP+1.1,4.5, 0, white,'mosaic'); for(var m=0;m<3;m++) F.box(sg*7.45,TOP+1.1,-8.7+(m-1)*1.5, 0.9,0.6,0.75, 0, mosCol(F,m+2),'mosaic'); });
      F.box(0,TOP,-10.75, 14.0,1.1,0.4, 0, white,'mosaic'); for(var b=0;b<7;b++) F.blob(-6+b*2,TOP+1.1,-10.75, 0.38,0.4, 0, mosCol(F,b),'mosaic');
      [-1,1].forEach(function(sg){ F.lathe('mosaic', sg*2.9,z0-0.5, [[0.45,0],[0.5,1.0],[0.3,1.3]], white, { seg:8 }); F.ball(sg*2.9,1.65,z0-0.5, 0.42, mosCol(F,sg+2),'mosaic'); });
    } });

  /* =====================================================================================================
     PARK  10. GATEHOUSE PAVILIONS
     ===================================================================================================== */
  ASSET({ key:'park_gatehouse', name:'Gingerbread gate lodge', family:'park', districts:['prosper'], wealth:[0.6,1], w:9, d:8, h:17, variants:2,
    build:function(F){
      var v=F.variant, white=PAL.mosaicWhite[0], ph=F.rr(0,6);
      function lump(n){ return function(q,ang){ return 1+0.05*Math.sin(ang*n+ph+q*1.3)+0.03*Math.sin(ang*7+q*2.1); }; }
      function roof(x,z,R,y,hh){ F.lathe('rock', x,z, [[R-0.35,y-0.5],[R+0.12,y-0.1],[R+0.05,y+0.2]], shade(STONEW,0.12), { seg:14, rfn:lump(5) });
        F.edome(x,y+0.15,z, R,hh,R, 0, white,'mosaic'); for(var i=0;i<10;i++){ var a=i/10*TAU; F.blob(x+Math.cos(a)*(R-0.12),y+0.12,z+Math.sin(a)*(R-0.12), 0.34,0.42, 0, (i%2)?MOSWARMC[0]:white,'mosaic'); } }
      function cross(x,y,z){ F.cyl(x,y,z, 0.09,1.5, 0, white,'mosaic'); F.box(x,y+0.85,z, 1.1,0.2,0.2, 0, white,'mosaic'); F.box(x,y+0.85,z, 0.2,0.2,1.1, 0, white,'mosaic'); F.ball(x,y+1.55,z,0.16,MOSWARMC[0],'mosaic'); }
      if(v===0){
        F.lathe('rock', 0,0, [[3.45,0],[3.3,1.0],[3.2,3.2],[3.35,4.3]], STONEW, { seg:16, rfn:lump(3) });
        roof(0,0, 3.7,4.3,2.5);
        /* the tall checkered spire with the four-armed cross */
        var pts=[], n=12; for(var i=0;i<=n;i++){ var t=i/n, y=5.6+t*8.2, r=1.25-0.75*t+(i===n-2?0.35:0)+(i===n-1?0.2:0); pts.push({ x:0.4,y:y,z:-0.3,r:r,col:(i%2)?MOSBLUEC[0]:white }); }
        pts.push({x:0.4,y:14.2,z:-0.3,r:0.12}); F.tube('mosaic', pts, white, { seg:10 }); cross(0.4,14.2,-0.3);
        F.door(0,3.5, 0,1, 1.1,2.1, PLANKC[1]); F.archband('mosaic', 0,0,3.62, 0, 1.4,2.4, 0.3,0.2, white);
        [-1,1].forEach(function(sg){ var a=PI/2+sg*0.75; F.window(Math.cos(a)*3.38,2.4,Math.sin(a)*3.38, Math.cos(a),Math.sin(a), 0.7,1.1, {noReveal:true}); });
        F.lantern(1.3,2.6,3.75, 0.7,10,0);
      } else {
        F.lathe('rock', -1.2,0, [[3.0,0],[2.85,1.0],[2.8,3.4],[2.95,4.4]], STONEW, { seg:16, rfn:lump(3) });
        F.lathe('rock', 2.2,0.4, [[2.2,0],[2.05,1.0],[2.0,2.6],[2.15,3.3]], shade(STONEW,-0.06), { seg:14, rfn:lump(4) });
        roof(-1.2,0, 3.25,4.4,2.2); roof(2.2,0.4, 2.3,3.3,1.5);
        /* amanita cupola */
        F.lathe('mosaic', -1.2,0, [[0.75,6.2],[0.6,7.6],[0.7,8.6]], white, { seg:10 }); F.edome(-1.2,8.3,0, 1.7,1.5,1.7, 0, MOSWARMC[2],'mosaic');
        F.cyl(-1.2,8.22,0, 1.66,0.1, 0, white,'mosaic');
        for(var k=0;k<7;k++){ var a=k/7*TAU+0.3, el=0.35+(k%2)*0.45; F.blob(-1.2+Math.cos(a)*1.7*Math.cos(el)*0.95, 8.3+1.5*Math.sin(el)*0.95-0.06, Math.sin(a)*1.7*Math.cos(el)*0.95, 0.24,0.2, 0, white,'mosaic'); }
        cross(-1.2,9.75,0);
        F.lathe('mosaic', 2.2,0.4, [[0.45,4.4],[0.35,5.6],[0.6,5.9],[0.1,6.5]], MOSBLUEC[0], { seg:8 });
        F.door(-1.2,3.04, 0,1, 1.1,2.1, PLANKC[2]); F.archband('mosaic', -1.2,0,3.14, 0, 1.4,2.4, 0.3,0.2, white);
        F.window(2.2,1.9,0.4+2.22, 0,1, 0.7,1.0, {noReveal:true}); var a2=PI/2+0.8; F.window(-1.2+Math.cos(a2)*2.9,2.4,Math.sin(a2)*2.9, Math.cos(a2),Math.sin(a2), 0.7,1.1, {noReveal:true});
        F.lantern(0.1,2.6,3.2, 0.7,10,0);
      }
    } });

  /* =====================================================================================================
     PARK  11. LEANING VIADUCT
     ===================================================================================================== */
  ASSET({ key:'park_viaduct', name:'Leaning stone viaduct', family:'park', districts:['prosper'], wealth:[0.5,1], w:30, d:8, h:8, variants:1,
    build:function(F){
      var DY=5.0, st=STONEW, st2=shade(STONEW,-0.12);
      F.box(0,DY,0, 29.4,0.75,5.0, 0, st, 'rock'); F.box(0,DY+0.75,0, 29.0,0.06,3.4, 0, PAL.lane[2], 'adobe');
      for(var i=0;i<8;i++){ var x=-12.95+i*3.7, ph=i*1.3;
        [-1,1].forEach(function(sg){ var pts=[]; for(var k=0;k<=5;k++){ var t=k/5; pts.push({ x:x+0.18*Math.sin(t*4+ph), y:t*DY-0.1+ (k===5?0.12:0), z:sg*(3.45-1.55*t-0.35*t*t), r:0.62-0.12*t+(k===5?0.35:0)+(k===0?0.15:0), col:(k%2)?st2:st }); }
          F.tube('rock', pts, st, { seg:7, rfn:function(q,ang){ return 1+0.10*Math.sin(ang*3+q*1.9+ph); } });
          /* planter crowning each column, with an agave */
          F.lathe('rock', x,sg*2.15, [[0.5,DY+0.7],[0.85,DY+1.3],[0.7,DY+1.75]], st2, { seg:8, rfn:function(q,ang){ return 1+0.08*Math.sin(ang*4+q); } });
          F.cone(x,DY+1.6,sg*2.15, 0.62,1.15, 0, PAL.shrub[(i+(sg>0?1:0))%4],'leafy'); F.blob(x,DY+1.55,sg*2.15, 0.8,0.5, i, PAL.olive[i%4],'leafy'); });
        if(i<7){ [-1,1].forEach(function(sg){ F.box(x+1.85,DY+0.7,sg*2.2, 2.3,0.75,0.5, 0, st2,'rock'); F.blob(x+1.85,DY+1.42,sg*2.2, 0.36,0.3, 0, st,'rock'); });
          F.archwall('rock', x+1.85,DY-1.6,2.15, 0, 3.7,1.62,0.7, 2.7,1.35, st2, { noTop:true }); F.archwall('rock', x+1.85,DY-1.6,-2.15, PI, 3.7,1.62,0.7, 2.7,1.35, st2, { noTop:true }); } }
    } });

  /* =====================================================================================================
     PARK  12. MOSAIC FOUNTAIN ROUNDEL
     ===================================================================================================== */
  ASSET({ key:'park_fountain_roundel', name:'Mosaic fountain roundel', family:'park', districts:['prosper','core'], wealth:[0.5,1], w:8, d:8, h:4, variants:2,
    build:function(F){
      var v=F.variant, white=PAL.mosaicWhite[0], c1=v?MOSWARMC[0]:MOSBLUEC[0], c2=v?MOSGREENC[0]:MOSBLUEC[3];
      F.sector('adobe', 0,0, 0,3.95, 0,TAU, 0,0.08, PAL.pavingRich[0], { faces:'t' });
      var pts=[]; for(var k=0;k<=24;k++){ var a=k/24*TAU; pts.push({ x:Math.cos(a)*3.1, y:0.5, z:Math.sin(a)*3.1, r:0.45, col:(k%3===0)?c1:((k%3===1)?white:c2) }); }
      F.tube('mosaic', pts, white, { seg:7 }); F.sector('mosaic', 0,0, 2.7,3.4, 0,TAU, 0,0.45, white, { faces:'io' });
      F.sector('glass', 0,0, 0,3.0, 0,TAU, 0,0.55, GLASSC[1], { faces:'t' });
      F.lathe('mosaic', 0,0, [[0.75,0.3],[0.5,0.9],[0.38,1.7],[0.55,1.95],[1.45,2.3],[1.5,2.45]], white, { seg:12, rfn:function(q,ang){ return q>=4 ? 1+0.07*Math.cos(ang*6) : 1; } });
      F.cyl(0,2.36,0, 1.38,0.06, 0, GLASSC[3],'glass');
      F.lathe('mosaic', 0,0, [[0.3,2.3],[0.22,2.9],[0.34,3.1]], c1, { seg:8 }); F.ball(0,3.35,0, 0.3, c2,'mosaic');
      for(var i=0;i<4;i++){ var a2=i/4*TAU+PI/4; F.blob(Math.cos(a2)*3.1,0.85,Math.sin(a2)*3.1, 0.34,0.32, 0, c1,'mosaic'); }
    } });

