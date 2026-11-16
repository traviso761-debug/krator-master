// TARGET: theodiga-today — view presets. The first entry is the opening shot. The ruin stands at x = ROWS.dam.s; the town on
// its east rim runs from the Stair of Descent's head (Gate Square, 392 m east of the dam's axis) to the farms (1240 m), the
// plateau at about 440 m (settlements/theodiga/PLAN.md).
const VIEWS={
 'Theodiga today':[ROWS.dam.s+1550,760,ROWS.dam.z+1250,ROWS.dam.s+450,400,ROWS.dam.z],
 'Gate Square':[ROWS.dam.s+540,482,ROWS.dam.z-140,ROWS.dam.s+400,442,ROWS.dam.z-30],
 'Bazaar Street':[ROWS.dam.s+470,454,ROWS.dam.z-24,ROWS.dam.s+820,447,ROWS.dam.z-30],
 'The East Gate':[ROWS.dam.s+960,474,ROWS.dam.z+60,ROWS.dam.s+870,446,ROWS.dam.z-30],
 'The kora corner':[ROWS.dam.s+900,478,ROWS.dam.z-220,ROWS.dam.s+975,446,ROWS.dam.z-305],
 'The farms':[ROWS.dam.s+1320,520,ROWS.dam.z+220,ROWS.dam.s+1100,441,ROWS.dam.z-30],
 // the ways down from the rim (T-town-3): the Stair of Descent from the crest, the two roads down the east wall
 'The Stair of Descent':[ROWS.dam.s+215,420,ROWS.dam.z+70,ROWS.dam.s+305,420,ROWS.dam.z+14],
 'The Salvage Road':[ROWS.dam.s+60,140,ROWS.dam.z+650,ROWS.dam.s+340,200,ROWS.dam.z+390],
 'The Silt Road':[ROWS.dam.s+80,330,ROWS.dam.z-620,ROWS.dam.s+340,350,ROWS.dam.z-330],
 // the works below (T-town-4): the salvage yards on the canyon floor, the silt fields above the lake
 'The salvage yards':[ROWS.dam.s+330,70,ROWS.dam.z+520,ROWS.dam.s+180,8,ROWS.dam.z+395],
 // the bore to Stair (T-town-6): its mouth in the east wall at the canyon floor, the Devisers' lodge beside it
 'The bore to Stair':[ROWS.dam.s+235,24,ROWS.dam.z+545,ROWS.dam.s+335,7,ROWS.dam.z+479],
 'The silt fields':[ROWS.dam.s+150,345,ROWS.dam.z-330,ROWS.dam.s+240,281,ROWS.dam.z-110],
 'The town from the Dome':[ROWS.dam.s-100,520,ROWS.dam.z-280,ROWS.dam.s+700,442,ROWS.dam.z],
 // the arcology's inhabited levels, opened (T-arc-1; 92z-interior-ui.js: a view's eighth element opens a part at one of its
 // levels: src/8zz1-th-arc-host.js splits the dam into parts). The crest at x 100 runs at z -132 to -65 (zc(100) = -126); the
 // fins stand at z -74 to -30; the Dome's centre is z -205
 'Inside the crest':[ROWS.dam.s+150,460,ROWS.dam.z-20,ROWS.dam.s+100,405,ROWS.dam.z-105,0,{site:'dam/crest-e',storey:1}],
 'Inside a fin head':[ROWS.dam.s+85,425,ROWS.dam.z+10,ROWS.dam.s+46,388,ROWS.dam.z-52,0,{site:'dam/fin+46',storey:5}],
 'Inside the Dome':[ROWS.dam.s+70,470,ROWS.dam.z-110,ROWS.dam.s,421,ROWS.dam.z-205,0,{site:'dam/dome',storey:0}],
 // the ruin, as the theodiga target shows it
 'Theodiga ruin':[ROWS.dam.s+60,260,ROWS.dam.z+1000,ROWS.dam.s,200,ROWS.dam.z],
 'Dome ruin':[ROWS.dam.s-420,520,ROWS.dam.z-650,ROWS.dam.s,450,ROWS.dam.z-205],
 'Cascade':[ROWS.dam.s-221+140,70,ROWS.dam.z+430,ROWS.dam.s-221,170,ROWS.dam.z+40],
};
