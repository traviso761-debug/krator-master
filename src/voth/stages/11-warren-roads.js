/* ==== 5b. WARREN: BLOCK CARVING ==== */
reseed(42431);
(function carveWarrenBlocks(){
  var CELL = 8;
  function rasterize(){
    var minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
    for(var s=WALL_S0; s<=CITY_S1; s+=25){
      [shoreIn(s,-10), shoreIn(s,540)].forEach(function(p){
        minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]);
        minZ=Math.min(minZ,p[1]); maxZ=Math.max(maxZ,p[1]);
      });
    }
    var W=Math.max(1,Math.ceil((maxX-minX)/CELL))+2, H=Math.max(1,Math.ceil((maxZ-minZ)/CELL))+2;
    var grid = new Uint8Array(W*H);
    for(var i=0;i<W;i++) for(var j=0;j<H;j++){
      var x=minX+(i+0.5)*CELL, z=minZ+(j+0.5)*CELL;
      grid[j*W+i] = (zoneAt(x,z)==='warren') ? 0 : 2;
    }
    function markSeg(ax,az,bx,bz,halfW){
      var len=Math.hypot(bx-ax,bz-az), steps=Math.max(1,Math.ceil(len/(CELL*0.6)));
      for(var k=0;k<=steps;k++){
        var t=k/steps, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
        var rc=Math.ceil(halfW/CELL)+1, cx=Math.floor((x-minX)/CELL), cz=Math.floor((z-minZ)/CELL);
        for(var di=-rc;di<=rc;di++) for(var dj=-rc;dj<=rc;dj++){
          var i2=cx+di, j2=cz+dj;
          if(i2<0||j2<0||i2>=W||j2>=H) continue;
          if(Math.hypot(di*CELL,dj*CELL)<=halfW+CELL*0.7) grid[j2*W+i2]=1;
        }
      }
    }
    ROADS.forEach(function(rd){

      for(var i=0;i<rd.pts.length-1;i++) markSeg(rd.pts[i][0],rd.pts[i][1],rd.pts[i+1][0],rd.pts[i+1][1], rd.w*0.5+3);
    });
    return {grid:grid, W:W, H:H, minX:minX, minZ:minZ};
  }
  function findBlocks(R){
    var grid=R.grid, W=R.W, H=R.H, seen=new Uint8Array(W*H), blocks=[];
    for(var j=0;j<H;j++) for(var i=0;i<W;i++){
      var id=j*W+i;
      if(grid[id]!==0 || seen[id]) continue;
      var stack=[id], cells=[];
      seen[id]=1;
      while(stack.length){
        var cur=stack.pop(); cells.push(cur);
        var ci0=cur%W, cj0=(cur-ci0)/W;
        [[ci0+1,cj0],[ci0-1,cj0],[ci0,cj0+1],[ci0,cj0-1]].forEach(function(nb){
          var ni=nb[0], nj=nb[1];
          if(ni<0||nj<0||ni>=W||nj>=H) return;
          var nid=nj*W+ni;
          if(grid[nid]===0 && !seen[nid]){ seen[nid]=1; stack.push(nid); }
        });
      }
      blocks.push(cells);
    }
    return blocks;
  }
  function carveChord(cells, R){
    var W=R.W, minI=1e9,maxI=-1e9,minJ=1e9,maxJ=-1e9, cellSet={};
    cells.forEach(function(id){
      var i=id%W, j=(id-i)/W;
      cellSet[id]=1;
      if(i<minI)minI=i; if(i>maxI)maxI=i;
      if(j<minJ)minJ=j; if(j>maxJ)maxJ=j;
    });
    var wide = (maxI-minI) >= (maxJ-minJ), a=null, b=null, cutAt=null;
    if(wide){
      var midI = Math.round(mix(minI,maxI, 0.35+rnd()*0.3));
      var top=null,bot=null;
      for(var j=minJ;j<=maxJ;j++){ if(cellSet[j*W+midI]){ if(top===null) top=j; bot=j; } }
      if(top===null || bot-top<3) return null;
      a=[R.minX+(midI+0.5)*CELL, R.minZ+(top+0.5)*CELL];
      b=[R.minX+(midI+0.5)*CELL, R.minZ+(bot+0.5)*CELL];
      cutAt = midI;
    }else{
      var midJ = Math.round(mix(minJ,maxJ, 0.35+rnd()*0.3));
      var left=null,right=null;
      for(var i=minI;i<=maxI;i++){ if(cellSet[midJ*W+i]){ if(left===null) left=i; right=i; } }
      if(left===null || right-left<3) return null;
      a=[R.minX+(left+0.5)*CELL, R.minZ+(midJ+0.5)*CELL];
      b=[R.minX+(right+0.5)*CELL, R.minZ+(midJ+0.5)*CELL];
      cutAt = midJ;
    }

    var sideA=0, sideB=0;
    cells.forEach(function(id){
      var i=id%W, j=(id-i)/W, v = wide ? i : j;
      if(v<cutAt) sideA++; else if(v>cutAt) sideB++;
    });
    if(Math.min(sideA,sideB)*CELL*CELL < 900) return null;
    return {a:a, b:b};
  }
  for(var pass=0; pass<5; pass++){
    var R = rasterize();
    var blocks = findBlocks(R);
    var cuts = [];
    blocks.forEach(function(cells){
      var area = cells.length*CELL*CELL;
      if(area <= 4200) return;
      var chord = carveChord(cells, R);
      if(!chord) return;
      var len = Math.hypot(chord.b[0]-chord.a[0], chord.b[1]-chord.a[1]);
      if(len < 10) return;
      cuts.push(chord);
    });
    if(!cuts.length) break;
    cuts.forEach(function(c){ road([c.a, c.b], rr(4,8), 'minor'); });
  }

  var RF = rasterize(), finalBlocks = findBlocks(RF);
  var areas = finalBlocks.map(function(c){ return c.length*CELL*CELL; }).sort(function(a,b){return a-b;});
  window._warrenBlocks = {
    n: areas.length,
    median: areas.length ? areas[Math.floor(areas.length/2)] : 0,
    p90: areas.length ? areas[Math.floor(areas.length*0.9)] : 0,
    min: areas.length ? areas[0] : 0,
    under700: areas.filter(function(a){ return a<700; }).length
  };
})();

