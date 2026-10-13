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
| roketstad: opening | 375 / 13.18 M | 375 / 10.42 M |
| roketstad: Overview | 416 / 8.92 M | 398 / 5.37 M |
| roketstad: Streets, eye level | 351 / 13.12 M | 290 / 10.90 M |

Roketstad's three rows above were re-measured on 2026-10-14 at 1280x800 (the verify.py default), with the old forest
(the vendored north-west lowlands), as the "before" of the North Highlands move; the rows below are the same views,
measured the same way, on the North Highlands kit:

| View (roketstad, North Highlands forest) | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| opening | 590 / 12.03 M | 567 / 8.98 M |
| Overview | 501 / 8.20 M | 459 / 4.67 M |
| Streets, eye level | 493 / 14.28 M | 404 / 12.04 M |

Roketstad's own instance LOD (RKLOD) is on in both columns, so the shared LOD adds little there: the merged meshes and
the biome, and fewer draw calls. The North Highlands kit's runtime LOD (`BIO.lodTick`, every frame) is on in both: it
draws a chunk of hero trees or floor only near the camera, so fewer triangles are drawn at the opening and the Overview
than with the old forest, and more draw calls (the near floor's item types, one call each per chunk in range).

## The forest (Roketstad)

Roketstad's forest is the North Highlands biome kit (`biomes/nhighlands`), its temperate band, read IN PLACE with
`core/biome` and `core/space` (build.py `TARGET_BIO`, as `biomes/geyser` reads the hyperjungle; `biomes/WORLD.md`).
Nothing of the kit is vendored; the one local fragment is the host binding, `targets/roketstad/86-bio-45-init.js`: the
mask (unchanged: no flora in the town, on a road, field, yard, plaza or building, on the wall band or the pads; the
trees stand 9 m back from roads and 70 m from the wall; all read from the core/mask grids), the climate fields (cold low
and rising east toward the Inner Wall, a few boulder fields, mist in the low ground; KRAND noise), the LOD spine (the
N, S and W gates and the port) and the registration (hero trees in `REG` for the inspector, every flora item and tree a
core/tags record in the page's registry, `KTAGS.page`). The kit's own species decide: round the town the broadleaves
lead (blue beech, moss maple, forest lime) under great spruce, cathedral cedar and shadow hemlock, with silver fir,
great trumpets and their understorey colonies, the old wood (gnarled oak, elder yew) on the boulder fields, and the
montane mix (Norway spruce, mountain maple) toward the east edge; ferns, moss, sorrel, bluebells and fallen giants
under them. `window._biome` and `window._biomeSpecies` count what was placed.
