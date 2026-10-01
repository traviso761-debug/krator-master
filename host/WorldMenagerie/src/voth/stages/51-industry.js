/* ==== 18b. WILDERNESS INDUSTRY ==== */
reseed(710001);

var INDUSTRY = { mine:0, quarry:0, mushroomFarm:0 };

/* ==== caravan delivery points, filled by the two builders below ==== */
var MINE_CART_STOPS = [];
var QUARRY_CART_STOPS = [];

/* ==== shared helper: measure the real local slope/gradient at a point, the ==== */
function siteSlope(x,z){
  var h = terrainH(x,z), st = 9;
  var h1 = terrainH(x+st,z), h2 = terrainH(x,z+st);
  var gx = (h1-h)/st, gz = (h2-h)/st;
  var glen = Math.hypot(gx,gz) || 1e-6;
  return { h:h, gx:gx, gz:gz, upX:gx/glen, upZ:gz/glen, rate:glen, slope:Math.min(1, glen*2.6) };
}

/* ==== MINE ENTRANCE ==== */
function mineEntrance(mx, mz, opt){
  opt = opt || {};
  var S = siteSlope(mx,mz);
  var h = S.h;

  var downX = -S.upX, downZ = -S.upZ;
  var ry = opt.ry !== undefined ? opt.ry : Math.atan2(-downZ, downX);

  var portalW = 9.5, portalH = 6.6, frameT = 1.2;
  var footFx = 16, footFz = 13;
  var rec = claim(mx, mz, footFx, footFz, ry, 'industry');
  if(!rec) return null;

  var timberCol = shade(TRUNKC[0], -0.08);
  var stoneCol  = pick(TONES);
  var voidCol   = shade(BASALTC[0], -0.05);

  var voidDepth = clamp((portalH*1.35) / Math.max(S.rate, 0.05), 16, 34);
  var voidC = loc(mx,mz, -voidDepth*0.5, 0, ry);
  BOX(voidC[0], h+0.05, voidC[1], voidDepth, portalH*0.94, portalW*0.86, ry, voidCol);

  [-1,1].forEach(function(s){
    var p = loc(mx,mz, frameT*0.5, s*portalW*0.5, ry);
    BOX(p[0], h, p[1], frameT, portalH, frameT, ry, timberCol, 'wood');
  });
  var lp = loc(mx,mz, frameT*0.5, 0, ry);
  BOX(lp[0], h+portalH, lp[1], frameT*1.3, 1.1, portalW+frameT*2, ry, shade(timberCol,-0.12), 'wood');
  BOX(lp[0], h+portalH+1.1, lp[1], frameT*1.7, 1.0, portalW+frameT*3.4, ry, shade(stoneCol,-0.10));  /* stone reinforcing cap */

  [-1,1].forEach(function(s){
    var p2 = loc(mx,mz, -2.4, s*(portalW*0.5+1.5), ry);
    CYL(p2[0], terrainH(p2[0],p2[1]), p2[1], 0.55, portalH*0.80, 0, shade(timberCol,-0.15), 'wood');
  });

  /* ore-cart rails running downhill (local +x) from the mouth, with sleepers */
  var railLen = 20, gauge = 2.0;
  [-1,1].forEach(function(s){
    var rp = loc(mx,mz, railLen*0.5, s*gauge*0.5, ry);
    BOX(rp[0], h+0.05, rp[1], railLen, 0.16, 0.22, ry, 0x565049, 'metal');
  });
  for(var i=0;i<9;i++){
    var t = (i+0.5)/9*railLen;
    var sp = loc(mx,mz, t, 0, ry);
    var sy = terrainH(sp[0],sp[1]);
    BOX(sp[0], sy, sp[1], 0.9, 0.16, gauge+0.8, ry, shade(timberCol,-0.2), 'wood');
  }

  /* a small ore cart, partway down the rails */
  var cp = loc(mx,mz, railLen*0.60, 0, ry);
  var cy = terrainH(cp[0],cp[1]);
  BOX(cp[0], cy+0.55, cp[1], 1.9, 1.0, 1.5, ry, 0x5a544c, 'metal');
  [[-0.8,-0.65],[-0.8,0.65],[0.8,-0.65],[0.8,0.65]].forEach(function(w){
    var wp = loc(cp[0], cp[1], w[0], w[1], ry);
    CYL(wp[0], cy+0.24, wp[1], 0.28, 0.30, 0, 0x2c2a28, 'metal');
  });

  var wb = loc(mx,mz, 1.6, portalW*0.5+3.6, ry);
  var wy = terrainH(wb[0],wb[1]);
  var winchH = portalH*1.30, armLen = winchH*0.55;
  CYL(wb[0], wy, wb[1], 0.5, winchH, 0, shade(timberCol,-0.2), 'wood');
  var armMid = loc(wb[0], wb[1], -armLen*0.5, 0, ry);
  BOX(armMid[0], wy+winchH*0.90, armMid[1], armLen, 0.42, 0.42, ry, shade(timberCol,-0.2), 'wood');
  CYL(wb[0], wy+winchH*0.55, wb[1], 0.45, 0.7, 0, 0x3a3630, 'metal');   /* winding drum */

  /* spoil heap of loose rubble, opposite the winch */
  var heapC = loc(mx,mz, 3.4, -(portalW*0.5+5.5), ry);
  for(var k=0;k<10;k++){
    var op = loc(heapC[0], heapC[1], rr(-4.5,4.5), rr(-4.5,4.5), ry);
    var bs = rr(1.0,2.5);
    BOX(op[0], terrainH(op[0],op[1]), op[1], bs, bs*rr(0.5,0.9), bs*rr(0.7,1.15), rr(0,Math.PI*2), shade(stoneCol,-0.18));
  }

  var stop = loc(mx,mz, railLen+4, 0, ry);
  MINE_CART_STOPS.push({ x:stop[0], z:stop[1], ry: Math.atan2(S.upX, S.upZ), mouthX:mx, mouthZ:mz });

  INDUSTRY.mine++;
  return rec;
}

