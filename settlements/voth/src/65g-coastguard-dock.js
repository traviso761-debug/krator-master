/* ============================== the Fortress coast-guard dock ==============
   owner: "Add a dock on the north side to it in preparation for a coast
   guard vessel." The vessel does not exist yet — this is the dock only, plus
   the mooring record a future hull will read (LIFE_CGUARD_BERTHS below,
   the same builder-fills/consumer-reads hand-off LIFE_RBARGE_DOCKS and
   LIFE_FISH_CART_STOPS already use).

   NORTH is -z. Not assumed: the ships' inlet at z=-5128 is this world's
   fixed compass reference (the arena pass established it), so the dock roots
   on the Fortress canton's -z cap edge, which is also the one face with no
   causeway (the mole leaves to the west-south-west, land at -1255,-36), no
   ferry pier (the Fortress stop is at -264,-580, on the bay-centre side) and
   no chinampas (55-chinampa.js excludes beds north-west of this canton
   outright). Water there runs 26-31 deep on the dock's own footprint,
   measured, so the pile trestle is ordinary.

   SIZE. Deliberately between the two ends of the range this file already
   has, on every dimension that has both:
                      fishing pier   THIS dock   harbour finger pier
       deck width          9.5         12.5         11-17  (~14)
       deck thickness      1.4          1.55         1.7
       piling radius       0.8          0.95         1.05
       deck top (y)        SEA+2.38     SEA+3.55     SEA+4.7
       length into water  38           74 + a 46-wide berthing head   120-215
   i.e. a patrol vessel's dock: far more than a dhow's finger pier, well
   short of the working harbour's own quays.

   COSTS NOTHING IN THE BUDGET: box|wood, cyl|wood, box|cloth and fr8|roof
   are all already-spent buckets (the ferry/fishing piers, the market
   awnings, customsHouse's portico). */
var LIFE_CGUARD_BERTHS = [];      /* {x,z,ry,len,beam} — where a coast-guard hull ties up; builder fills, a future vessel reads */
var LIFE_CGUARD_DOCK = null;      /* {rootX,rootZ,tipX,tipZ,deckY,w,headHalf} — the dock itself, for anything that needs its geometry */
(function(){
  var c = CIDX['Fortress']; if(!c) return;
  var W = 12.5, TH = 1.55, PR = 0.95;             /* deck width / thickness / piling radius */
  var DECKY = SEA + 2.0;                          /* deck BOX base; its walkable top is DECKY+TH = SEA+3.55 */
  var LEN = 74;                                   /* trestle run into the bay */
  var HEADL = 46, HEADD = 14;                     /* the berthing head, across the trestle */
  var WOOD = 0x8a7659, PILE = 0x6b5942, TRIM = 0x5b4b38;
  var GREEN = 0x2f6b3a;                           /* the order's banner green, same scalar ordinatorFortress() flies */
  var rootX = c.x, rootZ = c.z - (c.r*1.07 - 3);  /* just inside the plinth apron's own lip, so the deck meets stone */
  var tipZ = rootZ - LEN;
  /* ---- the trestle */
  BOX(rootX, DECKY, (rootZ+tipZ)*0.5, W, TH, LEN*1.02, 0, WOOD, 'wood');
  for(var k=8; k<LEN; k+=12){
    for(var sg=-1; sg<=1; sg+=2){
      var px = rootX + sg*(W*0.5-1.2), pz = rootZ - k;
      var bh = bedAt(px,pz);
      CYL(px, bh, pz, PR, DECKY+TH-bh, 0, PILE, 'wood');
    }
  }
  /* rails down the trestle only — the head stays clear for handling lines */
  for(var sg2=-1; sg2<=1; sg2+=2){
    BOX(rootX + sg2*(W*0.5-0.5), DECKY+TH, (rootZ+tipZ)*0.5 + 4, 0.5, 1.2, LEN-10, 0, TRIM, 'wood');
  }
  /* ---- the berthing head, laid across the trestle's tip */
  BOX(rootX, DECKY, tipZ, HEADL, TH, HEADD, 0, WOOD, 'wood');
  for(var hx=-1; hx<=1; hx+=1){
    for(var hz=-1; hz<=1; hz+=2){
      var qx = rootX + hx*(HEADL*0.5-2.0), qz = tipZ + hz*(HEADD*0.5-1.6);
      var bh2 = bedAt(qx,qz);
      CYL(qx, bh2, qz, PR, DECKY+TH-bh2, 0, PILE, 'wood');
    }
  }
  /* bollards along the outboard face, and a fender rubbing strake */
  for(var b=-2; b<=2; b++){
    CYL(rootX + b*10.0, DECKY+TH, tipZ - HEADD*0.5 + 1.0, 0.75, 1.7, 0, PILE, 'wood');
  }
  BOX(rootX, DECKY+TH-0.9, tipZ - HEADD*0.5 - 0.3, HEADL, 0.8, 0.8, 0, TRIM, 'wood');
  /* the harbour-watch store at the head's west end, and a signal mast
     flying the order's green over the berth */
  var hutX = rootX - HEADL*0.5 + 6.0;
  BOX(hutX, DECKY+TH, tipZ + 1.0, 9.0, 4.6, 6.4, 0, TRIM, 'wood');
  /* ROOFS[1], not pick(ROOFS): a rnd() here would advance this fragment's
     shared PRNG stream and move every placement generated after it in
     65-facade.js and in every later fragment. Nothing in this whole block
     draws from the stream, by design. */
  FR8(hutX, DECKY+TH+4.6, tipZ + 1.0, 10.2, 1.5, 7.4, 0, ROOFS[1 % ROOFS.length], 'roof');
  var mastX = rootX + HEADL*0.5 - 5.0;
  CYL(mastX, DECKY+TH, tipZ + 1.0, 0.45, 15.0, 0, PILE, 'wood');
  BOX(mastX + 0.6, DECKY+TH+9.0, tipZ + 1.0, 0.3, 4.2, 5.0, 0, GREEN, 'cloth');
  /* ---- a short flight up to the canton's own plinth apron (its surface is
     at 6.0, the deck at SEA+3.55 — a 2.5-unit step this closes in three) */
  for(var s=0;s<3;s++){
    BOX(rootX, DECKY+TH + s*0.82, rootZ + 1.2 + s*1.5, W*0.62, 0.82, 1.6, 0, WOOD, 'wood');
  }
  /* ---- registrations. LIFE_EXTRA_PIERS is what makes every existing boat
     route around this deck (lifeNavBlocked/lifePierOrBridgeBlocked,
     78-life.js) — the same registration the ferry piers and the fisherman's
     docks make, two segments because the dock is a T. */
  LIFE_EXTRA_PIERS.push({ x0: rootX, z0: rootZ, x1: rootX, z1: tipZ, w: W });
  LIFE_EXTRA_PIERS.push({ x0: rootX - HEADL*0.5, z0: tipZ, x1: rootX + HEADL*0.5, z1: tipZ, w: HEADD });
  inspectClaim(rootX, (rootZ+tipZ)*0.5, W*0.5, LEN*0.5, 0, 'dock', 'Coast-guard dock');
  inspectClaim(rootX, tipZ, HEADL*0.5, HEADD*0.5, 0, 'dock', 'Coast-guard berth');
  /* the mooring points themselves: a patrol hull lies alongside the head's
     outboard (north) face bow-east, with a second berth off its west end.
     len/beam are the hull envelope each berth was sized for — between a
     fishing dhow (16.2 x 8.1) and a harbour merchantman (50-68 x 12-16). */
  LIFE_CGUARD_BERTHS.push({ x: rootX, z: tipZ - HEADD*0.5 - 6.5, ry: Math.PI*0.5, len: 44, beam: 11, face:'north' });
  LIFE_CGUARD_BERTHS.push({ x: rootX - HEADL*0.5 - 6.5, z: tipZ, ry: 0, len: 36, beam: 10, face:'west' });
  LIFE_CGUARD_DOCK = { rootX:rootX, rootZ:rootZ, tipX:rootX, tipZ:tipZ, deckY: DECKY+TH,
                       w: W, headHalf: HEADL*0.5, headDepth: HEADD };
  window._cguardDock = { dock: LIFE_CGUARD_DOCK, berths: LIFE_CGUARD_BERTHS };   /* diagnostic */
})();

