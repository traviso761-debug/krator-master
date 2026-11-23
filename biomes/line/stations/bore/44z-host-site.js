// ================================================================= HOST — the station's site: the bore (bore km 208.0-209.2 of the Rift line)
// Scale model 5.1 (biomes/line/PLAN.md section 1; tools/survey_line.py): px 445.5,1262, line km 302 from Dalab, bore km 208 from the north
// portal. The invert (y = 0) at 3,527 m (the bore's floor graded -0.04 % from the north portal's 3,614 m to the south portal's 3,501 m); the
// surface 2.4 km over it (5,950 m, the fells over the rift fill: rain 417 mm, no sky reaches down); the rock round the lining the rift fill at
// about 50-55 degC (the survey's virgin rock temperature: the surface's mean and 25 degC a km of cover); the air in the kept gallery warm, about
// 30 degC (the cooling's reach this close to the south door, PLAN.md section 6).
const SITE={key:'bore',name:'The bore',region:'The Rift line, the long run, south of the south door (bore km 208)',px:445.5,py:1262,
 s0:208000,                  /* the window's chainage origin: z = s - s0 (metres along the bore from the north portal) */
 G:3527,                     /* the invert's height (m) */
 cover:2410,                 /* the rock over the invert (m): the KCAVERN ground */
 rockT:55,airT:30,rain:417,atm:1.0,
 world:20261111,
 rock:'rift fill',ore:{family:'rare-earth',with:['copper'],bytes:{'rare-earth':190,copper:120}}};
