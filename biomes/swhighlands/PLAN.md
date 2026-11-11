# swhighlands: the plan (draft, 2026-10-26)

The **south-western highlands**: the Inner Wall's south-west sector, between the Valley of the Ancients and the Ring
Sea. A tilted block: a long, very wet western ramp, a crest at 6-6.5 km, and a 4 km scarp down to the Ring Sea in the
rain shadow. Its theme is **native life**: the fungoid lineage of the south-western bay (`biomes/swbay`: cap-trees,
bracket trees, coral fungus) climbing out of the bay and adapted to folds, cloud, landslides and cold, with almost
nothing from Earth in it. Where the Iron Republic's farms reach in from the north, the contrast is the point.

Owner's brief (2026-10-26): the landforms of the proposal (agreed "on all counts"): the ring folds, the rain wall and
the landslide lake, the sandstone tableland at Span, its pillar rim (the painting, `refs/01`), and the fan coast; the
Ring Sea's level has not changed, so **no raised reef terraces**. The flora is alien and fungoid, the native highland
counterpart of the bay; the references are in `refs/`. Some of it is backfilled into the bay (`biomes/swbay/PLAN-FLORA.md`).

**Status: station 1 built (2026-10-26, branch `claude/swhighlands-s1-04f512`)** on the owner's go-ahead for station 1; the plan's
open questions stay open (section 10, and the station's own in `KNOWN_ISSUES.md`). Stations 2-5 are not built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/swhighlands/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations: `dist/swhighlands.html` (station 1) and `-rainwall`, `-span`, `-pillars`, `-coast` (section 7) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, strata), the shared sky |
| Read in place | `biomes/swbay` (cap-tree, bracket tree, coral fungus at the bay's edge and in the low coves); `biomes/swlowlands` (four species, one derived: section 3); `biomes/riftrim` or `biomes/nhighlands` for the crest's fellfield; `biomes/ehighlands` for the glass tower; nothing copied |
| Its own flora | section 3 |
| Object | `SWHI` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract; its species are read by key from `biomes/swbay` for the backfill |
| Out of scope | Span's ruin and Dalab's outpost (a settlement plan); the Iron Republic's farms (the Republic's builds); the scarp's foot and the coast below it (the Vothic coast's kit, an ecotone) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## Core adoption (written before the first fragment, 2026-10-26)

Started from `biomes/nhighlands` (the final rebuild's worked example of the full adoption) and `biomes/abyssal-savannah` (the
newest station-1 kit). The modules station 1 takes, by name, and for each it does not, why:

