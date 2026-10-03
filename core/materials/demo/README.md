# Material demo kit

One page that lays every candidate material set on a wall: **rows = type of surface, columns = culture**. Each panel is
2 m square and shows the set at its `scale` (world metres per tile), so a per-metre guess can be judged by eye.

```
cd core/materials/demo && python3 build.py --scratch <dir>      # dist/materials-demo.html (28 MB, not committed)
```

`--scratch` (or `$KRATOR_DEMO_SCRATCH`) holds the sets that are not in git: `demo/gpt/<id>` (processed ChatGPT images),
`demo/ph/sets/<slug>` and `demo/amb/sets/<slug>` (Poly Haven and AmbientCG picks reduced by
`tools/textures/ingest_polyhaven.py --only ...`). Sets already in `core/materials/library` and `patterns` are read from there.
`manifest.json` lists the entries, their row, column and status.

Status dots: green = committed, blue = new (processed, not committed), amber = scan candidate. Scan picks carry
"scale?": the scale is an estimate. Controls: View (lit, albedo, normal, roughness), Scale (metric, one tile, 3x3 tiles),
Metric x (stretch the metric scale), Tint (colours every tintable set), Light (angle, orbit), Show (filter by status).
Click a panel for its source, licence and prompt. `f` fits the whole wall, Esc closes the panel.

Nothing here is a runtime dependency: the page is a viewer. three.js r128 is inlined from a local copy.
