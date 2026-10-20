# Spike: Godot's SpringBoneSimulator3D on the character kit's cloth chains

2026-10-19, branch `claude/godot-springbone-spike-55e015` (cut from `claude/beautiful-bardeen-i0th9m`), Godot 4.7.2.
The man in the Voth court robe, skirt and sandals, run through the walk and the standing idle with the GDScript
Verlet chains of `kchar_figure.gd` and with Godot's built-in `SpringBoneSimulator3D`, behind a flag
(`KCharFigure.spring_sim`, off by default: the Verlet stays the twin of the page).

## Recommendation

**The node attaches to the kit's chains without any re-import, runs about twenty times cheaper than the Verlet and
does not fold** (one to three bones past 1.5 rad from rest, against 112 of the Verlet's, the known issue), with half
the frame-to-frame swing. **But it is not a drop-in**: Godot's solver (push a joint out of a collider, then clamp it
to its length) cannot take the kit's capsules as the Verlet does. With the Verlet's 2.2 cm pad, 38 of the robe's
rest points lie inside the trunk capsules and the solver walks the mantle off the back and bells the skirt, in the
idle as much as in the walk. Without the pad the drape measures the same as the Verlet's (last bones 0.11 m from
the rigid rest against 0.12 m) and the skirt looks right, but at mid-stride the mantle still lifts further than the
Verlet's hem flap, and the shader's end radii (`ra`, `rb`) must stay off the chains. Several of the Verlet's rules
have no counterpart (below). So: **worth adopting for the Godot twin, on three conditions**, each a day or two:

1. Colliders fitted for this solver: the chest, hip and seat capsules with the rest pose outside them (or an inset
   per garment part), checked with the last-bone offset measured here rather than the swing alone.
2. Per-part collider sets through `set_collision_path` / `set_exclude_collision_path` (a mantle ignores the
   thighs; a skirt ignores the chest), standing in for the layer rules it cannot express.
3. The page moved to the same spec (`@pixiv/three-vrm-springbone`) only after 1 and 2 hold on the robe, the
   skirt and one hanging sash on both bodies; until then the Verlet is the truth both runtimes share.

If the owner wants the Godot twin to look like the page *now*, the answer is still the Verlet: it keeps the fold
bug, but the drape is the page's.

## What was built (all behind `spring_sim`)

- `_cloth_of`: each chain gets a tip bone (`cloth_<item>_<chain>_tip`, bound to nothing): the simulator's joints are
  bone origins, so the chain's last point needs a bone of its own. Bone count 367 to 428 on this outfit.
- `_cloth_rest` sets the tips' rests with the others and calls `_sim_build`.
- `_sim_build`: **one `SpringBoneSimulator3D` under the skeleton, a setting per chain** (61 here), root bone the
  chain's first, end bone its tip, `extend_end_bone` off, bones set by index (`set_root_bone_name` did not resolve
  here). The skeleton goes to `MODIFIER_CALLBACK_MODE_PROCESS_MANUAL`; `_sim_step` calls `skeleton.advance(dt)`.
  Per-joint values cannot be set at build time (the joint list comes on a deferred update), so each setting takes
  one value per chain, with `individual_config` off.
- **Mapping of the Verlet's numbers.** Godot pulls each joint a fixed distance a second along its rest direction,
  damps its velocity by a fraction a frame and adds gravity as a displacement a second. The Verlet's lerp to the
  rigid rest is spring and damper at once, so the two are matched on their linearised dynamics over one 30 Hz
  frame (two Verlet steps): `drag = 1 - b1^2`, `k = 2 - drag - 2 b1 cos(2 t1)`, with
  `b1 = (1 - s)(1 - D)`, `cos t1 = (1 - s)(2 - D) / (2 sqrt b1)`, `s` the part's `stiff`, `D = C_DAMP + C_DRAG h`;
  `stiffness = k * mean segment length * 30`, `gravity = C_GRAV h^2 * 30 * k / s` (the same sag at rest), the
  root speed's wind as `external_force`. For `stiff` 0.12 that is drag 0.33 and a pull of 42% of a segment a frame;
  a first, naive mapping (`60 * stiff * L`, drag 0.13) left the chains three times under-damped and swinging.
  The drag is a fraction a frame, so the mapping holds at 30 Hz only: **Godot's model is frame-rate dependent**.
- **Colliders** as children of the simulator: a `SpringBoneCollisionCapsule3D` per entry of `skeleton.json`
  `colliders` (radius `r`, morphed by `KChar.colliders`), bound by `bone_name` to joint `a`, its `position_offset`,
  `rotation_offset` and `height` set every frame from the live ends (`_cap_ends`: the seat capsules ride the hips
  through their `pa`/`pb`, the two trunk capsules span a bent spine); a `SpringBoneCollisionPlane3D` at the ground.
  `spring_opts.ends` adds a sphere at each end with the push shader's `ra`/`rb`; `spring_opts.radius` sets the
  joints' radius (the Verlet's pad); `spring_opts.collide`, `noarms`, `stiff_k`, `drag`, `gravity` are the spike's
  switches (`tests/character/spring_spike.gd` takes them as flags).
