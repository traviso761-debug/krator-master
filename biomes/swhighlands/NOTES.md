# biomes/swhighlands: notes

## Station 1, the ring folds (2026-10-26)

Built on the owner's go-ahead for station 1, from `PLAN.md`'s proposals as written (the open questions are in `KNOWN_ISSUES.md`).
The first of the planned biomes on the final rebuild's core: started from `biomes/nhighlands` (the full adoption) and
`biomes/abyssal-savannah`; `PLAN.md` "Core adoption" lists every module taken and why the rest are not.

- **The ground** is records first (`KRELIEF.range` x4, `KRELIEF.gap` for the water gap, the arch's wind gap and the gorge's four
  steps, a `KCARVE` alcove for the cave's mouth, `KRELIEF.river` for the three courses' levels, `KRELIEF.fields` for the farm), baked
  once into a `KFIELD` heightfield (6 m, a 2 m inset over the gorge and the cave). The ground mesh is a 6 m grid holed under the inset,
  the inset's rim on the base grid's lines (no crack).
- **The beds**: one `KSTRATA` `ringfold` stack, folded about axes along the crest (wl 1.7 km, amp 150 m, sharp .85), the chevron's
  crest on the cave's mouth; drawn on the ground's steep faces, the rock bodies and the cave's hood; the inspector names the bed.
- **Placement** is all `KRAND`: one candidate a cell from `KRAND.hash(world, i, j, salt)`, each tree's form from
  `KRAND.stream(its seed)`; no `BIO.grid` (its draws are a stream) and nothing from `BIO.fn`'s sin hash. Keep-clear on `KSPACE`.
- **The look pass so far** (the owner's notes, 2026-10-26): the cave stream meets the river as one water through core/water's new
  `WATER.join` (moved into core on the owner's word: cut at the tuck line, levels raised, drawn after the river), and every channel
  near a point is carved with the lowest kept (no channel or bank across the other's water, no tip); the arch's and the bridges' upper corners worn
  round and their faces roughened; the bite, the gaps, the gorge and the sink given irregular edges (`rough`, KRAND radius noise).
- **Later look notes, same day**: the tributary's end fades into the river (`drawFlow` `endFade`, new in core/water: its foam stops,
  it takes the river's colour over the river's bank foam, then fades out); the lattice oak's cup-pads textured (`organic.funnel.trumpet`
  from above, a veined fallback); the pads and caps on an opaque material (the bead cone's cap showed what stood behind it on the
  foliage hook); the river cave moved to the ridge's foot (a ~22 m face; no bite cut deeper than 28 m under the natural ground; a
  smaller mouth): it had been a pit under a ~100 m wall. The owner's reference photos match `refs/26`, `28`/`29` and `31`.
- **Measured**: `PERF.md` (before these late notes; the cave and the pads change the counts little).

## Station 6, the treeline (2026-10-27)

On the owner's word (a station with no running water, the native forest in its second climate; PLAN.md section 7). Built from the
same `build.py --station treeline`: `stations/treeline/` overlays the host fragments, the kit's `56-biome-swhighlands-treeline.js`
holds its passes, the eastern highlands' kit is read in place for the glass tower. The treeline stands at 4.3 km (the whorl columns
shrinking to krummholz over its last 150 m); bottle brushes on the north-facing (sunny) spurs; snow on the shaded slopes from ~4.6 km
and in the cirque's shade; the crest's megabreccia from ~4.6 km.

Lessons for future builds and suggestions for core: `LESSONS.md`.

## Station 4, the pillar rim: its flora (2026-10-27)

The flora only, ahead of the station's stage (which waits for Span's arcology): `src/57-biome-swhighlands-pillars.js` and the
species file's station-4 rows. The anemone tree (refs/03, right: stone-clasping roots, a stocky S-curved pored trunk, a plume of
teal tentacles; a boulder at its foot when it grows on a fallen block), cushion sponges (the painting's dark green mounds), torch
spikes (refs/03), bead coral (refs/20 D), rim turf and moss. Placement reads the fields `top`, `floor`, `block`, `wet`
(BIOME-API.md), which station 4's stage will bake. Preview: station 1's page with `?sheet=pillars` (the views "Station 4 flora: the
anemone trees" and "... the floor"), every stage of the tree and a bed of each floor plant on the bald. Not yet: the pass run on a
real stage, its triangle budget, impostor gain, textures from the library (the bodies are procedural flesh grain and vertex colour).

## Stations 2, 3 and 5: their flora (2026-10-27)

The flora only, ahead of the stages, as for station 4 (`58`, `59`, `59c`; the shared helpers `SWHI.GB` in 50 and `SWHI.FL` in 57):
- **Station 2, the rain wall** (`58`): stilt pod trees (refs/02), shelf coral (07), weeping wisps (08, with blue-berry bracts and
  drop-fruit on their boles, refs/19), the fishing bridge (13, placed from the host's stream crossings), glow tubes (19, their tips
  lit), bearded triplets (20 B), moss.
- **Station 3, Span's tableland** (`59`): cell lamps (18, their offspring spheres round them), wing reeds (03), bulb trumpets
  (20 E), drip caps (19, an item for the dress pass on posts and ruins), with station 4's torch spikes, bead coral, cushions and
  anemone trees on the domes.
- **Station 5, the fan coast** (`59c`): star-fruit caudex (06) and coral melons (20 A) as its small trees, arrowheads (20 C), frill
  tubes and trumpet slugs (03), flame pods (19).
Preview: station 1's page with `?sheet=rainwall`, `?sheet=tableland` or `?sheet=coast`. Fixed on the way: the leaf helper
(`leafInto`) and the lathe wound their faces down and in, so a double-sided material lit their back faces black from above: their
winding is now front-up and outward. Not yet: the swlowlands species read in place (tier cedar, flayed madrone on the tableland,
ember manzanita on the scarp: the stations' build.py will carry their fragments), the rain wall's drowned trees (the stage's
work), the hanging swamps' dark hooked pitcher, the passes on real stages, their budgets, impostor gains and library textures.

## Station 4, the pillar rim (2026-10-27)

Built on `--station pillars` (`stations/pillars/`): the table (`KRELIEF.tableland` on `KRELIEF.joints`), its cliff, 40 towers
(`KSTACKS.pillars` from the same joints and zone, thinned by each block's own draw to two in five; each contoured by
`KSTACKS.contour` and worn by `KSTACKS.weather`), the watch pillar made whole and held bare, the green floor and Pan Riba
(`KRELIEF.meander`, `WATER.flow`), the flora of `57`. The towers are rock bodies over the ground, not ground: the kit's plants stand
on `terrainH`, which answers a tower's top where there is one (`towerTop`), and the mask keeps them off the walls (`nearTower`);
the towers are not obstacles (an obstacle blocks its whole top). Strictly apart from Span (the owner): the station publishes
`SWHI_PILLARS_SITE` (BIOME-API.md) and reads nothing of `settlements/span`; `core/terrain/37b-core-stacks-contour.js` came from the
Span session's branch as a core file only (its commit's `core/` part).
Not yet: PERF.md's measure on the Intel GPU, the impostor gain on this page (station 1's 1.6 is used), the Liesegang bands as
diagonals in the beds (the library's liesegang grain carries them for now), talus blocks at the towers' feet, mist that lies only
round the tops (the height fog's band is level).
