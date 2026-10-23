// ================================================================= HOST — the world round the site (the scale model at 1:1)
// The open world's fields (openworld/little-demo/src/41-world-fields.js, read in place) over the cut round the site
// (region/data: tools/scale-model/extract_region.py; decoded at build time into WORLD_R by tools/world_data.py). The page's
// floor is the knoll as the model has it (45: floorH), and the far terrain out to the Inner Wall is drawn from the same
// fields (86). y 0 on this page is the knoll's ground at the mesa's south foot: WORLD_H0 is the model's height there.
WORLD.init(WORLD_R);
const WORLD_H0=WORLD.H(0,650);
