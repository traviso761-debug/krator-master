# Building a Lizardmen town: the guide (for Gemini, or any builder; 2026-11-17)

This is the recipe for the Lizardmen's towns after Gila: **Tuatara, Komodo, Iguana and the Tubes**. Each town has its own
plan (`settlements/<town>/PLAN.md`), its proposed spec (`settlements/<town>/spec.json`) and two sheets
(`settlements/<town>/sheets/country.png` and `village.png`). This file is what they share: the order, the files, the
commands, the tests and the traps. **Gila (`settlements/gila`) is the worked example: when in doubt, do what Gila does.**
Basilisk, the capital, is planned apart (`settlements/basilisk/PLAN.md`) and is not part of this guide.

Everything in the town plans is *proposed* until the owner answers their questions. Build in this order, one town at a time,
committing each before starting the next:

| Order | Town | Why this order |
|---|---|---|
| 1 | **Tuatara** | the nearest to Gila: a surface village on savanna, like Gila but with copper mines and cisterns instead of a lake |
| 2 | **Iguana** | flat and simple; it adds the Great Granary and the watch on the Pile |
| 3 | **Komodo** | a steep shore, a sea on `core/water`, and a placer camp 12 km away (the near grid run east to hold it) |
| 4 | **the Tubes** | a cavern town: a different builder (`core/city/cavern`, as Loj Twenny is built), not the surface one |

## 1. Read first

