// ================================================================= HOST — the station's record (station 5: the Epidote-Steam Tarn)
// One record a station: its numbers only. The site functions are the cauldrons' (src/44s), with this station's mouth.
// PLAN.md section 2a and section 7, station 5: the sealed cauldron, reached by the Epidote Cave. On the scale model (5.1, edit 1: the
// Portal Valley carved and `tube_epidote_16` recorded) the tarn lies at 2,670 m, ~14 x 10 km round px 1342,338, ringed by walls that rise
// 4 km within a kilometre of the water and on to 9-10 km (the airless crest within 2 cells north). WH, +11 °C (18/3), 1,929 mm, 1.15 atm.
// The page stands on the NORTH SHORE (px 1340,336.6), y = 0 at the water, by the cave's INNER MOUTH (the tube's last point, 1340,336:
// "the lower level's outlet on the north shore, about 2,700 m, 30 m over the water: warm, CO2- and H2S-charged water and steam, sinter and
// mats round it"). Its 1 km cells put the wall's foot ~200 m north of the page's middle; the mouth is cut there.
//
// WHAT THE STATION ADDS (44s's records): the apron along the north shore and down the west (the bench the cave's water has built under the
// wall); the INNER MOUTH (a KCARVE alcove 90 m wide and 30 high in the wall's foot, facing the water: 47); the cave's warm outlet as the
// main spring in front of it and its sinter stair to the tarn, two lesser springs; a line of dike islets out in the water.
const SITE={
 name:'steam',title:'The Epidote-Steam Tarn',kind:'cauldron',tarn:'The Epidote-Steam Tarn',R:1600,step:8,seed:6501,
 amp:{warm:7,cold:8},
 // the apron's toe: east to west along the north shore (inland: north), then south down the west shore (inland: west)
 apron:{toe:[[2600,-150],[1500,-140],[800,-150],[300,-120],[0,0],[-250,350],[-500,620],[-700,900],[-800,1400],[-900,2200]],
  rise:.11,front:.5,lift:1.6,reach:320},
 dikes:[{id:'dikeN',a:[500,700],b:[2300,1000],n:12,H:[20,55],r:[8,13],e:[3,4.5],seed:6511}],
 need:[5],
 // the springs at the wall's foot (springT: the toe's stations from the north-east of the page to the north-west corner); the first is
 // the cave's outlet, in front of the mouth
 springT:[-.42,.36],
 springs:[{u:.5,r:12,temp:.92,mineral:'sulfur',name:'The cave\'s outlet (the Epidote Cave\'s lower level brimming out: warm, sulphurous, steaming)'},
  {u:.15,r:7,temp:.7,mineral:'sinter',name:'A hot pool under the north wall'},
  {u:.85,r:6,temp:.62,mineral:'copper',name:'A green pool (copper from the skarn)'}],
 stair:{treads:6,w:24,dam:.35,step:2},
 // the inner mouth (44s: SITE_MOUTHS), at the outlet's station on the toe
 mouths:[{id:'innerMouth',t:-.42+.36*.5,hw:45,depth:50,h:30,name:'The Inner Mouth (the Epidote Cave\'s lower level opening on the tarn: 71 km of hypogene marble cave behind it, to the Portal at 5,900 m)'}],
 snow:{autumn:[1800,2400],winter:[350,600],spring:[1100,1500],summer:[3200,3800]},
 hour:12,
 eye:30,
 views:V=>{const M=SITE_MOUTHS[0],S=SITE_SPRINGS[0],T=SITE_STAIR,toe=APRON_PT(.3,30),o={
  'The Inner Mouth':V([M.c[0]+M.n[0]*120+30,M.c[1]+M.n[1]*120,6],[M.c[0],M.c[1],14]),
  'The cave\'s outlet':V([S.x+30,S.z+28,4],[S.x,S.z,0]),
  'Down the sinter stair to the tarn':V([T.a[0]+(T.a[0]-T.b[0])*.08,T.a[1]+(T.a[1]-T.b[1])*.08,6],[T.b[0],T.b[1],0]),
  'Up the north wall (4 km of skarn)':V([M.c[0]+M.n[0]*260,M.c[1]+M.n[1]*260,5],[M.c[0],M.c[1]-800,2400]),
  'Across the tarn to the south bench':V([toe[0],toe[1],8],[2000,8000,1600]),
  'The dike islets':V([600,150,6],[1400,850,20]),
  'The sealed cauldron from the shore':V([-600,1000,10],[3000,-1500,1500])};
  return o;}
};
