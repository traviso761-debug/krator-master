// TARGET: strongbow-today — Strongbow as it stands now (settlements/strongbow): the arcology's ruin (targets/strongbow, read in
// place) with what Xanadu, the Order and the outcasts have made of it, drawn from the settlement's layout
// (settlements/strongbow/src/30-sb-layout.js; the drawing src/8ax0-sb-reclaim.js): the girder lifts and the elevator to the lip, the
// bridges, the rope ways, the bazaar in the lobby, the serai, the Order's balloon on the Nock, the Sultanate's post at the lip.
// SB3: the town's rings at the foot, on core/city with the scrap Xanadu set (src/40-sb-town.js, src/8ax1-sb-town.js).
const TITLE='Strongbow today';
const GROUND_C=0;
const DECAYS=[1];
// SB_TODAY: the arcology's builder leaves out its placeholder town; the settlement draws its own
const SB_TODAY=true;
const ROWS={
 strongbow:{z:0,s:0,r:700},
};
const RUINS=[[0,300,700]];
/* SB_CUTS: what the arcology opens for the walk up (settlements/strongbow/src/32-sb-walk.js: the lobby's and core's doors, the
   neck's and ring building's at T1, L1's and W2's shafts), set before it builds; targets/strongbow reads it where defined */
var SB_CUTS=null;
const EXTRA_BUILDERS={strongbow:(scene,gx,gz,d)=>{SB_CUTS=sbWalkCuts();const G=buildStrongbow(scene,gx,gz,d);sbReclaim(gx,gz);sbTownDraw(gx,gz);sbWalkDraw(gx,gz);sbCutaway(gx,gz);return G;}};
