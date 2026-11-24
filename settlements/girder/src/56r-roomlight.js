/* ============================== ROOM LIGHT (core/interiors/20-core-roomlight-host.js KRLHOST.wirePage) ==============================
   The rooms lit from the room table (I1-I2): every vertex inside one of Girder's planned rooms (GIX.jobs: every interior planned at load, furnished as the camera nears) takes the room's column of the KROOMLIGHT
   table and the indoor mask, so its walls and furniture are lit by the room's daylight and lamp ambience, not the sky's;
   the sun's share follows the night light volume's night (NLV_U.uNlNight). New rooms and new furniture are tagged as they
   come. ?roomlight=0 shows the page as it was. */
(function(){
  if(typeof KRLHOST === 'undefined' || typeof GIX === 'undefined') return;
  function start(){ if(typeof scene === 'undefined' || !scene || !scene.children.length){ setTimeout(start, 500); return; }
    window.GIRDER_RL = KRLHOST.wirePage({ scene:scene, rooms:function(){ var o = []; GIX.jobs.forEach(function(J){ o.push.apply(o, J.inst.rooms); }); return o; },
      table:function(L){ return KratorInteriors.roomLight(L); },
      sunUp:function(){ return 1 - NLV_U.uNlNight.value; } }); }
  setTimeout(start, 0);
})();
