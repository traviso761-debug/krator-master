/* ==== GUILD: FOUR CRAFT HALLS + LOCAL MARKET ==== */

function guildHallsDeck(c, y, hw){
  var GH_COL = hw*0.385, GH_W = hw*0.32, GH_D = hw*0.285;
  var GH_BLVD = hw*0.35, GH_ROW = GH_BLVD + GH_W*0.5;

  function ghPlot(j, row){
    return { x: c.x + (j-2)*GH_COL, z: c.z + row*GH_ROW, ry: row<0 ? -Math.PI/2 : Math.PI/2 };
  }

  function ghHall(name, hx, hz, w, d, ry){
    var dp = loc(hx, hz, w*0.5+1.2, 0, ry);
    GUILD_HALL_DOORS.push({ x:dp[0], z:dp[1], ry:ry, canton:'Guild', name:name });

    inspectClaim(hx, hz, w*0.5+11, d*0.5+3.5, ry, 'guildhall', name + "'s guild hall");
  }

  /* ==== the blacksmith's guild: a low, sooty, blocky hall, forge chimney ==== */
  (function(){
    var P = ghPlot(0,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.40;
    var col = shade(c.tone, -0.16);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Blacksmith', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* flue, set back at the far corner from the door */
    var fp = loc(hx, hz, -w*0.5+3, d*0.5-3, ry);
    var chimW = Math.max(3.2, w*0.10), chimH = h*1.30;
    FR3(fp[0], y, fp[1], chimW, chimH, chimW, ry, shade(col,-0.34));
    CYL(fp[0], y+chimH, fp[1], chimW*0.36, chimW*0.55, 0, shade(col,-0.5));

    var ap = loc(hx, hz, w*0.5+4.2, -d*0.22, ry);
    BOX(ap[0], y, ap[1], 1.6, 1.0, 2.6, ry, shade(col,-0.45), 'metal');
    CYL(ap[0], y+1.0, ap[1], 0.7, 0.35, 0, shade(ROOFS[2], 0.15));

    CYL(ap[0], y+1.32, ap[1], 0.40, 0.22, 0, 0xff6a2e);
    CYL(ap[0], y+1.42, ap[1], 0.20, 0.14, 0, 0xffd23c);

    var forgePhase = rr(0, Math.PI*2); rnd(); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+chimH+chimW*0.55, fp[1], {
      kind:'forge', n:21, life:4.6, rise:24, r0:0.85, r1:4.30,
      spread:0.70, sway:1.15, swirl:1.30, lean:0.46, phase:forgePhase,
      col:PAL.smoke.forge.body, colHot:PAL.smoke.forge.hot, hotEnd:0.22
    });
    var tp = loc(hx, hz, w*0.5+4.2, d*0.26, ry);
    BOX(tp[0], y, tp[1], 3.2, 1.1, 1.6, ry, shade(TRUNKC[0],-0.2), 'wood');
    BOX(tp[0], y+1.1, tp[1], 3.0, 0.3, 1.4, ry, 0x8fb8c4);

    var shedCx = w*0.5+4.2, shedD = 7.2, shedW = d*0.85, shedH = h*0.52;
    var shedC = loc(hx, hz, shedCx, 0, ry);
    [-1,1].forEach(function(s){
      var pp0 = loc(hx, hz, shedCx+shedD*0.40, s*shedW*0.42, ry);
      CYL(pp0[0], y, pp0[1], 0.42, shedH, 0, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(shedC[0], y+shedH, shedC[1], shedD, 1.0, shedW, ry, shade(col,-0.28), 'wood');

    [-1.7, 1.7].forEach(function(s){
      var sp = loc(hx, hz, shedCx, -d*0.22+s, ry);
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry:ry+Math.PI, role:'smith', radius:0.9 });
    });
  })();

  /* ==== the alchemist's guild: a slender, jade-tinted leaning tower with ==== */
  (function(){
    var P = ghPlot(0,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = hw*0.25, d = hw*0.22, h = hw*0.68;
    var col = shade(pick(JADEC), 0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Alchemist', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'velothi', col, {cap:'dome'});
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    var pp = loc(hx, hz, w*0.5+6.5, -d*0.35, ry);
    BOX(pp[0], y, pp[1], 5.0, 1.3, 4.0, ry, shade(col,-0.15));
    var vY = y+1.3;
    [[-1.4,-0.9,0.55,'stone'],[0.6,0.7,0.85,'stone'],[1.7,-0.4,0.42,'metal']].forEach(function(v){
      var vp = loc(pp[0], pp[1], v[0], v[1], ry);
      var vcol = v[3]==='metal' ? shade(ROOFS[5], 0.10) : shade(JADEC[1], 0.12);
      var vh = 1.6 + v[2]*1.6;
      CYL(vp[0], vY, vp[1], v[2], vh, 0, vcol, v[3]);
      if(v[2] > 0.7) CONE(vp[0], vY+vh, vp[1], v[2]*0.5, 1.0, 0, shade(vcol,-0.1));
    });

    var annexW = hw*0.15, annexD = hw*0.20, annexH = hw*0.20;

    var annexP = loc(hx, hz, -(w*0.5 + annexW*0.5 - 1.0), 0, ry);
    var annexCol = shade(col, -0.06);
    var annexDhw = Math.min(2.2, annexW*0.5*0.9)*0.5;
    structure(annexP[0], y, annexP[1], annexW, annexD, annexH, ry, 'hlaalu', annexCol);
    addDoor(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol);
    addWindows(annexP[0], y, annexP[1], ry, annexW, annexD, annexH, annexCol, annexDhw);
    var annexTopY = y + annexH + 1.3;
    /* rooftop herb garden: a row of planter troughs the alchemist tends */
    [-1.4,-0.5,0.5,1.4].forEach(function(t){
      var plp = loc(annexP[0], annexP[1], 0, t*annexD*0.35, ry);
      BOX(plp[0], annexTopY, plp[1], annexW*0.55, 0.7, annexD*0.14, ry, shade(TRUNKC[0],-0.15), 'wood');
      BLOB(plp[0], annexTopY+0.7, plp[1], annexD*0.10, 1.1, rr(0,Math.PI*2), shade(pick(JADEC), rr(-0.1,0.15)));
    });

    GUILD_WORK_POSTS.push({ x:annexP[0], z:annexP[1], y:annexTopY, ry:ry, role:'tender', radius:1.6 });

    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.1, dhw*1.35), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.42;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);

      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCK = { x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 };
      GUILD_CLOCKS.push(GUILD_CLOCK);
    })();
  })();

  /* ==== the mason's guild: plain undyed stone, a pile of fresh-cut ==== */
  (function(){
    var P = ghPlot(3,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.34;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Mason', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);

    var bp = loc(hx, hz, -w*0.5-4, -d*0.30, ry);
    for(var bi=0; bi<6; bi++){
      var bo = loc(bp[0], bp[1], rr(-3,3), rr(-3,3), ry);
      var bs = rr(1.6,2.6);
      BOX(bo[0], y, bo[1], bs, bs*rr(0.7,1.0), bs*rr(0.8,1.2), rr(0,Math.PI*2), pick(STALKC));
    }
    /* scaffold along the far flank: 3 posts, 2 lashed cross-beams */
    [-1,0,1].forEach(function(si){
      var pp2 = loc(hx, hz, -w*0.5-1.4, si*d*0.28, ry);
      CYL(pp2[0], y, pp2[1], 0.35, h*0.65, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    [0.30,0.60].forEach(function(ft){
      var bmA = loc(hx, hz, -w*0.5-1.4, -d*0.28, ry), bmB = loc(hx, hz, -w*0.5-1.4, d*0.28, ry);
      BOX((bmA[0]+bmB[0])/2, y+h*ft, (bmA[1]+bmB[1])/2, 0.3, 0.3, d*0.56, ry, shade(TRUNKC[0],-0.1), 'wood');
    });

    var cp = loc(hx, hz, w*0.5+3.0, d*0.5-3.0, ry);
    var craneH = hw*0.30, armLen = craneH*0.85;
    CYL(cp[0], y, cp[1], 0.65, craneH, 0, shade(TRUNKC[0],-0.2), 'wood');
    var armMid = loc(cp[0], cp[1], armLen*0.5, 0, ry);
    BOX(armMid[0], y+craneH*0.92, armMid[1], armLen, 0.45, 0.45, ry, shade(TRUNKC[0],-0.2), 'wood');

    var gardenCx = -w*0.5-12;   /* GRID PASS: was -18, which now reaches past the deck edge behind this plot */
    [-1.8,-0.9,0,0.9,1.8].forEach(function(t){
      var gp = loc(hx, hz, gardenCx+rr(-2,2), t*d*0.42, ry);
      statue(gp[0], y, gp[1], ry+Math.PI+rr(-0.3,0.3), pick(STALKC), { h:rr(4.2,5.4), w:rr(1.3,1.7) });
    });
  })();

  /* ==== the warrior's guild (new — no prior treatment anywhere in the ==== */
  (function(){
    var P = ghPlot(4,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.46;
    var col = shade(c.tone, -0.08);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Warrior', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    addWindows(hx, y, hz, ry, w, d, h, col, dhw);
    /* banners flanking the door */
    [-1,1].forEach(function(s){
      var pp3 = loc(hx, hz, w*0.5+1.0, s*(d*0.30), ry);
      var poleH = h*0.62;
      CYL(pp3[0], y, pp3[1], 0.28, poleH, 0, shade(TRUNKC[0],-0.15), 'wood');
      BOX(pp3[0], y+poleH-6.0, pp3[1], 0.16, 6.0, 2.6, ry, pick([BANNERC[0],BANNERC[1]]), 'cloth');
    });
    /* shield/blazon plaques, flush on the wall either side of the door */
    [-1,1].forEach(function(s){
      var sp2 = loc(hx, hz, w*0.5+0.10, s*(d*0.16), ry);
      BOX(sp2[0], y+h*0.40, sp2[1], 0.18, 1.9, 1.5, ry, pick([BANNERC[0],BANNERC[1]]));
    });
    /* a small weapon rack: standing spear shafts beside the door */
    var rp = loc(hx, hz, w*0.5+3.5, -d*0.42, ry);
    for(var wi=0; wi<4; wi++){
      var sp3 = loc(rp[0], rp[1], 0, (wi-1.5)*0.9, ry);
      var shaftH = rr(4.5,6.0);
      CYL(sp3[0], y, sp3[1], 0.14, shaftH, 0, shade(TRUNKC[0],-0.1), 'wood');
      CONE(sp3[0], y+shaftH, sp3[1], 0.30, 0.9, 0, shade(col,-0.4));
    }

    var yardR = 9, yardC = loc(hx, hz, -w*0.5-11, 0, ry);
    BOX(yardC[0], y, yardC[1], yardR*2, 1.1, yardR*2, ry, shade(pick(STALKC), 0.32));
    for(var fi=0; fi<10; fi++){
      var fa = (fi/10)*Math.PI*2;
      var fp2 = loc(yardC[0], yardC[1], Math.cos(fa)*yardR, Math.sin(fa)*yardR, 0);
      CYL(fp2[0], y, fp2[1], 0.20, 1.4, 0, shade(TRUNKC[0],-0.2), 'wood');
    }

    [[-3.2,0],[3.2,0]].forEach(function(pair, pi){
      var pc = loc(yardC[0], yardC[1], pair[0], pair[1], 0);
      var axAng = pi===0 ? 0 : Math.PI/2;
      [-1,1].forEach(function(side){
        var wp = loc(pc[0], pc[1], side*1.3*Math.cos(axAng), side*1.3*Math.sin(axAng), 0);
        GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:0, role:'warrior', radius:1.3, pairId:pi,
          pairDx: -side*Math.cos(axAng), pairDz: -side*Math.sin(axAng) });
      });
    });
  })();

  /* ==== a small local market at the centre: a well and a handful of ==== */
  var marketR = hw*0.16;
  monasteryWell(c.x, y, c.z, 2.6, 0);
  var stallKinds = ['fruit','bread','cheese'];
  var nStalls = 6;
  for(var mi=0; mi<nStalls; mi++){
    var ma = (mi/nStalls)*Math.PI*2 + rr(-0.12,0.12);
    var mr = rr(marketR*0.55, marketR);
    var sx = c.x + Math.cos(ma)*mr, sz = c.z + Math.sin(ma)*mr;
    var mry = ma + Math.PI/2 + rr(-0.15,0.15);
    var sw = rr(4.2,5.4), sd = rr(4.2,5.4);
    var counterH = rr(0.9,1.1), postH = rr(2.4,2.7);
    BOX(sx, y, sz, sw, counterH, sd, mry, pick(TONES_POOR), 'wood');
    inspectClaim(sx, sz, sw*0.5, sd*0.5, mry, 'stall', 'Market stall');
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
      var p = loc(sx,sz, cc[0]*sw*0.42, cc[1]*sd*0.42, mry);
      BOX(p[0], y, p[1], 0.30, postH, 0.30, mry, pick(TRUNKC), 'wood');
    });
    FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, mry, pick(BANNERC), 'cloth');
    if(chance(0.7)) stallGoods(sx, sz, y+counterH, sw, sd, mry, pick(stallKinds));
  }

  /* ==== THIRD PASS: the carpenters' own yard — a freestanding sawyer's ==== */
  (function(){

    var yardC = [c.x - GH_COL, c.z + hw*0.162];
    var yardHalf = hw*0.075;

    BOX(yardC[0], y, yardC[1], yardHalf*2.4, 1.0, yardHalf*2.4, 0, shade(pick(STALKC), 0.30));
    /* a corner woodpile: squared beams stacked log-cabin style */
    var pileC = [yardC[0]-yardHalf*0.9, yardC[1]-yardHalf*0.7];
    for(var pi=0; pi<5; pi++){
      var alt = pi%2===0;
      var logCol = shade(TRUNKC[pi%TRUNKC.length], rr(-0.08,0.10));
      BOX(pileC[0], y+0.4+pi*0.62, pileC[1], alt?4.6:0.62, 0.58, alt?0.62:4.6, 0, logCol, 'wood');
    }

    var logLen = yardHalf*1.5, logY = y+1.35;

    [-1,1].forEach(function(s){
      var lp = [yardC[0]+yardHalf*0.5, yardC[1]+s*logLen*0.32];
      [-1,1].forEach(function(k){
        BOX(lp[0]+k*0.5, y, lp[1], 0.28, logY-y, 0.28, 0, shade(TRUNKC[0],-0.1), 'wood');
      });
    });
    BOX(yardC[0]+yardHalf*0.5, logY, yardC[1], 1.05, 1.05, logLen, 0, shade(TRUNKC[1],0.05), 'wood');

    for(var wo=0; wo<9; wo++){
      var op = [yardC[0]+yardHalf*0.5+rr(-2.2,2.2), yardC[1]+rr(-logLen*0.6,logLen*0.6)];
      BLOB(op[0], y+0.15, op[1], rr(0.35,0.6), rr(0.18,0.30), rnd()*3, shade(0xcbb78a, rr(-0.08,0.08)), 'leaf');
    }
    for(var of=0; of<4; of++){
      var op2 = [yardC[0]+rr(-yardHalf*1.6,-yardHalf*0.3), yardC[1]+rr(-yardHalf*1.2,yardHalf*1.2)];
      BOX(op2[0], y+0.2, op2[1], rr(0.5,0.9), 0.30, rr(0.5,0.9), rr(0,Math.PI*2), shade(TRUNKC[0],rr(-0.1,0.1)), 'wood');
    }

    [-1,1].forEach(function(side){
      var sp = [yardC[0]+yardHalf*0.5, yardC[1]+side*logLen*0.5];
      GUILD_WORK_POSTS.push({ x:sp[0], z:sp[1], y:y, ry: side<0?0:Math.PI, role:'carpenter', radius:0.9, pairId:0,
        pairDx:0, pairDz:-side });
    });
  })();

  /* ==== THIRD PASS: the merchants' own outdoor tend — see this function's ==== */
  (function(){

    var bazC = [c.x + GH_COL, c.z + hw*0.162];
    var span = hw*0.27, archW = span/3, pierW = archW*0.22, archH = 8.4;
    var pierCol = shade(c.tone, -0.02);
    [ {lx:-span*0.5, lz:0, along:'z'}, {lx:span*0.5, lz:0, along:'z'},
      {lx:0, lz:span*0.5, along:'x'} ].forEach(function(side){
      for(var b=0;b<3;b++){
        var bt = (b-1)*archW;
        var pp = side.along==='x' ? [bazC[0]+bt-archW*0.5+pierW*0.5, bazC[1]+side.lz]
                                   : [bazC[0]+side.lx, bazC[1]+bt-archW*0.5+pierW*0.5];
        var pierRy = side.along==='x' ? 0 : Math.PI/2;
        BOX(pp[0], y, pp[1], pierW, archH, 0.9, pierRy, pierCol);
        var archP = side.along==='x' ? [bazC[0]+bt, bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]+bt];
        DOME(archP[0], y+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, pierCol);
      }

      var lp = side.along==='x' ? [bazC[0], bazC[1]+side.lz] : [bazC[0]+side.lx, bazC[1]];
      BOX(lp[0], y+archH+0.5, lp[1], side.along==='x'?span:1.0, 0.8, side.along==='x'?1.0:span, 0, shade(pierCol,-0.10));
    });

    BOX(bazC[0], y-0.05, bazC[1], span*0.82, 0.30, span*0.82, 0, 0x4f6b3a, 'plaster');
    for(var g=0; g<8; g++){
      var ga = g*(Math.PI*2/8), gr = span*0.30;
      var gp = [bazC[0]+Math.cos(ga)*gr, bazC[1]+Math.sin(ga)*gr];
      BLOB(gp[0], y+0.25, gp[1], rr(0.8,1.3), rr(0.8,1.2), rnd()*3, shade(0x4a7a3a, rr(-0.1,0.1)), 'leaf');
    }

    [-1,1].forEach(function(s){
      var sx = bazC[0] + s*span*0.22, sz = bazC[1] - span*0.06;
      var sw = 5.6, sd = 4.6, counterH = 1.05, postH = 2.6;
      BOX(sx, y, sz, sw, counterH, sd, 0, pick(TONES_POOR), 'wood');
      [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
        BOX(sx+cc[0]*sw*0.42, y, sz+cc[1]*sd*0.42, 0.30, postH, 0.30, 0, pick(TRUNKC), 'wood');
      });
      FR8(sx, y+postH, sz, sw*1.3, 0.7, sd*1.3, 0, pick(JADEC), 'cloth');
      stallGoods(sx, sz, y+counterH, sw, sd, 0, 'exotic');

      GUILD_WORK_POSTS.push({ x:sx - s*sw*0.30, z:sz+sd*0.55, y:y, ry:Math.PI, role:'merchant', radius:1.2 });
    });

    GUILD_MARKET_DOOR = { x:bazC[0], z:bazC[1]-span*0.55, ry:Math.PI };
  })();

  /* ==== Carpenter's Guild: a plain timber-raftered hall, on-axis due ==== */
  (function(){
    var P = ghPlot(1,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = shade(pick(TONES), -0.05);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);

    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);

    var rp = loc(hx, hz, w*0.5+2.6, -d*0.32, ry);
    for(var li=0; li<4; li++){
      BOX(rp[0], y+0.3+li*0.55, rp[1], 3.6, 0.5, 0.9, ry, shade(TRUNKC[li%TRUNKC.length],rr(-0.06,0.08)), 'wood');
    }
    var sgp = loc(hx, hz, w*0.5+0.3, d*0.28, ry);
    BOX(sgp[0], y+h*0.5, sgp[1], 0.25, 1.6, 2.4, ry, shade(TRUNKC[0],-0.2), 'wood');
    ghHall('Carpenter', hx, hz, w, d, ry);
  })();

  /* ==== Merchant's Guild: on-axis due north of centre, just beyond the ==== */
  (function(){
    var P = ghPlot(3,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.25;
    var col = pick(TONES);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);

    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);

    var tp = loc(hx, hz, w*0.5+2.4, -d*0.30, ry);
    BOX(tp[0], y, tp[1], 2.6, 1.1, 1.5, ry, shade(TRUNKC[0],-0.15), 'wood');
    CYL(tp[0], y+1.1, tp[1], 0.10, 1.3, 0, shade(ROOFS[5],0.10), 'metal');
    CYL(tp[0], y+2.2, tp[1], 0.55, 0.06, 0, shade(ROOFS[5],0.15), 'metal');
    ghHall('Merchant', hx, hz, w, d, ry);
  })();

  /* ==== Weaver's Guild: the +x cardinal gap, the first of the two that ==== */
  (function(){
    var P = ghPlot(4,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.24;
    var col = shade(pick(TONES), 0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);

    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the loom: two upright posts + a crossbeam, beside the door */
    var lp = loc(hx, hz, w*0.5+3.6, -d*0.30, ry);
    var loomW = 3.4, loomH = 3.0;
    [-1,1].forEach(function(s){
      var pp = loc(lp[0], lp[1], 0, s*loomW*0.5, ry);
      CYL(pp[0], y, pp[1], 0.22, loomH, 0, shade(TRUNKC[0],-0.1), 'wood');
    });
    BOX(lp[0], y+loomH, lp[1], 0.8, 0.3, loomW+0.4, ry, shade(TRUNKC[0],-0.1), 'wood');

    for(var bi=0; bi<4; bi++){
      var bt = (bi-1.5)*loomW*0.30;
      var bp = loc(lp[0], lp[1], 0.5, bt, ry);
      BOX(bp[0], y+loomH-1.9, bp[1], 0.5, 2.6, 1.0, ry, pick(BANNERC), 'cloth');
    }
    /* a second small display: folded/stacked bolts just outside the door */
    var fp = loc(hx, hz, w*0.5+1.6, d*0.34, ry);
    FR8(fp[0], y+0.6, fp[1], 2.2, 1.2, 1.6, ry, pick(BANNERC), 'cloth');

    GUILD_WORK_POSTS.push({ x:lp[0], z:lp[1], y:y, ry:ry+Math.PI, role:'weaver', radius:1.1 });
    ghHall('Weaver', hx, hz, w, d, ry);
  })();

  /* ==== Clockmaker's/Artificer's Guild: the -x cardinal gap, the second ==== */
  (function(){
    var P = ghPlot(2,1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.02);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'velothi', col);
    addDoor(hx, y, hz, ry, w, d, h, col);

    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);

    (function(){
      var faceCol = pick(STALKC), rimCol = shade(ROOFS[5], -0.20);
      var rimHalf = Math.max(1.0, dhw*1.25), faceHalf = rimHalf*0.80;
      var clockY = y + h*0.40;
      var clp = loc(hx, hz, w*0.5+0.10, 0, ry);
      BOX(clp[0], clockY, clp[1], 0.22, rimHalf*2, rimHalf*2, ry, rimCol);
      var facep = loc(hx, hz, w*0.5+0.20, 0, ry);
      BOX(facep[0], clockY, facep[1], 0.10, faceHalf*2, faceHalf*2, ry, faceCol);
      var pinp = loc(hx, hz, w*0.5+0.30, 0, ry);
      BOX(pinp[0], clockY, pinp[1], 0.14, 0.30, 0.30, ry, rimCol);
      GUILD_CLOCKS.push({ x:pinp[0], z:pinp[1], y:clockY, ry:ry, r:faceHalf*0.82 });
    })();

    var wp = loc(hx, hz, w*0.5+2.6, -d*0.28, ry);
    BOX(wp[0], y, wp[1], 2.4, 1.0, 1.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    [[-0.5,0.32],[0.5,0.22]].forEach(function(g){
      var gp = loc(wp[0], wp[1], g[0], 0.9, ry);
      CYL(gp[0], y+1.0, gp[1], g[1], 0.10, 0, shade(ROOFS[5],0.08), 'metal');
    });
    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'artificer', radius:1.0 });
    ghHall('Artificer', hx, hz, w, d, ry);
  })();

  /* ==== FIFTH PASS: Potter's Guild (column 1, south row) - one of the two ==== */
  (function(){
    var P = ghPlot(1,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.30;
    var col = shade(pick(TONES), -0.10);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    ghHall('Potter', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* the beehive kiln, in the forecourt beside the door */
    var kp = loc(hx, hz, w*0.5+5.6, -d*0.26, ry);
    var kilnR = 3.2, kilnH = 4.2;
    CYL(kp[0], y, kp[1], kilnR, kilnH, 0, shade(col,-0.26));
    DOME(kp[0], y+kilnH, kp[1], kilnR, kilnR*0.85, 0, shade(col,-0.32));
    CYL(kp[0], y+kilnH+kilnR*0.85, kp[1], kilnR*0.30, 1.6, 0, shade(col,-0.42));
    var stokeP = loc(kp[0], kp[1], kilnR*0.88, 0, ry);
    BOX(stokeP[0], y+0.5, stokeP[1], 0.5, 1.5, 1.7, ry, 0xff6a2e);
    BOX(stokeP[0], y+0.45, stokeP[1], 0.3, 0.8, 0.9, ry, 0xffd23c);

    var kilnPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(kp[0], y+kilnH+kilnR*0.85+1.6, kp[1], {
      kind:'kiln', n:14, life:6.4, rise:17, r0:0.62, r1:3.00,
      spread:0.50, sway:0.80, swirl:0.85, lean:0.56, phase:kilnPhase,
      col:PAL.smoke.kiln.body, colHot:PAL.smoke.kiln.hot, hotEnd:0.16
    });
    /* the wheel the potter actually works at, and a drying rack of greenware */
    var wp = loc(hx, hz, w*0.5+2.2, d*0.06, ry);
    CYL(wp[0], y, wp[1], 0.36, 0.9, 0, shade(TRUNKC[0],-0.20), 'wood');
    CYL(wp[0], y+0.9, wp[1], 0.95, 0.18, 0, shade(col,-0.36));
    CYL(wp[0], y+1.08, wp[1], 0.32, 0.55, 0, shade(pick(TONES_POOR), 0.04));
    var rkp = loc(hx, hz, w*0.5+3.4, d*0.30, ry);
    [-1,1].forEach(function(s){
      var lp = loc(rkp[0], rkp[1], 0, s*1.4, ry);
      BOX(lp[0], y, lp[1], 0.3, 1.5, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    BOX(rkp[0], y+1.5, rkp[1], 1.9, 0.25, 3.1, ry, shade(TRUNKC[0],-0.15), 'wood');
    for(var pq=0; pq<5; pq++){
      var qp = loc(rkp[0], rkp[1], rr(-0.7,0.7), rr(-1.2,1.2), ry);
      CYL(qp[0], y+1.75, qp[1], rr(0.22,0.38), rr(0.5,0.9), 0, shade(pick(TONES_POOR), 0.06));
    }
    /* stacked finished urns against the hall's own front wall */
    for(var st=0; st<3; st++){
      var up = loc(hx, hz, w*0.5+1.3, -d*0.44+st*1.6, ry);
      var ur = rr(0.5,0.8);
      CYL(up[0], y, up[1], ur, ur*1.7, 0, shade(pick(TONES_POOR), -0.04));
      DOME(up[0], y+ur*1.7, up[1], ur*0.92, ur*0.7, 0, shade(pick(TONES_POOR), -0.10));
    }

    GUILD_WORK_POSTS.push({ x:wp[0], z:wp[1], y:y, ry:ry+Math.PI, role:'potter', radius:1.0 });
  })();

  /* ==== FIFTH PASS: Glassmaker's Guild (column 2, south row) - the other ==== */
  (function(){
    var P = ghPlot(2,-1), hx = P.x, hz = P.z, ry = P.ry;
    var w = GH_W, d = GH_D, h = hw*0.33;
    var col = shade(pick(TONES), -0.04);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    var glassCol = shade(JADEC[0], 0.42);   /* the pale, cool "glass" tone every vessel below shares */
    ghHall('Glassmaker', hx, hz, w, d, ry);
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, -1, 0.22);

    var fp = loc(hx, hz, w*0.5+5.4, d*0.24, ry);
    var furR = 2.9, furH = 3.4;
    CYL(fp[0], y, fp[1], furR, furH, 0, shade(col,-0.34));
    DOME(fp[0], y+furH, fp[1], furR*0.98, furR*0.80, 0, shade(col,-0.40));
    CYL(fp[0], y+furH+furR*0.80, fp[1], furR*0.26, 2.2, 0, shade(col,-0.48));
    var mouth = loc(fp[0], fp[1], -furR*0.86, 0, ry);
    BOX(mouth[0], y+1.5, mouth[1], 0.5, 1.3, 1.3, ry, 0xff6a2e);
    BOX(mouth[0], y+1.5, mouth[1], 0.3, 0.7, 0.7, ry, 0xffd23c);

    var furPhase = rr(0, Math.PI*2); rnd(); rnd();
    registerSmokeEmitter(fp[0], y+furH+furR*0.80+2.2, fp[1], {
      kind:'furnace', n:15, life:4.0, rise:18, r0:0.52, r1:2.70,
      spread:0.44, sway:0.70, swirl:1.15, lean:0.50, phase:furPhase,
      col:PAL.smoke.furnace.body, colHot:PAL.smoke.furnace.hot, hotEnd:0.18
    });

    var bp = loc(hx, hz, w*0.5+2.4, -d*0.10, ry);
    [-1,1].forEach(function(s){
      var lp2 = loc(bp[0], bp[1], 0, s*1.5, ry);
      BOX(lp2[0], y, lp2[1], 0.32, 1.05, 0.32, ry, shade(TRUNKC[0],-0.18), 'wood');
    });
    BOX(bp[0], y+1.05, bp[1], 1.5, 0.22, 3.6, ry, shade(ROOFS[5], -0.10), 'metal');
    var pipeP = loc(bp[0], bp[1], 0.2, 0, ry);
    BOX(pipeP[0], y+1.34, pipeP[1], 0.14, 0.14, 4.4, ry, shade(ROOFS[5], 0.05), 'metal');
    var tipP = loc(bp[0], bp[1], 0.2, -2.3, ry);
    CYL(tipP[0], y+1.28, tipP[1], 0.28, 0.34, 0, 0xff6a2e);
    /* the display rack: finished vessels, pale and cool against the tone */
    var dp2 = loc(hx, hz, w*0.5+1.4, d*0.38, ry);
    [-1,1].forEach(function(s){
      var lp3 = loc(dp2[0], dp2[1], 0, s*1.5, ry);
      BOX(lp3[0], y, lp3[1], 0.3, 2.4, 0.3, ry, shade(TRUNKC[0],-0.15), 'wood');
    });
    [1.0, 2.4].forEach(function(sh){
      BOX(dp2[0], y+sh, dp2[1], 1.2, 0.18, 3.3, ry, shade(TRUNKC[0],-0.15), 'wood');
      for(var v=0; v<3; v++){
        var vp = loc(dp2[0], dp2[1], rr(-0.35,0.35), (v-1)*1.05 + rr(-0.2,0.2), ry);
        var vr = rr(0.24,0.40);
        CYL(vp[0], y+sh+0.18, vp[1], vr, vr*rr(1.6,2.4), 0, shade(glassCol, rr(-0.06,0.08)));
      }
    });
    DOME(dp2[0], y+2.58+0.18, dp2[1], 0.5, 0.42, 0, shade(glassCol, 0.06));

    GUILD_WORK_POSTS.push({ x:bp[0], z:bp[1], y:y, ry:ry+Math.PI, role:'glassblower', radius:1.0 });
  })();
}
