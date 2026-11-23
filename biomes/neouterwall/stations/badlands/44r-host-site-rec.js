// ================================================================= HOST — the station's record (station 3: the Epidote Badlands)
// One record a station: its numbers only. This station's site functions are its own too (stations/badlands/44s: gullies and ribs, no
// tarn): the frame's other fragments read the same interface.
// PLAN.md section 7, station 3: the skarn ribs between the two cauldrons. On the scale model (5.1) at px 1200,330: 4,784 m, 0.88 atm, ET,
// +4 °C, 1,867 mm, a slope rising south-west about 7% (the 1 km grid is smooth here). The skarn_badlands zone of section 2: Korona's
// contact aureole baked into banded skarn (epidote green, garnet red-brown, magnetite black, marble white), cut by badland gullies, the
// Arachnoids' dikes standing out of it as low ribs (the dike_lattice), the magnetite in black outcrops.
//
// WHAT THE STATION ADDS: two gully systems (KRELIEF.gully, `liang` tops: rounded ridges between sheer-sided gullies) draining the slope
// north-east; three rows of dike ribs (KSTACKS.row fins, 8-30 m) across the slope, none standing in a gully; talus at their feet; a field
// of magnetite outcrops (KSTACKS.cluster, black and rust); the prospectors' camp ground registered (its tents are owed: core/camp needs
// the culture who quarries here, PLAN.md section 9).
const SITE={
 name:'badlands',title:'The Epidote Badlands',kind:'badlands',R:1600,step:8,seed:6301,
 // ET: the warmest month under 10 °C (Koppen), so no tree stands here; the swing (section 3's lowland figures, colder in winter up here)
 amp:{warm:5,cold:9},bands:{treeline:10,tundra:5},
 // the gully systems: thalweg from the head (south-west, up the slope) to the mouth (north-east, past the box), meandering
 gullies:[{a:[-1500,1400],b:[2600,-1900],amp:90,wave:650,depth:55,w:5,seed:6311},
  {a:[-2300,-150],b:[1100,-2700],amp:70,wave:560,depth:40,w:4,seed:6312}],
 // the dike ribs (KSTACKS.row): ENE across the slope, radiating from the Arachnoids to the south-west
 dikes:[
  {id:'ribA',a:[-2000,-900],b:[2000,500],n:16,H:[10,30],r:[3,6],e:[4,7],seed:6321},
  {id:'ribB',a:[-2000,450],b:[1800,1700],n:13,H:[8,26],r:[3,5.5],e:[4,7],seed:6322},
  {id:'ribC',a:[-1700,-2000],b:[2200,-650],n:13,H:[8,24],r:[3,5],e:[4,6.5],seed:6323}],
 // the magnetite outcrops (KSTACKS.cluster): black knobs and rust-stained spires in a field on a liang between the gullies
 ore:{c:[150,250],rad:420,n:12,H:[3,9],r:[1.5,3.4],seed:6331,col:[0x2a2a2c,0x6a3e2a]},
 // the prospectors' camp ground (a flat on the liang, the ore field's edge): registered, not drawn
 camp:{c:[-260,520],r:22},
 need:[24,6],
 spine:[[150,250],[-260,520],[900,-700],[-900,-300]],
 snow:{autumn:[150,450],winter:[-2000,-1900],spring:[-300,0],summer:[1200,1700]},
 hour:12,
 eye:30,
 views:V=>{const T=SITE_TRUNK_AT,a=T(.3),b=T(.5),c=T(.12),r=SITE_DIKE_MID('ribA'),O=SITE.ore.c,K=SITE.camp.c,o={
  'Down the gully':V([a[0],a[1],4],[b[0],b[1],2]),
  'The gully head':V([c[0]+60,c[1]-50,6],[c[0],c[1],-10]),
  'A dike rib across the slope':V([r[0]+60,r[1]-120,4],[r[0],r[1],12]),
  'The magnetite outcrops':V([O[0]+90,O[1]-70,3],[O[0],O[1],3]),
  'The prospectors\' flat':V([K[0]+70,K[1]+60,4],[K[0],K[1],1]),
  'The badlands from above':V([-900,1300,260],[600,-900,0]),
  'Up to the rim':V([500,-600,8],[-6000,6000,800]),
  'Down to the north-west lowland':V([-200,-400,12],[4000,-9000,-600])};
  return o;}
};
