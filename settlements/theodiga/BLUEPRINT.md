# Theodiga today: the shrine of the Decree in the dam arcology, and its town

A floorplan, drawn with the large-building method (the painting-to-3d-world skill, `references/large-buildings.md`), before
any planner data or page. The sheets and the manifest come from `theodiga_blueprint.py` on the shared generator
(`settlements/voth/palace/blueprint.py`), in the drawn dam's own geometry (`kits/ancients/targets/theodiga/77-dam.js`, the ruined state,
and the Dome on the Water, `kits/ancients/targets/theodiga/77a`/`77b`).

```
python3 theodiga_blueprint.py      # floors/*.png and FURNITURE.md
```

## The owner's brief (2026-11-15)

- **Only the Dome and the 2-3 levels just under it are inhabited, and only partly.** The arcology is now a shrine to the
  ancestors and to the faith of the Decree (`kits/qiblai/PLAN.md` section 2a, branch `claude/zealous-allen-0cd44d`).
- **The Dome has become the shrine.** Priests, monks and scholars live in the arcology itself. **The History Monks keep a
  delegation here.**
- **Every other level is ruined and uninhabited.** Some treasures for explorers may remain in the lowest levels; **entry is
  strictly regulated by the Sultanate and the priests.**
- **Beside the dam, a town in the scrap Xanadu style** (`kits/xanadu` `PLAN-SCRAP.md`, branch `claude/scrap-xanadu`), serving
  pilgrims, with a scrap-recycling industry and some agriculture. **About 5,000 people in all.**
- **The river still passes through the broken dam, as a cascade** (the owner, during the drawing).

The owner's answers to the four forks (2026-11-15; each was the recommended option):

| Fork | Answer |
|---|---|
| Which floors are the inhabited levels | **The crest and the fin heads:** the crest blocks (400-418 m), the gallery inside the dam just under the crest (382-400 m) and the top storeys of the upper fins (370-410 m) |
| The Dome's Tear | **Kept open as a relic.** The Fall is doctrine, so the faithful never roof the Tear, and the holiest place faces it. The rest of the frame is re-glazed with salvaged panes on bronze, in the scrap Xanadu manner |
| Where the town stands | **On the east rim** (440 m), level with the top of the dam. The pilgrims come down 40 m to the crest and walk into the Dome |
| How many live in the arcology | **About 900**; the town about 4,100 |

## What the plan takes from real plans

- **A sacred summit, its servants below, the town at the foot.** The Potala over the Shöl, Mont-Saint-Michel's abbey over its
  village: the Dome on top, the clergy in the crest and fins, the town on the rim.
- **One gate, entry by permit.** Mount Athos's entry permit, the single gate of Mont-Saint-Michel: the Gatehouse of the Deep,
  behind two keys.
- **Three nested circuits.** Lhasa's Nangkhor, Barkhor and Lingkhor round the Jokhang; the Song's "weave a circle round him
  thrice": the inner kora in the Dome's drum, the middle kora along the crest, the outer kora round the town.
- **A converted dome keeps its holy opening.** The Pantheon's oculus, Hagia Sophia's conversions: the oculus and the Tear stay
  open.
- **A foreign order keeps its own door.** The Jesuits at the Beijing observatory, the national houses on Athos: the History
  Monks' fin has its own bridge and gate.
- **The bulk is stores and lodging.** The crest holds more floor than the clergy need, so whole blocks stand empty and kept.

## The water (the owner, 2026-11-15: the river still passes)

- The Notch's sill is at **272 m**, so the lake stands there: it spills over the sill and **falls 272 m down the face** to
  the canyon floor. From there the river runs downstream between the salvage yards. The faithful call it the fountain of the
  Song ("a mighty fountain momently was forced").
- **The Order's Bridge** crosses the Notch over the cascade's lip.
- The piers stand **about 145 m bare** over the water. Silt flats round the lake (272-300 m) are terraced into the temple
  estates' fields, reached by the Silt Road.
- The Great Wheel on the Dome is turned by water from the dam's old penstock, raised by the rising main under the crest.
- **The page draws it** (2026-11-15): `buildDam`'s ruin holds the lake at the sill (273 m), with the cascade down the face,
  its spray, and the river in a channel down the canyon (`kits/ancients` view 'Cascade'). It does not move yet
  (`kits/ancients/KNOWN_ISSUES.md`, "Theodiga").

## The sheets (`floors/`)