| Module | Takes | For |
|---|---|---|
| `core/biome` | `10-core-head`, `20-core-kit` (`BIO.INDEX_ITEMS`, `BIO.LOD.merge`/`minTris`/`fade`/`cull`), `30-core-foliage` (ground tint, A2C, back-light, the one wind), `31b-core-leafset`, `33-core-fungoid` (`BIO.fung`: every cap, stalk, pod and tube), `34-core-impostor` (the far trees past 800 m, `BIO.impostorLook` measured), `40-core-place`, `42`/`43-core-export(-host)`, `44-core-stage` | the kit: every species on the core's builders and items |
| `core/rand` | `KRAND` | every field, every placement cell (`KRAND.hash(world, ix, iz, salt)`), every noise; nothing from `BIO.fn`'s sin hash or its stream |
| `core/tags` | `50`, `52`, `53` | every item set, instance and volume a record (`BIO.init({tags})`) |
| `core/space` | `KSPACE` | the keep-clear between trees and the nearest-segment index of the water courses |
| `core/terrain` | `35-core-strata` + host shade (`ringfold`, the folds folded along the crest, `sharp` .85 for the chevron), `36-core-carve` (the river cave's mouth), `37-core-stacks` (`arch` on the ridge, the three natural bridges over the gorge), `38-core-relief` (`range` for the ridges, `gap` for the water gap and the wind gap under the arch, `river` for the levels, `fields` for the farm), `43-core-ground` (`KGROUND` library layers), `44-core-farfield` + draw (`KFAR`), `45-core-horizon` + shade (`KHORIZON`) | the ground, the rock, the far country, the terrain's shadows |
| `core/atmos` | the core, presets, export, waves, skylight, `bindHost`, the shared sky (`skyBiome`), `bindWeather`, height fog, rain cover | the sky, the light, the fog in the folds, the weather |
| `core/water` | flow, shore, fall, still, draw, kinds | the river through the gap, the cave stream, the gorge stream and its falls, the sink pool; wet ground and puddles (`WATER.hollows`) |
| `core/host` | `FULL` (camera, loop, clock, panel, probe, inspector, marks, pictures, minimap, editor) | the page shell |
| `core/materials` | `record` (`KMAT`) and the generated pack (`materials.json`, `tools/textures/pack.py`) | every library set (section 8) |
| `core/export` | `07`, `09` | the krator-world container |

Not taken: `core/mask` (nothing is placed from a canvas; every placement reads the fields and `KRAND`), `core/city`, `core/hamlet`,
`core/simulation`, `core/furnish` (no settlement here: the Republic's farm is its builds', section 0), `core/lod` (the biome core's
runtime LOD covers it), `KCAVERN` (the cave is a mouth only at station 1: the passage through the ridge is not walked, so a
carve patch is enough; `KNOWN_ISSUES.md`), `33b-core-bamboo`, `38-core-fire`, `39-core-lean`, `core/hazard` (nothing at
station 1 burns, leans or harms), the season (`BIO.SEASON`: one season shown; a later pass). `kits/crops`: the farm is drawn
as fields and walls only, its crops left to the Republic's builds (section 0, and an open question).

**The treeline station** (station 6, 2026-10-27) takes the same modules (it is built from the same `build.py` with `--station
treeline`), less `36-core-carve` and `37-core-stacks` in use (no cave, no bodies; the fragments stay listed), and `core/water` for
wet ground and puddles only (no running water: the owner's brief). It adds `biomes/ehighlands` read in place (the glass tower, by
its one-plant API `EHIGH.make`/`grow`) and KGROUND's `clast` layer kind for the fellfield. Strata: formations `ringfold` under
`megabreccia` (`crest`).

**The pillar rim** (station 4, 2026-10-27) takes the same modules (`--station pillars`), with core/terrain's `KRELIEF.joints` and
`KRELIEF.tableland` (the table, its slots and its cliff in one height function), `KSTACKS.pillars` (the towers from the same joints
and zone), the opt-in companion `37b-core-stacks-contour.js` (`KSTACKS.contour`: listed for this station only, so no other page
moves) and `KSTACKS.weather`; KSTRATA's `pillar` recipe laid level; `core/water` for Pan Riba (`WATER.flow` on `KRELIEF.meander`).
**It is the biome only** (the owner, 2026-10-27: Span the asset, Span the settlement and station 4 the biome strictly apart): it
reads nothing of `settlements/span` and draws nothing of it. What a settlement may build on it publishes as plain data
(`SWHI_PILLARS_SITE`, the page's `site` exporter: BIOME-API.md "Station 4's site"); it holds the watch pillar's top bare for one.

## 1. The ground (scale model 4.22, surveyed 2026-10-26)

93,816 km² (px 236-414 by 528-756), inside the Inner Crater polygon.

| Band | km² | Air | Rain | Mean (warm/cold) | Class |
|---|---|---|---|---|---|
| 1-2 km | 11.6k | 1.33 atm | 1,300 mm | +16 °C (27/6) | Cfa, Csa |
| 2-3 km | 21.1k | 1.17 | 1,180 | +12 (24/0) | Cfa, Dsb, Csb |
| 3-4 km | 25.9k | 1.03 | 816 | +6 (19/-7) | Dsb, Dfb, Csb |
| 4-5 km | 18.1k | 0.91 | 518 | 0 (13/-13) | Dsc, Dsb, ET |
| 5-6 km | 11.4k | 0.80 | 361 | -6 | ET, Dsc |
| 6-7 km | 5.1k | 0.71 | 298 | -10 | ET |

- **The shape**: a ramp rising east from 1.3 km to the crest at 6-6.5 km near the east side; off the crest a **4 km
  scarp** to the Ring Sea (at y=620, from 4.1 km to sea level in ~8 km). The scarp's face and the coast lie just
  outside the polygon.
- **The rain wall**: the west wind off the Ancient's Valley lake drops **2,600-4,000 mm at about 2 km** on the ramp
  (px ~255-270 by 600-670). Behind the crest the east face gets 370-540 mm.
- **The south**: a calmer plateau at 2.3-3.5 km (Csb, Cfb, Dsb, 600-1,800 mm) breaking down to ~1-1.5 km toward the
  Ancient's Valley and the Ruins of Nazar on its west and south rims (px ~280-300 by 680-740).
- **Water**: the big rivers run west into the Ancient's Valley lake (17 m): **Kaskejt Rivr** (the Cascade river, 760
  m³/s), Ancient's Valley river 2 (604), river 3 (268), an unnamed river (308), and dozens of streams; **Pan Riba** (the
  Span river, 153 m³/s) to the south-western lowlands; east to the Ring Sea the Drum river (75) and **Volz Chhim** (the
  falls stream, 39). **One lake: 48 km² at 2,878 m, 281 m deep**, a through lake (px 278,629).
