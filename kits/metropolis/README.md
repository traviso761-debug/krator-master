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

| Fragment | Tag | What |
|---|---|---|
| `40-mp-records.js` | [G data] | the records: storeys and uses, massing, crown, core, ruin states |
| `41-mp-plans.js` | [G data] | `MP.storey(F, k)`: a storey on `AI`'s plates; flats; a pure function, so nothing exists until asked for |
| `42-mp-facade.js` | [G data] | the facade from the rooms: one source for the room's windows and the drawn glass |
| `43-mp-shell.js` | [G data] | `KSHELL.record`, cages, atlas packing; the prototype of `core/shell` |
| `44-mp-audit.js` | [G data] | `MP.audit`: shafts line up, every room reached, flats whole, glass only where rooms want it |
| `50-53` | [draw] | the hero kit, the Spindle, the Ledger |
| `56-mp-interiors.js` | [draw] | a storey drawn on demand, furnished; at most three open |
| `60-mp-shell-host.js` | [web] | `KSHELL`'s bake and draw |
| `70-mp-stage.js` | [web] | what stands where in each view; impostors, one a frame |

## What the spike found

Measured 2026-11-02 on the **Intel Arc 140T**, 1280 x 800, `tools/perf_views.py` (`spike/perf.json`), minimum GPU time of the world pass. Pictures in `spike/`.

| View | Calls | Triangles | GPU ms |
|---|---|---|---|
| The Spindle's hero alone, 300 m | 7 | 74 k | 0.4 |
| Its shell alone, 300 m | 2 | 56 | 0.4 |
| Hero, 130 m | 7 | 74 k | 0.4 |
| Shell, 130 m (closer than it is meant for: the worst fragment cost) | 2 | 56 | 0.7 |
| Hero and shell side by side | 8 | 74 k | 0.7 |
| Tiers, the street: 3 heroes in range, 48 shells, about 400 impostors | 69 | 110 k | 0.9 |
| Tiers, from a roof | 65 | 80 k | 1.8 |
| Tiers, from the air | 65 | 70 k | 1.1 |
| Inside a flat (one storey open, its furniture) | 17 | 150 k | 1.0 |

Budgets: hero 74k of 80k (Spindle), 36k of 45k (Ledger), 6 and 8 draw calls. Cages 56 and 10 triangles. All four shells bake in 0.15-0.4 s, all four impostors in 0.25-0.6 s.

**What works**

- **The polar heightfield.** A round tower on an octagonal cage of 56 triangles keeps its round silhouette, because the outline comes from the map. A box would have failed this tower outright: that is the main finding.
- **Triangles.** The shell costs about 1/1300 of the hero's triangles, and the same GPU time at 300 m. The hero's gain is vertices, as the plan expected: **a shell costs fragments, not vertices.** At 130 m it costs about twice the hero, so it must not be held closer than the 300 m switch.
- **Windows from rooms.** The facade pattern survives the bake: zones, hoops, blank vaults and ruin breaches all read the same at 300 m.
- **The same lighting.** A patched standard material means no drift between shell and hero as the sun moves.
- **The dither switch** reads as fine grain at the band; the eye check is the owner's.
- **Bake count follows families:** a page's load adds under a second for four bakes.

**What does not**

- **Thin parts:** a fin or skirt edge frays to a sawtooth in the shell at 300 m (the bottom right of `Pair-Spindle-street.png`). Worst at the flared skirt, where the ray grazes the surface.
- **Roofs and soffits** are not in the map: the lamp's top and underside take the rim's colour. A roof view shows it. A second map from above would fix the top; a soffit needs real geometry.
- **Close up** the map is soft under 200 m, with horizontal streaks (`Shell-close-130-m.png`). Hold the switch at 300 m.
- **Shells and impostors switch hard** at 1 km in the tiers view: a chunk's fade left half-dithered ghost towers, so impostors now switch tower by tower. There is no fade there yet.
- **Ten heroes were not tested.** At this 220 m block pitch only about three towers stand within 300 m, one or two in frame. Section 13's ten needs a pitch near 130 m: street width is the budget lever, as it says.

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
