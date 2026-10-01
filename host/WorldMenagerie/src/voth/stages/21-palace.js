/* ==== PALACE: THE GILT REDESIGN ==== */
var PALACE_GOLD     = 0xd0a53c;

var PALACE_GOLD_DK  = 0x9d7a28;   /* the same gilt in shadow, for undersides and deep bands */

var PALACE_PORPHYRY = PORPHYRYC[0];

function palaceButtress(c, ang, lat, B){
  var p = loc(c.x, c.z, lat, B.rP, ang);
  BOX(p[0], B.terrY-1.2,          p[1], B.wP*1.30, 1.6,        B.dP*1.26, ang, BASALTC[0]);          /* plinth */
  FR8(p[0], B.terrY-0.2,          p[1], B.wP,      B.hP+0.2,   B.dP,      ang, B.stone);             /* pier shaft */
  BOX(p[0], B.terrY+B.hP*0.34,    p[1], B.wP*1.05, 0.9,        B.dP*1.04, ang, PALACE_PORPHYRY);     /* porphyry course */
  BOX(p[0], B.terrY+B.hP,         p[1], B.wP*1.18, 1.5,        B.dP*1.16, ang, BASALTC[0]);          /* abacus */
  BOX(p[0], B.terrY+B.hP+1.5,     p[1], B.wP*0.92, 0.8,        B.dP*0.90, ang, PALACE_GOLD, 'metal');/* gilt fillet */
  FR3(p[0], B.terrY+B.hP+2.3,     p[1], B.wP*0.62, B.hP*0.46,  B.dP*0.62, ang, shade(B.stone,0.05)); /* pinnacle */
  CONE(p[0], B.terrY+B.hP+2.3+B.hP*0.46, p[1], B.wP*0.20, B.hP*0.38, ang, PALACE_GOLD);

  var rS = B.rP - B.dP*0.42, rW = B.rWall, run = rS - rW;
  if(run < 4) return;
  var segD = run/B.nSeg*1.45, copeH = Math.max(1.5, (B.yLand-B.springY)/B.nSeg*2.2);
  for(var i=0;i<B.nSeg;i++){
    var t   = (i+0.5)/B.nSeg;
    var r   = rS + (rW - rS)*t;
    var top = B.springY + (B.yLand - B.springY)*t;                                   /* extrados: a straight rake */
    var sof = B.impostY + (B.soffitWall - B.impostY)*t + B.archRise*Math.sin(Math.PI*t);
    var q   = loc(c.x, c.z, lat, r, ang);
    BOX(q[0], sof, q[1], B.wFly,      Math.max(1.2, top-sof), segD, ang, B.stone);
    BOX(q[0], top, q[1], B.wFly*1.12, copeH,                  segD, ang, PALACE_GOLD, 'metal');
  }
  var w = loc(c.x, c.z, lat, rW + 1.2, ang);
  BOX(w[0], B.soffitWall-3.2, w[1], B.wFly*1.6, 3.4, 4.2, ang, BASALTC[0]);          /* wall corbel */

  var nPil = Math.max(8, Math.round(B.pilH/0.9)), pStep = B.pilH/nPil;
  for(var j=0;j<nPil;j++){
    var py = B.pilTop - (j+1)*pStep;
    var pr = faceHwAt(B.up, py + pStep*0.5) + 1.6;
    var pq = loc(c.x, c.z, lat, pr, ang);
    BOX(pq[0], py, pq[1], B.wFly*1.5, pStep*1.55, 3.6, ang, shade(B.stone, 0.03));
  }
  var cap = loc(c.x, c.z, lat, faceHwAt(B.up, B.pilTop) + 1.8, ang);
  BOX(cap[0], B.pilTop, cap[1], B.wFly*1.8, 1.1, 4.2, ang, PALACE_GOLD, 'metal');
}

/* a corner atrium: a hollow square court on a terrace, open to the sky. */
function palaceAtrium(c, qx, qz, terrY, aHW){
  var ax = c.x + qx, az = c.z + qz;
  var wT = aHW*0.21, wallH = aHW*0.80;
  var stone = shade(c.tone, 0.14);
  var roofIn = aHW - wT - aHW*0.34, roofOut = aHW + 0.6;
  var roofY = terrY + wallH + 0.9;

  BOX(ax, terrY+0.05, az, roofIn*1.86, 0.55, roofIn*1.86, 0, PALACE_PORPHYRY);          /* porphyry court floor */
  CYL(ax, terrY+0.60, az, roofIn*0.34, 0.40, 0, PALACE_GOLD, 'metal');                  /* gilt rosette */
  for(var s=0;s<4;s++){
    var rot = s*Math.PI/2;
    var wp = loc(ax, az, 0, aHW-wT*0.5, rot);
    BOX(wp[0], terrY-0.8, wp[1], aHW*2, wallH+0.8, wT, rot, stone);
    BOX(wp[0], terrY+wallH*0.58, wp[1], aHW*2*1.02, 0.85, wT*1.14, rot, PALACE_GOLD, 'metal');  /* stringcourse */
    BOX(wp[0], terrY+wallH-0.7,  wp[1], aHW*2*1.09, 1.5,  wT*1.62, rot, BASALTC[0]);            /* cornice */

    var rp = loc(ax, az, 0, (roofIn+roofOut)*0.5, rot);
    BOX(rp[0], roofY, rp[1], aHW*2*1.02, 1.1, roofOut-roofIn, rot, PALACE_GOLD, 'metal');
    var ep = loc(ax, az, 0, roofOut+0.2, rot);
    BOX(ep[0], roofY+1.1, ep[1], aHW*2*1.04, 0.7, 1.4, rot, BASALTC[0]);                        /* eaves line */
    var op = loc(ax, az, 0, roofIn+0.6, rot);
    BOX(op[0], roofY+1.1, op[1], roofIn*2*1.02, 0.9, 1.3, rot, BASALTC[0]);                     /* oculus rim */

    var fp = loc(ax, az, 0, (roofIn + aHW - wT*0.5)*0.5, rot);
    BOX(fp[0], terrY, fp[1], aHW*2*0.99, 1.1, (aHW - wT*0.5) - roofIn, rot, shade(stone,-0.10));
    for(var k=0;k<3;k++){                                                                        /* inner colonnade */
      var cp = loc(ax, az, (k-1)*aHW*0.60, aHW-wT-1.6, rot);
      CYL(cp[0], terrY+1.1, cp[1], aHW*0.058, wallH*0.82, 0, PALACE_GOLD, 'metal');
      DOME(cp[0], terrY+1.1+wallH*0.82, cp[1], aHW*0.085, aHW*0.070, 0, PALACE_GOLD, 'metal');
    }
    for(var g=-1; g<=1; g+=2){                                                                   /* skylight cupolas */
      var lp = loc(ax, az, g*aHW*0.52, (roofIn+roofOut)*0.5, rot);
      CYL(lp[0], roofY+1.1, lp[1], aHW*0.105, aHW*0.30, 0, PALACE_GOLD_DK, 'metal');
      BOX(lp[0], roofY+1.1+aHW*0.30, lp[1], aHW*0.27, 0.5, aHW*0.27, 0, BASALTC[0]);
      DOME(lp[0], roofY+1.6+aHW*0.30, lp[1], aHW*0.130, aHW*0.115, 0, PALACE_GOLD, 'metal');
      CONE(lp[0], roofY+1.6+aHW*0.415, lp[1], aHW*0.032, aHW*0.13, 0, PALACE_GOLD);
    }
  }
  for(var cf=0; cf<4; cf++){                                                                     /* corner posts */
    var ca = cf*Math.PI/2, e = aHW - wT*0.35;
    var pp = loc(ax, az, e, e, ca);
    FR8(pp[0], terrY-0.8, pp[1], wT*1.9, wallH+3.6, wT*1.9, 0, stone);
    BOX(pp[0], terrY+wallH+2.8, pp[1], wT*2.2, 1.1, wT*2.2, 0, BASALTC[0]);
    CONE(pp[0], terrY+wallH+3.9, pp[1], wT*0.62, wT*1.9, 0, PALACE_GOLD);
  }
  inspectClaim(ax, az, aHW, aHW, 0, 'palaceAtrium', 'Palace atrium');
}

