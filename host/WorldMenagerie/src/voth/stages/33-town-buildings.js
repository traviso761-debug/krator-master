/* ==== town buildings ==== */
function townFacade(p){
  var x=p.x, z=p.z, ry=p.ry, fx0=p.fx0, fz0=p.fz0, yb=p.yb, h=p.h, kind=p.kind, col=p.col, poor=p.poor;
  var doorCol = shade(pick(ROOFS), rr(-0.06,0.06));
  var winCol  = shade(col, -0.55);

  /* --- door, always, centred on the street-facing (local +x) face --- */
  var dw = poor ? rr(1.5,2.0) : rr(1.8,2.4);
  var dh = poor ? rr(2.6,3.2) : rr(3.0,3.9);
  dw = Math.min(dw, fz0*0.9); dh = Math.min(dh, h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], yb, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  FJ.town++;

  if(poor){
    PLASTER_STAT.buildings++;

    var winYp = yb + rr(1.3,2.1);
    var avail = Math.max(0.6, fz0 - dw*0.5);        /* clear space beside the door, one side */
    var fww = Math.min(0.8, avail*0.55);             /* front window width — always < avail */
    var flat = dw*0.5 + fww*0.5 + Math.min(0.3, avail*0.2);
    [-1,1].forEach(function(s){
      var fp = loc(x,z, fx0+0.05, s*flat, ry);
      WINBOX(fp[0], winYp, fp[1], 0.4, rr(0.8,1.15), fww, ry, winCol);
      FJ.town++;
    });
    var winYr = yb + rr(1.3,2.1);
    var rww = Math.min(0.75, fz0*0.45);
    var rlat = fz0 - rww*0.5 - Math.min(0.25, fz0*0.15);
    [-1,1].forEach(function(s){
      var rp = loc(x,z, -fx0-0.05, s*rlat, ry);
      WINBOX(rp[0], winYr, rp[1], 0.4, rr(0.75,1.1), rww, ry, winCol);
      FJ.town++;
    });

    var topY = yb + h, topFx = fx0, topFz = fz0, floorH = h, floorBaseY = yb;
    if(plasterHash(x,z,9.13) < FACADE.plasterSecondStoreyChance){
      PLASTER_STAT.secondStorey++;
      var h2 = rr(3.2,5.5);
      var fx2 = fx0*rr(0.82,0.94), fz2 = fz0*rr(0.82,0.94);
      var y2 = yb + h;
      BOX(x, y2, z, fx2*2, h2, fz2*2, ry, shade(col,-0.04), 'plaster');
      BOX(x, y2+h2-0.6, z, fx2*2*1.05, 1.4, fz2*2*1.05, ry, shade(col,-0.15), 'plaster');
      FJ.town += 2;

      var winY2 = y2 + rr(1.1,1.8);
      var ww2 = Math.min(0.75, fz2*0.45);
      var lat2 = fz2 - ww2*0.5 - Math.min(0.25, fz2*0.15);
      [1,-1].forEach(function(fx2sign){
        [-1,1].forEach(function(s){
          var wp2 = loc(x,z, fx2sign*(fx2+0.05), s*lat2, ry);
          WINBOX(wp2[0], winY2, wp2[1], 0.4, 0.8, ww2, ry, winCol);
          FJ.town++;
        });
      });
      topY = y2 + h2 + 1.4; topFx = fx2; topFz = fz2; floorH = h2; floorBaseY = y2;
    }

    var chimSide = chance(0.5) ? 1 : -1;
    var cp = loc(x,z, -topFx*0.55, topFz*0.55*chimSide, ry);
    var chimW = Math.max(0.7, fx0*0.13), chimH = rr(2.2,3.8);
    FR3(cp[0], topY, cp[1], chimW, chimH, chimW, ry, shade(col,-0.32));
    FJ.town++;
    if(plasterHash(x,z,17.61) < FACADE.plasterSmokeChance){
      PLASTER_STAT.smoking++;

      var smJx = rr(-0.3,0.3), smLift = rr(1.4,2.6), smJz = rr(-0.3,0.3);
      var smR0 = rr(1.5,2.1), smR1 = rr(1.9,2.7), smPh = rr(0,Math.PI*2), smPale = rr(0.35,0.55);
      registerSmokeEmitter(cp[0]+smJx, topY + chimH + 0.35, cp[1]+smJz, {
        kind:'chimney', n:5, life:5.0 + smLift*0.9, rise:6.0 + smLift*1.3,
        r0:smR0*0.30, r1:smR1*0.86, spread:0.34, sway:0.40, swirl:0.75,

        lean:0.55, phase:smPh, col:shade(PAL.smoke.hearth.body, smPale*0.30 - 0.12)
      });
    }

    if(kind !== 'domed' && plasterHash(x,z,3.77) < FACADE.plasterCanopyChance){
      PLASTER_STAT.canopy++;
      var poleClear = 2.576*1.5;
      var canopyY = topY + poleClear;
      var poleInX = topFx*0.80, poleInZ = topFz*0.80;
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cs){
        var pp = loc(x,z, cs[0]*poleInX, cs[1]*poleInZ, ry);
        CYL(pp[0], topY, pp[1], 0.14, poleClear, 0, shade(pick(BANNERC),-0.35), 'wood');
        FJ.town++;
      });
      FR8(x, canopyY, z, topFx*2*1.15, 0.7, topFz*2*1.15, ry, pick(BANNERC), 'cloth');
      FJ.town++;
    }

    if(chance(FACADE.slumAdditionChance)) slumAddition(p);
    return;
  }

  /* --- non-poor: two flanking windows on the front face --- */
  var winY = yb + Math.min(h*0.32, rr(2.4,3.4));
  [-1,1].forEach(function(s){
    if(wallWindow(x,z,ry,fx0,fz0,winY,dw*0.5,winCol, s, 1.1,1.7, 1.3,1.9)) FJ.town++;
  });

  if(kind === 'domed' && h > 10 && chance(FACADE.winChanceUpper)){
    var up = loc(x,z, fx0+0.05, 0, ry);
    WINBOX(up[0], yb+Math.min(h*0.6, rr(6,9)), up[1], 0.4, rr(1.1,1.5), Math.min(rr(1.3,1.9),fz0*0.7), ry, winCol);
    FJ.town++;
  }

  /* a window round the side, on buildings deep enough to have one */
  if(fx0 > 8 && chance(FACADE.winChanceSide)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.3,0.3)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(1.1,1.6), fx0*0.5), rr(1.2,1.8), 0.4, ry, winCol);
    FJ.town++;
  }

  if(kind !== 'domed' && chance(FACADE.chimneyChance)){
    var cx = x + rr(-fx0*0.35,fx0*0.35), cz = z + rr(-fz0*0.35,fz0*0.35);
    CYL(cx, yb+h*0.82, cz, rr(0.5,0.9), rr(2.5,5), 0, shade(col,-0.22));
    FJ.town++;
  }

  /* a proper sloped canopy-awning over the door on the grander houses */
  var grand = kind==='domed' || kind==='velothi' || h > FACADE.grandHeight;
  if(grand && chance(FACADE.awningChance)) doorAwning(x,z,ry,fx0,dw,dh,yb,doorCol);
}

