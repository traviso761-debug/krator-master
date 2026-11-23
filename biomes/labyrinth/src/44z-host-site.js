// ================================================================= HOST — the site: STATION 1, THE GATE (PLAN-GATE.md section 2; 2026-11-11)
// Each station's land as numbers, read by the one stage (45-host-stage.js); a station replaces this fragment (stations/<name>/44z-host-site.js).
// THE SITE (scale model 5.1, surveyed 2026-11-11): the neck of the Labyrinth's one eastern opening, px 376.5,1473.5 (old canvas px 104.5,1143.5).
// The Gowd Warra (r331, 40 m3/s) runs its flat reach here (bed 1,121 m), and widens into the Hall of Heroes' reflecting pond. The floor is flat at
// 1,100-1,140 m; Cfb, mean 13 degC, 850-925 mm. The north wall's broken toe rises 3-5 km north (2.4 km at px 381,1468, 4 km at 385,1465, 6.4 km
// at 385,1462); the south side climbs from 1.2 km at px 383,1479 to 3 km at 392,1479. Both stand past the square, in the far field (85), from the
// scale model's own heights (MODEL_H: build.py cuts them, 44m). 1.39 atm (1.6 atm x e^(-1131/8000)).
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE HALL       the Hall of Heroes (kits/ancients targets/gatearc) at the middle, standing in its pond; its causeways to the banks
//   THE STACKS     five carved stacks on the pond's north bank, bridged to the Hall (the same target's set piece)
//   THE RIVER      the Gowd Warra from the west edge into the pond's west inlet, out over the weir on the east into the neck
//   THE FLOOR      steppe and parkland, gallery woods along the river; the chaos's wild knobs about the floor
const SITE={key:'gate',name:'The Gate',hall:true,region:'The Gate: the Labyrinth\'s eastern mouth (the Labyrinth, region rmw8bqrn3dnx4)',px:376.5,py:1473.5,old:{px:104.5,py:1143.5},
 atm:1.39,koppen:['Cfb','Dfb','ET'],rain:900,mean:13,
 flora:'parkland',   /* the flora kit's profile (src/55, LABY.PROFILES): Cfb: birch stands and scattered larch over a grazed floor, poplar and willow by the river and the pond */
 floor:1131,                    /* the floor at the Hall (the model's cells 372-378, 1472-1476) */
 tilt:[-.0032,.0006],           /* the floor's fall along x and z (m/m): the river's way, west to east, 4 m/km as the model's bed falls */
 flatR:[760,1100],              /* the floor is levelled round the Hall to here, so its pond's banks are level */
 pond:{drop:1.5},               /* the pond's water under the floor at the Hall: the Hall's frame y 0 (GATEARC.host.y) */
 river:{name:'The Gowd Warra (r331)',hw:13,depth:2.4,
  in:[[-2900,330],[-2300,250],[-1700,180],[-1150,90],[-700,30],[-452,0]],     /* to the pond's west inlet (the Hall's frame) */
  out:[[452,0],[700,-30],[1150,-90],[1700,-120],[2300,-160],[2900,-190]]},    /* from the weir, east into the neck */
 knobs:[                        /* the chaos's wild knobs on the floor (KSTACKS; the carved five are the Hall's set piece) */
  {kind:'butte',x:-1650,z:-1250,seed:7461,tiers:[{h:150,r:110,e:1.4,ry:.7},{h:80,r:70,e:1.3,ry:.8}]},
  {kind:'spire',x:-2050,z:-650,seed:7462,H:240,r:70,taper:.35,crown:.7},
  {kind:'mesa',x:1350,z:-1500,seed:7463,tiers:[{h:120,r:160,e:1.5,ry:-.3},{h:70,r:110,e:1.4,ry:-.2}]},
  {kind:'spire',x:1900,z:-950,seed:7464,H:180,r:55,taper:.4,crown:.75,lean:.05},
  {kind:'butte',x:-900,z:1700,seed:7465,tiers:[{h:90,r:95,e:1.3,ry:.2},{h:50,r:60,e:1.2,ry:.3}]},
  {kind:'spire',x:1500,z:1500,seed:7466,H:130,r:45,taper:.4,crown:.7}],
 snowLine:[4900,5600],          /* the walls' snow (the far field and the snow cover) */
 sky:{air:{pressure:1.39,humidity:.72},clouds:{cover:.45,cumulus:.45,cirrus:.25}},
 views:'gate'};
