// ================================================================= SOUTHWEST BAY — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor), 65 (dress) and 75 (fauna); this file only orders them and reports.
SWBAY.build=function(opt){opt=opt||{};const R=opt.R||2400,q=opt.quality==null?1:opt.quality;
 if(opt.bayHue!=null)SWBAY.setBay(opt.bayHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(SWBAY.buildTrees){BIO.cur='bay/trees';Object.assign(out,SWBAY.buildTrees(R,q));}
 if(SWBAY.buildFloor){BIO.cur='bay/floor';Object.assign(out,SWBAY.buildFloor(R,q));}
 if(SWBAY.buildFauna&&opt.fauna!==false){BIO.cur='bay/fauna';Object.assign(out,SWBAY.buildFauna(R,q));}
 BIO.cur=null;return out;};
SWBAY.dress=function(geos,opt){if(SWBAY.dressGeos){BIO.cur='bay/dress';SWBAY.dressGeos(geos,opt||{});BIO.cur=null;}};
SWBAY.canopyH=function(x,z){return SWBAY._canopyH?SWBAY._canopyH(x,z):12;};
