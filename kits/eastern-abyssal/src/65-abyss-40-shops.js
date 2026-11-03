/* ============================== 16X-S. ABYSS — shops ==============================
   Eight trades, two designs each. Open fronts (+z) onto the street, a counter, goods, and a board sign with a
   pictograph (ABYSS.sign). Shops are middle-class: lanterns are UNLIT oil lanterns. Everything that stands in a shop
   (counters, racks, shelves, baskets, crates, the forge, the oven, the scrap stock, the stitching frame) is FURNITURE:
   a catalog piece placed through ABYSS.furn / FURNISH (66-locus-furnish.js). setting:'room' marks a piece standing in
   an open room the interior set (kits/interiors/sets/abyss.js) plans: it gives way to the interiors with ?interiors=1. */
reseed(654001);
(function(){
  var PI=Math.PI, G='Shops';
  /* an open-fronted cabin: three walls, a roof, the front open over a counter. fam/col pick the wall: plank, plaster (pastel), corrugate (salvage) */
  function stall(F, x,y,z, w,d,h, fam, col, roofCol){ var t=0.15;
    F.box(x,y,z-d/2+t/2, w,h,t, 0, col, fam); F.box(x-w/2+t/2,y,z, t,h,d, 0, col, fam); F.box(x+w/2-t/2,y,z, t,h,d, 0, col, fam);
    [-1,1].forEach(function(s){ F.box(x+s*(w/2-0.1),y,z+d/2-0.1, 0.22,h,0.22, 0, F.pick(TIMBERC), 'timber'); });
    ABYSS.corrRoof(F, x,y+h,z, w+0.6,d+1.2, 0.5, roofCol!=null?roofCol:ABYSS.rust(F)); }
  function signPost(F, x,z, pict, h){ var tc=F.pick(TIMBERC); F.cyl(x,0,z, 0.08,h||3.2, 0, tc, 'timber'); F.rod(x,(h||3.2)-0.2,z, x+1.0,(h||3.2)-0.2,z, 0.04, tc, 'timber');
    ABYSS.sign(F, x+0.6,(h||3.2)-0.35,z, 0,1, 1.0,0.7, pict); }

  /* -------------------------------------------------- weapons */
  ASSET({ key:'abyss_shop_weapons', name:'Weaponsmith', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','industry'],
    wealth:[0.3,0.6], w:13, d:12, h:8, variants:2, variantNames:['plank forge-shop','container smithy under a sail'], sim:{ activity:'TRADE', capacity:6 },
    build:function(F){ var v=F.variant;
      if(v===0){ var H=0.9; ABYSS.platform(F, -6,6, -5.5,1.5, H);
        stall(F, -1.2,H,-2.2, 8,5.6,3.0, 'plank', F.pick(PLANKC));
        ABYSS.furn(F, 'abyss_counter', -1.2,0.2, 0, { ly:H, setting:'room' }); ABYSS.furn(F, 'abyss_rack_spears', -2.8,-4.4, 0, { ly:H, setting:'room' }); ABYSS.furn(F, 'abyss_rack_spears', 0.6,-4.4, 0, { ly:H, setting:'room' });
        /* the forge stands outside on the ground under its own corrugated lean-to (fire away from the planks) */
        [[3.6,1.0],[5.8,1.0]].forEach(function(p){ F.cyl(p[0],0,p[1]+3.0, 0.08,2.8, 0, F.pick(TIMBERC), 'timber'); });
        ABYSS.corrRoof(F, 4.7,2.8,3.4, 3.2,3.6, 0.5, ABYSS.rust(F)); ABYSS.furn(F, 'abyss_forge', 4.7,3.6, PI/2, { setting:'room' });
        ABYSS.furn(F, 'abyss_crates', 4.8,-3.0, 0, { variant:2 });
        LOCUS.stair(F, -3.6, 1.5+H*1.15, 0,-1, H, 1.2); ABYSS.sign(F, -1.2,H+3.3,0.62, 0,1, 1.6,0.8, 'blade'); ABYSS.lantern(F, 1.6,H+2.6,0.4, false); }
      else { F.box(0,0,-0.5, 12,0.15,10, 0, PAL.abSalt, 'plaster');
        ABYSS.vessel(F, 'container', -1.5,0.15,-3.6, { len:6.1, col:ABYSS.cont(F) });
        F.box(-1.5,2.75,-1.9, 6.1,0.06,1.6, [0.9,0,0], ABYSS.rust(F), 'corrugate');                     /* the side wall, hinged up as an awning */
        [-4.2,1.2].forEach(function(x){ F.rod(x,0.15,-1.6, x,2.8,-0.9, 0.04, STEELDC[0], 'rust'); });
        ABYSS.furn(F, 'abyss_counter', -1.5,-0.6, 0, { ly:0.15 }); ABYSS.furn(F, 'abyss_rack_spears', -5.0,1.2, PI/2, { ly:0.15 });
        LOCUS.pole(F, 1.8,1.0, 4.4, 0.09); LOCUS.pole(F, 5.6,1.0, 4.0, 0.09); LOCUS.pole(F, 5.6,4.2, 4.4, 0.09); LOCUS.pole(F, 1.8,4.2, 4.0, 0.09);
        ABYSS.sail(F, [[1.8,4.4,1.0],[5.6,4.0,1.0],[5.6,4.4,4.2],[1.8,4.0,4.2]], PAL.abSailOrange, { swoop:0.5, band:PAL.abSailOrange, bandW:0.5 });
        ABYSS.furn(F, 'abyss_forge', 3.7,2.6, 0, { ly:0.15, setting:'room' });   /* the forge under the sail: the smithy abyss_shop_weapons#1 plans */ ABYSS.furn(F, 'abyss_water_butt', 5.2,-1.5, 0, { ly:0.15 });
        signPost(F, -5.4,4.0, 'blade'); }
    } });

  /* -------------------------------------------------- armour */
  ASSET({ key:'abyss_shop_armor', name:'Armourer', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','industry'],
    wealth:[0.4,0.7], w:12, d:12, h:8, variants:2, variantNames:['pastel shop with a shield wall','tin-clad shed'], sim:{ activity:'TRADE', capacity:6 },
    build:function(F){ var v=F.variant;
      if(v===0){ var c=F.pick(PASTELC), H=0.8; F.box(0,0,-1, 11,H,9, 0, PAL.abRubble, 'rubble');
        stall(F, 0,H,-2.6, 9,5.4,3.4, 'plaster', c, ABYSS.rust(F)); F.box(0,H,-2.6+2.6, 9.0,0.45,0.2, 0, shade(c,-0.3), 'plaster');
        ABYSS.furn(F, 'abyss_shield_wall', 0,-5.0, 0, { ly:H, setting:'room' }); ABYSS.furn(F, 'abyss_armor_stand', -3.0,-1.6, 0, { ly:H, setting:'room' }); ABYSS.furn(F, 'abyss_armor_stand', 3.0,-1.6, 0, { ly:H, variant:1, setting:'room' });
        ABYSS.furn(F, 'abyss_counter', 0,1.2, 0, { ly:H });
        /* a striped canvas awning on two poles over the front */
        [-4.2,4.2].forEach(function(x){ LOCUS.pole(F, x,3.3, 3.2, 0.07); }); LOCUS.stripes(F, [-4.6,H+3.3,0.3],[4.6,H+3.3,0.3],[4.6,3.2,3.3],[-4.6,3.2,3.3], 8, CANVASC[0], PAL.abSailRed, { sag:0.2 });
        LOCUS.stair(F, 0, 3.5+H*1.15, 0,-1, H, 2.4); ABYSS.sign(F, 3.2,H+2.9,0.12, 0,1, 1.2,0.8, 'shield'); }
      else { var H1=1.0; ABYSS.platform(F, -5.5,5.5, -5.5,2.5, H1);
        F.box(0,H1,-2.4, 8,3.0,5, 0, ABYSS.rust(F), 'corrugate'); ABYSS.tinClad(F, { box:[0,H1,-2.4,8,3.0,5], faces:'flr' });
        F.box(0,H1+0.1,0.13, 3.4,2.6,0.1, 0, VOIDC[1], 'dark'); ABYSS.trim(F, 0,H1+0.1,0.15, 0,1, 3.4,2.6);
        ABYSS.corrRoof(F, 0,H1+3.0,-2.4, 8.6,5.8, 0.6, ABYSS.rust(F));
        ABYSS.furn(F, 'abyss_armor_stand', -2.8,1.4, 0, { ly:H1, variant:1 }); ABYSS.furn(F, 'abyss_armor_stand', 2.8,1.4, 0, { ly:H1 }); ABYSS.furn(F, 'abyss_armor_stand', -1.6,1.6, 0, { ly:H1 });
        ABYSS.furn(F, 'abyss_shield_wall', 4.4,0, -PI/2, { ly:H1 });
        LOCUS.stair(F, 0, 2.5+H1*1.15, 0,-1, H1, 2.0); ABYSS.sign(F, 0,H1+3.75,0.2, 0,1, 1.8,0.8, 'shield'); ABYSS.lantern(F, 2.2,H1+2.7,0.5, false); }
    } });

  /* -------------------------------------------------- general goods */
  ASSET({ key:'abyss_shop_general', name:'General goods', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop'],
    wealth:[0.2,0.6], w:13, d:12, h:9, variants:2, variantNames:['container store with an awning','two-storey cabin under umbrellas'], sim:{ activity:'TRADE', capacity:8 },
    build:function(F){ var v=F.variant;
      if(v===0){ var H=0.7; ABYSS.platform(F, -6,6, -5.5,2.0, H);
        ABYSS.vessel(F, 'container', 0,H,-3.8, { len:12.2, col:ABYSS.cont(F), win:[[-4.0,1.5]], door:'side', doorAt:1.8 });
        F.box(-1.0,H+0.2,-2.55, 3.4,2.0,0.05, 0, VOIDC[1], 'dark');                                     /* the shop hatch */
        [-5.6,5.6].forEach(function(x){ LOCUS.pole(F, x,1.7, H+2.6, 0.08); });
        LOCUS.stripes(F, [-5.9,H+2.7,-2.5],[5.9,H+2.7,-2.5],[5.9,H+2.5,1.7],[-5.9,H+2.5,1.7], 10, PAL.abBrightYellow, CANVASC[2], { sag:0.15 });
        ABYSS.furn(F, 'abyss_counter', -1.0,-1.6, 0, { ly:H }); ABYSS.furn(F, 'abyss_hanging_goods', 3.6,-1.8, 0, { ly:H });
        ABYSS.furn(F, 'abyss_crates', -4.4,0.4, 0, { ly:H }); ABYSS.furn(F, 'abyss_crates', 4.2,0.6, 0.3, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_crates', 0,4.2, 0, { variant:2 });
        LOCUS.stair(F, -1.0, 2.0+H*1.15, 0,-1, H, 1.6); ABYSS.sign(F, -4.6,H+2.55,-2.52, 0,1, 1.4,0.7, 'sack'); ABYSS.lantern(F, 2.0,H+2.2,0.0, false); }
      else { var c=F.pick([PAL.abBrightTeal, PAL.abBrightYellow, PASTELC[3]]), W=8, D=6, FH=3.0;
        F.box(-1,0,-3, W,FH*2,D, 0, c, 'plaster'); F.box(-1,0,-3, W+0.06,0.5,D+0.06, 0, shade(c,-0.3), 'plaster'); F.box(-1,FH,-3, W+0.1,0.18,D+0.1, 0, shade(c,-0.3), 'relief');
        F.box(-1,FH*2,-3, W+0.4,0.2,D+0.4, 0, shade(c,-0.3), 'relief');
        F.box(-1,0.05,0.02, 5.2,2.6,0.06, 0, VOIDC[1], 'dark'); [-3.6,1.6].forEach(function(x){ F.window(x,FH+1.6,0.02, 0,1, 1.0,1.4); }); ABYSS.balcony(F, -1,FH+0.02,0, 0,1, 3.0,0.9);
        ABYSS.mural(F, -1-W/2-0.02, FH*1.1, -3, -1,0, 3.4,2.4);
        ABYSS.furn(F, 'abyss_counter', -1,1.2, 0); ABYSS.furn(F, 'abyss_hanging_goods', -1,-1.5, 0, { setting:'room' });
        ABYSS.furn(F, 'abyss_umbrella_canopy', 0.5,1.5, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_crates', 4.8,-3.6, 0, { variant:0 }); ABYSS.furn(F, 'abyss_crates', -5.4,4.2, 0, { variant:1 });
        ABYSS.sign(F, 1.8,2.95,0.06, 0,1, 1.4,0.7, 'sack'); }
    } });

  /* -------------------------------------------------- food */
  ASSET({ key:'abyss_shop_food', name:'Cookshop and fish stall', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','tavern/inn'],
    wealth:[0.2,0.6], w:13, d:12, h:7, variants:2, variantNames:['stall under a sail with an oven','drum kitchen with tables'], sim:{ activity:'TRADE', capacity:12 },
    build:function(F){ var v=F.variant;
      if(v===0){ F.box(0,0,0, 12,0.12,11, 0, PAL.abSalt, 'plaster');
        var C=[[-5.5,4.6,-4.8],[5.5,4.0,-4.8],[5.5,4.6,3.8],[-5.5,4.0,3.8]]; C.forEach(function(c){ LOCUS.pole(F, c[0],c[2], c[1], 0.09, null, true); LOCUS.guy(F, c[0],c[1]-0.2,c[2], c[0]*1.1,c[2]*1.25); });
        ABYSS.sail(F, C, PAL.abSailOrange, { swoop:0.9, band:PAL.abSailOrange });
        var rm={ setting:'room' };   /* the open kitchen and stall under the sail are rooms the interior set plans */
        ABYSS.furn(F, 'abyss_clay_oven', -3.8,-3.0, 0, rm); ABYSS.furn(F, 'abyss_smoking_rack', 2.6,-3.6, 0, rm); ABYSS.furn(F, 'abyss_counter', 0,0.6, 0, { ly:0.12, setting:'room' });
        ABYSS.furn(F, 'abyss_baskets', -3.2,2.4, 0, { ly:0.12, setting:'room' }); ABYSS.furn(F, 'abyss_baskets', 3.0,2.4, 0, { ly:0.12, setting:'room' }); ABYSS.furn(F, 'abyss_water_butt', 5.0,-1.0, 0, rm);
        signPost(F, -5.6,5.2, 'fish', 3.0); }
      else { var H=0.8; ABYSS.platform(F, -6,6, -5.5,5.0, H);
        var D=ABYSS.vessel(F, 'drum', -2.2,H,-3.6, { r:1.5, len:6.0, col:ABYSS.rust(F), win:[[-1.4,0],[1.4,0]], awning:PAL.abBrightTeal });
        F.cyl(-4.6,D.axisY+1.0,-3.6, 0.15,2.2, 0, STEELDC[0], 'rust');                                  /* the stove flue */
        ABYSS.furn(F, 'abyss_counter', -2.2,-1.4, 0, { ly:H, variant:0 });
        ABYSS.furn(F, 'abyss_table_stools', -3.4,1.8, 0, { ly:H }); ABYSS.furn(F, 'abyss_table_stools', 0.4,2.4, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_table_stools', 3.6,1.0, 0, { ly:H });
        ABYSS.furn(F, 'abyss_smoking_rack', 3.8,-3.6, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_baskets', 3.6,-1.4, 0, { ly:H });
        ABYSS.furn(F, 'abyss_lantern_string', 0,4.6, 0, { ly:H, variant:0 });
        ABYSS.railRect(F, -6,6,-5.5,5.0, H, [['f',-1,1]]); LOCUS.stair(F, 0, 5.0+H*1.15, 0,-1, H, 1.4);
        ABYSS.sign(F, -2.2,D.top+0.95,-3.6+1.55, 0,1, 1.4,0.8, 'fish'); }
    } });

  /* -------------------------------------------------- alchemist */
  ASSET({ key:'abyss_shop_alchemy', name:'Alchemist', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop'],
    wealth:[0.4,0.8], w:12, d:12, h:11, variants:2, variantNames:['tank house','twin tanks on a gantry'], sim:{ activity:'TRADE', capacity:4 },
    build:function(F){ var v=F.variant, H=0.9;
      ABYSS.platform(F, -5.5,5.5, -5.5,3.5, H);
      var glass=F.pick([PAL.abCrystal, 0x7ad07a, 0xd07ab8]);
      ABYSS.vessel(F, 'tank', -1.0,H,-1.8, { r:3.0, h:5.0, col:ABYSS.rust(F), win:[[PI/2+0.6,2.6]], port:true, glass:glass, door:PI/2, balcony:v?null:5.0, ladder:v?null:PI*1.1 });
      F.cyl(-2.4,H+5.3,-2.8, 0.22,3.9, 0, STEELDC[0], 'rust'); F.cone(-2.4,H+9.2,-2.8, 0.45,0.4, 0, STEELDC[1], 'rust');          /* the flue */
      if(v===0){ var pc2=STEELDC[0]; F.tube('rust', [{x:0.6,y:H+5.3,z:-1.0,r:0.16},{x:0.9,y:H+6.1,z:-0.4,r:0.16},{x:1.9,y:H+6.2,z:0.3,r:0.16},{x:2.9,y:H+5.4,z:0.6,r:0.16},{x:3.1,y:H+3.6,z:0.6,r:0.16},{x:3.1,y:H+0.2,z:0.6,r:0.16}], pc2, { seg:8, cap:true });
        F.cyl(3.1,H,0.6, 0.26,0.3, 0, STEELDC[1], 'rust'); }                                                 /* an elbowed pipe off the tank roof down to a sump */
      /* (the shelf of jars that stood inside the tank is gone: the tank is a room the interior set plans and furnishes) */
      ABYSS.furn(F, 'abyss_counter', -1.0,2.0, 0, { ly:H });
      FURNISH('abyss_counter_crystal', -2.3,H+1.1,2.0, 0);                                                  /* the small crystal on the counter */
      if(v===1){ ABYSS.vessel(F, 'tank', 3.6,H,-2.6, { r:1.6, h:7.0, col:ABYSS.rust(F), win:[[PI/2,3.5],[PI/2,5.6]], port:true, glass:glass });
        F.box(1.8,H+4.0,-2.2, 1.8,0.12,1.0, 0, STEELDC[0], 'rust'); LOCUS.rail(F, 1.6,-1.8, 2.8,-1.8, H+4.1, STEELDC[0], 0.9);
        LOCUS.ladder(F, 3.6+1.9,H,-2.6, 1,0, 7.0, STEELDC[0]); F.edome(3.6,H+7.0,-2.6, 1.6,1.0,1.6, 0, PAL.abTin, 'tinmirror');
        ABYSS.cables(F, [3.6,H+8.0,-2.6], [-1.0,H+5.8,-1.8], 0.5, 1); }
      else { ABYSS.furn(F, 'abyss_shelf_jars', 3.8,-1.0, -PI/2, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_crates', 3.6,2.2, 0, { ly:H, variant:2 }); }
      LOCUS.stair(F, 2.0, 3.5+H*1.15, 0,-1, H, 1.2); ABYSS.sign(F, -1.0,H+3.2,1.3, 0,1, 1.3,0.8, 'flask');
      ABYSS.lantern(F, 1.5,H+2.4,1.6, false); } });

  /* -------------------------------------------------- salvage dealer and tinker */
  ASSET({ key:'abyss_shop_salvage', name:'Salvage dealer and tinker', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','industry'],
    wealth:[0.2,0.6], w:16, d:14, h:10, variants:2, variantNames:['scrap yard and container office','tank office and a hoist derrick'], sim:{ activity:'TRADE', capacity:6 },
    build:function(F){ var v=F.variant;
      F.box(0,0,0, 15,0.08,13, 0, PAL.abRubble, 'rubble');
      /* the yard fence: corrugated sheets on posts, open at the front gate */
      [[-7.4,-6.4,-7.4,6.4],[7.4,-6.4,7.4,6.4],[-7.4,-6.4,7.4,-6.4],[-7.4,6.4,-2,6.4],[2,6.4,7.4,6.4]].forEach(function(s){ var L=Math.hypot(s[2]-s[0],s[3]-s[1]), n=Math.max(1,Math.round(L/1.8));
        for(var i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, x0=mix(s[0],s[2],t0), z0=mix(s[1],s[3],t0), x1=mix(s[0],s[2],t1), z1=mix(s[1],s[3],t1);
          F.box((x0+x1)/2,0,(z0+z1)/2, L/n+0.05,F.rr(1.6,2.1),0.06, Math.atan2(x1-x0,z1-z0)+PI/2, ABYSS.rust(F), 'corrugate'); } });
      /* sorted scrap: drums, sheet stacks, pipe bundles, a heap of cans */
      /* FURNITURE: the catalog's abyss_scrap_stock, harvested from here (drums standing with a lying stack behind them, the
         sheet stack, the pipe bundle, the heap of cans). The inline drawing took 26 colours from F.rnd(): burnt, so the
         yard's container, antennas and derrick keep their colours. */
      ABYSS.burn(F, 26);
      FURNISH('abyss_scrap_stock', -5.35,0,-5.8, PI, { v:2 }); FURNISH('abyss_scrap_stock', -1.5,0.08,-5.2, 0, { v:0 });
      FURNISH('abyss_scrap_stock', -0.5,0.08,-2.6, 0, { v:1 }); FURNISH('abyss_scrap_stock', 5.2,0,-4.6, 0, { v:3 });
      if(v===0){ ABYSS.vessel(F, 'container', 3.4,0.08,-0.2, { len:6.1, yaw:PI/2, col:ABYSS.cont(F), win:[[1.2,1.5,-1]], door:'side', doorAt:-1.4 });
        ABYSS.antenna(F, 3.4,2.8,0.8, 'dish', { r:0.7 }); ABYSS.antenna(F, 3.4,2.8,-2.2, 'dish', { r:0.5, face:PI }); ABYSS.antenna(F, 3.0,2.8,-0.6, 'mast', { h:3.2 });
        ABYSS.cables(F, [3.0,5.8,-0.6], [-7.3,3.0,6.3], 0.9, 3); F.cyl(-7.3,0,6.3, 0.08,3.2, 0, F.pick(TIMBERC), 'timber');
        ABYSS.billboard(F, -4.2,2.0,6.5, 0,1, 3.6,1.6); ABYSS.furn(F, 'abyss_counter', 0.6,2.0, 0); }
      else { ABYSS.vessel(F, 'tank', 4.0,0.08,-1.0, { r:2.3, h:3.6, col:ABYSS.rust(F), win:[[PI*0.6,1.8]], door:PI*0.5 });
        ABYSS.antenna(F, 4.0,4.4,-1.0, 'mast', { h:2.6 });
        /* the hoist derrick: an A-frame of pipe with a boom and a hanging hook over the sheet stack */
        F.rod(-3.4,0,-1.0, -2.0,6.5,-3.2, 0.12, STEELDC[0], 'rust'); F.rod(-0.6,0,-1.0, -2.0,6.5,-3.2, 0.12, STEELDC[0], 'rust'); F.rod(-2.0,0,-6.0, -2.0,6.5,-3.2, 0.1, STEELDC[0], 'rust');
        F.rod(-2.0,6.3,-3.2, -1.5,5.6,-5.2, 0.08, STEELDC[1], 'rust'); F.rod(-1.5,5.6,-5.2, -1.5,2.0,-5.2, 0.015, PAL.paintBlack[0], 'rust'); F.box(-1.5,1.7,-5.2, 0.2,0.3,0.1, 0, STEELDC[2], 'rust');
        ABYSS.furn(F, 'abyss_counter', 1.0,2.6, 0); ABYSS.furn(F, 'abyss_crates', -4.6,3.6, 0, { variant:0 }); }
      signPost(F, 2.4,6.9, 'gear', 3.4); ABYSS.lantern(F, 1.8,2.6,2.0, false); } });

  /* -------------------------------------------------- salt and fish merchant */
  ASSET({ key:'abyss_shop_salt', name:'Salt and fish merchant', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop'],
    wealth:[0.2,0.6], w:14, d:12, h:7, variants:2, variantNames:['salt cones under a sail','reed salt-shed on a deck'], sim:{ activity:'TRADE', capacity:8 },
    build:function(F){ var v=F.variant;
      if(v===0){ F.box(0,0,0, 13,0.1,11, 0, PAL.abSalt, 'plaster');
        var C=[[-6,4.8,-5],[0,5.4,-5.2],[6,4.8,-5],[6,4.2,4.4],[-6,4.2,4.4]]; C.forEach(function(c){ LOCUS.pole(F, c[0],c[2], c[1], 0.09, null, true); });
        ABYSS.sail(F, C, CANVASC[2], { swoop:0.8, band:PAL.abSailRed, bandW:0.6 });
        /* the open shop under the sail is a room the interior set plans: its pieces are placeholders until ?interiors=1 */
        [[-3.6,-2.6],[-1.2,-3.0],[1.4,-2.7],[3.8,-2.4],[-2.4,-0.4],[0.2,-0.6]].forEach(function(p,i){ ABYSS.furn(F, 'abyss_salt_cone', p[0],p[1], 0, { ly:0.1, variant:i%3===2?1:0, setting:'room' }); });
        ABYSS.furn(F, 'abyss_smoking_rack', 3.6,0.4, 0, { ly:0.1, setting:'room' }); ABYSS.furn(F, 'abyss_baskets', -1.0,2.6, 0, { ly:0.1, setting:'room' }); ABYSS.furn(F, 'abyss_counter', 2.6,3.0, 0, { ly:0.1, setting:'room' });
        signPost(F, -6.4,5.4, 'salt', 3.0); }
      else { var H=1.1; ABYSS.platform(F, -6.5,6.5, -5.5,2.5, H);
        LOCUS.matWall(F, 0, H, -5.0, 10, 3.0, 0,-1); LOCUS.matWall(F, -5.0, H, -2.6, 4.8, 3.0, -1,0); LOCUS.matWall(F, 5.0, H, -2.6, 4.8, 3.0, 1,0);
        F.pyr(0, H+3.0, -2.6, 12, 2.4, 6.8, 0, F.pick(THATCHC), 'thatch');
        [-1,1].forEach(function(s){ ABYSS.furn(F, 'abyss_salt_cone', s*2.6,-2.6, 0, { ly:H, variant:s>0?1:0, setting:'room' }); }); ABYSS.furn(F, 'abyss_salt_cone', 0,-3.2, 0, { ly:H, setting:'room' });
        ABYSS.furn(F, 'abyss_counter', 0,0.8, 0, { ly:H }); ABYSS.furn(F, 'abyss_baskets', 3.8,1.4, 0, { ly:H });
        ABYSS.furn(F, 'abyss_smoking_rack', -4.0,4.4, 0, { variant:1 }); ABYSS.furn(F, 'abyss_smoking_rack', 0,4.6, 0); ABYSS.furn(F, 'abyss_smoking_rack', 4.0,4.4, 0, { variant:1 });
        LOCUS.stair(F, -3.6, 2.5+H*1.15, 0,-1, H, 1.2); ABYSS.sign(F, 0,H+3.0+0.2,-2.6+3.45, 0,1, 1.6,0.8, 'salt'); }
    } });

  /* -------------------------------------------------- sailmaker */
  ASSET({ key:'abyss_shop_sailmaker', name:'Sail, canvas and rope maker', family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','industry'],
    wealth:[0.3,0.7], w:16, d:12, h:9, variants:2, variantNames:['long shed under a swooping sail','canvas loft with drying lines'], sim:{ activity:'TRADE', capacity:6 },
    build:function(F){ var v=F.variant;
      if(v===0){ F.box(0,0,0, 15,0.1,11, 0, PAL.abSalt, 'plaster');
        var C=[[-7,5.6,-4.8],[7,5.6,-4.8],[7,4.4,4.6],[-7,4.4,4.6]]; C.forEach(function(c){ LOCUS.pole(F, c[0],c[2], c[1], 0.1, null, PAL.abGild); });
        LOCUS.pole(F, 0,0, 6.4, 0.13, null, PAL.abGild);
        ABYSS.sail(F, C, PAL.abSailOrange, { swoop:1.2, peak:1.8, band:PAL.abSailOrange, bandW:0.8 });
        /* a sail stretched on a frame for stitching, and the bolts and rope */
        /* (the catalog's abyss_sail_frame, harvested from here; the two posts took two colours from F.rnd(): burnt). The loft
           and the counter under the sail are rooms the interior set plans: placeholders until ?interiors=1 */
        ABYSS.burn(F, 2); FURNISH('abyss_sail_frame', -2.0,0,-2.6, 0, { setting:'room' });
        ABYSS.furn(F, 'abyss_canvas_bolts', 2.6,-2.0, 0, { ly:0.1, setting:'room' }); ABYSS.furn(F, 'abyss_canvas_bolts', 4.6,0.6, PI/2, { ly:0.1, setting:'room' }); ABYSS.furn(F, 'abyss_counter', -1.0,2.4, 0, { ly:0.1, setting:'room' });
        ABYSS.furn(F, 'abyss_bench', -5.0,0.8, PI/2, { ly:0.1, setting:'room' }); signPost(F, 5.6,5.4, 'sail', 3.2); }
      else { var H=0.8, c=F.pick(PASTELC); ABYSS.platform(F, -7.5,7.5, -5.5,2.0, H);
        F.box(-2.5,H,-3.2, 8,5.8,4.4, 0, F.pick(PLANKC), 'plank'); F.box(-2.5,H+5.8,-3.2, 8.6,0.2,5.0, 0, ABYSS.rust(F), 'corrugate');
        F.box(-2.5,H+0.05,-0.98, 3.6,2.5,0.05, 0, VOIDC[1], 'dark'); F.box(-2.5,H+3.3,-0.98, 2.4,1.8,0.05, 0, VOIDC[1], 'dark');   /* the shop front and the loft door */
        F.rod(-2.5,H+5.6,-0.9, -2.5,H+5.6,0.4, 0.08, F.pick(TIMBERC), 'timber'); F.rod(-2.5,H+5.5,0.4, -2.5,H+3.0,0.4, 0.015, PAL.people.hair[2], 'timber');   /* the loft hoist */
        /* drying lines with hung canvas between the loft and two posts */
        [3.0,6.8].forEach(function(x){ LOCUS.pole(F, x,1.4, H+4.2, 0.08); });
        [-0.2,1.0].forEach(function(z,i){ F.rod(1.5,H+3.9-i*0.4,-1.6+z, 6.8,H+3.9-i*0.4,1.4, 0.015, PAL.people.hair[2], 'timber');
          for(var k=0;k<3;k++){ var x=2.4+k*1.5, z2=mix(-1.6+z,1.4,(x-1.5)/5.3); LOCUS.hang(F, x-0.6,z2, x+0.6,z2+0.2, H+3.85-i*0.4, 1.8, F.pick([PAL.abSailOrange, PAL.abSailRed, CANVASC[0], PAL.abBrightTeal])); } });
        ABYSS.furn(F, 'abyss_canvas_bolts', -2.5,0.6, 0, { ly:H }); ABYSS.furn(F, 'abyss_crates', 5.6,-3.8, 0, { ly:H, variant:1 });
        LOCUS.stair(F, -5.2, 2.0+H*1.15, 0,-1, H, 1.2); ABYSS.sign(F, -2.5,H+2.95,-0.9, 0,1, 1.6,0.7, 'sail'); ABYSS.lantern(F, 0.2,H+2.5,-0.6, false); }
    } });

  /* -------------------------------------------------- builders' merchant and timber yard (2026-10, for Mungo) */
  /* The abyssal builders' merchant: a container office with a counter on a plank deck, and a yard of the eastern-abyss
     biome's timber (seal-tree and scale-tree poles, sawn planks, the felled logs the lumberjacks deliver), bundled mat reed
     for thatch, salvaged corrugated sheet, drums, clay bricks and lime, a saw bench or a saw pit. Every loose thing is a
     catalog piece (kits/catalog: job_pole_rack, job_plank_stack, job_saw_bench in the Jobs file; abyss_reed_bundles,
     abyss_brick_stack, abyss_lime_sacks, abyss_scrap_stock, abyss_crates in the eastabyss file; pa_drum). The yard is
     open ground; the shop (the deck under the sail, or the plank shop-front) and the container store are the rooms the
     interior set plans (abyss_shop_builder, abyss_shop_builder#1). Seeds from 654901. */
  reseed(654901);
  /* the board's pictograph: a frame-saw blade with its teeth and handle over a sawn plank (ABYSS.sign has no saw) */
  function sawSign(F, x,y,z, nx,nz, w,h){ ABYSS.sign(F, x,y,z, nx,nz, w,h, 'saw'); var yaw=Math.atan2(nx,nz), px=-nz, pz=nx, o=0.08, s=Math.min(w,h)*0.8;
    function bx(u,v,ww,hh,c,r,fam){ F.box(x+px*u+nx*o, y+v-hh/2, z+pz*u+nz*o, ww,hh,0.04, r==null?yaw:[0,yaw,r], c, fam||'metal'); }
    bx(0.08*s, 0.12*s, 0.62*s, 0.16*s, PAL.abTin);                                                     /* the blade */
    for(var k=0;k<6;k++) bx(-0.18*s+k*0.1*s, 0.03*s, 0.06*s, 0.06*s, PAL.abTin, PI/4);                  /* its teeth */
    bx(-0.34*s, 0.14*s, 0.14*s, 0.26*s, PAL.abSailRed, 0, 'timber');                                    /* the handle */
    bx(0, -0.24*s, 0.8*s, 0.1*s, 0xc9a974, 0, 'plank'); }                                               /* the plank */
  /* a yard fence of corrugated sheets on the line a..b (the salvage dealer's), open where the caller leaves a gap */
  function sheetFence(F, a, b){ var L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L/1.8));
    for(var i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, x0=mix(a[0],b[0],t0), z0=mix(a[1],b[1],t0), x1=mix(a[0],b[0],t1), z1=mix(a[1],b[1],t1);
      F.box((x0+x1)/2,0,(z0+z1)/2, L/n+0.05,F.rr(1.6,2.1),0.06, Math.atan2(x1-x0,z1-z0)+PI/2, ABYSS.rust(F), 'corrugate'); } }
  /* the yard gate on the street: two posts, a beam, the sign hung under it (a cart passes under the board, 2.8 m) */
  function yardGate(F, x0,x1, z){ var tc=F.pick(TIMBERC), xm=(x0+x1)/2;
    LOCUS.pole(F, x0,z, 4.0, 0.12, tc); LOCUS.pole(F, x1,z, 4.0, 0.12, tc); F.box(xm,3.8,z, x1-x0+0.5,0.2,0.22, 0, tc, 'timber');
    [-0.8,0.8].forEach(function(u){ F.rod(xm+u,3.8,z, xm+u,3.55,z, 0.015, PAL.people.hair[2], 'timber'); });
    sawSign(F, xm,3.15,z+0.02, 0,1, 2.2,0.8); }
  ASSET({ key:'abyss_shop_builder', name:"Builders' yard", family:'trade', kit:'abyss', group:G, culture:'abyssal-desert', types:['market/shop','industry'],
    wealth:[0.3,0.6], w:18, d:14, h:8, variants:2, variantNames:['container office under a sail, timber racks and a saw bench','plank shop-front on a container, a hoist derrick over the log landing'],
    sim:{ activity:'TRADE', capacity:6 },
    build:function(F){ var v=F.variant;
      if(v===0){ var H=0.6;
        F.box(0,0,0, 17.6,0.08,13.6, 0, PAL.abRubble, 'rubble');
        /* the office: a 6.1 m container (the store) at the back of a plank deck, the counter in front under a swooping sail,
           a plank wall closing the deck's left side */
        ABYSS.platform(F, -8.6,-0.8, -6.6,0.6, H);
        ABYSS.vessel(F, 'container', -4.7,H,-5.0, { len:6.1, col:ABYSS.cont(F), win:[[-1.8,1.5]], door:'side', doorAt:1.4 });
        F.box(-8.54,H,-1.55, 0.12,2.6,4.3, 0, F.pick(PLANKC), 'plank');
        var C=[[-8.38,4.7,-3.6],[-0.95,5.1,-3.6],[-0.95,4.1,0.5],[-8.38,3.9,0.5]];
        C.forEach(function(c){ LOCUS.pole(F, c[0],c[2], c[1], 0.09); });
        LOCUS.guy(F, -0.95,3.9,0.5, -0.3,1.4); LOCUS.guy(F, -8.38,3.7,0.5, -8.7,1.5);
        ABYSS.sail(F, C, PAL.abSailOrange, { swoop:0.7, band:PAL.abSailOrange, bandW:0.6 });
        ABYSS.furn(F, 'abyss_counter', -4.7,-1.0, 0, { ly:H, setting:'room' });
        ABYSS.furn(F, 'abyss_hanging_goods', -7.9,-1.6, PI/2, { ly:H, setting:'room' });             /* tools and rope on a rail by the plank wall */
        LOCUS.stair(F, -2.6, 0.6+H*1.15, 0,-1, H, 1.6);
        ABYSS.lantern(F, -6.2,H+2.3,-3.55, false); ABYSS.lantern(F, -2.2,H+2.3,-3.55, false);
        /* the street side: salvaged sheet, reed for thatch, bricks, lime and drums laid out for the buyers */
        ABYSS.furn(F, 'abyss_scrap_stock', -6.6,2.4, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_reed_bundles', -6.8,5.6, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_brick_stack', -3.8,2.6, 0.1, { variant:0 }); ABYSS.furn(F, 'abyss_brick_stack', -3.6,4.2, 0, { variant:1 });
        ABYSS.furn(F, 'abyss_lime_sacks', -1.8,4.0, -0.2, { variant:0 });
        ABYSS.furn(F, 'abyss_crates', -3.2,6.0, 0, { variant:2 });
        ABYSS.furn(F, 'pa_drum', -1.4,2.3, 0); ABYSS.furn(F, 'pa_drum', -0.8,2.8, 0, { variant:1 });
        /* the timber yard, fenced on its back and right side, open to the street through the gate */
        sheetFence(F, [-0.6,-6.9], [8.9,-6.9]); sheetFence(F, [8.9,-6.9], [8.9,6.7]);
        LOCUS.rail(F, 3.95,6.8, 8.85,6.8, 0, F.pick(TIMBERC), 1.1);
        yardGate(F, -0.5, 3.7, 6.6);
        ABYSS.furn(F, 'job_pole_rack', 2.2,-5.75, 0, { variant:2 });                                    /* poles stood on end against the back fence */
        ABYSS.furn(F, 'job_plank_stack', 6.7,-5.6, 0, { variant:1 });
        ABYSS.furn(F, 'job_pole_rack', 5.6,-3.3, 0, { variant:0 });                                     /* the trestle rack */
        ABYSS.furn(F, 'job_plank_stack', 2.6,-1.3, 0, { variant:0 });
        ABYSS.furn(F, 'job_pole_rack', 7.6,1.7, PI/2, { variant:1 });                                   /* felled logs as delivered */
        ABYSS.furn(F, 'job_saw_bench', 3.4,1.6, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_reed_bundles', 5.4,5.6, 0, { variant:1 });
        ABYSS.lantern(F, -0.15,3.4,6.85, false); }
      else { var H1=0.8;
        F.box(0,0,0, 17.6,0.08,13.6, 0, PAL.abSalt, 'plaster');
        /* the office: a container (the store) on a deck, a plank shop-front built onto its front (two plank walls, a
           corrugated roof falling to the street), the counter across the front */
        ABYSS.platform(F, 0.8,8.8, -6.9,-0.2, H1);
        ABYSS.vessel(F, 'container', 4.8,H1,-5.6, { len:6.1, col:ABYSS.cont(F), win:[[2.0,1.5]], door:'side', doorAt:-1.2 });
        var pk=F.pick(PLANKC);
        [1.0,8.6].forEach(function(x){ F.box(x,H1,-2.35, 0.15,3.0,3.9, 0, pk, 'plank'); F.box(x,H1,-0.45, 0.24,3.0,0.24, 0, F.pick(TIMBERC), 'timber'); });
        ABYSS.corrRoof(F, 4.8,H1+3.0,-2.3, 8.4,4.1, 0.45, ABYSS.rust(F));
        ABYSS.furn(F, 'abyss_counter', 4.8,-1.2, 0, { ly:H1, setting:'room' });
        ABYSS.furn(F, 'abyss_hanging_goods', 1.55,-2.6, PI/2, { ly:H1, setting:'room' });
        LOCUS.stair(F, 4.8, -0.2+H1*1.15, 0,-1, H1, 1.8);
        sawSign(F, 4.8,H1+3.45,-0.12, 0,1, 2.6,0.8); ABYSS.lantern(F, 2.2,H1+2.5,-0.6, false); ABYSS.lantern(F, 7.4,H1+2.5,-0.6, false);
        /* the street side of the office: sheet, bricks, lime, reed stooks and drums */
        ABYSS.furn(F, 'abyss_scrap_stock', 6.6,2.2, 0, { variant:0 });
        ABYSS.furn(F, 'abyss_brick_stack', 2.4,2.4, 0, { variant:0 }); ABYSS.furn(F, 'abyss_brick_stack', 2.4,4.2, -0.1, { variant:1 });
        ABYSS.furn(F, 'abyss_lime_sacks', 6.4,4.6, 0, { variant:1 });
        ABYSS.furn(F, 'abyss_reed_bundles', 6.6,6.2, 0, { variant:1 });
        ABYSS.furn(F, 'pa_drum', 4.4,5.8, 0); ABYSS.furn(F, 'pa_drum', 3.9,6.4, 0);
        /* the timber yard on the left: the log landing at the back under a hoist derrick, the saw pit under a sail */
        sheetFence(F, [-8.9,-6.95], [0.7,-6.95]); sheetFence(F, [-8.9,-6.95], [-8.9,6.7]);
        ABYSS.furn(F, 'job_pole_rack', -4.6,-5.4, 0, { variant:1 });                                    /* the felled logs the lumberjacks deliver */
        /* the derrick: two seal-tree legs and a back stay to the head, a boom out over the cart lane, a hand winch on the
           right leg, the rope over the head to a hook with a log in its sling */
        var tc=F.pick(TIMBERC), hd=[-4.6,7.0,-4.4], bt=[-4.6,6.0,-1.4];
        [[-7.2,-3.0],[-2.0,-3.0]].forEach(function(p){ F.rod(p[0],0,p[1], hd[0],hd[1],hd[2], 0.13, tc, 'timber'); });
        F.rod(-4.6,0,-6.85, hd[0],hd[1],hd[2], 0.11, tc, 'timber');
        F.rod(-4.6,4.6,-3.9, bt[0],bt[1],bt[2], 0.1, tc, 'timber'); F.rod(hd[0],hd[1],hd[2], bt[0],bt[1],bt[2], 0.03, PAL.people.hair[2], 'timber');
        F.cyl(hd[0],hd[1]-0.1,hd[2], 0.2,0.25, 0, STEELDC[0], 'rust');                                  /* the head block */
        F.rod(-3.4,0.95,-3.0, -2.8,0.95,-3.0, 0.2, ABYSS.rust(F), 'rust'); F.rod(-2.75,0.95,-3.0, -2.75,1.35,-2.75, 0.03, STEELDC[1], 'rust');   /* the winch drum and its crank */
        [-3.45,-2.75].forEach(function(x){ F.box(x,0,-3.0, 0.1,1.0,0.3, 0, tc, 'timber'); });
        F.rod(-3.1,1.15,-3.0, hd[0],hd[1]-0.1,hd[2], 0.015, PAL.people.hair[2], 'timber');
        F.rod(bt[0],bt[1],bt[2], bt[0],2.6,bt[2], 0.015, PAL.people.hair[2], 'timber'); F.box(bt[0],2.4,bt[2], 0.12,0.2,0.08, 0, STEELDC[2], 'rust');
        F.rod(bt[0]-0.5,2.4,bt[2], bt[0],2.6,bt[2], 0.012, PAL.people.hair[2], 'timber'); F.rod(bt[0]+0.5,2.4,bt[2], bt[0],2.6,bt[2], 0.012, PAL.people.hair[2], 'timber');
        F.rod(bt[0]-1.6,2.2,bt[2], bt[0]+1.6,2.2,bt[2], 0.22, 0x505c48, 'bark');                         /* a scale-tree log in the sling */
        var S=[[-7.2,4.8,-0.4],[-1.6,4.4,-0.4],[-1.6,4.8,2.2],[-7.2,4.4,2.2]];
        S.forEach(function(c){ LOCUS.pole(F, c[0],c[2], c[1], 0.09); });
        ABYSS.sail(F, S, PAL.abSailOrange, { swoop:0.6, band:PAL.abSailRed, bandW:0.5 });
        ABYSS.furn(F, 'job_saw_bench', -4.4,0.9, 0, { variant:1 });                                     /* the saw pit's trestles under the sail */
        ABYSS.furn(F, 'job_pole_rack', -7.9,4.8, PI/2, { variant:2 });                                  /* poles stood against the left fence */
        ABYSS.furn(F, 'job_plank_stack', -3.4,4.6, 0, { variant:0 }); ABYSS.furn(F, 'job_plank_stack', -3.0,6.3, 0, { variant:1 });
        yardGate(F, -1.0, 0.6, 6.7); }
    } });
})();
