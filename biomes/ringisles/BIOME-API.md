# The Ring Sea isles kit — the contract

The kit sits on the shared biome core (`core/biome`, `CORE_BIOME` in `build.py`) like every kit: the host gives the core
its `BIO.init({...})` (THREE, scene, terrainH, waterH, mask, fields, ticks, register...: see
`biomes/hyperjungle/BIOME-API.md`), and nothing in the kit names a world's engine. What is particular to this kit:

- **Its zones are chosen by the climate class** (WORLD.md, "Koppen as fields"), not by its own thresholds. It is the
  first kit to place by `koppen:<class>`.
- **It grows other kits' trees in place** (`RINGISLES.BORROW`): those kits must be on the page (their fragments, as one
  block each, before this kit's; `build.py` `KITS`). A kit that is missing loses only its species.

## 1. The fields a host binds

| Field | What |
|---|---|
| `koppen:XA`, `koppen:Af`, `koppen:Am`, `koppen:Aw`, `koppen:XV`, `koppen:BSh`, `koppen:XS` | the scale model's climate classes at the point as soft weights, summing to 1 on land, 0 at sea. Without them the kit falls back to its own thresholds on `wet` and `upland` (`RINGISLES.classAt`) |
| `wet`, `slope`, `rock`, `upland`, `salt` | the world's (WORLD.md) |
| `beach` | the sand above the water (the strand: coconuts, pandanus, sea grape, creepers, the wrack line). The Throne's palms read it too (they lean out over it) |
| `dune` | the sand behind a lee beach (beach grass, sea grape) |
| `mangal` | the sheltered shore's mud, in and out of the water (the mangroves, stilt-wood, knee trees) |
| `lagoon` | sheltered water 0.4-3.5 m deep inside the reef (seagrass, coral heads) |
| `reef` | the reef flat (coral crowded, rubble) |
| `bench` | rock awash at the shore, with tide pools (anemones, urchins, limpets) |
| `pan` | a salt pan's crust (its rim the glasswort's and the salt cedar's) |
| `garden` | a town's fields: the wild keeps out (the gardens are planted by `RINGISLES.stand`) |
| `floor` | the geyser kit's thermal ground: this kit plants nothing there |
| `burn` (optional) | years since the ground last burnt; without it the kit makes its own mosaic (`RINGISLES.burnAge`) |

## 2. Build

```js
RINGISLES.build({R, quality, plots}) -> {gardens, trees, heroes, far, borrowed, bySpecies, under, dressing, ...}
//   62 the gardens (plots first: their trees claim their ground)  ·  55 the trees  ·  60 the dressing (lianas,
//   epiphytes on the XA forest's trees) and the floor (by zone; the water's passes by their window of depth)
RINGISLES.stand(key, {x, z, w, d, a, level})   // one garden plot by its crop key (below); level: its ground (the host
                                               // levels it). kits/islanders' fl-paddy, fl-taro, fl-banana, fl-breadfruit,
                                               // fl-coconut name the same stands (RINGISLES.GARDEN_ALIAS)
RINGISLES.treeAt(key, x, y, z, {seed, scale, lv, leanA})   // one tree, the kit's own or a borrowed one, by key
RINGISLES.classAt(x, z) -> {XA, Af, Am, Aw, XV, BSh, XS}   // the weights the kit places by
RINGISLES.zones(x, z)      // the zones (BIOME-API's table in 55-biome-ringisles-trees.js)
RINGISLES.burnAge(x, z), RINGISLES.burnState(age) -> {black, flush, green, cured}
RINGISLES.canopyH(x, z), RINGISLES.nearestTree(key, x, z, minH)
RINGISLES.SPECIES, BORROW, PLANTS, GARDEN, PASSES, allSpecies()   // data; allSpecies() the borrowed ones with their tags
```

## 3. The crops (`RINGISLES.GARDEN`, the owner's list of 2026-10-15)

Tree crops: `crop-coconut` (the Throne's coconut), `crop-mango`, `crop-banana`, `crop-coffee`, `crop-clove` (Af/Am: the
wetter, cooler upper slopes), `crop-breadfruit`. Ground crops: `crop-rice` (wet lowland paddies), `crop-taro`,
`crop-sweetpotato` and `crop-sugarcane` (tolerate Aw), `crop-herbs` (medicinal), `crop-greens`, `crop-kava`. (Yam was dropped.)
Each carries its Koppen classes and harvest tags (`generic_fruit_coconut`, `generic_fruit_plantain` where the catalog has
a piece). NOTES.md has the table.

## 4. Borrowed species (grown by their own kits)

| key | kit | its species | scale | where |
|---|---|---|---|---|
| lehua | throne | lehua | 1.25 (x1.45 at full XA) | the forest's canopy |
| treefern, archpalm, palmfrill | throne | tree fern, arch palm, palm frill | 1, 1, 0.9 (taller in XA) | the forest |
| coconut | throne | coconut palm | 0.9 | the strand, the plantations |
| mangrove | throne | hyper-mangrove | 0.6 | the mangal |
| staraloe, gillparasol | throne | star aloe, gill-parasol | 0.85, 0.75 | the steppe, the savanna |
| umbrellathorn, baobab | swbay (`treeAt`) | umbrella thorn, gate baobab | 1, 0.5 | the savanna |
| fanpalm, stiltwood, kneetree | eastabyss | fan palmetto, stilt-wood, knee-tree | 1, 0.9, 0.5 | the savanna, the mangal's back |
| bottle | sedesert | bottle tree | 0.7 | the steppe |

A borrowed tree is built by its kit's `make` and `grow` (swbay's `treeAt`): its own buckets, items and far tree, in its
own registry. This kit only chooses where, and the size. Its tags are its kit's, with this kit's Koppen classes and zone.

## Tags (project rule)

Every species, borrowed species, plant and crop: `climate`, `aridity`, `abyssal`, `riparian`, `koppen` (the classes
of `RINGISLES.CLASSES`), `origin` (earth, krator, native, dead, crop), `zone` (`RINGISLES.ZONES`), `harvest`
(biomes/FRUIT.md: the strand pandanus' keys are the catalog's `generic_fruit_pandan_keys`, the banana's
`generic_fruit_plantain`).
