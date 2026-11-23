// ================================================================= GALVANIC — build (BIOME-API.md)
// The kit's public surface. A host orders its own passes (88-host-place.js: STATION_BUILD): the battery's life (GALV.place), the Rift's trees on the
// hills (87-host-kin.js, read in place). No fauna here: the ochre wader is a data proposal for kits/fauna (PLAN.md section 8).
GALV.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality;BIO.cur='galvanic/strand';
 const out=Object.assign({R,quality:q},GALV.place(R,q,opt));BIO.cur=null;return out;};
GALV.canopyH=function(x,z){return 1;};
BIO.kitEnd(GALV);   // its exports run in its registry; the default kit is current again