- **People**: **Span** (ruined arcology, px 282,680, 2,534 m, 1,819 mm, +11 °C; in Pan Riba's canyon, section 6), Dalab's outpost against the machines and
  mutants of the Ancient's Valley (`LORE.md` §6.1). The Iron Republic overlaps 14,000 km² in the north; Drum (Vothic)
  stands on the coast below the scarp; the Ruins of Nazar on the south.
- **Neighbours**: the south-western lowlands and the Ancient's Valley (west), the south-western bay (south), the
  northern highlands (north), the crater drylands, the Ring Sea coast (east).

## 2. Air and the rock

1.0-1.3 atm on most of the ramp: breathable for anyone, a little thick at the foot. Krator stands near 40°S, so the
**shaded slopes face south**.

**The rock**, three recipes for `core/terrain/STRATA-PLAN.md` (added there on approval):

| Recipe | Beds | Effects | For |
|---|---|---|---|
| `pillar` | thick quartz sandstone (5-40 m), **iron-red beds alternating with bleached white ones**, crossed by diagonal **Liesegang bands** (iron rings that soaked through after burial), thin soft partings | vertical joints that open into slots and pillars; hard ledges; little varnish in the wet | Span's tableland and its pillar rim |
| `ringfold` | the folds' alternation: hard sandstone and limestone ridges, soft shales in the valleys; **opal-shell limestone** in some ridges (beds of iridescent shells, Krator's ammolite, rainbow-banded where a fold bends them); **deep-red beds** (iron rusts further under Krator's denser air) | folds (an axis parallel to the crest), arches where a hard bed is breached, fluted pinnacles where the limestone meets the rain wall | the ring folds, the rain wall |
| `crest` | the Inner Wall's core: the crater's patchwork rock (`megabreccia`, `biomes/godthrone/PLAN.md` section 3) | frost-shattered, no varnish | the crest and the scarp's top |

**Low gravity** (0.75 g) lets a rock column stand about a third taller before it fails: the pillar rim's towers reach
250-300 m.

## 3. The flora: native, fungoid, the bay's kin

**The rule that keeps it plausible**: the big fungoid forms carry a **photosynthetic partner** in their caps, pads and
crowns, as a lichen does, so they are green, teal and violet on top and fleshy underneath. True decomposers, the
mushroom-like ones, keep to logs, landslide scars, the floor and the ruins. Native life here owes nothing to Earth's
plants; the Iron Republic's crops and pastures in the north are the only Earth flora.

Working names. `refs/NN` is the reference.

### Trees

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Lattice oak** | 04 | the coves (station 1) | the cove canopy, 25-40 m: a trunk of braided cords with gaps right through it, its branches ending in green cup-pads, each holding small blue parasol fruits |
| **Pillar cap** | 15, 16 | the balds, alone on the crests | a cap-tree on three to six leaning pillars, a magenta or violet cap, green bulb fruits; each bald is the clearing under one cap. The bay's cap-tree's cold kin |
| **Bead cone** | 14 | the coves' understorey | a spongy cone-topped tree-mushroom, 8-15 m, hung with strings of gold eggs (an insect's nursery) |
| **Stilt pod tree** | 02 | landslide scars (station 2) | the pioneer: stilt roots straddling moving debris, a honeycombed green spore-pod crown in a collar of tentacles |
| **Shelf coral** | 07 | fresh boulders, the lake's dam | stacked orange brackets on rock-eating roots that feed from the stone; first onto new rock |
| **Weeping wisp** | 08 | the rain wall | long violet strands hanging from the branches, their nodes glowing faintly in the cloud at night |
| **Fishing bridge** | 13 | over streams, the lake's outlet seeps | a meat-eating tree rooted on both banks, its arch over the water hung with sticky vines that catch fish; a set piece |
| **Anemone tree** | 03 | pagoda rocks, the pillars' tops (stations 3, 4) | stone-clasping roots and a crown of teal tentacles: the tufts on the towers in `refs/01` |
| **Whorl column** | 11 | 3.5-5 km, the treeline | stacked whorls of teal bristles: the native stand-in for a conifer |
| **Bottle brush** | 10 | 3.5-5 km, the dry-summer woods (Dsb, Dsc) | a swollen water-storing trunk under a blue-green bristle crown |

