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

The panel's "Here" reads the zone, the walk and core/hazard at the camera's target.

**verify.py** runs the pieces' node tests, then, a scene at a time, shoots every view and checks what the scene is for: the
records in core/tags before anything is drawn, the hazards where they are and nowhere else, the core's particles holding still
on the CPU twin, and on the GPU two shots a second apart of the stopped fall against the running one (stilled); the walk in and
out of the Press, the pancaked tower (press). Shots go to `--out` (default `shots/`, ignored).
