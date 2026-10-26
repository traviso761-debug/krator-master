// ================================================================= HOST — the station's shell (the Bowl's stations, PLAN-STATIONS.md)
// What every station of the Bowl shares before its layout: the core's helpers, the error panel, the tick list and the registry,
// the renderer, the scene and its lights (the shared sky, 89s-host-sky.js, sets the light by the hour). A station that inherits
// the Bowl's files (station.json "base") keeps this and writes its own 45-host-stage.js (the layout) over the Bowl's.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// the water colour the kit's species read (50-species: the reed accents): the delta's silty green
var SEDESERT_WATER={hue:.36};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT is the shared sky's (89s-host-sky.js sets the sun, the hemisphere, the fog and the exposure by the hour): these are
// its starting values. The air is 1.83 atm: thick, hazy, white-hot at noon
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xe0cdb2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,90000);
const HEMI=new THREE.HemisphereLight(0xd8dce4,0x8a7058,.6);scene.add(HEMI);
const sun=new THREE.DirectionalLight(0xfff0d8,1.6);sun.position.set(-900,600,700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0d0c0,.2);fill.position.set(900,300,-900);scene.add(fill);
