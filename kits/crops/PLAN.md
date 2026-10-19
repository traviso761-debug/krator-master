# kits/crops: the Crops kit (plan, 2026-10-18)

World content that belongs to no culture and no one biome (owner, 2026-10-18). A settlement asks the kit what its
climate can plausibly grow, or what a recipe or food store needs, and gets crop records back. Same family as
`kits/resources`: plain data and pure functions (`[G data]`, no three.js, no DOM), keyed by stable ids, so it runs in
Godot. Biome kits do not own crops; they are *named* by crops' affinity rows.

Status: plan only. The twelve texture prompts it waits on are `core/materials/PROMPTS-NEEDED.md`, section 4. Build
after they are delivered.

## 1. A crop record

```
id          'emmer'                        stable, kebab-case
name        'Plain emmer'
bucket      'grain'                        PRIMARY food bucket (section 3); exactly one
also        ['fodder']                     further buckets it can stand in for
group       'staple'                       derived from the bucket (section 3)
form        'annual' | 'perennial' | 'vine' | 'shrub' | 'tree' | 'aquatic' | 'fungus'
grown       'field' (default) | 'underground' | 'water'   a dark-grown crop ignores sun and rain (section 2)
climate     { warmth: [lo, hi], atm: [lo, hi], aridity: [lo, hi], frost: 'none'|'light'|'hard' }
water       'rain' | 'rain-light' | 'irrigated' | 'paddy' | 'watertable'   (the need *at its best-fit aridity*)
stores      'fresh' | 'dried' | 'ground' | 'pressed' | 'cured' | 'brined'   how a store holds it
season      { sow, harvest } as fractions of the year, or 'year-round'
yield       relative, 0.5 / 1 / 2, as the resource nodes' grades
affinity    [{ biome: 'swlowlands', zone: 'plain', water: 'rain' | 'irrigated' }, ...]   the wiring
source      { kit, key, status: 'drawn' | 'proposed' }     which kit already draws it, if any
draw        { card, stand, tex }           how it is drawn: library card ids, ringisles-style `crop-<id>` stand
```

`water` and `affinity[].water` are separate on purpose: the first says what the crop is, the second says what a
given biome zone would have to do for it (rain-fed there, or irrigated). That is the "needs irrigation or not"
answer in the chat of 2026-10-18.

## 2. The three axes

The owner's sort: **warmth, atm, aridity**. They are bands, so a record is a range on each.

- **Warmth** (mean growing-season temperature): `polar` (EF, ET) < `cool` (boreal, montane Cfb) < `temperate` <
  `subtropic` (Mediterranean, humid subtropical) < `tropic` < `hot` (hot desert, geothermal ground).
- **Atm** (pressure, which changes frost, evaporation and how thin the air is): `thin` below 0.8 atm
  (ehighlands 0.6), `standard` 0.8 to 1.3 (shighlands ~1.0), `dense` 1.3 to 2.0 (the crater and geyser basins at
  1.9). Dense air roughly halves transpiration (`biomes/crater-drylands/NOTES.md`), so a `dense` crop's water need
  steps one band lighter: `irrigated` becomes `rain-light` at the same aridity.
