/* ==== ANCESTRY: THE NECROPOLIS SPIRAL ==== */
var ANCESTRY = {
  turns     : 12,    /* corner-to-corner ramp segments, base to summit deck  */
  plinthTop : 5,     /* same base-plinth convention every other canton uses  */
  hwTop     : 30,    /* summit deck half-width                              */
  topY      : 150,   /* summit deck height (fountain rises above this)      */
  rampW     : 12,    /* walkway width                                       */
  bedW      : 13,    /* planted-bed strip width, inward of the walkway      */

  wallH     : 1.6,   /* tomb-wall height, outward of the walkway — person-scale */
  wallT     : 2.6,   /* tomb-wall thickness                                 */
  channelW  : 3.4,
  coreSeg   : 4

};

function wallNicheTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(3.2,4.2), h = opt.h || rr(3.6,4.6), dep = opt.depth || 1.6;
  var c = col || pick(TONES);
  var np = loc(x,z, dep*0.5, 0, ry);
  BOX(np[0], y, np[1], dep, h, w, ry, shade(c,-0.42));             /* recessed dark alcove */
  var lp = loc(x,z, dep*1.02, 0, ry);
  BOX(lp[0], y+h, lp[1], dep*1.6, 1.1, w*1.18, ry, shade(c,0.05)); /* pediment lid */
  BOX(x, y-0.3, z, 1.4, 0.6, w*1.05, ry, shade(c,-0.10));          /* kerb underfoot */
}

function steppedTomb(x,y,z,ry,col,opt){
  opt = opt || {};
  var w = opt.w || rr(4.4,5.6), h1 = opt.h || rr(3.2,4.2), h2 = h1*0.62;
  var c = col || pick(TONES);
  BOX(x, y, z, w, h1, w, ry, c);
  BOX(x, y+h1, z, w*1.08, 0.6, w*1.08, ry, shade(c,-0.12));
  BOX(x, y+h1+0.6, z, w*0.62, h2, w*0.62, ry, shade(c,0.03));
  FR3(x, y+h1+0.6+h2, z, w*0.30, h2*0.85, w*0.30, ry, shade(c,-0.08));
  var dp = loc(x,z, w*0.5+0.03, 0, ry);
  BOX(dp[0], y+0.2, dp[1], 0.3, h1*0.5, w*0.30, ry, shade(c,-0.4), 'wood');
}

function ancestryCascade(x,z,yTop,yBot,ry){
  var dropH = Math.max(1.5, yTop-yBot);
  BOX(x, yBot, z, 3.0, dropH, 0.7, ry, 0x8fb8c4);
  BLOB(x, yBot+0.5, z, 2.1, 1.2, ry, 0xd8e8ea, 'leaf');
}

