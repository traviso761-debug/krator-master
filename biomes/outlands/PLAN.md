# outlands: the plan (2026-10-26; the colonies, 2026-11-09)

The **Outlands**: the walled basin east of the main crater, outside the Outer Wall, reached through **the gap** of the
Outland Gate, where **the Gate**, the Tierhounds' toll fort, closes the floor (the owner, 2026-11-09; it was a 7.7 km pass in
Korona's corner until map 5.1 cut the gap: on 5.1 a wind-scoured gorge), or up **the Great Chasm** from the south. The most
out-of-the-way ground on Krator and its **Socotra**: both ways in are hostile enough that almost nothing living crosses them,
and the native flora has gone its own way for millions of years. It is **the one place the fungoid lineage became colonial**
(section 4): a hillside is one organism. Home of the **Coyote Men** (therian tribes, stone and bronze age); the **Kingdom of the Tiers** of the
**Tierhounds** keeps the threshold. Exports: **emeralds, turquoise, ostrich feathers**.

**Status: station 1 built (2026-11-09).** P0 (the survey) is done: `SURVEY.md` holds every number this plan quotes. **Station 1, the Fog Wall** (`dist/outlands.html`, section 9) is built on the colony rule (section 4): `BIOME-API.md`, `KNOWN_ISSUES.md`. No
other station is built. Settled points carry the owner's date; *proposed* marks this plan's own suggestions.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/outlands/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `refs/`) |
| Pages | stations, as Korona's and the Throne's (`build.py --station <name>`): `dist/outlands.html` (station 1, the Fog Wall) and `dist/outlands-<name>.html` (section 9) |
| Regions on the model | `N Outlands` and `S Outlands` (biome), `Tiers` (biome, its own kit), `Coyote Kingdom` (political); markers **Trickster's House** (ruined arcology, px 1240,330) and **The Gate** (outpost, px 1136,84; **moving to 5.1 px 1438,326** in the gap, section 1) |
| Object | `OUTL` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `plantOfItem`) on the `BIOME-API.md` contract (the Throne's and sedesert's shape) |
| Core | `biome`, `rand`, `tags`, `space`, `host`, `atmos`, `water`, `mask`, `terrain` (`KFIELD`, `KCARVE`, `KSTACKS`, `KRELIEF`, `KBASIN`), the shared sky; section 13 |
| Read in place | `ebadlands` (banded walls at the margins), `sedesert` (the coyote walker; nothing of its flora in the basin), `kits/fauna`, `kits/ancients` (Arcoindian II) |
| Sibling kits | `biomes/tiers` (its own plan, section 10), `kits/coyote` (the culture kit, later, section 6) |
| Out of scope | the Coyote and Tierhound buildings and dress (the culture kit); the animals' models (`kits/fauna`); the gem nodes' data (`kits/resources`) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. The ground (scale model 4.22-4.23, `SURVEY.md`)

- **Outside the Outer Wall** (the owner, 2026-10-26). The basin floors stand mostly at **3.2-3.9 km (1.0-1.07 atm)**; valleys
  run down to **289 m (1.54 atm)**. The rim and plateau round them are ET tundra, ice and the airless crest: 82% of the
  N polygon and 75% of the S polygon stand over 4.5 km. ~~The barrier is the Gate: 7,724 m, 0.60 atm, the one crossing~~
  (4.22). **On map 5.1 the barrier is the gap** (the owner, 2026-11-09): **one crossing, the gap, held by the toll fort.**
  The Outland Gate's trough (`biomes/outlandgate/PLAN.md`) runs from Spider Lake to the N Outlands' lake (2,345 m) on a
  floor of 1.4-1.7 km, so a walker reaches Trickster's House from the crater with no crest over 3.6 km. Height no longer
  explains why the flora is alone; section 2, "the isolation", gives what does.
- **Isolation by distance and hostility, not a wall** (the owner, 2026-11-09). Map 5.1 moved the Gate down to the Outland
  Gate's Narrows (1,423 m, `biomes/outlandgate/PLAN.md`) and cut the Great Chasm (`biomes/greatchasm/PLAN.md`) to the south.
  Neither is a wall, but both are filters: the Gate is a gorge planed by 60-110 km/h katabatic winds, the Chasm a dry trough
  with a 38 °C floor and no water in 468 km. Both lie far from anywhere. Little crosses either way, and nothing that crosses
  competes with colonies that have held the ground for an age (section 4). This plan's numbers are still 4.22's (`SURVEY.md`);
  `biomes/STATIONS-MAP-5.1.md` has the stations' drift on 5.1 (station 5 re-sited to the Nursery Bench, section 9; the rest
  move under 320 m).
- **Two basins, two climates** (the climate histogram, `SURVEY.md` section 6): **N Outlands is dry and open** (cold steppe
  BSk 34% and cold desert BWk 31% of its basin ground, median 235 mm, the driest cells 31 mm); **S Outlands is wet and
  wooded** (Dfb 43%, Cfa 13%, ~1,000-1,300 mm) with a hot valley floor (BSh, 21 °C mean) and a cold-desert shoulder.
- **Water**: one perennial river (47 m³/s, from 3,887 m to a **lake at 705 m**, px ~1382,371); a **salt lake at 2,241 m**
  (1,348 km², px 1314,320); a Cfa lake at 2,345 m (px 1316,186); frozen lakes at 6.1-7.1 km on the plateau; ~60 dry wadis.
- **Trickster's House** (the owner, 2026-10-26): **Arcoindian II, ruined**, built into the **west wall of the N main basin**
  (px ~1240,330), over a lake at 2,132 m at the wall's foot; the wall rises ~1,650 m. 1.2 atm at the quay.
- **The Gate** (an outpost on the map, the owner, 2026-10-26): the Tierhounds' toll fort and the trickster's shrine.
  **Moved (the owner, 2026-11-09) from the 7.7 km pass (px 1136,84 = 5.1 px 1408,414, 8,002 m on 5.1) to the gap's Narrows,
  5.1 px 1438,326** (1,423 m, 1.34 atm, Cfa; legacy px would be 1166,-4, off the 4.22 canvas). The floor there is 30 km wide
  within 300 m of the river; *proposed*, the Tierhounds close it with a long wall from wall foot to wall foot, the fort and
  its water gate at the middle, a citadel on the NE Outer Wall's Gate shoulder (`biomes/outlandgate/PLAN.md` section 5).
  The old pass keeps a cairn and shrine (*proposed*).
- **The god's road** (the owner, 2026-10-26): from **the Sleeping City** (px 772,446) **through the Gate to Trickster's
  House**. It was 1,938 km on the surface, highest 7,728 m beside the old pass (`openworld/gods-road.json`). **It now runs
  through the gap** (2026-11-09): by Spider Lake, up the gap, through the gate at the Narrows, by the N Outlands' lake to
  Trickster's House; its highest point falls to about 3.6 km. `god_road.py` re-routes it (the map session's work). The
  Ancients' own way in is a separate rim tunnel from the south-west (`SURVEY.md` section 7).

## 2. Air, scale and the island rule

- **The mix** (the owner, 2026-10-26): flora **90% native**, nothing closely like an Earth plant; fauna **~66% native,
  ~33% Earth-like**, native **hexapods** dominant, **ostriches** roam.
