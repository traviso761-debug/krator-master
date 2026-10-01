/* ============================== 16Q. LOCUS — the Geomancers' Chapterhouse ==============================
   Yuni civic style in EARTH: raw umber drum, burnt-sienna dome, ochre bands, laterite pinnacles — the
   polychrome and the blue kept to a single frieze and the archivolts. The hall is one cavernous dome
   (17 m clear inside, corbelled in stepped rings, an oculus at the crown), entered through a nested
   parabolic porch between two blunt towers; assay wings either side, a survey tower behind, a walled
   forecourt in front with the core rack and the gnomon of the Geomancers.                          */
reseed(645001);
(function(){
  var PI=Math.PI, GROUP="Geomancers' Chapterhouse";
  ASSET({ key:'civic_geomancer_chapterhouse', name:"Geomancers' Chapterhouse", family:'civic', kit:'locus', group:GROUP, culture:'geomancer', types:['civic','religious'],
    districts:['core','prosper'], wealth:[0.6,1], w:48, d:42, h:27, variants:1,
    build:function(F){
      var umber=UMBERC[0], umber2=UMBERC[1], sienna=SIENNAC[0], sienna2=SIENNAC[3], ochre=ADOBEC[0], dk=PAL.adobeDark[1], rel=shade(SIENNAC[3],0.14), relU=shade(UMBERC[3],0.16);
      var C=[0,-3], R=12.0, DH=7.5, gap=0.21, a0=PI/2+gap, a1=PI/2-gap+TAU;     /* the drum, with its door gap toward +z */
      function domeR(t){ return 11.2*Math.pow(Math.max(0,1-Math.pow(t,2.4)),0.55); }
      var DOME_H=17.5, TOP=DH+DOME_H;
      /* ---- the drum: thick ring wall, relief band, parapet, pilaster-buttresses with pinnacles, toron rings ---- */
      F.sector('adobe', C[0],C[1], R-0.9,R, a0,a1, 0,DH, umber, { faces:'tios', colInner:shade(umber,-0.30), step:1.6 });
      F.sector('relief', C[0],C[1], R-0.05,R+0.16, a0,a1, DH-1.3,DH-0.6, relU, { faces:'tbos', step:1.6 });
      F.sector('adobe', C[0],C[1], R-0.9,R+0.08, a0,a1, DH,DH+0.7, dk, { faces:'tios', colInner:shade(umber,-0.30), step:1.6 });
      F.sector('adobe', C[0],C[1], 0,R-0.85, 0,TAU, 0,0.08, PAL.pavingRich[0], { faces:'t', step:1.6 });                            /* the hall floor */
      for(var i=0;i<14;i++){ var a=i/14*TAU+PI/14; if(Math.abs(wrapPi(a-PI/2))<0.32) continue; var px=C[0]+Math.cos(a)*(R+0.1), pz=C[1]+Math.sin(a)*(R+0.1);
        F.fr5(px, 0, pz, 1.25, DH+1.6, 1.25, -a, umber2, 'adobe'); F.cone(px, DH+1.55, pz, 0.36, 1.5, 0, ochre, 'adobe'); }
      [2.6,5.4].forEach(function(y){ for(var t=0;t<30;t++){ var ta=t/30*TAU+0.1; if(Math.abs(wrapPi(ta-PI/2))<0.34) continue; F.toron(C[0]+Math.cos(ta)*R, y, C[1]+Math.sin(ta)*R, Math.cos(ta), Math.sin(ta), 0.85); } });
      /* ---- the dome. The INNER shell is built first: NR corbelled rings, each stepping inward past the one below
         (ring i: inner radius ri(i) on a smooth curve, outer radius ri(i-1)+0.35 so nothing shows through), and the
         OUTER skin is then lathed 0.5 m outside the rings, so no ring can poke through it. ---- */
      var NR=14, Y0=DH+0.7, ri=[], ro=[], ys=[];
      for(var r2=0;r2<=NR;r2++){ ys.push(Y0+DOME_H*0.965*r2/NR); }
      for(var r3=0;r3<NR;r3++){ ri.push(domeR((r3+1)/NR*0.965)-0.8); ro.push(r3===0 ? R-0.9 : ri[r3-1]+0.35); }
      var prof=[[R-0.2, Y0]]; for(var r4=1;r4<NR;r4++) prof.push([ro[r4]+0.5, ys[r4]]); prof.push([ri[NR-1]+0.5, ys[NR]]);
      function skinR(y){ for(var i=1;i<prof.length;i++){ if(y<=prof[i][1]){ var t=(y-prof[i-1][1])/(prof[i][1]-prof[i-1][1]); return mix(prof[i-1][0],prof[i][0],t); } } return prof[prof.length-1][0]; }
      F.lathe('adobe', C[0],C[1], prof, sienna, { seg:36 });
      [0.22,0.50].forEach(function(t){ var y=Y0+DOME_H*t, r=skinR(y)+0.14; F.lathe('relief', C[0],C[1], [[r,y-0.45],[skinR(y+0.45)+0.14,y+0.45]], rel, { seg:36 }); });
      [0.12,0.36,0.62].forEach(function(t,rI){ var y=Y0+DOME_H*t, r=skinR(y)-0.15, n=[26,22,16][rI]; for(var q=0;q<n;q++){ var qa=q/n*TAU+rI*0.13; F.toron(C[0]+Math.cos(qa)*r, y, C[1]+Math.sin(qa)*r, Math.cos(qa), Math.sin(qa), 0.7, 0.08); } });
      var ty=ys[NR]; F.cyl(C[0], ty-0.2, C[1], ri[NR-1]+0.9, 0.5, 0, dk, 'adobe');
      for(var l=0;l<8;l++){ var la=l/8*TAU; F.cyl(C[0]+Math.cos(la)*1.7, ty+0.3, C[1]+Math.sin(la)*1.7, 0.16, 2.2, 0, ochre, 'adobe'); }
      F.cyl(C[0], ty+0.3, C[1], 1.25, 2.2, 0, VOIDC[1], 'dark'); F.mcone('adobe', C[0], ty+2.5, C[1], 2.3, 0.0, 1.9, sienna2, 12, { under:true });
      F.ball(C[0], ty+4.6, C[1], 0.32, BRASSC[1], 'metal');
      /* ---- inside: the corbelled rings (a polychrome frieze on the lowest), the oculus glow, electric light strips on the drum ---- */
      for(var r5=0;r5<NR;r5++){ F.sector(r5===0?'paintcol':'adobe', C[0],C[1], ri[r5],ro[r5], 0,TAU, ys[r5],ys[r5+1], r5===0 ? 0xf0e6d0 : (r5%2 ? umber2 : sienna),
          { faces:'bi', colInner: r5===0 ? 0xf0e6d0 : (r5%2 ? shade(umber2,-0.08) : shade(sienna,-0.10)), step:1.8 }); }
      F.cyl(C[0], ty-0.55, C[1], ri[NR-1]+0.3, 0.12, 0, PAL.electric, 'glowmat'); nlLampAdd(F.P(C[0],0,C[1]).x, F.y+ty-1, F.P(C[0],0,C[1]).z, 1.4, 30, true);
      for(var s=0;s<8;s++){ var sa=s/8*TAU+PI/8; if(Math.abs(wrapPi(sa-PI/2))<0.4) continue; var sx=C[0]+Math.cos(sa)*(R-0.95), sz=C[1]+Math.sin(sa)*(R-0.95);
        F.box(sx, 1.2, sz, 0.12, 4.8, 0.12, -sa, PAL.electric, 'glowmat'); }
      nlLampAdd(F.P(C[0],0,C[1]-4).x, F.y+3.0, F.P(C[0],0,C[1]-4).z, 1.2, 22, true);
      /* the relief-map table at the centre: a rock drum with a modelled crater on top, and the mosaic medallion round it */
      F.sector('mosaic', C[0],C[1], 3.2,5.2, 0,TAU, 0.08,0.16, MOSWARMC[0], { faces:'to', step:1.2 });
      F.lathe('rock', C[0],C[1], [[3.0,0.1],[3.05,0.9],[2.8,1.05]], ROCKC[1], { seg:20 }); F.lathe('rock', C[0],C[1], [[2.75,1.05],[2.1,1.25],[1.3,1.12],[0.5,1.45],[0.05,1.5]], ROCKC[2], { seg:20 });
      /* ---- the porch: a deep parabolic gate in umber, three nested archivolts, a crest dome, two blunt towers ---- */
      F.archwall('adobe', 0, 0, 9.0, 0, 10.0, 10.0, 4.6, 4.6, 6.6, umber, { pointed:2.4, colIn:shade(umber,-0.22), seg:18 });
      F.archband('relief', 0, 0, 11.32, 0, 4.6, 6.6, 0.55, 0.14, relU, { pointed:2.4 });
      F.archband('mosaic', 0, 0, 11.30, 0, 5.7, 7.25, 0.42, 0.10, MOSWARMC[0], { pointed:2.4 });
      F.archband('relief', 0, 0, 11.32, 0, 6.55, 7.75, 0.55, 0.14, relU, { pointed:2.4 });
      F.box(0, 10.0, 9.0, 10.2, 0.4, 4.8, 0, dk, 'adobe'); F.edome(0, 10.4, 9.0, 4.6, 2.2, 2.3, 0, sienna, 'adobe');
      [-4.5,-1.5,1.5,4.5].forEach(function(x){ F.cone(x, 10.4, 11.1, 0.36, 1.3, 0, ochre, 'adobe'); });
      for(var d=0;d<5;d++){ F.toron(-3.2+d*1.6, 8.4, 11.3, 0,1, 0.8); }
      F.box(0, 0, 8.4, 4.8, 0.06, 6.0, 0, PAL.pavingRich[1], 'adobe');                                                                 /* the passage floor */
      [-6.4,6.4].forEach(function(x){ F.tower(x, 0, 9.4, 1.75, 15.5, { fam:'adobe', col:umber2, band:MOSWARMC[0], flutes:8, windows:[0.46,0.70], finial:true }); });
      [-2.6,2.6].forEach(function(x){ F.cyl(x, 4.6, 11.45, 0.04, 1.0, 0, STEELDC[0], 'rust'); F.ball(x, 5.6, 11.45, 0.18, PAL.electric, 'glowmat'); nlLampAdd(F.P(x,0,11.45).x, F.y+5.6, F.P(x,0,11.45).z, 1.1, 16, true); });
      (F.doors||(F.doors=[])).push([F.P(0,0,12.0).x, F.y, F.P(0,0,12.0).z]);
      /* ---- the wings: two assay halls, ochre with umber pilasters, parabolic windows, a link passage each ---- */
      [-1,1].forEach(function(s){ var wx=s*17.5, wz=-6.0, WW=10, WD=20, WH=6.5;
        F.fr8(wx, 0, wz, WW, WH, WD, 0, ochre, 'adobe'); F.box(wx, WH-0.05, wz, WW*0.84-0.3, 0.45, WD*0.84-0.3, 0, dk, 'adobe');
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ F.fr5(wx+c[0]*(WW/2-0.4), 0, wz+c[1]*(WD/2-0.4), 1.1, WH+0.9, 1.1, 0, umber2, 'adobe'); F.cone(wx+c[0]*(WW/2-0.4), WH+0.85, wz+c[1]*(WD/2-0.4), 0.3, 1.2, 0, ochre, 'adobe'); });
        [-0.33,0.33].forEach(function(f){ F.fr5(wx+f*WW, 0, wz+WD/2-0.35, 1.0, WH+0.7, 1.0, 0, umber2, 'adobe'); F.cone(wx+f*WW, WH+0.65, wz+WD/2-0.35, 0.28, 1.1, 0, ochre, 'adobe'); });
        F.box(wx, WH-1.5, wz+WD/2*(1-0.16*(WH-1.5)/WH)+0.02, WW*0.7, 0.32, 0.12, 0, relU, 'relief');
        var fz=wz+WD/2; F.door(wx, fz+0.02, 0,1, 1.3, 2.4, PLANKC[0]); F.archband('relief', wx, 0, fz+0.14, 0, 1.7, 2.75, 0.35, 0.16, relU);
        [1.8,-1.8].forEach(function(o){ var wy=4.2, zz=fz*1 - (WD/2)*0.16*wy/WH; F.window(wx+o*1.6, wy, zz+0.02, 0,1, 0.7, 1.3); F.archband('relief', wx+o*1.6, wy-0.65, zz+0.10, 0, 0.9, 1.55, 0.22, 0.1, relU); });
        for(var w2=0;w2<4;w2++){ var wy2=4.2, zo=wz+(w2-1.5)*4.4, xo=wx+s*(WW/2)*(1-0.16*wy2/WH); F.window(xo+s*0.02, wy2, zo, s,0, 0.7, 1.3); F.archband('relief', xo+s*0.10, wy2-0.65, zo, s>0?PI/2:-PI/2, 0.9, 1.55, 0.22, 0.1, relU); }
        for(var r3=0;r3<3;r3++) for(var c3=0;c3<=r3;c3++){ var vy=WH-1.9-r3*0.42; F.pyr(wx+(c3-r3/2)*0.62, vy, wz+(WD/2)*(1-0.16*vy/WH)-0.1, 0.36,0.32,0.3, 0, VOIDC[0], 'dark'); }
        for(var t2=0;t2<5;t2++) F.toron(wx+(t2-2)*1.6, WH-0.9, wz+(WD/2)*(1-0.16*(WH-0.9)/WH), 0,1, 0.75);
        F.box(s*11.6, 0, -4.0, 2.0, 4.4, 5.0, 0, umber2, 'adobe'); F.box(s*11.6, 4.4, -4.0, 2.2, 0.35, 5.2, 0, dk, 'adobe');                /* the link passage */
        F.lantern(wx-s*2.4, 3.0, fz+0.4, 0.8, 12, 0); });
      /* ---- the survey tower behind: a tapering mud minaret with toron studs, a lookout, the brass sighting instrument ---- */
      var TX=0, TZ=-17.5, TH=19; F.fr5(TX, 0, TZ, 6.4, TH, 6.4, 0, umber, 'adobe'); F.box(TX, TH-0.05, TZ, 3.4, 0.6, 3.4, 0, dk, 'adobe');
      for(var rr=0;rr<5;rr++) for(var kk=0;kk<4;kk++){ var ty2=2.5+rr*3.2, in_=1-0.5*ty2/TH; F.toron(TX+(kk-1.5)*1.3*in_, ty2, TZ-3.2*in_, 0,-1, 0.7); F.toron(TX-3.2*in_, ty2, TZ+(kk-1.5)*1.3*in_, -1,0, 0.7); F.toron(TX+3.2*in_, ty2, TZ+(kk-1.5)*1.3*in_, 1,0, 0.7); }
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ F.cone(TX+c[0]*1.5, TH+0.5, TZ+c[1]*1.5, 0.32, 1.4, 0, ochre, 'adobe'); });
      F.cyl(TX, TH+0.55, TZ, 0.9, 0.16, 0, ROCKC[2], 'rock'); F.cyl(TX, TH+0.7, TZ, 0.07, 1.4, 0, BRASSC[0], 'metal'); F.cyl(TX, TH+2.0, TZ, 0.12, 0.7, [0,0,PI/2*0.7], BRASSC[1], 'metal'); F.ball(TX, TH+2.4, TZ, 0.14, BRASSC[2], 'metal');
      F.window(TX, TH-3.0, TZ-3.2*(1-0.5*(TH-3.0)/TH)-0.02, 0,-1, 0.6, 1.1); F.window(TX, TH-7.0, TZ-3.2*(1-0.5*(TH-7.0)/TH)-0.02, 0,-1, 0.6, 1.1);
      /* ---- the forecourt: relief-carved wall with a parabolic gate, warm paving, palms, the core rack and the gnomon ---- */
      F.box(0, 0, 15.6, 46, 0.06, 8.0, 0, PAL.pavingRich[2], 'adobe');
      [-1,1].forEach(function(s){ F.box(s*13.4, 0, 19.6, 19.2, 2.4, 0.7, 0, ochre, 'adobe'); F.box(s*13.4, 0.6, 19.6, 19.2, 1.4, 0.8, 0, relU, 'relief'); F.box(s*13.4, 2.4, 19.6, 19.3, 0.3, 0.9, 0, dk, 'adobe');
        for(var g=0;g<4;g++){ var gx=s*(4.6+g*4.8); F.fr5(gx, 0, 19.6, 1.0, 3.2, 1.0, 0, umber2, 'adobe'); F.cone(gx, 3.15, 19.6, 0.28, 0.9, 0, ochre, 'adobe'); }
        F.fr5(s*23.2, 0, 19.6, 1.3, 3.6, 1.3, 0, umber2, 'adobe'); F.cone(s*23.2, 3.55, 19.6, 0.36, 1.1, 0, ochre, 'adobe'); });
      F.archwall('adobe', 0, 0, 19.6, 0, 7.6, 5.0, 1.2, 3.6, 4.0, umber, { pointed:2.4, colIn:shade(umber,-0.2), seg:14 });
      F.archband('relief', 0, 0, 20.22, 0, 3.6, 4.0, 0.42, 0.1, relU, { pointed:2.4 }); F.edome(0, 5.0, 19.6, 3.9, 0.8, 0.9, 0, sienna, 'adobe');
      F.lantern(-2.4, 3.2, 20.4, 0.8, 12, 0); F.lantern(2.4, 3.2, 20.4, 0.8, 12, 0);
      /* the enclosure continues round the sides and the back: the same relief-banded ochre wall, pilaster-pinnacles every ~5 m,
         the survey tower standing in the middle of the back wall. No second gate: the compound is entered only from the front. */
      function wallRun(x0,z0,x1,z1){ var L=Math.hypot(x1-x0,z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2, yaw=Math.atan2(x1-x0,z1-z0)+PI/2;
        F.box(cx, 0, cz, L, 2.4, 0.7, yaw, ochre, 'adobe'); F.box(cx, 0.6, cz, L, 1.4, 0.8, yaw, relU, 'relief'); F.box(cx, 2.4, cz, L+0.1, 0.3, 0.9, yaw, dk, 'adobe');
        var n=Math.max(1,Math.round(L/4.8)); for(var i=1;i<n;i++){ var t=i/n, px=mix(x0,x1,t), pz=mix(z0,z1,t); F.fr5(px, 0, pz, 1.0, 3.2, 1.0, 0, umber2, 'adobe'); F.cone(px, 3.15, pz, 0.28, 0.9, 0, ochre, 'adobe'); } }
      [-1,1].forEach(function(s){ wallRun(s*23.2, 19.6, s*23.2, -20.4); wallRun(s*23.2, -20.4, s*3.2, -20.4);
        F.fr5(s*23.2, 0, -20.4, 1.3, 3.6, 1.3, 0, umber2, 'adobe'); F.cone(s*23.2, 3.55, -20.4, 0.36, 1.1, 0, ochre, 'adobe'); });
      F.box(0, 0, -6, 46, 0.05, 28, 0, shade(PAL.pavingRich[2],-0.06), 'adobe');                                                          /* the inner yard, swept earth */
      LOCUS.plant(F, 'marsh_palmetto', -9.5, 14.5, 0.3, { variant:0 }); LOCUS.plant(F, 'marsh_palmetto', 9.5, 14.5, 2.4, { variant:0 });
      LOCUS.plant(F, 'marsh_palmetto', -17.5, 15.5, 1.1, { variant:1 }); LOCUS.plant(F, 'marsh_palmetto', 17.5, 15.5, 4.0, { variant:1 });
      [-9.0,-5.2,5.2,9.0].forEach(function(x,b){ F.ball(x, 0.06, 18.2, 0.55, PAL.shrub[b%4], 'leafy'); });                        /* the processional line from gate to porch stays clear */
      /* the core rack: a timber frame hung with drill cores from the salt flats (the Geomancers' trade sign) */
      var rx=-13.5, rz=17.0; F.cyl(rx-2.0, 0, rz, 0.10, 3.0, 0, TIMBERC[0], 'timber'); F.cyl(rx+2.0, 0, rz, 0.10, 3.0, 0, TIMBERC[0], 'timber'); F.rod(rx-2.1, 2.95, rz, rx+2.1, 2.95, rz, 0.08, TIMBERC[2], 'timber');
      for(var c2=0;c2<7;c2++){ var cx=rx-1.7+c2*0.57, ch=1.1+0.5*((c2*7)%3), cc=[ROCKC[0],SALTCRUSTC[2],ROCKC[3],OILC[1],ROCKC[2],ADOBEREDC[3],ROCKC[1]][c2]; F.rod(cx, 2.95, rz, cx, 2.95-0.35, rz, 0.015, PAL.people.hair[2], 'timber'); F.cyl(cx, 2.6-ch, rz, 0.11, ch, 0, cc, 'rock'); }
      /* the gnomon: a brass rod on a stone drum inside a mosaic hour-ring */
      F.sector('mosaic', 13.5, 17.0, 1.6, 2.1, 0,TAU, 0.06, 0.14, MOSWARMC[0], { faces:'to', step:0.8 }); F.lathe('rock', 13.5, 17.0, [[0.7,0.1],[0.75,0.7],[0.55,0.85]], ROCKC[2], { seg:10 });
      F.rod(13.5, 0.85, 17.0, 13.5+1.1, 3.6, 17.0-0.9, 0.05, BRASSC[0], 'metal'); F.ball(13.5+1.1, 3.6, 17.0-0.9, 0.12, BRASSC[2], 'metal');
    } });
})();
