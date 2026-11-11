# Underground cameras and maps (the Tungang plan's section 6, built)

The owner approved the core extensions in the Tungang plan (`kits/tungang/PLAN.md` section 6, question 14, on
`claude/tungang-fellgang-kits-a56ece`), and on 2026-11-11 asked for the core work the Line's stations need. The Line's
stations (`biomes/line`, the Line session) and Dhelv are the test beds. This file is the plan, the interfaces, the
measurements and the Godot side.

## The rule this follows: opt-in by file, not by flag

`90-host-camera.js` and `99-host-cutaway.js` are on 408 pages, `88-core-minimap.js` on 249, and core/shader on 515
(`tools/reach.py`). If a page inlines a file, any edit to that file's text changes the page. So **nothing here edits
an existing core file**. Every piece is a new fragment, and only a build that lists it takes it, so every other page
stays byte-identical (`tools/port_baseline.py`). Two builds read whole folders: Locus reads `core/minimap/`, and Dhelv
and the Scyvoi-engine kits read `core/shader/`. So the new map and shader fragments go in subfolders, where no
folder listing finds them.

| Piece | File | Kind |
|---|---|---|
| Follow camera (V), spring arm on a distance query, ceiling cast | `core/host/91b-host-follow.js` (after 91, because it is a taker) | [web], with the arm's maths a pure function (node-tested) |
| Cut-away additions: caps, decks hidden by tag, the deck below darkened, the soft band, the vertical section, the two-plane slab, the cut badge | `core/host/99-host-section.js` | [web] |
| The map's deck bands, above/below marks, the line map (`M.schematic`), carried by `export()` | `core/minimap/decks/88b-core-minimap-decks.js` | [G data] |
| The map's host side: the band follows the eye; the line map panel (L) | `core/host/97b-host-minimap-decks.js` | [web] |
| Dither fade chunk, x-ray pass | `core/shader/aids/08-core-kfade.js` | KHOOK layers, opt-in by material |
| `host.py` | `UNDERGROUND` list, `WHERE` entries | no page changes |

| The rock cut over each void's own floor, and the cut boxes (lifted from the Zeijani kit, with the owner's yes of 2026-11-11) | `core/terrain/host/39h-core-cavern-cut.js` | [web] host file; a KHOOK layer on the rock material |

The Zeijani kit and Dhelv keep their fork of the rock cut until they adopt the core layer (`kits/zeijani/KNOWN_ISSUES.md`).

## Order

1. Measure on Dhelv as built: what `C.sdf`, `C.voidSD` and `C.ceilingAt` cost at the camera, and what a player cannot
   read in walk and orbit views of the braid, the wells and the tubes.
2. Follow camera; if the direct query is too slow, add the cached distance grid round the camera.
3. Cut-away additions.
4. Map.
5. Dither and x-ray.
6. Node tests with negatives. A test page (`core/host/underground/`: a small deck hold and a natural cave on
   `KCAVERN`) shows every piece, GPU-verified. Dhelv and a cave page get it as agreed.
7. Port baseline unchanged; commit; tell the Line session the interfaces.

## Taking it

```python
CORE_HOST = khost.FULL + khost.UNDERGROUND      # or SHELL + the pieces wanted; 97b and 88b need the minimap (97, 88, 88a)
khost.resolve(PATH, CORE_HOST)
```

A build that lists its files by hand takes them by `khost.path(name)` (`core/host/underground/build.py` does this). Each piece
also does nothing until the take asks for it, so a page may list all five and use one.

## Interfaces

**The follow camera** (`91b-host-follow.js`):

```js
KHOST.take({..., walk: KWALK,
  solid: KHOST.solidFrom({cavern: C, walk: KWALK}),   // or any (x, y, z) -> signed distance, positive in the open
  follow: {dist: 4, r: .3, key: 'v', avatar: true, grid: false, fade: true, xray: true}});
KHOST.follow.enable({solid, ...})                       // the same from a later fragment
KHOST.follow.set(on), .on, .S {L, want, mode: 'boom'|'shoulder'|'fp', hc, elevMax}, .clearance()
KHOST.solidFrom({cavern, walk, ground, thin: ['thin']}) // KCAVERN's C.sdf, KWALK's blocks as boxes (tag `thin` left out, an open door left out)
KHOST.solidGrid(solid, {cell: .5, r: 6, budget: 1500})  // the cached lattice (follow: {grid: true}); not needed at Dhelv's cost
KHOST.arm.march / step / mode / ceiling                  // the maths, pure (node core/host/test-follow.js)
```

