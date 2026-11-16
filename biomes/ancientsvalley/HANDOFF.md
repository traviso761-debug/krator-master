# The Ancient's Valley: handoff (2026-11-10)

For the next session on `biomes/ancientsvalley`. Read `README.md` (what each page is and its numbers), `PLAN.md` (the plan; section 12 is
the order of work), `KNOWN_ISSUES.md` (every open item), `PLAN-ANOMALIES.md` and `LOD-WRITEUP.md` (the tiers' history and what is
deferred). This file says where the work stands and what to take up first.

## Where it is

- **Branch** `claude/ancientsvalley-7f521c`, worktree `.claude/worktrees/ancientsvalley-7f521c`. Nothing on it is pushed. It goes to the
  all-builds integration (the session "Integration 2: merge everything, one all-builds rebuild", `../krator-integration-2`) as one branch:
  every valley child branch is merged into it (below), so the integration takes this branch and nothing of the children's separately,
  except the library cards' core-wide fix (below).
- **Three pages, one build** (`build.py`; `python3 tools/build.py biomes/ancientsvalley [--station <name>]`):

| Page | Build | What |
|---|---|---|
| `dist/ancientsvalley.html` | `build.py` | station 0, **the Overlook**: city1 on a normal day; the towers' tiers, the transit, the keepers, the wrecks, the extraplanars, the lobbies and climbs, the House, the distortions, the oily rain, the radiation over the scars |
| `dist/ancientsvalley-yards.html` | `--station yards` | station 2a, **the Yards**: the industrial district on the freight line, the twelve industrial buildings, a rail yard, ten new Ancient Engines |
| `dist/ancientsvalley-terraces.html` | `--station terraces` | station 2b, **the Terraces**: the Soleri farm belt, eight farm families in `kits/metropolis` |

- **Verify** each with `KRATOR_GL=gpu python tools/harness.py lock --lane auto --timeout 7200 -- python biomes/ancientsvalley/verify.py <page>
  --assert --all-views --out <dir>`; the data tests are `node biomes/ancientsvalley/tests/test-av.js` and `tests/test-farm.js`. The GPU lock's
  30-minute heartbeat rule holds (CLAUDE.md): stop a hung job by PID only.

## What came together on 2026-11-10

Merged into this branch, in order (each a merge commit; generated files rebuilt once at the end):

| Branch | Tip | Session | What |
|---|---|---|---|
| `claude/atmos-smog-9fc773` | 2612a1cc7 | core/atmos smog | radiation (glow, pulse, expanding rings, heat haze), the clouds' mood third cut, the lightning sprite, the sky's sounds |
| `claude/mystifying-wescoff-d88527` | 9f8dd7b9d | Enterable, climbable towers | the lobbies and climbs (PLAN.md 15), carrying the wiring branch at 39f93125d: the storms' green gone, creepers and roof trees by rays, dead street lamps, walkers round obstacles |
| `claude/distracted-antonelli-760e40` | 26bc8aa45 | the Yards | station 2a and ten Ancient Engines (`kits/ancients` engines page) |
| `claude/optimistic-shaw-bf3fbe` | a29617fb8 | the Terraces | station 2b and the farm families (`kits/metropolis` 46f, 54f, 70f) |
| `claude/wizardly-cerf-605ac6` | a9b780177 | Effects for stations 1 and 2 | `core/anomaly` and `fx/89-atmos-fx-localtime.js`, the fx demo page. **Its plumes, sparks, sludge, slag and spill fx were uncommitted on that branch and are not here** (PLAN.md 16) |