/* ==== 5c. ROAD GRAPH ==== */

var ROADS_X = [];
function roadx(pts, w, cls){ ROADS_X.push({ pts:pts, w:w, cls:cls, deck:true }); }
var RNODE = [], REDGE = [];
function buildRoadGraph(){
  RNODE.length = 0; REDGE.length = 0;
  var SNAP = 8, NGC = 16, NG = {};
  function nkey(i,j){ return i+','+j; }
  function nodeAt(x,z){
    var ci=Math.floor(x/NGC), cj=Math.floor(z/NGC);
    for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
      var arr = NG[nkey(ci+di,cj+dj)];
      if(!arr) continue;
      for(var k=0;k<arr.length;k++){
        var n = RNODE[arr[k]], dx=x-n.x, dz=z-n.z;
        if(dx*dx+dz*dz < SNAP*SNAP) return arr[k];
      }
    }
    var ni = RNODE.length;
    RNODE.push({x:x, z:z, deg:0});
    (NG[nkey(ci,cj)] || (NG[nkey(ci,cj)]=[])).push(ni);
    return ni;
  }
  var segs = [];

  ROADS.concat(ROADS_X).forEach(function(rd, rdIdx){
    for(var i=0;i<rd.pts.length-1;i++){
      var a = nodeAt(rd.pts[i][0], rd.pts[i][1]);
      var b = nodeAt(rd.pts[i+1][0], rd.pts[i+1][1]);
      if(a!==b) segs.push({a:a, b:b, w:rd.w, cls:rd.cls, road:rdIdx, deck:rd.deck});
    }
  });
  var SGC = 48, SG = {};
  function skey(i,j){ return i+'_'+j; }
  segs.forEach(function(s, idx){
    var A=RNODE[s.a], B=RNODE[s.b];
    var i0=Math.floor(Math.min(A.x,B.x)/SGC), i1=Math.floor(Math.max(A.x,B.x)/SGC);
    var j0=Math.floor(Math.min(A.z,B.z)/SGC), j1=Math.floor(Math.max(A.z,B.z)/SGC);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++)
      (SG[skey(i,j)] || (SG[skey(i,j)]=[])).push(idx);
  });
  function segXseg(A,B,C,D){
    var r1x=B.x-A.x, r1z=B.z-A.z, r2x=D.x-C.x, r2z=D.z-C.z;
    var denom = r1x*r2z - r1z*r2x;
    if(Math.abs(denom) < 1e-9) return null;
    var t = ((C.x-A.x)*r2z - (C.z-A.z)*r2x) / denom;
    var u = ((C.x-A.x)*r1z - (C.z-A.z)*r1x) / denom;
    if(t<=0.02||t>=0.98||u<=0.02||u>=0.98) return null;
    var dot = r1x*r2x+r1z*r2z, cross = r1x*r2z-r1z*r2x;
    var ang = Math.abs(Math.atan2(cross,dot)) * 180/Math.PI;
    if(ang>90) ang = 180-ang;
    return { t:t, u:u, x:A.x+r1x*t, z:A.z+r1z*t, angle:ang };
  }
  var cutsFor = segs.map(function(){ return []; });
  var pairSeen = {}, culled = {};
  window._crossings = { core:0, warren:0, coreSub35:0, warrenSub28:0, culledShallow:0, culledParallel:0 };
  for(var ck in SG){
    var arr = SG[ck];
    for(var a=0;a<arr.length;a++) for(var b=a+1;b<arr.length;b++){
      var i1=arr[a], i2=arr[b];
      var pk = i1<i2 ? skey(i1,i2) : skey(i2,i1);
      if(pairSeen[pk]) continue; pairSeen[pk]=1;
      var s1=segs[i1], s2=segs[i2];
      if(s1.a===s2.a||s1.a===s2.b||s1.b===s2.a||s1.b===s2.b) continue;
      if(s1.road === s2.road) continue;   /* a road doesn't cross itself */
      var A=RNODE[s1.a],B=RNODE[s1.b],C=RNODE[s2.a],D=RNODE[s2.b];
      var hit = segXseg(A,B,C,D);
      if(hit){
        var zn = zoneAt(hit.x, hit.z);
        var lim = zn==='warren' ? 28 : 35;
        if(hit.angle < lim){

          if(s1.deck && s2.deck){ /* two decks meeting: keep both */ }
          else if(s1.deck) culled[i2]=1;
          else if(s2.deck) culled[i1]=1;
          else if(s1.w<=s2.w) culled[i1]=1; else culled[i2]=1;
          window._crossings.culledShallow++;
          continue;
        }
        cutsFor[i1].push({t:hit.t, x:hit.x, z:hit.z, angle:hit.angle});
        cutsFor[i2].push({t:hit.u, x:hit.x, z:hit.z, angle:hit.angle});
        if(zn==='warren') window._crossings.warren++; else window._crossings.core++;
        continue;
      }

      if(s1.road === s2.road) continue;
      if(culled[i1]||culled[i2]) continue;
      var t1x=B.x-A.x,t1z=B.z-A.z,l1=Math.hypot(t1x,t1z)||1; t1x/=l1; t1z/=l1;
      var t2x=D.x-C.x,t2z=D.z-C.z,l2=Math.hypot(t2x,t2z)||1; t2x/=l2; t2z/=l2;
      if(Math.abs(t1x*t2x+t1z*t2z) < Math.cos(15*Math.PI/180)) continue;
      var perp1=Math.abs((C.x-A.x)*t1z-(C.z-A.z)*t1x), perp2=Math.abs((D.x-A.x)*t1z-(D.z-A.z)*t1x);
      var maxW = Math.max(s1.w,s2.w);
      if((perp1+perp2)/2 > maxW*1.5) continue;
      if(Math.min(l1,l2) < 15) continue;
      if(s1.deck || s2.deck) continue;   /* decks paint nothing — they can't read as a smear, so never cull one (see the shallow-crossing branch above) */
      if(s1.w<=s2.w) culled[i1]=1; else culled[i2]=1;
      window._crossings.culledParallel++;
    }
  }
  segs.forEach(function(s, idx){
    if(culled[idx]) return;
    var cuts = cutsFor[idx];
    if(!cuts.length){ REDGE.push({a:s.a, b:s.b, w:s.w, cls:s.cls, deck:s.deck}); return; }
    cuts.sort(function(p,q){ return p.t-q.t; });
    var prev = s.a;
    cuts.forEach(function(c){
      var mid = nodeAt(c.x, c.z);
      if(mid !== prev) REDGE.push({a:prev, b:mid, w:s.w, cls:s.cls, deck:s.deck});
      prev = mid;
    });
    if(prev !== s.b) REDGE.push({a:prev, b:s.b, w:s.w, cls:s.cls, deck:s.deck});
  });
  REDGE.forEach(function(e){ RNODE[e.a].deg++; RNODE[e.b].deg++; });
}
buildRoadGraph();

