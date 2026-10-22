// ================================================================= N SEMIARID — build / canopyH
// The kit's public surface (BIOME-API.md). The passes live in 55 (trees) and 60 (floor); this file only orders them and
// reports. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
NSEMIARID.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(NSEMIARID.buildTrees){BIO.cur='nsemiarid/trees';Object.assign(out,NSEMIARID.buildTrees(R,q));}
 if(NSEMIARID.buildFloor){BIO.cur='nsemiarid/floor';Object.assign(out,NSEMIARID.buildFloor(R,q));}
 BIO.cur=null;return out;};
NSEMIARID.canopyH=function(x,z){return NSEMIARID._canopyH?NSEMIARID._canopyH(x,z):4;};
BIO.kitEnd(NSEMIARID);   // its exports run in its registry; the default kit is current again
