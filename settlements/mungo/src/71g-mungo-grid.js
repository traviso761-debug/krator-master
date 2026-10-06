/* ============================== 18a. THE GEOMANCERS' GRID — MUNGO (Locus's 71g, cut down) ==============================
   "Only the Geomancer chapterhouse and the surrounding Yuni buildings are electrified." The generator
   house beside the chapterhouse feeds a two-wire line on timber poles round the chapterhouse's ring
   street and out to the buggy park: electric lamps over those streets only, service drops to the
   chapterhouse and the six Yuni houses, and nothing else in Mungo. Locus's construction, unchanged:
   one pole per electrified street edge, a minimum spanning tree of catenary spans, only what the
   generator reaches is kept. 72-lights.js reads GRID_EDGE and gridNear() (a window near the line is
   wired: cool white); everything else in the town burns oil or wood.                               */
reseed(716101);
var GRID_EDGE = {}, GRID_POLES = [], GRID_STATS = { poles:0, spans:0, drops:0, lamps:0, edges:0 };
var GRIDP_CELL = 40, GRIDP_HASH = {};
function gridNear(x,z,r){ var cell=GRIDP_HASH[Math.floor(x/GRIDP_CELL)+','+Math.floor(z/GRIDP_CELL)]; if(!cell) return false;
  for(var i=0;i<cell.length;i++){ var P=cell[i]; if(Math.hypot(P.x-x,P.z-z) < r) return true; } return false; }
