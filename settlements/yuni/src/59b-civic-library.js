  /* =====================================================================================================
     13. THE LIBRARY OF YUNI   (Casa Batllo loggia + trencadis + scaled roof; Sagrada branching columns)
     ===================================================================================================== */
  ASSET({ key:'civic_library', name:'Library of Yuni', family:'civic', districts:['core','prosper'], wealth:[0.6,1], w:64, d:52, h:22, variants:1,
    build:function(F){
      var stone=STONEC[2], stone2=shade(STONEC[0],-0.04), mosw=PAL.mosaicWhite[0], pale=PAL.mosaicWhite[1], bone=shade(STONEC[2],0.16);
      var Y0=0.55, WT=10.6, HX=23.4, ZB=-19.0, ZF=13.4;         /* floor, wall head, half-width, back and front wall planes */
      var LOG=4.3, ARC=7.0, TER=7.05, FB=8.05, FT=16.0;         /* loggia capital / arch head / terrace / facade base & top */
      var BOOKS=[PLANKC[3],TILEC[0],BLUEDC[0],MOSWARMC[4],PAL.paintRed[0],TIMBERC[2],MOSGREENC[2],GILDC[3],BLUEDC[2],TILEC[3]];
      function chipCol(t){ return t<0.36 ? F.pick([MOSBLUEC[0],MOSBLUEC[2],MOSGREENC[0],MOSGREENC[2]])
                         : (t<0.70 ? F.pick([MOSGREENC[3],MOSBLUEC[3],MOSWARMC[3],MOSBLUEC[0]]) : F.pick([MOSWARMC[0],MOSWARMC[1],GILDC[0],GILDC[1]])); }
      function speckle(ax, plane, nrm, a0,a1, y0,y1, n){        /* finer trencadis chips than round 2 */
        for(var i=0;i<n;i++){ var t=F.rnd(), u=F.rr(a0,a1), y=mix(y0,y1,t*t*0.35+t*0.65), w2=F.rr(0.28,0.58), h2=F.rr(0.22,0.44), rl=F.rr(-0.7,0.7);
          if(ax==='z') F.box(u, y, plane+nrm*0.09, w2,h2,0.12, [0,0,rl], chipCol(t), 'mosaic');
          else F.box(plane+nrm*0.09, y, u, 0.12,h2,w2, [0,PI/2,rl], chipCol(t), 'mosaic'); } }
      /* the furniture is REGISTERED (see FURN, below): the hall places the catalogue pieces */
      var fseq=0;
      function bookcase(cx,cz, nx,nz, w,h, ly){ placeFurn(F,'order_bookcase', cx,cz, Math.atan2(nx,nz), ly==null?Y0:ly, ++fseq, h>4?0:1); }
      function table(cx,cz, yaw, ly){ placeFurn(F,'order_reading_table', cx,cz, yaw, ly==null?Y0:ly, ++fseq, (fseq%3===0)?1:0); }
      function lectern(cx,cz,yaw, ly){ placeFurn(F,'order_lectern', cx,cz, yaw, ly==null?Y0:ly, ++fseq, (fseq%2)?1:0); }
      function ladder(cx,cz,yaw,h, ly){ placeFurn(F,'order_library_ladder', cx,cz, yaw, ly==null?Y0:ly, ++fseq, 0); }
      /* branching column, Sagrada-style: trunk to `yb`, four limbs out to `yt` */
      function branchCol(cx,cz, r0, yb,yt, spread){
        F.tube('plaster', [{x:cx,y:Y0,z:cz,r:r0},{x:cx,y:Y0+0.9,z:cz,r:r0*0.78},{x:cx,y:yb-0.5,z:cz,r:r0*0.58},{x:cx,y:yb,z:cz,r:r0*0.68}], bone,
          { seg:12, rfn:function(q,ang){ return q>1?1+0.035*Math.cos(ang*8):1; } });
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(br){
          F.tube('plaster', [{x:cx,y:yb-0.1,z:cz,r:r0*0.40},{x:cx+br[0]*spread*0.45,y:(yb+yt)/2,z:cz+br[1]*spread*0.45,r:r0*0.30},{x:cx+br[0]*spread,y:yt,z:cz+br[1]*spread,r:r0*0.20}], bone, { seg:8 }); });
        F.disc(cx, yb-0.35, cz, 0,1, r0*0.55,0.12, F.pick([MOSBLUEC[0],MOSWARMC[0],MOSGREENC[0]]), 'mosaic'); }

      /* ================= 1. the hall: plinth, walls, front wall with its three arches ================= */
      F.box(0,0,-3.0, 50,Y0,34.2, 0, stone2, 'rock');
      [-1,1].forEach(function(sg){ F.box(sg*HX,Y0,-2.8, 1.2,3.0,33.4, 0, stone, 'plaster');
        F.box(sg*HX,3.55,-2.8, 1.1,WT-3.55,33.4, 0, pale, 'mosaic');
        speckle('x', sg*(HX+0.55), sg, -18.5,12.8, 3.7,WT-0.7, 92);
        F.box(sg*HX,WT-0.6,-2.8, 1.5,0.6,33.4, 0, MOSBLUEC[2], 'mosaic');
        /* clerestory-lit side windows high in the wall, over the cloister roof */
        [-14,-8,-2,4,10].forEach(function(wz){ F.window(sg*(HX+0.6), 8.4, wz, sg,0, 1.1,1.9, {noReveal:true});
          F.archband('relief', sg*(HX+0.62), 7.45, wz, sg*PI/2, 1.3,2.1, 0.3,0.1, stone); }); });
      F.box(0,Y0,ZB, 47,3.0,1.2, 0, stone, 'plaster'); F.box(0,3.55,ZB, 47,WT-3.55,1.1, 0, pale, 'mosaic');
      speckle('z', ZB-0.55, -1, -22,22, 3.7,WT-0.7, 52); F.box(0,WT-0.6,ZB, 47,0.6,1.5, 0, MOSBLUEC[2], 'mosaic');
      /* the front wall of the hall: a big open portal and two lobed openings you can see in through */
      [[-15.2,5.4,5.4],[15.2,5.4,5.4]].forEach(function(q){ F.archwall('plaster', q[0],Y0,ZF, 0, 15.2,7.5,1.2, q[1],q[2], stone, { pointed:1.6, colIn:stone2 }); });
      F.archwall('plaster', 0,Y0,ZF, 0, 15.2,7.5,1.2, 6.4,6.2, stone, { pointed:1.7, colIn:stone2 });
      F.archband('mosaic', 0,Y0,ZF+0.62, 0, 6.4,6.2, 0.45,0.16, MOSBLUEC[0], { pointed:1.7 });
      [-15.2,15.2].forEach(function(fx){ F.archband('mosaic', fx,Y0,ZF+0.62, 0, 5.4,5.4, 0.35,0.12, MOSGREENC[0], { pointed:1.6 }); });
      /* the great arch stands OPEN — its two leaves folded back against the reveal, so the hall is visible */
      [-1,1].forEach(function(sg){ F.box(sg*2.55, Y0, ZF-0.30, 0.14,3.9,1.5, sg*0.34, PLANKC[1], 'plank');
        for(var sd=0;sd<4;sd++) F.box(sg*2.62, Y0+0.6+sd*0.85, ZF-0.30, 0.1,0.12,0.12, sg*0.34, GILDC[0], 'metal'); });
      F.lantern(-2.9, 3.1, ZF-1.5, 1.0,14, 1.0); F.lantern(2.9, 3.1, ZF-1.5, 1.0,14, 1.0);
      F.door(-16.4,ZF, 0,1, 2.3,3.2, PLANKC[1], Y0); studs(F, -16.4,Y0,ZF+0.07, 2.3,3.2);
      F.disc(0, Y0+4.7, ZF+0.64, 0,1, 1.05,0.2, GILDC[0], 'relief'); F.disc(0, Y0+4.7, ZF+0.74, 0,1, 0.7,0.2, MOSBLUEC[0], 'mosaic');

      /* ================= 2. the covered reading hall: roof, clerestory monitor, interior ================= */
      var zEb=-19.85, zEf=ZF+0.55, zc0=-4.6, zc1=-1.4, zRm=-3.0, NX=22;
      var BAND=[[MOSGREENC[0],MOSBLUEC[0],MOSBLUEC[2]],[MOSWARMC[3],TILEC[0],MOSGREENC[3]],[MOSWARMC[0],GILDC[0],TILEC[2]]];
      function ye(x){ return WT+0.2-0.65*Math.sin(x*0.30+0.7); }
      function yc(x){ return 13.25+1.05*Math.sin(x*0.30+0.7); }
      function yrr(x){ return yc(x)+2.9; }
      function slope(x,zA,zC,t){ return mix(ye(x), yc(x), Math.pow(t,0.70)); }
      for(var i=0;i<NX;i++){ var xa=-24+i*48/NX, xb=-24+(i+1)*48/NX, xm=(xa+xb)/2;
        [[zEb,zc0,1],[zEf,zc1,-1]].forEach(function(e,si){
          for(var j=0;j<3;j++){ var t0=j/3, t1=(j+1)/3, za=mix(e[0],e[1],t0), zb2=mix(e[0],e[1],t1), cc=BAND[j][(i+si*2+(j===1?1:0))%3];
            F.quad('mosaic', [xa,slope(xa,0,0,t0),za],[xb,slope(xb,0,0,t0),za],[xb,slope(xb,0,0,t1),zb2],[xa,slope(xa,0,0,t1),zb2], cc, [0,1,e[2]*0.5]);
            if(j===0) F.quad('mosaic', [xa,slope(xa,0,0,t0)-0.24,za],[xb,slope(xb,0,0,t0)-0.24,za],[xb,slope(xb,0,0,t0),za],[xa,slope(xa,0,0,t0),za], (i%2)?mosw:MOSBLUEC[0], [0,-0.3,e[2]]); }
          F.quad('plaster', [xa,ye(xa)-0.3,e[0]],[xb,ye(xb)-0.3,e[0]],[xb,yc(xb),e[1]],[xa,yc(xa),e[1]], stone2, [0,-1,0]);          /* soffit */
          /* the clerestory band: a little lobed window in every other bay */
          F.quad('mosaic', [xa,yc(xa),e[1]],[xb,yc(xb),e[1]],[xb,yc(xb)+1.75,e[1]],[xa,yc(xa)+1.75,e[1]], pale, [0,0,-e[2]]);
          if(i%2===1){ F.archwall('mosaic', xm, yc(xm)+0.15, e[1]-e[2]*0.12, e[2]>0?PI:0, 48/NX-0.3,1.5,0.26, 1.15,1.25, pale, { pointed:1.6, colIn:VOIDC[0] });
            F.window(xm, yc(xm)+0.85, e[1]-e[2]*0.26, 0,-e[2], 1.1,1.2, {noReveal:true}); } });
        /* the monitor roof over the clerestory, with the mosaic spine */
        [[zc0,1],[zc1,-1]].forEach(function(e){ F.quad('mosaic', [xa,yc(xa)+1.75,e[0]],[xb,yc(xb)+1.75,e[0]],[xb,yrr(xb),zRm],[xa,yrr(xa),zRm], (i%2)?MOSWARMC[0]:GILDC[0], [0,1,e[1]*0.6]);
          F.quad('plaster', [xa,yc(xa)+1.70,e[0]],[xb,yc(xb)+1.70,e[0]],[xb,yrr(xb)-0.1,zRm],[xa,yrr(xa)-0.1,zRm], stone2, [0,-1,0]); });
        F.box(xm, yrr(xm)-0.18, zRm, 48/NX+0.04, 0.7, 1.7, 0, (i%2)?MOSWARMC[0]:mosw, 'mosaic');
        if(i%3===1) F.blob(xm, yrr(xm)+0.4, zRm, 0.5,0.55, 0, GILDC[0], 'mosaic'); }
      /* gable fills at the two ends, wall head up to the roof line */
      [-24,24].forEach(function(gx){
        [[zEb,zc0],[zEf,zc1]].forEach(function(e){ for(var j=0;j<3;j++){ var t0=j/3,t1=(j+1)/3, za=mix(e[0],e[1],t0), zb3=mix(e[0],e[1],t1);
          F.quad('mosaic', [gx,WT-0.35,za],[gx,WT-0.35,zb3],[gx,slope(gx,0,0,t1),zb3],[gx,slope(gx,0,0,t0),za], pale, [gx,0,0]); } });
        F.quad('mosaic', [gx,yc(gx),zc0],[gx,yc(gx),zc1],[gx,yrr(gx),zRm],[gx,yrr(gx),zRm], pale, [gx,0,0]);
        F.quad('mosaic', [gx,yc(gx),zc0],[gx,yc(gx)+1.75,zc0],[gx,yrr(gx),zRm],[gx,yc(gx)+1.75,zc1], pale, [gx,0,0]);
        F.quad('mosaic', [gx,yc(gx),zc1],[gx,yc(gx)+1.75,zc1],[gx,yrr(gx),zRm],[gx,yc(gx)+1.75,zc0], pale, [gx,0,0]); });
      /* ---- the interior: floor, branching columns, a gallery, shelving, tables ---- */
      F.box(0,Y0-0.06,-3.0, 45.4,0.14,31.6, 0, PAL.pavingRich[1], 'adobe');
      for(var mq=0;mq<7;mq++) F.box(0, Y0+0.02, -15+mq*5.2, 7.2,0.06,3.2, 0, (mq%2)?MOSBLUEC[0]:MOSGREENC[0], 'mosaic');   /* a mosaic runner down the nave */
      [-1,1].forEach(function(sg){
        [-16,-10,-4,2,8].forEach(function(cz2,ci){ branchCol(sg*12.6, cz2, 1.05, 6.9, 9.0, 2.6);
          if(ci%2===0) F.lantern(sg*12.6, 6.3, cz2+1.9, 0.9,14, 0.9); });
        /* gallery along each side wall, with its balustrade and its own shelves */
        F.box(sg*20.3,6.35,-3.2, 5.0,0.42,29.6, 0, stone, 'plaster'); F.box(sg*20.3,6.20,-3.2, 4.7,0.22,29.2, 0, shade(STONEC[2],-0.06), 'relief');
        F.box(sg*17.9,6.77,-3.2, 0.3,0.95,29.6, 0, mosw, 'mosaic');
        for(var bq=0;bq<12;bq++) F.blob(sg*17.9, 7.72, -17.2+bq*2.6, 0.26,0.3, 0, (bq%2)?MOSWARMC[0]:MOSBLUEC[0], 'mosaic');
        for(var g=0;g<7;g++) bookcase(sg*22.2, -16.4+g*4.6, -sg,0, 3.4,2.9, 6.77);                                        /* gallery shelves */
        for(var k=0;k<7;k++) bookcase(sg*22.2, -16.4+k*4.6, -sg,0, 3.4,5.1, Y0);                                          /* ground-floor ranges */
        for(var st=0;st<4;st++) bookcase(sg*7.4, -14.5+st*6.4, sg,0, 3.4,2.9, Y0);                                        /* free-standing stacks */
        table(sg*4.0, -12.0+0, 0); table(sg*4.0, 0.5, 0); table(sg*4.0, 9.0, 0);
        ladder(sg*22.0, -7.2, sg>0?-PI/2:PI/2, 4.2, Y0);
        F.lantern(sg*6.6, 2.6, -6.0, 0.8,12, 0.5); });
      for(var b2=0;b2<7;b2++) bookcase(-18+b2*6, ZB+1.3, 0,1, 3.4,5.1, Y0);                                               /* the back wall range */
      lectern(-3.2, 10.4, PI); lectern(3.2, 10.4, PI);
      /* things on the entrance axis, so the hall reads as a library from the doorway */
      [-1,1].forEach(function(sg){ bookcase(sg*5.7, -2.3, 0,1, 3.4,2.9, Y0); bookcase(sg*5.7, -1.4, 0,-1, 3.4,2.9, Y0);
        bookcase(sg*5.7, -9.1, 0,1, 3.4,2.9, Y0); bookcase(sg*5.7, -8.2, 0,-1, 3.4,2.9, Y0); });
      table(0, 5.0, PI/2); table(0, 1.2, PI/2);
      placeFurn(F,'order_globe_stand', 0,-13.5, PI, Y0, 91, 0);
      F.lantern(0, 3.4, -6.5, 1.0,15, 1.4);
      F.lantern(0, 3.4, 11.4, 1.0,15, 1.2);
      /* stairs up to the gallery, in the back corners */
      [-1,1].forEach(function(sg){ for(var st2=0;st2<9;st2++) F.box(sg*19.4, Y0, -17.0+st2*0.72, 3.4,0.68+st2*0.68,0.74, 0, stone, 'plaster'); });

      /* ================= 3. the cloister: a parabolic arcade on bone columns, three sides ================= */
      var CLX=29.6, CLZB=-23.6, CLZF=12.6, WALKY=5.5;
      function boneCol(cx,cz,h,r0){ F.tube('plaster', [{x:cx,y:Y0,z:cz,r:r0},{x:cx,y:Y0+0.75,z:cz,r:r0*0.72},{x:cx,y:h-0.9,z:cz,r:r0*0.50},{x:cx,y:h,z:cz,r:r0*0.68}], bone,
        { seg:10, rfn:function(q,ang){ return q===0?1+0.09*Math.cos(ang*5):1; } }); }
      [-1,1].forEach(function(sg){
        F.arcade('plaster', sg*CLX, Y0, -5.5, sg*PI/2, 7, 5.1, 5.0, 0.9, stone, { pier:1.7, head:1.0, colIn:stone2 });
        for(var c=0;c<8;c++){ var cz3=-23.35+c*5.1; boneCol(sg*(CLX-0.62), cz3, Y0+5.0, 0.62); }
        F.box(sg*26.7, WALKY, -5.5, 6.9,0.5,36.3, 0, stone, 'plaster');                                    /* the walk roof */
        F.box(sg*26.7, WALKY-0.16, -5.5, 6.5,0.2,35.9, 0, shade(STONEC[2],-0.08), 'relief');
        F.box(sg*26.7, WALKY+0.5, -5.5, 6.9,0.14,36.3, 0, PAL.pavingRich[0], 'adobe');
        F.box(sg*30.0, WALKY+0.5, -5.5, 0.9,0.42,36.7, 0, MOSBLUEC[2], 'mosaic');
        F.box(sg*23.6, WALKY+0.5, -5.5, 0.9,0.42,36.3, 0, MOSGREENC[0], 'mosaic');
        for(var pb=0;pb<13;pb++) F.blob(sg*30.0, WALKY+0.92, -22.0+pb*2.9, 0.34,0.36, 0, (pb%2)?MOSWARMC[0]:mosw, 'mosaic');
        for(var pv=0;pv<14;pv++){ var pz=-22.6+pv*2.7; F.box(sg*26.7, Y0, pz, 6.6,0.07,2.6, 0, (pv%2)?PAL.mosaicWhite[0]:MOSGREENC[0], 'mosaic'); }
        F.box(sg*24.4, Y0, -5.5, 0.95,0.5,32.0, 0, mosw, 'mosaic');                                        /* the bench along the hall wall */
        F.box(sg*24.9, Y0+0.5, -5.5, 0.35,0.55,32.0, 0, MOSWARMC[0], 'mosaic');
        for(var t2=0;t2<7;t2++) F.tree(sg*30.9, -22.0+t2*5.6, (t2%3===0)?'cypress':'shrub', (t2%3===0)?F.rr(6,7.4):F.rr(1.0,1.5));
        F.lantern(sg*25.4, 3.4, -16.0, 0.9,13, 1.0); F.lantern(sg*25.4, 3.4, 5.0, 0.9,13, 1.0); });
      F.arcade('plaster', 0, Y0, CLZB, PI, 9, 5.1, 5.0, 0.9, stone, { pier:1.7, head:1.0, colIn:stone2 });
      for(var cb=0;cb<10;cb++){ var cbx=-22.95+cb*5.1; boneCol(cbx, CLZB+0.62, Y0+5.0, 0.62); }
      F.box(0, WALKY, -21.5, 47.4,0.5,5.5, 0, stone, 'plaster'); F.box(0, WALKY-0.16, -21.5, 47.0,0.2,5.1, 0, shade(STONEC[2],-0.08), 'relief');
      F.box(0, WALKY+0.5, -21.5, 47.0,0.14,5.5, 0, PAL.pavingRich[0], 'adobe');
      F.box(0, WALKY+0.5, -23.9, 47.4,0.42,0.9, 0, MOSBLUEC[2], 'mosaic');
      F.box(0, WALKY+0.5, -19.2, 47.0,0.42,0.9, 0, MOSGREENC[0], 'mosaic');
      for(var pb2=0;pb2<16;pb2++) F.blob(-22.5+pb2*3.0, WALKY+0.92, -23.9, 0.34,0.36, 0, (pb2%2)?MOSWARMC[0]:mosw, 'mosaic');
      for(var pw=0;pw<16;pw++) F.box(-22.4+pw*3.0, Y0, -21.5, 2.9,0.07,5.1, 0, (pw%2)?PAL.mosaicWhite[0]:MOSGREENC[0], 'mosaic');
      F.box(0, Y0, -20.1, 40.0,0.5,0.95, 0, mosw, 'mosaic'); F.box(0, Y0+0.5, -20.6, 40.0,0.55,0.35, 0, MOSWARMC[0], 'mosaic');
      for(var t3=0;t3<9;t3++) F.tree(-22+t3*5.5, -25.2, (t3%4===1)?'olive':'shrub', (t3%4===1)?F.rr(3.6,4.4):F.rr(1.0,1.4));
      /* the corner piers where the three walks meet */
      [[-1,-1],[1,-1]].forEach(function(q){ F.box(q[0]*CLX, Y0, CLZB, 2.2,5.0,2.2, 0, stone, 'plaster'); F.box(q[0]*CLX, WALKY, CLZB, 2.6,0.6,2.6, 0, MOSWARMC[0], 'mosaic');
        F.cone(q[0]*CLX, WALKY+0.6, CLZB, 0.85,1.7, 0, mosw, 'mosaic'); });
      [-1,1].forEach(function(sg){ F.box(sg*CLX, Y0, CLZF, 2.2,5.0,2.2, 0, stone, 'plaster'); F.box(sg*CLX, WALKY, CLZF, 2.6,0.6,2.6, 0, MOSWARMC[0], 'mosaic');
        F.cone(sg*CLX, WALKY+0.6, CLZF, 0.85,1.7, 0, mosw, 'mosaic'); });

      /* ================= 4. the loggia porch, the terrace and the trencadis facade ================= */
      var CX=[-18.6,-11.2,-3.75,3.75,11.2,18.6];
      CX.forEach(function(cx,ci){
        F.tube('plaster', [{x:cx,y:Y0,z:15.9,r:1.45},{x:cx,y:1.25,z:15.9,r:1.02},{x:cx,y:2.2,z:15.9,r:0.76},{x:cx,y:3.6,z:15.9,r:0.72},{x:cx,y:LOG,z:15.9,r:0.98}], bone,
          { seg:12, rfn:function(q,ang){ return q===0?1+0.09*Math.cos(ang*5):1; } });
        F.box(cx,LOG-0.05,15.9, 2.4,0.4,2.4, 0, stone2, 'plaster');
        [-1,1].forEach(function(sg){ F.tube('plaster', [{x:cx,y:LOG+0.3,z:15.9,r:0.42},{x:cx+sg*1.15,y:LOG+1.3,z:15.9,r:0.32},{x:cx+sg*2.0,y:LOG+2.5,z:15.9,r:0.24}], bone, { seg:8 }); });
        if(ci<5){ var bx=(cx+CX[ci+1])/2, bw=CX[ci+1]-cx;
          F.archwall('plaster', bx,LOG+0.35,15.9, 0, bw,ARC-LOG-0.35,1.6, bw-1.2,2.35, stone, { pointed:1.7, colIn:stone2, noTop:true }); } });
      F.box(0,ARC,15.7, 45.5,0.34,4.6, 0, stone, 'plaster');                                    /* the loggia terrace deck */
      F.box(0,ARC-0.32,15.7, 45.0,0.34,4.9, 0, MOSWARMC[3], 'mosaic');
      F.box(0,TER+0.3,15.7, 44.6,0.08,4.2, 0, PAL.pavingRich[0], 'adobe');
      for(var lg=0;lg<6;lg++){ var lx2=-19+lg*7.6; F.box(lx2, Y0, 13.9+0.0, 0.9,0.07,2.1, 0, PAL.pavingRich[2], 'adobe'); }
      /* the mask parapet on the terrace edge, the Batllo profile */
      [-15.3,0,15.3].forEach(function(fx){
        F.box(fx,TER+0.35,17.75, 6.6,0.95,0.42, 0, mosw, 'relief');
        [-1.6,1.6].forEach(function(ex){ F.disc(fx+ex, TER+0.95, 17.95, 0,1, 0.40,0.18, VOIDC[0], 'dark'); });
        F.box(fx,TER+1.28,17.75, 6.8,0.26,0.56, 0, stone, 'relief'); });
      [-22.3,22.3].forEach(function(px){ F.box(px,TER+0.35,15.7, 0.8,1.2,4.6, 0, mosw, 'relief'); });
      /* the facade, rising from the hall's front wall */
      [-15.2,0,15.2].forEach(function(fx,fi){
        F.archwall('mosaic', fx,FB,ZF+0.15, 0, 15.2,FT-FB,1.0, 5.4,5.2, mosw, { pointed:1.6, colIn:shade(BLUEGREYC[0],-0.35) });
        F.archband('relief', fx,FB,ZF+0.67, 0, 5.4,5.2, 0.62,0.24, stone, { pointed:1.6 });
        speckle('z', ZF+0.65, 1, fx-7.4,fx-3.1, FB+0.4,FT-0.3, 44); speckle('z', ZF+0.65, 1, fx+3.1,fx+7.4, FB+0.4,FT-0.3, 44);
        speckle('z', ZF+0.65, 1, fx-2.9,fx+2.9, FB+5.6,FT-0.3, 20);
        F.window(fx, FB+2.6, ZF+0.70, 0,1, 4.4,4.2, {noReveal:true});
        [-1.5,0,1.5].forEach(function(mx){ F.box(fx+mx, FB+0.3, ZF+0.74, 0.22,4.3,0.2, 0, pale, 'relief'); });
        F.box(fx, FB+2.5, ZF+0.74, 5.0,0.22,0.2, 0, pale, 'relief'); });
      F.roundWindow(0, FT-1.6, ZF+0.76, 0,1, 1.8, mosw, 10);
      speckle('z', ZF+0.65, 1, -23,-22.1, FB+0.4,FT-0.4, 11); speckle('z', ZF+0.65, 1, 22.1,23, FB+0.4,FT-0.4, 11);
      for(var cq=0;cq<22;cq++){ var cx2=-23+cq*46/22, cy=FT+0.55*Math.sin(cq*0.9);
        F.box(cx2+1.0, cy, ZF+0.45, 46/22+0.1, 0.55, 2.2, [0,0,0.06*Math.cos(cq*0.9)], (cq%2)?MOSBLUEC[0]:MOSGREENC[0], 'mosaic');
        if(cq%3===0) F.blob(cx2+1.0, cy+0.5, ZF+0.45, 0.45,0.5, 0, GILDC[0], 'mosaic'); }
      /* ---- the bulbous corner turret, now the front-left corner of the cloister ---- */
      var tx=-26.4, tz=13.0;
      F.lathe('mosaic', tx,tz, [[2.35,0],[2.15,3.0],[2.45,6.5],[2.05,10.0],[2.35,13.0],[1.95,15.4],[1.35,17.4],[0.80,18.7],[0.40,19.4]], mosw,
        { seg:16, rfn:function(q,ang){ return 1+0.05*Math.sin(ang*7); } });
      for(var sc=0;sc<22;sc++){ var sa=sc/22*TAU*2.4, sy=2.0+sc*0.72; F.box(tx+Math.cos(sa)*2.1, sy, tz+Math.sin(sa)*2.1, 0.55,0.5,0.55, [0,-sa,0.3], F.pick([MOSBLUEC[0],MOSGREENC[0],MOSWARMC[0],GILDC[0]]), 'mosaic'); }
      F.window(tx, 8.2, tz+2.2, 0,1, 0.8,1.4, {noReveal:true}); F.window(tx, 12.6, tz+2.15, 0,1, 0.8,1.4, {noReveal:true});
      F.lathe('mosaic', tx,tz, [[0.55,19.4],[0.30,20.1]], GILDC[0], { seg:10 });
      F.cyl(tx,20.0,tz, 0.13,1.4, 0, mosw,'mosaic'); [0,PI/2].forEach(function(ca){ F.box(tx,20.8,tz, 1.5,0.22,0.22, ca, mosw,'mosaic'); });
      F.ball(tx,21.4,tz, 0.24, GILDC[0],'metal');
      /* forecourt */
      F.box(0,0,20.6, 9.0,0.12,8.0, 0, PAL.pavingRich[0], 'adobe');
      [-1,1].forEach(function(sg){ F.tree(sg*9.0, 20.6, 'cypress', F.rr(7,8.5)); F.tree(sg*16.5, 21.4, 'olive', F.rr(4,5)); F.tree(sg*24.5, 20.0, 'shrub', F.rr(1.1,1.5));
        F.lantern(sg*3.8, 3.2, 19.4, 1.0, 15, 0); F.lathe('mosaic', sg*6.4,19.0, [[0.62,0],[0.85,0.7],[0.70,1.1]], F.pick([MOSBLUEC[0],MOSWARMC[0]]), { seg:10 });
        F.blob(sg*6.4, 1.0, 19.0, 0.95,0.85, 0, PAL.shrub[1], 'leafy'); });
    } });

  /* =====================================================================================================
     14. THE SCHOOL   (Gaudi's Sagrada Familia Schools: undulating walls, warped conoid roof)
     ===================================================================================================== */
  ASSET({ key:'civic_school', name:'School of the Order', family:'civic', districts:['prosper','market','poor'], wealth:[0.2,0.8], w:46, d:30, h:11, variants:3,
    variantNames:['short wave','long wave','tight wave, whitewashed'],
    build:function(F){
      var v=F.variant, ph=(v===1)?PI:(v===2?PI/2:0), kk=TAU/(v===1?10.4:(v===2?6.0:7.2)), A=(v===1)?1.25:(v===2?0.78:0.92);
      var X=(v===1)?20.6:(v===2?19.4:18.0), N=(v===1)?56:48, ov=0.55;
      var wash=(v===2), red=wash?WHITEC[1]:ADOBEREDC[v?2:0], red2=wash?BLUEDC[1]:shade(ADOBEREDC[3],-0.05);
      var wfam=wash?'plaster':'adobe', white=WHITEC[0], tile=wash?TILEC[1]:TILEC[v?2:0], band=wash?MOSBLUEC[0]:MOSGREENC[0];
      var zF0=1.2, zB0=-12.2, zR=-5.5, DADO=1.15;
      function ws(x){ return A*Math.sin(kk*x+ph); }  function dws(x){ return A*kk*Math.cos(kk*x+ph); }
      function zF(x){ return zF0+ws(x); }  function zB(x){ return zB0+ws(x); }
      function hE(x){ return 4.05-0.62*Math.sin(kk*x+ph); }                    /* eaves wave DOWN where... */
      function hR(x){ return 5.60+0.80*Math.sin(kk*x+ph); }                    /* ...the ridge waves UP: the conoid */
      /* ---- the undulating walls, with reveals and parabolic heads on the openings ---- */
      for(var i=0;i<N;i++){
        var xa=-X+i*2*X/N, xb=-X+(i+1)*2*X/N, xm=(xa+xb)/2;
        [[zF,1],[zB,-1]].forEach(function(e,ei){
          var zf1=e[0](xa), zf2=e[0](xb), sg=e[1], d=dws(xm), nl=Math.hypot(d,1), hn=[-d/nl*sg,0,1/nl*sg], hin=[d/nl*sg,0,-1/nl*sg];
          var ya=hE(xa), yb2=hE(xb), cc=shade(red, ((i*7)%5-2)*0.018), yaw=Math.atan2(hn[0],hn[2]);
          F.quad(wfam, [xa,0,zf1],[xb,0,zf2],[xb,DADO,zf2],[xa,DADO,zf1], white, hn);                          /* whitewashed dado */
          F.quad(wfam, [xa,DADO,zf1],[xb,DADO,zf2],[xb,yb2,zf2],[xa,ya,zf1], cc, hn);                          /* brick above */
          var ix=-sg*0.45;
          F.quad(wfam, [xa,0,zf1+ix],[xb,0,zf2+ix],[xb,yb2,zf2+ix],[xa,ya,zf1+ix], shade(cc,-0.3), hin);       /* inner face */
          F.quad(wfam, [xa,ya,zf1],[xb,yb2,zf2],[xb,yb2,zf2+ix],[xa,ya,zf1+ix], shade(cc,0.06), [0,1,0]);      /* wall head */
          var open=(ei===0) ? (i%6===3 && Math.abs(xm)>3.6) : (i%6===0 && Math.abs(xm)>3.0);
          if(open){ var zw=e[0](xm), wW=(ei===0)?1.25:1.15, wH=(ei===0)?1.35:1.25;
            F.window(xm, 2.62, zw+sg*0.04, hn[0],hn[2], wW,wH);                                                /* WITH its reveal */
            F.archband(wfam, xm, 1.95, zw+sg*0.10, yaw, wW+0.30, wH+0.95, 0.26,0.10, white);                   /* parabolic head */
            F.box(xm, 1.86, zw+sg*0.10, wW+0.85,0.16,0.16, yaw, white, 'plaster');                             /* sill */
            F.box(xm, 1.90, zw+sg*0.13, wW+0.30,0.10,0.10, yaw, band, 'mosaic'); } });
        /* ---- the warped conoid roof: straight rulings from a waving eave to a waving ridge ---- */
        var ta=hE(xa), tb=hE(xb), ra=hR(xa), rb=hR(xb), tc=F.pick([tile, shade(tile,0.08), shade(tile,-0.08), TILEC[1]]);
        F.quad('tile', [xa,ta,zF(xa)+ov],[xb,tb,zF(xb)+ov],[xb,rb,zR],[xa,ra,zR], tc, [0,1,0.5]);
        F.quad('tile', [xa,ta-0.22,zF(xa)+ov],[xb,tb-0.22,zF(xb)+ov],[xb,rb-0.22,zR],[xa,ra-0.22,zR], shade(tc,-0.4), [0,-1,-0.4]);
        F.quad('tile', [xa,ra,zR],[xb,rb,zR],[xb,tb,zB(xb)-ov],[xa,ta,zB(xa)-ov], shade(tc,-0.05), [0,1,-0.5]);
        F.quad('tile', [xa,ra-0.22,zR],[xb,rb-0.22,zR],[xb,tb-0.22,zB(xb)-ov],[xa,ta-0.22,zB(xa)-ov], shade(tc,-0.4), [0,-1,0.4]);
        F.quad('tile', [xa,ta,zF(xa)+ov],[xb,tb,zF(xb)+ov],[xb,tb-0.22,zF(xb)+ov],[xa,ta-0.22,zF(xa)+ov], shade(tc,-0.15), [0,0,1]);
        F.quad('tile', [xa,ta,zB(xa)-ov],[xb,tb,zB(xb)-ov],[xb,tb-0.22,zB(xb)-ov],[xa,ta-0.22,zB(xa)-ov], shade(tc,-0.15), [0,0,-1]);
        /* ---- the scalloped ridge: a rolled mosaic crest with a shell in every other bay ---- */
        if(i%2===0){ var rm=hR(xm);
          F.box(xm, rm-0.10, zR, 2*X/N*2+0.06, 0.34, 1.05, 0, (i%4)?PAL.mosaicWhite[0]:band, 'mosaic');
          F.edome(xm, rm+0.22, zR, 0.62,0.55,0.62, 0, (i%4)?band:MOSWARMC[0], 'mosaic');
          if(i%8===0) F.ball(xm, rm+0.95, zR, 0.16, GILDC[0], 'metal'); } }
      /* ---- the two end walls: gable with a tile-mosaic tympanum ---- */
      [-1,1].forEach(function(sg){ var x=sg*X, zf1=zF(x), zb1=zB(x), h=hE(x), hr=hR(x);
        F.quad(wfam, [x,0,zb1],[x,0,zf1],[x,DADO,zf1],[x,DADO,zb1], white, [sg,0,0]);
        F.quad(wfam, [x,DADO,zb1],[x,DADO,zf1],[x,h,zf1],[x,h,zb1], red, [sg,0,0]);
        F.tri (wfam, [x,h,zf1],[x,hr,zR],[x,h,zb1], shade(red,0.05), [sg,0,0]);
        F.quad(wfam, [x-sg*0.4,0,zb1],[x-sg*0.4,0,zf1],[x-sg*0.4,h,zf1],[x-sg*0.4,h,zb1], shade(red,-0.3), [-sg,0,0]);
        /* the tympanum: a diamond field of tile mosaic under the gable, and a little roundel */
        for(var g=0;g<9;g++){ var gz=zR+(g-4)*1.5, gh=h+(hr-h)*(1-Math.abs(gz-zR)/((zf1-zR)));
          if(gh>h+0.35) F.box(x+sg*0.10, h+0.10, gz, 0.2,(gh-h-0.25),1.25, [0,sg*PI/2,PI/4], (g%2)?band:MOSWARMC[0], 'mosaic'); }
        F.disc(x+sg*0.14, h-1.0, zR, sg,0, 0.72,0.18, PAL.mosaicWhite[0], 'relief');
        F.disc(x+sg*0.22, h-1.0, zR, sg,0, 0.44,0.18, band, 'mosaic');
        F.box(x+sg*0.10, h+0.02, zR, 0.32,0.30,(zf1-zb1)*0.96, 0, white, 'plaster'); });
      /* ---- entrance porch ---- */
      var pz=zF(0);
      F.archwall(wfam, 0,0,pz+1.45, 0, 5.0,3.6,2.6, 2.4,3.0, red2, { colIn:shade(red,-0.3) });
      F.archband('mosaic', 0,0,pz+2.78, 0, 2.4,3.0, 0.32,0.12, MOSWARMC[0]);
      F.box(0,3.6,pz+1.45, 5.4,0.35,2.9, 0, white, 'plaster'); F.box(0,3.95,pz+1.45, 4.4,0.3,2.3, 0, MOSBLUEC[0], 'mosaic');
      for(var pk=0;pk<6;pk++) F.blob(-2.0+pk*0.8, 4.25, pz+1.45, 0.34,0.36, 0, (pk%2)?MOSWARMC[0]:PAL.mosaicWhite[0], 'mosaic');
      F.door(0, pz+0.05, 0,1, 1.9,2.5, PLANKC[2]); studs(F, 0,0,pz+0.09, 1.9,2.5);
      F.lantern(1.7, 2.9, pz+2.7, 0.9,13, 0.4);
      /* ---- the stair turret, with the bell on its wrought arch ---- */
      var tx=(v===1)?(X-2.6):(-X+2.6), tz=zR+0.6, TH=8.4;
      F.lathe(wfam, tx,tz, [[1.55,0],[1.45,2.2],[1.50,4.6],[1.40,7.0],[1.55,TH]], shade(red,0.05), { seg:14, rfn:function(q,ang){ return 1+0.035*Math.cos(ang*6); } });
      F.lathe('mosaic', tx,tz, [[1.62,1.10],[1.62,1.45]], band, { seg:14 });
      F.lathe('mosaic', tx,tz, [[1.64,TH-0.45],[1.64,TH]], PAL.mosaicWhite[0], { seg:14 });
      for(var sw=0;sw<5;sw++){ var sa=sw*1.25, sy=1.9+sw*1.25;                                   /* slit lights climbing the stair */
        F.window(tx+Math.cos(sa)*1.48, sy, tz+Math.sin(sa)*1.48, Math.cos(sa),Math.sin(sa), 0.42,0.95, {noReveal:true});
        F.box(tx+Math.cos(sa)*1.50, sy-0.72, tz+Math.sin(sa)*1.50, 0.62,0.10,0.10, Math.atan2(Math.cos(sa),Math.sin(sa)), white, 'plaster'); }
      F.mcone('tile', tx,TH,tz, 1.85,0.35,1.5, tile, 14, { under:true });
      F.ball(tx,TH+1.7,tz, 0.20, GILDC[0], 'metal');
      var bh=TH+0.1;
      F.tube('metal', [{x:tx-1.5,y:bh,z:tz+1.7,r:0.09},{x:tx-1.2,y:bh+1.4,z:tz+1.7,r:0.08},{x:tx,y:bh+2.05,z:tz+1.7,r:0.08},{x:tx+1.2,y:bh+1.4,z:tz+1.7,r:0.08},{x:tx+1.5,y:bh,z:tz+1.7,r:0.09}], TARNC[1], { seg:6 });
      F.box(tx,bh+1.78,tz+1.7, 1.5,0.16,0.18, 0, TIMBERC[1], 'timber');
      F.lathe('metal', tx,tz+1.7, [[0.16,bh+0.95],[0.52,bh+1.10],[0.58,bh+1.50],[0.42,bh+1.76]], GILDC[0], { seg:10 });
      F.ball(tx,bh+0.87,tz+1.7, 0.14, GILDC[2],'metal');
      /* ---- the walled teaching yard ---- */
      var YZ0=2.6, YZ1=14.0, YX=X+1.6;
      [-1,1].forEach(function(sg){ F.box(sg*YX,0,(YZ0+YZ1)/2, 0.5,1.05,YZ1-YZ0, 0, red, wfam); F.box(sg*YX,1.05,(YZ0+YZ1)/2, 0.68,0.26,YZ1-YZ0, 0, band, 'mosaic');
        for(var kp=0;kp<5;kp++) F.blob(sg*YX, 1.31, YZ0+1.4+kp*2.4, 0.32,0.34, 0, (kp%2)?MOSWARMC[0]:PAL.mosaicWhite[0], 'mosaic'); });
      F.box(0,0,YZ1, 2*YX,1.05,0.5, 0, red, wfam); F.box(0,1.05,YZ1, 2*YX+0.18,0.26,0.68, 0, band, 'mosaic');
      F.box(0,0,YZ1, 4.2,1.75,0.7, 0, red2, wfam); F.box(0,0,YZ1, 3.0,1.9,0.8, 0, VOIDC[1], 'dark');   /* the yard gate */
      for(var pq=0;pq<10;pq++) F.box(-18+pq*4.0, 0.02, YZ0+1.2, 3.4,0.07,2.6, 0, (pq%2)?PAL.pavingRich[0]:PAL.mosaicWhite[0], 'mosaic');
      F.box(0,0,YZ0-0.3, 2*YX,0.08,0.3, 0, PAL.paving[0], 'adobe');
      /* the well head */
      F.sector('mosaic', -13.0,10.6, 1.05,1.45, 0,TAU, 0,0.85, PAL.mosaicWhite[0], { faces:'tio' });
      F.sector('dark', -13.0,10.6, 0,1.05, 0,TAU, 0,0.55, VOIDC[0], { faces:'t' });
      [-1,1].forEach(function(sg){ F.rod(-13.0+sg*1.25,0.85,10.6, -13.0+sg*1.25,3.05,10.6, 0.09, TIMBERC[0], 'timber'); });
      F.rod(-14.25,3.05,10.6, -11.75,3.05,10.6, 0.09, TIMBERC[1], 'timber');
      F.cyl(-13.0,2.55,10.6, 0.10,0.45, 0, TIMBERC[3], 'timber'); F.lathe('plank', -13.0,10.6, [[0.26,2.05],[0.30,2.50]], PLANKC[1], { seg:8 });
      F.mcone('tile', -13.0,3.05,10.6, 1.9,0.25,1.1, tile, 12, { under:true });
      /* benches along the east wall, in the cloister idiom */
      F.box(YX-0.75,0,8.3, 0.95,0.5,9.0, 0, PAL.mosaicWhite[0], 'mosaic'); F.box(YX-0.30,0.5,8.3, 0.35,0.55,9.0, 0, MOSWARMC[0], 'mosaic');
      for(var bs=0;bs<5;bs++) F.blob(YX-0.75, 0.55, 4.6+bs*1.9, 0.3,0.28, 0, (bs%2)?band:MOSBLUEC[0], 'mosaic');
      /* teaching in the open: the registered school furniture under the shade tree */
      placeFurn(F,'order_writing_board', 4.6, 12.4, PI, 0, 1, (v===2)?1:0);
      placeFurn(F,'order_master_chair', 4.6, 10.6, PI, 0, 2, 0);
      placeFurn(F,'order_pupil_desk', 1.2, 8.2, PI, 0, 3, 1); placeFurn(F,'order_pupil_desk', 8.0, 8.2, PI, 0, 4, 0);
      placeFurn(F,'order_pupil_desk', 1.2, 5.8, PI, 0, 5, 0); placeFurn(F,'order_pupil_desk', 8.0, 5.8, PI, 0, 6, 1);
      placeFurn(F,'order_mat_rack', -3.4, 12.6, PI, 0, 7, (v===1)?1:0);
      F.tree(-8.2, 8.0, 'olive', 5.2); F.tree(13.0, 11.6, 'pine', 8.0); F.tree(-17.0, 5.0, 'shrub', 1.3); F.tree(16.0, 4.4, 'shrub', 1.1);
      F.lantern(-6.5, 2.6, 12.6, 0.8, 12, 0);
    } });

