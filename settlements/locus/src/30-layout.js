/* ============================== 8. LAYOUT — LOCUS ==============================
   PLANNER-OWNED. Builds NO geometry. Owns every position in Locus, in the order the brief
   gave them:

     1. THE REFINERY COMPLEX at the centre of the hilltop — the still-house and three storage
        tanks clustered beside it — and THE RING ROAD drawn round them.
     2. THE CENTRAL SITES round the outside of the ring: the Geomancers' Chapterhouse, the
        Order's chapterhouse, the school, the market, the warehouse, the park, the caravanserai
        (adjacent to the refinery, across the ring from its gate) and a few wealthy houses.
     3. THE HIGHWAYS: one in from the SOUTH-EAST, one north ALONG THE LAKE. Neither is drawn by
        hand — each is an A* route over a cost grid that charges for low, flood-prone ground,
        so it finds the beach ridge and the levees by itself ("picking higher ground").
     4. RADIAL, MILDLY CROOKED STREETS from the ring out to the edge of the hill; then the rest
        of the grid: crooked concentric streets and the lanes between them.
     5. THE COUNTRYSIDE: two dozen pumpjack sites, each tied to the network by its own A*
        track; the canal and the salt-rice farms; the fishing docks and the fishers' stilt
        houses on the river; the lanes that join all of them to the network.
     6. THE CONNECTIVITY PASS and THE WALK GRAPH (NAV).

   Placement (68-place.js) reads SITES_L; the ground painter (40-ground.js) reads ST and the
   reserved areas; the life layer reads NAV, BRIDGES and ROUTEGRID.                       */
reseed(300001);

var HUB = { x:0, z:0, name:'Refinery ring' };
var RING0_R = 98;
var RING_W = 12;
var ST_CLASS = { highway:{w:12,pri:6}, ring:{w:RING_W,pri:5}, boulevard:{w:10,pri:5}, road:{w:8,pri:4}, street:{w:7,pri:3}, alley:{w:5,pri:2}, lane:{w:3.6,pri:1}, track:{w:4.4,pri:1} };
function faceRy(dx,dz){ return Math.atan2(dx,dz); }
function polarXZ(aDeg, r){ var a=aDeg*Math.PI/180; return [Math.cos(a)*r, Math.sin(a)*r]; }
function towardHub(x,z){ return faceRy(-x,-z); }

/* ============================== 1-2. THE SITES ==============================
   Every scheduled building: key, variant, world centre, yaw (+z local = the door side) and its
   footprint w x d (copied from the asset: the layout runs before the asset registry exists).  */
var SITES_L = [];
function schedule(key, variant, x, z, ry, w, d, name, tag, extra){
  var S = { key:key, variant:variant||0, x:x, z:z, ry:ry, w:w, d:d, name:name||'', tag:tag||'civic' };
  if(extra) for(var k in extra) S[k]=extra[k];
  SITES_L.push(S); return S;
}
/* the oriented rectangle test every street, lane and road below asks of the sites */
function inSiteRect(S, x, z, pad){ var q=loc(0,0,x-S.x,z-S.z,-S.ry); return Math.abs(q[0]) <= S.w/2+(pad||0) && Math.abs(q[1]) <= S.d/2+(pad||0); }
function inAnySite(x,z,pad,skip){ for(var i=0;i<SITES_L.length;i++){ var S=SITES_L[i]; if(S===skip || S.noBlock) continue; if(inSiteRect(S,x,z,pad)) return S; } return null; }
function segHitsSite(ax,az,bx,bz,pad){ var n=Math.max(2, Math.ceil(Math.hypot(bx-ax,bz-az)/3)); for(var i=0;i<=n;i++){ var t=i/n; if(inAnySite(mix(ax,bx,t), mix(az,bz,t), pad)) return true; } return false; }
/* round reserved areas (the market square, the park): streets stop at their rim */
var CIRCLES = [];
function inCircle(x,z,pad){ for(var i=0;i<CIRCLES.length;i++){ var C=CIRCLES[i]; if(Math.hypot(x-C.x,z-C.z) < C.r+(pad||0)) return C; } return null; }

