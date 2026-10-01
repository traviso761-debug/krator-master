/* ==== reusable props ==== */

function shrineTriptych(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 8, d = opt.d || 3.2;
  var c = col || 0x9d9278;
  BOX(x, y, z, w, 0.7, d, ry, shade(c,-0.1));
  var y0 = y+0.7;
  [-1,0,1].forEach(function(n){
    var p = loc(x,z, n*w*0.30, 0, ry);
    var tall = (n===0);
    var nh = tall ? rr(3.4,4.2) : rr(2.3,3.0);
    BOX(p[0], y0, p[1], w*0.24, nh, d*0.7, ry, shade(c, tall?0.06:-0.02));
    FR3(p[0], y0+nh, p[1], w*0.18, tall?rr(2.6,3.6):rr(1.6,2.4), d*0.55, ry, shade(c,0.1));
  });
}

function statue(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || 5.5, w = opt.w || 1.8;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.6, 0.9, w*1.6, ry, shade(c,-0.2));
  BOX(x, y+0.9, z, w*1.1, 0.5, w*1.1, ry, shade(c,-0.1));
  var by = y+1.4;
  FR6(x, by, z, w*0.85, h*0.62, w*0.85, ry, shade(c,0.04));             /* robed body */
  CYL(x, by+h*0.62, z, w*0.30, h*0.14, 0, shade(c,0.08));                /* neck block */
  DOME(x, by+h*0.62+h*0.14, z, w*0.22, w*0.26, 0, shade(c,0.12), 'dome');/* abstracted head */
  [-1,1].forEach(function(s){                                            /* suggested arms */
    var p = loc(x,z, s*w*0.42, 0, ry);
    FR8(p[0], by+h*0.20, p[1], w*0.22, h*0.34, w*0.22, ry, shade(c,-0.02));
  });
}

function obelisk(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 4, h = opt.h || 16;
  var c = col || pick(TONES);
  BOX(x, y, z, w*1.3, 1.0, w*1.3, ry, shade(c,-0.15));
  BOX(x, y+1.0, z, w, 0.8, w, ry, shade(c,-0.05));
  FR3(x, y+1.8, z, w*0.62, h, w*0.62, ry, c);
  CONE(x, y+1.8+h, z, w*0.12, w*0.4, ry, shade(c,0.1));
}

/* a street bench — plain and ornate variants */
function benchPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.2, d = opt.d || 0.9, h = opt.h || 0.9;
  var c = col || shade(pick(TONES),-0.1);
  BOX(x, y+h*0.45, z, w, h*0.55, d, ry, c, 'wood');
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.42, 0, ry);
    BOX(p[0], y, p[1], 0.25, h*0.45, d*0.9, ry, shade(c,-0.25));
  });
}
function benchOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 3.4, d = opt.d || 1.0, h = opt.h || 1.0;
  var c = col || pick(TONES);
  BOX(x, y+h*0.4, z, w, h*0.5, d, ry, c);
  BOX(x, y+h*0.9, z, w*1.04, 0.18, d*1.1, ry, shade(c,0.12));
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*w*0.46, 0, ry);
    BOX(p[0], y, p[1], 0.32, h*0.45, d*1.05, ry, shade(c,-0.22));
    FR3(p[0], y+h*0.9, p[1], 0.5, 0.7, 0.5, ry, shade(c,0.05));
  });
  var backP = loc(x,z, 0, -d*0.42, ry);
  BOX(backP[0], y+h*0.9, backP[1], w*0.96, 1.1, 0.18, ry, shade(c,-0.05));
}

function brazierPlain(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.55, h = opt.h || 1.0;
  var mCol = col || 0x6b6258;
  CYL(x, y, z, r*0.22, h*0.8, 0, shade(mCol,-0.2), 'wood');
  CYL(x, y+h*0.8, z, r, h*0.35, 0, mCol, 'metal');
  CONE(x, y+h*0.8+0.1, z, r*0.7, r*1.3, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.8+r*0.5, z, r*0.5, r*0.7, rnd()*3, 0xe89a3c);

  nlLampAdd(x, y+h*0.8+r*0.5, z, 0.85*(r/0.55), 15*Math.sqrt(r/0.55));
}
function brazierOrnate(x,y,z,ry,col,opt){
  opt = opt || {};
  var r = opt.r || 0.65, h = opt.h || 1.3;
  var mCol = col || 0x7a6f5c;
  CYL(x, y, z, r*0.20, h*0.85, 0, shade(mCol,-0.25), 'metal');
  CYL(x, y+h*0.3, z, r*0.55, 0.15, 0, shade(mCol,0.1), 'metal');
  CYL(x, y+h*0.85, z, r*1.05, h*0.3, 0, mCol, 'metal');
  FR3(x, y+h*0.85+h*0.3, z, r*1.3, r*0.6, r*1.3, rnd()*3, shade(mCol,-0.1));
  CONE(x, y+h*0.85+0.1, z, r*0.8, r*1.5, rnd()*3, 0xd9762c);
  BLOB(x, y+h*0.85+r*0.6, z, r*0.6, r*0.8, rnd()*3, 0xe89a3c);
  nlLampAdd(x, y+h*0.85+r*0.6, z, 1.15*(r/0.65), 18*Math.sqrt(r/0.65));   /* see brazierPlain above */
}