/* threads a staircase down the OUTSIDE face of the real, individual tiers
   platCanton() built (reconstructed here the same way gardenDeck() does,
   with tierWeights()/the 5-unit plinth constant it also relies on) instead
   of one straight run at a fixed outer radius. Each flight sits at its own
   tier's true half-width and only spans that tier's own height; a short
   landing bridges the outward jog to the next (wider) tier down, so the
   whole run visibly lands on every step instead of floating past all of
   them outside the silhouette. Combo: box|stone(default), only what
   seaStair() itself already uses. */
function threadedPortStair(c, y, hw, qy, ex, ez, ry){
  var PLINTH = 5, W = tierWeights(c.tiers), rem = c.top - PLINTH;
  var tY0=[], tY1=[], tHw=[], yy=PLINTH, hh=c.r*0.97;
  for(var i=0;i<c.tiers;i++){
    var th = rem*W[i];
    tY0[i]=yy; tY1[i]=yy+th; tHw[i]=hh;
    yy += th+0.12; hh *= 0.86;
  }
  for(var t=c.tiers-1; t>=0; t--){
    var topY = (t===c.tiers-1) ? y : tY1[t];      /* topmost flight uses the exact (y,hw) portDeckV2 was called with */
    var rHw  = (t===c.tiers-1) ? hw : tHw[t];
    var botY = tY0[t];
    seaStair(c.x+ex*rHw, c.z+ez*rHw, ry, 16, topY, botY);
    if(t>0){
      var rNext = tHw[t-1];
      var mx = c.x+ex*(rHw+rNext)*0.5, mz = c.z+ez*(rHw+rNext)*0.5;
      BOX(mx, botY-0.3, mz, Math.abs(rNext-rHw)+16, 1.0, 16, ry, 0xa79b82);   /* landing bridging the outward jog */
    }
  }
  seaStair(c.x+ex*tHw[0], c.z+ez*tHw[0], ry, 16, tY0[0], qy);   /* final flight, tier 0's own base down to the quay */
}

/* the harbour canton, reworked: (a) stairs now thread the real tiers via
   threadedPortStair() instead of one misaligned straight run; (b) the top
   platform's warehouse grid goes from a sparse 3x4/12%-skip to a packed
   5x7/5%-skip, and the quay level gets a third, smaller shed slotted
   between the existing pair on every qualifying face; (c) a customs house
   marks the shore-side approach — the one face piers/warehouses skip,
   which is exactly where cargo/carts would actually check in. Everything
   not called out above (sheds/cargo loop shape, harbourmaster's tower, the
   pier+crane loop) is unchanged from portDeck(). */
