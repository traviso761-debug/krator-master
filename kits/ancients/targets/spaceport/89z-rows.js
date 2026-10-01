// TARGET: spaceport (dev) — the Iziz spaceport (src/8ao-iz-spaceport.js, buildIzSpaceport) in every decay,
// one row along x, a site per state, 340 m apart, ordered from whole to lived-in:
//   x = -680 worn (5)   -340 intact (0)   0 rehabilitated (3)   +340 ruined (1)   +680 toppled (2)   +1020 reclaimed (4)
// Decay 2 is TOPPLED (the control tower down); the reclaimed state is decay 4, the Project slot. NOTES.md.
// Kit rows are the coordinator's: lift ROWS.izPort (with its ds) into targets/kit.
const TITLE='Iziz spaceport';
const DECAYS=[0,1,2,3,4,5];
const ROWS={izPort:{z:0,s:340,r:150,t:680,j:1020,w:-680,ds:[5,0,3,1,2,4]}};
const GROUND_C=0;
const RUINS=[[340,0,150],[680,0,150],[1020,0,150]];
const EXTRA_BUILDERS={izPort:buildIzSpaceport};
