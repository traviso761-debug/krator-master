# Gihon: known issues

Steps G0-G3 of `PLAN.md` (2026-11-22). What is owed, by whom.

## Textures

- **The temple's gold and opal** (`kits/xanadu/extra/88h-xa-gihon.js`, `xa_grand_temple_gold`): the gilt is the kit's plain
  metallic `MAT.xGold`, and **the opal inlay is a procedural stand-in** (`MAT.xOpal`: a milky, slightly metallic tint per
  instance from five opal hues). Both sets are asked for in `core/materials/PROMPTS-NEEDED.md` section 59 (`metal.gilt.leaf`,
  `inlay.opal`).
- **The town wall's slate** is Kirstabal's stand-in (`brick.dark` tinted slate, section 57).

## The page

- **The ground near the town is designed**, blended into the scale model (2 km a pixel) past 4 km: the model's apron here rises
  45-55 m a km, the town's 30, so the blend steepens to about 40 m a km at 4-6 km out. The Opal River's line at 1:1 is drawn
  from the model's (960,1613 to 955,1606) past the town's east side; its valley is cut into the apron.
- **The forbidden city** stands on a levelled terrace (cut and fill, a 26 m batter), its wall drawn from the fort asset's
  `watch` ward raised to 10 m curtains: the asset has no size between the watch fort and Strongwall's march fort, so the
  royal wall is the ward with its curtains and towers raised (41 `FC_T`). Its gates are closed gatehouses, as the asset draws
  them; the forbidden city's axis street ends at them.
- **The forbidden city's pieces** are kit pieces: the Mint, the assessors' hall and the treasury are new (88h); the Golden
  Tears' head house is the kit's Cholet palace (`xa_andean_rich`), the commandant's house the hillside manor, the magazine a
  granary. No interiors.
- **The Alph's hamlets and the Landing** are records (core/hamlet, core/city) laid on the model's ground and the Landing's own
  designed ground; they are not drawn on this page (30-140 km off). The region draws them (below).

## On the region (`openworld/xanadu-oidong-highrift`, 2026-11-22)

- **The Landing** is put on the world as its page laid it (`bake_landing.js` writes the region's `src/47g-site-gihon-landing.js`;
  core/world 48s `laidVillage`), turned 27 degrees and moved 360 m north-west so its banks meet the world's shore, which runs
  north-south there while the Landing's own shore line is 22 degrees off it. **The world has no river between the banks:** the
  scale model's Nahr ash-Shalālāt starts at px 932,1598, 2.8 km inland of the world's lake shore, so its first reach (the
  Landing's 180 m channel) is dry ground. For the scale-model session's queue (with the flats in `PLAN.md` section 1): carry the
  outlet's line to the lake. Until then the region leaves out what wants the river: the ferry, the two barges at the piers' river
  berths, the north pier's two root runs (its ground over the deck) and one north-bank house (in the lake): 6 of 430 records,
  2,759 of 2,771 people.
- **The customs house** (88g's `xa_customs_house`) is a massing box on the region: the region's kit bundle takes 88d and 88f (the
  piers, the lights, the barges, the warehouses) but not 88g, whose works pieces (the wayside shrine, the apiary) the village rows
  lay as pending boxes: with 88g the page would size them and the bake would not. The ring's and the Alph's shrines and apiaries
  are pending boxes for the same reason. Both go when `extra/` folds into the kit's `src` at the all-builds rebuild.
- **The ring and the Alph's hamlets** are laid again on the world's own ground at the tune's places (core/hamlet, the Xanadu row by
  name), not copied from the page's: their houses stand where the world's ground puts them. **The Alph's upper three have no
  road yet**: the Alph's last 45 km on the world are a trench (its bed flat at -2,051 m, 366 m under the lake; Mēḍō and Wēyar
  stand in it) and their roads out of it failed the region's highways check. For the scale-model queue with the flats above.
- **The kit's sheet** does not show 88h's pieces: they are opt-in, read in place; the sheet takes them when `extra/` folds into
  the kit's `src` at the all-builds rebuild (`TODO.md`, "Ride along").

## The economy (G1)

- The Landing's hub stays Kirstabal (112 km); the Alph's lower hamlets tithe to it and its grain comes up the lake.
- Gihon lights its avenues from the Sultan's licence (`T.lit`: .08, taken from the capital's .43, *proposed*).
- `test-xan-economy.js` check 10 (a year in under four minutes) fails on a loaded machine, as it did before G1 (588 s).
