# Krator Ancients — handover

## PAUSED 2026-09-29 (user stopped to save usage) — resume here
- Merged and published: QA domestic, towers, civic, this month's arcologies (arcC). Kit artifact https://claude.ai/artifact/FSKTzZ3duwQ2zrbdEEqYYf.
- PORT round 3 DONE 2026-10-01: land blocks (lb*, ch*), sea platform spYard, infra (inspector, bounds toggle `b`, grid placement, every vessel, `harbour` target) merged; showcase 9.06M tris / 883 calls.
- Branch history was rewritten upstream (shots purged); `shots/` is now gitignored. Old history kept locally as `backup-pre-rewrite` only.
- Unmerged WIP from three stopped agents (QA arcA, QA arcB, lighthouse): `voth/wip/` (README lists each patch and its base; apply as diffs, never merge old-history branches).
- Queue after those land: (3) arco1/arco2 alternates of every building type; (4) six ancient machines; (5) port arcology;
  low priority: regroup kit rows by category, skyscraper stumps beside each tower, Iziz variants (Sky C tripod market,
  small podiums), dish floating wreckage, bunker launchers pointing forward/down like intact, shrink podiums for density,
  Yuni variants from voth/yuni/src/61-ancients.js (worn decay, ancient_quad, short comb apartments, roofed terrace stacks,
  reclaimed dish with dish intact, 4-cylinder hospital).
- KNOWN_ISSUES not yet ticked from qa/civic.md, qa/arcC.md (and domestic/towers if not done).

## QUEUE from the user, 2026-09-29 (in this order) — read first
1. **DONE 2026-09-30: the Ancient Port.** Published at https://claude.ai/artifact/VwkLHv9J5apZCF4oDDFo6x
   (showcase 7.40M triangles, all invariants pass). Original notes: Foundation
   DONE and verified (quay, quay110, pier; showcase/segment/edges targets).
   Six agents dispatched: drydocks+boatyard (82-, dd), cargo: warehouses,
   container dock, gantry cranes (83-, cg), terminals+heliport (84-, tm),
   fishing+recreational harbours (85-, hb), three container ships (86-, vs),
   drone carrier+submarine+berth/pen slips (87-, sl). New segments W <= 110.
   If an agent is stopped, recover its files from .claude/worktrees/.
2. **IN FLIGHT 2026-09-30: quality pass**, six agents by group (towers, civic,
   domestic, arcA, arcB, arcC); each writes `qa/<group>.md`. **Quality pass on ALL Ancient city kit structures** (the kit's types plus
   the arcologies/skyscrapers added this month), working down KNOWN_ISSUES.
3. **An alternative, from-scratch version of EACH Ancient city building
   type**, inspired by the `arco1` and `arco2` reference sets (contact sheets
   in `refs/arco1-sheet*.jpg`, `refs/arco2-sheet*.jpg`), intact, ruined and
   reclaimed/reinhabited. Counts: 2 new skyscrapers, 3 new house and
   apartment types, 3 offices, and one alternate for every other type.
4. **Six mysterious ancient machines** after `refs/ancient-machine-sheet0.jpg`
   (walking tower-rigs, tracked crawler-cities, bucket-wheel/excavator giants,
   caravan rovers, spider platforms, a turret dome), with ruined and
   reclaimed variants.
