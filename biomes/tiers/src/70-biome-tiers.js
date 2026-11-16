// ================================================================= THE TIERS — build / canopyH
// The kit's public surface (BIOME-API.md): TIERS.build({R, quality}) places the tree-scale natives (55) and the floor (60); TIERS.make / grow /
// treeAt grow one of its trees where a world puts it. No fauna here: kits/fauna owns it (PLAN.md section 4).
TIERS.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};
 BIO.cur='tiers/trees';Object.assign(out,TIERS.buildTrees(R,q));
 BIO.cur='tiers/floor';Object.assign(out,TIERS.buildFloor(R,q));
 BIO.cur=null;return out;};
TIERS.canopyH=function(x,z){let h=0;for(const T of TIERS.TREES){if(Math.abs(x-T.x)<12&&Math.abs(z-T.z)<12)h=Math.max(h,T.y0+T.H);}return h>0?h:1;};   /* no tree near: 1 (a tree's top is never 0) */
BIO.kitEnd(TIERS);   // its exports run in its registry; the default kit is current again