### Shrubs, herbs and the floor

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Bulb heath** | 09, 19 | the balds | clumps of swollen blue-grey water-storing bulbs with eyespot pores, pink and orange flowers; a variant with blue droplet antennae |
| **Banded coral** | 17 | the balds | a pink-and-black banded succulent coral shrub |
| **Bead coral** | 20 (D) | the balds, the tableland | magenta branching arms beaded white over a dark central sphere |
| **Log crust** | 12, 19 | fallen trees, scars | teal-and-gold lichen plates, blue-and-yellow fans and orange shelf fungi smothering the logs: the decay layer |
| **Glow tubes** | 19 | the rain wall's floor | clusters of grey tubes lit orange at the tips, the forest's night lights |
| **Bearded triplets** | 20 (B) | the rain wall's understorey | broad teal-violet bracts with yellow crowns and long trailing whiskers |
| **Cell lamp** | 18 | the hanging swamps' seep pools | a hand-shaped plant of yellow cells; the gold spheres floating round it are its offspring |
| **Wing reed** | 03, 08 | the hanging swamps | dark stalks with patterned wing-shaped leaves, in stands |
| **Bulb trumpets** | 20 (E), 19 | the hanging swamps | purple spotted trumpets on red bulbs, and a dark hooked pitcher: the swamps' meat-eaters |
| **Torch spike** | 03, 08 | the tableland | red flower spikes, the tableland's spring colour |
| **Glass tower** | 05 | 5-6.5 km, the wet west face | read in place from `biomes/ehighlands` (`glasstower`, the noble rhubarb's habit): a spire of translucent bracts that keeps its flowers warm; not a new species |
| **Glass leaf** | 19 | 4-5.5 km | twisted translucent blue-green leaves, frost-proof |

### Epiphytes and on structures

| Species | Ref | Where | What it is |
|---|---|---|---|
| **Blue-berry bract** | 19 | on every bole in the rain wall | a hanging bract of blue berries |
| **Drop-fruit** | 19 | on branches | a green-fruited epiphyte dripping yellow drops |
| **Drip cap** | 19 | on structures (the dress pass) | an orange cap that grows on posts, piers and ruins and drips: Span's ruin and Nazar's |

### The dry east scarp (the rain shadow, ~400 mm)

| Species | Ref | What it is |
|---|---|---|
| **Star-fruit caudex** | 06 | a squat swollen stem with spiky star fruit, on ledges |
| **Arrowheads** | 20 (C) | aloe-like spears, yellow-green, with orange flower skirts |
| **Coral melon** | 20 (A) | red coral arms carrying green melons |
| **Frill tubes**, **trumpet slug**, **flame pods** | 03, 19 | green tube succulents with pink frills; an orange trumpet-mouthed plant; orange flame-shaped pods |

### From the south-western lowlands (the owner, 2026-10-26)

The lowlands are a neighbour, so a few of their species come up the ramp, read in place from `biomes/swlowlands` by key.
A **derived** species is the source kit's builder called with this kit's habit and palette (an option to its
`treeAt`), never a copy of its code.

| Species | From | Where | What it is here |
|---|---|---|---|
| **Sprawl cap** (derived) | the sprawl oak | the ramp's foot (1.3-2 km, Cfa), where the lowlands meet | the sprawl oak's long resting limbs, red-barked, carrying fungoid pads and small caps instead of a leafy crown: the lowland habit gone native |
| **Tier cedar** | as it is | Span's tableland and the dry side (2.5-3.5 km, Csb, Dsb) | the lowlands' upland cedar, here in its own country |
| **Flayed madrone** | as it is | the tableland's sunny (north-facing) slopes, Csb | red flakes over green-white |
| **Ember manzanita** | as it is | the dry east scarp and the tableland's dry ridges | the chaparral's red, glossy, char-streaked scrub |

The other way, the highlands give the lowlands four species in the lowlands' own theme (red, wide, branching):
`biomes/swlowlands/PLAN-FLORA.md`.

Unused for now: the mossy arch tree and the thorny log with blue eggs (`refs/08`), either a candidate for the rain wall.

## 4. Landforms (`core/terrain`)

- **The ring folds**: long even ridges parallel to the crest, 10-20 km apart, soft valleys between; the westward rivers
  cut **water gaps** through the ridges and leave **wind gaps** where a stream was captured; trellised drainage; **arches**
  where a hard bed is breached on a ridge (`refs/24`); coves in the hollows, balds on the crests. Earth's ridge-and-valley
  country, here the crater ring's own compression, like the Moon's wrinkle ridges folded hard.
  - **The folds laid bare**: where a stream cuts a ridge's nose, the beds show bent into a tight chevron round a cave
    mouth, under grass and mist (`refs/26`).
  - **Karst in the limestone ridges**: a river that goes *through* a ridge in a **cave** instead of a gap, its roof
    holed by skylights (`refs/30`); a gorge where a stream falls **through a chain of natural bridges** into a sinkhole
    (`refs/28`, `refs/29`); **karst springs** where the ridges' water comes out, gin-clear rivers combed by long green
    weed (`refs/35`).
  - **The Cascade river**: gin-clear green water over smooth, banded, water-polished rock, deep pools between boulders,
    an old arched bridge (`refs/36`-`38`).
- **The rain wall**: slopes failing constantly as in Taiwan and Nepal: fresh scars, debris-flow chutes, forest at every
  stage of regrowth; **fluted pinnacles** where the ridges' limestone meets 4 m of rain (`refs/22`); **potholes** and
  polished rock in the Cascade river's bed (`refs/25`).
- **The landslide lake**: the model's lake (48 km², 2,878 m, 281 m deep) is dammed by a **rock avalanche**, as Sarez is:
  a hummocky dam that seeps rather than spills, the old valley's drowned trees standing in the water, the scar on the
  mountain above. Where the seep finds the dam's face it comes out as a **thread of falls hundreds of metres high**
  below the hanging lake (`refs/34`).
- **Span's tableland**: cliff-ringed canyons in `pillar` sandstone, **slot canyons**, **hanging swamps** on the seepage
  ledges, **pagoda and beehive domes** banded by iron and crust (`refs/21`); **twin falls** where Pan Riba and its fellows
  leave the tableland (`refs/23`), and Pan Riba's own **plunge fall** off the rim into a forested gorge (`refs/33`,
  Kaieteur); **potholes** in the slot canyons' floors (`refs/39`).
