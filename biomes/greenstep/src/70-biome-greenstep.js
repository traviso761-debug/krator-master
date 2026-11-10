// ================================================================= GREENSTEP — build / canopyH
// The kit's public surface (BIOME-API.md). One biome: the windward flood-basalt staircase (PLAN.md sections 2-3). GSTEP.build places the
// kit's own floor; the trees are the neighbours' kin, grown by the host (87-host-kin.js) from the rows a station's land names (LAND.kin),
// because their builders are the source kits' and their registries close before this kit's (build.py NEIGH).
GSTEP.build=function(opt){opt=opt||{};const R=opt.R==null?3000:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};
 if(GSTEP.buildFloor){BIO.cur='greenstep/floor';Object.assign(out,GSTEP.buildFloor(R,q));}
 BIO.cur=null;return out;};
GSTEP.canopyH=function(x,z){return GSTEP._canopyH?GSTEP._canopyH(x,z):4;};
BIO.kitEnd(GSTEP);   // its exports run in its registry; the default kit is current again
