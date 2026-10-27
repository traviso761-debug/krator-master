# core/water: what keeps going wrong, what core should do about it, and how to build a biome's water

Written 2026-10-27 from one session's fixes (the SW highlands' cave-stream mouth, the Rift jungle's falls, eastabyss's
delta, lake and stream) read against the water lessons in the painting-to-3d-world skill (`SKILL.md` 5l, the Hook and
Pinnacle sections, `references/threejs-pitfalls.md`, `references/forking-a-world.md`) and `HANDOFF-REBUILD.md`'s
turn notes. The README is the contract; this file is the practice.

## 1. Five root causes behind nearly every water complaint

Each owner note this session, and most in the skill, traces to one of these. The fix was never a better shader
number; it was making two things agree that had been computed apart.

| Root cause | Seen | Owner's words |
|---|---|---|
| **The water and the ground disagree** | eastabyss: ribbons 30-38 m over a carve under the level out to 22 m (lake pockets beside them); Rift: pools 4 m above the floor they sit in, reaches sinking under a bed that rises downstream; SW highlands: the river's level 1.1-1.7 m over the valley floor; skill: streams bridged by a coarse ground mesh, model levels rising downstream, springs on a slope floating | "unnatural shoreline break", "flat slabs", "water ran uphill" |
| **Two waters drawn in one place** | eastabyss: channels over the lake and over the marsh water filling their own beds; three ribbons overlapping at each fork; Rift: a 60 m plunge disc over dry ground; SW highlands: two ribbons at a mouth | "rides over shore water", "foam/alpha on the sides", "a line across the mouth" |
| **Features placed from the plan's numbers, not the ground** | Rift: lips 13 and 30 m past the cliff edges (the scarp's nominal distances), pools 26-37 m past the toes; skill: a sited marker on a dry swell 8 km from the streams | "a short pale smear", "hangs in front of the face" |
| **Regular patterns from a few sines** | eastabyss: the lake's three swells glint in stripes, still water's three cosines, a ribbon's four cosines crossing in a herringbone; skill: terraces as quantised bands read as chevrons | "grid like ripple pattern", "strange zigzag" |
| **Silent failures** | breakup's chunk placed ahead of the open water's clock: the lake and the marsh stopped drawing, the only trace a NaN in the HUD; a page that renders only on camera moves showing a stale frame; skill: SwiftShader forgiving undefined GLSL, a fog replace keyed on the wrong name doing nothing | (none: nobody saw it until a probe did) |

## 2. Core improvements, in the order they would pay

Done this session (opt-in, tested, in `README.md`): `WATER.confluence` and `fadeRibbons` (ext/55), `drawFlow({keep})`,
`drawFall({plungeR, footK})`, `WATER.breakupAll` / `breakupFlows` (ext/56), the brine/blood/clear looks, pans and ice
(ext/54). Since written (2026-10-27, the core pass; README "The core pass"): item 1 and 3 (`WATER.audit`, `lipAt`, `toeAt`,
`levelFromDownstream`, ext/57), item 2 (`WATER.network`, ext/59), item 4 (`WATER.maskFromGround`, ext/58), item 5 ready behind
`WATER.BREAKUP_AUTO` (the flip parked in `TODO.md`), item 8 (`drawFlow({refine})`); items 6 and 7 are core-shader's (`KHOOK`, `KCOLOR`);
item 9's state is in the README's Godot notes. The list as first written:

1. **`WATER.audit({ground, surfaces?})`: the water-ground contract as one check.** *Written 2026-10-27: ext/57, `test-audit.js`, README "The water-ground audit".* Every fault in row 1 and most in
   row 3 was found by a probe written by hand for that page. Make it a core function that a `verify.py` calls, each
   rule with a negative input in its node test:
   - a flow's level never rises downstream; its water never under the ground at the centreline; its ribbon edge no
     more than ~0.3 m over the ground (a slab) and the ground under the level no wider than the ribbon (pockets);
   - a still's level at or under its rim's ground all round, and over its floor;
   - an open surface's mask edge never across ground that is under its level (a cut edge), except where another
     surface owns that ground;
   - a fall's lip within a metre of where the ground first drops (`h(d) - h(d - 1) > 1`), at its flow's surface there,
     its curtain never under the ground, its plunge disc inside water;
   - two surfaces overlapping only where a confluence, `keep` or a join says so.
   It returns findings as records (`{rule, surface, x, z, by}`) for the inspector and the export.
2. **A flow network instead of loose flows.** Today a page makes each flow, then wires each meeting by hand (`WATER.join`,
   `confluence`, `fadeRibbons`, `keep`, a plume tint). `WATER.network({flows, parent, into, ground})` would take a
   parent for each tributary or distributary and the open water each ends in, and make every confluence and fork, every
   `keep` fade into a lake with its plume, and the right ribbon order, from the graph. eastabyss's six flows, two forks
   and four mouths would be one call.
