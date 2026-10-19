// ================================================================= OIDONG VALLEY — build / canopyH
// The kit's public surface (BIOME-API.md). The passes are 55 (trees) and 60 (floor); this file only orders them and
// reports. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md), and the valley is the
// safest ground on the map in any case.
OIDONG.build=function(opt){opt=opt||{};const R=opt.R||2500,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(OIDONG.buildTrees){BIO.cur='oidong/trees';Object.assign(out,OIDONG.buildTrees(R,q));}
 if(OIDONG.buildFloor){BIO.cur='oidong/floor';Object.assign(out,OIDONG.buildFloor(R,q));}
 BIO.cur=null;return out;};
OIDONG.canopyH=function(x,z){return OIDONG._canopyH?OIDONG._canopyH(x,z):6;};
BIO.kitEnd(OIDONG);   // its exports run in its registry; the default kit is current again