var MARKET = null, PARK = null, CARAVANSERAI = null, REFINERY = null, TANKS = [], GEOCHAPTER = null, GENERATOR = null, FUELSTATION = null;
(function(){
  if(SHEET) return;
  /* ---- the refinery complex, inside the ring ---- */
  REFINERY = schedule('ind_refinery', 0, -36, 2, 0, 66, 50, "Geomancers' still-house (refinery)", 'refinery');
  TANKS.push(schedule('ind_oil_tank', 0, 30, -26, 0, 24, 27, 'Oil storage tank No. 1', 'tank'));
  TANKS.push(schedule('ind_oil_tank', 1, 30, 13, 0, 24, 27, 'Oil storage tank No. 2', 'tank'));
  TANKS.push(schedule('ind_oil_tank', 2, 63, -6, Math.PI/2, 24, 27, 'Oil storage tank No. 3', 'tank'));
  schedule('prop_pipe_rack', 0, 3, -13, Math.PI/2, 12, 3, 'Pipe rack (tank row)', 'prop', { noBlock:true });
  schedule('prop_pipe_rack', 1, 3, 14, Math.PI/2, 12, 3, 'Pipe rack (tank row)', 'prop', { noBlock:true });
  /* the generator house north of the still-house, facing the ring; the fuel station in the south-east of the yard, facing out */
  GENERATOR = schedule('ind_generator_house', 0, -36, -60, Math.PI, 32, 22, "Geomancers' generator house", 'generator');
  (function(){ var q=polarXZ(52, 67); FUELSTATION = schedule('trade_fuel_station', 0, q[0], q[1], faceRy(q[0],q[1]), 24, 18, 'Fuel station', 'fuel'); })();
  /* ---- round the ring ---- */
  GEOCHAPTER = schedule('civic_geomancer_chapterhouse', 0, 0, -134, 0, 48, 42, "Geomancers' Chapterhouse", 'civic');
  var p;
  p=polarXZ(-130, 152); schedule('civic_chapter_house', 0, p[0], p[1], towardHub(p[0],p[1]), 56, 48, "Chapterhouse of the Order of Historians", 'civic');
  p=polarXZ(-45, 142);  schedule('civic_school', 1, p[0], p[1], towardHub(p[0],p[1]), 46, 30, 'School of the Order', 'civic');
  p=polarXZ(143, 150);  schedule('locus_warehouse', 0, p[0], p[1], towardHub(p[0],p[1]), 42, 22, 'Salt-and-oil warehouse', 'civic');
  CARAVANSERAI = schedule('trade_caravanserai', 0, 0, 148, Math.PI, 96, 72, 'Caravanserai of Locus', 'caravanserai');
  p=polarXZ(40, 150);   schedule('rich_merchant_palace', 0, p[0], p[1], towardHub(p[0],p[1]), 20, 16, "Oil-factor's town palace", 'rich');
  /* the second band: the wealthy */
  p=polarXZ(-160, 228); schedule('rich_family_compound', 1, p[0], p[1], towardHub(p[0],p[1]), 30, 26, 'Prominent family compound', 'rich');
  p=polarXZ(-80, 214);  schedule('rich_tower_house', 0, p[0], p[1], towardHub(p[0],p[1]), 14, 14, "Oligarch's tower-house", 'rich');
  p=polarXZ(172, 232);  schedule('rich_terrace_apartments', 0, p[0], p[1], towardHub(p[0],p[1]), 34, 22, 'Painted terrace apartments', 'rich');
  p=polarXZ(-10, 214);  schedule('rich_merchant_palace', 1, p[0], p[1], towardHub(p[0],p[1]), 20, 16, "Merchant's town palace", 'rich');
  p=polarXZ(66, 232);   schedule('rich_tower_house', 1, p[0], p[1], towardHub(p[0],p[1]), 14, 14, "Oligarch's tower-house", 'rich');
  /* the market square and the park are round and open: streets stop at their rims */
  p=polarXZ(185, 158); MARKET = { x:p[0], z:p[1], r:46, name:'Market of Locus' }; CIRCLES.push(MARKET);
  p=polarXZ(2, 160);   PARK = { x:p[0], z:p[1], r:40, name:'Garden of the Wells' }; CIRCLES.push(PARK);
  /* level the hilltop yard inside the ring, and every rectangle a building needs */
  var y0 = terrainH(0,0);
  TERRAIN_PADS.push([0, 0, RING0_R+8, RING0_R+34, y0]);
  SITES_L.forEach(function(S){ if(S.tag==='refinery' || S.tag==='tank' || S.tag==='generator' || S.tag==='fuel' || S.tag==='prop') return;
    TERRAIN_RECTS.push([S.x, S.z, S.w/2+3, S.d/2+3, S.ry, 14, terrainH(S.x,S.z)]); });
  [MARKET, PARK].forEach(function(C){ TERRAIN_PADS.push([C.x, C.z, C.r+2, C.r+24, terrainH(C.x,C.z)]); });
})();

/* ============================== STREET NETWORK (same contract as Yuni) ==============================
   ST.nodes[{id,x,z,y,tag}], ST.edges[{a,b,cls,w,len}]. cls priority (door orientation):
   highway > ring = boulevard > road > street > alley > lane = track                        */
var ST = { nodes:[], edges:[], adj:[] };
function stNode(x,z,tag){ var n={ id:ST.nodes.length, x:x, z:z, y:0, tag:tag||'street' }; ST.nodes.push(n); return n; }
var ST_EKEY = {};
function stEdge(a,b,cls){
  if(!a||!b||a===b) return null; var k = a.id<b.id ? a.id+'_'+b.id : b.id+'_'+a.id; if(ST_EKEY[k]) return ST_EKEY[k];
  var e={ id:ST.edges.length, a:a.id, b:b.id, cls:cls, w:ST_CLASS[cls].w, len:Math.hypot(a.x-b.x,a.z-b.z) }; ST.edges.push(e); ST_EKEY[k]=e; return e;
}
function stChain(nodes, cls){ for(var i=0;i<nodes.length-1;i++) stEdge(nodes[i], nodes[i+1], cls); }
var HIGHWAYS = [], BRIDGES = [], AVENUES = [], CITY_RINGS = [], PUMPJACKS = [], DOCKS = [], STILT_SITES = [], FARMS = [];
var CITY_EDGE_H = 2.6;                 /* the town builds where the ground stands clear of the wet season */
function cityGround(x,z){ return terrainH(x,z) > CITY_EDGE_H && lakeDist(x,z) > 60 && riverDist(x,z) > 30; }

/* ============================== THE ROUTE GRID ==============================
   One cost grid over the whole map for everything that is ROUTED rather than laid out: the
   highways, the pumpjack tracks, the lanes to the docks and the farms (and, later, the
   life layer's cross-country riders and its boats). Cell classes are baked once:
     W: 0 dry · 1 river/mouth · 2 canal · 3 lake · 4 marsh pool          H: ground height
   and ROAD marks every cell a road already occupies, which is what makes later routes JOIN
   the network instead of running parallel to it.                                         */
var RG = { cell:12, ext:MAP_R+120 };
RG.n = Math.ceil(RG.ext*2/RG.cell);
RG.H = new Float32Array(RG.n*RG.n); RG.W = new Uint8Array(RG.n*RG.n); RG.ROAD = new Uint8Array(RG.n*RG.n); RG.BLOCK = new Uint8Array(RG.n*RG.n);
function rgIdx(x,z){ var i=Math.floor((x+RG.ext)/RG.cell), j=Math.floor((z+RG.ext)/RG.cell); if(i<0||j<0||i>=RG.n||j>=RG.n) return -1; return j*RG.n+i; }
function rgX(i){ return -RG.ext + (i+0.5)*RG.cell; }
(function(){
  if(SHEET) return;
  for(var j=0;j<RG.n;j++) for(var i=0;i<RG.n;i++){ var x=rgX(i), z=rgX(j), k=j*RG.n+i, h=terrainH(x,z); RG.H[k]=h;
    var w=0; if(h < 0.15){ if(lakeDist(x,z) < 10) w=3; else if(riverDist(x,z) < 6) w=1; else if(canalDist(x,z) < CANAL_W[1]) w=2; else w=4; }
    RG.W[k]=w; }
})();
function rgMarkSeg(ax,az,bx,bz,half,arr,val){ var L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(L/(RG.cell*0.5)));
  for(var s=0;s<=n;s++){ var t=s/n, x=mix(ax,bx,t), z=mix(az,bz,t);
    for(var dx=-half;dx<=half;dx+=RG.cell*0.5) for(var dz=-half;dz<=half;dz+=RG.cell*0.5){ var k=rgIdx(x+dx,z+dz); if(k>=0) arr[k]=val; } } }
