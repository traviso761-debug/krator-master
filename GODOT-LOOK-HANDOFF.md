# The Godot look: handoff (2026-11-24)

For whoever picks this up after Stage 8. The plan is `GODOT-LOOK-PLAN.md`; this says where it stands, what the
all-builds rebuild has to do for it, and what only the GPU lanes can settle. Branch `claude/krator-graphics-quality-k24ni6`.
Nothing here was timed: it was all built in a cloud container on a software renderer.

## 1. Where it stands

| Step | State | Where to read |
|---|---|---|
| 1 Cost, 2 Light, 3 Surface | built | plan 14.3; `godot/README.md`, "The look"; `godot/CHECKLIST.md` section 8 |
| 4 The cooks, 6 Air, 7 Dressing | built | plan 14.4; `CHECKLIST.md` section 9 |
| 9 Godot 4.8 | switches only; **4.8 was never run** | `KratorLook.newer`; `CHECKLIST.md` section 9, last item |
| Section 13 (what the exporters carry) | most of the source and tests; three small Godot cases; **no page rebuilt** | plan section 13, the table "Where each stands" |
| 5 True maps, 8 Form, 10 Every case | not started | plan section 14 |

## 2. What the all-builds rebuild must do for this

Shared source changed and its pages were left as they were, by the owner's choice (source and tests first). **Every page
that takes these files is behind its source**, and `check_stale` will say so until they are rebuilt:

| File | Reaches (`python3 tools/reach.py <file>`) | What changed |
|---|---|---|
| `core/export/07-core-export.js`, `10-core-export-scene.js` | 81 pages, 10 build commands | a material's `side`, mirrored triangles turned over, `closed`, the optional `marks` section, a second UV set in the glb, `EXPORT.closed` |
| `core/engine/30-geo.js`, `36-def.js`, `90-scene.js` | 88 pages, 18 build commands | the export form (`setForm`, `?form=1`): chamfered box and beam, out of true, the height field, `formMarks` |
| `core/catalog/krator-furniture-core.js`, `-runtime.js` | every furnished build | `KF.setForm`: chamfered box, grain axis |
| `core/biome/20-core-kit.js`, `42-core-export.js` | 540 pages, 231 build commands | `BIO.setForm` / `?form=1`: wind stiffness and phase; carried through a tile's compaction |
| `kits/eternian/src/93e-et-export.js` | the Eternian page | writes the fields, `closed` and the marks |

Each addition is **off unless asked for**, so a rebuilt page should draw what it drew:

1. Rebuild everything (`python3 tools/test_all.py`), then `python3 core/engine/fingerprint.py`: every page must read
   `same`. `kits/scyvoi` was rebuilt on the new engine here and did. The catalog and the biome core were **not** proven
   that way on a page: their node tests pass (`kits/catalog/tests/test-form.js`, `test-segments.js`,
   `core/biome/test-wind.js` and the rest of `core/biome/test-*.js`), and `core/furnish/fingerprint.py` is the page-level
   check for the catalog.
2. `python3 tools/port_baseline.py`, and rewrite the baseline: every page's bytes change (the source is in the page),
   so this is the usual whole-baseline rewrite of an all-builds rebuild, after the fingerprints say nothing moved.