function palaceKiosk(c, qx, qz, terrY, kHW){
  var kx = c.x + qx, kz = c.z + qz, colH = kHW*1.15;
  BOX(kx, terrY-0.4, kz, kHW*1.86, 1.1, kHW*1.86, 0, BASALTC[0]);
  BOX(kx, terrY+0.7, kz, kHW*1.52, 0.5, kHW*1.52, 0, PALACE_PORPHYRY);
  for(var k=0;k<4;k++){
    var ka = Math.PI/4 + k*Math.PI/2;
    CYL(kx + Math.cos(ka)*kHW*0.80, terrY+0.7, kz + Math.sin(ka)*kHW*0.80,
        kHW*0.13, colH, 0, PALACE_GOLD, 'metal');
  }
  BOX(kx, terrY+0.7+colH, kz, kHW*1.72, 1.2, kHW*1.72, 0, BASALTC[0]);
  DOME(kx, terrY+1.9+colH, kz, kHW*0.86, kHW*0.66, 0, PALACE_GOLD, 'metal');
  CONE(kx, terrY+1.9+colH+kHW*0.66, kz, kHW*0.16, kHW*0.62, 0, PALACE_GOLD);
}

/* ==== PALACE: BRIDGE ARRIVALS AND FACE GARDENS ==== */
var PAL_BAYS = null;
function palaceBays(c, innerHw){
  if(PAL_BAYS && PAL_BAYS.canton === c.n) return PAL_BAYS;
  var idx = CANTONS.indexOf(c), out = [];
  var gapHw = innerHw*0.24, bayLat = innerHw*0.51, faceEnd = innerHw*0.98;

  var rL = c.r*0.94, footR = innerHw;
  SPANS.forEach(function(sp){
    var other = (sp.a===idx) ? CANTONS[sp.b] : (sp.b===idx) ? CANTONS[sp.a] : null;
    if(!other) return;
    var dx = other.x-c.x, dz = other.z-c.z, L = Math.hypot(dx,dz) || 1;
    var rx = c.x + dx/L*rL, rz = c.z + dz/L*rL;          /* what the SPANS loop would use */
    var ox = rx-c.x, oz = rz-c.z;
    var nx, nz;                                           /* the flat face it belongs to */
    if(Math.abs(ox) > Math.abs(oz)){ nx = ox>0?1:-1; nz = 0; } else { nx = 0; nz = oz>0?1:-1; }
    var tx = -nz, tz = nx;                                /* that face's own sideways axis */
    var lat = ox*tx + oz*tz, tgt = lat, moved = false;
    if(Math.abs(lat) > gapHw && Math.abs(lat) <= faceEnd){
      tgt = (lat<0?-1:1)*bayLat; moved = true;
    }
    var ax = moved ? c.x + nx*rL + tx*tgt : rx;
    var az = moved ? c.z + nz*rL + tz*tgt : rz;

    var obx = other.x - dx/L*other.r*0.94, obz = other.z - dz/L*other.r*0.94;
    var vx = obx-ax, vz = obz-az, vl = Math.hypot(vx,vz) || 1;
    out.push({ other:other.n, nx:nx, nz:nz, tx:tx, tz:tz, lat:tgt, rawLat:lat, moved:moved,
               rawX:rx, rawZ:rz, x:ax, z:az, vx:vx/vl, vz:vz/vl,
               footX: c.x + nx*footR + tx*tgt,
               footZ: c.z + nz*footR + tz*tgt });
  });
  out.canton = c.n;
  PAL_BAYS = out;
  window._palaceBays = out.map(function(b){
    return { from:b.other, lat:Math.round(b.lat), wasLat:Math.round(b.rawLat), moved:b.moved,
             x:Math.round(b.x), z:Math.round(b.z),
             obliqueDeg:Math.round(Math.acos(Math.min(1,Math.abs(b.vx*b.nx+b.vz*b.nz)))*180/Math.PI) };
  });
  return out;
}

function palaceLandingShift(c, ax, az){
  if(c.n !== 'Palace' || !PAL_BAYS) return null;
  for(var i=0;i<PAL_BAYS.length;i++){
    var b = PAL_BAYS[i];
    if(Math.abs(b.rawX-ax) < 0.5 && Math.abs(b.rawZ-az) < 0.5)
      return b.moved ? { x:b.x, z:b.z, foot:[b.footX, b.footZ] } : null;
  }
  return null;
}

/* ==== A POINTED ARCH, inside an axis-aligned primitive set ==== */

function palaceGateShift(c, a, innerHw, jOut){
  var bays = palaceBays(c, innerHw), gapHw = innerHw*0.24, lim = gapHw*0.42;
  var nx = Math.cos(a), nz = Math.sin(a), tx = Math.sin(a), tz = -Math.cos(a), best = 0;
  for(var i=0;i<bays.length;i++){
    var b = bays[i];
    if(b.moved) continue;
    if(Math.abs(b.nx-nx) > 1e-6 || Math.abs(b.nz-nz) > 1e-6) continue;
    if(Math.abs(b.rawLat) > gapHw) continue;                  /* a corner arrival, not this gate's */
    var l = (b.x-c.x)*tx + (b.z-c.z)*tz;
    if(Math.abs(l) > Math.abs(best)) best = l;
  }
  return Math.max(-lim, Math.min(lim, best));
}

