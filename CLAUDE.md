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
| `kits/catalog/` | harvested master catalog: asset engine, 84 furniture pieces, plants, buildings (unverified) |
| `kits/furniture/`, `kits/interiors/` | scaffolding only: read `SPEC.md` |
| `biomes/<name>/` | flora and fauna kits on the shared biome core |
| `core/materials/` | material fragments shared by the Ancients-lineage builds (`core/README.md`) |
| `gallery/` | the shareable gallery page and the script that publishes it |
| `host/` | the LAN site server: the gallery plus the World Menagerie's pages (`host/README.md`). The Menagerie is embedded at `host/WorldMenagerie/` as a git subtree. Core never references it: `tools/check_insulation.py` |
| `archive/` | old scratch and exported snippets. Do not build from it |
| `painting-to-3d-world.skill` | a zip. Read `painting-to-3d-world/SKILL.md` inside it before starting a new build or a large expansion |

## Keep token use down

These files are big and generated. **Do not open or grep them:**
`dist/`, `voth.html`, `yuni*.html`, `.syntax*.js`, `.origin.html`,
`three.min.js`, `*.zip`, `shots/`, `archive/`, `host/site/`, `host/menagerie/`,
`host/WorldMenagerie/` (the Menagerie's own source: work on it only when asked; `.ignore` keeps it out of repo-wide searches, so name the path to search it).
Pass `--glob '!**/dist/**'` (or search a `src/` folder) when using Grep.

- **Edit only in `src/` and `targets/`.** The HTML is rebuilt from them.
- **Start at the build's `INDEX.md`,** which lists each fragment, its sections and
  size. Then read the build's `README.md`, `API.md` and `KNOWN_ISSUES.md` as needed.
- **Never read a fragment over ~30 KB whole.** Find the section with
  `grep -n '^/\* ====' <file>`, then read that range with an offset and limit.
- **Change code with targeted edits.** Do not regenerate a fragment to change part of it.
- **Take one screenshot per meaningful change,** not one per tweak.

## Build and verify

```
cd settlements/<name> && python3 build.py            # or kits/ancients, biomes/<kit>
python3 verify.py <built html> --assert ...           # see that build's README
```

Every build is deterministic. After a refactor, rebuild and compare the output
hashes against the previous commit's. Identical hashes prove nothing changed.

## Publishing

When a new or changed settlement, kit or biome goes to `main`, update and republish
the Krator Worlds gallery (see the end of `README.md` and `gallery/README.md`).

## Shared and vendored code

- `core/materials/` holds one copy of the material fragments the Ancients-lineage
  builds share. Those builds' `build.py` read them from there. Edit them there,
  and rebuild every build that lists them.
- Other shared fragments are **vendored**: each build keeps its own copy, and
  `python3 build.py --vendor-check` reports drift from the upstream. Some drift is
  deliberate and recorded in that build's `KNOWN_ISSUES.md`. Fix upstream, then
  re-vendor. Do not silently re-sync a drifted file.
