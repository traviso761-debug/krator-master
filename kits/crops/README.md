# kits/crops: the Crops kit

World content that belongs to no culture and no one biome (owner, 2026-10-18). A settlement asks what its place can plausibly
grow, or what a recipe or a store needs, and gets crop records back. Plain data and pure functions (`[G data]`): no three.js,
no DOM, so it runs in Godot. The plan is `PLAN.md`; the surveys are `FIBRE.md` and `DYES.md`; the interface is `API.md`.

```
cd kits/crops && python3 build.py                  # dist/crops.html, the sheet (a browser page over the data)
node tests/test-crops.js                           # the records and queries, each check with a negative
python3 verify.py dist/crops.html --assert         # the node test, then the sheet in headless Chromium
python3 ../../tools/textures/pack.py kits/crops    # (from the repo root) after a change to materials.json
```

## What is in it

- **118 crops** over 25 food, material and utility **buckets** in seven groups: staple (grain, pulse, tuber, starch-fruit),
  protein-fat (nut, oil, alga), produce (vegetable, greens, mushroom, fruit, berry, dried-fruit), flavour (spice, herb,
  sweetener), drink (beverage), material (spinning, cordage, weaving, sheet, thatch) and utility (dye, reagent, fuel).
- **Three axes**, warmth (polar to hot), air pressure (thin, standard, dense) and aridity (arid to wet). Each crop is a range
  on each; each biome is a set of zones on them (`10-crop-core.js`, `CROPS.BIOMES`).
- **Water:** a fit is `wild` (native there), `rain` (rain-fed), `irrigated`, `bed` (a dark works), `node` (a mineral dye whose
  node is in reach) or `trade`. Dense air steps a crop's rain-fed floor one band drier.
- **Dark-grown crops** (alecap, pale fungi, the mat, glow mushroom, lamp cap) ignore the climate and need a works.
- **Dyes and plaids:** `CROPS.palette(biome)` gives the colour families a biome has; `CROPS.canPlaid(biome)` is three families
  or more (the northern clans can; a desert cannot until it trades or reaches a node).

## Who uses it

Nothing yet. A build reads `src/10, 20, 22, 40` in place (and `core/rand`'s `08`) as kits read `kits/resources`; the cards
(`core/materials/library/card.*`) are the plants as the crops are drawn, and a build lists the ones it uses in its own
`materials.json`. The Ring Sea isles' `crop-<name>` stands (`biomes/ringisles`) are the first to move onto it.

## Not done

See `KNOWN_ISSUES.md`.
