# core/biome

The biome core every biome kit runs on (`10-core-head.js` to `44-core-stage.js`; `biomes/README.md` for the kits). A build
lists the fragments it takes in `CORE_BIOME` in its `build.py`. This file covers the parts added for the final rebuild
(2026-10-26, `HANDOFF-REBUILD.md` "Stage 1, final", core changes B1-B8 and research pick R6). Tests: `node core/biome/test-*.js`
(`test-lod.js`, `test-impostor.js` for what follows).

## The runtime LOD's draw-call options (B1, B2; `20-core-kit.js`)

A pass that sets `BIO.range` keys what it puts by chunk and range, and `BIO.lodTick(camera)` shows a chunk mesh while the
camera is within its range of the chunk box. Until now each (chunk, range, minRange) was its own mesh, so a near floor band
at 800 m and a mid band at 1200 m cost two calls a chunk per item. Four options, each **off by default** (a page that sets
none bakes exactly today's meshes):

| Option | What it does | Look |
|---|---|---|
| `BIO.LOD.merge = true` | one mesh per chunk (and minRange) whatever its ranges; rows sorted by range, longest first; `lodTick` draws the prefix whose range reaches the camera (an InstancedMesh's `count` while it renders, a bucket's draw range). The same instances are shown from every camera (`test-lod.js` proves it on five cameras). | none |
| `BIO.LOD.minTris = n` | with merge: an item or bucket whose chunk meshes would average under `n` triangles is keyed on a 2, 4 or 8 times coarser grid. Its box grows, so it draws a little further out. Stand-ins (minRange) are never coarsened. | small layers reach a little further |
| `BIO.chunk = metres` | a pass's own chunk size, set like `BIO.range` (hero sub-chunks, big chunks for a sparse layer); the key carries the size | per pass |
| `BIO.LOD.fade = .15` | a dithered cross-fade over the last 15% of each range: a chunk's heroes dither out while its stand-ins (minRange) dither in over the same band, filling complementary pixels. `BIO.lodFade(material)` wraps the material's `onBeforeCompile` (after the page's own hook) and is applied at bake to every chunk mesh's material; the mesh carries its box and ranges as three per-mesh vec4s in one instanced interleaved buffer (the export skips it). `BIO.LODFADE_GLSL` holds the chunks for a material that wants them in its own shader. | no pop at the switch |

Notes. A merged mesh's `userData.lod` gains `ranges: [[range, count], ...]` (and `size` when the chunk is not the page's).
**The Godot importer reads only `lod.range`** (`godot/krator/biome_import.gd` `_apply_lod`): for a merged mesh holding
several ranges that is the longest, so a port draws its near layer out to the far range until the export
(`42-core-export.js`) splits a record by `ranges` (requested; not in this workstream's files). A page whose chunk meshes
each hold one range (both pilots at 1200 m) exports as before. The fade's `discard` costs early depth rejection on opaque
materials (bark, boulders) inside faded meshes. A mesh with over three ranges, or with no room for three more attribute
slots, keeps the hard switch.

**Fixed 2026-10-26 (nhighlands):** the fade's vertex shader read `cameraPosition`, which three r128 uploads only to Phong, Toon,
Standard, shader and env-mapped materials. Every Lambert leaf and bark read (0,0,0), so with the fade on every chunk more than
about one range from the map's origin dithered out (nhighlands' stream view drew no near trees or floor). It now takes the eye from
the view matrix. The two earlier pilots (nwlowlands, swbay) carried the bug in their committed pages until they are rebuilt.

## Per-instance inspector labels (B5)

`BIO.put(name, pos, q, s, col, {label: 'Black grass'})` gives one instance its own label where it differs from the item's,
so two plants sharing a geometry and a material can be one item (one call a chunk) and still be named apart. Bake hands the
table to the mesh (`userData.instLabels = {names, idx}`, an index per row, kept through the merge sort);
`BIO.instLabel(mesh, instanceId)` reads it, and core/host's inspector (`93-host-inspect.js`) names the hit by it, so every
build's own `describe()` sees the instance's label in `hit.object.userData.inspectLabel` unchanged (`hit.mesh` is the mesh).

## Small fixes (B4, B6, B7)

- `BIO.lathe(fam, rings, seg, rep, ...)`: `rep` may be a function of the ring, rounded per ring to a whole number (at least
  1) so each wrap is seamless; a number draws exactly as before. The hyperjungle's boles pass `R => TAU*R.r/sc0` (no seam
  where sections of different repeat meet; that moves the look of the hyperjungle and of every build that reads its trees).
