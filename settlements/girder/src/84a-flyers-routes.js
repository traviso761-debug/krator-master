/* ------------------------------------------------------------------ obstacles
   flyHit(x,y,z, mT,mP,mB, skipTower, block) -> 0 clear | 1 trunk | 2 tower | 3 bridge | 4 crown/bough
   Each tower (with its deck and crown frames) is a box: |dx|,|dz| < 40, y < top+16.
   block=true treats the whole four-tower square (decks, slots, court, bridges) as one box: cruise legs go round it. */
var FLY_CELL = 32, flyHash = {}, flyBr = [], flyPathStatsFol = 0, flyTopY = 0, flyTwTop = 0;
var FLY_TWBOX = 40, FLY_TWCAP = 16, FLY_BLOCK = 100;
(function(){
  function put(x, y, z, r){
    var R = r + 8, i0 = Math.floor((x-R)/FLY_CELL), i1 = Math.floor((x+R)/FLY_CELL), j0 = Math.floor((z-R)/FLY_CELL), j1 = Math.floor((z+R)/FLY_CELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k = i*8192+j; (flyHash[k] || (flyHash[k] = [])).push(x, y, z, r); }
  }
  BRANCHES.forEach(function(B){
    for(var i=0;i<B.pts.length-1;i++){ var a = B.pts[i], b = B.pts[i+1];
      if(Math.max(a.r, b.r) <= 2) continue;
      var L = Math.hypot(b.x-a.x, b.y-a.y, b.z-a.z), n = Math.max(1, Math.ceil(L/4));
      for(var s=0;s<n;s++){ var t = s/n, r = mix(a.r, b.r, t); if(r > 2) put(mix(a.x,b.x,t), mix(a.y,b.y,t), mix(a.z,b.z,t), r); } }
  });
  /* leaf clumps: read the real foliage instances if the tree pass tagged them (crown ellipsoids cover the rest) */
  var flyFolN = 0;
  scene.traverse(function(o){
    if(!o.isInstancedMesh || !o.userData.trees || !/foliage/i.test(o.userData.inspectLabel || '')) return;
    var M = o.instanceMatrix.array;
    for(var i=0;i<o.count;i++){ var k = i*16, sx = Math.hypot(M[k], M[k+1], M[k+2]);
      if(sx < 6 || Math.abs(M[k+12]) > 1700 || Math.abs(M[k+14]) > 1700) continue;
      put(M[k+12], M[k+13], M[k+14], Math.max(1, sx*0.5-3)); flyFolN++; }
  });
  flyPathStatsFol = flyFolN;
  BRIDGES.forEach(function(br){ flyBr.push({ br:br, x0:Math.min(br.a.x,br.b.x), x1:Math.max(br.a.x,br.b.x), z0:Math.min(br.a.z,br.b.z), z1:Math.max(br.a.z,br.b.z),
    y0:Math.min(br.a.y,br.b.y)-br.sag-1, y1:Math.max(br.a.y,br.b.y)+3 }); });
  TREES.forEach(function(T){ flyTopY = Math.max(flyTopY, T.y0+T.H); });
  FARTREES.forEach(function(T){ flyTopY = Math.max(flyTopY, T.y0+T.H); });
  TOWERS.forEach(function(T){ flyTwTop = Math.max(flyTwTop, T.top+FLY_TWCAP); });
})();
function flyHit(x, y, z, mT, mP, mB, skipTower, block){
  var i, d;
  if(block){ if(Math.abs(x) < FLY_BLOCK+mP && Math.abs(z) < FLY_BLOCK+mP && y < flyTwTop+mP*0.5) return 2; }
  else {
    for(i=0;i<TOWERS.length;i++){ var W = TOWERS[i]; if(W === skipTower) continue;
      if(Math.abs(x-W.x) < FLY_TWBOX+mP && Math.abs(z-W.z) < FLY_TWBOX+mP && y < W.top+FLY_TWCAP+mP*0.5) return 2; }
    for(i=0;i<flyBr.length;i++){ var b = flyBr[i];
      if(x < b.x0-8 || x > b.x1+8 || z < b.z0-8 || z > b.z1+8 || y < b.y0-mB || y > b.y1+mB) continue;
      var br = b.br, ex = br.b.x-br.a.x, ez = br.b.z-br.a.z, t = clamp(((x-br.a.x)*ex+(z-br.a.z)*ez)/(ex*ex+ez*ez), 0, 1);
      if(Math.hypot(x-br.a.x-ex*t, z-br.a.z-ez*t) < br.w*0.5+4 && Math.abs(y-bridgeY(br, t)-1) < mB) return 3; }
  }
  for(i=0;i<TREES.length;i++){ var T = TREES[i], dx = x-T.x, dz = z-T.z, cr = T.crownR+mT;
    if(dx > cr || dx < -cr || dz > cr || dz < -cr || y > T.y0+T.H+4+mT) continue;
    d = Math.sqrt(dx*dx+dz*dz);
    if(d < trunkR(T, y)+mT) return 1;
    var cy = T.y0+T.H*(1+T.crown0)*0.5, ry = T.H*(1-T.crown0)*0.5+8+mT*0.5, qy = (y-cy)/ry, qd = d/(T.crownR+mT*0.5);
    if(qy*qy+qd*qd < 1) return 4; }
  var cell = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
  if(cell) for(i=0;i<cell.length;i+=4){ var ax = x-cell[i], ay = y-cell[i+1], az = z-cell[i+2], rr2 = cell[i+3]+6;
    if(ax*ax+ay*ay+az*az < rr2*rr2) return 4; }
  return 0;
}
/* a straight cruise leg a->b: far trees in 2-D, everything near sampled (block mode), ground */
function flyLineHit(ax, ay, az, bx, by, bz, mT, mP, halfW){
  var i, d, L = Math.hypot(bx-ax, bz-az), ym = Math.min(ay, by);
  halfW = halfW || 0;
  for(i=0;i<FARTREES.length;i++){ var T = FARTREES[i]; if(ym > T.y0+T.H+4) continue;
    d = segDist(T.x, T.z, ax, az, bx, bz);
    if(d < trunkR(T, ym)+mT+halfW) return 1;
    if(ym > T.y0+T.H*T.crown0 && d < T.crownR*0.7+halfW) return 4; }
  var n = Math.max(1, Math.ceil(L/8));
  for(i=0;i<=n;i++){ var t = i/n, x = mix(ax,bx,t), z = mix(az,bz,t), y = mix(ay,by,t);
    if(Math.abs(x) < 1700 && Math.abs(z) < 1700){ var h = flyHit(x, y, z, mT+halfW, mP+halfW, 5, null, true); if(h) return h; }
    if(i%8 === 0 && y < terrainH(x, z)+28) return 5; }
  return 0;
}

