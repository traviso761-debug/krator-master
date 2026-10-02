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
3. `assemble.py 4.12 out.html`: write the heights and water, re-shade the textures to the new
   relief, paint the islands from East Ring Isles donors and the bay from the sea, update zones,
   climate class and temperatures, add the geysers to `vents`.
4. `patch_ui.py out.html final.html`: political / geographic / biome region layers, the tabbed
   list, the layer switch on each region, and labels along long, thin regions.

Everything is deterministic (fixed seeds).