- **Socotra for the biogeography, not the look**: endemism, water stored in the body, forms that comb fog. No plant copies
  Socotra's (no dragon's-blood umbrellas, no bottle trunks, no Welwitschia).
- **The native lineage is fungoid** (`biomes/swhighlands/PLAN.md` section 3, `biomes/swbay`): fleshy bodies carrying a
  **photosynthetic partner** in caps, fringes and pads, as a lichen does: green, teal, violet and rust on top, pale and fleshy
  beneath; true decomposers keep to dead wood, carrion and nests. **No leaves, no flowers, no wood grain**: spores, pods,
  sealed skins.
- **Here, and only here, the lineage is colonial** (the owner, 2026-11-09; section 4): a buried mycelium bundle kilometres
  across raises three or four kinds of body, each with its own job. Elsewhere on Krator the lineage's bodies are solitary.
- **Colour carries it**: violet and teal in the fog woods, copper blue-green on the gem hills, rust and bone on the steppe,
  white salt, the red of the basalt rim.
- **Hexapods and plants evolved together**: they graze, tend, nest in and carry the spores of the native flora (the nursery
  plants). The Earth-like animals came late, with people.
- **Scale**: dense valley air allows size, but **no giants**: the tallest fog-combers reach 16 m.
- **The isolation (2026-11-09; *proposed*, for the owner).** The old rule ("a pressure-adapted lowland lineage cannot cross
  7.7 km") went with the pass. The gap is warm and wet all the way to the N Outlands' lake, so the island rule now rests on
  four things (the evidence is in `biomes/outlandgate/PLAN.md` section 9):
  1. **A climate wall at the gap's head:** the floor's Cfa (1,000-1,600 mm, 19-22 °C) ends under a 2.2 km scarp to cold
     desert at 4 km (94 mm, 6 °C), and every way on into the basins crosses dry ridges and steppe (Dsc and BSk at 188-520 mm).
     A crater lowland plant that reaches the lake still dies on the steppe. The pressure step remains a third (1.34 atm on the
     floor, about 1.0 on the steppe).
  2. **A wind that blows out:** the gap's night and winter flow (the Outland Bore) drains the plateau north. Spores ride
     out; little rides in. The leak is one way: fungoid stragglers on the gap's southern floor, no crater plants in the basins.
  3. **The gap is young:** the outburst floods cut the head's sill late. The flora's millions of years of isolation came
     first, behind the old crest.
  4. **The fort's seed law:** no live plant, seed or fodder passes the Tierhounds' wall inward; a trickster's taboo says
     what grows behind the wall is the god's.
  The three Earth-like plants (section 4) came in with the Coyote Men's ancestors before the seed law, as before.

## 3. Zones by height and water

The survey's working rule: **the flora zones by height first, then by water**. Each zone is a `BIO.field` mix the kit
derives from height, rain and the fog belt; every zone is a `core/tags` area.

| Zone | Height | Climate | Air | Rain, temp | Where | Stations |
|---|---|---|---|---|---|---|
| **Z1 Valley floor** | 0.3-1.4 km | BSh, WH (lake) | 1.4-1.5 | 500-600 mm, 21-22 °C | the river and the 705 m lake | S3, N3 |
| **Z2 Wet valley** | 2.0-3.0 km | Cfa | 1.1-1.2 | 800-1,300 mm, 11-14 °C | the valleys' sides, Trickster's House | S2 |
| **Z3 Fog woods** | 3.5-4.4 km | Dfb, the fog belt | 0.95-1.0 | 900-1,200 mm, 5 °C | the S basin's windward wall | S1 |
| **Z4 Cold steppe** | 3.5-4.0 km | BSk | 1.0 | ~235 mm, 8 °C | the N basin's plains | N1 |
| **Z5 Cold desert** | 2.3-4.0 km | BWk | 1.0-1.2 | 30-150 mm, 6-14 °C | the Nursery Bench on the gap's head (5.1 px 1558,516, 94-109 mm), S4's gem shoulder | 5 (the Nursery Bench), S4 |
| **Z6 Salt** | ~2.2 km | BSk | 1.2 | dry | the salt lake and the pans | N1 (edge) |
| **Z7 Wadis** | all | (follows) | | episodic | ~60 dry channels, fans at every wall's foot | all |
| **Z8 Plateau and rim** | 4.5-7.5 km; crest over 9 km | Dfc, ET, EF; O | 0.9-0.6; none | 0-450 mm, 2 to -15 °C | the frozen lakes, patterned ground, the old pass (its cairn and shrine) | none (the Gate moved into the gap) |
| **Z9 The gap's southern floor** (2026-11-09) | 1.4-2.3 km | Cfa, WH | 1.34-1.2 | 1,000-1,600 mm, 19-22 °C | the Outland Gate's floor south of the Narrows, the N Outlands' lake shore: Earth-like woods with fungoid stragglers | the Outland Gate kit's (read in place) |

## 4. The flora: nine colony types, 32 forms (plus 3 decomposers and 3 Earth-like)

### The colony rule (the owner, 2026-11-09)

The Outlands' native plants are **not species of individuals**. Each stand is one **colony**: a bundle of mycelial cords
buried under the ground, from a few hundred metres to tens of kilometres across, that raises **three or four kinds of
body** (forms), each serving the colony. **Outlands only**: everywhere else the fungoid lineage's bodies are solitary
(read as the colonial lineage's distant, broken-off relatives).

**Why here.** The Outlands packs its gradients close: a fog wall at 3.5-4.4 km above a 235 mm steppe, wet south against dry
north, copper rock beside barren rock. A solitary body is stuck with its spot's conditions; a colony spanning the gradient
**pipes water down from the fog and minerals up from the ore** through its cords (real cord-forming fungi move water and
nutrients this way). The colonies live on the transitions, and the Outlands is made of transitions.

**The roles.** Every colony has the first three, sometimes two in one form; the fourth is **fixed by the colony's type**:

| Role | Job |
|---|---|
| **Collector** | carries the photosynthetic partner; feeds the colony |
| **Drinker** | catches water (fog, runoff, brine) and stores it |
| **Breeder** | makes spores and pods; pays animals, wind or water to carry them |
| 4th: **Runner** | stands at the far end of the cords, on ground the colony cannot feed on, holding what the cords carry there |
| 4th: **Warden** | stands on the colony's seam (below), sealing it against the neighbour |
| 4th: **Miner** | grows on ore and draws metal from it |
| 4th: **Nurse** | feeds the hexapods' young, which spread the colony's spores and graze its rivals |
| 4th: **Pump** | draws brine and sheds the salt as crust |

### The colony types

Keys are the forms in the tables below; each form belongs to exactly one type.

| Type | Zone | Collector | Drinker | Breeder | 4th role | Note |
|---|---|---|---|---|---|---|
| **Veil colony** | Z3, cords to Z2/Z5 | `fogpelt` | `veilcap` | `lantern` | **Runner**: `pleatcol` | the showcase; one organism from the fog wall at 4.4 km down to dry ledges at 2.5 km. The pleat columns are the cords' cisterns, which is why the tribes find water where no fog falls |
| **Mast colony** | Z2, seeps | `deckcap` | `curtain` | `capshrub` | **Warden**: `combmast` | the wet valleys' woodland; comb masts stand in lines along its seams, bleeding gum that seals its cords against the neighbour's (the caravans' incense) |
| **Copper colony** | S4 gem hills | `greenfan` | `drums` | `tqshelf` (first onto new rock and spoil) | **Miner**: `lacecrust` | copper is a cofactor its partner needs; the green bands on the rock are where it has fed. The Peak tribe follow it to the ore |
| **Nursery colony** | N2, Z5 | `rosette` | `gallstack` (sealed galls over a nest) | `podtower` | **Nurse**: `broodpad` | pays the nursery-tender hexapods in food; they spread it and crop its rivals |
| **Steppe colony** | Z4 | `needlefur` | `greycush` | `sacbrush` (sacs burst under hooves) | **Warden**: `ember` | scarlet ember hedges along its seams; the red is a warning (bitter), and the tribes' red dye |
| **Wadi colony** | Z7 | `ribbon` (collector and breeder: spores ride the runoff) | `bellpool` (the pools a flood leaves) | | **Runner**: `stilt` | its cords cross live gravel on the stilt mounds' rock-gripping roots |
| **Salt colony** | Z6 | `brinefilm` (*new*: the pink of the brine itself) | `glasstube` (fresh water behind a crystal skin) | `saltfan` (spores shed with the crust) | **Pump**: `saltfan` | a desalinating organism; the pans' pink is the colony |
| **River colony** | Z1, the 705 m lake | `mirepad` | `pipereed` (its intakes) | `glowbell` (lit at night over the shallows; fog moths carry its spores) | none | three forms; the warm valley needs no specialist |
| **Rim colony** | Z8 | `icecrust` | `frostpuff` (drinker and breeder) | | **Runner**: `pebblemat` | slow and old; living pebble plates carry its cords across the fellfield |

### Territories and seams (the owner, 2026-11-09: the seams are a feature)

Colonies do not merge. Where two meet they wall each other off, as rival mycelia do in wood (the dark "zone lines" of
spalted timber). On the ground that reads as:

- **territories**: each colony holds one patch of ground with one palette and one set of forms. From a height the steppe
  reads as a **cracked mosaic**;
- **seams**: a strip 2-8 m wide between two territories, bare or crusted dark (`seam`, a ground-cover class: a dark crust
  line on bare ground). Wardens stand in lines along their colony's side of it;
- **fairy rings** at a young colony's growing edge: a ring of collectors round bare, exhausted ground;
- **age as size**: young colonies are rings 50-300 m across; old ones fill a valley wall. Two colonies of one type meeting
  still seam.

**Placement** (kit code, on core; no core amendment, as no other kit is colonial):

1. **Colony records** per zone: seeds from `KRAND` on a cell hash (world, cell, `colony` salt), each `{id, type, age,
   centre, weight}`; the type from the zone masks; the weight from age. Registered in `core/tags` as areas (`colony:<id>`)
   before anything is drawn.
2. **Territories**: a weighted (power) Voronoi of the seeds, clipped to the type's zone mask, with the edges jittered by
   `KFIELD` noise so seams wander. Neighbour lookups go through `KSPACE`, not a new grid.
3. **Seams**: where the two nearest territories' weighted distances differ by under the seam width; written into the
   cover grid as `seam` and kept clear of every form except the wardens.
4. **Forms** placed inside a territory by role, each from a stream seeded by (colony id, cell, form): collectors spread
   through it; drinkers to the wet side (up into the fog belt, along the water); breeders toward the centre; runners at the
   cords' far end, downslope or across the dry ground; wardens on the seam; miners on ore beds (`S.at` from the strata,
   C3); nurses by the hexapods' nests.
5. Each form instance carries its `colony` id in its tag record, so an inspector, the tribes' water rights and a quest can
   ask "which colony is this".

### The forms

Working names; keys in brackets. **Build** names the parts the builder draws (section 12's fungoid helpers); **Tex** names
the library set or the new set (section 11). Every form is a record registered in `core/tags` (with its `colony` id) before
it is drawn, placed by `KRAND` and `core/mask` rasters as above, cleared by `BIO.clearOf`. The tables keep the old grouping
by size; the colony type of each is in the table above.

#### Trees and tall forms

| Key | Name | Zone | Form, size | Build | Colour | Harvest | Tex |
|---|---|---|---|---|---|---|---|
| `veilcap` | **Veil cap** | Z3 (Z2 high) | a smooth pale pillar under a flat disc cap 4-7 m across, hung with a fringe of fine threads that comb the fog and drip into a ring basin at the foot; 10-16 m | stalk, disc cap, thread fringe (cards), root ring | cap violet-teal on top, flesh-white under; threads silver | fibre (threads), drip water | `organic.cap.violet`, `card.fogcomber` |
| `combmast` | **Comb mast** | Z3 | an unbranched tapering mast with paired thin comb-plates up its windward side like a ladder; 8-14 m | stalk, comb plates (instanced) | mast rust-brown, combs teal | gum (drip gum: incense for the caravans) | `bark.whorled` (tinted), `organic.cap.glossy` |
| `deckcap` | **Deck cap** | Z2 | three or four decks of small caps up one stalk, the woodland canopy of the wet valleys; 6-10 m | stalk, stacked caps | green-teal decks, grey stalk | fibre, fodder | `organic.cap.porous` (tinted) |
| `pleatcol` | **Pleat column** | Z2, Z5 | a ribbed sealed column that swells after fog and shrinks in drought, in groves on ledges; 3-8 m | ribbed bladder (lathe with pleats) | blue-grey to teal skin, rust pleat edges | **water** (tapped: the tribes' wells) | `organic.pleat.skin` |
| `lantern` | **Lantern stalk** | Z3 understorey | a pale stalk topped by a cluster of pods that glow gold at night; 4-7 m | stalk, pod cluster (emissive) | bone stalk, gold pods | none (sacred to no one; the hexapods eat the pods) | `organic.pod.honeycomb` (owed, §17) |
| `podtower` | **Pod tower** | Z5 (N2), Z4 | a spongy tapering tower riddled with egg chambers the hexapods tend; 3-6 m | bladder stack, holes (decals) | ochre-orange, dark chambers | food (grub-bread, *proposed*), wax | `organic.pod.honeycomb` |
| `pipereed` | **Pipe reed** | Z1 | stands of hollow orange tubes in the river shallows and the lake's edge; 2-4 m | tube clusters | orange, black rims | fibre, roofing | `card.fungus.drip` (tinted) |

#### Shrubs and cushions

| Key | Name | Zone | Form, size | Build | Colour | Harvest | Tex |
|---|---|---|---|---|---|---|---|
| `drums` | **Drum cluster** | Z5, Z2 | fat sealed drums budding off a root mat; 0.5-1.5 m | bladders on a mat | grey-green, rust bands | food (roasted, *proposed*), water | `organic.pleat.skin` |
| `sacbrush` | **Sac brush** | Z4, Z5 | a low bristle of sealed sacs on wiry stems; 0.6-1.2 m | stems, small bladders | dusty teal | fodder | `card.outlands.scrub` |
| `greycush` | **Grey cushion** | Z4, Z8 | a dense grey dome of fused stems, the steppe's commonest form; 0.3-1 m | dome (displaced) | grey, rust heart | fodder (goats, ostriches) | `card.outlands.scrub`, `ground.lichen.crust` |
| `ember` | **Ember scrub** | Z4, Z5 | a red-brown shrub of hard tubes that flushes bright in the heat; 0.8-1.5 m | tube shrub | rust to scarlet | dye (red) | `card.outlands.scrub` |
| `capshrub` | **Cap-shrub** | Z2, Z4 | small caps on short stalks in clumps; 0.5-1.2 m | small caps | ochre, gold | fodder | `organic.cap.orange` |
| `stilt` | **Stilt mound** | Z5, Z7 | a mound on rock-gripping stilts that straddles moving gravel; 1-2 m | dome on stilt roots | brown, white stilts | none | `bark.cratered` (tinted) |
| `broodpad` | **Brood pad** | Z5 (N2) | a flat orange pad where a hexapod lays and its young feed; 1-3 m across | flat pad, egg decals | orange, white eggs | none (taboo to strip: it feeds the herds' grazers) | `organic.cap.orange` |
| `gallstack` | **Gall stack** | Z5 (N2) | stacked galls grown over a buried nest; 1-2.5 m | bladder stack | bone and violet | none | `organic.flesh.cells` (tinted) |

#### Ground, rock and water

| Key | Name | Zone | Form | Build | Colour | Harvest | Tex |
|---|---|---|---|---|---|---|---|
| `fogpelt` | **Fog pelt** | Z3 | the damp crust carpet of the fog woods: the ground cover | ground cover class | violet-teal, damp | none | `ground.biocrust.fog` |
| `needlefur` | **Needle fur** | Z4 | a fine fur of rusty tubes: the steppe's "grass" | grass cards | rust, straw | fodder, thatch | `card.outlands.crust` |
| `pebblemat` | **Pebble mat** | Z5, Z8 | living-pebble plates among real stones | decals, cover | grey-violet | none | `card.outlands.crust`, `organic.lichen.plates` (owed, §17) |
| `rosette` | **Crust rosette** | Z5, Z4 | a flat spiral crust that opens in fog; 0.2-0.6 m | flat decal | teal-grey | none | `card.outlands.crust` |
| `lacecrust` | **Lace crust** | gem hills (Z5) | root-lace sheets on weathered copper rock, blue-green | rock decal, cover | turquoise, green | dye (blue-green) | `organic.lace.copper` |
| `tqshelf` | **Turquoise shelf** | gem hills, walls | bracket shelves on rock, first onto new rock and spoil | brackets | turquoise, rust undersides | ore sign (miners follow it, *proposed*) | `organic.fungus.bracket` (tinted) |
| `greenfan` | **Green fan** | gem hills, mine tailings | upright fans on spoil heaps | fans (cards) | copper green | none | `organic.lace.copper` |
| `saltfan` | **Salt fan** | Z6 | a pale fan standing in the brine's edge, crusted white | fans | white, pink | salt (scraped) | `card.outlands.crust` |
| `glasstube` | **Glass tube** | Z6 | crystal-crusted tubes standing on the pan | tube clusters | glassy white | none | `ground.efflorescence` (tinted) |
| `brinefilm` | **Brine film** (*new*) | Z6 | the salt colony's collector: a pink film on and in the brine; the pans' colour | a brine tint (`WATER.open` with C5's ramp) and a pink crust class at the rim | pink to rose | none | C5's brine ramp; `ground.salt` (tinted) |
| `ribbon` | **Ribbon mat** | Z7, Z1-Z2 | green ribbons streaming in spring runoff | water cards | green | fodder | `card.outlands.wadi` |
| `bellpool` | **Bell pool** | Z7 wadi pools, Z1-Z2 springs | hanging bell bladders on a pool's lip | bladders | teal, pale | water | `card.outlands.wadi` |
| `curtain` | **Curtain weed** | Z1-Z3 seeps | a trailing veil over wet rock | hanging cards | dark green, violet | fibre | `card.outlands.wadi` |
| `glowbell` | **Glow bell** | Z1-Z2 water's edges, the cursed shelf | a bell of tubes lit at night | tube cluster, emissive | blue-green glow | none | `card.outlands.wadi` |
| `mirepad` | **Mire pad** | Z1 (the 705 m lake) | big floating pads round the lake's shallows | floating discs | olive, rust rims | food (*proposed*) | `organic.cap.glossy` (tinted) |
| `frostpuff` | **Frost puff** | Z8 | white woolly spheres in fellfield; 0.1-0.4 m | spheres | white | none | `organic.mossball` (tinted white) |
| `icecrust` | **Ice crust** | Z8 | black crust on stones by the frozen lakes | rock cover | black, green | none | `ground.lichen.crust` (tinted) |

### The decay layer: solitary (shared with the SW highlands and swbay, defined here first)

The true decomposers are **not colonial**: solitary bodies on dead wood, carrion and nests, as elsewhere on Krator. They
are the one native flora in the Outlands that belongs to no colony.

| Key | Name | Where | Tex |
|---|---|---|---|
| `logcrust` | **Log crust**: plates and fans smothering fallen fog-combers | Z2-Z3 | `ground.mycelium.gold`, `organic.lichen.plates` |
| `bonebloom` | **Bone bloom**: pale caps on carrion and old kills | Z4-Z5 | `card.mushroom.pale` |
| `glowtubes` | **Glow tubes**: grey tubes lit orange at the tips, in nests and dark rooms | Z3, the cursed city | `card.shelf.glow` |

### Earth-like (3; the farmland and the Gate only)

`palm` **Spring palm** (date-like, at the springs), `willow` **Withy willow** (the irrigation channels), `fieldweed`
**Field weeds** (round the bronze-age package). Brought by the Coyote Men's ancestors; never in the wild basin. Taken from
the library (`card.palm`, `bark.palm`, `bark.bark_willow_02`) and the nearest kit's palm and willow builders, read in place: no new
species code.

### Where they stand, and the rule

- **Fog, not rain, places the tall forms**: the fog belt (section 12) on the S basin's windward wall at ~3.5-4.4 km holds the
  veil caps and comb masts; outside it they thin to deck caps and pleat columns.
- **The cursed city** (Trickster's House) carries the most untouched stand: **the House colony** (below) through the ruin,
  a River colony's glow bells on the lake's edge below the quay, glow tubes (solitary) in the dark rooms.
- **A colony is an individual** to the people who live with it (section 6): water taken from a pleat column or a drum is
  taken from *that* colony.
- **Harvests** feed `core/hamlet` and the culture kit: fibre (veil threads, pipe reed, curtain weed), gum (comb mast), dye
  (ember red, lace blue-green), water (pleat column, bell pool, drums), fodder (cushions, sac brush, needle fur), food
  (*proposed*: drums, pod-tower grub-bread, mire pads). **The tribes tap where no spring runs.**

### The House colony (the owner, 2026-11-09)

One colony in the Outlands is **aware**, after a fashion: the one that holds Trickster's House. Its exposure to the Ancients'
technology over the ages since the arcology fell has given it an **inchoate awareness**: no language, no plan anyone could
follow, but attention, memory of patterns and a wish to be answered.

- **What it is** (*proposed*): a **copper colony** (Miner) that took the arcology's metal as its ore. Its lace crust grew
  along the conduits, panels and still-live circuits of Arcoindian II, and its cords run through the building's ducts and the
  340 m shaft to the quay. The awareness came from what it grew into. Its forms are the copper type's (lace crust on the
  panels tracing the conduits, turquoise shelves, green fans on the terraces, drums in the wet rooms), far older and larger
  than any in the gem hills, and **out of pattern**: crust that traces circuit diagrams, glow where no copper colony glows.
- **It is not the luck field.** The misfortune that grows the longer one stays in the keep-out ring (section 6, C6) is the
  god's, or the ruin's; its cause is separate from the colony and is not settled here. The two overlap in place, so the
  Coyote Men cannot tell them apart and call both the trickster's work.
- **The pranks are its attempts to communicate.** Some of what the Coyote Men tell of the House is the colony, reaching out
  in the only ways it has. *Proposed* repertoire, each obscure enough to read as mockery:
  - **writing**: lace crust grows overnight on a camp's stones in shapes like the Coyote **contour carvings** of the
    milestones, garbled: it imitates the one script it has seen;
  - **echoing**: glow in the dark shelf pulses back the rhythm of a howl, or the cadence of the arcology's old signals;
  - **gifts and refusals**: a drum swells shut across a doorway, then a cistern is found full where none was; pods burst
    on someone who speaks in the halls;
  - **following**: a visitor who stays finds crust on their gear, a fairy ring round their sleeping place, their path
    traced by a line of shelves the next morning.
- **In play** (*proposed*): a quest to answer it (copying its marks back, a cadence on a drum) rather than to fight it;
  the colony's forms tagged `colony:house` with a `prank` record kind so `core/tags` can hold the events. Whether the
  colony can learn to answer clearly is the owner's.

## 5. Landforms

Each with the module that makes it. **New** marks a core amendment (section 12).

| Form | Where | How |
|---|---|---|
| **The basin walls**: 1-2 km scarps of red basalt over pale tuffs and red beds, banded green where copper runs | every basin's edge | `KRELIEF.range` + strata (**new**: strata into core, an `outland` recipe) |
| **The half-cave shelf** of Trickster's House: a deep shelf in the west wall over the lake | N main basin, px 1240,330 | `KCARVE` alcove (`36-core-carve.js`), `KCAVERN` for the deep rooms; the building from `kits/ancients` |
| **Wadis**: dry channels with braided cobble floors, cut banks, pools after rain | everywhere (Z7) | **new**: `KRELIEF.wadi` (a dry `river`) |
| **Fans and bajadas** at every wall's foot | Z4-Z5 | **new**: with the wadi (deposition at the mouth) |
| **Talus aprons** against walls and stacks | gem hills, walls | **new**: lift Korona's `talusH` into `core/terrain` |
| **Inselbergs and tors**: domed rock islands and boulder piles on the plains | N1, N2 | **new**: `KSTACKS` kinds `dome` and `tor` |
| **Mesas, fins and buttes** in the gem hills | S4 | `KSTACKS` (existing) |
| **Open-cast workings**: stepped benches, spoil heaps, adits | S4 | **new**: `KRELIEF.pit` (benches + spoil) |
| **Desert pavement**: packed varnished pebbles | N2 | **new**: fill `KFIELD`'s cover grid (a `pavement` class) |
| **The salt lake and pans**: polygon crust, strandlines, brine pools | Z6 | `KBASIN.salt`, `strand` (existing); `WATER.open` with a brine `tint` (**new**: a brine ramp, a pan kind) |
| **Yardangs**: wind-carved ridges | N2 | `KBASIN.land` (existing) |
| **The river and its lake**: a perennial river in a green valley, terraced fields | S3, N3 | `WATER.flow`, `WATER.open`; fields as records |
| **Springs and seeps**: hanging gardens on the fog wall | Z1-Z3 | `WATER.spring`, `WATER.wet` |
| **The fog belt**: a cloud band hugging the windward wall | S1 | **new**: `ATMOS.fogBelt` |
| **The frozen lakes and patterned ground** on the plateau | Z8 | ground-cover ice first (`ice.lake.saltrim`, `ground.turf.polygon`); **new** (later): an ice kind in `core/water` |
| **The Gate** (moved, 2026-11-09): the gap's Narrows, the long wall, the toll fort | 5.1 px 1438,326 | the Outland Gate kit's (`KRELIEF.gap`, `WATER.flow`); the wall and fort as records; the road as a record (a flattened strip on `KFIELD`) |
| **The old pass**: a high defile, snow, a cairn and shrine | px 1136,84 | `KRELIEF`, snow cover (no station) |
| **Yardangs on the Nursery Bench**, cut by the gap's night wind | 5.1 px 1558,516 | `KBASIN.land` (existing), aligned NNW-SSE with the gap (*proposed*) |

## 6. The people's side (settled unless marked)

- **The Coyote Men** are **therians** (coyote-headed, digitigrade, upright), stone and bronze age, never Izani subjects.
  They **bark a dialect of the Hum**: the tones as barked pitch contours, a howl ends a sentence (*proposed*: the consonants
  cut to *h k w y m n*, with snaps for *p t s l*); they write it in **contour carvings** on milestones and boundary stones.
- **The four tribes**: **Sunset, Sunrise, Valley, Peak**. *Proposed* homes: the **Valley** tribe, the sedentary bronze-age
  farmers, on the river (S2-S3); the **Peak** tribe on the fog wall and the gem hills (miners and tappers, S1, S4); **Sunrise**
  and **Sunset**, nomadic goat-and-ostrich herders on the N plains (N1), east and west.
- **The Tierhounds** rule the **Kingdom of the Tiers** (the "Coyote Kingdom" to outsiders) on the threshold and keep the Gate.
  **They are Coyote Men** (the owner, 2026-11-10; the "hound-headed kin" proposal is dropped): the Coyote Men's most
  organized polity, among the Tiers' lakes and canyons, its capital Coyote Canyon. The Gate is now their toll fort and long
  wall in the gap's Narrows (2026-11-09), a frontier post reached by the Hounds' Road (about 900 km, top 6.0 km) through
  the village of Howl (`biomes/tiers/PLAN.md` sections 6 and 8).
- **The trickster** is a god in the shape of **the runner bird**, who runs the ancient roads (the easter egg: it reads as the
  cartoon Road Runner, drawn as the Outlands' own bird, not a copy). **The god's road** runs from the Sleeping City through the
  Gate to Trickster's House, where **the god lives**: the Coyote Men **shun the ruin** as cursed, and misfortune is a **real
  luck hazard** that grows the longer one stays in its keep-out ring (a `core/tags` area; section 12). **A boy is a man when he
  has caught a runner bird**; the surest place to find one is the road's end. The ruin's **colony is aware** and plays
  **pranks** that are its attempts to talk (section 4, "The House colony"); it is not the luck field's cause, but the
  Coyote Men lay both to the trickster.
- **Colonies are individuals** (*proposed*): the tribes know the colonies on their ground and name them; a well is a
  pleat column or a drum of a named colony, and **water rights are agreements with an organism**. A seam is a natural
  boundary: herders' grazing runs and the tribes' borders follow seams, and the boundary stones stand on them.
- **The phoenix** is the other god: it dies at the end of every age and rises more glorious. Its living form, **the golden
  bird** (an Earth-like great raptor, the owner, 2026-10-26), is wholly sacred: **anyone known to have killed one is attacked on sight**; *proposed* in play: carrying its
  feathers makes every Coyote tribe and the Tierhounds hostile.
- **Feathers**: the runner bird's are sacred and the dearest; the ostrich's are the common export.
- **The trade**: Izani caravans up the gap and through the Gate; emeralds, turquoise and feathers out; grain, metal and cloth
  in; the Tierhounds take the toll, and (*proposed*) enforce the seed law at the wall (section 2).
- **Lore status**: none of this is in `LORE.md` yet (P1).
- **The culture kit** (`kits/coyote`, its own plan later): the Tierhounds' stepped towns and toll fort, the Valley tribe's
  mud-brick villages, the herders' camps, the shrines and milestones, dress, and a people for
  `core/charactermodels/data/peoples.json`. Until then the stations carry walls, terraces, huts and the fort as plain records.

## 7. Fauna (`kits/fauna`)

About 14 species: **8 native, 6 Earth-like**.

| Key | Animal | Kind | Where | Note |
|---|---|---|---|---|
| `plaingrazer` | plains grazing hexapod | native, herds | N1 | on `faWdHex` with the `amb` anatomy (hide, vertebrate eyes, padded feet: not insects) |
| `nurser` | nursery-tender | native | the Nursery Bench (station 5) | keeps the nursery colony's pod towers and brood pads: fed by the colony, it spreads its spores and crops its rivals' forms at the seams |
| `fogdrinker` | fog-drinker | native | S1 | drinks at the veil caps' drip |
| `rockgrazer` | rock-grazer | native | S4 | scrapes lace crust off the copper rock |
| `pandigger` | pan-digger | native | Z6 | digs brine shrimp-analogues from the salt |
| `burrower` | small burrowing hexapod | native | Z4-Z5 | |
| `stalker` | stalker | native, hunter | all | |
| `carrier` | carrion hexapod | native | all | with the bone bloom |
| `ostrich` | **ostrich** | Earth-like, farmed and wild | N1, S2 | ridden by scouts; every part used |
| `runnerbird` | **runner bird** | Earth-like, wild | the roads | the trickster's form; fast biped gait, wing-fan |
| `goat` | goat | Earth-like, kept | everywhere settled | from the farm set |
| `gazelle` | gazelle-like grazer | Earth-like, wild | N1 | its arrival is a P1 lore line |
| `vulture` | vulture | Earth-like, wild | all | |
| `goldbird` | **golden bird** | Earth-like soarer (the owner, 2026-10-26): a great golden raptor | the thermals over S1 and the rim | the phoenix's form; sacred. *Proposed*: the one Earth animal that **crossed the rim on its own wings** (Rüppell's vulture flies at 11 km), so it was in the basin before the people: a sign, to the Coyote Men, that it belongs to the god |

Plus a native small layer (fog moths, glow flies). The ostrich, runner bird and golden bird are new to the fauna kit.

## 8. Crops and resources

- **`kits/crops`**: an `outlands` biome entry. The Valley tribe and the Kingdom grow the existing records that fit (millet,
  sorghum, barley, chickpea, lentil, date, fig, pomegranate, flax); new **native** records for what the tribes tap and gather:
  drum cluster, pod-tower grub-bread, comb-mast gum, grey-cushion fodder. Fields take water from the river, springs or fog
  nets (Yemen and Ifugao terraces in the Tiers).
- **`kits/resources`**: **emerald** and **turquoise** nodes (three grades each) in the gem hills (S4): Muzo-style open-cast
  emerald in dark schist, Persian-style turquoise in pale altered rock. Ostrich feathers are a fauna `HARVEST`, not a node.

## 9. Stations

| # | Station | Site (`SURVEY.md` section 6) | What it shows |
|---|---|---|---|
| 1 | **The Fog Wall** (`dist/outlands.html`; **built** 2026-11-09) | S1 down to S4 (legacy px 1337,393 to 1352,391: Dfb 3.9 km to BWk 2.3 km), on ONE page (the owner, 2026-11-09: "make the slope fit one page"; 4.4x steeper than the model, KNOWN_ISSUES.md) | the slope chosen to test the colony rule first: the fog belt on the wall (veil colonies: veil caps, lantern stalks, fog pelt, and their pleat-column runners on the dry ledges below), the wet band under it (mast colonies: deck caps, curtain weed, cap-shrubs, comb-mast wardens on the seams), the gem shoulder (copper colonies: green fans, drums, turquoise shelves, lace-crust miners on the strata's copper beds and the open-cast pit), the wadis (wadi colonies: ribbon mats, bell pools, stilt-mound runners); seams between unlike types; buttes, the pit, three ravines running on as wadis |
| 2 | **The River** (`-river`) | S2 px 1369,346 (Cfa 2.9 km) down to S3 px 1384,389 (BSh 1.1 km) | the Valley tribe's terraced fields on the perennial river, deck caps on the slopes, pipe reeds, mire pads on the 705 m lake; the Earth-like three |
| 3 | **The Gem Hills** (`-gems`; its shoulder is on station 1) | S4, px 1352,391, BWk 2.3 km | copper-stained mesas and fins, lace crust, turquoise shelves, green fans on spoil, open-cast benches |
| 4 | **The Plains of Runners** (`-plains`) | N1, px 1344,209, BSk 3.7 km | ostrich flocks and grazing hexapods on needle fur and grey cushions, tors and inselbergs, a herders' camp, the salt lake's edge |
| 5 | **The Nursery Bench** (`-nursery`; combined with the gap, 2026-11-09; **this kit owns it**, the Outland Gate kit lists it as its station 5 and reads it in place) | **5.1 px 1558,516** (legacy 1286,186), the rim at 1558,513: 3,960-4,007 m, 0.98 atm, BWk/BSk, 94-109 mm, 6 °C (19/-7) | the old Nursery Plateau's idea on the gap's head: pod towers, brood pads and gall stacks on desert pavement, the `nurser` hexapods; yardangs cut by the gap's night wind (the Outland Bore) and lined up with the gap; at the rim, the 2.2 km scarp down to the gap's upper floor (Cfa, 1,785 m at 1558,500) and the N Outlands' lake 30 km east: the dry nursery over the wet gap, the strangest page |
| 6 | **The Gate** (`-gate`; **moved, 2026-11-09**) | **5.1 px 1438,326**, the gap's Narrows, 1,423 m | now the Outland Gate kit's station 1 ("The Narrows and the Gate"): the long wall, the toll fort and water gate, the shrine, the god's road, on the gap's floor. This kit drops its own Gate page; the old pass (px 1136,84) keeps a cairn and shrine, no page |
| 7 | **Trickster's House** (`-house`) | px 1240,330 | the ruined half-cave arcology over its lake, held by the aware House colony (crust tracing the conduits, glow in the dark shelf, its pranks); the keep-out ring of turned-away stones (*proposed*); the luck hazard |
| 8 | **The Mires** (`-mires`; asked for by the owner, 2026-11-02) | S Outlands, the boreal plateau at 5.1 px ~1605-1625 by 669-762 (legacy ~1333-1353 by 339-432): three flats of 540-1,530 km2 at 3,850-3,930 m, 0.98 atm, 1,130-1,190 mm, +4 to +6 degC (17-19/-7 to -9), Dfb; the wettest flat cold ground on the whole model | the Outlands' **muskeg**: a boreal bog country of sphagnum, sedge and black spruce-like fog-combers (the kit's own at their smallest: the comb mast as a bog pine), string bogs and pool-and-ridge patterns (`KFROST`), palsas with ice cores on the plateau's cold side, peat faces at the streams, the frost puff and mire pad (section 4) at home, the Coyote Men's winter trapping camps (a published site); hazards `sink` (the quaking mire by `move` and `weight`), `cold`, the fog; peat and bog iron as the tribes' fuel and the smiths' ore; the 705 m lake's warm oasis is N3 below, this is the cold one |

Optional later: N3, the 705 m lake shore (a warm oasis page), if station 2 cannot hold it.

**Why the Nursery Bench, and why here** (the owner asked, 2026-11-09: "can we combine the ideas maybe?"). The old N2 site
(5.1 px 1541,460) is now on the gap's floor: 1,719 m, Cfa, 1,552 mm. No bench in the gap's south end is dry (all Cfa,
1,000-1,600 mm). The gap's head is: the tableland south-west of the N Outlands' lake's outlet is the nearest ground left that
matches N2 (3,963 m, 94 mm, 6 °C, against N2's 3,802 m, 31 mm, 8 °C), part of the N basin's largest cold desert (5,524 km² of
BWk and BSk round 1585,544). The gap gives the nursery a wind for its yardangs and a reason for the leak: the hexapods breed
on the dry bench, and the spores they carry ride the Outland Bore down the gap. The Outlands kit owns the page (its flora, its
`nurser`); the Outland Gate kit lists it and draws the floor below as its far field.

## 10. The Tiers (`biomes/tiers`, its own plan)

The owner's decision (2026-10-26): **`tiers` is a biome of its own**, on the `Tiers` biome polygon (px 886-1118 by 52-278;
the same ground as Korona's NE and the Coyote Kingdom). The dry, terraced country of the Tierhounds between Korona's rings
and the Gate: sedesert and ebadlands scrub (read in place) with Outlands species leaking out by the gap (pleat columns and
cap-shrubs in gardens and as stragglers), terraced fields, the stepped towns. It gets its own `PLAN.md` before it is built
(phase O8). **Planned 2026-11-10: `biomes/tiers/PLAN.md`** (the polygon is 5.1 px 1158-1391 by 382-609; the px above are
the older geographic polygon's on the 4.2x canvas). Outlands species grow there in the Kingdom's gardens only.

## 11. Textures

**Reused from the library** (`core/materials/library/`): `ground.steppe`, `ground.puna`, `ground.gravel019`/`042`,
`ground.gravelly_sand`, `ground.shingle` (plains and wadis); `ground.salt`, `ground.efflorescence`, `ground.playa.red`,
`ground.lakebed.shells` (the salt lake); `rock.malachite`, `rock.gossan`, `rock.quartz.vein`, `metal.bronze.verdigris` as a stain
(the gem hills); `ground.clay.popcorn`, `rock.sandstone.bedded.red`, `rock.tuff`, `rock.sandstone.varnish` (the walls);
`rock.basalt.vesicular`/`oxidised`/`flowbanded`, `rock.columnar`, `ground.scoria`, `ground.cinder` (the rim); `ice.clear`,
`ice.glacier`, `ground.tundra`, `ground.turf.polygon`, `ground.snow011` (the plateau and the Gate); `ground.lichen.crust`;
the fungoid sets `organic.cap.porous`/`glossy`/`orange`, `organic.fungus.bracket`, `organic.flesh.cells`, `organic.mossball`,
`ground.mycelium.gold`, `bark.whorled`, `bark.cratered`, `card.fungus.drip`, `card.mushroom.pale`, `card.shelf.glow`;
`card.palm`, `bark.palm`, `bark.bark_willow_02` (the Earth-like three); `earth.adobe`, `earth.banco`, `stone.cut` (records until the culture kit).

**Owed elsewhere, needed here too**: `rock.badland.bedded` (section 9 of the prompts), `ground.salt.ochre` and
`ground.soda.crust` (sections 11, 12), `organic.pod.honeycomb` and `organic.lichen.plates` (section 17).

**New** (13 prompts, `core/materials/PROMPTS-NEEDED.md` section 26): `ground.wadi.cobble`, `ground.pavement.desert`,
`ground.biocrust.fog`, `rock.turquoise.vein`, `rock.schist.emerald`, `ice.lake.saltrim`, `organic.cap.violet`,
`organic.pleat.skin`, `organic.lace.copper`, `card.fogcomber`, `card.outlands.scrub`, `card.outlands.crust`,
`card.outlands.wadi`. For the culture kit, later: a coursed sun-dried brick (not prompted yet).

Adoption: `biomes/outlands/materials.json` and `python3 tools/textures/pack.py biomes/outlands` (commit `tex/`).

## 12. Core amendments needed

Ranked by when they block. Each follows its module's README and lands with its own node test and baseline check.

| # | Amendment | Module | Why | Blocks |
|---|---|---|---|---|
| C1 | **A height-band fog belt** (approved by the owner, 2026-10-26): `ATMOS.fogBelt({y0, y1, windward, density})`, a cloud band that hugs the slope between two heights, thicker to windward, thinning where the ground rises through it, with a JS twin (`fogAt(x, y, z)`) and an export record. Today `cloudDeck` is a level top and the old mist edge was host code | `core/atmos` | the fog belt is the Fog Rim's defining feature; the fog field also places the veil caps | station 1 |
| C2 | **A shared fungoid geometry fragment** (the owner, 2026-10-26: **in `core/biome`**): `core/biome/33-core-fungoid.js`, opt-in through `CORE_BIOME`, extending `BIO` as `BIO.fung`: `cap` (disc, dome, funnel; gills or pores underneath), `bracket` (shelf rows on a trunk or rock), `bladder` (a lathe body with pleats, swell as a parameter), `pod` and `podCluster`, `stalk` (tapered, bent, ribbed), `fringe` (hanging thread cards), `comb` (paired plates up a mast), `tube` (clusters, open tips, an emissive rim option) and `crust` (flat lobed decals on ground or rock). Each part takes a record (sizes, counts, colours) and a `KRAND` stream, never draw order; defaults as `x == null ? d : x`; geometry goes into the kit's families through the existing `leafMat`/`barkMat` path so instancing, LOD and the export are unchanged. A node test (`test-fungoid.js`: same record and seed, same vertices; counts per part). Today each kit copies its own (`bracket()` in swbay, nwbay, rift and hyperjungle; the Throne's `cap`/`capTube`/`bladders`; swbay's `capTop`; nhighlands' `discStalks`): **those kits are not moved by this step** (their pages would change); they are rebuilt on it in the coming final biome rebuild (`TODO.md`, "With the final biome rebuild"), each page checked and its baseline rewritten on purpose | `core/biome` | 34 species of one lineage; the SW highlands and the swbay backfill need the same parts | station 1 |
| C3 | **Strata into core** (`core/terrain/STRATA-PLAN.md`, step 1 then recipes) with an **`outland` recipe**: red vesicular basalt caps over pale tuffs and red beds, thin green and turquoise copper bands, white altered zones | `core/terrain` | the basin walls, the gem hills, Trickster's wall; and plants placed by bed (`S.at`) | stations 1, 3, 7 |
| C4 | **Dry relief forms**: `KRELIEF.wadi` (a dry `river`: braided cobble floor, cut banks, a fan at the mouth), `talus` aprons (Korona's `talusH` lifted), `KSTACKS` kinds `dome` and `tor`, `KRELIEF.pit` (stepped benches and spoil heaps), and a `pavement` class in `KFIELD`'s cover grid | `core/terrain` | the plains, the gem hills, every wall's foot | stations 3, 4, 5 |
| C5 | **Brine and pans**: a brine colour preset for `WATER.open`/`still` (deep red-brown to turquoise to white rim), and a **pan** kind (salt crust with polygon cracks, wet after rain from `W.wet`) | `core/water` | the salt lake | station 4 |
| C6 | **Hazard and taboo keys** in the tags vocabulary (`core/tags/PROPOSAL.md`, "A hazard key"): a `hazard` record (kind `luck`, strength by time inside) and a `taboo` area (no faction record draws inside) | `core/tags` | Trickster's House's keep-out ring and its luck hazard; mine pits; brine | station 7 |
| C7 | *Later*: **an ice kind** in `core/water` (frozen lakes with salt rims, snow drifts on the ice); until then the plateau lakes are ground cover | `core/water` | the plateau | station 6 (optional) |

**Kit additions, not core**: `kits/fauna` (the ostrich, the runner bird, the golden bird, the eight hexapods), `kits/resources`
(emerald and turquoise nodes), `kits/crops` (the `outlands` entry and four native records). **The colony pass** (section 4:
colony records, the weighted Voronoi of territories, the `seam` cover class, placement by role) is kit code on `core/rand`,
`core/space`, `core/tags` and `KFIELD`'s cover grid: no other kit is colonial, so it stays in the kit; a node test
(`test-colony.js`: the same seeds give the same territories, seams and forms; every form inside its colony's territory;
wardens only on seams; no two colonies overlap).
The `seam` cover tries `ground.lichen.crust` darkened first; if it does not read as a zone line, a prompt goes into
`core/materials/PROMPTS-NEEDED.md`.

## 13. Core adoption (written first, as the working rules ask)

Start from **`biomes/ebadlands`** (its species, floor and dress fragments) and **`biomes/korona`** (the station build:
`build.py --station`, `station.json` with `out`, `core`, `kits`, `packs`). Take:

- `core/biome` (`BIO.init` with `terrainH`, the fields and tags; `BIO.kit`/`kitEnd`; `BIO.scatter`, `BIO.clearOf`,
  `BIO.register`, `BIO.bake`, `BIO.export`), with C2's `BIO.fung` parts (`33-core-fungoid.js` in `CORE_BIOME`);
- `core/rand` (`KRAND.stream`, `hash`, `cell`) for every draw; `core/mask` (`KMASK.canvas`) for every painted raster;
- `core/tags` (`KTAGS.create`) for every plant, rock, zone and hazard; `core/space` (`KSPACE`) under the scatter;
- `core/terrain`: `KFIELD`, `KCARVE` (the shelf), `KSTACKS`, `KRELIEF`, `KBASIN`, and C3-C4;
- `core/water` (`WATER.open`, `flow`, `still`, `spring`, `wet`) with C5; `core/atmos` (`ATMOS.weather`, `cloudDeck`, C1's belt);
- `core/host` (`KHOST.take`, `khost.SHELL` + the polygon tool); the shared sky.

Write no PRNG, noise, `getImageData`, water shader or sky dome. `tools/check_core_use.py` must pass (a biome names `biome`,
`rand`, `tags`, `host`, `atmos`, `water`). Fragments are tagged in `PORT.md`; data fragments stay free of the browser.

## 14. Order of work

| Phase | What | Done when |
|---|---|---|
| **O0** | P0 survey (done); this plan approved; markers on the model (done) | the owner's yes |
| **O1** | **Lore**: `LORE.md` §6 entry (the Coyote Men, the Hum dialect, the four tribes, the Tierhounds and their kingdom, the two gods, the Gate, the god's road, Trickster's House, the trade); `biomes/README.md`, `WORLD.md`, `INDEX.md` rows | the owner approves the names |
| **O2** | **Textures**: the 13 new sets and the five owed ones delivered and processed; `materials.json`; `pack.py` | the contact sheet passes in the demo kit |
| **O3** | **Core amendments C1 and C2** (fog belt; fungoid parts), each with its node test; `port_baseline.py` reads `same` for every build that did not ask to move | tests pass |
| **O4** | **Station 1, the Fog Wall** (built 2026-11-09, on the slope from the Fog Rim to the Gem Hills' shoulder) (the owner's reference images arrive at build time, into `refs/`, before each station's flora): the kit's fields and zones, the S wall, the fog belt, the fog-wood species, seeps | `verify.py --assert`, `check_core_use.py` |
| **O5** | **C3, C4**; **stations 3, 4, 5** (gem hills, plains, nursery); the fauna and resource additions | each verified |
| **O6** | **C5**; **station 2, the River** (fields as records, the Earth-like three, the lake) | verified |
| **O7** | **C6**; **station 7, Trickster's House** (with `kits/ancients`' Arcoindian II); the Gate is the Outland Gate kit's station 1 now (2026-11-09) | verified |
| **O8** | `biomes/tiers` plan and build; `kits/coyote` plan | the owner's yes on each |
| **O9** | `PORT.md`, index tools, the Godot export check, the gallery (the owner allows once) | published |

## 15. Open questions

1. ~~C2's home~~ Settled (the owner, 2026-10-26): a `core/biome` fragment, `33-core-fungoid.js` (section 12).
2. ~~The fog belt~~ Approved as a `core/atmos` amendment (the owner, 2026-10-26).
3. ~~Reference plates~~ The owner gives reference images at build time.
4. **Gem ranges**: emerald and turquoise both in the S gem hills (this plan), or emerald in the N?
5. ~~The golden bird~~ Earth-like (the owner, 2026-10-26): a great golden raptor.
6. **Names still open**: the Kingdom's capital, the pass's own name (beyond "the Gate"), the rivers and lakes in Coyote speech.
7. ~~**Station count**: seven, or fold the Gate into the Tiers' build?~~ The Gate moved into the gap (the owner, 2026-11-09)
   and is the Outland Gate kit's page; this kit keeps seven (1-5, 7, 8), station 5 now the Nursery Bench.
8. ~~Colonial flora~~ Settled (the owner, 2026-11-09): the native flora is colonial, **Outlands only**; **the seams are a
   feature**; **the fourth role is fixed by colony type** (section 4).
9. ~~The House colony~~ Settled (the owner, 2026-11-09): aware after a fashion through the Ancients' technology; not the
   luck field's cause; the source of some of the pranks, as attempts to communicate. Open: what the luck field's cause is,
   and whether the colony can learn to answer.
10. **The isolation** (section 2, 2026-11-09): which of the four (the climate wall at the gap's head, the outbound wind, the
   gap's youth, the fort's seed law) carry the island rule? The plan uses all four. The owner's word the same day (section 1,
   "Isolation by distance and hostility, not a wall") already settles the frame; the four are read as how the gap filters.
11. **The Nursery Bench**: confirm the site (5.1 px 1558,516) and that this kit owns it.
12. **The old pass** (px 1136,84): a pilgrims' cairn and shrine, or nothing?

## Core changes to take (reconciled 2026-10-27)

Since this plan was written, core gained the cards on their geometry, hanging strands, confluences, tall falls, KLAVA,
`KSTACKS.contour`, cave mouths and snow that lies (`BACKPORT.md` section 5, with each module's "Adopting it" lines). Every
turn takes the universal ones (the card fit by `check_cells.py --fix`, strands with a top base). For this kit:

- `KSTACKS.contour` for the stacks; **confluences** and **tall falls** where the fog belt's streams meet and drop.
