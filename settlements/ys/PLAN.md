# Ys — build plan

*Oct 2026. `DESIGN.md` says what Ys is; this says how it gets built, in what order, by whom, and what
proves each step. Nothing in `src/` exists yet. Read the repo `README.md`, `CLAUDE.md` and the
`painting-to-3d-world` skill before starting any phase.*

## 0. The decisions that shape everything else

1. **Engine: the Ancients-lineage fragment contract** (`kits/ancients` → `settlements/port` →
   `settlements/iziz` city target), not the Voth/Yuni/Mav's engine. Reasons: the drowned quarter IS the
   Ancients kit; the port kit already has declarative terrain stamps, a water plane with an underwater
   material fade, quays and piers; the foreign quarter's buildings (Iziz Vernacular, the Republic from
   `highlands`, the Voth Embassy and the Historians' chapterhouse as ported in `iziz/src/75,76`) exist
   only on this engine; the Ring Sea vessels are on it; the biome core binds to it (the Iziz city does
   it); and the standard dev-tool pack (`92-camera.js` inspector/polygon/walk, `93-labels.js`) lives here.
   Mav's Refuge contributes its *pattern* (a layout fragment that owns every position, bridgeheads,
   `bridgeY`, a NAV graph with levels, bridges REGISTERed with their segment) re-implemented in the Ys
   layout fragment; its rope-bridge code is not portable across engines and its spans sag where ours arch.
2. **The organic look is gated** (DESIGN §4). A mockup sheet goes to Travis before the kit fans out.
   This is the one place the project can fail, and it is cheapest to fail early.
3. **The biome is its own kit first** (`biomes/nwbay`), vendored into the city like Iziz vendors the
   hyperjungle. It can be built in parallel with the mockup and the kit.
4. **One folder, three targets**: `settlements/ys/` with `targets/mock` (the gate sheet), `targets/kit`
   (every builder on one sheet, rows by family, presets generated: the Jimjam pattern) and `targets/city`.
5. **Vendor, don't copy by hand.** `build.py` resolves `core/materials/` through `srcpath()` and keeps a
   `VENDOR.json` for every fragment taken from `kits/ancients`, `settlements/port`, `settlements/iziz`,
   `settlements/highlands`, `kits/ringsea`, `core/sockets` and `biomes/nwbay`; `--vendor-check` reports
   drift. Deliberate drift goes in `KNOWN_ISSUES.md`.

## 1. Folder layout

```
settlements/ys/
  DESIGN.md PLAN.md README.md API.md(P1) AGENT-BRIEF.md(P2) NOTES.md KNOWN_ISSUES.md VENDOR.json
  build.py jscheck.py verify.py run.sh three.min.js        # from settlements/iziz, adapted
  refs/                                                   # the reference contact sheets (mood; never copy)
  src/                                                    # shared fragments: vendored + the Hykkousoi kit
  targets/mock/  targets/kit/  targets/city/              # 89z-rows.js + 91z-views.js each; city adds its own
  dist/  (not committed)
```

## 2. Fragments, prefixes and seeds

The Ancients contract: every top-level name is a global; builders open with `reseed(N)`; `build.py` fails
on duplicate column-0 names and seed overlaps. Ys claims seeds **30000–31999**. Vendored upstreams keep
their own (ancients 9xxx, port 19990–20699); `build.py`'s overlap check covers the union.

### Vendored (byte-identical unless noted)

