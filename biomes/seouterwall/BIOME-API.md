# Krator biome kits — the contract (SE outer wall edition)

One biome = one set of fragments (`46`, `70-biome-seow-*.js`, and later the kit's own species) on the shared, engine-independent core
(`core/biome`), the way every Krator biome kit is written. Nothing in a kit fragment names a world's engine: `build.py` greps the kit's
fragments (`-seow-`) and the ones it reads in place (`-nwow-`) for the forbidden names. The kit's object is **`SEOW`**.

## What the host provides

```js
BIO.init({tags:'seouterwall', THREE, scene, terrainH, field (a KFIELD: the baked near ground), waterH, mask, obstacles, ticks,
  seed, origin:[[x,z],...] (the LOD spine), center, eye, fields:{...}, register, err, lod:{hero, mid, far, floor:[near, far]}});
SEOW.lay({fields:(x,z)=>F, R, seed});     // the kit's fields at a point, one record (47-host-land.js: fieldsAt)
SEOW.AMP = {warm, cold};                  // optional: the station's annual swing (default +11 / -12 round the mean)
SEOW.zoneAt = (x,z)=>zone;                // optional: a fast zone (the host's raster of 46's zones on its ground grid)
// the NW outer wall's flora, read in place (station 1): its passes ask NWOW, so the host binds it to the same fields
NWOW.AMP = SEOW.AMP; NWOW.lay({fields, R, seed}); NWOW.zoneAt = (x,z)=>SEOW.nwZone(SEOW.zoneAt(x,z)); NWOW.larchK = .3;
```

**The fields record F** (what 46 reads): `y` (the ground), `g` (grade), `slope` (0..1), `sunny` (-1 a south-facing, shaded slope .. 1 a
north-facing, sunny one: the stations stand near 53 S), `mean` (the annual mean, °C, with the aspect's 1.5 °C), `perma` (0..1), `water`,
`streamD` (metres to the brook), `heap` (on a rockfall heap), `melt` (the meltwater gully's part: `floor`, `bar`, `pool`, `bank`, `fan`, or
null), `fan` (0..1: the fan's live channels), `cobble`, `moraine` (metres of moraine over the ground), `crag` (metres of the crags' relief),
`wind` (0 a lee .. 1 the open col and the crests: the God-Bore's exposure). For the NW outer wall's passes: `field`, `aufeis`, `pocket`
(false), `rock`, `gully` (0).

The core's own fields are bound too (`BIO.field`): `wet`, `flow`, `cold`, `rock`, `upland`, `slope`, and this kit's `sunny`, `mean`,
`wind`, `moraine`: any other kit on the page can read them.

## The tiers (46: `SEOW.tierOf(h)`, at an absolute height h in metres)

| tier | heights | what |
|---|---|---|
| `pass` | to 3,850 | the Godsgate's floor and fault toes: Dsc / BSk, krummholz, braided meltwater gravels |
| `subalpine` | 3,850-4,200 | the cirque floors and the slopes' foot: the tarns' band (stations 2-6) |
| `bench` | 4,200-5,400 | slump treads, felsenmeer, sorted stones, rock glaciers: ET |
| `nival` | 5,400-6,450 | arêtes, horns, hanging glaciers, rockfall chutes: EF |
| `hypobaric` | 6,450-9,000 | the model's taller crest (PLAN.md 7.2): nothing grows |
| `airless` | 9,000 up | Class O |

`SEOW.atm(h)` is the model's own rule, 1.6 x e^(-h / 8 km).

## The zones (46: `SEOW.zoneOf(F)`)

`water`, `heap`, `floor` (the meltwater gully's floor and bars), `fan`, `crag` (grade over .9), `scree` (.55-.9), `fellfield` and
`tundra` (by the warmest month), `moraine`, `larch` (a shaded slope in a lee), `krummholz` (a shaded slope in the open), `col` (the
outwash flat), `puna` (a sunny slope). `SEOW.ZONES[z].nw` names the NW outer wall's zone whose passes grow there; `none` grows nothing
(a crag, a heap).

## The kit's surface (70)

`SEOW.build({R, quality})` runs the NW outer wall's passes (read in place) on this page's fields and returns their counts;
`SEOW.canopyH(x, z)` is the canopy's top (NWOW's).
