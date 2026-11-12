// ================================================================= ARCH — the stations' sites (PLAN.md sections 5 and 11)  [G data]
// Scale model 5.1, surveyed 2026-11-11 (tools/scale-model/survey_biomes.py on model/data and the region store's polygons). Each page is a 5.2 km ideal
// type (R 2600 m) of its station: it takes the model's numbers (height, air, rain, temperatures, class, latitude), not its pixels. Page metres: x east,
// z south, origin the page's centre. px: the 5.1 canvas; world: the geology's frame (x = px * 2000, z = py * 2000); sky: the old canvas px the shared sky
// (ATMOS.skyBiome) is placed by (5.1 px less 272, 330: negative on the new ground north and west of the old canvas, which the sky's frame extends).
// Plain data: no THREE, no DOM. The stage (45-host-stage.js) draws the land from these records; ARCH.meeting (42) reads the confluence's.
var ARCH_SITES={
 // STATION 1, THE CONFLUENCE (the main page): the dome's south-east foot. The dome (a core complex of serpentinite, summit 1,456 m at px 314,168)
 // rises north-west at ~3.5%; a bench of travertine and laterite at its foot falls at ~0.6% to the graben's edge fault, which steps 30 m down to the
 // sound's floor in the south-east. Two type II springs at the dome's foot lay white terraces down to an alkaline pool; a small solfatara up the dome
 // to the north-east sends its acid stream down the fault's line; the two meet on the bench and run side by side south-east, split by curtains,
 // until the outflow drops over the edge fault and mixes. An eternal-flame cleft on the dome's flank to the west.
 confluence:{key:'confluence',name:'The confluence at the dome\'s foot',px:[324,180],world:[648000,360000],sky:{px:52,py:-150},
  base:183,atm:1.56,koppen:'Am',rain:1788,temp:{mean:27,warm:32,cold:23,low:18},soil:28,lat:-20.0,
  profile:{dome:.035,bench:.006,scarpU:[1250,1350],scarpDrop:30,floor:.015},   /* the land along u = (x + z) / sqrt 2 (south-east): PLAN.md section 5 */
  springs:[{key:'s1',x:-700,z:-900,r:16,flow:11},{key:'s2',x:100,z:-1100,r:12,flow:7}],   /* type II (Ca-OH): L/s */
  pool:{x:0,z:150,r:34},   /* the alkaline pool the terraces fill */
  solfatara:{x:900,z:-1500,T:96,reach:320,flow:12,pots:[[860,-1460,9],[960,-1540,7],[930,-1430,5],[820,-1560,6]]},   /* the acid stream's source; mud pots */
  meet:{x:350,z:300},
  outflow:{to:[1700,2400],w:24,curtainHalf:7},   /* the two waters side by side, the alkaline on the left (west) half, the acid on the right */
  flames:{x:-1250,z:-250,dir:[.7,.7],len:160,n:7},   /* a cleft on the dome's flank: hydrogen and methane burning (Chimaera's) */
  corrug:{spacing:150,amp:6},   /* the dome's mullions, along the opening direction (north-west to south-east) */
  seed:0x4A2C01},
 // STATION 2, THE DOME: the core complex's south-east flank (the summit, 1,456 m, ~21 km north-north-west; the slope here ~6% on the model's 2 km
 // cells, read as ~4% falling south-east with the mullions across it). The whaleback's corrugations run along the opening direction (north-west to
 // south-east): flat-topped ridges of red laterite with candelabra araucarias, troughs between them where the green-black serpentinite shows on the
 // flanks and type II springs rise at the troughs' heads, laying white terraces down the troughs; an eternal-flame cleft on a crest; a chrysotile
 // shear zone crossing the whaleback south-west to north-east, its fibres pale gold in the green rock (the asbestos hazard)
 dome:{key:'dome',name:'The dome: a core complex of bare mantle',px:[318,178],world:[636000,356000],sky:{px:46,py:-152},
  base:863,atm:1.44,koppen:'Am',rain:1616,temp:{mean:24,warm:28,cold:19,low:14},soil:24,lat:-20.0,summit:{px:[314,168],h:1456,km:21},
  slope:.04,corrug:{spacing:340,amp:24},
  /* the springs at the troughs' heads and the flames on a crest, in the dome's own frame: u along the fall (south-east), v across (the troughs at
     v = -85 + 340 k, the crests at 85 + 340 k); the stage gives them x, z */
  springs:[{key:'d1',v:-425,u:-1500,r:13,flow:6,len:2300},{key:'d2',v:-85,u:-1350,r:10,flow:4,len:2100},{key:'d3',v:255,u:-1550,r:12,flow:5,len:2400}],
  flames:{v:425,u:250,len:130,n:6},
  shear:{a:[-2400,1500],b:[2200,-1100],w:60},
  seed:0x4A2C02},
 // STATION 3, THE BARRENS: the south-eastern horst's lee, the driest ground (Aw)
 // a rolling laterite plateau falling gently south-east (~1.2%), cut by lavaka: amphitheatres where the red earth has slumped away down to the
 // mottled zone and the green garnierite at the laterite's base (Madagascar's lavaka, New Caledonia's mine scars); seeps at their heads (the pitchers),
 // the richest nickel round their rims (the verdigris caps beside the sève bleue). x, z: the head; dir: the way the mouth opens; r, depth (m)
 barrens:{key:'barrens',name:'The barrens: the nickel maquis',px:[258,246],world:[516000,492000],sky:{px:-14,py:-84},
  base:155,atm:1.57,koppen:'Aw',rain:1427,temp:{mean:27,warm:32,cold:22,low:16},soil:27,lat:-21.6,slope:.012,
  lavaka:[{x:-900,z:-600,r:140,depth:24,dir:[.6,.8],len:520},{x:300,z:-1100,r:110,depth:18,dir:[.7,.7],len:420},{x:-300,z:200,r:160,depth:28,dir:[.5,.86],len:640},
   {x:1100,z:-100,r:90,depth:14,dir:[.75,.66],len:360},{x:-1500,z:700,r:120,depth:20,dir:[.6,.8],len:480},{x:700,z:1000,r:130,depth:22,dir:[.66,.75],len:500}],
  seed:0x4A2C03},
 // STATION 4, THE SOUND: the graben's floor on the drowned axis (5-8 m of water, ~12 km wide)
 // the page in the band's own frame: `al` along the axis (north-east +), `w` across it (south-east +, toward the sound's middle). The floor falls
 // gently to the shore (w ~1,750), mangrove flats before it; the eruptive fissure of segment 9 runs along the axis at w -400 with its spatter
 // ramparts; that episode's flow (ARCH.episode(9, 0): 61 years before game start, 7.9 m of opening) spread south-east over the wet flats and blew
 // rootless cones where it did; open fissures (gjar) en echelon north-west of it hold clear water at sea level; a CO2 hollow at its north-east end;
 // the White Stacks (brucite and carbonate chimneys where alkaline springs meet the sea) stand out in the sound, their tops awash at low tide
 sound:{key:'sound',name:'The sound: the graben\'s floor',px:[299,220],world:[598000,440000],sky:{px:27,py:-110},
  base:7,atm:1.60,koppen:'Am',rain:1804,temp:{mean:30,warm:34,cold:26,low:21},soil:30,lat:-21.0,sound:{depth:[5,8],width:12000},
  axis:[.84,-.54],segment:9,year:0,shoreW:1750,
  fissure:{w:-400,al:[-2200,1700]},flow:{al:[-1700,1300],front:950,amp:380},
  gjar:[{al:-1500,w:-950,len:600,wd:9},{al:-950,w:-1050,len:520,wd:14},{al:-400,w:-1150,len:700,wd:11},{al:200,w:-1000,len:560,wd:7},{al:800,w:-1120,len:640,wd:12}],
  hollow:{al:1500,w:-260,r:70,depth:7},stacks:{w:[2050,2500],al:[-900,900],n:11},
  seed:0x4A2C04},
 // STATION 5, THE COAST: the seamount island's south-west shore; the Surtseyan caldera (DATA.vents px 166,338) 3 km offshore
 // the page in the shore's frame: `al` along the shore (south-east +), `w` toward the sea (south-west +). A tuff cone inland (a satellite of the
 // island's caldera: its rim 70 m, its crater dry), its flank falling to dunes and a black sand beach; a platform of old pillow lava at the
 // beach's north-west end, awash, with tide pools; the sea deepening south-west to the Surtseyan caldera, 3 km off, whose steam stands over the
 // water at the page's edge; warm, steaming ground on the cone's flank where the ash brooders lay (the fauna is PLAN.md section 8's, to come)
 coast:{key:'coast',name:'The steaming coast',px:[167,336],world:[334000,672000],sky:{px:-105,py:6},
  base:2,atm:1.60,koppen:'Am',rain:1710,temp:{mean:28,warm:33,cold:23,low:18},soil:28,lat:-23.7,vent:{px:[166,338],floor:-540,rim:-18,km:3},
  shore:[-.7071,.7071],cone:{al:500,w:-1500,r:520,rim:70,crater:300},platform:{al:[-1300,-450],w:[-60,260]},
  steam:{al:[-800,800],w:2350},warm:[{al:150,w:-1050,r:60,T:62},{al:420,w:-980,r:45,T:58},{al:-80,w:-1150,r:50,T:55}],
  seed:0x4A2C05}
};
