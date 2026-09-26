/* ==== 5. CITY LAYOUT ==== */
reseed(300001);

var BAYC = { x:-150, z:600 };
function bayS(th){                            /* shore position at a bearing out of the bay */
  var r = 60;
  while(r < 3400 && landDist(BAYC.x+Math.cos(th)*r, BAYC.z+Math.sin(th)*r) < 0) r += 12;
  return shoreS(BAYC.x+Math.cos(th)*r, BAYC.z+Math.sin(th)*r);
}
/* the bay's rim, swept from the west narrows round the south to the east */
function rimS(u){ return bayS(-2.36 - u*4.71); }

var RIVER_S = 0;                              /* set once riverAt() exists, below */
var CITY_S0 = bayS(1.16);                     /* estates begin on the south-east lobe */
var WALL_S0 = 0;                              /* ditto */
var CITY_S1 = shoreS(1620, -1380);            /* up the north-east coast */
var PORT_S  = shoreS(1150, -1050);
var HARB_S0 = PORT_S - 780, HARB_S1 = PORT_S - 250;   /* mainland harbour, south of the port canton */
var HARB_S  = (HARB_S0+HARB_S1)/2;

function riverAt(u){
  var i=0; while(i<RIVER.length-2 && RIVER_CUM[i+1] < u) i++;
  var t=(u-RIVER_CUM[i])/(RIVER_CUM[i+1]-RIVER_CUM[i]);
  var dx=RIVER[i+1][0]-RIVER[i][0], dz=RIVER[i+1][1]-RIVER[i][1], L=Math.hypot(dx,dz);
  var nx=-dz/L, nz=dx/L;
  if(nz > 0){ nx=-nx; nz=-nz; }                  /* keep the normal on the city bank */
  return { x:mix(RIVER[i][0],RIVER[i+1][0],t), z:mix(RIVER[i][1],RIVER[i+1][1],t),
           tx:dx/L, tz:dz/L, nx:nx, nz:nz };
}

var RIVER_HEAD = (function(){
  for(var u=0; u<1600; u+=15){
    var p = riverAt(u), half = 40 + 44*(u/RIVER_CUM[RIVER_CUM.length-1]) + 46;
    if(terrainH(p.x+p.nx*half, p.z+p.nz*half) > 2.5 &&
       terrainH(p.x-p.nx*half, p.z-p.nz*half) > 2.5) return u;
  }
  return 500;
})();

/* the river corridor: nothing coastal may cross it except a bridge */
function riverHalf(x,z){ var rv = polyNear(x,z,RIVER,RIVER_CUM); return 40 + 44*rv.t + 4; }
function inRiver(x,z,margin){ var rv = polyNear(x,z,RIVERC,RIVERC_CUM); return rv.d < 44 + 44*rv.t + (margin||0); }
(function(){
  var m = riverAt(0);                          /* the river's line at the old mouth */
  RIVER_S = shoreS(m.x + m.nx*210, m.z + m.nz*210);   /* the city bank of the estuary */
  WALL_S0 = RIVER_S + 120;
})();
/* clock positions round the bay, as arc lengths (12 = north, 3 = east) */
var S_5 = bayS(1.05), S_7 = bayS(2.09), S_10 = bayS(-2.62);

var CANTONS = [
  /* the two monumental cantons, out in the deep middle of the bay */

  { n:'Palace', x:-330, z: 700, r:205, kind:'mono', tiers:5, top:132, dome:38,
    tone:0x8c8579, accent:0x5c5850 },
  { n:'Temple', x: 210, z: 170, r:188, kind:'mono', tiers:6, top:156, dome:34,
    tone:0x928b7d, accent:0x615c50 },

  /* the rim: lesser cantons set just off the bay's edge */
  { n:'Arsenal',  s:rimS(0.055), off:-250, r:126, kind:'plat', tiers:3, top:40, tone:0x847e71 },

  { n:'Guild',    s:rimS(0.880), off:-244, r:120, kind:'plat', tiers:3, top:38, tone:0x8a8375 },
  { n:'Foreign',  s:rimS(0.335), off:-440, r:128, kind:'plat', tiers:3, top:36, tone:0x8f8879 },
  { n:'Granary',  s:rimS(0.470), off:-420, r:122, kind:'plat', tiers:2, top:32, tone:0x7d7768 },
  { n:'Market',   s:rimS(0.605), off:-262, r:134, kind:'plat', tiers:3, top:40, tone:0x8c8578 },
  { n:'Arena',    s:rimS(0.695), off:-250, r:130, kind:'plat', tiers:2, top:30, tone:0x877f71, arena:true },

  { n:'Ancestry', s:rimS(0.195), off:-244, r:118, kind:'plat', turns:12, top:150,
    tone:0x827c6e, accent:0x5c5850 },
  { n:'Port',     s:PORT_S,      off:-272, r:138, kind:'plat', tiers:3, top:34, tone:0x857e70, port:true },

  { n:'Fortress', x:-240, z:-780, r:150, kind:'plat', tiers:3, top:44,
    tone:0x322f2b, accent:0x8c8f8a, fortress:true }
];
/* resolve the rim cantons off the shoreline */
CANTONS.forEach(function(c){
  if(c.s !== undefined){ var p = shoreIn(c.s, c.off); c.x = p[0]; c.z = p[1]; }
});

