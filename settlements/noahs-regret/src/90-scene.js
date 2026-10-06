// ================================================================= SCENE: renderer, the standard Krator sky, the shore and the sea, (re)building the world
const renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.autoClear=false;document.body.appendChild(renderer.domElement);
TEXANISO=Math.max(1,Math.min(8,renderer.capabilities.getMaxAnisotropy()||1));for(const k in NR_LIBTEX)for(const t of Object.values(NR_LIBTEX[k]))if(t)t.anisotropy=TEXANISO;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xc4d0d4,.00042);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.2,12000);
/* the standard Krator sky (81-sky.js, vendored from Iziz) in its own scene, so core/atmos's skylight can capture it into
   the environment map every standard material reflects (core/atmos/README.md) */
const skyScene=new THREE.Scene(),skyCam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
KratorSky.attach(skyScene,5200);
const SKY={hour:10.5,day:200,dens:1.4,night:false};
const qs=new URLSearchParams(location.search);if(qs.get('hour'))SKY.hour=+qs.get('hour');
const hemi=new THREE.HemisphereLight(0xe8f0f4,0x8a7a62,.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);{const c=sun.shadow.camera;c.left=-150;c.right=150;c.top=150;c.bottom=-150;c.near=10;c.far=1400;}sun.shadow.bias=-.0004;sun.shadow.normalBias=.4;
const LIGHTDIR=new THREE.Vector3(.4,.7,.3).normalize();
function skyApply(){KratorSky.update(new THREE.Vector3(),SKY.hour,SKY.day,SKY.dens);const L=KratorSky.lighting();
 LIGHTDIR.copy(L.sunDir.y>.02?L.sunDir:new THREE.Vector3(.3,.6,-.4).normalize());sun.color.copy(L.sunColor||new THREE.Color(1,.95,.86));
 sun.intensity=L.sunDir.y>.02?L.sunIntensity*1.05:.05;hemi.intensity=.32+L.ambient*.75;scene.fog.color.copy(L.fog);
 nrWaterUni.uSun.value.copy(LIGHTDIR);nrWaterUni.uFogCol.value.copy(L.fog);nrWaterUni.uSky.value.copy(L.fog).lerp(new THREE.Color(.75,.85,.92),.4);
 nrWaterUni.uBodyK.value=L.sunDir.y>.02?1:.35;}
skyApply();
const groundM=nrGroundMesh();scene.add(groundM);
const seaM=nrSeaMesh();scene.add(seaM);
// ---------------------------------------------------------------- (re)build the world
// One site: the arcology, at the world origin, its keel NR_SEA_H below the sea. Its def pushes the hull frame and builds
// everything it holds (40-6x); the furnishing pass (70-nr-interiors.js) runs after, on the plan's rooms.
const SITES=[{key:'nr-arcology',x:0,z:0,ry:0,o:{y:-NR_SEA_H}}];
const ONLY=qs.get('only');
let WORLD=null,HULLG=null;
function buildWorld(){if(WORLD){scene.remove(WORLD);WORLD.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 WORLD=new THREE.Group();scene.add(WORLD);GB={};GTARGET=GB;REG.length=0;halosReset();SMOKES=[];GSTAT.tris=0;SBS.length=0;SB=null;resetCM();if(!SVTAGS)svTagsReset();   /* 91f-furnish.js wraps this and starts the registry */
 /* everything in the hull frame is drawn into HULLG, a group carrying NR_HULL: the geometry engine still writes world
    coordinates (place() composes the matrix), so HULLG itself stays at the identity; it is the cut-away's set */
 HULLG=new THREE.Group();HULLG.name='arcology';WORLD.add(HULLG);
 const t0=performance.now();
 for(const S of SITES)place(S.key,S.x,S.z,S.ry||0,S.o);
 flushBuckets(GB,HULLG,true);
 window._build={ms:Math.round(performance.now()-t0),tris:Math.round(GSTAT.tris),records:REG.length,halos:HALOS.length};return WORLD;}
/* the sky's light on the library materials and the wave clock: core/atmos */
const ATMOS_HOOKS=[];function atmosFrame(dt){for(const f of ATMOS_HOOKS)f(dt);}
ATMOS.init({THREE,scene,camera,hour:()=>SKY.hour,onFrame:fn=>ATMOS_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:4471,err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
ATMOS.waveUniforms(nrWaterUni);
const ATMOS_GROUND=new THREE.Color();
ATMOS.skylight({renderer,sky:skyScene,scene,ground:()=>ATMOS_GROUND.copy(hemi.groundColor).multiplyScalar(hemi.intensity),key:()=>SKY.night?'n':'d'});
