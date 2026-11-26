# biomes/gills: notes

## 2026-11-03: G1-G3 for the White Gills, the first station (xanadu `--station gills`, Alph's head)

Built from `PLAN.md` (sections 3, 6, 7, 9a, 11, 13, 16) in the xanadu turn of pair 6.

- **The shared life** (`src/44-gills-life.js`, `[G data]`): `GILLS.breath` on the sky's libration (the same sidereal rate and nod phase as
  `core/atmos/sky/89-atmos-e-skymodel.js`; it also takes `ATMOS.libration(t)`'s record, as `HANDOFF-REBUILD.md` "Taking it, the Gills" writes it),
  `peakHour`, the nine species and their harvest, the two countries' palettes, the Xanadui words, `layout` (the swarm) and `life` (the pipes, collars,
  fringes, pads, beads, lamps, the meadow and the steam emitters), every record keyed by a stable id and drawn from `KRAND.hash(seed, gill, index, salt)`.
  `tests/test-gills.js` passes (14 checks, each with a negative).
- **The station** (`biomes/xanadu/stations/gills/`): the land contract over a 6.4 km flank (2.9 km at the foot to 6.3 km at the glacier's edge,
  compressed: the model's Vale edge is ~4 km lower and tens of km off), 9 ring gills (7 breathing, 2 closed: a pipe field), 785 pipes as KSTACKS
  chimney records (244 iced over the 5.7 km ice line, 408 live), registered in core/tags before they are drawn; the laminae by `KSTRATA.lamina`
  (four variant columns, the White country, the Thin Yīr 300 years down); the collars, fringes, pads and beads on `BIO.animMat` mode `breath`;
  the throat lamps on the in-breath only; steam by `ATMOS.smokeGroups` (the breath group); Alph's pool, the river down its chasm with its falls,
  a milky `WATER.spring` in each live gill's floor; Alph's fountain forced only through the out-breath; the throats' `grab` (pull, `GILLS.suck`)
  and the sumps' `gas` as KHAZ records; the page opens at the out-breath's middle (`GILLS.peakHour`, 14:32 on day 0).
- **Numbers** (SwiftShader, 2026-11-03): pipes 1.16 M tris in ~40 merged chunk meshes; the page holds 10.2 M tris (the kit's wildwood at the foot is
  6.5 M of it), 534k instances; the station's pass 11.5 s on the CPU (KSTACKS.make and mesh of 785 pipes). Not measured on the GPU here.

## 2026-11-25: the catch's pipe field and candles (`biomes/catch --station gills-candles`), and a quality pass

The blocking item for `openworld/catch-bowl`'s White Gills Hermitage. Built, and `verify.py --assert` clean on SwiftShader
(no GPU lane was reachable): 1,081 pipes (tallest 34.5 m, mean 29.7, 428 branching), 135 candles, 79 steaming mouths,
2.6 M tris in 51 draw calls.

- **`src/45-gills-candles.js`** (`[G data]`, new): `GILLS.isDry` (a CLOSED gill whose gas is dry enough to burn; a
  breathing one steams instead, so the two are exclusive), `GILLS.candles` (the flames and their black heat crust) and
  `GILLS.sites` (the hermitage, the caravan stop, the Geomancers' gas-house and the hearths as plain data, nothing built).
  `tests/test-gills-candles.js` on `tools/ktest.js`: 27 checks, each with a `T.neg` fault and fix.
- **The catch's station** (`biomes/catch/stations/gills-candles/`), the White dress ported from the godthrone's. Its
  `build.py` gained the `reads` and `packs` keys the godthrone's and xanadu's builds already had, **per station**, so the
  four basin pages keep their own fragment list and only the gills page carries strata, lamina, hazard-flow and the
  smoke groups.
- **Dusk is 16.5 h here, not 18.6.** At latitude -57.6 this site's sun sets about 15.7 h, so the first cut opened the page
  in full night with the sun 21 degrees under the horizon and drew black. The candles' brightness now follows the SUN'S
  ALTITUDE rather than the clock, which is right at the Red Gills too.
- The White country's lamina takes `rate: .00022` (the slow end of the plan's 0.2-0.4 mm/day), because the alkaline brine
  "builds slowly" (section 7): a 36 m White column then holds ~450 years and the Thin Yīr of 300 stands well up inside it,
  as section 10 asks. At the default .0003 the marker fell past the column's foot and threw.

### The quality pass at the cylinder joins (the owner, 2026-11-25)

Three defects, two of them bugs rather than polish:

1. **The fork** (`core/terrain/37-core-stacks.js`). The boughs butt-joined onto the trunk's flat top annulus. The first
   attempt swelled their feet, which was wrong: the boughs are deliberately TANGENT to the trunk (`q + rf = r`), and a fat
   swell bulges them past it into a knuckle. The real defect was the three rim gaps BETWEEN boughs showing the disc
   through. Three boughs of `.58r` at `.42r` cover only `.659r`, two of `.68r` cover `.602r`, so the trunk now necks to
   under that over a long waist and the boughs bury the disc from every side: no shelf, no bulge.
2. **`toward` was a bearing given a place.** `GILLS.life` passed the gill's centre COORDINATES where `KSTACKS` reads a
   direction (`atan2(T[1], T[0])`), so every pipe on a gill leaned and fell along one identical heading - whole fields of
   parallel fallen pipes. Now it points out across the lip: gill0 went from 1 distinct bearing to 73.
3. **No keep-clear at all.** Pipes grew into one another and a fallen pipe lay straight through whatever stood along its
   bearing. `PLAN.md` section 13 had always asked for `core/space` here; it is now on `KSPACE` (never a second spatial
   hash), a fallen pipe's swept length included. A host that RESIZES pipes afterwards must pass a `gap` that covers its
   growth (BIOME-API.md); the catch station passes 3.

## Compressions and calls made

- **The gills are carved in the heightfield** (`GILLS.gillAt` in the station's `terrainH`), 38-86 m deep and 14-44 m wide, not the plan's 100-400 m:
  a 10 m ground mesh cannot draw a 300 m slot. `KCAVERN.trench` stacks for the walkable throats are owed (the core is merged; not taken here).
- **The pipes are their records' own meshes**, not instanced variants: `KSTACKS.mesh(B, {bore: 'open'})` per pipe, merged by 600 m chunk, so what
  the eye sees is what `at()` answers. A variant scheme (the plan's 12-16, instanced) is the cheaper path if the count grows.
- **The Vale's flora stops at 4,740 m** (`LAND.mask`), off the gills and off ground the 10 m mesh cannot follow (|drawnH - terrainH| > .5 m).

## Owed

- The catch's three stations and the godthrone's two (the Red country: radial cracks, tall flared pipes; the palettes are written).
- Fauna (`kits/fauna`: the breath-rider, the throat maw, the bead-runner; the cinder crawler and frost trunker in place).
- The far gills' steam as `KFAR.spriteMesh` sprites; the mist wall as `fogPool` scaled by the breath; the candles (catch); the hermitage and
  gas-house sites as data (catch); `kits/crops` (lung salt), `kits/resources` (owner nodes).
- `KCAVERN` throats and the pipes' bores into them; the `fall` hazard on rotten lips; the maw's lair.
- **Textures: delivered 2026-11-03** (`core/materials/PLAN.md`, "Delivered 2026-11-03"). The kit's own pack (`materials.json`, `tex/`;
  `python3 tools/textures/pack.py biomes/gills`, then rebuild every station that lists it in its `station.json` `"packs"`): `pipe.lamina`
  (`rock.lamina.pipe`, the couplets as a detail map in `KSTRATA.laminaShade`'s colour), `collar` (`mineral.crust.brucite`), `fringe`
  (`card.breathfringe`, one tuft), `turf` (`card.turf.limed`, on `GILLS.life`'s `turf` records). xanadu's station `gills` reads it.
  `mineral.crust.ferromanganese` (the Red collar) is in the library, not yet packed: add it when a page draws the Red country. The reuse list (travertine, aufeis, ice.glacier: xanadu's pack now carries `ice.glacier`) is not wired yet:
  the ice pipes and the glacier's edge are vertex colour and the ground's snow paint.
