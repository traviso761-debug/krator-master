# nwouterwall: the plan (draft, 2026-10-23)

The **north-western Outer Wall**: the high country on the Outer Wall's inner flank above Farside and the Eternal State,
home of the **Yeti Kingdom** (`LORE.md` §6.19, "The northern frontier"). A dry, cold land in steps: forest-steppe at
about 4 km, open larch on permafrost above it, then tundra, fellfield, ice and the airless rim. Its theme is **fur**:
down, wool and hair on everything, so the land looks like the people who hold it.

Owner's brief (2026-10-23): the polygon `NW outer wall` (renamed from `NW boreal`) is the home of the Yeti Kingdom, a
polity of Siberian- and Himalayan-flavoured cold-modified humans with thick fur and a high tolerance for thin air,
warlike, the perpetual enemies of the Eternal State, who build heavily in **pycrete**; they have an arctic-adapted crop
package inspired by the Thule of *The Lands of Ice and Mice* (alternatehistory.com thread 222103). Settled the same day:
the kit's name is `nwouterwall`; the fur theme; **Leng is a Yeti-held ruin**; the Yeti ride **caribou** and keep **musk
oxen**; **their capital stands by the frozen lake** (px 143,177, 6,480 m); their speech is **English evolved in a
Siberian direction** (Chukchi, Koryak, Nenets, Sakha), and in it they call their kingdom **the High Country** (section 10).

**Status (2026-10-26): built through N6** on the branch `claude/nwouterwall-biome-97c462`: the Thule package in `kits/crops`
(N1), the kit on the biome core with its three stations on the scale model (N2-N4, N6), the landforms as a new core/terrain
module (`42-core-frost.js`, N5); `NOTES.md` says what each station shows, `KNOWN_ISSUES.md` what is left. Station 3 draws the
Yeti's capital from `kits/yeti` when that kit is in the tree (its own branch until merged). N7: the gallery is the merge's.

## 0. What the kit is

