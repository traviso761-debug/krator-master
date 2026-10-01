/* ==== canton-scale structures ==== */

/* ==== templeCanton(c, y, hw) ==== */
function templeCanton(c, y, hw){

  var TEMPLE_RED_BRIGHT = 0xa8241c, TEMPLE_RED_DARK = 0x4a0e0a;
  var TEMPLE_GOLD = 0xc9a227;
  var bed = bedAt(c.x,c.z), plinthTop = (y===undefined) ? 7 : y;
  FR8(c.x, bed, c.z, c.r*2.20, plinthTop-bed, c.r*2.20, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.6, c.z, c.r*2.30, 3.0, c.r*2.30, 0, shade(c.tone,-0.38));
  BOX(c.x, plinthTop-0.3, c.z, c.r*2.26, 1.4, c.r*2.26, 0, shade(c.accent,-0.10));   /* gilded step edge */

  var y0 = plinthTop, rem = c.top - y0, W = tierWeights(c.tiers);
  var hw0 = (hw===undefined) ? c.r*0.98 : hw;

  var doorFace = {};
  cantonApproachFaces(c).forEach(function(ang){
    var dx=Math.sin(ang), dz=Math.cos(ang), f;
    if(Math.abs(dx) > Math.abs(dz)) f = dx>0 ? 0 : 2; else f = dz>0 ? 1 : 3;
    doorFace[f] = true;
  });
  var entryY, entryHw;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    FR8(c.x, y0, c.z, hw0*2, th, hw0*2, 0, shade(c.tone, i%2 ? 0.05 : -0.02));
    BOX(c.x, y0+th-1.0, c.z, hw0*2*1.07, 2.2, hw0*2*1.07, 0, shade(c.tone,-0.16));
    BOX(c.x, y0+th-2.6, c.z, hw0*2*1.03, 0.7, hw0*2*1.03, 0, shade(c.accent,0.02));  /* gilded stringcourse */
    y0 += th + 0.12;
    var nhw = hw0*0.80;
    if(i < c.tiers-1){
      var ring = hw0*2*0.99, t2 = nhw*2;
      [[0,(ring+t2)/4],[0,-(ring+t2)/4],[(ring+t2)/4,0],[-(ring+t2)/4,0]].forEach(function(o){
        var sw = Math.abs(o[0])>0 ? (ring-t2)/2 : ring;
        var sd = Math.abs(o[0])>0 ? ring : (ring-t2)/2;
        BOX(c.x+o[0], y0, c.z+o[1], sw*0.98, 2.6, sd*0.98, 0, shade(c.tone,-0.20));
      });
    }

    var tierRoofCol = (i % 2 === 0) ? TEMPLE_RED_BRIGHT : TEMPLE_RED_DARK;
    for(var f=0; f<4; f++){
      if(i === 1 && doorFace[f]) continue;
      var a = f*Math.PI/2;
      var px = c.x + Math.cos(a)*hw0*1.02, pz = c.z + Math.sin(a)*hw0*1.02;
      FR8(px, y0-th*0.86, pz, hw0*0.34, th*0.62, hw0*0.34, -a, shade(c.tone,0.08));
      CONE(px, y0-th*0.24, pz, hw0*0.20, hw0*0.24, -a, tierRoofCol);
    }
    hw0 = nhw;
    if(i === 0){ entryY = y0; entryHw = hw0; }
  }
  CANTON_TOPS[c.n] = { y:y0, hw:hw0, spring:plinthTop, entryY:entryY, entryHw:entryHw };

  var TEMPLE_PILLAR_H = 30.35;
  var dr = c.dome*1.55;
  window.TEMPLE_PILLAR_RING_R = hw0*0.70;
  for(var pl=0; pl<8; pl++){
    var pa = pl*Math.PI/4;
    var px2 = c.x + Math.cos(pa)*window.TEMPLE_PILLAR_RING_R, pz2 = c.z + Math.sin(pa)*window.TEMPLE_PILLAR_RING_R;
    CYL(px2, y0, pz2, Math.max(2.0, dr*0.045), TEMPLE_PILLAR_H, 0, shade(c.tone,0.10));
    CYL(px2, y0+TEMPLE_PILLAR_H-0.6, pz2, Math.max(2.6, dr*0.06), 1.2, 0, shade(c.tone,-0.10));   /* capital */
    CYL(px2, y0, pz2, Math.max(2.6, dr*0.06), 0.8, 0, shade(c.tone,-0.10));                        /* base */
  }
  var domeY0 = y0 + TEMPLE_PILLAR_H;

  CYL(c.x, domeY0, c.z, dr*1.42, 11, 0, shade(TEMPLE_GOLD,-0.05));
  BOX(c.x, domeY0+11, c.z, dr*3.05, 2.0, dr*3.05, Math.PI/4, shade(c.tone,-0.12));
  DOME(c.x, domeY0+13.0, c.z, dr, dr*0.92, 0, TEMPLE_GOLD, 'dome');
  for(var rib=0; rib<8; rib++){
    var ra = rib*Math.PI/4;
    CONE(c.x+Math.cos(ra)*dr*0.55, domeY0+13.0, c.z+Math.sin(ra)*dr*0.55, dr*0.05, dr*0.85, ra, shade(TEMPLE_GOLD,-0.10));
  }
  var crownY = domeY0+13.0+dr*0.92*0.55;
  DOME(c.x, crownY, c.z, dr*0.5, dr*0.4, 0, shade(TEMPLE_GOLD,0.08), 'dome');
  CONE(c.x, domeY0+13.0+dr*0.92, c.z, dr*0.12, dr*0.7, 0, shade(TEMPLE_GOLD,-0.15));
  CYL(c.x, domeY0+13.0+dr*0.92+dr*0.7, c.z, dr*0.04, dr*0.3, 0, shade(TEMPLE_GOLD,0.12));

  for(var s=0;s<4;s++){
    var sa = Math.PI/4 + s*Math.PI/2;
    var sx = c.x + Math.cos(sa)*hw0*0.80, sz = c.z + Math.sin(sa)*hw0*0.80;
    FR3(sx, y0, sz, 10, dr*1.7, 10, sa, shade(c.tone,0.03));
    CONE(sx, y0+dr*1.7, sz, 3.8, 9, sa, shade(TEMPLE_GOLD,0.12));
  }

  var approaches = cantonApproachFaces(c), primary = approaches[0];
  approaches.forEach(function(ang){
    var sp = loc(c.x, c.z, 0, c.r*1.06, ang);
    seaStair(sp[0], sp[1], ang, c.r*0.68, plinthTop, -2);
  });

  approaches.forEach(function(ang){
    plinthDoor(c.x, c.z, ang, entryY, entryHw, c.tone);
  });
  [-1,1].forEach(function(s2){
    var gp = loc(c.x, c.z, c.r*1.02, s2*c.r*0.22, primary);
    statue(gp[0], plinthTop, gp[1], primary-Math.PI/2, shade(c.tone,0.10), { h:7, w:2.2 });
  });
  var shp = loc(c.x, c.z, c.r*0.70, -c.r*1.05, primary);
  shrineTriptych(shp[0], terrainH(shp[0],shp[1]), shp[1], primary+Math.PI/2, shade(c.tone,0.05), { w:11, d:4 });

  /* a pair of tall gilt cloth banners on posts, flanking the base */
  var baseHw = (hw===undefined) ? c.r*0.98 : hw;
  [-1,1].forEach(function(s3){
    var bp = loc(c.x, c.z, baseHw, s3*c.r*0.55, 0);
    var poleH = 26;
    CYL(bp[0], plinthTop, bp[1], 0.22, poleH, 0, shade(c.tone,-0.2), 'wood');
    BOX(bp[0], plinthTop+0.6, bp[1], 0.22, poleH*0.78, 4.0, 0, shade(c.accent,0.06), 'cloth');
  });

  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(baseHw, ferryPier.ry), c.tone);
  }
}