var PAL_GATE_I = 0;
function palaceGate(c, a, rG, ySill, oHW, dG, tone, shift){
  var gi0 = bucketTotal();
  var gry  = Math.PI/2 - a;                      /* loc()'s radial axis == this face's normal */
  var jOut = oHW*1.34;                           /* the gate block's own half-width */
  var ySpr = ySill + oHW*0.78;                   /* the impost line, above every deck parapet */

  var eFr  = 0.68;
  var e    = oHW*eFr, R = oHW*(1+eFr), hA = oHW*Math.sqrt(1+2*eFr);
  var vD   = oHW*0.34;                           /* voussoir depth */
  var N    = 24;
  var st   = shade(tone, 0.13);
  var S    = shift || 0;
  function at(l){ return loc(c.x, c.z, S+l, rG, gry); }
  function xi(dy){ return Math.sqrt(Math.max(0, R*R - dy*dy)) - e; }

  BOX(at(0)[0], ySill-2.4, at(0)[1], jOut*2*1.10, 2.4, dG*1.10, gry, BASALTC[0]);   /* corbel course */
  /* jambs, with a porphyry course and a black impost block */
  [-1,1].forEach(function(s){
    var p = at(s*(oHW+jOut)*0.5);
    BOX(p[0], ySill,              p[1], jOut-oHW,        ySpr-ySill, dG,      gry, st);
    BOX(p[0], ySill+(ySpr-ySill)*0.46, p[1], (jOut-oHW)*1.04, 1.0,   dG*1.03, gry, PALACE_PORPHYRY);
    BOX(p[0], ySpr-1.6,           p[1], (jOut-oHW)*1.12, 1.6,        dG*1.08, gry, BASALTC[0]);
    var q = at(s*(oHW+0.7));
    BOX(q[0], ySill, q[1], 1.4, ySpr-ySill, dG*1.02, gry, BASALTC[2]);   /* jamb soffit liner */
  });

  for(var k=0;k<N;k++){
    var y0 = ySpr + hA*k/N, y1 = ySpr + hA*(k+1)/N;
    var x0 = xi(hA*k/N), x1 = xi(hA*(k+1)/N), step = Math.max(0, x0-x1);
    var hk = (y1-y0)*1.15, wv = vD + step;
    var wl = Math.max(1.4, step*0.95), wg = Math.max(1.6, step*0.95);
    [-1,1].forEach(function(s){
      var p = at(s*(x1 + wv*0.5));
      BOX(p[0], y0, p[1], wv, hk, dG, gry, st);                          /* voussoir */
      var q = at(s*(x1 + wl*0.5));
      BOX(q[0], y0, q[1], wl, hk, dG*1.02, gry, BASALTC[2]);             /* soffit shadow line */
      var g = at(s*(x1 + wv + wg*0.5));
      BOX(g[0], y0, g[1], wg, hk, dG*1.06, gry, PALACE_GOLD, 'metal');   /* the gilt extrados line */
      var sw = jOut - (x1 + wv + wg);
      if(sw > 0.9){
        var sp = at(s*(jOut - sw*0.5));
        BOX(sp[0], y0, sp[1], sw, hk, dG, gry, st);                      /* spandrel */
      }
    });
  }
  var ap = at(0), yA = ySpr + hA;
  BOX(ap[0], yA-2.0, ap[1], vD*1.15, 4.4, dG*1.04, gry, PALACE_PORPHYRY);/* keystone, on the point */
  BOX(ap[0], yA+2.4, ap[1], jOut*2*1.12, 2.0, dG*1.14, gry, BASALTC[0]); /* cornice */
  BOX(ap[0], yA+4.4, ap[1], jOut*2*0.98, 0.9, dG*1.02, gry, PALACE_GOLD, 'metal');
  FR3(ap[0], yA+5.3, ap[1], oHW*0.44, oHW*0.17, dG*0.44, gry, st);
  CONE(ap[0], yA+5.3+oHW*0.17, ap[1], oHW*0.16, oHW*0.22, gry, PALACE_GOLD);
  [-1,1].forEach(function(s){                                            /* flanking pinnacles */
    var p = at(s*jOut*0.84);
    FR3(p[0], yA+4.4, p[1], oHW*0.24, oHW*0.26, dG*0.28, gry, st);
    CONE(p[0], yA+4.4+oHW*0.26, p[1], oHW*0.09, oHW*0.22, gry, PALACE_GOLD);
  });
  inspectClaim(ap[0], ap[1], jOut, dG*0.5, gry, 'palaceGate', 'Palace bridge gate');
  PAL_GATE_I += bucketTotal() - gi0;
}

/* ==== THE FOUR FACE GARDENS ==== */

var PAL_RESERVE = [];
function palFree(x,z,rad,ti){ return palFreeRect(x,z,rad,rad,0,ti); }

function palFreeRect(x,z,hl,hr,ang,ti){
  for(var i=0;i<PAL_RESERVE.length;i++){
    var o = PAL_RESERVE[i];
    if(o.ti !== ti) continue;
    var dx = x-o.x, dz = z-o.z;
    var la = dx*Math.cos(o.a) - dz*Math.sin(o.a);
    var rd = dx*Math.sin(o.a) + dz*Math.cos(o.a);
    if(Math.abs(la) < o.hl+hl && Math.abs(rd) < o.hr+hr) return false;
  }
  return true;
}
function palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, ti, fi){
  var rIn = innerHw + 1.8, rOut = outerHw - 4.2, latHw = gapHw - 2.2;
  var depth = rOut - rIn;
  if(depth < 12 || latHw < 12) return 0;
  var rMid = (rIn+rOut)*0.5, planted = 0;
  var nU = 2, nV = 4;

  [-1,1].forEach(function(s){
    for(var i=0;i<nU;i++){
      var lz = -depth*0.5 + (i+0.5)*depth/nU;
      var p = loc(c.x, c.z, s*latHw, rMid+lz, ang);
      if(palFree(p[0], p[1], 1.6, ti))
        BOX(p[0], terrY+0.5, p[1], 1.4, 0.7, depth/nU, ang, PALACE_GOLD, 'metal');
    }
    for(var j=0;j<nV;j++){
      var lx = -latHw + (j+0.5)*(latHw*2)/nV;
      var q = loc(c.x, c.z, lx, rMid + s*depth*0.5, ang);
      if(palFree(q[0], q[1], 1.6, ti))
        BOX(q[0], terrY+0.5, q[1], (latHw*2)/nV, 0.7, 1.4, ang, PALACE_GOLD, 'metal');
    }
  });

  var cW = (latHw*2)/nV, cD = depth/nU, bW = cW-3.4, bD = cD-3.4;

  if(!FLORA_SAMPLE) FLORA_SAMPLE = {};
  var seed0 = seed;                       /* --- PRNG fenced off from here --- */
  reseed(940000 + fi*97 + ti*13);
  for(var u=0;u<nU;u++) for(var v=0;v<nV;v++){
    var lv = -latHw + (v+0.5)*cW, lu = rIn + (u+0.5)*cD;
    var bc = loc(c.x, c.z, lv, lu, ang);
    var gy = terrY + 1.7, ring = 6, slot = [];
    for(var i=0;i<ring;i++){                     /* an even walk round the bed, two forms */
      var t = (i/ring)*4, sd = Math.floor(t), q2 = (t-sd)*2-1;
      var lx = sd===0 ? q2*bW*0.40 : sd===1 ? bW*0.40 : sd===2 ? -q2*bW*0.40 : -bW*0.40;
      var lz = sd===0 ? -bD*0.40 : sd===1 ? q2*bD*0.40 : sd===2 ? bD*0.40 : -bD*0.40;
      var p = loc(bc[0], bc[1], lx, lz, ang);
      slot.push(palFree(p[0], p[1], 2.4, ti) ? p : null);
    }
    var nFree = slot.filter(function(p){ return !!p; }).length;

    if(palFreeRect(bc[0], bc[1], cW*0.5-0.3, cD*0.5-0.3, ang, ti))
      BOX(bc[0], terrY,   bc[1], cW-0.6, 0.5, cD-0.6, ang, shade(c.tone,-0.16));  /* gravel */
    if(!palFreeRect(bc[0], bc[1], bW*0.5+0.85, bD*0.5+0.85, ang, ti) || nFree < 4) continue;
    BOX(bc[0], terrY+0.5, bc[1], bW+1.7, 0.8, bD+1.7, ang, PALACE_PORPHYRY);      /* bed rim */
    BOX(bc[0], terrY+1.3, bc[1], bW,     0.4, bD,     ang, shade(c.tone,-0.34));  /* bed soil */
    for(var i2=0;i2<ring;i2++){
      var p2 = slot[i2]; if(!p2) continue;
      if(i2%2===0) succRosette(p2[0], gy, p2[1], 1.30); else shrubCushion(p2[0], gy, p2[1], 1.40);
      planted++;
    }
    if(palFree(bc[0], bc[1], 5.0, ti)){
      var k = (u*nV + v + ti + fi) % 3;
      if(k===0)      treeFern(bc[0], gy, bc[1], 0.85);
      else if(k===1) giantGroundselV(bc[0], gy, bc[1], 0.78);
      else           succBarrel(bc[0], gy, bc[1], 1.90);
      planted++;
    }
  }

  var hedge = 16;
  for(var hh=0; hh<hedge; hh++){
    var t2 = (hh/hedge)*4, s2 = Math.floor(t2), q3 = (t2-s2)*2-1;
    var hx = s2===0 ? q3*(latHw-2.6) : s2===1 ? (latHw-2.6) : s2===2 ? -q3*(latHw-2.6) : -(latHw-2.6);
    var hz = s2===0 ? -(depth*0.5-2.6) : s2===1 ? q3*(depth*0.5-2.6)
                    : s2===2 ? (depth*0.5-2.6) : -(depth*0.5-2.6);
    var hp = loc(c.x, c.z, hx, rMid+hz, ang);
    if(!palFree(hp[0], hp[1], 2.2, ti)) continue;
    if(hh%2===0) shrubCushion(hp[0], terrY+0.5, hp[1], 1.25);
    else         succRosette(hp[0], terrY+0.5, hp[1], 1.15);
    planted++;
  }

  var bx = loc(c.x, c.z, 0, rIn + depth*0.5, ang);
  if(palFree(bx[0], bx[1], 7.0, ti)){
    CYL(bx[0], terrY+0.5, bx[1], latHw*0.20, 1.3, 0, PALACE_PORPHYRY);
    CYL(bx[0], terrY+1.8, bx[1], latHw*0.17, 0.5, 0, PALACE_GOLD, 'metal');
    CONE(bx[0], terrY+2.3, bx[1], latHw*0.05, latHw*0.22, 0, PALACE_GOLD);
  }
  if(ti === 0){
    [-1,1].forEach(function(s){
      var p = loc(c.x, c.z, s*latHw*0.76, rIn + depth*0.18, ang);
      if(!palFree(p[0], p[1], 8.0, ti)) return;
      if(fi % 2 === 0) monkeyPuzzle(p[0], terrY+0.5, p[1], 0.80);
      else             birch(p[0], terrY+0.5, p[1], 1.30);
      planted++;
    });
  }
  seed = seed0;                           /* --- PRNG restored, nothing consumed --- */
  var mid = loc(c.x, c.z, 0, rMid, ang);
  inspectClaim(mid[0], mid[1], latHw, depth*0.5, ang, 'palaceGarden', 'Palace face garden');
  return planted;
}

