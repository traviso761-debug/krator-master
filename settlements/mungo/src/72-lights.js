/* ============================== 18. FIXED LAMPS — MUNGO (Locus's fittings) ==============================
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
reseed(720101);
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
/* WHO IS ON THE GRID. In Mungo only the Geomancers' quarter: the chapterhouse, its six Yuni houses, the
   generator and the buggy park (71g-mungo-grid.js). "The town is lit by primarily firelight at night."
   So: oil lanterns on timber posts down the main street, round the market, along the quay and at the inn
   and caravanserai gates; braziers at the pontoon landing; the reed village burns its own fires (the
   Reed Lake kit's firelight, switched by the reed glue); electric arc standards only on the buggy park. */
function onTheGrid(x,z){ if(GEOCHAPTER && Math.hypot(x-GEOCHAPTER.x, z-GEOCHAPTER.z) < 90) return true; return gridNear(x,z,30); }
function lampY(x,z){ var d=bridgeDeckAt(x,z); return d!=null ? d : terrainH(x,z); }
var FIXED_LAMPS = 0, ELECTRIC_LAMPS = 0;
(function(){
  if(SHEET) return;
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b];
    var want = e.cls==='main' || e.cls==='quay' || (A.tag==='marketrim' && B.tag==='marketrim' && (e.id%2===0)) ||
               (e.cls==='highway' && cityGround((A.x+B.x)/2,(A.z+B.z)/2) && phash(A.x,2,B.z,4)<0.7) || (e.cls==='street' && phash(A.x,1,B.z,3)<0.22);
    if(!want || GRID_EDGE[e.id] || onTheGrid((A.x+B.x)/2,(A.z+B.z)/2)) return; var n=Math.floor(e.len/(e.cls==='main'?24:34)), px=-(B.z-A.z)/e.len, pz=(B.x-A.x)/e.len;
    for(var k=0;k<=n;k++){ var t=(k+0.5)/(n+1), sg=((k+e.id)%2?1:-1), x=mix(A.x,B.x,t)+px*sg*(e.w/2+0.7), z=mix(A.z,B.z,t)+pz*sg*(e.w/2+0.7);
      if(maskAt(x,z)===4 || placedAt(x,z,0.6)) continue;
      LAMPPOST(x, lampY(x,z), z, 3.6, 1.0, 16, false); FIXED_LAMPS++; } });
  /* the pontoon landing: a pair of oil lanterns on tall posts, the first fire a boat sees from the lake */
  if(LANDING){ [-1,1].forEach(function(sd){ var x=LANDING.x+2.5, z=LANDING.z+sd*4.2; LAMPPOST(x, lampY(x,z), z, 4.4, 1.4, 22, false); FIXED_LAMPS++; }); }
  /* the buggy park: the Geomancers' arc standards, cool white */
  if(PARKING){ [[-15,-8],[15,-8],[-15,8],[15,8]].forEach(function(p){ var q=loc(PARKING.x,PARKING.z,p[0],p[1],PARKING.ry); if(placedAt(q[0],q[1],0.4)) return;
      ARCPOST(q[0], terrainH(q[0],q[1]), q[1], 5.6, 1.6, 24); FIXED_LAMPS++; ELECTRIC_LAMPS++; }); }
  /* a wired window is cool-white and burns later; every other window is lamplight */
  var wired=0; NL_WINDOWS.forEach(function(W){ if(onTheGrid(W[0], W[2])){ W[10] = 1; wired++; W[8] = 0.45 + 0.55*W[8]; if(phash(W[0],W[1],W[2],23.1) < 0.14) W[9] = true; } });
  ELECTRIC_LAMPS += GRID_STATS.lamps; FIXED_LAMPS += GRID_STATS.lamps;
  window._wiredWindows = wired;
})();
window._fixedLamps = FIXED_LAMPS; window._electricLamps = ELECTRIC_LAMPS;
