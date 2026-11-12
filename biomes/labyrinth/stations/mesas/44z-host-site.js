// ================================================================= HOST — the site: STATION 3, THE MESAS (PLAN.md section 8; 2026-11-11)
// THE SITE (scale model 5.1, surveyed 2026-11-11): a canyon floor of the chaos at px 257.5,1590 (old canvas px -14.5,1260), 1,930-2,000 m, BSk,
// mean 8 degC, 298 mm: the outflow floors between two of the region's great mesas. East, a mesa top at 6,000-6,300 m (the model's cells 260-266,
// 1582-1597), its face rising 4 km within 3 km; north-west, another at 5,300-5,500 m. The plan's place (PLAN.md section 8: about 260-263,
// 1585-1594) is the east mesa's top, EF; the page stands at its foot, where the life is, and looks up at it.
// THE MAP (x east, z south, north is -z; origin at the page's middle, R 2600):
//   THE EAST MESA   its face (KRELIEF.scarp: 4 km over a 2.6 km run, four benches, buttresses, talus: the rim read off the model's cells)
//   THE WEST MESA   its south-eastern prow, 3.4 km over 2 km, north-west of the middle
//   THE FLOOR       the outflow floor, a dry wash down it to the south (no standing water: the dust season's country)
//   THE KNOBS       the chaos's tilted flat-topped mesas and knobby pyramids on the floor (KSTACKS), the sabre-tooth's talus among them
const SITE={key:'mesas',exportAt:[-1100,1300],blurb:"the outflow floor between two great mesas, the chaos's tilted knobs and pyramids, dry steppe",name:'The Mesas',region:'The Mesas: the chaos\'s outflow floors (the Labyrinth, region rmw8bqrn3dnx4)',px:257.5,py:1590,
 old:{px:-14.5,py:1260},atm:1.25,koppen:['BSk','ET','EF'],rain:298,mean:8,
 floor:1960,tilt:[-.006,.004],flatR:[0,1],
 lakes:[],
 rivers:[],
 scarps:[
  {pts:[[6500,-9000],[4600,-4000],[3800,0],[3200,4000],[3000,10000]],side:-1,h:4050,run:2600,power:1.0,benches:{n:4,w:90},
   ravines:{n:7,w:[80,150],head:[200,450],depth:[80,220]},buttresses:{sp:700,amp:180},talus:{h:120,reach:700},rim:{lip:8,w:60},warp:{amp:90},rough:.014,ends:2600},
  {pts:[[-5000,-9000],[-5600,-5000],[-7400,-2400],[-10000,-600]],side:1,h:3400,run:2000,power:1.05,benches:{n:3,w:80},
   ravines:{n:4,w:[80,140],head:[180,400],depth:[60,180]},buttresses:{sp:700,amp:160},talus:{h:100,reach:600},rim:{lip:6,w:50},warp:{amp:80},rough:.014,ends:2400}],
 scarpNames:['The east mesa','The west mesa'],
 knobs:[
  {kind:'mesa',x:-900,z:-1200,seed:7501,tiers:[{h:180,r:160,e:1.4,ry:.5},{h:110,r:110,e:1.3,ry:.55},{h:70,r:70,e:1.2,ry:.6}]},
  {kind:'butte',x:100,z:900,seed:7502,tiers:[{h:240,r:120,e:1.3,ry:-.4},{h:120,r:80,e:1.2,ry:-.3}]},
  {kind:'spire',x:-1600,z:700,seed:7503,H:320,r:80,taper:.5,crown:.5},
  {kind:'spire',x:400,z:-1700,seed:7504,H:260,r:70,taper:.55,crown:.45,lean:.06},
  {kind:'mesa',x:-300,z:2000,seed:7505,tiers:[{h:140,r:200,e:1.5,ry:.2},{h:80,r:140,e:1.4,ry:.25}]},
  {kind:'spire',x:-2200,z:-1900,seed:7506,H:220,r:60,taper:.5,crown:.5},
  {kind:'butte',x:-2100,z:2200,seed:7507,tiers:[{h:200,r:110,e:1.3,ry:.9},{h:90,r:70,e:1.2,ry:1.0}]}],
 wetBase:.22,dryBase:.62,floraQ:.6,
 snowLine:[5200,5900],
 sky:{air:{pressure:1.25,humidity:.35},clouds:{cover:.2,cumulus:.2,cirrus:.3}},
 views:[
  {name:'The Mesas',c:[-2400,90,-200],t:[2600,250,200]},
  {name:'The east mesa\'s face',c:[600,6,-200],t:[3600,1600,-400]},
  {name:'Among the knobs',c:[-200,4,300],t:[-900,120,-1200]},
  {name:'The west mesa\'s prow',c:[-1200,30,400],t:[-5600,1200,-3000]},
  {name:'From afar',c:[-2400,900,2400],t:[1200,600,-800]}],
 probes:[{knob:0},{what:'the open floor',kind:'fall',want:false,x:-400,z:600,dy:2}],
 views0:'mesas'};
