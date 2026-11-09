/* ============================== KIT SHEET: THE SKY ==============================
   core/atmos/placeholder's KratorSky (80-sky-hash.js, 81-sky.js, read in place: the placeholder sky for kit viewers, its
   README) in a scene of its own about the origin, drawn under the world (98-ys-take.js ysDraw), as core/engine's
   90-scene.js does for the Scyvoi kits. It sets the stage's two lights (20-ys-stage.js) and the fog; ?hour= picks the hour. */
var YS = { hour: +((/[?&]hour=([\d.]+)/.exec(location.search)||[])[1] || 10.5), day: 200, dens: 1.6 };
var ysSkyScene = new THREE.Scene(), ysSkyCam = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 1, 9000);
KratorSky.attach(ysSkyScene, 4200);
var ysSunDir = new THREE.Vector3(0.4, 0.7, -0.3).normalize();
function ysSkyApply(){
  KratorSky.update(new THREE.Vector3(), YS.hour, YS.day, YS.dens);
  var L = KratorSky.lighting();
  ysSunDir.copy(L.sunDir.y > 0.02 ? L.sunDir : new THREE.Vector3(0.3, 0.6, -0.4).normalize());
  if(L.sunColor) sun.color.copy(L.sunColor);
  sun.intensity = L.sunDir.y > 0.02 ? L.sunIntensity*1.1 : 0.05;
  hemiLight.intensity = 0.30 + L.ambient*0.80;
  scene.fog.color.copy(L.fog);
}
ysSkyApply();
addEventListener('resize', function(){ ysSkyCam.aspect = innerWidth/innerHeight; ysSkyCam.updateProjectionMatrix(); });