3. The three Godot cases below were exported from pages built here and **not committed**. Re-export them from the
   rebuilt pages (the commands are in each test's header) and run their tests.

## 3. The export form, and the cases that carry it

A page opened with `?form=1` builds for a game engine: `core/engine` chamfers boxes and beams by the material key's
kind, leans each building and writes the height field; `core/biome` writes the wind fields. Nothing calls
`KF.setForm` on a page yet (the catalog's chamfer and grain are reachable only from code).

| Case | From | What it proves | Test |
|---|---|---|---|
| `godot/data/world-eternian-form` | the Eternian sheet's canal tile, `?form=1` | chamfer (44,417 triangles to the plain tile's 32,103 on about the same vertices), the height field read by the weathering's foot band, `closed` | `tests/export/eternian_form_test.gd` |
| `godot/data/world-eternian-kiln` | the kiln and tile works, `?form=1` | four real smoke marks, read by the air as emitters and fog volumes | the same test |
| `godot/data/world-sedesert-wind` | a 100 m tile of the SE desert, `?form=1` | wind fields in the glb; bark sways by them | `tests/export/sedesert_wind_test.gd`; `tests/shaders/cook_air_gpu_check.gd` draws it |

Learned from the frames, already acted on: rendered walls (plaster, render, lime) are **not** chamfered, because walls
are drawn as panels that abut in one plane and a chamfer on each cut a groove across the wall; the foot band is walls
only; a building's lean is in its own frame (a street was first taken for one building).

## 4. Still to write (section 13)

- **Baked occlusion and the edge field**: the height field's two companions. Nothing computes them.
- **Leaves on the wind fields**: only bark (buckets) carries them; instanced leaves sway by their own rule, so the
  bark's sway is held to 3.5 cm at a twig's tip. P4's three levels want both on the same fields.
- **A grain reader in Godot** (M12), and a route by which a furniture batch's `aGrain` reaches a Godot case.
- **A sill's leak on real data**: the decals read sill marks, but the Eternian sheet records no window (`windowAt`).
- **The catalog's form on a page** (a `?form` switch for furnished builds), kits' own boxes, ridge sag and bowed beams.
- **The Godot packs** (`tools/textures/pack.py` already has `packFormat: 2`): making them and pointing the export at them.
- **An opening's mark on the wall's own vertices** (only the sill's place exists).

## 5. What only the GPU lanes can settle

`godot/CHECKLIST.md` sections 8 and 9 are the run lists. The ones that decide something:

- The route harness on each lane, `--look=legacy` against the tier: GPU and CPU time, and the primitive caps. Measured
  here in primitives only: the high tier is under its 20 M at the avenue, the east village and Tsomo (11.8, 13.5,
  5.2 M); **the low tier is over its 10 M at the avenue and the east village** (10.8, 11.9 M).
- A place opening cooked against `KRATOR_COOK=0` (headless here: 47 s to 7 s), after `tools/cook.gd` on the case.
- Levels of detail by eye while walking, above all at the low tier's 2 px.
- **Shafts** were never seen: look toward the sun through the galleries and through trees at 16:20 and at dawn.
- Emitters, fog volumes and the plume's tuning; how much water stands when wet; the dressing against
  `VISUAL-BAR.md`'s bare-ground gate.
- **Godot 4.8**: every test, then the route with `--contact-shadows --ao-multibounce`. `look_test` prints which
  properties `KratorLook.newer` found; if none on 4.8, the words in `NEWER_WORDS` are wrong (they were not read from a
  4.8 build: the beta could not be installed in the session that wrote them).

## 6. Things that will trip you

- **`.uid` files.** `godot --headless --path godot --import` writes `.uid` files for ten older scripts and shaders that
  have none in the repo (`kinteriors_light.gd`, `library_interior.gdshader`, `oidong_traffic_test.gd`,
  `stage7_interiors_test.gd`, `relief/wland|wmicro|wsmooth|wstreams.gd`, `terrain/kstacks.gd`, `kstacks_test.gd`). They
  were deleted before each commit here, by name. Commit them once or keep deleting them; do not delete by a glob
  (`relief/w*.gd.uid` also matches four tracked files).
- **The cook's cache** is on wherever a window is drawn and off headless: a GPU run fills `user://krator-cook`
  (about 250 MB a place, no size limit; `tools/cook.gd -- --clear`). `KRATOR_COOK=0` for a run without it.
- **A page that embeds `core/export`** uses its own copy at export time: after changing the exporter, rebuild the
  page before `harness.py export`, or the old exporter writes the case.
- **Like for like.** Two frames compare only if the same number of frames ran before each (`--fixed-fps 10` pins the
  wind's clock to the frame count) and no source changed between them. Both mistakes were made here, and both looked
  like a finding until they were re-run.
- **A tile keeps a triangle by its centroid.** A large ground triangle near a tile's edge can be in one export and out
  of the next when anything moves a vertex; it looked like a z-fight here and was not.
- Two Godot tests fail on the tree before any of this and still do: `kchar_test` (63 failed) and `wresidual_test`
  (it needs arguments).
