/* ============================== 8. LAYOUT — MUNGO ==============================
   PLANNER-OWNED. Builds NO geometry. Owns every position in Mungo, as records the later passes read
   (placement 68, the reed village 65r, the ground 40, the lights 72, the biome host 69b, the life
   layer's world data 76/84). Locus's contract names are kept (SITES_L, schedule, ST, RG, NAV,
   HIGHWAYS, BRIDGES, MARKET, DOCKS, FARMS, districtAt ...) so the shared Locus code finds them.

     1. THE BRIDGEHEAD: the market square at the shore, its ring of shops (weapons, armour, general,
        food, alchemy, building materials), the quay to the pontoon landing.
     2. THE REED VILLAGE offshore (REED): two clusters of six islands each (the Reed Lake kit's own
        village, once as built and once mirrored), joined through the island of Reed's Local, and ONE
        pontoon bridge from that island to the landing.
     3. THE MAIN STREET, the town's one straight street, from the market east to the headman's house.
     4. THE SITES of the landward town: the caravanserai, two inns, the warehouses, the city watch,
        the fish warehouse and the salt merchant on the shore, the Geomancers' quarter (chapterhouse,
        six Yuni houses, the generator, the buggy park, the fuel station).
     5. THE HIGHWAYS north and south off the map, routed over the ground (Locus's A* on the route grid),
        the south one bridging the river.
     6. THE ORGANIC STREETS: lanes grown off the main street and the highways, wandering, branching and
        joining where they meet; then the connectivity pass.
     7. THE COUNTRYSIDE: the fields on the river flats, the farm lanes, the fishing docks on the shore,
        the logging and foraging grounds in the forest, the fishing water, the map-edge PORTS.
     8. THE WALK GRAPH (NAV): the streets, the pontoon, the reed village's decks and bridges, doors.

   Compass: x east, z SOUTH (north is -z). A site's +z (local) is its door side.               */
reseed(300001);

var HUB = { x:22, z:-6, name:'Bridgehead market' };
var RING0_R = 0, RING_W = 0;       /* Locus's refinery ring: Mungo has none (names kept for shared code) */
var ST_CLASS = { highway:{w:11,pri:6}, main:{w:12,pri:6}, quay:{w:10,pri:5}, ring:{w:9,pri:5}, boulevard:{w:10,pri:5}, road:{w:8,pri:4},
                 street:{w:6.5,pri:3}, alley:{w:4.6,pri:2}, lane:{w:3.6,pri:1}, track:{w:4.2,pri:1}, pontoon:{w:2.6,pri:1} };
function faceRy(dx,dz){ return Math.atan2(dx,dz); }
function polarXZ(aDeg, r){ var a=aDeg*Math.PI/180; return [HUB.x+Math.cos(a)*r, HUB.z+Math.sin(a)*r]; }
function towardHub(x,z){ return faceRy(HUB.x-x, HUB.z-z); }

/* ============================== THE SITES (Locus's contract) ==============================
   Every scheduled building: key, variant, world centre, yaw (+z local = the door side) and its
   footprint w x d (copied from the asset: the layout runs before the asset registry exists).
   `alt` names a fallback key for an asset another kit may not have yet (the builders' yard).      */
var SITES_L = [];
function schedule(key, variant, x, z, ry, w, d, name, tag, extra){
  var S = { key:key, variant:variant||0, x:x, z:z, ry:ry, w:w, d:d, name:name||'', tag:tag||'civic' };
  if(extra) for(var k in extra) S[k]=extra[k];
  SITES_L.push(S); return S;
}
function inSiteRect(S, x, z, pad){ var q=loc(0,0,x-S.x,z-S.z,-S.ry); return Math.abs(q[0]) <= S.w/2+(pad||0) && Math.abs(q[1]) <= S.d/2+(pad||0); }
function inAnySite(x,z,pad,skip){ for(var i=0;i<SITES_L.length;i++){ var S=SITES_L[i]; if(S===skip || S.noBlock) continue; if(inSiteRect(S,x,z,pad)) return S; } return null; }
function segHitsSite(ax,az,bx,bz,pad){ var n=Math.max(2, Math.ceil(Math.hypot(bx-ax,bz-az)/3)); for(var i=0;i<=n;i++){ var t=i/n; if(inAnySite(mix(ax,bx,t), mix(az,bz,t), pad)) return true; } return false; }
/* the door point of a site: just outside the middle of its +z face */
function siteFront(S, out){ return loc(S.x, S.z, 0, S.d/2+(out==null?2.5:out), S.ry); }
var CIRCLES = [];
function inCircle(x,z,pad){ for(var i=0;i<CIRCLES.length;i++){ var C=CIRCLES[i]; if(Math.hypot(x-C.x,z-C.z) < C.r+(pad||0)) return C; } return null; }
/* open rectangles (the buggy park, the logging landings): streets stop at them, buildings keep off */
var YARDS = [];
function inYard(x,z,pad){ for(var i=0;i<YARDS.length;i++){ if(inSiteRect(YARDS[i],x,z,pad)) return YARDS[i]; } return null; }

/* the Locus names the shared code reads; the ones Mungo has no use for stay empty */
var MARKET = null, PARK = null, CARAVANSERAI = null, REFINERY = null, TANKS = [], GEOCHAPTER = null, GENERATOR = null, FUELSTATION = null;
var HEADMAN = null, WATCH = null, INNS = [], WAREHOUSES = [], SHOPS = [], YUNI_HOUSES = [], PARKING = null, FISH_WAREHOUSE = null, SALT_MERCHANT = null;
var MAIN_STREET = null, PONTOON = null, LANDING = null;

/* ============================== 1. THE BRIDGEHEAD ============================== */
(function(){
  if(SHEET) return;
  MARKET = { x:HUB.x, z:HUB.z, r:28, name:'The bridgehead market' }; CIRCLES.push(MARKET);
  var sx = lakeShoreX(HUB.z);
  LANDING = { x:sx+2, z:HUB.z, name:'The pontoon landing' };
  /* the shops: a ring round the square, the quay (west) and the main street (east) left open.
     Footprints from ABYSS-KIT-NOTES.md; the builders' yard is new (falls back to the salvage dealer). */
  var RING = [
    ['abyss_shop_weapons', 0, -150, 13, 12, 'Weaponsmith', null],
    ['abyss_shop_armor',   0, -108, 12, 12, 'Armourer', null],
    ['abyss_shop_general', 1,  -66, 13, 12, 'General goods', null],
    ['abyss_shop_food',    0,   62, 13, 12, 'Cookshop and fish stall', null],
    ['abyss_shop_alchemy', 0,  106, 12, 12, 'Alchemist', null],
    ['abyss_shop_builder', 0,  150, 18, 14, "Builders' yard", 'abyss_shop_salvage']
  ];
  RING.forEach(function(R){ var a=R[2], r=MARKET.r + 4 + R[4]/2, p=polarXZ(a, r);
    var S = schedule(R[0], R[1], p[0], p[1], towardHub(p[0],p[1]), R[3], R[4], R[5], 'shop', { alt:R[6], trade:R[5] });
    SHOPS.push(S); });
  /* level the square and its ring */
  TERRAIN_PADS.push([MARKET.x, MARKET.z, MARKET.r+16, MARKET.r+44, Math.max(2.2, terrainH(MARKET.x+30, MARKET.z))]);
})();

/* ============================== 2. THE REED VILLAGE ==============================
   REED.islands[{id, x, z, rx, rz, seed, cluster, buildings:[{key, v, x, z, ry, name}]}] in WORLD x,z;
   REED.pads (the open-water sites on pads of their own), REED.bridges [[i,j]...] (island ids),
   REED.docks (rl_dock sites on island edges, pier outward), REED.pontoon (the one bridge to the land).
   The two clusters are the Reed Lake kit's own village (80-rl-islands.js, buildRLVillage) placed
   twice: the north cluster as built, the south one mirrored north-south, with the buildings changed
   toward a fishing and weaving village (more docks and weavers, the longhouse once). The island of
   REED'S LOCAL sits between them, nearest the land; the pontoon runs from it to the landing.      */
var REED = { islands:[], pads:[], bridges:[], docks:[], boats:[], pontoon:null, tavern:null };
var REED_FOOT = {   /* w x d of the reed defs (RL.def), for the island packing and the life layer's doors */
  rl_small_a:[12,12], rl_small_b:[12,12], rl_small_c:[12,13], rl_large_a:[16,20], rl_large_b:[20,15], rl_longhouse:[30,36],
  rl_warrior_hall:[32,32], rl_shaman:[22,22], rl_spirit_circle:[24,26], rl_watchtower:[12,12], rl_dock:[16,28], rl_weaver:[20,18],
  rl_warehouse:[22,22], rl_smithy:[18,16], rl_farmhouse:[22,18], rl_farm:[34,34], rl_pen:[22,18], rl_granary:[14,14], rl_fishfarm:[24,24],
  rl_tavern:[26,36] };
