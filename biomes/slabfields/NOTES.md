# biomes/slabfields: notes

## Station 1, the Anvil's Foot (2026-11-12)

**Where.** Scale model 5.1 px 1662,1369 (edit 3's `slab_anvil`, its cliff 0.7 px south of the page's centre); the middle bench at 3,290 m,
1.07 atm, Dsc, 141 mm, +8 degC (warm month 21, cold month -5). Old canvas px 1390,1039 places the shared sky.

**The cliff.** `KRELIEF.scarp` along the Anvil's lobate front: the rim at z 2,200 m on the page's centre line, receding south by
2,400 (x / 20,000)^2 m (the model's bow of 1.2 px over a half-length of 20 km), so the face curves away east and west in the far field.
Height 1,990 m over the bench, a run of 650 m (the face averages about 72 degrees), three flow-top benches, 34 ravines over the 32 km of line,
buttresses every 480 m, a talus skirt of 150 m reaching 380 m. Behind the rim the slab's ramp falls 0.123 a metre (7 degrees) south. The
crest reads 5,280-5,300 m against the model's 5,356 m (the page's crest is the rim's lip; the model's is a 2 km cell's top).

**The apron.** The last collapse's lobe: from the cliff's foot 3.6 km north, 5 km wide at the foot narrowing to 3 km at the toe, 110 m thick at
the foot thinning to about half, a raised distal rim (1.4 times), levees on its flanks, hummocks (KRAND fbm, up to about 25 m), furrows along
the run near the foot and transverse ridges where it slowed. Fall height over runout from the crest: 2,000 m over 4,250 m, H/L 0.46: a
cubic-kilometre collapse, not the region's largest (PLAN.md 3.4).

**The blocks.** 48 tries, 7 field-sized (68-116 m across, 18-34 m high) on the distal half where a sturzstrom drops its largest, the rest
14-52 m across. KSTACKS buttes (one or two tiers of flows, beds 1.2-4 m, weathered), kept apart by KSPACE.

**The spring line.** Nine seeps a little past the toe from x -1,900 to 1,700 (where the toe reaches), 7-20 m across, half a metre under the
bench; the middle one's brook runs off north-north-west down the bench's fall of 4 m a km.

**The hour.** The page opens at 14:00: at this longitude the giant eclipses the sun at 11:00 on the sky's day 0 (the Siphon Pits page found the
same and opens at 14:00).

**The snow.** The site's snow line is 5,150-5,500 m: only the Anvil's crest (ET, -4 degC, 5.3 km) takes the lying snow; below it the face is
bare basalt. At 4.3 km (the first value) the snow cover lay on the 70-degree face and drew it white.

**The cards' normals.** A leafMat made with `aN:true` needs its item's def to list `attrs:['aN']`, or the per-instance normal is never uploaded
and the card draws black (the shader normalises zero). Found here on 2026-11-12; biomes/highrift's `hrtuss` and `hrheath` defs look the same.

**The LOD origins.** Every seep is one of the stage's LOD origins (`L.spine`): the reed is near-field life placed within `Lv.mid` (560 m) of an
origin, and the outer seeps, more than a kilometre from the slab's points, stood bare until they were added (2026-11-12).

**The face's irregularity** (the owner, 2026-11-12: "too blocky and regular"). The scarp's three even benches are gone; in their place, in
the stage: five ledges whose heights wander along the strike and fade in and out (a smooth stair in the share of the height, back-tilted a
little where strongest); the cliff's height wandering 1-2 km scale (the throw is uneven); a ragged skyline (notches and towers at 25-250 m,
the top only); the face's profile convex in some stretches and concave in others; face noise at three scales and vertical fluting (the
columns' joints); fewer, wider, varied gullies; buttresses closer and bolder; the beds warped (KSTRATA warp 22 / 7 m). Still panel-like
from afar: the face is one profile with noise on it, and a stepped, spur-and-gully form would break it further (KNOWN_ISSUES).

