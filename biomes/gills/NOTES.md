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
- **Textures to source** (`PLAN.md` section 15, prompts written there): `rock.lamina.pipe` (the laminae are procedural through `KSTRATA.lamina`
  meanwhile: say so at the look pass), `mineral.crust.brucite` (the lime collar: a flat colour on the page now), `mineral.crust.ferromanganese`
  (Red), `card.breathfringe` (the fringe is a flat strip now), `card.turf.limed` (the dew mat is a flat disc now). For
  `core/materials/PROMPTS-NEEDED.md`. The reuse list (travertine, aufeis, ice.glacier: xanadu's pack now carries `ice.glacier`) is not wired yet:
  the ice pipes and the glacier's edge are vertex colour and the ground's snow paint.
