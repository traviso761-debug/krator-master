# farside: the plan (draft, 2026-10-23)

**Farside**: the crater's one true ocean shore, in the north-west (`LORE.md` §6.19: the Eternal State's coast, Farport,
the traders from over the sea), under the Outer Wall and the Yeti's high country. **The owner's idea** (2026-10-23):
strange and different from every other biome, **the sea's plants invading the land**. Everything here is *proposed*
unless marked.

**Status: plan, awaiting the owner.**

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

Nine of its own; the land's own forest comes from `biomes/nwlowlands`, read in place, at the front and inland of it.

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

1. **Farport and the kelp coast** (`dist/farside.html`): the city on its harbour, the spray coral terraces round it
   whitewashed with their own lime, the land-kelp forest standing on the slopes behind, the traders' quarter by the water.
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

Settled (2026-10-23): the invaders came **from over the sea**, on the traders' ships; the front has reached **a steady
state** under aggressive measures, chiefly **grazing**, a bonanza for the local goats; mudfish and the like have followed
the plants ashore, with a **lung octopus** and other **molluscoid creatures** on the land.

## 9. Textures

The library already has much of a seabed: `card.kelp.0`-`8`, `card.seaweed`, `cloth.seaweed`, `card.seagrass`,
`ground.lagoon.seagrass`, `card.reef`, `ground.reef.flat`, `organic.coral.brain`, `card.flora.coral`, `card.petal.coral`,
`stone.coral`, `rock.coral_stone_wall`, `card.streamer`, `organic.barnacle`. To generate (`core/materials/PROMPTS-NEEDED.md`
section 14): the land-kelp's stipe (`bark.kelp.stipe`), a wrack-heap ground (`ground.wrack`), fog-sponge crust
(`organic.sponge`), and wine-weed sheets (`card.wineweed`).
