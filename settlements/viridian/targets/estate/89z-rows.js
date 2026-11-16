// TARGET: estate — the Order of Viridian Thought's head monastery and its tea and herb estate on the scarp (settlements/viridian
// /PLAN.md; step V6, a first pass). The page is Xanadu's, as the Azure Dream's and Kirstabal's are: window.CITY skips the kit
// sheet's showcase in 90-scene; no sheet rows; the site places itself (89zva, 89zvb, 90va, 90vb). TITLE names the page.
window.CITY=true;window.CITY_BUILD='viridian';   /* the page's name in core/host and core/tags (Xanadu's 99-start.js, 91t) */
const TITLE='Viridian Thought - the head house and its tea estate';
XA.families=()=>[];
const XA_EXTRA=[];
const SITES=[];
// the site: the page's origin the house's court at scale-model px 962,1562 (T.viridian); x east (up the hollow), z south, y the
// ground's own height in metres. BOX the near ground (8 m cells): the valley's edge west of the buyers' court to the High
// Garden's top, the hollow's two flanks; FINE the fine ground (2.5 m cells: the terraces' treads and risers read) round the
// house and the Low Garden's nearest treads; the flora's origins over the near ground
const VT_SITE={PX:[962,1562],BOX:[-1200,-1400,2800,1400],FINE:[-480,-760,160,760],
 bio:{origin:[[-700,0],[-300,-500],[-300,500],[500,-700],[500,700],[1200,0],[1600,-900],[1600,900],[2400,0]],center:[800,0],R:2450}};   /* R: the disc round center, to the near box's corners */
