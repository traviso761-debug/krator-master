// ================================================================= THE CATCH — build / canopyH
// The kit's public surface (BIOME-API.md). The passes are 55 (the trees) and 60 (the floor); this file only orders them
// and reports. The host hands the kit what it needs through the core: its fields (BIO.field), its mask and water, and
// BIO.host.catch = {nebkhas, bias}.
CATCH.build=function(opt){opt=opt||{};const R=opt.R==null?3000:opt.R,q=opt.quality==null?1:opt.quality;const out={R,quality:q};
 BIO.cur='catch/trees';Object.assign(out,CATCH.buildTrees(R,q));
 BIO.cur='catch/floor';Object.assign(out,CATCH.buildFloor(R,q));
 BIO.cur=null;return out;};
CATCH.canopyH=function(x,z){return CATCH._canopyH?CATCH._canopyH(x,z):BIO.terrainH(x,z)+2;};
BIO.kitEnd(CATCH);   // its exports run in its registry; the default kit is current again
