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

## Open (2026-10-01) — closed by the 2026-10-02 republish

The published gallery predates the 2026-10-01 known-issues sweep merged to `main` (`ed2e893`): every build changed
(LOD, night lighting, Locus bridges/paddies/grid, Yuni interiors and caravans, Abyss kit fixes, materials and
vendoring). `gallery/site/` was rebuilt (98 pages, 118.9 MB) but not republished. Republish it to the URL above.
