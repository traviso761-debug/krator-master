/* ==== 12. SPANS ==== */

/* a pylon rising out of a canton to carry a bridge deck */

function landing(c, ax, az, ry, w, foot){
  var spring = CANTON_TOPS[c.n].spring;
  FR8(ax, spring-3, az, w*1.85, DECK-spring+4, w*2.3, ry, shade(c.tone,0.02));
  BOX(ax, DECK+1.0, az, w*2.05, 2.8, w*2.6, ry, shade(c.tone,-0.18));
  [-1,1].forEach(function(s2){
    var p = loc(ax,az, 0, s2*w*1.15, ry);
    FR3(p[0], DECK+3.8, p[1], w*0.44, w*1.5, w*0.44, ry, shade(c.tone,0.04));
  });

  var top = CANTON_TOPS[c.n];

  var targetY = (top.bridgeY !== undefined) ? top.bridgeY : (top.entryY !== undefined) ? top.entryY : top.y;
  var targetHw = (top.bridgeHw !== undefined) ? top.bridgeHw : (top.entryHw !== undefined) ? top.entryHw : top.hw;
  var toPx = ax-c.x, toPz = az-c.z, toPL = Math.hypot(toPx,toPz) || 1;
  var ex = c.x + toPx/toPL*targetHw, ez = c.z + toPz/toPL*targetHw;
  if(foot){ ex = foot[0]; ez = foot[1]; }
  linkStair(ax, az, DECK+2.4, ex, ez, targetY, w*0.85);
  window._landingStairs = window._landingStairs || [];
  window._landingStairs.push({canton:c.n, ax:ax,az:az,ay:DECK+2.4, ex:ex,ez:ez,ey:targetY});

  var arr = cantonArrivalLevel(c.n, targetY + 1.5);
  if(arr && arr.top){
    var ang = Math.atan2(ax-c.x, az-c.z);
    var got = cantonTopDescent(c, ang, w);
    window._cantonBridgeDoors = window._cantonBridgeDoors || [];
    window._cantonBridgeDoors.push({canton:c.n, ang:got?got.ang:ang, placed:!!got,
                                     y:got?got.y:null, hw:got?got.hw:null});
  }
}

var BRIDGE_SUPPORTS = [];
function span(ax,az,ay, bx,bz,by, w, col, arch, parapet){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/20));
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n;
    var x=ax+dx*t, z=az+dz*t;
    var y = mix(ay,by,t) + arch*Math.sin(Math.PI*t);
    BOX(x, y-2.8, z, w, 3.0, L/n*1.09, ry, col);
    if(parapet){
      var pl = loc(x,z,  w*0.5-0.8, 0, ry), pr = loc(x,z, -(w*0.5-0.8), 0, ry);
      BOX(pl[0], y+0.2, pl[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
      BOX(pr[0], y+0.2, pr[1], 1.5, 2.4, L/n*1.09, ry, shade(col,-0.18));
    }
  }
  var np = Math.max(1, Math.round(L/135));
  var supportT = [0];
  for(var k=1;k<=np;k++){
    var t2 = k/(np+1);
    var px = ax+dx*t2, pz = az+dz*t2;
    var yt = mix(ay,by,t2) + arch*Math.sin(Math.PI*t2) - 2.8;
    var bd = bedAt(px,pz);
    FR8(px, bd, pz, w*1.55, yt-bd, w*1.7, ry, shade(col,-0.22));
    BOX(px, yt-3.4, pz, w*1.85, 2.0, w*2.0, ry, shade(col,-0.30));

    BRIDGE_SUPPORTS.push({ x:px, z:pz, r: w*1.4 });
    supportT.push(t2);
  }
  supportT.push(1);

  for(var bi=0; bi<supportT.length-1; bi++){
    var tm = (supportT[bi]+supportT[bi+1])*0.5;
    var xm = ax+dx*tm, zm = az+dz*tm;
    var ym = mix(ay,by,tm) + arch*Math.sin(Math.PI*tm);
    [-1,1].forEach(function(side){
      var ep = loc(xm,zm, side*(w*0.5+1.6), 0, ry);
      var mountY = ym + 0.6, dropH = rr(9,14);
      BOX(ep[0], mountY-dropH, ep[1], 0.16, dropH, rr(4.5,6.5), ry, pick(BANNERC), 'cloth');
      window._bridgeBanners = window._bridgeBanners || [];
      window._bridgeBanners.push([Math.round(ep[0]), Math.round(mountY), Math.round(ep[1])]);
    });
  }
}

