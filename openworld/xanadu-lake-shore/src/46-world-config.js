// ================================================================= EREWHON'S LAKE, THE LAKE SHORE — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the sites first in "Go to": Erehwon, then the shore towns from Ālph-Hēḍ round to Siṭāq, then the isles
//   goViews   the region's own views: the cut from above, each site, each village, the landform records on this shore
//   start     the first view: over Erehwon from the lake, looking south at the town and the slopes behind it
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,by=n=>SS.find(s=>s.name===n)||{x:0,z:0,name:n};
const views=[{label:'Overview, the Lake Shore from 140 km up',pos:[0,140000,95000],look:[0,0,0]}];
SS.forEach(S=>views.push({label:S.name+' from 5 km up',view:[S.x+3000,S.z+7000,5000,.4,-.6]}));
if(P)P.sites.forEach(St=>(St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+320,140,-.7,-.3]})));
/* the landform records on this shore (core/world/41l-world-landforms.js: the Pleasure Dome's isle by Erehwon, the stack
   by Siṭāq), each from 900 m off; Phēr's records are in the box but the north shore's (openworld/xanadu-north-shore) */
const O=M.frame.origin_px;(M.landforms||[]).forEach(L=>{if(L.px==null||/^lf_pher_/.test(L.id))return;const x=(L.px-O[0])*2000,z=(L.py-O[1])*2000;
 views.push({label:'Landform '+L.id.replace(/^lf_/,'').replace(/_/g,' ')+' from the lake',view:[x+200,z-900,90,.2,-.12]});});
const E=by('Erehwon');
return{built:{'Erehwon':'openworld/xanadu-lake-shore (its farming ring); the city is settlements/xanadu (the Erewhon page)'},
 goOrder:['Erehwon','Ālph-Hēḍ','Hoṭ-Bāṭh','Ṭī-Ṭeras','Pāṭari','Saphran','Wībhar','Boṭ-Yārḍ','Gārḍan','Qorī','Ōrcharḍ','Lōṭas',
  'Phish-Mārkiṭ','Siṭāq','Wesṭ-Āil','Lāiṭ-Hāus','Bē-Āil'],goViews:views,
 start:{view:[E.x+600,E.z-3200,260,.15,-.08],look:[E.x,E.z,80]}};})();
