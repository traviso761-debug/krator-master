# Scale model tools

Scripts that edit the **Krator Scale Model** artifact
(https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q). The artifact's rasters live inside the page
(a `DATA` object on one long line); the generator that made them is not in this repo, so these
scripts edit the decoded rasters directly and write a new page.

Working folder: decode every base64 raster from the 4.9 page (`orig.html`) into `<key>.png/.jpg`,
export the regions collection from the artifact's database as JSON, then:

1. `inner_wall_smooth.py 50 6`: soften the Inner Wall's outer flank, about 50 km either side of
   the 'Inner Crater' outline (writes `old_e.npy`, `new_e.npy`). Save `new_e.npy` as `e411.npy`.
2. `features.py <regions> <mesa ids>... --bay <id> --isles <id> 0.2`: weather the mesas in the
   given regions, carve the Bay of Voth off the Ring Sea, and raise geyser islands over 20% of the
   West Ring isles' water (heights, water, levels, geysers, masks).
   For 4.13, save that pass's outputs as `e412.npy`, `water412.npy`, `whas412.npy`, `wlev412.npy`,
   `feat412.npz`, then `features2.py <regions> --water <id> --flatten <id> --border <id> 80
   --join <id>`: region 42 to shallow sea, region 41's plateaus lowered, the cliff on Crag Men's
   northern border eased (80 km either side), Spice isle joined into one landmass.
   For 4.14, save 4.13's outputs as `e413.npy`, `water413.npy`, `whas413.npy`, `wlev413.npy`,
   `feat413.npz` (and its island geysers as `geysers413.json`, copied back to `geysers_new.json`),
   then `features3.py <regions> <4.13 page> --bridge <id> 485,520 575,504 --geysers <id> 5`: the
   land bridge from Spice isle to the volcano (checked connected), and geysers on land placed far
   from every vent and well inside the region (`geysers_land.json`).
3. `assemble.py 4.14 out.html`: write the heights and water, re-shade the textures to the new
   relief, paint the islands from East Ring Isles donors and the bay from the sea, update zones,
   climate class and temperatures, add the geysers to `vents`.
4. `patch_ui.py out.html final.html`: political / geographic / biome region layers, the tabbed
   list, the layer switch on each region, and labels along long, thin regions.

Everything is deterministic (fixed seeds).

## What-if: the eastern abyss as one bowl (preview, not in the live model)

`abyss.py <region.json> 16` rebuilds the 'e abysss' biome region (from 4.14's outputs saved as
`e414.npy`, `water414.npy`, `whas414.npy`, `wlev414.npy`, `feat414.npz`) as one bowl: walls
falling from the drawn edge over ~16 km, a smooth floor to -2.6 km at three low points where the
present lakes are, and a salt lake in each, about the size of the old one. Then `assemble.py`, then
`abyss_climate.py <label> <out.html> <assembled.html>` re-derives the climate by the model's own
rules (pressure from height; temperatures at 5.5 C/km; abyssal classes above 1.85 atm by the
existing rain field: XW < 400 mm, XS < 800, XV < 1350, XA above; salt lakes WX) and writes
`abyss_report.json`. Before the climate pass, `rainfit.py` (needs scikit-learn) fits the model's
own rain to its terrain (height, relief, rise along the NW wind, upwind barriers, upwind and nearby
water, position; held-out R2 0.95 on log rain, 0.82 on abyssal ground) and writes the change in log
rain the edit causes; `abyss_climate.py` applies it, re-derives abyssal classes from the new rain,
and outside the abyssal floor moves cells across the Koppen dryness lines (Peel et al. 2007) only
in the direction their rain moved. Published as a separate preview page: https://claude.ai/artifact/GDfGZYF4XH75U7rZRmd83L
