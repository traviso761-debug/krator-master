/* ==================== DROWN — BIOME-API build entry & canopy query ([G data], PLAN.md section 7) ==================== */
/* Closes BIO.kit('drownlands') and exposes window.DROWN (aliased as DROWNLANDS). */

DROWN.build=function(opt){
 opt=opt||{};
 const R=opt.R==null?660:opt.R,q=opt.quality==null?1:opt.quality;
 BIO.cur='drownlands/life';
 const out=Object.assign({R,quality:q},DROWN.buildDrown(R,q,opt));
 BIO.cur=null;
 return out;
};

DROWN.canopyH=function(x,z){
 const eco=typeof physSampleAt==='function'?physSampleAt(x,z):null;
 if(!eco)return 4.0;
 if(eco.zone==='refugeskerry')return 15.0;
 if(eco.zone==='snaglagoon')return 12.0;
 if(eco.zone==='propwood')return 8.5;
 return 1.8;
};

BIO.kitEnd(DROWN);
