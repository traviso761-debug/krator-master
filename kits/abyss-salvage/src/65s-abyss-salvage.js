/* ============================== 16S. ABYSS SALVAGE — Kenshi-swamp-influenced village & suburb kit ==============================
   Compact, focused salvage-architecture kit for East Abyss hamlets, small villages, and marsh suburbs
   (Locus outer suburbs, Mungo marsh skirts, Sista Riba / Bissa / swamp hamlets).
   Uses existing Locus/Abyss material families (corrugate, rust, plank, timber, bark, dark, canvas, glowmat)
   and LOCUS / ABYSS helpers so it adds zero extra draw calls. Every asset draws in its local frame (+x right,
   +z front, y up from ground). */
reseed(658901);
(function(){
  var PI=Math.PI, TAU2=PI*2;

  function patchCol(F, i, j){
    var idx = Math.abs((i*7 + j*13 + ((F.seed||1)%11))) % 6;
    if(idx===0) return STEELDC[0];
    if(idx===1) return STEELDC[1];
    if(idx===2) return STEELDC[2];
    if(idx===3) return RUSTC[0];
    if(idx===4) return RUSTC[2];
    return PAL.abTin || STEELDC[1];
  }

  /* Lapped riveted-plate saucer dome on ABYSS.grid, centred at (cx, cy, cz), base radius R, height H.
     Each plate is its own small grid on the 'rust' family (plated steel: seams and rivet rows), with its UVs set so a seam
     and a rivet strip fall on the plate's own edge; alternate plates stand 1.5% proud, so the edges read as laps. The hint is
     the ellipsoid's gradient (x/R2, y/H2, z/R2), the outward side at every point (the old radial hint, with its y floored at
     .25, could face the crown the wrong way). Raised seam straps follow the meridians, a flange rings the base, a vented cap closes the crown. */
  function swampDome(F, cx, cy, cz, R, H, rings, segs){
    rings = rings || 6; segs = segs || 16;
    var TOP = PI*0.5*0.94;
    function pt(a, b, k){ var rad = R*Math.cos(a)*k, yy = H*Math.sin(a)*k; return [cx+Math.cos(b)*rad, cy+yy, cz+Math.sin(b)*rad]; }
    function hint(p){ return [(p[0]-cx)/(R*R), (p[1]-cy)/(H*H), (p[2]-cz)/(R*R)]; }
    for(var r=0; r<rings; r++) for(var s=0; s<segs; s++){
      var a0=(r/rings)*TOP, a1=((r+1)/rings)*TOP, b0=(s/segs)*TAU2, b1=((s+1)/segs)*TAU2;
      var k = 1 + 0.015*((r+s)%2), P=[], U=[], h=(r*7+s*3+((F.seed||1)%5))%2;
      for(var i=0; i<=2; i++){ var rowP=[], rowU=[]; for(var j=0; j<=2; j++){
        rowP.push(pt(a0+(a1-a0)*i/2, b0+(b1-b0)*j/2, k)); rowU.push([0.5*h + 0.25*j, 0.5*((r+s)%2) + 0.25*i]); }
        P.push(rowP); U.push(rowU); }
      ABYSS.grid(F, 'rust', P, patchCol(F, r, s), { uv:U, hint:hint, under:STEELDC[0] });
    }
    /* raised seam straps along every other meridian, hugging the plates */
    for(var m=0; m<segs; m+=2){
      var bm=(m/segs)*TAU2;
      for(var q=0; q<rings; q++){
        var p0=pt((q/rings)*TOP, bm, 1.03), p1=pt(((q+1)/rings)*TOP, bm, 1.03);
        F.rod(p0[0],p0[1],p0[2], p1[0],p1[1],p1[2], 0.05, STEELDC[0], 'rust');
      }
    }
    /* base flange and a vented crown cap */
    F.cyl(cx, cy+0.02, cz, R+0.12, 0.34, 0, STEELDC[0], 'rust');
    var top=pt(TOP, 0, 1);
    F.cyl(cx, top[1]-0.12, cz, Math.max(0.5, R*0.2), 0.5, 0, STEELDC[0], 'rust');
  }

  /* Tall ring of cross-braced stilts supporting a circular catwalk deck at y = deckY */
  function stiltRing(F, R, deckY, nPosts, stairZ){
    var pCol = F.pick(PILEC), bCol = F.pick(TIMBERC), dkCol = F.pick(PLANKC);
    /* Perimeter catwalk ring + solid inner floor */
    F.cyl(0, deckY-0.18, 0, R+0.95, 0.22, 0, dkCol, 'plank');
    F.cyl(0, deckY-0.36, 0, R+1.05, 0.16, 0, STEELDC[0], 'rust');
    var pts = [];
    for(var i=0; i<nPosts; i++){
      var a = (i / nPosts) * TAU2;
      var px = Math.cos(a)*(R+0.55), pz = Math.sin(a)*(R+0.55);
      pts.push([px, pz, a]);
      LOCUS.pile(F, px, pz, deckY, 0.15, pCol);
      /* Inner ring of load-bearing piles */
      if(i%2===0) LOCUS.pile(F, Math.cos(a)*(R*0.52), Math.sin(a)*(R*0.52), deckY, 0.17, pCol);
    }
    /* Horizontal ledgers and X-braces between adjacent stilts */
    var midY = deckY * 0.48;
    for(var j=0; j<nPosts; j++){
      var A = pts[j], B = pts[(j+1)%nPosts];
      F.beam(A[0], midY, A[1], B[0], midY, B[1], 0.10, 0.12, bCol, 'timber');
      if(j%2===0) F.beam(A[0], 0.4, A[1], B[0], deckY-0.3, B[1], 0.08, 0.10, bCol, 'timber');
      /* Catwalk railing — leave entry gap at front (+z) */
      var ma = (A[2] + B[2]) * 0.5;
      if(!(A[1] > R*0.75 && B[1] > R*0.75 && Math.abs(A[0]+B[0]) < 3.0)){
        LOCUS.rail(F, A[0]*1.03, A[1]*1.03, B[0]*1.03, B[1]*1.03, deckY, bCol, 0.95);
      }
    }
    /* Entry stair down to the mud */
    LOCUS.stair(F, 0, stairZ+deckY*1.15, 0, -1, deckY, 1.8, dkCol);   /* foot on the mud, top at the deck edge (stair runs from its x,z away, so it points back at the building) */
  }

  /* Cross-braced rectangular stilt frame + plank deck + railings + front stair */
  function stiltDeck(F, W, D, deckY, stairW){
    var pCol = F.pick(PILEC), bCol = F.pick(TIMBERC), dkCol = F.pick(PLANKC);
    var nx = Math.max(2, Math.round(W/3.0)), nz = Math.max(2, Math.round(D/3.0));
    LOCUS.pileGrid(F, -W/2+0.4, W/2-0.4, -D/2+0.4, D/2-0.4, nx, nz, deckY, { r:0.15, col:pCol });
    /* Perimeter braces */
    var my = deckY * 0.46;
    F.beam(-W/2+0.4, my, -D/2+0.4, W/2-0.4, my, -D/2+0.4, 0.10, 0.12, bCol, 'timber');
    F.beam(-W/2+0.4, my,  D/2-0.4, W/2-0.4, my,  D/2-0.4, 0.10, 0.12, bCol, 'timber');
    F.beam(-W/2+0.4, my, -D/2+0.4, -W/2+0.4, my, D/2-0.4, 0.10, 0.12, bCol, 'timber');
    F.beam( W/2-0.4, my, -D/2+0.4,  W/2-0.4, my, D/2-0.4, 0.10, 0.12, bCol, 'timber');
    F.beam(-W/2+0.4, 0.3, D/2-0.4, W/2-0.4, deckY-0.3, D/2-0.4, 0.08, 0.09, bCol, 'timber');
    LOCUS.deck(F, 0, 0, W+0.8, D+0.8, deckY, dkCol);
    LOCUS.stair(F, 0, D/2+0.4+deckY*1.15, 0, -1, deckY, stairW || 1.4, dkCol);
  }

  /* 1. Large Kenshi-style patchwork saucer dome hall on stilts */
  ASSET({ key:'swamp_dome_hall', name:'Swamp salvage dome hall', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['civic'],
    w:18, d:18, h:9.5, variants:2,
    build:function(F){
      var deckY = 3.1, R = 6.8, H = 4.6;
      stiltRing(F, R, deckY, 18, R+0.9);
      swampDome(F, 0, deckY, 0, R, H, 6, 18);
      /* Recessed iron portal frame facing +z */
      F.box(0, deckY, R-0.5, 3.2, 2.7, 1.3, 0, STEELDC[0], 'rust');
      F.door(0, R+0.16, 0, 1, 1.7, 2.2, PLANKC[3], deckY);
      /* Twin warm oil braziers flanking portal (non-electric) */
      [-1.9, 1.9].forEach(function(bx){
        F.cyl(bx, deckY, R+0.45, 0.16, 0.85, 0, STEELDC[0], 'rust');
        F.lamp(bx, deckY+1.05, R+0.45, 0.85, 11);
      });
      /* Rooftop vent mast + guy wires + side tanks */
      F.cyl(0, deckY+H, 0, 0.08, 2.6, 0, STEELDC[1], 'rust');
      F.box(0, deckY+H+2.2, 0, 1.2, 0.12, 0.12, 0.4, STEELDC[2], 'rust');
      [-1,1].forEach(function(s){
        F.rod(0, deckY+H+2.1, 0, s*R*0.65, deckY+H*0.55, 0, 0.025, STEELDC[0], 'rust');
        F.cyl(s*2.2, deckY+H*0.76, -1.2, 0.65, 0.45, [0.25,0,s*0.2], RUSTC[1], 'rust');
      });
    }
  });

  /* 2. Swamp tavern dome ("Dancing Skeleton" style signboard + warm braziers) */
  ASSET({ key:'swamp_tavern_dome', name:'Swamp stilt tavern dome', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['tavern/inn'],
    w:16, d:16, h:9.2, variants:2,
    build:function(F){
      var deckY = 3.0, R = 6.0, H = 4.2;
      stiltRing(F, R, deckY, 16, R+0.85);
      swampDome(F, 0, deckY, 0, R, H, 6, 16);
      F.box(0, deckY, R-0.45, 3.0, 2.6, 1.2, 0, STEELDC[0], 'rust');
      F.door(0, R+0.16, 0, 1, 1.6, 2.1, PLANKC[2], deckY);
      /* Painted wooden signboard perched above portal */
      F.box(0, deckY+2.75, R-0.05, 2.1, 1.25, 0.14, 0, TIMBERC[0], 'timber');
      F.box(0, deckY+2.85, R+0.04, 1.85, 1.0, 0.06, 0, PAL.abBrightYellow || PAL.glowWarm, 'glowmat');
      [-2.1, 2.1].forEach(function(bx){
        F.cyl(bx, deckY, R+0.4, 0.14, 1.1, 0, STEELDC[0], 'rust');
        F.cone(bx, deckY+1.1, R+0.4, 0.18, 0.38, 0, PAL.flare, 'glowmat');
        F.lamp(bx, deckY+1.3, R+0.4, 1.0, 13);
      });
      LOCUS.drum(F, -R*0.65, deckY, R*0.45, RUSTC[0], false, 0);
      LOCUS.drum(F, -R*0.52, deckY, R*0.58, RUSTC[2], true, 0.6);
    }
  });

  /* 3. Small circular swamp pod hut on tall stilts */
  ASSET({ key:'swamp_pod_hut', name:'Swamp stilt pod hut', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['single-family dwelling'],
    w:10, d:10, h:7.2, variants:3,
    build:function(F){
      var deckY = 2.6, R = 3.3, H = 3.1;
      stiltRing(F, R, deckY, 10, R+0.8);
      swampDome(F, 0, deckY, 0, R, H, 5, 12);
      /* Gable entry hood */
      F.box(0, deckY, R-0.35, 2.0, 2.1, 1.1, 0, patchCol(F, 2, 1), 'corrugate');
      F.box(-0.55, deckY+2.05, R-0.3, 1.25, 0.10, 1.35, 0, STEELDC[1], 'rust');
      F.box( 0.55, deckY+2.05, R-0.3, 1.25, 0.10, 1.35, 0, RUSTC[1], 'rust');
      F.door(0, R+0.22, 0, 1, 1.1, 1.85, PLANKC[3], deckY);
      F.cyl(0.4, deckY+H-0.2, -0.4, 0.14, 1.1, 0, STEELDC[0], 'rust');
      F.lamp(0, deckY+2.2, R+0.6, 0.55, 8);
    }
  });

  /* 4. Elevated lean-to patchwork salvage shack */
  ASSET({ key:'swamp_shack_a', name:'Swamp salvage lean-to shack', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['single-family dwelling'],
    w:11, d:10, h:6.4, variants:3,
    build:function(F){
      var deckY = 2.3, W = 7.4, D = 5.6, H = 2.7;
      stiltDeck(F, W+1.2, D+1.6, deckY, 1.2);
      /* Patchwork iron & plank body */
      F.box(0, deckY, -0.4, W, H, D, 0, patchCol(F, 1, 2), 'corrugate');
      F.box(-W*0.26, deckY+0.1, -0.4+D/2+0.04, W*0.42, H-0.2, 0.08, 0, patchCol(F, 3, 4), 'corrugate');
      F.box( W*0.28, deckY+0.1, -0.4-D/2-0.04, W*0.38, H-0.2, 0.08, 0, RUSTC[1], 'rust');
      /* Sloped corrugated roof + overhang */
      F.box(0, deckY+H+0.15, -0.2, W+1.1, 0.14, D+1.3, [0.14,0,0], patchCol(F, 4, 1), 'corrugate');
      F.door(0.6, -0.4+D/2+0.06, 0, 1, 1.05, 1.9, PLANKC[2], deckY);
      LOCUS.shutterWin(F, -1.8, deckY+1.5, -0.4+D/2+0.06, 0, 1, 1.0, 0.85);
      /* Front porch rail + chimney pipe */
      LOCUS.rail(F, -W/2-0.4, D/2+0.9, -0.8, D/2+0.9, deckY, F.pick(TIMBERC), 0.9);
      LOCUS.rail(F,  0.8, D/2+0.9,  W/2+0.4, D/2+0.9, deckY, F.pick(TIMBERC), 0.9);
      F.cyl(W/2-0.6, deckY+H, -D/2+0.4, 0.14, 1.5, 0, STEELDC[0], 'rust');
      F.lamp(0.6, deckY+2.3, D/2+0.2, 0.55, 8);
    }
  });

  /* 5. Double-bay elevated swamp stilt house */
  ASSET({ key:'swamp_shack_b', name:'Swamp double-bay stilt house', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['single-family dwelling'],
    w:13, d:10, h:6.8, variants:3,
    build:function(F){
      var deckY = 2.4, W = 9.4, D = 5.8, H = 2.8;
      stiltDeck(F, W+1.2, D+1.8, deckY, 1.3);
      F.box(-1.6, deckY, -0.4, 5.4, H, D, 0, patchCol(F, 0, 3), 'corrugate');
      F.box( 2.8, deckY, -0.2, 3.8, H-0.3, D-0.6, 0, patchCol(F, 2, 5), 'corrugate');
      /* Split gable / shed roofs */
      F.box(-1.6, deckY+H+0.15, -0.4, 6.0, 0.14, D+1.0, [0.12,0,0.06], STEELDC[1], 'corrugate');
      F.box( 2.8, deckY+H-0.12, -0.2, 4.4, 0.14, D+0.4, [-0.14,0,-0.06], RUSTC[0], 'corrugate');
      F.door(-1.2, -0.4+D/2+0.06, 0, 1, 1.1, 1.9, PLANKC[3], deckY);
      F.door( 2.8, -0.2+(D-0.6)/2+0.06, 0, 1, 0.95, 1.8, PLANKC[1], deckY);
      LOCUS.shutterWin(F, -3.1, deckY+1.5, -0.4+D/2+0.06, 0, 1, 0.95, 0.85);
      LOCUS.drum(F, -W/2+0.2, deckY, D/2+0.5, STEELDC[2], false, 0);
      F.lamp(0.8, deckY+2.2, D/2+0.2, 0.6, 9);
    }
  });

  /* 6. Elevated salvage iron workshop with conical flue & exhaust pipes */
  ASSET({ key:'swamp_workshop', name:'Swamp salvage workshop', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['market/shop'],
    w:14, d:11, h:7.8, variants:2,
    build:function(F){
      var deckY = 2.5, W = 10.0, D = 6.2, H = 3.0;
      stiltDeck(F, W+1.4, D+1.6, deckY, 1.6);
      F.box(0, deckY, -0.4, W, H, D, 0, patchCol(F, 1, 0), 'corrugate');
      F.box(0, deckY+H+0.1, -0.4, W+0.9, 0.16, D+0.9, [0.08,0,0], STEELDC[0], 'corrugate');
      /* Conical furnace flue hood on right wing (image.png far right) */
      F.cyl(3.2, deckY+H, -0.6, 1.45, 0.5, 0, STEELDC[1], 'rust');
      F.cone(3.2, deckY+H+0.45, -0.6, 1.35, 1.75, 0, STEELDC[0], 'rust');
      F.cyl(3.2, deckY+H+2.05, -0.6, 0.34, 0.9, 0, RUSTC[0], 'rust');
      /* Triple angled exhaust vents along the ridge */
      [-2.8, -1.4, 0.0].forEach(function(vx){
        F.cyl(vx, deckY+H, -1.6, 0.16, 1.15, 0, STEELDC[1], 'rust');
        F.box(vx, deckY+H+1.12, -1.6, 0.55, 0.12, 0.38, 0, RUSTC[1], 'rust');
      });
      F.door(2.4, -0.4+D/2+0.06, 0, 1, 1.35, 2.05, PLANKC[3], deckY);
      LOCUS.shutterWin(F, -2.2, deckY+1.6, -0.4+D/2+0.06, 0, 1, 1.6, 0.95);
      LOCUS.drum(F, -4.4, deckY, D/2+0.45, RUSTC[0], false, 0);
      LOCUS.drum(F, -3.5, deckY, D/2+0.45, STEELDC[1], false, 0);
      F.lamp(2.4, deckY+2.5, D/2+0.25, 0.75, 10);
    }
  });

  /* 7. Tall windowless ribbed iron stronghouse / storehouse (image.png far left) */
  ASSET({ key:'swamp_storehouse', name:'Swamp iron stronghouse', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['industry'],
    w:11, d:11, h:7.5, variants:2,
    build:function(F){
      var W = 8.4, D = 7.6, H = 5.8;
      /* Raised stone/rubble plinth + dark riveted iron shell */
      F.box(0, 0, 0, W+0.8, 0.9, D+0.8, 0, PAL.abRubble || STEELDC[0], 'rubble');
      F.box(0, 0.85, 0, W, H, D, 0, STEELDC[0], 'corrugate');
      /* Vertical exterior steel buttress ribs all round */
      for(var ix=-3; ix<=3; ix++){
        var rx = ix * (W/7.2);
        F.box(rx, 0.85,  D/2+0.12, 0.24, H+0.25, 0.26, 0, STEELDC[1], 'rust');
        F.box(rx, 0.85, -D/2-0.12, 0.24, H+0.25, 0.26, 0, STEELDC[1], 'rust');
      }
      for(var iz=-2; iz<=2; iz++){
        var rz = iz * (D/5.2);
        F.box(-W/2-0.12, 0.85, rz, 0.26, H+0.25, 0.24, 0, RUSTC[0], 'rust');
        F.box( W/2+0.12, 0.85, rz, 0.26, H+0.25, 0.24, 0, RUSTC[0], 'rust');
      }
      /* Recessed central doorway + short entry stair + parapet teeth */
      F.box(0, 0.85, D/2-0.1, 2.1, 2.5, 0.55, 0, RUSTC[0], 'rust');
      F.door(0, D/2+0.18, 0, 1, 1.35, 2.1, STEELDC[2], 0.9);
      LOCUS.stair(F, 0, D/2+0.4+0.9*1.15, 0, -1, 0.9, 1.5, PLANKC[2]);
      F.cyl(W/2-0.5, 0.85+H, -D/2+0.6, 0.16, 1.2, 0, STEELDC[1], 'rust');
      F.lamp(0, 3.6, D/2+0.45, 0.65, 9);
    }
  });

  /* 8. Timber-and-iron stilt marsh watch-gate (image_4.png foreground) */
  ASSET({ key:'swamp_gatehouse', name:'Swamp stilt watch-gate', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['military'],
    w:12, d:10, h:9.5, variants:2,
    build:function(F){
      var deckY = 2.8, W = 7.2, D = 5.2;
      stiltDeck(F, W+1.6, D+1.6, deckY, 2.2);
      /* Flanking scrap-iron blast wings */
      [-1, 1].forEach(function(s){
        F.box(s*(W/2+1.2), 0.2, 0, 2.2, 4.4, 0.45, 0, patchCol(F, s+2, 1), 'corrugate');
        F.cyl(s*(W/2+2.1), 0, 0, 0.18, 5.2, 0, F.pick(PILEC), 'bark');
      });
      /* Elevated watch cabin + crow's-nest parapet */
      F.box(0, deckY, 0, W-1.2, 3.0, D-1.0, 0, STEELDC[0], 'corrugate');
      LOCUS.deck(F, 0, 0, W-0.6, D-0.4, deckY+3.05, PLANKC[2]);
      LOCUS.rail(F, -(W-0.8)/2, -(D-0.6)/2, (W-0.8)/2, -(D-0.6)/2, deckY+3.05, TIMBERC[0], 1.0);
      LOCUS.rail(F, -(W-0.8)/2,  (D-0.6)/2, (W-0.8)/2,  (D-0.6)/2, deckY+3.05, TIMBERC[0], 1.0);
      F.cyl(0, deckY+3.05, 0, 0.10, 3.2, 0, STEELDC[1], 'rust');
      F.door(0, (D-1.0)/2+0.06, 0, 1, 1.3, 2.0, PLANKC[3], deckY);
      F.lamp(0, deckY+5.6, 0, 0.9, 14);
    }
  });

  /* 9. Circular plank-walled marsh paddy / sump ring (image_4.png center) */
  ASSET({ key:'swamp_paddy_ring', name:'Swamp marsh sump ring', family:'abyss', kit:'abyss', group:'Swamp Salvage', culture:'eastabyss', types:['farm'],
    w:16, d:16, h:3.2, variants:2,
    build:function(F){
      var R = 6.6, H = 2.0, n = 18, pCol = F.pick(PILEC), dkCol = F.pick(PLANKC);
      /* Outer palisade ring + perimeter plank walkway */
      for(var i=0; i<n; i++){
        var a = (i/n)*TAU2, a2 = ((i+1)/n)*TAU2;
        var ax = Math.cos(a)*R, az = Math.sin(a)*R, bx = Math.cos(a2)*R, bz = Math.sin(a2)*R;
        LOCUS.pile(F, ax, az, H+0.5, 0.15, pCol);
        var mx = (ax+bx)/2, mz = (az+bz)/2, L = Math.hypot(bx-ax, bz-az), yaw = Math.atan2(bx-ax, bz-az)+PI/2;
        F.box(mx, 0, mz, L, H, 0.18, yaw, i%3===0?RUSTC[0]:dkCol, i%3===0?'corrugate':'plank');
      }
      F.sector('plank', 0, 0, R-1.2, R+0.1, 0, TAU2, H-0.15, H, dkCol, { faces:'tbo', step:1.4 });
      /* Inner sump bed + central windpump post */
      F.cyl(0, 0.05, 0, R-1.3, 0.12, 0, OILC[1], 'adobe');
      F.cyl(0, 0.1, 0, 0.22, 3.0, 0, STEELDC[0], 'rust');
      LOCUS.stair(F, 0, R+0.1+H*1.15, 0, -1, H, 1.3, dkCol);
    }
  });
})();