/* ==== 5d. WARREN: TANGLE ==== */
var WARREN_DEADENDS = 0;
(function addWarrenTangle(){
  var warrenNodes = [];
  RNODE.forEach(function(n, idx){
    if(zoneAt(n.x, n.z) === 'warren') warrenNodes.push(idx);
  });
  /* dead-end spurs: ~25% of warren nodes get a blind stub into a block */
  warrenNodes.forEach(function(ni){
    if(!chance(0.25)) return;
    var n = RNODE[ni];
    var a = rnd()*Math.PI*2, len = rr(15,45);
    var ex = n.x + Math.cos(a)*len, ez = n.z + Math.sin(a)*len;
    if(zoneAt(ex,ez) !== 'warren') return;
    road([[n.x,n.z],[ex,ez]], rr(4,7), 'minor');
    WARREN_DEADENDS++;
  });

  var ADJ = RNODE.map(function(){ return []; });
  REDGE.forEach(function(e){ ADJ[e.a].push(e.b); ADJ[e.b].push(e.a); });
  function hopsWithin(startI, limit, targetI){
    var seen = {}; seen[startI]=0;
    var q=[startI], head=0;
    while(head<q.length){
      var cur=q[head++], d=seen[cur];
      if(d>=limit) continue;
      var nbrs = ADJ[cur];
      for(var k=0;k<nbrs.length;k++){
        var nb = nbrs[k];
        if(seen[nb]!==undefined) continue;
        seen[nb]=d+1;
        if(nb===targetI) return d+1;
        q.push(nb);
      }
    }
    return seen[targetI]!==undefined ? seen[targetI] : Infinity;
  }
  var linksAdded = 0, tried = 0;
  outer:
  for(var i=0;i<warrenNodes.length;i+=3){
    if(linksAdded>=60 || tried>=4000) break;
    var ni = warrenNodes[i];
    for(var j=i+5;j<warrenNodes.length;j+=7){
      if(linksAdded>=60 || tried>=4000) break outer;
      tried++;
      var nj = warrenNodes[j];
      var A=RNODE[ni], B=RNODE[nj];
      var d = Math.hypot(A.x-B.x, A.z-B.z);
      if(d>60 || d<12) continue;
      if(hopsWithin(ni, 6, nj) <= 6) continue;   // already close along the graph
      road([[A.x,A.z],[B.x,B.z]], rr(4,6), 'minor');
      linksAdded++;
    }
  }

  var warrenRoads = ROADS.filter(function(rd){
    if(rd.cls!=='minor' || rd.pts.length<2) return false;
    var mid = rd.pts[Math.floor(rd.pts.length/2)];
    return zoneAt(mid[0],mid[1])==='warren';
  });
  warrenRoads.forEach(function(rd){
    if(!chance(0.15) || rd.pts.length<3) return;
    var mi = Math.floor(rd.pts.length/2);
    var pinchW = rr(3,5);
    rd.w = Math.max(rd.w, 6);   // the ends read normally; only the spliced middle narrows
    var before = rd.pts.slice(0, mi+1), after = rd.pts.slice(mi);
    ROADS.push({ pts: before, w: rd.w, cls: rd.cls });
    ROADS.push({ pts: after,  w: rd.w, cls: rd.cls });
    ROADS.push({ pts: [rd.pts[Math.max(0,mi-1)], rd.pts[mi], rd.pts[Math.min(rd.pts.length-1,mi+1)]],
                 w: pinchW, cls: rd.cls });
    rd.pts = [];   // neuter the original so it doesn't double-paint the middle
  });
  ROADS = ROADS.filter(function(rd){ return rd.pts.length>1; });
})();
window._warrenDeadEnds = WARREN_DEADENDS;

