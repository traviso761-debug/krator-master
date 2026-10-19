# biomes/korona: the kit's contract

Korona (`NOTES.md`: the corona country under the giant) is three kits on one page, as `biomes/WORLD.md` allows: the
**hyperjungle** (read in place) on the warm wet floor, the **necanyons** kit (read in place) on the rock with its canyon
flora and its harmless carnivores, and **KORONA**, this kit, with the summit's life and the man-eaters. One `src/`, one
pack, one host; each station its own page (`build.py --station <name>`; `stations/<name>/` holds that station's host
fragments, `station.json` its page name and, as the Throne's, any other kit it reads in place (`kits`: slot to path) and
that kit's pack (`packs`): the lee gorge and the trenches (on the rain shadow's scree) read the **sedesert** kit so.

## What the host gives the kits

The host's `45-host-stage.js` (one per station) ends in one object, **`STAGE`**, which the shared `47-host-land.js` reads:

| key | what |
|---|---|
| `bodies` | the station's rock as `KSTACKS` records (`core/terrain/37-core-stacks.js`): the tepui, a butte, the stacks |
| `floor(x,z)` | the ground without the rock; `talusH` the scree banked against a wall's foot |
| `capY` | a top at or above it is a `cap` (the necanyons zones, `46`), below it a `bench` |
| `stream`, `streamD` | the stream (or null), and the distance to it |
| `pools` | `[{x, z, r, bed, ice}]`: standing pools; `bed` marks a sucking pool (the bladder bed, a trap); `ice` a frozen one, drawn as a plate of ice (the hoar table's tarn) |
| `path` | `[[x,z],...]`: the safe path (the hollow); traps keep off it, cairns line it |
| `windward(x,z)` | 0..1: how much of the rain a point takes (the wind is from the north-west) |
| `warm(x,z)`, `rich(x,z)` | the air's heat and density; the soil's silt (the fields below) |
| `poorExtra`, `wetExtra`, `rockExtra` | a station's additions to those fields (the hollow's acid floor) |
| `bogAt(x,z)` | the sphagnum on a top (the summit's wet hollows): the top mesh's second layer and the lace pitchers' ground |
| `layers`, `layerCol`, `weights(x,z)` | the floor mesh's three layers `a`, `b`, `c` (families of `materials.json`) and their vertex weights (`weights` returns `[wB, wC]`); an optional fourth `layers.d` takes a third weight (the trenches' sphagnum) |
| `layerMul` | optional `[[r,g,b], ...]` per layer: a tint on the layer, on the library's own colour too (the trenches pull their windward litter and sphagnum green) |
| `rockCol`, `waterCol`, labels | the procedural fallback's tints, the inspector's words |
| `jungle(x,z)`, `jungleQ`, `necQ` | the hyperjungle's extra mask and the two borrowed kits' quality |
| `bias` | `{plant: number | (x,z,Z)=>number}`: this station's say on each Korona plant's density (`57`, `60` multiply by it); `cobraMeadow` is an extra acceptance for the cobra lilies on the floor |
| `icefalls` | optional `{min, every, len(seep), w(seep), label}`: on the hoar table, a strip of `ice` down the bed's face under every seep line (`NECANYONS.SEEPS`) of strength `min` or more, on the wall's profile, a ragged foot; a tag record `icefall` each (not a probe volume: one merged mesh) |
| `carvings` | `{body, tier, a0, a1, y0, h, name}`: the Hum's contour carvings, a strip on that tier's face, its foot `y0` metres (eye height, 1.6) above the highest DRAWN ground along its arc (the talus and the apron banked against the wall included; `47` finds the bed). With an explicit `bed`, `y0` is above that bed's foot instead (the hoar table's rim marks) |
| `spine` | the LOD origins |
| `fields` | `{name: (x,z)=>v}`: a station's own fields, merged into the kit's (the gorge: `canyon`, `oasis`, `dune` for the sedesert kit) |
| `desert(x,z)`, `desertQ` | where the sedesert kit may root (a station that reads it in place: `station.json` `kits` and `packs`), and its quality |
| `bare(x,z)` | ground the station bars from every kit (the trenches' salt crust, the gorge's pool) |
| `high(x,z)`, `highQ` | where the ehighlands kit may root on the tops (the hoar table), and its quality |
| `topExtra(x,z)` | extra relief on every top (the hoar table's knolls): wrapped into `KSTACKS.topH`, so the beds' tops, the drawn mesh and every plant's foot move together |
| `snowAt(x,z)` | snow on a top (the top mesh's third layer, `ground.snow`) |
| `windows` | `BIO.init` windows (the Mother Cushion's) |
| `heroR`, `jungleQ` (0: no hyperjungle) | the hyperjungle's hero radius and quality |

`47` hands the kit what it needs through the core: `BIO.host.bogAt` and `BIO.host.korona = {bias, path, pools}`.

## The fields (through `BIO.field`)

`wet`, `flow`, `rock` as every kit reads them; Korona's own: **`poor`** (bare rock or leached sand with no silt:
`.85 rock + .15 on rock + .3 wet where rocky + poorExtra - .95 rich`), **`rich`** (the station's silt), **`warm`** (the
air), `upland`. **The rule:** `hell = poor x wet x warm` (`KORONA.hell(x,z)`). The harmless carnivores grow where it is
low; the man-eaters only where it passes .5 to .8 (`57`); the reagent (the rainbow fan) only where `rich` is up and the
ground is not bog (`60`). `99-host-take.js` checks both under `verify.py --assert`.

## The kit's surface (`KORONA`)

- `KORONA.build({R, quality})`: the trees (`55`), the hell (`57`), the summit (`60`). `KORONA.canopyH(x,z)`.
- `KORONA.SPECIES` (the coin tree, the lace fan), `KORONA.PLANTS` (every small plant and carnivore, with `items`, `tags`
  and, on a carnivore, `tags.trap`), `KORONA.TRAPS` (`KTRAPS.make` records: **`danger` is the hazard**, 0 harmless to a
  person .. 1 kills), `KORONA.HARVEST`.
- `KORONA.TREES`, `KORONA.TRAPPED` (every registered trap: `{id, key, x, y, z, r, zone, trap}`), `KORONA.NAMED` (the
  inspector's names: the rainbow fans, the dangerous plants), `KORONA.plantOfItem(item)`, `KORONA.nearestTree(sp,x,z)`.
- `KORONA.place(cell, salt, accept, fn, opt)`: the seeded cell grid (`KRAND.hash(seed, salt, i, j)`), `KORONA.hell`,
  `KORONA.bias(key,x,z,Z)`, `KORONA.pathD(x,z)`, `KORONA.blocked(x,z,pad)`.

Every dangerous plant is registered one by one in `core/tags` as class `flora` with its `trap` (the hazard the game
reads); the sucking pools as `bladderpool`; the carvings as a record of key `carving` with `hum: true`. The vocabulary
has no `hazard` key yet (`core/tags/PROPOSAL.md`): the danger rides on `trap.danger` until it does.

## The library (`materials.json`)

Every slot named there takes the owner's set through `BIO.libSwap('korona', KORONA.MAT)`; the procedural fallbacks are
painted 3 x 3 like the sheets, so a cell-mapped item reads a plant either way. A sheet's cell is the item's uv
(`cellUV`), not the pack's: one texture, several items (`lace0`, `lace1`...).
