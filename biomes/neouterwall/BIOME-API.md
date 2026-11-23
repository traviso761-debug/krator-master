# Krator biome kits — the contract (NE outer wall edition)

One biome = one set of fragments (`46`, `50`, `70-biome-neow-*.js`) on the shared, engine-independent core (`core/biome`), the way every
Krator biome kit is written. Nothing in a kit fragment names a world's engine: `build.py` greps the kit's fragments (`-neow-`) and the ones
it reads in place (`-nwow-`) for the forbidden names. The kit's object is **`NEOW`**. Forked from the W outer wall's (`biomes/wouterwall`,
on `origin/claude/cloud-kits-verify`), itself from the NW outer wall's.

## What the host provides

```js
BIO.init({tags:'neouterwall', THREE, scene, terrainH, field (a KFIELD: the baked near ground), waterH, mask, obstacles, ticks,
  seed, origin:[[x,z],...] (the LOD spine), center, eye, fields:{...}, register, err, lod:{hero, mid, far, floor:[near, far]}});
NEOW.lay({fields:(x,z)=>F, R, seed});     // the kit's fields at a point, one record (47-host-land.js: fieldsAt)
NEOW.AMP = {warm, cold};                  // the station's annual swing (station 1: +7 / -7 round the tarn's +9 °C)
NEOW.zoneAt = (x,z)=>zone;                // a fast zone (the host's raster of 46's zones on its ground grid)
NEOW.THERM = KTHERM.create({...});        // the springs' heat (core/terrain 47): the tree ferns' warmth reads its excess
// the NW outer wall's flora, read in place: its passes ask NWOW, so the host binds it to the same fields
NWOW.AMP = NEOW.AMP; NWOW.lay({fields, R, seed}); NWOW.zoneAt = (x,z)=>NEOW.nwZone(NEOW.zoneAt(x,z)); NWOW.larchK = 1.2;
```

**The fields record F** (what 46 reads): `y` (the ground over the tarn's level), `g` (grade), `slope` (0..1), `sunny` (-1 a south-facing,
shaded slope .. 1 a north-facing, sunny one: the station stands near 31 S), `mean` (the annual mean, °C, with the aspect's 1.5 °C), `perma`
(0..1), `water`, `heat` (the ground's temperature, °C: KTHERM), `spring` (inside a spring's pool), `stair` (on the sinter stair's treads),
`dike` (on a dike fin's footprint), `talus` (metres of talus at a fin's foot), `apron` (0..1: on the spring apron), `part` (the site's part:
`model`, `apron`, `front`, `stair`, `talus`, `dike`), `shoreD`. For the NW outer wall's passes: `field`, `aufeis`, `pocket`, `floor` (false),
`gully` (0), `rock`.

The core's own fields are bound too (`BIO.field`): `wet`, `flow`, `cold`, `rock`, `upland`, `slope`, and this kit's `sunny`, `mean` and
`heat`: any other kit on the page can read them.

## The springs' heat bands (46: `NEOW.heatK(t)`, at a ground temperature t in °C)

| band | from | what |
|---|---|---|
| `mat` | 22 °C | the thermophile mats (green, orange, rust by the water's heat): no plant roots, the ground layer `ground.mat` |
| `sinter` | 40 °C | bare silica crust over hot ground (it may break: the `sink` hazard, owed) |
| `scald` | 60 °C | nothing grows, the mats thin out |

## The zones (46: `NEOW.zoneOf(F)`, first match wins)

`water`, `spring`, `dike`, `stair`, `sinter` (heat over 40 °C), `mat` (over 22), `shore` (a few metres over the water), `wall` (grade over
1), `talus` (at a fin's foot), `fellfield` and `tundra` (by the warmest month: under 2.5 and 7.5 °C), `grove` (the apron's gentle ground),
`slope` (the wall's wooded slopes), `meadow` (the gentle open ground). Each maps to the NW outer wall's zone its passes grow (`NEOW.ZONES`'
`nw`): `grove` and `slope` its larch woods, `shore` its valley floor, `meadow` its alas, `wall` and `talus` its rock, `tundra` and `fellfield`
as they are; the rest grow nothing of it.

## The kit's own (50: the cauldron's)

- `NEOW.SPECIES`: the steam tree fern (`treefern`, Dicksonia antarctica), drawn by its own builder (a tube trunk, a crown of `frond` cards);
  `NEOW.PASSES` place it on the grove, densest where the springs warm the ground (2-14 °C over the soil's mean).
- `NEOW.PLANTS`: the warm-shore reed (`reed`, Phragmites australis) on the shore's band and the mats' cool edge.
- `NEOW.buildTrees(R, q)`, `NEOW.buildFloor(R, q)`: after the NW outer wall's passes, keeping clear of its trees (`NWOW.blocked`).
- `NEOW.build({R, quality})` (70): the NW outer wall's build, then the ferns, then the reeds. `NEOW.canopyH(x, z)` the higher canopy.
- Library slots (`materials.json`): `frond` (`card.treefern`), `reed` (`card.reed`), `bark.fern` (`bark.mossy`); procedural without the pack.