(function(){
  for(var iter=0; iter<90; iter++){
    var moved = 0;
    for(var i=0;i<CANTONS.length;i++) for(var j=i+1;j<CANTONS.length;j++){
      var A=CANTONS[i], B=CANTONS[j];
      var dx=B.x-A.x, dz=B.z-A.z, d=Math.hypot(dx,dz)||1;
      var want = A.r + B.r + 120;
      if(d >= want) continue;
      var aFix = (A.s===undefined), bFix = (B.s===undefined);
      if(aFix && bFix) continue;
      var push = (want-d)*0.5, ux=dx/d, uz=dz/d;
      if(!aFix){ A.x -= ux*push*(bFix?2:1); A.z -= uz*push*(bFix?2:1); }
      if(!bFix){ B.x += ux*push*(aFix?2:1); B.z += uz*push*(aFix?2:1); }
      moved++;
    }
    CANTONS.forEach(function(c){
      if(c.s === undefined) return;
      /* keep clear of the river's line into the bay */
      var rvn = polyNear(c.x, c.z, RIVERC, RIVERC_CUM);
      if(rvn.d < c.r + 100){
        var nearest = null, bd=1e9;
        for(var q=0;q<RIVERC.length-1;q++){ var a=RIVERC[q], b=RIVERC[q+1];
          var vx=b[0]-a[0], vz=b[1]-a[1], LL=vx*vx+vz*vz, t=clamp(((c.x-a[0])*vx+(c.z-a[1])*vz)/LL,0,1);
          var px=a[0]+vx*t, pz=a[1]+vz*t, d=Math.hypot(c.x-px,c.z-pz); if(d<bd){bd=d;nearest=[px,pz];} }
        var ux=(c.x-nearest[0])/(bd||1), uz=(c.z-nearest[1])/(bd||1), push=(c.r+100-bd);
        c.x += ux*push; c.z += uz*push; moved++;
      }
      var L = landDist(c.x, c.z);
      var target = clamp(L, -520, -(c.r*1.45 + 42));   /* the corner, not the edge */
      if(Math.abs(target - L) > 1){
        var g = sdGrad(c.x, c.z);
        c.x += g[0]*(target-L); c.z += g[1]*(target-L);
        moved++;
      }
    });
    if(!moved) break;
  }
  /* re-derive each rim canton's place on the coast after it has moved */
  CANTONS.forEach(function(c){ if(c.s !== undefined) c.s = shoreS(c.x, c.z); });
  /* and shove the islets clear of anything they ended up under */
  ISLES.forEach(function(I){
    for(var k=0;k<40;k++){
      var worst = null, wd = 0;
      CANTONS.forEach(function(c){
        var dx=I[0]-c.x, dz=I[1]-c.z, d=Math.hypot(dx,dz), need=c.r+I[3]+70;
        if(d < need && (need-d) > wd){ wd = need-d; worst = [dx/(d||1), dz/(d||1)]; }
      });
      if(!worst) break;
      I[0] += worst[0]*wd; I[1] += worst[1]*wd;
    }
  });
})();

var CIDX = {}; CANTONS.forEach(function(c,i){ CIDX[c.n]=c; c.i=i; });

