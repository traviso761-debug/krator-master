/* ==== 15b. MONASTERY COMPOUND ==== */
reseed(610001);

/* ==== tuning ==== */
var MONASTERY = {
  fx: 130, fz: 112,
  wallH: [11, 15], wallT: 2.6, gapF: 0.24,     /* curtain wall height range, thickness, gate-gap fraction of fz */
  fieldCount: 10,
  wellR: 2.6,
  penW: 26, penD: 20,

  coopCount: 3, coopW: 9, coopD: 7
};

/* ==== a well: low stone ring, two posts, a crossbeam and a little roof ==== */
function monasteryWell(x, y, z, r, ry){
  var col = shade(pick(TONES), -0.05);
  CYL(x, y, z, r, r*1.15, 0, col);
  CYL(x, y+r*1.15, z, r*1.10, 0.3, 0, shade(col,-0.2));
  [-1,1].forEach(function(s){
    var p = loc(x,z, s*r*0.9, 0, ry);
    BOX(p[0], y, p[1], 0.6, r*2.4, 0.6, ry, pick(TRUNKC), 'wood');
  });
  BOX(x, y+r*2.4, z, r*2.1, 0.5, 0.5, ry, pick(TRUNKC), 'wood');
  CONE(x, y+r*2.4+0.5, z, r*1.35, r*1.15, ry, pick(ROOFS));
}

/* ==== an animal pen: post-and-rail fence, a lean-to (reuses shed()) and a ==== */
function monasteryPen(x, y, z, halfW, halfD, ry){
  var postH = 2.0, railT = 0.28, wood = pick(TRUNKC);
  [[-halfW,-halfD],[-halfW,halfD],[halfW,-halfD],[halfW,halfD]].forEach(function(c){
    var p = loc(x,z, c[0], c[1], ry);
    BOX(p[0], y, p[1], 0.4, postH, 0.4, ry, wood, 'wood');
  });
  [[0,-halfD,halfW*2,railT],[0,halfD,halfW*2,railT],
   [-halfW,0,railT,halfD*2],[halfW,0,railT,halfD*2]].forEach(function(s){
    var p = loc(x,z, s[0], s[1], ry);
    BOX(p[0], y+postH*0.55, p[1], s[2], railT, s[3], ry, wood, 'wood');
    BOX(p[0], y+postH*0.92, p[1], s[2], railT, s[3], ry, wood, 'wood');
  });

  var sh = loc(x,z, -halfW*0.55, -halfD*0.55, ry);
  shed(sh[0], y, sh[1], halfW*0.85, halfD*0.65, rr(3.5,5), ry, pick(TONES_POOR));
  var tp = loc(x,z, halfW*0.5, halfD*0.35, ry);
  BOX(tp[0], y+0.3, tp[1], 3.2, 0.7, 1.3, ry, shade(wood,-0.1), 'wood');
}

