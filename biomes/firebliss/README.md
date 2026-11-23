# biomes/firebliss: the Firebliss Range

A volcanic arc on the Labyrinth's northern rim (scale model 5.1, far south-west): five volcanoes on a glaciovolcanic spine, four warm
valleys under it, each with its tarn. Nobody lives here; Fellgang and Kimr hunters come and go by season. Its dangers are the land's:
gas, heat, ash, ice and thin air. Read `PLAN.md` first (the region, the life, the hazards, the oases as outposts, the stations and the
core adoption).

## Build and verify

```
cd biomes/firebliss
python3 build.py                       # dist/firebliss.html: station 1, the Great Firebliss Vale
python3 build.py --station glen        # dist/firebliss-glen.html: station 2, Solfatara Glen
python3 build.py --station east        # dist/firebliss-east.html: station 3, East Bliss Vale and the Weyt Warra's gorge
python3 build.py --station mons        # dist/firebliss-mons.html: station 4, Firebliss Mons' crater
python3 build.py --station glass       # dist/firebliss-glass.html: station 8 (Gemini's showcase), South Glass, an obsidian pancake dome
KRATOR_GL=gpu python3 verify.py dist/firebliss.html --assert --all-views
```

The pages share their texture sidecars (`dist/firebliss.tex.*.js`: this kit's pack and the borrowed kits' maps). After a change to
`materials.json`, run `python3 tools/textures/pack.py biomes/firebliss` first.

**Two things the build reads that are not on `main` yet** (`KNOWN_ISSUES.md`): `core/hazard/22-core-hazard-env.js` (crusts, night air,
fronts) and `core/atmos/fx/89-atmos-fx-ashplume.js` (the plume), from `origin/claude/core-plan-features-229d2a` by `git show` until that
branch is merged. A checkout without the branch stops the build with a message naming it.

## How a page is made

- **The ground is the model's.** `model_site.py` reads the 5.1 height grid (22 x 22 cells of 2 km) and the water levels round the
  station's centre, with its climate off the land cells, into the page (`FB_MODEL`); `45-host-stage.js` reads it with a cubic B-spline and
  adds only what 2 km cells cannot hold: hummocks and coves, hollows, a camp's pad, a station's bench, a river's channel or gorge.
- **The thermal ground is the geyser kit's** (`biomes/geyser`, read in place as `biomes/ringisles` reads it): each station authors a
  layout (`SITE.thermal`: springs, geysers, acid fields, fumaroles, sinter flats and steps, dead fringes) and `GEYSER.lay` makes its
  relief, heat, run-off, flora and show. Mons takes its sinter and show only (`SITE.thermalOnly`).
- **The heat between the vents is `KTHERM`** (`core/terrain/47`): the ground, the snow's bare patches, the hazards and the flora read it.
- **The cold flora is Copper Glacier's** (`COPPERG.build`, read in place) under a mask off the warm floor; **the pines and tree ferns are
  the Throne's** as this kit's kin (`BIO.kin`); this kit's own species are the meadow, the reeds, the ash plants, the stones, the dead
  birds and the hunters' pieces (`50`).
- **The hunters' camps are core/camp's** (`KCAMP.pitch` on the kit's culture rows, `65`); their trails' cairns and their peoples' marks.
- **The hazards** (`86`): gas in the hollows at night, crusts over the boiling springs, the gorge's lahar, falls, thin air and cold; the
  geyser kit registers its own; the plume (`89b`) adds ash and the rain's pH.
- **Station 8, South Glass** (`stations/glass`, PLAN.md section 11.2): the dome's shape is plain maths in `44y` (`GLASS`: the top, the crest's lobes and
  flutes, the wall, the apron, the slumped lobe, the cracks, the pumice bench) added to the model's ground through the stage's `SITE.bench`; its fields
  (`SITE.fields`), ground slots and layers (`SITE.groundAttr`, `groundLayers`, `groundPaint`), KSTRATA's `obsidian-pancake` beds on the wall (`84s`, a KHOOK
  layer) and its pieces (`66`: `FIREBLISS.station`, the spines, blocks, knapping floors, quarry and cairns). The hooks are inert on the other stations.
  A station names its own core pieces in `station.json` (`"core"`).
- **The oases** are offered to the open world's outpost registry as candidates (`outposts.json`); nothing is drawn for them.

## Files

`INDEX.md` lists the fragments. `PORT.md` tags them for the Godot port. `KNOWN_ISSUES.md` holds what is owed.
