/* ============================== 18b. THE PLACEMENT PASS — LOCUS ==============================
   PLANNER-OWNED. Turns 30-layout.js's SITES_L into buildings, furnishes the market and the
   park, lays the bridges, and then FILLS the town: every street's two frontages, packed with
   the house types its district calls for, facing the street (the door rule: the front, +z of
   the asset frame, looks at the street it stands on); then the back lots.

   THE MIX. Locus is mostly Yuni fabric with the new ABYSSAL-DESERT style through it: on the low
   ground the wet season reaches, the stilt houses take over; everywhere else they stand among
   Yuni's mud and blue-wash houses at about one in five, and the canvas (tents, sun shades) is
   thrown up in the poorer yards. The wealthy and the civic sit on the hilltop round the ring.

   THE TESTS (Yuni's, unchanged): an oriented-box separating-axis test against everything
   standing; how far the box reaches into the nearest carriageway (half a metre allowed — a
   doorstep); and the mask (no building in the market, the park, a site, the water or a field).  */
reseed(680001);

var PLACED = [], PLACE_STATS = { scheduled:0, frontage:0, backlot:0, yards:0, refused:0, byFamily:{}, byKey:{}, dwellings:0, people:0 };
(function(){
  if(SHEET) return;
  var ST_TOL = 0.5;
  function corners(x,z,ry,w,d,pad){ var c=Math.cos(ry), s=Math.sin(ry), hw=w/2+pad, hd=d/2+pad, o=[];
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ o.push([ x + q[0]*hw*c + q[1]*hd*s, z - q[0]*hw*s + q[1]*hd*c ]); }); return o; }
  function sat(A,B){ var boxes=[A,B];
    for(var b=0;b<2;b++){ var Q=boxes[b]; for(var e=0;e<2;e++){ var ax=Q[e+1][0]-Q[e][0], az=Q[e+1][1]-Q[e][1], L=Math.hypot(ax,az)||1, nx=-az/L, nz=ax/L;
      var a0=1e9,a1=-1e9,b0=1e9,b1=-1e9; for(var i=0;i<4;i++){ var pa=A[i][0]*nx+A[i][1]*nz, pb=B[i][0]*nx+B[i][1]*nz; if(pa<a0)a0=pa; if(pa>a1)a1=pa; if(pb<b0)b0=pb; if(pb>b1)b1=pb; }
      if(a1 < b0 || b1 < a0) return false; } }
    return true; }
  /* a coarse bucket grid over everything placed, so the clearance test looks at neighbours only */
  var PCELL=40, PGRID={};
  function pAdd(rec){ var R=Math.hypot(rec.w,rec.d)/2+2, i0=Math.floor((rec.x-R)/PCELL), i1=Math.floor((rec.x+R)/PCELL), j0=Math.floor((rec.z-R)/PCELL), j1=Math.floor((rec.z+R)/PCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k=i+','+j; (PGRID[k]=PGRID[k]||[]).push(rec); } }
  function obbClear(x,z,ry,w,d,pad){
    var box=corners(x,z,ry,w,d,pad==null?1.2:pad), R=Math.hypot(w,d)/2+pad+2, seen=[];
    var i0=Math.floor((x-R)/PCELL), i1=Math.floor((x+R)/PCELL), j0=Math.floor((z-R)/PCELL), j1=Math.floor((z+R)/PCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var cell=PGRID[i+','+j]; if(!cell) continue;
      for(var n=0;n<cell.length;n++){ var b=cell[n]; if(seen.indexOf(b)>=0) continue; seen.push(b);
        if(Math.hypot(b.x-x,b.z-z) > R + Math.hypot(b.w,b.d)/2) continue;
        if(sat(box, corners(b.x,b.z,b.ry,b.w,b.d,0))) return false; } }
    return true;
  }
  var SCELL=64, SGRID={};
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2+2;
    var i0=Math.floor((Math.min(A.x,B.x)-pad)/SCELL), i1=Math.floor((Math.max(A.x,B.x)+pad)/SCELL), j0=Math.floor((Math.min(A.z,B.z)-pad)/SCELL), j1=Math.floor((Math.max(A.z,B.z)+pad)/SCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var k=i+','+j; (SGRID[k]=SGRID[k]||[]).push(e); } });
  function boxStreetPen(x,z,ry,w,d){
    var c=Math.cos(ry), s=Math.sin(ry), hw=w/2, hd=d/2, P=[], Q=[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[1,0],[0,1],[-1,0],[0,0],[-0.5,1],[0.5,1],[-0.5,-1],[0.5,-1]];
    for(var q=0;q<Q.length;q++) P.push([ x + Q[q][0]*hw*c + Q[q][1]*hd*s, z - Q[q][0]*hw*s + Q[q][1]*hd*c ]);
    var rad=Math.hypot(w,d)/2, seen={}, worst=0;
    var i0=Math.floor((x-rad-8)/SCELL), i1=Math.floor((x+rad+8)/SCELL), j0=Math.floor((z-rad-8)/SCELL), j1=Math.floor((z+rad+8)/SCELL);
    for(var i=i0;i<=i1;i++) for(var j=j0;j<=j1;j++){ var cell=SGRID[i+','+j]; if(!cell) continue;
      for(var n=0;n<cell.length;n++){ var e=cell[n]; if(seen[e.id]) continue; seen[e.id]=1;
        var A=ST.nodes[e.a], B=ST.nodes[e.b], pad=e.w/2;
        for(var p=0;p<P.length;p++){ var pen = pad - segDist(P[p][0],P[p][1], A.x,A.z, B.x,B.z); if(pen > worst) worst=pen; } } }
    return worst;
  }
  function boxMaskOK(x,z,ry,w,d, allowStreet){ var C=corners(x,z,ry,w,d,0); C.push([x,z]);
    for(var i=0;i<C.length;i++){ var m=maskAt(C[i][0],C[i][1]); if(m===2||m===3||m===4||m===6||m===7) return false; if(m===1 && !allowStreet) { /* the pen test judges streets */ } } return true; }
  function boxGround(x,z,ry,w,d, stilt){ var C=corners(x,z,ry,w,d,0); C.push([x,z]);
    for(var i=0;i<C.length;i++){ var h=terrainH(C[i][0],C[i][1]); if(stilt){ if(h < 0.7) return false; } else if(h < CITY_EDGE_H-0.3) return false;
      if(lakeDist(C[i][0],C[i][1]) < 40 || riverDist(C[i][0],C[i][1]) < (stilt?4:14) || canalDist(C[i][0],C[i][1]) < CANAL_W[2]+2) return false; }
    /* and not across a steep bank: a house wants its four corners within a storey of each other */
    var lo=1e9, hi=-1e9; for(var q=0;q<4;q++){ var hh=terrainH(C[q][0],C[q][1]); lo=Math.min(lo,hh); hi=Math.max(hi,hh); } return hi-lo < (stilt?3.2:2.6); }
  function put(key, x, z, ry, variant, seed, name, tag, wealth){
    var A=ASSET_BY_KEY[key]; if(!A){ ERR('place: no asset '+key); return null; }
    var rec = buildAsset(key, x, z, ry, { variant:variant||0, seed:seed, wealth:wealth==null?0.6:wealth });
    if(!rec) return null;
    rec.w=A.w; rec.d=A.d; rec.ry=ry; rec.plotName=name||''; rec.tag=tag||A.family; rec.family=A.family; rec.variant=variant||0;
    PLACED.push(rec); pAdd(rec);
    PLACE_STATS.byFamily[A.family]=(PLACE_STATS.byFamily[A.family]||0)+1; PLACE_STATS.byKey[key]=(PLACE_STATS.byKey[key]||0)+1;
    return rec;
  }
  var seedN = 1;

  /* ---------------- 1. THE SCHEDULE ---------------- */
  /* the buggy park (30-layout PARKING, yard:true) has no building: a shade shelter over the north side and fuel drums
     at the east end; the buggies are the life layer's (84-life.js) */
  (function(){ var P=PARKING; if(!P) return; var ry=P.ry, a=loc(P.x,P.z,-8,-P.d/2+3,ry), b=loc(P.x,P.z,8,-P.d/2+3,ry), c=loc(P.x,P.z,P.w/2-3,-P.d/2+3,ry);
    put('prop_hangar', a[0], a[1], ry+Math.PI, 0, 871, 'Buggy shelter', 'parking', 0.7);
    put('prop_hangar', b[0], b[1], ry+Math.PI, 0, 872, 'Buggy shelter', 'parking', 0.7);
    put('prop_drum_stack', c[0], c[1], ry, 1, 873, 'Fuel drums', 'parking', 0.7); })();
  SITES_L.forEach(function(S){ if(S.yard) return; var r=put(S.key, S.x, S.z, S.ry, S.variant, 7000+seedN++*13, S.name, S.tag, S.tag==='rich'?0.9:0.7); if(r){ S.rec=r; PLACE_STATS.scheduled++; } });
  BRIDGES.forEach(function(B){ LOCUS_BRIDGE(B); });
  /* the refinery yard inside the ring: drum stacks, shades for the Geomancers, a pipe rack out to the tanks */
  (function(){ var n=0, tries=0; reseed(681001);
    while(n < 16 && tries++ < 400){ var a=rnd()*TAU, r=30+rnd()*58, x=Math.cos(a)*r, z=Math.sin(a)*r, ry=rnd()*TAU;
      if(Math.hypot(x,z) > RING0_R-RING_W/2-5) continue; if(!obbClear(x,z,ry,5,4,2.2)) continue;
      if(put(n%5===4?'sunshade_poles':'prop_drum_stack', x, z, ry, n%3, 682000+n*7, n%5===4?'Workers\' shade':'Drum stack', 'yard', 0.5)) n++; } })();

  /* ---------------- 2. THE MARKET AND THE PARK ---------------- */
  (function(){ var M=MARKET, cy=terrainH(M.x,M.z);
    put('prop_fountain_kiosk', M.x, M.z, 0, 1, 811, 'Market fountain', 'market', 0.7);
    [[0,30],[180,30]].forEach(function(q,i){ var a=(q[0]+90)*Math.PI/180, x=M.x+Math.cos(a)*q[1], z=M.z+Math.sin(a)*q[1];
      put('trade_market_hall', x, z, faceRy(M.x-x, M.z-z), i%2, 820+i, 'Arcaded market hall', 'market', 0.7); });
    for(var s=0;s<14;s++){ var a2=s/14*TAU+0.12, r2=(s%2)?17:22, x2=M.x+Math.cos(a2)*r2, z2=M.z+Math.sin(a2)*r2;
      if(Math.abs(Math.sin(a2)) > 0.72) continue;
      if(obbClear(x2,z2,faceRy(M.x-x2,M.z-z2),3,3,0.6)) put('prop_market_stall', x2, z2, faceRy(M.x-x2,M.z-z2), s%4, 830+s, 'Market stall', 'market', 0.5); }
    [[-38,12],[38,-10],[-26,-32],[30,30]].forEach(function(p,i){ var x=M.x+p[0]*0.75, z=M.z+p[1]*0.75;
      if(obbClear(x,z,i*0.7,9,9,0.5)) put('sunshade_poles', x, z, i*0.7, i%3, 850+i, 'Market sun shade', 'market', 0.5); });
    var tx=M.x-34, tz=M.z+22; if(obbClear(tx,tz,0.4,18,14,0.5)) put('tent_pavilion', tx, tz, faceRy(M.x-tx,M.z-tz), 0, 861, 'Tea-tent of the market', 'market', 0.6);
  })();
  (function(){ var P=PARK;
    put('park_fountain_roundel', P.x, P.z, 0, 0, 901, 'Well of the Garden', 'park', 0.8);
    var bx=P.x, bz=P.z-22; put('park_serpentine_bench', bx, bz, faceRy(0,1), 0, 902, 'Serpentine bench', 'park', 0.8);
    [[-24,10],[22,14]].forEach(function(p,i){ put('sunshade_poles', P.x+p[0], P.z+p[1], i*1.2, i+1, 903+i, 'Garden sun shade', 'park', 0.7); });
    put('prop_well', P.x+10, P.z+24, 0.3, 0, 906, 'Garden well', 'park', 0.6);
    for(var k=0;k<14;k++){ var a=k/14*TAU+0.2, r=P.r*(0.62+0.3*phash(k,1,2,3)), x=P.x+Math.cos(a)*r, z=P.z+Math.sin(a)*r;
      if(!obbClear(x,z,0,3,3,0.8)) continue; var rec=buildPlant(k%3===0?'salt_reed':'marsh_palmetto', x, z, a, { variant:k%2, seed:950+k });
      TREE_SITES.push([x,z,2.4]); PLACED.push({ key:'plant', x:x, z:z, ry:0, w:3, d:3, tag:'plant' }); pAdd(PLACED[PLACED.length-1]); }
  })();
  /* palmettos along the ring road's outer verge and the first run of the avenues */
  ST.edges.forEach(function(e){ if(!(e.cls==='ring' || e.cls==='boulevard')) return;
    var A=ST.nodes[e.a], B=ST.nodes[e.b], mid=Math.hypot((A.x+B.x)/2,(A.z+B.z)/2); if(mid > 260) return;
    var n=Math.floor(e.len/15), tx=(B.x-A.x)/e.len, tz=(B.z-A.z)/e.len;
    for(var k=0;k<n;k++){ var t=(k+0.5)/n; [-1,1].forEach(function(sd){ if(e.cls==='ring'){ var o=Math.hypot(mix(A.x,B.x,t)-tz*sd, mix(A.z,B.z,t)+tx*sd); if(o < mid) return; }
      var off=e.w/2+1.8, x=mix(A.x,B.x,t)-tz*off*sd, z=mix(A.z,B.z,t)+tx*off*sd;
      if(onStreet(x,z,0.8) || maskAt(x,z)>=2 || !obbClear(x,z,0,2.4,2.4,0.4)) return;
      buildPlant('marsh_palmetto', x, z, phash(x,1,z,2)*TAU, { variant:0, seed:Math.round(x*7+z*3) }); TREE_SITES.push([x,z,2.2]);
      PLACED.push({ key:'plant', x:x, z:z, ry:0, w:2.4, d:2.4, tag:'plant' }); pAdd(PLACED[PLACED.length-1]); }); } });

  /* ---------------- 3. THE FILL ---------------- */
  var POOR_Y = ['poor_mud_house','poor_mud_house','poor_egg_hut','poor_musgum','poor_cone_cluster','poor_compound','poor_shack'];
  var MID_Y  = ['mid_washed_house','mid_djenne_house','mid_djenne_house','mid_round_tower_house','mid_courtyard_house','mid_washed_house','mid_bluewash_townhouse'];
  var SHOP_Y = ['trade_shop_house','trade_shop_house','trade_tavern','trade_smithy'];
  var RICH_Y = ['mid_courtyard_house','stilt_mid','mid_round_tower_house','mid_courtyard_house','rich_merchant_palace','rich_tower_house','mid_djenne_house'];
  var TARGET_PEOPLE = 2650, RICH_CAP = 8;
  var PEOPLE = { poor:6, mid:5, rich:9, stilt_poor:6, stilt_mid:5 };
  function choose(x, z, cls, r01){
    var D=districtAt(x,z), h=terrainH(x,z), low = h < 5.0, w=D.wealth, key;
    if(low){                                                                 /* the wet-season ground: the stilt houses */
      if(w > 0.45 && r01 < 0.75) key='stilt_mid'; else if(r01 < 0.72) key='stilt_poor'; else key=pick(w>0.4?MID_Y:POOR_Y);
    } else if(w > 0.66){
      key = (cls==='boulevard'||cls==='ring') && r01 < 0.35 ? pick(SHOP_Y) : (r01 < 0.14 ? 'stilt_mid' : pick(RICH_Y));
    } else if(w > 0.40){
      if((cls==='boulevard'||cls==='street') && r01 < 0.22) key=pick(SHOP_Y); else if(r01 < 0.52) key='stilt_mid'; else key=pick(MID_Y);
    } else {
      if(r01 < 0.40) key='stilt_poor'; else if(r01 < 0.45) key=pick(['tent_pavilion','sunshade_poles']); else key=pick(POOR_Y);
    }
    if(key.indexOf('rich_')===0 && (PLACE_STATS.byFamily.rich||0) >= RICH_CAP) key = pick(MID_Y);
    return { key:key, wealth:w, district:D.key };
  }
  function tagOf(key){ var A=ASSET_BY_KEY[key]; if(!A) return 'house';
    if(key==='stilt_poor') return 'home_poor'; if(key==='stilt_mid') return 'home_mid';
    if(A.family==='poor') return 'home_poor'; if(A.family==='mid') return 'home_mid'; if(A.family==='rich') return 'home_rich';
    if(key==='trade_tavern') return 'tavern'; if(A.family==='trade') return 'shop'; return 'yard'; }
  function countPeople(key){ var t=tagOf(key); if(t==='home_poor'){ PLACE_STATS.dwellings++; PLACE_STATS.people += (key==='poor_compound'||key==='poor_cone_cluster')?11:6; }
    else if(t==='home_mid'){ PLACE_STATS.dwellings++; PLACE_STATS.people += 5; } else if(t==='home_rich'){ PLACE_STATS.dwellings++; PLACE_STATS.people += (key==='rich_terrace_apartments'?36:(key==='rich_family_compound'?16:9)); }
    else if(t==='shop'||t==='tavern'){ PLACE_STATS.dwellings++; PLACE_STATS.people += 4; } }
  SITES_L.forEach(function(S){ if(S.rec) countPeople(S.key); });

  /* 3a. frontage: both sides of every street in the town, highest class first */
  var edges = ST.edges.filter(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mx=(A.x+B.x)/2, mz=(A.z+B.z)/2;
      if(e.cls==='track' || A.tag==='riverlane' || B.tag==='riverlane' || A.tag==='spur' || B.tag==='spur') return false;
      return Math.hypot(mx,mz) < 520 && terrainH(mx,mz) > 1.0; })
    /* THE TOWN GROWS FROM THE MIDDLE, AND UPHILL FIRST: the frontages are filled nearest the ring and
       highest on the hill first, main streets a little before lanes, until the town holds its people */
    .map(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mx=(A.x+B.x)/2, mz=(A.z+B.z)/2; e._ord = Math.hypot(mx,mz) - 3.0*terrainH(mx,mz) - 12*ST_CLASS[e.cls].pri; return e; })
    .sort(function(p,q){ return p._ord - q._ord; });
  edges.forEach(function(e){
    if(PLACE_STATS.people >= TARGET_PEOPLE) return;
    var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len; if(L < 9) return;
    var tx=(B.x-A.x)/L, tz=(B.z-A.z)/L;
    [-1,1].forEach(function(sd){
      var nx=-tz*sd, nz=tx*sd, t=2.5, guard=0;
      while(t < L-2.5 && guard++ < 60){
        var r01=phash(Math.round(A.x+t*tx), e.id, Math.round(A.z+t*tz), sd+3), C=choose(A.x+t*tx+nx*12, A.z+t*tz+nz*12, e.cls, r01), Aa=ASSET_BY_KEY[C.key];
        if(!Aa){ t+=4; continue; }
        var w=Aa.w, d=Aa.d, stilt=C.key.indexOf('stilt')===0;
        if(t + w > L + 1.5){ t += 3; continue; }
        var setback = 0.6 + (C.district==='poor' ? 0.4 : 1.4)*phash(t,e.id,sd,9);
        var cx = A.x + tx*(t+w/2) + nx*(e.w/2 + setback + d/2), cz = A.z + tz*(t+w/2) + nz*(e.w/2 + setback + d/2);
        var ry = faceRy(-nx, -nz);
        if(!boxGround(cx,cz,ry,w,d,stilt) || !boxMaskOK(cx,cz,ry,w,d) || boxStreetPen(cx,cz,ry,w,d) > ST_TOL || !obbClear(cx,cz,ry,w,d, C.district==='poor'?0.9:1.4)){ t += 2.5; PLACE_STATS.refused++; continue; }
        var rec = put(C.key, cx, cz, ry, Math.floor(phash(cx,2,cz,5)*8)%Math.max(1,Aa.variants), 10000+seedN++*7, '', tagOf(C.key), C.wealth);
        if(rec){ PLACE_STATS.frontage++; countPeople(C.key); }
        t += w + (C.district==='poor' ? 0.8 : 1.6) + 2.2*phash(cx,3,cz,7);
      }
    });
  });
  /* 3b. the back lots: whatever ground is left in the town, a house facing the nearest street */
  (function(){
    var tries=0, target=TARGET_PEOPLE;
    while(PLACE_STATS.people < target && tries++ < 9000){
      var a=rnd()*TAU, r=Math.sqrt(rnd())*470, x=Math.cos(a)*r, z=Math.sin(a)*r;
      if(terrainH(x,z) < 1.0 || !maskFree(x,z,2)) continue;
      var ns = nearestStreet(x,z,34); if(!ns || ns.d < 4) continue;
      var r01=rnd(), C=choose(x,z,ns.edge.cls,r01); if(C.district==='core' && r01<0.6) C.key=pick(MID_Y);
      var Aa=ASSET_BY_KEY[C.key]; if(!Aa) continue; var stilt=C.key.indexOf('stilt')===0;
      var ry=faceRy(ns.px-x, ns.pz-z) + (rnd()-0.5)*0.3;
      if(!boxGround(x,z,ry,Aa.w,Aa.d,stilt) || !boxMaskOK(x,z,ry,Aa.w,Aa.d) || boxStreetPen(x,z,ry,Aa.w,Aa.d) > ST_TOL || !obbClear(x,z,ry,Aa.w,Aa.d,1.0)) continue;
      var rec=put(C.key, x, z, ry, Math.floor(rnd()*8)%Math.max(1,Aa.variants), 20000+seedN++*7, '', tagOf(C.key), C.wealth);
      if(rec){ PLACE_STATS.backlot++; countPeople(C.key); }
    }
  })();
  /* 3c. the yards: wells, granaries, animal pens, shade shelters in the gaps of the lower town */
  (function(){
    var YARD=['prop_well','prop_granary','prop_hangar','prop_animal_pen','sunshade_poles','prop_well'], n=0, tries=0;
    while(n < 70 && tries++ < 3000){
      var a=rnd()*TAU, r=180+Math.sqrt(rnd())*300, x=Math.cos(a)*r, z=Math.sin(a)*r;
      if(districtAt(x,z).wealth > 0.55 || terrainH(x,z) < 2 || !maskFree(x,z,1)) continue;
      var key=pick(YARD), Aa=ASSET_BY_KEY[key], ns=nearestStreet(x,z,30); if(!ns) continue;
      var ry=faceRy(ns.px-x, ns.pz-z);
      if(boxStreetPen(x,z,ry,Aa.w,Aa.d) > 0 || !obbClear(x,z,ry,Aa.w,Aa.d,0.8)) continue;
      if(put(key, x, z, ry, n%Math.max(1,Aa.variants), 30000+n*11, '', 'yard', 0.3)){ n++; PLACE_STATS.yards++; }
    }
  })();

  window._place = PLACE_STATS;
})();
/* the site rectangles, published for anything that needs to keep out of them (the biome, the life layer) */
function placedAt(x,z,pad){
  for(var i=0;i<PLACED.length;i++){ var b=PLACED[i]; if(b.w==null) continue; if(Math.abs(b.x-x) > b.w+b.d || Math.abs(b.z-z) > b.w+b.d) continue;
    var q=loc(0,0,x-b.x,z-b.z,-b.ry); if(Math.abs(q[0]) <= b.w/2+(pad||0) && Math.abs(q[1]) <= b.d/2+(pad||0)) return b; }
  return null;
}
