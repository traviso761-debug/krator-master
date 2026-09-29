# Mav's Refuge — tree city of the beast-riders (Krator)

A refuge in the hypertropic (XA) jungle on the SE, lee shore of the Ring Sea:
~1.9 atm, red soil, iridescent canopy; the volcano lies NW across the sea, the
gas giant hangs in the NE. Built with the painting-to-3d-world skill as a
procedural Three.js (r128) world in one self-contained HTML file, on the Voth
engine pattern (numbered `src/` fragments → `build.py` → `mavs-refuge.html`,
`verify.py` headless with `--assert` invariants). **Units are metres.**

## Brief (Travis, Sep 20 2026)
Tree city on 300–480 m hypertrees. 5 residential trees, 3 gateway trees (giant
baobabs carved down to ~30 m above ground, spiral ramp, rope ladders + beast-
drawn lifts — un-assailable), a larger central platform (market / muster /
plaza on top under a rain canopy, 5 storehouse+workshop levels, hangars at the
bottom) with the ornate steep-roofed Council Chamber above it on the same tree,
a Rookery (3 roost levels, barracks + proving ground on top), a spider nest
platform (web levels), satellites with homes/farms, rope bridges everywhere and
a chain across the river. Pizza-slice buildings; Javanese + Viking/stave +
Kashyyyk vocabulary; 4 hypertree species (gates on baobabs), 2 wild trees per
occupied one; dark Amazon-floor jungle, fallen logs (one bridges the river),
river with 2 cataracts; staggered evening window lights + lamps with Voth-like
glow; flying beasts (quetzalcoatlus, dragonfly, bat, archaeopteryx, riders)
with roost turnover; spider-riders climbing and leaping; pedestrians on every
level via 3 stairs per level; soldiers at the gates; Voth-style dev tools.

## Layout as built
- River runs E→W through z≈0 (cataracts at x=560 and x=-430). North bank:
  Mav's Crown (-40,-250, R130, y205) + Council (y269, R46), Ghostwood Hold,
  Prism Hold, Highbough, The Rookery, NW Gate, East Gate. South bank: Southbank
  Hold, Riders' Rest, The Silk Loft, South Gate. 35 near hypertrees, 210 far.
- 79 platforms (11 main + council + 67 satellites), 82 rope bridges (longest
  76 m), 379 bough skeletons (satellites sit on `under` boughs or hang from
  `over` boughs), 555 roost bays, walk graph ~7.7k nodes (fully connected,
  includes a forest-floor trail over the log bridge between the S and E gates).
- Platform section: deck; each lower level steps in 3 m; open gallery at the
  rim, rooms behind, core wall at Rin. 3 stair bays per main platform: lane A
  flights descend inward, lane B corridor back out.

## Architecture decisions worth keeping
1. **Polar frame per platform** (`platXZ(P,r,a)`), lots/rooms are annular sectors.
2. **Two geometry paths**: instanced kit (BOX/BEAM/ROD… with full rotation) and a
   merged-mesh builder (SECTOR, SECTOR_ROOF, RING_HOLES, MCONE, TUBE).
3. **Night light VOLUME** (256²×40 slabs in one atlas; R warm, G windows, B cool)
   instead of Voth's 2-D lightmap, because levels stack at the same XZ.
4. `trunkR(T,y)` and `BRANCHES` skeletons are the contract between layout,
   bark, platforms, spiders and flyers.
5. Guards added from the skill's Voth lessons: kit pushes after the emit raise
   an error-panel message (bake order); build.py rejects cross-fragment
   top-level name collisions unless the fragment is one IIFE; GLSL clamp rule
   and indexed-geometry rule written into API.md.

## Fragments / owners
See `API.md` (the contract handed to subagents). Planner keeps 05,10,30,32,45,
47,50,63,72,75,80,81,85,86,87,98. Subagent-built leaves: 20/21/82 sky port,
55 deck architecture + plaza + council, 56 levels + gate carvings, 60 trees,
62 jungle + water, 78 people/soldiers/lifts, 79 spiders, 84 flyers.

## State after pass 1
~4.1 M triangles, 62 draw calls, ~98k kit instances. All 9 invariants pass.

### Known gaps / next
- Flyers: wingtips clip gallery posts on landing; circuit flyers never land;
  bats return mostly at dawn; rider lance stays on saddle when dismounted.
- Gate facades stand up to ~1.5 m proud where bark relief dips.
- Jungle pass is ~2× its triangle budget (905k) — trim if frame rate suffers.
- `verify.py --sweep` is meaningless here (merged meshes have city-wide boxes).
- Headless full-world runs take 3–6 min; run view batches in the background.