- `BIO.animMat`: `flap.rate`, `flap.amp`, `legs.top`, `legs.amp` default only when left out (`== null`): rate 0 is a still
  wing (sedesert's 1e-9 draws the same shader as 0).
- `BIO.dynamic` names the kit current when it makes a mesh (`userData.kit`); eastabyss's own assignment
  (`75-biome-eastabyss-fauna.js` line 163) can go.

## Octahedral impostors (R6; `34-core-impostor.js`, opt-in)

A far tree as one quad showing the species from the camera's direction, blended from 8 x 8 views over the upper hemisphere
(a hemi-octahedral grid) baked once per species into a colour atlas and a normal-and-coverage atlas (1024 px each at 128 px
a view; 8 MB of GPU memory a species). The quad turns with the tree's yaw, is lit by the scene's sun, ambient and hemisphere
lights (read every frame) and fogged by the scene's fog; 2 triangles a tree. The bake builds one tree with the kit's own
builders after `BIO.bake` (so its random numbers come after every placement), renders it, and leaves no instance, charge,
registration (the kit mutes its own) or scene object behind.

## Tall trees (H6: 480 m crowns; `biomes/hyperjungle/PLAN-LANDS.md` section 11)

The savage land's crowns reach 480 m, where the hyperjungle kit's ring was sized for 305 m (the mahogany's top). What was
checked first (2026-10-26), and what each part needs:

| Part | What it does now | A 480 m crown | Change |
|---|---|---|---|
| **LOD radii** (`BIO.radii`, `BIO.LOD`, `BIO.range`) | the switch distance is from the camera to a chunk's box. For a bucket (bark) the box is its own triangles' (each one's first vertex); for an **instanced** item (leaf clumps, cards, impostor quads) it is the box of the instances' **origins**, the feet. The frustum test uses a sphere round that box padded 60 m | with the page's 1200 m chunk the sphere (radius about 935 m) still covers a 480 m crown. A pass on smaller chunks (`BIO.chunk`, the hero sub-chunks of 200 to 400 m) gets a sphere of 250 to 500 m: looking up at a crown whose feet are out of the frame, its chunk is culled. The same is already true at 305 m on the smallest chunks | **`BIO.LOD.reach`** and an item's own **`reach`** (below), opt-in |
| **The far ring** (`HYPERJUNGLE.buildTrees(R, heroR)`: heroes to 1500 m, blob impostors to 3000 m, saplings to heroR+400; camera far 12 km; `FogExp2` .0003) | horizontal distances | unchanged: no distance in the ring depends on height. The kit's 165 m spacing and the blobs' sizes are the kit's (J2, `biomes/hyperjungle/src`) | none in core |
| **Octahedral impostors** (`34-core-impostor.js`) | the bake fits an orthographic camera to the tree's farthest vertex (`rad`), so any height bakes; the quad is sized by `rad` and the put's scale | the view cell covers `2 rad`: about 430 m for a 305 m tree, about 620 m for a 480 m one. At the same cell the tall tree is 1.45 times softer, or its band must start 1.45 times farther for the same sharpness. A 64 px set cell is about 10 m a texel; at 700 m one screen pixel (1080 px, 50 degrees) is 0.6 m | **`BIO.IMP.texel(rad, cell, dist, o)`** and **`BIO.IMP.cellFor(rad, dist, o)`** to size the cell (or the band's start) for a crown; `BIO.impostorItem(..., {reach})` |
| **Shadow camera** | no biome host draws shadow maps (the hyperjungle's ground is Lambert, "no shadow maps here"; `core/host` sets none; only the atmos demo and the character labs cast) | nothing to clip | none. A host that turns sun shadows on later fits its orthographic box to the tallest crown plus `reach` |
| **Probe and verify budgets** (`core/host/95-host-probe.js`) | `regOccupancy` tests each volume's own cylinder (`y-2` to `y+h+5`) | scales with the volume's `h` | none in core. The kit's triangle budget (taller boles, more rings and boughs) and its preset-view check (`HCHK.views`, horizontal rings only: a camera below 480 m can stand inside a crown) are the kit's, set at J2 |
| **core/lod** (`09-lod.js`) | chunk spheres from the real vertices, an instance's from its base shape times its scale | scales | none (the biome kits do not take it) |

**`reach`** (`20-core-kit.js`, bake): metres an instanced item's drawing reaches above its instances' origins. `BIO.LOD.reach`
sets it for every instanced item of a page; an item's own (`BIO.defs[name].reach`, or `BIO.impostorItem(name, imp, {reach})`)
wins. It raises the top of the chunk's box (the LOD distance and the cull sphere both use it). Unset (the default), every
chunk is exactly as before. A kit with 480 m trees sets its crown items' reach to their tallest top (about 480 times the
put's scale), not the page's, so floor items keep their tight boxes.

**Sizing an impostor cell.** `BIO.IMP.texel(rad, cell, dist, {fov, height})` is how many screen pixels one texel of a view
covers at `dist` (fov in degrees, default 50; height the viewport's pixels, default 1080): above 1 the impostor is softer
than the screen. `BIO.IMP.cellFor(rad, dist, {fov, height, ratio, max})` is the smallest power-of-two cell whose texel
covers at most `ratio` pixels (default 2) at `dist`, capped at `max` (default 256: a set of nine species at 8 x 8 views and
256 px is a 6144 px atlas, over most GPUs' limit, so a set of tall species takes fewer slots or a smaller grid). Both are
plain arithmetic (`node core/biome/test-tall.js`).

## Welded item geometry (`BIO.INDEX_ITEMS`, opt-in)

`BIO.def` un-indexes every item's geometry (triangle soup). With `BIO.INDEX_ITEMS = true` (set before the kits define their
items) or `BIO.def(name, geo, mat, {indexed: true})` the soup is welded: vertices whose every attribute is equal become one, drawn
by index. The same triangles in the same order, so the same pixels; a 6-triangle card runs its vertex shader for 12 vertices,
not 18. nhighlands' leaf and floor cards were vertex-bound on an integrated GPU, and welding saved 17-18% of the frame on its
stream and tower views (`biomes/nhighlands/PERF.md`). The export writes the index (`42-core-export.js` already handled
indexed buckets). Test: `test-lod.js`.

## A library card on its geometry's axes (`20-core-kit.js`, `30-core-foliage.js`; opt-in per slot, 2026-10-27)

**The project standard for hanging cards** (the owner, 2026-10-27, on the Rift's beard moss: "make it the project standard"): a
hanging card (beard moss, hanging growth, lianas, curtains) is one continuous strand, its library plant spanning the whole
ribbon once from its `"base": "top"`, never the picture stacked once a segment in square-cut bands. Give every hanging slot a base.

`BIO.geo.frond` and `BIO.geo.ribbon` draw their texture once a segment, down v from the stem or hung end at v 0; `BIO.geo.hang`
hangs from v 0; the clump's tripod shows its image upside down (v 0 at each quad's low edge). A library card that is one whole
plant broke on all of them: the Rift's fern fronds were four small upside-down ferns end to end, floating loose of the stem
(the owner, "these imposters improperly split the cutout textures"). Each of these geometries now declares where it holds its
plant, `geo.userData.card = {base, once}` (`once`: the uv that spans the image once down the whole length), and a
materials.json card slot names where its plant attaches in its image, `"base"` (left, top, right, bottom, centre), with
`"cell"` the plant's tight box. `BIO.libSwap` puts the base on the material (`userData.libCard`); `BIO.def` gives the item a
copy of its geometry whose uv is turned so the two ends meet (`BIO.cardTurn`) and spans the plant once. An item defined before
the swap is fitted by it; a variant pool fits each variant to its own material (`d.raw`, the unfitted geometry). A slot with
no base, a geometry that declares nothing, or one cut into a sheet's cells (`BIO.geo.cells` clears the declaration) draws as
before, byte for byte. A kit's own geometry may declare its end the same way (the Rift's groundsel heads on `G.rosetteUV`:
`{base: 'left'}`). The geometry's uv carry the fit, so the export, Godot and the impostor bake need nothing new.
`tools/textures/check_cells.py` proposes each slot's cell and base; `tools/textures/card_probe.py` draws the slot on its
geometry before and after (`HANDOFF-REBUILD.md`, "its card cells"). Test: `test-cards.js`.

**A crown's sprigs held by their stems** (the owner, 2026-10-27: "the stem on the leaf card does not orient properly to the 3d
stem model"). A clump's slot may carry `"stems"`: up to three sprigs, each `{cell, stem, tip, w, back}` (its box in the
sheet, its stem point and tip in the image, its half-widths about the stem-tip line, how far the card reaches behind a stem
set inside a rosette), and `"rise"` (radians above level the sprigs leave the twig at, default .65; negative for a weeping
spray, about 1.2 for one bush standing on its trunk). `BIO.def` then draws the clump as `BIO.geo.stemClump`: three cards whose
stems sit at the clump's origin, the twig the kit puts it on, each running out along its sprig's own long axis, cut to the
sprig's oriented box clipped to its cell (2 to 6 triangles a card, against 2). The texture is the whole sheet. A clump cut
into cells by `BIO.geo.cells` takes stems too. `check_cells.py` measures the stems (the thin, woody end far from the
sprig's mass, a tie going to the lower end); `core/materials/library/card-bases.json` holds the hand ones.

## The foliage guards (`20-core-kit.js`, `core/host/95-host-probe.js`; on by default, 2026-10-27)

- **The card guard.** `BIO.def` (and `BIO.libSwap`, for items defined before it) reports through `BIO.err` a library card it
  cannot draw right: a sheet drawn whole (no cell, stems, `BIO.geo.cells`, `"sheet": "geometry"` or a uv cut by the kit's own
  code), a library plant on a frond, ribbon or hang with no `base`, a crown on the clump with no `stems` or `base`.
  `BIO.cardFaults` lists them. It reads `plants` and `anchor` from the pack entry (`tools/textures/pack.py`): a pack written
  before them is never refused.
- **One box a chunk.** At bake every chunk mesh takes the height range (so the distance and the cull sphere) of every mesh
  sharing its square and minRange: a tree's bark, rods and cards switch at one distance. `BIO.LOD.ownBox = true`: as before.
- **The attachment audit.** `BIO.attachAudit({ground})` reads the baked scene: each leaf or hang card above the ground
  (sampled, 20,000 at most) against the nearest structure (instanced non-card items along their long axes; every other mesh's
  triangle edges, on KSPACE near the samples): floating, in another chunk, or reaching past its structure's range. An item
  defined with `{free: true}` is skipped.
- **The checks.** `BIO.guardChecks(o)` and `BIO.guardNegatives(o)` (each with controls that must fail: a made-up fern with no
  base, every card lifted 6 m, every card reaching four times its range) are appended by the host probe to every build's
  `hostChecks` and `hostNegatives`; `KHOST.take({guards: false | {maxShare, minUp, k, kStem, pad, max}})` turns them off or
  tunes them (maxShare .01 by default). `HANDOFF-REBUILD.md`, "the foliage guards", has the rule for a build that fails.
  Test: `test-guards.js`.

## Fungoid parts (`33-core-fungoid.js`, `BIO.fung`; opt-in)

One copy of the fleshy-body parts the fungoid lineage is drawn with (`biomes/outlands/PLAN.md` section 12, C2), in place of the
copies each kit carried. Two halves: unit geometries for `BIO.def` (origin at the base, +y up, a vertex colour that is a shade:
`cap` (dome, disc, funnel; gills, pores or none; optionally on a stem), `bracket`, `bladder`, `pod`, `stalk`, `fringe`, `comb`,
`tube`, `crust`), and plain-record layouts (`troop`, `shelves`, `pods`, `combs` -> `[{p, q, s, i, u}]`, each item drawn from
`KRAND.hash(seed, i, salt)`, never from draw order) with `BIO.fung.put(name, recs, col, at)` to place them. Every option is
`x == null ? d : x`. The header of the fragment lists every option. Test: `node core/biome/test-fungoid.js`.

Adopting it: list `'33-core-fungoid.js'` after `30-core-foliage.js` in `CORE_BIOME` (core/rand must be on the page), then
`BIO.def(item, BIO.fung.cap({...}), mat, {label})` where the kit built its own. Keep the kit's placement as it was (its
`rng()` draws), so nothing placed after it moves; a new pass can use the layouts. nhighlands' mushroom and disc stalk are the
first (2026-10-26: `G.mushroom`, `G.disc` in its `50`); the rest of `TODO.md`'s list follows in the final rebuild.

## Bamboo parts (`33b-core-bamboo.js`, `BIO.bamboo`; opt-in)

The giant-bamboo parts, written once before the kits that need them (`biomes/hyperjungle/PLAN-LANDS.md` section 11, H5,
step J3): the hyperjungle's howl bamboo, the Cut's hyperbamboo and, later, nwlowlands' sky bamboo. In the style of
`BIO.fung`: unit geometries for `BIO.def` and plain-record layouts.

- **Geometry** (origin at the foot, +y up, a vertex colour that is a shade): `culm` (a culm 1 high and 1 across: internodes,
  the node swelling, the dark node ring and the white waxy band; a bite opened to its chambers, rows of borer holes as dark
  plugs with a pale stain below, the sheaths kept at the lowest nodes; equal internodes, or `jit`/`grade` for culms outside
  the Cut's warp; `taper`, and `bend`/`droop` with `aspect` for a cane bowed out and over, its rings kept round once the
  instance is scaled; `axis(o, t)` the cane's axis point), `tiers` (near, mid, far: the Cut's three LOD tiers, ranges in `BIO.bamboo.LOD`), `holeSet` (holes in rows,
  seeded), `nodeY` (the node heights), `spray` (a hanging leaf spray on a 3x3 sheet cell), `fan` and `fanTips` (a node's twigs,
  as geometry and as data), `shoot`.
- **Layout** (records, `KRAND.hash(seed, i, k, salt)`, never draw order): `groveCells` (one candidate grove a cell, seeded by
  cell), `grove` (clumps of culms, one internode length for the grove, the bases sunk to the grove's levels so the nodes line
  up, the internode count falling toward the rim, old culms holed or bitten by share, shoots), `clump` (a clumping bamboo's canes
  from one root mass, each bowed out along its own azimuth, a bend variant each), `sprays` (a culm's leaf sprays
  by node and LOD tier), `flower` / `flowering(flower, year)` (gregarious flowering: every grove of a cohort flowers in one
  year a cycle, stands dead, then regrows). `BIO.bamboo.put(name, recs, col, at)` places records (`name` may be a function of
  the record).

**The Cut's culm is reproduced exactly**: `BIO.bamboo.culm({n, seg, fs, bite, cut})` writes the same vertices, normals, uv and
colours as the Cut's `G.culm(n, seg, bite, fs, cut)` for all fourteen of its items (three counts by three tiers, the three
bitten culms, the echo, a cut length): the largest difference in any attribute is 0. The test lifts `G.culm` out of
`biomes/cut/src/50-biome-cut-species.js` in place. The grove layout follows the Cut's `CUT.plan` groves in shape (clumps,
the 28/24/20 tiers, the level rule) but not draw for draw: the Cut's warp (lean, stretch, size steps) stays the Cut's, applied
to the records. nwlowlands' sky bamboo (a plain open cylinder, the belly lathe, the coil) is a `culm` with few sides; its
grove pass stays its own until its rebuild. Test: `node core/biome/test-bamboo.js`.

Adopting it: list `'33b-core-bamboo.js'` after `30-core-foliage.js` in `CORE_BIOME` (core/rand must be on the page); def
each variant (`BIO.def('culm24', BIO.bamboo.culm({n: 24, ...}), mat)`, its tiers likewise) and place a grove's records.
No page takes it yet. Who adopts it, each in its own rebuild:

| Build | Its bamboo | What it takes |
|---|---|---|
| `biomes/hyperjungle` (north land) | howl bamboo, 50-70 m, bored | `culm` with `jit`, `holes` (`holeSet`), `sheaths`; `grove` with `align: false`, `holed`; `sprays`; `flowering` |
| `biomes/cut` | hyperbamboo | `culm` as its `G.culm` (exact), `tiers`, `spray` (its `G.hang`), `grove` (the warp stays the Cut's), `flowering` |
| `biomes/nwlowlands` | sky bamboo (and its belly and coil canes) | `culm` with few sides for the sky culm; the belly lathe and coil stay its own |
| `biomes/k-guilin` | phoenix-tail bamboo (*Bambusa multiplex*), 8-15 m clumps arching over the river | `clump`, `culm` with `taper: .45`, `tip: 0`, `bend` in `.25-.5`, `droop: 1.1`, `aspect` (height over diameter, about 100-200), a few bend variants and `tiers` (in place of its per-tree `BIO.tube` and mid `rod`); its `bambooleaf` clumps at `axis(o, t)` up the top third |

k-guilin draws each cane today as a `BIO.tube` on a per-tree path (`55-biome-kguilin-trees.js` `B[0]`: canes out to
`arch h t^2`, the top past t .6 let down `1.1 h (t - .6)^2`, radius `rb (1 - .45 t)`): `culm({bend, droop: 1.1, droopAt: .6,
taper: .45})` is that path. Its page will change when it moves (instanced variants in place of a tube per cane, seeded by
`KRAND`, not `rng()`). `biomes/guilin` (frozen, the Earth reference) has the same phoenix-tail bamboo and stays as it is.

## Adopting it

The draw-call options, in the host fragment right after `BIO.init(...)` (nwlowlands' and swbay's `45-host-stage.js`):

```js
BIO.LOD.merge=true;BIO.LOD.minTris=1500;BIO.LOD.fade=.15;
```

Nothing else changes; a kit that had raised its near floor range to 1200 m to save calls can take it back to 800 (the
measured trade is in the pilots' KNOWN_ISSUES.md). Per-instance labels: pass `{label}` in the put's `extra` and merge the
items that differed only by label.

The impostors, three lines and the kit's own call sites (swbay is the worked example):

1. `build.py`: add `'34-core-impostor.js'` to `CORE_BIOME` after `'32-core-variants.js'`.
2. The kit's tree pass, once the trees are chosen: per species, `const rec = BIO.impostor(key, () => buildOneTree(T0), {at:
   [T0.x, T0.y0, T0.z], label})` and `BIO.impostorItem(itemName, rec)`; then where a blob far tree or stand-in was drawn,
   `BIO.put(itemName, [T.x, T.y0, T.z], qEuler(0, yaw, 0), T.H / T0.H, tint)` under the same `BIO.range` / `minRange`.
   Keep any random draws the blob code made (swbay keeps its cap colours) so no later tree moves.
3. The host build (`88-host-build.js`), after `BIO.bake()`: `if (BIO.bakeImpostors) BIO.bakeImpostors(renderer);`

## Godot

- The merge, minTris and chunk options are three-side draw grouping; the export's records carry `lod.ranges` for a port
  to split by. The cross-fade is `GeometryInstance3D.visibility_range_fade_mode` (FADE_SELF, already set by the importer)
  or the same dither in a shader.
- Per-instance labels: `userData.instLabels` exported per item as a label table and a row index (an export change, as
  above) for the Godot inspector.
- Impostors: the atlases are DataTextures (export them as PNGs with the material's `userData.bio` {kind: 'impostor',
  opts: grid, cell, radius, centre}); a `far.gdshader` on a MultiMesh does the same hemi-octahedral decode and three-view
  blend (SIsilicon's Octahedral Impostors addon uses the same layout). The bake is browser-side; a port reads its atlases.

## Reach and kin (PLAN-LANDS.md H1, H2; `40-core-place.js`, `20-core-kit.js`, `32-core-variants.js`; opt-in)

**Reach.** A species carried out of its home polygon by long diffusion carries `reach: {from, km, falloff}`.
`BIO.reachW(reach, x, z)` is 1 inside `from`, falling to 0 at `km` kilometres from it: `'smooth'` (the default, 1 minus
smoothstep), `'linear'`, `'square'` or a function of t = d / km. The distance (metres) is the host's:
`BIO.host.distance = {from: (x, z) -> m}` or one `(from, x, z) -> m`; `BIO.reachField(F, {x0, z0, m})` makes that lookup
from a core/mask `KMASK.distance` field (`core/mask/README.md`, "The distance transform"). A host that cannot say (no
`distance`, an unknown `from`, a null) gives weight 0: a reach species does not grow where the distance is unknown.
`BIO.grid(..., {reach})` multiplies its accept by the weight before the mask (a species record holding `.reach` works
too). The cells it zeroes draw nothing more, and a grid without it draws exactly as before (`test-reach.js`).

**Kin.** `BIO.kin('eastabyss.sigillaria', delta)` is a cousin of another kit's species, grown by that kit's own builder.
`BIO.kitBuilder(kit, key)` is the lookup: the source kit's `SPECIES` entry and its `make(sp, x, y, z)` and `grow(T, lv)`,
which every tree kit already exports (or the kit's own `api.builders[key] = {make, grow}`). The source kit's fragments
must be on the page; its `build` is never called, so the source pages do not change. The delta: `key`, `name`; `scale`
(a number or `{H, rb, crownR}`) multiplies the size ranges; `habit`, `colour` and `pheno` merge into the record (the
builder's own fields, its colour arrays, phenology data for the seasons); `tags` merge, and `tags.kin` is the source; any
other field (a `reach`) is set. While `K.make` and `K.grow` run, the source's `SPECIES` entry is the kin's record (put back
after, even on a throw), so what the builder reads there is the kin's; the geometry goes into the source kit's registry.
What a builder does not read from its record (a habit coded by species index, a palette cached at load) stays the
source's: check the builder before relying on a field. `test-kin.js`.

### Adopting it

- Reach: list `27-core-mask-distance.js` (core/mask) in the build; in the host, build each home polygon's field and set
  `BIO.host.distance` (`core/mask/README.md`, "Adopting it"); in the kit's pass for a borrowed species, pass
  `{reach: S.reach}` to `BIO.grid`, or multiply its accept by `BIO.reachW(S.reach, x, z)` where the pass has its own.
  The open world reads `dist.png` (`tools/scale-model/extract_region.py`) for the same field.
- Kin: list the source kit's fragments before the kin's kit (as abyssal-savannah lists eastabyss's), then in the kin's
  species file `const SEAL = BIO.kin('eastabyss.sigillaria', {...})`, add `SEAL.record` to the kit's `SPECIES` (core/tags
  reads its tags), and in its pass `const T = SEAL.make(x, y, z); SEAL.grow(T, lv)`. Reseed first for a repeatable tree,
  as with the source's own `make`.

---

<!-- the foliage workstream (2026-10-26) wrote its own README on its branch; merged below as written -->

## The foliage workstream's notes

One copy of what every biome kit draws with (`core/README.md` has the module list). A build lists the fragments it
takes by name in its `build.py` (`CORE_BIOME`); a fragment not listed is not on the page. This README covers the
foliage fragments: `30-core-foliage.js` (leaf, bark, far, hang materials and their shader hooks), `31-core-dither.js`
(the hex-cell ground dither) and `31b-core-leafset.js` (leaves held by the stem). Tests: `node core/biome/test-foliage.js`,
`node core/biome/test-leafset.js` (and the other `test-*.js`).

## What 30-core-foliage gained on 2026-10-26 (the final rebuild's core items)

Every addition is off until a page or a kit asks for it. With none asked for, every hook writes the shader it wrote
before, character for character: `test-foliage.js` holds the SHA-1 of the fourteen default shaders (seven leaf option
sets, gloss, irid, both far kinds, hang, plain bark, solid) as `de751ca46` wrote them.

| Item | Call | Kind |
|---|---|---|
| B3 per-species two-tone bark | `BIO.glossBarkMat(tex,key,{alt,gloss,c2:true})`; the builder sets `BIO.c2` (a species' second colour) around the calls that write its bark | needs buckets that carry `aC2` (`BIO.C2_BUCKETS`, a `20-core-kit.js` change: requested, the patch is with the report); ignored without them |
| B9 spin | `BIO.leafMat(tex,key,{spin:true})` (or `spin:{value}` of the host's own): turns about the instance origin by `BIO.SPIN.value` | per material |
| R5 floor cover takes the ground's colour | `BIO.setGround(tex,[x0,z0,x1,z1],{linear})` or `BIO.setGround(BIO.groundTex(fn,box,128),box)`; leafMat `{ground:{k,gain,tip,fade:[d0,d1]}}` | page + material |
| R7 alpha-to-coverage | `BIO.setA2C(renderer)` after the kits are built: MSAA on WebGL2 only, the alpha test kept otherwise | page |
| R8 one wind field | `BIO.bindAtmosWind({gain})` after `ATMOS.init`/`bindHost`: the sway and lean ride `atmGust` at each root | page |
| item 6 back-light | leafMat `{backlit:0..1}` | per material |
| the cross-fade hook | `BIO.FADE={uniforms,vertexPars,vertex,fragmentPars,fragment}` or `function(sh,kind)`, set before the kits build | page (for the kit workstream's dithered LOD cross-fade) |
| X4 the ground dither | list `31-core-dither.js`; `BIO.DITHER` is the GLSL (kdither, kditherW, kmacro), `BIO.ditherCell` its JS twin | fragment |
| leafset | list `31b-core-leafset.js` (and `core/rand`); `BIO.geo.clump({stem:true})`, `BIO.geo.leafCard`, `BIO.leafOn`, `BIO.leafAlong` | fragment + kit |

Page-wide switches must be set before the first frame: the shaders take them when they compile. The program keys
carry them (`|gust`, `|fade`, `|a2c`, `|c2`), so no program is shared across a switch.

## Adopting it (the exact lines; nhighlands, nsemiarid, nwlowlands, korona and farside are the pilots)

1. **One wind field (R8) and alpha-to-coverage (R7).** In the host fragment that binds core/atmos (nhighlands
   `89a-host-atmos.js`), right after `ATMOS.bindHost({...})` (or `ATMOS.init`):

   ```js
   BIO.bindAtmosWind();BIO.setA2C(renderer);
   ```

   A page with no core/atmos skips the first (it returns false and nothing changes). A page whose renderer has
   `antialias:false` or renders into a render target without samples gets no coverage and keeps its alpha test.
   It changes the look: the foliage leans downwind and swells as gust fronts pass (12 m/s, wavelengths 40-240 m).

2. **The ground at the root (R5).** On the floor cover's leaf materials (the grasses and low tufts drawn in the floor
   band), add `ground:{k:.8,gain:G,fade:[d0,d1]}`, `d1` at or inside the floor's chunk range (`BIO.range` of the floor
   pass) and `d0` some 150-200 m before it; `gain` is the ground material's own tint times its detail map's mean (nhighlands:
   `.42`). After the ground is built, before the first frame (nhighlands `88-host-build.js`):

   ```js
   BIO.setGround(GROUND.material.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   // the paint's v runs z1..z0 (a CanvasTexture)
   ```

   A ground drawn by a shader with no single paint texture bakes one: `BIO.setGround(BIO.groundTex((x,z)=>colourAt(x,z),box,128),box)`.
   A page that reads the kit in place without a ground bound gets neither the tint nor the fade.

3. **The back-light (item 6).** `backlit:.3`-`.4` on the broadleaf leaf materials (thin leaves); not on needles or
   moss.

4. **Spin (B9).** A material whose kit options say `spin:true` now turns in the core's shader; a host that wrapped the
   core hook to do it (nsemiarid's `VARIANTS.spinUnique`, removed) drops its wrap and drives `BIO.SPIN.value`.

5. **The ground dither (X4).** Add `'31-core-dither.js'` to `CORE_BIOME` after `30-core-foliage.js` and replace the
   page's copy of the bomb with `const DITHER=BIO.DITHER;` (Korona, Farside). Then the functions are the same names.

6. **Two-tone bark per species (B3), once `20-core-kit.js` carries `aC2`.** Mark the shared bark materials and their
   buckets: `glossBarkMat(tex,key,{c2:true,alt,gloss})` and `BIO.bucket(fam,mat,{label,uvScale,c2:true})`; give each
   species that wants its own second colour an `alt2`, and wrap its hero builder: `BIO.c2=S.alt2==null?null:S.alt2;
   B[S.habit](T,st,lv);BIO.c2=null;` (nwlowlands `55`). Species without one keep the bucket's `alt`.

7. **Leaves held by the stem (leafset).** List `'31b-core-leafset.js'` after `30-core-foliage.js` (core/rand must be on
   the page). Give the crown items a stem spray, `BIO.def(item,BIO.geo.clump({stem:true}),mat,...)`, and place them
   with the twig's direction instead of a random turn:

   ```js
   const r=BIO.leafOn({a:[x-dx,y-dy,z-dz],b:[x,y,z]},1,{seed:KRAND.hash(salt,Math.round(x*50),Math.round(y*50),Math.round(z*50)),angle:.55,droop:.25});
   BIO.put(item,[x,y,z],BIO.leafQ(r),[s,s,s],col,extra);
   ```

   Keep drawing the old random turn (`qEuler(rr(..),rr(..),rr(..))`) and discard it, so the page's stream, and so
   everything placed after, does not move. Along a twig, `BIO.leafAlong(seg,n,{phyl:'opposite'|'alternate'|'whorl'|'spiral'})`.
   A single card: `BIO.geo.leafCard({stem:BIO.leafStem(meta)})` (the library's `meta.json`, or `[su,sv]` in image
   coordinates, v down). A frond (`BIO.geo.frond`, already pinned at its origin, blade along +x) takes `axis:'x'`.
   nhighlands' pilot is `NHL.LEAFSET` (`50` and `55` `clumpAt`; `?leafset=0` for the old look).

## The season (H7, 2026-10-26; `biomes/hyperjungle/PLAN-LANDS.md` section 11)

Dry-season leaf drop and the grass's colour shift, on core/clock's season (`core/README.md`, "`clock/`"). One page-wide
uniform, `BIO.SEASON.value` (0..1, how far into the dry season), beside the wind's; a leaf material reads it only when
its options carry `season`:

- `season: {drop, colour, k, stagger}` on `BIO.leafMat`: `drop` (0..1) is the share of cards gone at full dry, an
  instance at a time by the hash of its root (the lowest hashes first) and then stippled away in 12 cm cells of the
  unswayed card, so a crown thins rather than pops; `colour` (hex) is what the instance and vertex colours give way to
  (`k`, 1, how far at full dry; a material with no colours takes it as a multiplier); `stagger` (.5) spreads each
  instance's dryness about the page's, so a stand turns patchily. The hash is Dave Hoskins' (`BIO.GLSL_SEASON_HASH`),
  no sine. It sits after the ground tint and before the alpha test.
- `BIO.setSeason(x)`: a number or a season record (`{dry}`). `BIO.bindSeason(clock, o)`: every frame from a KCLOCK clock
  (default `KHOST.host.clock`), `o` being `KCLOCK.season`'s options; false without core/clock.

With no `season` option the shaders are the frozen defaults (`test-foliage.js` section 1); at `BIO.SEASON` 0 a season
material draws what it would without (both terms are exactly x1; section 10 runs the shader's own formulas in
`core/water/glsl-interp.js`).

**Adopting it** (savannarim, rust miombo, the monsoon kapok; PLAN-LANDS J4): core/clock on the page, then in the host
fragment after the host is bound:

```js
BIO.bindSeason(null,{sharp:2});   // the monsoon: two seasons, the rains in the southern summer
```

and on the materials that turn: the grasses `season:{colour:0xc8a860,k:.85}`, a deciduous crown (`monsoonrag`, the
kapok) `season:{drop:.9,colour:0x9a7040,k:.5}`, the bolster `season:{colour:0xd86a20}`. A material's options are in
`m.userData.bio.opts`, so the export carries them. Not done yet: the copper flush (a colour at the start of the rains,
not the dry) and the Godot leaf shader's twin (a global `season_dry`, the same hash and the same two terms).

## Godot

- R8: `leaf.gdshader` reads the same global uniforms as core/atmos (`atm_wind`, `atm_gust_amp`, `atm_time`) and the same
  `atmGust` sum (core/atmos `GODOT.md`); the sway scale and lean are `1 + gustAmp*gain*atmGust(t, root.xz, wind)`.
- R5: a `sampler2D` ground colour, a `vec4` box and `vec4(k, gain, d0, d1)` in `leaf.gdshader`; the root is the
  MultiMesh instance origin (`MODEL_MATRIX * INSTANCE` origin).
- R7: `alpha_antialiasing_mode = ALPHA_ANTIALIASING_ALPHA_TO_COVERAGE` with `alpha_antialiasing_edge` the old cut-off.
- Back-light: `BACKLIGHT` in the leaf shader, scaled by the material's `backlit`.
- B3: a per-vertex `CUSTOM0` (the second colour) in `bark.gdshader` mode 2, 0 meaning the material's `alt`.
- B9: the turn in `vertex()` before the instance transform, angle `spin*(0.8+0.4*fract(h*3.7))+h*TAU`, `h` the hash of the
  instance origin with `(0.173,0.091,0.137)`.
- Dither: `ground.gdshader` writes the same `kh2`/`kbomb`/`kdither` functions; `BIO.ditherCell` is the check.
- Leafset: the placement is plain maths on KRAND (krand.gd has the same hash): the quaternion is the instance basis.
- The cross-fade hook: Godot's visibility ranges fade alpha only, so the port needs the same dither discard in its shaders.

---

## Fire: `KFIRE` (`38-core-fire.js`; hyperjungle PLAN-LANDS.md section 11, H3; opt-in)

crater-drylands' fire history (`CRATERDRY.fireHistory`, `fireRun`, `ageAt`, `frontAt`: `biomes/crater-drylands/src/52-biome-craterdry-fire.js`)
lifted into core for every savannah's burn mosaic (the cycad flush and the ember spikes key on burn age). `[G data]`: no BIO, THREE or
DOM; the host hands it its ground (`height(x,z)`) and its burnability (`burn(x,z)`). The API is in the fragment's header.

**crater-drylands' output must match KFIRE's.** The spread, the fuel curve, the ignition search, the live fire and the lookups are the
kit's arithmetic, operation for operation: from the same ground, burnability and fires, `KFIRE.history` gives the kit's `last`, `id`,
`front`, `base` and `H` grids bit for bit, and `KFIRE.run` the kit's `arrive` and `order`. `node core/biome/test-fire.js` proves it
against the kit's own function, loaded in place (its negatives: a reversed wind and one fire 30% larger are seen). A change to either
side that breaks the match fails that test; change both, or neither.

Two inputs differ from the kit on purpose, and a host chooses them:

- **The old fires.** The kit lights its older fires from BIO's PRNG in draw order (`reseed(seed)`, `rr`, `rng`); KFIRE lights fire
  `k` from `KRAND.hash(seed, k, try, salt)`, so fire `k` is asked at the same point whatever else was drawn. Same counts and ranges
  (7 to 45 years ago, 5 to 11% of the map, veer within 0.35 rad), different places.
- **The noise.** The kit's patchiness and edge warp are BIO's sin-based `fbm`, which GDScript cannot reproduce. KFIRE's defaults are
  on `KRAND.fbm` (`KFIRE.patch(seed)`, `warp: 'krand'`); a host can pass its own (`burn`, `warp: fn`).

### Adopting it

1. `build.py`: add `'38-core-fire.js'` to `CORE_BIOME` (after `'10-core-head.js'`; it needs core/rand, which every biome build takes).
2. The host, once its terrain and fields are bound, before the floor pass reads burn age:

```js
const FIRE=KFIRE.history({R:TERR.R,cell:20,seed:520031,wind:FIRE_WIND,fires:FIRES,old:9,
  height:BIO.terrainH,burn:KFIRE.burnFromFields(BIO.field,BIO.depth,KFIRE.patch(521))});
// then KFIRE.ageAt(x,z) / FIRE.ageAt, KFIRE.stages(age), FIRE.frontAt, KFIRE.run(FIRE,{x,z}) for a live fire
```

**crater-drylands, at its rebuild:** to keep its page, pass the kit's own inputs: `burn` from its formula with its BIO `fbm` patch,
`warp` its BIO `fbm` warp, and its fires as it lit them (`old:0` and the list; `test-fire.js` builds exactly these). To move to the
portable defaults (what Godot can reproduce), drop those three and the page changes once: a rebuild with a screenshot set.

### Godot

`core/biome/kfire.gd` is the twin (`kfire_test.gd`, on `golden-fire.json`, which `node core/biome/test-fire.js --write` rewrites and a
plain run checks is current). `python3 godot/tools/sync_core.py` vendors the three into `godot/tests/fire/`; `tools/test_all.py
--nightly` runs `res://tests/fire/kfire_test.gd`. The grids match the page **bit for bit** on Godot 4.7.2 (every cell of a 61 x 61
case with seven fires and a live fire). What it takes: float32 grids and heap keys where the JS has Float32Array, `floor(x + 0.5)` for
`Math.round` (GDScript's `round` differs on negative halves), and V8's `Math.hypot` written out (it is not `sqrt(x*x + z*z)`: for the
default wind the two differ in the last bit). `exp`, `pow`, `sin` and `cos` are the platform's and agreed on this case. Godot's JSON
parser can lose a double's last bits, so the test compares grids by sha256 and scalars within 1e-12.

A page's own `Math.hypot`, `exp` and `pow` are V8's in Chrome; another browser engine could differ in a last bit (as for any
`Math.exp` in a placement).

## Lean toward the giant (`39-core-lean.js`; hyperjungle PLAN-LANDS.md section 11, H4; opt-in)

`BIO.GIANT` (the ground vector toward the gas giant, x east and z south), `BIO.GIANT_AZ`, `BIO.GIANT_YAW`, `BIO.setGiant(az)`,
`BIO.giantFromSky(dir)`, and `BIO.leanTo(dir, k, {jit, u, toward})`, `BIO.leanQ(k, o)`, `BIO.leanOf(dir)`: what ehighlands does
today as `EHIGH.GIANT`, `EHIGH.setGiant` and `EHIGH.toward`, for the e and se rims' cousins, the leaning ferns and the cloud avocado's
one-sided epiphytes. Plain arithmetic on arrays. `leanTo(null, k, {jit, u})` is `EHIGH.toward(k, jit)` bit for bit when `u` is the
number its `rr` drew (`node core/biome/test-lean.js` runs ehighlands' lines, read in place, beside it). A new kit takes `u` from
`KRAND.unit(KRAND.hash(...))` of the plant's cell and index, never from a draw.

**The sky disagrees with the canon 66.** The shared sky (`core/atmos/sky/89-atmos-e-skymodel.js`, `ATMOS.skyState(site,h,d).giantDir`)
places the giant per site. At ehighlands' site (px 839, py 542) it stands at **azimuth 59.6** (57.5 to 61.7 over a day's
libration), **altitude ~34**, not 66 and 25 (the LORE figure, which is Voth's: the sky gives Voth 67.4 and 24.7). So ehighlands'
plants lean about 6 degrees east of the giant its own sky draws. Neither side is changed here; `test-lean.js` prints the numbers
(and fails if they part by more than 10 degrees). The owner's call: keep the canon 66 for every eastern kit, or bind each kit to its
sky with `BIO.giantFromSky(SKY.state.giantDir)` (or the day's mean), which moves ehighlands' plants once.

### Adopting it

1. `build.py`: add `'39-core-lean.js'` to `CORE_BIOME` (after `'10-core-head.js'`; it needs `BIO`).
2. At placement: `const up = BIO.leanTo(null, tilt, {jit: .25, u: KRAND.unit(KRAND.hash(seed, ix, iz, i))})` for a stem's axis,
   `BIO.leanQ(tilt, o)` for an instance's quaternion, `BIO.GIANT_YAW + jitter` to turn a geometry's +x (a cushion's steep side) to it.
3. A site whose giant should be its sky's: `BIO.giantFromSky(dir)` before the placement pass (it sets `GIANT`, `GIANT_AZ`, `GIANT_YAW`).

**ehighlands, at its rebuild:** replace `EHIGH.setGiant(GIANT_AZ)` with `BIO.setGiant(GIANT_AZ)` and `EHIGH.GIANT` / `GIANT_YAW` /
`toward(a, jit)` with `BIO.GIANT` / `BIO.GIANT_YAW` / `BIO.leanTo(null, a, {jit, u: rng()})`: the same numbers in the same draw order,
so its page holds. (Its `rr(-j, j)` is one `rng()` draw, which `u` stands in for.)
