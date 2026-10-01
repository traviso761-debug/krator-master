// TARGET: skyj — Skyscraper J, the Whorl, on its own: intact, ruined,
// rehabilitated and toppled in one row, the way it will stand in the kit.
const TITLE='Skyscraper J — the Whorl';
const GROUND_C=0;
const DECAYS=[0,1,2,3];
const ROWS={skyJ:{z:0,s:300,r:280,t:1200}};   // intact -300, ruined +300, rehab 0, toppled 1200
const RUINS=[[300,0,280],[1200,0,392],[0,0,280]];
const EXTRA_BUILDERS={skyJ:buildSkyJ};
