/* ============================== ROOM LIGHT (core/interiors/20-core-roomlight-host.js KRLHOST.wirePage) ==============================
   The rooms lit from the room table (I1-I2): every vertex inside one of the rooms ?interiors=1 plans (LOCF.interior, collected as each building is furnished) takes the room's column of the KROOMLIGHT
   table and the indoor mask, so its walls and furniture are lit by the room's daylight and lamp ambience, not the sky's;
   the sun's share follows the night light volume's night (NLV_U.uNlNight). New rooms and new furniture are tagged as they
   come. ?roomlight=0 shows the page as it was. */
var LOCF_RL_ROOMS = [];
if(typeof LOCF !== 'undefined' && LOCF.interior){ var _locfInterior = LOCF.interior;
  LOCF.interior = function(){ var fi = _locfInterior.apply(this, arguments); if(fi && fi.result && fi.result.inst) LOCF_RL_ROOMS.push.apply(LOCF_RL_ROOMS, fi.result.inst.rooms); return fi; }; }
(function(){
  if(typeof KRLHOST === 'undefined' || typeof LOCF === 'undefined' || !LOCF.interiors) return;
  function start(){ if(typeof scene === 'undefined' || !scene || !scene.children.length){ setTimeout(start, 500); return; }
    window.LOCUS_RL = KRLHOST.wirePage({ scene:scene, rooms:function(){ return LOCF_RL_ROOMS; },
      table:function(L){ return KratorInteriors.roomLight(L); },
      sunUp:function(){ return 1 - NLV_U.uNlNight.value; } }); }
  setTimeout(start, 0);
})();
