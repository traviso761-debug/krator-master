# kits/resources: the geology data and the node field

`PLACEMENT-RESEARCH.md` features 1-4 (R12 of the final rebuild, `HANDOFF-REBUILD.md` 4a), built 2026-10-26.

| File | What |
|---|---|
| `tools/scale-model/geology.py` | the bake: reads the scale model page and its database, writes `data/geology.json` |
| `data/geology.json` | the provinces, the mask, a prospectivity byte per family per cell, the placers, the evaporite basins, the polities and settlements |
| `src/45r-res-field.js` | `[G data]` `RES_GEO` (also `KRES`): the node field over any tile, `near`, `register` |
| `src/46r-res-ledger.js` | `[G data]` `RES_LEDGER`: the scarcity ledger and the fairness audit |
| `data/ledger.json` | the ledger of this data (`node kits/resources/tests/test-res.js --ledger`): what core/simulation and Godot read |
| `src/98r-host-geomap.js` | `[web]` the page's geology map (G): provinces, a family's prospectivity, the nodes of a window by family |
| `tests/test-res.js` | `node kits/resources/tests/test-res.js`: 43 checks, each with a negative |

## Rebake

```
# the page: Artifact read of https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q (the saved file); the database: ArtifactData
# list of `regions` and `settlements` with out_dir (one JSON per document)
python3 tools/scale-model/geology.py <page.html> <db>/regions <db>/settlements kits/resources/data/geology.json [--preview <dir>]
node kits/resources/tests/test-res.js --ledger      # rewrites data/ledger.json, then checks everything
cd kits/resources && python3 build.py
```

Deterministic: the same page and database give the same bytes. 2026-10-26: scale model 4.23, 97 regions, 109 settlements;
2.9 MB of data, 11 s.

## The format (`krator-geology`, version 1)

One JSON object. The browser, node and Godot read the same integers; nothing is interpolated.

```
format 'krator-geology', version 1, source 'Krator Scale Model 4.23'
grid      {w: 774, h: 696, fullW: 1549, fullH: 1393, px_m: 2000, cell_km: 4.0052}   the scale model's height grid
provinces ['water', 'sedimentary', 'crystalline', 'volcanic', 'evaporite', 'rift']   a province byte's low 7 bits
ruinBit   128                                                                         set on Ancient-ruin ground
mask      {water: 1, cliff: 2, airless: 4, sea: 8}                                    the mask byte's bits
field     {world, inset, cells: {family: m}, families: [...], grade: {tilt, high, medium}}   the node field's constants
families  every layer's family (the node kinds, then ledgerFamilies: stone, clay, wood, water)
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

**World metres:** `x = map px x 2000`, `z = map py x 2000` (the full grid, origin top-left, z south). **The cell of a
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
| +128 | ruin ground | within 12 km of a ruin or ruined arcology settlement, and the region Ruins of Nazar |

### The families

| Family | Where (byte 0-255) |
|---|---|
| copper | volcanic 210, rift 120, crystalline 50, sedimentary 10 (porphyry Cu in arcs) |
| silver | volcanic 150, crystalline 110, rift 80 |
| gold (lode) | volcanic 140, crystalline 110, rift 90 |
| sulfur | `255 exp(-d / 10 km)` within 40 km of a vent, + 60 on volcanic ground |
| tin | crystalline 180, rift 50, volcanic 20 (granite) |
| rare-earth | rift 190 (carbonatites), crystalline 140, volcanic 30 |
| iron | crystalline 160, basin margins (sedimentary within 3 cells of crystalline or volcanic) 140, rift 70, volcanic 60, sedimentary 40 |
| coal | sedimentary x lowland x (0.25 + 0.75 wet) x flat, at most 230 (subsiding wet basins) |
| oil | 0.9 x coal smoothed over ~44 km, halved off the margins and folds; + 110 on low rift floors |
| saltpeter | 200 x aridity (rain under 600 mm), + 40 on evaporites |
| gypsum, halite, potash, alkali | the ringed basins (below); halite also 40 under flat, dry sedimentary basins (bedded rock salt) |
| stone, clay, wood, water | the ledger's basics only (no node kind): relief and hard rock; floodplains and lake shores; rain and warmth; rivers, shores and rain |

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
- **The field:** a GDScript twin of `RES_GEO.candidate` on `core/rand/krand.gd` (`KRand.cell`, `KRand.child`,
  `KRand.hash_ints`, `KRand.unit`, which `golden.json` proves equal to the JS). The arithmetic is doubles in the order above,
  and the cell is `floor(v + 0.5)`. Not `FastNoiseLite` (its cellular jitter changed between 4.1 and 4.2). The test: a
  tile's ids and positions against a JS-exported list, and the lode digests in `stats.lodes`.
- **Drawing:** one `MultiMeshInstance3D` per node def (`node-<kind>-<grade>`), the records from `KRES.register`'s export.
- **The ledger:** `data/ledger.json` as a `Resource` (or read as JSON): the sim's imports and exports.
- Not written yet: `kres_field.gd` and its test (the twin lands with the first Godot world that places nodes).
