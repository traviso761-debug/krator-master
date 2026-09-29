// TARGET: skyi — Skyscraper I, the Braid, on its own, all four decay levels.
// It joins the kit rows afterwards; this target is where it is developed.
const TITLE='Skyscraper I — the Braid';
const GROUND_C=0;
const DECAYS=[0,1,2,3];
const ROWS={skyI:{z:0,s:300,r:280,t:1200}};   // intact -300, ruined +300, rehab 0, toppled 1200
const RUINS=[[300,0,280],[1200,0,392],[0,0,280]];
const EXTRA_BUILDERS={skyI:buildSkyI};
