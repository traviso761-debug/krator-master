/* ============================== 16X-M. ABYSS — military: the wall system, the fortress, the barracks ==============================
   THE WALL SYSTEM (modular; documented in ABYSS-KIT-NOTES.md):
     abyss_wall_seg     one segment, exactly ABYSS.WALL.L = 12 m long (local x -6..+6), 8 m high, 3 m thick (z -1.5..+1.5),
                        +z = the OUTSIDE face. Rubble to 4.5 m, salvaged plate above with merlons, a walkway at 6.4 m on the
                        inside. Nothing it draws passes x = +-6, so segments placed end to end (centres 12 m apart, same yaw)
                        join with no gap and no overlap.
     abyss_wall_tower   a round silo tower (r 3.4) centred ON A JOINT between two segments; doors at walkway height on +-x,
                        on the walkway's line (z -1), so turn it with the segments' yaw.
     abyss_wall_gate    exactly N = 2 segments long (24 m, x -12..+12), a 6 m wide, 6 m high cart gate under a swoop roof;
                        the gate towers rise full height only on the outer half (z 0..+3.5): on the inner half the walkway
                        runs on at 6.4 m as a gallery behind them and over the gate's lintel. Place it as if two segments.
     abyss_wall_corner  a round silo tower (r 4.2) centred on the CORNER POINT, where the axes of two runs meet at 90 deg;
                        the run beyond starts at that point (its first segment's centre is 6 m from the corner).
     abyss_wall_run     sheet-only demo (tag demo): segment, tower, segment, gate, segment, corner, segment — built by calling
                        the other builders through ABYSS.sub at offsets, never by copying their code.                     */