function siltStriderStation(x,y,z,ry,col,opt){
  opt = opt || {};
  var pw = opt.w || 16, pd = opt.d || 22, ph = opt.h || 3.4;
  var deckCol = col || pick(TONES_POOR);
  var postCol = shade(deckCol,-0.3);
  [[-0.8,-0.8],[-0.8,0.8],[0.8,-0.8],[0.8,0.8],[0,-0.8],[0,0.8]].forEach(function(c2){
    var p = loc(x,z, c2[0]*pw*0.5, c2[1]*pd*0.5, ry);
    CYL(p[0], y-ph, p[1], 0.5, ph, 0, postCol, 'wood');
  });
  BOX(x, y-0.3, z, pw, 0.6, pd, ry, deckCol, 'wood');
  var railH = 1.1;
  [-1,1].forEach(function(s2){
    var p2 = loc(x,z, 0, s2*(pd*0.5-0.15), ry);
    BOX(p2[0], y, p2[1], pw*0.94, railH, 0.3, ry, postCol, 'wood');
  });
  var railP = loc(x,z, pw*0.5-0.15, 0, ry);
  BOX(railP[0], y, railP[1], 0.3, railH, pd*0.94, ry, postCol, 'wood');
  /* a short stepped approach on the open (-x) side, echoing seaStair() */
  var nSteps = 4, rampLen = opt.rampLen || 9, stepLen = rampLen/nSteps;
  for(var i=0;i<nSteps;i++){
    var t = (i+0.5)/nSteps;
    var sx = -pw*0.5 - rampLen*t;
    var sp = loc(x,z, sx, 0, ry);
    BOX(sp[0], y-ph, sp[1], stepLen*1.3, ph*(1-t)+0.4, pw*0.5, ry, deckCol, 'wood');
  }
  /* a small roofed shelter over the back half of the platform */
  var shC = loc(x,z, pw*0.18, 0, ry);
  FR8(shC[0], y+railH+2.4, shC[1], pw*0.68, 1.5, pd*0.68, ry, pick(ROOFS), 'roof');
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c3){
    var p3 = loc(x,z, pw*0.18+c3[0]*pw*0.27, c3[1]*pd*0.27, ry);
    CYL(p3[0], y+railH, p3[1], 0.22, 2.4, 0, postCol, 'wood');
  });
}

/* a small canoe, optionally with a little cloth sail */
function canoe(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 5.5, beam = opt.beam || 1.3;
  var hullCol = col || 0x6b5942;
  var nseg = 4;
  for(var i=0;i<nseg;i++){
    var t = (i+0.5)/nseg, lz = len*(t-0.5);
    var taper = Math.sin(Math.PI*Math.pow(t,0.8));
    var bw = beam*(0.25+0.75*taper);
    var p = loc(x,z, 0, lz, ry);
    FR6(p[0], y, p[1], bw, 0.6, len/nseg*1.15, ry, hullCol, 'wood');
  }
  if(opt.sail){
    var mp = loc(x,z, 0, 0, ry);
    var sailH = opt.sailH || 2.6;
    CYL(mp[0], y+0.5, mp[1], 0.08, sailH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+0.6, mp[1], 0.05, sailH-0.6, beam*0.7, ry, pick(SAILC), 'cloth');
  }
}

