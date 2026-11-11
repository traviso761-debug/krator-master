# biomes/line: index

The Rift line's biome (`PLAN.md`): stations, each a window of the one Line record. Built by `build.py` (`--station <name>`) into
`dist/line-<station>.html`; verified by `verify.py --assert`.

| Path | What |
|---|---|
| `PLAN.md` | the plan, the owner's answers (2026-11-11), the survey, the section, the record, the stations, the train, riding, core adoption |
| `tools/survey_line.py` | the line on scale model 5.1: profile, cover, rock, heat, ore, shafts (reads the model's data and the geology bake) |
| `tests/test-line-record.js` | node: the one record and each station's window of it (track states, splays, crossovers, the gap), each check with a negative |
| `tools/survey_extension.py` | the line beyond Ledge to Stair: straight legs, tunnel and viaduct shares |
| `concept/` | the owner's concept page (`line-concept.src.html`, the survey's profile injected into `line-concept.html`) |
| `build.py`, `verify.py`, `materials.json`, `tex/` | the build (from biomes/hearths' pattern), the verify harness, the library adapter and its pack |
| `stations/common/` | the shared base every station takes (its `station.json` names `"base": "common"`) |
| `stations/bore/` | station 1: a kept kilometre of the long run (bore km 208-209.2) |
| `stations/gap/` | station 2: G2, the long run's last platform, the fall into the chamber, the walk to S1 (bore km 235.55-236.95) |
| `stations/station/` | station 3: the Twenny junction, in three states (`?state=built\|kept\|abandoned`; bore km 217.55-218.75) |
| `stations/hotdoor/` | station 4: the hot section's north door: the airlock, the plant, the deep stretch, the cleft shrine (bore km 54.35-55.55) |
| `stations/fault/` | station 6: the junction hall and the twin bores, the east sheared by a slump fault and flooded (bore km 43.85-45.05) |
| `stations/portal/` | station 7: the shallow south, the fallen stretch open to the sky, the portal onto the tableland (bore km 303.35-304.55) |
| `stations/breach/` | station 5: the bore beside a hypogene chamber: the bulkhead, the window, the stair, the maze beyond (bore km 224.55-225.75) |

## stations/common

| Fragment | Tag | What |
|---|---|---|
| `47-line-core.js` | [G data] | `LK`: the section, the profile, routes by arc length, the consist, the riding hook's car pose, the cond runs derived to gaps and segments |
| `47c-line-record.js` | [G data] | `RIFT`: the one Rift line as `KTRANSIT.line` (its forms, track states, splays, crossovers, stations, doors) and `RIFT.window(S0, WIN)`, each station's window of it |
| `47b-line-help.js` | [G data] | `LW`: the plain gallery's walk floors, the invert's gaps, strips along a polyline, the section's floor, the gallery's works, the vein's stain |
| `49-host-stage.js` | [web] | renderer, the lamp code's light pool, the window's lights, the visitor's lamp, the floor for the eye, BIO.init |
| `84-host-rock.js` | [draw] | the cavern built; its rock drawn where the window says it shows (`LINE.rockShows`), stained by the vein and the gypsum, on KGROUND |
| `85-host-lining.js` | [draw] | the builder (LB) and the lining: rings by section, joints, bronze bands, end walls, the openings' jambs and plates, the ragged cut |
| `86-host-way.js` | [draw] | the guideways along each track's runs (splayed by `LINE.trackX`), the plain gallery's works, the crossovers, the lamps, the crown fittings, the vein's working |
| `87-host-train.js` | [web] | the trains moved by the car pose (running on timelines, standing), the standing vehicles |
| `89x-host-air.js` | [web] | core/atmos bound; dust in the lamps |
| `89z-host-build.js` | [web] | the records and hazards registered (core/tags), the bake |
| `99-host-take.js` | [web] | the inspector and the shared checks (each with its negative), the window's own, KHOST.take |
| `99-tail.html` | [web] | the page's end |

## A station's own fragments

| Fragment | Tag | What |
|---|---|---|
| `00-head.html` | [web] | the page shell |
| `44z-host-site.js` | [G data] | the site: chainage origin, the invert's height, the cover, the rock and its heat |
| `44zs-host-station.js` | [G data] | the station: which window (and, for `station`, which state) |
| `48-line-window.js` | [G data] | the window (`LINE`): the tracks' routes and states, the openings, the lamps, the trains, the void, the walk, the checks |
| `48-line-window.js` (bore) | | plus the vein and its work train, the crossover |
| `88-host-gap.js` (gap) | [draw] | the falls' rubble, the Fixers' ramp and stair, the platforms, the shed, the porters' hold |
| `89y-host-water.js` (gap) | [web] | the sump's water (core/water; needs core/atmos bound) |
| `88-host-hotdoor.js` (hotdoor) | [draw] | the door walls and their leaves, the pipes, the plant's hall (generators, cooling banks, cells), the crossing, the cleft shrine's rail, candles and quartz, the spalls |
| `88-host-breach.js` (breach) | [draw] | the bulkhead, the landing, the window's glass, the stair's treads and rails, the plank path, the gypsum blocks |
| `88-host-fault.js` (fault) | [draw] | the junction's and the bores' floors, the jogs, the east walkway, the west road, the fault's rubble and the scramble |
| `89y-host-water.js` (gap, fault) | [web] | still water (core/water): the gap's sump, the fault's low point |
| `88-host-portal.js` (portal) | [draw] | the land (KFIELD baked, meshed: turf and the cuttings' faces), the portal's headwall, the fallen stretch's rubble, the shaft head |
| `89s-host-sky.js` (portal) | [web] | the shared sky (ATMOS.skyBiome) and the eye's exposure ramp |
| `99-host-view-sky.js` (portal) | [web] | the sky's per-frame update on the host's view, after KHOST.take |
| `88-host-station.js` (station) | [draw] | the invert, the platforms, the road's and walkway's jogs, the stairs, footbridges and mezzanine, the doors, the branch, the shaft's cage, what each state leaves |
| `98v-host-views.js` | [web] | the views |

`60-host-vehicles.js` is virtual: the vehicles bundle, `kits/motor-vehicles` ['ancient', 'line', 'tungang'].
