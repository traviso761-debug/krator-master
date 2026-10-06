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
