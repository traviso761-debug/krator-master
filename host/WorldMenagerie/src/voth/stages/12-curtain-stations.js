/* ==== NEW CURTAIN WALL (point-designated) ==== */

var WALLPTS = [[1449.6,-1025.6],[1495.6,-920.8],[1487.0,-785.4],[1473.9,-643.6],
  [1456.6,-486.6],[1489.5,-348.2],[1516.0,-202.3],[1539.7,-34.7],[1467.2,195.2],
  [1471.2,365.8],[1466.3,505.2],[1465.0,616.8],[1480.6,753.6],[1374.3,873.7],
  [1295.4,916.3],[1193.4,969.2],[1149.0,1052.7]];

var NAMED_GATE_QUADS = [
  { name:'HarborGate', quad:[[1371.3,-1055.9],[1376.0,-900.2],[1517.6,-901.9],[1499.8,-1055.2]] },
  { name:'SpiritGate',  quad:[[1432.2,542.4],[1433.6,602.4],[1487.1,604.2],[1485.1,544.5]] },
  { name:'RiverGate',   quad:[[1073.9,1029.8],[1119.5,925.9],[1208.5,964.5],[1139.5,1084.8]] }
];

var WALL_MAJOR_CLS = { quay:1, boulevard:1, ring:1, highway:1 };

function wallQuadBounds(q, pad){
  var x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  q.forEach(function(p){ if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0]; if(p[1]<z0)z0=p[1]; if(p[1]>z1)z1=p[1]; });
  return { x0:x0-pad, x1:x1+pad, z0:z0-pad, z1:z1+pad };
}
function wallInBounds(x,z,b){ return x>=b.x0 && x<=b.x1 && z>=b.z0 && z<=b.z1; }
/* segment/segment intersection: AB (a wall segment) x CD (a road edge) */
function wallSegXseg(ax,az,bx,bz,cx,cz,dx,dz){
  var r0x=bx-ax, r0z=bz-az, r1x=dx-cx, r1z=dz-cz;
  var denom = r0x*r1z - r0z*r1x;
  if(Math.abs(denom) < 1e-9) return null;
  var t = ((cx-ax)*r1z - (cz-az)*r1x)/denom;
  var u = ((cx-ax)*r0z - (cz-az)*r0x)/denom;
  if(t<0||t>1||u<0||u>1) return null;
  return { x:ax+r0x*t, z:az+r0z*t, t:t, tx:r1x, tz:r1z };
}

var WALL_CROSSINGS = [];
(function(){
  for(var si=0; si<WALLPTS.length-1; si++){
    var ax=WALLPTS[si][0], az=WALLPTS[si][1], bx=WALLPTS[si+1][0], bz=WALLPTS[si+1][1];
    for(var ei=0; ei<REDGE.length; ei++){
      var e = REDGE[ei];
      if(!WALL_MAJOR_CLS[e.cls]) continue;
      var A=RNODE[e.a], B=RNODE[e.b];
      var hit = wallSegXseg(ax,az,bx,bz, A.x,A.z,B.x,B.z);
      if(!hit) continue;
      var tl = Math.hypot(hit.tx,hit.tz) || 1;
      WALL_CROSSINGS.push({ segIdx:si, segT:hit.t, x:hit.x, z:hit.z,
                             tx:hit.tx/tl, tz:hit.tz/tl, cls:e.cls });
    }
  }
})();

var NAMED_GATES = [];
NAMED_GATE_QUADS.forEach(function(ng){
  var b = wallQuadBounds(ng.quad, 6);
  var cx = (ng.quad[0][0]+ng.quad[1][0]+ng.quad[2][0]+ng.quad[3][0])/4;
  var cz = (ng.quad[0][1]+ng.quad[1][1]+ng.quad[2][1]+ng.quad[3][1])/4;
  var best=null, bd=1e18;
  WALL_CROSSINGS.forEach(function(c){
    if(!wallInBounds(c.x,c.z,b)) return;
    var d = Math.hypot(c.x-cx, c.z-cz);
    if(d<bd){ bd=d; best=c; }
  });
  if(best) NAMED_GATES.push({ name:ng.name, x:best.x, z:best.z, tx:best.tx, tz:best.tz, segIdx:best.segIdx, segT:best.segT });
});

