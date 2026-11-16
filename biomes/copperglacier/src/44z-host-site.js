// ================================================================= HOST — the site: STATION 1, COPPER TARN (PLAN.md section 2; 2026-11-03)
// Each station's land as numbers, read by the one stage (45-host-stage.js); a station replaces this fragment (stations/<name>/44z-host-site.js).
// THE SITE (scale model 5.1, surveyed 2026-11-03): the Copper Tarn at px 148,1148, its level 2,380 m (model bed 2,364: a shallow tarn), WH, +9 degC mean
// (warm month +19, cold 0), 1,800 mm; the ground rises east to 4.0-4.3 km within 8-10 km (EF and ET: the ice). The page's middle is the snout, px 156,1150,
// with the tarn to the west and the glacier's lower tongue and icefall to the east. 1.19 atm (1.6 atm x e^(-h/8 km)).
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE GLACIER    from the east edge: crevassed ice, the ICEFALL's seracs (u 800-1500), the lower tongue, an ICE CLIFF calving into the tarn
//   THE MORAINES   lateral moraines both sides (verdigris boulders where the copper is), no terminal moraine: the snout stands in the water
//   THE TARN       the Copper Tarn: turquoise with glacial flour (the stream's plume), bergs calved off the cliff, its far shore off the map
//   THE STREAM     the meltwater stream along the north margin, out of an ice cave at the snout into the tarn
//   THE WALLS      the north wall low (the tarn's outlet lies north, off the map: the Kopa-Tarn Warra), the south wall high (4.4 km at 10 km)
//   THE SHORES     frost coral, cushions, moss and sedge on the moraine and the shore under ~3.2 km; lichen on the boulders
const SITE={key:'tarn',name:'Copper Tarn',region:'Copper Tarn and the glacier (Copper Glacier, ideal type)',px:156,py:1150,old:{px:-116,py:820},
 atm:1.19,koppen:['ET','EF','Dfb'],rain:1800,mean:9,
 up:[1,0],   /* the ice comes from the east */
 // the bed's profile up the ice (u): falling gently under the tarn west of the snout, a gentle tongue, the icefall, a gentle basin
 prof:{at:-300,h:2360,grads:[[-2900,.004],[-380,.2],[-150,.045],[800,.3],[1500,.06]]},
 glacier:{centre:u=>38*Math.sin(u*.0012+.6)+16*Math.sin(u*.0031+1.4),W:u=>380+230*smooth(-300,2400,u),T:u=>(56+30*smooth(-300,900,u)+40*smooth(1200,2200,u))*smooth(-310,-296,u),
  snout:-300,edge:.6,trough:{side:[.7,1.08],D:u=>30+20*smooth(-300,2000,u)},lateral:{h:u=>12+8*smooth(-300,1500,u),end:[2300,1800],off:34,w:24},terminal:null,lake:null},
 walls:{margin:160,pos:{H:560,span:1300},neg:{H:1150,span:1500},fade:null},   /* pos: north (p>0 is north here: across = [0,-1]) */
 ridges:[],
 tarn:{level:2380,name:'The Copper Tarn (turquoise with glacial flour; the Kopa-Tarn Warra leaves it north)'},
 icefall:[800,1500],crevasses:[[150,780],[1520,2400]],
 caves:[{u:-40,aw:.97,R:15,face:null,name:'An ice cave (the meltwater stream\'s portal at the snout)'},{u:220,aw:-.96,R:12,face:null,name:'An ice cave (at the south margin)'}],
 streams:[{name:'The meltwater stream (from the snout\'s north portal into the tarn)',from:'cave0',hw:3,plume:true}],
 snowLine:[2900,3400],coral:[2380,3200],worms:true,algae:.55,
 sky:{air:{pressure:1.19,humidity:.55},clouds:{cover:.35,cumulus:.4,cirrus:.3}},
 views:'tarn'};
