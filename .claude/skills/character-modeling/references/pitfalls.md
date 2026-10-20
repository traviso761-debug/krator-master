# Pitfalls, by area

Each line is a symptom the user saw (or a test caught), its cause, and the fix that held. Read the section for the
area you are about to change.

## Contents
1. Rig, skeleton and retarget
2. Morphs and sliders
3. Clothing fit and clipping
4. Materials, alpha and textures
5. Cloth chains
6. Animation clips and per-frame passes
7. Posture
8. Props and hands
9. Body mods, giants and extra arms
10. Godot twin
11. Publishing the pages
12. Tooling and the shell

## 1. Rig, skeleton and retarget

- **MPFB skeleton scrambled** (the woman's Head below her Neck) → build with `detailed_helpers=True`; the rig only
  lands right on the helper geometry.
- **Bone names arrive as `mixamorigHips`** through GLTFLoader → strip the prefix when indexing bones.
- **Godot binds are in breadth-first order**, not the GLB's → rebind by name, never by index.
- **Morph joint deltas in the wrong order** → use the skeleton.json joint order everywhere, not the GLB node order.
- **Clips retargeted onto MakeHuman's curved spine straighten it**: the figure leans back with its chest pushed out.
  Not fixed in the retarget; offset by a posture pass after every clip (section 7).
- **Idles bent the whole body** → the source rig was misidentified; detect the rig family from the raw bone names
  before retargeting.
- **Turning the spine to correct a pose tilts the head** → spine joints are corrected alone; the neck and head stay
  rigid from the neck, or take back part of the correction deliberately.
- **Rest rotations do not follow morphs**: joints move with a slider, their rest rotations stay the base body's. Big
  build changes can push a hand into a hip in a clip made for a slight body. Known and accepted.
- **Finger joints skipped by a name filter** (`endswith('2')` caught `Index2` as well as the second arm) → name the
  extra limb distinctly (`Left2...`) and match exact names.

## 2. Morphs and sliders

- **Short and tall bodies: hair off the head, shirts off the torso, holes at the joints**, neutral fine → the morph
  data the page loaded was stale or missing (see section 11). Check the slider ends before blaming the fit.
- **Short/tall figures floating or sinking over time** → the hips' morph delta accumulated every frame on clips with
  no hips position track. Reset the hips to the rest translation before the mixer runs, in both runtimes.
- **Target name matching**: `ear-scale` matched `ear-scale-vert` → exact match first, then prefix.
- **Ancestry base weights summed to 0.99** → normalise.
- **Height overshoot at the slider ends** → limit the reach (0.5 of MakeHuman's range here).
- **Delete groups not matching the morphed body** → evaluate mesh positions with shape keys applied.
- **Morphs are linear** on the page; MakeHuman's macros are piecewise, so the extremes differ slightly. Accepted.

## 3. Clothing fit and clipping

- **Skin through a garment that has no delete group** → cast rays out and in from the skin (`covered()`) to derive
  one; for tops with a partial group, union the ray result in (shoulders and chest came through T-shirts).
- **Skin through a garment at one body size only** → test every body; seat ease and hem width that suit the neutral
  body under-fit the heavy one.
- **Trousers through tunics** (patches at the hip) → the under-layer's ease must be smaller than the outer's, widening
  toward the cuff; squeeze trousers under long loose tops.
- **Skirts parting like trousers in a walk** → skirt weights blended across both thighs, wider hem flares, then
  cloth chains.
- **Long robes tearing at the back when idle** (the buttocks push through) → back columns hang from just below the
  crotch, not from the waist.
- **Knees through skirts when sitting** → keep the knees inside; layered tiers for long outer sheets.
- **Hair through hats** → hats that cover hair carry a COVERS_HAIR flag and hide the hair; tall hats clear the crown
  (height at least the highest hit on the scalp plus 1.5 cm).
- **Hood open over the crown** → narrow the face opening above the brow.
- **Toes through boots, a disc at the heel** → a shaft plus a capped foot tube, the heel found by ray.
- **Sleeves ballooning** (a straight shoulder-to-hand line leaves a bent arm) → loft along an elbow path; test against
  a torso-only collision set so the A-posed arms don't catch.
- **Chest shelf and armpit gaps on a wrap top** → torso-only collision, per-column hang, convex rows.
- **An over-garment tearing through the one under it** (himation through chiton) → hang it from the waist, raise the band.
- **Inverted faces as black seams** on horns and wings → orient normals per part by majority vote, not face by face.
- **Garment holes leave loose vertices** → delete loose vertices after cutting and record what was removed.
- **More than 64 items overflowed a 64-bit hide mask** → name skin regions by the list of items that cover them.
- **A random NPC wearing another culture's clothes** → tag every item with its culture and filter the wardrobe.
- **Fitted cloth crumpling at rest under the GPU push** (a loincloth's flaps winged out, a kilt's seat torn down the
  middle, a robe's back jagged) → before tuning, switch the push off and shoot: if rest is clean, the push is wrong,
  not the mesh. Two causes: a soft shell *outside* the capsule (everything within 4 cm moved out up to 3 cm) → a thin
  band either side of the surface (monotonic, so tiers keep order); and a thigh capsule on the femur, which sits toward
  the outside of the thigh, so a radius covering the flesh within swallows the buttock and crotch → no push in the
  thigh's top third (knees are what come through).
- **Legs thin under a long robe** → a "draw in toward the capsules" pass that loops over every capsule pulls each
  vertex toward all of them (a shin's into a ball at the knee, the inside of one leg toward the other) → draw to the
  nearest capsule only.
- **Breeches swinging as a sheet** → a name test for legged garments ("trousers") missed breeches and braccae; they
  were marked loose and their weights pooled below the crotch like a skirt's.
- **Boot cuffs through a long robe's hem** → squeeze the feet too under a loose long top, whatever the legs wear.
- **Change one variable per shot, and shoot the A-pose too** → toggling the push, the cloth sim (rigid) and the posture
  pass one at a time, A-pose against idle, told push, weights, chains and posture apart in a few shots; tuning blind
  cost whole pipeline runs.
- **A mantle torn at the shoulder blades** → the posture pass draws the shoulders back after every clip; the tunic
  follows the shoulder joints, the mantle's chains the spine. Weight tricks (contact, copied weights, chains on the
  collarbones) only moved the tear; it is still open.
- **Removing hidden triangles from a garment breaks Godot** → its glTF importer drops vertices no triangle uses, and the
  morph data no longer lines up. Keep every vertex referenced.
- **A cape's edge as a long spike at the idle** → a chain colliding with the arm (an elbow hangs at the waist) moves one
  column alone; chains do not collide with arms, the per-vertex push keeps cloth out of them.
- **A flap that poofs out in a stride** → the per-vertex push sends cloth between the thighs out sideways; a garment of
  flaps only is not pushed, its chains keep it off the legs.
- **Fitting order between items** → each garment is fitted alone, so an under-item's flap 3 cm off the body stood
  outside a shirt at 1.4 cm; check eases across items that are worn together.
- **Long thin streamers from a hat** → part of a head item hung below the "above the neck → Head joint" cut and took
  the shoulders' weights; give whole pieces (welded by position) that end above the neck joint to the Head.

## 4. Materials, alpha and textures

- **Patchy or red skin**: Blender's glTF exporter marks every material BLEND → set opaque or cut-out (MASK) per material.
- **Silver brows and hair**: a black image was filed as the normal map → drop normal maps that are not normal-like;
  cut-out alpha leaking to a transparent canvas → force output alpha to 1.
- **Beards drawing darker than the hair** → not the normals: the clear texels were black and darkened the mips. Fill
  clear texels with the texture's mean grey.
- **Soft beards invisible** → a lower alpha cutoff (0.12) for soft hair textures.
- **One eye untinted** → the iris mask took a black transparent corner disc for the pupil; alpha-test the mask.
- **Tint looked wrong** → make skin, hair and iris textures neutral grey and multiply the colour in at runtime.
- **Blender's Python has no PIL** → write images with `bpy.data.images` and `pixels.foreach_set`.
- **A corrupt PNG CRC in a downloaded pack** → fall back to ImageMagick.
- **Some library and community assets are broken** (404, corrupt, wrong texture names) → keep a SKIP list and a
  fix-up step; record CC-BY assets in CREDITS.

## 5. Cloth chains

- **Cloth that lies on the body must not hang on chains.** A cloak hung plumb from the shoulder blades stands 4-6 cm
  off the small of the back; on chains held by the chest it swung into the back whenever the spine bent (holes with
  blocky edges, which look like texture alpha but are geometry: check the material is opaque before chasing alpha).
  Bind cloth within ~4 cm of the skin to the body's own weights, fading to the chains by ~9 cm, except over the legs
  (a skirt on a thigh must leave it as the leg swings).
- **The seat is in no limb's capsule.** A thigh capsule runs down the femur and the trunk's up the spine; the buttocks
  sit between, and every robe's back tore there in an idle. Give the chains and the per-vertex push a seat capsule
  per side, its ends rest points carried by the Hips joint.
- **A capsule needs a radius per end.** One radius per limb (a median of the surface) let the calf and the top of the
  thigh through long garments; measure the 90th percentile near each end, inside the limb (past its ends lie the foot,
  the hand, the trunk), and interpolate along the capsule in the shader.
- **The push and the trouser squeeze share a margin.** Drawing trousers in less put them out through the robe's knee;
  pushing the robe further out makes spiky folds. Keep the squeeze tight (8 mm) and the loose top's pad ~2 cm.
- **Layer order spans garments.** Chain layers were per garment, so a breechcloth flap (layer 1) and a shirt's skirt
  (layer 1) crossed; rank by slot first (legs under torso under head).
- Spring-bone chains on hanging garments (not trousers): roots pinned, collision against capsules on the legs and body.
- **Collisions undone** → the final length-keeping pass must run before collision, not after.
- **Robes crumpled onto the lap by a capsule lever** → reverted; simple capsules.
- **A parent-side rule flipped a chain 137° in Godot's walk** → limit it to near-level limbs.
- **Measuring swing in a test**: an angle metric saturates near π; measure frame-to-frame motion instead.
- Robe chains in Godot still fold in a walk; recorded as a known issue rather than hidden.

## 6. Animation clips and per-frame passes

- **Every frame starts from the clip.** three.js's mixer writes a bone only when its value changes, so on a still
  frame (paused, scrubbed, a held pose) passes that turn bones after the clip (posture, two-hand solve, push) turn
  last frame's already-turned bone again: the figure creeps or jitters. Restore the clip pose each frame, then apply
  the passes once.
- **Z jitter on drive-cart, repair and die clips** → the hips' position track fought the mixer; apply it outside the
  mixer, after restoring the clip pose.
- **Libraries lack work and weapon clips** (hoe, anvil hammer, pickaxe, a straight thrust) → derive them: a source
  clip's legs and body (the standing idle, the combat stance) plus arms posed by forward kinematics and a two-bone
  solve per arm, the hand turned to hold its prop. Say in the docs which clips are made, not captured.
- **Loops drift**: take the drift over a cycle out (the loop plays in place) and keep it as a root speed for the game.
- **A looped one-handed swing used as a dig** put the left arm across the chest (the user saw the arm through the
  chest) → a made two-handed dig.
- **Thrust aiming up instead of forward** (the library's 'Thrust Slash' stabbed overhand) → a made thrust: hand
  drawn to the ribs and driven straight forward at chest height, the shoulder turned into it; the spear version
  underhand, right hand at the butt, left forward on the shaft (the library one clipped arms, spear and body).
- **Spear held behind the back** in the library's spear walk → keep its legs and body (fetched as a source only) and
  put the arms at the made thrust's guard.
- Check the whole clip in shots at several times, not one key frame: clipping usually lives mid-swing.

## 7. Posture

- After retargeting, all figures leaned back at the mid-thoracic spine with their chests out, and the shoulders hunched.
- A spine pull-back made it worse (lordosis). What helped: bend the spine **forward** (about 22° in total on the
  woman, 30° on the man: Spine −6, Spine1 −8 to −12, Spine2 −8 to −12), let the neck take back about half so the head
  stays level, drop the shoulders about 9° and draw them back 10°, and keep the upper arms' world direction so aims
  still land.
- Apply the angles in the figure's frame (world X axis through the figure's orientation), not each bone's local axis.
- Five rounds of guessing angles from screenshots ended when the user got a Posture panel with Copy/Apply JSON. Build
  that kind of control first next time; keep the values in `data/posture.json`.

- **A clip that stands on the ball of a foot pitches the toes into the ground**, and a sandal's flat sole with them
  (it looked like a garment bug). After the clip, turn each toe joint up until a point ~6 cm ahead stays on the ground.

## 8. Props and hands

- Measure each body's hand frame at rest (palm normal, finger direction) and define grips in it.
- Two-handed holds are solved (a two-bone solve for the support hand), scaled by the body's size: constants in metres
  missed on the giant until multiplied by its scale.
- **Wrong hand** (lantern) → the hold names a hand per clip; check `hold` in the clip data before touching the prop.
- **Shield facing backward** → flip the prop's model, and check a low-hand variant separately.

- **Headgear gets the shoulders' weights.** MakeHuman weights a garment from the nearest skin, so a broad brim, a wing
  or an ear flap reaching down beside the neck bends with the arms (a third of one headdress's weight was on them).
  Weight everything of a head item above the neck to the Head joint; leave a hood's cowl below it alone.

## 9. Body mods, giants and extra arms

- Extra arms as joints every skeleton carries, invisible and unweighted until a mod or a four-armed torso uses them.
  Better than swapping skeletons: clips, props and garments keep working.
- **Lower arms coming out at the waist** → root them on the lower ribs on any torso.
- **Rib gills sticking out as blades** → rays hit the A-posed arms; cast only against torso triangles.
- **Cyber arm gaps at the joints** → a dome at the joint sized to the farthest edge (1.03×), not a collar ring.
- **Lower sleeves on cybernetic arms** look wrong → leave them off; sleeve pieces keep only their own vertices.
- **Four-armed tops built before the lower ranges existed had no lower vertices** → regenerate after changing the rig.
- **Giant roots and ledges** → shrink-wrap to the body, hang at rest, blend by distance from the open edge.

## 10. Godot twin

- `Vector3` is float32: compare with 1e-6 tolerance.
- Animation track paths need the skeleton path plus the bone name.
- RELATIVE blend shapes are offsets: write deltas, not positions (the figure came out 10× too big).
- Building blend shapes in GDScript loops is too slow → precompute in Python (a binary per GLB).
- The headless dummy renderer has no blend shapes to read back → keep the base arrays yourself; use Xvfb when a test
  needs real rendering.
- Packed arrays are shared by reference: `duplicate(true)` before mutating (tangent arrays grew 200×).
- Type-inference parse errors make a script hang without quitting → explicit types.
- `get_shader_rid` is not exposed to scripts → write the garment shader as a resource.
- Tests that read the pose must step frames after changing a prop (arms settle over a few steps).
- **Port every runtime change to Godot the same day** and run its test; drift accumulates fast.

## 11. Publishing the pages

- A page over 16 MB will not publish → load pieces beside the page as files.
- `.glb` is not a served type → base64 text (gzipped) with a `.txt` extension.
- A page's file limit (512) → pack thumbnails into one atlas per body.
- **Never delete a published file an older loader still reads.** Deleting the separate `.morph.txt` files broke the
  short and tall bodies for the user (no morph data). Republish in the new format first, then remove the old files.
- Publish in batches under about 55 MB; diff the build manifest against the last published commit to send only
  changed pieces.
- A page-only change republishes just the page.

## 12. Tooling and the shell

- `pkill -f <pattern>` matches its own shell and kills it (exit 144) → kill by pid.
- Background render jobs get killed at the time limit → run in the foreground with `timeout`.
- `/usr/bin/time` may be missing → don't wrap Blender in it.
- A `sed` edit on a long line broke the code → use a Python replace with an `assert old in s`.
- Index and audit scripts can rewrite unrelated files → revert what you didn't mean to change before committing.
- A JSON file reformatted by a load-and-dump → insert the entry textually instead.
- A screenshot helper clicking a button that doesn't exist fails silently → check selectors first.
- Tests that race a page re-dressing → wait for the loading overlay to hide.
- **A pipeline reads each script when its step starts**, not when the run starts: an edit made mid-run may or may not
  be in it. Check the output for the change (the colliders in skeleton.json, a weight table) before judging shots.
- **Survey, don't spot-check.** One script that dresses every culture's outfits on the same body, holds the same clip
  moment after letting the cloth settle (~2 s), and shoots back and front into one grid found more than the reports
  did, and shows at a glance whether a shared fix helped everywhere.
- **The port lint warns on numeric defaults written with `||`** in `[G data]` fragments (`it.arms || 2`: a 0 passed
  becomes the default) → write `x == null ? N : x`; regenerate the golden and confirm it is unchanged.
