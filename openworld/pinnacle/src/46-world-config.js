// ================================================================= PINNACLE: this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the sites this region plans (openworld/SITES.json): their markers say so
//   goOrder   the rock first in "Go to", then its partners north to south
//   goViews   the region's own views: the cut from above, the floor round the rock, each band's camp, each clearing,
//             each partner's town, each caravanserai along the links
//   start     the first view: over the floor south-east of the rock, looking north-west across the camps to it
// The frame's origin is the box's centre pixel (since the corridors, 2026-11-11), not the rock's: every view is placed
// from a site's own point.
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,SS=M.sites||[],P=WORLD_DATA.sites,S=SS.find(s=>s.id==='staiytii0y')||SS[0]||{x:0,z:0,name:'the site'};
const views=[{label:'Overview: the cut from 400 km up',pos:[0,400000,330000],look:[0,0,0]},
 {label:'The floor round the rock from 2.5 km up',view:[S.x+1800,S.z+3200,2500,.5,-.6]}];
if(P)P.sites.forEach(St=>(St.camps||[]).forEach(C=>views.push({label:C.name+' ('+St.name+')',view:[C.site.x-240,C.site.z+280,120,-.7,-.3]})));
/* the clearings (2026-11-12): each farming village from 180 m up */
if(P)P.sites.forEach(St=>(St.hamlets||[]).forEach(V=>views.push({label:V.name+' ('+St.name+')',view:[V.site.x-260,V.site.z+300,180,-.7,-.35]})));
SS.filter(s=>s!==S).forEach(s=>views.push({label:s.name+' from 3 km up',view:[s.x+2400,s.z+3200,3000,.6,-.7]}));
/* the caravanserais along the links (the rest stops are between them) */
if(P)(P.links||[]).forEach(L=>(L.stops||[]).filter(s=>s.kind==='inn').forEach(s=>views.push({label:s.name.replace(/^the /,'The '),view:[s.x-160,s.z+200,90,-.7,-.3]})));
const built={};SS.forEach(s=>built[s.name]=s===S?'openworld/pinnacle (the site: its bands, tracks, clearings and roads); the town on the mesa is settlements/pinnacle-rock'
 :'openworld/pinnacle (a road\'s end); the town is '+(s.page||'not built yet'));
return{built,goOrder:[S.name].concat(SS.filter(s=>s!==S).sort((a,b)=>a.z-b.z).map(s=>s.name)),goViews:views,
 start:{view:[S.x+2600,S.z+2600,260,.78,-.18],look:[S.x,S.z,40]}};})();
