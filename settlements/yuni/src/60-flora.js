/* ============================== 15. FLORA (first pass) ==============================
   Mediterranean: cypress, olive, a maritime-pine lookalike, scrub. Built from
   kit parts (trunk + crowns), placed by zone, and kept out of everything the
   mask reserves. TREE_SITES is published so the building pass can respect the
   avenue trees that are already standing.                                   */
reseed(600001);
var TREE_SITES = [];
var FLORA = { cypress:0, olive:0, pine:0, shrub:0, palm:0 };
function CYPRESS(x,z,h){ var y=terrainH(x,z)-0.3, r=h*0.095+0.35, c=pick(PAL.cypress);
  CYL(x,y,z,0.16+h*0.008,h*0.22,0,PAL.trunk[1],'bark'); CONE(x,y+h*0.10,z,r,h*0.62,0,c,'leafy'); CONE(x,y+h*0.40,z,r*0.78,h*0.60,0,shade(c,0.06),'leafy'); FLORA.cypress++; TREE_SITES.push([x,z,r+0.6]); }
function OLIVE(x,z,h){ var y=terrainH(x,z)-0.3, c=pick(PAL.olive), lean=rr(-0.18,0.18);
  CYL(x,y,z,0.22+h*0.03,h*0.45,[lean,rnd()*TAU,0],PAL.trunk[3],'bark');
  for(var k=0;k<2;k++){ var a=rnd()*TAU, d=h*0.20*k; BLOB(x+Math.cos(a)*d, y+h*(0.36+0.12*k), z+Math.sin(a)*d, h*(0.46-0.08*k), h*(0.52-0.06*k), rnd()*TAU, k?shade(c,0.08):c, 'leafy'); } FLORA.olive++; TREE_SITES.push([x,z,h*0.45]); }
function PINE(x,z,h){ var y=terrainH(x,z)-0.4, c=pick(PAL.pine), lx=rr(-0.10,0.10), lz=rr(-0.10,0.10), tx=x+lx*h, tz=z+lz*h;
  BEAM(x,y,z, tx,y+h*0.78,tz, 0.30+h*0.012, 0.30+h*0.012, PAL.trunk[0], 'bark');
  var R=h*0.30; push('ball','leafy',[tx, y+h*0.70, tz, R, R*0.42, R, 0, c]); push('ball','leafy',[tx+R*0.3, y+h*0.80, tz-R*0.2, R*0.66, R*0.34, R*0.66, 0, shade(c,0.07)]); FLORA.pine++; TREE_SITES.push([x,z,1.2]); }
