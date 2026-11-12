# kits/resources: the geology data and the node field

`PLACEMENT-RESEARCH.md` features 1-4 (R12 of the final rebuild, `HANDOFF-REBUILD.md` 4a), built 2026-10-26.

| File | What |
|---|---|
| `tools/scale-model/geology.py` | the bake: reads the scale model page and its database, writes `data/geology.json` |
| `data/geology.json` | the provinces, the mask, a prospectivity byte per family per cell, the placers, the evaporite basins, the polities and settlements |
| `src/45r-res-field.js` | `[G data]` `RES_GEO` (also `KRES`): the node field over any tile, `near`, `register` |
| `src/46r-res-ledger.js` | `[G data]` `RES_LEDGER`: the scarcity ledger and the fairness audit |
| `data/ledger.json` | the ledger of this data (`node kits/resources/tests/test-res.js --ledger`): what core/simulation and Godot read |
| `godot/kres_field.gd`, `godot/kres_field_test.gd`, `godot/golden-field.json` | the GDScript twin of the field, its test, its vectors |
| `src/98r-host-geomap.js` | `[web]` the page's geology map (G): provinces, a family's prospectivity, the nodes of a window by family |
| `tests/test-res.js` | `node kits/resources/tests/test-res.js`: 55 checks, each with a negative |

## Rebake