- `CLAUDE.md` (the repo's rules; section 2 below lists the ones that bite here) and `README.md` (the design rules).
- `kits/lizardmen/DESIGN.md` (the look and the lore), `README.md` (what pieces the kit has), `KNOWN_ISSUES.md`.
- `LORE.md` section 6.20 (the Lizardmen).
- `core/simulation/PLAN-LIZARDMEN.md` (the order of the work; step 10 is these towns) and `core/region/data/lz-tune.js`
  (`LZ_TUNE`: each town's people and what it makes a year; **the town's records must match it exactly**).
- `settlements/gila/PLAN.md`, `README.md`, `KNOWN_ISSUES.md`, and its `src/`: the model for everything below.
- This folder: `82-lzv-site.js` (the site: ground, spiral, ley line, sites, census), `90w-lzv-world.js` (the drawing: ground
  on `KGROUND`, water on `core/water`, plinths, views), `99-m-lzv-probe.js` (`window._lzv` for the verify), `lzv.py` (the
  build), `lzv_verify.py` (the GPU verify), `lz-tune-checkTown.js` (`LZ_TUNE.checkTown`). **These were generalised from Gila's
  own fragments and parked before they were ever built or run (README.md here). Expect to fix them as you go.**

## 2. The repo's rules that bite here

- **Edit only `src/` (and this folder).** Pages and `gen/` are generated. Build through `python3 tools/build.py <folder>`.
- **Core modules are not optional** (`README.md`, "CORE MODULES ARE NOT OPTIONAL"; `tools/check_core_use.py` checks it): the
  ground on `KDRAWN` and `KGROUND`, water on `core/water`, placement on `core/rand` (`KRAND`) and `core/space`, every placed
  thing registered in `core/tags` before it is drawn, the streets on `core/city`, the outworks on `core/hamlet`. No copied
  PRNG, noise, sky, water shader or `getImageData`.
- **Same on every machine and in Godot:** text-mode `open()` names `encoding='utf-8'` (and `newline='\n'` when writing);
  paths written into a page use `/`; a numeric default is `x == null ? d : x`, never `x || d`; a seed from `KRAND.hash` of
  (world, cell, index, salt), never from how many draws came before; derive a child seed with `KRAND.child` (nearby seeds
  correlate when XORed).
- **No trailing `//` comments in fragments** (a packed page can swallow the line): use `/* */`.
- **Fragment tags** (`PORT.md`, `tools/audit_port.py`): records and site logic are `[G data]` (no three.js, no DOM); drawing
  goes in the host or world fragments.
- **A new build lists itself** in `tools/checks_optin.json` (every list) and starts its `build.py` and `verify.py` from the
  nearest finished build (here: Gila, through this folder's shared ones).
- **Textures:** the town's `materials.json` names library sets that exist (`core/materials/library/`); its `tex/` comes from
  `python3 tools/textures/pack.py settlements/<town>`. In a fresh worktree pull the sets first
  (`python3 tools/lfs_needs.py settlements/<town> --pull`): pointer files build a black page. A missing texture is asked of
  the owner (`core/materials/PROMPTS-NEEDED.md`), never faked.
- **GPU verify:** `KRATOR_GL=gpu` (without it the harness is SwiftShader and `gpu-renderer` fails); the harness picks a lane
  and queues (`python3 tools/harness.py lanes`); a run with no progress for 25 minutes is killed (rerun it). Never kill a
  process by a match on a session id: by PID or script name only.
- **Commit** with `python3 tools/commit.py -F msg.txt` (a message file). **Do not push**: the owner pushes.
- **Shader compile errors are silent** in r128 (the mesh vanishes, no panel): read the browser console.

## 3. Step S0, once, before the first town: revive the shared builder

1. **The kit's build takes a named core entry.** `kits/lizardmen/build.py` sorts a page's files by base name, so
   `core/region/data/lz-tune.js` (base name `lz-tune.js`) would land after the probe `99-m-lzv-probe.js`, which reads it.
   In `sources()`, where `SET_CFG['core']` is read, accept an entry `"path=name"` (the file at `path`, sorted as `name`):
   `p, _, nm = entry.partition('=')`, key `nm or os.path.basename(p)`. A town then lists
   `"core/region/data/lz-tune.js=85-lz-tune.js"`. **Without `--settlement` the kit's page must stay byte-identical**: build
   it before and after and compare the hash (`python3 tools/port_baseline.py`), then rebuild Gila and check its hash too.
2. **`LZ_TUNE.checkTown`.** Paste `lz-tune-checkTown.js`'s function into `core/region/data/lz-tune.js` (inside the IIFE,
   after `T.byKey`). Run `node core/region/tests/test-lizardmen.js`: all 15 checks pass and no number moves (the function
   is only added). Add a check of your own with a negative: a records object with a wrong caste total must fail.
3. **Gila's pieces by path.** The builder places `gl-well` (and the towns' plans use `gl-tank`): those defs live in
   `settlements/gila/src/66-gl-works.js`. Each town lists that file in its `settlement.json` `"core"` (by repo path).
   (Later, when the owner agrees, they move into the kit: a question in each town's plan.)
4. Commit S0 alone ("kits/lizardmen/settle: revived; the kit's build takes path=name; LZ_TUNE.checkTown").

## 4. One town: the files

Make `settlements/<town>/` (the plan, spec and sheets are there already). The prefix and the seeds are in its spec.json
(`tu` Tuatara 8301-8399, `km` Komodo 8401-8499, `ig` Iguana 8501-8599, `tw` the Tubes 8601-8699; check a seed is unused with
`grep -rn "seed:83" kits/lizardmen/src settlements/*/src` before taking it).

| File | What |
|---|---|
| `build.py` | Gila's header and imports (`buildlib.through_tools_build(__file__)`, `build_sources`), its `CORE_TAKEN` tuple (the modules the page takes, which `check_core_use.py` reads), then `import lzv; lzv.build(HERE, pin=(x, y), near=(...), far=(...))` with the pin and the grids from `spec.json` `_pin` (put `kits/lizardmen/settle` on `sys.path` first) |
| `verify.py` | three lines: `sys.path` to `kits/lizardmen/settle`, `import lzv_verify`, `lzv_verify.main(__file__)` |
| `settlement.json` | Gila's, with `"key"` and `"out"` the town's, and `"core"`: Gila's list, plus `"settlements/gila/src/66-gl-works.js"`, `"kits/lizardmen/settle/82-lzv-site.js"`, `"kits/lizardmen/settle/90w-lzv-world.js"`, `"kits/lizardmen/settle/99-m-lzv-probe.js"`, `"core/region/data/lz-tune.js=85-lz-tune.js"`; Tuatara and Komodo add `kits/resources`'s field files (`kits/resources/API.md`: `45r-res-field.js` and what it needs) for `KRES.near`; `"scoped": ["69k-kcity-bundle.js"]` |
| `materials.json` | Gila's shape, with the town's four ground layers (`spec.json` `layers`: all exist in the library) |
| `src/80-<p>-records.js` | `var <P>_REC` (`[G data]`): Gila's `GL_REC` shape (census by caste, crops, works, the goods by season). At least what `LZ_TUNE.checkTown` reads: `key`, `castes` (`{caste, share, people}`, the people summing to the tune's), `works` (`{id, good, yearT, key}`, one good for each the tune's `make` names, making **exactly** its tonnes) |
| `src/81-<p>-spec.js` | `var LZV_SPEC = {...}` from `spec.json` (4.1 below) |
| `src/89-rows.js` | Gila's (the kit sheet's showcase rows off: `FAMILIES = []`) |
| `README.md`, `KNOWN_ISSUES.md`, `INDEX.md`, `PORT.md` | as Gila's (`python3 tools/audit_port.py settlements/<town>` writes `PORT.md`; keep the Tag cells true) |
| `tools/checks_optin.json` | add the town to every list |

### 4.1 spec.json into LZV_SPEC
- **Copy every key that does not start with `_`.** Keys starting with `_` are the plan's notes (the pin, the census, the
  derived spiral numbers, the ley line's bearing, what is left to resolve).
- **The frame is the page's:** x east, z **south**, metres from the pin. The sheets are drawn north up (v = -z).
- `spiral.axis` is in degrees in that frame (`th1`); the mouth opens on `+e2` (`th1 - 105` degrees). Leave `axis` out and
  the builder takes the level contour at the pin.
- `views[].from` is the camera's offset from `at` (x, up, z).
- **Add `records: <P>_REC`** (the records object from `80-<p>-records.js`): the probe hands `LZV_SPEC.records` to
  `LZ_TUNE.checkTown` for the `records-held` assert, and without it that assert fails.
