# Almua: the plan (draft, 2026-10-17)

Almua is the Vothic Kingdom's major port and garrison town on the Ring Sea, a planned city founded shortly after Voth
to secure the northern frontier and house the Chichani clans still migrating into the central crater. Its lore is
`LORE.md` §6.12 ("The cities of the Kingdom"). It is the Voth kit on `core/city`, as Voth's own city plan is
(`settlements/voth`), with no Ancient ruins at all: the first Vothic city built from nothing in the plan's own style.

Owner's brief (2026-10-17): a planned city founded shortly after Voth, to secure the northern frontier and
accommodate the ongoing migration of Chichani clans to the central crater; no Ancient ruins, uses the Voth kit; port
city and garrison town; built at the mouth of a river by a natural harbour on the Ring Sea; four cantons arranged
parallel to the coast, primarily port and industrial in nature.

## 0. What the build is

| | |
|---|---|
| Folder | `settlements/almua/` (`src/`, `targets/`, `build.py`, `verify.py`, `materials.json`, `site/`) |
| Pages | `dist/almua.html` (the city), `dist/almua-site.html` (the site editor, Voth's read in place) |
| The kit | the Voth building catalog (`settlements/voth/catalog`), whole: housing, manors and clan compounds, shops, taverns (the harbour tavern), warehouses (the canal warehouse, the bonded grain store), civic (the governor's palace, the generator, the Temple college), military (the harbour fort, barracks, mustering grounds, the army camp), and the first-generation registry's coast-guard berth, watchhouse and caravanserai |
| Landmarks lifted | Voth's source library by name (`settlements/voth/vothlift.py`): the Port canton's lighthouse and the Navigator's Guild hall, the Arsenal's shipways, the Temple's tiers at a lesser scale |
| Town | `core/city` steps 0-12 on the site layer, the `alleys` strategy on drawn avenues: a planned grid, not Voth's grown lattice |
| Ships | `kits/ringsea`: the Ordinator flagship (Almua is the fleet's northern base), chitin biremes, cargo hulks; the Islanders' lanong as a prize in the arsenal |
| Biome | `biomes/swbay` on the land, the Ring Sea's shore and reef from `biomes/ringisles` |
| Core | `core/rand`, `core/mask`, `core/tags`, `core/space`, `core/lod`, `core/host`, the shared sky; `core/furnish` for the palace and the fort later |

## 1. The site

The scale model has Almua at px 446,553: 14 km from the Ring Sea polygon's edge, the West Ring isles 18 km offshore,
the Vothic Kingdom's border 51 km north and the League of Amphitriton's (the Hykkousoi) 48 km north: Almua watches the
Hykkousoi. Temora, the spice port, is 88 km east; Pontus 94 km north-west; Drum 133 km south-west; Voth 275 km south.
No river is named at Almua on the model (`tools/scale-model/river-names-4.21.md`); the city's river wants a name
(`LORE.md` §12).

The coast runs roughly east to west here with the sea to the north; the river comes down from the south and the
natural harbour is the bay inside its mouth's spit. The city is drawn with the Port kit's compass turned, as Hook's
is: the cantons' long sides face the sea.

**The four cantons**, parallel to the coast, west to east, each a walled rectangle about 400 by 250 m on the
Voth pattern (Voth's cantons are platforms over water; Almua's stand on the shore, their canals cut from the river):

| Canton | What |
|---|---|
| **The Harbour canton** | the natural harbour's quays, the lighthouse at the spit's end, the Navigator's Guild, the customs, the harbour taverns, the coast-guard berth; the fleet's moorings |
| **The Arsenal canton** | the shipways and the covered slips of the Kingdom's northern fleet, ropewalks, sail lofts, the chitin works (the beetle livestock's shells cured for the biremes) |
| **The Works canton** | the canal warehouses, the bonded grain store, the generator, tanneries, dye works, the river wharf and the mills at the river's mouth |
| **The Garrison canton** | the harbour fort on the headland, barracks, mustering grounds, the Ordinators' house, the army camp outside its wall for the clans in transit |

Behind the four, inland along the river:

| District | What |
|---|---|
| **The Clan town** | the migrating clans' quarters: clan compounds (the catalog's mudbrick, fortified and waterside kinds) each with its own yard, in blocks laid out before the clans arrived, some still empty; the caravanserai for the newly come |
| **The Palace rise** | the governor's palace (the shared Voth programme), the Temple college and a Temple of the Sun at a lesser scale than Voth's, the manors of the harbour's rich |
| **The Market** | the grain and fish markets between the cantons and the clan town |
| **The Country** | fields along the river, chinampas in the marsh of its mouth |

## 2. The style

Almua is Voth without its age: the same purple and gold, the same Dunmer-and-Aztec forms, but planned (straight
canals, right-angled blocks, matched gates) and newer. The catalog's materials as they are; no weathering tune. Its
mark is the port: the chitin biremes' ribs on every slip, the lighthouse, the diamond on the harbour fort's face toward
the Hykkousoi.

## 3. The order of work

- **P0. The harness.** `build.py` reading the Voth catalog's registries and `core/city` as Voth's `build.py` does
  (`CITY_JS`), the swbay and ringisles kits in place; `verify.py` on `tools/harness.py`. Done when a Voth catalog
  building stands on Almua's shore in `dist/almua.html` and `--assert` passes.
- **P1. The site.** The ground (the river mouth, the spit, the harbour bay), the site editor saving
  `site/almua-site.json`: the four cantons as districts with their canals and walls, the avenues, the clan town's grid.
  Done when steps 0-5 run on it.
- **P2. The town.** Steps 6-12 with the catalog's dims; the `alleys` strategy on the drawn grid; the cantons filled by
  role (harbour, arsenal, works, garrison). Done when the city fills the site with no overlap, nothing in the water or
  on a street, `node core/city/test-city.js` green.
- **P3. The landmarks and the harbour.** The lighthouse, the fort, the palace, the shipways with their biremes, the
  fleet at its moorings (`kits/ringsea`). Done when the views of section 4 read.
- **P4. The life.** Citizens (Chichani above all, clans in transit, Hykkousoi prisoners in the fort), the ferry across
  the river, the night. Done when the night view reads as a garrison port.
- **P5. The record.** `README.md`, `KNOWN_ISSUES.md`, `PORT.md`, the gallery entry, the hash into `PORT-BASELINE.json`.

## 4. Views for the verify

| View | What it must show |
|---|---|
| Overview from the sea | the four cantons in a row along the shore, the clan town behind, the river |
| The harbour at eye level | the quays, the lighthouse, the fleet, the harbour fort on the headland |
| The arsenal | the shipways, a bireme on the slip |
| The clan town | compounds in their blocks, some yards empty, the caravanserai |
| The palace rise | the palace and the Temple over the cantons |
| Night | the cantons lit (the catalog's lit windows), the camp's fires |

## 5. Open questions for the owner

1. **Settled (2026-10-18).** The river is **Dip Rivrh**, the Deep river, for the navigable channel that makes the
   harbour (a note in `tools/scale-model/river_names.py`); no course reaches Almua on the model yet, so the river is
   still to be drawn there and given this name.
   **The city's name is older than the Chichani** (settled 2026-10-18): *Almua* was the Islander fishing village at the
   river's mouth, kept by the planners; the tongues page's own rule is not to force an etymology where no English
   source fits, and none does. An Islander shrine of the white moon survives at the spit's root, by the lighthouse.
2. **Settled (2026-10-18).** The cantons are islanded by canals cut from the river, as Voth's are by the bay: each a
   walled rectangle on its canal edges, joined to the next by a bridge carrying a gate on the shore road, so the
   waterfront can be held canton by canton. In `core/city`: four districts with the canals as water in the site layer
   and the wall as each district's own ring; the shore road crosses the canals on gated bridges (the Voth catalog's
   garrison pieces for the gate towers).
3. **Settled (2026-10-18).** A third of the clan town's blocks stand empty at game start: laid out, paved and walled
   (the compound walls begun) but unbuilt, the newest clans camped in them with the catalog's army-camp tents and
   their beetle livestock. In the lot filler: the clan town's zone carries `empty: 0.33`, and an empty lot draws a
   `voth_compound_walls` stub (a new catalog entry: walls and a gate, no house) and a camp instead of a building.
