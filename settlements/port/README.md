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
5. The showcase needs no edit: it lays out whatever is registered.

Do not edit the shared fragments (`00`-`74`, `90`-`99`) from a segment task.
If a shared helper is wrong or missing, say so in `KNOWN_ISSUES.md` and
work around it inside your own fragment.

## Files

* `CONTRACT.md` - the project contract every port agent reads.
* `API.md` - coordinates, registration, stamps, helpers, budgets, seeds.
* `NOTES.md` - what was done, round by round. `KNOWN_ISSUES.md` - what is not.
* `src/` - fragments. `targets/` - `showcase`, `segment`, `edges`.
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
