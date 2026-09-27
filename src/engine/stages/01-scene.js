// ---------- scene: renderer, camera, the sun's day, sky ----------
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,Math.max(1,WORLD*0.5),24000*WORLD);
const renderer=createRenderer(THREE,{pixelCap:1.5});installContextLoss(renderer);
// quality: ?quality=low|medium|high, or the city's own default. Low drops shadows entirely, which on a
// weak GPU is worth more than everything else put together.
const QUALITY=(()=>{const v=(new URLSearchParams(location.search).get('quality')||C.quality||'high').toLowerCase();
  return ['low','medium','high'].includes(v)?v:'high';})();
ctx.quality=QUALITY;
renderer.shadowMap.enabled=QUALITY!=='low';renderer.shadowMap.type=THREE.PCFShadowMap;
const {ENV,setEnv}=createEnv();   // the shared uniforms; setEnv gives materials world-unit UV tiling
const updatePx=()=>{ENV.izPx.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));};updatePx();
const ambient=new THREE.AmbientLight(0x9fb4c8,0.22);scene.add(ambient);
const hemi=new THREE.HemisphereLight(0xbfd8f0,0x5a5048,0.38);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff2dc,1.1);scene.add(sun);scene.add(sun.target);
sun.castShadow=QUALITY!=='low';{const m=QUALITY==='high'?2048:1024;sun.shadow.mapSize.set(m,m);}
{const r=QUALITY==='high'?700:520,sc=sun.shadow.camera;sc.left=-r;sc.right=r;sc.top=r;sc.bottom=-r;sc.near=1;sc.far=6000;sc.updateProjectionMatrix();}
// Shadow acne: on a city of flat roofs and vertical walls a two-metre normal bias is plenty, but a valley
// six hundred metres deep is nearly all steeply sloped ground, and at a low sun the terrain self-shadows
// into a set of contour stripes down every wall. A city with that much relief says so.
sun.shadow.bias=(C.shadowBias===undefined?-0.0008:C.shadowBias);
sun.shadow.normalBias=(C.shadowNormalBias===undefined?2:C.shadowNormalBias);
scene.fog=new THREE.FogExp2(0xb9cbe0,C.fog||0.00013);
const OVERCAST=C.overcast||0;   // a flat, sunless sky: less sun, more fill (Vashrin)
// the clock: DAY real seconds per city day
// a city that is only ever seen after dark opens there
let DAY=240;const HOUR0=(typeof C.defaultHour==='number')?C.defaultHour:10.5;
let clockPaused=false,pausedAt=0,clockOffset=0;
function hourNow(now){return ((HOUR0+((now/1000)/(DAY/24)))%24+24)%24;}
function setHour(h){const now=performance.now(),cur=clockPaused?pausedAt:now-clockOffset,tot=HOUR0+(cur/1000)/(DAY/24);let day=Math.floor(tot/24);if(day*24+h<HOUR0)day+=1;const t=(day*24+h-HOUR0)*(DAY/24)*1000;if(clockPaused)pausedAt=t;else clockOffset=now-t;}
window.setHour=setHour;
const nightF=h=>1-smooth(5.6,7.4,h)+smooth(17.6,19.6,h);   // ~1 at night, 0 by day (Chicago, spring)
const LIT=C.litWindows===undefined?1:C.litWindows;   // how much of the city keeps its lights on after dark
const windowF=h=>LIT*(smooth(16.5,18.5,h)*(1-smooth(23,25,h))+0.12*nightF(h));
// the sun: rises in the east over the lake (+x), sets in the west
function sunAt(h){const f=(h-6)/12,E=Math.sin(Math.PI*f)*0.95,az=Math.PI*(1-f);return new THREE.Vector3(Math.cos(az)*Math.cos(E),Math.sin(E),Math.sin(az)*0.35*Math.cos(E)).normalize();}
// sky: a gradient dome, coloured by the hour
const SKY=(()=>{const D={day:{top:0x2f6fd0,hor:0xbcd3ee},dusk:{top:0x2a3a78,hor:0xf0a060},night:{top:0x050a1c,hor:0x16243c}},hx=v=>typeof v==='string'?parseInt(v.slice(1),16):v;
  for(const k in (C.sky||{}))for(const q in C.sky[k])D[k][q]=hx(C.sky[k][q]);return D;})();   // the city's own sky, if its config gives one
