// TARGET: skyk — Skyscraper K, the Sail, on its own: intact, ruined, toppled and
// rehabilitated in one row, the way the kit shows its skyscrapers.
const TITLE='Skyscraper K — the Sail';
const GROUND_C=0;
const DECAYS=[0,1,2,3];
const ROWS={skyK:{z:0,s:300,r:280,t:1200}};   // intact -300, ruined +300, rehab 0, toppled 1200
const RUINS=[[300,0,280],[1200,0,392],[0,0,280]];
const EXTRA_BUILDERS={skyK:buildSkyK};
