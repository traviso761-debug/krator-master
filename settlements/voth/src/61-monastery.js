/* ============================== 15b. MONASTERY COMPOUND ==============================
   A self-contained, walled monastic compound — chapel, two dormitories, a
   warehouse, a couple of generic outbuildings, a well, an animal pen and a
   handful of fields, inside its own curtain wall. Modelled after 60-land.js's
   compound() (same wall/gate/corner-tower vocabulary, same "buildings in the
   back third, courtyard in front of the gate" logic) but with a fixed
   building programme instead of compound()'s randomised 2-3 generic
   structures.

   NOT PLACED YET. Per the owner's brief this is meant to become "a little
   well-contained test case for programming timed daily routines" once real
   coordinates are chosen — a clean, isolated walled precinct, not a canton
   annex wired into the road/wall network. This file only DEFINES
   monasteryCompound(x, z, ry) and its sub-pieces; nothing below calls it.
   The owner calls it later, at whatever (x,z,ry) the routine test needs,
   e.g. `monasteryCompound(1800, -900, 0.4);` — no further wiring required,
   it reserves its own footprint and paints its own fields on call. */
reseed(610001);   /* fragment head seed — build.py enforces this. Each fragment
                   owns its own PRNG stream so an edit here cannot shift
                   anything generated in a later fragment. */

/* ---- tuning ---------------------------------------------------------------
   fx/fz: default half-extents. Canton-scale, matching the smaller rim
   cantons (Guild r:120, Granary r:122, Arsenal r:126 — see 30-layout.js).
   Everything else here is a fraction of fx/fz, so a caller who passes a
   different footprint gets a layout that still fits it. ---------------- */
var MONASTERY = {
  fx: 130, fz: 112,
  wallH: [11, 15], wallT: 2.6, gapF: 0.24,     /* curtain wall height range, thickness, gate-gap fraction of fz */
  fieldCount: 10,   /* owner: "double the number of farms" — was 5 */
  wellR: 2.6,
  penW: 26, penD: 20,
  /* owner: "2 per chicken coop, add a couple more coops if they fit."
     There was no chicken coop here at all before this pass — monasteryPen()
     is a post-and-rail LIVESTOCK pen (a rail fence a bird would walk
     straight through, a lean-to feed shelter and a trough), not a henhouse,
     so it is not quietly reinterpreted as one. Coops are built fresh below,
     and only into slots that pass a real footprint test against every other
     thing in the compound — see monasteryCoopSlots. */
  coopCount: 3, coopW: 9, coopD: 7
};

/* ---- a well: low stone ring, two posts, a crossbeam and a little roof ---- */
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

/* ---- an animal pen: post-and-rail fence, a lean-to (reuses shed()) and a
   trough. halfW/halfD are local half-extents (world units), like compound()'s
   own fx/fz. ------------------------------------------------------------- */
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
  /* a lean-to feed shelter in one corner — the same warehouse/shed vocabulary
     the compound's own warehouse uses, just small */
  var sh = loc(x,z, -halfW*0.55, -halfD*0.55, ry);
  shed(sh[0], y, sh[1], halfW*0.85, halfD*0.65, rr(3.5,5), ry, pick(TONES_POOR));
  var tp = loc(x,z, halfW*0.5, halfD*0.35, ry);
  BOX(tp[0], y+0.3, tp[1], 3.2, 0.7, 1.3, ry, shade(wood,-0.1), 'wood');
}

/* ---- a chicken coop: a small raised henhouse (legs, box body, pitched
   roof, pop-hole and a plank ramp down to the ground) inside a low
   post-and-rail run, with a feed trough. Deliberately a DIFFERENT object
   from monasteryPen() above — that is a big livestock pen, this is a
   hen house a bird actually lives in. Every primitive is an already-live
   (shape,family) bucket (BOX/FR8/CYL on stone|wood|roof|plaster), so this
   costs instances but not a single new draw call. halfW/halfD are the
   RUN's local half-extents; the house itself sits in one corner of it.
   Returns the world point monks should stand at to tend it. ------------ */
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

/* ---- one window, either orientation: 'thin' true = the glass sits on a
   face whose own in-plane span runs along local z (a "+/-w" face, i.e.
   front/back), false = a face whose span runs along local x (a "+/-d"
   face, i.e. the gables/sides). A small pointed-arch cap (the same
   half-dome trick the chapel's own windows/doors use) over every one —
   the owner: "have a coherent, mayan/gothic architectural style," and the
   lancet arch is the one cheap, reusable signature this kit can repeat
   everywhere. x,z are already the WORLD position (caller does the loc()
   offset); yBase is the sill height. Box+dome, no new bucket. ---------- */
function monasteryWindow(x, z, yBase, ry, ww, wh, thin, frameCol, paneCol){
  /* the PANE (not the surrounding frame) is the lit opening — WINBOX, not
     BOX, registers it with the night-lighting pass in 45-kit.js. That makes
     every caller of this helper inherit lit windows, which is what covers
     the abbey, the tavern, the House of Healing and the defined-but-
     unplaced granary()/windmill()/watermill() (65-facade.js) at once. */
  if(thin){
    BOX(x, yBase, z, 0.30, wh, ww, ry, frameCol);
    WINBOX(x, yBase, z, 0.44, wh*0.72, ww*0.70, ry, paneCol);
  }else{
    BOX(x, yBase, z, ww, wh, 0.30, ry, frameCol);
    WINBOX(x, yBase, z, ww*0.70, wh*0.72, 0.44, ry, paneCol);
  }
  DOME(x, yBase+wh, z, ww*0.58, ww*0.46, ry, frameCol);
}