function SHRUB(x,z,s){ BLOB(x, terrainH(x,z)-0.15, z, s, s*0.7, rnd()*TAU, pick(PAL.shrub), 'leafy'); FLORA.shrub++; }
(function(){
  if(SHEET) return;
  function clear(x,z,rad){ if(Math.max(Math.abs(x),Math.abs(z)) < CITY_EXT-4 && !maskFree(x,z,rad)) return false;
    /* A SCHEDULED PLOT IS NOT PLANTABLE. The plot schedule is fixed ground and its buildings
       cannot move out of the way of a tree, so seven avenue cypresses were standing inside the
       Library, the Archive and the Chapter house. Flora runs before placement; this is the only
       place the two can be kept apart. */
    if(inPlot(x,z,6)) return false;
    if(riverDist(x,z) < 6) return false; if(canalDist(x,z) < CANAL_W[3]-2) return false;     /* the canal corridor is the towpath pass's */
    if(inFarmBelt(x,z)) return false;                                                         /* the irrigated fields stay clear for the farm pass */
    if(inButte(x,z,terrainH(x,z)+2,6)) return false; return true; }
  function slope(x,z){ return Math.hypot(terrainH(x+4,z)-terrainH(x-4,z), terrainH(x,z+4)-terrainH(x,z-4))/8; }
  /* 1. avenues: cypress both sides of the processional way, the ring road and the first run of every highway */
  ST.edges.forEach(function(e){ if(!(e.cls==='ring' || e.cls==='highway' || e.cls==='road' || (e.cls==='boulevard'))) return;
    var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len, n=Math.floor(L/11), tx=(B.x-A.x)/L, tz=(B.z-A.z)/L, mid=Math.hypot((A.x+B.x)/2,(A.z+B.z)/2);
    if(mid > 1900) return; var inner = mid < RW, onAxis = Math.abs((A.x+B.x)/2) < 3 && (A.z+B.z)/2 > 0;
    if(inner && !onAxis) return;
    for(var k=0;k<n;k++){ var t=(k+0.5)/n, off=e.w/2+2.0; [-1,1].forEach(function(sd){ if(e.cls==='ring' && sd<0) return;
      var x=mix(A.x,B.x,t)-tz*off*sd, z=mix(A.z,B.z,t)+tx*off*sd; if(mid>760 && phash(x,0,z,2)<0.35) return;
      if(onStreet(x,z,1.2) || !clear(x,z,0)) return; if(Math.hypot(x-MARKET.x,z-MARKET.z) < MARKET.r+4) return;
      var ng=false; GATES.forEach(function(g){ if(Math.hypot(x-g.x,z-g.z) < 34) ng=true; }); if(ng) return;
      if(e.cls==='highway' && mid>900 && phash(x,1,z,5)<0.5) PINE(x,z,rr(13,19)); else CYPRESS(x,z,rr(11,17)); }); } });
  /* 2. parks */
  /* THE MIDDLE OF A PARK IS NOT PLANTED. The Güell pieces — the bench terrace, the
     hypostyle hall, the lizard stair — stand there, and the flora pass runs eight
     fragments before the placement pass, so a tree dropped in the centre here can never
     be taken out again later: it simply refuses the building. The keep-out is the depth
     of the largest piece plus its yard. */
  PARKS.forEach(function(P){ for(var i=0;i<46;i++){ var a=rnd()*TAU, d=P.r*(0.46 + 0.54*Math.sqrt(rnd()))*0.92, x=P.x+Math.cos(a)*d, z=P.z+Math.sin(a)*d; if(onStreet(x,z,2)) continue;
      var q=rnd(); if(q<0.3) CYPRESS(x,z,rr(9,14)); else if(q<0.6) PINE(x,z,rr(10,15)); else if(q<0.8) OLIVE(x,z,rr(4.5,6.5)); else SHRUB(x,z,rr(1.2,2.4)); } });
  /* 3. the valley: pine woods on the hills and the talus, olive groves in rows on the floor, scrub everywhere, poplar-like cypress by the river */
  var N=FAST?9000:15000, tries=0, placed=0;
  while(placed<N && tries++<N*6){
    var x=rr(-2500,2500), z=rr(-2500,2500), r0=Math.hypot(x,z); if(r0 < 770 || r0 > 2500) continue; if(!clear(x,z,0) || onStreet(x,z,3)) continue;
    var h=terrainH(x,z), sl=slope(x,z), wood=fbm(x*0.0030+9, z*0.0030-4), bd=Math.hypot(x-BUTTE.x,z-BUTTE.z), rd=riverDist(x,z);
    if(h > 420) continue;
    if(bd < 560 || (wood > 0.55 && sl > 0.04) || sl > 0.16){ if(rnd() < (bd<560?0.9:0.55)){ PINE(x,z,rr(12,22)); placed++; } else { SHRUB(x,z,rr(1.2,3)); placed++; } }
    else if(rd < 70 && rnd()<0.6){ if(rnd()<0.5) CYPRESS(x,z,rr(12,18)); else OLIVE(x,z,rr(5,7)); placed++; }
    else if(wood < 0.42 && sl < 0.06){ /* an olive grove: snap to a planted grid */
      var gx=Math.round(x/9)*9+ (phash(Math.round(x/9),0,Math.round(z/9),1)-0.5)*1.5, gz=Math.round(z/9)*9; if(phash(Math.round(x/90),3,Math.round(z/90),7) < 0.35 && clear(gx,gz,0)){ OLIVE(gx,gz,rr(4.5,6.5)); placed++; } }
    else if(rnd()<0.35){ SHRUB(x,z,rr(1,2.6)); placed++; }
  }
  /* 4. a wooded talus ring (the Devil's Tower skirt) */
  for(var i=0;i<(FAST?700:1300);i++){ var a=rnd()*TAU, d=rr(300,545), x2=BUTTE.x+Math.cos(a)*d, z2=BUTTE.z+Math.sin(a)*d;
    if(angDist(a,-Math.PI/2) < 1.25 || !clear(x2,z2,0) || Math.hypot(x2,z2) < RW+40) continue; PINE(x2,z2,rr(11,20)); }
  window._flora = FLORA;
})();