function ancestryCanton(c){
  var A = ANCESTRY;
  var savedSeed = seed;         /* isolate Port/Lighthouse — see file comment above */

  var bed = bedAt(c.x,c.z), plinthTop = A.plinthTop;
  var hw0 = c.r*0.97;

  var y0 = plinthTop;
  var shrink = Math.pow(A.hwTop/hw0, 1/A.turns);

  FR8(c.x, bed, c.z, hw0*2.06, plinthTop-bed, hw0*2.06, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.3, c.z, hw0*2.14, 2.3, hw0*2.14, 0, shade(c.tone,-0.38));

  var ANGLE0 = Math.PI/4;

  var CORN = [];
  for(var i=0;i<=A.turns;i++){
    var hwi = hw0*Math.pow(shrink,i);
    var ang = ANGLE0 + i*(Math.PI/2);
    var r = hwi*Math.SQRT2;
    var yi = y0 + i*(A.topY-y0)/A.turns;
    var p = loc(c.x,c.z, 0, r, ang);
    CORN.push({x:p[0], z:p[1], y:yi, hw:hwi});
  }

  var coreSeg = A.coreSeg, coreRecess = A.rampW*0.5+A.bedW+8;

  for(var s0=0; s0<A.turns; s0++){
    var Pa = CORN[s0], Pb = CORN[s0+1];
    for(var sc=0; sc<coreSeg; sc++){
      var t0c = sc/coreSeg, t1c = (sc+1)/coreSeg;
      var hwC = (mix(Pa.hw, Pb.hw, t0c) - coreRecess) * 0.985;
      var yC = Pa.y + (Pb.y-Pa.y)*t0c;
      var yC1 = Pa.y + (Pb.y-Pa.y)*t1c;
      BOX(c.x, yC, c.z, hwC*2, (yC1-yC)+0.3, hwC*2, 0, shade(c.tone, sc%2 ? 0.02 : -0.03));
    }
  }

  var CROSS = [[], [], [], []];

  for(var t0=0; t0<A.turns; t0++){
    var P0 = CORN[t0], P1 = CORN[t0+1];
    var dx = P1.x-P0.x, dz = P1.z-P0.z, L = Math.hypot(dx,dz);
    var ry = Math.atan2(dx,dz);
    var midx = (P0.x+P1.x)*0.5, midz = (P0.z+P1.z)*0.5, midy = (P0.y+P1.y)*0.5;
    var outx = midx-c.x, outz = midz-c.z, outL = Math.hypot(outx,outz) || 1;
    outx/=outL; outz/=outL;
    var k = t0 % 4;
    CROSS[k].push({x:midx, z:midz, y:midy, outx:outx, outz:outz, turn:t0});

    var nSeg = 5;
    for(var s1=0; s1<nSeg; s1++){
      var tt = (s1+0.5)/nSeg;
      var x = P0.x+dx*tt, z = P0.z+dz*tt, y = P0.y+(P1.y-P0.y)*tt;
      var segLen = L/nSeg*1.15;

      var faceOut = A.rampW*0.5+A.wallT+1.0, faceIn = A.rampW*0.5+A.bedW+1.8;
      var faceOff = (faceOut-faceIn)*0.5, faceDrop = (P1.y-P0.y)+3.0;
      var fx2 = x + outx*faceOff, fz2 = z + outz*faceOff;
      BOX(fx2, y-1.0-faceDrop, fz2, faceOut+faceIn, faceDrop+1.2, segLen, ry, shade(c.tone,-0.16));
      /* walkway */
      BOX(x, y-1.0, z, A.rampW, 1.6, segLen, ry, shade(c.tone,-0.10));

      var bx = x - outx*(A.rampW*0.5+A.bedW*0.5+1.4), bz = z - outz*(A.rampW*0.5+A.bedW*0.5+1.4);
      BOX(bx, y-0.6, bz, A.bedW, 1.5, segLen, ry, shade(c.tone,-0.22));

      var wx = x + outx*(A.rampW*0.5+A.wallT*0.5+0.5), wz = z + outz*(A.rampW*0.5+A.wallT*0.5+0.5);
      BOX(wx, y-1.0, wz, A.wallT, A.wallH, segLen, ry, shade(c.tone, s1%2 ? -0.05 : 0.03));
      BOX(wx, y-1.0+A.wallH, wz, A.wallT*1.3, 0.5, segLen, ry, shade(c.tone,-0.20));
    }

    var op = P0, opx = op.x-c.x, opz = op.z-c.z, opL = Math.hypot(opx,opz)||1;
    var cox = opx/opL, coz = opz/opL;
    var pp = loc(op.x, op.z, 0, A.rampW*0.5+A.wallT*0.5+0.5, Math.atan2(cox,coz));
    FR3(pp[0], op.y-1.0, pp[1], A.wallT*0.95, A.wallH*1.3, A.wallT*0.95, 0, shade(c.tone,0.06));

    var nTombs = Math.max(2, Math.round(L/17));
    for(var tb=0; tb<nTombs; tb++){
      var tt2 = (tb+0.5)/nTombs;
      var tx = P0.x+dx*tt2, tz = P0.z+dz*tt2, ty = P0.y+(P1.y-P0.y)*tt2;
      var tr = A.rampW*0.5+A.wallT*0.35;
      var tpx = tx+outx*tr, tpz = tz+outz*tr;
      var ryT = Math.atan2(-outz, outx);   /* faces outward — loc()'s +lx convention, see familyTomb()/grave() */
      var pick2 = rnd();
      if(pick2 < 0.36) familyTomb(tpx, ty-0.6, tpz, ryT, pick(TONES), {w:rr(4.6,6.4), d:rr(4.0,5.2), h:rr(3.6,5.4)});
      else if(pick2 < 0.62) wallNicheTomb(tpx, ty-0.6, tpz, ryT, pick(TONES));
      else if(pick2 < 0.82) steppedTomb(tpx, ty-0.6, tpz, ryT, pick(TONES));
      else grave(tpx, ty-0.4, tpz, ryT, pick(TONES_POOR), chance(0.5) ? {mound:true} : {});
    }

    var nGrass = Math.max(10, Math.round(L/5));
    for(var gI=0; gI<nGrass; gI++){
      var gt = rnd();
      var gx0 = P0.x+dx*gt, gz0 = P0.z+dz*gt, gBEDTOP = P0.y+(P1.y-P0.y)*gt + 0.9;
      var bedR = rr(A.bedW*0.12, A.bedW*0.58);   /* jitter across the bed's own width */
      var gx = gx0 - outx*(A.rampW*0.5+1.4+bedR), gz = gz0 - outz*(A.rampW*0.5+1.4+bedR);
      var gRad = rr(1.6,3.1);
      BLOB(gx, gBEDTOP, gz, gRad, gRad*rr(0.4,0.65), rnd()*3, pick(LEAFC), 'leaf');
      if(chance(0.4)){
        BLOB(gx, gBEDTOP+rr(2.0,3.2), gz, gRad*1.15, gRad*rr(0.30,0.42), rnd()*3, pick(LEAFC), 'leaf');
      }
    }
    var nTrees = 3 + (t0 % 2 === 0 ? 1 : 0);
    for(var trI=0; trI<nTrees; trI++){
      var trt = (trI+0.5)/nTrees;
      var tx0 = P0.x+dx*trt, tz0 = P0.z+dz*trt, trBEDTOP = P0.y+(P1.y-P0.y)*trt + 0.9;
      var trx = tx0 - outx*(A.rampW*0.5+A.bedW*0.5+1.4), trz = tz0 - outz*(A.rampW*0.5+A.bedW*0.5+1.4);
      var pick4 = rnd();
      if(pick4 < 0.34) cherryBlossom(trx, trBEDTOP, trz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(5,8)});
      else if(pick4 < 0.62) dragonTree(trx, trBEDTOP, trz, rnd()*Math.PI*2, null, {h:rr(6,9)});
      else baobab(trx, trBEDTOP, trz, rnd()*Math.PI*2, null, {h:rr(6,9)});
      treeBaseGrass(trx, trz, trBEDTOP);
    }

    var ryChan = Math.atan2(outx,outz);
    BOX(midx, midy+0.35, midz, A.channelW, 0.6, A.rampW*1.2, ryChan, 0x8fb8c4);
    BOX(midx, midy-1.1, midz, A.channelW*1.5, 0.5, A.rampW*1.3, ryChan, shade(c.tone,-0.18));
  }

  var topHw = A.hwTop;
  BOX(c.x, A.topY-1.0, c.z, topHw*2.12, 2.2, topHw*2.12, 0, shade(c.tone,-0.20));
  BOX(c.x, A.topY+1.2, c.z, topHw*1.94, 1.0, topHw*1.94, 0, shade(c.tone,-0.05));

  var deckTop = A.topY + 2.2;

  var fountR = topHw*0.22;
  CYL(c.x, deckTop, c.z, fountR, 2.4, 0, shade(c.tone,0.05));
  CYL(c.x, deckTop+2.4, c.z, fountR*0.5, 3.6, 0, shade(c.accent||c.tone,0.10));
  CYL(c.x, deckTop+6.0, c.z, fountR*0.30, 2.6, 0, shade(c.accent||c.tone,0.14));

  FR3(c.x, deckTop+8.6, c.z, fountR*0.42, 8.0, fountR*0.42, 0, shade(c.accent||c.tone,0.06));
  CONE(c.x, deckTop+16.6, c.z, fountR*0.14, 6.0, 0, shade(c.accent||c.tone,-0.05));
  BLOB(c.x, deckTop+2.4, c.z, fountR*0.62, fountR*0.34, 0, 0xd8e8ea, 'leaf');

  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dir){
    var chanLen = topHw*0.72;
    var mx = c.x+dir[0]*chanLen*0.5, mz = c.z+dir[1]*chanLen*0.5;
    BOX(mx, A.topY+2.3, mz, dir[0]?chanLen:A.channelW, 0.5, dir[0]?A.channelW:chanLen, 0, 0x8fb8c4);
  });

  var qNear = A.channelW+3, qFar = topHw*0.66;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(qs){
    var sx=qs[0], sz=qs[1];
    for(var lg=0; lg<5; lg++){
      var lx = c.x + sx*rr(qNear,qFar), lz = c.z + sz*rr(qNear,qFar);
      var lr = rr(1.6,2.6);
      BLOB(lx, deckTop, lz, lr, lr*rr(0.4,0.6), rnd()*3, pick(LEAFC), 'leaf');
    }
    var cbx = c.x + sx*rr(qNear+4,qFar-4), cbz = c.z + sz*rr(qNear+4,qFar-4);
    cherryBlossom(cbx, deckTop, cbz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(5,7)});
    treeBaseGrass(cbx, cbz, deckTop);
  });

  for(var k2=0; k2<4; k2++){
    var ang2 = k2*(Math.PI/2);
    var edge = loc(c.x,c.z, 0, topHw, ang2);
    var pts = [{x:edge[0], z:edge[1], y:A.topY}].concat(
      CROSS[k2].slice().sort(function(a,b){ return b.turn-a.turn; }).map(function(cr){ return {x:cr.x,z:cr.z,y:cr.y}; })
    );
    var bay = loc(c.x,c.z, 0, hw0*1.08, ang2);
    pts.push({x:bay[0], z:bay[1], y:1.5});
    for(var seg=0; seg<pts.length-1; seg++){
      var pa=pts[seg], pb=pts[seg+1];
      ancestryCascade((pa.x+pb.x)*0.5, (pa.z+pb.z)*0.5, pa.y, pb.y, ang2);
    }
  }

  for(var f2=0; f2<4; f2+=2){
    var a2 = f2*Math.PI/2 + ANGLE0 - Math.PI/4;
    var ex2 = c.x + Math.cos(a2)*hw0*1.04, ez2 = c.z + Math.sin(a2)*hw0*1.04;
    seaStair(ex2, ez2, -a2 + Math.PI, hw0*0.5, y0, -2);
  }

  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(hw0, ferryPier.ry), c.tone);
  }

  var rampTargetY = DECK+2.4, rampBestI = 0, rampBestD = Infinity;
  for(var rti=0; rti<=A.turns; rti++){
    var rtd = Math.abs(CORN[rti].y - rampTargetY);
    if(rtd < rampBestD){ rampBestD = rtd; rampBestI = rti; }
  }
  CANTON_TOPS[c.n] = { y:y0, hw:hw0, spring:plinthTop, entryY:y0, entryHw:hw0,
                        bridgeY:CORN[rampBestI].y, bridgeHw:CORN[rampBestI].hw };

  CANTON_FACES[c.n] = { spiral:true, tiers:[], tone:c.tone,
    levels:[{ y:plinthTop+1.0, hw:(CORN[0].hw - coreRecess)*0.985, outer:hw0*1.07, tier:0, top:false }] };

  seed = savedSeed;   /* restore — see file comment above */
}

