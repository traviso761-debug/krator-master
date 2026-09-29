/* ============================== 12. STRUCTURE ==============================
   PLANNER-OWNED. The load-bearing fabric of every platform, exactly as
   30-layout.js planned it: decks and floors (with stair wells cut out), rim
   fascias, railings, gallery posts, core walls, room partitions, stairs,
   under-struts, satellite cradles, rope bridges, the gate ramps with their
   landing stages, ladders and lift frames, and the council stair.
   It builds NO buildings, room fronts, furnishings or lamps — see 55-arch.js
   and 56-levels.js. Those passes read the same PLATS/levels/slots/rooms.   */
reseed(500001);

var STRUCT = { planks:0, posts:0, stairs:0, struts:0 };
function laneHalfAng(P,r){ return (laneW(P)*0.5)/Math.max(3,r); }

/* stair wells cut into the floor of level k (the flight going DOWN from it) */
function wellsFor(P, k){
  if(k >= P.levels.length-1) return [];
  return P.bays.map(function(B){
    var st = stairOf(P,B,k), rm=(st.rTop+st.rBot)/2, ha=laneHalfAng(P,rm);
    return { a0:st.angA-ha, a1:st.angA+ha, r0:st.rBot, r1:st.rTop };
  });
}

function buildStair(P, B, k){
  var st = stairOf(P,B,k);
  var pt = platXZ(P, st.rTop, st.angA), pb = platXZ(P, st.rBot, st.angA);
  var hx = pb[0]-pt[0], hz = pb[1]-pt[1], run = Math.hypot(hx,hz)||1, L = Math.hypot(run, st.rise);
  var ry = Math.atan2(hx,hz), w = P.main ? LANE_W-0.5 : 1.5;
  var n = Math.max(6, Math.round(st.rise/0.30)), tcol = pick(PLANKC);
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    BOX(pt[0]+hx*t, st.yTop - st.rise*(i+1)/n, pt[1]+hz*t, w, 0.08, run/n+0.10, ry, tcol, 'plank');
  }
  /* stringers under both edges, and a rope handrail each side */
  var ox = hz/run*(w*0.5-0.08), oz = -hx/run*(w*0.5-0.08);
  [-1,1].forEach(function(sg){
    BEAM(pt[0]+ox*sg, st.yTop-0.32, pt[1]+oz*sg, pb[0]+ox*sg, st.yBot-0.32, pb[1]+oz*sg, 0.16, 0.30, TIMBERC[2], 'timber');
    ROD (pt[0]+ox*sg, st.yTop+1.0,  pt[1]+oz*sg, pb[0]+ox*sg, st.yBot+1.0,  pb[1]+oz*sg, 0.035, ROPEC[0], 'rope');
    BOX(pt[0]+ox*sg, st.yTop, pt[1]+oz*sg, 0.14, 1.05, 0.14, ry, TIMBERC[1], 'timber');
    BOX(pb[0]+ox*sg, st.yBot, pb[1]+oz*sg, 0.14, 1.05, 0.14, ry, TIMBERC[1], 'timber');
  });
  STRUCT.stairs++;
}

/* railing round a ring at radius r, skipping angular gaps [[ang, halfWidth]...] */
function railing(P, r, y, gaps, postStep, fam){
  var n = Math.max(8, Math.round(TAU*r*(P.sx+P.sz)*0.5/(postStep||3.0)));
  var open = function(a){ for(var g=0;g<gaps.length;g++) if(angDist(a,gaps[g][0]) < gaps[g][1]) return true; return false; };
  var runStart = null;
  for(var i=0;i<=n;i++){
    var a = i/n*TAU, isOpen = open(a) || i===n;
    if(!isOpen){
      var p = platXZ(P, r, a);
      BOX(p[0], y, p[1], 0.16, 1.10, 0.16, -a, TIMBERC[1], 'timber'); STRUCT.posts++;
      if(runStart===null) runStart = a;
    }
    if(isOpen && runStart!==null){
      var a1 = (i-1)/n*TAU;
      if(a1 > runStart){
        SECTOR('timber', P, r-0.07, r+0.07, runStart, a1, y+1.02, y+1.12, TIMBERC[0], {faces:'tbio', step:3.5});
        SECTOR('timber', P, r-0.05, r+0.05, runStart, a1, y+0.52, y+0.60, TIMBERC[2], {faces:'tbio', step:3.5});
      }
      runStart = null;
    }
  }
}