function palaceArchitecture(c, tierGeom, tierRings, topY){

  var NB = [4,4,4,4], LAT = { 4:[0.30,0.72] };
  var nButt = 0, nSky = 0, nAtria = 0;

  var inst0 = 0, bk, pre = {}; for(bk in BUCKET){ pre[bk] = BUCKET[bk].list.length; inst0 += pre[bk]; }

  /* ==== where the bridges actually arrive, and what that reserves ==== */
  var bays = palaceBays(c, tierGeom[1].hwb), nGarden = 0, nBay = 0;
  PAL_RESERVE = [];
  var wMax = 17, rLand = c.r*0.94, footR = CANTON_TOPS[c.n].entryHw;
  bays.forEach(function(b){
    var ba = Math.atan2(b.nx, b.nz);
    PAL_RESERVE.push({ x:b.x, z:b.z, a:ba, hl:wMax*1.03+1.2, hr:wMax*1.32+1.2, ti:0 });
    PAL_RESERVE.push({ x:(b.x+b.footX)*0.5, z:(b.z+b.footZ)*0.5, a:ba,
                       hl:wMax*0.45+1.2, hr:(rLand-footR)*0.5+1.2, ti:0 });
  });

  var dFace = {};
  cantonApproachFaces(c).forEach(function(a2){
    var sx = Math.sin(a2), sz = Math.cos(a2);
    dFace[(Math.abs(sx) > Math.abs(sz)) ? (sx>0?0:2) : (sz>0?1:3)] = true;
  });
  var sHw = tierGeom[1].hwb;
  for(var sf=0; sf<4; sf++){
    if(dFace[sf]) continue;
    var sa = sf*Math.PI/2;
    PAL_RESERVE.push({ x:c.x + Math.cos(sa)*sHw*1.02, z:c.z + Math.sin(sa)*sHw*1.02,
                       a:Math.PI/2 - sa, hl:sHw*0.17+1.6, hr:sHw*0.17+1.6, ti:0 });
  }

  tierGeom.forEach(function(t){
    BOX(c.x, t.yb+t.th-3.0, c.z, t.hwb*2*1.035, 1.0, t.hwb*2*1.035, 0, PALACE_GOLD, 'metal');
    BOX(c.x, t.yb+t.th-4.2, c.z, t.hwb*2*1.014, 0.55, t.hwb*2*1.014, 0, PALACE_PORPHYRY);
  });

  for(var i=0; i<tierGeom.length-1; i++){
    var lo = tierGeom[i], up = tierGeom[i+1];
    var innerHw = up.hwb, outerHw = lo.hwb*0.99, wid = outerHw - innerHw;
    var terrY = tierRings[i].y + 2.6;              /* the ring deck's own top face */
    if(wid < 8) continue;

    var B = {};
    B.terrY  = terrY;
    B.stone  = shade(c.tone, 0.12);

    B.dP     = Math.max(6, Math.min(wid*0.30, 13));
    B.wP     = Math.max(5.0, B.dP*0.74);
    B.rP     = innerHw + wid*0.62;
    B.hP     = Math.max(7, up.th*0.62);
    B.springY    = terrY + B.hP*0.55;              /* extrados springs mid-pier */
    B.impostY    = terrY + B.hP*0.34;              /* soffit springs off the pier's shoulder */
    B.yLand      = up.yb + up.th*0.90;             /* lands just under the tier cornice */
    B.soffitWall = B.impostY + (B.yLand - B.springY)*0.50;
    B.rWall      = faceHwAt(up, B.soffitWall);
    B.archRise   = (B.yLand - B.springY)*0.28 + 1.2;
    B.wFly       = B.wP*0.62;

    B.nSeg       = Math.max(8, Math.round(((B.rP - B.dP*0.42) - B.rWall)/0.95));
    B.up         = up;
    B.pilTop     = up.yb + up.th - 1.4;            /* just under the tier's own cornice */
    B.pilH       = B.pilTop - terrY;

    var nb = NB[i], lats = LAT[nb];
    for(var f=0; f<4; f++){
      var ang = f*Math.PI/2;
      lats.forEach(function(fr){
        [-1,1].forEach(function(sg){
          palaceButtress(c, ang, sg*fr*innerHw, B); nButt++;
        });
      });

      var gapHw = innerHw*0.24, runL = (innerHw*0.98 - gapHw);

      var cut = [];
      if(i === 0) bays.forEach(function(b){
        if(!b.moved) return;
        if(Math.abs(b.nx - Math.sin(ang)) > 1e-6 || Math.abs(b.nz - Math.cos(ang)) > 1e-6) return;

        var bl  = (b.x-c.x)*Math.cos(ang) - (b.z-c.z)*Math.sin(ang);
        var br  = (b.x-c.x)*Math.sin(ang) + (b.z-c.z)*Math.cos(ang);
        var dvr = b.vx*Math.sin(ang) + b.vz*Math.cos(ang);
        var dvl = b.vx*Math.cos(ang) - b.vz*Math.sin(ang);
        var kk  = dvl / (Math.abs(dvr) < 0.05 ? (dvr<0?-0.05:0.05) : dvr);
        var half = (wMax*0.5+1.5)/Math.max(0.30, Math.abs(dvr)) + 3.7 + 4.0;
        var la = bl + ((outerHw-5.6) - br)*kk, lb = bl + ((outerHw+1.4) - br)*kk;
        cut.push([Math.min(la,lb) - half, Math.max(la,lb) + half]);
        nBay++;
      });
      if(!cut.length){
        [-1,1].forEach(function(sg2){
          var pr = loc(c.x, c.z, sg2*(gapHw + runL*0.5), outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], runL, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], runL*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
      }else{
        var segs = [[-innerHw*0.98, -gapHw], [gapHw, innerHw*0.98]];
        cut.forEach(function(w2){
          var next = [];
          segs.forEach(function(sg4){
            if(w2[1] <= sg4[0] || w2[0] >= sg4[1]){ next.push(sg4); return; }
            if(sg4[0] < w2[0]) next.push([sg4[0], w2[0]]);
            if(w2[1] < sg4[1]) next.push([w2[1], sg4[1]]);
          });
          segs = next;
        });
        segs.forEach(function(sg4){
          var L2 = sg4[1]-sg4[0]; if(L2 < 2) return;
          var pr = loc(c.x, c.z, (sg4[0]+sg4[1])*0.5, outerHw-1.6, ang);
          BOX(pr[0], terrY-0.3, pr[1], L2, 1.9, 2.1, ang, shade(c.tone,0.08));
          BOX(pr[0], terrY+1.6, pr[1], L2*1.005, 0.6, 2.5, ang, PALACE_GOLD, 'metal');
        });
        cut.forEach(function(w2){                                   /* gate piers on the cut ends */
          [w2[0], w2[1]].forEach(function(lp){

            var onPier = false;
            lats.forEach(function(fr){ [-1,1].forEach(function(sg5){
              if(Math.abs(lp - sg5*fr*innerHw) < 11.5) onPier = true; }); });
            if(onPier) return;
            var pp = loc(c.x, c.z, lp, outerHw-1.6, ang);
            BOX (pp[0], terrY-0.8, pp[1], 7.4, 1.6, 7.4, ang, BASALTC[0]);
            FR8 (pp[0], terrY+0.8, pp[1], 6.0, 8.6, 6.0, ang, shade(c.tone,0.12));
            BOX (pp[0], terrY+4.0, pp[1], 6.2, 0.9, 6.2, ang, PALACE_PORPHYRY);
            BOX (pp[0], terrY+9.4, pp[1], 7.0, 1.3, 7.0, ang, BASALTC[0]);
            BOX (pp[0], terrY+10.7,pp[1], 6.0, 0.8, 6.0, ang, PALACE_GOLD, 'metal');
            CONE(pp[0], terrY+11.5,pp[1], 2.4, 5.2, ang, PALACE_GOLD);
          });
        });
      }

      var lr = innerHw + (B.rP - B.dP*0.5 - innerHw)*0.45;   /* inboard, against the tier above */
      [0.51, 0.93].forEach(function(lf){
        [-1,1].forEach(function(sg3){
          var dl = sg3*lf*innerHw;

          for(var cb=0; cb<cut.length; cb++) if(dl > cut[cb][0] && dl < cut[cb][1]) return;
          var sp = loc(c.x, c.z, dl, lr, ang);
          BOX (sp[0], terrY-0.3,            sp[1], wid*0.22,  1.1,       wid*0.22, ang, BASALTC[0]);
          CYL (sp[0], terrY+0.8,            sp[1], wid*0.075, wid*0.20,  0,        PALACE_GOLD_DK, 'metal');
          BOX (sp[0], terrY+0.8+wid*0.20,   sp[1], wid*0.20,  0.8,       wid*0.20, ang, BASALTC[0]);
          DOME(sp[0], terrY+1.6+wid*0.20,   sp[1], wid*0.095, wid*0.085, 0,        PALACE_GOLD, 'metal');
          CONE(sp[0], terrY+1.6+wid*0.285,  sp[1], wid*0.024, wid*0.09,  0,        PALACE_GOLD);
          nSky++;
        });
      });

      if(i <= 2) nGarden += palaceParterre(c, ang, terrY, innerHw, outerHw, gapHw, i, f);
    }

    var cQ = (innerHw + outerHw)*0.5;
    for(var q=0; q<4; q++){
      var qa = Math.PI/4 + q*Math.PI/2;
      var qx = Math.cos(qa)*cQ*Math.SQRT2, qz = Math.sin(qa)*cQ*Math.SQRT2;
      if(i < 2){ palaceAtrium(c, qx, qz, terrY, wid*0.5*0.88); nAtria++; nSky += 8; }
      else     { palaceKiosk (c, qx, qz, terrY, wid*0.5*0.80); nSky++; }
    }
  }

  /* ==== the crown: a gilt clerestory drum, a stepped gold dome and a glazed ==== */
  var dr = c.dome, y = topY;
  CYL(c.x, y+0.2,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum base ring */
  CYL(c.x, y+7.4,  c.z, dr*1.36, 1.6, 0, PALACE_GOLD, 'metal');        /* gilt drum head ring */
  for(var w=0; w<16; w++){
    var wa = w*Math.PI/8;
    var wx = c.x + Math.cos(wa)*dr*1.34, wz = c.z + Math.sin(wa)*dr*1.34;
    BOX(wx, y+1.9, wz, 4.6, 5.4, 1.3, -wa, BASALTC[2]);                     /* dark glazing */
    var ma = wa + Math.PI/16;
    BOX(c.x + Math.cos(ma)*dr*1.35, y+1.7, c.z + Math.sin(ma)*dr*1.35, 1.5, 5.9, 1.6, -ma,
        PALACE_GOLD, 'metal');                                              /* gilt mullion */
  }
  for(var k2=0; k2<8; k2++){                                            /* cupola ring on the cornice */
    var ka2 = Math.PI/8 + k2*Math.PI/4;
    var cx2 = c.x + Math.cos(ka2)*dr*1.20, cz2 = c.z + Math.sin(ka2)*dr*1.20;
    BOX(cx2, y+10.8, cz2, 6.2, 1.0, 6.2, -ka2, BASALTC[0]);
    CYL(cx2, y+11.8, cz2, 2.5, 3.4, 0, PALACE_GOLD_DK, 'metal');
    DOME(cx2, y+15.2, cz2, 3.0, 2.5, 0, PALACE_GOLD, 'metal');
    nSky++;
  }
  CYL(c.x, y+10.8, c.z, dr*1.05, 2.2, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 1 */
  CYL(c.x, y+13.0, c.z, dr*0.99, 1.8, 0, PALACE_GOLD_DK, 'metal');      /* stepped dome base, ring 2 */
  var lanY = y+14.8 + dr*0.88;
  CYL(c.x, lanY,            c.z, dr*0.20, dr*0.24, 0, PALACE_GOLD_DK, 'metal');   /* oculus lantern drum */
  for(var lw=0; lw<8; lw++){
    var la = lw*Math.PI/4;
    BOX(c.x + Math.cos(la)*dr*0.20, lanY+dr*0.02, c.z + Math.sin(la)*dr*0.20, 1.1, dr*0.20, 1.1, -la, BASALTC[0]);
  }
  BOX(c.x, lanY+dr*0.24, c.z, dr*0.50, 0.9, dr*0.50, Math.PI/4, BASALTC[0]);
  DOME(c.x, lanY+dr*0.24+0.9, c.z, dr*0.21, dr*0.17, 0, PALACE_GOLD, 'metal');
  CONE(c.x, lanY+dr*0.24+0.9+dr*0.17, c.z, dr*0.055, dr*0.34, 0, PALACE_GOLD);
  nSky++;

  var TRI = { box:12, fr8:12, fr6:12, fr3:12, cyl:40, cone:12, dome:240, blob:60, stk:24 };
  var inst1 = 0, tri = 0;
  for(bk in BUCKET){
    var d = BUCKET[bk].list.length - (pre[bk] || 0);
    inst1 += BUCKET[bk].list.length;
    tri += d * (TRI[BUCKET[bk].shape] || 12);
  }
  window._palace = { buttresses:nButt, atria:nAtria, kiosks:8, skylights:nSky,
                     gates:4, gateInstances:PAL_GATE_I, gardenBays:12,
                     gardenPlants:nGarden, movedBays:nBay,
                     instances:inst1-inst0, triangles:tri,
                     porphyry:'PAL.stone.porphyry (promoted from the local literal this pass asked about)' };
}

function monoCanton(c){
  if(c.n === 'Temple') return templeCanton(c);
  var bed = bedAt(c.x,c.z), plinthTop = 7;
  FR8(c.x, bed, c.z, c.r*2.12, plinthTop-bed, c.r*2.12, 0, shade(c.tone,-0.26));
  BOX(c.x, plinthTop-1.4, c.z, c.r*2.20, 2.6, c.r*2.20, 0, shade(c.tone,-0.36));

  var y = plinthTop, rem = c.top - y, W = tierWeights(c.tiers), hw = c.r*0.98;

  var doorFace = {};
  cantonApproachFaces(c).forEach(function(ang){
    var dx=Math.sin(ang), dz=Math.cos(ang), f;
    if(Math.abs(dx) > Math.abs(dz)) f = dx>0 ? 0 : 2; else f = dz>0 ? 1 : 3;
    doorFace[f] = true;
  });
  var entryY, entryHw;

  var tierRings = [], tierGeom = [];
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    FR8(c.x, y, c.z, hw*2, th, hw*2, 0, shade(c.tone, i%2 ? 0.04 : -0.03));
    BOX(c.x, y+th-1.0, c.z, hw*2*1.07, 2.2, hw*2*1.07, 0, shade(c.tone,-0.16));
    tierGeom.push({ yb:y, th:th, hwb:hw });   /* CANTON_FACES' own raw input — see its comment */
    y += th + 0.12;
    tierRings.push({ hw:hw, y:y });
    var nhw = hw*0.80;
    if(i < c.tiers-1){
      var ring = hw*2*0.99, t2 = nhw*2;
      [[0,(ring+t2)/4],[0,-(ring+t2)/4],[(ring+t2)/4,0],[-(ring+t2)/4,0]].forEach(function(o){
        var sw = Math.abs(o[0])>0 ? (ring-t2)/2 : ring;
        var sd = Math.abs(o[0])>0 ? ring : (ring-t2)/2;
        BOX(c.x+o[0], y, c.z+o[1], sw*0.98, 2.6, sd*0.98, 0, shade(c.tone,-0.20));
      });
    }
    if(i < 2){
      for(var f=0; f<4; f++){
        if(i === 1 && doorFace[f]) continue;   /* tier 1 is the real entrance level now */
        var a = f*Math.PI/2;
        var px = c.x + Math.cos(a)*hw*1.02, pz = c.z + Math.sin(a)*hw*1.02;
        FR8(px, y-th*0.86, pz, hw*0.34, th*0.62, hw*0.34, -a, shade(c.tone,0.07));

        if(i === 0 && c.n === 'Palace')
          palaceGate(c, a, hw*1.02, y-th*0.24, 22.0, 17.0, c.tone,
                     palaceGateShift(c, a, nhw, 22.0*1.34));
        else
          CONE(px, y-th*0.24, pz, hw*0.20, hw*0.22, -a, shade(c.tone,-0.12));
      }
    }
    hw = nhw;
    if(i === 0){ entryY = y; entryHw = hw; }
  }
  CANTON_TOPS[c.n] = { y:y, hw:hw, spring:plinthTop, entryY:entryY, entryHw:entryHw, tierRings:tierRings };
  cantonFacesRecord(c.n, c.tone, plinthTop, 1.2, c.r*1.10, tierGeom, 1.07);

  var dr = c.dome;
  var PALACE_SILVER = 0xc6cbd2;
  var gilt = (c.n === 'Palace');
  var capCol = gilt ? PALACE_GOLD : PALACE_SILVER;
  CYL(c.x, y, c.z, dr*1.34, 9, 0, shade(c.tone,0.08));
  BOX(c.x, y+9, c.z, dr*2.9, 1.8, dr*2.9, Math.PI/4, shade(c.tone,-0.14));
  if(gilt){

    DOME(c.x, y+14.8, c.z, dr, dr*0.88, 0, PALACE_GOLD, 'metal');
  }else{
    DOME(c.x, y+10.8, c.z, dr, dr*0.88, 0, PALACE_SILVER, 'dome');
    CONE(c.x, y+10.8+dr*0.88, c.z, dr*0.14, dr*0.55, 0, shade(PALACE_SILVER,-0.15));
  }
  for(var s=0;s<4;s++){
    var sa = Math.PI/4 + s*Math.PI/2;
    var sx = c.x + Math.cos(sa)*hw*0.80, sz = c.z + Math.sin(sa)*hw*0.80;
    FR3(sx, y, sz, 9, dr*1.5, 9, sa, shade(c.tone,0.02));
    if(gilt){
      BOX(sx, y+1.0,        sz, 10.4, 1.6, 10.4, sa, BASALTC[0]);           /* black base collar */
      BOX(sx, y+dr*0.52,    sz,  8.2, 1.0,  8.2, sa, PALACE_PORPHYRY);      /* porphyry band */
      BOX(sx, y+dr*1.5-1.4, sz,  6.6, 1.4,  6.6, sa, PALACE_GOLD, 'metal'); /* gilt necking */
    }
    CONE(sx, y+dr*1.5, sz, 3.4, 8, sa, gilt ? PALACE_GOLD : shade(PALACE_SILVER,0.08));
  }
  if(gilt) palaceArchitecture(c, tierGeom, tierRings, y);

  cantonApproachFaces(c).forEach(function(ang){
    var sp = loc(c.x, c.z, 0, c.r*1.06, ang);
    seaStair(sp[0], sp[1], ang, c.r*0.55, plinthTop, -2);
  });

  cantonApproachFaces(c).forEach(function(ang){
    plinthDoor(c.x, c.z, ang, entryY, entryHw, c.tone,
               tierGeom[1] ? { lean: faceLean(tierGeom[1], ang) } : null);
  });

  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);

    plinthDoor(c.x, c.z, ferryPier.ry, plinthTop+0.5, squareEdgeHw(c.r*0.98, ferryPier.ry), c.tone,
               tierGeom[0] ? { lean: faceLean(tierGeom[0], ferryPier.ry) } : null);
  }
}