| from | fragments |
|---|---|
| `kits/ancients` | `00-head 10-core 12-stats 30-kit 32-surfaces 34-kitdefs 36-decor 38-helpers2 50-registry 69-mat-salvage 99-tail`; **adapted**: `54-mat-concrete` (`bodyGroup` takes a per-site cut at decay 1: a standing stump with full-size storeys, optional fallen body); the builders used as hosts: `52-sky-abc 56-sky-d 57-sky-e 58-sky-f 70-sky-g 71-sky-h 89k-sky-i 89l-sky-j 89m-sky-k 82-apartments 42-offices 66-office-c 75-hotel 74-hospital 79-government 48-library 83-amphitheater 66b-flatiron 64-houses-def 81-houses-abc 73-police` |
| `core/materials` | `20-textures 22-materials 68-mat-v5` via the resolver |
| `settlements/port` | `70-port-core 72-port-kit 73-port-edges 74-port-dress 80-pq-quay 81-pp-pier 82-dd-yard 85-hb-1-fish 83-cg-store`; **adapted**: `71-port-terrain` (the stamp system, water plane, `portUnderwaterPatch`, ground painter kept; `portNatH` replaced by the Ys coast, karst and travertine) |
| `settlements/iziz` | `69b-vern-mat 69c-vern-helpers 70-vern-dwellings 71-vern-trade 72-vern-civic 75-port-embassy 76-port-chapterhouse 81-sky 92-camera 93-labels`; `92-camera` **adapted** (compass; the ground clamp reads the water) |
| `settlements/highlands` | `70-hl-tex 71-hl-mat 71b-hl-motif 72-hl-helpers 73-hl-carve 73b-hl-frame 74-rep-dwell 75-rep-trade 76-rep-civic` |
| `core/sockets` | `37-sockets 80-cultures` (+ a `hykkousoi` pack: nautilus whorl symbol, nacre-white and sea-teal livery) |
| `kits/ringsea` | `40-rs-core 41-rs-tex 42-rs-hull 43-rs-rig 44-rs-parts 60-rs-hyk-trireme 65-rs-hyk-galley 68-rs-iziz-dhoni 72-rs-hyk-hexareme 73-rs-hyk-pearl 78-rs-hyk-corbita 94-rs-anim` |
| `biomes/nwbay` | `86-bio-10…70` as the Iziz city vendors the hyperjungle, plus `86-bio-45-init` written here |

Seed collisions between upstreams that never met before (port × highlands × ringsea) are found by the
first build; resolve by renumbering the Ys-side copy and recording it.

### New (the Hykkousoi kit; prefix `hyk`, registry `HYK.def({key,name,family,row,w,d,h,r,tags,views,build})`)

