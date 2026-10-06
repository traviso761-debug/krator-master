# Krator — notes for Claude

Krator is a set of procedural Three.js worlds (settlements, building kits,
biomes). Each one is built from numbered `src/` fragments by its own `build.py`
into a single self-contained HTML file.

Read `README.md` first: it holds the design rules for every build (tagging,
modularity, the inspector and polygon tools, the standard skybox). `INDEX.md`
says which build holds what.

## Layout

| Path | What |
|---|---|
| `settlements/<name>/` | one world per folder: `src/`, `build.py`, `verify.py`, docs, `dist/` |
| `kits/ancients/` | the Ancients building kit and its per-site targets |
| `kits/ringsea/` | the Ring Sea watercraft kit: 21 vessels, one fragment each |
| `kits/catalog/` | master catalog: asset engine, 1051 furniture pieces in the furniture SPEC shape, one file per culture (plus generic containers, food, drink, supplies and biome fruit). Verified: `build.py`, `verify.py --assert` |
| `kits/interiors/` | `ROOM()` and the furniture placer (engine-neutral, ported from Yuni), a catalog adapter, outline view and cut-away: a verified demo. Read `API.md` |
| `kits/furniture/` | scaffolding only: read `SPEC.md` |
| `kits/motor-vehicles/` | the Motor Vehicles kit: a `VEHICLE` registry on the catalog core, one file per culture (geomancer, republic, iziz, eastabyss, post-apoc: a buggy, an eight-wheeled crawler, a six-wheeler, a caravan truck, a tracked hab), bundled for any world as `KratorVehicles` (`vehicle_bundle.bundle()`), textured from the library as detail maps (`materials.json`, `tex/`). Verified: `build.py`, `verify.py --assert` |
| `biomes/<name>/` | flora and fauna kits on the shared biome core |
| `core/materials/` | material fragments shared by the Ancients-lineage builds (`core/README.md`) |
| `core/terrain/` | carve patches (overhangs on a heightfield), opt-in by any build through `CORE_TERRAIN` in its `build.py` |
| `core/furnish/` | the furniture placement pass (`KFURN`) Girder, Mav's Refuge, Locus, Highlands and Post-Apoc share; `fingerprint.py` proves a change moved no piece (`core/furnish/README.md`) |
| `godot/` | the Godot project (the port spike): importers for each export, shaders, `data/` exports made by `godot/tools/export_spike.py` (`godot/README.md`) |
| `gallery/` | the shareable gallery page and the script that publishes it |
| `host/` | the LAN site server: the gallery plus the World Menagerie's pages (`host/README.md`). The Menagerie is embedded at `host/WorldMenagerie/` as a git subtree. Core never references it: `tools/check_insulation.py` |
| `archive/` | old scratch and exported snippets. Do not build from it |
| `painting-to-3d-world.skill` | a zip. Read `painting-to-3d-world/SKILL.md` inside it before starting a new build or a large expansion |

## Keep token use down

These files are big and generated. **Do not open or grep them:**
`dist/`, `voth.html`, `yuni*.html`, `.syntax*.js`, `.origin.html`,
`three.min.js`, `*.zip`, `shots/`, `archive/`, `host/site/`, `host/menagerie/`,
`godot/data/` (the spike's exports; `.ignore` keeps it out of searches), `host/WorldMenagerie/` (the Menagerie's own source: work on it only when asked; `.ignore` keeps it out of repo-wide searches, so name the path to search it).
Pass `--glob '!**/dist/**'` (or search a `src/` folder) when using Grep.

- **Edit only in `src/` and `targets/`.** The HTML is rebuilt from them.
- **Start at the build's `INDEX.md`,** which lists each fragment, its sections and
  size. Then read the build's `README.md`, `API.md` and `KNOWN_ISSUES.md` as needed.
- **Never read a fragment over ~30 KB whole.** Find the section with
  `grep -n '^/\* ====' <file>`, then read that range with an offset and limit.
