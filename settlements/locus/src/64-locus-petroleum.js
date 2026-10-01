/* ============================== 16P. LOCUS — the petroleum works ==============================
   The Geomancers' oil: a pumpjack (an Ancient steel skid and gear re-set on a mud plinth, animated by
   76-locus-anim.js), riveted storage tanks inside mud bunds, a pipe rack, and the refinery — a walled
   compound where mud-brown Yuni banco halls carry rusted Ancient columns, drums and stacks.        */
reseed(644001);
(function(){
  var PI=Math.PI, GROUP='Petroleum: pumpjack, tanks, pipe rack, refinery';

  /* =============================================================== 1. PUMPJACK */
  ASSET({ key:'ind_pumpjack', name:'Pumpjack', family:'trade', kit:['locus','abyss'], group:GROUP, kitGroup:{ abyss:'Industry (Geomancer)' }, culture:'geomancer', types:['industry','infrastructure'],
    districts:['poor'], wealth:[0.2,0.8], w:8, d:15, h:8, variants:2, variantNames:['rusted skid','tarnished white-metal gear'],
    build:function(F){
      var v=F.variant, rust=F.pick(RUSTC), rust2=shade(rust,-0.15), dk=STEELDC[0], gearCol = v ? TARNC[1] : rust2, gearFam = v ? 'metal' : 'rust', mud=F.pick(MUDBROWNC);
      /* the mud plinth and the Ancient skid re-set on it */
      F.box(0, 0, 0.4, 5.6, 0.45, 12.0, 0, mud, 'adobe'); F.box(0, 0.42, 0.4, 5.0, 0.06, 11.4, 0, shade(mud,-0.08), 'adobe');
      [-1.15,1.15].forEach(function(x){ F.box(x, 0.45, -0.4, 0.36, 0.30, 9.6, 0, rust, 'rust'); });
      [-5.0,-2.6,0,2.2,4.2].forEach(function(z){ F.box(0, 0.45, z, 2.6, 0.26, 0.30, 0, rust2, 'rust'); });
      /* Samson post: four legs to the top bearing */
      [[-1.15,-1.3],[1.15,-1.3],[-1.15,1.3],[1.15,1.3]].forEach(function(p){ F.beam(p[0], 0.75, p[1], p[0]*0.38, 5.3, 0, 0.22, 0.22, rust, 'rust'); });
      F.box(0, 5.25, 0, 1.3, 0.35, 0.55, 0, rust2, 'rust'); F.cyl(0.55, 5.62, 0, 0.22, 1.1, [0,0,PI/2], dk, 'rust');
      F.beam(-1.15, 2.6, -1.3, 1.15, 2.6, 1.3, 0.12, 0.12, rust2, 'rust'); F.beam(1.15, 2.6, -1.3, -1.15, 2.6, 1.3, 0.12, 0.12, rust2, 'rust');   /* cross bracing */
      /* gearbox, crankshaft, the belt guard and the salvaged Ancient motor with its battery crate */
      F.box(0, 0.75, -4.3, 1.6, 1.5, 1.5, 0, gearCol, gearFam); F.cyl(1.35, 1.95, -4.3, 0.12, 2.7, [0,0,PI/2], dk, 'rust');
      F.box(1.35, 0.85, -4.4, 0.16, 1.5, 1.9, 0, rust2, 'rust');
      F.box(2.3, 0.75, -4.4, 1.3, 1.0, 1.6, 0, gearCol, gearFam); F.box(2.3, 1.75, -4.4, 1.0, 0.25, 1.2, 0, dk, 'rust'); F.cyl(2.3, 1.75, -4.4, 0.30, 0.55, 0, dk, 'rust');
      F.box(-2.35, 0.45, -4.6, 0.9, 0.7, 1.2, 0, TARNC[2], 'metal'); F.box(-2.35, 1.15, -4.6, 0.7, 0.06, 1.0, 0, PAL.electricBlue, 'glowmat');
      F.rod(-1.9, 1.1, -4.6, 1.65, 1.2, -4.4, 0.025, dk, 'rust');                                                                                /* the cable */
      /* the wellhead in its cellar ring, the stuffing box, the flowline with its valve running off to the east edge */
      F.lathe('adobe', 0, 4.8, [[1.1,0.45],[1.15,0.75],[1.0,0.85]], shade(mud,-0.15), { seg:10 }); LOCUS.stain(F, 0.3, 5.0, 1.4);
      F.cyl(0, 0.45, 4.8, 0.28, 1.2, 0, dk, 'rust'); F.cyl(0, 1.62, 4.8, 0.2, 0.28, 0, rust2, 'rust'); F.box(0, 1.0, 4.8, 0.9, 0.3, 0.3, 0, dk, 'rust');
      LOCUS.pipe(F, [[0.45,1.12,4.8],[2.4,1.12,4.8],[2.4,0.6,4.8],[3.95,0.6,4.8]], 0.09, PIPEC[1]); LOCUS.valve(F, 1.4, 1.12, 4.8, 0.10, rust);
      LOCUS.flange(F, 3.9, 0.6, 4.8, 1,0,0, 0.09, dk);
      /* a marker post with the Geomancers' brown pennant, and a lantern on it */
      F.cyl(-2.4, 0, 3.2, 0.06, 3.6, 0, TIMBERC[1], 'timber'); F.box(-2.4+0.45, 2.9, 3.2, 0.9, 0.5, 0.03, PI/2, GEOBROWNC[0], 'cloth'); LOCUS.lantern(F, -2.4, 2.2, 3.35, 0.5, 8);
      /* the moving gear: registered for 76-locus-anim.js */
      LOCUS.anim(F, 'pumpjack', { O:[0,5.62,0], Lt:3.5, Lp:3.75, C:[1.95,-4.3], rc:1.15, wellZ:4.8, speed:F.rr(0.42,0.62), phase:F.rr(0,TAU), colBeam:rust, colHead:rust2, colCw:dk, colArm:gearCol, famArm:gearFam });
    } });

  /* =============================================================== 2. OIL STORAGE TANK */
  ASSET({ key:'ind_oil_tank', name:'Oil storage tank', family:'trade', kit:['locus','abyss'], group:GROUP, kitGroup:{ abyss:'Industry (Geomancer)' }, culture:'geomancer', types:['industry','infrastructure'],
    districts:['market','poor'], wealth:[0.2,0.9], w:24, d:27, h:13, variants:3, variantNames:['riveted, cone roof, in a mud bund','squat floating-roof tank with a spiral stair','banco-clad tank in the Yuni manner'],
    build:function(F){
      var v=F.variant, rust=F.pick(RUSTC), mud=F.pick(MUDBROWNC), dk=STEELDC[0], R=[7.6,9.0,7.4][v], H=[9.0,6.8,8.6][v];
      /* the bund: a ring of mud with its top crust, the ground inside stained */
      F.sector('adobe', 0,0, 10.4,11.4, 0,TAU, 0,1.3, mud, { faces:'tio', step:2.0 }); F.sector('adobe', 0,0, 10.3,11.5, 0,TAU, 1.3,1.42, shade(mud,-0.1), { faces:'tio', step:2.0 });
      F.cyl(0, 0.02, 0, 10.35, 0.04, 0, shade(mud,-0.22), 'adobe'); LOCUS.stain(F, 4.2, 8.0, 1.8); LOCUS.stain(F, -6.5, -5.0, 1.2);
      /* steps over the bund at the front */
      F.box(0, 0, 11.6, 2.2, 1.3, 1.6, 0, mud, 'adobe'); for(var s=0;s<4;s++){ F.box(0, s*0.33, 12.5+s*0.32, 2.2, 0.33, 0.35, 0, shade(mud,0.08), 'adobe'); F.box(0, s*0.33, 9.2-s*0.32, 2.2, 0.33, 0.35, 0, shade(mud,0.08), 'adobe'); }
      F.cyl(0, 0, 0, R+0.4, 0.5, 0, shade(mud,-0.12), 'adobe');                                                                   /* the tank's pad */
      if(v===2){ /* banco-clad: a steel tank rendered in mud, buttress-pilasters, a toron ring, a mud cone roof; a bare steel manway shows what it is */
        F.lathe('adobe', 0,0, [[R+0.5,0.5],[R+0.35,1.6],[R+0.2,H-0.6],[R+0.45,H+0.1]], mud, { seg:24 });
        for(var i=0;i<10;i++){ var a=i/10*TAU, px=Math.cos(a)*(R+0.25), pz=Math.sin(a)*(R+0.25); F.fr5(px, 0.5, pz, 1.0, H+0.6, 1.0, -a, mud, 'adobe'); F.cone(px, H+1.05, pz, 0.3, 1.1, 0, mud, 'adobe'); }
        for(var t=0;t<20;t++){ var ta=t/20*TAU; F.toron(Math.cos(ta)*(R+0.2), H-1.4, Math.sin(ta)*(R+0.2), Math.cos(ta), Math.sin(ta), 0.8); }
        F.lathe('relief', 0,0, [[R+0.52,H-3.0],[R+0.52,H-2.2]], shade(mud,0.16), { seg:24 });
        F.mcone('adobe', 0, H+0.1, 0, R+0.5, 0.6, 2.4, shade(mud,-0.06), 24, { under:true }); F.cyl(0, H+2.4, 0, 0.22, 1.0, 0, dk, 'rust'); F.cone(0, H+3.4, 0, 0.45, 0.35, 0, dk, 'rust');
        F.disc(0, 1.5, R+0.45, 0,1, 0.6, 0.2, dk, 'rust'); F.box(2.4, 5.0, R+0.28, 1.6, 0.9, 0.1, 0, TARNC[1], 'metal'); }
      else { LOCUS.tank(F, 0,0, R, H, rust, { bands: v?2:3, roof: v===0, pitch:0.13, seg:24 }); }
      /* the stair: a spiral of treads round the shell (v1), or a straight caged ladder (v0, v2) */
      if(v===1){ var n=26; for(var k=0;k<n;k++){ var a2=PI/2 + k/n*PI*1.5, y=0.6+k/n*(H-0.4); F.box(Math.cos(a2)*(R+0.65), y, Math.sin(a2)*(R+0.65), 1.1, 0.06, 0.32, -a2, dk, 'rust');
          if(k%3===0) F.cyl(Math.cos(a2)*(R+1.15), y, Math.sin(a2)*(R+1.15), 0.035, 1.0, 0, dk, 'rust'); }
        F.tube('rust', (function(){ var p=[]; for(var q=0;q<=13;q++){ var a3=PI/2 + q/13*PI*1.5; p.push({ x:Math.cos(a3)*(R+1.15), y:1.6+q/13*(H-0.4), z:Math.sin(a3)*(R+1.15), r:0.035 }); } return p; })(), dk, { seg:4 });
        LOCUS.platform(F, 0,0, R, H+0.05, dk); }
      else LOCUS.cageLadder(F, 0,0, R+(v===2?0.5:0), PI/2, 0.5, H+(v===2?0.2:0.0), dk);
      /* the manifold at the front: inlet and outlet pipes over the bund, two valves, a drain */
      var yb=1.9; LOCUS.pipe(F, [[-2.2,0.9,R+0.3],[-2.2,0.9,7.0],[-2.2,yb,7.0],[-2.2,yb,11.6],[-2.2,0.6,11.6],[-2.2,0.6,12.0]], 0.20, PIPEC[0]); LOCUS.valve(F, -2.2, yb, 9.6, 0.2, rust);
      LOCUS.pipe(F, [[2.6,0.9,R+0.3],[2.6,0.9,7.6],[2.6,yb,7.6],[2.6,yb,11.6],[2.6,0.6,11.6],[2.6,0.6,12.0]], 0.14, PIPEC[2]); LOCUS.valve(F, 2.6, yb, 9.6, 0.14, rust);
      LOCUS.flange(F, -2.2, 0.6, 12.0, 0,0,1, 0.20, dk); LOCUS.flange(F, 2.6, 0.6, 12.0, 0,0,1, 0.14, dk);
      [-2.2,2.6].forEach(function(x){ F.cyl(x, 0.5, 8.2, 0.08, yb-0.4, 0, dk, 'rust'); });
      F.cyl(-6.0, 0.5, 6.5, 0.32, 0.6, 0, dk, 'rust'); LOCUS.stain(F, -6.0, 7.3, 0.7);                                             /* the drain and its puddle */
      LOCUS.lantern(F, 1.6, 2.3, 12.4, 0.6, 10);
    } });

  /* =============================================================== 3. PIPE RACK SEGMENT */
  ASSET({ key:'prop_pipe_rack', name:'Pipe rack segment', family:'prop', kit:['locus','abyss'], group:GROUP, kitGroup:{ abyss:'Industry (Geomancer)' }, culture:'geomancer', types:['infrastructure','prop'],
    districts:['market','poor'], wealth:[0,1], w:12, d:3, h:3.4, variants:2, variantNames:['straight, two lines','with a valve and a riser stub'],
    build:function(F){
      var v=F.variant, mud=F.pick(MUDBROWNC), dk=STEELDC[0];
      [-5,0,5].forEach(function(x){ F.fr5(x, 0, 0, 0.7, 2.8, 0.7, 0, mud, 'adobe'); F.box(x, 2.8, 0, 2.4, 0.24, 0.26, 0, RUSTC[4], 'rust'); });
      LOCUS.pipe(F, [[-6,3.16,-0.6],[6,3.16,-0.6]], 0.24, PIPEC[0]); LOCUS.pipe(F, [[-6,3.10,0.5],[6,3.10,0.5]], 0.15, PIPEC[2]);
      [-6,6].forEach(function(x){ LOCUS.flange(F, x, 3.16, -0.6, 1,0,0, 0.24, dk); LOCUS.flange(F, x, 3.10, 0.5, 1,0,0, 0.15, dk); });
      if(v===1){ LOCUS.valve(F, 0.0, 3.16, -0.6, 0.20, RUSTC[1]); LOCUS.pipe(F, [[3.0,3.16,-0.6],[3.0,0.5,-0.6],[3.0,0.5,-1.4]], 0.16, PIPEC[0]); LOCUS.flange(F, 3.0, 0.5, -1.4, 0,0,1, 0.16, dk); LOCUS.stain(F, 3.2, -1.2, 0.6); }
    } });

  /* =============================================================== 3b. DRUM STACK (yard clutter) */
  ASSET({ key:'prop_drum_stack', name:'Drum stack', family:'prop', kit:['locus','abyss'], group:GROUP, kitGroup:{ abyss:'Industry (Geomancer)' }, culture:'geomancer', types:['industry','prop'],
    districts:['market','poor'], wealth:[0,1], w:5, d:4, h:2.4, variants:3, variantNames:['pyramid of drums','drums on a pallet with a tarp','crates and drums'],
    build:function(F){
      var v=F.variant;
      if(v===0){ for(var r=0;r<3;r++) for(var c=0;c<4-r;c++) LOCUS.drum(F, -1.4+c*0.7+r*0.35, 0, -0.6+(r%2)*0.1, RUSTC[(r+c)%5], true, Math.PI/2); for(var k=0;k<3;k++) LOCUS.drum(F, -1.2+k*0.8, 0, 1.2, RUSTC[k+1]); }
      else if(v===1){ F.box(0,0,0, 4.2,0.18,3.2, 0, PLANKC[2], 'plank'); for(var i=0;i<5;i++) for(var j=0;j<4;j++) LOCUS.drum(F, -1.7+i*0.84, 0.18, -1.2+j*0.8, RUSTC[(i*3+j)%5]);
        F.quad('canvas', [-2.2,1.25,-1.7],[0.6,1.25,-1.7],[0.6,0.2,-1.75],[-2.2,0.2,-1.75], GEOBROWNC[2], [0,0,-1]); F.box(-0.8,1.07,0, 2.9,0.1,3.4, 0, GEOBROWNC[1], 'canvas'); }
      else { F.box(-1.2,0,0, 1.6,1.2,1.6, 0.2, PLANKC[0], 'plank'); F.box(-1.1,1.2,0.1, 1.2,0.8,1.2, -0.1, PLANKC[3], 'plank'); for(var q=0;q<4;q++) LOCUS.drum(F, 0.8+(q%2)*0.72, 0, -0.8+Math.floor(q/2)*0.8, RUSTC[q]); }
      LOCUS.stain(F, 0.4, 0.5, 1.6);
    } });

  /* =============================================================== 4. THE REFINERY */
  ASSET({ key:'ind_refinery', name:"Geomancers' still-house (refinery)", family:'trade', kit:'locus', group:GROUP, culture:'geomancer', types:['industry','civic'],
    districts:['market'], wealth:[0.3,0.9], w:66, d:50, h:27, variants:1,
    build:function(F){
      var mud=F.pick(MUDBROWNC), mud2=shade(mud,-0.12), rust=F.pick(RUSTC), rust2=RUSTC[4], dk=STEELDC[0], pipe=PIPEC[0];
      /* ---- the yard and its wall: battered banco with pilasters, a parabolic gate in the front wall ---- */
      F.box(0, 0.0, 0, 63, 0.05, 47, 0, shade(mud,-0.20), 'adobe');
      [[0,-23.5,63,true],[-31.5,0,47,false],[31.5,0,47,false]].forEach(function(w){ var alongX=w[3]; F.fr8(w[0], 0, w[1], alongX?w[2]:0.7, 2.8, alongX?0.7:w[2], 0, mud, 'adobe');
        var n=Math.round(w[2]/6); for(var i=0;i<=n;i++){ var t=(i/n-0.5)*(w[2]-1.2), px=alongX?w[0]+t:w[0], pz=alongX?w[1]:w[1]+t; F.fr5(px, 0, pz, 1.0, 3.3, 1.0, 0, mud, 'adobe'); F.cone(px, 3.25, pz, 0.28, 0.9, 0, mud, 'adobe'); } });
      [-17.9,17.9].forEach(function(x){ F.fr8(x, 0, 23.5, 27.2, 2.8, 0.7, 0, mud, 'adobe'); for(var i=0;i<5;i++){ var px=x+(i/4-0.5)*26; F.fr5(px, 0, 23.5, 1.0, 3.3, 1.0, 0, mud, 'adobe'); F.cone(px, 3.25, 23.5, 0.28, 0.9, 0, mud, 'adobe'); } });
      F.archwall('adobe', 0, 0, 23.5, 0, 8.6, 5.6, 1.4, 5.0, 4.6, mud, { pointed:2.4, colIn:mud2, seg:16 });
      F.archband('relief', 0, 0, 24.22, 0, 5.0, 4.6, 0.5, 0.1, shade(mud,0.18), { pointed:2.4 });
      [-3.6,3.6].forEach(function(x){ F.cone(x, 5.5, 23.5, 0.42, 1.4, 0, mud, 'adobe'); LOCUS.lantern(F, x, 3.4, 24.4, 0.8, 12); });
      F.box(-2.0, 0, 22.6, 0.12, 4.2, 2.4, 0.9, PLANKC[3], 'plank');                                                              /* one gate leaf, swung open */
      /* the gatehouse: a Sankore-type mud tower with toron studs and the Geomancers' brown banner */
      var GX=-12.5; F.fr5(GX, 0, 18.5, 5.2, 9.5, 5.2, 0, mud, 'adobe'); F.box(GX, 9.4, 18.5, 2.9, 0.5, 2.9, 0, mud2, 'adobe'); F.cone(GX, 9.85, 18.5, 0.6, 2.0, 0, mud, 'adobe');
      for(var r=0;r<3;r++) for(var k=0;k<4;k++){ var ty=2.2+r*2.4, in_=1-0.5*ty/9.5; F.toron(GX+(k-1.5)*1.1*in_, ty, 18.5+2.6*in_, 0,1, 0.7); F.toron(GX+2.6*in_, ty, 18.5+(k-1.5)*1.1*in_, 1,0, 0.7); }
      F.door(GX, 21.1, 0,1, 1.1, 2.2, PLANKC[1]); F.window(GX, 5.6, 18.5+2.6*(1-0.5*5.6/9.5)+0.02, 0,1, 0.6, 0.9); F.cyl(GX, 11.6, 18.5, 0.05, 3.6, 0, TIMBERC[1], 'timber'); F.box(GX+0.75, 13.7, 18.5, 1.5, 0.9, 0.03, PI/2, GEOBROWNC[0], 'cloth');
      /* ---- the still-house: a mud-brown Yuni hall with a loading arcade; the great column rises beside it ---- */
      LOCUS.mudBlock(F, -14, -8, 24, 9, 14, mud, { pilasters:6, vents:true, ventX:-7, toronBack:true });
      F.arcade('adobe', -14, 0, -0.2, 0, 4, 4.0, 5.2, 0.5, mud, { pier:1.1, head:0.9, colIn:mud2 });
      F.box(-14, 5.2, -0.8, 16.6, 0.35, 1.6, 0, mud2, 'adobe'); F.box(-14, 0, -0.9, 16.4, 4.2, 1.2, 0, VOIDC[1], 'dark');   /* the deep shade of the loading dock behind the arcade */
      F.lamp(-14, 3.0, -1.6, 1.2, 14); F.window(-4.6, 6.4, -8, 1,0, 0.9, 1.1); F.window(-4.6, 3.2, -11, 1,0, 0.9, 1.1);
      for(var rv=0;rv<5;rv++){ var vx=-22+rv*4.0; F.cyl(vx, 8.9, -9.5, 0.55, 1.2, 0, mud2, 'adobe'); F.cone(vx, 10.1, -9.5, 0.75, 0.7, 0, shade(mud,-0.2), 'adobe'); F.box(vx, 9.3, -9.5, 0.7, 0.5, 0.7, 0, VOIDC[1], 'dark'); }   /* roof vents over the stills */
      F.cyl(-7.5, 8.9, -5.0, 0.6, 5.0, 0, rust2, 'rust'); F.cyl(-7.5, 13.9, -5.0, 0.7, 0.35, 0, STEELDC[3], 'rust');                                                                                /* a second, older stack through the hall roof */
      /* a fitters' workshop against the west wall: mud block, open front under a canvas awning, drums and a bench */
      F.fr8(-26.5, 0, 3.0, 8.0, 4.4, 9.0, 0, mud, 'adobe'); F.box(-26.5, 4.35, 3.0, 6.3, 0.4, 7.2, 0, mud2, 'adobe'); F.box(-22.7, 0, 3.0, 0.8, 3.0, 5.0, 0, VOIDC[1], 'dark');
      [-0.5,6.5].forEach(function(pz){ LOCUS.pole(F, -19.6, pz, 3.4, 0.08, TIMBERC[1], false); });
      LOCUS.stripes(F, [-22.4,3.9,-0.9],[-22.4,3.9,6.9],[-19.6,3.4,6.5],[-19.6,3.4,-0.5], 5, CANVASC[1], GEOBROWNC[2], { sag:0.15 });
      FURNISH('yuni_common_workbench', -20.8,0,1.5, 0);                                                                          /* the fitters' bench: FURNITURE (catalog) */
      for(var dr=0;dr<3;dr++) LOCUS.drum(F, -20.6, 0, 4.1+dr*0.7, RUSTC[(dr+1)%5]); LOCUS.drum(F, -21.6, 0, 4.8, RUSTC[3], true, 0.3);
      F.lamp(-24.0, 2.6, 3.5, 0.9, 10);
      /* the fractionating column: an Ancient vessel on a mud-brick foundation, three walkways, a tarnished cap */
      var CX=3.5, CZ=-12; F.lathe('adobe', CX, CZ, [[3.2,0],[3.1,0.9],[2.9,1.1]], mud2, { seg:20 });
      F.lathe('rust', CX, CZ, [[2.4,1.0],[2.4,1.4],[2.25,1.6],[2.25,20.2],[2.0,21.0],[1.25,21.6]], rust, { seg:24 });
      [4.0,9.5,15.0].forEach(function(y){ F.lathe('rust', CX, CZ, [[2.36,y-0.16],[2.36,y+0.16]], rust2, { seg:24 }); });
      [6.5,12.0,17.5].forEach(function(y){ LOCUS.platform(F, CX, CZ, 2.25, y, dk); });
      F.dome(CX, 21.4, CZ, 1.3, 1.5, 0, TARNC[1], 'metal'); F.cyl(CX, 22.8, CZ, 0.16, 1.4, 0, dk, 'rust'); F.cone(CX, 24.1, CZ, 0.35, 0.3, 0, dk, 'rust');
      LOCUS.cageLadder(F, CX, CZ, 2.25, PI/2, 1.2, 20.0, dk);
      for(var q=0;q<6;q++){ var qa=q/6*TAU+0.3; F.box(CX+Math.cos(qa)*2.2, 1.1+q*0.0, CZ+Math.sin(qa)*2.2, 0.5, 0.7, 0.3, -qa, VOIDC[1], 'dark'); }        /* skirt vents */
      LOCUS.pipe(F, [[CX-2.3,19.0,CZ],[CX-3.0,19.0,CZ],[CX-3.0,6.2,CZ],[CX-3.0,6.2,CZ+3.5],[CX-8.0,6.2,CZ+3.5]], 0.16, pipe);            /* overhead line back to the still-house */
      LOCUS.pipe(F, [[CX+2.3,13.5,CZ],[CX+3.2,13.5,CZ],[CX+3.2,3.9,CZ],[CX+3.2,3.9,CZ+8.0]], 0.13, pipe);
      /* the second column, the horizontal separator on its saddles, the fired heater and its stack */
      F.lathe('adobe', 10.5, -15, [[2.0,0],[1.9,0.8]], mud2, { seg:16 }); F.lathe('rust', 10.5, -15, [[1.45,0.7],[1.45,13.0],[1.2,13.6],[0.7,13.9]], shade(rust,0.06), { seg:18 });
      LOCUS.platform(F, 10.5, -15, 1.45, 9.0, dk); F.dome(10.5, 13.8, -15, 0.75, 0.9, 0, TARNC[2], 'metal'); LOCUS.cageLadder(F, 10.5, -15, 1.45, PI/2, 0.9, 13.0, dk);
      [13.6,18.8].forEach(function(x){ F.fr8(x, 0, -11, 2.4, 1.6, 3.8, 0, mud2, 'adobe'); });
      F.tube('rust', [{x:12.0,y:2.9,z:-11,r:1.55},{x:20.4,y:2.9,z:-11,r:1.55}], rust, { seg:14, cap:true }); F.ball(12.0, 2.9, -11, 1.5, rust, 'rust'); F.ball(20.4, 2.9, -11, 1.5, rust, 'rust');
      F.cyl(14.5, 4.3, -11, 0.45, 0.5, 0, dk, 'rust'); F.cyl(18.0, 4.3, -11, 0.3, 0.9, 0, dk, 'rust'); LOCUS.valve(F, 18.0, 5.2, -11, 0.12, RUSTC[1]);
      LOCUS.pipe(F, [[10.5,1.6,-13.5],[10.5,1.6,-11],[10.5,2.9,-11]], 0.14, pipe); LOCUS.pipe(F, [[21.9,2.9,-11],[23.2,2.9,-11],[23.2,2.9,-13.0]], 0.14, pipe);
      F.fr8(25.5, 0, -15.5, 7.0, 6.0, 6.5, 0, mud2, 'adobe'); F.box(25.5, 5.95, -15.5, 5.4, 0.4, 5.0, 0, shade(mud2,-0.1), 'adobe');
      F.archwall('adobe', 25.5, 0, -12.3, 0, 3.0, 2.6, 0.6, 1.6, 1.9, mud2, { colIn:VOIDC[0], seg:10 }); F.box(25.5, 0, -12.35, 1.5, 1.8, 0.4, 0, VOIDC[0], 'dark'); F.lamp(25.5, 1.0, -12.1, 1.6, 10);
      F.cyl(25.5, 6.0, -17.0, 0.85, 18.0, 0, rust2, 'rust'); F.cyl(25.5, 23.9, -17.0, 0.95, 0.5, 0, STEELDC[3], 'rust'); F.cyl(25.5, 19.0, -17.0, 0.9, 0.6, 0, STEELDC[3], 'rust');
      [[22.0,-22.0],[19.5,-14.0],[30.5,-13.0]].forEach(function(g){ F.rod(25.5, 21.0, -17.0, g[0], 0.1, g[1], 0.03, PAL.people.hair[2], 'timber'); });
      /* the pipe rack across the yard tying it together: mud piers, two lines, risers */
      for(var px=-2; px<=27; px+=5.8){ F.fr5(px, 0, -4, 0.7, 3.2, 0.7, 0, mud, 'adobe'); F.box(px, 3.2, -4, 2.2, 0.24, 0.26, 0, rust2, 'rust'); }
      LOCUS.pipe(F, [[-2,3.55,-4.6],[27.5,3.55,-4.6]], 0.22, pipe); LOCUS.pipe(F, [[-2,3.5,-3.4],[27.5,3.5,-3.4]], 0.14, PIPEC[2]);
      LOCUS.pipe(F, [[CX+3.2,3.9,CZ+8.0],[CX+3.2,3.55,-4.6]], 0.13, pipe); LOCUS.pipe(F, [[23.2,2.9,-13.0],[23.2,3.5,-6.0],[23.2,3.5,-3.4]], 0.14, PIPEC[2]);
      LOCUS.pipe(F, [[-2,3.55,-4.6],[-2,1.0,-4.6],[-2,1.0,6.0],[-2,1.0,12.4]], 0.22, pipe); LOCUS.valve(F, 9.0, 3.55, -4.6, 0.20, RUSTC[1]);
      /* the cooling trough: a mud basin with a serpentine condenser under water */
      F.box(-2, 0, 15.5, 12.0, 1.1, 3.6, 0, mud, 'adobe'); F.box(-2, 0.5, 15.5, 11.2, 0.5, 2.8, 0, SALTWATERC[2], 'plaster');
      F.tube('rust', (function(){ var p=[]; for(var i=0;i<=12;i++){ p.push({ x:-7.2+i*0.87, y:1.0, z:15.5+((i%2)?1.0:-1.0), r:0.11 }); } return p; })(), pipe, { seg:6, cap:true });
      LOCUS.pipe(F, [[-2,1.0,12.4],[-2,1.0,13.5],[-7.2,1.0,13.5],[-7.2,1.0,14.5]], 0.14, pipe); LOCUS.pipe(F, [[3.24,1.0,16.5],[3.24,1.0,17.8],[8.0,1.0,17.8]], 0.11, pipe);
      /* the crude sump with its bucket gantry, and the loading bay under a canvas shade: drums by the score */
      F.sector('adobe', -22, 14, 3.6, 4.5, 0,TAU, 0, 0.9, mud, { faces:'tio', step:1.6 }); F.cyl(-22, 0.05, 14, 3.55, 0.45, 0, OILC[0], 'adobe');
      F.cyl(-25.5, 0, 14, 0.12, 4.2, 0, TIMBERC[0], 'timber'); F.cyl(-18.5, 0, 14, 0.12, 4.2, 0, TIMBERC[0], 'timber'); F.rod(-25.6, 4.1, 14, -18.4, 4.1, 14, 0.06, TIMBERC[2], 'timber');
      F.rod(-22, 4.1, 14, -22, 1.6, 14, 0.02, PAL.people.hair[2], 'timber'); F.cyl(-22, 1.2, 14, 0.28, 0.45, 0, dk, 'rust');
      var LX=21, LZ=10; [[LX-4,LZ-3.2],[LX+4,LZ-3.2],[LX+4,LZ+3.2],[LX-4,LZ+3.2]].forEach(function(p){ LOCUS.pole(F, p[0], p[1], 4.0, 0.09, TIMBERC[1], true); });
      LOCUS.stripes(F, [LX-4.4,4.0,LZ-3.6],[LX+4.4,4.0,LZ-3.6],[LX+4.4,4.0,LZ+3.6],[LX-4.4,4.0,LZ+3.6], 8, CANVASC[3], GEOBROWNC[2], { sag:0.4 });
      for(var dx=0;dx<5;dx++) for(var dz=0;dz<3;dz++){ LOCUS.drum(F, LX-3.0+dx*0.75, 0, LZ-2.4+dz*0.75, RUSTC[(dx+dz)%5]); if((dx+dz)%3===0) LOCUS.drum(F, LX-3.0+dx*0.75, 0.9, LZ-2.4+dz*0.75, RUSTC[(dx+dz+2)%5]); }
      for(var l=0;l<4;l++) LOCUS.drum(F, LX+1.6, 0, LZ+1.2+l*0.7, RUSTC[l], true, PI/2);
      F.fr8(LX+0.5, 0, LZ+5.8, 6.0, 0.9, 2.2, 0, mud, 'adobe'); LOCUS.stain(F, LX-1.5, LZ+4.4, 1.0);                             /* the loading ramp */
      /* the control shed: Ancient white-metal panels, a strip of blue glass, a cable mast, and ELECTRIC light — the Geomancers have batteries */
      F.box(11, 0, 13, 6.4, 3.6, 4.6, 0, TARNC[0], 'metal'); F.box(11, 3.6, 13, 6.8, 0.25, 5.0, 0, TARNC[3], 'metal'); F.box(11, 1.9, 15.32, 3.4, 0.8, 0.06, 0, GLASSC[0], 'glass');
      F.box(13.4, 0, 15.3, 1.0, 2.2, 0.08, 0, VOIDC[0], 'dark'); F.box(13.4, 0, 15.26, 0.9, 2.2, 0.05, 0, TARNC[2], 'metal');
      F.cyl(8.6, 3.85, 11.5, 0.05, 5.0, 0, dk, 'rust'); F.disc(8.6, 8.4, 11.5, 0,1, 0.45, 0.08, TARNC[1], 'metal');
      [[8.4,0,15.6],[9.4,0,15.6],[10.4,0,15.6]].forEach(function(p){ F.box(p[0], 0, p[2]+0.6, 0.8, 0.6, 0.9, 0, TARNC[2], 'metal'); F.box(p[0], 0.6, p[2]+0.6, 0.6, 0.05, 0.7, 0, PAL.electricBlue, 'glowmat'); });
      F.cyl(14.8, 3.6, 15.2, 0.04, 1.0, 0, dk, 'rust'); F.ball(14.8, 4.65, 15.2, 0.16, PAL.electric, 'glowmat'); nlLampAdd(F.P(14.8,4.65,15.2).x, F.y+4.65, F.P(14.8,4.65,15.2).z, 1.2, 16, true);
      F.cyl(-14, 5.55, -0.8, 0.04, 1.2, 0, dk, 'rust'); F.ball(-14, 6.8, -0.8, 0.16, PAL.electric, 'glowmat'); nlLampAdd(F.P(-14,6.8,-0.8).x, F.y+6.8, F.P(-14,6.8,-0.8).z, 1.2, 18, true);
      /* the flare stack in the back corner, guyed, with its knock-out drum; the yard's stains and a few reeds at the wall foot outside */
      F.cyl(29.2, 0, -21.6, 0.36, 22, 0, rust2, 'rust'); F.cyl(29.2, 21.8, -21.6, 0.5, 0.6, 0, STEELDC[3], 'rust'); LOCUS.flame(F, 29.2, 22.4, -21.6, 0.8, 2.4);
      [[30.8,-23.0],[26.2,-23.0],[27.0,-19.0]].forEach(function(g){ F.rod(29.2, 16, -21.6, g[0], 0.1, g[1], 0.025, PAL.people.hair[2], 'timber'); });
      F.cyl(30.0, 0.3, -18.6, 0.9, 2.4, 0, rust, 'rust'); LOCUS.pipe(F, [[27.5,3.5,-4.6],[27.5,3.5,-18.6],[29.2,3.5,-18.6]], 0.14, PIPEC[2]); LOCUS.pipe(F, [[30.0,2.7,-18.6],[30.0,3.2,-18.6],[29.2,3.2,-21.6],[29.2,21.0,-21.6]], 0.10, PIPEC[2]);
      LOCUS.stain(F, 4, 8, 2.2); LOCUS.stain(F, -8, 6, 1.4); LOCUS.stain(F, 16, -2, 1.6);
      LOCUS.lantern(F, -4.6, 3.0, 22.6, 0.7, 12); LOCUS.lantern(F, 4.6, 3.0, 22.6, 0.7, 12);
    } });
})();
