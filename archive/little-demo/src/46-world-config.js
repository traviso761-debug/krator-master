// ================================================================= OPEN WORLD — this region's own settings
// [G data] What the shared world fragments read that belongs to one region: the settlements that have a build of their
// own (87-world-places.js), the order the settlements take in "Go to" and the region's own views there
// (90-world-camera.js). A world that reads this world's fragments in place (openworld/isle-demo) gives its own
// WORLD_CONFIG in place of this file.
//   built     settlement name -> its build (the marker says so; a town tile may stand there: 88-world-towns.js)
//   goOrder   settlement names first in "Go to", in this order (the rest follow alphabetically)
//   goViews   the region's own entries at the top of "Go to": {label, pos:[x,y,z], look:[x,y,z]} or {label, view:[x,z,
//             height, yaw, pitch]} (90-world-camera.js setView)
var WORLD_CONFIG={
 built:{'Locus':'settlements/locus','Shade':'settlements/shade','Yuni':'settlements/yuni','Veladiga':'kits/ancients (the ruin)','Verge':'settlements/verge','Mungo':'settlements/mungo','Arcbeam':'kits/ancients (arcbeam)'},
 goOrder:['Shade','Verge','Locus','Yuni','Veladiga','Mungo'],
 goViews:[{label:'Overview: the whole region from 600 km up',pos:[0,650000,560000],look:[0,0,30000]},
  {label:'The eastern desert from 40 km up, looking east',view:[40000,40000,40000,-Math.PI/2,-.55]}]
};