function ferry(x,y,z,ry,col,opt){
  opt = opt || {};
  var len = opt.len || 16, beam = opt.beam || 6;
  var hullCol = col || 0x5e4d3a;
  BOX(x, y-1.6, z, beam, 2.6, len, ry, hullCol, 'wood');
  BOX(x, y+0.6, z, beam*0.92, 0.5, len*0.96, ry, shade(hullCol,-0.15), 'wood');
  var cab = loc(x,z, 0, -len*0.22, ry);
  BOX(cab[0], y+1.1, cab[1], beam*0.6, 2.2, len*0.28, ry, shade(hullCol,0.08), 'wood');
  if(opt.mast !== false){
    var mp = loc(x,z, 0, len*0.18, ry);
    var mastH = opt.mastH || 7;
    CYL(mp[0], y+1.1, mp[1], 0.18, mastH, 0, shade(hullCol,-0.2), 'wood');
    BOX(mp[0], y+1.6, mp[1], 0.06, mastH-1, beam*0.55, ry, pick(SAILC), 'cloth');
  }
  for(var k=0;k<(opt.cargo||2);k++){
    var q = loc(x,z, rr(-1,1), len*(0.30+k*0.14), ry);
    BOX(q[0], y+1.1, q[1], rr(1.6,2.4), rr(1.2,2.0), rr(1.6,2.4), ry+rr(-0.3,0.3), pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
  }
}

/* ==== more reusable props: trees & funerary ==== */

function baobab(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(14,22);
  var trunkR = opt.trunkR || h*rr(0.16,0.22);
  var trunkCol = col || pick(TRUNKC);

  FR6(x, y, z, trunkR*2.3, h*0.50, trunkR*2.3, ry, trunkCol, 'trunk');
  FR6(x, y+h*0.50, z, trunkR*1.35, h*0.32, trunkR*1.35, ry, shade(trunkCol,0.04), 'trunk');
  var topY = y + h*0.82;
  CYL(x, topY, z, trunkR*0.62, h*0.06, 0, shade(trunkCol,-0.05), 'trunk');
  topY += h*0.06;

  var nb = opt.branches || ri(4,6);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.3,0.3);
    var reach = trunkR*rr(1.4,2.2);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.10,0.16);
    STK(bx, topY, bz, trunkR*0.12, blen, 0, shade(trunkCol,-0.08), 'trunk');
    BLOB(bx, topY+blen*0.85, bz, rr(1.3,2.1), rr(1.0,1.6), rnd()*3, pick(LEAFC), 'leaf');
  }
}

function dragonTree(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(9,15);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = col || pick(TRUNKC);
  var forkY = y + h*rr(0.42,0.55);
  CYL(x, y, z, trunkR, forkY-y, 0, trunkCol, 'trunk');
  var nb = opt.branches || ri(3,5);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.25,0.25);
    var reach = trunkR*rr(1.3,2.0);
    var bx = x+Math.cos(a)*reach, bz = z+Math.sin(a)*reach;
    var blen = h*rr(0.30,0.46);
    var br = trunkR*rr(0.45,0.65);
    CYL(bx, forkY, bz, br, blen, 0, shade(trunkCol,-0.04), 'trunk');
    var topY = forkY+blen;
    var r1 = rr(2.6,4.2);
    /* a dense, flat-topped rosette — a squashed mound, not a rounded tuft */
    BLOB(bx, topY-0.30, bz, r1, r1*0.32, rnd()*3, pick(LEAFC), 'leaf');
    BLOB(bx, topY+r1*0.10, bz, r1*0.78, r1*0.24, rnd()*3, shade(pick(LEAFC),0.05), 'leaf');
  }
}

function cherryBlossom(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(8,13);
  var trunkR = opt.trunkR || rr(0.28,0.42);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyY = y + h*0.55, canopyR = opt.canopyR || h*rr(0.62,0.85);
  var nb = opt.blobs || ri(10,16);
  for(var i=0;i<nb;i++){
    var a = rnd()*Math.PI*2, rdist = Math.sqrt(rnd())*canopyR;
    var bx = x+Math.cos(a)*rdist, bz = z+Math.sin(a)*rdist;
    var by = canopyY + rr(-0.10,0.10)*h + (1-rdist/canopyR)*h*0.12;
    var br = rr(1.1,2.0);
    BLOB(bx, by, bz, br, br*rr(0.55,0.85), rnd()*3, col, 'leaf');
  }
}

