// ================================================================= EASTERN ABYSS — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
EASTABYSS.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality;
 if(opt.lakeHue!=null)EASTABYSS.setLake(opt.lakeHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(EASTABYSS.buildTrees){BIO.cur='abyss/trees';Object.assign(out,EASTABYSS.buildTrees(R,q));}
 if(EASTABYSS.buildReedBeds){BIO.cur='abyss/reeds';Object.assign(out,EASTABYSS.buildReedBeds(R,q));}
 if(EASTABYSS.buildFloor){BIO.cur='abyss/floor';Object.assign(out,EASTABYSS.buildFloor(R,q));}
 BIO.cur=null;return out;};
EASTABYSS.dress=function(geos,opt){if(EASTABYSS.dressGeos){BIO.cur='abyss/dress';EASTABYSS.dressGeos(geos,opt||{});BIO.cur=null;}};
EASTABYSS.canopyH=function(x,z){return EASTABYSS._canopyH?EASTABYSS._canopyH(x,z):12;};
BIO.kitEnd(EASTABYSS);   // its exports run in its registry; the default kit is current again
