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

## The documents

- `API.md` — the generator's interface. Read before editing any fragment.
- `SUBAGENT.md` — how work is split between the planner and subagents, the
  invariants, and the brief template.
- `.claude/agents/` — four subagent definitions, loaded by Claude Code at
  session start.

## Layout

| | |
|---|---|
| `src/00-head.html` | page shell, error panel, Three.js loader |
| `src/05-palette.js` | **frozen** — all colour, materials, budgets |
| `src/10-core.js` | RNG, noise, water SDF, river, terrain field |
| `src/15-shore.js` | shoreline trace, arc-length addressing |
| `src/20-stage.js` | lights, sky, volcano, sun and moon |
| `src/30-layout.js` | cantons, wall, gates, roads, piers, farms, manors |
| `src/40-ground.js` | ground canvas and placement mask |
| `src/45-kit.js` | emit kit, instancing, world-unit UV hook |
| `src/47-texture.js` | procedural surface textures |
| `src/50-cantons.js` | canton geometry, spans, causeways |
| `src/55-chinampa.js` | chinampa fields (`CHINP` params block) |
| `src/60-land.js` | compounds and town buildings |
| `src/70-veg.js` | vegetation and terraced orchards |
| `src/75-terrain.js` | terrain mesh and water shader |
| `src/80-camera.js` | controls, preset views, HUD |
| `src/85-probe.js` | read-only API exposed to the verifier |
| `src/99-tail.html` | close |