/* ------------------------------------------------------------------ paths
   A path is a polyline {p:Float32Array xyz, cum:Float32Array, n, len, closed}. */
var flyV = new THREE.Vector3();
function flyPathFromPts(pts, closed){
  var n = pts.length, P = new Float32Array(n*3), C = new Float32Array(n), L = 0;
  for(var i=0;i<n;i++){ P[i*3] = pts[i][0]; P[i*3+1] = pts[i][1]; P[i*3+2] = pts[i][2];
    if(i) L += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1], pts[i][2]-pts[i-1][2]); C[i] = L; }
  return { p:P, cum:C, n:n, len:L, closed:!!closed };
}
function flyCurvePts(curve, step, out){
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.max(8, Math.ceil(L/step));
  for(var i=0;i<=n;i++){ curve.getPointAt(i/n, flyV); out.push([flyV.x, flyV.y, flyV.z]); }
  return L;
}
var flyS = [0,0,0,0];    /* x,y,z,seg */
function flyPathAt(path, s, seg){
  var C = path.cum, n = path.n;
  if(s <= 0){ seg = 0; s = 0; } else if(s >= path.len){ seg = n-2; s = path.len; }
  else { if(seg > n-2) seg = n-2; while(seg > 0 && C[seg] > s) seg--; while(seg < n-2 && C[seg+1] < s) seg++; }
  var d = C[seg+1]-C[seg], t = d > 0 ? (s-C[seg])/d : 0, P = path.p, k = seg*3;
  flyS[0] = P[k]+(P[k+3]-P[k])*t; flyS[1] = P[k+1]+(P[k+4]-P[k+1])*t; flyS[2] = P[k+2]+(P[k+5]-P[k+2])*t; flyS[3] = seg;
}
var FLY_EDGE = 3100;
function flyEdge(x, z, dx, dz){         /* distance along (dx,dz) from (x,z) to the spawn circle */
  var b = x*dx+z*dz, c = x*x+z*z-FLY_EDGE*FLY_EDGE; return -b+Math.sqrt(Math.max(0, b*b-c));
}
var flyPathStats = { accepted:0, rejected:0, reason:{ trunk:0, tower:0, bridge:0, crown:0, ground:0, tight:0 }, blockedBays:0, usableBays:0, residentBays:0, joinOk:0, joinFail:0, why:{ pend:0, phit:0, plong:0 } };
var flyWhy = flyPathStats.why;
var FLY_REASON = ['', 'trunk', 'tower', 'bridge', 'crown', 'ground', 'tight'];
function flyReject(code){ flyPathStats.rejected++; flyPathStats.reason[FLY_REASON[code]]++; return null; }

