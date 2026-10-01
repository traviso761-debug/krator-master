// Scene shell; shared Krator sky, sunrise preset, one registered kit gallery.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x8a9cab,.0008);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
const JJ_HEMI=new THREE.HemisphereLight(0xffe9d6,0x46413a,.62);scene.add(JJ_HEMI);
const JJ_SUN=new THREE.DirectionalLight(0xffefce,1.2);scene.add(JJ_SUN);scene.add(JJ_SUN.target);
const JJ_FILL=new THREE.DirectionalLight(0x9dc9ef,.28);JJ_FILL.position.set(320,210,-340);scene.add(JJ_FILL);
const FRAME_HOOKS=[];const SITE_GROUPS=[];let sky,giant,groundM,LABELS;
sky=KratorSky.attach(scene,5000);giant=null;
// Showcase light: a summer morning (Krator day 350 is the southern summer solstice; the sky module puts
// the city at 40 deg S, so the sun stands in the north and lights the north-facing fronts).
const JJ_SOLAR={setting:'day',hour:10.5,day:350,density:1.6};const JJ_SOLAR0={hour:JJ_SOLAR.hour,day:JJ_SOLAR.day};
// a view may carry {hour,day}; any other view restores the showcase light
function jjApplyViewSky(jjSky){JJ_SOLAR.hour=jjSky&&jjSky.hour!=null?jjSky.hour:JJ_SOLAR0.hour;JJ_SOLAR.day=jjSky&&jjSky.day!=null?jjSky.day:JJ_SOLAR0.day;}
KratorSky.update(camera.position,JJ_SOLAR.hour,JJ_SOLAR.day,JJ_SOLAR.density);
const JJ_LIGHT0=KratorSky.lighting();JJ_SUN.position.copy(JJ_LIGHT0.sunDir).multiplyScalar(800);JJ_SUN.intensity=JJ_LIGHT0.sunIntensity*.78;JJ_SUN.color.copy(JJ_LIGHT0.sunColor);JJ_HEMI.intensity=Math.max(.5,JJ_LIGHT0.ambient+.18);scene.fog.color.copy(JJ_LIGHT0.fog);
FRAME_HOOKS.push(()=>{KratorSky.update(camera.position,JJ_SOLAR.hour,JJ_SOLAR.day,JJ_SOLAR.density);const JJ_L=KratorSky.lighting();JJ_SUN.position.copy(camera.position).addScaledVector(JJ_L.sunDir,800);JJ_SUN.target.position.copy(camera.position);JJ_SUN.intensity=JJ_L.sunIntensity*.78;JJ_SUN.color.copy(JJ_L.sunColor);JJ_HEMI.intensity=Math.max(.5,JJ_L.ambient+.18);scene.fog.color.copy(JJ_L.fog);});
const JJ_GROUND_MAT=new THREE.MeshStandardMaterial({color:jjColor(0xa88d6c),roughness:1});
groundM=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),JJ_GROUND_MAT);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.08,GROUND_C);groundM.userData.probeSkip=true;groundM.userData.isGround=true;scene.add(groundM);
// SITES is declared by targets/kit/89z-rows.js and consumed in sorted fragment order.
for(const S of SITES){const K=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=K;const G=JJ.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});TSTAT.cur=null;}
for(const S of JJ_FURN_SITES){JJFURN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);}
for(const S of JJ_FLORA_SITES){JJFLORA.place(scene,S.key,S.x,S.z,S.ry||0,S.o);}
window._registered=REG.length;kbake(scene);
// Sun shadows: a 260 m box that follows the orbit target, so loggias, arches and cornices read.
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
JJ_SUN.castShadow=true;JJ_SUN.shadow.mapSize.set(2048,2048);JJ_SUN.shadow.bias=-.0004;JJ_SUN.shadow.normalBias=.04;
{const jjSc=JJ_SUN.shadow.camera;jjSc.left=-130;jjSc.right=130;jjSc.top=130;jjSc.bottom=-130;jjSc.near=10;jjSc.far=1800;jjSc.updateProjectionMatrix();}
scene.traverse(jjO=>{if(!jjO.isMesh||jjO.material.type==='ShaderMaterial')return;if(jjO.userData.isGround){jjO.receiveShadow=true;return;}jjO.castShadow=true;jjO.receiveShadow=true;});
FRAME_HOOKS.push(()=>{const jjT=(typeof ctl!=='undefined'&&ctl.target)?ctl.target:camera.position;const jjL=KratorSky.lighting();JJ_SUN.target.position.copy(jjT);JJ_SUN.position.copy(jjT).addScaledVector(jjL.sunDir,800);JJ_SUN.target.updateMatrixWorld();});
