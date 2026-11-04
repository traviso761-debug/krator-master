// ================================================================= HOST — the site: STATION 2, THE COPPER SLOPE OVER THE PASS (PLAN.md section 2; 2026-11-03)
// THE SITE (scale model 5.1, surveyed 2026-11-03): px 320,1248, 3,647 m, on the south-west side of the glaciated pass that runs ESE from the Crook to the
// Rift's north-west head; ET round it (EF on the cell itself), +5 degC mean (warm +18, cold -8), 1,900 mm. The ground rises south-west to 5-7 km and falls
// north-east to the pass's floor and its through-lake at ~2.7-2.9 km, 10-15 km off (the far field). THE COPPER (kits/resources, the 2026-11-03 rebake): the
// cell is the rift's edge, copper 240 and skarn 200, the richest copper ground in the polygon; four copper nodes (one low, three medium) inside the page's
// square (CG_RES). 1.03 atm here (1.6 atm x e^(-h/8 km)).
// THE MAP (x east, z south; origin at the site, R 2600):
//   THE GLACIER    a hanging glacier from the high ground south-west: its icefall (u 1300-1900), crevassed tongue, the snout on the slope's foot
//   THE MORAINES   laterals, a terminal moraine looping across the slope, breached by the outlet; a proglacial pond behind it
//   THE SKARN      the copper ground: the slope's rock stained green and blue with malachite and azurite, rusty gossan caps over the sulphides, the
//                  nodes' outcrops (the data's four), copper flowers on the copper scree, verdigris cushions
//   THE ARETES     rock ribs either side of the glacier's shallow valley, rising south-west
const SITE={key:'pass',name:'The copper slope',region:'The copper slope over the pass (Copper Glacier, ideal type)',px:320,py:1248,old:{px:48,py:918},
 atm:1.03,koppen:['ET','EF'],rain:1900,mean:5,
 up:[-.7071,.7071],   /* the ice comes from the south-west */
 prof:{at:0,h:3647,grads:[[-2900,.05],[600,.14],[1300,.3],[1900,.09]]},
 glacier:{centre:u=>30*Math.sin(u*.0014+.2)+12*Math.sin(u*.004+2),W:u=>240+180*smooth(-700,2200,u),T:u=>(40+24*smooth(-700,600,u)+30*smooth(1300,2300,u))*smooth(-700,-590,u),
  snout:-700,edge:.62,trough:{side:[.7,1.08],D:u=>22+18*smooth(-700,2000,u)},lateral:{h:u=>11+7*smooth(-700,1200,u),end:[2300,1900],off:30,w:22},
  terminal:{back:300,bend:60,breach:46,h:16,w:34},lake:{},pondDeep:16},
 walls:{margin:150,pos:{H:380,span:1800},neg:{H:520,span:1800},fade:[-1300,-500]},
 ridges:[],
 tarn:null,
 icefall:[1300,1900],crevasses:[[-560,1250],[1950,2500]],
 caves:[{u:-655,aw:-.12,R:11,face:null,name:'An ice cave (the glacier\'s portal, in its snout)'}],
 streams:[{name:'The outlet stream (from the pond through the moraine\'s breach, down to the pass)',from:'breach',hw:2.2,plume:false}],
 skarn:true,tri:true,snowLine:[3950,4350],coral:[3300,3760],coralK:.3,worms:true,algae:.5,
 sky:{air:{pressure:1.03,humidity:.5},clouds:{cover:.3,cumulus:.35,cirrus:.4}},
 views:'pass'};
