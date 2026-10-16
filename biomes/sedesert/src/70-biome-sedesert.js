// ================================================================= EASTERN HIGH DESERT — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
SEDESERT.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality;
 if(opt.waterHue!=null)SEDESERT.setWater(opt.waterHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(SEDESERT.buildTrees){BIO.cur='desert/trees';Object.assign(out,SEDESERT.buildTrees(R,q));}
 if(SEDESERT.buildFloor){BIO.cur='desert/floor';Object.assign(out,SEDESERT.buildFloor(R,q));}
 // opt.fauna: false builds none; a function (kind,x,z)->bool keeps the deer and coyotes off ground the host keeps
 if(SEDESERT.buildFauna&&opt.fauna!==false){BIO.cur='desert/fauna';Object.assign(out,SEDESERT.buildFauna(R,q,opt.fauna));}
 BIO.cur=null;return out;};
SEDESERT.dress=function(geos,opt){if(SEDESERT.dressGeos){BIO.cur='desert/dress';SEDESERT.dressGeos(geos,opt||{});BIO.cur=null;}};
SEDESERT.canopyH=function(x,z){return SEDESERT._canopyH?SEDESERT._canopyH(x,z):6;};
