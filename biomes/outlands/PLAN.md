# outlands: the plan (2026-10-26)

The **Outlands**: the walled basin east of the main crater, outside the Outer Wall, reached only over **the Gate**, a
7.7 km pass in Korona's corner. The most isolated ground on Krator and its **Socotra**: a native flora cut off for millions
of years. Home of the **Coyote Men** (therian tribes, stone and bronze age); the **Kingdom of the Tiers** of the
**Tierhounds** keeps the threshold. Exports: **emeralds, turquoise, ostrich feathers**.

**Status: plan, awaiting the owner's yes.** P0 (the survey) is done: `SURVEY.md` holds every number this plan quotes. Nothing
is built. Settled points carry the owner's date; *proposed* marks this plan's own suggestions.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/outlands/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`, `refs/`) |
| Pages | stations, as Korona's and the Throne's (`build.py --station <name>`): `dist/outlands.html` (station 1, the Fog Rim) and `dist/outlands-<name>.html` (section 9) |
| Regions on the model | `N Outlands` and `S Outlands` (biome), `Tiers` (biome, its own kit), `Coyote Kingdom` (political); markers **Trickster's House** (ruined arcology, px 1240,330) and **The Gate** (outpost, px 1136,84) |
| Object | `OUTL` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`, `byKey`, `plantOfItem`) on the `BIOME-API.md` contract (the Throne's and sedesert's shape) |
| Core | `biome`, `rand`, `tags`, `space`, `host`, `atmos`, `water`, `mask`, `terrain` (`KFIELD`, `KCARVE`, `KSTACKS`, `KRELIEF`, `KBASIN`), the shared sky; section 13 |
| Read in place | `ebadlands` (banded walls at the margins), `sedesert` (the coyote walker; nothing of its flora in the basin), `kits/fauna`, `kits/ancients` (Arcoindian II) |
| Sibling kits | `biomes/tiers` (its own plan, section 10), `kits/coyote` (the culture kit, later, section 6) |
| Out of scope | the Coyote and Tierhound buildings and dress (the culture kit); the animals' models (`kits/fauna`); the gem nodes' data (`kits/resources`) |

A new biome: it goes in the gallery when it first reaches `main`.

## 1. The ground (scale model 4.22-4.23, `SURVEY.md`)

- **Outside the Outer Wall** (the owner, 2026-10-26). The basin floors stand mostly at **3.2-3.9 km (1.0-1.07 atm)**; valleys
  run down to **289 m (1.54 atm)**. The rim and plateau round them are ET tundra, ice and the airless crest: 82% of the
  N polygon and 75% of the S polygon stand over 4.5 km. **The barrier is the Gate: 7,724 m, 0.60 atm**, the one crossing;
  a pressure-adapted lowland lineage cannot cross it, which is why the flora is alone.
- **Two basins, two climates** (the climate histogram, `SURVEY.md` section 6): **N Outlands is dry and open** (cold steppe
  BSk 34% and cold desert BWk 31% of its basin ground, median 235 mm, the driest cells 31 mm); **S Outlands is wet and
  wooded** (Dfb 43%, Cfa 13%, ~1,000-1,300 mm) with a hot valley floor (BSh, 21 °C mean) and a cold-desert shoulder.
- **Water**: one perennial river (47 m³/s, from 3,887 m to a **lake at 705 m**, px ~1382,371); a **salt lake at 2,241 m**
  (1,348 km², px 1314,320); a Cfa lake at 2,345 m (px 1316,186); frozen lakes at 6.1-7.1 km on the plateau; ~60 dry wadis.
- **Trickster's House** (the owner, 2026-10-26): **Arcoindian II, ruined**, built into the **west wall of the N main basin**
  (px ~1240,330), over a lake at 2,132 m at the wall's foot; the wall rises ~1,650 m. 1.2 atm at the quay.
- **The Gate** (an outpost on the map, the owner, 2026-10-26): px 1136,84, 7.7 km. The Tierhounds' toll fort and the
  trickster's shrine.
