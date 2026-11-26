// ================================================================= HOST — stage (the summit: every station's frame and ground)
// The ideal-type host for THE GODTHRONE's summit (PLAN.md sections 1-4, station 1): renderer, the caldera as DATA (its
// floor, its terraced wall, the nested pit, the vent), the rock as KSTRATA's tibasalt, the ground baked once into KFIELD,
// the fields the kit asks for (the glass halo, its orange share, the scarps' talus, the hollows), BIO.init. The biome
// fragments read nothing from here except through BIO.host.
//
// HEIGHTS ARE TRUE: y is metres above Krator's datum (the scale model's 4.23 summit: the caldera floor ~22,000 m, the pit
// 900 m deeper, the rim at 25,000 m), so the thin-air sky (89-host-sky.js), the strata's alteration line and the hazards'
// pressure read the page's y as they are.
//
// ONE FRAME FOR EVERY STATION (the owner, 2026-10-26: the summit is two pages): x east, z south, origin on the main wall's
// foot north-east of the vent. One axis does the work: s runs NORTH-EAST from the caldera's centre (31 km south-west) out
// toward its rim; t runs across it (south-east). The geography is 4.23's: the vent sits on the nested pit's floor 9.2 km
// from the caldera's centre, ~23 km from the nearest stretch of the main wall, which stands north-east of it. Each station
// draws a 9.6 km square of it (STN, 44a-host-station.js: the summit vent, src/; the caldera wall, stations/wall/), and the
// rest of the caldera is the far country (82-host-sky.js), the same closure seen from far off:
//   THE PIT        a collapse pit 900 m deep (4.23's PIT_DEPTH), its floor a frozen lava lake ~3.5 km across, its wall
//                  three scarps of stacked flows with two benches between them
//   THE VENT       on the pit's floor: a fissure 1.1 km long, the spatter rampart either side of its crack, a cinder-and-spatter
//                  cone over the vent (a lava throat in its crater; fuming, and fountaining now and then: 89b) and two cones more
//   THE FLOOR      the caldera's floor at ~22 km, a lava plain with low wrinkle ridges, mantled by the glass halo
//   THE WALL       the main caldera wall, ~3 km of stacked titanium-basalt flows in six collapse terraces (a scarp and a
//                  back-tilted bench each, talus at every scarp's foot), its rim at 25,000 m, the outer flank beyond
//   THE PORTAL     the Ancients' sealed portal on the rim (PLAN.md section 6: the settlement plan dresses it)
const {TAU,clamp,lerp,mix,smooth,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
const WORLD=0x60D7;   // the page's world seed: every draw is KRAND.hash(WORLD, cell, index, salt)
const KR=KRAND,vn=(x,z,sd)=>KR.vnoise(x,0,z,sd),fb=(x,z,o,sd)=>KR.fbm(x,0,z,o,sd);

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// the air at 21-25 km is a tenth of an atmosphere: the shared sky's thin end (89-host-sky.js) takes the fog to nothing; the
// fog here is only its starting value. The far plane reaches across the caldera (its far rim is ~65 km off) and the shield
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x1c1d24,.000002);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1.5,160000);
const hemi=new THREE.HemisphereLight(0x8a90a4,0x2a2622,.35);scene.add(hemi);
const SUN_POS=[1100,1500,700];   // a starting sun; the shared sky moves it to the hour's
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);

// ---------------------------------------------------------------- the frame
const TERR=(function(){const R=STN.R,c=STN.centre;return{R,cx:c[0],cz:c[1],X0:c[0]-R,X1:c[0]+R,Z0:c[1]-R,Z1:c[1]+R};})();   // the station's square (STN)
const SQ=Math.SQRT1_2;
const sOf=(x,z)=>(x-z)*SQ, tOf=(x,z)=>(x+z)*SQ, xzOf=(s,t)=>[(s+t)*SQ,(t-s)*SQ];
