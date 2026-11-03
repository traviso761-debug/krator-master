# kits/metropolis

The test bed of the metropolis system (`biomes/ancientsvalley/PLAN-ANOMALIES.md` section 13). `PLAN.md` holds the sixteen designs. Two are built: **S1 the Spindle** (a curved tower)
and **M1 the Ledger** (a slab), each with a hero, a baked shell, an impostor, interiors and the `intact` and `gutted` states. **It stops here for the owner's eye** (`PLAN.md` section 10).

```
python3 tools/build.py kits/metropolis
node kits/metropolis/tests/test-metropolis.js                 # records, plans, facades, cages; each check with a negative
KRATOR_GL=gpu python3 kits/metropolis/verify.py kits/metropolis/dist/metropolis.html --assert --out kits/metropolis/spike
KRATOR_GL=gpu python3 tools/perf_views.py kits/metropolis/dist/metropolis.html --size 1280x800
```

Use `KRATOR_GL=gpu`: software GL loses the page's context (`KNOWN_ISSUES.md`). Pick a view from the select: the pairs stand the real building (west) beside its shell (east).

**To look around,** open `dist/metropolis.html?pitch=140` from a local server. The Tiers views are a city of the two families: fly (W A S D, Q E, Shift), F to walk. Walk in through a portal (a tower's skin stops a walker at the street) and its storey opens; the lift list, or `,` and `.`, rides the lift from storey to storey. Walls stop a walker, and the stairs in the core walk up a storey at a time.

| Fragment | Tag | What |
|---|---|---|
| `40-mp-records.js` | [G data] | the records: storeys and uses, massing, crown, core, ruin states |
| `41-mp-plans.js` | [G data] | `MP.storey(F, k)`: a storey on `AI`'s plates; flats; a pure function, so nothing exists until asked for |
| `42-mp-facade.js` | [G data] | the facade from the rooms: one source for the room's windows and the drawn glass |
| `43-mp-shell.js` | [G data] | `KSHELL.record`, cages, atlas packing; the prototype of `core/shell` |
| `44-mp-audit.js` | [G data] | `MP.audit`: shafts line up, every room reached, flats whole, glass only where rooms want it |
| `50-53` | [draw] | the hero kit, the Spindle, the Ledger |
| `56-mp-interiors.js` | [draw] | a storey drawn on demand, furnished; at most three open (a ruin's only under its standing skin) |
| `57-mp-debris.js` | [draw] | `MP.debris(F, state)`: a ruin's rubble (`KSTACKS` mounds, crushed shaft sections, the lamp's disc, slabs) and what stands free (a stump's fins, a skeleton's frame) |
| `60-mp-shell-host.js` | [web] | `KSHELL`'s bake and draw |
| `70-mp-stage.js` | [web] | what stands where in each view; impostors, one a frame |

## What the spike found

Measured 2026-11-02 on the **Intel Arc 140T**, 1280 x 800, `tools/perf_views.py` (`spike/perf.json`), minimum GPU time of the world pass. Pictures in `spike/`.

| View | Calls | Triangles | GPU ms |
|---|---|---|---|
| The Spindle's hero alone, 300 m | 7 | 74 k | 0.4 |
| Its shell alone, 300 m | 2 | 56 | 0.5 |
| Shell, 130 m (closer than it is meant for: the worst fragment cost) | 2 | 56 | 0.9 |
| Inside a flat (one storey open, its furniture) | 17 | 150 k | 1.1 |
| Blocks 220 m apart, street (3 heroes in range) | 66 | 50 k in frame | 1.3 |
| Blocks 220 m apart, from a roof | 66 | 50 k in frame | 1.8 |
| **Blocks 140 m apart (`?pitch=140`), street: 10 heroes, 109 shells** | 89 | 390 k | **2.9** |
| Blocks 140 m apart, from a roof | 87 | 380 k | 3.7 |
| Blocks 140 m apart, from the air | 63 | 10 k | 2.0 |

Budgets: hero 74k of 80k (Spindle), 36k of 45k (Ledger), 6 and 8 draw calls. Cages 56 and 10 triangles. All four shells and their hull maps bake in 0.15-0.4 s, all four impostors in 0.25-0.6 s.

**What works**

- **The polar heightfield.** A round tower on an octagonal cage of 56 triangles keeps its round silhouette, because the outline comes from the map. A box would have failed this tower outright: that is the main finding.
- **Triangles.** The shell costs about 1/1300 of the hero's triangles, and the same GPU time at 300 m. The hero's gain is vertices, as the plan expected: **a shell costs fragments, not vertices.** At 130 m it costs about twice the hero, so it must not be held closer than the 300 m switch.
- **Windows from rooms.** The facade pattern survives the bake: zones, hoops, blank vaults and ruin breaches all read the same at 300 m.
- **The same lighting.** A patched standard material means no drift between shell and hero as the sun moves.
- **The dither switch** reads as fine grain at the band; the eye check is the owner's.
- **Bake count follows families:** a page's load adds under a second for four bakes.

**What does not**

- **Thin parts** were the sawtooth at the skirt; the hull map from above (a column with nothing in it is air) tidied them, and they still show under 300 m.
- **Roofs** now work: a hull map from above makes them real surfaces. **Soffits** take their colour from a map from below; their shape is the side map's. They still break up under 200 m, inside the hero's range.
- **The map from below sees the wrong thing unless it is cut:** under a lamp, the lowest surface of a column is the shaft's windows far down, which showed as a mosaic on the soffit. The bake now discards everything below the neck (`soffit`, one height a tower: the Stalk's two saucers will need two).
- **The map from below cannot be a bound:** a tower is hollow, so the lowest surface of a column inside it is high up, and using it as a limit erased the walls.
- **Close up** the map is soft under 200 m, with horizontal streaks (`Shell-close-130-m.png`). Hold the switch at 300 m.
- **Shell to impostor** now fades: the impostor stands from 850 m and the shell dithers out in front of it to 1 km. Hero to shell dithers too.
- **Seen steeply from above, a tower is a shell to 3.2 km** (over 35 degrees down): an impostor is a card, and a tall thin tower's card seen from over it is a long leaning smear that overlapped its neighbours and doubled their lamps. An impostor now stands for exactly the towers that are neither hero nor shell.
- **A shell's hit is bisected back to the surface** (five halvings between the last point outside and the first inside), and a ray going down steps no further than the roof map's height above it. Stepping by the side map's gap, a horizontal distance, let a steep ray fall through a flared skirt and read its side lower down (spines round every base), and a roof's colour flipped between the roof map and the side map's top row as the camera moved. On a box, a roof is also where the roof map is flat for 1.5 m all round: past the Ledger's roof hall the long face's map extrudes the hall over the low roof, so the old test (air above, in the side map) read the side map there as dark bars.
- **A hull map is only right on real roofs.** It holds every sill and ledge as a true up-facing surface, and at first that showed as bright slits on every shell seen from above. Top and bottom maps now apply only where the side map shows an overhang of over 3.5 m.
- **Heroes are the cost of a dense city:** ten of them take the street from 1.3 to 2.9 ms, and 390 k triangles. That is affordable on the Arc for these two; a heavier family counts. Street width is the budget lever, as section 13 says.

