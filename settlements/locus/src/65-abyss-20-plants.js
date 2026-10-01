/* ============================== 16X-P. ABYSS — plants the abyssal kit needs that no catalogue had ==============================
   Registered as PLANTs and placed by the buildings through ABYSS.plant (never drawn inside a build). Tagged for the
   eastern-abyss biome (hypertropic · humid · wet · abyssal) plus `use` — the README's edibility / harvestability tag. */
reseed(652001);
(function(){
  var PI=Math.PI;
  /* water-lily pads: a raft of round pads and a few flowers on still, shallow, brackish water (under stilt houses) */
  PLANT({ key:'abyss_lily_pads', name:'Salt-marsh water lilies', climate:'hypertropic', aridity:'humid', tags:{ wet:'wet', abyssal:true, riparian:'yes' }, use:'edible (roots, seeds)',
    w:4, d:4, h:0.3, variants:2, variantNames:['pads','pads in flower'],
    build:function(F){ var n=14; for(var i=0;i<n;i++){ var a=F.rr(0,TAU), r=Math.sqrt(F.rnd())*1.8, x=Math.cos(a)*r, z=Math.sin(a)*r, s=F.rr(0.25,0.45);
        F.cyl(x,0.05,z, s,0.02, 0, F.pick(PAL.paddy), 'leafy');
        if(F.variant && i%4===0){ F.cone(x+0.1,0.07,z, 0.12,0.16, 0, F.pick([PAL.abBrightPink, PASTELC[6]]), 'leafy'); } } } });
  /* potted herbs: a clump of salt-tolerant herbs for a balcony planter (the planter is furniture: abyss_planter) */
  PLANT({ key:'abyss_herbs', name:'Marsh herbs (potted)', climate:'hypertropic', aridity:'humid', tags:{ wet:'mild', abyssal:true, riparian:'no' }, use:'edible (leaves), medicinal',
    w:0.6, d:0.6, h:0.6, variants:2, variantNames:['samphire and mint','flowering'],
    build:function(F){ for(var i=0;i<5;i++){ var a=i/5*TAU, x=Math.cos(a)*0.12, z=Math.sin(a)*0.12; F.cone(x,0,z, 0.1,F.rr(0.3,0.5), [F.rr(-0.2,0.2),0,F.rr(-0.2,0.2)], F.pick(PAL.saltReed.slice(0,2)), 'leafy'); }
      F.blob(0,0,0, 0.22,0.3, 0, F.pick(PAL.shrub), 'leafy'); if(F.variant) for(var k=0;k<4;k++) F.ball(F.rr(-0.15,0.15),F.rr(0.3,0.45),F.rr(-0.15,0.15), 0.05, PAL.abBrightPink, 'leafy'); } });
  /* a climbing creeper trained up a post or a wall (on rich houses and the inn court) */
  PLANT({ key:'abyss_creeper', name:'Salt-flower creeper', climate:'hypertropic', aridity:'humid', tags:{ wet:'mild', abyssal:true, riparian:'both' }, use:'ornamental (flowers dye canvas)',
    w:1.6, d:0.6, h:3.0, variants:1,
    build:function(F){ for(var i=0;i<6;i++){ var x=F.rr(-0.6,0.6), y=F.rr(0.4,2.7); F.blob(x,y,0, F.rr(0.3,0.5),F.rr(0.3,0.5), F.rr(0,PI), F.pick(PAL.shrub), 'leafy');
        if(i%2) F.ball(x+0.1,y+0.3,0.15, 0.12, PAL.abBrightPink, 'leafy'); } F.rod(0,0,0, 0.2,2.9,0, 0.04, PAL.trunk[0], 'bark'); } });
})();