/* ==== a chicken coop: a small raised henhouse (legs, box body, pitched ==== */
function monasteryCoop(x, y, z, halfW, halfD, ry){
  var wood = pick(TRUNKC), postH = 1.5, railT = 0.22;
  /* the run: 4 corner posts + 2 rails a side, same vocabulary as the pen */
  [[-halfW,-halfD],[-halfW,halfD],[halfW,-halfD],[halfW,halfD]].forEach(function(c){
    var p = loc(x,z, c[0], c[1], ry);
    BOX(p[0], y, p[1], 0.32, postH, 0.32, ry, wood, 'wood');
  });
  [[0,-halfD,halfW*2,railT],[0,halfD,halfW*2,railT],
   [-halfW,0,railT,halfD*2],[halfW,0,railT,halfD*2]].forEach(function(s){
    var p = loc(x,z, s[0], s[1], ry);
    BOX(p[0], y+postH*0.60, p[1], s[2], railT, s[3], ry, wood, 'wood');
  });
  /* the henhouse: raised on 4 stub legs in the -x/-z corner of the run */
  var hw = halfW*0.85, hd = halfD*0.80, legH = 1.1, bodyH = 2.6;
  var hc = loc(x,z, -halfW*0.10, -halfD*0.12, ry);
  var hx = hc[0], hz = hc[1];
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){
    var p = loc(hx,hz, c[0]*hw*0.40, c[1]*hd*0.40, ry);
    CYL(p[0], y, p[1], 0.24, legH, ry, shade(wood,-0.15), 'wood');
  });
  BOX(hx, y+legH, hz, hw, bodyH, hd, ry, shade(pick(TONES_POOR),0.02), 'plaster');
  FR8(hx, y+legH+bodyH, hz, hw*1.10, hw*0.52, hd*1.10, ry, shade(BANNERC[0],-0.18), 'roof');
  /* pop-hole on the +x face, and the plank ramp down from it */
  var ph = loc(hx,hz, hw*0.5+0.08, 0, ry);
  BOX(ph[0], y+legH+0.1, ph[1], 0.30, bodyH*0.42, hd*0.24, ry, shade(wood,-0.22), 'wood');
  var rp = loc(hx,hz, hw*0.5+1.5, 0, ry);
  BOX(rp[0], y+legH*0.55, rp[1], 3.0, 0.22, hd*0.26, ry, wood, 'wood');
  /* nest-box bump on the -z gable, and a feed trough out in the run */
  var nb = loc(hx,hz, 0, -(hd*0.5+0.45), ry);
  BOX(nb[0], y+legH+bodyH*0.35, nb[1], hw*0.55, bodyH*0.42, 0.9, ry, shade(wood,-0.05), 'wood');
  var tr = loc(x,z, halfW*0.45, halfD*0.40, ry);
  BOX(tr[0], y+0.25, tr[1], 1.9, 0.55, 0.8, ry, shade(wood,-0.1), 'wood');
  var stand = loc(x,z, halfW*0.35, -halfD*0.35, ry);
  return [stand[0], stand[1]];
}

/* ==== one window, either orientation: 'thin' true = the glass sits on a ==== */
function monasteryWindow(x, z, yBase, ry, ww, wh, thin, frameCol, paneCol){

  if(thin){
    BOX(x, yBase, z, 0.30, wh, ww, ry, frameCol);
    WINBOX(x, yBase, z, 0.44, wh*0.72, ww*0.70, ry, paneCol);
  }else{
    BOX(x, yBase, z, ww, wh, 0.30, ry, frameCol);
    WINBOX(x, yBase, z, ww*0.70, wh*0.72, 0.44, ry, paneCol);
  }
  DOME(x, yBase+wh, z, ww*0.58, ww*0.46, ry, frameCol);
}

/* ==== windows + door: generic openings for the warehouse/outbuildings, ==== */
function monasteryOpenings(x, z, yb, w, d, h, ry, opt){
  opt = opt || {};
  var frameCol = opt.frame || shade(TRUNKC[0], -0.15);
  var paneCol  = opt.pane  || 0x232320;
  var doorCol  = opt.door  || pick(TRUNKC);
  var dw = Math.min(w*0.26, 3.0), dh = Math.min(h*0.62, 5.2);
  var dp = loc(x,z, w*0.5+0.10, 0, ry);
  BOX(dp[0], yb, dp[1], dw, dh, 0.35, ry, doorCol, 'wood');
  BOX(dp[0], yb+dh, dp[1], dw*1.3, 0.5, 0.45, ry, frameCol);
  var wy = yb + h*0.50, ww = Math.min(w*0.14, 1.6), wh = Math.min(h*0.30, 2.6);

  var nFace = Math.max(3, Math.round(d/9));
  [-1,1].forEach(function(s){
    for(var i=0;i<nFace;i++){
      if(s===1 && i===Math.floor((nFace-1)/2) && nFace%2===1) continue;   /* clear the door */
      var t = (i-(nFace-1)/2) * (d*0.78/nFace);
      var wp = loc(x,z, s*(w*0.5+0.10), t, ry);
      monasteryWindow(wp[0], wp[1], wy, ry, ww, wh, true, frameCol, paneCol);
    }
  });
  /* +/-d faces (gables/sides, in-plane span along w): 2 across each */
  [-1,1].forEach(function(s){
    [-1,1].forEach(function(k){
      var wp = loc(x,z, k*w*0.24, s*(d*0.5+0.10), ry);
      monasteryWindow(wp[0], wp[1], wy, ry, ww, wh, false, frameCol, paneCol);
    });
  });
}