function rgMarkRect(S, pad, arr, val){ var R=Math.hypot(S.w,S.d)/2+pad;
  for(var x=S.x-R;x<=S.x+R;x+=RG.cell*0.5) for(var z=S.z-R;z<=S.z+R;z+=RG.cell*0.5){ if(inSiteRect(S,x,z,pad)){ var k=rgIdx(x,z); if(k>=0) arr[k]=val; } } }
/* the binary min-heap Voth's water traffic runs on (78-life.js, LifeNavHeap) */
function RGHeap(){ this.a=[]; }
RGHeap.prototype.push=function(node,score){ var a=this.a,i=a.length; a.push([node,score]); while(i>0){ var p=(i-1)>>1; if(a[p][1]<=a[i][1]) break; var t=a[p]; a[p]=a[i]; a[i]=t; i=p; } };
RGHeap.prototype.pop=function(){ var a=this.a, top=a[0], last=a.pop(); if(a.length){ a[0]=last; var i=0,n=a.length; while(true){ var l=2*i+1,r=l+1,sm=i; if(l<n&&a[l][1]<a[sm][1]) sm=l; if(r<n&&a[r][1]<a[sm][1]) sm=r; if(sm===i) break; var t=a[sm]; a[sm]=a[i]; a[i]=t; i=sm; } } return top; };
/* A* over the grid. costFn(k) -> cost to ENTER cell k (Infinity = impassable); goalFn(k) -> true at
   the goal; hFn(k) -> admissible estimate. Returns the list of cell indices, or null. */
var RG_NEI = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
function rgAStar(startK, costFn, goalFn, hFn, cap){
  var N=RG.n, NN=N*N, g=new Float32Array(NN), came=new Int32Array(NN), closed=new Uint8Array(NN);
  g.fill(Infinity); came.fill(-1); g[startK]=0; var heap=new RGHeap(); heap.push(startK, hFn(startK)); var it=0, cap2=cap||400000;
  while(heap.a.length && it++ < cap2){
    var cur=heap.pop()[0]; if(closed[cur]) continue; closed[cur]=1;
    if(goalFn(cur)){ var out=[]; while(cur>=0){ out.push(cur); cur=came[cur]; } return out.reverse(); }
    var ci=cur%N, cj=(cur-ci)/N;
    for(var q=0;q<8;q++){ var ni=ci+RG_NEI[q][0], nj=cj+RG_NEI[q][1]; if(ni<0||nj<0||ni>=N||nj>=N) continue; var nk=nj*N+ni; if(closed[nk]) continue;
      var c=costFn(nk, cur); if(!(c<Infinity)) continue; var ng=g[cur]+c*RG_NEI[q][2];
      if(ng < g[nk]){ g[nk]=ng; came[nk]=cur; heap.push(nk, ng + hFn(nk)); } }
  }
  return null;
}
/* THE ROAD COST. Dry, high ground is cheap; the ground that floods costs more the lower it lies;
   a river can be BRIDGED at a price (so a road crosses where the channel is narrowest and does
   not wander along it); the canal takes a culvert; the lake and the marsh pools are refused.
   Cells a road already runs through cost a third: later routes join the network.          */
function roadCost(kind){
  return function(k, from){
    if(RG.BLOCK[k]) return Infinity;
    var w=RG.W[k], h=RG.H[k];
    if(w===3) return Infinity;
    var c;
    if(w===4) c = (kind==='track') ? 18 : 30;                   /* a marsh pool: a causeway of fill */
    else if(w===1) c = (kind==='track') ? 55 : 42;
    else if(w===2) c = 12;
    else { c = 1 + 7*smooth(3.4, 0.7, h); var dh=Math.abs(h-RG.H[from]); c += dh*1.6; }
    if(RG.ROAD[k]) c *= 0.3;
    return c;
  };
}
/* grid path -> a simplified, lightly smoothed world polyline */
function rgPolyline(cells){
  var pts = cells.map(function(k){ var i=k%RG.n, j=(k-i)/RG.n; return [rgX(i), rgX(j)]; });
  function rdp(P, eps){ if(P.length<3) return P; var a=P[0], b=P[P.length-1], bi=-1, bd=0;
    for(var i=1;i<P.length-1;i++){ var d=segDist(P[i][0],P[i][1],a[0],a[1],b[0],b[1]); if(d>bd){ bd=d; bi=i; } }
    if(bd<=eps) return [a,b]; return rdp(P.slice(0,bi+1),eps).slice(0,-1).concat(rdp(P.slice(bi),eps)); }
  var s = rdp(pts, 4.5);
  /* one pass of Chaikin corner cutting, ends pinned */
  if(s.length > 2){ var o=[s[0]]; for(var i=0;i<s.length-1;i++){ var A=s[i], B=s[i+1]; if(i>0) o.push([A[0]*0.75+B[0]*0.25, A[1]*0.75+B[1]*0.25]); if(i<s.length-2) o.push([A[0]*0.25+B[0]*0.75, A[1]*0.25+B[1]*0.75]); } o.push(s[s.length-1]); s=o; }
  /* and resampled so no edge is longer than 36 m */
  var out=[s[0]]; for(var q=1;q<s.length;q++){ var P0=s[q-1], P1=s[q], L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]), n=Math.max(1,Math.ceil(L/36)); for(var r=1;r<=n;r++) out.push([mix(P0[0],P1[0],r/n), mix(P0[1],P1[1],r/n)]); }
  return out;
}
function rgMarkPolyline(pts, half){ for(var i=0;i<pts.length-1;i++) rgMarkSeg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], half, RG.ROAD, 1); }
/* snap a routed polyline into the street graph: the first point joins `fromNode`, the last joins
   the nearest existing node (so a track that reached the network actually connects to it) */
