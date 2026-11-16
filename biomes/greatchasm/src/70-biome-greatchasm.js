// ================================================================= THE GREAT CHASM — build / canopyH
// The kit's public surface (BIOME-API.md): GCH.build({R, quality}) places the ground cover (60); GCH.buildTrees is the empty tree pass (the
// chasm has no trees of its own: the neighbours' are grown by 87-host-kin.js, BIO.kin). No fauna here: kits/fauna owns it (PLAN.md section 4).
GCH.buildTrees=function(R,q){GCH.TREES=[];GCH.COUNTS=[];return{trees:0,heroes:0,far:0};};
GCH.build=function(opt){opt=opt||{};const R=opt.R==null?2600:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0};
 BIO.cur='greatchasm/floor';Object.assign(out,GCH.buildFloor(R,q));
 BIO.cur=null;return out;};
GCH.canopyH=function(x,z){return 1;};
BIO.kitEnd(GCH);   // its exports run in its registry; the default kit is current again