function monasteryDorm(x, yb, z, w, d, h, ry, col, opt){
  opt = opt || {};
  var roofCol = opt.roof || shade(col,-0.10);
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = 0x1c1a17;
  var h1 = h*0.46, h2 = h*0.46, bandH = h*0.08;
  BOX(x, yb, z, w, h1, d, ry, col);
  BOX(x, yb+h1-0.35, z, w*1.03, bandH, d*1.03, ry, shade(col,-0.14));      /* floor band / string course */
  BOX(x, yb+h1+bandH-0.35, z, w, h2, d, ry, shade(col,0.03));
  var eaveY = yb+h1+bandH-0.35+h2;
  BOX(x, eaveY, z, w*1.05, 1.0, d*1.05, ry, shade(col,-0.16));            /* parapet/eave */
  FR8(x, eaveY+1.0, z, w*1.02, Math.max(7,h*0.24), d*1.02, ry, roofCol, 'roof');

  var dw = Math.min(w*0.13, 2.8), dh = Math.min(h1*0.74, 5.6);
  [-1,1].forEach(function(s){
    var dp = loc(x,z, w*0.5+0.10, s*Math.min(d*0.16, d*0.5-dw), ry);
    BOX(dp[0], yb, dp[1], dw, dh, 0.35, ry, pick(TRUNKC), 'wood');
    BOX(dp[0], yb+dh, dp[1], dw*1.3, 0.45, 0.46, ry, frameCol);
  });

  var rows = [ { y: yb + h1*0.16, wh: Math.min(h1*0.46,3.6) },
               { y: yb+h1+bandH-0.35 + h2*0.16, wh: Math.min(h2*0.46,3.6) } ];
  var nFace = Math.max(4, Math.round(d/7));
  var ww = Math.min(1.5, d/(nFace*2.4));
  rows.forEach(function(row){
    [-1,1].forEach(function(s){
      for(var i=0;i<nFace;i++){
        var t = (i-(nFace-1)/2) * (d*0.86/nFace);
        if(s===1 && Math.abs(t) < d*0.20) continue;   /* clear the 2 doors below */
        var wp = loc(x,z, s*(w*0.5+0.10), t, ry);
        monasteryWindow(wp[0], wp[1], row.y, ry, ww, row.wh, true, frameCol, paneCol);
      }
    });
    [-1,1].forEach(function(s){
      [-1,1].forEach(function(k){
        var wp = loc(x,z, k*w*0.26, s*(d*0.5+0.10), ry);
        monasteryWindow(wp[0], wp[1], row.y, ry, Math.min(1.3,ww), row.wh*0.92, false, frameCol, paneCol);
      });
    });
  });
}

