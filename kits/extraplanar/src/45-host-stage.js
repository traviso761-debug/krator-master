// ================================================================= HOST — renderer, light, what a page needs before the ground  [web]
// As kits/metropolis's: the error panel verify.py reads, TICKS, REGISTER (into BIO's records), the renderer, the scene and the key light.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=a.map(String).join(' ');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+((m.match(/ERROR:[^\n]*/g)||[m.slice(0,200)]).slice(0,4).join(' | ')));}catch(e){}_ce.apply(console,a);};}
const TICKS=[];function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb8b4c4,.0007);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,9000);
const hemi=new THREE.HemisphereLight(0xc4cce0,0x4e4a48,.7);scene.add(hemi);
const SUN_POS=[-700,900,500];
const sun=new THREE.DirectionalLight(0xfff0d8,1.4);sun.position.set(...SUN_POS);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:10,far:2500});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
const waterH=()=>-1e6;