/* ------------------------------------------------------------------ main platforms */
function buildMain(P){
  var plankA = pick(PLANKC), plankB = shade(plankA, -0.12), T = P.tree;
  var isCouncil = P.kind==='council';
  /* --- deck --- */
  var rin0 = isCouncil ? P.holeR : Math.max(1, P.rt - 1.2);
  RING_HOLES('plank', P, rin0, P.R, P.y-SLAB, P.y, plankB, wellsFor(P,0), { colTop:plankA, step:5 });
  SECTOR('timber', P, P.R, P.R+0.4, 0, TAU, P.y-SLAB-0.55, P.y+0.10, TIMBERC[2], { step:5 });            /* rim fascia */
  /* radial joists visible under the deck edge */
  var nj = Math.round(TAU*P.R/6);
  for(var j=0;j<nj;j++){ var ja=j/nj*TAU, p0=platXZ(P,P.R-9,ja), p1=platXZ(P,P.R+0.9,ja);
    BEAM(p0[0],P.y-SLAB-0.30,p0[1], p1[0],P.y-SLAB-0.30,p1[1], 0.35,0.45, TIMBERC[0], 'timber'); }
  var gaps = P.heads.map(function(h){ return [h.ang, (h.w*0.5+0.5)/P.R]; });
  railing(P, P.R-0.25, P.y, gaps, 3.2);
  if(isCouncil) railing(P, P.holeR+0.25, P.y, [[P.spiral.a0 + P.spiral.dir*P.spiral.turns*TAU, 2.2/P.holeR]], 2.4);
  /* stair-well guard rails on the deck */
  P.bays.forEach(function(B){
    if(P.levels.length<2) return;
    var st=stairOf(P,B,0), ha=laneHalfAng(P,(st.rTop+st.rBot)/2);
    [st.angA-ha, st.angA+ha].forEach(function(a){
      var q0=platXZ(P,st.rBot,a), q1=platXZ(P,st.rTop-1.0,a);
      BEAM(q0[0],P.y+1.0,q0[1], q1[0],P.y+1.0,q1[1], 0.10,0.10, TIMBERC[0], 'timber');
      for(var s=0;s<=3;s++){ var qx=mix(q0[0],q1[0],s/3), qz=mix(q0[1],q1[1],s/3); BOX(qx,P.y,qz,0.14,1.05,0.14,-a,TIMBERC[1],'timber'); }
    });
    var e0=platXZ(P,st.rBot-0.1,st.angA-ha), e1=platXZ(P,st.rBot-0.1,st.angA+ha);
    BEAM(e0[0],P.y+1.0,e0[1], e1[0],P.y+1.0,e1[1], 0.10,0.10, TIMBERC[0], 'timber');
  });
  REGISTER({ name:P.name, kind:P.kind, label:'Deck', plat:P.id, x:P.x, z:P.z, y:P.y-SLAB, h:SLAB+30, r:P.R+1 });

  /* --- the levels below --- */
  for(var k=1;k<P.levels.length;k++){
    var Lv = P.levels[k], last = (k===P.levels.length-1);
    var rin = last ? Math.max(1, trunkR(T,Lv.y)-1.0) : Lv.Rin-0.4;
    RING_HOLES('plank', P, rin, Lv.Rout, Lv.y-SLAB, Lv.y, plankB, wellsFor(P,k), { colTop:shade(plankA,-0.06), step:5 });
    SECTOR('timber', P, Lv.Rout, Lv.Rout+0.3, 0, TAU, Lv.y-SLAB-0.35, Lv.y+0.08, TIMBERC[2], { step:5 });
    /* core wall behind the rooms; a gate tree's lowest level is tunnelled through at the ramp */
    var coreCol = shade(pick(WALLDARKC), -0.25);
    if(P.gatePassage && last){
      var ga = P.gatePassage.ang, gh = (LANE_W*0.5+0.4)/Lv.Rin;
      SECTOR('wall', P, Lv.Rin-0.35, Lv.Rin, ga+gh, ga-gh+TAU, Lv.y, Lv.y+Lv.H, coreCol, { faces:'os', step:5 });
      /* passage walls back to the trunk */
      [ga-gh, ga+gh].forEach(function(a){
        var w0=platXZ(P, P.gatePassage.r0-1.5, a), w1=platXZ(P, Lv.Rin, a);
        BOX((w0[0]+w1[0])/2, Lv.y, (w0[1]+w1[1])/2, Math.hypot(w1[0]-w0[0],w1[1]-w0[1]), Lv.H, 0.3, Math.atan2(-(w1[1]-w0[1]), w1[0]-w0[0]), coreCol, 'wall');
      });
    }else SECTOR('wall', P, Lv.Rin-0.35, Lv.Rin, 0, TAU, Lv.y, Lv.y+Lv.H, coreCol, { faces:'o', step:5 });
    /* gallery posts carry the floor above */
    var open = (Lv.kind==='roost' || Lv.kind==='hangar');
    var np = Math.round(TAU*Lv.Rout/(open ? 5.2 : 3.9));
    for(var i=0;i<np;i++){ var a=(i+0.5)/np*TAU, p=platXZ(P, Lv.Rout-0.35, a);
      BOX(p[0], Lv.y, p[1], open?0.55:0.30, Lv.H, open?0.55:0.30, -a, TIMBERC[i%4], 'timber'); STRUCT.posts++; }
    if(!open) railing(P, Lv.Rout-0.25, Lv.y, [], 3.9);
    /* radial partitions at every room boundary */
    var seen = {};
    P.rooms.forEach(function(R){
      if(R.lvl!==k) return;
      [R.a0, R.a1].forEach(function(a){
        var key = Math.round(wrapPi(a)*400); if(seen[key]) return; seen[key]=1;
        var th = 0.14/((R.r0+R.r1)/2);
        SECTOR('wall', P, R.r0, R.r1 - (open?3.5:0), a-th, a+th, Lv.y, Lv.y+Lv.H, pick(WALLDARKC), { faces:'os', step:30 });
      });
    });
    REGISTER({ name:P.name, kind:Lv.kind, label:Lv.label, plat:P.id, lvl:k, x:P.x, z:P.z, y:Lv.y-SLAB, h:Lv.H+SLAB, r:Lv.Rout+1 });
  }
  P.bays.forEach(function(B){ for(var k=0;k<P.levels.length-1;k++) buildStair(P,B,k); });

  /* --- under-struts: great raking timbers from the trunk up to the underside --- */
  if(P.levels.length > 1 || isCouncil){
    var Lb = P.levels[P.levels.length-1], yb = Lb.y - SLAB, ns = isCouncil ? 10 : Math.round(TAU*Lb.Rout/24);
    var drop = isCouncil ? 16 : Math.min(38, Lb.Rout*0.42);
    for(var s=0;s<ns;s++){
      var sa = (s+0.5)/ns*TAU + 0.11, rt2 = trunkR(T, yb-drop) - 0.5;
      var a0 = platXZ(P, rt2, sa), a1 = platXZ(P, Lb.Rout-3.5, sa), am = platXZ(P, (rt2+Lb.Rout)*0.5, sa);
      BEAM(a0[0], yb-drop, a0[1], a1[0], yb-0.2, a1[1], 1.1, 1.1, TIMBERC[s%4], 'timber');
      BEAM(a0[0], yb-drop*0.45, a0[1], am[0], yb-0.2, am[1], 0.7, 0.7, TIMBERC[(s+1)%4], 'timber');
      STRUCT.struts += 2;
    }
    /* a collar ring round the trunk where the struts spring from */
    var rc = trunkR(T, yb-drop);
    SECTOR('timber', platFrame(T.x,T.z,0), rc-0.4, rc+0.9, 0, TAU, yb-drop-1.2, yb-drop+0.6, TIMBERC[2], { step:6 });
  }
}