function crenellate(cx, cz, hw, yTop, ry, col, merlonW, merlonH, merlonD){
  merlonW = merlonW || Math.max(0.7, hw*0.040);
  merlonH = merlonH || merlonW*2.3;
  merlonD = merlonD || merlonW*1.4;
  var gap = merlonW*0.7, per = merlonW+gap;
  var n = Math.max(3, Math.floor((hw*2)/per));
  [['x',hw],['x',-hw],['z',hw],['z',-hw]].forEach(function(e){
    var along = e[0], fixed = e[1];
    for(var k=0;k<n;k++){
      var t = (k+0.5)/n*(hw*2) - hw;
      var lx = along==='x' ? t : fixed;
      var lz = along==='x' ? fixed : t;
      var p = loc(cx,cz, lx, lz, ry);
      var w = along==='x' ? merlonW : merlonD;   /* slim face along the run */
      var d = along==='x' ? merlonD : merlonW;   /* deeper across the coping */
      BOX(p[0], yTop, p[1], w, merlonH, d, ry, col);
    }
  });
}

/* ==== ordinatorFortress(c, y, hw, opt) ==== */
function ordinatorFortress(c, y, hw, opt){
  opt = opt || {};
  var x = c.x, z = c.z, ry = opt.ry || 0;
  var platformY = y, platformHw = hw;      /* the real platform surface platCanton() already built and already recorded in CANTON_TOPS — reused verbatim below, not the fortress's own (much higher) deck/dome height */
  var rad = platformHw;                    /* fit the canton's real top-tier half-width instead of a fixed default */
  var tiers = opt.tiers || 3;
  var totalH = opt.h || rad*0.583;         /* same H/rad ratio the old fixed 70/120 pair used */

  var wallCol = opt.col || shade(BASALTC[1 % BASALTC.length], 0.02);
  var fortTrimDark = shade(GREYC[0], -0.30);
  var fortTrimLight = shade(GREYC[GREYC.length-1], 0.20);
  var fortBannerGreen = 0x2f6b3a, fortBannerGold = 0xc9a227;

  var FORT_BAND_PHASE = (c.tiers || 0) % 2;
  var yb = platformY;                      /* build up FROM the platform top, not raw ground */

  var hw = rad*0.98, y0 = yb;
  var tierH = totalH/tiers;
  var hw0 = hw, tierH0 = tierH;      /* tier-0 dimensions, kept for the star bastions below */
  for(var i=0;i<tiers;i++){

    FR8(x, y0, z, hw*2, tierH, hw*2, ry, shade(wallCol, (i+FORT_BAND_PHASE)%2 ? 0.16 : -0.10));
    var topY = y0+tierH;
    BOX(x, topY-0.6, z, hw*2*1.03, 1.2, hw*2*1.03, ry, fortTrimLight);
    crenellate(x, z, hw, topY, ry, fortTrimDark);

    for(var bf=0; bf<4; bf++){
      var ba = ry + bf*Math.PI/2;
      var bp = loc(x, z, hw*1.02, 0, ba);
      var bcol = ((bf + i) % 2) ? fortBannerGreen : fortBannerGold;
      BOX(bp[0], topY-tierH*0.72, bp[1], 0.4, tierH*0.62, hw*0.42, ba, bcol, 'cloth');
      BOX(bp[0], topY-tierH*0.72+tierH*0.62, bp[1], 0.7, 0.7, hw*0.46, ba, fortTrimLight);
    }
    var nSlits = 4 + i*2;
    for(var s=0;s<nSlits;s++){
      var side = Math.floor(rnd()*4), a = side*Math.PI/2 + rr(-0.9,0.9);
      var sx = x+Math.cos(a)*hw*1.01, sz = z+Math.sin(a)*hw*1.01;
      BOX(sx, y0+tierH*rr(0.3,0.6), sz, 0.3, rr(1.6,2.4), 0.5, -a, shade(wallCol,-0.5));
    }
    if(i < tiers-1) hw *= 0.80;
    y0 = topY + 0.4;
  }
  var deckY = y0, deckHW = hw;

  /* ==== star-fort bastions, ground level, breaking the tier-0 perimeter: ==== */
  var bH = tierH0*0.92, bTop = yb+bH;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cc){
    var bw = Math.max(9, hw0*0.20);
    var p = loc(x,z, cc[0]*hw0, cc[1]*hw0, ry);
    FR8(p[0], yb, p[1], bw, bH, bw, ry, shade(wallCol,-0.05));
    crenellate(p[0], p[1], bw*0.48, bTop, ry, shade(wallCol,-0.30), bw*0.075, bw*0.17);
  });
  [1,-1].forEach(function(s){
    var pw = Math.max(16, hw0*0.30);
    var a2 = ry + s*Math.PI/2, ryB = a2 - Math.PI/4;
    var p = loc(x,z, 0, s*hw0, ry);
    FR8(p[0], yb, p[1], pw, bH*0.96, pw, ryB, shade(wallCol,-0.02));
    crenellate(p[0], p[1], pw*0.44, bTop-0.3, ryB, shade(wallCol,-0.30), pw*0.07, pw*0.16);
    var tip = loc(x,z, 0, s*(hw0+pw*0.62), ry);
    BOX(tip[0], yb+bH*rr(0.30,0.55), tip[1], 0.5, rr(1.8,2.6), 0.3, -a2, shade(wallCol,-0.5));
  });

  /* ==== four corner watchtowers, restyled off compound()'s own corner ==== */
  var twr = Math.max(14, deckHW*0.16);              /* shaft full width/depth */
  var towerH = opt.towerH || twr*2.6;                /* stout, compound-tower proportions, not a soaring minaret */
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(cc){
    var p = loc(x,z, cc[0]*deckHW*0.92, cc[1]*deckHW*0.92, ry);
    inspectClaim(p[0], p[1], twr*0.5, twr*0.5, ry, 'tower', 'Fortress watchtower');
    FR8(p[0], deckY, p[1], twr, towerH, twr, ry, shade(wallCol,-0.05));
    var galY = deckY + towerH - twr*0.22;
    crenellate(p[0], p[1], twr*0.5, galY, ry, shade(wallCol,-0.30), twr*0.045, twr*0.11);
    BOX(p[0], galY+twr*0.11, p[1], twr*1.17, twr*0.11, twr*1.17, ry, shade(wallCol,-0.20));  /* flat overhanging coping cap, compound-style */
    var slit = loc(p[0],p[1], twr*0.52, 0, ry);
    BOX(slit[0], deckY+towerH*0.35, slit[1], 0.3, 2.0, 0.5, ry, shade(wallCol,-0.5));

    window.FORT_TOWER_FLAMES = window.FORT_TOWER_FLAMES || [];
    window.FORT_TOWER_FLAMES.push({ x:p[0], z:p[1], y: deckY + towerH, w: twr });
  });

  /* ==== the central rise: Hagia-Sophia-scaled massing standing in for the ==== */
  var plinthR = deckHW*0.66, plinthH = totalH*0.12;

  inspectClaim(x, z, plinthR, plinthR, ry, 'keep', 'Ordinator keep');
  FR8(x, deckY, z, plinthR*2, plinthH, plinthR*2, ry, shade(wallCol,-0.02));
  crenellate(x, z, plinthR*0.97, deckY+plinthH, ry, shade(wallCol,-0.30), plinthR*0.055, plinthR*0.125);

  var drumY = deckY+plinthH+0.3, drumR = deckHW*0.56, drumH = opt.keepH || totalH*0.30;
  CYL(x, drumY, z, drumR, drumH, 0, shade(wallCol,0.02));
  var nSlit2 = 8;
  for(var d2=0; d2<nSlit2; d2++){
    var a3 = (d2/nSlit2)*Math.PI*2;
    var dx = x+Math.cos(a3)*drumR*1.01, dz = z+Math.sin(a3)*drumR*1.01;
    BOX(dx, drumY+drumH*rr(0.35,0.70), dz, 0.3, rr(2.2,3.2), 0.6, -a3, shade(wallCol,-0.55));
  }

  [1,-1].forEach(function(s){                          /* lower flanking domes, fore/aft */
    var fr = drumR*0.52;
    var fp = loc(x,z, s*(drumR+fr*0.75), 0, ry);
    var fy = drumY + drumH*0.18;
    CYL(fp[0], fy, fp[1], fr, drumH*0.55, 0, shade(wallCol,-0.04));
    DOME(fp[0], fy+drumH*0.55, fp[1], fr*0.96, fr*0.80, 0, shade(wallCol,-0.08), 'dome');
  });

  var domeY = drumY+drumH, domeR = drumR*0.98;
  CYL(x, domeY-1.0, z, domeR*1.05, 1.4, 0, shade(wallCol,-0.20));
  DOME(x, domeY, z, domeR, domeR*0.86, 0, shade(wallCol,0.04), 'dome');
  for(var rib=0; rib<10; rib++){
    var ra = rib*Math.PI/5;
    CONE(x+Math.cos(ra)*domeR*0.5, domeY, z+Math.sin(ra)*domeR*0.5, domeR*0.045, domeR*0.78, ra, shade(wallCol,-0.10));
  }
  var crownY = domeY + domeR*0.86*0.55;
  DOME(x, crownY, z, domeR*0.30, domeR*0.24, 0, shade(wallCol,-0.06), 'dome');               /* small nested crown dome */
  BOX(x, domeY+domeR*0.86+0.4, z, domeR*0.14, 1.2, domeR*0.14, ry, shade(wallCol,-0.40));    /* flat dark iron finial base, not a spire */
  CYL(x, domeY+domeR*0.86+1.6, z, domeR*0.045, domeR*0.45, 0, shade(wallCol,-0.35), 'metal'); /* iron signal mast */

  var gp = loc(x,z, rad*0.98, 0, ry);
  BOX(gp[0], yb, gp[1], 6, totalH*0.5, 14, ry, shade(wallCol,-0.45), 'metal');

  CANTON_TOPS[c.n] = { y:platformY, hw:platformHw, spring:platformY };
}