/* ==== QUARRY ==== */
function quarryPit(qx, qz, opt){
  opt = opt || {};
  var S = siteSlope(qx,qz);
  var downX = -S.upX, downZ = -S.upZ;
  var ry = opt.ry !== undefined ? opt.ry : Math.atan2(-downZ, downX);

  var R      = opt.rim   || 66;                 /* outer rim radius         */
  var tiers  = opt.tiers || 5;                  /* benches, floor -> rim    */
  var floorR = R*0.235;                         /* working floor radius     */
  var band   = (R - floorR)/tiers;              /* radial width of a bench  */
  var riser  = band*0.78;                       /* step between benches     */
  var rimSt  = tiers*riser;                     /* rim stands this far up   */
  var aprN   = 3, aband = band*0.95;            /* spoil terraces outside   */
  var Rtoe   = R + aprN*aband + band*1.2;       /* where the ramp meets grade */

  var rec = claim(qx, qz, R/Math.SQRT2, R/Math.SQRT2, ry, 'industry');
  if(!rec) return null;

  var outSweep = 2.0, inSweep = 5.2;
  var toeA  = opt.toeA !== undefined ? opt.toeA : Math.atan2(downZ, downX);
  var rampA = toeA + outSweep;

  var rockCol = pick(TONES);
  function ptAt(r,a){ return [qx + r*Math.cos(a), qz + r*Math.sin(a)]; }
  function angDiff(a,b){ var d=(a-b)%(Math.PI*2); if(d>Math.PI)d-=Math.PI*2; if(d<-Math.PI)d+=Math.PI*2; return d; }

  function rampAngleAt(r){
    return r <= R ? rampA + inSweep*(R-r)/(R-floorR)
                  : rampA - outSweep*(r-R)/(Rtoe-R);
  }
  function rampStandAt(r){
    return r <= R ? (r-floorR)/band*riser
                  : rimSt*(1 - (r-R)/(Rtoe-R));
  }

  /* ==== one terrace ring: an annulus of boxes whose tops all stand the ==== */

  function smoothH(x,z,r){
    return (terrainH(x,z) + terrainH(x+r,z) + terrainH(x-r,z)
                          + terrainH(x,z+r) + terrainH(x,z-r))/5;
  }
  var talus = [];
  function terrace(ri, ro, stand, col, spallStand, rough){
    var rm = (ri+ro)/2, w = ro-ri;
    var nseg = Math.max(10, Math.round(2*Math.PI*rm/16));
    var chord = 2*Math.PI*rm/nseg;
    var aR = rampAngleAt(rm), half = (w*0.62 + chord*0.5)/rm;
    for(var s=0;s<nseg;s++){
      var a = (s+0.5)/nseg*Math.PI*2;
      if(Math.abs(angDiff(a,aR)) < half) continue;          /* the ramp's own cut */

      var st = rough ? stand*rr(0.92,1.08) : stand;
      var rd = rough ? rm + rr(-w*0.07, w*0.07) : rm;
      var p = ptAt(rd,a), ty = smoothH(p[0],p[1], w*0.5) + st;
      var h = st + w*0.9 + 3;
      BOX(p[0], ty-h, p[1], w*1.03, h, chord*1.10, -a, shade(col, rr(-0.035,0.035)));
      if(s % 3 === 1 && spallStand >= 0){                   /* spall at the riser's foot */
        var q = ptAt(ri - w*0.34, a + rr(-0.06,0.06));
        talus.push([q[0], q[1], rr(1.3,3.1), col, spallStand]);
      }
    }
  }

  /* five benches stepping down into the pit */
  for(var i=tiers;i>=1;i--)
    terrace(floorR+(i-1)*band, floorR+i*band, i*riser, shade(rockCol,-0.04-i*0.035), (i-1)*riser, false);
  /* three spoil terraces stepping back down outside the rim */
  for(var j=1;j<=aprN;j++)
    terrace(R+(j-1)*aband, R+j*aband, rimSt*(1 - j/(aprN+0.55)), shade(rockCol,-0.10-j*0.045), -1, true);
  talus.forEach(function(t){
    BOX(t[0], terrainH(t[0],t[1])+t[4], t[1], t[2], t[2]*rr(0.45,0.85), t[2]*rr(0.7,1.2),
        rnd()*6.283, shade(t[3],-0.14));
  });

  /* ==== the haul ramp itself: a continuous spiral roadbed from the floor ==== */
  var RN = 34, prevP = null, prevY = 0;
  for(var k=0;k<=RN;k++){
    var rr_ = floorR + (Rtoe-floorR)*k/RN;
    var ar = rampAngleAt(rr_);
    var pr = ptAt(rr_, ar);
    var yr = smoothH(pr[0],pr[1], band*0.5) + rampStandAt(rr_);
    if(prevP){
      var mx_=(pr[0]+prevP[0])/2, mz_=(pr[1]+prevP[1])/2;
      var L = Math.hypot(pr[0]-prevP[0], pr[1]-prevP[1]);
      var segRy = Math.atan2(-(pr[1]-prevP[1]), pr[0]-prevP[0]);
      var yt = (yr+prevY)/2;
      var hh = Math.max(2.5, yt - terrainH(mx_,mz_) + 4);
      BOX(mx_, yt-hh, mz_, L*1.14, hh, band*1.15, segRy, shade(rockCol,-0.01));
      if(k % 2 === 0){                                      /* kerb of spoil, open side */
        var ke = [mx_ + Math.cos(ar)*band*0.68, mz_ + Math.sin(ar)*band*0.68];
        BOX(ke[0], yt, ke[1], L*0.92, rr(1.0,2.0), 1.7, segRy, shade(rockCol,-0.24));
      }
    }
    prevP = pr; prevY = yr;
  }

  /* ==== the working floor: real, untouched ground, dressed with cut pads, ==== */
  for(var f=0;f<4;f++){
    var fa = f/4*Math.PI*2 + 0.4, fp = ptAt(floorR*0.55, fa);
    BOX(fp[0], terrainH(fp[0],fp[1])-0.3, fp[1], floorR*0.85, 0.5, floorR*0.85, -fa, shade(rockCol,0.05));
  }
  for(var rb=0;rb<12;rb++){
    var ra_ = rnd()*Math.PI*2, rp = ptAt(rr(2, floorR*0.95), ra_), rs = rr(0.9,2.4);
    BOX(rp[0], terrainH(rp[0],rp[1]), rp[1], rs, rs*rr(0.5,0.95), rs*rr(0.7,1.2),
        rnd()*6.283, shade(rockCol,-0.16));
  }
  [[0.58,1.9],[0.64,4.4]].forEach(function(b){
    var bp = ptAt(floorR*b[0], b[1]), by = terrainH(bp[0],bp[1]);
    FR6(bp[0], by, bp[1], 7.0, riser*1.45, 6.2, b[1], shade(rockCol,-0.06));
    BOX(bp[0], by+riser*1.40, bp[1], 5.8, 1.3, 5.0, b[1], shade(rockCol,-0.12));
  });

  for(var sw=0;sw<22;sw++){
    var sa2 = rnd()*Math.PI*2;
    if(Math.abs(angDiff(sa2, rampA - outSweep*0.5)) < 0.4) continue;
    var sp2 = ptAt(R + rr(2, aprN*aband), sa2), ss = rr(1.6,4.2);
    BOX(sp2[0], smoothH(sp2[0],sp2[1],aband*0.5) + rimSt*rr(0.10,0.55), sp2[1],
        ss, ss*rr(0.45,0.85), ss*rr(0.7,1.2), rnd()*6.283, shade(rockCol,-0.24));
  }

  /* ==== waste tips further out, downhill of the pit ==== */
  for(var tp=0;tp<3;tp++){
    var ta = Math.atan2(downZ,downX) + (tp-1)*0.66;
    var tpp = ptAt(Rtoe + rr(12,30), ta);

    FR6(tpp[0], terrainH(tpp[0],tpp[1])-2.5, tpp[1], rr(38,56), rr(6,11), rr(32,48), -ta, shade(rockCol,-0.13));
    for(var tq=0;tq<3;tq++){
      var tqq = ptAt(Rtoe + rr(4,40), ta + rr(-0.3,0.3)), ts = rr(2.2,4.8);
      BOX(tqq[0], terrainH(tqq[0],tqq[1]), tqq[1], ts, ts*rr(0.5,0.9), ts*rr(0.7,1.2),
          rnd()*6.283, shade(rockCol,-0.2));
    }
  }

  /* ==== rim and floor works: jib cranes (the same mast+arm silhouette the ==== */
  function jib(px,pz,baseY,faceRy,craneH){
    CYL(px, baseY, pz, 0.85, craneH, 0, shade(TRUNKC[0],-0.2), 'wood');
    var am = [px + Math.cos(faceRy)*craneH*0.42, pz - Math.sin(faceRy)*craneH*0.42];
    BOX(am[0], baseY+craneH*0.92, am[1], craneH*0.85, 0.55, 0.55, faceRy, shade(TRUNKC[0],-0.2), 'wood');
    CYL(px, baseY+craneH*0.52, pz, 0.5, 0.8, 0, 0x3a3630, 'metal');
  }
  var rimR = R - band*0.5;                       /* centre of the rim bench */
  [0.42,-0.46].forEach(function(off,ci){
    var cp = ptAt(rimR, rampA + off);
    jib(cp[0], cp[1], terrainH(cp[0],cp[1])+rimSt, -(rampA+off+Math.PI), ci?16:19);
  });
  var bp0 = ptAt(rimR, rampA + 0.86), b0y = terrainH(bp0[0],bp0[1]) + rimSt;
  for(var r2=0;r2<3;r2++) for(var c2=0;c2<4;c2++){
    var ob = [bp0[0] + Math.cos(rampA)*(r2*3.0-3.0) + Math.cos(rampA+1.5708)*(c2*2.7-4.0),
              bp0[1] + Math.sin(rampA)*(r2*3.0-3.0) + Math.sin(rampA+1.5708)*(c2*2.7-4.0)];
    BOX(ob[0], b0y, ob[1], 2.6, 1.9, 2.2, -rampA, pick(STALKC));
  }
  var kp = ptAt(rimR, rampA - 0.90), ky = terrainH(kp[0],kp[1]) + rimSt;
  BOX(kp[0], ky+0.7, kp[1], 3.4, 1.4, 2.2, -rampA, 0x5a544c, 'metal');
  [[-1.3,-0.95],[-1.3,0.95],[1.3,-0.95],[1.3,0.95]].forEach(function(w){
    var wp = [kp[0] + Math.cos(rampA)*w[0] + Math.cos(rampA+1.5708)*w[1],
              kp[1] + Math.sin(rampA)*w[0] + Math.sin(rampA+1.5708)*w[1]];
    CYL(wp[0], ky+0.3, wp[1], 0.42, 0.34, 0, 0x2c2a28, 'metal');
  });
  var footA = rampAngleAt(floorR), fp2 = ptAt(floorR*0.78, footA);
  jib(fp2[0], fp2[1], terrainH(fp2[0],fp2[1]), -(footA+Math.PI), 13);
  for(var tk=0;tk<5;tk++){
    var tkp = ptAt(floorR*0.70, footA + 0.55 + tk*0.11);
    BOX(tkp[0], terrainH(tkp[0],tkp[1])+(tk%2)*0.55, tkp[1], 6.5, 0.5, 0.5, -footA,
        shade(TRUNKC[0],-0.14), 'wood');
  }

  var toeP = ptAt(Rtoe + 8, toeA);
  QUARRY_CART_STOPS.push({ x:toeP[0], z:toeP[1],
                           ry: Math.atan2(-Math.cos(toeA), -Math.sin(toeA)), pitX:qx, pitZ:qz });

  INDUSTRY.quarry++;
  return rec;
}

