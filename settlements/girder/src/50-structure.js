/* ============================== 12. STRUCTURE — GIRDER ==============================
   PLANNER-OWNED. The ancient ruin and the load-bearing timber the beast-riders
   hung on it: the four towers (cyclopean columns, floor plates, girders,
   bracing, core walls, switchback stairs, the ragged unfinished top), the
   roost decks with their stall frames and perch beams, rope bridges, lift
   headframes, the palisade with wall-walk, watch posts and gatehouses, and the
   road slabs. NO dwellings, farms, hall, market, furnishings, vines or lamps —
   see 55-arch.js, 58-overgrowth.js, 72-lights.js.                            */
reseed(500001);
var STRUCT = { planks:0, plates:0, columns:0, girders:0, stakes:0 };
function yawX(dx,dz){ return Math.atan2(-dz,dx); }          /* aim local +x along (dx,dz) */
function yawZ(dx,dz){ return Math.atan2(dx,dz); }           /* aim local +z along (dx,dz) */
var STAIR_N = 12;                                           /* steps per flight: 2.5 m in risers of 0.21 m, treads of 0.73 m */

function buildTower(T){
  var conc = pick(CONCRETEC), rustA = RUSTC[T.id%RUSTC.length], y0 = T.y0 - 3, top = T.top;
  /* --- columns: 4 x 4, 3.2 m square, some running on past the roof as broken stubs --- */
  COL_LINES.forEach(function(cx,i){ COL_LINES.forEach(function(cz,j){
    var edge = (i===0||i===3||j===0||j===3), over = chance(0.55) ? rr(2,13) : 0.4;
    BOX(T.x+cx, y0, T.z+cz, 3.2, top-y0+over, 3.2, 0, shade(RUSTC[(i+j+T.id)%RUSTC.length], edge?0:-0.12), 'rust'); STRUCT.columns++;
    if(over > 2) for(var rb=0; rb<4; rb++) ROD(T.x+cx+rr(-1.2,1.2), top+over-0.2, T.z+cz+rr(-1.2,1.2), T.x+cx+rr(-1.8,1.8), top+over+rr(1.2,3.4), T.z+cz+rr(-1.8,1.8), 0.07, PAL.rustStain[0], 'rust');
  }); });
  /* --- floor plates, bay by bay; the core bay is cut for the stair well ---
     No coplanar faces (they flickered at a distance): neighbouring bays ABUT on the bay lines (they used to
     overlap by 2 cm, so their tops fought in a strip along every seam), and the outer bays stand PLATE_LIP proud
     of the edge columns' outer faces (they ended 1 cm out, which fought where a plate edge crossed a column). */
  var PLATE_LIP = 0.06, bayLo = function(b){ return b<0 ? -(T.half+PLATE_LIP) : b>0 ? 8 : -8; },
      bayHi = function(b){ return b<0 ? -8 : b>0 ? T.half+PLATE_LIP : 8; };
  T.floors.forEach(function(F){
    var yb = F.y - SLAB;
    for(var bi=-1;bi<=1;bi++) for(var bj=-1;bj<=1;bj++){
      if(F.missing.indexOf(bi+','+bj) >= 0) continue;
      var pc = shade(conc, rr(-0.10,0.06));
      if(bi||bj){ BOX(T.x+(bayLo(bi)+bayHi(bi))/2, yb, T.z+(bayLo(bj)+bayHi(bj))/2, bayHi(bi)-bayLo(bi), SLAB, bayHi(bj)-bayLo(bj), 0, pc, 'concrete'); STRUCT.plates++; }
      else if(F.k < TOWER_N){
        BOX(T.x-6.2, yb, T.z, 3.6, SLAB, 16, 0, pc, 'concrete');                       /* west landing */
        BOX(T.x+1.8, yb, T.z-6.1, 12.4, SLAB, 3.8, 0, pc, 'concrete');                 /* north + south strips */
        BOX(T.x+1.8, yb, T.z+6.1, 12.4, SLAB, 3.8, 0, pc, 'concrete');
      }
    }
    /* perimeter spandrel girders + the interior girder lines under the plate. The spandrel's outer face stands 10 cm
       inside the columns' outer faces (it was flush with them, and fought) */
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f){
      BOX(T.x+f[0]*(T.half-0.45), yb-0.9, T.z+f[1]*(T.half-0.45), f[0]?0.7:48, 1.5, f[0]?48:0.7, 0, shade(rustA, rr(-0.12,0.08)), 'rust'); STRUCT.girders++; });
    [-8,8].forEach(function(c){
      BOX(T.x+c, yb-0.8, T.z, 0.9, 0.8, 47, 0, shade(rustA,-0.18), 'rust'); BOX(T.x, yb-0.8, T.z+c, 47, 0.8, 0.9, 0, shade(rustA,-0.18), 'rust'); STRUCT.girders+=2; });
    if(F.k < TOWER_N){
      /* core walls on three sides (the west side is the corridor out to the gallery) */
      BOX(T.x, F.y, T.z-7.6, 16, F.H, 0.8, 0, shade(conc,-0.18), 'concrete'); BOX(T.x, F.y, T.z+7.6, 16, F.H, 0.8, 0, shade(conc,-0.18), 'concrete');
      BOX(T.x+7.6, F.y, T.z, 0.8, F.H, 14.4, 0, shade(conc,-0.18), 'concrete');
      /* the switchback: two concrete flights of STAIR_N steps on a sloped soffit, and a half landing. Flight one
         rises east along z-2.6 from the floor to the landing, flight two west along z+2.6 to the next floor: the
         same lines as the walker's ramps (83-walk.js) and stairPts(). In the kit's 'YXZ' Euler a POSITIVE pitch
         tips local +z DOWN, so a slab that rises along +z takes -pit (the old slabs had +pit and fell the wrong
         way, with the rails running through them). */
      var rise = TOWER_FH/2, run = 8.8, L = Math.hypot(run,rise), pit = Math.atan2(rise,run), rh = rise/STAIR_N, tr = run/STAIR_N;
      [[-2.6, 1, F.y], [2.6, -1, F.y+rise]].forEach(function(fl){
        var z = T.z+fl[0], dir = fl[1], yA = fl[2], x0 = T.x-dir*run/2;
        BOX(T.x, yA+rise/2-0.4*Math.cos(pit)-0.03, z, 3.0, 0.4, L, [-pit, yawZ(dir,0), 0], shade(conc,-0.02), 'concrete');
        for(var st=0; st<STAIR_N; st++)
          BOX(x0+dir*(st+0.5)*tr, yA+st*rh-0.06, z, tr+0.02, rh+0.06, 3.0, 0, shade(conc,0.05+0.02*(st%2)), 'concrete');
        /* the handrail over the well side, a metre above the nosings, on posts at both ends */
        var zr = z+(dir>0?1.45:-1.45);
        ROD(x0, yA+1.0, zr, x0+dir*run, yA+rise+1.0, zr, 0.04, PAL.rustStain[0], 'rust');
        ROD(x0+dir*0.3, yA+rh, zr, x0+dir*0.3, yA+1.0+0.3*rise/run, zr, 0.035, PAL.rustStain[0], 'rust');
        ROD(x0+dir*(run-0.3), yA+rise, zr, x0+dir*(run-0.3), yA+rise+1.0-0.3*rise/run, zr, 0.035, PAL.rustStain[0], 'rust');
      });
      BOX(T.x+6.0, F.y+rise-0.5, T.z, 3.2, 0.5, 8.2, 0, shade(conc,-0.05), 'concrete');
      /* a rail across the well at the landing's open edge (the walker's 'well' solid stands under it) */
      ROD(T.x+4.45, F.y+rise+1.0, T.z-1.15, T.x+4.45, F.y+rise+1.0, T.z+1.15, 0.04, PAL.rustStain[0], 'rust');
    }
    REGISTER({ name:T.name, kind:F.kind, label: F.k===TOWER_N ? 'Unfinished roof plate' : 'Floor '+(F.k+1)+' — '+(F.kind==='inhabited' ? (F.k<6?'lower dwellings':'upper dwellings') : 'abandoned, overgrown'),
               x:T.x, z:T.z, y:yb, h:TOWER_FH, r:T.half*1.45, hx:T.half, hz:T.half, lvl:F.k });
  });
  /* --- X-bracing in the middle bay of every face, two storeys at a time, with gaps where it has fallen --- */
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f, fi){
    for(var k=0;k<TOWER_N;k+=2){
      if(chance(0.22)) continue;
      var ya=T.floors[k].y, yb2=T.floors[Math.min(TOWER_N,k+2)].y-SLAB, px=T.x+f[0]*(T.half-0.4), pz=T.z+f[1]*(T.half-0.4);
      var ax=f[0]?0:-8, az=f[1]?0:-8;
      BEAM(px+ax, ya, pz+az, px-ax, yb2, pz-az, 0.55, 0.55, shade(rustA,-0.08), 'rust');
      if(!chance(0.25)) BEAM(px-ax, ya, pz-az, px+ax, yb2, pz+az, 0.55, 0.55, shade(rustA,-0.2), 'rust');
    }
  });
  /* --- the unfinished crown: two more storeys of bare frame over part of the plan, a fallen girder or two --- */
  for(var lv=1; lv<=2; lv++){
    var yy = top + lv*TOWER_FH - 0.8;
    COL_LINES.forEach(function(c,i){ if(chance(lv===1?0.7:0.4)){
      BOX(T.x+c, yy, T.z, 0.8, 0.8, chance(0.5)?47:rr(18,34), 0, shade(rustA,-0.1), 'rust');
      if(chance(0.6)) BOX(T.x, yy, T.z+c, chance(0.5)?47:rr(18,34), 0.8, 0.8, 0, shade(rustA,-0.2), 'rust'); } });
  }
  for(var fg=0; fg<3; fg++){ var fx=T.x+rr(-18,18), fz=T.z+rr(-18,18);
    BEAM(fx, top+0.3, fz, fx+rr(-14,14), top+rr(2,7), fz+rr(-14,14), 0.7, 0.7, PAL.rustStain[fg%2], 'rust'); }
  /* --- plinth steps up to the ground floor on all four sides --- */
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f){
    for(var st=0; st<3; st++) BOX(T.x+f[0]*(T.half+1.0+st*0.9), T.y0-0.4, T.z+f[1]*(T.half+1.0+st*0.9), f[0]?1.0:14, 0.4+(0.6-0.2*st), f[0]?14:1.0, 0, shade(conc,-0.1), 'concrete'); });
  REGISTER({ name:T.name, kind:'tower', label:'Ancient tower (30 storeys)', x:T.x, z:T.z, y:T.y0, h:top-T.y0+16, r:T.half*1.5, hx:T.half+1, hz:T.half+1 });
}