function cantonPiers(c){

  var pierY = 5 + 1.2;
  CPIERS.filter(function(p){ return p.canton === c.n; }).forEach(function(p){
    var dx=p.x1-p.x0, dz=p.z1-p.z0, L=Math.hypot(dx,dz), n2=Math.round(L/14);
    for(var k=0;k<n2;k++){
      var t=(k+0.5)/n2, x=p.x0+dx*t, z=p.z0+dz*t;
      BOX(x, pierY, z, p.w, 1.2, L/n2*1.08, Math.atan2(dx,dz), 0x8a7659, 'wood');
    }
  });
}

/* a warehouse shed: long, low, with a gabled roof and a loading door */
function shed(x, yb, z, w, d, h, ry, col){
  BOX(x, yb, z, w, h, d, ry, col);
  BOX(x, yb+h-0.5, z, w*1.04, 0.9, d*1.04, ry, shade(col,-0.18));
  FR8(x, yb+h+0.4, z, w*1.02, h*0.55, d*1.02, ry, pick(ROOFS), 'roof');   /* gable-ish ridge */
  var dr = loc(x,z, 0, d*0.5+0.3, ry);
  BOX(dr[0], yb, dr[1], w*0.28, h*0.62, 0.9, ry, shade(col,-0.45));
}
/* the harbour canton: warehouse rows, cranes, and piers off the lake faces */
function portDeck(c, y, hw, qy, qhw){
  /* which way is the shore? piers go on the other three faces */
  var lp = shoreIn(c.s, 26), sl = Math.hypot(lp[0]-c.x, lp[1]-c.z);
  var sdx = (lp[0]-c.x)/sl, sdz = (lp[1]-c.z)/sl;
  /* sheds and cargo on the low quay, and a stair up to the platform on each face */
  for(var f0=0; f0<4; f0++){
    var a0 = f0*Math.PI/2, ex = Math.cos(a0), ez = Math.sin(a0);
    if(ex*sdx + ez*sdz > 0.5) continue;
    for(var q=-1; q<=1; q+=2){
      var sx = c.x + ex*(qhw-14) + (-ez)*q*qhw*0.55, sz = c.z + ez*(qhw-14) + (ex)*q*qhw*0.55;
      shed(sx, qy, sz, 24, 12, rr(7,10), -a0+Math.PI/2, pick(TONES_POOR));
    }
    for(var g=0; g<6; g++){
      var gx = c.x + ex*(qhw-rr(6,28)) + (-ez)*rr(-qhw*0.9,qhw*0.9), gz = c.z + ez*(qhw-rr(6,28)) + (ex)*rr(-qhw*0.9,qhw*0.9);
      BOX(gx, qy, gz, rr(2.2,4), rr(2,3.6), rr(2.2,4), rnd()*3, pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
    }
    seaStair(c.x + ex*(c.r*1.04), c.z + ez*(c.r*1.04), -a0 + Math.PI, 24, y, qy);
  }
  var rows = 3, per = 4;
  for(var r=0;r<rows;r++){
    for(var k=0;k<per;k++){
      var lx = (r-(rows-1)/2)*hw*0.56, lz = (k-(per-1)/2)*hw*0.40;
      if(Math.abs(lx)>hw*0.80 || Math.abs(lz)>hw*0.80) continue;
      if(chance(0.12)) continue;
      shed(c.x+lx, y, c.z+lz, hw*0.44, hw*0.24, rr(9,13), 0, pick(TONES_POOR));
    }
  }
  /* harbourmaster's tower */
  FR6(c.x + hw*0.70, y, c.z - hw*0.70, 22, 40, 22, 0, shade(c.tone,0.06));
  DOME(c.x + hw*0.70, y+40, c.z - hw*0.70, 8, 6, 0, 0xb8ae90, 'dome');
  for(var f=0; f<4; f++){
    var a = f*Math.PI/2;
    /* skip the face that looks at the shore */
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
          var q = [xx - dir[1]*sg*5.5, zz + dir[0]*sg*5.5];
          CYL(q[0], bedAt(q[0],q[1]), q[1], 1.0, qy-0.6-bedAt(q[0],q[1]), 0, 0x6b5942, 'wood');
        });
      }
      /* a crane at the root */
      if(i===1){ CYL(base[0], qy, base[1], 1.4, 16, 0, 0x5b4b38, 'wood');
                 BOX(base[0]+dir[0]*7, qy+14.5, base[1]+dir[1]*7, 2, 1.6, 16, -a+Math.PI/2, 0x5b4b38, 'wood'); }
    }
  }
}
