// ================================================================= HOST — stage
// The ideal-type host for XANADU, the Vale in the East Rift Highlands: an
// enclosed mountain lake, longer east-west than north-south, and the vale on
// its south shore where the sacred river comes down from a chasm in the
// mountains. Renderer, lights, fog, the terrain with terrainH(), the five
// climate fields the biome asks for (wet / salt / upland / flow / mist), the
// lake, the river as its own water ribbon, the painted ground, the tick list,
// the error panel. A real world replaces this whole section with its own; the
// biome fragments never read anything from it except through BIO.host.
//
// THE MAP is the Vale of Xanadu scale model, read off the map image as a grid
// of classes (8 px cells, 5.5 m a pixel, 44 m a cell; x east, z SOUTH, origin
// at the image's centre):
//   L  the lake (north; it runs on off the map to the north, east and west)
//   S  the shore plain
//   F  the green slopes and the vale floor (terrace country on the map)
//   B  the brown uplands: the promontory the palace will stand on, the ridge
//      and the eastern plateau round the vale (the Mediterranean ground)
//   G  the grey cliffs under the mountains
//   W  the high mountains to the south (and, as thin lines on the map, the
//      escarpments between the slopes and the uplands: cleaned out below)
// The sacred river is traced off the map's blue line: it rises at a chasm at
// the cliff foot in the south-west, runs east along the foot of the cliffs in a
// gorge, turns north through the vale and meets the lake at the dockyard. The
// lake drains over a cataract off the map to the south-east (painted on the sky).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE LAKE COLOUR. One hue drives the water and the biome's accents (the
// shallows, the mosses' tinge, the bloom complement). A glacial jade here.
var XANADU_LAKE={hue:0.49};
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

// THE PAGE'S SWITCHES (the final rebuild): ?<name>=0 turns a new piece off for the owner's before-and-after (BACKPORT.md section 3, step 3)
const XQ=new URLSearchParams(location.search),XQ_ON=k=>XQ.get(k)!=='0';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
/* the draw-call and vertex set (BACKPORT.md section 1; nhighlands' lines): welded items, one mesh a chunk, the cross-fade, chunks off screen dropped; ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 */
{BIO.INDEX_ITEMS=XQ_ON('index');BIO.LOD.merge=XQ_ON('lodmerge');BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&XQ_ON('lodfade')?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&XQ_ON('lodcull');}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4cfc8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00017);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,15000);
scene.add(new THREE.HemisphereLight(0xcad6d0,0x4a4638,.64));
const sun=new THREE.DirectionalLight(0xfff0d8,1.42);sun.position.set(-1200,950,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb4cfd2,.30);fill.position.set(800,400,900);scene.add(fill);