- **The pillar rim** (`refs/01`): where the tableland breaks down on its west and south, rain has widened the joints into
  **free-standing towers** 250-300 m tall, red and white with diagonal Liesegang bands, mist round their tops, a green
  floor and a meandering stream between them. One tower carries a **post on its flat top**, reached by a stair cut up
  its side through the cloud forest (`refs/27`): Dalab's watch on the Valley, near Span.
- **The fan coast**: the dry 4 km scarp's wadis build **steep fan deltas** straight into the Ring Sea (the Gulf of Corinth,
  the Gulf of Aqaba). No raised reefs: the Ring Sea's level has not changed. Where the scarp's thin-bedded rock meets
  the sea, **sea arches** and caves along a sand beach (`refs/31`), and the folds' steep thin beds planed off by the waves
  into **flysch platforms**: ribs of hard rock running out to sea, mossed and weeded between the tides (`refs/32`).
- **The crest**: cirques and fellfield, read from `riftrim` or `nhighlands`.

**The owner's rock references (2026-10-27, pasted into the session; not yet saved under `refs/`: drop them in as 41-47):**
41 a natural bridge in forest (Kentucky's): a thick lintel with blocks and a soffit undercut, legs of varnished sandstone,
moss and rhododendron to the rock; 42 Delicate Arch: a free-standing arch on a slickrock bench, its legs pinched at the waist;
43 a thin span over a desert of fins (Valley of Fire): cross-bedded, honeycombed rock; 44 a gorge in banded iron (Karijini):
stepped ledges in thin red beds, a stair of falls into a green pool, spinifex on the rim; 45 and 46 Canyon de Chelly: a green
floor with a braided stream and cottonwoods between sheer varnished walls, a fin standing free, Spider Rock's twin spire;
47 a hoodoo (Bisti's): a soft column carved into flutes and windows under a hard caprock.
Where they go: 41-43 station 1's arch and bridges (thinner, pinched legs; an undercut soffit; the `KSTACKS.arch` form wants a
softer eroded shape, LESSONS.md "Suggestions for core" 9); 44 station 2 and 3's gorges and slot canyons; 45-46 station 4 (done
2026-10-27: fins and spires, talus at their feet, desert varnish, the bands softened toward one orange-red); 47 station 3's
tableland hoodoos (a caprock form for `KSTACKS`, owed).

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. Where the native forest meets Earth's