function monasteryAssemblyHall(x, z, yb, hw, hd, h, ry, col, opt){
  opt = opt || {};
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = 0x1c1a17;
  var mansard = opt.mansard || shade(BANNERC[0], -0.08);

  var h1=h*0.30, h2=h*0.30, h3=h*0.28, band=h*0.04;
  var y1=yb, y2=y1+h1+band, y3=y2+h2+band;
  BOX(x, y1, z, hw, h1, hd, ry, col);
  BOX(x, y1+h1-0.35, z, hw*1.03, band, hd*1.03, ry, shade(col,-0.14));
  BOX(x, y2, z, hw, h2, hd, ry, shade(col,0.02));
  BOX(x, y2+h2-0.35, z, hw*1.03, band, hd*1.03, ry, shade(col,-0.14));
  BOX(x, y3, z, hw*0.94, h3, hd*0.94, ry, shade(col,0.04));   /* 3rd storey steps in slightly, under the mansard */
  var eaveY = y3+h3;
  BOX(x, eaveY, z, hw*1.02, 0.9, hd*1.02, ry, shade(col,-0.16));

  var mSkirtH = Math.max(7, h*0.20);
  FR8(x, eaveY+0.9, z, hw*1.00, mSkirtH, hd*1.00, ry, mansard, 'roof');
  FR8(x, eaveY+0.9+mSkirtH, z, hw*0.40, Math.max(4,h*0.10), hd*0.40, ry, shade(mansard,-0.08), 'roof');

  var dw = Math.min(hd*0.14, 2.6), dh = Math.min(h1*0.76, 5.8);
  [-1,1].forEach(function(s){
    var dp = loc(x,z, hw*0.5+0.10, s*Math.min(hd*0.15,hd*0.5-dw), ry);
    BOX(dp[0], y1, dp[1], dw, dh, 0.36, ry, pick(TRUNKC), 'wood');
    BOX(dp[0], y1+dh, dp[1], dw*1.3, 0.5, 0.48, ry, frameCol);
  });
  var storeys = [ {y:y1+h1*0.14, wh:Math.min(h1*0.5,3.8)}, {y:y2+h2*0.14, wh:Math.min(h2*0.5,3.6)},
                  {y:y3+h3*0.14, wh:Math.min(h3*0.5,3.0)} ];
  var nLong = Math.max(3, Math.round(hw/8));
  var wwL = Math.min(1.5, hw/(nLong*2.6));
  storeys.forEach(function(row, si){
    [-1,1].forEach(function(s){
      for(var i=0;i<nLong;i++){
        var t = (i-(nLong-1)/2) * (hw*0.82/nLong);
        var wp = loc(x,z, t, s*(hd*0.5+0.10), ry);
        monasteryWindow(wp[0], wp[1], row.y, ry, wwL, row.wh, false, frameCol, paneCol);
      }
    });

    if(si<2){
      [-1,1].forEach(function(k){
        var wp = loc(x,z, -(hw*0.5+0.10), k*hd*0.26, ry);
        monasteryWindow(wp[0], wp[1], row.y, ry, Math.min(1.3,wwL), row.wh*0.9, true, frameCol, paneCol);
      });
    }
  });

  var courtSpan = hd*1.35;
  var courtH1 = h*0.30, courtH2 = h*0.26;
  var cx0 = loc(x,z, -(hw*0.5+courtSpan*0.5+1.2), 0, ry);
  var cx = cx0[0], cz = cx0[1];
  var archW = courtSpan/5, pierW = archW*0.22, archH = courtH1*0.80;
  var cloisterCol = shade(col,0.02), officeCol = shade(col,-0.04);
  [ {lx:0, lz:-courtSpan*0.5, along:'x'}, {lx:0, lz:courtSpan*0.5, along:'x'},
    {lx:-courtSpan*0.5, lz:0, along:'z'}, {lx:courtSpan*0.5, lz:0, along:'z'} ].forEach(function(side){

    if(side.along==='x'){
      var op = loc(cx,cz, side.lx, side.lz, ry);
      BOX(op[0], yb+courtH1, op[1], courtSpan, courtH2, 0.9, ry, officeCol);
      for(var i=0;i<5;i++){
        var t = (i-2)*(courtSpan*0.16);
        var wp = loc(cx,cz, t, side.lz, ry);
        monasteryWindow(wp[0], wp[1], yb+courtH1+courtH2*0.22, ry, Math.min(1.3,archW*0.30), courtH2*0.42, true, frameCol, paneCol);
      }
    }else{
      var op2 = loc(cx,cz, side.lx, side.lz, ry);
      BOX(op2[0], yb+courtH1, op2[1], 0.9, courtH2, courtSpan, ry, officeCol);
      for(var j=0;j<5;j++){
        var t2 = (j-2)*(courtSpan*0.16);
        var wp2 = loc(cx,cz, side.lx, t2, ry);
        monasteryWindow(wp2[0], wp2[1], yb+courtH1+courtH2*0.22, ry, Math.min(1.3,archW*0.30), courtH2*0.42, false, frameCol, paneCol);
      }
    }
    BOX((loc(cx,cz,side.lx,side.lz,ry))[0], yb+courtH1+courtH2, (loc(cx,cz,side.lx,side.lz,ry))[1],
        side.along==='x'?courtSpan*1.02:1.0, 0.8, side.along==='x'?1.0:courtSpan*1.02, ry, shade(officeCol,-0.14));

    var nBay = 5;
    for(var b=0;b<nBay;b++){
      var bt = (b-(nBay-1)/2) * archW;
      var pp = side.along==='x' ? loc(cx,cz, bt-archW*0.5+pierW*0.5, side.lz, ry)
                                 : loc(cx,cz, side.lx, bt-archW*0.5+pierW*0.5, ry);
      var pierRy = side.along==='x' ? ry : ry+Math.PI/2;
      BOX(pp[0], yb, pp[1], pierW, archH, 0.9, pierRy, cloisterCol);
      var archP = side.along==='x' ? loc(cx,cz, bt, side.lz, ry) : loc(cx,cz, side.lx, bt, ry);
      DOME(archP[0], yb+archH, archP[1], archW*0.5-pierW*0.4, (archW*0.5-pierW*0.4)*0.7, pierRy, cloisterCol);
    }
  });

  BOX(cx, yb-0.05, cz, courtSpan*0.66, 0.30, courtSpan*0.66, ry, 0x4f6b3a, 'plaster');
  for(var g=0; g<10; g++){
    var ga = g*(Math.PI*2/10), gr = courtSpan*0.24;
    var gp = loc(cx,cz, Math.cos(ga)*gr, Math.sin(ga)*gr, ry);
    BLOB(gp[0], yb+0.25, gp[1], rr(0.9,1.4), rr(0.9,1.3), rnd()*3, shade(0x4a7a3a, rr(-0.1,0.1)), 'leaf');
  }
  benchPlain(cx, yb+0.25, cz, ry, null, {});

  return { x:x, z:z, ry:ry, courtCx:cx, courtCz:cz, courtSpan:courtSpan };
}