(function(){
  if(SHEET) return;
  /* the kit village's islands and buildings, in its own frame (copied from buildRLVillage) */
  var BASE = [
    { x:-36, z:-14, rx:18, rz:20 }, { x:6, z:-20, rx:16, rz:13 }, { x:40, z:-12, rx:13, rz:11 },
    { x:44, z:20, rx:16, rz:12 },   { x:-22, z:28, rx:17, rz:11 }, { x:8, z:14, rx:13, rz:10 } ];
  var BASE_BRIDGES = [[0,1],[1,2],[1,5],[5,4],[5,3],[4,0]];
  /* north: the kit's own mix (the longhouse, the shaman, the warrior's hall on the water) */
  var NORTH = [
    [['rl_longhouse',-36,-16,0,0,'Great mudhif'],['rl_small_a',-49,4,0.6,0]],
    [['rl_large_a',4,-21,0,0],['rl_watchtower',18,-29,0,0,'North watchtower']],
    [['rl_weaver',40,-12,0,0,"Reed weaver's workshop"]],
    [['rl_warehouse',48,18,0,0,'Reed warehouse'],['rl_smithy',32,14,0,0,'Scrap smithy']],
    [['rl_large_b',-14,27,0,0],['rl_pen',-32,28,0.15,0]],
    [['rl_shaman',2,14,0,0,"Shaman's house"],['rl_granary',15,8,0,0]] ];
  var NORTH_PADS = [['rl_spirit_circle',-64,-40,0.3,'Spirit circle'],['rl_farm',-58,30,0,'Floating gardens'],['rl_fishfarm',14,-52,0,'Fish weir and duck run'],['rl_warrior_hall',60,-46,-0.2,"Warrior's hall"]];
  /* south (mirrored z): dwellings, weavers and docks where the north has its halls */
  var SOUTH = [
    [['rl_large_a',-36,-14,0,1],['rl_small_b',-49,4,0.6,1]],
    [['rl_large_b',4,-21,0,1],['rl_small_c',19,-28,0,0]],
    [['rl_weaver',40,-12,0,1,"Reed weaver's workshop"]],
    [['rl_weaver',48,18,0,2,"Reed weaver's workshop"],['rl_small_a',31,14,0,1]],
    [['rl_small_b',-12,27,0,2],['rl_weaver',-32,26,0.15,0,"Reed weaver's workshop"]],
    [['rl_small_c',2,14,0,1],['rl_granary',15,8,0,1]] ];
  var SOUTH_PADS = [['rl_farm',-58,30,0,'Floating gardens'],['rl_fishfarm',14,-52,0,'Fish weir and duck run']];
  function cluster(name, ox, oz, flip, seed0, BLD, PADS){
    var ids=[];
    BASE.forEach(function(B, i){ var zz = flip ? -B.z : B.z, id=REED.islands.length;
      var I = { id:id, x:ox+B.x, z:oz+zz, rx:B.rx, rz:B.rz, seed:seed0+i, cluster:name, buildings:[] };
      BLD[i].forEach(function(b){ var bz = flip ? -b[2] : b[2], ry = flip ? Math.PI - b[3] : b[3];
        I.buildings.push({ key:b[0], v:b[4]||0, x:ox+b[1], z:oz+bz, ry:ry, name:b[5]||'' }); });
      REED.islands.push(I); ids.push(id); });
    BASE_BRIDGES.forEach(function(p){ REED.bridges.push([ids[p[0]], ids[p[1]]]); });
    PADS.forEach(function(P){ var pz = flip ? -P[2] : P[2]; REED.pads.push({ key:P[0], v:0, x:ox+P[1], z:oz+pz, ry:flip ? Math.PI-P[3] : P[3], name:P[4], cluster:name }); });
    return ids;
  }
  var NC = cluster('north', -250, -70, false, 11, NORTH, NORTH_PADS);
  var SC = cluster('south', -250, 60, true, 31, SOUTH, SOUTH_PADS);
  /* REED'S LOCAL: its own island between the clusters, its landing (+z) toward the land */
  var T = { id:REED.islands.length, x:-160, z:-2, rx:24, rz:19, seed:51, cluster:'bridgehead', buildings:[] };
  /* rl_tavern (81-rl-tavern.js): 26 x 36, door (-3, 12), its landing deck out to z 24.5 past the +z edge (z 18):
     the front edge stands on the island's east edge, so the landing is over the water toward the land */
  REED.tavern = { key:'rl_tavern', v:0, x:T.x+T.rx-18, z:T.z, ry:Math.PI/2, name:"Reed's Local", doorL:[-3,13], fallback:'rl_longhouse' };
  T.nav = loc(REED.tavern.x, REED.tavern.z, -3, 15.5, REED.tavern.ry);   /* the island's walk node: the terrace before the hall door */
  T.buildings.push(REED.tavern);
  REED.islands.push(T);
  /* the clusters meet at the tavern island, and once across the channel between them */
  REED.bridges.push([T.id, NC[3]], [T.id, SC[3]], [NC[4], SC[4]]);
  /* the fishing docks: on island edges facing open water, the pier running out along +z */
  function dockOn(id, deg, name){ var I=REED.islands[id], a=deg*Math.PI/180, c=Math.cos(a), s=Math.sin(a);
    var r = I.rx*I.rz/Math.sqrt(I.rz*I.rz*c*c + I.rx*I.rx*s*s);
    /* rl_dock's pier starts 4.5 m behind its origin (z0 = ZP + 3.5 with pad:false): the origin stands that far out */
    var D = { key:'rl_dock', v:REED.docks.length%2, x:I.x + c*(r+4.0), z:I.z + s*(r+4.0), ry:faceRy(c,s), name:name||'Fishing dock', island:id, edgeR:r };
    REED.docks.push(D); I.buildings.push(D); }
  dockOn(NC[3], 40, 'Fishing dock (north)'); dockOn(NC[2], -30, 'Fishing dock (north reach)');
  dockOn(SC[2], 30, 'Fishing dock (south reach)'); dockOn(SC[3], -40, 'Fishing dock (south)');
  dockOn(T.id, 120, "Reed's Local jetty");
  /* THE PONTOON: from the tavern island's east edge to the landing on the shore */
  PONTOON = { a:loc(REED.tavern.x, REED.tavern.z, -3, 24.0, REED.tavern.ry), b:[LANDING.x+1.0, LANDING.z], w:2.2, name:'The pontoon bridge' };
  REED.pontoon = PONTOON;
  /* boats tied up in the channels and reed clumps between the islands (the kit village's, for both clusters) */
  [[-8,10,.9,4.6,1.1,1],[24,2,-.6,4.2,1.05,1],[-40,14,1.4,4.2,1.05,1],[20,-38,.3,8,2,2,true],[66,4,-1,4.4,1.1,1]].forEach(function(B){
    [[-250,-70,false],[-250,60,true]].forEach(function(C){ REED.boats.push({ x:C[0]+B[0], z:C[1]+(C[2]?-B[1]:B[1]), ry:C[2]?Math.PI-B[2]:B[2], L:B[3], W:B[4], heads:B[5], cabin:!!B[6] }); }); });
  REED.clumps = [];
  [[-12,-40],[26,-30],[-52,-38],[62,-14],[22,42],[-38,44],[-4,50],[30,50],[-70,10],[70,32],[-8,-2]].forEach(function(c){
    REED.clumps.push([-250+c[0], -70+c[1]], [-250+c[0], 60-c[1]]); });
  REED.clumps.push([-120,-24],[-112,22],[-96,-30],[-88,30]);
  /* the open-water pads go on the island list too, so channels and boats keep off them */
  REED.pads.forEach(function(P){ var f=REED_FOOT[P.key]; P.rx=f[0]/2+2.2; P.rz=f[1]/2+2.2; });
  /* each pad on the open water gets a reed pontoon to its nearest island, so the gardens, the weir, the spirit circle
     and the warrior's hall are walked to (the kit village leaves them to the boats; Mungo's people walk) */
  REED.padBridges = REED.pads.map(function(P, pi){ var best=null, bd=1e9; REED.islands.forEach(function(I){ if(I.cluster==='bridgehead') return; var d=Math.hypot(I.x-P.x,I.z-P.z); if(d<bd){ bd=d; best=I; } }); return [pi, best.id]; });
  /* every island's outline (the reed kit uses the same formula, so the walk graph and the boats agree) */
  REED.islandR = function(I, a){ var c=Math.cos(a), s=Math.sin(a); return I.rx*I.rz/Math.sqrt(I.rz*I.rz*c*c + I.rx*I.rx*s*s); };
  REED.onIsland = function(x,z,pad){ for(var i=0;i<REED.islands.length;i++){ var I=REED.islands[i], a=Math.atan2(z-I.z,x-I.x); if(Math.hypot(x-I.x,z-I.z) < REED.islandR(I,a)+(pad||0)) return I; } return null; };
  REED.onPad = function(x,z,pad){ for(var i=0;i<REED.pads.length;i++){ var P=REED.pads[i], a=Math.atan2(z-P.z,x-P.x); if(Math.hypot(x-P.x,z-P.z) < REED.islandR(P,a)+(pad||0)) return P; } return null; };
  /* islands must not touch: a channel of at least 5 m between any two */
  for(var i=0;i<REED.islands.length;i++) for(var j=i+1;j<REED.islands.length;j++){ var A=REED.islands[i], B=REED.islands[j], a=Math.atan2(B.z-A.z,B.x-A.x);
    var gap=Math.hypot(B.x-A.x,B.z-A.z) - REED.islandR(A,a) - REED.islandR(B,a+Math.PI); if(gap < 5) ERR('layout: reed islands '+i+' and '+j+' are '+gap.toFixed(1)+' m apart'); }
  /* the pontoon must leave from the island edge and land on dry ground */
  if(terrainH(PONTOON.b[0]+3, PONTOON.b[1]) < 0.3) ERR('layout: the pontoon lands in water');
})();