(function stitchDeadEnds(){
  var ADJ2 = RNODE.map(function(){ return []; });
  REDGE.forEach(function(e){ ADJ2[e.a].push(e.b); ADJ2[e.b].push(e.a); });
  function hopsWithin2(startI, limit, targetI){
    var seen = {}; seen[startI]=0;
    var q=[startI], head=0;
    while(head<q.length){
      var cur=q[head++], d=seen[cur];
      if(d>=limit) continue;
      var nbrs = ADJ2[cur];
      for(var k=0;k<nbrs.length;k++){
        var nb = nbrs[k];
        if(seen[nb]!==undefined) continue;
        seen[nb]=d+1;
        if(nb===targetI) return d+1;
        q.push(nb);
      }
    }
    return seen[targetI]!==undefined ? seen[targetI] : Infinity;
  }
  var deadEnds = [];
  RNODE.forEach(function(n,i){ if(n.deg===1) deadEnds.push(i); });
  var stitched = 0;
  deadEnds.forEach(function(ni){
    if(stitched>=400) return;
    var A = RNODE[ni];
    var bestJ = -1, bestD = Infinity;
    for(var j=0;j<RNODE.length;j++){
      if(j===ni) continue;
      var B = RNODE[j], d = Math.hypot(A.x-B.x, A.z-B.z);
      if(d>=3 && d<=30 && d<bestD){ bestD = d; bestJ = j; }
    }
    if(bestJ<0) return;
    if(hopsWithin2(ni, 6, bestJ) <= 6) return;   /* already close along the graph */
    var B = RNODE[bestJ];
    road([[A.x,A.z],[B.x,B.z]], rr(4,6), 'minor');
    stitched++;
  });
  window._deadEndStitch = stitched;
})();