/* ==== MUSHROOM FARM ==== */
function mushroomFarm(fx0, fz0, ry, opt){
  opt = opt || {};
  var y = terrainH(fx0,fz0);
  var rows = 4, cols = 5, spacing = 5.4;
  var plotFx = (cols-1)*spacing*0.5 + 3.5, plotFz = (rows-1)*spacing*0.5 + 3.5;

  var rec = claim(fx0, fz0, plotFx+9, plotFz+9, ry, 'industry');
  if(!rec) return null;

  var stalkCol = pick(STALKC), fenceCol = shade(TRUNKC[0], -0.1);

  /* rows of cultivated specimens */
  var n = 0;
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var lx = -plotFx+3.5 + c*spacing + rr(-0.7,0.7);
      var lz = -plotFz+3.5 + r*spacing + rr(-0.7,0.7);
      var p = loc(fx0,fz0, lx, lz, ry);
      var py = terrainH(p[0],p[1]);
      var sh = rr(2.8,4.8), sr = rr(0.34,0.52);
      STK(p[0], py, p[1], sr, sh, 0, stalkCol, 'fungus');
      var cr = sr*rr(2.6,3.4);
      BLOB(p[0], py+sh-0.4, p[1], cr, cr*rr(0.52,0.76), rnd()*3, pick(FUNGC), 'fungus');
      n++;
    }
  }

  for(var k=0;k<3;k++){
    var rz = -plotFz + 5 + k*7.5;
    var pA = loc(fx0,fz0, plotFx+2.2, rz-1.6, ry), pB = loc(fx0,fz0, plotFx+2.2, rz+1.6, ry);
    var ry_ = terrainH(pA[0],pA[1]);
    CYL(pA[0], ry_, pA[1], 0.22, 2.6, 0, fenceCol, 'wood');
    CYL(pB[0], ry_, pB[1], 0.22, 2.6, 0, fenceCol, 'wood');
    BOX((pA[0]+pB[0])/2, ry_+2.5, (pA[1]+pB[1])/2, 0.5, 0.22, 3.6, ry, fenceCol, 'wood');
  }

  /* tender's hut, facing back onto the plot */
  var hp = loc(fx0,fz0, plotFx+8.5, 0, ry);
  var hy = terrainH(hp[0],hp[1]);
  structure(hp[0], hy, hp[1], 3.0, 2.6, 4.0, ry+Math.PI, 'hovel', pick(TONES_POOR), {poor:true});
  var dp = loc(hp[0], hp[1], -3.0, 0, ry+Math.PI);
  BOX(dp[0], hy, dp[1], 0.3, 2.2, 1.3, ry+Math.PI, shade(fenceCol,-0.3), 'wood');

  /* low perimeter fence: 8 posts + straight rails between consecutive posts */
  var corners = [
    [-plotFx,-plotFz],[0,-plotFz],[plotFx,-plotFz],
    [plotFx,0],[plotFx,plotFz],[0,plotFz],[-plotFx,plotFz],[-plotFx,0]
  ];
  var wp = corners.map(function(o){ return loc(fx0,fz0, o[0], o[1], ry); });
  for(var i=0;i<wp.length;i++){
    var py2 = terrainH(wp[i][0], wp[i][1]);
    CYL(wp[i][0], py2, wp[i][1], 0.16, 1.5, 0, fenceCol, 'wood');
    var j = (i+1) % wp.length;
    var mx2 = (wp[i][0]+wp[j][0])/2, mz2 = (wp[i][1]+wp[j][1])/2;
    var segLen = Math.hypot(wp[j][0]-wp[i][0], wp[j][1]-wp[i][1]);
    var segRy = Math.atan2(-(wp[j][1]-wp[i][1]), wp[j][0]-wp[i][0]);
    var my2 = terrainH(mx2,mz2);
    BOX(mx2, my2+1.1, mz2, segLen*0.98, 0.16, 0.16, segRy, fenceCol, 'wood');
  }

  INDUSTRY.mushroomFarm = n;
  return rec;
}