/* ============================== STREET NETWORK (Locus's contract) ============================== */
var ST = { nodes:[], edges:[], adj:[] };
function stNode(x,z,tag){ var n={ id:ST.nodes.length, x:x, z:z, y:0, tag:tag||'street' }; ST.nodes.push(n); return n; }
var ST_EKEY = {};
function stEdge(a,b,cls){
  if(!a||!b||a===b) return null; var k = a.id<b.id ? a.id+'_'+b.id : b.id+'_'+a.id; if(ST_EKEY[k]) return ST_EKEY[k];
  var e={ id:ST.edges.length, a:a.id, b:b.id, cls:cls, w:ST_CLASS[cls].w, len:Math.hypot(a.x-b.x,a.z-b.z) }; ST.edges.push(e); ST_EKEY[k]=e; return e;
}
function stChain(nodes, cls){ for(var i=0;i<nodes.length-1;i++) stEdge(nodes[i], nodes[i+1], cls); }
var PADDY_FIELDS = [];
var HIGHWAYS = [], BRIDGES = [], AVENUES = [], CITY_RINGS = [], PUMPJACKS = [], DOCKS = [], STILT_SITES = [], FARMS = [];
var CITY_EDGE_H = 1.6;             /* the town builds where the ground stands clear of the wet season */
/* the landward town's ground: the terrace north of the river, back from the lake */
function cityGround(x,z){ return terrainH(x,z) > CITY_EDGE_H && lakeDist(x,z) > 18 && riverDist(x,z) > 16 && terraceK(x,z) > 0.25; }

/* ============================== THE ROUTE GRID (Locus's) ==============================
   One cost grid over the map for everything ROUTED rather than laid out: the highways, the farm and
   logging tracks, and later the life layer's boats and lizard riders. W: 0 dry · 1 river · 3 lake ·
   4 marsh pool; H: ground height; ROAD marks cells a road occupies; BLOCK the town and the sites.  */
var RG = { cell:12, ext:MAP_R+120 };
RG.n = Math.ceil(RG.ext*2/RG.cell);
RG.H = new Float32Array(RG.n*RG.n); RG.W = new Uint8Array(RG.n*RG.n); RG.ROAD = new Uint8Array(RG.n*RG.n); RG.BLOCK = new Uint8Array(RG.n*RG.n);
function rgIdx(x,z){ var i=Math.floor((x+RG.ext)/RG.cell), j=Math.floor((z+RG.ext)/RG.cell); if(i<0||j<0||i>=RG.n||j>=RG.n) return -1; return j*RG.n+i; }
function rgX(i){ return -RG.ext + (i+0.5)*RG.cell; }
(function(){
  if(SHEET) return;
  for(var j=0;j<RG.n;j++) for(var i=0;i<RG.n;i++){ var x=rgX(i), z=rgX(j), k=j*RG.n+i, h=terrainH(x,z); RG.H[k]=h;
    var w=0; if(h < 0.15){ if(lakeDist(x,z) < 10) w=3; else if(riverDist(x,z) < 6) w=1; else w=4; }
    RG.W[k]=w; }
})();
function rgMarkSeg(ax,az,bx,bz,half,arr,val){ var L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(L/(RG.cell*0.5)));
  for(var s=0;s<=n;s++){ var t=s/n, x=mix(ax,bx,t), z=mix(az,bz,t);
    for(var dx=-half;dx<=half;dx+=RG.cell*0.5) for(var dz=-half;dz<=half;dz+=RG.cell*0.5){ var k=rgIdx(x+dx,z+dz); if(k>=0) arr[k]=val; } } }
function rgMarkRect(S, pad, arr, val){ var R=Math.hypot(S.w,S.d)/2+pad;
  for(var x=S.x-R;x<=S.x+R;x+=RG.cell*0.5) for(var z=S.z-R;z<=S.z+R;z+=RG.cell*0.5){ if(inSiteRect(S,x,z,pad)){ var k=rgIdx(x,z); if(k>=0) arr[k]=val; } } }
function RGHeap(){ this.a=[]; }
RGHeap.prototype.push=function(node,score){ var a=this.a,i=a.length; a.push([node,score]); while(i>0){ var p=(i-1)>>1; if(a[p][1]<=a[i][1]) break; var t=a[p]; a[p]=a[i]; a[i]=t; i=p; } };
RGHeap.prototype.pop=function(){ var a=this.a, top=a[0], last=a.pop(); if(a.length){ a[0]=last; var i=0,n=a.length; while(true){ var l=2*i+1,r=l+1,sm=i; if(l<n&&a[l][1]<a[sm][1]) sm=l; if(r<n&&a[r][1]<a[sm][1]) sm=r; if(sm===i) break; var t=a[sm]; a[sm]=a[i]; a[i]=t; i=sm; } } return top; };
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
/* THE ROAD COST (Locus's): dry high ground is cheap, low ground costs more, the river is bridged at a
   price, the lake is refused, a marsh pool takes a causeway; cells a road already uses cost a third. */
function roadCost(kind){
  return function(k, from){
    if(RG.BLOCK[k]) return Infinity;
    var w=RG.W[k], h=RG.H[k];
    if(w===3) return Infinity;
    var c;
    if(w===4) c = (kind==='track') ? 18 : 30;
    else if(w===1) c = (kind==='track') ? 55 : 42;
    else { c = 1 + 6*smooth(2.6, 0.6, h); var dh=Math.abs(h-RG.H[from]); c += dh*1.6; }
    if(RG.ROAD[k]) c *= 0.3;
    return c;
  };
}
function rgPolyline(cells){
  var pts = cells.map(function(k){ var i=k%RG.n, j=(k-i)/RG.n; return [rgX(i), rgX(j)]; });
  function rdp(P, eps){ if(P.length<3) return P; var a=P[0], b=P[P.length-1], bi=-1, bd=0;
    for(var i=1;i<P.length-1;i++){ var d=segDist(P[i][0],P[i][1],a[0],a[1],b[0],b[1]); if(d>bd){ bd=d; bi=i; } }
    if(bd<=eps) return [a,b]; return rdp(P.slice(0,bi+1),eps).slice(0,-1).concat(rdp(P.slice(bi),eps)); }
  var s = rdp(pts, 4.5);
  if(s.length > 2){ var o=[s[0]]; for(var i=0;i<s.length-1;i++){ var A=s[i], B=s[i+1]; if(i>0) o.push([A[0]*0.75+B[0]*0.25, A[1]*0.75+B[1]*0.25]); if(i<s.length-2) o.push([A[0]*0.25+B[0]*0.75, A[1]*0.25+B[1]*0.75]); } o.push(s[s.length-1]); s=o; }
  var out=[s[0]]; for(var q=1;q<s.length;q++){ var P0=s[q-1], P1=s[q], L=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]), n=Math.max(1,Math.ceil(L/36)); for(var r=1;r<=n;r++) out.push([mix(P0[0],P1[0],r/n), mix(P0[1],P1[1],r/n)]); }
  return out;
}
function rgMarkPolyline(pts, half){ for(var i=0;i<pts.length-1;i++) rgMarkSeg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], half, RG.ROAD, 1); }
function nearestNodeTo(x,z, maxD, filter){ var best=null, bd=maxD||1e9; ST.nodes.forEach(function(n){ if(n.dead || (filter && !filter(n))) return; var d=Math.hypot(n.x-x,n.z-z); if(d<bd){ bd=d; best=n; } }); return best; }
function polylineToST(pts, cls, fromNode, toNode, tag){
  var nodes=[fromNode||stNode(pts[0][0],pts[0][1],tag||cls)];
  for(var i=1;i<pts.length-1;i++) nodes.push(stNode(pts[i][0], pts[i][1], tag||cls));
  var last = toNode || nearestNodeTo(pts[pts.length-1][0], pts[pts.length-1][1], 30, function(n){ return nodes.indexOf(n)<0; }) || stNode(pts[pts.length-1][0], pts[pts.length-1][1], tag||cls);
  nodes.push(last); stChain(nodes, cls); return nodes;
}
/* bridges: wherever a routed road crosses the river */
function findBridges(pts, cls, name){
  for(var i=0;i<pts.length-1;i++) for(var r=0;r<RIVER.length-1;r++){
    if(segCross(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1], RIVER[r][0],RIVER[r][1],RIVER[r+1][0],RIVER[r+1][1])){
      var dx=pts[i+1][0]-pts[i][0], dz=pts[i+1][1]-pts[i][1], L=Math.hypot(dx,dz);
      var mx=(RIVER[r][0]+RIVER[r+1][0])/2, mz=(RIVER[r][1]+RIVER[r+1][1])/2, best=null, bd=1e9;
      for(var t=0;t<=20;t++){ var x=mix(pts[i][0],pts[i+1][0],t/20), z=mix(pts[i][1],pts[i+1][1],t/20), d=Math.hypot(x-mx,z-mz); if(d<bd){ bd=d; best=[x,z]; } }
      var half = riverHalfAt(RIVER_CUM[r]), span = cls==='track' ? 2*half+16 : Math.max(36, 2*half+26);
      BRIDGES.push({ id:BRIDGES.length, kind:'river', x:best[0], z:best[1], dx:dx/L, dz:dz/L, L:span, nA:cls==='track'?2:3, w:ST_CLASS[cls].w+(cls==='track'?1.2:3), timber:cls==='track',
                     name:name+' '+(cls==='track'?'trestle':'bridge over the river') });
      return; } }
}
var XINGS = [], XING_AT = null;
function bridgeDeckAt(x,z){ for(var i=0;i<BRIDGES.length;i++){ var B=BRIDGES[i]; if(B.y==null) continue; var q=loc(0,0,x-B.x,z-B.z,-Math.atan2(-B.dz,B.dx)); if(Math.abs(q[0])<B.L/2 && Math.abs(q[1])<B.w/2) return B.y; } return XING_AT ? XING_AT(x,z) : null; }

