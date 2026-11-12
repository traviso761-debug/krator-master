// ================================================================= HOST — the site: STATION 2, THE PADDOCKS (PLAN.md section 8; 2026-11-11)
// THE SITE (scale model 5.1, surveyed 2026-11-11): the north-east shore of the graben lake at px 245.5,1479.5 (old canvas px -26.5,1149.5), the
// lake at 1,820 m (the model's water, 1,750-1,790 m under it), Cfb, mean 9 degC, 894 mm. The graben runs north-west to south-east; its north-east
// bastion climbs from 1,850 m at the shore to 5,000-5,400 m within 4-6 km (the model's cells 246-248, 1476-1478), its far side past the lake.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE LAKE     the graben lake filling the south-west half, its shore through the middle (1,820 m)
//   THE WALL     the bastion's face (KRELIEF.scarp: the rim at 5,000 m read off the model's cells, 3.2 km over a 3.6 km run, three benches,
//                ravines), its foot 1.5-2 km north-east
//   THE FLOOR    the graben's floor between, 1,826 m rising to the foot: the tall steppe, gallery woods along the beck
//   THE BECK     a beck down a ravine of the wall into the lake
const SITE={key:'paddocks',exportAt:[800,-500],blurb:"the graben lake under the bastion's face, the tall steppe and the gallery woods along the beck",name:'The Paddocks',region:'The Paddocks: a graben lake in the heart of the maze (the Labyrinth, region rmw8bqrn3dnx4)',px:245.5,py:1479.5,
 old:{px:-26.5,py:1149.5},atm:1.27,koppen:['Cfb','Dfc'],rain:894,mean:9,
 floor:1826,level:1820,tilt:[.004,-.003],flatR:[0,1],
 lakes:[{name:'The graben lake (1,820 m)',cx:-2400,cz:3200,a:12000,b:4000,ry:.64,level:1820,bed:14,bank:40,shallow:0x5a7a72,deep:0x24443e}],
 rivers:[{name:'The Paddocks Beck (out of the bastion\'s ravine)',hw:3.5,depth:1,pts:[[2300,-2000],[1700,-1300],[1100,-700],[600,-150],[180,250],[-300,600]],end:1820}],
 scarps:[{pts:[[-6000,-7000],[1000,-5000],[6000,-2600],[10000,0]],side:-1,h:3170,run:3600,power:1.3,benches:{n:3,w:120},
  ravines:{n:6,w:[90,160],head:[200,500],depth:[60,200]},buttresses:{sp:900,amp:140},talus:{h:60,reach:500},rim:{lip:6,w:50},warp:{amp:80},rough:.012,ends:3000}],
 scarpNames:['The bastion over the Paddocks'],
 knobs:[],
 wetBase:.5,dryBase:.1,floraQ:1,
 snowLine:[4700,5400],
 sky:{air:{pressure:1.27,humidity:.7},clouds:{cover:.5,cumulus:.5,cirrus:.25}},
 views:[
  {name:'The Paddocks',c:[-1400,24,1600],t:[1400,260,-1600]},
  {name:'The bastion over the lake',c:[-2200,6,2400],t:[2600,900,-2600]},
  {name:'Along the graben',c:[-2200,40,-600],t:[2400,20,1800]},
  {name:'The beck',c:[300,6,900],t:[1500,30,-1000]},
  {name:'From afar',c:[-2400,700,2400],t:[600,300,-600]}],
 probes:[{what:'the lake',kind:'drown',want:true,x:-1500,z:2500,y:1817},{what:'the floor by the beck',kind:'fall',want:false,x:600,z:-300,dy:2}],
 views0:'paddocks'};
