// ================================================================= HOST — the station: THE STAIR (station 1)
// PLAN.md section 7, station 1: front 1 on scale model 5.1 (the lip at ~3,150 m over step 2's floor at ~2,450 m; 1.09-1.18 atm;
// 94-157 mm; Dsb/BSk; +9 to +12 C (22-25/-4 to -1), night low -11 to -15). The page's frame (x east, z south, metres) has its
// origin at 5.1 px 903,1116, the front's middle (the model's 2,809 m), and the valley's axis bears ENE (PLAN.md section 1:
// -0.28 rad from the vent): DOWN is downstream, ACROSS to the right of it. A station is a 9.6 km square of that frame.
//   key, title, hint   the page's names
//   centre, R, step    the square and the field's lattice (m)
//   site               the scale model's pixel the shared sky and the far country stand at
//   insets()           finer fields over boxes [{x, z, r, st, name}] (KFIELD insets): the close views' ground at 2.5 m
//   spine()            the LOD spine (the views' places), read once the frame is made
//   sky                the shared sky's preset over the kit's default (late winter on a cold steppe: a little cloud)
const STN={key:'stair',title:'Krator Godstep: the stair',
 hint:'Godstep valley, station 1: the god\'s stair. You stand on the lip of the head step at ~3,150 m: the first front falls ~700 m in a trap stair of ponded titanium-basalt flows, each a bench over a colonnade, an old frozen lava fall poured down it; below, step 2\'s dark floor with black sand dunes and moss-skinned cones; tumuli on the plains, a small playa behind a lobe up here, the Godthrone\'s mass to the south-west. Late winter: snow on the upper benches. N for night',
 centre:[0,0],R:4800,step:10,site:{px:903,py:1116},
 items:['boulder','stone','cairn','cushion'],
 counts:B=>B.talus>800&&B.stones>800&&B.cairns>=8&&B.cushions>300&&B.crusts>300,
 insets:()=>[{x:LIP.x,z:LIP.z,r:260,st:2.5,name:'lip',label:'The head step\'s lip (ground, 2.5 m)'}],
 sky:{air:{pressure:1.6,humidity:.22,thin:{y0:0,scale:8000}},clouds:{cover:.22,cumulus:.25,cirrus:.35},fogDensity:.00004},
 minimap:'Godstep valley: the stair (front 1)',
 spine:()=>[[0,0],[LIP.x,LIP.z],xzDA(-3600,0),xzDA(2600,0),xzDA(3600,-2200),xzDA(-1400,2600),xzDA(-1400,-2600)]};
