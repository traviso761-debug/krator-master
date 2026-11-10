# Handoff: the settlement-kits round (2026-11-09 to 2026-11-10)

For the integration session that pulls this work into `main`. Written by the coordinating session
(`session_018FfX1Rvdq4RAo5rq6xJaRd`, "Settlement kits status") on 2026-11-10.

## Where it is

| | |
|---|---|
| **Integration branch** | `ccr-55bd6ee1-p1si44` (head `35c3a0f5` when written; later merges listed below) |
| **Base** | `main` at `2d530d40` (the integration pass) |
| **`main` since** | two gallery commits (`0e2f6649`, `6f6af6c4`); `git merge-tree origin/main ccr-55bd6ee1-p1si44` reports **no conflicts** |
| **Size** | 153 commits, 1,575 files (+34k / -12k lines), most of it rebuilt pages and texture packs (Git LFS: `git lfs` needed) |

Everything below is merged into `ccr-55bd6ee1-p1si44` unless it says **in flight**. The child branches (`ccr-55bd6ee1-p1si44-<topic>`)
are kept on origin for their history; do not merge them separately (they are already in), except the ones marked in flight.

## What the owner asked for, and what landed

**Kits**
- **Yeti (Khaayken) Y5 + Y6** (`-kits-a`): the khaayken interiors set, figures, hangings, the war-loot rule (Eternian heads), an opt-in
  1.15x furniture scale in core/furnish, furnished cut-aways; Leng's occupation pieces; the forest-steppe row on nwouterwall's flora.
  Verified. Awaiting the owner's eye-level review of the forest-steppe row.
- **Pylon** (`-kits-a`): interiors for the vault rows, neo villa, guild, shrine, clinic and the governor's palace rooms; the post-apoc pack
  wired. Verified; Iziz's 10 pages byte-identical.
- **Talia** (`-kits-a`): the governor's palace rooms; remaining set items; P0-P2 ticked. Verified. The palace is 278k tris (budget 250k,
  a warning) and the sheet is at 2.99M of 3M: the next type needs lower-poly upper columns.