/* ------------------------------------------------------------------ roost bays
   Stall frame (50-structure buildDeck): perch point R 1.4 m inside the deck edge; front posts 0.2 m inside R at
   +-w/2 (w = 11.1 m, LESS than a quetzal's 12.4 m span); 2.2 m partitions; lean-to roof, eave 5.5 m up reaching
   0.6 m beyond the edge; perch beam from 1.5 m inside R to 3.4 m outside, top 0.48 m above the deck.
   Coordinates about a bay: e = distance outward from R, q = along the deck edge. */
var FLY_E_TOUCH = 3.0, FLY_E_LIP = 2.6, FLY_E_PERCH = -3.5, FLY_E_HANG = -3.0, FLY_BEAM_TOP = 0.48;
var flyBays = [];
(function(){
  ROOSTS.forEach(function(R0){
    var P = R0.plat, W = P.tower;
    var inner = (R0.ox !== 0 && R0.ox === -W.sx) || (R0.oz !== 0 && R0.oz === -W.sz);
    var B = { id:R0.id, roost:R0, plat:P, tower:W, px:R0.x, y:R0.y, pz:R0.z, ox:R0.ox, oz:R0.oz, H:R0.H, w:R0.w, kind:'outer',
              ok:true, occ:null, reserved:false, ux:0, uz:0, a:0, lB:0 };
    if(inner){      /* it faces the 42 m slot between two decks: (ux,uz) runs OUT of the court along the slot's centre line */
      if(R0.ox !== 0){ B.uz = W.sz; B.a = Math.abs(R0.z); B.lB = Math.abs(R0.x); B.kind = B.a > Math.abs(W.z) ? 'slot' : 'court'; }
      else { B.ux = W.sx; B.a = Math.abs(R0.x); B.lB = Math.abs(R0.z); B.kind = B.a > Math.abs(W.x) ? 'slot' : 'court'; }
      if(B.kind === 'court'){ B.ok = false; flyPathStats.residentBays++; }
    }
    flyBays.push(B);
  });
})();
/* is a flight point acceptable next to its OWN deck? (the tower box is skipped there) */
function flyBayClear(B, x, y, z){
  var W = B.tower;
  if(y > W.top+FLY_TWCAP) return true;
  var e = (x-B.px)*B.ox+(z-B.pz)*B.oz, q = -(x-B.px)*B.oz+(z-B.pz)*B.ox;
  if(Math.abs(x-W.x) < 39.4 && Math.abs(z-W.z) < 39.4)                  /* over/under the deck: only inside this stall's mouth */
    return Math.abs(q) < B.w*0.5-0.7 && e > -5 && y > B.y+0.6 && y < B.y+5.4+0.18*Math.max(0, -e) && y < B.y+6.4;
  if(e < 2.8 && Math.abs(q) < B.w*0.5+1 && y > B.y+4.9 && y < B.y+9) return false;      /* the eave */
  return true;
}
var flyLastHit = null;
function flyCurveHit(curve, R, ownNear){
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.ceil(L/5);
  for(var i=0;i<=n;i++){ curve.getPointAt(i/n, flyV);
    var own = Math.hypot(flyV.x-R.px, flyV.z-R.pz) < ownNear;
    var h = flyHit(flyV.x, flyV.y, flyV.z, 12, 10, 5, own ? R.tower : null, false);
    if(!h && own && !flyBayClear(R, flyV.x, flyV.y, flyV.z)) h = 2;
    if(!h && flyV.y < terrainH(flyV.x, flyV.z)+20) h = 5;
    if(h){ flyLastHit = [h, i, n, flyV.x|0, flyV.y|0, flyV.z|0, own, R.y|0]; return h; } }
  return 0;
}
/* no turn tighter than rMin away from the bay (connector legs to and from circuits) */
function flyCurveTight(curve, R, rMin, clear){
  clear = clear || 130;
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.ceil(L/10), ds = L/n, h0 = null;
  for(var i=0;i<n;i++){ curve.getTangentAt((i+0.5)/n, flyV); var hd = Math.atan2(flyV.x, flyV.z);
    curve.getPointAt((i+0.5)/n, flyV);
    if(h0 !== null && Math.hypot(flyV.x-R.px, flyV.z-R.pz) > clear && Math.abs(wrapPi(hd-h0)) > ds/rMin) return true;
    h0 = hd; }
  return false;
}

