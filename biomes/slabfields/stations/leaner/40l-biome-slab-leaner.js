// ================================================================= THE SLABFIELDS — station 2's site: the Leaner (PLAN.md sections 3.6, 5 and 13)  [G data]
// Scale model 5.1 after edit 7 (tools/scale-model/edit_517.py: slab_leaner, patera_leaner, spr_slab_leaner_patera). An ideal type of its place (R 2600 m):
// the model's numbers, not its pixels. The slab's strike runs ENE (30 degrees from east toward north), its cliff faces NNW over the corridor's south
// end, its ramp falls 6.7 degrees SSE; the patera (10 km across, 180 m deep, a warm spring lake 90 m deep) lies at the cliff's west foot by the road.
// On the model the patera's rim is 4 km in front of the cliff, the apron between; the page brings it to 1.6 km so cliff, apron, rim, shelf and
// lake stand in one view (NOTES.md). Frame: s along the strike (ENE), v across it toward the ramp (SSE), both metres from the page's centre;
// x = .866 s + .5 v, z = -.5 s + .866 v. Plain data: no THREE, no DOM; the stage (stations/leaner/45-host-stage.js) draws the land from it.
SLAB_SITES.leaner={key:'leaner',name:'The Leaner',station:2,px:[1601,1392],world:[3202000,2784000],sky:{px:1329,py:1062},
 // the station's cell (5.1 px 1601,1392, read 2026-11-17 through smodel.page): 2,180 m, tm 17, tw 30, tc 4, th 41, tl -7 degC (th and tl are set here);
 // the corridor's plain under the page 2,110 m (the model's cells round it 2,106-2,129); rain the patera shore's 235 mm (PLAN.md section 5)
 strike:30,base:2110,atm:1.23,koppen:'BSk',rain:235,temp:{mean:17,warm:30,cold:4,high:41,low:-7},snow:[4600,5100],
 // THE SLAB: the rim at v 1100 on the page's centre line, its lobate front receding 2,400 (s / 15,000)^2 m (the model's bow of 1.2 px over a half-length
 // of 7.5 px); crest 3,355 m (1.05 atm) over the corridor's 2,110 m; the cliff's run 430 m (about 71 degrees); the ramp falling 0.1175 a metre (6.7 deg)
 slab:{id:'slab_leaner',name:'The Leaner',rimV:1100,bow:2400,half:15000,h:1250,run:430,dip:.1175,crest:3355,talus:{h:90,reach:260}},
 // THE APRON: an older, thinner lobe (80 m at the foot) than the Anvil's, centred a little west of the page's middle; it runs over the patera's rim and spills
 // down into the pit as a fan (the road's way down)
 apron:{s0:-200,foot:80,half:[1350,1000],hummock:12,levee:10,spill:{w:550,grade:.11}},
 // THE PATERA: a collapse pit over the sill's roof, its centre 4.9 km NNW of the page's middle and 1.4 km WSW; rim 4 km out, a sheer wall of 90 m and
 // a 28 m bench to the shelf (2,004 m), the lake's shore 3.2 km out (the model's lake_r 1.6 px), level 1,997 m, its floor 1,907 m at the middle
 patera:{c:[-1400,-4900],r:4000,shelf:2004,level:1997,shore:3200,floor:1907,wall:{steps:2,tread:28,riser:5,warp:45}},
 // THE TILT (PLAN.md 3.6; the default the plan took: the Leaner is in a bradyseism now). The sill under the slab's ENE end rises 25 cm a year: the
 // lake has drifted off this (SSE) shore and its old strandlines stand above the water, tilted, higher toward the ENE (m over the level at s = 0, and
 // their rise a km along the strike)
 tilt:{rate:.25,strands:[[1.4,.35],[3.1,.55],[5.2,.8]],shoreShift:120},
 // the warm springs on the shelf (water at 24-31 degC, CO2 and H2S: sulfur on their rims); `dead` of them dried as the outlet moved down the shore
 springs:{n:7,dead:4,s:[-1950,-800],r:[3,8],temp:[24,31]},
 // the ramp: open tension cracks behind the lip (the crest's tell of the next collapse), and ponds in its flow-top hollows, each tilted off its old
 // basin (`tilt` the floor's fall a metre toward the SSE since the pond formed: the bradyseism's centuries made visible)
 cracks:{n:6,back:[70,420],len:[260,1100],w:[2,6],d:[8,22]},
 ponds:{n:6,v:[1500,2450],r:[34,70],tilt:.014,deep:1.1},
 // the corridor road (Spindle Fan to Ostrukh-on-Water), in (s, v): in from the ENE along the apron's toe, down the spill, along the shelf under the wall out WSW
 road:{w:5,pts:[[2900,-800],[1500,-700],[600,-760],[150,-1000],[-150,-1250],[-500,-1150],[-1100,-1080],[-1900,-1080],[-3000,-1380]]},
 blocks:{n:26,big:4,r:[6,22],bigR:[26,44],H:[5,18],bigH:[14,26]},
 gas:{springs:3,voids:2},
 far:{bench:2110}};