function emperorMushroom(x,y,z,ry,col,opt){
  opt = opt || {};
  var stalkH = opt.h || rr(24,36);
  var stalkR = opt.r || rr(2.4,3.8);
  var stalkCol = col || pick(STALKC);
  var capCol = opt.capCol || pick(FUNGC);
  FR6(x, y, z, stalkR*2, stalkH, stalkR*1.5, ry, stalkCol, 'fungus');
  var capR = opt.capR || rr(14,20);
  var capH = capR*rr(0.34,0.46);
  BLOB(x, y+stalkH-capH*0.35, z, capR, capH, rnd()*3, capCol, 'fungus');
  CYL(x, y+stalkH-capH*0.55, z, capR*0.82, capH*0.16, 0, shade(capCol,-0.18), 'fungus');    /* gilled rim */
  if(opt.brood !== false){
    var n = ri(2,4);
    for(var i=0;i<n;i++){
      var a = rnd()*Math.PI*2, dist = stalkR*rr(2.2,4.0);
      var bx = x+Math.cos(a)*dist, bz = z+Math.sin(a)*dist;
      var sh = rr(2.5,4.5), sr = rr(0.4,0.7);
      STK(bx, y, bz, sr, sh, 0, stalkCol, 'fungus');
      var cr = sr*rr(2.6,3.6);
      BLOB(bx, y+sh-0.4, bz, cr, cr*0.55, rnd()*3, capCol, 'fungus');
    }
  }
}

/* ==== more trees & wild flora ==== */

function bulbPod(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var podCol = col || pick(FUNGC);
  var nb = opt.baseLeaves || ri(2,4);
  for(var i=0;i<nb;i++){
    var a0 = rnd()*Math.PI*2, r0 = rr(0.3,1.1);
    var br = rr(1.1,2.0);
    BLOB(x+Math.cos(a0)*r0, y-0.2, z+Math.sin(a0)*r0, br, br*rr(0.35,0.55), rnd()*3, pick(LEAFC), 'leaf');
  }
  for(var k=0;k<n;k++){
    var a = rnd()*Math.PI*2, reach = rr(0.6,2.2);
    var sx = x+Math.cos(a)*reach, sz = z+Math.sin(a)*reach;
    var sh = rr(1.6,3.6);
    STK(sx, y, sz, rr(0.12,0.20), sh, 0, pick(STALKC), 'trunk');
    var podR = rr(0.7,1.3), podH = podR*rr(1.5,2.1);          /* ovoid, not a cap */
    BLOB(sx, y+sh-0.15, sz, podR, podH, rnd()*3, podCol, 'fungus');
    BLOB(sx, y+sh+podH*0.75, sz, podR*0.36, podR*0.30, rnd()*3, shade(podCol,-0.2), 'fungus');  /* nub tip */
  }
}

function spineRosette(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(8,14);
  var leafCol = col || pick(LEAFC);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.18,0.18);
    var reach = rr(0.4,1.1);
    var lx = x+Math.cos(a)*reach, lz = z+Math.sin(a)*reach;
    var lh = rr(1.6,3.4), lr = rr(0.22,0.42);
    CONE(lx, y, lz, lr, lh, a, shade(leafCol, rr(-0.08,0.10)), 'leaf');
  }
  if(opt.bloom !== false && chance(0.30)){
    var bh = rr(6,11);
    STK(x, y, z, 0.16, bh, 0, pick(STALKC), 'trunk');
    var nb = ri(4,7);
    for(var k=0;k<nb;k++){
      var t = (k+1)/nb;
      var by = y + bh*t;
      var bo = loc(x,z, rr(-0.5,0.5), rr(-0.5,0.5), rnd()*6.28);
      BLOB(bo[0], by, bo[1], rr(0.35,0.6), rr(0.4,0.7), rnd()*3, pick(BLOOMC), 'leaf');
    }
  }
}

function coralShrub(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(2.0,4.5);
  var trunkCol = col || pick(TRUNKC);
  var tipCol = opt.tipCol || pick(FUNGC);
  CYL(x, y, z, rr(0.22,0.34), h*0.4, 0, trunkCol, 'trunk');
  var n = opt.branches || ri(5,9);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.3,0.3);
    var stubY = y + h*0.4*rr(0.3,1.0);
    var reach1 = rr(0.8,1.6), len1 = h*rr(0.35,0.55);
    var p1 = loc(x,z, Math.cos(a)*reach1, Math.sin(a)*reach1, 0);
    CYL(p1[0], stubY, p1[1], rr(0.10,0.16), len1, 0, shade(trunkCol,-0.05), 'trunk');

    var reach2 = reach1 + rr(0.5,1.0);
    var p2 = loc(x,z, Math.cos(a+rr(-0.5,0.5))*reach2, Math.sin(a+rr(-0.5,0.5))*reach2, 0);
    var len2 = len1*rr(0.4,0.7);
    CYL(p2[0], stubY+len1*0.7, p2[1], rr(0.07,0.11), len2, 0, shade(trunkCol,0.03), 'trunk');
    BLOB(p2[0], stubY+len1*0.7+len2-0.1, p2[1], rr(0.30,0.55), rr(0.30,0.55), rnd()*3, tipCol, 'fungus');
  }
}