function flyBV(B, e, q, y){ return new THREE.Vector3(B.px+B.ox*e-B.oz*q, y, B.pz+B.oz*e+B.ox*q); }
function flySV(B, a, l, y){ return new THREE.Vector3(B.ux*a-B.ox*l, y, B.uz*a-B.oz*l); }     /* slot frame: a out of the court, l toward the bay */
/* control points of an arrival, far -> touchdown: G0, G (on the inbound line), line-up, straight final, touchdown */
function flyArrPts(B, sp, theta, yOff, gDist, steep){
  var k2 = steep ? 52 : Math.min(16, yOff*0.3), k1 = steep ? 17 : 3, k0 = steep ? 5 : 1;      /* steep: down over a crown that stands in the way */
  var S = FLY_SPEC[sp], c = Math.cos(theta), s = Math.sin(theta), yIn = B.y + (sp === FLY_B ? 3.3 : 3.85), yG = yIn + yOff, pts, dx, dz;
  var yEnd = sp === FLY_B ? B.y+3.95 : B.y+FLY_BEAM_TOP+S.stand;
  if(B.kind === 'outer'){
    dx = B.ox*c-B.oz*s; dz = B.ox*s+B.oz*c; var lat = clamp(theta, -1, 1)*70;
    pts = [ new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)), new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist),
      flyBV(B, 200, lat, yIn+k2), flyBV(B, 104, 0, yIn+k1), flyBV(B, 64, 0, yIn+k0), flyBV(B, 17, 0, yIn) ];
    if(sp === FLY_B) pts.push(flyBV(B, 4, 0, yIn+0.2), flyBV(B, FLY_E_HANG, 0, yEnd)); else pts.push(flyBV(B, FLY_E_TOUCH, 0, yEnd));
  } else {
    dx = B.ux*c-B.uz*s; dz = B.ux*s+B.uz*c; var aM = B.a+260, l1 = -(dx*B.ox+dz*B.oz)*60, M = flySV(B, aM, 0, 0);
    pts = [ new THREE.Vector3(M.x+dx*(gDist+150), yG, M.z+dz*(gDist+150)), new THREE.Vector3(M.x+dx*gDist, yG, M.z+dz*gDist),
      flySV(B, B.a+180, l1, yIn+k2), flySV(B, B.a+84, 0, yIn+k1), flySV(B, B.a+40, -1.5, yIn+k0),
      flySV(B, B.a+16, 2, yIn+0.8), flySV(B, B.a+6.5, 8, yIn+0.4), flySV(B, B.a+1.4, 14.5, yIn+0.1) ];
    if(sp === FLY_B) pts.push(flySV(B, B.a+0.2, B.lB-4, yIn+0.2), flySV(B, B.a, B.lB-FLY_E_HANG, yEnd)); else pts.push(flySV(B, B.a, B.lB-FLY_E_TOUCH, yEnd));
  }
  return { pts:pts, dx:dx, dz:dz, yG:yG, g0:pts[0] };
}
/* control points of a departure, lip -> far: off the beam, DROP away outward, climb out to the gate */
function flyDepPts(B, sp, theta, yOff, gDist, steep){
  var k2 = steep ? 58 : Math.min(26, yOff*0.4), k1 = steep ? 6 : -5;
  var S = FLY_SPEC[sp], c = Math.cos(theta), s = Math.sin(theta), yIn = B.y+3.85, yG = yIn + yOff, y0 = B.y+FLY_BEAM_TOP+S.stand, yc = B.y+3.95, pts, dx, dz;
  if(B.kind === 'outer'){
    dx = B.ox*c-B.oz*s; dz = B.ox*s+B.oz*c; var lat = clamp(theta, -1, 1)*60;
    if(sp === FLY_B) pts = [ flyBV(B, FLY_E_HANG, 0, yc), flyBV(B, 0.6, 0, yc-1.9), flyBV(B, 13, 0, B.y-1.5), flyBV(B, 38, 0, B.y-5.5) ];
    else pts = [ flyBV(B, FLY_E_LIP, 0, y0), flyBV(B, 13, 0, y0-3.6), flyBV(B, 34, 0, y0-8.5) ];
    pts.push(flyBV(B, 78, 0, yIn+k1), flyBV(B, 185, lat, yIn+k2),
             new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist), new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)));
  } else {
    dx = B.ux*c-B.uz*s; dz = B.ux*s+B.uz*c; var aM = B.a+260, l1 = -(dx*B.ox+dz*B.oz)*60, M = flySV(B, aM, 0, 0);
    if(sp === FLY_B) pts = [ flySV(B, B.a, B.lB-FLY_E_HANG, yc), flySV(B, B.a+0.2, B.lB-0.6, yc-1.9), flySV(B, B.a+2.2, 13, B.y-1) ];
    else pts = [ flySV(B, B.a, B.lB-FLY_E_LIP, y0), flySV(B, B.a+2.2, 13, y0-3.2) ];
    pts.push(flySV(B, B.a+9, 5.5, y0-6), flySV(B, B.a+25, 0.5, y0-8), flySV(B, B.a+62, 0, yIn+k1-1), flySV(B, B.a+170, l1, yIn+k2),
             new THREE.Vector3(M.x+dx*gDist, yG, M.z+dz*gDist), new THREE.Vector3(M.x+dx*(gDist+150), yG, M.z+dz*(gDist+150)));
  }
  return { pts:pts, dx:dx, dz:dz, yG:yG, g0:pts[pts.length-1] };
}
/* the far leg beyond the gate, walking OUTWARD from (x,y,z) on heading (hx,hz): straight to the world edge, or (sortie)
   a wide climbing turn onto heading (tx,tz) at height yT first. Returns [[x,y,z]...] or null. */
