// ================================================================= HOST — the site: STATION 4, THE PIT CHAIN (PLAN.md section 8; 2026-11-11)
// THE SITE (scale model 5.1, surveyed 2026-11-11): the north shore of the NW pit tarn at px 148,1466 (old canvas px -124,1136), the tarn at
// 2,920 m (the model's water, 2,860-2,880 m under it, px 145-151, 1465-1469), Dfc, mean 1 degC, 830 mm. The dome's wall rises north to 4,000 m
// within 2 km and 5,500 m within 6 km (the model's cells 146-152, 1460-1464). The Siphon-Pit Beck (r_lab_cat_nw) heads here.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE TARN       the pit tarn filling the south of the page (2,920 m): Krator's native tarn life (PLAN.md section 3)
//   THE WALL       the dome's face to the north (KRELIEF.scarp: 2.5 km over a 3.8 km run, benches, ravines)
//   THE PITS       the beaded pit-crater chain west of the tarn (KRELIEF.stepcut: sheer stepped pits, one holding its own small tarn)
const SITE={key:'pits',exportAt:[-1450,-1050],blurb:"the pit tarn under the dome's wall, the beaded pits west of it, one holding its own small tarn",name:'The Pit Chain',region:'The Pit Chain: the cold west (the Labyrinth, region rmw8bqrn3dnx4)',px:148,py:1466,
 old:{px:-124,py:1136},atm:1.11,koppen:['Dfc','ET'],rain:830,mean:1,
 floor:2928,level:2920,tilt:[0,.002],flatR:[0,1],
 lakes:[{name:'The north-west pit tarn (2,920 m)',cx:0,cz:2400,a:6000,b:2900,ry:0,level:2920,bed:22,bank:30,shallow:0x4a7a80,deep:0x1a3a46},
  {name:'A pit\'s tarn',cx:-1700,cz:-1050,a:150,b:150,ry:0,level:2858,bed:12,bank:6,shallow:0x4a6a70,deep:0x1a2a36}],
 rivers:[],   /* the Siphon-Pit Beck leaves the tarn's west end, past the square (6 km west) */
 scarps:[{pts:[[-9000,-6400],[-2000,-6200],[3000,-6600],[9000,-6000]],side:-1,h:2500,run:3800,power:1.25,benches:{n:3,w:110},
  ravines:{n:6,w:[90,150],head:[200,450],depth:[60,180]},buttresses:{sp:900,amp:150},talus:{h:80,reach:600},rim:{lip:6,w:50},warp:{amp:80},rough:.012,ends:3000}],
 scarpNames:['The dome\'s wall'],
 pits:[{disc:{c:[-1700,-1050],r:240},floor:2846,steps:3,tread:14},{disc:{c:[-1050,-1500],r:170},depth:55,steps:2,tread:12},{disc:{c:[-2350,-700],r:200},depth:70,steps:3,tread:12}],
 knobs:[],
 wetBase:.5,dryBase:.05,floraQ:.45,
 snowLine:[3300,3900],
 sky:{air:{pressure:1.11,humidity:.65},clouds:{cover:.55,cumulus:.45,cirrus:.3}},
 views:[
  {name:'The Pit Chain',c:[-300,45,-1950],t:[-1800,-20,-900]},
  {name:'The tarn under the wall',c:[400,10,2000],t:[-200,600,-2400]},
  {name:'Into a pit',c:[-1500,20,-780],t:[-1700,-40,-1050]},
  {name:'The wall',c:[-400,20,-800],t:[200,900,-3400]},
  {name:'From afar',c:[2400,700,2400],t:[-600,200,-1000]}],
 probes:[{what:'the tarn',kind:'drown',want:true,x:0,z:2400,y:2915},{what:'the floor between the pits',kind:'fall',want:false,x:200,z:-1100,dy:2}],
 views0:'pits'};