function nearestNodeTo(x,z, maxD, filter){ var best=null, bd=maxD||1e9; ST.nodes.forEach(function(n){ if(n.dead || (filter && !filter(n))) return; var d=Math.hypot(n.x-x,n.z-z); if(d<bd){ bd=d; best=n; } }); return best; }
function polylineToST(pts, cls, fromNode, toNode, tag){
  var nodes=[fromNode||stNode(pts[0][0],pts[0][1],tag||cls)];
  for(var i=1;i<pts.length-1;i++) nodes.push(stNode(pts[i][0], pts[i][1], tag||cls));
  var last = toNode || nearestNodeTo(pts[pts.length-1][0], pts[pts.length-1][1], 40, function(n){ return nodes.indexOf(n)<0; }) || stNode(pts[pts.length-1][0], pts[pts.length-1][1], tag||cls);
  nodes.push(last); stChain(nodes, cls); return nodes;
}
/* bridges: wherever a routed road crosses the river, a mouth, or the canal */
function findBridges(pts, cls, name){
  var polys=[['river',RIVER,4,'river']].concat(DISTRIB.map(function(D,i){ return ['mouth '+(i+1),D,3,'river']; })).concat([['canal',CANAL,1,'canal']]);
  polys.forEach(function(W){ var poly=W[1];
    for(var i=0;i<pts.length-1;i++) for(var r=0;r<poly.length-1;r++){
      if(segCross(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], poly[r][0],poly[r][1],poly[r+1][0],poly[r+1][1])){
        var dx=pts[i+1][0]-pts[i][0], dz=pts[i+1][1]-pts[i][1], L=Math.hypot(dx,dz);
        var mx=(poly[r][0]+poly[r+1][0])/2, mz=(poly[r][1]+poly[r+1][1])/2;
        /* the crossing point on the road line itself */
        var best=null, bd=1e9; for(var t=0;t<=20;t++){ var x=mix(pts[i][0],pts[i+1][0],t/20), z=mix(pts[i][1],pts[i+1][1],t/20), d=Math.hypot(x-mx,z-mz); if(d<bd){ bd=d; best=[x,z]; } }
        var span = W[3]==='canal' ? 18 : Math.max(52, 2*(W[0]==='river'?RIVER_HALF:12)+28);
        if(cls==='track') span = W[3]==='canal' ? 14 : 34;
        BRIDGES.push({ id:BRIDGES.length, kind:W[3], x:best[0], z:best[1], dx:dx/L, dz:dz/L, L:span, nA:W[2], w:ST_CLASS[cls].w+(cls==='track'?1.2:3), timber:cls==='track',
                       name:name+' '+(cls==='track'?'trestle ':'')+(W[3]==='canal'?'canal bridge':'bridge over the '+W[0]) });
        return; } } });
}
function bridgeDeckAt(x,z){ for(var i=0;i<BRIDGES.length;i++){ var B=BRIDGES[i]; if(B.y==null) continue; var q=loc(0,0,x-B.x,z-B.z,-Math.atan2(-B.dz,B.dx)); if(Math.abs(q[0])<B.L/2 && Math.abs(q[1])<B.w/2) return B.y; } return null; }