In the north, where the Iron Republic's polygon overlaps (14,000 km²), its farms, pastures and orchards push into the
native forest: cleared coves, stone walls, Earth crops beside lattice oaks. The bay's species come in at the south-west
edge (the bay's cap-trees and bracket trees in the low coves). The fan coast meets the Vothic coast's flora at the
scarp's foot.

## 6. The people's side

- **Span** (the owner, 2026-10-26; `refs/40`): the Ancient arcology **stands in a canyon**: **Pan Riba's canyon**
  through the tableland, at or near the model's marker. On 4.22 the river runs 2 km from the marker (px 282,679), its bed
  at ~2,416 m and ~42 m³/s there, in a valley only ~250 m under its shoulders at the model's 2 km a pixel; the kit carves
  the real canyon (`core/terrain` carve), a few hundred metres deep in `pillar` sandstone. As the concept shows: white
  curved terraces and ring-walled domes built along both rims and **down into the canyon**, its floors stepping down the
  walls to hangars and works on the canyon's bottom; round landing pads on the rims; bridges spanning the gap (the
  name); a lake upstream, on the tableland, with outlying ring-walled sites by it. Now a wreck: the white panels
  tarnished and overgrown (the drip cap, log crust and anemone trees on it), Dalab's outpost in the sound parts, holding
  the line against the Ancient's Valley's machines and mutants. The arcology is its settlement plan's (on `kits/ancients`);
  this kit carves the canyon, makes the lake and dresses the ruin.
