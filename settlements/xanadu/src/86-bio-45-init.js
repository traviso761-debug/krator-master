// ================================================================= XANADU — the biome host binding
// BIO.init must run after terrainH exists (10-core; the city reassigns it in 84-er-geo) and BEFORE the biome
// fragments (86-bio-50+), which build their textures against BIO.host.THREE at load. The scene arrives later
// (BIO.setScene in 90-scene / 90b-er-build). In the kit showcase the biome only supplies the plants the builders ask
// for through xaPlant (86b): the mask is 0, no zone pass runs. The city gives it a real mask in 86-bio-46-er-init.
const FRAME_HOOKS_PRE=[];        // per-frame fns registered before 90-scene defines FRAME_HOOKS (the biome's wind tick)
const BIO_OBSTACLES=[];          // {x,z,r} cylinders nothing grows in
var XANADU_LAKE={hue:0.49};      // the lake's jade (the biome reads it at load)
if(!window.ER)BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:(x,z)=>0,obstacles:BIO_OBSTACLES,
 ticks:fn=>FRAME_HOOKS_PRE.push(fn),seed:31,origin:[0,0],err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/'+k]||(TSTAT.by['biome/'+k]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