function portDeckV2(c, y, hw, qy, qhw){
  var lp = shoreIn(c.s, 26), sl = Math.hypot(lp[0]-c.x, lp[1]-c.z);
  var sdx = (lp[0]-c.x)/sl, sdz = (lp[1]-c.z)/sl;
  /* Navigator's Guild hall centre, computed up front (before the warehouse
     grid below) so that grid can carve out its own clearance the same way
     it already does for the lighthouse — see navClear below and this
     hall's own construction further down this function. */
  var navHX = c.x + sdx*hw*0.33, navHZ = c.z + sdz*hw*0.33;
  for(var f0=0; f0<4; f0++){
    var a0 = f0*Math.PI/2, ex = Math.cos(a0), ez = Math.sin(a0);
    if(ex*sdx + ez*sdz > 0.5) continue;
    for(var q=-1; q<=1; q++){
      var scale = (q===0) ? 0.60 : 1.0;
      var sx = c.x + ex*(qhw-14) + (-ez)*q*qhw*0.55, sz = c.z + ez*(qhw-14) + (ex)*q*qhw*0.55;
      shed(sx, qy, sz, 24*scale, 12*scale, rr(6,9)*(q===0?0.9:1), -a0+Math.PI/2, pick(TONES_POOR));
    }
    for(var g=0; g<6; g++){
      var gx = c.x + ex*(qhw-rr(6,28)) + (-ez)*rr(-qhw*0.9,qhw*0.9), gz = c.z + ez*(qhw-rr(6,28)) + (ex)*rr(-qhw*0.9,qhw*0.9);
      BOX(gx, qy, gz, rr(2.2,4), rr(2,3.6), rr(2.2,4), rnd()*3, pick([0x7a6a4e,0x877558,0x6d5e45]), 'wood');
    }
    threadedPortStair(c, y, hw, qy, ex, ez, -a0+Math.PI);
  }
  /* the lighthouse, relocated here per the owner's redesignation — the
     old standalone Lighthouse canton becomes the Fortress canton
     (ordinatorFortress) instead, and the actual lighthouse tower moves
     to the centre of the harbour it was always meant to watch over.
     Replaces the old off-centre harbourmaster's tower (a smaller stand-in
     for the same role) rather than sitting alongside it. Same tower
     geometry lighthouseDeck() (50-cantons.js) builds, scaled off this
     canton's own hw instead of a dedicated canton's. */
  var lbR = hw*0.15, lmR = hw*0.08, ltR = 6.5, lh = hw*0.95;
  inspectClaim(c.x, c.z, lbR, lbR, 0, 'lighthouse', 'Lighthouse');
  FR6(c.x, y, c.z, lbR*2, lh*0.62, lbR*2, 0, shade(c.tone,0.03));
  FR3(c.x, y+lh*0.62, c.z, lmR*2, lh*0.38, lmR*2, 0, shade(c.tone,0.06));
  BOX(c.x, y+lh-1.2, c.z, ltR*2.6, 2.2, ltR*2.6, Math.PI/4, shade(c.tone,-0.14));
  CYL(c.x, y+lh, c.z, ltR, 10, 0, shade(c.accent,0.10));
  DOME(c.x, y+lh+10, c.z, ltR*0.86, ltR*0.72, 0, c.accent, 'dome');
  CONE(c.x, y+lh+10+ltR*0.72, c.z, 1.6, 6, 0, shade(c.accent,-0.2));
  for(var ls=0; ls<4; ls++){
    var lsa = ls*Math.PI/2 + Math.PI/4;
    CYL(c.x+Math.cos(lsa)*ltR*1.25, y+lh+0.4, c.z+Math.sin(lsa)*ltR*1.25, 0.45, 6.2, 0, shade(c.tone,-0.10));
  }
  /* dense warehouse packing around it: ~2:1 length:width per the owner's
     spec, tiled edge-to-edge with only a cart's-width gap (set below)
     between neighbours and at the platform's own rim — "do not be afraid
     of filling up the cantons... as long as there is a cart's width of
     space along the outer edge". Cleared of the lighthouse's own
     footprint (lbR, the widest tier of it) by skipping any cell whose
     centre falls within lbR*1.7 of centre — generous enough that a
     shed's own half-length never clips the tower even at the closest
     ring. */
  var cart = 5.5;
  var whW = hw*0.19, whL = whW*2.05;
  var stepX = whW + cart, stepZ = whL + cart;
  var lightClear = lbR*1.7 + whL*0.5;
  /* FOURTH PASS: the same per-cell clearance trick, reused for the new
     Navigator's Guild hall (navHX/navHZ, computed at the top of this
     function) instead of a second special-cased exclusion shape — a
     warehouse CELL CENTRE within this radius of the hall is skipped, and
     since the radius already includes the warehouse's own half-length
     (whL*0.5, same margin the lighthouse clearance uses), no warehouse's
     own edge can reach the hall either, even one just outside the ring. */
  var navClear = hw*0.11 + whL*0.5 + cart;   /* hw*0.11 ~= the hall's own half-diagonal (w=hw*0.17,d=hw*0.14 below) */
  for(var wx = -hw+cart+whW*0.5; wx <= hw-cart-whW*0.5; wx += stepX){
    for(var wz = -hw+cart+whL*0.5; wz <= hw-cart-whL*0.5; wz += stepZ){
      if(Math.hypot(wx,wz) < lightClear) continue;
      if(Math.hypot(c.x+wx-navHX, c.z+wz-navHZ) < navClear) continue;
      if(chance(0.04)) continue;
      inspectClaim(c.x+wx, c.z+wz, whW*0.46, whL*0.46, 0, 'warehouse', 'Port warehouse');
      shed(c.x+wx, y, c.z+wz, whW*0.92, whL*0.92, rr(9,14), 0, pick(TONES_POOR));
    }
  }
  for(var f=0; f<4; f++){
    var a = f*Math.PI/2;
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
          var q2 = [xx - dir[1]*sg*5.5, zz + dir[0]*sg*5.5];
          CYL(q2[0], bedAt(q2[0],q2[1]), q2[1], 1.0, qy-0.6-bedAt(q2[0],q2[1]), 0, 0x6b5942, 'wood');
        });
      }
      if(i===1){
        CYL(base[0], qy, base[1], 1.4, 16, 0, 0x5b4b38, 'wood');
        BOX(base[0]+dir[0]*7, qy+14.5, base[1]+dir[1]*7, 2, 1.6, 16, -a+Math.PI/2, 0x5b4b38, 'wood');
        /* the crane pier's own outer reach used to berth a static
           tallShip() prop here — removed per the owner's own request
           (a European-galleon silhouette "doesn't fit dark elves"; the
           replacement junk-style vessel lives entirely in the life
           layer now, src/78-life.js, both the ones that sail and the
           ones that just sit — see LIFE_SHIPS' `stationary` ships).
           The crane itself (CYL/BOX above) still stands; the berth
           space is just open water now, same as any other unclaimed
           stretch of quay. */
      }
      else if(chance(0.8)){
        /* a moored ferry alongside the plank run — the center (i===1)
           pier stays clear for the crane's own berth above, the other
           two get everyday cargo traffic. The occasional tallShip()
           here was removed for the same reason as the crane berth
           above — junks are a life-layer model now, not a static prop. */
        var st = rr(0.42, 0.82), sside = chance(0.5) ? 1 : -1;
        var sx = base[0] + dir[0]*len*st + (-dir[1])*sside*19;
        var sz = base[1] + dir[1]*len*st + ( dir[0])*sside*19;
        var shipRy = Math.atan2(dir[0], dir[1]);
        ferry(sx, SEA-0.2, sz, shipRy, pick([0x5e4d3a,0x6b5942,0x4f4030,0x6a5842]),
              { len:rr(20,34), beam:rr(7.5,10.5), cargo: ri(1,3) });
        window._portShips = window._portShips || [];
        window._portShips.push([Math.round(sx),Math.round(sz)]);
      }
    }
  }
  /* the customs house, facing the shore approach — the one face the loop
     above always skips, so it is the natural checkpoint spot */
  var chRy = Math.atan2(-sdz, sdx);
  var chp = loc(c.x, c.z, hw*0.86, 0, Math.atan2(sdx,sdz));
  customsHouse(chp[0], y, chp[1], chRy, hw*0.34, hw*0.22, shade(c.tone,0.08));

  /* ---- Navigator's Guild (owner: "Navigator's guild will go on the
     harbor canton" — this canton is actually named 'Port' in CANTONS,
     30-layout.js; there is no separate 'Harbor' canton, checked directly
     before writing anything here). Sits just past the lighthouse's own
     lightClear carve-out, on the shore-approach side (same sdx/sdz
     direction the customs house uses, just much closer in than that
     building's own hw*0.86). The warehouse GRID's per-cell exclusion
     only guarantees a cell CENTRE stays clear of the lighthouse — a
     warehouse just outside that ring could still reach in with its own
     half-length, which is exactly what a first pass here clipped into
     (caught by screenshot). Fixed at the grid loop above (navHX/navHZ +
     navClear, computed before that loop runs) instead of here, the same
     per-cell exclusion trick the lighthouse already uses, so this hall
     can never be clipped by a warehouse regardless of its own size below.
     Styled like this canton's own sheds/customs house (TONES_POOR,
     wood-heavy) rather than the Guild canton's ashlar-stone idiom, per
     the owner's own "match the harbor's idiom" instruction. box|wood,
     cyl|wood, box|stone(default), box|metal — all already-spent buckets,
     zero new draw calls. ---- */
  (function(){
    var hx = navHX, hz = navHZ;
    var ry = faceToward(hx, hz, c.x, c.z);
    var w = hw*0.17, d = hw*0.14, h = hw*0.17;
    var col = pick(TONES_POOR);
    var dhw = Math.min(2.2, w*0.5*0.9)*0.5;
    structure(hx, y, hz, w, d, h, ry, 'hlaalu', col);
    addDoor(hx, y, hz, ry, w, d, h, col);
    /* owner: "at least 3 per floor" — guaranteed 2 front + 1 side (back
       half of the +z side wall, clear of the mast/compass/chart table
       which all sit out past fx0 nearer the front corner). See
       guildHallWindows3()'s own header just above addWindows() above. */
    guildHallWindows3(hx, y, hz, ry, w, d, h, col, dhw, 1, 0.22);
    /* a small mast + rigging beside the door — a real ship's mast
       re-purposed as the guild's own signal post */
    var mp = loc(hx, hz, w*0.5+3.4, -d*0.30, ry);
    var mastH = h*1.15;
    CYL(mp[0], y, mp[1], 0.30, mastH, 0, shade(TRUNKC[0],-0.1), 'wood');
    CYL(mp[0], y+mastH*0.55, mp[1], 1.6, 0.14, 0, shade(TRUNKC[0],-0.2), 'wood');   /* yardarm-ish disc */
    [-1,1].forEach(function(s){
      var rp = loc(mp[0], mp[1], s*2.4, s*1.6, 0);
      BOX((mp[0]+rp[0])/2, y+mastH*0.72, (mp[1]+rp[1])/2, 0.10, mastH*0.62, 0.10,
          Math.atan2(rp[0]-mp[0], rp[1]-mp[1]), shade(TRUNKC[0],0.05), 'wood');
    });
    /* a compass rose, set into the ground out front — a flat stone disc
       with 8 dark metal spoke points */
    var crp = loc(hx, hz, w*0.5+2.0, d*0.40, ry);
    CYL(crp[0], y+0.05, crp[1], 2.0, 0.10, 0, pick(STALKC));
    for(var pi=0; pi<8; pi++){
      var pa = pi*(Math.PI*2/8);
      var pr = loc(crp[0], crp[1], Math.cos(pa)*1.0, Math.sin(pa)*1.0, 0);
      BOX(pr[0], y+0.16, pr[1], 0.16, 0.10, 1.6, -pa, shade(ROOFS[5],-0.15), 'metal');
    }
    /* a chart table under the eave, opposite the mast */
    var ctp = loc(hx, hz, w*0.5+2.2, -d*0.42, ry);
    BOX(ctp[0], y, ctp[1], 2.4, 1.0, 1.6, ry, shade(TRUNKC[0],-0.1), 'wood');
    BOX(ctp[0], y+1.0, ctp[1], 2.0, 0.06, 1.3, ry, shade(PAL.sail[0],-0.04), 'cloth');
    var navDoor = loc(hx,hz,w*0.5+1.2,0,ry);
    GUILD_HALL_DOORS.push({ x:navDoor[0], z:navDoor[1], ry:ry, canton:'Port', name:'Navigator' });
    /* inspector footprint, same registry the Guild canton's own ten halls
       use (inspectClaim(), 86-inspect.js) — so this one reports "Navigator's
       guild hall" too rather than "Port canton". */
    inspectClaim(hx, hz, w*0.5, d*0.5, ry, 'guildhall', "Navigator's guild hall");
  })();
}

