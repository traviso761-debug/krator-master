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