(function(){
  if(SHEET || !GENERATOR) return;
  var WIREC=0x1e1a18, INSC=0xf2eee4, POLE_H=8.2, ARM=0.85;
  function groundY(x,z){ var d=bridgeDeckAt(x,z); return d!=null ? d : terrainH(x,z); }
  function blocked(x,z){ return maskAt(x,z)===4 || placedAt(x,z,0.5) || onStreet(x,z,0.3); }
  /* 1. which edges carry the line */
  var want = function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mid=Math.hypot((A.x+B.x)/2-GEOCHAPTER.x,(A.z+B.z)/2-GEOCHAPTER.z);
    return (e.cls==='street' || e.cls==='road') && mid < 92; };
  var poles=[], byNode={};
  ST.edges.forEach(function(e){ if(!want(e)) return; var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len; if(!(L>4)) return;
    var dx=(B.x-A.x)/L, dz=(B.z-A.z)/L, nx=-dz, nz=dx, mx=(A.x+B.x)/2-GEOCHAPTER.x, mz=(A.z+B.z)/2-GEOCHAPTER.z, mr=Math.hypot(mx,mz)||1, rx=mx/mr, rz=mz/mr;
    var radial = Math.abs(dx*rx+dz*rz) > 0.7, sd = radial ? ((nx*-rz+nz*rx) > 0 ? 1 : -1) : ((nx*rx+nz*rz) > 0 ? 1 : -1);
    var off=e.w/2+1.0, spot=null;
    [[0.5,sd],[0.5,-sd],[0.3,sd],[0.7,sd],[0.3,-sd],[0.7,-sd]].some(function(c){ var x=mix(A.x,B.x,c[0])+nx*c[1]*off, z=mix(A.z,B.z,c[0])+nz*c[1]*off;
      if(blocked(x,z)) return false; spot={ x:x, z:z, sd:c[1] }; return true; });
    if(!spot) return;
    var P={ id:poles.length, e:e, x:spot.x, z:spot.z, y:groundY(spot.x,spot.z), nx:nx*spot.sd, nz:nz*spot.sd, dx:dx, dz:dz, adj:[] };
    poles.push(P); [e.a,e.b].forEach(function(nid){ (byNode[nid]||(byNode[nid]=[])).push(P.id); });
  });
  /* 2. the feeder: from the generator's own first pole (local 5.6,-10.8; arm at plinth + 8.6) toward the nearest line pole */
  var G=GENERATOR, f0=loc(G.x,G.z,5.6,-10.8,G.ry), feed={ id:poles.length, x:f0[0], z:f0[1], y:terrainH(f0[0],f0[1]), feeder:true, adj:[], top:terrainH(G.x,G.z)+0.6+8.9 };
  poles.push(feed);
  var near=null, nd=1e9; poles.forEach(function(P){ if(P.feeder) return; var d=Math.hypot(P.x-feed.x,P.z-feed.z); if(d<nd){ nd=d; near=P; } });
  var cand=[];                                                   /* [dist, i, j] */
  if(near){ var nStep=Math.max(0, Math.ceil(nd/34)-1), prev=feed;
    for(var s=1;s<=nStep;s++){ var t=s/(nStep+1), x=mix(feed.x,near.x,t), z=mix(feed.z,near.z,t);
      for(var tries=0; tries<6 && blocked(x,z); tries++){ x+=near.dz*2.5; z-=near.dx*2.5; }
      var Q={ id:poles.length, x:x, z:z, y:groundY(x,z), relay:true, adj:[], nx:-(near.z-feed.z)/nd, nz:(near.x-feed.x)/nd };
      poles.push(Q); cand.push([Math.hypot(Q.x-prev.x,Q.z-prev.z), prev.id, Q.id, true]); prev=Q; }
    cand.push([Math.hypot(near.x-prev.x,near.z-prev.z), prev.id, near.id, true]); }
  /* 3. candidate spans between poles of edges that meet at a node; Kruskal keeps a tree */
  Object.keys(byNode).forEach(function(nid){ var L=byNode[nid];
    for(var i=0;i<L.length;i++) for(var j=i+1;j<L.length;j++){ var a=poles[L[i]], b=poles[L[j]], d=Math.hypot(a.x-b.x,a.z-b.z);
      if(d < 3 || d > 52) continue; if(placedAt((a.x+b.x)/2,(a.z+b.z)/2,0)) continue; cand.push([d, a.id, b.id, false]); } });
  cand.sort(function(p,q){ return (q[3]-p[3]) || (p[0]-q[0]); });
  var par=poles.map(function(p,i){ return i; }); function f(i){ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }
  var spans=[]; cand.forEach(function(c){ var a=f(c[1]), b=f(c[2]); if(a===b) return; par[a]=b; spans.push([c[1],c[2]]); poles[c[1]].adj.push(c[2]); poles[c[2]].adj.push(c[1]); });
  /* 4. keep only what the generator reaches */
  var live={}; live[feed.id]=1; var stack=[feed.id]; while(stack.length){ var c=stack.pop(); poles[c].adj.forEach(function(o){ if(!live[o]){ live[o]=1; stack.push(o); } }); }
  /* 5. build: poles, arms, insulators, lamps */
  function attach(P){                                           /* the two wire points on the crossarm */
    if(P.feeder) return [4.4, 6.8].map(function(lx){ var o=loc(G.x,G.z,lx,-10.8,G.ry); return [o[0], P.top, o[1]]; });
    var top=P.y+POLE_H-0.25;                                   /* the arm lies across the line, along the pole's normal */
    return [[P.x+P.nx*ARM, top, P.z+P.nz*ARM],[P.x-P.nx*ARM, top, P.z-P.nz*ARM]];
  }
  poles.forEach(function(P){ if(!live[P.id] || P.feeder) return;
    var y=P.y, ryA=Math.atan2(-P.nz, P.nx);
    CYL(P.x, y-0.4, P.z, 0.14, POLE_H+0.4, 0, TIMBERC[0], 'timber');
    BOX(P.x, y+POLE_H-0.55, P.z, 2.2, 0.16, 0.16, ryA, TIMBERC[1], 'timber');
    [-1,1].forEach(function(sd){ BOX(P.x+P.nx*ARM*sd, y+POLE_H-0.42, P.z+P.nz*ARM*sd, 0.12, 0.2, 0.12, ryA, INSC, 'plaster'); });
    if(P.e){                                                     /* the lamp: a bracket out over the carriageway, a shade, a bare globe */
      var lx=P.x-P.nx*1.7, lz=P.z-P.nz*1.7, ly=y+6.0;
      ROD(P.x, ly-0.5, P.z, lx, ly+0.05, lz, 0.05, METALC[1], 'metal');
      PYR(lx, ly-0.14, lz, 0.6, 0.2, 0.6, ryA, METALC[2], 'metal');
      BOX(lx, ly-0.42, lz, 0.24, 0.28, 0.24, ryA+0.78, PAL.electric, 'glowmat');
      nlLampAdd(lx, ly-0.4, lz, 1.25, 19, true); GRID_STATS.lamps++;
      GRID_EDGE[P.e.id]=true; GRID_STATS.edges++; }
    GRID_POLES.push(P); GRID_STATS.poles++;
    var k=Math.floor(P.x/GRIDP_CELL)+','+Math.floor(P.z/GRIDP_CELL);
    for(var i=-1;i<=1;i++) for(var j=-1;j<=1;j++){ var kk=(Math.floor(P.x/GRIDP_CELL)+i)+','+(Math.floor(P.z/GRIDP_CELL)+j); (GRIDP_HASH[kk]||(GRIDP_HASH[kk]=[])).push(P); }
  });
  /* 6. the wires: two per span, paired so they do not cross, each a catenary */
  function wire(a, b){ var L=Math.hypot(b[0]-a[0], b[2]-a[2]), sag=0.025*L+0.15, N=L>12?5:3, prev=a;
    for(var i=1;i<=N;i++){ var t=i/N, p=[mix(a[0],b[0],t), mix(a[1],b[1],t) - 4*sag*t*(1-t), mix(a[2],b[2],t)];
      ROD(prev[0],prev[1],prev[2], p[0],p[1],p[2], 0.03, WIREC, 'timber'); prev=p; } }
  spans.forEach(function(S){ var A=poles[S[0]], B=poles[S[1]]; if(!live[A.id] || !live[B.id]) return;
    var a=attach(A), b=attach(B), d0=Math.hypot(a[0][0]-b[0][0],a[0][2]-b[0][2])+Math.hypot(a[1][0]-b[1][0],a[1][2]-b[1][2]),
        d1=Math.hypot(a[0][0]-b[1][0],a[0][2]-b[1][2])+Math.hypot(a[1][0]-b[0][0],a[1][2]-b[0][2]);
    if(d1 < d0) b=[b[1],b[0]];
    wire(a[0], b[0]); wire(a[1], b[1]); GRID_STATS.spans++; });
  /* 7. service drops: a pole feeds the nearest one or two dwellings, shops or taverns within 16 m */
  var DROP_TAGS={ yuni:1, geo:1 };
  GRID_POLES.forEach(function(P){ if(!P.e) return; var got=[];
    PLACED.forEach(function(b){ if(!DROP_TAGS[b.tag] || b.w==null) return; var d=Math.hypot(b.x-P.x,b.z-P.z); if(d > 22+Math.max(b.w,b.d)/2) return;
      var q=loc(0,0,P.x-b.x,P.z-b.z,-b.ry), qx=clamp(q[0],-b.w/2,b.w/2), qz=clamp(q[1],-b.d/2,b.d/2), w=loc(b.x,b.z,qx,qz,b.ry), dd=Math.hypot(w[0]-P.x,w[1]-P.z);
      if(dd < 22 && dd > 1.5) got.push([dd, w, b]); });
    got.sort(function(p,q){ return p[0]-q[0]; });
    got.slice(0,2).forEach(function(g,i){ var a=attach(P)[i], hy=terrainH(g[1][0],g[1][1])+Math.min(4.2, ((ASSET_BY_KEY[g[2].key]||{}).h||6)*0.55);
      wire(a, [g[1][0], hy, g[1][1]]); BOX(g[1][0], hy-0.15, g[1][1], 0.12, 0.3, 0.12, 0, INSC, 'plaster'); GRID_STATS.drops++; });
  });
  window._grid = { stats:GRID_STATS, poles:function(){ return GRID_POLES.map(function(P){ return [+P.x.toFixed(1), +P.z.toFixed(1)]; }); } };
})();
