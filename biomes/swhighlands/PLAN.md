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

**Status: plan, awaiting the owner.** Nothing built.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/swhighlands/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `refs/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations: `dist/swhighlands.html` (station 1) and `-rainwall`, `-span`, `-pillars`, `-coast` (section 7) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, strata), the shared sky |
| Read in place | `biomes/swbay` (cap-tree, bracket tree, coral fungus at the bay's edge and in the low coves); `biomes/swlowlands` (four species, one derived: section 3); `biomes/riftrim` or `biomes/nhighlands` for the crest's fellfield; nothing copied |
| Its own flora | section 3 |
| Object | `SWHI` (`build`, `dress`, `SPECIES`, `PLANTS`), on the `BIOME-API.md` contract; its species are read by key from `biomes/swbay` for the backfill |
| Out of scope | Span's ruin and Dalab's outpost (a settlement plan); the Iron Republic's farms (the Republic's builds); the scarp's foot and the coast below it (the Vothic coast's kit, an ecotone) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

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
- **People**: **Span** (ruined arcology, px 282,680, 2,534 m, 1,819 mm, +11 °C), Dalab's outpost against the machines and
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
| **Glasshouse spire** | 05 | 5-6.5 km, the wet west face | a tower of translucent cream bracts that keeps its flowers warm (the noble rhubarb's habit) |
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
- **The rain wall**: slopes failing constantly as in Taiwan and Nepal: fresh scars, debris-flow chutes, forest at every
  stage of regrowth; **fluted pinnacles** where the ridges' limestone meets 4 m of rain (`refs/22`); **potholes** and
  polished rock in the Cascade river's bed (`refs/25`).
- **The landslide lake**: the model's lake (48 km², 2,878 m, 281 m deep) is dammed by a **rock avalanche**, as Sarez is:
  a hummocky dam that seeps rather than spills, the old valley's drowned trees standing in the water, the scar on the
  mountain above.
- **Span's tableland**: cliff-ringed canyons in `pillar` sandstone, **slot canyons**, **hanging swamps** on the seepage
  ledges, **pagoda and beehive domes** banded by iron and crust (`refs/21`); **twin falls** where Pan Riba and its fellows
  leave the tableland (`refs/23`).
- **The pillar rim** (`refs/01`): where the tableland breaks down on its west and south, rain has widened the joints into
  **free-standing towers** 250-300 m tall, red and white with diagonal Liesegang bands, mist round their tops, a green
  floor and a meandering stream between them.
- **The fan coast**: the dry 4 km scarp's wadis build **steep fan deltas** straight into the Ring Sea (the Gulf of Corinth,
  the Gulf of Aqaba). No raised reefs: the Ring Sea's level has not changed.
- **The crest**: cirques and fellfield, read from `riftrim` or `nhighlands`.

The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 5. Where the native forest meets Earth's

In the north, where the Iron Republic's polygon overlaps (14,000 km²), its farms, pastures and orchards push into the
native forest: cleared coves, stone walls, Earth crops beside lattice oaks. The bay's species come in at the south-west
edge (the bay's cap-trees and bracket trees in the low coves). The fan coast meets the Vothic coast's flora at the
scarp's foot.

## 6. The people's side

- **Span**: Dalab's outpost in a wrecked arcology, on the tableland's rim over the Ancient's Valley, holding the line
  against the Valley's machines and mutants. Its settlement plan is its own; this kit dresses its ruin (the drip cap).
- **The Iron Republic's** northern farms; **Drum** on the coast below the scarp.
- *Proposed*: Dalab's genepriests prize the shelf coral (it eats rock: an ore-finder) and the fishing bridge's venom;
  the cell lamp's spheres are a lowland delicacy.

## 7. Stations

1. **The ring folds** (`dist/swhighlands.html`, ~2-3 km, Cfa and Dfb): a ridge with an arch, a water gap, a cove of
   lattice oaks and bead cones, a bald under one pillar cap with bulb heath and banded coral; the Republic's last farm in
   the distance.
2. **The rain wall and the landslide lake** (`-rainwall`, ~2-2.9 km, in cloud): the lake behind its hummocky dam, drowned
   trees, a fresh scar with stilt pod trees and shelf coral, weeping wisps, glow tubes and bearded triplets, a fishing
   bridge over the outlet seep, fluted pinnacles on the ridge above.
3. **Span's tableland** (`-span`, ~2.5-3 km): slot canyons, a hanging swamp with cell lamps, wing reeds and bulb
   trumpets, beehive domes, torch spikes, the twin falls at the rim, Span's ruin on the skyline.
4. **The pillar rim** (`-pillars`, the tableland's south-west edge): the painting: red and white towers in mist, anemone
   trees on their tops, the green floor and Pan Riba's meanders.
5. **The fan coast** (`-coast`, optional, the ecotone): the dry scarp with the star-fruit caudex, arrowheads and coral
   melons, a fan delta into the Ring Sea, Drum's lights along the shore.

## 8. Textures

Read the library first (`core/materials/PLAN.md`): sandstone and bedded red sets, `rock.limestone.karst`,
`rock.sandstone.navajo`, `ground.needles`, mossy ground and the bay's cap and gill textures (read in place).

To source or generate (generic ids; the prompts go into `core/materials/PROMPTS-NEEDED.md` in H0): a red-and-white
banded quartz sandstone with Liesegang bands; an opal-shell limestone (iridescent shell bed); braided-cord bark (the
lattice oak); a honeycomb spore-pod surface; a spongy cone-cap surface; a lichen-plate ground (teal and gold); cards for
the bulb heath, wing reed, bearded triplets, arrowheads and the glasshouse spire's bracts; the cell lamp's cell surface.

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