/* ------------------------------------------------------------------ satellites */
function buildSat(P){
  var plankA = pick(PLANKC), plankB = shade(plankA,-0.14);
  RING_HOLES('plank', P, 0, P.R, P.y-0.5, P.y, plankB, wellsFor(P,0), { colTop:plankA, step:3.2 });
  var gaps = P.heads.map(function(h){ return [h.ang, (h.w*0.5+0.45)/(P.R*0.9)]; });
  railing(P, P.R-0.2, P.y, gaps, 2.6);
  for(var k=1;k<P.levels.length;k++){
    var Lv=P.levels[k], open=(Lv.kind==='roost');
    RING_HOLES('plank', P, 0, Lv.Rout, Lv.y-0.5, Lv.y, plankB, wellsFor(P,k), { colTop:shade(plankA,-0.06), step:3.2 });
    var np = Math.max(6, Math.round(TAU*Lv.Rout/3.4));
    for(var i=0;i<np;i++){ var a=(i+0.5)/np*TAU, p=platXZ(P, Lv.Rout-0.3, a); BOX(p[0],Lv.y,p[1],0.24,Lv.H+0.3,0.24,-a,TIMBERC[i%4],'timber'); }
    if(!open) railing(P, Lv.Rout-0.2, Lv.y, [], 2.8);
    REGISTER({ name:P.name, kind:Lv.kind, label:Lv.label, plat:P.id, lvl:k, x:P.x, z:P.z, y:Lv.y-0.5, h:Lv.H+0.5, r:Lv.Rout+0.6 });
  }
  P.bays.forEach(function(B){ for(var k=0;k<P.levels.length-1;k++) buildStair(P,B,k); });
  /* king post and cradle */
  CYL(P.x, P.yBottom-1.2, P.z, 0.55, P.y - P.yBottom + 1.2, 0, TIMBERC[0], 'timber');
  for(var c=0;c<3;c++){ var ca=c/3*Math.PI + P.ry, R2=P.levels[P.levels.length-1].Rout*0.8;
    BEAM(P.x-Math.cos(ca)*R2, P.yBottom-0.55, P.z-Math.sin(ca)*R2, P.x+Math.cos(ca)*R2, P.yBottom-0.55, P.z+Math.sin(ca)*R2, 0.5,0.5, TIMBERC[2], 'timber'); }
  if(P.support==='over' && P.supPts){
    /* slung beneath a bough: a rope from each rim quarter up to the two hanging points, plus a king rope */
    for(var q0=0;q0<6;q0++){ var qa0=q0/6*TAU+0.3, pr0=platXZ(P,P.R*0.88,qa0), hp=P.supPts[q0%2];
      ROD(pr0[0],P.y+0.1,pr0[1], hp[0],hp[1],hp[2], 0.07, ROPEC[1], 'rope'); }
    P.supPts.forEach(function(hp){ ROD(P.x,P.y+0.2,P.z, hp[0],hp[1],hp[2], 0.10, ROPEC[0], 'rope');
      SECTOR('rope', platFrame(hp[0],hp[2],0), 0, 1, 0, TAU, hp[1]-0.4, hp[1]+0.5, ROPEC[1], {faces:'tbo', step:1}); });
  }
  if(P.support==='under'){
    /* a saddle of cribbed timbers where the platform sits on its bough */
    for(var cb=0;cb<3;cb++) BOX(P.x, P.yBottom-1.9+cb*0.45, P.z, 6-cb*1.2, 0.42, 6-cb*1.2, P.ry+cb*0.78, TIMBERC[cb], 'timber');
  }
  if(P.support==='hang'){
    /* no branch in reach: slung on four cables from the nearest crown */
    var Tn=null, bd=1e9; TREES.forEach(function(T){ var d=Math.hypot(T.x-P.x,T.z-P.z); if(d<bd){bd=d;Tn=T;} });
    var ty = Math.max(P.y+55, Tn.y0+Tn.H*0.80), tr = trunkR(Tn,ty);
    for(var q=0;q<4;q++){ var qa=q/4*TAU+0.4, pr=platXZ(P,P.R*0.85,qa);
      var dx=P.x-Tn.x, dz=P.z-Tn.z, dl=Math.hypot(dx,dz)||1;
      ROD(pr[0],P.y+0.2,pr[1], Tn.x+dx/dl*tr, ty, Tn.z+dz/dl*tr, 0.09, ROPEC[1], 'rope'); }
  }
  REGISTER({ name:P.name, kind:'sat', label:'Bough platform', plat:P.id, x:P.x, z:P.z, y:P.y-0.5, h:14, r:P.R*Math.max(P.sx,P.sz)+0.6 });
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

/* ------------------------------------------------------------------ helical ramps */
function buildSpiral(S){
  var gate = S.kind==='gate', T=S.tree, n = Math.round(S.turns*(gate?44:36)), pc = pick(PLANKC), prev=null;
  for(var i=0;i<=n;i++){
    var t=i/n, y=mix(S.y0,S.y1,t), a=S.a0+S.dir*S.turns*TAU*t, rt=trunkR(T,y);
    var ri=rt-0.5, ro=rt+S.off+S.w*0.5;
    var cur = { y:y, a:a, i:[T.x+Math.cos(a)*ri, T.z+Math.sin(a)*ri], o:[T.x+Math.cos(a)*ro, T.z+Math.sin(a)*ro] };
    if(prev){
      var A=prev, B=cur, cw = S.dir>0;
      var ti=[A.i[0],A.y,A.i[1]], to=[A.o[0],A.y,A.o[1]], ui=[B.i[0],B.y,B.i[1]], uo=[B.o[0],B.y,B.o[1]];
      var th=0.45, bi=[A.i[0],A.y-th,A.i[1]], bo=[A.o[0],A.y-th,A.o[1]], ci=[B.i[0],B.y-th,B.i[1]], co=[B.o[0],B.y-th,B.o[1]];
      if(cw){ MQUAD('plank',ti,ui,uo,to,(i%2)?pc:shade(pc,-0.07)); MQUAD('plank',bi,bo,co,ci,shade(pc,-0.35)); MQUAD('plank',bo,to,uo,co,shade(pc,-0.2)); }
      else  { MQUAD('plank',ti,to,uo,ui,(i%2)?pc:shade(pc,-0.07)); MQUAD('plank',bi,ci,co,bo,shade(pc,-0.35)); MQUAD('plank',bo,co,uo,to,shade(pc,-0.2)); }
      /* outer rail */
      ROD(A.o[0],A.y+1.1,A.o[1], B.o[0],B.y+1.1,B.o[1], 0.045, ROPEC[0], 'rope');
      ROD(A.o[0],A.y+0.55,A.o[1], B.o[0],B.y+0.55,B.o[1], 0.03, ROPEC[0], 'rope');
      if(i%2===0) BOX(B.o[0],B.y,B.o[1],0.18,1.15,0.18,-a,TIMBERC[1],'timber');
      /* knee braces back into the trunk under the ledge */
      if(i%3===0){ var kb=trunkR(T,y-3.2)-0.4; BEAM(T.x+Math.cos(a)*kb, y-3.4, T.z+Math.sin(a)*kb, cur.o[0]-Math.cos(a)*0.6, y-th, cur.o[1]-Math.sin(a)*0.6, 0.35,0.35, TIMBERC[2], 'timber'); }
    }
    prev = cur;
  }
  if(gate){
    var Ld=S.landing, F=platFrame(Ld.x,Ld.z,0);
    SECTOR('plank', F, 0, Ld.r, 0, TAU, Ld.y-0.6, Ld.y, shade(pc,-0.12), { colTop:pc, step:3, faces:'tbo' });
    /* rail, open toward the lift (outward) and the ramp (toward the trunk) */
    railing(F, Ld.r-0.2, Ld.y, [[Ld.a, 0.55],[Ld.a+Math.PI, 0.9]], 2.4);
    /* raking struts from the trunk out under the jetty: an inner and an outer fan */
    for(var s=0;s<9;s++){ var fa=S.a0+(s-4)*0.085, fr=(s%2)?0.97:0.70, drop=(s%2)?40:26;
      var rr0=trunkR(T,Ld.y-drop)-0.4, tx=T.x+Math.cos(fa)*rr0, tz=T.z+Math.sin(fa)*rr0;
      var ex=Ld.x+Math.cos(S.a0)*Ld.r*(fr*2-1)+(-Math.sin(S.a0))*(s-4)*Ld.r*0.17, ez=Ld.z+Math.sin(S.a0)*Ld.r*(fr*2-1)+Math.cos(S.a0)*(s-4)*Ld.r*0.17;
      BEAM(tx, Ld.y-drop, tz, ex, Ld.y-0.6, ez, 0.7,0.7, TIMBERC[s%4], 'timber'); }
    REGISTER({ name:S.plat.name, kind:'landing', label:'Landing stage (lift & ladders)', x:Ld.x, z:Ld.z, y:Ld.y-0.6, h:9, r:Ld.r+0.5 });
    REGISTER({ name:S.plat.name, kind:'ramp', label:'Gate ramp', x:T.x, z:T.z, y:S.y0-1, h:S.y1-S.y0+4, r:trunkR(T,S.y0)+S.off+S.w });
  }else{
    REGISTER({ name:'Council stair', kind:'ramp', label:'Stair to the Council Chamber', x:T.x, z:T.z, y:S.y0, h:S.y1-S.y0, r:trunkR(T,S.y0)+S.off+S.w });
  }
}
function buildLift(Lf){
  /* a timber headframe cantilevered off the landing; the cage itself is animated by the life pass */
  var ox=Math.cos(Lf.a), oz=Math.sin(Lf.a), px=-oz, pz=ox, top=Lf.y1+7.5;
  [-1,1].forEach(function(sg){
    BOX(Lf.x+px*2.2*sg - ox*3.0, Lf.y1-0.4, Lf.z+pz*2.2*sg - oz*3.0, 0.45, 8.0, 0.45, -Lf.a, TIMBERC[0], 'timber');
    BEAM(Lf.x+px*2.2*sg - ox*3.0, top-0.3, Lf.z+pz*2.2*sg - oz*3.0, Lf.x+px*2.2*sg + ox*1.2, top-0.3, Lf.z+pz*2.2*sg + oz*1.2, 0.4,0.4, TIMBERC[2], 'timber');
    /* guide ropes to the ground */
    ROD(Lf.x+px*1.7*sg, Lf.y0, Lf.z+pz*1.7*sg, Lf.x+px*1.7*sg, top-0.3, Lf.z+pz*1.7*sg, 0.05, ROPEC[1], 'rope');
  });
  BEAM(Lf.x+px*2.4, top, Lf.z+pz*2.4, Lf.x-px*2.4, top, Lf.z-pz*2.4, 0.5,0.5, TIMBERC[1], 'timber');
  CYL(Lf.x, top-0.9, Lf.z, 0.7, 0.5, 0, TIMBERC[3], 'timber');               /* sheave */
  /* the windlass yard at the foot: a capstan the draught-beast walks round */
  CYL(Lf.x+ox*9, Lf.y0, Lf.z+oz*9, 1.1, 2.2, 0, TIMBERC[0], 'timber');
  BEAM(Lf.x+ox*9-px*5, Lf.y0+1.6, Lf.z+oz*9-pz*5, Lf.x+ox*9+px*5, Lf.y0+1.6, Lf.z+oz*9+pz*5, 0.3,0.3, TIMBERC[2], 'timber');
  ROD(Lf.x+ox*9, Lf.y0+2.0, Lf.z+oz*9, Lf.x+ox*0.6, top-0.6, Lf.z+oz*0.6, 0.06, ROPEC[0], 'rope');
  Lf.capstan = { x:Lf.x+ox*9, z:Lf.z+oz*9, y:Lf.y0, r:5 };
  REGISTER({ name:Lf.plat.name, kind:'lift', label:'Beast-drawn lift', x:Lf.x, z:Lf.z, y:Lf.y0, h:top-Lf.y0, r:3.2 });
  REGISTER({ name:Lf.plat.name, kind:'capstan', label:'Lift capstan', x:Lf.capstan.x, z:Lf.capstan.z, y:Lf.y0, h:4, r:6 });
}
function buildLadder(Ld){
  var a = Math.atan2(Ld.z-Ld.plat.z, Ld.x-Ld.plat.x), px=-Math.sin(a)*0.32, pz=Math.cos(a)*0.32;
  ROD(Ld.x+px,Ld.y0,Ld.z+pz, Ld.x+px,Ld.y1+0.2,Ld.z+pz, 0.05, ROPEC[0], 'rope');
  ROD(Ld.x-px,Ld.y0,Ld.z-pz, Ld.x-px,Ld.y1+0.2,Ld.z-pz, 0.05, ROPEC[0], 'rope');
  for(var y=Ld.y0+0.4; y<Ld.y1; y+=0.45) ROD(Ld.x+px,y,Ld.z+pz, Ld.x-px,y,Ld.z-pz, 0.035, TIMBERC[3], 'timber');
  REGISTER({ name:Ld.plat.name, kind:'ladder', label:'Rope ladder', x:Ld.x, z:Ld.z, y:Ld.y0, h:Ld.y1-Ld.y0, r:1.2 });
}

PLATS.forEach(function(P){ if(P.main || P.kind==='council') buildMain(P); else buildSat(P); });
BRIDGES.forEach(buildBridge);
SPIRALS.forEach(buildSpiral);
LIFTS.forEach(buildLift);
LADDERS.forEach(buildLadder);
window._struct = STRUCT;