/* ==== placements: one instance of each, at the real sites noted above ==== */
mineEntrance(-1830, -90, {});

mushroomFarm(1230, 1800, Math.atan2(-(1756.96-1800), 1150.45-1230), {});

(function(){
  var bD = polyBounds(INFILL_D);
  var ns = nearestStreet(bD.cx, bD.cz);
  var mry = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : 0;
  var farm = mushroomFarm(bD.cx, bD.cz, mry, {});
  var built = scatterTownBuildings(INFILL_D, 9, 0.5);
  window._infillD = { farmPlaced: !!farm, buildings: built };
})();

var INFILL_G = [[2112.0,-1206.4],[2303.3,-1199.1],[2276.4,-904.1],[2103.7,-602.4],
  [2048.1,-174.6],[1867.9,-143.9],[1827.7,-374.2],[1809.0,-653.4],[1982.8,-804.0]];
(function(){
  var bG = polyBounds(INFILL_G);
  var pitch = 48, placed = 0, tried = 0;
  for(var gx=bG.x0; gx<bG.x1; gx+=pitch){
    for(var gz=bG.z0; gz<bG.z1; gz+=pitch){
      var x = gx+rr(0,pitch*0.4), z = gz+rr(0,pitch*0.4);
      if(!pointInPoly(x,z,INFILL_G)) continue;
      if(districtAt(x,z)) continue;
      if(terrainH(x,z) < 4) continue;
      tried++;
      if(!chance(0.70)) continue;
      var nsG = nearestStreet(x,z);
      var ryG = nsG ? Math.atan2(nsG.tangent[0], nsG.tangent[1]) : rnd()*Math.PI*2;
      if(mushroomFarm(x, z, ryG, {})) placed++;
    }
  }
  window._infillG = { placed: placed, tried: tried };
})();

