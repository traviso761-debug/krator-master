// ================================================================= HOST — the station's record (station 2: the Garnet-Mirror Cauldron)
// One record a station: its numbers only (the apron's toe, the dikes, the springs, the stair, the snow, the hour, the views). The site's
// functions that make and read the records are src/44s, shared by every station; this file replaces src/44r for station 2.
// PLAN.md section 7, station 2: the deep cauldron. On the scale model (5.1) the Garnet-Mirror Tarn lies at 2,810 m, ~14 x 8 km on the 1 km
// grid round px 1186,344, its north-west wall the highest of the three cauldrons' (4.8 km within 1 km of the water, 6.3 km within 4: the
// red garnet skarn's cliffs), its south a low sill (3.4-3.7 km) with a lobe of the tarn reaching into it. The wettest station (2,212 mm,
// WH, +10 °C at the water; Dfb +10-12 on the south slope). The page stands on the SOUTH SHORE (px 1185,345.9: region/far.py), y = 0 at the
// water: the tarn fills the north of the box, the lobe its east; the south slope rises ~600 m in the first 700 m, then eases onto the
// sill (+0.8-0.9 km). Across the water, 8-12 km north-west, the great wall.
//
// WHAT THE STATION ADDS (44s's records): the spring apron along the south shore and round the lobe's west side; the dikes: two black
// basalt walls across the apron (strike N05W) into the tarn and a line of islets down the lobe; talus at their feet; three springs at
// the slope's foot between the two dikes, the main one's sinter stair (five treads). The cliffs' garnet red is the rock layer's tint
// (SITE.rockTint) over the megabreccia stand-in until the skarn's own texture comes (KNOWN_ISSUES.md).
const SITE={
 name:'garnet',title:'Garnet-Mirror Cauldron',kind:'cauldron',tarn:'The Garnet-Mirror Tarn',R:1600,step:8,seed:6201,
 // the climate is the tarn's (region/far.py 'clim': its WH cell, +10 °C at the water); its swing (PLAN.md section 3: 17 / 3)
 amp:{warm:7,cold:7},
 // the apron's toe: west to east along the south shore, then south down the lobe's west shore (inland: south of the first run, west
 // of the second); its rise inland (m a m), its front under the water, its reach
 apron:{toe:[[-2600,-930],[-1500,-960],[-500,-960],[300,-950],[650,-1000],[780,-800],[700,-300],[650,200],[620,700],[700,1100],[760,1700]],
  rise:.065,front:.5,lift:1.4,reach:480},
 // the dikes (KSTACKS.row): black basalt, the cauldron's boxwork. Two across the apron from the slope into the tarn, a line of islets
 // down the lobe
 dikes:[
  {id:'dikeW',a:[-900,350],b:[-700,-1500],n:15,H:[70,170],r:[9,15],e:[3.5,5.5],seed:6211},
  {id:'dikeE',a:[300,300],b:[420,-1400],n:13,H:[60,140],r:[8,14],e:[3.5,5],seed:6212},
  {id:'dikeL',a:[1150,-700],b:[1500,1150],n:10,H:[25,60],r:[8,13],e:[3,4.5],seed:6213}],
 // the springs: along the slope's foot between the two dikes (u: 0 the west dike .. 1 the east); the cell's span along the toe between
 // the dikes' crossings (APRON_PT's t: they cross the toe at -.32 and .10), kept 60 m off each
 springT:[-.30,.38],
 springs:[{u:.5,r:11,temp:.9,mineral:'sinter',name:'The Garnet Spring (the cell\'s main vent: hot, clear over a blue throat, its rim stained red)'},
  {u:.18,r:6,temp:.65,mineral:'iron',name:'A rust pool (iron from the garnet and the magnetite)'},
  {u:.82,r:7,temp:.75,mineral:'sinter',name:'A hot pool at the slope\'s foot'}],
 // the sinter stair: from the main spring down the apron to the tarn
 stair:{treads:5,w:22,dam:.3,step:2},
 // the cliffs' red: the garnet skarn (a tint over the rock layer, sRGB)
 rockTint:0xe0aa96,
 snow:{autumn:[1400,2000],winter:[250,450],spring:[850,1250],summer:[2500,3100]},
 // the hour the page opens at: noon (the giant eclipses the sun here from 09:00 to 10:59, as at station 1: ATMOS.sunHidden)
 hour:12,
 eye:30,
 views:V=>{const S=SITE_SPRINGS[0],T=SITE_STAIR,toe=APRON_PT(-.3,40),b=SITE_DIKE_MID('dikeW'),c=SITE_DIKE_MID('dikeE'),l=SITE_DIKE_MID('dikeL'),o={
  'The Garnet Spring':V([S.x+34,S.z-26,4],[S.x,S.z,0]),
  'Down the sinter stair to the tarn':V([T.a[0]+(T.a[0]-T.b[0])*.08,T.a[1]+(T.a[1]-T.b[1])*.08,6],[T.b[0],T.b[1],0]),
  'Across the tarn to the garnet wall':V([toe[0],toe[1],6],[-5500,-10500,1500]),
  'The west dike (black basalt across the apron)':V([b[0]+180,b[1]+60,4],[b[0],b[1],70]),
  'The east dike':V([c[0]-160,c[1]+40,4],[c[0],c[1],60]),
  'The dike islets down the lobe':V([600,-200,10],[l[0],l[1],20]),
  'The grove on the apron':V(APRON_PT(-.6,170).concat([2.2]).slice(0,3),APRON_PT(-.5,250).concat([4]).slice(0,3)),
  'The cauldron from the south slope':V([-300,500,40],[-1500,-4000,0])};
  return o;}
};
