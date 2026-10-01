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
