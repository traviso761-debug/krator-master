// ================================================================= HOST — the station: THE HIGH FLANK (station 2)
// PLAN.md section 7: the Godthrone's south-east flank at ~11 km (0.40 atm), at 4.22's flank vent (px 716, 1128, 11,080 m),
// 300 km from the summit. Its ground model is stations/flank/45b-host-model.js (its own frame); no summit vent, no portal.
const STN={key:'flank',title:'Krator Godthrone: the high flank',
 hint:'The Godthrone\'s high flank (station 2): a black titanium-basalt plain at 11 km, four tenths of an atmosphere, falling away from the summit; a sinuous rille from an old vent, a chain of pits where a lava tube\'s roof fell in, the old vents\' rings of black beads, frost in the shadows. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:716,py:1128},
 spine:()=>[[VENT.x,VENT.z],xzDA(0,0),xzDA(2500,300),xzDA(-1000,1500),xzDA(1500,1700),xzDA(-3000,-1000)]};
