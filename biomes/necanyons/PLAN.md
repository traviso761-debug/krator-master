# necanyons: the plan (2026-10-19; built the same day)

The **north-eastern canyons**: the transition from the central hyperjungle to Korona's coronae and tepuis (`LORE.md`
§6.18). Red sandstone mini-plateaus, benches and rock stacks rise out of the jungle; the forest fills the canyons
between them and thins northward; the higher plateau tops are bare, dry rock. Large carnivorous plants first appear
here. Unlike Korona's, none is big enough to threaten a human. Pinnacle Rock (`settlements/pinnacle-rock`) stands on the
first of these mesas, at the southern edge of the canyons.

Owner's brief (2026-10-19): a transition zone from the hyperjungle to Korona's tepui terrain; many red sandstone
mini-plateaus and rock stacks out of the jungle; large carnivorous plants begin, none dangerous to a human; some higher,
more arid plateaus that need their own plants; at least one fruit, one native vegetable or staple and one medicinal plant,
wired into `kits/crops`; texture prompts before work starts; a decision on where carnivorous plants live (the fauna layer
or a layer of their own).

**Status: built (2026-10-19).** The owner approved the plan as it stands (the plant list, the carnivore layer as flora
with a trap record, the medicine bucket) and delivered the five required textures. N0 to N6 are done; `NOTES.md` says
what was learnt, `KNOWN_ISSUES.md` what is left. On the scale model the kit overlies the hyperjungle's polygon for now.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/necanyons/` (`src/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Page | `dist/necanyons.html`: a 3 km showcase of canyon floor, two benches, a cap plateau and a stack field |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve, and the **rock-stack generator**, the same one Pinnacle Rock's P1 needs: written once, in `core/terrain`) |
| The jungle | the hyperjungle kit **read in place** (as `geyser` does) for the canyon floor, thinned and lowered toward the north; nothing copied |
| Its own flora | the canyon walls, benches and caps (section 3); the carnivores in their own fragment (section 4) that Korona will read in place |
| Object | `NECANYONS` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `TRAPS`), on the `BIOME-API.md` contract |
| Tags | `climate:'hypertropic'` on the floor, `'tropic'` above; aridity by zone (section 1); `abyssal:false` |

It is a new biome, so it goes in the gallery when it first reaches `main`.

## 1. The ground and its zones

**Why carnivores begin here.** Quartz sandstone weathers to sand with almost no nitrogen or phosphorus, and 3,000 mm of
rain a year leaches the rest away. What grows on the rock gets its nutrients from what it catches. The canyon floors keep
the jungle's deep litter, so the carnivores live on the rock above them: walls, ledges, bench bogs and the bare caps.
Korona's tepuis are the same rock, older and higher, and their carnivores are bigger.

**Why the high plateaus are dry under jungle rain.** The aridity comes from the rock, not the climate. Jointed sandstone
drains at once, there is no soil to hold water, and the caps stand above the jungle's humid air in sun and wind. Rain
comes in pulses: the sand pans and potholes fill, the plants race, and the rock is dry again within days.