function reclaimedCauseway(ax,az, bx,bz, w, tone){
  var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz);
  if(L < 6) return;
  var ry = Math.atan2(dx,dz);
  var n = Math.max(6, Math.round(L/26));
  var segL = L/n*1.10;
  for(var i=0;i<n;i++){
    var t=(i+0.5)/n, x=ax+dx*t, z=az+dz*t;
    var bed = bedAt(x,z);
    FR8(x, bed, z, w, RLAND-bed, segL, ry, shade(tone,-0.20));             /* the fill */
    BOX(x, RLAND-0.5, z, w*0.94, 1.2, segL*0.98, ry, shade(tone,-0.32));   /* the road surface */
    [-1,1].forEach(function(side){
      var p = loc(x,z, side*(w*0.5-1.1), 0, ry);
      BOX(p[0], RLAND+0.7, p[1], 2.2, 2.6, segL*0.98, ry, shade(tone,-0.10));  /* revetment lip */
    });
  }
}

/* ==== 13. BUILD ==== */

reseed(31337);
CANTONS.forEach(function(c){ if(c.kind==='mono') monoCanton(c); else if(c.n==='Ancestry') ancestryCanton(c); else platCanton(c); });

reseed(777);
SPANS.forEach(function(p){
  var A=CANTONS[p.a], B=CANTONS[p.b];
  var dx=B.x-A.x, dz=B.z-A.z, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
  var w = rr(12,17);
  /* land on the canton faces, and carry the deck on a pylon at each end */
  var ax = A.x+ux*A.r*0.94, az = A.z+uz*A.r*0.94;
  var bx = B.x+ -ux*B.r*0.94, bz = B.z+ -uz*B.r*0.94;

  var pa = palaceLandingShift(A, ax, az), pb = palaceLandingShift(B, bx, bz);
  if(pa){ ax = pa.x; az = pa.z; }
  if(pb){ bx = pb.x; bz = pb.z; }
  var ry = (pa || pb) ? Math.atan2(bx-ax, bz-az) : Math.atan2(dx,dz);
  landing(A, ax, az, ry, w, pa && pa.foot);
  landing(B, bx, bz, ry, w, pb && pb.foot);
  span(ax,az,DECK, bx,bz,DECK, w, TONES[0], Math.min(20, L*0.055), true);   /* was a local 0xb3a68a literal — reads from the gray-brown palette now */
});

