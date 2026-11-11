// ================================================================= HOST — stage (the shell every station shares)
// The ideal-type host for the EASTERN HIGHLANDS: everything a world provides that a biome does not. Renderer, the
// light, the error panel, the tick list and the registry. The land of each page (its STAGE record, the terrain with
// terrainH(), the local water surface waterH(), the climate fields' definitions, the LOD spine) is 46-host-land.js,
// which each station replaces (stations/<name>/46-host-land.js; PLAN-STATIONS.md); the fields' cache and BIO.init are
// 47-host-fields.js. A real world replaces all three with its own; the kit's fragments never read anything from them
// except through BIO.host.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js, and its mesh silently does not draw: the panel
// shows it, so verify.py fails on it (crater-drylands' lesson)
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THIN AIR (biomes/WORLD.md, the dense-air section read the other way): at ~0.6 atm and 0.75 g the column
// overhead is about 0.8x Earth's. The zenith is a deep blue, the sun white and hard, the fill weak (less of the light is
// skylight), so shadows are dark and the key-to-fill ratio high; distance barely fades: ridges 20 km off stay sharp.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb4c8e4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000042);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0x7c9ed8,0x8a7656,.52));
const SUNP=[-820,1150,-640];
const sun=new THREE.DirectionalLight(0xfff4e4,1.72);sun.position.set(...SUNP);scene.add(sun);
const fill=new THREE.DirectionalLight(0x9ab4e4,.12);fill.position.set(800,300,900);scene.add(fill);