/* ------------------------------------------------------------------ roost decks */
function buildDeck(P){
  var T=P.tower, Lf=T.lift, y=P.y, pa=pick(PLANKC), pb=shade(pa,-0.14), th=0.6, H=P.half, I=P.inner+0.15;
  function strip(x0,x1,z0,z1){ if(x1-x0<0.1||z1-z0<0.1) return; BOX(T.x+(x0+x1)/2, y-th, T.z+(z0+z1)/2, x1-x0, th, z1-z0, 0, (Math.round(x0+z0)&1)?pa:pb, 'plank'); }
  /* four strips; the one the lift comes up through is split round a 5 x 5 notch */
  strip(-H,H,-H,-I); strip(-H,H,I,H);
  [[-H,-I],[I,H]].forEach(function(xr){
    var lx=Lf.x-T.x, lz=Lf.z-T.z;
    if(lx > xr[0] && lx < xr[1]){ strip(xr[0],xr[1],-I,lz-2.6); strip(xr[0],xr[1],lz+2.6,I); strip(xr[0],lx-2.6,lz-2.6,lz+2.6); strip(lx+2.6,xr[1],lz-2.6,lz+2.6); }
    else strip(xr[0],xr[1],-I,I);
  });
  /* rim beam + raking struts back to the columns three storeys down */
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f){
    BOX(T.x+f[0]*H, y-th-0.5, T.z+f[1]*H, f[0]?0.5:2*H, 0.9, f[0]?2*H:0.5, 0, TIMBERC[2], 'timber');
    for(var t=-H+4; t<=H-4; t+=8.5){
      var ex=f[0]?f[0]*(H-1.5):t, ez=f[1]?f[1]*(H-1.5):t, sx=f[0]?f[0]*T.half:clamp(t,-T.half,T.half), sz=f[1]?f[1]*T.half:clamp(t,-T.half,T.half);
      BEAM(T.x+sx, y-15, T.z+sz, T.x+ex, y-th, T.z+ez, 0.75, 0.75, TIMBERC[(Math.round(t)&3)], 'timber');
    }
  });
  /* stall frames: posts, partitions, a lean-to shingle roof and a perch beam per roost */
  ROOSTS.forEach(function(R){
    if(R.plat!==P) return;
    var tx=-R.oz, tz=R.ox, w=R.w, dep=9.2, pit=Math.asin(1.7/dep), ry=yawZ(R.ox,R.oz);
    var cx=R.x-R.ox*(dep/2-1.4), cz=R.z-R.oz*(dep/2-1.4);
    [-1,1].forEach(function(sg){
      BOX(R.x+tx*sg*w/2-R.ox*0.2, y, R.z+tz*sg*w/2-R.oz*0.2, 0.4, 5.8, 0.4, 0, TIMBERC[0], 'timber');
      BOX(R.x+tx*sg*w/2-R.ox*(dep-1.4), y, R.z+tz*sg*w/2-R.oz*(dep-1.4), 0.4, 7.4, 0.4, 0, TIMBERC[0], 'timber');
      BOX(cx+tx*sg*w/2, y, cz+tz*sg*w/2, R.ox?dep-1:0.2, 2.2, R.ox?0.2:dep-1, 0, pick(WALLDARKC), 'wall');
    });
    BOX(cx, y+6.55, cz, w+0.5, 0.22, dep+1.2, [pit, ry, 0], pick(SHINGLEC), 'shingle');
    BEAM(R.x-R.ox*1.5, y+0.25, R.z-R.oz*1.5, R.x+R.ox*3.4, y+0.25, R.z+R.oz*3.4, 0.55, 0.45, TIMBERC[1], 'timber');     /* perch / launch beam */
  });
  /* railings on the corner aprons and either side of each bridgehead */
  function rail(ax,az,bx,bz){ var L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/2.6));
    for(var i=0;i<=n;i++) BOX(mix(ax,bx,i/n), y, mix(az,bz,i/n), 0.16, 1.1, 0.16, 0, TIMBERC[1], 'timber');
    BEAM(ax,y+1.05,az,bx,y+1.05,bz,0.12,0.1,TIMBERC[0],'timber'); BEAM(ax,y+0.55,az,bx,y+0.55,bz,0.08,0.08,TIMBERC[2],'timber'); }
  var C=H-0.25, E=H-DECK_W*0.55;
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ rail(T.x+c[0]*C,T.z+c[1]*C, T.x+c[0]*E,T.z+c[1]*C); rail(T.x+c[0]*C,T.z+c[1]*C, T.x+c[0]*C,T.z+c[1]*E); });
  /* inner rail along the lift notch */
  REGISTER({ name:P.name, kind:'roostdeck', label:'Roost deck', plat:P.id, x:P.x, z:P.z, y:y-th, h:9, r:H*1.45, hx:H, hz:H });
}