- **The god's road** (the owner, 2026-10-26): from **the Sleeping City** (px 772,446) **through the Gate to Trickster's
  House**: 1,938 km on the surface, highest 7,728 m beside the Gate (`openworld/gods-road.json`). The Ancients' own way in is
  a separate rim tunnel from the south-west (`SURVEY.md` section 7).

## 2. Air, scale and the island rule

- **The mix** (the owner, 2026-10-26): flora **90% native**, nothing closely like an Earth plant; fauna **~66% native,
  ~33% Earth-like**, native **hexapods** dominant, **ostriches** roam.
- **Socotra for the biogeography, not the look**: endemism, water stored in the body, forms that comb fog. No plant copies
  Socotra's (no dragon's-blood umbrellas, no bottle trunks, no Welwitschia).
- **The native lineage is fungoid** (`biomes/swhighlands/PLAN.md` section 3, `biomes/swbay`): fleshy bodies carrying a
  **photosynthetic partner** in caps, fringes and pads, as a lichen does: green, teal, violet and rust on top, pale and fleshy
  beneath; true decomposers keep to dead wood, carrion and nests. **No leaves, no flowers, no wood grain**: spores, pods,
  sealed skins.
- **Colour carries it**: violet and teal in the fog woods, copper blue-green on the gem hills, rust and bone on the steppe,
  white salt, the red of the basalt rim.
- **Hexapods and plants evolved together**: they graze, tend, nest in and carry the spores of the native flora (the nursery
  plants). The Earth-like animals came late, with people.
- **Scale**: dense valley air allows size, but **no giants**: the tallest fog-combers reach 16 m.

## 3. Zones by height and water

The survey's working rule: **the flora zones by height first, then by water**. Each zone is a `BIO.field` mix the kit
derives from height, rain and the fog belt; every zone is a `core/tags` area.

| Zone | Height | Climate | Air | Rain, temp | Where | Stations |
|---|---|---|---|---|---|---|
| **Z1 Valley floor** | 0.3-1.4 km | BSh, WH (lake) | 1.4-1.5 | 500-600 mm, 21-22 °C | the river and the 705 m lake | S3, N3 |
| **Z2 Wet valley** | 2.0-3.0 km | Cfa | 1.1-1.2 | 800-1,300 mm, 11-14 °C | the valleys' sides, Trickster's House | S2 |
| **Z3 Fog woods** | 3.5-4.4 km | Dfb, the fog belt | 0.95-1.0 | 900-1,200 mm, 5 °C | the S basin's windward wall | S1 |
| **Z4 Cold steppe** | 3.5-4.0 km | BSk | 1.0 | ~235 mm, 8 °C | the N basin's plains | N1 |
| **Z5 Cold desert** | 2.3-3.9 km | BWk | 1.0-1.2 | 30-150 mm, 8-14 °C | N2's plateau, S4's gem shoulder | N2, S4 |
| **Z6 Salt** | ~2.2 km | BSk | 1.2 | dry | the salt lake and the pans | N1 (edge) |
| **Z7 Wadis** | all | (follows) | | episodic | ~60 dry channels, fans at every wall's foot | all |
| **Z8 Plateau and rim** | 4.5-7.5 km; crest over 9 km | Dfc, ET, EF; O | 0.9-0.6; none | 0-450 mm, 2 to -15 °C | the frozen lakes, patterned ground, the Gate | the Gate |

## 4. The plant list (34 native, 3 Earth-like: 92% native)