[[2567,-1692],[2542,-1537]].forEach(function(p){
  mineEntrance(p[0], p[1], {});
});

[[2453.5,-1708.3],[2396.3,-1556.2],[2385.0,-1442.0]].forEach(function(p){
  mineEntrance(p[0], p[1], {});
});

function mushroomDensityFill(poly, density){
  var b = polyBounds(poly);
  var pitch = 48, placed = 0, tried = 0;
  for(var gx=b.x0; gx<b.x1; gx+=pitch){
    for(var gz=b.z0; gz<b.z1; gz+=pitch){
      var x = gx+rr(0,pitch*0.4), z = gz+rr(0,pitch*0.4);
      if(!pointInPoly(x,z,poly)) continue;
      if(districtAt(x,z)) continue;
      if(terrainH(x,z) < 4) continue;
      tried++;
      if(!chance(density)) continue;
      var ns = nearestStreet(x,z);
      var ry = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : rnd()*Math.PI*2;
      if(mushroomFarm(x, z, ry, {})) placed++;
    }
  }
  return { placed: placed, tried: tried };
}
var MUSH_POLY_H = [[2111.2,-1082.8],[2189.6,-978.4],[2090.9,-779.5],[2014.2,-737.7],[1960.2,-688.4],
  [1927.7,-608.6],[1898.9,-501.2],[1909.8,-396.0],[1925.2,-304.3],[1939.7,-194.0],[1850.3,-200.6],
  [1857.2,-321.6],[1829.9,-385.3],[1813.1,-474.9],[1804.0,-554.1],[1792.2,-583.0],[1894.5,-736.0],[1980.2,-839.7]];
