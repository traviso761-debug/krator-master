# wouterwall: the plan (draft, 2026-10-26)

The **western Outer Wall**: the high bench on the Outer Wall's inner flank, a crescent ~1,250 km long from below Farside
round to Dalab, under the airless crest. Cold and summer-dry. Its theme is **a wall coming apart**: the crater's rim
slumping inward in county-sized terraces, rock avalanches running out from the crest, and the dust the wall sheds blown
down onto the bench as loess deep enough to farm and to live in.

Owner's brief (2026-10-26): the landforms of the proposal, agreed "on all counts": the loess tablelands, the slump
terraces, the long-runout rock avalanches (sturzstroms) and the edge. The references are in `refs/`.

**Status: plan, awaiting the owner.** Nothing built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/wouterwall/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations: `dist/wouterwall.html` (station 1) and `-slumps`, `-sturzstrom`, `-edge` (section 7) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, strata), the shared sky |
| Read in place | `biomes/nwouterwall` (the larch, the feather-grass steppe, the tundra and the fellfield: the same wall further north, a little drier); `biomes/nwlowlands` and `biomes/swlowlands` (a few species each: section 3); `biomes/godthrone` above the airless line; nothing copied |
| Its own flora | two native species (section 3); the rest read in place |
| Object | `WOW` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract |
| Out of scope | the Hayrant's villages and cave houses (a settlement plan; the kit leaves the loess cut for them); the Rift line's portals (`openworld/ANCIENT-ROADS.md`, `kits/ancients`); the lowland at the foot (an ecotone with the lowland kits) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (scale model 4.22, surveyed 2026-10-26)

117,148 km² (px 8-308 by 278-880). Dsc 54,276 km², Dsb 33,544, ET 24,668, Csb 2,016, Csa 1,636, EF 644. Median slope
1.9°.

| Band | km² | Air | Rain | Mean (warm/cold) | Class |
|---|---|---|---|---|---|
| 3-4 km | 26.6k | 1.03 atm | 533 mm | +6 °C (19/-7) | Dsb, Csb, Csa |
| 4-5 km | 59.0k | 0.91 | 392 | +1 (14/-12) | Dsc, Dsb, ET |
| 5-6 km | 24.1k | 0.80 | 251 | -5 (8/-18) | ET, Dsc |
| 6-7 km | 6.0k | 0.71 | 141 | -10 (3/-23) | ET, EF |
| 7-8 km | 0.4k | 0.63 | 47 | -15 | EF, HF |

- **The shape**: a bench rising gently from ~3.2 km at its lowland edge to ~6.5 km under the airless crest (10+ km). At
  the lowland edge it ends in a **2-3 km escarpment** (at y=600: 4.4 km to 1.0 km in 16 km).
- **Dry summers** (Ds): the snow falls in winter, the dust blows in summer.
- **Water**: ~30 wadis and small streams run east over the edge, none over 90 m³/s: Ancient's Valley river 4 (86),
  Okbruk (the oak stream, 42), Sneikbruk (the snake stream, 25); the southern arc's dry valleys Painguli, Oniguli,
  Milguli, Reinguli, Kopaguli, Glasguli and Soodguli (pine, honey, milk, rain, copper, glass and sword). No lakes.
- **People**: Mirabilis (village, px 78,396, 3,026 m, 627 mm, +12 °C). The north half is the Eternal State's (50,484
  km² of overlap), where the **Outer Wall dialect, Hayrant**, is spoken (`LORE.md` §6.19); the south is the Dalab
  Council's (30,856) and Giant Country's (7,116). **The Rift line's portals** stand in the southern arc at ~3.5 km,
  ~110 km south of Dalab (`openworld/ANCIENT-ROADS.md`).
- **Neighbours**: the NW outer wall (north), Farside, the NW and SW lowlands and the Ancient's Valley below the edge, the
  airless crest above.

## 2. Air and the rock

0.8-1.0 atm on most of the bench. The shaded slopes face south (Krator stands near 40°S).

