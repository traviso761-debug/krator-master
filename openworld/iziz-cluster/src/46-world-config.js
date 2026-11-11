// ================================================================= THE IZIZ CLUSTER: this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the sites first in "Go to", north to south
//   goViews   the region's own views: the cut from above, each town, each band's camp, each village
//   start     the first view: over Talia's countryside, looking north-west up the road to Girder
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,by={};SS.forEach(s=>by[s.id]=s);
const T=by.sor1zqih8x||SS[0]||{x:0,z:0,name:'Talia'};
const views=[{label:'Overview: the cut from 160 km up',pos:[0,160000,150000],look:[0,0,0]}];
SS.forEach(s=>views.push({label:s.name+' from 3 km up',view:[s.x+2400,s.z+3200,3000,.6,-.7]}));
if(P)P.sites.forEach(St=>{(St.camps||[]).forEach(C=>views.push({label:C.name+' ('+St.name+')',view:[C.site.x-240,C.site.z+280,120,-.7,-.3]}));
 (St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+320,140,-.7,-.3]}));});
/* the caravanserais along the links (the rest stops are between them) */
if(P)(P.links||[]).forEach(L=>(L.stops||[]).filter(s=>s.kind==='inn').forEach(s=>views.push({label:s.name.replace(/^the /,'The '),view:[s.x-160,s.z+200,90,-.7,-.3]})));
const built={};SS.forEach(s=>built[s.name]='openworld/iziz-cluster (the site: its countryside and roads); the town is '+(s.page||'not built yet'));
return{built,goOrder:SS.slice().sort((a,b)=>a.z-b.z).map(s=>s.name),goViews:views,
 start:{view:[T.x+5200,T.z+5600,700,.75,-.2],look:[T.x-2000,T.z-2000,60]}};})();