/* ==== 4b. DISTRICTS ==== */
var DISTRICTS = [
  { type:'market', name:'Market A',  poly:[[1160,-600],[1380,-600],[1380,-420],[1160,-420]] },
  { type:'market', name:'Market C',  poly:[[1068,-975],[1288,-975],[1288,-795],[1068,-795]] },
  { type:'market', name:'Market D',  poly:[[28.3,1919.8],[267.3,1863.8],[315.8,1977.9],[48.3,2042.2]] },

  { type:'park',   name:'Abbey Close',
    poly:[[-785.4,-294.7],[-1011.7,-199.0],[-1221.8,-52.1],[-1606.8,-385.4],
          [-1309.8,-732.1],[-996.0,-495.3],[-823.3,-392.1],[-783.7,-359.7]] },
  { type:'park',   name:'Park B',    poly:[[1140,-270],[1320,-270],[1320,-130],[1140,-130]] },
  { type:'park',   name:'Park D',    poly:[[-214.4,1936.7],[18.2,1921.5],[36.9,2044],[-210.8,2060.6]] },
  { type:'market', name:'Market E',  poly:[[1219,556],[1373,556],[1373,710],[1219,710]] },

  { type:'funerary', name:'Funerary',
    poly:[[1780.7,540.1],[1801.1,377.3],[1912.3,290.4],[2081.1,424.2],
          [2055.7,635.9],[1949.2,738.3],[1870.0,737.9],[1765.7,694.1],[1766.5,587.1]] },

  { type:'market', name:'Market F',  poly:(function(){
      var tipS = shoreS(-1370,681), ARC = 140;
      return [ shoreIn(tipS-ARC, 15), shoreIn(tipS+ARC, 15),
               shoreIn(tipS+ARC, 122), shoreIn(tipS-ARC, 122) ];
    })() },

  { type:'warehouse', name:'Warehouse District', poly:(function(){
      var u0 = RIVER_HEAD - 20, u1 = RIVER_HEAD + 320;
      var pA = riverAt(u0), pB = riverAt(u1);
      var hA = riverHalf(pA.x,pA.z), hB = riverHalf(pB.x,pB.z);
      return [
        [pA.x - pA.nx*hA,       pA.z - pA.nz*hA],
        [pB.x - pB.nx*hB,       pB.z - pB.nz*hB],
        [pB.x - pB.nx*(hB+220), pB.z - pB.nz*(hB+220)],
        [pA.x - pA.nx*(hA+220), pA.z - pA.nz*(hA+220)]
      ];
    })() }
];
function districtAt(x,z){
  for(var i=0;i<DISTRICTS.length;i++){
    var poly = DISTRICTS[i].poly, inside = false;
    for(var a=0,b=poly.length-1; a<poly.length; b=a++){
      var xa=poly[a][0], za=poly[a][1], xb=poly[b][0], zb=poly[b][1];
      if(((za>z) !== (zb>z)) && (x < (xb-xa)*(z-za)/(zb-za)+xa)) inside = !inside;
    }
    if(inside) return DISTRICTS[i].type;
  }
  return null;
}
function districtNameAt(x,z){
  for(var i=0;i<DISTRICTS.length;i++){
    var poly = DISTRICTS[i].poly, inside = false;
    for(var a=0,b=poly.length-1; a<poly.length; b=a++){
      var xa=poly[a][0], za=poly[a][1], xb=poly[b][0], zb=poly[b][1];
      if(((za>z) !== (zb>z)) && (x < (xb-xa)*(z-za)/(zb-za)+xa)) inside = !inside;
    }
    if(inside) return DISTRICTS[i].name;
  }
  return null;
}

CIDX['Guild'].guild = true;

var CPIERS = [];
(function(){
  reseed(685102);

  var SE = Math.PI/4;
  ['Palace','Temple','Ancestry','Arena'].forEach(function(name){
    var c = CIDX[name];
    if(!c) return;
    var a = (name === 'Arena') ? rr(0, Math.PI*2) : SE;

    var capHw = c.r*1.07;
    var clearR = capHw / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))) - 3;
    var rootX = c.x+Math.cos(a)*clearR, rootZ = c.z+Math.sin(a)*clearR;
    var outX = c.x+Math.cos(a)*(clearR+rr(40,64)), outZ = c.z+Math.sin(a)*(clearR+rr(40,64));
    CPIERS.push({ x0:rootX, z0:rootZ, x1:outX, z1:outZ, w:rr(6,9), cls:'quay', canton:name, ry:Math.PI/2-a });
  });
})();
window._cpiers = CPIERS;

