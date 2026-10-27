// ================================================================= NECANYONS — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (NECANYONS.lay, before the host's terrain); the passes 55 (the
// trees), 57 (the carnivores) and 60 (the ground plants). This file only orders them and reports.
NECANYONS.build=function(opt){opt=opt||{};const R=opt.R==null?1500:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!NECANYONS.SEEPS){BIO.err('NECANYONS.build: no layout (call NECANYONS.lay first)');return out;}
 BIO.cur='necanyons/trees';Object.assign(out,NECANYONS.buildTrees(R,q));
 /* the runtime LOD's ranges for the small plants (55: NECANYONS.LOD, set by the host's diet; null: the spine's static LOD alone) */
 const LD=NECANYONS.LOD||{};
 BIO.cur='necanyons/carnivores';BIO.range=LD.carn||null;try{Object.assign(out,NECANYONS.buildCarnivores(R,q));}finally{BIO.range=null;}
 BIO.cur='necanyons/floor';BIO.range=LD.floor||null;try{Object.assign(out,NECANYONS.buildFloor(R,q));}finally{BIO.range=null;}
 BIO.cur=null;return out;};
NECANYONS.canopyH=function(x,z){return NECANYONS._canopyH?NECANYONS._canopyH(x,z):BIO.terrainH(x,z)+2;};
BIO.kitEnd(NECANYONS);   // its exports run in its registry; the default kit is current again