- **Eternian** close-out (census complete, Farside's works, buff brick, statue poses). **Zeijani + Dhelv** P8 (docs, PORT, INDEX).
- **Construction** (`-kits-b`): its own build, sheet, verify, library textures.
- **Tents** (`kits/tents`, NEW, `-kits-b`): 25 culture-neutral defs, eleven dresses, interiors `kits/interiors/sets/tents.js`, flap doors,
  `core/camp/50-camp-tents.js` (role, culture) -> tent and a caravan halt. Reads the Scyvoi tent toolkit in place (moving it into core is
  a follow-up). Two cloths owed (PROMPTS-NEEDED section 42).
- **Beast Riders faithful port** (`-kits-b`): Girder's and Mav's Refuge's buildings read in place (openings, glass, core/door), matched to
  their towns by verify. Mav's walk-and-reach now runs and fails (370 of 2,373 store floors): recorded, from earlier walk work.
- **Own sheets** for the six culture kits moved out of settlements (`-sheets`, and `ac9d82ff`): Iziz Vernacular, Highlands, Xanadu, Yuni,
  Locus, Eastern Abyssal (the Yuni engine still read in place from the worlds that forked it, MODULARITY-PLAN step 4b).
- **Highlands interiors** (`-hlxa`): hollow walls, real doors, walkability; **the Hall of the Republic** (`kits/highlands/hall/BLUEPRINT.md`:
  parliamentary programme, 52 floors reached) and **the Roketstad fortress** as military HQ and the residence of the **First Citizen**
  (`kits/highlands/fortress/BLUEPRINT.md`, 33 floors; the title recorded in LORE.md and settlements/highlands/DESIGN.md, the owner's).
  Roketstad's missing core/biome fragments fixed (31b, 31j, 33). Furniture textured.
- **Xanadu interiors** (`-hlxa`): `kits/interiors/sets/xanadu.js` (108 items), hollow walls, doors.
- **Erewhon's citadel**, Moorish and Mughal (`-citadel`; the owner's references in `settlements/xanadu/citadel/refs/citadel/`, STYLE.md):
  nine hollow buildings, 132 rooms, 160 doors, muqarnas, star ceilings, jali, iwans; set `xanadu-citadel`.
- **Both Pleasure Domes** (`-pleasuredome`; references and STYLE.md in `refs/pleasure-dome/`): black-and-white pattern system
  (`kits/xanadu/src/78a-78d`); the citadel's dome black over white (2:1), the Dome of the Bay white over black; turquoise outside.
- **Xanadu gardens inside their footprints** (`-xagardens`): `node kits/xanadu/tests/test-footprints.js` (a test_all step).
- **The palace moved 2 m north** (`97282b12`, the owner's decision).
- **The one Xanadu/Erewhon/Longsong rebuild** (`-xarebuild`, `6a8016fd`): the Dome inside its lot, the lots clear, the citadel no longer
  stripped of interiors by the Xanadu hold; Erewhon --assert and --interiors OK (53,240/54,985 floors; citadel 133/133; domes 78/78, 4/4).

**Cross-kit**
- **One key map and walk mode** (`-walk`): `core/host/92k-host-keys.js` (`KHOST.standard`), a sub-stepped walker, harness asserts; adopted
  by every core/engine kit and ~25 other builds (list and the not-yet-adopted ones in TODO.md). **Interiors with a cut-away in core/engine.**
- **Doors and glass leftovers** (`-doors`): Verge and the isle demo host doors; the interiors shell's leaves on KDOOR/KGLASS and IX.walk on
  core/walk; Yuni's room doors; leaf hardware; the Godot importer for KDOOR (passes on 4.7.2). Not fixed: Locus `?interiors=1` (390/510
  floors), Mav's first walk freezes the page.

**Shared fixes (ride-alongs)**
- `core/biome/30-core-foliage.js` stemClump (`e8df733d`: a `;` ended a const list; `bk is not defined` on many pages).
- From `claude/dreamy-tesla-wzp8hw` (the owner's other session, owner-confirmed): `KSHADOW.units`/`maxUnits`, `regOccupancy` ground/far,
  the interiors food anchors.
- The `dalab` socket pack (Span flies it), water breakup on by default (ext/56 in all 43 core/water builds), the succulent column
  backport (nsemiarid), Ys/Dalab/Shade reading their biomes in place.
- Triage (`-triage`, `HANDOFF-REBUILD.md` top section): new failures fixed; the lava/scarp/water-gaps goldens fixed for Node 22/24.

## In flight when written (merge these when they finish)

| Branch | Session | What |
|---|---|---|
| `ccr-55bd6ee1-p1si44-allbuilds` | `session_018FfX1QUSU28wNeEMAPU9WC` | **The all-builds rebuild.** Ride-alongs done first (the catalog's `tile` texture family; the Highlands great-building room kinds into `kits/interiors/src/30-programs.js`; the last `||` defaults), every build rebuilt and committed by area, then verify on changed pages, `core/engine/fingerprint.py --write`, furnish fingerprint, `PORT-BASELINE.json` for checked pages, `DEPS.json`, test_all. At `8ea09e0b` at 09:05 with the pages pushed; verification in progress. |
| `ccr-55bd6ee1-p1si44-goldenway` | `session_018FfX1S6sVJgmo7M9K1gToN` | **The Golden Way as a descending court** (owner, 2026-11-10): the 18 m step between the citadel palace (level 153) and the Garden Pleasure Dome (171) in Erewhon. Merges allbuilds before its one Erewhon build. |
| `ccr-55bd6ee1-p1si44-textures` | a local session on the owner's PC, if started | **The textures delivered 2026-11-10** (`C:\Users\travi\Documents\Codex\2026-11-10`): matched to PROMPTS-NEEDED ids, processed into the library, wired where stand-ins wait (the citadel's eleven families, the domes' marbles and op-art, the tents' cloths, older biome items), entries deleted from PROMPTS-NEEDED. No pages rebuilt: after merging it, rebuild and verify the builds whose `tex/` changed (its report lists them), and update their baseline entries. |

Suggested order: allbuilds -> goldenway (it already carries allbuilds) -> textures -> the textures' rebuild -> `main`.

## How the merges were resolved (so a re-merge does not undo them)

- **Built pages, manifests, build-inputs** that clashed kept one side's copy and are redone by the all-builds rebuild; never hand-merge them.
- **Lint pairs:** where two sessions wrote the same fix, the `x == null ? d : x` form was kept.
- **`TODO.md`:** the ride-alongs list keeps the ride-alongs session's text plus the two items the Highlands/Xanadu session parked.
- **`kits/xanadu/README.md`, `settlements/xanadu/KNOWN_ISSUES.md`, `kits/interiors/sets/README.md`:** both sides kept.
- **`settlements/xanadu/build.py`:** `furniture_bundle.bundle(FURN_CULTURES, tex=True) + kit_bundle.bundle(['xanadu', 'xanadu-citadel'])`.
- **`settlements/mavs-refuge/src/98-start.js`:** MRWALK.ensure on first walk AND `KHOST.take(KHOST.standard({...}))`.
- **`kits/yeti/build.py`:** `CORE_HOST = khost.SHELL + kengine.HOST` with Yeti's forest-steppe BIO_BAND kept.

## Known failures (not from this round, or recorded)

- isle-demo node tests and `kits/interiors/tests/test-walk.js` fail on a fresh checkout until the LFS file is fetched / `dist/isle-city.plan.js` built; same on main.
- Dalab's main page over its instance cap (swlowlands/glossy 282,687 > 250,000): pre-existing, in Dalab's KNOWN_ISSUES.
- Guilin, Pinnacle Rock fail their own biome checks as before; Tents' own interiors-reachable; Locus `?interiors=1`; Mav's reach.
- 43 non-garden Xanadu defs reach past their lots (recorded as KNOWN in the footprint test, which fails if any grows).
- No GPU was available: every verify ran on SwiftShader. A GPU `--assert` / `--all-views` pass on the owner's lanes is still owed.

## Owner decisions taken this round

Palace 2 m north; the Golden Way a descending court; both domes black-and-white (citadel black over white, Bay white over black), turquoise
outside; the rest of the citadel Moorish and Mughal; the First Citizen; `claude/dreamy-tesla-wzp8hw`'s ride-along versions; Erewhon/Xanadu
rebuilt once, not per session.

## Still owed / open

- **Gallery:** not republished. This is a wide change (CLAUDE.md "Publishing"): ask the owner once the all-builds rebuild is in.
- **Textures:** `core/materials/PROMPTS-NEEDED.md` (36 blocks when written; sections 41-42 are this round's) minus whatever the 2026-11-10
  delivery covers.
- Follow-ups recorded in TODO.md and the kits' KNOWN_ISSUES: Yuni's own walker onto core/walk; the not-yet-adopted builds of the key map
  (Metropolis, Dhelv, Highlands, Xanadu, Noah's Regret, Voth, the isle demo, the own-camera sheets, most biomes); the tent toolkit into
  core; Pylon's and Talia's leftover interiors; the open-world hamlets' doors drawn shut.