var ATTRACTORS = [];
DISTRICTS.forEach(function(d){
  var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
  cx/=d.poly.length; cz/=d.poly.length;
  ATTRACTORS.push({ id:d.name, type:d.type, x:cx, z:cz, nx:0, nz:0,
                     weight: d.type==='funerary' ? 0.2 : 0.8, hours:null });
});

['Guild','Ancestry'].forEach(function(n){
  var c = CIDX[n];
  ATTRACTORS.push({ id:n, type: n==='Guild' ? 'market' : 'funerary', x:c.x, z:c.z, nx:0, nz:0, weight:0.8, hours:null });
});

/* --- bridges: a greedy non-crossing graph, so spans never tangle ---------- */
var SPANS = (function(){
  var pairs = [];
  for(var i=0;i<CANTONS.length;i++) for(var j=i+1;j<CANTONS.length;j++){
    var A=CANTONS[i], B=CANTONS[j];
    var d = Math.hypot(B.x-A.x, B.z-A.z) - A.r - B.r;   /* gap between edges */
    if(d < 560) pairs.push({ a:i, b:j, d:d });
  }
  pairs.sort(function(p,q){ return p.d - q.d; });
  var kept = [];
  pairs.forEach(function(p){
    var A=CANTONS[p.a], B=CANTONS[p.b];
    /* reject if the span would cross one already accepted */
    for(var k=0;k<kept.length;k++){
      var C=CANTONS[kept[k].a], D=CANTONS[kept[k].b];
      if(C===A||C===B||D===A||D===B) continue;
      if(segCross(A.x,A.z,B.x,B.z, C.x,C.z,D.x,D.z)) return;
    }
    /* reject if the span would pass through a third canton */
    for(var m=0;m<CANTONS.length;m++){
      var E=CANTONS[m]; if(E===A||E===B) continue;
      if(segDist(E.x,E.z, A.x,A.z, B.x,B.z) < E.r + 26) return;
    }
    kept.push(p);
  });
  return kept;
})();

var RECLAIMED_CAUSEWAY = { Arsenal:1, Guild:1, Foreign:1, Granary:1, Market:1, Arena:1 };
var CAUSEWAYS = CANTONS.filter(function(c){ return c.s !== undefined; }).map(function(c){
  var s = c.s, lp = shoreIn(s, 26);
  if(polyDist(lp[0],lp[1],RIVER) < 170) s += (s > RIVER_S ? 1 : -1) * 260;
  return { c:c, s:s, solid: !!RECLAIMED_CAUSEWAY[c.n] };
});

CAUSEWAYS.push({ c: CIDX['Fortress'], s: S_10, solid: true });

/* ==== 6. THE MAINLAND SHORE ==== */

/* the curtain wall encloses only the core, north of the river */
function wallOffset(s){
  var u = (s - WALL_S0) / (CITY_S1 - WALL_S0);
  return 470 + 78*Math.sin(u*9.1 + 0.6) + 44*Math.sin(u*17.3 - 1.2);
}
function wallDepth(x,z){                     /* >0 between waterfront and wall */
  var s = shoreS(x,z);
  if(s < WALL_S0 || s > CITY_S1) return -999;
  return wallOffset(s) - landDist(x,z);
}
function insideWall(x,z){ return wallDepth(x,z) > 0; }

function zoneAt(x,z){
  var L = landDist(x,z);
  if(L < 20) return 'none';
  var s = shoreS(x,z);
  if(s >= WALL_S0 && s <= CITY_S1){
    var wd = wallOffset(s) - L;
    if(wd > 0) return 'core';
    if(wd > -520) return 'warren';
  }

  if(x > 1400 && x < 2300 && z > 400 && z < 1400) return 'warren';
  /* past five o'clock: great semi-rural estates, then farmland to the south-west */
  if(s >= S_7 && s < S_5){
    if(L < 400) return 'manor';
    if(L < 900) return 'farm';
  }
  if(s >= S_5 && s < WALL_S0){
    if(L < 330) return 'estate';
    if(L < 1050) return 'farm';
  }

  if(s >= S_10 && s < S_7){
    if(L < 150) return 'shorehut';
    if(L < 520) return 'orchard';
  }
  /* the river valley, east of the mouth */
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  if(rv.d < 760 && rv.t < 0.62 && x > 900) return 'farm';
  return 'none';
}
/* how hard the farmland thins with distance from the city */
function farmFade(x,z){
  var rv = polyNear(x,z,RIVER,RIVER_CUM);
  var byRiver = (1 - smooth(0.18, 0.62, rv.t));
  var s = shoreS(x,z);
  var bySW = (s < S_5 && s > S_7) ? (1 - smooth(0.30, 1.0, (S_5 - s)/(S_5 - S_7))) : 0;
  return Math.max(byRiver, bySW) * (1 - smooth(600, 1050, landDist(x,z))*0.5);
}