**The cliff on `KRELIEF.slab`** (2026-11-12, the owner: "do it"). The face is now core/terrain's `38d-core-slab.js`: spurs every 520 m on
average (spacing 0.4-1.9 of that), each 70-97% of its spacing wide, standing 20-170 m out, its run 0.65-1.6 of 650 m and its power 1-1.9;
gullies cut 20-130 m back between them, with scree cones 50-150 m high at their mouths; five wandering ledges; a fresh scar 1.8 km wide set
170 m back over the apron's head; the ramp at the slab's 0.123. The stage's own ledges, bulges, crest and face noise are gone (the form's own
replace them). A first setting (spurs 50-85% wide, standing out 40-240 m, gullies 50-200 m back) cut the face into sheer slots, a pleated
curtain; the broad spurs read as one escarpment. Crest 5,324 m (the model's 5,356 m), the cliff 1.94 km over its foot.

## Station 2, the Leaner (2026-11-17)

**Where.** Scale model 5.1 px 1601,1392 (edit 7's `slab_leaner` and `patera_leaner`); the station's cell 2,180 m, BSk, mean 17 degC, warm
month 30, cold month 4, hottest 41, coldest -7 (read 2026-11-17 through `smodel.page`: `th` and `tl` are set here, unlike the Anvil's cells);
the corridor's plain under the page 2,110 m (the cells round it 2,106-2,129 m), 1.23 atm, 235 mm (the patera shore's). Old canvas px 1329,1062
places the shared sky. Files: `stations/leaner/` (`python3 build.py --station leaner`, `dist/slabfields-leaner.html`); station 1's bytes are
unchanged (the station overrides the stage, ground, far field, blocks, placement, water and views; it adds its site record `40l`).

**The frame.** The slab's strike runs ENE (30 degrees), so the page works in (s, v): s along the strike, v across it toward the ramp (SSE);
`x = .866 s + .5 v`, `z = -.5 s + .866 v` (`SV` in the stage).

**The cliff.** `KRELIEF.slab` along the lobate front, the rim at v 1,100 on the page's centre line, receding 2,400 (s / 15,000)^2 m; height
1,250 m over the plain, a run of 430 m, spurs every 420 m, gullies cut 15-90 m back, cones 30-90 m, a fresh scar 700 m wide over the apron's
head. The ramp falls 0.1175 a metre (6.7 degrees) SSE. The beds (`SLAB_STRATA`) rise NNW at the same 0.1175.

**The compression.** On the model the patera's rim is about 4 km in front of the cliff with the apron between (the patera's centre 8 km from the
bowed cliff line). The page brings the rim to about 1.6 km so cliff, apron, rim, shelf and lake stand in one view: the patera's centre 4.9 km NNW
and 1.4 km WSW of the page's middle, rim radius 4 km (the model's 2 px), shore 3.2 km (its lake_r 1.6 px).

