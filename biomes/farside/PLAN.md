# farside: the plan (draft, 2026-10-23)

**Farside**: the crater's one true ocean shore, in the north-west (`LORE.md` §6.19: the Eternal State's coast, Farport,
the traders from over the sea), under the Outer Wall and the Yeti's high country. **The owner's idea** (2026-10-23):
strange and different from every other biome, **the sea's plants invading the land**. Everything here is *proposed*
unless marked.

**Status: building (2026-10-26, branch `claude/farside-biome-71703c`).** The owner answered section 8 on 2026-10-26.

## Core adoption (written before the first fragment, README.md "CORE MODULES ARE NOT OPTIONAL")

| Module | Takes it for |
|---|---|
| `core/biome` | the kit itself (`FARSIDE` on the BIOME-API contract): items, buckets, foliage, the runtime LOD, export |
| `core/rand` (`KRAND`) | every placement: a candidate per cell from `KRAND.cell(seed, ix, iz)`, each plant built from its own `KRAND.hash` seed |
| `core/tags` | every species, item set and registered volume (`BIO.init({tags:'farside'})`); the works as Eternian furniture records |
| `core/space` | the keep-clear between plants (`KSPACE`, through the core's obstacle index and the kit's own stand index) |
| `core/host` | camera, loop, panel, inspector, probe, the polygon tool (`KHOST.take`) |
| `core/atmos` | the shared sky (`ATMOS.sky` at each station's scale-model pixel), the wave field, the sky light, the weather (`ATMOS.bindWeather`) |
| `core/water` | the sea (`WATER.open` with a shore grid: shoaling, surf, the wet strand; a tint field for the pale shoals and the weed-brown shallows), the outer sea, the inland stations' streams (`WATER.flow`) |
| `core/materials` | the library through `materials.json` and `tools/textures/pack.py` (the Farside sets delivered 2026-10-26) |
| `core/export` | the krator-world export (the biome core fills it) |
| `core/clock` | through `core/host` |
| `biomes/nwlowlands` | read in place (its own registry and pack): the native forest at the front and in the fog belt |

**The final rebuild (pair 10, 2026-11-04, branch `claude/rebuild-farside-cloud`; `BACKPORT.md`'s universal set and Farside's row):**

| Module | Takes it for |
|---|---|
| `core/biome` 31j `BIO.flareJoin` | the snags' limbs at the front (`55`): the root sunk into the bole and swollen to a collar, 8 sides at the joint; no draws, so no stand moves |
| `core/biome` 34 impostors | the native forest's far trees (nwlowlands' `55` makes them when the fragment is on the page: the front and the fog belt), lit at the hyperjungle's gain (1.6, `88`); `?diet=0` the old blobs. Farside's own stands keep their stand-ins (two streaky tufts: cheaper than an impostor) |
| `core/terrain` 43 `KGROUND` | the ground's seven library layers (`47`), same order and weights, hex-tiled and height-blended; the sand is the `sand` kind (wind ripples across the north-wester, grain glints: the row's "sand on the strand"). `?kground=0` the old hex-cell bomb |
| `core/terrain` 44 `KFAR`, 45 `KHORIZON` | the far country as a far-field lattice to 14 km (`47`); the horizon's shadows on the ground and, after the bake, on the flora (`88`). `?far=0`, `?hz=0` |
| `core/shadow` (`KSHADOW`) | **off at page load** (the owner, 2026-11-03): the panel's `shadows` button attaches it on the first turn-on, then `off()`/`on()`; `?shadow=1` at load. core/shadow has no switch of its own yet, so the page holds one (`88`) |
| `core/water` ext 57, 58, 58-shore, 61 | the audit; the reflections switch on station 1's saline lagoon (off at load); the harbour's and the lagoon's masks from the ground; Līng-Mā's plume out of the harbour mouth (`89w`; `?plume=0`). The sea keeps its surf and breakers; the harbour arm and the lagoon have none (`breakers:false`, no shore grid: the sea's grid stops at the mouth, `STAGE.sea.land`) |
| `core/atmos` height fog, fog belt, rain cover, lightning | every station (`89t`): the flora in the wind and A2C, height fog with a dawn sea mist on the coast stations, the fog belt over Yith's ridge (the row's "fog belt (the cloud station)", `?belt=0`), the rain occlusion map |

