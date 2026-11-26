// ================================================================= ABYSSAL SAVANNAH — build
// The kit's public surface (BIOME-API.md). The passes live in 55 (trees, zones, burn) and 60 (floor, kopjes, caprock).
// ABSAV.build({box, quality, seed, kopjes, rim}):
//   box     [x0,z0,x1,z1] the ground the kit plants (default the core's disc's square)
//   kopjes  [{id,x,z,r,h,seed}] the host's granite tors (their hills are the host's ground; the piles are drawn here)
//   rim     {lip:[[x,z],...], c, r, y0, h} the caprock's lip line, for its blocks and talus
ABSAV.build=function(opt){opt=opt||{};if(opt.seed!=null)ABSAV.SEED=opt.seed>>>0;
 if(!opt.box){const c=BIO.center(),R=opt.R==null?3000:opt.R;opt.box=[c[0]-R,c[1]-R,c[0]+R,c[1]+R];}
 const out={quality:opt.quality==null?1:opt.quality};
 BIO.cur='absav/trees';Object.assign(out,ABSAV.buildTrees(opt));
 BIO.cur='absav/floor';out.floor=ABSAV.buildFloor(opt);
 BIO.cur=null;return out;};
BIO.kitEnd(ABSAV);   // its exports run in its registry; the default kit is current again
