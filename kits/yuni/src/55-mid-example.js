/* ============================== 16a. ASSETS: reference example ==============================
   PLANNER-OWNED reference asset — the pattern every asset fragment follows.
   One IIFE, reseed at the head, colours only from PAL, geometry only through F. */
reseed(550001);
(function(){
  /* Larabanga-type washed house: battered mud walls under lime wash, buttress-pilasters that rise
     past the parapet as pinnacles, a dark tarred base, triangular vents, toron posts, flat roof. */
  ASSET({ key:'mid_washed_house', name:'Washed pinnacle house', family:'mid', districts:['prosper','market','poor'], wealth:[0.30,0.70], w:11, d:9, h:9, variants:4,
    build:function(F){
      var v=F.variant, two=(v%2===1), H=two?6.4:3.6, W=10, D=8;
      var wash = v<2 ? F.pick(WHITEC) : (v===2 ? F.pick(BLUELC) : F.pick(BLUEDC)), base=PAL.paintBlack[1];
      F.fr8(0,0,0, W,H,D, 0, wash, 'plaster');                                   /* battered body */
      F.box(0,0,0, W+0.12,0.9,D+0.12, 0, base, 'plaster');                        /* tarred base band */
      F.box(0,H-0.02,0, W*0.84-0.5,0.5,D*0.84-0.5, 0, PAL.lane[1], 'adobe');      /* roof deck (inside the parapet) */
      /* buttress-pilasters with pinnacles: corners + two per long side */
      var xs=[-W/2,-W/4,W/4,W/2];
      xs.forEach(function(px,i){ [1,-1].forEach(function(s){ var corner=(i===0||i===3), k=corner?1:0.9, tz=s*(D/2)*(1-0.08*0)+0;
        /* the cone stands on its OWN pier: fr5 tapers about the pier's centre line, so the tip must sit over (px*0.985, tz),
           with a base radius no wider than the pier's top half-width (1.15k x 0.5 / 2 = 0.29k) */
        F.fr5(px*0.985, 0, tz, 1.15*k, H+0.4, 1.15*k, 0, wash, 'plaster'); F.cone(px*0.985, H+0.34, tz, 0.32*k, 1.5*k, 0, wash, 'plaster');
        F.box(px*0.985, 0, tz, 1.22*k, 0.95, 1.22*k, 0, base, 'plaster'); }); });
      /* door (front, off-centre), windows, triangular vents, toron */
      /* THE WALL LEANS BACK (fr8 tapers to 84% at the top): everything set in a face is placed on the face AT ITS OWN HEIGHT */
      function zf(y){ return D/2*(1-0.16*y/H); }  function xf(y){ return W/2*(1-0.16*y/H); }
      var dx = (v%2? -0.5 : 0.5); F.door(dx, zf(0)+0.02, 0,1, 1.15, 2.2, PLANKC[F.variant%4]);
      F.archband('plaster', dx, 0, zf(1.2)+0.16, 0, 1.5, 2.55, 0.35, 0.2, shade(wash,-0.12));
      F.window(dx>0?-3.7:3.7, 2.0, zf(2.0)+0.03, 0,1, 0.8, 0.9);
      if(two){ F.window(-3.6, 5.0, zf(5.0)+0.03, 0,1, 0.8, 1.0); F.window(3.6, 5.0, zf(5.0)+0.03, 0,1, 0.8, 1.0); F.window(xf(4.9)+0.03, 4.9, 0, 1,0, 0.8, 1.0); }
      for(var t=0;t<5;t++){ F.toron(-1.6+t*0.8, H-0.9, zf(H-0.9), 0,1, 0.9); }
      for(var r=0;r<3;r++) for(var c=0;c<=r;c++){ var vy=H-2.0-r*0.45+(two?0:0.5); F.pyr((c-r/2)*0.7+(two?0:-1.0)*0, vy, zf(vy)-0.10, 0.42,0.36,0.3, 0, VOIDC[0], 'dark'); }
      if(F.wealth>0.5) F.box(0, H-0.55, zf(H-0.4)+0.02, W*0.84-1.6, 0.35, 0.12, 0, MOSBLUEC[F.variant%4], 'mosaic');   /* a tile frieze where there is money */
      F.lantern(dx+1.1, 2.5, zf(2.5)+0.35, 0.8, 12, 0);
    } });
})();
