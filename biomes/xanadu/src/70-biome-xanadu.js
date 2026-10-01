// ================================================================= XANADU — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
XANADU.build=function(opt){opt=opt||{};const R=opt.R||3400,q=opt.quality==null?1:opt.quality;
 if(opt.lakeHue!=null)XANADU.setLake(opt.lakeHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(XANADU.buildTrees){BIO.cur='xanadu/trees';Object.assign(out,XANADU.buildTrees(R,q));}
 if(XANADU.buildFloor){BIO.cur='xanadu/floor';Object.assign(out,XANADU.buildFloor(R,q));}
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
XANADU.dress=function(geos,opt){if(XANADU.dressGeos){BIO.cur='xanadu/dress';XANADU.dressGeos(geos,opt||{});BIO.cur=null;}};
XANADU.canopyH=function(x,z){return XANADU._canopyH?XANADU._canopyH(x,z):10;};
BIO.kitEnd(XANADU);   // its exports run in its registry; the default kit is current again