/* ---- addDoor(x, y, z, ry, w, d, h, col) ---------------------------------
   A door only, for buildings built by calling structure() directly instead
   of through townBuilding()/compound() — platCanton()'s generic courtyard
   lots and arenaDeckSquare()'s own rim buildings (below) both do this, so
   they never pass through townFacade() above and end up with blank walls.
   Mirrors townFacade()'s own door block (same box|wood sizing/inset logic,
   zero new draw calls) but is parameterised directly on structure()'s own
   call signature — (x, yb, z, w, d, h, ry, col) — so it drops in right
   after a structure() call using the exact same locals, no PLACED record
   needed. w/d are FULL extents, structure()'s own convention (townFacade
   works off PLACED's fx0/fz0 half-extents instead); halved here to match.
   Door sits centred on the local +x face — structure()'s own front, per
   the same ry/loc()/faceStreet() convention used everywhere else.

   IMPORTANT: arenaDeckSquare() calls this from inside platCanton(), which
   runs during 50-cantons.js's OWN turn — before this fragment's top-level
   code (reseed, FJ init, FACADE block) has executed. So this function must
   not read or write FJ/FACADE or anything else this fragment initialises
   at its own top level; it only touches `window`, which exists regardless
   of fragment execution order. */
function addDoor(x, y, z, ry, w, d, h, col){
  var fx0 = w*0.5, fz0 = d*0.5;
  var doorCol = col ? shade(col, rr(-0.42,-0.34)) : shade(pick(ROOFS), rr(-0.06,0.06));
  var dw = Math.min(rr(1.6,2.2), fz0*0.9);
  var dh = Math.min(rr(2.8,3.6), h*0.55);
  var dp = loc(x,z, fx0+0.05, 0, ry);
  BOX(dp[0], y, dp[1], 0.5, dh, dw, ry, doorCol, 'wood');
  window._facadeExtraDoors = (window._facadeExtraDoors||0) + 1;
}

