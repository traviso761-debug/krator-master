/* ============================== 18b. THE PLACEMENT PASS — MUNGO (Locus's, re-written for Mungo) ==============================
   PLANNER-OWNED. Turns 30-layout.js's SITES_L into buildings, lays the river bridge, dresses the
   market square and the buggy park, and then FILLS the landward town: every street's two frontages,
   packed with the abyssal house types its district calls for, facing the street (the door rule: +z
   of the asset frame looks at the street it stands on); then the back lots; then the yards.
   The reed village offshore is NOT placed here: the Reed Lake kit builds it (65r, through REEDKIT).

   THE MIX. The landward town is "primarily buildings in the eastern abyssal style": the Eastern
   Abyssal kit's salvage shacks and family houses, with its stilt houses on the low ground by the
   water and canvas thrown up in the poorer yards. The Yuni houses stand only round the Geomancers'
   chapterhouse (scheduled). A scheduled site whose key is missing falls back to its `alt` key.

   THE TESTS (Locus's): an oriented-box separating-axis test against everything standing; how far
   the box reaches into the nearest carriageway (half a metre allowed: a doorstep); the mask (no
   building in the square, a yard, a site, the water or a field); the ground (dry, no steep bank). */
reseed(680001);

var PLACED = [], PLACE_STATS = { scheduled:0, fallback:[], frontage:0, backlot:0, yards:0, refused:0, refusedBy:{ ground:0, mask:0, street:0, clear:0 }, byFamily:{}, byKey:{}, dwellings:0, people:0 };
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
  /* the yards (the buggy park, the logging landings) stand in the clearance grid as if built */
  YARDS.forEach(function(Y){ pAdd({ x:Y.x, z:Y.z, ry:Y.ry, w:Y.w, d:Y.d, key:'yard' }); });
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
  function boxMaskOK(x,z,ry,w,d){ var C=corners(x,z,ry,w,d,0); C.push([x,z]);
    for(var i=0;i<C.length;i++){ var m=maskAt(C[i][0],C[i][1]); if(m===2||m===3||m===4||m===6||m===7) return false; } return true; }
  function boxGround(x,z,ry,w,d, stilt){ var C=corners(x,z,ry,w,d,0); C.push([x,z]);
    for(var i=0;i<C.length;i++){ var h=terrainH(C[i][0],C[i][1]); if(stilt){ if(h < 0.6) return false; } else if(h < CITY_EDGE_H-0.2) return false;
      if(lakeDist(C[i][0],C[i][1]) < (stilt?8:16) || riverDist(C[i][0],C[i][1]) < (stilt?4:12)) return false; }
    var lo=1e9, hi=-1e9; for(var q=0;q<4;q++){ var hh=terrainH(C[q][0],C[q][1]); lo=Math.min(lo,hh); hi=Math.max(hi,hh); } return hi-lo < (stilt?3.0:2.4); }
  function put(key, x, z, ry, variant, seed, name, tag, wealth, opt){
    var A=ASSET_BY_KEY[key]; if(!A){ ERR('place: no asset '+key); return null; }
    var o={ variant:variant||0, seed:seed, wealth:wealth==null?0.6:wealth }; if(opt && opt.y!=null) o.y=opt.y;
    var rec = buildAsset(key, x, z, ry, o);
    if(!rec) return null;
    /* the inspector names the place (the headman's house, the caravanserai of Mungo) before the kit's type name */
    if(name && SITES.length && SITES[SITES.length-1].kind==='asset' && SITES[SITES.length-1].name.indexOf(name)<0) SITES[SITES.length-1].name = name+' — '+SITES[SITES.length-1].name;
    rec.w=A.w; rec.d=A.d; rec.ry=ry; rec.plotName=name||''; rec.tag=tag||A.family; rec.family=A.family; rec.variant=variant||0;
    PLACED.push(rec); pAdd(rec);
    PLACE_STATS.byFamily[A.family]=(PLACE_STATS.byFamily[A.family]||0)+1; PLACE_STATS.byKey[key]=(PLACE_STATS.byKey[key]||0)+1;
    return rec;
  }
  var seedN = 1;

  /* ---------------- 1. THE SCHEDULE ---------------- */
  SITES_L.forEach(function(S){
    var key=S.key; if(!ASSET_BY_KEY[key] && S.alt){ PLACE_STATS.fallback.push(key+' -> '+S.alt); key=S.alt; }
    var r=put(key, S.x, S.z, S.ry, S.variant, 7000+seedN++*13, S.name, S.tag, S.tag==='civic'?0.9:0.7, S.water ? { y:0 } : null);
    if(r){ S.rec=r; S.placedKey=key; PLACE_STATS.scheduled++; } });
  BRIDGES.forEach(function(B){ LOCUS_BRIDGE(B); });

  /* ---------------- 2. THE MARKET SQUARE AND THE BUGGY PARK ---------------- */
  (function(){ var M=MARKET;
    /* stalls under sun shades in two arcs, the middle and the quay-to-street axis left clear */
    for(var s=0;s<12;s++){ var a2=s/12*TAU+0.26, r2=(s%2)?14:19, x2=M.x+Math.cos(a2)*r2, z2=M.z+Math.sin(a2)*r2;
      if(Math.abs(Math.sin(a2)) < 0.42) continue;
      if(obbClear(x2,z2,faceRy(M.x-x2,M.z-z2),3,3,0.6)) put('prop_market_stall', x2, z2, faceRy(M.x-x2,M.z-z2), s%4, 830+s, 'Market stall', 'market', 0.5); }
    [[-14,-16],[14,16],[-12,14],[12,-14]].forEach(function(p,i){ var x=M.x+p[0], z=M.z+p[1];
      if(obbClear(x,z,i*0.7,9,9,0.5)) put('sunshade_poles', x, z, i*0.7, i%3, 850+i, 'Market sun shade', 'market', 0.5); });
    put('prop_well', M.x, M.z, 0.4, 0, 811, 'The market well', 'market', 0.6);
  })();
  (function(){ var P=PARKING; if(!P) return;
    /* a shade shelter over the north bays and drum stacks of fuel at the east end; the buggies themselves are the life layer's */
    var ry=P.ry, a=loc(P.x,P.z,-8,-P.d/2+3,ry), b=loc(P.x,P.z,8,-P.d/2+3,ry), c=loc(P.x,P.z,P.w/2-3,P.d/2-3,ry);
    put('prop_hangar', a[0], a[1], ry+Math.PI, 0, 871, 'Buggy shelter', 'parking', 0.7);
    put('prop_hangar', b[0], b[1], ry+Math.PI, 0, 872, 'Buggy shelter', 'parking', 0.7);
    put('prop_drum_stack', c[0], c[1], ry, 1, 873, 'Fuel drums', 'parking', 0.7);
  })();

  /* ---------------- 3. THE FILL ---------------- */
  var POOR_A = ['abyss_house_poor','abyss_house_poor','abyss_house_poor','stilt_poor'];
  var MID_A  = ['abyss_house_mid','abyss_house_mid','stilt_mid','abyss_house_poor'];
  var CORE_A = ['abyss_house_mid','abyss_house_mid','abyss_house_mid','stilt_mid'];
  var TARGET_PEOPLE = 400;
  var PEOPLE = { abyss_house_poor:5, abyss_house_mid:6, stilt_poor:5, stilt_mid:6, abyss_house_rich:10 };
  function choose(x, z, cls, r01){
    var D=districtAt(x,z), h=terrainH(x,z), low = h < 2.4 || lakeDist(x,z) < 45 || riverDist(x,z) < 40, w=D.wealth, key;
    if(D.key==='geo') return null;                                         /* the Geomancers' quarter is scheduled, not filled */
    if(low){ key = w > 0.5 && r01 < 0.6 ? 'stilt_mid' : 'stilt_poor'; }
    else if(D.key==='core') key = CORE_A[Math.floor(r01*CORE_A.length)%CORE_A.length];
    else if(D.key==='prosper') key = MID_A[Math.floor(r01*MID_A.length)%MID_A.length];
    else key = r01 < 0.06 ? pick(['tent_pavilion','sunshade_poles']) : POOR_A[Math.floor(r01*POOR_A.length)%POOR_A.length];
    return { key:key, wealth:w, district:D.key };
  }
  function tagOf(key){ var A=ASSET_BY_KEY[key]; if(!A) return 'house'; if(key==='tent_pavilion'||key==='sunshade_poles') return 'yard';
    return (key.indexOf('poor')>=0) ? 'home_poor' : 'home_mid'; }
  function countPeople(key){ var n=PEOPLE[key]; if(n){ PLACE_STATS.dwellings++; PLACE_STATS.people += n; } }
  SITES_L.forEach(function(S){ if(S.rec && S.role==='headman') countPeople('abyss_house_rich'); if(S.rec && S.tag==='yuni') { PLACE_STATS.dwellings++; PLACE_STATS.people += 5; } });

  /* 3a. frontage: both sides of every street in the landward town, the main street first, then outward */
  var edges = ST.edges.filter(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mx=(A.x+B.x)/2, mz=(A.z+B.z)/2;
      if(e.cls==='track' || e.cls==='quay' || A.tag==='door' || B.tag==='door' || A.tag==='farmgate' || B.tag==='farmgate') return false;
      return cityGround(mx,mz) && Math.hypot(mx-190,(mz+30)*1.15) < 320; })
    .map(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mx=(A.x+B.x)/2, mz=(A.z+B.z)/2; e._ord = Math.hypot(mx-HUB.x,mz-HUB.z)*0.6 - 14*ST_CLASS[e.cls].pri + 30*phash(e.id,1,2,3); return e; })
    .sort(function(p,q){ return p._ord - q._ord; });
  edges.forEach(function(e){
    if(PLACE_STATS.people >= TARGET_PEOPLE) return;
    var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len; if(L < 9) return;
    var tx=(B.x-A.x)/L, tz=(B.z-A.z)/L;
    [-1,1].forEach(function(sd){
      var nx=-tz*sd, nz=tx*sd, t=2.5, guard=0;
      while(t < L-2.5 && guard++ < 50){
        var r01=phash(Math.round(A.x+t*tx), e.id, Math.round(A.z+t*tz), sd+3), C=choose(A.x+t*tx+nx*10, A.z+t*tz+nz*10, e.cls, r01);
        if(!C){ t+=6; continue; }
        var Aa=ASSET_BY_KEY[C.key]; if(!Aa){ t+=4; continue; }
        var w=Aa.w, d=Aa.d, stilt=C.key.indexOf('stilt')===0;
        if(t + w > L + 1.5){ t += 3; continue; }
        /* chaotic: the setback and the yaw wander a little off the street's line */
        var setback = 0.8 + (C.district==='poor' ? 1.4 : 2.2)*phash(t,e.id,sd,9);
        var cx = A.x + tx*(t+w/2) + nx*(e.w/2 + setback + d/2), cz = A.z + tz*(t+w/2) + nz*(e.w/2 + setback + d/2);
        var ry = faceRy(-nx, -nz) + (phash(cx,5,cz,11)-0.5)*0.32;
        if(!boxGround(cx,cz,ry,w,d,stilt)){ t+=2.5; PLACE_STATS.refused++; PLACE_STATS.refusedBy.ground++; continue; }
        if(!boxMaskOK(cx,cz,ry,w,d)){ t+=2.5; PLACE_STATS.refused++; PLACE_STATS.refusedBy.mask++; continue; }
        if(boxStreetPen(cx,cz,ry,w,d) > ST_TOL){ t+=2.5; PLACE_STATS.refused++; PLACE_STATS.refusedBy.street++; continue; }
        if(!obbClear(cx,cz,ry,w,d, C.district==='poor'?1.0:1.5)){ t+=2.5; PLACE_STATS.refused++; PLACE_STATS.refusedBy.clear++; continue; }
        var rec = put(C.key, cx, cz, ry, Math.floor(phash(cx,2,cz,5)*8)%Math.max(1,Aa.variants), 10000+seedN++*7, '', tagOf(C.key), C.wealth);
        if(rec){ PLACE_STATS.frontage++; countPeople(C.key); }
        t += w + (C.district==='poor' ? 1.2 : 2.2) + 3.0*phash(cx,3,cz,7);
      }
    });
  });
  /* 3b. the back lots: what ground is left in the town, a house turned to the nearest street */
  (function(){
    var tries=0;
    while(PLACE_STATS.people < TARGET_PEOPLE && tries++ < 5000){
      var x=rr(-40, 520), z=rr(-360, 120);
      if(!cityGround(x,z) || Math.hypot(x-190,(z+30)*1.15) > 320 || !maskFree(x,z,2)) continue;
      var ns = nearestStreet(x,z,30); if(!ns || ns.d < 4) continue;
      var C=choose(x,z,ns.edge.cls,rnd()); if(!C) continue;
      var Aa=ASSET_BY_KEY[C.key]; if(!Aa) continue; var stilt=C.key.indexOf('stilt')===0;
      var ry=faceRy(ns.px-x, ns.pz-z) + (rnd()-0.5)*0.5;
      if(!boxGround(x,z,ry,Aa.w,Aa.d,stilt) || !boxMaskOK(x,z,ry,Aa.w,Aa.d) || boxStreetPen(x,z,ry,Aa.w,Aa.d) > ST_TOL || !obbClear(x,z,ry,Aa.w,Aa.d,1.2)) continue;
      var rec=put(C.key, x, z, ry, Math.floor(rnd()*8)%Math.max(1,Aa.variants), 20000+seedN++*7, '', tagOf(C.key), C.wealth);
      if(rec){ PLACE_STATS.backlot++; countPeople(C.key); }
    }
  })();
  /* 3c. the yards: wells, sun shades and drum stacks in the gaps */
  (function(){
    var YARD=['prop_well','sunshade_poles','sunshade_poles','prop_drum_stack','prop_animal_pen'], n=0, tries=0;
    while(n < 26 && tries++ < 2500){
      var x=rr(-40, 500), z=rr(-340, 110);
      if(!cityGround(x,z) || districtAt(x,z).key==='geo' || !maskFree(x,z,1)) continue;
      var key=pick(YARD), Aa=ASSET_BY_KEY[key]; if(!Aa) continue; var ns=nearestStreet(x,z,26); if(!ns) continue;
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
