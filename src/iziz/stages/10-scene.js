// ---------- scene ----------
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x2a2878,0.00105);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,1,7000);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const updatePx=()=>{ENV.izPx.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));};updatePx();
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const ambient=new THREE.AmbientLight(0x5d5cb8,0.85);scene.add(ambient);
const hemi=new THREE.HemisphereLight(0x4a48c0,0x5a3a1a,0.45);scene.add(hemi);
// day/night: DAY seconds per full day, 12h light / 12h dark. The sun's path is tuned so that at 15:00 it sits where it does in the painting.
let DAY=120;const HOUR0=15;let clockPaused=false,pausedAt=0,clockOffset=0;
function hourNow(now){return ((HOUR0+((now/1000)/(DAY/24)))%24+24)%24;}
// schedule curves (hour -> 0..1)
const ss=(a,b,x)=>smooth(a,b,x);
const nightF=h=>1-ss(5.5,7.2,h)+ss(17.2,18.8,h);                       // ~1 at night, 0 by day
const windowF=h=>ss(17.3,19.2,h)*(1-ss(22,24,h));                      // interior lights: on at dusk, mostly out by midnight
const showF=h=>ss(7.7,8.3,h)*(1-ss(21.7,22.3,h));                      // arena: 08:00-22:00
const concertF=h=>ss(16.8,17.2,h)*(1-ss(21.8,22.2,h));                 // park concert: 17:00-22:00
const arenaLightF=h=>ss(17,18.5,h)*(1-ss(22,23,h));                    // arena floodlights: evening session
function sunAt(h){const f=(h-6)/12,E=Math.sin(Math.PI*f)*0.62,az=1.99+Math.PI*f;return new THREE.Vector3(Math.cos(az)*Math.cos(E),Math.sin(E),Math.sin(az)*Math.cos(E)).normalize();}
const sunDir=sunAt(HOUR0);
const sun=new THREE.DirectionalLight(0xffc4a0,1.0);sun.position.copy(sunDir).multiplyScalar(400);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-260;sc.right=260;sc.top=260;sc.bottom=-260;sc.near=1;sc.far=1400;sc.updateProjectionMatrix();
sun.shadow.bias=-0.0006;sun.shadow.normalBias=1.2;
const moonDir=new THREE.Vector3(-0.22,0.48,-0.85).normalize();
const moonLight=new THREE.DirectionalLight(0x8fa8e0,0.22);moonLight.position.copy(moonDir).multiplyScalar(400);scene.add(moonLight);
