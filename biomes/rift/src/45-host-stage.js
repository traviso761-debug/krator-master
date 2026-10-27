// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('rift',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for THE RIFT: everything a world provides that a biome
// does not. Renderer, lights, fog, the Rift-floor terrain with terrainH(), the
// climate fields the biome asks for (wet / salt / upland / flow / mist), the
// water (one plane at y=0 for the algal lake and the last reach of the two
// streams), the painted ground, the tick list, the error panel. A real world
// replaces this whole section with its own; the biome fragments never read
// anything from it except through BIO.host (see 88-host-build.js).
//
// THE MAP (x east, z SOUTH, origin at the ridge's south foot, R 3200):
//   z > ~1900       the ALGAL SALT LAKE: a long E-W trough, its shore wobbling
//   600 .. 1900     the ABYSSAL JUNGLE north of the lake, two streams through it
//  -800 .. 600      the RIDGE: a 250-450 m massif, steep and benched on its
//                   south face (the cloud forest), narrow mesas and saddles on
//                   the crest (the Mediterranean peak), a gentler north slope
//   z < -800        the ABYSSAL SAVANNAH, up to the Rift's north wall (sky)
// East and west the valley runs on; the sky carries the far lakes and walls.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE LAKE COLOUR. One hue (0 red .. .15 yellow .. .33 green .. .66 blue), set
// by the host before the biome loads: the water, the algal crust, the shore
// accents, the scum mats and the complementary blooms / iridescence all derive
// from it. Yellow here: the lake is tinged by its algae.
var RIFT_LAKE={hue:0.15};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc6cbb4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc6d2c6,0x4a4630,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.30);fill.position.set(800,400,900);scene.add(fill);

