# Krator Ancient Port

Modular port segments and vessels for an Ancient port, tiling along a coast.
A sibling of `kits/ancients/`, built the same way: `src/` fragments are
concatenated in filename order into one page per target. **Read
`CONTRACT.md` (the law), then `API.md` (the contract as built).**

## The loop

```
python3 build.py                          # every target under targets/ -> dist/<target>.html
python3 build.py --target segment         # just one
python3 jscheck.py .syntax-segment.js     # does it PARSE? ~5 s. Every build.
python3 verify.py dist/segment.html --assert --views "Overview,Intact" --out shots/seg
./run.sh log_seg dist/segment.html --assert --all-views --out shots/seg    # background it
python3 verify.py dist/segment.html --cam=-880,320,6.2,-880,0,6 --out shots/x   # a custom camera
```

`--cam` takes `cx,cy,cz,tx,ty,tz`; write it as `--cam=...` when the first
number is negative, or argparse reads it as a flag. A 16-view run of the
showcase takes about two minutes here. SwiftShader flakes about one run in
seven with a null shader-info-log TypeError: re-run before reverting.

**READ THE SHOTS every round.** No invariant sees a floating deck, a camera
inside a wall, a rail across a basin or a hull through a quay. The top-down
`--cam` (camera straight over the point, target 0.2 m off in z) is the one
that finds footprint and junction mistakes.

## Developing a segment or a vessel

1. Take your seed block and fragment number from `API.md` ("Seed blocks").
2. **New segments are at most 110 m wide** (`PORT.WMAX_NEW`); the anchors
   `quay`/`pier` are 220. Use `opt.W`, never a literal width.
   Write `src/<NN>-<prefix>-<key>.js`: stamps, a top-level
   `function build<Name>(scene,gx,gz,d,opt){reseed(<N>+d); ...}`, and a
   column-0 `PORT_SEG({key:'<key>', ...})` (or `PORT_VESSEL`). Copy the shape
   of `src/80-pq-quay.js` (small) or `src/81-pp-pier.js` (large).
3. Make your dev target: `cp -r targets/segment targets/<key>` and set
   `PORT_ONLY='<key>'` and `TITLE` in its `89z-rows.js`. It shows your key in
   every decay, flanked by 110 m plain quays (`quay110`; west flush, east set
   back 20 m), with
   natural coast beyond. `targets/edges/` (same edit) shows it against every
   side case: steps of 40 and 20 m both ways, open sea, natural land.
4. `python3 build.py --target <key>` + `jscheck.py` + `verify.py --assert`,
   read the shots, repeat. Commit after each verified milestone.
5. The showcase needs no edit: it lays out whatever is registered (coastal
   segments in the runs, `place:'land'` blocks behind them, `place:'sea'`
   platforms off the great pier). A land or sea key's dev target (the same
   `segment` / `edges` copy) shows it behind / off plain quays and the pier.

Do not edit the shared fragments (`00`-`74`, `90`-`99`) from a segment task.
If a shared helper is wrong or missing, say so in `KNOWN_ISSUES.md` and
work around it inside your own fragment.

## Files

* `CONTRACT.md` - the project contract every port agent reads.
* `API.md` - coordinates, registration, stamps, helpers, budgets, seeds.
* `NOTES.md` - what was done, round by round. `KNOWN_ISSUES.md` - what is not.
* `src/` - fragments. `targets/` - `showcase`, `segment`, `edges`, `harbour`
  (a Long-Beach-like composition: land blocks two deep, platforms off the
  pier), and the agents' dev targets.

## In the page

Click anything to inspect it: a REGISTER volume's name when the point is in
one, otherwise the segment or vessel that built what was hit, its decay and
its part (every mesh and instance is tagged). `n` toggles night, `b` (or the
"Segment bounds" button) the footprint overlay: every placed segment outlined
at deck height, coloured by placement (coastal amber, land block green, sea
platform cyan), land edge brown, sea edge blue, quay line white, labelled
with its key. Presets may switch either (7th / 8th element); verify can call
`_api.setBounds(true)` or `_api.inspectRay(...)`.
* `refs/` - the reference contact sheets (mood, never copy).
* `dist/`, `shots/`, logs, `.syntax-*`, manifests are build outputs and are
  git-ignored: parallel agents would otherwise conflict on every merge.

## Copied from the ancients kit

From `kits/ancients/src/` at commit `e498f24` (the last commit touching it on
`claude/laughing-bohr-1zdca5`), **byte-identical**, so they can be re-synced
by copying again and diffing:
`00-head.html 10-core.js 12-stats.js 20-textures.js 22-materials.js 30-kit.js
32-surfaces.js 34-kitdefs.js 36-decor.js 38-helpers2.js 50-registry.js
54-mat-concrete.js 68-mat-v5.js 69-mat-salvage.js 99-tail.html`, and
`three.min.js jscheck.py shotdiff.py`.

**Adapted** (diff against the ancients copy before re-syncing):
`90-scene.js` (no ground plane, no ROWS: stamps -> terrain -> builders ->
kbake), `91-probe.js` (budget classes from the registry, merged-mesh vertex
sampling, `_api.extra()` port checks), `92-camera.js` (night hooks, ground
clamp, zoom range), `build.py` (targets discovered, port rules),
`verify.py` (runs `_api.extra()`), `run.sh` (takes the page as an argument).
Not copied: the 33 building builders, the biome fragments, `skyPlinth`,
`toppledUpper`.

## Level of detail

The page takes the shared LOD from `core/lod/` (read `core/lod/README.md`): `build.py` adds `09-lod.js` and
`97-lod-auto.js` to the fragment list, and 97 applies it to the finished scene. Big merged meshes are cut into
frustum-culled chunks that switch to clustered proxies with distance; instanced sets keep one draw call and drop their
smallest instances by screen size. The originals stay the raycast targets, so the inspector and `_api` see full detail.
The `LOD` panel (bottom right; `l` toggles it, `measure` renders the view both ways) reads draw calls and triangles.
`LOD.enabled=false` (or `?lod=0`) puts back the exact scene the build made; `LOD.stats()` and `LOD.measure()` are
there for verify.

The port sets `window.LOD_OPTIONS` in `92-camera.js`: loose clutter (rubble, moss, planks, tyres) drops at 2 px, and
the leaf cards (the tree canopies, the hinterland's texture from far off) stay down to half a pixel.

Measured 2026-10-01, 1000x640, SwiftShader on a shared 4-core machine (`LOD.flush()` then `LOD.measure()`; triangles and
draw calls as three.js counts them. Frame times were too noisy under the shared load to quote):

| View | LOD off: calls / triangles | LOD on: calls / triangles |
|---|---|---|
| `showcase` Overview | 879 / 9.06 M | 777 / 1.09 M |
| `showcase` Eye level on the quay | 693 / 8.98 M | 659 / 2.42 M |
| `showcase` From the sea | 369 / 8.78 M | 348 / 2.14 M |

Most of the saving is the terrain: 29 strips of 216k triangles across the 23 km grid, whose refined lines run out to
the horizon. It is cut into chunks and simplified with distance; the chunks of a strip at one level are drawn
as one (one draw per level in view), so LOD now saves draw calls too (it cost up to 110 more when each chunk was its
own draw). The views look the same with LOD on and off at eye level; from the overview the far terrain is
simplified and the smallest clutter is gone; from the sea, thin far lattices (the west
end's cranes) lose some members. Picking (`_api.inspectRay`) and `regOccupancy` give the same answers.