PLACED.forEach(function(p){
  if(p.tag === 'town') townFacade(p);
});
window._plasterFacade = PLASTER_STAT;

/* ==== other footprints ==== */
PLACED.forEach(function(p){
  if(p.tag !== 'velothi-out') return;
  var halfX = Math.max(1.5, p.fx - 2.5), halfZ = Math.max(1.5, p.fz - 2.5);
  var yb = terrainH(p.x, p.z);
  var dw = Math.min(rr(1.3,1.8), halfZ*0.9), dh = rr(2.4,3.0);
  var dp = loc(p.x, p.z, halfX+0.05, 0, p.ry);
  BOX(dp[0], yb, dp[1], 0.4, dh, dw, p.ry, shade(pick(ROOFS),-0.05), 'wood');
  FJ.other++;
});

/* ==== compounds ==== */
function compoundFacade(c){
  var ry=c.ry, wallFx=c.wallFx, wallFz=c.wallFz, wallH=c.wallH, wallCol=c.wallCol;

  var O = loc(c.x, c.z, -FACADE.gateOffFrac*wallFx, 0, ry);
  var gateLX = wallFx*(1-FACADE.gateOffFrac);

  var steps=3, outStep=wallFz*0.10, drop=0.9, wLoss=wallFz*0.16;
  var outBase = gateLX - 0.4, topY = c.y + wallH*1.5 + 2.0, wBase = wallFz*0.78;
  var lastOutX=outBase, lastY=topY, lastW=wBase;
  for(var i=0;i<steps;i++){
    var outX = outBase + i*outStep, yy = topY - i*drop, ww = Math.max(wallFz*0.18, wBase - i*wLoss);
    var gp2 = loc(c.x,c.z, outX, 0, ry);
    FR8(gp2[0], yy, gp2[1], outStep+0.6, 0.9, ww, ry, pick(ROOFS), 'roof');
    lastOutX=outX; lastY=yy; lastW=ww;
    FJ.compound++;
  }
  [-1,1].forEach(function(s){
    var pp = loc(c.x,c.z, lastOutX+0.8, s*lastW*0.46, ry);
    CYL(pp[0], c.y, pp[1], 0.28, lastY - c.y, 0, shade(wallCol,-0.1), 'wood');
    FJ.compound++;
  });

  /* corner finials on the four wall towers */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(O[0], O[1], cc[0]*(wallFx-1.6), cc[1]*(wallFz-1.6), ry);
    CONE(p[0], c.y+wallH*1.35+1.45, p[1], 1.5, rr(3,5), 0, shade(wallCol,-0.15));
    FJ.compound++;
  });

  [-1,1].forEach(function(s){
    var lp = loc(c.x,c.z, gateLX-6.0, s*wallFz*0.40, ry);
    CYL(lp[0], c.y, lp[1], 0.20, rr(2.4,3.2), 0, shade(wallCol,-0.2), 'wood');
    FJ.compound++;
  });

  [-1,1].forEach(function(s){
    var bp = loc(c.x,c.z, gateLX+4.0, s*wallFz*0.34, ry);
    var poleH = wallH*1.9;
    CYL(bp[0], c.y, bp[1], 0.14, poleH, 0, shade(wallCol,-0.3), 'wood');
    var mountY = c.y + poleH*0.86;                 /* fixed edge: near the pole top */
    var baseY  = c.y + rr(0.3,0.8);                /* free edge: almost touching the ground */
    var panelH = Math.max(2.5, mountY - baseY);
    var panelW = rr(2.0,2.8);
    BOX(bp[0], baseY, bp[1], 0.16, panelH, panelW, ry, pick(BANNERC), 'cloth');
    FJ.compound += 2;
  });

  var pLen = c.fx*1.1, pMidLX = c.fx*0.85 - pLen*0.5;
  var pMid = loc(c.x,c.z, pMidLX, 0, ry);
  BOX(pMid[0], c.y+0.05, pMid[1], pLen, 0.12, Math.max(1.6,c.fz*0.14), ry, shade(wallCol,0.10));
  FJ.compound++;

  var patioSign = chance(0.5)?1:-1;
  var patioSize = Math.min(c.fx*0.9, c.fz*0.5)*rr(0.75,1.0);
  var patioP = loc(c.x,c.z, rr(-0.15,0.15)*c.fx, patioSign*c.fz*0.55, ry);
  BOX(patioP[0], c.y+0.05, patioP[1], patioSize, 0.14, patioSize, ry+rr(-0.1,0.1), shade(wallCol,0.16));
  FJ.compound++;

  var wx = c.x + rr(-c.fx*0.55, -c.fx*0.15), wz = c.z + rr(-c.fz*0.5, c.fz*0.5);
  if(claim(wx, wz, 1.6, 1.6, 0, 'facade-well')){
    CYL(wx, c.y, wz, 1.3, 1.1, 0, shade(wallCol,-0.05));
    DOME(wx, c.y+1.1, wz, 0.9, 0.7, 0, shade(wallCol,0.1), 'dome');
    FJ.compound += 2;
  }
  var nPlant = ri(6,10);
  for(var i=0;i<nPlant;i++){
    var px = c.x + rr(-c.fx*0.85, c.fx*0.85), pz = c.z + rr(-c.fz*0.85, c.fz*0.85);
    if(chance(0.40)){
      var th = rr(2.6,4.4);
      STK(px, c.y, pz, rr(0.3,0.5), th, 0, 0x5a4b3a, 'trunk');
      BLOB(px, c.y+th*0.75, pz, rr(1.6,2.6), rr(1.8,2.8), rnd()*3, pick(WILLOWC), 'leaf');
      FJ.compound += 2;
    }else{
      var br = rr(1.0,2.0);
      BLOB(px, c.y-0.2, pz, br, br*0.8, rnd()*3, pick(LEAFC), 'leaf');
      FJ.compound++;
    }
  }
}

COMPOUNDS.forEach(compoundFacade);

window._facade = { instances: bucketTotal() - _facadeStart, town:FJ.town, other:FJ.other, compound:FJ.compound };
