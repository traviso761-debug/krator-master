# Modularity plan: move shared code off kits and settlements onto core

Part of the kits/settlement rebuild (ROADMAP.md stage 3 and section 10). Written 2026-10-26 from a scan of every
`build.py` (`tools/` has no script for it yet; step 0 adds one). Numbers are path references in build.py files, so
they show what a build *reads*, not what it calls at run time. Check each item against the fragment before moving it.

## Goal

A change to a kit or a settlement touches that build only. Anything two or more builds read lives in `core/`, with
a test and a README, and builds take it by path (never a vendored copy). Dependencies run one way:

    settlements  ->  kits / biomes  ->  core

No kit reads a settlement. No core module reads a kit or settlement (`tools/check_insulation.py` already guards
`host/`; extend it).

## What the scan found

1. **The standard sky is the biggest single leak.** `81-sky.js` (`KratorSky`) lives in `settlements/iziz/src` and
   is vendored or read in place by about 14 kits (scyvoi, islanders, eternian, lizardmen, zeijani, desert-nomads,
   ash-nomads, resources, catalog, interiors, fauna, motor-vehicles, mechs, plus the `--vendor-check` drift
   reports). That one file is why 26 builds point at `settlements/iziz`. `core/atmos` has the skylight, water
   waves and cloud deck but no sky dome, so the "standard skybox" rule in README.md has no core home.
2. **Kits read other kits' engines.** The Scyvoi engine (`10-core`, `26k-kit`, `27-mat`, `30-geo`, `36-def`,
   `90-scene`, `92-world`, `93-anim`, `99-host-take`) is read in place by five kits and vendored (forked) into
   Islanders. Eight kits depend on `kits/scyvoi` and `kits/islanders` is itself depended on by crops, resources,
   eternian and lizardmen. A fix to the engine reaches all of them.
3. **`kits/catalog` is the other hub** (30 dependents) and its registries live in `settlements/voth/catalog`, so
   the catalog depends on a settlement and a settlement on the catalog (`kits/catalog <-> settlements/voth`).
4. **Settlement-to-settlement chains.** Ancients -> Iziz -> Highlands -> Xanadu / Reed Lake / Ys / Mungo (Locus) /
   Verge, held together by vendored fragments (`70-vern-dwellings`, `88y-iziz-matlib`, `81-glow` from Locus,
   `70-biome-nhighlands` from Highlands). TODO.md already records the re-vendor sessions this costs.
5. **Biomes are already clean.** The 25 biome kits take the same 10 to 14 core modules and almost nothing else
   (`hyperjungle`, `necanyons`, `nsemiarid` are the only cross-biome reads). The biome kits are the model to copy.
6. **Backwards edges to fix:** `kits/beast-riders -> settlements/isle-demo`, `kits/ringsea -> settlements/reedlake`,
   `kits/post-apoc <-> core/sockets`, `core/materials -> biomes/sedesert, kits/ancients, kits/ringsea` (the
   vendored-drift notes in `core/README.md`), `biomes/ringisles` and `biomes/dambasins -> settlements/*`.

## Plan, in order (each step is its own commit and leaves every hash baseline unchanged unless stated)

**Step 0: make the problem measurable (small).**
- Add `tools/dep_graph.py` (the scan used for this plan, plus fragment-level reads from `build.py` lists) that
  writes `DEPS.json` and fails `test_all.py` when a *new* backwards edge appears (kit -> settlement, core -> kit
  or settlement, biome -> settlement). Start with the current list as an allow-list so nothing breaks; each step
  below removes entries from it.
- Done when: `DEPS.json` is checked in and the allow-list is the only way a backwards edge can exist.

**Step 1: `core/sky` (the 81-sky.js move).**
- Move `KratorSky` from `settlements/iziz/src/81-sky.js` to `core/sky/` (or `core/atmos/sky/` as an opt-in
  subfolder, as `core/atmos/host` was done, so pooled `core/atmos` builds do not change).
- Every kit and settlement lists it by path in a `CORE_SKY` entry; delete each `VENDORED = {'81-sky.js': ...}` and
  its `--vendor-check` branch. Rebuild everything that takes it (the all-builds rebuild rule in CLAUDE.md) and
  take the TODO.md "ride along" items with it.
- Add `sky` to the `README.md` "CORE MODULES ARE NOT OPTIONAL" table and to `tools/check_core_use.py` so a build
  that skips it fails.
- Done when: no kit's `build.py` names `settlements/iziz`, and the kit -> iziz edges in `DEPS.json` drop to the
  `--kit` vassal builds only (Pylon and Talia, which are a documented contract).