/* ------------------------------------------------------------------ rope bridges */
function buildBridge(br){
  var ax=br.a.x, az=br.a.z, bx=br.b.x, bz=br.b.z, dx=bx-ax, dz=bz-az, L=br.L, ux=dx/L, uz=dz/L;
  var ry = Math.atan2(ux,uz), n = Math.max(4, Math.round(L/0.55)), pc = pick(PLANKC);
  var sx = uz*(br.w*0.5), sz = -ux*(br.w*0.5);
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n, y=bridgeY(br,t), slope=(bridgeY(br,t+0.01)-bridgeY(br,t-0.01))/(0.02*L);
    BOX(ax+dx*t, y-0.09, az+dz*t, br.w, 0.08, L/n*0.80, [-Math.atan(slope), ry, 0], (i%7===3)?shade(pc,-0.15):pc, 'plank'); STRUCT.planks++;
  }
  var m = Math.max(3, Math.round(L/3.2));
  for(var j=0;j<m;j++){
    var t0=j/m, t1=(j+1)/m, y0=bridgeY(br,t0), y1=bridgeY(br,t1);
    [-1,1].forEach(function(sg){
      var x0=ax+dx*t0+sx*sg, z0=az+dz*t0+sz*sg, x1=ax+dx*t1+sx*sg, z1=az+dz*t1+sz*sg;
      ROD(x0,y0-0.12,z0, x1,y1-0.12,z1, 0.07, ROPEC[1], 'rope');          /* deck cable */
      ROD(x0,y0+1.15,z0, x1,y1+1.15,z1, 0.05, ROPEC[0], 'rope');          /* hand rope */
      ROD(x0,y0+0.60,z0, x1,y1+0.60,z1, 0.03, ROPEC[0], 'rope');
      ROD(x1,y1-0.12,z1, x1,y1+1.15,z1, 0.025, ROPEC[1], 'rope');         /* suspender */
      var xm=(x0+x1)/2, zm=(z0+z1)/2, ym=(y0+y1)/2;
      ROD(xm,ym-0.12,zm, xm,ym+1.15,zm, 0.025, ROPEC[1], 'rope');
    });
  }
  /* portal posts at both heads */
  [br.a, br.b].forEach(function(h){
    [-1,1].forEach(function(sg){
      BOX(h.x+sx*sg*1.08, h.y, h.z+sz*sg*1.08, 0.34, 3.1, 0.34, ry, TIMBERC[0], 'timber');
    });
    BEAM(h.x+sx*1.08, h.y+2.9, h.z+sz*1.08, h.x-sx*1.08, h.y+2.9, h.z-sz*1.08, 0.26, 0.26, TIMBERC[2], 'timber');
    h.lampAt = [h.x, h.y+2.55, h.z];                                       /* 72-lights.js hangs a lantern here */
  });
  REGISTER({ name:'Rope bridge', kind:'bridge', label:br.a.plat.name+' ↔ '+br.b.plat.name, x:(ax+bx)/2, z:(az+bz)/2,
             y:Math.min(br.a.y,br.b.y)-br.sag-0.5, h:br.sag+3, r:Math.max(3,L*0.5), bridge:br.id, seg:[ax,az,bx,bz,br.w] });
}