**The ruins** (2026-11-03): all seven states of the brief are built for both towers: intact, gutted, crown gone, broken, stump, skeleton, fallen (`MP.RUINS`,
the records' `ruins`). `MP.ruin(F, state)` turns a state into numbers (the cut, the tear's depth, the standing skin, a skeleton's bare frame, what stands above the cut);
`MP.tearAt` steps the torn edge by storeys and by 15-degree sectors (a Spindle) or 3 m bays (the Ledger, whose broken span drops to the arcade); `MP.debrisPlan` lays the
rubble as records, a Spindle's along a fin, the Ledger's onto itself and into the street.

- **A shell holds what stands about the axis, and no more.** A stump's fins standing free and a skeleton's columns and slab edges fan into broad sheets in a polar map (a
  blade off the axis interpolates to the core beside it). They are drawn with the rubble instead, real geometry at every distance; the hero and shell keep the skin and core.
- **The rubble is its own instanced object,** one mesh a material and state, at every ruin within 1 km: it lies off the tower's axis, so it is in neither the shell nor the
  impostor. At `?pitch=140` the worst street draws 0.94 M triangles in 123 calls with 13 heroes and about 70 ruins' rubble in range (a 1.6 km range took it to 2.2 M); a fallen Spindle's rubble is 22 k.
- **Each state's shell is as tall as what stands,** and the five past gutted take a 0.5 m map and none from below (no lamp): the fourteen records pack one 2048 atlas.
- **Black shells were a hidden pane:** a page that boots with `innerHeight` 0 set the trace's pixel size to Infinity. It is set every frame now.

**Which shapes shell well** (from these two and the geometry; only the first two are measured):

| Shape | Expected | Why |
|---|---|---|
| Tapered round towers, cones, drums, domes | good, **measured** | star-shaped about the axis |
| Long slabs | good, **measured** | box mode, 10 triangles; the flares stand within its inset |
| Wedges, twisted slabs, lobes, octagons | should be good | still star-shaped; the twist's facets need testing |
| Disc and saucer towers | fair | the soffit shows from the street |
| Arches, courts, the Yoke, the Terrace, the Arcades | poor in one map | a surface behind a surface: two parts or real geometry |
| The Long Curve | poor in polar | not star-shaped from inside: box segments, or the arc's centre as the axis |

**Converting an older Ancient building** would take four things: a record with an envelope and a cage; a mesh with no ground plane or interior in the bake (the bake takes the outermost surface, so anything outside the tower spoils it); a choice of `polar` or `box`; and a mask for its glass, since the kit's materials do not say which are windows. A tower built from `kdef` kit pieces needs them gathered into a Group for the bake. A building with no room plan keeps a shell with fake rooms: enough at range, and the interiors are a separate job. Bake cost should be small; atlas space is 3 x 2048 px per four bakes here, about 67 MB of GPU memory with mips, with room to spare in it, made at load, so it does not count against the page cap.

**Page size:** 2.9 MB, plus a 2.6 MB texture pack beside it. The furniture's detail maps (`furniture_bundle.bundle(tex=True)`) are 1.4 MB of the page.