**Step 2: `core/kit` (the Scyvoi engine) .**
- Promote the engine fragments Scyvoi, Islanders, Eternian, Lizardmen, Zeijani, the nomad kits and Resources share
  into `core/kit/`: scene, world, animation, host-take, material and geometry helpers. Kits keep their own
  definitions (`36-def`, the culture files, tents, buildings) and only read the engine from core.
- Do it one kit at a time, Scyvoi first (its pages are the reference), and prove each with the hash baseline;
  expect to find drift between the Islanders fork and upstream, and decide each diff by reading it (as the
  Ancients re-vendor session did), not by overwriting.
- Done when: `kits/*` list `core/kit` and no kit lists another kit's `src/` for engine code.

**Step 3: break the catalog <-> Voth knot.**
- Move the catalog registries and the Voth-building sheet loader so the dependency is `settlements/voth ->
  kits/catalog` only. `kits/catalog/build.py` stops naming `settlements/voth/catalog`; Voth's catalog sheet reads
  the kit's output file instead.
- Split what `kits/catalog` offers into a data side (`core/catalog`: the SPEC shape, registries, asset engine)
  and the culture files (stay in the kit), the same split `core/furnish` made for placement.
- Done when: `kits/catalog` has no `settlements/*` edge.

**Step 4: settlement chains onto core (stage 3, with `core/city`).**
- For each shared Vernacular helper that two or more settlements vendor (`70-vern-dwellings`, `88y-iziz-matlib`,
  Locus's `81-glow`, Highlands' biome fragment): move it to the owning core module (`core/materials`,
  `core/atmos`, `core/biome`) or to the kit that owns the culture, then let the settlements take it by path.
- Order: Locus glow -> `core/atmos`; matlib -> `core/materials`; Vernacular helpers -> `kits/ancients` (they are
  the Ancients' contract, `settlements/iziz/VASSAL-KITS.md`); `70-biome-nhighlands` -> `biomes/nhighlands`
  (already there; Highlands should take it from the biome, not the other way round).
- Keep out of `core/city/` and Voth's layout fragments (`15`, `30` to `35`); the city-layout work owns those.
- Done when: the settlement -> settlement edges in `DEPS.json` are only content links (Voth/Locus lore, the isle
  demo's two towns), not code.

**Step 5: fix the remaining backwards edges.**
- `core/materials` stops naming `biomes/sedesert`, `kits/ancients`, `kits/ringsea` (move the three fragments into
  `core/materials`, finish the drift decisions in `core/README.md`).
- `kits/beast-riders` and `kits/ringsea` stop reading `isle-demo` and `reedlake`; `biomes/ringisles` and
  `biomes/dambasins` stop reading `settlements/*` (their data goes in `openworld/` or the kit itself).
- `kits/post-apoc <-> core/sockets`: the kit takes the sockets module, the module does not name the kit.

**Step 6: keep it modular.**
- `tools/check_core_use.py` already blocks bespoke PRNG, noise, sky and water. Add: a build may not list another
  build's `src/` (only `core/`, its own kit, or a kit it declares in `PLAN.md` "Core adoption"), and a
  `--vendor-check` entry is an error unless the file is in a short documented list.
- New kits start from the nearest finished one *and* the `core/kit` engine; they never fork an engine.

## Order of work and cost

| Step | Reaches | Risk | Rebuilds |
|---|---|---|---|
| 0 graph check | none | none | none |
| 1 sky | ~14 kits + iziz | low (one file, pure) | all builds that draw a sky |
| 2 kit engine | 8 to 10 kits | medium (forks have drifted) | those kits and what bundles them |
| 3 catalog / Voth | catalog, Voth, 30 dependents | medium | catalog dependents |
| 4 settlement chains | ~10 settlements | highest (Ancients chain) | the chain |
| 5 backwards edges | 6 builds | low | those builds |
| 6 guard rails | CI only | none | none |

Run steps 1 to 3 on one branch with one all-builds rebuild (CLAUDE.md "Rebuild what a shared change reaches") and
`python3 tools/port_baseline.py` after each; step 4 waits for the Ancients re-vendor chain to be quiet.

## Not decided (owner)

- Whether the sky is `core/sky` or an opt-in subfolder of `core/atmos`.
- Whether `core/kit` is one module or split (scene/world vs. animation vs. materials).
- Whether the Pylon and Talia `--kit` builds (which build *inside* Iziz's page by design) stay as the one
  allowed kit -> settlement edge.
- Whether to take the step 1 gallery republish with the rebuild (CLAUDE.md "Publishing": ask).

## Caveats

The scan matched path strings in `build.py` only. It does not see reads inside fragments, dynamic paths, or
`verify.py`/tooling, and it counts a path in a comment. Step 0 replaces it with a proper tool before anything moves.
