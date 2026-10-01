/* ==== ferry stop piers ==== */
var LIFE_BAY_CENTER = {
  x: (CIDX['Palace'].x + CIDX['Temple'].x + CIDX['Ancestry'].x) / 3,
  z: (CIDX['Palace'].z + CIDX['Temple'].z + CIDX['Ancestry'].z) / 3
};

function lifeCantonEdge(c, dirX, dirZ){
  var capHw = c.r*1.07;
  var ang = Math.atan2(dirZ, dirX);
  var clearR = capHw / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang)));
  return [c.x + dirX*clearR, c.z + dirZ*clearR];
}

var LIFE_EXTRA_PIERS = [];

function lifeBuildFerryPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);
  BOX(midX, SEA+1.0, midZ, 5.5, 1.1, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=11){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*2.9, pz = rootZ+dirZ*k + (dirX)*sg*2.9;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 0.6, SEA+1.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: tipX, z1: tipZ, w: 5.5 });
  return { x: tipX, z: tipZ, ry: Math.atan2(-dirX, -dirZ) };
}

var LIFE_FERRY_STOPS = [];
var LIFE_SHRINE_STOPS = [];
(function(){

  ['Palace','Temple','Ancestry','Arena'].forEach(function(nm){
    var p = CPIERS.filter(function(pp){ return pp.canton === nm; })[0];
    if(p) LIFE_FERRY_STOPS.push({ x:p.x1, z:p.z1, ry:p.ry, name:nm });
  });

  ['Arsenal','Foreign','Granary','Market','Fortress'].forEach(function(nm){
    var c = CIDX[nm]; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 40);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:nm });
  });

  (function(){
    var c = CIDX['Port']; if(!c) return;
    var dx = LIFE_BAY_CENTER.x-c.x, dz = LIFE_BAY_CENTER.z-c.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;
    var edge = lifeCantonEdge(c, dx, dz);
    var pier = lifeBuildFerryPier(edge[0], edge[1], dx, dz, 85);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Port' });
  })();

  (function(){
    var cw = CAUSEWAYS.filter(function(c){ return c.c.n === 'Guild'; })[0];
    if(!cw) return;

    var pierS = cw.s + 35;
    var landing = shoreIn(pierS, 26), n = shoreNorm(pierS);
    var pier = lifeBuildFerryPier(landing[0]-n[0]*4, landing[1]-n[1]*4, -n[0], -n[1], 36);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Guild-causeway' });
  })();

  (function(){
    var rp = RPIERS[1];
    if(rp) LIFE_FERRY_STOPS.push({ x:rp.x1, z:rp.z1, ry:rp.ry, name:'RiverDocks' });
  })();

  (function(){
    var cx = 951.58, cz = -939.26;
    var s = shoreS(cx,cz), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Customs' });
  })();

  (function(){
    var s = shoreS(-545,-317), p = shoreAt(s), n = shoreNorm(s);
    var pier = lifeBuildFerryPier(p[0]-n[0]*4, p[1]-n[1]*4, -n[0], -n[1], 38);
    LIFE_FERRY_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Promontory' });
  })();

  var templeC = CIDX['Temple'];
  ISLES.filter(function(i){ return i[4] === 'shrine'; }).forEach(function(isle, si){
    var sx = isle[0], sz = isle[1], srad = isle[3];
    var dx = sx-templeC.x, dz = sz-templeC.z, d = Math.hypot(dx,dz) || 1;
    dx/=d; dz/=d;

    if(si === 0){ dx = -dx; dz = -dz; }
    var rootX = sx+dx*srad*0.9, rootZ = sz+dz*srad*0.9;
    var pier = lifeBuildFerryPier(rootX, rootZ, dx, dz, 22);
    LIFE_SHRINE_STOPS.push({ x:pier.x, z:pier.z, ry:pier.ry, name:'Shrine'+si });
  });

  (function(){
    var isle0 = ISLES.filter(function(i){ return i[4] === 'shrine'; })[0];
    if(!isle0) return;
    var sx = isle0[0], sz = isle0[1], srad = isle0[3];
    var southX = sx, southZ = sz+srad;
    var s = shoreS(southX, southZ);
    var shorePt = shoreAt(s);
    var ddx = shorePt[0]-southX, ddz = shorePt[1]-southZ, dd = Math.hypot(ddx,ddz) || 1;
    ddx/=dd; ddz/=dd;
    var len = dd + 4;   /* a few units past the shoreline, onto solid ground */
    var bry = Math.atan2(ddx, ddz);
    var midX = southX+ddx*len*0.5, midZ = southZ+ddz*len*0.5;
    BOX(midX, SEA+0.9, midZ, 3.0, 0.7, len*1.03, bry, 0x8a7659, 'wood');
    for(var k=4; k<len; k+=8){
      [-1,1].forEach(function(sg){
        var px = southX+ddx*k + (-ddz)*sg*1.5, pz = southZ+ddz*k + (ddx)*sg*1.5;
        var bh = bedAt(px,pz);
        CYL(px, bh, pz, 0.35, SEA+1.1-bh, 0, 0x6b5942, 'wood');
      });
    }
  })();
})();

LIFE_FERRY_STOPS.forEach(function(s){ s.angle = Math.atan2(s.z-LIFE_BAY_CENTER.z, s.x-LIFE_BAY_CENTER.x); });
LIFE_FERRY_STOPS.sort(function(a,b){ return a.angle-b.angle; });

var LIFE_SHRINE_ROUTE = [{ x: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].x1,
                            z: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].z1,
                            ry: CPIERS.filter(function(p){ return p.canton==='Temple'; })[0].ry, name:'Temple' }]
  .concat(LIFE_SHRINE_STOPS);
(function(){
  var hubX = LIFE_SHRINE_ROUTE[0].x, hubZ = LIFE_SHRINE_ROUTE[0].z;
  LIFE_SHRINE_ROUTE.forEach(function(s){ s.angle = Math.atan2(s.z-hubZ, s.x-hubX); });
  var head = LIFE_SHRINE_ROUTE[0];
  var rest = LIFE_SHRINE_ROUTE.slice(1).sort(function(a,b){ return a.angle-b.angle; });
  LIFE_SHRINE_ROUTE = [head].concat(rest);
})();

/* ==== fisherman's docks (new) ==== */
var LIFE_FISHDOCK_W = 9.5;        /* deck full width — mid(11-17 harbour, 5.5 ferry) */
var LIFE_FISHDOCK_H = 1.4;        /* deck thickness  — mid(1.7 harbour, 1.1 ferry) */
var LIFE_FISHDOCK_PILE_R = 0.8;   /* piling radius   — mid(1.05 harbour, 0.6 ferry) */
var LIFE_FISHDOCK_LEN = 38;       /* into the water  — capped by these small coves, see note above */

var LIFE_FISHDOCK_MOOR_HALF = LIFE_FISHDOCK_W*0.5 + 4.05 + 1.2;

