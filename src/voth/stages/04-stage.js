/* ==== 4. STAGE ==== */
reseed(200001);

var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);

var scene = new THREE.Scene();
window._vothScene = scene;   /* for the layout fingerprint the tests check, taken right after BUILD() */
window.scene = scene;

var HAZE = new THREE.Color(PAL.haze);
scene.fog = new THREE.FogExp2(HAZE.getHex(), PAL.fogDensity);
scene.background = HAZE.clone();

var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.9, 26000);
var renderer = createRenderer(THREE, { antialias:!FAST, pixelCap:FAST?1:1.75 });   /* the page shell, src/core/shell.js */
installContextLoss(renderer);
renderer.outputEncoding = THREE.sRGBEncoding;
if(!FAST){
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
window.renderer = renderer;

/* --- light: ashen Vvardenfell daylight, sun high in the south-east --- */
var SUNDIR = new THREE.Vector3(0.56, 0.60, 0.57).normalize();
var MOONDIR = new THREE.Vector3(-0.52, 0.40, -0.75).normalize();

var sun = new THREE.DirectionalLight(PAL.sunColor, PAL.sunIntensity);
sun.position.copy(SUNDIR).multiplyScalar(1900);
if(!FAST){
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  var sc = sun.shadow.camera;
  sc.left=-1250; sc.right=1250; sc.top=1250; sc.bottom=-1250; sc.near=600; sc.far=4200;
  sun.shadow.bias = -0.0009;
  sun.shadow.normalBias = 1.2;
}
scene.add(sun);
var hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, PAL.hemiIntensity);
scene.add(hemiLight);
var ambLight = new THREE.AmbientLight(PAL.ambient, PAL.ambientIntensity);
scene.add(ambLight);
