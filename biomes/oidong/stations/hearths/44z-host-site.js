// ================================================================= HOST — STATION 3, THE COLD HEARTHS: the site (biomes/hearths/PLAN.md sections 5, 11 item 3; 2026-11-03)
// The north rim's vent on scale model 5.1 (surveyed 2026-11-03): px 1186,1591 (old canvas 914,1261), 4,333 m, Dsc, 110 mm a year, mean -3 degC (warmest
// month +10, coldest -16, night low -25), 0.93 atm, 30 km relief 3.2 km; the valley 12 km south and 2.3 km down, the ET ground rising north to 5-5.6 km.
// The page is the passes' cold desert (stations/passes: this station's "base") on these numbers: the rim's shelf at 4,330 m, the edge to the SOUTH (the
// valley) and the heights to the north (flip -1), the pilgrims' road passing south of the disc with a cairn and prayer stones at its edge, and the field
// itself at the map's centre (88-host-high.js, 89b-host-hearths.js).
const STATION_SITE={base:4330,flip:-1,cold0:4100,region:'The Cold Hearths on the Oidong Valley\'s north rim (station 3, ideal type)',snow:[4380,4900],farBase:2700,roadA:190,
 knobs:[[-1050,-620,420,170],[1150,-680,460,200]],tarn:[-700,240,40],hollows:[[-1600,300,240],[1500,350,260],[-400,900,200],[600,-900,220]],
 cairns:[[-60,-12,2.0],[40,-14,1.6],[-1400,6,1.4],[1500,-6,1.5],[-2150,5,1.2],[2150,-5,1.3]],walls:[[-300,-170,-10],[180,320,-10]]};
const VENT={id:'cold-hearth',kind:'point',x:0,z:0,T:96,reach:150,decay:2.2,name:'The Cold Hearths\' vent'};
