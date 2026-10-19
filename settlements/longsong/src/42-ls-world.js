// ================================================================= HOST — the world round the site (the scale model at 1:1)
// The open world's fields (openworld/little-demo/src/41-world-fields.js, read in place) over the cut round Longsong
// (region/data: tools/scale-model/extract_region.py; decoded at build time into WORLD_R by Pinnacle Rock's
// tools/world_data.py). The page's origin is LS.SITE (40-ls-plan.js): WORLD coordinates are page + (SITE.wx, SITE.wz),
// and y 0 on this page is the model's height there.
WORLD.init(WORLD_R);
const WX=LS.SITE.wx,WZ=LS.SITE.wz;
const WORLD_H0=WORLD.H(WX,WZ);
// the model's land in page coordinates (minWave: leave out detail finer than it, for the far terrain)
function landH(x,z,mw){return WORLD.H(x+WX,z+WZ,mw||0)-WORLD_H0;}
function worldWater(x,z){const w=WORLD.water(x+WX,z+WZ);return w>-1e8?w-WORLD_H0:-1e9;}
