/* ============================== 17. THE SUMMIT ==============================
   PLANNER-OWNED. "District buildings are not built on the upper surface of the butte, but there is a ruined
   spaceport there in the Ancient architecture style." One hand-placed landmark from the Ancients port.      */
reseed(650001);
var SUMMIT_PORT = null, SUMMIT_ANTENNAE = [];
(function(){
  if(SHEET || !ASSET_BY_KEY.ancient_starport_ruin) return;
  SUMMIT_PORT = buildAsset('ancient_starport_ruin', BUTTE.x, BUTTE.z, 0.35, { y: GROUND0 + BUTTE.H + 1.6, variant:0, seed:65 });
  /* THE PORT'S ANTENNA FARM. Three dishes and a radar mast, all ruined, standing on the
     levelled summit where the Ancients set them — hand-placed from coordinates picked off
     the plateau, so they sit clear of the starport's own wreck. */
  var SUMMIT_KIT = [
    ['ancient_dish',  113.6, 489.1, 0.6],
    ['ancient_dish',  -20.4, 704.8, 2.3],
    ['ancient_dish', -139.8, 536.8, 4.1],
    ['ancient_radar',  96.3, 638.3, 1.2]
  ];
  SUMMIT_ANTENNAE = SUMMIT_KIT.map(function(K, i){
    var A=ASSET_BY_KEY[K[0]]; if(!A) return null;
    var ruin = A.variantNames ? A.variantNames.length-1 : A.variants-1;   /* the ruin is always last */
    var y = butteTopY(K[1], K[2]) + GROUND0 - 1.0;
    return buildAsset(K[0], K[1], K[2], K[3], { y:y, variant:ruin, seed:6500+i*37 });
  }).filter(Boolean);
  window._summit = { port:!!SUMMIT_PORT, antennae:SUMMIT_ANTENNAE.length };
  REGISTER({ name:'Summit plateau', kind:'landform', label:'levelled by the Ancients for their port', x:BUTTE.x, y:GROUND0+BUTTE.H-8, z:BUTTE.z, r:BUTTE.rTop*1.05, h:12 });
})();