/* ------------------------------------------------------------------ lifts */
function buildLift(Lf){
  var ox=Lf.ox, px=0, pz=1, top=Lf.y1+7.5;
  [-1,1].forEach(function(sg){
    BOX(Lf.x-ox*2.9, Lf.y1, Lf.z+sg*2.9, 0.45, 7.8, 0.45, 0, TIMBERC[0], 'timber');
    BOX(Lf.x+ox*2.9, Lf.y1, Lf.z+sg*2.9, 0.45, 7.8, 0.45, 0, TIMBERC[0], 'timber');
    BEAM(Lf.x-ox*3.2, top, Lf.z+sg*2.9, Lf.x+ox*3.2, top, Lf.z+sg*2.9, 0.4, 0.4, TIMBERC[2], 'timber');
    ROD(Lf.x+sg*0, Lf.y0, Lf.z+sg*1.9, Lf.x, top, Lf.z+sg*1.9, 0.05, ROPEC[1], 'rope');             /* guide ropes */
  });
  BEAM(Lf.x, top+0.2, Lf.z-3.2, Lf.x, top+0.2, Lf.z+3.2, 0.5, 0.5, TIMBERC[1], 'timber');
  CYL(Lf.x, top-0.8, Lf.z, 0.7, 0.5, 0, TIMBERC[3], 'timber');
  var C=Lf.capstan; CYL(C.x, C.y, C.z, 1.1, 2.2, 0, TIMBERC[0], 'timber');
  BEAM(C.x, C.y+1.6, C.z-5, C.x, C.y+1.6, C.z+5, 0.3, 0.3, TIMBERC[2], 'timber');
  ROD(C.x, C.y+2.0, C.z, Lf.x+ox*0.5, top-0.5, Lf.z, 0.06, ROPEC[0], 'rope');
  BOX(Lf.x, Lf.y0-0.25, Lf.z, 5, 0.3, 5, 0, PLANKC[1], 'plank');
  REGISTER({ name:Lf.tower.name, kind:'lift', label:'Beast-drawn lift', x:Lf.x, z:Lf.z, y:Lf.y0, h:top-Lf.y0, r:3.4 });
  REGISTER({ name:Lf.tower.name, kind:'capstan', label:'Lift capstan', x:C.x, z:C.z, y:C.y, h:4, r:6 });
}