5. If usage remains: **one new original arcology that incorporates three port
   segments** (use the port kit's segments).

## UPDATE 2026-09-28 — read this first; the sections below it are older
Branch `claude/laughing-bohr-1zdca5`. Every item here was verified with
`build.py` + `jscheck.py` + `verify.py --assert --all-views`, and the shots
were read.

**Tooling note.** This container needed `pip install playwright==1.56.0` (to
match the pre-installed Chromium 1194 in /opt/pw-browsers) and `pip install
pillow`. Do not `playwright install`.

| target | state | tris d0 / d1 | notes |
|---|---|---|---|
| `trigon` (89f, seed 9710) | NEW, done | 242 517 / 281 731 | `targets/trigon/NOTES.md` |
| `monolith` (89g, seed 9720) | NEW, done | 385 304 / 374 108 | agent hit the usage limit after finishing; notes written by the coordinator |
| `crescent` (89h, seed 9730) | NEW, done | 232 400 / 321 048 | `targets/crescent/NOTES.md` |
| `ledge` (89i, seed 9740) | NEW, done | 604 154 / 484 272 | soffits given painted bounce light (were brown) |
| `arcube` (89d, seed 9610) | COMPLETED | 403 694 / 323 792 | sheet features added: friezes, oval wells, spine, heliport tower, broad piers; new ruin |
| `hill` (89e, seed 9660) | FIXED | 533 256 / 486 016 | see below |

**The Hill was burying its own city.** `hillCorr` carved the notch along the
band of the one level whose back wall stands at each radius; plates are up to
100 m deep and the meander moves the band ~50 m a level, so away from the
hairpins most plate fronts lay under the natural hill. Now the notch follows
`hillEnv(r)`, the union of every plate that reaches r (cached per metre); the
flank walls follow its edges; a rock floor closes gaps between shallow lips; the
cut walls are bedded rock (`TEX.hillRock`) instead of pale concrete. The
facade-height bug the older notes below name as "first task" was already fixed
in the code. Hero and "A garden terrace" presets re-aimed. Still open: a dark
band where the hill surface is seen from below at the lip of the cut, in the
low "The cut wall" shot.

**Kit surgery: DONE (2026-09-28).** Decay 3 is folded into the kit
(`DECAYS=[0,1,2,3]`) and the `repaired` target is retired; the user chose to
accept the overage: **8 362 742** scene triangles against the 6M soft ceiling,
reported OVER by `--assert`, every other invariant passing. The decay-3 stump
bug is fixed (standing test `d!==2`), so rehabilitated towers stand full height.
Projects D and H have rows (`j=-1150`) and day/night/close presets; their builder
code was already written. `ROWV` row shots are capped 90 m short of the next row
so they no longer stand inside its rehabilitated building. Worst draw calls seen:
886 of 900 (Rehabilitated D). Plinth shrinking, Project A's firelight and the
Hotel overhang fixes were already done before this session.

`build.py` now skips registered targets that have no directory (wing, drum,
blades) instead of aborting a full build at the first one, and its seed check
expands `N+d` over decays 0-4.

**Done 2026-09-29, all verified independently and published:**
| target | seed | tris (per decay) | notes |
|---|---|---|---|
| `wing` (8ae) | 9620 | 309 952 / 276 804 | coffered spiral disc, two slab wings; ruin drops a wing |
| `drum` (8af) | 9630 | 241 620 / 329 692 | fins and fluted tiers, sky gates; ruin leans the top |
| `blades` (8ag) | 9640 | 447 396 / 427 012 | six blades, covered plaza; SKY GARDEN on the canopy roof (user request); no skyI fallback needed |
| `wheel` (89j) | 9750 | 500 490 / 508 286 | ring park on 8 towers, spokes, 87 light wells; agent hit the usage limit, recovered |
| `skyI` (89k) | 9760 | 38 980 / 65 844 / 69 746 / 71 468 | the Braid; kit row z=26400 |
| `skyJ` (89l) | 9770 | 175 520 / 114 292 / 133 290 / 173 834 | the Whorl; kit row z=27200 |
| `skyK` (89m) | 9780 | 160 499 / 174 692 / 229 042 / 197 700 | the Sail; kit row z=28000 |

The three towers keep dev targets (`skyi`/`skyj`/`skyk`) and also have kit
rows. The kit is now **9 967 649** scene triangles (OVER the 6M soft ceiling
by the user's choice), worst draw calls seen 886. Published: kit
https://claude.ai/artifact/FSKTzZ3duwQ2zrbdEEqYYf (the older link
1V5VxyNVxS2ZsEy9M7QJhE is a stale build), and a viewer of all the new types
with per-type scene links at https://claude.ai/artifact/DUmUNgR1mKa66P4zD42X47.

Still open from the older queue: the dockyard pair, overgrown (biome) variants for every
type except the Hexahedron, and the kit-wide detail pass (Gaudi mouldings,
interiors behind openings, glass shards).

## STOPPED: weekly API limit, resets **Sep 27, 8pm** (America/Chicago)
Written 2026-09-23. Both running agents were killed mid-task by the weekly
limit, not by any fault of their own. Nothing is broken; everything below was
verified locally AFTER they stopped.

**This file lives in the repo on purpose.** The working queue was in a session
scratchpad, which will not survive four days. Agent IDs below only resolve
inside the session that spawned them — **a new session cannot resume them**, and
must re-dispatch from the briefs further down. The code on disk is what carries
over, and it is intact.

**Local tooling costs no API budget.** `build.py`, `jscheck.py` and `verify.py`
are python + playwright running against a local file; they work while the API
limit is in force. Verification and screenshotting can continue at any time.

## Verified state on disk, 2026-09-23 23:45

| | |
|---|---|
| `dist/ancients-kit.html` | **builds, parses, renders, error panel clean** |
| showcase triangles | **5 627 986 / 6 000 000** (was 4 351 238 before the fold began) |
| registered volumes | 125 · type/decay pairs 75 · draw calls 531 / 900 |
| all six invariants | PASS |

### Work in flight, and exactly how far it got

**1. Kit surgery** (was agent `a219a5339214dc14c`) — files touched and left in a
good state: `52-sky-abc.js`, `54-mat-concrete.js`, `56-sky-d.js`,
`69-mat-salvage.js`, `71-sky-h.js`.
- **Project A's firelight IS BUILT AND WORKING.** The probe reports
  `_projectFire {A: {cells 2284, lit 1111, pits 36}}` — 48.6% lit against the
  50% asked for, with 36 fire pits. Do not rebuild it; extend it.
- Project **D** and **H** were the scope change and were NOT reached. The agent's
  last line was "Now the rows and views for all three Projects", so the rows and
  view presets are unwritten.
- The `repaired` target **still exists** — the fold is incomplete. The showcase
  rose 4 351 238 -> 5 627 986, so roughly 1.28M of decay-3 content is already
  in and there is **372k of headroom left**. Whether the remainder fits is the
  open question; measure before adding, and report rather than dropping types.
- Plinth shrinking, the Sky A cross-section decks, the general building pass and
  the Hotel overhang were all NOT reached.

**2. Hill Arcology** (was agent `a46c3ce04bc39e857`) — `src/89e-hill.js` is
**60 279 bytes** and parses. **`targets/hill/` is EMPTY** — no rows, no views —
so `--target hill` cannot build yet, though the fragment compiles harmlessly
into every other target. Its last line was a real diagnosis worth keeping:
*"The facade walls and windows are built off the nominal level height, not the
actual (waved/drooped) deck surface — so they float or sink by up to 2 m."*
That is the first thing to fix on resumption.

**3. Arcube** (was agent `a1a526c9012ab7218`) — paused earlier by the user, not
by a limit. `src/89d-arcube.js` 52.9 KB and `targets/arcube/89z-rows.js` written;
`91z-views.js` not. It had a working build and was partway into an improvement
pass: "band gradient, visible light bands, void articulation, and spending the
440k of spare budget on density."

### First moves on Sep 27
1. `python build.py --target kit && python jscheck.py .syntax-kit.js && python verify.py dist/ancients-kit.html --assert` — confirm nothing rotted.
2. Re-dispatch the kit surgery from the brief below, telling it Project A is done and to start from D and H.
3. Re-dispatch the hill from its brief, telling it the facade-height bug is its first task and `targets/hill/` is empty.
4. Then the queue order below.

ORDER / STATUS:
 1. Arcoindian II  DONE, verified, published
                   https://claude.ai/artifact/5eiCdb3PvT1ZHh2cdRP9TJ
 2. Hill Arcology  a46c3ce04bc39e857   RUNNING (bumped to top by user)
                   111 terraces, sinuous climb, summit with cultural centre +
                   3 slim Skyscraper F. seed 9660.
 3. Kit surgery    a219a5339214dc14c   RUNNING
                   fold `repaired` (decay 3) into the kit and delete that
                   target; THE PROJECT IS THREE BUILDINGS - "Project A" (skyA,
                   52-sky-abc.js), "Project D" (skyD the Monolith, 56-sky-d.js)
                   and "Project H" (skyH the Warden, 71-sky-h.js), each
                   rehabilitated but NOT toppled, each with the flame deck
                   lighting. Scope changed mid-run; agent told to write the
                   firelight as ONE shared helper rather than three copies;
                   shrink skyscraper plinths (verify podium-ring decor follows);
                   cross-section decks on exposed skyA; flame day/night on The
                   Project with lit cells clustered h+v as gang turf; quality
                   pass on all ancient buildings; fix Hotel overhang. seed 9670
                   if it needs one.
 4. NEXT UP - NOT YET DISPATCHED: the dockyard pair. Same user instruction as
    item 3, split off because it is additive new geometry rather than kit
    surgery and should not share an agent with it:
      a. **Ancient container dockyard with crane.** Must be designed so several
         can be placed ADJACENTLY and SLIGHTLY OUT OF ALIGNMENT with each other
         and still look right - the point is to line a curving coastline out of
         repeated units. That constraint drives the design: no feature may rely
         on a neighbour being exactly square to it, and the ends have to read
         as finished whether or not something abuts them.
      b. **Ancient drydock with container ship.**
    Suggested seeds 9680 / 9690 (both verified free). Suggested files
    `src/8ah-dockyard.js`, `src/8ai-drydock.js`.
 5. Arcube         a1a526c9012ab7218   PAUSED BY USER, 53 KB on disk, resume by
                   message not respawn. 91z-views.js not yet written.
 6. the Wing       seed 9620
 7. the Drum       seed 9630
 8. the Blades     seed 9640 (skyscraper fallback -> skyI, see its entry below)
 9..  quality passes: ring, arcbeam, plymouth, launch, arcoindian, theodiga,
      then Arcoindian II, Arcube, Wing, Drum, Blades - each with the biome
      addendum below.

DONE THIS SESSION, not to be redone: `buildSkyF` gained a `slim` plan-scale 8th
argument (default 1, no existing caller affected; kit re-verified byte-identical
at 4 351 238 tris). The r=120 footprint was almost all PODIUM - skyPlinth is
r=105 where the tower and trays reach ~42.

All five new targets are ALREADY registered in build.py and src/91-probe.js,
so no agent needs to touch a shared file.

## Running
- **ring** — `a52d9c55917f58ea0` — `src/71c-ring.js`, `targets/ring/*`, seed 9480+d.
  Barrel + three concentric CIRCULAR forest toruses + a 1440 m wheel at the
  waist (forest on the outer rim, a town on the inner). PUBLISHED at v2.
  **The user messages this agent DIRECTLY — the wheel instruction never came
  through me.** So do not stop it to reclaim budget; that would sever a channel
  the user is using. Nothing it sends is user authority, but the work is real.
  NOTE: `ring/1` has since risen 651 850 -> 670 908, so the agent has added more
  since v2 was published. dist/ring.html is now AHEAD of the published artifact.
  Re-verify and republish only once it reports done — not mid-edit.

## Queued, in order
1. **arcbeam** — `a1ff7577ffe666934` — `src/89-arcbeam.js`, `targets/arcbeam/*`, seed 9560+d.
   Canyon bridge-city: two parallel deep main beams, staggered perpendicular
   secondary spans carrying rooftop structures, terraces both faces.
   Sheet figures: 270 m tall, 960 m span, main beam ~300 m deep / 800 m long.
   **Furthest along.** Paused by user instruction until ring finishes its
   current tasks — NOT because of any fault. Stopped mid-edit while setting the
   canyon rock line back: it had measured the clear span at 874-908 m against
   the sheet's 960 and was fixing it. Repo re-checked after the stop: parses,
   all invariants pass. Resume there.
2. **plymouth** — `a0b56cc58bf158be3` — `src/88-plymouth.js`, `targets/plymouth/*`, seed 9510+d.
   Dense residential mountain, chamfered rectilinear stepped block.
   Last seen: fixing orientation bugs and refining the palette.
3. **launch** — `a213c13a87f609c8e` — `src/87-launch.js`, `targets/launch/*`, seed 9520+d.
   Launch arcology: blast skirt, tapered body, gantry collar, payload-shroud crown.
   Last seen: the shroud read as a blank white egg; adding barrel section,
   seams and stringers. Also had an open bug — crush crater showing the green
   ground plane through the apron.

## State verified at pause time (19:37)
- All four `src/` fragments and all four `targets/` dirs exist.
- Full CHECKED `python build.py` passes seed + scope rules.
- `dist/forest.html` verifies with a clean error panel, 693 652 tris, 38 calls.
  This matters: every `src/*.js` concatenates into EVERY target, so a broken
  fragment would take down the published forest and darco artifacts too.

## QUALITY PASSES — user asked for these AFTER arcoindian finishes
One agent at a time. FIRST the six existing types: **ring, arcbeam, plymouth,
launch, arcoindian, theodiga**. THEN, once they are built, a quality pass on
each of the five new ones too: **Arcoindian II, Arcube, the Wing, the Drum,
the Blades** — same treatment, same biome addendum. Each already has a section in `KNOWN_ISSUES.md` written from its
own hand-back plus my independent verification — that list IS the brief; hand it
to the agent and tell it to work down its own section.

Resume each type's ORIGINAL agent where one exists, so it keeps its file
knowledge: ring `a52d9c55917f58ea0`, arcbeam `a1ff7577ffe666934`,
plymouth `a0b56cc58bf158be3`, launch `a213c13a87f609c8e`,
arcoindian `a68761ddf2041272d`.

### STANDING ADDENDUM — every quality run also does the BIOME PASS
Give this to each agent verbatim, in addition to its own KNOWN_ISSUES section.

The hyperjungle biome kit has been ported into this repo from the Screamers
Hexahedron: `src/75-biome-*` (core: head/kit/foliage/place) and
`src/76-5x..7x-biome-hyperjungle-*` AND `76-5x..7x-biome-eastabyss-*` — BOTH
biomes are present; build one or the other, never both.
It is engine-independent by design — its header says "Nothing below names a
world's kit" — and it keeps its OWN PRNG, so adding it moves nothing in any
existing type. `src/75-biome-45-bind.js` is the ancients-side host binding and
is the ONLY world-specific file. Its fragment number is load-bearing: the API
requires BIO.init to run BEFORE fragment 50, and 76-75 (the first name I used)
sorts after it. `build.py` now exempts any `-biome-` fragment
from the seed and shared-scope scans, exactly as the Screamers build does,
because they are closures with their own streams.

The contract:
  BIO.init({THREE, terrainH, mask, obstacles, ticks, seed, origin, err, stat})
  BIO.setScene(scene); BIO.setSun([x,y,z]);
  HYPERJUNGLE.build({R, heroR, quality})   ->  BIO.bake()
  EASTABYSS.build({R, quality, lakeHue}) is the same shape. The core in this
  repo is EASTABYSS's, which is hyperjungle's plus origin-lists, climate
  `fields` and BIO.grid box/noMask — a documented backward-compatible superset,
  so hyperjungle runs unchanged on it. The binding supplies all four fields
  (wet/salt/upland/flow) because BIO.fieldDefault has no `flow` and BIO.field
  throws without one. They are placeholders: flat, dry, unzoned. A target that
  wants eastabyss to read as a basin must hand in real fields.

Each agent's biome task, on its own type:
1. **Make an overgrown variant** — a second site, same builder and same seed,
   with the hyperjungle grown around it. The worked example for the row/builder
   wiring is `targets/hexahedron/89z-rows.js` (`hexlush`), which uses
   `withBiome(3.2, ...)` for the kit's own planting dial; the biome kit is the
   heavier half and goes in the same wrapper.
2. **Supply the mask.** `biomeClear(x,z,r,soft)` in the binding is the hook: a
   type pushes its own footprint so growth stops at the wall line and thins
   over `soft` metres beyond it. A type that pushes nothing gets grown straight
   through — legitimate for a ruin, a bug for an intact one, and telling which
   is which IS the pass.
3. **Confirm the foliage actually renders** — read the shots, do not trust the
   counters. Charge it: the binding books biome geometry to its own `biome/0`
   key so `--assert` budgets it separately instead of inflating your type.
4. Report what the port breaks on your type.

**KNOWN GAPS, still open:**
- **Ancients has no `tick`/`TICKS` registry**, so `ticks:` falls back to a no-op
  and **the biome's wind will not animate**. Screamers added `tick()` to its
  `10-core.js`; ancients never did. Whoever needs it first adds it there, once.
- Dressing sizes (not just counts) are still tower-scaled — see below.

**BIOME PASS — WHAT I PROVED, so no agent re-derives it:**
- It RENDERS in this kit. `targets/hexahedron/89z-rows.js` `hexlush` is the
  worked example: build the type, `biomeClear(x,z,r,soft)`, move
  `BIO.host.origin`/`center` to the SITE (LOD is measured from the origin, and a
  site 3 km off world centre would be built entirely at minimum detail),
  `BIO.setScene`/`setSun`, `HYPERJUNGLE.build({R,heroR,quality})`, dress,
  `BIO.bake()`.
- **ONE BIOME AT A TIME, and `src/` enforces it.** `src/` permanently carries the
  core (75-biome-10..40) and the binding (75-biome-45-bind.js) plus exactly one
  biome's own fragments; the other sits uncompiled in `biomes-available/`. See
  `biomes-available/README.md` for the two-line swap and the reasoning. Leaving
  both in `src/` does NOT give you "either one" — build.py concatenates all of
  src/ into every target, so both would always load, and they clash on twelve
  item names in `BIO.defs`.
- **Do not try to namespace your way out of that.** I tried prefixing
  eastabyss's keys `ea:`; it fixes the clash in ancients and BREAKS eastabyss in
  its own home tree, because its host fragments place those items by bare name
  (error panel dirty, 580 565 instances down to 163 040). Reverted, both trees
  restored, and the ancients copies are byte-identical to `biomes/eastabyss/src`
  again. If two biomes ever must coexist, the fix belongs in the CORE and has to
  go to every world.
- **Dressing works, but NEVER take its default densities.** `dressLedges`
  defaults to 400 moss / 300 plants, sized for the Girder tower it was written
  against; `BIO.upFaces` weights by triangle AREA, so on a 1.5 km arcology the
  default is a few dozen specks you will not find. Measured: at defaults the
  soffit came back bare; at 9 000 moss / 5 200 plants / 3 200 edges it reads,
  and the type went 2.24M -> 3.48M triangles. **Sizes need scaling too** — moss
  at 1.2-3.5 m and curtains at 4-16 m are still small against a building this
  size. Scale count AND size to the host; it is per-type work.
- The dress pass does NOT consult `BIO.mask`, so dressing a building standing in
  its own clearing is fine.
- Geometries must be handed over in WORLD space. This kit's builders leave their
  shells merged inside a translated group, so bake them out through
  `matrixWorld` or every plant lands at the world origin.

Highest-value items already identified per type:
- **ring** — nothing connects (bridges land but no stair/gate into the town);
  the cutaway floors do not read; ring/1 at 96% of budget.
- **arcbeam** — dropped span reads as an intact white box; "Both" is washed out;
  rockfall scar is the weakest ruin feature; 92% of budget.
- **plymouth** — silhouette is a stepped cone, wants a spur or saddle; assembly
  hall is thin; ruin is "intact with patches" above the slump.
- **launch** — everything facing down is brown (hemisphere ground colour, no
  shadows); six-fold symmetry is exact; scoop back walls have no thickness.
- **arcoindian** — TBD from its hand-back.

Cross-cutting, still open, and worth doing ONCE rather than five times:
- **One shared tree.** Three types independently hit the coarse-canopy wall and
  a fourth duplicated it rather than reuse a neighbour's. Needs a different
  tree, not a different displacement amplitude. NOTE: Forest Tower has only
  ~7k triangles of headroom, so a costlier tree must be paid for.
- `stainsFromLedge()` orients streaks radially — wrong on any non-circular plan.
- `holeFn`'s `u` is multiplied by ~7 internally, documented nowhere.
- DONE: `stripRing()` tangent fix (was radial; 47 call sites) and `jscheck.py`
  installed at repo root + documented in README.

## PAUSED BY USER — resume when told
**Arcoindian I** — `a68761ddf2041272d`. Stopped 02:55 on user instruction, NOT
for any fault. It was well along: `src/89b-arcoindian.js` is 63 KB, both target
files exist, `build.py` and `src/91-probe.js` registrations are in, and
`shots/arcoindian/` already has renders (light well, satellite pod, terrace,
hero). Last line before it stopped: "Full 16-view run now."

Checked after stopping: `python build.py --target arcoindian` builds and
`python jscheck.py .syntax-arcoindian.js` says PARSES OK (10 747 lines). So
nothing is broken and every other target is safe.

Resume with SendMessage to that agent id — it keeps its transcript. Do NOT
spawn a fresh agent; 63 KB of its work is on disk and a new one would not know
about it.

The brief, kept because the reference images will NOT survive compaction:

Suggested: `src/89b-arcoindian.js` (sorts after 89-arcbeam.js, before
89z-rows.js), builder `buildArcoindian(scene,gx,gz,d)`, target `arcoindian`,
seed **9580+d** — RE-VERIFY it is free at dispatch by expanding every reseed()
in src/ through build.py's own `seeds_claimed()`; my earlier eyeball grep missed
the `reseed(d>0?a:b)` form and cost an agent a rebuild.

Sheet figures, verbatim: (Cliff topography) · Population 20 000 · Density
1 791/hectare, 725/acre · **Height 220-450 m** · Surface covered 10.5 hectares,
25 acres.

The form, from the three drawings:
- Built **into an overhang / large open cavern in the side of a cliff** — the
  city sits under a rock roof, not on open ground. Half the drawing is rock.
- **Three round towers on a courtyard plinth**, the plinth itself standing on an
  **irregularly shaped set of many terraces** that step down and outward from
  the cliff. The towers are labelled CITY CENTER and CULTURAL CENTER, arranged
  round a central circular plaza with a PROMENADE ring.
- **Passages run back into the cliff** to various chambers — the section shows
  DWELLINGS, CITY CENTER and INDUSTRIES buried in rock, lit by **LIGHT WELLS**
  dropped from the surface above. This is the thing that makes the type: it is
  half built and half excavated.
- Outlying **round/hexagonal satellite pods** (RESEARCH) on causeways away from
  the main mass, plus GARDENS against the rock face, PLAYGROUNDS, and
  TRANSPORTATION / INTER-CITY TRANSPORTATION arriving along the cliff foot.
- Zone labels to spend across it: GARDENS, PUBLIC, PROMENADE, CITY CENTER,
  CULTURAL CENTER, RESIDENTIAL, LIVING-WORKING, DWELLINGS, MEETING AREAS,
  RESEARCH, INDUSTRIES, PLAYGROUNDS, TRANSPORTATION.
- Views the sheet implies, so presets should include them: a sagittal (long)
  cross-section through cliff and city; a top-down from inside the overhang; and
  a head-on elevation looking into the cavern mouth.

**Arcoindian II is a separate type and its drawings come later** — do not
conflate the two, and leave a seed block free for it (9590).

## NEW TYPES TO BUILD — Arcoindian II, then Arcube
Reference images will NOT survive compaction; the briefs are written out.

### Arcoindian II — the half-cave
Cliff topography. Sheet verbatim: Population 5 000 · Density 529/hectare,
214/acre · **Height 280-340 m** · Surface covered 8.6 ha, 21 acres.
Seed **9590** (already reserved). Suggest `src/89c-arcoindian2.js`, target
`arcoindian2`. Same concept as Arcoindian I, a different resolution of it.

Soleri's own text: "not a sequence of underground spaces but the use of a deep
shelf on the wall of a canyon"; "a gaping hollow in the side of the cliff";
mouth **preferably open to the south**, so the cave is a winter sun trap and a
summer parasol; "the ceiling of the half cave is the roof above the roofs".

- **A flattened LENS slung inside the hollow** — the section shows a broad
  lenticular mass, thickest at the middle, tapering to points at both ends. NOT
  a terraced hill; that was Arcoindian I. Bands through it: LIVING, CITY CENTER,
  DWELLINGS, PUBLIC, CULTURAL CENTER.
- **It hangs on a stalk.** A vertical shaft of LEARNING drops from the lens into
  the gorge, with further shafts to WATER on the valley floor — "shafts that
  drop down to the floor of the valley connecting the city to gardens, parks or
  water bodies" — and a MARINA at the bottom.
- **The rim plateau above** carries LIGHT WELLS, PLAYGROUNDS and a WATER
  RESERVOIR, with shafts down through the rock "for access and light and air
  control". A TRANSPORTATION bridge leaves the cave mouth.
- **Plan, bird's eye from inside the overhang**: concentric semicircular
  rosettes against the back wall — RESIDENTIAL and LIVING in two round ones,
  CITY CENTER a larger half-round amphitheatre, CULTURAL CENTER along the front
  lip, GARDENS in a fan to one side. The near-symmetry is deliberate and is
  "lowest in the cave configuration almost as a reflection of the absence of the
  hypothetical half of the cave cut away".
- Presets the sheet draws: **coronal section, sagittal section, head-on**, and
  the **bird's eye from inside the overhang**.

### Arcube
Flat or hilly land. Sheet verbatim: Population 400 000 · Density 2 717/hectare,
1 100/acre · **Height 1 500 m · Side 1 kilometre** · Surface covered 140 ha,
346 acres. **9600 is TAKEN by 44-starport — use seed 9610.** Suggest
`src/89d-arcube.js`, target `arcube`.

Soleri groups Arcube with the Hexahedron as the **Apollonian** generation,
"characterized by the envelope which is substantially an elementary geometry:
cube, sphere, pyramid, hexahedron, cylinder", as against the free-form
Dionysian kind. Build it that way: the silhouette is a pure solid and all the
incident is inside it.

- **A 1 km cube stood on a horizontal diagonal**, so the front elevation reads
  as a DIAMOND, carried clear of the ground on tall VERTICAL STRUCTURE legs —
  1 500 m total against a 1 km side, so roughly a third is leg.
- **Concentric diamond bands** in that elevation, outermost inward:
  LIVING-WORKING, LIVING, CULTURAL CENTER, CITY CENTER, and a void at the
  centre. A HELIPORT on the top vertex.
- **The SIDE elevation is rectangular, not a diamond** — RESIDENTIAL over
  LIVING-WORKING, cut top to bottom by tall slot LIGHT WELLS. The two
  elevations disagreeing is the whole form; get both right.
- **Midlevel plan**: a rectangle, CITY CENTER and CULTURAL CENTER at the ends,
  RESIDENTIAL and PUBLIC between, LIGHT WELLS down both long sides, VERTICAL
  STRUCTURE at the corners.
- Presets: the diamond elevation, the side elevation, the midlevel plan, a light
  well in section, and the legs from below.

## NEW TYPES — the memorial group (after Arcoindian II and Arcube)
Three arcologies whose SHAPES are inspired by Yugoslav war memorials
(spomeniks). **Original forms in that idiom — do NOT reproduce any of the real
monuments.** That is the kit's standing rule and it matters more here than
anywhere else, because the references are specific, identifiable, recent works
by named sculptors. Take the formal language, not the object: raw board-formed
concrete, bilateral or radial symmetry, a few enormous abstract gestures rather
than many small ones, no ornament, and a silhouette that reads as one figure
against the sky from a kilometre away.

They share an idiom, so they should share a material voice: heavier, greyer and
more monolithic than the white Ancient stone — closer to Darco's repalette than
to the Forest Tower. Each is a MONUMENT THAT IS ALSO A CITY: the gesture has to
carry dwellings, and the tension between "abstract sculptural mass" and "40 000
people live in it" is the whole brief.

Seeds verified free by expanding every reseed() through build.py's own
seeds_claimed(): **9620, 9630, 9640**. (9590 Arcoindian II, 9610 Arcube,
9600/9601 are 44-starport, 9650 is darco.)

### 1. The Wing — `src/8ae-wing.js`, target `wing`, seed 9620+d
Reference idiom: a low central drum flanked by two great swept wings.
- A **central lens or drum** on a broad plinth, its face a deep spiral of
  recessed coffers — the one piece of fine texture in an otherwise blank mass.
- **Two wings sweeping out and up** from it, cantilevering far past their
  supports, each wing splitting into **stacked horizontal slabs** separated by
  deep shadow gaps — the slabs are the dwelling decks, and the gaps are where
  the light gets in.
- Strictly **bilateral**: one plane of symmetry, and the composition is a
  silhouette exercise. The ruin should break that symmetry — one wing down.
- The cantilever is the engineering claim; carry it visibly.

### 2. The Drum — `src/8af-drum.js`, target `drum`, seed 9630+d
Reference idiom: a cylindrical tower of alternating vertical fins and stacked
blocks, arranged radially.
- A **round tower** whose elevation is entirely **alternating vertical fins and
  stacked rectangular boxes**, repeated round the circumference and up the
  height — fins are structure and circulation, boxes are dwelling clusters.
- **Arched voids** cut through where fins part, so the tower is porous and you
  can see sky through it at several levels.
- The whole thing is one repeated motif at two scales. The risk is that it
  reads as a fluted column and nothing more; the fix is varying the box rhythm
  up the height rather than stacking an identical storey.
- Stands in a **cleared court with low walls** radiating from its foot.

### 3. The Blades - `src/8ag-blades.js`, target `blades`, seed 9640+d
Reference idiom: several curved tapering blades rising from a common base and
curling outward, with a portal and stair between them.
- **Five to seven curved slabs**, each rising from a shared plinth, tapering as
  it goes and **curling outward at the top** like a flame or a leaf.
- Each blade is INHABITED - a thin deep slab of dwellings with windows on its
  concave face - and the space they enclose is a **covered plaza** with a stair
  climbing into a portal at its centre.
- The blades should not be identical or evenly spaced; the reference group is
  asymmetric and that is what stops it reading as a fountain.

**IF IT IS A NO-GO, BUILD A SKYSCRAPER INSTEAD.** (User instruction, given in
advance.) This is the one of the three most likely to fail as a city: blades
thin enough to READ as blades may be too thin to hold rooms at arcology scale.
The agent is told to test that and say so plainly rather than fake it.

The no-go test: can a blade carry a double-loaded plan - rooms, corridor, rooms
- at a thickness that still reads as a blade in silhouette? If not, say so and
switch. Do NOT quietly thicken them until they are just towers; that loses the
whole reason for the type.

The fallback, and note it is a DIFFERENT shape of job:
- A **skyscraper**, not a standalone arcology, and it goes in the **ancients
  KIT showcase**, not its own target. So: a row in `targets/kit/89z-rows.js`
  alongside the other types, NOT a new `targets/<name>/`.
- Next free name in the series is **skyI** (skyA..skyH exist). Builder
  `buildSkyI(scene,gx,gz,d)`, and add `skyI:'sky'` to BUDGET.type in
  `src/91-probe.js` - the **sky class ceiling is 400 000**, not the 700 000 a
  mega gets. Reuse seed 9640+d.
- Decay levels: the kit showcase builds 0/1/2, so it needs a TOPPLED variant
  too, unlike the standalone arcologies which only do 0/1.
- Keep the blade idea at tower scale: a cluster of curved tapering shafts
  rising from one base, curling out at the crown, inhabited, with the gaps
  between them as the building's light wells.
- **Kit budget headroom:** the showcase is at 5 346 054 of 6 000 000 after the
  shared-geometry pass, so ~654 000 free. A 400k sky type fits, but check the
  showcase total after adding it and report it.

## Already published (update by URL, do not re-publish fresh)
- Forest Tower — https://claude.ai/artifact/3ju6PEBZYBQmVGsaJgbbTP
- Darco — https://claude.ai/artifact/4Ttu5p3jcCzSN63jY8WVDe

## Per-agent close-out
Verify independently (build + `--assert --all-views`), read the PNGs myself,
then publish. Do not take an agent's reported numbers on trust.