/* ---- addWindows(x, y, z, ry, w, d, h, col, doorHalfW) -------------------
   A window-only sibling to addDoor(), for the exact same structure()-direct
   call sites — platCanton()'s generic courtyard lots and arenaDeckSquare()'s
   rim buildings — which today call addDoor() and nothing else, so every one
   of them reads as a blank-walled box apart from its door. This is the
   round-2 "canton buildings, in general, could use more windows" fix for
   that half of the brief (the other half was tuning townFacade()'s own
   FACADE.win* chances up, see the tuning block above).

   Reuses wallWindow() (this file's own helper, already used throughout
   townFacade()) rather than inventing new placement math: 1 guaranteed
   front window flanking the door, a fair chance of a second on the door's
   other side, and — on deep-enough buildings — a chance of one more round
   the side wall. Same box|stone(default) combo wallWindow() already
   spends, so this is zero new draw calls. Call right after addDoor() using
   the same locals; doorHalfW is half the door width addDoor() itself just
   picked (addDoor() doesn't return it, so callers pass their own dw*0.5 —
   see structure()'s call sites for the exact value used there — this just
   needs SOME reasonable clearance figure, not the door's true rendered
   width, since wallWindow() already keeps a margin past it).

   w/d are FULL extents (structure()'s own convention, halved here to match
   wallWindow()'s half-extent signature) — same as addDoor().

   IMPORTANT: same execution-order caveat as addDoor() — arenaDeckSquare()
   and platCanton() call this from inside 50-cantons.js's OWN top-level
   CANTONS.forEach(), which runs before this fragment's top-level code
   (reseed, FJ init, the FACADE tuning block) has executed. So — like
   addDoor() — this must not read FJ or FACADE, only call wallWindow()
   (itself safe: every value it needs is passed as an argument) and touch
   `window`, which exists regardless of fragment execution order. */
function addWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;
  var s0 = chance(0.5) ? 1 : -1;
  if(wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, s0, 0.9,1.4, 1.0,1.6)) n++;
  if(chance(0.60) && wallWindow(x,z,ry,fx0,fz0,winY,doorHalfW,winCol, -s0, 0.9,1.4, 1.0,1.6)) n++;
  if(fx0 > 7 && chance(0.45)){
    var side = chance(0.5) ? 1 : -1;
    var sp = loc(x,z, rr(-0.25,0.25)*fx0, side*(fz0+0.05), ry);
    WINBOX(sp[0], winY, sp[1], Math.min(rr(0.9,1.3), fx0*0.45), rr(1.0,1.5), 0.4, ry, winCol);
    n++;
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ---- guildHallWindows3 ----------------------------------------------------
   Owner ask: "make sure all of [the top-of-canton buildings] have an
   APPROPRIATE number of windows, at least 3 per floor." addWindows() above
   is chance()-gated (a fair-coin second front window, a 45% side window) —
   worst case it places just 1, which does not reliably clear that bar. This
   is the guaranteed alternative for the 5 new single-storey guild halls
   (Carpenter/Merchant/Weaver/Artificer in 50-cantons.js's guildHallsDeck(),
   Navigator in this file's portDeckV2()): unconditional, not chance()-gated,
   sized by formula so it mathematically cannot fail to fit — same idiom
   townFacade()'s own poor-plaster guarantee uses above (2 flanking the
   door on the front face) — plus a 3rd window on a SIDE wall so the count
   doesn't just double up the same face. Replaces the addWindows() call at
   each of those 5 sites outright (not stacked on top of it) so there is no
   chance of a random addWindows() pick landing on the same stretch of wall
   as one of these three and clipping through it.

   sideSign (-1|1) / sideFxFrac (0..1, 0=door-corner end of the wall, 1=back
   corner) are caller-picked per hall so the 3rd window can be steered clear
   of that hall's own front-of-door decorations (lumber rack, ledger table,
   loom, workbench, mast, etc — every one of which sits out past fx0 on the
   front face, never flush on a side wall, but still worth aiming the 3rd
   window at the back half of the side wall on general principle). Same
   box|stone(default) bucket wallWindow()/addWindows() already spend —
   zero new draw calls. w/d/h are FULL extents (structure()'s convention),
   same as addWindows()'s own signature. */
function guildHallWindows3(x, y, z, ry, w, d, h, col, doorHalfW, sideSign, sideFxFrac){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var winY = y + Math.min(h*0.30, rr(2.0,3.2));
  var n = 0;
  /* 2 on the front face, flanking the door — sized off the space actually
     left past doorHalfW so they mathematically cannot fail to fit */
  var avail = Math.max(0.6, fz0 - doorHalfW);
  var fww = Math.min(1.3, avail*0.5);
  var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
  [-1,1].forEach(function(s){
    var fp = loc(x,z, fx0+0.05, s*flat, ry);
    WINBOX(fp[0], winY, fp[1], 0.4, rr(1.0,1.5), fww, ry, winCol);
    n++;
  });
  /* 1 more on a side wall, at a caller-steered offset along its length */
  var sww = Math.min(1.1, fz0*0.5);
  var margin = sww*0.5 + 0.6;
  var slat = mix(-fx0+margin, fx0-margin, sideFxFrac);
  var sp = loc(x,z, slat, sideSign*(fz0+0.05), ry);
  WINBOX(sp[0], winY, sp[1], sww, rr(1.0,1.5), 0.4, ry, winCol);
  n++;
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* ---- cantonHallWindows ----------------------------------------------------
   Owner: "make sure the recently placed great hall buildings have an
   appropriate number of windows [at least 3 per floor]." platCanton()'s own
   great hall (idx===0 on every discrete-lot canton — Arsenal, Foreign,
   Granary, Market) is a single tall box (structure()'s 'domed' kind, h
   44-60, no intermediate cornice lines) that used to call the same
   addWindows() every ordinary canton building gets — chance()-gated, worst
   case exactly one window (see guildHallWindows3's own note above, which
   fixed the identical problem for the guild canton's halls). A hall this
   tall reads as several real storeys even though structure() draws it as
   one plain box, so "at least 3 per floor" means a guaranteed band
   repeated up the height, not one guaranteed row.

   floors is a window-spacing convenience only (this hall has no real
   cornice lines to key off) — ~13 units/floor, the same spacing
   structure()'s own hlaalu kind uses for its real stacked storeys, so the
   bands read as a plausible storey height. Ground floor keeps clear of the
   door (guildHallWindows3's own sized-to-fit flanking formula, so it
   mathematically cannot fail); floors above it have no door to dodge, so
   they get a fuller spread across the front face plus one on each side —
   a hall this size wants more than the bare minimum, and it stands alone
   on the deck so every approach should read as glazed, not just the front.
   Same box|stone(default) bucket every other window in the city already
   spends via WINBOX — zero new draw calls. w/d/h are FULL extents,
   doorHalfW half the door's actual width — structure()'s own convention,
   matching addWindows()/guildHallWindows3(). */
function cantonHallWindows(x, y, z, ry, w, d, h, col, doorHalfW){
  var fx0 = w*0.5, fz0 = d*0.5;
  var winCol = shade(col, -0.55);
  var floors = Math.max(3, Math.round(h/13));
  var floorH = h/floors;
  var n = 0;
  for(var fl=0; fl<floors; fl++){
    var winY = y + fl*floorH + Math.min(floorH*0.42, rr(2.0,3.2));
    var winH = Math.min(1.5, floorH*0.5);
    if(fl === 0){
      /* 2 flanking the door, sized off the space actually left past
         doorHalfW — same formula guildHallWindows3 uses, so it cannot fail
         to fit — plus a 3rd on a side wall so the ground floor alone
         already clears "at least 3". */
      var avail = Math.max(0.6, fz0 - doorHalfW);
      var fww = Math.min(1.3, avail*0.5);
      var flat = doorHalfW + fww*0.5 + Math.min(0.5, avail*0.15);
      [-1,1].forEach(function(s){
        var fp = loc(x,z, fx0+0.05, s*flat, ry);
        WINBOX(fp[0], winY, fp[1], 0.4, winH, fww, ry, winCol);
        n++;
      });
      var sww0 = Math.min(1.1, fz0*0.5);
      var sp0 = loc(x,z, 0, -(fz0+0.05), ry);
      WINBOX(sp0[0], winY, sp0[1], sww0, winH, 0.4, ry, winCol);
      n++;
    }else{
      /* upper floors: 3 evenly spread across the front face (no door to
         clear) plus one on each side wall, alternating which half per
         floor so the glazing doesn't stack in a single vertical column. */
      var fww2 = Math.min(1.2, fx0*0.25);
      [-1,0,1].forEach(function(t){
        var fp2 = loc(x,z, fx0+0.05, t*fz0*0.55, ry);
        WINBOX(fp2[0], winY, fp2[1], 0.4, winH, fww2, ry, winCol);
        n++;
      });
      var sww = Math.min(1.0, fz0*0.42);
      [-1,1].forEach(function(sgn){
        var sp = loc(x,z, (fl%2?1:-1)*fx0*0.3, sgn*(fz0+0.05), ry);
        WINBOX(sp[0], winY, sp[1], sww, winH, 0.4, ry, winCol);
        n++;
      });
    }
  }
  window._facadeExtraWindows = (window._facadeExtraWindows||0) + n;
  return n;
}

/* a square arena bowl in place of the oval ring: four straight raked
   seating banks, mitred at the corners (each bank spans the ring's own
   OUTER dimension so opposite pairs meet exactly, no gap/no overlap logic
   needed), each successive ring's outer edge picking up exactly where the
   ring below's inner edge left off so the tiers nest with no gap. Combos:
   box|stone(default) for the field/banks, plus whatever structure() itself
   already uses (box/fr8/fr6/cyl/dome/cone × stone/dome/roof) for the rim
   buildings — all pre-existing, structure() is the core building function
   used everywhere else in the build.

   2nd pass, fixing two real bugs the owner caught by eye (not the shape
   itself, which was already square and correct):
   (a) height was tied to the loop index the WRONG way — `yy = y +
       i*stepH*0.55` with i=0 at the OUTER (largest halfW/halfD) ring meant
       the outer ring sat lowest and the inner ring (closest to the field)
       sat highest: a stepped MOUND rising toward the centre, not a bowl.
       Fixed by indexing off (steps-1-i) instead, so the outer rim is now
       the tall one and the innermost ring lands exactly at field height y.
   (b) fieldW/fieldD (1.15hw / 0.86hw) were bigger than the bowl's own
       OUTER half-extents (0.95hw / 0.72hw) — the field floor overflowed
       past the seating and past the platform edge itself. Fixed by sizing
       the field off the innermost ring's actual extent instead of an
       independent (and wrong) constant, and by pulling the bowl's own
       outer extent in from 0.95/0.72 to 0.72/0.56 so there is real,
       verified clearance out to hw for the rim buildings — the old
       0.90hw building row was INSIDE the old 0.95hw outer bowl edge on
       the east/west sides, i.e. clipping straight through the seating,
       which is the other half of what the owner saw. */
function arenaDeckSquare(c, y, hw){
  /* 4th pass, per the owner's follow-up: the 3rd pass's bowl read flat
     (only 2 steps, each just 4.4*0.55=2.4 tall, on a canton hundreds of
     units across — invisible from any normal viewing distance) and its
     outerHalf (0.975hw) sat right on top of hw, the exact radius
     landing()/stairs approach at — the rim was clipping the bridge
     stairs. Fix: pull outerHalf in to leave real clearance for the
     stairs, then re-derive the field from THAT (not the raw platform
     hw) so it still reads as "about 80% of the upper tier" while
     actually fitting inside outerHalf with room for banking; and scale
     the bowl's total rise off hw (steps*stepH) instead of a fixed
     constant, across more steps, so the "inverted pyramid" terracing is
     visible at any canton size. */
  var outerHalf = hw * 0.84;
  var fieldHalf = outerHalf * Math.sqrt(0.8);
  var steps = 4;
  var totalRise = Math.max(16, hw*0.11);
  var stepH = totalRise/steps, bank = (outerHalf - fieldHalf) / steps;
  var halfW = outerHalf, halfD = outerHalf;
  for(var i=0;i<steps;i++){
    var yy = y + (steps-1-i)*stepH;
    var col = shade(c.tone, i%2 ? 0.03 : -0.05);
    var ow = halfW*2, od = halfD*2;
    BOX(c.x, yy, c.z - halfD + bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x, yy, c.z + halfD - bank*0.5, ow, stepH, bank, 0, col);
    BOX(c.x - halfW + bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    BOX(c.x + halfW - bank*0.5, yy, c.z, bank, stepH, od, 0, col);
    halfW -= bank; halfD -= bank;
  }
  inspectClaim(c.x, c.z, outerHalf, outerHalf, 0, 'arena', 'Arena terracing');
  inspectClaim(c.x, c.z, fieldHalf, fieldHalf, 0, 'arenafloor', 'Arena floor');
  BOX(c.x, y-0.4, c.z, fieldHalf*2, 0.5, fieldHalf*2, 0, 0x9a8f74);

  /* pillars: one ring just inside the rim's own outer edge (tracks
     outerHalf now, not hw, so they stay attached to the built bowl
     instead of floating out past it into the stair-clearance margin).
     Combo: cyl|stone(default) — already live everywhere. */
  var pillarFixed = outerHalf*0.99, pillarSpan = outerHalf*0.90, pillarR = hw*0.022;
  var pillarH = totalRise + 15;
  var perSide = 5;
  function alongSide(k){ return ((k+0.5)/perSide - 0.5) * pillarSpan * 2; }
  var pillarPos = { ns:[], ew:[] };
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide;k++) pillarPos.ns.push([c.x + alongSide(k), c.z + sz*pillarFixed, sz]);
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide;k++) pillarPos.ew.push([c.x + sx*pillarFixed, c.z + alongSide(k), sx]);
  });
  pillarPos.ns.concat(pillarPos.ew).forEach(function(p){
    CYL(p[0], y, p[1], pillarR, pillarH, 0, shade(c.tone,-0.12));
    BOX(p[0], y+pillarH, p[1], pillarR*2.6, 1.2, pillarR*2.6, 0, shade(c.tone,-0.22));  /* capital */
  });
  /* a banner hanging in each gap between adjacent pillars on the same
     side, from up near the pillar tops. */
  function hangBanner(ax,az, bx,bz){
    var mx=(ax+bx)/2, mz=(az+bz)/2, dh = pillarH*0.62;
    BOX(mx, y+pillarH*0.88-dh, mz, 0.14, dh, 3.4, Math.atan2(bx-ax,bz-az), vothPatCol('tapestry', pick(BANNERC)), 'tapestry');
  }
  [-1,1].forEach(function(sz){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+alongSide(k), c.z+sz*pillarFixed, c.x+alongSide(k+1), c.z+sz*pillarFixed);
    }
  });
  [-1,1].forEach(function(sx){
    for(var k=0;k<perSide-1;k++){
      hangBanner(c.x+sx*pillarFixed, c.z+alongSide(k), c.x+sx*pillarFixed, c.z+alongSide(k+1));
    }
  });

  /* one ferry pier + matching ground-floor door at the bottom tier, per
     the owner's canton-design notes — same mechanism as monoCanton()'s. */
  var ferryPier = CPIERS.filter(function(p){ return p.canton === c.n; })[0];
  if(ferryPier){
    cantonPiers(c);
    plinthDoor(c.x, c.z, ferryPier.ry, 5.5, squareEdgeHw(c.r*0.97, ferryPier.ry), c.tone);
  }

  /* ---- ARENA GLADIATOR COMBAT SYSTEM, built half ------------------------
     Spectator benches, the barred pit entrance and the VIP box on top of
     it: arenaCombatDeck(), at the foot of this file. Called from HERE
     rather than from a top-level statement so it lands in the arena's own
     local frame with the exact y/outerHalf/fieldHalf/steps/stepH/bank this
     function just derived — re-deriving them at file scope would silently
     drift the moment anyone retunes the bowl again (which has already
     happened four times, see this function's own header). pillarPos/
     pillarR are handed over for the same reason: the bench rings share
     the terrace with the existing colonnade, and the only honest way to
     keep benches out of a pillar is to test against the real pillar list
     instead of re-deriving perSide/pillarSpan from constants that live
     here. Nothing about the bowl itself is modified. */
  arenaCombatDeck(c, y, outerHalf, fieldHalf, steps, stepH, bank, pillarPos, pillarR);
}

