# Xanadu building kit

The architecture of the remote southern Sultanate of Xanadu: a rich valley like Shangri-La, its houses stepping up
the hillsides. The general forms and massing are **Tibetan** — battered whitewashed masses, flat roofs with
parapets, the maroon twig band, black trapezoid windows under corbelled lintels, gilded roof pavilions — with
detailing from **India** (jharokha bay windows on carved brackets, jali screens, chhatri hoods), **Turkey**
(painted ornament, the cumba — an upper storey overhanging the street on raked struts) and **Persia** (pointed
arches and iwans, tile mosaics, bulbous turquoise domes, the baths and the chahar bagh gardens). Gold is on
everything wealthy, religious or civic: the valley's mines pay for it.

Built on the Ancients kit fragment contract and the Iziz Vernacular helpers (vendored through `../highlands`), so
the kit drops into a settlement target the same way the Highlands and Iziz sets do.

```
python build.py                                              # dist/xanadu.html
PW_CHROME=/path/to/chrome python verify.py dist/xanadu.html --assert --views "Overview,Sacred" --out shots
python jscheck.py .syntax-xanadu.js                         # parse check when node is missing
```

* `DESIGN.md` — the brief: the vocabulary, the slope rule, tags, the building list.
* `API.md` — the contract: registry, palette, kit items, helpers, rules for package work.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open.

## Erewhon, Pearl of Xanadu (round 9)

The city: `python3 build.py --target erewhon` → `dist/erewhon.html`. Its terrain is Travis's MS-paint map run through
`tools/erewhon-map.py` (see NOTES round 9); the districts, walls, gates, streets and every building are laid out in
`targets/erewhon/`. The Vale of Xanadu biome is vendored (`src/86-bio-*`) from `../../biomes/xanadu/` and plants the
gardens of the kit page too. The city's budget is 25 M triangles; buildings bake per 480 m chunk and the chunks are
culled by range and view each frame (the runtime LOD), the biome's own chunk LOD beside them.

```
python3 tools/erewhon-map.py <map.png> [--preview out.png]     # regenerate targets/erewhon/83-er-data.js
python3 verify.py dist/erewhon.html --assert --views "Overview,The palace precinct" --out shots/er   # ~2 min a shot in SwiftShader
```

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

The Erewhon target takes it as the kit sheet does; nothing in the Erewhon placement code changed.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| xanadu: first preset (opening) | 173 / 5.30 M | 86 / 787k |
| xanadu: second preset | 180 / 5.41 M | 140 / 1.12 M |
| xanadu: third preset | 175 / 5.40 M | 113 / 1.22 M |
| erewhon: opening | 1186 / 11.18 M | 880 / 4.95 M |
| erewhon: Overview | 1089 / 10.86 M | 646 / 2.47 M |
| erewhon: Main market, the square | 1100 / 10.57 M | 744 / 5.01 M |
