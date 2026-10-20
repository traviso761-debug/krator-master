// ================================================================= GUILIN — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (GUILIN.lay, before the host's terrain); the passes 55 (the
// trees), 57 (the cliffs' dressing) and 60 (the ground plants). This file only orders them and reports.
// opt: {R, quality, pond:{level, at:(x,z)=>the pond's ellipse distance (1 its edge)}}: the host's pond, for the lotus
GUILIN.build=function(opt){opt=opt||{};const R=opt.R==null?1500:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!GUILIN.CLIFF){BIO.err('GUILIN.build: no layout (call GUILIN.lay first)');return out;}
 BIO.cur='guilin/trees';Object.assign(out,GUILIN.buildTrees(R,q));
 BIO.cur='guilin/cliffs';Object.assign(out,GUILIN.buildCliffs(R,q));
 BIO.cur='guilin/floor';Object.assign(out,GUILIN.buildFloor(R,q,opt.pond));
 BIO.cur=null;return out;};
GUILIN.canopyH=function(x,z){return GUILIN._canopyH?GUILIN._canopyH(x,z):BIO.terrainH(x,z)+2;};
BIO.kitEnd(GUILIN);   // its exports run in its registry; the default kit is current again
