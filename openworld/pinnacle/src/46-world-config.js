// ================================================================= PINNACLE — this region's own settings
// [G data] What core/world (87-world-places.js, 90-world-camera.js, 98-world-start.js) reads that belongs to this region.
//   built     the site this region plans (openworld/SITES.json): its marker says so
//   goOrder   the site first in "Go to"
//   goViews   the region's own views: the cut from above, the floor round the rock, each band's camp
//   start     the first view: over the floor south-east of the rock, looking north-west across the camps to it
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,S=(M.sites||[])[0]||{x:0,z:0,name:'the site'},P=WORLD_DATA.sites;
const views=[{label:'Overview: the cut from 90 km up',pos:[S.x,90000,S.z+70000],look:[S.x,0,S.z]},
 {label:'The floor round the rock from 2.5 km up',view:[S.x+1800,S.z+3200,2500,.5,-.6]}];
if(P)P.sites.forEach(St=>St.camps.forEach(C=>views.push({label:C.name+' ('+St.name+')',view:[C.site.x-240,C.site.z+280,120,-.7,-.3]})));
return{built:{[S.name]:'openworld/pinnacle (the site: its bands and tracks); the town on the mesa is settlements/pinnacle-rock'},
 goOrder:[S.name],goViews:views,
 start:{view:[S.x+2600,S.z+2600,260,.78,-.18],look:[S.x,S.z,40]}};})();
