// ================================================================= HOST — renderer, light, what a page needs before the ground  [web]
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=a.map(String).join(' ');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+((m.match(/ERROR:[^\n]*/g)||[m.slice(0,200)]).slice(0,4).join(' | ')));}catch(e){}_ce.apply(console,a);};}
const TICKS=[];function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbcc6cc,.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,14000);
const hemi=new THREE.HemisphereLight(0xc4d4e0,0x56524a,.7);scene.add(hemi);
const SUN_POS=[-900,1000,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.5);sun.position.set(...SUN_POS);scene.add(sun);
const terrainH=()=>0,waterH=()=>-1e6;