/* --- roads: every polyline is clipped against the river corridor ----------- */
var ROADS = [];
function road(pts, w, cls){
  var run = [];
  for(var i=0;i<pts.length;i++){
    var p = pts[i];
    if(inRiver(p[0],p[1], 30)){ if(run.length > 1) ROADS.push({pts:run, w:w, cls:cls||'minor'}); run = []; }
    else run.push(p);
  }
  if(run.length > 1) ROADS.push({ pts:run, w:w, cls:cls||'minor' });
}
function shoreRoad(s0, s1, off, w, cls, wob, step){
  var p=[];
  for(var s=s0; s<=s1; s+=(step||30)) p.push(shoreIn(s, off + (wob||0)*Math.sin(s*0.0042)));
  road(p, w, cls);
}

function resamplePath(pts, step){
  var out=[pts[0]], acc=0;
  for(var i=1;i<pts.length;i++){
    var ax=pts[i-1][0], az=pts[i-1][1], bx=pts[i][0], bz=pts[i][1];
    var segLen=Math.hypot(bx-ax,bz-az), pos=0;
    while(segLen-pos > step-acc){
      pos += step-acc;
      var t=pos/segLen;
      out.push([ax+(bx-ax)*t, az+(bz-az)*t]);
      acc=0;
    }
    acc += segLen-pos;
  }
  out.push(pts[pts.length-1]);
  return out;
}
function wanderPath(pts, amp, seed){
  var rs = resamplePath(pts, 20);
  var out = [];
  for(var i=0;i<rs.length;i++){
    var pa=rs[Math.max(0,i-1)], pb=rs[Math.min(rs.length-1,i+1)];
    var tx=pb[0]-pa[0], tz=pb[1]-pa[1], tl=Math.hypot(tx,tz)||1;
    var nx=-tz/tl, nz=tx/tl;
    var t = i*20;
    var off = amp * sig(t*0.033 + seed, seed*2.1 - t*0.011, 1);
    out.push([rs[i][0]+nx*off, rs[i][1]+nz*off]);
  }
  return out;
}

reseed(4242);
/* the quay road runs the whole inhabited coast, estates included */
shoreRoad(CITY_S0-120, CITY_S1+90, 32, 21, 'quay');
/* the walled core: streets parallel to the shore, boulevards, cross lanes */
[[96,15],[214,14],[342,14],[0,16]].forEach(function(cfg,i){
  var p=[];
  for(var s=WALL_S0+20; s<=CITY_S1-20; s+=34){
    var off = cfg[0] || (wallOffset(s)-76);
    p.push(shoreIn(s, off + 18*Math.sin(s*0.0042 + i*2.1)));
  }
  road(p, cfg[1], 'ring');
});

