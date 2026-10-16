# biomes/ringisles: notes

The isles of the Ring Sea at the sea's level: the isle demo's archipelago (`settlements/isle-demo/PLAN.md`, sections 1
and 2). Built 2026-10-14 on branch `claude/isle-demo` (phase P2 of that plan).

## What the land is (the assay of scale model 4.21)

The isle demo's ~9,800 km2 of land lies at the Ring Sea's level, -1,500 m below the datum (about 1.9 atm): annual means
27-39 degC, rain 550-4,000 mm. By class: hypertropic jungle XA 2,588 km2; rainforest Af 2,012; tropical savanna Aw
1,780; abyssal savanna XV 1,564; hot steppe BSh 784; abyssal salt steppe XS 648; monsoon Am 588. The savanna and steppe
classes are half the land, and the owner wanted most for them. Twelve geyser vents. Two Kautoan towns (Kautoa, Walapo).
The X classes are Krator's abyssal ones (over 1.9 atm): on an island they are its low ground by the sea, the denser and
hotter air; the A and B classes its higher ground.

## The showcase

One synthetic island (`src/45-host-stage.js`), about 3.4 x 2 km, the trade wind from the east: the windward mountain
(~190 m) wet on its east side and dry in its lee, the western peninsula dry to its tip. Its classes are made from a
dryness (the wind, the mountain's rain, its shadow) and the height (X low, A/B high), as soft weights, and handed to the
kit as `koppen:*` fields, exactly as the scale model's raster will be. The shore is made from a signed distance to the
coast (a chamfer transform on an 8 m grid): the beach's profile, the bay's mud, the lagoon's floor, the reef's crest on a
second outline 190 m out with no bay (so the reef runs across the bay's mouth), the drop beyond. The bench is a shelf of
reef rock on the windward headland, its pools let into it. The pan is a crust inside a low berm with four brine pools.
The vent is the geyser kit's (`GEYSER.cluster` at a point, then `GEYSER.lay`, read in place). The gardens are 25 plots
levelled into the slope east of the bay, the paddies terraced.

## Island scale

Trees stay small: the forest's canopy 10-35 m (the XA forest's lehua to ~35 m: its borrowed trees grown taller by
`BORROW.xa`), savanna trees 6-20 m, baobabs 25-40 m (swbay's gate baobab at half its size). The hyperjungle's giants are
never planted here (`verify.py --assert`: no tree over 42 m).

## Choices

- **In place, not copied.** Every borrowed tree is its own kit's builder (`make`/`grow`, swbay's `treeAt`), in its own
  registry. Five kits ride on the page for that (the Throne, swbay, eastabyss, sedesert, the geyser kit); their packs are
  sidecars trimmed to what is drawn here. The cost: the page carries those kits' code (about 1.4 MB) and their textures
  are built at load.
- **The burn mosaic is the kit's own** (a jittered 140 m grid of cells, each with its years since the last fire), not a
  fire model like the crater drylands' (`52-biome-craterdry-fire.js`): islands burn in small patches every year or two, and
  the mosaic is what the dry season looks like. A host can bind its own `burn` field.
- **The gardens are stands keyed `crop-<name>`**, so a settlement places a crop by key (`RINGISLES.stand('crop-taro',
  plot)`); kits/islanders' placeholder keys (`fl-paddy`, `fl-taro`, `fl-banana`, `fl-breadfruit`, `fl-coconut`) name the
  same stands (`RINGISLES.GARDEN_ALIAS`).

## The town gardens' crops (the owner's list, 2026-10-15)

| Key | Crop | Koppen | Drawn by |
|---|---|---|---|
| `crop-coconut` | coconut plantation | XA Af Am Aw XV BSh | the Throne's coconut palm (borrowed), grazed grass under it |
| `crop-mango` | mango orchard | Aw Am Af XV | this kit's mango (new) |
| `crop-banana` | banana grove | XA Af Am Aw | this kit's banana (new) |
| `crop-coffee` | coffee under shade bananas | Af Am (the wetter, cooler upper slopes) | this kit's coffee (new) |
| `crop-clove` | clove grove | Af Am (the upper slopes) | this kit's clove (new) |
| `crop-rice` | rice paddy | XA Af Am (wet lowland) | flooded terraces behind bunds |
| `crop-taro` | taro patch | XA Af Am | wet beds |
| `crop-sweetpotato` | sweet potato beds | Af Am Aw XV | ridges under its vines |
| `crop-herbs` | medicinal herbs | XA Af Am Aw | mixed beds (lemongrass, ginger, basil) |
| `crop-greens` | greens | XA Af Am Aw | rows of rosettes |
| `crop-sugarcane` | sugar cane | Af Am Aw XV | tall rows, a few in flower |
| `crop-breadfruit`, `crop-kava` | breadfruit grove, kava garden | XA Af Am | kept by the owner (2026-10-15) |

Harvest keys from the catalog where it has one: `generic_fruit_coconut`, `generic_fruit_plantain` (the banana). The
catalog has no mango, coffee, clove, rice, taro, sweet potato, herb, greens or sugar piece yet. The showcase plants the
lowland crops in the village gardens east of the bay and the coffee and cloves in a second garden up the windward slope.
- **Fauna is the fauna kit's** (`kits/fauna`): the host places its presets (`src/89f-host-fauna.js`); the kit places none.