V follows: from the walker if walking, else from the floor under the camera. That is not the highest floor at that x, z,
which is what core/host's F takes (below, "Dhelv"). F goes back to first person, and the wheel sets the arm's length. A
sphere of 0.3 m is marched back along the view. The arm pulls in at once if the camera's spot is in rock, after 0.15 s if
only the line is blocked, and eases out at 2.5 m/s after 0.4 s free. Under 1.2 m of arm the camera goes over the shoulder,
under 0.6 m it is first person. A cast up from the pivot every third frame lowers the pitch limit. The walker is drawn as a
small figure, with an x-ray silhouette when KFADE is on the page, and while following KFADE dithers whatever stands
between the camera and the walker.

**The cut-away additions** (`99-host-section.js`), in `o.cutaway` beside 99's options:

```js
cutaway: {units: [{id, name, x, z, w, d, levels: [{y, h, name}]}], cutAt: 2.3,      // 99's deck cut (X, ] [)
  caps: {color: '#3a2f28', hatch: true, match(mesh)},   // default: meshes with userData.rock (KCAVERN.drawRock sets it) or userData.cap
  decks: {of(object) -> deck index, fog: {color, opacity}},   // default: userData.deck
  band: {above: 2.2, soft: 1, r: 0, key: 'u'},          // the cut over the eye, for caves without decks
  section: {key: 'c', slab: 6, offset: 0}}              // C a vertical plane facing the camera, Shift+C a slab
KHOST.section.set('band' | 'section' | 'slab'), .off(), .mode, .clipped(x, y, z), .planes, .badge
```

A deck cut is 99's unit cut. On top of it, the decks above are hidden by their objects' deck, a dark sheet lies under the
storey's floor, and the rock is capped. Caps are back faces in a flat section colour with a screen hatch. In a deck or band
cut they are kept to the cut's box (their own planes: the box inverted, in union). In a section they take the main planes,
because the voids behind the plane are behind rock. A DoubleSide rock material is drawn FrontSide while a cut is on (one
recompile). The plane count stays five. Only the slab changes how the planes combine (union, one recompile each way). The
badge (`#khost-cutmode`) is up while any cut is on. `clipped()` is a pick's filter: three's Raycaster ignores clipping, and
93's inspector does not filter yet (left, below).

**The map** (`88b-core-minimap-decks.js` [G data], `97b-host-minimap-decks.js` [web]):

```js
minimap: {..., decks: {bands: [{y0, y1, name}] | null (a window: below 2, above 4), walk: KWALK, marks: true, dim: .28},
               schematic: {nodes: [{id, name, kind: 'station'|'loj'|'junction'|'lift'|'gap', x, depth}],
                           edges: [{a, b, state: 'solid'|'gap', time, line}], title, lines: {name: '#hex'}, key: 'l', onPick(node)}}
M.walkBands(W, colourOf), M.band(y0, y1, {dim, marks}), M.mark(x, z, dy, {name}), M.bandOf(r), M.schematic(nodes, edges, o)
M.export() -> + {heights, bands, marks, schematic}       // KMAP.schematic(nodes, edges, o) alone, too
```