road([[3204.08,2090.43],[3217.47,2188.63]], 6, 'minor');

road([[2880.1,-1025.0],[2845.0,-830.0],[2743.5,-820.6],[2654.8,-829.7]], 7, 'minor');

buildRoadGraph();

/* ==== 5e. NEAREST STREET ==== */
var NSGC = 40, NSGRID = {};

function buildNearestStreetIndex(){
  NSGRID = {};
  function nkey(i,j){ return i+'_'+j; }
  REDGE.forEach(function(e, idx){
    var A=RNODE[e.a], B=RNODE[e.b];
    var i0=Math.floor(Math.min(A.x,B.x)/NSGC)-1, i1=Math.floor(Math.max(A.x,B.x)/NSGC)+1;
    var j0=Math.floor(Math.min(A.z,B.z)/NSGC)-1, j1=Math.floor(Math.max(A.z,B.z)/NSGC)+1;
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++)
      (NSGRID[nkey(i,j)] || (NSGRID[nkey(i,j)]=[])).push(idx);
  });
}
buildNearestStreetIndex();
function nearestStreet(x,z,clsFilter){
  var ci=Math.floor(x/NSGC), cj=Math.floor(z/NSGC), best=null, bd=1e18;
  for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
    var arr = NSGRID[(ci+di)+'_'+(cj+dj)];
    if(!arr) continue;
    for(var k=0;k<arr.length;k++){
      var e = REDGE[arr[k]];
      if(clsFilter && !clsFilter[e.cls]) continue;

      if(e.deck && !clsFilter) continue;
      var A=RNODE[e.a], B=RNODE[e.b];
      var dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz;
      var t = L2 ? clamp(((x-A.x)*dx+(z-A.z)*dz)/L2, 0, 1) : 0;
      var px=A.x+dx*t, pz=A.z+dz*t, d=Math.hypot(x-px,z-pz);
      if(d<bd){ bd=d; best={dist:d, point:[px,pz], tangent:[dx,dz], cls:e.cls, width:e.w}; }
    }
  }
  if(best){
    var tl = Math.hypot(best.tangent[0],best.tangent[1]) || 1;
    best.tangent = [best.tangent[0]/tl, best.tangent[1]/tl];
  }
  return best;
}

/* ==== 5f. ROAD METRICS ==== */
window._roadGraph = {
  nodes: RNODE.length, edges: REDGE.length,
  crossings: window._crossings, warrenBlocks: window._warrenBlocks,
  warrenDeadEnds: window._warrenDeadEnds
};

/* --- the two river bridges: one at the mouth, one upstream ---------------- */
var RBRIDGES = [];
(function(){
  [RIVER_HEAD + 70, RIVER_HEAD + 330].forEach(function(up, k){
    var p = riverAt(up), half = riverHalf(p.x,p.z) + 34;
    RBRIDGES.push({ x:p.x, z:p.z, ax:p.x+p.nx*half, az:p.z+p.nz*half,
                    bx:p.x-p.nx*half, bz:p.z-p.nz*half, w:k?11:15 });
  });
})();

/* ==== 5g. GRAPH CONNECTIVITY ==== */