/* ---- windows + door: generic openings for the warehouse/outbuildings,
   applied at ground level against the ORIGINAL w/d passed to structure()
   (structure()'s own upper-level step-back for 'hlaalu'/'velothi' only
   ever shrinks the footprint going up, so the ground floor always matches
   w/d exactly — safe to place against without reaching into that
   function). One door centred on the +w (gate-facing) face; a full row of
   lancet windows along BOTH long faces and both gables, not a token pair
   — the owner: "give everything an appropriate amount of windows... do
   not be lazy and give it one or two." ---------------------------------- */
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
  /* +/-w faces (front/back, in-plane span along d): 3 across each,
     skipping the centre slot on the door face so nothing overlaps it */
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

/* ---- dormitory: the owner's follow-up — "make dorms bigger, they should
   be 2 stories tall, about 1.5x as wide, and 2x as long." w/d passed in
   are already the scaled-up half-... no, FULL extents (caller multiplies
   the old w*1.5, d*2.0 before calling, same convention as everywhere
   else); this function just builds 2 real storeys (a floor band between,
   not structure()'s stepped-tower 'hlaalu' — a dormitory keeps its
   footprint floor to floor, it doesn't taper) with a full run of lancet
   windows on both storeys, and 2 doors on the front face — "give
   everything at least 1 door, if not 2 for the dorms and assembly hall." */
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

  /* 2 doors, front (+w) face, either side of centre, spread over the
     face's own in-plane span (d, not w — the face panel at lx=+w/2 runs
     from -d/2 to d/2) */
  var dw = Math.min(w*0.13, 2.8), dh = Math.min(h1*0.74, 5.6);
  [-1,1].forEach(function(s){
    var dp = loc(x,z, w*0.5+0.10, s*Math.min(d*0.16, d*0.5-dw), ry);
    BOX(dp[0], yb, dp[1], dw, dh, 0.35, ry, pick(TRUNKC), 'wood');
    BOX(dp[0], yb+dh, dp[1], dw*1.3, 0.45, 0.46, ry, frameCol);
  });

  /* windows: one row per storey, run the full length of BOTH +/-w faces
     (skipping the door slots on the front) plus 2 per row on each gable
     (+/-d faces) — every storey, every side. */
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

/* ---- assembly hall: the owner — "a 3 story building with a red mansard
   roof; its entrance is on a narrow end and is attached to a 2 story
   courtyard. the courtyard has cloisters on 1st floor, offices above, and
   a pleasant contemplation garden in the middle." x,z is the HALL's own
   centre; the courtyard is attached behind it (local -x, away from the
   entrance) sized off the hall's own d (its narrow-end width). ry is the
   facing of the entrance (local +x), independent of the compound's own
   ry, same pattern the chapel already uses. */
