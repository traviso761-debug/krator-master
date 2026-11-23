# Urundashi (`settlements/urundashi`)

**Urundashi** (*Urundaši*, `srbp1bvh1r`, `5.1 px 779, 1153`, `3,220 m` `Dfb` steppe) — fortified Mamluk steppe garrison town of the Kingdom of Shumar, seat of Province **`S4` `Ṣōrun-Dubnu`** (4th Regiment, *"Horsemen of the Steppe"*), eastern terminus of the `92 km` royal plateau highway from Amaro, and eastern customs gateway (`gate.east-foothills`) for Iziz and Order of Historians (`Longsong`) book caravans.

- **Population**: `3,500` in the walled town and three extra-mural suburbs (`185` `Gēdu-šu` Free Giants, `560` `-šu` Sword-caste, `380` `-ko` cadets, `200` `-no` outlander factors, `~2,175` `-ra` Hearth-Commons), plus `990` across `5` `KHAMLET.shumariRow` steppe ring villages (`4,490` total).
- **Architecture & Layout**: Built on `KCITY.grid` (`core/city/37-city-grid.js` — bastioned *ablaq* irregular square encircled by a `13 m` snowmelt moat with `4` stone arch gate-bridges and `4` Giant-clearance `sm_pishtaq_gate` portals), `kits/shumari`, `kits/construction`, `core/water`, `core/terrain/43-core-ground.js`, `biomes/shighlands` (`--station shumar`), and live `core/simulation` + `core/region/data/shumar-tune.js`.

## Commands

```bash
# Build dist/urundashi.html + sidecar texture packs + build-inputs.json
python3 tools/build.py settlements/urundashi

# Run offline [G data] geometry, KCITY.grid, census, and live economy checks
node settlements/urundashi/tests/test-urundashi-site.js

# Run headless WebGL assertions + render showcase views
PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python settlements/urundashi/verify.py --assert --no-cache
```

See `PLAN.md` for design details and `INDEX.md` / `PORT.md` for the fragment table.