| Sheet | What |
|---|---|
| `T0` | The site: the dam, the Dome, the lake and its fields, the river and the cascade, the canyon floor's salvage yards, the town's quarters on the east rim, the Order's Gate on the west rim, the three koras. Plan, `u = x` (east), `v = -z` (upstream up) |
| `T1` | **The Dome, 420 m.** The Hall of the Song (the old fluted dome) under the oculus; the Great Wheel; the Threshold of the Fall at the Tear; the Ancestors' Relic Hall; the Damsel's Shrine; the Offering Hall of Honey and Milk; the Lamp Hall; the choir, vestry and treasury; the pilgrims' and clergy stairs; the inner kora in the drum's arcade |
| `T2e`, `T2w` | **The crest, 400-418 m** (four storeys), east and west halves: block pairs at `x = 22k`, from the Pilgrims' Gate (`k = 13`) to the last block before the Notch (`k = -6`); the middle kora along the promenade; the undercroft under the Dome's deck |
| `T3e`, `T3w` | **The gallery inside the dam (382-400 m) and the fin heads (370-410 m)**: the Long Gallery, the Library and Archive of the Song, the Wheel's undercroft, the Deep Stair; the six standing fin heads across short bridges |
| `section.png` | Along the stream through the centre: the lake, the piers, the Dome, the crest, the gallery, the fin heads; the sealed levels; the works at the foot |
| `elevation.png` | The downstream face, looking upstream: the Dome, the crest, the fins, the Notch and its cascade, the Order's Bridge, the Stair of Descent, the town |

`T2` and `T3` are drawn **unrolled**: `u` is the distance along the crest from its centre, and `v` the depth downstream of the
upstream face (as a z offset, not a normal).

## The census (about 5,000)

| Where | People | Who |
|---|---|---|
| **The arcology** | **about 900** | |
| the Dome | (lives below) | its keepers, singers and wheel-turners live in the Servants' Fin and the Singers' House |
| the crest | 120 | the Keeper of the Dome (the abbot) and his house; guests; the singers (two blocks); the Warden's deputy and 12 men |
| the gallery | 60 | scholars' cells; the library and archive staff |
| the Priests' Fin (x 0) | 200 | the priests |
| the Monks' and Novices' Fins (x +46, -46) | 330 | monks and novices |
| the Scholars' Fin (x -92) | 60 | the grammarians and archivists (about 120 with the gallery's) |
| the Servants' Fin (x +138) | 110 | lay servants, the dome's keepers (about 150 with those in the crest) |
| the History Monks' Fin (x -138) | 25 | **the Order's delegation**: their hall, cells and archive, their own stair, and the Order's Bridge over the Notch to their gate on the west rim |
| **The town** | **about 4,100** | |
| pilgrims' trade | 1,300 | hostels, the serai, the bazaar, guides, wheel-makers and sound-grid printers, offering sellers |
| salvage | 800 | the Salvagers' guild and its yards on the canyon floor |
| farming and herding | 900 | the silt-flat fields, the upland fields, the dairies and hives (honey and milk, the sacraments) |
| the Sultanate | 100 | the Warden's house and 40 soldiers, the customs clerk at the serai, their households |
| others | 1,000 | the trades every town needs, and the poor tier |

At the festival of the Station's pass the town about doubles with pilgrims, who sleep in the hostels and on the plateau.

## Proposed (for the owner to keep or change)

- **Only what the Dome has let fall may be salvaged.** The guild cuts the fallen fin, the Notch's spill and the Dome's
  fallen sector on the canyon floor and the lake bed. Nothing standing is touched. This is why the town is "scrap" and the
  ruin still stands.
- **The two keys.** The Gatehouse of the Deep (crest block +12A) has two locks: the Sultan's warden holds one key, the Keeper
  of the Dome the other. A second lock on the gallery level is the Sultanate's. Every descent is written in the Register of
  Descents twice, by the custodian's clerk and by a History Monk.
