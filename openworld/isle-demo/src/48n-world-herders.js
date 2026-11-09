// ================================================================= ISLE DEMO — the herding bands' ranges: where each town's herders graze
// [G data] settlements/isle-demo 47n declares a herding band for each town (the owner, 2026-11-09: "semi nomadic herding
// camps"): a camp of shelters that moves with its herd over a range of pasture. The sim knows no land: this hands it the
// bands. RANGES are the pasture survey's picks of 2026-11-09 (the isles kit's `gather` pasture on the home islands, 8 to
// 60 km from the town, 5 km from every village, the best 4 km sums): Kautoa's between its two ranches, 30 km south-west;
// Valapo's on the open grassland 46 km north. The band's home ground is the best pasture point within 2 km of the pick;
// its range is the isles kit's pasture (where dry, off the towns, at 0.3 or more). Named from the Sikau list (core/hamlet
// 18), none the same as a village's.
//   ISLE_HERDERS.make()   -> [{id, town, name, gloss, yard: {x, z}, pasture(x, z), h(x, z)}] for ISLE.simHerders (48t)
var ISLE_HERDERS=(function(){'use strict';
const RANGES={Kautoa:{near:[22000,-85000]},Valapo:{near:[-40000,89000]}};
const HL=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z),wet=(x,z)=>WORLD.water(x,z)>HL(x,z)-1.2;
const pasture=(x,z)=>{if(!WORLD.inside(x,z)||wet(x,z)||WORLD.townW(x,z))return 0;const g=RINGISLES.gather(x,z).pasture||0;return g>=.3?g:0;};
function yardFor(t){const p=RANGES[t].near;let best=null;
 for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){const x=p[0]+i*500,z=p[1]+j*500;if(!pasture(x,z))continue;let s=0;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++)s+=pasture(x+a*250,z+b*250);if(!best||s>best.s)best={x,z,s};}
 return best?{x:best.x,z:best.z}:{x:p[0],z:p[1]};}
function make(){const used={};((ISLE_HAMLETS.made||{}).villages||[]).forEach(E=>{if(E.name)used[E.name]=true;});
 return ISLE.TOWNS.filter(t=>RANGES[t]).map(t=>{const id=t.toLowerCase()+'.herders',nm=KHAMLET.hamletName?KHAMLET.hamletName('islander',4242,'herders:'+id,used):null;if(nm)used[nm.name]=true;
  return{id,town:t,name:nm?nm.name:null,gloss:nm?nm.gloss:null,yard:yardFor(t),pasture,h:(x,z)=>WORLD.H(x,z)};});}
return{RANGES,make,pasture};})();
