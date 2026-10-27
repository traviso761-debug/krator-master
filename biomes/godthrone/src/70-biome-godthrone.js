// ================================================================= GODTHRONE — build
// The biome's public surface (BIOME-API.md). The passes live in 60; this file orders them and reports.
//   GODT.build({R, quality, box, vent:[x,z]})   the ground's loose stuff over the box (vent: where the halo's centre is)
//   GODT.groundAt(x, z)                         the ground's class weights (50), for a host's painter
//   GODT.tagsOf(label)                          the inspector's words for an item
GODT.build=function(opt){opt=opt||{};const R=opt.R||4800,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,ms:{}},now=()=>performance.now();let t=now();
 if(opt.vent)GODT.VENT_AT=opt.vent;
 BIO.cur='godthrone/ground';Object.assign(out,GODT.buildGround(R,q,opt.box));out.ms.ground=Math.round(now()-t);
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
GODT.dress=function(){return null;};   // nothing grows on a structure at the summit (PLAN.md section 5)
GODT.tagsOf=function(label){const d=Object.keys(BIO.defs).map(k=>BIO.defs[k]).find(d=>d.label===label);
 return d?{name:d.label,cls:'feature ('+(d.kind||'rock')+')',tags:Object.assign({},GODT.TAGS)}:null;};
BIO.kitEnd(GODT);   // its exports run in its registry; the default kit is current again
