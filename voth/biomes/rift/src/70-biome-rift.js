// ================================================================= THE RIFT — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
RIFT.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality;
 if(opt.lakeHue!=null)RIFT.setLake(opt.lakeHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(RIFT.buildTrees){BIO.cur='rift/trees';Object.assign(out,RIFT.buildTrees(R,q));}
 if(RIFT.buildFloor){BIO.cur='rift/floor';Object.assign(out,RIFT.buildFloor(R,q));}
 BIO.cur=null;return out;};
RIFT.dress=function(geos,opt){if(RIFT.dressGeos){BIO.cur='rift/dress';RIFT.dressGeos(geos,opt||{});BIO.cur=null;}};
RIFT.canopyH=function(x,z){return RIFT._canopyH?RIFT._canopyH(x,z):12;};
