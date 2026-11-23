// ================================================================= DOUBLEDELTA — BIOME-API build entry & canopy query (PLAN.md §10)  [G data]
// Closes BIO.kit('doubledelta') and exposes window.DOUBLEDELTA (aliased as DDELTA).
DOUBLEDELTA.build=function(opt){
 opt=opt||{};
 const R=opt.R==null?2450:opt.R,q=opt.quality==null?1:opt.quality;
 BIO.cur='doubledelta/life';
 const out=Object.assign({R,quality:q},DOUBLEDELTA.buildDelta(R,q,opt));
 BIO.cur=null;
 return out;
};
DOUBLEDELTA.canopyH=function(x,z){
 const eco=typeof ECOTONE_AT==='function'?ECOTONE_AT(x,z):null;
 return eco&&eco.woodyOk?14:3.5;
};
BIO.kitEnd(DOUBLEDELTA);
