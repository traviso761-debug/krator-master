/* ==== TAVERN + BEER GARDEN ==== */
reseed(657001);

function tavernBarrel(x,y,z,col){
  var r = rr(0.5,0.68), h = rr(1.2,1.6);
  CYL(x, y, z, r, h, 0, col, 'wood');
  [0.12,0.5,0.86].forEach(function(t){
    CYL(x, y+h*t-0.07, z, r*1.04, 0.16, 0, shade(col,-0.32), 'metal');
  });
  return h;
}

function tavernTable(x,y,z,ry,col){
  var w = 2.2, d = 1.3, legH = 0.75;
  BOX(x, y+legH, z, w, 0.14, d, ry, col, 'wood');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){
    var p = loc(x,z, c[0]*w*0.42, c[1]*d*0.38, ry);
    BOX(p[0], y, p[1], 0.16, legH, 0.16, ry, shade(col,-0.2), 'wood');
  });
}

function tavern(x, y, z, ry, col, opt){
  opt = opt || {};
  var hallW = opt.hallW || 20, hallD = opt.hallD || 30;
  var h1 = opt.h1 || 9.5, h2 = opt.h2 || 6.5;
  var wallCol = col || pick(TONES);

  var TAVERN_ROOF_BLUE = 0x2f5a86;
  var roofCol = opt.roofCol || shade(TAVERN_ROOF_BLUE, -0.06);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.18);
  var doorCol = pick(TRUNKC);

  var y1 = y, y2 = y1+h1;
  var upperW = hallW*0.86, upperD = hallD;

  /* --- ground floor: the taproom hall --- */
  BOX(x, y1, z, hallW, h1, hallD, ry, wallCol);
  BOX(x, y1+h1-0.55, z, hallW*1.04, 1.0, hallD*1.04, ry, shade(wallCol,-0.13));   /* cornice */

  /* --- upper floor: guest rooms, stepped in slightly on the front/back --- */
  BOX(x, y2, z, upperW, h2, upperD, ry, shade(wallCol,0.03));
  var eaveY = y2+h2;
  BOX(x, eaveY, z, upperW*1.05, 0.9, upperD*1.05, ry, shade(wallCol,-0.16));      /* eave/parapet */

  var roofH = h1*0.75;
  FR8(x, eaveY+0.9, z, upperW*1.02, roofH, upperD*1.02, ry, roofCol, 'roof');

  var chimP = loc(x,z, -hallW*0.22, hallD*0.28, ry);
  var chimBaseY = eaveY-1.5, chimTopY = eaveY+0.9+roofH*0.55;
  CYL(chimP[0], chimBaseY, chimP[1], 0.85, chimTopY-chimBaseY, 0, shade(wallCol,-0.22));
  CYL(chimP[0], chimTopY, chimP[1], 1.05, 0.5, 0, shade(wallCol,-0.30));          /* cap */

  var tvJx=0, tvJz=0, tvPh=0, tvCol=0;
  for(var pf=0; pf<3; pf++){
    var jx = rr(-0.5,0.5)*pf, jz = rr(-0.5,0.5)*pf, sp = rnd()*3, gc = pick(GREYC);
    if(pf === 1){ tvJx = jx; tvJz = jz; tvPh = sp*2; tvCol = shade(gc, 0.10); }
  }
  registerSmokeEmitter(chimP[0]+tvJx*0.5, chimTopY+0.6, chimP[1]+tvJz*0.5, {
    kind:'tavern', n:8, life:6.0, rise:9.5, r0:0.40, r1:1.95,
    spread:0.34, sway:0.50, swirl:0.70, lean:0.60, phase:tvPh, col:tvCol
  });

  var signZ = hallD*0.30;
  var postP = loc(x,z, hallW*0.5, signZ, ry);
  CYL(postP[0], y1, postP[1], 0.18, h1*0.62, 0, shade(doorCol,-0.2), 'wood');
  var armY = y1+h1*0.60;
  var armP = loc(x,z, hallW*0.5+0.8, signZ, ry);
  BOX(armP[0], armY, armP[1], 1.6, 0.14, 0.14, ry, shade(doorCol,-0.15), 'wood');
  var hangP = loc(x,z, hallW*0.5+1.55, signZ, ry);
  CYL(hangP[0], armY-1.1, hangP[1], 0.05, 1.1, 0, shade(doorCol,-0.3), 'metal');
  BOX(hangP[0], armY-1.7, hangP[1], 0.12, 1.1, 1.5, ry, shade(pick(ROOFS),-0.05), 'wood');

  var stairSteps = 7, stepDepth = 1.3;
  var stairX0 = -hallW*0.06, stairX1 = hallW*0.30;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, h1*st);
    var sz = hallD*0.5 + stepDepth*0.5 + 0.15;
    var sp2 = loc(x,z, sx, sz, ry);
    BOX(sp2[0], y1, sp2[1], (stairX1-stairX0)/stairSteps*1.25, stepH, stepDepth, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorUpP = loc(x,z, stairX1, hallD*0.5+0.05, ry);
  BOX(doorUpP[0], y1+h1*0.90, doorUpP[1], 1.4, 2.4, 0.4, ry, doorCol, 'wood');

  var dw = 1.5, dh = 3.4;
  [-1,1].forEach(function(s){
    var dp = loc(x,z, hallW*0.5+0.05, s*dw*0.52, ry);
    BOX(dp[0], y1, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  });
  var lintelP = loc(x,z, hallW*0.5+0.08, 0, ry);
  BOX(lintelP[0], y1+dh, lintelP[1], 0.5, 0.5, dw*2.2, ry, frameCol);
  var gardenDoorP = loc(x,z, -hallW*0.5-0.05, 0, ry);
  BOX(gardenDoorP[0], y1, gardenDoorP[1], 0.5, 3.0, 1.8, ry, doorCol, 'wood');

  var winY1 = y1+h1*0.30;
  [-1,1].forEach(function(s){
    var wp = loc(x,z, hallW*0.5+0.05, s*hallD*0.30, ry);
    monasteryWindow(wp[0], wp[1], winY1, ry, 1.5, 2.4, true, frameCol, paneCol);
  });
  [-1,1].forEach(function(s){
    [-0.30, 0.12].forEach(function(t3){
      var wp2 = loc(x,z, hallW*t3, s*(hallD*0.5+0.05), ry);
      monasteryWindow(wp2[0], wp2[1], winY1, ry, 1.3, 2.1, false, frameCol, paneCol);
    });
  });
  var winY2 = y2+h2*0.30, nUpFront = 3;
  for(var i2=0;i2<nUpFront;i2++){
    var t4 = (i2-(nUpFront-1)/2)*(upperD*0.28);
    var wp3 = loc(x,z, upperW*0.5+0.05, t4, ry);
    monasteryWindow(wp3[0], wp3[1], winY2, ry, 1.2, 1.9, true, frameCol, paneCol);
  }
  [-1,1].forEach(function(s){
    var wp4 = loc(x,z, 0, s*(upperD*0.5+0.05), ry);
    monasteryWindow(wp4[0], wp4[1], winY2, ry, 1.2, 1.8, false, frameCol, paneCol);
  });

  /* ==== attached beer garden (local -x, behind the hall) ==== */
  var gardenDepth = opt.gardenDepth || 17, gardenW = opt.gardenW || hallD*1.05;
  var gcp = loc(x,z, -hallW*0.5-gardenDepth*0.5, 0, ry);
  var gardenCx = gcp[0], gardenCz = gcp[1];
  var half = gardenDepth*0.5;
  var fenceH = 1.1, fenceCol = shade(doorCol,-0.1);

  [-1,1].forEach(function(s){
    var p = loc(gardenCx,gardenCz, 0, s*gardenW*0.5, ry);
    BOX(p[0], y1, p[1], gardenDepth, fenceH, 0.25, ry, fenceCol, 'wood');
  });
  var farP = loc(gardenCx,gardenCz, -half, 0, ry);
  BOX(farP[0], y1, farP[1], 0.25, fenceH, gardenW, ry, fenceCol, 'wood');

  var trellisN = 4, postH = 2.6, beamY = y1+postH;
  for(var tp2=0; tp2<trellisN; tp2++){
    var tz = (tp2-(trellisN-1)/2)*(gardenW*0.20);
    [-1,1].forEach(function(sgn){
      var pp2 = loc(gardenCx,gardenCz, sgn*gardenDepth*0.28, tz, ry);
      CYL(pp2[0], y1, pp2[1], 0.16, postH, 0, fenceCol, 'wood');
    });
    var bp2 = loc(gardenCx,gardenCz, 0, tz, ry);
    BOX(bp2[0], beamY, bp2[1], gardenDepth*0.62, 0.14, 0.14, ry, fenceCol, 'wood');
  }
  for(var v=0; v<8; v++){
    var vx = gardenCx + rr(-gardenDepth*0.30, gardenDepth*0.30);
    var vz = gardenCz + rr(-gardenW*0.42, gardenW*0.42);
    BLOB(vx, beamY-0.3, vz, rr(0.4,0.8), rr(0.3,0.5), rnd()*3, pick(FRUITC), 'leaf');
  }

  /* tables + benches under the trellis */
  var nTables = 3;
  for(var tt=0; tt<nTables; tt++){
    var ttz = (tt-(nTables-1)/2)*(gardenW*0.26);
    var ttp = loc(gardenCx,gardenCz, 0, ttz, ry);
    tavernTable(ttp[0], y1, ttp[1], ry, shade(doorCol,-0.05));
    [-1,1].forEach(function(s){
      var bpP = loc(gardenCx,gardenCz, 0, ttz + s*1.1, ry);
      benchPlain(bpP[0], y1, bpP[1], ry, shade(doorCol,-0.1), {w:2.0});
    });
  }

  var barrelCol = shade(TRUNKC[0], -0.05);
  var bc1 = loc(gardenCx,gardenCz, -gardenDepth*0.36, gardenW*0.40, ry);
  var h0 = tavernBarrel(bc1[0], y1, bc1[1], barrelCol);
  tavernBarrel(bc1[0], y1+h0*0.92, bc1[1], barrelCol);
  var bc2 = loc(gardenCx,gardenCz, -gardenDepth*0.28, gardenW*0.32, ry);
  tavernBarrel(bc2[0], y1, bc2[1], barrelCol);

  /* potted shrubs along the near (hall-facing) fence line */
  for(var pl=0; pl<4; pl++){
    var plz = (pl-1.5)*(gardenW*0.22);
    var plP = loc(gardenCx,gardenCz, gardenDepth*0.46, plz, ry);
    BLOB(plP[0], y1+0.2, plP[1], rr(0.7,1.1), rr(0.7,1.0), rnd()*3, pick(FRUITC), 'leaf');
  }

  var doorThreshold = loc(x,z, hallW*0.5+0.3, 0, ry);
  return {
    x:x, z:z, ry:ry,
    fx: hallW*0.5+gardenDepth+1, fz: Math.max(hallD,gardenW)*0.5+2,
    gardenCx:gardenCx, gardenCz:gardenCz,
    doorX:doorThreshold[0], doorZ:doorThreshold[1]
  };
}

/* ==== HOUSE OF HEALING ==== */
reseed(658001);

function houseOfHealing(x, y, z, ry, col, opt){
  opt = opt || {};
  var outerHW = opt.hw || 56;           /* ~1/4 the footprint of the smallest real plat canton */
  var wallT = opt.wallT || 4.2;
  var wallCol = col || pick(TONES);

  var roofCol = opt.roofCol || shade(GREYC[1], -0.18);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(roofCol, 0.15);
  var plinthTop = opt.plinthTop || 6, tier0H = opt.tier0H || 13, tier1H = opt.tier1H || 9.5;
  var gateGapFrac = opt.gateGapFrac || 0.30;

  var cloisterHW = outerHW*0.62;            /* the arcade pier line — bounds the atrium */
  var gardenHW = cloisterHW*0.66;           /* the open lawn inside the pier line */

  FR8(x, y, z, outerHW*2*1.06, plinthTop, outerHW*2*1.06, ry, shade(wallCol,-0.24));
  BOX(x, y+plinthTop-1.2, z, outerHW*2*1.11, 2.2, outerHW*2*1.11, ry, shade(wallCol,-0.34));

  var y1 = y + plinthTop;                   /* atrium/garden/door floor level */
  var sideLen = outerHW*2;
  var gap = sideLen*gateGapFrac, segL = (sideLen-gap)*0.5, segCenterT = gap*0.5 + segL*0.5;

  for(var f=0; f<4; f++){
    var sideRy = ry + f*Math.PI/2;
    [-1,1].forEach(function(s){
      var o = loc(x,z, outerHW, s*segCenterT, sideRy);
      FR8(o[0], y1, o[1], wallT, tier0H, segL, sideRy, wallCol);
    });
    /* cornice band, doubling as the lintel bridging the gate opening below it */
    var cb = loc(x,z, outerHW, 0, sideRy);
    BOX(cb[0], y1+tier0H-0.6, cb[1], wallT*1.3, 1.3, sideLen*1.02, sideRy, shade(wallCol,-0.16));
    /* small arch flourish over the gate, on top of the cornice/lintel */
    var gp = loc(x,z, outerHW, 0, sideRy);
    DOME(gp[0], y1+tier0H+0.7, gp[1], gap*0.28, gap*0.15, sideRy, shade(wallCol,-0.08));
    /* pilasters flanking the real opening */
    [-1,1].forEach(function(s){
      var pp = loc(x,z, outerHW+0.4, s*(gap*0.5+1.0), sideRy);
      BOX(pp[0], y1, pp[1], wallT*0.5, tier0H*0.80, 1.6, sideRy, shade(wallCol,0.06));
    });

    var nSteps = 3;
    for(var si=0; si<nSteps; si++){
      var t = (si+1)/nSteps;
      var stepOut = outerHW + (nSteps-si)*1.4;
      var sp = loc(x,z, stepOut, 0, sideRy);
      BOX(sp[0], y, sp[1], 1.4, Math.max(0.5,plinthTop*t), gap*0.62, sideRy, shade(wallCol,-0.05));
    }

    var y2 = y1 + tier0H + 1.0;
    var tier1HW = outerHW*0.94;
    var t1p = loc(x,z, tier1HW, 0, sideRy);
    FR8(t1p[0], y2, t1p[1], wallT*0.9, tier1H, sideLen*0.96, sideRy, shade(wallCol,0.03));
    var nWin = 4;
    for(var wi=0; wi<nWin; wi++){
      var wt_ = (wi-(nWin-1)/2)*(sideLen*0.19);
      var wpOut = loc(x,z, tier1HW+0.05, wt_, sideRy);
      monasteryWindow(wpOut[0], wpOut[1], y2+tier1H*0.30, sideRy, 1.3, 2.0, true, frameCol, paneCol);
      var wpIn = loc(x,z, tier1HW-wallT*0.9-0.05, wt_, sideRy);
      monasteryWindow(wpIn[0], wpIn[1], y2+tier1H*0.30, sideRy, 1.2, 1.9, true, frameCol, paneCol);
    }
    var y3 = y2 + tier1H;
    var cb2 = loc(x,z, tier1HW, 0, sideRy);
    BOX(cb2[0], y3-0.5, cb2[1], wallT*1.3, 1.0, sideLen*0.98, sideRy, shade(wallCol,-0.18));

    var roofInner = cloisterHW + wallT*0.6, roofOuter = outerHW - wallT*0.5;
    var roofSpan = roofOuter - roofInner;
    if(roofSpan > 1){
      var roofMidT = (roofInner+roofOuter)*0.5;
      var rp = loc(x,z, roofMidT, 0, sideRy);
      FR8(rp[0], y1+tier0H-0.2, rp[1], roofSpan+1.0, 1.3, sideLen*0.96, sideRy, roofCol, 'roof');
    }
  }

  for(var cf=0; cf<4; cf++){
    var cAng = ry + cf*Math.PI/2;
    var cp = loc(x,z, outerHW-1, outerHW-1, cAng);
    FR8(cp[0], y1+tier0H+1.0, cp[1], 5.0, tier1H+3.0, 5.0, cAng, shade(wallCol,0.05));
    DOME(cp[0], y1+tier0H+1.0+tier1H+3.0, cp[1], 3.2, 2.6, cAng, pick(DOMEC), 'dome');
  }

  var courtSpan = cloisterHW*2;
  var archW = courtSpan/5, pierW = archW*0.22, archH = tier0H*0.82;
  var cloisterCol = shade(wallCol,0.02);
  [ {lx:0, lz:-courtSpan*0.5, along:'x'}, {lx:0, lz:courtSpan*0.5, along:'x'},
    {lx:-courtSpan*0.5, lz:0, along:'z'}, {lx:courtSpan*0.5, lz:0, along:'z'} ].forEach(function(side){
    var nBay = 5;
    for(var b=0;b<nBay;b++){
      var bt = (b-(nBay-1)/2) * archW;
      var pp = side.along==='x' ? loc(x,z, bt-archW*0.5+pierW*0.5, side.lz, ry)
                                 : loc(x,z, side.lx, bt-archW*0.5+pierW*0.5, ry);
      var pierRy = side.along==='x' ? ry : ry+Math.PI/2;
      BOX(pp[0], y1, pp[1], pierW, archH, wallT*0.75, pierRy, cloisterCol);
      var archP = side.along==='x' ? loc(x,z, bt, side.lz, ry) : loc(x,z, side.lx, bt, ry);
      DOME(archP[0], y1+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, cloisterCol);
    }
  });

  var gardenCx = x, gardenCz = z;

  var floorY = y1 + 1.05;
  var paveInner = cloisterHW + wallT*0.35, paveOuter = outerHW - wallT*0.5;
  var paveSpan = paveOuter - paveInner;
  if(paveSpan > 1){
    var paveCol = shade(wallCol,-0.10);
    for(var pv=0; pv<4; pv++){
      var pvRy = ry + pv*Math.PI/2;
      var pvp = loc(x,z, (paveInner+paveOuter)*0.5, 0, pvRy);
      BOX(pvp[0], floorY-0.30, pvp[1], paveSpan, 0.30, paveOuter*2*0.99, pvRy, paveCol);
    }
  }

  BOX(gardenCx, floorY-0.28, gardenCz, cloisterHW*2*0.99, 0.30, cloisterHW*2*0.99, ry, 0x7da24e, 'plaster');
  for(var g=0; g<12; g++){
    var ga = g*(Math.PI*2/12), gr = cloisterHW*0.74;   /* spread over the full lawn, not the old smaller patch */
    var gpp = loc(gardenCx,gardenCz, Math.cos(ga)*gr, Math.sin(ga)*gr, ry);
    BLOB(gpp[0], floorY+0.10, gpp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, pick(FRUITC), 'leaf');
  }
  monasteryWell(gardenCx, floorY, gardenCz, Math.min(2.4, gardenHW*0.12), ry);
  [-1,1].forEach(function(s){
    var bp = loc(gardenCx,gardenCz, 0, s*gardenHW*0.42, ry+Math.PI/2);
    benchPlain(bp[0], floorY+0.02, bp[1], ry+Math.PI/2, shade(wallCol,-0.1), {});
  });

  return { x:x, z:z, ry:ry, fx:outerHW+4, fz:outerHW+4, gardenCx:gardenCx, gardenCz:gardenCz };
}

/* ==== GRANARY / MILLS / BEETLE RANCH ==== */

/* ==== GRANARY ==== */
reseed(659001);

function granary(x, y, z, ry, col, opt){
  opt = opt || {};
  var granW = opt.w || 13, granD = opt.d || 10.5;
  var staddleH = opt.staddleH || 2.6, wallH = opt.wallH || 10.5, roofH = opt.roofH || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.10);
  var ventCol = shade(TRUNKC[0], -0.35);

  var nPx = 4, nPz = 3, postR = 0.42, postH = staddleH*0.74, capH = staddleH*0.22;
  for(var pi=0; pi<nPx; pi++){
    for(var pj=0; pj<nPz; pj++){
      var plx = (pi/(nPx-1)-0.5) * (granW*0.78);
      var plz = (pj/(nPz-1)-0.5) * (granD*0.72);
      var pp = loc(x,z, plx, plz, ry);
      CYL(pp[0], y, pp[1], postR, postH, 0, shade(wallCol,-0.10));
      CYL(pp[0], y+postH, pp[1], postR*2.0, capH, 0, shade(wallCol,-0.02));
    }
  }

  var yDeck = y + staddleH;
  BOX(x, yDeck, z, granW, 0.7, granD, ry, woodCol, 'wood');
  var y2 = yDeck + 0.7;

  /* --- storage mass: tall, almost windowless. ------------------------- */
  BOX(x, y2, z, granW*0.92, wallH, granD*0.92, ry, wallCol);
  BOX(x, y2+wallH-0.6, z, granW*0.96, 1.1, granD*0.96, ry, shade(wallCol,-0.14));   // cornice

  [ {lx: granW*0.46+0.05}, {lx:-granW*0.46-0.05} ].forEach(function(f){
    for(var vi=0; vi<3; vi++){
      var vt = (vi-1)*(granD*0.26);
      var vp = loc(x,z, f.lx, vt, ry);
      BOX(vp[0], y2+wallH*0.74, vp[1], 0.30, 1.5, 1.1, ry, ventCol, 'wood');
    }
  });
  [ {lz: granD*0.46+0.05}, {lz:-granD*0.46-0.05} ].forEach(function(f){
    for(var vi2=0; vi2<2; vi2++){
      var vt2 = (vi2-0.5)*(granW*0.32);
      var vp2 = loc(x,z, vt2, f.lz, ry);
      BOX(vp2[0], y2+wallH*0.74, vp2[1], 1.1, 1.5, 0.30, ry, ventCol, 'wood');
    }
  });

  /* --- steep pyramidal roof — strong taper (fr6). --------------------- */
  var eaveY = y2+wallH;
  FR6(x, eaveY, z, granW*1.02, roofH, granD*1.02, ry, roofCol, 'roof');

  var hoistY = y2 + wallH*0.62, doorH = 3.2;
  var hoistDp = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(hoistDp[0], hoistY, hoistDp[1], 0.5, doorH, 2.0, ry, shade(woodCol,-0.15), 'wood');
  var beamLen = 3.4, beamY = hoistY + doorH + 1.0;
  var beamP = loc(x,z, granW*0.46+beamLen*0.5, 0, ry);
  BOX(beamP[0], beamY, beamP[1], beamLen, 0.45, 0.45, ry, woodCol, 'wood');
  var pulleyP = loc(x,z, granW*0.46+beamLen-0.3, 0, ry);
  CYL(pulleyP[0], beamY-0.9, pulleyP[1], 0.22, 0.5, 0, shade(ventCol,0.15), 'metal');
  CYL(pulleyP[0], y2, pulleyP[1], 0.05, (beamY-0.9)-y2, 0, shade(ventCol,0.25), 'metal');   // rope down to loading level

  var doorP = loc(x,z, granW*0.46+0.06, 0, ry);
  BOX(doorP[0], yDeck, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var stairSteps = 6, stairX0 = granW*0.02, stairX1 = granW*0.40;
  for(var si=0; si<stairSteps; si++){
    var st = (si+0.5)/stairSteps;
    var sx = stairX0 + (stairX1-stairX0)*st;
    var stepH = Math.max(0.5, staddleH*st);
    var sz = granD*0.5 + 0.65 + 0.15;
    var sp = loc(x,z, sx, sz, ry);
    BOX(sp[0], y, sp[1], (stairX1-stairX0)/stairSteps*1.3, stepH, 1.3, ry, shade(wallCol,-0.08), 'wood');
  }
  var doorThreshold = loc(x,z, stairX1+1.0, granD*0.5+1.3, ry);

  return {
    x:x, z:z, ry:ry,
    fx: granW*0.5+1.0, fz: granD*0.5+2.2,
    doorX: doorThreshold[0], doorZ: doorThreshold[1]
  };
}

/* ==== MILL ANIMATION RIG ==== */
var MILL_CLUSTERS = [];      // { x,y,z, ry(axis), n, len, w, t, spin, phase, innerR, col }
var MILL_BLADE_BASE = [];    // parallel to MILL_CLUSTERS: each cluster's first instance slot
var MILL_TOTAL = 0, MILL_DIRTY = false, MILL_T = 0;

function registerMillCluster(x, y, z, axisRy, n, len, w, t, spin, innerR, col){
  MILL_CLUSTERS.push({ x:x, y:y, z:z, ry:axisRy, n:n, len:len, w:w, t:t,
                        spin:spin, phase:rr(0, Math.PI*2), innerR:innerR||0,
                        col: col || 0xffffff });
  MILL_DIRTY = true;
}

var millBarGeo = new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);   // pivot at base, tip at local y=1
var millMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
var millMesh = null;

