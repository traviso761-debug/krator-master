# kits/ancient-transit: the Ancients' transport infrastructure, in ruin

The owner's brief (2026-11-08, for the Ancient's Valley, `biomes/ancientsvalley`): "street furniture and related wreckage; a real elevated
highway with on/off ramps that can run through the map; grade level (cargo) and elevated (passenger) train lines that can do the same".
A sibling of `kits/metropolis` (the Ancients' towers) and `kits/motor-vehicles` (their vehicles). Everything here is a **record first**
(`KTRANSIT`, `[G data]`: plain numbers on `core/rand` and `core/space`, no three.js, no DOM) and drawn after, in ruin states as the
metropolis's towers come in theirs; a host gives waypoints and a ground sampler and gets kilometres of line back in one call, tests the
records against its own pads, and draws what survives. `PLAN.md` is the plan and the core adoption; `API.md` the calls and the record
shapes; `KNOWN_ISSUES.md` what is open.

```
python tools/build.py kits/ancient-transit                                  # dist/ancient-transit.html (+ dist/ancient-transit.tex.ancient-transit.js, the pack's sidecar)
node kits/ancient-transit/tests/test-transit.js                             # the data side: path, profile, highway, ramps, interchange, cull, rail, trains, dress; each check with a negative
node kits/ancient-transit/tests/test-furniture.js                           # the furniture bundle headless (three.js in a vm): every kind in every state, two variants, two seeds
KRATOR_GL=gpu python tools/harness.py lock --lane auto -- python kits/ancient-transit/verify.py kits/ancient-transit/dist/ancient-transit.html --assert --out kits/ancient-transit/spike
python tools/textures/pack.py kits/ancient-transit                          # after a change to materials.json (git lfs pull the sets first)
```

Open `dist/ancient-transit.html` from a local server and pick a view: fly (W A S D, Q E, Shift), F to walk. The hover inspector (I) and the
polygon tool are core/host's.

## What it is

| | Where | What |
|---|---|---|
| **Street furniture** | `krator-transit-furniture.js`, `transit-furnish.js`, `transit_bundle.py` | twenty-three kinds as catalog `ASSET`s of culture `ancient` on the catalog core (`kits/catalog/krator-furniture-core.js`): lamp standards (one arm, two), traffic signals, overhead sign gantries, street signs, benches, bollards, bins, hydrants, planters, kiosks, tram shelters, utility and transformer cabinets, crash barriers, guardrails, pedestrian bridges, the wreckage: pavement rubble heaps, glass heaps, cable tangles, and the military: sandbag walls and emplacements, sentry huts and watchtowers, checkpoint booms, tank traps, razor wire. Each in the states it can have of `intact`, `bent`, `fallen`, `burnt`, `crushed` (`KTRANSIT.KINDS`), built by the assembler into one merged mesh a material family with vertex colours and planar metre UVs: `KratorTransitFurniture.build(kind, {state, variant, seed})`. One closure for a host (`transit_bundle.furniture()`), as the vehicles' |
| **The records** | `src/40-44c` | `KTRANSIT`: the kinds and the shares; `path` (fillets, samples, `at(s)`, `project`), `profile` (a deck over the ground with its grade limited both ways, or a bed on fills); `highway` (spans, piers, ramps, the landing roads, an interchange with `o.over`, rubble; `cull` against a host's pads); `rail` (at grade: beds, sleepers, rail sections, level crossings where it meets the host's streets, signals, catenary; elevated: spans, piers, stations); `overgrow` (soil, plants and creepers on an elevated line's spans, patchy or a bed across: `o.overgrowth` 0..2 or a function of s); `subway` (a bored twin-track tunnel under the ground in sections with ruin states, cut-and-cover stations with platforms, furniture and stair entrances up to the street, vent heads, and the sinkholes, voids and pits the host carves into its ground: `sinkholeH`); `train` (standing, derailed, fallen); `dress` (a street's furniture on both kerbs, lamps' arms over the carriageway, gantries and footbridges across it pavement to pavement, `KSPACE` keeping the pieces apart and off the pads); `war` (the owner's "various levels of cratering and strewn wreckage" along a street by one number, from a riot to bombed to smithereens: scorch, heaps, strewn and barricaded furniture, craters the host carves with `craterH`; and abandoned military positions: checkpoints, emplacements, posts); `quake` (an earthquake's fault across the page: a scarp the host carves with `quakeH`, a strike-slip `shift` every path takes so roads and rails bend and break at it, buckled land beside it, spans and piers rolled by its twist) |
| **The drawing** | `src/46`, `src/55-57` (`56b` the subway) | the library materials (`materials.json`, `tex/`) and a geometry builder with UVs in world metres (one mesh a family: a highway is a dozen draw calls); the decks, piers, embankments, ramps, roads and lamp standards; the beds, sleepers (one instanced mesh), rails, crossings, signals, masts, guideways, stations and trains; the street surface and its furniture |
| **The demo page** | `src/45, 47, 70, 89, 99`, `build.py`, `verify.py` | on the biome core and core/host, as the metropolis test bed: a block with every kind in every state; an avenue and two side streets dressed; the highway with an off and an on ramp across the page, over the cargo line and a second highway (that one patchily overgrown); the cargo line with two level crossings, catenary and a derailed freight train; the passenger line with two stations and a train part fallen, bare for a third of its length, then half buried in soil and plants, then fully overgrown with creepers down its sides; the subway under the first side street with a ruined station and one fallen in (the ground open down to its hall), a train standing and one derailed; the avenue's war from a riot at its west end to smithereens at its east, the side streets shelled and rioted with military positions and a checkpoint at the avenue; a fault across the west of the page lifting its east side 3 m and carrying it 5 m north, through the avenue, the cargo line, the highway and the passenger line. The demo's ground refines its mesh round everything the kit carves (`47-host-land.js`) |

## The ruin

Every ruin is a hash of a stable id and an index (`KRAND`), never a draw count, so a span added at the end moves no other span and a page
built from one seed is the same page everywhere. The owner's rule (2026-11-08, twice): more ruined than feels right. The furniture is 12%
intact by default and every piece, intact too, is drawn toward rust and grime; a derailed train's cars are 60% burnt and most overturned;
a pole's `crushed` is a stump sheared at its foot. The shares are options with defaults (`KTRANSIT.RUIN`): a span `intact` 45%, `cracked`
30% (a lane's edge and its barrier gone on one side), `collapsed` 15% (the deck lying on the ground below, tilted, rubble round it),
`gone` 10% (piers only); a pier beside a fallen span stands `bare`, between two `bare` or a `stub` with its rebar; a rail section
`intact`, `bent` (one rail bowed out), `gone` (over a cut bed or a fallen span); a station `intact`, `ruined` (half its canopy, glass
gone), `collapsed` (the canopy down on the platform, a stair tower down); a car `ok`, `derailed`, `overturned`, `fallen`, and burnt. A host
puts the war where it wants it: `o.ruin` may be a function of the distance along the line.

## Numbers (the GPU verify, 2026-11-08, the RTX 5060 lane, 1280 x 800)

`verify.py --assert` passes: every kit check with its negative and every universal assert (shaders, textures, NaN, the registered volumes,
the eye of every view). The page builds in about 0.5 s in the browser (`tools/build.py`: 772 KB and a 4 MB pack sidecar).

| Group | Triangles | Meshes | Group | Triangles | Meshes |
|---|---|---|---|---|---|
| the avenue, 3 km, with 345 pieces | 81 k | 5 | the highway h1: 147 spans over 3.4 km, two ramps, 3 piers culled | 29 k | 9 |
| the side streets, 1.8 km, 206 and 201 pieces | 54 k, 49 k | 5 | the highway h2 (over h1, patchily overgrown) | 28 k | 10 |
| the block: 62 pieces, every kind in every state | 18 k | 9 | the cargo line (rails every 6 m), two crossings | 88 k | 9 |
| the freight wreck, 8 cars | 3.6 k | 5 | the passenger line, two stations, the overgrowth | 102 k | 12 |

| View | Calls | Triangles | View | Calls | Triangles |
|---|---|---|---|---|---|
| The block | 90 | 514 k | The freight wreck | 84 | 499 k |
| The block, close | 89 | 513 k | The station | 52 | 393 k |
| The avenue | 87 | 500 k | The fallen train | 86 | 489 k |
| The highway | 81 | 496 k | The line, half buried | 86 | 489 k |
| The off ramp | 60 | 421 k | The line, overgrown | 74 | 493 k |
| The interchange | 61 | 442 k | From the air | 102 | 520 k |
| The level crossing | 83 | 499 k | | | |

## Taking the kit into a world

As the valley takes the metropolis (`biomes/ancientsvalley/build.py` `MP_FRAGS`): the `src/` fragments by path (`transit_bundle.fragments()`:
40-44 after core/rand and core/space, 46 and 55-57 after core/materials/record and the furniture bundle), the furniture bundle as a generated
fragment (`transit_bundle.furniture()`, needs `KTRANSIT` loaded before it), the pack through `tools/textures/matlib_pack.py` under the name
`ancient-transit`. Then, in the host's stage:

```js
const H = KTRANSIT.highway(waypoints, { id: 'h1', ground: terrainH, ramps: [{ s: 1200, side: -1, dir: 'off' }], ruin: s => ... });
KTRANSIT.cull(H, (x, z, r) => mySpace.some(x, z, r, pad => Math.hypot(x - pad.x, z - pad.z) < r + pad.r));   // my towers' plinths
scene.add(KTRANSIT.draw.highway(H, { furn: KratorTransitFurniture, shadow: myShadow }));
const R = KTRANSIT.rail(waypoints2, { id: 'cargo', ground: terrainH, streets: myStreets });  scene.add(KTRANSIT.draw.rail(R));
scene.add(KTRANSIT.draw.train(KTRANSIT.train(R, { s: 1400, state: 'derailed' })));
const D = KTRANSIT.dress({ id: 'avenue-3', pts, width: 26, ground: terrainH }, { space: mySpace });   scene.add(KTRANSIT.draw.dress(D, { furn: KratorTransitFurniture }));
```

Register the records in the host's own registry (the demo registers one volume a structure); the pieces' tags are in `KTRANSIT.KINDS`.
`API.md` has every option and record field.