/* causeways: every rim canton is tied to the shore by a low level roadway */
reseed(2468);
CAUSEWAYS.forEach(function(cw){
  var c = cw.c;

  var cwTone = c.fortress ? TONES[0] : c.tone;

  window._causewayTone = window._causewayTone || {};
  window._causewayTone[c.n] = { tone: c.tone, cwTone: cwTone, solid: !!cw.solid };
  var land = shoreIn(cw.s, 26);
  var dx=land[0]-c.x, dz=land[1]-c.z, L=Math.hypot(dx,dz);
  if(L < c.r + 40) return;
  var ax = c.x + dx/L*c.r*0.96, az = c.z + dz/L*c.r*0.96;
  var top = CANTON_TOPS[c.n].y;
  var ry = Math.atan2(dx,dz);

  /* ==== the causeway door, 3rd pass ==== */
  var rw = cw.solid ? (c.port ? 60 : rr(40,52)) : 0;
  var w  = cw.solid ? 0 : (c.port ? 22 : rr(13,18));
  var deckY = cw.solid ? RLAND+0.7 : CWAY+0.8;      /* the road/deck surface a walker is actually on */
  var arr = cantonArrivalLevel(c.n, deckY);
  if(arr){
    var abut = cw.solid ? rw*0.30 : w*0.85;         /* the FR8 abutment's own half-width */
    var dAng = bearingBeside(ry, abut + 8, squareEdgeHw(arr.hw, ry));
    var dHw  = squareEdgeHw(arr.hw, dAng);
    var dTier = CANTON_FACES[c.n].tiers[arr.tier];
    plinthDoor(c.x, c.z, dAng, arr.y, dHw, c.tone,
               { maxH: dTier ? Math.min(8, dTier.th - 2.4) : 7,
                 lean: dTier ? faceLean(dTier, dAng) : 0 });
    inspectClaim(c.x + Math.sin(dAng)*dHw, c.z + Math.cos(dAng)*dHw, 7, 5, dAng,
                 'cantonDoor', 'Canton door');
    if(arr.y > deckY + 1.2){

      var uRun = Math.max(6, (arr.y-deckY)*1.9), uR = squareEdgeHw(arr.outer, dAng);
      var uA = loc(c.x,c.z, 0, uR, dAng), uB = loc(c.x,c.z, 0, uR+uRun, dAng);
      linkStair(uA[0],uA[1], arr.y, uB[0],uB[1], deckY, Math.min(22, abut*1.1));
      inspectClaim((uA[0]+uB[0])*0.5, (uA[1]+uB[1])*0.5, Math.min(22,abut*1.1)*0.5, uRun*0.5, dAng,
                   'cantonStair', 'Causeway stair');
    }else if(deckY > arr.y + 1.2){

      var rEnd = c.r*0.96, want = Math.max(10, (deckY-arr.y)*1.9);
      var inMax = rEnd - (dHw + 5);                          /* room inboard, before the wall */
      var outMax = squareEdgeHw(arr.outer, ry) - 3 - rEnd;   /* room outboard, before the lip */
      var sgn = 1, dRun = want;
      if(inMax >= want) sgn = -1;
      else if(outMax >= want) sgn = 1;
      else if(outMax >= inMax) dRun = Math.max(8, outMax);
      else { sgn = -1; dRun = Math.max(8, inMax); }
      var vA = loc(c.x,c.z, 0, rEnd, ry);
      var vB = loc(c.x,c.z, 0, rEnd + sgn*dRun, ry);
      linkStair(vA[0],vA[1], deckY, vB[0],vB[1], arr.y, Math.min(24, abut*1.2));
      inspectClaim((vA[0]+vB[0])*0.5, (vA[1]+vB[1])*0.5, Math.min(24,abut*1.2)*0.5, dRun*0.5, ry,
                   'cantonStair', 'Causeway stair');
    }
    window._cantonCausewayDoors = window._cantonCausewayDoors || [];
    window._cantonCausewayDoors.push({canton:c.n, y:arr.y, hw:dHw, ang:dAng, deckY:deckY, top:!!arr.top});
  }

  if(cw.solid){

    FR8(ax, RLAND-3, az, rw*0.60, top-RLAND+3, rw*0.84, ry, shade(c.tone,0.02));
    reclaimedCauseway(ax, az, land[0], land[1], rw, cwTone);
    reserve(land[0], land[1], 30, 30, 0);
    return;
  }

  /* a ramp down the canton flank to causeway level */
  FR8(ax, CWAY-2, az, w*1.7, top-CWAY+3, w*2.4, ry, shade(c.tone,0.02));
  var landY = Math.max(CWAY-6, terrainH(land[0],land[1])+2.5);
  if(cw.isle){
    /* the causeway steps across an islet: a paved platform with a shrine post */
    var I = cw.isle, iy = terrainH(I[0],I[1]);
    BOX(I[0], iy-1, I[1], 46, CWAY-iy+1, 46, ry, shade(c.tone,-0.12));
    BOX(I[0], CWAY-0.3, I[1], 50, 1.6, 50, ry, shade(c.tone,-0.26));
    FR3(I[0]+12, CWAY+1.3, I[1]+12, 4, 12, 4, ry, shade(c.tone,0.05));
    span(ax,az,CWAY, I[0],I[1],CWAY, w, TONES[0], 4, true);
    span(I[0],I[1],CWAY, land[0],land[1], landY, w, TONES[0], 4, true);
  }else{
    span(ax,az,CWAY, land[0],land[1], landY, w, TONES[0], 5, true);   /* was a local 0xada186 literal — gray-brown palette now */
  }
  reserve(land[0], land[1], 30, 30, 0);
});