(function(){
  if(SHEET) return;
  var D2R=Math.PI/180;
  /* ---------- 1. the ring road round the refinery and its tanks ---------- */
  var ring=[]; for(var a=0;a<360;a+=10){ var p=polarXZ(a, RING0_R); ring.push({ deg:a, n:stNode(p[0],p[1],'ring') }); }
  for(var q=0;q<ring.length;q++) stEdge(ring[q].n, ring[(q+1)%ring.length].n, 'ring');
  ST.hub = ring[27].n;                                           /* the north node: the Geomancers' side */
  function ringNodeAt(deg){ deg=((deg%360)+360)%360; var best=null, bd=1e9; ring.forEach(function(R){ var d=Math.abs(wrapPi((R.deg-deg)*D2R)); if(d<bd){ bd=d; best=R.n; } }); return best; }
  /* spurs from the ring into the sites that open onto it */
  (function(){ var n=ringNodeAt(90), c=stNode(0, 112, 'yard'); stEdge(n, c, 'boulevard'); ST.caravanGate=c; })();        /* the caravanserai gate */
  (function(){ var n=ringNodeAt(90), g=stNode(-36, 32, 'yard'); stEdge(n, g, 'boulevard'); ST.refineryGate=g; })();      /* the refinery gate, across the ring */
  (function(){ var n=ringNodeAt(270), g=stNode(0, -112, 'yard'); stEdge(n, g, 'boulevard'); ST.geoGate=g; })();         /* the Chapterhouse forecourt gate */
  (function(){ var n=ringNodeAt(0), g=stNode(78, -6, 'yard'); stEdge(n, g, 'street'); ST.tankGate=g; })();             /* the tank bund steps */
  /* the generator house and the fuel station: a short street from the ring to each front */
  [[GENERATOR,'generatorGate'],[FUELSTATION,'fuelGate']].forEach(function(G){ var S=G[0]; if(!S) return; var f=loc(S.x,S.z,0,S.d/2+2.5,S.ry),
      n=ringNodeAt(Math.atan2(f[1],f[0])/D2R), g=stNode(f[0],f[1],'yard'); stEdge(n, g, 'street'); ST[G[1]]=g; });

  /* ---------- 2. the radial avenues, mildly crooked, out to the edge of the hill ---------- */
  var AV = [ { deg:-109, name:'North road', hwy:'N' }, { deg:-66 }, { deg:-24 }, { deg:27, name:'South-east road', hwy:'SE' },
             { deg:56 }, { deg:124, name:'Dock road', dock:true }, { deg:160 }, { deg:210 } ];
  AV.forEach(function(A, ai){
    var r=RING0_R, prev=ringNodeAt(A.deg), nodes=[prev], pts=[[prev.x,prev.z]], k=0;
    while(k++ < 30){
      r += 23;
      var wob = 4.2*D2R*nsig(r*0.9+ai*57, ai*31, 0.011) + 1.2*D2R*Math.sin(r*0.05+ai);   /* a few degrees of wander */
      var aa = (A.deg*D2R) + wob, x=Math.cos(aa)*r, z=Math.sin(aa)*r;
      if(!cityGround(x,z) || r > 470) break;
      if(inAnySite(x,z,5) || inCircle(x,z,5)){ continue; }
      if(segHitsSite(prev.x,prev.z,x,z,2)) break;
      var n=stNode(x,z,'avenue'); n.r=r; nodes.push(n); pts.push([x,z]); prev=n;
    }
    stChain(nodes, 'boulevard');
    A.nodes = nodes; A.end = nodes[nodes.length-1]; AVENUES.push(A);
  });
  /* the market and the park have a rim street each, joined to the ring and to their avenues */
  [MARKET, PARK].forEach(function(C, ci){
    var rim=[]; for(var m=0;m<16;m++){ var ma=m/16*TAU; rim.push(stNode(C.x+Math.cos(ma)*(C.r+5), C.z+Math.sin(ma)*(C.r+5), ci?'parkrim':'marketrim')); }
    for(m=0;m<16;m++) stEdge(rim[m], rim[(m+1)%16], 'street');
    var toHub=Math.atan2(-C.z,-C.x), bi=0, bd=1e9; rim.forEach(function(n,i){ var d=angDist(Math.atan2(n.z-C.z,n.x-C.x), toHub); if(d<bd){ bd=d; bi=i; } });
    stEdge(rim[bi], ringNodeAt(Math.atan2(C.z,C.x)/D2R), 'street');
    C.rim = rim;
  });

  /* ---------- 3. the concentric streets: crooked rings joining the avenues ---------- */
  var RINGS = [178, 236, 294, 348];
  RINGS.forEach(function(R0, ri){
    var list=[];
    /* the crossings with every avenue */
    AVENUES.forEach(function(A){ var best=null, bd=1e9; A.nodes.forEach(function(n){ if(n.r==null) return; var d=Math.abs(n.r-R0); if(d<bd){ bd=d; best=n; } }); if(best && bd < 16) list.push({ a:Math.atan2(best.z,best.x), n:best, av:true }); });
    /* and intermediate points every ~26 m, wobbled */
    var nstep = Math.round(TAU*R0/26);
    for(var s=0;s<nstep;s++){ var a=s/nstep*TAU, rr0 = R0 + 7*nsig(Math.cos(a)*9+ri*13, Math.sin(a)*9-ri*7, 0.9), x=Math.cos(a)*rr0, z=Math.sin(a)*rr0;
      var close=false; list.forEach(function(L){ if(L.av && angDist(L.a,a)*R0 < 13) close=true; }); if(close) continue;
      if(!cityGround(x,z) || inAnySite(x,z,4) || inCircle(x,z,4)) continue;
      list.push({ a:a, n:stNode(x,z,'ring'+ri), av:false }); }
    list.sort(function(p,q){ return p.a-q.a; });
    /* joined round, but only across a short gap, and never through a site */
    for(var i=0;i<list.length;i++){ var P=list[i], Q=list[(i+1)%list.length], gap=wrapPi(Q.a-P.a); if(gap < 0) gap += TAU;
      if(gap*R0 > 44) continue; if(segHitsSite(P.n.x,P.n.z,Q.n.x,Q.n.z,2) || inCircle((P.n.x+Q.n.x)/2,(P.n.z+Q.n.z)/2,2)) continue;
      stEdge(P.n, Q.n, ri<=1 ? 'street' : (ri<=3 ? 'alley' : 'lane')); }
    CITY_RINGS.push({ r:R0, list:list });
  });
  /* streets that run up to the market or the park open onto its rim */
  [MARKET, PARK].forEach(function(C){ ST.nodes.slice().forEach(function(n){ if(n.tag==='marketrim'||n.tag==='parkrim'||n.tag==='ring') return;
    var d=Math.hypot(n.x-C.x,n.z-C.z); if(d < C.r+5 || d > C.r+40) return;
    var best=null, bd=1e9; C.rim.forEach(function(m){ var q=Math.hypot(m.x-n.x,m.z-n.z); if(q<bd){ bd=q; best=m; } });
    if(best && bd < 30 && !segHitsSite(n.x,n.z,best.x,best.z,1)) stEdge(n, best, 'street'); }); });
  /* ---------- 4. the lanes between the avenues: radial alleys from one ring to the next ---------- */
  for(var ri2=0; ri2<CITY_RINGS.length; ri2++){
    var inner = ri2===0 ? null : CITY_RINGS[ri2-1], outer = CITY_RINGS[ri2], R1=outer.r;
    for(var ai2=0; ai2<AVENUES.length; ai2++){
      var a0=AVENUES[ai2].deg*D2R, a1=AVENUES[(ai2+1)%AVENUES.length].deg*D2R; if(a1 <= a0) a1 += TAU;
      var nsub = Math.max(0, Math.round((a1-a0)*R1/72) - 1);
      for(var sb=1; sb<=nsub; sb++){ var am = a0 + (a1-a0)*sb/(nsub+1);
        function nearOn(RR){ if(!RR) return null; var best=null, bd=1e9; RR.list.forEach(function(L){ var d=angDist(L.a,am); if(d<bd){ bd=d; best=L; } }); return best && bd*RR.r < 22 ? best.n : null; }
        var o=nearOn(outer), i2=inner ? nearOn(inner) : null;
        if(!i2 && ri2===0){ var p0=polarXZ(am/D2R, RING0_R); if(!inAnySite((o?o.x:p0[0])*0.8,(o?o.z:p0[1])*0.8,3)) i2 = ringNodeAt(am/D2R); }
        if(o && i2 && !segHitsSite(o.x,o.z,i2.x,i2.z,2) && !inCircle((o.x+i2.x)/2,(o.z+i2.z)/2,3)) stEdge(i2, o, ri2<=1 ? 'alley' : 'lane');
      }
    }
  }

  /* ---------- 5. the route grid learns where the town is ---------- */
  SITES_L.forEach(function(S){ rgMarkRect(S, 3, RG.BLOCK, 1); });
  CIRCLES.forEach(function(C){ for(var x=C.x-C.r;x<=C.x+C.r;x+=6) for(var z=C.z-C.r;z<=C.z+C.r;z+=6) if(Math.hypot(x-C.x,z-C.z)<C.r){ var k=rgIdx(x,z); if(k>=0) RG.BLOCK[k]=1; } });
  /* the town itself is not open country: a route may leave it only along its streets */
  for(var j=0;j<RG.n;j++) for(var i=0;i<RG.n;i++){ var x=rgX(i), z=rgX(j); if(Math.hypot(x,z) < 450 && RG.H[j*RG.n+i] > CITY_EDGE_H) RG.BLOCK[j*RG.n+i]=1; }
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; rgMarkSeg(A.x,A.z,B.x,B.z, e.w/2, RG.ROAD, 1); rgMarkSeg(A.x,A.z,B.x,B.z, e.w/2, RG.BLOCK, 0); });

  /* ---------- 6. THE HIGHWAYS, routed over the high ground ---------- */
  function routeTo(fromNode, goalFn, hFn, kind){
    var k0=rgIdx(fromNode.x, fromNode.z); if(k0<0) return null;
    RG.BLOCK[k0]=0; var cells=rgAStar(k0, roadCost(kind), goalFn, hFn, 600000); return cells ? rgPolyline(cells) : null;
  }
  function lay(A, goalFn, hFn, cls, name){
    var pts = routeTo(A.end, goalFn, hFn, cls==='track'?'track':'road');
    if(!pts){ ERR('layout: no route for '+name); return null; }
    pts[0]=[A.end.x, A.end.z];
    var nodes = polylineToST(pts, cls, A.end, null, cls);
    rgMarkPolyline(pts, ST_CLASS[cls].w/2);
    findBridges(pts, cls, name);
    var H = { name:name, cls:cls, pts:pts, nodes:nodes }; HIGHWAYS.push(H); return H;
  }
  var avN = AVENUES.filter(function(A){ return A.hwy==='N'; })[0], avSE = AVENUES.filter(function(A){ return A.hwy==='SE'; })[0], avD = AVENUES.filter(function(A){ return A.dock; })[0];
  var goalZ = -MAP_R;
  var hN = lay(avN, function(k){ return rgX(Math.floor(k/RG.n)) < goalZ+8; }, function(k){ return Math.max(0, rgX(Math.floor(k/RG.n)) - goalZ)/RG.cell*0.8; }, 'highway', 'North highway (along the lake)');
  var gSE = [MAP_R*0.96, MAP_R*0.96];
  var hSE = lay(avSE, function(k){ var i=k%RG.n, j=(k-i)/RG.n; return rgX(i) > MAP_R-10 || rgX(j) > MAP_R-10; },
                      function(k){ var i=k%RG.n, j=(k-i)/RG.n; return Math.max(0, Math.min(MAP_R-rgX(i), MAP_R-rgX(j)))/RG.cell*0.8; }, 'highway', 'South-east highway (the Yuni road)');
  ST.hwyN = hN; ST.hwySE = hSE;

  /* ---------- 7. THE RIVERSIDE: docks, the fishers' stilt houses, the canal farms, and their lanes ---------- */
  /* the bank: march south from a lane line until the river is reached */
  function bankAt(x, zFrom){ for(var z=zFrom; z<zFrom+220; z+=1.0){ if(terrainH(x,z) < 0.15) return z; } return null; }   /* where the water actually begins */
  var LANE_Z = function(x){ return 628 + 10*Math.sin(x*0.02); };          /* the riverside lane, just above the bank */
  var laneWest = -480, laneEast = 140;
  /* the fishing docks: three jetties off the north bank below the dock road */
  [-452, -386, -322].forEach(function(dx0, di){
    var zb = bankAt(dx0, LANE_Z(dx0)); if(zb==null) return;
    var S = schedule('infra_fishing_dock', di%2, dx0, zb+10, Math.PI, 12, 34, 'Fishing dock '+(di+1), 'dock', { noBlock:false, bankZ:zb });
    DOCKS.push(S);
  });
  /* the fishers' stilt houses: between the lane and the water, backs to the river */
  var stiltXs = [-419, -354, -288, -250, -214, -178, 30, 74, 114];
  stiltXs.forEach(function(sx, si){
    var zb = bankAt(sx, LANE_Z(sx)); if(zb==null) return;
    var mid = si===2 || si===7, d = mid?16:10;
    var S = schedule(mid ? 'stilt_mid' : 'stilt_poor', si%3, sx, zb - d/2 + 2.5, Math.PI, mid?16:11, d, "Fisher's stilt house", 'stilt');
    STILT_SITES.push(S);
  });
  /* the salt-rice farms: three, side by side between the canal and the lane, backs to the canal */
  [-62, -10, 42].forEach(function(fx, fi){
    var S = schedule('farm_saltrice', fi===0?1:0, fx, 525+19-3, 0, 48, 38, 'Salt-rice farm', 'farm');
    FARMS.push(S);
    TERRAIN_RECTS.push([S.x, S.z, S.w/2+2, S.d/2+2, 0, 8, 1.15]);
  });
  STILT_SITES.concat(DOCKS).forEach(function(S){ rgMarkRect(S, 2, RG.BLOCK, 1); });
  FARMS.forEach(function(S){ rgMarkRect(S, 1, RG.BLOCK, 1); });
  /* the lane itself: laid by hand along the bank, from the west end of the quarter to the farms */
  var laneNodes=[]; for(var lx=laneWest; lx<=laneEast+0.1; lx+=24){ var lz=LANE_Z(lx); laneNodes.push(stNode(lx, lz, 'riverlane')); }
  stChain(laneNodes, 'lane'); ST.riverLane = laneNodes;
  laneNodes.forEach(function(n,i){ if(i) rgMarkSeg(laneNodes[i-1].x,laneNodes[i-1].z,n.x,n.z,2,RG.ROAD,1); });
  /* the dock road runs from its avenue down the slope to the quarter */
  var dockEnd = nearestNodeTo(-400, LANE_Z(-400), 30, function(n){ return n.tag==='riverlane'; });
  var hD = lay(avD, function(k){ var i=k%RG.n, j=(k-i)/RG.n; return Math.hypot(rgX(i)-dockEnd.x, rgX(j)-dockEnd.z) < 14; },
                    function(k){ var i=k%RG.n, j=(k-i)/RG.n; return Math.hypot(rgX(i)-dockEnd.x, rgX(j)-dockEnd.z)/RG.cell*0.8; }, 'road', 'Dock road');
  if(hD){ var lastN = hD.nodes[hD.nodes.length-1]; if(lastN!==dockEnd) stEdge(lastN, dockEnd, 'road'); }
  /* each dock, farm and stilt house gets a short spur from the lane to its door */
  DOCKS.concat(STILT_SITES).concat(FARMS).forEach(function(S){
    var front = loc(S.x, S.z, 0, S.d/2+2.5, S.ry), n = nearestNodeTo(front[0], front[1], 60, function(q){ return q.tag==='riverlane'; });
    if(!n) return; var sp = stNode(front[0], front[1], 'spur'); stEdge(n, sp, 'lane'); S.spur = sp;
  });
  /* the farms' own lane: a spur off the riverside lane east of the quarter to the farm fronts */
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; rgMarkSeg(A.x,A.z,B.x,B.z, e.w/2, RG.ROAD, 1); });

  /* ---------- 8. THE PUMPJACKS: two dozen on the oil bed, each with its own track ---------- */
  (function(){
    var P=[], tries=0, want=24;
    while(P.length < want && tries++ < 20000){
      var x=rr(-1250, 1900), z=rr(-2200, 2000), r=Math.hypot(x,z);
      if(r < 560 || r > 2150) continue;
      /* the oil lies under the delta and along the lake: the west and the south are favoured */
      var bias = 0.35 + 0.65*smooth(700, -300, x) + 0.4*smooth(1300, 400, Math.hypot(x-DELTA_APEX[0], z-DELTA_APEX[1]));
      if(rnd() > bias) continue;
      var h=terrainH(x,z); if(h < 0.9 || h > 9) continue;
      if(lakeDist(x,z) < 70 || riverDist(x,z) < 40 || canalDist(x,z) < 30) continue;
      var ok=true; for(var q=0;q<P.length;q++) if(Math.hypot(P[q][0]-x,P[q][1]-z) < 190) { ok=false; break; } if(!ok) continue;
      var k=rgIdx(x,z); if(k<0 || RG.BLOCK[k] || RG.ROAD[k]) continue;
      /* the pad must be dry all round */
      var dry=true; for(var a=0;a<8;a++){ var hx=x+Math.cos(a/8*TAU)*14, hz=z+Math.sin(a/8*TAU)*14; if(terrainH(hx,hz) < 0.6) dry=false; } if(!dry) continue;
      P.push([x,z]);
    }
    /* nearest to the network first, so the later tracks can join the earlier ones */
    function netDist(p){ var best=1e9; ST.nodes.forEach(function(n){ var d=Math.hypot(n.x-p[0],n.z-p[1]); if(d<best) best=d; }); return best; }
    P.sort(function(a,b){ return netDist(a)-netDist(b); });
    P.forEach(function(p, pi){
      /* face the pumpjack toward the network, and route its track from its front */
      var tgt = nearestNodeTo(p[0], p[1]), ry = tgt ? faceRy(tgt.x-p[0], tgt.z-p[1]) : 0;
      var S = schedule('ind_pumpjack', pi%2, p[0], p[1], ry, 8, 15, 'Pumpjack No. '+(pi+1), 'pumpjack');
      TERRAIN_RECTS.push([S.x, S.z, 6, 10, S.ry, 10, Math.max(1.2, terrainH(S.x,S.z))]);
      rgMarkRect(S, 1, RG.BLOCK, 1);
      var front = loc(S.x, S.z, 0, S.d/2+3, S.ry), fn = stNode(front[0], front[1], 'pumpjack');
      var k0 = rgIdx(front[0], front[1]); if(k0<0) return;
      RG.BLOCK[k0]=0;
      var cells = rgAStar(k0, roadCost('track'), function(k){ return RG.ROAD[k]===1; }, function(k){ return 0; }, 250000);
      if(!cells){ ERR('layout: pumpjack '+(pi+1)+' found no track to the network'); S.orphan=true; PUMPJACKS.push(S); return; }
      var pts = rgPolyline(cells); pts[0]=[fn.x, fn.z];
      var nodes = polylineToST(pts, 'track', fn, null, 'track');
      rgMarkPolyline(pts, 2.2); S.track = nodes; S.node = fn; PUMPJACKS.push(S);
      findBridges(pts, 'track', 'Pumpjack track');
    });
  })();

  /* ---------- 9. CONNECTIVITY PASS: no disconnected portions (Yuni's, unchanged) ---------- */
  function latCls(){ return 'lane'; }
  function components(){
    var par=ST.nodes.map(function(n,i){ return i; });
    function f(i){ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }
    ST.edges.forEach(function(e){ if(e.dead) return; var a=f(e.a), b=f(e.b); if(a!==b) par[a]=b; });
    var root=f(ST.hub.id), groups={};
    ST.nodes.forEach(function(n){ if(n.dead) return; var r=f(n.id); if(r!==root) (groups[r]||(groups[r]=[])).push(n); });
    return { root:root, f:f, groups:groups };
  }
  var C0=components(), before=Object.keys(C0.groups).length+1, joined=0, removed=0, guard=0;
  while(guard++ < 600){
    var C=components(), keys=Object.keys(C.groups); if(!keys.length) break;
    var G=C.groups[keys[0]], best=null, bd=1e9;
    G.forEach(function(n){ ST.nodes.forEach(function(m){ if(m.dead || C.f(m.id)!==C.root) return; var d=Math.hypot(n.x-m.x,n.z-m.z); if(d<bd && !segHitsSite(n.x,n.z,m.x,m.z,1)){ bd=d; best=[n,m]; } }); });
    if(best && bd < 90){ stEdge(best[0],best[1],'lane'); joined++; }
    else { G.forEach(function(n){ n.dead=true; removed++; }); ST.edges.forEach(function(e){ if(ST.nodes[e.a].dead||ST.nodes[e.b].dead) e.dead=true; }); }
  }
  ST.edges = ST.edges.filter(function(e){ return !e.dead; });
  var Cf=components();
  ST.report = { nodes:ST.nodes.filter(function(n){return !n.dead;}).length, edges:ST.edges.length, componentsBefore:before, joined:joined, removedNodes:removed,
                componentsAfter:Object.keys(Cf.groups).length+1, connected:Object.keys(Cf.groups).length===0,
                highways:HIGHWAYS.map(function(H){ return H.name+': '+H.nodes.length+' nodes'; }), pumpjacks:PUMPJACKS.length, bridges:BRIDGES.length };
})();
ST.nodes.forEach(function(n){ n.y = terrainH(n.x,n.z); });
ST.edges.forEach(function(e,i){ e.id=i; e.len=Math.hypot(ST.nodes[e.a].x-ST.nodes[e.b].x, ST.nodes[e.a].z-ST.nodes[e.b].z); });
window._streets = ST.report || {};

