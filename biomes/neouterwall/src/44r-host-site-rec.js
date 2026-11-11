// ================================================================= HOST — the station's record (station 1: Vitreous Hollow)
// One record a station: its numbers only (the apron's toe, the dikes, the springs, the stair, the snow, the hour, the views). The site's
// functions that make and read the records are 44s, shared by every station; a station's folder replaces this file (stations/<name>/).
// PLAN.md section 7, station 1: the Vitreous Boxwork Tarn's cauldron. On the scale model (5.1) the tarn lies at 2,950 m, ~15 x 11 km on
// the 1 km grid round px 1258,326, its walls rising to 4.3-4.8 km within 6 km (the lowest crest out 3,728 m, north toward Spider Lake). The
// page stands on its SOUTH-EAST SHORE (px 1260.75,327.8: region/far.py), y = 0 at the water: the tarn fills the north-west of the box, the
// cauldron's wall rises ~800 m in the first 700 m south and east of it, then eases onto the rim's slopes (+1.4 km at 2.4 km).
//
// WHAT THE STATION ADDS ON THE MODEL (each a plain record, JSON-safe; the export carries them):
//   the SPRING APRON  the model's 1 km grid has no shore: the tarn's cells meet the wall's. The apron is the bench the springs and the wall's
//                     fall have built out from the wall's foot: talus and sinter, ~350 m wide, rising from the water at ~7% to meet the wall.
//                     Its toe is a line (APRON.toe); the apron's height is a plain function of the signed distance in from it
//   the DIKES         KSTACKS.row fins (core/terrain 37, PLAN.md section 2 item 3: basalt and diabase dikes weathered out of the skarn as
//                     walls, boxing the ground into cells): two on one strike (N25E) crossing the apron into the tarn, a third across
//                     them out in the water (the cell's north side, a line of islets). Their feet are set under the lowest ground round them
//   the TALUS         KRELIEF.talus (38) banked against the fins' feet
//   the SPRINGS       the Outland Gate fault's hot water at the wall's foot inside the cell (PLAN.md section 2 item 4): a main spring and
//                     a few lesser pools along the foot (WATER.spring: 47 makes the records, 89w draws them)
//   the SINTER STAIR  the main spring's run-off stepping down the apron to the tarn: WATER.terraces' treads, the ground under them cut level
//                     and each tread's lip a sinter dam (a 2 m KFIELD inset holds them: 47)
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
const SITE={
 name:'vitreous',title:'Vitreous Hollow',kind:'cauldron',tarn:'The Vitreous Boxwork Tarn',R:1600,step:8,seed:6101,
 // the climate is the tarn's warm pocket (region/far.py 'clim': the WH cell, +9 °C at the water); its swing (PLAN.md section 3: 16 / 2)
 amp:{warm:7,cold:7},
 // the apron's toe (the new shoreline, page metres, west to north-east round the cauldron's south-east corner), its rise inland (m a m)
 // and its front under the water; reach: how far in from the toe it can run before the wall's own ground takes over
 apron:{toe:[[-2600,-760],[-1800,-790],[-1000,-800],[-300,-820],[250,-860],[650,-960],[930,-1180],[1080,-1520],[1150,-2000],[1200,-2700]],
  rise:.07,front:.5,lift:1.6,reach:520},
 // the dikes (KSTACKS.row): a, b the strike's ends (page metres), n fins, H their height over the lowest ground round the foot, r the
 // foot's half-width, e the elongation (half-length r*e)
 dikes:[
  {id:'dikeW',a:[-1180,120],b:[-560,-1240],n:16,H:[60,150],r:[9,15],e:[3.5,5.5],seed:6111},
  {id:'dikeE',a:[260,60],b:[640,-860],n:11,H:[50,130],r:[8,13],e:[3.5,5],seed:6112},
  {id:'dikeN',a:[-1500,-1420],b:[380,-1560],n:14,H:[30,70],r:[8,14],e:[3,5],seed:6113}],   /* n: the fins overlapping into a broken wall, not posts */
 // the springs: along the wall's foot between the two dikes (u: 0 the west dike .. 1 the east), the first the main spring
 // the cell's span along the toe between the two dikes' crossings (APRON_PT's t: the dikes cross the toe at -.29 and .24), kept 60 m off each
 springT:[-.26,.47],
 springs:[{u:.48,r:13,temp:.95,mineral:'sinter',name:'The Vitreous Spring (the cell\'s main vent: boiling, glass-clear over its blue throat)'},
  {u:.22,r:7,temp:.72,mineral:'sinter',name:'A warm pool at the wall\'s foot'},
  {u:.33,r:5,temp:.6,mineral:'iron',name:'A rust pool (iron from the skarn\'s magnetite)'},
  {u:.66,r:8,temp:.8,mineral:'sinter',name:'A hot pool at the wall\'s foot'},
  {u:.8,r:5.5,temp:.55,mineral:'copper',name:'A green pool (copper from the skarn)'}],
 // the sinter stair: from the main spring down the apron to the tarn; treads, its width, the lip's sinter dam (m over the tread)
 stair:{treads:7,w:26,dam:.35,step:2},
 snow:{autumn:[1500,2100],winter:[300,500],spring:[900,1300],summer:[2600,3200]},
 // the hour the page opens at: 13:00 (at 10:00, the frame's usual, the giant eclipses the sun here: ATMOS.sunHidden at this pixel and
 // day is over 0 from 09:00 to 10:59; the station lies 23 degrees east of the W outer wall's, toward the sub-giant point)
 hour:13,
 eye:30,
 views:V=>{const S=SITE_SPRINGS[0],T=SITE_STAIR,toe=APRON_PT(-.25,40),b=SITE_DIKE_MID('dikeW'),c=SITE_DIKE_MID('dikeE'),o={
  'The Vitreous Spring':V([S.x+38,S.z-30,4],[S.x,S.z,0]),
  'Down the sinter stair to the tarn':V([T.a[0]+(T.a[0]-T.b[0])*.08,T.a[1]+(T.a[1]-T.b[1])*.08,6],[T.b[0],T.b[1],0]),
  'The cell from the tarn (the dikes and the wall)':V([toe[0],toe[1]-260,3],[S.x,S.z,60]),
  'The west dike (a basalt wall across the apron)':V([b[0]+170,b[1]+40,4],[b[0],b[1],60]),
  'The east dike':V([c[0]-150,c[1]-60,4],[c[0],c[1],50]),
  'The grove on the apron':V(APRON_PT(-.55,180).concat([2.2]).slice(0,3),APRON_PT(-.45,260).concat([4]).slice(0,3)),
  'The hollow from the wall':V([-200,400,40],[-600,-2500,0]),
  'Across the tarn':V([toe[0]+200,toe[1]+50,8],[-5000,-6000,200])};
  return o;}
};