/* ------------------------------------------------------------------ palisade, wall-walk, watch posts, gates, roads */
function buildPalisade(){
  var R=PALISADE.R, n=Math.round(TAU*R/0.95), F=platFrame(0,0,0);
  for(var i=0;i<n;i++){
    var a=i/n*TAU, x=Math.cos(a)*R, z=Math.sin(a)*R, gate=false;
    GATES.forEach(function(g){ if(Math.hypot(x-g.x,z-g.z) < 5.2) gate=true; });
    if(gate) continue;
    var h=PALISADE.h+rr(-0.5,0.9), y=terrainH(x,z)-0.8, c=TIMBERC[i%4];
    push('cyl6',KIT_LOOK?'tarred':'timber',[x,y,z,0.46,h+0.8,0.46,0,shade(c,rr(-0.15,0.1))]);   /* the library look: tar-sealed stakes */ CONE(x, y+h+0.8, z, 0.46, 1.1, 0, shade(c,-0.1), 'timber'); STRUCT.stakes++;
  }
  /* wall-walk: a plank ledge inside the wall, 3.6 m up, on posts */
  var ww=SETTLE_Y+3.6;
  for(var s=0;s<2;s++){ var a0=GATES[s].a+0.045, a1=GATES[(s+1)%2].a-0.045+(s?TAU:0);
    SECTOR('plank', F, R-2.4, R-0.5, a0, a1, ww-0.25, ww, PLANKC[2], { step:3, faces:'tbi' });
    SECTOR('timber', F, R-2.5, R-2.4, a0, a1, ww+0.95, ww+1.05, TIMBERC[0], { step:3, faces:'tbio' }); }
  for(var p=0;p<140;p++){ var pa=p/140*TAU, gx=Math.cos(pa)*(R-2.3), gz=Math.sin(pa)*(R-2.3), skip=false;
    GATES.forEach(function(g){ if(Math.hypot(gx-g.x,gz-g.z) < 8) skip=true; }); if(skip) continue;
    BOX(gx, SETTLE_Y-0.3, gz, 0.26, 4.0+((p%3===0)?1.1:0), 0.26, -pa, TIMBERC[p%4], 'timber'); }
  /* eight watch posts */
  PALISADE.posts=[];
  for(var w=0;w<8;w++){ var wa=w/8*TAU+TAU/16, wx=Math.cos(wa)*(R-3.2), wz=Math.sin(wa)*(R-3.2), wy=SETTLE_Y;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ BOX(wx+c[0]*1.7, wy-0.3, wz+c[1]*1.7, 0.36, 10.4, 0.36, 0, TIMBERC[0], 'timber'); });
    BOX(wx, wy+7.6, wz, 4.6, 0.3, 4.6, 0, PLANKC[0], 'plank'); PYR(wx, wy+10.0, wz, 6.0, 2.6, 6.0, 0, pick(THATCHC), 'thatch');
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(f){ BOX(wx+f[0]*2.2, wy+7.9, wz+f[1]*2.2, f[0]?0.12:4.6, 1.0, f[0]?4.6:0.12, 0, pick(WALLDARKC), 'wall'); });
    for(var r=0;r<16;r++) ROD(wx-1.4, wy+0.3+r*0.46, wz-2.0, wx-0.8, wy+0.3+r*0.46, wz-2.0, 0.035, TIMBERC[3], 'timber');
    ROD(wx-1.4,wy,wz-2.0,wx-1.4,wy+7.7,wz-2.0,0.05,ROPEC[0],'rope'); ROD(wx-0.8,wy,wz-2.0,wx-0.8,wy+7.7,wz-2.0,0.05,ROPEC[0],'rope');
    PALISADE.posts.push({ x:wx, y:wy+7.9, z:wz, a:wa });
    REGISTER({ name:'Watch post '+(w+1), kind:'watch', label:'Palisade watch post', x:wx, z:wz, y:wy, h:13, r:3.6 });
  }
  /* gatehouses: two towers, a lintel walk, gate leaves standing open */
  GATES.forEach(function(g){
    var tx=1, tz=0, y=SETTLE_Y, inx=-Math.cos(g.a), inz=-Math.sin(g.a);
    [-1,1].forEach(function(sg){
      BOX(g.x+sg*6.6, y-0.5, g.z, 4.2, 11.5, 4.2, 0, TIMBERC[2], 'timber'); BOX(g.x+sg*6.6, y+11.0, g.z, 5.2, 0.3, 5.2, 0, PLANKC[0], 'plank');
      PYR(g.x+sg*6.6, y+13.4, g.z, 6.6, 3.0, 6.6, 0, pick(SHINGLEC), 'shingle');
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ BOX(g.x+sg*6.6+c[0]*2.3, y+11.3, g.z+c[1]*2.3, 0.28, 2.2, 0.28, 0, TIMBERC[0], 'timber'); });
      /* a leaf swung inward */
      BOX(g.x+sg*4.4+sg*0.0, y, g.z+inz*2.3, 0.3, 5.6, 4.4, 0, WALLDARKC[1], 'wall');
    });
    BOX(g.x, y+6.4, g.z, 9.2, 0.9, 1.0, 0, TIMBERC[1], 'timber'); BOX(g.x, y+7.3, g.z, 9.2, 0.25, 3.2, 0, PLANKC[1], 'plank');
    g.lampAt=[[g.x-4.2,y+5.4,g.z+inz*1.2],[g.x+4.2,y+5.4,g.z+inz*1.2]];
    REGISTER({ name:g.name, kind:'gate', label:'Palisade gatehouse', x:g.x, z:g.z, y:y, h:16, r:10 });
  });
  REGISTER({ name:'The palisade', kind:'palisade', label:'Timber palisade and wall-walk', x:0, z:0, y:SETTLE_Y-1, h:9, r:R+2, ring:R-4 });
}
function buildRoads(){
  var c0=shade(PAL.soil[1],-0.05);
  ROADS.forEach(function(r,i){ var L=Math.hypot(r[2]-r[0],r[3]-r[1]);
    BOX((r[0]+r[2])/2, SETTLE_Y-0.12, (r[1]+r[3])/2, r[4], 0.2+i*0.004, L+(i>3?r[4]:0), yawZ(r[2]-r[0],r[3]-r[1]), shade(c0, (i%2)*0.04), 'rock'); });
  SECTOR('rock', platFrame(0,0,0), HALL.R+3.5, HALL.R+10.5, 0, TAU, SETTLE_Y-0.12, SETTLE_Y+0.1, shade(c0,0.06), { step:4, faces:'to' });
  SECTOR('rock', platFrame(0,0,0), PAL_R-10.5, PAL_R-5.5, 0, TAU, SETTLE_Y-0.12, SETTLE_Y+0.07, shade(c0,-0.04), { step:5, faces:'t' });
  /* the track out of each gate, and a plank bridge where the south track meets the brook */
  GATES.forEach(function(g){ for(var k=0;k<9;k++){ var t0=1+k*0.05, x=g.x*t0, z=g.z*(1+k*0.06); if(g.z>0 && Math.abs(z-292)<11) continue; /* the forest pass's footbridge crosses the brook here */ BOX(x, terrainH(x,z)-0.1, z, 6, 0.22, 11.5, 0, shade(c0,0.02), 'rock'); } });
}

TOWERS.forEach(buildTower);
PLATS.forEach(buildDeck);
BRIDGES.forEach(buildBridge);
LIFTS.forEach(buildLift);
buildPalisade();
buildRoads();
window._struct = STRUCT;