- **The Iron Republic's** northern farms; **Drum** on the coast below the scarp.
- *Proposed*: Dalab's genepriests prize the shelf coral (it eats rock: an ore-finder) and the fishing bridge's venom;
  the cell lamp's spheres are a lowland delicacy.

## 7. Stations

1. **The ring folds** (`dist/swhighlands.html`, ~2-3 km, Cfa and Dfb): a ridge with an arch, a water gap, a cove of
   lattice oaks and bead cones, a bald under one pillar cap with bulb heath and banded coral; the Republic's last farm in
   the distance. In the next ridge, the river cave and the chevron fold over its mouth; the falls through the natural
   bridges a short walk up the gorge.
2. **The rain wall and the landslide lake** (`-rainwall`, ~2-2.9 km, in cloud): the lake behind its hummocky dam, drowned
   trees, a fresh scar with stilt pod trees and shelf coral, weeping wisps, glow tubes and bearded triplets, a fishing
   bridge over the outlet seep, fluted pinnacles on the ridge above.
3. **Span's tableland** (`-span`, ~2.5-3 km): slot canyons, a hanging swamp with cell lamps, wing reeds and bulb
   trumpets, beehive domes, torch spikes, the twin falls at the rim; **Span's canyon** with the arcology's ruin down its
   walls and across it, the lake upstream.
4. **The pillar rim** (`-pillars`, the tableland's south-west edge, ~2.3-2.6 km): the painting: red and white towers in mist,
   anemone trees on their tops, the green floor and Pan Riba's meanders. Built 2026-10-27 (`stations/pillars/`): a 3.2 km map,
   the table's top 270 m over the floor, its cliff wandering east-west, 40 towers in a 430 m band beyond it (the joints 64-130 m
   apart, two blocks in five standing), the watch pillar (62 x 60 m, made whole, its top flat and held for a settlement's post:
   Dalab's, placed by `settlements/span` from the station's published site, never by the station).
6. **The treeline** (`-treeline`, ~3.4-4.9 km, Dsb and Dsc; the owner, 2026-10-27: a station with no running water, the native
   forest in its second climate): the upper ramp's dry-summer woods under the crest. Bottle brushes on the sunny (north-facing)
   spurs, whorl columns in the shaded (south-facing) hollows and up to the treeline at ~4.3 km, glass leaf among the last trees and
   on the open ground above, the fellfield of the crest's shattered `crest` rock (megabreccia) toward a cirque's headwall at ~4.9 km,
   with glass towers (`biomes/ehighlands`, read in place) on its scree. Snow lies in the cirque's shade. Puddles after rain only.
   Station 1's rules carry over (KRAND by cell, KFIELD ground, impostors past 800 m); the cirque is the kit's own bowl on the field
   (no core cirque form yet).
5. **The fan coast** (`-coast`, optional, the ecotone): the dry scarp with the star-fruit caudex, arrowheads and coral
   melons, a fan delta into the Ring Sea, sea arches along a beach, Drum's lights along the shore.

## 8. Textures

Read the library first (`core/materials/PLAN.md`): sandstone and bedded red sets, `rock.limestone.karst`,
`rock.sandstone.navajo`, `ground.needles`, mossy ground and the bay's cap and gill textures (read in place).

To source or generate (generic ids): a red-and-white banded quartz sandstone with Liesegang bands; an opal-shell
limestone (iridescent shell bed); braided-cord bark (the lattice oak); a honeycomb spore-pod surface; teal-and-gold
lichen plates; cards for
the bulb heath, wing reed, bearded triplets and the dry scarp's succulents. The prompts: `core/materials/PROMPTS-NEEDED.md`
section 22 (2026-10-26), which also lists the library sets reused.

## 9. Order of work

