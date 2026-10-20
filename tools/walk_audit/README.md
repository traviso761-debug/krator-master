# tools/walk_audit: can a walker reach every floor the geometry draws?

For kits whose buildings are drawn straight from boxes and declare no floors or stairs (the Scyvoi engine: Islanders,
Lizardmen, the nomad kits). Kits whose buildings come from an interiors set are covered by `IX.walk.register`
(`kits/interiors/src/49b-walk.js`, tested by `kits/interiors/tests/test-walk.js`); this is the other route.

```
python3 tools/walk_audit/run.py kits/islanders/dist/islanders.html [--only key,key] [--all] [--json out.json] [--dump folder]
python3 tools/walk_audit/registry_reach.py kits/islanders/dist/islanders.html [--only key,key] [--cell 0.1]   # the same question asked of core/walk
python3 tools/walk_audit/door_walk.py kits/islanders/dist/islanders.html [--only key,key] [--trace]   # the host's own walker, 11 m out, in through each door
python3 tools/walk_audit/registry_count.py <page.html> --query interiors=1        # what a host's KWALK holds
node tools/walk_audit/test_audit.js        # in tools/test_all.py
```

`run.py` places each building def alone on flat ground with the engine's `emit` swapped for a recorder, keeps every oriented
box (and every `isLadder` / `isLogLadder` call), and `audit.js` rasterises them at 0.1 m: a surface is standable where a box
top has 1.7 m of clear headroom for a body of radius 0.28 m; the walker steps up 0.6 m and drops 1.2 m; roof meshes, tilted
boxes and paper-thin bands cover but never block. It floods from the open ground and reports the patches it cannot reach:

* **FAIL**: a floor under a roof that nobody can walk to (a room without a usable door, a deck with no stair, a stair that stops short).
* **LADDER**: reached only by a ladder. `core/walk` needs a `strip` for it; the geometry cannot supply one.
* **open**: a roof, parapet or open deck nobody reaches. Listed for the kit's author, not failed.

What it cannot see: a ladder's alignment with its door (a ladder within 0.8 m of the floor's edge counts), furniture, doors that
are drawn shut, a stair whose rail leaves less than 0.6 m clear (it fails: the walker cannot use it either).

Islanders and Lizardmen now also register what they draw (`core/walk/box`, `src/37-wk-rec.js`), so `run.py` (the geometry) and `registry_reach.py` (the registry
the host walks on) are two readings of one scene. `registry_reach.py` counts every raised flat top, roofs and shelf tops included; `run.py` separates a floor under a roof from an
open top. Trust `run.py` for the worklist and `registry_reach.py --only` to confirm a fix.

## Findings (2026-10-19, flat ground, default tolerances; after the first fixes)

| Kit | Buildings | With a floor nobody reaches | Ladder-only |
|---|---|---|---|
| Islanders | 121 | 22 | 20 |
| Lizardmen | 37 | 3 (`lz-tower`, `lz-seer`, `lz-reliquary`) | 0 |
| Scyvoi | 18 | 1 (`baelu`) | 0 |
| Ash Nomads, Desert Nomads | 16 + 16 | 0 | 0 |

Islanders' failures are mostly rear or upper rooms and raised halls (`iw-house-gadang`, `iw-hall`, `ie-house-great`,
`ie-hall`, `ip-hall`, `ip-palace`) and the towers and beacons (`ie-beacon`, `ip-tower`, `iw-windmill`), where no flight or ladder
reaches the upper floor. Talia has no interior set yet (its P6), so it has nothing to walk inside; when its set lands it goes
through `95i-iziz-interiors.js` and `IX.walk.register` like the Iziz vernacular's.
