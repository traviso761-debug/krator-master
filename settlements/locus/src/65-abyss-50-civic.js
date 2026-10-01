/* ============================== 16X-C. ABYSS — hospitality and civic ==============================
   The inn (stacked rooms round a deck court under a sail), the tavern (a sail-roofed platform on piles), the
   caravanserai (a walled square court with rooms on all four sides and a swoop-roofed gate), the library (a great
   cone shell over terraced reading floors), the school (cone-roofed classrooms round a shaded court) and the
   amphitheatre (a horseshoe bowl of rubble tiers and timber benches round a stage under a sail).
   Lighting: the inn, tavern and caravanserai burn LIT oil lanterns (public houses, open at night); the library,
   school and amphitheatre are civic and lit warm.                                                           */
reseed(655001);
(function(){
  var PI=Math.PI;

  /* =============================================================== INN */
  ASSET({ key:'abyss_inn', name:'Courtyard inn', family:'trade', kit:'abyss', group:'Hospitality', culture:'abyssal-desert', types:['tavern/inn','multi-family dwelling'],
    wealth:[0.3,0.7], w:24, d:23, h:15, variants:2, variantNames:['stacked containers round a deck court','galleried pastel wings'], sim:{ activity:'REST', capacity:40 },
    build:function(F){ var v=F.variant, H=1.0, L=2.7;
      ABYSS.platform(F, -11.5,11.5, -10.5,10, H, { span:3.0 });
      /* the court stairs. Ground -> first gallery: a flight across the court onto the LEFT gallery's inner edge xi at z zs
         (the rail is broken for it). First -> second gallery: a dog-leg off the RIGHT gallery's open front end (x xi..xo,
         z ze) — half a storey out over the deck, a landing, half a storey back onto the second gallery. */
      function innStairs(xi, xo, zs, ze){ var run=L*1.15;
        ABYSS.flight(F, -xi+run,zs, -1,0, H,H+L, 1.0);
        var wm=(xo-xi)/2, y1=H+L, ym=H+1.5*L, y2=H+2*L, zl=ze+run/2, pk=F.pick(PLANKC);
        ABYSS.flight(F, xi+wm/2,ze, 0,1, y1,ym, wm-0.05); ABYSS.flight(F, xo-wm/2,zl, 0,-1, ym,y2, wm-0.05);
        F.box((xi+xo)/2,ym-0.12,zl+0.45, xo-xi,0.12,0.9, 0, pk, 'plank'); LOCUS.rail(F, xi,zl+0.9, xo,zl+0.9, ym, null, 1.0);
        [xi+0.1, xo-0.1].forEach(function(x){ F.cyl(x,H,zl+0.8, 0.08,ym-H, 0, F.pick(TIMBERC), 'timber'); }); }
      if(v===0){ /* three wings of containers, three storeys, galleries on the court side */
        for(var l=0;l<3;l++){ var y=H+l*L, sh=l===2?1.4:0;
          ABYSS.vessel(F, 'container', -8.6,y,-1.2+sh, { len:12.2, yaw:PI/2, col:ABYSS.cont(F), win:[[-3.5,1.5],[3.5,1.5]], door:'side', doorAt:0 });
          ABYSS.vessel(F, 'container', 8.6,y,-1.2-sh, { len:12.2, yaw:-PI/2, col:ABYSS.cont(F), win:[[-3.5,1.5],[3.5,1.5]], door:'side', doorAt:0 });
          ABYSS.vessel(F, 'container', 0,y,-8.6, { len:12.2, col:ABYSS.cont(F), win:[[-3.5,1.5],[3.5,1.5]], door:'side', doorAt:0 });
          if(l>0){ var pk=F.pick(PLANKC);   /* galleries */
            F.box(-6.65,y-0.12,-1.2, 1.5,0.12,12.2, 0, pk, 'plank'); F.box(6.65,y-0.12,-1.2, 1.5,0.12,12.2, 0, pk, 'plank'); F.box(0,y-0.12,-6.65, 11.8,0.12,1.5, 0, pk, 'plank');
            LOCUS.rail(F, -5.9,-7.3, -5.9,l===1?3.0:4.9, y, null, 1.0); LOCUS.rail(F, 5.9,-7.3, 5.9,4.9, y, null, 1.0); LOCUS.rail(F, -5.9,-5.9, 5.9,-5.9, y, null, 1.0);
            [-7.3,-1.2,4.9].forEach(function(z){ F.cyl(-5.95,H,z, 0.09,y-H, 0, F.pick(TIMBERC), 'timber'); F.cyl(5.95,H,z, 0.09,y-H, 0, F.pick(TIMBERC), 'timber'); }); } }
        innStairs(5.9, 7.4, 3.6, 4.9);
        ABYSS.antenna(F, -8.6,H+3*L,-5.0, 'dish', { r:0.8 }); ABYSS.antenna(F, 8.6,H+3*L,2.0, 'mast', { h:3 }); ABYSS.billboard(F, 0,H+3*L-0.2,-9.9, 0,-1, 5,2); }
      else { /* galleried pastel wings on a rubble plinth course, flat roofs, timber galleries */
        var c=F.pick(PASTELC), band=shade(c,-0.3), D=4.2;
        [[-9.2,-1.0,D,14,PI/2],[9.2,-1.0,D,14,-PI/2],[0,-8.3,14.2,D,0]].forEach(function(wg){ F.box(wg[0],H,wg[1], wg[2],3*L,wg[3], 0, c, 'plaster'); F.box(wg[0],H,wg[1], wg[2]+0.06,0.5,wg[3]+0.06, 0, band, 'plaster');
          F.box(wg[0],H+3*L,wg[1], wg[2]+0.3,0.22,wg[3]+0.3, 0, band, 'relief'); LOCUS.parapet(F, wg[0],H+3*L+0.22,wg[1], wg[2],wg[3], 0.2,0.6, c, band);
          var nx=Math.sin(wg[4]), nz=Math.cos(wg[4]), fx=wg[0]+nx*(wg[2]/2+0.02), fz=wg[1]+nz*(wg[3]/2+0.02), px=-nz, pz=nx;
          for(var l2=0;l2<3;l2++) for(var k=-1;k<=1;k++){ var y2=H+l2*L, o=k*4.0; F.door(fx+px*o-px*0.8, fz+pz*o-pz*0.8, nx,nz, 0.9, 2.1, PAL.abBrightTeal, y2); LOCUS.lattice(F, fx+px*o+px*0.8, y2+1.7, fz+pz*o+pz*0.8, nx,nz, 1.0,1.0); } });
        for(var l3=1;l3<3;l3++){ var y3=H+l3*L, pk2=F.pick(PLANKC);
          F.box(-6.3,y3-0.12,-1.0, 1.6,0.12,14, 0, pk2, 'plank'); F.box(6.3,y3-0.12,-1.0, 1.6,0.12,14, 0, pk2, 'plank'); F.box(0,y3-0.12,-5.4, 11,0.12,1.6, 0, pk2, 'plank');
          LOCUS.rail(F, -5.5,-4.6, -5.5,l3===1?4.1:6.0, y3, null, 1.0); LOCUS.rail(F, 5.5,-4.6, 5.5,6.0, y3, null, 1.0); LOCUS.rail(F, -5.5,-4.6, 5.5,-4.6, y3, null, 1.0); }
        [-4.6,0.7,6.0].forEach(function(z){ [-5.55,5.55].forEach(function(x){ F.cyl(x,H,z, 0.11,2*L+1.0, 0, F.pick(TIMBERC), 'timber'); }); });
        innStairs(5.5, 7.1, 4.7, 6.0);
        ABYSS.furn(F, 'abyss_well', 0,2.6, 0, { ly:H }); ABYSS.plant(F, 'abyss_creeper', -5.0,-4.4, 0, { ly:H }); ABYSS.plant(F, 'abyss_creeper', 5.0,-4.4, 0, { ly:H }); }
      /* the court: tables, a sail over it on four masts, strung lanterns */
      var top=H+3*L+3.0, C=[[-5.6,top+0.8,-5.6],[5.6,top,-5.6],[5.6,top+0.8,8.9],[-5.6,top,8.9]];
      C.forEach(function(q){ ABYSS.mast(F, q[0],q[2], q[1], { finial:PAL.abGild, r:0.14 }); });
      ABYSS.sail(F, C, v?PAL.abSailOrange:CANVASC[0], { swoop:1.2, band:v?PAL.abSailOrange:PAL.abSailRed, bandW:0.7 });
      ABYSS.furn(F, 'abyss_lantern_string', 0,0.0, 0, { ly:H+L-0.3, variant:1 }); ABYSS.furn(F, 'abyss_lantern_string', 0,2.2, 0, { ly:H+L-0.3, variant:1 });
      ABYSS.furn(F, 'abyss_table_stools', -2.4,v?-1.5:1.5, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_table_stools', 2.4,3.8, 0, { ly:H }); ABYSS.furn(F, 'abyss_table_stools', -2.0,6.8, 0, { ly:H });
      LOCUS.stair(F, 0, 10+H*1.15, 0,-1, H, 3.0); ABYSS.railRect(F, -11.5,11.5,-10.5,10, H, [['f',-1.6,1.6],['b',-12,12]]);
      ABYSS.sign(F, 3.6,H+3.0,10.05, 0,1, 1.6,0.9, 'bed'); F.cyl(3.6,0,10.05, 0.08,H+3.0, 0, F.pick(TIMBERC), 'timber');
      [-6.5,6.5].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,10.6, PI, { variant:1 }); });
    } });

  /* =============================================================== TAVERN */
  ASSET({ key:'abyss_tavern', name:'Sail-platform tavern', family:'trade', kit:'abyss', group:'Hospitality', culture:'abyssal-desert', types:['tavern/inn'],
    wealth:[0.3,0.7], w:22, d:20, h:13, variants:2, variantNames:['one deck under twin sails','two decks under a great peaked sail'], sim:{ activity:'DRINK', capacity:60 },
    build:function(F){ var v=F.variant, H=2.0;
      ABYSS.water(F, 0,-1, 22,16);
      ABYSS.platform(F, -10,10, -8.5,6.5, H, { span:2.8 });
      ABYSS.railRect(F, -10,10,-8.5,6.5, H, [['f',-2.4,2.4]]);
      LOCUS.stair(F, 0, 6.5+H*1.15, 0,-1, H, 4.0);
      /* the bar: a cut tank on the back of the deck, a kitchen drum, barrels */
      ABYSS.furn(F, 'abyss_counter', -4.0,-6.0, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_shelf_jars', -4.0,-8.0, 0, { ly:H });
      ABYSS.vessel(F, 'drum', 5.5,H,-6.6, { r:1.0, len:4.0, col:ABYSS.rust(F), win:[[0,0]], awning:PAL.abSailRed });
      for(var b=0;b<3;b++) LOCUS.drum(F, -8.4+b*0.7, H, -7.8, null, false);
      [[-5.5,-1.8],[-1.5,-2.4],[2.5,-1.8],v?[4.6,0.6]:[6.5,-2.2],[-6.0,2.4],[-2.0,3.0],[2.0,2.6],[6.2,2.8]].forEach(function(p,i){ ABYSS.furn(F, 'abyss_table_stools', p[0],p[1], i*0.7, { ly:H, variant:i%2 }); });
      ABYSS.furn(F, 'abyss_bench', -8.6,0, PI/2, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_bench', 8.6,0, -PI/2, { ly:H, variant:1 });
      if(v===0){ /* twin swooping sails, orange with red bands, on six masts; propeller-lanterns at the ends */
        var M=[[-9.6,9.8,-8.2],[0,8.6,-8.2],[9.6,9.8,-8.2],[9.6,8.6,6.2],[0,9.4,6.2],[-9.6,8.6,6.2]];
        M.forEach(function(m,i){ ABYSS.mast(F, m[0],m[2], m[1], { r:0.15, prop:i===0||i===2, lit:true, finial:i===1||i===4?PAL.abGild:null }); });
        ABYSS.sail(F, [M[0],M[1],M[4],M[5]], PAL.abSailOrange, { swoop:1.4, band:PAL.abSailOrange, bandW:0.8 });
        ABYSS.sail(F, [M[1],M[2],M[3],M[4]], PAL.abSailOrange, { swoop:1.4, band:PAL.abSailOrange, bandW:0.8 });
        [-6,-2,2,6].forEach(function(x){ ABYSS.lantern(F, x, H+4.4, -1.0, true); ABYSS.lantern(F, x, H+4.2, 3.2, x%4===0); }); }
      else { /* a raised upper deck at the back and one great sail peaked over a central mast */
        var H2=H+2.2; ABYSS.platform(F, -10,10, -8.5,-3.5, H2, { span:2.8, brace:false }); ABYSS.railRect(F, -10,10,-8.5,-3.5, H2, [['f',5.4,7.4],['b',-11,11]]);
        ABYSS.flight(F, 6.4,-3.5+(H2-H)*1.15, 0,-1, H,H2, 1.4);                         /* lands on the upper deck's edge, z -3.5 */
        ABYSS.mast(F, 0,-1.0, 13.0, { r:0.22, guys:0, finial:PAL.abGild, prop:true, lit:true });
        var C=[[-10,7.6,-8.4],[10,7.6,-8.4],[10,6.4,6.4],[-10,6.4,6.4]]; C.forEach(function(q){ LOCUS.pole(F, q[0],q[2], q[1], 0.14, null, PAL.abGild); });
        ABYSS.sail(F, C, PAL.abSailOrange, { swoop:1.6, peak:4.6, band:PAL.abSailOrange, bandW:0.9 });
        ABYSS.furn(F, 'abyss_table_stools', -5,-6, 0, { ly:H2, variant:1 }); ABYSS.furn(F, 'abyss_table_stools', 0,-6.4, 0, { ly:H2 });
        [-6,0,6].forEach(function(x){ ABYSS.lantern(F, x, H+4.0, 2.0, true); }); ABYSS.lantern(F, -3, H2+3.2, -5.5, true); }
      [-4.6,4.6].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,9.2, PI, { variant:1 }); });
      ABYSS.sign(F, -3.4,H+3.4,6.6, 0,1, 1.8,1.0, 'cup'); F.cyl(-3.4,0,6.6, 0.1,H+3.4, 0, F.pick(TIMBERC), 'timber');
    } });

  /* =============================================================== CARAVANSERAI */
  ASSET({ key:'abyss_caravanserai', name:'Caravanserai', family:'trade', kit:'abyss', group:'Hospitality', culture:'abyssal-desert', types:['tavern/inn','market/shop'],
    wealth:[0.4,0.8], w:56, d:58, h:17, variants:1, sim:{ activity:'REST', capacity:120 },
    build:function(F){ var S=25, WH=4.2, wc=F.pick(PASTELC), band=PAL.abLacquer, salt=PAL.abSalt;
      /* the court: salt paving, a deck walk round it */
      F.box(0,0,0, 2*S,0.1,2*S, 0, salt, 'plaster');
      /* the perimeter wall: rubble below, lime-wash above, a lacquer band; open at the front gate (x -4..4) */
      function wseg(x0,z0,x1,z1){ var L=Math.hypot(x1-x0,z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2, yaw=Math.atan2(x1-x0,z1-z0)+PI/2;
        F.box(mx,0,mz, L,1.6,1.0, yaw, PAL.abRubble, 'rubble'); F.box(mx,1.6,mz, L,WH-1.6,0.8, yaw, wc, 'plaster'); F.box(mx,WH,mz, L+0.2,0.3,1.0, yaw, band, 'relief'); }
      wseg(-S,-S, S,-S); wseg(-S,-S,-S,S); wseg(S,-S,S,S); wseg(-S,S,-5,S); wseg(5,S,S,S);
      [[-S,-S],[S,-S],[S,S],[-S,S]].forEach(function(c){ ABYSS.vessel(F, 'silo', c[0],0,c[1], { r:2.2, h:6.0, col:PAL.abTin, fam:'tinmirror', capCol:PAL.abGild, port:true, win:[[PI/2,4.2],[-PI/2,4.2]] }); });
      /* the rooms: containers and plank cabins along all four sides, doors onto the court, a shade sail strip in front */
      var D=2.6;
      function side(n, yaw, place){ for(var i=0;i<n;i++){ var t=(i+0.5)/n, p=place(t), kind=i%3===1?'cabin':'container';
          if(kind==='container') ABYSS.vessel(F, 'container', p[0],0.1,p[1], { len:6.1, yaw:yaw, col:ABYSS.cont(F), win:[[1.6,1.5]], door:'side', doorAt:-1.2 });
          else { var ca=Math.cos(yaw), sa=Math.sin(yaw), pk=F.pick(PLANKC); F.box(p[0],0.1,p[1], 6.0,2.8,2.6, yaw, pk, 'plank'); ABYSS.corrRoof(F, p[0],2.9,p[1], 6.4,3.0, 0.3, ABYSS.rust(F), yaw+PI);
            F.door(p[0]+sa*1.32, p[1]+ca*1.32, sa,ca, 1.0,2.1, PAL.abBrightTeal, 0.1); } } }
      side(6, 0, function(t){ return [mix(-S+5,S-5,t), -S+1.9]; });
      side(6, PI/2, function(t){ return [-S+1.9, mix(S-5,-S+5,t)]; });
      side(6, -PI/2, function(t){ return [S-1.9, mix(-S+5,S-5,t)]; });
      side(2, PI, function(t){ return [mix(-S+5,-7,t), S-1.9]; }); side(2, PI, function(t){ return [mix(7,S-5,t), S-1.9]; });
      /* a canvas shade strip along each inner face, on posts */
      [[-S+4,-S+3.6, S-4,-S+3.6, -S+5.6],[-S+3.6,-S+4,-S+3.6,S-4, -S+5.6],[S-3.6,-S+4,S-3.6,S-4, S-5.6]].forEach(function(r,i){
        var n=6; for(var k=0;k<n;k++){ var t0=k/n, t1=(k+1)/n, ax=mix(r[0],r[2],t0), az=mix(r[1],r[3],t0), bx=mix(r[0],r[2],t1), bz=mix(r[1],r[3],t1);
          var ox = i===0 ? 0 : (i===1 ? 2.2 : -2.2), oz = i===0 ? 2.2 : 0;
          LOCUS.pole(F, ax+ox,az+oz, 2.8, 0.08); if(k===n-1) LOCUS.pole(F, bx+ox,bz+oz, 2.8, 0.08);
          LOCUS.canopy(F, [[ax,3.1,az],[bx,3.1,bz],[bx+ox,2.8,bz+oz],[ax+ox,2.8,az+oz]], k%2?CANVASC[0]:PAL.abSailOrange, { sag:0.18 }); } });
      /* the gate: two towers carrying the tallest swoop-and-horn roof outside the temple */
      [-4.6,4.6].forEach(function(x){ F.box(x,0,S, 3.2,9.0,3.4, 0, wc, 'plaster'); F.box(x,0,S, 3.4,1.6,3.6, 0, PAL.abRubble, 'rubble'); F.box(x,9.0,S, 3.5,0.3,3.7, 0, band, 'relief'); });
      F.box(0,6.2,S, 6.0,1.2,3.4, 0, band, 'plaster');
      ABYSS.swoopRoof(F, 0,S, 12.6,4.6, 6.0, { y0:9.4, horn:3.4, over:1.0 });
      /* the well, the beast yard with shades, benches */
      ABYSS.furn(F, 'abyss_well', 0,-2, 0);
      ABYSS.furn(F, 'abyss_beast_shade', -14,-14, 0); ABYSS.furn(F, 'abyss_beast_shade', -7,-14, 0); F.box(-10.5,0,-10.6, 14,1.1,0.12, 0, F.pick(TIMBERC), 'timber');
      ABYSS.furn(F, 'abyss_crates', 14,-15, 0, { variant:1 }); ABYSS.furn(F, 'abyss_crates', 16.5,-14, 0.5, { variant:2 });
      [-8,8].forEach(function(x){ ABYSS.furn(F, 'abyss_bench', x,6, 0, { variant:1 }); ABYSS.furn(F, 'abyss_lantern_post', x*1.4,10, 0, { variant:1 }); });
      ABYSS.furn(F, 'abyss_umbrella_canopy', 10,6, 0, { variant:1 });
      ABYSS.sign(F, 0,8.4,S+1.75, 0,1, 2.2,1.0, 'bed');
    } });

  /* =============================================================== LIBRARY */
  ASSET({ key:'abyss_library', name:'Library under the great cone', family:'civic', kit:'abyss', group:'Civic', culture:'abyssal-desert', types:['civic'],
    wealth:[0.6,1.0], w:42, d:40, h:30, variants:1, sim:{ activity:'LEARN', capacity:80 },
    build:function(F){ var P=1.2, cz=-4, R=13.5;
      F.box(0,0,cz, 2*R+5,P,2*R+3, 0, PAL.abRubble, 'rubble'); F.box(0,P-0.04,cz, 2*R+4.6,0.1,2*R+2.6, 0, PAL.abSalt, 'plaster');
      F.box(0,0,cz+R+4.5, 22,0.1,8, 0, PAL.abSalt, 'plaster');                                          /* forecourt */
      LOCUS.stair(F, 0, cz+R+1.5+P*1.15, 0,-1, P, 8.0);
      /* the terraced reading floors: four rising crescents round the back of the hall, shelves on each riser */
      for(var i=0;i<4;i++){ var r0=4.5+i*2.2, y=P+i*1.4;
        F.sector('plank', 0,cz, r0, R-0.8, PI*1.08, PI*1.92, y, y+1.4, F.pick(PLANKC), { faces:'tios', step:1.2 });
        for(var k=0;k<5;k++){ var a=PI*(1.18+k*0.16), rr=r0+0.5; ABYSS.furn(F, 'abyss_bookshelf', Math.cos(a)*(r0+1.6), cz+Math.sin(a)*(r0+1.6), -a-PI/2+PI, { ly:y+1.4 });
          if(i<3 && k%2===0) ABYSS.furn(F, 'abyss_reading_table', Math.cos(a)*(rr), cz+Math.sin(a)*(rr), -a-PI/2, { ly:y+1.4 }); } }
      F.sector('plank', 0,cz, 0, 4.5, 0, TAU, P, P+0.2, F.pick(PLANKC), { faces:'to', step:1.0 });
      [[-2.4,0],[2.4,0],[0,2.6]].forEach(function(p){ ABYSS.furn(F, 'abyss_reading_table', p[0],cz+p[1], 0, { ly:P+0.2 }); });
      ABYSS.coneShell(F, 0,cz, R, 26, { y0:P, fam:'thatch', col:0xC9C1AC,                 /* wq.jpg: pale silvery-grey thatch */
         arch:{ w:11, h:11.5 }, archCol:PAL.abLacquer, ring:PAL.abLacquer, k:1.35, seg:36, thick:0.5 });
      F.lamp(0,P+10,cz, 1.8, 26);
      /* the lesser cones beside it: a scroll store in shingle and a reading lantern in tin-mirror */
      ABYSS.coneShell(F, -13.2,-16.2, 2.6, 11, { y0:P, fam:'tile', col:0x8a7a68, arch:{ w:2.0, h:2.8 }, ring:PAL.abLacquer });
      ABYSS.coneShell(F, 13.2,-16.2, 2.6, 13, { y0:P, fam:'tinmirror', col:PAL.abTin, k:1.0, arch:{ w:2.0, h:2.8 }, ring:PAL.abLacquer });
      [-6,6].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,cz+R+5, PI, { variant:1 }); ABYSS.furn(F, 'abyss_bench', x*1.6,cz+R+7, 0, { variant:1 }); });
      ABYSS.plant(F, 'abyss_creeper', -16.7,-7.6, 0); ABYSS.plant(F, 'abyss_creeper', 16.7,-7.6, 0);
    } });

  /* =============================================================== SCHOOL */
  ASSET({ key:'abyss_school', name:'School of the six cones', family:'civic', kit:'abyss', group:'Civic', culture:'abyssal-desert', types:['civic'],
    wealth:[0.4,0.8], w:36, d:36, h:13, variants:1, sim:{ activity:'LEARN', capacity:120 },
    build:function(F){ var n=6, RR=12.5, rc=3.3;
      F.box(0,0,0, 34,0.1,34, 0, PAL.abSalt, 'plaster');
      for(var i=0;i<n;i++){ var a=PI/2+PI/n+i*TAU/n, x=Math.cos(a)*RR, z=Math.sin(a)*RR, c=PASTELC[(i*2)%PASTELC.length];
        F.lathe('rubble', x,z, [[rc+0.15,0],[rc+0.15,0.7]], PAL.abRubble, { seg:16 }); F.lathe('plaster', x,z, [[rc,0.7],[rc,3.2]], c, { seg:16 });
        F.lathe('relief', x,z, [[rc+0.05,3.0],[rc+0.05,3.4]], PASTELDC[i%PASTELDC.length], { seg:16 });
        ABYSS.coneShell(F, x,z, rc+1.0, 5.6, { y0:3.2, fam:'thatch', col:F.pick(THATCHC), arch:null, ring:false, thick:0.25, finial:i%2?PAL.abGild:PAL.abSailRed });
        var nx=-Math.cos(a), nz=-Math.sin(a); F.door(x+nx*(rc+0.02), z+nz*(rc+0.02), nx,nz, 1.1, 2.2, PAL.abBrightTeal, 0.7);
        [0.8,-0.8].forEach(function(o){ var b=a+PI+o, wx=x+Math.cos(b)*(rc+0.02), wz=z+Math.sin(b)*(rc+0.02); LOCUS.lattice(F, wx,2.6,wz, Math.cos(b),Math.sin(b), 0.9,0.9); });
        ABYSS.furn(F, 'abyss_bench', x+nx*(rc+1.6), z+nz*(rc+1.6), Math.atan2(nx,nz)+PI, {}); }
      /* the shaded court: a six-cornered swooping sail on masts between the classrooms */
      var M=[]; for(var j=0;j<n;j++){ var b2=PI/2+j*TAU/n, hh=j%2?8.4:9.6; M.push([Math.cos(b2)*9.5, hh, Math.sin(b2)*9.5]); ABYSS.mast(F, M[j][0],M[j][2], hh, { r:0.14, finial:PAL.abGild }); }
      ABYSS.sail(F, M, PAL.abSailOrange, { swoop:1.0, peak:1.4, band:PAL.abSailOrange, bandW:0.7 });
      ABYSS.furn(F, 'abyss_well', 0,0, 0); ABYSS.furn(F, 'abyss_reading_table', -3,3, 0.4); ABYSS.furn(F, 'abyss_reading_table', 3,-3, -0.4);
      [-3.2,3.2].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,16.4, PI, { variant:1 }); });
      ABYSS.sign(F, 0,3.2,16.6, 0,1, 1.8,0.9, 'book'); F.cyl(0,0,16.55, 0.1,3.2, 0, F.pick(TIMBERC), 'timber');
    } });

  /* =============================================================== AMPHITHEATRE */
  ASSET({ key:'abyss_amphitheater', name:'Amphitheatre', family:'civic', kit:'abyss', group:'Civic', culture:'abyssal-desert', types:['civic'],
    wealth:[0.5,1.0], w:76, d:76, h:14, variants:1, sim:{ activity:'PERFORM', capacity:2400 },
    build:function(F){ var r0=12, nT=11, tread=2.0, rise=0.65, open=0.95, cz=-2;
      F.sector('plaster', 0,cz, 0, r0, 0, TAU, 0, 0.12, PAL.abSalt, { faces:'t', step:1.5 });            /* the orchestra floor */
      /* the tiers in four blocks, split by three aisles (left, back, right) and the open front where the stage stands */
      var a0=PI/2+open, a1=PI/2-open+TAU, aisles=[PI, 1.5*PI, TAU], gap=0.05, blocks=[], s=a0;
      aisles.forEach(function(ax){ blocks.push([s, ax-gap]); s=ax+gap; }); blocks.push([s, a1]);
      for(var t=0;t<nT;t++){ var ra=r0+t*tread, rb=ra+tread, y=(t+1)*rise;
        blocks.forEach(function(b){ F.sector('rubble', 0,cz, ra, rb, b[0], b[1], 0, y, t%2?shade(PAL.abRubble,0.06):PAL.abRubble, { faces:'tos', step:2.5 });
          F.sector('plank', 0,cz, ra+0.15, ra+0.75, b[0]+0.004, b[1]-0.004, y, y+0.42, F.pick(PLANKC), { faces:'tos', step:2.5 }); }); }
      /* aisle stairs up each gap */
      aisles.forEach(function(ax){ for(var t2=0;t2<nT;t2++){ var rr=r0+t2*tread+tread/2; F.box(Math.cos(ax)*rr, 0, cz+Math.sin(ax)*rr, 1.6, (t2+0.5)*rise, 1.6, -ax, PAL.abSalt, 'plaster'); } });
      /* the outer ring: a rubble wall with entrances at the aisle heads, and a walk round the top */
      var Rw=r0+nT*tread, H=nT*rise;
      blocks.forEach(function(b){ F.sector('rubble', 0,cz, Rw, Rw+1.4, b[0], b[1], 0, H+1.2, PAL.abRubble, { faces:'tos', step:2.5 }); F.sector('relief', 0,cz, Rw-0.02, Rw+1.42, b[0], b[1], H+1.2, H+1.5, PAL.abLacquer, { faces:'tos', step:2.5 }); });
      aisles.forEach(function(ax){ [-1,1].forEach(function(sd){ var aa=ax+sd*(gap+0.012); F.cyl(Math.cos(aa)*(Rw+0.7), 0, cz+Math.sin(aa)*(Rw+0.7), 0.7, H+3.2, 0, PAL.abLacquer, 'plaster'); F.ball(Math.cos(aa)*(Rw+0.7), H+3.4, cz+Math.sin(aa)*(Rw+0.7), 0.5, PAL.abGild, 'metal'); }); });
      /* the stage: a deck on piles in the open front, facing the bowl (-z), under a swooping sail */
      var sz=cz+r0-1.0; ABYSS.platform(F, -9,9, sz-2, sz+8, 1.5, { span:2.6 });
      F.box(0,1.5,sz+7.7, 18,4.2,0.3, 0, PAL.abLacquer, 'plaster'); F.box(0,5.7,sz+7.7, 18.4,0.4,0.5, 0, PAL.abGild, 'metal');
      ABYSS.flight(F, -7.5,sz-2-1.7, 0,1, 0,1.5, 1.4); ABYSS.flight(F, 7.5,sz-2-1.7, 0,1, 0,1.5, 1.4);
      var C=[[-9.4,10.4,sz-2.2],[9.4,10.4,sz-2.2],[9.4,8.4,sz+8.2],[-9.4,8.4,sz+8.2]]; C.forEach(function(q){ ABYSS.mast(F, q[0],q[2], q[1], { r:0.18, finial:PAL.abGild, prop:true, lit:true }); });
      ABYSS.sail(F, C, PAL.abSailOrange, { swoop:1.8, band:PAL.abSailOrange, bandW:0.9 });
      [-5,0,5].forEach(function(x){ ABYSS.lantern(F, x,6.0,sz-1.5, true); });
      /* lantern posts round the walk at the top */
      for(var k=0;k<8;k++){ var aa2=a0+0.15+(a1-a0-0.3)*k/7; ABYSS.furn(F, 'abyss_lantern_post', Math.cos(aa2)*(Rw-1.0), cz+Math.sin(aa2)*(Rw-1.0), -aa2+PI/2, { ly:H, variant:1 }); }
    } });
})();
