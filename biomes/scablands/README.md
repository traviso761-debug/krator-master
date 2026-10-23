# The scablands (an overlay)

The ground the dam break's flood tore down and is gone from: an **overlay**, which owns no ground and lies over the
biome that is there (n semiarid; the flood lake's dry bed lies over NW lowlands too). `PLAN.md` is the plan;
`biomes/nsemiarid/PLAN.md` sections 3, 4 and 6 are why it looks as it does.

## The build

```
cd biomes/scablands
python3 build.py                                   # dist/coulee.html (station 1)
python3 verify.py dist/coulee.html --assert --views "The dry falls from the rim,The plunge-pool lake" --out shots/x
```

The engine is the **n semiarid kit**, read in place: `build.py` imports `biomes/nsemiarid/build.py` and calls its
`build(overlay=...)`, so the page is the kit's page with this folder's `src/` over it (a fragment of the same name
replaces the kit's) and core/terrain's `KSCOUR`. The library pack is the kit's, and beside it this overlay's own
(`materials.json`; `python3 tools/textures/pack.py biomes/scablands` writes `tex/`). `verify.py` runs the kit's harness on
this page.

| fragment | what |
|---|---|
| `src/45b-host-stage.js` | **the station** in place of the kit's showcase: the coulee and its dry falls on `KSCOUR` (the course, the strata, the ground holding the coulee with its walls stepped by the basalt flows, `KSCOUR.land` over it), the plunge-pool lake and the potholes holding rain (`core/water` still records), the fields the kit reads, the overlay's tint over the kit's palette (the flows' basalt and red interbeds, sandstone at the foot, the bars' gravel, an alkali rim) |
| `src/72-biome-scablands-pools.js` | the overlay's own flora, its own kit registry (`BIO.kit('scablands')`): kolk lilies, pothole quills, seep sedge, spray ferns, tagged as the kit's plants are, textured from this overlay's pack (whole card sheets cut by cell); `SCABLANDS.place(records)` places them from what the stage hands it |
| `src/87a-host-pools.js` | hands the overlay's flora the stage's pothole pools, the plunge lake and the falls' foot before the kit's build bakes; `STAGE_PLANTS` lets the inspector name them |
| `src/87-host-erratics.js` | the erratics drawn (records in the stage: `ERRATICS`, obstacles before the kit plants): the dam's broken concrete, blocks and slabs of its face with rebar torn out of their broken sides, and basalt boulders, each kind one merged mesh, textured from this overlay's own pack (`materials.json`, `tex/`: `concrete.rust.streaked`, `rock.basalt.vesicular`) |
| `src/99-host-take.js` | the station's views, the kit's checks that apply here and the overlay's own (the falls, the water held, the walls stepped, the scour bare of trees, the erratics sunk in the floor, the pools' flora
in its places), each with a negative |

**When the kit changes**, rebuild this page too: it takes every kit fragment it does not shadow. The fragments it
shadows (`45b`, `99`) are the stage's, not copies of the kit's: the stage's interface is `TERR`, `terrainH`, `waterH`,
`FNAMES`/`FC`/`FIELD`, `OBSTACLES`, `WIND`, `STAGE_WATER` and `STAGE_GROUND` (`biomes/nsemiarid/BIOME-API.md`).
