# The Labyrinth: the plan (seed, 2026-11-09)

The Labyrinth (`rmw8bqrn3dnx4`) is a canyon maze cut into the SW Glaciated Dome, in the far south-west of map 5.1. The
Historians suspect it was once a ranch or a preserve of the Ancients. Its animals are Earth's Ice Age megafauna, grown larger
than Earth ever had them, and they live nowhere else on Krator. A people descended from the arcology at its eastern entrance,
the **Kimr** (the owner, 2026-11-09), lives among them, in raised pueblos. Kimr hunters range north into the Firebliss Range
(`biomes/firebliss/PLAN.md`).

This is a seed from the owner's brief (2026-11-09) and the map. Its names marked **TBD** are the owner's to give. Nothing here is
built; it is a kit for the rebuild's queue, after the frozen integration pass.

## 1. What the map carves (Gemini, map 5.1)

The region and its note are in `tools/scale-model/smodel/nw_expansion.py`; the carving is
`tools/scale-model/build_425_master.py` section 9. The numbers below were read from the model (`smodel.page`, 2026-11-09).

- **Size:** 62,430 height cells of 2 km, about 250,000 km² (the region's note: 250,872 km²). It spans 5.1 px x 90-393,
  y 1349-1640.
- **The dome:** the map's west and south edges are an airless barrier, 9-12 km high (class O). Inside it, the glaciated dome
  falls from about 6,200 m in the south-west to 4,850 m on the north-east, toward the Rift and Copper Glacier. Uncollapsed
  horsts hold the dome's height.
- **Three bands, west to east** (the map's own progression, a Martian *Noctis Labyrinthus* turned to ground):
  1. **The pit chains** (W and SW): beaded pit-crater catenae, floors 2,650-3,650 m, with tarns at 2,839 m (px 176,1564)
     and 2,919 m (px 148,1467). Their meltwater runs as the **Siphon-Pit Beck** (`r_lab_cat_nw`) and the **Graben-Tarn Gill**
     (`r_lab_cat_sw`), both named in the Tungang tongue.
  2. **The grabens** (centre): three sets of faults cross, so the floors (1,550-2,950 m) are a net of diamond and polygonal
     corridors between snow-capped horst bastions at 4,950-6,150 m. Here, a floor and the bastions round it are often 3-4 km
     apart in height, within 12-25 km.
  3. **The chaos** (E and NE, px 245-388, 1352-1595): 22 tilted flat-topped mesas and 16 knobby pyramids stand in an
     anastomosing outflow amphitheatre, 1,350-2,150 m. It breaches north-east into the Rift, below Wildcat, and north into
     Copper Glacier.
- **Heights** inside the polygon: p5/p25/p50/p75/p95 = 1,630 / 2,250 / 3,761 / 5,435 / 6,192 m. Two-fifths of the ground
  (24,357 cells) is floor between 1,500 and 3,000 m; a third (21,783) is the dome and the bastions at 5,000-6,500 m.
- **Water:** eight lakes, 462 cells, falling eastward:

  | Lake | Level | Cells | Centre px |
  |---|---|---|---|
  | NW pit tarn | 2,919 m | 23 | 148,1467 |
  | SW pit tarn | 2,839 m | 29 | 176,1564 |
  | graben lakes | 1,979 / 1,919 / 1,820 / 1,720 m | 66 / 64 / 69 / 54 | 234,1424 / 248,1556 / 244,1482 / 284,1418 |
  | chaos lakes | 1,580 m | 59 | 312,1518 |
  | the **gate lake** | 1,419 m | 98 | 328,1476 |

  The ground is lowest at the north-east breach: 1,219 m at px 367,1486, the east entrance.
- **Climate:** 15 Köppen classes inside the polygon (`test_smodel.py`'s check: BSk, BWk, Cfa, Cfb, Csb, Dfb, Dfc, Dsb, Dsc, EF,
  ET, HF, HT, O, WH). The floors are temperate to cold-steppe; the bastions are tundra and ice. Read each station's mean
  temperature and rain from the model's `tm` and `p` fields when the kit is started, as Copper Glacier's plan did.
- **People on the map:** no settlement and no polity polygon lies inside the region yet. The natives' villages and the arcology
  are new pins, the owner's to place (section 9).

The maze is the point: a few corridors out of each graben, cliffs a walker cannot climb, and one wide gate to the east. That
makes it a natural paddock. Whoever kept animals here needed few fences.

## 2. The preserve (the Historians' reading)

- **Earth's animals, not Krator's.** Elsewhere Krator's life is mostly native: Earth's forms at about 1.5 times the scale,
  with alien notes (iridescence, coral shapes, glow; `biomes/copperglacier/PLAN.md` section 3, `biomes/outlands/PLAN.md`:
  92% native). The Labyrinth turns that round. Its large animals are Earth's Pleistocene mammals, and its ground cover is
  Earth's mammoth steppe. Native Krator life holds only the margins: the high bastions, the pit tarns, and the gate where the
  Rift's life comes in.
- **A collection, not a fauna.** The animals come from different continents and ages of Earth: South America's ground
  sloths and glyptodonts, Eurasia's woolly beasts, North America's sabre-tooths and short-faced bears, Africa's and Asia's
  odder proboscideans. They live together, as no natural fauna ever did. That is the Historians' best evidence of a keeper.
- **Larger than Earth's.** Many grow past Earth's sizes (section 4). The Historians can't say whether the Ancients bred them
  up or the long ages since did it.
- **The gate.** The arcology at the east entrance stands where a keeper would stand: at the only wide way out, on the lowest
  ground, by the gate lake.

## 3. Life: the ground (flora)

The flora is the **mammoth steppe** of the Ice Age, with its parkland and its wet meadows, plus a few native intrusions. Earth's
forms, so most species are near Earth's size. The wild melons are the exception.

| Species | Kind | Where |
|---|---|---|
| **Steppe grasses and sedges** (wheatgrass, fescue, wormwood, sedge tussocks) | the grazing ground: tall in the wet grabens, short and grazed on the chaos floors | every floor under ~3,000 m |
| **Forbs** (sage, saxifrage, steppe flowers) | the summer's colour, cropped round the herds | the floors |
| **Parkland trees** (larch, birch, poplar, willow) | open stands and gallery woods by the water, browse lines cut flat by the tall browsers | the grabens' lake margins and streams |
| **Dwarf scrub** (dwarf birch, willow, juniper) | heath, knee-high, torn up where the herds pass | the pit chains and the bastions' feet |
| **Wild melon** (**TBD name**: a giant gourd vine) | trailing vines and melons up to 1 m across, ripening late in the dry season, fermenting where they fall | the warm graben floors and the chaos floors' sun traps |
| **Cushion and lichen** (Krator's cold lineage) | the native margin: domes and plates | the bastions over ~4,500 m, the pit rims |
| **Pit-tarn natives** (Krator's iridescent water plants) | the native refuge in the cold tarns | the two pit tarns |

The wild melon is the Labyrinth's one invented plant, and the animals' and people's shared prize (sections 4 and 5).

**The animals make the ground.** On a preserve this full, the grazing and the trampling should show:
- **trails** worn along the graben corridors and up to every lake;
- **wallows**, mud and dust, in the floors;
- **browse lines** on the trees;
- **dung** in the grass and the people's fuel stacks;
- **bone yards** at the foot of the cliffs and in the sabre-tooths' lairs;
- **rubbing rocks** polished shiny by hide.

These are as much the biome as the plants are (section 7).

## 4. Life: the animals (`kits/fauna`)

The fauna kit owns the animals (`kits/fauna/API.md`: the life record's diet, temperament, `herd`, `fleeDistance`). The sizes
below are the kit's targets: Earth's figure, then the Labyrinth's.

| Animal | Earth's model | Earth's size | The Labyrinth's | Habit |
|---|---|---|---|---|
| **The great Aurochs** | *Bos primigenius* | 1.8 m at the shoulder | **3.5 m at the shoulder, 7-8 m long**: a small bus | the king of beasts to the natives: herds of cows and calves led by an old bull; the only animal they revere and hunt only in rites |
| **Ground sloth** | *Megatherium*, *Eremotherium* | 6 m tall standing | 8-9 m standing | browses the parkland trees on its hind legs; slow, and lethal when cornered: claws a metre long |
| **Giant armadillo** | glyptodont (*Doedicurus*) | car-sized, 2 t | 5 m long, a domed shell 2 m high; some with a spiked tail club | grazes the wet floors; the natives roof and shield with its shells (section 5) |
| **Strange pachyderms** | gomphotheres, *Platybelodon* (shovel-tusker), *Deinotherium* (down-curved tusks), *Stegodon* | 3-4 m at the shoulder | 4-5 m | each kind keeps to its own floor: the shovel-tuskers in the lakes' shallows, the deinotheres stripping the gallery woods |
| **Woolly mammoth and woolly rhino** | *Mammuthus primigenius*, *Coelodonta* | 3.4 m; 2 m | 4.5 m; 2.8 m | the cold kinds, high on the pit chains and the bastions' feet |
| **Giant elk** | *Megaloceros* | 2.1 m, antlers 3.6 m across | 2.8 m, antlers 5 m | the open chaos floors |
| **Sabre-tooth** | *Smilodon populator* | 1.2 m, 400 kg | 1.6 m, 700 kg | ambushes from the mesas' talus and the graben walls; the people's great danger, after the Two-Snout |
| **Short-faced bear** | *Arctodus* | 1.8 m at the shoulder | 2.4 m | scavenges the bone yards; drives the sabre-tooths off their kills |
| **Dire wolves** | *Aenocyon dirus* | 0.8 m | 1.1 m | packs that follow the herds through the corridors |
| **The Two-Snout** (**invented**) | a two-trunked mammoth | none | 4-5 m at the shoulder | see below |

**The Two-Snout** is the one the natives try to avoid. It is a mammoth with two trunks from one broad snout, each trunk able
to grip and throw. It is uncannily intelligent. Two-Snouts have been known to drop rocks from the graben rims on human
hunters, and to set up feints: one shows itself while the rest of the family circles behind.

**The History Monk's account.** A History Monk posted from Longsong to this remote and savage region wrote that the Two-Snouts:
- keep their own funeral customs;
- paint one another, with ochre and mud;
- set fermented melons aside for later occasions.

Many at Longsong think he may have had a few too many fermented melons himself. The kit may show all of it, as things a
patient player might glimpse, never as anything explained:
- a Two-Snout family standing round a bone heap;
- smeared ochre on a flank;
- a cache of melons in a cleft.

(The Monk's report belongs in the lore beside Longsong's records: `LORE.md` section 6.15.)

**The natives' rule:** every part of every animal is used (section 5). So the fauna kit wants each animal's carcass, hide,
horn and bone as pieces and resources, not just the live animal.

## 5. The people: the Kimr

The Kimr descend from the arcology's people. They live in small villages in the manner of the Zuni and Hopi
pueblos.
- **The pueblo is a platform.** Each village is a raised fortress against rampaging megafauna:
  - **The rock:** it stands on a chaos knob, a mesa bench or a built stone plinth, 6-15 m above the floor.
  - **The room blocks:** stepped, set back storey by storey, with no doors at the ground.
  - **The way in:** by ladders and roof hatches, pulled up at night or when a herd runs.
  - **The courts:** below the plinth, a walled pen and a court for the kiva-like round rooms.
- **The Aurochs.** The great Aurochs is their symbol and the king of beasts. Their most famed warriors and kings wear its horns
  on their helmets. Its image is painted and carved at every village's crest, and its hunt is a rite.
- **Every part of every animal.** Their crafts:
  - glyptodont shells as roofs, shields and cisterns;
  - mammoth and pachyderm ivory and bone for tools and frames;
  - hides for screens, boats and drums;
  - sinew and gut for cord;
  - dung for fuel, stacked by the walls;
  - horn for vessels and the helmets;
  - fat for lamps;
  - the melons for food and drink.
- **Their villages in the biome kit:** the biome kit places the village sites, plinths and keep-clears, as Crystal Cavern
  massed its caverns for the Hearth hold. The pueblos themselves are a **settlement kit** of their own: a culture in
  `kits/catalog` and a building kit, placed with `core/hamlet`.

## 6. The arcology at the gate (name TBD)

At the eastern entrance, the breach to the Rift, stands an Ancient arcology (**TBD**). The natives' ancestors came out of it.
- **Its site:** the gate lake (1,419 m, px 328,1476) and the lowest ground at px 367,1486, between the chaos mesas.
- **Its form is the owner's call.** It is a new target in `kits/ancients`, like the Quintagon, which Gemini added on
  2026-11-08 for other ground: a coastal and plains form, not this one. A keeper's arcology might read as:
  - **a gatehouse:** walls and towers across the breach, sluices on the lake;
  - **a barn:** long low halls, stockyards cut in the mesas;
  - **a lodge:** a tower over the paddock, viewing decks.

  Which it was is the Historians' question.
- **Its state:** ruined, partly reused by the natives; the biome kit draws it as an Ancients ruin with `KFAR` far masses, the
  kit's pieces close.

## 7. Core adoption (written first, as the working rules ask)

The modules this kit takes (the table in `README.md`, "CORE MODULES ARE NOT OPTIONAL"), with what each draws here.

| Need | Module | How |
|---|---|---|
| randomness | `core/rand` (`KRAND`) | every placement seeded by (world, cell, index, salt) |
| the maze's land | `KRELIEF` (`38-core-relief.js`, `38c-core-landforms.js`) | `stepcut` and `scarp` for the graben walls and benches, `maar` and `stepcut` for the pit catenae, `range` for the bastions, `KRELIEF.waters` for the tarns |
| the chaos | `KSTACKS` (`37`) | the tilted flat-topped mesas and the knobby pyramids, seated by `core/terrain/SEAT.md` |
| strata | `KSTRATA` (35, `35c` vary) | the dome's bedded walls, tilted with the mesas |
| ground | `KGROUND` (43), `KHORIZON` (45), `KFAR` (44) | the steppe, the trails and wallows as documented masks, relief on every station; the far maze and the arcology as far masses |
| frost | `KFROST` (42) | patterned ground on the pit chains and the bastions |
| glacier | `KGLACIER` (44g) | the dome's ice caps on the bastions, where a station sees them |
| flora | `core/biome` | the mammoth steppe on the biome core; `BIO.flareJoin` on the trees; impostors for the parkland trees over 7 m |
| water | `core/water` | the lakes (`WATER.open`), the becks and gills (`WATER.flow`), the wallows (`51`'s still pools) |
| sky, weather | `core/atmos` | the standard sky; the dust season over the chaos floors (`fx/89-atmos-fx-dustseason.js`, crater-drylands') |
| shadows | `core/shadow` | off at load, as every kit |
| fauna | `kits/fauna` | the herds as `BIO.record` records registered before they are drawn |
| hazards | `core/hazard` (`KHAZ`) | falls at the graben walls, plus the megafauna (see the amendments) |
| settlements | `core/hamlet` | the pueblo sites (section 5) |
| tags, space, mask, host, export, materials | `core/tags`, `core/space`, `core/mask`, `core/host`, `core/export`, `core/materials` | as every kit |
| city | `core/city` | no: the villages are hamlets, and the arcology is a ruin |

**Core amendments the Labyrinth needs** (none is a new module):
1. **Animal sign on the ground**:
   - trails, wallows, dung, browse lines, trampled grass and bone yards drawn from the herd records;
   - a herd's range becomes `KGROUND` masks and decals, and the trails follow the graben corridors (`core/biome`, with `kits/fauna`).

   The open world will want it wherever herds live.
2. **A charge hazard in `KHAZ`:** a herd that runs, or a Two-Snout's dropped rock. A moving hazard bound to a fauna record.
   Today's kinds are lava, fire, trap, time, mine and luck.
3. **The intersecting graben net as a record generator:** three fault trends, giving corridors and bastions, a recipe on
   `KRELIEF.stepcut` that the Siphon Pits (`biomes/siphon-pits`) and the Loom-Chasms' horst-and-graben can share.
4. **`core/hamlet`'s defended platform:** a village on a plinth or a mesa bench, entered by ladders, with its pen below
   (section 5). Pinnacle Rock and the cliff villages may share it.

## 8. Stations (proposed, on the 5.1 map)

World km = 5.1 px x 2; a page's site is the old canvas px (5.1 px less 272, 330).

| Station | 5.1 px | Ground | What |
|---|---|---|---|
| 1 **The Gate** | 328-367, 1476-1486 | the gate lake at 1,419 m; floor 1,219-1,630 m; mesas rising 3.3 km within 12 km | the east entrance: the arcology's ruin across the breach, a pueblo on a knob above the lake, the herds coming down to drink, the Rift's life at the edge |
| 2 **The Paddocks** | about 244,1482 | a graben lake at 1,820 m; floors 1.6-2.3 km under bastions to 6 km | the heart of the maze: a diamond graben with its tall steppe, the gallery woods, browse lines, the Aurochs herd, sloths in the trees |
| 3 **The Mesas** | about 260-263,1585-1594 | a mesa top at about 6,000 m over a floor at about 2,000 m | the chaos: mesas and knobs over the outflow floors, a sabre-tooth's talus lair, a pueblo on a bench, the dust season |
| 4 **The Pit Chain** | 148,1467 (the NW tarn) | a tarn at 2,919 m; floors 2.6-3.7 km | the cold west: beaded pits, the native tarn life, mammoth and woolly rhino, the Siphon-Pit Beck's head |

Each page is the usual 5.2 km square round its site. Station 1 comes first: it holds the people, the ruin and the animals all
at once.

## 9. For the owner

- **Names:** the arcology, the wild melon, and the Two-Snout's own name in the natives' tongue. The rivers are
  named in Tungang (`smodel/river_names.py`): do the Kimr speak Tungang, or a tongue of their own
  (`lore/tongues-of-krator.html`)?
- **Pins:** the natives' villages and the arcology go on the map as settlements (`model/src/60-settlements.js`). How many
  villages, and how many people? The floors could feed a few tens of thousands.
- **The arcology's form** (section 6).
- **Scale:** are the sizes in section 4 right? The Aurochs as a small bus is the owner's figure; the rest follow it.
- **The Monk:** does he get a name and an entry in Longsong's records?
- **Order:** this kit waits behind the integration pass and the queued new-region kits (`biomes/STATIONS-MAP-5.1.md`). The four
  core amendments (section 7) can be done first, since the open world and other kits want them too.

## Sources

- the owner's brief, 2026-11-09;
- `tools/scale-model/smodel/nw_expansion.py`, the Labyrinth's region and note;
- `tools/scale-model/build_425_master.py` section 9, the carving;
- the model's data at 260b90d44 (`gemini/scale-model-5.1-r3`), read with `smodel.page`;
- `tools/scale-model/river-names-5.1.md` (`r_lab_cat_nw`, `r_lab_cat_sw`);
- `biomes/copperglacier/PLAN.md`, the neighbour to the north, the form this plan follows.