var GENERIC_GATES = [];
(function(){
  var ordered = WALL_CROSSINGS.slice().sort(function(a,b){ return (a.segIdx+a.segT) - (b.segIdx+b.segT); });
  var clusters = [];
  ordered.forEach(function(c){
    var nearNamed = NAMED_GATES.some(function(g){ return Math.hypot(g.x-c.x, g.z-c.z) < 70; });
    if(nearNamed) return;
    var nearCluster = clusters.some(function(cl){ return Math.hypot(cl.x-c.x, cl.z-c.z) < 40; });
    if(nearCluster) return;
    clusters.push(c);
  });
  clusters.forEach(function(c){
    GENERIC_GATES.push({ x:c.x, z:c.z, tx:c.tx, tz:c.tz, segIdx:c.segIdx, segT:c.segT });
  });
})();

var WNODES = [];
WALLPTS.forEach(function(p, i){ WNODES.push({ kind:'tower', x:p[0], z:p[1], key:i }); });
NAMED_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', name:g.name, named:true, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
GENERIC_GATES.forEach(function(g){
  WNODES.push({ kind:'gate', named:false, x:g.x, z:g.z, tx:g.tx, tz:g.tz, key:g.segIdx+g.segT });
});
WNODES.sort(function(a,b){ return a.key-b.key; });

reseed(300500);
function wallPickHealth(){
  var r = rnd();
  if(r < 0.45) return 2;        /* intact  ~45% */
  if(r < 0.80) return 1;        /* ruined  ~35% */
  return 0;                     /* destroyed ~20% */
}
WNODES.forEach(function(n, i){
  var prev = WNODES[Math.max(0,i-1)], next = WNODES[Math.min(WNODES.length-1,i+1)];
  n.ry = Math.atan2(next.x-prev.x, next.z-prev.z);
  n.health = n.named ? 2 : wallPickHealth();
});

var WALL = WALLPTS;
var GATES = [];

var WSEGS = [];

WNODES.forEach(function(n){
  if(n.kind==='tower') OBST.push({x:n.x,z:n.z,fx:10,fz:10,ry:n.ry,fixed:true,wallNode:n});
  else if(n.health > 0) OBST.push({x:n.x,z:n.z,fx:12,fz:20,ry:n.ry,fixed:true,wallNode:n});
});
for(var wm=0; wm<WNODES.length-1; wm++){
  var Am=WNODES[wm], Bm=WNODES[wm+1];
  if(Math.floor((Am.health+Bm.health)/2) <= 0) continue;
  var dxm=Bm.x-Am.x, dzm=Bm.z-Am.z, Lm=Math.hypot(dxm,dzm);
  if(Lm < 1) continue;
  reserve((Am.x+Bm.x)/2, (Am.z+Bm.z)/2, 6, Lm/2, Math.atan2(dxm,dzm));
}

/* ==== silt strider stations (Route 1) ==== */
[
  { x:-1806.4, z:2278.8, tx:-0.8320502943378437, tz:-0.5547001962252291 },
  { x:107.0,   z:2065.2, tx:0.217518812610881,   tz:0.9760561285911545 },
  { x:791.3,   z:1489.4, tx:0.9019646069836713,  tz:-0.4318099671716614 },
  { x:1181.1,  z:1453.2, tx:0.8893017314745645,  tz:-0.4573209271357934 },
  { x:1938.9,  z:1701.5, tx:0.8642872019638728,  tz:0.5029986406755586 },
  { x:2949.4,  z:1710.7, tx:0.980823374416306,   tz:0.19489871266535125 }
].forEach(function(p,pi){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
  if(pi===5){

    var sp = loc(p.x, p.z, 4, 34, ry);
    reserve(sp[0], sp[1], 7, 4, ry+Math.PI/2);
  }
});

/* ==== silt strider stations (Route 2) ==== */
[
  { x:2275.3,  z:-1364.7, tx:1,                    tz:0 },
  { x:1413.8,  z:-957.1,  tx:-0.20317289800387703, tz:0.9791428769677621 },
  { x:759.2,   z:-411.3,  tx:0.19082757228688982,  tz:-0.9816235722796656 },
  { x:-790.5,  z:-307.4,  tx:0.6686019937136221,   tz:0.7436204502312789 },
  { x:-1751.4, z:-1036.0, tx:-0.7682761317017722,  tz:-0.6401185714048304 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

/* ==== silt strider stations (Route 3) ==== */
[
  { x:878.7,  z:182.0,  tx:0.9559034445674892, tz:-0.2936811275244105 },
  { x:1212.6, z:995.4,  tx:0.537715394629288,  tz:-0.8431264166058784 },
  { x:212.2,  z:2500.0, tx:-0.07124704998790961, tz:0.997458699830735 }
].forEach(function(p){
  var ry = Math.atan2(p.tx, p.tz);
  reserve(p.x, p.z, 18, 9, ry);
});

window._layout = { cantons:CANTONS.length, spans:SPANS.length, roads:ROADS.length,
                   wall:WALL.length, farms:FARMS.length, rpiers:RPIERS.length };