3. **Ground-derived placement helpers.** *Written 2026-10-27 in ext/57 (`fallsOf({ground})` with it).* `WATER.lipAt(line, ground)`, `WATER.toeAt(line, ground, lip)` and
   `WATER.levelFromDownstream(line, ground, {over})` (each level the higher of bed + over and the level below it: never
   rising, never under the ground) are the three functions the Rift's 89w had to invent. `fallsOf` should take the
   ground and place lips and feet by them.
4. **The shore from the ground, not the mask.** An open surface given a bed should clip at depth 0 (ground over the
   level) with a soft fringe, and use its mask only as the coarse region it may cover. The 8 m mask cell is what made
   the straight and angular shorelines; the ground's own contour is round.
5. **Breakup on by default at the next all-builds rebuild** (the owner's call: it moves every page). Every lake, pool
   and river had the regular-sine look; nobody wants it. Until then `breakupAll()` + `breakupFlows()` in every 89w.
6. **Program checks.** `WATER.checkPrograms(renderer)` listing any water material whose program is not runnable
   (`renderer.info.programs[i].diagnostics`), asserted by the verify harness. A node test's stub shader must also carry
   the real chunk order (the breakup test passed while the page failed because its stub had no `atmos_waves`).
7. **Colour space in one place.** A tint field's colour is mixed in linear light; a display hex there reads as a white
   halo (eastabyss's first plume). Tint helpers should take a `THREE.Color` or a `linear` flag, and say which.
8. **Ribbon resolution follows its effects.** A ribbon's rows are `step` apart (eastabyss: 30 m), so any per-vertex
   effect (`keep`, chutes, the end of a channel) needs `densify`. `drawFlow` could add rows where `keep` or the slope
   changes fast.
9. **Godot parity.** The importer does not draw confluences, `keep`, breakup, `footK`/`plungeR`, pans or ice; their
   records are exported (`water_import.gd` notes). A `.gdshaderinc` of the breakup and the confluence's grid mesh are
   the two that change how ported water looks.

## 3. Building a biome's water: the practice

**Before drawing anything**
- Read the water's levels from the ground, and grade them: a bed is the running minimum downstream, and a reach's
  level is set from downstream (`y = max(bed + 0.6, level below)`) so it neither climbs nor sinks under a rising bed.
- Carve every channel to its ribbon: the ground under the level exactly as wide as the water you draw (ribbon width
  plus its margin covers the carve), banks rising above the level within a couple of metres of the edge. A ribbon over
  uncarved ground is a slab; a carve wider than its ribbon leaves pockets for other water to flood.
- Make the ground mesh finer than the narrowest channel, or give small water its own strip mesh and hold the coarse
  ground under it (skill: a 6.5 m brook on 6.7 m cells is mush).
- Find lips, toes and pool centres on the ground (the first metre-per-metre drop; where it levels off), never from the
  plan's nominal distances. Put the pool where the water lands; carve its bowl under its level; level the ground under
  a spring's rim to the spring's height.

**One owner per place**
- Every square metre of water has one surface that draws it. Where two meet, decide who owns the seam:
  a tributary into a river or a fork: `WATER.confluence` over the overlap and `fadeRibbons`;
  a channel into a lake or sea: `drawFlow({keep})` fading it over ~45 m, the lake's tint carrying its colour as a plume;
  a channel crossing a marsh: keep the marsh's mask out of the channel's bed.
- A plunge disc is churn, not the pool: draw the pool as a `WATER.still`, the disc inside it (`plungeR`).
- Order matters only where two transparent waters must overlap on purpose (a tributary drawn after its river).

**Looks**
- Start from photographs of the real form as soon as a natural thing looks wrong twice (skill, the terraces); then
  model the form, not the numbers.
- Break up every surface built from a few sines (`breakupAll()`, `breakupFlows()`); keep foam to real banks, rapids
  over the reach's mean gradient (skill: a mountain stream's mean slope is already "foam"), the meeting of two currents
  a faint churn (.12), never a line.
- Tall falls: the curtain held to its foot (`footK` ~.8), down the face when it is not sheer (`face: terrainH`),
  lip at the river's surface at the edge.
- Colours: ribbons and tints mix in linear light (convert display hexes); a shallow pool under a hazy sky needs the
  low Fresnel (skill pitfalls); a ShaderMaterial is unlit unless it follows the light mode.

**Checking**
- Look from the owner's angle and from above, with the Browser pane fronted (a hidden pane runs as a background page and
  shows stale frames; these pages render on camera moves). One screenshot per meaningful change.
- After any shader change, read the program diagnostics, not only the screen: a failed water program draws nothing,
  silently. A NaN triangle count in the HUD is one symptom.
- Probe the contract (section 2, item 1) until `WATER.audit` exists: levels along each flow, ground vs water across
  each ribbon, lips and toes against the ground, mask edges over under-level ground. Each check with a broken input
  that must fail.
- Every core change opt-in, its default text hashed (`test-gaps.js` loads every ext fragment), its twin tested in
  `glsl-interp.js`, and the biome's `verify.py --assert --all-views` on the GPU (one lock) before handing it on.