reseed(658001);
(function(){
  var PI=Math.PI, L=12, WH=8, T=3, RUB=4.5, WALK=6.4;
  ABYSS.WALL = { L:L, H:WH, T:T, walk:WALK, gateSegments:2 };
  function plateCol(F){ return F.pick([PAL.abRustA, PAL.abRustB, RUSTC[0], STEELDC[0], RUSTC[3]]); }
  /* a stretch of wall body from x0 to x1 (local), used by the segment and the gate */
  function body(F, x0, x1){ var w=x1-x0, cx=(x0+x1)/2;
    F.box(cx,0,0, w,RUB,T, 0, PAL.abRubble, 'rubble');
    F.box(cx,RUB,0.75, w,7.2-RUB,1.5, 0, plateCol(F), 'rust');
    for(var x=x0+0.75; x<x1-0.2; x+=1.5) F.box(Math.min(x,x1-0.1),RUB,1.52, 0.12,7.2-RUB,0.06, 0, STEELDC[1], 'rust');      /* plate seams */
    for(var m=x0+1.5; m<x1-0.5; m+=3) F.box(m,7.2,0.9, 1.8,WH-7.2,1.2, 0, plateCol(F), 'rust');                              /* merlons */
    F.box(cx,WALK-0.15,-1.0, w,0.15,2.0, 0, F.pick(PLANKC), 'plank');                                                       /* the walkway */
    F.box(cx,RUB,-0.75, w,WALK-0.15-RUB,1.5, 0, shade(PAL.abRubble,-0.1), 'rubble');                                       /* its fill */
    LOCUS.rail(F, x0+0.1,-1.95, x1-0.1,-1.95, WALK, F.pick(TIMBERC), 1.0); }

  ASSET({ key:'abyss_wall_seg', name:'Wall segment (12 m)', family:'civic', kit:'abyss', group:'Walls', culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.4,1.0], w:L, d:6, h:WH, variants:1, sim:{ activity:'GARRISON', capacity:6 },
    build:function(F){ body(F, -L/2, L/2); } });

  function silo(F, R, Hh, doors){ F.lathe('rubble', 0,0, [[R+0.3,0],[R,RUB+0.5]], PAL.abRubble, { seg:22 });
    F.lathe('corrugate', 0,0, [[R,RUB+0.5],[R,Hh]], plateCol(F), { seg:22 });
    F.lathe('relief', 0,0, [[R+0.08,Hh-0.5],[R+0.08,Hh]], PAL.abLacquer, { seg:22 });
    F.edome(0,Hh,0, R+0.2, R*0.6, R+0.2, 0, PAL.abTin, 'tinmirror'); F.cyl(0,Hh+R*0.6-0.1,0, 0.08,1.6, 0, PAL.abGild, 'metal'); F.ball(0,Hh+R*0.6+1.6,0, 0.2, PAL.abGild, 'metal');
    for(var k=0;k<8;k++){ var a=k/8*TAU+0.2; F.box(Math.cos(a)*(R+0.02), RUB+2.2, Math.sin(a)*(R+0.02), 0.25,1.0,0.12, -a+PI/2, VOIDC[0], 'dark'); F.box(Math.cos(a)*(R+0.02), Hh-2.2, Math.sin(a)*(R+0.02), 0.25,1.0,0.12, -a+PI/2, VOIDC[0], 'dark'); }
    /* doors[i] = [nx,nz] the side it faces, [ox,oz] its offset along the wall line: it opens onto the walkway (1 m inside the axis) */
    doors.forEach(function(d){ var o=-1.0, ax=d[0]?0:o, az=d[1]?0:o, r=Math.sqrt(Math.max(0,(R+0.02)*(R+0.02)-o*o)), x=d[0]*r+ax, z=d[1]*r+az, l=Math.hypot(x,z);
      F.door(x, z, x/l, z/l, 1.0, 2.2, PLANKC[3], WALK); }); }
  ASSET({ key:'abyss_wall_tower', name:'Wall tower (on a joint)', family:'civic', kit:'abyss', group:'Walls', culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.4,1.0], w:8, d:8, h:15, variants:1, sim:{ activity:'GARRISON', capacity:10 },
    build:function(F){ silo(F, 3.4, 12, [[1,0],[-1,0]]); } });
  ASSET({ key:'abyss_wall_corner', name:'Wall corner tower', family:'civic', kit:'abyss', group:'Walls', culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.4,1.0], w:10, d:10, h:17, variants:1, sim:{ activity:'GARRISON', capacity:14 },
    build:function(F){ silo(F, 4.2, 13.5, [[-1,0],[0,-1]]); ABYSS.antenna(F, 0,13.5+2.5,0, 'mast', { h:2.6 }); } });

  ASSET({ key:'abyss_wall_gate', name:'Wall gate (2 segments)', family:'civic', kit:'abyss', group:'Walls', culture:'abyssal-desert', types:['military','infrastructure'],
    wealth:[0.4,1.0], w:2*L, d:10, h:18, variants:1, sim:{ activity:'GARRISON', capacity:12 },
    build:function(F){ var gw=6, gh=6.0, tw=2.4, gx=gw/2+tw, WB=WALK-0.15;
      body(F, -L, -gx); body(F, gx, L);
      /* the gate towers: full depth (z -2.5..3.5) up to the walkway, then only the outer half (z 0..3.5) to 10.5 m */
      [-1,1].forEach(function(s){ var cx=s*(gw/2+tw/2);
        F.box(cx,0,0.5, tw,RUB+1.5,T+3, 0, PAL.abRubble, 'rubble'); F.box(cx,RUB+1.5,0.5, tw,WB-RUB-1.5,T+3, 0, plateCol(F), 'rust');
        F.box(cx,WB,1.75, tw,10.5-WB,3.5, 0, plateCol(F), 'rust');
        F.box(cx,10.5,1.75, tw+0.2,0.4,3.7, 0, PAL.abLacquer, 'relief'); });
      F.box(0,gh,0.5, gw,WB-gh,T+3, 0, plateCol(F), 'rust'); F.box(0,WB,1.75, gw,10.5-WB,3.5, 0, plateCol(F), 'rust');     /* the lintel, under and beside the walkway */
      F.box(0,gh-0.3,2.0, gw,0.3,0.4, 0, PAL.abLacquer, 'plaster');
      F.box(0,WB,-1.25, 2*gx,0.15,2.5, 0, F.pick(PLANKC), 'plank');                                                       /* the walkway: a gallery behind the towers, over the gate */
      LOCUS.rail(F, -gx,-2.45, gx,-2.45, WALK, F.pick(TIMBERC), 1.0);
      [-1,1].forEach(function(s){ F.door(s*(gw/2+tw/2), 0.02, 0,-1, 1.0, 2.2, PLANKC[3], WALK); });                       /* doors into the towers' upper rooms */
      /* the gate leaves, swung open */
      [-1,1].forEach(function(s){ F.box(s*(gw/2-0.15),0,2.6, 0.15,gh-0.2,2.9, 0, F.pick(PLANKC), 'plank'); });
      ABYSS.swoopRoof(F, 0,0.5, gw+2*tw, T+3, 4.2, { y0:10.9, horn:2.4, over:0.9 });
      ABYSS.lantern(F, -2.2,gh-0.4,3.6, true); ABYSS.lantern(F, 2.2,gh-0.4,3.6, true); } });

  ASSET({ key:'abyss_wall_run', name:'Wall run (demo of the joins)', family:'civic', kit:'abyss', group:'Walls', culture:'abyssal-desert', types:['infrastructure'], tags:['demo'],
    wealth:[0.5,0.5], w:74, d:22, h:18, variants:1,
    build:function(F){ var x0=-30, z=5;
      ABYSS.sub(F, 'abyss_wall_seg',    x0+6,  z, 0);
      ABYSS.sub(F, 'abyss_wall_tower',  x0+12, z, 0);
      ABYSS.sub(F, 'abyss_wall_seg',    x0+18, z, 0);
      ABYSS.sub(F, 'abyss_wall_gate',   x0+36, z, 0);
      ABYSS.sub(F, 'abyss_wall_seg',    x0+54, z, 0);
      ABYSS.sub(F, 'abyss_wall_corner', x0+60, z, 0);
      ABYSS.sub(F, 'abyss_wall_seg',    x0+60, z-6, PI/2);             /* turning: the run beyond goes along -z, its outside facing +x */
    } });

  /* =============================================================== FORTRESS */
  ASSET({ key:'abyss_fortress', name:'Citadel on the rubble mound', family:'civic', kit:'abyss', group:'Military', culture:'abyssal-desert', types:['military','civic'],
    wealth:[0.6,1.0], w:72, d:72, h:28, variants:1, sim:{ activity:'GARRISON', capacity:400 },
    build:function(F){ var M=4.0, S=24;
      var MB=70, MT=MB*0.84;                                    /* fr8 battered 0.84: the top is 58.8 m, so the corner towers (r 4.5 at +-24) stand on it */
      F.fr8(0,0,0, MB,M,MB, 0, PAL.abRubble, 'rubble'); F.box(0,M-0.05,0, MT-0.3,0.1,MT-0.3, 0, PAL.abSalt, 'plaster');
      /* the circuit, from the wall system's own pieces: front = segment, gate, segment; the other sides four segments each */
      var o={ ly:M };
      ABYSS.sub(F, 'abyss_wall_seg', -18,S, 0, o); ABYSS.sub(F, 'abyss_wall_gate', 0,S, 0, o); ABYSS.sub(F, 'abyss_wall_seg', 18,S, 0, o);
      [-18,-6,6,18].forEach(function(t){ ABYSS.sub(F, 'abyss_wall_seg', t,-S, PI, o); ABYSS.sub(F, 'abyss_wall_seg', -S,t, -PI/2, o); ABYSS.sub(F, 'abyss_wall_seg', S,t, PI/2, o); });
      [[-S,-S,PI],[S,-S,PI/2],[S,S,0],[-S,S,-PI/2]].forEach(function(c){ ABYSS.sub(F, 'abyss_wall_corner', c[0],c[1], c[2], o); });   /* turned so its two walkway doors face the two runs */
      ABYSS.sub(F, 'abyss_wall_tower', 0,-S, PI, o); ABYSS.sub(F, 'abyss_wall_tower', -S,0, -PI/2, o); ABYSS.sub(F, 'abyss_wall_tower', S,0, PI/2, o);   /* same yaw as their segments: doors on the walkway */
      /* the approach: a broad flight up the mound to the gate */
      ABYSS.flight(F, 0,MT/2+M*1.15, 0,-1, 0,M, 6.0);                                         /* its top tread lands on the mound's top edge */
      /* inside: the keep under a swoop roof, two silo stores, the lattice signal mast with dishes, a drill yard */
      var kc=PASTELC[5]; F.box(0,M,-8, 20,6,11, 0, kc, 'plaster'); F.box(0,M,-8, 20.2,0.8,11.2, 0, PAL.abLacquer, 'plaster');
      F.door(0,-8+5.52, 0,1, 2.2, 3.4, PAL.abLacquer, M); [-6,-3,3,6].forEach(function(x){ LOCUS.lattice(F, x,M+4.2,-2.48, 0,1, 1.4,2.0); });
      ABYSS.swoopRoof(F, 0,-8, 20, 11, 7.0, { y0:M+6.4, horn:3.6, over:1.4 });
      ABYSS.vessel(F, 'silo', -15,M,-12, { r:3.0, h:8, col:PAL.abTin, fam:'corrugate', port:true, win:[[PI/2,5]], ladder:0, hatch:true });
      ABYSS.vessel(F, 'silo', -15,M,-3.5, { r:2.6, h:7, col:METALC[1], fam:'corrugate', port:true, win:[[0,4]] });
      ABYSS.lattice(F, 14,-12, 3.2, 16, { y0:M }); ABYSS.antenna(F, 14,M+16,-12, 'mast', { h:3.4 });
      ABYSS.antenna(F, 14.6,M+12,-11.4, 'dish', { r:1.1, face:PI/4 }); ABYSS.antenna(F, 13.4,M+9,-12.6, 'dish', { r:0.9, face:PI });
      ABYSS.furn(F, 'abyss_rack_spears', 8,6, PI, { ly:M }); ABYSS.furn(F, 'abyss_rack_spears', 11,6, PI, { ly:M }); ABYSS.furn(F, 'abyss_brazier', 0,10, 0, { ly:M, variant:1 });
      ABYSS.mast(F, -6,10, M+9, { flag:PAL.abSailRed, finial:PAL.abGild }); ABYSS.mast(F, 6,10, M+9, { flag:PAL.abBrightTeal, finial:PAL.abGild });
    } });

  /* =============================================================== BARRACKS */
  ASSET({ key:'abyss_barracks', name:'Barracks', family:'civic', kit:'abyss', group:'Military', culture:'abyssal-desert', types:['military','multi-family dwelling'],
    wealth:[0.4,0.8], w:52, d:46, h:16, variants:1, sim:{ activity:'GARRISON', capacity:160 },
    build:function(F){ var X=25, Z=21;
      F.box(0,0,0, 2*X,0.1,2*Z, 0, PAL.abSalt, 'plaster');
      /* the palisade: timber posts and salvaged plate, a gate in front */
      [[-X,-Z,X,-Z],[-X,-Z,-X,Z],[X,-Z,X,Z],[-X,Z,-4,Z],[4,Z,X,Z]].forEach(function(s){ var Ls=Math.hypot(s[2]-s[0],s[3]-s[1]), n=Math.round(Ls/2);
        for(var i=0;i<n;i++){ var t=(i+0.5)/n, x=mix(s[0],s[2],t), z=mix(s[1],s[3],t), yaw=Math.atan2(s[2]-s[0],s[3]-s[1])+PI/2;
          F.box(x,0,z, Ls/n+0.04,F.rr(2.6,3.0),0.12, yaw, i%3?F.pick(TIMBERC):plateCol(F), i%3?'timber':'rust'); } });
      [-4,4].forEach(function(x){ F.cyl(x,0,Z, 0.25,4.4, 0, PAL.abLacquer, 'plaster'); F.ball(x,4.6,Z, 0.3, PAL.abGild, 'metal'); });
      /* two long halls down the sides under swoop thatch, doors onto the yard */
      [-1,1].forEach(function(s){ var cx=s*(X-6), hw=8, hl=30, c=PASTELC[s<0?5:1];
        F.box(cx,0,-2, hw,1.2,hl, 0, PAL.abRubble, 'rubble'); F.box(cx,1.2,-2, hw-0.2,2.6,hl-0.2, 0, c, 'plaster');
        for(var k=-3;k<=3;k++){ var z=-2+k*4; F.door(cx-s*(hw/2-0.08), z-1.0, -s,0, 1.0, 2.1, PLANKC[3], 1.2); LOCUS.lattice(F, cx-s*(hw/2-0.08), 2.9, z+1.0, -s,0, 1.0,0.9); }
        ABYSS.swoopRoof(F, cx,-2, hl, hw, 4.8, { y0:3.8, yaw:PI/2, horn:2.6, over:1.0 }); });
      /* the armoury: a row of containers across the back */
      [-9.15,-3.05,3.05,9.15].forEach(function(x,i){ ABYSS.vessel(F, 'container', x,0.1,-Z+2.2, { len:6.1, col:i%2?ABCONTC[4]:ABCONTC[3], door:'side', doorAt:0, win:[] }); });
      ABYSS.corrRoof(F, 0,2.9,-Z+4.2, 25,2.6, 0.3, ABYSS.rust(F), PI); [-12,-4,4,12].forEach(function(x){ F.cyl(x,0,-Z+5.4, 0.08,2.9, 0, F.pick(TIMBERC), 'timber'); });
      /* the watch silo at the front left corner */
      ABYSS.vessel(F, 'silo', -X+3.4,0,Z-3.4, { r:2.6, h:10, col:METALC[1], fam:'corrugate', port:true, win:[[PI/2,8],[0,8]], balcony:9.0, ladder:-PI/4, hatch:true });
      /* the drill yard */
      ABYSS.furn(F, 'abyss_rack_spears', -4,-8, 0); ABYSS.furn(F, 'abyss_rack_spears', 0,-8, 0); ABYSS.furn(F, 'abyss_rack_spears', 4,-8, 0);
      ABYSS.furn(F, 'abyss_armor_stand', -6,4, 0, { variant:1 }); ABYSS.furn(F, 'abyss_armor_stand', 6,4, 0); ABYSS.furn(F, 'abyss_water_butt', 9,-6, 0);
      ABYSS.mast(F, 0,0, 11, { flag:PAL.abSailRed, finial:PAL.abGild, guys:3, guyR:5 });
      ABYSS.lantern(F, -3.5,4.0,Z+0.3, false); ABYSS.lantern(F, 3.5,4.0,Z+0.3, false);
    } });
})();
