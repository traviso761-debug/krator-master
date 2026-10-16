/* ============================== 18. FIXED LAMPS ==============================
   PLANNER-OWNED. Two lighting systems, and the boundary between them is the
   point of the fragment.

   THE ORDER'S ELECTRIC runs from the Vault. It lights the INNER CITY inside the
   wall and the MARKET DISTRICT with its great circle and caravanserai — the two
   places the Order and the Emir between them can justify the cable. The fitting
   is an arc standard: a slim white Ancient-metal pole with a bowl and a bare
   glowing globe, the same one that stands on the Vault forecourt.

   EVERYWHERE ELSE burns oil: the prosperous quarter, the poorer half, the ring
   road beyond the market, the highways, the wall-walk's outer face. Timber post,
   brass cap, warm flame.

   So at night the city reads as a cool-white core and a cool-white market with a
   warm ring of oil between and around them, which is exactly the social map. */
reseed(720001);
function LANTERN(x,y,z, amp, rad, cool, hang){
  BOX(x, y-0.28, z, 0.34, 0.50, 0.34, 0, TIMBERC[3], 'timber');
  BOX(x, y-0.20, z, 0.26, 0.34, 0.26, 0.78, cool ? PAL.glowCool : PAL.glowWarm, 'glowmat');
  PYR(x, y+0.22, z, 0.50, 0.26, 0.50, 0, BRASSC[2], 'metal');
  if(hang) BOX(x, y+0.4, z, 0.04, hang, 0.04, 0, TIMBERC[3], 'timber');
  nlLampAdd(x, y, z, amp==null?1:amp, rad==null?15:rad, cool);
}
function LAMPPOST(x,y,z, h, amp, rad, cool){
  BOX(x, y, z, 0.20, h, 0.20, 0, TIMBERC[0], 'timber');
  BOX(x, y+h-0.12, z+0.35, 0.10, 0.10, 0.8, 0, TIMBERC[0], 'timber');
  LANTERN(x, y+h-0.55, z+0.7, amp, rad, cool, 0.3);
}
/* the Order's arc standard — the Vault's fitting, repeated down the served streets */
function ARCPOST(x,y,z, h, amp, rad){
  CYL(x, y, z, 0.17, h, 0, METALC[1], 'metal');
  TUBE('metal', [{x:x,y:y+h,z:z,r:0.17},{x:x,y:y+h+0.62,z:z,r:0.52},{x:x,y:y+h+0.92,z:z,r:0.14}], METALC[2], { seg:8 });
  BALL(x, y+h+0.34, z, 0.34, PAL.electric, 'glowmat');
  nlLampAdd(x, y+h*0.5, z, amp==null?1.3:amp, rad==null?20:rad, true);
}
/* WHO IS ON THE GRID. In Locus there is no Order cable: the only electric light is the
   Geomancers' own, run off their batteries — the refinery ring, the tank row and the forecourt of
   their Chapterhouse. Everything else, the whole town, burns oil (its own oil).
   2026-10-01: the generator house's line now runs out into the town (71g-locus-grid.js), so a window within
   reach of a pole on that line is wired too, and an electrified street carries the line's own lamps
   instead of oil posts. */
function onTheGrid(x,z){ if(Math.hypot(x,z) < RING0_R + 12) return true; if(GEOCHAPTER && Math.hypot(x-GEOCHAPTER.x, z-GEOCHAPTER.z) < 40) return true; return gridNear(x,z,34); }
function lampY(x,z){ var d=bridgeDeckAt(x,z); return d!=null ? d : terrainH(x,z); }
var FIXED_LAMPS = 0, ELECTRIC_LAMPS = 0;
(function(){
  if(SHEET) return;
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mid=Math.hypot((A.x+B.x)/2,(A.z+B.z)/2);
    var want = e.cls==='ring' || (e.cls==='boulevard' && mid < 460) || (e.cls==='street' && mid < 300 && phash(A.x,1,B.z,3)<0.6) || (e.cls==='road' && phash(A.x,2,B.z,4)<0.35) || (A.tag==='riverlane' && B.tag==='riverlane' && phash(A.x,5,B.z,6)<0.5);
    if(!want || GRID_EDGE[e.id]) return; var n=Math.floor(e.len/(e.cls==='ring'?26:36)), px=-(B.z-A.z)/e.len, pz=(B.x-A.x)/e.len;
    for(var k=0;k<=n;k++){ var t=(k+0.5)/(n+1), sg=((k+e.id)%2?1:-1), x=mix(A.x,B.x,t)+px*sg*(e.w/2+0.7), z=mix(A.z,B.z,t)+pz*sg*(e.w/2+0.7);
      if(maskAt(x,z)===4 || placedAt(x,z,0.6)) continue;
      if(e.cls==='ring' && Math.hypot(x,z) < RING0_R){ ARCPOST(x, lampY(x,z), z, 5.0, 1.5, 22); ELECTRIC_LAMPS++; }
      else LAMPPOST(x, lampY(x,z), z, 3.6, 1.0, 16, false);
      FIXED_LAMPS++; } });
  /* the refinery ring's inner verge: the Geomancers' arc standards, cool white */
  for(var m=0;m<12;m++){ var a=m/12*TAU+0.13, x=Math.cos(a)*(RING0_R-RING_W/2-1.2), z=Math.sin(a)*(RING0_R-RING_W/2-1.2);
    if(placedAt(x,z,0.5)) continue; ARCPOST(x, terrainH(x,z), z, 6.2, 1.8, 26); FIXED_LAMPS++; ELECTRIC_LAMPS++; }
  /* the buggy park: four arc standards at its corners, cool white (it is on the Geomancers' grid) */
  if(PARKING){ [[-15,-8],[15,-8],[-15,8],[15,8]].forEach(function(p){ var q=loc(PARKING.x,PARKING.z,p[0],p[1],PARKING.ry); if(placedAt(q[0],q[1],0.4)) return;
      ARCPOST(q[0], terrainH(q[0],q[1]), q[1], 5.6, 1.6, 24); FIXED_LAMPS++; ELECTRIC_LAMPS++; }); }
  /* the market square: oil lanterns on posts round the rim */
  for(m=0;m<10;m++){ var a2=m/10*TAU, x2=MARKET.x+Math.cos(a2)*(MARKET.r-2), z2=MARKET.z+Math.sin(a2)*(MARKET.r-2);
    if(placedAt(x2,z2,0.5)) continue; LAMPPOST(x2, terrainH(x2,z2), z2, 3.8, 1.2, 18, false); FIXED_LAMPS++; }
  /* a wired window is cool-white, and electric light is cheap to the Geomancers' tenants: it goes out later
     (the off-time hash is pushed into the late half) and one in seven burns till dawn */
  var wired=0; NL_WINDOWS.forEach(function(W){ if(onTheGrid(W[0], W[2])){ W[10] = 1; wired++; W[8] = 0.45 + 0.55*W[8]; if(phash(W[0],W[1],W[2],23.1) < 0.14) W[9] = true; } });
  ELECTRIC_LAMPS += GRID_STATS.lamps; FIXED_LAMPS += GRID_STATS.lamps;
  window._wiredWindows = wired;
})();
window._fixedLamps = FIXED_LAMPS; window._electricLamps = ELECTRIC_LAMPS;