var FLY_SORTIES = [ { name:'the volcano', x:-0.72, z:-0.69 }, { name:'the gas giant', x:0.69, z:-0.72 } ];
function flyFarLeg(x, y, z, hx, hz, sortie){
  var pts = [], D, h;
  if(sortie){
    var hd = Math.atan2(hx, hz), ht = Math.atan2(sortie.x, sortie.z) + (flyRand()-0.5)*0.5, yT = 470+flyRand()*150, step = 14, R = 300+flyRand()*120, n = 0;
    while(n++ < 500){
      var dh = wrapPi(ht-hd); if(Math.abs(dh) < 0.01 && Math.abs(yT-y) < 1) break;
      hd += clamp(dh, -step/R, step/R); y += clamp(yT-y, -step*0.17, step*0.17); x += Math.sin(hd)*step; z += Math.cos(hd)*step;
      h = flyHit(x, y, z, 20, 30, 8, null, true); if(!h && y < terrainH(x, z)+40) h = 5;
      if(h){ flyReject(h); return null; }
      pts.push([x, y, z]); }
    hx = Math.sin(hd); hz = Math.cos(hd);
  }
  D = flyEdge(x, z, hx, hz);
  h = flyLineHit(x, y, z, x+hx*D, y, z+hz*D, 15, 25, 0); if(h){ flyReject(h); return null; }
  pts.push([x+hx*D, y, z+hz*D]);
  return pts;
}
function flyStub(C){ var o = []; for(var m=10;m<=400;m+=10) o.push([C.g0.x+C.dx*m, C.yG, C.g0.z+C.dz*m]); return o; }
/* try a handful of azimuth/altitude variants; returns a path or null */
function flyRoute(B, sp, arriving, tries, nearOnly, sortie){
  for(var t=0; t<tries; t++){
    var low = (t%4) === 1 && !sortie, steep = (t%4) === 3, theta = (flyRand()*2-1)*(t < 3 ? 0.7 : 1.25), yOff = low ? -40+flyRand()*50 : steep ? 90+flyRand()*70 : arriving ? 30+flyRand()*90 : 50+flyRand()*100, gD = 380+flyRand()*110;
    var C = arriving ? flyArrPts(B, sp, theta, yOff, gD, steep) : flyDepPts(B, sp, theta, yOff, gD, steep);
    var curve = new THREE.CatmullRomCurve3(C.pts, false, 'centripetal');
    var h = flyCurveHit(curve, B, 50);
    if(h){ flyReject(h); continue; }
    var far = nearOnly ? flyStub(C) : flyFarLeg(C.g0.x, C.yG, C.g0.z, C.dx, C.dz, sortie);
    if(!far) continue;
    flyPathStats.accepted++;
    var pts = [];
    if(arriving){ for(var i=far.length-1;i>=0;i--) pts.push(far[i]); flyCurvePts(curve, 2.5, pts); }
    else { flyCurvePts(curve, 2.5, pts); for(i=0;i<far.length;i++) pts.push(far[i]); }
    var path = flyPathFromPts(pts, false); path.curve = curve; path.straight = path.len - curve.getLength(); path.sortie = sortie || null;
    return path;
  }
  return null;
}

