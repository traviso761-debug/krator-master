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

## Welded item geometry (`BIO.INDEX_ITEMS`, opt-in)

`BIO.def` un-indexes every item's geometry (triangle soup). With `BIO.INDEX_ITEMS = true` (set before the kits define their
items) or `BIO.def(name, geo, mat, {indexed: true})` the soup is welded: vertices whose every attribute is equal become one, drawn
by index. The same triangles in the same order, so the same pixels; a 6-triangle card runs its vertex shader for 12 vertices,
not 18. nhighlands' leaf and floor cards were vertex-bound on an integrated GPU, and welding saved 17-18% of the frame on its
stream and tower views (`biomes/nhighlands/PERF.md`). The export writes the index (`42-core-export.js` already handled
indexed buckets). Test: `test-lod.js`.

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