Already in from before: the robots (`claude/valley-robots-496b9a`), the extraplanar kit (`claude/valley-extraplanar-fc8a12`), the wrecks,
the overgrowth, the transit and the vehicles (their kits' content matches this branch).

**Not merged, on purpose:** `claude/fervent-meninsky-feaa80` (the library cards' black leaf fringe, core-wide) sits on the main line (592
commits ahead of this branch's base): the integration takes it directly.

Also on 2026-11-10, on this branch: the radiation zones on the Overlook's scars (`89wr`), the radiation hook run once per shader text (a fade
clone ran it twice: 263 console errors), the Yards and the Terraces in the plan (`PLAN.md` 12, 2a and 2b), and **the atmosphere panel**
(`98-host-atmos-ui.js`, the owner: "add controls for the atmospheric effects"): haze, the smog's mist and band, cloud cover, radiation and the
distortions, on every station's page, each a multiplier on what the page set. The weather mode stays the bar's selector.

**Verified after the merges (2026-11-10, the Arc 140T lane, `--assert`):** station 0, 112 asserts over 14 views, the worst "A park gone
feral" at 1,180 calls and 8.47 M triangles; the Yards, 75 over 12 views, the worst "Among the halls" at 904 calls; the Terraces, 64 over 9
views, the worst "The hub town" at 695; `kits/metropolis` 126 checks; `kits/ancient-transit` 44. Every page's console clean of shader errors.

**Load times (2026-11-11).** The build yields (88: each kit pass and the bake a stage, the page's later fragments run after it), the fields read
craters, scars and sinkholes by cell (`AV.bucket`, `AV.sinkGate`), and the stages read the ground off lattices (`AV.lattice`: the model at 32 m,
the relief and the whole ground at 4 m, exact in a pit's or kerb's cells; KNOWN_ISSUES "The build is long"). On the Arc lane, alone on the
machine: the build (`_buildMs`) station 0 22 s, the Yards 29 s, the Terraces 30 s (from 102 to 163 s); all three verified, 114, 79 and 74
asserts, the worst view "A park gone feral" at 1,179 calls. Building the near forest first was measured and dropped (about 5 s to gain).

## Take up first

1. **The owner's eye** on the Yards (four views reframed after the first look) and the Terraces (a first cut; KNOWN_ISSUES "The Terraces").
2. **The dead lobe view** (KNOWN_ISSUES): from 900, 48, -100 the frame is a spindle stump's broken top hanging in the air and a black upper
   sky. Not the warp, not the radiation (switched off on the live page: the same frame). The nearest tower (`av.t.5.-2`) stands 40 m away
   behind the eye; the meshes named `spindle.stump.*` round the eye are in no tier group. Find what draws them there (a bake's leftover hero, a
   shell source not disposed, a lobby's climb). The wiring branch's shot of the same view on 2026-11-10 06:35 was clear, so bisect between
   its tip and this branch if the cause is not obvious.
3. **The draw calls in "A park gone feral"**: 1,185 of 1,200 at the last full run. Anything new in that view goes over.
4. **Stations 1 and 2 by the plan** (PLAN.md 12 item 3, PLAN-ANOMALIES.md 14): the Stilled Ground and the Press, on `core/anomaly` (now
   here). The effects session's plumes, sparks, sludge, slag and spill fx should be committed on its branch and merged first if the Yards
   and the Terraces are to take them (PLAN.md 16).
5. **A shader hook that runs twice** is a pattern, not a one-off: a material cloned with its source's `onBeforeCompile` (the composed KHOOK
   hook) runs every layer through the source and again as its own. KWARP and the radiation now skip text that already has them; the height
   fog's hook would break the same way if it were ever swept twice. A KHOOK-level fix (a clone takes the layers, not the composed hook)
   belongs to core/shader, rebuilt across every build.

## Smaller items

- `core/atmos/fx/89-atmos-fx-radiation.js` carries one CAMPOS and three RAWTEX findings (the sky shell's `cameraPosition` in a ShaderMaterial,
  the haze pass reading its own render target): benign, locked in `tools/check_source_baseline.json` on 2026-11-10; tell the atmos session.
- On software GL the page shows shader errors the GPU does not (KNOWN_ISSUES, last item): judge on the GPU.
- The page's top-level `const` objects (`AV_RAD`, `AV_ANOM`, `AVC`, `STAGE`) are not on `window`: an eval reads them by bare name.
- `LOD-WRITEUP.md` section 11 lists what was deferred from Gemini's review (KGROUND's `cameraPosition`, impostors baked to render targets,
  height fog on the shells, ground seating by the drawn mesh).
- The House is bare, the distortions have known limits, the walkers steer locally (KNOWN_ISSUES has each).

## Sessions

| Session | Branch | State |
|---|---|---|
| the Yards | `claude/distracted-antonelli-760e40` | merged at 26bc8aa45; waiting on the owner's eye |
| the Terraces | `claude/optimistic-shaw-bf3fbe` | merged at a29617fb8; waiting on the owner's eye |
| extraplanar wiring | `claude/sad-mcclintock-f211c2` | merged (through the lobbies branch) at 39f93125d |
| enterable, climbable towers | `claude/mystifying-wescoff-d88527` | merged at 9f8dd7b9d |
| effects for stations 1 and 2 | `claude/wizardly-cerf-605ac6` | merged at a9b780177; uncommitted fx on its branch |
| library cards, core-wide | `claude/fervent-meninsky-feaa80` | for the integration directly |
| core/atmos smog | `claude/atmos-smog-9fc773` | merged at 2612a1cc7 |