var FORT_FLAT_TIER = 1;

var CANTON_TAVERN_RESERVE_POS = {};

function platCanton(c){
  var bed = bedAt(c.x,c.z), plinthTop = 5;
  FR8(c.x, bed, c.z, c.r*2.06, plinthTop-bed, c.r*2.06, 0, shade(c.tone,-0.28));
  BOX(c.x, plinthTop-1.3, c.z, c.r*2.14, 2.3, c.r*2.14, 0, shade(c.tone,-0.38));

  var y = plinthTop, rem = c.top - y, W = tierWeights(c.tiers), hw = c.r*0.97;

  var tierRings = [], tierGeom = [];
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];

    var bandLt = c.fortress ? 0.16 : 0.03, bandDk = c.fortress ? -0.10 : -0.04;
    var band = (i%2) ? bandLt : bandDk;

    if(c.fortress && i === FORT_FLAT_TIER) band = bandDk;
    FR8(c.x, y, c.z, hw*2, th, hw*2, 0, shade(c.tone, band));
    BOX(c.x, y+th-1.0, c.z, hw*2*1.06, 2.0, hw*2*1.06, 0,
        c.fortress ? shade(GREYC[GREYC.length-1], 0.20) : shade(c.tone,-0.18));
    tierGeom.push({ yb:y, th:th, hwb:hw });   /* CANTON_FACES' own raw input — see its comment */
    y += th + 0.12;
    tierRings.push({ hw:hw, y:y });
    hw *= 0.86;
  }
  CANTON_TOPS[c.n] = { y:y, hw:hw, spring:y, tierRings:tierRings };

  cantonFacesRecord(c.n, c.tone, plinthTop, 1.0, c.r*1.07, tierGeom, 1.06);

  var ring = hw*2;
  for(var f=0; f<4; f++){
    var a=f*Math.PI/2;
    for(var seg=-1; seg<=1; seg+=2){
      var off = seg*ring*0.30;
      var px = c.x + Math.cos(a)*hw*0.99 - Math.sin(a)*off;
      var pz = c.z + Math.sin(a)*hw*0.99 + Math.cos(a)*off;
      BOX(px, y, pz, ring*0.36, 2.4, 3.0, -a, shade(c.tone,-0.20));
    }
    var ex2 = c.x + Math.cos(a)*hw*1.04, ez2 = c.z + Math.sin(a)*hw*1.04;
    if(f%2===0) seaStair(ex2, ez2, -a + Math.PI, ring*0.22, y, -2);
  }

  if(c.port){
    /* a broad working quay round the platform at a low level: docks off it */
    var qy = 6.5, qw = c.r*2.06 + 70;
    FR8(c.x, bedAt(c.x,c.z), c.z, qw, qy-bedAt(c.x,c.z), qw, 0, shade(c.tone,-0.30));
    BOX(c.x, qy-0.8, c.z, qw+3, 1.6, qw+3, 0, shade(c.tone,-0.40));
    for(var b=0;b<24;b++){ var ba=b/24*Math.PI*2; CYL(c.x+Math.cos(ba)*qw*0.5*0.98, qy, c.z+Math.sin(ba)*qw*0.5*0.98, 1.0, 2.0, 0, 0x6c6353); }

    var pf = CANTON_FACES[c.n];
    if(pf){ pf.levels[0].y = qy+0.8; pf.levels[0].hw = faceHwAt(tierGeom[0], qy+0.8); pf.levels[0].outer = qw*0.5; }
    return portDeckV2(c, y, hw, qy, qw*0.5);
  }
  if(c.arena) return arenaDeckSquare(c, y, hw);
  if(c.fortress) return ordinatorFortress(c, y, hw);
  if(c.market) return marketDeck(c, y, hw);
  if(c.garden) return gardenDeck(c, y, hw);
  if(c.guild) return guildHallsDeck(c, y, hw);

  /* discrete buildings round a courtyard */
  var n = hw > 105 ? 5 : 4;
  var cell = (hw*1.84)/n;
  var lots = [];
  for(var gi=0; gi<n; gi++) for(var gj=0; gj<n; gj++){
    var lx = (gi+0.5)/n*hw*1.84 - hw*0.92 + rr(-cell*0.15, cell*0.15);
    var lz = (gj+0.5)/n*hw*1.84 - hw*0.92 + rr(-cell*0.15, cell*0.15);
    if(Math.hypot(lx,lz) < hw*0.30) continue;
    if(Math.max(Math.abs(lx),Math.abs(lz)) > hw*0.80) continue;
    lots.push([lx,lz]);
  }
  lots.sort(function(a,b){ return Math.hypot(a[0],a[1]) - Math.hypot(b[0],b[1]); });

  var CANTON_TAVERN_RESERVE = { Foreign:[4,9], Market:[9], Granary:[11,5] };
  var reserveIdx = CANTON_TAVERN_RESERVE[c.n] || [];
  lots.forEach(function(L,idx){
    var w = cell*rr(0.52,0.80), d = cell*rr(0.52,0.80);
    var ry = Math.round(rr(-0.5,3.5))*Math.PI/2 + rr(-0.10,0.10);
    var col = tone();
    var reserved = idx !== 0 && reserveIdx.indexOf(idx) !== -1;

    var preBucket = null, preNL = 0, preDoors = 0, preWin = 0;
    if(reserved){
      preBucket = {}; for(var bk in BUCKET) preBucket[bk] = BUCKET[bk].list.length;
      preNL = NL_WINDOWS.length;
      preDoors = window._facadeExtraDoors||0; preWin = window._facadeExtraWindows||0;
    }

    if(!reserved){
      inspectClaim(c.x+L[0], c.z+L[1], (idx===0?cell*0.92:w)*0.5, (idx===0?cell*0.92:d)*0.5, ry,
                   idx===0 ? 'cantonHall' : 'cantonBuilding', idx===0 ? 'Great hall' : 'Canton building');
    }
    if(idx === 0){
      var hallCol = shade(col,0.06), hallH = rr(44,60);
      structure(c.x+L[0], y, c.z+L[1], cell*0.92, cell*0.92, hallH, ry, 'domed', hallCol);
      addDoor(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol);

      var hallPreBucket = {}; for(var hbk in BUCKET) hallPreBucket[hbk] = BUCKET[hbk].list.length;
      var hallPreNL = NL_WINDOWS.length;
      var hallPreWin = window._facadeExtraWindows||0;
      addWindows(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol, Math.min(2.2, cell*0.92*0.5*0.9)*0.5);
      for(var hbk2 in BUCKET) BUCKET[hbk2].list.length = hallPreBucket.hasOwnProperty(hbk2) ? hallPreBucket[hbk2] : 0;
      NL_WINDOWS.length = hallPreNL;
      window._facadeExtraWindows = hallPreWin;

      var hallSeedSave = seed;
      reseed(((c.x|0)*7349 + (c.z|0)*631 + idx*17) >>> 0);
      cantonHallWindows(c.x+L[0], y, c.z+L[1], ry, cell*0.92, cell*0.92, hallH, hallCol, Math.min(2.2, cell*0.92*0.5*0.9)*0.5);
      seed = hallSeedSave;
    }else{
      var kind = chance(0.20) ? 'velothi' : (chance(0.12) ? 'domed' : 'hlaalu');
      var bh2 = kind==='velothi'?rr(26,52):rr(13,34);
      structure(c.x+L[0], y, c.z+L[1], w, d, bh2, ry, kind, col);
      addDoor(c.x+L[0], y, c.z+L[1], ry, w, d, bh2, col);
      addWindows(c.x+L[0], y, c.z+L[1], ry, w, d, bh2, col, Math.min(2.2, d*0.5*0.9)*0.5);
    }
    if(reserved){
      for(var bk2 in BUCKET) BUCKET[bk2].list.length = preBucket.hasOwnProperty(bk2) ? preBucket[bk2] : 0;
      NL_WINDOWS.length = preNL;
      window._facadeExtraDoors = preDoors; window._facadeExtraWindows = preWin;
      CANTON_TAVERN_RESERVE_POS[c.n] = { lx:L[0], lz:L[1] };
    }
  });
  CYL(c.x, y, c.z, rr(4,7), 3.2, 0, shade(c.tone,-0.10));
  FR3(c.x, y+3.2, c.z, 5, rr(10,18), 5, 0, shade(c.tone,0.05));
}

