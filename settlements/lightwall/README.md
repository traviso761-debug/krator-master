# settlements/lightwall: Lāiṭwāl, the Light Wall

A town of 5,000 on the north shore of Opal Valley's great lake (px 1028,1653), under the valley's north boundary fault: half
**Glaziers** in tiers of carved fronts up the wall (the eastern loj's main hold, `kits/tungang/PLAN.md` 1.4), half **Xanadui** on
the bench below in the Xanadu kit's buildings, meeting at **the Stair Foot** bazaar. The seat of the province Ōpal-Bhālī; the
bench is the Sultan's, the wall the loj's (the owner, 2026-11-16). `PLAN.md` is the plan and the owner's answers; this pass is
its steps L2 to L4 (the town's own page, its interiors).

## Build and verify

```
python3 build.py                                   # dist/lightwall.html
python3 ../../tools/build.py settlements/lightwall # the same through the repo's build wrapper (the page cap, the inputs)
KRATOR_GL=gpu python3 verify.py dist/lightwall.html --assert --views "Overview,From the lake,The Stair Foot"
```

`build.py` writes the open world's ground into `gen/41w-lw-world-ground.js` (`core/world/bake_ground.py`: the region's land
chain run in node, about 30 s, skipped while its inputs are unchanged) and two closures into `gen/` (generated at every build, not committed): `69l-kcity-bundle.js` (core/city and
core/space, as Qiblai's, with the raster's `Raster` and `OCC` handed out on `KCITY.lib`) and `69t-tungang-bundle.js` (the
Tungang kit sealed as `TG`: the Glaziers' `gz-*` set), then runs `settlements/xanadu/build.py --kit settlements/lightwall`: the
town is a target on Xanadu's page, as Qiblai and Erewhon are, with the Qiblai kit read in place (the Decree's caravanserai and
monastery, its ground sets) and core/terrain's cavern (`KCAVERN`, its draw, its rock cut).

## How the town is made

| Fragment | What |
|---|---|
| `targets/town/89z-rows.js` | `window.CITY` (Xanadu's showcase is skipped), the title, no sheet rows |
| `gen/41w-lw-world-ground.js` | GENERATED at build (`core/world/bake_ground.py`): the open world's ground round the pin, the region's `WORLD.H` on a 16 m and a 64 m grid (`LW_WORLD`) |
| `targets/town/89zl-lw-site.js` | the frame and the ground (`terrainH`: the open world's ground (`LW_WORLD`) with the scale-model edit owed (`lwPending`: the bay, the scarp), the town's own patch on it: the lake bed, the bench's profile, the wall's foot, the ramp under the bands held under the carved rooms); the wall's four bands and their sites (`LW_WALL`: the specials, then each band filled poor to rich by its place); the bench's streets and blocks laid on a core/city instance and filled by frontage-courts with the Xanadu kit's houses; the landmarks by hand (the Iridescent Order on the eastern spur); the people; the blocks' plots (`lwPlot`: kitchen gardens, orchards, yards, dooryards); the flora's mask |
| `targets/town/90l-lw-world.js` | the Krator sky; the bench's mesh wearing a canvas painted from the records (never read back); the far ground round it (the north wall, the shore east and west, the lake's bed: 16 by 18 km); the lake's plane where core/water is missing |
| `targets/town/90o-lw-opal.js` | the Great Potch Line: the Resources kit's opal nodes at the wall's foot (`TG.res`), each working of the wall linked to its nearest |
| `targets/town/90n-lw-scree.js` | the wall's screes: KRUBBLE heaps, talus cones at the bands' ends and heaps in the gaps, the ledges' walked |
| `targets/town/90s-lw-flora.js` | Opal Valley's flora (the sealed `LW_FLORA`): the middle terrace's station over the bench's mask, the orchards planted |
| `targets/town/90lw-lw-lake.js` | the great lake on core/water: one open surface on core/atmos's wave field, its shore grid along the town |
| `targets/town/90m-lw-wall.js` | every Glazier site registered in core/tags (culture `glazier`); the bands' plain rock between the carved sites; the carved quarter's rock carved from the sites' void plans (`TG.gz.carve`, KCAVERN; the floors to core/walk; the rock cut for the cut-away); the fronts drawn through `TG.gz.draw`, the outer wall as fronts on whole rock (`facade`) |
| `targets/town/90r-lw-build.js` | the bench's buildings, chunk by chunk (each on a footing of dressed stone down a slope), those within 260 m of the Stair Foot with the Xanadu kit's interiors (L4); the flora (the Vale of Xanadu biome over the mask, and the kits' own plants) |
| `targets/town/91z-views.js` | the views and the town's budget |
| `verify.py` | Xanadu's verify plus the town's: `town-laid`, `wall-drawn`, `wall-carved`, `wall-tags`, `half-and-half` (a budget), `lights-of-the-wall`, `ix-bench` and `ix-glazier` (L4: the furnished houses, every carved home walked into), `bench-ground` (the blocks' plots), `bench-stairs` (the podiums and their steps, climbed from the street into the houses), `world-ground` (the page on the open world's ground, PLAN.md L6), `lake-water` (the lake on core/water, its shore), `wall-scree`, `opal-flora`, `opal-lode` |

## The town by the numbers (2026-11-16, with L4)

| | |
|---|---|
| The wall | 321 Glazier sites in four bands (131 carved in the central quarter, 186 fronts on whole rock beyond it, 4 lotus ponds on the shore): cells, household fronts and rich houses, the tea hall and the Register on the main stair, the monks' house, four glass shops, three wheel walks, adits on the Great Potch Line, vein galleries, dark adits; about 2,300 people |
| The bench | 44 blocks (20 built, 24 the bench terraces' fields with a farmhouse each), about 360 lots from frontage-courts, the bazaar, the assay house, the factor's house and the strongroom, the garrison, the quays and boatsheds, the caravanserai west and the Iridescent Order (a house of the Teal great monastery of Qiblai) east on its spur; the blocks' open ground in kitchen gardens, orchards and yards; about 2,900 people |
| Interiors | 61 houses round the Stair Foot furnished (552 rooms, about 4,900 pieces); 109 carved homes in the wall walked from their front rooms (515 catalog pieces in the carved rooms) |
| Triangles | about 1 M of fronts, about 1 M of carved rock, the bench's buildings instanced |
| Files | `dist/lightwall.html` (5.4 MB) and every `dist/*.js` beside it: `lightwall.tex.tungang.js` (the Glaziers' textures), `xanadu.tex.xanadu*.js` (Xanadu's pack), `xanadu.tex.qiblai.js`, `xanadu.tex.xanadu-bio.js` (the biome's cards), `xanadu.tex.catalog-furniture.js` (the furniture's detail maps): publish them together |

What is not here yet: `KNOWN_ISSUES.md`.
