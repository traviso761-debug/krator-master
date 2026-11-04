// ================================================================= HOST — stage: the Cave of Crystals (renderer, light, the floor the eye stands on, BIO.init)
// The cave is CAVE's (48): this fragment makes the page round it. THE LIGHT, as the references have it: no sun but what the vents let down their
// throats, the hot water's dull glow up each feeder well, and the visitor's own lamp (a spot on the camera; ?lamp=0 off). The air is warm and wet:
// a close brown haze (the fog here, height fog in 89x). ?exposure= sets the exposure.
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

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=Q.has('exposure')?+Q.get('exposure'):1.0;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0x34261b);scene.background=HAZE.clone();scene.fog=new THREE.FogExp2(HAZE.getHex(),.014);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.2,1400);scene.add(camera);
const HEMI=new THREE.HemisphereLight(0x8a6a4c,0x2c1c12,.3);scene.add(HEMI);
/* the vents' daylight: one spot down the throats' middle onto the great chamber's floor (each throat's own shaft of light is a cone, 89x) */
const VENT_SUN=(function(){const T=CAVE.throats;if(!T.length)return null;const x=T.reduce((a,t)=>a+t.c[0],0)/T.length,z=T.reduce((a,t)=>a+t.c[1],0)/T.length,g=Math.max(...T.map(t=>t.ground));
 const s=new THREE.SpotLight(0xfff0d8,3.2,90,.62,.75,1.1);s.position.set(x,g+2,z);s.target.position.set(x+3,CAVE.focus.c[1],z+2);scene.add(s);scene.add(s.target);return s;})();
/* the hot water's glow up each feeder well: dull orange, from the well's mouth */
const WELL_GLOW=CAVE.wells.map(W=>{const p=new THREE.PointLight(0xff9a50,1.6,34,1.6);p.position.set(W.c[0],W.mouth+1.2,W.c[1]);scene.add(p);return p;});
/* the visitor's lamp: a warm white spot riding the camera (?lamp=0 off) */
const LAMP=Q.get('lamp')==='0'?null:(function(){const s=new THREE.SpotLight(0xfff2e2,3.2,110,.5,.55,1.2);s.position.set(0,.25,0);camera.add(s);s.target.position.set(0,-.1,-1);camera.add(s.target);return s;})();

// ---------------------------------------------------------------- the floor the eye stands on (and BIO's ground)
// The lowest open point at (x, z) from just under the water table up through the drained storey, read off the cavern's sdf on a 1 m lattice (cached);
// a column of solid rock answers the storey's floor. The water stands in the wells (waterH).
const STOREY_Y=SITE.net.levels[0].y;
const FLOOR=new Map();
function floorAt(i,j){const k=i*131072+j;let h=FLOOR.get(k);if(h!==undefined)return h;const x=i,z=j;h=STOREY_Y;
 for(let y=SITE.net.table-3;y<-2;y+=.5)if(CAVE.C.sdf(x,y,z)>.05){let lo=y-.5;for(let s=0;s<4;s++){const m=(lo+y)/2;if(CAVE.C.sdf(x,m,z)>.05)y=m;else lo=m;}h=y;break;}
 FLOOR.set(k,h);return h;}
function terrainH(x,z){const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j;
 return mix(mix(floorAt(i,j),floorAt(i+1,j),u),mix(floorAt(i,j+1),floorAt(i+1,j+1),u),v);}
function waterH(x,z){for(const W of CAVE.wells)if(Math.hypot(x-W.c[0],z-W.c[1])<W.r+.3)return W.level;return -1e9;}
const groundEye=(x,z)=>Math.max(terrainH(x,z),waterH(x,z));

BIO.init({tags:'hearths',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:()=>0,obstacles:[],ticks:tick,seed:52,
 origin:[CAVE.centre].concat(CAVE.chambers.map(c=>[c.c[0],c.c[2]])),center:CAVE.centre,fields:{},register:REGISTER,err:reportErr,
 lod:{hero:60,mid:160,far:420,floor:[40,110]},windows:{}});