/* ============================== 3-4. THE MAIN STREET AND THE SITES OF THE LANDWARD TOWN ============================== */
var QUAY = null, NORTH_ROAD = null, SOUTH_ROAD = null, GEO_ROAD = null, JUNCTION = null;
(function(){
  if(SHEET) return;
  function tH(x,z){ return terrainH(x,z); }
  /* the headman's house closes the main street's east end, its door looking back down the street */
  HEADMAN = schedule('abyss_house_rich', 0, 334, -32, -Math.PI/2, 24, 24, "The headman's house", 'civic', { role:'headman' });
  /* the caravanserai on the north road, its gate to the road (west) */
  CARAVANSERAI = schedule('abyss_caravanserai', 0, 222, -112, -Math.PI/2, 56, 58, 'Caravanserai of Mungo', 'caravanserai');
  /* the two inns: one on the main street's north side, one on its south side by the south road */
  INNS.push(schedule('abyss_inn', 0, 104, -44, 0, 24, 23, 'The Bridgehead Inn', 'inn'));
  INNS.push(schedule('abyss_inn', 1, 214, 26, Math.PI, 24, 23, 'The Caravan Inn', 'inn'));
  /* the city watch by the south road and the river bridge */
  WATCH = schedule('abyss_barracks', 0, 212, 84, -Math.PI/2, 52, 46, 'The city watch', 'watch');
  /* the warehouses: by the caravanserai (the caravans' goods), and on the shore (the fish and the reed goods) */
  WAREHOUSES.push(schedule('abyss_warehouse', 1, 238, -186, -Math.PI/2, 36, 22, 'Caravan warehouse', 'warehouse'));
  WAREHOUSES.push(schedule('locus_warehouse', 0, 106, -118, Math.PI/2, 42, 22, 'Salt-and-goods warehouse', 'warehouse'));
  FISH_WAREHOUSE = schedule('abyss_warehouse', 0, -6, -70, 0, 36, 22, 'Fish warehouse', 'warehouse');
  WAREHOUSES.push(FISH_WAREHOUSE);
  SALT_MERCHANT = schedule('abyss_shop_salt', 0, -22, 40, Math.PI, 14, 12, 'Salt and fish merchant', 'shop', { trade:'Salt and fish merchant' });
  SHOPS.push(SALT_MERCHANT);
  /* the Geomancers' quarter, east of the headman's: the chapterhouse, its forecourt and buggy park, the
     generator that powers the quarter, the fuel station, and six Yuni houses round it */
  GEOCHAPTER = schedule('civic_geomancer_chapterhouse', 0, 446, -156, 0, 48, 42, "Geomancers' Chapterhouse", 'geo');
  GENERATOR = schedule('ind_generator_house', 0, 392, -214, Math.PI/2, 32, 22, "Geomancers' generator house", 'geo');
  FUELSTATION = schedule('trade_fuel_station', 0, 500, -92, -Math.PI/2, 24, 18, 'Fuel station', 'geo');
  PARKING = { key:'yard', x:448, z:-96, ry:0, w:34, d:20, name:'The buggy park', tag:'parking' }; YARDS.push(PARKING);
  [['mid_bluewash_townhouse',0,388,-150,Math.PI/2,10,10],['mid_djenne_house',1,392,-118,Math.PI/2,11,9],['mid_stacked_cubes',2,500,-150,-Math.PI/2,12,11],
   ['mid_round_tower_house',0,503,-124,-Math.PI/2,13,10],['mid_courtyard_house',1,424,-206,Math.PI,12,12],['mid_washed_house',2,470,-208,Math.PI,11,9]].forEach(function(Y){
    YUNI_HOUSES.push(schedule(Y[0], Y[1], Y[2], Y[3], Y[4], Y[5], Y[6], 'Yuni house', 'yuni', { wired:true })); });
  /* level every rectangle a building needs (not the docks: they stand in the water) */
  SITES_L.forEach(function(S){ TERRAIN_RECTS.push([S.x, S.z, S.w/2+3, S.d/2+3, S.ry, 12, Math.max(CITY_EDGE_H+0.4, tH(S.x,S.z))]); });
  TERRAIN_RECTS.push([PARKING.x, PARKING.z, PARKING.w/2+2, PARKING.d/2+2, 0, 10, tH(PARKING.x, PARKING.z)]);

  /* ---------- THE STREETS THAT ARE LAID BY HAND ---------- */
  /* the market's rim street */
  var rim=[]; for(var m=0;m<20;m++){ var ma=m/20*TAU; rim.push(stNode(MARKET.x+Math.cos(ma)*(MARKET.r+2), MARKET.z+Math.sin(ma)*(MARKET.r+2), 'marketrim')); }
  for(m=0;m<20;m++) stEdge(rim[m], rim[(m+1)%20], 'street');
  MARKET.rim = rim;
  function rimAt(deg){ var a=deg*Math.PI/180, best=null, bd=1e9; rim.forEach(function(n){ var d=angDist(Math.atan2(n.z-MARKET.z,n.x-MARKET.x), a); if(d<bd){ bd=d; best=n; } }); return best; }
  ST.hub = rimAt(0);
  /* the quay: from the pontoon landing to the market's west rim */
  var land = stNode(LANDING.x+1, LANDING.z, 'landing'), q1 = stNode(mix(LANDING.x, MARKET.x-MARKET.r, 0.5), LANDING.z, 'quay');
  QUAY = [land, q1, rimAt(180)]; stChain(QUAY, 'quay'); ST.landing = land;
  /* THE MAIN STREET: straight, from the market's east rim to the headman's door */
  var hf = siteFront(HEADMAN, 3);
  var MS = [[MARKET.x+MARKET.r+2, MARKET.z],[96,-9],[132,-12],[160,-15],[196,-19],[236,-23],[276,-27],[hf[0], hf[1]]];
  var msNodes=[rimAt(0)]; for(var i=1;i<MS.length;i++) msNodes.push(stNode(MS[i][0], MS[i][1], 'main'));
  stChain(msNodes, 'main'); MAIN_STREET = { nodes:msNodes, name:'The main street', from:'the bridgehead market', to:"the headman's house" };
  JUNCTION = msNodes[3]; JUNCTION.tag='junction';
  /* the north and south roads through the town, laid by hand to the town's edge (the highways go on from there) */
  var NR = [[JUNCTION.x, JUNCTION.z],[163,-58],[167,-104],[170,-150],[174,-200],[178,-252],[182,-300],[186,-348]];
  NORTH_ROAD = [JUNCTION]; for(i=1;i<NR.length;i++) NORTH_ROAD.push(stNode(NR[i][0], NR[i][1], 'northroad')); stChain(NORTH_ROAD, 'highway');
  var SR = [[JUNCTION.x, JUNCTION.z],[158,30],[156,74],[154,112],[152,160],[150,206],[148,250],[146,296]];
  SOUTH_ROAD = [JUNCTION]; for(i=1;i<SR.length;i++) SOUTH_ROAD.push(stNode(SR[i][0], SR[i][1], 'southroad')); stChain(SOUTH_ROAD, 'highway');
  findBridges(SR, 'highway', 'The south road');
  /* the Geomancers' road: from the headman's forecourt up to their square, and round the chapterhouse */
  var gq = siteFront(GEOCHAPTER, 6);
  var GR = [[hf[0], hf[1]],[314,-60],[352,-80],[400,-98],[gq[0], gq[1]]];
  GEO_ROAD = [msNodes[msNodes.length-1]]; for(i=1;i<GR.length;i++) GEO_ROAD.push(stNode(GR[i][0], GR[i][1], 'georoad')); stChain(GEO_ROAD, 'road');
  var C = GEOCHAPTER, ringPts = [[-36,30],[36,30],[36,-34],[-36,-34]].map(function(p){ var q=loc(C.x,C.z,p[0],p[1],C.ry); return stNode(q[0],q[1],'georing'); });
  stChain(ringPts.concat([ringPts[0]]), 'street'); stEdge(GEO_ROAD[GEO_ROAD.length-1], ringPts[0], 'street'); stEdge(GEO_ROAD[GEO_ROAD.length-1], ringPts[1], 'street');
  /* the buggy park opens off the forecourt; the fuel station off the park's east end */
  var pk = stNode(PARKING.x, PARKING.z, 'parking'); stEdge(GEO_ROAD[GEO_ROAD.length-1], pk, 'road'); PARKING.node = pk;
  /* every scheduled site gets a short spur from its door to the nearest street (the life layer walks in there) */
  SITES_L.forEach(function(S){ if(S.spur) return; var f=siteFront(S, 2.5), n=nearestNodeTo(f[0], f[1], 90, function(q){ return q.tag!=='parking'; });
    if(!n) return; var d=Math.hypot(n.x-f[0], n.z-f[1]); var sp = d < 3 ? n : stNode(f[0], f[1], 'door'); if(sp!==n) stEdge(n, sp, d > 24 ? 'street' : 'lane'); S.spur = sp; });
})();