- **H0.** The owner approves the plan; the texture prompts; the station sites chosen from the model.
- **H1.** The kit on the biome core: fields (wet, cloud, scar age, fold phase, tableland), zones; station 1's ground.
- **H2.** The strata recipes `pillar` and `ringfold` (after `core/terrain/STRATA-PLAN.md` S1-S3); the folds, gaps and
  arches; the tableland, slots and pillars (`core/terrain` relief and carve).
- **H3.** The trees (lattice oak, pillar cap, bead cone, stilt pod tree, shelf coral, weeping wisp, anemone tree,
  whorl column, bottle brush; the fishing bridge as an opt-in hero).
- **H4.** The floor and epiphytes; the hanging swamps.
- **H5.** Stations 2-5; the landslide lake; the fan coast.
- **H6.** `verify.py --assert`, `PORT.md`, the index tools, `tools/check_core_use.py`, the gallery.
- **H7.** The bay's backfill (`biomes/swbay/PLAN-FLORA.md`).

## 10. Open questions

- Names: the owner's or Dalab's for the native species (Dalab knows this country best).
- How far the Iron Republic's farms reach in, and whether the Republic fights the forest or lives with it.
- Whether the fishing bridge takes animals bigger than fish.

## Fauna (proposed 2026-11-11, awaiting the owner)

Drawn by `kits/fauna` and tagged by biome (`biomes/README.md`, "A fauna kit"); placed by `FAUNALANDS` (`kits/fauna/fauna-lands.js`).
The brief (`kits/fauna/BIOME-FAUNA-PLAN.md`): two grazers, a predator, a flyer and a water creature, with **at least one animal
found nowhere else**. **New** = to be built in the kit; *shared* = an existing key that also gets this biome's tag, because its
range plausibly runs across the border. Nothing here is built.

| Role | Animal | Status | Where | Why it is here |
|---|---|---|---|---|
| grazer | **bald browser** | **new, unique** | the balds under the pillar caps; the tableland | a heavy six-limbed grazer (`faWdHex`, `amb`, `stock`; native, like everything here), teal-grey with a lichen-mottled hide, that browses the bulb heath and rears on its hind pair to crop the green bulb fruits under a pillar cap. Its herds keep the balds open: a bald is the clearing under a cap, and the browsers are why it stays one |
| flyer | **bead weaver** | **new, unique** | the coves; it lays on the bead cones | the insect the bead cone nurses (section 3: "hung with strings of gold eggs"): a slow, heavy, gold-banded flyer with a 0.8 m span that strings its eggs on the cone's spongy flesh and guards them. Ties the fauna to an existing set piece |
| predator | **lattice stalker** | **new, unique** | the cove canopy: the lattice oaks | a lean six-limbed ambush hunter on the centaur gait that climbs the lattice oak's braided trunk and **passes through its gaps**; it takes bald browsers' young and bead weavers |
| water | **cascade ribbon** | **new, unique** | the rain wall's streams, the cascades, the landslide lake (281 m deep) | a long, ribbon-finned native swimmer (`faWdFish`) that climbs the cascades in runs, as eels and gobies climb Earth's falls. **The fishing bridge's prey** (section 3), which answers half of the open question: the bridge takes ribbons, and nothing bigger is planned |
| flyer | *cap-moth*, *bloom-glint*, *canopy-darter* | shared (swbay) | the low coves at the south-west edge | the bay's fungoid lineage climbs out of the bay with its insects and darters |
| flyer | *sail-wing* | shared (swlowlands) | the crest's updrafts and the 4 km scarp | the lowlands' pterosaur soars where the wind meets the wall |
| grazer | *duckbill-browser* | shared (swlowlands) | the lower western ramp (1-2 km) | the one lowland grazer that climbs this far |
| domestic | *cattle*, *sheep*, *horse* | shared | the Iron Republic's farms in the north only | the plan's contrast: Earth stock only where Earth's farms are |

Native life here owes nothing to Earth (section 3), so every new animal is a six-limbed native and the Earth animals stay inside the
Republic's polygon.