/* nearest street to a point, weighted by class priority — the door-orientation rule */
function nearestStreet(x,z,maxD){
  var best=null, bs=-1e9; maxD=maxD||60;
  for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b];
    if(Math.min(A.x,B.x)-maxD > x || Math.max(A.x,B.x)+maxD < x || Math.min(A.z,B.z)-maxD > z || Math.max(A.z,B.z)+maxD < z) continue;
    var d=segDist(x,z,A.x,A.z,B.x,B.z) - e.w/2; if(d>maxD) continue;
    var score = ST_CLASS[e.cls].pri*14 - d; if(score>bs){ bs=score; best={ edge:e, d:d }; } }
  if(best){ var A2=ST.nodes[best.edge.a], B2=ST.nodes[best.edge.b], vx=B2.x-A2.x, vz=B2.z-A2.z, L=vx*vx+vz*vz, t=L?clamp(((x-A2.x)*vx+(z-A2.z)*vz)/L,0,1):0;
    best.px=A2.x+vx*t; best.pz=A2.z+vz*t; }
  return best;
}
function onStreet(x,z,margin){ var m=margin||0;
  for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2+m;
    if(Math.min(A.x,B.x)-pad > x || Math.max(A.x,B.x)+pad < x || Math.min(A.z,B.z)-pad > z || Math.max(A.z,B.z)+pad < z) continue;
    if(segDist(x,z,A.x,A.z,B.x,B.z) < pad) return true; }
  return false;
}

