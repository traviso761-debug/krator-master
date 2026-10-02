/* ============================== 18. FIXED LAMPS ==============================
   PLANNER-OWNED. The lamps the brief asks for by position: at every bridge
   entry, and ringing the cleared path round each central trunk. (Buildings,
   rooms, roosts and the gate carvings register their own lamps where they are
   built.)  LANTERN() and LAMPPOST() are the shared helpers: a catalog lantern
   (furniture, 53-furnish) + a registered light for the glow volume and the halo layer. */
reseed(720001);

function LANTERN(x,y,z, amp, rad, cool, hang){
  /* FURNITURE (53-furnish): the catalog's framed lantern, br_h_hanging_lantern v1 (harvested from this helper):
     its flame 0.28 m above its origin, a 0.5 m cord above. y is the flame height; a longer hang keeps the rest of
     the cord as rope up to what the lantern hangs from. Its light goes into the night light volume as before. */
  FURNISH_AT('br_h_hanging_lantern', x, y-0.28, z, 0, { v:1, lamp:[amp==null?1:amp, rad==null?15:rad, cool] });
  if(hang > 0.5) ROD(x, y+0.9, z, x, y+0.4+hang, z, 0.02, ROPEC[1], 'rope');
}
function LAMPPOST(x,y,z, h, amp, rad, cool){
  /* FURNITURE: the catalog's lantern post, br_lamppost (harvested from this helper): 2.4 m, flame at 2.14 m,
     whatever h asked (the old post was h tall with the lantern hung at h-0.55) */
  FURNISH_AT('br_lamppost', x, y, z, 0, { lamp:[amp, rad, cool] });
}
var FIXED_LAMPS = 0;
BRIDGES.forEach(function(br){
  [br.a, br.b].forEach(function(h){ if(h.lampAt){ LANTERN(h.lampAt[0], h.lampAt[1], h.lampAt[2], 1.0, 14, false, 0.3); FIXED_LAMPS++; } });
  /* a long span carries a lantern or two mid-way so it does not vanish at night */
  if(br.L > 55){ var n = br.L > 85 ? 2 : 1;
    for(var i=1;i<=n;i++){ var t=i/(n+1); LANTERN(mix(br.a.x,br.b.x,t)+0.9, bridgeY(br,t)+1.25, mix(br.a.z,br.b.z,t), 0.7, 11, false, 0); FIXED_LAMPS++; } }
});
PLATS.forEach(function(P){
  if(!(P.main || P.kind==='council')){ LAMPPOST(P.x+0.9, P.y, P.z+0.9, 3.0, 0.9, 13, P.leafOf && P.leafOf.kind==='spider'); FIXED_LAMPS++; return; }
  var cool = P.kind==='spider';
  var r = P.rt + (P.kind==='council' ? 6.2 : 2.2), n = Math.max(6, Math.round(TAU*r/9));
  for(var i=0;i<n;i++){ var a=(i+0.5)/n*TAU, p=platXZ(P,r,a); LAMPPOST(p[0], P.y, p[1], 3.4, 1.0, 16, cool); FIXED_LAMPS++; }
  /* stair heads and gallery corners below */
  P.bays.forEach(function(B){
    for(var k=0;k<P.levels.length;k++){
      var Lv=P.levels[k]; if(k===0) continue;
      var p2=platXZ(P, Lv.Rout-1.0, B.ang); LANTERN(p2[0], Lv.y+Lv.H-0.7, p2[1], 0.8, 12, cool, 0.4); FIXED_LAMPS++;
    }
  });
});
SPIRALS.forEach(function(S){
  var n = Math.round(S.turns*7);
  for(var i=0;i<=n;i++){ if(i===n && S.kind==='gate') continue;   /* the ramp's last post would stand in the gate tunnel */
    var h=helixPoint(S,i/n), T=S.tree, rr2=h.r + S.w*0.5 - 0.3;
    LAMPPOST(T.x+Math.cos(h.a)*rr2, h.y, T.z+Math.sin(h.a)*rr2, 2.6, 0.8, 12, false); FIXED_LAMPS++; }
  if(S.landing){ LAMPPOST(S.landing.x, S.landing.y, S.landing.z, 3.2, 1.2, 16, false); FIXED_LAMPS++; }
});
window._fixedLamps = FIXED_LAMPS;