Dropped, and why: **seasons** (the coast is Af/Cfa, ever-wet; nwlowlands' seasons are its own look flag, off for a reader); **weed in the
shallows** as `WATER.weed` (the sea's tint already carries the weed-brown shallows off the wrack line; a weed bed would sit under the surf
and the kelp is on land here: left for the owner's eye); `KSTRATA` (no bedded cliff on any station: the bluff under Farport is
planed bedrock, salt-bleached by tint); `KHOOK.warp` (no Bend); `core/mask` (nothing reads a raster). The card cells were already at zero
faults (`check_cells.py`), the attach audit at .01% or less (`HANDOFF-REBUILD.md`), and `kits/resources/ROCK-PROPOSAL.md` has no Farside row.

**Map 5.1 (the station review):** station 1 is re-drawn for the tsunami and Farport's move (section 6); the strand is re-sited (its old
pixel now stands at 1,725 m on the wall's slope; 5.1 px 293,573, 16 m, on the scour bench); the front stays at 5.1 px 317,530 (2,179 m,
above the plan's band: `KNOWN_ISSUES.md`); the fog belt at 1,611 m (the plan's 1,615). The sky's pixels are on the 4.23 canvas (5.1 less
272,330), as the sky's frame is.

Not taken before this turn and still not: `core/mask` (nothing reads a raster: every field is a function),
`core/city`, `core/hamlet`, `core/simulation`
(no settlement here: the owner, works only), `core/furnish` (the works are drawn by the page, tagged; they move to
the Eternian kit later), `core/lod` and `core/minimap` (no biome takes them yet).

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/farside/` (the usual kit layout, with `stations/`) |
| Polygon | `Farside` (biome; the geographic `Farside` polygon is its core) |
| Pages | four stations (section 6) |
| Core | the biome core, `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain`, `core/water` (the sea, the surf line), the shared sky |
| Read in place | `biomes/nwlowlands` (the native wet forest the invaders press against: sky meranti, mist palm, spire tree fern, stilt pandan, column kauri), `biomes/nwouterwall` on the heights; nothing copied |
| Object | `FARSIDE` on the `BIOME-API.md` contract |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground (the model, 4.21, surveyed 2026-10-23)

About **84,000 km²**, of it ~20,000 km² of sea and ~64,000 of land. A steep coast: the land rises from ~400 m at the
shore to ~2.4 km within 50 km and to 3-5 km against the NW outer wall behind.

| Distance from the sea | Land | Height (median) | Rain | Mean T | Classes |
|---|---|---|---|---|---|
| 0-10 km | ~7,800 km² | ~420 m | **~3,500 mm** | +24 °C (warmest +31-34, coldest +18) | Af, Cfa |
| 10-50 km | ~27,700 km² | ~2,400 m | ~2,850 mm | +14 °C | Cfa, Cfb, Dfb |
| 50-150 km | ~24,000 km² | ~2,800 m | ~1,300 mm | +12 °C | Csa in the lee basins, Dfc and ET on the heights |

The wettest coast on the map, under the north-west wind straight off the only ocean: warm, soaked, in sea fog most
mornings, the spray carried kilometres inland. Settlements in it: **Farport** (city, px 27,260, 286 m, 2,100 mm),
**Yith** (village, px 74,88, 1,615 m, 2,900 mm), and **Fulcrum** (arcology, px 137,291) in the drier lee.

## 2. Why the sea can come ashore here (the idea, made plausible)

A sea plant dies on land of three things: drying out, its own weight, and salt-starved or salt-burned tissue. Farside
answers all three. **Water**: 3,500 mm of rain and a fog that almost never lifts below ~1.5 km, so the air on the coast is
always wet. **Weight**: the plants that made it ashore grew what kelp never needed: stipes stiffened with lime (as coralline
algae are), and bladders that hold water, not gas, to ride out the rare dry day. **Salt**: the spray brings it, and the
invasion is thickest where the spray reaches (the first ~10 km) and thins as it fades.

**Where it came from: over the sea** [the owner, 2026-10-23]. The plants came on the hulls and in the ballast of the
mysterious traders' ships, as the clicks came into Farside's speech (`LORE.md` §6.19), and spread from Farport. A foreign
sea's flora with nothing on Krator to graze it explains how fast it took the coast.

**It has reached a steady state** [the owner, 2026-10-23], held there by **aggressive measures**, the chief of them
**grazing**: the local goats were let loose on it, and it has been **a bonanza for the goats**, which eat kelp, wrack and
red weed as readily as grass (as the seaweed-eating sheep of North Ronaldsay do on Earth). *Proposed*, the other
measures: the front burned back in the dry weeks; kelp cut for ash and food faster than it grows near the towns; wrack
carted off the strand to the fields. The coast still reads as **an invasion with a front**: the sea's flora holding the
strand and the kelp coast, the land's own forest (the NW lowlands' species) holding the fog belt and the higher ground,
and between them a belt of dead and drowned trees, goat-cropped kelp and burned ground that has stopped moving.

## 3. The look

The colours of a seabed, in air: **olive-brown and gold** (the kelps), **wine-red and crimson** (the red weeds), **emerald**
(the green weeds), **bone-white and coral pink** (the lime-builders), against the land forest's ordinary green. Everything
**drips**; the blades **stream inland** on the onshore wind as kelp streams in a current, so a slope moves as a seabed moves;
the light is fog-grey and green; the air smells of iodine and salt.

## 4. Zones

| Zone | Where | What |
|---|---|---|
| `strand` | the shore and the first ~2 km, under the spray | surf rocks draped in wrack; **spray coral** building white and pink lime terraces above the waterline; **strand eelgrass** meadows on the dunes; sea palms on the surf rocks |
| `kelpcoast` | 2-10 km, to ~800 m, the fog's floor | **the kelp forest on land**: land-kelp stands 20-40 m on lime-stiffened stipes, wrack hung from everything, anemones on the floor; nothing of the land's own |
| `front` | 10-25 km, ~800-1,800 m, where the spray fades | **the front**: the land forest's trees dead or dying, hung with wine weed and wrack, land-kelp seedlings coming up under them; the invasion's advance guard |
| `cloud` | 25-50 km, ~1,800-3,000 m, the fog belt | the native wet forest (nwlowlands' species), its bark crusted with **fog sponges** and the first wine weed: the sea's outriders |
| `lee` | the drier basins inland (Csa, ~1,000 mm) | no invaders: the land holds (nwlowlands' drier species) |
| `heights` | over ~3 km | the NW outer wall's own flora (`biomes/nwouterwall`) |

## 5. Species

| Key | Name | Model | What it is | Harvest |
|---|---|---|---|---|
| `landkelp` | Land kelp | giant kelp (*Macrocystis*), bull kelp (*Nereocystis*) | olive-gold stipes 20-40 m, stiffened with lime and leaning together in stands, a holdfast like a tangle of roots, long blades streaming inland, water bladders the size of a fist to a head along the stipe | **food** (the blades, dried, as kombu); **soda and potash** from its ash (kelp-burning, as in the Hebrides); iodine |
| `stormwrack` | Storm wrack | bladderwrack (*Fucus*), knotted wrack (*Ascophyllum*) | brown-olive straps with paired bladders, draped over rocks, trunks and walls in the spray zone, piling into wet heaps | **fertiliser** for Farside's fields; fodder |
| `spraycoral` | Spray coral | coralline algae, reef corals | colonial lime-builders growing above the waterline on the spray: branching white, pink and lilac thickets and terraces of rough limestone, the coast's only new rock | **lime** (mortar, the Farside's whitewash) |
| `eelgrass` | Strand eelgrass | seagrasses (*Zostera*, *Posidonia*) | long ribbon leaves in dense meadows on the dunes and the salt flats, lying flat inland in the wind, banking into windrows of dead leaf | thatch, packing, mattresses (as *Posidonia* was) |
| `seapalm` | Sea palm | *Postelsia* | small rubbery palm-shaped kelps 0.5-1 m on the surf rocks, bending flat to each wave and springing back | none (the strand's sign) |
| `wineweed` | Wine weed | red algae (*Porphyra*, *Gracilaria*) | crimson and wine-red sheets and branching fronds hung from the native trees at the front and in the fog belt: the invasion's advance guard | **food** (sheets dried as nori); agar (glue, sizing) |
| `emeraldweed` | Sea lettuce | green algae (*Ulva*) | emerald sheets on every wet surface of the kelp coast, wrinkled and translucent | food (greens) |
| `fogsponge` | Fog sponge | sponges (no plant does this) | ochre, orange and grey crusts and lumpy towers on bark and rock in the fog belt, drinking the fog through their pores; plant or animal, nobody on Farside is sure | bath sponges, stuffing |
| `strandanemone` | Strand anemone | sea anemones | low clumps of thick stalks crowned with soft tentacles, rose, green and violet, on the kelp forest's floor; they close at a touch and catch insects | none (they sting) |

**Added by the owner's review (2026-10-26, "more species diversity to the kelp forests"):** `oarweed` (*Laminaria*: the understorey's
fans on a stiff stipe), `boakelp` (*Egregia*: long sprawling straps lined with small blades), `seagrapes` (*Caulerpa*: bead
runners on the floor, eaten fresh), and the land kelp's third form, the **elk kelp** (*Pelagophycus*: a float and two antler arms
hung with big blades).

Nine of its own (twelve with the review's three); the land's own forest comes from `biomes/nwlowlands`, read in place, at the front and inland of it.

### The animals

The sea's animals have followed its plants ashore [the owner, 2026-10-23: mudfish and the like; a lung octopus; other
molluscoid creatures on the land]. All for `kits/fauna`; the names and details are *proposed*.

| Key | Name | Model | What it is | Build |
|---|---|---|---|---|
| `kelpgoat` | Farside goat | the goat; North Ronaldsay's seaweed sheep | the local goats gone over to the sea's weed: shaggy, salt-crusted, fat on kelp, browsing the strand and the front in herds; the front's keepers | a variant of the kit's `goat` (a breed: shaggier coat, darker, a kelp-stained muzzle) |
| `mudfish` | Mudfish | mudskippers (*Periophthalmus*), lungfish | a fish a forearm long that lives out of the water in the wet wrack and the kelp forest's pools, propped on its front fins, its eyes on top of its head, skipping when startled | `faWdFish`, with the pectoral fins as legs (a new crawl on the swimmer gait) |
| `lungoctopus` | Lung octopus | the octopus | an octopus that breathes air through a lung in its mantle, a metre across the arms, living in the kelp forest's floor and the coral terraces; it hunts the mudfish and the snails, changes colour against the wrack, and walks on its arms | see below |
| `strandwhelk` | Strand whelk | whelks (*Buccinum*), cone snails | a snail the size of a head with a tall spired shell, gliding over the wrack on a broad foot and hunting other molluscs; its shells pile up round every Farside door | the kit's slug chain (`faWdSerpent`, kind `slug`) with a spired shell part |
| `seahare` | Sea hare | sea hares (*Aplysia*) | a soft, fat, slug-like grazer the size of a cat, brown-olive with wing-like flaps along its back, grazing the sea lettuce and inking violet when touched | the slug chain, with two flaps and two ear-like tentacles |
| `bloomslug` | Bloom slug | nudibranchs | small soft slugs in warning colours (orange, violet, white-tipped plumes along the back) on the kelp, the anemones and the fog sponges, which they eat; poisonous | the slug chain, with cerata (rows of plumes) |
| `rockchiton` | Rock chiton | chitons | flat oval grazers with eight overlapping plates down their backs, clamped to the surf rocks and the coral terraces, a hand to a forearm long | a shell part on a low slug chain |

**The lung octopus's build.** The fauna kit already draws an octopus (`faWdOcto`, the Ring Sea's reef octopus): a mantle
and eight arms drawn as stiff pieces that the octopod walk swings whole, which `kits/fauna/KNOWN_ISSUES.md` notes makes
the feet slide. That reads at a distance, not up close. For an octopus that walks on land (the arms curling, gripping and
reaching), *proposed*: draw each arm as **a chain of segments**, as the kit's serpent and slug builders already do, and
pose them procedurally: a travelling curl down each arm, the arms in alternating pairs planted and reaching (an octopus
walks on its rear arms and feels ahead with the front ones), the mantle bobbing and pulsing as it breathes. That is a new
builder and a new gait in `kits/fauna`, about the size of one of its existing builders; for Godot, the same chains as bone
chains on one Skeleton3D, posed by a script (or a spring chain for the drape). The alternative, a sculpted and rigged
model with keyframed clips (the kit's Meshy path, `kits/fauna/rig/`), suits an octopus badly: eight boneless arms are what
those rigs do worst.

## 6. Stations

1. **Farport and the kelp coast** (`dist/farside.html`). **Rebuilt on map 5.1 (pair 10, 2026-11-04): the tsunami reaches Farside** (the owner,
   2026-11-01; `biomes/STATIONS-MAP-5.1.md`, "Farside, the tsunami and Farport"; `DATA.tsunami_farside`: a 50 m crest, the scour bench to
   65 m, chevrons to 38 m, the run-up ceiling 100 m). Farport's old city stands on the near-shore plateau (5.1 px 294,588, 212 m), its site
   held clear and registered for the settlement build; the harbour stays at the water in Līng-Mā's drowned estuary (the river grades to
   0 m on 5.1), with quays on both banks, two jetties and the dockyard's slip, the factory quarter's site beside them. Between them the
   wave's ground: the scour bench (planed, salt-bleached bedrock to ~55 m), V-shaped chevron ridges pointing inland with backwash chutes
   between, a perched saline lagoon at 9 m (a plunge pool), then the bluff to the plateau. The reach is drawn: the run-up line (red) and
   the bench's top (amber) as ribbons on the ground (a panel layer, `?tsunami=0`), five **tsunami stones** on the run-up line (the State's
   warning not to build below them: Earth's tsunami stones), and a **trimline** (the kelp under 100 m is younger, ~60% of its height).
   The spray coral terraces stand either side of the harbour mouth, the land-kelp forest on the bluff and the plateau round the city's site.
   Two km of the model are compressed into the page (KNOWN_ISSUES.md).
2. **The front** (`-front`): where the kelp forest meets the land's: dead kauri and meranti hung with wine weed and wrack,
   kelp seedlings coming up between them, the native forest standing beyond.
3. **The strand** (`-strand`): eelgrass dunes, sea palms on the surf rocks, spray coral reefs growing out of the sand above
   the waterline (Krator's sea has little tide), wrack heaped on the beach.
4. **The fog belt** (`-cloud`): the native wet forest at ~2 km in perpetual fog, its trunks crusted with fog sponges and
   the first wine weed, Yith on its ridge.

## 7. Crops and resources

`kits/crops`: a `farside` entry (`atm: 1`, wet, warm). **The three**: **kelp** (the staple, dried), **wine weed** (the
food sheet and agar), and the kelp ash (**potash and soda**, the glassmakers' and soapmakers' trade: a third source of
the alkali salts beside the Catch, `biomes/catch/PLAN.md` section 6a). Farside's fields are walled terraces manured with
wrack. The spray coral gives the coast its lime. **The goats** are the coast's wealth [the owner]: milk, meat, hair and
hides from herds that eat what the sea sends ashore; *proposed*, their kelp-fed meat is salty and prized in the State.

## 8. Questions for the owner

1. **The species and the animals** (section 5), their names and looks.
2. **The lung octopus's build**: the new segment-chain builder in `kits/fauna` (proposed), or the existing stiff-armed
   octopus for now.
3. **The Farside people's relation to the coast**: kelp-burners, wrack-farmers, goatherds, lime-burners, nori-makers;
   the Eternal State's view of the traders' invasion.

Answered (the owner, 2026-10-26):
1. **The species** are built as section 5 names and draws them.
2. **The lung octopus** gets the new segment-chain builder in `kits/fauna`, later (a fauna session). Until then the
   animals are placeholders: data records (`FARSIDE.FAUNA`), not drawn.
3. **The people's works only** on the biome pages: kelp kilns, lime kilns, wrack heaps and carts, walled terraces, goat
   folds, drying racks; no city massing (Farport and Yith are settlement builds). The works are **tagged as Eternian
   furniture** (core/tags: class `furniture`, culture `eternian`) and noted in `kits/eternian/KNOWN_ISSUES.md` to be
   backported into the Eternian kit the next time it is rebuilt.
4. **The Eternal State's view: a managed harvest.** The State taxes the kelp ash, the lime and the goat meat and keeps
   the front where it is; the traders' invasion is a resource, not a blight.

Settled (2026-10-23): the invaders came **from over the sea**, on the traders' ships; the front has reached **a steady
state** under aggressive measures, chiefly **grazing**, a bonanza for the local goats; mudfish and the like have followed
the plants ashore, with a **lung octopus** and other **molluscoid creatures** on the land.

## 9. Textures

The library already has much of a seabed: `card.kelp.0`-`8`, `card.seaweed`, `cloth.seaweed`, `card.seagrass`,
`ground.lagoon.seagrass`, `card.reef`, `ground.reef.flat`, `organic.coral.brain`, `card.flora.coral`, `card.petal.coral`,
`stone.coral`, `rock.coral_stone_wall`, `card.streamer`, `organic.barnacle`. To generate (`core/materials/PROMPTS-NEEDED.md`
section 14): the land-kelp's stipe (`bark.kelp.stipe`), a wrack-heap ground (`ground.wrack`), fog-sponge crust
(`organic.sponge`), and wine-weed sheets (`card.wineweed`).