var MUSH_POLY_I = [[1931.0,1429.4],[2262.5,1398.7],[2528.8,1413.8],[2653.6,1628.0],[2599.6,1652.2],
  [2291.0,1610.4],[2127.0,1560.2]];
var MUSH_POLY_J = [[1917.8,1701.3],[1854.8,1787.0],[1698.9,1690.8],[1516.3,1534.8],[1528.3,1481.2]];
window._mushroomFillH = mushroomDensityFill(MUSH_POLY_H, 0.70);
window._mushroomFillI = mushroomDensityFill(MUSH_POLY_I, 0.70);
window._mushroomFillJ = mushroomDensityFill(MUSH_POLY_J, 0.70);

(function(){
  var acx=-1289.5, acz=-429.7, ary=-0.3804488853624944;

  var spots = [[-120,-50],[110,-20],[70,108]];
  var placed = 0;
  spots.forEach(function(s){
    var p = loc(acx,acz, s[0], s[1], ary);
    var ns = nearestStreet(p[0],p[1]);
    var ry2 = ns ? Math.atan2(ns.tangent[0], ns.tangent[1]) : ary;
    if(mushroomFarm(p[0], p[1], ry2, {})) placed++;
  });
  window._mushroomFillAbbey = { placed: placed, tried: spots.length };
})();

