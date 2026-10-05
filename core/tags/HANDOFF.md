# core/tags: handoff for the session that builds it

Written 2026-10-05 at the end of the Godot spike session. Everything below is on `main` (`b52969b8` or later).
**Status 2026-10-05 (later the same day): steps 1 and 2 are done** (`README.md` here is what was built; GODOT-PLAN.md
Phase 2's table has the summary). Steps 3 to 5 are open. The text below is the brief as it was written.

## Read first, in this order

1. `core/tags/PROPOSAL.md`: the record, the ids, the vocabularies, the API sketch, the adapters, the order of
   adoption. **The "Decisions (Travis, 2026-10-05)" section overrides the text above it** where the two differ:
   build to the decisions.
2. `core/furnish/README.md` and `core/furnish/50-core-furnish.js`, `test-furnish.js`: the worked example of a
   shared core module split the way the port needs (a `[G data]` registry fragment, a `[draw]` adapter, a `[web]`
   host fragment, a node test with a digest). Mirror its shape.
3. `GODOT-PLAN.md`: Phase 2 item 3 (the module), rule 4 ("everything placed is registered in `core/tags/` with its
   class and tags, before it is drawn"), and finding 4 of the spike ("no ids or tags on biome items or buckets").
4. `settlements/yuni/src/51-fixtures.js`: `FIX.*` and `KRATOR_EXPORT`, the registry Yuni already keeps with
   deterministic ids (`bld_00042`, `door_00301`). Step 2 puts it on core/tags.
5. `core/rand/08-core-rand.js`: `KRAND.hash(seed, a, b, c...)`, the u32 hash the `uid` is built from. It is
   bit-exact in Godot (`core/rand/krand.gd`), which is the point.

Do not open `dist/`, built pages, `godot/data/` or `shots/` (CLAUDE.md, "Keep token use down").

## The task

**Step 1: the module and its test** (about a session).

- `core/tags/50-core-tags.js` `[G data]`: `KTAGS.create({build})` returning `T` with `add`, `child`, `get`,
  `remove`, `query`, `at`, `audit`, `export`, as the proposal's API sketch. No THREE, no DOM: `tools/check_port.py`
  holds a `[G data]` fragment to that, and `build.py` runs it first.
- `core/tags/52-core-tags-vocab.js` `[G data]`: the one vocabulary table. The cultures come from the catalog's
  `FURN_CULTURES` (`kits/catalog/krator-furniture-core.js:216`) cleaned as the proposal's table says (18 cultures;
  `sahelian` is `yuni` with `style:'sahelian'`; `painted` is the Highlands' tribal culture; `generic` and `scrap` are
  catalog sets, not cultures; `iziz-old` aliases to `iziz` with no era tag). Types: `BUILDING_TYPES` (line 244) plus
  Yuni's `park` and Iziz's `military`, `statue`. Wealth is `poor | middle | rich | null`, mapped on input from the
  catalog's 0..1 by `FURN_TIERS` (line 229). Jobs: `FURN_JOBS` (line 273). Köppen: the list in the proposal.
  Display names from `FURN_CULTURE_INFO` (line 221). The module must not *require* the catalog at run time: copy
  the lists into the vocab fragment with a comment naming their source, and let `test-tags.js` assert they still
  match the catalog's (so drift is a failing test, not a silent fork).
- `core/tags/53-core-tags-host.js` `[web]`: `KTAGS.label(rec)`, the generated inspector text (the proposal's
  "A label, generated": fixed part order, parts with no value left out, `note` appended). Nothing else browser-side
  yet; the inspector hook belongs to `core/host` (Phase 1).
- `core/tags/test-tags.js`, run with `node`: a fixed list of adds, children and removals gives the same ids and the
  same export digest (print the digest; pin it as a constant with a dated comment, as `test-atmos.js` does with
  `GOLD`); each vocabulary check has a negative; the `uid` of a fixed record is pinned; the label of the
  proposal's three examples (gatehouse, bench, plant instance) comes out as written there.
- `core/tags/README.md` in the shape of `core/furnish/README.md`, and a row for `core/tags/` in `core/README.md`.
- Tag the fragments: `python3 tools/audit_port.py core` writes `core/PORT.md`; set the Tag cells (`[G data]`,
  `[G data]`, `[web]`) and a Note each, as the other core rows have.

Decisions that shape the code, restated so they are not missed:

- Two ids per record: the order id `<prefix>_<5 digits>` (one counter per prefix, never reused, a removed record
  keeps its id, a child takes a path `bld_00098.room.4`) **and** `uid`, the `KRAND.hash` of (class, key, position
  rounded to 10 cm). Define exactly how strings and the three rounded coordinates become the hash's int32
  arguments, write it in the README, and pin one value in the test: Godot has to reproduce it.
- A plant is one record per item; an instance is `flora_00012#37` and has no record of its own.
- `life` is one class for citizens and animals (`kind` is the species or role); `fauna` is not a class.
- `tags` is open but checked: unknown keys and values are counted in `audit()`, never thrown.
- Wealth `null` for most civic buildings; civic is a type.

**Step 2: Yuni on it** (about a session).

- An adapter in Yuni (a new fragment next to `51-fixtures.js`, or inside it) forwards each `FIX` building, door,
  window and light into `T.add` / `T.child` with the ids passing through unchanged: `class` building | fixture,
  `kind` the asset key or `'door'`/`'window'`/`'light'`, `at:[x,y,z]`, `ry: yaw`, `size:[w,d,h]`, tags
  `{culture, types, wealth}` with `yuni-court/common/poor` mapped to `yuni` plus a wealth. Yuni's `park` type is in
  the vocab.
- `KRATOR_EXPORT` gains `tags: T.export()` (`format:'krator-tags'`), and `godot/tools/export_spike.py`'s `yuni` case
  writes it beside `fixtures.json`. The Godot side already sets each node's record as metadata
  (`godot/krator/records_import.gd`, `set_meta("krator", ...)`): read `tags.json` there and attach the core/tags
  record instead of the fixtures one. `godot --headless --path godot -- --check` must still load all six cases.
- Proof: `cd settlements/yuni && python3 build.py`, then `python3 tools/port_baseline.py`. If only export-time code
  changed, the page hash may change (the fragment is in the page) but nothing drawn may: take a screenshot before
  and after from the same view and compare, then `python3 tools/port_baseline.py --write`. `T.audit()` on Yuni
  reads zero unknown vocabulary; if it does not, the vocabulary is wrong, not Yuni.

Steps 3 to 5 (core/furnish's `onRecord` into `T.add`, Iziz's `REG`, Voth's `PLACED`, the biome kits) are later
sessions; the proposal has the order. Do not start them in the same session as step 2.

## Conventions a new session needs

- Edit only `src/` and core fragments; every page is rebuilt by its `build.py`, which is deterministic. A build lists
  a core directory the way `settlements/mavs-refuge/build.py` lists `FURNISH_DIR` (a `*_DIR`, the fragment names in
  `DETERMINISTIC` when they draw no random numbers, and the directory in the `for d in (...)` loop where a `src/`
  copy of the same name overrides). Yuni's `build.py` will need `TAGS_DIR` the same way.
- `tools/check_port.py` fails a build whose `[G data]` fragment touches the browser. `tools/audit_port.py` rewrites
  every `PORT.md` and `PORT-INDEX.md`; `tools/make_index.py` rewrites the `INDEX.md` files; `tools/port_baseline.py`
  compares every built page's hash with `PORT-BASELINE.json` (`--write` after a change that is meant).
- Shared core copies have their own tests: `node core/furnish/test-furnish.js`, `node core/atmos/test-atmos.js`,
  `node core/rand/test-rand.js`. core/furnish also has `python3 core/furnish/fingerprint.py` (every furnished page
  must read `same`; it renders pages headless and takes about fifteen minutes).
- The texture images under `core/materials/**` are in Git LFS; a session that does not touch textures can leave
  them as pointers. History was rewritten on 2026-10-05: branches made before that share no commit with `main`
  (this session rebased its 17 commits by matching commit messages; if you meet such a branch, do the same, never
  merge with `--allow-unrelated-histories`).
- Cloud sessions: `.claude/hooks/session-start.sh` installs Godot 4.5 as `godot` on the PATH (`$GODOT` is the binary),
  Python playwright, and the Godot MCP server (`.mcp.json`; `godot/README.md`, "Driving the editor"). Godot's
  `class_name` cache refreshes only on `godot --headless --path godot --import`; the editor skips `godot/data/`
  and `godot/shots/` (`.gdignore`).
- Side-by-side checks of a page against the spike: `python3 godot/tools/compare_shots.py <case>` writes
  `godot/shots/compare/<case>.png`. Yuni's case is records only (translucent boxes, no meshes): it proves tags
  arrive as metadata, not how anything looks.

## State of the Godot spike, so tags work does not reopen it

Done this session (all on `main`): the stage record (`core/biome/44-core-stage.js`: a page's lights, fog,
tonemapping, sky panorama, ground look and environment map, applied by `godot/krator/stage.gd`); the Compatibility
renderer's colour space measured and corrected (`godot/README.md`); LOD render copies dropped on import; world-unit
tiling and derivative normal maps in `library.gdshader`; the panorama starting at each export's edge; main's atmos
wave field and skylight reconciled with it. Four comparison cases match the web pages closely; Yuni's shows boxes.

Open, logged in `GODOT-PLAN.md` finding 14 and not tags work: Girder's braziers burn on the page and sit dark in
Godot (an unlit glow family not crossing); Iziz's library pack is two fauna sheets with no `userData.lib`, so its
export takes no pack; the exporter still writes core/lod's render copies (the importer drops them); the wave field
has no Godot port yet (`core/atmos/GODOT.md` says how: a generated `.gdshaderinc`, two autoload globals, a GDScript
twin with golden vectors); Iziz's panorama starts at its terrain's edge (530 m), not its region's (80 m).

## What done looks like

Step 1: `node core/tags/test-tags.js` prints `all passed`, with the digest, the uid and the three labels pinned;
`core/PORT.md` tags the three fragments; `core/README.md` has the row. Step 2: Yuni's page builds, its export
carries `krator-tags`, the spike's `yuni` case loads it as node metadata, `--check` passes on all six cases,
`T.audit()` reads zero unknowns, and the baseline is updated with a screenshot pair showing nothing drawn moved.

---

## Addendum: the second session (2026-10-05, later), and where to pick up

Everything below is on `main`. Read `core/tags/README.md` and `core/mask/README.md` before this; they hold what was
built. This addendum is the state and the next steps.

### Done

- **core/tags steps 1 to 4.** The module (registry, vocabulary, label, node test, the uid's GDScript twin `ktags.gd`).
  Yuni's fixtures (13044 records); core/furnish's five builds register their furniture (`cfg.tags`, `KFURN.tag`,
  fingerprints `same` on all sixteen loads); Iziz's `REG` (`src/91t-iziz-tags.js`, 783 records on the city) and Voth's
  `PLACED` plus the canton-top footprints (`src/97t-voth-tags.js`, 4165 records) are read in before the first frame.
  Zero unknown vocabulary on every page. `KTAGS.page` is the page's registry; `export_spike.py` writes it as
  `tags.json`. Decisions taken with Travis on the way: Ancients ruins and civic-only buildings take `wealth: null`.
- **core/mask** (GODOT-PLAN.md Phase 2 item 5). `KMASK.canvas`, a drop-in for the mask and class canvases, hard-edged
  by pixel centre; `kmask.gd` replays the ops bit for bit. Iziz, Dalab, Erewhon and Roketstad place from it, the same on
  GPU-canvas and CPU-canvas loads; rubble moved once per city, each with a screenshot pair (counts in its README).
  Caveat: this container's headless Chromium draws 2D canvases in software either way, so the GPU-versus-CPU proof
  has not been run on a real GPU.
- **The spike's open issues** (GODOT-PLAN.md finding 14): Girder's lamps cross as data (`_api.lamps`, `lamps.json`,
  `godot/krator/lamps_import.gd`; `compare_shots.py girder --hour=21` shows them); the exporter skips core/lod's render
  copies; a region's sky panorama starts at the region's edge; the atmos wave field is ported
  (`godot/shaders/atmos_waves.gdshaderinc`, the globals, a CPU twin with golden vectors).

### Open, in the order I would take them

1. **The biome reseeding event** (TODO.md, Port: next, item 5): `KRAND` noise and cell seeding, plant records (one
   record per item, `flora_00012#37` per instance: tags step 5, Köppen per species), the `core/terrain` heightmap bake.
   One change, one screenshot set. It finishes M3 and opens M4.
2. **Iziz's export on the `KRATOR_EXPORT` shape** (M5), now that its city places from core/mask and its records are in
   core/tags. The glTF exporter should write each mesh's record id into its node extras (the spike reports the gap
   `tag nodes`: the records reach Godot only as data today).
3. **Refurbishing items the adapters work around** (Travis: "voth and iziz both need some architectural refurbishing"):
   Voth's canton-top records stand at ground height (`inspectClaim` keeps no y); Iziz's 72 biome trees and animals
   carry no `cls` or tags in `REG` (classed by name); Voth's claim footprints include their padding except the town
   houses'.
4. **Godot's night** is far darker than the page's (no night ambient or moonlight in the stage record) and its halos
   are fainter (gain 1.0): tune against `compare_shots.py girder --hour=21`.
5. **Erewhon's infill** still places nothing: the mask's soft edge was not the cause (`settlements/xanadu/KNOWN_ISSUES.md`).
6. **Iziz's material pack** waits on Iziz adopting the material library, which the Ancients re-vendor session gates.
7. For Travis: the Forward+ look check on his machine (`godot/CHECKLIST.md`) and the route his friend used for the
   Voth kit.

### Proving a change, as this session did

`node core/{tags,furnish,mask,rand}/test-*.js`; `python3 godot/tools/sync_core.py --check`; the Godot golden tests
(`res://tests/{rand,tags,mask,atmos}/*_test.gd`); `godot --headless --path godot --import` then `-- --check` (all
cases, zero `SCRIPT ERROR`); `python3 core/furnish/fingerprint.py` (prints each page's tag audit too); a screenshot pair
for anything that may move what is drawn; then `tools/audit_port.py`, `tools/make_index.py` (it rewrites
`settlements/locus/INDEX.md` for a page this container may not have built: check that diff), `tools/port_baseline.py --write`.
