# k-guilin: the plan (2026-10-26)

**The Hykkousoi hinterlands**: Krator's inland tower karst behind the NW bay (`biomes/nwbay`, the bay of Ys). The same
limestone province as the bay's drowned stacks (Krabi, Ha Long), seen where it is not drowned: lone towers (fenglin) on
an alluvial plain, a fengcong's crowd of peaks on one base, the stone forest on the upland bench at the far edge, and a
great freshwater lake with the Hykkousoi city of **Trigon** on its south shore.

Forked from `biomes/guilin` (Earth's South China karst), which stays frozen as the Earth reference (its `NOTES.md`).

## 0. Decisions (the owner, 2026-10-26)

| | |
|---|---|
| Geology | nwbay's limestone province inland: fenglin on a plain, fengcong clusters, the stone forest at the far upland edge. **Tower heights, rock and colouring match nwbay's stacks**, so the two read as one landscape |
| Flora | guilin's Earth species kept; **nwbay's species added**, toned for inland: fewer shore species (no mangrove, no lava pine, no tsingy plants), cliff figs at the tower rims with root curtains as nwbay does them, prism gums, ironbarks and fan-crowns (nwbay's jungle giants, the hyperjungle's line) on the plain between towers, not on the thin-soiled tops. The cultivated plants stay: rice paddies (`card.crop.rice`), bamboo, lotus ponds, osmanthus, pomelo: the bay people's farms |
| Name | **the Hykkousoi hinterlands** (LORE's spelling, `LORE.md` §6.16; the owner chose it over "Hykkoussoi") |
| Placement | the biome polygon `k-guilin` on the scale model (section 1) |
| The water | the polygon's water body is **a freshwater lake** (not a sea arm, not a lagoon) |
| The page | **the lakeshore by Trigon** (section 2) |
| nwbay's species | **read in place** (as many biomes read the hyperjungle kit): k-guilin follows nwbay's changes; `verify.py` catches drift |

## 1. The polygon on the model (4.22, surveyed 2026-10-26)

The biome polygon `k-guilin` (doc `rmvp22q7x7bdp`, 14 points, **14,860 km²**, px 415-518 by 378-443; the region's
centre px 466,410). It touches **NW bay** on the south (3,119 px of shared edge) and **crater drylands** (the Scyvoi's) on
the north-east. Survey script and output: `tools/scale-model/extract_region.py` on the 4.22 page, then a band survey (the
heights are the model's half-resolution grid, bilinear; air = 1.6 atm x e^(-h/8 km), the model's own rule).

| Band | km² | Median height | Air | Rain | Mean (warm/cold month) | Climate |
|---|---|---|---|---|---|---|
| all | 14,860 | -1,094 m (-1,765 to -818) | 1.83 atm | 988 mm | +31 (+37/+25) | Aw 45%, lake 19%, XA 10%, Af 10% |
| land only | 11,228 | -1,051 m | 1.82 | 972 | +31 (+37/+25) | Aw 59%, Af 13%, XA 9%, XV 7% |
| land under -1,300 m (the lake's shores) | 736 | -1,361 | 1.90 | 854 | +32 (+37/+28) | XS 40%, XV 31%, XA 29% |
| land -1,300 to -1,100 | 2,916 | -1,163 | 1.85 | 1,160 | +31 (+37/+26) | Aw 28%, XA 27%, XV 18%, Af 14% |
| land -1,100 to -950 (the plain) | 5,296 | -1,037 | 1.82 | 1,003 | +31 (+37/+24) | Aw 68%, Af 20%, Am 7%, BSh 5% |
| land -950 to -800 | 1,668 | -894 | 1.79 | 878 | +30 (+37/+23) | Aw 96%, BSh 4% |
| land over -800 m (the upland edge) | 612 | -749 | 1.76 | 768 | +29 (+36/+22) | Aw 100% |
| west third (px x < 445) | 3,956 | -1,017 | 1.82 | 847 | +31 | Aw 57%, XV, XS |
| middle third (the lake) | 6,456 | -1,306 | 1.88 | 1,192 | +32 | lake 38%, Aw 31%, XA 16% |
| east third (toward Ys) | 4,448 | -1,049 | 1.82 | 1,019 | +31 | Aw 53%, Af 24%, XA, Am |

(Aw tropical savanna; Af rainforest; Am monsoon; XA hypertropic jungle, over 1.85 atm; XV abyssal savanna; XS abyssal
salt steppe; BSh hot steppe.)

- **A hot, dense-air lowland**: the plain stands about 1 km below the crater's datum and 450 m above the Ring Sea
  (-1,500 m), under 1.8-1.9 atm, +31 °C mean, +37 °C in the warmest month and +25 °C in the coldest. Guilin's Earth
  plain is a humid subtropical +19 °C: **k-guilin is hotter and wetter in the air, drier in the year** (tropical savanna
  over most of the plain: a wet season and a dry one, about 1,000 mm), with jungle (XA, Af) where the lake and the bay
  wet it.
- **The lake**: one freshwater body, **3,641 km²** (px 434-474 by 382-412), its surface at -1,500 m (the Ring Sea's
  level, but 54 km from the sea's nearest water: no outlet on the model), ~170 m deep (350 m at most). Three Scyvoi-named
  **wadis** run into it from the uplands to the north-west and north: the **Sivift Gulusu** (71 km, from +190 m, 6 m³/s),
  the **Filem Gulusu** (12 km) and the **Borun Gulusu** (6 km, its mouth at px 440.6,412.6, a few km west of the page).
  All three are seasonal (`perennial: false`).
- **Relief**: the plain is gentle (3x3-cell standard deviation of the model's heights: median 31 m, 90th percentile
  102 m): the model's 4 km cells do not hold the towers; they are this kit's.
- **Settlements**: **Trigon** (arcology, px 450,410, -1,264 m) is the only one inside the polygon, on a promontory of the
  lake's south shore. Outside it: Ys (city, px 517,408) 4 km past the east corner, Tethis (arcology, px 461,445) on the NW
  bay's coast, Port Visas and Nereus (villages).
- **The upland edge** rises west and north-west toward the Scyvoi's drylands (px 410: -300 m), where the stone forest
  stands (Shilin's place in guilin: a dry bench above the plain).

## 2. The page: the lakeshore by Trigon

3.2 km across (R 1600), x east, z south, centred at **px 444.5, 414.5** (the model: -1,340 m, XA, 1,500-1,900 mm,
+32 °C mean, 1.89 atm), 5 km west-south-west of Trigon. The lake's surface is the page's y = 0 (-1,500 m on the model);
the plain rises from the shore about 40 m over the page to the south and west.

- **The lake** fills the page's north edge and runs off it to the north and east (a bay of it reaching south into the
  page): open water on core/water (`WATER.open`, the shared wave field), its far shore out of sight. Reed beds, lotus
  and the lotus trumpet in the shallows; a sand and pebble beach; a few towers standing in the shallows with the
  notch at the waterline (nwbay's stacks' look).
- **The wadi**: guilin's Li River becomes a seasonal river (the Borun Gulusu's kind) coming down from the south-west
  to the lake through the paddies: a braided bed of sand and pebbles with a shrunken channel of water in it, on
  core/water (`WATER.flow`). It runs dry in the dry season (a later season view; section 9).
- **The fenglin**: about 22 lone towers on the plain and in the shallows, **40 to 135 m** (nwbay's 42-132 m, its
  proportions: about 2.7 times as tall as wide), KSTACKS towers.
- **The fengcong**: one base (about 30 m, 600 m long) to the south-east with eight peaks on it, nwbay's heights.
- **The stone forest** on a bench at the south-west edge (toward the upland), guilin's ~900 blades and pinnacles
  (12-43 m) with its pond: the same stone, the bay's colour.
- **The plain**: paddies on the lake's flats and along the wadi (rice in its four states), bamboo on the banks,
  banyans by the water, camphor and osmanthus groves, pomelo orchards, flame-crowns as the field-edge tree; the jungle
  giants (prism gums, ironbarks, fan-crowns) in stands on the plain between towers, crown ferns at the towers' wet feet.
- **The horizon**: low-poly towers 2 to 7 km out on a plain disc, and the lake's open water to the north-east.
  **Trigon is not drawn** (no Hykkousoi buildings exist yet; `LORE.md` §6.16): question 3.

## 3. Zones

guilin's zones (`46-biome-guilin-layout.js`) stay (crown, slope, cliff, ledge, rim, blade, wall, foot, water, bank, paddy,
grove, plain), with two new:

| Zone | What it is |
|---|---|
| `shore` | within 40 m of the lake's edge, on land: the beach, reeds, pandan, the lotus trumpet's foot |
| `shallows` | the lake under 2 m of water: lotus, reeds, the lotus trumpet, the towers' notch |

The jungle giants read `plain` with a wetness (the lake's distance and the wadi's) and keep out of `paddy`, `crown` and
`slope` (the thin-soiled tops); the cliff figs read `rim` and the dome's top beds.

## 4. Species

### Kept from guilin (Earth's, the bay people's farms and the karst's own)

| Group | Species |
|---|---|
| Trees | phoenix-tail bamboo, banyan, camphor, sweet osmanthus, pomelo, ring-cupped oak, Masson pine, Yunnan pine |
| Small | rice (`kits/crops` 'rice'), cliff scrub, the stone orchid (medicinal), karst ferns, moss, silvergrass, sacred lotus, creepers |

### New, read in place from nwbay (`biomes/nwbay/src/50`, `55`, `56`: `NWBAY.make`, `NWBAY.plantTrees`)

| Species | Where | Notes |
|---|---|---|
| Cliff fig | at the towers' feet, on the ground (the owner, 2026-10-26: no top holds its root spread; roots may not hang off a stack) | its buttresses on the ground short of the wall; no root curtains |
| Prism gum | the plain between towers, wet ground | the jungle giant; nwbay's ceiling (110 m) holds |
| Ironbark | the plain between towers | |
| Fan-crown | the plain, the wadi's banks | |
| Flame-crown | the field edges, the villages' tree | nwbay's lowland and farm tree |
| Crown fern | the towers' wet feet, the banks | |
| Stilt pandan | the lake shore | |
| Lotus trumpet | the lake's shallows | |
| Pipe reed | the lake's shallows and the wadi's mouth | |

Left out (toned for inland): the lantern mangrove (a freshwater lake), the cinder pine (no lava), the spinewand and rock
bottle (the tsingy's), the dragon tree, umbrella thorn and the baobabs (nwbay's dry upper slopes), the mat-reed beds (they
read nwbay's own fields).

## 5. Core adoption

| Module | What it does here |
|---|---|
| `core/biome` | the kit contract, foliage, placement, export (`CORE_BIOME`), as guilin |
| `core/host` | camera, panel, probe, inspector, marks, pictures, minimap, editor, cutaway (`khost.FULL`), as guilin |
| `core/rand` (`KRAND`) | every draw (placement seeded per cell; the towers' list per index) |
| `core/tags` | everything placed registered before it is drawn (`BIO.init({tags})`) |
| `core/space` (`KSPACE`) | the keep-clear between trees (the kit's and nwbay's in one index) |
| `core/terrain` | `KSTACKS` (37): the towers, the fengcong's base, the stone forest; the page's ground from the survey |
| `core/water` | the lake (`WATER.open`), the wadi (`WATER.flow`), the pond and the flooded paddies (still water) |
| `core/atmos` | `ATMOS.bindHost`; **the shared sky** (`core/atmos/sky` + `host/89-atmos-h-skyhost.js`, SKY-PLAN step S1, as swbay and nwouterwall) at px 444,414 with the model's air (1.89 atm, humid), replacing guilin's hyperjungle sky and necanyons' night; **the weather** (`ATMOS.bindWeather`, `host/89-atmos-e-weatherhost.js`): wet climate, the ground wets in the rain; the cloud shade (`ATMOS.cloudShade`) |
| `core/materials` | the library through `materials.json` + `tools/textures/pack.py` (guilin's sets, nwbay's for the borrowed species) |
| `core/clock` | the host's hour (the sky reads it) |
| `core/edits`, `core/minimap`, `core/export` | as guilin |
| `core/mask` | not taken: no placement reads a canvas (the zones are functions) |
| `core/city`, `core/hamlet` | not yet: Trigon and the farm villages are a later step (question 3) |

Read in place: `biomes/nwbay` (species 50, trees 55, variants 56) in its own registry (`BIO.kit('nwbay')` ...
`BIO.kitEnd(NWBAY)`, written by this build around nwbay's fragments, as `biomes/ringisles` reads its kits);
`biomes/hyperjungle/src/41-hyperjungle-globals.js` (the core's helpers by their old names), as guilin.

### The final rebuild (pair 13, 2026-11-09; cloud, no GPU)

One page, `dist/k-guilin.html` (no station: `--station <name>` builds `stations/<name>/` when one exists). Every change is in `src/` and
`build.py`, each look change behind a switch. **The universal set (`BACKPORT.md` section 1), as ringisles (pair 8) and korona (pair 9) took it:**

| Module | Taken | Where | Switch |
|---|---|---|---|
| `core/biome` 31b, 31j, 32, 33, 34, 41 | leaves on stems, limb joints, variants, fungoid, octahedral impostors, the field contract (check_assembly's MISSING `BIO.leafOn`/`leafQ`/`impostor*` gone) | `build.py` `CORE_BIOME` | |
| octahedral impostors | this kit's far bamboo, banyan, camphor and both pines (55); nwbay's borrowed trees (`NWBAY.IMPOSTORS`, asked by 88); osmanthus, pomelo, oak keep their blobs | 55, 88 | `?diet=0` |
| nwbay's attach fixes | `NWBAY_LOOK.joints` (`BIO.flareJoin`) and `.holds` (`BIO.holdTo`) on the borrowed species; nwbay's looks (back-light, root colour, season, fungus shape) off | 45 | `?joints=0`, `?holds=0` |
| card cells | `check_cells.py --fix`: stems for `scrub`, `pomeloleaf`, `pineleaf`, `bambooleaf`; `lotusbloom`'s cell (5 to 0) | `materials.json`, `tex/pack.json` | |
| `KSTRATA` (35, 35z) | nwbay's limestone recipe (`kguilin-karst`: one province) on the towers' walls and the blades, not the tops | 47 | `?strata=0` |
| `KGROUND` (43) | the litter, sand and mud over the grass, hex-tiled, distance-scaled, height-blended (all four layers from the pack only) | 47 | `?kground=0` |
| `KHORIZON` (45) | the towers' shadows on the plain at a low sun, on the ground and every lit material (not the karst beyond) | 88 | `?horizon=0` |
| `KSHADOW` | off by default (the owner, 2026-11-03) | 88 | `?shadow=1` |
| height fog (R1) | the lake's air thinning up the towers; the valley mist (BACKPORT's "fog belt in the karst valleys") pooled to ~14 m over the lake at dawn | 89a | `?hfog=0` |
| rain cover (R10), lightning, wind (R8), A2C (R7) | as the other turns | 89a, 88 | |
| `core/water` ext 57, 58 | the audit; `WATER.mirrorSwitch` on the lake, off at load; the lake has no surf or breakers (BACKPORT.md, the owner, 2026-11-02) | 89w | `?mirror=probe\|live`, `?breakers=1` |
| `khost.FULL`, `--station`, LF writes, `build_sources` | `build.py` | | |

**Not taken (each with its reason, `KNOWN_ISSUES.md`):** `KFAR` (the page draws its own karst beyond, and the lake runs on north);
`KSTACKS.contour` and `KSTACKS.weather` (the cliff scrub, figs, vines and orchids are placed on the records' walls; a worn wall leaves them off it
until a seat pass like korona's staghorns'); wet ground and puddles (R9: the black-ground finding on a KGROUND floor); the water fields (ext 60:
nothing here reads `BIO.env`'s water yet); BACKPORT's karst springs, confluences, tall falls and `BIO.bamboo` (new features: not this turn).

## 6. Textures

guilin's sets (`biomes/guilin/materials.json`: ground.grass.lush, the karst limestone and moss, rice, bamboo, the stone
orchid, ferns, moss, the lotus) and nwbay's (`biomes/nwbay/materials.json`) for the borrowed species' leaves and barks.
The lake's beach takes guilin's sand set. Nothing new is owed so far; a gap found while building goes to
`core/materials/PROMPTS-NEEDED.md`.

## 7. Order of work

1. Fork: copy guilin's build to `biomes/k-guilin`, rename the kit (`KGUILIN`, kit `kguilin`, page `dist/k-guilin.html`),
   build and verify unchanged.
2. Core: the shared sky and the weather in place of the hyperjungle sky and the necanyons' night; `ATMOS.bindHost`.
3. The stage to the survey: the lake on the north edge (open water), the wadi in place of the Li, the towers at nwbay's
   heights and colouring, the fengcong to the south-east, the stone forest's bench to the south-west, the shore zones.
4. nwbay's species read in place, placed by k-guilin's zones (`NWBAY.make` + `NWBAY.plantTrees`), the cliff figs on the
   rims with their curtains.
5. Textures: `materials.json` (guilin's + nwbay's slots) and `pack.py`.
6. Verify on the GPU (`verify.py --assert`), `check_core_use.py`, screenshots of the views.
7. Docs: NOTES, KNOWN_ISSUES, INDEX, PORT, BIOME-API; `LORE.md`, `biomes/README.md`, `biomes/WORLD.md`.

Later (not this pass): a dry-season view (the wadi dry, the paddies stubble, the savanna's grass straw); Trigon and the
farm villages (`core/hamlet`); fauna (nwbay's soarers and darters read in place); the far view cast from the model
(`biomes/nwouterwall/region/far.py`'s ridges).

## 8. Questions

Settled 2026-10-26: the spelling, the lake, the page's place, reading nwbay in place (section 0); after the owner's review,
roots never hang off a stack (trees on the tops moved in or dropped) and the cliff figs stand at the towers' feet.

Open:
1. **The guilin species in the heat.** The model makes the lakeshore +32 °C mean (+27 °C in the coldest month) under
   1.9 atm: Masson and Yunnan pines, ring-cupped oaks and osmanthus are Earth's subtropical trees. Kept as asked (on the
   towers' crowns and the upland bench, where it is driest); say if the pines should give way to a Krator species.
2. **Season.** The page shows the wet season (green paddies, water in the wadi). A dry-season state is a later view.
3. **Trigon** is 5 km off the page and not drawn: no Hykkousoi building kit exists (`LORE.md` §6.16). Draw it on the
   horizon when one does?
