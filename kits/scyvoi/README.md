# kits/scyvoi: the Scyvoi kit

The Scyvoi (the Baer-San, as they call themselves) are a semi-nomadic people of the drylands of the central crater: salamander
riders who follow the wildfires, harvest the fruit that blooms after them, and raid the Hykkousoi and the Voth. They live in
tents, richly decorated inside and out, and retreat in the fire season to the **Baelu**: round fortresses of fitted stone on
the rocky outcrops of the western drylands. This kit is both halves of that life: the lavish tents and the austere redoubt.

**The nomads were split three ways (2026-10-07, the owner's style guides).** The Scyvoi keep gers and Tibetan-style tents, decorated in polychrome and appliqué; they ride salamanders, drive carts and chariots, herd goats, bison and cattle, and their chief has the vardo. The khaimas, the hide wedge, the Saharan pavilion and the smithy, supply and hidemaker's tents went to `kits/desert-nomads` (re-skinned there); the hide lodge (the shaman's hut) to `kits/ash-nomads`. Their places here are taken by the white appliqué tent, the gur, the two Tibetan halls, the shaman's ger and new trade tents, and a cartwright's tent is new. The goat-hair tents stay in both this kit and the desert one, with each culture's own interior. Both new kits are forks of this one and vendor its engine (below).

```
cd kits/scyvoi && python3 build.py                       # dist/scyvoi.html
python3 verify.py dist/scyvoi.html --assert              # invariants (headless Chromium, minutes under software GL)
python3 verify.py dist/scyvoi.html --cut --views "Great ger - inside (cut-away)"
python3 ../../tools/textures/pack.py kits/scyvoi        # (from the repo root) after a change to materials.json
```

The page is a kit sheet: rows of every asset on flat placeholder ground, the standard Krator sky. Its tools: the view list,
**Inspector** (T, on by default: the core/tags label of whatever is under the cursor, buildings, furniture and salamanders
alike), **Cut-away** (C: the near half of every tent opens, so the furnished interiors show from wherever you stand),
**Night** (N: 21:30, lanterns, braziers and fires lit, a pool of real lights near the eye), **Polygon** (P: click to drop
vertices, copy world x,z), **Walk** (F: eye height, WASD, drag to look). `?only=key,key` builds just those defs; `?t=` pins the
clock; `?mat=proc` draws without the library maps; `?furniture=0` draws no furniture (the records are still kept).

## What is in it

| Row | Defs | Class |
|---|---|---|
| Small tents | `tent-hunter-ger` (felt ger), `tent-bell` (saffron bell tent), `tent-black-small` (goat-hair, a hearth outside), `tent-tibet-small` (white cotton, the blue appliqué roof, a five-colour fringe, prayer flags), `tent-gur` (a white ridge tent with appliqué medallions and a blue border) | building, dwelling-single |
| Large tents | `tent-great-ger` (on two centre posts), `tent-black-great` (majlis, divider, household, fire ring), `tent-tibet-hall` (a long white hall: appliqué roof, cream walls banded in polychrome, prayer flags), `tent-applique` (eight-sided, appliquéd panels), `tent-tibet-great` (three hipped peaks, the war band's feasting tent) | building, dwelling-multi |
| Chief, shaman and trades | `tent-chief` (the great round tent on its deck: civic + dwelling, rich), `wagon-chief` (the chief's carved vardo: red lacquer and gilt, a barrel roof, a porch and ladder, furnished inside), `ger-shaman` (a dark blue ger, ribbons from the crown, mirrors and a skull over the door: religious), `tent-smithy` (a felt roof on an open lattice frame), `tent-hidemaker` (a felt awning, an appliqué edge), `tent-supply` (a striped bell tent, its front laced back), `tent-cartwright` (an open lattice frame and an awning over the cart beds; the catalog's cartwright set) | building |
| Salamanders and wheels | `salamander-riding` (two markings), `salamander-war` (barding, crest, lance), `salamander-draught` (the bodies are the fauna kit's, `kits/fauna`; the tack is drawn here); `chariot`, `chariot-team` (a yoked pair), `cart-supply`, `cart-ger` (a ger carried on a bed behind two draught salamanders) | life (kind salamander), prop |
| Herds and tethering | `bison-pen` (a wide ring of high wattle hurdles, the bison and the cattle, troughs and a hay rack), `bison`, `cattle` (kits/fauna), `goat-fold` (wattle hurdles, a trough, a hay rack and a flock of nine), `goat` (the fauna kit's drylands goat), `tether-post`, `tether-boulder` (catalog furniture, outdoor), `tether-line` (a picket line with three salamanders) | feature, life, furniture |
| The Baelu | `baelu`: the redoubt on its outcrop, with two tents pitched, two salamanders stabled | building: military, infrastructure, dwelling-multi |

**The Baelu** is about the diameter of a Dalab mound (outer wall r 30 m: Dalab's outlying mounds are r 30). Fitted
polygonal masonry in the Sacsayhuaman manner (`blMasonry`: courses of pillowed blocks whose joints lean and whose beds wander,
every block fitted to its neighbours, huge below and smaller above) on a red rock outcrop; a trapezoidal gate under a
monolith lintel at the head of a paved ramp; like a Fujian tulou, a ring of cells round a court, three storeys behind stone
galleries on corbels, stables in the north half of the ground floor, a flat stone roof walk behind merlons. Nothing in it
burns but the doors. The court has a cistern well (the water lies below the surface), a corbelled smokehouse, a cistern house,
and five raised stone platforms where the bands pitch their tents: two are pitched, three stand empty (it is half empty until
the fire season).

## The engine is shared

`kits/desert-nomads` and `kits/ash-nomads` vendor this kit's engine fragments (`10-core`, `27-mat`, `30-geo`, `36-def`, `40-tk-tentkit`, `90-scene`, `91-probe`, `91f-furnish`, `91n-night`, `92-camera`, `93-anim`, `99-tail`) unchanged: whatever names the kit or its culture lives in `src/26k-kit.js` (`KIT`, the library families, `KIT_FALLBACK`, the palette). Fix the engine here, copy it to both, and their `build.py --vendor-check` must read OK.

## Design rules this kit follows

- **Structure vs furniture.** Covers, poles, lattice, linings, floors felts, decks, the Baelu's stone are the kit's geometry.
  Everything loose (cushions, toshaks, rugs on the floor felt, tray tables, tea sets, lanterns, chandeliers, stoves, chests,
  bedding, saddle racks, the forge and anvil, the tying post and boulder) is a master-catalog piece placed through
  **core/furnish** (`FURNISH`, 91f-furnish.js) from the Scyvoi culture file `kits/catalog/krator-master-furniture-scyvoi.js`.
- **core/tags from the start.** Every def placement is a record in `KTAGS.page` (class, kind, culture `scyvoi`, types, wealth,
  style, its parent when nested), registered before it is drawn; core/furnish registers each piece as class furniture with its
  tent as parent. `_api.tags().audit` must read zero unknowns (verify.py asserts it).
- **core/materials from the start.** `materials.json` adopts library sets and pattern sheets (`tex/` is the pack); the
  material records are `window._materials` (KMAT). The owner's pattern sheets are in `core/materials/patterns/scyvoi/` and
  `patterns/common/` (zellige).
- **The animals are the fauna kit's** (`kits/fauna`, bundled as `KratorFauna`): the goats and the salamanders' bodies, their parts
  and animation, and their traits, yields and life, which every `SV_LIFE` record carries.
- **Life layer data.** Each salamander and goat has an `SV_LIFE` record: faction Scyvoi, a band as sub-faction, a job (mount, war
  mount, draught), an activity and a 24-hour dummy schedule. Nothing moves yet but the tail and the head.
- **The biome is a placeholder.** The ground is the library's withered grass; the crater drylands' flora (the pyre pillar
  and the other pyrophytes) belongs to `biomes/crater-drylands` and is placed by a world, not by this kit. The fire-fruit in
  the baskets is a placeholder until that biome's fruit is in the catalog.

See `API.md` for the functions and the frame conventions, `KNOWN_ISSUES.md` for what is open.
