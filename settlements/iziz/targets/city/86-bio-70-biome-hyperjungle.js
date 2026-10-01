// ================================================================= HYPERJUNGLE — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 58 (fauna), 60 (floor) and 65 (dress); this file only orders them and
// reports. opt.fauna:false leaves the animals out.
HYPERJUNGLE.build=function(opt){opt=opt||{};const R=opt.R||3000,q=opt.quality==null?1:opt.quality,heroR=opt.heroR||1400;
 const out={R,quality:q,trees:0,hyper:0,far:0,under:0};
 if(HYPERJUNGLE.buildTrees){BIO.cur='jungle/trees';Object.assign(out,HYPERJUNGLE.buildTrees(R,heroR,q));}
 if(HYPERJUNGLE.buildFloor){BIO.cur='jungle/floor';Object.assign(out,HYPERJUNGLE.buildFloor(R,q));}
 if(HYPERJUNGLE.buildFauna&&opt.fauna!==false){BIO.cur='jungle/fauna';Object.assign(out,HYPERJUNGLE.buildFauna(R,heroR,q));}
 BIO.cur=null;return out;};
HYPERJUNGLE.dress=function(geos,opt){if(HYPERJUNGLE.dressGeos){BIO.cur='jungle/dress';HYPERJUNGLE.dressGeos(geos,opt||{});BIO.cur=null;}};
HYPERJUNGLE.canopyH=function(x,z){return HYPERJUNGLE._canopyH?HYPERJUNGLE._canopyH(x,z):60;};
BIO.kitEnd(HYPERJUNGLE);   // its exports run in its registry; the default kit is current again