function millRebuild(){
  if(millMesh) scene.remove(millMesh);   // millBarGeo/millMat are shared — never disposed here
  MILL_TOTAL = 0; MILL_BLADE_BASE = [];
  MILL_CLUSTERS.forEach(function(c){ MILL_BLADE_BASE.push(MILL_TOTAL); MILL_TOTAL += c.n; });
  MILL_DIRTY = false;
  if(MILL_TOTAL === 0){ millMesh = null; return; }
  millMesh = new THREE.InstancedMesh(millBarGeo, millMat, MILL_TOTAL);
  millMesh.userData.inspectLabel = 'Mill rotor';
  millMesh.frustumCulled = false;
  scene.add(millMesh);
}

var _milM = new THREE.Matrix4(), _milQ = new THREE.Quaternion(), _milS = new THREE.Vector3(1,1,1);
var _milP = new THREE.Vector3(), _milUp = new THREE.Vector3(0,1,0), _milTangent = new THREE.Vector3();
var _milDir = new THREE.Vector3(), _milCol = new THREE.Color();
function updateMills(dt){
  MILL_T += dt;
  if(MILL_DIRTY) millRebuild();
  if(!millMesh) return;   // dormant/no-op: nothing has ever registered
  MILL_CLUSTERS.forEach(function(c, ci){
    var base = MILL_BLADE_BASE[ci];

    _milTangent.set(Math.sin(c.ry), 0, Math.cos(c.ry));
    _milCol.set(c.col);
    for(var i=0;i<c.n;i++){
      var theta = c.phase + MILL_T*c.spin + i*(Math.PI*2/c.n);
      _milDir.copy(_milUp).multiplyScalar(Math.cos(theta)).addScaledVector(_milTangent, Math.sin(theta));
      _milQ.setFromUnitVectors(_milUp, _milDir);
      _milP.set(c.x + _milDir.x*c.innerR, c.y + _milDir.y*c.innerR, c.z + _milDir.z*c.innerR);
      _milS.set(c.w, c.len, c.t);
      _milM.compose(_milP, _milQ, _milS);
      millMesh.setMatrixAt(base+i, _milM);
      millMesh.setColorAt(base+i, _milCol);
    }
  });
  millMesh.instanceMatrix.needsUpdate = true;
  if(millMesh.instanceColor) millMesh.instanceColor.needsUpdate = true;
}

