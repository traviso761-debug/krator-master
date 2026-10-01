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

## Open (2026-10-01)

The published gallery predates the 2026-10-01 known-issues sweep merged to `main` (`ed2e893`): every build changed
(LOD, night lighting, Locus bridges/paddies/grid, Yuni interiors and caravans, Abyss kit fixes, materials and
vendoring). `gallery/site/` was rebuilt (98 pages, 118.9 MB) but not republished. Republish it to the URL above.
