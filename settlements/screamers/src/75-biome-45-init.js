// ================================================================= BIOME BINDING (host side)
// The Hexahedron's contract with the hyperjungle biome kit (biomes/hyperjungle,
// BIOME-API.md). This is everything the biome knows about this world: THREE,
// the ground, where it may not grow, and a tick list for wind. The scene is
// created in 90-scene.js and handed over there (BIO.setScene) before the
// jungle builder runs. The biome keeps its own PRNG, so nothing here moves.
BIO.init({THREE:THREE,terrainH:terrainH,
 // the village clearing: nothing inside the wall line, thinning out over the
 // first 150 m beyond it (SCREAM is set by buildHexahedron before the jungle runs)
 mask:(x,z)=>{if(typeof SCREAM==='undefined'||!SCREAM)return 1;const WR=SCREAM.hexr*1.16,m=Math.hypot(x,z);
  return m<WR*1.03?0:clamp((m-WR*1.03)/150,0,1);},
 obstacles:[],ticks:tick,seed:9480,origin:[0,0],err:reportErr,
 // charge the biome's triangles to the jungle type so --assert budgets it
 stat:(k,tris,inst)=>{const key='jung/2';const t=TSTAT.by[key]||(TSTAT.by[key]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
