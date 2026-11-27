// TARGET: west-end — West End, a fishing village of Grēṭ-Āil (settlements/azure-dream/PLAN.md section 8): the west coast below the isle's west tip (its tip itself is a spread of low islets at 1:1), the fishers who work the west water. The page
// is Xanadu's, as the isle's is: window.CITY skips the kit sheet's showcase; no sheet rows; the village places itself through
// core/hamlet (src/89zac-ad-village.js). TITLE is read by build.py for the page <title>.
window.CITY=true;window.CITY_BUILD='azure-dream-village-west-end';   /* the page's name in core/host and core/tags */
const TITLE='Grēṭ-Āil — Wesṭ-Ēn (West End)';
XA.families=()=>[];
const XA_EXTRA=[];
const SITES=[];
// the site (src/89zaa-ad-ground.js): the page's origin the village point, scale-model px 834.5, 1503.5 (probed on the 1:1
// shore: dry and gentle 120 m round, the water within 450 m); the near ground 1.6 km square; the village's people (PLAN.md section 3)
const AD_SITE={id:'west-end',PX:[834.5,1503.5],BOX:[-800,-800,800,800],bio:{origin:[[0,0],[200,0],[-200,0],[0,200],[0,-200]],center:[0,0],R:1135},
 village:{id:'lk.great-isle-west',name:'Wesṭ-Ēn',pop:250}};