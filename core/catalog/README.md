# core/catalog: the catalog's engine

The engine of the master catalog, moved here unchanged from `kits/catalog` on 2026-11-03 (MODULARITY-PLAN.md step 3).
Some 30 builds draw catalog furniture, so the engine is core. The content stays in the kit: one file per culture
(`krator-master-furniture-<culture>.js`), the harvested registry, the buildings, the plants and three.js r128.

| File | What | Port tag |
|---|---|---|
| `krator-furniture-core.js` | the half of the engine with no page in it: `TAU`/`shade`, `mat()`, the geometry kit `mk*`, `makeFrame`, the registries `FURN`, `PLANT`, `ASSET`, the vocabulary (`FURN_CULTURES`, `BUILDING_TYPES`, `FURN_TIERS`, `FURN_JOBS`, `FURN_SETTINGS`), which `core/tags/52-core-tags-vocab.js` copies and `core/tags/test-tags.js` checks | [draw] |
| `krator-asset-engine.js` | the page: scene, camera, controls, ground, labels, frame loop | [web] |
| `krator-furniture-kit.js` | the furniture kit `FK`: one parametric builder per role | [draw] |
| `krator-furniture-runtime.js` | `KratorFurniture`'s batches, inside another build (`kits/catalog/furniture_bundle.py`) | [draw] |
| `krator-furniture-detail.js` | the material library's detail maps on the batches (`bundle(tex=True)`); the shader is a three.js stand-in for StandardMaterial3D triplanar | [web] |
| `inspector.js` | the click inspector: measure, isolate, cycle variants, audit declared sizes | [web] |

The culture symbols are `core/sockets/38-symbols.js`. The catalog's builds still call them `krator-symbols.js`, and that
name resolves there.

**How a build finds a file.** `catalog.py` maps a catalog name to its file: an engine name to this folder,
`krator-symbols.js` to `core/sockets`, any other name to `kits/catalog`. `files.json` holds the list, and
`catalog-files.js` does the same lookup for node tools. A build keeps its lists of names in their old order and resolves
each one:

    sys.path.insert(0, os.path.join(ROOT, 'core', 'catalog'))
    import catalog as kcat
    read(kcat.path(f))        # the file
    kcat.rel(f)               # its repo-relative path, with '/': a label or a script tag

A page that loads the catalog at run time (`kits/interiors`, its sets sheet, `kits/ancients-interiors`, Voth's catalog sheet)
names `core/catalog/` and `core/sockets/` in its script tags, so it is served from the repo root (their `verify.py` does that).
The gallery inlines a page's local scripts, so publishing follows.

**Taken by:** `kits/catalog` (its sheet and `furniture_bundle.py`, so every build that furnishes from the catalog),
`kits/fauna`, `kits/mechs`, `kits/motor-vehicles` (the page engine and their bundles), `kits/interiors`,
`kits/ancients-interiors`, `kits/beast-riders`, `settlements/voth` (its build and catalog sheet), `settlements/isle-demo`,
`settlements/pinnacle-rock`, `core/tags` (its test), `tools/textures/audit_catalog.js`.

**Changing it.** Rebuild every build above, then run `node core/tags/test-tags.js`, `node kits/catalog/tests/test-segments.js`,
`python3 core/furnish/fingerprint.py` and `python3 core/engine/fingerprint.py` (for the furniture), and the interiors'
`verify.py --assert`.