/* ==== QUARRY LABORER SETTLEMENTS ==== */
reseed(710501);
var QUARRY_SITES = [

  { x:2758.5, z:-715.3, gx:2743.5, gz:-820.6 },
  { x:2547.4, z:-840.9, gx:2654.8, gz:-829.7 },
  { x:2728.4, z:-925.8, gx:2743.5, gz:-820.6 }
];

var QUARRY_EXEMPT = [];
var QUARRY_LABORER_HOUSES = [];
QUARRY_SITES.forEach(function(site){

  var rec = quarryPit(site.x, site.z, { toeA: Math.atan2(site.gz-site.z, site.gx-site.x) });
  site.built = !!rec;
  QUARRY_EXEMPT.push([site.x, site.z, 150]);   /* pit + spoil aprons + waste tips, measured */

  var houses = [], tries = 0, maxTries = 4*220;
  while(houses.length < 4 && tries < maxTries){
    tries++;
    var a = rnd()*Math.PI*2, r = rr(130, 270);
    var hx = site.x + Math.cos(a)*r, hz = site.z + Math.sin(a)*r;
    if(districtAt(hx,hz)) continue;
    if(terrainH(hx,hz) < 4) continue;
    if(inRiver(hx,hz,14)) continue;

    if(QUARRY_SITES.some(function(q){ return Math.hypot(hx-q.x, hz-q.z) < 115; })) continue;
    if(!townBuilding(hx, hz, false, false)) continue;
    var hrec = PLACED[PLACED.length-1];

    townFacade(hrec);

    var dp = loc(hrec.x, hrec.z, hrec.fx, 0, hrec.ry);
    houses.push({ x:hrec.x, z:hrec.z, doorX:dp[0], doorZ:dp[1], ry:hrec.ry,
                  quarryX:site.x, quarryZ:site.z });
    QUARRY_EXEMPT.push([hrec.x, hrec.z, 38]);   /* house + its own facade spread */
  }
  site.housesPlaced = houses.length;
  houses.forEach(function(h){ QUARRY_LABORER_HOUSES.push(h); });
});
window._quarryLaborers = {
  sites: QUARRY_SITES.map(function(s){ return {x:s.x,z:s.z,built:s.built,housesPlaced:s.housesPlaced}; }),
  totalHouses: QUARRY_LABORER_HOUSES.length,
  exemptDiscs: QUARRY_EXEMPT.length
};
window._quarryExempt = QUARRY_EXEMPT;

window._industryCartStops = { mine: MINE_CART_STOPS, quarry: QUARRY_CART_STOPS };

window._industry = INDUSTRY;