- Cloth off, or a still pose: the chains are set to their rigid rest and the modifier deactivated (setting
  `active` resets the simulation, so it is set only on a change).

## Measurements

`tests/character/spring_spike.gd`: 10 frames to settle, 60 measured, at 1/30 s a frame, engine frames (a
`SkeletonModifier3D` runs at the skeleton's deferred update, after the frame's script). Per frame, over every cloth
bone: the mean turn from the previous frame (kchar_test.gd's measure), the largest angle from the bone's rest and
how many bones ever pass 1.5 rad (the fold), and the mean and largest distance of each chain's last bone from its
rigid rest (the drape: the swing misses a mantle lifted whole, which turns a few root bones only). Cost is the
script's side of the frame and the whole frame's wall clock (low-processor sleep off), one figure, this machine.

Pieces: the published Cosmetic Lab's GLBs decoded from their base64 text (no `pieces/` on this machine), which are
the build of commit `3c3b78be2`, two commits behind this branch's `kit.json`, so the spike runs that commit's kit
and skeleton (`godot/data/spike/`, gitignored) with a blank record (no morph, no blend shapes); the man's skeleton
is unchanged between the two.

**Walk**

| | swing rad/frame | max from rest | bones > 1.5 rad | last bone off rest, mean / max (m) | ms script / frame |
|---|---|---|---|---|---|
| Verlet (`kchar_figure.gd`) | 0.245 | 3.14 | 112 | 0.118 / 0.92 | 19.6 / 19.6 |
| **Simulator, no joint pad (default)** | **0.111** | **1.67** | **3** | **0.111 / 0.62** | **0.24 / 1.1** |
| Simulator, the Verlet's 2.2 cm pad | 0.121 | 1.79 | 6 | 0.148 / 0.72 | 0.27 / 1.3 |
| Simulator, pad and end spheres (`ra`, `rb`) | 0.118 | 2.05 | 7 | 0.174 / 0.85 | 0.24 / 1.7 |
| Simulator, no colliders | 0.086 | 1.59 | 5 | 0.086 / 0.65 | 0.17 / 0.6 |
| Simulator, no pad, drag 1 (no inertia) | 0.057 | 1.27 | 0 | 0.089 / 0.44 | 0.27 / 1.2 |

**Standing idle**

| | swing rad/frame | max from rest | bones > 1.5 rad | last bone off rest, mean / max (m) | ms script / frame |
|---|---|---|---|---|---|
| Verlet | 0.184 | 3.13 | 113 | 0.120 / 0.97 | 19.8 / 19.8 |
| **Simulator, no joint pad (default)** | **0.051** | **1.73** | **1** | **0.119 / 0.61** | **0.22 / 1.1** |
| Simulator, the Verlet's 2.2 cm pad | 0.059 | 2.34 | 5 | 0.150 / 0.67 | 0.34 / 1.5 |
| Simulator, pad and end spheres | 0.058 | 1.73 | 6 | 0.176 / 0.77 | 0.25 / 1.7 |
| Simulator, no colliders | 0.039 | 1.35 | 0 | 0.095 / 0.63 | 0.16 / 0.6 |
| Simulator, no pad, drag 1 | 0.032 | 1.89 | 1 | 0.156 / 0.88 | 0.24 / 1.1 |

The Verlet's numbers are kchar_test.gd's known ones (0.25 rad a frame with cloth on, the fold) once the figure is
stepped once a frame; `spring_oldcheck.gd` repeats kchar_test's own protocol on the spike's data and gets 0.251.
The simulator's whole-frame cost includes the modifier and the skeleton's update; its script side is the capsule
offsets. A stiffness ten times the mapping with no colliders holds every chain within 0.3 rad of rest (the frames
and rest directions are right); with colliders it blows the mantle out horizontally, which is how the colliders
were found to be the problem rather than the dynamics.

## Screenshots (`spike-shots/`, the walk at frame 34, 1.1 s in)

| | back | side |
|---|---|---|
| Verlet | `walk-back-verlet.png` | `walk-side-verlet.png` |
| Simulator (default) | `walk-back-sim.png` | `walk-side-sim.png` |
| Simulator with the Verlet's pad | | `walk-side-sim-padded.png` |

The Verlet: the robe hangs, the skirt drapes, the mantle's hem flaps out behind (the fold, hidden in the drape).
The simulator: the skirt drapes with sharper folds and swings with the legs; from behind the mantle lies on the back
with its corners out, from the side it lifts behind the shoulders at mid-stride, more than the Verlet's flap; with
the pad it stands off the back whole and the skirt bells.
`tests/character/spring_shot.gd` renders them (`--sim`, `--view`, `--clip`, and the switches above).

## What the node can and cannot express from the kit

Can:
- The chains as they are (parent joint, anchor vertices from the morphed garment, one bone a segment), with no
  change to `make_mpfb.py` or the GLBs: the kit's skeleton is built at runtime from `skeleton.json`, the cloth bones
  added in `_cloth_of`, so the simulator sees them like any bone. Re-import is not needed.
- Stiffness, drag and gravity per chain (per joint too, one frame after the build), the wind, a ground plane.
- The capsules, moved every frame to the live joints, including the seat's rest-point ends and the trunk's
  grandchild spans; end radii as spheres (not wanted, above).
- Collision sets per chain (`set_collision_path`, exclusions): the way to the layer rules, not used yet.

Cannot:
- **The ring constraints** (neighbouring chains of a part kept 0.6 to 1.2 of their rest apart): each setting is one
  chain; nothing joins two. The skirt holds together by its skin weights alone.
- **The layers and the `layered` cross-garment rule** (a mantle outside a hem outside a skirt, measured from the
  body's axis against the lower layers' segments; slot rank across garments): no inter-chain test exists. The
  nearest thing is per-chain collider sets, which keep a chain off the *body*, not off another garment.
- **The Verlet's drape rule** (across a limb nearer level than upright, out on the side of the point above, so a
  chain drapes over a raised arm or a seated thigh): Godot pushes radially from the capsule's axis, always.