**On scale model 5.1** (2026-11-03, `REBAKE-PLAN.md` R0-R2): the model's data folder and its own defaults for the regions
and settlements (the artifact's database is still on the 4.23 canvas and lacks 5.1's additions: the defaults are the
database moved by the legacy shift plus 5.1's 19 regions and 5 settlements, so they are the source now):

```
python3 tools/scale-model/geology.py tools/scale-model/model/data tools/scale-model/model/src/51-region-store.js tools/scale-model/model/src/60-settlements.js kits/resources/data/geology.json [--cell 4] [--preview <dir>]
node kits/resources/tests/test-res.js --ledger      # rewrites data/ledger.json and godot/golden-field.json, then checks everything
python3 godot/tools/sync_core.py                    # the Godot test's copies
python3 tools/build.py kits/resources
```

Deterministic: the same model and regions give the same bytes. 2026-11-03: scale model 5.1, 118 regions, 117 settlements;
4 km cells (`--cell 4`: every second pixel of 5.1's 2 km grid, as the 4.23 page's half-resolution grid was), 911 x 862;
4.4 MB of data, 18 s. Every window the bake uses (relief, the volcanic share, the oil's smoothing, the margins, the
rings, the rocks' contacts and blocks) is written in km (`cells(km, cell_km)`), so another `--cell` keeps their sizes.

**What the 5.1 rebake moved** (measured against the 4.23 bake over the old canvas):
- **91.5% of the field's nodes stand exactly where they stood** (the same id, position and keep), thanks to the lattice
  anchor (below); 22,054 of 260,386 went and 18,559 came where a family's byte changed, 1,384 changed grade (110 tiles
  of 120 km). Of the ores, iron 94.3%, copper 94.9%, gold 91.6%, tin 88.0% stayed; the salts least (gypsum 45.8%,
  potash 35.1%, alkali 19.0%: 5.1 moved and redrew the basins).
- The ore bytes changed by more than 20 on 8-10% of the land, saltpeter 19.7%, stone 29.8%, wood 12.7%, water 18.1%;
  83.0% of land cells keep their province; 5,040 cells changed between land and water.
- Gold placers 915 to 1,085, tin 1,012 to 1,184 (5.1's rivers, and the new land); gold lodes 105,271 to 131,317, tin
  209,664 to 273,718 (the bigger canvas).
- The provinces on 5.1 (cells of 4 km): water 90,214, sedimentary 191,704, crystalline 263,493, volcanic 40,214,
  evaporite 6,908, rift 22,202, carbonate 9,205, impact 35,322, basalt 37,497, granite 58,665, quartzite 21,689,
  ultramafic 8,169 (the Arch, now on the canvas).
- The fairness audit: 21 findings to 26. "Yuni Emirate: Spindle Fan" is listed twice because the map has two polities
  named Yuni Emirate (the old one and 5.1's).

**Before 5.1** the bake read a saved 4.23 page and the database (`<page.html> <db>/regions <db>/settlements`). The carbonate
and the other rocks were first added to that bake in place (`--carbonate`, `--rocks`, below); the 5.1 bake runs both itself.

**Zinc was added in place** (2026-11-12, `--zinc`): today's model no longer bakes the committed file byte for byte (it has moved
since 2026-11-03), so a full rebake would have moved every family's nodes. `--zinc` computes the family from the layers the file
already holds (province, mask, copper, skarn) with the same `zinc_byte` the full bake uses (checked: a full bake's zinc and `--zinc`
on that bake agree), and changes nothing else: every other layer, the stats, the placers and every other node are as they were.
Then `node kits/resources/tests/test-res.js --ledger` (zinc in 12 of 28 polities' imports; the ledger without zinc is unchanged).

```
python3 tools/scale-model/geology.py --zinc kits/resources/data/geology.json
```

```
python3 tools/scale-model/geology.py --carbonate kits/resources/data/geology.json tools/scale-model/model/src/51-region-store.js --shift=-272,-330
python3 tools/scale-model/geology.py --rocks kits/resources/data/geology.json tools/scale-model/model/src/51-region-store.js --vents tools/scale-model/model/data --shift=-272,-330
```
## The format (`krator-geology`, version 1)

One JSON object. The browser, node and Godot read the same integers; nothing is interpolated.

```
format 'krator-geology', version 1, source 'Krator Scale Model 5.1'
grid      {w: 911, h: 862, fullW: 1821, fullH: 1723, px_m: 2000, cell_km: 4}   the bake's grid over the scale model's map px
provinces ['water', 'sedimentary', 'crystalline', 'volcanic', 'evaporite', 'rift', 'carbonate', 'impact', 'basalt', 'granite',
           'quartzite', 'ultramafic']   a province byte's low 7 bits
ruinBit   128                                                                         set on Ancient-ruin ground
mask      {water: 1, cliff: 2, airless: 4, sea: 8}                                    the mask byte's bits
field     {world, inset, cells: {family: m}, families: [...], anchor: [ax, az], grade: {tilt, high, medium}}   the node field's constants
families  every layer's family (the node kinds, then ledgerFamilies: stone, clay, wood, water, then rockFamilies)
rockFamilies ['limestone', 'impactite', 'ultramafic', 'tuff', 'skarn', 'glass']   rock layers no node field or ledger reads yet (nickel and marble are node kinds since R3)
layers    {province, mask, <family>...}: each a byte raster, run-length coded, base64
placers   [{id, kind, grade, x, z, placer: true, river, why, load}]   world metres
basins    [{id, at_px, kind, level_m, top_m, cells, soda, intensity}]   each evaporite basin the bake ringed
polities  [{name, points: [[px, py]...]}]   the political layer (map px)
settlements [{name, px, py, type}]
stats     the cells per province, the mean byte per family, the lode digests (count, sha1) and placer counts
```

**A layer** is the grid's `w x h` bytes, row-major from the top-left (row `j`, column `i`), coded as pairs of bytes
`(run - 1, value)` (runs of 1 to 256), then base64. Decode: for each pair, write `value` `run` times; the total must be
`w x h`.

**World metres:** `x = map px x 2000`, `z = map py x 2000` (5.1's map px, origin top-left, z south). **The lattice anchor** `field.anchor` (m; `[0, 0]` when absent, as in the 4.23 bake) is where the node field's cell 0 starts: cell `ix` of a family spans `[ax + ix x C, ax + (ix + 1) x C)`. 5.1's is `[544000, 660000]` (4.23's origin on the bigger canvas), so a cell keeps its index, hash and id from the 4.23 bake. The JS, the GDScript twin and the bake's lodes take it. **The cell of a
point:** `i = floor(x / 2000 x (w - 1) / (fullW - 1) + 0.5)`, `j` the same with `h`, `fullH`; off the grid when outside
`[0, w) x [0, h)`.

### The provinces

| Byte | Province | Rule (geology.py) |
|---|---|---|
| 0 | water | the page's water (`wl`): lakes and the sea |
| 1 | sedimentary | land that is none of the others: basins, plateau shelves |
| 2 | crystalline | over 5,000 m, or over 1,000 m of relief in a 5x5 window (~20 km), or airless (over 8,000 m) |
| 3 | volcanic | within `10 + 4 x radius` km of a `DATA.vents` vent; the biome regions Throne/Volcano, godthrone, Korona / NE, rift rim N and S, godstep valley |
| 4 | evaporite | a ringed basin's strand where any evaporite byte is over 40 |
| 5 | rift | the regions rift and The Rift |
| 6 | carbonate | a sedimentary or crystalline cell whose platform byte (below, limestone) is 128 or more: k-guilin, NW bay, the Neo-Ozarks, Spider Lake |
| 7 | impact | the crater walls' crystalline (megabreccia, pseudotachylite): the biome regions n highlands, s highlands, e inner wall, w outer wall, NW outer wall, ne outer wall |
| 8 | basalt | flood basalt: the sedimentary and crystalline cells of n semiarid, Siphon Pits and Region 99 (their dried lake beds stay evaporite) |
| 9 | granite | the rest of the crystalline that is rugged (stone byte 150 and up) and not airless, in 6-cell pluton blocks whose hash (`rock:granite`) is under .45 |
| 10 | quartzite | Korona / NE's volcanic cells beyond 8 km of a vent (its tepui tables), and the rest of the crystalline that is flat (stone under 100) and not airless (high plateau sandstone). The painted highlands' volcanic beyond 8 km of a vent goes back to sedimentary |
| 11 | ultramafic | where mantle is bare: the region the arch (8,169 cells on 5.1) |

`crystalline` (2) is now the **gneiss basement**: what is left after the walls, the plutons and the plateaus, half of it
airless.
| +128 | ruin ground | within 12 km of a ruin or ruined arcology settlement, and the region Ruins of Nazar |

### The families

| Family | Where (byte 0-255) |
|---|---|
| copper | volcanic 210, rift 120, basalt 120 (native copper: Keweenaw), gneiss, granite and impact 50, sedimentary and quartzite 10 (porphyry Cu in arcs), + .6 x skarn |
| silver | volcanic 150, gneiss and granite 110, rift and impact 80 |
| gold (lode) | volcanic 140, gneiss and granite 110, rift and impact 90 (the Witwatersrand survived inside Vredefort) |
| sulfur | `255 exp(-d / 10 km)` within 40 km of a vent, + 60 on volcanic ground |
| tin | granite 200, gneiss 60, rift 50, impact 40, volcanic 20 (tin is a granite's ore) |
| rare-earth | rift 190 (carbonatites), granite 160, gneiss 100, impact 60, volcanic 30 |
| iron | gneiss 160, granite and impact 120, basin margins (sedimentary within 12 km of the crystalline rocks or volcanic) 140, rift 70, volcanic and basalt 60, sedimentary and quartzite 40, + .7 x skarn |
| coal | sedimentary x lowland x (0.25 + 0.75 wet) x flat, at most 230 (subsiding wet basins) |
| oil | 0.9 x coal smoothed over ~44 km, halved off the margins and folds; + 110 on low rift floors |
| zinc | sphalerite (2026-11-12, the owner; `biomes/galvanic/PLAN.md` section 9): the higher of the ground's own (volcanic 150, rift 120, carbonate 90, + .5 x skarn) and .8 x copper where copper is over 100 (copper-zinc-iron massive sulfide: zinc follows copper); none on the evaporites. `zinc_byte` in geology.py; a node kind, cell 4 km |
| saltpeter | 200 x aridity (rain under 600 mm), + 40 on evaporites |
| gypsum, halite, potash, alkali | the ringed basins (below); halite also 40 under flat, dry sedimentary basins (bedded rock salt) |
| stone, clay, wood, water | the ledger's basics only (no node kind): relief and hard rock (every province but sedimentary, evaporite and carbonate; sedimentary over 200 m of relief), at least 150 on basalt and granite (building stone on the flat) and 120 on carbonate (ashlar); floodplains and lake shores; rain and warmth; rivers, shores and rain |

**The ores on the new rocks** (R3, 2026-11-03) are read from the final provinces and layers, after `carbonate()` and `rocks()`. What they moved, against the R2 bake over the whole of 5.1 (156 tiles of 120 km): 82.7% of nodes stand where they stood; tin keeps 44.2% (off the gneiss onto the granite), rare earths 71.1%, coal 76.2% (none in basalt, quartzite or carbonate), iron 88.7%, copper 85.5%, gold 87.1%, silver 85.2%, oil 84.2%; the evaporites, sulfur and saltpeter are unchanged; 2,255 nickel and 819 marble nodes are new, with 893 tin, 388 rare-earth, 2,956 copper and 799 iron nodes where the new rocks raised them. Gold lodes 131,317 to 115,845, tin 273,718 to 120,187; gold placers 1,085 to 928, tin 1,184 to 947. The ledger: 25 polities' imports change (mostly nickel and marble becoming goods; the Painted Men and the Coyote Kingdom now import gold, silver, tin and rare earths, their ground now quartzite and sandstone); the fairness audit 26 findings to 25.
| limestone | a rock layer (no node kind, no ledger basic; `biomes/KARST-SITES-5.1.md`): the strongest of the **platforms** (255 x the biome region's weight: k-guilin 1, NW bay .9, neo-ozarks 1, spider lake .6, sw highlands .45; on sedimentary, crystalline, evaporite and rift ground), **lake limestone and marl** outside each basin's gypsum ring (.6 x the gypsum within 2 cells, where the cell's own gypsum is under 80), **tufa** round the soda lakes (.5 x the alkali within 1 cell), the **rift fill**'s thin limestones (70 on rift ground), **calcrete** in semi-arid basins (50 at ~400 mm of rain, from saltpeter's aridity, on sedimentary ground) |
| impactite | 255 on the impact province, 140 on the walls' sedimentary benches, 120 on the melt sheet's margin (the Inner Crater floor within 3 cells of a wall) |
| nickel | **a node kind** (R3): Sudbury's ore (nickel, copper, platinum): 220 at the melt sheet's margin falling to 0 at 12 km, 60 on the impact province, 180 on the ultramafic province |
| ultramafic | 255 on the ultramafic province; 120 falling to 0 over 20-30 km round the White Gills' root (5.1 px 1015,1438 and the twins 988,1458, 1042,1498: *proposed* deep, not at the surface) |
| tuff | ash and ignimbrite round every vent: 200 falling to 0 at 2.5 reaches (reach `10 + 4 x radius` km), the apron longest downwind (to the south-east) |
| marble | **a node kind** (R3, a quarry): .9 x the limestone within 8 km of granite or volcanic ground (where the limestone is 40 or more) |
| skarn | 200 on the cell beside granite or volcanic ground where the limestone is 30 or more |
| glass | the Ancients' seven blast basins in Ancient's Valley: 180 on the melt floor, 255 on the vitrified rim (to 1.5 radii) |

Water cells carry no family but water. The metals, coal and oil are zero on evaporite ground.

### The evaporite rings (feature 3)

Each closed basin the model holds (`DATA.basins` of kind `salt lake`, intensity 1; `unbalanced`, 0.6) and each old dam lake
(`DATA.palaeolakes`, its trapped water under the dam's sill, 0.5) is flooded from its seed up to `top` (the lake level + 120 m;
a palaeolake's sill), within 2.5 radii of its area. Its dry cells are ringed by height, `z = (h - base) / (top - base)` (base
the water's level, or the dry floor's lowest): **gypsum** peaks at `z` 0.82 (the rim), **halite** at 0.5, **potash** at 0.12
(the last-dry margin by the brine), **alkali** at 0.18, scaled by the basin's soda (volcanic ground within ~100 km, x2, plus
half the aridity; 1 in the Catch, the owner's soda lake). The Catch's four salt lakes give all four.

### The placers (feature 3)

The bake runs the node field itself for the gold and tin lodes (KRAND in numpy, checked against `core/rand/test_rand.py`;
`stats.lodes` holds each lode set's count and digest, and the node test recomputes it in JS). Every river and wadi is walked
from its source: a lode within 6 km of a vertex adds half its yield to the load, the load decays over 60 km, and where the
slope falls under 0.4 of the three segments above it (and those fell at least 1.5 m/km), at a confluence, or at the mouth,
half the load drops as a placer (at least 0.35; no two of a kind within 10 km on a river), on the inside of the bend past the
channel's edge. A tributary hands its load to the river it joins. Id `res:placer-<gold|tin>:<river id>:<vertex>`.

## The node field (feature 2)

For each family, the world is cut into cells of `field.cells[family]` m. Cell `(ix, iz)` takes one candidate:

```
s     = KRAND.cell(KRAND.child(field.world, 'res:' + family), ix, iz)
gx    = (ix + inset + (1 - 2 inset) x unit(hash(s, 2))) x cell          gz the same with hash(s, 3) and iz
p     = the family's byte at the cell of (gx, gz)
kept  = floor(unit(hash(s, 1)) x 255) < p
grade = q = unit(hash(s, 4)) x (1.15 - tilt x p / 255);  high if q < 0.15, medium if q < 0.55, else low
id    = 'res:' + family + ':' + ix + ':' + iz
```

`unit(u) = u / 2^32`; `hash`, `cell` and `child` are core/rand's. A kept candidate is **dropped** (never re-rolled) when the
host's `ground(x, z)` says water, or a slope over `maxSlope` (0.7), or, with no host ground, when the mask says water or
cliff. A tile is the nodes whose position lies in `[x0, x1) x [z0, z1)`: any split of a region into tiles gives the same
nodes. Owner nodes and deltas apply by id last.

## Adopting it

A world that places nodes (an open world, a settlement page, a hamlet):

```
# build.py: read the fragments in place (the pooled-folder rule: name them), and the data as a generated fragment
RESOURCES = [os.path.join(ROOT, 'kits', 'resources', 'src', f) for f in ('42r-res-ore.js', '44r-res-nodes.js', '45r-res-field.js', '46r-res-ledger.js')]
# a generated fragment before 45r:  'const RES_GEODATA=' + open(kits/resources/data/geology.json).read() + ';'
# (and RES_LEDGERDATA from data/ledger.json if the page shows the ledger); 45r loads RES_GEODATA itself
```

```
const nodes = KRES.nodesIn({x0, z0, x1, z1}, {origin: {x: cx * 2000, z: cy * 2000},   // the region's local frame
                                               ground: (x, z) => ({water: WORLD.water(x, z), slope: WORLD.slope(x, z)}),
                                               owner: EDITS.nodes, deltas: EDITS.nodeDeltas});
KRES.register(T, nodes, {height: (x, z) => WORLD.H(x, z)});   // core/tags, before drawing
for (const n of nodes) place(resNodeKey(n.kind, n.grade), n.x, WORLD.H(n.x, n.z), n.z);       // the node defs of 44r
const src = resSource({x, z, works: 'mine'}, nodes);                                          // a works' node (42r)
```

The open world's `extract_region.py` frame is the local one (`x = (px - cx) x 2000`): pass its centre pixel as `origin`.

## Godot

- **The data:** `FileAccess.get_file_as_string` + `JSON.parse_string`; a layer is `Marshalls.base64_to_raw(s)` then the
  run-length loop into a `PackedByteArray` of `w x h` (never `Image.load`: the bytes are the data, not a picture).
- **The field:** `godot/kres_field.gd`, the twin of `RES_GEO.candidate` and `nodesIn` (the baked mask's drop rule) on
  `core/rand/krand.gd`. Not `FastNoiseLite` (its cellular jitter changed between 4.1 and 4.2).
- **Proved (2026-10-26, Godot 4.7.2 headless):** `godot/kres_field_test.gd` reads `godot/golden-field.json` (written by
  `node kits/resources/tests/test-res.js --ledger`): a 30 km tile's 200 nodes match the JS in id, grade and position, and the
  whole world's gold lodes (105,271) give the bake's digest, so numpy, JS and GDScript agree. To run it: a project folder
  holding `krand.gd`, `kres_field.gd`, `kres_field_test.gd`, `golden-field.json` and `data/geology.json`, then
  `godot --headless --path <folder> --script res://kres_field_test.gd`. Into `godot/`, it goes the way
  `godot/tools/sync_core.py` copies core/rand's test (a request: that file is not this kit's).
- **Drawing:** one `MultiMeshInstance3D` per node def (`node-<kind>-<grade>`), the records from `KRES.register`'s export.
- **The ledger:** `data/ledger.json` as a `Resource` (or read as JSON): the sim's imports and exports.
