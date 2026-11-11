// ================================================================= HOST — the bay's rock, read from the geology data (map 5.1)
// The 5.1 rebake (kits/resources/REBAKE-PLAN.md, done R0-R6; ROCK-PROPOSAL.md "Where the biomes must change", rows 3 and 7) says two things
// this page did not draw: a WHITE MARBLE BAND where the Hykkousoi limestone meets volcanic ground (marble to 230 on the platform's edge; the
// towers stay limestone), and ASH SOILS where the vents' tuff apron reaches (the NW bay's to 177). Plain data ([G data]); 45-host-stage.js
// draws it (the ground's KGROUND layers groundMarble and groundAsh) and registers the nodes; tests/test-geology.js recomputes every number
// here from kits/resources/data/geology.json and fails when the data moves.
//
// THE ANCHOR. The page is an ideal type 5 km across and the bake's cells are 4 km, so the page sits in one or two cells: the data cannot draw
// a line on it, only say what its rock is and which way the contact lies. The page is anchored where its own layout matches the data: a
// carbonate cell with the sea beside it to the south and south-east and volcanic ground 4-8 km to the east across the water (the page draws
// its volcano 8 km SE across the bay): 5.1 px (757, 749), world x = px x 2000 (GEOLOGY.md), the page's (0, 0). (KARST-SITES-5.1.md's
// (700, 800) for the tsingy's dry slope reads pure carbonate there, no marble, no tuff and no node in the page's box: it fits the climate,
// not the contact.) What the data says at the anchor, and round it:
//   province carbonate (6), limestone 230, marble 207 (.9 x the limestone within 8 km of volcanic ground), tuff 0
//   4-8 km east: volcanic ground, tuff 93-170 (the apron lies on the volcanic side, downwind of its vents: none reaches the limestone)
//   the NW bay polygon (676-813 x 707-854): water 1817, carbonate 1429, sedimentary 940, volcanic 792, impact 59, evaporite 40, granite 20
//   (cells sampled every 2 px)
// SO THE PAGE DRAWS: the marble band on the limestone at its own volcanic contact (the old lava tongues' and the basalt headland's margins),
// a marble outcrop at each marble node the field puts in the page's box, and ash soils on the volcanic ground itself (the old tongues and
// the basalt: the only ground the tuff reaches at this anchor), not on the limestone.
var NWBAY_GEO={anchor:[757,749],frame:'page metres = (5.1 px - anchor) x 2000',source:'kits/resources/data/geology.json (Krator Scale Model 5.1)',
 here:{province:'carbonate',limestone:230,marble:207,tuff:0},
 // KRES.nodesIn over the page's box (CENTER +- 2500: x -2100..2900, z -2900..2100) at the anchor; ids are the field's own
 nodes:[{id:'res:copper:242:208',kind:'copper',grade:'medium',x:1128.8,z:-2756.5},
  {id:'res:sulfur:484:417',kind:'sulfur',grade:'low',x:-1162.2,z:-2503.2},
  {id:'res:sulfur:484:418',kind:'sulfur',grade:'low',x:-817.4,z:-1301.6},
  {id:'res:marble:323:278',kind:'marble',grade:'medium',x:1320.4,z:-1729.1},
  {id:'res:marble:323:279',kind:'marble',grade:'medium',x:-223,z:-22.8}],
 // the drawing's own sizes (the look, for the owner's eye): the band's reach out from the volcanic margin (m, as the margin's falloff in the
 // tongue's own field) and an outcrop's radius at a marble node
 band:{lavaEdge:[.0,.1,.45],outcrop:46},
 // the ash soil: the stand-in colour over the library's grey ash (ground.ash) until a dark, fertile ash soil (an andosol) is sourced:
 // core/materials/PROMPTS-NEEDED.md has its prompt
 ash:{tint:[.46,.40,.35]}};
