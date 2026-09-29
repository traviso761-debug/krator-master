// ================================================================= NORTHWESTERN LOWLANDS — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
NWLOW.build=function(opt){opt=opt||{};const R=opt.R||2850,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(NWLOW.buildTrees){BIO.cur='nwlow/trees';Object.assign(out,NWLOW.buildTrees(R,q,opt));}
 if(NWLOW.buildFloor){BIO.cur='nwlow/floor';Object.assign(out,NWLOW.buildFloor(R,q));}
 BIO.cur=null;return out;};
NWLOW.dress=function(geos,opt){if(NWLOW.dressGeos){BIO.cur='nwlow/dress';NWLOW.dressGeos(geos,opt||{});BIO.cur=null;}};
NWLOW.canopyH=function(x,z){return NWLOW._canopyH?NWLOW._canopyH(x,z):10;};
