// ================================================================= OUTLANDS — build
// The kit's public surface (BIOME-API.md). The pass is 60 (the colonies and their forms); this file orders it and reports. No
// fauna here: the hexapods are kits/fauna's (PLAN.md section 7).
OUTL.build=function(opt){opt=opt||{};const R=opt.R==null?3200:opt.R,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q};
 BIO.cur='outl/colonies';Object.assign(out,OUTL.buildColonies(R,q,opt));
 /* the solitary decay layer, where the host asks for it (a later station: its deadwood, carrion and dark fields) */
 if(opt.decay){BIO.cur='outl/decay';out.decay=OUTL.buildDecay(R,q);}
 BIO.cur=null;return out;};
BIO.kitEnd(OUTL);   // its exports run in its registry; the default kit is current again
