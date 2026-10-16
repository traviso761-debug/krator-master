# The character kit in Krator

Start at `kits/characters/README.md` (the pipeline table, the record format, every system), then `KNOWN_ISSUES.md`
(what is accepted as is: don't "fix" those without asking) and `INDEX.md` (fragments and their sections).

## Where things are

| Path | What |
|---|---|
| `kits/characters/tools/mpfb_build.py` | Blender: builds a body, loads every item, exports GLBs and the per-slider deltas (`morphs.npz`) |
| `kits/characters/tools/make_garments.py` | Blender: the generated culture clothing (lofted round the A-posed body, painted, written as MakeHuman clothes) |
| `kits/characters/tools/make_mpfb.py` | packs each GLB (textures, alpha, hide sets, morph binaries, Godot shapes), retargets the clips |
| `kits/characters/tools/giant.py`, `mods.py`, `arms2.py` | the giants; arm and gill mods; the lower-arm joints |
| `kits/characters/tools/make_props.py` | the hand-held props, modelled in the grip frame |
| `kits/characters/tools/meshy.py` | Meshy API (donors, retexture, animation library); key from `MESHY_API_KEY_FILE` |
| `kits/characters/data/` | sliders, peoples, clips, props, posture, per-body kits and skeletons |
| `kits/characters/src/` | the pages' fragments: `10-rig.js` (records, no three.js), `50-figure.js` (the figure and its per-frame passes), `90-editor.js` (Cosmetic Lab), `92-animlab.js` (Animation Lab) |
| `godot/krator/character/` | the Godot twin (`kchar.gd`, `kchar_figure.gd`); its data under `godot/data/characters/` |
| `kits/characters/prompt-clothes.md` | texture gaps and generation prompts for clothing fabrics |
| `core/materials/library/` | the shared texture sets the garments take (`FABRIC`, `FABRIC_OF`) |

## Commands

```
# asset half (Blender; see setup.md)
blender -b --python tools/make_garments.py -- male|female [--only ids] [--render dir]
blender -b --python tools/mpfb_build.py -- male <export dir>
python3 tools/make_mpfb.py male|female <export dir>
python3 tools/make_mpfb.py giant <the man's export dir>

# pages and checks (in kits/characters)
python3 build.py [--thumbs]
python3 verify.py dist/animation-lab.html --assert
python3 verify.py dist/cosmetic-lab.html --assert
node tests/make-golden.js          # the golden records both runtimes must match

# Godot twin (repo root)
python3 godot/tools/sync_core.py   # copies data/ files the twin reads (add new data files to its list)
godot --headless --path godot --script res://tests/character/kchar_test.gd
```

## Adding something that both runtimes read

A new data file: add it to `build.py`'s data dict and inputs, set the static on `KCharFigure` in both pages' scripts
before any figure is built, add it to `sync_core.py`'s list, and load it in `kchar_figure.gd`'s `load_body`. Tag it
`[G data]` in the README's file table.

## Before each commit

1. Both verify runs, the golden, the Godot test.
2. `python3 tools/audit_port.py kits/characters` and `python3 tools/make_index.py` (repo root); then
   `git checkout settlements/` (those tools touch unrelated files).
3. `git diff --cached | grep -cE "ms[y]_[A-Za-z0-9]{8,}"` must print 0.
4. No uncommitted changes left at the end of a turn: restore stale generated outputs with `git checkout` rather
   than committing them.

## Publishing

The two labs are artifacts with their pieces served beside the page. A page-only change republishes the page file.
Changed pieces: diff `build-manifest.json` against the commit of the last publish and send those files in batches under
about 55 MB. Never remove a published file an older loader still reads until its replacement is up (section 11 of
pitfalls.md).
