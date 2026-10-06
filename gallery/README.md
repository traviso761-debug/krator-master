# gallery/

The shareable gallery of every built world: https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9

It is shared as anyone-with-the-link.

## Update it

```
python3 gallery/build_gallery.py        # rebuilds every listed build, then writes gallery/site/
```

Then ask Claude to republish `gallery/site/index.html` to the URL above, with
every file in `gallery/site/worlds/` attached. One publish carries at most
64 MB; the site is larger than that, so publish it in two or more calls to the same
URL (files a call leaves out are kept, so later calls only need the rest). `gallery/site/` is not committed.

To add a world, add a line to `ENTRIES` in `build_gallery.py`. The page itself
is `index.template.html`; the script fills in the entry list.

## Published (2026-10-02)

Rebuilt with the Ys kit sheet, the Ys mockup and the nwbay biome added to `ENTRIES` (102 pages, 135.4 MB) and
republished to the URL above as version 36 (103 files, every page current with `main` at ff6252ed; this also
closes the 2026-10-01 item below). The publish went in three calls of under 64 MB to the same URL; files left
out of a call are kept. `gallery/site/` is a build output and is not committed; `python3 gallery/build_gallery.py
--build-missing` remakes it in about a minute.

Version 37 (2026-10-02): `worlds/iziz.html` replaced with the city on the world clock (Run time / Hold time in the
toolbar, `core/clock`), from `main` at ce6fb1ea. The index and every other page are as in version 36.

Version 38 (2026-10-02): a "Krator Scale Model" section with a link to the scale model artifact added under the header
(`index.template.html`); only the index page was republished.

Version 39 (2026-10-03): `worlds/girder.html` replaced with Girder on the material library (library textures with
the tiling break-up, leaf and flower cards, the fruit stalls, tone mapping and contact shading; `?mat=proc` shows
the old look), from `main` at 01f78aa3, with the index regenerated (Girder now 6.3 MB). Every other page is as in
version 36 to 38.

Version 40 (2026-10-05): `worlds/girder.html` replaced with Girder dressed in the full Beast Rider texture set (detail maps on the
furniture and mounts, the village dressing families, the extra cards; 12.2 MB), from branch `claude/beast-rider-textures` at d4f6c391,
with the index's Girder entry updated (size, blurb). Every other page is as in version 39. The Material Demo Kit
(https://claude.ai/artifact/PiddSxzJWKzfzRu9nycrXL) was republished the same day with the 2026-10-05 sets (version 6).

Version 41 (2026-10-05): `worlds/girder.html` replaced with Girder Hero (play as Styv, talk to Phil in the Assembly Hall;
`settlements/girder/hero/README.md`), from `main` at 5dc478e2, built with `build_hero.py --models-url girder-` because the
embedded page (20.5 MB) is over the 16 MB per-file limit: the page (12.4 MB) fetches `worlds/girder-styv.glb.txt` and
`worlds/girder-phil.glb.txt` (base64; `.glb` is not a served type). The index's Girder entry was updated (blurb, 20.0 MB,
source). `build_gallery.py` still lists plain `girder.html`; a full rebuild would put the plain page back.
That version failed in the gallery ("hero: styv: Failed to fetch"): the gallery's frame cannot fetch files published
beside a page.

Version 42 (2026-10-05): Girder Hero as its own card. `worlds/girder.html` is plain Girder again (the page committed on
`main`, 12.3 MB); a new "Girder · Hero" entry after it opens `worlds/girder-hero.html`, built from `main` at df74443b with
`build_hero.py --slim` (the models slimmed and embedded, 15.0 MB). `worlds/girder-styv.glb.txt` and
`worlds/girder-phil.glb.txt` were removed. The hero entry is not in `build_gallery.py`'s `ENTRIES` (it needs the
`--slim` build); a full rebuild leaves it out, so republish it by hand as above.

Version 43 (2026-10-05): `worlds/girder-hero.html` replaced (`main` at 0989ccf2). Version 42's page still failed in the
gallery ("Failed to fetch"): GLTFLoader fetched the models' embedded textures as blob: URLs and the gallery's frame
blocks fetch. The hero now loads them as data: images through an <img>. Checked headless under `connect-src 'none'`.

Version 44 (2026-10-05): `worlds/girder.html` and `worlds/girder-hero.html` replaced from `main` at 6728d4f6: Girder's walk
graph corrected against its walk solids (the villagers walk the galleries inside the columns), and the hero's cast and
dialogue read from `settlements/girder/hero/cast.json`. Index sizes 12.4 and 15.0 MB.

## Open (2026-10-01) — closed by the 2026-10-02 republish

The published gallery predates the 2026-10-01 known-issues sweep merged to `main` (`ed2e893`): every build changed
(LOD, night lighting, Locus bridges/paddies/grid, Yuni interiors and caravans, Abyss kit fixes, materials and
vendoring). `gallery/site/` was rebuilt (98 pages, 118.9 MB) but not republished. Republish it to the URL above.

Version 45 (2026-10-05): `worlds/ys.html` added, the Ys city at the close of phase 3 (the drowned and reclaimed Ancient
hosts with their grown pods, the bridge graph, the harbours, the river, the north-west bay biome, the foreign quarter,
the building editor), with `worlds/ys-kit.html` and `worlds/ys-mock.html` replaced by their current builds and the index
regenerated (Ys 5.9 MB), from `main` at a7f371b6. Every other page is as in version 44. One publish call.

