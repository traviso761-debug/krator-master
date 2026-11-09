/* ============================== 16N. LOCUS — crops and marsh-edge plants ==============================
   Registered as PLANTs (never built into a building), tagged for the biome: Locus is HYPERTROPIC / HUMID,
   ABYSSAL (the salt-lake floor), RIPARIAN. The farm places the rice through buildPlant.            */
reseed(642001);
(function(){
  var PI=Math.PI;
  /* salt-rice: a 2 x 2 m stand of tussocks, planted in flooded paddies. Yellower than upland rice; heads droop when ripe. */
  PLANT({ key:'salt_rice_stand', name:'Salt-rice stand', climate:'hypertropic', aridity:'humid', tags:{ wet:'wet', abyssal:true, riparian:'yes' },
    w:3.0, d:3.0, h:1.3, variants:4, variantNames:['green, in flower','ripe, heads drooping','green, planted out in rows (field detail)','ripe, planted out in rows (field detail)'],
    build:function(F){
      /* variants 2-3: the outlying paddy blocks' planting, four tussocks in a row-set (~80 triangles, a quarter of the full stand) */
      if(F.variant >= 2){ var rp=F.variant===3;
        for(var q=0;q<4;q++){ var qx=(q%2?0.6:-0.6)+F.rr(-0.15,0.15), qz=(q<2?0.65:-0.65)+F.rr(-0.15,0.15);
          F.cone(qx, 0, qz, F.rr(0.42,0.55), F.rr(0.95,1.2)*(rp?1.05:0.9), [F.rr(-0.08,0.08),0,F.rr(-0.08,0.08)], rp ? (q%2?PADDYC[3]:PADDYC[1]) : (q%2?PADDYC[0]:PADDYC[2]), 'leafy'); }
        return; }
      var v=F.variant, base = v ? PADDYC[3] : PADDYC[0], n=v?11:10;
      for(var i=0;i<n;i++){ var a=i/n*TAU+F.rr(-0.3,0.3), r=F.rr(0.45,1.25), x=Math.cos(a)*r, z=Math.sin(a)*r, h=F.rr(0.9,1.25)*(v?1.05:0.9);
        var c = v ? (i%2 ? PADDYC[3] : PADDYC[1]) : (i%2 ? PADDYC[0] : PADDYC[2]);
        F.cone(x, 0.0, z, F.rr(0.22,0.30), h, [F.rr(-0.12,0.12), 0, F.rr(-0.12,0.12)], c, 'leafy');
        if(v){ F.rod(x, h*0.92, z, x+F.rr(-0.25,0.25), h*0.72, z+F.rr(-0.25,0.25), 0.05, PAL.paintYellow[1], 'leafy'); } }
      F.cone(0, 0.0, 0, F.rr(0.28,0.34), F.rr(1.0,1.2), 0, base, 'leafy');
    } });
  /* salt reed: a marsh-edge tussock of stiff canes with pale seed heads, tolerant of the lake's brine */
  PLANT({ key:'salt_reed', name:'Salt reed', climate:'hypertropic', aridity:'humid', tags:{ wet:'wet', abyssal:true, riparian:'both' },
    w:2.6, d:2.6, h:2.6, variants:2, variantNames:['green tussock','dry, silvered'],
    build:function(F){
      var v=F.variant, n=v?14:12, c1 = v ? PAL.saltReed[2] : PAL.saltReed[0], c2 = v ? PAL.saltReed[3] : PAL.saltReed[1];
      for(var i=0;i<n;i++){ var a=i/n*TAU+F.rr(-0.25,0.25), r=F.rr(0.2,0.9), x=Math.cos(a)*r, z=Math.sin(a)*r, h=F.rr(1.6,2.5), lean=F.rr(0.05,0.2), la=F.rr(0,TAU);
        F.rod(x, 0, z, x+Math.cos(la)*lean*h*0.4, h, z+Math.sin(la)*lean*h*0.4, 0.028, i%2?c1:c2, 'leafy');
        F.box(x+Math.cos(la)*lean*h*0.4, h-0.32, z+Math.sin(la)*lean*h*0.4, 0.09, 0.42, 0.09, [0,la,0.25], v?SALTCRUSTC[0]:PAL.saltReed[4], 'leafy'); }
      F.blob(0, -0.05, 0, 0.9, 0.55, F.rr(0,TAU), shade(c1,-0.2), 'leafy');
    } });
  /* marsh palmetto: a short fan palm of the salt marsh, for the high ground round the city (a stand-in until the eastern-abyss biome kit is bound) */
  PLANT({ key:'marsh_palmetto', name:'Marsh palmetto', climate:'hypertropic', aridity:'humid', tags:{ wet:'wet', abyssal:true, riparian:'both' },
    w:5, d:5, h:4.5, variants:2, variantNames:['single crown','clumped'],
    build:function(F){
      var v=F.variant, cs = v ? [[0,0,3.6],[1.4,0.9,2.6],[-1.2,1.1,2.2]] : [[0,0,4.2]];
      cs.forEach(function(c,k){ var h=c[2], x=c[0], z=c[1], col=F.pick(PAL.palm);
        F.cyl(x,0,z, 0.14+h*0.03, h*0.62, [F.rr(-0.08,0.08), 0, F.rr(-0.08,0.08)], PAL.trunk[2], 'bark');
        for(var f=0;f<9;f++){ var fa=f/9*TAU+F.rr(0,0.4), fr=h*0.36, fy=h*0.62;
          F.beam(x, fy, z, x+Math.cos(fa)*fr, fy+F.rr(-0.25,0.3)*h*0.5, z+Math.sin(fa)*fr, h*0.16, 0.08, f%2?col:shade(col,0.10), 'leafy'); }
        F.ball(x, fy+h*0.04, z, h*0.12, shade(col,-0.15), 'leafy'); });
    } });
})();