const skyM=new THREE.ShaderMaterial({uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunA:{value:1}},side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  // vP is interpolated across the dome's faces, so it has to be renormalised here: using it raw makes the
  // gradient follow the sphere's tessellation, which on a country-sized map shows up as a polygon in the sky.
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 sunDir;uniform float sunA;varying vec3 vP;void main(){vec3 dir=normalize(vP);float t=clamp(dir.y*1.6,0.0,1.0);vec3 c=mix(hor,top,pow(t,0.6));float d=max(dot(dir,sunDir),0.0);c+=vec3(1.0,0.85,0.6)*(pow(d,600.0)*1.2+pow(d,8.0)*0.18)*sunA;gl_FragColor=vec4(c,1.0);}'});
// The backdrop has to be the outermost thing drawn, and it has to stay inside the far plane from anywhere on
// the map. The dome is centred on the world origin, so the camera can be half a map diagonal away from its
// centre before you even count altitude: size it by what is left of the far plane after that, or the far side
// of the dome is clipped away and the clear colour shows through along the sphere's own facets.
// Order is: horizon ring < sky dome < far plane.
const SKY_R=Math.max(2000,(camera.far-Math.hypot(B.w,B.d)/2)*0.92);ctx.skyR=Math.round(SKY_R);
const sky=new THREE.Mesh(new THREE.SphereGeometry(SKY_R,32,16),skyM);sky.userData.noShadow=true;sky.userData.noWire=true;sky.renderOrder=-1;scene.add(sky);   // the dome is not part of the model, so the wireframe leaves it alone
const tmpC=new THREE.Color(),tmpC2=new THREE.Color();
function lerpSky(h){const n=nightF(h),dusk=Math.max(0,1-Math.abs(h-18.6)/1.6,1-Math.abs(h-6.3)/1.4);
  const mixTo=(a,b,k)=>tmpC.set(a).lerp(tmpC2.set(b),k);
  skyM.uniforms.top.value.copy(mixTo(SKY.day.top,SKY.night.top,n)).lerp(tmpC2.set(SKY.dusk.top),dusk*0.7);
  skyM.uniforms.hor.value.copy(mixTo(SKY.day.hor,SKY.night.hor,n)).lerp(tmpC2.set(SKY.dusk.hor),dusk);
  scene.fog.color.copy(skyM.uniforms.hor.value);renderer.setClearColor(skyM.uniforms.hor.value);
  const S=sunAt(h);skyM.uniforms.sunDir.value.copy(S);skyM.uniforms.sunA.value=(S.y>-0.05?1:0)*(C.sunGlare===undefined?1:C.sunGlare);   // a land under cloud never shows its disc
  sun.position.copy(S).multiplyScalar(2500).add(sun.target.position);sun.intensity=0.82*(1-0.72*OVERCAST)*Math.max(0,Math.min(1,S.y*4))*(1-0.85*n);
  sun.color.setHSL(0.09,0.6-0.4*OVERCAST,0.5+0.45*Math.min(1,S.y*3));hemi.intensity=0.38*(1+0.5*OVERCAST)*(1-0.75*n);ambient.intensity=(0.22+0.2*OVERCAST)*(1-0.5*n)+0.1*n;
  ENV.izHour.value=h;ENV.izNight.value=n;ENV.izDay.value=1-n;ENV.izSunDir.value.copy(S);}
// low-lying industrial haze: broad sheets over the city, so from any height the place sits under its own smog
if(C.smog){const S=C.smog,base=S.height||90;
  const smogM=new THREE.MeshBasicMaterial({color:new THREE.Color(S.colour||'#b0aa96'),transparent:true,opacity:0.1,depthWrite:false,side:THREE.DoubleSide,fog:false});
  for(let k=0;k<(S.layers||2);k++){const pl=new THREE.Mesh(new THREE.PlaneGeometry(B.w*1.6,B.d*1.6),smogM);
    pl.rotation.x=-Math.PI/2;pl.position.set(B.cx,base*(0.55+k*0.7),B.cz);pl.renderOrder=-1;pl.userData.noShadow=true;scene.add(pl);}
  animHooks.push(()=>{smogM.opacity=(S.opacity||0.1)*(0.55+0.45*(1-nightF(hourCur)));});}
let hourCur=HOUR0;
animHooks.push(now=>{hourCur=hourNow(clockPaused?pausedAt:now-clockOffset);ctx.hour=hourCur;ENV.izTime.value=now/1000;lerpSky(hourCur);});
lerpSky(HOUR0);
Object.assign(API,{scene,camera,renderer,sun,ambient,hemi,sky,ENV,nightF,windowF,hour:()=>hourCur});
