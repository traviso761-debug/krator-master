// ================================================================= ARCH — build (BIOME-API.md)
// The kit's public surface (ARCHB; the data and chemistry are ARCH, 40-42). The stations order their own passes (88-host-place.js: STATION_BUILD): the
// life on the ground (ARCHB.buildArch), the curtains along the meeting (ARCHB.curtains), the seep combs at the flames (ARCHB.combs). No fauna here: the
// fauna kit's (PLAN.md section 8).
ARCHB.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;BIO.cur='arch/life';
 const out=Object.assign({R,quality:q},ARCHB.buildArch(R,q,opt));BIO.cur=null;return out;};
ARCHB.canopyH=function(x,z){return 3;};
BIO.kitEnd(ARCHB);   // its exports run in its registry; the default kit is current again
