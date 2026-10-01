/* ============================== 18. FIXED LAMPS ==============================
   PLANNER-OWNED. Girder's fixed lamps: bridge heads, roost decks, stair landings, tower
   entrances, gates, watch posts and the roads. (Buildings,
   rooms, roosts and the gate carvings register their own lamps where they are
   built.)  LANTERN() is the shared helper: a little lantern body in the kit +
   a registered light for the glow volume and the halo layer.               */
reseed(720001);

function LANTERN(x,y,z, amp, rad, cool, hang){
  /* y is the flame height. hang>0 draws a cord up to the thing it hangs from */
  BOX(x, y-0.28, z, 0.34, 0.50, 0.34, 0, TIMBERC[2], 'timber');
  BOX(x, y-0.20, z, 0.26, 0.34, 0.26, 0.78, cool ? PAL.glowCool : PAL.glowWarm, 'glowmat');
  PYR(x, y+0.22, z, 0.50, 0.26, 0.50, 0, SHINGLEC[1], 'shingle');
  if(hang) ROD(x, y+0.4, z, x, y+0.4+hang, z, 0.02, ROPEC[1], 'rope');
  nlLampAdd(x, y, z, amp==null?1:amp, rad==null?15:rad, cool);
}
function LAMPPOST(x,y,z, h, amp, rad, cool){
  BOX(x, y, z, 0.20, h, 0.20, 0, TIMBERC[0], 'timber');
  BOX(x, y+h-0.12, z+0.35, 0.10, 0.10, 0.8, 0, TIMBERC[0], 'timber');
  LANTERN(x, y+h-0.55, z+0.7, amp, rad, cool, 0.3);
}
var FIXED_LAMPS = 0;
BRIDGES.forEach(function(br){
  [br.a, br.b].forEach(function(h){ if(h.lampAt){ LANTERN(h.lampAt[0], h.lampAt[1], h.lampAt[2], 1.0, 14, false, 0.3); FIXED_LAMPS++; } });
  LANTERN(mix(br.a.x,br.b.x,0.5)+0.9, bridgeY(br,0.5)+1.25, mix(br.a.z,br.b.z,0.5), 0.7, 11, false, 0); FIXED_LAMPS++;
});
TOWERS.forEach(function(T){
  /* deck: a lamp at each corner apron and beside the lift head */
  var P=T.deck, c=P.half-3;
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ LAMPPOST(T.x+q[0]*c, P.y, T.z+q[1]*c, 3.4, 1.1, 16, false); FIXED_LAMPS++; });
  LANTERN(T.lift.x, T.lift.y1+6.4, T.lift.z, 1.0, 14, false, 0.5); FIXED_LAMPS++;
  /* stair landings: every inhabited floor, and every fifth floor of the dark middle so the climb is never black */
  T.floors.forEach(function(F){ if(F.k>=TOWER_N) return;
    if(F.kind==='inhabited' || F.k%5===0){ LANTERN(T.x-7.0, F.y+3.2, T.z, F.kind==='inhabited'?0.9:0.5, 12, F.kind!=='inhabited', 0.4); FIXED_LAMPS++; }
    if(F.kind==='inhabited') [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(q){ if(phash(T.x+q[0],F.y,T.z+q[1],3) < F.use*0.8){ LANTERN(T.x+q[0]*21.2, F.y+3.3, T.z+q[1]*21.2, 0.8, 12, false, 0.35); FIXED_LAMPS++; } });
  });
  /* the four ground entrances */
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(f){ LAMPPOST(T.x+f[0]*(T.half+4)+f[1]*4, SETTLE_Y, T.z+f[1]*(T.half+4)+f[0]*4, 3.2, 1.0, 15, false); FIXED_LAMPS++; });
});
GATES.forEach(function(g){ (g.lampAt||[]).forEach(function(p){ LANTERN(p[0],p[1],p[2],1.3,18,false,0.4); FIXED_LAMPS++; }); });
(PALISADE.posts||[]).forEach(function(p){ LANTERN(p.x, p.y+1.6, p.z, 0.9, 14, false, 0.3); FIXED_LAMPS++; });
ROADS.forEach(function(r,i){ var L=Math.hypot(r[2]-r[0],r[3]-r[1]), n=Math.floor(L/34), px=-(r[3]-r[1])/L, pz=(r[2]-r[0])/L;
  for(var k=1;k<=n;k++){ var t=k/(n+1), sg=(k%2?1:-1); LAMPPOST(mix(r[0],r[2],t)+px*sg*(r[4]/2+0.8), SETTLE_Y, mix(r[1],r[3],t)+pz*sg*(r[4]/2+0.8), 3.2, 0.9, 14, false); FIXED_LAMPS++; } });
window._fixedLamps = FIXED_LAMPS;