/* ==== (1) the deck network ==== */
(function buildDeckNetwork(){

  function nearestRoadPoint(x, z){
    var best = null, bd = 1e18;
    for(var ei=0; ei<REDGE.length; ei++){
      var e = REDGE[ei];
      if(e.deck) continue;
      var A2=RNODE[e.a], B2=RNODE[e.b];
      var dx=B2.x-A2.x, dz=B2.z-A2.z, L2=dx*dx+dz*dz;
      var t = L2 ? clamp(((x-A2.x)*dx+(z-A2.z)*dz)/L2, 0, 1) : 0;
      var px=A2.x+dx*t, pz=A2.z+dz*t, d=Math.hypot(x-px,z-pz);
      if(d<bd){ bd=d; best=[px,pz]; }
    }
    return best ? { point:best, dist:bd } : null;
  }
  function dryLine(ax,az,bx,bz){
    var d = Math.hypot(bx-ax,bz-az), steps = Math.max(2, Math.ceil(d/8));
    for(var s=0;s<=steps;s++){
      var t=s/steps, h=terrainH(ax+(bx-ax)*t, az+(bz-az)*t);
      if(h < 1.5 || h > 95) return false;
    }
    return true;
  }
  /* pts: the deck polyline so far; extends its LAST point onto the road */
  function landfall(pts, maxReach){
    var p = pts[pts.length-1];
    var ns = nearestRoadPoint(p[0], p[1]);
    if(!ns || ns.dist <= 1 || ns.dist > maxReach) return;
    if(!dryLine(p[0], p[1], ns.point[0], ns.point[1])) return;
    var ex = ns.point[0]-p[0], ez = ns.point[1]-p[1], eL = Math.hypot(ex,ez)||1;
    pts.push([ns.point[0] + ex/eL*14, ns.point[1] + ez/eL*14]);   /* past it, so it CROSSES */
  }
  CAUSEWAYS.forEach(function(cw){
    var c = cw.c, land = shoreIn(cw.s, 26);
    var dx = land[0]-c.x, dz = land[1]-c.z, L = Math.hypot(dx,dz);
    if(L < c.r + 40) return;
    var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
    var pts = [[ax,az], [land[0],land[1]]];
    landfall(pts, 240);
    roadx(pts, 9, 'causeway');
  });
  /* canton-to-canton spans */
  SPANS.forEach(function(s){
    var A = CANTONS[s.a], B = CANTONS[s.b];
    var dx = B.x-A.x, dz = B.z-A.z, L = Math.hypot(dx,dz)||1;
    roadx([[A.x + dx/L*A.r*0.96, A.z + dz/L*A.r*0.96],
           [B.x - dx/L*B.r*0.96, B.z - dz/L*B.r*0.96]], 8, 'bridge');
  });

  RBRIDGES.forEach(function(b){
    var fwd = [[b.ax,b.az],[b.bx,b.bz]];  landfall(fwd, 70);
    var rev = [[b.bx,b.bz],[b.ax,b.az]];  landfall(rev, 70);
    var pts = [];
    for(var i=rev.length-1;i>=1;i--) pts.push(rev[i]);   /* the far-bank extension, reversed back in */
    for(var j=1;j<fwd.length;j++) pts.push(fwd[j]);
    roadx(pts, b.w, 'bridge');
  });
})();
buildRoadGraph();

