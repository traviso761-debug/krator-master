Note for all builds: when creating new flora or fauna, tag by biome (arid/mild/wet, hypertropic/tropic/temperate/cold, abyssal vs non, riparian vs non vs both), and harvestability/edibility. If making new flora to be part of a park or compound, don’t make it part of the building: make it a separate plant, with tags, then place it - if making a new building set without any biome specified, make a placeholder and expect it to be replaced later. When making furniture, tag by culture and type (table, chair etc); include outdoor furniture and decorations (fountains, statues, benches etc) as furniture for this purpose, tagged indoor, outdoor, or both. When making buildings, tag by culture, type (civic, market/shop, tavern/inn, industry, farm, single-family dwelling, multi-family dwelling, infrastructure, religious, funerary; buildings can have more than one tag eg a funerary temple would be funerary+religious). Keep dependencies as segregated as possible; the idea is it should be easy to swap in one culture's buildings or one biome’s flora without affecting anything else.  Modular is better! It should be as easy as possible for an agent to identify what components need to be exported to place an object in a different artifact.

Write code with an eye to an eventual port to Godot.

**CORE MODULES ARE NOT OPTIONAL** (a build that needs something `core/` already is takes the module; it does not write its own, copy it, or leave a "temporary" stand-in.  The rule is easy to drop halfway through a long session: re-read this table before each new fragment, and run the check at the end.)
- **Before the first fragment**, write a `Core adoption` section in the build's `PLAN.md`: the modules the build takes (by name) and, for each module it does not, one line of reason. Start `build.py` from the nearest finished build of the same kind, not from a blank file: a biome from `biomes/swbay` (atmos host binding, water on `core/water`, fruit, tags, the export profile) or `biomes/nhighlands`; a Throne-style station set from `biomes/throne`; a settlement from `settlements/pinnacle-rock` or `settlements/isle-demo` (`CORE-ADOPTION.md` has every build's checklist).
- **Before each new fragment**, ask whether a core module covers it, and read the table before you write it:

  | You need | Take |
  |---|---|
  | randomness, a seed, a hash of (world, cell, index, salt) | `core/rand` (`KRAND`): never `Math.random`, a hand-rolled PRNG or `fract(sin())` |
  | height, relief, strata, noise, rivers on the ground | `core/terrain` (and the scale model's fields), not your own `fbm` or `terrainH` |
  | what is where, overlap tests, occupancy | `core/space` (`KSPACE`), `core/mask` (`KMASK.canvas`); never `getImageData` for placement |
  | sky, sun, fog, light, weather, cloud deck, the wave field | `core/atmos` (`ATMOS.bindHost` from `core/atmos/host`), the standard skybox plus local detail |
  | the sea, a lake, a river, a fall, a pool, a hot spring, a geyser | `core/water` (open, shore, flow, fall, still, spring, geyser, terraces): no `MAT_WATER`, no ripple shader of your own |
  | camera, viewer, inspector, polygon tool, walk keys, probe, cut-away | `core/host` (`KHOST`), `core/walk`: do not write a camera or a probe |
  | records, tags, names, vocabulary | `core/tags` (`KTAGS`); everything placed is registered before it is drawn |
  | furniture and interiors | `kits/catalog` through `core/furnish`, with `kits/interiors` for rooms |
  | streets, lots, a town | `core/city`; a village or camp: `core/hamlet`; people and time: `core/simulation`, `core/sched`, `core/clock` |
  | flora, fauna, biome zones | `core/biome` and the biome kits (`kits/fauna`, `kits/crops`); new species go into the kit, not the page |
  | surfaces and textures | `core/materials` (the library through `materials.json` and `tools/textures/pack.py`) |
  | export, LOD, minimap | `core/export`, `core/lod`, `core/minimap` |

- **If core lacks it, stop and say so.** Add the piece to core (an opt-in subfolder if builds that pool the folder would change: `core/water/geyser`, `core/atmos/host`) or ask; do not write a bespoke one in the build, and never leave a vendored copy of a core fragment.
- **A check enforces it.** `python3 tools/check_core_use.py` (a step of `tools/test_all.py`) fails on a build that does not list the core modules its kind needs, or whose own fragments write a PRNG, a `fract(sin())` hash, a value noise, `getImageData`, `MAT_WATER =` or a sky dome. It compares with `tools/core_use_baseline.json` (today's findings), so old code passes and new code cannot add to the pile. A deliberate exception is a line in the script with its reason: `NOT_APPLICABLE` (a module a build cannot use), `SITE_PENDING` (settlements to be re-scoped on a site of the world map, whose biome files are redone then: Pinnacle Rock, the isle demo, Longsong) and `SINGLE_COMPLEX` (a settlement of one pre-planned complex, exempt from "takes `core/simulation` therefore takes `core/city`" until `core/city` has a single-complex mode: Longsong). Run it before you say a build is done.

We want new builds to reference core modules as much as possible rather than building bespoke systems for each build.

When placing streets, paths, and highways, make sure they connect to existing network unless otherwise specified. Ask if unclear.
By default, builds should use the standard Krator skybox with gas giant and sun, +/- relevant local details (distant mountains and volcano position, etc). This will eventually be replaced with a more fully rendered open world.
Open water (bays, lakes, the sea) uses the shared wave field, and standard (PBR) materials take their reflections from the build's own sky: both come from `core/atmos` (`#include <atmos_waves>`, `ATMOS.skylight`; `core/atmos/README.md` says how to take them). Do not write a build's own wave sum or environment map.

**DEV TOOLS**
Add inspector tool to all builds that is toggleable; when on, mousing over shows top level name of asset, classification (building vs flora vs furniture vs life layer etc), tags (biome, culture, .
Add polygon tool that allows user to create copy/pasteable coordinates for debugging and object placement.



**Life/simulation layer**
When building life layer, Voth currently has the most complete example. Its pathing layer should be incorporated into all new builds as soon as life layer is being designed. It also has the most complete and comprehensive collision system which can be used as an example. Never encode a world rule solely in the visual implementation if it could exist as simulation data!

Bad:

if (x > -500 && x < 200 && faction === "screamer") {
    spawnRaid();
}

Good:

Screamer faction
    territory: North Crater
    hostility: Player
    behavior:
        raid hostile settlements

Bad:

merchant walks to this coordinate

Good:

Merchant
    preferred activity: TRADE

Market
    activity: TRADE
    capacity: 20

Bad:

Mav's gatherers walk to these four coordinates.

Good:

Gatherer
    activity: GATHER_FOOD

Jungle region
    resource: FRUIT
    gatherable: true

That is the difference between a procedural scene generator and a procedural world simulator.

**Furniture that is not always drawn is data first.** When a build draws furniture only near the camera (interiors
streamed in and out, anything planned on demand), the drawing is never the furniture's only home. Always:
1. **Records apart from the drawing.** Each building's plan and pieces are a record (id, key, variant, seed, pose,
   room, type, job), computed once by a pure function of the building's inputs, kept whatever is drawn, and read by
   anything that needs them (the simulation's slots, an export) without waiting for the camera.
2. **A camera-independent index.** Every record exists without anyone looking: baked headless into a committed JSON
   file the build inlines (fingerprinted per building, so a stale entry is recomputed instead of trusted), with an
   idle-time fill for what the bake lacks. The lights the pieces carry come from the records too.
3. **Edits as an overlay.** Changes (the owner's, later the player's) are kept as deltas keyed by piece id, applied
   to every read of a record, so they survive a building being dropped and rebuilt; a delta names its piece's key and
   is skipped, not misapplied, when the catalog has changed under it.
Mav's Refuge is the worked example (`settlements/mavs-refuge/src/57a-interiors.js`, `bake_interiors.py`).

Give people and creatures a schedule, or at least the scaffolding for one, even if night/day is not implemented yet. A dummy schedule can have 'null' or the same activity for every hour.
Give them a primary faction (eg, Beast Riders) plus sub faction (eg, Quetzal Tribe) and a job (merchant, farmer, etc)

## Where things are
**Building on Windows:** a `build.py` must name `encoding='utf-8'` on every `open()` (and `newline='\n'`); without it
Python writes the local code page and the page's em dashes become byte 0x97 (Locus shipped so once, Oct 2026). Every
`build.py` names it since 2026-10-08, and `tools/check_encoding.py` (run by `tools/test_all.py` and CI) fails on one that does not.

**Checks and CI.** `python3 tools/test_all.py` runs every check the repo has (the port lint, the insulation check, the
encoding lint, every node test, a rebuild of every build and the hash baseline); `--nightly` adds the furniture
fingerprint, `verify.py --assert` on the critical-path builds and the Godot tests. GitHub Actions runs the first on every
push (`.github/workflows/checks.yml`, which also fails if a committed page is not what its sources build) and the second
nightly (`nightly.yml`). A verify.py takes its harness from `tools/harness.py`; `python3 tools/harness.py smoke <pages>`
loads any pages headless and reports their error panels.

**Built pages and texture packs are in Git LFS** (2026-10-08, like the texture library): every `dist/*.html` and
`dist/*.js`, the pages the Voth lineage writes beside `build.py`, and every packed `tex/*.webp`. A clone needs `git lfs`
to open a page; `GIT_LFS_SKIP_SMUDGE=1` plus `git lfs pull --include='*/*/tex/*'` is enough to build. LFS stores a
file once by content, so the same packed set in twenty builds costs one copy.

There is an included skill file, painting-to-3d-world. Read before starting a new settlement or building kit, or when making large change or expansion to existing ones. When pushing changes to the main branch, reread the skill file, and update with any useful lessons from the build, including known pitfalls, ways to overcome them, and ways to better organize and implement builds. If you run into a particularly aggravating or repeat problem and solve it, note it in the file readme so future sessions without context can pick up the trick and note it in the skill file.

**Skills.** Two skills are kept with the repo, each in two copies: a folder Claude Code loads by itself and a zip
for uploading to claude.ai (or giving to someone else's Claude):

| Skill | Folder | Zip | Read it before |
|---|---|---|---|
| painting-to-3d-world | inside the zip | `painting-to-3d-world.skill` | a new settlement or kit, or a large expansion |
| character-modeling | `.claude/skills/character-modeling/` | `character-modeling.skill` | any work on `core/charactermodels` (bodies, clothes, clips, posture, the Godot twin) |

**Keep both copies of a skill up to date with lessons learned.** When a session solves a problem worth not solving
twice (a bug with a non-obvious cause, a pitfall in Blender, MPFB, Meshy or Godot, a better way to work with the owner's
feedback), add it to the skill before pushing to main: for character-modeling, the symptom, the cause and the fix go
in `references/pitfalls.md` under their area, and a change of method in `SKILL.md`. Then rebuild the zip from the
folder so the two match:

```
cd .claude/skills && rm -f ../../character-modeling.skill && zip -qr ../../character-modeling.skill character-modeling -x '*/__pycache__/*'
```

and commit the folder and the zip together. A zip that is older than its folder is out of date: `unzip -l
character-modeling.skill` lists what it holds.

`GODOT-PLAN.md` is the repo-wide plan for auditing every module, quarantining the
browser-native code and porting the rest to Godot; read it before adding a core module or
starting a build. `ROADMAP.md` (2026-10-08) is the synthesis of three evaluations of the repo (ChatGPT's and Gemini's are
in `evals/`): which of their claims hold, what they missed, and the order of work; its section 6 amends `TODO.md`'s "Port: next". `INDEX.md` lists every build and links to each build's own index. `CLAUDE.md`
holds the working rules for agents. `VISUAL-BAR.md` is the look every world is judged against:
the pillars, the banned outcomes, the measured gates, the delta loop and which engine carries
each part; read it before a new build or a lighting or texture pass. Settlements are in `settlements/`, building
kits in `kits/`, biomes in `biomes/`, shared code in `core/`, and open worlds (a region of the scale model at 1:1,
streamed, with the biome kits' flora, the built settlements placed in it as tiles baked from their own pages, and
highways between them) in `openworld/` (`openworld/little-demo/README.md`). The gallery of every
built world is published from `gallery/` (see `gallery/README.md`).

**Keep the Krator Worlds gallery current.** Update it automatically only when you
push a brand new settlement, kit or biome to `main` (or change the location of an old one's
.html render). Add the new pages to `ENTRIES` in `gallery/build_gallery.py` if they are
not listed, run `python3 gallery/build_gallery.py`, and republish `gallery/site/` to
the Krator Worlds artifact at the URL in `gallery/README.md` (same URL, every file
in `gallery/site/worlds/` attached). Do not publish a new artifact.

- A fix delivered to one settlement or biome: republish only that build's files.
- A change wider than that (several builds, shared `core/` code, a refactor): ask
  whether to update the gallery. Do not republish unasked.

When making changes to an existing or in-progress build, particurly after change that has wide impact or when trying to revise broken geometry, provide a link to the local version of the .html render or a mock.html.