**The patera.** `KRELIEF.stepcut` (a disc of 4 km, two steps: a sheer wall and a 28 m bench) down to a shelf at 2,004 m; the shelf falls
0.95 m a hundred metres to the shore and the lake's bowl under it to 1,907 m (the model's floor). The lake is a `WATER.open` at 1,997 m (the
model's level) with a 4 m shore grid, still (no surf), kept inside the rim; past the square the far field colours it and holds it level.

**The tilt** (PLAN.md 3.6, the default taken: the Leaner is in a bradyseism now). Three strandlines on the shelf, beach berms at 1.4, 3.1 and
5.2 m over the water at s 0, each rising 0.35-0.8 m a km toward the ENE (the sill's end), so against the water's level they read tilted; the
shelf between the water and the highest is pale marl. On the ramp six ponds sit in flow-top hollows behind pressure ridges: each basin's floor
falls 1.4% toward the SSE since it formed, so the water lies in the low end and the high end is a dry floor with the old shore across it.
Seven live warm springs (24-31 degC) a metre or so over the water and four dead ones higher up the shelf (dry craters, sulfur on their rims):
the outlet moving down the shore. Six open tension cracks behind the lip (2-6 m wide, 8-22 m deep).

**The apron and the road.** An older, thinner lobe than the Anvil's (80 m at the foot, hummocks to 12 m) runs from the cliff to the patera's
rim and spills into the pit as a fan grading 1:9 to the shelf. The corridor road comes in along the apron's toe from the ENE, goes down the spill
and along the shelf out WSW; its bed is the ground smoothed over 120 m and held to 1:9, 5 m wide. 26 blocks tried on the apron (4 field-sized),
kept off the road; the talus's fresh blocks are the swarms' rockfall.

**The life.** The kit's own on the apron, the shelf and the plain (`SLAB.buildApron`: reed by the lake, the springs and the ponds, bunch grass
on the dry corridor, lichen on the blocks, fern in their shade); on the slab the Siphon Pits' cold ground's small life read in place
(`SIPHON.buildCold`: cushion moss, orange rock lichen, scree sedge; `station.json` kin, with `46-host-siphon-shim.js` giving its 40 the empty
station table its own build inlines). Oidong's cushions are not drawn here (BSk, +17 degC).

**The hazards.** The cliff (`fall`), the rockfall belt in 500 m lengths (`crush`), each tension crack (`fall`), the patera's wall (`fall`), the
quake swarm over the shelf and spill (`slip`, low), CO2 and H2S pooled at three springs' hollows (`gas`), the big blocks' voids (`gas`).

## Station 3, the Halves (2026-11-17)

**Where.** Scale model 5.1 px 1722,1376 (edit 7's `slab_halves_n`, `slab_halves_se`, `patera_halves`); the patera's cell (1722,1374) read
2026-11-17: its lake at 3,062 m (the model's floor), Dsc, mean 7 degC, warm month 20, cold month -6, hottest 28, coldest -14; the gap's bench north
of it 3,214 m. The page's bench 3,310 m (1.06 atm), rising 4 m a km toward the south-east (the model: 3,234 m by the north-west half, 3,435 m by the
south-east); 173 mm. Old canvas px 1450,1046 places the shared sky. Files: `stations/halves/` (`python3 build.py --station halves`,
`dist/slabfields-halves.html`).

**The compression.** On the model the halves stand 10-15 km from the patera's middle and the pit chain's pits 8 km out (`spr_slab_halves_patera`'s
note: 1725.0,1371.4 and 1719.0,1376.6). The page keeps the patera at the model's size (rim 5 km, shore 3 km, its centre 4 km north of the page's
middle, so the page sits on its south floor and wall) and brings the south-east half's cliff and torn west end to the page's south-east corner (the
corner 1.2 km from the middle), two pits of the chain to the bench south-west of the wall (1.5 and 2.5 km out), and the north-west half to 6-15 km
north across the water.

**The halves.** Each a `KRELIEF.slab` along a rim that turns its corners (west end, north cliff, east end; 14 km long, 10 km deep), so the cliff
runs on round the corner into the torn end that faces the gap. Heights over the bench: 1,550 m (the south-east, crest 4,875 m in the model) and
1,420 m (the north-west, 4,674 m); a run of 520 m; the ramps fall 0.16 a metre (9.1 degrees) behind the rims. The ramp falls from the nearest rim,
so near the torn ends it falls away from them too: a ridge along each half rather than one plane (seen only from afar). The beds rise north at
0.16.

**The patera.** `KRELIEF.stepcut`, a disc of 5 km with three steps (24 m treads), from the bench down to its floor at 3,108 m: the old lava lake's
crust, nearly level, its pressure ridges a metre high, painted dark. The pool on `WATER.open` at 3,102 m (the model's level), its bowl to 3,062 m.
Five warm springs (14-22 degC, CO2) on the south shore.

**The pits.** Two `KRELIEF.stepcut` discs on the bench, 840 and 600 m across, 170 and 120 m deep, two steps each; a cold seep on each floor (a
`WATER.still` pool) and CO2 pooled 4 m deep on each floor (`gas`, the strongest on the page: a pit is the region's best gas trap).

**The apron.** The south-east half's collapse runs north from its cliff's foot to the patera's wall (an ellipse 2.6 x 1.4 km, 90 m at the foot);
30 blocks tried (5 field-sized), the big ones on its distal half; fresh blocks on the talus under the cliff.

**The life.** As station 2's: the kit's own (reed at the shore, the springs and the seeps; bunch grass; lichen on the blocks; fern in their shade)
and the Siphon Pits' cushion moss, rock lichen and scree sedge on the bench and the halves off the apron and the patera's floor (the bench at 3.3 km
is Dsc, as the Siphon Pits' Scarp Pass at the same height).

**Not drawn.** The outlaws' seat the plan proposes here (PLAN.md section 12: a default the owner is to confirm, and core/camp's amendment 4, a
war-camp row, a band of 10-30 and a lookout record, is not built), and the pit chain's back way down.