function arenaDeck(c, y, hw){
  var R = hw*0.80, steps = 6;
  for(var i=0;i<steps;i++){
    var t = i/steps;
    var rout = R*(1 - 0.10*t), rin = rout - R*0.13;
    var h = 3.4;
    var segs = 22;
    for(var k=0;k<segs;k++){
      var a = k/segs*Math.PI*2, a2=(k+1)/segs*Math.PI*2, am=(a+a2)/2;
      var rm = (rout+rin)/2;
      var w = 2*rm*Math.sin(Math.PI/segs)*1.06;
      BOX(c.x+Math.cos(am)*rm*1.05, y + i*h*0.55, c.z+Math.sin(am)*rm*0.80,
          rout-rin, h, w, -am, shade(c.tone, i%2?0.03:-0.05));
    }
    R *= 0.86;
  }
  BOX(c.x, y-0.4, c.z, hw*0.66, 0.5, hw*0.50, 0, 0x9a8f74);

  for(var q=0;q<6;q++){
    var a3 = q/6*Math.PI*2 + 0.3;
    var p = [c.x+Math.cos(a3)*hw*0.90, c.z+Math.sin(a3)*hw*0.74];
    structure(p[0], y, p[1], hw*0.22, hw*0.20, rr(12,26), -a3, chance(0.3)?'velothi':'hlaalu', tone());
  }
}