Version 46 (2026-10-05): `worlds/mungo.html` added (Mungo, the reed-lake trade village on `core/simulation`) and
`worlds/motor-vehicles.html` (the Motor Vehicles kit, the Geomancers' dune buggy), with the index regenerated, from
`main` at 199cfdfe. Every other page is as in version 45: Locus (now on the shared core, with its buggy park), the
Locus and Eastern Abyssal kits, Reed Lake (Reed's Local), Shade (its life on `core/simulation`), the catalog, the
interiors and the eastern-abyss biome changed on `main` too and were not republished. One publish call.

Version 47 (2026-10-05): `worlds/yuni.html`, `worlds/yuni-kit.html` and `worlds/yuni-plants.html` replaced with Yuni on
the material library (24 families, the interiors included), the world clock (held; Run time) and the minimap (M), 7.3 MB
each; `worlds/krator-catalog.html` replaced with the catalog's 1520 pieces (Yuni's six interiors pieces re-harvested). From
`main` at 23ef6be7, with the index regenerated (Yuni's blurb and size, the catalog's count). Every other page is as in
version 46. One publish call.

Version 48 (2026-10-05): `worlds/mavs-refuge.html` replaced with Mav's Refuge's interiors (every lot, level room and hut
planned and furnished, kept as data with the bake inlined; real windows; interior lamps and hearths), 3.2 MB, from `main`
at b64cf395. The index changes only Mav's card (blurb and size). Every other page is as in version 47. One publish call.

Version 49 (2026-10-05): `worlds/verge.html` added (Verge, the Yuni-culture city on the abyss's rim, 2.7 MB) and
`worlds/little-demo.html` (the eastern desert at 1:1 with the biome kits' flora and its highways, 4.8 MB), with the index
regenerated. The Little Demo's six settlement tiles are not in the gallery (the frame blocks fetch): there the world runs
without its towns, and its own artifact carries them. Every other page is as in version 48. One publish call.

Version 50 (2026-10-05): `worlds/iziz-mechs.html` added (Iziz war-walkers: the Mechs kit, ten animated Iziz mechs and the
Supply Train Castra, 1.6 MB), with the index regenerated, from `main` at 8d8bf38d. Every other page is as in version 49.
One publish call.

Version 51 (2026-10-06): `worlds/ebadlands.html` added (the eastern badlands biome kit, 3.6 MB: sulphur flats, painted
badlands, a Zion canyon with a hanging-garden ruin, pine and spruce-fir to the ice; the library textures; trees as variants),
`worlds/krator-catalog.html` (1526 pieces: the badlands fruit) and `worlds/little-demo.html` (the badlands kit's flora on
the 'e badlands' overlay), with the index regenerated, from `main` after 8cf1c981. Every other page is as in version 50.
One publish call.

Version 52 (2026-10-06): `worlds/yuni.html`, `worlds/yuni-kit.html` and `worlds/yuni-plants.html` replaced with Yuni's
wild valley planted by the eastern badlands kit, its Zion side (oak, maple, cottonwood galleries, pine on the walls, hanging
gardens on the butte), 7.4 MB each, from `main` at 8ef7ea7d, with the index's Yuni entry updated (blurb, sizes). The live
index (version 51, published by another session after 1d088377) was merged: every other entry is as it was. One publish call.
Version 53 (2026-10-06): `worlds/nwbay.html` replaced with the north-west bay fixed and extended (the inside-out karst stacks
turned right way out; a tsingy of knife-edged fins with spinewands and rock bottles, a tiankeng with traveller's fans, two
cenotes, avenue baobabs; hero trees as six grown variants per species), 0.3 MB, from `main` at cf3e2206. The live index
(version 52) was kept: only the North-west bay card changed (blurb, "new"). One publish call.

Version 54 (2026-10-06): `worlds/iziz-mechs.html` replaced with the Mechs kit and its eleventh mech, the Talpa (an Ancient
tunnel borer with a rotary polybolos and crescent vanes, a rider in a saddle on its back), 1.6 MB, from `main` at 389f79c8.
The live index (version 53) was kept: only the Iziz war-walkers card changed (blurb, size). One publish call.
Version 55 (2026-10-06): `worlds/crater-drylands.html` added (the crater drylands biome kit, 3.2 MB: the fire mosaic in the
Throne's rain shadow, char, the superbloom, regrowth and old scrub from the kit's own fire model; prism mallees, pyre pillars,
frill-trees; granite kopjes; the library textures), from `main` at a2547d72. The live index (version 54) was kept: only the
Crater drylands card was added. One publish call.
Version 56 (2026-10-06): `worlds/scyvoi.html` added (the Scyvoi kit, 11.8 MB: five small and five large tents, the chief's great tent
and carved vardo, the shaman's lodge, smithy and supply tents, all furnished with a cut-away; salamanders, chariots and carts,
tethering; the Baelu fire redoubt) and `worlds/krator-catalog.html` replaced (1635 pieces: the Scyvoi furniture culture), from
`main` at 34d77bca. The live index (version 55) was kept: the Scyvoi card was added and the Master catalog card updated. One publish call.
