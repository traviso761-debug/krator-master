/* ============================== 18c. POOL CROSSINGS — LOCUS (2026-10-01) ==============================
   The routed roads (highways, the dock road, the paddy lanes, the pumpjack tracks, and any street the
   connectivity pass threw across low ground) were laid at a COST over the marsh pools (30-layout.js,
   roadCost: "a causeway of fill") but nothing was ever built there: the road ran under the water plane.
   This pass builds what the cost promised, wherever any street-graph edge is under water:
     - a short crossing (<= XING_BRIDGE_MAX m of open water): a PLANK BRIDGE on piles, railed, its deck
       ramping down to the banks;
     - a long one: a raised EARTH CAUSEWAY, the road surface on its crest, battered sides down into the
       pool, and a stone-headed CULVERT through it every ~22 m so the pool is not cut in two.
   Each crossing is grouped across the edges it spans (a wet node joins them) and gets one deck level.
   The walk surface is published through XING_AT (30-layout.js bridgeDeckAt), which the life layer, the
   highway ribbons and the lamps already read, so walkers, carts, caravans and riders cross ON the deck
   along the same NAV/RG routes as before. Geometry: merged quads ('adobe', 'plank') and kit primitives in
   existing families: no new draw calls.                                                                */
reseed(686001);
var XING_BRIDGE_MAX = 30, XING_STATS = { bridges:0, causeways:0, culverts:0, pieces:0, wetLength:0 };
(function(){
  if(SHEET) return;
  var STEP=2, PAD_C=8, PAD_B=4, BED=-0.9, CELL=24, GRID={};
  var SURF={ track:PAL.lane[0], lane:PAL.lane[0], alley:PAL.lane[2], street:PAL.paving[1], road:PAL.lane[2], boulevard:PAL.paving[0], ring:PAL.paving[0], highway:PAL.paving[3] };
  function wetAt(x,z){ return terrainH(x,z) < 0.3 && lakeDist(x,z) > 12 && riverDist(x,z) > 2 && canalDist(x,z) > CANAL_W[1] && bridgeDeckAt(x,z) == null; }
  /* 1. the wet runs on every edge */
  var pieces=[];
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len; if(!(L>0.5)) return;
    var n=Math.max(1,Math.ceil(L/STEP)), wet=[];
    for(var i=0;i<=n;i++){ var t=i/n; wet.push(wetAt(mix(A.x,B.x,t), mix(A.z,B.z,t))); }
    var runs=[], i0=-1;
    for(var i2=0;i2<=n+1;i2++){ var w=i2<=n && wet[i2];
      if(w && i0<0) i0=i2;
      if(!w && i0>=0){ var last=runs[runs.length-1]; if(last && i0-last[1] <= 3) last[1]=i2-1; else runs.push([i0,i2-1]); i0=-1; } }
    runs.forEach(function(R){ var s0=Math.max(0,(R[0]-0.5)*L/n), s1=Math.min(L,(R[1]+0.5)*L/n);
      pieces.push({ e:e, A:A, B:B, L:L, s0:s0, s1:s1, atA:R[0]===0, atB:R[1]===n }); });
  });
  /* 2. group the runs that meet at a wet node into one crossing */
  var par=pieces.map(function(p,i){ return i; });
  function f(i){ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }
  var atNode={}; pieces.forEach(function(p,i){ [[p.atA,p.e.a],[p.atB,p.e.b]].forEach(function(q){ if(!q[0]) return; var k=q[1]; if(atNode[k]!=null){ var a=f(i), b=f(atNode[k]); if(a!==b) par[a]=b; } else atNode[k]=i; }); });
  var groups={}, gorder=[];
  pieces.forEach(function(p,i){ var r=f(i); if(!groups[r]){ groups[r]={ pieces:[], wet:0, nodes:{} }; gorder.push(r); }
    groups[r].pieces.push(p); groups[r].wet += p.s1-p.s0; if(p.atA) groups[r].nodes[p.e.a]=1; if(p.atB) groups[r].nodes[p.e.b]=1; });
  function gridAdd(item, x0,z0,x1,z1){ for(var i=Math.floor(x0/CELL);i<=Math.floor(x1/CELL);i++) for(var j=Math.floor(z0/CELL);j<=Math.floor(z1/CELL);j++){ var k=i+','+j; (GRID[k]||(GRID[k]=[])).push(item); } }
  /* a quad whose face is turned toward `out` (a rough outward vector): the merged builder wants CCW from outside */
  function quadOut(fam, a,b,c,d, col, out){ var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; if(nx*out[0]+ny*out[1]+nz*out[2] < 0) MQUAD(fam, a,d,c,b, col); else MQUAD(fam, a,b,c,d, col); }
  /* 3. build each crossing */
  gorder.forEach(function(gk){ var G=groups[gk], bridge = G.wet <= XING_BRIDGE_MAX, deck = bridge ? 1.05 : 0.85, P = bridge ? PAD_B : PAD_C;
    var cx=0, cz=0, cn=0, maxW=0, cls='lane';
    G.pieces.forEach(function(p){ var e=p.e, L=p.L, dx=(p.B.x-p.A.x)/L, dz=(p.B.z-p.A.z)/L, nx=-dz, nz=dx;
      var a0 = p.atA ? 0 : Math.max(0, p.s0-P), a1 = p.atB ? L : Math.min(L, p.s1+P), hw = e.w/2 + (bridge?0.5:1.0);
      if(ST_CLASS[e.cls].pri > ST_CLASS[cls].pri) cls=e.cls; maxW=Math.max(maxW, hw);
      var n=Math.max(1,Math.ceil((a1-a0)/STEP)), ys=[], pts=[];
      for(var i=0;i<=n;i++){ var s=mix(a0,a1,i/n), x=p.A.x+dx*s, z=p.A.z+dz*s, th0=terrainH(x,z), gh=Math.max(th0,0)+0.05, out = s<p.s0 ? (p.s0-s)/P : s>p.s1 ? (s-p.s1)/P : 0;
        ys.push(Math.max(th0+0.05, mix(deck, gh, smooth(0,1,Math.min(1,out))))); pts.push([x,z]); }
      var rec={ ax:p.A.x+dx*a0, az:p.A.z+dz*a0, dx:dx, dz:dz, L:a1-a0, hw:hw, ys:ys, n:n };
      var ex=rec.ax+dx*rec.L, ez=rec.az+dz*rec.L;
      gridAdd(rec, Math.min(rec.ax,ex)-hw-1, Math.min(rec.az,ez)-hw-1, Math.max(rec.ax,ex)+hw+1, Math.max(rec.az,ez)+hw+1); XING_STATS.pieces++;
      cx += (rec.ax+ex)/2; cz += (rec.az+ez)/2; cn++;
      if(!bridge){
        /* the causeway: the road on the crest, battered earth sides into the pool */
        var top=SURF[e.cls]||PAL.lane[0], earth=shade(MUDBROWNC[1], 0.06), earthD=shade(MUDBROWNC[3], -0.05);
        for(var k=0;k<n;k++){ var P0=pts[k], P1=pts[k+1], y0=ys[k], y1=ys[k+1];
          var L0=[P0[0]+nx*hw, y0, P0[1]+nz*hw], L1=[P1[0]+nx*hw, y1, P1[1]+nz*hw], R0=[P0[0]-nx*hw, y0, P0[1]-nz*hw], R1=[P1[0]-nx*hw, y1, P1[1]-nz*hw];
          quadOut('adobe', L0, L1, R1, R0, top, [0,1,0]);
          var bL0=hw+1.6*(y0-BED), bL1=hw+1.6*(y1-BED);
          quadOut('adobe', L0, L1, [P1[0]+nx*bL1, BED, P1[1]+nz*bL1], [P0[0]+nx*bL0, BED, P0[1]+nz*bL0], earth, [nx,0.6,nz]);
          quadOut('adobe', R0, R1, [P1[0]-nx*bL1, BED, P1[1]-nz*bL1], [P0[0]-nx*bL0, BED, P0[1]-nz*bL0], earthD, [-nx,0.6,-nz]); }
        /* culverts: a stone headwall each side and a dark pipe through, every ~22 m of open water */
        for(var s2=p.s0+9; s2<p.s1-6; s2+=22){ var ci=Math.round((s2-a0)/STEP); if(ci<0||ci>n) continue; var yc=ys[ci]; if(yc < 0.6) continue;
          var xc=p.A.x+dx*s2, zc=p.A.z+dz*s2, off=hw+1.6*(yc-0.55), ryc=Math.atan2(nx,nz);
          ROD(xc-nx*(off+0.15), 0.0, zc-nz*(off+0.15), xc+nx*(off+0.15), 0.0, zc+nz*(off+0.15), 0.42, VOIDC[0], 'dark');
          [-1,1].forEach(function(sd){ BOX(xc+nx*sd*off, -0.7, zc+nz*sd*off, 2.6, 1.35, 0.35, ryc, STONEC[sd>0?1:3], 'rock'); });
          XING_STATS.culverts++; }
      } else {
        /* the plank bridge: a deck following the ramp, fascia boards, paired piles, a rail over the water */
        var dk=PLANKC[1], fas=TIMBERC[1], th=0.22;
        for(var k2=0;k2<n;k2++){ var Q0=pts[k2], Q1=pts[k2+1], z0=ys[k2], z1=ys[k2+1];
          var l0=[Q0[0]+nx*hw, z0, Q0[1]+nz*hw], l1=[Q1[0]+nx*hw, z1, Q1[1]+nz*hw], r0=[Q0[0]-nx*hw, z0, Q0[1]-nz*hw], r1=[Q1[0]-nx*hw, z1, Q1[1]-nz*hw];
          quadOut('plank', l0, l1, r1, r0, k2%3===1?PLANKC[2]:dk, [0,1,0]);
          quadOut('plank', l0, l1, [l1[0],z1-th,l1[2]], [l0[0],z0-th,l0[2]], fas, [nx,0,nz]);
          quadOut('plank', r0, r1, [r1[0],z1-th,r1[2]], [r0[0],z0-th,r0[2]], fas, [-nx,0,-nz]); }
        for(var s3=a0+1; s3<=a1-0.5; s3+=4){ var ki=Math.min(n, Math.round((s3-a0)/STEP)), yy=ys[ki], xx=p.A.x+dx*s3, zz=p.A.z+dz*s3;
          if(yy - terrainH(xx,zz) < 0.35) continue;
          [-1,1].forEach(function(sd){ CYL(xx+nx*sd*(hw-0.25), -2.2, zz+nz*sd*(hw-0.25), 0.14, yy+2.2-th, 0, PILEC[(ki+sd+4)%4], 'bark'); });
          BEAM(xx-nx*hw, yy-th-0.12, zz-nz*hw, xx+nx*hw, yy-th-0.12, zz+nz*hw, 0.2, 0.2, TIMBERC[2], 'timber');
          if(s3 > p.s0-1 && s3 < p.s1+1) [-1,1].forEach(function(sd){ BOX(xx+nx*sd*(hw-0.08), yy, zz+nz*sd*(hw-0.08), 0.12, 1.0, 0.12, 0, TIMBERC[0], 'timber'); }); }
        [-1,1].forEach(function(sd){ var r0s=Math.max(a0, p.s0-1), r1s=Math.min(a1, p.s1+1); if(r1s-r0s < 2) return;
          var ka=Math.round((r0s-a0)/STEP), kb=Math.min(n, Math.round((r1s-a0)/STEP));
          ROD(p.A.x+dx*r0s+nx*sd*(hw-0.08), ys[ka]+0.95, p.A.z+dz*r0s+nz*sd*(hw-0.08), p.A.x+dx*r1s+nx*sd*(hw-0.08), ys[kb]+0.95, p.A.z+dz*r1s+nz*sd*(hw-0.08), 0.05, TIMBERC[2], 'timber'); });
      }
    });
    /* a wet node: a round pad where the pieces meet, so a bend has no notch in it */
    Object.keys(G.nodes).forEach(function(id){ var N=ST.nodes[id], r=maxW+0.5, rec={ pad:true, x:N.x, z:N.z, r:r, y:deck };
      gridAdd(rec, N.x-r, N.z-r, N.x+r, N.z+r);
      if(bridge){ BOX(N.x, deck-0.22, N.z, r*1.6, 0.22, r*1.6, 0.3, PLANKC[1], 'plank'); [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ CYL(N.x+q[0]*r*0.6, -2.2, N.z+q[1]*r*0.6, 0.15, deck+2.0, 0, PILEC[1], 'bark'); }); }
      else CYL(N.x, BED, N.z, r+0.8*(deck-BED), deck-BED, 0, SURF[cls]||PAL.lane[0], 'adobe'); });
    cx/=cn; cz/=cn; var rad=0; G.pieces.forEach(function(p){ rad=Math.max(rad, Math.hypot(p.A.x-cx,p.A.z-cz), Math.hypot(p.B.x-cx,p.B.z-cz)); });
    var X = { kind:bridge?'bridge':'causeway', x:+cx.toFixed(1), z:+cz.toFixed(1), wet:+G.wet.toFixed(1), y:deck, edges:G.pieces.length, cls:cls,
              name: bridge ? 'Plank bridge on piles' : 'Causeway with culverts' };
    XINGS.push(X); XING_STATS[bridge?'bridges':'causeways']++; XING_STATS.wetLength += G.wet;
    REGISTER({ name:X.name+' ('+Math.round(G.wet)+' m of open water)', kind:'bridge', label:'infrastructure · culture: abyssal-desert · type: infrastructure · '+(bridge?'timber deck on piles over a marsh pool':'earth fill over a marsh pool, stone-headed culverts'),
      x:cx, y:BED, z:cz, r:Math.min(rad, 40), h:deck-BED+1.5 });
  });
  XING_STATS.wetLength = Math.round(XING_STATS.wetLength);
  XING_AT = function(x,z){ var cell=GRID[Math.floor(x/CELL)+','+Math.floor(z/CELL)]; if(!cell) return null;
    for(var i=0;i<cell.length;i++){ var R=cell[i];
      if(R.pad){ if(Math.hypot(x-R.x,z-R.z) < R.r) return R.y; continue; }
      var rx=x-R.ax, rz=z-R.az, al=rx*R.dx+rz*R.dz; if(al<0 || al>R.L) continue; var lat=-rx*R.dz+rz*R.dx; if(Math.abs(lat) > R.hw) continue;
      var f2=al/R.L*R.n, k=Math.min(R.n-1, Math.floor(f2)); return mix(R.ys[k], R.ys[k+1], f2-k); }
    return null; };
  window._xings = { stats:XING_STATS, list:XINGS, at:function(x,z){ return XING_AT(x,z); } };
})();