/* ============================== 5. THE HIGHWAYS (A* over the route grid, Locus's) ============================== */
(function(){
  if(SHEET) return;
  SITES_L.forEach(function(S){ rgMarkRect(S, 3, RG.BLOCK, 1); });
  YARDS.forEach(function(Y){ rgMarkRect(Y, 2, RG.BLOCK, 1); });
  CIRCLES.forEach(function(C){ for(var x=C.x-C.r;x<=C.x+C.r;x+=6) for(var z=C.z-C.r;z<=C.z+C.r;z+=6) if(Math.hypot(x-C.x,z-C.z)<C.r){ var k=rgIdx(x,z); if(k>=0) RG.BLOCK[k]=1; } });
  /* the town is not open country: a route may leave it only along its streets */
  for(var j=0;j<RG.n;j++) for(var i=0;i<RG.n;i++){ var x=rgX(i), z=rgX(j); if(cityGround(x,z) && Math.hypot(x-190, (z+30)*1.15) < 300) RG.BLOCK[j*RG.n+i]=1; }
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; rgMarkSeg(A.x,A.z,B.x,B.z, e.w/2, RG.ROAD, 1); rgMarkSeg(A.x,A.z,B.x,B.z, e.w/2, RG.BLOCK, 0); });
  function lay(fromNode, goalFn, hFn, cls, name){
    var k0=rgIdx(fromNode.x, fromNode.z); if(k0<0) return null; RG.BLOCK[k0]=0;
    var cells=rgAStar(k0, roadCost(cls==='track'?'track':'road'), goalFn, hFn, 600000);
    if(!cells){ ERR('layout: no route for '+name); return null; }
    var pts=rgPolyline(cells); pts[0]=[fromNode.x, fromNode.z];
    var nodes=polylineToST(pts, cls, fromNode, null, cls); rgMarkPolyline(pts, ST_CLASS[cls].w/2); findBridges(pts, cls, name);
    var H={ name:name, cls:cls, pts:pts, nodes:nodes }; HIGHWAYS.push(H); return H; }
  var nEnd=NORTH_ROAD[NORTH_ROAD.length-1], sEnd=SOUTH_ROAD[SOUTH_ROAD.length-1];
  var hN = lay(nEnd, function(k){ return rgX(Math.floor(k/RG.n)) < -MAP_R+8; }, function(k){ return Math.max(0, rgX(Math.floor(k/RG.n)) + MAP_R)/RG.cell*0.8; }, 'highway', 'North highway');
  var hS = lay(sEnd, function(k){ return rgX(Math.floor(k/RG.n)) > MAP_R-8; }, function(k){ return Math.max(0, MAP_R - rgX(Math.floor(k/RG.n)))/RG.cell*0.8; }, 'highway', 'South highway');
  if(hN) hN.pts = NORTH_ROAD.map(function(n){ return [n.x,n.z]; }).concat(hN.pts.slice(1));
  if(hS) hS.pts = SOUTH_ROAD.map(function(n){ return [n.x,n.z]; }).concat(hS.pts.slice(1));
  ST.hwyN = hN; ST.hwyS = hS;
  /* the highway ends: where the caravans come from and go back to */
  ST.roadEnds = [hN, hS].filter(Boolean).map(function(H){ return H.nodes[H.nodes.length-1]; });
})();

/* ============================== 6. THE ORGANIC STREETS ==============================
   "Street layout is chaotic and organic, aside from one main street ... and highways." Lanes are GROWN:
   from the main street, the two roads through the town, the Geomancers' road and the quay, a lane leaves at
   a rough right angle, wanders (each step 15-25 m, turning up to 25 degrees), branches now and then, and
   stops at the town's edge, a site, the square, the water or another street: meeting a street or coming
   within 9 m of a node it JOINS it, which is what makes the blocks. Then the connectivity pass. */
(function(){
  if(SHEET) return;
  reseed(301001);
  var MAXN = 340, made = 0, crossing = 0, joins = 0, stops = { edge:0, site:0, water:0, cross:0, steps:0 };
  function townOK(x,z){ return cityGround(x,z) && Math.hypot(x-190, (z+30)*1.15) < 330 && x < 520 && z < 118; }
  function blocked(x,z){ return inAnySite(x,z,3.5) || inCircle(x,z,3.5) || inYard(x,z,3); }
  function crossesEdge(ax,az,bx,bz, skipNode){ for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b];
      if(A===skipNode || B===skipNode) continue; if(segCross(ax,az,bx,bz, A.x,A.z,B.x,B.z)) return e; } return null; }
  function nearNode(x,z,r,except){ var best=null, bd=r; for(var i=0;i<ST.nodes.length;i++){ var n=ST.nodes[i]; if(n.dead || except.indexOf(n)>=0) continue; var d=Math.hypot(n.x-x,n.z-z); if(d<bd){ bd=d; best=n; } } return best; }
  var Q = [];
  function seedAlong(nodes, prob, cls){ for(var i=0;i<nodes.length-1;i++){ var A=nodes[i], B=nodes[i+1], L=Math.hypot(B.x-A.x,B.z-A.z); if(L<8) continue;
      var h=Math.atan2(B.z-A.z, B.x-A.x); [-1,1].forEach(function(sd){ if(rnd() < prob) Q.push({ from:B, h:h+sd*(Math.PI/2+rr(-0.35,0.35)), cls:cls, gen:0 }); }); } }
  seedAlong(MAIN_STREET.nodes, 0.9, 'street');
  seedAlong(NORTH_ROAD, 0.85, 'street'); seedAlong(SOUTH_ROAD.slice(0,4), 0.85, 'street');
  seedAlong(GEO_ROAD, 0.6, 'alley'); seedAlong(QUAY, 0.7, 'alley');
  /* from the market rim too: lanes out between the shops */
  [-128,-86,84,128,-170,170].forEach(function(deg){ var a=deg*Math.PI/180; var n=nearestNodeTo(MARKET.x+Math.cos(a)*(MARKET.r+2), MARKET.z+Math.sin(a)*(MARKET.r+2), 10, function(q){ return q.tag==='marketrim'; }); if(n) Q.push({ from:n, h:a, cls:'alley', gen:0 }); });
  var qi=0;
  while(qi < Q.length && made < MAXN){
    var s=Q[qi++], P=s.from, h=s.h, steps=s.gen===0 ? 3+Math.floor(rnd()*4) : 2+Math.floor(rnd()*3), chain=[P];
    for(var k=0;k<steps;k++){
      var L=rr(15,25); h += rr(-0.44,0.44);
      var x=P.x+Math.cos(h)*L, z=P.z+Math.sin(h)*L;
      if(!townOK(x,z)){ stops.edge++; break; }
      if(blocked(x,z) || segHitsSite(P.x,P.z,x,z,2) || inCircle((P.x+x)/2,(P.z+z)/2,2)){ stops.site++; break; }
      var wet=false; for(var t=0.25;t<1.01;t+=0.25){ var qx=mix(P.x,x,t), qz=mix(P.z,z,t); if(riverDist(qx,qz)<10 || lakeDist(qx,qz)<14) wet=true; } if(wet){ stops.water++; break; }
      var near = nearNode(x,z,9,chain);
      var hit = crossesEdge(P.x,P.z, near?near.x:x, near?near.z:z, P);
      if(hit){ var A=ST.nodes[hit.a], B=ST.nodes[hit.b], tgt = Math.hypot(A.x-P.x,A.z-P.z) < Math.hypot(B.x-P.x,B.z-P.z) ? A : B;
        if(!segHitsSite(P.x,P.z,tgt.x,tgt.z,1.5) && !crossesEdge(P.x,P.z,tgt.x,tgt.z,P) && Math.hypot(tgt.x-P.x,tgt.z-P.z) < 32){ stEdge(P, tgt, s.cls); joins++; }
        stops.cross++; break; }
      if(near){ if(!segHitsSite(P.x,P.z,near.x,near.z,1.5)){ stEdge(P, near, s.cls); joins++; } break; }
      var n=stNode(x,z,'lane'+s.gen); stEdge(P, n, s.cls); chain.push(n); P=n; made++;
      if(s.gen < 2 && rnd() < (s.gen===0 ? 0.42 : 0.25)){ var sd=rnd()<0.5?-1:1; Q.push({ from:n, h:h+sd*(Math.PI/2+rr(-0.4,0.4)), cls:s.gen===0?'alley':'lane', gen:s.gen+1 }); }
      if(k===steps-1) stops.steps++;
    }
  }
  ST.grown = { nodes:made, joins:joins, stops:stops, seeds:Q.length };
})();

