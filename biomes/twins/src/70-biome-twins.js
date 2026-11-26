// ================================================================= TWINS — build
// The biome's public surface (BIOME-API.md). The passes live in 60; this file orders them and reports.
//   TWINS.build({R, quality, box, route:[[x,z],...], warm:[[x0,z0,x1,z1],...]})   the ground's loose stuff and the warm collars over
//                       the box; route: the line the guides' cairns mark (a sprint of Route A, a dash of Route B); warm: the boxes round
//                       each warm place (a skylight, a tube's mouth, an oasis) the collar pass walks
//                       oasis: {boxes, dry(x,z), pines, wind}: the oases' life on the station's heat (60: TWINS.buildOasis)
//   TWINS.groundAt(x, z)                                the ground's class weights (50), for a host's painter
//   TWINS.tagsOf(label)                                 the inspector's words for an item
TWINS.build=function(opt){opt=opt||{};const R=opt.R==null?4800:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,ms:{}},now=()=>performance.now();let t=now();
 BIO.cur='twins/ground';Object.assign(out,TWINS.buildGround(R,q,opt.box,opt.route,opt.warm));out.ms.ground=Math.round(now()-t);
 if(opt.oasis){t=now();BIO.cur='twins/oasis';Object.assign(out,TWINS.buildOasis(q,opt.oasis));out.ms.oasis=Math.round(now()-t);}
 BIO.cur=null;BIO.range=null;BIO.owner=null;BIO.minRange=0;return out;};
TWINS.dress=function(){return null;};   // nothing grows on a structure in the frost (PLAN.md section 5, zone 5)
TWINS.tagsOf=function(label){const d=Object.keys(BIO.defs).map(k=>BIO.defs[k]).find(d=>d.label===label);
 return d?{name:d.label,cls:(d.cls||'feature')+' ('+(d.kind||'rock')+')',tags:Object.assign({},TWINS.TAGS)}:null;};
BIO.kitEnd(TWINS);   // its exports run in its registry; the default kit is current again
