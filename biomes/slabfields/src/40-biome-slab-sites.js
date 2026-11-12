// ================================================================= THE SLABFIELDS — the stations' sites (PLAN.md sections 5 and 13)  [G data]
// Scale model 5.1 after edit 3 (tools/scale-model/edit_513.py, surveyed 2026-11-12 through smodel/page.py). Each page is a 5.2 km ideal type (R 2600 m)
// of its place: it takes the model's numbers (heights, the climate), not its pixels. Page metres: x east, z south, origin the page's centre.
// px: the 5.1 canvas (old canvas = minus 272, 330); world: the geology's frame (x = px * 2000, z = py * 2000). sky: the old canvas px the shared sky
// (ATMOS.skyBiome) is placed by. Plain data: no THREE, no DOM; the stage (45-host-stage.js) draws the land from these records.
var SLAB_SITES={
 // STATION 1: THE ANVIL'S FOOT. The Anvil (edit 513's slab_anvil: 40 x 18 km, crest 5,356 m, ramp 7 degrees south) stands on the middle bench (3,287 m);
 // its cliff faces north. The page sits on its most recent landslide apron, between the cliff (south) and the apron's toe and spring line (north).
 // The model's apron (4 cliff heights, 264 km2) is the sum of many collapses; the page draws the last lobe: 3.6 km from the foot, H/L 0.46 (a
 // collapse of a cubic kilometre or two; PLAN.md section 3.4). The cliff's height over the bench: 5,280 m at the rim less the bench's 3,300.
 foot:{key:'foot',name:'The Anvil\'s Foot',station:1,px:[1662,1369],world:[3324000,2738000],sky:{px:1390,py:1039},
  base:3290,atm:1.07,koppen:'Dsc',rain:141,temp:{mean:8,warm:21,cold:-5,low:-15},snow:[5150,5500],
  // the model's th and tl are unset (-90) on these cells: low is the kit's estimate (the cold month less ten), PLAN.md section 5
  slab:{id:'slab_anvil',name:'The Anvil',rimZ:2200,bow:2400,half:20000,h:1990,run:650,dip:.123,crest:5356,
   benches:3,talus:{h:150,reach:380}},
  apron:{x0:150,run:3600,foot:110,rim:1.4,half:[2500,1500],hummock:22,levee:18},
  blocks:{n:48,big:7,r:[7,26],bigR:[34,58],H:[6,22],bigH:[18,34]},
  // the spring line at the toe: water through the rubble rises where the apron's toe meets the bench's tight ground (x, z off the toe line, r, m)
  seeps:{n:9,from:-1900,to:1700,r:[7,20]},
  brook:{to:[-2860,-2860],w:3.2},
  // the gas: CO2 from the faults settling in the toe's hollows and the voids under the blocks on still nights (PLAN.md section 11)
  gas:{night:true,hollows:3,voids:4},
  far:{bench:3290,edgeN:26000,edgeDrop:900}}};