| Zone | Where | Aridity | What grows |
|---|---|---|---|
| `floor` | canyon and jungle floor between the rocks | humid to wet | the hyperjungle, read in place, its hypertrees shorter northward; gorge fan palms on the seeps; stack figs at the wall foot; monkeycup vines and turncoat lianas on the edge trees |
| `wall` | cliffs, stack faces, the seep lines under each cap rock | wet at the seeps, dry between | the **hanging gardens** at the seep lines (seep curtains, rimdew, sun pitchers, the carnivorous moss); stack-fig roots laced down the faces; monkeycup vines ledge to ledge; dressed on the rock geometry the way `dress()` grows on a structure |
| `bench` | the mid mesas and benches (Pinnacle Rock's height, 200 to 300 m over the floor) | subhumid | flametip scrub forest; ember plums; sun-pitcher bogs on flat damp tops; clapjaw sands at the seep foot; fonio in the dry pans |
| `cap` | the high plateaus | semiarid to arid | bare slickrock with black crust; stilt lilies, rock bottles, ringgrass hummocks, yellow tubes; fonio in the sand pans; potholewort in the rain pools |

The fields come from the core where it has them (`rock`, `flow`, `mist`), plus two of the kit's own: **seep**, a band
under each cap rock's lower bed and at a wall's foot, and **pan**, the flat hollows on a bench or cap that hold sand and
water. Both are deterministic from the terrain (no random draw), so a world that places the kit gets them the same way.

**Landforms.** The mesas and benches are `core/terrain` relief stamps; their walls and undercuts are carve patches; the
stacks (fins, spires, balanced rocks) come from the rock-stack generator (`settlements/pinnacle-rock/PLAN.md` section 2),
which writes records the flora reads: a stack's beds give the ledges a hanging garden grows on.

## 2. Air and scale

The floor is at Pinnacle Rock's -900 to -1,000 m, so the air is the hyperjungle's: dense, about 1.9 atm (`CROPS.BIOMES`:
`atm 2`). Dense air is why Krator's lowland plants and insects run large, and the carnivores are larger than Earth's,
but kept below anything that can hold a person. **The largest trap in the kit:** a monkeycup's ground pitcher, 45 cm tall,
which takes rats, frogs and small lizards. A clapjaw's trap, up to 35 cm across, can pinch a careless hand and let it go.

## 3. The plants

Seventeen in all. **Bold** marks the three the brief asks for. Where an Earth plant is the model, it is named so the
drawing can be checked against it.

### Trees and woody plants

| Key | Name | Zone | What it is | Harvest |
|---|---|---|---|---|
| `fanpalm` | **Gorge fan palm** (native vegetable) | floor (seeps), wall foot | *Livistona* of Palm Valley and the Kimberley gorges, 25 to 40 m in the dense air: grey ringed trunks, a round crown of drooping fan leaves, standing in lines along the wet feet of walls | **palm heart** (a vegetable: cut from a stem of the clump, which the clump replaces); fronds for thatch and weaving |
| `stackfig` | **Stack fig** (the fruit) | wall, stacks, wall foot | a rock fig (*Ficus platypoda*, *F. brachypoda*): a crown on a ledge and pale roots laced down 20 to 60 m of rock to the ground; figs borne in clusters on the roots and the old wood | **stack figs**: sweet, purple-red, eaten fresh or dried in strings; the fruit of the canyons and the birds' and flyers' food |
| `flametip` | Flametip | bench | a tepui shrub-tree (*Bonnetia roraimae*), 8 to 20 m: thick glossy leaves in spirals, every new flush scarlet, so a bench in leaf looks lit; pale pink flowers | firewood (dense, burns long); the bark is a tannin for tanning hides |
| `emberplum` | Ember plum | bench, cap (in cracks) | the Kakadu plum (*Terminalia ferdinandiana*), a small pale-barked tree of the sandstone woodland with big pale leaves | **ember plums**: small, green-gold, very sour, with more vitamin C than any other fruit; eaten fresh, or dried and pounded to a powder the Wings carry against scurvy |
| `treelily` | Stilt lily | cap | a tree-lily (*Vellozia*), 2 to 6 m: forked trunks thick with black fibrous old leaf bases, a fountain of grey-green grass-like leaves at each tip, lilac flowers after rain | the resinous trunk fibre burns even wet: torches and kindling |
| `rockbottle` | Rock bottle | cap | a caudex succulent (*Adenium*, *Pachypodium*) wedged in the joints: a swollen grey bottle stem, a few thick branches, pink trumpet flowers in the dry | poison: the milky sap is a heart poison used on arrows and to stun fish. `hazard: 'poison'` |

### Ground plants and grasses

| Key | Name | Zone | What it is | Harvest |
|---|---|---|---|---|
| `fonio` | **Sandpan fonio** (the staple) | bench and cap pans | a fonio (*Digitaria exilis*), the West African grain of poor sandy soils: fine tufts with two to five thread-thin seed racemes, ripe eight weeks after the rains fill the pans | **grain**: tiny, gluten-free, cooked like couscous or steamed; wild on the pans, sown on the sand terraces round Pinnacle Rock's foot |
| `ringgrass` | Ringgrass | cap | spinifex (*Triodia*): blue-grey spiky hummocks that die out in the middle and grow outward as rings | the resin, melted from threshed leaves, is a glue (hafting points, sealing); dry hummocks are fuel |
| `seepfern` | Seep curtains | wall (seep lines) | maidenhair ferns and mosses in curtains under each cap rock, the hanging gardens of Zion and the Kimberley gorges | none (the carnivorous moss among them, section 4) |

The black **biological crust** and the lichens on the caps are a ground texture and a field, not plants with records.

### Carnivores (section 4 says how they work)

| Key | Name | Zone | Model | Trap | Prey (largest) |
|---|---|---|---|---|---|
| `rimdew` | **Rimdew** (medicinal) | wall (seeps), bench bogs | the sundews (*Drosera*): red rosettes 20 to 40 cm, forked strap-leaved forms to 1 m, every leaf beaded with sticky dew | flypaper (the leaves curl over minutes) | insects |
| `sunpitcher` | Sun pitcher | wall ledges, bench bogs | the sun pitchers of the tepuis (*Heliamphora*): clumps of green and red trumpets, 0.8 to 1.8 m, each with a red nectar spoon at the rim | pitfall | insects, frogs |
| `monkeycup` | Monkeycup vine | floor edge trees, walls | the tropical pitcher plants (*Nepenthes*): a liana with squat ground pitchers (to 45 cm) and slim upper funnels; the upper rims glow faintly blue at night (real *Nepenthes* rims fluoresce), which draws moths | pitfall | rats, frogs, small lizards |
| `clapjaw` | Clapjaw | bench (damp sand at seep foot) | the Venus flytrap (*Dionaea*), Krator-sized: rosettes of traps up to 35 cm across, shutting in a third of a second | snap | frogs, large insects, small lizards |
| `yellowtube` | Yellow tube | cap | *Brocchinia reducta*, the tepui bromeliad that turned carnivore: upright yellow-green tubes of waxy leaves, 1 to 2.5 m, UV-bright, sweet-smelling; folds shut in the dry | tank | insects |
| `turncoat` | Turncoat liana | floor (the jungle's edge) | *Triphyophyllum*: carnivorous only as a young plant (sticky glandular leaves for a season), then a plain liana climbing to the canopy. The jungle's own plants turn carnivore here | flypaper (young plants only) | insects |
| `potholewort` | Potholewort | cap (rain pools) | the bladderworts (*Utricularia*): yellow flowers on stalks above a pothole, suction bladders under the water | suction | larvae, tadpoles |

**Uses of the carnivores.** **Rimdew is the medicinal plant**: its leaves, steeped in honey or spirit, make a cough and
chest syrup that also eases cramps (sundew was used this way in Europe), and the fresh dew is dabbed on warts. The
monkeycup's unopened pitchers are cut and used as **cookpots**: fonio or rice is packed in and steamed in the pitcher,
as Borneo cooks rice in *Nepenthes*. That gives Pinnacle Rock a dish of its own.

### The three asked for, and what they reach

| Asked for | Plant | Where it grows wild | Where it can be grown |
|---|---|---|---|
| Fruit | stack fig (and ember plum on the dry tops) | walls and stacks; benches and caps | stack fig: any tropical rock garden or wall, humid to semiarid; ember plum: tropical to hot, dry |
| Native vegetable or staple | sandpan fonio (staple), gorge fan palm (vegetable) | bench and cap pans; seeps | fonio: any hot place on poor sand, rain-fed from semiarid up, irrigated into arid; palm heart: humid tropics |
| Medicinal | rimdew | seep lines and bogs | any wet, sunny, nutrient-poor bed: bogs and seeps, warm to tropical |

## 4. The carnivores: a layer of their own on the flora

**Recommendation: they are flora that carry a trap record, with the trap rules in the biome core.** They are not
fauna, and they are not plain flora either.

**Why not the fauna layer.** `kits/fauna` builds one rigged `THREE.Group` per animal, with parts, gaits, yields, life
and schedules. A ledge carries hundreds of sundews and pitchers, which have to be instanced cards and buckets placed by
density fields like any plant, under the biome's LOD. The fauna kit's bundle and its per-animal records are the wrong
tool for that, and `core/tags` already says a placed animal is class `life`, not `flora`.

**Why not plain flora.** A trap has state (open, shut and digesting, reopening), a trigger, a prey limit and, in Korona,
a danger to people. A game in Godot needs those as data, not as a shader's look.

**What it is:**

1. **Drawn and placed as flora** by the kit's own fragment, `57-biome-necanyons-carnivores.js`: instanced, carded, on
   the zones' fields, under the core's LOD and budgets. Korona reads this fragment in place and adds its own large ones.
2. **Registered in `core/tags` as `class: 'flora'`** with `kind` the species and a `trap` tag block:
   `{kind: 'pitfall'|'flypaper'|'snap'|'tank'|'suction', mouth: m, preyMax: 'insect'|'small'|'medium', cycle: {shut: s,
   digest: days, reopen: s}, danger: 0}`. Hero plants (the clapjaws by a path, the monkeycups on a wall near the camera)
   are registered one by one; a carpet of sundews is one record per patch, as the other kits register their grass.
3. **The rules in the core, as data and pure functions:** a new `core/biome/37-core-traps.js` (`[G data]`): the trap
   vocabulary, `BIO.traps.state(rec, t)` (where a trap is in its cycle at time t, from a hash of its id: no random
   draws) and `BIO.traps.catches(rec, prey)` (prey size against `preyMax`, `danger` against a person). A node test proves
   both are deterministic and every species' record is in the vocabulary. GDScript gets the same two functions later.
   The prey sizes are the fauna kit's (`size` on its entries), so the frogs and giant insects already in
   `krator-fauna-hyperjungle.js` are the prey without a change to that kit.
4. **Motion in the shader**, the way the core already moves flocks (`35-core-anim.js`): the clapjaw's lobes hinge from a
   per-instance phase (open most of the time, now and then shut), the rimdew's leaves curl slowly, the monkeycup's
   pitchers sway on their tendrils. No CPU work per frame. A host that wants one trap to shut on something (a frog the
   player watches) overrides that instance's phase.
5. **A layer toggle**, `carnivores`, on the host bar (`KHOST` layers), so verify and the owner can show or hide them.

**What changes for Korona.** Only data: a `danger` above 0, perhaps a `grab` trap kind. A Korona man-eater that moves
like an animal (a tendril that reaches) gets parts and pivots as a fauna build does, but stays class `flora` with a trap
record.

**The alternative** is a kit of its own, `kits/carnivores`, read by necanyons, Korona and the Throne (which already draws
snare flowers and snare rafts). That is cleaner if many biomes end up with carnivores. Today it is two biomes and one
volcano, so the fragment-plus-core version is smaller. It can be split out later without changing a record.

## 5. Wiring into the Crops kit

| Change | Where | What |
|---|---|---|
| a `medicine` bucket | `kits/crops/src/10-crop-core.js` | `medicine: {group: 'utility', what: 'taken for illness and wounds'}`; `PLAN.md` and `MEDICINE-FUEL.md` reserve it. Rimdew is its first member, so the test "every bucket has a crop" stays green. The survey's other medicinal plants can move in later |
| the biome | `CROPS.BIOMES` | `necanyons: {atm: 2, atmNote: '?', zones: {floor: {warmth: [4,4], arid: [3,4]}, seep: {warmth: [4,4], arid: [3,4], wet: true}, bench: {warmth: [4,4], arid: [2,3]}, cap: {warmth: [4,5], arid: [0,1]}}}` |
| `sandpan-fonio` | `20-crop-records.js`, grain | warmth [4,5], arid [0,2], reach 1, stores ground and dried, card `card.crop.plume`; "poor sand; ripe in eight weeks" |
| `stack-fig` | fruit, also `dried-fruit` | tree, warmth [4,4], arid [1,4], card `card.broadleaf`, stores fresh and dried |
| `ember-plum` | fruit, also `medicine` | tree, warmth [4,5], arid [0,2], card `card.orchard.broad`, stores fresh and dried; "against scurvy" |
| `fan-palm-heart` | vegetable, also `thatch`, `weaving` | tree, warmth [4,4], arid [2,4], card `card.palm` (or `card.palm.fan`, section 6) |
| `rimdew` | medicine | warmth [3,4], arid [3,4], water `rain`, card `card.carnivore.sundew` (section 6); "a cough and chest syrup" |
| `rock-bottle` | reagent | warmth [4,5], arid [0,1], `hazard: 'poison'`, `homeOnly` (gathered, not grown) |
| `stilt-lily` | fuel | warmth [4,5], arid [0,2], `homeOnly`; "torches that burn wet" |

All take `home: ['necanyons']`. The test gains a negative pair for the new biome (fonio rain-fed on the bench, not in
the polar zone). Rebuild `kits/crops` and every build that reads it in place.

**`biomes/FRUIT.md` and the catalog:** stack fig and ember plum get sections and catalog pieces
(`generic_fruit_stack_fig`, `generic_fruit_ember_plum` in `kits/catalog/krator-master-furniture-generic-fruit.js`). The
catalog change reaches every build that takes the generic fruit file, so each is rebuilt and the baseline checked.
`NECANYONS.HARVEST` and `.PLANTS` carry `HV()` tags in the hyperjungle's shape; `MEDICINE-FUEL.md` gets a row.

## 6. Textures

**Reused from the library** (nothing to make): `rock.sandstone.navajo` (stack fins), `rock.sandstone.red` (boulders),
`rock.sandstone` (layered walls in shade), `ground.redsoil` (floor, farm sand), `card.carnivore.plants` (mixed carnivore
clumps on the ledges; its sun-pitcher and sundew cells until the new sheets come), `card.moss.carnivorous` (the hanging
gardens' carnivorous moss), `organic.funnel.trumpet` (sun pitcher and yellow tube mouths from above), `bark.strangler`
(stack-fig roots), `card.broadleaf` (stack-fig leaves), `card.orchard.broad` (ember plum), `card.crop.plume` (fonio,
tinted), `card.ichu` (ringgrass, tinted blue-grey), `bark.skirt` (stilt-lily trunks), `skin.cactus` (rock-bottle stems),
`card.flower.bloom` (rock-bottle flowers), `card.fern` and `card.treefern` (seep curtains), `card.lichen`, `card.vine` and
`card.vine.hanging.*` (turncoat and monkeycup vines), `card.strap.pandan` (yellow tube, tinted), and the hyperjungle's own
sets, read in place.

**Owed:** six images, all in `core/materials/PROMPTS-NEEDED.md`, section 6. Three more there are optional, each with a
library fallback that it names.

| Id | Kind | For |
|---|---|---|
| `rock.sandstone.bedded.red` | tile | already owed (section 5): the mesas' and benches' bedded walls, shared with Pinnacle Rock |
| `ground.slickrock` | tile, top-down | the cap plateaus: scoured pink sandstone pavement, joints, black crust, lichen |
| `rock.sandstone.varnish` | tile, wall | the canyon walls and stack faces: desert-varnish streaks, seep stains |
| `card.carnivore.monkeycup` | cut-out sheet | the monkeycup's hanging pitchers, seen close on the walls and edge trees |
| `organic.trap.lobe` | cut-out sheet | the clapjaw's trap lobes, mapped on hinged geometry so they can shut |
| `card.carnivore.sundew` | cut-out sheet | rimdew, the medicinal plant: it must read clearly up close |
| `card.palm.fan` (optional) | cut-out sheet | the gorge fan palm (fallback: `card.palm`'s palmetto cells) |
| `card.flametip` (optional) | cut-out sheet | the benches' scarlet flush (fallback: `card.croptree.glossy`, tinted) |
| `card.treelily` (optional) | cut-out sheet | the stilt lily's tufts and flowers (fallback: `card.ichu` and `card.flower.claw`) |

## 7. Order of work

- **N0. The rock** (shared with Pinnacle Rock P1): the rock-stack generator in `core/terrain` and its test; the
  showcase's relief, carve and stacks; the `seep` and `pan` fields. Done when a canyon of red benches and stacks stands
  on the page and `verify.py --assert` passes.
- **N1. The jungle floor:** the hyperjungle read in place, thinned and lowered northward; the floor's own plants (fan
  palm, stack fig at the wall foot, turncoat).
- **N2. The walls and benches:** the hanging gardens (dressed on the rock), stack-fig roots, flametip scrub, ember plum,
  fonio pans.
- **N3. The caps:** slickrock and crust, stilt lily, rock bottle, ringgrass, yellow tube, potholes.
- **N4. The carnivores:** `37-core-traps.js` and its test; `57-biome-necanyons-carnivores.js`; the shader motion; the
  `carnivores` layer; trap records in `core/tags`.
- **N5. Crops and fruit:** section 5; `FRUIT.md`, the catalog pieces, every rebuild they reach, the baseline.
- **N6. The record:** `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `WORLD.md`, the gallery entry. Pinnacle
  Rock then takes the kit for its mesa top and walls (its `PLAN.md` "Biome" row).

## 8. Questions (settled 2026-10-19)

1. **The carnivore layer:** flora with a trap record, the rules in `core/biome` (`37-core-traps.js`). Settled.
2. **The plant list:** as above. Settled; the names stay working names until the Painted Men's and Korona's words exist.
3. **The map:** necanyons overlies the hyperjungle's polygon for now (the scale model's move-vertex tool is not working).
4. **The `medicine` bucket:** opened, with rimdew and the ember plum. Settled.