/* ==== the chapel: a taller nave with a gabled roof mass, stained-glass ==== */
function monasteryChapel(x, yb, z, w, d, h, ry, col, glassCols){
  glassCols = glassCols || [BANNERC[0], BANNERC[4], BANNERC[5]];
  BOX(x, yb, z, w, h, d, ry, col);
  BOX(x, yb+h-0.5, z, w*1.05, 0.9, d*1.05, ry, shade(col,-0.15));
  FR8(x, yb+h, z, w*1.08, h*0.40, d*1.08, ry, shade(BANNERC[0], -0.05), 'roof');   /* designated crimson-slate roof, not a random pick */

  var towerOffX = w*0.5 + w*0.15 - w*0.03, towerOffZ = d*0.5 + w*0.15 - w*0.03;
  var th = h*1.5;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cs){
    var tp = loc(x,z, cs[0]*towerOffX, cs[1]*towerOffZ, ry);
    FR6(tp[0], yb, tp[1], w*0.30, th, w*0.30, ry, shade(col,0.04));
    BOX(tp[0], yb+th, tp[1], w*0.36, 1.2, w*0.36, ry, shade(col,-0.18));
    CONE(tp[0], yb+th+1.2, tp[1], w*0.19, w*0.55, ry, shade(BANNERC[0],-0.05));
    CYL(tp[0], yb+th-1.5, tp[1], w*0.08, 1.5, ry, shade(col,-0.3), 'metal');
  });

  var doorW = w*0.20, doorH = h*0.42;
  var dp = loc(x,z, w*0.5+0.10, 0, ry);
  BOX(dp[0], yb, dp[1], doorW, doorH, 0.4, ry, shade(TRUNKC[0],-0.2), 'wood');
  BOX(dp[0], yb+doorH, dp[1], doorW*1.3, 0.4, 0.5, ry, shade(col,-0.2));
  DOME(dp[0], yb+doorH+0.4, dp[1], doorW*0.65, doorW*0.55, ry, shade(col,0.02));

  var winW = w*0.13, winH = h*0.46, winY = yb + h*0.10;
  [-1,1].forEach(function(s, i){
    var wp = loc(x,z, w*0.5+0.08, s*w*0.30, ry);
    BOX(wp[0], winY, wp[1], winW*1.22, winH*1.06, 0.30, ry, shade(col,-0.10));
    BOX(wp[0], winY, wp[1], winW, winH, 0.42, ry, glassCols[i % glassCols.length]);
    DOME(wp[0], winY+winH, wp[1], winW*0.62, winW*0.5, ry, shade(col,-0.05));
  });
  [-1,1].forEach(function(s, i){
    var wp = loc(x,z, 0, s*d*0.34, ry);
    BOX(wp[0], winY, wp[1], 0.30, winH*0.9, winW*1.15, ry, shade(col,-0.10));
    BOX(wp[0], winY, wp[1], 0.42, winH*0.78, winW*0.9, ry, glassCols[(i+2) % glassCols.length]);
    DOME(wp[0], winY+winH*0.78, wp[1], winW*0.55, winW*0.45, ry, shade(col,-0.05));
  });
}

