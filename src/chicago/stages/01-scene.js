// ---------- scene: renderer, camera, the sun's day, sky ----------
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const {ENV,setEnv}=createEnv();   // the shared uniforms; setEnv gives materials world-unit UV tiling
const updatePx=()=>{ENV.izPx.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));};updatePx();
const ambient=new THREE.AmbientLight(0x9fb4c8,0.35);scene.add(ambient);
const hemi=new THREE.HemisphereLight(0xbfd8f0,0x5a5048,0.55);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2dc,1.1);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const sc=sun.shadow.camera;sc.left=-700;sc.right=700;sc.top=700;sc.bottom=-700;sc.near=1;sc.far=4000;sc.updateProjectionMatrix();}
sun.shadow.bias=-0.0008;sun.shadow.normalBias=2;
scene.fog=new THREE.FogExp2(0xb9cbe0,0.00022);
// the clock: DAY real seconds per city day
let DAY=240;const HOUR0=10.5;let clockPaused=false,pausedAt=0,clockOffset=0;
function hourNow(now){return ((HOUR0+((now/1000)/(DAY/24)))%24+24)%24;}
function setHour(h){const now=performance.now(),cur=clockPaused?pausedAt:now-clockOffset,tot=HOUR0+(cur/1000)/(DAY/24);let day=Math.floor(tot/24);if(day*24+h<HOUR0)day+=1;const t=(day*24+h-HOUR0)*(DAY/24)*1000;if(clockPaused)pausedAt=t;else clockOffset=now-t;}
window.setHour=setHour;
const nightF=h=>1-smooth(5.6,7.4,h)+smooth(17.6,19.6,h);   // ~1 at night, 0 by day (Chicago, spring)
const windowF=h=>smooth(16.5,18.5,h)*(1-smooth(23,25,h))+0.12*nightF(h);
// the sun: rises in the east over the lake (+x), sets in the west
function sunAt(h){const f=(h-6)/12,E=Math.sin(Math.PI*f)*0.95,az=Math.PI*(1-f);return new THREE.Vector3(Math.cos(az)*Math.cos(E),Math.sin(E),Math.sin(az)*0.35*Math.cos(E)).normalize();}
// sky: a gradient dome, coloured by the hour
const SKY={day:{top:0x2f6fd0,hor:0xbcd3ee},dusk:{top:0x2a3a78,hor:0xf0a060},night:{top:0x050a1c,hor:0x16243c}};
const skyM=new THREE.ShaderMaterial({uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunA:{value:1}},side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 sunDir;uniform float sunA;varying vec3 vP;void main(){float t=clamp(vP.y*1.6,0.0,1.0);vec3 c=mix(hor,top,pow(t,0.6));float d=max(dot(vP,sunDir),0.0);c+=vec3(1.0,0.85,0.6)*(pow(d,600.0)*1.2+pow(d,8.0)*0.18)*sunA;gl_FragColor=vec4(c,1.0);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(5500,32,16),skyM);sky.userData.noShadow=true;scene.add(sky);
const tmpC=new THREE.Color(),tmpC2=new THREE.Color();
function lerpSky(h){const n=nightF(h),dusk=Math.max(0,1-Math.abs(h-18.6)/1.6,1-Math.abs(h-6.3)/1.4);
  const mixTo=(a,b,k)=>tmpC.set(a).lerp(tmpC2.set(b),k);
  skyM.uniforms.top.value.copy(mixTo(SKY.day.top,SKY.night.top,n)).lerp(tmpC2.set(SKY.dusk.top),dusk*0.7);
  skyM.uniforms.hor.value.copy(mixTo(SKY.day.hor,SKY.night.hor,n)).lerp(tmpC2.set(SKY.dusk.hor),dusk);
  scene.fog.color.copy(skyM.uniforms.hor.value);renderer.setClearColor(skyM.uniforms.hor.value);
  const S=sunAt(h);skyM.uniforms.sunDir.value.copy(S);skyM.uniforms.sunA.value=S.y>-0.05?1:0;
  sun.position.copy(S).multiplyScalar(2500).add(sun.target.position);sun.intensity=1.15*Math.max(0,Math.min(1,S.y*4))*(1-0.85*n);
  sun.color.setHSL(0.09,0.6,0.5+0.45*Math.min(1,S.y*3));hemi.intensity=0.55*(1-0.75*n);ambient.intensity=0.35*(1-0.5*n)+0.12*n;
  ENV.izHour.value=h;ENV.izNight.value=n;ENV.izDay.value=1-n;ENV.izSunDir.value.copy(S);}
let hourCur=HOUR0;
animHooks.push(now=>{hourCur=hourNow(clockPaused?pausedAt:now-clockOffset);ctx.hour=hourCur;ENV.izTime.value=now/1000;lerpSky(hourCur);});
lerpSky(HOUR0);