| | |
|---|---|
| Folder | `biomes/nwouterwall/` (`src/`, `stations/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `BIOME-API.md`, `NOTES.md`, `KNOWN_ISSUES.md`, `PORT.md`) |
| Pages | stations, as Korona's and the Throne's: `dist/nwouterwall.html` (station 1), `-taiga`, `-yeti` (section 7) |
| Core | the biome core (`CORE_BIOME`), `core/host`, `core/rand`, `core/mask`, `core/tags`, `core/terrain` (relief, carve), the shared sky |
| Read in place | `biomes/nhighlands` for the frost rowan and wall bilberry at the forest-steppe's edge; `ehighlands`' turf polygons as a ground texture; nothing copied |
| Its own flora | section 3: the larch woods, the steppe, the alas bogs, the tundra and the fellfield |
| Crops | the Thule package and its second wave as `kits/crops` records, and a `nwouterwall` biome entry (section 4) |
| Object | `NWOW` (`build`, `dress`, `SPECIES`, `PLANTS`, `HARVEST`), on the `BIOME-API.md` contract |
| Out of scope | the Yeti's buildings (pycrete halls, winter forts, Leng's occupation: a **Yeti culture kit**, `kits/yeti/PLAN.md`, which takes this kit's materials and pycrete rule, section 5); the riding caribou, the musk oxen and the cache voles (`kits/fauna`); the wall's foot facing the State (an ecotone the Eternian lowland kits meet) |

It is a new biome, so it goes in the gallery when it first reaches `main`.

### Core adoption (written before the first fragment, 2026-10-26)

| Module | Takes it for |
|---|---|
| `core/biome` | the kit contract (`BIO.init`, items, buckets, cards, bark, bake, LOD, export, `44-core-stage` for the export's light and air) |
| `core/rand` (`KRAND`) | every draw: placement reseeded per cell from a hash of (kit seed, pass, cell); the ground's detail noise (`KRAND.fbm`), no `fbm` of the page's own |
| `core/tags` | every item set, tree and plant volume is a record (`BIO.init({tags:'nwouterwall'})`) before it is drawn |
| `core/space` (`KSPACE`) | keep-clear between trees and the obstacle index |
| `core/host` (`KHOST.FULL`) | camera, loop, panel, inspector, marks (the polygon tool), probe, pictures, minimap, editor |
| `core/atmos` | `ATMOS.bindHost`; **the shared sky** (`core/atmos/sky`, `89-atmos-h-skyhost.js`) at each station's pixel, with **ridge profiles cast from the scale model's heightfield** (`region/far.py`: SKY-PLAN 3.3's "later" item); `ATMOS.bindWeather` with climate `{cold:true}` (`core/atmos/host/89-atmos-e-weatherhost.js`); **snow that lies** (`core/atmos/fx/89-atmos-fx-snowcover.js`): first snow above a line in autumn, patches in spring; the skylight for the water; cloud shade |
| `core/water` | the streams (`WATER.flow`), the alas lakes and the frozen high lake (`WATER.still`), drawn on core/atmos |
| `core/terrain` | the scale model's ground (`region/`: `extract_region.py`'s cut, `far.py`'s per-station grid and ridges), `KSTACKS` for the frost-shattered tors and Leng's ruin, `KFIELD` for the baked ground the export carries; the periglacial landforms (patterned ground, alases, pingos, aufeis, solifluction lobes, rock glaciers) as **a new opt-in core/terrain module** (`42-core-frost.js`, `KFROST`, plain maths on KRAND, with its node test), since core has none |
| `core/mask` | not taken: placement reads plain functions of (x, z) (the fields, the landforms), never a canvas |
| `core/materials` | the library through `materials.json` and `tools/textures/pack.py` (section 8) |
| `kits/crops` | read in place for the inspector's crop words (`CROPS.BY_ID`) and the beds' ids (section 4) |
| `kits/yeti` | station 3's buildings, read in place (the owner, 2026-10-26: "read kits/yeti now"); the `pyc` field is what the culture kit reads back |
| `core/city`, `core/hamlet`, `core/simulation` | not taken: no settlement is built here (the Yeti's towns are the culture kit's and the capital's own plans) |

**The final rebuild (pair 11, 2026-11-09; BACKPORT.md section 1 and its row; a cloud session, no GPU):** taken, every change in `src/`:

| Group | Taken | Where |
|---|---|---|
| Graphics | **octahedral impostors** for the four species' far trees (one set, item `impTrees`; `?diet=0` the old blobs; gain 2.4, `?impgain=`) | `55`, `89z` |
| Limb joints | **`BIO.flareJoin`** on the fur larch's and the stone pine's near limbs | `55` `limb()` |
| Held crowns | a mid larch's branches drawn as one rod each: its sprays hung from branches that were not drawn (the audit's "a far tier drops the parent") | `55` |
| Cards | `check_cells` reads 0 faults for this kit already: nothing to fix | |
| Sky and air | height fog (thin and long, a dawn mist over the lowest still), the rain cover, lightning with the storms, `BIO.bindAtmosWind`, A2C | `89a`, `89z` |
| Water | the ext 56/57/58/60, the water's fields and `BIO.env`; **`WATER.mirrorSwitch` off at load** on the largest open still | `89z`, `99` |
| Sun shadows | **`KSHADOW` off by default, `?shadow=1`** | `89z` |
| Ground | **KGROUND** for the six layers over the steppe's base (`?kground=0`), and the row's **`polygon` kind**: sorted circles on the frozen flats where KFROST lays its ice-wedge polygons; **KHORIZON** over the near box and the model's country to 16 km (`?hz=0`) | `47`, `89z` |
| Order | `88-host-build.js` is `89z-host-build.js` (after the water); the clouds' shade, the weather, the snow on the scene run there after the bake (they were in `89s`) | `89z`, `89s` |
| Station 3 | `kits/yeti` is merged: `yeti_bundle.py` reads its engine from `core/engine` (36o doors on core/door, 36s stairs) and the capital is drawn | `yeti_bundle.py` |

**Not taken, and why:** KSTRATA (the row's "strata on the wall": the near ground holds no bedded wall; the tors are granite split on its sheet
joints, which KSTACKS already draws; the Outer Wall's faces are the far land's cast ridges), talus (KFROST's rock glaciers and the gravel layer
carry the scree), KFAR (the mid ground to 20 km is the model's own country, the sky's ridges past it), thin air on the crest (the Wall's airless rim
is far land on every station's page), the ice kind on the frozen lake (the lake is drawn as its own ice sheet on the library's `ice.lake`; the
water ext's ice is for a stream or a pool that freezes in the weather), seasons by `BIO.season` (the season is the page's build input already:
KNOWN_ISSUES), R9 puddles (a dry country; oidong's finding on a KGROUND floor), KGROUND's relief (`?kgrelief=1`: each build times it on the GPU first).

**Stations on the model (N0, picked 2026-10-26 with the owner's leave; `region/far.py` SITES):** station 1 at px 220,216
(4,597 m, 0.90 atm, Dsc, mean +2 °C, ~300 mm; Leng 16 km south), station 2 at px 218,190 (5,068 m, 0.85 atm, Dsc, mean
-1 °C, 188 mm; flat permafrost ground 52 km north of Leng), station 3 at px 138,176 on the frozen lake's north-west shore
(5,831 m on the floor, the lake's level 5,680 m on 4.22; the range across the lake to 7,300 m).

## 1. The ground (scale model 4.21, surveyed 2026-10-23)

262,000 km² (px 50-661 by 2-295). Banded by the warmest month on breathable ground:

| Band | km² | Height | Air | Rain | Mean (warm/cold month) | Climate | What grows |
|---|---|---|---|---|---|---|---|
| Wall foot | 12k | ~3.2 km | 1.07 atm | 345 mm | +11 (23/-1) | Csa, BSk | the State's side; Bastion (outpost) 32 km out; an ecotone, not this kit's |
| **Forest-steppe** | 90k | ~4.2 km | 0.93 | 220 | +5 (17/-9) | Dsb, Dsc | larch on the shaded slopes, feather-grass steppe on the sunny ones; the fields |
| Larch taiga | 25k | ~5.2 km | 0.85 | 110 | -1 (12/-14) | Dsc | open larch on permafrost, alases |
| Shrub tundra | 19k | ~5.9 km | 0.78 | 125 | -6 | ET | dwarf birch, woolly willow, cottongrass |
| Fellfield | 52k | ~6.7 km | 0.69 | 78 | -11 | ET | cushions, woolly snowballs, lichen |
| Polar desert, ice | 43k | ~7.7 km | 0.6 | 15 | -16 | EF, HF | frost-shattered rock, small glaciers, rock glaciers |
| Airless rim | 33k | over 9 km | none | none | | O | bare |

- **Why the forest-steppe and not a taiga.** 220 mm with dry summers is the Khangai and northern Mongolia: larch where the
  slope is shaded and holds its snow, steppe where the sun dries it. Krator stands near 40°S, so **the shaded slopes face
  south**. Above about 5 km the ground is permafrost (mean at or below -2 °C over 123,000 km²), and the larch thins to the
  open Yakutian kind, which lives on 200-250 mm because the frozen ground holds the melt.
- **Dry summers.** The snow falls in winter, so the fields and the steppe flowers run on meltwater in spring.
- **East and west.** West of px 350 the ground is a little wetter (up to ~400 mm on the wall's face); east of it, toward
  the dam basins, it dries to ~100 mm and BSk creeps in: a cold desert-steppe variant, not a station.
- **The Yeti Valley** (the geographic polygon, 77,000 km², 29% of this one) is the high ground: median 7.1 km, 0.67 atm,
  warmest month +1 °C, about 60 mm. Fellfield, ice and the airless rim's edge. **The one lake**: 304 km² at 6,480 m
  (px 143,177), frozen most of the year.
- **Rivers** are small (all under 35 m³/s): the Yeti Valley stream runs 216 km.
- **Settlements.** Leng (ruined arcology, px 218,224, 4,621 m, 313 mm, +2 °C: the forest-steppe) is inside, **held by
  the Yeti**. Below the wall: Farport (56 km), Yith (78 km) and Fulcrum (60 km) in wet Farside (~2,000 mm); Lux (69 km)
  and Bastion (32 km) on the State's side; Boatmurder (31 km) in the dam basin to the east.

**Why the Yeti are warlike.** Their heartland, the Yeti Valley, cannot feed them: it is fellfield and ice. Their food
is the forest-steppe below it, and the rich country they raid, Farside and the State's lowlands, lies below that.

### The central valley, warmer (the model's 4.22; the owner, 2026-10-23)

The trough round the frozen lake (~18,000 km² under 6.6 km, px ~78-225 by 86-253) has its floor at ~6.3 km on 4.21:
warmest month +4 °C, coldest -22, mean -9, ~125 mm, 0.73 atm: too cold to farm. The owner asked for it a little warmer
and more fertile, with enough freezing left for pycrete:

- **The trough lowered ~800 m** (the floor to ~5.5 km), on a smoothstep to its walls so the ranges round it stand as
  they are; the lake drops with it (to ~5,700 m).
- **A sheltered-valley correction**: the enclosed floor is a sun trap in summer (+2 °C) and pools cold air on winter
  nights (-2 °C).
- **Result**: warmest month **~+11 °C**, coldest **~-19 °C**, mean **~-4 °C**, ~0.80 atm. Permafrost and **permanent
  pycrete** (mean under -2 °C) everywhere, **summers warm enough for the Three Gifts** and open larch in the bottoms.
- **The moat holds**: 0.80 atm is still, to a lowland Eternian, about what 5,000 m is to us.
- **Water**: the valley stays dry (~125-200 mm); the fields are watered by snow and glacier melt off the peaks round it,
  in channels (Ladakh farms barley on ~100 mm this way). A few thousand km² of irrigated, larch-edged bottoms round a
  lake frozen seven or eight months a year (the ice quarry still), the pycrete halls above them.

So the heartland feeds its capital, but not the kingdom: the forest-steppe and the raids still do the rest.

## 2. Air and scale

- **0.93 atm in the forest-steppe**: on Krator, 4 km up is Earth's sea-level air. The Yeti Valley's 0.67 atm is, to an
  Eternian bred for 1.35-1.6 atm, what 6,500 m is to us: **the Yeti's moat**. No State army fights up there.
- **Nothing is giant.** Cold, dry and short summers keep it Earth-sized or smaller: larch 18-28 m in the forest-steppe,
  8-15 m in the taiga; the stone pine a tree below and a creeping mat above the tree line.
- `CROPS.ATM`: the forest-steppe and taiga are `standard` (0.8-1.3), the tundra and above `thin`.

## 3. The plants (the fur theme)

Every plant here wears fur: felted leaves, silky awns, woolly heads, catkins, lichen beards. Where an Earth plant is the
model it is named, so the drawing can be checked against it.

### Trees and woody plants

| Key | Name | Zone | Model | Harvest |
|---|---|---|---|---|
| `furlarch` | Fur larch | forest-steppe (shaded slopes), taiga | Dahurian and Cajander larch (*Larix gmelinii*, *L. cajanderi*): soft needles in tufts like pelts, green in summer, **gold in autumn**, bare in winter; open crowns, often leaning on permafrost | timber; **shavings and sawdust for pycrete** (section 5); larch gum (chewed); bark tannin and a red-brown dye |
| `stonepine` | Stone pine | forest-steppe, taiga; mats above the tree line | Siberian stone pine (*Pinus sibirica*) and its creeping mountain form (*P. pumila*) | **pine nuts**: the fat crop, stored for winter |
| `snowbirch` | Snow birch | tundra, alas edges | dwarf birch (*Betula nana*) | bark tar (glue, waterproofing) |
| `woolwillow` | Woolly willow | tundra, stream banks | woolly willow (*Salix lanata*): grey-felted leaves, fat woolly catkins | withies; catkin down |
| `seathorn` | Silverthorn | forest-steppe gullies | sea buckthorn (*Hippophae*), Himalayan and Siberian: silver-scaled leaves, orange berries packed on the stems | **berries** (vitamin C against the winter); a yellow dye |

### Ground plants

| Key | Name | Zone | Model | Harvest |
|---|---|---|---|---|
| `plumegrass` | Plumegrass | forest-steppe (sunny slopes) | feather grass (*Stipa pennata*): silky awns a hand long that comb the wind in silver waves | grazing; awns as stuffing |
| `furflower` | Furflower | forest-steppe, spring | pasqueflower (*Pulsatilla*): violet cups on silver-haired stems, the first flower after the melt | none (spring's sign) |
| `ivanchai` | Ivan-chai | burns, larch edges | fireweed (*Chamerion angustifolium*): tall magenta spikes, then white seed fluff | **the tea** (fermented leaves: the Yeti's drink); young shoots as greens |
| `cottongrass` | Cottongrass | alas bogs, wet tundra | *Eriophorum*: white cotton heads in sheets | the down: wicks, padding |
| `beardlichen` | Larch beard | on the larch | beard lichens (*Bryoria*, *Usnea*) hanging in grey-green and black hanks | winter fodder; wound dressing |
| `deerlichen` | Caribou moss | taiga floor, tundra | reindeer lichen (*Cladonia rangiferina*): pale grey-green sponge carpets | **the caribou's winter food**: the riders follow it |
| `sphagnum` | Bog moss | alases | sphagnum, red and green | dressing, nappies, insulation; **fibre for moss pycrete** |
| `cloudberry`, `crowberry` | Cloudberry, crowberry | alas bogs; tundra | *Rubus chamaemorus*; *Empetrum* | berries |
| `snowball` | Woolly snowball | fellfield | *Saussurea gossipiphora* (Himalaya): a column of white wool hiding its flowers | none; the kit's signature plant |
| `edelweiss` | Felt star | fellfield, tundra | edelweiss (*Leontopodium*) | none (worn) |
| `cushion` | Moss cushion | fellfield | moss campion and *Androsace*: tight domes starred with pink | none |

The crops (section 4) grow wild in their own zones as well as in fields: sweetroot on the steppe's gravels, snow potato
in rock pockets, goldroot in the fellfield's cracks and on the cliffs.

## 4. The Thule package (`kits/crops`)

*The Lands of Ice and Mice* turns the Thule into farmers with **the Three Gifts**: three arctic root crops that a
culture of replanting domesticated. The thread's practice is the Yeti's: **a part of every root is buried again, and a
gift is left for the spirits** (and for the mouse whose cache was raided). The same rite propagated the crops: root
pieces carried and planted, then stems and seed pods.

| Key | Name | Bucket | Model | Notes for the record |
|---|---|---|---|---|
| `sweetroot` | **Sweetroot** (the staple) | tuber | sweetvetch (*Hedysarum alpinum*): a carrot-like taproot up to 5 cm thick and a metre long | a perennial bed, 3-7 years to full root; harvested in early spring and late autumn (woody in summer); grows in gravel, till and poor soil; the fields of the forest-steppe |
| `bearroot` | Bearroot | (hazard) | *Hedysarum mackenzii*, sweetroot's twin: the same leaves and flowers, a poisonous root | `hazard: 'poison'`, no harvest; grows among sweetroot, so telling them apart is the farmer's first skill |
| `snowpotato` | **Snow potato** | tuber | *Claytonia tuberosa* (the Eskimo potato): a white taproot near the surface | the seedlings die in frost, so it is grown in **stone-walled pockets** that hold the day's warmth; tundra and rock crevices |
| `goldroot` | **Goldroot** (the medicine) | herb (also tuber) | roseroot (*Rhodiola rosea*): a nest of thick roots that smell of roses when dried | the remedy for fatigue and thin air (as on Earth); 4-5 years to harvest; the Yeti's trade good |
| `bistort` | Snow bistort | grain | alpine bistort (*Bistorta vivipara*): a spike of bulbils | the bulbils threshed and cooked like a grain |
| `sorrel` | Mountain sorrel | greens | *Oxyria digyna* | sour greens, eaten fresh or fermented |
| `ivanchai` | Ivan-chai | beverage | fireweed | the tea |
| `stonepine` | Pine nuts | nut | *Pinus sibirica* | the fat crop |
| `cloudberry`, `crowberry`, `seathorn` | | berry | | dried, frozen, or kept in fat |
| `cottongrass` | | fuel (also `sheet`) | | wicks, padding |

- **Existing records** that reach the polar band and fit: `frostroot` (freeze-dried like chuño: the Yeti's store
  technique too), `rowan`, `bilberry`, `lichen` (dye), `snow-lotus` (Oidong's; not here).
- **Mouse caches.** Voles store sweetroot and bistort in their burrows ("mouse nuts", as the Inuit and Yupik raided
  them). The meadows carry harvestable caches; the vole itself waits for `kits/fauna`.
- **The biome entry** (proposed): `nwouterwall: {atm: 1, zones: {steppe: {warmth: [1, 1], arid: [1, 1]}, larchwood:
  {warmth: [0, 1], arid: [1, 2]}, alas: {warmth: [0, 1], arid: [3, 3], wet: true}, tundra: {warmth: [0, 0], arid: [0, 1],
  atm: 0}, fellfield: {warmth: [0, 0], arid: [0, 0], atm: 0}}}`.
- **Dyes** for `CROPS.palette`: larch red-brown, silverthorn yellow, lichen (existing), birch-tar black.

## 5. Pycrete: the climate decides where it stands

Pycrete is ice set with wood fibre: much stronger than ice, and slow to melt. The kit supplies both halves and the rule.

- **Ice.** The frozen lake, and **aufeis** (naled): sheets of ice that build up in permafrost valleys every winter, as
  springs and streams overflow and freeze, metres thick by spring. They are the Yeti's quarries.
- **Fibre.** Fur larch shavings and sawdust; sphagnum for moss pycrete where there is no timber.
- **The rule** (a field, `pyc`): **permanent** where the mean is at or below -2 °C (roughly above 5 km): the Yeti's halls
  and cities. **Seasonal** below, where winters are hard (coldest month at or below -8 °C) but summers thaw it: walls,
  towers and forts raised for the raiding season, slumping in spring. In the forest-steppe their permanent buildings
  are larch, stone and sod.

So the war has a calendar: **the Yeti come down when their walls can stand**, and the State's wall faces winter forts
that are not there in summer. The culture kit draws the buildings; this kit only marks where each kind can stand.

## 6. Landforms (`core/terrain`)

Patterned ground (stone circles and ice-wedge polygons: `ground.turf.polygon`), solifluction lobes on the slopes,
**alases** (thaw hollows with a lake and a meadow ring), **pingos** (ice-cored mounds), **aufeis** sheets in the valley
floors (flat, glossy, blue-white), rock glaciers below the cirques, small cirque glaciers, frost-shattered tors, and the
frozen high lake. The fields and seeds are deterministic from the terrain (`KRAND` by cell), as every kit's.

## 7. Stations

1. **Leng's forest-steppe** (`dist/nwouterwall.html`, ~4.6 km): larch on the south-facing slopes, plumegrass and
   furflowers on the north-facing ones, an aufeis valley, sweetroot beds and snow-potato pockets, Leng's ruin on the
   horizon. The Three Gifts' country.
2. **The taiga and alases** (`-taiga`, ~5.2 km): open fur larch on permafrost, a chain of alases with their lakes and
   cottongrass, a pingo, caribou moss under the trees. The site is chosen from the model in N0.
3. **The Yeti Valley** (`-yeti`, after the model's 4.22: the floor ~5.5 km, ~0.80 atm): irrigated fields of the Three
   Gifts and open larch round the frozen lake (~5,700 m), meltwater channels, the capital's pycrete halls; fellfield with
   woolly snowballs and cushions on the slopes, goldroot on the cliffs, glaciers, the airless rim standing over it.
4. *Planned, for a future session* (the owner, 2026-10-26): **the Wall foot** (`-wallfoot`, ~3.2-3.6 km, Csa/BSk, the dry east
   above nsemiarid): the ecotone station. It reads the nsemiarid kit in place under a noise-warped mask (Korona's form). Wild
   apple and apricot groves, wormwood and poplar lie on the low side; this kit's steppe, larch and stone pine on the high side.
   The crossings and the shared-species aliases are in `ECOTONES.md`.

## 8. Textures

Already in the library: `ground.tundra`, `ground.turf.polygon`, `ground.steppe`, `ground.sphagnum`, `ground.lichen.crust`,
`ground.snow011`, `ground.snow015`, `ice.clear`, `ice.glacier`, `ground.needles`, `card.lichen`, `card.moss.hanging`,
`card.pine`, `card.spruce`, `card.grass.dry`, `bark.birch`, `bark.birch.lichen`, `bark.pine.scale`.

To source or generate (the prompts go into `core/materials/PROMPTS-NEEDED.md` before N2; generic ids so other kits reuse
them): larch bark; a larch needle-tuft card in summer green and autumn gold; a feather-grass card; a caribou-moss
(*Cladonia*) ground; cards for the woolly snowball, furflower, Ivan-chai, cottongrass and silverthorn; an aufeis tile
(layered, bubbly, blue-white); cards for sweetroot, snow potato and goldroot.

**The prompts**: `core/materials/PROMPTS-NEEDED.md` section 8 (2026-10-23).

## 9. Order of work

- **N0.** The owner approves the plan; the texture prompts are written; the station 2 site is chosen from the model;
  the Yeti's lore goes into `LORE.md` §6.19 (the Valley, Leng held, the caribou, the Three Gifts, pycrete's calendar).
- **N1.** The crop records and the biome entry in `kits/crops`; `node kits/crops/tests/test-crops.js`.
- **N2.** The kit on the biome core: fields (aspect, permafrost, alas, aufeis, `pyc`), zones, station 1's ground.
- **N3.** The trees: fur larch, stone pine (tree and mat), snow birch, woolly willow, silverthorn; the lichen beards.
- **N4.** The ground plants and the fields (sweetroot beds, snow-potato pockets, mouse caches).
- **N5.** The landforms (patterned ground, alases, pingos, aufeis, rock glaciers).
- **N6.** Stations 2 and 3.
- **N7.** `verify.py --assert`, `PORT.md`, the index tools, the gallery.

**Done (2026-10-26):** N0 (the stations picked on the model: `region/far.py`; the lore was already in `LORE.md` 6.19; the texture
prompts delivered), N1 (`kits/crops`: the Three Gifts, bearroot, bistort, sorrel, pine nuts, the berries, Ivan-chai, qiviut, the
willow, cottongrass, bog moss, larch beard and the dyes; `nwouterwall` biome entry; `test-crops.js` passes), N2-N4 (the kit:
`46` the climate, pycrete's rule and the zones; `50-60` the flora and the fields; station 1's ground), N5 (`core/terrain/
42-core-frost.js`, KFROST, with its test: patterned ground, alases, pingos, aufeis, solifluction lobes, rock glaciers; frost-
shattered tors on KSTACKS), N6 (stations 2 and 3; station 3 reads `kits/yeti` through `yeti_bundle.py`), N7's `verify.py --assert`
and `PORT.md`. Left: the gallery (at the merge), the root index (`tools/make_index.py`, `tools/audit_port.py` rewrite every
build's; left to the merge), the owed cards (`KNOWN_ISSUES.md`).

## 10. The people's side (settled 2026-10-23 unless marked)

- **The capital** stands by the frozen lake (6,480 m on 4.21, ~5,700 m after the 4.22 valley edit), out of every
  lowlander's reach. Leng is theirs, a held ruin on
  the forest-steppe below.
- **The stock**: riding **caribou**, which follow the caribou moss, and **musk oxen** for milk, meat, dung fuel and
  **qiviut**, the musk ox's underwool, the finest and warmest wool there is. It fits the fur theme: the kingdom's cloth
  is combed from its own animals. The fields of section 4 lie on the musk oxen's summer grazing, manured by it.
- **The tongue**: English evolved in a Siberian direction (Chukchi, Koryak, Nenets, Sakha). In it the kingdom is
  **the High Country**. *Proposed* sound changes, for `lore/tongues-of-krator.html` (the owner may rename anything):

  | Change | Model | Examples |
  |---|---|---|
  | *h* becomes *kh* | Sakha, Chukchi | *high* > **khaay** |
  | diphthongs become long vowels (and a glide) | Sakha's long vowels | *high* > khaay, *cold* > qoold, *lake* > lheek |
  | *k* becomes uvular *q* before back vowels | Chukchi, Koryak, Sakha | *country* > **qantïr**, *cold* > qoold |
  | vowel harmony: a word's vowels are all back (a o u ï) or all front (e i ö ü), and suffixes follow | Sakha, Chukchi | plural *-lar* / *-ler*: qoold-lar, lheek-ler |
  | clusters broken by a harmonising vowel; a prothetic vowel before *s*+consonant | Sakha | *country* > qantïr, *stone* > ïstoon, *snow* > ïsnoo |
  | initial *y* becomes *s* | Sakha (Turkic *y* > *s*) | *yes* > ses, *year* > siir; the lowlanders' *Yeti* comes back as **Seti**, said as a joke |
  | initial *l* becomes the lateral fricative *lh* | Chukchi, Koryak | *lake* > lheek, *land* > lhaan |
  | *f* becomes *p* (no *f*) | Chukchi, Sakha | *frozen* > pïroozïn |
  | final *-ng* and *-n* become *ŋ*; a catch (') for *t* between vowels | Chukchi, Nenets | *ring* > riŋ, *water* > wa'ar |
  | *-ken*, "of, belonging to" | Chukchi *-kin* | **Khaayken**, "of the high": the people's name for themselves |

  So: the kingdom **Khaay Qantïr**, "the High Country"; its people the **Khaayken**; the capital by the lake **Qoold
  Lheek**, "the cold lake" (*proposed*); *Yeti* stays the lowlanders' word.
- **The ruler** is a **High Chief**, chosen by a council of the prominent clans (the owner). By the changes above:
  *high chief* > **Khaay Chiip** (*f* > *p*); *council* > **Quunsul** (*k* > *q*, the diphthong long); *clan* > **kileŋ**
  (the cluster broken, front harmony, *-n* > *ŋ*), plural **kileŋler**. So the High Chief is chosen by the Quunsul of the
  kileŋler.
- **The Three Gifts** in their names (*th* has gone to *t*, as in the tongues of the Siberian models): *three gifts* >
  **Tiri Gipler** (*ft* > *p*, the front plural).

  | Plant | English | High Country | How |
  |---|---|---|---|
  | sweetroot | *sweet* | **isiit** | a prothetic *i* before *s*+consonant, the *w* lost: the staple is simply "the sweet" |
  | bearroot | *bear's sweet* | **beer-isiit** | the false sweet, the one that kills |
  | snow potato | *snow potato* | **ïsnoo-pa'a** | *snow* > ïsnoo; *potato* worn to *pa'a*, the *t* gone to a catch |
  | goldroot | *gold root* | **gooldruut** | back harmony throughout |

  The plant keys in `kits/crops` stay English (`sweetroot`, `snowpotato`, `goldroot`); these go in each record's `note`
  and in the inspector's words.
- **The script** (the owner): an **angular derivative of the Latin letters that looks a little like Inuit syllabics**.
  *Proposed*: it was cut, not written, with a knife on bone, antler, wood and ice, so it has no curves: every letter is
  strokes, wedges and triangles. Like the syllabics, **turning a sign changes its sound**: the four back vowels (a, o, u,
  ï) are one wedge turned four ways, and the front vowels the same wedges with a dot, so a word's harmony shows at a
  glance; a consonant closing a syllable is written small and raised, as the syllabics write their finals. The chart is
  drawn when the tongue goes onto `lore/tongues-of-krator.html`.
