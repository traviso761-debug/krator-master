// TARGET: east-end — East End, a fishing village of Grēṭ-Āil (settlements/azure-dream/PLAN.md section 8): the south shore's flat 5.4 km east of the cove: the isle's true east end is a steep coast at 1:1 with no flat ground for a village. The page
// is Xanadu's, as the isle's is: window.CITY skips the kit sheet's showcase; no sheet rows; the village places itself through
// core/hamlet (src/89zac-ad-village.js). TITLE is read by build.py for the page <title>.
window.CITY=true;window.CITY_BUILD='azure-dream-village-east-end';   /* the page's name in core/host and core/tags */
const TITLE='Grēṭ-Āil — Īsṭ-Ēn (East End)';
XA.families=()=>[];
const XA_EXTRA=[];
const SITES=[];
// the site (src/89zaa-ad-ground.js): the page's origin the village point, scale-model px 851.5, 1508.8 (probed on the 1:1
// shore: dry and gentle 120 m round, the water within 450 m); the near ground 1.6 km square; the village's people (PLAN.md section 3)
const AD_SITE={id:'east-end',PX:[851.5,1508.8],BOX:[-800,-800,800,800],bio:{origin:[[0,0],[200,0],[-200,0],[0,200],[0,-200]],center:[0,0],R:1135},
 village:{id:'lk.great-isle-east',name:'Īsṭ-Ēn',pop:150,herds:true}};   /* herds: the Order's meadows (PLAN.md section 8) */