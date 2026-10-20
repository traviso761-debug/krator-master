# guilin — the South China karst

The owner's request (2026-10-20): "create the Guilin stone forest in China". Two famous places are in that sentence:
**Guilin**'s tower karst on the Li River (Guangxi) and the **Stone Forest**, Shilin (Yunnan, 800 km west). Both are in
UNESCO's *South China Karst* (2007), so the kit is one page with both. A different reading (only one of the two, or
Shilin given Guilin's name) is a change of the stage, not of the kit.

Built from the necanyons kit's shape (`biomes/necanyons`: a host stage of KSTACKS records, a layout of zones, the kit's
passes by zone, core/water and core/atmos for the water, the necanyons' night read in place). The page:
`dist/guilin.html`. Build: `python3 build.py`. Verify: `python3 verify.py dist/guilin.html --assert`.

## Where

Not yet placed on the scale model (`biomes/WORLD.md`, the row "South China karst"). It is the flora and landform of a
humid subtropical plain (Cfa/Cwa: ~1,900 mm of rain, ~19 degC, 1 atm), with the standard Krator sky and the giant.
The flora is Earth's as it grows there; no Krator species yet.

## The page (`src/45-host-stage.js`)

3.2 km across (R 1600), x east, z south, y up from the plain:

- **The Li River**: ~110 m across, meandering north to south through the middle, its level falling 2 m over the page;
  sand and pebble bars on its banks. A core/water flow line (`WATER.flow`), drawn on core/atmos.
- **The fenglin**: 26 lone towers, 90 to 250 m tall. Two are set by hand at the river's bends with their feet at the
  water. The rest are drawn from a KRAND stream, kept off the river, the stone forest and the fengcong.
- **The fengcong**: one low base (a 46 m butte, 700 m long) in the north-east, nine peaks crowded on it.
- **The stone forest**: ~900 blades (fins) and pinnacles (spires), 12 to 43 m, in thickets on a bench 7 m over the
  plain in the south-west, taller toward the middle; a pond in it (Sword Peak Pond's kind).
- **The plain**: ~1,500 paddies along the river, groves and orchards, bamboo on the banks, banyans by the water.
- **The horizon**: 260 low-poly towers 2 to 7 km out on a plain disc, drawn for the view only (not records).

## The towers (the one modelling decision worth knowing)

A tower is a **KSTACKS spire** (one tapering column: its beds' partings are lines, not ledges) whose beds are then
given the karst tower's profile: a cliff standing almost sheer for 45 to 62% of the height, then a superellipse dome
(exponent 1.7 to 2.7: sugarloaf to beehive) closing to a small cap, the dome's beds drifting off the axis so one face is
steeper. The record stays a plain KSTACKS record (`tower: true` marks it): `KSTACKS.mesh` draws it.

The first version used `butte` tiers stepping in along a dome. It read as a stack of drums: vertical walls, flat
terraces. Do not go back to tiers.

Because the dome is sloped wall, not tops, **the layout reads the walls' slope** (`46`, `fastAt`): a point between a
tapering bed's top outline and its foot is on the wall, at the height where its ray crosses it, and its steepness is the
bed's rise over its run. The zones split there:
- **slope**: under ~70 degrees. The forest roots here: ring-cupped oaks, Masson pines toward the crest, and the dome's
  skin of shrubs.
- **cliff**: steeper. Nothing roots, but the cliff points carry scrub, rock figs, stone orchids and creepers.

The dome's walls are painted soil-green under that forest (`47`, by the same steepness), so a gap between shrubs is
not bare rock.

## Zones (`46-biome-guilin-layout.js`)

| Zone | What it is |
|---|---|
| `crown` | a tower's cap, or the fengcong base's top |
| `slope` | a dome's wall gentle enough for soil |
| `cliff` | a wall too steep for roots |
| `ledge` | the base's top near a peak's foot |
| `rim` | within 2.5 m of a top's edge |
| `blade` | a stone-forest blade's crest |
| `wall` | within 3 m of a wall's foot, off the rock |
| `foot` | within 30 m of a wall's foot |
| `water` | the river, the pond, a flooded paddy |
| `bank` | the river's bars |
| `paddy` | a field |
| `grove` | the stone forest's floor |
| `plain` | everything else on the plain |

The layout also yields three record sets:
- **CLIFF**: ~78k points on the towers' walls, in rows 3.2 m apart. Each is kept by a hash against the cover there
  (thicker up the dome, bare blotches), and is a scrub, fig, orchid or vine point.
- **DRAPES**: creepers off the base's lip.
- **PADDIES**: polygon, level, state and crop for every field.

The zone grid is filled body by body over the cells round each body; filling it cell by cell over a spatial query
took 9 s. Bed outlines are read from per-bed tables (`tabR`), not `KSTACKS.footR`'s noise each time. Heights are
still `KSTACKS.topH`'s.

## Flora (`50`, `55`, `57`, `60`)

| Group | What grows |
|---|---|
| Trees | phoenix-tail bamboo, banyan, camphor, sweet osmanthus, pomelo, ring-cupped oak, Masson pine, Yunnan pine |
| Small plants | rice (`kits/crops` 'rice'), cliff scrub, the stone orchid (medicinal), karst ferns, moss, silvergrass, sacred lotus (`generic_fruit_lotus_seed`), creepers |

The brief's three:
- **Fruit**: the pomelo.
- **Staple**: rice. One card across each field in its state (flooded, young, green or ripe), with the tufts near the
  spine.
- **Medicinal**: the stone orchid (Dendrobium) on the cliffs and the blades.

## Numbers (verify.py --assert, 2026-10-20)

| | |
|---|---|
| Error panel | clean |
| Load | ~9 s headless |
| Triangles | ~10.4 M in the scene (trees 5.9 M of 6.5 M, cliffs 1.5 M, floor 1.3 M) |
| Draw calls | 37 to 43 |
| Instances | ~0.83 M |
| Trees | 26.5k |
| Scrub clumps | 197k, on 68k cliff points |
| Paddies | 1,488 |
| Registered volumes | 27.4k |

All eight host checks pass and every negative fails as it must.
