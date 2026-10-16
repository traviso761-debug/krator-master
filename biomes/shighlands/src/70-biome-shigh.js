// ================================================================= SOUTHERN HIGHLANDS — build / canopyH
// The kit's public surface (BIOME-API.md). The passes are 55 (trees) and 60 (floor); this file only orders them and
// reports. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
SHIGH.build=function(opt){opt=opt||{};const R=opt.R||2500,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(SHIGH.buildTrees){BIO.cur='shigh/trees';Object.assign(out,SHIGH.buildTrees(R,q));}
 if(SHIGH.buildFloor){BIO.cur='shigh/floor';Object.assign(out,SHIGH.buildFloor(R,q));}
 BIO.cur=null;return out;};
SHIGH.canopyH=function(x,z){return SHIGH._canopyH?SHIGH._canopyH(x,z):6;};
BIO.kitEnd(SHIGH);   // its exports run in its registry; the default kit is current again
