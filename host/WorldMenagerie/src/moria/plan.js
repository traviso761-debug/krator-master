// ---------- the plan of Khazad-dum ----------
// Where everything is, in metres (x east, z south; north is -z), in step with tools/make-moria.py. The two gates
// are the generator's; everything between them is laid out here and built by halls.js.
//
// As the Fellowship went (The Fellowship of the Ring, II 4-5): in at the Doors, up a stair of two hundred steps,
// along the road east - past the guard-room with the well, and to the fork of three arches where Gandalf took the
// right-hand way, the one going up - to the great halls. The Twenty-first Hall of the North-end and the Chamber
// of Mazarbul beside it are on the Seventh Level, six above the Gates; from Mazarbul a stair goes down south to
// the Second Hall, with the fissure of fire across its floor, and at its east end the chasm, fifty feet from side
// to side, with the Bridge over it; then the First Hall, and the Great Gates onto the Dimrill Stair.
export const WGATE={x:-6000,z:900,y:905};           // the West-gate: the Doors of Durin, in the Walls of Moria
export const EGATE={x:5600,z:0,y:1450};             // the Dimrill Gate, over the Dimrill Stair
export const FLOOR=1450;                            // the level of the Gates, and of the great halls at the east end
export const LEVEL=16;                              // one level of the city
export const SEVENTH=FLOOR+6*LEVEL;                 // the Seventh Level
// [x0, x1, z0, z1, floor, height]
export const HALLS={
  dwarrowdelf:[3700,4700,-180,180,FLOOR,75],        // the great hall of pillars, galleried on every level
  passage:[4700,4750,-12,12,FLOOR,22],
  second:[4750,5170,-55,55,FLOOR,55],               // the Second Hall: a double line of pillars carved like trees
  chasm:[5170,5186,-200,200,FLOOR-400,425],         // the chasm, fifty feet across, and the Bridge over it
  first:[5186,5590,-30,30,FLOOR,26],                // the First Hall, out to the gate
  landing:[4552,4568,-368,-352,SEVENTH,9],          // the head of the stair up from the great hall
  twentyfirst:[4700,4940,-400,-320,SEVENTH,34],     // the Twenty-first Hall of the North-end
  mazarbul:[4940,4966,-372,-348,SEVENTH,12],        // the Chamber of Mazarbul: Balin's tomb
  westhall:[-5996,-5940,880,920,WGATE.y,18],        // inside the West-gate, at the foot of the stair (its west wall kept behind the cliff)
  guard:[-3010,-2990,690,710,1060,10],              // the guard-room, with the well in it
  fork:[-520,-480,380,420,1200,16],                 // three arches: Gandalf took the right-hand one
  // ---- the city ----
  // Khazad-dum was a city, not a mine with a hall in it: "the great realm and dwarf-city of the Dwarrowdelf".
  // These are this project's own, made to sit with what the book gives - many-pillared halls, mansions, forges,
  // the mithril, the deep waters - and each is joined to the great hall by a stair.
  mansions:[3800,4600,300,720,FLOOR-3*LEVEL,150],   // the Hall of the Mansions, the Third Deep: a street-city under a vault
  forges:[4600,4980,300,520,FLOOR-3*LEVEL,60],      // the Great Forges, through the east wall of the Mansions
  delvings:[4620,5040,700,980,FLOOR-10*LEVEL,90],   // the mithril Delvings, the Tenth Deep, round the pit of the lode
  throne:[3950,4350,-760,-460,FLOOR+2*LEVEL,70],    // the Hall of Durin's Throne, the Third Level
  cistern:[3450,3900,-900,-420,FLOOR+2*LEVEL-18,52],// the Great Cistern, beside the throne-hall: pillars standing in dark water
};
// the passages: polylines of [x, z, y]; w wide, h high. stairs: the passage is stepped
export const PASSAGES={
  stair:{p:[[-5940,900,905],[-5880,900,935]],w:8,h:10,steps:200},      // "two hundred steps, broad and shallow"
  road1:{p:[[-5880,900,935],[-3010,700,1060]],w:8,h:9,gap:0.62},        // gap: the fissure across the floor they had to leap
  road2:{p:[[-2990,700,1060],[-520,400,1200]],w:8,h:9},
  left:{p:[[-480,386,1200],[-420,370,1186]],w:7,h:8,end:true},          // the two ways not taken, lost in the dark
  mid:{p:[[-480,400,1200],[-410,400,1200]],w:7,h:8,end:true},
  road3:{p:[[-480,414,1200],[3700,0,FLOOR]],w:8,h:9},                    // the right-hand way, going up, to the great hall
  up:{p:[[4560,-180,FLOOR],[4560,-352,SEVENTH]],w:9,h:10,steps:320},    // from the great hall up to the Seventh Level
  north:{p:[[4568,-360,SEVENTH],[4700,-360,SEVENTH]],w:8,h:9},
  down:{p:[[4953,-348,SEVENTH],[4953,-55,FLOOR]],w:4,h:5,steps:420},    // from Mazarbul down south to the Second Hall
  grand:{p:[[4200,180,FLOOR],[4200,300,FLOOR-3*LEVEL]],w:16,h:16,steps:160},   // the Grand Stair, down into the Mansions
  mineway:{p:[[4800,520,FLOOR-3*LEVEL],[4800,700,FLOOR-10*LEVEL]],w:8,h:9,steps:370},   // the miners' stair, forges to Delvings
  kings:{p:[[4150,-180,FLOOR],[4150,-460,FLOOR+2*LEVEL]],w:12,h:14,steps:107},   // the Kings' Stair, up to the throne-hall
  cisternway:{p:[[3950,-610,FLOOR+2*LEVEL],[3900,-610,FLOOR+2*LEVEL]],w:8,h:9},    // through the throne-hall's west wall
};
export const PIT={x:4830,z:840,r:55};                                   // the pit of the lode, in the Delvings
export const WATER=FLOOR+2*LEVEL-6;                                     // the cistern's water; its causeways stand at the Third Level
export const BRIDGE={x0:5170,x1:5186,z:0,w:1.6,rise:1.4};               // "one curving spring of fifty feet"
export const FISSURE={x:5114,w:2.4};                                    // "right across the floor, close to the feet of two huge pillars"
export const TOMB=[4955,-360];
export const TIERS=[0,16,32,48];                                        // the galleries on the walls of the great hall, one to a level
