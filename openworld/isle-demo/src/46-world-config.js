// ================================================================= ISLE DEMO — this region's own settings
// [G data] What the shared world fragments (openworld/little-demo/src 87-world-places.js, 90-world-camera.js) read that
// belongs to this region (little-demo's own is its 46-world-config.js).
//   built     the two towns the isle demo builds (settlements/isle-demo/PLAN.md): their markers say so
//   goOrder   the settlements first in "Go to"
//   goViews   the region's own views: the archipelago, and each of the scale model's geyser vents (region.json vents)
var WORLD_CONFIG=(function(){
const M=WORLD_DATA.meta,o=M.frame.origin_px,xz=px=>[(px[0]-o[0])*2000,(px[1]-o[1])*2000];
const views=[{label:'Overview: the archipelago from 260 km up',pos:[0,260000,230000],look:[0,0,0]},
 {label:'The isles from 30 km up, looking north',view:[0,120000,30000,0,-.5]}];
(M.vents||[]).filter(v=>v.kind==='geyser').forEach((v,i)=>{const [x,z]=xz(v.px);views.push({label:'Geyser vent '+(i+1)+' (px '+v.px.join(',')+')',view:[x+900,z+1400,400,0,-.25]});});
return{built:{'Kautoa':'settlements/isle-demo (Kautoa, the city)','Walapo':'settlements/isle-demo (Walapo, the village)'},
 goOrder:['Kautoa','Walapo'],goViews:views};})();