- **Aridity** (the biome kits' own tags): `arid` < `semiarid` < `subhumid` < `humid` < `wet`.

**Dark-grown crops** (`grown: 'underground'`, `form: 'fungus'`) sit outside the three axes' rain and sun: they need a
cool, damp, still room and a bed of compost, dung or guano, so their climate range is the room's, and `affinity` names
the *culture or works* that keeps them (the Zeijani's alecap beds, `zj_farm_alecap`) as well as the biome it is wild in.
A query for a place marks them `rain: n/a`; a settlement with the works can have them in any climate.

A query is a point on the three axes plus an optional biome and zone; the answer is the crops whose ranges contain
it, each marked `rain` or `irrigated` (and `paddy` for flooded beds).

## 3. Food buckets

Recipes and stores call a **bucket** when any member will do ("some grain", "a green"), or a **group** one level up.
A crop has exactly one primary bucket and may list more in `also` (a coconut is `oil` and `nut`; a plantain is
`starch-fruit` and, green, `vegetable`).

| Group | Bucket | What it is | Members (new = this plan's proposal) |
|---|---|---|---|
| staple | `grain` | millable seed | rice, emmer*, frostoat*, ashmillet*, basin amaranth*, shore wild-rice* |
| staple | `pulse` | dry bean, pea, groundnut | helix bean*, tepary bean*, bambara groundnut*, rattlepod seed |
| staple | `tuber` | root, corm, rhizome starch | taro, sweet potato, yam, frostroot*, murnong*, shade manioc*, steambed yam*, ashroot* |
| staple | `starch-fruit` | fruit eaten as the carbohydrate | breadfruit, plantain, banana, silkpod, bell date |
| protein-fat | `nut` | tree nut, shelled | pinyon, acorn, beechmast, wingnut, mahogany nut, parasol pine nut, fireseed |
| protein-fat | `oil` | pressed for oil | coconut, whorl olive, avocado*, silkpod seed, avenue baobab seed |
| protein-fat | `alga` | pressed or dried algae | lakecake* |
| produce | `vegetable` | stalk, pod, fruit-veg, shoot | yucca stalk, ballmelon, frillpod, fiddlehead, tuna pad, young pod |
| produce | `greens` | leaf and frond | greens, tidewort*, lotus leaf, crozier |
| produce | `mushroom` | cultivated fungus eaten whole | pale fungi (cave), young gillparasol caps |
| produce | `fruit` | fresh tree or vine fruit, sweet | mango, apricot*, persimmon*, pomegranate*, guava*, citron*, ironplum*, tamarillo*, marula*, stinkbell*, crabapple*, brine apple*, fig, pitaya, tuna, grape, scalefruit |
| produce | `berry` | small soft fruit, dried or jammed | serviceberry*, sunthorn*, rowan, bilberry, madrone, arbutus, juniper berry |
| produce | `dried-fruit` | fruit that is mostly kept dried | wadi date, bell date, sidr*, carob*, canyon raisin, mesquite pod |
| flavour | `spice` | seed, bark, bud, rind | clove, umbel seed, juniper, citron zest, cacao nib (flavour use) |
| flavour | `herb` | fresh or dried leaf for cooking and medicine | lemongrass, ginger (rhizome), basil, bay |
| flavour | `sweetener` | sugar and syrup | sugar cane, carob syrup*, candle nectar, ash maple sap |
| utility | `reagent` | alchemical ingredient | glow mushroom (Zeijani lab cultures), Ranj resin, umbel sap |
| utility | `fuel` | burned or carried for light and heat | glow mushroom, lamp cap (a few days cut), cushion resin, tola |
| utility | `dye` | pigment and colour | alecap purple, lichen |
| drink | `beverage` | steeped, brewed or pressed to drink | coffee, tea (mist tea*), cacao, kava, rattle coffee, manzanita cider, **alecap** (fermented to beer) |

Notes:
- A bucket query takes `{ bucket }` or `{ group }`; with a climate point it narrows to what is plausible there.
  An absent bucket in a place is a finding (a hot desert has no `tuber` rain-fed), not an error.
- A recipe may name a bucket plus a preference list ("grain, preferring emmer"); the kit returns the first
  plausible member, else any member of the bucket the settlement can import.
- Fibre has its own group, `material`, with buckets `spinning` (cloth thread: cotton, flax, nettle, ramie, silk),
  `cordage` (rope and bast: sisal, rope banana, baobab bark, coir), `weaving` (mats, baskets, withies: reeds, rush,
  willow), `sheet` (felt, paper, membrane: the mat) and `thatch`; the proposals are in `FIBRE.md`. A crop that is also food lists the food bucket in `also`.
- Reserved for later, not food: `fodder`, `medicine`. (`dye`, `fuel` and `reagent` are live: group `utility`.) The `harvest` tags in the biome kits
  already hold some (thatch, weaving, dye), so the field is `uses: []` on the record, not a second schema.
- The existing species come from `biomes/FRUIT.md` and `biomes/ringisles/NOTES.md`. Entries marked `source.status
  'drawn'` link to the kit that draws them; the rest are proposed and drawn by cards in this kit.

## 3a. The alecap (Dhelv's beverage crop, owner 2026-10-18)

Records the Zeijani kit and the Throne notes already draw (`kits/zeijani` `zj_farm_alecap`, `card.mushroom.alecap`; the
Throne's wild and cultivated alecap, `biomes/throne/NOTES.md`): a peculiar purple mushroom, grown in the dark on beds of
compost, dung and bat guano, fermented into "a fairly passable beer" (the brewery, `zeijani_alecap_basket`, spawn racks).

```
id alecap  bucket beverage  also ['vegetable' (eaten), 'dye' (alecap-purple yarn, cloth and mural pigment)]
form fungus  grown underground  stores 'fermented' (add to the `stores` list)  water 'bed' (damp air, a water channel)
affinity: throne (wild), dhelv / the Zeijani (cultivated), any settlement with a dark works
draw: card.mushroom.alecap, zj_farm_alecap
```

The Zeijani farm the dark (`biomes/throne/NOTES.md`: "the glow mushrooms, the pale fungi, the alecap, the mat, carefully"). Owner,
2026-10-18, on the other three; all `form: fungus`, `grown: underground`:

| id | Bucket | Also | Notes |
|---|---|---|---|
| `pale-fungi` | `mushroom` | `vegetable` | Food. Krator's own cave fungus (the Throne's cave pass; no species key yet). Cooked or dried; `stores` fresh, dried |
| `mat` | `sheet` | `weaving` | Fibre. A slime mould (the Throne's `mat`): dried and pressed it gives a felt-like sheet. **Hazard:** it digests what sleeps on it, so it is kept in sealed tunnel beds; `hazard: 'digests sleepers'` on the record, and a works that keeps it needs `sealed` |
| `glow-mushroom` | `reagent` | `fuel` | Not food. The alchemist's culture (`zj_lab` glow-culture room, jars) and a light and heat source; the lamp cap is its cousin, a lamp for a few days cut |

The Throne draws `mat` (`THRONE.SPECIES`), `glowshroom` and `lampcap`; the kit's records point at those keys.

## 4. Code shape

```
kits/crops/
  src/10-crop-buckets.js    the bucket table (section 3)          [G data]
  src/20-crop-bands.js      the three axes, band functions         [G data]
  src/30-crops-*.js         the records, one file per group        [G data]
  src/40-crop-query.js      CROPS.at(point), .forBiome, .bucket, .pick(bucket, point, KRAND seed)   [G data]
  src/50-crop-draw.js       stands and cards                       (three.js side)
  src/89-rows.js            the sheet: every crop, drawn, with its bucket and band
  test-crops.js             node test: ranges ordered, every crop has one bucket, every affinity names a real biome
  build.py, verify.py, API.md, README.md, INDEX.md, PORT.md
```

Rules it follows (`CLAUDE.md`): picks draw from `core/rand` (`KRAND`) seeded from a hash of (world, settlement,
bucket, salt); numeric defaults are `x == null ? d : x`; everything a build places is registered in `core/tags`
before it is drawn; biome names in `affinity` are checked against `biomes/WORLD.md`'s kit list by the test.

## 5. Order of work

1. Texture delivery (twelve prompts) and wiring.
2. Records for the 16 proposals and the existing crops, with their affinity rows; the bucket table; the node test.
3. The query API and a sheet page; `verify.py --assert`.
4. Biome kits and settlements adopt it: `ringisles` crop stands read their records; Voth's food stores call buckets.
5. Gallery and `FRUIT.md` cross-links (the gallery question goes to the owner; this is a new kit).
