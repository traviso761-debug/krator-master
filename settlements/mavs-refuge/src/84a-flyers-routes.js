/* ------------------------------------------------------------------ obstacles
   flyHit(x,y,z, mT,mP,mB, skipPlat) -> 0 clear | 1 trunk | 2 platform | 3 bridge | 4 bough | 5 ground */
var FLY_CELL = 32, flyHash = {}, flyBr = [], flyPathStatsFol = 0;
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
  /* leaf clumps: read the real foliage instances the tree pass emitted */
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
})();
function flyHit(x, y, z, mT, mP, mB, skipPlat){
  var i, d;
  for(i=0;i<TREES.length;i++){ var T = TREES[i];
    if(y > T.y0+T.H+4) continue;
    d = Math.hypot(x-T.x, z-T.z); if(d < 60+mT && d < trunkR(T, y)+mT) return 1; }
  for(i=0;i<PLATS.length;i++){ var P = PLATS[i]; if(P === skipPlat) continue;
    var Rm = P.R*Math.max(P.sx, P.sz), dx = x-P.x, dz = z-P.z;
    if(Math.abs(dx) > Rm+mP || Math.abs(dz) > Rm+mP) continue;
    d = Math.hypot(dx, dz);
    var top = P.y + (P.kind === 'council' ? 46 : P.main ? 22 : (P.support === 'over' || P.support === 'hang') ? 34 : 15);
    if(y > P.yBottom-3-mP*0.4 && y < top+mP*0.4 && d < Rm+mP) return 2;
    if(P.main && y <= P.yBottom && y > P.yBottom-42){ if(d < Rm*(1-(P.yBottom-y)/42) + mP*0.5) return 2; } }
  for(i=0;i<flyBr.length;i++){ var b = flyBr[i];
    if(x < b.x0-8 || x > b.x1+8 || z < b.z0-8 || z > b.z1+8 || y < b.y0-mB || y > b.y1+mB) continue;
    var br = b.br, ex = br.b.x-br.a.x, ez = br.b.z-br.a.z, t = clamp(((x-br.a.x)*ex+(z-br.a.z)*ez)/(ex*ex+ez*ez), 0, 1);
    if(Math.hypot(x-br.a.x-ex*t, z-br.a.z-ez*t) < br.w*0.5+4 && Math.abs(y-bridgeY(br, t)-1) < mB) return 3; }
  var cell = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
  if(cell) for(i=0;i<cell.length;i+=4){ var ax = x-cell[i], ay = y-cell[i+1], az = z-cell[i+2], rr2 = cell[i+3]+6;
    if(ax*ax+ay*ay+az*az < rr2*rr2) return 4; }
  return 0;
}
/* a straight leg a->b: 2-D tests against every trunk (near + far) and platform, sampled boughs + ground */
function flyLineHit(ax, ay, az, bx, by, bz, mT, mP, halfW){
  var i, d, L = Math.hypot(bx-ax, bz-az), ym = Math.min(ay, by), yM = Math.max(ay, by);
  halfW = halfW || 0;
  for(var pass=0; pass<2; pass++){ var arr = pass ? FARTREES : TREES;
    for(i=0;i<arr.length;i++){ var T = arr[i]; if(ym > T.y0+T.H+4) continue;
      d = segDist(T.x, T.z, ax, az, bx, bz); if(d < trunkR(T, ym)+mT+halfW) return 1; } }
  for(i=0;i<PLATS.length;i++){ var P = PLATS[i];
    if(yM < P.yBottom-45 || ym > P.y+50) continue;
    d = segDist(P.x, P.z, ax, az, bx, bz); if(d < P.R*Math.max(P.sx,P.sz)+mP+halfW) return 2; }
  var n = Math.ceil(L/6);
  for(i=0;i<=n;i++){ var t = i/n, x = mix(ax,bx,t), z = mix(az,bz,t), y = mix(ay,by,t);
    if(Math.abs(x) < 1700 && Math.abs(z) < 1700){
      var c = flyHash[Math.floor(x/FLY_CELL)*8192+Math.floor(z/FLY_CELL)];
      if(c) for(var k=0;k<c.length;k+=4){ var ex = x-c[k], ey = y-c[k+1], ez = z-c[k+2], r2 = c[k+3]+6+halfW; if(ex*ex+ey*ey+ez*ez < r2*r2) return 4; }
      if(y < 240){ var h3 = flyHit(x, y, z, 0, 0, 5+halfW*0.3, null); if(h3 === 3) return 3; }
    }
    if(i%10 === 0 && y < terrainH(x, z)+28) return 5; }
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
var flyPathStats = { accepted:0, rejected:0, reason:{ trunk:0, platform:0, bridge:0, bough:0, ground:0 }, blockedBays:0, usableBays:0, joinOk:0, joinFail:0, why:{ pend:0, phit:0, plong:0 } };
var flyWhy = flyPathStats.why;
var FLY_REASON = ['', 'trunk', 'platform', 'bridge', 'bough', 'ground'];
function flyReject(code){ flyPathStats.rejected++; flyPathStats.reason[FLY_REASON[code]]++; return null; }
function flyCurveHit(curve, R, ownNear){
  curve.arcLengthDivisions = 300; var L = curve.getLength(), n = Math.ceil(L/5);
  for(var i=0;i<=n;i++){ curve.getPointAt(i/n, flyV);
    var own = Math.hypot(flyV.x-R.px, flyV.z-R.pz) < ownNear;
    var h = flyHit(flyV.x, flyV.y, flyV.z, 12, 10, 5, own ? R.plat : null);
    if(!h && own){   /* in the mouth of the bay: stay in the slot between this floor and the one above */
      var dr = Math.hypot(flyV.x-R.plat.x, flyV.z-R.plat.z) - (R.rout+4.5);
      if(dr < 0 && (flyV.y < R.y+0.5 || flyV.y > R.y+R.H-0.3)) h = 2; }
    if(!h && flyV.y < terrainH(flyV.x, flyV.z)+20) h = 5;
    if(h){ flyLastHit = [h, i, n, flyV.x|0, flyV.y|0, flyV.z|0, own, R.y|0]; return h; } }
  return 0;
}
var flyLastHit = null;

/* ------------------------------------------------------------------ roost bays */
var flyBays = [];
(function(){
  var satSeen = {};
  ROOSTS.forEach(function(R0){
    var P = R0.plat, Lv = P.levels[R0.lvl], ang = R0.ang;      /* 30-layout centres every roost between two gallery posts */
    var p = platXZ(P, Lv.Rout-1.2, ang), o = platOutDir(P, ang);
    /* e = metres outward from (px,pz); the posts stand at e ~ +0.85, the lip runs from e = 1.2 to 1.2+lipL (56-levels) */
    var lip = R0.lipL || 2.2;
    var B = { id:R0.id, roost:R0, plat:P, px:p[0], y:Lv.y, pz:p[1], ox:o[0], oz:o[1], H:Lv.H, big:R0.big, rout:Lv.Rout,
              eT:1.2+lip-0.65, eL:1.2+lip-1.0,
              inward:Math.min(3.0, Lv.Rout*0.3), ok:true, occ:null, reserved:false, rook:P === P_RK };
    if(!P.main){ if(satSeen[P.id]) B.ok = false; satSeen[P.id] = 1; }
    flyBays.push(B);
  });
})();

/* terminal curve of an arrival: G0 -> G (on the inbound line) -> line-up -> 60 m straight final -> touchdown */
function flyArrCurve(B, sp, theta, yOff, gDist){
  var S = FLY_SPEC[sp], ox = B.ox, oz = B.oz, c = Math.cos(theta), s = Math.sin(theta), dx = ox*c-oz*s, dz = ox*s+oz*c;
  var qx = -oz, qz = ox, lat = clamp(theta, -1, 1)*70, yIn = B.y + B.H*0.55, yG = yIn + yOff;
  /* bats fly in and hang from the ceiling; everything else touches down on the lip, outside the post line */
  var end = sp === FLY_B ? [B.px-ox*2.0, B.y+B.H-S.stand, B.pz-oz*2.0] : [B.px+ox*B.eT, B.y+S.stand, B.pz+oz*B.eT];
  var pts = [
    new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)),
    new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist),
    new THREE.Vector3(B.px+ox*200+qx*lat, yIn+Math.min(16, yOff*0.3), B.pz+oz*200+qz*lat),
    new THREE.Vector3(B.px+ox*104, yIn+3, B.pz+oz*104),
    new THREE.Vector3(B.px+ox*64, yIn+1, B.pz+oz*64),
    new THREE.Vector3(B.px+ox*(sp === FLY_B ? 15 : 17+B.eT), yIn, B.pz+oz*(sp === FLY_B ? 15 : 17+B.eT)),
    new THREE.Vector3(end[0], end[1], end[2]) ];
  return { curve:new THREE.CatmullRomCurve3(pts, false, 'centripetal'), dx:dx, dz:dz, yG:yG, g0:pts[0] };
}
function flyDepCurve(B, sp, theta, yOff, gDist){
  var S = FLY_SPEC[sp], ox = B.ox, oz = B.oz, c = Math.cos(theta), s = Math.sin(theta), dx = ox*c-oz*s, dz = ox*s+oz*c;
  var qx = -oz, qz = ox, lat = clamp(theta, -1, 1)*60, y0 = B.y + S.stand, yG = B.y + B.H*0.55 + yOff, pts;
  if(sp === FLY_B){ var yc = B.y+B.H-S.stand;
    pts = [ new THREE.Vector3(B.px-ox*2.0, yc, B.pz-oz*2.0), new THREE.Vector3(B.px+ox*1.5, yc-3.2, B.pz+oz*1.5),
            new THREE.Vector3(B.px+ox*13, B.y+2.2, B.pz+oz*13), new THREE.Vector3(B.px+ox*38, B.y+2.5, B.pz+oz*38) ];
  } else {
    var dip = Math.min(2.4, (S.stand-0.65)*2);      /* drop off the lip, but never below the floor line inside the mouth */
    pts = [ new THREE.Vector3(B.px+ox*B.eL, y0, B.pz+oz*B.eL), new THREE.Vector3(B.px+ox*(10+B.eL), y0-dip, B.pz+oz*(10+B.eL)),
            new THREE.Vector3(B.px+ox*32, y0-dip-1.4, B.pz+oz*32) ];
  }
  pts.push(new THREE.Vector3(B.px+ox*75, B.y+B.H*0.55+2, B.pz+oz*75),
           new THREE.Vector3(B.px+ox*185+qx*lat, B.y+B.H*0.55+Math.min(26, yOff*0.4), B.pz+oz*185+qz*lat),
           new THREE.Vector3(B.px+dx*gDist, yG, B.pz+dz*gDist),
           new THREE.Vector3(B.px+dx*(gDist+150), yG, B.pz+dz*(gDist+150)));
  return { curve:new THREE.CatmullRomCurve3(pts, false, 'centripetal'), pts:pts, dx:dx, dz:dz, yG:yG, g0:pts[pts.length-1] };
}
function flyStub(C){ var o = []; for(var m=10;m<=400;m+=10) o.push([C.g0.x+C.dx*m, C.yG, C.g0.z+C.dz*m]); return o; }
/* try a handful of azimuth/altitude variants; returns {path, curve, far:[x,y,z]} or null */
function flyRoute(B, sp, arriving, tries, nearOnly){
  for(var t=0; t<tries; t++){
    var low = (t%2) === 1, theta = (flyRand()*2-1)*(t < 3 ? 0.7 : 1.25), yOff = low ? -40+flyRand()*50 : arriving ? 30+flyRand()*90 : 50+flyRand()*100, gD = 380+flyRand()*110;
    var C = arriving ? flyArrCurve(B, sp, theta, yOff, gD) : flyDepCurve(B, sp, theta, yOff, gD);
    var h = flyCurveHit(C.curve, B, 50);
    if(h){ flyReject(h); continue; }
    var dist = flyEdge(C.g0.x, C.g0.z, C.dx, C.dz), fx = C.g0.x+C.dx*dist, fz = C.g0.z+C.dz*dist;
    if(!nearOnly){ h = flyLineHit(C.g0.x, C.yG, C.g0.z, fx, C.yG, fz, 15, 25, 0); if(h){ flyReject(h); continue; } }
    flyPathStats.accepted++;
    /* near-only: a 400 m stub beyond the gate, sampled every 10 m like the rest, so a peel-off can steer onto it */
    var far = nearOnly ? flyStub(C) : [[fx, C.yG, fz]], pts = [], i;
    if(arriving){ for(i=far.length-1;i>=0;i--) pts.push(far[i]); flyCurvePts(C.curve, 2.5, pts); }
    else { flyCurvePts(C.curve, 2.5, pts); for(i=0;i<far.length;i++) pts.push(far[i]); }
    var path = flyPathFromPts(pts, false); path.curve = C.curve; path.straight = nearOnly ? path.len - C.curve.getLength() : dist;
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
for(var flyI=0; flyI<5; flyI++){
  flyMesh[flyI] = flyMakeMesh(flyI, flyGeoms[flyI], flyI === FLY_R ? FLY_RCAP : FLY_CAP,
    nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, side:THREE.DoubleSide }), 'fly'+flyI, flySkinHook(flyBones[flyI])));
}
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

