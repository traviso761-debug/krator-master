// ================================================================= HOST — the page's shell (every station)
// The error panel, the frame ticks, the register, the renderer, the scene, the camera and the lights. The shared sky
// (89s-host-sky.js) sets the sun, the hemisphere, the fog and the exposure by the hour; these are its starting values.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too
const {TAU,clamp,lerp,mix,smooth,fbm}=BIO.fn;

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
// THE LIGHT: fog-grey and green, the sea's haze (the shared sky sets the sun, the hemisphere and the fog by the hour: 89s-host-sky.js)
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb8c4c0,.00028);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
const HEMI=new THREE.HemisphereLight(0xc4d0cc,0x3e4636,.66);scene.add(HEMI);
const SUN_POS=[-1100,800,-900];
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb4c8c4,.32);fill.position.set(800,400,900);scene.add(fill);