function fishDockBerthWet(x, z, nx, nz){
  var px = -nz, pz = nx, a, L;
  for(a = -2; a <= 0.001; a += 2){
    for(L = -LIFE_FISHDOCK_MOOR_HALF; L <= LIFE_FISHDOCK_MOOR_HALF+0.001; L += LIFE_FISHDOCK_MOOR_HALF*0.5){
      if(terrainH(x + nx*a + px*L, z + nz*a + pz*L) > SEA) return false;
    }
  }
  return true;
}
var LIFE_FISH_PIERS = [];
function buildFishDockPier(rootX, rootZ, dirX, dirZ, len){
  var midX = rootX+dirX*len*0.5, midZ = rootZ+dirZ*len*0.5;
  var ry = Math.atan2(dirX, dirZ);

  var rec = claim(midX, midZ, LIFE_FISHDOCK_W*0.5+1.2, len*0.5+1.2, ry, 'fishdock');
  if(!rec) return null;
  BOX(midX, SEA+LIFE_FISHDOCK_H*0.7, midZ, LIFE_FISHDOCK_W, LIFE_FISHDOCK_H, len*1.05, ry, 0x8a7659, 'wood');
  for(var k=5; k<len; k+=10){
    [-1,1].forEach(function(sg){
      var px = rootX+dirX*k + (-dirZ)*sg*(LIFE_FISHDOCK_W*0.5-1.1), pz = rootZ+dirZ*k + (dirX)*sg*(LIFE_FISHDOCK_W*0.5-1.1);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  var tipX = rootX+dirX*len, tipZ = rootZ+dirZ*len;

  LIFE_EXTRA_PIERS.push({ x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W });

  return { x0:rootX, z0:rootZ, x1:tipX, z1:tipZ, w:LIFE_FISHDOCK_W, len:len,
           dirX:dirX, dirZ:dirZ, tipX:tipX, tipZ:tipZ };
}

function buildFishDockZone(zoneName, poly, i0, i1){
  var A = poly[i0], B = poly[i1];
  var tx = B[0]-A[0], tz = B[1]-A[1], spineLen = Math.hypot(tx,tz) || 1;
  tx /= spineLen; tz /= spineLen;
  var nx = -tz, nz = tx;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;
  var midX = (A[0]+B[0])*0.5, midZ = (A[1]+B[1])*0.5;
  if((cx-midX)*nx + (cz-midZ)*nz < 0){ nx = -nx; nz = -nz; }   /* normal must point INTO the polygon */
  var margin = LIFE_FISHDOCK_W*0.5 + 2, step = 4;
  for(var u = margin; u <= spineLen-margin; u += step){
    var markX = A[0]+tx*u, markZ = A[1]+tz*u;

    var out = 0;
    while(out < 40 && !fishDockBerthWet(markX + nx*out, markZ + nz*out, nx, nz)) out += 2;
    if(out >= 40) out = 0;                                   /* no berthable water within 40: leave it marked, fail loud */
    var rootX = markX + nx*out, rootZ = markZ + nz*out;
    var back = 0, len = LIFE_FISHDOCK_LEN;
    while(back < 24 && terrainH(rootX - nx*back, rootZ - nz*back) <= SEA) back += 2;
    if(back > 0 && back < 24){ rootX -= nx*back; rootZ -= nz*back; len += back; }
    var pier = buildFishDockPier(rootX, rootZ, nx, nz, len);
    if(pier){ pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length; pier.attach = 'shore';
              pier.seaward = out; pier.onshore = (len - LIFE_FISHDOCK_LEN);   /* diagnostics: how far the two walks moved it */
              LIFE_FISH_PIERS.push(pier); }
  }
}

var LIFE_FISHDOCK_WALK_W = 6.0;
function buildFishDockWalk(ax, az, bx, bz){
  var dx = bx-ax, dz = bz-az, L = Math.hypot(dx,dz) || 1;
  dx /= L; dz /= L;
  var ry = Math.atan2(dx, dz);
  BOX(ax+dx*L*0.5, SEA+LIFE_FISHDOCK_H*0.7, az+dz*L*0.5, LIFE_FISHDOCK_WALK_W, LIFE_FISHDOCK_H, L*1.02, ry, 0x8a7659, 'wood');
  for(var k=4; k<L; k+=11){
    [-1,1].forEach(function(sg){
      var px = ax+dx*k + (-dz)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var pz = az+dz*k + ( dx)*sg*(LIFE_FISHDOCK_WALK_W*0.5-0.9);
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, LIFE_FISHDOCK_PILE_R, SEA+LIFE_FISHDOCK_H+0.3-bh, 0, 0x6b5942, 'wood');
    });
  }
  LIFE_EXTRA_PIERS.push({ x0:ax, z0:az, x1:bx, z1:bz, w:LIFE_FISHDOCK_WALK_W });
  return { x0:ax, z0:az, x1:bx, z1:bz, dirX:dx, dirZ:dz, len:L, w:LIFE_FISHDOCK_WALK_W };
}

function buildFishDockJetty(zoneName, poly, cantonName, spineLen){
  var c = CIDX[cantonName]; if(!c) return;
  var cx=0, cz=0;
  poly.forEach(function(p){ cx += p[0]; cz += p[1]; });
  cx /= poly.length; cz /= poly.length;

  var capHw = c.r*1.07;
  var ax, az;
  if(Math.abs(cx-c.x) > Math.abs(cz-c.z)){
    ax = c.x + (cx<c.x ? -capHw : capHw);
    az = Math.max(c.z-capHw+10, Math.min(c.z+capHw-10, cz));
  }else{
    az = c.z + (cz<c.z ? -capHw : capHw);
    ax = Math.max(c.x-capHw+10, Math.min(c.x+capHw-10, cx));
  }
  var tx = cx-ax, tz = cz-az, tL = Math.hypot(tx,tz) || 1;
  tx /= tL; tz /= tL;
  var bx = ax+tx*spineLen, bz = az+tz*spineLen;
  var walk = buildFishDockWalk(ax, az, bx, bz);
  var nx = -tz, nz = tx;
  var margin = LIFE_FISHDOCK_W*0.5 + 4, step = 4;
  var side = 1;
  for(var u = margin; u <= spineLen-margin; u += step){
    var sx = ax+tx*u, sz = az+tz*u;
    var dirX = nx*side, dirZ = nz*side;
    var rootX = sx + dirX*(LIFE_FISHDOCK_WALK_W*0.5), rootZ = sz + dirZ*(LIFE_FISHDOCK_WALK_W*0.5);
    var pier = buildFishDockPier(rootX, rootZ, dirX, dirZ, LIFE_FISHDOCK_LEN);
    if(pier){

      u += LIFE_FISHDOCK_W + 4 - step;
      pier.zone = zoneName; pier.slot = LIFE_FISH_PIERS.length;
      pier.attach = 'canton:'+cantonName; pier.walk = walk;
      LIFE_FISH_PIERS.push(pier);
      side = -side;   /* next one off the other side, so the jetty berths both flanks */
    }
  }
}
var LIFE_FISH_ZONES = [
  { name:'CoveEast',     poly:[[742.1,-466.2],[720.3,-395.8],[597.5,-431.8],[611.0,-497.2]],           i0:0, i1:1 },
  { name:'CoveFortress', poly:[[2011.9,-1209.6],[2139.5,-1324.8],[2018.2,-1416.3],[1910.6,-1337.3]],   i0:0, i1:1 },
  { name:'CoveWest',     poly:[[-1510.1,-926.5],[-1699.2,-1053.7],[-1627.2,-1177.6],[-1416.1,-1059.3]],i0:0, i1:1 },
  { name:'ShoalBank',    poly:[[985.7,-1424.4],[898.0,-1425.9],[896.1,-1537.3],[999.2,-1526.0],[1029.4,-1519.9],[1033.7,-1476.5],[1001.8,-1462.9]], canton:'Port', spine:112 }
];
LIFE_FISH_ZONES.forEach(function(z){
  if(z.canton) buildFishDockJetty(z.name, z.poly, z.canton, z.spine);
  else buildFishDockZone(z.name, z.poly, z.i0, z.i1);
});
window._fishDocks = { piers: LIFE_FISH_PIERS.length, list: LIFE_FISH_PIERS,
  perZone: LIFE_FISH_ZONES.map(function(z){ return { name:z.name, n: LIFE_FISH_PIERS.filter(function(p){ return p.zone===z.name; }).length }; }) };   /* diagnostic */

/* ==== cart landings: where a MERCHANT CARAVAN actually collects the catch ==== */
var LIFE_FISH_CART_STOPS = [];
(function(){
  var seenWalk = [];
  LIFE_FISH_PIERS.forEach(function(p){
    var sx, sz;
    if(p.walk){
      if(seenWalk.indexOf(p.walk) >= 0) return;
      seenWalk.push(p.walk);
      var cn = (p.attach||'').indexOf('canton:') === 0 ? CIDX[p.attach.slice(7)] : null;
      if(!cn) return;   /* a trestle with no canton has no landward end at all */
      var dxc = cn.x - p.walk.x0, dzc = cn.z - p.walk.z0, Lc = Math.hypot(dxc,dzc) || 1;
      var inward = Math.max(0, Lc - cn.r*0.80);
      sx = p.walk.x0 + dxc/Lc*inward; sz = p.walk.z0 + dzc/Lc*inward;
      LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.walk.dirX, p.walk.dirZ),
                                  zone:p.zone, attach:p.attach, inward:Math.round(inward) });
      return;
    }
    var back = 0;
    while(back < 40 && terrainH(p.x0 - p.dirX*back, p.z0 - p.dirZ*back) <= SEA+2.5) back += 4;
    sx = p.x0 - p.dirX*back; sz = p.z0 - p.dirZ*back;

    if(terrainH(sx,sz) <= SEA+2.5) return;
    LIFE_FISH_CART_STOPS.push({ x:sx, z:sz, ry: Math.atan2(p.dirX, p.dirZ),
                                zone:p.zone, attach:p.attach, setback:back });
  });
})();
window._fishCartStops = LIFE_FISH_CART_STOPS;   /* diagnostic */

