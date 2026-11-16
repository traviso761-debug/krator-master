// ================================================================= EREWHON'S LAKE, THE NORTH SHORE — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the sites first in "Go to"
//   goViews   the region's own views: the cut from above, each site, each village, Phēr's headland and the stream
//   start     the first view: over Phēr's cove from the lake, looking north at the wall and the rim
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,by=n=>SS.find(s=>s.name===n)||{x:0,z:0,name:n};
const views=[{label:'Overview, the north shore from 160 km up',pos:[0,160000,110000],look:[0,0,0]}];
SS.forEach(S=>views.push({label:S.name+' from 5 km up',view:[S.x+3000,S.z+7000,5000,.4,-.6]}));
if(P)P.sites.forEach(St=>(St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+320,140,-.7,-.3]})));
/* the landform records in the cut (core/world/41l-world-landforms.js: Phēr's headland and east point), each from 900 m off */
const O=M.frame.origin_px;(M.landforms||[]).forEach(L=>{if(L.px==null)return;const x=(L.px-O[0])*2000,z=(L.py-O[1])*2000;
 views.push({label:'Landform '+L.id.replace(/^lf_/,'').replace(/_/g,' ')+' from the lake',view:[x+200,z+900,90,.2,-.12]});});
const F=by('Phēr');
return{built:{'Phēr':'openworld/xanadu-north-shore (its farming ring and the Thalaba road); the town is settlements/pher',
  'Thalaba':'openworld/xanadu-north-shore (the road\'s end); no page yet (settlements/thalaba/PLAN.md)'},
 goOrder:['Phēr','Thalaba','The Qol ford','The Qol head','Māuṭh','Ōlḍ-Thalaba','Ḍāiyar'],goViews:views,
 start:{view:[F.x+600,F.z+3200,260,.15,-.08],look:[F.x,F.z,80]}};})();
