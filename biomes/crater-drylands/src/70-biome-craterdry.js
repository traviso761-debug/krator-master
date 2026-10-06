// ================================================================= CRATER DRYLANDS — build / canopyH
// The kit's public surface (BIOME-API.md). The fire history is 52, the passes 55 (trees) and 60 (floor); this file
// only orders them and reports. A host that has not made a fire history (CRATERDRY.fireHistory) gets one with the
// defaults at the first build. No fauna here: the owner's plan moves all fauna to one fauna kit (biomes/README.md).
CRATERDRY.build=function(opt){opt=opt||{};const R=opt.R||2500,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(!CRATERDRY.FIRE){BIO.cur='craterdry/fire';CRATERDRY.fireHistory({R:R+100});}
 out.fires=CRATERDRY.FIRE.fires.length;out.shares=CRATERDRY.FIRE.shares();
 if(CRATERDRY.buildTrees){BIO.cur='craterdry/trees';Object.assign(out,CRATERDRY.buildTrees(R,q));}
 if(CRATERDRY.buildFloor){BIO.cur='craterdry/floor';Object.assign(out,CRATERDRY.buildFloor(R,q));}
 BIO.cur=null;return out;};
CRATERDRY.canopyH=function(x,z){return CRATERDRY._canopyH?CRATERDRY._canopyH(x,z):6;};
BIO.kitEnd(CRATERDRY);   // its exports run in its registry; the default kit is current again
