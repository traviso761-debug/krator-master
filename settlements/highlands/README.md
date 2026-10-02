# Highlands building kit

The wooden architecture of the highland, temperate regions of the Inner Wall, in three related branches —
**Republican** (the Iron Republic: Russian + Transylvanian Saxon, Peles for the grand), **Rustic** (the villages
to the south: Norse + Alpine) and **Tribal** (the Painted Men: bamboo, raw logs, totems, cliff settlements) —
carved and painted in a NW-coast formline palette, with a note of East-Asian dougong on civic eaves.

Built on the Ancients kit fragment contract and the Iziz Vernacular helpers (vendored), so the kit drops into a
settlement target (Raketstad is next) the same way the Iziz Vernacular set dropped into the Iziz city.

```
python build.py                         # dist/highlands.html (the whole kit, one page), roketstad.html
python verify.py dist/highlands.html --assert --views "Overview" --out shots
```

* `DESIGN.md` — the brief: branches, shared vocabulary, lighting rule, tags, the building list.
* `API.md` — the contract: registry, palette, kit items, helpers, rules for package work.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open.

## Level of detail (core/lod)

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into chunks
that switch to clustered proxies with distance and are drawn combined (one draw per level in view); instanced sets keep
one draw call, drop their smallest instances by screen size and switch detailed shapes to a simplified version far off.
The originals stay the raycast targets, so the inspector and `_api` see full detail (checked: the inspector names the
same thing at nine screen points per view with LOD on and off). The panel (`l`, `measure`) reads draw calls and
triangles; `LOD.enabled=false` or `?lod=0` puts back the exact scene. `verify.py --assert` passes with LOD on.

`94-hl-anim.js` names the turning orreries and the clock hands in `LOD_OPTIONS.skipUnder`. In Roketstad the kit's
instanced sets are left to its own screen-size LOD (`targets/roketstad/93b-rk-lod.js`, the `LOD` button in the view
bar), which already rewrites them as the camera moves; the shared LOD takes the merged meshes and the biome.

Measured 2026-10-01, 1000x640, SwiftShader (`LOD.flush()` then `LOD.measure()`: one render of the main scene, so
calls and triangles as three.js counts them; sky passes not included):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| highlands: first preset (opening) | 291 / 3.16 M | 156 / 1.13 M |
| highlands: second preset | 291 / 3.16 M | 174 / 515k |
| highlands: third preset | 307 / 3.17 M | 193 / 396k |
| roketstad: opening | 364 / 7.67 M | 345 / 7.62 M |
| roketstad: Overview | 400 / 5.56 M | 362 / 5.07 M |
| roketstad: Streets, eye level | 351 / 10.96 M | 296 / 10.63 M |

Roketstad's own instance LOD (RKLOD) is on in both columns, so the shared LOD adds little there: the merged meshes and
the biome, and fewer draw calls.