function archingBladder(x,y,z,ry,col,opt){
  opt = opt || {};
  var n = opt.n || ri(3,6);
  var bladderCol = col || pick(FUNGC);
  BLOB(x, y-0.15, z, rr(0.7,1.1), rr(0.35,0.5), rnd()*3, pick(LEAFC), 'leaf');   /* low crown */
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.25,0.25);
    var steps = 3, rise = rr(1.4,2.2), reach = rr(2.2,3.6);
    var lastX=x, lastZ=z, lastY=y;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;

      var yy = y + rise*Math.sin(Math.PI*t);
      var rr2 = reach*t;
      var px = x+Math.cos(a)*rr2, pz = z+Math.sin(a)*rr2;
      var segH = Math.max(0.3, Math.abs(yy-lastY)) + 0.4;
      var baseY = Math.min(yy,lastY);
      CYL((lastX+px)/2, baseY, (lastZ+pz)/2, 0.09, segH, 0, pick(TRUNKC), 'trunk');
      lastX=px; lastZ=pz; lastY=yy;
    }
    var podR = rr(0.5,0.9);
    BLOB(lastX, Math.max(y,lastY-podR*0.3), lastZ, podR, podR*rr(1.3,1.7), rnd()*3, bladderCol, 'fungus');
  }
}

/* ==== named species: weeping willow, mangrove, giant fern, giant groundsel. ==== */

function weepingWillow(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(11,17);
  var trunkR = opt.trunkR || rr(0.5,0.8);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(WILLOWC);
  var canopyY = y + h*0.62;
  STK(x, y, z, trunkR, h*0.62, 0, trunkCol, 'trunk');
  var canopyR = opt.canopyR || h*rr(0.34,0.44);
  BLOB(x, canopyY, z, canopyR, canopyR*0.6, rnd()*3, leafCol, 'leaf');
  var nb = opt.branches || ri(9,15);
  for(var i=0;i<nb;i++){
    var a = (i/nb)*Math.PI*2 + rr(-0.2,0.2);
    var steps = 4, outStep = canopyR*rr(0.22,0.34), drop = (canopyY-y)*rr(0.20,0.27);
    var curR = canopyR*rr(0.75,0.98), curY = canopyY + canopyR*0.15;
    for(var s=0;s<steps;s++){
      var nextR = curR + outStep, nextY = Math.max(y+0.2, curY - drop*(0.7+0.3*s));
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      CYL(mx, nextY, mz, Math.max(0.04, 0.16 - s*0.03), segH, 0, shade(trunkCol,-0.1), 'trunk');
      if(chance(0.7)){
        var tuftR = Math.max(0.4, 1.3 - s*0.25);
        BLOB(x+Math.cos(a)*nextR, nextY+segH*0.5, z+Math.sin(a)*nextR, tuftR, tuftR*0.7, rnd()*3, shade(leafCol, rr(-0.1,0.08)), 'leaf');
      }
      curR = nextR; curY = nextY;
    }
  }
}

function mangrove(x,y,z,ry,col,opt){
  opt = opt || {};
  var baseLift = opt.rootH || rr(2.6,4.2);           /* trunk sits above the water on its roots */
  var h = opt.h || rr(7,11);
  var trunkR = opt.trunkR || rr(0.35,0.55);
  var rootCol = opt.rootCol || shade(pick(TRUNKC),-0.08);
  var leafCol = col || pick(LEAFC);
  var trunkTop = y + baseLift;
  var nr = opt.roots || ri(5,8);
  for(var i=0;i<nr;i++){
    var a = (i/nr)*Math.PI*2 + rr(-0.2,0.2);
    var reach = rr(1.8,3.4);
    var steps = 3;
    var curR = 0.2, curY = trunkTop - baseLift*0.1;
    for(var s=0;s<steps;s++){
      var t = (s+1)/steps;
      var nextR = reach*t, nextY = trunkTop - baseLift*t*t;    /* arcs down faster near the water */
      if(s === steps-1) nextY = y;                             /* the outer leg always meets the waterline */
      var midR = (curR+nextR)*0.5;
      var mx = x+Math.cos(a)*midR, mz = z+Math.sin(a)*midR;
      var segH = Math.max(0.4, curY-nextY);
      var segR = trunkR*(1-t*0.55);
      CYL(mx, nextY, mz, Math.max(0.08,segR), segH, 0, rootCol, 'trunk');
      curR = nextR; curY = nextY;
    }
  }
  CYL(x, trunkTop-baseLift*0.15, z, trunkR, h, 0, opt.trunkCol || pick(TRUNKC), 'trunk');
  var canopyY = trunkTop-baseLift*0.15 + h*0.85;
  var nCan = opt.canopyBlobs || ri(3,5);
  for(var k=0;k<nCan;k++){
    var co = loc(x,z, rr(-1.4,1.4), rr(-1.4,1.4), 0);
    var cr = rr(1.6,2.6);
    BLOB(co[0], canopyY+rr(-0.4,0.5), co[1], cr, cr*rr(0.55,0.8), rnd()*3, leafCol, 'leaf');
  }
}