/* ------------------------------------------------------------------ meshes */
var flyMesh = [], flyPose = [], flyPoseBuf = [], flyUsed = [], flySlotOwner = [], flyWingMesh = null;
function flyMakeMesh(sp, geom, cap, mat, share){
  var arr, ib;
  if(share){ arr = flyPose[share]; ib = flyPoseBuf[share]; }
  else { arr = new Float32Array(cap*16); ib = new THREE.InstancedInterleavedBuffer(arr, 16, 1); ib.setUsage(THREE.DynamicDrawUsage); }
  for(var k=0;k<4;k++) geom.setAttribute('aFlyP'+k, new THREE.InterleavedBufferAttribute(ib, 4, k*4));
  var m = new THREE.InstancedMesh(geom, mat, cap);
  m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  if(share){ m.instanceMatrix = flyMesh[share].instanceMatrix; m.instanceColor = flyMesh[share].instanceColor; }
  else {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(var i=0;i<cap*16;i++) m.instanceMatrix.array[i] = 0;
    var c = new THREE.Color(1,1,1); for(i=0;i<cap;i++) m.setColorAt(i, c);
    flyPose[sp] = arr; flyPoseBuf[sp] = ib; flyUsed[sp] = new Uint8Array(cap); flySlotOwner[sp] = new Array(cap);
  }
  m.count = 1; scene.add(m);
  return m;
}
/* library detail maps per species (48-detail.js; materials.json): four families in one atlas, a quadrant per colour (FlyGeo.slots) */
var FLY_DETAIL = [ ['fly_q_fuzz','fly_q_membrane','fly_q_crest','fly_q_horn'], ['fly_b_fur','fly_b_membrane','fly_b_bone',null],
                   ['fly_a_feather','fly_a_scale',null,null], ['fly_d_chitin','fly_d_legs',null,null], ['fly_r_blanket','fly_r_leather','fly_r_wood','fly_r_rope'] ];
