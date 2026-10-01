/* ============================== 16O. LOCUS — the salt-rice farm ==============================
   Six flooded paddies behind mud bunds, fed from an irrigation channel along the back through timber sluices;
   a farmstead on piles to one side with a granary, a threshing floor, a shadoof and the drying racks. The
   rice is a registered PLANT placed through buildPlant, never drawn by the farm itself.
   farm_saltrice_paddies (2026-10-01) is the same farming without the farmstead: eight paddies in a block
   behind one feed channel, a field shelter and a scarecrow pole. 30-layout.js lays nine of them along
   the canal and the river (7b), worked from the farms.                                                  */
reseed(643001);
(function(){
  var PI=Math.PI, GROUP='Salt-rice farm';
  function sheaf(F,x,z,y){ F.cone(x,y,z, 0.32,0.9, [F.rr(-0.1,0.1),0,F.rr(-0.1,0.1)], PADDYC[3], 'leafy'); F.cyl(x,y+0.45,z, 0.14,0.08, 0, TIMBERC[2], 'timber'); }
  ASSET({ key:'farm_saltrice', name:'Salt-rice farm', family:'trade', kit:['locus','abyss'], group:GROUP, kitGroup:{ abyss:'Farming and storage' }, culture:'abyssal-desert', types:['farm','single-family dwelling'],
    districts:['poor'], wealth:[0.1,0.5], w:48, d:38, h:9, variants:2, variantNames:['six paddies, house to the right','six paddies, house to the left'],
    build:function(F){
      var v=F.variant, mud=F.pick(MUDBROWNC), mud2=shade(mud,-0.12), water=SALTWATERC[v], sx = v ? -1 : 1;   /* sx mirrors the plan */
      function X(x){ return x*sx; }
      /* ---- the feed channel along the back: two bunds, water between, salt crust on the lips ---- */
      var cz=-16.2; F.box(0, 0, cz, 46, 0.55, 3.4, 0, mud2, 'adobe');                                                    /* the channel's raised bed */
      F.box(0, 0.30, cz, 45.4, 0.30, 1.9, 0, water, 'plaster');                                                             /* the water, 0.6 m below the bund crest */
      F.box(0, 0.55, cz-1.35, 46, 0.35, 0.7, 0, mud, 'adobe'); F.box(0, 0.55, cz+1.35, 46, 0.35, 0.7, 0, mud, 'adobe');   /* the bunds */
      F.box(0, 0.88, cz-1.35, 46.2, 0.04, 0.5, 0, SALTCRUSTC[1], 'plaster'); F.box(0, 0.88, cz+1.35, 46.2, 0.04, 0.5, 0, SALTCRUSTC[1], 'plaster');
      /* ---- the paddies: 3 columns x 2 rows, bunds 0.6 wide ---- */
      var cols=[-17.6,-7.8,2.0], rows=[-7.2,7.0], PW=9.2, PD=13.4;
      cols.forEach(function(px,ci){ rows.forEach(function(pz,ri){ var x=X(px);
        F.box(x, 0.0, pz, PW+0.8, 0.42, PD+0.8, 0, mud, 'adobe');                                                          /* the bund ring (a raised block; the water sits inside it) */
        F.box(x, 0.30, pz, PW, 0.14, PD, 0, water, 'plaster');
        for(var i=0;i<4;i++) for(var j=0;j<5;j++){ var rx=x+(i-1.5)*PW/4.0, rz=pz+(j-2)*PD/5.0;
          LOCUS.plant(F, 'salt_rice_stand', rx+F.rr(-0.2,0.2), rz+F.rr(-0.2,0.2), F.rr(0,TAU), { variant: (ri===0 && ci!==1) ? 1 : 0 }); }
        /* an inlet from the channel (back row) or from the plot behind (front row): a timber sluice */
        var sz = ri===0 ? cz+1.7 : pz-PD/2-0.5, sxx=x+PW*0.32;
        F.box(sxx, 0.3, sz, 0.9, 0.9, 0.25, 0, F.pick(TIMBERC), 'timber'); [-1,1].forEach(function(s){ F.cyl(sxx+s*0.55, 0.2, sz, 0.07, 1.7, 0, TIMBERC[1], 'timber'); });
        F.box(sxx, 1.2, sz, 0.9, 0.06, 0.6, 0, TIMBERC[2], 'timber'); F.box(sxx, 0.9, sz+0.02, 0.7, 0.55, 0.06, 0, PLANKC[2], 'plank');
        if(ri===0) F.box(sxx, 0.40, cz+1.35, 0.6, 0.06, 0.8, 0, water, 'plaster'); }); });
      /* the lanes between plots and the road-side lane: beaten earth over the bunds' tops */
      F.box(X(-7.8), 0.42, 0, 0.5, 0.03, 28.6, 0, PAL.lane[1], 'adobe'); F.box(X(-17.6), 0.42, 0, 0.5, 0.03, 28.6, 0, PAL.lane[1], 'adobe');
      F.box(X(-7.8), 0.02, 16.2, 32, 0.03, 3.4, 0, PAL.lane[0], 'adobe');                                                    /* the road-side verge */
      /* ---- the farmstead ---- */
      var hx=X(16.0);
      LOCUS.sub(F, 'stilt_poor', hx, 7.6, 0, { variant:1, seed:F.seed*3+1, wealth:0.3 });
      /* granary on piles with rat-guard discs, reed bin, thatch cone */
      var gx=X(20.8), gz=-8.6; [[-0.9,-0.9],[0.9,-0.9],[0.9,0.9],[-0.9,0.9]].forEach(function(p){ F.cyl(gx+p[0], 0, gz+p[1], 0.12, 2.1, 0, PILEC[1], 'bark'); F.cyl(gx+p[0], 1.55, gz+p[1], 0.42, 0.06, 0, PLANKC[0], 'plank'); });
      F.box(gx, 2.05, gz, 2.6, 0.12, 2.6, 0, PLANKC[1], 'plank'); F.lathe('thatch', gx, gz, [[1.15,2.15],[1.25,2.9],[1.1,3.6],[0.9,3.9]], REEDMATC[0], { seg:10 });
      F.mcone('thatch', gx, 3.85, gz, 1.55, 0.05, 1.3, F.pick(THATCHC), 10, { under:true }); LOCUS.ladder(F, gx-0.2, 0, gz+1.6, 0,1, 2.1, TIMBERC[0]);
      /* the threshing floor: a smoothed mud disc with a low rim, sheaves round it */
      var tx=X(14.0), tz=-9.6; F.cyl(tx, 0, tz, 3.4, 0.28, 0, shade(mud,0.10), 'adobe'); F.lathe('adobe', tx, tz, [[3.4,0.28],[3.55,0.42],[3.4,0.55]], mud2, { seg:18 });
      for(var s=0;s<5;s++){ var a=s/5*TAU+0.4; sheaf(F, tx+Math.cos(a)*2.4, tz+Math.sin(a)*2.4, 0.3); }
      F.cyl(tx+0.6, 0.28, tz-0.5, 0.34, 0.5, 0, PLANKC[3], 'plank'); F.box(tx-1.2, 0.28, tz+0.4, 1.6, 0.06, 0.8, PI/5, THATCHC[2], 'thatch');   /* a winnowing basket and a mat */
      /* the shadoof at the channel: a forked post, a counterweighted beam, a bucket on a pole */
      var wx=X(8.6), wy=3.6, wz=cz+2.4; F.cyl(wx-0.25, 0, wz, 0.11, wy, [0,0,0.10], TIMBERC[0], 'timber'); F.cyl(wx+0.25, 0, wz, 0.11, wy, [0,0,-0.10], TIMBERC[0], 'timber');
      F.rod(wx, wy+0.1, wz+3.2, wx, wy+2.4, wz-3.4, 0.09, TIMBERC[2], 'timber'); F.ball(wx, wy+0.1, wz+3.4, 0.55, mud2, 'adobe');
      F.rod(wx, wy+2.35, wz-3.3, wx, 0.9, wz-3.0, 0.03, PAL.people.hair[2], 'timber'); F.lathe('adobe', wx, wz-3.0, [[0.2,0.5],[0.34,0.75],[0.32,1.05]], ADOBEREDC[1], { seg:8 });
      /* drying racks with sheaves hung over them, a row of water jars, the salt heap and its baskets */
      for(var r=0;r<2;r++){ var rx=X(r?22.0:11.2), rz=14.2; F.cyl(rx-1.6,0,rz,0.06,1.9,0,TIMBERC[1],'timber'); F.cyl(rx+1.6,0,rz,0.06,1.9,0,TIMBERC[1],'timber');
        F.rod(rx-1.7,1.75,rz, rx+1.7,1.75,rz, 0.04, TIMBERC[1], 'timber'); for(var k=0;k<6;k++) F.box(rx-1.4+k*0.56, 1.05, rz, 0.34, 0.75, 0.25, 0, k%2?PADDYC[3]:PADDYC[1], 'leafy'); }
      for(var j=0;j<4;j++) F.lathe('adobe', X(21.6), 4.4+j*1.1, [[0.22,0],[0.38,0.35],[0.32,0.8],[0.2,0.95],[0.24,1.05]], ADOBEREDC[j%4], { seg:8 });
      F.blob(X(21.0), -0.05, -12.5, 1.6, 1.0, 0.3, SALTCRUSTC[0], 'rock'); F.cyl(X(18.6), 0, -13.2, 0.4, 0.55, 0, PLANKC[3], 'plank'); F.cyl(X(19.4), 0, -14.0, 0.36, 0.5, 0, PLANKC[2], 'plank');
      F.cyl(X(18.6), 0.55, -13.2, 0.36, 0.12, 0, SALTCRUSTC[1], 'rock');
      /* a sun shade over the yard between house and threshing floor, and the marsh planting */
      LOCUS.sub(F, 'sunshade_poles', X(18.6), -1.4, 0, { variant:0, seed:F.seed*5+2 });
      for(var q=0;q<7;q++) LOCUS.plant(F, 'salt_reed', X(-21.5+q*7.2+F.rr(-0.8,0.8)), cz-2.2-F.rr(0,0.6), F.rr(0,TAU), { variant:q%2 });
      LOCUS.plant(F, 'marsh_palmetto', X(22.6), 9.4, 0.4, { variant:1 }); LOCUS.plant(F, 'marsh_palmetto', X(11.2), 1.2, 2.1, { variant:0 });
      LOCUS.plant(F, 'salt_reed', X(-22.4), 15.4, 0.7, { variant:0 }); LOCUS.plant(F, 'salt_reed', X(5.6), 16.6, 1.9, { variant:1 });
      F.lantern(hx-2.0, 2.4, 11.6, 0.6, 9, 0);
    } });
  /* ---- the paddy block: the outlying fields. Same frame and footprint as the farm (48 x 38, +z the
          lane, -z the feed channel toward the water), so a farmer's field leg lands in a paddy either way. ---- */
  ASSET({ key:'farm_saltrice_paddies', name:'Salt-rice paddies', family:'trade', kit:'locus', group:GROUP, culture:'abyssal-desert', types:['farm'],
    districts:['poor'], wealth:[0.1,0.4], w:48, d:38, h:4, variants:2, variantNames:['eight paddies, shelter to the right','eight paddies, shelter to the left'],
    build:function(F){
      var v=F.variant, mud=F.pick(MUDBROWNC), mud2=shade(mud,-0.12), water=SALTWATERC[v], sx = v ? -1 : 1;
      function X(x){ return x*sx; }
      var cz=-16.2; F.box(0, 0, cz, 46, 0.55, 3.4, 0, mud2, 'adobe');
      F.box(0, 0.30, cz, 45.4, 0.30, 1.9, 0, water, 'plaster');
      F.box(0, 0.55, cz-1.35, 46, 0.35, 0.7, 0, mud, 'adobe'); F.box(0, 0.55, cz+1.35, 46, 0.35, 0.7, 0, mud, 'adobe');
      F.box(0, 0.88, cz-1.35, 46.2, 0.04, 0.5, 0, SALTCRUSTC[1], 'plaster'); F.box(0, 0.88, cz+1.35, 46.2, 0.04, 0.5, 0, SALTCRUSTC[1], 'plaster');
      /* 4 columns x 2 rows; the rice in each is green or ripe by the plot's own hash, so a block is patchy, never uniform */
      var cols=[-16.2,-5.4,5.4,16.2], rows=[-7.2,7.0], PW=9.8, PD=13.4;
      cols.forEach(function(px,ci){ rows.forEach(function(pz,ri){ var x=X(px), ripe = phash(F.seed, ci, ri, 3.3) < 0.45 ? 1 : 0;
        F.box(x, 0.0, pz, PW+0.8, 0.42, PD+0.8, 0, mud, 'adobe');
        F.box(x, 0.30, pz, PW, 0.14, PD, 0, water, 'plaster');
        for(var i=0;i<3;i++) for(var j=0;j<4;j++){ var rx=x+(i-1)*PW/3.0, rz=pz+(j-1.5)*PD/4.0;          /* 12 field-detail stands: the triangle budget */
          LOCUS.plant(F, 'salt_rice_stand', rx+F.rr(-0.2,0.2), rz+F.rr(-0.2,0.2), F.rr(0,TAU), { variant:2+ripe }); }
        var sz = ri===0 ? cz+1.7 : pz-PD/2-0.5, sxx=x+PW*0.32;
        F.box(sxx, 0.3, sz, 0.9, 0.9, 0.25, 0, F.pick(TIMBERC), 'timber'); F.box(sxx, 0.9, sz+0.02, 0.7, 0.55, 0.06, 0, PLANKC[2], 'plank');
        if(ri===0) F.box(sxx, 0.40, cz+1.35, 0.6, 0.06, 0.8, 0, water, 'plaster'); }); });
      [-10.8, 0, 10.8].forEach(function(bx){ F.box(X(bx), 0.42, 0, 0.5, 0.03, 28.6, 0, PAL.lane[1], 'adobe'); });
      F.box(0, 0.02, 16.2, 44, 0.03, 3.4, 0, PAL.lane[0], 'adobe');                                             /* the lane-side verge */
      /* the field shelter at the verge end: four poles and a thatch lean-to, a water jar, a sheaf */
      var hx=X(22.4), hz=14.6; [[-1.1,-1.0],[1.1,-1.0],[1.1,1.0],[-1.1,1.0]].forEach(function(p){ F.cyl(hx+p[0], 0, hz+p[1], 0.08, 2.2+(p[1]<0?0.3:0), 0, PILEC[2], 'bark'); });
      F.box(hx, 2.3, hz, 2.8, 0.12, 2.6, [0,0,0], F.pick(THATCHC), 'thatch'); F.lathe('adobe', hx-0.5, hz+0.3, [[0.2,0],[0.36,0.32],[0.3,0.75],[0.2,0.9]], ADOBEREDC[2], { seg:8 });
      sheaf(F, hx+0.6, hz-0.4, 0);
      /* a scarecrow pole of rags and tin over the middle bund */
      var px0=X(0), pz0=-0.2; F.cyl(px0, 0.42, pz0, 0.06, 3.0, 0, TIMBERC[2], 'timber'); F.rod(px0-0.9, 2.8, pz0, px0+0.9, 2.8, pz0, 0.04, TIMBERC[2], 'timber');
      F.box(px0, 2.0, pz0, 0.7, 0.9, 0.12, 0.3, F.pick(CANVASDYEC), 'canvas'); F.cyl(px0+0.8, 2.3, pz0, 0.12, 0.4, 0, METALC[1], 'metal');
      for(var q=0;q<7;q++) LOCUS.plant(F, 'salt_reed', X(-21.5+q*7.2+F.rr(-0.8,0.8)), cz-2.2-F.rr(0,0.6), F.rr(0,TAU), { variant:q%2 });
    } });
})();