- **Change code with targeted edits.** Do not regenerate a fragment to change part of it.
- **Take one screenshot per meaningful change,** not one per tweak.

## Textures (the material library)

`core/materials/library/` and `core/materials/patterns/` hold the shared texture sets (`albedo.jpg`, `normal.png`, `roughness.png`, `meta.json`,
about 3 MB each); `core/materials/PLAN.md` says what each is, and `core/materials/demo/` builds the page that shows them. The images are
binary, so searches skip them. **Open an image only when the task is graphics or performance** (judging a surface, a render run, a texture budget),
and then open the few you need, not a folder. Never read every `meta.json`; read `PLAN.md` first.

**A build adopts the library** through `<build>/materials.json` and `python3 tools/textures/pack.py <build>`, which writes
`<build>/tex/` (commit it); the code is `core/materials/record/` (`KMAT`, `TEX`). Girder is the worked example.

**The images are in Git LFS** (`core/materials/**/*.png` and `*.jpg`, about 570 MB). A clone for non-graphics work can skip them:
`GIT_LFS_SKIP_SMUDGE=1 git clone <url>` leaves small pointer files, and `git lfs pull --include="core/materials/library/<set>/*"` fetches only the sets a task needs.
History was cleaned on 2026-10-05 (old built pages, screenshots and past image versions were dropped); the pre-cleanup history lives in the
owner's `krator-before-cleanup.bundle` and in the other branches on the remote, which were left on the old history.

**If a surface has no good texture, ask the owner to find one or generate one.** Name the gap and, for a generated image, give the prompt
(`core/materials/PLAN.md`, "Prompts for generated sources" has the template and per-culture rows). Do not paper over a missing texture with a
procedural stand-in without saying so.

## Edit requests from the browser

The owner can Alt+click a spot in any world served by `python3 tools/edits/serve.py` and leave a note.
"Apply the pending edits" means: `python3 tools/edits/pending.py`, make each change in `src/`, rebuild, verify,
then `pending.py --done <id>`. See `tools/edits/README.md`.

## Build and verify

```
cd settlements/<name> && python3 build.py            # or kits/ancients, biomes/<kit>
python3 verify.py <built html> --assert ...           # see that build's README
```

Every build is deterministic. After a refactor, rebuild and run
`python3 tools/port_baseline.py`: it compares every built page with `PORT-BASELINE.json`.
Identical hashes prove nothing changed.

**The Godot port.** `GODOT-PLAN.md` is the plan. Each build's `PORT.md` tags its fragments
(`tools/audit_port.py` writes it; keep its Tag and Note cells current when you split or move a
fragment). `build.py` runs `tools/check_port.py` first: a fragment tagged `[G data]` must not touch
the browser. New browser-side code goes in the host fragments, not in data or builder fragments.

## Publishing

Update and republish the Krator Worlds gallery automatically only when a brand new
settlement, kit or biome goes to `main` (see the end of `README.md` and `gallery/README.md`).
A fix to one settlement or biome republishes only that build's files. A wider change
(several builds, shared `core/`): ask the user whether to update the gallery.

## Shared and vendored code

- `core/materials/` holds one copy of the material fragments the Ancients-lineage
  builds share. Those builds' `build.py` read them from there. Edit them there,
  and rebuild every build that lists them.
- `core/furnish/` is one shared copy too: after changing it, run `node core/furnish/test-furnish.js`, rebuild the five
  builds that take it, and `python3 core/furnish/fingerprint.py` (every page must read `same`).
- `core/terrain/36-core-carve.js` is one shared copy too: a build lists it in `CORE_TERRAIN`.
  Edit it there, run `node core/terrain/test-carve.js`, and rebuild every build that lists it.
- Other shared fragments are **vendored**: each build keeps its own copy, and
  `python3 build.py --vendor-check` reports drift from the upstream. Some drift is
  deliberate and recorded in that build's `KNOWN_ISSUES.md`. Fix upstream, then
  re-vendor. Do not silently re-sync a drifted file.
