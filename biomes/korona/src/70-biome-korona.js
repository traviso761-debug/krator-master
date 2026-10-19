// ================================================================= KORONA — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is the necanyons kit's (46, read in place: the host calls
// NECANYONS.lay before this kit builds); the passes are 55 (the trees), 57 (the hell) and 60 (the summit). This file only
// orders them and reports.
KORONA.build=function(opt){opt=opt||{};const R=opt.R==null?1500:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!NECANYONS.SEEPS){BIO.err('KORONA.build: no layout (call NECANYONS.lay first)');return out;}
 BIO.cur='korona/trees';Object.assign(out,KORONA.buildTrees(R,q));
 BIO.cur='korona/carnivores';Object.assign(out,KORONA.buildCarnivores(R,q));
 BIO.cur='korona/floor';Object.assign(out,KORONA.buildFloor(R,q));
 BIO.cur=null;return out;};
KORONA.canopyH=function(x,z){return KORONA._canopyH?KORONA._canopyH(x,z):BIO.terrainH(x,z)+2;};
BIO.kitEnd(KORONA);   // its exports run in its registry; the default kit is current again
