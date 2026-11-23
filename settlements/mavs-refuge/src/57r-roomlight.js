/* ============================== ROOM LIGHT (core/interiors/20-core-roomlight-host.js KRLHOST.wirePage) ==============================
   The rooms lit from the room table (I1-I2): every vertex inside one of Mav's Refuge's interior units (MIX.units: each unit's shell, floor to its top level) takes the room's column of the KROOMLIGHT
   table and the indoor mask, so its walls and furniture are lit by the room's daylight and lamp ambience, not the sky's;
   the sun's share follows the night light volume's night (NLV_U.uNlNight). New rooms and new furniture are tagged as they
   come. ?roomlight=0 shows the page as it was. */
(function(){
  if(typeof KRLHOST === 'undefined' || typeof MIX === 'undefined' || !MIX.on) return;
  function start(){ if(typeof scene === 'undefined' || !scene || !scene.children.length){ setTimeout(start, 500); return; }
    window.MAVS_RL = KRLHOST.wirePage({ scene:scene, renderer:renderer, U:NLV.rl && NLV.rl.U, rooms:function(){ return MIX.units.map(function(u){ return { id:u.id, poly:u.shell.poly, y:u.shell.y, h:Math.max(2.4, (u.shell.levels || [1]).length * 2.6) }; }); },
      sunUp:function(){ return 1 - NLV_U.uNlNight.value; } }); }
  setTimeout(start, 0);
})();
