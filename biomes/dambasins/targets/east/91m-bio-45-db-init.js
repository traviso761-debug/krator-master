// ================================================================= DAM BASINS — the hyperjungle bound on the east bed (PLAN.md, D2 for station 3)
// FRAGMENT NUMBER IS LOAD-BEARING: BIO.init after the scene, the terrain and the wrecks (the ground is final) and BEFORE the kit
// (91m-bio-46 opens its closure: biomes/hyperjungle/src/41-hyperjungle-globals.js declares the core's helpers at top level, and
// the port lineage declares its own rng, fbm, clamp under the same names, so the kit is read inside a function of its own and
// only HYPERJUNGLE leaves it). Korona's warm wet floor is the hyperjungle (biomes/korona/BIOME-API.md); this is that floor, grown
// over the old lake's bed since it drained.
//   THE MASK (the hyperjungle reads no fields: the mask is its whole say): 1 on the land over the old line (the old forest down to
//   the shore), .5 on the drain band (slumped silt), .75 in the recession, .12 on the bathtub ring's calcite, nothing within a
//   hulk's keel and 14 m of it, nothing past the flora's 2.6 km window
const DB_FL=(()=>{const R=2600,C0=[0,dbShore(0)+900],S={};
 const near=(x,z,pad)=>((PORT_LAYOUT.db&&PORT_LAYOUT.db.trapped)||[]).some(p=>p.D.some(b=>Math.hypot(x-b[0],z-b[1])<b[2]+pad));
 const mask=(x,z)=>{if(Math.hypot(x-C0[0],z-C0[1])>R)return 0;if(near(x,z,14))return 0;const h=terrainH(x,z),s=DB_BASIN.sample(x,z,h,S),B=KBASIN.BAND;
  if(!(s.bed>0))return 1;const band=s.band===B.ring?.12:s.band===B.drain?.5:s.band===B.recession?.75:1;return 1-s.bed*(1-band);};
 const obstacles=[];((PORT_LAYOUT.db&&PORT_LAYOUT.db.trapped)||[]).forEach(p=>p.D.forEach(b=>obstacles.push({x:b[0],z:b[1],r:b[2]+4,y0:-1e4,y1:1e4})));
 const spine=[C0,[0,dbShore(0)],[-1400,dbShore(-1400)+400],[1400,dbShore(1400)+400],[0,dbShore(0)+2400]];
 return {R,C0,mask,obstacles,spine};})();
BIO.init({tags:DB_TAGS,THREE:THREE,scene:scene,terrainH:(x,z)=>terrainH(x,z),waterH:()=>-1e9,mask:DB_FL.mask,obstacles:DB_FL.obstacles,
 ticks:fn=>{PORT_FRAME.push(fn);},seed:29,origin:DB_FL.spine,center:DB_FL.C0,fields:{},register:r=>REGISTER(r),err:m=>reportErr('biome: '+m),
 lod:{hero:500,mid:1200,far:2600,floor:[360,880]}});
BIO.setSun([-1200,900,900]);   /* the kit's sun (90-scene.js) */
