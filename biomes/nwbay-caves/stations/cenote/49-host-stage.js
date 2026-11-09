// ================================================================= HOST — stage: the cave under the NE cenote (renderer, light, the eye's floor, BIO.init)
// The cave is CAVE's (48): this fragment makes the page round it. THE LIGHT: the cenote's daylight falling down its shaft into the water (a spot; its
// cone is core/atmos's, 89x), the diver's lamp (a spot on the camera; ?lamp=0 off), a faint blue fill. THE WATER: under the table (0) the eye is in
// the sea: a close blue-green haze; over it, in the shaft, warm humid air (the haze switched by the eye's height each frame, 89x). ?exposure=.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const Q=new URLSearchParams(location.search);
const WS=SITE.water,CE=CAVE.cenote;

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):1.05;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(WS.fog);scene.background=HAZE.clone();scene.fog=new THREE.FogExp2(WS.fog,WS.fogD);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.2,1400);scene.add(camera);
const HEMI=new THREE.HemisphereLight(0x5f9aa0,0x0c2428,.32);scene.add(HEMI);
/* the cenote's daylight: one spot from over the rim down the shaft onto the bell's floor, the sun high (the hour's daylight scales it, 89x) */
const CENOTE_SUN=(function(){const s=new THREE.SpotLight(0xfff4e0,4.2,120,.42,.6,1.0);s.position.set(CE.x+4,CE.rim+14,CE.z-3);s.target.position.set(CE.x,CE.floor,CE.z);
 scene.add(s);scene.add(s.target);return s;})();
/* the diver's lamp: a white spot riding the camera (?lamp=0 off) */
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xf0f8ff,3.4,70,.48,.5,1.3);s.position.set(0,.2,0);camera.add(s);s.target.position.set(0,-.1,-1);camera.add(s.target);return s;})();

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// core/terrain's KCAVERN.floorFn from under the passages up to the rim: in the cave the eye swims (the floor only stops it going into the rock); a
// column of rock reads the cave's level. waterH is the table wherever the floor is under it
const STOREY_Y=SITE.net.level;
const terrainH=KCAVERN.floorFn(CAVE.C,{from:STOREY_Y-6,to:CE.rim+1,fallback:STOREY_Y});
const inBox=(x,z)=>x>CAVE.box[0]&&x<CAVE.box[2]&&z>CAVE.box[1]&&z<CAVE.box[3];
function waterH(x,z){return inBox(x,z)&&terrainH(x,z)<WS.level?WS.level:-1e9;}
const groundEye=(x,z)=>terrainH(x,z);

BIO.init({tags:'nwbay-caves',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:76,
 origin:[CAVE.centre].concat(CAVE.N2.chambers.map(c=>[c.c[0],c.c[2]])),center:CAVE.centre,fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