/* ==== one field patch ==== */
function monasteryField(x, y, z, w, h, ry){
  var tone = pick(FIELDC);
  BOX(x, y-0.05, z, w, 0.35, h, ry, tone, 'plaster');
  [[0,h/2],[0,-h/2]].forEach(function(e){ var o=loc(x,z,e[0],e[1],ry); BOX(o[0], y-0.4, o[1], w, 1.3, 1.4, ry, 0x7a6d55, 'plaster'); });
  [[w/2,0],[-w/2,0]].forEach(function(e){ var o=loc(x,z,e[0],e[1],ry); BOX(o[0], y-0.4, o[1], 1.4, 1.3, h, ry, 0x7a6d55, 'plaster'); });
}

window._monastery = 0;

/* ==== what the life layer needs to know about this compound ==== */
var MONASTERY_SITES = { y: 0, fields: [], coops: [], chapelDoor: null, dorms: [] };

var MONASTERY_COOP_SLOTS = [
  [ 0.24, -0.21], [ 0.23,  0.24], [-0.48, -0.86],
  [ 0.62,  0.30], [-0.30,  0.72], [-0.62,  0.52]
];

function monasteryClash(cx, cz, hw, hd, occ){
  for(var i=0;i<occ.length;i++){
    var o = occ[i];
    if(Math.abs(cx-o[0]) < hw+o[2] && Math.abs(cz-o[1]) < hd+o[3]) return true;
  }
  return false;
}

