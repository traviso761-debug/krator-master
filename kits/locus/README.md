# kits/locus: the Locus kit

The abyssal-desert town's buildings on the Yuni engine: the Geomancers' chapterhouse, dwellings and tents, the salt-rice farm, the petroleum works (Locus's pumpjacks), power and fuel, the warehouse and the fishing dock, crops and marsh-edge plants (`src/64-locus-*.js`; `64-locus-core.js` holds the shared helpers). Moved unchanged from `settlements/locus/src` on 2026-11-03 (MODULARITY-PLAN.md step 4), with its
notes (`NOTES.md`: the fragments, their seed blocks, the rounds of work) and `KNOWN_ISSUES.md`.

`locuskit.py` names the files (`FILES`) and their paths; `PORT.md` has their port tags (moved with them from Locus's).

**What it draws through.** The Yuni engine and the Yuni base assets, which still live in `settlements/locus/src` (`05-palette`,
`10-core`, `45-kit`, `47-texture`, `50-structure`, `53-assets`, `56`-`59c`; MODULARITY-PLAN.md step 4: their extraction is the
next item, as step 2 did for the Scyvoi engine).

**Who takes it.** `settlements/locus` (its `locus-kit.html` shows the kit on the town's page; `locus.html` the town), `settlements/mungo` (a fork
of the Locus engine that reads it by name) and `settlements/verge` (its `YKIT` bundle).

**Its own sheet** (2026-11-09): `python3 build.py` writes `dist/locus.html` (the library maps beside it, `dist/locus.tex.locus.js`);
`python3 verify.py --assert` checks it (`kits/yuni/sheetverify.py`: every asset and variant builds and is registered, the
core/tags vocabulary, the doors as KDOOR records, the library textures, the engine read in place). Every asset whose `kit` names `locus`, each variant, in its group's row (`KIT_ROWS.locus`), with a
1.75 m figure, fronts north, a label over each piece near the camera, a button per row, a select and Prev / Next (the
arrows), Front / Back / Plan; `?interiors=1` plans the rooms and unlocks the doors onto them, as on Locus's page.

How it is split (MODULARITY-PLAN.md step 4b: the Yuni engine is not a core module and stays in each world that forked it):
- **The engine, Locus's fork, read in place from `settlements/locus/src`, never copied** (`kits/yuni/sheetbuild.py`
  `LOCUS_ENGINE`): `05-palette`, `10-core` (the sheet target sets its `KIT`; the world it carries is switched off), `45-kit`,
  `47-texture`, `50-structure`, `53-assets` (`assetInKit`, `assetGroup`, `KIT_ROWS`), `66-locus-furnish` (FURNISH: the kits'
  furniture from the catalog on core/furnish, and the interiors with `?interiors=1`), `72-lights`, `81-glow`, `86-inspect`,
  `95-locus-doors` (the doors on core/door). Its furniture and interiors bundles (`65z-furniture-bundle.js`: the catalog with
  Locus's cultures, the interiors' Locus and Abyss sets) are generated as Locus's page generates them, and the library pack is
  Locus's (`settlements/locus/materials.json`, `tex/`), read in place: the fork's families are Locus's palette.
- **The page shell from core**: `core/host` (camera, walk, panel, probe, the inspector, marks), `core/walk`, `core/door`,
  `core/furnish`, `core/atmos/placeholder` (KratorSky), `core/tags`, `core/rand`, `core/materials/record`.
- **The sheet's own fragments**: the Yuni lineage's sheet shell, `kits/yuni/targets/sheet` (read in place; `kits/yuni/README.md`,
  "Its own sheet"), with this kit's rows and ground from `build.py` (`CONFIG`, the generated `06-ys-config.js`). Both of
  Locus's kits are on the page (they share assets and the `LOCUS.*` helpers); the sheet lays out this kit's, as Locus's sheet did.

Where the split is not clean: the buildings' core/tags records come from the fork's `REGISTER`, which gives a building no types
and only a culture core/tags knows. The sheet copies each asset's declared types onto its record (through `KTAGS.norm`); the
cultures `abyssal-desert` and `geomancer` are not in core/tags' vocabulary, so those buildings carry none (counted by the
verify; `KNOWN_ISSUES.md`). Walking: the footprints are blocks (none with `?interiors=1`, whose rooms are walkable).

Locus's `locus-kit.html` (`settlements/locus`, its `locus` target) still builds, byte for byte as before; it stays while Locus
does (it is the same kit on Locus's whole page, with the town's sky and ground). Mungo's and Verge's pages are unchanged.