function fishDockCantonEdge(x, z){
  var bn=null, bd=1e9;
  for(var i=0;i<CANTONS.length;i++){
    var c = CANTONS[i];
    var hw = c.r*1.07;
    var dx = Math.abs(x-c.x)-hw, dz = Math.abs(z-c.z)-hw;
    var d = (dx>0 || dz>0) ? Math.hypot(Math.max(dx,0), Math.max(dz,0)) : Math.max(dx,dz);
    if(d < bd){ bd = d; bn = c.n; }
  }
  return { canton:bn, d:bd };
}
window._fishDocks.audit = function(){
  function segD(px,pz,ax,az,bx,bz){
    var dx=bx-ax, dz=bz-az, L=dx*dx+dz*dz;
    var t = L ? ((px-ax)*dx+(pz-az)*dz)/L : 0; t = Math.max(0,Math.min(1,t));
    return Math.hypot(px-ax-t*dx, pz-az-t*dz);
  }
  function segSegD(a,b,c,d){
    var m = 1e9, i, t, x, z;
    for(i=0;i<=24;i++){ t=i/24; x=a[0]+(b[0]-a[0])*t; z=a[1]+(b[1]-a[1])*t; m=Math.min(m, segD(x,z,c[0],c[1],d[0],d[1])); }
    for(i=0;i<=24;i++){ t=i/24; x=c[0]+(d[0]-c[0])*t; z=c[1]+(d[1]-c[1])*t; m=Math.min(m, segD(x,z,a[0],a[1],b[0],b[1])); }
    return m;
  }
  var others = [];
  PIERS.forEach(function(p,i){ others.push({ tag:'PIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||14) }); });
  CPIERS.forEach(function(p,i){ others.push({ tag:'CPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||8) }); });
  RPIERS.forEach(function(p,i){ others.push({ tag:'RPIERS['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||10) }); });
  LIFE_EXTRA_PIERS.forEach(function(p,i){ others.push({ tag:'EXTRA['+i+']', a:[p.x0,p.z0], b:[p.x1,p.z1], w:(p.w||6) }); });
  return LIFE_FISH_PIERS.map(function(p, idx){
    var r = { i:idx, zone:p.zone, root:[Math.round(p.x0), Math.round(p.z0)], tip:[Math.round(p.tipX), Math.round(p.tipZ)] };
    /* attachment: walk the pier's OWN axis landward from the root */
    var land = null, d;
    for(d=0; d>=-260; d-=2){
      if(terrainH(p.x0+p.dirX*d, p.z0+p.dirZ*d) > SEA){ land = -d; break; }
    }
    r.landBehind = land;
    var ce = fishDockCantonEdge(p.x0, p.z0);
    r.canton = ce.canton; r.cantonD = Math.round(ce.d*10)/10;
    if(p.walk){

      var we = fishDockCantonEdge(p.walk.x0, p.walk.z0);
      r.walkRootCantonD = Math.round(we.d*10)/10;
      r.attach = (we.d <= 2) ? ('jetty->canton:'+we.canton)
               : ('JETTY ROOT '+Math.round(we.d)+' OFF '+we.canton);
    }else{
      r.attach = (land !== null && land <= 8) ? 'shore'
               : (ce.d <= 10) ? ('canton:'+ce.canton)
               : (land !== null && land <= 40) ? ('shore+'+Math.round(land))
               : 'NOT ATTACHED';
    }
    /* overlaps */
    var hits = [];
    others.forEach(function(o){
      if(Math.hypot(o.a[0]-p.x0, o.a[1]-p.z0) < 0.01 && Math.hypot(o.b[0]-p.tipX, o.b[1]-p.tipZ) < 0.01) return;  /* itself */

      if(p.walk && Math.hypot(o.a[0]-p.walk.x0, o.a[1]-p.walk.z0) < 0.01 && Math.hypot(o.b[0]-p.walk.x1, o.b[1]-p.walk.z1) < 0.01) return;
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], o.a, o.b);
      if(dd < p.w*0.5 + o.w*0.5) hits.push(o.tag+' '+(Math.round(dd*10)/10));
    });
    LIFE_RBARGE_DOCKS.forEach(function(dk,di){
      var dd = segD(dk.x, dk.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < p.w*0.5 + 14) hits.push('rbargeDock'+di+' '+(Math.round(dd*10)/10));
    });
    PLACED.forEach(function(o){
      if(o.tag === 'fishdock') return;
      var dd = segD(o.x, o.z, p.x0,p.z0, p.tipX,p.tipZ);
      if(dd < o.rad + p.w*0.5) hits.push('PLACED:'+o.tag+' '+(Math.round(dd*10)/10));
    });
    var t2, x2, z2;
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(typeof chinHit !== 'undefined' && chinHit(x2,z2, p.w*0.5+2)){ hits.push('chinampa'); break; }
    }
    for(t2=0; t2<=1.0001; t2+=0.04){
      x2 = p.x0+(p.tipX-p.x0)*t2; z2 = p.z0+(p.tipZ-p.z0)*t2;
      if(inRiver(x2,z2, 12)){ hits.push('river-channel'); break; }
    }
    CAUSEWAYS.forEach(function(cw,ci){
      var lp = shoreIn(cw.s, 26);
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [cw.c.x,cw.c.z], [lp[0],lp[1]]);
      if(dd < p.w*0.5 + CWAY*0.5 + 4) hits.push('causeway'+ci+' '+(Math.round(dd*10)/10));
    });
    SPANS.forEach(function(sp,si){
      var A2 = CANTONS[sp.a], B2 = CANTONS[sp.b];
      var dd = segSegD([p.x0,p.z0],[p.tipX,p.tipZ], [A2.x,A2.z], [B2.x,B2.z]);
      if(dd < p.w*0.5 + DECK*0.5 + 4) hits.push('span'+si+' '+(Math.round(dd*10)/10));
    });
    r.overlaps = hits;
    /* ==== the mooring slots themselves ==== */
    if(typeof LIFE_FISH_BOATS !== 'undefined' && LIFE_FISH_BOATS.length){
      r.moor = [];
      LIFE_FISH_BOATS.forEach(function(b){
        if(b.pier !== p) return;
        var fx = Math.sin(b.home.ry), fz = Math.cos(b.home.ry);
        var sx2 = fz, sz2 = -fx, landN = 0, tot = 0, maxH = -1e9, a, c, hh;
        for(a = -0.51; a <= 0.671; a += 0.1174){
          for(c = -0.5; c <= 0.501; c += 0.25){
            hh = terrainH(b.home.x + fx*a*LIFE_DHOW_LEN + sx2*c*LIFE_DHOW_BEAM,
                          b.home.z + fz*a*LIFE_DHOW_LEN + sz2*c*LIFE_DHOW_BEAM);
            tot++; if(hh > SEA) landN++;
            if(hh > maxH) maxH = hh;
          }
        }
        r.moor.push({ side:b.moorSide, x:Math.round(b.home.x), z:Math.round(b.home.z),
                      land:landN, of:tot, maxH:Math.round(maxH*100)/100, dry:landN>0 });
      });
      r.moorDry = r.moor.filter(function(m){ return m.dry; }).length;
    }
    return r;
  });
};

window._fishDocks.moorReport = function(){
  var rows = window._fishDocks.audit(), dry = 0, total = 0, perZone = {};
  rows.forEach(function(r){
    (r.moor||[]).forEach(function(m){
      total++;
      perZone[r.zone] = perZone[r.zone] || { slots:0, dry:0 };
      perZone[r.zone].slots++;
      if(m.dry){ dry++; perZone[r.zone].dry++; }
    });
  });
  return { dry:dry, total:total, perZone:perZone,
           beached: rows.filter(function(r){ return r.moorDry; })
                        .map(function(r){ return { pier:r.i, zone:r.zone, dry:r.moorDry,
                                                   worst:Math.max.apply(null, r.moor.map(function(m){ return m.land; })) }; }) };
};

/* ==== standalone shrines (new) ==== */
reseed(655001);
function lifeStandaloneShrine(x, z, ry, rad){
  var y = terrainH(x, z);
  var col = pick(TONES);
  BOX(x, y, z, rad*0.86, 2.0, rad*0.86, ry, shade(col,-0.14));
  BOX(x, y+1.8, z, rad*0.52, 5, rad*0.52, ry+0.4, col);
  DOME(x, y+6.8, z, rad*0.24, rad*0.20, 0, pick(DOMEC), 'dome');
  for(var s=0; s<4; s++){
    var sa = ry + Math.PI/4 + s*Math.PI/2;
    FR3(x+Math.cos(sa)*rad*0.36, y+1.8, z+Math.sin(sa)*rad*0.36, 3.4, rr(11,17), 3.4, sa, col);
  }
  return { x:x, z:z, y:y, ry:ry };
}

function lifeFindShrineSite(anchorX, anchorZ, opt){
  opt = opt || {};
  var minH = (opt.minH != null) ? opt.minH : -1e9;
  var maxH = (opt.maxH != null) ? opt.maxH : 1e9;
  var maxSlope = (opt.maxSlope != null) ? opt.maxSlope : 9;
  var footprint = (opt.footprint != null) ? opt.footprint : 22;
  for(var ring=0; ring<28; ring++){
    var r = ring*20, tries = ring===0 ? 1 : 10;
    for(var t=0; t<tries; t++){
      var ang = (t/tries)*Math.PI*2 + ring*0.37;
      var x = anchorX + Math.cos(ang)*r, z = anchorZ + Math.sin(ang)*r;
      var h = terrainH(x,z);
      if(h < minH || h > maxH) continue;
      if(opt.requireCore && zoneAt(x,z) !== 'core') continue;
      if(inRiver(x,z,20)) continue;
      if(openAt(x,z)) continue;

      var nrh = nearestStreet(x, z, {ring:true, highway:true});

      if(nrh && nrh.dist < nrh.width*0.5 + Math.hypot(footprint,footprint)) continue;
      var hs = [terrainH(x+18,z), terrainH(x-18,z), terrainH(x,z+18), terrainH(x,z-18)];
      var slope = Math.max(Math.abs(hs[0]-h), Math.abs(hs[1]-h), Math.abs(hs[2]-h), Math.abs(hs[3]-h));
      if(slope > maxSlope) continue;
      var claimed = claim(x, z, footprint, footprint, opt.ry || 0, 'shrine');
      if(claimed) return { x:x, z:z };
    }
  }
  return null;
}
(function(){
  var sites = [
    { anchor:[2450,-360],  name:'ShrineEast',    face:[0,0],
      opt:{ minH:150, maxH:320, maxSlope:8 } },
    { anchor:[1005, 95],   name:'ShrineCentral', face:[CIDX['Temple'].x, CIDX['Temple'].z],
      opt:{ minH:5, maxH:40, maxSlope:6, requireCore:true, footprint:18 } },
    { anchor:[-1360, 661], name:'ShrineWest',    face:[-1370, 681],
      opt:{ minH:2, maxH:40, maxSlope:6 } }
  ];
  window._standaloneShrineDebug = [];
  sites.forEach(function(st){
    var ry = Math.atan2(st.face[0]-st.anchor[0], st.face[1]-st.anchor[1]);
    st.opt.ry = ry;
    var found = lifeFindShrineSite(st.anchor[0], st.anchor[1], st.opt);
    if(!found){ window._standaloneShrineDebug.push({name:st.name, ok:false}); return; }
    window._standaloneShrineDebug.push({name:st.name, ok:true, x:found.x, z:found.z});
    lifeStandaloneShrine(found.x, found.z, ry, (st.opt.footprint||22)*2.1);

    LIFE_SHRINE_STOPS.push({ x:found.x, z:found.z, ry:ry, name:st.name });
  });
})();

/* ==== river-barge docks ==== */
var LIFE_RBARGE_QUAD = [[1785.2,1394.4],[1743.3,1447.7],[2116.9,1668.9],[2177.4,1593.6]];
var LIFE_RBARGE_DOCKS = [];
(function(){
  var total = RIVER_CUM[RIVER_CUM.length-1];
  var dockU0 = RIVER_HEAD + 30;   /* exactly RPIERS[0]'s own u */
  var qcx=0, qcz=0;
  LIFE_RBARGE_QUAD.forEach(function(p){ qcx+=p[0]; qcz+=p[1]; });
  qcx/=4; qcz/=4;
  var quadU = polyNear(qcx, qcz, RIVER, RIVER_CUM).t * total;

  var clearU0 = dockU0 + 220;
  var us = [dockU0];
  for(var di=1; di<=4; di++) us.push(clearU0 + (quadU-clearU0)*di/6);
  var qMinX=Math.min(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMaxX=Math.max(LIFE_RBARGE_QUAD[0][0],LIFE_RBARGE_QUAD[1][0],LIFE_RBARGE_QUAD[2][0],LIFE_RBARGE_QUAD[3][0]);
  var qMinZ=Math.min(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  var qMaxZ=Math.max(LIFE_RBARGE_QUAD[0][1],LIFE_RBARGE_QUAD[1][1],LIFE_RBARGE_QUAD[2][1],LIFE_RBARGE_QUAD[3][1]);
  for(var k=0; k<2; k++){
    var picked = null;
    for(var t2=0; t2<200; t2++){
      var x = rr(qMinX,qMaxX), z = rr(qMinZ,qMaxZ);
      if(pointInPoly(x, z, LIFE_RBARGE_QUAD)){ picked = [x,z]; break; }
    }
    if(!picked) picked = [qcx,qcz];
    us.push(polyNear(picked[0], picked[1], RIVER, RIVER_CUM).t * total);
  }
  us.forEach(function(u, di){
    var p = riverAt(u);
    var ry = Math.atan2(p.tx, p.tz);
    if(di === 0){
      LIFE_RBARGE_DOCKS.push({ x: RPIERS[0].bx, z: RPIERS[0].bz, ry: RPIERS[0].ry, u: u });
      return;
    }

    var half, bx, bz, uTry = u, claimed = false;
    for(var uAttempt=0; uAttempt<24; uAttempt++){
      var p2 = riverAt(uTry);
      half = riverHalf(p2.x, p2.z);
      bx = p2.x + p2.nx*half; bz = p2.z + p2.nz*half;
      var ry2 = Math.atan2(p2.tx, p2.tz);

      claimed = claim(bx, bz, 22, 6, ry2, 'rdock');
      if(claimed){ p = p2; break; }
      uTry = u + (uAttempt+1)*15;
    }
    ry = Math.atan2(p.tx, p.tz);

    BOX(bx, SEA+1.2, bz, 10, 1.4, 40, ry, 0x8a7659, 'wood');
    LIFE_EXTRA_PIERS.push({ x0: bx-p.tx*20, z0: bz-p.tz*20, x1: bx+p.tx*20, z1: bz+p.tz*20, w: 10 });
    [-1,1].forEach(function(sg){
      var px = bx + p.tx*sg*17, pz = bz + p.tz*sg*17;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, 1.1, SEA+4.0-bh, 0, 0x6b5942, 'wood');
    });
    BOX(bx, SEA+3.6, bz, 1.0, 0.6, 34, ry, 0x5b4b38, 'wood');

    LIFE_RBARGE_DOCKS.push({ x: bx, z: bz, ry: ry, u: uTry });
  });
})();

/* ==== the Fortress coast-guard dock ==== */
var LIFE_CGUARD_BERTHS = [];      /* {x,z,ry,len,beam} — where a coast-guard hull ties up; builder fills, a future vessel reads */
var LIFE_CGUARD_DOCK = null;      /* {rootX,rootZ,tipX,tipZ,deckY,w,headHalf} — the dock itself, for anything that needs its geometry */
(function(){
  var c = CIDX['Fortress']; if(!c) return;
  var W = 12.5, TH = 1.55, PR = 0.95;             /* deck width / thickness / piling radius */
  var DECKY = SEA + 2.0;                          /* deck BOX base; its walkable top is DECKY+TH = SEA+3.55 */
  var LEN = 74;                                   /* trestle run into the bay */
  var HEADL = 46, HEADD = 14;                     /* the berthing head, across the trestle */
  var WOOD = 0x8a7659, PILE = 0x6b5942, TRIM = 0x5b4b38;
  var GREEN = 0x2f6b3a;                           /* the order's banner green, same scalar ordinatorFortress() flies */
  var rootX = c.x, rootZ = c.z - (c.r*1.07 - 3);  /* just inside the plinth apron's own lip, so the deck meets stone */
  var tipZ = rootZ - LEN;
  /* ==== the trestle ==== */
  BOX(rootX, DECKY, (rootZ+tipZ)*0.5, W, TH, LEN*1.02, 0, WOOD, 'wood');
  for(var k=8; k<LEN; k+=12){
    for(var sg=-1; sg<=1; sg+=2){
      var px = rootX + sg*(W*0.5-1.2), pz = rootZ - k;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, PR, DECKY+TH-bh, 0, PILE, 'wood');
    }
  }
  /* rails down the trestle only — the head stays clear for handling lines */
  for(var sg2=-1; sg2<=1; sg2+=2){
    BOX(rootX + sg2*(W*0.5-0.5), DECKY+TH, (rootZ+tipZ)*0.5 + 4, 0.5, 1.2, LEN-10, 0, TRIM, 'wood');
  }
  /* ==== the berthing head, laid across the trestle's tip ==== */
  BOX(rootX, DECKY, tipZ, HEADL, TH, HEADD, 0, WOOD, 'wood');
  for(var hx=-1; hx<=1; hx+=1){
    for(var hz=-1; hz<=1; hz+=2){
      var qx = rootX + hx*(HEADL*0.5-2.0), qz = tipZ + hz*(HEADD*0.5-1.6);
      var bh2 = bedAt(qx,qz);
      CYL(qx, bh2, qz, PR, DECKY+TH-bh2, 0, PILE, 'wood');
    }
  }
  /* bollards along the outboard face, and a fender rubbing strake */
  for(var b=-2; b<=2; b++){
    CYL(rootX + b*10.0, DECKY+TH, tipZ - HEADD*0.5 + 1.0, 0.75, 1.7, 0, PILE, 'wood');
  }
  BOX(rootX, DECKY+TH-0.9, tipZ - HEADD*0.5 - 0.3, HEADL, 0.8, 0.8, 0, TRIM, 'wood');

  var hutX = rootX - HEADL*0.5 + 6.0;
  BOX(hutX, DECKY+TH, tipZ + 1.0, 9.0, 4.6, 6.4, 0, TRIM, 'wood');

  FR8(hutX, DECKY+TH+4.6, tipZ + 1.0, 10.2, 1.5, 7.4, 0, ROOFS[1 % ROOFS.length], 'roof');
  var mastX = rootX + HEADL*0.5 - 5.0;
  CYL(mastX, DECKY+TH, tipZ + 1.0, 0.45, 15.0, 0, PILE, 'wood');
  BOX(mastX + 0.6, DECKY+TH+9.0, tipZ + 1.0, 0.3, 4.2, 5.0, 0, GREEN, 'cloth');
  /* ==== a short flight up to the canton's own plinth apron (its surface is ==== */
  for(var s=0;s<3;s++){
    BOX(rootX, DECKY+TH + s*0.82, rootZ + 1.2 + s*1.5, W*0.62, 0.82, 1.6, 0, WOOD, 'wood');
  }
  /* ==== registrations. LIFE_EXTRA_PIERS is what makes every existing boat ==== */
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: rootX, z1: tipZ, w: W });
  LIFE_EXTRA_PIERS.push({ x0: rootX - HEADL*0.5, z0: tipZ, x1: rootX + HEADL*0.5, z1: tipZ, w: HEADD });
  inspectClaim(rootX, (rootZ+tipZ)*0.5, W*0.5, LEN*0.5, 0, 'dock', 'Coast-guard dock');
  inspectClaim(rootX, tipZ, HEADL*0.5, HEADD*0.5, 0, 'dock', 'Coast-guard berth');

  LIFE_CGUARD_BERTHS.push({ x: rootX, z: tipZ - HEADD*0.5 - 6.5, ry: Math.PI*0.5, len: 44, beam: 11, face:'north' });
  LIFE_CGUARD_BERTHS.push({ x: rootX - HEADL*0.5 - 6.5, z: tipZ, ry: 0, len: 36, beam: 10, face:'west' });
  LIFE_CGUARD_DOCK = { rootX:rootX, rootZ:rootZ, tipX:rootX, tipZ:tipZ, deckY: DECKY+TH,
                       w: W, headHalf: HEADL*0.5, headDepth: HEADD };
  window._cguardDock = { dock: LIFE_CGUARD_DOCK, berths: LIFE_CGUARD_BERTHS };   /* diagnostic */
})();

function threadedPortStair(c, y, hw, qy, ex, ez, ry){
  var PLINTH = 5, W = tierWeights(c.tiers), rem = c.top - PLINTH;
  var tY0=[], tY1=[], tHw=[], yy=PLINTH, hh=c.r*0.97;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    tY0[i]=yy; tY1[i]=yy+th; tHw[i]=hh;
    yy += th+0.12; hh *= 0.86;
  }
  for(var t=c.tiers-1; t>=0; t--){
    var topY = (t===c.tiers-1) ? y : tY1[t];      /* topmost flight uses the exact (y,hw) portDeckV2 was called with */
    var rHw  = (t===c.tiers-1) ? hw : tHw[t];
    var botY = tY0[t];
    seaStair(c.x+ex*rHw, c.z+ez*rHw, ry, 16, topY, botY);
    if(t>0){
      var rNext = tHw[t-1];
      var mx = c.x+ex*(rHw+rNext)*0.5, mz = c.z+ez*(rHw+rNext)*0.5;
      BOX(mx, botY-0.3, mz, Math.abs(rNext-rHw)+16, 1.0, 16, ry, 0xa79b82);   /* landing bridging the outward jog */
    }
  }
  seaStair(c.x+ex*tHw[0], c.z+ez*tHw[0], ry, 16, tY0[0], qy);   /* final flight, tier 0's own base down to the quay */
}

