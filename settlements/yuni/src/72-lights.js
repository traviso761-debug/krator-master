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
  nlLampAdd(x, y, z, amp==null?1:amp, rad==null?15:rad, cool, cool?'electric-lantern':'oil-lantern');
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
  nlLampAdd(x, y+h*0.5, z, amp==null?1.3:amp, rad==null?20:rad, true, 'arc-standard');
}
/* WHO IS ON THE GRID. Inside the wall, and the market district with its circle and
   the caravanserai yard. Nothing else — the cable stops where the money does. */
function onTheGrid(x,z){
  var r=Math.hypot(x,z);
  if(r < RW + 12) return true;
  if(Math.hypot(x-MARKET.x, z-MARKET.z) < MARKET.r + 40) return true;
  if(Math.hypot(x-CARAVANSERAI.x, z-CARAVANSERAI.z) < 90) return true;
  return districtAt(x,z).key === 'market';
}
var FIXED_LAMPS = 0, ELECTRIC_LAMPS = 0;
(function(){
  if(SHEET) return;
  GATES.forEach(function(g){ (g.lampAt||[]).forEach(function(p){ LANTERN(p[0],p[1],p[2],1.4,20,true,0.4); FIXED_LAMPS++; ELECTRIC_LAMPS++; }); });
  /* the wall-walk: electric on the town side, oil on the field side — the cable stops
     at the parapet, which is a thing you can see from outside at night */
  WALL_TOWERS.forEach(function(T){ var a=T.a;
    LANTERN(Math.cos(a)*(RW-T.r-0.5), wallWalkY(a)+2.6, Math.sin(a)*(RW-T.r-0.5), 1.0, 17, true, 0.3); FIXED_LAMPS++; ELECTRIC_LAMPS++;
    var ox=Math.cos(a)*(RW+T.r+0.5), oz=Math.sin(a)*(RW+T.r+0.5), out=onTheGrid(ox,oz);
    LANTERN(ox, wallWalkY(a)+2.6, oz, 0.9, 15, out, 0.3); FIXED_LAMPS++; if(out) ELECTRIC_LAMPS++; });
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], mid=Math.hypot((A.x+B.x)/2,(A.z+B.z)/2);
    var want = e.cls==='ring' || (e.cls==='boulevard') || (e.cls==='highway' && mid<760) || (e.cls==='street' && mid<RW && phash(A.x,1,B.z,3)<0.5);
    if(!want) return; var n=Math.floor(e.len/38), px=-(B.z-A.z)/e.len, pz=(B.x-A.x)/e.len;
    for(var k=0;k<=n;k++){ var t=(k+0.5)/(n+1), sg=((k+e.id)%2?1:-1), x=mix(A.x,B.x,t)+px*sg*(e.w/2+0.7), z=mix(A.z,B.z,t)+pz*sg*(e.w/2+0.7);
      if(Math.hypot(x-FORECOURT.x,z-FORECOURT.z) < FORECOURT.r+10 && z > FORECOURT.z-30) continue;
      if(onTheGrid(x,z)){ ARCPOST(x, terrainH(x,z), z, 5.0, 1.5, 22); ELECTRIC_LAMPS++; }
      else LAMPPOST(x, terrainH(x,z), z, 3.6, 1.0, 16, false);
      FIXED_LAMPS++; } });
  /* the market circle: a ring of arc standards, and four taller ones on the cross axes */
  for(var m=0;m<16;m++){ var a=m/16*TAU;
    ARCPOST(MARKET.x+Math.cos(a)*(MARKET.r-2), terrainH(MARKET.x,MARKET.z), MARKET.z+Math.sin(a)*(MARKET.r-2), m%4===0?8.0:5.4, m%4===0?2.2:1.6, m%4===0?34:24);
    FIXED_LAMPS++; ELECTRIC_LAMPS++; }
  /* the hub plaza */
  for(m=0;m<8;m++){ var a2=m/8*TAU;
    ARCPOST(Math.cos(a2)*(CENTER_PLAZA.r-2), terrainH(0,0), Math.sin(a2)*(CENTER_PLAZA.r-2), 6.4, 1.9, 28);
    FIXED_LAMPS++; ELECTRIC_LAMPS++; }
  /* the caravanserai yard */
  for(m=0;m<6;m++){ var a3=m/6*TAU, cx=CARAVANSERAI.x+Math.cos(a3)*54, cz=CARAVANSERAI.z+Math.sin(a3)*54;
    ARCPOST(cx, terrainH(cx,cz), cz, 5.4, 1.6, 24); FIXED_LAMPS++; ELECTRIC_LAMPS++; }
  /* WINDOWS. Every pane already standing inside the served area burns cool, because the
     houses are wired from the same supply; the flag is flipped in place rather than
     threaded through every asset's build. */
  var wired=0;
  NL_WINDOWS.forEach(function(W){ if(onTheGrid(W[0], W[2])){ W[10] = 1; wired++; } });
  window._wiredWindows = wired;
})();
window._fixedLamps = FIXED_LAMPS; window._electricLamps = ELECTRIC_LAMPS;