function marketDeck(c, y, hw){

  var rows = 7, cols = 8, cellW = (hw*1.7)/cols, cellD = (hw*1.5)/rows;
  var x0 = -hw*0.85, z0 = -hw*0.75;
  for(var r=0;r<rows;r++){
    for(var col2=0;col2<cols;col2++){
      if(r%3===2 || col2%3===2) continue;
      var sx = c.x + x0 + (col2+0.5)*cellW, sz = c.z + z0 + (r+0.5)*cellD;
      var sw = rr(3.6,5.2), sd = rr(3.6,5.2), sh = rr(2.0,2.8);
      var scol = pick(TONES_POOR);
      inspectClaim(sx, sz, sw*0.5, sd*0.5, 0, 'stall', 'Market stall');
      BOX(sx, y, sz, sw, sh, sd, rr(0,Math.PI*2), scol, 'wood');
      FR8(sx, y+sh, sz, sw*1.5, 0.8, sd*1.5, rr(0,Math.PI*2), pick(BANNERC), 'cloth');
    }
  }
  /* two covered halls anchoring the ends, larger and more permanent than a stall row */
  [-1,1].forEach(function(s){
    var hx = c.x, hz = c.z + s*hw*0.86;
    inspectClaim(hx, hz, hw*0.45, hw*0.15, 0, 'markethall', 'Covered market hall');
    shed(hx, y, hz, hw*0.9, hw*0.30, rr(6,8), 0, pick(TONES));
  });
  CYL(c.x, y, c.z, rr(4,7), 3.2, 0, shade(c.tone,-0.10));
  FR3(c.x, y+3.2, c.z, 5, rr(10,18), 5, 0, shade(c.tone,0.05));
  cantonPiers(c);   /* this canton becoming a ferry stop is the point of these */

  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier) plinthDoor(c.x, c.z, ferryPier.ry, 5.5, squareEdgeHw(c.r*0.97, ferryPier.ry), c.tone);
}

