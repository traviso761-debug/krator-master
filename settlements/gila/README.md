# Gila — the Lizardmen's salt village on its lake

Gila (`px 653,1485`, pin `sze26pgivd`, −1,614 m, 1.96 atm, XV abyssal savanna) is the Lizardmen's western regional
village of ~3,000 residents by caste on a ridge spit 110 m above Gila's salt lake (−1,723 m, 2,304 km²). See `PLAN.md`
for the site, caste shares, rhombic squared-spiral street, ley line, salt works and Coil Rounds books.

## Build and verify

```bash
python3 tools/build.py settlements/gila
KRATOR_GL=gpu python3 settlements/gila/verify.py settlements/gila/dist/gila.html --assert --views "Overview,The nest hall,The salt works and lake,The west reliquary"
node core/hamlet/lizardmen/test-hamlet-lizardmen.js
node settlements/gila/test-gl-records.js
```

## Fragments (`src/`)

- `66-gl-works.js` (`gl`): the four pieces the Lizardmen kit lacked (`gl-well`, `gl-tank`, `gl-pans`, `gl-saltstore`).
- `88-gl-records.js`: `GL_REC` (`[G data]`): census by caste, crops (`kits/crops`), works, seasonal makes/needs and Coil Rounds allotments.
- `89-rows.js`: overrides the kit sheet's showcase rows (`FAMILIES = []`).
- `89g-gl-site.js`: `GL_SITE` (`[G data]`): scale-model heightfield registered in `KDRAWN`, the 75°/105° 1.25× rhombic squared spiral and ley line on `core/city`, the east-shore salt-works hamlet on `core/hamlet`, the NW crest fields/farms/windmills/circle, and the west reliquary behind the shoulder.
- `90g-gl-world.js`: `KGROUND` 4-layer height-blended ground with relief, `WATER.open` salt lake and `WATER.still` wells/tank/brine pans, hillside plinths and preset views.
- `99-m-gl-probe.js`: camera range, click-to-inspect labels, and `window._gila` probe for `verify.py`.
