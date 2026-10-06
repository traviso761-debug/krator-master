# Krator: the visual bar

The standard every Krator world is judged against, how it is measured, and which engine
carries each part of it. `README.md` holds the design rules (tagging, modularity, the
skybox, the shared water and sky light); this file holds the *look*. Read it before a new
build, before a texture or lighting pass, and before closing any phase that changes what a
world looks like.

Adapted on 2026-10-05 from the brief and working logs of LAAS
(https://github.com/Braffolk/fable5-world-demo), a procedural forest on three.js WebGPU whose
frames hold up against UE5 reference shots. Its renderer passes do not transfer to Krator's
three.js r128 pages. Its rules and its review loop do, and Godot 4 supplies the heavy
rendering natively (section 6). The one-line lesson from its logs: most of the visual gain came
from exposure, grading, chromatic shadows, variation and geometry underfoot, not from the
exotic passes.

## 1. What the bar is

**The reference is a picture, not an adjective.** Every build keeps one to three reference
images in `<build>/reference/` (the painting or photo the world was made from, per the
`painting-to-3d-world` skill, plus a current-generation game frame of the same kind of place
when the painting is not photographic). A phase closes when the closest shot of the world
stands next to the reference and the eye does not snag within one second on a *category*
error: flat ground, dead shadows, cloned trees, smooth hills, a sky dome.

The world will not match the reference. The task is to know precisely how far it is from it,
and never to build to a lower bar because the lower bar is comfortable.

**Two frames per build.** Each settlement and biome names two acceptance frames in its
`README.md`: one ground-level frame (a street, a streambed, a forest floor: whatever a player
stands in most) and one vista (the skyline of the place against its horizon). Both are
preset views `verify.py --views` can shoot, so they are repeatable.

## 2. The pillars

When a decision is not covered here, resolve it in favour of the pillar.

**A. Geometry near, texture far.** Within 10 m of the camera, detail lives in silhouettes:
grass is blades, litter is meshes, cobbles are cobbles, a wall has a cornice and a sill, not a
painted line. Texture carries detail from 10 m out. *Rule: in a ground-level frame, bare
terrain texture occupies no meaningful screen area inside 10 m.*

**B. Light transport.** No black or grey shadows, ever. A shadowed leaf reads green, shadowed
stone reads sky-blue, a shadowed wall under a warm roof reads warm. Interiors seen through a
door are lit by something. *Rule: sample any shadowed-vegetation or shadowed-stone pixel;
if it is desaturated grey, the lighting has failed.*

**C. Nothing is bare.** Every surface class has occupants: walls carry staining, ivy, window
boxes, soot above fires; tree bases have root flare and litter; wet margins darken; roof
edges have moss on the north side. The world has been inhabited for centuries; it is not
assets on a heightmap. (`core/atmos` dressing and the biome core's placement already do much
of this. The rule is that a bare surface is a bug, not a default.)

**D. Distance holds.** Far hills are serrated, not smooth fBm humps. Mid-distance forests
read as lit canopy with height variation, not green fog. Distant settlements keep their
skyline. Fog is weather, never a cover for draw distance. The painted mountains of the
standard skybox are a placeholder until the open world (`biomes/WORLD.md`) supplies real
ones; until then they must at least agree with the local terrain in colour and light.

**E. Art direction.** Each build has a colour script: a per-hour grade (the shared sky and
`core/atmos` weather drive it), a value structure for its acceptance frames (dark foreground
frame, lit midground subject, luminous background), restrained saturation. Showcase
viewpoints are composed, not found.

**F. The world moves.** Wind through every plant, banner and smoke column; water flows and
foams at obstacles; particles ride the air; people and animals keep schedules (`README.md`,
the life layer). A frozen frame should feel one second away from motion.

**G. Variation.** All vegetation and all repeated props get hue, value and age jitter per
instance; a fraction of every population is dry, broken, dead or repaired. Textures carry a
macro variation layer (2 to 50 m breakup) so tiling is invisible at mid range. Uniformity
reads as 2010.

## 3. Banned outcomes

Any of these in an acceptance frame fails the phase, whatever the code looks like.

- Black or grey-ambient shadows; a flat-lit canopy interior or street.
- Bare terrain texture underfoot; a streambed or a floor that is a texture.
- Smooth low-poly silhouettes on a hero rock, cliff, tree or landmark building.
- Cloned trees or props (one mesh varied only by rotation and scale); placement grids;
  uniform scatter without clumping.
- Clouds as a texture dome; distant mountains as smooth humps or fog cut-outs.
- Fog deployed to hide draw distance; visible level-of-detail pops.
- Single-noise albedo; visible tiling at mid range; a vegetation population of one green.
- A frame that changes nothing when the hour changes (no colour script).
- Painting over a missing texture with a procedural stand-in without saying so
  (`CLAUDE.md`, Textures).

## 4. Measured gates

These run on the headless screenshots `verify.py` already takes. Each is a few lines of
pixel arithmetic over a PNG; add them to the shared verification helpers once and let every
build's `verify.py --assert` call them. Thresholds are starting points; tighten per build.

| Gate | How | Pass |
|---|---|---|
| Shadow colour | Sample 16 shadowed-vegetation and 16 shadowed-stone pixels at the build's golden-hour view. Chroma is the distance of the pixel from its own grey in display space | Mean chroma above 12/255 for vegetation, above 8/255 for stone; no pixel below 3/255 |
| Bare ground | In the ground-level acceptance frame, classify pixels inside the near third of the frame as terrain-material versus everything else (the inspector's tags make this exact when the shot is taken with the id buffer on) | Terrain-only pixels under 5 % of that region |
| Repetition | Fly a 500 m straight line through the densest flora or the longest street; shoot every 50 m; compare consecutive frames for recurring silhouettes at the same screen offset | No feature repeats at the same offset in three consecutive frames |
| Hour sweep | Shoot the vista at hours 6, 12, 17 and 22 | Mean colour of the sky and of the lit ground differ between each pair; none is grey |
| Tiling | Autocorrelate the mid-distance band (10 to 60 m) of the ground-level frame | No peak above 0.5 at the texture's tile period |
| Silhouette | Shoot the hero landmark and one hero tree against the sky at dawn, edge-detect | The outline has no straight segment longer than 1/40 of the frame height on rock or tree |

Record the numbers in the build's `KNOWN_ISSUES.md` when a gate is failing by design (a
kit in progress, a texture the owner has not supplied yet) so the failure is a known one.

## 5. The delta loop

Mandatory at the close of any phase that changes the look of a world. It is cheap and it is
where LAAS found most of its real fixes.

1. Shoot the closest match to each reference image (`verify.py --views`, `--out shots/`).
2. Place it side by side with the reference (one PNG, reference left).
3. Write `<build>/DELTA.md`: the ten most visually significant differences, ranked by impact.
   Tag each with the phase that owns it. Strike items as they are fixed.
4. Fix the top three that belong to the current phase. Re-shoot.
5. Score the rubric (section 7). For each row, write the one change that would raise it by
   two points. Do the two cheapest before the next phase.

Honesty rules for the loop: every "fix" gets an ablation switch (a URL flag or a build
constant) so the before and after can be shot from the same pose, and a fix that moves
neither the picture nor the frame time is reverted, not kept. LAAS's logs record several
fixes that did nothing until an exposure key moved; test the exposure and the grade first.

## 6. Which engine carries what

Krator's three.js r128 pages generate and preview; Godot runs the open world (`GODOT-PLAN.md`).
So each pillar has a *now* (what the preview page should do today, cheaply) and a *Godot*
column (what the port is expected to deliver, and what the exporters must carry so that it can).

| Need | Now, in the r128 preview | Godot 4 | What the export must carry |
|---|---|---|---|
| Tone and exposure | `ACESFilmicToneMapping` plus an exposure constant in every build (Girder has it only in library-texture mode; make it a `core/atmos` fragment) | `Environment` tonemap (ACES or AgX), auto-exposure | the exposure and grade per hour as data in the atmos presets |
| Per-hour grade | the `21-sky.js` lineage's sky colours plus a split-tone pass in the atmos weather hook | `Environment` adjustments, a colour LUT per hour | the colour script table |
| No black shadows | hemisphere light tinted from the sky and the ground palette; `ATMOS.skylight` reflections; a floor on shadow darkness | SDFGI or VoxelGI, SSIL, sky-based ambient | sky and ground colours per hour; material albedo honest enough for bounce |
| Shadows | one 2048 or 4096 cascade from the sun, PCF soft | 4 directional cascades, PCSS-style blur, contact shadows | nothing beyond the sun's path |
| Ground geometry near | biome core places grass, litter and cobbles inside 10 m with `core/lod` dropping them beyond | MultiMesh scatter with distance fade, shader-driven grass | the biome items and buckets (`biomes/GODOT.md`) |
| Variation | a per-instance colour attribute on every `InstancedMesh` (hue, value, age); a dead fraction per population | `INSTANCE_CUSTOM` on MultiMesh | the jitter seed per instance in the biome export |
| Macro texture breakup | a breakup mask in `KMAT` (`core/materials/record/`) blended over albedo at 2 to 50 m | the same mask in a `.gdshaderinc` | the mask as a texture plus its world scale in `materials.json` |
| Distance | far hills in the skybox agree with the local terrain's palette and light | the open-world heightfield, far-detail normals in the terrain shader | the terrain bake (`biomes/WORLD.md`) |
| Clouds and sky | the standard skybox's painted sky; no volumetrics | `PhysicalSkyMaterial`, volumetric fog for valley haze and shafts | the atmosphere presets |
| Water | `#include <atmos_waves>`, the shared wave field | the wave chunk as a `.gdshaderinc` (`core/atmos/GODOT.md`), SSR | the wave uniforms |
| Wind and motion | `ATMOS.windAt`, the gust field, flora sway in the biome shader hooks | the same field as a global shader parameter | the wind preset |
| Anti-aliasing | MSAA where the frame budget allows | TAA or FXAA | nothing |

Things the preview should not attempt: global illumination passes, volumetric clouds, screen-
space reflections, temporal anti-aliasing. r128 on WebGL cannot carry them at an explorable
frame rate, and the Godot column has each one. Spend the preview's budget on the rows above
the line and on the gates in section 4.

## 7. The rubric

Score each row after a phase, in the build's `DELTA.md`. Anchors: **10** passes a one-second
glance against the reference at 1080p; **7** is clearly synthetic but the same class of
image; **4** is a good hobby demo; **2** is a 2010 tech demo.

| Row | What a 7 looks like |
|---|---|
| Terrain and geology | hills and cliffs with a reason for their shape; no smooth humps |
| Buildings up close | openings, trim, staining, roof furniture; no blank wall inside 10 m (`README.md`, facades) |
| Tree and plant fidelity | species silhouettes distinct; per-instance structure, not rotation |
| Variety and clumping | populations clump by light and water; a dead fraction visible |
| Ground detail density | geometry underfoot; no bare terrain texture in the near third |
| Light transport | chromatic shadows, lit interiors, no grey |
| Atmosphere and sky | the hour is legible from the sky alone; haze layers with distance |
| Distance fidelity | the skyline and the far hills hold their shape |
| Water | flow, foam at obstacles, wet margins, a reflection of the build's own sky |
| Motion | wind, water, particles, people on schedules |
| Colour script and composition | the acceptance frames have a value structure; the grade changes with the hour |
| Performance | the preview holds its stated frame rate at its default level of detail |

## 8. Writing it into a build

- New build: list the reference images and the two acceptance frames in the build's
  `README.md` before placing anything. Add the preset views for them.
- Each phase close: the delta loop (section 5), the gates (section 4), the rubric (section 7).
- A texture or lighting pass on an existing build: shoot before and after from the two
  acceptance frames and attach both to the commit message or the PR.
- When a gate cannot pass because an asset is missing, ask the owner for the asset
  (`CLAUDE.md`, Textures) and record the gap in `KNOWN_ISSUES.md`. Do not lower the bar.
