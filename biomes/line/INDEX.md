# biomes/line: index

The Rift line's biome (`PLAN.md`): stations, each a window of the one Line record. Built by `build.py` (`--station <name>`) into
`dist/line-<station>.html`; verified by `verify.py --assert`.

| Path | What |
|---|---|
| `PLAN.md` | the plan, the owner's answers (2026-11-11), the survey, the section, the record, the stations, the train, riding, core adoption |
| `tools/survey_line.py` | the line on scale model 5.1: profile, cover, rock, heat, ore, shafts (reads the model's data and the geology bake) |
| `tools/survey_extension.py` | the line beyond Ledge to Stair: straight legs, tunnel and viaduct shares |
| `concept/` | the owner's concept page (`line-concept.src.html`, the survey's profile injected into `line-concept.html`) |
| `build.py`, `verify.py`, `materials.json`, `tex/` | the build (from biomes/hearths' pattern), the verify harness, the library adapter and its pack |
| `stations/bore/` | station 1: a kept kilometre of the long run (bore km 208-209.2) |

## stations/bore

| Fragment | Tag | What |
|---|---|---|
| `00-head.html` | [web] | the page shell |
| `44z-host-site.js` | [G data] | the site: chainage origin, the invert's height, the cover, the rock and its heat |
| `44zs-host-station.js` | [G data] | the station: which window |
| `48-line-gallery.js` | [G data] | the window's records: the section, the tracks' routes and states, the crossover, the niches, the lamp code, the crown fittings, the vein and its work train, the trains on KSCHED timelines, the riding hook's car pose, the carved void, the walk floors |
| `49-host-stage.js` | [web] | renderer, the lamp code's light pool, the visitor's lamp, the section's floor for the eye, BIO.init |
| `60-host-vehicles.js` | (virtual) | the vehicles bundle: `kits/motor-vehicles` ['ancient', 'line', 'tungang'] |
| `84-host-rock.js` | [draw] | the cavern built; its rock drawn east of the east wall (the niches, the vein's gallery) on KGROUND |
| `85-host-lining.js` | [draw] | the builder (LB) and the lining: rings, joints, bronze bands, the niches' openings and plates |
| `86-host-way.js` | [draw] | the guideways, the invert, the strip, the road and barrier, the walkway, the crossover, the lamps, the crown fittings, the vein's working |
| `87-host-train.js` | [web] | the kept trains moved by the car pose; the work train; the derelict van |
| `89x-host-air.js` | [web] | core/atmos bound; dust in the lamps |
| `89z-host-build.js` | [web] | the records registered (core/tags), the bake |
| `98v-host-views.js` | [web] | the views |
| `99-host-take.js` | [web] | the inspector and the checks (each with its negative), KHOST.take |
