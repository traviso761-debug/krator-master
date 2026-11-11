// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the sites first in "Go to"
//   goViews   the region's own views: the cut from above, each site, each village
//   start     the first view: over Erehwon's farming villages, looking at the town
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,by=n=>SS.find(s=>s.name===n)||{x:0,z:0,name:n};
const views=[{label:'Overview: the region from 600 km up',pos:[0,600000,420000],look:[0,0,0]}];
SS.forEach(S=>views.push({label:S.name+' and its villages from 6 km up',view:[S.x+4000,S.z+9000,6000,.4,-.6]}));
if(P)P.sites.forEach(St=>(St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+320,140,-.7,-.3]})));
const E=by('Erehwon');
return{built:{'Erehwon':'openworld/xanadu-oidong-highrift (its villages and roads); the city is settlements/xanadu',
  'Qiblai':'openworld/xanadu-oidong-highrift (its villages and roads); no city page yet',
  'Longsong':'openworld/xanadu-oidong-highrift (its three villages); the monastery is settlements/longsong'},
 goOrder:['Erehwon','Qiblai','Longsong'],goViews:views,
 start:{view:[E.x+5000,E.z+5000,600,.78,-.15],look:[E.x,E.z,80]}};})();
