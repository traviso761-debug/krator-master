// TARGET: lighthouse — the Lighthouse island (a modified Skyscraper J) on its
// own: intact, rehabilitated and ruined share one sea along the row; the
// toppled one has a sea of its own out at x=1250.
const TITLE='Lighthouse island';
const GROUND_C=0;
const DECAYS=[0,1,2,3];
const ROWS={lighthouse:{z:0,s:320,r:300,t:1250}};   // intact -320, ruined +320, rehab 0, toppled 1250
// ruin greening of the plain: kept inside the berm (r 300 < its foot at 308);
// the toppled site's 420 showed past the berm as a yellow-green smear
const RUINS=[[320,0,300],[1250,0,300],[0,0,300]];
const EXTRA_BUILDERS={lighthouse:buildLighthouse};