/* ============================== WALK GRAPH (the life layer's network) ============================== */
var NAV = { nodes:[], edges:[], adj:[] };
function navNode(x,y,z,tag,extra){ var n={ id:NAV.nodes.length, x:x, y:y, z:z, tag:tag }; if(extra) for(var k in extra) n[k]=extra[k]; NAV.nodes.push(n); NAV.adj.push([]); return n; }
function navEdge(a,b,kind,extra){ var e={ id:NAV.edges.length, a:a.id, b:b.id, kind:kind, len:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z) }; if(extra) for(var k in extra) e[k]=extra[k];
  NAV.edges.push(e); NAV.adj[a.id].push(e.id); NAV.adj[b.id].push(e.id); return e; }
var ST2NAV = {};
(function(){
  if(SHEET) return;
  ST.nodes.forEach(function(n){ if(n.dead) return; ST2NAV[n.id]=navNode(n.x, n.y, n.z, n.tag, { st:n.id }); });
  ST.edges.forEach(function(e){ navEdge(ST2NAV[e.a], ST2NAV[e.b], 'ground', { cls:e.cls, w:e.w }); });
  NAV.hub = ST2NAV[ST.hub.id];
  var seen={}, stack=[NAV.hub.id], cnt=0; seen[NAV.hub.id]=1;
  while(stack.length){ var c=stack.pop(); cnt++; NAV.adj[c].forEach(function(ei){ var e=NAV.edges[ei], o=e.a===c?e.b:e.a; if(!seen[o]){ seen[o]=1; stack.push(o); } }); }
  NAV.reachable=cnt;
  /* the map-edge ends of the two highways: where caravans come from and go back to */
  NAV.roadEnds = HIGHWAYS.filter(function(H){ return H.cls==='highway'; }).map(function(H){ var n=H.nodes[H.nodes.length-1]; return { id:ST2NAV[n.id].id, x:n.x, z:n.z, name:H.name }; });
})();

