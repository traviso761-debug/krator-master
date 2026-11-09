// ================================================================= GODSTEP — build
// The biome's public surface (BIOME-API.md). The passes live in 60; this file orders them and reports.
//   GSTEP.build({R, quality, box, path:[[x,z],...]})   the ground's loose stuff and the pioneers over the box (path: the procession's
//                                                     way, where its cairns stand)
//   GSTEP.groundAt(x, z)                              the ground's class weights (50), for a host's painter
//   GSTEP.tagsOf(label)                               the inspector's words for an item
GSTEP.build=function(opt){opt=opt||{};const R=opt.R==null?4800:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,ms:{}},now=()=>performance.now();let t=now();
 GSTEP.PATH_PTS=opt.path||[];
 BIO.cur='godstep/ground';Object.assign(out,GSTEP.buildGround(R,q,opt.box));out.ms.ground=Math.round(now()-t);
 /* a station's own passes (GSTEP.PASSES, 51-biome-godstep-stalk.js: the rille's stalk fields, the redlands' shrubs, the wall's forest) */
 for(const P of GSTEP.PASSES){t=now();BIO.cur='godstep/'+P.name;Object.assign(out,P.fn(R,q,opt.box||[-R,-R,R,R])||{});out.ms[P.name]=Math.round(now()-t);}
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
GSTEP.dress=function(){return null;};   // nothing grows on a structure here
GSTEP.tagsOf=function(label){const d=Object.keys(BIO.defs).map(k=>BIO.defs[k]).find(d=>d.label===label);
 return d?{name:d.label,cls:(d.cls||'feature')+' ('+(d.kind||'rock')+')',tags:Object.assign({},GSTEP.TAGS)}:null;};
BIO.kitEnd(GSTEP);   // its exports run in its registry; the default kit is current again