(function millLoop(){
  var last = performance.now();
  function tick(now){
    requestAnimationFrame(tick);
    var dt = Math.min(0.06, (now-last)/1000); last = now;
    updateMills(dt);
  }
  requestAnimationFrame(tick);
})();

window._mills = { clusters: function(){ return MILL_CLUSTERS.length; },
                   instances: function(){ return MILL_TOTAL; },
                   built: function(){ return !!millMesh; } };

/* ==== WINDMILL ==== */
function windmill(x, y, z, ry, col, opt){
  opt = opt || {};
  var baseR = opt.r || 5.2, towerH = opt.h || 17;
  var wallCol = col || pick(TONES);
  var capCol = opt.capCol || shade(TRUNKC[0], -0.05);
  var woodCol = shade(TRUNKC[0], -0.05);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  var segN = 4, segH = towerH/segN, ySeg = y, rSeg = baseR;
  for(var s=0; s<segN; s++){
    CYL(x, ySeg, z, rSeg, segH*1.03, ry, shade(wallCol, -0.04*s));
    ySeg += segH;
    CYL(x, ySeg-0.35, z, rSeg*1.06, 0.6, ry, shade(wallCol,-0.15));   // string-course ring
    rSeg *= 0.83;
  }
  var towerTopY = ySeg;

  /* --- cap: a squat cone, static — only the sails move. --------------- */
  var capR = rSeg*1.18, capH = capR*1.35;
  CONE(x, towerTopY, z, capR, capH, ry, capCol, 'roof');

  var hubY = towerTopY + capH*0.38;
  var hubP = loc(x,z, capR*0.95, 0, ry);
  CYL(hubP[0], hubY-0.5, hubP[1], 0.55, 1.0, 0, shade(woodCol,-0.2), 'wood');

  var bladeLen = towerH*0.60, bladeW = bladeLen*0.15, bladeT = 0.22;
  registerMillCluster(hubP[0], hubY, hubP[1], ry, 4, bladeLen, bladeW, bladeT,
                       opt.spin || 0.55, 0, shade(woodCol, 0.10));

  /* --- door + a couple of storey windows up the tower ------------------ */
  var doorP = loc(x,z, baseR*0.98, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.7, ry, shade(woodCol,-0.15), 'wood');
  for(var wi=0; wi<2; wi++){
    var wy = y + towerH*(0.32+wi*0.28);
    var wr = baseR*(1-0.17*wi)*0.90;
    var wp = loc(x,z, wr, 0, ry);
    monasteryWindow(wp[0], wp[1], wy, ry, 1.1, 1.6, true, frameCol, paneCol);
  }

  return {
    x:x, z:z, ry:ry,
    fx: baseR+2, fz: baseR+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ==== WATERMILL ==== */
function watermill(x, y, z, ry, col, opt){
  opt = opt || {};
  var millW = opt.w || 12, millD = opt.d || 9, wallH = opt.h || 8.5;
  var wallCol = col || pick(TONES);
  var roofCol = opt.roofCol || pick(ROOFS);
  var woodCol = shade(TRUNKC[0], -0.08);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = shade(pick(ROOFS), 0.15);

  structure(x, y, z, millW, millD, wallH, ry, 'hlaalu', wallCol, { roof: roofCol });
  var doorP = loc(x,z, millW*0.5+0.05, 0, ry);
  BOX(doorP[0], y, doorP[1], 0.5, 3.0, 1.8, ry, shade(woodCol,-0.1), 'wood');
  var winP = loc(x,z, 0, millD*0.5+0.05, ry);
  monasteryWindow(winP[0], winP[1], y+wallH*0.4, ry+Math.PI/2, 1.3, 2.0, true, frameCol, paneCol);

  var wheelRy = ry + Math.PI/2;
  var wheelR = opt.wheelR || 4.0, wheelThick = opt.wheelThick || 1.8;
  var flankMid = loc(x,z, millD*0.5, 0, wheelRy);
  var hubOut = wheelR*0.85;   // stands proud of the wall so the disc reads as a true wheel, not a flush rosette
  var hubP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  var hubY = y + wheelR*0.80;   // most of the wheel dips low, toward the race (undershot)

  CYL(hubP[0], hubY-wheelThick*0.5, hubP[1], 0.35, wheelThick, wheelRy, shade(woodCol,-0.2), 'wood');
  [-1,1].forEach(function(s){
    var dp = loc(hubP[0],hubP[1], s*wheelThick*0.5, 0, wheelRy);
    CYL(dp[0], hubY-0.9, dp[1], wheelR*0.22, 1.8, 0, shade(woodCol,-0.15), 'wood');
  });
  var postP = loc(flankMid[0], flankMid[1], hubOut, 0, wheelRy);
  BOX(postP[0], y, postP[1], 0.5, hubY-y, 0.5, wheelRy, shade(woodCol,-0.25), 'wood');

  registerMillCluster(hubP[0], hubY, hubP[1], wheelRy, 10, wheelR*0.34, wheelThick*0.85, 0.28,
                       opt.spin || 0.42, wheelR*0.68, shade(woodCol, -0.10));

  var raceLen = wheelR*2.6, raceGap = wheelThick*1.8;
  [-1,1].forEach(function(s){
    var rp = loc(hubP[0], hubP[1], s*raceGap*0.5, 0, wheelRy);
    BOX(rp[0], y, rp[1], 0.4, 1.3, raceLen, wheelRy, shade(GREYC[0],-0.1));
  });
  var gateMid = loc(hubP[0], hubP[1], 0, raceLen*0.42, wheelRy);
  BOX(gateMid[0], y+0.2, gateMid[1], raceGap*0.85, 1.8, 0.3, wheelRy, shade(woodCol,-0.2), 'wood');

  return {
    x:x, z:z, ry:ry,
    fx: Math.max(millW*0.5, raceLen*0.5)+2,
    fz: millD*0.5 + hubOut + wheelR*1.15 + 1.5,
    doorX: doorP[0], doorZ: doorP[1]
  };
}

/* ==== BEETLE RANCH ==== */
reseed(659201);

function beetleModel(x, y, z, ry, col, opt){
  opt = opt || {};
  var scl = opt.scale || 1.0;
  var bodyLen = 4.6*scl, abdR = 1.5*scl, thoraxR = 1.0*scl, headR = 0.55*scl;
  var shellCol = col || shade(pick(chance(0.5) ? TRUNKC : LEAFC), -0.22);
  var legCol = shade(shellCol, -0.24);
  var legH = abdR*0.95;
  var baseY = y + legH;   // body sits up on its own legs

  var abdP  = loc(x,z, -bodyLen*0.30, 0, ry);
  var thxP  = loc(x,z,  bodyLen*0.06, 0, ry);
  var headP = loc(x,z,  bodyLen*0.40, 0, ry);

  DOME(abdP[0],  baseY, abdP[1],  abdR,     abdR*0.88,    ry, shellCol, 'dome');
  DOME(thxP[0],  baseY, thxP[1],  thoraxR,  thoraxR*0.94, ry, shade(shellCol,0.05), 'dome');
  DOME(headP[0], baseY+thoraxR*0.15, headP[1], headR, headR*0.86, ry, shade(shellCol,-0.05), 'dome');

  [-1,1].forEach(function(s){
    var antRy = ry - s*0.4;
    var ap = loc(headP[0], headP[1], headR*0.9, s*headR*0.35, antRy);
    BOX(ap[0], baseY+thoraxR*0.7, ap[1], headR*1.6, 0.09*scl, 0.09*scl, antRy, legCol, 'trunk');
  });

  [ {lx:bodyLen*0.06, lr:thoraxR*0.85}, {lx:-bodyLen*0.20, lr:abdR*0.80}, {lx:-bodyLen*0.44, lr:abdR*0.55} ]
    .forEach(function(lp){
      [-1,1].forEach(function(s){
        var lpz = loc(x,z, lp.lx, s*lp.lr, ry);
        CYL(lpz[0], y, lpz[1], 0.16*scl, legH, 0, legCol, 'trunk');
      });
    });

  return { x:x, z:z, ry:ry, r: Math.max(abdR, bodyLen*0.5) };
}

function beetleRanch(x, y, z, ry, col, opt){
  opt = opt || {};
  var penW = opt.w || 26, penD = opt.d || 20;
  var fenceCol = shade(TRUNKC[0], -0.10);
  var fenceH = 1.7, postR = 0.16;
  var halfW = penW*0.5, halfD = penD*0.5;
  var chuteHalf = 2.6;

  [-1,1].forEach(function(s){
    var p = loc(x,z, 0, s*halfD, ry);
    BOX(p[0], y+fenceH*0.55, p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
    BOX(p[0], y+fenceH*1.0,  p[1], penW, 0.14, 0.18, ry, fenceCol, 'wood');
  });
  var backP = loc(x,z, -halfW, 0, ry);
  BOX(backP[0], y+fenceH*0.55, backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  BOX(backP[0], y+fenceH*1.0,  backP[1], 0.18, 0.14, penD, ry, fenceCol, 'wood');
  var segLen = (penD-chuteHalf*2)*0.5;
  [-1,1].forEach(function(s){
    var segCenterZ = s*(chuteHalf+segLen*0.5);
    var fp = loc(x,z, halfW, segCenterZ, ry);
    BOX(fp[0], y+fenceH*0.55, fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
    BOX(fp[0], y+fenceH*1.0,  fp[1], 0.18, 0.14, segLen, ry, fenceCol, 'wood');
  });

  [[halfW,halfD],[halfW,-halfD],[-halfW,halfD],[-halfW,-halfD]].forEach(function(c){
    var cp = loc(x,z, c[0], c[1], ry);
    CYL(cp[0], y, cp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
  });
  [-1,1].forEach(function(s){
    var gp = loc(x,z, halfW, s*chuteHalf, ry);
    CYL(gp[0], y, gp[1], postR*1.3, fenceH*1.05, 0, shade(fenceCol,-0.1), 'wood');
    for(var pn=1; pn<4; pn++){
      var pt = (pn/4-0.5)*penW;
      var pp2 = loc(x,z, pt, s*halfD, ry);
      CYL(pp2[0], y, pp2[1], postR, fenceH, 0, fenceCol, 'wood');
    }
  });

  var byreW = Math.min(9, penW*0.34), byreD = Math.min(7, penD*0.55), byreH = 4.2;
  var byreP = loc(x,z, -halfW+byreW*0.5+0.6, 0, ry);
  structure(byreP[0], y, byreP[1], byreW, byreD, byreH, ry, 'hovel', shade(pick(TONES_POOR),-0.05), { roof: pick(ROOFS) });

  addWindows(byreP[0], y, byreP[1], ry, byreW, byreD, byreH, shade(pick(TONES_POOR),-0.05), 0.9);

  /* --- feed troughs along one long fence line. -------------------------- */
  var troughCol = shade(TRUNKC[0], -0.05);
  [-1,1].forEach(function(s){
    var tp = loc(x,z, halfW*0.15, s*(halfD-1.2), ry);
    BOX(tp[0], y, tp[1], penW*0.34, 0.5, 0.9, ry, troughCol, 'wood');
    BOX(tp[0], y+0.5, tp[1], penW*0.34*0.88, 0.25, 0.62, ry, shade(troughCol,-0.3), 'wood');
  });

  var chuteLen = 5.5, chuteW = chuteHalf*1.7;
  var chuteMid = loc(x,z, halfW+chuteLen*0.5, 0, ry);
  BOX(chuteMid[0], y, chuteMid[1], chuteLen, 0.35, chuteW, ry, shade(troughCol,-0.1), 'wood');
  [-1,1].forEach(function(s){
    var rp = loc(x,z, halfW+chuteLen*0.5, s*chuteW*0.5, ry);
    BOX(rp[0], y+0.55, rp[1], chuteLen, 0.9, 0.14, ry, fenceCol, 'wood');
  });
  var doorP = loc(x,z, halfW+chuteLen, 0, ry);

  var beetleCount = opt.beetleCount || 5;
  for(var bi=0; bi<beetleCount; bi++){
    var bx = rr(-halfW*0.55, halfW*0.30), bz = rr(-halfD*0.65, halfD*0.65);
    var bp = loc(x,z, bx, bz, ry);
    beetleModel(bp[0], y, bp[1], rr(0, Math.PI*2), null, { scale: rr(0.85,1.15) });
  }

  return {
    x:x, z:z, ry:ry,
    fx: halfW+chuteLen+2, fz: halfD+2,
    doorX: doorP[0], doorZ: doorP[1]
  };
}
