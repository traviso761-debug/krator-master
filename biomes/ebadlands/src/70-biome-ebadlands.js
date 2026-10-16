// ================================================================= EASTERN BADLANDS — build / canopyH
// The kit's public surface (BIOME-API.md). The passes live in 55 (trees) and 60 (floor); this file only
// orders them and reports. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
EBADLANDS.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(EBADLANDS.buildTrees){BIO.cur='badlands/trees';Object.assign(out,EBADLANDS.buildTrees(R,q));}
 if(EBADLANDS.buildFloor){BIO.cur='badlands/floor';Object.assign(out,EBADLANDS.buildFloor(R,q));}
 BIO.cur=null;return out;};
// growth on a structure the host hands over (65-dress): the hanging gardens, grape curtains, moss and ledge plants
EBADLANDS.dress=function(geos,opt){if(!EBADLANDS.dressGeos)return null;BIO.cur='badlands/dress';const r=EBADLANDS.dressGeos(geos,opt||{});BIO.cur=null;return r;};
EBADLANDS.canopyH=function(x,z){return EBADLANDS._canopyH?EBADLANDS._canopyH(x,z):6;};
BIO.kitEnd(EBADLANDS);   // its exports run in its registry; the default kit is current again