/* ============================== 7. THE COUNTRYSIDE ==============================
   FARMS (the fields and farmsteads on the river flats), DOCKS (the fishing jetties on the shore),
   LOGGING (the forest landings the lumberjacks work and haul from), FORAGE (the fruit groves the
   gatherers walk), FISH_WATER (where the boats fish), SHORE_FISH (where the shore fishers stand),
   PORTS (the map-edge entries life comes and goes by). Every one gets a lane or a track to the network. */
var LOGGING = [], FORAGE = [], FISH_WATER = [], SHORE_FISH = [], PORTS = {};
(function(){
  if(SHEET) return;
  reseed(302001);
  /* the fishing docks on the shore north of the town: the landing on the bank (+z of the asset, east),
     the jetty out over the shallows (west) */
  [-118, -168].forEach(function(dz, di){ var bx=lakeShoreX(dz);
    var S = schedule('infra_fishing_dock', di%2, bx-12, dz, Math.PI/2, 12, 34, 'Fishing dock '+(di+1)+' (the shore)', 'dock', { water:true });
    DOCKS.push(S); rgMarkRect(S, 1, RG.BLOCK, 1);
    var f=siteFront(S, 3), n=nearestNodeTo(f[0], f[1], 120, function(q){ return !q.dead; });
    var sp=stNode(f[0], f[1], 'door'); if(n && !segHitsSite(sp.x,sp.z,n.x,n.z,1)) stEdge(n, sp, 'lane'); S.spur=sp; });
  /* the fields: blocks of salt-rice paddies, the farmsteads, a granary and a windpump on the river flats */
  function fieldOK(cx,cz,ry,W,D){ var lo=1e9, hi=-1e9;
    for(var lx=-W/2-3; lx<=W/2+3.01; lx+=4) for(var lz=-D/2-3; lz<=D/2+3.01; lz+=4){
      var p=loc(cx,cz,lx,lz,ry), px=p[0], pz=p[1], ph=terrainH(px,pz), pk=rgIdx(px,pz);
      if(ph<0.5 || ph>3.6 || lakeDist(px,pz)<60 || riverDist(px,pz)<9) return false;
      if(pk<0 || RG.ROAD[pk] || RG.BLOCK[pk] || inAnySite(px,pz,4) || inCircle(px,pz,4) || inYard(px,pz,3) || forestK(px,pz) > 0.35) return false;
      lo=Math.min(lo,ph); hi=Math.max(hi,ph); }
    return hi-lo < 2.2 ? (lo+hi)/2 : false; }
  var WANT = [['farm_saltrice_paddies',0,48,38,'Salt-rice paddies'],['farm_saltrice_paddies',1,48,38,'Salt-rice paddies'],['abyss_farmhouse',0,24,22,'Marsh farmhouse'],
              ['farm_saltrice_paddies',0,48,38,'Salt-rice paddies'],['farm_saltrice',0,48,38,'Salt-rice farm'],['abyss_farmhouse',1,24,22,'Marsh farmhouse'],
              ['farm_saltrice_paddies',1,48,38,'Salt-rice paddies'],['abyss_granary',0,28,24,'Silo granary'],['abyss_windmill',0,16,14,'Windpump and water tank'],
              ['abyss_farmhouse',0,24,22,'Marsh farmhouse'],['farm_saltrice_paddies',0,48,38,'Salt-rice paddies']];
  var cands=[];
  for(var x=-40;x<=900;x+=14) for(var z=-80;z<=520;z+=14){ var rd=riverDist(x,z); if(rd<16 || rd>150) continue; if(cityGround(x,z) && z<100 && x<520) continue;
    var k=rgIdx(x,z); if(k<0 || RG.BLOCK[k] || RG.ROAD[k]) continue; cands.push([x, z, rd + 0.10*Math.hypot(x-150, z-120) + 25*phash(x,3,z,7)]); }
  cands.sort(function(a,b){ return a[2]-b[2]; });
  var laid=0, refused=0;
  WANT.forEach(function(Wt){
    for(var ci=0; ci<cands.length; ci++){ var cx=cands[ci][0], cz=cands[ci][1]; if(cands[ci].used) continue;
      var gx=riverDist(cx+6,cz)-riverDist(cx-6,cz), gz=riverDist(cx,cz+6)-riverDist(cx,cz-6); if(Math.hypot(gx,gz)<1e-3) continue;
      var ry=faceRy(gx,gz), y=fieldOK(cx,cz,ry,Wt[2],Wt[3]); if(y===false){ refused++; continue; }
      var front=loc(cx,cz,0,Wt[3]/2+2.5,ry), to=nearestNodeTo(front[0], front[1], 220, function(n){ return !n.dead && n.tag!=='parking'; });
      if(!to){ refused++; continue; }
      var S=schedule(Wt[0], Wt[1], cx, cz, ry, Wt[2], Wt[3], Wt[4], 'farm');
      TERRAIN_RECTS.push([cx, cz, Wt[2]/2+2, Wt[3]/2+2, ry, 8, clamp(y, 0.9, 2.6)]);
      rgMarkRect(S, 2, RG.BLOCK, 1); FARMS.push(S); if(Wt[0]==='farm_saltrice_paddies') PADDY_FIELDS.push(S);
      for(var cj=0; cj<cands.length; cj++) if(Math.hypot(cands[cj][0]-cx, cands[cj][1]-cz) < Math.hypot(Wt[2],Wt[3])/2+30) cands[cj].used=true;
      /* the lane: a track routed from the field's verge to the network */
      var sp=stNode(front[0], front[1], 'farmgate'); S.spur=sp; var k0=rgIdx(sp.x, sp.z);
      if(k0>=0){ RG.BLOCK[k0]=0; var cells=rgAStar(k0, roadCost('track'), function(k){ return RG.ROAD[k]===1; }, function(){ return 0; }, 120000);
        if(cells){ var pts=rgPolyline(cells); pts[0]=[sp.x, sp.z]; polylineToST(pts, 'track', sp, null, 'track'); rgMarkPolyline(pts, 2.2); findBridges(pts, 'track', 'Farm track'); }
        else { /* boxed in (by the other fields and the marsh): a straight lane to the nearest street; 7b raises it on a causeway */
          var nn=nearestNodeTo(sp.x, sp.z, 260, function(n){ return n!==sp && !n.dead && n.tag!=='parking' && n.tag!=='farmgate'; });
          if(nn && !segHitsSite(sp.x,sp.z,nn.x,nn.z,1)){ stEdge(sp, nn, 'track'); rgMarkSeg(sp.x,sp.z,nn.x,nn.z,2.2,RG.ROAD,1); }
          else ERR('layout: '+Wt[4]+' found no track'); } }
      laid++; return; } });
  if(laid < WANT.length) ERR('layout: only '+laid+' of '+WANT.length+' farm sites found ground ('+refused+' refused)');
  /* the logging landings: clearings at the forest's edge, each with a track out; the lumberjacks fell round them */
  var logC=[]; for(var a=0;a<64;a++){ var ang=a/64*TAU; for(var r=340;r<760;r+=20){ var lx=120+Math.cos(ang)*r, lz=40+Math.sin(ang)*r; if(forestK(lx,lz) > 0.55 && lakeDist(lx,lz) > 120 && riverDist(lx,lz) > 40){ logC.push([lx,lz,ang]); break; } } }
  for(var li=0; li<logC.length && LOGGING.length<5; li+=Math.max(1, Math.floor(logC.length/5))){ var c=logC[li], k1=rgIdx(c[0],c[1]); if(k1<0 || RG.BLOCK[k1]) continue;
    var Y = { key:'yard', x:c[0], z:c[1], ry:faceRy(120-c[0], 40-c[1]), w:18, d:14, name:'Logging landing', tag:'logging' }; YARDS.push(Y); rgMarkRect(Y, 1, RG.BLOCK, 1);
    var fl=loc(Y.x,Y.z,0,Y.d/2+2,Y.ry), spl=stNode(fl[0], fl[1], 'logging'); RG.BLOCK[rgIdx(spl.x,spl.z)]=0;
    var cl=rgAStar(rgIdx(spl.x,spl.z), roadCost('track'), function(k){ return RG.ROAD[k]===1; }, function(){ return 0; }, 150000);
    if(!cl){ ERR('layout: logging landing '+(LOGGING.length+1)+' found no track'); continue; }
    var ptl=rgPolyline(cl); ptl[0]=[spl.x, spl.z]; polylineToST(ptl, 'track', spl, null, 'track'); rgMarkPolyline(ptl, 2.2); findBridges(ptl, 'track', 'Logging track');
    Y.node=spl; Y.fell = { x:Y.x, z:Y.z, r:70 }; LOGGING.push(Y); }
  /* the fruit groves: forest edge nearer the town, where the biome's fruiting species stand */
  for(var g=0; g<7; g++){ var ga=-1.9 + g*0.62 + rr(-0.15,0.15), best=null;
    for(var rr2=300; rr2<620; rr2+=15){ var gx2=120+Math.cos(ga)*rr2, gz2=40+Math.sin(ga)*rr2*0.9; if(forestK(gx2,gz2) > 0.35 && lakeDist(gx2,gz2) > 60 && riverDist(gx2,gz2) > 20){ best=[gx2,gz2]; break; } }
    if(best) FORAGE.push({ x:best[0], z:best[1], r:45, name:'Fruit grove', resource:'FRUIT' }); }
  /* the fishing water: open lake past the reed village (the boats), and spots along the shore (the shore fishers) */
  FISH_WATER.push({ name:'The open lake, west of the reed village', poly:[[-520,-420],[-1100,-500],[-1150,520],[-520,460],[-400,180],[-420,-180]] });
  FISH_WATER.push({ name:'The reed channels north', poly:[[-140,-260],[-420,-260],[-430,-160],[-150,-150]] });
  FISH_WATER.push({ name:'The reed channels south', poly:[[-140,150],[-420,170],[-430,260],[-150,260]] });
  /* the shore fishers' spots: the first dry ground east of the waterline, north of the town and south of the mouth */
  /* (the marsh at the mouth: the south spots stand at its edge, on ground a hand above the water) */
  for(var sf=0; sf<22; sf++){ var szz = sf<14 ? -420 + sf*17 : 170 + (sf-14)*26, sxx=lakeShoreX(szz)-6, guardS=0, dry = sf<14 ? 0.35 : 0.12;
    while(terrainH(sxx,szz) < dry && guardS++ < 60) sxx += 1;
    if(guardS < 60 && !inAnySite(sxx,szz,3) && segDist(sxx,szz,PONTOON.a[0],PONTOON.a[1],PONTOON.b[0],PONTOON.b[1]) > 20) SHORE_FISH.push({ x:sxx+0.8, z:szz, face:-Math.PI/2 }); }
  /* the map-edge ports: the highways' ends, and the open country the nomads ride in across */
  if(ST.hwyN){ var nE=ST.hwyN.nodes[ST.hwyN.nodes.length-1]; PORTS.north_highway={ x:nE.x, z:nE.z, kind:'road', node:nE }; }
  if(ST.hwyS){ var sE=ST.hwyS.nodes[ST.hwyS.nodes.length-1]; PORTS.south_highway={ x:sE.x, z:sE.z, kind:'road', node:sE }; }
  PORTS.east_country = { x:MAP_R-10, z:-140, kind:'country' };
  PORTS.northeast_country = { x:MAP_R*0.72, z:-MAP_R+10, kind:'country' };
  PORTS.southeast_country = { x:MAP_R*0.72, z:MAP_R-10, kind:'country' };
  PORTS.north_country = { x:-200, z:-MAP_R+10, kind:'country' };
  PORTS.south_country = { x:-160, z:MAP_R-10, kind:'country' };
})();

