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
