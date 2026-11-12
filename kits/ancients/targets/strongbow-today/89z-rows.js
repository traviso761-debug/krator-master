// TARGET: strongbow-today — Strongbow as it stands now (settlements/strongbow): the arcology's ruin (targets/strongbow, read in
// place) with what Xanadu, the Order and the outcasts have made of it, drawn from the settlement's layout
// (settlements/strongbow/src/30-sb-layout.js; the drawing src/8ax0-sb-reclaim.js): the girder lifts and the elevator to the lip, the
// bridges, the rope ways, the bazaar in the lobby, the serai, the Order's balloon on the Nock, the Sultanate's post at the lip.
// The town's rings (core/city, the scrap Xanadu set) are the settlement's next stage, SB3.
const TITLE='Strongbow today';
const GROUND_C=0;
const DECAYS=[1];
// SB_TODAY: the arcology's builder leaves out its placeholder town; the settlement draws its own
const SB_TODAY=true;
const ROWS={
 strongbow:{z:0,s:0,r:700},
};
const RUINS=[[0,300,700]];
const EXTRA_BUILDERS={strongbow:(scene,gx,gz,d)=>{const G=buildStrongbow(scene,gx,gz,d);sbReclaim(gx,gz);return G;}};
