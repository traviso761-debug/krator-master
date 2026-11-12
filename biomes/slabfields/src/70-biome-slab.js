// ================================================================= THE SLABFIELDS — build (BIOME-API.md)
// The kit's public surface. The station orders its own passes (89z: STATION_BUILD in 88-host-place.js): the apron's life (SLAB.buildApron), the
// high country's cushions on the dry bench (OIDONG.buildHigh, read in place). No fauna here: the fauna kit's (PLAN.md section 9).
SLAB.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;BIO.cur='slabfields/apron';
 const out=Object.assign({R,quality:q},SLAB.buildApron(R,q,opt));BIO.cur=null;return out;};
SLAB.canopyH=function(x,z){return 1;};
BIO.kitEnd(SLAB);   // its exports run in its registry; the default kit is current again