/* ==== (2) the component stitch pass ==== */
var ROAD_STITCHES = [];
(function stitchComponents(){
  var MAXGAP = 200, MAXSTITCH = 200;
  var parent = new Int32Array(RNODE.length);
  for(var i=0;i<parent.length;i++) parent[i]=i;
  function find(a){ while(parent[a]!==a){ parent[a]=parent[parent[a]]; a=parent[a]; } return a; }
  function uni(a,b){ a=find(a); b=find(b); if(a===b) return false; parent[b]=a; return true; }
  REDGE.forEach(function(e){ uni(e.a, e.b); });

  var GC = MAXGAP, G = {};
  RNODE.forEach(function(n,i){
    var k = Math.floor(n.x/GC)+'_'+Math.floor(n.z/GC);
    (G[k] || (G[k]=[])).push(i);
  });
  var cand = [], seen = {};
  RNODE.forEach(function(n,i){
    var ci=Math.floor(n.x/GC), cj=Math.floor(n.z/GC);
    for(var di=-1;di<=1;di++) for(var dj=-1;dj<=1;dj++){
      var arr = G[(ci+di)+'_'+(cj+dj)];
      if(!arr) continue;
      for(var k=0;k<arr.length;k++){
        var j = arr[k];
        if(j<=i) continue;
        if(find(i)===find(j)) continue;
        var d = Math.hypot(n.x-RNODE[j].x, n.z-RNODE[j].z);
        if(d < 4 || d > MAXGAP) continue;
        var pk = i+'_'+j; if(seen[pk]) continue; seen[pk]=1;
        cand.push({i:i, j:j, d:d});
      }
    }
  });
  cand.sort(function(a,b){ return a.d-b.d; });
  function walkable(ax,az,bx,bz){
    var d = Math.hypot(bx-ax, bz-az), steps = Math.max(3, Math.ceil(d/7));
    for(var s=0;s<=steps;s++){
      var t=s/steps, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
      var h = terrainH(x,z);
      if(h < 3 || h > 95) return false;          /* no swims, no hill climbs */
      if(inRiver(x,z,10)) return false;          /* the river is crossed by its bridges, not forded */
      for(var c=0;c<CANTONS.length;c++){
        var C=CANTONS[c], ddx=x-C.x, ddz=z-C.z, dd=Math.hypot(ddx,ddz)||1;
        var ang=Math.atan2(ddz,ddx);
        if(dd < C.r*1.07/Math.max(Math.abs(Math.cos(ang)),Math.abs(Math.sin(ang))) + 10) return false;
      }
    }
    return true;
  }
  for(var ci2=0; ci2<cand.length && ROAD_STITCHES.length<MAXSTITCH; ci2++){
    var p = cand[ci2];
    if(find(p.i)===find(p.j)) continue;          /* an earlier stitch already merged these */
    var A=RNODE[p.i], B=RNODE[p.j];
    if(!walkable(A.x,A.z,B.x,B.z)) continue;
    road([[A.x,A.z],[B.x,B.z]], 6, 'minor');
    uni(p.i, p.j);
    ROAD_STITCHES.push([Math.round(A.x),Math.round(A.z),Math.round(B.x),Math.round(B.z),Math.round(p.d)]);
  }
})();
buildRoadGraph();
buildNearestStreetIndex();

window._roadGraph.nodes = RNODE.length;
window._roadGraph.edges = REDGE.length;
window._roadGraph.crossings = window._crossings;   /* refreshed: 5f captured the count from the PREVIOUS build, two rebuilds ago */
window._roadGraph.decks = ROADS_X.length;
window._roadGraph.stitches = ROAD_STITCHES.length;
(function(){
  var parent = new Int32Array(RNODE.length);
  for(var i=0;i<parent.length;i++) parent[i]=i;
  function find(a){ while(parent[a]!==a){ parent[a]=parent[parent[a]]; a=parent[a]; } return a; }
  REDGE.forEach(function(e){ var x=find(e.a), y=find(e.b); if(x!==y) parent[y]=x; });
  var size = {};
  for(var k=0;k<parent.length;k++){ var r=find(k); size[r]=(size[r]||0)+1; }
  var arr = Object.keys(size).map(function(r){ return size[r]; }).sort(function(a,b){ return b-a; });
  window._roadGraph.components = arr.length;
  window._roadGraph.largestComponent = arr[0] || 0;
  window._roadGraph.componentSizes = arr.slice(0, 12);
})();

/* --- harbours ------------------------------------------------------------- */
var PIERS = [], SHIPS = [], RPIERS = [], BARGES = [];
(function(){
  reseed(5150);
  var n = 8;
  for(var i=0;i<n;i++){
    var s = mix(HARB_S0, HARB_S1, (i+0.5)/n);
    var root = shoreIn(s, -4), out = shoreIn(s, -rr(120, 215));
    PIERS.push({ s:s, x0:root[0], z0:root[1], x1:out[0], z1:out[1], w:rr(11,17) });
  }
  [1,3,5,6].forEach(function(k,j){
    var p = PIERS[k], t = 0.60 + j*0.05, side = (j%2) ? 1 : -1;
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz); dx/=L; dz/=L;
    SHIPS.push({ x: p.x0+dx*L*t + (-dz)*side*(p.w*0.5+16), z: p.z0+dz*L*t + (dx)*side*(p.w*0.5+16),
                 ry: Math.atan2(dx,dz), len: rr(50,68), beam: rr(12,16), masts: ri(2,3) });
  });
  /* river docklands on the north bank, just upstream of the mouth */
  for(var q=0;q<4;q++){
    var p = riverAt(RIVER_HEAD + 30 + q*58), hb = riverHalf(p.x,p.z);
    RPIERS.push({ x0:p.x+p.nx*(hb+6),  z0:p.z+p.nz*(hb+6),
                  x1:p.x+p.nx*(hb-rr(26,40)), z1:p.z+p.nz*(hb-rr(26,40)),
                  w:rr(7,10), bx:p.x+p.nx*(hb+34), bz:p.z+p.nz*(hb+34),
                  ry:Math.atan2(p.nx,p.nz) });
    if(q%2===0) BARGES.push({ x:p.x+p.nx*(hb-18), z:p.z+p.nz*(hb-18),
                              ry:Math.atan2(p.tx,p.tz), len:rr(26,34), beam:rr(7,9) });
  }
})();

