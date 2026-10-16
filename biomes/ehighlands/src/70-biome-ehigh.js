// ================================================================= EASTERN HIGHLANDS — build / canopyH
// The kit's public surface (BIOME-API.md). The plants and the Mother Cushion are 55, the floor 60; this file only
// orders them and reports. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
EHIGH.build=function(opt){opt=opt||{};const R=opt.R||2500,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(opt.giantAz!=null)EHIGH.setGiant(opt.giantAz);
 if(EHIGH.buildTrees){BIO.cur='ehigh/trees';Object.assign(out,EHIGH.buildTrees(R,q));}
 if(EHIGH.buildFloor){BIO.cur='ehigh/floor';Object.assign(out,EHIGH.buildFloor(R,q));}
 BIO.cur=null;return out;};
EHIGH.canopyH=function(x,z){return EHIGH._canopyH?EHIGH._canopyH(x,z):2;};
BIO.kitEnd(EHIGH);   // its exports run in its registry; the default kit is current again
