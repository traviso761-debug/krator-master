/* ============================== KIT SHEET: THE STAGE ==============================
   The kit sheet's scene (kits/yuni/build.py; README.md, "Its own sheet"). Not Yuni's 20-stage.js: no baked horizon, no
   volcano, no eruption cycle. The scene, the camera and the renderer the engine draws into (45-kit.js emits into `scene`;
   FAST is read by 45-kit.js and 47-texture.js) and two lights the placeholder sky drives (82-ys-sky.js, which sorts after
   core/atmos/placeholder's 81-sky.js: KratorSky is a const). Interface the engine and the kits read:
     scene camera renderer FAST sun hemiLight                                                                           */
var FAST = !!(navigator.webdriver) || /[?&]fast/.test(location.search);   /* headless (verify.py): no shadows, no antialias */

var scene = new THREE.Scene();
window.scene = scene;
scene.fog = new THREE.FogExp2(0xc9c2b0, 0.00028);
var camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.4, 12000);
var renderer = new THREE.WebGLRenderer({ antialias:!FAST, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio||1, FAST?1:1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.autoClear = false;                 /* the sky's pass, then the world over it (YS.draw) */
if(!FAST){ renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
document.body.appendChild(renderer.domElement);
window.renderer = renderer; window.camera = camera;

/* the lights: the placeholder sky sets their colour and strength (ysSkyApply); the sun's shadow box follows the orbit target */
var sun = new THREE.DirectionalLight(PAL.sunColor, PAL.sunIntensity);
if(!FAST){ sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  var ysShadowCam = sun.shadow.camera; ysShadowCam.left=-120; ysShadowCam.right=120; ysShadowCam.top=120; ysShadowCam.bottom=-120; ysShadowCam.near=10; ysShadowCam.far=900;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.5; }
scene.add(sun); scene.add(sun.target);
var hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, PAL.hemiIntensity);
scene.add(hemiLight);