for(var flyI=0; flyI<5; flyI++) (function(flyI){
  var mat = new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide }), sk = flySkinHook(flyBones[flyI]);
  var dA = (typeof GDET !== 'undefined') ? GDET.atlasHook(GDET.atlas(FLY_DETAIL[flyI]), mat) : null;
  flyMesh[flyI] = flyMakeMesh(flyI, flyGeoms[flyI], flyI === FLY_R ? FLY_RCAP : FLY_CAP,
    nlMaterial(mat, 'fly'+flyI+(dA?'|det':''), dA ? function(sh){ sk(sh); dA(sh); } : sk));
})(flyI);
flyWingMesh = flyMakeMesh(FLY_D, flyWingGeom, FLY_CAP,
  nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide, transparent:true, opacity:FLY_WINGTEX ? 0.9 : 0.55, depthWrite:false, map:FLY_WINGTEX }), 'flyWing' + (FLY_WINGTEX ? 'Tex' : ''), flySkinHook(flyBones[FLY_D])), FLY_D);
flyWingMesh.renderOrder = 3;

function flySlotGet(sp, owner){
  var U = flyUsed[sp], n = U.length;
  for(var i=0;i<n;i++) if(!U[i]){ U[i] = 1; flySlotOwner[sp][i] = owner; if(i+1 > flyMesh[sp].count) flyMesh[sp].count = i+1; return i; }
  return -1;
}
function flySlotFree(sp, i){
  if(i < 0) return;
  var U = flyUsed[sp], M = flyMesh[sp].instanceMatrix.array; U[i] = 0; flySlotOwner[sp][i] = null;
  for(var k=0;k<16;k++) M[i*16+k] = 0;
  var c = flyMesh[sp].count; while(c > 1 && !U[c-1]) c--; flyMesh[sp].count = c;
}

/* night glints: rider lanterns + bat eyes */
var FLY_NGL = 64, flyGlPos = new Float32Array(FLY_NGL*3), flyGlCol = new Float32Array(FLY_NGL*4), flyGlGeo = new THREE.BufferGeometry();
flyGlGeo.setAttribute('position', new THREE.BufferAttribute(flyGlPos, 3).setUsage(THREE.DynamicDrawUsage));
flyGlGeo.setAttribute('aCol', new THREE.BufferAttribute(flyGlCol, 4).setUsage(THREE.DynamicDrawUsage));
var flyGlMat = new THREE.ShaderMaterial({
  uniforms:{ uK:{ value:0 }, uScale:{ value:400 } }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:'attribute vec4 aCol; varying vec4 vC; uniform float uScale; uniform float uK;\nvoid main(){ vC = vec4(aCol.rgb, uK); vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(aCol.a*uScale/max(1.0,-mv.z), 1.5, 48.0); }',
  fragmentShader:'varying vec4 vC;\nvoid main(){ vec2 d = gl_PointCoord-0.5; float r = length(d)*2.0; float a = smoothstep(1.0,0.0,r); a = a*a*0.55 + smoothstep(0.35,0.0,r)*0.6; gl_FragColor = vec4(vC.rgb*a*vC.a, 1.0); }'
});
var flyGlints = new THREE.Points(flyGlGeo, flyGlMat); flyGlints.frustumCulled = false; flyGlints.visible = false; flyGlints.renderOrder = 4;
flyGlGeo.setDrawRange(0, 1); scene.add(flyGlints);
var flyLampC = new THREE.Color(PAL.glowWarm).convertSRGBToLinear(), flyEyeC = new THREE.Color(PAL.beast.quetz[2]).convertSRGBToLinear();