function monasteryAssemblyHall(x, z, yb, hw, hd, h, ry, col, opt){
  opt = opt || {};
  var frameCol = shade(TRUNKC[0], -0.15), paneCol = 0x1c1a17;
  var mansard = opt.mansard || shade(BANNERC[0], -0.08);   /* red mansard, per the owner */

  /* --- the hall itself: 3 real storeys, entrance on the NARROW end (+hw,
     the short face — hd is the hall's own width across the front, hw its
     depth/length, so the entrance face at lx=+hw/2 spans the hd range,
     which is kept the smaller of the two: a narrow gable end, not the
     long side). */
  var h1=h*0.30, h2=h*0.30, h3=h*0.28, band=h*0.04;
  var y1=yb, y2=y1+h1+band, y3=y2+h2+band;
  BOX(x, y1, z, hw, h1, hd, ry, col);
  BOX(x, y1+h1-0.35, z, hw*1.03, band, hd*1.03, ry, shade(col,-0.14));
  BOX(x, y2, z, hw, h2, hd, ry, shade(col,0.02));
  BOX(x, y2+h2-0.35, z, hw*1.03, band, hd*1.03, ry, shade(col,-0.14));
  BOX(x, y3, z, hw*0.94, h3, hd*0.94, ry, shade(col,0.04));   /* 3rd storey steps in slightly, under the mansard */
  var eaveY = y3+h3;
  BOX(x, eaveY, z, hw*1.02, 0.9, hd*1.02, ry, shade(col,-0.16));
  /* mansard roof: a steep lower skirt then a shallow flat-ish cap — the
     classic two-slope mansard silhouette, red. Both FR8 (gentle batter),
     not FR6: FR6+'roof' would be a brand-new (shape,family) bucket and
     the draw-call budget is at its hard ceiling (53/53, zero headroom) —
     FR8+'roof' is already a live bucket (65-facade.js's own roof caps),
     and two stacked FR8s at a steep height still reads as a mansard's
     break in slope. */
  var mSkirtH = Math.max(7, h*0.20);
  FR8(x, eaveY+0.9, z, hw*1.00, mSkirtH, hd*1.00, ry, mansard, 'roof');
  FR8(x, eaveY+0.9+mSkirtH, z, hw*0.40, Math.max(4,h*0.10), hd*0.40, ry, shade(mansard,-0.08), 'roof');

  /* entrance: 2 doors on the narrow (+hw) end — "at least 1, if not 2 for
     the dorms and assembly hall" — flanked by a stone surround, plus a
     row of tall lancet windows on both long (+/-hd) faces per storey and
     a couple on the far (-hw) end so the hall doesn't read blank from
     the courtyard side either. */
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
    /* far (-hw) end, into the courtyard: skip the top storey (that's the
       "offices above" the cloister roofline, addressed by the courtyard
       itself) */
    if(si<2){
      [-1,1].forEach(function(k){
        var wp = loc(x,z, -(hw*0.5+0.10), k*hd*0.26, ry);
        monasteryWindow(wp[0], wp[1], row.y, ry, Math.min(1.3,wwL), row.wh*0.9, true, frameCol, paneCol);
      });
    }
  });

  /* --- the attached courtyard: 2 storeys, behind the hall (local -hw),
     a hollow square — ground-floor cloister (an open arcade, real
     openings you can see through, not a solid wall) all 4 sides, a solid
     upper storey of "offices" with its own window row, and a small green
     contemplation garden in the middle (existing leaf/fungus vocabulary,
     no new bucket). courtSpan is the FULL outer side of the square. */
  var courtSpan = hd*1.35;
  var courtH1 = h*0.30, courtH2 = h*0.26;
  var cx0 = loc(x,z, -(hw*0.5+courtSpan*0.5+1.2), 0, ry);
  var cx = cx0[0], cz = cx0[1];
  var archW = courtSpan/5, pierW = archW*0.22, archH = courtH1*0.80;
  var cloisterCol = shade(col,0.02), officeCol = shade(col,-0.04);
  [ {lx:0, lz:-courtSpan*0.5, along:'x'}, {lx:0, lz:courtSpan*0.5, along:'x'},
    {lx:-courtSpan*0.5, lz:0, along:'z'}, {lx:courtSpan*0.5, lz:0, along:'z'} ].forEach(function(side){
    /* upper storey: one continuous solid wall per side, offices' own
       window row */
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
    /* ground-floor cloister: an arcade of piers with real open gaps
       between them (a genuine walk-through colonnade), each bay capped
       with a shallow arch — the "jambs flank a real gap" idiom used
       everywhere else this session, not a solid wall with windows
       punched in. */
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
  /* NOTE: no full-square roof slab here — each side already got its own
     thin parapet strip in the loop above (line ~291); a single big BOX
     spanning the whole courtSpan here would silently roof over the
     garden in the middle too, defeating "a hollow square... a garden in
     the middle" (caught by screenshot: the garden read as a flat black
     lid from directly above until this was removed). */

  /* contemplation garden: a green square in the courtyard's own middle —
     grass-toned plaster ground plus a scatter of small trimmed shrubs
     (BLOB/leaf, already-live buckets) and a centre path/bench, "pleasant"
     per the owner rather than bare paving. */
  BOX(cx, yb-0.05, cz, courtSpan*0.66, 0.30, courtSpan*0.66, ry, 0x4f6b3a, 'plaster');
  for(var g=0; g<10; g++){
    var ga = g*(Math.PI*2/10), gr = courtSpan*0.24;
    var gp = loc(cx,cz, Math.cos(ga)*gr, Math.sin(ga)*gr, ry);
    BLOB(gp[0], yb+0.25, gp[1], rr(0.9,1.4), rr(0.9,1.3), rnd()*3, shade(0x4a7a3a, rr(-0.1,0.1)), 'leaf');
  }
  benchPlain(cx, yb+0.25, cz, ry, null, {});

  return { x:x, z:z, ry:ry, courtCx:cx, courtCz:cz, courtSpan:courtSpan };
}

/* ---- the chapel: a taller nave with a gabled roof mass, stained-glass
   windows and an arched door, and a small bell tower projecting toward
   the gate (its own local +w, i.e. the compound's +fx / gate direction,
   when passed the compound's own ry unrotated). The door/tower/window
   facing (`ry`) is passed in SEPARATELY from the compound's own ry — per
   the owner, the chapel should face the Temple canton regardless of which
   way the compound gate faces. `glassCols` is 2-3 colours cycled across
   the panes (purple/gold/crimson, pulled straight from PAL.banner —
   BANNERC[0] is already a deep crimson, [4] a warm gold, [5] a soft
   purple — no new palette entries needed). */
function monasteryChapel(x, yb, z, w, d, h, ry, col, glassCols){
  glassCols = glassCols || [BANNERC[0], BANNERC[4], BANNERC[5]];
  BOX(x, yb, z, w, h, d, ry, col);
  BOX(x, yb+h-0.5, z, w*1.05, 0.9, d*1.05, ry, shade(col,-0.15));
  FR8(x, yb+h, z, w*1.08, h*0.40, d*1.08, ry, shade(BANNERC[0], -0.05), 'roof');   /* designated crimson-slate roof, not a random pick */
  /* owner: "give it 4 steeples, one for each corner" — was a single bell
     tower at one front corner; now the same tower unit (unchanged shape/
     size formula, still FR6/BOX/CONE/CYL on already-live buckets, zero
     new draw calls) is repeated at all 4 corners via sign mirroring on
     both the x and z offsets. x offset is half the nave's own extent
     (w*0.5) plus half the tower's own footprint (w*0.30 full width / 2 =
     w*0.15), minus a small overlap so the tower base actually merges into
     the nave wall instead of floating a gap off it (the old w*0.30 offset
     floated 0.15w clear of the wall — "steeple does not entirely connect
     to main building").
     owner's follow-up: "make sure chapel door aligns properly, make sure
     stained glass windows are visible" — real bug, confirmed by the math:
     the OLD z offset (d*0.32) was tuned for a single FRONT corner tower
     that only had to dodge that one side's own window, not a true corner.
     Once mirrored to all 4 corners, d*0.32 put the front two towers close
     enough to z=0 (the door, dead centre) and z=+-0.30w (the front
     windows, below) that the tower's own half-width (w*0.30) reached
     back over both — the door's sightline was pinched and the front
     stained-glass windows sat literally inside/behind the tower body.
     Fixed by pushing the z offset out to the nave's true corner (d*0.5)
     plus the same margin logic the x offset already uses, so all 4
     towers sit at the real corners, clear of the door (z=0) and both the
     front windows (z=+-0.30w) and the flank windows (z=+-0.34d). */
  var towerOffX = w*0.5 + w*0.15 - w*0.03, towerOffZ = d*0.5 + w*0.15 - w*0.03;
  var th = h*1.5;
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(cs){
    var tp = loc(x,z, cs[0]*towerOffX, cs[1]*towerOffZ, ry);
    FR6(tp[0], yb, tp[1], w*0.30, th, w*0.30, ry, shade(col,0.04));
    BOX(tp[0], yb+th, tp[1], w*0.36, 1.2, w*0.36, ry, shade(col,-0.18));
    CONE(tp[0], yb+th+1.2, tp[1], w*0.19, w*0.55, ry, shade(BANNERC[0],-0.05));
    CYL(tp[0], yb+th-1.5, tp[1], w*0.08, 1.5, ry, shade(col,-0.3), 'metal');
  });

  /* arched door, centred on the front (+w) face: a tall door leaf under a
     shallow half-dome arch (the same rounded-cap trick structure()'s
     'velothi' kind uses for its own cap). */
  var doorW = w*0.20, doorH = h*0.42;
  var dp = loc(x,z, w*0.5+0.10, 0, ry);
  BOX(dp[0], yb, dp[1], doorW, doorH, 0.4, ry, shade(TRUNKC[0],-0.2), 'wood');
  BOX(dp[0], yb+doorH, dp[1], doorW*1.3, 0.4, 0.5, ry, shade(col,-0.2));
  DOME(dp[0], yb+doorH+0.4, dp[1], doorW*0.65, doorW*0.55, ry, shade(col,0.02));

  /* stained-glass windows: one tall arched pane each side of the door on
     the front face, plus one on each flank — each a coloured pane behind
     a stone tracery frame, capped with the same half-dome arch trick. */
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

/* ---- one field patch --------------------------------------------------
   FARMS' own fields (40-ground.js) paint straight onto the terrain-level
   ground canvas — but this compound, like compound() itself, sits on its
   own plinth (a solid stone slab levelling the whole footprint, below),
   so canvas paint at bare terrainH() would be invisible under it: tried
   first, confirmed by screenshot (a uniform stone floor, no field colour
   or bank borders reached the surface). Geometry instead: a thin coloured
   slab in the same FIELDC tones farmland is painted with, sitting ON the
   plinth like the well/pen/buildings do, bordered by the same low
   earth-bank boxes FARMS.forEach (60-land.js) draws round its own fields.
   x,y,z is the plinth-level position (y = the compound's own yb); w/h are
   FULL extents (matches FARMS' own q.w/q.h convention). ------------------ */
function monasteryField(x, y, z, w, h, ry){
  var tone = pick(FIELDC);
  BOX(x, y-0.05, z, w, 0.35, h, ry, tone, 'plaster');
  [[0,h/2],[0,-h/2]].forEach(function(e){ var o=loc(x,z,e[0],e[1],ry); BOX(o[0], y-0.4, o[1], w, 1.3, 1.4, ry, 0x7a6d55, 'plaster'); });
  [[w/2,0],[-w/2,0]].forEach(function(e){ var o=loc(x,z,e[0],e[1],ry); BOX(o[0], y-0.4, o[1], 1.4, 1.3, h, ry, 0x7a6d55, 'plaster'); });
}

window._monastery = 0;

/* ---- what the life layer needs to know about this compound -------------
   78-life.js's monks read this and nothing else: every field's own centre
   and half-extents (so 5 monks per field can spread over the real plot
   rather than stacking on one point), the chapel's own door step, both
   dormitory doors, and one tending point per chicken coop. Populated by
   monasteryCompound() below; read at runtime, long after every fragment
   has loaded, so ordinary cross-fragment globals are fine here (same
   convention QUARRY_LABORER_HOUSES / MARKET_STALLS already use). The
   monastery itself is drawn, tested and reported entirely here — the life
   fragment never recomputes any of this geometry. */
var MONASTERY_SITES = { y: 0, fields: [], coops: [], chapelDoor: null, dorms: [] };

/* candidate coop slots, as fractions of (fx,fz) in the compound's own local
   frame. These are CANDIDATES, not placements: monasteryCompound() tests
   each one against the real footprint of everything else it has already
   built and skips any that clash, so "a couple more coops if they fit"
   gets an honest answer instead of an assumed one. Ordered best-first. */
var MONASTERY_COOP_SLOTS = [
  [ 0.24, -0.21], [ 0.23,  0.24], [-0.48, -0.86],
  [ 0.62,  0.30], [-0.30,  0.72], [-0.62,  0.52]
];
/* axis-aligned overlap in the compound's own local frame. Everything here
   is either axis-aligned already or jittered by only a few degrees, so a
   local-frame AABB with each item's own largest extent used on BOTH axes is
   a genuinely conservative test (it can reject a slot that would in fact
   fit; it cannot accept one that would clash). */
function monasteryClash(cx, cz, hw, hd, occ){
  for(var i=0;i<occ.length;i++){
    var o = occ[i];
    if(Math.abs(cx-o[0]) < hw+o[2] && Math.abs(cz-o[1]) < hd+o[3]) return true;
  }
  return false;
}

/* ============================== monasteryCompound ==============================
   monasteryCompound(x, z, ry, fx, fz)
     x, z    — world position of the compound's centre
     ry      — rotation; the gate sits on the local +fx face, i.e. world
               direction ry (same convention as compound())
     fx, fz  — optional half-extents; default to MONASTERY.fx/fz (canton-scale)

   Builds: outer wall + gated towerless-but-cornered curtain (compound()'s own
   wall vocabulary), a chapel with a small bell tower, two dormitories, a
   warehouse (shed()), two more generic buildings drawn from the same
   kind-mix compound() itself uses (hlaalu/velothi/domed), a well, an animal
   pen, and 5 fields painted the way every other farm field in the city is
   painted. Reserves its own footprint via claim() so later passes (trees,
   props) don't scatter through the walls — call it before 75-terrain.js
   turns the ground canvas into a texture and before 70-veg.js scatters
   vegetation, i.e. anywhere in fragment order up through this one is safe;
   later is not guaranteed to paint the fields into the baked ground texture.
================================================================================ */
function monasteryCompound(x, z, ry, fx, fz){
  fx = (fx === undefined) ? MONASTERY.fx : fx;
  fz = (fz === undefined) ? MONASTERY.fz : fz;

  claim(x, z, fx+6, fz+6, ry, 'compound');

  /* owner: "the floor of the abbey compound can be transparent, it should
     be green and leafy like the park is" — plinth() (60-land.js, shared by
     every compound in the city) draws a solid stone slab across the whole
     footprint whenever the ground isn't dead flat; this site's ground is
     gently uneven (checked at placement: terrainH varies a few units
     across the footprint), so that slab was firing and burying the park
     grass under a uniform stone floor — almost certainly also what read as
     "'stone' texture tiling over the farms", since the field boxes sit
     right on/beside that same slab. footing() is the same height sampling
     plinth() calls internally, without the auto-slab: buildings/fields/
     well/pen below still sit at its highest sampled corner exactly as
     before, but the natural park ground between and around them now shows
     through instead of being paved over. */
  /* owner: "build fence and chapel from same basalt texture as city walls"
     — BASALTC (05-palette.js), the same dark-basalt palette the curtain
     wall/tower redo already uses citywide, replacing the generic pick
     (TONES) this compound used before. Family stays 'stone' (BASALTC is
     just a darker set of hexes in the same family) — no new bucket. */
  var col = pick(BASALTC);
  var f = footing(x, z, fx, fz, ry);
  /* owner: "the abbey fence and buildings are floating off the ground" —
     real bug, confirmed live: footing()'s own 9-point sample grid across
     this footprint spans terrainH 3.4 to 15.6 (checked at the CURRENT
     orientation, after the "face the Temple canton" reorientation moved
     which real ground this 145x120 footprint actually covers — the
     original orientation's own siting note only found a ~4-unit spread,
     this one is 12.2). Every wall segment/building here is drawn at one
     flat yb, previously pinned to f.hi (the highest corner) so nothing
     would ever sit buried in the rise — but across a spread this big
     that means the LOW corner's own wall/buildings float up to ~12
     units above their real local ground, which is exactly what read as
     "floating": a flat platform can't fully solve a real 12-unit
     diagonal slope, but pinning to the MIDPOINT instead of the max
     halves the worst floating gap (to ~6) in exchange for mild,
     hillside-plausible embedding on the opposite corner — floating
     reads as broken, a wall partly set into a rising slope reads as
     ordinary hillside construction, so this is the better trade of the
     two, not a free fix. */
  var yb = (f.hi + f.lo) / 2 + 0.2;
  var wh = rr(MONASTERY.wallH[0], MONASTERY.wallH[1]), wt = MONASTERY.wallT, gapf = MONASTERY.gapF;

  /* ---- curtain wall + gate + corner towers (compound()'s own vocabulary) */
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt, fz*2, ry, yb, wh, col));
  BOX.apply(null, wallSeg(x,z, -(fx-wt*0.5), 0, wt*1.3, fz*2*1.01, ry, yb+wh, 1.2, shade(col,-0.24)));
  /* owner: "compound can have an open, small arched gate at midpoints of
     the walls" — the two side (+-fz) walls each get a small secondary
     gate at their own midpoint (local x=0), on top of the main gate on
     the +fx/east wall below. Same split-segment technique as the main
     gate, just a much smaller gap, capped with a low arch (the same
     half-dome-over-a-lintel trick the chapel's own door uses) instead of
     the main gate's full gatehouse mass. */
  var sideGapF = 0.11;
  [-1,1].forEach(function(side){
    var segL = fx*(1-sideGapF);
    [-1,1].forEach(function(s){
      var o = loc(x,z, s*(fx - segL*0.5), side*(fz-wt*0.5), ry);
      BOX(o[0], yb, o[1], segL, wh, wt, ry, col);
      BOX(o[0], yb+wh, o[1], segL*1.01, 1.2, wt*1.3, ry, shade(col,-0.24));
    });
    /* small arched gate: the old build filled the whole gap with a solid
       box up to 62% wall height under a dome cap — no actual opening, so
       it read as a squat post with a round cap, i.e. a mushroom, not a
       gate. Real jambs flank a genuine gap now; the arch/lintel sits well
       above head height and spans OVER the opening instead of plugging it. */
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
  /* owner: "make gates properly open to outside" — the old main gate was
     a solid box filling almost the whole width AND height of its own gap
     (the same "reads as a mushroom, not a gate" problem the side gates
     already had fixed this session), so nothing could actually walk
     through it. Real twin gatehouse piers now flank a genuine void, with
     the lintel/arch pinned well above headroom (wh*0.95, not wh*1.5 down
     to the ground) so the passage underneath is clear all the way to the
     compound floor. */
  var gp = loc(x,z, fx-wt*0.5, 0, ry);
  var gateW = fz*gapf*2, pierW = wt*2.2, pierH = wh*1.55;
  [-1,1].forEach(function(s){
    var pp = loc(x,z, fx-wt*0.5, s*(gateW*0.5+pierW*0.5), ry);
    FR8(pp[0], yb, pp[1], pierW, pierH, pierW*1.3, ry, shade(col,0.05));
    BOX(pp[0], yb+pierH, pp[1], pierW*1.3, 1.4, pierW*1.6, ry, shade(col,-0.2));
    CONE(pp[0], yb+pierH+1.4, pp[1], pierW*0.55, pierW*0.95, ry, shade(col,-0.1));
  });
  var archY = yb + wh*0.95;
  /* owner: "fix the perpendicular lintel on the gate" — real bug: the
     piers are separated along local Z (loc()'s own lz argument, `s*(...)`
     above), so the lintel spanning them needs its WIDE dimension on
     local z too. BOX's own (w,h,d) map to (local x, y, local z) — this
     had them swapped, so the "lintel" was a short stub poking front-to-
     back (wt thin along z) instead of a beam actually spanning the gap
     side-to-side (gateW along z). */
  BOX(gp[0], archY, gp[1], wt*1.4, wh*0.16, gateW*1.03, ry, shade(col,-0.05));
  /* a small decorative crown on the lintel, sized off the PIERS (pierW),
     not off gateW — the first version scaled its radius to a third of the
     whole gate width (a 57-unit-wide gap here), so the "cap" became a
     20-unit-radius dome hanging in the middle of the passage: from the
     approach it read as a giant mushroom cap blocking the gate, the exact
     bug this whole pass was meant to fix, just bigger. Confirmed and
     caught by screenshot, not assumed. */
  DOME(gp[0], archY+wh*0.16, gp[1], pierW*0.9, pierW*0.5, ry, shade(col,-0.02));
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c2){
    var p = loc(x,z, c2[0]*(fx-1.6), c2[1]*(fz-1.6), ry);
    FR8(p[0], yb, p[1], 7.0, wh*1.35, 7.0, ry, shade(col,-0.05));
    BOX(p[0], yb+wh*1.35, p[1], 8.2, 1.4, 8.2, ry, shade(col,-0.2));
  });

  /* ---- buildings: an irregular cluster near the middle of the compound
     (not a back-wall row) — per the owner, "arrange them in an irregular
     cluster in the middle with farms around the edges." Each slot below is
     hand-placed at a distinct angle/depth from the well at the cluster's
     centre (not a grid), and each building's own ry is jittered a little
     off the compound's ry so they don't all face identically — reads as a
     precinct that grew building-by-building, not a barracks row. Roof
     colours are DESIGNATED per building (not pick(ROOFS)) so the cluster
     reads as a coherent set of structures rather than a random assortment:
     dormitories share one slate tone, the warehouse and outbuildings a
     second, distinct from the chapel's own crimson-slate (in
     monasteryChapel) and from ordinary town roofs. */
  var DORM_ROOF = shade(GREYC[1], -0.05);

  /* running footprint list, in this compound's own LOCAL frame, filled in
     as each piece below is placed: [localX, localZ, halfX, halfZ]. Only
     the chicken-coop fit test (bottom of this function) reads it. Kept
     alongside the real placements rather than as a second hand-written
     table so it cannot silently drift out of date when a building moves. */
  var occ = [];
  /* the curtain wall's own inner face, plus the four corner towers and the
     two side-gate passages — a coop must clear all of them too. */
  var innerHx = fx - wt - 3, innerHz = fz - wt - 3;
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(c){ occ.push([c[0]*(fx-1.6), c[1]*(fz-1.6), 6, 6]); });
  [-1,1].forEach(function(s){ occ.push([0, s*(fz-wt*0.5), fx*0.14, 9]); });   /* keep both side gates walkable */
  occ.push([fx-wt*0.5, 0, 9, fz*gapf + 6]);                                   /* and the main gate passage */

  /* the chapel faces the Temple canton, not the compound gate — its own ry
     is computed from the chapel's world position toward CIDX['Temple'],
     independent of the compound's own ry (the bell tower and the door/
     windows in monasteryChapel all project along whatever ry is passed
     in, so this alone reorients the whole building). */
  var chapelP = loc(x,z, -0.34*fx, -0.20*fz, ry);
  var templeC = CIDX['Temple'];
  /* faceToward(), not atan2(dx,dz) directly: loc()'s local +x direction in
     world space is (cos(ry),-sin(ry)), which solves to atan2(-dz,dx) for a
     target bearing, not atan2(dx,dz) (that family aligns an object ALONG a
     heading, e.g. a road segment — a different convention). The old
     atan2(dx,dz) formula pointed the door 90 degrees off the true bearing
     to the Temple, which is why it never actually faced the dome. */
  var chapelRy = templeC ? faceToward(chapelP[0], chapelP[1], templeC.x, templeC.z) : ry;
  /* owner: "give it 4 steeples... and make the whole structure 50% larger"
     — a flat 1.5x on every dimension passed in (nave w/d and h alike), so
     the corner towers (sized off w inside monasteryChapel itself) scale
     up with the rest of the building rather than staying pinned to the
     old footprint. */
  var CHAPEL_SCALE = 1.5;
  var chapelW = fx*0.26*CHAPEL_SCALE, chapelD = fz*0.22*CHAPEL_SCALE;
  monasteryChapel(chapelP[0], yb, chapelP[1], chapelW, chapelD, rr(24,30)*CHAPEL_SCALE, chapelRy, col);
  /* the chapel's own reach INCLUDING its 4 corner steeples (towerOffX/Z +
     the tower's own half-width, read straight off monasteryChapel's own
     formula) — and since its ry is independent of the compound's, that
     reach is booked as a square on both local axes, the conservative
     reading. Its door step is where the evening congregation gathers:
     the front (+w) face plus a little standing room. */
  var chapelReach = Math.hypot(chapelW*0.62 + chapelW*0.15, chapelD*0.5 + chapelW*0.27);
  occ.push([-0.34*fx, -0.20*fz, chapelReach, chapelReach]);
  var chapelDoorP = loc(chapelP[0], chapelP[1], chapelW*0.5 + 9, 0, chapelRy);
  MONASTERY_SITES.chapelDoor = { x: chapelDoorP[0], z: chapelDoorP[1], ry: chapelRy };

  /* dorms: the owner's follow-up — "make dorms bigger, they should be 2
     stories tall, about 1.5x as wide, and 2x as long" — monasteryDorm()
     (above) builds the actual 2-storey massing; w/d here are already the
     scaled-up figures (old fx*0.20/fz*0.17, times 1.5/2.0). Kept
     unjittered-but-small rotation offsets like before so the pair still
     reads as two distinct buildings, not a mirrored set. */
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
  /* both dormitory front doors — monasteryDorm puts 2 on its own +w face,
     so the point monks turn in at is that face's centre, stepped clear. */
  [[dorm1P, dorm1Ry],[dorm2P, dorm2Ry]].forEach(function(d){
    var dp = loc(d[0][0], d[0][1], dormW*0.5 + 4, 0, d[1]);
    MONASTERY_SITES.dorms.push({ x: dp[0], z: dp[1], ry: d[1] });
  });

  var whP = loc(x,z, -0.10*fx, 0.44*fz, ry);
  var whRy = ry + Math.PI/2 + rr(-0.2,0.2);
  shed(whP[0], yb, whP[1], fx*0.22, fz*0.15, rr(9,12), whRy, col);
  monasteryOpenings(whP[0], whP[1], yb, fx*0.22, fz*0.15, rr(7,8), whRy, { door: pick(TRUNKC) });
  occ.push([-0.10*fx, 0.44*fz, Math.max(fx*0.22, fz*0.15)*0.5 + 2, Math.max(fx*0.22, fz*0.15)*0.5 + 2]);

  /* assembly hall + attached cloistered courtyard: the owner's own brief
     (3 storeys, red mansard, narrow-end entrance, 2-storey courtyard with
     ground-floor cloisters / offices above / a garden in the middle) —
     see monasteryAssemblyHall() above. Sited well clear of everything
     else (chapel/dorms/warehouse/well/pen/fields all sit at local x<30;
     this whole assembly — hall plus its courtyard trailing back toward
     the well — occupies x roughly [50,107], the open east-centre band
     toward the gate, checked by hand against every other slot below
     before writing these numbers in). Facing +x, i.e. straight at the
     gate, unrotated — a deliberate axis-aligned footprint (no jitter)
     so the overlap pass below can reason about it as a clean rectangle. */
  var hallHw = fx*0.16, hallHd = fz*0.20;
  var hallP = loc(x,z, 0.655*fx, 0, ry);
  var hall = monasteryAssemblyHall(hallP[0], hallP[1], yb, hallHw, hallHd, rr(30,34), ry, col, {});
  /* the hall's own block, and its courtyard's separately — the courtyard
     is attached a full courtSpan behind the hall, so one box round the
     pair would book a lot of ground neither actually stands on. */
  occ.push([0.655*fx, 0, hallHw*0.55 + 2, hallHd*0.55 + 2]);
  occ.push([0.655*fx - (hallHw*0.5 + hall.courtSpan*0.5 + 1.2), 0, hall.courtSpan*0.55 + 2, hall.courtSpan*0.55 + 2]);

  /* ---- well, right at the cluster's own centre ----
     owner: "move the well so it's not clipping" — real bug: this slot
     (-0.15fx,-0.02fz) sits only ~35 units (compound-local) from the
     chapel's own anchor (-0.34fx,-0.20fz), which was fine against the
     chapel's OLD footprint but the chapel is now 1.5x larger (its own
     corner steeples reach roughly 50-60 units from its centre), so the
     well landed inside the enlarged chapel's own footprint. Moved further
     off toward the dorm1/warehouse side, clear of the chapel's new
     reach and still inside the building cluster the owner wanted it at
     the centre of. */
  var wellP = loc(x,z, 0.05*fx, 0.10*fz, ry);
  monasteryWell(wellP[0], yb, wellP[1], MONASTERY.wellR, ry);
  occ.push([0.05*fx, 0.10*fz, MONASTERY.wellR*2.2, MONASTERY.wellR*2.2]);

  /* ---- fields ring the perimeter, inside the wall, clear of the cluster
     and of both gates — "farms around the edges" rather than one bloc.
     Owner: "double the number of farms" — 5 more slots added below,
     hand-checked against every building's own local-frame position
     (chapel/dorms/warehouse/well/pen/hall+courtyard) for real clearance,
     same as the original 5. */
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
    /* what the monks work: the plot's own world centre, its half-extents,
       and the compound's ry so 78-life.js can lay 5 of them out ACROSS the
       real rectangle instead of piling them on one point. */
    MONASTERY_SITES.fields.push({ x:p[0], z:p[1], hw:fw*0.5, hz:fh*0.5, ry:ry });
  });

  var penP = loc(x,z, -0.65*fx, -0.65*fz, ry);
  monasteryPen(penP[0], yb, penP[1], MONASTERY.penW*0.5, MONASTERY.penD*0.5, ry);
  occ.push([-0.65*fx, -0.65*fz, MONASTERY.penW*0.5 + 3, MONASTERY.penD*0.5 + 3]);

  /* ---- chicken coops. The interior here is genuinely tight (an earlier
     pass this session tried twice to fit mushroom farms in and placed 0
     both times), so nothing is assumed: each candidate slot in
     MONASTERY_COOP_SLOTS is tested against `occ` — every wall, tower,
     gate passage, building, field, well and pen actually placed above —
     and only the ones that clear everything get built. window._monasteryCoops
     reports tried-vs-placed so a 0 would be visible rather than silent. */
  var coopHw = MONASTERY.coopW*0.5, coopHd = MONASTERY.coopD*0.5;
  var coopTried = 0, coopPlaced = 0;
  for(var ci=0; ci<MONASTERY_COOP_SLOTS.length && coopPlaced < MONASTERY.coopCount; ci++){
    var cs = MONASTERY_COOP_SLOTS[ci];
    var clx = cs[0]*fx, clz = cs[1]*fz;
    coopTried++;
    /* +3 of standing room round the run on both axes, so monks tending a
       coop aren't inside a field bank or up against a wall */
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

/* the owner's own coordinate: "Abbey compound sits roughly [-1259.5,-399.7]",
   inside the Abbey Close park zone (30-layout.js DISTRICTS, which replaced
   Promontory Point Park). Ground there is flat, dry land (terrainH ~4.2-8.6
   across the whole footprint, checked before placing) — no slope/water
   issues. Gate faces east (+X, ry=PI/2) toward the Abbey Close interior and
   the rest of the city; adjust if a different facing is wanted once the
   close's own paths are laid out.

   Nudged -30,-30 (to -1289.5,-429.7) by the citywide ring/highway obstruction
   audit: at the original spot the SE wall corner sat only 2.5 units from the
   NW highway's own centreline (nearestStreet(-1147.5,-269.7,{highway:true})
   — 7.5 half-width minus 2.5 = -5, i.e. the curtain wall itself, not just
   the padded claim() reservation, crossed into the highway's paved corridor).
   Checked before moving: the new footprint's four true (unpadded 130x112)
   corners all stay inside the Abbey Close polygon above, all still sit on
   flat dry land (terrainH 3.3-12.3 across the footprint), nothing else is
   claimed within 148 units of the new centre, and every corner/wall-midpoint
   now clears every ring/highway edge by 17+ units (was -5).

   That +17 was against the highway of the time; the NW highway has since
   been rerouted (30-layout.js, "NW: Abbey Close") to the owner's own
   lowest-elevation points and now clears this compound by ~115 units at
   the nearest corner — comfortably more, not less, so the -30,-30 nudge
   above is now more margin than strictly required but still the right
   place for the compound to sit (no reason to move it back).

   Footprint bumped 130x112 -> 145x120 for this pass (bigger dorms + the
   new assembly hall need the room) — re-checked live at the SAME centre
   the same way as every siting decision above (window._api.terrainH/
   nearestStreet against a real build, not guessed): all 8
   corner+midpoint samples stay dry (terrainH >= 2.97) and the closest any
   of them comes to a highway's own paved edge is ~5.1 units (corner
   toward the Abbey Close reroute, which per the owner's own request runs
   THROUGH this park and is the closest highway here now, not the older
   "NW" segment the comment above was written against) — tight but clear,
   not crossed.

   Owner: "orient the monastery so that both its gate and the chapel gate
   face the temple canton." The chapel's own door already faces the
   Temple independently (its own ry, computed fresh inside
   monasteryCompound via faceToward — unaffected by the compound's own
   ry). The MAIN gate sits on the compound's own +fx face, i.e. whatever
   world direction this call's own `ry` points — the fixed Math.PI/2
   here pointed it due... not at the Temple at all (faceToward(-1289.5,
   -429.7, 210,170) = -0.380 rad, nowhere near PI/2 = 1.571). Using that
   real bearing instead. Re-checked the whole reoriented 145x120
   footprint (all 8 corners+midpoints, same live probe as every other
   siting check here): stays dry (terrainH >= 3.4) and clears the
   Abbey Close highway's paved edge by 9.8+ units at every corner that
   comes near it at all — safe at the new angle too. */
monasteryCompound(-1289.5, -429.7, faceToward(-1289.5,-429.7, CIDX['Temple'].x, CIDX['Temple'].z), 145, 120);
