// ================================================================= HOST — stage (station 14: the lee's penitentes)
// The ideal-type host for THE THRONE's east flank under the summit (PLAN.md, "New stations"; map 5.1: px 866, 839 on its canvas, 36-42 km
// east of the summit, 5.0-5.7 km up, EF over ET, 141 mm a year, ~0.8 atm). In the lee of the north-west westerlies the snow lies dry under a
// hard sun and sublimates into PENITENTES: blades of hard snow 1-4 m tall in rows east-west, leaning to the noon sun (north, at 40 S).
//
// THE MAP (x east, z south; R 2600). The flank falls east at ~17 % in BENCHES: old flows' treads, near level, where the snow lies and the
// penitentes grow, and their fronts, rock steps of 40-70 m, bare and ribbed. Down the map's east edge the snow gives out on the ET tundra
// (lichen, moss cushions on the rocks). The cold belt's trees (gill-corals among conifers) grow 1.5 km lower, on the glacier station's page.
// Nothing else lives here: lichen on the steps, cushions at the snow's foot.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin air (~0.4 atm): a hard white sun, a deep blue sky darkening overhead, almost no haze; the lava lake's glow
// (a warm light from the caldera, faint by day, strong at night: 86)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb8c8dc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00009);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,20000);
const hemi=new THREE.HemisphereLight(0x8aa4cc,0x7a7c84,.7);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xfff6ea,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8b8d8,.18);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the flank and its benches
const TERR={R:2600};
// u up the flank (west, toward the summit); the bench fronts wander along the contour (z)
const FLANK={top:5800,slope:.17,step:62,tread:360,snowline:5000,name:'The east flank under the summit'};
const benchU=(x,z)=>-x+70*(fbm(z*.0016+3,x*.0004,1401,2)-.5)*2;
function benchAt(x,z){const s=(benchU(x,z)+TERR.R*1.2)/FLANK.tread,i=Math.floor(s),f=s-i;return{i,f,riser:smooth(.74,.8,f)*smooth(1,.94,f)};}
// THE AIR: ~0.8 atm and dry (PLAN.md): a hard white sun, a deep sky, little haze
const PEN={x:0,z:0,v:0};   /* the penitentes' best patch near the middle (47 finds it) */
function plumeAt(x,z){return 0;}// THE AIR's height fog (89zz-host-core.js; the final rebuild): the dry lee's air thins with height; no valley mist (the treads are open snow)
const ATMOS_AIR={falloff:1/1100,sun:.4,sky:.4};