function customsHouse(x,y,z,ry,w,d,col){
  var h = 11;
  BOX(x, y, z, w, h, d, ry, col);
  BOX(x, y+h, z, w*1.06, 1.0, d*1.06, ry, shade(col,-0.15));
  BOX(x, y+h-2.4, z, w*1.02, 0.5, d*1.02, ry, shade(col,0.06));       /* formal stringcourse */
  var fp = loc(x,z, w*0.5+1.8, 0, ry);
  FR8(fp[0], y+h*0.70, fp[1], 3.6, 1.1, d*0.55, ry, pick(ROOFS), 'roof');  /* portico canopy */
  [-1,1].forEach(function(s){
    var pp = loc(x,z, w*0.5+1.8, s*d*0.20, ry);
    CYL(pp[0], y, pp[1], 0.34, h*0.70, 0, shade(col,0.05));
  });
  var dp = loc(x,z, w*0.5+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.4, h*0.42, d*0.20, ry, shade(col,-0.4), 'wood');
  CYL(x, y+h+1.0, z, w*0.16, 2.2, 0, shade(col,0.08));                 /* cupola drum */
  FR3(x, y+h+3.2, z, w*0.12, 3.0, w*0.12, 0, shade(col,0.12));         /* spire/finial: the "official building" marker */
}

(function(){
  reseed(5553);
  var cx = 951.58, cz = -939.26, ry = 0.341;
  var w = 50, d = 40;
  var col = pick(TONES);
  var yb = plinth(cx, cz, w*0.5, d*0.5, ry, col) + 0.2;
  claim(cx, cz, w*0.5, d*0.5, ry, 'customs');
  customsHouse(cx, yb, cz, ry, w, d, col);
})();