Working names; keys in brackets. **Build** names the parts the builder draws (section 12's fungoid helpers); **Tex** names
the library set or the new set (section 11). Every plant is a record registered in `core/tags` before it is drawn,
placed by `KRAND` from a cell hash and `core/mask` rasters, cleared by `BIO.clearOf`.

### Trees and tall forms

| Key | Name | Zone | Form, size | Build | Colour | Harvest | Tex |
|---|---|---|---|---|---|---|---|
| `veilcap` | **Veil cap** | Z3 (Z2 high) | a smooth pale pillar under a flat disc cap 4-7 m across, hung with a fringe of fine threads that comb the fog and drip into a ring basin at the foot; 10-16 m | stalk, disc cap, thread fringe (cards), root ring | cap violet-teal on top, flesh-white under; threads silver | fibre (threads), drip water | `organic.cap.violet`, `card.fogcomber` |
| `combmast` | **Comb mast** | Z3 | an unbranched tapering mast with paired thin comb-plates up its windward side like a ladder; 8-14 m | stalk, comb plates (instanced) | mast rust-brown, combs teal | gum (drip gum: incense for the caravans) | `bark.whorled` (tinted), `organic.cap.glossy` |
| `deckcap` | **Deck cap** | Z2 | three or four decks of small caps up one stalk, the woodland canopy of the wet valleys; 6-10 m | stalk, stacked caps | green-teal decks, grey stalk | fibre, fodder | `organic.cap.porous` (tinted) |
| `pleatcol` | **Pleat column** | Z2, Z5 | a ribbed sealed column that swells after fog and shrinks in drought, in groves on ledges; 3-8 m | ribbed bladder (lathe with pleats) | blue-grey to teal skin, rust pleat edges | **water** (tapped: the tribes' wells) | `organic.pleat.skin` |
| `lantern` | **Lantern stalk** | Z3 understorey | a pale stalk topped by a cluster of pods that glow gold at night; 4-7 m | stalk, pod cluster (emissive) | bone stalk, gold pods | none (sacred to no one; the hexapods eat the pods) | `organic.pod.honeycomb` (owed, §17) |
| `podtower` | **Pod tower** | Z5 (N2), Z4 | a spongy tapering tower riddled with egg chambers the hexapods tend; 3-6 m | bladder stack, holes (decals) | ochre-orange, dark chambers | food (grub-bread, *proposed*), wax | `organic.pod.honeycomb` |
| `pipereed` | **Pipe reed** | Z1 | stands of hollow orange tubes in the river shallows and the lake's edge; 2-4 m | tube clusters | orange, black rims | fibre, roofing | `card.fungus.drip` (tinted) |

### Shrubs and cushions

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

### Ground, rock and water

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
| `ribbon` | **Ribbon mat** | Z7, Z1-Z2 | green ribbons streaming in spring runoff | water cards | green | fodder | `card.outlands.wadi` |
| `bellpool` | **Bell pool** | Z1-Z2 springs | hanging bell bladders on a pool's lip | bladders | teal, pale | water | `card.outlands.wadi` |
| `curtain` | **Curtain weed** | Z1-Z3 seeps | a trailing veil over wet rock | hanging cards | dark green, violet | fibre | `card.outlands.wadi` |
| `glowbell` | **Glow bell** | Z2-Z3, the cursed shelf | a bell of tubes lit at night | tube cluster, emissive | blue-green glow | none | `card.outlands.wadi` |
| `mirepad` | **Mire pad** | Z1 (the 705 m lake) | big floating pads round the lake's shallows | floating discs | olive, rust rims | food (*proposed*) | `organic.cap.glossy` (tinted) |
| `frostpuff` | **Frost puff** | Z8 | white woolly spheres in fellfield; 0.1-0.4 m | spheres | white | none | `organic.mossball` (tinted white) |
| `icecrust` | **Ice crust** | Z8 | black crust on stones by the frozen lakes | rock cover | black, green | none | `ground.lichen.crust` (tinted) |

### The decay layer (shared with the SW highlands and swbay, defined here first)

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
- **The cursed city** (Trickster's House) carries the most untouched stand: glow bells and glow tubes in the dark shelf,
  pleat columns on the terraces, lace crust on the panels, brood pads in the rooms.
- **Harvests** feed `core/hamlet` and the culture kit: fibre (veil threads, pipe reed, curtain weed), gum (comb mast), dye
  (ember red, lace blue-green), water (pleat column, bell pool, drums), fodder (cushions, sac brush, needle fur), food
  (*proposed*: drums, pod-tower grub-bread, mire pads). **The tribes tap where no spring runs.**

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
| **The Gate**: a high defile through the rim, snow, cairns, the toll fort | px 1136,84 | `KRELIEF`, snow cover; the road as a record (a flattened strip on `KFIELD`) |

## 6. The people's side (settled unless marked)

- **The Coyote Men** are **therians** (coyote-headed, digitigrade, upright), stone and bronze age, never Izani subjects.
  They **bark a dialect of the Hum**: the tones as barked pitch contours, a howl ends a sentence (*proposed*: the consonants
  cut to *h k w y m n*, with snaps for *p t s l*); they write it in **contour carvings** on milestones and boundary stones.
- **The four tribes**: **Sunset, Sunrise, Valley, Peak**. *Proposed* homes: the **Valley** tribe, the sedentary bronze-age
  farmers, on the river (S2-S3); the **Peak** tribe on the fog wall and the gem hills (miners and tappers, S1, S4); **Sunrise**
  and **Sunset**, nomadic goat-and-ostrich herders on the N plains (N1), east and west.
- **The Tierhounds** rule the **Kingdom of the Tiers** (the "Coyote Kingdom" to outsiders) on the threshold and keep the Gate
  (*proposed*: hound-headed therians, kin to the Coyote Men).
- **The trickster** is a god in the shape of **the runner bird**, who runs the ancient roads (the easter egg: it reads as the
  cartoon Road Runner, drawn as the Outlands' own bird, not a copy). **The god's road** runs from the Sleeping City through the
  Gate to Trickster's House, where **the god lives**: the Coyote Men **shun the ruin** as cursed, and misfortune is a **real
  luck hazard** that grows the longer one stays in its keep-out ring (a `core/tags` area; section 12). **A boy is a man when he
  has caught a runner bird**; the surest place to find one is the road's end.
- **The phoenix** is the other god: it dies at the end of every age and rises more glorious. Its living form, **the golden
  bird**, is wholly sacred: **anyone known to have killed one is attacked on sight**; *proposed* in play: carrying its
  feathers makes every Coyote tribe and the Tierhounds hostile.
- **Feathers**: the runner bird's are sacred and the dearest; the ostrich's are the common export.
- **The trade**: Izani caravans over the Gate; emeralds, turquoise and feathers out; grain, metal and cloth in; the Tierhounds
  take the toll.
- **Lore status**: none of this is in `LORE.md` yet (P1).
- **The culture kit** (`kits/coyote`, its own plan later): the Tierhounds' stepped towns and toll fort, the Valley tribe's
  mud-brick villages, the herders' camps, the shrines and milestones, dress, and a people for
  `core/charactermodels/data/peoples.json`. Until then the stations carry walls, terraces, huts and the fort as plain records.

## 7. Fauna (`kits/fauna`)

About 13 species: **8 native, 5 Earth-like**.

| Key | Animal | Kind | Where | Note |
|---|---|---|---|---|
| `plaingrazer` | plains grazing hexapod | native, herds | N1 | on `faWdHex` with the `amb` anatomy (hide, vertebrate eyes, padded feet: not insects) |
| `nurser` | nursery-tender | native | N2 | keeps the pod towers and brood pads |
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
| `goldbird` | **golden bird** | native soarer (*proposed*) | the thermals over S1 | the phoenix's form; sacred |

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
| 1 | **The Fog Rim** (`dist/outlands.html`) | S1, px 1337,393, Dfb 3.9 km, 1,176 mm | the fog belt on the windward wall, veil caps and comb masts, fog pelt, lantern stalks, seeps and curtain weed; the showcase, built first |
| 2 | **The River** (`-river`) | S2 px 1369,346 (Cfa 2.9 km) down to S3 px 1384,389 (BSh 1.1 km) | the Valley tribe's terraced fields on the perennial river, deck caps on the slopes, pipe reeds, mire pads on the 705 m lake; the Earth-like three |
| 3 | **The Gem Hills** (`-gems`) | S4, px 1352,391, BWk 2.3 km | copper-stained mesas and fins, lace crust, turquoise shelves, green fans on spoil, open-cast benches |
| 4 | **The Plains of Runners** (`-plains`) | N1, px 1344,209, BSk 3.7 km | ostrich flocks and grazing hexapods on needle fur and grey cushions, tors and inselbergs, a herders' camp, the salt lake's edge |
| 5 | **The Nursery Plateau** (`-nursery`) | N2, px 1269,130, BWk 3.8 km | pod towers, brood pads and gall stacks on desert pavement, yardangs; the strangest page |
| 6 | **The Gate** (`-gate`) | px 1136,84, 7.7 km | the defile, snow, the toll fort and shrine, cairns, the god's road; frozen lakes and patterned ground near |
| 7 | **Trickster's House** (`-house`) | px 1240,330 | the ruined half-cave arcology over its lake, overgrown; the keep-out ring of turned-away stones (*proposed*); the luck hazard |

Optional later: N3, the 705 m lake shore (a warm oasis page), if station 2 cannot hold it.

## 10. The Tiers (`biomes/tiers`, its own plan)

The owner's decision (2026-10-26): **`tiers` is a biome of its own**, on the `Tiers` biome polygon (px 886-1118 by 52-278;
the same ground as Korona's NE and the Coyote Kingdom). The dry, terraced country of the Tierhounds between Korona's rings
and the Gate: sedesert and ebadlands scrub (read in place) with Outlands species leaking out by the Gate (pleat columns and
cap-shrubs in gardens and as stragglers), terraced fields, the stepped towns. It gets its own `PLAN.md` before it is built
(phase O8).

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

**New** (13 prompts, `core/materials/PROMPTS-NEEDED.md` section 19): `ground.wadi.cobble`, `ground.pavement.desert`,
`ground.biocrust.fog`, `rock.turquoise.vein`, `rock.schist.emerald`, `ice.lake.saltrim`, `organic.cap.violet`,
`organic.pleat.skin`, `organic.lace.copper`, `card.fogcomber`, `card.outlands.scrub`, `card.outlands.crust`,
`card.outlands.wadi`. For the culture kit, later: a coursed sun-dried brick (not prompted yet).

Adoption: `biomes/outlands/materials.json` and `python3 tools/textures/pack.py biomes/outlands` (commit `tex/`).

## 12. Core amendments needed

Ranked by when they block. Each follows its module's README and lands with its own node test and baseline check.

| # | Amendment | Module | Why | Blocks |
|---|---|---|---|---|
| C1 | **A height-band fog belt**: `ATMOS.fogBelt({y0, y1, windward, density})`, a cloud band that hugs the slope between two heights, thicker to windward, thinning where the ground rises through it, with a JS twin (`fogAt(x, y, z)`) and an export record. Today `cloudDeck` is a level top and the old mist edge was host code | `core/atmos` | the fog belt is the Fog Rim's defining feature; the fog field also places the veil caps | station 1 |
| C2 | **A shared fungoid geometry fragment** (the owner, 2026-10-26: **in `core/biome`**): `core/biome/33-core-fungoid.js`, opt-in through `CORE_BIOME`, extending `BIO` as `BIO.fung`: `cap` (disc, dome, funnel; gills or pores underneath), `bracket` (shelf rows on a trunk or rock), `bladder` (a lathe body with pleats, swell as a parameter), `pod` and `podCluster`, `stalk` (tapered, bent, ribbed), `fringe` (hanging thread cards), `comb` (paired plates up a mast), `tube` (clusters, open tips, an emissive rim option) and `crust` (flat lobed decals on ground or rock). Each part takes a record (sizes, counts, colours) and a `KRAND` stream, never draw order; defaults as `x == null ? d : x`; geometry goes into the kit's families through the existing `leafMat`/`barkMat` path so instancing, LOD and the export are unchanged. A node test (`test-fungoid.js`: same record and seed, same vertices; counts per part). Today each kit copies its own (`bracket()` in swbay, nwbay, rift and hyperjungle; the Throne's `cap`/`capTube`/`bladders`; swbay's `capTop`; nhighlands' `discStalks`): **those kits are not moved by this step** (their pages would change); each may switch later, page by page, with its baseline rewritten on purpose | `core/biome` | 34 species of one lineage; the SW highlands and the swbay backfill need the same parts | station 1 |
| C3 | **Strata into core** (`core/terrain/STRATA-PLAN.md`, step 1 then recipes) with an **`outland` recipe**: red vesicular basalt caps over pale tuffs and red beds, thin green and turquoise copper bands, white altered zones | `core/terrain` | the basin walls, the gem hills, Trickster's wall; and plants placed by bed (`S.at`) | stations 1, 3, 7 |
| C4 | **Dry relief forms**: `KRELIEF.wadi` (a dry `river`: braided cobble floor, cut banks, a fan at the mouth), `talus` aprons (Korona's `talusH` lifted), `KSTACKS` kinds `dome` and `tor`, `KRELIEF.pit` (stepped benches and spoil heaps), and a `pavement` class in `KFIELD`'s cover grid | `core/terrain` | the plains, the gem hills, every wall's foot | stations 3, 4, 5 |
| C5 | **Brine and pans**: a brine colour preset for `WATER.open`/`still` (deep red-brown to turquoise to white rim), and a **pan** kind (salt crust with polygon cracks, wet after rain from `W.wet`) | `core/water` | the salt lake | station 4 |
| C6 | **Hazard and taboo keys** in the tags vocabulary (`core/tags/PROPOSAL.md`, "A hazard key"): a `hazard` record (kind `luck`, strength by time inside) and a `taboo` area (no faction record draws inside) | `core/tags` | Trickster's House's keep-out ring and its luck hazard; mine pits; brine | station 7 |
| C7 | *Later*: **an ice kind** in `core/water` (frozen lakes with salt rims, snow drifts on the ice); until then the plateau lakes are ground cover | `core/water` | the plateau | station 6 (optional) |

**Kit additions, not core**: `kits/fauna` (the ostrich, the runner bird, the golden bird, the eight hexapods), `kits/resources`
(emerald and turquoise nodes), `kits/crops` (the `outlands` entry and four native records).

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
| **O0** | P0 survey (done); this plan approved; markers on the model (done); the owner's reference plates in `refs/` | the owner's yes |
| **O1** | **Lore**: `LORE.md` §6 entry (the Coyote Men, the Hum dialect, the four tribes, the Tierhounds and their kingdom, the two gods, the Gate, the god's road, Trickster's House, the trade); `biomes/README.md`, `WORLD.md`, `INDEX.md` rows | the owner approves the names |
| **O2** | **Textures**: the 13 new sets and the five owed ones delivered and processed; `materials.json`; `pack.py` | the contact sheet passes in the demo kit |
| **O3** | **Core amendments C1 and C2** (fog belt; fungoid parts), each with its node test; `port_baseline.py` reads `same` for every build that did not ask to move | tests pass |
| **O4** | **Station 1, the Fog Rim**: the kit's fields and zones, the S wall, the fog belt, the fog-wood species, seeps | `verify.py --assert`, `check_core_use.py` |
| **O5** | **C3, C4**; **stations 3, 4, 5** (gem hills, plains, nursery); the fauna and resource additions | each verified |
| **O6** | **C5**; **station 2, the River** (fields as records, the Earth-like three, the lake) | verified |
| **O7** | **C6**; **station 7, Trickster's House** (with `kits/ancients`' Arcoindian II), **station 6, the Gate** | verified |
| **O8** | `biomes/tiers` plan and build; `kits/coyote` plan | the owner's yes on each |
| **O9** | `PORT.md`, index tools, the Godot export check, the gallery (the owner allows once) | published |

## 15. Open questions

1. ~~C2's home~~ Settled (the owner, 2026-10-26): a `core/biome` fragment, `33-core-fungoid.js` (section 12).
2. **The fog belt (C1)**: approve a core amendment to `core/atmos`, or keep the belt kit-local for the first station?
3. **Reference plates**: will the owner supply plates for the native flora (as for swhighlands), or work from this list?
4. **Gem ranges**: emerald and turquoise both in the S gem hills (this plan), or emerald in the N?
5. **The golden bird**: native (a gliding hexapod-winged soarer) or Earth-like (a raptor)?
6. **Names still open**: the Kingdom's capital, the pass's own name (beyond "the Gate"), the rivers and lakes in Coyote speech.
7. **Station count**: seven, or fold the Gate into the Tiers' build?
