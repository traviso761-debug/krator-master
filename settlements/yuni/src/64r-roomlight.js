/* ============================== ROOM LIGHT (core/interiors/20-core-roomlight-host.js KRLHOST.wirePage) ==============================
   The rooms lit from the room table (I1-I2): every vertex inside one of Yuni's interiors (INTERIOR_CACHE: each building's plan, built as the camera nears) takes the room's column of the KROOMLIGHT
   table and the indoor mask, so its walls and furniture are lit by the room's daylight and lamp ambience, not the sky's;
   the sun's share follows the night light volume's night (NLV_U.uNlNight). New rooms and new furniture are tagged as they
   come. ?roomlight=0 shows the page as it was. */
(function(){
  if(typeof KRLHOST === 'undefined') return;
  function start(){ if(typeof scene === 'undefined' || !scene || !scene.children.length){ setTimeout(start, 500); return; }
    window.YUNI_RL = KRLHOST.wirePage({ scene:scene, rooms:function(){ var o = []; for(var k in INTERIOR_CACHE){ var P = INTERIOR_CACHE[k], b = FIX.byId[k]; if(!P || !P.rooms || !b) continue;
        /* a plan's rooms are in its building's frame (intToWorld), their floors over the building's base */
        if(!P._rlWorld) P._rlWorld = P.rooms.map(function(R){ return { id:R.id, y:(b.y || 0) + R.y, h:R.h, poly:R.poly.map(function(q){ return intToWorld(b, q[0], q[1]); }) }; });
        o.push.apply(o, P._rlWorld); } return o; },
      sunUp:function(){ return 1 - NLV_U.uNlNight.value; } }); }
  setTimeout(start, 0);
})();
