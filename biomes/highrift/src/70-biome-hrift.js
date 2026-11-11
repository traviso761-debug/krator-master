// ================================================================= HIGH RIFT — build (BIOME-API.md)
// The kit's public surface. The stations order their own passes (89z: STATION_BUILD in 88-host-vents.js): the Hearths' fields on the vents, the
// rift's own life (HRIFT.buildRift), the high country (OIDONG.buildHigh, read in place), the larch (the Mirror's kin), the crystals (HRIFT.combs).
// No fauna here: the fauna kit's (PLAN.md section 6).
HRIFT.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;BIO.cur='highrift/rift';
 const out=Object.assign({R,quality:q},HRIFT.buildRift(R,q,opt));BIO.cur=null;return out;};
HRIFT.canopyH=function(x,z){return 2;};
BIO.kitEnd(HRIFT);   // its exports run in its registry; the default kit is current again