| fragment | seeds | what | owner |
|---|---|---|---|
| `60-hyk-mat.js` | 30000 | textures: shell (growth rings), barnacle, bone, mosaic scale, lens glass, weed, crust; materials; the **nacre hook** (`onBeforeCompile` iridescence keyed with `customProgramCacheKey`, built with `new Function` so the constant is in the source: the Jimjam lesson) | planner |
| `61-hyk-shell.js` | 30010 | the shell kit: `hykLathe` (profile × r(θ) lobes/ribs/whorls × growth noise), `hykConch`, `hykBarnacle`, `hykCluster`, `hykPod` (superellipsoid with rimmed holes), `hykRib`, `hykVault`, `hykSpire`, `hykDome`+lenses, `hykSkirt` (fillet to ground or host, drips) | planner |
| `62-hyk-helpers.js` | 30020 | `hykDoor hykWin hykLight` (draw + `MARKS`), `hykLanding`, `hykStairSpiral`, `hykLadder`, `hykLip`, `hykReg`, the building frame (`HYK.cur`, local +z front) | planner |
| `63-hyk-culture.js` | 30030 | the hykkousoi socket pack | planner |
| `64-hyk-accrete.js` | 30100 | the tideline dressing of hosts; `hykAccrete(host,{ring,levels})`: the grown-on scheduler and placer | planner |
| `65-hyk-spans.js` | 30200 | rib bridges L1/L2, drawbridge, grown walkways, piers, boom chain, lily-pad landings; `bridgeY` | agent F |
| `70-hyk-housing.js` | 30300–30399 | 9 I + 6 G | agent A |
| `71-hyk-shops.js` | 30400–30499 | 10 I + 10 G, fishmongers | agent B |
| `72-hyk-hospitality.js`, `73-hyk-sacred.js`, `79-hyk-markets.js` | 30500–30599, 30950–30999 | taverns, inn, caravanserai; shrines; the four markets (the grown plaza is a span-kit client) | agent C |
| `74a-hyk-amphitriton.js`, `74b-hyk-citadel.js` | 30600–30649 | A and E | agent D |
| `74c-hyk-tides.js`, `74d-hyk-winds.js`, `74e-hyk-pharos.js` | 30650–30699 | B and D; the Pharos crown and its beam | agent E |
| `74f-hyk-civic-minor.js` | 30900–30949 | Library of Ys, Treasury, the Wet Cells | agent H |
| `75-hyk-harbour.js`, `76-hyk-industry.js` | 30700–30799 | docks, sheds, shipwright, the two guilds, aquaculture; warehouses, smithies, granary, windmill, generator | agent F |
| `77-hyk-military.js`, `78-hyk-agri.js` | 30800–30899 | barracks, ballista, muster; farm, farmhouses | agent G |
| `targets/city/84-city-geo.js … 93-city-ui.js`, `84b-city-shore.js`, `87b-city-nav.js` | 31000+ | terrain, paint, layout, the land–sea model (`landDist`, shore loops, `surfAt`, the FOOT/BOAT/SWIM grids: Voth's, built now for the life layer), placement, build order, UI | planner |

Rules every agent gets (`AGENT-BRIEF.md`, written in P1 from the Jimjam brief): local frame with +z the
front; honest `w d h`; `r` for the inspector; `tags.type` from the project list; `reseed` first; no
`Math.random`; no box massing in a Hykkousoi building; every opening through `hykDoor/hykWin`; every lamp
through `hykLight`; a `G` builder takes `(host, face, level)` and roots with `hykSkirt`; one building under
250 k triangles (landmarks 600 k, say so); plants are planting spots, never geometry; look at the
eye-level shot of every building before reporting.

## 3. Phases and gates

### P0 — Prep (planner, half a session)
- Folder, `build.py` (Iziz's, with the resolver, `VENDOR.json`, the union seed check, targets
  discovered), `jscheck.py`, `verify.py` (the port's: `_api.extra()`, `--cam`, `--eval`, `--hour`;
  add `--marks`), `run.sh`; `README.md`, `NOTES.md`, `KNOWN_ISSUES.md` (printed by the build).
- Tooling in a fresh container: `pip install playwright==1.56.0 pillow`, launch with the pre-installed
  Chromium (`/opt/pw-browsers`), never `playwright install`. `node` exists here (v22), so `node --check` is real.
- Vendor the shared fragments; build an empty world: sky, sea plane, a flat coast, the dev tools. **Done
  when** `verify.py --assert` is green on an empty scene and the compass toggle works.

### P1 — The mockup gate (planner, one to two sessions)
- `60–64`: materials, the shell kit, helpers, culture pack, accretion; the `bodyGroup` cut adaptation.
  `targets/mock`: one decay-1 `skyA` at scale 1 cut at ~110 m (a storey boundary) standing in 10 m of
  water with the tideline dressing; a poor barnacle cluster, a
  middle pod house with a lens dome, a rich conch; an accreted cluster on the tower at L1 and L2 with a
  spiral stair down the face, a rib bridge to a second stump, a wet landing with a boat; presets at eye
  level on the bridge, from the water, and a 300 m aerial; day and night.
- Write `API.md` (the contract: units, the yaw conventions, every helper's signature and its y
  convention, the materials, the MARKS schema, the host interface for `G` builders, budgets, the
  build/verify loop, pitfalls) and `AGENT-BRIEF.md`.
- **Gate: Travis judges the sheet.** Iterate the kit until it is grown. Budget note: lathes and tubes are
  merged meshes (one draw call per material), so the organic kit is cheap in draw calls and expensive in
  triangles; measure the mockup and set the per-building caps from it.

### P2 — Fan-out (eight building agents + the biome agent, in parallel)
- Each agent: its own copy of the tree (`cp -r` or a worktree started from this branch), its fragments,
  prefix and seed block, `targets/kit` for its views, 2–6 views per verify run, `timeout 900`, shots to
  `/tmp`. Report: keys · w×d×h · triangles · what is weak · helper bugs worked around.
- Agent D (Amphitriton, Citadel) and E (Tides, Winds) read `refs/civic.jpg` first: A is the petal-vault
  hall with the spire and the ringed pools; B the vaulted hall with the pearl sphere and the water inside;
  D the spire cluster, built wider and airier; E the terraced arena-fortress on its stack.
- Agent H (library, treasury, prison) and agent E's Pharos crown are landmark-grade: the Treasury must
  read as a strongroom (one door, nacre-sealed), the Wet Cells as a place with no bridge, the Pharos beam
  as a `TICKS` animation registered as a light mark.
- The biome agent builds `biomes/nwbay` as its own ideal-type artifact (DESIGN §8, including the cliff fig,
  flame-crown and cinder pine, and the eastern-abyss height ceiling) with `BIOME-API.md`,
  `NOTES.md`, `KNOWN_ISSUES.md`, `verify.py`, then hands over the species table and the fields it needs
  (`wet salt upland flow karst`).
- Merge by copying owned fragments back; diff the rest; rebuild; `--assert`; kit sheet shots of every row.
- **Done when** every key on the kit sheet has a front and an eye-level shot that was looked at, the
  kit audit lists no builder without a def, and `--assert` is green.

### P3 — The city (planner, two to three sessions; a layout fragment that builds no geometry first)
1. `84-city-geo.js`: constants, the coast, the karst field, the travertine river, the sink (plane tilt +
   step), `terrainH` through the port stamp system, the far country (volcano SE, Inner Wall N/W).
2. `85-city-paint.js`: albedo / mask / class canvases; roads, precincts, footprints reserved before
   anything builds (the one rule that prevents every overlap bug).
3. `87-city-layout.js`: the old lattice from land into the water; the three highways through the main
   market; the harbours; districts and wealth rings about the Amphitriton; the river and its terraces;
   farms; aquaculture; the bridge graph (which blocks link at L1, which towers at L2, the drawbridge).
4. `84b-city-shore.js` + `87b-city-nav.js`: the land–sea model and NAV (DESIGN §3): `landDist`, the shore
   loops, `surfAt` cached, the FOOT (per datum), BOAT and SWIM grids classified once from the real
   obstacles with every deck registering itself, A* + smoothing, the connectivity invariants. Built now,
   walked by nobody until P5, so the life layer starts on a finished floor.
5. `88-city-place.js`: occupancy (OBB), ground tests on the mask, the drowned/land split, the Ancients
   slot tiling by wishlist with scale ranges, the accretion scheduler per host, the Hykkousoi frontage
   walker by wealth ring, the foreign-quarter slots with their swap list, the two guilds and the
   caravanserai placed by name, the four landmarks by name with one legal freedom each.
6. `90a/90b`: terrain mesh, water, sky, build order (ancients → tideline → accretion → spans → kit
   buildings → foreign → ships → farms → biome → bake → labels), the lighting rule.
7. `91z-views.js`: the opening shot (the Amphitriton from the main market across the drawbridge), the
   reference-matching shots for A, B, D, E, each harbour, the grown plaza, a neighbourhood at eye level on
   L1, a wet landing from a boat, the travertine terraces, the foreign quarter, night from the water.
8. `93-city-ui.js`: Paths, Marks, Bounds, Jungle, hour, compass; `_api.city` counters (placed by key,
   refusals by reason, 75/25 census per zone, doors per building).
- **Done when** every invariant below passes, every preset was looked at, and the 75/25 census is within
  ±10 % in each zone.

### P4 — Verify, record, publish
- `KNOWN_ISSUES.md` complete; `NOTES.md` round notes; `tools/make_index.py`; the gallery entry
  (`gallery/build_gallery.py` ENTRIES + republish per `gallery/README.md`) when it reaches `main`;
  lessons into the skill file; back-port the compass to the standard `92-camera.js` pack.

### P5 — Later (not this build)
Life layer on NAV (Voth's model), the animated tide, interiors behind the marks, Tethys and Trigon as forks.

## 4. Invariants (`verify.py --assert`)

- error panel clean; `tagAudit`; `nanSweep`; budgets per pass (see §5).
- kit audit: every `HYK.def` key placed at least once in the city; zero-count list printed.
- every building has a door mark; every drowned building a wet door and an L1 or L2 door; every lit
  building a light mark (`_api.marks()`).
- NAV connected: every land door → main market on foot; every wet door → civilian harbour by lane; the
  Amphitriton has exactly one foot link to land and it is the drawbridge.
- no building footprint in a road (OBB sample grid, 4 m); no plant inside a building; no tree on a lane.
- zone census: drowned 75/25 ancient-with-growth/home-grown, land 25/75, ±10 %; wealth falls with
  distance from the Amphitriton (rank correlation, reported).
- every drowned host's base is below y = 0 and every land building's above it; every L1 span clears
  the water by ≥ 6 m at mid-span on a lane (the ships' air draught decides the number; take it from the
  vessel defs); vessels float and do not overlap (the Ring Sea kit's `_api.extra()` checks).
- deterministic: two builds hash-identical.

## 5. Budgets (to agree with Travis)

| | proposal |
|---|---|
| scene triangles | 12 M (the Ancients kit is at 10 M by his choice; the biome kits run 10–24 M) |
| draw calls | 220 |
| per building | 250 k; landmarks 600 k |
| accretion per host | 120 k |
| biome | 5 M in the city (quality knob) |
| verify | ≤ 6 views per run, backgrounded, 3–6 min a view at this size |

## 6. Risks and how the plan answers them

| risk | answer |
|---|---|
| The kit looks assembled, not grown | the P1 gate; lathes with r(θ) modulation and growth noise; fillets everywhere; no box primitive in `hyk*` builders; nacre only where it reads |
| Four upstreams vendored into one build | `VENDOR.json` + `--vendor-check`; the union seed check; adapt only `71-port-terrain` and `92-camera` and say so |
| Water: half-submerged geometry reads wrong | the port's underwater fade on every material (hook the Hykkousoi materials too); depth-tinted water vertex colour from swbay; coplanar faces at y = 0 (decks, floors) offset ≥ 0.05; consider Jimjam's coplanar resolver and the logarithmic depth buffer |
| Scale: 400 m towers dwarf the Amphitriton, but shrunk towers break the interiors | never scale a host below 0.85; vary height by the `bodyGroup` cut at a storey boundary; three to five at full height (the Pharos one of them); the grid pitch grows to 180–220 m to hold full-size hosts; measure in the mockup |
| Budget creep across 85 builders plus accretion | per-building caps asserted on the kit sheet; far pods as impostors; the biome's quality knob |
| Agents die mid-file | briefs on disk; write fragments early and grow them; recover from worktrees; a truncated file is finished, not rewritten |
| Software-GL time | `run.sh` backgrounded; named presets; `--cam` for ad-hoc; `window._ready` |
| The old grid vs the Hykkousoi's loose streets | the lattice is painted first as "existing network"; Hykkousoi streets are the Iziz frontage walker fronting the lattice with bends allowed; drowned blocks sit exactly on it |

## 7. Assumptions to confirm (defaults the plan proceeds on)

1. Map 3.2 km, the drowned grid ~700 m offshore, the Amphitriton ~450 m out.
2. Drowned hosts: the eleven skyscraper types plus the mid-rise types, at decay 1, at scale 1 (never below
   0.85), cut to 80–200 m at storey boundaries, three to five at full height including the Pharos. The
   Iziz-style Ancient variants are not used. Snapping the cut to each builder's storey pitch means reading
   each host builder once; that list goes in `API.md`.
3. The sea is a fixed plane at y = 0 with a painted tide band; the moving tide is P5.
4. The Amphitriton is ~120 m to the spire tip on a ~90 m island; Tides ~45 m; Winds ~110 m spires; Citadel
   on a ~60 m stack.
5. Palette: white/cream/ivory shell, sea-teal glass and nacre, coral and sea-green accents at rich, grey at poor.
6. The five extra stores: chandler & netmaker, pearl & shell-inlay, salt & spice, cloth & dye, potter & glass.
7. Ships: trireme + hexareme (military), pearl baghlah + amphora corbita (civilian), Iziz dhoni (foreign quay).
8. The biome is a fork of `swbay` (bay, stepped river, far volcano) re-keyed to karst and travertine, not a
   fork of `hyperjungle`'s flat floor: the brief's "modified from baseline hyperjungle" is met because swbay
   is already the hyperjungle's bay variant.
9. Travertine terraces are inland on the river, with a few shelf pools on the shore.
10. The Library of Ys, the Treasury and the Wet Cells stand where DESIGN §2 puts them (plaza, Citadel
    precinct, military harbour's far side).
11. The new land species are the cliff fig, the flame-crown and the cinder pine, sized under the eastern
    abyss's canopy.
12. The foreign quarter uses what is ported today (Iziz Vernacular, Republic, the Voth Embassy compound and
    townhouses, the chapterhouse); slots are tagged for later swaps.
