# Longsong

The History Monks' monastery in the Oidong Valley (LORE.md 6.15): the Order of Historians' training, research,
archival and containment house, built **in situ** on the scale model's land, on its own rock over the Longsong stream.
`BLUEPRINT.md` is the programme (the owner's brief of 2026-10-15, the Potala study, the floors); `ROOMS.md` the plan of
every room and outbuilding before the interiors, and the exterior's revision toward the chapterhouses; `PLAN.md` is how the
build reads it (the site, the decisions of 2026-10-19, the order of work); `KNOWN_ISSUES.md` is what is open.

Published as its own artifact (2026-10-20), linked from every part of the Krator Worlds gallery:
https://claude.ai/artifact/H8dwc8PQetUMZBHo5NkJUY (`gallery/README.md`, "Longsong: its own artifact", says how to update it).

```
python3 build.py                                   # dist/longsong.html (+ its three texture sidecars: the library pack splits at its size cap)
python3 verify.py dist/longsong.html --assert [--views "Longsong from across the stream (north),The Procrastinator"] [--out shots]
```

Query switches: `?noflora=1` (no Oidong kit: a quick look at the architecture, ~50 s headless), `?q=0.5` (the kit at
half quality), `?mat=proc` (the procedural maps instead of the library's), `?hour=6` (another hour: the people, the sun on its arc, and by night the stars, the generator's bulbs and the butter
lamps in the windows; `89x`).

## What the page is

- **The site is the scale model's** (4.21). `region/` holds the cut round it (120 km square from
  `tools/scale-model/extract_region.py`; the model's regions and settlements as read on 2026-10-19 in `region/source/`,
  the cut's box added as `regions-cut.json`), decoded at build time by Pinnacle Rock's `tools/world_data.py` (read in
  place, with this page's kit line). The kit grows on the model's 'Oidong Valley' overlay (moved to the biome layer by the
  owner, 2026-10-19). The page's origin is the foot of the rock, at px 954,1296 (`LS.SITE`): the apron
  south of the Longsong stream (the model's r105, *Lõsõ-bi Siṭrīm*), where the owner moved the model's Longsong
  marker (2026-10-19; it had stood 7 km east-north-east, at 957,1294 on the medial swell; PLAN.md, section 1).
  The floor IS the model's land (WORLD.H), with what the plan shapes finer than its 4 km cells: the rock, the ward's
  terraces, the building pads, the lotus pond. The far terrain draws the cut to 60 km.
- **The plan is data** (`src/40-ls-plan.js`, `[G data]`): the rock (`LS.ROCK`, `rockY`), the grounds and the ward,
  the Great Stair, the 30 buildings as records (kind, footprint, base, storeys, core/tags types, the blueprint's
  sheet), the chortens, the prayer-wheel rows, the flags, the lamps, the gardens the kit may plant, the Vault's ten
  rooms, the Procrastinator and the eight sealed things (the register: designation, class, what it is, the procedure),
  the relics, the people (faction, sub-faction, job, a 24-hour schedule by role) and the places their activities go to;
  `LS.whereAt`, `LS.zoneAt`, `LS.plantable`. Nothing in the drawing fragments decides where a thing goes.
- **The architecture** (`62-ls-arch.js`, `64-ls-monastery.js`): Tibetan massing in the chapterhouses' vocabulary,
  **stone and lime only** (the owner, 2026-10-19: no Sahelian mud or rammed earth). Battered whitewashed walls on a
  granite plinth, black trapezoid windows under corbelled lintels, the maroon twig band with gold roundels, flat roofs;
  the Red Palace over the White; the gilded hip roofs; and the Order's own forms: the parabolic Great Gate between
  banded pylons, the Lower Gate between paired drums, the Great Assembly Hall a drum under a blue tile cone and lantern,
  the Hall of Hours (its dial facing the valley) and the Observatory on the roof, the Debate Court's arcaded galleries
  curving round its corners, round relief-ringed windows on the archive's storeys, the blue-and-white string course,
  the Eastern Watch a granite spire with the Order's bell, electric lamps along the avenue. One merged mesh per
  material on the library's maps (`materials.json`, `tex/`).
- **The containment's dress** (`63-ls-signs.js`): the Order as Buddhist keepers of an SCP-like register. The Order's
  sigil (a wheel of eight spokes round an hourglass), register plaques in the Order's book hand (designation, class in
  the keepers' words: STILL, SLOWED, HELD, UNWRITTEN; the procedure), seal strips on every sealed door, the Closed Ward's
  "one door, one warden", the great thangka of the register hung on the White Palace's face, the Lower Gate's and the
  Warden's gate's boards.
- **The forbidden depths** (`66-ls-vault.js`): under the rock, by one stair from the Red Palace: the Warden's gate
  and its register, the open vault's shelves, the closed vault's eight lead doors, the three quiet cells, the
  Unmaking Room, the Oath Room, the Sealed Library; and down the Long Stair, **the Procrastinator**: a prayer wheel the
  size of a tower (7.2 m across, 19 m tall) turning once in three minutes in a drum-shaped hall 62 m under the ward,
  its glyph bands burning and pulsing, three keepers walking it round; in the eight seals round the hall the sealed
  things stand in a field where time runs at a ten-thousandth of ours (the Hungry Hour, the Bell That Rings Backward,
  the Unfinished Fire, the Moth of Many Eyes, the Falling Drop, the Second Sun, the Smiling Door, and an eighth seal
  left blank and open). The depths are lit only by their own lamps (a shader that ignores the sun); the layer
  'the ground (see the Vault)' hides the ground to see them in place.
- **The Order's own buildings** (ROOMS.md section 1, revised 2026-10-19): the chapterhouses' neo-African forms, not
  Yuni's Sahelian earth. The drum halls (the Assembly, the Hall of Hours, the Observatory, the Lower Gate's pair) are red
  fired brick under terracotta cones, with round relief-ringed windows, the mosaic course and a row of carved glyph panels
  under the eaves, the Assembly's eight-post lantern lit; the Debate Court's galleries are brick arcades with
  pointed-parabolic heads; the Great Gate's pylons are carved glyph panels banded in mosaic; the Printing House is a small
  Archive (brick fins, dark glazing, a wavy pale roof on timber slats, a second raised one); the Eastern Watch is the
  Archive's louvre tower (a brick drum, eight wavy rings, the bell in the top ring); the Hall of Forms is the School
  (undulating brick on a white dado, parabolic windows, a warped conoid roof). Inside the gate, the Chapterhouse Court:
  the curved glyph-panel wall, two mosaic-lined reflecting pools, the tea rotunda and the stele of the vow. Outside: the
  mani wall along the road (prayers and the containment's glyphs), the chorten garden by the east postern. Behind the
  masters' cells, the Garden of Held Water (a fountain whose drops hang where they were; the held cherry, its petals
  stopped as they fall). The Red Palace is the red-ochre limewash; the cones are terracotta (no blue tile).
- **The farms and gardens** (`40b-ls-farms.js`, `[G data]`; `85-ls-farms.js`; ROOMS.md section 5): every crop a Crops kit
  id the Oidong Valley allows (`kits/crops`, read in place; checked). The east and west fields in strips (frost oat, emmer,
  helix bean, frostroot, flax, fallow in rotation) inside dry-stone walls, their threshing floors and field shrines; the
  south terraces behind the rock (with a saffron terrace) and the tea garden above; the rice pools, the willow beds, the
  bamboo grove and the chalice-grass beds for the paper; the leat to the tsampa mill and the paper mill's wheel; the yak
  pastures with the herders' black tents and pens (placeholder yaks). Inside the wall: the orchard and the bee wall, the
  kitchen gardens, the dye garden (saffron, woad for the Order's blue, broom) and its dye house, the physic terraces, the
  upper orchards. `LS.FARMS.provision()`: the house's own fields grow about a quarter of its grain; the valley's tithe
  the rest. The herds are the Fauna kit's yak and highland cow (`kits/fauna`, its farm group bundled; each kind baked in
  its pose and drawn instanced).
- **The people** (`68-ls-life.js`): 1,344 records (the owner, 2026-10-19: a house of a thousand of the Order: 600
  monks, 160 novices, 40 elders, 80 operatives from Keepwell, 8 masters of arms, 12 keepers, 100 wardens; its town in
  the ward: 120 lay servants, 50 lay scholars, 80 artisans, 20 market keepers; a caravan of 24 from Xanadu; 50
  pilgrims; and 150 of the valley's folk, who come only on the festival day) on their schedules (the monks on three
  variants, so the courts are not all asked for at once); at noon the operatives drill at lightning speed in the ward
  (every strike leaves three afterimages), the master of arms stands in the drill ground's middle and every few seconds
  is simply somewhere else, and the petals falling round him stop in the air within his reach; monks debate in the
  court, pilgrims walk the kora clockwise, the keepers walk the wheel. They live on `core/simulation` (`40d-ls-sim.js`:
  the walk graph, the ward's cells round the buildings, the Great Stair's flights, the Debate Court's floor and the
  rooms' doors; the places from `LS.PLACES`; a role per `LS.ROLES`): SIM steps a world minute at a time as the clock
  runs, each person walks between places on the graph (out of sight through the rooms), and the hour slider jumps them
  (`SIM.jump`). `node tests/test-sim.js` runs a whole day headless (every route found, the stair climbed, no one stood
  in a wall; a cut stair must fail). The nearest 24 to the eye are drawn dressed (`69-ls-figures.js`; `?dressed=N`):
  `core/charactermodels` figures (KCharFigure, read in place) in their own records (`40e-ls-kchar.js`: KCHAR.stranger
  on each one's seed, so each has a face, a build and an ancestry of its own; the Order in its standing's set, the town
  in Xanadu's dress, a fifth of the visitors wealthy and turbaned), playing the clip their activity wants; the rest are
  placeholder figures. The pieces are sidecars beside the page (`dist/kchar/`, 52 scripts, about 48 MB, in LFS), each
  loaded the first time a figure needs it; `build.py` remakes them from `core/charactermodels/dist/pieces/` when that is
  built. `people-kchar.json` (`tools/kchar_people.js`) is every record, for Godot.
- **The festival of the register** (`89y-ls-festival.js`; `?festival=1` opens on it): every seventh day (core/simulation's
  week: each role carries its day's schedule and the festival's, `LS.FEST_SCHEDULES`). At dawn the great thangka (the
  wheel and its eight seals) is unrolled on the White Palace's base, on the blind wall under its windows, and the house
  gathers on the forecourt to see it; the elders hold the great debate, the procession walks the kora, the thangka is
  rolled up at dusk. The valley comes in at five (from the Great Gate) and the pilgrims' camp is pitched in the ward
  between the Geomancers' lodge and the infirmary: twenty white tents with blue knots, ten cook fires, the trough.
- **The plants**: the Oidong kit (`biomes/oidong`, read in place) on the model's land, its fields bound here
  (`45-host-stage.js`: wet from the rain and the water, flow on the stream's banks, upland and cold over the floor,
  rock on the steeps and Longsong's rock, three raked gravel fans the stream left, a little mist over the stream);
  inside the wall only in the gardens, on the rock's faces and, thinly, on its top away from the buildings.
- **The water** (`89w-ls-water.js`, on core/water and core/atmos; no water shader of the page's own): the Longsong
  stream a flow down the model's river line on a level that only falls downstream, its bed cut under it (`45`:
  `STREAM`, `streamCut`); the canal (the leat from the stream to the tsampa mill and the paper mill, the tail race to the
  Mirror) a flow on levels falling all the way, cut into the land or carried in a raised stone race, an undershot wheel
  standing in it at each mill; the Mirror, the rice pools (level basins cut into the slope, bunded), the court's
  reflecting pools, the reservoir and the held fountain still water (one record each, one mesh). The page checks that
  the water only falls, that each wheel stands in it and that the banks hold it.
- **The depths' doors**: the Vault's rooms join by doorways cut in their shared walls (`LS.VAULT_DOORS`) and two passages
  (to the Unmaking Room; from the Long Stair's foot into the Procrastinator's hall); the eye walks through them. Its lamps
  are a float texture the shader loops over (no silent ceiling).
- **The interiors** (PLAN.md P4, 2026-10-19; ROOMS.md sections 3-4): **the rooms are data** (`40c-ls-rooms.js`, `[G data]`):
  320 records (`LS.ROOMS`), every room ROOMS.md names fitted inside the shell the page draws (the base's two storeys under
  the rock top, the Lower Gate, the White Palace's ranges storey by storey, the Assembly drum, the Red Palace and its wings,
  the roof's drums; the depths are the Vault's rooms by reference), each with its doors on the walls it shares, its tier,
  its kind and, where the Order arranges a room itself, its layout. **Their pieces are data too** (`57a-ls-interiors.js`):
  kits/interiors furnishes each room (`ROOM()`, `furnishRoom`, the catalog's runtime adapter) from the catalog's Xanadu
  sets, the Order's own set (Yuni's, harvested into the catalog) and the generic goods, under Longsong's programmes; the
  layouts come first (the Assembly's ring of twelve skylight columns and its cushion rows for 300 facing the throne, the
  founders' nine chortens and the altar, the archive's ranks of scroll racks, the catalogue's card cabinets, the pupils'
  desks before the board, the council's round table with its empty place, the Chronicle on its stand before 108 desks,
  the clocks, the armillary, the Watch's three instruments; 2026-10-20: the bath house's sunken pool, wall fountain and
  basins, the laundry's and its drying room's racks of robes, the bindery's woodblock presses, its paper store's vats and
  racks of sheets). The NEW pieces FURNITURE.md listed are in the catalog (`kits/catalog/krator-master-furniture-xanadu.js`,
  2026-10-19 and 2026-10-20); the depths' (the closed vault's sealed crates, the quiet cells' lead cases, the unmaking
  furnace) stand in `66` on the depths' shader, and the wells (`LS.WELLS`) in the courts that draw water and at the camp. The records are baked headless (`bake_interiors.py` ->
  `interiors-bake.json`, inlined by build.py with the kit hash and each room's fingerprint; README "Furniture that is not
  always drawn is data first"). **The drawing** (`87-ls-interiors.js`) is a floor of one building at a time: the cutaway
  (X; ] [ a storey up, down: core/host's, over the White Palace, the Red Palace and the Eastern Watch) or the eye in a
  room shows that floor's rooms (their walls' inner faces with framed doorways, floors, ceilings, the Hall of Pillars'
  forty columns, the stairs' flights) and its pieces in one catalog batch. The library's pictures are on them (2026-10-20):
  the columns painted from `column-paint` (the shaft and the wheel bracket each from its part of the picture), the
  Cataclysm's chronology (`mural-cataclysm`) along its lecture hall's wall, and two kinds of piece drawn by `87` itself from
  their records rather than the batch: the rugs and carpets (`rug`, the whole rug to its edge) and the bookcases (their
  carcass and the `book-spines` picture laid to their shelves, in place of the catalog's hundreds of little books). Views: 'Inside the Great Assembly Hall', 'The
  Hall of the Founders', 'Archive Stacks I', 'The Chronicle Hall' and the rest. The rooms corrected the shells they sit in: the
  White Palace's back range is two wings either side of the Assembly drum (one block had filled the drum's hall), the
  Red Palace's wings two blocks outside its walls (one block ran its face through the palace's rooms), the Assembly drum
  2 m north (it ran into the Red Palace's front), the Hall of Hours and the Observatory on the wings' roofs (their drums
  stood in the palace's walls).
- **The sky**: the Oidong kit's, drawn from Longsong's place (`LS.SKY`, from the model: the Throne at 334 degrees, the valley's
  head at 118 with the cascade the owner places at the valley's end (2026-10-19: below the horizon from the rock, 190 km
  off), the pass down-valley at 280).
- **The host**: core/host's whole interface (camera, inspector, marks and the polygon tool, minimap, editor), with
  this page's camera clamp (the eye may go under the ground only inside a room of the Vault).

## Checks (`verify.py --assert`)

The shared invariants (registered volumes, NaN, budgets, the export profile) and the page's own (`99-host-take.js`,
`monasteryChecks` in 64, `vaultChecks` in 66): the land is the model's away from the grounds; the stream crosses in
front of the gate and none lies inside the walls; the rock is 40 m with a steep north face; every building is a
core/tags record of the Order; stone and lime only (no earth in the plan or the materials); the monastery faces north,
to the sun; the climb is the rank (gate, ward, stair's foot, Lower Gate, White Palace, Red Palace, each higher); the
Vault is under the rock with the Procrastinator deepest; the Procrastinator turns and its seals are slowed; one stair
down; the farms sow only the Oidong Valley's crops, lie dry, outside the wall and off the track, and grow a share of the
house's grain with the rest's source named. Each has a negative control (a 25 m rock, an unrecorded building, a
rammed-earth granary, a Red Palace of one storey, a vault room above ground, a wheel that does not slow its seals, a
second way down, a field of cotton, a field across the stream, a house that grows all its grain, the model's own stream levels (which
rise downstream), a wheel set off the canal). The water: the stream only falls, the canal falls from the stream to the
Mirror, each mill's wheel stands in the canal's water, the stream's banks hold it. The rooms (`LS.ROOMS.check`, pure): every room ROOMS.md
names is a record; every room inside its range's walls at its storey; no two rooms of a floor overlap; each door between
rooms on both rooms' walls; every room reached through doors from a stair, a court or a landing. The interiors: every
room's required pieces placed; the rooms that must hold what ROOMS.md lists hold it (the columns and cushions, the
chortens, the name walls, the card cabinets, the map table, the council's table, the clocks ...); every piece inside its
room; the interiors come from the bake. Negatives: a room ROOMS.md names that is not recorded, a room through the Red
Palace's wall, two rooms on one floor, a door on one room's wall only, a room with no way in, a room lacking what it
must hold, a piece outside its room.