/* ---------- THE CONNECTIVITY PASS (Locus's, unchanged): no disconnected portions ---------- */
(function(){
  if(SHEET) return;
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
    if(best && bd < 120){ stEdge(best[0],best[1],'lane'); joined++; }
    else { G.forEach(function(n){ n.dead=true; removed++; }); ST.edges.forEach(function(e){ if(ST.nodes[e.a].dead||ST.nodes[e.b].dead) e.dead=true; }); }
  }
  ST.edges = ST.edges.filter(function(e){ return !e.dead; });
  var Cf=components();
  ST.report = { nodes:ST.nodes.filter(function(n){return !n.dead;}).length, edges:ST.edges.length, componentsBefore:before, joined:joined, removedNodes:removed,
                componentsAfter:Object.keys(Cf.groups).length+1, connected:Object.keys(Cf.groups).length===0, grown:ST.grown,
                highways:HIGHWAYS.map(function(H){ return H.name+': '+H.nodes.length+' nodes'; }), bridges:BRIDGES.length, farms:FARMS.length, logging:LOGGING.length, forage:FORAGE.length };
})();
/* ============================== 7b. THE MARSH AT THE MOUTH ==============================
   (the owner, 2026-10-05: "an extensive marsh with reeds at the river mouth"; the ground is 10-core.js's marshK)
     - every road, street and track that crosses it runs on a CAUSEWAY (terrainH raises the ground under it);
     - REED_BEDS: the reed clumps, on a jittered 3.4 m grid where the marsh is, thinned by a patch noise so open
       water and mud flats show between the stands; on dry ground, in the pools and in the lake's fringe; never on a
       road, a site, a yard, the river's channel or the pontoon. Drawn by the Reed Lake kit (its living reed, 65r);
     - REEDCUT: the reed-cutting grounds at the marsh's edge, each by a street or track (the life layer's places). */
var REED_BEDS = [], REEDCUT = [];
(function(){
  if(SHEET) return;
  reseed(303001);
  ST.edges.forEach(function(e){ if(e.dead) return; var A=ST.nodes[e.a], B=ST.nodes[e.b], n=Math.max(1, Math.ceil(e.len/6)), wet=0;
    for(var k=0;k<=n;k++){ var t=k/n; if(marshK(mix(A.x,B.x,t), mix(A.z,B.z,t)) > 0.12) wet++; }
    if(wet) CAUSEWAYS.push([A.x, A.z, B.x, B.z, e.w/2+1.2, 1.15]); });
  var x0=-190, x1=560, z0=45, z1=760, step=3.4, n=0;
  for(var x=x0; x<=x1; x+=step) for(var z=z0; z<=z1; z+=step){
    var jx=x+(phash(x,1,z,11)-0.5)*step, jz=z+(phash(x,2,z,12)-0.5)*step, mk=marshK(jx,jz);
    if(mk < 0.3) continue;
    var patch = nfb(jx*0.016+9, jz*0.016-3); if(patch < 0.40 - 0.18*mk) continue;      /* the open mud and water between the stands */
    var h=terrainH(jx,jz); if(h < -1.1 || h > 1.1) continue;
    if(lakeDist(jx,jz) < -45 || riverQuery(jx,jz).d < -1.5) continue;
    if(onStreet(jx,jz,2.5) || inAnySite(jx,jz,3) || inYard(jx,jz,2) || inCircle(jx,jz,3)) continue;
    if(PONTOON && segDist(jx,jz,PONTOON.a[0],PONTOON.a[1],PONTOON.b[0],PONTOON.b[1]) < 6) continue;
    var dense = smooth(0.40, 0.75, patch);
    REED_BEDS.push([jx, h < 0 ? -0.08 : h-0.05, jz, 2 + Math.round(3*dense*mk), h > 0.25 ? 1 : 0]); n++; }
  /* the reed-cutting grounds: the densest marsh within 30 m of a street or track, spread out */
  var cand=[]; REED_BEDS.forEach(function(r){ if(r[3] < 4 || r[1] < 0) return; var ns=nearestStreet(r[0],r[2],30); if(ns && ns.d > 4) cand.push([r[0], r[2], ns]); });
  for(var i=0;i<cand.length && REEDCUT.length<6;i+=Math.max(1,Math.floor(cand.length/9))){ var c=cand[i];
    if(REEDCUT.some(function(q){ return Math.hypot(q.x-c[0], q.z-c[1]) < 90; })) continue;
    REEDCUT.push({ x:c[0], z:c[1], door:[c[2].px, c[2].pz], name:'Reed beds at the mouth' }); }
  REED.marsh = { beds:REED_BEDS.length, cuts:REEDCUT.length, causeways:CAUSEWAYS.length };
})();
ST.nodes.forEach(function(n){ n.y = terrainH(n.x,n.z); });
ST.edges.forEach(function(e,i){ e.id=i; e.len=Math.hypot(ST.nodes[e.a].x-ST.nodes[e.b].x, ST.nodes[e.a].z-ST.nodes[e.b].z); });
window._streets = ST.report || {};

