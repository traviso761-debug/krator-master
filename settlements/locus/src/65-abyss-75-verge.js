/* ============================== 16X-V. ABYSS — Lower Verge: the mayor's compound, the guard tower, the toll house, the palisade ==============================
   Lower Verge stands on the abyssal floor by the plunge pool of the Verge cataracts: a Yuni-controlled town in a mix of Yuni and
   eastern-abyssal building, run by a MAYOR ELECTED BY ITS RESIDENTS. These five assets are ADDITIONS to the Eastern Abyssal kit
   (kit 'abyss'), laid out in their own last row ('Lower Verge') so every earlier sheet item keeps its seed. They use only the kit
   API (F, ABYSS.*, LOCUS.*, PAL, FURNISH): a world that bundles the kit (settlements/verge) places them with an explicit y.
     abyss_mayor_compound  70 x 56: walled court, gate on +z; the raised open-sided COUNCIL HALL under a great swoop-and-horn
                           roof (civic, not royal: paint and sails, no gilt), tiered benches inside; the mayor's lime-washed
                           residence (left), the office and records wing (right); a sail-shaded forecourt where petitioners wait.
     abyss_guard_tower     26 x 20: a three-storey square tower (rubble, then salvaged plate) under a tin-mirror cone with a beacon,
                           and the guard's barrack hall attached on its right (+x), both doors on the front (+z) onto a drill yard.
     abyss_toll_house      14 x 10: booth and strongroom under one roof; the toll COUNTER WINDOW is on the +x side (the road),
                           under a sail on masts; the booth door on +z.
     abyss_palisade        ONE modular segment, exactly 6 m along local x (every part inside x = +-3): segments with centres 6 m
                           apart on one line and yaw join face to face. +z = the outside face (the plate), stakes, drums and
                           braces on the inside. 2 variants (stakes and plate; drums and plate).
     abyss_palisade_gate   a road gate 14 m long (x -7..+7: replaces 14 m of palisade, so the next segments' centres are at +-10),
                           a 9 m clear opening between two pylons, 4.2 m clear under the raised stake gate: a camel caravan passes. */