/* path-viz: the static networks, by class */
[['highway','Streets: highways + roads'],['boulevard','Streets: ring road + avenues'],['street','Streets: streets'],['alley','Streets: alleys + lanes'],['track','Tracks to the pumpjacks']].forEach(function(row, ri){
  PATHVIZ.push({ key:'st_'+row[0], label:row[1], color:PAL.pathviz[[4,0,2,6,1][ri]], paths:function(){
    return NAV.edges.filter(function(e){ var c=e.cls;
        return row[0]==='highway' ? (c==='highway'||c==='road') : row[0]==='boulevard' ? (c==='boulevard'||c==='ring') : row[0]==='street' ? c==='street' : row[0]==='track' ? c==='track' : (c==='alley'||c==='lane'); })
      .map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });
});
/* districts for the fill: wealth falls away from the ring and down the hill */
function districtAt(x,z){
  var r=Math.hypot(x,z), h=terrainH(x,z);
  var w = clamp(0.95 - 0.0034*Math.max(0, r-150) - 0.018*Math.max(0, 15-h) + 0.06*nsig(x,z,0.01), 0.02, 0.98);
  var key = w > 0.66 ? 'core' : (w > 0.40 ? 'prosper' : 'poor');
  return { key:key, name: key==='core'?'Upper town':(key==='prosper'?'Middle town':'The lower town'), wealth:w, chaos:clamp(0.9-w,0,0.8) };
}
var VIEWPOINTS = [];