/* nearest street to a point, weighted by class priority — the door-orientation rule */
function nearestStreet(x,z,maxD){
  var best=null, bs=-1e9; maxD=maxD||60;
  for(var i=0;i<ST.edges.length;i++){ var e=ST.edges[i], A=ST.nodes[e.a], B=ST.nodes[e.b];
    if(e.cls==='pontoon') continue;
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

/* ============================== 8. THE WALK GRAPH (NAV) ==============================
   The life layer's network (Locus's contract: nodes{id,x,y,z,tag}, edges{id,a,b,kind,len,w}). Edge kinds:
   'ground' (a street, with its class and width), 'pontoon' (the long bridge, and the reed village's own
   bridges), 'deck' (across a reed island, from its middle to a door or a bridge end). The reed islands
   stand REED_Y above the water: the reed kit's y = 0 (an island's top) is world y = REED_Y.            */
var REED_Y = 0.45;
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
  /* the reed village: a node in each island's middle, its doors, its bridge ends */
  var IN = REED.islands.map(function(I){ var p=I.nav||[I.x,I.z]; return navNode(p[0], REED_Y, p[1], 'island', { island:I.id }); });
  REED.doorNodes = [];
  REED.islands.forEach(function(I, i){ I.buildings.forEach(function(b){ var f=REED_FOOT[b.key]||[12,12];
      var p = b.key==='rl_dock' ? loc(b.x,b.z,0,8.5,b.ry) : b.doorL ? loc(b.x,b.z,b.doorL[0],b.doorL[1],b.ry) : loc(b.x,b.z,0,f[1]/2+0.8,b.ry);
      var dn = navNode(p[0], REED_Y, p[1], b.key==='rl_dock'?'pierhead':'door', { island:I.id, building:b });
      navEdge(IN[i], dn, 'deck', { w:2 }); b.door = dn; REED.doorNodes.push(dn); }); });
  function edgePt(I, toward){ var a=Math.atan2(toward[1]-I.z, toward[0]-I.x), r=REED.islandR(I, a)-0.6; return [I.x+Math.cos(a)*r, I.z+Math.sin(a)*r]; }
  REED.bridges.forEach(function(p){ var A=REED.islands[p[0]], B=REED.islands[p[1]], ea=edgePt(A,[B.x,B.z]), eb=edgePt(B,[A.x,A.z]);
    var na=navNode(ea[0],REED_Y,ea[1],'bridgeend'), nb=navNode(eb[0],REED_Y,eb[1],'bridgeend');
    navEdge(IN[p[0]], na, 'deck', { w:2 }); navEdge(na, nb, 'pontoon', { w:1.8 }); navEdge(nb, IN[p[1]], 'deck', { w:2 }); });
  /* the pads on the open water: a node in each (its door), joined to its island by a short pontoon */
  REED.padNodes = REED.pads.map(function(P){ return navNode(P.x, REED_Y, P.z, 'pad', { pad:true }); });
  REED.padBridges.forEach(function(pb){ var P=REED.pads[pb[0]], I=REED.islands[pb[1]], ea=edgePt(P,[I.x,I.z]), eb=edgePt(I,[P.x,P.z]);
    var na=navNode(ea[0],REED_Y,ea[1],'bridgeend'), nb=navNode(eb[0],REED_Y,eb[1],'bridgeend');
    navEdge(REED.padNodes[pb[0]], na, 'deck', { w:2 }); navEdge(na, nb, 'pontoon', { w:1.8 }); navEdge(nb, IN[pb[1]], 'deck', { w:2 });
    P.door = REED.padNodes[pb[0]]; P.bridge = [ea, eb]; });
  /* the long pontoon: from the tavern island to the landing, a node every 12 m (a person stands on it) */
  var T = REED.islands[REED.islands.length-1], P = PONTOON, L = Math.hypot(P.b[0]-P.a[0], P.b[1]-P.a[1]), n=Math.max(2, Math.ceil(L/12)), prev=IN[T.id], first=null;
  for(var k=0;k<=n;k++){ var t=k/n, pn=navNode(mix(P.a[0],P.b[0],t), REED_Y-0.12, mix(P.a[1],P.b[1],t), 'pontoon'); if(!first) first=pn; navEdge(prev, pn, k===0?'deck':'pontoon', { w:P.w }); prev=pn; }
  navEdge(prev, ST2NAV[ST.landing.id], 'ground', { cls:'quay', w:3 });
  P.nodes = [first, prev];
  /* connectivity from the market, over everything */
  var seen={}, stack=[NAV.hub.id], cnt=0; seen[NAV.hub.id]=1;
  while(stack.length){ var c=stack.pop(); cnt++; NAV.adj[c].forEach(function(ei){ var e=NAV.edges[ei], o=e.a===c?e.b:e.a; if(!seen[o]){ seen[o]=1; stack.push(o); } }); }
  NAV.reachable=cnt; NAV.total=NAV.nodes.length;
  if(cnt !== NAV.nodes.length) ERR('layout: the walk graph reaches '+cnt+' of '+NAV.nodes.length+' nodes from the market');
  NAV.roadEnds = (ST.roadEnds||[]).map(function(n){ return { id:ST2NAV[n.id].id, x:n.x, z:n.z }; });
})();

/* path-viz: the static networks, by class */
[['highway','Streets: highways + the main street'],['street','Streets: streets'],['alley','Streets: alleys + lanes'],['track','Tracks: farms and logging'],['pontoon','The pontoon and the reed decks']].forEach(function(row, ri){
  PATHVIZ.push({ key:'st_'+row[0], label:row[1], color:PAL.pathviz[[4,2,6,1,0][ri]], paths:function(){
    return NAV.edges.filter(function(e){ var c=e.cls;
        return row[0]==='highway' ? (c==='highway'||c==='main'||c==='road'||c==='quay') : row[0]==='street' ? c==='street' : row[0]==='track' ? c==='track' : row[0]==='pontoon' ? (e.kind==='pontoon'||e.kind==='deck') : (c==='alley'||c==='lane'); })
      .map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b]; return [[a.x,a.y,a.z],[b.x,b.y,b.z]]; }); } });
});
/* districts for the fill: wealth is highest along the main street and at its head, lowest at the edges */
function districtAt(x,z){
  if(GEOCHAPTER && Math.hypot(x-GEOCHAPTER.x, z-GEOCHAPTER.z) < 95) return { key:'geo', name:"The Geomancers' quarter", wealth:0.72, chaos:0.1 };
  var dm = MAIN_STREET ? 1e9 : 0; if(MAIN_STREET) for(var i=0;i<MAIN_STREET.nodes.length-1;i++){ var A=MAIN_STREET.nodes[i], B=MAIN_STREET.nodes[i+1]; dm=Math.min(dm, segDist(x,z,A.x,A.z,B.x,B.z)); }
  var w = clamp(0.78 - 0.0042*dm + 0.12*smooth(120, 330, x) - 0.20*smooth(60, 10, lakeDist(x,z)) + 0.06*nsig(x,z,0.012), 0.04, 0.95);
  var key = w > 0.62 ? 'core' : (w > 0.38 ? 'prosper' : 'poor');
  return { key:key, name: key==='core'?'The main street':(key==='prosper'?'The middle lanes':'The shore lanes'), wealth:w, chaos:clamp(0.9-w,0,0.8) };
}
var VIEWPOINTS = [];