/* ==== monasteryCompound ==== */
function monasteryCompound(x, z, ry, fx, fz){
  fx = (fx === undefined) ? MONASTERY.fx : fx;
  fz = (fz === undefined) ? MONASTERY.fz : fz;

  claim(x, z, fx+6, fz+6, ry, 'compound');

  var col = pick(BASALTC);
  var f = footing(x, z, fx, fz, ry);

  var yb = (f.hi + f.lo) / 2 + 0.2;
  var wh = rr(MONASTERY.wallH[0], MONASTERY.wallH[1]), wt = MONASTERY.wallT, gapf = MONASTERY.gapF;

  /* ==== curtain wall + gate + corner towers (compound()'s own vocabulary) ==== */
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt, fz*2, ry, yb, wh, col));
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt*1.3, fz*2*1.01, ry, yb+wh, 1.2, shade(col,-0.24)));

  var sideGapF = 0.11;
  [-1,1].forEach(function(side){
    var segL = fx*(1-sideGapF);
    [-1,1].forEach(function(s){
      var o = loc(x,z, s*(fx - segL*0.5), side*(fz-wt*0.5), ry);
      BOX(o[0], yb, o[1], segL, wh, wt, ry, col);
      BOX(o[0], yb+wh, o[1], segL*1.01, 1.2, wt*1.3, ry, shade(col,-0.24));
    });

    var gap = fx*sideGapF*2*0.88;
    var sp = loc(x,z, 0, side*(fz-wt*0.5), ry);
    var jambW = gap*0.16, openHalf = gap*0.5 - jambW*0.5;
    [-1,1].forEach(function(js){
      var jp = loc(x,z, js*(openHalf+jambW*0.5), side*(fz-wt*0.5), ry);
      BOX(jp[0], yb, jp[1], jambW, wh*0.78, wt*1.15, ry, shade(col,-0.06));
    });
    var archY = yb + wh*0.78;
    BOX(sp[0], archY, sp[1], gap*1.02, wh*0.10, wt*1.15, ry, shade(col,-0.16));
    DOME(sp[0], archY+wh*0.10, sp[1], gap*0.42, gap*0.22, ry, shade(col,-0.1));
  });
  [-1,1].forEach(function(s){
    var segL = fz*(1-gapf);
    var o = loc(x,z, fx-wt*0.5, s*(fz - segL*0.5), ry);
    BOX(o[0], yb, o[1], wt, wh, segL, ry, col);
    BOX(o[0], yb+wh, o[1], wt*1.3, 1.2, segL, ry, shade(col,-0.24));
  });

  var gp = loc(x,z, fx-wt*0.5, 0, ry);
  var gateW = fz*gapf*2, pierW = wt*2.2, pierH = wh*1.55;
  [-1,1].forEach(function(s){
    var pp = loc(x,z, fx-wt*0.5, s*(gateW*0.5+pierW*0.5), ry);
    FR8(pp[0], yb, pp[1], pierW, pierH, pierW*1.3, ry, shade(col,0.05));
    BOX(pp[0], yb+pierH, pp[1], pierW*1.3, 1.4, pierW*1.6, ry, shade(col,-0.2));
    CONE(pp[0], yb+pierH+1.4, pp[1], pierW*0.55, pierW*0.95, ry, shade(col,-0.1));
  });
  var archY = yb + wh*0.95;

  BOX(gp[0], archY, gp[1], wt*1.4, wh*0.16, gateW*1.03, ry, shade(col,-0.05));

  DOME(gp[0], archY+wh*0.16, gp[1], pierW*0.9, pierW*0.5, ry, shade(col,-0.02));
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c2){
    var p = loc(x,z, c2[0]*(fx-1.6), c2[1]*(fz-1.6), ry);
    FR8(p[0], yb, p[1], 7.0, wh*1.35, 7.0, ry, shade(col,-0.05));
    BOX(p[0], yb+wh*1.35, p[1], 8.2, 1.4, 8.2, ry, shade(col,-0.2));
  });

  /* ==== buildings: an irregular cluster near the middle of the compound ==== */
  var DORM_ROOF = shade(GREYC[1], -0.05);

  var occ = [];

  var innerHx = fx - wt - 3, innerHz = fz - wt - 3;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){ occ.push([c[0]*(fx-1.6), c[1]*(fz-1.6), 6, 6]); });
  [-1,1].forEach(function(s){ occ.push([0, s*(fz-wt*0.5), fx*0.14, 9]); });   /* keep both side gates walkable */
  occ.push([fx-wt*0.5, 0, 9, fz*gapf + 6]);                                   /* and the main gate passage */

  var chapelP = loc(x,z, -0.34*fx, -0.20*fz, ry);
  var templeC = CIDX['Temple'];

  var chapelRy = templeC ? faceToward(chapelP[0], chapelP[1], templeC.x, templeC.z) : ry;

  var CHAPEL_SCALE = 1.5;
  var chapelW = fx*0.26*CHAPEL_SCALE, chapelD = fz*0.22*CHAPEL_SCALE;
  monasteryChapel(chapelP[0], yb, chapelP[1], chapelW, chapelD, rr(24,30)*CHAPEL_SCALE, chapelRy, col);

  var chapelReach = Math.hypot(chapelW*0.62 + chapelW*0.15, chapelD*0.5 + chapelW*0.27);
  occ.push([-0.34*fx, -0.20*fz, chapelReach, chapelReach]);
  var chapelDoorP = loc(chapelP[0], chapelP[1], chapelW*0.5 + 9, 0, chapelRy);
  MONASTERY_SITES.chapelDoor = { x: chapelDoorP[0], z: chapelDoorP[1], ry: chapelRy };

  var dormW = fx*0.20*1.5, dormD = fz*0.17*2.0;
  var dormReach = Math.max(dormW, dormD)*0.5 + 2;

  var dorm1P = loc(x,z, 0.08*fx, -0.50*fz, ry);
  var dorm1Ry = ry + rr(-0.12,-0.04);
  monasteryDorm(dorm1P[0], yb, dorm1P[1], dormW, dormD, rr(20,25), dorm1Ry, col, { roof:DORM_ROOF });
  occ.push([0.08*fx, -0.50*fz, dormReach, dormReach]);

  var dorm2P = loc(x,z, -0.56*fx, 0.32*fz, ry);
  var dorm2Ry = ry + rr(0.04,0.14);
  monasteryDorm(dorm2P[0], yb, dorm2P[1], dormW, dormD, rr(20,25), dorm2Ry, col, { roof:DORM_ROOF });
  occ.push([-0.56*fx, 0.32*fz, dormReach, dormReach]);

  [[dorm1P, dorm1Ry],[dorm2P, dorm2Ry]].forEach(function(d){
    var dp = loc(d[0][0], d[0][1], dormW*0.5 + 4, 0, d[1]);
    MONASTERY_SITES.dorms.push({ x: dp[0], z: dp[1], ry: d[1] });
  });

  var whP = loc(x,z, -0.10*fx, 0.44*fz, ry);
  var whRy = ry + Math.PI/2 + rr(-0.2,0.2);
  shed(whP[0], yb, whP[1], fx*0.22, fz*0.15, rr(9,12), whRy, col);
  monasteryOpenings(whP[0], whP[1], yb, fx*0.22, fz*0.15, rr(7,8), whRy, { door: pick(TRUNKC) });
  occ.push([-0.10*fx, 0.44*fz, Math.max(fx*0.22, fz*0.15)*0.5 + 2, Math.max(fx*0.22, fz*0.15)*0.5 + 2]);

  var hallHw = fx*0.16, hallHd = fz*0.20;
  var hallP = loc(x,z, 0.655*fx, 0, ry);
  var hall = monasteryAssemblyHall(hallP[0], hallP[1], yb, hallHw, hallHd, rr(30,34), ry, col, {});

  occ.push([0.655*fx, 0, hallHw*0.55 + 2, hallHd*0.55 + 2]);
  occ.push([0.655*fx - (hallHw*0.5 + hall.courtSpan*0.5 + 1.2), 0, hall.courtSpan*0.55 + 2, hall.courtSpan*0.55 + 2]);

  /* ==== well, right at the cluster's own centre ==== */
  var wellP = loc(x,z, 0.05*fx, 0.10*fz, ry);
  monasteryWell(wellP[0], yb, wellP[1], MONASTERY.wellR, ry);
  occ.push([0.05*fx, 0.10*fz, MONASTERY.wellR*2.2, MONASTERY.wellR*2.2]);

  /* ==== fields ring the perimeter, inside the wall, clear of the cluster ==== */
  var fieldSlots = [
    [ 0.62, -0.68, 0.24, 0.24],
    [ 0.62,  0.68, 0.24, 0.24],
    [-0.62,  0.68, 0.22, 0.22],
    [ 0.14,  0.80, 0.30, 0.14],
    [ 0.14, -0.80, 0.30, 0.14],
    [-0.80, -0.80, 0.13, 0.13],
    [-0.85, -0.05, 0.14, 0.20],
    [ 0.40, -0.65, 0.14, 0.16],
    [ 0.36,  0.50, 0.14, 0.14],
    [-0.30, -0.85, 0.20, 0.12]
  ];
  fieldSlots.slice(0, MONASTERY.fieldCount).forEach(function(fs){
    var p = loc(x,z, fs[0]*fx, fs[1]*fz, ry);
    var fw = fx*fs[2], fh = fz*fs[3];
    monasteryField(p[0], yb, p[1], fw, fh, ry);
    occ.push([fs[0]*fx, fs[1]*fz, fw*0.5 + 2, fh*0.5 + 2]);

    MONASTERY_SITES.fields.push({ x:p[0], z:p[1], hw:fw*0.5, hz:fh*0.5, ry:ry });
  });

  var penP = loc(x,z, -0.65*fx, -0.65*fz, ry);
  monasteryPen(penP[0], yb, penP[1], MONASTERY.penW*0.5, MONASTERY.penD*0.5, ry);
  occ.push([-0.65*fx, -0.65*fz, MONASTERY.penW*0.5 + 3, MONASTERY.penD*0.5 + 3]);

  /* ==== chicken coops. The interior here is genuinely tight (an earlier ==== */
  var coopHw = MONASTERY.coopW*0.5, coopHd = MONASTERY.coopD*0.5;
  var coopTried = 0, coopPlaced = 0;
  for(var ci=0; ci<MONASTERY_COOP_SLOTS.length && coopPlaced < MONASTERY.coopCount; ci++){
    var cs = MONASTERY_COOP_SLOTS[ci];
    var clx = cs[0]*fx, clz = cs[1]*fz;
    coopTried++;

    if(Math.abs(clx) + coopHw + 3 > innerHx || Math.abs(clz) + coopHd + 3 > innerHz) continue;
    if(monasteryClash(clx, clz, coopHw + 3, coopHd + 3, occ)) continue;
    var cp = loc(x,z, clx, clz, ry);
    var stand = monasteryCoop(cp[0], yb, cp[1], coopHw, coopHd, ry);
    occ.push([clx, clz, coopHw + 2, coopHd + 2]);
    MONASTERY_SITES.coops.push({ x: stand[0], z: stand[1], cx: cp[0], cz: cp[1], ry: ry });
    coopPlaced++;
  }
  window._monasteryCoops = { tried: coopTried, placed: coopPlaced, wanted: MONASTERY.coopCount };
  MONASTERY_SITES.y = yb;
  window._monasterySites = MONASTERY_SITES;   /* diagnostic: field/coop/chapel/dorm world coordinates */

  window._monastery++;
}

monasteryCompound(-1289.5, -429.7, faceToward(-1289.5,-429.7, CIDX['Temple'].x, CIDX['Temple'].z), 145, 120);