[0.10,0.27,0.44,0.60,0.76,0.91].forEach(function(u){
  var gs = mix(WALL_S0, CITY_S1, u);
  var gp = shoreIn(gs, wallOffset(gs));
  road([ shoreIn(gs + rr(-24,24), 38), shoreIn(gs + rr(-20,20), 214),
         shoreIn(gs + rr(-14,14), 342), gp,
         shoreIn(gs + rr(-60,60), wallOffset(gs) + 380) ], 19, 'boulevard');
});
(function(){

  var seeds = [];
  for(var s=WALL_S0+30; s<CITY_S1-30; s+=rr(62,118)) seeds.push(s);
  var targets = seeds.map(function(s0){ return s0 + rr(-40,40); });
  targets.sort(function(a,b){ return a-b; });
  seeds.forEach(function(s0, idx){
    var starget = targets[idx];
    var pts = [];
    for(var k=0;k<=5;k++){
      var t = k/5, sMid = mix(s0, starget, t);
      pts.push(shoreIn(sMid, mix(34, wallOffset(sMid)-76, t)));
    }
    road(wanderPath(pts, 6, s0*0.13), rr(8.5,12.5), 'minor');
  });

  [140, 300, 450].forEach(function(extra,i){
    var p=[];
    for(var s2=WALL_S0+50; s2<=CITY_S1-50; s2+=38)
      p.push(shoreIn(s2, wallOffset(s2) + extra));
    road(wanderPath(p, 11, extra*0.7 + i), 10, 'minor');
  });
})();
/* the estates: a shore road, a back lane, and tracks between them */
shoreRoad(CITY_S0-140, WALL_S0, 150, 13, 'ring', 14);
shoreRoad(CITY_S0-100, WALL_S0, 330, 11, 'minor', 22);
(function(){
  var s = CITY_S0 - 60;
  while(s < WALL_S0 - 40){
    road([ shoreIn(s, 34), shoreIn(s+rr(-20,20), 150), shoreIn(s+rr(-40,40), 330),
           shoreIn(s+rr(-70,70), rr(520,760)) ], rr(7,10), 'minor');
    s += rr(90, 170);
  }
})();

reseed(4243);

shoreRoad(S_10-180, CITY_S0-140, 130, 11, 'ring', 20, 34);
shoreRoad(S_10-180, CITY_S0-140, 320, 9, 'minor', 28, 40);
(function(){
  var s = S_10-140;
  while(s < CITY_S0-160){
    var w = rr(-30,30);
    road([ shoreIn(s,34), shoreIn(s+w,130), shoreIn(s+w*1.6,320),
           shoreIn(s+w*2.0, rr(420,600)) ], rr(6.5,9.5), 'minor');
    s += rr(90, 170);
  }
})();

/* the river road, both banks, out along the valley */
(function(){
  [1,-1].forEach(function(side){
    var p=[];
    for(var u=RIVER_HEAD-30; u<2600; u+=110){
      var q = riverAt(u), off = (riverHalf(q.x,q.z) + 48)*side;
      p.push([q.x + q.nx*off, q.z + q.nz*off]);
    }
    road(p, 12, 'minor');
  });
})();

/* ==== highways: long-haul roads reaching off the map, feeding the same ==== */
reseed(424242);

road([[1958,-1142],[2312,-1504],[2475,-1981],[2401,-2483],[2238,-2954],[2140,-3444],[1953,-3913],[1637,-4308],[1246,-4615],[1252,-5067]], 14, 'highway'); /* NE */
road([[300,1900],[250,2600],[150,3400],[60,3900]], 14, 'highway');   /* S */

road([[-1129.3,2203.8],[-1180,2310],[-1540,2310],[-1810,2310],[-2080,2130],[-2440,1770],[-2800,1590],[-3070,1590],[-3340,1590]], 14, 'highway'); /* SW/West */
(function(){                                                          /* E/SE, the river's south bank */
  var pts = [];
  for(var u=2600; u<=RIVER_CUM[RIVER_CUM.length-1]; u+=120){
    var q = riverAt(u), off = riverHalf(q.x,q.z) + 130;
    pts.push([ q.x - q.nx*off, q.z - q.nz*off ]);
  }
  road(pts, 14, 'highway');
})();

road([[1763.7,-1032.0],[1823.9,-1067.1],[2010,-1165.6],[2220,-1410.6],[2325,-1410.6],[2640,-1095.6],[2731.6,-1106.7],[2921.6,-951.7],[3361.6,-959],[3571.6,-1169],[3627,-1249.8],[3627,-1424.8],[3907,-1739.8],[3894.1,-2300.1],[3946.6,-2339.3],[3959.8,-3581.8]], 14, 'highway'); /* NW */

road([[-1319.4,-525.3],[-1367.9,-652.7],[-1247.9,-652.7],[-1187.9,-622.7],[-1161.3,-589.5],[-1071.3,-544.5],[-1048.7,-513.1],[-913.7,-453.1],[-842.4,-373.8],[-1183.0,-267.8]], 14, 'highway'); /* NW: Abbey Close */

road([[-1367.5,-649.6],[-1827.1,-1035.3],[-2133.5,-1292.4],[-2746.4,-1806.6],[-3206.0,-2192.3],[-3665.6,-2578.0],[-4125.3,-2963.6]], 14, 'highway'); /* NW: Abbey Close extension */
