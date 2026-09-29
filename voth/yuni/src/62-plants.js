/* ============================== 15b. THE PLANT CATALOGUE — SPECIES ==============================
   Every species Yuni uses, registered with the climate band and the preferred aridity it
   wants, so a later Krator world can pull the ones that suit its own valley. The valley of
   Yuni is TEMPERATE / SEMIARID, so most of this list is that pair; the two irrigated species
   (fig, date palm) want more water and only appear along the canal and in courtyards.
   Each build() draws ONE plant through the asset frame, from the frame's own stream.        */
reseed(620001);
(function(){
  function crown(F, lx,ly,lz, R,H, c, n){ for(var i=0;i<(n||3);i++){ var a=F.rnd()*TAU, d=R*0.34*F.rnd();
    BLOB(F.p(lx,lz)[0]+Math.cos(a)*d, F.y+ly+H*0.12*i, F.p(lx,lz)[1]+Math.sin(a)*d, R*(1-0.16*i), H*(0.62-0.08*i), F.rnd()*TAU, i?shade(c,0.07*i):c, 'leafy'); } }

  PLANT({ key:'cypress_yuni', name:'Yuni cypress', climate:'temperate', aridity:'semiarid',
    w:3.4, d:3.4, h:16, variants:3, variantNames:['young','avenue','old'],
    build:function(F){ var h=[9,15,20][F.variant]; F.tree(0,0,'cypress',h); } });

  PLANT({ key:'pine_maritime', name:'Maritime pine', climate:'temperate', aridity:'semiarid',
    w:11, d:11, h:20, variants:3, variantNames:['sapling','hillside','veteran'],
    build:function(F){ var h=[8,16,22][F.variant]; F.tree(0,0,'pine',h); } });

  PLANT({ key:'olive_valley', name:'Valley olive', climate:'temperate', aridity:'arid',
    w:7, d:7, h:7, variants:3, variantNames:['grove tree','orchard tree','ancient trunk'],
    build:function(F){ var h=[4.4,6.0,7.0][F.variant]; F.tree(0,0,'olive',h);
      if(F.variant===2){ for(var i=0;i<3;i++) F.cyl(F.rr(-0.5,0.5), 0, F.rr(-0.5,0.5), 0.26, 1.5, [F.rr(-0.3,0.3),F.rnd()*TAU,0], PAL.trunk[3], 'bark'); } } });

  PLANT({ key:'scrub_thorn', name:'Thorn scrub', climate:'temperate', aridity:'arid',
    w:5, d:5, h:3, variants:3, variantNames:['low','clump','tall'],
    build:function(F){ var s=[1.2,2.0,2.9][F.variant]; F.tree(0,0,'shrub',s);
      for(var i=0;i<F.variant+1;i++) F.tree(F.rr(-s,s), F.rr(-s,s), 'shrub', s*F.rr(0.5,0.85)); } });

  PLANT({ key:'date_palm', name:'Date palm', climate:'temperate', aridity:'arid',
    w:7, d:7, h:17, variants:3, variantNames:['young','bearing','tall'],
    build:function(F){ var h=[7,13,17][F.variant]; F.tree(0,0,'palm',h);
      if(F.variant===1) for(var i=0;i<4;i++){ var a=i/4*TAU; F.ball(Math.cos(a)*h*0.10, h*0.80, Math.sin(a)*h*0.10, h*0.045, PAL.gild[1], 'leafy'); } } });

  PLANT({ key:'fig_courtyard', name:'Courtyard fig', climate:'temperate', aridity:'subhumid',
    w:8, d:8, h:7, variants:2, variantNames:['young','spreading'],
    build:function(F){ var h=[4.5,6.8][F.variant], c=F.pick(PAL.olive);
      F.cyl(0,0,0, 0.26+h*0.03, h*0.42, 0, PAL.trunk[3], 'bark');
      for(var k=0;k<3;k++){ var a=k/3*TAU+F.rnd(); F.rod(0,h*0.38,0, Math.cos(a)*h*0.30, h*0.62, Math.sin(a)*h*0.30, 0.13, PAL.trunk[3], 'bark'); }
      crown(F, 0, h*0.46, 0, h*0.52, h*0.70, shade(c,-0.06), 3); } });

  PLANT({ key:'canal_poplar', name:'Canal poplar', climate:'temperate', aridity:'humid',
    w:4.5, d:4.5, h:19, variants:2, variantNames:['row tree','tall'],
    build:function(F){ var h=[13,19][F.variant], c=F.pick(PAL.pine);
      F.cyl(0,0,0, 0.17+h*0.008, h*0.94, 0, PAL.trunk[1], 'bark');
      for(var i=0;i<4;i++) F.blob(F.rr(-0.4,0.4), h*(0.26+0.17*i), F.rr(-0.4,0.4), h*(0.13-0.012*i), h*(0.24-0.02*i), F.rnd()*TAU, shade(c,0.05*i), 'leafy'); } });

  PLANT({ key:'oleander_hedge', name:'Oleander', climate:'temperate', aridity:'semiarid',
    w:3.2, d:3.2, h:3.2, variants:2, variantNames:['bush','flowering'],
    build:function(F){ var s=[1.5,2.0][F.variant], c=F.pick(PAL.shrub);
      F.blob(0,0.1,0, s, s*1.25, F.rnd()*TAU, c, 'leafy');
      if(F.variant===1) for(var i=0;i<9;i++){ var a=F.rnd()*TAU, d=s*F.rr(0.4,0.95);
        F.ball(Math.cos(a)*d, F.rr(0.7,2.1), Math.sin(a)*d, 0.16, F.pick(PAL.flowerBed), 'leafy'); } } });

  PLANT({ key:'agave_verge', name:'Verge agave', climate:'temperate', aridity:'arid',
    w:2.6, d:2.6, h:2.4, variants:2, variantNames:['rosette','in flower'],
    build:function(F){ var c=F.pick(PAL.shrub);
      for(var i=0;i<11;i++){ var a=i/11*TAU, L=F.rr(0.75,1.2);
        F.beam(0,0.05,0, Math.cos(a)*L, F.rr(0.5,1.1), Math.sin(a)*L, 0.16, 0.06, i%2?c:shade(c,0.09), 'leafy'); }
      if(F.variant===1){ F.cyl(0,0,0, 0.07, 2.2, 0, PAL.trunk[1], 'bark'); F.ball(0,2.2,0, 0.2, PAL.gild[2], 'leafy'); } } });
})();