The band follows your feet (walking) or the orbit's target a few times a second. The deck you are on is bright and drawn on
top, the others are dimmed, and the named things outside the band carry an arrow, up or down. The map's title names the
deck. L opens the line map: the Tube style, intact segments solid, gaps dashed with the walk's minutes. `walkBands` reads
poly floors (KCAVERN's carved rooms) as their box. 88's `fromWalk` cannot read them: it throws on a poly floor.

**The fade and the x-ray** (`core/shader/aids/08-core-kfade.js`):

```js
KFADE.add(material, {occluder: true, band: true})   // a KHOOK layer: screen-door dither, opaque, unsorted, shadowed
KFADE.addAll(root, match, o); KFADE.track(a, b, r, max); KFADE.band(y, soft)
KFADE.xray(object, {color, opacity}); KFADE.unxray(object)
```

Opt-in by material: rock takes `{occluder: false}`, because fading a cave wall shows the void. The 4 x 4 Bayer cell is
one screen pixel. The x-ray is a stencil pre-pass of the object's visible pixels (LessEqual, no colour), then a
GreaterDepth silhouette where it is hidden and not marked.

## Measured on Dhelv (2026-11-11, settlements/dhelv as built, Arc and RTX)

Dhelv's committed page did not load. Its build lost two modules when they moved out of the kit (MODULARITY step 1): the
placeholder sky (`KratorSky is not defined`) and core/door with the engine's `36o-open.js`. `settlements/dhelv/build.py`
now takes both, as `kits/zeijani/build.py` does. A third fault is in core/biome. `30-core-foliage.js`'s `stemClump` ends
its `const` list with a `;` (line 157), so `bk`, `box`, `poly` and `kk` are assigned as globals, and `box` overwrites the
Zeijani kit's `box()`: "build zj_council: TypeError: box is not a function". That file reaches most pages, so it is reported,
not fixed here. The measurements below patched that one character in the served page.

| Query (622 voids) | RTX 5060 | Arc 140T |
|---|---|---|
| `C.sdf` | 0.046 ms | 0.031 ms |
| `C.voidSD` | 0.018 ms | 0.016 ms |
| `C.ceilingAt` | 1.55 ms | 1.09 ms |
| an arm of 16 `sdf` steps | 0.65 ms | 0.42 ms |

So the direct query is fast enough. `ceilingAt` is slow because it marches up in short steps with a bisection, not because
`sdf` is. A frame of the follow camera is about 30 to 40 queries (the arm, the spot, the shoulder, a third of a ceiling
cast): about 1 to 1.5 ms. The cached grid (`solidGrid`) is there for a page with ten times Dhelv's voids. It is off by
default.

What a player cannot read on Dhelv today (the braid, the wells, the outer tube, the catacombs, the cistern; orbit and walk):
- **F in a tube stands you on the surface.** core/host's walk takes the highest floor at the camera's x, z (`C.standY`), so
  F from "The braid" (y -10) put the walker in the forest at y 57. The follow camera stands on the floor under the eye
  instead. Fixing F itself is an edit to `90-host-camera.js`, which is on 408 pages (left, below).
- **The orbit camera in a tube sees through the rock.** Past the streamed chunks (120 m) there is no rock mesh, so from
  "The braid" and "The outer tube" the city's buildings and the forest's roots show from underneath, floating in black.
  The orbit has no collision and no idea it is in a void (`camGroundY` only lifts its floor).
- **The ways are too narrow for a boom.** Of 390 points on the ways at eye height, 326 (84 %) have under 2 m to the rock
  and 21 under 1.2 m. On Dhelv's ways the follow camera is over the shoulder or first person. Only the hall, the square,
  the wells and the cistern give it a boom. This is the Tungang plan's 6.4 rule ("public ways are camera-sized") seen from
  the other side.
- **The maps do not say which level you are on.** core/host's minimap (M) draws no height at all. Dhelv's own map (K)
  brightens the ways within 6 m of the camera's height but marks nothing above or below. Where the braid crosses under the
  ledge's tunnels, the two read as one junction.
- The catacombs and the cistern read well in both views: lit, one level, a clear end.

**The rock cut** (`core/terrain/host/39h-core-cavern-cut.js`, lifted from `kits/zeijani/src/40-zj-cave.js`):

```js
KCAVERN.cutLayer(rockMaterial)                                   // the KHOOK layer 'kcavern-cut'
KCAVERN.drawRock(C, {material, attrs: ['aKCut'], weight: KCAVERN.cutWeight(C, {own(P)})})   // each vertex: its own void's floor
KCAVERN.cut.set(on), .above(2), .boxes([{x, z, hw, hd, ry, floor, top?}]) (32 at most), .discards(x, y, z, ownFloor)
KCAVERN.cutFloor(P)                                              // room y, stair foot, hall floor, tube's lowest point, shaft y0 - 2
cutaway: {rock: {key: 'h', above: 2}}                            // 99-host-section's mode: H, no planes, every level at once
```

In the cut, each void's rock opens `above` metres over that void's own floor, so every level of a hold shows at once, each
room with its walls to head height. Rock that is no void's own (the ground, a mass, a monolith) opens only inside the cut
boxes, which are Dhelv's carved sites near the camera. `node core/terrain/test-cavern-cut.js`: 25 checks with negatives,
including the layer compiled on the real r128 chunks. `tools/check_core_use.py` has a `rock-cut` rule now, so a new copy of
the cut fails; Zeijani's fork is baselined.

## The test page

`core/host/underground/` (`python3 build.py`, `python3 check.py`): a small hold on KCAVERN. It has three decks 4.5 m apart,
an 8 m gallery, stairs in from the side, a lift shaft to the surface, a natural hall with rock pillars and ropes, and a
1.6 m narrow way. `check.py` runs 33 checks, each with its negative, plus the harness's universal asserts. GPU-verified on
both lanes: 33 of 33 on the Arc and on the RTX, `gpu-renderer` named, every program linked. The checks:
- cam-not-in-rock along 11 stops, where the arm asked for would be in rock at 2 of them;
- first person in the narrow way, the slow ease-out after it, the whole arm in the hall;
- the pitch limit under the sets' ceiling;
- a rope on the line never shortens the arm; counted solid it would (1.67 m), and a crate does (0.93 m);
- the fade's segment, and the x-ray on the walker;
- the deck cut: the deck above hidden, clipped above the cut and not below or outside, caps on and gone, the badge;
- the band's plane over the eye, the section's sides, the slab's union;
- the rock cut: on with no planes, a wall over its floor + 2 opened and under it kept, no caps, off;
- the map's band and the export.

**On a cave page: the Hearths' camera station** (`biomes/hearths/stations/camera`, page `hearths-camera.html`, with the
Hearths session's yes). The station is the hold, its base (base chains are new in `biomes/hearths/build.py`), plus one fragment,
`98z-host-underground.js`. That fragment adds the follow camera on `CAVE.C.sdf`, the band, the section, the caps and the fade
on the crystals to what the take is handed. `"underground": true` in its `station.json` takes the files. `hearths-crystals.html`
and `hearths-hold.html` rebuild byte-identical. Its `verify.py --assert` passes on the Arc (its checks, their negatives and
the universal asserts). In the cave (116 voids) `C.sdf` costs 0.006 to 0.05 ms. Following round the landing pool, the arm
stays at its full 4 m with at least 1.12 m clear of the rock.

`node core/host/test-follow.js` (24 checks) and `node core/minimap/decks/test-minimap-decks.js` (27) are the data side.

## Godot 4.7 (kits/tungang/PLAN.md 6.6, as built here)

| Piece | three.js here | Godot |
|---|---|---|
| Follow camera | sphere-marched `o.solid` | `SpringArm3D` with a `SphereShape3D` (r 0.3) against the exported cavern mesh's `ConcavePolygonShape3D` (the walker needs it anyway); thin things on a collision layer the arm's mask leaves out; a `ShapeCast3D` straight up for the ceiling, its `get_closest_collision_safe_fraction()` the `hc`. The brief/dwell spring (`KHOST.arm.step`) is a dozen lines of GDScript on the arm's `spring_length`; port `KCAVERN.sdf` only for a parity test |
| Deck cut | 99's planes + deck visibility | decks hidden by their tag groups (`visible`, or the camera's `cull_mask`), with `cast_shadow = SHADOWS_ONLY` so a hidden deck still shades the one below (three r128 cannot: a hidden deck casts nothing here) |
| Caps, band, section, slab | material clipping planes | one shared shader include (world position, `discard` past the planes, `if (!FRONT_FACING) ALBEDO = cap`), since Godot has no material clip plane: the rock and the kits' shaders include it; plain `StandardMaterial3D` pieces in a cut deck are hidden by group |
| Dither fade | `KFADE.add` (Bayer 4x4) | `distance_fade_mode = PIXEL_DITHER` on the occluders, or `TRANSPARENCY_ALPHA_HASH` with an alpha from the same segment test in a shader |
| X-ray | stencil pre-pass + GreaterDepth | `BaseMaterial3D.stencil_mode = STENCIL_MODE_XRAY` (4.5+, experimental: test it in the port first, Compatibility included) |
| Map | `KMAP.export()` with heights, bands, marks, schematic | a `Control`'s `_draw()` from the export: the band filter by `heights`, arrows by sign, the line map from `schematic.nodes`/`edges` |