- **The Verlet's pad** and rest points inside colliders: this solver needs the rest pose outside every collider.
- **Cloth lying on the body** is not the chains' business in either runtime: it is bound to the body's weights by
  `make_mpfb.py` (within ~4 cm of the skin, fading to the chains by ~9 cm), so it behaves the same both ways. What
  changes is that the chain-bound cloth no longer obeys `_layered`, so an under-layer can come through an outer one
  where the Verlet kept them apart.
- **The giant** (`kit.scale` 2.0 on the Skeleton3D node): not run. The joint lengths come from the bone rests in
  bone units, the positions from the skeleton's *global* transform in the default `CENTER_FROM_WORLD_ORIGIN` mode,
  so a scaled skeleton clamps its chains to half their drawn length. Either `center_from = BONE` on the Hips (the
  simulation then runs in bone space and loses the inertia of the body's world motion, as VRM usually does) or the
  scale moved off the Skeleton3D into the giant's rig (its `skeleton.json` joints and the pieces at 2.0), with
  gravity and the pull per unit.
- **Frame rate**: drag is a fraction a frame and there is no substep; the mapping is for 30 Hz. The Verlet steps at
  a fixed 1/60 s whatever the frame rate. A game at 60 fps would need the mapping redone for its rate.
- **Reading the result**: the skeleton restores the animation's local poses after each update, so the modified
  poses exist only during the update (`skeleton_updated`) and in the skins; any pass of `kchar_figure.gd` that
  reads a cloth bone (none today) and any `BoneAttachment3D` on one must hook that signal.

## Pitfalls met (for the next person)

- A figure added to the tree inside a `SceneTree` script's `_init` gets `_ready` (which turns its `_process` on)
  when the tree initialises, after `_init`, so a `set_process(false)` there does nothing and the engine steps the
  figure as well as the script: every frame-driven number was wrong (0.57 rad a frame for the Verlet, varying run
  to run) until the script turned it off on its first frame. `kchar_shot.gd` has the same double stepping.
- Setting `active` on a `SpringBoneSimulator3D` resets it, so set it only on a change.
- `set_root_bone_name` did not resolve the bone here (`get_root_bone` stayed -1); indices work.
- The published Cosmetic Lab's garments are not the build of this branch's `kit.json` (the chain anchors are
  25 to 39 cm from the GLB's own cloth joints); the first measurements ran on garbage rests. Check a GLB against the
  manifest's hash before trusting a `pieces/` folder that did not come from the same commit.

## Files

`kchar_figure.gd` (`spring_sim`, `spring_opts`, `_sim_build`, `_sim_step`, the tip bones), `kchar_test.gd` (the
giant's checks skipped without the giant's pieces, as the man's are), `tests/character/spring_spike.gd`,
`spring_shot.gd`, `spring_oldcheck.gd`, `spike-shots/`, `godot/data/spike/` (gitignored: the decoded pieces, that
commit's kit, skeleton, posture and peoples; rebuild it from the published lab's `pieces/mpfb_male/*.txt`, line
one gunzipped, with an empty `GSH1` beside each GLB).
