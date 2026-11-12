// ================================================================= OPAL VALLEY — build (BIOME-API.md)
// The kit's public surface. The stations order their own passes (89z runs STATION_BUILD, 88-host-flora.js): the Xanadu kin (OPAL.buildKin), the kit's
// own plants (OPAL.buildOwn), Oidong's high country on the cold stations (read in place). No fauna here: the fauna kit's (PLAN.md section 9, item 8).
OPAL.build=function(opt){opt=opt||{};const R=opt.R==null?2500:opt.R,q=opt.quality==null?1:opt.quality,c0=BIO.cur;
 BIO.cur='opalvalley/kin';const kin=OPAL.buildKin(R,q,opt);BIO.cur='opalvalley/own';const own=OPAL.buildOwn(R,q,opt);BIO.cur=c0;
 return Object.assign({R,quality:q,kin},own);};
OPAL.canopyH=function(x,z){return 12;};
BIO.kitEnd(OPAL);   // its exports run in its registry; the default kit is current again