- **`_resolve`** lists sites that come from data the page has and the plan has not: the copper diggings and the placers from
  `kits/resources` (`KRES.near(x, z, kind, r)`, nearest first). Write them as code at the end of `81-<p>-spec.js`, after
  `KRES` is loaded, pushing into `LZV_SPEC.sites` (`{key, x, z, ry, kind:'works', name}`): one piece a node, none inside the
  spiral's outer radius plus 400 m (`_spiral.outer_radius_m`), none on ground steeper than 25 %.
- **`hamlet`:** where `site` is a string, set `site`, `link` and `resource` from the first resolved node (`link` is the
  spiral's mouth, `spec._spiral.mouth`).

### 4.2 Build, then look
```
python3 tools/build.py settlements/<town>                 # dist/<town>.html
python3 tools/check_core_use.py settlements/<town>
KRATOR_GL=gpu python3 settlements/<town>/verify.py settlements/<town>/dist/<town>.html --assert --views "Overview,The nest hall"
```
Then look at every view in the town's spec with your own eyes (the verify proves the numbers, not the look) and compare the
spiral with `sheets/village.png`: the same axis, the same mouth, the same windings.

## 5. Done, for a town

| Check | Where | Passes when |
|---|---|---|
| the build | `tools/build.py` | no clash, no missing fragment, the port lint clean, under the page cap |
| `check_core_use` | `tools/check_core_use.py settlements/<town>` | every module the kind needs is taken |
| `lzv-laid` | verify | the spiral's 20 blocks, every corner 75 or 105 degrees, each winding 1.25 times the last, every spiral door facing the nest (`inwardBad 0`), the nest hall, the wells, the spec's `expect.keys` placed |
| `on-the-model` | verify | the pin's drawn height within 3 m of the model's (`_pin.model_m`) |
| `people` | verify | within 15 % of the tune's people, every caste present (tune `maxPerArm` and the pools until it is) |
| `water-on-core` | verify | the wells (and the sea or tank) on `core/water` |
| `ley-aims` | verify | the ley stone aims at its reliquary within 0.25 degree |
| `no-overlap`, `on-the-ground` | verify | nothing overlaps, nothing floats or is buried |
| `hamlet` | verify | the outwork laid on `core/hamlet`'s Lizardmen row (`core/hamlet/lizardmen/`) |
| `records-held` | verify, and `node core/region/tests/test-lizardmen.js` | the records match `LZ_TUNE` (`checkTown`) and the tune's tests are unchanged |
| the lints | `python3 tools/test_all.py --no-build` | nothing new over the ratchets |

Then commit (`tools/commit.py`), update `core/simulation/PLAN-LIZARDMEN.md` step 10's row for the town, and stop for the
owner's eye before the next town.

## 6. Traps Gila hit (and how to step round them)

- **`place()` inside a builder sets `y = terrainH(x, z)`** when `o.y` is undefined, even for a nested placement in local
  coordinates (`core/engine/36-def.js`). Harmless on a flat kit sheet; on real ground it lifts a farm's beasts. Gila works
  round it in `90g-gl-world.js`; the shared `90w-lzv-world.js` carries the same work-round: keep it.
- **`KGROUND`'s `kgTri` names a parameter `v1`**, which clashes with r128's `#define v1` when the hook goes on a
  `MeshStandardMaterial` under `scene.environment`. Use `MeshLambertMaterial` for the ground (the shared world does).
- **`core/hamlet/test-hamlet.js` fails on `neouterwall: arrow shafts`**: unrelated to the Lizardmen; do not chase it.
- **The ground is the drawn ground.** Placement, the walk and the eye all read `terrainH` from `KDRAWN`'s triangles; cameras
  stand on the drawn mesh, never on the model's raw height.
- **Black page?** The `tex/` sets are LFS pointers: pull them (section 2).
- **Seeds:** never `seed + 1` for a neighbour; `KRAND.child`.
- **The records are the tune's.** If a number in `LZ_TUNE` looks wrong for the town, ask the owner; do not change the tune
  to fit the page.

## 7. Files here

| File | Tag | What |
|---|---|---|
| `82-lzv-site.js` | [G data] | `LZV_SITE` from `LZV_SPEC` and `LZV_GROUND` |
| `90w-lzv-world.js` | host | the drawing |
| `99-m-lzv-probe.js` | host | `window._lzv` |
| `lzv.py` | build | the shared build (bakes `gen/69g-lzv-ground.js`, seals `gen/69k-kcity-bundle.js`, runs the kit's `--settlement`) |
| `lzv_verify.py` | verify | the shared GPU verify |
| `lz-tune-checkTown.js` | [G data] | `LZ_TUNE.checkTown(rec)`, to paste into `lz-tune.js` (S0) |
| `towns_plan.py` | plan | writes each town's `spec.json` and draws its sheets: `python3 kits/lizardmen/settle/towns_plan.py [town]` |
| `GUIDE.md`, `README.md` | | this guide; the folder's note |