function treeBaseGrass(x,z,y){
  var ng = ri(2,4);
  for(var i=0;i<ng;i++){
    var gx = x+rr(-2.2,2.2), gz = z+rr(-2.2,2.2);
    var gr = rr(1.0,1.8);
    BLOB(gx, y, gz, gr, gr*rr(0.4,0.6), rnd()*3, pick(LEAFC), 'leaf');
  }
}
function gardenDeck(c, y, hw){
  var tiers = c.tiers || 3;
  var tierHw = [], tierY = [];
  for(var t=0; t<tiers; t++){
    tierHw.push(hw / Math.pow(0.86, tiers-1-t));
    tierY.push(y - (tiers-1-t)*(c.top/tiers)*0.9);
  }
  for(var t=0; t<tiers; t++){
    var levelHw = tierHw[t], levelY = tierY[t];

    var n = 14 + t*6, rimPos = [];
    for(var i=0;i<n;i++){
      var a = (i/n)*Math.PI*2 + rr(-0.08,0.08);
      var px = c.x + Math.cos(a)*levelHw*1.03, pz = c.z + Math.sin(a)*levelHw*1.03;
      var pick3 = rnd();
      if(pick3 < 0.30){ cherryBlossom(px, levelY, pz, a, pick(BLOOMC), {h:rr(6,9)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else if(pick3 < 0.50){ dragonTree(px, levelY, pz, a, null, {h:rr(6,9)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else if(pick3 < 0.58){ baobab(px, levelY, pz, a, null, {h:rr(6,10)}); rimPos.push([px,pz]); treeBaseGrass(px,pz,levelY); }
      else BLOB(px, levelY, pz, rr(1.6,2.8), rr(1.2,2.0), rnd()*3, pick(LEAFC), 'leaf');
      if(chance(0.5)){
        var dpx = c.x + Math.cos(a)*levelHw*1.10, dpz = c.z + Math.sin(a)*levelHw*1.10;
        BLOB(dpx, levelY-1.5, dpz, rr(0.8,1.4), rr(1.5,2.5), rnd()*3, pick(LEAFC), 'leaf');
      }
    }
    var nearRimTree = function(x,z,clear){
      for(var r=0;r<rimPos.length;r++){ if(Math.hypot(x-rimPos[r][0], z-rimPos[r][1]) < clear) return true; }
      return false;
    };

    var coverN = Math.round(levelHw*levelHw/220);
    for(var g=0; g<coverN; g++){
      var gx = c.x + rr(-levelHw*0.92, levelHw*0.92), gz = c.z + rr(-levelHw*0.92, levelHw*0.92);
      if(Math.hypot(gx-c.x,gz-c.z) > levelHw*0.95) continue;
      if(nearRimTree(gx,gz, 5.5)) continue;
      var gr = rr(1.6,3.2);
      BLOB(gx, levelY, gz, gr, gr*rr(0.4,0.7), rnd()*3, pick(LEAFC), 'leaf');
    }

    var canopyN = Math.round(coverN * 0.45), canopyLift = rr(3.0, 4.5);
    for(var g2=0; g2<canopyN; g2++){
      var cgx = c.x + rr(-levelHw*0.90, levelHw*0.90), cgz = c.z + rr(-levelHw*0.90, levelHw*0.90);
      if(Math.hypot(cgx-c.x,cgz-c.z) > levelHw*0.93) continue;
      if(nearRimTree(cgx,cgz, 9.0)) continue;
      var cgr = rr(3.0,5.5);
      BLOB(cgx, levelY+canopyLift, cgz, cgr, cgr*rr(0.30,0.45), rnd()*3, pick(LEAFC), 'leaf');
    }

    if(t>0){
      var prevY = tierY[t-1];
      var nFalls = 2 + (t<tiers-1 ? 1 : 0);
      for(var f=0; f<nFalls; f++){
        var fa = rr(0,Math.PI*2);
        var fx = c.x + Math.cos(fa)*levelHw*0.99, fz = c.z + Math.sin(fa)*levelHw*0.99;
        var dropH = Math.max(1, levelY - prevY);
        BOX(fx, prevY, fz, 2.6, dropH, 0.5, fa, 0x8fb8c4);
        BLOB(fx, prevY+0.4, fz, 2.0, 1.0, fa, 0xd8e8ea, 'leaf');
      }
    }
  }

  var fountR = hw*0.09;
  CYL(c.x, y, c.z, fountR, 2.2, 0, shade(c.tone,0.05));
  CYL(c.x, y+2.2, c.z, fountR*0.5, 3.4, 0, shade(c.accent,0.10));
  BLOB(c.x, y+5.4, c.z, fountR*0.55, fountR*0.42, 0, 0xd8e8ea, 'leaf');

  var belowY = tiers>1 ? tierY[tiers-2] : y-8;
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(dir){
    var chanLen = hw*0.60;
    var midx = c.x+dir[0]*chanLen*0.5, midz = c.z+dir[1]*chanLen*0.5;
    BOX(midx, y+1.15, midz, dir[0]?chanLen:2.6, 0.5, dir[0]?2.6:chanLen, 0, 0x8fb8c4);
    var endx = c.x+dir[0]*chanLen, endz = c.z+dir[1]*chanLen;
    var dropH = Math.max(2, y+1.15 - belowY);
    BOX(endx, belowY, endz, 2.6, dropH, 0.5, dir[0]?0:Math.PI/2, 0x8fb8c4);
    BLOB(endx, belowY+0.4, endz, 1.8, 1.0, 0, 0xd8e8ea, 'leaf');
  });

  var qNear = 1.3 + 3, qFar = hw*0.72;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(qs){
    var sx=qs[0], sz=qs[1];
    var lawnN = Math.round((qFar-qNear)*(qFar-qNear)/140);
    for(var lg=0; lg<lawnN; lg++){
      var lx = c.x + sx*rr(qNear, qFar), lz = c.z + sz*rr(qNear, qFar);
      var lr = rr(1.6,3.0);
      BLOB(lx, y, lz, lr, lr*rr(0.4,0.65), rnd()*3, pick(LEAFC), 'leaf');
    }
    var nBao = 2, nCherry = ri(1,2);
    for(var qb=0; qb<nBao; qb++){
      var bx = c.x + sx*rr(qNear+3, qFar-4), bz = c.z + sz*rr(qNear+3, qFar-4);
      baobab(bx, y, bz, rnd()*Math.PI*2, null, {h:rr(7,12)});
      treeBaseGrass(bx,bz,y);
    }
    for(var qc=0; qc<nCherry; qc++){
      var chx = c.x + sx*rr(qNear+3, qFar-4), chz = c.z + sz*rr(qNear+3, qFar-4);
      cherryBlossom(chx, y, chz, rnd()*Math.PI*2, pick(BLOOMC), {h:rr(6,9)});
      treeBaseGrass(chx,chz,y);
    }
  });
}
