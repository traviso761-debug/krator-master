// ================================================================= NORTH-WEST BAY — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees and
// the reed beds), 60 (floor), 65 (dress) and 75 (fauna); this file only orders
// them and reports.
NWBAY.build=function(opt){opt=opt||{};const R=opt.R||2400,q=opt.quality==null?1:opt.quality;
 if(opt.bayHue!=null)NWBAY.setBay(opt.bayHue);
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(NWBAY.buildTrees){BIO.cur='nwbay/trees';Object.assign(out,NWBAY.buildTrees(R,q));}
 if(NWBAY.buildReedBeds){BIO.cur='nwbay/reeds';Object.assign(out,NWBAY.buildReedBeds(R,q));}
 if(NWBAY.buildFloor){BIO.cur='nwbay/floor';Object.assign(out,NWBAY.buildFloor(R,q));}
 if(NWBAY.buildFauna&&opt.fauna!==false){BIO.cur='nwbay/fauna';Object.assign(out,NWBAY.buildFauna(R,q));}
 BIO.cur=null;return out;};
NWBAY.dress=function(geos,opt){if(NWBAY.dressGeos){BIO.cur='nwbay/dress';NWBAY.dressGeos(geos,opt||{});BIO.cur=null;}};
NWBAY.canopyH=function(x,z){return NWBAY._canopyH?NWBAY._canopyH(x,z):12;};