function giantFern(x,y,z,ry,col,opt){
  opt = opt || {};
  var leafCol = col || pick(LEAFC);
  CYL(x, y, z, rr(0.5,0.8), rr(0.6,1.1), 0, pick(TRUNKC), 'trunk');   /* rhizome stub */
  var n = opt.fronds || ri(9,15);
  var reach = opt.reach || rr(5,8);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.15,0.15);
    var baseH = rr(2.5,4.0), baseR1 = reach*0.35;
    var p1 = loc(x,z, Math.cos(a)*baseR1, Math.sin(a)*baseR1, 0);
    CONE(p1[0], y+0.6, p1[1], rr(0.35,0.5), baseH, a, shade(leafCol,-0.05), 'leaf');
    var tipH = rr(2.0,3.2), tipR2 = reach*rr(0.8,1.0);
    var p2 = loc(x,z, Math.cos(a)*tipR2, Math.sin(a)*tipR2, 0);
    CONE(p2[0], y+0.6+baseH*0.65, p2[1], rr(0.18,0.28), tipH, a, shade(leafCol,rr(0.0,0.12)), 'leaf');
  }
}

function giantGroundsel(x,y,z,ry,col,opt){
  opt = opt || {};
  var h = opt.h || rr(5,9);
  var trunkR = opt.trunkR || rr(0.55,0.85);
  var trunkCol = opt.trunkCol || pick(TRUNKC);
  var leafCol = col || pick(LEAFC);
  FR6(x, y, z, trunkR*2, h, trunkR*2, ry, trunkCol, 'trunk');
  if(opt.skirt !== false){
    var bands = ri(1,2);
    for(var b=0;b<bands;b++){
      var by = y + h*rr(0.30,0.62);
      var nd = ri(6,9);
      for(var d=0;d<nd;d++){
        var da = (d/nd)*Math.PI*2 + rr(-0.2,0.2);
        var dl = rr(0.6,1.1);
        var dp = loc(x,z, Math.cos(da)*trunkR*1.1, Math.sin(da)*trunkR*1.1, 0);
        BOX(dp[0], by+rr(-0.2,0.2), dp[1], dl, 0.14, 0.4, da, shade(trunkCol,-0.22), 'trunk');
      }
    }
  }
  var topY = y + h;
  var n = opt.leaves || ri(12,18);
  var leafLen = opt.leafLen || rr(2.4,3.6);
  for(var i=0;i<n;i++){
    var a = (i/n)*Math.PI*2 + rr(-0.12,0.12);
    var ll = leafLen*rr(0.85,1.15);
    var lp = loc(x,z, ll*0.5, 0, a);
    BOX(lp[0], topY+rr(-0.35,0.45), lp[1], ll, 0.16, ll*rr(0.30,0.42), a, shade(leafCol, rr(-0.1,0.1)), 'leaf');
  }
  BLOB(x, topY+0.1, z, trunkR*0.9, trunkR*0.7, rnd()*3, shade(leafCol,0.06), 'leaf');   /* closed inner bud */
}

/* ==== funerary objects, small to large ==== */

function grave(x,y,z,ry,col,opt){
  opt = opt || {};
  var c = col || pick(TONES_POOR);
  if(opt.mound){
    var r = opt.r || rr(1.4,2.0);
    BLOB(x, y, z, r, r*0.5, ry, shade(c,-0.1));
  }else{
    var w = opt.w || rr(0.8,1.1), hh = opt.h || rr(1.2,1.8), th = opt.th || 0.25;
    BOX(x, y, z, th, hh, w, ry, shade(c,-0.05));
    BOX(x, y-0.1, z, th*3.0, 0.2, w*1.6, ry, shade(c,-0.15));
  }
}

function familyTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(5,7), d = opt.d || rr(5,7), h = opt.h || rr(4,6);
  var c = col || pick(TONES);
  BOX(x, y, z, w, h, d, ry, c);
  BOX(x, y+h, z, w*1.06, 0.6, d*1.06, ry, shade(c,-0.12));
  var dp = loc(x,z, w*0.5+0.03, 0, ry);
  BOX(dp[0], y+0.2, dp[1], 0.3, h*0.55, w*0.34, ry, shade(c,-0.4), 'wood');
  if(opt.roof === 'dome' || (opt.roof === undefined && chance(0.5))){
    DOME(x, y+h+0.6, z, Math.min(w,d)*0.42, Math.min(w,d)*0.34, ry, pick(DOMEC), 'dome');
  }else{
    FR3(x, y+h+0.6, z, Math.min(w,d)*0.7, h*0.5, Math.min(w,d)*0.7, ry, shade(c,0.05));
  }
}

function funeraryTemple(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || 46, d = opt.d || 64, h = opt.h || 34;
  var mCol = col;
  var greyCol = opt.greyCol || pick(GREYC);
  var jadeCol = opt.jadeCol || pick(JADEC);
  var accum = y;

  var socleW = w*1.22, socleD = d*1.16, socleH = h*0.035;
  BOX(x, accum, z, socleW, socleH, socleD, ry, greyCol);
  accum += socleH;

  var tiers = opt.plinthTiers || 3;
  var pw = w*1.14, pd = d*1.10, ph = h*0.05;
  for(var t=0;t<tiers;t++){
    BOX(x, accum, z, pw, ph, pd, ry, shade(mCol,-0.05+t*0.02));
    accum += ph;

    if(t<tiers-1){
      BOX(x, accum+0.05, z, pw*0.985, ph*0.28, pd*0.985, ry, jadeCol);
    }
    pw *= 0.965; pd *= 0.965;
  }
  var deckY = accum;
  var cellaH = h*0.5;
  BOX(x, deckY, z, w*0.62, cellaH, d*0.72, ry, mCol);

  BOX(x, deckY+0.05, z, w*0.635, cellaH*0.09, d*0.735, ry, jadeCol);

  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.31, s*d*0.18, ry);
    BOX(pp[0], deckY, pp[1], w*0.03, cellaH*0.9, d*0.05, ry, jadeCol);
  });
  BOX(x, deckY+cellaH, z, w*0.66, h*0.04, d*0.76, ry, greyCol);
  var nCols = opt.columns || 18;
  var colR = Math.min(w,d)*0.018+0.5, colH = cellaH*0.94;
  for(var i=0;i<nCols;i++){
    var t2 = i/nCols;
    var ex = Math.cos(t2*Math.PI*2), ez = Math.sin(t2*Math.PI*2);
    var cx = x + ex*w*0.54, cz = z + ez*d*0.47;
    CYL(cx, deckY, cz, colR, colH, 0, shade(mCol,0.03));
    BOX(cx, deckY+colH, cz, colR*2.6, colH*0.05, colR*2.6, 0, greyCol);
  }

  var porticoX = w*0.31 + w*0.25 - w*0.03;
  var portico = loc(x,z, porticoX, 0, ry);
  var pW = w*0.5, pD = d*0.20;
  BOX(portico[0], deckY, portico[1], pW, cellaH*0.92, pD, ry, shade(mCol,0.02));
  var pedY = deckY+cellaH*0.92;
  FR3(portico[0], pedY, portico[1], pW*1.04, h*0.12, pD*1.04, ry, shade(mCol,0.05));
  /* jade tympanum inlay set into the pediment face, facing the approach */
  var tymp = loc(x,z, porticoX+pD*0.52+0.05, 0, ry);
  BOX(tymp[0], pedY+0.1, tymp[1], pW*0.34, h*0.05, pD*0.12, ry, jadeCol);
  [-1,1].forEach(function(s){
    var cp = loc(x,z, porticoX+pD*0.5-0.6, s*pW*0.36, ry);
    CYL(cp[0], deckY, cp[1], colR*1.15, cellaH*0.90, 0, shade(mCol,0.04));
    BOX(cp[0], deckY+cellaH*0.90, cp[1], colR*1.15*2.6, colH*0.05, colR*1.15*2.6, 0, greyCol);
  });

  var fdFrontX = porticoX + pW*0.5;
  var fdW = pD*0.70, fdH = cellaH*0.52;
  var fdP = loc(x,z, fdFrontX+0.05, 0, ry);
  BOX(fdP[0], deckY, fdP[1], 0.60, fdH, fdW, ry, shade(jadeCol,-0.45));
  [-1,1].forEach(function(s){
    var lp = loc(x,z, fdFrontX+0.26, s*fdW*0.26, ry);
    BOX(lp[0], deckY, lp[1], 0.38, fdH*0.97, fdW*0.46, ry, shade(TRUNKC[0],-0.30), 'wood');
  });
  var fdL = loc(x,z, fdFrontX+0.12, 0, ry);
  BOX(fdL[0], deckY+fdH, fdL[1], 0.85, cellaH*0.05, fdW*1.25, ry, greyCol);

  BOX(fdL[0], deckY+fdH+cellaH*0.05, fdL[1], 0.5, cellaH*0.10, fdW*0.86, ry, jadeCol);
  var fdS = loc(x,z, fdFrontX+1.1, 0, ry);
  BOX(fdS[0], deckY-0.35, fdS[1], 2.2, 0.7, fdW*1.35, ry, shade(mCol,-0.06));
  var domeR = Math.min(w,d)*0.30;

  CYL(x, deckY+cellaH+h*0.04, z, domeR*1.05, h*0.06, 0, greyCol);
  CYL(x, deckY+cellaH+h*0.10, z, domeR*1.01, h*0.02, 0, jadeCol);
  DOME(x, deckY+cellaH+h*0.12, z, domeR, domeR*0.85, 0, mCol, 'dome');
  CONE(x, deckY+cellaH+h*0.12+domeR*0.85, z, domeR*0.08, h*0.05, 0, jadeCol);
}

