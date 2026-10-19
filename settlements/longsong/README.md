# Longsong

The History Monks' monastery in the Oidong Valley (LORE.md 6.15): the Order of Historians' training, research,
archival and containment house, built **in situ** on the scale model's land, on its own rock over the Longsong stream.
`BLUEPRINT.md` is the programme (the owner's brief of 2026-10-15, the Potala study, the floors); `ROOMS.md` the plan of
every room and outbuilding before the interiors, and the exterior's revision toward the chapterhouses; `PLAN.md` is how the
build reads it (the site, the decisions of 2026-10-19, the order of work); `KNOWN_ISSUES.md` is what is open.

```
python3 build.py                                   # dist/longsong.html (+ its two texture sidecars)
python3 verify.py dist/longsong.html --assert [--views "Longsong from across the stream (north),The Procrastinator"] [--out shots]
```

Query switches: `?noflora=1` (no Oidong kit: a quick look at the architecture, ~50 s headless), `?q=0.5` (the kit at
half quality), `?mat=proc` (the procedural maps instead of the library's), `?hour=6` (the people at another hour).

## What the page is

- **The site is the scale model's** (4.21). `region/` holds the cut round it (120 km square from
  `tools/scale-model/extract_region.py`; the model's regions and settlements as read on 2026-10-19 in `region/source/`,
  the cut's box added as `regions-cut.json`), decoded at build time by Pinnacle Rock's `tools/world_data.py` (read in
  place, with this page's kit line). The kit grows on the model's 'Oidong Valley' overlay (moved to the biome layer by the
  owner, 2026-10-19). The page's origin is the foot of the rock, at px 954,1296 (`LS.SITE`): the apron
  south of the Longsong stream (the model's r105, *Lõsõ-bi Siṭrīm*), 7 km west-south-west of the model's Longsong
  marker (957,1294), which sits on the medial swell 8 km from either of the valley's streams (PLAN.md, section 1).
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
- **The people** (`68-ls-life.js`): 162 records (monks, novices, operatives from Keepwell, masters of arms, keepers,
  wardens, lay servants, pilgrims) on their schedules; at noon the operatives drill at lightning speed in the ward
  (every strike leaves three afterimages), the master of arms stands in the drill ground's middle and every few seconds
  is simply somewhere else, and the petals falling round him stop in the air within his reach; monks debate in the
  court, pilgrims walk the kora clockwise, the keepers walk the wheel. The hour slider moves everyone (`LS.whereAt`).
  Drawn as placeholder figures (`KNOWN_ISSUES.md`).
- **The plants**: the Oidong kit (`biomes/oidong`, read in place) on the model's land, its fields bound here
  (`45-host-stage.js`: wet from the rain and the water, flow on the stream's banks, upland and cold over the floor,
  rock on the steeps and Longsong's rock, three raked gravel fans the stream left, a little mist over the stream);
  inside the wall only in the gardens, on the rock's faces and, thinly, on its top away from the buildings.
- **The host**: core/host's whole interface (camera, inspector, marks and the polygon tool, minimap, editor), with
  this page's camera clamp (the eye may go under the ground only inside a room of the Vault).

## Checks (`verify.py --assert`)

The shared invariants (registered volumes, NaN, budgets, the export profile) and the page's own (`99-host-take.js`,
`monasteryChecks` in 64, `vaultChecks` in 66): the land is the model's away from the grounds; the stream crosses in
front of the gate and none lies inside the walls; the rock is 40 m with a steep north face; every building is a
core/tags record of the Order; stone and lime only (no earth in the plan or the materials); the monastery faces north,
to the sun; the climb is the rank (gate, ward, stair's foot, Lower Gate, White Palace, Red Palace, each higher); the
Vault is under the rock with the Procrastinator deepest; the Procrastinator turns and its seals are slowed; one stair
down. Each has a negative control (a 25 m rock, an unrecorded building, a rammed-earth granary, a Red Palace of one
storey, a vault room above ground, a wheel that does not slow its seals, a second way down).