function portDeckV2(c, y, hw, qy, qhw){
  var lp = shoreIn(c.s, 26), sl = Math.hypot(lp[0]-c.x, lp[1]-c.z);
  var sdx = (lp[0]-c.x)/sl, sdz = (lp[1]-c.z)/sl;

  var navHX = c.x + sdx*hw*0.33, navHZ = c.z + sdz*hw*0.33;
  for(var f0=0; f0<4; f0++){
    var a0 = f0*Math.PI/2, ex = Math.cos(a0), ez = Math.sin(a0);
    if(ex*sdx + ez*sdz > 0.5) continue;
    for(var q=-1; q<=1; q++){
      var scale = (q===0) ? 0.60 : 1.0;
      var sx = c.x + ex*(qhw-14) + (-ez)*q*qhw*0.55, sz = c.z + ez*(qhw-14) + (ex)*q*qhw*0.55;
      shed(sx, qy, sz, 24*scale, 12*scale, rr(6,9)*(q===0?0.9:1), -a0+Math.PI/2, pick(TONES_POOR));
    }
    for(var g=0; g<6; g++){
      var gx = c.x + ex*(qhw-rr(6,28)) + (-ez)*rr(-qhw*0.9,qhw*0.9), gz = c.z + ez*(qhw-rr(6,28)) + (ex)*rr(-qhw*0.9,qhw*0.9);
      BOX(gx, qy, gz, rr(2.2,4), rr(2,3.6), rr(2.2,4), rnd()*3, pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
    }
    threadedPortStair(c, y, hw, qy, ex, ez, -a0+Math.PI);
  }

  var lbR = hw*0.15, lmR = hw*0.08, ltR = 6.5, lh = hw*0.95;
  inspectClaim(c.x, c.z, lbR, lbR, 0, 'lighthouse', 'Lighthouse');
  FR6(c.x, y, c.z, lbR*2, lh*0.62, lbR*2, 0, shade(c.tone,0.03));
  FR3(c.x, y+lh*0.62, c.z, lmR*2, lh*0.38, lmR*2, 0, shade(c.tone,0.06));
  BOX(c.x, y+lh-1.2, c.z, ltR*2.6, 2.2, ltR*2.6, Math.PI/4, shade(c.tone,-0.14));
  CYL(c.x, y+lh, c.z, ltR, 10, 0, shade(c.accent,0.10));
  DOME(c.x, y+lh+10, c.z, ltR*0.86, ltR*0.72, 0, c.accent, 'dome');
  CONE(c.x, y+lh+10+ltR*0.72, c.z, 1.6, 6, 0, shade(c.accent,-0.2));
  for(var ls=0; ls<4; ls++){
    var lsa = ls*Math.PI/2 + Math.PI/4;
    CYL(c.x+Math.cos(lsa)*ltR*1.25, y+lh+0.4, c.z+Math.sin(lsa)*ltR*1.25, 0.45, 6.2, 0, shade(c.tone,-0.10));
  }

  var cart = 5.5;
  var whW = hw*0.19, whL = whW*2.05;
  var stepX = whW + cart, stepZ = whL + cart;
  var lightClear = lbR*1.7 + whL*0.5;

  var navClear = hw*0.11 + whL*0.5 + cart;   /* hw*0.11 ~= the hall's own half-diagonal (w=hw*0.17,d=hw*0.14 below) */
  for(var wx = -hw+cart+whW*0.5; wx <= hw-cart-whW*0.5; wx += stepX){
    for(var wz = -hw+cart+whL*0.5; wz <= hw-cart-whL*0.5; wz += stepZ){
      if(Math.hypot(wx,wz) < lightClear) continue;
      if(Math.hypot(c.x+wx-navHX, c.z+wz-navHZ) < navClear) continue;
      if(chance(0.04)) continue;
      inspectClaim(c.x+wx, c.z+wz, whW*0.46, whL*0.46, 0, 'warehouse', 'Port warehouse');
      shed(c.x+wx, y, c.z+wz, whW*0.92, whL*0.92, rr(9,14), 0, pick(TONES_POOR));
    }
  }
  for(var f=0; f<4; f++){
    var a = f*Math.PI/2;
    if(Math.cos(a)*sdx + Math.sin(a)*sdz > 0.5) continue;
    for(var i=0;i<3;i++){
      var off = (i-1)*hw*0.52;
      var dir = [Math.cos(a), Math.sin(a)];
      var base = [c.x + dir[0]*qhw + (-dir[1])*off, c.z + dir[1]*qhw + dir[0]*off];
      var len = rr(70,120);
      for(var j=0;j<Math.round(len/15);j++){
        var xx = base[0] + dir[0]*(j+0.5)*15, zz = base[1] + dir[1]*(j+0.5)*15;
        BOX(xx, qy-0.6, zz, 13, 1.7, 15*1.06, -a+Math.PI/2, 0x8a7659, 'wood');
        [-1,1].forEach(function(sg){
          var q2 = [xx - dir[1]*sg*5.5, zz + dir[0]*sg*5.5];
          CYL(q2[0], bedAt(q2[0],q2[1]), q2[1], 1.0, qy-0.6-bedAt(q2[0],q2[1]), 0, 0x6b5942, 'wood');
        });
      }
      if(i===1){
        CYL(base[0], qy, base[1], 1.4, 16, 0, 0x5b4b38, 'wood');
        BOX(base[0]+dir[0]*7, qy+14.5, base[1]+dir[1]*7, 2, 1.6, 16, -a+Math.PI/2, 0x5b4b38, 'wood');

      }
      else if(chance(0.8)){

        var st = rr(0.42, 0.82), sside = chance(0.5) ? 1 : -1;
        var sx = base[0] + dir[0]*len*st + (-dir[1])*sside*19;
        var sz = base[1] + dir[1]*len*st + ( dir[0])*sside*19;
        var shipRy = Math.atan2(dir[0], dir[1]);
        ferry(sx, SEA-0.2, sz, shipRy, pick([0x5e4d3a,0x6b5942,0x4f4030,0x6a5842]),
              { len:rr(20,34), beam:rr(7.5,10.5), cargo: ri(1,3) });
        window._portShips = window._portShips || [];
        window._portShips.push([Math.round(sx),Math.round(sz)]);
      }
    }
  }

  var chRy = Math.atan2(-sdz, sdx);
  var chp = loc(c.x, c.z, hw*0.86, 0, Math.atan2(sdx,sdz));
  customsHouse(chp[0], y, chp[1], chRy, hw*0.34, hw*0.22, shade(c.tone,0.08));

  (function(){
    var hx = navHX, hz = navHZ;
    var ry = faceToward(hx, hz, c.x, c.z);
    var w = hw*0.17, d = hw*0.14, h = hw*0.17;
    var col = pick(TONES_POOR);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);

    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);

    var mp = loc(hx, hz, w*0.5+3.4, -d*0.30, ry);
    var mastH = h*1.15;
    CYL(mp[0], y, mp[1], 0.30, mastH, 0, shade(TRUNKC[0],-0.1), 'wood');
    CYL(mp[0], y+mastH*0.55, mp[1], 1.6, 0.14, 0, shade(TRUNKC[0],-0.2), 'wood');   /* yardarm-ish disc */
    [-1,1].forEach(function(s){
      var rp = loc(mp[0], mp[1], s*2.4, s*1.6, 0);
      BOX((mp[0]+rp[0])/2, y+mastH*0.72, (mp[1]+rp[1])/2, 0.10, mastH*0.62, 0.10,
          Math.atan2(rp[0]-mp[0], rp[1]-mp[1]), shade(TRUNKC[0],0.05), 'wood');
    });

    var crp = loc(hx, hz, w*0.5+2.0, d*0.40, ry);
    CYL(crp[0], y+0.05, crp[1], 2.0, 0.10, 0, pick(STALKC));
    for(var pi=0; pi<8; pi++){
      var pa = pi*(Math.PI*2/8);
      var pr = loc(crp[0], crp[1], Math.cos(pa)*1.0, Math.sin(pa)*1.0, 0);
      BOX(pr[0], y+0.16, pr[1], 0.16, 0.10, 1.6, -pa, shade(ROOFS[5],-0.15), 'metal');
    }
    /* a chart table under the eave, opposite the mast */
    var ctp = loc(hx, hz, w*0.5+2.2, -d*0.42, ry);
    BOX(ctp[0], y, ctp[1], 2.4, 1.0, 1.6, ry, shade(TRUNKC[0],-0.1), 'wood');
    BOX(ctp[0], y+1.0, ctp[1], 2.0, 0.06, 1.3, ry, shade(PAL.sail[0],-0.04), 'cloth');
    var navDoor = loc(hx,hz,w*0.5+1.2,0,ry);
    GUILD_HALL_DOORS.push({ x:navDoor[0], z:navDoor[1], ry:ry, canton:'Port', name:'Navigator' });

    inspectClaim(hx, hz, w*0.5, d*0.5, ry, 'guildhall', "Navigator's guild hall");
  })();
}

