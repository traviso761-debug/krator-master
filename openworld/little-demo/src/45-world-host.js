// ================================================================= OPEN WORLD — host: the renderer, the light, and the biome core's binding
// [web] One renderer for a world 1,400 km across: a logarithmic depth buffer (a ground 1 m away and a ridge 300 km
// away in one frame), no shadows (the sun is the kits' own, WNW at 45 degrees), fog as the dust haze.
//
// The biome core is bound once (BIO.init) to the WORLD, before any kit loads: a kit's fragments only need THREE at
// load; they read the land (terrainH, waterH, the fields) when they grow something. The fields come from one of
// three sources, set by the streaming code (HOST.fieldSource):
//   'world'    WORLD.at(x,z), the full sample (the last point is cached: a kit's zones() asks for ten fields at once)
//   a grid     a flora tile's field grid (85-world-flora.js): bilinear, so placing a tile costs grid reads
//   'nursery'  a fixed profile on flat ground at y=0 with no water: where 84-world-nursery.js grows one tree or one
//              floor patch alone, at the origin, to instance it everywhere
// A field each kit reads its own way is remapped here, by the kit that asks (BIO.kitName is the kit whose code runs):
// the abyss kit's 'upland' is the height above the abyss floor, not the plateau's mountains.
// LATE: the modules that read the region's data (terrain, water, flora, floor, places, camera) are defined when the data
// is decoded (98-world-start.js runs them in order); the kits and the nursery need none of it and load at once.
var LATE=[];
var HOST=(function(){
const renderer=new THREE.WebGLRenderer({antialias:true,logarithmicDepthBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const HAZE=new THREE.Color(0xd2bfa4);scene.fog=new THREE.FogExp2(HAZE.getHex(),1/90000);scene.background=HAZE.clone();
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.4,2.5e6);
const hemi=new THREE.HemisphereLight(0xc8d4e4,0x6a4030,.62);scene.add(hemi);
const SUN_DIR=new THREE.Vector3(-1000,1150,-560).normalize();
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.copy(SUN_DIR);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8b8a0,.22);fill.position.set(900,300,900).normalize();scene.add(fill);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const TICKS=[];

// ---------------------------------------------------------------- the field sources
const SRC={mode:'world',profile:null,grid:null};
let lx=NaN,lz=NaN,la=null;
function sample(x,z){if(SRC.mode==='nursery')return SRC.profile;
 if(SRC.grid){const g=SRC.grid(x,z);if(g)return g;}
 if(x===lx&&z===lz)return la;lx=x;lz=z;la=WORLD.at(x,z);return la;}
const fields={};
WORLD.FIELDS.forEach(n=>fields[n]=(x,z)=>sample(x,z)[n]);
// a kit that reads a field its own way (WORLD_KITS[].fields: the abyss kit's 'upland' is WORLD.at's abyssUp)
let REMAP=null;const remap=()=>REMAP||(REMAP=Object.fromEntries(WORLD_KITS.map(k=>[k.name,k.fields||{}])));
WORLD.FIELDS.forEach(n=>fields[n]=(x,z)=>{const s=sample(x,z),m=BIO.kitName&&remap()[BIO.kitName]&&remap()[BIO.kitName][n];return m&&s[m]!=null?s[m]:s[n];});
const terrainH=(x,z)=>SRC.mode==='nursery'?0:(SRC.grid&&SRC.groundAt?SRC.groundAt(x,z):WORLD.H(x,z));
const waterH=(x,z)=>SRC.mode==='nursery'?-1e9:WORLD.water(x,z);
BIO.init({THREE,scene,terrainH,waterH,
 mask:(x,z)=>{if(SRC.mode==='nursery')return 1;const d=terrainH(x,z)-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;},
 obstacles:[],ticks:fn=>TICKS.push(fn),seed:1,origin:[[0,0]],center:[0,0],fields,register:o=>{},
 err:m=>reportErr('biome: '+m)});
BIO.setSun([SUN_DIR.x,SUN_DIR.y,SUN_DIR.z]);

return{renderer,scene,camera,sun,hemi,fill,HAZE,SUN_DIR,TICKS,SRC,
 // the nursery: flat ground at the origin with a fixed profile; origin is the LOD spine the builders measure from
 nursery(profile,origin){SRC.mode='nursery';SRC.profile=profile;BIO.host.origin=[origin||[0,0]];BIO.host.center=origin||[0,0];lx=NaN;},
 world(){SRC.mode='world';SRC.profile=null;BIO.host.origin=[[0,0]];BIO.host.center=[0,0];lx=NaN;},
 fieldSource(grid,groundAt){SRC.grid=grid;SRC.groundAt=groundAt||null;lx=NaN;}};
})();
