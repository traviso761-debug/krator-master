/* ============================== 18b. THE INNER-CITY PLACEMENT PASS ==============================
   PLANNER-OWNED. Turns 30-layout.js's PLOT SCHEDULE into buildings, then fills every remaining
   cell of the inner grid with Yuni's own fabric.

   Two passes:
     1. THE SCHEDULE. Each PLOT is an arc {r0,r1,a0,a1}. The building sits at the arc's mid
        angle, set back from the inner ring street, facing IN toward the city — which is the
        side the street is on. Three arrangements: one building; a RADIAL BANK (the three
        comb-wall slabs stacked across the belt's depth with courts between them); and a
        FACING PAIR (two comb blocks turned broadside, fronting each other across a lane).
     2. THE FILL. Every cell of the radial grid that no plot has taken gets the largest piece
        of Yuni's own fabric that fits it with a yard to spare, oriented to the highest-priority
        street near it (highway > boulevard > ring > street > alley), which is the door rule.

   Doors: assetFrame's +z is the front, so a building whose front should look along the world
   direction (dx,dz) is built with ry = atan2(dx,dz).                                        */
reseed(680001);

var PLACED = [], PLACE_STATS = { scheduled:0, filled:0, district:0, farm:0, skipped:0, byFamily:{} };
(function(){
  if(SHEET) return;
  var D=Math.PI/180;
  function faceRy(dx,dz){ return Math.atan2(dx,dz); }
  /* ---- oriented-box clearance -------------------------------------------------------
     A circle test is rotation-blind, which is exactly the wrong thing once buildings are
     aligned to the grid: two slabs lying parallel 3 m apart pass a circle test and clash,
     and two lying end to end fail it although they are clear. So the fill asks a proper
     separating-axis question of the real rectangles before it commits. */
  function corners(x,z,ry,w,d,pad){
    var c=Math.cos(ry), s=Math.sin(ry), hw=w/2+pad, hd=d/2+pad, o=[];
    /* the frame's local +x maps to world ( cos ry, -sin ry ), local +z to ( sin ry, cos ry ) */
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){
      o.push([ x + q[0]*hw*c + q[1]*hd*s, z - q[0]*hw*s + q[1]*hd*c ]);
    });
    return o;
  }
  function sat(A,B){                                  /* true when the two boxes OVERLAP */
    var boxes=[A,B];
    for(var b=0;b<2;b++){ var Q=boxes[b];
      for(var e=0;e<2;e++){
        var ax=Q[e+1][0]-Q[e][0], az=Q[e+1][1]-Q[e][1], L=Math.hypot(ax,az)||1, nx=-az/L, nz=ax/L;
        var a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
        for(var i=0;i<4;i++){ var pa=A[i][0]*nx+A[i][1]*nz, pb=B[i][0]*nx+B[i][1]*nz;
          if(pa<a0)a0=pa; if(pa>a1)a1=pa; if(pb<b0)b0=pb; if(pb>b1)b1=pb; }
        if(a1 < b0 || b1 < a0) return false;          /* a separating axis: no overlap */
      }
    }
    return true;
  }
  function obbClear(x,z,ry,w,d,pad){
    var box=corners(x,z,ry,w,d,pad==null?2:pad), rad=Math.hypot(w,d)/2+8;
    for(var i=0;i<PLACED.length;i++){ var b=PLACED[i]; if(b.w==null) continue;
      if(Math.hypot(b.x-x, b.z-z) > rad + Math.hypot(b.w,b.d)/2) continue;   /* cheap reject */
      if(sat(box, corners(b.x,b.z,b.ry,b.w,b.d, 0))) return false;
    }
    return true;
  }
  /* ---- THE ALIGNMENT RULE -----------------------------------------------------------
     Yuni's inner city is a RADIAL grid, so there are only ever four right answers for a
     building's yaw at a given point: face the hub, face the wall, or face along the ring
     in either direction. The door rule picks which of the four by how well it agrees with
     the street the door should look at; the clearance test then decides whether that yaw
     actually fits. If the best-agreeing axis clashes, the next-best is tried, and only
     when all four clash is the building refused — so the grain of the quarter is set by
     the grid, not by whatever angle a street happened to be at.                        */
  var ALIGN = { snapped:0, fellBack:0, nudged:0, refused:0, offGrid:0, street:0, tree:0, freeYaw:0 }, ERR_SOFT = [];
  /* what a building is allowed to reach into the carriageway. Not zero: the ground texture's
     street edge is soft and a doorstep wants to meet it, so half a metre of overlap reads as
     a threshold rather than a house in the road. Anything past that is a building in the road. */
  var ST_TOL = 0.5;
  function obbClearExcept(x,z,ry,w,d,pad,skip){ return true; }
  /* ---- THE BOX TESTS ----------------------------------------------------------------
     Both of these used to be point tests, and a point test cannot see the thing that was
     actually wrong with the town: the packer asked `onStreet(x,z,small)` about a building's
     CENTRE and then set down a 30 m box whose corners lay well out in the carriageway. 399
     buildings had a corner over a street edge, forty of them by more than two and a half
     metres — a market hall stood six metres into its own boulevard. The same blindness let
     avenue cypresses end up inside the merchant palaces on the processional way, because
     trees were only ever tested against a radius round the centre, and only by the outer
     district pass at that. So the real rectangle is now asked both questions.

     Both are backed by a UNIFORM GRID built once. The street test used to walk all 1,309
     edges per call and the tree test all ten thousand tree sites, which is why the fill was
     minutes of wall clock; bucketed, each call looks at a handful.                      */
  var SCELL=64, SGRID={};
  (function(){
    ST.edges.forEach(function(e){
      var A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2+2;
      var i0=Math.floor((Math.min(A.x,B.x)-pad)/SCELL), i1=Math.floor((Math.max(A.x,B.x)+pad)/SCELL);
      var j0=Math.floor((Math.min(A.z,B.z)-pad)/SCELL), j1=Math.floor((Math.max(A.z,B.z)+pad)/SCELL);
      for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k=i+','+j; (SGRID[k]=SGRID[k]||[]).push(e); }
    });
  })();
  /* how far the oriented box reaches past the edge of the nearest carriageway, in metres.
     The box is sampled at its corners and the midpoint of each side, which is enough for
     a street narrower than the building; a street that runs clean through a box is caught
     by the midpoints. */
  function boxStreetPen(x,z,ry,w,d){
    var c=Math.cos(ry), s=Math.sin(ry), hw=w/2, hd=d/2, P=[], Q=[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[1,0],[0,1],[-1,0],[0,0]];
    for(var q=0;q<Q.length;q++) P.push([ x + Q[q][0]*hw*c + Q[q][1]*hd*s, z - Q[q][0]*hw*s + Q[q][1]*hd*c ]);
    var rad=Math.hypot(w,d)/2, seen={}, worst=0;
    var i0=Math.floor((x-rad-8)/SCELL), i1=Math.floor((x+rad+8)/SCELL), j0=Math.floor((z-rad-8)/SCELL), j1=Math.floor((z+rad+8)/SCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
      var cell=SGRID[i+','+j]; if(!cell) continue;
      for(var n=0;n<cell.length;n++){ var e=cell[n]; if(seen[e.id]) continue; seen[e.id]=1;
        var A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2;
        for(var p=0;p<P.length;p++){ var pen = pad - segDist(P[p][0],P[p][1], A.x,A.z, B.x,B.z); if(pen > worst) worst=pen; }
      }
    }
    return worst;
  }
  /* the tree sites, bucketed the same way. treeClear keeps its old signature (a radius about
     a point) and treeClearBox asks it of the real rectangle. */
  var TCELL=24, TGRID={};
  (function(){
    for(var i=0;i<TREE_SITES.length;i++){ var t=TREE_SITES[i], r=(t[2]||2);
      var i0=Math.floor((t[0]-r)/TCELL), i1=Math.floor((t[0]+r)/TCELL), j0=Math.floor((t[1]-r)/TCELL), j1=Math.floor((t[1]+r)/TCELL);
      for(var a=i0;a<=i1;a++) for(var b=j0;b<=j1;b++){ var k=a+','+b; (TGRID[k]=TGRID[k]||[]).push(t); }
    }
  })();
  /* gridRy returns the yaw, and may NUDGE the position: if all four axes clash where the
     packer wanted the building, it tries the same four a few metres up and down the frontage
     and in and out of it before giving up. Six hundred houses were being thrown away for
     want of two metres, which is most of what made the slums look thin. */
  /* THE SLUMS ARE NOT ON THE GRID. In the Thatch the four radial axes are a fiction — the
     lanes wander, the compounds are thrown down against whatever track passes, and holding
     mud houses to the same four yaws as the Emir's palace is what refused seven hundred of
     them and left the quarter looking like open ground with huts sprinkled on it. Where the
     district's own chaos is high the packer may fall back to a FREE yaw: face the nearest
     street, give or take a few degrees of wander. The building is tagged free so the
     alignment invariant can count it apart rather than being quietly loosened. */
  function freeRy(x, z, fx, fz, w, d, out){
    var ar=Math.atan2(z,x), cr=Math.cos(ar), sr=Math.sin(ar), tx=-sr, tz=cr;
    var base=faceRy(fx,fz), NUDGE=[[0,0],[0,2.5],[0,-2.5],[3,0],[-3,0],[0,5],[0,-5],[5,3],[-5,-3]];
    for(var g=0; g<NUDGE.length; g++){
      var nx = x + tx*NUDGE[g][0] + cr*NUDGE[g][1], nz = z + tz*NUDGE[g][0] + sr*NUDGE[g][1];
      for(var k=0;k<5;k++){
        var ry = base + (phash(Math.round(nx), k, Math.round(nz), 29) - 0.5)*0.9 + (k?k*0.7:0);
        if(!obbClear(nx, nz, ry, w, d, 1.6)) continue;
        if(boxStreetPen(nx, nz, ry, w, d) > ST_TOL) continue;
        if(!treeClearBox(nx, nz, ry, w, d, 0.3)) continue;
        if(out){ out.x=nx; out.z=nz; out.free=true; }
        ALIGN.freeYaw++;
        return ry;
      }
    }
    return null;
  }
  function gridRy(x, z, fx, fz, w, d, out){
    var ar = Math.atan2(z, x), cr = Math.cos(ar), sr = Math.sin(ar);
    var axes = [ [-cr,-sr], [cr,sr], [-sr,cr], [sr,-cr] ];        /* in, out, ring +, ring - */
    axes.sort(function(p,q){ return (q[0]*fx+q[1]*fz) - (p[0]*fx+p[1]*fz); });
    var NUDGE = [[0,0],[0,2.5],[0,-2.5],[2.5,0],[-2.5,0],[0,5],[0,-5],[4,2.5],[-4,-2.5],[0,8],[0,-8]];
    for(var g=0; g<NUDGE.length; g++){
      /* the nudge is along the frontage (tangential) and across it (radial), not in world x/z */
      var tx=-sr, tz=cr, nx = x + tx*NUDGE[g][0] + cr*NUDGE[g][1], nz = z + tz*NUDGE[g][0] + sr*NUDGE[g][1];
      for(var i=0;i<axes.length;i++){
        var ry = faceRy(axes[i][0], axes[i][1]);
        if(!obbClear(nx, nz, ry, w, d, 2)) continue;
        /* clear of its neighbours is not enough: the box must also stay out of the road and
           off the standing trees. Both are asked here rather than after the fact, so the
           nudge table gets a chance to find the metre that fixes it instead of the building
           being thrown away — which is what a post-hoc refusal would do to the density. */
        if(boxStreetPen(nx, nz, ry, w, d) > ST_TOL){ ALIGN.street++; continue; }
        if(!treeClearBox(nx, nz, ry, w, d, 0.4)){ ALIGN.tree++; continue; }
        if(g===0 && i===0) ALIGN.snapped++; else if(g===0) ALIGN.fellBack++; else ALIGN.nudged++;
        if(out){ out.x=nx; out.z=nz; }
        return ry;
      }
    }
    ALIGN.refused++;
    return null;
  }
  function put(key, x, z, ry, variant, seed, name){
    var A=ASSET_BY_KEY[key]; if(!A) return null;
    if(inButte(x,z,terrainH(x,z)+2,6)) { PLACE_STATS.skipped++; return null; }
    var rec = buildAsset(key, x, z, ry, { variant:variant||0, seed:seed, wealth:0.9 });
    if(rec){ rec.w=A.w; rec.d=A.d; rec.ry=ry; rec.rad=Math.min(A.w,A.d)/2; rec.crad=(A.w+A.d)/4; }
    if(rec){ rec.plotName = name||''; PLACED.push(rec);
      PLACE_STATS.byFamily[A.family] = (PLACE_STATS.byFamily[A.family]||0) + 1; }
    return rec;
  }

  /* ---------------- 1. THE SCHEDULE ----------------
     A scheduled building keeps its arc and its facing — that is the whole point of a schedule —
     but it may slide a few metres in or out along its own radius to get its box out of the ring
     street, which several of them (the Chapter house worst) were standing in. The search keeps
     the first radius that clears; if none does, the plot is built where the schedule put it,
     because a missing landmark is a far worse fault than a wide doorstep. */
  function radialSetback(key, rc, ca, sa, ry){
    var A=ASSET_BY_KEY[key]; if(!A) return rc;
    if(boxStreetPen(rc*ca, rc*sa, ry, A.w, A.d) <= ST_TOL) return rc;
    for(var k=1;k<=14;k++) for(var sgn=1;sgn>=-1;sgn-=2){
      var r2 = rc + sgn*k*1.2;
      if(boxStreetPen(r2*ca, r2*sa, ry, A.w, A.d) <= ST_TOL && obbClear(r2*ca, r2*sa, ry, A.w, A.d, 1)) return r2;
    }
    /* still in the road: take the radius that is LEAST in it, which for the four deep civic
       works hemmed into their bands is a doorstep on the ring rather than a wall across it */
    var bestR=rc, bestP=boxStreetPen(rc*ca, rc*sa, ry, A.w, A.d);
    for(var k2=1;k2<=14;k2++) for(var sg2=1;sg2>=-1;sg2-=2){
      var r3 = rc + sg2*k2*1.2, pen = boxStreetPen(r3*ca, r3*sa, ry, A.w, A.d);
      if(pen < bestP - 0.05 && obbClear(r3*ca, r3*sa, ry, A.w, A.d, 1)){ bestP=pen; bestR=r3; }
    }
    return bestR;
  }
  PLOTS.forEach(function(P, pi){
    var A=ASSET_BY_KEY[P.key]; if(!A){ ERR('plot '+P.name+': no asset '+P.key); return; }
    var am = (P.a0+P.a1)/2 * D, ca=Math.cos(am), sa=Math.sin(am);
    var SETBACK = 9;                                        /* off the inner ring street */
    if(P.arrange==='radialBank'){
      /* three slabs across the belt's depth, courts between, every one fronting the city */
      var usable = (P.r1-P.r0) - 12, per = A.d, court = (usable - P.count*per) / (P.count-1);
      for(var k=0;k<P.count;k++){
        var rc = radialSetback(P.key, P.r0 + 6 + per/2 + k*(per+court), ca, sa, faceRy(-ca,-sa));
        var x=rc*ca, z=rc*sa;
        put(P.key, x, z, faceRy(-ca,-sa), P.variant, 680+pi*7+k, P.name+' '+(k+1));
      }
    } else if(P.arrange==='facingPair'){
      /* turned broadside: the declared w runs RADIALLY, the declared d tangentially, and the
         two front on each other across a 12 m lane */
      var rc2 = (P.r0+P.r1)/2, off = A.d/2 + 6;
      for(var s=-1;s<=1;s+=2){
        var aa = am + s*off/rc2, x2=Math.cos(aa)*rc2, z2=Math.sin(aa)*rc2;
        /* the tangential direction at aa, pointing back toward the lane */
        var tx = -Math.sin(aa)*(-s), tz = Math.cos(aa)*(-s);
        put(P.key, x2, z2, faceRy(tx,tz), P.variant, 690+pi*7+(s>0?1:0), P.name+(s<0?' (west)':' (east)'));
      }
    } else {
      var rc3 = P.r0 + SETBACK + A.d/2;
      if(rc3 + A.d/2 > P.r1 - 4) rc3 = (P.r0+P.r1)/2;        /* a deep building centres in its band */
      rc3 = radialSetback(P.key, rc3, ca, sa, faceRy(-ca,-sa));
      var x3=rc3*ca, z3=rc3*sa;
      put(P.key, x3, z3, faceRy(-ca,-sa), P.variant, 700+pi*13, P.name);
    }
    PLACE_STATS.scheduled++;
    REGISTER({ name:P.name, kind:'plot', label:P.tag+' plot · '+P.key+' · '+Math.round(P.r0)+'-'+Math.round(P.r1)+' m, '+(P.a1-P.a0).toFixed(1)+' deg',
               x:Math.cos(am)*(P.r0+P.r1)/2, y:terrainH(Math.cos(am)*(P.r0+P.r1)/2, Math.sin(am)*(P.r0+P.r1)/2)-1,
               z:Math.sin(am)*(P.r0+P.r1)/2, r:Math.max(A.w,A.d)*0.6, h:(A.h||20)+4 });
  });

  /* ---------------- 1b. THE RESERVED YARDS ------------------------------------------
     The caravanserai, the market circle and the Vault's goods depot are set down BEFORE the
     district fill, not after it. They were after it, and the fill had already packed houses
     into the caravanserai's yard by the time it was asked for, so the clearance test refused
     it and the building simply never appeared. Reserved ground has to be claimed first. */
  (function(){
    if(ASSET_BY_KEY.trade_caravanserai){
      var C=CARAVANSERAI, CA=ASSET_BY_KEY.trade_caravanserai;
      /* the yard is reserved, but houses have already been packed along the ring beside it,
         so anything standing in its footprint is pulled out before it is set down */
      for(var ci=PLACED.length-1; ci>=0; ci--){ var b=PLACED[ci];
        if(Math.hypot(b.x-C.x, b.z-C.z) < 90 && !obbClearExcept(C.x,C.z,C.ry,CA.w,CA.d,4,b)) continue; }
      if(boxStreetPen(C.x, C.z, C.ry, CA.w, CA.d) > ST_TOL) ERR_SOFT.push('caravanserai yard meets a street');
      if(obbClear(C.x, C.z, C.ry, CA.w, CA.d, 1) && put('trade_caravanserai', C.x, C.z, C.ry, 0, 9911, 'Caravanserai')) PLACE_STATS.district++;
      else ERR_SOFT.push('caravanserai yard blocked');
    }
    if(!ASSET_BY_KEY.trade_market_hall || !ASSET_BY_KEY.prop_market_stall) return;
    /* four market halls on the circle's cross axes, then stalls in concentric rows */
    for(var h=0;h<4;h++){
      /* Four halls round the circle. They used to sit on the fixed cross axes, where two of
         them stood six metres into the boulevard that clips the circle — and once the box
         test refused that, those two simply vanished from the market. So each hall now starts
         on its axis and HUNTS: round the circle a few degrees at a time, and in toward the
         middle, until it finds ground that is off the road and clear. */
      var MH=ASSET_BY_KEY.trade_market_hall, okH=false, rx=0, rz=0, ryH=0;
      for(var turn=0; turn<12 && !okH; turn++){
        var a = h/4*TAU + Math.PI/4 + (turn%2?1:-1)*Math.ceil(turn/2)*7*D;
        ryH = faceRy(-Math.cos(a),-Math.sin(a));
        for(var back=0; back<=24; back+=3){
          rx=MARKET.x+Math.cos(a)*(MARKET.r-16-back); rz=MARKET.z+Math.sin(a)*(MARKET.r-16-back);
          if(boxStreetPen(rx, rz, ryH, MH.w, MH.d) <= ST_TOL && obbClear(rx, rz, ryH, MH.w, MH.d, 2)){ okH=true; break; }
        }
      }
      if(okH && put('trade_market_hall', rx, rz, ryH, h%2, 9920+h, 'Market hall '+(h+1))) PLACE_STATS.district++;
      else if(!okH) ERR_SOFT.push('market hall '+(h+1)+' found no ground');
    }
    for(var ring=0; ring<4; ring++){
      var rr2 = 16 + ring*13, n = Math.max(6, Math.round(TAU*rr2/7.5));
      for(var q2=0;q2<n;q2++){
        var a2 = q2/n*TAU + ring*0.21, sx=MARKET.x+Math.cos(a2)*rr2, sz=MARKET.z+Math.sin(a2)*rr2;
        var key = (q2%3===0 && ASSET_BY_KEY.prop_market_tent) ? 'prop_market_tent' : 'prop_market_stall';
        var SA=ASSET_BY_KEY[key], ryS=faceRy(-Math.cos(a2),-Math.sin(a2));
        if(boxStreetPen(sx, sz, ryS, SA.w, SA.d) > ST_TOL) continue;
        if(!obbClear(sx, sz, ryS, SA.w, SA.d, 1.2)) continue;
        if(put(key, sx, sz, ryS, q2%2, 9940+ring*97+q2, '')) PLACE_STATS.district++;
      }
    }
  })();

  /* THE VAULT DEPOT: where the carts unload for the Order. Halls and sheds on the east
     flank of the processional way, just inside the wall, scanned into whatever ground the
     Ancient belt and the Order's precinct have left free. */
  (function(){
    var WANT=['trade_market_hall','trade_market_hall','trade_craft_shed','trade_craft_shed','trade_craft_shed'], n=0;
    for(var wi=0; wi<WANT.length; wi++){
      var A2=ASSET_BY_KEY[WANT[wi]]; if(!A2) continue;
      var done=false;
      var RS=[152, 140, 168, 108, 96, 200, 214, 252];
      for(var rr=0; rr<RS.length && !done; rr++){
        var R = RS[rr];
        for(var dg=2; dg<=82 && !done; dg+=1.0){
          var a=dg*D, x=Math.cos(a)*R, z=Math.sin(a)*R, ry=faceRy(-Math.cos(a),-Math.sin(a));
          if(inPlot(x,z,4))continue;
          if(boxStreetPen(x,z,ry,A2.w,A2.d) > ST_TOL)continue;
          if(!treeClearBox(x,z,ry,A2.w,A2.d,0.4))continue;
          if(!obbClear(x,z,ry,A2.w,A2.d,2))continue;
          if(put(WANT[wi], x, z, ry, wi%A2.variants, 9970+wi, 'Vault depot '+(++n))){ PLACE_STATS.district++; done=true; }
        }
      }
    }
  })();

  /* ---------------- 2. THE FILL ---------------- */
  /* Yuni's own fabric inside the wall: wealthy compounds, merchants' town palaces, painted
     terraces, tower houses, with a bathhouse or a spire where a cell is generous. Ordered
     LARGEST FIRST so a big cell takes a big building. */
  var FABRIC = [
    { key:'civic_hall_records',    wt:0.5 },
    { key:'civic_bathhouse',       wt:1.0 },
    { key:'rich_terrace_apartments',wt:3.0 },
    { key:'rich_family_compound',  wt:3.4 },
    { key:'rich_merchant_palace',  wt:2.6 },
    { key:'civic_sankore_spire',   wt:0.7 },
    { key:'rich_tower_house',      wt:1.6 },
    { key:'civic_bell_tower',      wt:0.4 }
  ].filter(function(f){ return !!ASSET_BY_KEY[f.key]; })
   .map(function(f){ var A=ASSET_BY_KEY[f.key]; f.w=A.w; f.d=A.d; f.v=A.variants; return f; })
   .sort(function(a,b){ return (b.w*b.d)-(a.w*a.d); });

  /* A dense pre-modern city is not one building per block — it is a ROW of buildings packed
     shoulder to shoulder along a street frontage, with the block's back-to-back pair of rows
     sharing a party line down the middle. So each ring band is filled as two rows, one
     fronting the inner ring street and one the outer, packed tangentially by width. */
  var LANE = 6;                                             /* street half-width plus verge */
  function packRow(rFront, allow, inward, tag){
    var rc0 = inward ? rFront : rFront;                     /* front radius; centre depends on depth */
    var a = phash(Math.round(rFront), 2, 1, 3) * 20;        /* stagger each row's start */
    var guard=0;
    var aEnd = a + 360;
    while(a < aEnd && guard++ < 1200){
      var deg = a, am2 = deg*D;
      var fit = FABRIC.filter(function(f){ return f.d <= allow; });
      if(!fit.length) return;
      var hh = phash(Math.round(rFront*Math.cos(am2)), 3, Math.round(rFront*Math.sin(am2)), 11);
      var sum=0; fit.forEach(function(f){ sum += f.wt; });
      var t=hh*sum, chosen=null;
      for(var q=0;q<fit.length;q++){ t -= fit[q].wt; if(t<=0){ chosen=fit[q]; break; } }
      if(!chosen) chosen=fit[fit.length-1];
      var rc = inward ? (rFront + chosen.d/2) : (rFront - chosen.d/2);
      var need = (chosen.w + 3) / (rc*D);
      var amid = (deg + need/2)*D, ca2=Math.cos(amid), sa2=Math.sin(amid);
      var x=rc*ca2, z=rc*sa2;
      var ok = true;
      if(inPlot(x, z, 3)) ok=false;
      else if(Math.hypot(x,z) < CENTER_PLAZA.r+12) ok=false;
      else if(Math.hypot(x-FORECOURT.x, z-FORECOURT.z) < FORECOURT.r+14) ok=false;
      else if(inButte(x,z,terrainH(x,z)+2,10)) ok=false;
      else if(onStreet(x,z,Math.min(chosen.w,chosen.d)*0.42)) ok=false;
      if(ok){
        /* the door looks at the best street within 55 m; failing that, at its own frontage */
        var fx = inward ? -ca2 : ca2, fz = inward ? -sa2 : sa2;
        var ns = nearestStreet(x,z,55);
        if(ns && ns.px!=null){ var dx=ns.px-x, dz=ns.pz-z, L=Math.hypot(dx,dz)||1; if(L>2){ fx=dx/L; fz=dz/L; } }
        var NP = { x:x, z:z }, ry = gridRy(x, z, fx, fz, chosen.w, chosen.d, NP);
        if(ry===null) ok=false;
        else {
          var vr = Math.floor(phash(Math.round(z), 7, Math.round(x), 5) * chosen.v) % Math.max(1,chosen.v);
          if(put(chosen.key, NP.x, NP.z, ry, vr, 7000 + Math.round(rFront)*13 + Math.round(deg*4), '')) PLACE_STATS.filled++;
          a += need;
        }
      }
      if(!ok) a += 3.0 / (rc*D);                            /* step on 3 m and try again */
    }
  }
  /* THE DEEP COURTS. Three of Yuni's largest works are deeper than HALF a ring band — the
     family compound at 26 m, the painted terrace apartments at 22, the Hall of Records at
     40 — and `packRow` filters on `f.d <= allow`, where allow is half the band. So all
     three were dropped by every row of every band and had never once been built anywhere
     in the city, silently, despite carrying the two heaviest weights in the list.
     A band is therefore swept for them FIRST: they take the band's WHOLE depth, centred on
     its mid-radius, spaced out because they are landmarks and not fabric. The two rows then
     pack round whatever stands, because obbClear sees it like anything else. */
  function packDeep(r0, r1, usable){
    var rc=(r0+r1)/2, half=usable/2 - 2;
    var deep = FABRIC.filter(function(f){ return f.d > half && f.d <= usable - 1; });
    if(!deep.length) return;
    var a = phash(Math.round(r0), 9, 4, 7)*40, guard=0, aEnd=a+360;
    while(a < aEnd && guard++ < 500){
      var deg=a, am=deg*D, ca=Math.cos(am), sa=Math.sin(am);
      var hh = phash(Math.round(rc*ca), 8, Math.round(rc*sa), 19), sum=0;
      deep.forEach(function(f){ sum += f.wt; });
      var t=hh*sum, chosen=null;
      for(var q=0;q<deep.length;q++){ t -= deep[q].wt; if(t<=0){ chosen=deep[q]; break; } }
      if(!chosen) chosen=deep[0];
      var need=(chosen.w + 3)/(rc*D), amid=(deg+need/2)*D, c2=Math.cos(amid), s2=Math.sin(amid);
      var x=rc*c2, z=rc*s2, ok=true;
      if(inPlot(x,z,3)) ok=false;
      else if(Math.hypot(x,z) < CENTER_PLAZA.r+12) ok=false;
      else if(Math.hypot(x-FORECOURT.x, z-FORECOURT.z) < FORECOURT.r+14) ok=false;
      else if(inButte(x,z,terrainH(x,z)+2,10)) ok=false;
      else if(onStreet(x,z,Math.min(chosen.w,chosen.d)*0.42)) ok=false;
      if(ok){
        var fx=-c2, fz=-s2, ns=nearestStreet(x,z,60);
        if(ns && ns.px!=null){ var dx=ns.px-x, dz=ns.pz-z, L=Math.hypot(dx,dz)||1; if(L>2){ fx=dx/L; fz=dz/L; } }
        var NP={ x:x, z:z }, ry=gridRy(x, z, fx, fz, chosen.w, chosen.d, NP);
        if(ry===null) ok=false;
        else {
          var vr = Math.floor(phash(Math.round(z), 4, Math.round(x), 9) * chosen.v) % Math.max(1,chosen.v);
          if(put(chosen.key, NP.x, NP.z, ry, vr, 7600 + Math.round(r0)*7 + Math.round(deg*3), '')) PLACE_STATS.filled++;
          /* a generous gap after one: the rows fill it with ordinary fabric */
          a += need + 46/(rc*D);
        }
      }
      if(!ok) a += 5.0/(rc*D);
    }
  }
  for(var i=0;i<IN_RINGS.length-1;i++){
    var r0=IN_RINGS[i], r1=IN_RINGS[i+1], usable=(r1-r0)-2*LANE;
    if(usable < 13) continue;
    if(usable >= 34){                                       /* deep enough for two rows back to back */
      packDeep(r0, r1, usable);
      packRow(r0+LANE, usable/2 - 2, true,  'in');
      packRow(r1-LANE, usable/2 - 2, false, 'out');
    } else {
      packRow(r0+LANE, usable, true, 'in');
    }
  }
  /* ---------------- 3. THE OUTER DISTRICTS -------------------------------------------
     The brief's clock: 6:30-10 prosperous, 10-12 market, 12-6 progressively poorer. This
     pass builds the WESTERN half only — clock 6 round through 9 to 12, which is angles 90
     to 270 — so the prosperous quarter and the market district stand and the poor side is
     still an empty grid for the next pass.

     The outer lattice is polar like the inner one, so the same grid rule applies: every
     house faces the hub, the wall or along its ring, whichever agrees best with the street
     nearest its door. Density and the mix of trades come from districtAt()'s wealth, and
     the painted mask does the rest of the work — it already reserves the streets, the
     parks, the market circle, the caravanserai yard, the river and the farm belt, so a
     single maskFree() call keeps the houses out of all of them. */
  var OUT_RINGS = [398,425,452,479,506,533,560,587,614,641,668,695,722];
  /* The family mix on the poor side is not fixed: it RAMPS with the district's own wealth,
     so the quarter that meets the market at 12 o'clock is mostly middle-class houses and
     the share of mud and thatch only takes over as the clock comes round toward 6. That
     ramp is what smooths the seam; without it the market ended and the slums began on a
     single street. */
  function famWeights(dk, wealth){
    if(dk==='prosper') return { mid:5.0, trade:2.4, rich:1.1, civic:0.45 };
    if(dk==='market')  return { trade:4.0, mid:3.4, civic:0.5, prop:0.8 };
    var up = smooth(0.10, 0.40, wealth);                 /* 0 at the Thatch, 1 up by the market */
    return { mid: 6.2*up, poor: 5.0*(1 - 0.78*up), trade: 1.2 + 1.4*up,
             prop: 1.0*(1-0.6*up), civic: 0.25 + 0.3*up };
  }
  function districtFabric(dk, wealth, maxW, maxD){
    var wt=famWeights(dk, wealth), out=[];
    ASSETS.forEach(function(A){
      if(!A.districts || A.districts.indexOf(dk) < 0) return;
      if(!wt[A.family] || wt[A.family] < 0.02) return;
      if(A.w > maxW || A.d > maxD) return;
      if(A.wealth && (wealth < A.wealth[0]-0.05 || wealth > A.wealth[1]+0.05)) return;
      out.push({ key:A.key, w:A.w, d:A.d, v:A.variants, wt:wt[A.family] });
    });
    return out;
  }
  function treeClear(x,z,rad){
    var i0=Math.floor((x-rad)/TCELL), i1=Math.floor((x+rad)/TCELL), j0=Math.floor((z-rad)/TCELL), j1=Math.floor((z+rad)/TCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
      var cell=TGRID[i+','+j]; if(!cell) continue;
      for(var n=0;n<cell.length;n++){ var t=cell[n];
        if(Math.hypot(t[0]-x, t[1]-z) < (t[2]||2) + rad) return false; }
    }
    return true;
  }
  /* a tree is inside the building when its trunk circle overlaps the real rectangle: the
     point is pulled into the box's own frame and clamped, which is the exact test and costs
     the same as the sloppy radius one now that the sites are bucketed. */
  function treeClearBox(x,z,ry,w,d,pad){
    var c=Math.cos(ry), s=Math.sin(ry), hw=w/2+(pad||0), hd=d/2+(pad||0), rad=Math.hypot(hw,hd)+6;
    var i0=Math.floor((x-rad)/TCELL), i1=Math.floor((x+rad)/TCELL), j0=Math.floor((z-rad)/TCELL), j1=Math.floor((z+rad)/TCELL), seen={};
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){
      var cell=TGRID[i+','+j]; if(!cell) continue;
      for(var n=0;n<cell.length;n++){ var t=cell[n], key=t[0]+':'+t[1]; if(seen[key]) continue; seen[key]=1;
        var dx=t[0]-x, dz=t[1]-z, lx=dx*c - dz*s, lz=dx*s + dz*c;   /* inverse of loc() */
        var qx=Math.abs(lx)-hw, qz=Math.abs(lz)-hd;
        var dd=Math.hypot(Math.max(qx,0), Math.max(qz,0)) + Math.min(Math.max(qx,qz),0);
        if(dd < (t[2]||2)) return false;
      }
    }
    return true;
  }
  /* the whole ring now: clock 6 round through 9 to 12 is the prosperous quarter and the
     market, and 12 round through 3 back to 6 is the poorer half, thinning to mud and
     thatch as it approaches the butte. districtAt() carries the gradient; this pass just
     walks the rings. */
  var OUT_A0 = 90, OUT_A1 = 450;
  var LANE_O = 5;
  for(var oi=0; oi<OUT_RINGS.length-1; oi++){
    var or0=OUT_RINGS[oi], or1=OUT_RINGS[oi+1], allowD=(or1-or0)-2*LANE_O;
    if(allowD < 9) continue;
    var rFrontO = or0 + LANE_O, aO = OUT_A0 + phash(or0, 5, 2, 9)*6, guardO=0;
    while(aO < OUT_A1 && guardO++ < 4000){
      var degO=aO, amO=degO*D, cO=Math.cos(amO), sO=Math.sin(amO);
      var probeR = rFrontO + 7, px=probeR*cO, pz=probeR*sO;
      var Dt = districtAt(px,pz);
      if(Dt.key==='core' || probeR > districtEdgeR(clockOf(px,pz))){ aO += 6.0/(probeR*D); continue; }
      /* the slums crowd: the poorer the ground, the tighter the houses stand */
      var crowd = 1 - 0.45*(1 - Dt.wealth);
      var fit = districtFabric(Dt.key, Dt.wealth, 40, allowD);
      if(!fit.length){ aO += 6.0/(probeR*D); continue; }
      var hhO = phash(Math.round(px), 4, Math.round(pz), 13), sumO=0;
      fit.forEach(function(f){ sumO += f.wt; });
      var tO=hhO*sumO, pick=null;
      for(var qO=0;qO<fit.length;qO++){ tO -= fit[qO].wt; if(tO<=0){ pick=fit[qO]; break; } }
      if(!pick) pick=fit[0];
      var rcO = rFrontO + pick.d/2, needO = (pick.w*crowd + 2.2 + Dt.chaos*3.5) / (rcO*D);
      var amid2 = (degO + needO/2)*D, c2=Math.cos(amid2), s2=Math.sin(amid2);
      /* the slums wander; the prosperous quarter does not */
      var jit = Dt.chaos * 5.0, xO = rcO*c2 + (phash(Math.round(rcO),1,Math.round(degO*8),3)-0.5)*jit,
          zO = rcO*s2 + (phash(Math.round(rcO),2,Math.round(degO*8),7)-0.5)*jit;
      var okO = true, rr0 = Math.min(pick.w,pick.d)*0.5;
      if(!maskFree(xO, zO, rr0*0.75)) okO=false;
      else if(!treeClear(xO, zO, rr0*0.7)) okO=false;
      else if(onStreet(xO, zO, rr0*0.5)) okO=false;
      else if(inButte(xO, zO, terrainH(xO,zO)+2, 8)) okO=false;
      /* NOTHING UNSERVED. A house with no street within 55 m is refused outright rather
         than left stranded on open ground, which is what the far side of the Thatch was. */
      var nsO = okO ? nearestStreet(xO, zO, 55) : null;
      if(okO && !nsO) okO=false;
      if(okO){
        var fx2=-c2, fz2=-s2;
        if(nsO && nsO.px!=null){ var dx2=nsO.px-xO, dz2=nsO.pz-zO, L2=Math.hypot(dx2,dz2)||1; if(L2>1.5){ fx2=dx2/L2; fz2=dz2/L2; } }
        var NPO = { x:xO, z:zO }, ryO = gridRy(xO, zO, fx2, fz2, pick.w, pick.d, NPO);
        if(ryO===null && Dt.chaos > 0.30){ NPO={ x:xO, z:zO }; ryO = freeRy(xO, zO, fx2, fz2, pick.w, pick.d, NPO); }
        /* a nudged house must still stand on free ground and off the street */
        if(ryO!==null && (!maskFree(NPO.x, NPO.z, rr0*0.7) || onStreet(NPO.x, NPO.z, rr0*0.5))) ryO=null;
        if(ryO===null) okO=false;
        else {
          var vrO = Math.floor(phash(Math.round(zO), 9, Math.round(xO), 11) * pick.v) % Math.max(1,pick.v);
          var recO = put(pick.key, NPO.x, NPO.z, ryO, vrO, 9000 + oi*211 + Math.round(degO*6), '');
          if(recO){ if(NPO.free) recO.free=true; PLACE_STATS.district++; }
          aO += needO;
        }
      }
      if(!okO) aO += 4.0/(rcO*D);
    }
  }

  /* ---------------- 3b. THE PARKS -----------------------------------------------------
     The six Güell pieces had no way into the city at all. They are family 'park', and
     famWeights() has no 'park' key, so districtFabric() dropped every one of them before
     it looked at anything else; and the packer can't reach them either, because the park
     ground is mask code 3 and every fabric pass tests maskFree() first. So the bench
     terrace, the hypostyle hall, the lizard stair, the lodges, the viaduct and the fountain
     were built into the kit and then never once stood anywhere in Yuni.

     The parks therefore get their own pass, which is the only pass in this fragment that
     deliberately ignores the mask: inside a park polygon the reserved ground is exactly
     where these belong. Clearance is still real — obbClear against everything standing,
     treeClear against the avenue and park planting from fragment 60, and onStreet so a
     path is never built over. Each park's signature piece takes the middle (which 60-flora
     leaves unplanted for it), and the lodges, the fountain and the viaduct ring it.     */
  (function(){
    var SIG = { 'Serpent Park':'park_serpentine_bench',
                'Park of the Hundred Columns':'park_hypostyle',
                'Lizard Stair Garden':'park_lizard_stair' };
    var nPark = 0;
    /* a park piece is picturesque, not fabric: it faces the middle of its own park (or, in
       the middle, the city hub), and it is NOT snapped to the radial grid — a bench terrace
       laid out on the ring axis would look like a warehouse. */
    /* rFrac may be a single fraction of the park's radius or a list of them, tried in order:
       a piece that cannot stand on the ring it was asked for walks in or out until it finds a
       gap in the planting rather than being dropped. The tree test is the REAL rectangle —
       with a radius test round the centre, a gatehouse cleared by its centre and still had a
       cypress coming up through its roof, and the viaduct had three. */
    function parkTry(key, P, rFrac, aDeg, seed, name){
      var A=ASSET_BY_KEY[key]; if(!A) return false;
      var RS = (rFrac instanceof Array) ? rFrac : [rFrac];
      for(var q=0;q<RS.length;q++) if(parkAt(key, A, P, RS[q], aDeg + q*37, seed, name)) return true;
      return false;
    }
    function parkAt(key, A, P, rFrac, aDeg, seed, name){
      for(var k=0;k<36;k++){
        var a=(aDeg + k*10)*D, d=P.r*rFrac, x=P.x+Math.cos(a)*d, z=P.z+Math.sin(a)*d;
        var fx, fz;
        if(d > 1){ fx=-Math.cos(a); fz=-Math.sin(a); }                  /* look in, at the park */
        else { var ar=Math.atan2(P.z,P.x); fx=-Math.cos(ar); fz=-Math.sin(ar); }   /* look at the hub */
        var ry=faceRy(fx,fz);
        if(boxStreetPen(x, z, ry, A.w, A.d) > ST_TOL) continue;
        if(!treeClearBox(x, z, ry, A.w, A.d, 0.5)) continue;
        if(inButte(x, z, terrainH(x,z)+2, 8)) continue;
        if(inPlot(x, z, 3)) continue;
        if(!obbClear(x, z, ry, A.w, A.d, 2.5)) continue;
        if(!put(key, x, z, ry, Math.floor(phash(Math.round(x),3,Math.round(z),5)*A.variants) % Math.max(1,A.variants),
                7300 + (seed||0), name||'')) continue;
        PLACE_STATS.district++; nPark++;
        return true;
      }
      return false;
    }
    PARKS.forEach(function(P, pi){
      var plain = P.name.replace(' (site)','');
      var base = phash(Math.round(P.x), 3, Math.round(P.z), 11) * 360;
      /* 1. the signature piece, in the cleared middle */
      var sig = SIG[plain];
      if(sig) parkTry(sig, P, [0, 0.12], base, pi*17+1, plain);
      /* 2. the fountain, off to one side of it */
      parkTry('park_fountain_roundel', P, [0.34, 0.26, 0.42], base+95, pi*17+2, '');
      /* 3. two gate lodges where the park meets the town */
      parkTry('park_gatehouse', P, [0.86, 0.78, 0.92], base+30,  pi*17+3, '');
      parkTry('park_gatehouse', P, [0.86, 0.78, 0.92], base+210, pi*17+4, '');
      /* 4. the viaduct runs along a flank of the two larger parks, on whichever ring has a
            gap in the planting long enough for a 30 m arcade */
      if(P.r >= 46) parkTry('park_viaduct', P, [0.40, 0.33, 0.48, 0.56, 0.64], base+150, pi*17+5, '');
      /* 5. the smaller Güell furniture a second time where there is room for it */
      if(P.r >= 52) parkTry('park_fountain_roundel', P, [0.52, 0.60, 0.44], base+265, pi*17+6, '');
      REGISTER({ name:plain, kind:'park', label:'park · '+Math.round(P.r*2)+' m across',
                 x:P.x, y:terrainH(P.x,P.z)-1, z:P.z, r:P.r, h:22 });
    });
    window._parkPieces = nPark;
  })();

  /* ---------------- 4. THE FARM BELT --------------------------------------------------
     The belt between the wall and the canal is reserved and marked (mask code 7) and the
     plots are already cut. This drops a farmstead on a share of them — a walled compound
     with its granary, well and stock pen — set back from the ditch that waters the plot,
     and facing whatever track is nearest. Nothing here touches the crops themselves; the
     fields are painted ground. */
  (function(){
    if(!FARM_PLOTS.length) return;
    var STEAD = ['poor_compound','poor_mud_house','poor_musgum'].filter(function(k){ return !!ASSET_BY_KEY[k]; });
    var YARD  = ['prop_granary','prop_well','prop_animal_pen'].filter(function(k){ return !!ASSET_BY_KEY[k]; });
    if(!STEAD.length) return;
    FARM_PLOTS.forEach(function(F, fi){
      if(phash(Math.round(F.x), 6, Math.round(F.z), 17) > 0.22) return;     /* one plot in five */
      var key = STEAD[fi % STEAD.length], A=ASSET_BY_KEY[key];
      var ar = Math.atan2(F.z, F.x), fx=-Math.cos(ar), fz=-Math.sin(ar);
      var ns = nearestStreet(F.x, F.z, 90);
      if(ns && ns.px!=null){ var dx=ns.px-F.x, dz=ns.pz-F.z, L=Math.hypot(dx,dz)||1; if(L>3){ fx=dx/L; fz=dz/L; } }
      var ry = gridRy(F.x, F.z, fx, fz, A.w, A.d);
      if(ry===null) return;
      if(canalDist(F.x,F.z) < CANAL_W[3]+6) return;
      if(riverDist(F.x,F.z) < 30) return;
      if(boxStreetPen(F.x, F.z, ry, A.w, A.d) > ST_TOL) return;
      if(!put(key, F.x, F.z, ry, fi % A.variants, 8500+fi*7, '')) return;
      PLACE_STATS.farm++;
      /* the yard: two or three outbuildings round the back */
      for(var y=0; y<YARD.length; y++){
        if(phash(fi, y, 3, 23) > 0.62) continue;
        var ya = ry + Math.PI + (y-1)*0.8, yr = Math.max(A.w,A.d)*0.5 + 7;
        var yx = F.x + Math.sin(ya)*yr, yz = F.z + Math.cos(ya)*yr, YA=ASSET_BY_KEY[YARD[y]];
        if(!maskFree(yx, yz, 3) && maskAt(yx,yz)!==7) continue;
        if(boxStreetPen(yx, yz, ry, YA.w, YA.d) > ST_TOL) continue;
        if(!obbClear(yx, yz, ry, YA.w, YA.d, 1.5)) continue;
        if(put(YARD[y], yx, yz, ry, 0, 8600+fi*11+y, '')) PLACE_STATS.farm++;
      }
    });
  })();

  /* how well did the alignment take? a building is ON GRID when its yaw is within a
     degree of facing the hub, the wall, or along the ring */
  PLACED.forEach(function(b){
    if(b.free) return;                                   /* a slum house is off the grid on purpose */
    var ar=Math.atan2(b.z,b.x), off=Math.abs(wrapPi(b.ry - Math.atan2(-Math.cos(ar),-Math.sin(ar))));
    off = Math.min(off, Math.abs(off - Math.PI/2), Math.abs(off - Math.PI), Math.abs(off - 3*Math.PI/2), Math.abs(off - TAU));
    if(off > 0.02) ALIGN.offGrid++;
  });
  window._place = { scheduled:PLACE_STATS.scheduled, filled:PLACE_STATS.filled, district:PLACE_STATS.district, farm:PLACE_STATS.farm, skipped:PLACE_STATS.skipped,
                    buildings:PLACED.length, byFamily:PLACE_STATS.byFamily, plots:PLOTS.length,
                    align:{ snapped:ALIGN.snapped, fellBack:ALIGN.fellBack, nudged:ALIGN.nudged, refused:ALIGN.refused, offGrid:ALIGN.offGrid,
                            streetRejects:ALIGN.street, treeRejects:ALIGN.tree, freeYaw:ALIGN.freeYaw } };
})();