- **What lies below.** The sealed levels are the upper and lower fins, the learning-centre beam (the Ancients' library) and
  the works at the foot (turbine halls, outlets, stores), where treasures remain.
- **The six small domes** on the crest are chapels: of the Khan, the Ancestors, the Sound-Grid, the Chapterhouse and the
  Novices. The sixth (`x -170`) fell into the Notch.
- **The Khan's empty seat** stands in the Hall of the Song, as the Sultan's does in Qiblai's Hall of the Decree.

## Core adoption (the owner, 2026-11-15: "make sure this build is on core/water and all other relevant core modules")

The page is `kits/ancients --target theodiga` (`dist/theodiga.html`).

| Module | Taken | How |
|---|---|---|
| core/rand, core/tags | yes | the Dome's records (KRAND hashes, stable ids), every placed record in KTAGS before it is drawn (`TAGS_TARGETS`) |
| core/water | yes | the lake, the outlets' falls, the overflow, the cascade (a fall on the battered face), the plunge pool, the river (`targets/theodiga/77c`, `90w`) |
| core/atmos | the water's part | its core, presets, waves and skylight, bound as the Ancient Port kit binds them; the kit's own sky and lights are kept |
| core/ruins | yes | the ruined site watched (`KRUINS.watch`): nothing floats, every wreck seated; asserted by the verify harness |
| core/lod, core/materials, core/shader | yes | as every Ancients page |
| core/host | not yet | the Ancients kit's own camera, probe and inspector serve all its pages; moving the kit is a kit-wide port |
| core/terrain, core/world | not yet | the canyon is the kit's showcase rock; when Theodiga is placed in the open world, the ground is core/world's |
| core/city, core/simulation | next | the town on the east rim and the census as roles |
| core/biome | not yet | the park's trees are the kit's `VEG.tree` |

## Assumptions

- Storeys of 4.5 m in the crest blocks (four storeys to 418 m) and 3.7 m in the fins (eleven from 370 to 410 m).
- `buildDam` stands every upper fin at the centre's face (`zc(0)`), so the outer fins (`x ±138`) cut into the dam at the
  ends. They join the gallery directly; the inner fins need short bridges (2-14 m).
- The crest blocks are the drawn ones (`x = 22k`: block A 15 x 28 m, block B 18 x 22 m). The ruin drops `k = -13` to `-7` (the
  Notch); the scattered crest losses (`gone`) are not drawn.
- The town's quarters are areas, not lots. Its lots, streets and buildings are core/city's work, from the scrap Xanadu set (as
  Strongbow's town).
- The manifest (`FURNITURE.md`) counts one storey per room and takes Xanadu keys through Longsong's key map.

## On the page (2026-11-16)

`kits/ancients --target theodiga-today`. **The inhabited levels' interiors (T-arc-1):** `python3 theodiga_blueprint.py --export`
writes the sheets' programs as `src/43-th-arc-program.js` (70 units in the dam's frame); `src/43-th-arc.js` (`TH_ARC`) makes
each unit's storeys with kits/ancients-interiors' plates (a hall, or a bar of rooms off a corridor with a stair core), maps the
sheets' programs onto kits/interiors' (cell, dormitory, bedroom, hall, shrine, study, library, kitchen, store...), and the
Ancients kit's interiors pass draws and furnishes them in the Xanadu culture (`src/8zz1-th-arc-host.js`). The Dome's deck rooms
are walled pavilions with their doors on the crest's side (but the Hall of the Song, the Threshold of the Fall and the Damsel's
Shrine, left open), its big halls laid out by the hall recipes in a Xanadu dress (`TH_ARC.RECIPE`, `TH_ARC.DRESS`).
`test-th-arc.js` (15 checks). **The Dome today (T-dome-1):** `src/44-th-dome-today.js` (`TH_DOME_TODAY`, [G data]) and
`src/8ay4-th-dome-today.js`, which `THEODOME.draw` takes as `ctx.today` on the today page only:
- **the two Pilgrims' Stairs** up from the middle kora into the sheet's stair heads. Each is a shaft of ashlar under the deck's
  chord, against the lake-side blocks, leaving the kora 6 m, with five flights of 4 m in two lanes and a well cut in the deck.
- **the frame re-glazed** with salvaged panes (seven tints, a tint a pane by KRAND), except at the Tear. The Hall of the Song
  is re-glazed likewise.

`test-th-dome-today.js` runs 13 checks. The cascade moves already: it is a core/water fall on core/atmos's clock (90w). The
town, the ways down and the works below are `PLAN.md`.

## Next

- Windows cut through the crest's and fins' shells; a Xanadu divan, rug and hanging for the deck's dress.
- The economy on core/simulation, a walk cycle for the walkers, and indoor residents shown in the opened rooms. The census is
  on `core/simulation` and walks (T-sim-1, T-sim-2, `PLAN.md`).
- LORE 6.13 (on the branch that holds the faith): Theodiga as the Decree's shrine, the Order's delegation, the cascade.
