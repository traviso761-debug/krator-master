// ================================================================= HOST — stage (every station's renderer, frame and light)
// The ideal-type host for GODSTEP VALLEY (PLAN.md), started from biomes/godthrone's (the same rock, the same host shell): the
// renderer, the scene and its light, the station's square (STN, 44a-host-station.js), the world seed. The ground model is the
// station's (45b-host-model.js), baked once into KFIELD with the fields the kit reads (45c-host-field.js), which binds BIO. The
// biome fragments read nothing from here except through BIO.host.
//
// HEIGHTS ARE TRUE: y is metres above Krator's datum (scale model 5.1: the head step ~3,120 m, step 2 ~2,430 m), so the shared
// sky's air (89-host-sky.js), the strata's alteration line and the hazards' pressure read the page's y as they are.
const {TAU,clamp,lerp,mix,smooth,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const WORLD=0x6057;   // the page's world seed: every draw is KRAND.hash(WORLD, cell, index, salt)
const KR=KRAND,vn=(x,z,sd)=>KR.vnoise(x,0,z,sd),fb=(x,z,o,sd)=>KR.fbm(x,0,z,o,sd);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// the fog here is only its starting value (the shared sky drives it by the hour and the air); the far plane reaches the Godthrone
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x9aa4b0,.00004);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1.0,160000);
const hemi=new THREE.HemisphereLight(0x8a90a4,0x2a2622,.35);scene.add(hemi);
const SUN_POS=[1100,1500,700];   // a starting sun; the shared sky moves it to the hour's
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);

// ---------------------------------------------------------------- the frame
const TERR=(function(){const R=STN.R,c=STN.centre;return{R,cx:c[0],cz:c[1],X0:c[0]-R,X1:c[0]+R,Z0:c[1]-R,Z1:c[1]+R};})();   // the station's square (STN)
const SQ=Math.SQRT1_2;
const sOf=(x,z)=>(x-z)*SQ, tOf=(x,z)=>(x+z)*SQ, xzOf=(s,t)=>[(s+t)*SQ,(t-s)*SQ];
