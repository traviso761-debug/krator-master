/* ============================== BROOK WATER: the brook on core/water ==============================
   core/water Phase 3 (core/water/README.md): the brook is one WATER.flow along the channel's arc-length stations, its
   surface at the stepped level JUNGLE_BROOK.level gives (pools and the cascade's steps), as wide as the nominal channel
   (riverHalfAt) with RIVER_EDGE metres lapped under the banks. WATER.drawFlow draws the ribbon: ripples carried down the
   current, white where the bed steepens (the cascade) and along the banks, the sky in it from core/atmos's skylight.
   It replaces the page's own ribbon shader (75-terrain.js), which carried a hand-written time, sun and fog uniform set.
   Loaded after 90-atmos-host.js: the water needs ATMOS.init and its skylight. CPU twins: WATER.heightAt, WATER.flowAt. */
var BROOK_FLOW = (function(){
  var S = brookStations(0, RIVER_LEN-0.02, false), pts = [], wid = [], spd = [];
  for(var i = 0; i < S.length; i++){
    var s = S[i], R = riverAt(s);
    pts.push([R.x, R.z, brookLevelAt(s)]);
    wid.push(2*riverHalfAt(s));
    spd.push(1.2 + 3.0*cataractK(s));                      /* m/s: the brook runs faster over the cascade */
  }
  return WATER.flow({ name:'The brook', pts:pts, width:wid, speed:spd });
})();
var BROOK_DRAW = WATER.drawFlow(BROOK_FLOW, {
  shallow:new THREE.Color(PAL.riverShallow).convertSRGBToLinear(), deep:new THREE.Color(PAL.riverDeep).convertSRGBToLinear(),
  color:0xffffff, roughness:0.12, metalness:0.05, envMapIntensity:0.5, step:4, across:6, margin:RIVER_EDGE });
BROOK_DRAW.mesh.userData.inspectLabel = 'Brook';
if(window._brook) window._brook.waterTris = BROOK_DRAW.mesh.geometry.index.count/3;