/* ==== addDoor(x, y, z, ry, w, d, h, col) ==== */
function addDoor(x, y, z, ry, w, d, h, col){
  var fx0 = w*0.5, fz0 = d*0.5;
  var doorCol = col ? shade(col, rr(-0.42,-0.34)) : shade(pick(ROOFS), rr(-0.06,0.06));
  var dw = Math.min(rr(1.6,2.2), fz0*0.9);
  var dh = Math.min(rr(2.8,3.6), h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  window._facadeExtraDoors = (window._facadeExtraDoors||0) + 1;
}

/* ==== addWindows(x, y, z, ry, w, d, h, col, doorHalfW) ==== */
function addWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;
  var s0 = chance(0.5) ? 1 : -1;
  if(wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, s0, 0.9,1.4, 1.0,1.6)) n++;
  if(chance(0.60) && wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, -s0, 0.9,1.4, 1.0,1.6)) n++;
  if(fx0 > 7 && chance(0.45)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.25,0.25)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(0.9,1.3), fx0*0.45), rr(1.0,1.5), 0.4, ry, winCol);
    n++;
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ==== guildHallWindows3 ==== */
function guildHallWindows3(x, y, z, ry, w, d, h, col, doorHalfW, sideSign, sideFxFrac){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;

  var avail = Math.max(0.6, fz0 - doorHalfW);
  var fww = Math.min(1.3, avail*0.5);
  var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
  [-1,1].forEach(function(s){
    var fp = loc(x,z, fx0+0.05, s*flat, ry);
    WINBOX(fp[0], winY, fp[1], 0.4, rr(1.0,1.5), fww, ry, winCol);
    n++;
  });
  /* 1 more on a side wall, at a caller-steered offset along its length */
  var sww = Math.min(1.1, fz0*0.5);
  var margin = sww*0.5 + 0.6;
  var slat = mix(-fx0+margin, fx0-margin, sideFxFrac);
  var sp = loc(x,z, slat, sideSign*(fz0+0.05), ry);
  WINBOX(sp[0], winY, sp[1], sww, rr(1.0,1.5), 0.4, ry, winCol);
  n++;
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ==== cantonHallWindows ==== */
function cantonHallWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var floors = Math.max(3, Math.round(h/13));
  var floorH = h/floors;
  var n = 0;
  for(var fl=0; fl<floors; fl++){
    var winY = y + fl*floorH + Math.min(floorH*0.42, rr(2.0,3.2));
    var winH = Math.min(1.5, floorH*0.5);
    if(fl === 0){

      var avail = Math.max(0.6, fz0 - doorHalfW);
      var fww = Math.min(1.3, avail*0.5);
      var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
      [-1,1].forEach(function(s){
        var fp = loc(x,z, fx0+0.05, s*flat, ry);
        WINBOX(fp[0], winY, fp[1], 0.4, winH, fww, ry, winCol);
        n++;
      });
      var sww0 = Math.min(1.1, fz0*0.5);
      var sp0 = loc(x,z, 0, -(fz0+0.05), ry);
      WINBOX(sp0[0], winY, sp0[1], sww0, winH, 0.4, ry, winCol);
      n++;
    }else{

      var fww2 = Math.min(1.2, fx0*0.25);
      [-1,0,1].forEach(function(t){
        var fp2 = loc(x,z, fx0+0.05, t*fz0*0.55, ry);
        WINBOX(fp2[0], winY, fp2[1], 0.4, winH, fww2, ry, winCol);
        n++;
      });
      var sww = Math.min(1.0, fz0*0.42);
      [-1,1].forEach(function(sgn){
        var sp = loc(x,z, (fl%2?1:-1)*fx0*0.3, sgn*(fz0+0.05), ry);
        WINBOX(sp[0], winY, sp[1], sww, winH, 0.4, ry, winCol);
        n++;
      });
    }
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

function arenaDeckSquare(c, y, hw){

  var outerHalf = hw * 0.84;
  var fieldHalf = outerHalf * Math.sqrt(0.8);
  var steps = 4;
  var totalRise = Math.max(16, hw*0.11);
  var stepH = totalRise/steps, bank = (outerHalf - fieldHalf) / steps;
  var halfW = outerHalf, halfD = outerHalf;
  for(var i=0;i<steps;i++){
    var yy = y + (steps-1-i)*stepH;
    var col = shade(c.tone, i%2 ? 0.03 : -0.05);
    var ow = halfW*2, od = halfD*2;
    BOX(c.x, yy, c.z - halfD + bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x, yy, c.z + halfD - bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x - halfW + bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    BOX(c.x + halfW - bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    halfW -= bank; halfD -= bank;
  }
  inspectClaim(c.x, c.z, outerHalf, outerHalf, 0, 'arena', 'Arena terracing');
  inspectClaim(c.x, c.z, fieldHalf, fieldHalf, 0, 'arenafloor', 'Arena floor');
  BOX(c.x, y-0.4, c.z, fieldHalf*2, 0.5, fieldHalf*2, 0, 0x9a8f74);

  var pillarFixed = outerHalf*0.99, pillarSpan = outerHalf*0.90, pillarR = hw*0.022;
  var pillarH = totalRise + 15;
  var perSide = 5;
  function alongSide(k){ return ((k+0.5)/perSide - 0.5) * pillarSpan * 2; }
  var pillarPos = { ns:[], ew:[] };
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide;k++) pillarPos.ns.push([c.x + alongSide(k), c.z + sz*pillarFixed, sz]);
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide;k++) pillarPos.ew.push([c.x + sx*pillarFixed, c.z + alongSide(k), sx]);
  });
  pillarPos.ns.concat(pillarPos.ew).forEach(function(p){
    CYL(p[0], y, p[1], pillarR, pillarH, 0, shade(c.tone,-0.12));
    BOX(p[0], y+pillarH, p[1], pillarR*2.6, 1.2, pillarR*2.6, 0, shade(c.tone,-0.22));  /* capital */
  });

  function hangBanner(ax,az, bx,bz){
    var mx=(ax+bx)/2, mz=(az+bz)/2, dh = pillarH*0.62;
    BOX(mx, y+pillarH*0.88-dh, mz, 0.14, dh, 3.4, Math.atan2(bx-ax,bz-az), pick(BANNERC), 'cloth');
  }
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+alongSide(k), c.z+sz*pillarFixed, c.x+alongSide(k+1), c.z+sz*pillarFixed);
    }
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+sx*pillarFixed, c.z+alongSide(k), c.x+sx*pillarFixed, c.z+alongSide(k+1));
    }
  });

  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, 5.5, squareEdgeHw(c.r*0.97, ferryPier.ry), c.tone);
  }

  /* ==== ARENA GLADIATOR COMBAT SYSTEM, built half ==== */
  arenaCombatDeck(c, y, outerHalf, fieldHalf, steps, stepH, bank, pillarPos, pillarR);
}
