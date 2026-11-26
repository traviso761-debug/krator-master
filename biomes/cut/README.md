# biomes/cut: the Cut

The bowl an Ancient eigenweapon left in the northern Inner Wall when it deleted the bottom of a sphere some 500-1,300 km
across, centred in orbit (`PLAN.md` sections 9 and 11; `LORE.md` §6.2). What the weapon left behind still acts on what grows
there: **the warp**, strongest at the bowl's centre and gone at the lip. The kit is mostly that warp laid over another kit's
flora (`biomes/nwlowlands`, read in place, and `biomes/nhighlands` on the lip), with five natives of its own. `PLAN.md` is the
plan and its Core adoption section; `BIOME-API.md` the contract; `INDEX.md` the fragments; `KNOWN_ISSUES.md` what is open.

## The three stations (PLAN.md section 8)

| Page | Build | Where | What it shows |
|---|---|---|---|
| `dist/cut.html` | `python3 build.py` | the floor by the upper lake, -1,456 m, 1.92 atm, s 0.8 | the lake on core/water (no breakers); hyperbamboo groves combed along the field (spokes and rings), their nodes on one level across each grove, old culms bitten open to their chambers, echoes at dusk; ring reeds at the water; rankgrass ruled across the salt steppe; nwlowlands' shore trees (glow-willows, paperbarks, pandans, mist palms, tree ferns) and the creek's she-oaks and wattles, warped; the creek's water and its plume into the lake; mist on the lake at dawn; the cutters' camp |
| `dist/cut-wall.html` | `python3 build.py --station wall` | the wall over the crater mouth, -140 m, 1.64 atm, s 0.2 | nwlowlands' columns (gums, tower ash, kauri, banksias, grass trees, wattles) leaning a little; the measure melons' terraces and their cistern; hyperbamboo in a ravine, nhighlands' great trumpets beside it (exchange 6); the bowl seen across |
| `dist/cut-face.html` | `python3 build.py --station face` | the west lip, ~4,900 m (map 5.1), s 0 | the bare cut face, polished: the crater wall's megabreccia sawn flat (KSTRATA; the bake's `impact` province), circle lichen on it; KRELIEF's broken crest past the lip with nhighlands' forest on it; nhighlands' rowans past the lip (66 km out, the plan's ring) with the bowl's stuck fruit (exchange 5); a snowmelt tarn; the whole bowl below |

Each page holds the whole bowl as a far-ground skirt (the bowl's own heights to 120 km, coloured by height and the lakes), so
the walls round the horizon are geometry; the shared sky's ridges (cast from the same bowl, `CUT.horizon`) carry the land beyond.

## The warp (PLAN.md section 3)

`CUT.field(x, z)` (bowl coordinates: metres from the centre, x east, z south) gives the strength `s` (1 at the centre, 0 at the
lip on that bearing) and the ring's axis (radial and tangential rings 6 km wide, alternating). `CUT.warp` turns it into a
plant's transform at placement: the lean (up to 25 degrees x s) and the stretch along the axis (1 + 0.6 s), the size steps (0.7,
1.0, 1.4 where s > .3), a clean bite (probability 0.15 s), an echo (2% where s > .6), straight ranks (s > .5). Every draw is a
KRAND hash of where the plant stands. `tests/test-cut.js` pins it (the warp's fingerprint over 2,000 plants).
The read-in kits are warped by `CUT.warpKit` (`46-biome-cut-warp.js`) as they build, about each tree's foot, with the dense
air's habit (half again in height below 0 m) and the station's list of the plan's species for its ring.

## Build and verify

```
cd biomes/cut && python3 build.py && python3 build.py --station wall && python3 build.py --station face
node tests/test-cut.js
python3 verify.py dist/cut.html --assert --all-views        # and dist/cut-wall.html, dist/cut-face.html
```

**Switches** (the final rebuild, pair 10; each compares a new module against what the page drew before, or turns on what is off at load):
`?shadow=1` the sun's shadows (KSHADOW, off by default), `?bend=1` the field's ripple (KWARP, off by default), `?mirror=probe|live` the reflections
(off at load), `?strata=0` the face's level beds, `?kground=0` the ground's old mix, `?kfar=0` the old far skirt, `?horizon=0` no terrain shadows (`=ground`, `=scene`, `=all`: one half or both; the face keeps its ground out by default),
`?plume=0` the plain lake.

`verify.py` takes the shared harness (`tools/harness.py`); run it with `KRATOR_GL=gpu`. Under `--assert` the kit's own checks
run with their negative controls: the culms combed along the field, a grove's nodes on one set of levels, the warp's bites,
echoes and size steps, the camp's tags, the read-in trees of the station's ring only, the natives tagged; the wall's melons in
exactly three sizes; the face's lichen circles never touching. Textures: `python3 tools/textures/pack.py biomes/cut` after a
change to `materials.json` (a fresh worktree needs `git lfs pull` of the library sets it names, and of `biomes/nwlowlands/tex`
and `biomes/nhighlands/tex`).
