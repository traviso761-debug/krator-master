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
  designed ground; they are not drawn on this page (30-140 km off) nor yet in the region.
- **The kit's sheet** does not show 88h's pieces: they are opt-in, read in place; the sheet takes them when `extra/` folds into
  the kit's `src` at the all-builds rebuild (`TODO.md`, "Ride along").

## The economy (G1)

- The Landing's hub stays Kirstabal (112 km); the Alph's lower hamlets tithe to it and its grain comes up the lake.
- Gihon lights its avenues from the Sultan's licence (`T.lit`: .08, taken from the capital's .43, *proposed*).
- `test-xan-economy.js` check 10 (a year in under four minutes) fails on a loaded machine, as it did before G1 (588 s).
