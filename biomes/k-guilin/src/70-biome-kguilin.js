// ================================================================= KGUILIN — build / canopyH
// The kit's public surface (BIOME-API.md). The layout is 46 (KGUILIN.lay, before the host's terrain); the passes 55 (the
// trees), 57 (the cliffs' dressing) and 60 (the ground plants). This file only orders them and reports.
// opt: {R, quality, pond:{level, at:(x,z)=>the pond's ellipse distance (1 its edge)}, lake:{level}}: the host's pond and lake,
// for the lotus. The trees pass places nwbay's borrowed species too (55: KGUILIN.BPASSES, charged to 'kguilin/nwbay')
KGUILIN.build=function(opt){opt=opt||{};const R=opt.R==null?1500:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};if(!KGUILIN.CLIFF){BIO.err('KGUILIN.build: no layout (call KGUILIN.lay first)');return out;}
 BIO.cur='kguilin/trees';Object.assign(out,KGUILIN.buildTrees(R,q));
 BIO.cur='kguilin/cliffs';Object.assign(out,KGUILIN.buildCliffs(R,q));
 BIO.cur='kguilin/floor';Object.assign(out,KGUILIN.buildFloor(R,q,opt.pond,opt.lake));
 BIO.cur=null;return out;};
KGUILIN.canopyH=function(x,z){return KGUILIN._canopyH?KGUILIN._canopyH(x,z):BIO.terrainH(x,z)+2;};
BIO.kitEnd(KGUILIN);   // its exports run in its registry; the default kit is current again