var TEMPLE_ALTAR = null;
window.TEMPLE_BRAZIERS = [];
(function(){
  var c = CIDX['Temple']; if(!c) return;
  var top = CANTON_TOPS['Temple']; if(!top) return;
  var angle = Math.atan2(-c.z, -c.x);
  var dirX = Math.cos(angle), dirZ = Math.sin(angle);
  var ry = Math.atan2(dirX, dirZ);

  /* the altar, centred under the dome, inside the pillar ring */
  var altarX = c.x, altarZ = c.z, altarY = top.y + 0.3;
  BOX(altarX, altarY, altarZ, 6.0, 2.4, 4.0, ry, shade(c.tone,0.08));
  CYL(altarX, altarY+2.4, altarZ, 0.4, 1.4, 0, 0x6b1f1f);

  var stepN = 7, stepW = 6.0, stepD = 1.15, stepH = 0.5;
  var doorX = c.x + dirX*top.hw, doorZ = c.z + dirZ*top.hw;
  for(var st=0; st<stepN; st++){
    var stY = top.y - st*stepH;
    var stX = doorX + dirX*(st*stepD), stZ = doorZ + dirZ*(st*stepD);
    BOX(stX, stY, stZ, stepW, 0.5, stepD*1.05, ry, shade(c.tone, st%2 ? 0.02 : -0.06));
  }
  [-1,1].forEach(function(side){
    var sx = doorX + (-dirZ)*side*stepW*0.5, sz = doorZ + (dirX)*side*stepW*0.5;
    var ex = sx + dirX*(stepN*stepD*0.5), ez = sz + dirZ*(stepN*stepD*0.5);
    BOX(ex, top.y - (stepN*stepH*0.5) + 0.5, ez, 0.6, stepN*stepH+1.0, stepN*stepD, ry, shade(c.tone,-0.18));
  });
  TEMPLE_ALTAR = { x:altarX, z:altarZ, y:altarY+2.4, doorX:doorX, doorZ:doorZ, ry: ry+Math.PI };

  var brazierR = Math.min(window.TEMPLE_PILLAR_RING_R*0.55, 9.0);
  for(var bz=0; bz<4; bz++){
    var ba = Math.PI/4 + bz*Math.PI/2;
    var bx = altarX + Math.cos(ba)*brazierR, bzz = altarZ + Math.sin(ba)*brazierR;
    var bowlY = top.y;
    CYL(bx, bowlY, bzz, 1.1, 3.0, 0, shade(c.tone,-0.05), 'wood');
    CYL(bx, bowlY+3.0, bzz, 2.0, 1.4, 0, 0xc9a227);
    CYL(bx, bowlY+3.6, bzz, 1.5, 0.6, 0, shade(0xc9a227,-0.15));
    window.TEMPLE_BRAZIERS.push({ x:bx, y:bowlY+4.4, z:bzz });
  }
})();