reseed(657501);
(function(){
  var PI=Math.PI, ROW='Lower Verge';
  KIT_ROWS.abyss.push(ROW);
  function plateCol(F){ return F.pick([PAL.abRustA, PAL.abRustB, RUSTC[0], STEELDC[0], RUSTC[3]]); }

  /* =============================================================== THE MAYOR'S COMPOUND */
  ASSET({ key:'abyss_mayor_compound', name:"The Mayor's compound", family:'civic', kit:'abyss', group:ROW, culture:'abyssal-desert', types:['civic','single-family dwelling'],
    wealth:[0.6,0.9], w:70, d:56, h:27, variants:1, sim:{ activity:'GOVERN', capacity:220, focus:[0,1.6,-11] },
    build:function(F){ var P=1.6, WH=7.0, teal=PAL.abBrightTeal, yel=PAL.abBrightYellow, red=PAL.abSailRed, salt=PAL.abSalt, wc=F.pick(PASTELC), WALLH=4.2;
      /* the court: salt paving inside the wall */
      F.box(0,0,-0.5, 67,0.08,51, 0, salt, 'plaster');
      /* the court wall: rubble below, lime-wash above, a painted teal coping; the gate gap x -5..5 on +z */
      function wseg(x0,z0,x1,z1){ var L=Math.hypot(x1-x0,z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2, yaw=Math.atan2(x1-x0,z1-z0)+PI/2;
        F.box(mx,0,mz, L,1.4,1.0, yaw, PAL.abRubble, 'rubble'); F.box(mx,1.4,mz, L,WALLH-1.4,0.8, yaw, wc, 'plaster'); F.box(mx,WALLH,mz, L+0.2,0.3,1.0, yaw, teal, 'relief'); }
      wseg(-34,-26.5, 34,-26.5); wseg(-34,-26.5,-34,25.5); wseg(34,-26.5,34,25.5); wseg(-34,25.5,-7.8,25.5); wseg(7.8,25.5,34,25.5);
      /* the gate: two painted pylons under a small swoop roof (painted tips, no gilt), the leaves swung in */
      [-1,1].forEach(function(s){ var x=s*6.4; F.box(x,0,25.5, 3.0,1.8,3.2, 0, PAL.abRubble, 'rubble'); F.box(x,1.8,25.5, 2.8,5.4,3.0, 0, wc, 'plaster');
        F.box(x,4.6,25.5, 2.9,0.25,3.1, 0, yel, 'relief'); F.box(x,7.2,25.5, 3.0,0.3,3.2, 0, teal, 'relief');
        F.box(s*4.75,0,21.5, 0.15,4.4,5.0, 0, teal, 'plank'); F.box(s*4.75,1.8,21.5, 0.2,0.2,5.0, 0, yel, 'plank'); });
      F.box(0,5.6,25.5, 10.0,1.6,2.6, 0, yel, 'plaster'); F.box(0,5.55,25.5, 10.1,0.25,2.7, 0, red, 'relief');
      ABYSS.mural(F, 0,6.0,26.8, 0,1, 6.0,1.0);
      ABYSS.swoopRoof(F, 0,25.5, 15.6,3.0, 4.0, { y0:7.5, horn:2.4, over:0.8, col:THATCHC[1], tip:yel, gable:teal });
      ABYSS.lantern(F, -3.8,5.0,27.0, true); ABYSS.lantern(F, 3.8,5.0,27.0, true);

      /* ---- the COUNCIL HALL: a painted rubble plinth, open sides between painted posts, the great swoop-and-horn roof */
      var hz=-11;
      F.box(0,0,hz, 32,P,24, 0, PAL.abRubble, 'rubble');
      [[0.45,teal],[1.05,yel]].forEach(function(b){ F.box(0,b[0],hz, 32.12,0.2,24.12, 0, b[1], 'relief'); });
      F.box(0,P-0.04,hz, 31.6,0.08,23.6, 0, shade(F.pick(PLANKC),0.05), 'plank');
      for(var i=0;i<=8;i++){ var px=-15+30*i/8; [0,-22].forEach(function(pz){ F.cyl(px,P,pz, 0.4,WH, 0, teal, 'plaster'); F.cyl(px,P+WH-0.55,pz, 0.52,0.4, 0, yel, 'plaster'); F.cyl(px,P,pz, 0.5,0.35, 0, red, 'plaster'); }); }
      for(var k=1;k<6;k++){ var pz2=-22+22*k/6; [-15,15].forEach(function(px2){ F.cyl(px2,P,pz2, 0.4,WH, 0, teal, 'plaster'); F.cyl(px2,P+WH-0.55,pz2, 0.52,0.4, 0, yel, 'plaster'); F.cyl(px2,P,pz2, 0.5,0.35, 0, red, 'plaster'); }); }
      /* the eave beams (painted red) round the post heads */
      F.box(0,P+WH-0.15,0, 30.8,0.5,0.6, 0, red, 'relief'); F.box(0,P+WH-0.15,-22, 30.8,0.5,0.6, 0, red, 'relief');
      F.box(-15,P+WH-0.15,hz, 0.6,0.5,22.6, 0, red, 'relief'); F.box(15,P+WH-0.15,hz, 0.6,0.5,22.6, 0, red, 'relief');
      /* the back wall behind the tiers: a painted civic mural (the town's emblem), 5 m high */
      F.box(0,P,-21.95, 29.2,5.0,0.3, 0, wc, 'plaster'); ABYSS.mural(F, 0,P+1.6,-21.8, 0,1, 16,3.2);
      /* tiered benches on three sides (built in: three steps of 0.42 x 0.9), aisles at the back corners */
      var pk=F.pick(PLANKC);
      for(var t=0;t<3;t++){ var dz=0.9*(3-t), hh=0.42*(t+1);
        F.box(0,P,-21.6+dz/2, 23.8,hh,dz, 0, t%2?shade(pk,-0.08):pk, 'plank');
        [-1,1].forEach(function(s){ F.box(s*(14.6-dz/2),P,-11.45, dz,hh,14.9, 0, t%2?shade(pk,-0.08):pk, 'plank'); }); }
      F.box(0,P+0.42-0.06,-18.88, 23.8,0.08,0.1, 0, teal, 'relief'); [-1,1].forEach(function(s){ F.box(s*11.92,P+0.42-0.06,-11.45, 0.1,0.08,14.9, 0, teal, 'relief'); });
      /* the roof: the largest swoop roof in Lower Verge, painted gables, painted horn tips (no gilt, no carved spines) */
      ABYSS.swoopRoof(F, 0,hz, 30,22, 10, { y0:P+WH+0.1, horn:5, over:2.2, eaveLift:1.6, saddle:2.4, col:THATCHC[2], tip:yel, gable:0xffffff, gableFam:'paintcol' });
      /* the front stair, 10 m wide, and the council's table (an open room: the interiors furnish it when they run) */
      LOCUS.stair(F, 0, 1+P*1.15, 0,-1, P, 10);
      ABYSS.furn(F, 'abyss_table_stools', 0,-11, 0, { ly:P, variant:1, setting:'room' });
      [-1,1].forEach(function(s){ ABYSS.furn(F, 'abyss_brazier', s*6.6,2.4, 0, { variant:1 }); });
      [-16,-6].forEach(function(z){ F.box(0,P+WH-0.15,z, 30.4,0.4,0.4, 0, red, 'relief'); [-10,0,10].forEach(function(x){ ABYSS.lantern(F, x,P+WH-1.0,z, true); }); });

      /* ---- the MAYOR'S RESIDENCE (left): a pastel lime-washed house, two storeys on a rubble plinth, a sail over the roof terrace */
      var rx=-26, rz=-19, rc=F.pick(PASTELC), rdeep=shade(rc,-0.3);
      F.box(rx,0,rz, 12.4,0.6,12.4, 0, PAL.abRubble, 'rubble');
      F.box(rx,0.6,rz, 12,6.6,12, 0, rc, 'plaster');
      F.box(rx,3.75,rz, 12.12,0.2,12.12, 0, rdeep, 'relief'); F.box(rx,7.0,rz, 12.2,0.25,12.2, 0, rdeep, 'relief');
      LOCUS.parapet(F, rx,7.2,rz, 12,12, 0.25,0.8, rc, null);
      F.door(rx, rz+6.05, 0,1, 1.3, 2.4, teal, 0.6); ABYSS.trim(F, rx,0.6,rz+6.06, 0,1, 1.3,2.4, true);
      F.box(rx,0,rz+6.9, 2.6,0.3,1.4, 0, PAL.abRubble, 'rubble'); F.box(rx,0.3,rz+6.55, 2.6,0.3,0.7, 0, PAL.abRubble, 'rubble');
      [-3.5,3.5].forEach(function(o){ F.window(rx+o,2.3,rz+6.0, 0,1, 1.1,1.3); F.window(rx+o,5.5,rz+6.0, 0,1, 1.1,1.3); });
      LOCUS.lattice(F, rx,5.4,rz+6.02, 0,1, 1.8,2.0); ABYSS.balcony(F, rx,4.15,rz+6.0, 0,1, 3.0,1.0);
      [-1,1].forEach(function(s){ [-3,3].forEach(function(o){ F.window(rx+s*6.0,2.3,rz+o, s,0, 1.0,1.2); F.window(rx+s*6.0,5.5,rz+o, s,0, 1.0,1.2); }); });
      ABYSS.mural(F, rx-6.0,4.6,rz, -1,0, 3.0,1.4);
      var RS=[[rx-5.4,7.2,rz-5.4,3.4],[rx+5.4,7.2,rz-5.4,2.8],[rx+5.4,7.2,rz+5.4,3.4],[rx-5.4,7.2,rz+5.4,2.8]];
      RS.forEach(function(m){ F.cyl(m[0],m[1],m[2], 0.1,m[3], 0, F.pick(TIMBERC), 'timber'); });
      ABYSS.sail(F, RS.map(function(m){ return [m[0],m[1]+m[3],m[2]]; }), PAL.abSailOrange, { swoop:0.7, band:PAL.abSailOrange, bandW:0.5 });
      ABYSS.lantern(F, rx+1.6,3.3,rz+6.45, true);
      [-3.2,3.2].forEach(function(o){ ABYSS.furn(F, 'abyss_planter', rx+o,rz+7.2, 0, { variant:1 }); });

      /* ---- the OFFICE AND RECORDS WING (right): one tall storey, a striped canvas veranda, the records room tin-clad at the back */
      var ox=26, oz=-18, oc=F.pick(PASTELC);
      F.box(ox,0,oz, 13.4,0.6,14.4, 0, PAL.abRubble, 'rubble');
      F.box(ox,0.6,oz, 13,4.4,14, 0, oc, 'plaster'); F.box(ox,4.8,oz, 13.2,0.25,14.2, 0, shade(oc,-0.3), 'relief');
      LOCUS.parapet(F, ox,5.0,oz, 13,14, 0.25,0.7, oc, null);
      ABYSS.tinClad(F, { box:[ox,0.6,oz,13,4.4,14], faces:'b' });
      F.door(ox, oz+7.05, 0,1, 1.4, 2.5, yel, 0.6);
      F.box(ox,0,oz+7.7, 2.8,0.3,1.0, 0, PAL.abRubble, 'rubble');
      [-4.5,-2.4,2.4,4.5].forEach(function(o){ F.window(ox+o,2.6,oz+7.0, 0,1, 1.1,1.4); });
      [-4,0,4].forEach(function(o){ F.window(ox+6.5,2.6,oz+o, 1,0, 1.0,1.3); F.window(ox-6.5,2.6,oz+o, -1,0, 1.0,1.3); });
      ABYSS.sign(F, ox,4.3,oz+7.12, 0,1, 1.6,0.8, 'book');
      LOCUS.stripes(F, [ox-6.2,3.9,oz+7.0],[ox+6.2,3.9,oz+7.0],[ox+6.2,3.1,oz+9.8],[ox-6.2,3.1,oz+9.8], 8, teal, CANVASC[0], { sag:0.15 });
      [-6,-2,2,6].forEach(function(o){ LOCUS.pole(F, ox+o,oz+9.75, 3.1, 0.08); });
      ABYSS.lantern(F, ox-1.6,3.2,oz+7.5, true);
      ABYSS.furn(F, 'abyss_bench', ox+4.0,oz+8.6, PI, { variant:1 });

      /* ---- the FORECOURT: three sails on masts over the petitioners' benches, lantern posts along the path */
      var MX=[-15,-5,5,15], MZ=[6,18];
      function mh(i,j){ return (i+j)%2 ? 5.6 : 6.5; }
      MX.forEach(function(x,i){ MZ.forEach(function(z,j){ ABYSS.mast(F, x,z, mh(i,j), { r:0.16, finial:yel }); }); });
      for(var q=0;q<3;q++){ var x0=MX[q], x1=MX[q+1];
        ABYSS.sail(F, [[x0,mh(q,0),6],[x1,mh(q+1,0),6],[x1,mh(q+1,1),18],[x0,mh(q,1),18]], q===1?PAL.abSailOrange:teal, { swoop:1.1, band:q===1?PAL.abSailOrange:yel, bandW:0.8 }); }
      [-1,1].forEach(function(s){ [9.5,12.5,15.5].forEach(function(z){ [7.5,12.5].forEach(function(x){ ABYSS.furn(F, 'abyss_bench', s*x,z, PI, { variant:(x>10?1:0) }); }); }); });
      [5,11,17,23].forEach(function(z){ [-1,1].forEach(function(s){ ABYSS.furn(F, 'abyss_lantern_post', s*3.6,z, s<0?0:PI, { variant:1 }); }); });
      ABYSS.mast(F, -24,22, 10, { flag:teal, finial:yel, guys:3, guyR:3 }); ABYSS.mast(F, 24,22, 10, { flag:yel, finial:yel, guys:3, guyR:3 });
      ABYSS.furn(F, 'abyss_water_butt', -18.5,2.5, 0); ABYSS.furn(F, 'abyss_water_butt', 18.5,2.5, 0);
    } });

  /* =============================================================== THE GUARD TOWER AND BARRACK */
  ASSET({ key:'abyss_guard_tower', name:'Guard tower and barrack', family:'civic', kit:'abyss', group:ROW, culture:'abyssal-desert', types:['military'],
    wealth:[0.4,0.8], w:26, d:20, h:21, variants:1, sim:{ activity:'GARRISON', capacity:30, focus:[-7.5,10.9,-3] },
    build:function(F){ var TX=-7.5, TZ=-3, TS=9, S1=0.4, ST=3.4, TOP=S1+3*ST, lac=PAL.abLacquer, yel=PAL.abBrightYellow, pc=plateCol(F);
      /* the yard */
      F.box(0,0,5.6, 26,0.06,8.6, 0, PAL.abSalt, 'plaster');
      /* ---- the tower: a rubble ground storey, two storeys of salvaged plate, lacquer bands at the floors */
      F.box(TX,0,TZ, TS+0.4,S1,TS+0.4, 0, PAL.abRubble, 'rubble');
      F.box(TX,S1,TZ, TS,ST,TS, 0, PAL.abRubble, 'rubble');
      F.box(TX,S1+ST,TZ, TS,2*ST,TS, 0, pc, 'rust');
      [S1+ST, S1+2*ST].forEach(function(y){ F.box(TX,y-0.11,TZ, TS+0.12,0.22,TS+0.12, 0, lac, 'relief'); });
      for(var i=1;i<6;i++){ var o=-TS/2+TS*i/6;                                     /* plate seams on the four faces */
        F.box(TX+o,S1+ST,TZ+TS/2+0.02, 0.1,2*ST,0.05, 0, STEELDC[1], 'rust'); F.box(TX+o,S1+ST,TZ-TS/2-0.02, 0.1,2*ST,0.05, 0, STEELDC[1], 'rust');
        F.box(TX-TS/2-0.02,S1+ST,TZ+o, 0.05,2*ST,0.1, 0, STEELDC[1], 'rust'); }
      /* the roof slab, merlons and the tin-mirror cone with an arch onto the roof walk; the beacon on the cone's head */
      F.box(TX,TOP,TZ, TS+0.6,0.3,TS+0.6, 0, shade(pc,-0.15), 'rust');
      [-1,1].forEach(function(s){ for(var m=0;m<4;m++){ var u=-3.6+m*2.4;
        F.box(TX+u,TOP+0.3,TZ+s*(TS/2+0.05), 1.1,1.0,0.5, 0, pc, 'rust'); F.box(TX+s*(TS/2+0.05),TOP+0.3,TZ+u, 0.5,1.0,1.1, 0, pc, 'rust'); } });
      var cn=ABYSS.coneShell(F, TX,TZ, 3.4, 6.2, { y0:TOP+0.3, fam:'tinmirror', col:PAL.abTin, k:1.15, arch:{ w:1.6, h:2.2 }, archCol:lac, ring:lac, thick:0.25, finial:false });
      F.cyl(TX,cn.top-0.6,TZ, 0.1,1.9, 0, STEELDC[0], 'rust');
      F.cyl(TX,cn.top+1.25,TZ, 0.5,0.12, 0, STEELDC[0], 'rust');
      for(var b=0;b<8;b++){ var a=b/8*TAU; F.rod(TX+Math.cos(a)*0.5,cn.top+1.3,TZ+Math.sin(a)*0.5, TX+Math.cos(a)*0.62,cn.top+1.9,TZ+Math.sin(a)*0.62, 0.025, STEELDC[0], 'rust'); }
      LOCUS.flame(F, TX,cn.top+1.35,TZ, 0.42, 2.4);
      /* windows: small on the rubble storey, larger on the plate storeys; slits on the side the barrack roof meets */
      F.window(TX-2.6,2.5,TZ+TS/2, 0,1, 0.8,1.0); F.window(TX+2.6,2.5,TZ+TS/2, 0,1, 0.8,1.0);
      [S1+ST+1.8, S1+2*ST+1.8].forEach(function(y){ [-2.4,0,2.4].forEach(function(o){ F.window(TX+o,y,TZ+TS/2, 0,1, 0.8,1.1); F.window(TX+o,y,TZ-TS/2, 0,-1, 0.8,1.1); F.window(TX-TS/2,y,TZ+o, -1,0, 0.8,1.1); }); });
      F.window(TX-2.6,2.5,TZ-TS/2, 0,-1, 0.8,1.0); F.window(TX-TS/2,2.5,TZ, -1,0, 0.8,1.0);
      [-2.4,0,2.4].forEach(function(o){ F.box(TX+TS/2+0.02,TOP-1.6,TZ+o, 0.12,1.0,0.25, 0, VOIDC[0], 'dark'); });
      F.door(TX, TZ+TS/2+0.05, 0,1, 1.2, 2.3, PLANKC[3], S1); ABYSS.trim(F, TX,S1,TZ+TS/2+0.06, 0,1, 1.2,2.3, true);
      F.box(TX,0,TZ+TS/2+0.55, 2.0,0.22,1.1, 0, PAL.abRubble, 'rubble');
      ABYSS.lantern(F, TX+1.3,3.0,TZ+TS/2+0.45, true);
      /* ---- the barrack hall on the tower's right: a rubble footing, pastel walls, a swoop roof with its ridge along z (horns to the yard and the back) */
      var BX=3.5, BZ=-2.75, BW=13, BD=8.5, BF=0.8, bc=F.pick(PASTELC);
      F.box(BX,0,BZ, BW,BF,BD, 0, PAL.abRubble, 'rubble');
      F.box(BX,BF,BZ, BW-0.1,3.0,BD-0.1, 0, bc, 'plaster'); F.box(BX,BF+2.9,BZ, BW,0.2,BD, 0, shade(bc,-0.3), 'relief');
      ABYSS.swoopRoof(F, BX,BZ, BD,BW, 5.0, { y0:BF+3.1, yaw:PI/2, horn:2.0, over:0.9, col:THATCHC[0], tip:yel, gable:shade(bc,-0.1) });
      F.door(BX+0.5, BZ+BD/2+0.05, 0,1, 1.2, 2.2, PLANKC[3], BF);
      F.box(BX+0.5,0,BZ+BD/2+0.5, 2.0,0.4,1.0, 0, PAL.abRubble, 'rubble');
      [-3.6,4.4].forEach(function(o){ LOCUS.lattice(F, BX+o,BF+1.7,BZ+BD/2+0.04, 0,1, 1.4,1.1); });
      [-2.2,2.2].forEach(function(o){ LOCUS.lattice(F, BX+BW/2+0.04,BF+1.7,BZ+o, 1,0, 1.4,1.1); LOCUS.lattice(F, BX+o*2,BF+1.7,BZ-BD/2-0.04, 0,-1, 1.4,1.1); });
      ABYSS.lantern(F, BX+2.0,3.2,BZ+BD/2+0.45, true);
      /* ---- the drill yard: racks, an armour stand, a fire, the guard's flag */
      ABYSS.furn(F, 'abyss_rack_spears', 6.5,7.8, PI); ABYSS.furn(F, 'abyss_rack_spears', 9.5,7.8, PI);
      ABYSS.furn(F, 'abyss_armor_stand', 11.5,4.2, -PI/2, { variant:1 });
      ABYSS.furn(F, 'abyss_brazier', 0.5,6.5, 0, { variant:1 });
      ABYSS.furn(F, 'abyss_bench', -3.5,6.5, PI/2, { variant:0 });
      ABYSS.furn(F, 'abyss_water_butt', 11.6,0.4, 0);
      ABYSS.mast(F, -12,8.8, 9, { flag:PAL.abSailRed, finial:yel, guys:2, guyR:1.0 });
    } });

  /* =============================================================== THE TOLL HOUSE */
  ASSET({ key:'abyss_toll_house', name:'Toll house at the trailhead', family:'civic', kit:'abyss', group:ROW, culture:'abyssal-desert', types:['civic'],
    wealth:[0.4,0.7], w:14, d:10, h:8, variants:1, sim:{ activity:'GOVERN', capacity:6, focus:[3.4,0.4,-1] },
    build:function(F){ var cx=-1, cz=-1, W=7, D=5, Y=0.4, WH=2.8, teal=PAL.abBrightTeal, yel=PAL.abBrightYellow, bc=F.pick(PASTELC);
      F.box(cx,0,cz, W+0.3,Y,D+0.3, 0, PAL.abRubble, 'rubble');
      /* the booth (x -1..2.5, lime-wash) and the strongroom (x -4.5..-1, rubble under tin plate, iron straps) under one roof */
      F.box(0.75,Y,cz, 3.5,WH,D, 0, bc, 'plaster');
      F.box(-2.75,Y,cz, 3.5,WH,D, 0, PAL.abRubble, 'rubble'); ABYSS.tinClad(F, { box:[-2.75,Y,cz,3.5,WH,D], faces:'fbl' });
      [-3.9,-1.6].forEach(function(x){ F.box(x,Y,cz+D/2+0.07, 0.14,WH,0.06, 0, STEELDC[0], 'rust'); F.box(x,Y,cz-D/2-0.07, 0.14,WH,0.06, 0, STEELDC[0], 'rust'); });
      F.box(-4.5-0.06,Y+1.6,cz, 0.1,0.5,0.9, 0, VOIDC[0], 'dark'); [-0.3,0,0.3].forEach(function(o){ F.rod(-4.6,Y+1.6,cz+o, -4.6,Y+2.1,cz+o, 0.025, STEELDC[1], 'rust'); });
      F.box(cx,Y+WH,cz, W+0.4,0.25,D+0.4, 0, shade(bc,-0.3), 'relief');
      LOCUS.parapet(F, cx,Y+WH+0.25,cz, W+0.4,D+0.4, 0.2,0.5, bc, null);
      /* the door on +z; the toll COUNTER WINDOW on +x (the road): a wide window, a plank counter shelf, a canvas flap above */
      F.door(1.6, cz+D/2+0.05, 0,1, 1.0, 2.2, teal, Y); F.box(1.6,0,cz+D/2+0.45, 1.6,0.2,0.9, 0, PAL.abRubble, 'rubble');
      F.window(-0.1,1.7,cz+D/2, 0,1, 0.8,0.9);
      F.window(2.5,1.75,cz, 1,0, 2.4,1.0); F.box(2.95,1.1,cz, 0.9,0.12,2.8, 0, F.pick(PLANKC), 'plank');
      [-1.2,1.2].forEach(function(o){ F.rod(2.55,0.6,cz+o, 3.3,1.08,cz+o, 0.04, F.pick(TIMBERC), 'timber'); });
      LOCUS.canopy(F, [[2.55,2.75,cz-1.5],[2.55,2.75,cz+1.5],[3.5,2.45,cz+1.5],[3.5,2.45,cz-1.5]], yel, { sag:0.04 });
      ABYSS.sign(F, 2.78,3.4,cz, 1,0, 1.4,0.6, 'book');
      /* the sail over the queue on the road side, masts with lit lanterns */
      var M=[[3.6,-4.4,3.8],[6.6,-4.4,3.4],[6.6,4.4,3.8],[3.6,4.4,3.4]];
      M.forEach(function(m){ ABYSS.mast(F, m[0],m[1], m[2], { r:0.12, lantern:m[0]>5?'lit':null }); });
      ABYSS.sail(F, M.map(function(m){ return [m[0],m[2],m[1]]; }), PAL.abSailOrange, { swoop:0.5, band:PAL.abSailOrange, bandW:0.5 });
      /* the toll boom, raised: a pivot post, a drum counterweight, a striped pole pointing up */
      F.cyl(6.4,0,4.7, 0.14,1.3, 0, F.pick(TIMBERC), 'timber'); F.box(6.62,0.95,4.7, 0.45,0.45,0.45, 0, ABYSS.rust(F), 'rust');
      for(var s=0;s<4;s++){ var t0=s/4, t1=(s+1)/4; F.rod(6.4-0.8*t0,1.3+4.8*t0,4.7, 6.4-0.8*t1,1.3+4.8*t1,4.7, 0.07, s%2?PAL.abSalt:PAL.abSailRed, 'plaster'); }
      ABYSS.furn(F, 'abyss_bench', 5.0,-2.6, -PI/2, { variant:0 });
      ABYSS.furn(F, 'abyss_crates', -5.6,3.3, 0, { variant:0 });
      ABYSS.lantern(F, 0.6,2.6,cz+D/2+0.45, true);
    } });

  /* =============================================================== THE PALISADE (one 6 m segment) */
  var PL=6;
  ABYSS.PALISADE = { L:PL, gateW:14, gateClear:9, gateClearH:4.2 };
  ASSET({ key:'abyss_palisade', name:'Palisade segment (6 m)', family:'civic', kit:'abyss', group:ROW, culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.2,0.6], w:PL, d:3, h:4.2, variants:2, variantNames:['stakes and plate','drums and plate'], sim:{ activity:'GARRISON', capacity:1 },
    build:function(F){ var tc=F.pick(TIMBERC);
      F.box(0,0,0, PL,0.3,1.0, 0, PAL.abRubble, 'rubble');                                            /* the footing: x -3..3 */
      if(F.variant===0){
        for(var i=0;i<=10;i++){ var x=-2.75+i*0.55, h=F.rr(3.2,3.7); F.cyl(x,0.2,0, 0.11,h, 0, F.pick(TIMBERC), 'timber'); F.cone(x,0.2+h,0, 0.11,0.42, 0, shade(tc,-0.15), 'timber'); }
        [-2,0,2].forEach(function(x){ F.box(x,0.3,0.17, 2.0,F.rr(2.2,2.6),0.06, 0, plateCol(F), 'rust'); });
        [-1,1].forEach(function(x){ F.box(x,0.3,0.21, 0.1,2.3,0.04, 0, STEELDC[1], 'rust'); });
        [1.0,2.6].forEach(function(y){ F.box(0,y,-0.17, PL,0.14,0.1, 0, tc, 'timber'); });
        [-1.1,1.1].forEach(function(x){ var c=ABYSS.rust(F); F.cyl(x,0.3,-0.62, 0.3,0.88, 0, c, 'rust'); F.cyl(x,1.15,-0.62, 0.31,0.05, 0, shade(c,-0.25), 'rust'); });
        [-2.5,0,2.5].forEach(function(x){ F.rod(x,2.2,-0.15, x,0.05,-1.3, 0.06, tc, 'timber'); });
      } else {
        for(var k=0;k<6;k++){ var dx=-2.5+k; [0,1].forEach(function(r){ var c=ABYSS.rust(F); F.cyl(dx,0.3+r*0.9,-0.15, 0.42,0.88, 0, c, 'rust'); F.cyl(dx,1.16+r*0.9,-0.15, 0.43,0.04, 0, shade(c,-0.25), 'rust'); }); }
        [-2.85,-0.95,0.95,2.85].forEach(function(x){ F.cyl(x,0.3,0.42, 0.1,3.6, 0, tc, 'timber'); });
        F.box(0,2.1,0.4, PL,1.5,0.06, 0, plateCol(F), 'rust'); F.box(0,2.0,0.4, PL,0.12,0.12, 0, tc, 'timber'); F.box(0,3.55,0.4, PL,0.12,0.12, 0, tc, 'timber');
        for(var j=0;j<12;j++){ var px=-2.75+j*0.5; F.cyl(px,3.6,0.4, 0.05,0.35, 0, tc, 'timber'); F.cone(px,3.95,0.4, 0.05,0.2, 0, shade(tc,-0.15), 'timber'); }
      } } });

  /* =============================================================== THE PALISADE ROAD GATE */
  ASSET({ key:'abyss_palisade_gate', name:'Palisade road gate', family:'civic', kit:'abyss', group:ROW, culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.3,0.7], w:14, d:4, h:7.8, variants:1, sim:{ activity:'GARRISON', capacity:4 },
    build:function(F){ var teal=PAL.abBrightTeal, yel=PAL.abBrightYellow, tc=F.pick(TIMBERC);
      F.box(0,0,0, 9.0,0.06,3.0, 0, PAL.abSalt, 'plaster');
      /* two pylons: rubble base, salvaged plate, a painted band, a tin-mirror cap; the clear opening is x -4.5..4.5 */
      [-1,1].forEach(function(s){ var x=s*5.6;
        F.box(x,0,0, 2.3,2.0,3.1, 0, PAL.abRubble, 'rubble'); F.box(x,2.0,0, 2.2,4.4,3.0, 0, plateCol(F), 'rust');
        F.box(x,6.3,0, 2.3,0.3,3.1, 0, teal, 'relief'); F.pyr(x,6.6,0, 2.3,1.1,3.1, 0, PAL.abTin, 'tinmirror');
        F.box(x,2.0,1.53, 0.12,4.4,0.05, 0, STEELDC[1], 'rust');
        F.rod(x-s*0.6,4.9,1.5, x-s*0.6,4.9,1.95, 0.04, STEELDC[0], 'rust'); ABYSS.lantern(F, x-s*0.6,4.6,1.92, true); });
      /* the lintel and its painted board */
      F.box(0,6.2,0, 9.0,0.6,0.7, 0, tc, 'timber'); F.box(0,6.4,0.4, 4.2,0.9,0.08, 0, yel, 'plank'); F.box(0,6.35,0.38, 4.4,1.0,0.05, 0, teal, 'timber');
      /* the stake gate, raised under the lintel on chains: 4.2 m clear beneath it */
      for(var i=0;i<18;i++){ var x=-4.25+i*0.5; F.cyl(x,4.2,0, 0.08,1.9, 0, F.pick(TIMBERC), 'timber'); }
      [4.6,5.7].forEach(function(y){ F.box(0,y,0.1, 8.8,0.14,0.1, 0, tc, 'timber'); });
      [-3.5,3.5].forEach(function(x){ F.rod(x,5.8,0.1, x,6.2,0.1, 0.03, STEELDC[0], 'rust'); });
    } });
})();