/* --- farms: fields round a farmstead, on the floodplain ------------------- */
var FARMS = [];
(function(){
  reseed(9090);
  for(var gx=-HW+300; gx<HW-300; gx+=150){
    for(var gz=-CITY_LIM; gz<HW-300; gz+=150){
      var x=gx+rr(-55,55), z=gz+rr(-55,55);
      if(zoneAt(x,z)!=='farm') continue;
      if(districtAt(x,z)) continue;
      if(inRiver(x,z,90)) continue;
      if(terrainH(x,z) < 4 || terrainH(x,z) > 90) continue;
      if(!chance(0.62*farmFade(x,z)+0.08)) continue;
      var ry = rnd()*Math.PI;
      var fields=[];
      var nf = ri(2,4);
      for(var k=0;k<nf;k++){
        var a = k/nf*Math.PI*2 + rr(-0.5,0.5), d = rr(46,86);
        fields.push({ x:x+Math.cos(a)*d, z:z+Math.sin(a)*d, w:rr(50,96), h:rr(36,70), ry:ry+rr(-0.2,0.2),
                      tone:pick(FIELDC) });
      }
      FARMS.push({ x:x, z:z, ry:ry, fields:fields });
    }
  }
})();

var MANORS = [];
(function(){
  reseed(5550);
  var n = 4;
  for(var i=0;i<n;i++){
    var s = mix(S_5 - 140, S_7 + 160, (i+0.5)/n) + rr(-50,50);
    var p = shoreIn(s, rr(150, 230));
    MANORS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.2,0.2) });
  }
})();

var SWCOMPOUNDS = [];
(function(){
  reseed(5551);
  var n = 5;
  for(var i=0;i<n;i++){
    var s = mix(10000, 11300, (i+0.5)/n) + rr(-90,90);
    var p = shoreIn(s, rr(300, 430));
    SWCOMPOUNDS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.25,0.25) });
  }
})();

var SECOMPOUNDS = [];
(function(){
  reseed(5552);
  var n = 3;
  for(var i=0;i<n;i++){
    var s = mix(S_5+80, WALL_S0-260, (i+0.5)/n) + rr(-100,100);
    var p = shoreIn(s, rr(220, 420));
    SECOMPOUNDS.push({ x:p[0], z:p[1], s:s, ry:shoreRY(s)+rr(-0.25,0.25) });
  }
})();

/* --- islets: clear of the monumental pair; a chain off the west promontory - */
(function(){
  ISLES.length = 0;

  [[60,1800,16,78,'shrine'],[560,1350,13,60,'rock'],
   [470,-1010,20,84,'light'],[-1190,-1180,12,58,'shrine'],[760,-1620,11,52,'rock'],
   [-260,-2100,17,76,'light'],[1500,-2500,13,64,'rock']].forEach(function(i){ ISLES.push(i); });

  CAUSEWAYS.forEach(function(cw){
    if(cw.solid) return;
    var c = cw.c, lp = shoreIn(cw.s, 26);
    var L = Math.hypot(lp[0]-c.x, lp[1]-c.z) - c.r;
    if(L < 200) return;
    var t = (c.r + L*0.56) / (L + c.r);
    var ix = mix(c.x, lp[0], t), iz = mix(c.z, lp[1], t);
    var isle = [ix, iz, 7, 40, 'step'];
    ISLES.push(isle); cw.isle = isle;
  });
})();

/* ==== reserved footprints, registered before infill ==== */
var OBST = [];
function reserve(x,z,fx,fz,ry){ OBST.push({x:x,z:z,fx:fx,fz:fz,ry:ry||0,fixed:true}); }
var CHIN = [];