**The rock**: the Outer Wall's core is **the crater's patchwork rock** (`megabreccia`, `biomes/godthrone/PLAN.md`
section 3): no beds, blocks of every rock at every angle in a grey matrix flecked with impact glass. The slump scarps
lay it open, so each scarp is a quilt. Over it on the lower bench lies **loess**: pale buff silt, massive, standing in
vertical walls, with buried soils as faint darker bands (and, in the Eternal State's country, the Ancients' traces in
the youngest metre or two: an overlay's business, not this kit's).

## 3. The flora

Mostly the NW outer wall's, read in place: **feather-grass steppe** on the sunny (north-facing) loess, **larch** on the
shaded slopes and in the gullies, then shrub tundra, fellfield and cushions up the bench. The W outer wall is wetter
than the NW (392 mm against 220 at the median), so the larch closes into woods in the south-facing gullies.

Two native species of its own:

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Dust tower** | 01 | the loess tablelands | colonies that trap the wind-blown dust and cement it into towers 5-30 m tall, black with orange spiral bosses and orange-tipped stalks: the plateau's own builders, living on what the wind brings |
| **Puya spike** | 02 | the dry bench at 4-5 km (Dsc) | a giant rosette of grey spears under a flower spike 8-12 m tall that blooms once in a century; spiral like the southern highlands' rosettes, but the dry high Andes' habit |

### From the lowlands below (the owner, 2026-10-26)

The bench stands over two lowland kits, so it takes a few of each, read in place by key from `biomes/nwlowlands` and
`biomes/swlowlands`. Each fits the cool, summer-dry bench; together they split it, **blue-grey in the north** (over the
NW lowlands, the Eternal State's side) and **red in the south** (over the SW lowlands, Dalab's side):

