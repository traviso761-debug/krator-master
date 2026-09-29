// ================================================================= SOUTHWESTERN LOWLANDS — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
SWLOW.build=function(opt){opt=opt||{};const R=opt.R||2850,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(SWLOW.buildTrees){BIO.cur='lowlands/trees';Object.assign(out,SWLOW.buildTrees(R,q,opt));}
 if(SWLOW.buildFloor){BIO.cur='lowlands/floor';Object.assign(out,SWLOW.buildFloor(R,q));}
 BIO.cur=null;return out;};
SWLOW.dress=function(geos,opt){if(SWLOW.dressGeos){BIO.cur='lowlands/dress';SWLOW.dressGeos(geos,opt||{});BIO.cur=null;}};
SWLOW.canopyH=function(x,z){return SWLOW._canopyH?SWLOW._canopyH(x,z):10;};