## Left

- **Zeijani and Dhelv on the core rock cut**: they keep their fork. Adopting it is three edits, listed in
  `kits/zeijani/KNOWN_ISSUES.md`.
- **The rock cut on the Hearths station**: it is not on. The Hearths' `84-host-rock.js` fixes drawRock's attributes
  (`aGyp`, `aIron`), and a natural cave has no decks: the band is its cut.
- **core/host's F** stands the walker on the highest floor at x, z. The fix belongs in `90-host-camera.js` (408 pages), so
  it waits for the next all-builds rebuild (TODO.md's ride-along list).
- **The inspector's picks** do not filter clipped hits yet. `KHOST.section.clipped()` is the filter, and 93 should call it.
  That is a change to `93-host-inspect.js` (also on every FULL page).
- **Ghosted decks** (the decks above as a faint outline, not hidden) are not built. Hidden decks cast no shadow in three
  r128.
- **Dhelv**: the core/biome `stemClump` leak, above. Dhelv does not opt in to any of this yet (its V is its nav graph and its C
  its own cut-away: `follow.key` and `section.key` take other keys).
- **`check_stale`**: adding files under `core/host/` changes the folder listing that every build importing `host.py`
  records, so those builds read stale with no page changed. Recorded with `--write-baseline` (commit message), for their own
  rebuild turns.