| Species | From | Where | What it is here |
|---|---|---|---|
| **Crag pine** | nwlowlands (its uplands' pine) | the north half's edge and lower bench | a bare pole with flat pads at the top, blue-green plated bark |
| **Needle cypress** | nwlowlands | the north half's gullies | a narrow blue-grey flame |
| **Candle birch** | nwlowlands | stands in the north half's shaded gullies, with the larch | white bark, black chevrons |
| **Tussock**, **saltbush** | nwlowlands' hills floor | the north half's dry loess | grey-green tussock and silver saltbush between the feather grass |
| **Tier cedar** | swlowlands (its uplands' cedar) | forests on the south half's lower bench (Dsb, Csb) | level tiers of flat pads, as the Atlas cedar on its mountains |
| **Ember manzanita** | swlowlands | the south half's sunny (north-facing) slopes | red, glossy, char-streaked scrub |

The other way, the bench gives each lowland kit species in that kit's own theme: `biomes/nwlowlands/PLAN-FLORA.md`
(blue, tall, lanky) and `biomes/swlowlands/PLAN-FLORA.md` (red, wide, branching).

## 4. Landforms (`core/terrain`)

- **The loess tablelands** (3-4.2 km): flat tableland remnants (*yuan*), long ridges (*liang*) and round knolls (*mao*);
  sheer-walled gullies 100-200 m deep (`refs/04`); **earth pillars**, loess columns capped by a boulder, taller than
  Earth's at 0.75 g (`refs/05`); loess sinkholes and natural bridges; **terraced fields** contouring every slope
  (`refs/03`). The silt is glacial flour from the crest's ice and dust shed by the airless rim, carried down the bench
  by the cold katabatic wind that drains off the wall every night.
- **The slump terraces** (4-5 km): the crater's rim collapsing inward, as Tycho's and Copernicus's walls do: **back-tilted
  blocks** tens of km long, **uphill-facing scarps**, **trench lakes and sag ponds** along each head scarp, double-crested
  ridges (*sackung*). The bench's escarpment is the outermost block's toe. Where a block's front has broken up, its
  **landslip pinnacles** stand in the grass below the scarp (`refs/08`, the Storr); a block's back is a grass ramp up to
  a cliff of spires on its broken front edge (`refs/09`, Seceda). The model's bench is a smooth ramp at 2 km a
  pixel: two to four benches 100-400 m high are a model edit or the kit's own relief (H0).
- **The sturzstrom fields** (5.5-7 km): long-runout rock avalanches from the crest, running out tens of km across the
  bench as Mars's in the Valles Marineris and Earth's at Saidmarreh and Köfels do: hummocky hills, grooved lobes,
  megablocks, small lakes dammed behind the lobes; one fresh.
- **The edge**: **amphitheatre-headed box canyons** cut back into the bench by springs, a fall at the head of each
  (`refs/06`); hanging dry valleys that run only in the spring melt; **the spring line** at the foot of the loess, where
  the villages are.
- **Up the bench**: patterned ground, solifluction and rock glaciers, read from `nwouterwall`.

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. The people's side

- **The Hayrant** (the Eternal State's Outer Wall subjects; `LORE.md` §6.19, *proposed* there): *proposed* here, they
  live in **cave houses cut into the loess** (as China's *yaodong*: vaulted rooms dug into a gully wall or sunk round a
  courtyard pit), farm the terraces, and keep the spring line. Where the loess thins over rock, they build **dug-in
  cellars and houses with dry-stone fronts and turf roofs**, half buried in the slope in clusters (`refs/07`). Mirabilis is
  the first to place.
- **Dalab's** road to the Rift line's portals crosses the southern arc; the Free Giants of Giant Country hold its
  southernmost reach.

## 6. Crops

The terraces take what `kits/crops` gives for a cool, summer-dry steppe at ~1 atm (`CROPS.forBiome` on the bench's
zones), irrigated from the spring line: the nwouterwall's Thule package where it is colder.

## 7. Stations

1. **The loess tablelands** (`dist/wouterwall.html`, ~3.5 km): a *yuan* cut by a deep gully, terraced fields contouring
   the knolls, earth pillars in the gully, dust towers on the flat, cave-house fronts in a gully wall, larch in the
   shaded gullies, feather grass on the sunny slopes.
2. **The slump terraces** (`-slumps`, ~4.5 km): an uphill-facing scarp in patchwork rock, a trench lake under it, the next
   block's back tilted toward the wall, puya spikes on the dry slopes.
3. **The sturzstrom** (`-sturzstrom`, ~6 km): a hummocky lobe under the crest's scar, a fresh one beside an old one, a
   small lake dammed behind it, fellfield; the airless crest standing over all.
4. **The edge** (`-edge`, optional, the ecotone): a box canyon with its spring-fed fall, the spring line's village, the
   lowlands 2 km below.

## 8. Textures

In the library: `ground.steppe`, `ground.tundra`, `ground.turf.polygon`, `card.grass.dry`, the nwouterwall's sets once
delivered. To source or generate (generic ids; the prompts into `core/materials/PROMPTS-NEEDED.md` in W0): **loess**
(a buff silt wall, vertical, with root casts and faint soil bands), **terraced loess field** ground, **megabreccia** (shared
with `godthrone`), **sturzstrom rubble** (angular mixed blocks), the dust tower's bossed surface, the puya's spear card.

## 9. Order of work

- **W0.** The owner approves the plan; the slump benches on the model or in the kit; the texture prompts; the station
  sites.
- **W1.** The kit on the biome core: fields (loess depth, aspect, slump blocks, runout lobes, spring line), zones,
  station 1's ground.
- **W2.** The landforms: the loess forms (yuan, liang, mao, gullies, pillars, terraces), the slumps, the runouts.
- **W3.** The two native species; the nwouterwall's flora read in place.
- **W4.** Stations 2-4.
- **W5.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery.

## 10. Open questions

- Whether the slump benches go on the model (a later edit) or stay the kit's own relief.
- The Hayrant's cave houses, and the Eternal State's hand on the bench.
- Where the fresh sturzstrom fell, and when (a story site).
