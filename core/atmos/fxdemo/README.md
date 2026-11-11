# Effects demo

The shared effects the Ancient's Valley's next stations need, on one page, before any station takes them
(`biomes/ancientsvalley/PLAN-ANOMALIES.md` 14 and `PLAN.md` 15; the owner, 2026-11-10). The props are demo stand-ins.

```
cd core/atmos/fxdemo && python3 build.py                       # dist/fx-demo.html, three.js r128 inlined
python3 verify.py dist/fx-demo.html --assert                    # every scene; --scenes stilled,press to pick
```

Scenes (`#scene=` or `?scene=`, and `view=` for the preset view):

| Scene | What it shows |
|---|---|
| `stilled` | a time zone of `core/anomaly` (1e-4 at the core): rain, dust, steam, a waterfall, a machine mid-explosion and birds held where time stops; the same running outside it; a flock circling the zone that never crosses it |
| `press` | a gravity zone (3 g): trees stunted and spread, boulders sunk, a tower pancaked to a third of its storeys, a short hard fall, the flat pall; walk in (F) and the walk slows and the eye drops |
| `yards` | stacks trailing soot, cooling towers (one on a duty cycle), a flare and a vent, toxic pools with their fume, oil spills on the ground, a slag heap glowing at its pour (the night views), sparks from dead machines, an arc off a gantry |
| `terraces` | 24,000 crop stems bending and paling as gust fronts cross them, chaff lifted on the fronts, an aqueduct pouring from its open span and from a breach with drips from its cracks and wet stains below, a pylon line arcing where a pylon leans |

The panel's "Here" reads the zone, the walk and core/hazard at the camera's target.

**verify.py** runs the pieces' node tests, then, a scene at a time, shoots every view and checks what the scene is for: the
records in core/tags before anything is drawn, the hazards where they are and nowhere else, the core's particles holding still
on the CPU twin, and on the GPU two shots a second apart of the stopped fall against the running one (stilled); the walk in and
out of the Press, the pancaked tower (press); every effect recorded, the pools' acid and the arcs' shock on core/hazard, the slag glowing at night against its heat turned off, the plumes moving (yards); the crop rows moving with the gust against the gust turned off, the spills landing with their stains (terraces). Shots go to `--out` (default `shots/`, ignored).
