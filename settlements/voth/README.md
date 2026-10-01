# Voth

A Venice/Vivec-like Dunmer city on an enclosed brackish bay, generated
procedurally in Three.js and built into one self-contained HTML file.

## Run it

Open `voth.html` in a browser. That is the whole product — no server needed.

## Change it

`src/` holds the generator as numbered fragments. `build.py` concatenates them
into `voth.html` and enforces the rules that make parallel work safe.
`verify.py` loads the result in headless Chromium and measures it.

```
python3 build.py
python3 verify.py voth.html --assert --baseline baseline.json \
        --views "Overview,Chinampas" --out ./shots
```

## Building catalog

`catalog/` holds every Voth building on one sheet: the structures the city
builds (captured from a live build), the first-generation registry, and the
new building types (housing, manors, shops, taverns, warehouses, civic,
military). It has automatic LOD. See `catalog/README.md` and
`catalog/CITY_INVENTORY.md`.

The first-generation registry and the `voth_*` furniture and plants live in `kits/catalog/`. Its verify pass
(2026-10) recentred `voth_bldg_customs_house`, `_guild_hall` (v1), `_townhouse` (v4), `_monastery_hall`, and
eight furniture pieces (strider station, guild banners, loom display, fisher, miner, sacrifice altar, lantern
fixture v2). It also raised the declared sizes of `voth_craft_tanner`, `voth_lantern_fixture` and 14 Voth plants.
None of this was synced into `src/`. The city declares no sizes, and the catalog pieces are rewrites, not copies:
`siltStriderStation()` (65b) is a 16 x 22 m deck with a ramp, while the catalog station is 10 x 16 m. City
builders such as `customsHouse()` take their size as arguments and draw in world coordinates. The catalog
page loads the registry from `kits/catalog/` by path, so it already shows the corrected copies.

## The documents

- `API.md` — the generator's interface. Read before editing any fragment.
- `SUBAGENT.md` — how work is split between the planner and subagents, the
  invariants, and the brief template.
- `.claude/agents/` — four subagent definitions, loaded by Claude Code at
  session start.

## Layout

`INDEX.md` lists every fragment, its sections and its size. Regenerate it
with `python3 ../../tools/make_index.py`. Files that share a numeric prefix
(`78a-`, `78b-`, …) are one fragment split into readable parts; `build.py`
treats the group as one unit. The main groups are:

| | |
|---|---|
| `src/05-palette.js` | **frozen**: all colour, materials, budgets |
| `src/10-core.js`, `15-shore.js` | RNG, noise, water SDF, river, terrain; shoreline arc-length addressing |
| `src/20-stage.js`, `21-sky.js` | lights, sky, volcano, sun and moon |
| `src/30a–30d` | city layout, districts, mainland shore, roads, curtain wall, strider stations |
| `src/45-kit.js`, `47-texture.js` | emit kit and instancing; procedural textures |
| `src/50a–50f` | cantons, palace, canton types, guild, necropolis, spans |
| `src/60-land.js`, `61-monastery.js` | compounds and town buildings; the monastery |
| `src/65a–65l` | smoke, props, flora, docks, shrines, walls and gates, tavern, healing, mills, arena |
| `src/70-veg.js`, `71-industry.js` | vegetation; wilderness industry |
| `src/78a–78j` | life layer: nav grid, ships, boats, citizens, clergy, trade, arena combat |
| `src/79a–79c` | silt strider convoys, their nav grid, the strider model |
| `src/80`–`87` | camera, day/night, weather, fauna, probe, inspector, path visualizer |

## Level of detail

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into
frustum-culled chunks that switch to clustered proxies with distance; instanced sets keep one draw call and drop their
smallest instances by screen size. The originals stay the raycast targets, so the inspector and `_api` see full detail.
The `LOD` panel (bottom right; `l` toggles it, `measure` renders the view both ways) reads draw calls and triangles.
`LOD.enabled=false` (or `?lod=0`) puts back the exact scene the build made; `LOD.stats()` and `LOD.measure()` are
there for verify.

`80-camera.js` sets `window.LOD_OPTIONS`: the life layer's vehicles and crews (`userData.life`) stay outside it, since
they are rewritten every frame, and the panel sits bottom centre, clear of the view list and the sky panel.

Measured 2026-10-01, 1000x640, SwiftShader on a shared 4-core machine (`LOD.flush()` then `LOD.measure()`; triangles and
draw calls as three.js counts them. Frame times were too noisy under the shared load to quote):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| Down the bay | 67 / 4.25 M | 68 / 1.98 M |
| Harbour quay | 67 / 4.25 M | 68 / 2.21 M |
| Far shore | 67 / 4.25 M | 67 / 2.23 M |

Voth draws every instanced set with frustum culling off, so with LOD off every view costs the same 4.25 M. With LOD
on each set is culled by a real bounding sphere, small instances (props, figures, lanterns) drop by screen size, and
the 72-triangle dome and blob shapes switch to a clustered version far off. Draw calls rise by at most 1 (a far
version; the terrain's chunks are drawn combined, one draw per level in view). The views look the same with LOD on and off.
